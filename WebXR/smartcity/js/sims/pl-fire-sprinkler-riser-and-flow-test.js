import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, valveWheel, pipeRun, lockTag, deckPlateFace, surfaceTexture, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Fire Sprinkler Riser & Flow Test VR — Building Systems &
// Facilities, UA plumbers and pipefitters (Road Sprinkler Fitters).
//
// A sprinkler system's only real test happens once a year, and it happens
// on a system nobody wants to see fail — which is exactly why NFPA 25
// requires it anyway. Two separate things get proven on the same riser: the
// main drain test, which shows whether the supply feeding this building has
// quietly gotten worse since last year, and the flow test through the
// inspector's test connection, which proves an actual sprinkler-equivalent
// flow still trips the alarm, rings the gong outside and reaches the
// monitoring company. Skip the call to the monitoring company first and the
// flow test does not prove the alarm works — it dispatches a fire
// department to a building that is not on fire.

const FSR_ACCENT = 0xd8232a;

export const SIM_PL_FIRE_SPRINKLER_RISER_AND_FLOW_TEST = {
  id: "pl-fire-sprinkler-riser-and-flow-test",
  index: "pl-04",
  domain: "Building Systems & Facilities",
  trade: "UA sprinkler fitter",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "UA plumbers and pipefitters apprenticeship (Road Sprinkler Fitters); NFPA 13 installation of sprinkler systems; NFPA 25 inspection, testing and maintenance of water-based fire protection systems; 29 CFR 1910.147 the control of hazardous energy; 8 CCR 3203 injury and illness prevention",
  name: "Fire Sprinkler Riser & Flow Test",
  title: simTitle("Fire Sprinkler Riser & Flow Test"),
  tagline: "The monitoring company called before a drop of water moves, the main drain and the inspector's test connection each read in order, and the alarm proven to reach the gong and the panel before the riser goes back to normal",
  accent: FSR_ACCENT,
  accentCss: "#d8232a",
  parSeconds: 265,
  footprint: 2.2,
  badge: { id: "riser-proven", name: "Riser Proven", note: "An annual flow test run with the monitoring company notified first and the alarm proven all the way to the panel" },

  game: system({
    name: "Water-Based Protection",
    currency: "GPM",
    ranks: ["Apprentice", "Sprinkler Fitter", "Journeyman", "Lead Fitter", "ITM Certified"],
    badges: [
      { id: "called-first", name: "Called First", note: "The monitoring company was notified before any valve moved", test: AWARD.stepClean("notify") },
      { id: "never-unsupervised", name: "Never Unsupervised", note: "The control valve was never left closed without a tag", test: AWARD.safe },
      { id: "true-residual", name: "True Residual", note: "Read both gauges precisely inside the expected band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-test", name: "Clean Test", note: "No corrections anywhere in the test", test: AWARD.clean },
      { id: "unbroken-watch", name: "Unbroken Watch", note: "The alarm timing watch never lapsed", test: AWARD.unbroken },
      { id: "riser-back-fast", name: "Riser Back Fast", note: "Signed off inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-notify": "You opened the inspector's test valve without calling the monitoring company first. The flow this test creates looks exactly like a real sprinkler activation to the panel and the monitoring company both, and the fire department that responds to it is answering a call for a building that is not on fire — one this crew created by skipping a phone call.",
    "close-valve-untagged": "You closed the control valve without tagging it. A supervised valve that gets closed and forgotten is a sprinkler system with nothing behind the piping, and nobody finds out until the day it actually matters, because a closed valve with no tag on it looks, from across the room, exactly like an open one.",
    "unrouted-drain": "You opened the main drain without routing the discharge anywhere. That much water has to go somewhere, and 'somewhere' turned out to be across the floor of the riser room and into the electrical panel it shares the wall with.",
    "sign-off-no-alarm": "You signed the test off as a pass without the alarm ever actually sounding. A flow test that does not end in a working alarm did not prove anything except that water can move through a pipe — the entire point of the test was whether the building finds out when it does.",
  },

  lateNotes: {
    "confirm-valve-open": "The control valve stays open through this whole test — it is the drain and the inspector's test valve that do the work, not the OS&Y.",
    "test-valve": "The inspector's test valve opens after the monitoring company has already been called, not before.",
    "alarm-timer": "The test valve closes once the alarm has been read and timed, not the moment the water first shows in the sight glass.",
  },

  // Two things a fitter with a stopwatch on the flow test and a hand on the
  // valve has no spare attention for. See shared/game.js.
  interrupts: [
    {
      id: "monitoring-callback",
      kind: "The monitoring company calls back mid-test",
      // Armed on entering the alarm-timing track step, so the window lands
      // right when attention is on the stopwatch — answered at the phone,
      // not the test valve.
      after: "open-test-valve", delay: 2, seconds: 12,
      alert: "The monitoring company is calling back — they want a live voice confirming this is still a test before they hold their dispatch.",
      cue: "That call is the only thing standing between this test and a truck rolling. Answer it before you do anything else.",
      target: "monitoring-phone",
      why: "A monitoring company that calls back mid-test is doing exactly what the earlier notification call was supposed to make unnecessary — confirming, a second time, that the signal they are about to see is this crew and not a real fire. Leaving that call unanswered while the flow test carries on is how a confirmed test turns into a dispatched fire department anyway.",
      missNote: "The phone rang out while the test kept running. With nobody confirming it, the monitoring company had no reason not to treat the signal as real.",
      wrongNote: "It is the phone. The test valve was never in doubt — whether a fire truck gets sent is.",
    },
    {
      id: "other-zone-tamper",
      kind: "A tamper switch trips on a different floor",
      // Armed after the alarm is confirmed, answered at the panel rather
      // than at the riser this test is actually being run on.
      after: "confirm-alarm", delay: 3, seconds: 12,
      alert: "The panel just logged a tamper supervisory on a control valve two floors up — a system this test never touched.",
      cue: "That is a separate valve, on a separate floor, telling you it just moved. Check the panel before you close anything out here.",
      target: "fire-panel",
      why: "A tamper supervisory from a floor this test was never near means somebody, somewhere in the building, just closed or is closing a sprinkler control valve without a permit — and the panel is the only place that shows up. Reading it now, while it is fresh, is what turns a logged event into someone actually going to check that valve today instead of a line in a report nobody opens.",
      missNote: "The tamper signal sat on the panel unread while this riser got signed off. Whatever valve moved two floors up is still unaccounted for.",
      wrongNote: "It is the fire panel. Nothing on this riser explains a tamper switch tripping on a different floor.",
    },
  ],

  steps: [
    {
      id: "drawing", kind: "select", target: "riser-diagram",
      title: "Read the riser diagram and last year's report",
      cue: "Check the riser diagram and last year's ITM report before touching anything.",
      why: "NFPA 25 expects this year's test to be read against last year's numbers, not taken in isolation — a residual pressure that has crept down every year for three years running is a trend the drawing and the report together can show, and a single reading on its own cannot.",
    },
    {
      id: "confirm-zone", kind: "select", target: "zone-tag",
      title: "Confirm this riser's zone before testing",
      cue: "Check the zone tag against the work order — this building has more than one riser.",
      why: "A building with several risers has several separate alarm zones reporting to the same monitoring company and the same panel, and a fitter who calls in a test on the wrong zone number has the monitoring company watching for a signal that is never going to come from the riser actually about to flow.",
    },
    {
      id: "notify", kind: "sequence",
      targets: ["notify-monitoring", "notify-building"],
      itemNames: { "notify-monitoring": "monitoring company notified", "notify-building": "building contact told" },
      title: "Notify the monitoring company and the building",
      cue: "Call the monitoring company to place the system on test, then tell the building's fire safety contact.",
      why: "The flow this test is about to create reads on the monitoring company's board as a real sprinkler activation, and the only thing that keeps it from becoming a dispatched fire department is a phone call placing the system on test before a single valve moves — the building contact is told second, because they need to know water is about to run, not because it comes before the call that actually controls what the fire department sees.",
      outOfOrderNote: "Monitoring company first — that call is what keeps a fire department from responding to a test nobody asked them to.",
    },
    {
      id: "inspect-riser", kind: "find", noHint: true,
      targets: ["gauge-not-zeroed", "obstructed-drain-path"],
      itemNames: { "gauge-not-zeroed": "gauge needle not resting on zero", "obstructed-drain-path": "storage blocking the drain discharge path" },
      itemNotes: {
        "gauge-not-zeroed": "This gauge needle is not resting at zero with the system static — a gauge that reads wrong at rest reads wrong under flow too.",
        "obstructed-drain-path": "Somebody has stacked boxes in front of where the main drain discharges. That water needs a clear, controlled path before the valve opens, not a pile of storage to find its way around.",
      },
      title: "Inspect the riser room before the test",
      cue: "Look over the riser and the room around it before any valve moves.",
      why: "A gauge that is already wrong at rest and a blocked drain path are both invisible in a glance at the valves themselves, and both turn a routine test into a mess — one gives every reading that follows a built-in error, the other sends the main drain's full flow somewhere nobody planned for it to go.",
    },
    {
      id: "read-static", kind: "gauge", target: "supply-gauge",
      title: "Read the static supply pressure",
      cue: "Read the supply gauge with the system at rest and commit the static reading.",
      why: "The static pressure is the baseline every other reading on this test gets compared against, and it has to be read before the drain opens — a static reading taken after water is already moving somewhere on the system is not static at all, it is just an early residual reading with the wrong label on it.",
      gauge: { label: "STATIC", speed: 0.6, green: [0.5, 0.7], readout: (t) => `${Math.round(t * 150)} psi`, missNote: "That reading was taken with something already flowing — reset and read it truly static." },
    },
    {
      id: "main-drain", kind: "hold", target: "main-drain-valve", seconds: 6,
      title: "Open the main drain and hold it fully open",
      cue: "Hold the main drain valve fully open until the residual pressure stabilises.",
      why: "The main drain test loads the actual supply main feeding this riser, not just the piping inside the room, and it has to stay open long enough for the pressure to stabilise at its true residual value — closing it early catches the pressure still falling and reports a number that is not the supply's real answer.",
      holdBreakNote: "The drain closed before the reading settled — hold it open again until the residual pressure actually stabilises.",
    },
    {
      id: "read-residual", kind: "gauge", target: "residual-gauge",
      title: "Read the residual pressure under drain flow",
      cue: "Read the residual gauge while the drain is still flowing and commit the reading.",
      why: "Comparing this residual reading against the static reading and against last year's numbers is how a supply that has quietly degraded — a partially closed valve upstream, a main starting to scale — gets caught on paper before it ever gets caught by a fire that needed every gallon this system was designed to deliver.",
      gauge: { label: "RESIDUAL", speed: 0.65, green: [0.34, 0.52], readout: (t) => `${Math.round(t * 150)} psi`, missNote: "That residual reading is outside what last year's report would expect — recheck before writing it down." },
    },
    {
      id: "close-drain", kind: "sequence",
      targets: ["main-drain-valve", "confirm-valve-open"],
      itemNames: { "main-drain-valve": "main drain closed", "confirm-valve-open": "control valve confirmed fully open" },
      title: "Close the drain and confirm the control valve",
      cue: "Close the main drain, then confirm the control valve is still fully open.",
      why: "The control valve was never touched during the main drain test, but confirming it is still fully open — not just closing the drain and assuming — is what catches a valve that someone bumped or that has slowly crept off its full-open position without anyone noticing.",
      outOfOrderNote: "Drain first, then confirm the valve — checking the valve before the drain is closed just adds noise while water is still moving.",
    },
    {
      id: "route-discharge", kind: "drag", target: "discharge-hose",
      title: "Route the test discharge before opening the valve",
      cue: "Drag the discharge hose from the test connection to the floor drain before any water moves.",
      why: "The inspector's test connection dumps its flow somewhere the moment the valve opens, and deciding where that is happens before the valve turns, not after the water is already running across the floor looking for the nearest low point — the same lesson the unrouted main drain just taught, applied to the second valve on this test.",
      drag: { to: "drain-point", radius: 0.4, missNote: "Not routed to the drain — that flow needs a controlled path before the valve opens, not a guess at where it will end up." },
    },
    {
      id: "open-test-valve", kind: "turn", target: "test-valve",
      title: "Open the inspector's test valve",
      cue: "Open the inspector's test valve fully to simulate a single sprinkler head flowing.",
      why: "The inspector's test connection is sized to flow the same as one sprinkler head, which is what makes it a fair test of whether the alarm and the monitoring company actually respond to the smallest real activation this system is designed to have — not a flood-scale flow that would trip an alarm regardless of whether the smaller, real-world case works.",
      turn: { turns: 0.75, axis: "y", label: "INSPECTOR'S TEST" },
    },
    {
      id: "time-alarm", kind: "track", target: "alarm-timer", seconds: 8,
      title: "Time the alarm from flow to activation",
      cue: "Watch the stopwatch and keep the flow steady until the alarm activates within the window.",
      why: "An alarm that takes noticeably longer to activate than it did last year is telling you something changed in the waterflow switch or the retard chamber even though the alarm technically still worked — timing it, not just waiting for it to eventually go off, is what turns a slow alarm from a passed test into a flagged one.",
      track: { start: 0.5, green: [0.4, 0.65], rise: 0.08, fall: 0.2, drift: 0.1, label: "FLOW STEADY", readout: (v) => (v < 0.4 ? "flow dropping — hold it steady" : v > 0.65 ? "surging — ease off" : "steady flow") },
      holdBreakNote: "The flow wobbled during the timing window — hold it steadier, an uneven flow makes the activation time unreliable.",
    },
    {
      id: "confirm-alarm", kind: "find",
      targets: ["water-motor-gong", "panel-flow-light"],
      itemNames: { "water-motor-gong": "water motor gong sounding", "panel-flow-light": "flow light lit on the panel" },
      itemNotes: {
        "water-motor-gong": "The exterior water motor gong is turning and sounding — that is the mechanical alarm nobody can silence from inside the building.",
        "panel-flow-light": "The fire alarm panel shows a waterflow light lit for this riser's zone, which is the electrical half of the same alarm.",
      },
      title: "Confirm the alarm reached both places",
      cue: "Confirm the gong outside and the flow light on the panel both show the alarm.",
      why: "The mechanical gong and the electrical panel signal are two separate paths to the same alarm, and NFPA 25 expects both proven working because either one failing independently still leaves a building with half its warning system silently gone — a fitter who only checks the panel has not actually proven the gong still turns.",
    },
    {
      id: "close-out", kind: "sequence",
      targets: ["test-valve", "panel-flow-light", "notify-monitoring"],
      itemNames: { "test-valve": "test valve closed", "panel-flow-light": "alarm confirmed reset", "notify-monitoring": "monitoring company told test is complete" },
      title: "Close the test out",
      cue: "Close the inspector's test valve, confirm the alarm resets, then tell the monitoring company the test is complete.",
      why: "Telling the monitoring company the test is finished is what takes the system off test status on their board — skip that call and the very next real activation on this riser can be dismissed by a monitoring operator who still thinks this crew is testing it.",
      outOfOrderNote: "Close the valve, confirm the reset, then call it in — calling it complete before the alarm has actually reset tells the monitoring company something that is not yet true.",
    },
    {
      id: "report", kind: "select", target: "itm-report",
      title: "Complete the ITM report",
      cue: "Fill in the inspection, testing and maintenance report with both pressures and the alarm time.",
      why: "NFPA 25 exists as an annual record specifically so this year's numbers can be compared against every year before it, and a test with no written report is a test that next year's fitter has nothing to compare their own readings against.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, FSR_ACCENT);

    const floorTex = surfaceTexture((ctx, w, h) => deckPlateFace(ctx, w, h, { base: "#3d4247", base2: "#33383c" }), { repeat: 5 });
    box(g, 5.2, 0.1, 4.4, 0, 0.05, 0, 0xffffff, { rough: 0.6 }).material = texturedMat(floorTex, { color: 0xcfd3d6, rough: 0.6, metal: 0.15 });

    const blockTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#8f9498"; ctx.fillRect(0, 0, w, h);
      const rows = 5, cols = 9;
      for (let r = 0; r <= rows; r++) { ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, (r / rows) * h); ctx.lineTo(w, (r / rows) * h); ctx.stroke(); }
      for (let r = 0; r < rows; r++) { const off = r % 2 ? (w / cols) / 2 : 0; for (let c = 0; c <= cols; c++) { const x = off + (c / cols) * w; ctx.beginPath(); ctx.moveTo(x, (r / rows) * h); ctx.lineTo(x, ((r + 1) / rows) * h); ctx.stroke(); } }
    }, { repeat: 2 });
    box(g, 5.2, 2.6, 0.12, 0, 1.4, -2.0, 0xffffff, { rough: 0.9 }).material = texturedMat(blockTex, { color: 0x8f9498, rough: 0.9 });
    box(g, 5.2, 0.14, 0.3, 0, 2.75, -2.0, 0x99a2a8, { rough: 0.8 });

    // The riser: a red-painted vertical run with the alarm check valve,
    // OS&Y, gauges and the inspector's test connection.
    const stripeTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#b81f1f"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      for (let i = 0; i < 8; i++) ctx.fillRect(0, (i / 8) * h, w, 4);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      for (let i = 0; i < 40; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 6);
    }, { repeat: 1 });
    const riser = group(g, -0.6, 0, -1.7);
    const riserPipe = cyl(riser, 0.11, 0.11, 2.0, 0, 1.0, 0, 0xffffff, { rough: 0.5, seg: 20 });
    riserPipe.material = texturedMat(stripeTex, { color: 0xb81f1f, rough: 0.5, metal: 0.15 });
    holoTag(riser, "sprinkler riser", 0, 2.15, 0, { css: "#d8232a", w: 0.36 });
    const zoneTagPlate = decal(riser, 0.16, 0.1, -0.16, 1.95, 0, signFace("ZONE 4", { bg: "#2a0d0d", accent: "#d8232a", scale: 0.55 }));
    reg(hits, zoneTagPlate, "zone-tag");

    const controlValve = valveWheel(riser, 0.2, 1.6, 0, { color: 0xd8232a, body: 0x2b2f34, r: 0.1 });
    holoTag(riser, "OS&Y control valve", 0.2, 1.9, 0, { css: "#d8232a", w: 0.4 });
    reg(hits, controlValve, "confirm-valve-open");
    const lock = lockTag(riser, 0.2, 1.35, 0, { color: 0xd8232a, lines: ["VALVE", "SUPERVISED"] });
    void lock;
    const closeUntaggedTarget = box(g, 0.2, 0.2, 0.2, -0.35, 1.6, -1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "close it without a tag?", -0.35, 1.82, -1.7, { css: "#d2312b", w: 0.5 });
    reg(hits, closeUntaggedTarget, "close-valve-untagged");

    const alarmCheck = cyl(riser, 0.13, 0.13, 0.34, 0, 1.15, 0, 0xc9a94f, { rough: 0.5, metal: 0.6, seg: 18 });
    holoTag(riser, "alarm check valve", 0.25, 1.15, 0, { css: "#d8232a", w: 0.4 });
    void alarmCheck;
    const supplyGauge = instrument(riser, -0.2, 0.7, 0, { idle: "-- psi", color: 0x2b2f34, w: 0.15, d: 0.18, ry: 0.5 });
    holoTag(riser, "supply gauge", -0.2, 0.9, 0, { css: "#d8232a", w: 0.32 });
    reg(hits, supplyGauge, "supply-gauge");
    const residualGauge = instrument(riser, -0.2, 1.5, 0, { idle: "-- psi", color: 0x2b2f34, w: 0.15, d: 0.18, ry: 0.5 });
    holoTag(riser, "system gauge", -0.2, 1.7, 0, { css: "#d8232a", w: 0.32 });
    reg(hits, residualGauge, "residual-gauge");
    const badGauge = instrument(g, -1.5, 0.9, -1.3, { idle: "5 psi", color: 0x2b2f34, w: 0.13, d: 0.15 });
    reg(hits, badGauge, "gauge-not-zeroed");

    const drainAssembly = group(riser, 0.2, 0.3, 0.15, 0.4);
    const drainValve = valveWheel(drainAssembly, 0, 0, 0, { color: 0x4fd1ff, body: 0x2b2f34, r: 0.08 });
    holoTag(drainAssembly, "main drain", 0, 0.28, 0, { css: "#d8232a", w: 0.32 });
    reg(hits, drainValve, "main-drain-valve");
    const drainPipe = cyl(drainAssembly, 0.04, 0.04, 0.6, 0, -0.3, 0.1, 0x9aa3ab, { rough: 0.5, metal: 0.6, seg: 12 });
    void drainPipe;
    const boxes = group(g, -0.1, 0, -1.15);
    for (let i = 0; i < 3; i++) box(boxes, 0.3, 0.24, 0.3, i * 0.28 - 0.28, 0.12, 0, 0xb8834a, { rough: 0.8 });
    holoTag(boxes, "storage blocking the drain", 0, 0.32, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, boxes, "obstructed-drain-path");
    const drainSplash = box(g, 0.6, 0.02, 0.5, 0.1, 0.02, -1.0, 0x2b4a55, { rough: 0.2, opacity: 0.001, transparent: true, cast: false });
    reg(hits, drainSplash, "unrouted-drain");

    // Inspector's test connection with a sight glass.
    const testAssembly = group(g, 0.5, 0.1, -1.35, -0.3);
    const testValve = valveWheel(testAssembly, 0, 0.9, 0, { color: 0xd8232a, body: 0x2b2f34, r: 0.08 });
    holoTag(testAssembly, "inspector's test valve", 0, 1.15, 0, { css: "#d8232a", w: 0.46 });
    reg(hits, testValve, "test-valve");
    const sightGlass = cyl(testAssembly, 0.03, 0.03, 0.12, 0.1, 0.7, 0, 0xbfe6f5, { rough: 0.15, opacity: 0.7, transparent: true, seg: 12 });
    void sightGlass;

    // The discharge hose, coiled and staged until it is dragged to the drain.
    const dischargeHose = group(g, 1.1, 0.1, -1.0, 0.4);
    torus(dischargeHose, 0.09, 0.025, 0, 0.03, 0, 0x2b6fd8, { rough: 0.5, seg: 10, seg2: 20 });
    torus(dischargeHose, 0.07, 0.025, 0, 0.08, 0, 0x2b6fd8, { rough: 0.5, seg: 10, seg2: 20 });
    holoTag(dischargeHose, "discharge hose", 0, 0.2, 0, { css: "#d8232a", w: 0.36 });
    reg(hits, dischargeHose, "discharge-hose");

    const floorDrain = group(g, 0.9, 0.06, -0.5);
    cyl(floorDrain, 0.1, 0.1, 0.02, 0, 0, 0, 0x3a3f44, { rough: 0.6, metal: 0.5, seg: 16 });
    for (let i = -2; i <= 2; i++) box(floorDrain, 0.16, 0.006, 0.012, 0, 0.011, i * 0.02, 0x2b2f34, { rough: 0.5, metal: 0.6 });
    holoTag(floorDrain, "floor drain", 0, 0.14, 0, { css: "#d8232a", w: 0.3 });
    hits["drain-point"] = floorDrain;

    // Gong, panel, and the alarm timer.
    const gong = group(g, 2.2, 1.8, -1.9, -0.5);
    cyl(gong, 0.16, 0.16, 0.05, 0, 0, 0, 0xd8b23a, { rough: 0.4, metal: 0.7, seg: 20 });
    holoTag(gong, "water motor gong", 0, 0.24, 0, { css: "#d8232a", w: 0.4 });
    reg(hits, gong, "water-motor-gong");

    const panel = group(g, 1.9, 0.9, -1.95, -0.4);
    box(panel, 0.4, 0.5, 0.12, 0, 0, 0, 0xdfe6ec, { rough: 0.4 });
    const flowLight = ball(panel, 0.03, -0.1, 0.1, 0.07, 0x3a3f44, { emissive: 0x000000, ei: 0 });
    holoTag(panel, "fire alarm panel", 0, 0.32, 0, { css: "#d8232a", w: 0.42 });
    reg(hits, flowLight, "panel-flow-light");
    hits["fire-panel"] = panel;
    const tamperLight = ball(panel, 0.02, 0.1, -0.05, 0.07, 0x3a3f44, { emissive: 0x000000, ei: 0 });
    void tamperLight;

    const timerInst = instrument(g, 0.5, 1.5, -0.9, { idle: "0.0 s", color: 0x2b2f34, w: 0.16, d: 0.18 });
    holoTag(g, "alarm stopwatch", 0.5, 1.7, -0.9, { css: "#d8232a", w: 0.34 });
    reg(hits, timerInst, "alarm-timer");

    // Bench: riser diagram, phone, report.
    const bench = group(g, -1.9, 0.1, 0.8);
    box(bench, 1.2, 0.76, 0.55, 0, 0.38, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const drawing = decal(bench, 0.34, 0.42, -0.35, 0.78, 0, paperFace("RISER DIAGRAM", ["System: wet pipe", "Zone: floor 4", "Last static/residual on file", "Design area per drawing"], { scale: 0.82 }));
    drawing.rotation.x = -Math.PI / 2;
    holoTag(bench, "riser diagram", -0.35, 0.98, 0, { css: "#d8232a", w: 0.34 });
    reg(hits, drawing, "riser-diagram");
    const phone = box(bench, 0.08, 0.15, 0.04, 0.0, 0.86, -0.2, 0x1b1e23, { rough: 0.6 });
    holoTag(bench, "call the monitoring company", 0.0, 1.05, -0.2, { css: "#d8232a", w: 0.5 });
    reg(hits, phone, "notify-monitoring");
    hits["monitoring-phone"] = phone;
    const buildingTag = box(bench, 0.12, 0.02, 0.1, 0.24, 0.8, -0.15, 0xd2312b, { rough: 0.7 });
    holoTag(bench, "tell the building contact", 0.24, 0.98, -0.15, { css: "#d8232a", w: 0.5 });
    reg(hits, buildingTag, "notify-building");
    const skipNotifyTarget = box(bench, 0.22, 0.22, 0.22, -0.5, 0.9, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bench, "just open the test valve?", -0.5, 1.12, -0.3, { css: "#d2312b", w: 0.5 });
    reg(hits, skipNotifyTarget, "skip-notify");
    const report = decal(bench, 0.32, 0.4, 0.35, 0.78, 0.02, paperFace("ITM REPORT", ["Static ___ psi", "Residual ___ psi", "Alarm time ___ s", "Gong / panel: pass"], { scale: 0.85 }));
    report.rotation.x = -Math.PI / 2;
    holoTag(bench, "ITM report", 0.35, 0.98, 0.05, { css: "#d8232a", w: 0.3 });
    reg(hits, report, "itm-report");
    const signOffNoAlarm = box(bench, 0.2, 0.2, 0.2, 0.55, 0.9, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bench, "sign it off anyway?", 0.55, 1.12, -0.2, { css: "#d2312b", w: 0.44 });
    reg(hits, signOffNoAlarm, "sign-off-no-alarm");

    const boardPanel = group(g, 2.0, 0, 1.8, -0.5);
    holoPanel(boardPanel, 0.95, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#2a0d0d"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#d8232a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fbdede"; ctx.fillText("ANNUAL FLOW TEST — RISER 4", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fff0f0";
      ["Call the monitoring company before any valve moves", "Read static before the drain opens", "Hold the drain open until residual stabilises", "Time the alarm from flow to activation", "Confirm the gong AND the panel light", "Call it complete when you're actually done"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { accent: FSR_ACCENT });

    const fitter = standingFigure(g, -1.2, 1.3, { ry: -2.3, cloth: 0xb81f1f });
    holoTag(fitter, "sprinkler fitter", 0, 1.9, 0, { css: "#d8232a", w: 0.32 });
    toolChest(g, 2.3, 1.5);
    for (const [x, z] of [[2.2, -2.0], [-2.3, -2.0]]) cone(g, x, z);

    let flowing = false, timing = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.0, 1.2, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect-riser") { badGauge.parent.visible = false; boxes.visible = false; }
        if (step.id === "read-static") repaint(supplyGauge.userData.screen, signFace("STATIC OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "main-drain") flowing = true;
        if (step.id === "read-residual") repaint(residualGauge.userData.screen, signFace("READ", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "close-drain") flowing = false;
        if (step.id === "route-discharge") { dischargeHose.position.set(0.9, 0.1, -0.5); dischargeHose.rotation.y = 0; }
        if (step.id === "open-test-valve") timing = true;
        if (step.id === "time-alarm") { timing = false; repaint(timerInst.userData.screen, signFace("ALARM", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 })); }
        if (step.id === "confirm-alarm") { flowLight.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.0 }); }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "monitoring-callback") phone.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.6, rough: 0.4 });
        if (it.id === "other-zone-tamper") tamperLight.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 2.2 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "monitoring-callback") phone.material = mat(0x1b1e23, { rough: 0.6 });
        if (it.id === "other-zone-tamper") tamperLight.material = mat(0x3a3f44, { emissive: 0x000000, ei: 0 });
      },
      animate(t, dt, session) {
        if (flowing) drainValve.userData.wheel.rotation.y += dt * 0.4;
        if (timing) timerInst.rotation.y = Math.sin(t * 0.2) * 0.005;
        if (session?.turn && session.step?.id === "open-test-valve") testValve.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
      },
    };
  },
};
