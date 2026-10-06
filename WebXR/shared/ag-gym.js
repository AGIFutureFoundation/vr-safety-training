// AGENTGYM — the stations people learn on, as tasks for software agents.
//
// A gym-style task API over the station engine (shared/game.js Session),
// following ROBOTICS' rb-env.js contract:
//
//   const env = agEnv({ room, api, SessionClass }, { seed: 3 });   // tools/lib/headless.mjs loadSmartCity()
//   let obs = env.reset();
//   const policy = agExpertPolicy(env);              // or agRandomPolicy / agRetrievalPolicy / agAdapterPolicy
//   for (;;) { const r = env.step(policy(obs)); obs = r.observation; if (r.done) break; }
//   env.summary();   // { passed, stationScore, stars, errors, hazardHits, steps, hints, inspects, ... }
//
// Observation: the step's own text (title, cue, why), the visible objects (the
// room's interactable ids with display names), the hazards the agent has found
// (by inspecting or by touching one), the live control state (gauge, hold,
// track, turn) and any interruption's alert text. It never carries the step's
// target id: an agent has to work that out the way a learner does.
//
// Discrete actions (AG_ACTIONS): select(id), inspect(id), confirm(id),
// hint(), press(id), release(), wait(). Every engine-changing action goes to
// the same Session methods the human's click, drag and hold reach, so the
// station's own scoring is the reward (score delta / 100), plus one documented
// gym-only cost: AG_HINT_COST per hint. env.summary().stationScore is the
// Session's score, untouched by the hint cost — the parity check in
// tools/check_agentgym.mjs replays a run through a bare Session and compares.
//
// Baselines (named for what they are):
//   agRandomPolicy    — uniform random over the discrete actions and visible ids.
//   agExpertPolicy    — a scripted expert that reads the station's step list
//                       (privileged: it sees each step's target ids).
//   agRetrievalPolicy — a retrieval heuristic: ranks visible objects by word
//                       overlap with the step's sourced text, inspects before it
//                       touches, and asks for a hint when nothing matches.
//                       No language model; no network.
//   agAdapterPolicy   — a hook for an external agent, OFF by default
//                       (AG_ADAPTER.enabled === false); it must be handed a
//                       synchronous decide(obs) function by the deployment.
//
// Deterministic by seed: the engine's cosmetic Math.random draws are lent a
// seeded stream for each call (as rb-env.js does). Three.js-free, DOM-free,
// no fetch/XHR/WebSocket/beacon. Names prefixed `ag`/`AG_` (one bundler scope).

import { rng, observe, applyAction } from "./robot.js";
import { drivePolicy } from "./game.js";

export const AG_SCHEMA = "smartcitix.holodeck.agent-task@1";
export const AG_ACTIONS = Object.freeze(["select", "inspect", "confirm", "hint", "press", "release", "wait", "drive"]);
export const AG_HINT_COST = 0.02;
export const AG_DT = 0.05;
export const AG_MAX_STEPS = 900;

/** The external-agent adapter. Off by default; no network path exists in this module. */
export const AG_ADAPTER = Object.freeze({
  enabled: false,
  note: "A deployment may pass { decide(observation) -> action } to agAdapterPolicy(). Nothing ships enabled; no model is called by this repo.",
});

const agR3 = (n) => Math.round(n * 1000) / 1000;
const agHuman = (id) => String(id).replace(/[-_]+/g, " ");

/** Display names for every interactable: the station's itemNames first, then the id in words. */
function agNames(room, hitIds) {
  const names = {};
  for (const s of room.steps ?? []) for (const [k, v] of Object.entries(s.itemNames ?? {})) names[k] = v;
  const out = {};
  for (const id of hitIds) out[id] = names[id] ?? agHuman(id);
  return out;
}

/**
 * Build a task env over a built station. `bind` is { room, api, SessionClass, rebuild? }.
 * Options: seed, dt (s of station time per decision), maxSteps, hintCost.
 */
export function agEnv(bind, { seed = 1, dt = AG_DT, maxSteps = AG_MAX_STEPS, hintCost = AG_HINT_COST } = {}) {
  const { room, SessionClass, rebuild = null } = bind ?? {};
  let api = bind?.api ?? null;
  if (!room || !api || !SessionClass) throw new Error("agEnv: needs { room, api, SessionClass } (tools/lib/headless.mjs loadSmartCity())");
  let session = null, fb = null, engineRandom = Math.random, cur = seed >>> 0;
  let steps = 0, reward = 0, hints = 0, inspects = 0, revealed = new Set(), lastInspect = null, lastHint = null, trace = [];
  let hitIds = Object.keys(api.hits ?? {});
  let names = agNames(room, hitIds);
  const hazardIds = () => Object.keys(room.hazards ?? {}).filter((id) => hitIds.includes(id));
  const seeded = (fn) => { const m = Math.random; Math.random = engineRandom; try { return fn(); } finally { Math.random = m; } };

  const target = () => {
    const it = session.activeInterrupt;
    if (it) return it.target;
    const st = session.step;
    if (!st) return null;
    if (st.kind === "sequence" || st.kind === "find") return st.targets.find((t) => !session.sequence.includes(t)) ?? null;
    return st.target ?? null;
  };

  const observation = () => {
    const o = observe(session);
    const st = session.step, it = session.activeInterrupt;
    const seq = st && (st.kind === "sequence" || st.kind === "find");
    return {
      schema: AG_SCHEMA, station: room.id, stationName: room.name ?? room.id,
      stepIndex: session.index, stepCount: room.steps.length, stepId: st?.id ?? null,
      kind: st?.kind ?? null, title: st?.title ?? null, cue: st?.cue ?? null, why: st?.why ?? null,
      anyOrder: !!(st?.anyOrder || st?.kind === "find"),
      visible: hitIds.map((id) => ({ id, name: names[id] })),
      hazardsKnown: [...revealed].sort(),
      progress: seq ? { done: session.sequence.slice(), total: st.targets.length } : null,
      control: { gauge: o.gauge, hold: o.hold, track: o.track, turn: o.turn, drive: o.drive, holding: session.holding },
      interrupt: it ? { id: it.id, kind: it.kind ?? null, alert: it.alert ?? "", cue: it.cue ?? "", left: o.interrupt?.left ?? null } : null,
      feedback: fb ? { kind: fb.kind ?? null, hazard: !!fb.hazard } : null,
      lastInspect, lastHint,
      score: session.score, errors: session.errors, hazardHits: session.hazardHits,
      hints, elapsed: agR3(session.elapsed), finished: session.finished,
    };
  };

  /** One engine action, the way a human's input reaches it. Returns { engineAction } for the replay trace. */
  const apply = (a) => {
    const st = session.step, tgt = target(), id = a.id ?? null;
    switch (a.type) {
      case "select": return { type: "select", id };
      case "press": return id && st && id !== st.target && !session.activeInterrupt ? { type: "select", id } : { type: "press", id: st?.target ?? id };
      case "release": return { type: "release" };
      case "drive": return { type: "drive", throttle: +a.throttle || 0, steer: +a.steer || 0, check: a.check ?? null };
      case "confirm": {
        if (!st) return { type: "wait" };
        if (session.activeInterrupt || id !== tgt) return { type: "select", id };   // touching anything else is a touch
        if (st.kind === "gauge") return { type: "commit", id, at: session.gauge?.t ?? 0 };
        if (st.kind === "turn") return { type: "rotate", id, delta: 0.25 };
        if (st.kind === "drag") return { type: "drop", id, distance: 0 };
        if (st.kind === "hold" || st.kind === "track") return { type: "press", id };
        return { type: "select", id };
      }
      default: return { type: "wait" };
    }
  };

  const env = {
    schema: AG_SCHEMA, room, actions: AG_ACTIONS,
    get seed() { return cur; },
    get hitIds() { return hitIds.slice(); },
    get hazardIds() { return hazardIds(); },
    get trace() { return trace.slice(); },
    reset(s) {
      if (s !== undefined) cur = s >>> 0;
      if (rebuild) { api = rebuild(); hitIds = Object.keys(api.hits ?? {}); names = agNames(room, hitIds); }
      steps = 0; reward = 0; hints = 0; inspects = 0; revealed = new Set(); lastInspect = null; lastHint = null; fb = null; trace = [];
      engineRandom = rng(cur * 48271 + 17);
      session = seeded(() => new SessionClass(room, {
        onStep: (x, y) => api.onStep?.(x, y), onStepComplete: (x, y) => api.onStepComplete?.(x, y),
        onFeedback: (f, y) => { fb = f; api.onFeedback?.(f, y); }, onHazard: (h, y) => api.onHazard?.(h, y),
      }));
      seeded(() => session.start());
      return observation();
    },
    observe: observation,
    step(action = { type: "wait" }) {
      const a = action && AG_ACTIONS.includes(action.type) ? action : { type: "wait", invalid: action?.type ?? null };
      if (session.finished || steps >= maxSteps) return { observation: observation(), reward: 0, done: true, info: { ...env.summary(), note: "episode already done" } };
      const before = session.score;
      fb = null; lastInspect = a.type === "inspect" ? lastInspect : null;
      let cost = 0;
      if (a.type === "inspect") {
        inspects += 1;
        const hz = room.hazards?.[a.id];
        lastInspect = { id: a.id ?? null, name: names[a.id] ?? null, hazard: !!hz, known: hitIds.includes(a.id) };
        if (hz) revealed.add(a.id);
      } else if (a.type === "hint") {
        hints += 1; cost = hintCost;
        const t = target();
        lastHint = { stepIndex: session.index, interrupt: session.activeInterrupt?.id ?? null, cue: session.activeInterrupt?.cue ?? session.step?.cue ?? null, targetName: t ? names[t] ?? agHuman(t) : null };
      }
      const engineAction = a.type === "inspect" || a.type === "hint" || a.type === "wait" ? { type: "wait" } : apply(a);
      seeded(() => { applyAction(session, engineAction); session.tick(dt); });
      trace.push(engineAction);
      if (fb?.hazard && a.id && room.hazards?.[a.id]) revealed.add(a.id);
      steps += 1;
      const delta = session.score - before;
      const r = agR3(delta / 100 - cost);
      reward = agR3(reward + r);
      const done = session.finished || steps >= maxSteps;
      const info = { stationDelta: delta, feedback: fb?.kind ?? null, hazard: !!fb?.hazard, engineAction, hintCost: cost, steps };
      if (done) Object.assign(info, env.summary());
      return { observation: observation(), reward: r, done, info };
    },
    summary() {
      return {
        station: room.id, seed: cur, finished: session.finished, truncated: !session.finished && steps >= maxSteps,
        passed: session.finished && session.stars >= 2 && session.hazardHits === 0,
        stationScore: session.score, stars: session.stars, errors: session.errors, hazardHits: session.hazardHits,
        steps, hints, inspects, reward, elapsed: agR3(session.elapsed),
      };
    },
    /** Privileged view for the scripted expert only (the station's step list and the live target). */
    privileged() { return { step: session.step, target: target(), session }; },
    names() { return { ...names }; },
  };
  env.reset();
  return env;
}

// ------------------------------------------------------------------ baselines

/** Uniform random over the discrete actions and the visible ids. Seeded. */
export function agRandomPolicy(env, { seed = 1 } = {}) {
  const R = rng(seed * 2246822519 + 3);
  return (obs) => {
    const ids = obs.visible;
    const id = ids.length ? ids[Math.floor(R() * ids.length)].id : null;
    const k = Math.floor(R() * 6);
    if (obs.kind === "drive") return { type: "drive", throttle: R(), steer: R() * 2 - 1 };
    return [{ type: "select", id }, { type: "confirm", id }, { type: "press", id }, { type: "release" }, { type: "wait" }, { type: "inspect", id }][k];
  };
}

/** Control for the timed steps once the target is known (shared by expert and retrieval). */
function agControl(obs, id, R) {
  const c = obs.control;
  if (obs.kind === "gauge") {
    const g = c.gauge; if (!g) return { type: "wait" };
    const [lo, hi] = g.green, mid = (lo + hi) / 2, half = (hi - lo) / 2;
    return Math.abs(g.t - mid) <= Math.max(half * 0.5, 0.02) ? { type: "confirm", id } : { type: "wait" };
  }
  if (obs.kind === "hold") return c.holding ? { type: "wait" } : { type: "press", id };
  if (obs.kind === "track") {
    const t = c.track; if (!t) return { type: "wait" };
    const mid = (t.green[0] + t.green[1]) / 2;
    if (t.v < mid && !c.holding) return { type: "press", id };
    if (t.v >= mid && c.holding) return { type: "release" };
    return { type: "wait" };
  }
  return { type: "confirm", id };   // select, turn, drag: confirm the target
}

/** Scripted expert from the station's step list (privileged). */
export function agExpertPolicy(env, { seed = 1 } = {}) {
  const R = rng(seed * 3266489917 + 5);
  return (obs) => {
    const p = env.privileged();
    if (!p.step || obs.finished) return { type: "wait" };
    if (obs.interrupt) return { type: "select", id: p.target };
    if (obs.kind === "drive") { const a = drivePolicy(p.session, { skill: 1, random: R }); return { type: "drive", throttle: a.throttle, steer: a.steer, check: a.check }; }
    if (obs.kind === "select" || obs.kind === "sequence" || obs.kind === "find") return { type: "select", id: p.target };
    return agControl(obs, p.target, R);
  };
}

const AG_STOP = new Set("the and for with that this from your you are not into then than them they its has have was were will can before after once each every only just what when where which while about over under onto off out all any one two three both".split(" "));
/** Lower-case word stems (a crude suffix strip), no stop words. */
export function agTokens(text) {
  return String(text ?? "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/)
    .filter((w) => w.length >= 3 && !AG_STOP.has(w))
    .map((w) => w.replace(/(ings|ing|ers|er|ed|es|s)$/, "") || w);
}

/**
 * Retrieval heuristic over the step's sourced text. It sees only the
 * observation. Per decision: hinted name → that object; otherwise rank the
 * visible objects not yet known to be hazards and not yet refused on this
 * step by word overlap with title + cue (weight 2) and why (weight 1); inspect
 * the best one once before touching it; ask for a hint when nothing overlaps
 * or every candidate has been refused.
 */
export function agRetrievalPolicy(env, { seed = 1, margin = 0 } = {}) {
  const R = rng(seed * 668265263 + 7);
  let key = null, refused = new Set(), inspected = new Set(), lastTouched = null, hinted = null;
  const byName = () => { const m = new Map(); for (const v of env.observe().visible) m.set(v.name, v.id); return m; };
  return (obs) => {
    if (obs.finished || obs.kind === null) return { type: "wait" };
    const k = `${obs.stepIndex}|${obs.interrupt?.id ?? ""}|${obs.progress?.done.length ?? 0}`;
    if (k !== key) { key = k; refused = new Set(); lastTouched = null; }
    // A refusal counts against what was touched. (Gauge commits are only made with the needle near the band's
    // centre and the engine reads the needle before it ticks, so a refused commit means the wrong object.)
    if (obs.feedback && (obs.feedback.kind === "warn" || obs.feedback.kind === "danger") && lastTouched) refused.add(lastTouched);
    if (obs.kind === "drive" && !obs.interrupt) { const a = drivePolicy(env.privileged().session, { skill: 1, random: R }); return { type: "drive", throttle: a.throttle, steer: a.steer, check: a.check }; }
    // A hint for this exact situation wins.
    const h = obs.lastHint;
    if (h && h.stepIndex === obs.stepIndex && (h.interrupt ?? null) === (obs.interrupt?.id ?? null) && hinted?.src !== h) hinted = { ...h, k, src: h };
    if (hinted && hinted.k === k && hinted.targetName) {
      const id = byName().get(hinted.targetName);
      if (id && !refused.has(id)) { lastTouched = id; return obs.interrupt || ["select", "sequence", "find"].includes(obs.kind) ? { type: "select", id } : agControl(obs, id, R); }
    }
    const q2 = obs.interrupt ? agTokens(`${obs.interrupt.alert} ${obs.interrupt.cue}`) : agTokens(`${obs.title} ${obs.cue}`);
    const q1 = obs.interrupt ? [] : agTokens(obs.why);
    const done = new Set(obs.progress?.done ?? []);
    const known = new Set(obs.hazardsKnown);
    const cands = obs.visible.filter((v) => !known.has(v.id) && !refused.has(v.id) && !done.has(v.id)).map((v) => {
      const toks = new Set([...agTokens(v.id), ...agTokens(v.name)]);
      let s = 0, first = Infinity;
      q2.forEach((w, i) => { if (toks.has(w)) { s += 2; first = Math.min(first, i); } });
      q1.forEach((w, i) => { if (toks.has(w)) { s += 1; first = Math.min(first, q2.length + i); } });
      return { id: v.id, s: s / Math.sqrt(toks.size || 1), first };
    }).filter((c) => c.s > 0);
    // A strict sequence follows the order the text mentions things in; everything else takes the best match.
    const ordered = obs.kind === "sequence" && !obs.anyOrder && !obs.interrupt;
    cands.sort((a, b) => (ordered ? a.first - b.first || b.s - a.s : b.s - a.s || a.first - b.first) || (a.id < b.id ? -1 : 1));
    // Unsure (no overlap, or the runner-up within `margin` of the best): ask rather than guess. A hint costs the
    // gym AG_HINT_COST; a wrong touch costs the station's own penalty and an error against the stars.
    if (!cands.length || (margin > 0 && cands[1] && cands[0].s - cands[1].s < margin && !(hinted && hinted.k === k))) return { type: "hint" };
    const best = cands[0].id;
    if (!inspected.has(best)) { inspected.add(best); return { type: "inspect", id: best }; }
    lastTouched = best;
    if (obs.interrupt || ["select", "sequence", "find"].includes(obs.kind)) return { type: "select", id: best };
    return agControl(obs, best, R);
  };
}

/** External agent hook: OFF unless the deployment passes enabled + a decide() function. */
export function agAdapterPolicy(env, { enabled = AG_ADAPTER.enabled, decide = null } = {}) {
  if (!enabled || typeof decide !== "function") return null;
  return (obs) => { const a = decide(obs); return a && AG_ACTIONS.includes(a.type) ? a : { type: "wait" }; };
}

export const AG_BASELINES = Object.freeze({ random: agRandomPolicy, expert: agExpertPolicy, retrieval: agRetrievalPolicy });

/** Run one episode: { summary, steps: [{ observation, action, reward, done, info }] }. */
export function agRun(env, policyName = "expert", { seed = env.seed, policy = null, keepSteps = true } = {}) {
  let obs = env.reset(seed);
  const pol = policy ?? AG_BASELINES[policyName](env, { seed });
  const steps = [];
  for (;;) {
    const action = pol(obs);
    const r = env.step(action);
    if (keepSteps) steps.push({ t: r.observation.elapsed, observation: obs, action, reward: r.reward, done: r.done, info: r.info });
    obs = r.observation;
    if (r.done) break;
  }
  return { summary: env.summary(), steps, trace: env.trace };
}

/**
 * Agent → human: a demonstrated run as a walkthrough the learner can step
 * through. One frame per decision that changed something (a touch, a commit,
 * a hint, an inspect), carrying the step's own title and why.
 */
export function agWalkthrough(run, room, names = {}) {
  const frames = [];
  for (const s of run.steps) {
    const a = s.action;
    if (a.type === "wait" || a.type === "release" || (a.type === "press" && s.observation.control?.holding)) continue;
    const o = s.observation;
    const obj = a.id ? names[a.id] ?? agHuman(a.id) : null;
    const verb = { select: "Touch", confirm: o.kind === "gauge" ? "Commit the reading on" : o.kind === "turn" ? "Turn" : o.kind === "drag" ? "Place" : "Confirm", press: "Press and hold", inspect: "Look closely at", hint: "Ask for a hint", drive: "Drive" }[a.type] ?? a.type;
    frames.push({
      n: frames.length + 1, stepIndex: o.stepIndex, stepTitle: o.interrupt ? `Interruption: ${o.interrupt.kind ?? o.interrupt.id}` : o.title,
      say: obj ? `${verb} ${obj}` : verb, outcome: s.info.hazard ? "unsafe" : s.info.feedback === "warn" ? "not this one" : s.info.stationDelta > 0 ? `+${s.info.stationDelta}` : a.type === "inspect" ? (o.lastInspect?.hazard ? "hazard spotted" : "checked") : "",
      why: o.interrupt ? o.interrupt.cue : o.why,
    });
  }
  return { station: room.id, stationName: room.name ?? room.id, frames, summary: run.summary };
}
