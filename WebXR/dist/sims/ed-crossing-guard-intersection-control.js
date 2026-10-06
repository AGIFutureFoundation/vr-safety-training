import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg, cone,
  surfaceTexture, texturedMat, asphaltFace, concreteFace,
} from "../citykit.js";
import { sedan } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Crossing Guard Intersection Control VR — Mobility & Transit,
// the education-support-staff programme.
//
// The corner nearest the school at the morning bell: the post walked before
// the first student reaches it, the sightlines checked for whatever is
// parked in the way, a gap in traffic judged rather than guessed, the paddle
// raised and held while the crossing happens, both directions watched the
// whole time it's up, and the corner left as clear as it was found. The
// learner is the AFT- or CSEA-represented adult crossing guard posted at the
// corner; the intersection, the street names and every vehicle are generic.

const XG_ACCENT = 0xf2b21b;
const XG_CSS = "#f2b21b";

export const SIM_ED_CROSSING_GUARD_INTERSECTION_CONTROL = {
  id: "ed-crossing-guard-intersection-control",
  index: "623",
  domain: "Mobility & Transit",
  trade: "AFT- or CSEA-represented adult school crossing guard posted at the intersection nearest the school",
  category: "Mobility & Transit",
  weather: "clear",
  certification: "AFT and CSEA crossing-guard training; the Manual on Uniform Traffic Control Devices (MUTCD) for the corner's signal timing and the paddle's own standard shape and colour; ANSI/ISEA 107 for the high-visibility vest; the district's and the local police department's own crossing-guard training curriculum for post positioning, the gap-judgement rule and the hand signals used at this corner",
  name: "Crossing Guard Intersection Control",
  title: simTitle("Crossing Guard Intersection Control"),
  tagline: "The corner before the bell: the post walked for sightlines, a gap in traffic judged before anyone steps off the curb, the paddle raised and held through the whole crossing, both directions watched the entire time, a fallen cone set back up, and the corner left as clear as it was found",
  accent: XG_ACCENT,
  accentCss: XG_CSS,
  parSeconds: 300,
  footprint: 2.9,
  badge: { id: "gap-judged-not-guessed", name: "Gap Judged, Not Guessed", note: "Every crossing timed to an actual gap in traffic, the paddle held the whole way across, and never a step off the curb before the gap was checked" },

  supportLine: "your AFT or CSEA chapter's member assistance line, or the district's employee assistance programme",

  game: system({
    name: "The Corner",
    currency: "GAP",
    ranks: ["Corner Trainee", "Crossing Guard", "Lead Guard", "Corner Trainer", "Intersection Certified"],
    badges: [
      { id: "never-guessed-the-gap", name: "Never Guessed the Gap", note: "Every gap judged before stepping off the curb, never assumed", test: AWARD.safe },
      { id: "clean-corner", name: "Clean Corner", note: "No corrections across the whole post", test: AWARD.clean },
      { id: "steady-scan", name: "Steady Scan", note: "The both-directions scan held in band without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "post-set-on-time", name: "Post Set on Time", note: "Post walked and set up inside 80% of par", test: AWARD.fast(0.8) },
      { id: "one-pass-post-check", name: "One-Pass Post Check", note: "Sightline check clean on the first pass", test: AWARD.stepClean("sightline-check") },
      { id: "seven-in-a-row", name: "Seven in a Row", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "step-off-without-checking": "That's stepping off the curb without judging the gap first. The paddle tells drivers to stop; it does not make them stop in time — the gap gets checked every single crossing, not assumed clear because the last one was.",
    "distracted-by-phone": "That's the guard's own phone lighting up on the equipment cart mid-shift. A corner with kids crossing it needs eyes on the intersection every second the post is staffed — a glance down at a phone is a glance away from the one thing this post exists to watch.",
    "paddle-down-early": "The paddle is going down while a straggler is still out in the lane. Traffic reads the paddle, not the crosswalk — lowering it early tells drivers to go while someone is still walking, which is the exact moment the paddle is supposed to prevent.",
    "cart-in-the-roadway": "The equipment cart is sitting out in the bike lane instead of back on the curb. A cart parked in the roadway is one more obstruction drivers and cyclists have to steer around at the exact corner where kids are also crossing.",
  },

  lateNotes: {
    "traffic-gap": "Not yet — the gap gets judged once the post is actually set up and the corner has been checked for sightlines, not before.",
    "crossing-position": "The crossing doesn't start until the paddle is actually raised — that's the next step.",
  },

  steps: [
    {
      id: "read-post-board", kind: "select", target: "post-board",
      title: "Read today's post assignment",
      cue: "Read the post board for today's corner, timing and any special instructions.",
      why: "An early dismissal, a construction detour or a substitute route all change what 'normal' looks like at this corner for one day — reading the board before walking out is what keeps a guard from posting up for a schedule that isn't today's.",
    },
    {
      id: "post-setup", kind: "sequence", anyOrder: false,
      targets: ["vest-on", "paddle-grabbed", "position-set"],
      itemNames: { "vest-on": "hi-vis vest on", "paddle-grabbed": "stop paddle in hand", "position-set": "positioned at the marked corner" },
      title: "Vest, paddle, position",
      cue: "Put the hi-vis vest on, take the stop paddle, then take the marked position at the corner, in that order.",
      why: "The vest goes on before anything else because it's what makes the guard visible to a driver before the paddle ever comes up; the marked position at the corner is set last because it's chosen for the exact sightlines the vest and paddle both depend on being seen from.",
      outOfOrderNote: "Vest, then paddle, then position — the corner is chosen from the vest and the paddle already in place, not the other way round.",
    },
    {
      id: "check-pedestrian-signal", kind: "select", target: "pedestrian-signal",
      title: "Check the pedestrian signal",
      cue: "Read the intersection's own pedestrian signal before the first crossing.",
      why: "The guard's paddle backs up the intersection's own signal rather than replacing it, and a signal stuck on a stale phase or dark entirely changes what a driver at this corner is already expecting — checking it before the first crossing is what tells the guard whether they're reinforcing the signal or the only thing this corner has working at all today.",
    },
    {
      id: "sightline-check", kind: "find", noHint: true,
      targets: ["parked-delivery-truck", "faded-crosswalk-paint", "knocked-over-sign"],
      itemNames: { "parked-delivery-truck": "the delivery truck parked in the sightline", "faded-crosswalk-paint": "the crosswalk paint worn past reading", "knocked-over-sign": "the school-crossing sign knocked flat" },
      itemNotes: {
        "parked-delivery-truck": "A delivery truck is parked hard against the corner, blocking the sightline down the cross street. A guard who can't see past it can't judge a gap in that direction at all, and neither can a driver trying to see around it toward the crosswalk.",
        "faded-crosswalk-paint": "The crosswalk's paint has worn past where most drivers actually notice it. A crossing that isn't clearly marked on the pavement is one more thing working against the guard rather than for them.",
        "knocked-over-sign": "The school-crossing sign has been knocked flat, probably by a wide turn. A driver who has never worked this corner before has no warning it's a school crossing at all without that sign standing.",
      },
      title: "Check the corner's sightlines before the first crossing",
      cue: "Three things about this corner are working against a clear sightline. Find them before the first student reaches the curb.",
      why: "A gap in traffic can only be judged by a guard who can actually see the traffic — a blocked sightline, faded paint or a downed sign are all things that make the corner more dangerous than it looks standing on it, and each one gets caught before, not during, the first crossing.",
    },
    {
      id: "gap-gauge", kind: "gauge", target: "traffic-gap",
      title: "Judge the gap in traffic",
      cue: "Watch the traffic and commit the moment there is a clear gap to start the crossing.",
      why: "A guard who steps out on a gap that isn't actually there is trusting a driver to stop in time rather than trusting a gap that was already clear — the whole point of judging it first is that the crossing starts on a corner's own clear moment, not on hope.",
      gauge: { label: "TRAFFIC GAP", speed: 0.7, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "car still closing" : t > 0.62 ? "already past — wait for the next one" : "clear gap"), missNote: "Not a real gap. Wait for traffic to actually clear before committing to step off the curb." },
    },
    {
      id: "raise-paddle", kind: "turn", target: "stop-paddle",
      title: "Raise the stop paddle",
      cue: "Turn the paddle up from resting to fully raised, facing traffic.",
      why: "A paddle raised only partway reads as ambiguous to a driver approaching at speed — it goes all the way up, held flat toward the traffic it's meant to stop, before a single student is waved off the curb.",
      turn: { turns: 0.4, label: "STOP PADDLE", readout: (t) => (t < 0.85 ? "raising" : "up") },
    },
    {
      id: "hold-crossing", kind: "hold", target: "crossing-position", seconds: 7,
      title: "Hold position while students cross",
      cue: "Hold your position in the crosswalk with the paddle up until every student is across.",
      why: "The guard's own body in the crosswalk, paddle up, is what actually stops traffic — not just the sign in their hand — and holding that position for the whole crossing is what keeps a driver from treating a paddle lowered too soon as permission to go.",
      holdBreakNote: "You left position before everyone was across. The crossing isn't finished until the last student's feet are back on the curb.",
    },
    {
      id: "scan-both-directions", kind: "track", target: "scan-cycle", seconds: 6,
      title: "Scan both directions the whole time",
      cue: "Keep scanning left and right at a steady rate while the crossing is underway.",
      why: "A guard fixed on the crosswalk itself can miss a car rolling up from either side; a scan that's too fast blurs past exactly the gap where a driver's intentions actually show — a steady, deliberate scan rate is what catches a car that isn't slowing down in time to actually see it happen.",
      track: {
        start: 0.2, green: [0.38, 0.62], rise: 0.4, fall: 0.38, drift: 0.12, label: "SCAN RATE",
        readout: (v) => (v < 0.38 ? "fixed on the crosswalk" : v > 0.62 ? "scanning too fast to register anything" : "steady scan"),
      },
      holdBreakNote: "Scan rate out of band — too slow misses a side, too fast doesn't register either one. Bring it back to steady.",
    },
    {
      id: "signal-clear", kind: "select", target: "hand-signal",
      title: "Signal the crosswalk clear",
      cue: "Once everyone is on the far curb, give the clear hand signal before lowering the paddle.",
      why: "The clear signal is the guard's own confirmation, made deliberately rather than assumed, that the crosswalk is actually empty — it happens before the paddle comes down, not at the same moment, so there's a clear beat between 'crossing finished' and 'traffic released'.",
    },
    {
      id: "lower-paddle", kind: "select", target: "stop-paddle",
      title: "Lower the paddle once the crosswalk is clear",
      cue: "Lower the paddle only once the clear signal has been given.",
      why: "Lowering the paddle is what actually releases the traffic that's been stopped — it happens last, after the clear signal, so there is never a moment where traffic is released while the guard's own read of the crosswalk is still in question.",
    },
    {
      id: "reset-fallen-cone", kind: "drag", target: "fallen-cone",
      title: "Set the fallen cone back up",
      cue: "Carry the knocked-over cone back to its marked spot at the corner.",
      why: "A cone down at the corner stops marking the guard's own working space the moment it falls — setting it back up between crossings keeps the post's footprint visible to drivers for the next one, not just the one that just finished.",
      drag: { to: "cone-spot", radius: 0.5, missNote: "Not back at its spot. The cone marks the post's own space — it goes back where drivers expect to see it." },
    },
    {
      id: "log-shift-notes", kind: "sequence", anyOrder: false,
      targets: ["paddle-stowed", "notes-logged", "radio-checkin"],
      itemNames: { "paddle-stowed": "paddle stowed", "notes-logged": "shift notes logged", "radio-checkin": "checked in on the radio" },
      title: "Stow the paddle, log notes, check in",
      cue: "Stow the paddle, log today's shift notes, then check in with dispatch on the radio, in that order.",
      why: "The paddle is put away first because the post is done the moment the last crossing finishes; the notes get logged while the shift is still fresh, so the next guard on this corner — or a sub covering it — starts from what actually happened today rather than nothing at all.",
      outOfOrderNote: "Paddle away first, then the notes, then the radio check-in — the post itself closes before the paperwork does.",
    },
  ],

  interrupts: [
    {
      id: "cyclist-blind-corner",
      kind: "Cyclist comes around the corner fast",
      after: "hold-crossing", delay: 2, seconds: 10,
      alert: "A cyclist has come around the blind corner behind you at speed, not slowing down for the raised paddle.",
      cue: "Blow the whistle — get their attention before they reach the crossing.",
      target: "whistle",
      why: "A cyclist moving fast enough to be surprised by a raised paddle needs a sound loud enough to cut through their own momentum before they reach the students still in the crosswalk — the whistle reaches further and faster than a shout, and it's used the moment the cyclist is noticed, not after they've already closed the distance.",
      missNote: "The cyclist reached the crosswalk without ever being warned — a raised paddle alone doesn't stop a rider who was never looking at it.",
      wrongNote: "The whistle — that reaches a fast-moving cyclist before a shout would.",
    },
    {
      id: "rolling-stop-car",
      kind: "Car starts rolling through from behind",
      after: "scan-both-directions", delay: 2, seconds: 10,
      alert: "A car has started rolling forward through the crosswalk from behind you, with students still out in the lane.",
      cue: "Plant the paddle firmly toward the car — don't just hold position.",
      target: "stop-paddle",
      why: "A driver already rolling forward needs a more assertive signal than the paddle simply being up — planting it squarely toward the moving car is the guard's clearest, fastest way to reinforce the stop before the gap between the car and the students still crossing closes any further.",
      missNote: "The car kept rolling through the crosswalk with students still in the lane — a paddle that's merely up doesn't answer a driver who has already started moving through it.",
      wrongNote: "The paddle — plant it toward the car that's rolling through, right now.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, XG_ACCENT);

    // ------------------------------------------------------------- street and sidewalk
    const roadway = box(g, 8.0, 0.06, 6.0, 0, 0.03, -1.0, 0xffffff, { rough: 0.85 });
    roadway.material = texturedMat(surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#33363a", base2: "#2d3033" }), { repeat: 5, px: 448 }), { rough: 0.85, color: 0xa4a8ac });
    const crossRoadway = box(g, 5.6, 0.061, 4.0, -1.0, 0.031, -1.0, 0xffffff, { rough: 0.85 });
    crossRoadway.material = texturedMat(surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#34373b", base2: "#2e3134" }), { repeat: 4, px: 448 }), { rough: 0.85, color: 0xa4a8ac });
    const sidewalk = box(g, 3.4, 0.09, 3.0, 2.6, 0.045, 2.2, 0xffffff, { rough: 0.8 });
    sidewalk.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom" })), { repeat: 3, px: 384, color: 0xc7c8c0 });

    // Faded crosswalk paint stripes.
    const crosswalkGroup = group(g, 0.5, 0, 1.0);
    for (let i = 0; i < 5; i++) {
      const stripe = box(crosswalkGroup, 0.4, 0.005, 2.4, -1.0 + i * 0.5, 0.062, 0, 0xdcdfd8, { rough: 0.7, opacity: 0.5, transparent: true, cast: false });
      if (i === 2) reg(hits, stripe, "faded-crosswalk-paint");
    }

    // Post board and equipment cart.
    const postBoard = holoPanel(g, 0.6, 0.38, 2.9, 1.4, 1.3, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = XG_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#faf2df"; cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("POST 4 — MAPLE & 3RD", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#e8ddc0";
      ["Early dismissal today, 1:15", "Whistle on the cart"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.55 + i * 0.2)));
    }, { ry: -0.6, accent: XG_ACCENT });
    reg(hits, postBoard, "post-board");
    const signalPost = group(g, 3.2, 0, -0.2);
    cyl(signalPost, 0.03, 0.03, 1.8, 0, 0.9, 0, CITY.steel, { rough: 0.4, metal: 0.6, seg: 10 });
    const pedestrianSignal = box(signalPost, 0.14, 0.18, 0.05, 0, 1.7, 0, 0xf2c14b, { rough: 0.4, emissive: 0xf2c14b, ei: 0.6 });
    holoTag(signalPost, "pedestrian signal", 0, 1.95, 0, { css: XG_CSS, w: 0.34 });
    reg(hits, pedestrianSignal, "pedestrian-signal");

    const cart = group(g, 2.6, 0, 1.6);
    box(cart, 0.5, 0.6, 0.35, 0, 0.3, 0, 0xd8dde2, { rough: 0.5, metal: 0.3 });
    for (const wx of [-0.2, 0.2]) cyl(cart, 0.07, 0.07, 0.05, wx, 0.07, -0.15, 0x1a1d20, { rough: 0.8, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(cart, "equipment cart", 0, 0.7, 0, { css: XG_CSS, w: 0.3 });
    const whistleObj = group(cart, 0.15, 0.55, 0);
    ball(whistleObj, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.6 });
    holoTag(whistleObj, "whistle", 0, 0.14, 0, { css: XG_CSS, w: 0.2 });
    reg(hits, whistleObj, "whistle");
    const cartInRoad = group(g, 1.3, 0, -1.4);
    box(cartInRoad, 0.5, 0.6, 0.35, 0, 0.3, 0, 0xd8dde2, { rough: 0.5, metal: 0.3, opacity: 0.55, transparent: true });
    holoTag(cartInRoad, "cart left in the bike lane?", 0, 0.7, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, cartInRoad, "cart-in-the-roadway");
    const phone = box(cart, 0.05, 0.01, 0.1, -0.15, 0.61, 0, 0x1c1c1c, { rough: 0.3, emissive: 0x3f7a9e, ei: 0.6 });
    holoTag(cart, "phone lit up?", -0.15, 0.75, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, phone, "distracted-by-phone");

    // Downed sign and the delivery truck blocking the sightline.
    const downedSign = group(g, 3.5, 0, -0.6, 1.4);
    box(downedSign, 0.03, 1.1, 0.03, 0, 0.02, 0, CITY.steel, { rough: 0.4, metal: 0.6 });
    decal(downedSign, 0.3, 0.3, 0, 0.5, 0.02, paperFace("SCHOOL", ["XING"], { bg: "#f2c14b" }));
    holoTag(downedSign, "sign knocked flat", 0, 0.9, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, downedSign, "knocked-over-sign");
    const deliveryTruck = sedan(g, -3.4, 0, -2.2, { ry: Math.PI / 2, livery: { colour: 0xd8dde2, fleetName: "DELIVERY", unitNumber: "22" } });
    holoTag(deliveryTruck, "blocking the sightline", 0, 2.1, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, deliveryTruck, "parked-delivery-truck");

    // The guard's own working position, the paddle and the whistle-answer for the fast car.
    const guardPos = group(g, 0.5, 0, 0.0);
    const paddleGroup = group(guardPos, 0, 0, 0, 0);
    cyl(paddleGroup, 0.012, 0.012, 0.9, 0, 0.45, 0, 0x1a1d20, { rough: 0.5, seg: 10 });
    const paddleFace = box(paddleGroup, 0.32, 0.32, 0.01, 0, 0.95, 0, 0xd2312b, { rough: 0.5 });
    decal(paddleGroup, 0.24, 0.1, 0, 0.95, 0.006, paperFace("STOP", [], { bg: "#d2312b", fg: "#ffffff" }));
    void paddleFace;
    holoTag(paddleGroup, "stop paddle", 0, 1.3, 0, { css: XG_CSS, w: 0.3 });
    reg(hits, paddleGroup, "stop-paddle");
    const crossingSpot = torus(g, 0.3, 0.014, 0.5, 0.062, 0.0, XG_ACCENT, { emissive: XG_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    crossingSpot.rotation.x = Math.PI / 2;
    reg(hits, crossingSpot, "crossing-position");
    const stepOffMarker = box(g, 0.3, 0.05, 0.3, 0.5, 0.03, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step off without checking?", 0.5, 0.4, 0.9, { css: "#f0645b", w: 0.56 });
    reg(hits, stepOffMarker, "step-off-without-checking");

    const gapGauge = instrument(g, 1.0, 1.1, 1.3, { idle: "GAP", color: XG_ACCENT, w: 0.13, d: 0.18, ry: -0.4 });
    holoTag(gapGauge, "traffic gap", 0, 0.2, 0, { css: XG_CSS, w: 0.3 });
    reg(hits, gapGauge, "traffic-gap");
    const scanCycleObj = ball(g, 0.06, 0.5, 1.5, 0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, scanCycleObj, "scan-cycle");
    const handSignal = ball(g, 0.05, 1.1, 1.1, 0.0, 0xf2c14b, { rough: 0.5, opacity: 0.6, transparent: true });
    holoTag(g, "clear signal", 1.1, 1.3, 0.0, { css: XG_CSS, w: 0.26 });
    reg(hits, handSignal, "hand-signal");
    const paddleDownEarly = box(g, 0.1, 0.1, 0.1, 0.3, 0.4, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lower the paddle early?", 0.3, 0.6, -0.2, { css: "#f0645b", w: 0.44 });
    reg(hits, paddleDownEarly, "paddle-down-early");

    // Fallen cone and its correct spot.
    const fallenCone = cone(g, 1.8, 2.0);
    fallenCone.rotation.z = Math.PI / 2;
    holoTag(fallenCone, "fallen cone", 0, 0.4, 0, { css: XG_CSS, w: 0.28 });
    reg(hits, fallenCone, "fallen-cone");
    const coneSpot = torus(g, 0.18, 0.012, 2.0, 0.06, 0.6, XG_ACCENT, { emissive: XG_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    coneSpot.rotation.x = Math.PI / 2;
    reg(hits, coneSpot, "cone-spot");

    // Shift wrap-up markers.
    const paddleStowSpot = box(g, 0.1, 0.1, 0.1, 2.7, 0.4, 1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, paddleStowSpot, "paddle-stowed");
    const notesLog = holoPanel(g, 0.42, 0.28, 3.1, 1.2, 2.2, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = XG_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#faf2df"; cx.font = `600 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("SHIFT NOTES", w / 2, h * 0.4);
    }, { ry: -0.6, accent: XG_ACCENT });
    reg(hits, notesLog, "notes-logged");
    const radioCart = instrument(cart, 0, 0.7, 0.12, { idle: "CH 2 · CORNER", color: XG_ACCENT, w: 0.1, d: 0.14 });
    holoTag(radioCart, "dispatch radio", 0, 0.16, 0, { css: XG_CSS, w: 0.28 });
    reg(hits, radioCart, "radio-checkin");

    // The step-setup markers: vest, paddle grab, position.
    const vestHook = box(g, 0.12, 0.16, 0.02, 2.5, 1.1, 1.2, 0xd8f23a, { rough: 0.6 });
    holoTag(g, "hi-vis vest", 2.5, 1.3, 1.2, { css: XG_CSS, w: 0.24 });
    reg(hits, vestHook, "vest-on");
    const paddleGrabSpot = box(g, 0.1, 0.1, 0.1, 0.4, 0.3, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, paddleGrabSpot, "paddle-grabbed");
    const positionSpot = torus(g, 0.3, 0.01, 0.5, 0.06, 0.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, positionSpot, "position-set");

    // A rolling car for the interrupt, hidden until it fires.
    const rollingCar = sedan(g, 2.0, 0, -0.6, { ry: -Math.PI / 2, livery: { colour: 0x5fb8f0, fleetName: "SMARTCITI FLEET", unitNumber: "9" } });
    rollingCar.visible = false;
    const rollingCarHome = rollingCar.position.clone();

    // A cyclist and a crossing student, hidden until called.
    const cyclist = standingFigure(g, 4.5, -1.6, { ry: 2.6, cloth: 0x2b3138, helmet: 0x59c97b, atStation: true });
    cyclist.visible = false;
    const student = standingFigure(g, 0, -3.4, { ry: 0, cloth: 0x3f7a9e, trousers: 0x2b3138, atStation: true });
    student.scale.set(0.86, 0.86, 0.86);
    student.visible = true;
    student.position.set(-0.3, 0, 1.0);

    // Crew: a second guard trainer observing, clear of every control.
    const trainer = standingFigure(g, -3.0, 2.6, { ry: 1.0, cloth: 0x2b3138, vest: 0xd8f23a, cap: 0x2f6f4a });
    holoTag(trainer, "corner trainer", 0, 1.95, 0, { css: XG_CSS, w: 0.3 });

    return {
      hits,
      footprint: 2.9,

      onStepComplete(step) {
        if (step.id === "post-setup") vestHook.visible = false;
        if (step.id === "sightline-check") { deliveryTruck.visible = false; downedSign.visible = false; }
        if (step.id === "gap-gauge") repaint(gapGauge.userData.screen, signFace("CLEAR", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.55 }));
        if (step.id === "raise-paddle") paddleGroup.rotation.x = 0;
        if (step.id === "signal-clear") handSignal.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
        if (step.id === "lower-paddle") paddleGroup.rotation.x = -1.1;
        if (step.id === "reset-fallen-cone") { fallenCone.rotation.z = 0; fallenCone.position.set(0.6, 0, 0.6); coneSpot.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "cyclist-blind-corner") { cyclist.visible = true; cyclist.position.set(4.5, 0, -1.6); }
        if (it.id === "rolling-stop-car") { rollingCar.visible = true; rollingCar.position.set(2.0, 0, -0.9); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cyclist-blind-corner") cyclist.visible = false;
        if (it.id === "rolling-stop-car") rollingCar.position.copy(rollingCarHome);
      },

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "gap-gauge") {
          repaint(gapGauge.userData.screen, signFace(gg.t > 0.44 && gg.t < 0.62 ? "CLEAR" : "WAIT", {
            bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#f5ecd8", scale: 0.55,
          }));
        }
        if (session?.step?.id === "raise-paddle" && session.turn) paddleGroup.rotation.x = -1.1 * (1 - session.turn.amount);
        const tr = session?.track;
        if (tr && session.step?.id === "scan-both-directions") guardPos.rotation.y = Math.sin(t * 1.5) * 0.35 * (tr.v > 0.15 ? 1 : 0);
        if (rollingCar.visible) rollingCar.position.z += dt * 0.4;
        trainer.userData.head.rotation.y = Math.sin(t * 0.35) * 0.3;
        void dt; void CITY; void student;
      },
    };
  },
};
