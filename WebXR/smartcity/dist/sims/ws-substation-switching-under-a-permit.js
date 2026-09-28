import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, lockTag, reg,
  surfaceTexture, texturedMat, mudflatFace, blockFace, palette,
} from "../citykit.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Collector Substation Switching Under a Permit VR — Energy &
// Power, IBEW substation electrician.
//
// A wind farm's collector substation is switched to a written order, step
// by step, each step repeated back to the switching authority and done only
// when the authority says so. The breaker interrupts the load; the
// disconnect only makes the visible gap once the breaker is proven open;
// the gap is locked and tagged, the conductors tested and grounded; and
// only then is a permit issued to the crew who will work inside it. Sited
// generically: no voltage, rating or clearance distance is stated — each is
// the switching order's, the approach tables' and the site's.

const WS4_ACCENT = 0xe0a83f;
const WS4_CSS = "#e0a83f";
const WS4_PAL = palette("utility");

export const SIM_WS_SUBSTATION_SWITCHING_UNDER_A_PERMIT = {
  id: "ws-substation-switching-under-a-permit",
  index: "ws-04",
  domain: "Energy",
  trade: "IBEW substation electrician",
  category: "Energy & Power",
  district: "wind-farm",
  weather: "overcast",
  certification: "IBEW/NECA JATC substation training as a body; 29 CFR 1910.269 for switching, clearances, grounding and the permit; NFPA 70E for the arc-rated PPE and the absence-of-voltage test; the NESC (IEEE C2) for the substation's own clearances; NETA acceptance and maintenance testing practice for the ground set and the detector; every voltage, rating and approach distance per the switching order and the site's tables",
  name: "Collector Substation Switching Under a Permit",
  title: simTitle("Collector Substation Switching Under a Permit"),
  tagline: "A written order switched step by step with every step repeated back, the breaker proven open before the disconnect moves, the gap locked, tested and grounded, and a permit issued only then",
  accent: WS4_ACCENT,
  accentCss: WS4_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "switched-to-order", name: "Switched to the Order", note: "Every step repeated back, the breaker proven open before the disconnect, and the gap grounded before the permit went out" },

  game: system({
    name: "Switching Authority",
    currency: "STEPS",
    ranks: ["Trainee", "Switchman", "Substation Electrician", "Lead Switchman", "Switching Authority Certified"],
    badges: [
      { id: "proven-open", name: "Proven Open", note: "The breaker was proven open before the disconnect moved", test: AWARD.stepClean("verify-open") },
      { id: "to-the-letter", name: "To the Letter", note: "No unsafe action was recorded", test: AWARD.safe },
      { id: "steady-watch", name: "Steady Watch", note: "Held the work-zone watch steady", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-order", name: "Clean Order", note: "No corrections from the order to the permit", test: AWARD.clean },
      { id: "unbroken-grounds", name: "Unbroken Grounds", note: "The grounds went on without a break", test: AWARD.unbroken },
      { id: "brisk-switching", name: "Brisk Switching", note: "Switched and permitted inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "switch-without-order": "You went to operate equipment with no written order in hand and no word from the switching authority. Switching from memory, or from what looks obvious in the yard, is how the wrong breaker opens and the wrong line stays live.",
    "disconnect-under-load": "You went to open the disconnect with the breaker still closed. A disconnect is not built to interrupt load current; opened under load it draws an arc across the blades toward the person on the handle.",
    "ground-before-test": "You went to hang the grounds without testing for absence of voltage. A ground clamp put onto a live conductor is a fault at the end of a stick in your hands.",
    "reach-past-barrier": "You went to reach past the barrier toward the live bus next to the work zone. The barrier marks the approach distance the order and the site's tables set; inside it, a person is part of the circuit.",
  },

  lateNotes: {
    "disconnect-handle": "The disconnect opens only once the breaker has been proven open — never before, whatever the order's line numbers look like.",
    "ground-stick": "The grounds go on only after the absence-of-voltage test, never before it.",
  },

  faults: [
    {
      id: "breaker-fails-to-open",
      label: "Breaker fails to open",
      note: "The breaker was operated but its position indicator still shows closed and the flags disagree. Switching stops here: hold the order and report to the switching authority.",
      step: "verify-open",
      change: {
        target: "hold-switching-card",
        title: "Hold the switching and report",
        cue: "The breaker still reads closed — stop, hold the order and report to the switching authority. Do not go on to the disconnect.",
        why: "Every later step in the order assumes the breaker has interrupted the load; a breaker that has not opened turns the next step, opening the disconnect, into breaking load across blades that were never built for it. Stopping and holding the order hands the problem to the authority who can switch around it.",
      },
    },
  ],

  interrupts: [
    {
      id: "visitor-at-gate",
      kind: "A visitor opens the substation gate",
      after: "ground-clamps", delay: 3, seconds: 11,
      alert: "A contractor's driver has opened the substation gate and is walking in to ask for directions.",
      cue: "Stop them at the gate — close and chain it.",
      target: "substation-gate",
      why: "A substation is a place where an untrained person can walk inside an approach distance without knowing it exists; the gate and the chain are what keep the yard to the people who are qualified and on the permit.",
      missNote: "The visitor walked into the yard with the gate open behind them, an untrained person heading toward approach distances they cannot see.",
      wrongNote: "It is the gate. The grounds are on; the visitor is the new hazard.",
    },
    {
      id: "annunciator-alarm",
      kind: "An annunciator alarms in the control house",
      after: "zone-watch", delay: 3, seconds: 12,
      alert: "An annunciator in the control house is alarming on the adjacent bay.",
      cue: "Call the switching authority on the radio before anyone does anything else.",
      target: "switching-radio",
      why: "An alarm on an adjacent bay may mean the system around the work zone has changed, and only the switching authority can see the whole system. The call goes first; nobody resets or investigates an alarm next to a permit area on their own.",
      missNote: "The alarm went unreported while the crew carried on, next to a permit area whose surrounding system may just have changed.",
      wrongNote: "It is the radio to the switching authority. The work-zone watch does not tell anyone about the alarm.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your IBEW steward if you are not sure how to reach it",

  steps: [
    {
      id: "read-order", kind: "select", target: "switching-order",
      title: "Read the switching order",
      cue: "Read the switching order through: every step, every device by its name, and the permit it leads to.",
      why: "The order is the only thing that says which devices open, in which sequence and for whom; reading it through before the first step catches a wrong device name or a missing step while it is still paper, not while a switch handle is in your hand.",
    },
    {
      id: "ppe", kind: "sequence",
      targets: ["arc-rated-clothing", "arc-face-shield", "rubber-gloves"],
      itemNames: { "arc-rated-clothing": "arc-rated clothing on", "arc-face-shield": "arc-rated face shield and hood on", "rubber-gloves": "rubber insulating gloves air-tested and on" },
      title: "Dress for the switching",
      cue: "Put on the arc-rated clothing, then the face shield and hood, then air-test and put on the rubber gloves.",
      why: "Switching is the moment an arc is most likely if anything is wrong, and the arc-rated PPE is chosen for the energy this equipment can release; the gloves are air-tested every time because a pinhole is invisible until it is in contact with a live part.",
      outOfOrderNote: "Clothing, then the face protection, then the tested gloves — the gloves go on last so they are not damaged dressing.",
    },
    {
      id: "repeat-back", kind: "select", target: "switching-radio",
      title: "Repeat the step back to the authority",
      cue: "Call the switching authority, read the first step back and wait for the word to proceed.",
      why: "Three-part communication — the authority says it, you repeat it, the authority confirms — catches a misheard device name before it becomes a wrong operation, and waiting for the word keeps one person in charge of the system's state.",
    },
    {
      id: "open-breaker", kind: "select", target: "breaker-open-control",
      title: "Open the breaker",
      cue: "Operate the breaker open from the control house panel, standing out of line of the gear.",
      why: "The breaker is the device built to interrupt load, so it opens first; operating it from the control panel, out of line of the gear, puts distance between the person and the equipment at the one moment it is doing its hardest work.",
    },
    {
      id: "verify-open", kind: "select", target: "breaker-position-indicator",
      title: "Prove the breaker open",
      cue: "Check the breaker's position indicator and flags both show open before going on.",
      why: "A control switch that has been turned is not a breaker that has opened; the position indicator and the mechanical flags are the breaker's own report, and both must agree before the disconnect — which cannot break load — is touched.",
    },
    {
      id: "open-disconnect", kind: "turn", target: "disconnect-handle",
      title: "Open the disconnect",
      cue: "Turn the disconnect's operating handle to open it fully, watching the blades clear.",
      why: "The disconnect makes the visible gap that proves isolation to anyone who looks; it is opened only after the breaker because it is built to isolate a de-energised circuit, and the blades are watched to confirm every phase has cleared.",
      turn: { turns: 0.5, axis: "z", label: "DISCONNECT" },
    },
    {
      id: "lock-disconnect", kind: "sequence",
      targets: ["disconnect-lock", "disconnect-tag"],
      itemNames: { "disconnect-lock": "disconnect handle locked", "disconnect-tag": "hold tag hung" },
      title: "Lock and tag the open disconnect",
      cue: "Lock the disconnect handle open, then hang the hold tag named on the order.",
      why: "The lock stops the disconnect being closed while the crew works beyond it, and the tag names the order and the person holding it, so nobody closes it on the strength of a guess that the work is done.",
      outOfOrderNote: "Lock, then tag — the tag names a device that is already secured.",
    },
    {
      id: "absence-test", kind: "gauge", target: "voltage-detector",
      title: "Test for absence of voltage",
      cue: "Prove the detector on a known source, test each phase, then prove the detector again — commit when it reads absent.",
      why: "An open disconnect can still leave a conductor live through back-feed or induction from the next circuit, and a detector can fail silently; proving it before and after is what makes an absent reading mean absent.",
      gauge: { label: "ABSENCE OF VOLTAGE", speed: 0.55, green: [0.2, 0.45], readout: (t) => (t > 0.45 ? "PRESENT — stop" : "absent on each phase"), missNote: "That is not an absent reading — nothing gets grounded until the source is found." },
    },
    {
      id: "inspect-grounds", kind: "find", noHint: true,
      targets: ["frayed-ground-cable", "cracked-clamp-jaw"],
      itemNames: { "frayed-ground-cable": "a frayed ground cable at the ferrule", "cracked-clamp-jaw": "a cracked jaw on a ground clamp" },
      itemNotes: {
        "frayed-ground-cable": "Strands are broken at the ferrule — this cable may not carry fault current long enough for protection to clear, and it comes out of the set.",
        "cracked-clamp-jaw": "The jaw is cracked through; under fault current it can open and let the ground go. This clamp comes out of service.",
      },
      title: "Inspect the ground set",
      cue: "Check the ground set before it goes on and find what takes it out of service.",
      why: "Grounds exist for the worst moment — an accidental re-energisation — and must carry fault current until the protection clears; a frayed cable or a cracked jaw fails exactly then, so the set is inspected before each use, not after.",
    },
    {
      id: "ground-clamps", kind: "hold", target: "ground-stick", seconds: 5,
      title: "Hang the grounds",
      cue: "Hold the hot stick steady and hang the grounds: ground end first, then each phase.",
      why: "The ground end goes on first so the set is already bonded to earth when each phase clamp touches its conductor; reversed, the set could be energised in the worker's hands. Held steady on a stick keeps the approach distance the order sets.",
      holdBreakNote: "The stick came off before the clamp was tight — hang it again until it bites.",
    },
    {
      id: "zone-watch", kind: "track", target: "work-zone-meter", seconds: 7,
      title: "Hold the work-zone boundary",
      cue: "Keep watch on the work-zone boundary as the crew sets up — everyone inside the grounded zone, nobody at the live bus.",
      why: "The permit covers a grounded zone, and the live bus next to it is still live; the watch keeps crew and long tools inside the zone the grounds protect, which is the boundary the whole switching sequence was done to create.",
      track: { start: 0.5, green: [0.35, 0.65], rise: 0.05, fall: 0.3, drift: 0.12, label: "WORK ZONE", readout: (v) => (v > 0.65 ? "drifting to the live bus" : v < 0.35 ? "check the boundary" : "inside the grounded zone") },
      holdBreakNote: "The watch broke — someone is near the boundary; bring the crew back inside the grounded zone.",
    },
    {
      id: "issue-permit", kind: "select", target: "permit-board",
      title: "Issue the permit",
      cue: "Issue the permit to the crew lead: the zone, the grounds by location, and who holds the order.",
      why: "The permit is the formal hand-over of a safe zone from the switchman to the crew, and it lists exactly what protects them; when the work ends, the same permit is surrendered before a single ground comes off, so the reverse sequence starts from a known state.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, WS4_ACCENT);

    const gravel = surfaceTexture((ctx, w, h) => mudflatFace(ctx, w, h, { base: "#8e8a80", base2: "#6f6b62", cracks: 0, pools: 0 }), { repeat: 4, px: 256 });
    const pad = box(g, 6.6, 0.06, 5.0, 0, 0.03, 0, 0xffffff, { rough: 0.95 });
    pad.material = texturedMat(gravel, { rough: 0.95, metal: 0.02 });

    // Switchgear lineup and the breaker.
    const gear = group(g, -1.4, 0, -2.0);
    for (let i = 0; i < 3; i++) box(gear, 0.9, 2.2, 1.0, i * 0.95 - 0.95, 1.1, 0, 0x8b949b, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 3; i++) box(gear, 0.7, 0.5, 0.02, i * 0.95 - 0.95, 1.6, 0.51, 0x3a4047, { rough: 0.5 });
    const posInd = instrument(gear, 0, 1.2, 0.52, { idle: "CLOSED", color: 0x2b2f34, w: 0.18, d: 0.03 });
    holoTag(gear, "breaker position", 0, 1.45, 0.52, { css: WS4_CSS, w: 0.34 });
    reg(hits, posInd, "breaker-position-indicator");
    const flagLamp = cyl(gear, 0.04, 0.04, 0.03, 0.25, 1.2, 0.52, 0xd2312b, { emissive: 0xd2312b, ei: 1.0, seg: 10 });
    flagLamp.rotation.x = Math.PI / 2;

    // Control house and its panel.
    const houseTex = surfaceTexture((ctx, w, h) => blockFace(ctx, w, h), { repeat: 1, px: 256 });
    const house = box(g, 1.8, 2.6, 1.4, 2.4, 1.3, -1.9, 0xffffff, { rough: 0.85 });
    house.material = texturedMat(houseTex, { rough: 0.85, color: 0xc8c2b4 });
    const ctrl = group(g, 1.9, 0, -1.15);
    box(ctrl, 0.8, 1.4, 0.2, 0, 0.9, 0, 0xd7dbdd, { rough: 0.5 });
    const openCtl = cyl(ctrl, 0.05, 0.05, 0.05, -0.15, 1.2, 0.11, 0x59c97b, { rough: 0.4, seg: 12 });
    openCtl.rotation.x = Math.PI / 2;
    holoTag(ctrl, "breaker control", 0, 1.75, 0.1, { css: WS4_CSS, w: 0.32 });
    reg(hits, openCtl, "breaker-open-control");
    const annun = box(ctrl, 0.3, 0.12, 0.02, 0.15, 1.4, 0.11, 0x444444, { rough: 0.4 });

    // The disconnect on its structure.
    const disc = group(g, 0.4, 0, -2.2);
    for (const sx of [-0.7, 0.7]) box(disc, 0.15, 3.0, 0.15, sx, 1.5, 0, 0x9aa2a8, { rough: 0.5, metal: 0.5 });
    box(disc, 1.6, 0.15, 0.15, 0, 3.0, 0, 0x9aa2a8, { rough: 0.5, metal: 0.5 });
    const blades = [];
    for (const bx of [-0.45, 0, 0.45]) { cyl(disc, 0.06, 0.06, 0.3, bx, 3.2, 0, 0x8a6f4a, { rough: 0.6, seg: 8 }); const b = box(disc, 0.04, 0.5, 0.04, bx, 3.5, 0, 0xc0c6ca, { rough: 0.3, metal: 0.7 }); blades.push(b); }
    const handle = group(disc, 0.7, 1.1, 0.12);
    const lever = box(handle, 0.05, 0.4, 0.05, 0, 0.2, 0, 0xf0b323, { rough: 0.5 });
    holoTag(disc, "disconnect handle", 0.7, 1.7, 0.12, { css: WS4_CSS, w: 0.36 });
    reg(hits, lever, "disconnect-handle");
    const dLock = lockTag(disc, 0.85, 1.0, 0.14, { color: 0xd2312b, lines: ["LOCK"] });
    reg(hits, dLock, "disconnect-lock");
    const dTag = lockTag(disc, 0.55, 1.0, 0.14, { color: 0xf2c14b, lines: ["HOLD", "TAG"] });
    reg(hits, dTag, "disconnect-tag");

    // Ground set, hot stick, detector.
    const rack = group(g, -2.4, 0, 0.4, 0.5);
    box(rack, 0.9, 1.0, 0.3, 0, 0.5, 0, WS4_PAL.structure, { rough: 0.7 });
    const cable = cyl(rack, 0.03, 0.03, 0.8, -0.2, 1.1, 0, 0x7a5a2a, { rough: 0.6, seg: 8 });
    cable.rotation.z = Math.PI / 2;
    reg(hits, cable, "frayed-ground-cable");
    const jaw = box(rack, 0.1, 0.12, 0.08, 0.3, 1.1, 0, 0x8b949b, { rough: 0.4, metal: 0.6 });
    reg(hits, jaw, "cracked-clamp-jaw");
    holoTag(rack, "ground set", 0, 1.4, 0, { css: WS4_CSS, w: 0.26 });
    const stick = group(g, -0.8, 0, -1.2, 0.2);
    const pole = cyl(stick, 0.025, 0.025, 2.6, 0, 1.3, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    pole.rotation.z = 0.35;
    holoTag(stick, "hot stick + grounds", -0.3, 2.1, 0, { css: WS4_CSS, w: 0.4 });
    reg(hits, pole, "ground-stick");
    const detector = instrument(g, -1.8, 1.0, 1.4, { idle: "DETECT", color: 0x2b2f34, w: 0.16, d: 0.05 });
    holoTag(g, "voltage detector", -1.8, 1.25, 1.4, { css: WS4_CSS, w: 0.34 });
    reg(hits, detector, "voltage-detector");
    box(g, 0.6, 0.9, 0.4, -1.8, 0.45, 1.4, WS4_PAL.structure, { rough: 0.7 });

    // PPE rack.
    const ppe = group(g, 2.6, 0, 0.6, -0.6);
    box(ppe, 0.06, 1.8, 0.06, -0.4, 0.9, 0, 0x5a6168, { rough: 0.6 });
    box(ppe, 0.06, 1.8, 0.06, 0.4, 0.9, 0, 0x5a6168, { rough: 0.6 });
    box(ppe, 0.86, 0.05, 0.05, 0, 1.75, 0, 0x5a6168, { rough: 0.6 });
    const coat = box(ppe, 0.4, 0.7, 0.1, -0.15, 1.3, 0.05, 0x2f4f7f, { rough: 0.8 });
    reg(hits, coat, "arc-rated-clothing");
    const shield = box(ppe, 0.22, 0.26, 0.12, 0.22, 1.5, 0.05, 0x9fd4e8, { rough: 0.2, opacity: 0.8, transparent: true });
    reg(hits, shield, "arc-face-shield");
    const gloves = box(ppe, 0.16, 0.2, 0.08, 0.22, 1.05, 0.05, 0xd2312b, { rough: 0.7 });
    reg(hits, gloves, "rubber-gloves");
    holoTag(ppe, "arc-rated PPE", 0, 2.0, 0, { css: WS4_CSS, w: 0.3 });

    // Boards, radio, gate, barriers.
    const orderBoard = group(g, -2.6, 0, -0.9, 0.7);
    box(orderBoard, 0.6, 1.2, 0.05, 0, 0.6, 0, WS4_PAL.structure, { rough: 0.7 });
    const orderFace = decal(orderBoard, 0.5, 0.4, 0, 0.95, 0.03, paperFace("SWITCHING ORDER", ["Devices named per order", "Each step on the word", "Permit per order"], { scale: 0.72 }));
    holoTag(orderBoard, "switching order", 0, 1.34, 0, { css: WS4_CSS, w: 0.34 });
    reg(hits, orderFace, "switching-order");
    const holdCard = decal(orderBoard, 0.3, 0.14, 0, 0.45, 0.03, signFace("HOLD", { bg: "#2a0d0d", accent: "#d2312b", fg: "#ffe9e9", scale: 0.5 }));
    reg(hits, holdCard, "hold-switching-card");
    const permit = decal(g, 0.44, 0.34, 1.2, 1.2, 1.9, paperFace("WORK PERMIT", ["Zone ___", "Grounds at ___", "Order held by ___"], { scale: 0.72 }));
    holoTag(g, "permit board", 1.2, 1.5, 1.9, { css: WS4_CSS, w: 0.3 });
    reg(hits, permit, "permit-board");
    box(g, 0.6, 1.1, 0.05, 1.2, 0.55, 1.93, WS4_PAL.structure, { rough: 0.7 });
    const radioObj = radio(g, 2.4, 0.95, 1.6);
    holoTag(g, "switching radio", 2.4, 1.2, 1.6, { css: WS4_CSS, w: 0.32 });
    reg(hits, radioObj, "switching-radio");
    box(g, 0.5, 0.88, 0.4, 2.4, 0.44, 1.6, WS4_PAL.structure, { rough: 0.7 });
    const zoneInst = instrument(g, 0.2, 1.2, 0.9, { idle: "ZONE", color: 0x2b2f34, w: 0.16, d: 0.03 });
    holoTag(g, "work zone", 0.2, 1.42, 0.9, { css: WS4_CSS, w: 0.24 });
    reg(hits, zoneInst, "work-zone-meter");
    box(g, 0.05, 1.1, 0.05, 0.2, 0.55, 0.9, 0x5a6168, { rough: 0.6 });
    const gate = group(g, -3.1, 0, 1.9);
    const gateLeaf = box(gate, 1.4, 2.0, 0.05, 0.7, 1.0, 0, 0x9fa8ae, { rough: 0.6, metal: 0.5, opacity: 0.6, transparent: true });
    holoTag(gate, "substation gate", 0.7, 2.25, 0, { css: WS4_CSS, w: 0.34 });
    reg(hits, gateLeaf, "substation-gate");
    for (const bx of [-2.8, -1.6]) cyl(g, 0.04, 0.05, 1.0, bx, 0.5, -2.6, 0xf07a1f, { rough: 0.6, seg: 8 });
    box(g, 1.2, 0.05, 0.03, -2.2, 0.9, -2.6, 0xd2312b, { rough: 0.6 });

    const decoy = (x, y, z, id, text) => {
      const d = box(g, 0.25, 0.25, 0.25, x, y, z, 0x000000, { opacity: 0.001, transparent: true, cast: false });
      holoTag(g, text, x, y + 0.28, z, { css: "#d2312b", w: 0.44 });
      reg(hits, d, id);
    };
    decoy(-0.4, 1.2, 0.4, "switch-without-order", "just open it — it's obvious?");
    decoy(1.0, 1.3, -1.4, "disconnect-under-load", "pull the disconnect first?");
    decoy(-1.1, 1.3, -0.4, "ground-before-test", "hang the grounds now?");
    decoy(-2.2, 1.5, -2.3, "reach-past-barrier", "reach past the barrier?");

    const visitor = standingFigure(g, -4.2, 2.6, { ry: 1.2, cloth: 0x6a5a4a, vest: 0x9aa2a8 });
    standingFigure(g, 3.0, 2.2, { ry: -2.6, cloth: 0x2b4f7f, vest: 0xf2c14b });
    toolChest(g, 0.9, 2.3);
    holoPanel(g, 1.0, 0.6, -0.4, 0, 2.3, (ctx, w, h) => {
      ctx.fillStyle = "#1c1206"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = WS4_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff4e0";
      ctx.fillText("SWITCHING — TO THE ORDER", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Repeat every step back", "Breaker proven open first", "Lock, tag, test, ground", "Then — and only then — the permit"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { ry: 0.2, accent: WS4_ACCENT });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -1.4),
      onStep() {},
      onFault(id) {
        if (id === "breaker-fails-to-open") { flagLamp.material = mat(0xf2ae14, { emissive: 0xf2ae14, ei: 1.8 }); gear.children[1].material = mat(0x6a2a2a, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "verify-open") { repaint(posInd.userData.screen, signFace("OPEN", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 })); flagLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0 }); }
        if (step.id === "open-disconnect") for (const b of blades) b.rotation.z = 1.2;
        if (step.id === "absence-test") repaint(detector.userData.screen, signFace("ABSENT", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "ground-clamps") pole.rotation.z = 0.05;
      },
      onInterrupt(it) {
        if (it.id === "visitor-at-gate") { visitor.position.set(-2.8, 0, 1.6); gateLeaf.rotation.y = -1.1; }
        if (it.id === "annunciator-alarm") annun.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "visitor-at-gate") { visitor.position.set(-4.2, 0, 2.6); gateLeaf.rotation.y = 0; }
        if (it.id === "annunciator-alarm") annun.material = mat(0x444444, { rough: 0.4 });
      },
      onHazard() {},
      animate(t, dt, session) {
        if (session?.turn && session.step?.id === "open-disconnect") { handle.rotation.z = session.turn.amount * 1.4; for (const b of blades) b.rotation.z = session.turn.amount * 1.2; }
      },
    };
  },
};
