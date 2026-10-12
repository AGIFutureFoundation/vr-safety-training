/**
 * Hand gesture control for the XR sessions.
 *
 * A gloved trade is the wrong audience for "press the grip button": the whole
 * point of these simulators is that the actions look like the real ones, and
 * on a headset with hand tracking the learner already has the right tool
 * attached to their wrist. This maps bare hands onto the same verbs the
 * controllers drive, so no station needs to know which one is in use.
 *
 * The gesture classifier is a pure function of joint positions, separate from
 * anything three.js or WebXR. That is deliberate: hand tracking cannot be
 * tested without hardware, so the part that decides what a hand is doing is
 * written to be driven by a table of coordinates and checked headlessly
 * (tools/check_hands.mjs). What is left unverified is the plumbing — that the
 * runtime hands us joints at all — which is the part a device has to confirm.
 */

export const JOINTS = {
  wrist: "wrist",
  thumbTip: "thumb-tip",
  indexTip: "index-finger-tip",
  middleTip: "middle-finger-tip",
  ringTip: "ring-finger-tip",
  pinkyTip: "pinky-finger-tip",
  indexKnuckle: "index-finger-phalanx-proximal",
  middleKnuckle: "middle-finger-phalanx-proximal",
  ringKnuckle: "ring-finger-phalanx-proximal",
  pinkyKnuckle: "pinky-finger-phalanx-proximal",
};

// Metres. Hand tracking is noisy, so every threshold has a release value
// further out than its trigger — a pinch that flickers on and off at the
// boundary is worse than one that is slightly slow to let go.
export const PINCH_ON = 0.022;
export const PINCH_OFF = 0.035;
export const CURL_ON = 0.065;      // fingertip to its own knuckle
export const CURL_OFF = 0.085;

const dist = (a, b) => (a && b ? Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) : Infinity);

/**
 * What a hand is doing, from its joint positions.
 *
 * `joints` is a plain map of joint name to {x,y,z} — whatever the runtime
 * reports, in any one consistent space. `prev` is the previous result, so the
 * thresholds can have hysteresis; pass null on the first frame.
 *
 * Returns { pinch, grab, point, open, pinchGap, curled } where the four
 * booleans are mutually sensible: a fist is a grab and not a point, an index
 * finger out on its own is a point, and a pinch is read before either because
 * it is the most deliberate thing a hand can do.
 */
export function classifyHandPose(joints, prev = null) {
  const j = (name) => joints?.[name] ?? null;
  const wrist = j(JOINTS.wrist);
  const pinchGap = dist(j(JOINTS.thumbTip), j(JOINTS.indexTip));

  const wasPinch = !!prev?.pinch;
  const pinch = Number.isFinite(pinchGap)
    ? (wasPinch ? pinchGap < PINCH_OFF : pinchGap < PINCH_ON)
    : false;

  // How many of the four fingers are folded to their own knuckle. Measuring
  // tip-to-knuckle rather than tip-to-palm keeps it independent of hand size.
  const fingers = [
    [JOINTS.indexTip, JOINTS.indexKnuckle],
    [JOINTS.middleTip, JOINTS.middleKnuckle],
    [JOINTS.ringTip, JOINTS.ringKnuckle],
    [JOINTS.pinkyTip, JOINTS.pinkyKnuckle],
  ].map(([tip, knuckle]) => dist(j(tip), j(knuckle)));
  const known = fingers.filter(Number.isFinite);
  if (!known.length) return { pinch: false, grab: false, point: false, open: false, pinchGap, curled: 0, tracked: false };

  const limit = prev?.grab ? CURL_OFF : CURL_ON;
  const curled = fingers.filter((d) => Number.isFinite(d) && d < limit).length;

  // The index finger decides between the two closed poses. Counting folded
  // fingers alone cannot: a pointing hand has three folded and so does a fist
  // with a loose pinky, and reading a point as a grab would start a drag every
  // time somebody indicated something across the bay.
  const indexCurled = Number.isFinite(fingers[0]) && fingers[0] < limit;
  const grab = !pinch && indexCurled && curled >= 3;
  // A point: index out, at least two of the others folded.
  const point = !pinch && !indexCurled && Number.isFinite(fingers[0]) && curled >= 2;
  const open = !pinch && !grab && curled === 0;

  return { pinch, grab, point, open, pinchGap, curled, tracked: !!wrist };
}

/** Read a three.js XRHand's joints into the plain map classifyHandPose wants. */
export function readJoints(hand) {
  const out = {};
  const src = hand?.joints;
  if (!src) return out;
  for (const name of Object.values(JOINTS)) {
    const joint = src[name];
    if (joint?.position) out[name] = { x: joint.position.x, y: joint.position.y, z: joint.position.z };
  }
  return out;
}

/**
 * Wire hand tracking into an app.
 *
 * The app supplies the verbs it already implements for controllers, so this
 * adds an input device rather than a second interaction model:
 *
 *   onSelectStart(hand)  a pinch closed        — same as a trigger press
 *   onSelectEnd(hand)    the pinch opened      — same as a trigger release
 *   onGrabStart(hand)    a fist closed         — sustained hold, for drag and turn
 *   onGrabEnd(hand)
 *   onRoll(hand, delta)  wrist roll while grabbing, in radians — drives turn steps
 *   onPose(hand, pose)   every frame, for the pointer ray and the gesture hint
 *
 * Returns { hands, update(), dispose() }. update() is called from the render
 * loop; everything else is event-driven off three.js's own pinch events where
 * they exist, with the classifier as the fallback and the source of grab.
 */
export function createHandInput(renderer, rig, handlers = {}) {
  const THREE = renderer?.xr?.constructor ? null : null;   // three is passed in via meshFactory
  const hands = [];
  const state = [];
  if (!renderer?.xr?.getHand) return { hands, update() {}, dispose() {}, supported: false };

  for (let i = 0; i < 2; i++) {
    const hand = renderer.xr.getHand(i);
    hand.userData.index = i;
    if (handlers.decorate) handlers.decorate(hand, i);
    rig.add(hand);
    hands.push(hand);
    state.push({ pose: null, grabbing: false, lastRoll: null, pinching: false });
  }

  function update() {
    for (let i = 0; i < hands.length; i++) {
      const hand = hands[i];
      const st = state[i];
      const joints = readJoints(hand);
      const pose = classifyHandPose(joints, st.pose);
      st.pose = pose;
      if (!pose.tracked) {
        if (st.grabbing) { st.grabbing = false; handlers.onGrabEnd?.(hand); }
        if (st.pinching) { st.pinching = false; handlers.onSelectEnd?.(hand); }
        continue;
      }
      handlers.onPose?.(hand, pose);

      if (pose.pinch && !st.pinching) { st.pinching = true; handlers.onSelectStart?.(hand); }
      else if (!pose.pinch && st.pinching) { st.pinching = false; handlers.onSelectEnd?.(hand); }

      if (pose.grab && !st.grabbing) {
        st.grabbing = true;
        st.lastRoll = hand.rotation?.z ?? 0;
        handlers.onGrabStart?.(hand);
      } else if (!pose.grab && st.grabbing) {
        st.grabbing = false;
        st.lastRoll = null;
        handlers.onGrabEnd?.(hand);
      } else if (pose.grab && st.grabbing && handlers.onRoll) {
        const roll = hand.rotation?.z ?? 0;
        if (st.lastRoll != null) {
          let d = roll - st.lastRoll;
          // Shortest way round, so passing through ±π does not read as a
          // whole turn of the valve.
          if (d > Math.PI) d -= Math.PI * 2;
          if (d < -Math.PI) d += Math.PI * 2;
          if (Math.abs(d) > 1e-4) handlers.onRoll(hand, d);
        }
        st.lastRoll = roll;
      }
    }
  }

  function dispose() {
    for (const hand of hands) hand.parent?.remove(hand);
    hands.length = 0;
  }

  void THREE;
  return { hands, update, dispose, supported: true, poseOf: (i) => state[i]?.pose ?? null };
}

/** What to tell the learner their hands can do, in the app's own hint rail. */
export const HAND_HINTS = {
  pinch: "Pinch thumb and finger to select",
  grab: "Close your hand to grab and hold",
  roll: "Grab and turn your wrist to rotate",
  point: "Point to aim at something further away",
};
