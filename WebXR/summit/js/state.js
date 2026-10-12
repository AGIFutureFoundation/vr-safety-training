// Sierra Summit — the headless game state: the learner's summit ledger
// (visited sites, found notes, lessons passed, quests done, activity bests),
// the skill-gate answers, quest progress and the two activities' scoring.
// No three.js and no DOM: tools/check_summit.mjs drives it directly.
//
// Gates follow the frontier brief's contract and are answered by
// QUESTMASTER's shared engine (shared/skill-gates.js): smGateMissing() builds
// one of its snapshots (stars per station and finished quests from the
// learner's stores) and adds this world's own finished quests, then asks
// qmMissing(). The call sites are unchanged from the first phase. For the
// headless checker, `done` may be a function id -> boolean instead of a
// store: the snapshot is then built by probing every id the gate names.

import {
  SM_EGGS, SM_FIELD_LESSONS, SM_MAIN_QUESTS, SM_SIDE_QUESTS, SM_ACTIVITIES, SM_SITES, SM_TRAILS, SM_RIDES, SM_PASS_ROAD, SM_ROAD_LENGTH,
  smPolyDistance, smPlace, smRoadGradeAt,
} from "../../shared/summit-data.js";
import { ppCompleted } from "../../shared/passport.js";
import { gtStorage } from "../../shared/profiles.js";
import { qmMissing, qmCachedSnapshot, qmNameQuests } from "../../shared/skill-gates.js";
import { PP_PROGRAMMES } from "../../shared/passport-programmes.js";

qmNameQuests([...SM_MAIN_QUESTS, ...SM_SIDE_QUESTS]);

export const SM_STORE_KEY = "summit-v1";

export function smBlank() { return { visited: ["valley-base"], eggs: [], lessons: [], quests: [], rides: [], acts: {} }; }

export function smLoad(store = gtStorage()) {
  try {
    const raw = JSON.parse(store?.getItem(SM_STORE_KEY) || "null");
    if (!raw || typeof raw !== "object") return smBlank();
    const b = smBlank();
    for (const k of ["visited", "eggs", "lessons", "quests", "rides"]) if (Array.isArray(raw[k])) b[k] = [...new Set([...b[k], ...raw[k].filter((x) => typeof x === "string")])];
    if (raw.acts && typeof raw.acts === "object") b.acts = raw.acts;
    return b;
  } catch { return smBlank(); }
}

export function smSave(state, store = gtStorage()) { try { store?.setItem(SM_STORE_KEY, JSON.stringify(state)); } catch { /* private mode */ } }

/**
 * A skill-gate snapshot for this world: QUESTMASTER's (best stars per
 * station, finished quests and side games) plus the quests finished in this
 * ledger. `done` is null for the live stores, or a probe function for the
 * checker; `gate` says which ids a probe must answer for.
 */
export function smSnapshot(state = smBlank(), done = null, gate = null) {
  let snap;
  if (typeof done === "function") {
    snap = { stars: new Map(), questsDone: new Set() };
    const ids = [...(gate?.stations ?? []), ...(gate?.k12 ?? [])];
    for (const p of gate?.programmes ?? []) ids.push(...(PP_PROGRAMMES[p.id]?.stations ?? []));
    for (const id of ids) if (done(id)) snap.stars.set(id, 1);
  } else {
    const live = qmCachedSnapshot();
    snap = { stars: new Map(live.stars), questsDone: new Set(live.questsDone) };
  }
  for (const id of state?.quests ?? []) snap.questsDone.add(id);
  return snap;
}

/** The requirements in a gate the learner has not yet met, QUESTMASTER's rows: each { kind, id, label, detail? }. */
export function smGateMissing(gate, state = smBlank(), done = null) {
  if (!gate) return [];
  return qmMissing(gate, smSnapshot(state, done, gate));
}

export function smGateOpen(gate, state, done = null) { return smGateMissing(gate, state, done).length === 0; }

/** The current main-arc quest (the first not done whose `requires` is done), or null when the arc is finished. */
export function smCurrentMain(state) {
  return SM_MAIN_QUESTS.find((q) => !state.quests.includes(q.id) && (!q.requires || state.quests.includes(q.requires))) ?? null;
}

/** Is one quest step satisfied by the ledger and the passport? */
export function smStepDone(step, state, done = null) {
  if (step.type === "goto") return state.visited.includes(step.target);
  if (step.type === "station") return (done ?? ppCompleted)(step.target);
  if (step.type === "find") return state.eggs.includes(step.target);
  if (step.type === "ride") return (state.rides ?? []).includes(step.target);
  return false;
}

/** Mark every quest whose steps are all satisfied (and whose gate and prerequisite are open). Returns the newly completed ids. */
export function smAdvanceQuests(state, done = null) {
  const fresh = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const q of [...SM_MAIN_QUESTS, ...SM_SIDE_QUESTS]) {
      if (state.quests.includes(q.id)) continue;
      if (q.requires && !state.quests.includes(q.requires)) continue;
      if (q.gate && !smGateOpen(q.gate, state, done)) continue;
      if (q.steps.every((s) => smStepDone(s, state, done))) { state.quests.push(q.id); fresh.push(q.id); changed = true; }
    }
  }
  return fresh;
}

export function smVisit(state, siteId) {
  if (!SM_SITES.some((s) => s.id === siteId) && !siteId) return false;
  if (state.visited.includes(siteId)) return false;
  state.visited.push(siteId); return true;
}

export function smFindEgg(state, eggId, done = null) {
  const egg = SM_EGGS.find((e) => e.id === eggId);
  if (!egg || state.eggs.includes(eggId)) return { ok: false, egg };
  if (egg.gate && !smGateOpen(egg.gate, state, done)) return { ok: false, locked: true, egg };
  state.eggs.push(eggId); return { ok: true, egg };
}

export function smAnswerLesson(state, lessonId, choice) {
  const l = SM_FIELD_LESSONS.find((x) => x.id === lessonId);
  if (!l) return { ok: false };
  const right = choice === l.check.answer;
  if (right && !state.lessons.includes(lessonId)) state.lessons.push(lessonId);
  return { ok: right, lesson: l };
}

// ------------------------------------------------------------- activities

/** A fresh run of one activity. */
export function smActStart(actId) {
  const a = SM_ACTIVITIES.find((x) => x.id === actId);
  if (!a) return null;
  return { id: a.id, kind: a.kind, next: 0, score: 0, mapChecks: 0, offTrail: 0, zoneHits: 0, buddy: 0, t: 0, done: false, log: [] };
}

/**
 * Step a run with the player's position. Safe practice scores: reaching a
 * control or survey point, a map check or buddy check at it; leaving the
 * trail or entering a marked zone costs points. Returns the run.
 */
export function smActStep(run, x, z, dt, { mapOpen = false, radioed = false } = {}) {
  if (!run) return run;
  if (run.done) {
    if (run.pendingCheck && (mapOpen || radioed)) { const a0 = SM_ACTIVITIES.find((v) => v.id === run.id); run.score += a0.kind === "orienteering" ? a0.scoring.mapCheck : a0.scoring.buddyCheck; if (a0.kind === "orienteering") run.mapChecks++; else run.buddy++; run.pendingCheck = false; }
    return run;
  }
  const a = SM_ACTIVITIES.find((v) => v.id === run.id);
  run.t += dt;
  const targets = a.kind === "orienteering" ? a.controls : a.points;
  const [tx, tz] = targets[run.next] ?? [];
  if (a.kind === "orienteering") {
    const trail = SM_TRAILS.find((t) => t.id === a.trail);
    const off = smPolyDistance(x, z, trail.pts).d > a.offTrailMetres;
    if (off) { run.offTrail += dt; if (run.offTrail >= 1) { run.offTrail -= 1; run.score -= a.scoring.offTrailPenalty; run.log.push("off trail"); } }
    if (tx !== undefined && Math.hypot(x - tx, z - tz) < 14) { run.score += a.scoring.control; run.log.push(`control ${run.next + 1}`); run.next++; run.pendingCheck = true; }
    if (run.pendingCheck && mapOpen) { run.score += a.scoring.mapCheck; run.mapChecks++; run.pendingCheck = false; }
  } else {
    for (const zn of a.avoid) {
      const inside = Math.hypot(x - zn.at[0], z - zn.at[1]) < zn.r;
      const key = `in:${zn.at.join(",")}`;
      if (inside && !run[key]) { run.score -= a.scoring.zoneEntryPenalty; run.zoneHits++; run.log.push(zn.note); }
      run[key] = inside;
    }
    if (tx !== undefined && Math.hypot(x - tx, z - tz) < 14) { run.score += a.scoring.point; run.log.push(`point ${run.next + 1}`); run.next++; run.pendingCheck = true; }
    if (run.pendingCheck && radioed) { run.score += a.scoring.buddyCheck; run.buddy++; run.pendingCheck = false; }
  }
  if (run.next >= targets.length && !run.pendingCheck) run.done = true;
  else if (run.next >= targets.length) run.done = true;
  return run;
}

// ------------------------------------------------------------------- rides

/** Metres along the pass road of a site or landmark (the nearest point of the road to it). */
export function smRoadMetresOf(placeId) {
  const p = smPlace(placeId);
  return p ? smPolyDistance(p.at[0], p.at[1], SM_PASS_ROAD).t * SM_ROAD_LENGTH : 0;
}

/** How long the pickup waits at the pull-out (seconds), the window for setting the engine brake there. */
export const SM_RIDE_STOP_SECONDS = 6;

/**
 * A fresh ride: the pickup at the boarding site's road metres, facing the
 * destination. Phases: climb → stopped (the pull-out) → descent → done.
 */
export function smRideStart(rideId) {
  const r = SM_RIDES.find((x) => x.id === rideId);
  if (!r) return null;
  const d0 = smRoadMetresOf(r.from), d1 = smRoadMetresOf(r.to), stop = smRoadMetresOf(r.stopAt);
  return { id: r.id, d: d0, from: d0, to: d1, stop, dir: d1 >= d0 ? 1 : -1, phase: "climb", brake: false, brakeAt: null, stopT: 0, t: 0, score: 0, grade: 0, log: [], done: false };
}

/**
 * Step a ride by dt seconds; `brake` is true on the frame the learner sets the
 * engine brake. Safe practice scores: the brake set at the pull-out is worth
 * the most, set late on the grade less, never set costs more than arriving
 * earns. Speed is never scored. Returns the run.
 */
export function smRideStep(run, dt, { brake = false } = {}) {
  if (!run || run.done) return run;
  const r = SM_RIDES.find((x) => x.id === run.id);
  run.t += dt;
  if (brake && !run.brake) {
    run.brake = true; run.brakeAt = run.phase === "descent" ? "late" : "pullout";
    run.score += run.brakeAt === "late" ? r.scoring.brakeLate : r.scoring.brakeAtPullout;
    run.log.push(run.brakeAt === "late" ? "engine brake set on the grade" : "engine brake set at the pull-out");
  }
  if (run.phase === "climb") {
    run.d += run.dir * r.speed * dt;
    if ((run.dir > 0 && run.d >= run.stop) || (run.dir < 0 && run.d <= run.stop)) { run.d = run.stop; run.phase = "stopped"; run.log.push("pull-out"); }
  } else if (run.phase === "stopped") {
    run.stopT += dt;
    if (run.stopT >= SM_RIDE_STOP_SECONDS) { run.phase = "descent"; run.log.push("down the grade"); }
  } else if (run.phase === "descent") {
    run.d += run.dir * r.speed * dt;
    if ((run.dir > 0 && run.d >= run.to) || (run.dir < 0 && run.d <= run.to)) {
      run.d = run.to; run.phase = "done"; run.done = true;
      run.score += r.scoring.arrive;
      if (!run.brake) { run.score += r.scoring.noBrake; run.log.push("arrived with no engine brake"); } else run.log.push("arrived");
    }
  }
  run.grade = smRoadGradeAt(run.d / SM_ROAD_LENGTH) * run.dir;
  return run;
}

/** Close a finished ride: the quest step is satisfied only when the engine brake went on at the pull-out (safe practice). Returns whether it passed. */
export function smRideFinish(state, run) {
  if (!run?.done) return false;
  const passed = run.brakeAt === "pullout";
  if (passed && !(state.rides ??= []).includes(run.id)) state.rides.push(run.id);
  return passed;
}

/** Record a finished run's score as the best if it beats the old one. */
export function smActFinish(state, run) {
  if (!run?.done) return false;
  const a = SM_ACTIVITIES.find((v) => v.id === run.id);
  if (a.kind === "orienteering") run.score += a.scoring.signOut;
  const best = state.acts[run.id]?.best ?? -Infinity;
  if (run.score > best) { state.acts[run.id] = { best: run.score, seconds: Math.round(run.t) }; return true; }
  return false;
}
