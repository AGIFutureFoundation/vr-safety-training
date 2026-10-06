// ROBOTRAIN — a VR-controller teleoperation demonstration recorder over the robotics gym (console ROBOTRAIN,
// docs/consoles/ROBOTRAIN.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// The learner's controller (or mouse) pose drives the sim arm of the Teleop Pick-and-Place scenario (rb-env.js,
// `rb-teleop-pick-place`), and each take is recorded as a COLEARN demonstration in DATAWORKS' episode schema:
//
//   pose  { p: [x, y, z] (m, the hand in the bench frame), trigger: 0..1, squeeze: 0..1, estop: bool }
//     → rtPoseToAction(pose, obs)  → an env action: move (capped by the scenario's speed), grip (force from the squeeze
//                                    as a share of the part's force ceiling), release, estop, reset or wait
//     → rtRecorder(...)            → dxRecorder: inert unless dxCollecting() (adult, signed in, not K-12, not the demo,
//                                    opted in); the episode is written to the local DX store only; revoking deletes it
//     → colDemosFromEpisodes()     → behaviour cloning (col-learn.js colTrain) on the recorded takes
//
// Tests and the headless eval use a SCRIPTED "HUMAN": the scripted expert's intent passed through a controller pose with
// hand tremor and lag (rtScriptedHuman). It is written with source "synthetic" and its provenance says "scripted human
// stand-in" — it is never presented as a person. rtCompare() trains one policy on N recorded takes (pose → action) and one
// on N of COLEARN's synthetic demonstrations (action → action) and reports both on the same held-out seeds.
//
// No network call, no upload, no model call. Every top-level name is prefixed rt/RT_ (the bundler shares one scope).

import { rng } from "./robot.js";
import { rbEnv, rbPolicy, rbRollout, rbScenario } from "./rb-env.js";
import { dxMakeEpisode, dxRecorder, dxCollecting, dxStore } from "./dx-data.js";
import { colDemosFromEpisodes, colSyntheticDemos, colTrain, colPolicy, colEvalPolicy, colRandomPolicy, colHeldOut } from "./col-learn.js";

export const RT_VERSION = "rt/1";
export const RT_SCENARIO = "rb-teleop-pick-place";
export const RT_FIXED_TIME = "2026-01-01T00:00:00.000Z";
/** How the recorder labels a scripted stand-in, so no reader mistakes it for a person. */
export const RT_SYNTHETIC_LABEL = "scripted human stand-in: expert intent through a controller pose with tremor and lag";
/** The data rules the recorder enforces (stated for the stations and the programme page). */
export const RT_DATA_RULES = ["opt-in only", "adults only", "never in K-12, demo or signed-out sessions", "stays on this device (no upload endpoint)", "revoking deletes every take"];

const rtR3 = (v) => Math.round(v * 1000) / 1000;
const rtClip = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rtD3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * A controller pose becomes one env action. Deterministic and pure.
 *   - estop held → { type: "estop" }; a stopped arm with the trigger open → { type: "reset" }
 *   - trigger closed, not carrying, within reach of the bin → grip at `squeeze` × the part's ceiling (0.35..1.1)
 *   - trigger open while carrying → release (the env decides whether it is placed or returned to the bin)
 *   - otherwise → move toward the pose, capped by the scenario's per-step speed; a pose under `deadband` away → wait
 */
export function rtPoseToAction(pose, obs, { speed = rbScenario(RT_SCENARIO).params.speed, tolerance = rbScenario(RT_SCENARIO).params.tolerance, deadband = 0.004 } = {}) {
  if (pose.estop) return { type: "estop" };
  if (obs.mode !== "run") return (pose.trigger ?? 0) < 0.5 ? { type: "reset" } : { type: "wait" };
  const closed = (pose.trigger ?? 0) >= 0.5;
  if (closed && !obs.carrying && obs.part && rtD3(obs.effector, obs.bin) <= tolerance * 2) {
    const share = rtClip(0.35 + (pose.squeeze ?? 0.5) * 0.75, 0.35, 1.1);
    return { type: "grip", force: rtR3(obs.part.ceilingN * share) };
  }
  if (!closed && obs.carrying) return { type: "release" };
  const d = [pose.p[0] - obs.effector[0], pose.p[1] - obs.effector[1], pose.p[2] - obs.effector[2]];
  const len = Math.hypot(...d);
  if (len < deadband) return { type: "wait" };
  const k = Math.min(1, speed / len);
  return { type: "move", dx: rtR3(d[0] * k), dy: rtR3(d[1] * k), dz: rtR3(d[2] * k) };
}

/**
 * The recorder for a learner's take. Wraps DATAWORKS' dxRecorder, so it is inert (`active: false`, nothing buffered)
 * unless the learner is collecting right now; the episode is validated and stored locally by dxRecorder on finish.
 * `step(pose)` drives the env and records { observation, action, reward, info }; `finish()` returns the episode or null.
 */
export function rtRecorder(env, { store = dxStore, signals = null, clock = () => Date.now(), map = null } = {}) {
  const sc = env.scenario.id;
  const rec = dxRecorder({ world: "robotics", map, kind: "robot-game", scenario: sc, generator: "shared/rt-teleop.js rtRecorder", recordedWith: "browser", notes: { input: "controller-pose", envSchema: env.scenario.id } }, { store, signals, clock });
  let obs = env.reset(), last = null, steps = 0;
  return {
    get active() { return rec.active; },
    get observation() { return obs; },
    collecting: () => dxCollecting(signals),
    step(pose) {
      const action = rtPoseToAction(pose, obs);
      const r = env.step(action);
      rec.step(obs, action, r.reward, { outcome: r.info.violations?.length ? "hazard" : r.info.feedback ?? "ok", unsafe: (r.info.violations?.length ?? 0) > 0, t: r.info.t });
      last = r; obs = r.observation; steps += 1;
      return { action, done: r.done, feedback: r.info.feedback ?? null, violations: r.info.violations ?? [] };
    },
    finish() {
      const sm = env.summary();
      return rec.finish({ success: sm.passed, safePractice: sm.violationCount === 0, score: sm.score }, { truncated: !!sm.truncated });
    },
    abort() { rec.abort(); },
    steps: () => steps,
    last: () => last,
  };
}

/**
 * The scripted "human" for tests: a pose source that follows the expert's intent (rbPolicy at `skill`) through a hand
 * with tremor and lag. Returns `(obs) => pose`. Labelled synthetic wherever it is written.
 */
export function rtScriptedHuman(env, { seed = 1, skill = 0.85, tremor = 0.012, lag = 0.3, squeezeNoise = 0.15 } = {}) {
  const intent = rbPolicy(env, { skill, seed }), R = rng(seed * 61 + 13);
  let hand = null, held = false, squeeze = 0.5, lapse = false;
  return (obs) => {
    const a = intent(obs);
    if (!hand) hand = obs.effector.slice();
    const tgt = a.type === "move" ? [obs.effector[0] + a.dx, obs.effector[1] + a.dy, obs.effector[2] + a.dz] : obs.effector;
    // the hand lags behind where it means to be, then overshoots a little; tremor on every axis
    for (let i = 0; i < 3; i++) hand[i] = hand[i] + (tgt[i] - hand[i]) * (1 - lag) + (R() - 0.5) * tremor;
    if (a.type === "grip") { held = true; lapse = R() < (1 - skill) * 0.4; squeeze = rtClip(0.33 + (R() - 0.5) * squeezeNoise + (lapse ? 0.7 : 0), 0, 1); }
    if (a.type === "release") held = false;
    if (a.type === "reset") held = false;
    return { p: hand.map(rtR3), trigger: held ? 1 : 0, squeeze: rtR3(squeeze), estop: a.type === "estop" };
  };
}

/**
 * N recorded takes by the scripted human through the pose → action recorder path, written as DX episodes with source
 * "synthetic" and RT_SYNTHETIC_LABEL in provenance. Deterministic under `seed` (fixed timestamps).
 */
export function rtRecordTakes({ n = 40, seed = 1, skill = 0.85, tremor = 0.012, lag = 0.3 } = {}) {
  const eps = [];
  for (let k = 0; k < n; k++) {
    const s = seed * 100003 + k + 1;
    const env = rbEnv(RT_SCENARIO, { seed: s });
    const human = rtScriptedHuman(env, { seed: s, skill, tremor, lag });
    const { steps, summary } = rbRollout(env, { seed: s, policy: (o) => rtPoseToAction(human(o), o) });
    eps.push(dxMakeEpisode({
      source: "synthetic", world: "robotics", kind: "robot-game", scenario: RT_SCENARIO, episodeId: `rt-take-${s}`,
      startedAt: RT_FIXED_TIME, endedAt: RT_FIXED_TIME, createdAt: RT_FIXED_TIME, truncated: summary.truncated,
      summary: { success: summary.passed, safePractice: summary.violationCount === 0, score: summary.score },
      generator: "shared/rt-teleop.js rtRecordTakes", recordedWith: "headless", seed: s,
      policy: `${RT_SYNTHETIC_LABEL}; skill ${skill}, tremor ${tremor}, lag ${lag}`,
      notes: { input: "controller-pose", syntheticStandIn: true },
    }, steps.map((st) => ({ ...st, t: st.info.t, info: { outcome: st.info.violations.length ? "hazard" : st.info.feedback ?? "ok", unsafe: st.info.violations.length > 0 } }))));
  }
  return eps;
}

/**
 * The eval: a policy cloned from N recorded (pose-driven, scripted-human) takes against one cloned from N of COLEARN's
 * synthetic demonstrations, both on the same held-out seeds, with the random floor and the expert ceiling.
 */
export function rtCompare({ n = 40, seed = 1, heldOut = 60, skill = 0.85, onlySuccessful = true } = {}) {
  const sc = RT_SCENARIO;
  const recorded = colDemosFromEpisodes(rtRecordTakes({ n, seed, skill }), sc);
  const synthetic = colDemosFromEpisodes(colSyntheticDemos(sc, { n, seed, skill }), sc);
  const mRec = colTrain(sc, recorded.demos, { seed, onlySuccessful });
  const mSyn = colTrain(sc, synthetic.demos, { seed, onlySuccessful });
  const seeds = colHeldOut(heldOut);
  const expert = colEvalPolicy(sc, (s) => { const e = rbEnv(sc, { seed: s }); return rbPolicy(e, { skill: 1, seed: s }); }, { seeds });
  return {
    v: RT_VERSION, scenario: sc, n, heldOut, skill, standIn: RT_SYNTHETIC_LABEL,
    recorded: { offered: recorded.demos.length, refused: recorded.refused.length, kept: mRec.demos, rows: mRec.rows.length, ...colEvalPolicy(sc, () => colPolicy(mRec), { seeds }) },
    synthetic: { offered: synthetic.demos.length, refused: synthetic.refused.length, kept: mSyn.demos, rows: mSyn.rows.length, ...colEvalPolicy(sc, () => colPolicy(mSyn), { seeds }) },
    random: colEvalPolicy(sc, (s) => colRandomPolicy(sc, s), { seeds }),
    expert,
  };
}

/**
 * A minimal in-page driver: the mouse (or a pointer from a controller ray) over `el` is the hand in the bench frame;
 * mousedown closes the trigger, the wheel sets the squeeze, a double-click is the e-stop. Records through rtRecorder,
 * so nothing is kept unless the learner is collecting. Returns { start(seed), pose(), stop(), status() }.
 */
export function rtMountTeleop(el, { seed = 7001, store = dxStore, signals = null, reducedMotion = false } = {}) {
  if (!el || typeof el.addEventListener !== "function") return null;
  const doc = el.ownerDocument;
  el.innerHTML = "";
  const status = doc.createElement("p"); status.className = "at-muted rt-status"; status.textContent = "Teleoperation: not recording (opt in on the Me tab to record takes; adults only, local only).";
  const pad = doc.createElement("div"); pad.className = "rt-pad"; pad.setAttribute("role", "application"); pad.setAttribute("aria-label", "Teleoperation pad: move the pointer to drive the gripper, hold to grip, wheel to set the grip force, double-click for e-stop");
  pad.style.cssText = "position:relative;height:160px;border:1px solid var(--at-border, #555);border-radius:8px;touch-action:none;";
  el.append(status, pad);
  let env = null, rec = null, pose = { p: [0, 0.3, -0.35], trigger: 0, squeeze: 0.5, estop: false }, timer = null;
  const tick = () => {
    if (!rec) return;
    const r = rec.step(pose);
    pose.estop = false;
    status.textContent = `${rec.active ? "Recording" : "Not recording"} · ${r.feedback ?? "…"} · placed ${rec.observation.placed}/${rec.observation.placed + rec.observation.remaining}`;
    if (r.done) api.stop();
  };
  const api = {
    start(s = seed) {
      api.stop();
      env = rbEnv(RT_SCENARIO, { seed: s });
      rec = rtRecorder(env, { store, signals });
      status.textContent = rec.active ? "Recording this take on this device (revoke on the Me tab deletes it)." : "Not recording: this take is practice only.";
      if (!reducedMotion && typeof setInterval === "function") timer = setInterval(tick, 100);
      return rec.active;
    },
    step: tick,
    pose() { return { ...pose, p: pose.p.slice() }; },
    stop() { if (timer) { clearInterval(timer); timer = null; } const ep = rec ? rec.finish() : null; rec = null; return ep; },
    status() { return status.textContent; },
  };
  pad.addEventListener("pointermove", (e) => { const b = pad.getBoundingClientRect(); pose.p = [rtR3(((e.clientX - b.left) / b.width - 0.5) * 1.2), 0.1, rtR3(((e.clientY - b.top) / b.height - 0.5) * 0.9)]; });
  pad.addEventListener("pointerdown", () => { pose.trigger = 1; });
  pad.addEventListener("pointerup", () => { pose.trigger = 0; });
  pad.addEventListener("wheel", (e) => { pose.squeeze = rtClip(pose.squeeze + (e.deltaY < 0 ? 0.05 : -0.05), 0, 1); e.preventDefault(); }, { passive: false });
  pad.addEventListener("dblclick", () => { pose.estop = true; });
  return api;
}
