import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, cone, reg,
  surfaceTexture, texturedMat, pavingFace, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Reefer Yard Monitoring VR — Maritime & Ports, night shift on
// the refrigerated-container rack. The unglamorous half of container reefer
// work: not the box coming off the ship, but the hundreds of identical white
// units sitting in the dark afterward, each one somebody's cargo depending on
// a compressor nobody is watching unless a mechanic walks the row. Ground
// checked before power, the set point read off the manifest rather than
// guessed, the return air watched rather than trusted, and a leak found with
// a detector rather than a nose — because a reach stacker working the same
// row does not slow down for a shape it did not expect between two boxes.

const RYM_ACCENT = 0x5fc9dd;

export const SIM_REEFER_YARD_MONITORING = {
  id: "reefer-yard-monitoring",
  index: "182",
  domain: "Maritime",
  trade: "Reefer mechanic — ILWU",
  category: "Maritime & Ports",
  weather: "fog",
  certification: "ILWU — OSHA 29 CFR 1918 marine terminal safety; OSHA 29 CFR 1910.147 lockout/tagout for isolating a faulted unit; EPA Clean Air Act Section 608 refrigerant-management and technician-certification requirements",
  name: "Reefer Yard Monitoring",
  title: simTitle("Reefer Yard Monitoring"),
  tagline: "Night walk of the reefer rack: ground proven before the plug goes in, set point and return air read against the manifest, an alarming unit investigated, a refrigerant leak isolated, and the row kept clear of the reach stacker working it",
  accent: RYM_ACCENT,
  accentCss: "#5fc9dd",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "row-walked-clean", name: "Row Walked Clean", note: "Every unit proven, one alarm read before it was silenced, one leak isolated before anyone else got near it — first time" },

  game: system({
    name: "Reefer Row",
    currency: "FROST",
    ranks: ["Yard Hand", "Reefer Tech", "Lead Reefer Mechanic", "Chief Reefer Mechanic", "Reefer Row Certified"],
    badges: [
      { id: "ground-proven", name: "Ground Proven", note: "Every plug tested before it took power", test: AWARD.stepClean("ground-check") },
      { id: "row-clear", name: "Row Clear", note: "Never in the travel lane, never under an unplugged assumption", test: AWARD.safe },
      { id: "reading-true", name: "Reading True", note: "Set point and return air both held inside the manifest's band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-walk", name: "Clean Walk", note: "No corrections anywhere in the row", test: AWARD.clean },
      { id: "held-the-band", name: "Held the Band", note: "Return air never dropped out of band once it settled", test: AWARD.unbroken },
      { id: "row-in-time", name: "Row In Time", note: "Whole row closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-ground": "You went to seat the plug before the ground pin read continuous. A reefer chassis with a fault already sitting in it stays safe right up until a hand is the shortest path it finds to ground — that pin is tested on every plug, not just the ones that look old.",
    "cross-travel-lane": "You stepped off the marked walk lane into the reach stacker's travel lane. A stacker working this row is watching the box on the end of its boom, not the strip of pavement where a person is not supposed to be standing — the walk lane is the only ground in this row built around people and a forty-tonne machine sharing it.",
    "silence-without-read": "You silenced the high-temperature alarm without reading the discharge first. A quiet panel with nothing logged behind it looks identical whether the drift was caught in its first ten minutes or its first six hours, and the next shift has no way to tell which one they inherited.",
    "open-door-untested": "You went for the coil access door before running the detector along the seam. Whatever concentration built up behind that panel comes out the moment the door does, and finding out how much of it there was by opening the door first is finding out the hard way.",
  },

  lateNotes: {
    "reefer-plug": "Ground checked first — the plug goes in once the tester reads continuous, not before.",
    "setpoint-dial": "Nothing to dial until the plug is seated and locked and the unit is actually taking power.",
  },

  steps: [
    {
      id: "manifest", kind: "select", target: "manifest-board",
      title: "Read the reefer manifest and yard plan",
      cue: "Check the row assignment, the commodity, and the set point the manifest calls for on this box.",
      why: "The manifest is the only place the commodity and its required set point are written down together — a box of pharmaceuticals held two degrees off spoils just as fast as one parked on the wrong row entirely, and in a yard of hundreds of identical white units the manifest is the only thing that says which one is actually this one.",
    },
    {
      id: "yard-brief", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "radio-checkin"],
      itemNames: { "hi-vis-vest": "high-vis vest", "radio-checkin": "radio check-in with yard control" },
      title: "Suit up and check in with yard control",
      cue: "Put on the high-vis vest and radio yard control before stepping into the row.",
      why: "A reefer row at night is worked by reach stackers moving boxes on both sides of you, and a driver's view down a stack is worse than yours is of them. The vest is what lets a driver pick you out against a dark row, and the radio call is what tells every stacker on that frequency a body is walking this row before one of them starts a move down it.",
    },
    {
      id: "lane-check", kind: "select", target: "lane-marker",
      title: "Confirm the walk lane",
      cue: "Find the painted pedestrian lane along the row and keep off the travel lane down its centre.",
      why: "The travel lane down the centre of this row is where a reach stacker's own wheels run when it comes to reposition a box, and it does not slow for a shape it did not expect to find there. The painted walk lane at the row's edge is the one strip in this yard built around the fact that people and a forty-tonne machine are sharing the same eighteen feet of pavement.",
    },
    {
      id: "ground-check", kind: "hold", target: "ground-probe", seconds: 4,
      title: "Prove the plug's ground before it goes in",
      cue: "Hold the continuity tester on the plug's ground pin until it reads made.",
      why: "A reefer chassis with a fault already sitting in it is safe right up until somebody's hand becomes the path to ground it finds — testing that pin on every plug, every time, is what stands between a hot chassis and the mechanic who is about to grab it with both hands.",
      holdBreakNote: "Let go before the tester settled — the reading was still climbing. Hold it on the pin until it reads made.",
    },
    {
      id: "plug-lock", kind: "turn", target: "reefer-plug",
      title: "Seat and lock the plug",
      cue: "Land the plug in the receptacle and turn the collar home to the locked position.",
      why: "A reefer plug that is pushed in but never turned home can still carry current on a blade resting loose against its contact, arcing and heating right where the next pair of hands goes to unplug it — the twist-lock is what actually clamps the blades against the receptacle instead of leaving them sitting on it.",
      turn: { turns: 0.6, axis: "y", label: "PLUG LOCK" },
    },
    {
      id: "setpoint", kind: "gauge", target: "setpoint-dial",
      title: "Set the controller to the manifest's set point",
      cue: "Dial the unit's set point to match the manifest and commit inside the band.",
      why: "The set point is the one number this box's entire cargo depends on for the rest of the voyage, and it is set from the manifest every time — never left on whatever the last commodity in this unit needed, because a set point that is merely close still cooks or freezes a load it was never dialed to hold.",
      gauge: { label: "SET POINT", speed: 0.55, green: [0.27, 0.33], readout: (t) => `${Math.round(-30 + t * 40)} °C`, missNote: "Off the manifest's set point — reset and dial it to the figure on the manifest, not close to it." },
    },
    {
      id: "return-air", kind: "track", target: "return-air-display", seconds: 5,
      title: "Track the return air against the manifest's band",
      cue: "Watch the return-air reading settle inside the manifest's band as the unit cycles, and hold it there.",
      track: { start: 0.05, green: [0.3, 0.46], rise: 0.5, fall: 0.45, drift: 0.12, label: "RETURN AIR", readout: (v) => (v < 0.3 ? "still pulling down" : v > 0.46 ? "not holding the set point" : "in the manifest's band") },
      why: "The set point is what the controller is told to hold; the return air is the actual temperature of the air coming back off the cargo, and a unit can be dialed exactly right and still be failing to hold it. Watching the return air settle into the manifest's band is the only way to know the box is doing what the dial says it should, rather than just what it was told to do.",
      holdBreakNote: "Return air drifted out of the manifest's band — bring it back and hold it there before moving on.",
    },
    {
      id: "row-alarm", kind: "find", noHint: true,
      targets: ["unit-alarming"],
      itemNames: { "unit-alarming": "reefer unit alarming on high temperature" },
      itemNotes: { "unit-alarming": "Three units down, the alarm light is lit red and steady — this unit's discharge has climbed well past its set point." },
      title: "Walk the row for alarms",
      cue: "Check every unit's status light on the way down the row and click the one alarming.",
      why: "An alarm on a reefer unit is not a nuisance light — in a yard this size it is the one signal that one specific box, out of hundreds sitting exactly alike, has already drifted off the temperature its cargo is paying to be held at, and it stops meaning anything the moment it goes unnoticed until the next scheduled walk.",
    },
    {
      id: "investigate-alarm", kind: "select", target: "alarm-panel",
      title: "Read the discharge temperature before silencing",
      cue: "Check the alarming unit's discharge reading and log what it says before silencing the local alarm.",
      why: "Silencing an alarm without reading what set it off throws away the one number that tells the next mechanic, or the terminal's monitoring desk, how far this unit had actually drifted and for how long — a quiet panel afterward looks exactly the same whether the drift was caught in its first ten minutes or its first six hours.",
    },
    {
      id: "leak-sweep", kind: "hold", target: "gas-detector", seconds: 4,
      title: "Sweep the detector along the coil door",
      cue: "Hold the refrigerant detector along the seam of the next unit's coil access door.",
      why: "Refrigerant shows up in a detector's reading long before it shows up as a smell over diesel exhaust and box fans, and a leak in a working reefer row never announces itself until the sweep is actually run along the seam it is escaping from — waiting to notice a smell means waiting until there is a great deal more of it out than there was when the sweep would have caught it.",
      holdBreakNote: "Detector pulled away before the sweep finished — run it the full length of the seam, not partway.",
    },
    {
      id: "leak-confirm", kind: "find", noHint: true,
      targets: ["leak-fitting"],
      itemNames: { "leak-fitting": "leaking fitting on the coil" },
      itemNotes: { "leak-fitting": "The detector spikes right at this fitting — that is where the refrigerant is escaping." },
      title: "Find the fitting the detector is reading",
      cue: "Follow the rising reading to the fitting it is coming from and click it.",
      why: "A detector reading high somewhere along a coil door only proves refrigerant is present in that air, not which of a dozen fittings behind the panel is the actual source — following the reading to where it peaks is what turns 'there is a leak in here somewhere' into the one joint that needs the wrench.",
    },
    {
      id: "isolate-box", kind: "sequence",
      targets: ["unit-breaker-off", "tag-out", "exclusion-cones"],
      itemNames: { "unit-breaker-off": "unit's breaker opened", "tag-out": "unit tagged out", "exclusion-cones": "exclusion cones set around the box" },
      title: "De-energize and isolate the leaking box",
      cue: "Open the unit's breaker, tag it out, then cone off the box so nobody works near it.",
      why: "A leaking coil stays a slow refrigerant leak right up until somebody re-energizes the compressor trying to chase the box back onto temperature, which is exactly what turns a fitting weeping refrigerant into one back under full system pressure — the breaker comes open and stays tagged before anything else, and the cones are what keep the next mechanic walking the row from reaching for a unit that already has a name on the tag.",
      outOfOrderNote: "Breaker open, then the tag, then the cones — a tag has nothing to hold against on a box still taking power, and cones mean nothing around a unit somebody could still switch back on.",
    },
    {
      id: "log", kind: "select", target: "log-board",
      title: "Log the row",
      cue: "Record the set point confirmed, the alarm found and cleared, and the leak isolated for the next shift.",
      why: "The mechanic who reads this log at the start of the next shift was not standing in this row tonight — the log is the only way they learn that one specific box is sitting de-energized on a tag rather than finding out, from the outside, that it looks exactly like every other quiet unit in the row.",
    },
  ],

  interrupts: [
    {
      id: "stacker-between-boxes",
      kind: "Reach stacker entering the row",
      after: "ground-check", delay: 4, seconds: 12,
      alert: "A reach stacker has turned into the row and is working down it toward your position, its boom swinging a box into the stack two bays up.",
      cue: "You're down between two boxes with your back to the lane. Get to the marked walk lane before it reaches this bay.",
      target: "lane-marker",
      why: "A reach stacker operator is watching the box on the end of the boom, not the gap between two containers at ground level where a mechanic is crouched with a tester in hand — stepping clear to the marked lane the moment one turns into the row is the only way you become a shape the driver is looking for, instead of one they had no reason to expect between the stacks.",
      missNote: "The stacker worked two more bays down the row before anyone reached the lane. Its mirrors never showed the gap between the boxes where a mechanic was crouched with a tester in hand.",
      wrongNote: "It's the marked walk lane. A stacker working down the row is answered by getting into the space it isn't driving through, not by finishing the job you were in the middle of.",
    },
    {
      id: "compressor-trip",
      kind: "Compressor trip behind you",
      after: "return-air", delay: 3, seconds: 12,
      alert: "Behind you, the unit you just set now shows its compressor breaker tripped and its alarm light already climbing to amber.",
      cue: "That's the box you just walked away from. Get back on it before the load inside starts warming for real.",
      target: "compressor-trip-panel",
      why: "A compressor that trips seconds after you have moved on is not a coincidence to write off on the way to the next unit — it is the reading you just confirmed telling you the unit was already working right at the edge of what it could hold, and the cargo inside starts warming again from the second the compressor stops, whether or not anyone is still standing there to notice.",
      missNote: "By the time anyone circled back, the compressor had been off long enough that the return air had already climbed two full degrees off the set point that had just been confirmed.",
      wrongNote: "It's the tripped breaker on the unit you just left. Nothing else on this row explains a compressor going out the moment your back is turned.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, RYM_ACCENT);

    // ------------------------------------------------------------- yard deck
    const pavingTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { base: "#171e24", base2: "#12181d" }), { repeat: 6, px: 256 });
    const deckMesh = box(g, 6.0, 0.1, 5.6, 0, 0.05, -0.3, 0xffffff, { rough: 0.85, metal: 0.15 });
    deckMesh.material = texturedMat(pavingTex, { rough: 0.85, metal: 0.1, color: 0x8f979d });

    // Painted travel lane down the centre of the row (reach-stacker path).
    const laneTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a2a1c", base2: "#2c2014" }), { repeat: 5, px: 192 });
    const laneMesh = box(g, 6.0, 0.005, 1.0, 0, 0.106, -0.35, 0xffffff, { rough: 0.7, metal: 0.1, cast: false });
    laneMesh.material = texturedMat(laneTex, { rough: 0.7, metal: 0.05, color: 0xb08a3f });
    for (const sz of [-0.85, 0.15]) box(g, 6.0, 0.008, 0.03, 0, 0.111, sz, 0xf2c14b, { rough: 0.6, cast: false });

    // Pedestrian walk lane at the near edge, marked and posted.
    const laneMarker = group(g, -2.3, 0, 0.6, 0.3);
    cyl(laneMarker, 0.02, 0.024, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const laneFlag = box(laneMarker, 0.16, 0.11, 0.012, 0.09, 0.82, 0, RYM_ACCENT, { rough: 0.6 });
    holoTag(laneMarker, "walk lane — keep off the travel lane", 0, 1.0, 0, { css: "#5fc9dd", w: 0.52 });
    reg(hits, laneMarker, "lane-marker");
    const crossLaneHit = box(g, 0.3, 0.2, 0.5, 0, 0.2, -0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cut through the travel lane?", 0, 0.42, -0.35, { css: "#d2312b", w: 0.44 });
    reg(hits, crossLaneHit, "cross-travel-lane");
    void laneFlag;

    // ------------------------------------------------------------ reefer row
    // Five units along the far side of the travel lane: unit-a (worked on),
    // unit-b and unit-d (quiet dressing), unit-c (alarming), unit-e (leaking).
    const unitZ = -1.35;
    const unitX = { a: -2.1, b: -1.05, c: 0, d: 1.05, e: 2.1 };
    const unitColour = 0xd8dee2;
    function reeferUnit(x, opts = {}) {
      const u = group(g, x, 0, unitZ);
      box(u, 0.9, 0.9, 0.5, 0, 0.55, 0, unitColour, { rough: 0.55, metal: 0.2 });
      box(u, 0.86, 0.86, 0.06, 0, 0.55, 0.28, 0x2b3138, { rough: 0.6, metal: 0.3 }); // machinery face
      for (const fx of [-0.24, 0.24]) {
        cyl(u, 0.16, 0.16, 0.03, fx, 0.68, 0.32, 0x14171a, { rough: 0.7, seg: 16 }).rotation.x = Math.PI / 2;
        cyl(u, 0.05, 0.05, 0.035, fx, 0.68, 0.335, 0x8b949d, { rough: 0.4, metal: 0.6, seg: 8 }).rotation.x = Math.PI / 2;
      }
      const lamp = ball(u, 0.02, 0, 0.98, 0.3, opts.lamp ?? CITY.good, { emissive: opts.lamp ?? CITY.good, ei: 1.6, seg: 10 });
      for (const cx of [-0.4, 0.4]) for (const cz of [-0.2, 0.2]) box(u, 0.03, 0.9, 0.03, cx, 0.55, cz, 0x9aa3ab, { rough: 0.6, metal: 0.5 });
      return { u, lamp };
    }
    reeferUnit(unitX.a);
    reeferUnit(unitX.b);
    const unitC = reeferUnit(unitX.c, { lamp: 0xd2312b });
    reeferUnit(unitX.d);
    const unitE = reeferUnit(unitX.e);

    // Unit-a: the plug, ground probe, set-point dial and return-air display.
    const groundProbe = instrument(g, unitX.a - 0.35, 0.5, -0.9, { ry: 0.5, idle: "-- Ω", color: 0x5fc9dd, w: 0.11, d: 0.17 });
    holoTag(groundProbe, "ground pin — hold to prove", 0, 0.16, 0, { css: "#5fc9dd", w: 0.5 });
    reg(hits, groundProbe, "ground-probe");
    const receptacle = group(g, unitX.a, 0.5, -1.02);
    box(receptacle, 0.14, 0.16, 0.06, 0, 0, 0, 0x22262b, { rough: 0.6, metal: 0.4 });
    const plugCollar = cyl(receptacle, 0.05, 0.05, 0.05, 0, 0, 0.05, 0xe8b02e, { rough: 0.4, metal: 0.6, seg: 14 });
    for (const px of [-0.02, 0.02]) cyl(receptacle, 0.008, 0.008, 0.06, px, 0, 0.09, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 }).rotation.x = Math.PI / 2;
    holoTag(receptacle, "reefer plug — turn to lock", 0, 0.16, 0, { css: "#5fc9dd", w: 0.5 });
    reg(hits, plugCollar, "reefer-plug");
    const skipGroundHit = box(g, 0.2, 0.2, 0.2, unitX.a + 0.35, 0.6, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "plug it in now, untested?", unitX.a + 0.35, 0.82, -0.9, { css: "#d2312b", w: 0.4 });
    reg(hits, skipGroundHit, "skip-ground");
    const setpointDial = instrument(g, unitX.a - 0.2, 0.9, -1.05, { ry: 0.2, idle: "-- °C", color: 0x5fc9dd, w: 0.13, d: 0.19 });
    holoTag(setpointDial, "set point", 0, 0.16, 0, { css: "#5fc9dd", w: 0.28 });
    reg(hits, setpointDial, "setpoint-dial");
    const returnAirDisplay = instrument(g, unitX.a + 0.2, 0.9, -1.05, { ry: -0.2, idle: "-- °C", color: 0x5fc9dd, w: 0.13, d: 0.19 });
    holoTag(returnAirDisplay, "return air", 0, 0.16, 0, { css: "#5fc9dd", w: 0.32 });
    reg(hits, returnAirDisplay, "return-air-display");
    const tripLamp = ball(g, 0.035, unitX.a, 0.72, -1.06, 0x2b1414, { emissive: 0x000000, ei: 0, seg: 12 });
    reg(hits, tripLamp, "compressor-trip-panel");

    // Unit-c: the alarm panel (distinct hit from the flashing lamp itself).
    const alarmPanel = instrument(g, unitX.c + 0.28, 0.5, -0.98, { ry: -0.3, idle: "ALARM", color: 0xd2312b, w: 0.13, d: 0.19 });
    holoTag(alarmPanel, "discharge — read before silencing", 0, 0.16, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, alarmPanel, "alarm-panel");
    reg(hits, unitC.lamp, "unit-alarming");
    const silenceHit = box(g, 0.18, 0.18, 0.18, unitX.c - 0.28, 0.72, -0.98, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "silence it now?", unitX.c - 0.28, 0.9, -0.98, { css: "#d2312b", w: 0.32 });
    reg(hits, silenceHit, "silence-without-read");

    // Unit-e: coil access door, the detector sweep, and the leaking fitting.
    const coilDoor = box(unitE.u, 0.5, 0.5, 0.02, 0, 0.55, 0.31, 0x3c444c, { rough: 0.5, metal: 0.4 });
    holoTag(coilDoor, "coil access door", 0, 0.32, 0, { css: "#5fc9dd", w: 0.34 });
    const detector = instrument(g, unitX.e - 0.4, 0.55, -0.95, { ry: 0.5, idle: "-- ppm", color: 0x5fc9dd, w: 0.11, d: 0.17 });
    holoTag(detector, "detector — sweep the seam", 0, 0.16, 0, { css: "#5fc9dd", w: 0.46 });
    reg(hits, detector, "gas-detector");
    const leakFitting = cyl(unitE.u, 0.025, 0.025, 0.05, 0.12, 0.55, 0.32, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 10 });
    reg(hits, leakFitting, "leak-fitting");
    const leakMist = particles(unitE.u, 10, 0x9fd6ee, { size: 0.015, life: 0.5, additive: false, opacity: 0.45 });
    leakMist.position.set(0.12, 0.6, 0.34);
    const openDoorHit = box(g, 0.2, 0.2, 0.2, unitX.e + 0.35, 0.55, -0.98, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "open the door now, untested?", unitX.e + 0.35, 0.77, -0.98, { css: "#d2312b", w: 0.46 });
    reg(hits, openDoorHit, "open-door-untested");
    const unitBreaker = box(unitE.u, 0.1, 0.14, 0.04, -0.2, 0.42, 0.31, 0xe8b02e, { rough: 0.5 });
    reg(hits, unitBreaker, "unit-breaker-off");
    const tagOut = group(unitE.u, -0.2, 0.6, 0.32);
    box(tagOut, 0.09, 0.12, 0.006, 0, 0, 0, 0xf4e9d8, { rough: 0.6 });
    holoTag(tagOut, "tag it out", 0, 0.12, 0, { css: "#d2312b", w: 0.24 });
    reg(hits, tagOut, "tag-out");
    const excCones = group(g, unitX.e, 0, -0.55);
    cone(excCones, -0.5, 0.1); cone(excCones, 0.5, 0.1); cone(excCones, 0, 0.45);
    reg(hits, excCones, "exclusion-cones");

    // ------------------------------------------------------------ paperwork
    const chest = toolChest(g, 2.5, 1.0, { ry: -0.6, color: 0x2f6f7f });
    const hiVis = box(chest, 0.22, 0.1, 0.1, 0, 0.9, -0.1, 0xf2c14b, { rough: 0.85 });
    holoTag(hiVis, "high-vis vest", 0, 0.12, 0, { css: "#5fc9dd", w: 0.24 });
    reg(hits, hiVis, "hi-vis-vest");
    const radio = box(chest, 0.07, 0.16, 0.04, 0.14, 0.85, 0.06, 0x1b1e23, { rough: 0.6 });
    holoTag(radio, "radio — check in with yard control", 0, 0.14, 0, { css: "#5fc9dd", w: 0.5 });
    reg(hits, radio, "radio-checkin");
    const manifest = holoPanel(g, 0.92, 0.6, 2.4, 1.55, 0.2, (cx, w, h) => {
      cx.fillStyle = "#081a20"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5fc9dd"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcf3f8"; cx.fillText("REEFER MANIFEST — ROW 14", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`; cx.fillStyle = "#eaf9fc";
      ["Box RYMU 4471803 — frozen produce", "Set point: -18 °C, band ± 1 °C", "Return air: check against set point", "Walk lane at row edge — stacker path is centre", "Any alarm: read discharge before silencing"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.12)));
    }, { ry: -0.5, accent: RYM_ACCENT });
    reg(hits, manifest, "manifest-board");
    const logBoard = holoPanel(g, 0.8, 0.5, 2.4, 1.5, 1.1, (cx, w, h) => {
      cx.fillStyle = "#081a20"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5fc9dd"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcf3f8"; cx.fillText("ROW LOG", w / 2, h * 0.22);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf9fc";
      cx.fillText("Set point / alarm / leak / actions", w / 2, h * 0.55);
      cx.fillText("Mechanic: ______", w / 2, h * 0.78);
    }, { ry: -0.7, accent: RYM_ACCENT });
    reg(hits, logBoard, "log-board");

    // ---------------------------------------------------------- reach stacker
    const stacker = group(g, -3.6, 0, -0.35, 1.5);
    box(stacker, 1.5, 0.55, 0.9, 0, 0.42, 0, 0x3a7ca5, { rough: 0.55, metal: 0.35 });
    for (const wx of [-0.55, 0.55]) for (const wz of [-0.4, 0.4]) cyl(stacker, 0.16, 0.16, 0.12, wx, 0.16, wz, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
    const cab = box(stacker, 0.4, 0.4, 0.4, 0.35, 0.9, 0, 0xdfe4e8, { rough: 0.4, metal: 0.2 });
    void cab;
    const boom = group(stacker, -0.2, 0.7, 0, -0.15);
    box(boom, 1.8, 0.14, 0.14, 1.1, 0, 0, 0x3a7ca5, { rough: 0.5, metal: 0.3 });
    const spreaderHead = box(boom, 0.5, 0.1, 0.6, 2.1, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    void spreaderHead;
    const beacon = ball(stacker, 0.04, 0.35, 1.12, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.5, seg: 10 });
    void beacon;

    // Second mechanic dressing the row, well clear of every control.
    standingFigure(g, 2.9, 1.9, { ry: -2.4, cloth: 0x1f3a52, vest: 0xf2c14b, helmet: 0x1b1e22 });

    // Quiet background stacks beyond the row for yard depth.
    for (const [bx, bz] of [[-2.2, -2.3], [-0.6, -2.35], [1.0, -2.3], [2.4, -2.35]]) {
      box(g, 0.85, 0.42, 0.46, bx, 0.31, bz, 0xcfd6da, { rough: 0.6, metal: 0.15 });
      box(g, 0.85, 0.42, 0.46, bx, 0.75, bz, 0xb7c3c8, { rough: 0.6, metal: 0.15 });
    }

    const alarmHomeMat = alarmPanel.userData.screen.material;
    const alarmLitMat = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.4, rough: 0.4 });
    void alarmHomeMat; void alarmLitMat;
    const stackerHomeX = stacker.position.x;
    const tripHomeEmissive = tripLamp.material;
    const tripAlertMat = mat(0xff5f4a, { emissive: 0xff5f4a, ei: 2.0, rough: 0.4, seg: 12 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.6, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "row-alarm") repaint(alarmPanel.userData.screen, signFace("140 °F", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffd9d9", scale: 0.55 }));
        if (step.id === "leak-sweep") repaint(detector.userData.screen, signFace("RISING", { bg: "#2a1c0d", accent: "#f2ae14", fg: "#ffe9b0", scale: 0.5 }));
        if (step.id === "leak-confirm") leakMist.visible = false;
      },
      onHazard() {},
      // Both interruptions change the scene the instant they fire — the
      // stacker really rolls down the lane, and the tripped unit really lights
      // its lamp red — not only once animate() next ticks.
      onInterrupt(it) {
        if (it.id === "stacker-between-boxes") stacker.position.x = stackerHomeX + 1.4;
        if (it.id === "compressor-trip") tripLamp.material = tripAlertMat;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "stacker-between-boxes") stacker.position.x = stackerHomeX;
        if (it.id === "compressor-trip") tripLamp.material = tripHomeEmissive;
      },
      animate(t, dt, session) {
        leakMist.visible && leakMist.userData.step(dt, new THREE.Vector3(0, 0.02, 0.01), 0.03, 0.25, -0.6);
        const step = session?.step;
        if (session?.turn && step?.id === "plug-lock") plugCollar.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "setpoint") repaint(setpointDial.userData.screen, signFace(`${Math.round(-30 + gg.t * 40)} °C`, { bg: "#08161e", accent: gg.t >= 0.27 && gg.t <= 0.33 ? "#59c97b" : "#f2ae14", fg: "#eaf6fb", scale: 0.6 }));
        if (step?.id === "return-air" && session.track) repaint(returnAirDisplay.userData.screen, signFace(`${Math.round(-30 + session.track.v * 40)} °C`, { bg: "#08161e", accent: session.track.v >= 0.3 && session.track.v <= 0.46 ? "#59c97b" : "#f2ae14", fg: "#eaf6fb", scale: 0.6 }));
        if (session?.holding && step?.id === "ground-check") repaint(groundProbe.userData.screen, signFace(`${Math.min(9.9, ((session.holdFor ?? 0) * 2.2)).toFixed(1)} Ω`, { bg: "#08161e", accent: "#59c97b", fg: "#eaf6fb", scale: 0.6 }));
        if (session?.holding && step?.id === "leak-sweep") repaint(detector.userData.screen, signFace(`${Math.round((session.holdFor ?? 0) * 60)} ppm`, { bg: "#08161e", accent: "#f2ae14", fg: "#eaf6fb", scale: 0.6 }));
      },
    };
  },
};
