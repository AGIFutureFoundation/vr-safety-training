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
// rtCompareAll() reports every task (loop 9, ROBOTRAIN-5: six, the two hard variants included).
//
// Loop 8 (ROBOTRAIN-4, docs/consoles/ROBOTRAIN-4.md): the cell task's ghost drives the rig AND a walker figure — the cell-entry
// observation carries `walker { at, hand, control }` (rb-env.js), rtFollowRig moves an optional `walker` node (the app's
// figure, a sibling of the rig) along the approach with its hand at the control, and poses the cell arm by the robot's mode.
//
// No network call, no upload, no model call. Every top-level name is prefixed rt/RT_ (the bundler shares one scope).

import { rng } from "./robot.js";
import { rbEnv, rbPolicy, rbRollout, rbScenario } from "./rb-env.js";
import { RB_CELL_CONTROLS } from "./rb-robotics-data.js";
import { dxMakeEpisode, dxRecorder, dxCollecting, dxStore } from "./dx-data.js";
import { colDemosFromEpisodes, colSyntheticDemos, colTrain, colPolicy, colEvalPolicy, colRandomPolicy, colHeldOut, colGhost } from "./col-learn.js";
import { agRate } from "./ag-feedback.js";

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
export const RT_CELL_CONTROLS = Object.freeze(Object.fromEntries(Object.entries(RB_CELL_CONTROLS).filter(([k]) => k !== "rest"))); // the sim's table (rb-robotics-data.js) minus the rest pose
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
// ROBOTRAIN-5: the hard variants (rb-env.js `<id>#hard`, measured in docs/evals/colearn.json `variants`) are tasks too, on the same
// controls as their base scenario, so rtCompareAll() reports recorded-vs-synthetic on them. `label` is the pad's select text.
export const RT_TASKS = Object.freeze({
  "rb-teleop-pick-place": { poseToAction: rtPoseToAction, human: rtScriptedHuman, frame: "bench: p is the hand (m)", label: "Teleop pick-and-place (the arm)" },
  "rb-cell-entry": { poseToAction: rtPoseToActionCell, human: rtScriptedHumanCell, frame: "approach: p is [hand x, hand y, body z]", label: "Robot cell entry (walk, controls)" },
  "rb-construction-drilling": { poseToAction: rtPoseToActionDrill, human: rtScriptedHumanDrill, frame: "pendant: p is [hand x, hand y, 0] over the control panel", label: "Drilling robot (pendant)" },
  "rb-port-gantry": { poseToAction: rtPoseToActionPort, human: rtScriptedHumanPort, frame: "joystick: p is [east-west, 0, north-south] deflection", label: "Port gantry (joystick)" },
  "rb-construction-drilling#hard": { poseToAction: rtPoseToActionDrill, human: rtScriptedHumanDrill, frame: "pendant: p is [hand x, hand y, 0] over the control panel", label: "Drilling robot, hard (second person, wearing bit)" },
  "rb-port-gantry#hard": { poseToAction: rtPoseToActionPort, human: rtScriptedHumanPort, frame: "joystick: p is [east-west, 0, north-south] deflection", label: "Port gantry, hard (second pedestrian, obstruction)" },
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
export function rtFollowRig(rig, obs, { walker = null } = {}) {
  if (obs?.walker) return rtFollowCell(rig, obs, walker);
  if (!rig?.rotation || !obs?.effector) return null;
  const [x, y, z] = obs.effector;
  const yaw = rtR3(Math.atan2(-x, z + 0.6)), pitch = rtR3(rtClip(-(y - 0.3) * 1.5, -0.9, 0.6));
  rig.userData = rig.userData ?? {}; rig.userData.rtDriven = true;
  rig.rotation.y = yaw;
  const arm = (rig.children ?? []).find((c) => c.userData?.pivot);
  if (arm?.rotation) arm.rotation.x = pitch;
  return { yaw, pitch };
}
export function rtReleaseRig(rig, walker = null) {
  if (walker) walker.visible = false;
  if (!rig) return;
  if (rig.userData) rig.userData.rtDriven = false;
  const arm = (rig.children ?? []).find((c) => c.userData?.pivot);
  if (arm?.rotation) arm.rotation.x = 0;
}

/**
 * The cell task on the rig and the walker figure (ROBOTRAIN-4). The cell arm is posed by the robot's mode — sweeping mid-arc at
 * full speed, square to the gate and slowed inside the warning zone, parked (pitched down) when protective-stopped, e-stopped or
 * locked out, back to the arc on restart — and `walker` (any node with `position`; a child flagged `userData.hand` is the hand)
 * stands on the approach at obs.walker.at with the hand at the control in use. Pure given plain nodes. Returns { yaw, pitch, at }.
 */
export function rtFollowCell(rig, obs, walker = null) {
  const w = obs?.walker; if (!w) return null;
  const mode = obs.robotMode ?? "full";
  const yaw = mode === "full" && !obs.restarted ? 0.8 : 0, pitch = mode === "full" ? 0 : mode === "reduced" ? -0.3 : 0.6;
  if (rig?.rotation) {
    rig.userData = rig.userData ?? {}; rig.userData.rtDriven = true;
    rig.rotation.y = yaw;
    const arm = (rig.children ?? []).find((c) => c.userData?.pivot);
    if (arm?.rotation) arm.rotation.x = pitch;
  }
  if (walker?.position) {
    walker.visible = true;
    if (typeof walker.position.set === "function") walker.position.set(w.at[0], w.at[1], w.at[2]); else { walker.position.x = w.at[0]; walker.position.y = w.at[1]; walker.position.z = w.at[2]; }
    const hand = (walker.children ?? []).find((c) => c.userData?.hand);
    if (hand?.position) { if (typeof hand.position.set === "function") hand.position.set(w.hand[0], w.hand[1], 0.2); else { hand.position.x = w.hand[0]; hand.position.y = w.hand[1]; hand.position.z = 0.2; } }
  }
  return { yaw, pitch, at: w.at.slice(), control: w.control };
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

/** The pad's HUD line per task (pure over the observation): what the learner is doing and where the task stands. */
export function rtHudLine(sc, obs, { recording = false, source = "pointer", feedback = null } = {}) {
  const head = `${recording ? "Recording" : "Not recording"} · ${source} · ${feedback ?? "…"}`;
  if (sc === "rb-cell-entry") {
    const where = obs.inside ? "inside the cell" : `${obs.distance} m from the cell`;
    const state = [obs.estopTested ? "e-stop tested" : null, obs.estopped ? "stopped" : null, obs.locked ? "locked out" : null, obs.verified ? "verified" : null, obs.jam ? "jam" : "jam cleared", obs.restarted ? "restarted" : null].filter(Boolean).join(", ");
    return `${head} · cell entry: ${where} · ${state}`;
  }
  return `${head} · placed ${obs.placed}/${obs.placed + obs.remaining}`;
}

/** The pad's default pose per task (the hand at rest in that task's frame). */
export const RT_REST_POSE = Object.freeze({ "rb-teleop-pick-place": [0, 0.3, -0.35], "rb-cell-entry": [0, 0.9, -8] });

/** ROBOTRAIN-7: one cloned robot run to show and rate: the k-NN policy rolled out once on `seed` on the model's task. The steps
 * keep the action type and whether a rule broke (what agRate's rating episode and rt6TrajFeatures read); the summary's
 * `station` is the task id, so ratings of the same task pair up in agPreferencePairs. */
export function rt7RobotRun(model, seed) {
  const sc = model.scenario, env = rbEnv(sc, { seed });
  const { steps, summary } = rbRollout(env, { seed, policy: colPolicy(model) });
  const broke = (s) => (s.info?.violations ?? []).length > 0;
  return {
    kind: "robot-game", scenario: sc,
    summary: { station: sc, seed, passed: !!summary.passed, stationScore: Math.round((summary.score ?? 0) * 100) / 100, errors: summary.violationCount ?? 0, hazardHits: summary.violationCount ?? 0, steps: summary.steps },
    steps: steps.map((s) => ({ t: s.info?.t ?? 0, observation: {}, action: { type: s.action?.type ?? "wait" }, info: { unsafe: broke(s), hazard: broke(s) }, done: !!s.done })),
  };
}

/**
 * A minimal in-page driver: the mouse or a finger (pointer events; touch-action none) over `el` is the hand in the task's frame;
 * pointerdown closes the trigger, the wheel (or a second finger) sets the squeeze, a double-click is the e-stop. In WebXR,
 * `api.xr(frame, refSpace)` reads the session's controllers through rtXRPose each frame and takes over the pose. With `rig` (a
 * ROBOTICS site's drawn rig, rbMountRobotics().rigNode(id)) the arm follows the effector live. Records through rtRecorder, so
 * nothing is kept unless the learner is collecting.
 *
 * Loop 7 (ROBOTRAIN-3): `task` picks the task (every RT_TASKS id; the select on the pad switches it) — on the cell task the pad's
 * x/y are the hand's offset from the body (the e-stop post's controls at RT_CELL_CONTROLS), the wheel walks the body along the
 * approach (up: toward the cell), a right-button press is the firm squeeze (press-estop), a left press the light one (test);
 * `onTake(episode | null, summary)` fires when a take ends (the app re-reads the learner's consented takes for the provider);
 * `demonstrate()` replays the policy's run as a GHOST on the same rig — `modelFor(sc)` (vb-colearn.js' provider) or, without
 * it, a COLEARN model on synthetic demonstrations — one frame at a time with the explanation on the status line.
 * `walker` (ROBOTRAIN-4) is the app's figure for the cell task: a take and the ghost move it along the approach (rtFollowCell).
 * Returns { start(seed), step(), pose(), xr(frame, refSpace), source(), stop(), status(), rig(), walker(), task(id?), demonstrate(), ghost(), tasks }.
 */
export function rtMountTeleop(el, { seed = 7001, store = dxStore, signals = null, reducedMotion = false, rig = null, walker = null, hand = "right", task = RT_SCENARIO, onTake = null, modelFor = null } = {}) {
  if (!el || typeof el.addEventListener !== "function") return null;
  const doc = el.ownerDocument;
  el.innerHTML = "";
  const status = doc.createElement("p"); status.className = "at-muted rt-status"; status.textContent = "Teleoperation: not recording (opt in on the Me tab to record takes; adults only, local only).";
  const row = doc.createElement("div"); row.className = "rt-row"; row.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0;";
  const sel = doc.createElement("select"); sel.className = "rt-task"; sel.setAttribute("aria-label", "Teleoperation task");
  sel.style.cssText = "min-height:44px;padding:8px 10px;font:inherit;max-width:100%;"; // a 44 px touch target on phones (check_interface)
  for (const id of RT_TASK_IDS) { const o = doc.createElement("option"); o.value = id; o.textContent = RT_TASKS[id].label ?? id; sel.append(o); }
  const bGhost = doc.createElement("button"); bGhost.type = "button"; bGhost.className = "rt-ghost"; bGhost.textContent = "Robot demonstrates back"; bGhost.disabled = true;
  bGhost.title = "After a take: the trained policy replays its own run on this rig, one step at a time, with its explanation.";
  // ROBOTRAIN-7: rate two of the trained policy's runs (thumbs up or down) through AGENTGYM's agRate: kept on this device only
  // while collecting (adult, signed in, opted in; never K-12, demo or signed-out); revoke on the Me tab deletes the ratings.
  const bRate = doc.createElement("button"); bRate.type = "button"; bRate.className = "rt-rate-open"; bRate.textContent = "Rate two robot runs";
  bRate.title = "The trained policy runs this task twice. A thumbs up or down on each is kept on this device only if you opted in (adults only).";
  row.append(sel, bGhost, bRate);
  const rateBox = doc.createElement("div"); rateBox.className = "rt-rate"; rateBox.setAttribute("aria-live", "polite");
  const pad = doc.createElement("div"); pad.className = "rt-pad"; pad.setAttribute("role", "application"); pad.setAttribute("aria-label", "Teleoperation pad: move the pointer to drive the gripper, hold to grip, wheel to set the grip force, double-click for e-stop");
  pad.style.cssText = "position:relative;height:160px;border:1px solid var(--at-border, #555);border-radius:8px;touch-action:none;";
  el.append(status, row, pad, rateBox);
  let sc = RT_TASKS[task] ? task : RT_SCENARIO;
  let env = null, rec = null, pose = { p: RT_REST_POSE[sc].slice(), trigger: 0, squeeze: 0.5, estop: false }, timer = null, source = "pointer", xrLast = 0, touches = 0;
  let ghost = { frames: [], i: -1, timer: null, model: null }, lastTake = null, rated = { runs: [], model: null, results: [] };
  const isCell = () => sc === "rb-cell-entry";
  const setTask = (id) => {
    if (!RT_TASKS[id]) return sc;
    api.stop(); sc = id; sel.value = id; pose = { p: RT_REST_POSE[sc].slice(), trigger: 0, squeeze: 0.5, estop: false };
    pad.setAttribute("aria-label", isCell() ? "Cell-entry pad: the pointer is your hand at the e-stop post (left press: light squeeze, right press: firm), the wheel walks you toward the cell" : "Teleoperation pad: move the pointer to drive the gripper, hold to grip, wheel to set the grip force, double-click for e-stop");
    status.textContent = `Task: ${isCell() ? "Robot cell entry" : "Teleop pick-and-place"} · not started.`;
    return sc;
  };
  const tick = () => {
    if (!rec) return;
    const r = rec.step(pose);
    pose.estop = false;
    if (rig || walker) rtFollowRig(rig, rec.observation, { walker });
    status.textContent = rtHudLine(sc, rec.observation, { recording: rec.active, source, feedback: r.feedback });
    if (r.done) api.stop();
  };
  const ghostStop = () => { if (ghost.timer) { clearInterval(ghost.timer); ghost.timer = null; } if (ghost.frames.length && (rig || walker)) rtReleaseRig(rig, walker); ghost.frames = []; ghost.i = -1; };
  const ghostShow = () => {
    const f = ghost.frames[ghost.i]; if (!f) return;
    if ((rig || walker) && (f.observation?.effector || f.observation?.walker)) rtFollowRig(rig, f.observation, { walker });
    const src = ghost.model?.provenance?.own ? `your ${ghost.model.provenance.n} take${ghost.model.provenance.n === 1 ? "" : "s"}` : "synthetic demonstrations";
    status.textContent = `Robot demonstrates back (${src}) · step ${ghost.i + 1}/${ghost.frames.length} · ${f.action ? f.action.type : "done"} · ${f.explain}`;
  };
  const api = {
    tasks: RT_TASK_IDS,
    task(id) { return id ? setTask(id) : sc; },
    start(s = seed) {
      api.stop(); ghostStop();
      // a fresh take starts from the rest pose with the trigger open and the pad as the source; an XR frame takes over on the next frame
      pose = { p: RT_REST_POSE[sc].slice(), trigger: 0, squeeze: 0.5, estop: false }; source = "pointer"; xrLast = 0; touches = 0;
      env = rbEnv(sc, { seed: s });
      rec = rtRecorder(env, { store, signals });
      if (rig || walker) rtFollowRig(rig, rec.observation, { walker });
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
      // On the cell task the frame is floor-based (a local-floor space): the controller's height is the hand's height at the post's
      // controls (RT_CELL_CONTROLS y, metres above the floor), its x the hand's offset, its z the body's place along the approach.
      const xp = src ? rtXRPose(src, frame, refSpace, isCell() ? { origin: [RT_XR_FRAME.origin[0], 0, RT_XR_FRAME.origin[2]] } : {}) : null;
      if (!xp) { if (xrLast && Date.now() - xrLast > 1500) source = "pointer"; return null; }
      pose = { p: xp.p, trigger: xp.trigger, squeeze: xp.squeeze, estop: pose.estop || xp.estop }; source = "xr"; xrLast = Date.now();
      return api.pose();
    },
    source() { return source; },
    rig() { return rig; },
    walker() { return walker; },
    stop() {
      if (timer) { clearInterval(timer); timer = null; }
      const had = !!rec, steps = rec ? rec.steps() : 0;
      const ep = rec ? rec.finish() : null; rec = null; if (rig || walker) rtReleaseRig(rig, walker);
      if (had && steps > 0) { lastTake = { scenario: sc, steps, kept: !!ep }; bGhost.disabled = false; try { onTake?.(ep, lastTake); } catch (_) { /* never blocks the pad */ } }
      return ep;
    },
    status() { return status.textContent; },
    /** The ghost: the policy's own run on this task replayed on the same rig, with its explanation per step. Returns the frame count. */
    demonstrate(s = seed) {
      api.stop(); ghostStop();
      let model = null;
      if (modelFor) { try { model = modelFor(sc) ?? null; } catch (_) { model = null; } }
      if (!model) { model = colTrain(sc, colDemosFromEpisodes(colSyntheticDemos(sc, { n: 30, seed: 1 }), sc).demos, { seed: 1 }); model.provenance = { own: false, source: "synthetic human stand-in (colSyntheticDemos)", n: 30, kept: model.demos }; }
      ghost = { frames: colGhost(model, { seed: s }), i: 0, timer: null, model };
      ghostShow();
      if (!reducedMotion && typeof setInterval === "function") ghost.timer = setInterval(() => { if (ghost.i < ghost.frames.length - 1) { ghost.i += 1; ghostShow(); } else ghostStop(); }, 400);
      return ghost.frames.length;
    },
    /** Step the ghost by hand (reduced motion, or a headless drive): the next frame, or null when it has ended. */
    ghost() { if (!ghost.frames.length) return null; if (ghost.i < ghost.frames.length - 1) { ghost.i += 1; ghostShow(); return ghost.frames[ghost.i]; } ghostStop(); return null; },
    lastTake() { return lastTake; },
    /** ROBOTRAIN-7: show two of the policy's runs on this task (seeds s and s + 1) with a thumbs up and down on each. The buttons
     * are enabled only while collecting. Returns { collecting, runs: [{ seed, passed, steps, rulesBroken }] }. */
    rateRuns(s = seed) {
      api.stop(); ghostStop();
      let model = null;
      if (modelFor) { try { model = modelFor(sc) ?? null; } catch (_) { model = null; } }
      if (!model) { model = colTrain(sc, colDemosFromEpisodes(colSyntheticDemos(sc, { n: 30, seed: 1 }), sc).demos, { seed: 1 }); model.provenance = { own: false, source: "synthetic human stand-in (colSyntheticDemos)", n: 30, kept: model.demos }; }
      const on = dxCollecting(signals);
      rated = { runs: [rt7RobotRun(model, s), rt7RobotRun(model, s + 1)], model, results: [null, null] };
      rateBox.innerHTML = "";
      const note = doc.createElement("p"); note.className = "at-muted rt-rate-note";
      note.textContent = on ? "Rate each run: your ratings stay on this device, and revoke on the Me tab deletes them." : "Rating is off: opt in on the Me tab first (adults only; never K-12, demo or signed-out). Nothing is kept.";
      rateBox.append(note);
      rated.runs.forEach((run, k) => {
        const card = doc.createElement("div"); card.className = "rt-rate-card"; card.dataset.run = String(k);
        card.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0;";
        const label = doc.createElement("span"); label.className = "rt-rate-label";
        label.textContent = `Run ${k ? "B" : "A"} (simulated): ${run.summary.passed ? "finished" : "did not finish"} in ${run.summary.steps} steps, ${run.summary.hazardHits} rule${run.summary.hazardHits === 1 ? "" : "s"} broken`;
        const mk = (rating, text) => { const b = doc.createElement("button"); b.type = "button"; b.className = `rt-rate-${rating}`; b.textContent = text; b.disabled = !on; b.style.cssText = "min-height:44px;"; b.setAttribute("aria-label", `${text} for run ${k ? "B" : "A"}`); b.addEventListener("click", () => { api.rate(k, rating); }); return b; };
        card.append(label, mk("up", "Thumbs up"), mk("down", "Thumbs down"));
        rateBox.append(card);
      });
      status.textContent = `Two runs of the trained policy (${model.provenance?.own ? "your takes" : "synthetic demonstrations"}) on this task, ready to rate.`;
      return { collecting: on, runs: rated.runs.map((r) => ({ seed: r.summary.seed, passed: r.summary.passed, steps: r.summary.steps, rulesBroken: r.summary.hazardHits })) };
    },
    /** Rate run k ("up" or "down") through agRate. Resolves { ok, episodeId } or { ok: false, reason }; inert unless collecting. */
    async rate(k, rating) {
      const run = rated.runs[k];
      if (!run) return { ok: false, reason: "no run to rate: press Rate two robot runs first" };
      const reason = rating === "up" ? (run.summary.hazardHits ? "efficient" : "safe-order") : (run.summary.hazardHits ? "unsafe-touch" : "slow");
      const res = await agRate({ run, agent: `robot-clone:${rated.model?.provenance?.own ? "your-takes" : "synthetic"}`, rating, reason, signals, runId: `robot-clone:${run.summary.station}:${run.summary.seed}` }, { store });
      rated.results[k] = res;
      const card = rateBox.querySelector(`[data-run="${k}"] .rt-rate-label`);
      if (card) card.dataset.rated = res.ok ? rating : "refused";
      status.textContent = res.ok ? `Run ${k ? "B" : "A"} rated thumbs ${rating}: kept on this device (revoke on the Me tab deletes it).` : `Not kept: ${res.reason}`;
      return res;
    },
    /** The robot-run ratings this device holds (local DX episodes; empty unless an opted-in adult rated, and after revoke). */
    async ratings() { try { return (await store.list()).filter((e) => e.kind === "gym" && /^agent-rating:rb-/.test(String(e.scenario))); } catch (_) { return []; } },
  };
  const fromPad = (e) => {
    if (source === "xr" && Date.now() - xrLast < 1500) return;
    source = e.pointerType === "touch" ? "touch" : "pointer"; const b = pad.getBoundingClientRect();
    const u = (e.clientX - b.left) / b.width - 0.5, v = (e.clientY - b.top) / b.height - 0.5;
    pose.p = isCell() ? [rtR3(u * 1.4), rtR3(1.0 - v * 1.2), pose.p[2]] : [rtR3(u * 1.2), 0.1, rtR3(v * 0.9)];
  };
  pad.addEventListener("pointermove", fromPad);
  pad.addEventListener("pointerdown", (e) => { fromPad(e); if (e.pointerType === "touch") { touches += 1; if (touches >= 2) pose.squeeze = rtR3(pose.squeeze + 0.15 > 1 ? 0.2 : pose.squeeze + 0.15); } else if (isCell()) pose.squeeze = e.button === 2 ? 0.9 : 0.2; pose.trigger = 1; });
  pad.addEventListener("pointerup", (e) => { if (e.pointerType === "touch") touches = Math.max(0, touches - 1); if (!touches) pose.trigger = 0; });
  pad.addEventListener("pointercancel", () => { touches = 0; pose.trigger = 0; });
  pad.addEventListener("contextmenu", (e) => { if (isCell()) e.preventDefault(); });
  pad.addEventListener("wheel", (e) => {
    if (isCell()) { const d = rec?.observation?.distance ?? -pose.p[2]; pose.p[2] = rtR3(rtClip(pose.p[2] + (e.deltaY < 0 ? 1 : -1), -Math.max(d, 1) - 2, 0)); }
    else pose.squeeze = rtClip(pose.squeeze + (e.deltaY < 0 ? 0.05 : -0.05), 0, 1);
    e.preventDefault();
  }, { passive: false });
  pad.addEventListener("dblclick", () => { if (!isCell()) pose.estop = true; });
  sel.addEventListener("change", () => setTask(sel.value));
  bGhost.addEventListener("click", () => api.demonstrate());
  setTask(sc);
  return api;
}
