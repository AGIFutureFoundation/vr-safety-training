import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure,
  surfaceTexture, texturedMat, grassFace, concreteFace, palette, valveWheel, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Irrigation Controller, Valve Box & Backflow Check VR —
// Grounds & Landscaping.
//
// A grounds crew's own irrigation service call: the controller's schedule
// read before anything is touched, the panel locked out before it is
// opened, a valve box walked for the flooded splice and the stuck valve a
// gloved hand should never find by feel, a zone isolated, and the pressure
// vacuum breaker that keeps lawn water out of the drinking water actually
// tested — hose to hose, cock to cock, in the order the test procedure sets
// — rather than eyeballed. Generic building, generic crew: no clause number,
// pressure or watering-day rule this platform is not certain of, only "per
// the test procedure" and "per the water agency's own days".

const GKI_ACCENT = 0x3aa0c9;
const GKI_PAL = palette("grounds");

export const SIM_GK_IRRIGATION_CONTROLLER_VALVE_BOX_AND_BACKFLOW_CHECK = {
  id: "gk-irrigation-controller-valve-box-and-backflow-check",
  index: "gk-03",
  domain: "Grounds & Landscaping",
  trade: "Irrigation technician — SEIU grounds and building staff",
  category: "Grounds & Landscaping",
  district: "fairway-park",
  weather: "clear",
  certification: "ASSE 1020 pressure vacuum breaker assemblies and ASSE 5110 backflow-assembly tester qualification; AWWA M14 cross-connection control practice; OSHA 29 CFR 1910.147 control of hazardous energy and 29 CFR 1910.133 eye and face protection; SEIU grounds and building staff training",
  name: "Irrigation Controller, Valve Box & Backflow Check",
  title: simTitle("Irrigation Controller, Valve Box & Backflow Check"),
  tagline: "A service call on the system that keeps the turf alive: the controller's schedule read, the panel locked out, a flooded valve box walked rather than reached into, a zone isolated, and the backflow assembly tested hose to hose in the test procedure's own order",
  accent: GKI_ACCENT,
  accentCss: "#3aa0c9",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "cross-connection-proven", name: "Cross-Connection Proven", note: "Panel locked out, the valve box walked before a hand went near it, the zone isolated, and the backflow assembly tested clean in the procedure's own order" },

  supportLine: "your union steward or the building's employee assistance line",

  game: system({
    name: "Grounds Crew",
    currency: "GALLONS",
    ranks: ["Ground Hand", "Irrigation Tech", "Backflow Certified", "Crew Lead", "Grounds Certified"],
    badges: [
      { id: "locked-out", name: "Locked Out", note: "Never opened the panel without the breaker locked", test: AWARD.stepClean("lockout-controller") },
      { id: "box-respected", name: "Box Respected", note: "Never reached into the valve box before it was walked", test: AWARD.safe },
      { id: "clean-test", name: "Clean Test", note: "Connected the test hoses in the procedure's own order", test: AWARD.stepClean("connect-test-hoses") },
      { id: "steady-flow", name: "Steady Flow", note: "Held the pressure and flow readings near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "quick-call", name: "Quick Call", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-round", name: "Clean Round", note: "No corrections across the whole run", test: AWARD.clean },
      { id: "grounds-streak", name: "Grounds Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "reach-into-flooded-box": "You reached bare-handed into a flooded valve box with a wiring splice sitting in the water. Standing water around an energised splice does not announce which puddle is live and which is not, and a gloved hand reaching in blind is trusting a guess a multimeter or a walk-around would have settled first.",
    "bypass-backflow-assembly": "You opened the bypass valve around the backflow assembly. That bypass exists for emergencies with its own procedure, and opening it during a routine test connects the irrigation side straight to the drinking water supply with nothing left to stop fertiliser, pesticide residue or standing lawn water from siphoning back into it.",
    "hot-panel-no-lockout": "You opened the controller panel before the breaker was locked out. A panel that looks like a low-voltage timer on the outside still has a line-voltage feed behind that cover, and opening it on a guess instead of a locked-out and verified breaker is how a routine schedule change turns into a shock.",
    "test-cock-under-pressure": "You opened a test cock before the assembly was properly isolated. A test cock opened on a line that is still fully pressurised does not trickle — it sprays hard enough to reach an unprotected face, which is exactly the moment eye protection and a slow, deliberate valve sequence both exist for.",
  },

  lateNotes: {
    "stuck-valve": "A valve that will not turn by hand is a valve that gets worked with the proper tool and a plan, not forced — force on a stuck valve is how a body snaps instead of a stem turning free.",
    "hose-to-cock1": "The test procedure's own hose order exists because each connection references the pressure the one before it just set — out of order, the reading on the gauge does not mean what the procedure needs it to mean.",
  },

  interrupts: [
    {
      id: "stuck-zone-still-spraying",
      kind: "Valve failure",
      after: "hold-shutoff-drain", delay: 3, seconds: 11,
      alert: "A second zone valve has stuck open and its sprinkler heads are still spraying even though this zone's own shutoff is holding.",
      cue: "Close the second zone's manual shutoff before the drain-down continues.",
      target: "second-zone-manual-shutoff",
      why: "A drain-down that assumes one shutoff speaks for the whole system misses exactly this — a second zone with its own stuck valve keeps pressurising the line the crew believes is draining, and closing that second shutoff by hand is the only way to actually get the system to the state the work plan assumes it is already in.",
      missNote: "The second zone kept spraying while the drain-down continued. A system that is not actually isolated is not actually safe to open downstream of.",
      wrongNote: "Not that — close the second zone's manual shutoff before anything else about this drain-down matters.",
    },
    {
      id: "lateral-line-break",
      kind: "Line failure",
      after: "walk-zone-flow-check", delay: 4, seconds: 12,
      alert: "The flow reading has spiked and a lateral line has broken underground, sending a geyser up through the turf ahead.",
      cue: "Close the emergency shutoff before the break erodes any more of the bed.",
      target: "emergency-shutoff-valve",
      why: "A broken lateral line under pressure does not slow down while someone walks back to read the manual — the flow reading spiking is the system's own warning, and the emergency shutoff is what actually stops the geyser before it undermines the turf around it or floods a bed nobody meant to water at all.",
      missNote: "The geyser kept running while the flow reading stayed high. A break like this gets worse, not better, the longer the line stays pressurised.",
      wrongNote: "Not that — the emergency shutoff is what this break needs, before anything else about this walk continues.",
    },
  ],

  steps: [
    {
      id: "read-schedule-tag", kind: "select", target: "schedule-tag",
      title: "Read the controller's current schedule",
      cue: "Check the current watering schedule against the water agency's own days before changing anything.",
      why: "A schedule changed without first reading what is actually programmed risks undoing a setting the last service call made for a reason nobody wrote down — reading the current programme first is what keeps today's fix from becoming tomorrow's mystery.",
    },
    {
      id: "ppe-up", kind: "sequence", anyOrder: true,
      targets: ["eye-protection", "work-gloves"],
      itemNames: { "eye-protection": "eye protection", "work-gloves": "work gloves" },
      title: "Suit up before opening anything",
      cue: "Eye protection and work gloves before the panel or the valve box are opened.",
      why: "A backflow test cock opened under pressure and a valve box with wiring and standing water both reward the same two pieces of PPE — eye protection against a spray nobody planned for, and gloves against a splice or a sharp fitting a bare hand would otherwise find first.",
    },
    {
      id: "lockout-controller", kind: "select", target: "breaker-lockout",
      title: "Lock out the controller's breaker",
      cue: "Lock out the circuit breaker feeding the controller before opening its panel.",
      why: "A controller enclosure that looks like a low-voltage timer on the outside still carries a line-voltage feed behind the cover, and locking the breaker out before opening it is what turns a guess about whether it is de-energised into a fact the technician does not have to trust blind.",
    },
    {
      id: "valve-box-scan", kind: "find", noHint: true,
      targets: ["cracked-lid", "stuck-valve", "wiring-splice"],
      itemNames: { "cracked-lid": "the cracked valve box lid", "stuck-valve": "the valve that will not turn free", "wiring-splice": "the wiring splice sitting in standing water" },
      itemNotes: {
        "cracked-lid": "A cracked lid is a tripping hazard on the turf and an open invitation for whatever is living under it before anyone's hand goes near the box.",
        "stuck-valve": "A valve that resists turning is telling the technician something before it ever gets forced — force on a seized valve is how a stem snaps instead of a valve opening.",
        "wiring-splice": "A splice sitting in standing water is exactly the kind of thing a bare hand should never find out about by feel.",
      },
      decoyNotes: { "intact-valve-box": "That valve box is dry, its lid is seated and nothing inside looks disturbed. Nothing to flag there." },
      title: "Walk the valve box before reaching in",
      cue: "Three things about this valve box are not what they look like from a standing start — find them before a hand goes near it.",
      why: "A valve box that looks routine from above is not the same thing as a valve box someone has actually looked into, and a cracked lid, a seized valve or a submerged splice are exactly what a walk-around catches before a gloved hand finds them the hard way.",
    },
    {
      id: "open-valve-box", kind: "sequence", anyOrder: true,
      targets: ["lid-pry-tool", "standing-water-check", "wiring-inspect"],
      itemNames: { "lid-pry-tool": "lid pry tool", "standing-water-check": "standing water check", "wiring-inspect": "wiring inspection" },
      title: "Open the valve box properly",
      cue: "Pry the lid with the tool, check for standing water, and inspect the wiring before reaching inside.",
      why: "Prying the lid with a tool instead of fingers, checking for standing water and inspecting the wiring before reaching in are the three habits that turn opening a valve box from a blind reach into a checked, deliberate step.",
    },
    {
      id: "isolate-zone-valve", kind: "turn", target: "zone-shutoff-valve",
      title: "Isolate the zone before working on it",
      cue: "Turn the zone's own shutoff valve closed before disconnecting anything downstream.",
      why: "Isolating the zone at its own shutoff before disconnecting fittings downstream is what keeps a routine repair from becoming a pressurised line spraying the technician the moment a fitting comes apart.",
      turn: { turns: 0.5, axis: "z", label: "ZONE SHUTOFF" },
    },
    {
      id: "stage-test-kit", kind: "drag", target: "test-kit",
      title: "Stage the backflow test kit",
      cue: "Carry the test kit from the truck to the backflow assembly before connecting anything.",
      why: "Staging the whole test kit at the assembly before the first hose goes on means the test procedure runs start to finish without a walk back to the truck partway through with a test cock already open.",
      drag: { to: "backflow-test-socket", radius: 0.4, missNote: "Not at the assembly — carry the test kit to where the backflow assembly actually is." },
    },
    {
      id: "connect-test-hoses", kind: "sequence", anyOrder: false,
      targets: ["hose-to-cock1", "hose-to-cock2", "bleed-air"],
      itemNames: { "hose-to-cock1": "hose to test cock one", "hose-to-cock2": "hose to test cock two", "bleed-air": "bleed the air from the hoses" },
      outOfOrderNote: "That is out of the test procedure's own order. Cock one, then cock two, then bleed the air — out of order, the differential reading does not mean what the procedure needs it to mean.",
      title: "Connect the test hoses in the procedure's order",
      cue: "Connect the hose to test cock one, then test cock two, then bleed the air from both lines.",
      why: "The test procedure's hose order exists because each connection sets up the reference pressure the next one is measured against — connecting them out of order, or skipping the air bleed, gives a differential reading that looks like a result but is not actually measuring what the procedure needs it to measure.",
    },
    {
      id: "read-diff-pressure", kind: "gauge", target: "diff-pressure-gauge",
      title: "Read the differential pressure",
      cue: "Read the gauge and commit only inside the band the test procedure calls a pass.",
      why: "The differential pressure reading is the actual proof the check valve inside the assembly is holding — committing it only inside the procedure's own passing band is what makes this a test rather than a glance at a needle that looked about right.",
      gauge: {
        label: "DIFFERENTIAL PRESSURE", speed: 0.58, green: [0.42, 0.68],
        readout: (t) => `${(2 + t * 4).toFixed(1)} psid`,
        missNote: "Outside the passing band per the test procedure. Bleed the lines again and let the reading settle before committing it.",
      },
    },
    {
      id: "confirm-tester-cert", kind: "select", target: "cert-tag",
      title: "Confirm the tester's certification tag",
      cue: "Check the backflow assembly's own tag for the last certified test date before logging a new one.",
      why: "The assembly's certification tag is what the water agency and the next inspection both check — confirming the last date before adding a new one is what keeps the record honest about when this device was actually last proven to hold.",
    },
    {
      id: "hold-shutoff-drain", kind: "hold", target: "shutoff-valve", seconds: 5,
      title: "Hold the shutoff closed while the line drains",
      cue: "Hold the shutoff valve closed for the full drain-down before disconnecting the test hoses.",
      why: "A shutoff released early lets the line re-pressurise while the test hoses are still connected, which is exactly how a fitting under pressure comes apart in someone's hands instead of on a bench with the system actually drained.",
      holdBreakNote: "Let go of the shutoff before the line finished draining. Hold it closed for the full drain-down, every time.",
    },
    {
      id: "walk-zone-flow-check", kind: "track", target: "flow-meter", seconds: 8,
      title: "Walk the zone under the flow meter's reading",
      cue: "Keep the flow reading steady in band while walking the zone to confirm every head fires correctly.",
      why: "A steady flow reading while walking the zone is what confirms every head is firing the way the system expects — a reading that drifts out of band partway through the walk is the system's own way of saying a head is clogged, broken or missing before anyone has to find that out by eye alone.",
      track: {
        start: 0.16, green: [0.38, 0.6], rise: 0.48, fall: 0.42, drift: 0.12,
        label: "ZONE FLOW",
        readout: (v) => (v < 0.38 ? "reading low — a head may be blocked" : v > 0.6 ? "reading high — a break or open head" : "flow steady in band"),
      },
      holdBreakNote: "The flow reading drifted out of band during the walk. Bring the zone back to a steady reading before calling the walk finished.",
    },
    {
      id: "set-controller-program", kind: "select", target: "program-dial",
      title: "Set the controller's programme",
      cue: "Set the run times to the season and the water agency's own days, never a plain reset.",
      why: "Resetting the controller to its factory default undoes every adjustment a past service call made for this specific site's sun, soil and slope — setting the programme to the season and the water agency's own days is what keeps today's fix from being tomorrow's overwatered bed.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the service call log",
      cue: "Log the valve box findings, the test result and the programme change before leaving the site.",
      why: "The service log is what the next technician and the next inspection both read — a call handled cleanly but never logged leaves nothing behind to prove the valve box was checked, the assembly tested, and the programme actually set on purpose.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, GKI_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.2, 0.14, 5.8, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 9, a: "#3f7a3f", b: "#457f45" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xdfeecb },
    );
    const pad = box(g, 1.6, 0.02, 1.6, 1.8, 0.15, -1.4, 0xffffff, { rough: 0.9, cast: false });
    pad.material = texturedMat(
      surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom" }), { repeat: 3, px: 384 }),
      { rough: 0.9, metal: 0.02, color: 0xc7cac6 },
    );

    // ------------------------------------------------------------------ irrigation controller
    const cab = box(g, 0.4, 0.5, 0.2, -2.1, 0.65, 1.8, GKI_PAL.trim, { rough: 0.5, metal: 0.3 });
    const panelDoor = group(cab, 0.19, 0, 0, -0.3);
    box(panelDoor, 0.02, 0.44, 0.18, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const scheduleTagFace = decal(panelDoor, 0.16, 0.1, 0.011, 0.14, 0, signFace("SCHEDULE\nMON-WED-FRI", { bg: "#0d1c24", accent: "#3aa0c9", scale: 0.28 }), { px: 192 });
    reg(hits, scheduleTagFace, "schedule-tag");
    const breaker = box(panelDoor, 0.05, 0.09, 0.02, 0, -0.1, 0.1, 0xd2312b, { rough: 0.5 });
    reg(hits, breaker, "breaker-lockout");
    const programDial = cyl(panelDoor, 0.03, 0.03, 0.02, 0.05, -0.16, 0.1, 0xf2c14b, { rough: 0.5, seg: 12 });
    reg(hits, programDial, "program-dial");
    reg(hits, panelDoor, "hot-panel-no-lockout");
    holoTag(cab, "irrigation controller", 0, 0.98, 0, { css: "#3aa0c9", w: 0.4 });

    // ------------------------------------------------------------------ valve box
    const valveBox = group(g, -0.6, 0, 1.2, -0.3);
    box(valveBox, 0.5, 0.06, 0.5, 0, 0.03, 0, 0x3a4a3a, { rough: 0.85 });
    const lid = box(valveBox, 0.46, 0.02, 0.46, 0, 0.07, 0, 0x2f3a2f, { rough: 0.8 });
    reg(hits, lid, "cracked-lid");
    const water = box(valveBox, 0.4, 0.01, 0.4, 0, 0.035, 0, 0x2a4550, { rough: 0.15, transparent: true, opacity: 0.65 });
    reg(hits, water, "reach-into-flooded-box");
    const stuckValve = valveWheel(valveBox, -0.1, 0.03, 0.05, { r: 0.05, color: 0xb8402f });
    reg(hits, stuckValve, "stuck-valve");
    const spliceInWater = group(valveBox, 0.1, 0.035, -0.05);
    box(spliceInWater, 0.06, 0.01, 0.03, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    reg(hits, spliceInWater, "wiring-splice");
    const pryTool = box(g, 0.02, 0.02, 0.3, -0.9, 0.18, 1.6, 0x9aa1a8, { rough: 0.4, metal: 0.7 });
    reg(hits, pryTool, "lid-pry-tool");
    const waterCheck = box(valveBox, 0.08, 0.02, 0.08, -0.15, 0.05, -0.15, 0x2a4550, { rough: 0.3, transparent: true, opacity: 0.5 });
    reg(hits, waterCheck, "standing-water-check");
    const wiringInspectHit = box(valveBox, 0.06, 0.02, 0.06, 0.1, 0.05, -0.05, 0x2b3138, { rough: 0.5 });
    reg(hits, wiringInspectHit, "wiring-inspect");

    const intactBox = group(g, -1.4, 0, 1.9, 0.4);
    box(intactBox, 0.4, 0.06, 0.4, 0, 0.03, 0, 0x3a4a3a, { rough: 0.85 });
    box(intactBox, 0.36, 0.02, 0.36, 0, 0.06, 0, 0x2f3a2f, { rough: 0.8 });
    reg(hits, intactBox, "intact-valve-box");

    const zoneValve = valveWheel(g, -0.3, 0.14, 0.6, { r: 0.09, color: 0x2f6f4a });
    reg(hits, zoneValve, "zone-shutoff-valve");
    holoTag(zoneValve, "zone shutoff", 0, 0.5, 0, { css: "#3aa0c9", w: 0.3 });
    const secondZoneValve = valveWheel(g, 0.3, 0.14, 0.9, { r: 0.09, color: 0xb8402f });
    reg(hits, secondZoneValve, "second-zone-manual-shutoff");
    const emergencyValve = valveWheel(g, 2.0, 0.14, 0.4, { r: 0.1, color: 0xd2312b });
    reg(hits, emergencyValve, "emergency-shutoff-valve");
    holoTag(emergencyValve, "emergency shutoff", 0, 0.5, 0, { css: "#3aa0c9", w: 0.36 });

    // ------------------------------------------------------------------ backflow assembly
    const assembly = group(g, 1.8, 0.14, -1.4, -1.2);
    hose(assembly, [[-0.2, 0.3, 0], [0, 0.3, 0], [0.2, 0.3, 0]], 0.03, 0x9aa1a8, { steps: 8, rough: 0.4, metal: 0.6 });
    const cock1 = cyl(assembly, 0.025, 0.025, 0.06, -0.12, 0.3, 0, 0xb8402f, { rough: 0.5, metal: 0.4, seg: 10 });
    reg(hits, cock1, "hose-to-cock1");
    const cock2 = cyl(assembly, 0.025, 0.025, 0.06, 0.12, 0.3, 0, 0xb8402f, { rough: 0.5, metal: 0.4, seg: 10 });
    reg(hits, cock2, "hose-to-cock2");
    const bleedValve = cyl(assembly, 0.018, 0.018, 0.05, 0, 0.36, 0.06, 0x2f6f4a, { rough: 0.5, metal: 0.4, seg: 10 });
    reg(hits, bleedValve, "bleed-air");
    const bypass = cyl(assembly, 0.02, 0.02, 0.3, 0, 0.15, -0.2, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 10 });
    bypass.rotation.x = Math.PI / 2;
    reg(hits, bypass, "bypass-backflow-assembly");
    const shutoffOne = valveWheel(assembly, -0.28, 0.3, 0, { r: 0.06, color: 0x2f6f4a });
    reg(hits, shutoffOne, "shutoff-valve");
    const cockPressureZone = box(assembly, 0.06, 0.06, 0.06, -0.12, 0.34, 0.03, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cockPressureZone, "test-cock-under-pressure");
    const certTagFace = decal(assembly, 0.14, 0.09, 0.1, 0.44, 0, signFace("TEST DATE\nON FILE", { bg: "#0d1c24", accent: "#3aa0c9", scale: 0.26 }), { px: 192 });
    reg(hits, certTagFace, "cert-tag");
    holoTag(assembly, "backflow assembly", 0, 0.6, 0, { css: "#3aa0c9", w: 0.36 });

    const testKit = group(g, 2.5, 0, 1.6, -0.5);
    box(testKit, 0.3, 0.14, 0.4, 0, 0.07, 0, 0xb8402f, { rough: 0.5 });
    reg(hits, testKit, "test-kit");
    const testKitSocket = group(g, 1.8, 0, -1.0);
    hits["backflow-test-socket"] = testKitSocket;

    const chest = toolChest(g, 2.5, -0.4, { ry: 0.4, color: GKI_ACCENT });
    const pressureGauge = instrument(chest, 0.16, 0.79, 0.06, { ry: -0.4, idle: "-- psid", color: GKI_ACCENT });
    holoTag(pressureGauge, "differential pressure gauge", 0, 0.16, 0, { css: "#3aa0c9", w: 0.42 });
    reg(hits, pressureGauge, "diff-pressure-gauge");
    const flowMeterInst = instrument(chest, -0.16, 0.79, 0.06, { ry: -0.4, idle: "-- gpm", color: GKI_ACCENT });
    holoTag(flowMeterInst, "flow meter", 0, 0.16, 0, { css: "#3aa0c9", w: 0.26 });
    reg(hits, flowMeterInst, "flow-meter");

    const ppeRack = group(g, -2.4, 0, -1.0, 0.4);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const eyeProp = box(ppeRack, 0.1, 0.04, 0.02, -0.08, 0.55, 0, 0x2b3138, { rough: 0.4 });
    reg(hits, eyeProp, "eye-protection");
    const gloveProp = box(ppeRack, 0.1, 0.05, 0.02, 0.08, 0.5, 0, 0x8a6a3a, { rough: 0.8 });
    reg(hits, gloveProp, "work-gloves");

    const lock = lockTag(g, -2.4, 0.9, 1.6, { color: 0xd2312b });
    lock.visible = false;

    const closingLog = group(g, 2.7, 0, -2.0, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("SERVICE LOG\nOPEN", { bg: "#11181f", accent: "#3aa0c9", scale: 0.24 }), { px: 320 });
    holoTag(closingLog, "service log", 0, 1.34, 0, { css: "#3aa0c9", w: 0.32 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ crew
    const tech = standingFigure(g, 1.0, 2.0, { ry: -2.2, cloth: 0x2b3138, vest: GKI_ACCENT, helmet: 0xf2f2f2 });
    holoTag(tech, "irrigation tech", 0, 1.95, 0.15, { css: "#3aa0c9", w: 0.32 });

    const spray = particles(assembly, 16, 0x9adfef, { size: 0.02, life: 0.5, additive: true, opacity: 0.5 });
    spray.visible = false;
    const geyser = particles(emergencyValve, 20, 0x9adfef, { size: 0.03, life: 0.6, additive: true, opacity: 0.55 });
    geyser.visible = false;

    return {
      hits,
      footprint: 2.6,

      onInterrupt(it) {
        if (it.id === "stuck-zone-still-spraying") { spray.visible = true; }
        if (it.id === "lateral-line-break") { geyser.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "stuck-zone-still-spraying") { spray.visible = false; }
        if (it.id === "lateral-line-break") { geyser.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "lockout-controller") { lock.visible = true; }
        if (step.id === "valve-box-scan") {
          lid.material = mat(0x59c97b, { rough: 0.6 });
          stuckValve.userData.wheel.material = mat(0x59c97b, { rough: 0.6 });
          spliceInWater.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("SERVICE LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.24 }));
        }
      },
      onHazard(hitId) { if (hitId === "test-cock-under-pressure") { spray.visible = true; } },

      animate(t, dt, session) {
        tech.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (spray.visible) spray.userData.step(dt, new THREE.Vector3(0, 0.6, 0), 0.1, 0.1, 0.2);
        if (geyser.visible) geyser.userData.step(dt, new THREE.Vector3(0, 1.2, 0), 0.08, 0.08, 0.6);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "read-diff-pressure") {
          const v = (2 + gg.t * 4).toFixed(1);
          repaint(pressureGauge.userData.screen, signFace(`${v} psid`, {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.68 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
        const tk = session?.track;
        if (tk && session.step?.id === "walk-zone-flow-check") {
          const gpm = (6 + tk.v * 10).toFixed(1);
          repaint(flowMeterInst.userData.screen, signFace(`${gpm} gpm`, {
            bg: "#0d1c24", accent: tk.v > 0.38 && tk.v < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
