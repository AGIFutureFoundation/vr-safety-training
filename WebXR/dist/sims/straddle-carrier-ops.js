import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, cone, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Straddle Carrier Ops VR — Maritime & Ports, station over the
// same yard container-lashing and dock-crane already share, seen from the
// machine that actually moves boxes between the stack and the quay: a
// straddle carrier, four tall legs driven straight over a container to lift
// it from above. Its whole geometry is the hazard — high centre of gravity,
// a blind spot under its own chassis, and a load that has to travel low
// because a straddle carrier does not recover from a tip the way a forklift
// tips forward and stops.

const SCO_ACCENT = 0xe4a13a;

export const SIM_STRADDLE_CARRIER_OPS = {
  id: "straddle-carrier-ops",
  index: "183",
  domain: "Maritime",
  trade: "Straddle carrier operator — ILWU",
  category: "Maritime & Ports",
  weather: "overcast",
  certification: "ILWU — OSHA 29 CFR 1918 marine terminal safety for mobile cargo-handling equipment; the corner-casting and twist-lock dimensions set by ISO; the carrier manufacturer's rated capacity and wind-limit plate",
  name: "Straddle Carrier Ops",
  title: simTitle("Straddle Carrier Ops"),
  tagline: "A straddle carrier shift: pre-op walk-around, seat belt and cab check, the pedestrian-exclusion call, twist-locks proven before the lift, the row run with the load carried low, the wind limit read, and the park-up",
  accent: SCO_ACCENT,
  accentCss: "#e4a13a",
  parSeconds: 300,
  footprint: 2.7,
  badge: { id: "row-run-clean", name: "Row Run Clean", note: "Every lock proven, the load carried low the whole row, and the wind read before it mattered — first time" },

  game: system({
    name: "Straddle Gang",
    currency: "SPAN",
    ranks: ["Ground Hand", "Straddle Trainee", "Straddle Operator", "Lead Operator", "Straddle Gang Certified"],
    badges: [
      { id: "locks-proven-sc", name: "Locks Proven", note: "Every twist-lock checked before weight came on", test: AWARD.stepClean("twistlock-check") },
      { id: "low-and-clear", name: "Low and Clear", note: "Never ran the row with the load raised, never over a person", test: AWARD.safe },
      { id: "true-hand-sc", name: "True Hand", note: "Wind reading and row speed both held inside the working band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-shift-sc", name: "Clean Shift", note: "No corrections anywhere in the shift", test: AWARD.clean },
      { id: "row-steady", name: "Row Steady", note: "Held the row speed the whole run without a break", test: AWARD.unbroken },
      { id: "shift-in-time", name: "Shift In Time", note: "Whole cycle complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-walkaround": "You climbed straight into the cab without walking the machine first. A cracked tire or a hydraulic line weeping under a leg does not announce itself from the seat — it announces itself partway down a row with a box already thirty feet in the air.",
    "no-exclusion-call": "You moved the machine without calling the exclusion zone. A straddle carrier's own legs put its blind spot directly under the chassis it is about to drive over — the call is what keeps a person from being under those legs in the first place, because the operator cannot see them there once the machine is moving.",
    "travel-raised": "You ran the row with the box raised instead of carried low. A straddle carrier's centre of gravity climbs with every foot the load goes up, and one this tall does not tip forward and stop the way a forklift does — it goes over sideways, and there is no recovering it once it starts.",
    "stand-under-box": "You walked under the container while the carrier straddled it. The legs that hold this machine up are also what a person standing underneath cannot see past, and a spreader that lets go from up there gives nobody below it any warning at all.",
  },

  lateNotes: {
    "hoist-control-sc": "Nothing to lift until every corner reads locked — a box coming up on three good locks and one that only looks good is how a stack loses a container mid-air.",
    "release-lever-sc": "The locks release once the box has fully landed and taken its own weight, not while the hoist is still carrying any of it.",
  },

  steps: [
    {
      id: "walkaround", kind: "sequence", anyOrder: true,
      targets: ["tires-check", "lights-check", "hydraulic-check"],
      itemNames: { "tires-check": "tires checked", "lights-check": "lights checked", "hydraulic-check": "hydraulic lines checked" },
      title: "Walk the pre-operation inspection",
      cue: "Check the tires, the lights, and the hydraulic lines before climbing up into the cab.",
      why: "A straddle carrier is a machine that lifts its load from directly overhead on four tall legs, and a fault in any one of those systems — a tire, a light nobody can see you by, a hydraulic line already weeping — turns from a walk-around finding into a mid-row failure the moment weight goes onto it. The walk-around is what catches it while the box is still on the ground.",
    },
    {
      id: "sign-inspection", kind: "select", target: "inspection-sheet",
      title: "Sign the inspection sheet",
      cue: "Record what the walk-around found and sign the sheet before starting the engine.",
      why: "The sheet is the only record that this specific machine, on this specific shift, was actually walked rather than assumed fine because it ran fine yesterday — a fault that develops between shifts is a fault the next operator inherits blind if nobody signed for having looked.",
    },
    {
      id: "cab-check", kind: "sequence", anyOrder: true,
      targets: ["seatbelt-buckle", "mirror-set", "horn-test"],
      itemNames: { "seatbelt-buckle": "seat belt buckled", "mirror-set": "mirrors set", "horn-test": "horn tested" },
      title: "Buckle in and check the cab",
      why: "A cab this high off the ground with a load coming up on tall legs is exactly the seat a belt is rated for, mirrors are how the operator sees anything the cab's own structure blocks around the legs, and a horn that doesn't sound is a warning nobody two rows over ever gets — all three are proven before the machine moves, not discovered missing mid-shift.",
      cue: "Buckle the seat belt, set the mirrors, and test the horn before moving the machine.",
    },
    {
      id: "exclusion-call", kind: "select", target: "yard-radio-sc",
      title: "Call the pedestrian-exclusion zone",
      cue: "Radio yard control: straddle carrier moving into row 14, exclusion zone in effect.",
      why: "This machine's own legs create a blind spot directly beneath the chassis the moment it straddles a container, and the operator's cab sits well forward of where a person on foot might be standing between those legs. The radio call is what tells every ground hand on this frequency to stay clear of row 14 before the machine ever starts rolling into it, not after.",
    },
    {
      id: "approach-box", kind: "select", target: "target-container",
      title: "Straddle the container",
      cue: "Position the machine so the container sits centred between all four legs before lowering the spreader.",
      why: "A container that is not centred between the legs loads two of the machine's four legs harder than the other two the moment the spreader takes weight, and a straddle carrier off-centre with a box in the air is carrying an asymmetric load on a machine whose whole stability depends on that load being square underneath it.",
    },
    {
      id: "twistlock-check", kind: "find", noHint: true,
      targets: ["corner-unlatched-sc", "indicator-false-sc"],
      itemNames: { "corner-unlatched-sc": "unlatched corner lock", "indicator-false-sc": "corner light showing false-locked" },
      itemNotes: {
        "corner-unlatched-sc": "That twist-lock handle is still open — the corner casting is not actually captured no matter what the cab panel shows.",
        "indicator-false-sc": "That indicator reads locked but the lock has not rotated fully closed — the light is reporting something that never happened.",
      },
      decoyNotes: { "corner-good-1-sc": "That corner is fully seated and reading correctly — leave it.", "corner-good-2-sc": "That corner is fully seated and reading correctly — leave it." },
      title: "Prove all four twist-locks before lifting",
      cue: "Check each corner against the cab panel — two of the four don't match what it shows.",
      why: "The cab panel only reports what its own sensor believes happened, and a sensor reading locked because a pin swung most of the way shut is reporting something that never actually occurred at that corner. Checking all four against what the panel claims, before any weight comes onto the spreader, is the only way to know which corners are really carrying the box and which only look like they are.",
    },
    {
      id: "lift-clear", kind: "hold", target: "hoist-control-sc", seconds: 4,
      title: "Lift clear of the stack",
      cue: "Hold the hoist control until the box is fully clear of the stack below it.",
      why: "A box lifted in a snatch rather than a steady pull is how a lock that is not truly seated finally lets go, right as the container leaves the stack it was resting on — holding a smooth, continuous lift is what lets a marginal corner show itself while the box is still an inch above something it can safely drop back onto.",
      holdBreakNote: "Released before the box cleared the stack — hold the hoist steady until it is fully clear, not partway.",
    },
    {
      id: "run-row", kind: "track", target: "drive-lever-sc", seconds: 6,
      title: "Run the row with the load carried low",
      cue: "Drive down the row at a working speed with the box carried low, not raised to travel height.",
      track: { start: 0.08, green: [0.3, 0.5], rise: 0.55, fall: 0.5, drift: 0.12, label: "ROW SPEED", readout: (v) => (v < 0.3 ? "crawling — hold a working pace" : v > 0.5 ? "too fast for a load this high" : "working pace, load low") },
      why: "Every foot this load is carried above the minimum travel height raises the whole machine's centre of gravity, and a straddle carrier that starts to tip does not right itself the way a lower, wider machine can — running the row with the box held low and at a working pace, not travel-raised and rushed, is what keeps that centre of gravity down where the machine's own width can still hold it.",
      holdBreakNote: "Row speed drifted out of the working band — bring it back and hold it there with the load kept low.",
    },
    {
      id: "wind-check", kind: "gauge", target: "anemometer-sc",
      title: "Read the wind against the rated limit",
      cue: "Check the anemometer and commit while it holds inside the carrier's rated limit.",
      why: "A container held aloft on tall straddle legs is still forty feet of flat steel with nothing to break the wind's grip on it, and a gust that would barely be noticed on the ground becomes real side-load on a machine whose own height is already most of its stability problem — the rated limit is a number checked before the lift, not a judgement made from the cab once the box is already swinging.",
      gauge: { label: "ANEMOMETER — WIND SPEED", speed: 0.55, green: [0.0, 0.4], readout: (t) => `${Math.round(t * 46)} mph`, missNote: "Over the carrier's rated wind limit — hold the lift and let it drop before moving another box." },
    },
    {
      id: "place-box", kind: "select", target: "drop-zone-marker",
      title: "Land the box in its marked slot",
      cue: "Lower the container onto the marked slot in the target stack.",
      why: "A container set down off its marked slot does not just look untidy — it changes the footprint the next machine, human or automated, expects to find in that stack, and a box sitting a foot off its mark is exactly the kind of small drift that turns into a jammed pick two shifts from now.",
    },
    {
      id: "release-locks", kind: "turn", target: "release-lever-sc",
      title: "Release the twist-locks",
      cue: "Turn the release lever to free the spreader from the landed container.",
      why: "The locks release only once the container's full weight is settled back onto the stack and the spreader has stopped carrying any of it — releasing while the spreader is still taking even part of that weight hands the box's own stability to whatever locks happen to still be engaged, which on a corner that was already marginal can be nothing at all.",
      turn: { turns: 0.6, axis: "y", label: "RELEASE" },
    },
    {
      id: "chock-park", kind: "drag", target: "wheel-chock",
      title: "Chock the wheels at park-up",
      cue: "Carry the wheel chock to the marked spot at the front wheel before leaving the cab.",
      drag: { to: "chock-socket", radius: 0.5, missNote: "Not lined up with the wheel — carry it to the marked spot at the front tire and set it there." },
      why: "A straddle carrier parked on even a slight grade with nothing at the wheels is a machine that can creep on its own the moment somebody bumps a control climbing down, or simply settles under its own weight over a shift change — the chock is what a park-up actually means, not the parking brake alone.",
    },
    {
      id: "park-log", kind: "select", target: "park-log-board",
      title: "Log the park-up",
      cue: "Record hours, fuel, and any faults noted before signing off.",
      why: "The next operator who climbs into this machine reads this log before they read anything the machine itself is telling them — a fault noted here is one they walk in already watching for, and a fault left unlogged is one they find out about the same way you did, partway down a row with a box in the air.",
    },
  ],

  interrupts: [
    {
      id: "lashing-hand-crossing",
      kind: "Lashing hand crossing the row",
      after: "run-row", delay: 3, seconds: 11,
      alert: "A lashing hand has stepped out from between two stacks directly ahead, walking across the row without looking up.",
      cue: "Somebody's in your path with the box still carried low but very much still there. Stop before you reach them.",
      target: "estop-sc",
      why: "A person crossing between stacks is looking at the ground and the boxes on either side of them, not up at a straddle carrier's cab — the operator is the only one in this picture who can see the whole row, and stopping the machine the instant somebody steps into it is the only version of this that ends with everybody still on their feet.",
      missNote: "The carrier rolled two more bays before anyone reached the emergency stop. The lashing hand never once looked up from the gap between the stacks.",
      wrongNote: "It's the emergency stop. Somebody crossing the row in front of a moving carrier is answered by stopping the machine, not by anything on the load itself.",
    },
    {
      id: "midlift-unlock-flag",
      kind: "Twist-lock indicator drops out mid-lift",
      after: "lift-clear", delay: 3, seconds: 10,
      alert: "As the box comes clear of the stack, the aft-left corner's lock light flickers from green to amber on the cab panel.",
      cue: "That corner is telling you something changed since you checked it on the ground. Stop the lift and look.",
      target: "midlift-corner-flag",
      why: "A lock that read good on the ground and starts flickering the moment real weight comes onto it is not a sensor glitch to wait out — it is the corner telling you, while the box is still low enough to set back down, that it may not actually be carrying what the other three are. Stopping the lift here is the difference between a box that goes back down clean and one that finishes coming up on three corners.",
      missNote: "The lift continued to full height with the aft-left light still flickering amber. Nobody found out whether that corner was ever really carrying its share until the box was already well above the stack.",
      wrongNote: "It's the flickering corner-lock light. A lock reporting differently than it did on the ground gets the lift stopped, not finished.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, SCO_ACCENT);

    // --------------------------------------------------------------- yard deck
    const pavingTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { base: "#1c2126", base2: "#171b1f" }), { repeat: 6, px: 256 });
    const deckMesh = box(g, 6.2, 0.1, 5.8, 0, 0.05, -0.2, 0xffffff, { rough: 0.85, metal: 0.1 });
    deckMesh.material = texturedMat(pavingTex, { rough: 0.85, metal: 0.08, color: 0x8f979d });
    for (const sz of [-1.65, 1.05]) box(g, 6.2, 0.008, 0.03, 0, 0.101, sz, 0xf2c14b, { rough: 0.6, cast: false });

    // ------------------------------------------------------- target container / stack
    const stack = group(g, 0, 0, -0.3);
    const stackColour = 0xb8402f;
    box(stack, 1.1, 0.44, 0.5, 0, 0.24, 0, 0x6f7a83, { rough: 0.6, metal: 0.15 }); // box already resting below
    const target = box(stack, 1.1, 0.44, 0.5, 0, 0.7, 0, stackColour, { rough: 0.55, metal: 0.15 });
    reg(hits, target, "target-container");
    const cornerSpecs = [
      { x: -0.5, z: -0.2, id: "corner-good-1-sc" },
      { x: 0.5, z: -0.2, id: "corner-unlatched-sc" },
      { x: -0.5, z: 0.2, id: "indicator-false-sc" },
      { x: 0.5, z: 0.2, id: "corner-good-2-sc" },
    ];
    const corners = [];
    for (const c of cornerSpecs) {
      const lg = group(stack, c.x, 0.93, c.z);
      cyl(lg, 0.022, 0.022, 0.09, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10 });
      const handle = box(lg, 0.08, 0.012, 0.012, 0, -0.05, 0, 0xf2c14b, { rough: 0.5 });
      const lamp = ball(lg, 0.009, 0, -0.08, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.4, seg: 10 });
      corners.push({ lg, handle, lamp, id: c.id });
      if (c.id === "corner-unlatched-sc" || c.id === "indicator-false-sc") reg(hits, lg, c.id);
      if (c.id === "corner-unlatched-sc") handle.rotation.y = 0.9;
      if (c.id === "indicator-false-sc") lamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 });
    }
    const dropZone = ball(g, 0.02, 1.4, 0.24, -0.3, 0x000000, { opacity: 0, transparent: true, cast: false, receive: false });
    void dropZone;
    const dropMarker = group(g, 1.4, 0, -0.3);
    cyl(dropMarker, 0.012, 0.012, 0.5, 0, 0.25, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    box(dropMarker, 1.1, 0.02, 0.5, 0, 0.02, 0, 0xe4a13a, { rough: 0.6, cast: false });
    holoTag(dropMarker, "target slot", 0, 0.6, 0, { css: "#e4a13a", w: 0.3 });
    reg(hits, dropMarker, "drop-zone-marker");
    const underBoxHit = box(stack, 0.5, 0.4, 0.3, 0, 0.4, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(stack, "walk under it?", 0, 0.68, 0.32, { css: "#d2312b", w: 0.28 });
    reg(hits, underBoxHit, "stand-under-box");

    // ----------------------------------------------------------- the straddle carrier
    const carrier = group(g, -0.1, 0, -0.3);
    const legPositions = [[-1.05, -0.75], [1.05, -0.75], [-1.05, 0.75], [1.05, 0.75]];
    for (const [lx, lz] of legPositions) {
      box(carrier, 0.16, 2.6, 0.16, lx, 1.3, lz, 0x53585e, { rough: 0.55, metal: 0.4 });
      cyl(carrier, 0.24, 0.24, 0.22, lx, 0.11, lz, 0x1b1e22, { rough: 0.8, seg: 16 });
    }
    box(carrier, 2.5, 0.3, 1.9, 0, 2.62, 0, 0xe4a13a, { rough: 0.5, metal: 0.3 }); // top gantry beam
    const trolley = group(carrier, 0, 2.45, 0);
    box(trolley, 0.3, 0.16, 0.32, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    const spreaderArm = group(trolley, 0, -1.55, 0);
    box(spreaderArm, 0.06, 3.1, 0.06, -0.4, 1.55, -0.16, 0x22262b, { rough: 0.5, metal: 0.6 });
    box(spreaderArm, 0.06, 3.1, 0.06, 0.4, 1.55, -0.16, 0x22262b, { rough: 0.5, metal: 0.6 });
    box(spreaderArm, 0.06, 3.1, 0.06, -0.4, 1.55, 0.16, 0x22262b, { rough: 0.5, metal: 0.6 });
    box(spreaderArm, 0.06, 3.1, 0.06, 0.4, 1.55, 0.16, 0x22262b, { rough: 0.5, metal: 0.6 });
    const spreader = box(spreaderArm, 1.1, 0.1, 0.5, 0, 0, 0, 0x8b929a, { rough: 0.45, metal: 0.5 });
    holoTag(spreader, "spreader", 0, 0.16, 0, { css: "#e4a13a", w: 0.24 });

    const cab = group(carrier, 1.5, 1.4, 0, -0.2);
    box(cab, 0.5, 0.5, 0.5, 0, 0, 0, 0xdfe4e8, { radius: 0.03, rough: 0.35, metal: 0.3 });
    box(cab, 0.44, 0.02, 0.44, 0, 0.25, 0, 0x2b3138, { rough: 0.6 });
    const seatBelt = group(cab, -0.05, -0.05, 0.15);
    box(seatBelt, 0.02, 0.14, 0.02, 0, 0, 0, 0xd2312b, { rough: 0.7 });
    holoTag(seatBelt, "seat belt", 0, 0.14, 0, { css: "#e4a13a", w: 0.24 });
    reg(hits, seatBelt, "seatbelt-buckle");
    const mirror = box(cab, 0.05, 0.09, 0.02, 0.26, 0.12, 0.05, 0x3c444c, { rough: 0.4, metal: 0.5 });
    holoTag(mirror, "mirrors", 0, 0.1, 0, { css: "#e4a13a", w: 0.22 });
    reg(hits, mirror, "mirror-set");
    const horn = cyl(cab, 0.02, 0.02, 0.03, 0.12, -0.1, 0.2, 0xd2312b, { rough: 0.5, seg: 10 });
    holoTag(horn, "horn", 0, 0.1, 0, { css: "#e4a13a", w: 0.16 });
    reg(hits, horn, "horn-test");
    const hoistLever = group(cab, -0.14, -0.12, 0.18);
    box(hoistLever, 0.018, 0.1, 0.018, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    holoTag(hoistLever, "hoist control", 0, 0.14, 0, { css: "#e4a13a", w: 0.28 });
    reg(hits, hoistLever, "hoist-control-sc");
    const driveLever = group(cab, 0.0, -0.12, 0.18);
    box(driveLever, 0.018, 0.1, 0.018, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(driveLever, "drive lever", 0, 0.14, 0, { css: "#e4a13a", w: 0.26 });
    reg(hits, driveLever, "drive-lever-sc");
    const releaseLever = group(cab, 0.14, -0.12, 0.18);
    cyl(releaseLever, 0.012, 0.012, 0.09, 0, 0, 0, 0xf2c14b, { rough: 0.5, seg: 10 });
    holoTag(releaseLever, "twist-lock release", 0, 0.13, 0, { css: "#e4a13a", w: 0.32 });
    reg(hits, releaseLever, "release-lever-sc");
    const estop = group(cab, 0.0, 0.18, 0.2);
    box(estop, 0.08, 0.08, 0.04, 0, 0, 0, 0xf2c14b, { rough: 0.6 });
    const estopBtn = cyl(estop, 0.028, 0.028, 0.03, 0, 0.05, 0, 0xd2312b, { rough: 0.5, seg: 16 });
    holoTag(estop, "emergency stop", 0, 0.16, 0, { css: "#e4a13a", w: 0.34 });
    reg(hits, estopBtn, "estop-sc");
    const cabPanel = instrument(cab, 0.0, 0.05, -0.2, { ry: Math.PI, idle: "4/4 LOCKED", color: 0xe4a13a, w: 0.16, d: 0.1 });
    void cabPanel;
    const flickerLamp = ball(cab, 0.012, -0.22, 0.05, -0.19, 0x2b1414, { emissive: 0x000000, ei: 0, seg: 10 });
    reg(hits, flickerLamp, "midlift-corner-flag");

    const anemo = group(carrier, 0, 2.9, 0);
    cyl(anemo, 0.01, 0.01, 0.3, 0, 0.15, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    const anemoInstrument = instrument(anemo, 0, 0.34, 0, { ry: 0, idle: "-- mph", color: SCO_ACCENT });
    holoTag(anemo, "anemometer", 0, 0.5, 0, { css: "#e4a13a", w: 0.3 });
    reg(hits, anemoInstrument, "anemometer-sc");

    const wanderHit = box(g, 0.2, 0.2, 0.2, -1.9, 1.3, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "start without checking in?", -1.9, 1.55, -0.3, { css: "#d2312b", w: 0.44 });
    reg(hits, wanderHit, "no-exclusion-call");
    const skipWalkHit = box(g, 0.2, 0.2, 0.2, -2.1, 0.4, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "climb straight in?", -2.1, 0.62, 0.9, { css: "#d2312b", w: 0.36 });
    reg(hits, skipWalkHit, "skip-walkaround");
    const raiseHit = box(g, 0.2, 0.2, 0.2, 0.0, 3.1, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "run raised, travel height?", 0.0, 3.3, -0.9, { css: "#d2312b", w: 0.44 });
    reg(hits, raiseHit, "travel-raised");

    // -------------------------------------------------------------- pre-op area
    const tires = box(g, 0.22, 0.22, 0.16, -2.1, 0.11, -1.0, 0x1b1e22, { rough: 0.85 });
    holoTag(tires, "tires", 0, 0.22, 0, { css: "#e4a13a", w: 0.18 });
    reg(hits, tires, "tires-check");
    const lights = ball(g, 0.03, -1.85, 0.6, -1.05, 0xffe9a8, { emissive: 0xffe9a8, ei: 1.2, seg: 12 });
    holoTag(lights, "lights", 0, 0.12, 0, { css: "#e4a13a", w: 0.18 });
    reg(hits, lights, "lights-check");
    const hydraulic = cyl(g, 0.012, 0.012, 0.4, -2.0, 0.2, -0.7, 0x22262b, { rough: 0.6, seg: 8 });
    hydraulic.rotation.z = Math.PI / 2.3;
    holoTag(hydraulic, "hydraulic line", 0, 0.14, 0, { css: "#e4a13a", w: 0.3 });
    reg(hits, hydraulic, "hydraulic-check");

    const chest = toolChest(g, 2.4, 1.3, { ry: -0.6, color: 0x6f5426 });
    const inspSheet = decal(chest, 0.28, 0.36, -0.08, 0.815, 0.05,
      (cx, w, h) => { cx.fillStyle = "#f4e9d8"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3a4450"; cx.font = `700 ${Math.round(h * 0.09)}px Arial`; cx.textAlign = "center"; cx.fillText("PRE-OP", w / 2, h * 0.15); cx.font = `${Math.round(h * 0.07)}px Arial`; ["Tires", "Lights", "Hydraulics", "Sign: ____"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.34 + i * 0.16))); });
    inspSheet.rotation.x = -Math.PI / 2;
    holoTag(chest, "inspection sheet", -0.08, 1.0, 0.05, { css: "#e4a13a", w: 0.36 });
    reg(hits, inspSheet, "inspection-sheet");
    const yardRadio = box(chest, 0.07, 0.16, 0.04, 0.14, 0.86, -0.05, 0x1b1e23, { rough: 0.6 });
    holoTag(yardRadio, "yard radio — call exclusion", 0.14, 1.02, -0.05, { css: "#e4a13a", w: 0.5 });
    reg(hits, yardRadio, "yard-radio-sc");

    const chockRack = group(g, 2.5, 0, 1.5);
    const chock = box(chockRack, 0.16, 0.1, 0.12, 0, 0.06, 0, 0xe8b02e, { rough: 0.7 });
    holoTag(chockRack, "wheel chock", 0, 0.18, 0, { css: "#e4a13a", w: 0.28 });
    reg(hits, chock, "wheel-chock");
    const chockSocketGroup = group(g, -1.05, 0, -1.55);
    hits["chock-socket"] = chockSocketGroup;
    box(chockSocketGroup, 0.2, 0.01, 0.16, 0, 0.005, 0, 0xf2c14b, { rough: 0.6, cast: false });

    const parkBoard = holoPanel(g, 0.8, 0.5, 2.4, 1.5, 0.6, (cx, w, h) => {
      cx.fillStyle = "#1c1408"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e4a13a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillStyle = "#fff2dc"; cx.fillText("PARK-UP LOG", w / 2, h * 0.22);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fff2dc";
      cx.fillText("Hours / fuel / faults", w / 2, h * 0.55);
      cx.fillText("Operator: ______", w / 2, h * 0.78);
    }, { ry: -0.7, accent: SCO_ACCENT });
    reg(hits, parkBoard, "park-log-board");

    standingFigure(g, 2.6, -2.1, { ry: 2.0, cloth: 0x2b3138, vest: 0xfcee21, helmet: 0x1b1e22 });
    cone(g, -0.6, 1.6); cone(g, 0.6, 1.6); cone(g, -2.6, -0.6); cone(g, -2.6, 0.4);

    // A lashing hand who steps out from between the background stacks and
    // into the row when the interrupt fires, and steps back once answered.
    const lashingHandHome = new THREE.Vector3(-1.9, 0, 1.9);
    const lashingHand = standingFigure(g, lashingHandHome.x, lashingHandHome.z, { ry: -1.2, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0x1b1e22 });

    const flickerHomeMat = flickerLamp.material;
    const flickerAlertMat = mat(0xf2ae14, { emissive: 0xf2ae14, ei: 1.8, rough: 0.4, seg: 10 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, -0.3),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "twistlock-check") corners.forEach((c) => { c.handle.rotation.y = 0; c.lamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "lashing-hand-crossing") { lashingHand.position.set(-0.1, 0, -1.15); lashingHand.rotation.y = 1.6; }
        if (it.id === "midlift-unlock-flag") flickerLamp.material = flickerAlertMat;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "lashing-hand-crossing") { lashingHand.position.set(lashingHandHome.x, 0, lashingHandHome.z); lashingHand.rotation.y = -1.2; }
        if (it.id === "midlift-unlock-flag") flickerLamp.material = flickerHomeMat;
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "release-locks") releaseLever.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind-check") repaint(anemoInstrument.userData.screen, signFace(`${Math.round(gg.t * 46)} mph`, { bg: "#08161e", accent: gg.t < 0.4 ? "#59c97b" : "#f0645b", fg: "#fff2dc", scale: 0.55 }));
        if (step?.id === "run-row" && session.track) {
          const raise = session.track.v > 0.5 ? Math.min(0.4, (session.track.v - 0.5)) : 0;
          spreaderArm.position.y = -1.55 - raise * 1.4;
        }
      },
    };
  },
};
