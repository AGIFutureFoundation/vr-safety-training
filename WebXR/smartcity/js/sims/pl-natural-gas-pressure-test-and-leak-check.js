import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, valveWheel, pipeRun, lockTag, cylinderTank, surfaceTexture, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Natural Gas Pressure Test & Leak Check VR — Building Systems
// & Facilities, UA plumbers and pipefitters.
//
// New gas piping is tested with air, never with fuel gas, because the whole
// point of the test is finding a leak before there is anything in the pipe
// that can ignite at one. The gauge on the test pump only proves the system
// as a whole holds pressure — it takes a soap solution and a fitter's own
// eyes at every joint to prove which joint, if any, is the reason it might
// not. And once the line is proven and the air is bled off, purging the
// actual gas in is its own separate hazard: gas has to leave the pipe
// somewhere as the air it displaces makes room for it, and "somewhere" has
// to be outdoors, away from anything that could light it, every single
// time.

const NGP_ACCENT = 0xf2c14b;

export const SIM_PL_NATURAL_GAS_PRESSURE_TEST_AND_LEAK_CHECK = {
  id: "pl-natural-gas-pressure-test-and-leak-check",
  index: "pl-08",
  domain: "Building Systems & Facilities",
  trade: "UA plumber / gas piping installer",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "UA plumbers and pipefitters apprenticeship; NFPA 54 National Fuel Gas Code; ANSI Z223.1 National Fuel Gas Code; the Uniform Plumbing Code (UPC) for gas piping installation; 29 CFR 1910.147 the control of hazardous energy",
  name: "Natural Gas Pressure Test & Leak Check",
  title: simTitle("Natural Gas Pressure Test & Leak Check"),
  tagline: "New gas piping tested with air rather than fuel, every joint soap-checked rather than trusted to a gauge alone, and the line purged outdoors before any appliance is ever lit on it",
  accent: NGP_ACCENT,
  accentCss: "#f2c14b",
  parSeconds: 270,
  footprint: 2.2,
  badge: { id: "line-proven", name: "Line Proven", note: "A new gas run air-tested, soap-checked joint by joint and purged outdoors before any appliance saw live gas" },

  game: system({
    name: "Fuel Gas Authority",
    currency: "SCFH",
    ranks: ["Apprentice", "Journeyman", "Plumber", "Lead Plumber", "Gas Piping Certified"],
    badges: [
      { id: "bonded-before-test", name: "Bonded Before Test", note: "CSST bonding was confirmed before the system was pressurised", test: AWARD.stepClean("bonding") },
      { id: "never-untested", name: "Never Untested", note: "No joint went into service without the air test and the soap check both", test: AWARD.safe },
      { id: "steady-watch", name: "Steady Watch", note: "Held the pressure watch inside the band the whole test", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-line", name: "Clean Line", note: "No corrections anywhere in the test", test: AWARD.clean },
      { id: "unbroken-purge", name: "Unbroken Purge", note: "The purge ran to completion without a break", test: AWARD.unbroken },
      { id: "line-live-fast", name: "Line Live Fast", note: "Signed off inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unbonded-csst": "You left this CSST run without its bonding clamp. Corrugated stainless tubing carries an arc from a nearby lightning strike straight through its own thin wall if it is not bonded to the building's grounding system, and that arc can burn a hole clean through the tubing wherever it happens to find one.",
    "test-with-gas": "You reached for the fuel gas supply to pressurise this test instead of air. The entire reason this test exists is to find a leak before there is anything flammable in the pipe to find it with — testing with the gas itself turns every joint this system might fail at into a live ignition source for the whole duration of the test.",
    "purge-indoors-unvented": "You purged this line to an indoor space instead of routing it outdoors. The air being displaced out of this pipe is being replaced by fuel gas, and venting that indoors fills the room with exactly the mixture this whole test was meant to keep away from any source of ignition.",
    "skip-soap-test": "You called the test passed on the gauge reading alone, with no soap solution on a single joint. A short test window can miss a slow leak that has not dropped the system pressure enough to show on the gauge yet — the soap solution is what finds the joint the clock has not had time to.",
  },

  lateNotes: {
    "test-gauge": "The system is pressurised with air only after the outlets are capped and the CSST bonding is confirmed, not before either of those is checked.",
    "purge-valve": "The purge happens outdoors, after the test pressure has been fully bled off and the caps removed, not while the system is still under test pressure.",
    "appliance-valve": "The appliance valve opens only after the operating pressure at the regulator has actually been read and confirmed, not on the assumption that the purge going well means the pressure is automatically correct.",
  },

  // Two things that happen to a plumber whose hands are on a test pump or a
  // purge valve and whose eyes are on a gauge. See shared/game.js.
  interrupts: [
    {
      id: "hotwork-nearby",
      kind: "Another trade starts hot work near the purge point",
      // Armed on entering the purge hold step, so the window overlaps
      // actual gas leaving the pipe — answered at the other trade, not the
      // purge valve itself.
      after: "purge", delay: 2, seconds: 11,
      alert: "Another crew has just set up a grinder right next to where this line is purging to outdoors.",
      cue: "That spark source is far too close to gas actively leaving this pipe — stop them before you do anything else.",
      target: "nearby-hotwork",
      why: "Gas leaving a purge point outdoors is still gas until it disperses, and a grinder thrown up nearby with no idea what is venting three feet away is exactly the kind of ignition source this whole outdoor-purge requirement exists to keep clear of — stopping that work now is worth more than watching the purge finish on schedule.",
      missNote: "The grinder kept running while the purge continued next to it. Whatever margin the outdoor purge point was supposed to buy, a spark source parked right beside it spent most of it.",
      wrongNote: "It is the other crew's hot work. The purge valve was never the hazard here — what is running next to it is.",
    },
    {
      id: "meter-verify-call",
      kind: "The gas utility calls to verify the meter is off",
      // Armed after the meter is isolated and tagged, answered at the
      // phone rather than at the piping itself.
      after: "isolate", delay: 3, seconds: 12,
      alert: "The gas utility is calling to confirm the meter valve is actually closed before their own records show this address off.",
      cue: "That call is what gets this address correctly logged as isolated on the utility's own side — answer it before moving on.",
      target: "meter-phone",
      why: "The utility's own records of which meters are on and off matter well beyond this one job, and a call confirming the isolation is what keeps their side of the paperwork matching what is actually true at this address — leaving it unanswered risks the meter being treated as live in a system that has no way to know otherwise.",
      missNote: "The call went unanswered while work continued. The utility's own records never got the confirmation this address is actually isolated.",
      wrongNote: "It is the utility's call. The piping in this closet cannot answer a question about what their own meter records show.",
    },
  ],

  steps: [
    {
      id: "load-calc", kind: "select", target: "load-calc",
      title: "Read the gas load calculation",
      cue: "Check the load calculation: total appliance BTU load and the pipe sizing it requires.",
      why: "NFPA 54 sizes gas piping around the total connected load and the length of run to the farthest appliance, and a line sized from habit instead of the calculation can starve an appliance at the end of a long run even though every joint on it tests perfectly tight.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["close-meter-valve", "tag-meter"],
      itemNames: { "close-meter-valve": "meter valve closed", "tag-meter": "meter tagged" },
      title: "Isolate and tag the meter",
      cue: "Close the meter valve, then tag it before any work begins on the new run.",
      why: "The tag is what stops the meter from being reopened by someone unaware this line is mid-test, on the one appliance connection in the building that can put fuel gas behind every joint downstream of it the instant it turns.",
      outOfOrderNote: "Close it, then tag it — a closed valve with no tag can be reopened by anyone who does not know work is still happening downstream.",
    },
    {
      id: "inspect-run", kind: "find", noHint: true,
      targets: ["unsupported-run", "wrong-fitting-type"],
      itemNames: { "unsupported-run": "unsupported length of pipe", "wrong-fitting-type": "prohibited fitting type" },
      itemNotes: {
        "unsupported-run": "This section of pipe is running unsupported between two points well past the spacing the code allows — its own weight is what eventually stresses a joint at either end.",
        "wrong-fitting-type": "This fitting is not a type NFPA 54 allows for gas service — it looks like the right thread and size, which is exactly why it ended up in the wrong pile.",
      },
      title: "Inspect the new run before testing",
      cue: "Walk the new piping and find what needs fixing before the test even starts.",
      why: "An unsupported run and a prohibited fitting can both hold a test pressure just fine for the length of a test window and still be exactly the kind of installation defect that fails months later — catching them now, before the system is even pressurised, is a five-minute fix instead of a return trip.",
    },
    {
      id: "bonding", kind: "select", target: "bonding-clamp",
      title: "Confirm the CSST bonding",
      cue: "Check the bonding clamp on the corrugated tubing against the building's grounding system.",
      why: "Corrugated stainless tubing has a wall thin enough that an arc from a nearby lightning event can burn straight through it if the tubing is not bonded to take that energy somewhere safer — this is checked before pressurising the system, not treated as a finishing touch after the test passes.",
    },
    {
      id: "cap-outlets", kind: "sequence",
      targets: ["cap-outlet-a", "cap-outlet-b"],
      itemNames: { "cap-outlet-a": "appliance outlet A capped", "cap-outlet-b": "appliance outlet B capped" },
      title: "Cap every open outlet",
      cue: "Cap outlet A, then outlet B, before the system is pressurised.",
      why: "Every open connection on this system is a place the test air can escape without there being a joint defect at all, and an uncapped outlet reads on the gauge exactly like a real leak somewhere else — capping every one first is what makes the test actually test the joints instead of the outlets nobody plugged.",
      outOfOrderNote: "A, then B — either order works for safety, but skipping one means the test pressure never actually holds.",
    },
    {
      id: "pressurize", kind: "gauge", target: "test-gauge",
      title: "Pressurise the system with air",
      cue: "Bring the test pressure up with the air pump per the code and the drawing, then commit once it holds.",
      why: "Air, never fuel gas, is what goes into this system for the test, because the test's entire purpose is finding a leak before there is anything flammable in the pipe for that leak to matter — pressurising with the actual fuel defeats the one thing this step exists to protect against.",
      gauge: { label: "TEST PRESSURE", speed: 0.65, green: [0.55, 0.75], readout: (t) => `${Math.round(t * 100)}% of test value`, missNote: "Short of test pressure — bring the pump back up before starting the watch." },
    },
    {
      id: "hold-test", kind: "track", target: "pressure-watch", seconds: 7,
      title: "Watch the test pressure hold",
      cue: "Keep the reading steady in the band while you watch for any sign of drop.",
      why: "A pressure that holds flat for the full watch says the system as a whole is sealed; any real drop, even a slow one, says gas would be finding a way out somewhere on this run once it went live — this is watched, not glanced at once, because a slow leak takes time to show itself on the gauge.",
      track: { start: 0.65, green: [0.55, 0.75], rise: 0.05, fall: 0.28, drift: 0.11, label: "TEST PRESSURE", readout: (v) => (v < 0.55 ? "dropping — a joint is not sealed" : v > 0.75 ? "over the test value" : "holding steady") },
      holdBreakNote: "That reading dropped out of band during the watch — there is a leak on this system, and it has to be found before the test counts for anything.",
    },
    {
      id: "soap-check", kind: "find",
      targets: ["bubble-joint-a", "loose-union-b"],
      itemNames: { "bubble-joint-a": "joint bubbling under soap solution", "loose-union-b": "union weeping air at the threads" },
      itemNotes: {
        "bubble-joint-a": "This joint is steadily bubbling where the soap solution was brushed on — a leak too small to move the gauge yet, but a leak all the same.",
        "loose-union-b": "This union is weeping air at the threads under the soap solution — it needs to be broken down and remade, not just snugged further.",
      },
      title: "Soap-check every joint under pressure",
      cue: "Brush soap solution on every joint while the system is still pressurised and look for bubbles.",
      why: "The gauge only ever proves the system as a whole, and a joint bubbling under soap solution is the only way to know which specific connection is the reason — this is the check that turns 'this system holds pressure' into 'every joint on this system holds pressure,' which is the actual standard the code is asking for.",
    },
    {
      id: "bleed-down", kind: "sequence",
      targets: ["bleed-test", "remove-caps"],
      itemNames: { "bleed-test": "test pressure bled off", "remove-caps": "outlet caps removed" },
      title: "Bleed the test and remove the caps",
      cue: "Bleed the test pressure to zero, then remove the caps from both outlets.",
      why: "The caps come off only after the test pressure is fully bled — a cap removed while the system is still pressurised turns a controlled bleed-down into an uncontrolled release of air at whatever outlet just opened.",
      outOfOrderNote: "Bleed first, then remove the caps — the caps are still doing their job as long as there is pressure behind them.",
    },
    {
      id: "purge", kind: "hold", target: "purge-valve", seconds: 5,
      title: "Purge the line to outdoors",
      cue: "Hold the purge valve open, routed outdoors, until the line reads full of gas.",
      why: "The air still filling this pipe has to go somewhere as gas displaces it, and routing that displaced air — and the gas that follows it through the purge point before the valve closes — outdoors and away from any ignition source is what keeps this last step from being the one that undoes everything the air test just proved safe.",
      holdBreakNote: "The purge closed before the line read full of gas — hold it open again, a partial purge still has air pockets sitting in the line.",
    },
    {
      id: "op-pressure", kind: "gauge", target: "operating-pressure-gauge",
      title: "Check the operating pressure at the regulator",
      cue: "Read the regulator's operating pressure and commit once it is in range for the appliance.",
      why: "The line being full of gas is not the same thing as the line delivering the correct operating pressure to the appliance, and a regulator reading outside its intended range will run an appliance rich, lean, or simply unable to reach the burner's rated output — checked here, before anything downstream is lit.",
      gauge: { label: "OPERATING PRESSURE", speed: 0.6, green: [0.45, 0.65], readout: (t) => `${(t * 14).toFixed(1)} in. w.c.`, missNote: "Outside the regulator's intended range — check the regulator itself before lighting anything downstream of it." },
    },
    {
      id: "light-appliance", kind: "turn", target: "appliance-valve",
      title: "Open the appliance shutoff",
      cue: "Open the appliance's own shutoff valve now the operating pressure is confirmed.",
      why: "This valve is the last thing between the proven, purged, correctly regulated line and the appliance itself, and it only opens once every check ahead of it has actually passed — not because the purge went smoothly and the rest can reasonably be assumed to have gone the same way.",
      turn: { turns: 0.5, axis: "y", label: "APPLIANCE VALVE" },
    },
    {
      id: "detector-walk", kind: "find",
      targets: ["blocked-regulator-vent", "kinked-connector"],
      itemNames: { "blocked-regulator-vent": "blocked regulator vent", "kinked-connector": "kinked flexible connector" },
      itemNotes: {
        "blocked-regulator-vent": "Something has been set down over the regulator's vent opening — a blocked vent stops the regulator from breathing properly and can push its outlet pressure well past what it is set for.",
        "kinked-connector": "The flexible connector to the appliance is kinked sharply behind it, restricting flow at the one point nobody usually looks once the appliance is pushed back into place.",
      },
      title: "Walk the finished install with a gas detector",
      cue: "Walk the finished run with the combustible gas detector and check what a quick glance would miss.",
      why: "A blocked regulator vent and a kinked connector both sit downstream of everything already tested and can undo the correct operating pressure this job just confirmed, from causes the earlier tests were never designed to catch — the final walk is what catches the installation detail rather than the piping itself.",
    },
    {
      id: "test-log", kind: "select", target: "test-log",
      title: "Complete the gas test and purge log",
      cue: "Fill in the test log with the test pressure held, the soap-check results, and the purge confirmation.",
      why: "The inspector who signs off on this work, and the next plumber who ever opens this wall, both depend on a written record that this specific run was tested and purged correctly — a finished gas line with no log is a line the next person has to distrust and retest from nothing.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, NGP_ACCENT);

    const floorTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#c7ccd1"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      for (let i = 0; i < 6; i++) { ctx.strokeStyle = "rgba(0,0,0,0.06)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, (i / 6) * h); ctx.lineTo(w, (i / 6) * h); ctx.stroke(); }
    }, { repeat: 4 });
    box(g, 5.2, 0.08, 4.4, 0, 0.04, 0, 0xffffff, { rough: 0.6 }).material = texturedMat(floorTex, { color: 0xc7ccd1, rough: 0.6 });

    const blockTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#8a857a"; ctx.fillRect(0, 0, w, h);
      const rows = 5, cols = 9;
      for (let r = 0; r <= rows; r++) { ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, (r / rows) * h); ctx.lineTo(w, (r / rows) * h); ctx.stroke(); }
      for (let r = 0; r < rows; r++) { const off = r % 2 ? (w / cols) / 2 : 0; for (let c = 0; c <= cols; c++) { const x = off + (c / cols) * w; ctx.beginPath(); ctx.moveTo(x, (r / rows) * h); ctx.lineTo(x, ((r + 1) / rows) * h); ctx.stroke(); } }
    }, { repeat: 2 });
    box(g, 5.2, 2.6, 0.12, 0, 1.4, -2.0, 0xffffff, { rough: 0.9 }).material = texturedMat(blockTex, { color: 0x8a857a, rough: 0.9 });
    box(g, 5.2, 0.14, 0.3, 0, 2.75, -2.0, 0x99a2a8, { rough: 0.8 });

    // Meter and the new run coming off it.
    const meter = group(g, -1.8, 0, -1.6, 0.3);
    box(meter, 0.4, 0.3, 0.16, 0, 0.6, 0, 0xdfe6ec, { rough: 0.5, metal: 0.3 });
    const meterValve = valveWheel(meter, 0.3, 0.5, 0, { color: 0xd8232a, body: 0x2b2f34, r: 0.07 });
    holoTag(meter, "meter valve", 0.3, 0.7, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, meterValve, "close-meter-valve");
    const meterTag = lockTag(meter, -0.3, 0.5, 0.1, { color: 0xf2c14b, lines: ["GAS METER", "ISOLATED"] });
    reg(hits, meterTag, "tag-meter");

    // CSST run with a bonding clamp, and the joints down the run.
    const csst = group(g, -0.6, 1.0, -1.55);
    const csstPipe = cyl(csst, 0.03, 0.03, 1.6, 0, 0, 0, 0xd8b23a, { rough: 0.5, metal: 0.4, seg: 14 });
    csstPipe.rotation.z = Math.PI / 2;
    holoTag(csst, "CSST run", -0.7, 0.18, 0, { css: "#f2c14b", w: 0.28 });
    const bondClamp = torus(csst, 0.04, 0.012, -0.4, 0, 0, 0xb8402f, { rough: 0.5, seg: 8, seg2: 16 });
    bondClamp.rotation.x = Math.PI / 2;
    holoTag(csst, "bonding clamp", -0.4, 0.16, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, bondClamp, "bonding-clamp");
    const unbondedTarget = box(g, 0.2, 0.2, 0.2, -1.3, 1.3, -1.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "skip the clamp?", -1.3, 1.52, -1.55, { css: "#d2312b", w: 0.4 });
    reg(hits, unbondedTarget, "unbonded-csst");

    const unsupported = cyl(g, 0.025, 0.025, 0.4, 0.4, 1.6, -1.55, 0xd8b23a, { rough: 0.5, metal: 0.4, seg: 12 });
    unsupported.rotation.z = Math.PI / 2;
    reg(hits, unsupported, "unsupported-run");
    const badFitting = torus(g, 0.035, 0.014, 0.9, 1.0, -1.55, 0xb8402f, { rough: 0.6, seg: 8, seg2: 14 });
    reg(hits, badFitting, "wrong-fitting-type");

    // Outlets to cap.
    const outletA = group(g, 1.4, 0.9, -1.2, -0.4);
    cyl(outletA, 0.025, 0.025, 0.1, 0, 0, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 12 });
    holoTag(outletA, "outlet A", 0, 0.14, 0, { css: "#f2c14b", w: 0.26 });
    reg(hits, outletA, "cap-outlet-a");
    const outletB = group(g, 1.8, 0.9, -0.9, -0.3);
    cyl(outletB, 0.025, 0.025, 0.1, 0, 0, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 12 });
    holoTag(outletB, "outlet B", 0, 0.14, 0, { css: "#f2c14b", w: 0.26 });
    reg(hits, outletB, "cap-outlet-b");

    // Test pump and gauge.
    const testPump = group(g, 1.9, 0.1, -0.3, -0.4);
    box(testPump, 0.4, 0.3, 0.3, 0, 0.2, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const testGaugeInst = instrument(testPump, 0, 0.42, 0, { idle: "-- % test", color: 0x2b2f34, w: 0.16, d: 0.18 });
    holoTag(testPump, "test gauge", 0, 0.6, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, testGaugeInst, "test-gauge");
    const watchGauge = instrument(g, 1.4, 1.6, -0.7, { idle: "-- % test", color: 0x2b2f34, w: 0.15, d: 0.17 });
    holoTag(g, "pressure watch", 1.4, 1.8, -0.7, { css: "#f2c14b", w: 0.32 });
    reg(hits, watchGauge, "pressure-watch");
    const testWithGasTarget = box(g, 0.2, 0.2, 0.2, 2.3, 0.5, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just use the gas supply?", 2.3, 0.72, -0.3, { css: "#d2312b", w: 0.5 });
    reg(hits, testWithGasTarget, "test-with-gas");

    // Soap-checked joints.
    const bubbleJoint = ball(g, 0.02, -0.2, 1.0, -1.55, 0xbfe6f5, { rough: 0.2, opacity: 0.7, transparent: true });
    reg(hits, bubbleJoint, "bubble-joint-a");
    const looseUnion = cyl(g, 0.035, 0.035, 0.08, 0.9, 1.0, -1.3, 0x9aa3ab, { rough: 0.45, metal: 0.6, seg: 14 });
    reg(hits, looseUnion, "loose-union-b");
    const skipSoapTarget = box(g, 0.2, 0.2, 0.2, -0.1, 1.5, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "call it passed off the gauge?", -0.1, 1.72, -1.0, { css: "#d2312b", w: 0.56 });
    reg(hits, skipSoapTarget, "skip-soap-test");

    hits["bleed-test"] = testGaugeInst;
    hits["remove-caps"] = outletA;

    // Purge point, routed outdoors through the wall.
    const purgeAssembly = group(g, 2.3, 0.9, -1.7, -0.5);
    const purgeValveMesh = box(purgeAssembly, 0.08, 0.06, 0.06, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    holoTag(purgeAssembly, "purge valve — routed outdoors", 0, 0.2, 0, { css: "#f2c14b", w: 0.56 });
    reg(hits, purgeValveMesh, "purge-valve");
    const purgeCloud = particles(purgeAssembly, 12, 0xd8d0b0, { size: 0.03, life: 0.6, additive: false, opacity: 0.4 });
    purgeCloud.position.set(0.1, 0, 0);
    purgeCloud.visible = false;
    const indoorPurgeTarget = box(g, 0.2, 0.2, 0.2, 2.0, 1.7, -1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "purge it in here?", 2.0, 1.92, -1.9, { css: "#d2312b", w: 0.44 });
    reg(hits, indoorPurgeTarget, "purge-indoors-unvented");

    // Nearby hot work, and the meter phone.
    const hotwork = group(g, 2.4, 0, -2.1, -0.5);
    cyl(hotwork, 0.05, 0.05, 0.3, 0, 0.35, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 12 });
    const sparks = particles(hotwork, 10, 0xf2c14b, { size: 0.02, life: 0.3, additive: true, opacity: 0.8 });
    sparks.position.set(0, 0.5, 0);
    sparks.visible = false;
    holoTag(hotwork, "grinder — hot work", 0, 0.6, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, hotwork, "nearby-hotwork");

    const meterPhone = box(meter, -0.3, 0.86, -0.2, 0.08, 0.15, 0.04, 0x1b1e23, { rough: 0.6 });
    void meterPhone;
    const phoneObj = box(g, 0.08, 0.15, 0.04, -2.1, 0.9, -1.2, 0x1b1e23, { rough: 0.6 });
    holoTag(g, "utility calling", -2.1, 1.1, -1.2, { css: "#f2c14b", w: 0.36 });
    reg(hits, phoneObj, "meter-phone");

    // Regulator, appliance valve, and the walk-round.
    const regulator = group(g, 0.9, 0.9, -0.5, 0.3);
    cyl(regulator, 0.06, 0.06, 0.14, 0, 0, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 16 });
    const opGauge = instrument(regulator, 0.14, 0.06, 0, { idle: "-- in wc", color: 0x2b2f34, w: 0.14, d: 0.16, ry: 0.5 });
    holoTag(regulator, "regulator", 0, 0.2, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, opGauge, "operating-pressure-gauge");
    const regVent = cyl(regulator, 0.02, 0.02, 0.04, 0, -0.09, 0.05, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10 });
    reg(hits, regVent, "blocked-regulator-vent");

    const applianceValve = valveWheel(g, 1.5, 0.9, -0.2, { color: 0xd8232a, body: 0x2b2f34, r: 0.07 });
    holoTag(g, "appliance shutoff", 1.5, 1.14, -0.2, { css: "#f2c14b", w: 0.36 });
    reg(hits, applianceValve, "appliance-valve");
    const connector = cyl(g, 0.018, 0.018, 0.3, 1.7, 0.7, -0.15, 0xb8402f, { rough: 0.5, metal: 0.4, seg: 12 });
    connector.rotation.z = 0.6;
    reg(hits, connector, "kinked-connector");

    // Bench: load calc, test log.
    const bench = group(g, -1.9, 0.1, 0.9);
    box(bench, 1.2, 0.76, 0.55, 0, 0.38, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const loadCalc = decal(bench, 0.34, 0.42, -0.35, 0.78, 0, paperFace("GAS LOAD CALCULATION", ["Total load per appliance schedule", "Pipe size per NFPA 54 table", "Longest run to farthest appliance"], { scale: 0.78 }));
    loadCalc.rotation.x = -Math.PI / 2;
    holoTag(bench, "load calculation", -0.35, 0.98, 0, { css: "#f2c14b", w: 0.36 });
    reg(hits, loadCalc, "load-calc");
    const testLog = decal(bench, 0.32, 0.4, 0.35, 0.78, 0.02, paperFace("TEST & PURGE LOG", ["Test pressure held ___", "Soap check: pass / fail", "Purge confirmed outdoors"], { scale: 0.82 }));
    testLog.rotation.x = -Math.PI / 2;
    holoTag(bench, "test & purge log", 0.35, 0.98, 0.05, { css: "#f2c14b", w: 0.4 });
    reg(hits, testLog, "test-log");

    const boardPanel = group(g, 2.1, 0, 1.9, -0.5);
    holoPanel(boardPanel, 0.95, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#2a2005"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#f2c14b"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fdf3d4"; ctx.fillText("GAS TEST — NEW RUN", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fffbe6";
      ["Confirm CSST bonding before pressurising", "Test with air only — never with fuel gas", "Soap-check every joint, not just the gauge", "Purge outdoors, away from ignition sources", "Read operating pressure before lighting anything"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.12)));
    }, { accent: NGP_ACCENT });

    const plumber = standingFigure(g, 0.0, 2.0, { ry: 3.0, cloth: 0x8a7a3a });
    holoTag(plumber, "gas piping installer", 0, 1.9, 0, { css: "#f2c14b", w: 0.4 });
    toolChest(g, 2.3, 1.6);
    // A rack of spare black-iron fittings on the bench, and a second run of
    // CSST stubbed toward the appliance side of the closet.
    for (let i = 0; i < 6; i++) {
      const spare = torus(g, 0.03, 0.01, -2.3 + (i % 3) * 0.12, 0.98 + Math.floor(i / 3) * 0.05, 1.3, 0x8a939b, { rough: 0.4, metal: 0.6, seg: 8, seg2: 12 });
      spare.rotation.x = Math.PI / 2;
    }
    const secondRun = cyl(g, 0.028, 0.028, 0.9, 0.4, 0.9, -1.5, 0xd8b23a, { rough: 0.5, metal: 0.4, seg: 14 });
    secondRun.rotation.z = Math.PI / 2;
    for (const dx of [-0.4, 0.4]) cyl(g, 0.036, 0.036, 0.05, dx, 0.9, -1.5, 0x8a939b, { rough: 0.45, metal: 0.6, seg: 14 }).rotation.z = Math.PI / 2;
    const spareShelf = box(g, 0.9, 0.03, 0.2, -2.15, 1.1, 1.3, 0x8a8f95, { rough: 0.7, metal: 0.3 });
    void spareShelf;
    for (const dz of [-0.1, 0.1]) {
      const bracket = box(g, 0.4, 0.02, 0.02, 0.4, 0.85, -1.5 + dz, 0x2b3138, { rough: 0.5, metal: 0.5 });
      void bracket;
    }
    for (const [x, z] of [[2.3, -2.1], [-2.4, -2.1]]) cone(g, x, z);

    let purging = false, sparking = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.2, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect-run") { unsupported.visible = false; badFitting.visible = false; }
        if (step.id === "pressurize") repaint(testGaugeInst.userData.screen, signFace("100%", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "soap-check") { bubbleJoint.visible = false; looseUnion.material = mat(0x9aa3ab, { rough: 0.4, metal: 0.7 }); }
        if (step.id === "purge") { purging = true; purgeCloud.visible = true; }
        if (step.id === "op-pressure") { purging = false; purgeCloud.visible = false; repaint(opGauge.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 })); }
        if (step.id === "detector-walk") { regVent.visible = false; connector.rotation.z = 0; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "hotwork-nearby") { sparking = true; sparks.visible = true; }
        if (it.id === "meter-verify-call") phoneObj.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.6, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hotwork-nearby") { sparking = false; sparks.visible = false; }
        if (it.id === "meter-verify-call") phoneObj.material = mat(0x1b1e23, { rough: 0.6 });
      },
      animate(t, dt, session) {
        if (purging) purgeCloud.userData.step(dt, new THREE.Vector3(0.3, 0.1, 0), 0.04, 0.4, -0.2);
        if (sparking) sparks.userData.step(dt, new THREE.Vector3(0, 0.3, 0), 0.03, 0.5, -0.4);
        if (session?.turn && session.step?.id === "light-appliance") applianceValve.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
      },
    };
  },
};
