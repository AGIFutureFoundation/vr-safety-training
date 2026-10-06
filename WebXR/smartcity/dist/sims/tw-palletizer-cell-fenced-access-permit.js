import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, lockTag,
  surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { roboticPalletizer } from "../../../shared/equipment.js";
import { fencePanel, fencePanelGate, palletStack } from "../../../shared/props.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Palletizer Cell Fenced-Access Permit VR — Manufacturing &
// Automation, Teamsters warehouse and logistics automation.
//
// A robotic palletizer looks perfectly still between cycles, which is
// exactly the moment it is most likely to move again without warning — the
// fence, the light curtain and the gate interlock exist because "it looks
// stopped" is not the same thing as "it cannot move." This station walks
// the cell's own permit-to-enter sequence: the light curtain and interlock
// confirmed honest before the gate is trusted, the arm's power isolated and
// locked with a personal lock, the residual motion actually proven at
// zero, and the release sequence run in the order that keeps the cell from
// restarting onto someone still inside it. No robot's stopping distance,
// residual pressure or restart delay is a number this platform is certain
// of — those live on the cell's own risk assessment and the manufacturer's
// manual.

const TW6_PAL = palette("warehouse");
const PZ_ACCENT = 0x7d5ba6;

export const SIM_TW_PALLETIZER_CELL_FENCED_ACCESS_PERMIT = {
  id: "tw-palletizer-cell-fenced-access-permit",
  index: "tw-6",
  domain: "Warehousing & Logistics",
  trade: "Teamsters warehouse associate — palletizer cell entry",
  category: "Manufacturing & Automation",
  indoor: "plant",
  certification: "Teamsters warehouse and logistics automation training; ANSI R15.06 and ISO 10218 for industrial robots and robot systems, worked the way a site's own robot-cell risk assessment applies them; OSHA 29 CFR 1910.147 the control of hazardous energy and 29 CFR 1910.212 machine guarding; NIOSH findings on struck-by incidents during robot-cell entry",
  name: "Palletizer Cell Fenced-Access Permit",
  title: simTitle("Palletizer Cell Fenced-Access Permit"),
  tagline: "Entering a robotic palletizer cell the way its own permit-to-enter sequence requires it: the light curtain and gate interlock confirmed honest, the arm's power isolated and locked, the residual motion proven at zero, and the release run in the order that keeps the cell from restarting on someone still inside it",
  accent: PZ_ACCENT,
  accentCss: "#7d5ba6",
  parSeconds: 280,
  footprint: 2.8,
  badge: { id: "palletizer-cell-certified", name: "Palletizer Cell Certified", note: "Confirmed the curtain and interlock, isolated and locked the arm before entering, and proved zero energy before touching anything inside the fence" },

  game: system({
    name: "Cell Access Control",
    currency: "PERMIT",
    ranks: ["Fence Line", "Cell Aware", "Cell Access Handler", "Cell Access Authority", "Palletizer Cell Certified"],
    badges: [
      { id: "locked-before-entered", name: "Locked Before Entered", note: "Isolated and locked the arm before the gate ever opened", test: AWARD.stepClean("cell-loto") },
      { id: "never-trust-a-taped-curtain", name: "Never Trust a Taped Curtain", note: "Never missed a hazard on the cell read", test: AWARD.stepClean("cell-hazard-read") },
      { id: "steady-proving-run", name: "Steady Proving Run", note: "Held the proving-cycle speed near band centre", test: AWARD.precise(0.72) },
      { id: "clean-release", name: "Clean Release", note: "Released the cell in order, first try", test: AWARD.stepClean("cell-release") },
    ],
    challenges: [
      { id: "quick-entry", name: "Quick Entry", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "permit-streak", name: "Permit Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your Teamsters local's member assistance programme, or the site's employee assistance line if a close call entering a robot cell is what stayed with you",

  hazards: {
    "curtain-taped-hazard": "That light curtain sensor has tape over the lens. A curtain that cannot see anything crossing it is not stopping the arm for anything crossing it, no matter how many times someone has walked through since the tape went on without incident.",
    "gate-defeated-hazard": "That gate interlock has been defeated with a zip tie holding the switch depressed. A gate that reads closed whether or not it actually is stops confirming anything at all — it is a formality wearing the shape of a safety device.",
    "estop-covered-hazard": "That emergency stop is covered by a stacked case. An e-stop that takes three extra seconds to reach because a box has to move first is three seconds too many the one time somebody actually needs it.",
    "skip-permit-hazard": "That is the shortcut lever that opens the gate without the permit-to-enter sequence. A cell entered once without a permit is a cell that gets entered the same way again, and the one time the arm was not actually where the last person assumed looks exactly the same from outside the fence.",
  },

  lateNotes: {
    "cell-gate": "The gate only opens once the permit sequence — curtain, interlock, isolation, lock — is actually complete, never as the first move at the fence.",
    "cell-isolator": "The arm's power gets isolated and locked before the gate opens, not checked by watching the arm for a while first.",
  },

  interrupts: [
    {
      id: "stored-energy-drift-fault",
      kind: "Stored-energy drift",
      after: "zero-energy-check", delay: 4, seconds: 12,
      alert: "The arm has visibly settled and drifted slightly even though the isolation is confirmed — stored energy bleeding off.",
      cue: "Do not enter yet. Report the drift to the controls technician and have the isolation re-verified.",
      target: "controls-tech-radio",
      why: "Isolating the arm's main power does not always empty an accumulator or relax a counterbalance spring instantly, and a drift after isolation is exactly that stored energy finding somewhere to go — reporting it before entering is what confirms the cell is actually at zero energy, not just switched off.",
      missNote: "The drift was treated as normal and entry continued. Stored energy that moves the arm once will move it again, and the second time may be with a hand already inside its reach.",
      wrongNote: "Not that — a drift after isolation goes to the controls technician before anyone enters.",
    },
    {
      id: "auto-restart-signal-fault",
      kind: "Automatic restart signal",
      after: "gate-open", delay: 3, seconds: 12,
      alert: "The cell's automation has sent a restart signal while the gate is still open.",
      cue: "Hit the cell's local emergency stop immediately. Do not rely on the gate interlock alone to catch this.",
      target: "cell-estop",
      why: "A restart signal that reaches the cell while the gate is open means the interlock chain has a gap somewhere upstream of the gate itself, and the local e-stop is the one control that does not depend on that chain being intact — hitting it is what stops the arm regardless of what sent the signal or why.",
      missNote: "The restart signal was left unanswered. An interlock chain that let one restart signal through while the gate was open will let the next one through too.",
      wrongNote: "Not that — a restart signal with the gate open goes straight to the cell's local e-stop.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hearing-protection"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hearing-protection": "hearing protection" },
      title: "Suit up before approaching the cell",
      cue: "Hi-vis vest and hearing protection before approaching the palletizer cell.",
      why: "A palletizer cell runs pneumatics and servo drives loud enough to matter over a full shift, and hearing protection is what keeps today's five-minute entry from adding up with every other cell entry this associate makes this year into a loss nobody notices until it is already permanent.",
    },
    {
      id: "permit-read", kind: "select", target: "permit-board",
      title: "Read the permit-to-enter board",
      cue: "Confirm today's permit-to-enter before approaching the fence line.",
      why: "The permit is what confirms this specific cell is actually scheduled and authorised for entry right now — approaching the fence because the arm happens to be idle is not the same thing as this cell being cleared for someone to be inside it.",
    },
    {
      id: "cell-hazard-read", kind: "find", noHint: true,
      targets: ["curtain-taped-hazard", "gate-defeated-hazard", "estop-covered-hazard"],
      itemNames: {
        "curtain-taped-hazard": "light curtain lens taped over",
        "gate-defeated-hazard": "gate interlock defeated with a zip tie",
        "estop-covered-hazard": "e-stop covered by a stacked case",
      },
      itemNotes: {
        "curtain-taped-hazard": "The tape comes off the curtain before this fence is trusted to catch anything crossing it.",
        "gate-defeated-hazard": "The zip tie comes off the interlock before the gate means anything again.",
        "estop-covered-hazard": "The case comes off the e-stop before anyone works inside this fence.",
      },
      decoyNotes: {
        "intact-fence-panel": "That fence panel is intact and properly anchored. Nothing to flag there.",
      },
      title: "Read the cell for what is already wrong with it",
      cue: "Look the cell over before approaching the gate. Three things are already wrong with it — find them.",
      why: "A cell that looks routine from the fence line is not the same thing as one an associate has actually checked — a taped curtain, a defeated interlock or a covered e-stop each quietly removes a control the entry depends on, and finding them now costs a work order instead of costing someone the one time the arm was not actually done moving.",
    },
    {
      id: "request-permit", kind: "select", target: "cell-controller",
      title: "Request entry from the cell controller",
      cue: "Request entry at the cell controller before touching the gate.",
      why: "Requesting entry through the controller is what tells the automation a person is about to be inside the fence, so the system holds any queued cycle instead of treating the cell as simply idle between pallets and starting the next one the moment stock arrives.",
    },
    {
      id: "cell-loto", kind: "sequence", anyOrder: false,
      targets: ["cell-isolator", "cell-lock", "cell-tag"],
      itemNames: { "cell-isolator": "cell power isolator", "cell-lock": "personal lock", "cell-tag": "danger tag" },
      title: "Isolate and lock the cell",
      cue: "Isolate the arm's power, apply your own lock, then apply the tag — in that order.",
      why: "The isolator alone can be re-energised by anyone who does not know a person is behind the fence; the lock is what makes that impossible without that associate's own key, and the tag is what tells the next person at the panel why the lock is there — skip any one of the three and the cell is entered on a promise, not a proof.",
      outOfOrderNote: "Isolate, then lock, then tag — a lock with nothing isolated behind it protects nobody.",
    },
    {
      id: "zero-energy-check", kind: "gauge", target: "residual-motion-gauge",
      title: "Confirm zero residual energy",
      cue: "Read the residual motion gauge and commit only once it shows fully at zero.",
      why: "Isolating the main power does not always account for stored energy in an accumulator or a counterbalance, and the gauge is the only honest read of whether the arm is actually at zero — not how still it has looked for the last minute.",
      gauge: {
        label: "RESIDUAL ENERGY", speed: 0.55, green: [0, 0.12],
        readout: (t) => (t > 0.12 ? "residual energy present — do not enter" : "fully at zero"),
        missNote: "Committed while residual energy was still present. The gate does not open until this reads fully at zero.",
      },
    },
    {
      id: "gate-open", kind: "turn", target: "cell-gate",
      title: "Open the cell gate",
      cue: "Turn the gate latch now that the cell is isolated, locked and proven at zero energy.",
      why: "Opening the gate only after every prior control is confirmed is what keeps this step from ever being the one where the cell turns out to still have something behind it that could move — a sequence run in order, not a gate opened on general confidence that the cell is probably fine by now.",
      turn: { turns: 0.4, axis: "y", label: "CELL GATE" },
    },
    {
      id: "arm-position-check", kind: "select", target: "arm-parked-marker",
      title: "Confirm the arm is parked safely",
      cue: "Confirm the arm is in its marked safe-park position before entering fully.",
      why: "An arm parked outside its marked position may still be within reach of the entry path even while fully powered down — confirming its position now is what keeps the walk to the jam from ever passing closer to it than planned, isolated or not.",
    },
    {
      id: "clear-jam", kind: "drag", target: "jammed-pallet",
      title: "Clear the jam inside the cell",
      cue: "Carry the jammed pallet clear of the cell to the marked reject area.",
      why: "Clearing the jam with the arm confirmed isolated, locked and parked is what makes this the routine maintenance task it should be, rather than a reach into a cell whose arm someone is trusting rather than proving, on the strength of how still it happened to look a minute ago.",
      drag: { to: "reject-area", radius: 0.45, missNote: "Not clear of the cell — carry the pallet all the way to the marked reject area before letting go." },
    },
    {
      id: "gate-close", kind: "turn", target: "cell-gate",
      title: "Close the cell gate",
      cue: "Turn the gate latch closed and confirm it seats before releasing the isolation.",
      why: "A gate that is not actually latched will not hold the interlock closed once the cell is back on power — confirming it now is what keeps the very next cycle from opening onto an unlatched fence with nobody around to notice until the arm is already moving.",
      turn: { turns: 0.4, axis: "y", label: "CELL GATE" },
    },
    {
      id: "cell-release", kind: "sequence", anyOrder: false,
      targets: ["cell-tag-remove", "cell-lock-remove", "controller-notify"],
      itemNames: { "cell-tag-remove": "remove the tag", "cell-lock-remove": "remove your lock", "controller-notify": "notify the cell controller" },
      title: "Release the cell",
      cue: "Remove the tag, remove your lock, then notify the cell controller — in that order, before the arm is re-energised.",
      why: "Removing the tag and the lock in the order they went on, and notifying the controller only once both are actually off, is what keeps the cell from being re-energised while anyone still believes it is locked out — reversing this order is how a restart happens on an assumption instead of a confirmation.",
      outOfOrderNote: "Tag off, then lock off, then the controller notified — notifying before both are physically off risks a restart onto a lock that has not actually been removed yet.",
    },
    {
      id: "proving-run", kind: "track", target: "proving-cycle", seconds: 8,
      title: "Run the proving cycle",
      cue: "Run the arm's slow-speed proving cycle from outside the fence, keeping its swing speed inside the safe band.",
      why: "A proving cycle run at reduced speed, watched the whole way through, is what confirms the cell is actually back to normal before it goes back to full production speed — skipping straight to full speed on the assumption that the maintenance fixed everything is how a problem that was almost caught gets caught for real the hard way.",
      track: {
        start: 0.3, green: [0.2, 0.55], rise: 0.35, fall: 0.4, drift: 0.12,
        label: "ARM SWING SPEED",
        readout: (v) => (v < 0.2 ? "too slow to prove the cycle" : v > 0.55 ? "too fast for a proving run" : "safe proving speed"),
      },
      holdBreakNote: "The proving-cycle speed left the safe band. Bring it back under control before trusting this cell at full speed.",
    },
    {
      id: "closing-log", kind: "select", target: "closing-log",
      title: "Sign the cell entry log",
      cue: "Sign the cell entry log before releasing the cell back to production.",
      why: "The signed log is the record that this specific entry, on this specific cell, actually followed the permit sequence — not assumed fine because the last entry usually goes this way, and not reconstructed from memory once the shift has already moved on to the next cell.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, PZ_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.8, 0.14, 6.4, 0, 0.07, 0, 0xffffff, { rough: 0.85 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6d7379", base2: "#5f656b", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.85, metal: 0.06, color: TW6_PAL.ground },
    );

    // ------------------------------------------------------------------ fence + gate
    for (const [fx, fz, ry] of [[-1.5, -2.4, 0], [1.5, -2.4, 0], [3.0, -1.2, Math.PI / 2], [3.0, 1.2, Math.PI / 2], [-3.0, -1.2, Math.PI / 2], [-3.0, 1.2, Math.PI / 2]]) {
      fencePanel(g, fx, 0.14, fz, { ry });
    }
    const gateAssembly = fencePanelGate(g, 0, 0.14, -2.4, { ry: 0 });
    const { gate: gateLeaf } = gateAssembly.userData.parts;
    reg(hits, gateLeaf, "cell-gate");
    holoTag(gateAssembly, "cell gate", 0, 2.2, 0, { css: "#7d5ba6", w: 0.3 });
    reg(hits, fencePanel(g, 2.2, 0.14, -2.4, { ry: 0 }), "intact-fence-panel");

    // ------------------------------------------------------------------ palletizer
    const palletizer = roboticPalletizer(g, 0, 0.14, 0.2, { ry: 0 });
    holoTag(palletizer, "palletizer PZ-2", 0, 3.1, 0, { css: "#7d5ba6", w: 0.34 });
    const { turret, turntable } = palletizer.userData.parts;
    reg(hits, turntable, "proving-cycle");

    const curtainPostL = group(g, -1.7, 0, -1.9);
    cyl(curtainPostL, 0.03, 0.03, 1.4, 0, 0.7, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 10 });
    const curtainLensL = box(curtainPostL, 0.06, 0.1, 0.02, 0, 1.3, 0, 0xd8c98a, { rough: 0.5, opacity: 0.6, transparent: true });
    reg(hits, curtainLensL, "curtain-taped-hazard");
    const curtainPostR = group(g, 1.7, 0, -1.9);
    cyl(curtainPostR, 0.03, 0.03, 1.4, 0, 0.7, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 10 });
    ball(curtainPostR, 0.03, 0, 1.3, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 1.0, rough: 0.4, seg: 10, seg2: 8 });

    const gateInterlock = group(gateAssembly, 1.5, 0.9, 0);
    ball(gateInterlock, 0.03, 0, 0, 0, 0x8a2020, { emissive: 0x000000, ei: 1, rough: 0.4, seg: 10, seg2: 8 });
    const zipTie = box(gateInterlock, 0.02, 0.06, 0.02, 0.05, 0, 0, 0xd8c98a, { rough: 0.6, opacity: 0.85, transparent: true });
    reg(hits, zipTie, "gate-defeated-hazard");

    const estop = group(g, -1.0, 0, -2.35, 0.2);
    cyl(estop, 0.05, 0.06, 0.12, 0, 1.0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 12 });
    ball(estop, 0.045, 0, 1.08, 0, 0xd2312b, { emissive: 0xc01810, ei: 1.2, rough: 0.4, seg: 12, seg2: 10 });
    holoTag(estop, "cell e-stop", 0, 1.3, 0, { css: "#7d5ba6", w: 0.3 });
    reg(hits, estop, "cell-estop");
    const estopCase = group(g, -1.0, 0, -2.05);
    box(estopCase, 0.3, 0.4, 0.3, 0, 0.2, 0, 0xc9a86b, { rough: 0.8, finish: "brushed" });
    reg(hits, estopCase, "estop-covered-hazard");

    const skipLever = box(g, 0.09, 0.06, 0.02, -1.6, 0.9, -2.35, 0xd2312b, { rough: 0.5 });
    decal(skipLever, 0.08, 0.05, 0, 0, 0.011, signFace("SKIP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    reg(hits, skipLever, "skip-permit-hazard");

    // ------------------------------------------------------------------ cell power
    const cellPanel = group(g, 2.0, 0, -1.0, -0.4);
    box(cellPanel, 0.5, 0.8, 0.28, 0, 0.5, 0, 0xd8d9d4, { rough: 0.5, finish: "painted" });
    holoTag(cellPanel, "cell power", 0, 0.95, 0, { css: "#7d5ba6", w: 0.32 });
    const cellIsolator = box(cellPanel, 0.05, 0.14, 0.03, -0.28, 0.5, 0.16, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    reg(hits, cellIsolator, "cell-isolator");
    const cellLockProp = group(cellPanel, -0.12, 0.3, 0.16);
    box(cellLockProp, 0.03, 0.04, 0.017, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    cyl(cellLockProp, 0.018, 0.018, 0.03, 0, 0.03, 0, 0xc0c6cc, { rough: 0.3, metal: 0.85, seg: 10 });
    reg(hits, cellLockProp, "cell-lock");
    const cellTagProp = group(cellPanel, 0.02, 0.3, 0.16);
    decal(cellTagProp, 0.05, 0.07, 0, 0, 0.006, signFace("TAG", { bg: "#f4e9d8", accent: "#b81410", scale: 0.6 }));
    reg(hits, cellTagProp, "cell-tag");
    const cellLockedTag = lockTag(cellPanel, -0.05, 0.3, 0.17, { ry: 0.2 });
    cellLockedTag.visible = false;
    reg(hits, cellLockedTag.children[2], "cell-tag-remove");
    reg(hits, cellLockedTag.children[1], "cell-lock-remove");

    const residualGauge = group(g, 2.0, 0, -0.5, -0.3);
    box(residualGauge, 0.14, 0.1, 0.03, 0, 0.85, 0, 0x0d1c24, { rough: 0.5 });
    holoTag(residualGauge, "residual motion", 0, 0.95, 0, { css: "#7d5ba6", w: 0.36 });
    reg(hits, residualGauge, "residual-motion-gauge");

    const armParkedMarker = group(g, 0, 0.14, 0.9);
    ball(armParkedMarker, 0.05, 0, 0.3, 0, 0x59c97b, { emissive: 0x2f7d4a, ei: 1.0, rough: 0.4, seg: 10, seg2: 8 });
    holoTag(armParkedMarker, "arm parked", 0, 0.5, 0, { css: "#7d5ba6", w: 0.32 });
    reg(hits, armParkedMarker, "arm-parked-marker");

    const jammedPallet = group(g, -0.6, 0.4, 0.9);
    box(jammedPallet, 0.32, 0.28, 0.24, 0, 0, 0, 0xc9a86b, { rough: 0.8, finish: "brushed" });
    reg(hits, jammedPallet, "jammed-pallet");
    const rejectArea = group(g, -2.2, 0.14, 1.6);
    hits["reject-area"] = rejectArea;

    // ------------------------------------------------------------------ PPE
    const ppeRack = group(g, -2.9, 0, -2.0, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, PZ_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#7d5ba6", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const earmuffProp = group(ppeRack, 0.2, 0.62, 0);
    torus(earmuffProp, 0.06, 0.015, 0, 0, 0, 0x2b2f34, { rough: 0.6 }).rotation.x = Math.PI / 2;
    holoTag(earmuffProp, "hearing protection", 0, 0.16, 0, { css: "#7d5ba6", w: 0.4 });
    reg(hits, earmuffProp, "hearing-protection");

    // ------------------------------------------------------------------ crew, boards
    const associate = standingFigure(g, -2.35, -1.5, { ry: 0.9, cloth: 0x2b3138, vest: TW6_PAL.accent, helmet: 0xf2f2f2 });
    holoTag(associate, "warehouse associate", 0, 1.95, 0.15, { css: "#7d5ba6", w: 0.36 });
    const controlsTechRadio = group(g, -2.1, 0, -2.1, 0.3);
    box(controlsTechRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(controlsTechRadio, "controls tech radio", 0, 1.35, 0, { css: "#7d5ba6", w: 0.38 });
    reg(hits, controlsTechRadio, "controls-tech-radio");
    const cellController = group(g, -1.8, 0, -2.6, 0.4);
    box(cellController, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(cellController, "cell controller", 0, 1.35, 0, { css: "#7d5ba6", w: 0.32 });
    reg(hits, cellController, "cell-controller");
    const controllerNotifyFlag = group(g, -1.6, 0, -2.8, 0.4);
    box(controllerNotifyFlag, 0.1, 0.16, 0.03, 0, 1.1, 0, 0x2f7d4a, { rough: 0.5, finish: "painted" });
    holoTag(controllerNotifyFlag, "notify controller", 0, 1.35, 0, { css: "#7d5ba6", w: 0.36 });
    reg(hits, controllerNotifyFlag, "controller-notify");

    const lead = standingFigure(g, 2.25, 1.65, { ry: -2.2, cloth: 0x37505f, vest: TW6_PAL.accent, helmet: 0xf2c14b });
    holoTag(lead, "shift lead", 0, 1.95, 0.15, { css: "#7d5ba6", w: 0.26 });

    const permitBoard = holoPanel(g, 0.58, 0.4, -2.7, 1.5, 2.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7d5ba6"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#c6b3d9";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("PERMIT TO ENTER · CELL 2", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CURTAIN + INTERLOCK FIRST", w * 0.06, h * 0.36);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["LOTO: per associate", "Proving run: reduced speed only"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.58 + i * 0.15)));
    }, { ry: 0.6, accent: PZ_ACCENT });
    reg(hits, permitBoard, "permit-board");

    const closingLog = group(g, 2.7, 0, -0.2, 0.5);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("CELL LOG\nOPEN", { bg: "#11181f", accent: "#7d5ba6", scale: 0.3 }), { px: 320 });
    holoTag(closingLog, "cell log", 0, 1.32, 0, { css: "#7d5ba6", w: 0.26 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ dressing
    palletStack(g, 2.6, 0, 2.5, { ry: -0.4 });
    palletStack(g, -2.6, 0, 2.6, { ry: 0.4 });

    return {
      hits,
      footprint: 2.8,

      onInterrupt(it) {
        if (it.id === "stored-energy-drift-fault") { turret.rotation.y = 0.08; }
        if (it.id === "auto-restart-signal-fault") { turret.rotation.y = -0.08; turntable.rotation.y += 0.3; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "stored-energy-drift-fault") { turret.rotation.y = 0; }
        if (it.id === "auto-restart-signal-fault") { turret.rotation.y = 0; }
      },
      onStepComplete(step) {
        if (step.id === "cell-hazard-read") {
          curtainLensL.material = mat(0x59c97b, { rough: 0.6, opacity: 0.3, transparent: true });
          zipTie.visible = false;
          estopCase.visible = false;
        }
        if (step.id === "gate-open") { gateLeaf.rotation.y = gateLeaf.userData.openAngle ?? 1.2; }
        if (step.id === "clear-jam") { jammedPallet.visible = false; }
        if (step.id === "gate-close") { gateLeaf.rotation.y = 0; }
        if (step.id === "cell-loto") { cellLockProp.visible = false; cellTagProp.visible = false; cellLockedTag.visible = true; }
        if (step.id === "cell-release") { cellLockedTag.visible = false; }
        if (step.id === "closing-log") {
          repaint(closingLogFace, signFace("CELL LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },

      animate(t, dt, session) {
        associate.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        lead.userData.head.rotation.y = Math.sin(t * 0.6 + 1) * 0.4;
        if (session?.step?.id === "proving-run" && session.holding) { turntable.rotation.y = t * 1.5; }
        void dt;
      },
    };
  },
};
