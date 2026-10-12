// ECOSYSTEM-2 — the learner path into the bus adapter, behind DATAWORKS consent (docs/ecosystem.md, seam 3–4).
//
// A station run (shared/game.js Session) reports `start`, each step (`step-ok` when a step completes, `step-wrong` on a
// wrong or dangerous action) and `complete` / `fail` to an in-memory eco-bus adapter (eco-bus.js) — and ONLY while
// dx-data.js's dxCollecting() is true: an adult, signed in, not K-12, not the demo, opted in. Nothing is sent and nothing is
// written: the events live in this page's memory and go when the page goes.
//   * Consent off (or never given): ecoAttachLearner returns null, wraps nothing and holds 0 events.
//   * Consent is re-read at EVERY event and at every count. The moment it is gone (dxRevoke, a sign-out, a K-12 switch),
//     everything held is deleted and the session's hooks stop reporting.
//   * The learner id is dx-data.js's salted per-profile session hash (a pseudonym that rotates on revoke), never a name.
//   * Only counts leave this module for display (ecoLearnHeldCount); the contents are for the checkers.
// The probes (collecting, signals, pseudonym, clock) can be injected so tools/check_eco.mjs drives a real Session headless.
// Every top-level name carries the eco/ECO_ prefix.

import { ecoBus } from "./eco-bus.js";
import { dxCollecting, dxReadSignals, dxSessionHash } from "./dx-data.js";

export const ECO_LEARN_SCOPE = "memory";
const ECO_LEARN_DEFAULTS = { collecting: () => dxCollecting(), signals: () => dxReadSignals(), pseudonym: () => dxSessionHash(), clock: () => Date.now() };
let ecoLearnState = { bus: null, learnerId: null, probes: ECO_LEARN_DEFAULTS, sessions: 0, refusedAttach: 0, wiped: 0 };

function ecoLearnOn(probes) { try { return probes.collecting() === true; } catch (_) { return false; } }

/** Delete every learner event held in this page. Returns { ok, remaining: 0 }. */
export function ecoLearnRevoke() {
  if (ecoLearnState.bus) { ecoLearnState.bus.revoke(); ecoLearnState.wiped += 1; }
  ecoLearnState = { ...ecoLearnState, bus: null, learnerId: null };
  return { ok: true, remaining: 0 };
}

/** The bus for this page, created lazily for a collecting session; null (and everything wiped) when consent is gone. */
function ecoLearnBus(probes) {
  if (!ecoLearnOn(probes)) { ecoLearnRevoke(); return null; }
  if (ecoLearnState.bus) return ecoLearnState.bus;
  let sg = {};
  try { sg = probes.signals() ?? {}; } catch (_) { sg = {}; }
  const consent = { demo: sg.demo, signedIn: sg.signedIn, k12: sg.k12, adult: sg.adult, optedIn: true };
  let learnerId = null;
  try { learnerId = String(probes.pseudonym() ?? ""); } catch (_) { learnerId = null; }
  if (!learnerId) return null;
  ecoLearnState = { ...ecoLearnState, bus: ecoBus({ consent, clock: () => probes.clock(), sessionId: `eco-learn-${ecoLearnState.sessions}` }), learnerId };
  return ecoLearnState.bus;
}

/** How many learner events this page holds (no contents). 0 whenever consent is off, which also deletes what was held. */
export function ecoLearnHeldCount() {
  const bus = ecoLearnBus(ecoLearnState.probes);
  return bus ? bus.messages().length : 0;
}

/** The held messages, for the checkers only (never shown). [] when consent is off. */
export function ecoLearnMessages() {
  const bus = ecoLearnBus(ecoLearnState.probes);
  return bus ? bus.messages() : [];
}

/** Counters for the checkers: sessions attached, attaches refused for consent, times a revoke wiped the store, adapter refusals. */
export function ecoLearnStats() {
  return { sessions: ecoLearnState.sessions, refusedAttach: ecoLearnState.refusedAttach, wiped: ecoLearnState.wiped, refused: ecoLearnState.bus?.stats.refused ?? 0, network: 0 };
}

/**
 * Report one station run (a shared/game.js Session, before session.start()) to the in-memory adapter. Inert — returns null,
 * wraps nothing — unless consent is on. `station` is the room id (the adapter's module_id); `skills` its skill ids.
 */
export function ecoAttachLearner(session, { station, skills = [], tier = "standard", probes = null } = {}) {
  const pr = { ...ECO_LEARN_DEFAULTS, ...(probes ?? {}) };
  ecoLearnState = { ...ecoLearnState, probes: pr };
  if (!session || !station || !ecoLearnBus(pr)) { ecoLearnState.refusedAttach += 1; return null; }
  ecoLearnState.sessions += 1;
  const hooks = session.hooks ?? (session.hooks = {});
  let seq = 0, live = true;
  const emit = (kind) => {
    if (!live) return null;
    const bus = ecoLearnBus(pr);
    if (!bus) { live = false; return null; }
    const r = bus.learner({ learnerId: ecoLearnState.learnerId, kind, station: String(station), skills: Array.isArray(skills) ? skills.map(String) : [], seq: seq++, ts: new Date(pr.clock()).toISOString(), tier });
    return r.ok ? r : null;
  };
  const prev = { onFeedback: hooks.onFeedback, onStepComplete: hooks.onStepComplete, onFinish: hooks.onFinish };
  hooks.onFeedback = (fb, s) => { prev.onFeedback?.(fb, s); if (fb && (fb.kind === "wrong" || fb.kind === "danger")) emit("step-wrong"); };
  hooks.onStepComplete = (step, s) => { prev.onStepComplete?.(step, s); emit("step-ok"); };
  hooks.onFinish = (s, summary) => {
    prev.onFinish?.(s, summary);
    const passed = typeof summary?.passed === "boolean" ? summary.passed : ((s?.stars | 0) >= 2 && (s?.hazardHits | 0) === 0);
    emit(passed ? "complete" : "fail");
    live = false;
  };
  emit("start");
  return { station: String(station), held: () => ecoLearnHeldCount(), stop: () => { live = false; } };
}

// A read-only probe for the built-page check (tools/check_eco.mjs leg 9), in the pattern of window.__smartcityTest: what this
// page holds right now, re-checked against consent on every call. It reads; it cannot add, send or keep anything.
try { if (typeof window !== "undefined" && window) window.__ecoLearnTest = Object.freeze({ held: () => ecoLearnHeldCount(), messages: () => ecoLearnMessages(), stats: () => ecoLearnStats() }); } catch (_) { /* a frozen window: no probe */ }
