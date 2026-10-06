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

// SmartCiti.X~ Door Operator Adjustment and Gap VR — IUEC elevator
// constructors, door service. A car and hoistway door pair only protects
// anyone the day they close and hold against a real obstruction, and every
// number this station adjusts — the interlock gap, the closing force, the
// reopening device — exists because a door that merely looks closed is not
// the same thing as a door a passenger can trust their hand near.

const EWDOG_ACCENT = 0xa06cd5;

/** Lobby terrazzo floor: pale stone chips in a warm binder, ground smooth. */
function ewdogTerrazzoFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#8a8478"], [1, o.base2 ?? "#78725f"]]);
  noiseTexture(g, w, h, { density: 1200, alpha: 0.05, tone: "255,255,255" });
  for (let i = 0; i < 260; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = 1 + Math.random() * 2.4;
    g.fillStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "40,36,30"},0.12)`;
    g.fillRect(x, y, r, r);
  }
  grimeOverlay(g, w, h, { blotches: 2, streaks: 1, tone: "30,26,18", alpha: 0.08 });
}

export const SIM_EW_DOOR_OPERATOR_ADJUSTMENT_AND_GAP = {
  id: "ew-door-operator-adjustment-and-gap",
  index: "356",
  domain: "Facilities",
  trade: "Elevator constructor / mechanic — IUEC",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "IUEC elevator constructors; NEIEP apprenticeship curriculum for door service; ASME A17.1 the safety code for elevators and escalators, whose door reopening-device and interlock provisions this station follows; OSHA 29 CFR 1910.147 control of hazardous energy for the door operator's own disconnect",
  name: "Door Operator Adjustment and Gap",
  title: simTitle("Door Operator Adjustment and Gap"),
  tagline: "Isolating the door operator, gauging the interlock gap, adjusting closing force and closing speed, and proving the reopening device before the car returns to service",
  accent: EWDOG_ACCENT,
  accentCss: "#a06cd5",
  parSeconds: 245,
  footprint: 2.1,
  badge: { id: "door-proven", name: "Door Proven", note: "Interlock gap, closing force and the reopening device all proven inside spec before the car went back in service" },

  game: system({
    name: "Door Authority",
    currency: "GAP",
    ranks: ["Helper", "Door Mechanic", "Adjuster", "Lead Mechanic", "Door Authority Certified"],
    badges: [
      { id: "isolated-first", name: "Isolated First", note: "Never adjusted the operator before it was isolated and locked", test: AWARD.stepClean("lock") },
      { id: "true-gap", name: "True Gap", note: "Held both the interlock gap and the force readings near band centre", test: AWARD.precise(0.7) },
      { id: "clean-restore", name: "Clean Restore", note: "Restored in the correct order, no correction", test: AWARD.stepClean("restore") },
    ],
    challenges: [
      { id: "no-callback", name: "No Callback", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "reopen-held", name: "Reopen Held", note: "Never let the reopening-device test slip mid-hold", test: AWARD.unbroken },
      { id: "door-fast", name: "Door Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "closing-edge-pinch": "You reached into the door's closing edge while the operator was still live. A power door closes with enough force to be useful against a stuck panel, which is exactly the force a hand caught at the leading edge is being asked to absorb instead.",
    "interlock-bypassed": "You bypassed the hoistway door interlock to hold the door open for the adjustment. The interlock is what proves this door is actually locked before the car is allowed to leave the floor, and defeating it — even briefly, even with the best intentions — turns a locked door into one that only looks locked.",
    "reopening-device-blocked": "You taped over the reopening device's sensor to stop it from tripping during the force test. That sensor is what makes a door back off a bag, a cane or a hand instead of continuing to close on it, and blocking it to get a clean reading defeats the one thing the reading is supposed to prove still works.",
    "unlabelled-restored-panel": "You closed up the operator cover without confirming the door restored to its labelled closing force. A cover that goes back on before the force is checked hides exactly the adjustment this whole visit was for, and the next person to find out it is wrong is a passenger's hand.",
  },

  lateNotes: {
    "gap-gauge": "The interlock gap is only measured once the operator is proven dead and the door is at rest.",
    "reopen-sensor": "The reopening device is only tested once the closing force has already been set to spec.",
  },

  supportLine: "your IUEC local's member assistance programme, or the NEIEP training coordinator for anything about the certification record",

  steps: [
    {
      id: "checkin", kind: "select", target: "job-ticket",
      title: "Check in at the landing",
      cue: "Read the job ticket and confirm which door this call is actually about.",
      why: "A lobby can have several car entrances close enough together that a mechanic can start adjusting the wrong one, and the ticket names the specific door — car number and floor — before a tool touches any operator.",
    },
    {
      id: "permit", kind: "select", target: "door-permit",
      title: "Post the door service permit",
      cue: "Read the work order and confirm the car is parked at this floor with the landing signage posted.",
      why: "The car is parked and held at this exact floor because a door adjustment assumes the car is not going anywhere during it, and the landing signage tells the next passenger this entrance is not the one to use in the meantime.",
    },
    {
      id: "disconnect", kind: "turn", target: "operator-disconnect",
      title: "Open the door operator disconnect",
      cue: "Pull the door operator's disconnect handle firmly to its open stop.",
      why: "The disconnect is pulled fully open rather than eased over, because a switch left between positions can leave the operator motor able to move under load — which is precisely the moment a mechanic's hand is going to be in the door's own closing path.",
      turn: { turns: 0.2, axis: "z", reverse: true, label: "OPERATOR DISCONNECT" },
    },
    {
      id: "lock", kind: "select", target: "lockout-hasp",
      title: "Lock and tag the disconnect",
      cue: "Apply your padlock and tag before the cover comes off the operator.",
      why: "A door operator that looks off is still a door operator with a spring-return or a counterweight somewhere in it that can move a panel even with the motor dead — the lock is what keeps this specific door yours for as long as the cover is open, not as long as it happens to sit still.",
    },
    {
      id: "cover-open", kind: "select", target: "operator-cover",
      title: "Open the operator cover",
      cue: "Remove the header cover to expose the operator mechanism.",
      why: "Everything from here on — the gap, the force, the closing speed — is adjusted at the mechanism itself, and the cover only comes off once the isolation ahead of it is actually trusted, not assumed from how quiet the operator sounds.",
    },
    {
      id: "gap-gauge", kind: "gauge", target: "gap-gauge",
      title: "Measure the interlock gap",
      cue: "Set the feeler gauge in the hoistway door's interlock gap and commit the reading inside spec.",
      why: "The interlock only locks reliably at the gap it was built for — too wide and it can fail to engage fully, too narrow and the door can bind against its own lock. Either fault can look, from the lobby, exactly like a door that closes and opens normally right up until the day it does not.",
      gauge: {
        label: "INTERLOCK GAP", speed: 0.55, green: [0.4, 0.6],
        readout: (t) => `${(3 + t * 6).toFixed(1)} mm`,
        missNote: "Outside spec. Adjust the interlock roller and measure again before the cover goes back on.",
      },
    },
    {
      id: "panel-inspect", kind: "find", noHint: true,
      targets: ["worn-sill-track", "cracked-vane", "loose-belt"],
      itemNames: { "worn-sill-track": "a worn sill track", "cracked-vane": "a cracked interlock vane", "loose-belt": "a loose drive belt" },
      itemNotes: {
        "worn-sill-track": "A worn sill track lets the door rock in its guide as it travels, which is exactly the kind of play that eventually shows up as a door that will not close square against its own interlock.",
        "cracked-vane": "A cracked interlock vane can still engage the lock today and shear off the day a door slams against it a little harder than usual — it gets replaced now, not watched.",
        "loose-belt": "A loose drive belt slips under load before it ever announces itself as a problem, and a door that closes slower under a slipping belt is a door whose reopening-device timing is no longer what it was set to.",
      },
      title: "Inspect the operator mechanism",
      cue: "Look over the sill track, the interlock vane and the drive belt. Three things need fixing before this door is signed off.",
      why: "A door operator earns its cover back by being inspected properly with it off, not by running quietly — quiet is what a door does right up until one of these three things finally lets go.",
    },
    {
      id: "force-adjust", kind: "turn", target: "force-adjuster",
      title: "Adjust the closing force",
      cue: "Turn the closing-force adjuster to the label's spec.",
      why: "Closing force is set to the door's own label, not to a feel for what seems safe — too little force and the door can be held open by ordinary crowding, too much and the door itself becomes the obstruction it is supposed to stop for.",
      turn: { turns: 0.3, axis: "z", label: "CLOSING FORCE" },
    },
    {
      id: "speed-adjust", kind: "gauge", target: "door-speed-gauge",
      title: "Set the closing speed",
      cue: "Read the door's closing speed and commit inside the label's kinetic-energy limit.",
      why: "Closing force alone does not describe what a door does to something in its path — a lighter door moving fast can carry as much kinetic energy into an obstruction as a heavier one moving slow, so the speed is checked against its own limit on the label, not tuned by ear for a door that merely sounds reasonable.",
      gauge: {
        label: "CLOSING SPEED", speed: 0.55, green: [0.4, 0.6],
        readout: (t) => `${(0.2 + t * 0.6).toFixed(2)} m/s`,
        missNote: "Outside the label's limit. Adjust the closing-speed valve and read it again before the reopening device is tested.",
      },
    },
    {
      id: "reopen-test", kind: "hold", target: "reopen-sensor", seconds: 6,
      title: "Test the reopening device",
      cue: "Hold a test object in the door's path and confirm the reopening device backs the door off every time.",
      why: "The reopening device is what makes a closing door treat an obstruction as a reason to stop rather than an inconvenience to close through, and it is tested by actually putting something in the door's path — not by watching the door close cleanly on an empty opening and assuming the sensor would have caught something.",
      holdBreakNote: "You pulled the test object clear before the full hold, so the reopening device never had to prove anything. Hold it in the door's path for the full test.",
    },
    {
      id: "restore", kind: "sequence",
      targets: ["operator-cover", "lockout-hasp", "operator-disconnect"],
      itemNames: { "operator-cover": "operator cover", "lockout-hasp": "your lock off the hasp", "operator-disconnect": "operator disconnect" },
      title: "Restore in the correct order",
      cue: "Close the operator cover, then take your lock off the hasp, then close the disconnect.",
      why: "The cover goes back on before the lock comes off, because a mechanism left open with power one step away is worse than one left open with the lock still on it. The disconnect is closed last, once the cover, the lock and everyone's hands are all clear of the mechanism.",
      outOfOrderNote: "Wrong order — the cover first, then your lock, and the disconnect last.",
    },
    {
      id: "test-run", kind: "select", target: "door-controller",
      title: "Run the door through a normal cycle",
      cue: "With power restored, cycle the door open and closed on a normal call before release.",
      why: "A door adjusted correctly at the bench of tools spread across the lobby floor is not yet a door proven in service — the last check is an ordinary open-close cycle, on an ordinary call, because that is the only test that looks exactly like what the first passenger is about to ask of it.",
    },
    {
      id: "log", kind: "select", target: "door-log",
      title: "Log the door service",
      cue: "Write the interlock gap, the closing force and the reopening-device result on the door log.",
      why: "The next mechanic who opens this cover reads this log before they read the door itself, and a gap or force number that goes unwritten today is a number somebody else has to remeasure from zero the next time this door is due.",
    },
  ],

  interrupts: [
    {
      id: "passenger-approaches",
      kind: "Passenger at the landing",
      after: "gap-gauge", delay: 4, seconds: 12,
      alert: "A passenger has just walked up to this landing and is reaching for the door you have open for service.",
      cue: "Get between them and the opening before they step toward it.",
      target: "door-permit",
      why: "The permit and the signage are what a passenger is supposed to see before they reach for this door, and one who has not seen it yet is a person about to step toward an opening with the interlock defeated and a mechanic's tools inside it. The signage gets reasserted before the adjustment continues.",
      missNote: "The passenger reached the opening with nobody stopping them. Signage that a passenger walks past without noticing has not done its job, and the mechanic standing right there is the last thing between them and an open hoistway door.",
      wrongNote: "It is the door permit and signage. Whoever just walked up needs to see it before anything else continues.",
    },
    {
      id: "cover-closes",
      kind: "Cover interfered with",
      after: "force-adjust", delay: 4, seconds: 11,
      alert: "A building porter has started to swing the operator cover shut, thinking the job already looks finished.",
      cue: "That cover is not going back on yet.",
      target: "operator-cover",
      why: "The reopening device has not been tested yet, and a cover closed now hides an adjustment that is not actually finished. It gets stopped before it latches, not reopened afterward once somebody assumes the job is done.",
      missNote: "The cover went back on with the reopening device untested. A door that looks finished and a door that is proven are not the same thing, and only one of them is safe to hand back.",
      wrongNote: "It is the operator cover. Whatever the porter thinks, this job is not done yet.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, EWDOG_ACCENT);

    // ------------------------------------------------------------- the floor
    const floorTex = surfaceTexture((cx, w, h) => ewdogTerrazzoFace(cx, w, h, {}), { repeat: 3, px: 320 });
    const floor = box(g, 4.4, 0.1, 4.0, 0, 0.05, 0, 0x8a8478, { rough: 0.5, metal: 0.05 });
    floor.material = texturedMat(floorTex, { rough: 0.45, metal: 0.05, color: 0x8a8478 });

    // ------------------------------------------------------------ door frame
    const frameTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#6a5a8a", base2: "#584a75" }), { repeat: 1, px: 320 });
    const frame = group(g, 0, 0, -1.3);
    const jambL = box(frame, 0.12, 2.3, 0.1, -0.6, 1.15, 0, 0x6a5a8a, { rough: 0.5, metal: 0.4 });
    jambL.material = texturedMat(frameTex, { rough: 0.45, metal: 0.4, color: 0x6a5a8a });
    const jambR = box(frame, 0.12, 2.3, 0.1, 0.6, 1.15, 0, 0x6a5a8a, { rough: 0.5, metal: 0.4 });
    jambR.material = texturedMat(frameTex, { rough: 0.45, metal: 0.4, color: 0x6a5a8a });
    const header = box(frame, 1.4, 0.5, 0.16, 0, 2.4, 0, 0x53456e, { rough: 0.5, metal: 0.4 });
    reg(hits, header, "operator-cover");

    // Two car door panels, one leading with the closing-edge marker.
    const doorL = box(frame, 0.56, 2.1, 0.05, -0.3, 1.05, 0.06, 0x9a92a8, { rough: 0.4, metal: 0.3 });
    const doorR = box(frame, 0.56, 2.1, 0.05, 0.3, 1.05, 0.06, 0x9a92a8, { rough: 0.4, metal: 0.3 });
    const pinchZone = box(frame, 0.05, 1.8, 0.08, 0, 1.05, 0.08, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(pinchZone, "Closing edge", 0, 0.16, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, pinchZone, "closing-edge-pinch");

    // Interlock at the top of the hoistway door, with a gap marker.
    const interlock = group(frame, -0.45, 2.1, 0.1);
    box(interlock, 0.1, 0.06, 0.04, 0, 0, 0, 0x53585e, { rough: 0.5, metal: 0.5 });
    const interlockVane = box(interlock, 0.02, 0.08, 0.02, 0.06, -0.02, 0.01, 0xd8b23a, { rough: 0.4, metal: 0.5 });
    holoTag(interlock, "Interlock", 0, 0.14, 0, { css: "#a06cd5", w: 0.28 });
    reg(hits, interlockVane, "interlock-bypassed");
    const gapMarker = box(interlock, 0.03, 0.03, 0.03, 0.03, -0.02, 0.01, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, gapMarker, "gap-gauge");
    const gapInstrument = instrument(frame, -0.9, 1.9, 0.15, { ry: 0.3, idle: "-- mm", color: 0xa06cd5 });
    holoTag(gapInstrument, "Feeler gauge", 0, 0.16, 0, { css: "#a06cd5", w: 0.28 });

    // Operator mechanism behind the header: motor, belt, force adjuster, sensor.
    const operator = group(frame, 0, 2.4, -0.1);
    const motor = box(operator, 0.3, 0.16, 0.14, -0.4, 0, 0, 0x3c444c, { rough: 0.5, metal: 0.5 });
    void motor;
    const belt = torus(operator, 0.09, 0.012, 0, -0.1, 0, 0x1b1e22, { rough: 0.6, seg: 8, seg2: 20 });
    belt.rotation.y = Math.PI / 2;
    reg(hits, belt, "loose-belt");
    const trackRail = box(operator, 0.9, 0.03, 0.03, 0, -0.1, 0.06, 0x53585e, { rough: 0.6, metal: 0.4 });
    reg(hits, trackRail, "worn-sill-track");
    const vaneCrack = box(operator, 0.02, 0.06, 0.015, 0.35, -0.05, 0.02, 0xd8b23a, { rough: 0.5, metal: 0.4 });
    reg(hits, vaneCrack, "cracked-vane");

    const forceAdjuster = group(operator, 0.2, 0.08, 0.05, 0.2);
    cyl(forceAdjuster, 0.03, 0.03, 0.05, 0, 0, 0, 0xd8b23a, { rough: 0.4, metal: 0.5, seg: 12 });
    const forceLever = box(forceAdjuster, 0.05, 0.012, 0.012, 0.03, 0.03, 0, 0x22272c, { rough: 0.5 });
    void forceLever;
    holoTag(forceAdjuster, "Force adjuster", 0, 0.1, 0, { css: "#a06cd5", w: 0.3 });
    reg(hits, forceAdjuster, "force-adjuster");
    const speedGauge = instrument(operator, -0.2, 0.1, 0.06, { ry: -0.2, idle: "-- m/s", color: 0xa06cd5 });
    holoTag(speedGauge, "Closing speed gauge", 0, 0.16, 0, { css: "#a06cd5", w: 0.34 });
    reg(hits, speedGauge, "door-speed-gauge");

    const reopenSensor = group(frame, 0, 0.3, 0.14);
    ball(reopenSensor, 0.02, 0, 0, 0, 0xa06cd5, { emissive: 0xa06cd5, ei: 0.8 });
    holoTag(reopenSensor, "Reopening device", 0, 0.12, 0, { css: "#a06cd5", w: 0.34 });
    reg(hits, reopenSensor, "reopen-sensor");
    const reopenBlocker = box(frame, 0.04, 0.04, 0.01, 0, 0.3, 0.17, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, reopenBlocker, "reopening-device-blocked");

    const unlabelledPanel = box(frame, 0.3, 0.2, 0.02, 0.9, 2.0, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(unlabelledPanel, "close the cover without checking?", 0, 0.14, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, unlabelledPanel, "unlabelled-restored-panel");

    // ------------------------------------------------------------- controls
    const wall = group(g, -1.6, 0, -0.6, 0.5);
    slab(wall, 0.4, 1.0, 0.24, 0, 0.7, 0, 0x545e67, { radius: 0.03, rough: 0.5, metal: 0.5 });
    const discHandle = group(wall, 0, 0.95, 0.13);
    box(discHandle, 0.045, 0.14, 0.045, 0, 0, 0, 0xa06cd5, { rough: 0.5 });
    decal(wall, 0.32, 0.05, 0, 1.16, 0.125, signFace("DOOR OPERATOR DISC", { accent: "#a06cd5", scale: 0.4 }));
    reg(hits, discHandle, "operator-disconnect");
    const hasp = torus(wall, 0.02, 0.006, 0.12, 0.58, 0.13, CITY.steel, { rough: 0.3, metal: 0.9 });
    hasp.rotation.y = Math.PI / 2;
    reg(hits, hasp, "lockout-hasp");
    const appliedLock = lockTag(wall, 0.12, 0.58, 0.15);
    appliedLock.visible = false;

    const controller = group(g, 1.6, 0, -0.8, -0.6);
    slab(controller, 0.28, 0.36, 0.09, 0, 0.9, 0, 0x2b3138, { radius: 0.03, rough: 0.5, metal: 0.4 });
    const controllerScreen = decal(controller, 0.22, 0.14, 0, 0.98, 0.047, signFace("ARMED", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.4 }), { glow: true, ei: 0.85, px: 256 });
    holoTag(controller, "Door controller", 0, 1.12, 0.05, { css: "#a06cd5", w: 0.3 });
    reg(hits, controller, "door-controller");

    // ------------------------------------------------------------- docs + tools
    const chest = toolChest(g, 1.6, 1.3, { ry: -0.6, color: 0xa06cd5 });
    void chest;

    const ticket = holoPanel(g, 0.5, 0.36, -1.9, 1.4, 1.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#a06cd5"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e6d6f5"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("JOB TICKET — CAR 2 DOOR", w * 0.06, h * 0.18);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#d8c2ec";
      ["Interlock gap + closing force", "Reopening device test", "Log before sign-off"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.4 + i * 0.16)));
    }, { ry: 0.5, accent: 0xa06cd5 });
    reg(hits, ticket, "job-ticket");

    const permitPanel = holoPanel(g, 0.56, 0.4, -0.7, 1.5, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#a06cd5"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e6d6f5"; ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DOOR SERVICE PERMIT EW-27", w * 0.06, h * 0.14);
      ctx.fillStyle = "#efe2f8"; ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CAR 2 — LOBBY DOOR", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#e2cdf2";
      ["Car parked at this floor", "Signage posted at this entrance", "Cover stays off until proven", "Test run before release"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.3, accent: 0xa06cd5 });
    reg(hits, permitPanel, "door-permit");
    const permitLamp = ball(g, 0.02, -0.7, 1.72, 1.6, 0x2b3138, { emissive: 0x2b3138, ei: 0.2 });

    const logPanel = holoPanel(g, 0.5, 0.34, 1.9, 1.4, 0.6, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#a06cd5"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#efe2f8"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("DOOR LOG — CAR 2", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e2cdf2";
      cx.fillText("Gap, force and reopen", w * 0.06, h * 0.48);
      cx.fillText("test, this visit", w * 0.06, h * 0.68);
    }, { ry: -0.6, accent: 0xa06cd5 });
    reg(hits, logPanel, "door-log");

    // A porter loitering near the cover, who eventually tries to close it.
    // ---------------------------------------------------------- room dressing
    const tray = group(g, 0, 2.6, 1.4);
    box(tray, 3.4, 0.06, 0.3, 0, 0, 0, 0x596069, { rough: 0.6, metal: 0.4, cast: false });
    for (let i = 0; i < 8; i++) box(tray, 0.02, 0.05, 0.3, -1.6 + i * 0.46, -0.03, 0, 0x3c444c, { cast: false, receive: false });
    for (let i = 0; i < 3; i++) {
      const cable = cyl(g, 0.014, 0.014, 0.5, -1.4 + i * 0.6, 2.3, 1.4, 0x1b1e22, { rough: 0.85, seg: 8, cast: false });
      cable.rotation.x = Math.PI / 2;
    }
    const shelf = group(g, -1.9, 0, 1.3, 0.4);
    box(shelf, 0.5, 0.03, 0.3, 0, 0.55, 0, 0x53585e, { rough: 0.6, metal: 0.4 });
    box(shelf, 0.5, 0.03, 0.3, 0, 0.9, 0, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const [sx, sy] of [[-0.14, 0.58], [0.05, 0.58], [-0.05, 0.93], [0.12, 0.93]]) {
      box(shelf, 0.13, 0.05, 0.18, sx, sy, 0, 0x2b3138, { rough: 0.55, metal: 0.4 });
    }
    holoTag(shelf, "Spare door hardware", 0, 1.02, 0, { css: "#a06cd5", w: 0.36 });
    const extinguisher = group(g, 2.0, 0, -1.6, -0.2);
    cyl(extinguisher, 0.05, 0.06, 0.28, 0, 0.5, 0, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 12 });
    cyl(extinguisher, 0.015, 0.02, 0.06, 0, 0.67, 0, 0x22272c, { rough: 0.4, metal: 0.6, seg: 10 });
    const bench = group(g, -1.7, 0, -1.5, 0.3);
    box(bench, 0.7, 0.4, 0.4, 0, 0.2, 0, 0x8a5a34, { rough: 0.7 });
    box(bench, 0.7, 0.04, 0.42, 0, 0.42, 0, 0x9a6a3e, { rough: 0.6 });

    const porter = standingFigure(g, 0.3, 0.4, { ry: 2.6, cloth: 0x5a6a72, vest: false, cap: 0x2b2f34 });
    holoTag(porter, "building porter", 0, 1.9, 0, { css: "#a06cd5", w: 0.36 });
    const porterHome = porter.position.clone();

    let live = true;

    return {
      hits,
      footprint: 2.1,

      onStepComplete(step) {
        if (step.id === "disconnect") { live = false; discHandle.rotation.z = Math.PI / 2; repaint(controllerScreen, signFace("ISOLATED", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.38 })); }
        if (step.id === "lock") appliedLock.visible = true;
        if (step.id === "cover-open") header.rotation.x = -0.6;
        if (step.id === "force-adjust") forceAdjuster.rotation.y = 1.0;
        if (step.id === "restore") {
          appliedLock.visible = false; discHandle.rotation.z = 0; live = true; header.rotation.x = 0;
          repaint(controllerScreen, signFace("READY", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
        }
        if (step.id === "test-run") {
          repaint(controllerScreen, signFace("TEST\nCYCLE OK", { bg: "#0d1c14", accent: "#a06cd5", fg: "#eadcf7", scale: 0.32 }));
        }
      },

      onInterrupt(it) {
        if (it.id === "passenger-approaches") { repaint(controllerScreen, signFace("PASSENGER\nAT DOOR", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.3 })); permitLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 2.2 }); }
        if (it.id === "cover-closes") { porter.position.set(0.3, porterHome.y, -1.1); header.rotation.x = -0.2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "passenger-approaches") { repaint(controllerScreen, signFace("ISOLATED", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.38 })); permitLamp.material = mat(0x2b3138, { emissive: 0x2b3138, ei: 0.2 }); }
        if (it.id === "cover-closes") { porter.position.copy(porterHome); header.rotation.x = -0.6; }
      },

      animate(t, dt, session) {
        if (live) controllerScreen.material.emissiveIntensity = 0.7 + Math.sin(t * 2) * 0.15;
        const step = session?.step;
        if (session?.holding && step?.id === "reopen-test") {
          doorL.position.x = -0.3 + Math.sin(t * 3) * 0.01;
          doorR.position.x = 0.3 - Math.sin(t * 3) * 0.01;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "gap-gauge") {
          const mm = (3 + gg.t * 6).toFixed(1);
          repaint(gapInstrument.userData.screen, signFace(`${mm} mm`, { bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (gg && !gg.committed && step?.id === "speed-adjust") {
          const ms = (0.2 + gg.t * 0.6).toFixed(2);
          repaint(speedGauge.userData.screen, signFace(`${ms} m/s`, { bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (session?.turn && (step?.id === "disconnect" || step?.id === "force-adjust")) {
          const target = step.id === "disconnect" ? discHandle : forceAdjuster;
          target.rotation.z = (session.turn.amount / session.turn.required) * (step.id === "disconnect" ? Math.PI / 2 : 1.0);
        }
      },
    };
  },
};
