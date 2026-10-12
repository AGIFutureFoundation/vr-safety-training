// OMEGA-HIVE — the hive: seven software agents coordinate every robot job through VBRIDGE's safety governor
// (docs/omega-hive.md, docs/consoles/OMEGA-HIVE.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// One hive step is one simulated minute. Over a seeded stream of VBRIDGE jobs (ohJobStream):
//   1. the dispatcher announces each arriving job;
//   2. the working agents bid: skill match for the task, minus the hops to the job's site, minus current load
//      (OH_BID_WEIGHTS); an agent at capacity does not bid; the best bid wins (ties go to roster order);
//   3. the winner negotiates with the governor (vbNegotiate -> vbGovernor.check, unchanged): a refusal is final for
//      that job. A refusal that names the physical path ("physical-target") becomes an APPROVAL REQUEST to the human
//      supervisor (the learner). Approving only re-queues the job as a SIMULATED job, which goes through the governor
//      again like any other; declining closes it. The physical path itself stays disabled (VB_PHYSICAL);
//   4. the safety steward reviews every job the governor allowed and may VETO it (a payload well above the site's
//      usual range, or a speed close to the reduced limit with a person inside the warning distance — thresholds
//      tightened by the steward's caution trait). A veto only ever adds a refusal: the steward is never asked about
//      a job the governor refused, and nothing the steward says can let a job run;
//   5. routine governor-allowed simulated jobs run under the supervisor's standing approval (one audit line at the
//      start says so); the winner walks to the site, waits if the site's robot is busy (one job per robot at a time),
//      and the job runs in the sim (vbRun: the governor monitors every step; the e-stop wins);
//   6. on completion the winner reports, the trainer coaches any run that did not finish clean, and the auditor
//      re-walks the chain every few closed jobs.
// Every award, veto, refusal, approval request, approval, decline, dispatch and completion is written to the hive's
// own hash chain AND handed to ENTERPRISE-3's audit log (`audit` = ent3AuditAppend), beside the governor's own lines.
// Deterministic for a seed. No network, no keys, no model call; lines come from oh-say.js on the device.
//
// SEAM (the contract with AGENT-AVATARS; neither side imports the other):
//   ohHive({ seed, governor, audit, agents, jobs, nJobs, ticksPerDay, decide, supervisor, mode, capacity, policyFor })
//     -> { agents, step(), run(n), on(type, fn), off(type, fn), events(), approve(jobId), decline(jobId),
//          pending(), metrics(), agentState(id), log(), verify(), done(), governor }
//   event: { t, type: "speak" | "move" | "bid" | "award" | "dispatch" | "refused" | "approval-request" | "complete",
//            agent, text?, to?: siteId, jobId?, reason?, caption?, …facts (siteName, task, score, steps, bid, lines, ok) }
//   `on("*", fn)` receives every event. `decide(request)` -> "approve" | "decline" | null (null: wait for the person).
//   `mode: "single"` is the baseline: one dispatcher works every job alone (same governor, steward and approvals).
//   `supervise: true` (or setSupervise(true), HIVE-IN-WORLD) replaces the standing approval: every governor-allowed job waits
//   for the learner's approval before it is approved and dispatched (reason "supervise"), and a job approved earlier under the
//   standing approval is held at dispatch until the learner approves it, so while the setting is on no job dispatches without
//   the learner. metrics().dispatchedWithoutLearner counts the ones that did.
//   HIVE-4 (loop 10 round 4), all three off by default so round 3's events are unchanged; the panel turns them on:
//   `exchanges: true`: agents talk to each other at handoffs. The dispatcher hands the job over and the winner confirms
//     (in place of the winner's single award line); the steward questions a contested winning bid that comes from another map
//     (hops >= 2) or from an agent already holding a job, and the bidder answers; the auditor reports a clean chain to the
//     dispatcher, who acknowledges. Each line is a speak event with `exchange: { id, kind, turn, of, with }` and `toAgent`; the
//     caption names the speaker and the addressee. Every speak event also carries `floor: { startMs, endMs }`: one floor per
//     step, so lines in a step follow each other with a gap and never overlap (a caption-timing seam for the figures).
//   `memory: true`: when a worker completes a job, it may say how many jobs of that kind it has completed today, the site of
//     the last one and its time on the hive clock. ohRecall reads all three from the hive's own chain (the oh-award and
//     oh-complete lines), never from the event or the agent; `logSeq` says how much of the chain the line read.
//   `variety: true`: ohSay's variety path (more variants; parts in the agent's last four lines are skipped when another fits).
//   HIVE-5 (loop 10 round 5), off by default so earlier rounds' events are unchanged; the panel turns it on:
//   `homeward: true`: an agent whose last job has ended (it holds none) and that stands away from its home robot site walks back:
//     a `move` to its homeSite with `home: true` (no job id) and its own line (about "home"). Its next bids count the hops from
//     home. The figures outdoors follow that move, so an agent no longer stays at its last job's site. Nothing is written to the
//     chain for it (it is not a governance step) and the governor sees nothing new.
//   HIVE-6 (loop 10 round 6), both off by default so earlier rounds' events are unchanged; the panel turns them on:
//   `moods: true`: every agent carries a mood from the hive's own events (h6-moods.js h6MoodTracker: calm, busy, concerned after a
//     refusal or a veto, relieved after a clean audit). A change is a `mood` event { agent, mood, from, cause } right after the
//     event that caused it (or at the step where a mood runs out); every speak event carries `mood` and `moodCause`, and a line
//     outside the safety kinds may carry a short mood phrase in the speaker's register (`moodPhrase`) when it fits the band.
//   `briefing: true`: brief() (once, in the hive's first H6_BRIEF.window minutes) holds the morning briefing: the dispatcher opens
//     with the day's queue (its own job stream's counts) and each agent answers in turn, to the dispatcher, with its first job (its
//     first award: the live hive's, or the same seeded day played forward by a second hive with the same seed, options and `decide`) or its
//     standing duty (the steward, the consent keeper, the auditor). Speak events with `briefing: { id, turn, of }`, one floor, so
//     no two lines overlap; captions labelled "morning briefing". Nothing is written to the chain; the governor sees nothing new.
//
// Every top-level name starts with `oh`/`OH_` (the bundler shares one scope).

import { RB_SITES, RB_SSM } from "./rb-robotics-data.js";
import { VB_TASKS, VB_RIG_LIMITS, VB_ANOMALY } from "./vb-shared-data.js";
import { vbGovernor } from "./vb-governor.js";
import { vbCreateJob, vbNegotiate, vbApprove, vbRun, vbEvaluate } from "./vb-bridge.js";
import { OH_AGENTS } from "./oh-hive-data.js";
import { ohSay } from "./oh-say.js";
import { h6MoodTracker, h6WithMood, h6BriefFirstJobs, H6_BRIEF } from "./h6-moods.js";

export const OH_EVENT_TYPES = Object.freeze(["speak", "move", "bid", "award", "dispatch", "refused", "approval-request", "complete"]);
export const OH_TICK_MS = 60000;
export const OH_CAPACITY = 2;
export const OH_BID_WEIGHTS = Object.freeze({ skill: 0.6, hops: 0.12, load: 0.25 });
/** The steward's thresholds: z above zBase - zPerCaution * caution, speed share above 1 - sharePerCaution * caution. */
export const OH_STEWARD = Object.freeze({ zBase: 4, zPerCaution: 2, sharePerCaution: 0.15 });
export const OH_AUDIT_EVERY = 5;
export const OH_STANDING = "standing approval for governor-allowed simulated jobs";
/** HIVE-4: one floor per step. A line's reading window mirrors the figures' caption clock (400 ms plus the words at 165 per minute, 1.5 to 12 s). */
export const OH_FLOOR = Object.freeze({ wpm: 165, baseMs: 400, minMs: 1500, maxMs: 12000, gapMs: 250 });
/** HIVE-4: the exchanges (opener kind, reply kind). The steward's question is "question_far" or "question_load" by what it asks about. */
export const OH_EXCHANGES = Object.freeze({ handoff: Object.freeze(["handoff", "confirm"]), question: Object.freeze(["question", "answer"]), report: Object.freeze(["report", "ack"]) });
/** HIVE-4: how a worker names a task kind when it counts its day (plural), and which kinds reset a robot (a cell restart, a zone set-up). */
export const OH_TASK_NOUNS = Object.freeze({ "rb-cell-entry": "cell entries", "rb-cobot-zone-setup": "zone set-ups", "rb-teleop-pick-place": "pick-and-place runs", "rb-amr-fleet-routing": "routing runs" });
export const OH_RESET_TASKS = Object.freeze(["rb-cell-entry", "rb-cobot-zone-setup"]);
/** HIVE-4: a worker speaks a memory line at most once in this many hive minutes. */
export const OH_MEMORY_COOLDOWN = 30;
export const OH_RECENT = 4;
/** HIVE-4: the steward questions at most one bid in this many hive minutes (fewer, more varied questions). */
export const OH_QUESTION_COOLDOWN = 6;

/** HIVE-4: a line's reading window in ms (the floor's unit). */
export function ohLineMs(text) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.round(Math.min(OH_FLOOR.maxMs, Math.max(OH_FLOOR.minMs, OH_FLOOR.baseMs + (words * 60000) / OH_FLOOR.wpm)));
}
/** HIVE-4: the hive clock as hours and minutes from the day's start: "H+0123" (a chain line's `at`) or 123 (a tick) -> "02:03". */
export function ohClock(at) {
  const n = typeof at === "number" ? at : Number(String(at ?? "").replace(/^H\+/, ""));
  if (!Number.isFinite(n) || n < 0) return "";
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}
/**
 * HIVE-4: what an agent remembers of its day, from the hive's own chain only: its completed jobs of one task kind, in order,
 * joined from the oh-award lines (job, task, site, agent) and the oh-complete lines (job, "completed", time).
 * Returns { count, jobs: [{ jobId, siteId, at, seq }], last } where `last` is the one before the most recent.
 */
export function ohRecall(chain = [], agentId, taskType) {
  const awards = new Map();
  const jobs = [];
  for (const l of chain) {
    if (l.action === "oh-award") { const m = /^(\S+) (\S+) @ (\S+) -> (\S+) /.exec(l.detail); if (m) awards.set(m[1], { task: m[2], siteId: m[3], agent: m[4] }); }
    else if (l.action === "oh-complete") {
      const m = /^(\S+) @ (\S+): completed,/.exec(l.detail); const a = m ? awards.get(m[1]) : null;
      if (a && a.agent === agentId && a.task === taskType) jobs.push({ jobId: m[1], siteId: a.siteId, at: l.at, seq: l.seq });
    }
  }
  return { count: jobs.length, jobs, last: jobs.length >= 2 ? jobs[jobs.length - 2] : null };
}

function ohHash(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); }
function ohLineHash(l) { const b = `${l.seq}|${l.at}|${l.action}|${l.detail}|${l.prev}`; return ohHash(b) + ohHash(b.split("").reverse().join("")); }
function ohMulberry(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const ohR3 = (n) => Math.round(n * 1000) / 1000;

/** The region a map belongs to (for hops): the Louisiana maps or the Bay Area maps. */
export function ohRegionOf(parish) { return /^(orleans|jefferson|st-|plaquemines|la-)/.test(String(parish)) ? "louisiana" : "bay-area"; }

/** Hops between two robot sites: 0 the same site, 1 the same map, 2 the same region, 3 across regions. Not a distance. */
export function ohSiteHops(a, b, sites = RB_SITES) {
  if (a === b) return 0;
  const sa = sites.find((s) => s.id === a), sb = sites.find((s) => s.id === b);
  if (!sa || !sb) return 3;
  if (sa.parish === sb.parish) return 1;
  return ohRegionOf(sa.parish) === ohRegionOf(sb.parish) ? 2 : 3;
}

/**
 * A seeded day of VBRIDGE job requests from six mock client agents across the robot sites: mostly rule-legal jobs,
 * with the cases a supervisor must see (a task not on a rig's allowlist, over-speed, a person inside separation,
 * payloads above the usual range and far above it, a lapsing policy, and requests that name a physical robot).
 * Arrivals fill the first 80% of the day. Every figure is a simulation parameter.
 */
export function ohJobStream(seed = 1, n = 200, { ticksPerDay = 480, sites = RB_SITES } = {}) {
  const r = ohMulberry((seed * 2654435761) >>> 0 ^ 0x5bd1e995);
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const arriveT = 1 + Math.floor((i * ticksPerDay * 0.8) / n);
    const site = sites[Math.floor(r() * sites.length)];
    const allowed = Object.keys(VB_TASKS).filter((k) => VB_TASKS[k].rigs.includes(site.rig));
    const others = Object.keys(VB_TASKS).filter((k) => !allowed.includes(k));
    const taskType = r() < 0.04 && others.length ? others[Math.floor(r() * others.length)] : allowed[Math.floor(r() * allowed.length)];
    const lim = VB_RIG_LIMITS[site.rig] ?? VB_RIG_LIMITS.amr;
    const nearestPersonM = ohR3(r() < 0.04 ? 1 + r() * 1.4 : 3 + r() * 11);
    const cap = nearestPersonM < lim.warn ? lim.maxSpeed * RB_SSM.reducedSpeed : lim.maxSpeed;
    const speed = ohR3(r() < 0.05 ? cap * (1.1 + 0.3 * r()) : cap * (0.3 + 0.6 * r()));
    const pr = VB_ANOMALY.history.tasks[taskType]?.payloadKg ?? [0, 5];
    const roll = r();
    const payloadKg = ohR3(roll < 0.03 ? pr[1] * (1.6 + 0.8 * r()) : roll < 0.07 ? pr[1] * (1.15 + 0.2 * r()) : pr[0] + r() * (pr[1] - pr[0]));
    const physical = r() < 0.06;
    const policyId = r() < 0.08 ? "vb-scripted-lapsing" : "vb-scripted-expert";
    const client = { id: `client-mock-${1 + (i % 6)}`, name: "Mock client agent" };
    out.push({ n: i, arriveT, spec: { seed: ((seed >>> 0) * 1000 + i) >>> 0, client, request: { taskType, siteId: site.id, speed, nearestPersonM, policyId, payloadKg, target: { kind: physical ? "physical" : "sim" }, note: `hive job ${i + 1}` } } });
  }
  return out;
}

/** The steward's review of a governor-allowed job. Returns a veto (an added refusal) or null. Never grants anything. */
export function ohStewardReview(steward, request, decision) {
  const c = Math.min(1, Math.max(0, steward?.traits?.caution ?? 0.5));
  const zMax = OH_STEWARD.zBase - OH_STEWARD.zPerCaution * c;
  const z = decision?.explain?.anomaly?.z?.payloadKg;
  if (Number.isFinite(z) && z > zMax) return { veto: "unusual-payload", z: ohR3(z), limit: ohR3(zMax) };
  const site = RB_SITES.find((s) => s.id === request?.siteId);
  const lim = site ? VB_RIG_LIMITS[site.rig] : null;
  if (lim && Number(request.nearestPersonM) < lim.warn) {
    const cap = lim.maxSpeed * RB_SSM.reducedSpeed;
    const share = Number(request.speed) / cap;
    if (share >= 1 - OH_STEWARD.sharePerCaution * c) return { veto: "near-limit-with-person", share: ohR3(share), limit: ohR3(1 - OH_STEWARD.sharePerCaution * c) };
  }
  return null;
}

export function ohHive({ seed = 1, governor = null, audit = null, agents = OH_AGENTS, jobs = null, nJobs = 200, ticksPerDay = 480, decide = null, supervisor = "Supervisor (this device)", mode = "hive", capacity = OH_CAPACITY, policyFor = null, say = ohSay, sites = RB_SITES, supervise = false, exchanges = false, memory = false, variety = false, homeward = false, moods = false, briefing = false } = {}) {
  const roster = agents.slice();
  const byKey = (k) => roster.find((a) => a.key === k) ?? roster[0];
  const dispatcher = byKey("dispatcher"), steward = byKey("safety-steward"), keeper = byKey("consent-keeper"), trainer = byKey("trainer"), auditor = byKey("auditor");
  const workers = mode === "single" ? [dispatcher] : roster.filter((a) => Object.values(a.skills ?? {}).some((v) => v > 0));
  const skillOf = (a, task) => (mode === "single" ? 1 : a.skills?.[task] ?? 0);
  const base = governor ?? vbGovernor({ ent3: audit ? { auditAppend: audit } : null });
  const counts = { checks: new Map(), monitors: new Map() };
  const gov = {
    check(cmd) { const d = base.check(cmd); counts.checks.set(cmd.jobId, d.decision); return d; },
    monitor(s) { counts.monitors.set(s.jobId, (counts.monitors.get(s.jobId) ?? 0) + 1); return base.monitor(s); },
    setEstop: (...a) => base.setEstop(...a), estopHeld: (...a) => base.estopHeld(...a), log: () => base.log(), verify: () => base.verify(),
  };
  const stream = (jobs ?? ohJobStream(seed, nJobs, { ticksPerDay, sites })).map((j) => ({ ...j, status: "future", waited: 0, bids: 0 }));
  const state = new Map(roster.map((a) => [a.id, { site: a.homeSite, load: 0, done: 0 }]));
  const siteBusy = new Map();
  const listeners = new Map();
  const log = [];
  const chain = [];
  const m = { contested: 0, siteConflicts: 0, siteConflictsResolved: 0, maxPerSite: 0, awardsToBest: 0, awards: 0, closed: 0, toAward: [] };
  let t = 0;
  // HIVE-6: the moods (moods only), from the hive's own events; heldBy reads the hive's own job list.
  const heldBy = (id) => stream.filter((j) => j.winner === id && j.doneT == null && j.vb?.phase !== "REJECTED" && (["queued", "moving", "running"].includes(j.status) || (j.status === "awaiting-approval" && j.pendingReason === "supervise"))).map((j) => j.vb?.id ?? j.firstId);
  const moodT = moods ? h6MoodTracker({ agents: roster, heldBy, steward: steward?.id, keeper: keeper?.id, auditor: auditor?.id }) : null;

  const siteName = (id) => sites.find((s) => s.id === id)?.name ?? id;
  function write(action, detail) {
    const last = chain[chain.length - 1];
    const line = { seq: chain.length, at: `H+${String(t).padStart(4, "0")}`, action, detail: String(detail).slice(0, 240), prev: last ? last.hash : "genesis" };
    line.hash = ohLineHash(line);
    chain.push(line);
    try { audit?.(action, line.detail, { at: line.at }); } catch (_) { /* the hive's own chain still holds the line */ }
    return line;
  }
  function emit(ev) {
    const e = { t, ...ev };
    log.push(e);
    for (const fn of [...(listeners.get(e.type) ?? []), ...(listeners.get("*") ?? [])]) { try { fn(e); } catch (_) { /* a listener never stops the hive */ } }
    if (moodT && e.type !== "mood") for (const c of moodT.observe(e)) emit(c); // HIVE-6: a mood changes right after its cause
    return e;
  }
  // HIVE-4: the floor (one per step), each agent's recent lines (for variety) and the time of its last memory line.
  let floorT = -1, floorAt = 0, xSeq = 0, lastQuestionT = -Infinity;
  const recentLines = new Map(), memAt = new Map();
  function speak(agent, about, facts, meta = null) {
    const ev = { about, ...facts, t };
    let text = variety ? say(agent, ev, { variety: true, recent: recentLines.get(agent.id) ?? [] }) : say(agent, ev);
    if (!text) return null;
    // HIVE-6: the speaker's mood (moods only): a phrase in its register when the kind allows one and it fits the band.
    let moodX = null;
    if (moodT) { const mm = moodT.mood(agent.id); const w = h6WithMood(agent, about, text, mm, { t, jobId: facts?.jobId ?? "" }); text = w.text; moodX = { mood: mm, moodCause: moodT.cause(agent.id), ...(w.phrase ? { moodPhrase: w.phrase } : {}) }; }
    if (!exchanges && !memory && !variety && !moodX && !meta?.briefing) return emit({ type: "speak", agent: agent.id, about, ...facts, text, caption: `${agent.name} (${agent.label ?? "software agent"}): ${text}` });
    // HIVE-4: the caption names the speaker (and the addressee in an exchange); the floor serialises the step's lines.
    const to = facts?.toAgent ? roster.find((x) => x.id === facts.toAgent) : null;
    const extra = { ...(meta ?? {}), ...(moodX ?? {}) };
    if (exchanges || extra.briefing) { if (floorT !== t) { floorT = t; floorAt = 0; } const d = ohLineMs(text); extra.floor = { startMs: floorAt, endMs: floorAt + d }; floorAt += d + OH_FLOOR.gapMs; }
    if (variety) { const r = recentLines.get(agent.id) ?? []; r.push(text); if (r.length > OH_RECENT) r.shift(); recentLines.set(agent.id, r); }
    const toWord = agent.lang === "es" ? "a" : "to"; // the caption's connector follows the agent's language
    const brief = extra.briefing ? ` · ${agent.lang === "es" ? "reunión de la mañana" : "morning briefing"}` : ""; // HIVE-6: a briefing line says so
    return emit({ type: "speak", agent: agent.id, about, ...facts, text, caption: `${agent.name} (${agent.label ?? "software agent"})${brief}${to ? ` ${toWord} ${to.name}` : ""}: ${text}`, ...extra });
  }
  /** HIVE-4: an exchange between two agents: the opener (a to b), then the reply (b to a). Null when the opener cannot be said. */
  function exchange(kind, a, b, facts, openKind = null) {
    if (!a || !b || a.id === b.id) return null;
    const [open, reply] = OH_EXCHANGES[kind];
    xSeq += 1; const id = `x-${t}-${xSeq}`;
    const e1 = speak(a, openKind ?? open, { ...facts, toName: b.name, toAgent: b.id }, { exchange: { id, kind, turn: 0, of: 2, with: b.id } });
    if (!e1) return null;
    const e2 = speak(b, reply, { ...facts, toName: a.name, toAgent: a.id }, { exchange: { id, kind, turn: 1, of: 2, with: a.id } });
    return e2 ? [e1, e2] : [e1];
  }
  /** HIVE-4: a worker recalls its day from the hive's own chain (count, last site, last time), at most once per cooldown. */
  function remember(w, j) {
    const task = j.spec.request.taskType;
    const r = ohRecall(chain, w.id, task);
    if (r.count < 2 || !r.last) return null;
    const lastSpoke = memAt.get(w.id);
    if (lastSpoke != null && t - lastSpoke < OH_MEMORY_COOLDOWN) return null;
    const e = speak(w, "memory", factsOf(j, { count: r.count, taskType: task, kinds: OH_TASK_NOUNS[task] ?? task, lastSite: siteName(r.last.siteId), lastSiteId: r.last.siteId, lastJobId: r.last.jobId, lastAt: r.last.at, clock: ohClock(r.last.at), reset: OH_RESET_TASKS.includes(task), logSeq: chain.length }), { memory: true });
    if (e) memAt.set(w.id, t);
    return e;
  }
  const factsOf = (j, extra = {}) => ({ jobId: j.vb?.id ?? j.firstId, to: j.spec.request.siteId, siteName: siteName(j.spec.request.siteId), task: VB_TASKS[j.spec.request.taskType]?.label ?? j.spec.request.taskType, ...extra });
  /** HIVE-5: home after the last job (homeward only): a move to the agent's home site and its line. Null when it holds a job or is home. */
  let homeMoves = 0;
  function goHome(w) {
    if (!homeward || !w?.homeSite) return null;
    const s = state.get(w.id);
    if (!s || s.load > 0 || s.site === w.homeSite) return null;
    const facts = { to: w.homeSite, siteName: siteName(w.homeSite), from: s.site, hops: ohSiteHops(s.site, w.homeSite, sites), home: true };
    s.site = w.homeSite; homeMoves += 1;
    const e = emit({ type: "move", agent: w.id, ...facts });
    speak(w, "home", facts);
    return e;
  }

  let superviseAll = !!supervise;
  if (superviseAll) { write("oh-supervise", `${supervisor}: supervise every job is on; each governor-allowed job waits for a decision`); speak(keeper, "supervise_on", { supervisor }); }
  else { write("oh-standing-approval", `${supervisor}: ${OH_STANDING}; requests that name a physical robot still need a decision each`); speak(keeper, "standing", { supervisor }); }
  // HIVE-IN-WORLD: ask the learner about a governor-allowed simulated job (supervise every job). `atDispatch`: it was approved
  // under the standing approval before the setting came on, and is held at its dispatch instead.
  function askSupervisor(j, atDispatch) {
    const siteId = j.spec.request.siteId;
    j.status = "awaiting-approval"; j.pendingReason = "supervise"; j.heldAtDispatch = !!atDispatch;
    emit({ type: "approval-request", agent: keeper.id, ...factsOf(j, { reason: "supervise", winner: j.winner }) });
    write("oh-approval-request", `${j.vb.id} @ ${siteId}: supervise every job is on; asked ${supervisor} to approve this governor-allowed simulated job${atDispatch ? " before it starts" : ""}`);
    speak(keeper, "supervise", factsOf(j));
    const d = typeof decide === "function" ? decide({ jobId: j.vb.id, siteId, taskType: j.spec.request.taskType, reasons: ["supervise"] }) : null;
    if (d === "approve") approve(j.vb.id); else if (d === "decline") decline(j.vb.id);
  }

  function arrive(j) {
    j.status = "queued"; j.vb = vbCreateJob(j.spec); j.firstId = j.vb.id; j.queuedAt = t;
    speak(dispatcher, "announce", factsOf(j));
  }

  function release(j) { const s = state.get(j.winner); if (s) s.load = Math.max(0, s.load - 1); }
  function close(j, status) {
    j.status = status; m.closed += 1;
    if (m.closed % OH_AUDIT_EVERY === 0) {
      const v = verify();
      const facts = { jobId: j.firstId, lines: v.ok ? v.lines : v.brokenAt, ok: v.ok };
      // HIVE-4: a clean chain is reported to the dispatcher, who acknowledges it; a broken one stays the auditor's own line.
      if (!(exchanges && v.ok && exchange("report", auditor, dispatcher, { ...facts, logSeq: chain.length }))) speak(auditor, v.ok ? "audit" : "audit_broken", facts);
    }
  }

  function award(j) {
    const task = j.spec.request.taskType, siteId = j.spec.request.siteId;
    const bids = workers.filter((a) => state.get(a.id).load < capacity && skillOf(a, task) > 0).map((a) => {
      const s = state.get(a.id); const hops = ohSiteHops(s.site, siteId, sites);
      const score = ohR3(OH_BID_WEIGHTS.skill * skillOf(a, task) - OH_BID_WEIGHTS.hops * hops - OH_BID_WEIGHTS.load * s.load);
      return { a, score, hops, load: s.load, skill: skillOf(a, task) };
    });
    if (!bids.length) { j.waited += 1; return false; }
    for (const b of bids) emit({ type: "bid", agent: b.a.id, jobId: j.vb.id, to: siteId, bid: b.score, hops: b.hops, load: b.load, skill: b.skill });
    const best = bids.reduce((x, y) => (y.score > x.score ? y : x));
    if (bids.length > 1) m.contested += 1;
    const topSkill = Math.max(...workers.map((a) => skillOf(a, task)));
    m.awards += 1; if (best.skill === topSkill) m.awardsToBest += 1;
    j.winner = best.a.id; j.awardedOnce = true; j.awardT = t; j.bids = bids.length; m.toAward.push(t - j.queuedAt);
    state.get(best.a.id).load += 1;
    const awardE = emit({ type: "award", agent: best.a.id, by: dispatcher.id, ...factsOf(j, { bid: best.score }) });
    if (briefSaid) briefFix(best.a, awardE); // HIVE-7: the briefing's correction, when the day's first award is not what was said
    write("oh-award", `${j.vb.id} ${task} @ ${siteId} -> ${best.a.id} (bid ${best.score}, ${bids.length} bid(s))`);
    // HIVE-4: with exchanges, the dispatcher hands the job over and the winner confirms (in place of the winner's award line),
    // and the steward questions a contested winning bid from another map or from an agent already holding a job.
    const handed = exchanges ? exchange("handoff", dispatcher, best.a, factsOf(j, { bid: best.score })) : null;
    if (!handed) speak(best.a, "award", factsOf(j, { bid: best.score }));
    if (exchanges && bids.length > 1 && (best.hops >= 2 || best.load >= 1) && t - lastQuestionT >= OH_QUESTION_COOLDOWN && exchange("question", steward, best.a, factsOf(j, { bid: best.score, hops: best.hops, load: best.load, skill: best.skill }), best.hops >= 2 ? "question_far" : "question_load")) lastQuestionT = t;
    // The governor checks the winner's request (unchanged VBRIDGE negotiation). The request reaches the governor now,
    // so it carries the hive clock (one step = OH_TICK_MS, plus the job's place in the step): the per-agent rate limit
    // and the cadence feature see requests in the order they are checked. The job id was fixed at arrival.
    j.vb.request.atMs = t * OH_TICK_MS + (j.n % 60) * 1000;
    vbNegotiate(j.vb, gov);
    if (j.vb.phase === "REJECTED") {
      const reasons = j.vb.governor.reasons; const primary = j.vb.governor.primary;
      emit({ type: "refused", agent: best.a.id, ...factsOf(j, { reason: primary, by: "governor" }) });
      write("oh-refuse", `${j.vb.id} @ ${siteId}: governor refused (${reasons.join(", ")})`);
      speak(steward, "refused", factsOf(j, { reason: primary }));
      release(j);
      if (reasons.includes("physical-target") && !j.approvedSim) {
        j.status = "awaiting-approval";
        emit({ type: "approval-request", agent: keeper.id, ...factsOf(j, { reason: "physical-target", winner: best.a.id }) });
        write("oh-approval-request", `${j.vb.id} @ ${siteId}: names a physical robot; asked ${supervisor} whether to run it on the simulated robot instead`);
        speak(keeper, "approval", factsOf(j, { reason: "physical-target" }));
        const d = typeof decide === "function" ? decide({ jobId: j.vb.id, siteId, taskType: task, reasons: reasons.slice() }) : null;
        if (d === "approve") approve(j.vb.id); else if (d === "decline") decline(j.vb.id);
      } else close(j, "refused");
      return true;
    }
    const veto = ohStewardReview(steward, j.spec.request, { explain: lastExplain });
    if (veto) {
      emit({ type: "refused", agent: steward.id, ...factsOf(j, { reason: "steward-veto", veto: veto.veto, winner: best.a.id, by: "steward" }) });
      write("oh-veto", `${j.vb.id} @ ${siteId}: safety steward veto (${veto.veto}${veto.z != null ? `, payload z ${veto.z} over ${veto.limit}` : `, speed share ${veto.share} over ${veto.limit}`}); the governor had allowed it`);
      speak(steward, "veto", factsOf(j, { reason: veto.veto }));
      release(j); close(j, "vetoed");
      return true;
    }
    if (superviseAll && !j.approvedSim) { askSupervisor(j, false); return true; } // HIVE-IN-WORLD: the learner approves each job
    vbApprove(j.vb, { supervisor: j.approvedSim ? supervisor : `${supervisor} (${OH_STANDING})`, approve: true });
    const s = state.get(best.a.id); const hops = ohSiteHops(s.site, siteId, sites);
    j.status = "moving"; j.readyAt = t + hops;
    if (hops > 0) { s.site = siteId; emit({ type: "move", agent: best.a.id, ...factsOf(j, { hops }) }); speak(best.a, "move", factsOf(j)); }
    return true;
  }

  // The steward reads the governor's explanation of the check it just made (the anomaly z-scores).
  let lastExplain = null;
  const baseCheck = gov.check;
  gov.check = (cmd) => { const d = baseCheck(cmd); lastExplain = d.explain; return d; };

  function dispatch(j) {
    if (superviseAll && !j.learnerApproved && !j.approvedSim) { askSupervisor(j, true); return; } // approved before the setting: held here
    const siteId = j.spec.request.siteId; const w = roster.find((a) => a.id === j.winner);
    const holder = siteBusy.get(siteId);
    if (holder && holder !== j) {
      if (!j.siteWait) { j.siteWait = true; m.siteConflicts += 1; speak(w, "wait", factsOf(j)); }
      return;
    }
    if (j.siteWait) m.siteConflictsResolved += 1;
    // An agent holding two jobs may have walked to its other job's site meanwhile: it walks back before this one starts,
    // so a job always starts where the agent's figure stands (AGENT-AVATARS reads the move events).
    const ws = state.get(w.id);
    if (ws.site !== siteId) { const hops = ohSiteHops(ws.site, siteId, sites); ws.site = siteId; emit({ type: "move", agent: w.id, ...factsOf(j, { hops }) }); speak(w, "move", factsOf(j)); }
    // The robot lock: count what is already running at this site before this job starts (it must be zero).
    m.maxPerSite = Math.max(m.maxPerSite, 1 + stream.filter((x) => x !== j && x.status === "running" && x.spec.request.siteId === siteId).length);
    siteBusy.set(siteId, j);
    vbRun(j.vb, gov, { policyFor });
    vbEvaluate(j.vb, { note: "hive run" });
    const steps = j.vb.deliverable.episode.steps.length;
    j.status = "running"; j.runUntil = t + Math.max(1, Math.ceil(steps / 10)); j.dispatchT = t;
    emit({ type: "dispatch", agent: w.id, ...factsOf(j, { steps, simulated: true }) });
    write("oh-dispatch", `${j.vb.id} @ ${siteId}: running on the simulated robot (${steps} governor-monitored steps)`);
    speak(w, "dispatch", factsOf(j));
  }

  function complete(j) {
    const siteId = j.spec.request.siteId; const w = roster.find((a) => a.id === j.winner);
    siteBusy.delete(siteId); release(j); state.get(w.id).done += 1; j.doneT = t;
    const card = j.vb.deliverable.evalCard; const ok = j.vb.phase === "COMPLETED";
    const steps = card.steps; const score = ohR3(card.score);
    const reason = ok ? null : card.halted ? (card.halted.reason ?? card.halted.action) : (card.violations[0] ? `rule ${card.violations[0]}` : "unfinished");
    emit({ type: "complete", agent: w.id, ...factsOf(j, { ok, score, steps, ...(reason ? { reason } : {}) }) });
    write("oh-complete", `${j.vb.id} @ ${siteId}: ${ok ? "completed" : `not accepted (${reason})`}, score ${score}, ${steps} steps`);
    speak(w, ok ? "complete" : "halted", factsOf(j, { score, steps, ...(reason ? { reason } : {}) }));
    if (!ok) speak(trainer, "coach", factsOf(j, { score, steps, reason }));
    if (memory && ok) remember(w, j); // HIVE-4: the worker recalls its day from the chain (the oh-complete line above is in it)
    goHome(w); // HIVE-5: its last job done, the agent walks home (homeward only)
    close(j, ok ? "completed" : "not-accepted");
  }

  function step() {
    t += 1;
    const before = log.length;
    if (moodT) for (const c of moodT.tick(t)) emit(c); // HIVE-6: a concerned or relieved mood runs out into calm
    for (const j of stream) if (j.status === "running" && j.runUntil <= t) complete(j);
    for (const j of stream) if (j.status === "future" && j.arriveT <= t) arrive(j);
    for (const j of stream) if (j.status === "queued") award(j);
    for (const j of stream) if (j.status === "moving" && j.readyAt <= t) dispatch(j);
    return log.slice(before);
  }

  function approve(jobId) {
    const j = stream.find((x) => x.status === "awaiting-approval" && (x.vb.id === jobId || x.firstId === jobId));
    if (!j) return null;
    if (j.pendingReason === "supervise") { // HIVE-IN-WORLD: the learner approves this simulated job; it goes on from where it waited
      const siteId = j.spec.request.siteId, w = roster.find((a) => a.id === j.winner), s = state.get(j.winner);
      write("oh-approve", `${j.vb.id} @ ${siteId}: ${supervisor} approved this simulated job (supervise every job)`);
      speak(keeper, "approved", factsOf(j));
      j.pendingReason = null; j.learnerApproved = true;
      if (j.heldAtDispatch) { j.status = "moving"; j.readyAt = t; return j.vb.id; }
      vbApprove(j.vb, { supervisor, approve: true });
      const hops = ohSiteHops(s.site, siteId, sites);
      j.status = "moving"; j.readyAt = t + hops;
      if (hops > 0) { s.site = siteId; emit({ type: "move", agent: w.id, ...factsOf(j, { hops }) }); speak(w, "move", factsOf(j)); }
      return j.vb.id;
    }
    write("oh-approve", `${j.vb.id} @ ${j.spec.request.siteId}: ${supervisor} approved a SIMULATED run only (the physical path stays disabled)`);
    speak(keeper, "approved", factsOf(j));
    // Re-queued as a simulated job; it goes through the bidding and the governor again like any other job.
    j.spec = { ...j.spec, request: { ...j.spec.request, target: { kind: "sim" }, note: `${j.spec.request.note} (approved for the sim)` } };
    j.vb = vbCreateJob(j.spec); j.approvedSim = true; j.status = "queued"; j.winner = null;
    return j.vb.id;
  }
  function decline(jobId) {
    const j = stream.find((x) => x.status === "awaiting-approval" && (x.vb.id === jobId || x.firstId === jobId));
    if (!j) return null;
    if (j.pendingReason === "supervise") { release(j); j.pendingReason = null; } // the agent held the job while it waited
    emit({ type: "refused", agent: keeper.id, ...factsOf(j, { reason: "supervisor-declined", by: "supervisor" }) });
    write("oh-decline", `${j.vb.id} @ ${j.spec.request.siteId}: ${supervisor} declined; the job is closed`);
    speak(keeper, "declined", factsOf(j));
    goHome(roster.find((a) => a.id === j.winner)); // HIVE-5: an agent that had walked to a held job goes home (homeward only)
    close(j, "declined");
    return j.vb.id;
  }

  // HIVE-6: the morning briefing (briefing only; once, in the day's first minutes). Returns its speak events, or null.
  // HIVE-7: what each agent said its first job was (briefSaid); when the agent's first award after the briefing differs (a learner's
  // approval re-queued a job ahead of others, or the look-ahead's plan otherwise moved), the agent says the change in one line to
  // the dispatcher, naming the award it got and the approval since the briefing (or that the queue moved). Grounded the same way.
  let briefed = false, briefSaid = null, briefId = null;
  function briefFix(agent, award) {
    const said = briefSaid.get(agent.id);
    if (!said || said.done) return null;
    said.done = true;
    if (said.jobId === award.jobId) return null; // as briefed
    if (said.jobId === null && award.t > H6_BRIEF.lookahead) return null; // "nothing in the first N minutes" still held
    const appr = log.filter((e) => e.type === "speak" && e.about === "approved" && e.t >= said.t && e.agent === keeper?.id).pop();
    const facts = { jobId: award.jobId, to: award.to, siteName: award.siteName, said: said.jobId, toName: dispatcher.name, toAgent: dispatcher.id, ...(appr ? { approved: appr.jobId } : {}) };
    return speak(agent, appr ? "brief_fix" : "brief_fix_q", facts, { briefing: { id: briefId, fix: true, said: said.jobId } });
  }
  function brief({ lookahead = null } = {}) {
    if (!briefing || briefed || t > H6_BRIEF.window) return null;
    briefed = true;
    const ahead = lookahead ?? ohHive({ seed, agents, jobs, nJobs, ticksPerDay, decide: typeof decide === "function" ? decide : null, supervisor, mode, capacity, policyFor, say: () => "", sites, supervise: superviseAll, exchanges, memory, variety, homeward });
    const first = h6BriefFirstJobs(log, ahead, H6_BRIEF.lookahead);
    const order = [dispatcher, ...roster.filter((a) => a !== dispatcher)];
    const id = `b-${t}`, of = order.length, out = [];
    briefId = id; briefSaid = new Map();
    const firstHour = stream.filter((j) => j.arriveT <= H6_BRIEF.firstHour).length;
    order.forEach((a, turn) => {
      const meta = { briefing: { id, turn, of } };
      const to = turn === 0 ? {} : { toName: dispatcher.name, toAgent: dispatcher.id };
      let e = null;
      if (turn === 0) e = speak(a, "brief_open", { count: stream.length, first: firstHour, window: H6_BRIEF.firstHour }, meta);
      else if (a === steward) e = speak(a, "brief_steward", { count: stream.length, ...to }, meta);
      else if (a === keeper) e = speak(a, superviseAll ? "brief_keeper_sup" : "brief_keeper", { supervisor, ...to }, meta);
      else if (a === auditor) e = speak(a, "brief_auditor", { every: OH_AUDIT_EVERY, lines: chain.length, logSeq: chain.length, ...to }, meta);
      else if (first.has(a.id)) { const w = first.get(a.id); e = speak(a, "brief_first", { jobId: w.jobId, to: w.to, siteName: w.siteName, task: w.task, firstAward: { t: w.t, ahead: !!w.ahead }, ...to }, meta); }
      else e = speak(a, "brief_none", { window: H6_BRIEF.lookahead, to: a.homeSite, siteName: siteName(a.homeSite), ...to }, meta);
      if (e) out.push(e);
      if (e && (e.about === "brief_first" || e.about === "brief_none")) briefSaid.set(a.id, { jobId: e.about === "brief_first" ? e.jobId : null, t: e.t, done: !!log.some((x) => x.type === "award" && x.agent === a.id) }); // HIVE-7
    });
    return out;
  }

  function verify() {
    let prev = "genesis";
    for (let i = 0; i < chain.length; i += 1) { const l = chain[i]; if (l.seq !== i || l.prev !== prev || ohLineHash(l) !== l.hash) return { ok: false, brokenAt: i, lines: chain.length }; prev = l.hash; }
    return { ok: true, brokenAt: null, lines: chain.length };
  }

  function metrics() {
    const by = (s) => stream.filter((j) => j.status === s).length;
    const dispatched = stream.filter((j) => j.vb?.deliverable);
    return {
      mode, jobs: stream.length, ticks: t,
      completed: by("completed"), notAccepted: by("not-accepted"), refused: by("refused"), vetoed: by("vetoed"), declined: by("declined"),
      awaitingApproval: by("awaiting-approval"), unfinished: stream.filter((j) => ["future", "queued", "moving", "running"].includes(j.status)).length,
      approvalRequests: chain.filter((l) => l.action === "oh-approval-request").length, approved: chain.filter((l) => l.action === "oh-approve").length,
      meanTicksToComplete: (() => { const xs = stream.filter((j) => j.doneT != null).map((j) => j.doneT - j.arriveT); return xs.length ? ohR3(xs.reduce((a, b) => a + b, 0) / xs.length) : null; })(),
      meanTicksToAward: m.toAward.length ? ohR3(m.toAward.reduce((a, b) => a + b, 0) / m.toAward.length) : null,
      contested: m.contested, doubleAwards: (() => { const c = new Map(); for (const e of log) if (e.type === "award") c.set(e.jobId, (c.get(e.jobId) ?? 0) + 1); return [...c.values()].filter((n) => n > 1).length; })(), siteConflicts: m.siteConflicts, siteConflictsResolved: m.siteConflictsResolved, maxJobsPerRobot: m.maxPerSite,
      awardsToBestSkill: m.awardsToBest, awards: m.awards,
      dispatched: dispatched.length,
      dispatchedChecked: dispatched.filter((j) => counts.checks.get(j.vb.id) === "allow-sim").length,
      stepsMonitored: dispatched.reduce((a, j) => a + (counts.monitors.get(j.vb.id) ?? 0), 0),
      steps: dispatched.reduce((a, j) => a + j.vb.deliverable.episode.steps.length, 0),
      physicalDispatched: dispatched.filter((j) => j.vb.request.target.kind !== "sim").length,
      supervise: superviseAll, dispatchedWithoutLearner: dispatched.filter((j) => !j.learnerApproved && !j.approvedSim).length,
      ...(exchanges || memory || variety ? { exchanges: log.filter((e) => e.type === "speak" && e.exchange && e.exchange.turn === 0).length, memories: log.filter((e) => e.type === "speak" && e.memory).length } : {}),
      ...(homeward ? { homeMoves } : {}), // HIVE-5
      ...(moods ? { moodChanges: log.filter((e) => e.type === "mood").length } : {}), // HIVE-6
      lines: chain.length,
    };
  }

  return {
    agents: roster,
    step,
    run(n = 1) { const out = []; for (let i = 0; i < n; i += 1) out.push(...step()); return out; },
    on(type, fn) { if (typeof fn === "function") { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(fn); } return () => this.off(type, fn); },
    off(type, fn) { const xs = listeners.get(type); if (xs) listeners.set(type, xs.filter((f) => f !== fn)); },
    events() { return log.slice(); },
    approve, decline,
    pending() { return stream.filter((j) => j.status === "awaiting-approval").map((j) => ({ jobId: j.vb.id, to: j.spec.request.siteId, siteName: siteName(j.spec.request.siteId), task: VB_TASKS[j.spec.request.taskType]?.label ?? j.spec.request.taskType, reason: j.pendingReason ?? "physical-target" })); },
    /** HIVE-IN-WORLD: "supervise every job" on or off (an audit line and the consent keeper say so). */
    setSupervise(on) {
      const v = !!on; if (v === superviseAll) return superviseAll;
      superviseAll = v;
      write("oh-supervise", `${supervisor}: supervise every job is ${v ? "on; each governor-allowed job waits for a decision" : `off; ${OH_STANDING}`}`);
      speak(keeper, v ? "supervise_on" : "standing", { supervisor });
      return superviseAll;
    },
    supervising() { return superviseAll; },
    jobs() { return stream.map((j) => ({ n: j.n, status: j.status, jobId: j.vb?.id ?? null, firstId: j.firstId ?? null, winner: j.winner ?? null, site: j.spec.request.siteId, target: j.spec.request.target.kind, approvedSim: !!j.approvedSim, phase: j.vb?.phase ?? null, reasons: j.vb?.governor?.reasons ?? [] })); },
    metrics,
    agentState(id) { const s = state.get(id); return s ? { ...s } : null; },
    log() { return chain.map((l) => ({ ...l })); },
    verify,
    done() { return stream.every((j) => !["future", "queued", "moving", "running"].includes(j.status)); },
    governor: base,
    now() { return t; },
    talk: Object.freeze({ exchanges: !!exchanges, memory: !!memory, variety: !!variety }), // HIVE-4
    homeward: !!homeward, // HIVE-5
    moods: !!moods, briefing: !!briefing, // HIVE-6
    brief, // HIVE-6: the morning briefing (null unless briefing is on, once, in the day's first minutes)
    mood(id) { return moodT ? { mood: moodT.mood(id), cause: moodT.cause(id) } : null; }, // HIVE-6
    briefed() { return briefed; },
  };
}

/** Run a whole day and return the metrics and the events (for evals and the checker). */
export function ohHiveDay(seed = 1, opts = {}) {
  const hive = ohHive({ seed, ...opts });
  const ticks = opts.ticksPerDay ?? 480;
  for (let i = 0; i < ticks; i += 1) hive.step();
  return { hive, metrics: hive.metrics(), events: hive.events() };
}
