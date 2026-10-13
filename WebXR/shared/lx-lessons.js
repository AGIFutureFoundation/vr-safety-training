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
 * LESSONS-X-2: the cast of a VBRIDGE-led lesson, all four personas (aa-agent-portraits.js), each with its own part. The safety
 * governor states the station's standards in the brief, the robot-site (provider) agent demonstrates, the client agent hands the
 * learner the try, and the evaluator (the leader) orders the brief and gives the debrief against the station's own rubric.
 * A hive-led lesson keeps one voice: the site's home agent speaks every part.
 */
export const LX_VBRIDGE_PARTS = Object.freeze({ standards: "agent-governor", order: "agent-evaluator", demo: "agent-provider", try: "agent-client", debrief: "agent-evaluator" });
export function lxCastFor(leaderView, { leader = "hive" } = {}) {
  if (leader !== "vbridge") return { parts: {}, cast: [leaderView] };
  const parts = {}, cast = [];
  for (const [part, id] of Object.entries(LX_VBRIDGE_PARTS)) {
    const v = id === leaderView.id ? leaderView : lxAgentView(lxPersona(id), "vbridge");
    parts[part] = v ?? leaderView;
    if (v && !cast.some((c) => c.id === v.id)) cast.push(v);
  }
  if (!cast.some((c) => c.id === leaderView.id)) cast.unshift(leaderView);
  return { parts, cast };
}

/**
 * Build one agent-led lesson at a station, or refuse. `result` (optional) is the learner's try:
 * `{ score, missed: [stepId] }`; without it the debrief states the target only. A result whose `missed` is not an array
 * (the record kept the points but not the steps) gets the points line alone. Every line's `agent` is who says it; on a
 * VBRIDGE pack the four personas share the lesson (`cast`), on a hive pack the leader says every line.
 */
export function lxAgentLesson(stationId, roster, { leader = "hive", site = null, pass = 0.7, result = null } = {}) {
  const st = (roster ?? []).find((s) => s.id === stationId);
  const steps = lxStepsOf(stationId);
  const reasons = [];
  if (!st) reasons.push(`${stationId} is not an enterable station`);
  if (!steps.length) reasons.push(`${stationId} has no steps to ground a lesson in`);
  if (reasons.length) return { refused: true, reasons };
  const who = lxLeaderFor(st, { leader, site });
  const { parts, cast } = lxCastFor(who, { leader });
  const by = (part) => parts[part] ?? who;
  const stds = standardsOf(st);
  const perfect = (st.stepCount || steps.length) * 100 + (st.interruptCount ?? 0) * 120;
  const target = Math.round(perfect * pass);
  const lines = [];
  const say = (phase, text, ground, speaker = who) => lines.push({ phase, agent: speaker.id, text, caption: `${speaker.name} (${LX_LABEL}): ${text}`, label: LX_LABEL, ground: { station: st.id, ...ground } });

  // Brief: what the station is, what it is scored against (the governor's part on a VBRIDGE pack), and the order of its steps.
  const last = steps[steps.length - 1];
  say("brief", `${st.name}: ${steps.length} steps, from ${lxCap(steps[0].title).toLowerCase()} to ${lxCap(last.title).toLowerCase()}. ${stds.length ? `Scored against ${stds.join(", ")}.` : "Scored on the station's own steps."}`,
    { steps: [steps[0].id, last.id], ...(stds.length ? { standards: stds } : {}) }, by("standards"));
  const first = steps.slice(0, 3);
  say("brief", `In order: ${first.map((s) => lxCap(s.title)).join("; ")}${steps.length > 3 ? `; then ${steps.length - 3} more` : ""}.`, { steps: first.map((s) => s.id) }, by("order"));
  // Demonstration at the station: each step's title and its own cue (the provider's part).
  steps.forEach((s, i) => say("demo", `Step ${i + 1}, ${lxCap(s.title)}: ${s.cue}`, { step: s.id }, by("demo")));
  // The learner's try: the agent hands over and stays quiet until the run ends (the client's part).
  say("try", `Your turn. Start with ${lxCap(steps[0].title).toLowerCase()}; I stay quiet until you finish.`, { step: steps[0].id }, by("try"));
  // Debrief: the points against the target, and the steps to repeat by name (the evaluator's part).
  if (result && Number.isFinite(result.score)) {
    const known = Array.isArray(result.missed);
    const missed = known ? steps.filter((s) => result.missed.includes(s.id)) : [];
    say("debrief", `You scored ${result.score} of ${perfect}; the target is ${target}. ${result.score >= target ? "That clears it." : "Not yet."}`, { points: { score: result.score, target, perfect } }, by("debrief"));
    if (missed.length) for (const s of missed) say("debrief", `Repeat ${lxCap(s.title).toLowerCase()}: ${s.cue}`, { step: s.id }, by("debrief"));
    else if (known) say("debrief", `Every step held, from ${lxCap(steps[0].title).toLowerCase()} to ${lxCap(steps[steps.length - 1].title).toLowerCase()}.`, { steps: [steps[0].id, steps[steps.length - 1].id] }, by("debrief"));
  } else {
    say("debrief", `A clean run is ${perfect} points; the target is ${target}. I will name any step to repeat.`, { points: { target, perfect } }, by("debrief"));
  }
  return { id: `lx-${st.id}`, station: { id: st.id, name: st.name, standards: stds }, leader: who, cast, site, points: { perfect, target, pass }, lines };
}

/**
 * LESSONS-X-2: the learner's real try as a lesson result. `record` is the passport's station record (shared/passport.js
 * ppRecordStation: `score`, and `debrief.steps` from the station's own step log — id, corrections, hazards, clean). Missed
 * steps are the ones the log marks not clean, plus the station's steps the log never reached. A record with no step log
 * keeps the points and says the steps are unknown (`missed: null`).
 */
export function lxResultOf(record, stationId = record?.simId) {
  if (!record || !Number.isFinite(Number(record.score))) return null;
  const steps = lxStepsOf(stationId);
  const log = Array.isArray(record.debrief?.steps) ? record.debrief.steps : null;
  if (!log || !log.length) return { score: Number(record.score), missed: null, simId: stationId };
  const seen = new Set(log.map((s) => s.id));
  const missed = steps.filter((s) => { const e = log.find((x) => x.id === s.id); return e ? e.clean === false || (e.corrections | 0) > 0 || (e.hazards | 0) > 0 : !seen.has(s.id); }).map((s) => s.id);
  return { score: Number(record.score), missed, simId: stationId };
}

/** The newest passport record for a station (ppRecords() keeps attempts in order; the last one is the run just finished). */
export function lxLatestRecord(stationId, records = []) {
  const mine = (records ?? []).filter((r) => r?.simId === stationId);
  return mine.length ? mine[mine.length - 1] : null;
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
export function lxLessonSource(lesson, { siteId = lesson?.site ?? null, phases = null } = {}) {
  const em = lxEmitter();
  const queue = [];
  const keep = Array.isArray(phases) ? new Set(phases) : null;
  if (siteId) for (const a of lesson.cast ?? [lesson.leader]) queue.push({ type: "move", agent: a.id, to: siteId });
  for (const l of lesson.lines) if (!keep || keep.has(l.phase)) queue.push({ type: "speak", agent: l.agent, text: l.text, caption: l.caption, lx: { phase: l.phase, ground: l.ground } });
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
export function lxMountLessonFigure({ mount = null, lesson, siteId = lesson?.site ?? null, phases = null, ...opts } = {}) {
  const source = lxLessonSource(lesson, { siteId, phases });
  let world = null;
  const agents = (lesson?.cast ?? [lesson?.leader]).filter(Boolean).map((a) => ({ ...a, homeSite: siteId }));
  try { world = typeof mount === "function" ? mount({ ...opts, agents, source }) : null; } catch (_) { world = null; }
  return { world, source };
}

/**
 * LESSONS-X-2: the lesson figure inside one of ACCESS's walk-in rooms (ix-interiors.js builds `room.agentSpots`, two per ACCESS
 * room). The leader stands at `room.agentSpots[0]` (the cast's others at the spots that follow), in the room's own group, through
 * the room figure mount (`aaRoomAvatarMount()`, the room level inside IX_BUDGET: it counts the room's triangles before it builds).
 * The room's id is one of ACCESS's styles; the lesson is the interiors pack's station for that room, else null. Nothing here
 * edits the room: this calls the figure API only. Returns { world, source, lesson, voice, stop() } like lxRunInWorld, or null.
 */
export function lxRoomLesson({ room = null, three = null, mount = null, lesson = null, tier = "high", reducedMotion = false, caption = () => {}, voice = null, schedule = (fn, ms) => setTimeout(fn, ms), cancel = (h) => clearTimeout(h), phases = null } = {}) {
  if (!room?.group || !lesson || lesson.refused || typeof mount !== "function") return null;
  const spots = Array.isArray(room.agentSpots) ? room.agentSpots : [];
  if (!spots.length) return null;
  const P = "lx-room:";
  const place = new Map();
  const cast = (lesson.cast ?? [lesson.leader]).filter(Boolean);
  cast.forEach((a, i) => { const s = spots[Math.min(i, spots.length - 1)]; place.set(`${P}${a.id}`, { x: s.x, y: 0, z: s.z, yaw: Number(s.yaw) || 0 }); });
  const source = lxLessonSource(lesson, { siteId: null, phases });
  const relay = { on: (t, fn) => source.on(t, fn), off: (t, fn) => source.off(t, fn) };
  let world = null;
  try {
    world = mount({ three, parent: room.group, tier, reducedMotion, source: relay,
      agents: cast.map((a) => ({ ...a, homeSite: `${P}${a.id}` })),
      siteAt: (id) => (place.has(id) ? { x: 0, y: 0, z: 0 } : null),
      spotFor: (_a, id) => place.get(id) ?? null });
  } catch (_) { world = null; }
  const v = voice ?? lxVoice({ caption });
  let handle = null, stopped = false;
  const next = () => {
    if (stopped) return;
    const ev = source.step();
    if (!ev) return;
    let ms = 400;
    if (ev.type === "speak") { const line = lesson.lines.find((l) => l.text === ev.text && l.phase === ev.lx.phase); if (line) v.say(line, cast.find((a) => a.id === line.agent) ?? lesson.leader); ms = lxLineMs(ev.text); }
    handle = schedule(next, ms);
  };
  next();
  return { world, source, lesson, voice: v, spot: spots[0], stop() { stopped = true; try { cancel(handle); } catch (_) { /* none */ } try { world?.dispose?.(); } catch (_) { /* gone */ } } };
}

/** The interiors pack's station for an ACCESS room (its style id), from the declared packs: `{ id, site, pad, interior }` or null. */
export function lxRoomStation(styleId, decls = LX_PACK_DECLS) {
  for (const d of decls) for (const s of d.stations ?? []) if (s.interior === styleId) return { ...s, pack: d.id, leader: d.leader };
  return null;
}

/** How long a line stays up before the next: the figures' reading pace (165 words a minute), 1.5 to 12 s. */
export function lxLineMs(text) { const w = String(text ?? "").split(/\s+/).filter(Boolean).length; return Math.max(1500, Math.min(12000, Math.round((w / 165) * 60000))); }

/**
 * Run a lesson in a world that already has the figure mount (the parishes page's aaWorld: aaMountAgentAvatars' api with
 * attach/detach/addAgents/agents). The leader gets a figure if the mount does not have one yet (addAgents), the lesson's
 * source is attached, and one event goes out per line at the reading pace (`schedule` is setTimeout unless given). Every
 * line's caption goes to `caption` (always); the voice speaks only when `voice.on`. Returns { source, lesson, voice, stop() }.
 */
export function lxRunInWorld(world, lesson, { siteId = lesson?.site ?? null, caption = () => {}, voice = null, schedule = (fn, ms) => setTimeout(fn, ms), cancel = (h) => clearTimeout(h), phases = null, onDone = null } = {}) {
  if (!world || !lesson || lesson.refused) return null;
  const cast = (lesson.cast ?? [lesson.leader]).filter(Boolean);
  try {
    const have = typeof world.agents === "function" ? world.agents() : [];
    const ids = new Set((have ?? []).map((a) => a?.id ?? a));
    const missing = cast.filter((a) => !ids.has(a.id)).map((a) => ({ ...a, homeSite: siteId }));
    if (missing.length) world.addAgents?.(missing);
  } catch (_) { /* the captions still run */ }
  const source = lxLessonSource(lesson, { siteId, phases });
  try { world.attach?.(source); } catch (_) { /* no figure: captions only */ }
  const v = voice ?? lxVoice({ caption });
  let handle = null, stopped = false;
  const next = () => {
    if (stopped) return;
    const ev = source.step();
    if (!ev) { try { world.detach?.(source); } catch (_) { /* gone */ } try { onDone?.(); } catch (_) { /* ignore */ } return; }
    let ms = 400;
    if (ev.type === "speak") { const line = lesson.lines.find((l) => l.text === ev.text && l.phase === ev.lx.phase); if (line) v.say(line, cast.find((a) => a.id === line.agent) ?? lesson.leader); ms = lxLineMs(ev.text); }
    handle = schedule(next, ms);
  };
  next();
  return { source, lesson, voice: v, stop() { stopped = true; try { cancel(handle); } catch (_) { /* none */ } try { world.detach?.(source); } catch (_) { /* gone */ } } };
}

/** The parishes page's entry: a lesson at the robot site whose station is `stationId` (else that station's lesson with no site). */
export function lxLessonAtRobotSite(world, sites, stationId, opts = {}) {
  const site = (sites ?? []).find((s) => s.station === stationId) ?? null;
  const lesson = lxAgentLesson(stationId, lxRoster(), { leader: "hive", site: site?.id ?? null, result: opts.result ?? null });
  if (lesson.refused) { try { opts.caption?.(`No agent-led lesson: ${lesson.reasons.join("; ")}`); } catch (_) { /* ignore */ } return { refused: true, reasons: lesson.reasons }; }
  return lxRunInWorld(world, lesson, { ...opts, siteId: site?.id ?? null });
}

/**
 * LESSONS-X-2: the real try feeds the debrief. When the learner comes back from a robot site's station, its passport record
 * (`records`: ppRecords(), the newest for the station) becomes the lesson's result and the site's agent gives the debrief alone:
 * the points against the target and the missed steps by name. DATAWORKS rules: only while `store.allowed()` (an opted-in adult;
 * never K-12, demo or signed-out) — otherwise nothing is read into a lesson and nothing is stored, and the call says why. The
 * attempt is recorded under every composed pack that holds the station, through the same store.
 */
export function lxDebriefAtRobotSite(world, sites, stationId, { records = [], store = null, packs = null, ...opts } = {}) {
  const ps = store ?? lxProgressStore();
  if (!ps.allowed()) return { refused: true, stored: false, reasons: ["not collecting: opted-in adults only (never K-12, demo or signed-out)"] };
  const rec = lxLatestRecord(stationId, records);
  const result = lxResultOf(rec, stationId);
  if (!result) return { refused: true, stored: false, reasons: [`no record of a try at ${stationId}`] };
  const list = packs ?? lxPacks(lxRoster()).packs;
  let stored = 0;
  for (const p of list) if (p.stations.some((s) => s.id === stationId)) { if (ps.record(p.id, { simId: stationId, score: result.score }).stored) stored += 1; }
  const run = lxLessonAtRobotSite(world, sites, stationId, { ...opts, result, phases: ["debrief"] });
  return run && !run.refused ? { ...run, result, stored, refused: false } : { refused: true, stored, reasons: run?.reasons ?? ["no run"], result };
}

/**
 * LESSONS-X-2: the menu entry. `lxArmLesson` renders "Lesson with the site's agent" into a menu mount (one button per robot site
 * with a station) and arms the chosen site: the lesson starts when the learner reaches it (`within` metres, polled by `poll` while
 * `playing()`), not at load. `start(stationId)` is the page's lxLesson; `where()` gives the learner's x, z; `at(site)` the site's.
 * Returns { armed(), arm(siteId), disarm(), tick(), dispose() }; tick() is what the poll calls and the headless check drives.
 */
export function lxArmLesson(el, { sites = [], start = () => null, where = () => null, at = (s) => (s?.position ? { x: s.position[0], z: s.position[1] } : null), playing = () => true, within = 9, poll = 500, toast = () => {}, schedule = globalThis.setInterval?.bind(globalThis) ?? null, cancel = globalThis.clearInterval?.bind(globalThis) ?? null, names = (id) => id } = {}) {
  const list = (sites ?? []).filter((s) => s?.id && s.station);
  let armed = null, timer = null, run = null;
  const api = {
    armed: () => armed,
    arm(siteId) { const s = list.find((x) => x.id === siteId); if (!s) return false; armed = s; run = null; try { toast(`Lesson armed: walk to ${s.name ?? s.id}; ${names(s.station)} starts when you arrive.`); } catch (_) { /* ignore */ } render(); return true; },
    disarm() { armed = null; render(); },
    tick() {
      if (!armed || !playing()) return null;
      const me = where(), p = at(armed);
      if (!me || !p) return null;
      if (Math.hypot(me.x - p.x, me.z - p.z) > within) return null;
      const s = armed; armed = null;
      run = start(s.station) ?? null; render();
      return run;
    },
    run: () => run,
    dispose() { if (timer && cancel) cancel(timer); timer = null; armed = null; },
  };
  const buttons = [];
  function render() { for (const [b, s] of buttons) { b.setAttribute("aria-pressed", armed?.id === s.id ? "true" : "false"); b.textContent = armed?.id === s.id ? `Armed: walk to ${s.name ?? s.id}` : `Lesson with the site's agent: ${s.name ?? s.id}`; } }
  if (el && typeof document !== "undefined") {
    el.textContent = "";
    if (list.length) {
      const h = document.createElement("p"); h.className = "fine"; h.id = "menu-lx-note"; h.textContent = "Agent-led lessons at the robot sites: a software agent gives the brief, the demonstration and the debrief at its site. The lesson starts when you reach the site. Captions always; voice off unless you turn it on."; el.append(h);
      const row = document.createElement("div"); row.className = "row"; el.append(row);
      for (const s of list) { const b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.dataset.lxSite = s.id; b.addEventListener("click", () => (armed?.id === s.id ? api.disarm() : api.arm(s.id))); row.append(b); buttons.push([b, s]); }
      render();
    }
  }
  if (schedule && poll > 0) timer = schedule(() => { try { api.tick(); } catch (_) { /* never breaks the frame */ } }, poll);
  return api;
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
