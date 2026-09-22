import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Discharge Photo Doc VR — Hunters Point Edition, Community
// Environmental Justice.
//
// A community pollution patrol documents a discharge coming out of a storm
// drain into a generic shoreline creek — never a named outfall, never a real
// facility. The patrol works entirely from the public bank: a pole sampler
// reaches the flow so nobody's boots ever do, a scale card makes the photo
// evidence rather than a snapshot, and the call to the Regional Water Board
// and the city's hotline is what turns what the patrol saw into something an
// inspector can act on.

const DPD_ACCENT = 0xd2745b;

export const SIM_DISCHARGE_PHOTO_DOC = {
  id: "discharge-photo-doc",
  index: "162",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "CWA (Clean Water Act) NPDES illicit-discharge reporting to the Regional Water Quality Control Board (RWQCB); the city's pollution-reporting hotline; EPA QA/QC and chain-of-custody guidance (EPA QA/G-5) for any grab sample relied on in public; OSHA 29 CFR 1910.132 general PPE for the patrol's own gear; the Community Pollution Patrol Network's discharge documentation protocol",
  name: "Discharge Photo Doc",
  title: simTitle("Discharge Photo Doc"),
  tagline: "Documenting a discharge from a storm drain: sheen, colour and flow noted, a grab taken from the bank in the right preserved bottle, GPS and time logged, a photo taken with a scale in frame, the Regional Water Board and the city hotline both notified — and the patrol never once in the water",
  accent: DPD_ACCENT,
  accentCss: "#d2745b",
  parSeconds: 270,
  footprint: 2.4,
  badge: { id: "record-that-holds", name: "Record That Holds", note: "A dry-boots documentation an inspector can act on — the right bottle, a scaled photo, both hotlines called" },

  game: system({
    name: "Patrol Record",
    currency: "REPORT",
    ranks: ["Patrol Member", "Documentation Lead", "Patrol Coordinator", "Complaint Steward", "Patrol Record Certified"],
    badges: [
      { id: "dry-boots", name: "Dry Boots", note: "Never a hazard — the water, the bottle, the photo or the sample stayed clean", test: AWARD.safe },
      { id: "both-called", name: "Both Called", note: "Water Board and city hotline both notified, first time", test: AWARD.stepClean("notify") },
      { id: "reading-true", name: "Reading True", note: "The flow estimate read inside spec", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-record", name: "Clean Record", note: "No corrections across the whole documentation", test: AWARD.clean },
      { id: "steady-grab", name: "Steady Grab", note: "Held the pole sampler through the full grab", test: AWARD.unbroken },
      { id: "logged-fast", name: "Logged Fast", note: "Sample, photo and both calls done inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "step-in-water": "You stepped down into the discharge to reach the sample point directly. The pole sampler exists so a patrol member's boots never have to touch water nobody has tested yet — whatever this discharge turns out to carry, wading into it to save an arm's length of reach is not part of the protocol that keeps a patrol member safe.",
    "wrong-bottle": "You grabbed the plain jar instead of the amber preserved bottle. A discharge sample without the right preservative starts changing chemically before it ever reaches anyone who can test it — the amber bottle and its preservative are what make this grab still mean something by the time a regulator looks at it.",
    "skip-scale": "You snapped the photo without ever setting the scale card in frame. A sheen with nothing beside it to measure against is a photo an inspector cannot use to judge size or extent — the scale card is what turns a picture into evidence instead of an impression.",
    "hand-to-worker": "You started to hand the sample cooler to the site worker who offered to \"take it inside\" for you. The sample is the patrol's own record of what left this drain on this day — once it is out of the patrol's hands, there is no way to prove later that it was not swapped, diluted or simply never delivered anywhere at all.",
  },

  lateNotes: {
    "sample-bottle": "Nothing to grab yet — the flow has to be estimated first, or the sample is taken before anyone has recorded how much of it there actually was.",
  },

  // Both interruptions land while the patrol member's hands are full: one
  // holding the pole sampler out over the flow, one holding the camera
  // steady on the scale shot — exactly when a step back or a firm no is
  // easy to skip in favour of finishing what's already started.
  interrupts: [
    {
      id: "sheen-reaches-shore",
      kind: "Sheen reaches the shore",
      after: "grab-sample", delay: 3, seconds: 12,
      alert: "The sheen on the water has spread faster than the flow looked like it would, and it is now lapping right up to the mud where you are standing.",
      cue: "Step back to the retreat line — the sheen has reached the bank.",
      target: "retreat-line",
      why: "Whatever is in that sheen has not been identified yet, and a patrol member standing in a discharge that has just reached their own boots is not documenting the release any more — they are exposed to it. Stepping back to the marked line is the one response that keeps the patrol able to finish this report at all.",
      missNote: "The grab finished with the sheen already washing against the patrol member's boots the whole time — nobody knows yet what was in it, and now nobody knows what it touched.",
      wrongNote: "That's not it — the retreat line is the marked ground back from the water, and that is where a spreading sheen means you need to be.",
    },
    {
      id: "worker-requests-sample",
      kind: "Site worker asks for the sample",
      after: "hold-photo", delay: 3, seconds: 12,
      alert: "A worker from the site the drain runs under has walked over and is reaching for the sample bottle, saying he'll \"get it tested in-house and save everyone the trouble.\"",
      cue: "Keep the sample — latch the case and decline.",
      target: "case-latch",
      why: "The patrol's sample is the only independent record of what actually came out of this drain today — handing it to the very site the discharge came from breaks the one thing that made the sample worth taking, before it has gone anywhere the patrol can vouch for.",
      missNote: "The bottle went into the worker's hands, and with it went the only independent proof of what this drain discharged today — whatever the site's own testing later reports, there is no longer a patrol sample to check it against.",
      wrongNote: "Not that — the case latch is what keeps this sample in the patrol's own hands. Nothing else here does.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "patrol-board",
      title: "Read the documentation protocol",
      cue: "Check what gets noted, which bottle and preservative, and both numbers to call before you get close to the water.",
      why: "The protocol is what turns \"I saw something\" into a report a regulator can open a file on — it names the observations that matter, the bottle this kind of grab needs, and the two calls that have to happen today, not whenever it's convenient.",
    },
    {
      id: "stage-gear", kind: "sequence", anyOrder: true,
      targets: ["nitrile-gloves", "hi-vis-vest", "camera-charged"],
      itemNames: { "nitrile-gloves": "nitrile gloves", "hi-vis-vest": "high-visibility vest", "camera-charged": "camera, battery checked" },
      title: "Stage the patrol's own gear",
      cue: "Gloves on, vest on, and check the camera has battery before walking down to the bank.",
      why: "The gloves are what keeps whatever is in this discharge off the patrol member's hands if the bottle needs handling at the bank; the vest is what keeps a patrol member visible working a drain outfall beside a road; and a camera that dies mid-shoot is a discharge that goes undocumented no matter how carefully everything else was done.",
    },
    {
      id: "field-obs", kind: "sequence", anyOrder: true,
      targets: ["obs-sheen", "obs-color"],
      itemNames: { "obs-sheen": "surface sheen", "obs-color": "discharge colour" },
      title: "Note the sheen and colour",
      cue: "Look at the surface of the flow and record what you see before anything else disturbs it.",
      why: "A rainbow sheen or an unusual colour is often the only sign of what is actually in a discharge before any lab result comes back — noted now, in plain words, it is exactly what a Water Board investigator asks a caller for first.",
    },
    {
      id: "flow-estimate", kind: "gauge", target: "flow-staff",
      title: "Estimate the flow",
      cue: "Read the staff gauge in the channel and commit the stage reading.",
      why: "\"A discharge\" and \"a discharge running at this rate\" are different reports — the flow estimate is what lets an inspector judge whether this is a trickle worth a note or a release worth a same-day response.",
      gauge: { label: "STAGE", speed: 0.7, green: [0.42, 0.58], readout: (t) => `${(t * 0.9).toFixed(2)} m`, missNote: "Let the staff reading settle and read it again — a stage off by a third changes how urgent this call is." },
    },
    {
      id: "grab-sample", kind: "hold", target: "grab-pole", seconds: 8,
      title: "Take the grab from the bank",
      cue: "Hold the pole sampler out into the flow from dry ground until the bottle is full.",
      why: "The pole is the whole reason boots never have to leave the bank — holding it steady out over the flow is what lets the sample come from the discharge itself rather than from whatever the patrol member's own footing stirred up on the way to it.",
      holdBreakNote: "You lifted the pole before the bottle filled — a partial grab from a discharge already changing by the minute is not a sample worth defending later.",
    },
    {
      id: "bottle", kind: "select", target: "sample-bottle",
      title: "Cap the sample in the right bottle",
      cue: "Cap the amber preserved bottle — not the plain jar beside it.",
      why: "This kind of grab has a preservative for a reason written on the bottle's own label — cap the wrong container and the sample starts changing before anyone downstream of this bank ever gets to look at it.",
    },
    {
      id: "gps-time", kind: "select", target: "gps-device",
      title: "Log the GPS coordinates and time",
      cue: "Record the exact coordinates and the time on the field device.",
      why: "A discharge report without a location and a timestamp is a story nobody downstream can act on — the coordinates are what let an inspector find this exact drain, and the time is what lets them connect it to whatever else happened on the site that day.",
    },
    {
      id: "place-scale", kind: "drag", target: "scale-card",
      title: "Set the scale card in frame",
      cue: "Carry the scale card down to the water's edge, in view of the sheen, without stepping in.",
      why: "A photo of a sheen with nothing beside it to measure against tells an inspector nothing about how big it actually is — the scale card, held at the edge rather than in the water, is what turns the picture into something a case file can use.",
      drag: { to: "scale-socket", radius: 0.45, missNote: "Not close enough to the water's edge — the scale card has to be in the same frame as the sheen." },
    },
    {
      id: "hold-photo", kind: "hold", target: "camera", seconds: 6,
      title: "Photograph the discharge with the scale in frame",
      cue: "Hold the camera steady on the sheen and the scale card until the shot is sharp.",
      why: "A blurred or rushed photo is as useless to an inspector as no photo at all — holding steady long enough for a sharp frame is what makes this the one piece of evidence that survives long after the discharge itself has washed out on the next tide.",
      holdBreakNote: "The shot came out blurred — hold the frame steady on the sheen and the scale card together before releasing the shutter.",
    },
    {
      id: "notify", kind: "sequence",
      targets: ["call-water-board", "call-city-hotline"],
      itemNames: { "call-water-board": "Regional Water Quality Control Board", "call-city-hotline": "city pollution hotline" },
      title: "Notify the Regional Water Board and the city hotline",
      cue: "Call the Regional Water Board first, then the city's pollution hotline.",
      why: "The Regional Water Board is who actually has authority to act on an illicit discharge under the Clean Water Act; the city hotline is what gets a public works crew looking at the drain itself the same day — one without the other leaves either the enforcement side or the immediate response side never hearing about it.",
      outOfOrderNote: "The Water Board first, since they hold the enforcement authority here — the city hotline afterward gets the immediate response moving.",
    },
    {
      id: "field-sheet", kind: "select", target: "field-sheet",
      title: "Complete the field sheet",
      cue: "Write up the sheen, colour, flow, sample, photo and both calls in one place.",
      why: "The field sheet is what ties the bottle, the photo and the two phone calls together into one report — without it, a regulator has a bottle, a picture and a memory of a phone call that nothing on paper actually connects to each other.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["bottle-uncapped"],
      itemNames: { "bottle-uncapped": "the sample bottle, cap resting loose" },
      itemNotes: { "bottle-uncapped": "The sample bottle's cap is sitting on top, not turned down — an open bottle riding back to the car is a sample that is no longer only what came out of the drain." },
      title: "Check the case before you leave the bank",
      cue: "Look over the bottle case and the bank once more before heading back.",
      why: "This is the last chance to catch anything before the walk back turns a small mistake into a ruined sample — nobody is coming back to this drain today to take the grab again.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, DPD_ACCENT);

    // ---------------------------------------------------------------- ground
    const padTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { base: "#4a4640", base2: "#403c37", tiles: 4 }), { repeat: 3, px: 256 });
    const bank = box(g, 5.6, 0.1, 2.0, 0, 0.05, 1.3, 0x4a4640, { rough: 0.9, cast: false });
    bank.material = texturedMat(padTex, { rough: 0.9, color: 0x8f8a80 });
    const slope = box(g, 5.6, 0.3, 0.6, 0, -0.05, 0.1, 0x453a2e, { rough: 0.95 });
    slope.rotation.x = 0.3;
    const channel = box(g, 5.6, 0.1, 2.0, 0, -0.4, -1.3, 0x2a2f2a, { rough: 0.95 });
    void channel;
    const water = box(g, 5.6, 0.02, 1.8, 0, -0.26, -1.3, 0x2f4a52, { rough: 0.15, metal: 0.4, opacity: 0.78, transparent: true, cast: false });

    // Storm drain outfall pipe in the far bank.
    const outfall = group(g, -0.3, -0.14, -2.1);
    cyl(outfall, 0.32, 0.32, 0.4, 0, 0, 0, 0x6b6660, { rough: 0.9, seg: 18, open: true }).rotation.x = Math.PI / 2;
    cyl(outfall, 0.4, 0.4, 0.1, 0, 0, 0.22, 0x7b756d, { rough: 0.9, seg: 18 }).rotation.x = Math.PI / 2;
    holoTag(outfall, "storm drain — discharging", 0, 0.55, 0.2, { css: "#d2745b", w: 0.44 });
    const dischargeParticles = particles(g, 50, 0x8fa89a, { size: 0.028, life: 0.8, additive: false, opacity: 0.55 });

    // Sheen and colour on the water surface.
    const sheenHome = new THREE.Vector3(-0.9, -0.245, -1.5);
    const sheen = box(g, 1.1, 0.006, 0.7, sheenHome.x, sheenHome.y, sheenHome.z, 0xa07fd8, { rough: 0.1, metal: 0.8, opacity: 0.55, transparent: true, cast: false });
    reg(hits, sheen, "obs-sheen");
    const colorSpot = box(g, 0.7, 0.006, 0.5, 0.7, -0.245, -1.5, 0x5a4a2a, { rough: 0.2, metal: 0.5, opacity: 0.5, transparent: true, cast: false });
    reg(hits, colorSpot, "obs-color");

    const waterHit = box(g, 3.0, 0.4, 1.6, 0, -0.2, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step down into it?", 1.6, 0.1, -1.3, { css: "#d2312b", w: 0.4 });
    reg(hits, waterHit, "step-in-water");

    // Staff gauge in the channel.
    const staff = group(g, -1.7, -0.4, -1.1);
    box(staff, 0.09, 1.0, 0.03, 0, 0.5, 0, 0xf2f6fa, { rough: 0.7 });
    for (let i = 1; i < 8; i++) box(staff, 0.09, 0.012, 0.035, 0, i * 0.12, 0.002, i % 4 === 0 ? 0xd2312b : 0x1b1e23, { rough: 0.7, cast: false });
    holoTag(staff, "staff gauge", 0, 1.15, 0, { css: "#d2745b", w: 0.26 });
    reg(hits, staff, "flow-staff");

    // Pole sampler, held from dry bank.
    const pole = group(g, 0.1, 0.1, 0.4, 0.25);
    const rod = cyl(pole, 0.012, 0.012, 1.7, 0, 0.7, 0, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 8 });
    rod.rotation.x = 0.55;
    const cupHolder = cyl(pole, 0.055, 0.055, 0.15, 0, 0.15, -0.85, 0xdfe6ec, { rough: 0.5, seg: 14 });
    holoTag(pole, "pole sampler", 0, 1.35, 0.3, { css: "#d2745b", w: 0.28 });
    reg(hits, pole, "grab-pole");
    void cupHolder;

    // Bottle case: correct amber bottle and a decoy plain jar.
    const bench = group(g, 1.5, 0.1, 1.0, -0.3);
    box(bench, 1.1, 0.5, 0.5, 0, 0.25, 0, 0x8a7d63, { rough: 0.75 });
    const caseGrp = group(bench, -0.2, 0.52, 0);
    box(caseGrp, 0.4, 0.1, 0.25, 0, 0.05, 0, 0x3a3f45, { rough: 0.6, metal: 0.3 });
    const amberBottle = cyl(caseGrp, 0.045, 0.045, 0.14, -0.08, 0.15, 0, 0x6a4a2a, { rough: 0.3, opacity: 0.8, transparent: true, seg: 14 });
    decal(caseGrp, 0.08, 0.05, -0.08, 0.221, 0, signFace("PRESERVED", { bg: "#241d0d", accent: "#f2c14b", scale: 0.4 }));
    holoTag(caseGrp, "amber preserved bottle", -0.08, 0.32, 0, { css: "#d2745b", w: 0.32 });
    reg(hits, amberBottle, "sample-bottle");
    const plainJar = cyl(caseGrp, 0.045, 0.045, 0.13, 0.1, 0.145, 0, 0xe8eef2, { rough: 0.3, opacity: 0.8, transparent: true, seg: 14 });
    holoTag(caseGrp, "plain jar", 0.1, 0.3, 0, { css: "#d2312b", w: 0.24 });
    reg(hits, plainJar, "wrong-bottle");
    const latch = box(caseGrp, 0.06, 0.02, 0.02, 0, 0.1, 0.13, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    reg(hits, latch, "case-latch");
    const looseCap = cyl(caseGrp, 0.047, 0.047, 0.02, -0.08, 0.24, 0.05, 0x6a4a2a, { rough: 0.5, metal: 0.3, seg: 14 });
    reg(hits, looseCap, "bottle-uncapped");

    const gpsDevice = instrument(bench, 0.25, 0.52, 0, { idle: "-- , --", color: DPD_ACCENT, w: 0.13, d: 0.19 });
    holoTag(bench, "GPS / time device", 0.25, 0.66, 0, { css: "#d2745b", w: 0.32 });
    reg(hits, gpsDevice, "gps-device");

    // Scale card, dragged to the water's edge.
    const scaleHome = new THREE.Vector3(1.5, 0.14, 1.3);
    const scaleCard = group(g, scaleHome.x, scaleHome.y, scaleHome.z);
    box(scaleCard, 0.16, 0.02, 0.1, 0, 0.01, 0, 0xf2f2ec, { rough: 0.6 });
    decal(scaleCard, 0.14, 0.08, 0, 0.021, 0, signFace("SCALE — 10 cm", { bg: "#f2f2ec", accent: "#1b1e22", scale: 0.42 }));
    reg(hits, scaleCard, "scale-card");
    const scaleSocket = group(g, -1.0, 0.1, -0.9);
    hits["scale-socket"] = scaleSocket;

    const skipScaleHit = box(g, 0.3, 0.2, 0.2, 0.6, 0.5, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "snap it without the scale?", 0.6, 0.7, 0.3, { css: "#d2312b", w: 0.46 });
    reg(hits, skipScaleHit, "skip-scale");

    // Camera on a small tripod near the bank edge.
    const camGrp = group(g, -0.6, 0.14, 0.5, 0.5);
    cyl(camGrp, 0.015, 0.02, 0.5, 0, 0.25, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    box(camGrp, 0.14, 0.09, 0.1, 0, 0.55, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(camGrp, "camera", 0, 0.72, 0, { css: "#d2745b", w: 0.24 });
    reg(hits, camGrp, "camera");

    // ------------------------------------------------------------- gear
    const gearBench = group(g, -1.7, 0.1, 1.3, 0.4);
    box(gearBench, 0.7, 0.5, 0.35, 0, 0.25, 0, 0x8a7d63, { rough: 0.75 });
    const gloves = box(gearBench, 0.14, 0.03, 0.1, -0.2, 0.52, 0, 0x4a7fd8, { rough: 0.8 });
    holoTag(gearBench, "nitrile gloves", -0.2, 0.65, 0, { css: "#d2745b", w: 0.28 });
    reg(hits, gloves, "nitrile-gloves");
    const vest = box(gearBench, 0.16, 0.05, 0.1, 0, 0.53, 0, 0xf2c14b, { rough: 0.75 });
    holoTag(gearBench, "hi-vis vest", 0, 0.68, 0, { css: "#d2745b", w: 0.26 });
    reg(hits, vest, "hi-vis-vest");
    const camBattery = box(gearBench, 0.1, 0.03, 0.08, 0.22, 0.515, 0, 0x2b2f34, { rough: 0.6 });
    holoTag(gearBench, "camera battery", 0.22, 0.62, 0, { css: "#d2745b", w: 0.28 });
    reg(hits, camBattery, "camera-charged");

    // -------------------------------------------------------------- board
    const patrolBoard = holoPanel(g, 0.92, 0.62, -1.6, 1.15, 1.5, (cx, w, h) => {
      cx.fillStyle = "#241108"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d2745b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f5e0d3"; cx.fillText("DISCHARGE DOCUMENTATION", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#efd6c4";
      ["Note: sheen, colour, flow", "Grab: amber preserved bottle only", "Photo: scale card in frame", "Notify: Regional Water Board + city hotline",
       "Stay out of the water — pole sampler only"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.35, accent: DPD_ACCENT });
    reg(hits, patrolBoard, "patrol-board");

    // ------------------------------------------------------------ retreat line
    const retreatLine = group(g, 0, 0.06, 1.9);
    for (let i = -2; i <= 2; i++) cyl(retreatLine, 0.008, 0.008, 0.2, i * 0.5, 0.1, 0, 0xf2c14b, { rough: 0.6, seg: 6 });
    holoTag(retreatLine, "retreat line", 0, 0.3, 0, { css: "#d2745b", w: 0.28 });
    reg(hits, retreatLine, "retreat-line");

    // ------------------------------------------------------ hotline / calls
    const phoneGrp = group(g, 1.9, 0.1, 1.9, -0.3);
    box(phoneGrp, 0.5, 0.4, 0.3, 0, 0.2, 0, 0x8a7d63, { rough: 0.75 });
    const wbCall = box(phoneGrp, 0.1, 0.03, 0.06, -0.08, 0.42, 0, DPD_ACCENT, { rough: 0.5 });
    holoTag(phoneGrp, "Regional Water Board", -0.08, 0.56, 0, { css: "#d2745b", w: 0.4 });
    reg(hits, wbCall, "call-water-board");
    const cityCall = box(phoneGrp, 0.1, 0.03, 0.06, 0.1, 0.42, 0, 0xe8b02e, { rough: 0.5 });
    holoTag(phoneGrp, "city hotline", 0.1, 0.56, 0, { css: "#d2745b", w: 0.28 });
    reg(hits, cityCall, "call-city-hotline");

    // ------------------------------------------------------------- field sheet
    const sheetClip = group(gearBench, 0.32, 0.52, -0.1);
    box(sheetClip, 0.16, 0.006, 0.2, 0, 0, 0, 0xecebe0, { rough: 0.9 });
    decal(sheetClip, 0.14, 0.18, 0, 0.005, 0, paperFace("FIELD SHEET", ["Sheen / colour / flow", "Sample bottle + time", "Photo taken? Y/N", "Water Board + hotline called"], { scale: 0.85 })).rotation.x = -Math.PI / 2;
    reg(hits, sheetClip, "field-sheet");

    // -------------------------------------------------------- site worker
    const worker = standingFigure(g, 2.45, 0.6, { ry: -2.0, cloth: 0x3a3f45, vest: 0xe8622a, helmet: 0x1b1e22 });
    holoTag(worker, "site worker", 0, 1.9, 0, { css: "#d2745b", w: 0.3 });
    const offerHit = box(g, 0.4, 0.4, 0.3, 1.9, 0.6, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "hand it over?", 1.9, 0.9, 0.9, { css: "#d2312b", w: 0.34 });
    reg(hits, offerHit, "hand-to-worker");

    cone(g, -2.4, 2.2); cone(g, 2.4, 2.2);
    barrierPanel(g, 0, 2.3, { color: DPD_ACCENT });
    toolChest(g, -2.1, 0.7, { color: DPD_ACCENT });

    // Site dressing: rip-rap at the toe of the bank, storm litter caught in
    // the eddy, and a second drain grate upstream — none of it interactive,
    // all of it what a real discharge point on a bank actually looks like.
    const ripRap = group(g, -1.2, -0.28, -2.0);
    for (let i = 0; i < 16; i++) {
      const rx = (Math.sin(i * 12.9) * 0.5 + 0.5) * 2.6 - 1.3, rz = (Math.cos(i * 7.3) * 0.5 + 0.5) * 0.6 - 0.3;
      ball(ripRap, 0.045 + (i % 4) * 0.014, rx, 0, rz, 0x76716a, { rough: 0.95, seg: 6, seg2: 5 });
    }
    const litter = group(g, 0.5, 0.02, -1.7);
    for (const [dx, dz, w, h, d, c] of [[-0.3, 0.1, 0.14, 0.02, 0.2, 0xd8dee4], [0.1, -0.2, 0.1, 0.08, 0.1, 0x8fa050], [0.35, 0.15, 0.06, 0.06, 0.06, 0xb9bec4], [-0.05, 0.3, 0.18, 0.015, 0.12, 0xdfe6ec], [0.2, 0.35, 0.08, 0.03, 0.1, 0x9a8a6a]]) box(litter, w, h, d, dx, h / 2, dz, c, { rough: 0.9, cast: false });
    const grateUp = group(g, 1.3, -0.1, -1.85);
    box(grateUp, 0.3, 0.03, 0.3, 0, 0, 0, 0x3a3f45, { rough: 0.7, metal: 0.4 });
    for (let i = 0; i < 5; i++) box(grateUp, 0.26, 0.012, 0.02, 0, 0.016, -0.12 + i * 0.06, 0x1b1e22, { rough: 0.6, metal: 0.5 });
    const secondPatrol = standingFigure(g, -1.7, 2.2, { ry: 0.7, cloth: 0x2b5a4a, vest: 0xf2c14b });
    holoTag(secondPatrol, "second patrol member", 0, 1.9, 0, { css: "#d2745b", w: 0.42 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.0, 0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "bottle") amberBottle.material = mat(0x6a4a2a, { rough: 0.4, opacity: 0.9, transparent: true });
        if (step.id === "place-scale") { scaleCard.parent.remove(scaleCard); scaleSocket.add(scaleCard); scaleCard.position.set(0, 0, 0); }
        if (step.id === "walk") looseCap.position.y = 0.19;
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "sheen-reaches-shore") { sheen.position.z += 0.6; sheen.material = mat(0xa07fd8, { rough: 0.1, metal: 0.8, emissive: 0xa07fd8, ei: 0.6, opacity: 0.65, transparent: true }); }
        if (it.id === "worker-requests-sample") worker.position.x -= 0.6;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "sheen-reaches-shore") { sheen.position.z = sheenHome.z; sheen.material = mat(0xa07fd8, { rough: 0.1, metal: 0.8, opacity: 0.55, transparent: true }); }
        if (it.id === "worker-requests-sample") worker.position.x += 0.6;
      },
      animate(t, dt, session) {
        dischargeParticles.visible = true;
        dischargeParticles.userData.step(dt, new THREE.Vector3(-0.3, -0.14, -1.9), 0.16, 0.9, 1.2);
        water.position.y = -0.26 + Math.sin(t * 1.5) * 0.006;
        const step = session?.step;
        if (step?.id === "grab-sample" && session.holding) pole.rotation.x = -0.2 + Math.sin(t * 3) * 0.02;
        else pole.rotation.x = 0.55;
      },
    };
  },
};
