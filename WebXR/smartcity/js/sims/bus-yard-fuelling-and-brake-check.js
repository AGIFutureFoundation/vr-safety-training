import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bus Yard Fuelling & Brake Check VR — Mobility & Transit, the
// transit and ramp block.
//
// A coach yard's fuel lane at the end of the day: a diesel coach pulled up to
// the island with its diesel and DEF fillers side by side, the emergency fuel
// shutoff on its post, the next island busy, and a yard hostler shuffling
// coaches into the lanes behind. The learner is the ATU or IAM service worker
// who fuels the coach and runs its air brake check before it is parked for
// the night, writing up what they find so it does not go out in the morning.
// The yard and the carrier are generic.

const BYF_ACCENT = 0x63b5f0;
const BYF_CSS = "#63b5f0";

export const SIM_BUS_YARD_FUELLING_AND_BRAKE_CHECK = {
  id: "bus-yard-fuelling-and-brake-check",
  index: "316",
  domain: "Mobility & Transit",
  trade: "ATU or IAM coach yard service worker — fuel lane and air brake check, with the yard hostler moving coaches behind",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "ATU, IAM and TWU bus maintenance training; FMCSA 49 CFR 393 brake and warning-device requirements and 49 CFR 396 inspection, repair and the driver vehicle inspection report for a carrier under FMCSA rules; CVSA out-of-service criteria for brake adjustment and air-line condition; OSHA 29 CFR 1910.1200 hazard communication for diesel and DEF at the island; ANSI/ISEA 107 high-visibility garments in the yard",
  name: "Bus Yard Fuelling & Brake Check",
  title: simTitle("Bus Yard Fuelling & Brake Check"),
  tagline: "The fuel lane at the end of the day: the lane board read, the brake set and the engine off, the coach chocked, the tank filled with a hand on the nozzle while a hose lets go at the next island, the DEF into its own filler, the cap on to the click, a coolant leak found, air built to cut-out, the applied leak held while a hostler backs a coach into the lane, the low-air warning proven, a pushrod stroke measured, a chafed air line found, the coach tagged out, and the report written",
  accent: BYF_ACCENT,
  accentCss: BYF_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "fuelled-checked-written-up", name: "Fuelled, Checked, Written Up", note: "Engine off and a hand on the nozzle, the spill and the hostler both answered, the brake check done by the numbers, and the chafed line kept off the road" },

  supportLine: "your ATU or IAM local's member assistance programme, or your carrier's employee assistance line on the yard board",

  game: system({
    name: "Fuel Lane",
    currency: "PSI",
    ranks: ["Yard Hand", "Fueller", "Service Worker", "Lead Service Worker", "Fuel Lane Certified"],
    badges: [
      { id: "hand-on-nozzle", name: "Hand On The Nozzle", note: "The fill attended from start to finish", test: AWARD.stepClean("fuel-fill") },
      { id: "steady-application", name: "Steady Application", note: "The applied brake held steady through the leak test", test: AWARD.unbroken },
      { id: "never-a-shortcut", name: "Never A Shortcut", note: "No idling fill, no latched nozzle, no DEF in the diesel, never under an unchocked coach", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-lane", name: "Clean Lane", note: "No corrections anywhere in the lane", test: AWARD.clean },
      { id: "cut-out-on-the-mark", name: "Cut-Out On The Mark", note: "Governor cut-out committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "lane-turned", name: "Lane Turned", note: "Report written inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "engine-idling-fuel": "You went to start fuelling with the coach's engine still idling. A running engine is a hot exhaust and a live electrical system a metre from a tank breathing diesel vapour, and a coach left running in a fuel lane can be knocked into gear by anyone climbing aboard. The engine goes off and the key comes out before the cap comes off, every time.",
    "nozzle-latched-walkaway": "You clicked the nozzle's hold-open latch and turned to walk off. A latched nozzle fills until its automatic shutoff trips — if it trips — and the person who latched it is somewhere else when the tank overflows, the nozzle falls out or someone drives off with it in the filler. The fill is attended with a hand on the nozzle from start to finish.",
    "def-at-diesel": "You lifted the DEF nozzle toward the diesel filler. Diesel exhaust fluid in a diesel tank does not burn — it crystallises in the fuel system and can wreck the pumps and injectors, and a coach that leaves the yard with it will fail on the road. The fillers are colour-coded and sized differently for this reason, and each nozzle goes only into its own filler.",
    "under-bus-unchocked": "You went to look under the coach before the wheels were chocked. A parked coach with a leaking air system can lose its brakes as the pressure drops, and during a brake check the parking brakes are deliberately released — nobody goes under or in front of a coach during a brake check, and nobody goes under at all until it is chocked.",
  },

  lateNotes: {
    "fuel-cap": "The cap goes back on once the fill is complete and the nozzle is back in its holster — the tank is still open.",
    "brake-pedal": "The applied leak test starts once air is built to governor cut-out and the engine is off — not with the compressor still running.",
    "dvir-tablet": "The report is written once the coach is tagged and the key is in the lock box — the report is the last thing.",
  },

  steps: [
    {
      id: "lane-board", kind: "select", target: "lane-board",
      title: "Read the fuel lane board: lane, spill plan and shutoff",
      cue: "Read the lane board: which lane, the fuelling rules, where the emergency fuel shutoff is, where the spill kit is, and the brake check the coach needs tonight.",
      why: "The fuel lane is the one part of the yard where diesel, moving coaches and people on foot all meet, and its rules are posted because they have to be known before they are needed: engine off, nozzle attended, where the emergency fuel shutoff is and what the spill plan says. The coach's paperwork on the board also says what check it is due — a coach that needs its brakes looked at tonight is a coach that does not go out tomorrow if it fails.",
    },
    {
      id: "shutdown", kind: "sequence",
      targets: ["park-brake", "ignition-key"],
      itemNames: { "park-brake": "parking brake set", "ignition-key": "engine off, key out" },
      outOfOrderNote: "Parking brake first — the coach is held on its brake before the engine is shut down, not after.",
      title: "Set the parking brake, then engine off and key out",
      cue: "Pull the parking brake valve, then shut the engine down and take the key out before anyone touches the filler.",
      why: "A coach in the fuel lane is secured in a fixed order: the parking brake set while the engine and air are still up, then the engine off and the key in the worker's pocket, so the coach cannot be started or driven while its tank is open and someone is at its side. A running engine at the island is heat and electricity next to diesel vapour, and a key left in is an invitation to the next person aboard.",
    },
    {
      id: "chock", kind: "drag", target: "wheel-chock",
      title: "Chock the coach's wheels",
      cue: "Set the wheel chock tight against the rear drive wheel on the downhill side.",
      why: "The brake check coming up deliberately releases the parking brakes and drains the air, and a coach on even a slight grade will roll when it does. The chock goes against the drive wheel on the downhill side before the check starts and before anyone goes near the wheels or under the coach, because it is the only thing holding the coach once the air is gone.",
      drag: { to: "chock-spot", radius: 0.5, missNote: "Not against the wheel — the chock has to sit tight to the tyre's tread on the downhill side, not beside it on the pavement." },
    },
    {
      id: "fuel-fill", kind: "hold", target: "diesel-nozzle", seconds: 5,
      title: "Fill the tank with a hand on the nozzle",
      cue: "Put the diesel nozzle in the green-capped filler and hold the trigger through the fill — no latch, eyes on the filler, until it clicks off.",
      why: "The fill is attended because the automatic shutoff that stops the pump at a full tank is a backup, not a plan — it can fail, the nozzle can slip out, and the first sign of either is diesel on the pavement. A hand on the nozzle and eyes on the filler means the person fuelling is the shutoff. The safety data sheet for diesel, which HazCom puts at the island, is the reason vapour and skin contact are kept to the minimum the job needs.",
      holdBreakNote: "Let go of the nozzle before the fill clicked off — an unattended fill is how tanks overflow. Take the nozzle again and finish the fill.",
    },
    {
      id: "def-fill", kind: "select", target: "def-nozzle",
      title: "Top up the DEF from its own blue-capped filler",
      cue: "Take the blue DEF nozzle to the blue-capped DEF filler only, and top up the tank.",
      why: "Diesel exhaust fluid is what the coach's exhaust treatment uses to clean up its emissions, and it lives in its own tank behind its own blue cap. The two fillers sit side by side on many coaches, which is why the nozzles, caps and filler necks are different colours and sizes — and why the fueller reads the cap, not the position, before a nozzle goes in.",
    },
    {
      id: "cap-torque", kind: "turn", target: "fuel-cap",
      title: "Put the fuel cap back on to the click",
      cue: "Nozzle back in the holster, then turn the diesel cap on until it clicks and close the filler door.",
      why: "A diesel cap that is not turned to its click lets fuel slosh out on the first corner and lets water in on the first wash, and a cap left on the island is a coach running with an open tank. The nozzle goes back into its holster first, so the next person does not drive over a hose, and the cap is turned until it clicks because the click is the cap's seal seating.",
      turn: { turns: 1.0, label: "CAP", readout: (t) => (t < 0.4 ? "threading" : t < 0.9 ? "seating" : "clicked") },
    },
    {
      id: "walkaround", kind: "find", noHint: true,
      targets: ["coolant-leak"],
      itemNames: { "coolant-leak": "coolant puddle under the engine bay" },
      itemNotes: { "coolant-leak": "A bright green puddle is spreading under the rear engine bay from a weeping radiator hose clamp. It goes on the report — a coach that loses its coolant on the road overheats and strands its passengers." },
      title: "Walk round the coach for leaks and damage",
      cue: "Walk the coach: fluid under the engine and the axles, the tyres, the lights and the body, before the brake check.",
      why: "The walk-round at the end of the day is when a coach's small faults are found while there is still a night to fix them: a coolant puddle under the engine bay, a tyre gone soft, a light out. The report the driver and the yard write depends on someone actually looking, and a puddle under a parked coach is the easiest fault in the yard to find and the most expensive one to find on the road.",
    },
    {
      id: "air-build", kind: "gauge", target: "air-gauge",
      title: "Build the air and read governor cut-out",
      cue: "Start the engine, build air pressure and commit the reading where the governor cuts the compressor out, against the coach maker's figure.",
      why: "The air brake check starts from a known point: the compressor builds pressure until the governor cuts it out at the figure the coach maker sets, and a governor cutting out too low leaves less air than the brakes were designed around, while one that never cuts out is about to cook a compressor. The reading is taken at the moment the compressor unloads, because that is the governor's setting — not a number on the way up.",
      gauge: { label: "AIR", speed: 0.6, green: [0.58, 0.72], readout: (t) => `${Math.round(t * 180)} psi`, missNote: "Not at cut-out — commit the reading at the moment the governor unloads the compressor, not while the needle is still climbing." },
    },
    {
      id: "applied-leak", kind: "track", target: "brake-pedal", seconds: 6,
      title: "Hold a full brake application and watch the leak-down",
      cue: "Engine off, parking brake released on the chocks: press and hold a full application steady, and watch the gauge for a minute after the first drop.",
      why: "The applied leakage test is how the brake system's leaks show: with the engine off and a full application held steady, the pressure is allowed its first drop as the chambers fill and then watched for a minute, and a system losing more than the state CDL manual's limit has a leak that will empty the tanks. The application is held steady because a foot that pumps the pedal is spending air, and the test is measuring the air the system loses on its own.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "APPLICATION", readout: (v) => (v < 0.4 ? "easing off" : v > 0.6 ? "pumping — spending air" : "steady") },
      holdBreakNote: "The application wavered — a pedal that eases off or pumps is spending air and the reading means nothing. Start the minute again with a steady foot.",
    },
    {
      id: "low-air", kind: "select", target: "low-air-lamp",
      title: "Fan the air down and prove the low-air warning",
      cue: "Fan the brake pedal to bleed the air down and confirm the low-air warning lamp and buzzer come on before the pressure falls below the manual's figure.",
      why: "The low-air warning is what tells a driver the brakes are running out of air while there is still enough to stop, and 49 CFR 393 requires coaches with air brakes to have one. It is proven by fanning the pressure down and watching for the lamp and buzzer to come on before the figure in the state CDL manual, because a warning that comes on too late is a warning that arrives with the spring brakes.",
    },
    {
      id: "pushrod", kind: "gauge", target: "pushrod-ruler",
      title: "Measure the pushrod stroke against its limit",
      cue: "With a full application held by your crew mate, measure the pushrod's travel at the rear brake chamber and commit it against the chamber's readjustment limit.",
      why: "An air brake's stroke grows as its linings wear, and past the readjustment limit for its chamber size the brake reaches the end of its travel before it is fully applied — it looks fine and stops badly. CVSA's out-of-service criteria count brakes past that limit, and a coach with enough of them is off the road. The stroke is measured with a full application held, from the same mark each time, because that is the only reading the limit means anything against.",
      gauge: { label: "PUSHROD STROKE", speed: 0.7, green: [0.36, 0.56], readout: (t) => `${(t * 3.5).toFixed(2)} in`, missNote: "Not a true stroke — measure from the chamber face to the same mark on the pushrod with the application fully held, then commit." },
    },
    {
      id: "air-line", kind: "find", noHint: true,
      targets: ["chafed-air-line"],
      itemNames: { "chafed-air-line": "chafed air line rubbing on the axle bracket" },
      itemNotes: { "chafed-air-line": "The service air line to the rear axle's left chamber has rubbed through its outer layer on an axle bracket — the reinforcement is showing. CVSA's criteria take a coach off the road for an air line worn through to the braid. It is tagged out tonight." },
      title: "Look along the air lines at the axles",
      cue: "With the coach chocked, look along the air lines and brake hoses at the axles: chafing, cracking, kinks, and anything rubbing.",
      why: "An air line that rubs on a bracket with every bump wears through a layer at a time, and the first sign of failure on the road is a brake that stops working and a pressure that falls. The coach is chocked before anyone looks underneath, and the lines are traced along their whole run to the chambers, because the chafe is always where the line touches something the fitter did not expect it to touch.",
    },
    {
      id: "tag-out", kind: "sequence", anyOrder: true,
      targets: ["oos-tag", "key-lockbox"],
      itemNames: { "oos-tag": "out-of-service tag on the steering wheel", "key-lockbox": "key into the shop lock box" },
      title: "Tag the coach out of service and lock the key away",
      cue: "Hang the out-of-service tag on the steering wheel and put the key in the shop lock box, so the coach cannot go out in the morning.",
      why: "A chafed air line is a defect that affects safe operation, and 49 CFR 396 has it repaired before the coach runs again — which in a yard that sends coaches out before the day shift arrives means the coach has to be physically stopped from going out, not just written up. The tag on the wheel tells the morning driver, and the key in the shop's lock box makes sure the tag is obeyed.",
    },
    {
      id: "dvir-log", kind: "select", target: "dvir-tablet",
      title: "Write the inspection report for the shop and the morning",
      cue: "Record the fuel and DEF, the coolant leak, the brake check readings, the pushrod stroke, and the chafed air line with the coach tagged out.",
      why: "The driver vehicle inspection report is the carrier's record under 49 CFR 396 of what was found and what was fixed, and the mechanic who works on the coach tonight starts from it. A defect that is not on the report is a defect the shop does not know to fix, and the report is also what the next driver reviews and signs before taking the coach — written now, at the coach, it says what is actually wrong with it.",
    },
    {
      id: "crew-checkin", kind: "select", target: "yard-radio",
      title: "Check in with the yard dispatcher and the hostler",
      cue: "Call the yard dispatcher: the coach is fuelled and tagged out with a chafed air line, and check in with the hostler after the backing in the lane.",
      why: "Dispatch builds tomorrow's pull-out from this call, so a coach that will not be ready is known now rather than at five in the morning. It is also the crew's check-in: a coach backing into a lane where someone is holding a brake pedal is the near miss the hostler and the service worker will both remember, and the union's practice is to say so on the radio and name the member assistance line alongside it.",
    },
  ],

  interrupts: [
    {
      id: "spill-next-island",
      kind: "Hose let go at the next island",
      after: "fuel-fill", delay: 2, seconds: 12,
      alert: "At the next island a coach has pulled away with the nozzle still in its filler — the hose has snapped off and diesel is pouring across the lane.",
      cue: "Hit the emergency fuel shutoff on its post — every dispenser in the lane stops at once.",
      target: "fuel-estop",
      why: "A breakaway on a fuel hose stops most of the flow, but the fastest way to stop every dispenser in a lane is the emergency fuel shutoff the fire code puts on a post within reach of the islands — and it is hit before anything else, because diesel spreading across a lane with coaches moving through it is a slip hazard, a fire load and a drain to the storm sewer all at once. The fill in your own hand stops with it.",
      missNote: "The dispenser kept pumping through the broken hose; diesel spread across two lanes and into the drain before the yard supervisor ran to the shutoff, and a coach pulling in slid through the edge of it.",
      wrongNote: "The emergency fuel shutoff — the spill is at another island, and the shutoff is the one control that stops every dispenser at once.",
    },
    {
      id: "hostler-backing",
      kind: "Coach backing into the lane",
      after: "applied-leak", delay: 2, seconds: 12,
      alert: "The yard hostler is backing another coach into the lane behind you, reverse alarm going, with nobody spotting and you at the rear wheels.",
      cue: "Call the hostler on the yard radio to stop — you are in the lane behind the coach.",
      target: "yard-radio",
      why: "A coach reversing in a yard has blind spots the length of a person along its whole rear, and a hostler moving coaches at the end of a shift is looking at the lane markings, not for someone kneeling at a wheel. The radio reaches the driver's cab, and the call goes the moment the reverse alarm starts, because the service worker holding a brake pedal cannot step out of the lane mid-test.",
      missNote: "The backing coach stopped a metre from the rear of the coach under test only because the hostler happened to check a mirror; the service worker at the wheel never saw it coming.",
      wrongNote: "The yard radio — the reversing coach's driver cannot see you, and the radio is the only thing that reaches the cab.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BYF_ACCENT);

    // ------------------------------------------------------------ the yard
    const yard = box(g, 6.4, 0.06, 5.2, 0, 0.03, 0, 0xffffff, { rough: 0.92 });
    yard.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#3a3d41", base2: "#34373b", seam: "rgba(0,0,0,0.3)" }), { repeat: 5, px: 512 }), { rough: 0.92, metal: 0.02, color: 0xb0b4b8 });
    for (const z of [-2.2, 0.3]) box(g, 6.4, 0.008, 0.08, 0, 0.064, z, 0xeae6d4, { rough: 0.8, cast: false });
    // The fuel island, its canopy posts and dispensers.
    const island = group(g, 0, 0, 0.75);
    box(island, 3.4, 0.16, 0.6, 0, 0.08, 0, 0xc8c8c0, { rough: 0.85, finish: "concrete" });
    for (const x of [-1.6, 1.6]) {
      box(island, 0.3, 0.2, 0.3, x, 0.26, 0, 0xe8b02e, { rough: 0.6 });
      cyl(island, 0.08, 0.08, 2.4, x, 1.36, 0, 0xe8e8e0, { rough: 0.5, metal: 0.3, seg: 12 });
    }
    box(g, 4.2, 0.12, 1.8, 0, 2.6, 0.4, 0xe8e8e0, { rough: 0.5, metal: 0.3 });
    const disp = group(island, -0.4, 0.16, 0);
    box(disp, 0.5, 1.1, 0.34, 0, 0.55, 0, 0x2f5f8f, { rough: 0.5, metal: 0.3 });
    const dispScreen = decal(disp, 0.3, 0.16, 0, 0.85, -0.175, signFace("DIESEL", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }), { px: 256, glow: true, ei: 0.8 });
    dispScreen.rotation.y = Math.PI;
    const holster = box(disp, 0.08, 0.14, 0.06, -0.18, 0.6, -0.2, 0x2b2b30, { rough: 0.6 });
    void holster;
    const dieselHose = hose(g, [[-0.58, 0.9, 0.55], [-0.7, 0.4, 0.2], [-0.8, 0.5, -0.25], [-0.9, 0.75, -0.42]], 0.02, 0x14171a, { steps: 12, rough: 0.7 });
    void dieselHose;
    const nozzle = group(g, -0.9, 0.75, -0.42);
    box(nozzle, 0.06, 0.08, 0.16, 0, 0, 0, 0x3fae6a, { rough: 0.5 });
    cyl(nozzle, 0.015, 0.015, 0.14, 0, -0.02, -0.14, 0x8a949d, { rough: 0.3, metal: 0.8, seg: 8 }).rotation.x = Math.PI / 2;
    holoTag(nozzle, "diesel nozzle — hold", 0, 0.28, 0, { css: BYF_CSS, w: 0.38 });
    reg(hits, nozzle, "diesel-nozzle");
    const latch = box(nozzle, 0.03, 0.03, 0.04, 0, -0.06, 0.04, 0xc0c6cc, { rough: 0.4, metal: 0.8 });
    holoTag(nozzle, "latch it and walk off?", 0.25, -0.2, 0.1, { css: "#d2312b", w: 0.44 });
    reg(hits, latch, "nozzle-latched-walkaway");
    const defDisp = group(island, 0.45, 0.16, 0);
    box(defDisp, 0.36, 0.9, 0.3, 0, 0.45, 0, 0x2f6fd0, { rough: 0.5, metal: 0.2 });
    decal(defDisp, 0.24, 0.1, 0, 0.7, -0.155, signFace("DEF", { accent: "#ffffff", scale: 0.6 }), { px: 128 }).rotation.y = Math.PI;
    const defNozzle = group(defDisp, -0.12, 0.55, -0.2);
    box(defNozzle, 0.05, 0.07, 0.14, 0, 0, 0, 0x2f6fd0, { rough: 0.5 });
    hose(defDisp, [[-0.12, 0.62, -0.1], [-0.2, 0.3, -0.2], [-0.12, 0.5, -0.24]], 0.015, 0x14171a, { steps: 8 });
    holoTag(defDisp, "DEF nozzle", -0.12, 0.95, -0.2, { css: BYF_CSS, w: 0.24 });
    reg(hits, defNozzle, "def-nozzle");
    // Emergency fuel shutoff on its post, spill kit, extinguisher.
    const estop = group(g, 2.5, 0, 1.4);
    cyl(estop, 0.03, 0.03, 1.4, 0, 0.7, 0, 0xe8b02e, { rough: 0.5, metal: 0.4, seg: 8 });
    box(estop, 0.24, 0.24, 0.1, 0, 1.4, 0, 0xd2312b, { rough: 0.5 });
    const eButton = cyl(estop, 0.06, 0.06, 0.04, 0, 1.4, -0.07, 0xf2f2f2, { rough: 0.4, seg: 14 });
    eButton.rotation.x = Math.PI / 2;
    decal(estop, 0.4, 0.14, 0, 1.7, 0.0, signFace("EMERGENCY FUEL SHUTOFF", { bg: "#d2312b", accent: "#ffffff", fg: "#ffffff", scale: 0.45 }), { px: 256 }).rotation.y = Math.PI;
    holoTag(estop, "emergency fuel shutoff", 0, 2.0, 0, { css: BYF_CSS, w: 0.44 });
    reg(hits, estop, "fuel-estop");
    const spillKit = group(g, 2.0, 0, 1.85);
    cyl(spillKit, 0.2, 0.2, 0.5, 0, 0.25, 0, 0xe8b02e, { rough: 0.6, seg: 14 });
    decal(spillKit, 0.24, 0.1, 0, 0.3, 0.205, signFace("SPILL KIT", { accent: "#111111", fg: "#111111", bg: "#e8b02e", scale: 0.5 }), { px: 128 });
    const ext = group(g, 1.45, 0.16, 0.95);
    cyl(ext, 0.07, 0.07, 0.42, 0, 0.21, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 12 });
    // The next island with its own dispenser, where the spill happens.
    const island2 = group(g, 3.6, 0, -1.4);
    box(island2, 0.6, 0.16, 1.6, 0, 0.08, 0, 0xc8c8c0, { rough: 0.85, finish: "concrete" });
    box(island2, 0.34, 1.0, 0.44, 0, 0.66, 0, 0x2f5f8f, { rough: 0.5, metal: 0.3 });
    const puddle = box(g, 1.4, 0.006, 1.0, 2.9, 0.066, -1.3, 0x1a1408, { rough: 0.05, metal: 0.4, cast: false });
    puddle.visible = false;
    const brokenHose = hose(g, [[3.45, 0.9, -1.4], [3.0, 0.3, -1.3], [2.6, 0.07, -1.2]], 0.02, 0x14171a, { steps: 8 });
    brokenHose.visible = false;

    // ------------------------------------------------------------ the coach
    const coach = group(g, -0.3, 0, -0.95);
    const CL = 4.4;
    box(coach, CL, 1.1, 1.05, 0, 0.85, 0, 0xe8eef2, { rough: 0.45, metal: 0.3 });
    box(coach, CL, 0.08, 1.06, 0, 0.55, 0, 0x2f6fd0, { rough: 0.5 });
    box(coach, CL - 0.6, 0.36, 1.07, -0.1, 1.08, 0, 0x1d2c38, { rough: 0.2, metal: 0.3 });
    box(coach, 0.02, 0.5, 0.9, -CL / 2 - 0.01, 1.05, 0, 0x1d2c38, { rough: 0.2, metal: 0.3 });
    box(coach, CL, 0.06, 1.0, 0, 1.43, 0, 0xd8dde2, { rough: 0.5, metal: 0.3 });
    const wheels = [];
    for (const x of [-1.5, 1.0, 1.6]) for (const sz of [-1, 1]) {
      const w = cyl(coach, 0.3, 0.3, 0.2, x, 0.3, sz * 0.5, 0x14171a, { rough: 0.85, seg: 16 });
      w.rotation.x = Math.PI / 2;
      wheels.push(w);
      cyl(coach, 0.14, 0.14, 0.21, x, 0.3, sz * 0.5, 0x9aa0a6, { rough: 0.4, metal: 0.8, seg: 12 }).rotation.x = Math.PI / 2;
    }
    // Fillers on the island side: diesel (green cap) and DEF (blue cap).
    const fillers = group(coach, 0.4, 0.7, 0.53);
    box(fillers, 0.4, 0.22, 0.01, 0, 0, 0, 0xc8ccd0, { rough: 0.5, metal: 0.3 });
    const cap = group(fillers, -0.1, 0, 0.02);
    cyl(cap, 0.045, 0.045, 0.03, 0, 0, 0, 0x3fae6a, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    box(cap, 0.07, 0.015, 0.02, 0, 0, 0.02, 0x2f8f4a, { rough: 0.5 });
    holoTag(fillers, "diesel cap", -0.1, 0.3, 0.05, { css: BYF_CSS, w: 0.22 });
    reg(hits, cap, "fuel-cap");
    cyl(fillers, 0.035, 0.035, 0.03, 0.12, 0, 0.02, 0x2f6fd0, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    const defAtDiesel = box(fillers, 0.12, 0.12, 0.08, -0.1, -0.02, 0.08, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(fillers, "DEF into this filler?", -0.35, -0.2, 0.1, { css: "#d2312b", w: 0.42 });
    reg(hits, defAtDiesel, "def-at-diesel");
    // Exhaust at the rear, the engine bay and the coolant puddle.
    const exhaust = cyl(coach, 0.05, 0.05, 0.14, CL / 2 - 0.1, 0.3, 0.45, 0x3a3f44, { rough: 0.6, metal: 0.5, seg: 10 });
    exhaust.rotation.z = Math.PI / 2;
    const idleHit = box(coach, 0.3, 0.3, 0.3, CL / 2 + 0.1, 0.35, 0.45, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(coach, "fuel it with the engine idling?", CL / 2 + 0.1, 0.8, 0.8, { css: "#d2312b", w: 0.58 });
    reg(hits, idleHit, "engine-idling-fuel");
    const coolant = box(coach, 0.6, 0.006, 0.5, CL / 2 - 0.5, 0.068, -0.1, 0x3fd86a, { rough: 0.05, metal: 0.2, cast: false, emissive: 0x1a5a2a, ei: 0.4 });
    reg(hits, coolant, "coolant-leak");
    // Brake chamber, pushrod and the chafed line at the rear axle.
    const chamber = group(coach, 1.0, 0.42, 0.28);
    cyl(chamber, 0.08, 0.08, 0.12, 0, 0, 0, 0x2b2b30, { rough: 0.6, metal: 0.4, seg: 14 }).rotation.x = Math.PI / 2;
    const rod = cyl(chamber, 0.01, 0.01, 0.14, 0, 0, 0.12, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 });
    rod.rotation.x = Math.PI / 2;
    const ruler = group(g, 0.7, 0.42, -0.3);
    box(ruler, 0.02, 0.02, 0.3, 0, 0, 0, 0xe8b02e, { rough: 0.6 });
    for (let i = 0; i < 6; i++) box(ruler, 0.022, 0.022, 0.004, 0, 0.001, -0.12 + i * 0.05, 0x111111, { cast: false });
    holoTag(ruler, "pushrod ruler", 0, 0.3, 0.1, { css: BYF_CSS, w: 0.28 });
    reg(hits, ruler, "pushrod-ruler");
    hose(coach, [[0.6, 0.45, 0.2], [0.8, 0.4, 0.25], [1.0, 0.42, 0.24]], 0.012, 0x14171a, { steps: 6 });
    const chafe = box(coach, 0.06, 0.03, 0.03, 0.8, 0.4, 0.26, 0xb87a3a, { rough: 0.8 });
    reg(hits, chafe, "chafed-air-line");
    const underHit = box(coach, 1.0, 0.2, 0.6, -0.4, 0.12, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(coach, "crawl under before chocks?", -0.4, 0.3, 0.9, { css: "#d2312b", w: 0.52 });
    reg(hits, underHit, "under-bus-unchocked");
    const chockSpot = torus(coach, 0.2, 0.012, 1.6, 0.06, 0.78, BYF_ACCENT, { emissive: BYF_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    chockSpot.rotation.x = Math.PI / 2;
    holoTag(coach, "chock — drive wheel", 1.6, 0.35, 0.95, { css: BYF_CSS, w: 0.36 });
    reg(hits, chockSpot, "chock-spot");
    const chock = group(g, 2.2, 0.06, 0.2, 0.3);
    box(chock, 0.2, 0.12, 0.24, 0, 0.06, 0, 0xe8b02e, { rough: 0.7 });
    box(chock, 0.14, 0.05, 0.24, -0.05, 0.14, 0, 0xe8b02e, { rough: 0.7 });
    holoTag(chock, "wheel chock", 0, 0.4, 0, { css: BYF_CSS, w: 0.24 });
    reg(hits, chock, "wheel-chock");

    // ---------------------------------- the driver's position, door open
    const dash = group(g, -2.9, 0, -0.2, 0.5);
    box(dash, 0.6, 0.8, 0.4, 0, 0.4, 0, 0x2b2b30, { rough: 0.6 });
    box(dash, 0.62, 0.05, 0.42, 0, 0.82, 0, 0x14171a, { rough: 0.5 });
    const airGauge = instrument(dash, -0.14, 0.86, 0.02, { ry: 0, idle: "-- psi", color: BYF_ACCENT, w: 0.12, d: 0.16 });
    holoTag(airGauge, "air gauge", 0, 0.16, 0, { css: BYF_CSS, w: 0.22 });
    reg(hits, airGauge, "air-gauge");
    const lowAir = ball(dash, 0.03, 0.12, 0.88, -0.1, 0x6a1a14, { rough: 0.4 });
    holoTag(dash, "low-air lamp", 0.14, 1.05, -0.1, { css: BYF_CSS, w: 0.26 });
    reg(hits, lowAir, "low-air-lamp");
    const parkBrake = group(dash, 0.2, 0.86, 0.1);
    box(parkBrake, 0.05, 0.05, 0.05, 0, 0.02, 0, 0xe8b02e, { rough: 0.5 });
    holoTag(parkBrake, "parking brake", 0, 0.2, 0.1, { css: BYF_CSS, w: 0.26 });
    reg(hits, parkBrake, "park-brake");
    const key = group(dash, 0.05, 0.86, 0.14);
    box(key, 0.02, 0.05, 0.01, 0, 0.02, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9 });
    holoTag(key, "ignition key", 0, 0.22, 0.2, { css: BYF_CSS, w: 0.24 });
    reg(hits, key, "ignition-key");
    const pedal = group(dash, -0.1, 0.1, 0.25);
    box(pedal, 0.1, 0.04, 0.16, 0, 0, 0, 0x14171a, { rough: 0.6 });
    holoTag(pedal, "brake pedal — hold", 0, 0.3, 0.1, { css: BYF_CSS, w: 0.36 });
    reg(hits, pedal, "brake-pedal");
    const wheel = torus(dash, 0.16, 0.02, 0.05, 1.1, -0.05, 0x14171a, { rough: 0.6, seg: 8, seg2: 22 });
    wheel.rotation.x = -1.0;
    const tag = group(dash, 0.05, 1.0, 0.0);
    decal(tag, 0.12, 0.18, 0, 0, 0.03, paperFace("OUT OF SERVICE", ["do not", "operate"], { bg: "#f2c14b", band: "#d2312b" }), { px: 128 });
    tag.visible = false;
    const tagHit = box(dash, 0.2, 0.2, 0.1, 0.05, 1.05, 0.05, BYF_ACCENT, { opacity: 0.2, transparent: true, emissive: BYF_ACCENT, ei: 0.5, cast: false });
    holoTag(dash, "out-of-service tag", -0.25, 1.35, 0, { css: BYF_CSS, w: 0.36 });
    reg(hits, tagHit, "oos-tag");

    // ---------------------------------------------- shop, radio, paper
    const lockbox = group(g, -2.9, 0, 1.6, 0.4);
    cyl(lockbox, 0.03, 0.03, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    box(lockbox, 0.3, 0.3, 0.12, 0, 1.25, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    decal(lockbox, 0.22, 0.08, 0, 1.3, 0.065, signFace("SHOP KEYS", { accent: "#63b5f0", scale: 0.5 }), { px: 128 });
    holoTag(lockbox, "shop key lock box", 0, 1.6, 0, { css: BYF_CSS, w: 0.34 });
    reg(hits, lockbox, "key-lockbox");
    const chest = toolChest(g, -1.4, 2.0, { ry: 0.3, color: 0x2f4f6f });
    const radio = instrument(chest, 0.14, 0.79, 0.04, { ry: 0.1, idle: "CH 6 · YARD", color: BYF_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "yard radio", 0, 0.16, 0, { css: BYF_CSS, w: 0.22 });
    reg(hits, radio, "yard-radio");
    const tablet = group(chest, -0.14, 0.79, 0.0);
    box(tablet, 0.16, 0.012, 0.22, 0, 0.006, 0, 0x14171a, { rough: 0.4 });
    const tabScreen = decal(tablet, 0.14, 0.19, 0, 0.013, 0, signFace("DVIR", { bg: "#0d1c24", accent: "#63b5f0", fg: "#bfeaf7", scale: 0.6 }), { px: 128, glow: true, ei: 0.8 });
    tabScreen.rotation.x = -Math.PI / 2;
    holoTag(tablet, "inspection report", 0, 0.18, 0, { css: BYF_CSS, w: 0.32 });
    reg(hits, tablet, "dvir-tablet");
    const board = holoPanel(g, 0.95, 0.66, -2.35, 1.35, 0.85, (cx, w, h) => {
      cx.fillStyle = "#08131e"; cx.fillRect(0, 0, w, h); cx.fillStyle = BYF_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8ecfb"; cx.fillText("FUEL LANE 2 — COACH 418", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eef6fb";
      ["Engine off, key out · nozzle attended, no latch", "Diesel = green cap · DEF = blue cap", "Emergency fuel shutoff: post at lane end", "Spill kit at the island · drains covered",
       "Tonight: air brake check + pushrod stroke", "Defects: tag out, key to the shop box"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 1.0, accent: BYF_ACCENT });
    reg(hits, board, "lane-board");

    // ------------------------------------------ the hostler's coach behind
    const coach2 = group(g, 6.4, 0, -2.6);
    box(coach2, 3.2, 1.1, 1.0, 0, 0.85, 0, 0xe8eef2, { rough: 0.45, metal: 0.3 });
    box(coach2, 2.6, 0.34, 1.01, 0, 1.08, 0, 0x1d2c38, { rough: 0.2, metal: 0.3 });
    for (const x of [-1.1, 1.0]) for (const sz of [-1, 1]) cyl(coach2, 0.28, 0.28, 0.18, x, 0.28, sz * 0.48, 0x14171a, { rough: 0.85, seg: 14 }).rotation.x = Math.PI / 2;
    const reverseLamp = ball(coach2, 0.05, -1.62, 0.5, 0.3, 0xffffff, { emissive: 0xffffff, ei: 2.0 });
    void reverseLamp;
    coach2.visible = false;
    const coach2Home = coach2.position.clone();

    // ------------------------------------------------------------- crew
    const mate = standingFigure(g, -2.35, -1.75, { ry: 1.2, cloth: 0x2b3138, vest: 0xd8f23a, cap: 0x2f6fd0, gloves: true });
    holoTag(mate, "crew mate", 0, 1.95, 0, { css: BYF_CSS, w: 0.22 });
    const hostler = standingFigure(g, 3.1, 2.3, { ry: -2.4, cloth: 0x1b2a3a, vest: 0xd8f23a, cap: 0x2b3138 });
    holoTag(hostler, "yard hostler", 0, 1.95, 0, { css: BYF_CSS, w: 0.26 });
    cone(g, 2.9, 0.1); cone(g, -3.0, -2.0);

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 0.8, -0.8),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "chock") chockSpot.visible = false;
        if (step.id === "fuel-fill") repaint(dispScreen, signFace("412.6 L", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "walkaround") coolant.material = mat(0x3fd86a, { emissive: 0x3fd86a, ei: 1.2, rough: 0.1 });
        if (step.id === "air-build") repaint(airGauge.userData.screen, signFace("CUT-OUT", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        if (step.id === "low-air") lowAir.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.6, rough: 0.4 });
        if (step.id === "air-line") chafe.material = mat(0xd2312b, { emissive: 0x6a1a08, ei: 0.9 });
        if (step.id === "tag-out") { tag.visible = true; tagHit.visible = false; }
        if (step.id === "dvir-log") repaint(tabScreen, signFace("OOS · WRITTEN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("LANE CLEAR", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "spill-next-island") { puddle.visible = true; brokenHose.visible = true; }
        if (it.id === "hostler-backing") { coach2.visible = true; coach2.position.set(3.6, 0, -2.6); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "spill-next-island") { eButton.material = mat(0x6a1a14, { rough: 0.4 }); repaint(dispScreen, signFace("E-STOP", { bg: "#2a0c0c", accent: "#f0645b", fg: "#ffd8d0", scale: 0.6 })); puddle.scale.set(0.7, 1, 0.7); }
        if (it.id === "hostler-backing") coach2.position.copy(coach2Home);
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "cap-torque") cap.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "air-build") repaint(airGauge.userData.screen, signFace(`${Math.round(gg.t * 180)} psi`, { bg: "#0d1c24", accent: gg.t >= 0.58 && gg.t <= 0.72 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (gg && !gg.committed && step?.id === "pushrod") repaint(airGauge.userData.screen, signFace(`${(gg.t * 3.5).toFixed(2)} in`, { bg: "#0d1c24", accent: gg.t >= 0.36 && gg.t <= 0.56 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "applied-leak" && session.holding) pedal.rotation.x = -0.3 * session.track.v;
        if (step?.id === "pushrod") rod.position.z = 0.12 + (session?.gauge?.t ?? 0) * 0.06;
        void dt; void t; void CITY;
      },
    };
  },
};
