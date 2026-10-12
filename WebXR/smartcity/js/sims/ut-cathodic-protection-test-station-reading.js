import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, lockTag, reg,
  surfaceTexture, texturedMat, gravelFace, gratingFace, rustFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cathodic Protection Test-Station Reading VR — Energy & Power,
// UWUA / IBEW gas-utility corrosion-control technician.
//
// Steel loses to corrosion on its own schedule unless something else is
// sacrificed in its place, and that something is the small DC current an
// impressed-current rectifier pushes into the ground. None of that current
// is visible; the only proof it is doing its job is a pipe-to-soil reading
// taken with a reference electrode actually wetted into the soil, not
// touching a dry patch of gravel, and the only proof the rectifier itself is
// behaving is a reading taken at its own meter with the AC side locked out
// first. A bond to a crossing pipeline is checked for continuity because
// cathodic protection meant for this main can just as easily accelerate
// corrosion on somebody else's steel if the two are not bonded together
// correctly. Sited generically: no real reading, criterion or main size is
// invented — every band here is "per the operator's own procedure."

const UT5_ACCENT = 0x4fa8e8;
const UT5_CSS = "#4fa8e8";
const UT5_PAL = palette("utility");

export const SIM_UT_CATHODIC_PROTECTION_TEST_STATION_READING = {
  id: "ut-cathodic-protection-test-station-reading",
  index: "ut-05",
  domain: "Energy",
  trade: "UWUA / IBEW gas-utility corrosion-control technician",
  category: "Energy & Power",
  weather: "overcast",
  certification: "UWUA / IBEW gas-utility corrosion-control technician training; 49 CFR Part 192 (PHMSA) for the operator's cathodic-protection monitoring interval and criteria on a steel main; OSHA 29 CFR 1910.147 the control of hazardous energy for isolating the rectifier's AC supply before its cabinet is opened; NFPA 70E for the electrical hazard at the rectifier panel; the operator's own corrosion-control procedure for the criteria a reading is actually checked against",
  name: "Cathodic Protection Test-Station Reading",
  title: simTitle("Cathodic Protection Test-Station Reading"),
  tagline: "A pipe-to-soil reading taken with the reference electrode actually wetted into the soil, a rectifier read only after its AC side is locked out, and a bond to a crossing line checked for continuity before this main's own protection is trusted",
  accent: UT5_ACCENT,
  accentCss: UT5_CSS,
  parSeconds: 290,
  footprint: 2.3,
  badge: { id: "protection-proven", name: "Protection Proven", note: "A pipe-to-soil reading taken correctly, a rectifier read only after lockout, a bond proven continuous, and every number written back to the corrosion-control record" },

  game: system({
    name: "Distribution Authority",
    currency: "mV",
    ranks: ["Apprentice", "Service Crew", "Corrosion Control Tech", "Crew Lead", "Distribution Authority Certified"],
    badges: [
      { id: "rectifier-locked-first", name: "Rectifier Locked First", note: "The AC supply was locked out before the cabinet was ever opened", test: AWARD.stepClean("isolate-rectifier") },
      { id: "wetted-not-guessed", name: "Wetted, Not Guessed", note: "No unsafe action was recorded getting a pipe-to-soil reading", test: AWARD.safe },
      { id: "steady-output", name: "Steady Output", note: "Held the rectifier output watch inside the band the whole time", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-survey", name: "Clean Survey", note: "No corrections from the record to the log", test: AWARD.clean },
      { id: "unbroken-output-watch", name: "Unbroken Output Watch", note: "The rectifier output watch ran to completion without a break", test: AWARD.unbroken },
      { id: "station-clear-fast", name: "Station Clear Fast", note: "Logged and locked up inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-rectifier-loto": "You went to open the rectifier cabinet without switching off and tagging the AC supply first. The AC side of that cabinet is exactly the kind of live electrical panel NFPA 70E exists for, and a hand inside it before the supply is proven off is a hand inside a live panel on the strength of a switch that was never actually checked.",
    "wrong-half-cell-contact": "You went to take the pipe-to-soil reading with the reference electrode resting on dry gravel instead of wetted into the soil. A half-cell that is not in real electrical contact with the electrolyte reads whatever a bad connection feels like giving it — a number that looks like data and is actually noise.",
    "skip-stray-current-check": "You went to sign off on this test station without checking the foreign line crossing for a bonded connection. Cathodic protection meant for this main can push current onto a neighbouring pipeline that has no bond to carry it away again, and the corrosion that current causes shows up on somebody else's steel, not this one.",
    "leave-cabinet-unlocked": "You went to walk away from the rectifier with its cabinet unlocked. An impressed-current rectifier is a live electrical enclosure standing in the open, and one left unlocked is one anybody passing can open, whether or not they have any idea what they would be reaching into.",
  },

  lateNotes: {
    "rectifier-ac-off": "The rectifier's AC switch goes off and gets tagged before the cabinet door is ever opened, not after.",
    "rectifier-cabinet-latch": "The cabinet latch opens only once the AC switch is confirmed off and tagged.",
  },

  // Two things that happen to a technician whose hands are on a bond clamp
  // or watching a rectifier's output hold steady. See shared/game.js.
  interrupts: [
    {
      id: "scada-current-alert",
      kind: "SCADA calls in a current spike on this segment",
      after: "output-watch", delay: 3, seconds: 13,
      alert: "The SCADA desk is calling: a rectifier further along this same protected segment just logged a sudden current spike, right while this station's own output is being watched.",
      cue: "Answer the radio and confirm whether this rectifier's reading is tied to it.",
      target: "cp-radio",
      why: "Two rectifiers on the same protected segment behaving strangely at the same time is either a coincidence or a sign of a shared problem — a bond that failed, a fault somewhere on the segment — and answering the call is what lets this technician's own reading actually help answer that question instead of being one more number nobody connects to the other one.",
      missNote: "The call went unanswered while the output watch continued. Whatever connects this rectifier's reading to the spike further along the segment was never checked.",
      wrongNote: "It is the radio call from SCADA. The rectifier in front of you has not changed — this is about what another one just reported.",
    },
    {
      id: "public-at-cabinet",
      kind: "A member of the public approaches the open cabinet",
      after: "bond-continuity-test", delay: 3, seconds: 11,
      alert: "Someone walking by has stopped right at the open rectifier cabinet, curious, with no idea it is a live electrical enclosure.",
      cue: "Get the barrier up between them and the open cabinet before they reach for anything.",
      target: "public-barrier",
      why: "An open rectifier cabinet reads as an interesting box to anyone who does not know what is inside it, and a barrier up before they are close enough to touch anything is the only thing standing between someone's curiosity and a live AC panel.",
      missNote: "The passerby stayed right at the open cabinet with nothing between them and it. A live electrical enclosure left approachable is approachable by anyone who has no reason to know better.",
      wrongNote: "It is the barrier, between the cabinet and the person walking up to it. The bond clamp has nothing to do with somebody wandering up to an open panel.",
    },
  ],

  supportLine: "your utility's employee assistance programme, or your UWUA or IBEW steward if you are not sure how to reach it",

  steps: [
    {
      id: "read-record", kind: "select", target: "cp-record",
      title: "Read the test station's survey record",
      cue: "Check the prior readings and the monitoring interval this test station is due on.",
      why: "A single reading means little without the trend behind it — the record is what shows whether today's number continues a stable pattern or breaks from one, and it is read before anything is touched so today's reading is compared against something real.",
    },
    {
      id: "isolate-rectifier", kind: "sequence",
      targets: ["rectifier-ac-off", "rectifier-ac-tag"],
      itemNames: { "rectifier-ac-off": "AC supply switched off", "rectifier-ac-tag": "AC supply tagged" },
      title: "Isolate and tag the rectifier's AC supply",
      cue: "Switch off the rectifier's AC supply, then tag it, before the cabinet door opens.",
      why: "The tag is what stops that switch being flipped back on by anyone who does not know a hand is about to be inside the cabinet — the one connection on this whole enclosure that can put line voltage behind the panel this technician is about to work in front of.",
      outOfOrderNote: "Off, then tagged — a switched-off supply with no tag can be turned back on by someone with no idea work is happening at the cabinet.",
    },
    {
      id: "inspect-test-station", kind: "find", noHint: true,
      targets: ["corroded-terminal", "loose-wire-connection"],
      itemNames: { "corroded-terminal": "corroded terminal on the test post", "loose-wire-connection": "a loose wire connection at the post" },
      itemNotes: {
        "corroded-terminal": "This terminal is corroded enough that a reading taken through it is a reading taken through resistance the wire itself is adding — cleaned or remade, not read around.",
        "loose-wire-connection": "This wire is loose at its terminal, which is exactly the kind of connection that reads fine one visit and reads nothing at all the next.",
      },
      title: "Inspect the test station before reading it",
      cue: "Walk the test post and find what has to be fixed before today's reading is trusted.",
      why: "A test station is only as good as its own wiring, and a corroded terminal or a loose connection can make a perfectly protected pipe read as if it is not — caught here, it is a two-minute repair instead of a false alarm that sends a survey crew chasing a problem that was only ever at the post.",
    },
    {
      id: "place-half-cell", kind: "drag", target: "reference-electrode",
      title: "Wet the reference electrode into the soil",
      cue: "Carry the reference electrode to the soil directly over the pipe and seat it in contact with the ground.",
      why: "The half-cell has to be in real electrical contact with the same electrolyte the pipe itself sits in — set on dry gravel or on pavement instead of wetted soil, it is not measuring this pipe's potential at all, only whatever a poor contact happens to produce.",
      drag: { to: "soil-contact-point", radius: 0.42, missNote: "Not in contact with wetted soil over the pipe — a half-cell resting on dry ground or pavement gives a reading that means nothing." },
    },
    {
      id: "pipe-to-soil-reading", kind: "gauge", target: "cp-voltmeter",
      title: "Read the pipe-to-soil potential",
      cue: "Bring the voltmeter reading to where the operator's criteria says this main should sit, then commit.",
      why: "This reading is the only direct proof the current this rectifier is pushing is actually reaching this section of main at a level the operator's own criteria calls adequate — everything else in this job is inspection; this is the measurement.",
      gauge: { label: "PIPE-TO-SOIL (mV)", speed: 0.6, green: [0.55, 0.78], readout: (t) => `${Math.round(t * 1200)} mV`, missNote: "That reading is outside what the operator's criteria calls adequate for this main — reseat the half-cell and read it again before recording anything." },
    },
    {
      id: "stray-current-check", kind: "find",
      targets: ["foreign-line-crossing", "bond-wire"],
      itemNames: { "foreign-line-crossing": "a foreign pipeline crossing", "bond-wire": "the bond wire between the two lines" },
      itemNotes: {
        "foreign-line-crossing": "A pipeline this utility does not own crosses this main a short distance from the test station — exactly where stray current from this rectifier can find its way onto steel with no protection of its own.",
        "bond-wire": "This is the bond wire between the two lines. Its job is to carry any current between them safely rather than letting it find its own path through bare soil.",
      },
      title: "Check the crossing for stray-current interference",
      cue: "Walk to the crossing and find the foreign line and the bond that is supposed to protect it.",
      why: "This main's own protection can become somebody else's corrosion problem the moment current from this rectifier reaches a crossing pipeline with no bond to carry it safely away — checked here, at the one place that current actually has anywhere else to go.",
    },
    {
      id: "open-rectifier-access", kind: "turn", target: "rectifier-cabinet-latch",
      title: "Open the rectifier cabinet",
      cue: "Turn the cabinet latch now the AC supply is confirmed off and tagged.",
      why: "The latch turns only once the supply is proven dead, not on the assumption that a switch thrown a minute ago is still in the position it was left in — the tag and the switch are what this latch trusts, not memory.",
      turn: { turns: 0.4, axis: "y", label: "CABINET LATCH" },
    },
    {
      id: "rectifier-output-reading", kind: "gauge", target: "rectifier-meter",
      title: "Read the rectifier's own output",
      cue: "Bring the rectifier's voltage and current reading to where it should sit, then commit.",
      why: "The pipe-to-soil reading says the main is protected right now; the rectifier's own output is what says this unit is capable of keeping it that way — a rectifier drifting off its normal output is the thing that turns today's good reading into next quarter's failed one.",
      gauge: { label: "RECTIFIER OUTPUT", speed: 0.65, green: [0.45, 0.68], readout: (t) => `${(t * 20).toFixed(1)} V DC`, missNote: "That output is outside the rectifier's normal range for this segment — check the tap setting and the connections before recording it." },
    },
    {
      id: "output-watch", kind: "track", target: "rectifier-meter", seconds: 7,
      title: "Watch the output hold steady",
      cue: "Watch the rectifier's output stay steady for the full watch, not just at the moment it was read.",
      why: "A rectifier can read fine for an instant and still be arcing or cycling under load — held for a full watch, any instability shows up as drift instead of being missed between one glance and the next.",
      track: { start: 0.55, green: [0.42, 0.68], rise: 0.08, fall: 0.35, drift: 0.12, label: "RECTIFIER OUTPUT", readout: (v) => (v < 0.42 || v > 0.68 ? "unstable — check the connections" : "steady") },
      holdBreakNote: "That output drifted out of band during the watch — this rectifier is not holding steady, and that has to be found before this test station counts as checked.",
    },
    {
      id: "bond-continuity-test", kind: "hold", target: "continuity-tester", seconds: 5,
      title: "Test the bond for continuity",
      cue: "Hold the continuity tester on the bond wire for the full check.",
      why: "A bond wire can look intact and still be broken inside its own insulation — held on the clamp for the full check rather than glanced at, continuity is proven rather than assumed from the wire simply still being there.",
      holdBreakNote: "The tester came off before the check finished — hold it again, a broken bond looks identical to a good one until this test actually proves which it is.",
    },
    {
      id: "close-out-rectifier", kind: "sequence",
      targets: ["remove-rectifier-tag", "rectifier-ac-on", "lock-cabinet"],
      itemNames: { "remove-rectifier-tag": "tag removed", "rectifier-ac-on": "AC supply restored", "lock-cabinet": "cabinet locked" },
      title: "Close out the rectifier",
      cue: "Remove the tag, restore the AC supply, then lock the cabinet.",
      why: "The tag comes off before the switch goes back on — not after — because a switch restored with the tag still in place tells the next person nothing about whether this crew is actually finished, and a cabinet left unlocked is a live enclosure standing open on a public street.",
      outOfOrderNote: "Tag off, then power on, then lock up — restoring power before the tag is removed leaves a live cabinet still marked as being worked on.",
    },
    {
      id: "stow-half-cell", kind: "drag", target: "reference-electrode",
      title: "Stow the reference electrode",
      cue: "Bring the reference electrode back to its case, wetted, ready for the next reading.",
      why: "The porous plug on this electrode has to stay wetted between readings or it dries out and gives a bad contact the next time it is used — stowed properly, it is ready for the next test station instead of a source of exactly the error this crew just spent the visit avoiding.",
      drag: { to: "electrode-case", radius: 0.4, missNote: "Not back in the case — an electrode left out to dry is the next crew's false reading." },
    },
    {
      id: "compare-to-criteria", kind: "select", target: "criteria-board",
      title: "Compare today's reading to the criteria",
      cue: "Check today's pipe-to-soil reading against the operator's own criteria and the record's trend.",
      why: "A reading that clears the criteria on its own can still be worth a second look if it has been sliding toward the edge of it for three visits running — the comparison is what catches a trend a single number never shows on its own.",
    },
    {
      id: "cp-record-log", kind: "select", target: "cp-log",
      title: "Complete the corrosion-control record",
      cue: "Log today's pipe-to-soil reading, the rectifier output, and the bond check in the survey record.",
      why: "This record is the only proof, months or years from now, that this main's protection was actually checked rather than assumed — a reading that is never written down might as well not have been taken, for all the good it does the next survey.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, UT5_ACCENT);

    // ---------------------------------------------------------------- ground
    const groundTex = surfaceTexture((ctx, w, h) => gravelFace(ctx, w, h, { base: "#6b6a5c", base2: "#5e5d50" }), { repeat: 4, px: 320 });
    const groundPlane = box(g, 5.0, 0.06, 4.2, 0, 0.03, 0, 0xffffff, { rough: 0.95 });
    groundPlane.material = texturedMat(groundTex, { rough: 0.95, metal: 0.02, color: UT5_PAL.ground });

    // The test station post.
    const post = group(g, -0.6, 0, -1.0);
    cyl(post, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x8a8f95, { rough: 0.6, metal: 0.3, seg: 10 });
    box(post, 0.14, 0.18, 0.06, 0, 0.94, 0, 0x2b3138, { rough: 0.6 });
    holoTag(post, "test station", 0, 1.14, 0, { css: UT5_CSS, w: 0.32 });
    const terminal = cyl(post, 0.015, 0.015, 0.04, -0.03, 0.9, 0.035, 0xb8a03a, { rough: 0.4, metal: 0.7, seg: 8 });
    reg(hits, terminal, "loose-wire-connection");
    const corrodedTerm = cyl(post, 0.015, 0.015, 0.04, 0.03, 0.9, 0.035, 0x8a3020, { rough: 0.85, metal: 0.4, seg: 8 });
    reg(hits, corrodedTerm, "corroded-terminal");

    // Buried main beneath, shown as a shallow ghost.
    const mainPipe = cyl(g, 0.1, 0.1, 2.4, -0.6, 0.02, -1.2, 0xf2c14b, { rough: 0.5, metal: 0.3, opacity: 0.5, transparent: true, seg: 14 });
    mainPipe.rotation.z = Math.PI / 2;
    holoTag(g, "protected main", -0.6, 0.3, -1.2, { css: UT5_CSS, w: 0.3 });

    // Reference electrode and its case.
    const electrode = group(g, 1.6, 0, -0.6, 0.3);
    cyl(electrode, 0.045, 0.05, 0.24, 0, 0.12, 0, 0x3a6b3a, { rough: 0.5, metal: 0.2, seg: 14 });
    cyl(electrode, 0.012, 0.012, 0.1, 0, 0.29, 0, 0x2b2f34, { rough: 0.5 });
    holoTag(electrode, "reference electrode", 0, 0.42, 0, { css: "#59c97b", w: 0.4 });
    reg(hits, electrode, "reference-electrode");
    const soilContact = group(post, 0, 0, 0.4);
    hits["soil-contact-point"] = soilContact;
    const wrongContact = box(g, 0.2, 0.2, 0.2, -1.6, 0.3, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just set it on the gravel?", -1.6, 0.55, -0.4, { css: "#d2312b", w: 0.46 });
    reg(hits, wrongContact, "wrong-half-cell-contact");
    const electrodeCase = box(g, 0.2, 0.1, 0.14, 1.9, 0.05, -0.2, 0x2b3138, { rough: 0.6 });
    holoTag(g, "electrode case", 1.9, 0.24, -0.2, { css: "#59c97b", w: 0.32 });
    reg(hits, electrodeCase, "electrode-case");

    // Voltmeter used at the test post.
    const meterBox = group(post, 0.3, 0.5, 0);
    box(meterBox, 0.14, 0.1, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const cpMeter = instrument(meterBox, 0, 0.09, 0.02, { idle: "-- mV", color: 0x2b2f34, w: 0.12, d: 0.02 });
    holoTag(meterBox, "pipe-to-soil meter", 0, 0.24, 0, { css: UT5_CSS, w: 0.4 });
    reg(hits, cpMeter, "cp-voltmeter");

    // The crossing pipeline and its bond wire.
    const foreignLine = cyl(g, 0.06, 0.06, 1.6, 1.4, 0.03, -1.9, 0xd85c9e, { rough: 0.5, metal: 0.3, seg: 14 });
    foreignLine.rotation.z = Math.PI / 2;
    holoTag(g, "foreign line crossing", 1.4, 0.24, -1.9, { css: "#d85c9e", w: 0.44 });
    reg(hits, foreignLine, "foreign-line-crossing");
    const bondWire = cyl(g, 0.01, 0.01, 0.8, 1.1, 0.15, -1.55, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    bondWire.rotation.z = 0.7;
    holoTag(g, "bond wire", 1.1, 0.34, -1.55, { css: UT5_CSS, w: 0.28 });
    reg(hits, bondWire, "bond-wire");
    const continuityTester = group(g, 1.0, 0, -1.3, -0.5);
    box(continuityTester, 0.1, 0.16, 0.05, 0, 0.5, 0, 0x2b3138, { rough: 0.5 });
    holoTag(continuityTester, "continuity tester", 0, 0.68, 0, { css: "#59c97b", w: 0.4 });
    reg(hits, continuityTester, "continuity-tester");

    // The rectifier and its cabinet.
    const rectRig = group(g, 1.9, 0, 1.1, -0.5);
    const rustTex = surfaceTexture((ctx, w, h) => rustFace(ctx, w, h, { base: "#4a4640", base2: "#3c3934" }), { repeat: 1, px: 256 });
    const cabinet = box(rectRig, 0.6, 1.1, 0.4, 0, 0.55, 0, 0xffffff, { rough: 0.6, metal: 0.3 });
    cabinet.material = texturedMat(rustTex, { rough: 0.6, metal: 0.3 });
    const cabinetDoor = box(rectRig, 0.55, 1.0, 0.03, 0, 0.55, 0.2, 0x8a8f95, { rough: 0.55, metal: 0.4 });
    holoTag(rectRig, "rectifier", 0, 1.2, 0, { css: UT5_CSS, w: 0.28 });
    const latch = cyl(rectRig, 0.02, 0.02, 0.06, 0.2, 0.55, 0.22, 0xd8232a, { rough: 0.4, metal: 0.6, seg: 10 });
    reg(hits, latch, "rectifier-cabinet-latch");
    const acSwitch = box(rectRig, 0.08, 0.05, 0.04, -0.15, 0.85, 0.22, 0xd8232a, { rough: 0.5 });
    holoTag(rectRig, "AC supply switch", -0.15, 0.98, 0.22, { css: UT5_CSS, w: 0.36 });
    reg(hits, acSwitch, "rectifier-ac-off");
    hits["rectifier-ac-on"] = acSwitch;
    const rectTagObj = lockTag(rectRig, -0.15, 0.7, 0.24, { color: 0xf2c14b, lines: ["RECTIFIER", "AC OFF"] });
    reg(hits, rectTagObj, "rectifier-ac-tag");
    hits["remove-rectifier-tag"] = rectTagObj;
    const rectMeterInst = instrument(rectRig, 0.15, 0.7, 0.22, { idle: "-- V", color: 0x2b2f34, w: 0.14, d: 0.02 });
    reg(hits, rectMeterInst, "rectifier-meter");
    const cabinetLockObj = torus(rectRig, 0.03, 0.01, 0.25, 0.3, 0.22, 0xd8b23a, { rough: 0.5, metal: 0.6, seg: 8, seg2: 12 });
    reg(hits, cabinetLockObj, "lock-cabinet");
    const unlockedHazard = box(g, 0.2, 0.2, 0.2, 2.2, 0.9, 1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk off, leave it unlocked?", 2.25, 1.15, 1.3, { css: "#d2312b", w: 0.56 });
    reg(hits, unlockedHazard, "leave-cabinet-unlocked");
    void cabinetDoor;

    // Radio and public barrier for the interruptions.
    const radioProp = box(g, 0.09, 0.16, 0.05, -1.9, 0.9, 1.3, 0x1b1e23, { rough: 0.5 });
    holoTag(g, "CP radio", -1.9, 1.14, 1.3, { css: UT5_CSS, w: 0.26 });
    reg(hits, radioProp, "cp-radio");
    const barrierStand = group(g, 2.4, 0, 0.4, -0.3);
    cyl(barrierStand, 0.02, 0.02, 0.5, 0, 0.25, 0, 0x5b4636, { rough: 0.8, seg: 8 });
    box(barrierStand, 0.5, 0.08, 0.02, 0, 0.5, 0, UT5_ACCENT, { rough: 0.6, cast: false });
    holoTag(barrierStand, "public barrier", 0, 0.68, 0, { css: UT5_CSS, w: 0.36 });
    reg(hits, barrierStand, "public-barrier");

    // Boards: record, criteria, log.
    const recordBoard = group(g, -2.2, 0, -1.6, 0.4);
    box(recordBoard, 0.5, 0.7, 0.04, 0, 0.35, 0, UT5_PAL.structure, { rough: 0.7 });
    const recordPanel = decal(recordBoard, 0.44, 0.32, 0, 0.68, 0.03, paperFace("SURVEY RECORD", ["Prior readings on file", "Monitoring interval due", "Trend line attached"], { scale: 0.76 }));
    holoTag(recordBoard, "survey record", 0, 0.9, 0, { css: UT5_CSS, w: 0.36 });
    reg(hits, recordPanel, "cp-record");

    const criteriaBoard = group(g, -2.3, 0, 0.5, 0.5);
    box(criteriaBoard, 0.45, 0.32, 0.03, 0, 0.6, 0, 0x2b3138, { rough: 0.6 });
    decal(criteriaBoard, 0.4, 0.12, 0, 0.66, 0.02, signFace("CP CRITERIA", { bg: "#0a1e28", accent: UT5_CSS, scale: 0.4 }));
    holoTag(criteriaBoard, "operator's criteria", 0, 0.82, 0, { css: UT5_CSS, w: 0.4 });
    reg(hits, criteriaBoard, "criteria-board");

    const logBench = group(g, -2.2, 0, 1.7);
    box(logBench, 0.9, 0.72, 0.5, 0, 0.36, 0, UT5_PAL.structure, { rough: 0.7, metal: 0.2 });
    const logPanel = decal(logBench, 0.3, 0.36, 0, 0.73, 0, paperFace("CP SURVEY LOG", ["Pipe-to-soil ___ mV", "Rectifier output ___ V", "Bond continuity: pass/fail"], { scale: 0.76 }));
    logPanel.rotation.x = -Math.PI / 2;
    holoTag(logBench, "CP log", 0, 0.94, 0, { css: UT5_CSS, w: 0.28 });
    reg(hits, logPanel, "cp-log");

    const skipStray = box(g, 0.2, 0.2, 0.2, 1.4, 0.5, -2.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "sign off, skip the crossing?", 1.45, 0.75, -2.3, { css: "#d2312b", w: 0.5 });
    reg(hits, skipStray, "skip-stray-current-check");
    const skipLoto = box(g, 0.2, 0.2, 0.2, 1.7, 0.5, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just open it now?", 1.75, 0.75, 0.7, { css: "#d2312b", w: 0.38 });
    reg(hits, skipLoto, "skip-rectifier-loto");

    toolChest(g, -2.6, -0.6);
    const techFigure = standingFigure(g, -0.1, -2.1, { ry: 1.4, cloth: 0x2b6f8f, vest: 0xf2c14b });
    void techFigure;
    const passerby = standingFigure(g, 1.9, 2.05, { ry: -2.2, cloth: 0x6a3f7a, atStation: true });

    holoPanel(g, 0.95, 0.6, -2.3, 0, -0.5, (ctx, w, h) => {
      ctx.fillStyle = "#08202e"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = UT5_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e3f2fd"; ctx.fillText("CATHODIC PROTECTION SURVEY", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f4f9fd";
      ["Lock out the rectifier AC before opening it", "Wet the half-cell into the soil", "Check the crossing bond for continuity", "Log every number against the criteria"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.15)));
    }, { ry: 0.5, accent: UT5_ACCENT });

    let watchingOutput = false, radioAlert = false, publicNear = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect-test-station") { corrodedTerm.visible = false; }
        if (step.id === "place-half-cell") { electrode.position.set(-0.6, 0.02, -0.6); }
        if (step.id === "pipe-to-soil-reading") repaint(cpMeter.userData.screen, signFace("880", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "rectifier-output-reading") repaint(rectMeterInst.userData.screen, signFace("14.2", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.45 }));
        if (step.id === "output-watch") watchingOutput = false;
        if (step.id === "stow-half-cell") { electrode.position.set(1.6, 0, -0.6); }
      },
      onInterrupt(it) {
        if (it.id === "scada-current-alert") { radioAlert = true; radioProp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8, rough: 0.4 }); }
        if (it.id === "public-at-cabinet") { publicNear = true; passerby.position.set(1.6, 0, 1.95); passerby.rotation.y = -0.7; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "scada-current-alert") { radioAlert = false; radioProp.material = mat(0x1b1e23, { rough: 0.5 }); }
        if (it.id === "public-at-cabinet") { publicNear = false; passerby.position.set(1.9, 0, 2.05); passerby.rotation.y = -2.2; }
      },
      onHazard() {},
      animate(t, dt, session) {
        if (session?.step?.id === "output-watch") watchingOutput = true;
        if (watchingOutput) repaint(rectMeterInst.userData.screen, signFace(`${(14 + Math.sin(t * 1.5) * 0.6).toFixed(1)}`, { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.45 }));
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          const step = session?.step;
          if (step?.id === "pipe-to-soil-reading") repaint(cpMeter.userData.screen, signFace(`${Math.round(gg.t * 1200)}`, { bg: "#0d1c24", accent: gg.t > 0.55 && gg.t < 0.78 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
          if (step?.id === "rectifier-output-reading") repaint(rectMeterInst.userData.screen, signFace(`${(gg.t * 20).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t > 0.45 && gg.t < 0.68 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.45 }));
        }
        if (session?.turn && session.step?.id === "open-rectifier-access") latch.rotation.z = session.turn.amount * Math.PI * 2;
        void dt; void publicNear;
      },
    };
  },
};
