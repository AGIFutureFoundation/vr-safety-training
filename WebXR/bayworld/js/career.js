// Bay World — the career record: reputation, shift credits and unlocks.
//
// bwSiteProgress() also lives here: the one place this app reads
// shared/tracking.js, so a site's own job board can show real programme
// progress (attempts, time on task, last station, badges) rather than
// re-deriving it from TrainingRecords by hand.
//
// Nothing here is bought or gambled — shift credits are a plain score, kept
// for the same reason a mini-game's leaderboard is, and every unlock is
// earned by finishing a real mission, never spent. Pure and storage-injectable
// (a checker passes a plain object in place of localStorage), so
// tools/check_bayworld_game.mjs drives every rule below with no DOM.

import { myTrainingSummary } from "../../shared/tracking.js";

const BW_CAREER_KEY = "bayworld-career-v1";

const STARTER_UNLOCKS = { vehicles: ["pool-car"], fastTravel: [], liveries: ["fleet-standard"] };

function bwCareerStorage(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage ?? null; } catch (_) { return null; }
}

function bwLoad(storage) {
  try {
    const raw = JSON.parse(bwCareerStorage(storage)?.getItem(BW_CAREER_KEY) || "null");
    if (!raw || typeof raw !== "object") throw new Error("empty");
    return {
      reputation: Number.isFinite(raw.reputation) ? raw.reputation : 0,
      credits: Number.isFinite(raw.credits) ? raw.credits : 0,
      unlocks: {
        vehicles: Array.isArray(raw.unlocks?.vehicles) ? raw.unlocks.vehicles : [...STARTER_UNLOCKS.vehicles],
        fastTravel: Array.isArray(raw.unlocks?.fastTravel) ? raw.unlocks.fastTravel : [],
        liveries: Array.isArray(raw.unlocks?.liveries) ? raw.unlocks.liveries : [...STARTER_UNLOCKS.liveries],
      },
      visitedSites: Array.isArray(raw.visitedSites) ? raw.visitedSites : [],
      seenRecordIds: Array.isArray(raw.seenRecordIds) ? raw.seenRecordIds : [],
      log: Array.isArray(raw.log) ? raw.log.slice(-100) : [],
    };
  } catch (_) {
    return {
      reputation: 0, credits: 0,
      unlocks: { vehicles: [...STARTER_UNLOCKS.vehicles], fastTravel: [...STARTER_UNLOCKS.fastTravel], liveries: [...STARTER_UNLOCKS.liveries] },
      visitedSites: [], seenRecordIds: [], log: [],
    };
  }
}

function bwSave(state, storage) {
  try { bwCareerStorage(storage)?.setItem(BW_CAREER_KEY, JSON.stringify(state)); } catch (_) { /* private mode — run unsaved */ }
}

/** The current career state. Never mutate the object returned — go through
 *  the functions below, which always save what they change. */
export function bwCareerState(storage) { return bwLoad(storage); }

export function bwResetCareer(storage) { try { bwCareerStorage(storage)?.removeItem(BW_CAREER_KEY); } catch (_) { /* ignore */ } }

function bwNote(state, text) {
  state.log.push({ at: new Date().toISOString(), text });
  if (state.log.length > 100) state.log.splice(0, state.log.length - 100);
}

/** The shared plumbing behind bwAwardMission() and bwAwardQuestReward():
 *  apply a reputation/credits gain already decided by the caller, mark a
 *  site visited when one is named, and check every milestone rule against
 *  the totals that gain just produced. Mutates and returns `state`. */
function bwApplyGain(state, { reputationGain, creditsGain, siteId, siteName, noteVerb }) {
  state.reputation += reputationGain;
  state.credits += creditsGain;
  if (siteId && !state.visitedSites.includes(siteId)) state.visitedSites.push(siteId);
  bwNote(state, `${siteName ?? siteId ?? "A job"}: ${noteVerb} — +${reputationGain} reputation, +${creditsGain} credits.`);

  const unlocked = [];
  if (siteId && !state.unlocks.fastTravel.includes(siteId)) {
    state.unlocks.fastTravel.push(siteId);
    unlocked.push({ kind: "fastTravel", id: siteId, label: `Fast travel — ${siteName ?? siteId}` });
  }
  for (const rule of BW_VEHICLE_UNLOCKS) {
    if (state.reputation >= rule.reputation && !state.unlocks.vehicles.includes(rule.id)) {
      state.unlocks.vehicles.push(rule.id);
      unlocked.push({ kind: "vehicle", id: rule.id, label: rule.label });
    }
  }
  for (const rule of BW_LIVERY_UNLOCKS) {
    if (state.visitedSites.length >= rule.sites && !state.unlocks.liveries.includes(rule.id)) {
      state.unlocks.liveries.push(rule.id);
      unlocked.push({ kind: "livery", id: rule.id, label: rule.label });
    }
  }
  for (const u of unlocked) bwNote(state, `Unlocked: ${u.label}.`);
  return unlocked;
}

/** Reputation earned from finishing a mission, credits earned alongside it,
 *  and, once a stated milestone is crossed, an unlock. Returns the new
 *  totals plus what (if anything) was just unlocked. */
export function bwAwardMission(entry, { storage } = {}) {
  const state = bwLoad(storage);
  const passed = !!entry.passed;
  const stars = entry.stars | 0;
  const reputationGain = passed ? 10 + stars * 5 : 2;
  const creditsGain = passed ? 40 + stars * 15 : 10;
  const unlocked = bwApplyGain(state, {
    reputationGain, creditsGain, siteId: entry.siteId, siteName: entry.siteName,
    noteVerb: passed ? `passed, ${stars}★` : "attempted",
  });
  bwSave(state, storage);
  return { reputation: state.reputation, credits: state.credits, reputationGain, creditsGain, unlocked };
}

/**
 * Awards a quest's own declared `reward` (`{ reputation, credits }`) exactly
 * as written — never the mission-stars formula bwAwardMission() uses — so
 * the toast a quest's completion shows and the total it actually adds always
 * agree. `siteId` (a quest's own `site`, when it names one) marks that site
 * visited and can unlock its fast travel the same way a mission return does.
 */
export function bwAwardQuestReward(reward, { storage, siteId = null, siteName = null, title = null } = {}) {
  const state = bwLoad(storage);
  const reputationGain = Math.max(0, reward?.reputation | 0);
  const creditsGain = Math.max(0, reward?.credits | 0);
  const unlocked = bwApplyGain(state, { reputationGain, creditsGain, siteId, siteName: siteName ?? title, noteVerb: `quest "${title ?? siteName ?? siteId}" complete` });
  bwSave(state, storage);
  return { reputation: state.reputation, credits: state.credits, reputationGain, creditsGain, unlocked };
}

/** Reputation thresholds that open a fleet vehicle beyond the starter pool car. */
export const BW_VEHICLE_UNLOCKS = [
  { id: "pickup", reputation: 30, label: "Pickup" },
  { id: "box-truck", reputation: 80, label: "Box truck" },
  { id: "class-a-tractor", reputation: 160, label: "Class A tractor" },
];
/** Distinct sites visited that open a livery. */
export const BW_LIVERY_UNLOCKS = [
  { id: "night-shift", sites: 4, label: "Night Shift livery" },
  { id: "harbor-crew", sites: 8, label: "Harbor Crew livery" },
];

export function bwIsVehicleUnlocked(id, storage) { return id === "pool-car" || bwLoad(storage).unlocks.vehicles.includes(id); }
export function bwIsFastTravelUnlocked(siteId, storage) { return bwLoad(storage).unlocks.fastTravel.includes(siteId); }
export function bwIsSiteVisited(siteId, storage) { return bwLoad(storage).visitedSites.includes(siteId); }

/**
 * Scans TrainingRecords for attempts this session has not yet credited (any
 * record whose `simId` matches one of `sites`' own stations, not already in
 * the career's seen-record ledger), awards each one through bwAwardMission,
 * and returns the list of `{ entry, award }` pairs — empty when there is
 * nothing new. `records` is TrainingRecords.list()'s own shape; the caller
 * supplies it so this stays storage-injectable and DOM-free.
 */
export function bwCollectMissionReturns(records, sites, { storage } = {}) {
  const state = bwLoad(storage);
  const seen = new Set(state.seenRecordIds);
  const bySimId = new Map();
  for (const s of sites) for (const simId of s.stations ?? []) bySimId.set(simId, s);
  const results = [];
  for (const r of records) {
    if (!r?.id || seen.has(r.id)) continue;
    const site = bySimId.get(r.simId);
    if (!site) continue;
    seen.add(r.id);
    const award = bwAwardMission({ passed: r.passed, stars: r.stars, siteId: site.id, siteName: site.name }, { storage });
    results.push({ entry: r, site, award });
  }
  if (results.length) {
    const fresh = bwLoad(storage);
    fresh.seenRecordIds = [...seen].slice(-500);
    bwSave(fresh, storage);
  }
  return results;
}

/**
 * A site's own job-board progress: shared/tracking.js's myTrainingSummary()
 * fed a stand-in "programme" that is just this site's own station ids, so a
 * board reads real attempts, time on task, last station and badges from
 * `records` (TrainingRecords.list()'s own shape) without this app needing the
 * real curriculum catalog or a level ladder — a site's own stations already
 * name a programme in `site.programmes`, which the board shows alongside it.
 */
export function bwSiteProgress(records, site) {
  const curriculum = { id: site.id, name: site.name, stations: (site.stations ?? []).map((id) => ({ id })) };
  return myTrainingSummary(records, { curriculum, ladder: null });
}
