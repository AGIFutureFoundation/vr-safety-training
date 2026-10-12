import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, valveWheel, pipeRun, lockTag, deckPlateFace, paintedSteelFace,
  surfaceTexture, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hydronic Boiler Piping & Hydrotest VR — Building Systems &
// Facilities, UA plumbers and pipefitters.
//
// A new heating loop off an existing boiler is two separate jobs stacked on
// top of each other. The first is mechanical: the boiler itself has to be
// dead — fuel isolated, power locked, tagged by the fitter's own name —
// before a coupling housing is ever opened next to it, because a boiler
// that fires while somebody has a joint apart is not a plumbing mistake,
// it is a burn. The second job starts once the pipe is closed up: nobody
// insulates, ceils over or hands back a hydronic loop on the strength of a
// fitter's opinion that it "feels tight." ASME B31.9 puts a hydrostatic
// test between "built" and "in service" for exactly that reason, and the
// test is only worth anything if the fitter actually walks every joint
// while it holds, not just the gauge on the pump.

const HBH_ACCENT = 0xf2a13a;

export const SIM_PL_HYDRONIC_BOILER_PIPING_AND_HYDROTEST = {
  id: "pl-hydronic-boiler-piping-and-hydrotest",
  index: "pl-02",
  domain: "Building Systems & Facilities",
  trade: "UA pipefitter / hydronic piping installer",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "UA plumbers and pipefitters apprenticeship; ASME B31.9 building services piping; the ASME Boiler and Pressure Vessel Code for the boiler this loop ties into; 29 CFR 1910.147 the control of hazardous energy; 8 CCR 3203 injury and illness prevention",
  name: "Hydronic Boiler Piping & Hydrotest",
  title: simTitle("Hydronic Boiler Piping & Hydrotest"),
  tagline: "The boiler locked and tagged before a coupling opens near it, a new heating loop assembled in a proven pattern, and the whole run walked joint by joint under a hydrostatic test before it is ever insulated over",
  accent: HBH_ACCENT,
  accentCss: "#f2a13a",
  parSeconds: 270,
  footprint: 2.3,
  badge: { id: "loop-proven", name: "Loop Proven", note: "A hydronic loop assembled off a locked-out boiler and hydrotested joint by joint before cover-up" },

  game: system({
    name: "Hydronic Authority",
    currency: "PSI",
    ranks: ["Apprentice", "Journeyman", "Pipefitter", "Lead Fitter", "Hydronic Certified"],
    badges: [
      { id: "boiler-locked-first", name: "Boiler Locked First", note: "The boiler was isolated and tagged before any coupling was opened", test: AWARD.stepClean("isolate") },
      { id: "never-untested", name: "Never Untested", note: "No section of the loop was covered before the test held", test: AWARD.safe },
      { id: "steady-hold", name: "Steady Hold", note: "Held the test pressure inside the band the whole watch", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-loop", name: "Clean Loop", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "unbroken-watch", name: "Unbroken Watch", note: "The pressure watch never lapsed", test: AWARD.unbroken },
      { id: "loop-back-fast", name: "Loop Back Fast", note: "Signed off inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-boiler-lockout": "You opened a coupling on this loop before the boiler feeding it was locked and tagged. This header is close enough to the firebox that a boiler which fires while a joint is open puts a fitter's hands and face right where the heat goes, and a closed valve with no lock on it can be reopened by anyone who does not know you are still working here.",
    "wrong-gasket": "You closed the coupling housing with the general-purpose gasket instead of the one rated for this system's hot water. A gasket that is not rated for the temperature this loop actually runs at hardens and shrinks long before the pipe around it fails, and it lets go quietly, as a weep, in the ceiling void nobody is going to see until the stain reaches the tile below.",
    "cover-before-test": "You started boxing this section in before the hydrotest held. ASME B31.9 puts the test before the cover for a reason: a joint that is behind insulation and a ceiling grid when it starts to weep is a joint nobody finds until the damage is a demolished ceiling, not a five-minute fix on an open run.",
    "overpressure-test": "You kept pumping the test past the value the drawing calls for because the gauge still had room on the dial. A test pressure is not a target to beat — it is a ceiling set by the weakest rated component on this loop, and pushing past it risks damaging a valve or a gauge that was never meant to see that number, on a system that is supposed to come out of this test proven, not compromised.",
  },

  lateNotes: {
    "boiler-fuel-valve": "The boiler is isolated and tagged before any coupling on this loop is opened, not after the first fitting is already apart.",
    "coupling-1": "The couplings go together in the housing's own pattern — snug, then torqued round — after the pipe ends are cleaned and lubricated, not before.",
    "test-pump": "The hydrotest happens after the loop is fully assembled and before any of it goes behind insulation or a ceiling grid.",
  },

  // Two things that happen to a fitter whose hands are on a wrench or a
  // pump handle and whose eyes are on a gauge. See shared/game.js.
  interrupts: [
    {
      id: "far-coupling-weeps",
      kind: "A coupling downstream starts weeping",
      // Armed on entering the pressure-hold track step, so the window lands
      // while attention is on the test pump gauge — answered at the actual
      // coupling, not the pump.
      after: "hold-test", delay: 3, seconds: 12,
      alert: "The coupling at the far end of the run just started weeping under test pressure.",
      cue: "That is a real leak on the loop you are testing right now — go look at the coupling itself.",
      target: "coupling-3",
      why: "A coupling weeping under test pressure is exactly what the hydrotest exists to catch, and it means this specific joint did not seal the way the rest of the run did. Finding it now, gauge in hand and the loop still open, costs a wrench and five minutes; finding it after the ceiling goes back costs a demolished finish and a callback nobody wants to schedule.",
      missNote: "The coupling kept weeping while the watch stayed on the pump gauge. That joint has to be reopened, re-lubricated and retested from nothing, and now it is one more thing standing between this loop and being signed off.",
      wrongNote: "It is the coupling itself, not the pump. The pump only tells you pressure is dropping somewhere on the loop — it does not tell you where.",
    },
    {
      id: "boiler-room-alarm",
      kind: "Boiler room trouble alarm chirps",
      // Armed after the test log/select step opens, answered at the alarm
      // panel rather than at the test equipment the learner has been using.
      after: "log", delay: 3, seconds: 12,
      alert: "The boiler room's own alarm panel just started chirping a trouble signal on a zone that is not this loop.",
      cue: "That is a separate system in the same room calling for attention — check the panel before you sign this test off.",
      target: "alarm-panel",
      why: "A trouble signal from the boiler's own controls, sounding while a fitter is finishing paperwork three metres away, is not something this job gets to ignore just because it belongs to a different system. Checking it now, before the test log is signed and the fitter's attention moves on to the next task, is what keeps a real fault from sitting unacknowledged in a room somebody just spent an hour working in.",
      missNote: "The panel kept chirping while the test got signed off anyway. Whatever that trouble signal was waiting to say, it said it to an empty room.",
      wrongNote: "It is the alarm panel. Signing the hydrotest log does not answer for a fault on a system this job was never testing.",
    },
  ],

  steps: [
    {
      id: "drawing", kind: "select", target: "pid-drawing",
      title: "Read the piping drawing for this loop",
      cue: "Check the drawing: pipe size, the coupling pattern, and the test pressure the loop is designed for.",
      why: "ASME B31.9 sizes a hydronic loop and sets its test pressure around the pressure and temperature the system is actually designed to run at, and both numbers live on the drawing, not in a fitter's memory of the last job. A loop built to the wrong schedule or tested to the wrong figure is either undersized for its real duty or tested against a number that proves nothing about the one it will actually see in service.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["close-fuel-valve", "lock-electrical", "tag-boiler"],
      itemNames: { "close-fuel-valve": "fuel valve closed", "lock-electrical": "disconnect locked", "tag-boiler": "tag hung" },
      title: "Isolate and lock out the boiler",
      cue: "Close the boiler's fuel valve, lock the electrical disconnect, and hang a tag with your name on it.",
      why: "This loop ties directly into a boiler that can fire on its own controls the moment nobody has told it otherwise, and a coupling open on the header a metre from the firebox is not a safe place to be when that happens. Locking the disconnect, not just closing the fuel valve, is what stops the boiler's own control sequence from doing something dangerous while a fitter still has a joint apart downstream of it.",
      outOfOrderNote: "Fuel valve, then the lock, then the tag — the lock is what makes the closed valve mean something to the next person walking through this room.",
    },
    {
      id: "inspect-pipe", kind: "find", noHint: true,
      targets: ["out-of-round-groove", "wrong-schedule-pipe"],
      itemNames: { "out-of-round-groove": "out-of-round groove on a pipe end", "wrong-schedule-pipe": "wrong-schedule pipe staged for the run" },
      itemNotes: {
        "out-of-round-groove": "This pipe end's roll groove is out of round — a coupling closed over it will not seat evenly and it will find that exact spot to weep from under test.",
        "wrong-schedule-pipe": "This length is a lighter schedule than the drawing calls for. It is the right diameter, which is exactly how it ends up staged with the right pipe by mistake.",
      },
      title: "Inspect the staged pipe before assembly",
      cue: "Check the pipe and fittings staged for this run before anything goes together.",
      why: "A groove rolled out of round or a pipe swapped for the wrong schedule both look correct from three feet away, and both are the kind of thing a hydrotest is specifically good at finding — the hard way, after the run is already assembled and the wrong piece is the one holding back the water.",
    },
    {
      id: "fitup", kind: "drag", target: "new-section",
      title: "Bring the new section into the housing",
      cue: "Drag the cleaned pipe end into the coupling housing and seat it against the stop.",
      why: "The coupling only seals if both pipe ends are seated square against the housing's own stop with the gasket sitting evenly around the full circumference — a pipe left proud on one side leaves the gasket unsupported there, and that is precisely where the joint will let go once it is under pressure instead of just sitting in a rack.",
      drag: { to: "coupling-housing", radius: 0.4, missNote: "Not seated against the stop — a pipe end left proud on one side leaves the gasket unsupported there." },
    },
    {
      id: "gasket", kind: "select", target: "hot-water-gasket",
      title: "Select the gasket rated for this system",
      cue: "Pick the gasket compound rated for this loop's hot water, not the general-purpose one on the same shelf.",
      why: "A gasket compound is rated for a specific temperature range, and a general-purpose gasket grabbed by habit can look and fit identically to the correct one while hardening and shrinking years before its rated counterpart would, on a system running hotter than the general-purpose compound was ever meant to see.",
    },
    {
      id: "bolt-up", kind: "sequence",
      targets: ["coupling-1", "coupling-2", "coupling-3"],
      itemNames: { "coupling-1": "coupling one torqued", "coupling-2": "coupling two torqued", "coupling-3": "coupling three torqued" },
      title: "Torque the couplings in order down the run",
      cue: "Torque coupling one, then two, then three, working down the run rather than jumping around it.",
      why: "Working down the run in order keeps the pipe from being pulled out of alignment by a joint three sections away being drawn up first — a coupling torqued out of sequence can rack the whole run slightly, and that small misalignment is exactly what shows up later as an uneven seal on a joint that had nothing wrong with its own gasket.",
      outOfOrderNote: "One, then two, then three — down the run in the order the pipe was laid, not whichever coupling is closest to hand.",
    },
    {
      id: "fill", kind: "hold", target: "fill-valve", seconds: 5,
      title: "Fill the loop and bleed the air",
      cue: "Hold the fill valve open at the high point until the air is out and water runs clean.",
      why: "Trapped air in a hydronic loop compresses under pressure the way the water around it does not, which makes a pressure test read soft and unreliable long before the real test pressure is ever reached — bleeding the high point now is what makes the gauge answer for the water in this loop rather than for a pocket of air riding along with it.",
      holdBreakNote: "The bleed closed before the air was out — open it again until the water runs clean, or this test is reading a mix of air and water instead of water alone.",
    },
    {
      id: "raise-pressure", kind: "gauge", target: "test-pump",
      title: "Bring the loop up to test pressure",
      cue: "Pump the loop up to the test pressure per the code and the drawing, then commit once it holds.",
      why: "The test pressure on the drawing is set above the loop's working pressure by a margin ASME B31.9 defines, high enough to prove real reserve and low enough not to risk the weakest rated part on the run — which is exactly why the number comes from the drawing rather than from how much more the pump happens to be able to deliver.",
      gauge: { label: "TEST PRESSURE", speed: 0.68, green: [0.56, 0.76], readout: (t) => `${Math.round(t * 100)}% of test value`, missNote: "Short of test pressure — bring it back up before the watch starts, or the hold that follows is proving nothing." },
    },
    {
      id: "hold-test", kind: "track", target: "gauge-watch", seconds: 7,
      title: "Hold the test pressure and watch for drop",
      cue: "Keep the pressure steady in the band while you watch the gauge for any sign of drop.",
      why: "A pressure that holds dead steady says the loop is sealed; a pressure that creeps down even slowly says water is leaving the system somewhere, and the whole point of holding the watch rather than just glancing at the gauge once is to catch a slow leak before it is dismissed as a rounding error on the dial.",
      track: { start: 0.66, green: [0.56, 0.76], rise: 0.05, fall: 0.3, drift: 0.12, label: "TEST PRESSURE", readout: (v) => (v < 0.56 ? "dropping — leak somewhere on the loop" : v > 0.76 ? "over the test value" : "holding steady") },
      holdBreakNote: "The pressure dropped out of band during the watch — that is a leak on this loop, not a bad gauge, and it has to be found before the test counts for anything.",
    },
    {
      id: "walk-loop", kind: "find",
      targets: ["weeping-coupling", "loose-hanger"],
      itemNames: { "weeping-coupling": "weeping coupling", "loose-hanger": "loose pipe hanger" },
      itemNotes: {
        "weeping-coupling": "This coupling is weeping under test pressure — a slow bead forming at the gasket line, easy to miss from across the room.",
        "loose-hanger": "This hanger has backed off and the pipe is resting on the flex duct below it instead of hanging clear the way the drawing shows it.",
      },
      title: "Walk the loop while it is under test",
      cue: "Walk the full run while the pressure holds and look at every joint and hanger, not just the gauge.",
      why: "The gauge tells you the loop as a whole is holding pressure; it cannot tell you which one joint out of a dozen is the reason, or that a hanger let go and the pipe is now resting on someone else's ductwork. Walking the run while it is still pressurised is the only way either of those things gets found before the ceiling goes back over both of them.",
    },
    {
      id: "bleed-down", kind: "sequence",
      targets: ["close-pump-valve", "open-drain", "disconnect-pump"],
      itemNames: { "close-pump-valve": "pump isolation closed", "open-drain": "drain opened", "disconnect-pump": "test pump disconnected" },
      title: "Bleed the test pressure down",
      cue: "Close the pump's isolation valve, open the drain, then disconnect the test pump.",
      why: "Bleeding the pressure down in this order keeps the test pump from being disconnected while it is still holding system pressure against a closed valve, which is how a hose end whips loose under load instead of coming apart on an already-depressurised line.",
      outOfOrderNote: "Isolate the pump first, then open the drain, then disconnect it — never disconnect anything still holding pressure.",
    },
    {
      id: "log", kind: "select", target: "test-log",
      title: "Complete the hydrotest log",
      cue: "Fill in the test log with the pressure held, the duration, and your name before anything is covered.",
      why: "ASME B31.9 expects a hydrotest to leave a record, not just a fitter's word that it happened, because the next trade to touch this loop — the insulator, the ceiling contractor, the next fitter after a callback — has no way to see a test that already came and went except through what got written down.",
    },
    {
      id: "restore", kind: "turn", target: "boiler-fuel-valve",
      title: "Restore the boiler once the loop is signed off",
      cue: "Remove the lock and tag, then open the boiler's fuel valve back up now the loop is proven.",
      why: "The boiler only comes back into service once the work that required it locked out is actually finished and signed off — reopening the fuel valve while the log is still blank puts the plant back in service on the strength of a test that has not been recorded as having happened at all.",
      turn: { turns: 0.5, axis: "y", label: "BOILER FUEL VALVE" },
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, HBH_ACCENT);

    const floorTex = surfaceTexture((ctx, w, h) => deckPlateFace(ctx, w, h, { base: "#454d54", base2: "#3a4046" }), { repeat: 5 });
    box(g, 5.4, 0.1, 4.6, 0, 0.05, 0, 0xffffff, { rough: 0.6 }).material = texturedMat(floorTex, { color: 0xdadde0, rough: 0.6, metal: 0.15 });

    const blockTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#7d8288"; ctx.fillRect(0, 0, w, h);
      const rows = 6, cols = 10;
      for (let r = 0; r <= rows; r++) { ctx.strokeStyle = "rgba(0,0,0,0.28)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, (r / rows) * h); ctx.lineTo(w, (r / rows) * h); ctx.stroke(); }
      for (let r = 0; r < rows; r++) { const off = r % 2 ? (w / cols) / 2 : 0; for (let c = 0; c <= cols; c++) { const x = off + (c / cols) * w; ctx.beginPath(); ctx.moveTo(x, (r / rows) * h); ctx.lineTo(x, ((r + 1) / rows) * h); ctx.stroke(); } }
    }, { repeat: 2 });
    box(g, 5.4, 2.7, 0.14, 0, 1.45, -2.1, 0xffffff, { rough: 0.9 }).material = texturedMat(blockTex, { color: 0x8a8f95, rough: 0.9 });
    box(g, 5.4, 0.14, 0.3, 0, 2.85, -2.1, 0x99a2a8, { rough: 0.8 });

    // The boiler itself — a riveted painted-steel jacket, its own fuel valve
    // and electrical disconnect within reach.
    const boiler = group(g, -1.7, 0, -1.6, 0.4);
    const boilerTex = surfaceTexture((ctx, w, h) => paintedSteelFace(ctx, w, h, { base: "#2e6f9e", base2: "#255d85", cols: 2, rows: 3 }), { repeat: 1 });
    const boilerShell = cyl(boiler, 0.55, 0.55, 1.3, 0, 1.0, 0, 0xffffff, { rough: 0.55, seg: 24 });
    boilerShell.rotation.z = Math.PI / 2;
    boilerShell.material = texturedMat(boilerTex, { color: 0x2e6f9e, rough: 0.55, metal: 0.2 });
    cyl(boiler, 0.58, 0.58, 0.06, -0.65, 1.0, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 24 }).rotation.z = Math.PI / 2;
    cyl(boiler, 0.58, 0.58, 0.06, 0.65, 1.0, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 24 }).rotation.z = Math.PI / 2;
    holoTag(boiler, "boiler — locked out", 0, 1.75, 0, { css: "#f2a13a", w: 0.5 });
    const fuelValve = valveWheel(boiler, 0.7, 0.6, 0, { color: 0xd2312b, body: 0x2b2f34, r: 0.08 });
    holoTag(boiler, "boiler fuel valve", 0.7, 0.9, 0, { css: "#f2a13a", w: 0.4 });
    reg(hits, fuelValve, "close-fuel-valve");
    hits["boiler-fuel-valve"] = fuelValve;
    const elecPanel = box(boiler, 0.24, 0.34, 0.1, -0.72, 0.65, 0.35, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(boiler, "electrical disconnect", -0.72, 0.9, 0.35, { css: "#f2a13a", w: 0.42 });
    reg(hits, elecPanel, "lock-electrical");
    const lock = lockTag(boiler, -0.72, 0.4, 0.4, { color: 0xd8232a, lines: ["BOILER", "LOCKOUT"] });
    reg(hits, lock, "tag-boiler");
    const alarmPanel = box(boiler, 0.2, 0.16, 0.06, 0.0, 1.9, 0.2, 0xdfe6ec, { rough: 0.4 });
    decal(boiler, 0.16, 0.06, 0.0, 1.94, 0.235, signFace("TROUBLE", { bg: "#3a1010", accent: "#f0645b", scale: 0.5 }));
    reg(hits, alarmPanel, "alarm-panel");
    const skipLockoutTarget = box(g, 0.22, 0.22, 0.22, -0.9, 1.1, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "open a coupling before it's locked out?", -0.9, 1.32, -1.2, { css: "#d2312b", w: 0.68 });
    reg(hits, skipLockoutTarget, "skip-boiler-lockout");

    // The new heating loop: three grooved couplings down a header at bench
    // height, with insulation-clad pipe either side of the working section.
    const loop = group(g, 0.7, 1.0, -1.5);
    const cladTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#c7ccd0"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      for (let i = 0; i < 10; i++) ctx.fillRect(0, (i / 10) * h, w, 1.5);
    }, { repeat: 3 });
    const cladPipe1 = pipeRun(loop, [[-1.6, 0, 0], [-0.9, 0, 0]], 0.05, 0xffffff, {});
    cladPipe1.traverse((o) => { if (o.isMesh) o.material = texturedMat(cladTex, { color: 0xc7ccd0, rough: 0.6, metal: 0.2 }); });
    const cladPipe2 = pipeRun(loop, [[0.9, 0, 0], [1.6, 0, 0]], 0.05, 0xffffff, {});
    cladPipe2.traverse((o) => { if (o.isMesh) o.material = texturedMat(cladTex, { color: 0xc7ccd0, rough: 0.6, metal: 0.2 }); });
    const housing1 = group(loop, -0.75, 0, 0);
    const housing2 = group(loop, -0.3, 0, 0);
    const housing3 = group(loop, 0.75, 0, 0);
    for (const [h, id, name] of [[housing1, "coupling-1", "one"], [housing2, "coupling-2", "two"], [housing3, "coupling-3", "three"]]) {
      cyl(h, 0.08, 0.08, 0.16, 0, 0, 0, 0x8a939b, { rough: 0.45, metal: 0.65, seg: 16 }).rotation.z = Math.PI / 2;
      torus(h, 0.08, 0.014, 0, 0, 0, 0x2b3138, { rough: 0.5, seg: 8, seg2: 20 }).rotation.y = Math.PI / 2;
      holoTag(h, `coupling ${name}`, 0, 0.22, 0, { css: "#f2a13a", w: 0.3 });
      reg(hits, h, id);
    }
    // The section under active assembly, with a bare pipe end staged behind it.
    const bareSection = cyl(loop, 0.055, 0.055, 0.35, -0.5, 0, 0, 0x9aa3ab, { rough: 0.35, metal: 0.6, seg: 16, open: true });
    bareSection.rotation.z = Math.PI / 2;
    reg(hits, bareSection, "out-of-round-groove");
    const wrongPipe = cyl(g, 0.045, 0.045, 0.35, 1.4, 0.35, -0.9, 0xa8b0b6, { rough: 0.35, metal: 0.6, seg: 16 });
    wrongPipe.rotation.z = Math.PI / 2;
    holoTag(g, "check the schedule stamp", 1.4, 0.55, -0.9, { css: "#f2a13a", w: 0.4 });
    reg(hits, wrongPipe, "wrong-schedule-pipe");
    hits["coupling-housing"] = housing2;
    const newSection = group(g, -0.5, 1.0, -0.85, 0.5);
    cyl(newSection, 0.055, 0.055, 0.3, 0, 0, 0, 0xb8834a, { rough: 0.35, metal: 0.6, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(newSection, "new section", 0, 0.18, 0, { css: "#f2a13a", w: 0.32 });
    reg(hits, newSection, "new-section");

    // Gasket bin: correct and general-purpose side by side.
    const gasketBin = group(g, 1.7, 0.86, -0.9, 0.3);
    const hotGasket = torus(gasketBin, 0.06, 0.014, -0.06, 0, 0, 0x3a7a5f, { rough: 0.6, seg: 8, seg2: 20 });
    decal(gasketBin, 0.1, 0.05, -0.06, 0.075, 0, signFace("EPDM 200F", { bg: "#0d2418", accent: "#59c97b", scale: 0.45 }));
    holoTag(gasketBin, "hot-water gasket", -0.06, 0.14, 0, { css: "#f2a13a", w: 0.4 });
    reg(hits, hotGasket, "hot-water-gasket");
    const genGasket = torus(gasketBin, 0.06, 0.014, 0.08, -0.02, 0.04, 0x8a5a3a, { rough: 0.6, seg: 8, seg2: 20 });
    holoTag(gasketBin, "general-purpose gasket", 0.08, 0.08, 0.04, { css: "#8fa9c4", w: 0.44 });
    void genGasket;
    const wrongGasketTarget = box(g, 0.2, 0.2, 0.2, 1.9, 1.4, -1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just use what's on the shelf?", 1.9, 1.6, -1.4, { css: "#d2312b", w: 0.5 });
    reg(hits, wrongGasketTarget, "wrong-gasket");

    // Fill valve, test pump, gauge and the drain.
    const fillValve = valveWheel(g, -0.2, 1.75, -1.5, { color: 0x4fd1ff, body: 0x2b2f34, r: 0.07 });
    holoTag(g, "fill / bleed valve", -0.2, 2.0, -1.5, { css: "#f2a13a", w: 0.38 });
    reg(hits, fillValve, "fill-valve");

    const pumpCart = group(g, 2.1, 0.1, -0.4, -0.4);
    box(pumpCart, 0.42, 0.5, 0.32, 0, 0.25, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const pumpGauge = instrument(pumpCart, 0, 0.62, 0.12, { idle: "-- psi", color: 0x2b2f34, w: 0.16, d: 0.18 });
    holoTag(pumpCart, "hydrotest pump", 0, 0.82, 0.12, { css: "#f2a13a", w: 0.4 });
    reg(hits, pumpGauge, "test-pump");
    const pumpIso = box(pumpCart, 0.08, 0.06, 0.06, -0.18, 0.5, 0.15, 0xd2312b, { rough: 0.5 });
    reg(hits, pumpIso, "close-pump-valve");
    const drain = cyl(pumpCart, 0.03, 0.035, 0.14, 0.18, 0.15, 0.12, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 12 });
    reg(hits, drain, "open-drain");
    reg(hits, pumpCart, "disconnect-pump");
    const watchGauge = instrument(g, 0.7, 1.7, -1.05, { idle: "-- psi", color: 0x2b2f34, w: 0.16, d: 0.18 });
    holoTag(g, "pressure watch", 0.7, 1.9, -1.05, { css: "#f2a13a", w: 0.32 });
    reg(hits, watchGauge, "gauge-watch");
    const overTarget = box(g, 0.2, 0.2, 0.2, 2.4, 0.7, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "keep pumping past the drawing?", 2.4, 0.92, -0.4, { css: "#d2312b", w: 0.6 });
    reg(hits, overTarget, "overpressure-test");
    const coverTarget = box(g, 0.2, 0.2, 0.2, 0.2, 1.9, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "box it in before the test holds?", 0.2, 2.12, -2.0, { css: "#d2312b", w: 0.6 });
    reg(hits, coverTarget, "cover-before-test");

    // A loose hanger for the walk-round, and two sound ones down the run so
    // the loop reads as properly supported everywhere else.
    const hanger = group(g, -0.1, 1.0, -1.5);
    const strap = box(hanger, 0.02, 0.4, 0.02, 0, -0.2, 0, 0x8a939b, { rough: 0.5, metal: 0.6 });
    strap.rotation.z = 0.4;
    reg(hits, strap, "loose-hanger");
    for (const hx of [-1.3, 1.3]) {
      const goodHanger = group(g, 0.7 + hx, 1.5, -1.5);
      box(goodHanger, 0.02, 0.3, 0.02, 0, -0.15, 0, 0x8a939b, { rough: 0.5, metal: 0.6 });
      box(goodHanger, 0.1, 0.02, 0.02, 0, 0.0, 0, 0x8a939b, { rough: 0.5, metal: 0.6 });
    }

    // A circulator pump on the return leg — the piece of plant this loop
    // actually feeds once it is proven, standing on its own base beside the
    // boiler rather than crowding the coupling run under test.
    const pump = group(g, -0.5, 0, -0.6, 0.4);
    box(pump, 0.3, 0.06, 0.24, 0, 0.03, 0, 0x53606b, { rough: 0.7, metal: 0.4 });
    const pumpVolute = cyl(pump, 0.1, 0.1, 0.16, 0, 0.16, 0, 0x2f6f4a, { rough: 0.5, metal: 0.5, seg: 18 });
    pumpVolute.rotation.z = Math.PI / 2;
    const pumpMotor = cyl(pump, 0.07, 0.07, 0.18, 0.16, 0.16, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 16 });
    pumpMotor.rotation.z = Math.PI / 2;
    for (const fz of [-0.09, 0.09]) cyl(pump, 0.11, 0.11, 0.02, -0.02, 0.16, fz, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 18 }).rotation.z = Math.PI / 2;
    holoTag(pump, "circulator", 0, 0.34, 0, { css: "#f2a13a", w: 0.32 });

    // A wall-mounted aquastat panel controlling the loop's supply temperature.
    const aquastat = group(g, 1.9, 1.2, -2.02, 0);
    box(aquastat, 0.16, 0.2, 0.05, 0, 0, 0, 0xdfe6ec, { rough: 0.4 });
    decal(aquastat, 0.12, 0.06, 0, 0.04, 0.027, signFace("AQUASTAT", { bg: "#0d1c14", accent: "#f2a13a", scale: 0.4 }));
    void aquastat;
    const weepDrop = ball(loop, 0.014, -0.3, -0.06, 0, 0x6fb4d8, { rough: 0.2, opacity: 0.7, transparent: true });
    weepDrop.visible = false;
    reg(hits, weepDrop, "weeping-coupling");
    const weepAgain = ball(loop, 0.014, 0.75, -0.06, 0, 0x6fb4d8, { rough: 0.2, opacity: 0.7, transparent: true });
    weepAgain.visible = false;

    // Bench: drawing, log, phone.
    const bench = group(g, -1.9, 0.1, 0.8);
    box(bench, 1.2, 0.76, 0.55, 0, 0.38, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const drawing = decal(bench, 0.34, 0.42, -0.35, 0.78, 0, paperFace("HYDRONIC P&ID", ["Loop: HW-2", "Pipe: sched 40 steel", "Design temp per drawing", "Test pressure per code"], { scale: 0.82 }));
    drawing.rotation.x = -Math.PI / 2;
    holoTag(bench, "piping drawing", -0.35, 0.98, 0, { css: "#f2a13a", w: 0.34 });
    reg(hits, drawing, "pid-drawing");
    const logPaper = decal(bench, 0.32, 0.4, 0.35, 0.78, 0.02, paperFace("HYDROTEST LOG", ["Pressure held ______", "Duration ______", "Fitter ______", "Result: pass / fail"], { scale: 0.85 }));
    logPaper.rotation.x = -Math.PI / 2;
    holoTag(bench, "test log", 0.35, 0.98, 0.05, { css: "#f2a13a", w: 0.3 });
    reg(hits, logPaper, "test-log");

    const board = group(g, 2.0, 0, 1.7, -0.5);
    holoPanel(board, 0.95, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#2a1c05"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#f2a13a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fdeccf"; ctx.fillText("HYDRONIC LOOP — HW-2", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fff6e6";
      ["Lock and tag the boiler before any coupling opens", "Inspect every pipe end before it's assembled", "Bolt couplings down the run, in order", "Bleed the air before the test starts", "Test pressure per the code and the drawing", "Walk every joint while the test holds"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { accent: HBH_ACCENT });

    const fitter = standingFigure(g, -1.0, 1.5, { ry: -2.2, cloth: 0x8a5a2f });
    holoTag(fitter, "pipefitter", 0, 1.9, 0, { css: "#f2a13a", w: 0.3 });
    toolChest(g, 2.3, 1.6);
    for (const [x, z] of [[2.3, -2.0], [-2.4, -2.0]]) cone(g, x, z);

    let testing = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.3, -1.3),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect-pipe") { bareSection.visible = false; wrongPipe.visible = false; }
        if (step.id === "fitup") { newSection.position.set(0.4, 1.0, -1.8); newSection.rotation.y = 0; }
        if (step.id === "fill") repaint(pumpGauge.userData.screen, signFace("BLED", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "raise-pressure") { testing = true; repaint(watchGauge.userData.screen, signFace("HOLD", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 })); }
        if (step.id === "hold-test") { /* nothing extra: track already reads live */ }
        if (step.id === "walk-loop") { weepDrop.visible = false; strap.rotation.z = 0; }
        if (step.id === "bleed-down") testing = false;
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "far-coupling-weeps") { weepAgain.visible = true; housing3.children[0].material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.5, rough: 0.4 }); }
        if (it.id === "boiler-room-alarm") alarmPanel.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.6, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "far-coupling-weeps") { weepAgain.visible = false; housing3.children[0].material = mat(0x8a939b, { rough: 0.45, metal: 0.65 }); }
        if (it.id === "boiler-room-alarm") alarmPanel.material = mat(0xdfe6ec, { rough: 0.4 });
      },
      animate(t, dt, session) {
        if (testing) pumpGauge.rotation.y = Math.sin(t * 0.2) * 0.01;
        if (session?.turn && session.step?.id === "restore") fuelValve.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
      },
    };
  },
};
