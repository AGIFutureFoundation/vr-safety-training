import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, lockTag,
  surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { conveyorSection } from "../../../shared/equipment.js";
import { dumpster, palletRackBay, palletStack } from "../../../shared/props.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Conveyor Jam Clearing & LOTO VR — Manufacturing & Automation,
// Teamsters warehouse and logistics automation.
//
// A jammed carton on a live roller line looks like the kind of thing a hand
// can just reach in and pull free — right up until the drive re-engages on
// its own timer or somebody downstream bumps the restart button. This
// station walks the line's own isolation sequence before any hand goes near
// the rollers: the pull-cord tried first, the drive isolated and locked out
// at its own disconnect, the residual motion actually checked rather than
// assumed stopped, the jam cleared with the guard open and a hand that
// never has to trust the line's own timer, and the guard closed and the
// isolation returned only once the line is proven clear all the way down.
// No conveyor's horsepower, belt speed or drive amperage is a number this
// platform is certain of — those live on the line's own manual and the
// site's LOTO procedure for it.

const TW2_PAL = palette("warehouse");
const CJ_ACCENT = 0xd89a1c;

export const SIM_TW_CONVEYOR_JAM_CLEARING_AND_LOTO = {
  id: "tw-conveyor-jam-clearing-and-loto",
  index: "tw-2",
  domain: "Warehousing & Logistics",
  trade: "Teamsters warehouse associate — conveyor line clearing",
  category: "Manufacturing & Automation",
  indoor: "plant",
  certification: "Teamsters warehouse and logistics automation training; OSHA 29 CFR 1910.147 the control of hazardous energy, 29 CFR 1910.212 machine guarding and 29 CFR 1910.178 powered industrial trucks for the lift truck staged at the line's end; ASME B20.1 safety standard for conveyors and related equipment; NIOSH findings on caught-in injuries at unguarded nip points",
  name: "Conveyor Jam Clearing & LOTO",
  title: simTitle("Conveyor Jam Clearing & LOTO"),
  tagline: "Clearing a jammed carton off a live roller line the way the line's own isolation sequence requires it: the pull-cord tried first, the drive isolated and locked at its own disconnect, the residual motion actually checked, the jam cleared with a hand that never has to trust the line's timer, and the guard and the isolation both returned before the belt sees power again",
  accent: CJ_ACCENT,
  accentCss: "#d89a1c",
  parSeconds: 265,
  footprint: 2.7,
  badge: { id: "conveyor-loto-certified", name: "Conveyor LOTO Certified", note: "Isolated and locked the drive before opening the guard, cleared the jam without reaching past a live nip point, and proved the line clear before restoring power" },

  game: system({
    name: "Line Isolation",
    currency: "ISOLATION",
    ranks: ["Line Hand", "Jam Aware", "Isolation Handler", "Line Isolation Authority", "Conveyor LOTO Certified"],
    badges: [
      { id: "cord-first", name: "Cord First", note: "Pulled the local E-stop before ever reaching toward the jam", test: AWARD.stepClean("pull-cord") },
      { id: "locked-before-opened", name: "Locked Before Opened", note: "Isolated and locked the drive before the guard ever opened", test: AWARD.stepClean("drive-loto") },
      { id: "steady-restart", name: "Steady Restart", note: "Held belt tracking near band centre through the whole restart", test: AWARD.precise(0.72) },
      { id: "clean-line-read", name: "Clean Line Read", note: "Never missed a hazard on the line read", test: AWARD.stepClean("line-hazard-read") },
    ],
    challenges: [
      { id: "quick-clear", name: "Quick Clear", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "isolation-streak", name: "Isolation Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your Teamsters local's member assistance programme, or the site's employee assistance line if a close call at a conveyor nip point is what stayed with you",

  hazards: {
    "tied-cord-hazard": "That pull-cord is zip-tied off to the frame, out of reach of anyone who actually needs to stop this line in a hurry. A pull-cord that cannot be pulled is a line that only stops when somebody reaches the panel across the room — every second between those two things is a second the belt keeps running over whatever just got caught in it.",
    "missing-guard-hazard": "That nip-point guard is propped open with a block of wood instead of latched — someone left themselves a shortcut back into the pinch point instead of relatching it. A guard that is not actually closed is not actually a guard; it is a suggestion the next pair of hands past it has no reason to notice.",
    "skip-loto-hazard": "That is the quick-restart lever that skips isolating and locking the drive before the guard opens. A drive that looks stopped because the belt is not moving right now can still restart on its own control logic the moment something downstream calls for product — the isolator and the lock are what make 'stopped' provable instead of hoped for.",
    "reach-in-running-hazard": "That is the shortcut habit of reaching straight into a running nip point to walk a jam free by hand instead of stopping the line first. A roller does not know the difference between a jammed carton and the fingers pulling it loose, and it will draw either one in exactly the same way once contact is made.",
  },

  lateNotes: {
    "estop-cord": "The pull-cord gets tried before a hand goes anywhere near the jam, not after someone is already reaching into the rollers.",
    "guard-latch": "The guard only opens once the drive is isolated and locked, never as the first move toward a jam.",
  },

  interrupts: [
    {
      id: "belt-drift-fault",
      kind: "Belt tracking drift",
      after: "restart-tracking", delay: 3, seconds: 12,
      alert: "The belt has visibly drifted off-centre on the return roller mid-restart, rubbing against the frame.",
      cue: "Stop the restart and call it in to the mechanic rather than nudging the belt back by hand while it runs.",
      target: "mechanic-radio",
      why: "A belt that drifts this early in a restart is a tracking problem that gets worse under load, not better on its own, and a hand used to nudge a moving belt back into line is a hand working exactly at the nip point the guard exists to keep it away from — calling the mechanic is what gets the idler adjusted instead of guessed at.",
      missNote: "The drifting belt was left to run. A belt rubbing the frame wears through a cover fast, and the habit of nudging it back by hand is how a caught-in injury actually starts.",
      wrongNote: "Not that — the drifting belt goes to the mechanic before this restart continues.",
    },
    {
      id: "second-jam-fault",
      kind: "Second jam downstream",
      after: "clear-jam", delay: 4, seconds: 13,
      alert: "A second carton has jammed at the transfer point further down the line while the first is still being cleared.",
      cue: "Report the second jam to the line lead. Do not reach into it until it has its own isolation.",
      target: "lead-report",
      why: "A second jam is a second hazard with its own nip point, not an extension of the one already isolated — reaching into it on the strength of the first jam's lockout treats one isolation as if it covered a machine section it was never applied to.",
      missNote: "The second jam was reached into without its own isolation. One locked-out point does not make the next pinch point down the line safe to reach into.",
      wrongNote: "Not that — the second jam gets reported to the line lead, not cleared on the first jam's isolation.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "safety-glasses"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "safety-glasses": "safety glasses" },
      title: "Suit up before approaching the line",
      cue: "Hi-vis vest and safety glasses before stepping up to the conveyor.",
      why: "The line runs cartons and stretch-wrapped loads past head height in places, and the glasses are what keeps a dropped strap end or a kicked-up sliver of packing tape out of an eye while both hands are busy with the jam.",
    },
    {
      id: "permit-read", kind: "select", target: "loto-board",
      title: "Read the isolation permit",
      cue: "Confirm today's LOTO permit for this line before touching anything on it.",
      why: "The permit is what tells an associate which disconnect actually isolates this section of line and who else may already be locked onto it — clearing a jam without reading it first means guessing at a disconnect that might belong to a completely different span of conveyor.",
    },
    {
      id: "line-hazard-read", kind: "find", noHint: true,
      targets: ["tied-cord-hazard", "missing-guard-hazard", "reach-in-running-hazard"],
      itemNames: {
        "tied-cord-hazard": "pull-cord zip-tied off",
        "missing-guard-hazard": "nip-point guard propped open",
        "reach-in-running-hazard": "reach-in shortcut lever",
      },
      itemNotes: {
        "tied-cord-hazard": "A pull-cord that cannot be pulled stops nothing — the tie comes off before this line is trusted at all.",
        "missing-guard-hazard": "A guard propped open with a block is a guard that is not doing its job — it gets closed and latched, not left as somebody's shortcut.",
        "reach-in-running-hazard": "A lever built to let a hand reach a running nip point has no honest use — it gets reported and removed, not exercised.",
      },
      decoyNotes: {
        "intact-idler-guard": "That idler guard is seated and latched, showing no damage. Nothing to flag there.",
      },
      title: "Read the line for what is already wrong with it",
      cue: "Look over the line before touching it. Three things are already wrong with it — find them.",
      why: "A line that looks fine from the aisle is not the same thing as one an associate has actually checked — a tied-off cord, a propped guard or a reach-in shortcut each quietly removes a control the line depends on, and finding them now costs a work order instead of costing someone the moment the belt restarts on its own.",
    },
    {
      id: "pull-cord", kind: "select", target: "estop-cord",
      title: "Pull the local E-stop",
      cue: "Pull the local E-stop cord before reaching anywhere near the jam.",
      why: "The pull-cord is the fastest stop this line has, reachable from right where the jam actually is — trying it first, before the slower walk to isolate and lock the drive, is what keeps the belt from moving again the instant a hand gets close to the jam.",
    },
    {
      id: "drive-loto", kind: "sequence", anyOrder: false,
      targets: ["drive-disconnect", "drive-lock", "drive-tag"],
      itemNames: { "drive-disconnect": "drive disconnect", "drive-lock": "personal lock", "drive-tag": "danger tag" },
      title: "Isolate and lock the drive",
      cue: "Isolate the drive at its disconnect, apply your own lock, then apply the tag — in that order.",
      why: "The disconnect alone can be closed again by anyone who does not know a hand is about to be inside the guard; the lock is what makes that impossible without that person's own key, and the tag is what tells the next associate walking the line why the lock is there — skip any one of the three and the jam gets cleared on a promise instead of a proof.",
      outOfOrderNote: "Disconnect, then lock, then tag — a lock with nothing isolated behind it protects nobody, and a tag with no lock behind it is only a note.",
    },
    {
      id: "zero-energy-check", kind: "gauge", target: "motion-indicator",
      title: "Check for residual motion",
      cue: "Read the drive's residual motion indicator and commit only once it shows fully stopped.",
      why: "A drive that has just been isolated can still be coasting down under its own momentum, and reaching into the guard on the assumption that isolated means stopped is exactly the gap a residual motion check exists to close — the indicator is the only honest answer, not how quiet the belt sounds.",
      gauge: {
        label: "RESIDUAL MOTION", speed: 0.6, green: [0.0, 0.14],
        readout: (t) => (t > 0.14 ? "still coasting — do not open the guard" : "fully stopped"),
        missNote: "Committed while the drive was still coasting. The guard does not open until this reads fully stopped.",
      },
    },
    {
      id: "guard-open", kind: "turn", target: "guard-latch",
      title: "Open the nip-point guard",
      cue: "Turn the guard latch to open it, now that the drive is isolated and stopped.",
      why: "The guard is the last thing between a hand and the nip point, and opening it only after the drive is proven isolated and stopped is what keeps this step from ever being the moment the line was still live.",
      turn: { turns: 0.4, axis: "x", label: "GUARD LATCH" },
    },
    {
      id: "clear-jam", kind: "drag", target: "jammed-carton",
      title: "Clear the jam",
      cue: "Carry the jammed carton clear of the rollers to the reject bin.",
      why: "Clearing the carton with the drive isolated and the guard open means a hand never has to trust the line's own restart timer while it is inside the nip point — the carton comes free because a hand pulled it, not because the belt happened to still be stopped when it did.",
      drag: { to: "reject-bin-socket", radius: 0.45, missNote: "Not into the reject bin — carry the carton all the way clear of the rollers before letting go." },
    },
    {
      id: "roller-inspect", kind: "select", target: "roller-bank",
      title: "Inspect the rollers",
      cue: "Check the rollers the jam was wedged against for damage before closing the guard.",
      why: "A roller that was scored or dented by the jam will keep snagging the next carton that crosses it — catching that now is a roller swap on a scheduled repair ticket, not a second jam an hour into the next shift.",
    },
    {
      id: "guard-close", kind: "turn", target: "guard-latch",
      title: "Close and latch the guard",
      cue: "Turn the guard latch closed and confirm it seats before restoring power.",
      why: "A guard that is not actually latched is not a guard once the drive is re-energised — confirming the latch now is what keeps this from being the jam that gets cleared safely and then reopened by the first vibration once the belt is running again.",
      turn: { turns: 0.4, axis: "x", label: "GUARD LATCH" },
    },
    {
      id: "restore-power", kind: "sequence", anyOrder: false,
      targets: ["drive-tag-remove", "drive-lock-remove", "crew-notify"],
      itemNames: { "drive-tag-remove": "remove the tag", "drive-lock-remove": "remove your lock", "crew-notify": "notify the crew" },
      title: "Return the isolation",
      cue: "Remove the tag, remove your lock, then notify the crew — in that order, before the drive is re-energised.",
      why: "The tag and the lock come off in the order they went on, and notifying the crew before restoring power is what keeps anyone else on the line from being surprised by a belt that starts moving again — reversing this order is how somebody re-energises a drive while another associate still believes it is locked out.",
      outOfOrderNote: "Tag off, then lock off, then the crew notified — restoring power before the crew knows is restoring it onto an assumption, not a confirmation.",
    },
    {
      id: "restart-tracking", kind: "track", target: "belt-return-roller", seconds: 8,
      title: "Bring the line back up to speed",
      cue: "Restart the drive while keeping the belt tracking indicator inside the centred band.",
      why: "Watching the tracking indicator through the restart is what catches a belt that is about to walk off true before it starts grinding against the frame — bringing a conveyor back to speed is not just a power switch, it is confirming the belt is actually running where it is supposed to.",
      track: {
        start: 0.5, green: [0.38, 0.62], rise: 0.42, fall: 0.4, drift: 0.1,
        label: "BELT TRACKING",
        readout: (v) => (v < 0.38 ? "drifting toward the near frame" : v > 0.62 ? "drifting toward the far frame" : "tracking centred"),
      },
      holdBreakNote: "The belt drifted out of the centred band. Bring the tracking back under control before continuing the restart.",
    },
    {
      id: "closing-log", kind: "select", target: "maintenance-log",
      title: "Log the jam and the restart",
      cue: "Log the jam, the isolation and the restart before moving on to the next task.",
      why: "The maintenance log is what turns one cleared jam into a pattern a mechanic can actually see — a jam that gets cleared but never logged is a recurring roller problem that nobody upstream ever gets the chance to fix.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, CJ_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.6, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.86 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6d7379", base2: "#5f656b", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.86, metal: 0.06, color: TW2_PAL.ground },
    );
    for (const sx of [-1.5, 1.5]) box(g, 0.06, 0.007, 5.4, sx, 0.148, 0, TW2_PAL.trim, { rough: 0.6, cast: false });

    // ------------------------------------------------------------------ conveyor line
    const belts = [];
    for (let i = -2; i <= 1; i++) {
      const c = conveyorSection(g, 0, 0.14, i * 1.2, { ry: Math.PI / 2, colour: 0x4a5560 });
      belts.push(c);
    }
    const jamSection = belts[1];
    const { guard, rollers } = jamSection.userData.parts;
    reg(hits, guard, "guard-latch");
    holoTag(jamSection, "conveyor line 3", 0, 1.1, 0, { css: "#d89a1c", w: 0.34 });

    // Zip-tied pull-cord hazard on the jam section's own cord.
    const tiedCord = group(jamSection, 0.29, 0.5, 0.3);
    box(tiedCord, 0.03, 0.015, 0.03, 0, 0, 0, 0xd8c98a, { rough: 0.6 });
    reg(hits, tiedCord, "tied-cord-hazard");
    const estopCord = group(jamSection, -0.29, 0.5, 0);
    box(estopCord, 0.05, 0.05, 0.05, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    reg(hits, estopCord, "estop-cord");

    // Propped-open guard hazard on the neighbouring section.
    const proppedGuard = belts[0].userData.parts.guard;
    proppedGuard.rotation.x = -0.5;
    reg(hits, proppedGuard, "missing-guard-hazard");
    const intactGuard = belts[2].userData.parts.guard;
    reg(hits, intactGuard, "intact-idler-guard");

    const reachInLever = box(g, 0.09, 0.06, 0.02, 0.9, 0.85, -1.2, 0xd2312b, { rough: 0.5 });
    decal(reachInLever, 0.08, 0.05, 0, 0, 0.011, signFace("REACH", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.5 }));
    reg(hits, reachInLever, "reach-in-running-hazard");

    // ------------------------------------------------------------------ drive isolation
    const drivePanel = group(g, 1.6, 0, -1.0, -0.3);
    box(drivePanel, 0.5, 0.8, 0.28, 0, 0.5, 0, 0xd8d9d4, { rough: 0.5, finish: "painted" });
    holoTag(drivePanel, "drive disconnect", 0, 0.95, 0, { css: "#d89a1c", w: 0.36 });
    const disconnectHandle = box(drivePanel, 0.05, 0.14, 0.03, -0.28, 0.5, 0.16, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    reg(hits, disconnectHandle, "drive-disconnect");
    const driveLockProp = group(drivePanel, -0.12, 0.3, 0.16);
    box(driveLockProp, 0.03, 0.04, 0.017, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    cyl(driveLockProp, 0.018, 0.018, 0.03, 0, 0.03, 0, 0xc0c6cc, { rough: 0.3, metal: 0.85, seg: 10 });
    reg(hits, driveLockProp, "drive-lock");
    const driveTagProp = group(drivePanel, 0.02, 0.3, 0.16);
    decal(driveTagProp, 0.05, 0.07, 0, 0, 0.006, signFace("TAG", { bg: "#f4e9d8", accent: "#b81410", scale: 0.6 }));
    reg(hits, driveTagProp, "drive-tag");
    const driveLockedTag = lockTag(drivePanel, -0.05, 0.3, 0.17, { ry: 0.2 });
    driveLockedTag.visible = false;
    reg(hits, driveLockedTag.children[2], "drive-tag-remove");
    reg(hits, driveLockedTag.children[1], "drive-lock-remove");

    const skipLever = box(drivePanel, 0.09, 0.06, 0.02, 0.24, 0.75, 0.16, 0xd2312b, { rough: 0.5 });
    decal(skipLever, 0.08, 0.05, 0, 0, 0.011, signFace("SKIP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    reg(hits, skipLever, "skip-loto-hazard");

    const motionIndicator = group(g, 1.6, 0, -0.55, -0.3);
    box(motionIndicator, 0.14, 0.1, 0.03, 0, 0.75, 0, 0x0d1c24, { rough: 0.5 });
    holoTag(motionIndicator, "motion indicator", 0, 0.85, 0, { css: "#d89a1c", w: 0.34 });
    reg(hits, motionIndicator, "motion-indicator");

    // ------------------------------------------------------------------ jam + rollers
    const jammedCarton = group(g, 0, 0.4, -1.2);
    box(jammedCarton, 0.32, 0.28, 0.24, 0, 0, 0, 0xc9a86b, { rough: 0.8, finish: "brushed" });
    jammedCarton.rotation.y = 0.3;
    reg(hits, jammedCarton, "jammed-carton");

    const rollerBank = group(g, 0, 0.4, -1.5);
    cyl(rollerBank, 0.045, 0.045, 0.5, 0, 0, 0, 0x9aa2a8, { rough: 0.35, metal: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    reg(hits, rollerBank, "roller-bank");
    const beltReturnRoller = group(jamSection, 0, 0.1, -0.55);
    cyl(beltReturnRoller, 0.05, 0.05, 0.55, 0, 0, 0, 0x6d7379, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    reg(hits, beltReturnRoller, "belt-return-roller");
    void rollers;

    const rejectBin = dumpster(g, 2.4, 0, -2.2, { ry: -0.4 });
    holoTag(rejectBin, "reject bin", 0, 1.6, 0, { css: "#d89a1c", w: 0.3 });
    const rejectSocket = group(g, 2.4, 0.14, -2.2);
    hits["reject-bin-socket"] = rejectSocket;

    // Second jam downstream, staged hidden until the interrupt fires.
    const secondJam = group(g, 0, 0.4, 1.6);
    box(secondJam, 0.3, 0.26, 0.22, 0, 0, 0, 0xc9a86b, { rough: 0.8, finish: "brushed" });
    secondJam.visible = false;
    const secondJamFlag = ball(secondJam, 0.05, 0, 0.3, 0, 0xd2312b, { emissive: 0xc01810, ei: 1.3, rough: 0.4, seg: 12, seg2: 10 });

    // ------------------------------------------------------------------ PPE
    const ppeRack = group(g, -2.9, 0, 2.3, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, CJ_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#d89a1c", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const glassesProp = group(ppeRack, 0.2, 0.6, 0);
    box(glassesProp, 0.1, 0.03, 0.03, 0, 0, 0, 0x1c1e21, { rough: 0.4, metal: 0.3 });
    holoTag(glassesProp, "safety glasses", 0, 0.15, 0, { css: "#d89a1c", w: 0.32 });
    reg(hits, glassesProp, "safety-glasses");

    // ------------------------------------------------------------------ line dressing
    const downstreamRack = palletRackBay(g, -2.9, 0.14, 1.4, { ry: Math.PI / 2 });
    holoTag(downstreamRack, "staging rack", 0, 4.4, 0, { css: "#d89a1c", w: 0.34 });
    palletStack(g, 2.8, 0, 2.3, { ry: -0.3 });
    palletStack(g, -2.6, 0, -2.6, { ry: 0.5 });

    // ------------------------------------------------------------------ crew, boards
    const mechanic = standingFigure(g, -2.45, -1.35, { ry: 0.9, cloth: 0x2b3138, vest: TW2_PAL.accent, helmet: 0xf2f2f2 });
    holoTag(mechanic, "mechanic", 0, 1.95, 0.15, { css: "#d89a1c", w: 0.28 });
    const mechanicRadio = group(g, -2.6, 0, -0.7, 0.3);
    box(mechanicRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(mechanicRadio, "mechanic radio", 0, 1.35, 0, { css: "#d89a1c", w: 0.32 });
    reg(hits, mechanicRadio, "mechanic-radio");

    const lead = standingFigure(g, 2.3, 1.5, { ry: -1.3, cloth: 0x37505f, vest: TW2_PAL.accent, helmet: 0xf2c14b });
    holoTag(lead, "line lead", 0, 1.95, 0.15, { css: "#d89a1c", w: 0.26 });
    const leadReport = group(g, 2.5, 0, 0.9, 0.3);
    box(leadReport, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(leadReport, "report to lead", 0, 1.35, 0, { css: "#d89a1c", w: 0.36 });
    reg(hits, leadReport, "lead-report");

    const crewNotifyPost = group(g, -2.5, 0, 0.9, -0.3);
    box(crewNotifyPost, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(crewNotifyPost, "notify crew", 0, 1.35, 0, { css: "#d89a1c", w: 0.32 });
    reg(hits, crewNotifyPost, "crew-notify");

    const permitBoard = holoPanel(g, 0.58, 0.4, -2.7, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d89a1c"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#c9b98f";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LOTO PERMIT · LINE 3", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("ISOLATE BEFORE OPENING", w * 0.06, h * 0.36);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Disconnect: drive panel, line 3", "Lock + tag: per associate"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.58 + i * 0.15)));
    }, { ry: 0.5, accent: CJ_ACCENT });
    reg(hits, permitBoard, "loto-board");

    const maintLog = group(g, 2.7, 0, -0.4, 0.5);
    box(maintLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const maintLogFace = decal(maintLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("MAINTENANCE LOG\nOPEN", { bg: "#11181f", accent: "#d89a1c", scale: 0.26 }), { px: 320 });
    holoTag(maintLog, "maintenance log", 0, 1.32, 0, { css: "#d89a1c", w: 0.34 });
    reg(hits, maintLog, "maintenance-log");

    return {
      hits,
      footprint: 2.7,

      onInterrupt(it) {
        if (it.id === "belt-drift-fault") {
          jamSection.rotation.z = 0.06;
          rollers.forEach((r) => { r.material = mat(0xd2312b, { rough: 0.4, metal: 0.5 }); });
        }
        if (it.id === "second-jam-fault") { secondJam.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "belt-drift-fault") {
          jamSection.rotation.z = 0;
          rollers.forEach((r) => { r.material = mat(0x9aa2a8, { rough: 0.35, metal: 0.6 }); });
        }
        if (it.id === "second-jam-fault") { secondJam.visible = false; secondJamFlag.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "line-hazard-read") {
          tiedCord.children[0].material = mat(0x59c97b, { rough: 0.6 });
          proppedGuard.rotation.x = 0;
          reachInLever.material = mat(0x59c97b, { rough: 0.5 });
        }
        if (step.id === "guard-open") { guard.rotation.x = -0.9; }
        if (step.id === "guard-close") { guard.rotation.x = 0; }
        if (step.id === "clear-jam") { jammedCarton.visible = false; }
        if (step.id === "drive-loto") { driveLockProp.visible = false; driveTagProp.visible = false; driveLockedTag.visible = true; }
        if (step.id === "restore-power") { driveLockedTag.visible = false; }
        if (step.id === "closing-log") {
          repaint(maintLogFace, signFace("MAINTENANCE LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
        }
      },

      animate(t, dt, session) {
        mechanic.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        lead.userData.head.rotation.y = Math.sin(t * 0.6 + 1) * 0.4;
        if (session?.step?.id === "restart-tracking" && secondJamFlag) secondJamFlag.rotation.y = t * 2;
        void dt;
      },
    };
  },
};
