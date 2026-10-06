// The Deep — the career ledger: dive reputation, survey credits and unlocks.
//
// dvSiteProgress() also lives here: the one place this app reads
// shared/tracking.js, so a site's job board shows real programme progress
// (attempts, time on task, last station, badges) from TrainingRecords.
//
// Nothing here is bought or gambled — survey credits are a plain score kept
// the way a leaderboard is, and every unlock is earned by finishing a real
// station or a dive, never spent. Pure and storage-injectable (a checker
// passes a plain object in place of localStorage).

import { myTrainingSummary } from "../../shared/tracking.js";
import { gtStorage } from "../../shared/profiles.js";

const DV_CAREER_KEY = "underwater-career-v1";

const DV_STARTER_UNLOCKS = { craft: ["scuba"], ascentLines: [], badges: ["first-splash"] };

function dvCareerStorage(storage) {
  if (storage) return storage;
  try { return gtStorage(); } catch (_) { return null; }
}

function dvLoad(storage) {
  try {
    const raw = JSON.parse(dvCareerStorage(storage)?.getItem(DV_CAREER_KEY) || "null");
    if (!raw || typeof raw !== "object") throw new Error("empty");
    return {
      reputation: Number.isFinite(raw.reputation) ? raw.reputation : 0,
      credits: Number.isFinite(raw.credits) ? raw.credits : 0,
      unlocks: {
        craft: Array.isArray(raw.unlocks?.craft) ? raw.unlocks.craft : [...DV_STARTER_UNLOCKS.craft],
        ascentLines: Array.isArray(raw.unlocks?.ascentLines) ? raw.unlocks.ascentLines : [],
        badges: Array.isArray(raw.unlocks?.badges) ? raw.unlocks.badges : [...DV_STARTER_UNLOCKS.badges],
      },
      visitedSites: Array.isArray(raw.visitedSites) ? raw.visitedSites : [],
      seenRecordIds: Array.isArray(raw.seenRecordIds) ? raw.seenRecordIds : [],
      log: Array.isArray(raw.log) ? raw.log.slice(-100) : [],
    };
  } catch (_) {
    return {
      reputation: 0, credits: 0,
      unlocks: { craft: [...DV_STARTER_UNLOCKS.craft], ascentLines: [], badges: [...DV_STARTER_UNLOCKS.badges] },
      visitedSites: [], seenRecordIds: [], log: [],
    };
  }
}

function dvSave(state, storage) {
  try { dvCareerStorage(storage)?.setItem(DV_CAREER_KEY, JSON.stringify(state)); } catch (_) { /* private mode — run unsaved */ }
}

/** The current career state. Never mutate what is returned — go through the
 *  functions below, which always save what they change. */
export function dvCareerState(storage) { return dvLoad(storage); }

export function dvResetCareer(storage) { try { dvCareerStorage(storage)?.removeItem(DV_CAREER_KEY); } catch (_) { /* ignore */ } }

function dvNote(state, text) {
  state.log.push({ at: new Date().toISOString(), text });
  if (state.log.length > 100) state.log.splice(0, state.log.length - 100);
}

/** Reputation thresholds that open a craft beyond scuba. */
export const DV_CRAFT_UNLOCKS = [
  { id: "rov", reputation: 30, label: "ROV" },
  { id: "surface-supplied", reputation: 90, label: "Surface-supplied rig" },
];
/** Distinct sites visited that earn a badge. */
export const DV_BADGE_UNLOCKS = [
  { id: "shelf-hand", sites: 4, label: "Shelf Hand" },
  { id: "deep-surveyor", sites: 10, label: "Deep Surveyor" },
];

function dvApplyGain(state, { reputationGain, creditsGain, siteId, siteName, noteVerb }) {
  state.reputation += reputationGain;
  state.credits += creditsGain;
  if (siteId && !state.visitedSites.includes(siteId)) state.visitedSites.push(siteId);
  dvNote(state, `${siteName ?? siteId ?? "A dive"}: ${noteVerb} — +${reputationGain} reputation, +${creditsGain} survey credits.`);
  const unlocked = [];
  if (siteId && !state.unlocks.ascentLines.includes(siteId)) {
    state.unlocks.ascentLines.push(siteId);
    unlocked.push({ kind: "ascentLine", id: siteId, label: `Ascent line — ${siteName ?? siteId}` });
  }
  for (const rule of DV_CRAFT_UNLOCKS) {
    if (state.reputation >= rule.reputation && !state.unlocks.craft.includes(rule.id)) {
      state.unlocks.craft.push(rule.id);
      unlocked.push({ kind: "craft", id: rule.id, label: rule.label });
    }
  }
  for (const rule of DV_BADGE_UNLOCKS) {
    if (state.visitedSites.length >= rule.sites && !state.unlocks.badges.includes(rule.id)) {
      state.unlocks.badges.push(rule.id);
      unlocked.push({ kind: "badge", id: rule.id, label: rule.label });
    }
  }
  for (const u of unlocked) dvNote(state, `Unlocked: ${u.label}.`);
  return unlocked;
}

/** Reputation and survey credits from a finished station, and any unlock a
 *  milestone just crossed. */
export function dvAwardDive(entry, { storage } = {}) {
  const state = dvLoad(storage);
  const passed = !!entry.passed;
  const stars = entry.stars | 0;
  const reputationGain = passed ? 10 + stars * 5 : 2;
  const creditsGain = passed ? 40 + stars * 15 : 10;
  const unlocked = dvApplyGain(state, {
    reputationGain, creditsGain, siteId: entry.siteId, siteName: entry.siteName,
    noteVerb: passed ? `passed, ${stars}★` : "attempted",
  });
  dvSave(state, storage);
  return { reputation: state.reputation, credits: state.credits, reputationGain, creditsGain, unlocked };
}

/** Awards a dive quest's own declared `reward` (`{ reputation, credits }`)
 *  exactly as written, so the toast and the ledger always agree. */
export function dvAwardDiveReward(reward, { storage, siteId = null, siteName = null, title = null } = {}) {
  const state = dvLoad(storage);
  const reputationGain = Math.max(0, reward?.reputation | 0);
  const creditsGain = Math.max(0, reward?.credits | 0);
  const unlocked = dvApplyGain(state, { reputationGain, creditsGain, siteId, siteName: siteName ?? title, noteVerb: `dive "${title ?? siteName ?? siteId}" complete` });
  dvSave(state, storage);
  return { reputation: state.reputation, credits: state.credits, reputationGain, creditsGain, unlocked };
}

export function dvIsCraftUnlocked(id, storage) { return id === "scuba" || dvLoad(storage).unlocks.craft.includes(id); }
export function dvIsAscentUnlocked(siteId, storage) { return dvLoad(storage).unlocks.ascentLines.includes(siteId); }
export function dvIsSiteVisited(siteId, storage) { return dvLoad(storage).visitedSites.includes(siteId); }

/**
 * Scans TrainingRecords for attempts not yet credited (any record whose
 * `simId` is one of `sites`' stations, not already in the seen ledger),
 * awards each through dvAwardDive, and returns `{ entry, site, award }`
 * pairs. A station listed at more than one site credits the first site that
 * lists it, in the order the seabed data declares them.
 */
export function dvCollectDiveReturns(records, sites, { storage } = {}) {
  const state = dvLoad(storage);
  const seen = new Set(state.seenRecordIds);
  const bySimId = new Map();
  for (const s of sites) for (const simId of s.stations ?? []) if (!bySimId.has(simId)) bySimId.set(simId, s);
  const results = [];
  for (const r of records) {
    if (!r?.id || seen.has(r.id)) continue;
    const site = bySimId.get(r.simId);
    if (!site) continue;
    seen.add(r.id);
    const award = dvAwardDive({ passed: r.passed, stars: r.stars, siteId: site.id, siteName: site.name }, { storage });
    results.push({ entry: r, site, award });
  }
  if (results.length) {
    const fresh = dvLoad(storage);
    fresh.seenRecordIds = [...seen].slice(-500);
    dvSave(fresh, storage);
  }
  return results;
}

/** A site's job-board progress from shared/tracking.js, fed a stand-in
 *  programme that is just this site's own station ids. */
export function dvSiteProgress(records, site) {
  const curriculum = { id: site.id, name: site.name, stations: (site.stations ?? []).map((id) => ({ id })) };
  return myTrainingSummary(records, { curriculum, ladder: null });
}
