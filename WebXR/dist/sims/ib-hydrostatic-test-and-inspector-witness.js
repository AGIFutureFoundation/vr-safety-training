import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, valveWheel,
  standingFigure, surfaceTexture, texturedMat, palette, gratingFace, concreteFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hydrostatic Test and Inspector Witness VR — Building Systems
// & Facilities, the seventh of the Insulators and Boilermakers pack. A
// repaired pressure vessel proven under a hydrostatic test witnessed by an
// authorized inspector: the procedure read, blinds installed and vents
// opened before the fill, the calibration tag on the master gauge checked,
// the vessel filled and vented of trapped air, pressurised on a steady
// ramp, held at test pressure while the vessel is walked for weeps, the
// inspector called to witness the hold and sign, then bled down, drained
// and reopened.
//
// Sited generically: no vessel manufacturer, no real test-pressure number
// the registry is not sure of — the pressure, hold time and margins are all
// "per the code".

const IBHT_ACCENT = 0x4fd1ff;
const IBHT_PAL = palette("utility");

export const SIM_IB_HYDROSTATIC_TEST_AND_INSPECTOR_WITNESS = {
  id: "ib-hydrostatic-test-and-inspector-witness",
  index: "358",
  domain: "Facilities",
  trade: "Boilermaker, hydrostatic testing and inspector witness — Boilermakers Local 549",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "Boilermakers Local 549 apprenticeship and training; ASME Section I rules for the hydrostatic test of power boilers and pressure vessels; National Board Inspection Code (NBIC) repair and alteration practice; OSHA 29 CFR 1910.147 the control of hazardous energy; OSHA 29 CFR 1910.146 permit-required confined spaces for the post-test inspection",
  name: "Hydrostatic Test and Inspector Witness",
  title: simTitle("Hydrostatic Test and Inspector Witness"),
  tagline: "A repaired vessel proven on a hydrostatic test, vented of trapped air before pressurising, walked for weeps at the hold, and signed by the inspector who watched it",
  accent: IBHT_ACCENT,
  accentCss: "#4fd1ff",
  parSeconds: 320,
  footprint: 2.3,
  badge: { id: "test-witnessed-clean", name: "Test Witnessed Clean", note: "Filled, vented, pressurised and held clean, with the inspector's own signature on the result" },

  game: system({
    name: "Test Certified",
    currency: "PSI",
    ranks: ["Helper", "Test Technician", "Lead Tester", "Test Foreman", "Test Certified"],
    badges: [
      { id: "air-purged-first", name: "Air Purged First", note: "Never pressurised before trapped air was fully vented", test: AWARD.safe },
      { id: "hold-precise", name: "Hold Precise", note: "Held every gauge and track reading near band centre", test: AWARD.precise(0.72) },
      { id: "blind-disciplined", name: "Blind Disciplined", note: "Completed the blind-and-vent sequence with no correction", test: AWARD.stepClean("blind-and-vent") },
    ],
    challenges: [
      { id: "clean-test", name: "Clean Test", note: "No corrections from the procedure to the certificate", test: AWARD.clean },
      { id: "steady-ramp", name: "Steady Ramp", note: "Held the pressurisation ramp through the whole rise", test: AWARD.unbroken },
      { id: "fast-witness", name: "Fast Witness", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "capped-vent": "That high-point vent is still capped and you are about to start pressurising anyway. A vent left capped during fill traps air inside the vessel, and trapped gas under a hydrostatic test is compressible in a way water is not — if this vessel lets go under pressure, the energy stored in that trapped air is what turns a leak into something far more violent.",
    "gauge-out-of-cal": "You reached for the spare gauge on the cart instead of the tagged master gauge. A test result is only as good as the instrument that read it, and a gauge with no current calibration tag is a number nobody can actually stand behind — the inspector witnesses the master gauge specifically because its calibration is the one thing on this cart that has been proven.",
    "bystander-line-of-fire": "There is a coworker standing directly in line with that blind flange while the vessel is at test pressure. A joint under hydrostatic test is exactly where a fitting can let go, and water at test pressure through a gap in a flange is a line of fire nobody needs to be standing in — this walk happens from the side of every joint, not from in front of it.",
    "over-pressurize-past-test": "The pump is still running well past the specified test pressure. Every psi above the number the procedure calls for is margin the vessel was never actually asked to prove, and pushing past it on the theory that a little extra shows more confidence risks a real, undocumented failure of a vessel the whole test exists to prove is sound.",
  },

  lateNotes: {
    "test-pump": "The pump only pressurises once the vessel has been filled with the vents open and confirmed free of trapped air — not before the air purge is proven.",
    "hold-gauge": "The hold only starts once the ramp has actually reached the specified test pressure, not partway up the rise.",
  },

  steps: [
    {
      id: "test-procedure", kind: "select", target: "test-procedure-panel",
      title: "Read the hydrostatic test procedure",
      cue: "Confirm the test pressure, the hold time and the inspector witness requirement.",
      why: "The procedure is what turns a pump and a gauge into an actual test — the pressure, the hold time and exactly which parts of it the inspector has to personally witness are all set here, and a test run to the wrong number proves nothing about the vessel this repair was actually meant to qualify.",
    },
    {
      id: "blind-and-vent", kind: "sequence",
      targets: ["test-blind", "high-vent-open", "low-drain-closed"],
      itemNames: { "test-blind": "test blind installed", "high-vent-open": "high-point vent opened", "low-drain-closed": "low-point drain closed" },
      title: "Blind, vent and drain the vessel for test",
      cue: "Install the test blind, open the high-point vent, then close the low-point drain.",
      why: "The blind isolates the vessel from the rest of the system so the test pressure stays exactly where it is supposed to be tested; the high vent opens before fill starts so trapped air has somewhere to go; and the low drain closes last, once the vessel is actually ready to hold water rather than lose it out the bottom.",
      outOfOrderNote: "Wrong order — blind the vessel, open the high vent, then close the low drain once the vessel is ready to fill.",
    },
    {
      id: "gauge-cal-check", kind: "select", target: "master-gauge",
      title: "Check the master gauge's calibration tag",
      cue: "Read the calibration tag on the master test gauge and confirm it is current before connecting it.",
      why: "An inspector witnesses this test on the assumption that the instrument reading it is trustworthy, and that assumption rests entirely on a calibration date somebody actually checked before the gauge went on the vessel — a result read off an out-of-date gauge is a number with nothing standing behind it.",
    },
    {
      id: "connect-pump", kind: "drag", target: "test-pump",
      title: "Connect the test pump",
      cue: "Carry the hydro test pump's hose to the fill connection and connect it.",
      why: "The pump connects to the fill point the procedure names, not the most convenient opening on the vessel — a test rigged to a different connection can pressurise unevenly or miss the isolation the blind was just installed to create.",
      drag: { to: "fill-connection", radius: 0.5, missNote: "Not connected at the fill point yet. The pump has to be on the connection the procedure names before anything about this test is standard." },
    },
    {
      id: "fill-vent", kind: "hold", target: "high-vent-target", seconds: 5,
      title: "Fill and vent trapped air",
      cue: "Hold the high-point vent open until a solid stream of water confirms the vessel is full and the air is out.",
      why: "Air trapped in the highest point of the vessel stays there through a fill unless it is actively vented, and a vessel filled with air still pocketed inside it is not actually the low-compressibility test the whole hydrostatic method depends on — a solid stream out the vent, not a sputter, is what proves the air is really gone.",
      holdBreakNote: "Vent closed before the stream ran solid. Air still trapped in this vessel means the test that follows is not the test the procedure is asking for.",
    },
    {
      id: "pressurize-ramp", kind: "track", target: "test-pump-throttle", seconds: 7,
      title: "Pressurise on a steady ramp",
      cue: "Hold the pump throttle steady as pressure rises toward the test value.",
      why: "A steady ramp gives every joint in the system time to show a problem gradually — a weep, a seep, a fitting working loose — while the pressure is still low enough to shut the pump down safely. A ramp that jumps in surges can drive a marginal joint straight past the point where a slow rise would have caught it first.",
      track: {
        start: 0.1, green: [0.36, 0.6], rise: 0.5, fall: 0.44, drift: 0.11, label: "PRESSURISATION RATE",
        readout: (v) => (v < 0.36 ? "too slow — wasting the window" : v > 0.6 ? "too fast — surging the joints" : "steady rise"),
      },
      holdBreakNote: "Ramp rate slipped out of band. A surging rise is exactly what a marginal joint is least able to tolerate.",
    },
    {
      id: "hold-pressure", kind: "gauge", target: "hold-gauge",
      title: "Hold at test pressure",
      cue: "Watch the gauge through the hold and commit once it has held steady for the specified time.",
      why: "A pressure that holds flat for the specified time is a vessel with no active leak; a pressure that drifts down during the same window is a vessel with a leak somewhere, however small, and the only way to tell the two apart is watching the gauge for the whole hold rather than reading it once at the start.",
      gauge: {
        label: "HOLD PRESSURE — STEADY", speed: 0.5, green: [0.85, 1.0],
        readout: (t) => `${Math.round(t * 100)}% OF TEST HELD`,
        missNote: "Pressure drifted during the hold. Find the leak before calling this test result good.",
      },
    },
    {
      id: "leak-walk", kind: "find", noHint: true,
      targets: ["weld-weep", "flange-weep", "threaded-weep"],
      itemNames: { "weld-weep": "the weep at the seam weld", "flange-weep": "the weep at the flange", "threaded-weep": "the weep at the threaded connection" },
      itemNotes: {
        "weld-weep": "A weep at the seam weld under test pressure is exactly the defect this test exists to find — it gets marked and the joint reworked before this vessel is declared sound, not explained away as normal for a repair this size.",
        "flange-weep": "A weeping flange under test pressure may be nothing more than an under-torqued bolt, but at test pressure it gets treated the same as any other leak until it is actually run down and fixed.",
        "threaded-weep": "A threaded connection weeping under test is a joint that will weep in service too, just more slowly — it gets remade now, while the vessel is already pressurised and the leak is easy to find.",
      },
      title: "Walk the vessel for weeps",
      cue: "Three joints on this vessel are weeping under test pressure. Find them from the side, not from in front of them.",
      why: "A gauge holding steady tells you the total leak rate is small enough not to matter over the hold time — it does not tell you where a leak is, or whether it is getting worse. The walk is what finds the actual joint, and it is done from beside each connection rather than in front of it for exactly the reason the line-of-fire hazard on this vessel exists.",
    },
    {
      id: "inspector-witness", kind: "select", target: "inspector-figure",
      title: "Call the inspector to witness the hold",
      cue: "Bring the inspector to the vessel to witness the pressure hold and sign the test report.",
      why: "A hydrostatic test that nobody outside the crew doing it actually watched is a test with no independent witness behind the result, and the National Board Inspection Code is built on exactly that independence — the inspector's signature is what turns this crew's own reading of the gauge into a result somebody else can trust.",
    },
    {
      id: "depressurize-valve", kind: "turn", target: "depressurize-valve",
      title: "Bleed the pressure down",
      cue: "Turn the depressurisation valve slowly to bring the vessel down off test pressure.",
      why: "Bleeding down slowly, rather than dumping the pressure all at once, is what keeps the same joints that just held under test from being shocked by a sudden pressure change on the way back down — the valve is turned at a controlled rate for the whole way, not opened wide the moment the hold is over.",
      turn: { turns: 1.3, axis: "z", label: "DEPRESSURISE RATE", readout: (t) => `${Math.round(t * 100)}% BLED DOWN` },
    },
    {
      id: "drain-and-vent", kind: "sequence",
      targets: ["low-drain-open", "high-vent-close", "blind-removed"],
      itemNames: { "low-drain-open": "low drain opened", "high-vent-close": "high vent closed", "blind-removed": "test blind removed" },
      title: "Drain, close the vent and remove the blind",
      cue: "Open the low drain, close the high vent, then remove the test blind.",
      why: "The drain opens first so the water actually has somewhere to go; the vent closes once the vessel is empty rather than while water is still draining past it; and the blind comes out last, once the vessel is fully back to atmospheric and there is nothing left for it to be isolating against.",
      outOfOrderNote: "Wrong order — drain first, then close the vent, then pull the blind once the vessel is empty and at atmospheric.",
    },
    {
      id: "cert-paperwork", kind: "select", target: "test-certificate",
      title: "Complete the test certificate",
      cue: "Fill out the test certificate with the pressure, hold time and result, then confirm the inspector's signature.",
      why: "The certificate is the permanent record of a test that otherwise exists only in the memory of the people who watched the gauge — the pressure actually reached, the time actually held and the inspector's own signature are what let this vessel go back into service on paper as well as in fact.",
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["retained-water", "loose-blind-flag", "tool-on-vessel"],
      itemNames: { "retained-water": "retained water at a low point", "loose-blind-flag": "the blind's identification flag left on", "tool-on-vessel": "a tool left on the vessel" },
      itemNotes: {
        "retained-water": "Water pooled at a low point after the drain is water that was never actually drained — it adds weight nobody accounted for and, in a vessel headed back into hot service, it flashes to steam the moment it is fired.",
        "loose-blind-flag": "A blind's identification flag left hanging after the blind itself is removed is exactly how the next crew assumes an isolation is still in place when it is not — it comes off the moment the blind does.",
        "tool-on-vessel": "A tool left sitting on the vessel after the test is debris the moment this vessel is back in service — it goes back to the cart before anyone signs off that the job here is finished.",
      },
      title: "Walk the vessel before signing off",
      cue: "Three things about this vessel are not right yet. Find them before the certificate is final.",
      why: "The certificate says the test is finished; the walk-down is what makes sure the vessel actually is too — retained water, a stray blind flag and a forgotten tool are the three things a clean-looking test result does not tell you on its own.",
    },
    {
      id: "crew-checkin", kind: "select", target: "ibht-crew-checkin",
      title: "Check in with the test foreman",
      cue: "Report the weeps found, the gauge swap avoided, and how the ramp behaved.",
      why: "The weeps found during the walk need to go on the rework list even though the test ultimately passed, and the spare gauge that almost got used needs to be pulled from the cart entirely so nobody reaches for it on the next test. The check-in is also where a ramp that felt rougher than usual gets flagged before the same pump goes on the next vessel.",
    },
    {
      id: "closing-log", kind: "select", target: "ibht-closing-log",
      title: "Sign the test closeout log",
      cue: "Record the test pressure, the hold result and the inspector's witness, then sign.",
      why: "The closeout log is what lets anyone who was not standing at this vessel today confirm exactly what pressure it was tested to, for how long, and who witnessed the result — the difference between a vessel that passed a test and a vessel that can prove it.",
    },
  ],

  interrupts: [
    {
      id: "sudden-pressure-drop",
      kind: "Pressure drop",
      after: "hold-pressure", delay: 4, seconds: 12,
      alert: "The gauge has started dropping suddenly during the hold, and water is visible spraying from a joint.",
      cue: "Isolate the pump and bring the pressure down before the leak gets worse.",
      target: "isolation-valve",
      why: "A sudden drop during a hold, with visible spray, is not a reading to keep watching — it is an active failure at a joint under pressure, and isolating the pump is what stops adding energy to a system that has already shown it cannot hold the current pressure safely.",
      missNote: "The pump kept running while pressure dropped and water sprayed from the joint. A leak that is actively growing under a pump still adding pressure is exactly the direction this does not get better on its own.",
      wrongNote: "It is the isolation valve. Nothing about this test continues safely with a joint spraying under pressure and the pump still running.",
    },
    {
      id: "inspector-called-away",
      kind: "Witness interrupted",
      after: "leak-walk", delay: 4, seconds: 12,
      alert: "The inspector has been called away by radio in the middle of witnessing the hold.",
      cue: "Pause the test until the inspector is back and watching.",
      target: "witness-hold-flag",
      why: "A hold that continues without the inspector actually watching it is a hold with no independent witness for whatever happens in that window — the flag is what pauses the test on record rather than quietly continuing through a gap in the witness and hoping nothing happened while nobody but the crew was looking.",
      missNote: "The test continued through the inspector's absence with nothing marked. A hold nobody independent was watching for part of its duration is a hold that cannot honestly be certified as fully witnessed.",
      wrongNote: "That is not it. The witness-hold flag is what actually marks this test as paused until the inspector is back.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Boilermakers Local 549 business agent if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.3, IBHT_ACCENT);

    // ------------------------------------------------------------- floor and backdrop
    const floorTex = surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 6 });
    const floor = box(g, 6.4, 0.1, 5.8, 0, 0.05, -0.1, 0xffffff, { rough: 0.8, metal: 0.3 });
    floor.material = texturedMat(floorTex, { rough: 0.7, metal: 0.4 });

    const wallTex = surfaceTexture((cx, w, h) => concreteFace(cx, w, h, {
      finish: "smooth", tone: "#6d747a", tone2: "#5e656a",
    }), { repeat: 4 });
    const backWall = box(g, 5.4, 2.6, 0.12, 0, 1.3, -2.8, 0xffffff, { rough: 0.7 });
    backWall.material = texturedMat(wallTex, { rough: 0.75 });

    // ------------------------------------------------------------- the vessel under test
    const vessel = group(g, -0.3, 0, -1.3, 0.15);
    cyl(vessel, 0.8, 0.8, 2.0, 0, 1.1, 0, IBHT_PAL.structure, { rough: 0.5, metal: 0.5, seg: 24, finish: "painted" });
    holoTag(vessel, "Vessel under hydrostatic test", 0, 2.3, 0, { css: "#4fd1ff", w: 0.62 });

    const testBlindFlange = torus(vessel, 0.16, 0.03, -0.82, 0.7, 0.3, 0x8b929a, { rough: 0.5, metal: 0.6 });
    testBlindFlange.rotation.y = Math.PI / 2;
    holoTag(testBlindFlange, "Test blind", 0, 0.24, 0, { css: "#4fd1ff", w: 0.32 });
    reg2(testBlindFlange, "test-blind");
    reg2(testBlindFlange, "blind-removed");

    const highVent = valveWheel(vessel, 0, 2.05, 0, { r: 0.06, color: 0x4fd1ff, body: IBHT_PAL.structure });
    holoTag(highVent, "High-point vent", 0, 0.2, 0, { css: "#4fd1ff", w: 0.36 });
    reg2(highVent, "high-vent-open");
    reg2(highVent, "high-vent-target");
    reg2(highVent, "high-vent-close");
    const cappedVent = valveWheel(vessel, 0.4, 2.0, 0.3, { r: 0.05, color: 0xd8232a, body: IBHT_PAL.structure });
    holoTag(cappedVent, "Vent — still capped?", 0, 0.18, 0, { css: "#f0645b", w: 0.44 });
    reg2(cappedVent, "capped-vent");
    const airStream = particles(highVent, 18, 0xdfeaf2, { size: 0.02, life: 0.4, additive: false, opacity: 0.4 });
    airStream.visible = false;

    const lowDrain = valveWheel(vessel, -0.4, 0.3, 0.5, { r: 0.06, color: 0x2f6f4a, body: IBHT_PAL.structure });
    holoTag(lowDrain, "Low-point drain", 0, 0.2, 0, { css: "#4fd1ff", w: 0.36 });
    reg2(lowDrain, "low-drain-closed");
    reg2(lowDrain, "low-drain-open");

    const fillConn = group(vessel, 0.75, 0.5, 0.4);
    box(fillConn, 0.12, 0.12, 0.02, 0, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.6 });
    holoTag(fillConn, "Fill connection", 0, 0.2, 0, { css: "#4fd1ff", w: 0.36 });
    hits["fill-connection"] = fillConn;

    // Weep points, checked from beside each joint.
    const weldWeep = box(vessel, 0.3, 0.01, 0.01, 0, 1.65, 0.79, 0x2b6f8f, { rough: 0.3, opacity: 0.6, transparent: true, cast: false });
    holoTag(vessel, "Seam weld", 0, 1.85, 0.79, { css: "#f0645b", w: 0.3 });
    reg2(weldWeep, "weld-weep");
    const flangeWeep = torus(vessel, 0.16, 0.02, -0.82, 0.7, 0.3, 0x2b6f8f, { rough: 0.3, opacity: 0.001, transparent: true, cast: false });
    flangeWeep.rotation.y = Math.PI / 2;
    holoTag(vessel, "Flange", -0.82, 0.9, 0.3, { css: "#f0645b", w: 0.28 });
    reg2(flangeWeep, "flange-weep");
    const threadedWeep = cyl(vessel, 0.03, 0.03, 0.1, 0.4, 0.5, 0.7, 0x2b6f8f, { rough: 0.4, metal: 0.5, seg: 10 });
    holoTag(vessel, "Threaded connection", 0, 0.66, 0, { css: "#f0645b", w: 0.4 });
    reg2(threadedWeep, "threaded-weep");

    const bystanderSpot = group(g, 0.3, 0, -0.5);
    box(bystanderSpot, 0.2, 0.2, 0.2, 0, 1.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bystanderSpot, "Standing in the line of fire", 0, 1.5, 0, { css: "#f0645b", w: 0.6 });
    reg2(bystanderSpot, "bystander-line-of-fire");
    const bystander = standingFigure(g, 0.5, 0.1, { ry: 1.5, cloth: 0x2f6f8f, helmet: 0xf2c14b, vest: 0xd8e24a });
    void bystander;

    // ------------------------------------------------------------- pump + gauges + bench
    const pump = group(g, -1.7, 0, -0.4, -0.3);
    box(pump, 0.5, 0.4, 0.4, 0, 0.2, 0, 0x2f6f8f, { rough: 0.6, metal: 0.4 });
    holoTag(pump, "Hydro test pump", 0, 0.46, 0, { css: "#4fd1ff", w: 0.38 });
    reg2(pump, "test-pump");
    const pumpThrottle = box(pump, 0.06, 0.1, 0.03, 0.2, 0.4, 0.15, 0xf2c14b, { rough: 0.5 });
    holoTag(pumpThrottle, "Pump throttle", 0, 0.14, 0, { css: "#4fd1ff", w: 0.32 });
    reg2(pumpThrottle, "test-pump-throttle");
    const isolValve = valveWheel(pump, -0.3, 0.4, 0, { r: 0.06, color: 0xd8232a, body: IBHT_PAL.structure });
    holoTag(isolValve, "Isolation valve", 0, 0.2, 0, { css: "#4fd1ff", w: 0.34 });
    reg2(isolValve, "isolation-valve");
    const depressValve = valveWheel(pump, 0.3, 0.4, -0.2, { r: 0.05, color: 0x4fd1ff, body: IBHT_PAL.structure });
    holoTag(depressValve, "Depressurise valve", 0, 0.18, 0, { css: "#4fd1ff", w: 0.42 });
    reg2(depressValve, "depressurize-valve");
    const spray = particles(flangeWeep, 14, 0xbfe4ff, { size: 0.015, life: 0.3, additive: false, opacity: 0.5 });
    spray.visible = false;

    const bench = group(g, -2.0, 0, 0.8, 0.3);
    slab(bench, 0.9, 0.72, 0.5, 0, 0.36, 0, 0x5a636b, { radius: 0.02, rough: 0.6, metal: 0.3 });
    const masterGauge = instrument(bench, -0.2, 0.75, -0.1, { idle: "-- psig", color: IBHT_ACCENT });
    holoTag(masterGauge, "Master test gauge — tagged", 0, 0.16, 0, { css: "#4fd1ff", w: 0.5 });
    reg2(masterGauge, "master-gauge");
    reg2(masterGauge, "hold-gauge");
    const spareGauge = instrument(bench, 0.2, 0.75, 0.1, { idle: "-- psig", color: 0xd8232a });
    holoTag(spareGauge, "Spare gauge — no current tag", 0, 0.16, 0, { css: "#f0645b", w: 0.6 });
    reg2(spareGauge, "gauge-out-of-cal");

    const overPressureHandle = box(pump, 0.1, 0.06, 0.06, -0.2, 0.4, -0.15, 0xd8232a, { rough: 0.5 });
    holoTag(overPressureHandle, "Keep pumping past test?", 0, 0.16, 0, { css: "#f0645b", w: 0.56 });
    reg2(overPressureHandle, "over-pressurize-past-test");

    // ------------------------------------------------------------------- paperwork + crew
    const procedurePanel = holoPanel(g, 0.56, 0.4, -1.9, 1.5, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(4,10,14,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#9ac4d4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("HYDROSTATIC TEST PROCEDURE", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("VESSEL V-118 — REPAIR TEST", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      ctx.fillStyle = "#9ac4d4";
      ["Test pressure: per the code", "Hold time: per the code",
        "Gauge: current calibration only", "Witness: authorized inspector",
        "Walk: from beside every joint"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.1)));
    }, { ry: 0.7, accent: IBHT_ACCENT });
    reg2(procedurePanel, "test-procedure-panel");

    const chest = toolChest(g, 2.1, 1.7, { ry: -0.6, color: IBHT_ACCENT });
    void chest;

    const inspector = standingFigure(g, 1.9, -1.3, { ry: -2.4, cloth: 0x2b3138, helmet: 0xf2c14b, vest: 0x59c97b });
    reg2(inspector, "inspector-figure");
    reg2(inspector, "witness-hold-flag");

    const foreman = standingFigure(g, -2.75, 0.35, { ry: -0.7, cloth: 0x3a434d, helmet: 0xf2c14b, vest: 0xe4dc3a });
    void foreman;
    const checkin = holoPanel(g, 0.46, 0.3, -2.6, 1.6, 2.1, (ctx, w, h) => {
      ctx.fillStyle = "rgba(4,10,14,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 4);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("CHECK IN — FOREMAN", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("weeps found · spare gauge · ramp feel", w / 2, h * 0.68);
    }, { accent: IBHT_ACCENT });
    reg2(checkin, "ibht-crew-checkin");

    const certificate = holoPanel(g, 0.42, 0.3, -0.3, 1.55, 2.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(4,6,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 4);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("TEST CERTIFICATE", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("inspector signature line", w / 2, h * 0.68);
    }, { accent: IBHT_ACCENT });
    reg2(certificate, "test-certificate");

    const closingLog = slab(g, 0.22, 0.03, 0.28, -2.6, 0.93, 2.1, 0xe8e2d4, { radius: 0.008, rough: 0.85 });
    holoTag(g, "Test closeout log", -2.6, 1.12, 2.1, { css: "#8fa9c4", w: 0.4 });
    reg2(closingLog, "ibht-closing-log");

    // Final-walk targets.
    const retainedWater = box(vessel, 0.2, 0.01, 0.2, 0.3, 0.16, 0.3, 0x2b6f8f, { rough: 0.2, opacity: 0.5, transparent: true, cast: false });
    holoTag(vessel, "Retained water", 0, 0.28, 0.3, { css: "#f0645b", w: 0.36 });
    reg2(retainedWater, "retained-water");
    const blindFlag = box(testBlindFlange, 0.06, 0.08, 0.01, 0.2, 0, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(blindFlag, "Blind flag", 0, 0.1, 0, { css: "#f0645b", w: 0.3 });
    reg2(blindFlag, "loose-blind-flag");
    const toolOnVessel = box(vessel, 0.14, 0.02, 0.03, -0.3, 1.85, 0.6, 0x3a78c9, { rough: 0.4, metal: 0.3 });
    holoTag(vessel, "Tool on the vessel", 0, 0.1, 0, { css: "#f0645b", w: 0.36 });
    reg2(toolOnVessel, "tool-on-vessel");

    // ----------------------------------------------------------------- state
    let holding = false;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0.3, 1.3, -0.8),

      onStepComplete(step) {
        if (step.id === "fill-vent") airStream.visible = true;
        if (step.id === "hold-pressure") holding = true;
        if (step.id === "leak-walk") { weldWeep.visible = false; threadedWeep.visible = false; }
        if (step.id === "drain-and-vent") { airStream.visible = false; }
        if (step.id === "final-walk") {
          retainedWater.visible = false; blindFlag.visible = false; toolOnVessel.visible = false;
        }
      },

      onInterrupt(it) {
        if (it.id === "sudden-pressure-drop") { spray.visible = true; }
        if (it.id === "inspector-called-away") inspector.rotation.y = -0.5;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "sudden-pressure-drop") { spray.visible = false; }
        if (it.id === "inspector-called-away") inspector.rotation.y = -2.4;
      },

      onHazard() {},

      animate(t, dt, session) {
        void holding; void t;
        if (airStream.visible) airStream.userData.step(dt, new THREE.Vector3(0, 1.0, 0), 0.04, 0.4, 0.3);
        if (spray.visible) spray.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.03, 0.3, 0.2);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "hold-pressure") {
          repaint(masterGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, {
            bg: "#0d1c24", accent: gg.t > 0.85 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
