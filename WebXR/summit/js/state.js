// Sierra Summit — the headless game state: the learner's summit ledger
// (visited sites, found notes, lessons passed, quests done, activity bests),
// the skill-gate answers, quest progress and the two activities' scoring.
// No three.js and no DOM: tools/check_summit.mjs drives it directly.
//
// Gates follow the frontier brief's contract. QUESTMASTER's shared engine
// (shared/skill-gates.js) had not landed when this was written, so
// smGateMissing() answers the same question from the passport directly; when
// that engine lands, swap the body for its isOpen()/missing() — the call
// sites stay the same.

import { SM_EGGS, SM_FIELD_LESSONS, SM_MAIN_QUESTS, SM_SIDE_QUESTS, SM_ACTIVITIES, SM_SITES, SM_TRAILS, smPolyDistance } from "../../shared/summit-data.js";
import { ppCompleted, ppProgramme } from "../../shared/passport.js";
import { gtStorage } from "../../shared/profiles.js";

export const SM_STORE_KEY = "summit-v1";

export function smBlank() { return { visited: ["valley-base"], eggs: [], lessons: [], quests: [], acts: {} }; }

export function smLoad(store = gtStorage()) {
  try {
    const raw = JSON.parse(store?.getItem(SM_STORE_KEY) || "null");
    if (!raw || typeof raw !== "object") return smBlank();
    const b = smBlank();
    for (const k of ["visited", "eggs", "lessons", "quests"]) if (Array.isArray(raw[k])) b[k] = [...new Set([...b[k], ...raw[k].filter((x) => typeof x === "string")])];
    if (raw.acts && typeof raw.acts === "object") b.acts = raw.acts;
    return b;
  } catch { return smBlank(); }
}

export function smSave(state, store = gtStorage()) { try { store?.setItem(SM_STORE_KEY, JSON.stringify(state)); } catch { /* private mode */ } }

/** The ids in a gate the learner has not yet completed, each { kind, id }. */
export function smGateMissing(gate, state = smBlank(), done = ppCompleted) {
  if (!gate) return [];
  const out = [];
  for (const id of gate.stations ?? []) if (!done(id)) out.push({ kind: "station", id });
  for (const id of gate.k12 ?? []) if (!done(id)) out.push({ kind: "k12", id });
  for (const p of gate.programmes ?? []) {
    let stars = 0; try { stars = ppProgramme(p.id)?.stars ?? 0; } catch { stars = 0; }
    if (stars < (p.minStars ?? 1)) out.push({ kind: "programme", id: p.id });
  }
  for (const id of gate.quests ?? []) if (!state.quests.includes(id)) out.push({ kind: "quest", id });
  return out;
}

export function smGateOpen(gate, state, done) { return smGateMissing(gate, state, done).length === 0; }

/** The current main-arc quest (the first not done whose `requires` is done), or null when the arc is finished. */
export function smCurrentMain(state) {
  return SM_MAIN_QUESTS.find((q) => !state.quests.includes(q.id) && (!q.requires || state.quests.includes(q.requires))) ?? null;
}

/** Is one quest step satisfied by the ledger and the passport? */
export function smStepDone(step, state, done = ppCompleted) {
  if (step.type === "goto") return state.visited.includes(step.target);
  if (step.type === "station") return done(step.target);
  if (step.type === "find") return state.eggs.includes(step.target);
  return false;
}

/** Mark every quest whose steps are all satisfied (and whose gate and prerequisite are open). Returns the newly completed ids. */
export function smAdvanceQuests(state, done = ppCompleted) {
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

export function smFindEgg(state, eggId, done = ppCompleted) {
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

/** Record a finished run's score as the best if it beats the old one. */
export function smActFinish(state, run) {
  if (!run?.done) return false;
  const a = SM_ACTIVITIES.find((v) => v.id === run.id);
  if (a.kind === "orienteering") run.score += a.scoring.signOut;
  const best = state.acts[run.id]?.best ?? -Infinity;
  if (run.score > best) { state.acts[run.id] = { best: run.score, seconds: Math.round(run.t) }; return true; }
  return false;
}
