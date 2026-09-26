import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
  gradientFill, noiseTexture, grimeOverlay,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag,
  standingFigure, surfaceTexture, texturedMat, paintedSteelFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Machine Room Lockout and Brake Test VR — IUEC elevator
// constructors, preventive maintenance. The traction machine's brake is the
// one component standing between a loaded car and gravity every time the
// motor is not actively holding it, and this station is the periodic proof
// that it still does that job: isolated correctly, measured against its own
// wear limits, and never released by hand while anyone could still be
// relying on it to hold something up.

const EWMRB_ACCENT = 0xe0522d;

/** Machine room floor tile: industrial grey-green with a wide grout grid. */
function ewmrbTileFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#4a5750"], [1, o.base2 ?? "#3e4941"]]);
  noiseTexture(g, w, h, { density: 2000, alpha: 0.06, tone: "0,0,0" });
  const tiles = o.tiles ?? 4, t = w / tiles;
  g.fillStyle = "rgba(0,0,0,0.35)";
  for (let i = 0; i <= tiles; i++) { g.fillRect(i * t - 1, 0, 2, h); g.fillRect(0, i * t - 1, w, 2); }
  grimeOverlay(g, w, h, { blotches: 2, streaks: 2, tone: "20,24,10", alpha: 0.12 });
}

/** Safety-stripe hazard tape for the sheave guard rail: black/yellow chevrons. */
function ewmrbStripeFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, "#f2c14b"], [1, "#e0a93a"]]);
  const n = o.stripes ?? 8;
  for (let i = 0; i < n; i++) { if (i % 2 === 0) { g.fillStyle = "#181a1c"; g.fillRect(i * w / n, 0, w / n, h); } }
  noiseTexture(g, w, h, { density: 800, alpha: 0.05, tone: "0,0,0" });
}

export const SIM_EW_MACHINE_ROOM_LOCKOUT_AND_BRAKE_TEST = {
  id: "ew-machine-room-lockout-and-brake-test",
  index: "353",
  domain: "Facilities",
  trade: "Elevator constructor / mechanic — IUEC",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "IUEC elevator constructors; NEIEP apprenticeship curriculum for machine room maintenance; ASME A17.1 the safety code for elevators and escalators; OSHA 29 CFR 1910.147 control of hazardous energy for the main line disconnect; OSHA 29 CFR 1910.333 electrical safe work practices for the live-dead-live check at the controller",
  name: "Machine Room Lockout and Brake Test",
  title: simTitle("Machine Room Lockout and Brake Test"),
  tagline: "Isolate the machine, guard the hand brake-release lever, measure lining and gap against wear limits, and prove the brake on a test run before restoring power",
  accent: EWMRB_ACCENT,
  accentCss: "#e0522d",
  parSeconds: 265,
  footprint: 2.2,
  badge: { id: "brake-proven", name: "Brake Proven", note: "Isolated, guarded and measured to the manufacturer's wear limits, with a clean stopping test before release" },

  game: system({
    name: "Brake Authority",
    currency: "TORQUE",
    ranks: ["Helper", "Machine Room Mechanic", "Adjuster", "Lead Mechanic", "Brake Authority Certified"],
    badges: [
      { id: "guard-first", name: "Guard First", note: "Never measured the brake before the hand-release lever was pinned", test: AWARD.stepClean("brake-lever-guard") },
      { id: "within-limits", name: "Within Limits", note: "Held both lining and gap readings near band centre", test: AWARD.precise(0.7) },
      { id: "clean-restore", name: "Clean Restore", note: "Restored in the correct order, no correction", test: AWARD.stepClean("restore") },
    ],
    challenges: [
      { id: "no-callback", name: "No Callback", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "test-held", name: "Test Held", note: "Never let the test run button slip mid-hold", test: AWARD.unbroken },
      { id: "machine-fast", name: "Machine Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "rotating-sheave": "You reached toward the sheave before the disconnect was proven dead. A traction machine coasts after power is cut, and a hand anywhere near the sheave, the brake wheel or the ropes while it is still turning down is a hand in the one place on this machine built to grip things hard.",
    "brake-lever-unguarded": "You let the hand brake-release lever go unguarded while the test was running. That lever is built to lift the brake by hand for exactly one purpose — moving a car with no power — and pulled at any other moment, with nothing confirmed clear on the other end of the ropes, it removes the only thing holding that car or its counterweight where it is.",
    "hot-motor-casing": "You put a bare hand on the motor and brake coil housing right after a run. A machine that has just been working is hot enough to burn skin on contact, and there is no reason to touch the casing at all when the readings that matter come off the instruments.",
    "oil-slick-floor": "You crossed the oil slick under the machine bed without a word to anyone. A film of gear oil on a machine room floor is invisible until somebody's boot finds it, and the fall it causes happens two feet from a rotating sheave, not somewhere soft.",
  },

  lateNotes: {
    "brake-pad-gauge": "Lining thickness is only measured once the machine is proven dead and the hand-release lever is guarded.",
    "test-run-button": "The stopping test runs only after the guard is confirmed and both wear readings are logged.",
  },

  supportLine: "your IUEC local's member assistance programme, or the NEIEP training coordinator for anything about the certification record",

  steps: [
    {
      id: "checkin", kind: "select", target: "job-ticket",
      title: "Check in at the machine room door",
      cue: "Read the job ticket and confirm which car this machine room serves before touching anything.",
      why: "A building can have several machine rooms within a few metres of each other, and the one fact a mechanic never wants to get wrong is which car's power they are about to isolate — the job ticket is checked at the door, before a hand goes anywhere near a disconnect, so the car actually being worked is the car actually taken out of service.",
    },
    {
      id: "permit", kind: "select", target: "disconnect-permit",
      title: "Post out-of-service signage",
      cue: "Read the work order and confirm the car-out-of-service signage is posted at every landing before the disconnect comes down.",
      why: "Everything below this step depends on nobody expecting this car to answer a call. Signage at every landing is what tells the next passenger, before they ever press a button, that the car behind those doors is not coming.",
    },
    {
      id: "disconnect", kind: "turn", target: "main-disconnect",
      title: "Open the main line disconnect",
      cue: "Pull the machine room's main line disconnect handle firmly to its open stop.",
      why: "The disconnect is pulled all the way to its stop rather than eased partway, because a switch left between positions can leave one phase still made — a motor that is supposed to be dead can still be turned far enough by that one phase to move the brake wheel under somebody's hand.",
      turn: { turns: 0.2, axis: "z", reverse: true, label: "MAIN LINE DISCONNECT" },
    },
    {
      id: "lock", kind: "select", target: "lockout-hasp",
      title: "Lock and tag the disconnect",
      cue: "Apply your padlock and tag to the disconnect before anything else.",
      why: "Your padlock is the only thing on this switch that only you can take off, and that is the entire point of fitting it before a caliper or a feeler gauge ever touches the brake. A building engineer who wants this car back can read the tag and call the number on it; what they cannot do is close a switch that is carrying somebody else's lock.",
    },
    {
      id: "verify-zero", kind: "gauge", target: "controller-meter",
      title: "Verify zero energy at the controller",
      cue: "Meter the controller's drive input and commit when it reads dead.",
      why: "A locked-open switch describes what the switch is doing; it says nothing about what is happening at the terminals the meter actually touches. Reading the meter against a source known to be live first, then against the drive input, then against that live source again is what stands between a genuinely dead machine and a meter with a blown fuse telling a comfortable lie.",
      gauge: {
        label: "DRIVE INPUT — VOLTAGE", speed: 0.65, green: [0.0, 0.08],
        readout: (t) => `${Math.round(t * 480)} V`,
        missNote: "Still reading live. Recheck the disconnect before the machine is touched.",
      },
    },
    {
      id: "brake-lever-guard", kind: "select", target: "brake-lever-guard",
      title: "Pin the hand brake-release lever",
      cue: "Fit the mechanical guard pin over the hand brake-release lever before anyone measures the brake.",
      why: "The hand-release lever can lift the brake with a single pull, by design, so a second mechanic reaching for it out of habit while this test is running is a real possibility and not a hypothetical one. The pin is what makes that pull physically impossible until the person who fitted it takes it out again.",
    },
    {
      id: "pad-wear", kind: "gauge", target: "brake-pad-gauge",
      title: "Measure the brake lining thickness",
      cue: "Set the caliper on the brake lining and commit the reading inside the manufacturer's wear limit.",
      why: "Lining wears a little on every stop this machine has ever made, and the only way to know how much is left before the shoe is metal-on-wheel is to measure it against the number on the manufacturer's own wear chart — not against how the lining looks or how the brake sounds when it sets.",
      gauge: {
        label: "LINING THICKNESS", speed: 0.6, green: [0.42, 0.62],
        readout: (t) => `${(2 + t * 6).toFixed(1)} mm`,
        missNote: "Outside the manufacturer's wear limit. Flag the shoe for replacement before this machine goes back in service.",
      },
    },
    {
      id: "shoe-gap", kind: "gauge", target: "brake-gap-gauge",
      title: "Measure the brake shoe air gap",
      cue: "Energize the coil, set the feeler gauge in the air gap and commit the reading inside band.",
      why: "The air gap is how far the armature has to travel to lift the shoes clear when the coil is energized, and it grows as the lining wears — too wide and the brake is slow to lift and slow to set, too narrow and it may not lift fully at all. Either fault reads as a brake that seems to work right up until it is asked to do something exact.",
      gauge: {
        label: "ARMATURE GAP", speed: 0.6, green: [0.4, 0.6],
        readout: (t) => `${(0.3 + t * 0.5).toFixed(2)} mm`,
        missNote: "Gap outside the manufacturer's band. Adjust the shoe stop and measure again before the machine runs.",
      },
    },
    {
      id: "machine-inspect", kind: "find", noHint: true,
      targets: ["worn-groove", "oil-slick-floor", "blocked-egress"],
      itemNames: { "worn-groove": "a worn sheave groove", "oil-slick-floor": "an oil slick under the machine bed", "blocked-egress": "material stacked against the machine room door" },
      itemNotes: {
        "worn-groove": "A worn rope groove concentrates load on fewer wires than the rope was designed to share, which is exactly the kind of wear that gets worse quietly and fails without warning.",
        "oil-slick-floor": "An oil slick under a rotating machine is a slip hazard on the one floor in the building where falling means falling toward moving parts.",
        "blocked-egress": "Material stacked against the machine room door is a blocked way out for whoever is in this small room the day something actually goes wrong.",
      },
      title: "Walk the machine room",
      cue: "Look over the machine, the floor and the door. Three things need fixing before this room is signed off.",
      why: "A machine room inspection catches what accumulates between visits — a groove that has worn a little more, a drip that has become a slick, a delivery someone leaned against the door. None of it is dramatic on its own, and all of it is exactly what an inspection exists to find before it becomes something worse.",
    },
    {
      id: "brake-test-run", kind: "hold", target: "test-run-button", seconds: 6,
      title: "Run the stopping test",
      cue: "Hold the test run button and let the logger record the brake's stopping performance.",
      why: "Every reading taken so far describes the brake at rest; this is the one that describes it doing its job. Constant pressure on the test button means the run stops the instant anyone lets go, so a stopping test never becomes an uncontrolled run in its own right.",
      holdBreakNote: "You let go and the test run stopped, which is exactly what constant pressure is for. Take the button again and hold it for the full run.",
    },
    {
      id: "restore", kind: "sequence",
      targets: ["brake-lever-guard", "lockout-hasp", "main-disconnect"],
      itemNames: { "brake-lever-guard": "the brake-release guard pin", "lockout-hasp": "your lock off the hasp", "main-disconnect": "main line disconnect" },
      title: "Restore in the correct order",
      cue: "Take the guard pin off the lever, then your lock off the hasp, then close the main disconnect.",
      why: "The guard pin comes off first because it was only ever needed while the machine was isolated; the lock is the last thing off before power, because it is the one thing that has been keeping this machine somebody else's problem the whole time it has been yours.",
      outOfOrderNote: "Wrong order — the guard pin first, then your lock, and the main disconnect last.",
    },
    {
      id: "oil-level", kind: "gauge", target: "gear-oil-sightglass",
      title: "Check the machine's oil sight glass",
      cue: "Read the gear oil level against the sight glass mark and commit inside band.",
      why: "A low oil level on a geared machine is a bearing and gear-wear problem long before it is a smell or a noise, and the sight glass is read at every service specifically because the machine cannot tell anyone itself that it is running short.",
      gauge: {
        label: "GEAR OIL LEVEL", speed: 0.55, green: [0.4, 0.7],
        readout: (t) => `${Math.round(t * 100)} %`,
        missNote: "Outside the full band on the sight glass. Top up or drain to mark and read it again before the machine is signed off.",
      },
    },
    {
      id: "log", kind: "select", target: "brake-test-log",
      title: "Log the brake test",
      cue: "Write the lining thickness, the air gap and the stopping test result on the machine room log.",
      why: "The next mechanic who opens this machine room reads this log before they read the brake itself, and a wear number that goes unwritten today is a wear number somebody else has to re-measure from zero the next time this machine is due.",
    },
    {
      id: "test-run", kind: "select", target: "controller-panel",
      title: "Run a normal test trip",
      cue: "With power restored, run the car through a normal trip before handing it back.",
      why: "A brake proven at the test button is not yet a brake proven in service — the last check is an ordinary trip, at ordinary speed, through the floors this car actually serves, because that is the only test that looks exactly like what the first passenger is about to ask of it.",
    },
  ],

  interrupts: [
    {
      id: "call-during-test",
      kind: "Call registered",
      after: "machine-inspect", delay: 4, seconds: 12,
      alert: "A hall call has just registered on the controller upstairs while this machine is supposed to be isolated.",
      cue: "Prove the disconnect is still open before anything else.",
      target: "main-disconnect",
      why: "A registered call on a machine that should be dead means either the isolation has failed or a second source is feeding this controller — either way, nothing about the brake test continues until the disconnect is confirmed open again with your own eyes.",
      missNote: "The call sat there registered with the disconnect unconfirmed. If that switch had drifted closed on its own weight, the first sign would have been the machine starting to turn under a mechanic's hands.",
      wrongNote: "It is the main disconnect. A call registering on a machine that is supposed to be dead is the only thing worth looking at right now.",
    },
    {
      id: "lever-tampered",
      kind: "Guard interfered with",
      after: "shoe-gap", delay: 4, seconds: 11,
      alert: "Someone else in the machine room has started working the guard pin loose on the hand brake-release lever.",
      cue: "That lever releases the brake. Get back to the guard.",
      target: "brake-lever-guard",
      why: "The guard pin exists so that exactly this — somebody else, with no idea a test is running, reaching for a lever that looks like ordinary machine room equipment — cannot end with the brake released on a car nobody has confirmed is clear.",
      missNote: "The guard pin came loose while your back was turned. A hand-release lever that can be pulled at any moment is a brake that is not actually isolated, whatever the disconnect says.",
      wrongNote: "It is the guard pin on the brake-release lever. Whatever else is happening, that lever cannot be left unguarded.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, EWMRB_ACCENT);

    // ------------------------------------------------------------- the floor
    const floorTex = surfaceTexture((cx, w, h) => ewmrbTileFace(cx, w, h, {}), { repeat: 3, px: 320 });
    const floor = box(g, 4.6, 0.1, 4.2, 0, 0.05, 0, 0x4a5750, { rough: 0.85, metal: 0.05 });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.05, color: 0x4a5750 });

    // ------------------------------------------------------------ machine bed
    const bedTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#2f4a3c", base2: "#294136" }), { repeat: 1, px: 320 });
    const bed = box(g, 1.9, 0.3, 1.3, 0, 0.15, -0.9, 0x2f4a3c, { rough: 0.6, metal: 0.3 });
    bed.material = texturedMat(bedTex, { rough: 0.55, metal: 0.3, color: 0x2f4a3c });

    // Traction machine: motor housing, sheave and brake wheel.
    const machine = group(g, -0.1, 0.3, -0.9);
    const motor = box(machine, 0.7, 0.5, 0.6, -0.5, 0.25, 0, 0x3c444c, { rough: 0.5, metal: 0.45 });
    holoTag(motor, "Motor + brake coil", 0, 0.34, 0, { css: "#e0522d", w: 0.4 });
    reg(hits, motor, "hot-motor-casing");
    const sheave = cyl(machine, 0.28, 0.28, 0.14, 0.15, 0.3, 0, CITY.darkSteel, { rough: 0.4, metal: 0.7, seg: 24 });
    sheave.rotation.z = Math.PI / 2;
    reg(hits, sheave, "rotating-sheave");
    const groove = box(machine, 0.02, 0.02, 0.28, 0.15, 0.3, 0.15, 0x1b1e22, { rough: 0.6 });
    reg(hits, groove, "worn-groove");

    // Brake shoes either side of the wheel, with lining pads and the hand lever.
    const brakeAssembly = group(machine, 0.15, 0.3, 0);
    const shoeL = box(brakeAssembly, 0.06, 0.16, 0.24, -0.19, 0, 0, 0x53585e, { rough: 0.55, metal: 0.4 });
    const shoeR = box(brakeAssembly, 0.06, 0.16, 0.24, 0.19, 0, 0, 0x53585e, { rough: 0.55, metal: 0.4 });
    void shoeR;
    const liningL = box(brakeAssembly, 0.02, 0.13, 0.2, -0.155, 0, 0, 0x2a2420, { rough: 0.85 });
    void liningL;
    holoTag(brakeAssembly, "Brake shoes", 0, 0.24, 0, { css: "#e0522d", w: 0.3 });
    reg(hits, shoeL, "brake-pad-gauge");
    const armatureGapMarker = box(brakeAssembly, 0.04, 0.04, 0.2, 0, 0.12, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, armatureGapMarker, "brake-gap-gauge");

    const leverArm = group(machine, -0.45, 0.5, 0.2, 0.2);
    const lever = box(leverArm, 0.02, 0.28, 0.02, 0, 0.14, 0, 0xd8232a, { rough: 0.45 });
    void lever;
    const guardPin = cyl(leverArm, 0.015, 0.015, 0.1, 0.06, 0.05, 0, 0xf2c14b, { rough: 0.4, metal: 0.5, seg: 10 });
    guardPin.rotation.z = Math.PI / 2;
    holoTag(leverArm, "Hand brake-release lever", 0, 0.32, 0, { css: "#e0522d", w: 0.5 });
    reg(hits, guardPin, "brake-lever-guard");
    const leverGrabZone = box(leverArm, 0.08, 0.16, 0.08, 0, 0.14, 0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, leverGrabZone, "brake-lever-unguarded");

    // Sheave guard rail wrapped in hazard-stripe tape.
    const stripeTex = surfaceTexture((cx, w, h) => ewmrbStripeFace(cx, w, h, {}), { repeat: 2, px: 128 });
    const guardRail = box(g, 0.9, 0.08, 0.05, 0.15, 0.62, -0.55, 0xf2c14b, { rough: 0.55 });
    guardRail.material = texturedMat(stripeTex, { rough: 0.6, metal: 0.02, color: 0xf2c14b });

    // Oil slick, blocked egress and the sight glass.
    const slick = cyl(g, 0.22, 0.22, 0.01, 0.9, 0.005, -0.2, 0x1b1e22, { rough: 0.2, metal: 0.1, seg: 20, opacity: 0.5, transparent: true, cast: false });
    reg(hits, slick, "oil-slick-floor");
    const doorStack = group(g, 1.9, 0, 1.5);
    box(doorStack, 0.4, 0.3, 0.4, 0, 0.15, 0, 0x8a5a34, { rough: 0.8 });
    box(doorStack, 0.4, 0.3, 0.4, 0.05, 0.46, 0.03, 0x9a6a3e, { rough: 0.8 });
    holoTag(doorStack, "Blocking the door", 0, 0.62, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, doorStack, "blocked-egress");

    const sightGlassTube = group(g, 0.7, 0.32, -1.35);
    cyl(sightGlassTube, 0.03, 0.03, 0.08, 0, 0, 0, 0xdfe4e8, { rough: 0.15, metal: 0.1, seg: 14, opacity: 0.6, transparent: true });
    ball(sightGlassTube, 0.02, 0, -0.02, 0, 0xd8b23a, { emissive: 0xd8b23a, ei: 0.4 });
    const sightGlass = instrument(g, 0.7, 0.5, -1.35, { ry: -0.4, idle: "-- %", color: 0xe0522d });
    holoTag(sightGlass, "Gear oil sight glass", 0, 0.16, 0, { css: "#e0522d", w: 0.36 });
    reg(hits, sightGlass, "gear-oil-sightglass");

    // -------------------------------------------------------------- controls
    const wall = group(g, 1.7, 0, -1.4, -0.5);
    slab(wall, 0.44, 1.1, 0.26, 0, 0.75, 0, 0x545e67, { radius: 0.03, rough: 0.5, metal: 0.5 });
    const discHandle = group(wall, 0, 1.0, 0.14);
    box(discHandle, 0.05, 0.16, 0.05, 0, 0, 0, 0xe0522d, { rough: 0.5 });
    decal(wall, 0.36, 0.06, 0, 1.24, 0.135, signFace("MAIN LINE DISCONNECT", { accent: "#e0522d", scale: 0.4 }));
    reg(hits, discHandle, "main-disconnect");

    const hasp = torus(wall, 0.022, 0.006, 0.13, 0.62, 0.14, CITY.steel, { rough: 0.3, metal: 0.9 });
    hasp.rotation.y = Math.PI / 2;
    reg(hits, hasp, "lockout-hasp");
    const appliedLock = lockTag(wall, 0.13, 0.62, 0.16);
    appliedLock.visible = false;

    const controller = group(g, 1.85, 0, 0.5, -0.9);
    slab(controller, 0.3, 0.4, 0.1, 0, 0.95, 0, 0x2b3138, { radius: 0.03, rough: 0.5, metal: 0.4 });
    const controllerScreen = decal(controller, 0.24, 0.16, 0, 1.05, 0.052,
      signFace("ARMED", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.4 }), { glow: true, ei: 0.85, px: 256 });
    holoTag(controller, "Car controller", 0, 1.2, 0.06, { css: "#e0522d", w: 0.3 });
    const callLamp = ball(controller, 0.022, 0.1, 1.16, 0.05, 0xf2c14b, { emissive: 0xf2c14b, ei: 2.4 });
    callLamp.visible = false;
    reg(hits, controller, "controller-panel");

    const testButton = group(g, -0.7, 0.5, 0.3, 0.4);
    cyl(testButton, 0.045, 0.045, 0.03, 0, 0, 0.015, 0xe0522d, { rough: 0.5, seg: 14, emissive: 0xe0522d, ei: 0.7 }).rotation.x = Math.PI / 2;
    holoTag(testButton, "Test run — constant pressure", 0, 0.14, 0, { css: "#e0522d", w: 0.5 });
    reg(hits, testButton, "test-run-button");

    // -------------------------------------------------------------------- docs
    const chest = toolChest(g, -1.7, 1.3, { ry: 0.6, color: 0xe0522d });
    const meter = instrument(chest, -0.06, 0.79, 0.02, { ry: 0.3, idle: "-- V", color: 0xe0522d });
    holoTag(meter, "CAT III meter", 0, 0.16, 0, { css: "#e0522d", w: 0.28 });
    reg(hits, meter, "controller-meter");

    const gaugeCaliper = instrument(g, -0.3, 0.5, 0.4, { ry: -0.3, idle: "-- mm", color: 0xe0522d });
    holoTag(gaugeCaliper, "Lining caliper", 0, 0.16, 0, { css: "#e0522d", w: 0.3 });
    reg(hits, gaugeCaliper, "brake-pad-gauge-tool");
    const feeler = instrument(g, 0.55, 0.5, 0.55, { ry: 0.3, idle: "-- mm", color: 0xe0522d });
    holoTag(feeler, "Feeler gauge", 0, 0.16, 0, { css: "#e0522d", w: 0.28 });

    const ticket = holoPanel(g, 0.5, 0.36, -1.9, 1.4, 1.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0522d"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffd8cb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("JOB TICKET — CAR 6 M/R", w * 0.06, h * 0.18);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#f5cfc3";
      ["Brake test + lining check", "Isolation: this room's own disc.", "Guard the hand-release lever"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.4 + i * 0.16)));
    }, { ry: 0.5, accent: 0xe0522d });
    reg(hits, ticket, "job-ticket");

    const permitPanel = holoPanel(g, 0.56, 0.4, -0.9, 1.5, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0522d"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffd8cb"; ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK ORDER EW-31", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f5e0d5"; ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CAR 6 — BRAKE TEST", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#efd2c5";
      ["Signage: all landings out-of-service", "Lining + gap to wear limits", "Guard pin before any measurement", "Test run before release"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.3, accent: 0xe0522d });
    reg(hits, permitPanel, "disconnect-permit");

    const logPanel = holoPanel(g, 0.5, 0.34, 1.9, 1.4, 1.2, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e0522d"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffe4d8"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("MACHINE ROOM LOG — CAR 6", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#efd2c5";
      cx.fillText("Lining, gap, stopping test", w * 0.06, h * 0.48);
      cx.fillText("and oil level, this visit", w * 0.06, h * 0.68);
    }, { ry: -0.6, accent: 0xe0522d });
    reg(hits, logPanel, "brake-test-log");

    // Second mechanic near the controller, close enough to reach for the
    // lever if nobody stops them.
    // ---------------------------------------------------------- room dressing
    // Overhead cable tray and conduit run, clear of the crew and the machine.
    const tray = group(g, 0, 2.3, 0.6);
    box(tray, 4.0, 0.06, 0.3, 0, 0, 0, 0x596069, { rough: 0.6, metal: 0.4, cast: false });
    for (let i = 0; i < 9; i++) box(tray, 0.02, 0.05, 0.3, -1.9 + i * 0.48, -0.03, 0, 0x3c444c, { cast: false, receive: false });
    for (let i = 0; i < 3; i++) {
      const cable = cyl(g, 0.014, 0.014, 0.5, -1.7 + i * 0.6, 2.0, 0.6, 0x1b1e22, { rough: 0.85, seg: 8, cast: false });
      cable.rotation.x = Math.PI / 2;
    }

    // Ventilation louvre bank on the machine room wall.
    const vent = group(g, -2.1, 1.4, -1.6, 0.3);
    box(vent, 0.5, 0.4, 0.05, 0, 0, 0, 0x53585e, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 6; i++) box(vent, 0.42, 0.045, 0.02, 0, -0.15 + i * 0.06, 0.03, 0x2b3138, { rough: 0.55, metal: 0.4 });

    // Spare brake lining shelf.
    const shelf = group(g, -2.0, 0, 0.6, 0.4);
    box(shelf, 0.5, 0.03, 0.3, 0, 0.55, 0, 0x8a7a63, { rough: 0.7 });
    box(shelf, 0.5, 0.03, 0.3, 0, 0.9, 0, 0x8a7a63, { rough: 0.7 });
    for (const [sx, sy] of [[-0.14, 0.58], [0.05, 0.58], [-0.05, 0.93]]) {
      box(shelf, 0.15, 0.05, 0.2, sx, sy, 0, 0x2a2420, { rough: 0.85 });
    }
    holoTag(shelf, "Spare linings", 0, 1.02, 0, { css: "#e0522d", w: 0.32 });

    // Fire extinguisher on the wall.
    const extinguisher = group(g, 2.1, 0, -1.7, -0.2);
    cyl(extinguisher, 0.05, 0.06, 0.28, 0, 0.5, 0, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 12 });
    cyl(extinguisher, 0.015, 0.02, 0.06, 0, 0.67, 0, 0x22272c, { rough: 0.4, metal: 0.6, seg: 10 });

    const otherMech = standingFigure(g, -0.9, 1.1, { ry: 2.4, cloth: 0x37505f, helmet: 0xe0522d, vest: 0xe4dc3a });
    holoTag(otherMech, "second mechanic", 0, 1.95, 0, { css: "#e0522d", w: 0.36 });
    const mechHome = otherMech.position.clone();

    let live = true;

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "disconnect") { live = false; repaint(controllerScreen, signFace("ISOLATED", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.38 })); }
        if (step.id === "lock") appliedLock.visible = true;
        if (step.id === "verify-zero") repaint(controllerScreen, signFace("DE-ENERGISED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        if (step.id === "brake-lever-guard") guardPin.rotation.x = 0;
        if (step.id === "restore") {
          appliedLock.visible = false; discHandle.rotation.z = 0; live = true;
          repaint(controllerScreen, signFace("READY", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
        }
        if (step.id === "test-run") repaint(controllerScreen, signFace("TEST\nTRIP OK", { bg: "#0d1c14", accent: "#e0522d", fg: "#ffd8cb", scale: 0.32 }));
      },

      onInterrupt(it) {
        if (it.id === "call-during-test") {
          callLamp.visible = true;
          repaint(controllerScreen, signFace("HALL CALL\nLANDING 4", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.3 }));
        }
        if (it.id === "lever-tampered") { otherMech.position.set(-0.55, mechHome.y, 0.25); guardPin.rotation.x = 0.6; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "call-during-test") {
          callLamp.visible = false;
          repaint(controllerScreen, signFace("DE-ENERGISED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
        if (it.id === "lever-tampered") { otherMech.position.copy(mechHome); guardPin.rotation.x = 0; }
      },

      animate(t, dt, session) {
        if (live) controllerScreen.material.emissiveIntensity = 0.7 + Math.sin(t * 2) * 0.15;
        if (session?.step?.id === "brake-test-run" && session.holding) sheave.rotation.x += dt * 6;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "verify-zero") {
            const v = Math.round(gg.t * 480);
            repaint(meter.userData.screen, signFace(`${v} V`, { bg: "#0d1c24", accent: v < 38 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
          }
          if (session.step?.id === "pad-wear") {
            const mm = (2 + gg.t * 6).toFixed(1);
            repaint(gaugeCaliper.userData.screen, signFace(`${mm} mm`, { bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
          }
          if (session.step?.id === "shoe-gap") {
            const mm = (0.3 + gg.t * 0.5).toFixed(2);
            repaint(feeler.userData.screen, signFace(`${mm} mm`, { bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
          }
          if (session.step?.id === "oil-level") {
            const pct = Math.round(gg.t * 100);
            repaint(sightGlass.userData.screen, signFace(`${pct} %`, { bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.7 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
          }
        }
      },
    };
  },
};
