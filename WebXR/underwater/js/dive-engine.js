// The Deep — the dive engine: the small generic machine that runs whatever
// dives.js registers — step types, progress, persistence and two events —
// so the dive data only ever describes a dive, never drives one. Pure: no
// three.js, no DOM (storage-injectable), so tools/check_underwater_game.mjs
// runs every rule here with no renderer. Mirrors bayworld/js/quest-engine.js.
//
// A dive: { id, title, giver, site, kind: "main"|"side"|"egg",
//   steps: [{ type: "goto"|"station"|"find"|"rov"|"talk", target, text }],
//   reward: { reputation, credits } }.
//
// A step completes when dvAdvanceDives() is handed a world snapshot that
// satisfies it:
//   goto    — the diver is within DV_GOTO_RADIUS of `target` (an [x,z] point,
//             or a site/landmark id resolved against `places`).
//   find    — the same proximity test, but only on an explicit interact —
//             swimming past a lantern never finds it, stopping to look does.
//   talk    — proximity plus an explicit interact, the shape of find, kept as
//             its own type because a dive reads better naming who it is with.
//   rov     — proximity to `target` while snapshot.inRov is true and the ROV
//             is moving at least DV_ROV_MIN_SPEED.
//   station — completes from a mission return: dvNoteStationReturn(simId)
//             once dive-career.js's dvCollectDiveReturns() reports a fresh
//             attempt at that step's target station.

const DV_DIVES_KEY = "underwater-dives-v1";
export const DV_GOTO_RADIUS = 12;
export const DV_ROV_MIN_SPEED = 1;

let dvDives = new Map();
let dvStepListeners = [];
let dvDoneListeners = [];

function dvDiveStorage(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage ?? null; } catch (_) { return null; }
}

function dvLoadState(storage) {
  try {
    const raw = JSON.parse(dvDiveStorage(storage)?.getItem(DV_DIVES_KEY) || "null");
    return raw && typeof raw === "object" && raw.byId ? raw : { byId: {} };
  } catch (_) { return { byId: {} }; }
}
function dvSaveState(state, storage) {
  try { dvDiveStorage(storage)?.setItem(DV_DIVES_KEY, JSON.stringify(state)); } catch (_) { /* private mode */ }
}

function dvEntryFor(state, id) {
  if (!state.byId[id]) state.byId[id] = { stepIndex: 0, done: false, startedAt: new Date().toISOString(), doneAt: null };
  return state.byId[id];
}

export const DV_STEP_TYPES = ["goto", "station", "find", "rov", "talk"];

/** Register one or more dives. Re-registering an id replaces its definition
 *  without touching progress. Validates the shape so a malformed entry fails
 *  loudly at registration rather than silently at play. */
export function dvRegisterDives(list) {
  for (const q of Array.isArray(list) ? list : [list]) {
    if (!q || typeof q.id !== "string" || !q.id) throw new Error("a dive needs a string id");
    if (!Array.isArray(q.steps) || !q.steps.length) throw new Error(`dive "${q.id}" needs at least one step`);
    for (const step of q.steps) {
      if (!DV_STEP_TYPES.includes(step.type)) throw new Error(`dive "${q.id}" has an unknown step type: ${step.type}`);
    }
    dvDives.set(q.id, q);
  }
}

/** Every registered dive's definition, insertion order. */
export function dvRegisteredDives() { return [...dvDives.values()]; }

/** Clears every registration — the checker's, never the app's. */
export function dvClearDives() { dvDives = new Map(); }

export function dvOnDiveStep(cb) { dvStepListeners.push(cb); return () => { dvStepListeners = dvStepListeners.filter((f) => f !== cb); }; }
export function dvOnDiveDone(cb) { dvDoneListeners.push(cb); return () => { dvDoneListeners = dvDoneListeners.filter((f) => f !== cb); }; }

/** The persisted dive state: every registered dive with its own progress. */
export function dvDiveState(storage) {
  const raw = dvLoadState(storage);
  return [...dvDives.values()].map((q) => {
    const entry = raw.byId[q.id] ?? { stepIndex: 0, done: false };
    return {
      id: q.id, title: q.title, giver: q.giver, site: q.site, kind: q.kind ?? "side",
      stepIndex: entry.stepIndex | 0, totalSteps: q.steps.length,
      currentStep: entry.done ? null : q.steps[entry.stepIndex | 0] ?? null,
      done: !!entry.done, startedAt: entry.startedAt ?? null, doneAt: entry.doneAt ?? null,
    };
  });
}

/** `fallback` is a dive's own `.anchor` — a plain [x, z] dives-select.js
 *  sets when a step's target names no place (a giver, a lantern's own
 *  "dv-egg-…" id): the step still happens SOMEWHERE, at the dive's site. */
function dvPointOf(target, places, fallback = null) {
  if (Array.isArray(target)) return target;
  const hit = places?.find((p) => p.id === target);
  if (hit) return hit.position ? [hit.position[0], hit.position[2]] : hit.center;
  return fallback;
}

function dvNear(player, target, places, radius, fallback) {
  const p = dvPointOf(target, places, fallback);
  if (!p || !player) return false;
  return Math.hypot(player.x - p[0], player.z - p[1]) <= radius;
}

function dvFireStep(quest, entry) { for (const cb of dvStepListeners) cb({ diveId: quest.id, dive: quest, stepIndex: entry.stepIndex, done: entry.done }); }
function dvFireDone(quest) { for (const cb of dvDoneListeners) cb({ diveId: quest.id, dive: quest, reward: quest.reward ?? null }); }

/**
 * Advances every active, non-"station" step against one snapshot:
 * `{ player: { x, z }, places, interact, inRov, speed }`. Returns the ids of
 * dives that completed a step (one step per dive per call, in order).
 */
export function dvAdvanceDives(snapshot, { storage } = {}) {
  const state = dvLoadState(storage);
  const advanced = [];
  for (const quest of dvDives.values()) {
    const entry = dvEntryFor(state, quest.id);
    if (entry.done) continue;
    const step = quest.steps[entry.stepIndex];
    if (!step || step.type === "station") continue;
    let hit = false;
    if (step.type === "goto") hit = dvNear(snapshot.player, step.target, snapshot.places, DV_GOTO_RADIUS, quest.anchor);
    else if (step.type === "find" || step.type === "talk") hit = !!snapshot.interact && dvNear(snapshot.player, step.target, snapshot.places, DV_GOTO_RADIUS, quest.anchor);
    else if (step.type === "rov") hit = !!snapshot.inRov && (snapshot.speed ?? 0) >= DV_ROV_MIN_SPEED && dvNear(snapshot.player, step.target, snapshot.places, DV_GOTO_RADIUS * 1.5, quest.anchor);
    if (!hit) continue;
    dvStepComplete(state, quest, entry);
    advanced.push(quest.id);
  }
  dvSaveState(state, storage);
  return advanced;
}

function dvStepComplete(state, quest, entry) {
  entry.stepIndex += 1;
  if (entry.stepIndex >= quest.steps.length) {
    entry.done = true;
    entry.doneAt = new Date().toISOString();
    dvFireDone(quest);
  } else {
    dvFireStep(quest, entry);
  }
}

/** The "station" step's own advance path: one call per fresh mission return,
 *  by site id or station id; every dive waiting on that target advances. */
export function dvNoteStationReturn(siteIdOrSimId, { storage } = {}) {
  const state = dvLoadState(storage);
  const advanced = [];
  for (const quest of dvDives.values()) {
    const entry = dvEntryFor(state, quest.id);
    if (entry.done) continue;
    const step = quest.steps[entry.stepIndex];
    if (!step || step.type !== "station") continue;
    if (step.target !== siteIdOrSimId) continue;
    dvStepComplete(state, quest, entry);
    advanced.push(quest.id);
  }
  dvSaveState(state, storage);
  return advanced;
}

/** Used by the checker only — a fresh dive state with no progress. */
export function dvResetDiveState(storage) { try { dvDiveStorage(storage)?.removeItem(DV_DIVES_KEY); } catch (_) { /* ignore */ } }
