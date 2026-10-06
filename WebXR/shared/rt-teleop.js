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
// Loop 6 (ROBOTRAIN-2, docs/consoles/ROBOTRAIN-2.md): a WebXR controller pose source (rtXRPose: the grip pose and the
// gamepad's trigger, squeeze and e-stop button, in the bench frame), the 3D rig at a ROBOTICS site following the pose live
// (rtFollowRig: no new mesh, it turns the drawn arm), and a SECOND TASK, Robot Cell Entry, where the pose is the walker's body
// along the approach plus the hand reaching for the post's controls (RT_TASKS). rtCompare() takes a `scenario`;
// rtCompareAll() reports both tasks.
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
 * The controls a walker's hand can reach on the cell's e-stop post and gate, as [x, y] offsets from the body (metres).
 * The e-stop is one button: a light squeeze on it is the test (press and reset), a firm squeeze holds it in.
 */
export const RT_CELL_CONTROLS = Object.freeze({ estop: [0.5, 1.1], lock: [-0.5, 1.0], verify: [-0.5, 1.4], gate: [0, 1.0], jam: [0, 0.6], restart: [0.5, 1.4] });
const rtNearControl = (pose, reach = 0.25) => Object.entries(RT_CELL_CONTROLS).find(([, c]) => Math.hypot(pose.p[0] - c[0], pose.p[1] - c[1]) <= reach)?.[0] ?? null;

/**
 * The cell-entry pose → action. The pose is { p: [hand x, hand y, body z], trigger, squeeze, estop }: p[2] is the body's
 * place along the approach line (the cell at 0, the walker at −distance), p[0]/p[1] the hand's offset from the body.
 *   - trigger closed with the hand on a control → that control's action (estop: squeeze < 0.5 test-estop, else press-estop;
 *     lock: lockout, or remove-lock when locked, outside and the jam is cleared; verify; gate: enter outside / exit inside;
 *     jam: clear-jam; restart)
 *   - otherwise a body shift past `deadband` → walk by the shift, capped by the scenario's walk step; else wait
 */
export function rtPoseToActionCell(pose, obs, { walk = rbScenario("rb-cell-entry").params.walk, deadband = 0.05 } = {}) {
  const closed = (pose.trigger ?? 0) >= 0.5;
  const ctl = closed ? rtNearControl(pose) : null;
  if (ctl === "estop") return { type: (pose.squeeze ?? 0) < 0.5 ? "test-estop" : "press-estop" };
  if (ctl === "lock") return { type: obs.locked && !obs.inside && !obs.jam ? "remove-lock" : "lockout" };
  if (ctl === "verify") return { type: "verify" };
  if (ctl === "gate") return { type: obs.inside ? "exit" : "enter" };
  if (ctl === "jam") return { type: "clear-jam" };
  if (ctl === "restart") return { type: "restart" };
  const shift = pose.p[2] + obs.distance;
  if (obs.inside || Math.abs(shift) < deadband) return { type: "wait" };
  return { type: "walk", d: rtR3(rtClip(shift, -walk, walk)) };
}

/** The scripted "human" for the cell task: the expert's intent through a walking body and a reaching hand with lag and tremor. */
export function rtScriptedHumanCell(env, { seed = 1, skill = 0.85, tremor = 0.012, lag = 0.3, squeezeNoise = 0.15 } = {}) {
  const intent = rbPolicy(env, { skill, seed }), R = rng(seed * 61 + 13);
  const CTL = { "test-estop": "estop", "press-estop": "estop", lockout: "lock", "remove-lock": "lock", verify: "verify", enter: "gate", exit: "gate", "clear-jam": "jam", restart: "restart" };
  let body = null, hand = [0, 0.9];
  return (obs) => {
    if (body === null) body = -obs.distance;
    const a = intent(obs);
    const ctl = CTL[a.type] ?? null;
    // The body walks only on a walk intent; inside the cell it holds (the observation reads distance 0 there), outside it settles on the approach line.
    const tgtBody = a.type === "walk" ? body + a.d : obs.inside ? body : -obs.distance;
    const tgtHand = ctl ? RT_CELL_CONTROLS[ctl] : [0, 0.9];
    body = body + (tgtBody - body) * (1 - lag) + (R() - 0.5) * tremor;
    for (let i = 0; i < 2; i++) hand[i] = hand[i] + (tgtHand[i] - hand[i]) * (1 - lag) + (R() - 0.5) * tremor;
    const near = ctl && Math.hypot(hand[0] - tgtHand[0], hand[1] - tgtHand[1]) <= 0.2;
    const squeeze = rtClip((a.type === "press-estop" ? 0.85 : 0.2) + (R() - 0.5) * squeezeNoise, 0, 1);
    return { p: [rtR3(hand[0]), rtR3(hand[1]), rtR3(body)], trigger: near ? 1 : 0, squeeze: rtR3(squeeze), estop: false };
  };
}

/**
 * ROBOSCENARIOS (loop 7): two more tasks through the pose path.
 * The drilling robot's pendant: the pose is the operator's hand over a panel of controls, [x, y] offsets from the body
 * (metres); a closed trigger with the hand on a control is that control's command. The e-stop pose holds the robot.
 */
export const RT_DRILL_CONTROLS = Object.freeze({ scan: [-0.6, 1.0], barricade: [-0.3, 1.0], dust: [0, 1.0], drill: [0.3, 1.0], hold: [0.6, 1.0], isolate: [-0.3, 1.3], bit: [0, 1.3], restore: [0.3, 1.3] });
const rtNearDrillControl = (pose, reach = 0.12) => Object.entries(RT_DRILL_CONTROLS).find(([, c]) => Math.hypot(pose.p[0] - c[0], pose.p[1] - c[1]) <= reach)?.[0] ?? null;
const RT_DRILL_ACTION = Object.freeze({ scan: "scan", barricade: "barricade", dust: "dust-on", drill: "drill", hold: "hold", isolate: "isolate", bit: "change-bit", restore: "restore" });
export function rtPoseToActionDrill(pose, obs) {
  if (pose.estop) return { type: "hold" };
  const ctl = (pose.trigger ?? 0) >= 0.5 ? rtNearDrillControl(pose) : null;
  void obs;
  return ctl ? { type: RT_DRILL_ACTION[ctl] } : { type: "wait" };
}
/** The scripted "human" at the pendant: the expert's intent through a reaching hand with lag and tremor (labelled synthetic). */
export function rtScriptedHumanDrill(env, { seed = 1, skill = 0.85, tremor = 0.012, lag = 0.3 } = {}) {
  const intent = rbPolicy(env, { skill, seed }), R = rng(seed * 61 + 13);
  const CTL = Object.fromEntries(Object.entries(RT_DRILL_ACTION).map(([k, v]) => [v, k]));
  const hand = [0, 0.8];
  return (obs) => {
    const a = intent(obs), ctl = CTL[a.type] ?? null;
    const tgt = ctl ? RT_DRILL_CONTROLS[ctl] : [0, 0.8];
    for (let i = 0; i < 2; i++) hand[i] = hand[i] + (tgt[i] - hand[i]) * (1 - lag) + (R() - 0.5) * tremor;
    const near = ctl && Math.hypot(hand[0] - tgt[0], hand[1] - tgt[1]) <= 0.1;
    return { p: [rtR3(hand[0]), rtR3(hand[1]), 0], trigger: near ? 1 : 0, squeeze: 0, estop: false };
  };
}
/**
 * The port gantry's joystick: p[0]/p[2] is the stick's deflection (east/west, north/south in the yard frame), the trigger
 * is the drive enable, a squeeze works the spreader (lift when empty, set when loaded). Trigger closed with the stick
 * centred holds the gantry; trigger open is nothing.
 */
export function rtPoseToActionPort(pose, obs, { deadband = 0.15 } = {}) {
  if (pose.estop) return { type: "hold" };
  if ((pose.squeeze ?? 0) >= 0.5) return { type: obs.carrying ? "set" : "lift" };
  if ((pose.trigger ?? 0) < 0.5) return { type: "wait" };
  const dx = pose.p[0], dz = pose.p[2];
  if (Math.max(Math.abs(dx), Math.abs(dz)) < deadband) return { type: "hold" };
  return { type: "move", dir: Math.abs(dx) >= Math.abs(dz) ? (dx > 0 ? "E" : "W") : (dz > 0 ? "S" : "N") };
}
const RT_STICK = Object.freeze({ E: [0.6, 0], W: [-0.6, 0], N: [0, -0.6], S: [0, 0.6] });
/** The scripted "human" on the joystick: the expert's intent as stick deflections with lag and tremor (labelled synthetic). */
export function rtScriptedHumanPort(env, { seed = 1, skill = 0.85, tremor = 0.012, lag = 0.3 } = {}) {
  const intent = rbPolicy(env, { skill, seed }), R = rng(seed * 61 + 13);
  const stick = [0, 0];
  return (obs) => {
    const a = intent(obs);
    const tgt = a.type === "move" ? RT_STICK[a.dir] : [0, 0];
    for (let i = 0; i < 2; i++) stick[i] = stick[i] + (tgt[i] - stick[i]) * (1 - lag) + (R() - 0.5) * tremor;
    const settled = Math.hypot(stick[0] - tgt[0], stick[1] - tgt[1]) <= 0.2;
    const lifting = a.type === "lift" || a.type === "set";
    return { p: [rtR3(stick[0]), 0, rtR3(stick[1])], trigger: !lifting && settled && (a.type === "move" || a.type === "hold") ? 1 : 0, squeeze: lifting ? 0.9 : 0.1, estop: false };
  };
}

/** The tasks the pose path covers: the pose → action mapping and the scripted stand-in for each. */
export const RT_TASKS = Object.freeze({
  "rb-teleop-pick-place": { poseToAction: rtPoseToAction, human: rtScriptedHuman, frame: "bench: p is the hand (m)" },
  "rb-cell-entry": { poseToAction: rtPoseToActionCell, human: rtScriptedHumanCell, frame: "approach: p is [hand x, hand y, body z]" },
  "rb-construction-drilling": { poseToAction: rtPoseToActionDrill, human: rtScriptedHumanDrill, frame: "pendant: p is [hand x, hand y, 0] over the control panel" },
  "rb-port-gantry": { poseToAction: rtPoseToActionPort, human: rtScriptedHumanPort, frame: "joystick: p is [east-west, 0, north-south] deflection" },
});
export const RT_TASK_IDS = Object.freeze(Object.keys(RT_TASKS));
function rtTask(sc) { const t = RT_TASKS[sc]; if (!t) throw new Error(`rt-teleop: no pose mapping for ${sc}`); return t; }

/**
 * A WebXR controller at an XRFrame → a pose in the bench frame. Pure given the WebXR objects (or plain stubs shaped like them):
 * `frame.getPose(inputSource.gripSpace ?? inputSource.targetRaySpace, refSpace)?.transform.position` is the hand, mapped into
 * the bench frame by `origin` and `scale`; the gamepad's buttons give trigger (0), squeeze (1) and the e-stop (3 or 4, the A/X
 * face buttons). Returns null when the source has no pose this frame. Nothing is stored.
 */
export const RT_XR_FRAME = Object.freeze({ origin: [0, 1.0, -0.5], scale: 1 });
export function rtXRPose(inputSource, frame, refSpace, { origin = RT_XR_FRAME.origin, scale = RT_XR_FRAME.scale } = {}) {
  const space = inputSource?.gripSpace ?? inputSource?.targetRaySpace;
  if (!space || typeof frame?.getPose !== "function") return null;
  const xp = frame.getPose(space, refSpace);
  const q = xp?.transform?.position;
  if (!q) return null;
  const b = inputSource.gamepad?.buttons ?? [];
  const v = (i) => (b[i] ? (typeof b[i].value === "number" ? b[i].value : b[i].pressed ? 1 : 0) : 0);
  return { p: [rtR3((q.x - origin[0]) * scale), rtR3(Math.max(0, (q.y - origin[1]) * scale)), rtR3((q.z - origin[2]) * scale)], trigger: rtR3(rtClip(v(0), 0, 1)), squeeze: rtR3(rtClip(v(1), 0, 1)), estop: !!(b[3]?.pressed || b[4]?.pressed), hand: inputSource.handedness ?? "none" };
}

/**
 * The drawn rig at a ROBOTICS site follows the arm's effector live: the rig's yaw turns toward the effector and the arm
 * (the child flagged `userData.pivot`) pitches with its height. No mesh is added; `rig.userData.rtDriven` tells rb-world's
 * sweep to leave the rig alone until rtReleaseRig. Pure given a node with `rotation` and `children`. Returns { yaw, pitch }.
 */
export function rtFollowRig(rig, obs) {
  if (!rig?.rotation || !obs?.effector) return null;
  const [x, y, z] = obs.effector;
  const yaw = rtR3(Math.atan2(-x, z + 0.6)), pitch = rtR3(rtClip(-(y - 0.3) * 1.5, -0.9, 0.6));
  rig.userData = rig.userData ?? {}; rig.userData.rtDriven = true;
  rig.rotation.y = yaw;
  const arm = (rig.children ?? []).find((c) => c.userData?.pivot);
  if (arm?.rotation) arm.rotation.x = pitch;
  return { yaw, pitch };
}
export function rtReleaseRig(rig) {
  if (!rig) return;
  if (rig.userData) rig.userData.rtDriven = false;
  const arm = (rig.children ?? []).find((c) => c.userData?.pivot);
  if (arm?.rotation) arm.rotation.x = 0;
}

/**
 * The recorder for a learner's take. Wraps DATAWORKS' dxRecorder, so it is inert (`active: false`, nothing buffered)
 * unless the learner is collecting right now; the episode is validated and stored locally by dxRecorder on finish.
 * `step(pose)` drives the env and records { observation, action, reward, info }; `finish()` returns the episode or null.
 */
export function rtRecorder(env, { store = dxStore, signals = null, clock = () => Date.now(), map = null } = {}) {
  const sc = env.scenario.id;
  const toAction = rtTask(sc).poseToAction;
  const rec = dxRecorder({ world: "robotics", map, kind: "robot-game", scenario: sc, generator: "shared/rt-teleop.js rtRecorder", recordedWith: "browser", notes: { input: "controller-pose", envSchema: env.scenario.id } }, { store, signals, clock });
  let obs = env.reset(), last = null, steps = 0;
  return {
    get active() { return rec.active; },
    get observation() { return obs; },
    collecting: () => dxCollecting(signals),
    step(pose) {
      const action = toAction(pose, obs);
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
export function rtRecordTakes({ n = 40, seed = 1, skill = 0.85, tremor = 0.012, lag = 0.3, scenario = RT_SCENARIO } = {}) {
  const eps = [], task = rtTask(scenario);
  for (let k = 0; k < n; k++) {
    const s = seed * 100003 + k + 1;
    const env = rbEnv(scenario, { seed: s });
    const human = task.human(env, { seed: s, skill, tremor, lag });
    const { steps, summary } = rbRollout(env, { seed: s, policy: (o) => task.poseToAction(human(o), o) });
    eps.push(dxMakeEpisode({
      source: "synthetic", world: "robotics", kind: "robot-game", scenario, episodeId: scenario === RT_SCENARIO ? `rt-take-${s}` : `rt-take-${scenario}-${s}`,
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
export function rtCompare({ n = 40, seed = 1, heldOut = 60, skill = 0.85, onlySuccessful = true, scenario = RT_SCENARIO } = {}) {
  const sc = scenario; rtTask(sc);
  const recorded = colDemosFromEpisodes(rtRecordTakes({ n, seed, skill, scenario: sc }), sc);
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

/** rtCompare on every task the pose path covers: { [scenario]: rtCompare(...) }. */
export function rtCompareAll(opts = {}) {
  return Object.fromEntries(RT_TASK_IDS.map((sc) => [sc, rtCompare({ ...opts, scenario: sc })]));
}

/**
 * A minimal in-page driver: the mouse or a finger (pointer events; touch-action none) over `el` is the hand in the bench
 * frame; pointerdown closes the trigger, the wheel (or a second finger) sets the squeeze, a double-click is the e-stop. In
 * WebXR, `api.xr(frame, refSpace)` reads the session's controllers through rtXRPose each frame and takes over the pose. With
 * `rig` (a ROBOTICS site's drawn rig, rbMountRobotics().rigNode(id)) the arm follows the effector live. Records through
 * rtRecorder, so nothing is kept unless the learner is collecting.
 * Returns { start(seed), step(), pose(), xr(frame, refSpace), source(), stop(), status(), rig() }.
 */
export function rtMountTeleop(el, { seed = 7001, store = dxStore, signals = null, reducedMotion = false, rig = null, hand = "right" } = {}) {
  if (!el || typeof el.addEventListener !== "function") return null;
  const doc = el.ownerDocument;
  el.innerHTML = "";
  const status = doc.createElement("p"); status.className = "at-muted rt-status"; status.textContent = "Teleoperation: not recording (opt in on the Me tab to record takes; adults only, local only).";
  const pad = doc.createElement("div"); pad.className = "rt-pad"; pad.setAttribute("role", "application"); pad.setAttribute("aria-label", "Teleoperation pad: move the pointer to drive the gripper, hold to grip, wheel to set the grip force, double-click for e-stop");
  pad.style.cssText = "position:relative;height:160px;border:1px solid var(--at-border, #555);border-radius:8px;touch-action:none;";
  el.append(status, pad);
  let env = null, rec = null, pose = { p: [0, 0.3, -0.35], trigger: 0, squeeze: 0.5, estop: false }, timer = null, source = "pointer", xrLast = 0, touches = 0;
  const tick = () => {
    if (!rec) return;
    const r = rec.step(pose);
    pose.estop = false;
    if (rig) rtFollowRig(rig, rec.observation);
    status.textContent = `${rec.active ? "Recording" : "Not recording"} · ${source} · ${r.feedback ?? "…"} · placed ${rec.observation.placed}/${rec.observation.placed + rec.observation.remaining}`;
    if (r.done) api.stop();
  };
  const api = {
    start(s = seed) {
      api.stop();
      env = rbEnv(RT_SCENARIO, { seed: s });
      rec = rtRecorder(env, { store, signals });
      if (rig) rtFollowRig(rig, rec.observation);
      status.textContent = rec.active ? "Recording this take on this device (revoke on the Me tab deletes it)." : "Not recording: this take is practice only.";
      if (!reducedMotion && typeof setInterval === "function") timer = setInterval(tick, 100);
      return rec.active;
    },
    step: tick,
    pose() { return { ...pose, p: pose.p.slice() }; },
    /** One WebXR frame: the preferred hand's controller (else any) becomes the pose; the pointer pad stays the fallback. */
    xr(frame, refSpace) {
      const sources = [...(frame?.session?.inputSources ?? [])];
      const src = sources.find((s) => s.handedness === hand) ?? sources[0];
      const xp = src ? rtXRPose(src, frame, refSpace) : null;
      if (!xp) { if (xrLast && Date.now() - xrLast > 1500) source = "pointer"; return null; }
      pose = { p: xp.p, trigger: xp.trigger, squeeze: xp.squeeze, estop: pose.estop || xp.estop }; source = "xr"; xrLast = Date.now();
      return api.pose();
    },
    source() { return source; },
    rig() { return rig; },
    stop() { if (timer) { clearInterval(timer); timer = null; } const ep = rec ? rec.finish() : null; rec = null; if (rig) rtReleaseRig(rig); return ep; },
    status() { return status.textContent; },
  };
  const fromPad = (e) => { if (source === "xr" && Date.now() - xrLast < 1500) return; source = e.pointerType === "touch" ? "touch" : "pointer"; const b = pad.getBoundingClientRect(); pose.p = [rtR3(((e.clientX - b.left) / b.width - 0.5) * 1.2), 0.1, rtR3(((e.clientY - b.top) / b.height - 0.5) * 0.9)]; };
  pad.addEventListener("pointermove", fromPad);
  pad.addEventListener("pointerdown", (e) => { fromPad(e); if (e.pointerType === "touch") { touches += 1; if (touches >= 2) pose.squeeze = rtR3(pose.squeeze + 0.15 > 1 ? 0.2 : pose.squeeze + 0.15); } pose.trigger = 1; });
  pad.addEventListener("pointerup", (e) => { if (e.pointerType === "touch") touches = Math.max(0, touches - 1); if (!touches) pose.trigger = 0; });
  pad.addEventListener("pointercancel", () => { touches = 0; pose.trigger = 0; });
  pad.addEventListener("wheel", (e) => { pose.squeeze = rtClip(pose.squeeze + (e.deltaY < 0 ? 0.05 : -0.05), 0, 1); e.preventDefault(); }, { passive: false });
  pad.addEventListener("dblclick", () => { pose.estop = true; });
  return api;
}
