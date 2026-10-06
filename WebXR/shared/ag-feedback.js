// AGENTGYM — human feedback on an agent's demonstrated run.
//
// A learner watches an agent's run as a walkthrough (ag-gym.js agWalkthrough)
// and rates it thumbs up or down with one reason from a fixed list (no free
// text). Each rating is stored as one DATAWORKS episode (dx-data.js
// dxMakeEpisode: source "human", kind "gym", scenario "agent-rating:<station>",
// the consent receipt attached), so the existing rules hold unchanged:
//   - opt-in only, adults only, never K-12, demo or signed-out (dxCollecting);
//   - local only (dxStore: IndexedDB / localStorage / memory); no upload path;
//   - dxRevoke() deletes every rating with the rest of the learner's episodes.
// agPreferencePairs() turns stored ratings into preference pairs
// { station, chosen, rejected, reasons } — one per (up, down) pair on the same
// station — the shape a preference-learning step consumes later. Nothing here
// trains anything; it records and pairs.
//
// Names prefixed `ag`/`AG_`. No fetch/XHR/WebSocket/beacon.

import { dxCollecting, dxMakeEpisode, dxValidateEpisode, dxStore } from "./dx-data.js";

export const AG_RATING_REASONS = Object.freeze({
  up: ["safe-order", "clear-to-follow", "efficient", "caught-the-hazard"],
  down: ["unsafe-touch", "wrong-order", "too-many-hints", "hard-to-follow", "slow"],
});
export const AG_RATING_SCENARIO_PREFIX = "agent-rating:";

/** Compact the demonstrated run into the steps a rating episode keeps (decisions only, in-world values). */
function agRatingSteps(run) {
  return (run.steps ?? []).filter((s) => s.action?.type !== "wait").slice(0, 400).map((s) => ({
    t: s.t ?? s.observation?.elapsed ?? 0,
    observation: { stepIndex: s.observation?.stepIndex ?? null, stepId: s.observation?.stepId ?? null, kind: s.observation?.kind ?? null, interrupt: s.observation?.interrupt?.id ?? null },
    action: { type: s.action.type, ...(s.action.id ? { id: s.action.id } : {}) },
    reward: s.info?.stationDelta ?? 0,
    done: !!s.done,
    info: { outcome: s.info?.hazard ? "hazard" : s.info?.feedback === "warn" ? "wrong" : s.info?.stationDelta > 0 ? "ok" : undefined, hazard: !!s.info?.hazard },
  }));
}

/**
 * Build (but do not store) a rating episode. Returns null with a reason when the
 * rating or the session is not eligible. `signals` is dx-data's signal shape
 * (tests pass it; the page reads it from the URL and profile).
 */
export function agMakeRating({ run, agent, rating, reason, signals = null, runId = null, createdAt = null } = {}) {
  if (rating !== "up" && rating !== "down") return { ok: false, reason: "rating must be up or down" };
  if (!AG_RATING_REASONS[rating].includes(reason)) return { ok: false, reason: `reason must be one of ${AG_RATING_REASONS[rating].join(", ")}` };
  if (!dxCollecting(signals)) return { ok: false, reason: "not collecting: opt in first (adults only; never K-12, demo or signed-out)" };
  const s = run?.summary ?? {};
  const ep = dxMakeEpisode({
    source: "human", world: "smartcity", kind: "gym", scenario: `${AG_RATING_SCENARIO_PREFIX}${s.station ?? "unknown"}`,
    summary: { success: !!s.passed, score: s.stationScore ?? 0, errors: s.errors ?? 0, hazardHits: s.hazardHits ?? 0 },
    generator: "shared/ag-feedback.js", recordedWith: "browser", seed: s.seed ?? null, policy: agent,
    ...(createdAt ? { createdAt, startedAt: createdAt, endedAt: createdAt } : {}),
    notes: { preference: { rating, reason, agent, station: s.station ?? null, seed: s.seed ?? null, runId: runId ?? `${agent}:${s.station}:${s.seed}` } },
  }, agRatingSteps(run));
  const v = dxValidateEpisode(ep);
  return v.ok ? { ok: true, episode: ep } : { ok: false, reason: v.errors.join("; ") };
}

/** Rate and store locally. Resolves { ok, episodeId } or { ok: false, reason }. Inert without consent. */
export async function agRate(opts = {}, { store = dxStore } = {}) {
  const r = agMakeRating(opts);
  if (!r.ok) return r;
  const saved = await store.put(r.episode);
  return saved ? { ok: true, episodeId: r.episode.episodeId } : { ok: false, reason: "store refused the episode" };
}

/** Every rating among a list of dx episodes. */
export function agRatings(episodes) {
  return (episodes ?? []).filter((e) => e.kind === "gym" && String(e.scenario).startsWith(AG_RATING_SCENARIO_PREFIX) && e.provenance?.notes?.preference)
    .map((e) => ({ episodeId: e.episodeId, ...e.provenance.notes.preference }));
}

/** Preference pairs: every (up, down) pair of ratings on the same station, deterministic order. */
export function agPreferencePairs(episodes) {
  const by = new Map();
  for (const r of agRatings(episodes)) { if (!by.has(r.station)) by.set(r.station, { up: [], down: [] }); by.get(r.station)[r.rating].push(r); }
  const pairs = [];
  for (const [station, { up, down }] of [...by.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    for (const u of up) for (const d of down) pairs.push({ station, chosen: { runId: u.runId, agent: u.agent, episodeId: u.episodeId }, rejected: { runId: d.runId, agent: d.agent, episodeId: d.episodeId }, reasons: { chosen: u.reason, rejected: d.reason } });
  }
  return pairs;
}
