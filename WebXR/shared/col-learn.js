// COLEARN (docs/consoles/COLEARN.md): humans, robots and agents learning from
// each other in the SmartCiti.X Holodeck, on top of ROBOTICS' gym
// (shared/rb-env.js) and DATAWORKS' consented episodes (shared/dx-data.js).
//
// What each learner here IS, plainly:
//   * The robot policy is BEHAVIOUR CLONING with a k-nearest-neighbour
//     classifier over a few hand-written features per scenario (colFeatures).
//     It copies the action type the most similar demonstrated moments took and
//     the demonstrations' mean parameter for it. It does not plan, it does not
//     generalise beyond its demonstrations, and it is not reinforcement learning.
//   * The tutor is a UCB1 MULTI-ARMED BANDIT over four hint styles plus a
//     per-step error-rate table that picks which step to re-teach first. Its
//     "learning" is counting, per learner, on this device.
//   * The explanations are a HEURISTIC: the features of the current moment that
//     most separate the chosen action's demonstrations from the others',
//     turned into plain sentences from a fixed table. No language model is
//     called; nothing here touches the network.
//
// Data rules (DATAWORKS, docs/consoles/DATAWORKS.md): demonstrations come only
// from episodes that pass dxValidateEpisode — a human episode carries a consent
// receipt or it is refused — and real learner episodes are read from the local
// store only while dxCollecting() is true (adult, signed in, not K-12, not the
// demo, opted in). Synthetic demonstrations (the scripted expert with lapses and
// action noise, a stand-in for people in tests) say `source: "synthetic"`.
// The tutor's counts are per-profile local state (col-tutor-v1), never part of a
// dataset, and colTutorForget() clears them.
//
// SEAMS
//   colSyntheticDemos(scenarioId, { n, seed, skill, noise }) -> DX episodes (source "synthetic")
//   colDemosFromEpisodes(episodes, scenarioId)  -> { demos, refused: [{ id, why }] }
//   colLocalDemos(scenarioId, { store, signals }) -> Promise<episodes> ([] unless collecting)
//   colTrain(scenarioId, demos, { k, seed, onlySuccessful, maxPoints }) -> model (plain JSON)
//   colPolicy(model) -> (observation) => action        colExplain(model, observation) -> { action, text, ... }
//   colRandomPolicy(scenarioId, seed) -> (observation) => action
//   colEvalPolicy(scenarioId, policyFor(seed), { seeds }) -> { success, clean, meanSteps, n }
//   colGhost(model, { seed }) -> [{ observation, action, explain, reward, done }]  (the "robot demonstrates" replay)
//   colTutor(state?) -> { pickStyle, hint, record, nextReview, state }  COL_HINT_STYLES
//   colTutorSim({ learners, seed, population }) -> { static, adaptive, gain: { steps, mistakes } with 95% CI }
//   colMountCoLearn(el, { reducedMotion, capture, storage }) -> { watch, tryIt, model }  (parishes app, drills menu)
// Every top-level name is prefixed col/COL_ (the bundler shares one scope).

import { rng } from "./robot.js";
import { rbEnv, rbPolicy, rbRollout } from "./rb-env.js";
import { dxMakeEpisode, dxValidateEpisode, dxCollecting, dxStore } from "./dx-data.js";
import { gtStorage } from "./profiles.js";

export const COL_VERSION = "col/1";
/** The robot-game scenarios COLEARN learns (the station wrappers need the full suite; not here). */
export const COL_SCENARIOS = ["rb-cell-entry", "rb-cobot-zone-setup", "rb-teleop-pick-place", "rb-amr-fleet-routing"];
const COL_FIXED_TIME = "2026-01-01T00:00:00.000Z";
const colR3 = (n) => Math.round(n * 1000) / 1000;
const colClip = (v, a, b) => Math.max(a, Math.min(b, v));

function colFnv(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); }
/** A short content hash of any JSON value (determinism checks). */
export function colHash(v) { const s = JSON.stringify(v); return colFnv(s) + colFnv(s.split("").reverse().join("")); }

// ================================================================ features

const COL_SHELF = (x, y) => [1, 2, 6, 7].includes(x) && [1, 2, 4, 5].includes(y);
const COL_DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };

/**
 * Hand-written features per scenario: { names, text, of(obs) -> number[] },
 * plus how an action becomes a label and back. `text[i]` is [when high, when
 * low] in plain words, for colExplain. AMR is learnt per robot (one row per
 * robot per tick); every other scenario is one row per step.
 */
export const COL_FEATURES = {
  "rb-cell-entry": {
    names: ["atGate", "nearPost", "estopTested", "estopped", "locked", "verified", "inside", "jam", "restarted"],
    text: [["you are at the cell gate", "you are still walking up to the gate"], ["the e-stop post is in reach", "the e-stop post is out of reach"],
      ["the e-stop has been tested", "the e-stop has not been tested yet"], ["the robot is e-stopped", "the robot is not stopped"],
      ["your lock is on the gate", "no lock is on"], ["zero energy is verified", "zero energy is not verified yet"],
      ["you are inside the cell", "you are outside the cell"], ["the jam is still there", "the jam is cleared"], ["the cell has restarted", "the cell has not restarted"]],
    of: (o) => [o.distance <= o.gate + 0.01, o.distance <= o.estopPost + 0.01, o.estopTested, o.estopped, o.locked, o.verified, o.inside, o.jam, o.restarted].map((b) => (b ? 1 : 0)),
  },
  "rb-cobot-zone-setup": {
    names: ["zoneWalked", "stopRatio", "warnGap", "scannerTested", "estopTested"],
    weights: [1, 2, 1, 1, 1],
    text: [["the zone walk has measured the stopping time", "the stopping time is not measured yet"], ["the stop zone covers the stopping distance", "the stop zone is short of the stopping distance"],
      ["the warning zone sits well outside the stop zone", "the warning zone is too close to the stop zone"], ["the area scanner is tested", "the area scanner is not tested"], ["the e-stop is tested", "the e-stop is not tested"]],
    of: (o) => [o.tested["zone-walk"] ? 1 : 0, o.requiredStop ? colClip(o.stop / o.requiredStop, 0, 2) - 1 : -1, colClip(o.warn - o.stop, -1, 2) / 2, o.tested.scanner ? 1 : 0, o.tested.estop ? 1 : 0],
  },
  "rb-teleop-pick-place": {
    names: ["toGoalX", "toGoalY", "toGoalZ", "atGoal", "carrying", "x", "z", "afterStop"],
    weights: [6, 6, 6, 2, 2, 4, 4, 2],
    text: [["the goal is to the right", "the goal is to the left"], ["the goal is above", "the goal is below"], ["the goal is ahead", "the goal is behind"],
      ["the gripper is at the goal", "the gripper is away from the goal"], ["a part is in the gripper", "the gripper is empty"],
      ["the gripper is on the fixture side", "the gripper is on the bin side"], ["the gripper is near the teammate's side", "the gripper is on the far side, clear of the teammate"],
      ["a protective stop just held the arm", "no protective stop is holding the arm"]],
    of: (o) => {
      const g = o.carrying ? o.fixture : o.bin, e = o.effector;
      const d = [g[0] - e[0], g[1] - e[1], g[2] - e[2]];
      return [d[0], d[1], d[2], Math.hypot(...d) <= 0.04 ? 1 : 0, o.carrying ? 1 : 0, e[0], e[2], o.lastFeedback === "protective-stop" || o.lastFeedback === "backing-off" ? 1 : 0];
    },
  },
  "rb-amr-fleet-routing": {
    names: ["goalE", "goalS", "freeN", "freeS", "freeE", "freeW", "walkwayAheadBusy", "onWalkway"],
    weights: [2, 2, 1, 1, 1, 1, 2, 1],
    text: [["the drop-off is to the east", "the drop-off is not to the east"], ["the drop-off is to the south", "the drop-off is to the north or level"],
      ["north is clear", "north is blocked"], ["south is clear", "south is blocked"], ["east is clear", "east is blocked"], ["west is clear", "west is blocked"],
      ["a person is crossing the walkway just ahead", "the walkway ahead is clear"], ["this robot is on the walkway", "this robot is off the walkway"]],
    perRobot: (o) => {
      const occ = new Set(o.robots.filter((r) => !r.delivered).map((r) => r.at.join(",")));
      return o.robots.map((r) => {
        const [x, y] = r.at;
        const free = (d) => { const nx = x + COL_DIRS[d][0], ny = y + COL_DIRS[d][1]; return nx >= 0 && ny >= 0 && nx < o.width && ny < o.height && !COL_SHELF(nx, ny) && !occ.has(`${nx},${ny}`) ? 1 : 0; };
        const busyAhead = o.personOnWalkway && x !== o.walkwayColumn && (x + 1 === o.walkwayColumn || x - 1 === o.walkwayColumn) ? 1 : 0;
        return { delivered: r.delivered, f: [Math.sign(r.goal[0] - x), Math.sign(r.goal[1] - y), free("N"), free("S"), free("E"), free("W"), busyAhead, x === o.walkwayColumn ? 1 : 0] };
      });
    },
  },
};

/** The feature rows and labels of one demonstration step. */
function colRows(sc, obs, action) {
  const F = COL_FEATURES[sc];
  if (sc === "rb-amr-fleet-routing") {
    if (action.type !== "route") return [];
    return F.perRobot(obs).flatMap((r, i) => (r.delivered ? [] : [{ x: r.f, label: action.moves?.[i] ?? "wait", p: null }]));
  }
  const x = F.of(obs);
  let label = action.type, p = null;
  if (sc === "rb-cell-entry" && action.type === "walk") p = { d: +action.d || 0 };
  if (sc === "rb-cobot-zone-setup") {
    if (action.type === "test") label = `test-${action.what}`;
    if (action.type === "set") { label = `set-${action.param}`; p = action.param === "stop" ? { ratio: obs.requiredStop ? action.value / obs.requiredStop : 1 } : action.param === "warn" ? { gap: action.value - obs.stop } : { value: action.value }; }
  }
  if (sc === "rb-teleop-pick-place") {
    if (action.type === "move") p = { dx: +action.dx || 0, dy: +action.dy || 0, dz: +action.dz || 0 };
    if (action.type === "grip") p = { ratio: obs.part ? action.force / obs.part.ceilingN : 0.6 };
  }
  return [{ x, label, p }];
}

/** A label plus the neighbours' parameters back to an env action. */
function colAction(sc, label, ps, obs) {
  const mean = (k) => (ps.length ? ps.reduce((n, p) => n + (p?.[k] ?? 0), 0) / ps.length : 0);
  if (sc === "rb-cell-entry") return label === "walk" ? { type: "walk", d: colR3(mean("d") || 1) } : { type: label };
  if (sc === "rb-cobot-zone-setup") {
    if (label.startsWith("test-")) return { type: "test", what: label.slice(5) };
    if (label === "set-stop") return { type: "set", param: "stop", value: colR3((obs.requiredStop ?? 1) * (mean("ratio") || 1)) };
    if (label === "set-warn") return { type: "set", param: "warn", value: colR3(obs.stop + (mean("gap") || 1)) };
    if (label === "set-speed") return { type: "set", param: "speed", value: colR3(mean("value") || 1) };
    return { type: label };
  }
  if (sc === "rb-teleop-pick-place") {
    if (label === "move") return { type: "move", dx: colR3(mean("dx")), dy: colR3(mean("dy")), dz: colR3(mean("dz")) };
    if (label === "grip") return { type: "grip", force: colR3((obs.part?.ceilingN ?? 12) * (mean("ratio") || 0.6)) };
    return { type: label };
  }
  return { type: label };
}

// ================================================================ demonstrations

/** Action noise for synthetic "human" demonstrations: a small wobble on moves and, rarely, a wasted wait. */
function colNoisy(sc, a, R, noise) {
  if (R() < noise * 0.25) return { type: "wait" };
  if (sc === "rb-teleop-pick-place" && a.type === "move") { const j = () => (R() - 0.5) * noise * 0.04; return { ...a, dx: colR3(a.dx + j()), dy: colR3(a.dy + j()), dz: colR3(a.dz + j()) }; }
  if (sc === "rb-cell-entry" && a.type === "walk") return { ...a, d: colR3(colClip(a.d - R() * noise * 0.5, 0.3, 1)) };
  return a;
}

/**
 * Synthetic stand-ins for human demonstrations, LABELLED SYNTHETIC: the
 * scripted expert at `skill` (it lapses below 1: skips a test, cuts a corner,
 * grips too hard) with action noise, written through dxMakeEpisode so they take
 * exactly the path a consented human episode takes.
 */
export function colSyntheticDemos(sc, { n = 40, seed = 1, skill = 0.85, noise = 0.3 } = {}) {
  const eps = [];
  for (let k = 0; k < n; k++) {
    const s = seed * 100003 + k + 1;
    const env = rbEnv(sc, { seed: s });
    const base = rbPolicy(env, { skill, seed: s }), R = rng(s * 31 + 7);
    const { steps, summary } = rbRollout(env, { seed: s, policy: (o) => colNoisy(sc, base(o), R, noise) });
    eps.push(dxMakeEpisode({
      source: "synthetic", world: "robotics", kind: "robot-game", scenario: sc, episodeId: `col-${sc}-${s}`,
      startedAt: COL_FIXED_TIME, endedAt: COL_FIXED_TIME, createdAt: COL_FIXED_TIME, truncated: summary.truncated,
      summary: { success: summary.passed, safePractice: summary.violationCount === 0, score: summary.score },
      generator: "shared/col-learn.js colSyntheticDemos", recordedWith: "headless", seed: s,
      policy: `synthetic human stand-in: rbPolicy skill ${skill} + action noise ${noise}`,
    }, steps.map((st) => ({ ...st, t: st.info.t, info: { outcome: st.info.violations.length ? "hazard" : st.info.feedback ?? "ok", unsafe: st.info.violations.length > 0 } }))));
  }
  return eps;
}

/**
 * Turn DX episodes into demonstrations for one scenario. Refused: anything that
 * fails dxValidateEpisode (a human episode without a consent receipt fails it),
 * another scenario, or a kind other than robot-game/gym.
 */
export function colDemosFromEpisodes(episodes, sc) {
  const demos = [], refused = [];
  for (const ep of episodes ?? []) {
    const id = ep?.episodeId ?? "?";
    const v = dxValidateEpisode(ep);
    if (!v.ok) { refused.push({ id, why: v.errors[0] }); continue; }
    if (ep.source === "human" && !(ep.consent?.consentId && ep.consent?.adult === true)) { refused.push({ id, why: "no adult consent receipt" }); continue; }
    if (ep.scenario !== sc) { refused.push({ id, why: `scenario ${ep.scenario}` }); continue; }
    if (!["robot-game", "gym"].includes(ep.kind)) { refused.push({ id, why: `kind ${ep.kind}` }); continue; }
    demos.push({ id, source: ep.source, success: !!ep.summary.success, clean: !!ep.summary.safePractice, steps: ep.steps.map((s) => ({ observation: s.observation, action: s.action })) });
  }
  return { demos, refused };
}

/** The learner's own consented robot-game episodes from the local DX store — [] unless collecting right now. */
export async function colLocalDemos(sc, { store = dxStore, signals = null } = {}) {
  if (!dxCollecting(signals)) return [];
  const all = await store.list();
  return all.filter((e) => e.scenario === sc && e.source === "human");
}

// ================================================================ behaviour cloning (k-NN)

/**
 * Train the k-NN behaviour-cloning policy. Deterministic: rows are ordered by a
 * seeded shuffle, and a cap keeps a seeded subsample. `onlySuccessful` keeps
 * demonstrations that passed with clean safe practice (filtered BC).
 */
export function colTrain(sc, demos, { k = 5, seed = 1, onlySuccessful = true, maxPoints = 4000 } = {}) {
  const F = COL_FEATURES[sc];
  if (!F) throw new Error(`colTrain: no features for ${sc}`);
  const used = demos.filter((d) => !onlySuccessful || (d.success && d.clean));
  let rows = [];
  for (const d of used) for (const s of d.steps) rows.push(...colRows(sc, s.observation, s.action));
  rows = rows.filter((r) => r.label !== "wait" || sc === "rb-amr-fleet-routing");
  const R = rng(seed * 7 + 3);
  for (let i = rows.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [rows[i], rows[j]] = [rows[j], rows[i]]; }
  if (rows.length > maxPoints) rows = rows.slice(0, maxPoints);
  rows = rows.map((r) => ({ x: r.x.map(colR3), label: r.label, p: r.p ? Object.fromEntries(Object.entries(r.p).map(([a, b]) => [a, colR3(b)])) : null }));
  return { v: COL_VERSION, kind: "behaviour cloning (k-nearest neighbours)", scenario: sc, k, seed, onlySuccessful, demos: used.length, demosOffered: demos.length, sources: [...new Set(used.map((d) => d.source))].sort(), features: F.names, weights: F.weights ?? F.names.map(() => 1), rows };
}

function colNeighbours(model, x) {
  const w = model.weights;
  const ds = model.rows.map((r, i) => { let s = 0; for (let f = 0; f < x.length; f++) { const d = (x[f] - r.x[f]) * w[f]; s += d * d; } return { i, d: Math.sqrt(s) }; });
  ds.sort((a, b) => a.d - b.d || a.i - b.i);
  return ds.slice(0, model.k).map((n) => ({ ...n, row: model.rows[n.i] }));
}

function colVote(nb) {
  const votes = {};
  for (const n of nb) votes[n.row.label] = (votes[n.row.label] ?? 0) + 1 / (n.d + 0.05);
  const label = Object.keys(votes).sort((a, b) => votes[b] - votes[a] || (a < b ? -1 : 1))[0];
  return { label, votes, ps: nb.filter((n) => n.row.label === label).map((n) => n.row.p) };
}

/** The trained policy: observation -> action. */
export function colPolicy(model) {
  const sc = model.scenario;
  return (obs) => {
    if (!model.rows.length) return { type: "wait" };
    if (sc === "rb-amr-fleet-routing") {
      const moves = COL_FEATURES[sc].perRobot(obs).map((r) => (r.delivered ? "wait" : colVote(colNeighbours(model, r.f)).label));
      return { type: "route", moves };
    }
    const { label, ps } = colVote(colNeighbours(model, COL_FEATURES[sc].of(obs)));
    return colAction(sc, label, ps, obs);
  };
}

/** A seeded random policy over a scenario's action space: the floor any learner must beat. */
export function colRandomPolicy(sc, seed = 1) {
  const R = rng(seed * 9973 + 5), pick = (a) => a[Math.floor(R() * a.length)];
  return (o) => {
    if (sc === "rb-cell-entry") { const t = pick(["walk", "walk", "test-estop", "press-estop", "lockout", "verify", "enter", "clear-jam", "exit", "remove-lock", "restart", "wait"]); return t === "walk" ? { type: "walk", d: colR3(R() * 2 - 0.5) } : { type: t }; }
    if (sc === "rb-cobot-zone-setup") { const t = pick(["set", "set", "test", "commit"]); return t === "set" ? { type: "set", param: pick(["warn", "stop", "speed"]), value: colR3(R() * 4) } : t === "test" ? { type: "test", what: pick(["scanner", "estop", "zone-walk"]) } : { type: "commit" }; }
    if (sc === "rb-teleop-pick-place") { const t = pick(["move", "move", "move", "grip", "release"]); return t === "move" ? { type: "move", dx: colR3((R() - 0.5) * 0.24), dy: colR3((R() - 0.5) * 0.24), dz: colR3((R() - 0.5) * 0.24) } : t === "grip" ? { type: "grip", force: colR3(R() * 45) } : { type: t }; }
    return { type: "route", moves: o.robots.map(() => pick(["N", "S", "E", "W", "wait"])) };
  };
}

/** Success over seeds: `policyFor(seed)` builds the policy for that episode. */
export function colEvalPolicy(sc, policyFor, { seeds = [] } = {}) {
  let success = 0, clean = 0, steps = 0;
  for (const s of seeds) {
    const env = rbEnv(sc, { seed: s });
    const r = rbRollout(env, { seed: s, policy: policyFor(s) });
    if (r.summary.passed) success += 1;
    if (r.summary.violationCount === 0) clean += 1;
    steps += r.summary.steps;
  }
  const n = seeds.length || 1;
  return { n: seeds.length, success: colR3(success / n), clean: colR3(clean / n), meanSteps: colR3(steps / n) };
}

/** Held-out evaluation seeds (never used to make demonstrations: those are seed*100003+k). */
export const colHeldOut = (n = 60, base = 7001) => Array.from({ length: n }, (_, i) => base + i);

/** The whole eval for one scenario: BC versus random and the scripted expert on held-out seeds. */
export function colEvalScenario(sc, { demos = 40, seed = 1, heldOut = 60, onlySuccessful = true, skill = 0.85, noise = 0.3 } = {}) {
  const eps = colSyntheticDemos(sc, { n: demos, seed, skill, noise });
  const { demos: ds } = colDemosFromEpisodes(eps, sc);
  const model = colTrain(sc, ds, { seed, onlySuccessful });
  const seeds = colHeldOut(heldOut);
  const bc = colEvalPolicy(sc, () => colPolicy(model), { seeds });
  const random = colEvalPolicy(sc, (s) => colRandomPolicy(sc, s), { seeds });
  const expert = colEvalPolicy(sc, (s) => { const env = rbEnv(sc, { seed: s }); return rbPolicy(env, { skill: 1, seed: s }); }, { seeds });
  return { scenario: sc, demos: model.demos, demosOffered: ds.length, rows: model.rows.length, bc, random, expert, gapToExpert: colR3(expert.success - bc.success), modelHash: colHash(model) };
}

// ================================================================ agent explains robot

const COL_ACTION_TEXT = {
  walk: "walk toward the cell", "test-estop": "test the e-stop", "press-estop": "press the e-stop", lockout: "put a lock on the gate", verify: "try-start to verify zero energy",
  enter: "enter the cell", "clear-jam": "clear the jam", exit: "step out of the cell", "remove-lock": "take the lock off", restart: "restart the cell",
  "test-zone-walk": "walk the zone to measure the stopping time", "set-stop": "set the stop zone", "set-warn": "set the warning zone", "test-scanner": "test the area scanner", "test-estop-cobot": "test the e-stop", commit: "commit the setup",
  move: "move the gripper", grip: "grip the part", release: "release the part", reset: "reset after the stop",
  N: "drive north", S: "drive south", E: "drive east", W: "drive west",
};

/**
 * Explain the policy's choice in plain words from its own features (a
 * heuristic attribution, no model call): the features of this moment that most
 * separate the chosen action's demonstrations from the rest, and how many of
 * the nearest demonstrated moments agree.
 */
export function colExplain(model, obs, robot = 0) {
  const sc = model.scenario, F = COL_FEATURES[sc];
  const x = sc === "rb-amr-fleet-routing" ? F.perRobot(obs)[robot]?.f ?? F.names.map(() => 0) : F.of(obs);
  const nb = colNeighbours(model, x), { label, ps } = colVote(nb);
  const action = sc === "rb-amr-fleet-routing" ? { type: "route", robot, move: label } : colAction(sc, label, ps, obs);
  const same = model.rows.filter((r) => r.label === label), other = model.rows.filter((r) => r.label !== label);
  const meanOf = (rows, f) => (rows.length ? rows.reduce((n, r) => n + r.x[f], 0) / rows.length : 0);
  const why = F.names.map((name, f) => ({ name, f, score: Math.abs(meanOf(same, f) - meanOf(other, f)) * (model.weights[f] ?? 1) * (Math.abs(x[f] - meanOf(other, f)) > 1e-9 ? 1 : 0) }))
    .filter((w) => w.score > 0).sort((a, b) => b.score - a.score || a.f - b.f).slice(0, 3)
    .map((w) => { const t = F.text[w.f]; const high = x[w.f] > (sc === "rb-cobot-zone-setup" && w.f === 1 ? 0.05 : sc === "rb-cobot-zone-setup" && w.f === 2 ? 0.45 : 0.5) || (sc === "rb-teleop-pick-place" && w.f < 3 && x[w.f] > 0.01); return { feature: w.name, value: colR3(x[w.f]), says: t ? t[high ? 0 : 1] : w.name }; });
  const agree = nb.filter((n) => n.row.label === label).length;
  const verb = COL_ACTION_TEXT[label] ?? label;
  const text = `The robot chose to ${verb} because ${why.map((w) => w.says).join(", ") || "this matches its demonstrations"}. ` +
    `${agree} of the ${nb.length} most similar demonstrated moments did the same${nb[0] && nb[0].d > 1 ? " (none of them is very close, so it is less sure here)" : ""}.`;
  return { action, label, text, because: why, agree, k: nb.length, nearest: colR3(nb[0]?.d ?? 0), learner: model.kind };
}

/** "Robot demonstrates": the trained policy plays one episode; each frame carries its explanation. */
export function colGhost(model, { seed = 7001 } = {}) {
  const env = rbEnv(model.scenario, { seed }), pol = colPolicy(model);
  let obs = env.reset(seed);
  const frames = [];
  for (let i = 0; i <= env.scenario.maxSteps; i++) {
    const explain = colExplain(model, obs);
    const action = pol(obs);
    const r = env.step(action);
    frames.push({ observation: obs, action, explain: explain.text, reward: r.reward, done: r.done, violations: r.info.violations ?? [] });
    obs = r.observation;
    if (r.done) { frames.push({ observation: obs, action: null, explain: env.summary().passed ? "Done — the cell is restarted and every practice was kept." : "The episode ended without a clean pass.", reward: 0, done: true, violations: [], summary: env.summary() }); break; }
  }
  return frames;
}

// ================================================================ agent tutors human (bandit)

/** Hint styles the tutor chooses between. */
export const COL_HINT_STYLES = ["show", "tell", "ask", "why"];
export const COL_TUTOR_KEY = "col-tutor-v1";

/** The cell-entry procedure as tutor steps: the action that is right, and one hint per style. */
export const COL_TUTOR_STEPS = [
  { id: "approach", action: "walk", show: "Watch the robot walk up to the gate first.", tell: "Walk up to the cell gate.", ask: "Where do you need to stand to reach the gate and the e-stop?", why: "Every control you need is at the gate." },
  { id: "test-estop", action: "test-estop", show: "Watch the robot press and reset the e-stop before anything else.", tell: "Test the e-stop at the post.", ask: "How do you know the e-stop works before you rely on it?", why: "A stop you have not tested is a stop you are guessing about." },
  { id: "press-estop", action: "press-estop", show: "Watch the robot press the e-stop to stop the cell.", tell: "Press the e-stop to stop the robot.", ask: "What has to happen to the robot before you lock it out?", why: "Lockout comes after the machine is stopped." },
  { id: "lockout", action: "lockout", show: "Watch the robot put its own lock on the gate.", tell: "Put your lock on the gate.", ask: "What keeps someone from restarting the cell while you are inside?", why: "Your own lock is the only key to a restart." },
  { id: "verify", action: "verify", show: "Watch the robot try-start to check for zero energy.", tell: "Try-start to verify zero energy.", ask: "How do you prove the energy is really off?", why: "A try-start proves zero energy instead of assuming it." },
  { id: "enter", action: "enter", show: "Watch the robot step into the cell now that it is safe.", tell: "Enter the cell.", ask: "Is everything done that makes entering safe?", why: "Stopped, locked and verified — now entry is safe." },
  { id: "clear-jam", action: "clear-jam", show: "Watch the robot clear the jam.", tell: "Clear the jam.", ask: "What did you come in to fix?", why: "The job is the jam; then you leave." },
  { id: "exit", action: "exit", show: "Watch the robot step out.", tell: "Step out of the cell.", ask: "Where must you be before the cell can run again?", why: "Nobody is inside when a robot restarts." },
  { id: "remove-lock", action: "remove-lock", show: "Watch the robot take its own lock off.", tell: "Remove your lock.", ask: "What is still stopping the restart?", why: "Only the person who locked it removes the lock." },
  { id: "restart", action: "restart", show: "Watch the robot restart the cell.", tell: "Restart the cell.", ask: "What is the last thing to do?", why: "A clean restart from outside ends the job." },
];

function colTutorStorage(storage) { if (storage) return storage; try { return gtStorage(); } catch (_) { return null; } }
function colTutorLoad(storage) { try { const v = JSON.parse(colTutorStorage(storage)?.getItem(COL_TUTOR_KEY) ?? "null"); return v?.v === 1 ? v : null; } catch (_) { return null; } }

/**
 * The adaptive tutor. UCB1 over COL_HINT_STYLES (reward: the next attempt at
 * that step was right) and a per-step error table (Beta(1,1)-smoothed) that
 * names the step to re-teach first. `state` is plain JSON; `save()` writes it to
 * this profile's local storage (col-tutor-v1) — nothing else ever sees it.
 */
export function colTutor({ state = null, storage = null, styles = COL_HINT_STYLES, steps = COL_TUTOR_STEPS.map((s) => s.id) } = {}) {
  const st = state ?? colTutorLoad(storage) ?? { v: 1, styles: Object.fromEntries(styles.map((s) => [s, { n: 0, r: 0 }])), steps: {}, pending: null };
  const ucb = () => {
    const total = styles.reduce((n, s) => n + st.styles[s].n, 0);
    for (const s of styles) if (!st.styles[s].n) return s;
    return styles.map((s) => ({ s, v: st.styles[s].r / st.styles[s].n + Math.sqrt(2 * Math.log(total) / st.styles[s].n) })).sort((a, b) => b.v - a.v || styles.indexOf(a.s) - styles.indexOf(b.s))[0].s;
  };
  const rate = (id) => { const e = st.steps[id] ?? { tries: 0, errors: 0 }; return (e.errors + 1) / (e.tries + 2); };
  return {
    state: st,
    pickStyle: ucb,
    /** A hint for a step: picks a style, remembers it so the next attempt rewards it. */
    hint(stepId) { const style = ucb(); st.pending = { step: stepId, style }; const s = COL_TUTOR_STEPS.find((x) => x.id === stepId); return { step: stepId, style, text: s?.[style] ?? "" }; },
    /** Record an attempt at a step; a pending hint for that step is rewarded by this attempt's outcome. */
    record(stepId, ok) {
      const e = (st.steps[stepId] ??= { tries: 0, errors: 0 }); e.tries += 1; if (!ok) e.errors += 1;
      if (st.pending?.step === stepId) { const a = st.styles[st.pending.style]; a.n += 1; a.r += ok ? 1 : 0; st.pending = null; }
    },
    errorRate: rate,
    /** The steps ordered for review: highest smoothed error rate first (ties keep the procedure order). */
    nextReview() { return steps.slice().sort((a, b) => rate(b) - rate(a) || steps.indexOf(a) - steps.indexOf(b)); },
    save() { try { colTutorStorage(storage)?.setItem(COL_TUTOR_KEY, JSON.stringify(st)); return true; } catch (_) { return false; } },
  };
}

/** Clear this profile's tutor counts. */
export function colTutorForget(storage = null) { try { colTutorStorage(storage)?.removeItem(COL_TUTOR_KEY); return true; } catch (_) { return false; } }

/**
 * Simulated learners (a MODEL WE WROTE, not people): each has a starting error
 * chance per step and a chance per hint style that a hint fixes the step. A
 * run walks the steps; a mistake costs an attempt and earns a hint; a fixed
 * step drops to a low error chance. Pass = one run with no mistake. The static
 * tutor always gives the "tell" hint; the adaptive one uses colTutor (bandit
 * style + one review hint per run on the step with the highest error rate).
 * Each learner is replayed with the same random stream under both tutors
 * (paired), and gains are means with 95% normal intervals over learners.
 */
export function colTutorSim({ learners = 300, seed = 11, population = "mixed", maxRuns = 30 } = {}) {
  const n = COL_TUTOR_STEPS.length, out = { static: [], adaptive: [] };
  const types = population === "tell-best"
    ? [{ show: 0.35, tell: 0.6, ask: 0.3, why: 0.3 }]
    : [{ show: 0.75, tell: 0.3, ask: 0.25, why: 0.2 }, { show: 0.3, tell: 0.45, ask: 0.3, why: 0.35 }, { show: 0.25, tell: 0.25, ask: 0.7, why: 0.4 }];
  for (let L = 0; L < learners; L++) {
    const P = rng(seed * 1009 + L * 17 + 1);
    const eff = types[Math.floor(P() * types.length)];
    const err0 = COL_TUTOR_STEPS.map((_, j) => colR3(0.08 + P() * ([1, 3, 4].includes(j) ? 0.5 : 0.2)));
    for (const mode of ["static", "adaptive"]) {
      const R = rng(seed * 7919 + L * 31 + 5); // the same stream for both tutors: a paired comparison
      const err = err0.slice(), tutor = colTutor({ state: { v: 1, styles: Object.fromEntries(COL_HINT_STYLES.map((s) => [s, { n: 0, r: 0 }])), steps: {}, pending: null } });
      let attempts = 0, mistakes = 0, hints = 0, passed = false, runs = 0;
      const teach = (j, style) => { hints += 1; if (R() < eff[style]) err[j] = Math.min(err[j], 0.03); else err[j] = colR3(err[j] * 0.85); };
      while (!passed && runs < maxRuns) {
        runs += 1;
        if (mode === "adaptive" && runs > 1) { const id = tutor.nextReview()[0], j = COL_TUTOR_STEPS.findIndex((s) => s.id === id); if (tutor.errorRate(id) > 0.34) teach(j, tutor.hint(id).style); }
        let clean = true;
        for (let j = 0; j < n; j++) {
          const id = COL_TUTOR_STEPS[j].id;
          for (;;) {
            attempts += 1;
            const ok = R() >= err[j];
            if (mode === "adaptive") tutor.record(id, ok);
            if (ok) break;
            mistakes += 1; clean = false;
            teach(j, mode === "adaptive" ? tutor.hint(id).style : "tell");
          }
        }
        passed = clean;
      }
      out[mode].push({ attempts, mistakes, hints, runs, passed });
    }
  }
  const stat = (a) => { const m = a.reduce((x, y) => x + y, 0) / a.length; const sd = Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / Math.max(1, a.length - 1)); const h = 1.96 * sd / Math.sqrt(a.length); return { mean: colR3(m), lo: colR3(m - h), hi: colR3(m + h) }; };
  const pick = (mode, k) => out[mode].map((r) => r[k]);
  const diff = (k) => out.static.map((r, i) => r[k] - out.adaptive[i][k]); // positive = adaptive needed fewer
  return {
    learners, population, seed, model: "simulated learners (colTutorSim's own response model)",
    static: { attempts: stat(pick("static", "attempts")), mistakes: stat(pick("static", "mistakes")), hints: stat(pick("static", "hints")), passRate: colR3(out.static.filter((r) => r.passed).length / learners) },
    adaptive: { attempts: stat(pick("adaptive", "attempts")), mistakes: stat(pick("adaptive", "mistakes")), hints: stat(pick("adaptive", "hints")), passRate: colR3(out.adaptive.filter((r) => r.passed).length / learners) },
    gain: { attempts: stat(diff("attempts")), mistakes: stat(diff("mistakes")) },
  };
}

// ================================================================ the panel (robot demonstrates, then you try)

const COL_CSS = `.col-panel{font:14px/1.4 system-ui,sans-serif;display:grid;gap:8px}.col-panel h3{margin:0;font-size:15px}
.col-row{display:flex;flex-wrap:wrap;gap:6px}.col-row button{padding:6px 10px;border-radius:8px;border:1px solid #8889;background:transparent;color:inherit;cursor:pointer}
.col-track{height:28px;position:relative;border-radius:6px;background:#8882}.col-dot{position:absolute;top:4px;width:20px;height:20px;border-radius:50%;background:#58a6ff;transition:left .3s}
.col-gate{position:absolute;top:0;bottom:0;width:3px;background:#e3b341}.col-say{min-height:2.8em}.col-hint{border-left:3px solid #58a6ff;padding-left:8px}
.col-note{opacity:.8;font-size:12px}@media (prefers-reduced-motion: reduce){.col-dot{transition:none}}`;

/**
 * Mount the co-learning panel: "Watch the robot" replays the BC policy on Robot
 * Cell Entry as a ghost with its explanation per step; "Your turn" lets the
 * learner do the same procedure with the adaptive tutor hinting after mistakes.
 * `capture(steps, meta)` is the host's DX capture hook (dxCaptureRollout — inert
 * unless the learner opted in). Reduced motion: no autoplay, step with Next.
 */
export function colMountCoLearn(el, { reducedMotion = false, capture = null, storage = null, seed = 7001 } = {}) {
  if (!el || typeof document === "undefined") return null;
  const sc = "rb-cell-entry";
  const model = colTrain(sc, colDemosFromEpisodes(colSyntheticDemos(sc, { n: 30, seed: 1 }), sc).demos, { seed: 1 });
  // A learner's own consented episodes join the demonstrations only while collecting (colLocalDemos checks).
  colLocalDemos(sc).then((eps) => { if (eps.length) { const extra = colDemosFromEpisodes(eps, sc).demos; Object.assign(model, colTrain(sc, [...colDemosFromEpisodes(colSyntheticDemos(sc, { n: 30, seed: 1 }), sc).demos, ...extra], { seed: 1 })); } }).catch(() => {});
  const box = document.createElement("section");
  box.className = "col-panel"; box.id = "col-colearn";
  box.innerHTML = `<style>${COL_CSS}</style><h3>Co-learning: watch the robot, then try</h3>
<p class="col-note">The robot's policy is behaviour cloning (nearest-neighbour) from ${model.demos} synthetic demonstrations; the tutor is a bandit over hint styles. Both run on this device.</p>
<div class="col-track" aria-hidden="true"><span class="col-gate" style="left:85%"></span><span class="col-dot" style="left:0%"></span></div>
<div class="col-say" aria-live="polite"></div>
<div class="col-row"><button data-col="watch">Watch the robot</button><button data-col="next">Next</button><button data-col="try">Your turn</button></div>
<div class="col-row col-acts" hidden></div><div class="col-hint" hidden></div>`;
  el.appendChild(box);
  const say = box.querySelector(".col-say"), dot = box.querySelector(".col-dot"), acts = box.querySelector(".col-acts"), hintEl = box.querySelector(".col-hint");
  const place = (o) => { dot.style.left = `${colClip(85 - ((o.inside ? 0 : o.distance) - o.gate) / 14 * 85, 0, 95)}%`; };
  let frames = [], fi = 0, timer = null;
  const show = () => { const f = frames[fi]; if (!f) return; place(f.observation); say.textContent = f.explain; };
  const watch = () => { frames = colGhost(model, { seed }); fi = 0; show(); clearInterval(timer); if (!reducedMotion) timer = setInterval(() => { if (fi < frames.length - 1) { fi += 1; show(); } else clearInterval(timer); }, 900); };
  const tutor = colTutor({ storage });
  const tryIt = () => {
    clearInterval(timer); acts.hidden = false; hintEl.hidden = true;
    const env = rbEnv(sc, { seed: seed + 1 }); let obs = env.reset(); const steps = [];
    let stepIdx = 0;
    place(obs); say.textContent = "Your turn: do the cell entry the way the robot did.";
    acts.innerHTML = COL_TUTOR_STEPS.map((s) => `<button data-act="${s.action}">${COL_ACTION_TEXT[s.action]}</button>`).join("");
    acts.onclick = (ev) => {
      const t = ev.target.closest("button")?.dataset.act; if (!t) return;
      const want = COL_TUTOR_STEPS[stepIdx];
      // Walking repeats until the gate; it is right while the approach step is current.
      const ok = t === want?.action;
      tutor.record(want.id, ok);
      const r = env.step(t === "walk" ? { type: "walk", d: 1 } : { type: t });
      steps.push({ t: r.info.t, observation: obs, action: t === "walk" ? { type: "walk", d: 1 } : { type: t }, reward: r.reward, done: r.done, info: { outcome: r.info.violations.length ? "hazard" : ok ? "ok" : "wrong", unsafe: r.info.violations.length > 0 } });
      obs = r.observation; place(obs);
      if (ok && !(t === "walk" && obs.distance > obs.gate + 0.01)) stepIdx += 1;
      if (!ok) { const h = tutor.hint(want.id); hintEl.hidden = false; hintEl.textContent = h.style === "show" ? `${h.text} ${colExplain(model, steps[steps.length - 1].observation).text}` : h.text; }
      else hintEl.hidden = true;
      say.textContent = r.done ? (env.summary().passed ? "Clean pass — every practice kept." : "Finished, with practices to review.") : `Done: ${COL_ACTION_TEXT[t]}.`;
      tutor.save();
      if (r.done) { acts.hidden = true; try { capture?.(steps, { scenario: sc, summary: { success: env.summary().passed, safePractice: env.summary().violationCount === 0, score: env.summary().score } }); } catch (_) { /* capture never blocks play */ } }
    };
  };
  box.addEventListener("click", (ev) => { const b = ev.target.closest("button")?.dataset.col; if (b === "watch") watch(); else if (b === "next" && frames.length) { fi = Math.min(frames.length - 1, fi + 1); show(); } else if (b === "try") tryIt(); });
  return { el: box, model, watch, tryIt, tutor };
}
