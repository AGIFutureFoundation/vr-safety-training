/**
 * Drives the hand-gesture classifier with synthetic joint positions.
 *
 *     node tools/check_hands.mjs
 *
 * Hand tracking needs a headset, and this repository has no way to hold one.
 * So the part that decides what a hand is doing is a pure function of joint
 * coordinates (shared/hands.js), and this feeds it hands: a flat palm, a
 * pinch, a fist, a pointing finger, a hand that has left the tracking volume.
 * What that leaves unverified is the plumbing — whether a real runtime hands
 * us joints at all — which no amount of headless testing can answer and a
 * device pass has to.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { classifyHandPose, JOINTS, PINCH_ON, PINCH_OFF, CURL_ON, CURL_OFF } from "../WebXR/shared/hands.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let failures = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { failures += 1; console.log(`  ✗ ${m}`); };

// A hand builder in metres, roughly life-sized, with the wrist at the origin.
// `curl` per finger is how far the tip sits from its own knuckle.
function hand({ pinchGap = 0.09, curls = [0.10, 0.10, 0.10, 0.10] } = {}) {
  const j = { [JOINTS.wrist]: { x: 0, y: 0, z: 0 } };
  const KNUCKLE_Y = 0.08;
  const names = [
    [JOINTS.indexTip, JOINTS.indexKnuckle, -0.02],
    [JOINTS.middleTip, JOINTS.middleKnuckle, 0.0],
    [JOINTS.ringTip, JOINTS.ringKnuckle, 0.02],
    [JOINTS.pinkyTip, JOINTS.pinkyKnuckle, 0.04],
  ];
  names.forEach(([tip, knuckle, x], i) => {
    j[knuckle] = { x, y: KNUCKLE_Y, z: 0 };
    j[tip] = { x, y: KNUCKLE_Y + curls[i], z: 0 };
  });
  // The thumb sits `pinchGap` from the index tip.
  j[JOINTS.thumbTip] = { x: j[JOINTS.indexTip].x - pinchGap, y: j[JOINTS.indexTip].y, z: 0 };
  return j;
}

console.log("Hand gestures — classifier against synthetic poses\n");

const open = classifyHandPose(hand());
if (!open.open || open.pinch || open.grab) bad(`a flat open palm should read open, got ${JSON.stringify(open)}`);
else ok("a flat open palm reads as open, not a pinch or a grab");

const pinched = classifyHandPose(hand({ pinchGap: PINCH_ON - 0.005 }));
if (!pinched.pinch) bad("thumb and index together should read as a pinch");
else ok("thumb and index together read as a pinch");

const fist = classifyHandPose(hand({ curls: [0.04, 0.04, 0.04, 0.04], pinchGap: 0.06 }));
if (!fist.grab || fist.pinch) bad(`a closed fist should read as a grab, got ${JSON.stringify(fist)}`);
else ok("a closed fist reads as a grab");

const pointing = classifyHandPose(hand({ curls: [0.10, 0.04, 0.04, 0.04], pinchGap: 0.07 }));
if (!pointing.point || pointing.grab) bad(`index out with the rest folded should point, got ${JSON.stringify(pointing)}`);
else ok("index out with the rest folded reads as a point");

// Hysteresis: a pinch held at a gap between the two thresholds must stay a
// pinch, and an open hand at the same gap must not become one.
const between = (PINCH_ON + PINCH_OFF) / 2;
const holding = classifyHandPose(hand({ pinchGap: between }), { pinch: true });
const notYet = classifyHandPose(hand({ pinchGap: between }), { pinch: false });
if (!holding.pinch) bad("a pinch let go the moment the fingers drifted inside the release band");
else if (notYet.pinch) bad("an open hand inside the release band was read as a pinch");
else ok("pinch has hysteresis — it holds through the noise band but does not trigger in it");

const grabHolding = classifyHandPose(hand({ curls: Array(4).fill((CURL_ON + CURL_OFF) / 2), pinchGap: 0.07 }), { grab: true });
if (!grabHolding.grab) bad("a grab released the moment the fingers drifted inside the release band");
else ok("grab has hysteresis too");

const gone = classifyHandPose({});
if (gone.tracked || gone.pinch || gone.grab) bad("a hand with no joints should report nothing, not a gesture");
else ok("a hand that has left the tracking volume reports nothing rather than a stuck gesture");

// The session has to actually ask for hand tracking, in every app that has an
// XR entry point — a perfect classifier is inert if the feature is not requested.
for (const rel of ["WebXR/smartcity/js/app.js", "WebXR/trades/js/app.js", "WebXR/holodeck/js/app.js"]) {
  const src = readFileSync(join(ROOT, rel), "utf8");
  if (!/requestSession/.test(src)) continue;
  if (!/hand-tracking/.test(src)) bad(`${rel} requests an XR session without asking for hand-tracking`);
}
if (!failures) ok("every app that opens an XR session asks for hand-tracking");

console.log(failures ? `\n${failures} hand-gesture problem(s) found.` : "\nAll hand-gesture checks pass.");
process.exit(failures ? 1 : 0);
