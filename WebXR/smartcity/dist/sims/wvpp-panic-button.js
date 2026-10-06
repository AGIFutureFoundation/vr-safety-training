import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace,
  seatedFigure, standingPerson, mat, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ WVPP & Panic Button VR — Culinary & Hospitality, bartending
// series. California's workplace violence prevention standard (8 CCR §3342,
// enacted by SB 553) applied to the one room in the building where a cut-off
// patron, last call and a lone closer's walk to the parking lot all meet: the
// written plan posted, the panic button proven rather than assumed, the
// violent-incident log kept honestly, the hazard walk that finds the blind
// corner and the dark smoking area before a shift finds them the hard way,
// and reporting that costs the person who reports nothing.

const WVPP_ACCENT = 0xf0645b;

export const SIM_WVPP_PANIC_BUTTON = {
  id: "wvpp-panic-button",
  index: "144",
  domain: "Hospitality",
  trade: "Bartender — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "Cal/OSHA's workplace violence prevention standard, 8 CCR §3342 (SB 553) — the written plan, hazard identification and correction, training, a violent-incident log and reporting without retaliation; Cal/OSHA's Injury and Illness Prevention Program, 8 CCR §3203; the UNITE HERE Local 2 contract's safety-committee language; Labor Code §6310 protection against retaliation for reporting a hazard; the ABC's RBS (Responsible Beverage Service) certification every alcohol server in California, this bartender included, is required to hold and keep current",
  name: "WVPP & Panic Button",
  title: simTitle("WVPP & Panic Button"),
  tagline: "The workplace violence prevention plan proven, not filed: the panic button tested, the hazard walk run, the log kept honest, and nobody closing alone unescorted",
  accent: WVPP_ACCENT,
  accentCss: "#f0645b",
  parSeconds: 300,
  footprint: 2.2,
  badge: { id: "plan-proven", name: "Plan Proven", note: "The whole workplace violence prevention plan run clean — posted, tested, walked and logged" },

  game: system({
    name: "Floor Watch",
    currency: "WATCH",
    ranks: ["New to the Floor", "Hazard Spotter", "Button Certified", "Safety Committee", "Floor Watch Certified"],
    badges: [
      { id: "four-named", name: "Four Named", note: "All four types of workplace violence named clean", test: AWARD.stepClean("four-types") },
      { id: "no-shrug", name: "No Shrug", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "clean-drill", name: "Clean Drill", note: "Response-time drill scored inside the target band", test: AWARD.precise(0.75) },
    ],
    challenges: [
      { id: "clean-plan", name: "Clean Plan", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "fast-walk", name: "Fast Walk", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
      { id: "six-straight", name: "Six Straight", note: "Six correct actions in a row", test: AWARD.streak(6) },
    ],
  }),

  hazards: {
    "ignore-alarm": "That switch silences the panic alarm at the panel instead of sounding it. A control built to make an alarm quieter defeats the entire reason 8 CCR §3342 requires an actual means to summon help — the alarm is supposed to be heard, not managed down to nothing.",
    "confront-alone": "You went out the staff gate alone to handle it yourself. The plan exists precisely so nobody has to make that call solo — the panic button, not a solo confrontation in the parking lot, is the response the standard was written around.",
    "blank-log-entry": "That page in the violent-incident log is pre-checked 'no incidents' for a shift that has not happened yet. §3342 requires every incident logged with what happened and when — a book filled in ahead of time is not a record, it is a document built to look clean during an inspection.",
    "retaliation-note": "That note tells staff reporting an incident 'just causes problems.' Labor Code §6310 and the plan's own reporting procedure both exist to protect the person who reports a hazard or an incident — a note like that is retaliation before anyone has even reported anything.",
  },

  lateNotes: {
    "floodlight": "The hazard walk finds the dark fixture first — fixing a light nobody has identified yet is fixing the wrong thing.",
    "panic-button": "The button gets tested on its own step, on its own terms — treat the interruption as the alarm it actually is when it comes.",
  },

  steps: [
    {
      id: "read-plan", kind: "select", target: "wvpp-poster",
      title: "Read the posted workplace violence prevention plan",
      cue: "Read the plan where it is posted at the start of your shift.",
      why: "8 CCR §3342 requires the written plan to be posted and accessible to every employee, not filed in a binder in the office — a plan nobody on the floor has actually read protects nobody the night it is needed.",
    },
    {
      id: "four-types", kind: "sequence", anyOrder: true,
      targets: ["type-criminal", "type-customer", "type-coworker", "type-relationship"],
      itemNames: {
        "type-criminal": "Type 1 — criminal intent, no legitimate business with the bar",
        "type-customer": "Type 2 — a customer or patron being served",
        "type-coworker": "Type 3 — worker-on-worker",
        "type-relationship": "Type 4 — a personal relationship following someone to work",
      },
      title: "Name the four types of workplace violence the plan covers",
      cue: "Tag all four categories on the board — the plan is not only about an angry patron.",
      why: "Cal/OSHA's model plan sorts workplace violence into four types — a stranger with no business there, a customer being served, one coworker against another, and a personal relationship that follows someone through the door — and the right response is different for each one.",
    },
    {
      id: "hazard-walk", kind: "find", noHint: true,
      targets: ["blind-corner", "smoking-light", "closer-route"],
      itemNames: { "blind-corner": "a blind corner by the storeroom", "smoking-light": "a dead light over the smoking area", "closer-route": "an unmarked closer's route to the car" },
      itemNotes: {
        "blind-corner": "A corner nobody can see around before stepping into it is exactly the kind of physical hazard §3342 requires the walk to find and fix, the same as a wet floor or a bad lock.",
        "smoking-light": "A dark smoking area is where a shift's last confrontation of the night is likeliest to happen unseen — light is a control, not decoration.",
        "closer-route": "A closer walking to their car by whatever path is dark and short is walking the hazard the plan is supposed to have already routed around.",
      },
      title: "Walk the building for what the plan calls a hazard",
      cue: "Three physical hazards are sitting in this building. Find them before the shift starts.",
      why: "§3342 requires periodic inspections that actually look for the physical conditions violence happens around — blind corners, bad lighting, unmarked routes — not just a review of the paperwork that describes the building.",
    },
    {
      id: "correct-hazard", kind: "drag", target: "floodlight",
      title: "Mount the replacement floodlight over the smoking area",
      cue: "Carry the floodlight up to the dead fixture the walk just found.",
      why: "Finding a hazard and writing it down is half of what the standard requires — the other half is correcting it, and a lit smoking area is the correction that actually changes what happens out there at 1 a.m., not just the paperwork about it.",
      drag: { to: "smoking-mount", radius: 0.4, missNote: "Not seated in the fixture — line the floodlight up with the dead mount before letting go." },
    },
    {
      id: "test-button", kind: "hold", target: "panic-button", seconds: 4,
      title: "Test the panic button",
      cue: "Press and hold the panic button until the panel confirms the signal reached dispatch.",
      why: "A panic button nobody has tested is a guess about whether help is one press away. Confirming the signal actually reaches the monitoring service, on a schedule, is what makes it a control instead of a decoration under the bar.",
      holdBreakNote: "You let go before the panel confirmed anything. A short press proves nothing either way — hold it through to the confirmation.",
    },
    {
      id: "drill-timing", kind: "gauge", target: "drill-stopwatch",
      title: "Time the response drill",
      cue: "Watch the sweep and commit the instant it lands inside the drill's target band.",
      why: "The plan's training requirement is not satisfied by handing someone a page to read — a timed walkthrough drill is what actually tells you whether the response the plan describes happens fast enough to matter.",
      gauge: { label: "RESPONSE s", speed: 0.65, green: [0.3, 0.42], readout: (t) => `${(t * 20).toFixed(1)}s`, missNote: "Outside the drill's target band. Reset and commit only when the sweep lands inside it." },
    },
    {
      id: "lock-gate", kind: "turn", target: "staff-gate-lock",
      title: "Secure the staff-side gate",
      cue: "Turn the deadbolt through a full turn to lock the gate behind you.",
      why: "The staff-side gate is the one exit a hazard walk keeps coming back to — locked, it is a controlled chokepoint; propped or unlatched, it is the same opening the plan just spent two steps trying to make safer.",
      turn: { turns: 1, axis: "y", label: "GATE LOCK" },
    },
    {
      id: "training-record", kind: "select", target: "training-binder",
      title: "Sign the training record",
      cue: "Confirm and sign that tonight's training on the plan actually happened.",
      why: "§3342 requires documented training on the plan, the hazards specific to this workplace, and how to use the panic button and the log — a signed record is what an inspector, and the next new hire's trainer, both actually rely on. It sits in the same binder as this bartender's ABC-issued RBS card, because both are proof a required certification actually happened rather than something assumed about the person pouring drinks.",
    },
    {
      id: "escort-policy", kind: "select", target: "escort-sign",
      title: "Call for an escort before closing alone",
      cue: "Use the posted escort line rather than walking to the car by yourself.",
      why: "The hazard walk already flagged the unlit route to the car — the plan's answer to a lone closer is an escort on request, not bravery, and posting the line where the last person out actually sees it is what makes that answer usable.",
    },
    {
      id: "log-review", kind: "hold", target: "incident-log-book", seconds: 5,
      title: "Review last month's violent-incident log",
      cue: "Hold the book open and read through the entries before the safety-committee meeting.",
      why: "The violent-incident log is what the plan's own safety review runs on — entries with what happened, when, and what changed afterward are what tell a committee whether last month's fix actually worked or just felt like it did.",
      holdBreakNote: "You closed the book before finishing the review. A log skimmed is a log the committee is trusting you read — hold it open through the full review.",
    },
    {
      id: "report-no-retaliation", kind: "select", target: "reporting-line",
      title: "Point a shaken coworker to the reporting line",
      cue: "Show them the posted line for reporting an incident, and that using it is protected.",
      why: "Labor Code §6310 protects anyone who reports a hazard or an incident from retaliation for reporting it — a coworker who does not know that line exists, or does not believe it is safe to use, is a plan that only works on paper.",
    },
    {
      id: "post-incident-support", kind: "select", target: "eap-poster",
      title: "Offer the post-incident support line",
      cue: "Point to the posted employee assistance line after a frightening shift.",
      why: "§3342's plan does not end when the incident is over — support afterward, named and posted rather than assumed, is what keeps one bad night from becoming the reason somebody quietly stops coming to work.",
    },
    {
      id: "sign-plan", kind: "select", target: "acknowledgment-sheet",
      title: "Sign tonight's acknowledgment sheet",
      cue: "Sign that the plan, the button and the log were all reviewed this shift.",
      why: "A signed acknowledgment is the same kind of record the tip-out sheet and the training binder are — proof, the next time anyone asks, that the plan was a real part of tonight's shift and not just a poster on the wall.",
    },
  ],

  interrupts: [
    {
      id: "button-test-fail",
      kind: "Equipment fault",
      after: "test-button", delay: 2, seconds: 12,
      alert: "The panel's confirmation light stays red — dispatch never got the signal — and Danny behind the well just shrugs: 'eh, it's always a little glitchy.'",
      cue: "Log the failed test and escalate it. A shrug is not a fix.",
      target: "escalation-log",
      why: "A panic button that fails its own test is not a minor annoyance to work around, it is the one control the plan's whole worst-case response depends on — logging the fault and escalating it is what gets it actually repaired before the night it is needed for real.",
      missNote: "The failed test went unlogged and unescalated. A button that does not work is now the plan's whole answer to a real emergency, and nobody but you knows it.",
      wrongNote: "Not the button again — pressing it harder does not fix a signal that never reached dispatch. Log the fault and escalate it.",
    },
    {
      id: "customer-blocks-gate",
      kind: "Customer refusing to leave",
      after: "log-review", delay: 3, seconds: 12,
      alert: "The patron you cut off twenty minutes ago is back, refusing to leave, and has planted himself in the staff-side gate — the only way out to the lot.",
      cue: "Hit the panic button. Do not go around him yourself.",
      target: "panic-button",
      why: "A patron blocking the one exit and refusing to leave is exactly the Type 2 scenario the plan trains for — the panic button brings help to a chokepoint you cannot safely get past on your own, which is the entire reason it sits within reach of the bar.",
      missNote: "He stayed planted in the gate the whole time with nobody alerted. A blocked exit that nobody outside the room knows about is the plan's worst-case scenario, sitting there unanswered.",
      wrongNote: "That does not move him. The panic button is the response — it brings help to the chokepoint instead of you trying to talk or squeeze your way past him.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, WVPP_ACCENT);

    // -------------------------------------------------------------- entrance
    const posterPanel = holoPanel(g, 0.6, 0.44, -1.2, 1.7, 3.5, (cx, w, h) => {
      cx.fillStyle = "rgba(20,4,4,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0645b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffe3de";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("WORKPLACE VIOLENCE", w * 0.06, h * 0.14);
      cx.fillText("PREVENTION PLAN", w * 0.06, h * 0.28);
      cx.fillStyle = "#f4c2ba";
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`;
      ["8 CCR §3342 — posted per SB 553", "Panic button under the well",
        "Log, report and post-incident support inside"].forEach((line, i) =>
        cx.fillText(line, w * 0.06, h * 0.46 + i * h * 0.13));
    }, { ry: 0.3 });
    reg(hits, posterPanel, "wvpp-poster");

    // Four-types board.
    const typesBoard = group(g, -1.9, 1.5, 3.15, 0.3);
    box(typesBoard, 0.78, 0.5, 0.03, 0, 0, 0, 0x2b211c, { rough: 0.85, finish: "concrete", tile: [2, 2] });
    const TYPES = [
      ["type-criminal", "TYPE 1", -0.24, 0.14], ["type-customer", "TYPE 2", 0.24, 0.14],
      ["type-coworker", "TYPE 3", -0.24, -0.14], ["type-relationship", "TYPE 4", 0.24, -0.14],
    ];
    for (const [id, label, x, y] of TYPES) {
      const tag = decal(typesBoard, 0.3, 0.2, x, y, 0.02, signFace(label, { bg: "#1b100c", accent: "#f0645b", scale: 0.5 }), { px: 160 });
      reg(hits, tag, id);
    }

    // ----------------------------------------------------------- staff gate
    const gate = group(g, -3.2, 0, -1.0, 0.6);
    box(gate, 0.06, 2.0, 1.1, -0.53, 1.0, 0, 0x3a4148, { rough: 0.6, metal: 0.3 });
    const gateDoor = box(gate, 0.05, 1.9, 1.0, 0, 0.98, 0, 0x4a545c, { rough: 0.5, metal: 0.4 });
    void gateDoor;
    const lockBolt = cyl(gate, 0.03, 0.03, 0.1, 0.35, 1.1, 0, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 12 });
    lockBolt.rotation.x = Math.PI / 2;
    holoTag(gate, "Staff gate lock", 0.35, 1.28, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, lockBolt, "staff-gate-lock");
    // Confronting the trouble alone, straight out the same gate.
    const goAloneSign = decal(gate, 0.24, 0.14, -0.53, 0.5, 0.06,
      signFace("HANDLE IT YOURSELF?", { bg: "#2a1416", accent: "#f0645b", scale: 0.36 }), { px: 160 });
    reg(hits, goAloneSign, "confront-alone");

    // The blocking customer, staged off to the side until the interrupt fires.
    const blocker = standingFigure(g, -3.55, -1.0, { ry: 1.7, cloth: 0x5a4a3a, atStation: true, skin: 0xc7a17e });
    blocker.visible = false;

    // ----------------------------------------------------------------- bar
    const panicPanel = group(g, -2.6, 1.05, -2.1);
    box(panicPanel, 0.16, 0.1, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const buttonCap = cyl(panicPanel, 0.035, 0.035, 0.02, 0, 0.03, 0.03, 0xd8232a, { rough: 0.4, metal: 0.2, seg: 16 });
    holoTag(panicPanel, "Panic button", 0, 0.14, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, buttonCap, "panic-button");
    const testLight = decal(panicPanel, 0.09, 0.03, 0, -0.04, 0.026, signFace("TEST", { bg: "#0d1c24", accent: "#59c97b", scale: 0.6 }), { glow: true, ei: 0.7 });
    const silenceSwitch = box(panicPanel, 0.03, 0.015, 0.02, 0.07, -0.02, 0.03, 0x8b929a, { rough: 0.5, metal: 0.5 });
    reg(hits, silenceSwitch, "ignore-alarm");

    const stopwatch = instrument(g, -2.2, 1.05, -2.1, { idle: "--.-s", color: WVPP_ACCENT, w: 0.11, d: 0.16 });
    holoTag(stopwatch, "Drill timer", 0, 0.17, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, stopwatch, "drill-stopwatch");

    const escalationBoard = decal(g, 0.24, 0.16, -1.95, 1.35, -2.02,
      paperFace("FAULT LOG", ["Panic button — no dispatch ACK", "Escalate to service"], { bg: "#f2efe6", band: "#22303c" }), { px: 160 });
    reg(hits, escalationBoard, "escalation-log");

    // Bar stools and ambient customers.
    for (const x of [0.3, 1.2]) {
      const stool = group(g, x, 0, -1.15);
      cyl(stool, 0.16, 0.16, 0.05, 0, 0.62, 0, 0x3c2c22, { rough: 0.6, seg: 14 });
      cyl(stool, 0.03, 0.03, 0.6, 0, 0.31, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
      cyl(stool, 0.17, 0.17, 0.03, 0, 0.02, 0, 0x2b3138, { rough: 0.5, seg: 14 });
    }
    seatedFigure(g, 0.3, 0.66, -1.05, { cloth: 0x4a5f6b, ry: Math.PI });
    seatedFigure(g, 1.2, 0.66, -1.05, { cloth: 0x6b5a4a, ry: Math.PI });

    // Danny, the colleague who shrugs off the failed test.
    const danny = standingPerson(g, -1.2, -2.5, { cloth: 0x37505f, legs: 0x2f3740, hiVis: false, skin: 0xb98868 });

    // ---------------------------------------------------------- hazard walk
    const corner = group(g, 3.4, 0, -0.6);
    box(corner, 0.1, 2.0, 1.4, 0, 1.0, 0, 0x2b2822, { rough: 0.8 });
    holoTag(corner, "Blind corner", 0, 2.1, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, corner, "blind-corner");

    const smokeArea = group(g, 3.4, 0, 2.3);
    slab(smokeArea, 1.1, 0.05, 1.1, 0, 0.025, 0, 0x4a463c, { rough: 0.9, finish: "concrete", tile: [2, 2] });
    const smokePost = cyl(smokeArea, 0.03, 0.03, 1.9, 0.45, 0.95, 0.4, 0x3a4148, { rough: 0.6, metal: 0.3, seg: 10 });
    void smokePost;
    const deadFixture = box(smokeArea, 0.14, 0.05, 0.14, 0.45, 1.9, 0.4, 0x1c1f24, { rough: 0.7, metal: 0.4 });
    holoTag(smokeArea, "Dead fixture", 0.45, 2.0, 0.4, { css: "#f0645b", w: 0.32 });
    reg(hits, deadFixture, "smoking-light");
    const mountSocket = group(smokeArea, 0.45, 1.9, 0.4);
    ball(mountSocket, 0.005, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["smoking-mount"] = mountSocket;

    const floodlight = group(g, 3.4, 0, 1.55);
    box(floodlight, 0.14, 0.08, 0.1, 0, 0.5, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    ball(floodlight, 0.03, 0, 0.5, 0.06, 0xfff6dc, { emissive: 0xfff6dc, ei: 1.4, seg: 10 });
    holoTag(floodlight, "Replacement floodlight", 0, 0.6, 0, { css: "#f2c14b", w: 0.36 });
    reg(hits, floodlight, "floodlight");

    const routeMark = group(g, 3.7, 0, 3.6);
    box(routeMark, 0.7, 0.006, 0.16, 0, 0.004, 0, 0xf2c14b, { rough: 0.7, emissive: 0xf2c14b, ei: 0.4, cast: false });
    holoTag(routeMark, "Unmarked route to the car", 0, 0.14, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, routeMark, "closer-route");
    const escortSign = decal(g, 0.28, 0.18, 4.0, 1.4, 3.6,
      signFace("ESCORT ON REQUEST", { bg: "#22303c", accent: "#59c97b", scale: 0.4 }), { px: 200 });
    reg(hits, escortSign, "escort-sign");

    // -------------------------------------------------------------- office
    cabinet(g, 0.9, 1.1, 0.4, 4.1, 0.55, 1.3, 0x2f2a24, { doorColor: 0x241f1a });
    const logBook = group(g, 3.7, 0.85, 1.0, -0.4);
    box(logBook, 0.3, 0.03, 0.22, 0, 0, 0, 0xece3d0, { rough: 0.7 });
    decal(logBook, 0.26, 0.05, 0, 0.017, 0.03, signFace("INCIDENT LOG", { bg: "#22303c", accent: "#f0645b", scale: 0.4 }), { px: 128 });
    holoTag(logBook, "Violent-incident log", 0, 0.1, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, logBook, "incident-log-book");
    const blankCheckbox = decal(logBook, 0.1, 0.03, 0.08, 0.02, 0.09, signFace("NO INCIDENTS ✓", { bg: "#2a1416", accent: "#f0645b", scale: 0.4 }), { px: 96 });
    reg(hits, blankCheckbox, "blank-log-entry");

    const trainingBinder = group(g, 3.9, 0.85, 1.6, -0.4);
    box(trainingBinder, 0.1, 0.28, 0.22, 0, 0.14, 0, 0x3a4a8a, { rough: 0.6 });
    holoTag(trainingBinder, "Training record", 0, 0.32, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, trainingBinder, "training-binder");

    const reportingLine = decal(g, 0.3, 0.18, 3.55, 1.3, 1.55,
      signFace("REPORT — NO RETALIATION", { bg: "#22303c", accent: "#59c97b", scale: 0.34 }), { px: 220, ry: -0.4 });
    reportingLine.rotation.y = -0.4;
    reg(hits, reportingLine, "reporting-line");
    const retaliationNote = decal(g, 0.2, 0.1, 3.3, 1.05, 1.35,
      paperFace("NOTE", ["Reporting just", "causes problems."], { bg: "#f4e9d8", band: "#b81410" }), { px: 128, ry: -0.4 });
    retaliationNote.rotation.y = -0.4;
    reg(hits, retaliationNote, "retaliation-note");

    const eapPoster = decal(g, 0.28, 0.18, 4.15, 1.55, 2.1,
      signFace("EMPLOYEE ASSISTANCE LINE", { bg: "#22303c", accent: "#7fd1c9", scale: 0.32 }), { px: 220 });
    reg(hits, eapPoster, "eap-poster");

    const ackSheet = decal(g, 0.24, 0.16, 4.3, 0.95, 2.6,
      paperFace("SHIFT ACKNOWLEDGMENT", ["Plan reviewed", "Button tested · Log reviewed"], { bg: "#f2efe6", band: "#22303c" }), { px: 200 });
    reg(hits, ackSheet, "acknowledgment-sheet");

    standingFigure(g, -4.6, 3.0, { ry: 0.5, cloth: 0x37505f, vest: WVPP_ACCENT });

    let dannyShrug = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(-1, 1.3, -1),

      onStepComplete(step) {
        if (step.id === "correct-hazard") {
          deadFixture.material = mat(0xfff6dc, { emissive: 0xfff6dc, ei: 1.5, rough: 0.4 });
          floodlight.position.set(3.85, 1.4, 2.7);
        }
        if (step.id === "test-button") { repaint(testLight, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", scale: 0.6 })); }
        if (step.id === "lock-gate") { lockBolt.position.x = 0.1; }
      },

      onInterrupt(it) {
        if (it.id === "button-test-fail") {
          repaint(testLight, signFace("NO ACK", { bg: "#2a1416", accent: "#f0645b", scale: 0.4 }));
          dannyShrug = true;
          danny.arms[0].shoulder.rotation.z = 0.9;
          danny.arms[1].shoulder.rotation.z = -0.9;
        }
        if (it.id === "customer-blocks-gate") {
          blocker.visible = true;
          blocker.position.set(-3.2, 0, -1.0);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "button-test-fail") {
          dannyShrug = false;
          danny.arms[0].shoulder.rotation.z = 0;
          danny.arms[1].shoulder.rotation.z = 0;
          repaint(escalationBoard, paperFace("FAULT LOG", ["Panic button — no dispatch ACK", "Escalated — service called"], { bg: "#f2efe6", band: "#22303c" }));
        }
        if (it.id === "customer-blocks-gate") {
          blocker.position.set(-3.55, 0, -1.6);
          blocker.visible = false;
        }
      },

      onHazard(hitId) {
        if (hitId === "confront-alone") gateDoor.rotation.y = -0.6;
      },

      animate(t) {
        if (dannyShrug) danny.arms[0].fore.rotation.z = Math.sin(t * 3) * 0.1;
        void buttonCap;
      },
    };
  },
};
