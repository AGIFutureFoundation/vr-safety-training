// DATAWORKS capture (docs/consoles/DATAWORKS.md): turns play in any world into consented episodes in the
// shared/dx-data.js schema. Every entry point checks dxCollecting() first and is inert when it is false —
// nothing is buffered, wrapped or written before an explicit opt-in, and never for K-12, signed-out or demo
// sessions. All writes happen on an idle callback inside dxRecorder()/dxStore, never inside a frame.
//
// SEAMS:
//   dxFromLegacy(ep, { world, consent })    -> schema-2 episode from a shared/episodes.js (schema 1) episode
//   dxAttachSession(session, opts)          -> the episodes.js recorder (store:false) whose finished episode is
//                                              converted and stored; null when not collecting
// The light, episodes.js-free captures for walkable worlds (lessons, drills, robot games) are in dx-world.js.
// Every top-level name carries the dx prefix.

import { attachEpisodeRecorder } from "./episodes.js";
import { dxCollecting, dxMakeEpisode, dxReceipt, dxStore } from "./dx-data.js";

const dxIdleRun = (fn) => (typeof globalThis.requestIdleCallback === "function" ? globalThis.requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 0));

/** Map a shared/episodes.js record's feedback kind to the schema's info.outcome. */
function dxOutcome(r) {
  if (r.outcome?.hazard) return "hazard";
  return r.outcome?.kind ?? "ok";
}

/** Convert a schema-1 episode (shared/episodes.js) into a schema-2 episode. The crew-tag hash is dropped. */
export function dxFromLegacy(ep, { world = ep.app ?? "smartcity", map = null, consent = dxReceipt(), sessionHash } = {}) {
  const t0 = ep.startedSim ?? 0;
  const steps = (ep.records ?? []).map((r) => ({
    t: Math.max(0, (r.t ?? 0) - t0),
    observation: r.obs ?? {},
    action: r.action ?? { type: "wait" },
    reward: r.reward ?? 0,
    info: { outcome: dxOutcome(r), hazard: !!r.outcome?.hazard, clean: r.outcome ? r.outcome.clean !== false : true },
  }));
  const s = ep.summary ?? {};
  return dxMakeEpisode({
    source: "human", world, map, kind: "station", scenario: ep.station ?? "unknown",
    startedAt: ep.startedAt, endedAt: ep.endedAt, truncated: !!ep.incomplete || !ep.endedAt,
    durationS: (ep.endedSim ?? t0) - t0,
    summary: { success: !!s.passed, safePractice: (s.hazardHits ?? 0) === 0, score: s.score, errors: s.errors, hazardHits: s.hazardHits, interrupts: s.interrupts ?? undefined },
    consent, generator: "shared/dx-capture.js dxFromLegacy", recordedWith: "browser", notes: `converted from shared/episodes.js schema ${ep.schemaVersion ?? 1}`,
    ...(sessionHash ? { sessionHash } : {}),
  }, steps);
}

/** Attach to a shared/game.js Session; inert (null) unless collecting. */
export function dxAttachSession(session, opts = {}) {
  if (!dxCollecting()) return null;
  const rec = attachEpisodeRecorder(session, { ...opts, crewTag: null, store: false });
  const prev = session.hooks?.onFinish;
  if (session.hooks) {
    session.hooks.onFinish = (s, summary) => {
      prev?.(s, summary);
      const legacy = rec.finish(summary);
      dxIdleRun(() => { if (dxCollecting()) dxStore.put(dxFromLegacy(legacy, { world: opts.world ?? opts.app ?? "smartcity", map: opts.map ?? null })); });
    };
  }
  return rec;
}
