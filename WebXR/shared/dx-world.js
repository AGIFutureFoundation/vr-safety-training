// DATAWORKS world capture (docs/consoles/DATAWORKS.md) — the light entry points for walkable worlds, with no
// dependency beyond shared/dx-data.js (so the parish bundle does not pull in the robot policy). Each is inert
// unless dxCollecting() is true: nothing is recorded before opt-in, or for K-12, signed-out or demo sessions.
//
// SEAMS:
//   dxCaptureLesson({ world, map, lesson, choice, ok })   one-step field-lesson episode; the choice index only,
//                                                          never the option text
//   dxCaptureDrill({ world, map, drillId, result })       one-step drill episode (safe-practice score)
//   dxCaptureRollout(steps, meta)                         ROBOTICS' robot games in the browser: a finished
//                                                          { t, observation, action, reward, info } list -> episode
// Every top-level name carries the dx prefix.

import { dxCollecting, dxMakeEpisode, dxRecorder, dxStore } from "./dx-data.js";

const dxWorldIdle = (fn) => (typeof globalThis.requestIdleCallback === "function" ? globalThis.requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 0));

function dxOneStep(meta, observation, action, reward, info, summary) {
  const rec = dxRecorder(meta);
  if (!rec.active) return null;
  rec.step(observation, action, reward, info);
  return rec.finish(summary);
}

/** A field lesson answered in a walkable world: one decision, the choice index only (never the option text). */
export function dxCaptureLesson({ world = "parishes", map = null, lesson, choice, ok }) {
  if (!lesson?.id) return null;
  return dxOneStep({ world, map, kind: "lesson", scenario: lesson.id },
    { options: lesson.check?.options?.length ?? 0, steps: lesson.steps?.length ?? 0 },
    { type: "select", id: `choice-${choice | 0}` }, ok ? 100 : 0,
    { outcome: ok ? "ok" : "wrong", clean: !!ok, hazard: false },
    { success: !!ok, safePractice: true, score: ok ? 100 : 0, errors: ok ? 0 : 1, hazardHits: 0 });
}

/** A drill finished: its safe-practice score as one step. */
export function dxCaptureDrill({ world = "parishes", map = null, drillId, result }) {
  if (!drillId || !result) return null;
  const score = Number(result.score) || 0;
  return dxOneStep({ world, map, kind: "drill", scenario: drillId },
    { drill: drillId }, { type: "commit", id: drillId, at: score / 100 }, score,
    { outcome: score >= 70 ? "ok" : "below-par", clean: score >= 70, hazard: false },
    { success: score >= 70, safePractice: score >= 70, score, errors: score >= 70 ? 0 : 1, hazardHits: 0 });
}

/** A robot game played in the browser (ROBOTICS' rbEnv): hand the finished step list here. */
export function dxCaptureRollout(steps, meta = {}) {
  if (!dxCollecting()) return null;
  const ep = dxMakeEpisode({ world: "robotics", kind: "robot-game", ...meta, source: "human" }, steps);
  dxWorldIdle(() => { if (dxCollecting()) dxStore.put(ep); });
  return ep;
}
