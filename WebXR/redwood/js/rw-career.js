// Redwood Reach — the learner's progress in this world: visited sites, quest
// steps, found field tins, finished field lessons, activity bests, cosmetics.
// Pure over a Storage-shaped object (the profile's own store in the game,
// a plain object in tools/check_redwood.mjs). No three.js, no DOM.

import { RW_MAIN_ARC, RW_SIDE_QUESTS, RW_ACTIVITIES } from "./rw-data.js";
import { RW_EGGS } from "./rw-lore-data.js";
import { qmMissing } from "../../shared/skill-gates.js";

export const RW_CAREER_KEY = "redwood-career-v1";

export function rwFresh() {
  return { v: 1, xp: 0, visited: [], quests: {}, found: [], lessons: [], activities: {}, cosmetics: [], badges: [] };
}
export function rwLoad(store) {
  try { const s = JSON.parse(store?.getItem(RW_CAREER_KEY) ?? "null"); if (s?.v === 1) return { ...rwFresh(), ...s }; } catch (_) { /* fresh below */ }
  return rwFresh();
}
export function rwSave(store, state) { try { store?.setItem(RW_CAREER_KEY, JSON.stringify(state)); } catch (_) { /* private mode */ } return state; }

/**
 * The shared gate contract (shared/skill-gates.js). Station and K-12
 * requirements are answered by `done(id)` — the app passes the shared
 * engine's predicate, the headless checker a plain function — and any
 * programme or quest requirement is answered by the engine itself from the
 * learner's profile.
 */
export function rwGateMissing(gate, done) {
  if (!gate) return [];
  const out = [...(gate.stations ?? []), ...(gate.k12 ?? [])].filter((id) => !done(id));
  if (gate.programmes?.length || gate.quests?.length) for (const m of qmMissing({ programmes: gate.programmes ?? [], quests: gate.quests ?? [] })) out.push(m.id);
  return out;
}
export function rwGateOpen(gate, done) { return rwGateMissing(gate, done).length === 0; }

const rwAll = () => [...RW_MAIN_ARC, ...RW_SIDE_QUESTS];
export function rwQuest(id) { return rwAll().find((q) => q.id === id) ?? null; }

/** A quest's status: "locked" | "open" | "active" | "done". */
export function rwQuestStatus(state, q, done) {
  const p = state.quests[q.id];
  if (p?.done) return "done";
  if (q.requires && !state.quests[q.requires]?.done) return "locked";
  if (!rwGateOpen(q.gate, done)) return "locked";
  return p ? "active" : "open";
}

/** The current main-arc quest (first not done) and its step. */
export function rwCurrentObjective(state, done) {
  for (const q of RW_MAIN_ARC) {
    if (state.quests[q.id]?.done) continue;
    if (rwQuestStatus(state, q, done) === "locked") return null;
    const i = state.quests[q.id]?.step ?? 0;
    return { quest: q, index: i, step: q.steps[i] };
  }
  return null;
}

/**
 * Feed one event into every open quest: { type: "goto", site } | { type:
 * "station", station } | { type: "activity", activity } | { type: "find", egg }.
 * Returns the list of quests completed by this event.
 */
export function rwAdvance(state, ev, done) {
  const finished = [];
  for (const q of rwAll()) {
    const st = rwQuestStatus(state, q, done);
    if (st === "locked" || st === "done") continue;
    const p = state.quests[q.id] ?? { step: 0 };
    const step = q.steps[p.step];
    if (!step || step.type !== ev.type) continue;
    const match = (ev.type === "goto" && step.site === ev.site) || (ev.type === "station" && step.station === ev.station)
      || (ev.type === "activity" && step.activity === ev.activity) || (ev.type === "find" && step.egg === ev.egg);
    if (!match) continue;
    p.step += 1;
    if (p.step >= q.steps.length) {
      p.done = true;
      state.xp += q.reward?.xp ?? 0;
      if (q.reward?.badge && !state.badges.includes(q.reward.badge)) state.badges.push(q.reward.badge);
      if (q.reward?.cosmetic && !state.cosmetics.includes(q.reward.cosmetic)) state.cosmetics.push(q.reward.cosmetic);
      finished.push(q);
    }
    state.quests[q.id] = p;
  }
  return finished;
}

export function rwVisit(state, siteId) {
  if (!state.visited.includes(siteId)) { state.visited.push(siteId); return true; }
  return false;
}

/** Record a field tin; returns { fresh, setDone } — a site's whole set earns its badge. */
export function rwFind(state, eggId) {
  const egg = RW_EGGS.find((e) => e.id === eggId);
  if (!egg || state.found.includes(eggId)) return { fresh: false, setDone: false, egg };
  state.found.push(eggId);
  state.xp += egg.reward?.xp ?? 0;
  const set = RW_EGGS.filter((e) => e.set === egg.set);
  const setDone = set.every((e) => state.found.includes(e.id));
  if (setDone) { const badge = `Field Tins — ${egg.set}`; if (!state.badges.includes(badge)) state.badges.push(badge); }
  return { fresh: true, setDone, egg };
}

/** Score an activity run: `answers` is one chosen option index per waypoint, in order. */
export function rwScoreActivity(activityId, answers) {
  const a = RW_ACTIVITIES.find((x) => x.id === activityId);
  if (!a) throw new Error(`no activity ${activityId}`);
  const correct = a.waypoints.reduce((n, w, i) => n + (answers[i] === w.answer ? 1 : 0), 0);
  return { correct, total: a.waypoints.length, score: Math.round((100 * correct) / a.waypoints.length) };
}
export function rwRecordActivity(state, activityId, score) {
  const prev = state.activities[activityId]?.best ?? -1;
  state.activities[activityId] = { best: Math.max(prev, score), runs: (state.activities[activityId]?.runs ?? 0) + 1 };
  if (score >= prev) state.xp += 50;
  return state.activities[activityId];
}
