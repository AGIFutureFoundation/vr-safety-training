// SILICA (docs/consoles/SILICA.md): the reaction-time eval for stations that port the ConstructionVR
// drilling-dust study's design (docs/sources/constructionvr-study.md).
//
// WHAT IT MEASURES. shared/game.js already times every interruption: `session.interruptLog` holds
// { id, outcome, seconds } for each cue, `seconds` being the time from the alarm to the answer (or to
// the window running out). A station opts in to this eval by declaring
//   reactionEval: { study, cues: { <interrupt id>: "active" | "passive" } }
// — "active" when the learner is the one making the dust (the study's ActiveDrilling condition),
// "passive" when it is someone else's dust reaching them (PassiveMoving).
//
// PRIVACY. Recording goes through DATAWORKS' consent gate and nothing else (docs/consoles/DATAWORKS.md):
//   * silRecordRun() returns null and stores nothing unless dxCollecting() — an adult who opted in,
//     signed in, not demo, not K-12, with every signal known.
//   * The episode is DATAWORKS' schema (smartcitix.holodeck.episode); each cue is one step whose
//     info.interrupt is { id, outcome, responseS } — the field the schema already defines.
//   * Storage is dxStore (local only). THIS MODULE HAS NO NETWORK CODE. Revoke (dxRevoke) deletes it.
//
// WHAT IT IS NOT. The study's participants pressed a trigger at a time measured from the start of the
// session; this eval measures time from a cue to the learner's answer. The two numbers are not the same
// quantity, so SIL_STUDY below is shown as context for the design, never as a norm to beat, and no
// participant data is used to train or tune anything (the study's consent covered research use).
//
// SEAMS (pure functions; plain data in and out):
//   silCueTimes(room, interruptLog) -> [{ cue, condition, outcome, responseS }]
//   silStats(numbers)               -> { n, median, q1, q3 } (linear-interpolated quartiles, as the doc)
//   silSummary(cues)                -> { active: stats, passive: stats, answered, missed, wrong }
//   silRecordRun(session, room, { store, signals }) -> episode | null   (null unless opted in)
import { dxCollecting, dxMakeEpisode, dxValidateEpisode, dxStore } from "./dx-data.js";

/** The study's aggregates per condition — copied from docs/sources/constructionvr-study.md, nothing finer. */
export const SIL_STUDY = Object.freeze({
  source: "ConstructionVR user study (AGIFutureFoundation/constructionvr), aggregate statistics only",
  measure: "TimeToResponse: seconds from the start of the session to each trigger press",
  usedForTraining: false,
  conditions: Object.freeze({
    ActiveDrilling: Object.freeze({ sessions: 6, sessionsWithResponses: 5, responses: 37, median: 25.41, q1: 13.76, q3: 33.43, firstMedian: 13.19, firstQ1: 11.2, firstQ3: 13.76 }),
    PassiveMoving: Object.freeze({ sessions: 6, sessionsWithResponses: 6, responses: 39, median: 10.98, q1: 6.97, q3: 15.88, firstMedian: 4.37, firstQ1: 2.98, firstQ3: 6.64 }),
  }),
});

/** n, median and interquartile range with linear interpolation between order statistics. */
export function silStats(xs) {
  const s = (xs ?? []).filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  const q = (p) => {
    if (!s.length) return null;
    const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
    return Math.round((s[lo] + (s[hi] - s[lo]) * (i - lo)) * 100) / 100;
  };
  return { n: s.length, median: q(0.5), q1: q(0.25), q3: q(0.75) };
}

/** One row per cue the station declared, in the order they fired. Unknown interrupts are skipped. */
export function silCueTimes(room, interruptLog = []) {
  const cues = room?.reactionEval?.cues ?? {};
  return (interruptLog ?? []).filter((l) => l && cues[l.id]).map((l) => ({
    cue: l.id,
    condition: cues[l.id] === "passive" ? "passive" : "active",
    outcome: l.outcome ?? "missed",
    responseS: Number.isFinite(l.seconds) ? Math.round(l.seconds * 100) / 100 : null,
  }));
}

/** Per-condition stats over answered cues only (a miss has no response time, only a window that ran out). */
export function silSummary(cues = []) {
  const answered = cues.filter((c) => c.outcome === "answered" && c.responseS != null);
  return {
    active: silStats(answered.filter((c) => c.condition === "active").map((c) => c.responseS)),
    passive: silStats(answered.filter((c) => c.condition === "passive").map((c) => c.responseS)),
    answered: answered.length,
    missed: cues.filter((c) => c.outcome === "missed").length,
    wrong: cues.filter((c) => c.outcome === "wrong").length,
  };
}

/** The cues as schema steps: observation = which cue and condition, action = the answer, info.interrupt = timing. */
export function silReactionSteps(cues = []) {
  let t = 0;
  return cues.map((c, i) => {
    t += c.responseS ?? 0;
    return {
      t,
      observation: { cue: c.cue, condition: c.condition, cueIndex: i },
      action: { type: c.outcome === "answered" ? "press" : c.outcome === "wrong" ? "select" : "wait" },
      reward: c.outcome === "answered" ? 1 : 0,
      info: { outcome: c.outcome === "answered" ? "ok" : c.outcome === "wrong" ? "wrong" : "timeout", interrupt: { id: c.cue, outcome: c.outcome, responseS: c.responseS } },
    };
  });
}

/**
 * Record one run's cue times as a DATAWORKS episode — only for a station with reactionEval, only when
 * the learner opted in and the session is eligible. Returns the episode it stored, or null.
 */
export function silRecordRun(session, room, { store = null, signals = null } = {}) {
  if (!room?.reactionEval) return null;
  if (!dxCollecting(signals)) return null;
  const cues = silCueTimes(room, session?.interruptLog);
  if (!cues.length) return null;
  const sm = silSummary(cues);
  const ep = dxMakeEpisode({
    source: "human", world: "smartcity", kind: "station", scenario: `${room.id}#reaction`,
    durationS: Math.round((session?.elapsed ?? 0) * 100) / 100,
    generator: "shared/sil-reaction.js", recordedWith: "browser",
    notes: "reaction-time eval: time from each hazard cue to the learner's answer (active = own dust, passive = someone else's)",
    summary: {
      success: sm.missed === 0 && sm.wrong === 0, score: sm.answered, errors: sm.missed + sm.wrong, hazardHits: sm.missed + sm.wrong,
      interrupts: { answered: sm.answered, missed: sm.missed, wrong: sm.wrong },
    },
  }, silReactionSteps(cues));
  if (!dxValidateEpisode(ep).ok) return null;
  (store ?? dxStore).put(ep);
  return ep;
}
