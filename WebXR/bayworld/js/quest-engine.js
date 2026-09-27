// Bay World — the quest engine.
//
// Team BAY3 is writing WebXR/bayworld/js/quests.js: the quest data and its
// own rules (a giver, a site, a reward). This module is the small, generic
// machine that runs whatever quest.js registers — step types, progress,
// persistence and the two events — so quests.js only ever has to describe a
// quest, never drive one. Pure: no three.js, no DOM (localStorage only, and
// storage-injectable), so tools/check_bayworld_game.mjs runs every rule here
// with no renderer.
//
// A quest: { id, title, giver, site, kind: "main"|"side"|"egg",
//   steps: [{ type: "goto"|"station"|"find"|"drive"|"talk", target, text }],
//   reward: { reputation, credits, unlock } }.
//
// A step completes when bwAdvanceQuests() is handed a world snapshot that
// satisfies it:
//   goto    — the player is within BW_GOTO_RADIUS of `target` (a [x,z] point,
//             or a site/landmark id this engine resolves against `places`).
//   find    — the same proximity test as goto, but only counts on an explicit
//             interact (snapshot.interact === true) — so walking past a
//             thing never finds it, only stopping to look does.
//   talk    — proximity to `target` (a giver's own site/landmark id) plus an
//             explicit interact, the same shape as find, kept as its own
//             type because a quest reads better naming who a step is with.
//   drive   — proximity to `target` while snapshot.inVehicle is true and
//             snapshot.speed is at least BW_DRIVE_MIN_SPEED.
//   station — completes not from position but from a mission return: call
//             bwNoteStationReturn(questId, simId) once career.js's own
//             bwCollectMissionReturns() reports a fresh attempt at that step's
//             target station id.

const BW_QUEST_KEY = "bayworld-quests-v1";
export const BW_GOTO_RADIUS = 12;
export const BW_DRIVE_MIN_SPEED = 3;

let bwQuests = new Map();
let bwStepListeners = [];
let bwDoneListeners = [];

function bwQuestStorage(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage ?? null; } catch (_) { return null; }
}

function bwLoadState(storage) {
  try {
    const raw = JSON.parse(bwQuestStorage(storage)?.getItem(BW_QUEST_KEY) || "null");
    return raw && typeof raw === "object" && raw.byId ? raw : { byId: {} };
  } catch (_) { return { byId: {} }; }
}
function bwSaveState(state, storage) {
  try { bwQuestStorage(storage)?.setItem(BW_QUEST_KEY, JSON.stringify(state)); } catch (_) { /* private mode */ }
}

function bwEntryFor(state, id) {
  if (!state.byId[id]) state.byId[id] = { stepIndex: 0, done: false, startedAt: new Date().toISOString(), doneAt: null };
  return state.byId[id];
}

/** Register one or more quests (BAY3's quests.js calls this with its own
 *  list). Registering the same id again replaces that quest's definition
 *  without touching any progress already made on it. Validates the shape a
 *  quest must have so a malformed entry fails loudly at registration rather
 *  than silently at play. */
export function registerQuests(list) {
  for (const q of Array.isArray(list) ? list : [list]) {
    if (!q || typeof q.id !== "string" || !q.id) throw new Error("a quest needs a string id");
    if (!Array.isArray(q.steps) || !q.steps.length) throw new Error(`quest "${q.id}" needs at least one step`);
    for (const step of q.steps) {
      if (!["goto", "station", "find", "drive", "talk"].includes(step.type)) {
        throw new Error(`quest "${q.id}" has an unknown step type: ${step.type}`);
      }
    }
    bwQuests.set(q.id, q);
  }
}

/** Every registered quest's own definition, insertion order. */
export function registeredQuests() { return [...bwQuests.values()]; }

/** Clears every registration — used by the checker between runs, never by
 *  the app itself. */
export function bwClearQuests() { bwQuests = new Map(); }

export function onQuestStep(cb) { bwStepListeners.push(cb); return () => { bwStepListeners = bwStepListeners.filter((f) => f !== cb); }; }
export function onQuestDone(cb) { bwDoneListeners.push(cb); return () => { bwDoneListeners = bwDoneListeners.filter((f) => f !== cb); }; }

/**
 * The full, persisted quest state: every registered quest with its own
 * progress — `{ id, title, kind, stepIndex, totalSteps, currentStep, done }`.
 * A quest never registered yet by the time this is read simply does not
 * appear until it is.
 */
export function questState(storage) {
  const raw = bwLoadState(storage);
  return [...bwQuests.values()].map((q) => {
    const entry = raw.byId[q.id] ?? { stepIndex: 0, done: false };
    return {
      id: q.id, title: q.title, giver: q.giver, site: q.site, kind: q.kind ?? "side",
      stepIndex: entry.stepIndex | 0, totalSteps: q.steps.length,
      currentStep: entry.done ? null : q.steps[entry.stepIndex | 0] ?? null,
      done: !!entry.done, startedAt: entry.startedAt ?? null, doneAt: entry.doneAt ?? null,
    };
  });
}

function bwPointOf(target, places) {
  if (Array.isArray(target)) return target;
  const hit = places?.find((p) => p.id === target);
  return hit ? (hit.position ? [hit.position[0], hit.position[2]] : hit.center) : null;
}

function bwNear(player, target, places, radius) {
  const p = bwPointOf(target, places);
  if (!p || !player) return false;
  return Math.hypot(player.x - p[0], player.z - p[1]) <= radius;
}

function bwFireStep(quest, entry) { for (const cb of bwStepListeners) cb({ questId: quest.id, quest, stepIndex: entry.stepIndex, done: entry.done }); }
function bwFireDone(quest, entry) { for (const cb of bwDoneListeners) cb({ questId: quest.id, quest, reward: quest.reward ?? null }); }

/**
 * Advances every active, non-"station" step against one world snapshot:
 * `{ player: { x, z }, places: [...BAY_SITES, ...BAY_LANDMARKS], interact,
 * inVehicle, speed }`. Returns the ids of quests that completed a step this
 * call (a quest can only ever complete one step per call, in step order).
 */
export function bwAdvanceQuests(snapshot, { storage } = {}) {
  const state = bwLoadState(storage);
  const advanced = [];
  for (const quest of bwQuests.values()) {
    const entry = bwEntryFor(state, quest.id);
    if (entry.done) continue;
    const step = quest.steps[entry.stepIndex];
    if (!step || step.type === "station") continue; // station steps only move via bwNoteStationReturn
    let hit = false;
    if (step.type === "goto") hit = bwNear(snapshot.player, step.target, snapshot.places, BW_GOTO_RADIUS);
    else if (step.type === "find" || step.type === "talk") hit = !!snapshot.interact && bwNear(snapshot.player, step.target, snapshot.places, BW_GOTO_RADIUS);
    else if (step.type === "drive") hit = !!snapshot.inVehicle && (snapshot.speed ?? 0) >= BW_DRIVE_MIN_SPEED && bwNear(snapshot.player, step.target, snapshot.places, BW_GOTO_RADIUS * 1.5);
    if (!hit) continue;
    bwStepComplete(state, quest, entry);
    advanced.push(quest.id);
  }
  bwSaveState(state, storage);
  return advanced;
}

function bwStepComplete(state, quest, entry) {
  entry.stepIndex += 1;
  if (entry.stepIndex >= quest.steps.length) {
    entry.done = true;
    entry.doneAt = new Date().toISOString();
    bwFireDone(quest, entry);
  } else {
    bwFireStep(quest, entry);
  }
}

/**
 * The "station" step's own advance path: called once per fresh mission
 * return (career.js's bwCollectMissionReturns gives the site id; this
 * resolves it against every quest currently waiting on a station step whose
 * target is that same site or one of its own station ids). Returns the ids
 * of quests that advanced.
 */
export function bwNoteStationReturn(siteIdOrSimId, { storage } = {}) {
  const state = bwLoadState(storage);
  const advanced = [];
  for (const quest of bwQuests.values()) {
    const entry = bwEntryFor(state, quest.id);
    if (entry.done) continue;
    const step = quest.steps[entry.stepIndex];
    if (!step || step.type !== "station") continue;
    if (step.target !== siteIdOrSimId) continue;
    bwStepComplete(state, quest, entry);
    advanced.push(quest.id);
  }
  bwSaveState(state, storage);
  return advanced;
}

/** Used by the checker only — a fresh quest state with no progress. */
export function bwResetQuestState(storage) { try { bwQuestStorage(storage)?.removeItem(BW_QUEST_KEY); } catch (_) { /* ignore */ } }
