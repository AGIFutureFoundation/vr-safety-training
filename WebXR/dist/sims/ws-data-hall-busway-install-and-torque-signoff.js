import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, lockTag, reg,
  surfaceTexture, texturedMat, pavingFace, palette,
} from "../citykit.js";
import { scissorLift } from "../../../shared/equipment.js";
import { torqueWrench, multimeter, radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Data-Hall Busway Install & Torque Sign-Off VR — Connectivity
// & Telecom, IBEW inside wireman.
//
// Overhead busway feeds a data hall's racks through tap-off boxes, and a
// busway joint is only as good as the torque on its bolt and the record that
// says so. The run is isolated upstream and proven dead before anyone is on
// the lift; the section is hung, the joint inspected and torqued with a
// calibrated wrench to the manufacturer's value, marked, tested for
// insulation resistance and signed off. Sited generically: no torque,
// voltage or rating is stated — each is the manufacturer's instructions and
// the work order's.

const WS5_ACCENT = 0x4fb3a6;
const WS5_CSS = "#4fb3a6";
const WS5_PAL = palette("warehouse");

export const SIM_WS_DATA_HALL_BUSWAY_INSTALL_AND_TORQUE_SIGNOFF = {
  id: "ws-data-hall-busway-install-and-torque-signoff",
  index: "ws-05",
  domain: "Connectivity",
  trade: "IBEW inside wireman",
  category: "Connectivity & Telecom",
  district: "data-center-build",
  weather: "overcast",
  certification: "IBEW/NECA JATC inside-wireman training as a body; NFPA 70 (NEC) for the busway installation; NFPA 70E and 29 CFR 1910.333 for the electrically safe work condition; 29 CFR 1910.147 for the lockout; NETA acceptance testing practice for the torque verification and the insulation-resistance test; the busway manufacturer's installation instructions for every torque value and test voltage",
  name: "Data-Hall Busway Install & Torque Sign-Off",
  title: simTitle("Data-Hall Busway Install & Torque Sign-Off"),
  tagline: "The run isolated upstream and proven dead before the lift goes up, the section hung and its joint inspected, torqued with a calibrated wrench to the manufacturer's value, marked, tested and signed",
  accent: WS5_ACCENT,
  accentCss: WS5_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "torqued-and-signed", name: "Torqued & Signed", note: "Every joint torqued with a calibrated wrench, marked, insulation-tested and signed before the run was handed over" },

  game: system({
    name: "Busway Authority",
    currency: "JOINTS",
    ranks: ["Apprentice", "Wireman", "Inside Wireman", "Foreman", "Busway Authority Certified"],
    badges: [
      { id: "dead-first", name: "Dead First", note: "The run was proven dead before anyone was on the lift", test: AWARD.stepClean("absence-test") },
      { id: "no-feel-torque", name: "No Torque by Feel", note: "No unsafe action was recorded", test: AWARD.safe },
      { id: "steady-megger", name: "Steady Megger", note: "Held the insulation test steady", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections from the drawings to the sign-off", test: AWARD.clean },
      { id: "unbroken-test", name: "Unbroken Test", note: "The insulation test ran without a break", test: AWARD.unbroken },
      { id: "brisk-install", name: "Brisk Install", note: "Hung, torqued and signed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "work-energized-busway": "You went to open the joint cover with the run still fed from upstream. A busway carries the hall's load in bare bars inside that housing, and a joint opened live is an arc-flash source at arm's length on a lift with nowhere to step back to.",
    "torque-by-feel": "You went to run the joint bolt up with an impact gun and call it tight. A busway joint's bolt is torqued to the manufacturer's value with a calibrated wrench because under-torque overheats the joint and over-torque cracks the insulators — neither shows by feel.",
    "lift-gate-open": "You went to raise the lift with its entry gate open. The guardrails are the fall protection on a scissor lift, and an open gate is a missing section of guardrail at the height of the busway.",
    "climb-lift-rails": "You went to stand on the lift's mid-rail to reach the hanger. Standing on the rail puts your centre of gravity above the guardrail that was meant to stop you, which turns the lift's fall protection into a lever.",
  },

  lateNotes: {
    "joint-bolt": "The joint bolt is torqued only after the joint has been inspected clean and the section is hung on both hangers.",
    "busway-section": "The section is hung once the lift is up and the run is proven dead — not handed up to a lift still moving.",
  },

  faults: [
    {
      id: "torque-mark-missing",
      label: "Torque mark missing",
      note: "One joint bolt on the run carries no torque mark and the sign-off sheet has a blank against it. That joint is re-torqued with the calibrated wrench and marked before anyone signs.",
      step: "torque-marks",
      change: {
        target: "unmarked-joint",
        title: "Re-torque the unmarked joint",
        cue: "One joint has no torque mark — re-torque it with the calibrated wrench and mark it before the sheet is signed.",
        why: "A torque mark is the only field evidence that a bolt was taken to its value with a calibrated wrench; a joint without one is a joint nobody can vouch for, and the sign-off is a statement about every joint on the run, not most of them. Re-torquing it now costs minutes; a loose joint in a live hall costs a hot spot and an outage.",
      },
    },
  ],

  interrupts: [
    {
      id: "pallet-under-lift",
      kind: "A pallet jack is pushed under the raised lift",
      after: "lift-raise", delay: 3, seconds: 11,
      alert: "A labourer is pushing a pallet jack of cable reels straight under the raised lift's platform.",
      cue: "Sound the lift horn and stop them before they are under you.",
      target: "lift-horn",
      why: "Everything used on a raised platform can fall from it, and a person under the lift is also in the path of the platform if it comes down; the horn is the fastest way to stop someone who has not looked up.",
      missNote: "The pallet jack went under the lift with nobody stopping it, putting a person right where anything dropped from the platform lands.",
      wrongNote: "It is the lift horn. The raise is done; the person underneath is the new hazard.",
    },
    {
      id: "adjacent-energize",
      kind: "The commissioning agent calls about the next run",
      after: "megger-test", delay: 3, seconds: 12,
      alert: "The commissioning agent is calling — the adjacent busway run is about to be energised for testing.",
      cue: "Answer on the site radio and confirm where your crew and your lockout are.",
      target: "site-radio",
      why: "Energising the run next to yours changes what is live within reach of the lift, and it is the kind of change that has to be agreed between the crews before it happens; a call answered now confirms your lock is on the right breaker and your crew is clear.",
      missNote: "The call went unanswered while the next run was energised beside the crew, with nobody confirming whose lock was on which breaker.",
      wrongNote: "It is the site radio. The insulation test is on your run; the call is about the one next to it.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your IBEW steward if you are not sure how to reach it",

  steps: [
    {
      id: "drawings", kind: "select", target: "busway-drawings",
      title: "Read the drawings and the installation instructions",
      cue: "Read the busway drawings and the manufacturer's instructions: the run, the joint torque and the test called for.",
      why: "The torque value, the joint sequence and the test voltage all belong to this manufacturer's product, and they live in its instructions; working from another product's numbers is how a joint ends up under- or over-torqued with a clean conscience.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["upstream-breaker", "busway-lock", "busway-tag"],
      itemNames: { "upstream-breaker": "upstream breaker opened", "busway-lock": "personal lock applied", "busway-tag": "tag filled in and hung" },
      title: "Isolate the run upstream",
      cue: "Open the upstream breaker that feeds the run, apply your lock, then hang your tag.",
      why: "The busway is fed from a switchboard in another room, so the only protection for the crew on the lift is a lock on that breaker they hold themselves; the tag tells whoever is at the switchboard which run is being worked and by whom.",
      outOfOrderNote: "Breaker open, then lock, then tag — a tag on a closed breaker protects nobody.",
    },
    {
      id: "absence-test", kind: "gauge", target: "absence-tester",
      title: "Prove the run dead",
      cue: "Prove the tester on a known source, test the bars at the open end, then prove the tester again — commit when it reads absent.",
      why: "The drawings can name the wrong breaker and a switchboard can be mislabelled; the test on the bars themselves, with a tester proven before and after, is what makes this run an electrically safe work condition rather than a hopeful one.",
      gauge: { label: "ABSENCE OF VOLTAGE", speed: 0.55, green: [0.2, 0.45], readout: (t) => (t > 0.45 ? "PRESENT — stop" : "absent on all bars"), missNote: "That is not an absent reading — nobody goes up to this run until the source is found." },
    },
    {
      id: "lift-preuse", kind: "sequence",
      targets: ["lift-guardrails", "lift-controls-test"],
      itemNames: { "lift-guardrails": "guardrails and pins checked", "lift-controls-test": "ground and platform controls tested" },
      title: "Pre-use the scissor lift",
      cue: "Check the guardrails and their pins, then test the ground and platform controls, emergency lowering included.",
      why: "The guardrails are the fall protection on a scissor lift and the controls are how it comes down if something goes wrong; both are proven on the floor, where a loose pin or a dead emergency-lowering valve is a tag-out rather than a rescue.",
      outOfOrderNote: "Guardrails, then controls — the rails are what you stand inside while you test the platform controls.",
    },
    {
      id: "gate-closed", kind: "select", target: "lift-gate",
      title: "Close the lift gate",
      cue: "Step in and close the lift's entry gate behind you.",
      why: "The entry gate is a section of the guardrail, and it only protects when it is shut; closing it before the platform moves is the habit that keeps it from being open at height.",
    },
    {
      id: "lift-raise", kind: "hold", target: "lift-platform-controls", seconds: 5,
      title: "Raise the lift to the busway",
      cue: "Hold the raise control and bring the platform up steadily below the hangers, watching overhead.",
      why: "A scissor lift raised smoothly, with an eye overhead, stops short of trays, sprinkler pipe and the busway itself; raised in bursts while looking down at the controls, it pins a hand or a head against the ceiling services.",
      holdBreakNote: "The raise stopped short — bring the platform up steadily to working height.",
    },
    {
      id: "hang-section", kind: "drag", target: "busway-section",
      title: "Hang the busway section",
      cue: "Bring the section to its hangers and seat it on both before letting go.",
      why: "A busway section is heavy and long, and seated on one hanger it pivots; seating both ends before releasing it keeps the weight on the hangers and off the joint that has not been made yet.",
      drag: { to: "hanger-point", radius: 0.5, missNote: "The section is not on its hangers — both ends go on before you let go." },
    },
    {
      id: "inspect-joint", kind: "find", noHint: true,
      targets: ["cracked-insulator", "debris-in-joint"],
      itemNames: { "cracked-insulator": "a cracked joint insulator", "debris-in-joint": "debris between the joint plates" },
      itemNotes: {
        "cracked-insulator": "The insulator between the bars is cracked — under load the bars can close up and track across it. The joint pack is replaced, not torqued over.",
        "debris-in-joint": "There is drilling swarf between the plates — a joint made up over debris has less contact area and runs hot under load.",
      },
      title: "Inspect the joint before it is made",
      cue: "Look into the joint before it is closed and find what has to be put right.",
      why: "A joint made up over a cracked insulator or a flake of swarf looks exactly like a good one once the cover is on, and both fail under load as heat. The only chance to see them is before the bolt is torqued.",
    },
    {
      id: "torque-joint", kind: "turn", target: "joint-bolt",
      title: "Torque the joint bolt",
      cue: "Turn the calibrated torque wrench on the joint bolt until it clicks at the manufacturer's value.",
      why: "The joint bolt sets the pressure between the bars, and the manufacturer's value is the pressure that carries the rated current without overheating or cracking the insulators; a calibrated wrench is the only tool that knows when it has got there.",
      turn: { turns: 0.6, axis: "x", label: "JOINT TORQUE" },
    },
    {
      id: "torque-marks", kind: "select", target: "torque-marks",
      title: "Mark and verify every joint",
      cue: "Mark the torqued bolt and check every joint on the run carries its mark.",
      why: "The torque mark is field evidence that the bolt was taken to its value, and a check along the whole run catches the joint that was hand-tightened at the end of a shift and never went back to. The sign-off relies on every mark being there.",
    },
    {
      id: "megger-test", kind: "track", target: "megger-meter", seconds: 7,
      title: "Insulation-resistance test the run",
      cue: "Hold the insulation-resistance test steady on each bar for the full test time.",
      why: "An insulation-resistance test at the manufacturer's test voltage finds damaged insulators, moisture and debris across the whole run before it is energised; held for the full time, the reading means something, while a flick of the test button measures only how fast the needle moved.",
      track: { start: 0.5, green: [0.35, 0.65], rise: 0.05, fall: 0.3, drift: 0.1, label: "INSULATION TEST", readout: (v) => (v > 0.65 ? "reading unsteady" : v < 0.35 ? "check the leads" : "steady — holding") },
      holdBreakNote: "The test broke before its time — run it again for the full duration.",
    },
    {
      id: "signoff", kind: "select", target: "signoff-sheet",
      title: "Sign off the torque and the test",
      cue: "Sign the sheet: each joint, the wrench's calibration number and the test result.",
      why: "The sign-off ties every joint to the wrench that torqued it and the test that proved it, so if a joint ever runs hot the record shows who, with what, and against which value — and whether the wrench was in calibration that day.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, WS5_ACCENT);

    const slabTex = surfaceTexture((ctx, w, h) => pavingFace(ctx, w, h), { repeat: 3, px: 256 });
    const slab = box(g, 6.6, 0.06, 5.0, 0, 0.03, 0, 0xffffff, { rough: 0.9 });
    slab.material = texturedMat(slabTex, { rough: 0.9, color: 0xc9c7c0 });

    // The busway run overhead on its hangers.
    const run = group(g, 0, 3.0, -1.4);
    const seg = [];
    for (const sx of [-2.2, -0.6, 1.0, 2.6]) seg.push(box(run, 1.5, 0.16, 0.24, sx, 0, 0, 0x8b949b, { rough: 0.45, metal: 0.6 }));
    for (const hx of [-2.8, -1.4, 0.2, 1.8, 3.2]) box(run, 0.03, 0.8, 0.03, hx, 0.45, 0, 0x5a6168, { rough: 0.6, metal: 0.4 });
    const joints = [];
    for (const jx of [-1.4, 0.2, 1.8]) joints.push(box(run, 0.12, 0.22, 0.28, jx, 0, 0, 0x3a4047, { rough: 0.5, metal: 0.4 }));
    const marks = [];
    for (const jx of [-1.4, 1.8]) marks.push(box(run, 0.04, 0.02, 0.02, jx, 0.12, 0.15, 0xf2c14b, { rough: 0.5 }));
    reg(hits, marks[0], "torque-marks");
    const unmarked = box(run, 0.14, 0.24, 0.3, 0.2, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, unmarked, "unmarked-joint");
    const faultRing = box(run, 0.18, 0.28, 0.32, 0.2, 0, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.8, opacity: 0.4, transparent: true });
    faultRing.visible = false;
    const bolt = cyl(run, 0.03, 0.03, 0.1, 0.2, 0.16, 0, 0xc0c6ca, { rough: 0.3, metal: 0.7, seg: 8 });
    reg(hits, bolt, "joint-bolt");
    const insul = box(run, 0.02, 0.18, 0.2, 0.26, 0, 0, 0xd8c9a0, { rough: 0.8 });
    reg(hits, insul, "cracked-insulator");
    const swarf = box(run, 0.03, 0.03, 0.08, 0.14, -0.06, 0.1, 0xb8bec4, { rough: 0.3, metal: 0.7 });
    reg(hits, swarf, "debris-in-joint");
    const hanger = group(run, 0.9, 0, 0);
    hits["hanger-point"] = hanger;
    holoTag(run, "busway run", -2.2, 0.35, 0.2, { css: WS5_CSS, w: 0.3 });
    const adj = box(g, 6.0, 0.16, 0.24, 0, 3.0, -2.2, 0x6b737a, { rough: 0.45, metal: 0.6 });
    const adjLamp = cyl(g, 0.05, 0.05, 0.05, 2.9, 2.8, -2.2, 0x444444, { rough: 0.4, seg: 10 });
    holoTag(g, "adjacent run", 2.6, 3.3, -2.2, { css: "#9aa2a8", w: 0.28 });
    void adj;

    // Section on the floor, ready to go up.
    const section = group(g, -1.6, 0.25, 1.2);
    box(section, 1.4, 0.16, 0.24, 0, 0, 0, 0x8b949b, { rough: 0.45, metal: 0.6 });
    for (const sx of [-0.5, 0.5]) box(section, 0.2, 0.2, 0.3, sx, -0.12, 0, 0x2b2f34, { rough: 0.7 });
    holoTag(section, "busway section", 0, 0.3, 0, { css: WS5_CSS, w: 0.32 });
    reg(hits, section, "busway-section");

    // The lift.
    const lift = scissorLift(g, 0.6, 0, -0.7, { ry: 0 });
    const LP = lift.userData.parts;
    reg(hits, LP.gate, "lift-gate");
    reg(hits, LP.controls, "lift-platform-controls");
    const rails = box(g, 0.1, 0.1, 0.1, 1.25, 1.2, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "guardrails + pins", 1.4, 1.4, -0.7, { css: WS5_CSS, w: 0.34 });
    reg(hits, rails, "lift-guardrails");
    const groundCtl = box(g, 0.14, 0.2, 0.08, 1.2, 0.6, -0.1, 0x2b3138, { rough: 0.5 });
    holoTag(g, "ground controls", 1.3, 0.85, -0.1, { css: WS5_CSS, w: 0.3 });
    reg(hits, groundCtl, "lift-controls-test");
    const horn = cyl(g, 0.04, 0.06, 0.14, 0.1, 1.3, -0.1, 0xd2312b, { rough: 0.5, seg: 10 });
    holoTag(g, "lift horn", -0.1, 1.5, -0.1, { css: "#d2312b", w: 0.22 });
    reg(hits, horn, "lift-horn");

    // Switchboard with the upstream breaker.
    const sb = group(g, -2.6, 0, -1.2, Math.PI / 2);
    for (let i = 0; i < 2; i++) box(sb, 0.8, 2.2, 0.6, i * 0.82 - 0.41, 1.1, 0, 0x8b949b, { rough: 0.5, metal: 0.4 });
    const brk = box(sb, 0.14, 0.24, 0.06, -0.41, 1.3, 0.32, 0x2b3138, { rough: 0.4 });
    reg(hits, brk, "upstream-breaker");
    const lk = lockTag(sb, -0.41, 1.05, 0.33, { color: 0xd2312b, lines: ["LOCK"] });
    reg(hits, lk, "busway-lock");
    const tg = lockTag(sb, -0.15, 1.05, 0.33, { color: 0xf2c14b, lines: ["DANGER", "DO NOT", "OPERATE"] });
    reg(hits, tg, "busway-tag");
    holoTag(sb, "switchboard", 0, 2.4, 0.2, { css: WS5_CSS, w: 0.28 });

    // Tools, boards, radio.
    const bench = box(g, 1.2, 0.8, 0.5, 1.9, 0.4, 1.5, WS5_PAL.structure, { rough: 0.7 });
    void bench;
    const tester = multimeter(g, 1.6, 0.85, 1.5);
    holoTag(g, "voltage tester", 1.6, 1.1, 1.5, { css: WS5_CSS, w: 0.3 });
    reg(hits, tester, "absence-tester");
    const wrench = torqueWrench(g, 2.1, 0.85, 1.5);
    holoTag(g, "calibrated torque wrench", 2.2, 1.2, 1.5, { css: WS5_CSS, w: 0.44 });
    void wrench;
    const megger = instrument(g, 2.5, 0.95, 1.5, { idle: "IR TEST", color: 0x2b2f34, w: 0.16, d: 0.08 });
    holoTag(g, "insulation tester", 2.6, 1.35, 1.5, { css: WS5_CSS, w: 0.32 });
    reg(hits, megger, "megger-meter");
    const drawBoard = group(g, -2.6, 0, 1.0, 1.0);
    box(drawBoard, 0.6, 1.2, 0.05, 0, 0.6, 0, WS5_PAL.structure, { rough: 0.7 });
    const draw = decal(drawBoard, 0.5, 0.4, 0, 0.95, 0.03, paperFace("BUSWAY RUN", ["Run per drawings", "Torque per manufacturer", "Test per instructions"], { scale: 0.72 }));
    holoTag(drawBoard, "drawings", 0, 1.34, 0, { css: WS5_CSS, w: 0.24 });
    reg(hits, draw, "busway-drawings");
    const sheet = decal(drawBoard, 0.4, 0.3, 0, 0.4, 0.03, paperFace("TORQUE SIGN-OFF", ["Joint ___ ✓", "Wrench cal no. ___", "IR result ___"], { scale: 0.7 }));
    reg(hits, sheet, "signoff-sheet");
    const radioObj = radio(g, -1.0, 0.9, 2.0);
    holoTag(g, "site radio", -1.0, 1.15, 2.0, { css: WS5_CSS, w: 0.24 });
    reg(hits, radioObj, "site-radio");
    box(g, 0.5, 0.84, 0.4, -1.0, 0.42, 2.0, WS5_PAL.structure, { rough: 0.7 });
    for (let i = 0; i < 3; i++) cyl(g, 0.3, 0.3, 0.3, 3.0, 0.3 + i * 0.0, -2.0 + i * 0.7, 0x6b4a2a, { rough: 0.8, seg: 14 });

    const decoy = (x, y, z, id, text) => {
      const d = box(g, 0.25, 0.25, 0.25, x, y, z, 0x000000, { opacity: 0.001, transparent: true, cast: false });
      holoTag(g, text, x, y + 0.28, z, { css: "#d2312b", w: 0.44 });
      reg(hits, d, id);
    };
    decoy(-0.6, 2.2, -1.4, "work-energized-busway", "open the joint — it's probably off?");
    decoy(0.9, 2.2, -1.0, "torque-by-feel", "impact it tight?");
    decoy(0.0, 0.9, -0.2, "lift-gate-open", "leave the gate open?");
    decoy(1.6, 1.8, -0.4, "climb-lift-rails", "step up on the rail?");

    const labourer = standingFigure(g, 3.1, 2.3, { ry: -2.4, cloth: 0x5a4a3a, vest: 0xf2c14b });
    holoPanel(g, 1.0, 0.6, 0.4, 0, 2.3, (ctx, w, h) => {
      ctx.fillStyle = "#061a18"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = WS5_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.fillStyle = "#e6fffb";
      ctx.fillText("BUSWAY — TORQUED & SIGNED", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Isolate upstream, prove dead", "Inspect the joint before it closes", "Calibrated wrench, every mark", "Test, then sign"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { ry: -0.2, accent: WS5_ACCENT });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.8, -1.2),
      onStep() {},
      onFault(id) {
        if (id === "torque-mark-missing") { faultRing.visible = true; }
      },
      onStepComplete(step) {
        if (step.id === "absence-test") repaint(tester.userData?.screen ?? megger.userData.screen, signFace("DEAD", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "hang-section") { section.position.set(0.9, 3.0, -1.4); }
        if (step.id === "inspect-joint") { swarf.visible = false; insul.material = mat(0xe8dcb4, { rough: 0.8 }); }
        if (step.id === "torque-marks") faultRing.visible = false;
        if (step.id === "megger-test") repaint(megger.userData.screen, signFace("PASS", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
      },
      onInterrupt(it) {
        if (it.id === "pallet-under-lift") labourer.position.set(0.6, 0, 0.2);
        if (it.id === "adjacent-energize") adjLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "pallet-under-lift") labourer.position.set(3.1, 0, 2.3);
        if (it.id === "adjacent-energize") adjLamp.material = mat(0x444444, { rough: 0.4 });
      },
      onHazard() {},
      animate(t, dt, session) {
        if (session?.turn && session.step?.id === "torque-joint") bolt.rotation.y = session.turn.amount * Math.PI * 2;
      },
    };
  },
};
