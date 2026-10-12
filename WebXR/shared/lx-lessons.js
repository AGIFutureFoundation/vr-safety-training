/**
 * LESSONS-X: lessons led by software agents, and lesson packs across the worlds.
 *
 * A lesson runs brief → demonstration at the station → the learner's try → debrief. A software agent delivers it:
 * one of the Omega Hive's agents (OH_AGENTS, oh-hive-data.js) or one of the VBRIDGE personas (AA_VBRIDGE_PERSONAS,
 * aa-agent-portraits.js). Every line is built from the station's own steps (title and cue, read from its sim module by
 * tools/gen_lx_packs.mjs into lx-packs-data.js) and the standards its certification names, and carries `ground` saying
 * which. Every caption says "software agent". Voice is on-device and off by default (ohSpeakAs, local voices only);
 * captions always show. No network, no LLM, nothing listens.
 *
 * Seams (documented shapes):
 *   lxRoster(catalog)                                  -> enterable stations in composeLesson's shape
 *   lxPacks(roster)                                    -> { packs: [pack], refused: [{ id, reasons }], pending: [...] }
 *   lxLeaderFor(station, { world, site })              -> the agent who leads (hive agent or VBRIDGE persona)
 *   lxAgentLesson(stationId, roster, opts)             -> { id, station, leader, lines: [{ phase, agent, text, caption, label, ground }] } | { refused, reasons }
 *   lxLessonSource(lesson, { siteId })                 -> a contract source ({ on, off, step, play, events }) for aaMountAgentAvatars
 *   lxMountLessonFigure({ mount, lesson, ...opts })    -> calls the figure API (aaMountAgentAvatars or a room mount) with the leader and the source
 *   lxRunInWorld(world, lesson, { caption, voice })    -> the lesson through an existing figure mount (attach/addAgents), paced
 *   lxLessonAtRobotSite(world, sites, stationId, opts) -> the parishes page's entry (?lxLesson=<stationId>, __parishTest.lxLesson)
 *   lxVoice({ on, speak, caption })                    -> say(line): caption always, voice only when on
 *   lxProgressStore({ signals, storage })              -> progress kept under DATAWORKS rules (opted-in adults only; revoke deletes)
 *   lxAssign(packId, { storage }) / lxAssigned()       -> the instructor's assignment (a pack id only, no learner data)
 */
import { composePack, composeLesson, standardsOf, lessonProgress } from "./lessons.js";
import { LX_PACK_DECLS, LX_PACK_PENDING, LX_STATION_STEPS, LX_STATION_META } from "./lx-packs-data.js";
import { OH_AGENTS, OH_AGENT_LABEL } from "./oh-hive-data.js";
import { AA_VBRIDGE_PERSONAS } from "./aa-agent-portraits.js";
import { ohSpeakAs } from "./oh-voice.js";
import { dxCollecting, dxConsent, dxRevoke } from "./dx-data.js";

export const LX_LABEL = OH_AGENT_LABEL; // "software agent"
export const LX_PHASES = Object.freeze(["brief", "demo", "try", "debrief"]);
export const LX_PROGRESS_KEY = "lx-progress-v1";
export const LX_ASSIGN_KEY = "lx-assign-v1";

/** The enterable stations, in the shape composeLesson and composePack take (as check_lessons builds it). Without a catalog,
 * the pack stations' own catalog rows (LX_STATION_META, generated) — enough for a page that does not load catalog.json. */
export function lxRoster(catalog = null) {
  if (!catalog) return Object.values(LX_STATION_META).map((s) => ({ ...s, tagline: "" }));
  return (catalog?.stations ?? []).filter((s) => !s.flat).map((s) => ({
    app: s.app, id: s.id, name: s.name, category: s.category,
    certification: s.certification ?? "", tagline: s.tagline ?? "",
    stepCount: s.steps ?? s.stepCount ?? 0, parSeconds: s.parSeconds ?? 240,
    interruptCount: s.interrupts ?? s.interruptCount ?? 0,
  }));
}

/** A station's own steps ([{ id, title, cue }]) from its sim module, via the generated data. */
export function lxStepsOf(stationId) { return LX_STATION_STEPS[stationId] ?? []; }

/** Every declared pack composed against the roster: the packs that hold, the ones refused with reasons, and the pending ones. */
export function lxPacks(roster) {
  const packs = [], refused = [];
  for (const d of LX_PACK_DECLS) {
    const r = composePack(d, roster, { stepsOf: lxStepsOf });
    if (r.ok) packs.push({ ...r.pack, leader: d.leader, left: d.left });
    else refused.push({ id: d.id, reasons: r.reasons });
  }
  return { packs, refused, pending: LX_PACK_PENDING.slice() };
}

const lxHive = (id) => OH_AGENTS.find((a) => a.id === id) ?? null;
const lxPersona = (id) => AA_VBRIDGE_PERSONAS.find((a) => a.id === id) ?? null;

/**
 * Who leads a station's lesson. At a robot site, the hive agent whose home it is (else the trainer); on a pack the
 * hive leads, the trainer; on a VBRIDGE pack, the evaluator persona (it scores against the station's own rubric).
 * The debrief is always given by the same agent.
 */
export function lxLeaderFor(station, { leader = "hive", site = null } = {}) {
  if (leader === "vbridge") return lxAgentView(lxPersona("agent-evaluator"), "vbridge");
  const home = site ? OH_AGENTS.find((a) => a.homeSite === site) : null;
  return lxAgentView(home ?? lxHive("oh-trainer"), "hive");
}

function lxAgentView(a, from) {
  if (!a) return null;
  return { id: a.id, name: a.name, role: a.roleLabel ?? a.role, from, label: LX_LABEL, avatar: a.avatar, voice: a.voice ?? null, homeSite: a.homeSite ?? null };
}

const lxCap = (s) => String(s ?? "").replace(/[.\s]+$/, "");

/**
 * Build one agent-led lesson at a station, or refuse. `result` (optional) is the learner's try:
 * `{ score, missed: [stepId] }`; without it the debrief states the target only.
 */
export function lxAgentLesson(stationId, roster, { leader = "hive", site = null, pass = 0.7, result = null } = {}) {
  const st = (roster ?? []).find((s) => s.id === stationId);
  const steps = lxStepsOf(stationId);
  const reasons = [];
  if (!st) reasons.push(`${stationId} is not an enterable station`);
  if (!steps.length) reasons.push(`${stationId} has no steps to ground a lesson in`);
  if (reasons.length) return { refused: true, reasons };
  const who = lxLeaderFor(st, { leader, site });
  const stds = standardsOf(st);
  const perfect = (st.stepCount || steps.length) * 100 + (st.interruptCount ?? 0) * 120;
  const target = Math.round(perfect * pass);
  const lines = [];
  const say = (phase, text, ground) => lines.push({ phase, agent: who.id, text, caption: `${who.name} (${LX_LABEL}): ${text}`, label: LX_LABEL, ground: { station: st.id, ...ground } });

  // Brief: what the station is, what it is scored against, and the order of its steps.
  const last = steps[steps.length - 1];
  say("brief", `${st.name}: ${steps.length} steps, from ${lxCap(steps[0].title).toLowerCase()} to ${lxCap(last.title).toLowerCase()}. ${stds.length ? `Scored against ${stds.join(", ")}.` : "Scored on the station's own steps."}`,
    { steps: [steps[0].id, last.id], ...(stds.length ? { standards: stds } : {}) });
  const first = steps.slice(0, 3);
  say("brief", `In order: ${first.map((s) => lxCap(s.title)).join("; ")}${steps.length > 3 ? `; then ${steps.length - 3} more` : ""}.`, { steps: first.map((s) => s.id) });
  // Demonstration at the station: each step's title and its own cue.
  steps.forEach((s, i) => say("demo", `Step ${i + 1}, ${lxCap(s.title)}: ${s.cue}`, { step: s.id }));
  // The learner's try: the agent hands over and stays quiet until the run ends.
  say("try", `Your turn. Start with ${lxCap(steps[0].title).toLowerCase()}; I stay quiet until you finish.`, { step: steps[0].id });
  // Debrief: the points against the target, and the steps to repeat by name.
  if (result && Number.isFinite(result.score)) {
    const missed = steps.filter((s) => (result.missed ?? []).includes(s.id));
    say("debrief", `You scored ${result.score} of ${perfect}; the target is ${target}. ${result.score >= target ? "That clears it." : "Not yet."}`, { points: { score: result.score, target, perfect } });
    if (missed.length) for (const s of missed) say("debrief", `Repeat ${lxCap(s.title).toLowerCase()}: ${s.cue}`, { step: s.id });
    else say("debrief", `Every step held, from ${lxCap(steps[0].title).toLowerCase()} to ${lxCap(steps[steps.length - 1].title).toLowerCase()}.`, { steps: [steps[0].id, steps[steps.length - 1].id] });
  } else {
    say("debrief", `A clean run is ${perfect} points; the target is ${target}. I will name any step to repeat.`, { points: { target, perfect } });
  }
  return { id: `lx-${st.id}`, station: { id: st.id, name: st.name, standards: stds }, leader: who, site, points: { perfect, target, pass }, lines };
}

/** A prompt against one world's pack stations: composeLesson over that roster, refused when the world cannot satisfy it. */
export function lxComposeIn(text, roster, packs) {
  const ids = new Set(packs.flatMap((p) => p.stations.map((s) => s.id)));
  const lesson = composeLesson(text, roster.filter((s) => ids.has(s.id)));
  return lesson ?? { refused: true, reasons: [`no station in ${packs.map((p) => p.worldName).filter((v, i, a) => a.indexOf(v) === i).join(", ") || "these packs"} satisfies "${text}"`] };
}

function lxEmitter() {
  const subs = new Map();
  return {
    on(type, fn) { if (typeof fn === "function") { if (!subs.has(type)) subs.set(type, new Set()); subs.get(type).add(fn); } return this; },
    off(type, fn) { subs.get(type)?.delete(fn); return this; },
    emit(ev) { for (const fn of [...(subs.get(ev.type) ?? []), ...(subs.get("*") ?? [])]) { try { fn(ev); } catch (_) { /* a listener's error stays its own */ } } },
  };
}

/**
 * The lesson as a contract source for the figure mount (aaMountAgentAvatars' `source`: anything with on(type, fn)).
 * step() emits the next event: first a move to the station's site, then one speak event per line, then complete.
 */
export function lxLessonSource(lesson, { siteId = lesson?.site ?? null } = {}) {
  const em = lxEmitter();
  const queue = [];
  if (siteId) queue.push({ type: "move", agent: lesson.leader.id, to: siteId });
  for (const l of lesson.lines) queue.push({ type: "speak", agent: l.agent, text: l.text, caption: l.caption, lx: { phase: l.phase, ground: l.ground } });
  queue.push({ type: "complete", agent: lesson.leader.id });
  const log = [];
  let t = 0, i = 0;
  const api = {
    on: (type, fn) => { em.on(type, fn); return api; },
    off: (type, fn) => { em.off(type, fn); return api; },
    step() { if (i >= queue.length) return null; const ev = { t: (t += 1), ...queue[i++] }; log.push(ev); em.emit(ev); return ev; },
    play() { let n = 0; while (api.step()) n += 1; return n; },
    done: () => i >= queue.length,
    events: () => log.slice(),
  };
  return api;
}

/**
 * Call the figure API with the lesson's leader and source. `mount` is aaMountAgentAvatars (or a room mount such as
 * aaRoomAvatarMount()); the rest is passed through (three, parent, siteAt, tier, reducedMotion, voiced). Guarded:
 * a missing mount returns null and the captions still run.
 */
export function lxMountLessonFigure({ mount = null, lesson, siteId = lesson?.site ?? null, ...opts } = {}) {
  const source = lxLessonSource(lesson, { siteId });
  let world = null;
  try { world = typeof mount === "function" ? mount({ ...opts, agents: [{ ...lesson.leader, homeSite: siteId }], source }) : null; } catch (_) { world = null; }
  return { world, source };
}

/** How long a line stays up before the next: the figures' reading pace (165 words a minute), 1.5 to 12 s. */
export function lxLineMs(text) { const w = String(text ?? "").split(/\s+/).filter(Boolean).length; return Math.max(1500, Math.min(12000, Math.round((w / 165) * 60000))); }

/**
 * Run a lesson in a world that already has the figure mount (the parishes page's aaWorld: aaMountAgentAvatars' api with
 * attach/detach/addAgents/agents). The leader gets a figure if the mount does not have one yet (addAgents), the lesson's
 * source is attached, and one event goes out per line at the reading pace (`schedule` is setTimeout unless given). Every
 * line's caption goes to `caption` (always); the voice speaks only when `voice.on`. Returns { source, lesson, voice, stop() }.
 */
export function lxRunInWorld(world, lesson, { siteId = lesson?.site ?? null, caption = () => {}, voice = null, schedule = (fn, ms) => setTimeout(fn, ms), cancel = (h) => clearTimeout(h) } = {}) {
  if (!world || !lesson || lesson.refused) return null;
  try {
    const have = typeof world.agents === "function" ? world.agents() : [];
    const ids = new Set((have ?? []).map((a) => a?.id ?? a));
    if (!ids.has(lesson.leader.id)) world.addAgents?.([{ ...lesson.leader, homeSite: siteId }]);
  } catch (_) { /* the captions still run */ }
  const source = lxLessonSource(lesson, { siteId });
  try { world.attach?.(source); } catch (_) { /* no figure: captions only */ }
  const v = voice ?? lxVoice({ caption });
  let handle = null, stopped = false;
  const next = () => {
    if (stopped) return;
    const ev = source.step();
    if (!ev) { try { world.detach?.(source); } catch (_) { /* gone */ } return; }
    let ms = 400;
    if (ev.type === "speak") { const line = lesson.lines.find((l) => l.text === ev.text && l.phase === ev.lx.phase); if (line) v.say(line, lesson.leader); ms = lxLineMs(ev.text); }
    handle = schedule(next, ms);
  };
  next();
  return { source, lesson, voice: v, stop() { stopped = true; try { cancel(handle); } catch (_) { /* none */ } try { world.detach?.(source); } catch (_) { /* gone */ } } };
}

/** The parishes page's entry: a lesson at the robot site whose station is `stationId` (else that station's lesson with no site). */
export function lxLessonAtRobotSite(world, sites, stationId, opts = {}) {
  const site = (sites ?? []).find((s) => s.station === stationId) ?? null;
  const lesson = lxAgentLesson(stationId, lxRoster(), { leader: "hive", site: site?.id ?? null });
  if (lesson.refused) { try { opts.caption?.(`No agent-led lesson: ${lesson.reasons.join("; ")}`); } catch (_) { /* ignore */ } return { refused: true, reasons: lesson.reasons }; }
  return lxRunInWorld(world, lesson, { ...opts, siteId: site?.id ?? null });
}

/** Captions always; the voice only when the learner turned it on (on-device voices only, via ohSpeakAs). */
export function lxVoice({ on = false, speak = ohSpeakAs, caption = () => {} } = {}) {
  let voiceOn = on === true;
  return {
    get on() { return voiceOn; },
    set(v) { voiceOn = v === true; },
    say(line, agent = null) {
      try { caption(line.caption); } catch (_) { /* captions never stop the lesson */ }
      if (voiceOn && agent) { try { speak(agent, line.text); } catch (_) { /* silent: the caption shows */ } return true; }
      return false;
    },
  };
}

function lxGet(storage, key) { try { const v = storage?.getItem?.(key); return v ? JSON.parse(v) : null; } catch (_) { return null; } }
function lxSet(storage, key, v) { try { storage?.setItem?.(key, JSON.stringify(v)); return true; } catch (_) { return false; } }
function lxDel(storage, key) { try { storage?.removeItem?.(key); } catch (_) { /* ignore */ } }

/**
 * Pack progress under DATAWORKS rules: stored on this device only, and only while dxCollecting() is true (an eligible,
 * signed-in, non-demo, non-K-12 session with the learner's own adult opt-in). With no consent the stored progress is
 * deleted on the next read (a revoke elsewhere deletes it too); revoke() calls dxRevoke and deletes it.
 */
export function lxProgressStore({ signals = null, storage = globalThis.localStorage ?? null, collecting = dxCollecting, consent = dxConsent, revoke = dxRevoke } = {}) {
  const allowed = () => { try { return collecting(signals) === true; } catch (_) { return false; } };
  const read = () => {
    let c = null; try { c = consent(); } catch (_) { c = null; }
    if (!c) { lxDel(storage, LX_PROGRESS_KEY); return {}; }
    return lxGet(storage, LX_PROGRESS_KEY) ?? {};
  };
  return {
    allowed,
    record(packId, rec) {
      if (!allowed()) return { stored: false, reason: "not collecting: opted-in adults only (never K-12, demo or signed-out)" };
      const all = read();
      const list = Array.isArray(all[packId]) ? all[packId] : [];
      list.push({ simId: rec.simId, score: Number(rec.score) || 0 });
      all[packId] = list.slice(-200);
      lxSet(storage, LX_PROGRESS_KEY, all);
      return { stored: true };
    },
    progress(pack) { return lessonProgress(pack, (read()[pack.id] ?? [])); },
    all: read,
    async revoke() { lxDel(storage, LX_PROGRESS_KEY); try { await revoke(); } catch (_) { /* consent store unavailable */ } lxDel(storage, LX_PROGRESS_KEY); return { ok: true, remaining: lxGet(storage, LX_PROGRESS_KEY) ? 1 : 0 }; },
  };
}

/** The instructor's assignment: which pack the console has set, stored as a pack id only (no learner data). */
export function lxAssign(packId, { storage = globalThis.localStorage ?? null, packs = null } = {}) {
  if (packs && !packs.some((p) => p.id === packId)) return { ok: false, reason: `${packId} is not a composed pack` };
  lxSet(storage, LX_ASSIGN_KEY, { pack: packId });
  return { ok: true, pack: packId };
}
export function lxAssigned({ storage = globalThis.localStorage ?? null } = {}) { return lxGet(storage, LX_ASSIGN_KEY)?.pack ?? null; }
