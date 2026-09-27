import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, valveWheel, lockTag, reg,
  surfaceTexture, texturedMat, brickFace, corrugatedFace, gratingFace, palette,
} from "../citykit.js";
import { pickup } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Gas Meter Set & Regulator Vent Check VR — Energy & Power,
// UWUA / IBEW gas-utility serviceperson.
//
// Setting a meter is the one job on this main where a customer's house is on
// the other side of every joint a fitter makes. The riser is inspected
// before the meter ever goes on it, because a corroded thread or an
// unsupported riser fails on somebody's own weight, not on pressure. The
// unions are torqued straight, never cross-threaded and forced, and the
// regulator's vent — the one opening on this whole assembly that is
// supposed to be open — is checked for the clearance that keeps whatever it
// vents away from a window, a dryer vent or anything that could light it.
// None of that is proof the set does not leak; only the soap check and the
// electronic sniff, run after the service is live, are that.
// Sited generically: no real address, meter size or pressure is invented.

const UT4_ACCENT = 0xe08a2f;
const UT4_CSS = "#e08a2f";
const UT4_PAL = palette("utility");

export const SIM_UT_GAS_METER_SET_AND_REGULATOR_VENT = {
  id: "ut-gas-meter-set-and-regulator-vent",
  index: "ut-04",
  domain: "Energy",
  trade: "UWUA / IBEW gas-utility serviceperson",
  category: "Energy & Power",
  indoor: "service",
  weather: "overcast",
  certification: "UWUA / IBEW gas-utility serviceperson training; NFPA 54 National Fuel Gas Code for the meter set, the regulator vent clearance and the leak check; 49 CFR Part 192 (PHMSA) for the operator's own meter-set and service-riser procedure; OSHA 29 CFR 1910.147 the control of hazardous energy for isolating the service before the set begins",
  name: "Gas Meter Set & Regulator Vent Check",
  title: simTitle("Gas Meter Set & Regulator Vent Check"),
  tagline: "The riser inspected before the meter ever goes on it, the unions torqued straight rather than forced, the regulator's vent checked for its own clearance, and the set proven with soap and an electronic sniff rather than a dial that simply looks still",
  accent: UT4_ACCENT,
  accentCss: UT4_CSS,
  parSeconds: 290,
  footprint: 2.3,
  badge: { id: "set-and-proven", name: "Set & Proven", note: "A meter set on a proven riser, torqued straight, vented clear of every opening, and leak-checked with soap and an electronic sniff before the crew left the address" },

  game: system({
    name: "Distribution Authority",
    currency: "SCFH",
    ranks: ["Apprentice", "Service Crew", "Gas Serviceperson", "Crew Lead", "Distribution Authority Certified"],
    badges: [
      { id: "riser-proven-first", name: "Riser Proven First", note: "The riser was inspected before the meter went on it", test: AWARD.stepClean("inspect-riser") },
      { id: "never-forced", name: "Never Forced", note: "No union was cross-threaded and no unsafe action was recorded", test: AWARD.safe },
      { id: "vent-clearance-read", name: "Vent Clearance Read", note: "Held the clearance reading steady before it went in the record", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-set", name: "Clean Set", note: "No corrections from the work order to the record", test: AWARD.clean },
      { id: "unbroken-settle", name: "Unbroken Settle Watch", note: "The meter settle watch ran to completion without a break", test: AWARD.unbroken },
      { id: "address-clear-fast", name: "Address Clear Fast", note: "Tagged, logged and gone inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-isolate-check": "You went to start setting the meter without confirming the service valve was closed and tagged. A riser that is still live behind the meter bar turns every union this crew is about to make up into a joint made against gas that is already moving, on a service nobody has proven dead yet.",
    "cross-threaded-union": "You went to force a union nut home instead of backing it out and starting the threads straight. A cross-threaded union can look tight on the wrench and still be sitting on a shaved thread that lets go under service pressure — straight and hand-started every time, or it gets backed out and tried again.",
    "vent-blocked-or-too-close": "You went to leave the regulator's vent terminated right next to a window and a dryer vent instead of relocating it. That vent is the one opening on this whole assembly that is meant to be open, and gas relieved from it has to go somewhere that is not into a building's own air intake or next to anything that could light it.",
    "skip-soap-check": "You went to call this set leak-free because the meter dial looked still, with no soap solution on a single union. A slow leak does not always move a dial fast enough to notice on a quick look, and the soap check is what actually tests the joint instead of trusting a glance at the index.",
  },

  lateNotes: {
    "torque-union-a": "The unions are torqued only once the meter is level and the support bracket is set — not while the meter is still hanging off the threads alone.",
    "service-valve": "The service valve reopens only after the meter is fully set, supported and its unions are torqued — not while the meter bar is still half-assembled.",
  },

  // Two things that happen to a crew whose hands are on a leak detector or
  // watching the meter settle. See shared/game.js.
  interrupts: [
    {
      id: "delivery-truck-backing",
      kind: "A delivery truck backs toward the meter set",
      after: "electronic-sniff", delay: 3, seconds: 11,
      alert: "A delivery truck is backing up, beeping, straight toward the meter set this crew just finished — the driver has no spotter and no reason to know anyone is working there.",
      cue: "Get the wave-off flag out where the driver can see it before that truck reaches the meter.",
      target: "wave-off-flag",
      why: "A truck backing blind has no way to know a meter set — or the crew crouched next to it — is in its path, and a flag out where the mirror can catch it is what gets the driver's attention before the bumper does, which is a faster fix than hoping the beeping alone is enough.",
      missNote: "The truck kept backing toward the meter with nobody signalling the driver. A backing vehicle with no spotter finds out what is behind it by hitting it.",
      wrongNote: "It is the flag, out where the mirror can catch it. The leak detector has nothing to do with a truck that cannot see this crew.",
    },
    {
      id: "odorant-history-call",
      kind: "Dispatch calls about this address's odorant history",
      after: "watch-meter-settle", delay: 3, seconds: 13,
      alert: "Dispatch is calling to relay this address's odorant-complaint history before the crew leaves — there was a prior report here worth knowing about.",
      cue: "Answer the radio and get the history before you close this job out.",
      target: "service-radio",
      why: "An address with a prior odorant complaint is one where the crew closing out today's set benefits from knowing what was reported before — a call answered now is a five-minute read of the file instead of the next crew finding out the history only after another complaint comes in.",
      missNote: "The call went unanswered while the crew wrapped up. Whatever this address's odorant history actually says stayed unread going into the close-out.",
      wrongNote: "It is dispatch, on the radio. The meter settle watch has already told this crew what it is going to tell them.",
    },
  ],

  supportLine: "your utility's employee assistance programme, or your UWUA or IBEW steward if you are not sure how to reach it",

  steps: [
    {
      id: "work-order", kind: "select", target: "work-order",
      title: "Read the meter-set work order",
      cue: "Check the work order: the address, the meter size, and the regulator type called for.",
      why: "A meter sized or a regulator specified wrong at the desk is wrong before this crew ever opens the truck, and reading the order against what is actually on the riser is the first chance to catch a mismatch before it is halfway assembled.",
    },
    {
      id: "isolate-service", kind: "sequence",
      targets: ["close-service-valve", "tag-service-valve"],
      itemNames: { "close-service-valve": "service valve closed", "tag-service-valve": "service valve tagged" },
      title: "Isolate and tag the service",
      cue: "Close the service valve, then tag it, before the old meter comes off or the new one goes on.",
      why: "The tag is what stops this valve being reopened by anyone who does not know a meter set is mid-assembly on the other side of it — the one connection on this address that can put service pressure behind every union this crew is about to make.",
      outOfOrderNote: "Close it, then tag it — a closed valve with no tag can be reopened by someone with no idea work is happening downstream.",
    },
    {
      id: "inspect-riser", kind: "find", noHint: true,
      targets: ["corroded-riser-thread", "unsupported-riser"],
      itemNames: { "corroded-riser-thread": "corroded threads on the riser", "unsupported-riser": "an unsupported length of riser" },
      itemNotes: {
        "corroded-riser-thread": "These threads are corroded enough that a union made up on them is sealing against pitted metal, not a sound thread — this gets addressed before the meter goes anywhere near it.",
        "unsupported-riser": "This riser is unsupported over more distance than it should be, carrying the whole weight of the meter bar on threads that were never meant to be a bracket.",
      },
      title: "Inspect the riser before setting the meter",
      cue: "Walk the riser and find what has to be fixed before the meter goes on.",
      why: "The riser is what everything else in this job hangs off, and a corroded thread or an unsupported length both fail on their own weight over time — caught now, before the meter is riding on either problem, it is a five-minute fix instead of a return call.",
    },
    {
      id: "set-meter", kind: "drag", target: "meter-body",
      title: "Bring the meter to the bar",
      cue: "Carry the meter to the meter bar and seat it on the riser connections.",
      why: "The meter is carried in and seated square on both riser connections at once — set at an angle even briefly, it stresses the same threads this crew just finished proving sound.",
      drag: { to: "meter-bar-socket", radius: 0.45, missNote: "Not seated square on the bar — a meter set at an angle loads the riser threads unevenly the moment it takes any weight." },
    },
    {
      id: "align-and-support", kind: "sequence",
      targets: ["level-meter", "set-support-bracket", "hand-tight-unions"],
      itemNames: { "level-meter": "meter levelled", "set-support-bracket": "support bracket set", "hand-tight-unions": "unions started hand-tight" },
      title: "Level, support, then hand-tighten",
      cue: "Level the meter, set the support bracket, then start both unions hand-tight.",
      why: "The bracket is what actually carries the meter's weight once it is set — level it, support it, and only then thread the unions, because a union hand-started before the meter is supported is a union taking weight it was never designed to carry.",
      outOfOrderNote: "Level, then the bracket, then the unions hand-tight — unions threaded before the bracket is set are threaded onto a meter that is still moving.",
    },
    {
      id: "torque-unions", kind: "turn", target: "torque-union-a",
      title: "Torque the unions straight",
      cue: "Turn the wrench to bring both unions to their final torque, straight and even.",
      why: "Straight and to torque is what a union needs to seal — backed out and restarted the moment it binds early, rather than forced through a cross-thread that will hold a wrench's worth of turning and nothing else once it is under service pressure.",
      turn: { turns: 0.6, axis: "y", label: "UNION TORQUE" },
    },
    {
      id: "odorant-check", kind: "select", target: "odorant-record",
      title: "Confirm the odorant is perceptible",
      cue: "Check the odorant record and the sniff test before the service goes live.",
      why: "Odorant is what turns an invisible leak into something a customer can actually notice, and confirming it is perceptible at this address — not just present somewhere upstream in the system — is the check that makes every future leak here findable by smell before it is found any other way.",
    },
    {
      id: "open-service-valve", kind: "turn", target: "service-valve",
      title: "Reopen the service valve",
      cue: "Wind the service valve open now the meter is fully set, supported and torqued.",
      why: "This valve reopens only once the meter is finished, not partway through — reopened early, it puts service pressure behind unions that have not yet been proven at their final torque.",
      turn: { turns: 0.75, axis: "y", label: "SERVICE VALVE" },
    },
    {
      id: "soap-check-joints", kind: "find",
      targets: ["bubbling-union", "bubbling-meter-bar"],
      itemNames: { "bubbling-union": "the union bubbling under soap solution", "bubbling-meter-bar": "the meter bar joint weeping under soap solution" },
      itemNotes: {
        "bubbling-union": "This union is steadily bubbling where the soap solution was brushed on — small enough the dial may not show it yet, but a leak all the same.",
        "bubbling-meter-bar": "This meter bar joint is weeping under the soap solution at the threads — it needs to be broken down and remade, not just snugged further.",
      },
      title: "Soap-check every joint under live pressure",
      cue: "Brush soap solution on every joint now the service is live and look for bubbles.",
      why: "The dial only ever shows flow, and a joint bubbling under soap is the only way to know which specific connection is the reason a slow leak might be moving gas nobody is using — this is what turns 'the dial looks still' into 'every joint on this set actually holds.'",
    },
    {
      id: "vent-clearance", kind: "gauge", target: "vent-clearance-gauge",
      title: "Measure the regulator vent's clearance",
      cue: "Bring the clearance reading up to where the vent actually sits from the nearest opening, then commit.",
      why: "The vent is the one opening on this whole assembly that is meant to stay open, and its distance from a window, a dryer vent or anything that could light it is what decides whether whatever it relieves ever has a chance to reach either one — measured, not eyeballed, because a vent that looks far enough away from across the yard is not always far enough up close.",
      gauge: { label: "VENT CLEARANCE", speed: 0.65, green: [0.5, 0.75], readout: (t) => `${(t * 6).toFixed(1)} ft`, missNote: "That clearance is short of what this vent needs from the nearest opening — the regulator has to move before this set is finished, not the window." },
    },
    {
      id: "watch-meter-settle", kind: "track", target: "meter-dial", seconds: 7,
      title: "Watch the meter settle",
      cue: "Watch the dial settle to a steady still reading for the full watch, not just a glance.",
      why: "A dial that looks still on a glance and a dial that is actually still are not the same thing — held for a full watch, any drift the soap check did not catch shows itself as flow with nothing on this address calling for it.",
      track: { start: 0.5, green: [0.4, 0.6], rise: 0.05, fall: 0.3, drift: 0.1, label: "METER INDEX", readout: (v) => (v > 0.6 ? "still creeping — flow with nothing calling for it" : "settled") },
      holdBreakNote: "That reading kept creeping through the watch — something on this set is still passing gas nobody is using, and it has to be found before this job is called finished.",
    },
    {
      id: "electronic-sniff", kind: "hold", target: "leak-detector", seconds: 5,
      title: "Sweep the set with the electronic detector",
      cue: "Hold the electronic detector at every connection for the full dwell time.",
      why: "The electronic detector catches what soap and a settle watch both can miss at the smallest scale — held at each connection for its full dwell rather than waved past quickly, it is the last and most sensitive check this set gets before the crew calls it finished.",
      holdBreakNote: "The detector came off before its dwell finished at that connection — hold it again, a rushed sweep is a sweep that can miss the smallest leak on this set.",
    },
    {
      id: "tag-and-label", kind: "select", target: "meter-tag",
      title: "Tag the meter",
      cue: "Tag the meter with the set date and this crew's ID, and confirm the address label matches.",
      why: "The tag and the address label are what the next person who reads this meter — a survey crew, a billing tech, an emergency responder — trusts without having to trace the paperwork first, and a mismatch caught here is a mismatch that never has to be discovered by someone standing at the wrong address.",
    },
    {
      id: "asset-record", kind: "select", target: "asset-record",
      title: "Update the asset record",
      cue: "Log the meter serial number, the index reading, and the vent clearance measured.",
      why: "This record is what makes the meter this crew just set findable and provable years from now — a serial number, a starting index and a documented vent clearance are what turn 'a meter was set here' into a record the utility can actually stand behind.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, UT4_ACCENT);

    // ---------------------------------------------------------------- ground
    const groundTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#7a7568"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      for (let i = 0; i < 6; i++) { ctx.strokeStyle = "rgba(0,0,0,0.06)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, (i / 6) * h); ctx.lineTo(w, (i / 6) * h); ctx.stroke(); }
    }, { repeat: 3, px: 320 });
    const groundPlane = box(g, 5.0, 0.06, 4.2, 0, 0.03, 0, 0xffffff, { rough: 0.9 });
    groundPlane.material = texturedMat(groundTex, { rough: 0.9, metal: 0.02, color: UT4_PAL.ground });

    // The house wall the meter mounts to.
    const wallTex = surfaceTexture((ctx, w, h) => brickFace(ctx, w, h, { rows: 10, cols: 14 }), { repeat: 1, px: 384 });
    const wall = box(g, 4.6, 2.6, 0.16, 0, 1.32, -1.9, 0xffffff, { rough: 0.85 });
    wall.material = texturedMat(wallTex, { rough: 0.85, color: UT4_PAL.structure });
    const foundationTex = surfaceTexture((ctx, w, h) => gratingFace(ctx, w, h, { base: "#4a4f53", base2: "#3c4145" }), { repeat: 2, px: 220 });
    const foundation = box(g, 4.6, 0.5, 0.2, 0, 0.25, -1.86, 0xffffff, { rough: 0.9 });
    foundation.material = texturedMat(foundationTex, { rough: 0.9, metal: 0.2 });

    // Riser coming up from the ground to the meter bar.
    const riser = group(g, 0.4, 0, -1.75);
    const riserPipe = cyl(riser, 0.03, 0.03, 0.8, 0, 0.4, 0, CITY.steel, { rough: 0.5, metal: 0.5, seg: 12 });
    holoTag(riser, "service riser", 0, 0.86, 0, { css: UT4_CSS, w: 0.3 });
    reg(hits, riserPipe, "unsupported-riser");
    const corrodedPatch = cyl(riser, 0.034, 0.034, 0.1, 0, 0.2, 0, 0x8a3020, { rough: 0.85, metal: 0.4, seg: 10 });
    reg(hits, corrodedPatch, "corroded-riser-thread");
    const meterBarSocket = group(riser, 0, 0.78, 0.05);
    hits["meter-bar-socket"] = meterBarSocket;

    const serviceValve = valveWheel(riser, -0.16, 0.5, 0, { color: 0xd8232a, body: 0x2b2f34, r: 0.06 });
    holoTag(riser, "service valve", -0.16, 0.68, 0, { css: UT4_CSS, w: 0.3 });
    reg(hits, serviceValve.userData.wheel, "service-valve");
    const valveTagObj = lockTag(riser, -0.28, 0.5, 0.06, { color: 0xf2c14b, lines: ["METER", "OFF"] });
    reg(hits, valveTagObj, "tag-service-valve");
    hits["close-service-valve"] = serviceValve.userData.wheel;

    // The meter itself, staged on the truck bed until it is carried in.
    const truck = pickup(g, 2.6, 0, 1.6, { ry: -0.6, livery: { colour: 0x2f5f9e, fleetName: "GAS SERVICE" } });
    void truck;
    const meterBody = group(g, 2.15, 0, 1.15, 0.5);
    box(meterBody, 0.34, 0.4, 0.22, 0, 0.5, 0, 0xdfe6ec, { rough: 0.5, metal: 0.4 });
    decal(meterBody, 0.24, 0.14, 0, 0.58, 0.111, signFace("METER", { bg: "#1b2129", accent: UT4_CSS, scale: 0.5 }), { px: 160 });
    holoTag(meterBody, "gas meter", 0, 0.78, 0, { css: UT4_CSS, w: 0.28 });
    reg(hits, meterBody, "meter-body");
    const meterDialInst = instrument(meterBody, 0, 0.34, 0.12, { idle: "----", color: 0x2b2f34, w: 0.13, d: 0.02 });
    reg(hits, meterDialInst, "meter-dial");

    // Support bracket, unions, regulator with a vent, backed onto the wall.
    const bracket = box(riser, 0, 0.4, 0.1, 0.2, 0, 0, CITY.darkSteel, { rough: 0.6, metal: 0.5 });
    reg(hits, bracket, "set-support-bracket");
    const levelBubble = ball(riser, 0.02, 0, 0.95, 0.08, 0x59c97b, { rough: 0.3, emissive: 0x59c97b, ei: 0.6 });
    reg(hits, levelBubble, "level-meter");
    const unionA = torus(riser, 0.045, 0.014, -0.09, 0.78, 0, 0x8a939b, { rough: 0.4, metal: 0.8, seg: 8, seg2: 14 });
    unionA.rotation.x = Math.PI / 2;
    reg(hits, unionA, "hand-tight-unions");
    const torqueUnionA = torus(riser, 0.045, 0.014, -0.09, 0.78, 0.04, 0x8a939b, { rough: 0.4, metal: 0.8, seg: 8, seg2: 14 });
    torqueUnionA.rotation.x = Math.PI / 2;
    reg(hits, torqueUnionA, "torque-union-a");
    const bubblingUnion = ball(riser, 0.02, -0.09, 0.78, 0.1, 0xbfe6f5, { rough: 0.2, opacity: 0.7, transparent: true });
    reg(hits, bubblingUnion, "bubbling-union");
    const bubblingBar = ball(riser, 0.02, 0.12, 0.78, 0.06, 0xbfe6f5, { rough: 0.2, opacity: 0.7, transparent: true });
    reg(hits, bubblingBar, "bubbling-meter-bar");

    const regulator = group(g, 0.4, 1.3, -1.75, 0.3);
    cyl(regulator, 0.08, 0.08, 0.18, 0, 0, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 16 });
    holoTag(regulator, "regulator", 0, 0.2, 0, { css: UT4_CSS, w: 0.3 });
    const ventTube = cyl(regulator, 0.02, 0.02, 0.14, 0, -0.13, 0.03, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10 });
    void ventTube;
    const nearbyWindow = box(g, 0.5, 0.6, 0.03, -0.9, 1.5, -1.92, 0xbfe6f5, { rough: 0.3, opacity: 0.7, transparent: true, cast: false });
    holoTag(g, "window", -0.9, 1.85, -1.92, { css: "#8fa9c4", w: 0.24 });
    const ventGaugePost = group(g, 0.9, 0, -1.4, -0.3);
    box(ventGaugePost, 0.03, 0.5, 0.03, 0, 0.25, 0, CITY.darkSteel, { rough: 0.6, metal: 0.4 });
    const ventGauge = instrument(ventGaugePost, 0, 0.56, 0, { idle: "-- ft", color: 0x2b2f34, w: 0.14, d: 0.12 });
    holoTag(ventGaugePost, "vent clearance gauge", 0, 0.76, 0, { css: UT4_CSS, w: 0.4 });
    reg(hits, ventGauge, "vent-clearance-gauge");
    void nearbyWindow;
    const ventTooClose = box(g, 0.2, 0.2, 0.2, 0.1, 1.4, -1.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "leave the vent right here?", 0.15, 1.65, -1.55, { css: "#d2312b", w: 0.46 });
    reg(hits, ventTooClose, "vent-blocked-or-too-close");

    // Boards, tools, and hazard decoys.
    const orderBoard = group(g, -2.0, 0, -1.6, 0.4);
    box(orderBoard, 0.5, 0.7, 0.04, 0, 0.35, 0, UT4_PAL.structure, { rough: 0.7 });
    const orderPanel = decal(orderBoard, 0.44, 0.32, 0, 0.68, 0.03, paperFace("METER-SET WORK ORDER", ["Address per order", "Meter size / regulator type", "Service pressure per book"], { scale: 0.74 }));
    holoTag(orderBoard, "work order", 0, 0.9, 0, { css: UT4_CSS, w: 0.32 });
    reg(hits, orderPanel, "work-order");

    const odorantBoard = group(g, -2.2, 0, -0.4, 0.3);
    box(odorantBoard, 0.4, 0.32, 0.03, 0, 0.6, 0, 0x2b3138, { rough: 0.6 });
    decal(odorantBoard, 0.34, 0.12, 0, 0.66, 0.02, signFace("ODORANT LOG", { bg: "#0a1e28", accent: UT4_CSS, scale: 0.4 }));
    holoTag(odorantBoard, "odorant record", 0, 0.82, 0, { css: UT4_CSS, w: 0.34 });
    reg(hits, odorantBoard, "odorant-record");

    const detector = group(g, -1.6, 0, 0.9, 0.5);
    box(detector, 0.1, 0.18, 0.05, 0, 0.5, 0, 0x2b3138, { rough: 0.5 });
    holoTag(detector, "electronic detector", 0, 0.68, 0, { css: "#59c97b", w: 0.36 });
    reg(hits, detector, "leak-detector");

    const flagStand = group(g, 2.6, 0, -0.2, 0.4);
    cyl(flagStand, 0.02, 0.02, 0.5, 0, 0.25, 0, 0x5b4636, { rough: 0.8, seg: 8 });
    box(flagStand, 0.14, 0.1, 0.005, 0.08, 0.46, 0, 0xf2ae14, { rough: 0.6, cast: false });
    holoTag(flagStand, "wave-off flag", 0, 0.62, 0, { css: "#f2ae14", w: 0.34 });
    reg(hits, flagStand, "wave-off-flag");

    const radioProp = box(g, 0.09, 0.16, 0.05, -2.0, 0.9, 0.7, 0x1b1e23, { rough: 0.5 });
    holoTag(g, "service radio", -2.0, 1.14, 0.7, { css: UT4_CSS, w: 0.3 });
    reg(hits, radioProp, "service-radio");

    const meterTagObj = lockTag(g, 1.9, 0.85, 0.9, { color: UT4_ACCENT, lines: ["METER", "SET " + "✓"] });
    reg(hits, meterTagObj, "meter-tag");

    const logBench = group(g, -2.3, 0, 1.6);
    box(logBench, 0.9, 0.72, 0.5, 0, 0.36, 0, UT4_PAL.structure, { rough: 0.7, metal: 0.2 });
    const logPanel = decal(logBench, 0.3, 0.36, 0, 0.73, 0, paperFace("ASSET RECORD", ["Serial ___", "Index ___", "Vent clearance ___ ft"], { scale: 0.78 }));
    logPanel.rotation.x = -Math.PI / 2;
    holoTag(logBench, "asset record", 0, 0.94, 0, { css: UT4_CSS, w: 0.32 });
    reg(hits, logPanel, "asset-record");

    const skipIsolate = box(g, 0.2, 0.2, 0.2, 0.9, 0.5, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "start setting it now?", 0.95, 0.75, -1.2, { css: "#d2312b", w: 0.42 });
    reg(hits, skipIsolate, "skip-isolate-check");
    const crossThread = box(riser, 0.15, 0.15, 0.15, -0.3, 0.78, 0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(riser, "just force it home?", -0.3, 0.95, 0.15, { css: "#d2312b", w: 0.4 });
    reg(hits, crossThread, "cross-threaded-union");
    const skipSoap = box(g, 0.2, 0.2, 0.2, 1.6, 0.9, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "dial looks still, call it done?", 1.65, 1.15, 0.3, { css: "#d2312b", w: 0.56 });
    reg(hits, skipSoap, "skip-soap-check");

    toolChest(g, 2.5, -1.6);
    const tech = standingFigure(g, 1.5, -0.9, { ry: 2.3, cloth: 0x2b6f8f, vest: 0xf2c14b });
    void tech;

    holoPanel(g, 0.95, 0.6, -2.2, 0, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "#231603"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = UT4_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fdf0d4"; ctx.fillText("METER SET — RISER TO RECORD", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fffaf0";
      ["Prove the riser before the meter goes on", "Torque unions straight, never forced", "Check the vent's own clearance", "Soap and sniff before you call it done"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.15)));
    }, { ry: 0.5, accent: UT4_ACCENT });

    let settling = false, sniffing = false, truckClosing = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 1.1, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect-riser") { corrodedPatch.visible = false; }
        if (step.id === "set-meter") { meterBody.position.set(0.4, 0.78, -1.7); meterBody.rotation.y = 0; }
        if (step.id === "torque-unions") { unionA.material = mat(0x6f7a83, { rough: 0.35, metal: 0.9 }); torqueUnionA.material = mat(0x6f7a83, { rough: 0.35, metal: 0.9 }); }
        if (step.id === "soap-check-joints") { bubblingUnion.visible = false; bubblingBar.visible = false; }
        if (step.id === "vent-clearance") repaint(ventGauge.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "watch-meter-settle") { settling = false; repaint(meterDialInst.userData.screen, signFace("0000", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.4 })); }
        if (step.id === "electronic-sniff") sniffing = false;
      },
      onInterrupt(it) {
        if (it.id === "delivery-truck-backing") { truckClosing = true; truck.position.set(1.6, 0, 1.6); }
        if (it.id === "odorant-history-call") radioProp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "delivery-truck-backing") { truckClosing = false; truck.position.set(2.6, 0, 1.6); }
        if (it.id === "odorant-history-call") radioProp.material = mat(0x1b1e23, { rough: 0.5 });
      },
      onHazard() {},
      animate(t, dt, session) {
        if (session?.step?.id === "watch-meter-settle") settling = true;
        if (session?.step?.id === "electronic-sniff") sniffing = true;
        if (settling) repaint(meterDialInst.userData.screen, signFace(`${(1234 + Math.sin(t * 2) * 3).toFixed(0)}`, { bg: "#0d1c24", accent: "#f2ae14", fg: "#bfeaf7", scale: 0.4 }));
        if (session?.turn && (session.step?.id === "torque-unions" || session.step?.id === "open-service-valve")) {
          const wheel = session.step?.id === "open-service-valve" ? serviceValve.userData.wheel : torqueUnionA;
          wheel.rotation.y = session.turn.amount * Math.PI * 2;
        }
        if (truckClosing) truck.position.x = Math.max(0.3, truck.position.x - dt * 0.3);
        void sniffing;
      },
    };
  },
};
