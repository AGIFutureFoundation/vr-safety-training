import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, cone, instrument,
  standingFigure, surfaceTexture, texturedMat, palette, asphaltFace, corrugatedFace,
  concreteFace, safetyStripeFace, gratingFace, reg,
} from "../citykit.js";
import { regionalJet } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Aircraft Marshalling & Wing-Walker Signals VR — its own
// gamified system: Bay Command.
//
// Marshalling a jet into a maintenance hangar bay, not a passenger gate: the
// clearance on both sides of the fuselage is tighter than a normal stand, so
// two wing-walkers watch the door frame the marshaller's own seat-of-the-taxi
// view cannot judge, and every one of them shares one universal stop signal
// that beats any other instruction the moment somebody raises it. No bay
// clearance distance, engine model or timing figure here is one this
// platform is certain of — those live on the hangar's own marshalling plan.

const AVMS_ACCENT = 0xffb13a;

export const SIM_AV_MARSHALLING_AND_WINGWALKER_SIGNALS = {
  id: "av-marshalling-and-wingwalker-signals",
  index: "av-1",
  domain: "Aviation",
  trade: "Aircraft marshaller and wing walker — IAM/TWU ramp crew",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "IAM and TWU ramp training; FAA 14 CFR Part 139 movement-area and safety-area operations and 14 CFR 139.303 personnel training for airport movement-area operations; OSHA 29 CFR 1910.132 personal protective equipment and 29 CFR 1910.95 occupational noise exposure; ANSI/ISEA 107 high-visibility apparel",
  name: "Marshalling & Wing-Walker Signals",
  title: simTitle("Marshalling & Wing-Walker Signals"),
  tagline: "A jet marshalled into a tight hangar bay: the bay walked for FOD, wing-walkers posted at both wingtips, the aircraft brought down the line on the marshaller's wands, clearance held against the door frame the whole way in, and one shared stop signal that beats every other instruction the instant it is raised",
  accent: AVMS_ACCENT,
  accentCss: "#ffb13a",
  parSeconds: 300,
  footprint: 2.9,
  badge: { id: "bay-command", name: "Bay Command", note: "Wing-walkers posted before the aircraft moved, clearance held both sides, and the stop signal answered the instant it was needed" },

  game: system({
    name: "Bay Command",
    currency: "BAY",
    ranks: ["Ramp Hand", "Signal Qualified", "Wing Walker", "Lead Marshaller", "Bay Command Certified"],
    badges: [
      { id: "clean-walk", name: "Clean Walk", note: "The bay was walked and cleared before the aircraft ever moved", test: AWARD.stepClean("fod-walk") },
      { id: "one-stop", name: "One Stop", note: "Every stop call in this shift was answered, never missed", test: AWARD.safe },
      { id: "steady-hands", name: "Steady Hands", note: "Held the marshalling signal and the clearance readings near band centre the whole approach", test: AWARD.precise(0.7) },
      { id: "on-the-mark", name: "On the Mark Certified", note: "Stopped the aircraft on the mark, first time", test: AWARD.stepClean("stop-on-mark") },
    ],
    challenges: [
      { id: "quick-bay", name: "Quick Bay", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "bay-streak", name: "Bay Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IAM or TWU local's member assistance programme, or the site's employee assistance line if a close call on the ramp is what stayed with you",

  hazards: {
    "engine-arc-cross": "You crossed the engine's intake arc while it was still turning. A running engine ingests a person from several metres out, and it does not slow down or announce itself before it does — the arc is walked around, never through, until the engine is confirmed shut down.",
    "wingtip-pinch-zone": "You stood in the pinch point between the wingtip and the hangar door frame instead of at the wing-walker's own watch position outboard of it. That gap is exactly what a wing-walker is posted to judge from a position it cannot close on them — standing inside it removes the one thing keeping a moving wingtip from ever reaching a person.",
    "wave-in-blind": "You gave the wave-in signal before both wing-walkers had confirmed their positions. The marshaller's own view down the taxi line cannot see either wingtip at the same time it is watching the nosewheel, so an aircraft waved forward without both wing-walkers posted is being brought into a bay nobody is actually watching the sides of.",
    "jet-blast-zone": "You stood behind the aircraft inside the jet-blast zone while the engines were still running. Blast from a turning engine at idle is still strong enough to knock a person down and turn loose debris into a hazard of its own, and it reaches well past where it looks safe to stand.",
  },

  lateNotes: {
    "wingwalker-l": "The wing-walkers are posted and their signal confirmed before the aircraft is ever waved forward, not called in after it is already moving.",
    "stop-bar": "The stop is given for the nosewheel on the mark, not called out after the aircraft has already rolled past it.",
  },

  interrupts: [
    {
      id: "wing-walker-loses-sight",
      kind: "Sightline lost",
      after: "marshal-in", delay: 5, seconds: 12,
      alert: "A parked tug has been rolled into wing-walker Left's sightline, and the clearance on that side can no longer be judged from where they stand.",
      cue: "Give the stop signal now — a wing-walker who cannot see the clearance cannot confirm it.",
      target: "emergency-stop-paddle",
      why: "A wing-walker's whole job is confirming a clearance the marshaller cannot see, and the instant that view is blocked the confirmation stops being real — the aircraft has to be stopped before it closes any further distance nobody is actually watching.",
      missNote: "The aircraft kept moving while wing-walker Left had no sightline to the clearance at all. A wingtip that closes on a door frame with nobody actually watching it is one bad foot of roll away from a strike that grounds the aircraft for inspection.",
      wrongNote: "That doesn't answer it — a wing-walker with no sightline is what stops this aircraft, not this.",
    },
    {
      id: "ground-vehicle-crosses",
      kind: "Taxi-line incursion",
      after: "wingtip-r-watch", delay: 4, seconds: 11,
      alert: "A baggage cart has turned onto the taxi line ahead of the nosewheel, well inside the aircraft's own path into the bay.",
      cue: "Stop signal now — nothing crosses the taxi line while the aircraft is still moving.",
      target: "emergency-stop-paddle",
      why: "The taxi line is kept clear specifically because the flight deck's own view cannot cover the ground immediately ahead of the nosewheel, and the one thing standing between a crossing vehicle and a strike is a marshalling crew that stops the aircraft the moment the line is no longer clear.",
      missNote: "The aircraft kept rolling toward the cart still crossing the taxi line. A jet cannot stop in the distance a wandering ground vehicle needs to clear its own path, which is the entire reason the stop signal exists independently of the aircraft's own brakes.",
      wrongNote: "Wrong response — the vehicle crossing the taxi line is what needs this aircraft stopped, nothing else.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "ear-defenders", "wand-set"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "ear-defenders": "ear defenders", "wand-set": "marshalling wands" },
      title: "Suit up for the bay",
      cue: "Hi-vis vest, ear defenders and the marshalling wands before anyone steps onto the apron.",
      why: "A marshaller and two wing-walkers are all going to be working close around a taxiing aircraft in a bay tighter than a normal stand, and every one of them being visible at a glance in hi-vis, with hearing protected against engine noise, is what lets each of them actually see and hear the others' calls over it.",
    },
    {
      id: "brief", kind: "select", target: "bay-plan-board",
      title: "Read the bay assignment",
      cue: "Confirm the aircraft type, the bay number and the tight-clearance note before anyone walks out.",
      why: "The bay assignment is what sets today's clearance margins on each side of the fuselage, and a crew that has not read it has no way to know before the aircraft is already rolling whether this bay gives the wingtips the room a normal stand does.",
    },
    {
      id: "fod-walk", kind: "find", noHint: true,
      targets: ["fod-bolt", "fod-rag"],
      itemNames: { "fod-bolt": "loose bolt on the taxi line", "fod-rag": "shop rag near the bay threshold" },
      itemNotes: {
        "fod-bolt": "A bolt sitting on the taxi line is exactly what an engine at idle pulls in from several metres out.",
        "fod-rag": "A rag at the threshold gets pulled under a tyre or into an intake the moment the aircraft starts rolling over it.",
      },
      decoyNotes: { "sound-drain-cover": "The drain grating is seated flush and clear. Nothing to flag there." },
      title: "Walk the bay for FOD",
      cue: "Walk the bay the aircraft will occupy and pick up every loose object you find.",
      why: "Foreign object damage does not care that this bay looked clean on the last turn — anything loose on the taxi line or at the threshold today is exactly what a hot engine or a rolling tyre finds first, so the walk happens before every single aircraft regardless of how the bay looked an hour ago.",
    },
    {
      id: "mark-clearance-stand", kind: "drag", target: "clearance-marker-l",
      title: "Set the clearance marker",
      cue: "Carry the wingtip clearance marker to its mark beside the door frame before anyone is posted.",
      why: "The marker gives wing-walker Left a fixed reference for how close the wingtip is actually allowed to come to the door frame, set once before the aircraft ever moves rather than eyeballed against the frame itself while a wing is closing on it.",
      drag: { to: "clearance-mark-l", radius: 0.4, missNote: "Not on the mark — carry the marker fully to the clearance line before anyone is posted against it." },
    },
    {
      id: "position-wingwalkers", kind: "sequence", anyOrder: true,
      targets: ["wingwalker-l", "wingwalker-r"],
      itemNames: { "wingwalker-l": "wing-walker, left", "wingwalker-r": "wing-walker, right" },
      title: "Post both wing-walkers",
      cue: "Post a wing-walker outboard of each wingtip before the aircraft is waved anywhere near the bay.",
      why: "Neither wingtip is visible from the marshaller's own position on the taxi line at the same time, which is the entire reason two separate people are posted rather than trusted to one set of eyes doing both jobs at once.",
    },
    {
      id: "signal-check", kind: "select", target: "signal-board",
      title: "Confirm the signal dictionary",
      cue: "Walk the hand-signal dictionary with both wing-walkers and agree the stop signal before anything moves.",
      why: "A wing-walker's wave and the marshaller's own wands only mean the same thing to everyone watching if all three of them agreed on the dictionary before the aircraft is moving and a signal actually has to be trusted at a glance.",
    },
    {
      id: "clear-approach", kind: "sequence", anyOrder: true,
      targets: ["cone-line", "door-frame-check"],
      itemNames: { "cone-line": "taxi-line cones set", "door-frame-check": "door frame confirmed clear" },
      title: "Clear the approach",
      cue: "Cone the taxi-line approach and confirm the door frame side posts are clear of anything parked.",
      why: "Everything either side of the taxi line is inside the aircraft's own swept path the moment it starts rolling, and coning the approach while confirming nothing is parked against the door frame is what keeps that path actually matching the one the marshaller is about to guide it down.",
    },
    {
      id: "marshal-in", kind: "track", target: "marshal-wands", seconds: 7,
      title: "Marshal the aircraft into the bay",
      cue: "Wands up, steady guidance down the taxi line until the nosewheel reaches the stop mark.",
      why: "From the flight deck the pilot cannot see the nosewheel or either wingtip for the whole distance into a bay this tight, so the marshaller's steady wands at a steady walking rate are the only reference the flight crew has for the entire approach.",
      track: { start: 0.1, green: [0.38, 0.58], rise: 0.6, fall: 0.5, drift: 0.12, label: "GUIDANCE", readout: (v) => (v < 0.38 ? "hesitating" : v > 0.58 ? "waving them in fast" : "steady") },
      holdBreakNote: "Signal rate out of band — the flight deck reads that as confusion in a bay with no room for it. Steady the wands.",
    },
    {
      id: "wingtip-l-watch", kind: "hold", target: "wingwalker-l", seconds: 6,
      title: "Hold the clear signal, left",
      cue: "Hold the clear signal steady while watching the left wingtip against its marker the whole approach.",
      why: "The clear signal only means something if it is held the entire time the wing is actually moving past the marker — a signal given once at the start and then forgotten is a wing-walker who stopped watching exactly when the clearance mattered most.",
      holdBreakNote: "Dropped the clear signal mid-approach. Hold it through the whole pass — that is what tells the marshaller left clearance is still being watched, not assumed.",
    },
    {
      id: "wingtip-r-watch", kind: "track", target: "wingwalker-r", seconds: 7,
      title: "Track the clearance, right",
      cue: "Keep the right-side clearance reading inside the band as the wing closes on the door frame.",
      why: "The right side of a bay this tight closes on the door frame at its own rate as the aircraft turns in, and a continuous reading is what lets the marshaller trust that clearance is holding instead of guessing it from a single glance at the start.",
      track: { start: 0.55, green: [0.4, 0.62], rise: 0.4, fall: 0.55, drift: 0.14, label: "CLEARANCE R", readout: (v) => (v < 0.4 ? "closing on the frame" : v > 0.62 ? "drifting wide" : "holding") },
      holdBreakNote: "Right clearance drifted out of band. Call it before the wing closes any further on the frame.",
    },
    {
      id: "stop-on-mark", kind: "gauge", target: "stop-bar",
      title: "Stop on the mark",
      cue: "Give the stop when the nosewheel is on the mark — commit inside the band.",
      why: "The mark is set for exactly this aircraft type in exactly this bay: it is the one point where both wing-walkers' clearance readings and the tail's own swing radius are all still true at once. A stop a metre long or short of it puts at least one of those three things wrong.",
      gauge: { label: "NOSEWHEEL", speed: 0.7, green: [0.46, 0.58], readout: (t) => `${((t - 0.52) * 400).toFixed(0)} cm`, missNote: "Off the mark — the tail swing or a wingtip clearance is no longer what it was calculated to be." },
    },
    {
      id: "chock-and-cone", kind: "sequence",
      targets: ["chock-nose", "chock-main", "cones-set"],
      itemNames: { "chock-nose": "nose gear chocks", "chock-main": "main gear chocks", "cones-set": "wingtip cones" },
      title: "Chock and cone",
      cue: "Nose chocks first, then the mains, then cones at both wingtips.",
      why: "Chocks before anything else is the rule the whole bay runs on: until they are set, nothing except the flight crew's own brakes is holding the aircraft on a stand that is rarely dead level, and the cones mark the exact two points a reversing tug's mirror must never find.",
      outOfOrderNote: "Nose, then mains, then cones — the aircraft is held before it is marked.",
    },
    {
      id: "engine-shutdown-confirm", kind: "select", target: "engine-status",
      title: "Confirm engines shut down",
      cue: "Confirm both engines have spooled down and the beacon is off before anyone approaches the aircraft.",
      why: "Everything about approaching this aircraft on foot — the FOD walk that follows, the chocks already set, the wing-walkers standing this close — depends on the engines actually being off, not just quiet, and the beacon is the flight deck's own confirmation of that rather than a guess from the sound of it.",
    },
    {
      id: "closeout-log", kind: "select", target: "closing-log",
      title: "Log the bay parking",
      cue: "Log the bay number, the stop reading and both wing-walkers' clearance calls before signing off.",
      why: "The bay log is what the next shift and the hangar floor both read before anything else touches this aircraft — a clean marshal that never gets logged against its own clearance calls leaves nothing behind to prove the bay was actually tight the way this shift found it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const PAL = palette("aviation");
    stationPad(g, 2.9, AVMS_ACCENT);

    // ------------------------------------------------------------------ apron ground
    const groundMesh = box(g, 8.4, 0.12, 8.6, 0, 0.06, 0.6, 0xffffff, { rough: 0.94 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#2c2e30", base2: "#26282a" }), { repeat: 7, px: 512 }),
      { rough: 0.94, metal: 0.03, color: 0xb9bec2 },
    );
    // Taxi-line paint down the centre.
    for (let i = 0; i < 10; i++) box(g, 0.1, 0.006, 0.32, 0, 0.121, -2.3 + i * 0.42, 0xf2c14b, { rough: 0.9, cast: false });

    // ------------------------------------------------------------------ hangar backdrop
    const hangar = group(g, 0, 0, 4.6);
    const wallMesh = box(hangar, 8.2, 4.6, 0.2, 0, 2.3, 0, 0xffffff, { rough: 0.7 });
    wallMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, { colour: PAL.structure, ribs: 20 }), { repeat: 4, px: 512 }),
      { rough: 0.6, metal: 0.25, color: 0xffffff },
    );
    const doorOpening = box(hangar, 5.4, 4.2, 0.05, 0, 2.1, -0.12, 0x0c0f12, { rough: 0.9, cast: false });
    void doorOpening;
    const framePostL = box(hangar, 0.28, 4.4, 0.4, -2.75, 2.2, 0.1, PAL.trim, { rough: 0.55, metal: 0.3 });
    const framePostR = box(hangar, 0.28, 4.4, 0.4, 2.75, 2.2, 0.1, PAL.trim, { rough: 0.55, metal: 0.3 });
    void framePostL; void framePostR;
    // Floor drain grating at the bay threshold — a second textured surface.
    const drainMesh = box(g, 1.1, 0.02, 0.5, 0, 0.111, 3.1, 0xffffff, { rough: 0.7, cast: false });
    drainMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }),
      { rough: 0.7, metal: 0.4, color: 0xffffff },
    );
    const soundDrainCover = group(g, -1.4, 0, 3.1);
    hits["sound-drain-cover"] = soundDrainCover;
    // Concrete curb along the bay threshold — a third textured surface.
    const curbMesh = box(g, 6.4, 0.16, 0.22, 0, 0.19, 3.55, 0xffffff, { rough: 0.85, cast: false });
    curbMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { tone: "#8b8d89" }), { repeat: 3, px: 256 }),
      { rough: 0.85, metal: 0.02, color: 0xffffff },
    );
    // Diagonal hazard striping at the taxi-line edge — a fourth textured surface.
    for (const sx of [-1, 1]) {
      const stripe = box(g, 0.3, 0.005, 4.2, sx * 3.9, 0.104, 0.6, 0xffffff, { rough: 0.85, cast: false });
      stripe.material = texturedMat(
        surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 3, px: 256 }),
        { rough: 0.8, metal: 0.02, color: 0xffffff },
      );
    }

    // ------------------------------------------------------------------ the aircraft
    const jet = regionalJet(g, 0, 0, -2.2, { livery: { colour: PAL.structure, accent: AVMS_ACCENT, fleetName: "SITE AIR", unitNumber: "N118XA" } });
    holoTag(jet, "inbound aircraft", 0, 3.4, 0, { css: "#ffb13a", w: 0.4 });
    const { fuselage, wingL, wingR, noseGear, mainGearL, mainGearR } = jet.userData.parts;
    void fuselage;
    const engineArcHit = box(g, 1.1, 1.4, 1.6, -1.15, 0.9, -1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk through the arc?", -1.15, 1.65, -1.7, { css: "#d2312b", w: 0.4 });
    reg(hits, engineArcHit, "engine-arc-cross");
    const jetBlastHit = box(g, 3.2, 1.2, 1.3, 0, 0.7, -4.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand in the blast?", 0, 1.35, -4.2, { css: "#d2312b", w: 0.4 });
    reg(hits, jetBlastHit, "jet-blast-zone");

    // FOD.
    const fodBolt = cyl(g, 0.035, 0.035, 0.05, -0.5, 0.13, -0.9, 0xb9bec4, { rough: 0.5, metal: 0.8, seg: 10 });
    reg(hits, fodBolt, "fod-bolt");
    const fodRag = box(g, 0.4, 0.012, 0.3, 0.7, 0.11, 2.9, 0xdfe6ea, { rough: 0.9 });
    fodRag.rotation.y = 0.4;
    reg(hits, fodRag, "fod-rag");

    // ------------------------------------------------------------------ clearance markers & wing-walkers
    const clearanceMarkerL = group(g, 2.2, 0, 2.6, 0.3);
    cyl(clearanceMarkerL, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 10 });
    box(clearanceMarkerL, 0.18, 0.12, 0.02, 0, 0.86, 0, AVMS_ACCENT, { rough: 0.6 });
    holoTag(clearanceMarkerL, "clearance marker", 0, 1.0, 0, { css: "#ffb13a", w: 0.36 });
    reg(hits, clearanceMarkerL, "clearance-marker-l");
    const clearanceMarkL = group(hangar, 2.6, 0, -1.9);
    hits["clearance-mark-l"] = clearanceMarkL;

    const wingwalkerL = standingFigure(g, 3.15, 1.1, { ry: 1.3, cloth: 0x2b3138, vest: AVMS_ACCENT, helmet: 0xf2f2f2 });
    holoTag(wingwalkerL, "wing-walker L", 0, 1.95, 0.15, { css: "#ffb13a", w: 0.32 });
    reg(hits, wingwalkerL, "wingwalker-l");
    const wingwalkerR = standingFigure(g, -3.15, 1.1, { ry: -1.3, cloth: 0x2b3138, vest: AVMS_ACCENT, helmet: 0xf2f2f2 });
    holoTag(wingwalkerR, "wing-walker R", 0, 1.95, 0.15, { css: "#ffb13a", w: 0.32 });
    reg(hits, wingwalkerR, "wingwalker-r");
    const wingPinchHit = box(g, 0.6, 1.2, 0.8, 2.75, 0.8, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand in the pinch?", 2.75, 1.45, 1.9, { css: "#d2312b", w: 0.4 });

    // Parked tug that rolls into wing-walker L's own sightline for the
    // sightline-lost interrupt — parked clear of it the rest of the run.
    const sightlineTug = group(g, 4.6, 0, 2.4, -0.6);
    box(sightlineTug, 0.9, 0.55, 1.6, 0, 0.35, 0, 0xf0b323, { rough: 0.5, metal: 0.25 });
    box(sightlineTug, 0.7, 0.45, 0.6, 0, 0.85, -0.3, 0x2b2f34, { rough: 0.5 });
    const tugParkedPos = { x: 4.6, z: 2.4 };
    const tugBlockPos = { x: 3.0, z: 1.9 };
    reg(hits, wingPinchHit, "wingtip-pinch-zone");

    // ------------------------------------------------------------------ marshaller & signal board
    const marshaller = standingFigure(g, 0, 3.4, { ry: 3.14, cloth: 0x2b3138, vest: AVMS_ACCENT });
    const wands = group(marshaller, 0, 1.4, 0);
    for (const sx of [-1, 1]) { const wand = cyl(wands, 0.02, 0.02, 0.36, sx * 0.3, 0.1, 0.1, 0xf2703b, { emissive: 0xf2703b, ei: 1.4, rough: 0.4, cast: false, seg: 8 }); wand.rotation.z = sx * 0.5; }
    holoTag(marshaller, "marshaller — wands", 0, 1.95, 0, { css: "#ffb13a", w: 0.4 });
    reg(hits, marshaller, "marshal-wands");

    const stopPaddle = group(g, -0.5, 0, 3.3, 0.2);
    cyl(stopPaddle, 0.014, 0.014, 0.6, 0, 0.3, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 });
    const paddleFace = box(stopPaddle, 0.24, 0.24, 0.015, 0, 0.62, 0, 0xd2312b, { rough: 0.5 });
    decal(paddleFace, 0.2, 0.2, 0, 0, 0.011, signFace("STOP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.6 }));
    holoTag(stopPaddle, "emergency stop", 0, 0.94, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, stopPaddle, "emergency-stop-paddle");

    const waveInLever = group(g, -1.2, 0.14, 3.3, 0.2);
    box(waveInLever, 0.1, 0.32, 0.06, 0, 0.16, 0, 0x2b2f34, { rough: 0.55 });
    const waveInPaddle = box(waveInLever, 0.22, 0.16, 0.02, 0, 0.4, 0.01, 0xd2312b, { rough: 0.5 });
    decal(waveInPaddle, 0.19, 0.13, 0, 0, 0.011, signFace("WAVE\nIN", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.4 }));
    reg(hits, waveInPaddle, "wave-in-blind");

    // ------------------------------------------------------------------ gear + gauges
    const stopBar = box(g, 1.2, 0.006, 0.1, 0, 0.102, 1.3, 0xd2312b, { rough: 0.9, cast: false });
    holoTag(g, "stop mark", 0.85, 0.3, 1.3, { css: "#d2312b", w: 0.28 });
    reg(hits, stopBar, "stop-bar");

    const noseChockPick = box(g, 0.3, 0.12, 0.16, 1.9, 0.16, -1.6, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "nose chocks", 1.9, 0.42, -1.6, { css: "#ffb13a", w: 0.26 });
    reg(hits, noseChockPick, "chock-nose");
    const mainChockPick = box(g, 0.34, 0.14, 0.18, 2.3, 0.17, -1.6, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "main chocks", 2.3, 0.44, -1.6, { css: "#ffb13a", w: 0.26 });
    reg(hits, mainChockPick, "chock-main");
    const conePick = cone(g, 2.7, -1.6);
    holoTag(g, "wingtip cones", 2.7, 0.5, -1.6, { css: "#ffb13a", w: 0.36 });
    reg(hits, conePick, "cones-set");
    void mainGearL; void mainGearR; void noseGear;

    const engineStatus = instrument(g, 2.9, 0, -1.0, { ry: -0.4, idle: "RUNNING", color: AVMS_ACCENT });
    holoTag(engineStatus, "engine status", 0, 0.16, 0, { css: "#ffb13a", w: 0.32 });
    reg(hits, engineStatus, "engine-status");

    // ------------------------------------------------------------------ paperwork + gear + signage
    const plan = holoPanel(g, 0.62, 0.42, -3.1, 1.5, -1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffb13a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("BAY ASSIGNMENT · BAY 4", w * 0.06, h * 0.1);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("TIGHT CLEARANCE BOTH SIDES", w * 0.06, h * 0.28);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Aircraft type: per the bay plan", "Clearance margin: per the hangar plan",
       "Wing-walkers posted both sides before movement", "Stop signal beats every other call",
       "Chocks before anyone approaches"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.42 + i * 0.1)));
    }, { ry: 0.4, accent: AVMS_ACCENT });
    reg(hits, plan, "bay-plan-board");

    const signalBoard = holoPanel(g, 0.6, 0.4, 3.3, 1.4, 0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffb13a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SIGNAL DICTIONARY", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Wands up: proceed on the line", "One wand raised: turn that way",
       "Crossed wands: STOP — beats everything", "Fists together: set the brakes"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.32 + i * 0.14)));
    }, { ry: -0.5, accent: AVMS_ACCENT });
    reg(hits, signalBoard, "signal-board");

    const ppeRack = group(g, -3.4, 0, 2.3, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, AVMS_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#ffb13a", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const earProp = group(ppeRack, 0.2, 0.62, 0);
    ball(earProp, 0.08, 0, 0, 0, 0x2b2f34, { rough: 0.5, seg: 12 });
    holoTag(earProp, "ear defenders", 0, 0.18, 0, { css: "#ffb13a", w: 0.32 });
    reg(hits, earProp, "ear-defenders");
    const wandProp = group(ppeRack, -0.2, 0.62, 0);
    cyl(wandProp, 0.015, 0.015, 0.3, 0, 0, 0, 0xf2703b, { emissive: 0xf2703b, ei: 1.2, rough: 0.4, seg: 8 });
    holoTag(wandProp, "wands", 0, 0.22, 0, { css: "#ffb13a", w: 0.24 });
    reg(hits, wandProp, "wand-set");

    const coneLine = cone(g, 3.6, 2.6);
    holoTag(g, "taxi-line cones", 3.6, 0.5, 2.6, { css: "#ffb13a", w: 0.4 });
    reg(hits, coneLine, "cone-line");
    const doorFrameCheck = group(hangar, -2.75, 0, 0.1);
    holoTag(doorFrameCheck, "door frame", 0, 3.4, 0, { css: "#ffb13a", w: 0.3 });
    reg(hits, doorFrameCheck, "door-frame-check");

    const closingLog = group(g, 3.4, 0, -0.4, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("BAY LOG\nOPEN", { bg: "#11181f", accent: "#ffb13a", scale: 0.3 }), { px: 320 });
    holoTag(closingLog, "bay log", 0, 1.34, 0, { css: "#ffb13a", w: 0.26 });
    reg(hits, closingLog, "closing-log");

    const jetwash = particles(g, 34, 0xcfd9e2, { size: 0.03, life: 0.7, additive: false, opacity: 0.22 });
    const dust = particles(g, 16, 0x9a8a6a, { size: 0.02, life: 0.5, additive: false, opacity: 0.14 });

    // Baggage cart used by the ground-vehicle interrupt; starts parked off the line.
    const cart = group(g, 4.4, 0, 1.6, -0.5);
    box(cart, 0.5, 0.4, 1.0, 0, 0.25, 0, 0x4a5561, { rough: 0.6, metal: 0.3 });
    for (const [cx2, cz2] of [[-0.2, -0.35], [0.2, -0.35], [-0.2, 0.35], [0.2, 0.35]]) cyl(cart, 0.09, 0.09, 0.08, cx2, 0.09, cz2, 0x1a1e23, { rough: 0.9, seg: 12 }).rotation.z = Math.PI / 2;
    const cartHome = { x: 4.4, z: 1.6 };

    let taxi = 0, engineRunning = true;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.0),

      onInterrupt(it) {
        if (it.id === "wing-walker-loses-sight") { sightlineTug.position.set(tugBlockPos.x, 0, tugBlockPos.z); }
        if (it.id === "ground-vehicle-crosses") { cart.position.set(0.3, 0, 0.4); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wing-walker-loses-sight") { sightlineTug.position.set(tugParkedPos.x, 0, tugParkedPos.z); }
        if (it.id === "ground-vehicle-crosses") { cart.position.set(cartHome.x, 0, cartHome.z); }
      },
      onStepComplete(step) {
        if (step.id === "fod-walk") { fodBolt.visible = false; fodRag.visible = false; }
        if (step.id === "stop-on-mark") { taxi = 1; engineRunning = false; }
        if (step.id === "engine-shutdown-confirm") {
          repaint(engineStatus.userData.screen, signFace("SHUT DOWN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.42 }));
        }
        if (step.id === "closeout-log") {
          repaint(closingLogFace, signFace("BAY LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },
      onHazard() {},

      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "marshal-in" && session.holding) taxi = Math.min(1, taxi + dt / 6);
        jet.position.z = -2.2 + taxi * 3.5;
        wingwalkerL.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        wingwalkerR.userData.head.rotation.y = Math.sin(t * 0.5 + 1.3) * 0.3;
        if (engineRunning) {
          jetwash.visible = true;
          jetwash.userData.step(dt, new THREE.Vector3(-1.15, 0.85, -3.2), 0.3, 1.2, -0.2);
        } else if (jetwash.visible) jetwash.visible = false;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.3, 2.8), 0.2, 0.15, -0.1);
      },
    };
  },
};
