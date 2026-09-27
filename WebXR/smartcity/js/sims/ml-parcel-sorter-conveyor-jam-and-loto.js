import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import { conveyorSection } from "../../../shared/equipment.js";
import { palletRackBay, palletStack } from "../../../shared/props.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, lockTag,
  surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Parcel Sorter Conveyor Jam & LOTO VR — Manufacturing &
// Automation, APWU mail processing plant clerks. A parcel sorter's own
// divert gate jammed mid-cycle, worked the way the line's isolation
// sequence actually requires it: a defeated safety light curtain and a
// cardboard field patch found before either is trusted, a coworker's own
// loose drawstring read as a wrap-point risk before it becomes one, the
// drive isolated and locked at its own disconnect before the guard opens,
// residual motion checked, the stuck parcel pulled clear of the gate with a
// hand that never has to trust the belt's own restart timer, and the light
// curtain proven — not assumed — before the line runs again.
//
// No belt speed, throughput or motor rating this platform is certain of is
// stated — those live on the sorter's own manual and the plant's LOTO
// procedure for it.

const ML6_PAL = palette("postal");
const ML6_ACCENT = ML6_PAL.accent;

export const SIM_ML_PARCEL_SORTER_CONVEYOR_JAM_AND_LOTO = {
  id: "ml-parcel-sorter-conveyor-jam-and-loto",
  index: "ml-6",
  domain: "Postal & Mail Processing",
  trade: "Mail processing plant clerk — parcel sorter conveyor jam and lockout, APWU",
  category: "Manufacturing & Automation",
  indoor: "plant",
  certification: "OSHA 29 CFR 1910.147 the control of hazardous energy (lockout/tagout); OSHA 29 CFR 1910.212 general requirements for all machines, including presence-sensing safety devices; ASME B20.1 safety standard for conveyors and related equipment; NIOSH criteria on caught-in and entanglement injuries at unguarded conveyor lines; APWU training for mail processing plant clerks",
  name: "Parcel Sorter Conveyor Jam & LOTO",
  title: simTitle("Parcel Sorter Conveyor Jam & LOTO"),
  tagline: "A parcel sorter's divert gate jammed mid-cycle: a defeated light curtain and a cardboard field patch found before either is trusted, a coworker's own loose drawstring read as a wrap-point risk, the drive isolated and locked before the guard opens, residual motion checked, the stuck parcel cleared without reaching past a live gate, and the light curtain proven before the line runs again",
  accent: ML6_ACCENT,
  accentCss: `#${ML6_ACCENT.toString(16).padStart(6, "0")}`,
  parSeconds: 280,
  footprint: 2.8,
  badge: { id: "parcel-loto-certified", name: "Parcel Sorter LOTO Certified", note: "Isolated and locked the sorter before opening the guard, cleared the stuck parcel without reaching past a live gate, and proved the light curtain before trusting it again" },

  game: system({
    name: "Parcel Line Isolation",
    currency: "ISOLATION",
    ranks: ["Plant Clerk", "Jam Aware", "Isolation Handler", "Parcel Line Authority", "Parcel Sorter LOTO Certified"],
    badges: [
      { id: "clean-line-read", name: "Clean Line Read", note: "Every guarding defect found without a hint", test: AWARD.stepClean("machine-hazard-read") },
      { id: "wrap-point-caught", name: "Wrap Point Caught", note: "The coworker's loose drawstring flagged before it reached the belt", test: AWARD.stepClean("coworker-ppe-check") },
      { id: "curtain-proven", name: "Curtain Proven", note: "The light curtain was actually tested, not just trusted", test: AWARD.stepClean("sensor-test") },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "quick-clear", name: "Quick Clear", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "isolation-streak", name: "Isolation Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your APWU local's member assistance representative, or the plant's own employee assistance line",

  hazards: {
    "light-curtain-defeated-hazard": "The safety light curtain at the guard opening has been taped over so it reads clear no matter what actually breaks the beam. A defeated light curtain is a guard that looks like it is still doing its job right up until a hand crosses the opening and the line never stops for it.",
    "cardboard-guard-hazard": "A section of the belt's own guarding has been swapped for a taped-together patch of cardboard. Cardboard stops nothing — it is a guard-shaped placeholder that tells a passing clerk the opening is covered when it is not covered by anything that could actually stop a hand.",
    "stuck-divert-gate-hazard": "The divert gate is jammed half-open mid-cycle with a parcel wedged against its own hinge. A gate stuck like this can still swing the rest of its travel the instant whatever is holding it lets go, and a hand freeing the parcel by pushing the gate is a hand riding exactly that swing.",
    "loose-drawstring-hazard": "A coworker's hoodie drawstring is hanging loose within reach of the belt line. A drawstring, a loose glove cuff or a dangling ID lanyard near a moving belt is how a wrap-point injury starts — the belt does not need to be reached into for the belt to reach the clothing first.",
  },

  lateNotes: {
    "sorter-access-guard": "The guard opens only once the drive is isolated and locked, never as the first move toward the jam.",
    "stuck-parcel": "The parcel is cleared once the sorter is proven isolated, not on the strength of how still the gate looks.",
  },

  interrupts: [
    {
      id: "recirculating-parcel",
      kind: "Unreadable parcel keeps recirculating",
      after: "clear-stuck-gate", delay: 3, seconds: 12,
      alert: "The barcode scanner keeps alarming as an unreadable parcel loops back around the line instead of sorting, backing traffic up behind it.",
      cue: "Route it to the exception lane rather than reaching for it as it passes.",
      target: "exception-lane-button",
      why: "A parcel that will not scan is a parcel that keeps circulating until something is done about it, and reaching for a moving parcel on a live belt to solve that treats an active line the same as the isolated one this whole procedure has been protecting — the exception lane solves it without a hand ever going near the belt.",
      missNote: "The recirculating parcel was reached for on the live belt. The rest of the line was never isolated by anything this jam's lockout covered, and it was still moving the whole time.",
      wrongNote: "Not that — the recirculating parcel goes to the exception lane, not into anyone's hand.",
    },
    {
      id: "coworker-second-panel",
      kind: "A coworker starts to open a second panel",
      after: "sensor-test", delay: 3, seconds: 11,
      alert: "A coworker across the line has started to open a second access panel just as the restart begins.",
      cue: "Call out and stop them before the restart continues.",
      target: "coworker-call-out",
      why: "A restart in progress and a second panel opening on the same line at the same moment is exactly the kind of overlap the plant's own procedure exists to prevent — calling out now is what keeps one clerk's restart from becoming another clerk's surprise.",
      missNote: "The restart continued while the second panel was still opening. One clerk's isolation does not cover a panel somebody else on the line just decided to open.",
      wrongNote: "Not that — the coworker at the second panel gets called out to before this restart continues.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["safety-glasses", "snug-gloves"],
      itemNames: { "safety-glasses": "safety glasses", "snug-gloves": "snug-fitting gloves" },
      title: "Suit up before approaching the line",
      cue: "Safety glasses and snug-fitting gloves — nothing loose — before stepping up to the sorter.",
      why: "A parcel line runs packages and stretch-wrapped loads past head height in places, and gloves that fit snug rather than hang loose at the cuff are what keep a clerk's own PPE from becoming the first thing the belt actually catches.",
    },
    {
      id: "permit-read", kind: "select", target: "loto-permit-board",
      title: "Read the isolation permit",
      cue: "Confirm today's LOTO permit for this sorter before touching anything on it.",
      why: "The permit is what tells a clerk which disconnect actually isolates this section of the sorter and who else may already be locked onto it — clearing a jam without reading it first means guessing at a disconnect that might belong to an entirely different span of line.",
    },
    {
      id: "machine-hazard-read", kind: "find", noHint: true,
      targets: ["light-curtain-defeated-hazard", "cardboard-guard-hazard", "stuck-divert-gate-hazard"],
      itemNames: { "light-curtain-defeated-hazard": "the taped-over light curtain", "cardboard-guard-hazard": "the cardboard guard patch", "stuck-divert-gate-hazard": "the jammed divert gate" },
      itemNotes: {
        "light-curtain-defeated-hazard": "Taped over so it reads clear no matter what breaks the beam. It gets reported and freed before this guard is trusted at all.",
        "cardboard-guard-hazard": "A guard-shaped patch of cardboard where real guarding used to be. It gets replaced, not walked past.",
        "stuck-divert-gate-hazard": "Jammed half-open with a parcel wedged against its hinge. It gets isolated before it's ever pushed by hand.",
      },
      decoyNotes: { "intact-guard-decoy": "That guard panel is the OEM steel panel, seated and fastened. Nothing to flag there." },
      title: "Read the sorter for what is already wrong with it",
      cue: "Look over the line before touching it. Three things are already wrong with it — find them.",
      why: "A sorter that looks fine from the aisle is not the same thing as one a clerk has actually checked — a defeated light curtain, a cardboard patch or a gate already jammed each quietly removes a control the line depends on, and finding them now costs a work order instead of costing someone the moment a hand crosses an opening the guard was supposed to cover.",
    },
    {
      id: "coworker-ppe-check", kind: "find", noHint: true,
      targets: ["loose-drawstring-hazard"],
      itemNames: { "loose-drawstring-hazard": "the coworker's loose drawstring" },
      itemNotes: { "loose-drawstring-hazard": "Hanging loose within reach of the belt line. It gets tucked in or cut off before it gets anywhere near moving parts." },
      title: "Read the line for a wrap-point risk",
      cue: "Look over the coworker working the line beside you. One thing about their own PPE is already a wrap-point risk — find it.",
      why: "A conveyor line does not need a hand reached into it to cause a wrap-point injury — a drawstring, a loose cuff or a lanyard hanging near a moving belt is enough on its own, and it is exactly the kind of hazard that is easier to see on somebody else than to notice on yourself.",
    },
    {
      id: "main-disconnect-loto", kind: "sequence", anyOrder: false,
      targets: ["sorter-disconnect", "sorter-lock", "sorter-tag"],
      itemNames: { "sorter-disconnect": "sorter disconnect", "sorter-lock": "personal lock", "sorter-tag": "danger tag" },
      title: "Isolate and lock the sorter",
      cue: "Isolate the sorter at its disconnect, apply your own lock, then apply the tag — in that order.",
      why: "The disconnect alone can be closed again by anyone who does not know a hand is about to be inside the guard; the lock is what makes that impossible without that person's own key, and the tag is what tells the next clerk on the floor why the lock is there — skip any one of the three and the jam gets cleared on a promise instead of a proof.",
      outOfOrderNote: "Disconnect, then lock, then tag — a lock with nothing isolated behind it protects nobody, and a tag with no lock behind it is only a note.",
    },
    {
      id: "zero-energy-check", kind: "gauge", target: "residual-motion-indicator",
      title: "Check for residual motion",
      cue: "Read the sorter's residual motion indicator and commit only once it shows fully stopped.",
      why: "A divert gate that has just been isolated can still be coasting on its own spring return, and opening the guard on the assumption that isolated means stopped is exactly the gap a residual motion check exists to close — the indicator is the only honest answer, not how still the gate looks.",
      gauge: { label: "RESIDUAL MOTION", speed: 0.6, green: [0.0, 0.14], readout: (t) => (t > 0.14 ? "still coasting — do not open the guard" : "fully stopped"), missNote: "Committed while the gate was still coasting. The guard does not open until this reads fully stopped." },
    },
    {
      id: "guard-open", kind: "turn", target: "sorter-access-guard",
      title: "Open the access guard",
      cue: "Turn the guard latch to open it, now that the sorter is isolated and stopped.",
      why: "The guard is the last thing between a hand and the divert gate's own hinge, and opening it only after the sorter is proven isolated and stopped is what keeps this step from ever being the moment the line was still live.",
      turn: { turns: 0.4, axis: "x", label: "GUARD LATCH" },
    },
    {
      id: "clear-stuck-gate", kind: "drag", target: "stuck-parcel",
      title: "Clear the stuck parcel",
      cue: "Carry the wedged parcel clear of the divert gate to the reject bin.",
      why: "Clearing the parcel with the sorter isolated and the guard open means a hand never has to trust the gate's own spring to stay where it looks like it is — the parcel comes free because a hand pulled it, not because the gate happened to still be jammed when it did.",
      drag: { to: "reject-bin-socket", radius: 0.45, missNote: "Not into the reject bin — carry the parcel all the way clear of the gate before letting go." },
    },
    {
      id: "gate-inspect", kind: "select", target: "divert-gate",
      title: "Inspect the divert gate",
      cue: "Check the divert gate the parcel was wedged against for damage before closing the guard.",
      why: "A gate hinge that was strained by the jam will keep sticking on the next parcel that crosses it, and catching that now is a hinge repair on a scheduled work order, not a second jam an hour into the next shift.",
    },
    {
      id: "guard-close", kind: "turn", target: "sorter-access-guard",
      title: "Close and latch the guard",
      cue: "Turn the guard latch closed and confirm it seats before restoring power.",
      why: "A guard that is not actually latched is not a guard once the sorter is re-energised — confirming the latch now is what keeps this from being the jam that gets cleared safely and then reopened by the first vibration once the line is running again.",
      turn: { turns: 0.4, axis: "x", label: "GUARD LATCH" },
    },
    {
      id: "restore-power", kind: "sequence", anyOrder: false,
      targets: ["sorter-tag-remove", "sorter-lock-remove", "crew-notify"],
      itemNames: { "sorter-tag-remove": "remove the tag", "sorter-lock-remove": "remove your lock", "crew-notify": "notify the crew" },
      title: "Return the isolation",
      cue: "Remove the tag, remove your lock, then notify the crew — in that order, before the sorter is re-energised.",
      why: "The tag and the lock come off in the order they went on, and notifying the crew before restoring power is what keeps anyone else on the line from being surprised by a sorter that starts moving again — reversing this order is how somebody re-energises a machine while another clerk still believes it is locked out.",
      outOfOrderNote: "Tag off, then lock off, then the crew notified — restoring power before the crew knows is restoring it onto an assumption, not a confirmation.",
    },
    {
      id: "sensor-test", kind: "hold", target: "light-curtain-test", seconds: 8,
      title: "Prove the light curtain before trusting it",
      cue: "Hold your hand across the light curtain and confirm the power indicator drops before releasing it.",
      why: "A light curtain that was found taped over once is a light curtain worth proving rather than assumed fixed — holding a hand across it and watching for the power to actually drop is the difference between a guard trusted because it was repaired and one trusted because nobody checked.",
      holdBreakNote: "The hand was pulled back before the power indicator was confirmed to drop. The light curtain is proven by watching it work, not by how it looks once the tape is off.",
    },
    {
      id: "restart-tracking", kind: "track", target: "belt-return-roller", seconds: 8,
      title: "Bring the line back up to speed",
      cue: "Restart the drive while keeping the belt tracking indicator inside the centred band.",
      why: "Watching the tracking indicator through the restart is what catches a belt that is about to walk off true before it starts grinding against the frame — bringing a sorter back to speed is not just a power switch, it is confirming the belt is actually running where it is supposed to.",
      track: {
        start: 0.5, green: [0.38, 0.62], rise: 0.42, fall: 0.4, drift: 0.1,
        label: "BELT TRACKING",
        readout: (v) => (v < 0.38 ? "drifting toward the near frame" : v > 0.62 ? "drifting toward the far frame" : "tracking centred"),
      },
      holdBreakNote: "The belt drifted out of the centred band. Bring the tracking back under control before continuing the restart.",
    },
    {
      id: "closing-log", kind: "select", target: "maintenance-log",
      title: "Log the jam, the defects and the fix",
      cue: "Log the jam, the light curtain repair, the cardboard patch and the restart before moving on.",
      why: "The maintenance log is what turns one cleared jam and one taped-over light curtain into a pattern the plant's own maintenance team can actually see — found but never logged is a recurring guarding failure nobody upstream ever gets the chance to fix for good.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.8, ML6_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.6, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.86 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#5c6266", base2: "#4f5559", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.86, metal: 0.06, color: ML6_PAL.ground },
    );
    for (const sx of [-1.5, 1.5]) box(g, 0.06, 0.007, 5.4, sx, 0.148, 0, ML6_PAL.trim, { rough: 0.6, cast: false });

    // ------------------------------------------------------------------ conveyor line
    const belts = [];
    for (let i = -2; i <= 1; i++) belts.push(conveyorSection(g, 0, 0.14, i * 1.2, { ry: Math.PI / 2, colour: 0x4a5560 }));
    const gateSection = belts[1];
    const { guard, rollers } = gateSection.userData.parts;
    reg2(guard, "sorter-access-guard");
    holoTag(gateSection, "sorter line 9", 0, 1.1, 0, { css: "#2f6fb0", w: 0.34 });
    void rollers;

    // Light curtain, taped over.
    const curtainPost = group(gateSection, 0.29, 0, 0.3);
    cyl(curtainPost, 0.02, 0.02, 1.0, 0, 0.5, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 8 });
    const curtainTape = box(curtainPost, 0.05, 0.05, 0.02, 0, 0.9, 0, 0xd8c98a, { rough: 0.7 });
    reg2(curtainTape, "light-curtain-defeated-hazard");
    const lightCurtainTest = group(gateSection, -0.29, 0.5, 0.3);
    box(lightCurtainTest, 0.03, 0.5, 0.02, 0, 0, 0, 0x2f6fb0, { emissive: 0x2f6fb0, ei: 0.5, rough: 0.4, transparent: true, opacity: 0.4 });
    reg2(lightCurtainTest, "light-curtain-test");

    // Cardboard guard patch on the neighbouring section, and the intact decoy.
    const cardboardPatch = box(belts[0], 0.5, 0.24, 0.02, 0, 0.55, 0.5, 0xc9a86b, { rough: 0.9 });
    reg2(cardboardPatch, "cardboard-guard-hazard");
    const intactPanel = box(belts[2], 0.5, 0.24, 0.02, 0, 0.55, 0.5, 0x9aa1a6, { rough: 0.5, metal: 0.3 });
    reg2(intactPanel, "intact-guard-decoy");

    // The divert gate, jammed with a stuck parcel wedged in it.
    const divertGate = group(gateSection, 0, 0.4, -0.35);
    box(divertGate, 0.5, 0.3, 0.03, 0, 0, 0, 0x8a8f95, { rough: 0.4, metal: 0.5 });
    divertGate.rotation.y = 0.5;
    reg2(divertGate, "stuck-divert-gate-hazard");
    // A second, invisible marker on the same gate for the later inspect
    // step — reg() twice on one object would overwrite the first hitId.
    const divertGateInspectTarget = group(divertGate, 0, 0.02, 0);
    reg2(divertGateInspectTarget, "divert-gate");
    const stuckParcel = group(g, 0, 0.4, -1.2);
    box(stuckParcel, 0.3, 0.22, 0.22, 0, 0, 0, 0xc9a86b, { rough: 0.8, finish: "brushed" });
    stuckParcel.rotation.y = 0.3;
    reg2(stuckParcel, "stuck-parcel");

    const beltReturnRoller = group(gateSection, 0, 0.1, -0.55);
    cyl(beltReturnRoller, 0.05, 0.05, 0.55, 0, 0, 0, 0x6d7379, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    reg2(beltReturnRoller, "belt-return-roller");

    const rejectBin = group(g, 2.4, 0, -2.2, -0.4);
    box(rejectBin, 0.7, 0.6, 0.7, 0, 0.3, 0, 0x2b3138, { rough: 0.7 });
    holoTag(rejectBin, "reject bin", 0, 1.0, 0, { css: "#2f6fb0", w: 0.3 });
    hits["reject-bin-socket"] = group(g, 2.4, 0.14, -2.2);

    // Barcode scanner for the recirculating-parcel interrupt.
    const scanner = group(g, -1.6, 0, -1.2, 0.4);
    box(scanner, 0.3, 0.2, 0.2, 0, 1.0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const scannerLight = ball(scanner, 0.04, 0, 1.15, 0.12, 0xd2312b, { emissive: 0xd2312b, ei: 1.2, rough: 0.4, seg: 10, seg2: 8 });
    void scannerLight;
    const exceptionButton = box(scanner, 0.09, 0.06, 0.02, 0, 0.85, 0.12, 0xf2c14b, { rough: 0.5 });
    reg2(exceptionButton, "exception-lane-button");

    // ------------------------------------------------------------------ drive isolation
    const drivePanel = group(g, 1.6, 0, -1.0, -0.3);
    box(drivePanel, 0.5, 0.8, 0.28, 0, 0.5, 0, 0xd8d9d4, { rough: 0.5, finish: "painted" });
    holoTag(drivePanel, "drive disconnect", 0, 0.95, 0, { css: "#2f6fb0", w: 0.36 });
    const disconnectHandle = box(drivePanel, 0.05, 0.14, 0.03, -0.28, 0.5, 0.16, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    reg2(disconnectHandle, "sorter-disconnect");
    const sorterLockProp = group(drivePanel, -0.12, 0.3, 0.16);
    box(sorterLockProp, 0.03, 0.04, 0.017, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    cyl(sorterLockProp, 0.018, 0.018, 0.03, 0, 0.03, 0, 0xc0c6cc, { rough: 0.3, metal: 0.85, seg: 10 });
    reg2(sorterLockProp, "sorter-lock");
    const sorterTagProp = group(drivePanel, 0.02, 0.3, 0.16);
    decal(sorterTagProp, 0.05, 0.07, 0, 0, 0.006, signFace("TAG", { bg: "#f4e9d8", accent: "#b81410", scale: 0.6 }));
    reg2(sorterTagProp, "sorter-tag");
    const sorterLockedTag = lockTag(drivePanel, -0.05, 0.3, 0.17, { ry: 0.2 });
    sorterLockedTag.visible = false;
    reg2(sorterLockedTag.children[2], "sorter-tag-remove");
    reg2(sorterLockedTag.children[1], "sorter-lock-remove");

    const motionIndicator = group(g, 1.6, 0, -0.55, -0.3);
    box(motionIndicator, 0.14, 0.1, 0.03, 0, 0.75, 0, 0x0d1c24, { rough: 0.5 });
    holoTag(motionIndicator, "motion indicator", 0, 0.85, 0, { css: "#2f6fb0", w: 0.34 });
    reg2(motionIndicator, "residual-motion-indicator");

    // ------------------------------------------------------------------ PPE, coworker
    const ppeRack = group(g, -2.9, 0, 2.3, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const glassesProp = group(ppeRack, 0.2, 0.6, 0);
    box(glassesProp, 0.1, 0.03, 0.03, 0, 0, 0, 0x1c1e21, { rough: 0.4, metal: 0.3 });
    holoTag(glassesProp, "safety glasses", 0, 0.15, 0, { css: "#2f6fb0", w: 0.32 });
    reg2(glassesProp, "safety-glasses");
    const glovesProp = group(ppeRack, 0.2, 0.6, 0.2);
    box(glovesProp, 0.1, 0.03, 0.06, 0, 0, 0, 0xd8c14b, { rough: 0.8 });
    holoTag(glovesProp, "snug gloves", 0, 0.15, 0, { css: "#2f6fb0", w: 0.3 });
    reg2(glovesProp, "snug-gloves");

    const coworker = standingFigure(g, -1.5, 1.8, { ry: 1.2, cloth: 0x37505f, vest: ML6_PAL.accent });
    holoTag(coworker, "coworker", 0, 1.95, 0.15, { css: "#2f6fb0", w: 0.26 });
    const drawstring = cyl(coworker, 0.008, 0.008, 0.3, 0.15, 1.3, 0.1, 0xf2c14b, { rough: 0.6, seg: 6 });
    reg2(drawstring, "loose-drawstring-hazard");

    const coworkerCallOut = group(g, 2.5, 0, 0.9, 0.3);
    box(coworkerCallOut, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(coworkerCallOut, "call out", 0, 1.35, 0, { css: "#2f6fb0", w: 0.28 });
    reg2(coworkerCallOut, "coworker-call-out");
    const secondPanelWorker = standingFigure(g, 3.0, -2.0, { ry: -1.2, cloth: 0x2b3138, vest: ML6_PAL.trim });
    void secondPanelWorker;

    const crewNotifyPost = group(g, -2.5, 0, 0.9, -0.3);
    box(crewNotifyPost, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(crewNotifyPost, "notify crew", 0, 1.35, 0, { css: "#2f6fb0", w: 0.32 });
    reg2(crewNotifyPost, "crew-notify");

    // ------------------------------------------------------------------ dressing, boards
    const downstreamRack = palletRackBay(g, -2.9, 0.14, 1.4, { ry: Math.PI / 2 });
    holoTag(downstreamRack, "staging rack", 0, 4.4, 0, { css: "#2f6fb0", w: 0.34 });
    palletStack(g, 2.8, 0, 2.3, { ry: -0.3 });

    const permitBoard = holoPanel(g, 0.58, 0.4, -2.7, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f6fb0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#c9b98f";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LOTO PERMIT · SORTER 9", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("ISOLATE BEFORE OPENING", w * 0.06, h * 0.36);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Disconnect: drive panel, sorter 9", "Lock + tag: per clerk"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.58 + i * 0.15)));
    }, { ry: 0.5, accent: ML6_ACCENT });
    reg2(permitBoard, "loto-permit-board");

    const maintLog = group(g, 2.7, 0, -0.4, 0.5);
    box(maintLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const maintLogFace = decal(maintLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("MAINTENANCE LOG\nOPEN", { bg: "#11181f", accent: "#2f6fb0", scale: 0.26 }), { px: 320 });
    holoTag(maintLog, "maintenance log", 0, 1.32, 0, { css: "#2f6fb0", w: 0.34 });
    reg2(maintLog, "maintenance-log");

    return {
      hits,
      footprint: 2.8,

      onInterrupt(it) {
        if (it.id === "recirculating-parcel") { scannerLight.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.4, rough: 0.4 }); }
        if (it.id === "coworker-second-panel") { secondPanelWorker.rotation.y = 0.6; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "recirculating-parcel") { scannerLight.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.2, rough: 0.4 }); }
        if (it.id === "coworker-second-panel") { secondPanelWorker.rotation.y = -1.2; }
      },
      onStepComplete(step) {
        if (step.id === "machine-hazard-read") {
          curtainTape.material = mat(0x59c97b, { rough: 0.6 });
          cardboardPatch.material = mat(0x9aa1a6, { rough: 0.5, metal: 0.3 });
        }
        if (step.id === "coworker-ppe-check") { drawstring.visible = false; }
        if (step.id === "guard-open") { guard.rotation.x = -0.9; }
        if (step.id === "guard-close") { guard.rotation.x = 0; }
        if (step.id === "clear-stuck-gate") { stuckParcel.visible = false; divertGate.rotation.y = 0; }
        if (step.id === "main-disconnect-loto") { sorterLockProp.visible = false; sorterTagProp.visible = false; sorterLockedTag.visible = true; }
        if (step.id === "restore-power") { sorterLockedTag.visible = false; }
        if (step.id === "closing-log") {
          repaint(maintLogFace, signFace("MAINTENANCE LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
        }
      },

      animate(t, dt, session) {
        coworker.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        void session; void dt;
      },
    };
  },
};
