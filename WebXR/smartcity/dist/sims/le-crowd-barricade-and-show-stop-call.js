import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat, barrierPanel } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument,
  standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { generatorTrailer, lightTower } from "../../../shared/equipment.js";

// SmartCiti.X~ Crowd Barricade & Show-Stop Call VR — Entertainment & Live
// Events, the live events block.
//
// The front-of-house barricade line before doors: a run of mixed steel
// barrier locked section to section, a light tower and generator powering
// the FOH position, and the mixed zone gap between the rail and the stage
// lip. The learner is the IATSE stagehand running the barricade who builds
// the line, powers the position, briefs the show-stop call with security,
// and works the rail through the opening rush — with a load spike at the
// rail and a crowd member pulled over it both needing an answer that is not
// the control they were just using. The venue and the show are generic.

const CBL_ACCENT = 0xc58cff;
const CBL_CSS = "#c58cff";

export const SIM_LE_CROWD_BARRICADE_AND_SHOW_STOP_CALL = {
  id: "le-crowd-barricade-and-show-stop-call",
  index: "319",
  domain: "Entertainment & Live Events",
  trade: "IATSE stagehand running the front-of-house barricade line, with the show-stop call in the security chain",
  category: "Entertainment & Live Events",
  indoor: "theatre",
  certification: "IATSE training trust; ANSI E1.6 entertainment technology powered systems for the flown FOH speaker array over the line; NFPA 101 Life Safety Code for the mixed zone and egress width; OSHA 29 CFR 1910.28 duty to have fall protection on the barricade riser; ANSI/ISEA 107 high-visibility apparel for the barricade crew",
  name: "Crowd Barricade & Show-Stop Call",
  title: simTitle("Crowd Barricade & Show-Stop Call"),
  tagline: "The rail before doors: the site security plan read for capacity and the show-stop chain, hi-vis and headset on, a bent coupling pin caught before it locks, the spare section rolled into the gap and pinned home, the mixed zone gauged against the plan's minimum, the light tower's outriggers down before the mast goes up, the generator started and held to catch, the show-stop signal briefed with security, the rail held through the opening rush as the load gauge spikes, a medical lane cleared and opened for someone pulled over the rail, and the shift logged",
  accent: CBL_ACCENT,
  accentCss: CBL_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "line-held-call-made", name: "Line Held, Call Made", note: "The barricade pinned and gauged to the plan, the show-stop chain briefed before doors, the load spike answered and the medical lane opened without a shortcut" },

  supportLine: "your IATSE local's member assistance contact, or the employee assistance programme your employer or the local carries",

  game: system({
    name: "Barricade Line",
    currency: "POINT",
    ranks: ["Line Hand", "Barricade Crew", "Barricade Lead", "FOH Security Liaison", "Arena Rigging Certified"],
    badges: [
      { id: "pinned-clean", name: "Pinned Clean", note: "Every coupling pin locked home, no shortcut", test: AWARD.stepClean("pin-lock") },
      { id: "line-held", name: "Line Held", note: "The rail held steady through the load spike", test: AWARD.unbroken },
      { id: "never-a-shortcut", name: "Never a Shortcut", note: "Never an unrated clip, never over the rail, never the medical lane blocked", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-build", name: "Clean Build", note: "No corrections building or running the line", test: AWARD.clean },
      { id: "gap-on-the-plan", name: "Gap On The Plan", note: "Mixed zone gap committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "doors-on-time", name: "Doors On Time", note: "Shift logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unrated-barricade-clip": "You reached for the loose bent clip from the bottom of the hardware bag to lock a barricade section. A barricade's coupling pin is sized and rated to hold two sections together against a crowd leaning on the rail, and a bent clip that happens to fit the hole is not the same part — it is a piece of metal that looks right until several hundred people lean on it at once. Only the rated pin locks a section.",
    "climb-barricade-shortcut": "You climbed over the locked barricade line instead of walking to the gate. The line is locked section to section specifically so it reads as one continuous barrier to a crowd under pressure, and a crew member who climbs it teaches everyone watching that it can be climbed — which is exactly the behaviour the barricade exists to prevent once the house is full.",
    "genset-fuel-while-running": "You went to refuel the generator with it still running. A generator's exhaust and alternator are both hot and both live while it runs, and diesel poured near either one is a fire next to the position that is powering the whole FOH rail and its lighting. The generator is shut down, and given time to cool, before the cap comes off.",
    "block-medical-lane": "You stacked empty road cases in the medical and evacuation lane at the barricade gate. That lane is the one path wide enough for a stretcher or a wheelchair between the rail and the exit, kept clear for exactly the reason it has a name — and gear stacked in it during the show is gear a medical team is climbing over on the night it matters.",
  },

  lateNotes: {
    "pin-lock-point": "The pin locks home once the spare section is butted square against the run at the gap — there is nothing to lock yet.",
    "genset-start-switch": "The generator starts once the light tower's outriggers are down and the mast is still stowed — not before.",
    "shift-log": "The shift is logged once the rail is stood down after the show and the gate is latched — the log is last.",
  },

  steps: [
    {
      id: "site-security-plan", kind: "select", target: "site-security-plan",
      title: "Read the site security plan: capacity, barricade layout and the show-stop chain",
      cue: "Read the plan: the barricade layout and the mixed zone width, the venue's capacity, the medical post location, and who calls a show stop and how it reaches the stage.",
      why: "A barricade line only works if it matches the plan it was designed against — the mixed zone width, the capacity the venue is licensed for, and where the medical post sits relative to the gate. The show-stop chain is the other half of the plan: who has the authority to call it, what radio channel carries it, and how it reaches the stage manager fast enough to matter, and it has to be read before doors rather than worked out live during the one night it is needed.",
    },
    {
      id: "barricade-ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "headset"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "headset": "production headset" },
      title: "Hi-vis vest and headset on before the line goes up",
      cue: "Hi-vis vest on so security and the crowd both see the barricade crew clearly, and the production headset on before any radio call matters.",
      why: "A barricade crew works in front of a crowd all night, and a hi-vis vest is what lets security find the right person to signal in a packed room where a raised hand is easy to lose. The headset goes on before the line is built because the first call that matters — a bent pin, a gate that will not latch — can happen during setup, and a crew member without a live headset is a crew member security cannot reach.",
    },
    {
      id: "pin-inspect", kind: "find", noHint: true,
      targets: ["bent-coupling-pin"],
      itemNames: { "bent-coupling-pin": "bent coupling pin on the next barricade section" },
      itemNotes: { "bent-coupling-pin": "The coupling pin on the next section in the stack is visibly bent — it will start in the hole but will not seat home, and a pin that is not seated lets that joint open under a crowd's lean. It is set aside and a straight pin is pulled from the spares box." },
      title: "Inspect the barricade section and its coupling pin before it goes in the line",
      cue: "Check the next section's frame for bends or cracks and its coupling pin for straightness before rolling it into the gap.",
      why: "A barricade line is only as strong as its weakest joint, and a bent pin is the kind of fault that looks fine leaning against the truck and only shows itself once a crowd is pushing on the rail it was supposed to lock. Checking the pin on the ground, before the section is in the line and dressed with cable, is the only point where swapping it costs nothing.",
    },
    {
      id: "barricade-drag", kind: "drag", target: "spare-section",
      title: "Roll the spare section into the gap and butt it square",
      cue: "Roll the spare section in and butt its frame square against the end of the line at the gap.",
      why: "A barricade line reads as one continuous rail to the crowd only if its sections sit flush; a section rolled in at an angle leaves a gap at floor level wide enough for a foot or a hand, and it loads one side of the coupling pin instead of both. Squaring it up on the ground, where it is easy to see and correct, is what makes the next step — pinning it — actually lock something straight.",
      drag: { to: "line-gap", radius: 0.5, missNote: "Not squared at the gap — the section's frame has to butt flush against the run's end before any pin goes in." },
    },
    {
      id: "pin-lock", kind: "turn", target: "pin-lock-point",
      title: "Lock the coupling pin home",
      cue: "Turn the coupling pin's locking collar until it seats fully home on the new section.",
      why: "A barricade's coupling pin only does its job seated all the way home; a pin resting partway in the hole holds the sections together for as long as nobody leans on the joint, which is not the situation a barricade exists for. Turning it to its stop, and checking it by hand, is what makes the line one piece instead of a row of sections standing near each other.",
      turn: { turns: 1.0, label: "PIN", readout: (t) => (t < 0.35 ? "seating" : t < 0.9 ? "running home" : "locked") },
    },
    {
      id: "mixed-zone-gauge", kind: "gauge", target: "mixed-zone-gauge",
      title: "Measure the mixed zone against the plan's minimum",
      cue: "Measure the gap between the barricade rail and the stage lip and commit it against the plan's minimum width for the mixed zone.",
      why: "The mixed zone is the strip between the rail and the stage where photographers, security and the crew all have to move, and the plan sets its minimum width for exactly that reason — a zone pinched narrower than the plan traps the people working in it against a moving crowd on one side and the stage on the other. Measuring it after the line is built, rather than trusting where the sections happened to land, is what catches a barricade that crept forward during the build.",
      gauge: { label: "MIXED ZONE", speed: 0.65, green: [0.4, 0.58], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Not on the plan's minimum — measure the gap at the narrowest point along the line, not at the gate where it is widest." },
    },
    {
      id: "tower-outriggers", kind: "select", target: "tower-outriggers",
      title: "Deploy the light tower's outriggers before the mast goes up",
      cue: "Set the light tower's outriggers down and level before raising the mast.",
      why: "A light tower's mast raises its lamps and ballast several metres above a base that is otherwise no wider than the trailer underneath it, and the outriggers are what turns that base into something a raised mast cannot tip off of. Deploying them before the mast moves, not after, is the same order every piece of equipment in this rig is set up in: the thing that keeps it standing goes down first.",
    },
    {
      id: "genset-start", kind: "hold", target: "genset-start-switch", seconds: 5,
      title: "Start the generator and hold it to catch",
      cue: "Hold the generator's start switch until the engine catches and settles to a steady idle.",
      why: "A generator that is released from its start switch before the engine has actually caught can crank down its battery over several short attempts, leaving the FOH position without power at the one moment doors are about to open. Holding the switch through the catch, watching the engine settle rather than assuming the first turnover worked, is what makes the generator a power source instead of a maybe.",
      holdBreakNote: "You let go of the start switch before the engine caught — it died on the crank. Hold it again through the full start.",
    },
    {
      id: "showstop-briefing", kind: "select", target: "showstop-briefing",
      title: "Brief the show-stop signal and chain with security",
      cue: "Walk security through the show-stop hand signal, the radio call and who it reaches on the production side, before doors.",
      why: "A show stop is a call that has to work the one time it is needed without anyone stopping to remember the procedure, and that only happens if the barricade crew and security agree on the signal and the radio channel before the room is full and loud. Briefing it now, at the rail, in daylight, is what makes the call reflexive rather than improvised in the ten seconds it actually has to happen in.",
    },
    {
      id: "crush-watch", kind: "track", target: "load-gauge",
      seconds: 6,
      title: "Hold the rail through the opening rush, watching the load gauge",
      cue: "Hold your position at the rail as the crowd pushes forward for the opening number, watching the barricade's load gauge stay in the safe band.",
      why: "The opening number is when a crowd pushes hardest on the rail, and the barricade's own load gauge is the one instrument that reads that pressure directly rather than by eye across a dark room. Standing at the rail with eyes on the gauge, rather than on the stage, is how the crew catches a load climbing toward the line's limit early enough to call for help before the gauge is the only thing anyone is watching.",
      track: { start: 0.3, green: [0.35, 0.6], rise: 0.55, fall: 0.4, drift: 0.16, label: "RAIL LOAD", readout: (v) => (v < 0.35 ? "light" : v > 0.6 ? "heavy — call it" : "in band") },
      holdBreakNote: "The load ran past the safe band while you were watching the stage instead of the gauge — that is the exact moment a show-stop call is for.",
    },
    {
      id: "medical-lane", kind: "sequence", anyOrder: true,
      targets: ["case-cleared", "lane-cone"],
      itemNames: { "case-cleared": "road cases cleared from the lane", "lane-cone": "lane marked with cones" },
      title: "Clear and mark the medical and evacuation lane",
      cue: "Clear any gear out of the lane beside the barricade gate and mark it with cones so it stays open all night.",
      why: "The medical lane exists for the one call nobody wants to make, and it only works if it is actually clear when that call comes — a road case parked in it during setup is a road case still there at eleven at night when a medical team needs the path. Marking it with cones after clearing it is what keeps the next crew member walking through from putting something back in it.",
    },
    {
      id: "showstop-checkin", kind: "select", target: "production-radio",
      title: "Check in with the stage manager and security lead",
      cue: "Call the stage manager that the line is pinned, powered and gauged, and check in with security after the load spike.",
      why: "The stage manager's own show-stop authority depends on knowing the barricade is actually ready before doors, so the call has to be accurate rather than assumed. It is also the crew's own check-in: a load spike at the rail is the kind of near miss that stays with the person who watched the gauge climb, and IATSE's practice is to name it on the radio along with the member assistance line, not carry it home unsaid.",
    },
    {
      id: "shift-log", kind: "select", target: "shift-log",
      title: "Log the line, the pin and the generator",
      cue: "Record the bent pin swapped, the mixed zone reading, the load spike and how it was answered, and the generator's running hours.",
      why: "The shift log is what the next crew reads before they build the same line tomorrow night, and a bent pin that is not written down is a bent pin someone else finds by hand again. A load spike that reached the safe band's edge and was answered is exactly the kind of near miss the log exists to carry forward, so the next barricade lead knows which section of tonight's crowd pushed hardest.",
    },
  ],

  interrupts: [
    {
      id: "barricade-load-spike",
      kind: "Load spike at the rail during the opening rush",
      after: "crush-watch", delay: 2, seconds: 12,
      alert: "The barricade's load gauge has jumped hard past the safe band — the crowd has surged forward for the opening number and the rail is taking more than it is rated for.",
      cue: "Call the show stop on the production radio — security and the stage manager both need it now, not the load gauge you were just reading.",
      target: "production-radio",
      why: "A load spike this far past the safe band is the exact situation the show-stop chain was briefed for, and the radio is what actually reaches the stage manager and security in time to ease the crowd back — watching the gauge climb further does nothing for the people leaning on the rail. The call goes the moment the spike is seen, not after it is confirmed to keep climbing.",
      missNote: "The load kept climbing past the safe band with nobody calling it; the rail bowed at the centre section before security worked their way to the front on their own and eased the crowd back.",
      wrongNote: "The production radio — the load gauge only tells you there is a problem, and the radio is what gets help to the rail.",
    },
    {
      id: "person-pulled-over-rail",
      kind: "Crowd member pulled over the barricade",
      after: "medical-lane", delay: 2, seconds: 12,
      alert: "Security has pulled a crowd member over the barricade who is not moving well on their own — they need the medical lane open now.",
      cue: "Open the medical gate — the lane behind it has to be clear and moving, not the barricade line you were just working.",
      target: "medical-gate",
      why: "A person pulled over the rail in distress needs a clear path to the medical post immediately, and the gate is the one piece of the barricade built to open for exactly that reason — everything else about the line is built to stay locked. Opening it fast, because the lane behind it was kept clear earlier in the shift, is the entire reason that lane was cleared in the first place.",
      missNote: "The gate stayed shut while security looked for the crew member holding it; the patient was passed hand to hand over the locked rail instead of through it.",
      wrongNote: "The medical gate — the barricade line itself has to stay locked, and the gate is the one section built to open on this call.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CBL_ACCENT);

    // ------------------------------------------------------------ the floor
    const floor = box(g, 6.4, 0.05, 5.2, 0, 0.025, 0, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#26282b", base2: "#202225", seam: "rgba(0,0,0,0.3)" }), { repeat: 5, px: 512 }), { rough: 0.9, metal: 0.02, color: 0x9aa0a6 });

    // -------------------------------------------------------- the barricade
    const lineZ = -0.9;
    const panelPositions = [-2.4, -1.2, 0, 1.2];
    for (const x of panelPositions) barrierPanel(g, x, lineZ, { w: 1.15, color: CITY.hiVis });
    // The gate section, a touch wider, with its release handle.
    const gate = group(g, 2.4, 0, lineZ);
    barrierPanel(gate, 0, 0, { w: 1.1, color: CITY.hiVis });
    const gateHandle = box(gate, 0.05, 0.12, 0.05, 0.5, 0.85, 0, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    holoTag(gate, "medical gate", 0.5, 1.15, 0, { css: CBL_CSS, w: 0.28 });
    reg(hits, gateHandle, "medical-gate");
    // The gap where the spare section goes, and the spare itself off to the side.
    const gapMarker = torus(g, 0.14, 0.012, -3.4, 0.04, lineZ, CBL_ACCENT, { emissive: CBL_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    gapMarker.rotation.x = Math.PI / 2;
    holoTag(g, "line gap", -3.4, 0.4, lineZ, { css: CBL_CSS, w: 0.24 });
    reg(hits, gapMarker, "line-gap");
    const spare = group(g, -3.4, 0, 1.4);
    barrierPanel(spare, 0, 0, { w: 1.0, color: CITY.hiVis });
    holoTag(spare, "spare section", 0, 1.1, 0, { css: CBL_CSS, w: 0.28 });
    reg(hits, spare, "spare-section");
    const pinPoint = group(g, -3.05, 0.4, lineZ);
    cyl(pinPoint, 0.02, 0.02, 0.14, 0, 0, 0, 0x9aa0a6, { rough: 0.35, metal: 0.85, seg: 8 });
    const pinCollar = cyl(pinPoint, 0.03, 0.03, 0.04, 0, 0.05, 0, 0xe8b02e, { rough: 0.4, metal: 0.6, seg: 10 });
    holoTag(pinPoint, "coupling pin — lock", 0, 0.22, 0, { css: CBL_CSS, w: 0.34 });
    reg(hits, pinCollar, "pin-lock-point");
    const bentPinBox = group(g, -3.5, 0, 1.9);
    cyl(bentPinBox, 0.018, 0.018, 0.13, 0, 0.15, 0, 0xb87a3a, { rough: 0.6, metal: 0.5, seg: 8 }).rotation.z = 0.4;
    holoTag(bentPinBox, "bent pin?", 0, 0.32, 0, { css: "#d2312b", w: 0.24 });
    reg(hits, bentPinBox, "bent-coupling-pin");
    const junkClip = group(g, -3.2, 0, 2.2);
    torus(junkClip, 0.025, 0.008, 0, 0.05, 0, 0x8a8f94, { rough: 0.6, metal: 0.5, seg: 6, seg2: 10 });
    holoTag(junkClip, "unrated clip?", 0, 0.2, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, junkClip, "unrated-barricade-clip");
    const climbHit = box(g, 1.0, 0.3, 0.2, -1.2, 0.55, lineZ + 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "climb over the line?", -1.2, 0.95, lineZ + 0.1, { css: "#d2312b", w: 0.42 });
    reg(hits, climbHit, "climb-barricade-shortcut");

    // The mixed zone, gauged from the rail to the stage lip.
    const stageLip = box(g, 6.4, 0.5, 0.2, 0, 0.25, -2.6, 0x2b2b30, { rough: 0.6 });
    const mzGauge = instrument(g, 0, 0.6, -1.75, { ry: 0, idle: "-- %", color: CBL_ACCENT, w: 0.12, d: 0.16 });
    holoTag(mzGauge, "mixed zone", 0, 0.18, 0, { css: CBL_CSS, w: 0.26 });
    reg(hits, mzGauge, "mixed-zone-gauge");
    void stageLip;

    // -------------------------------------------------------- FOH power
    const genset = generatorTrailer(g, -2.6, 0, 2.2, { ry: 1.6, livery: { colour: 0x2b3138, fleetName: "SMARTCITI FLEET", unitNumber: "G-14" } });
    const { eStop: gensetEStop } = genset.userData.parts ?? {};
    void gensetEStop;
    const startSwitch = box(genset, 0.04, 0.03, 0.02, 0.2, 0.9, 0.3, 0x3fae6a, { rough: 0.4 });
    holoTag(genset, "start switch — hold", 0.2, 1.15, 0.3, { css: CBL_CSS, w: 0.34 });
    reg(hits, startSwitch, "genset-start-switch");
    const fuelCanHit = box(g, 0.18, 0.24, 0.14, -2.9, 0.12, 2.7, 0x3fae6a, { rough: 0.6 });
    holoTag(g, "refuel it running?", -2.9, 0.42, 2.7, { css: "#d2312b", w: 0.4 });
    reg(hits, fuelCanHit, "genset-fuel-while-running");
    const tower = lightTower(g, -1.7, 0, 2.4, { raised: false, ry: 1.6, livery: { colour: 0xe8b02e, fleetName: "SMARTCITI FLEET", unitNumber: "LT-06" } });
    const { outriggers: towerOutriggers } = tower.userData.parts;
    const outriggerHit = towerOutriggers?.[0] ?? tower;
    holoTag(tower, "outriggers", 0, 1.9, 0, { css: CBL_CSS, w: 0.26 });
    reg(hits, outriggerHit, "tower-outriggers");

    // ---------------------------------------------- barricade load gauge
    const loadGauge = instrument(g, 1.0, 1.0, lineZ + 0.28, { ry: 0, idle: "-- %", color: CBL_ACCENT, w: 0.1, d: 0.14 });
    holoTag(loadGauge, "rail load", 0, 0.16, 0, { css: CBL_CSS, w: 0.22 });
    reg(hits, loadGauge, "load-gauge");
    const spikeBeacon = ball(loadGauge, 0.03, 0, 0.22, 0, 0xf0645b, { emissive: 0xf0645b, ei: 2.4, rough: 0.4 });
    spikeBeacon.visible = false;

    // ---------------------------------------------- medical lane and cones
    const laneCases = [];
    for (const [x, z] of [[3.0, 1.2], [3.2, 1.5]]) {
      const c = box(g, 0.4, 0.3, 0.28, x, 0.15, z, 0x2b3138, { rough: 0.6 });
      laneCases.push(c);
    }
    const caseHit = group(g, 3.1, 0.15, 1.35);
    reg(hits, caseHit, "case-cleared");
    const coneHit = group(g, 3.0, 0, 2.0);
    cyl(coneHit, 0.03, 0.13, 0.5, 0, 0.25, 0, 0xe4622a, { rough: 0.75, seg: 12 });
    holoTag(coneHit, "lane cone", 0, 0.6, 0, { css: CBL_CSS, w: 0.22 });
    reg(hits, coneHit, "lane-cone");
    const laneBlockHit = box(g, 0.6, 0.3, 0.5, 3.4, 0.15, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stack cases in the lane?", 3.4, 0.5, 0.6, { css: "#d2312b", w: 0.5 });
    reg(hits, laneBlockHit, "block-medical-lane");

    // -------------------------------------------------------------- hardware
    const chest = toolChest(g, 2.4, 2.2, { ry: -0.5, color: 0x2b2b30 });
    const rack = group(g, 1.9, 0, 2.3, 0.3);
    cyl(rack, 0.02, 0.02, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.4, 0.03, 0.03, 0, 1.25, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const vest = group(rack, -0.1, 0.9, 0);
    box(vest, 0.22, 0.28, 0.02, 0, 0, 0, 0xd8f23a, { rough: 0.8 });
    holoTag(rack, "hi-vis vest", -0.1, 1.15, 0, { css: CBL_CSS, w: 0.24 });
    reg(hits, vest, "hi-vis-vest");
    const headsetProp = group(rack, 0.12, 0.9, 0);
    torus(headsetProp, 0.06, 0.012, 0, 0, 0, 0x2b2b30, { rough: 0.6, seg: 6, seg2: 16 });
    holoTag(rack, "production headset", 0.12, 1.1, 0, { css: CBL_CSS, w: 0.32 });
    reg(hits, headsetProp, "headset");
    const radio = instrument(chest, 0.14, 0.79, 0.04, { ry: 0.1, idle: "CH 2 · FOH", color: CBL_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "production radio", 0, 0.16, 0, { css: CBL_CSS, w: 0.3 });
    reg(hits, radio, "production-radio");

    // -------------------------------------------------------------- paperwork
    const plan = holoPanel(g, 0.95, 0.66, -2.35, 1.35, 1.3, (cx, w, h) => {
      cx.fillStyle = "#130a1c"; cx.fillRect(0, 0, w, h); cx.fillStyle = CBL_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#efe0ff"; cx.fillText("SITE SECURITY PLAN", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#f4ecfb";
      ["Barricade layout and mixed zone width", "Capacity per the venue's licence", "Medical post: behind the gate lane", "Show-stop chain: security → SM → house",
       "Coupling pins rated per the maker's label", "Log the shift before stand-down"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.9, accent: CBL_ACCENT });
    reg(hits, plan, "site-security-plan");
    const briefing = holoPanel(g, 0.6, 0.42, 2.1, 1.3, -0.4, (cx, w, h) => {
      cx.fillStyle = "#130a1c"; cx.fillRect(0, 0, w, h); cx.fillStyle = CBL_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#efe0ff"; cx.fillText("SHOW-STOP CHAIN", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f4ecfb";
      ["Signal: raised crossed arms", "Radio: CH 2 · FOH", "Reaches: SM, then house"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.6, accent: CBL_ACCENT });
    reg(hits, briefing, "showstop-briefing");
    const log = holoPanel(g, 0.6, 0.42, 2.5, 1.3, 1.9, (cx, w, h) => {
      cx.fillStyle = "#130a1c"; cx.fillRect(0, 0, w, h); cx.fillStyle = CBL_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#efe0ff"; cx.fillText("SHIFT LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f4ecfb";
      ["Pin: —", "Mixed zone: —", "Load spike: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.9, accent: CBL_ACCENT });
    reg(hits, log, "shift-log");
    const ticket = decal(g, 0.2, 0.26, -3.5, 0.06, 1.9, paperFace("SET ASIDE", ["bent pin"], { bg: "#f2e0a0", band: "#d2312b" }), { px: 128 });
    ticket.rotation.x = -Math.PI / 2;
    ticket.visible = false;

    // ------------------------------------------------------------- crew
    const security = standingFigure(g, 1.6, -1.4, { ry: 3.0, cloth: 0x1b2a3a, vest: 0xd8f23a, cap: 0x2b3138 });
    holoTag(security, "security lead", 0, 1.95, 0, { css: CBL_CSS, w: 0.28 });
    const patron = standingFigure(g, 0.4, -0.55, { ry: 0.2, cloth: 0x3a3f45, atStation: true });
    const patronHome = patron.position.clone();
    patron.visible = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, -0.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "pin-inspect") { bentPinBox.children[0].material = mat(0xd2312b, { emissive: 0x6a1a08, ei: 0.8, rough: 0.6 }); ticket.visible = true; }
        if (step.id === "barricade-drag") spare.visible = false;
        if (step.id === "pin-lock") pinCollar.material = mat(0x59c97b, { emissive: 0x1a5a2a, ei: 0.6, rough: 0.4, metal: 0.6 });
        if (step.id === "mixed-zone-gauge") repaint(mzGauge.userData.screen, signFace("IN PLAN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "genset-start") repaint(loadGauge.userData.screen, signFace("30 %", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "medical-lane") for (const c of laneCases) c.visible = false;
        if (step.id === "shift-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#130a1c"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#efe0ff"; cx.fillText("SHIFT LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Pin: swapped, spare in", "Mixed zone: in plan", "Load spike: answered, logged"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "showstop-checkin") repaint(radio.userData.screen, signFace("LINE READY", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "barricade-load-spike") { repaint(loadGauge.userData.screen, signFace("88 %", { bg: "#2a0c0c", accent: "#f0645b", fg: "#ffd8d0", scale: 0.6 })); spikeBeacon.visible = true; }
        if (it.id === "person-pulled-over-rail") { patron.visible = true; patron.position.set(2.4, 0.3, -0.5); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "barricade-load-spike") { repaint(loadGauge.userData.screen, signFace("42 %", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 })); spikeBeacon.visible = false; }
        if (it.id === "person-pulled-over-rail") { gateHandle.material = mat(0x59c97b, { rough: 0.4 }); patron.position.copy(patronHome); patron.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "pin-lock") pinCollar.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "mixed-zone-gauge") repaint(mzGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "crush-watch" && session.holding) repaint(loadGauge.userData.screen, signFace(`${Math.round(session.track.v * 100)}%`, { bg: "#0d1c24", accent: session.track.v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        void dt; void t; void CITY;
      },
    };
  },
};
