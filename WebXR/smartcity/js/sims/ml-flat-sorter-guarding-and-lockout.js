import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, lockTag,
  surfaceTexture, pavingFace, texturedMat, instrument, reg,
} from "../citykit.js";
import { conveyorSection } from "../../../shared/equipment.js";
import { palletRackBay, palletStack } from "../../../shared/props.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Flat Sorter Guarding & Lockout VR — Manufacturing &
// Automation, APWU mail processing plant clerks. A flat-mail sorter's own
// interlocked guard door and sweep-arm pinch point, worked the way the
// plant's own isolation procedure requires: the guard door's own interlock
// found defeated before it becomes the reason a door opens on a running
// machine, the disconnect isolated and locked at its own point before that
// door ever opens for real, residual motion actually checked rather than
// assumed stopped, a jammed flat pulled clear with a hand that never has to
// trust the sorter's own restart timer, the interlock itself proven — not
// just trusted — before the guard closes again, and the isolation returned
// in the same order it went on.
//
// No sorter's throughput, belt speed or motor horsepower is a number this
// platform is certain of — those live on the machine's own manual and the
// plant's own LOTO procedure for it.

const ML4_PAL = palette("postal");
const ML4_ACCENT = ML4_PAL.accent;

export const SIM_ML_FLAT_SORTER_GUARDING_AND_LOCKOUT = {
  id: "ml-flat-sorter-guarding-and-lockout",
  index: "ml-4",
  domain: "Postal & Mail Processing",
  trade: "Mail processing plant clerk — flat sorter guarding and lockout, APWU",
  category: "Manufacturing & Automation",
  indoor: "plant",
  certification: "OSHA 29 CFR 1910.147 the control of hazardous energy (lockout/tagout); OSHA 29 CFR 1910.212 general requirements for all machines, including interlocked guarding; ASME B20.1 safety standard for conveyors and related equipment, for the sorter's own induction belt; NIOSH criteria on caught-in and struck-by injuries at unguarded pinch points; APWU training for mail processing plant clerks",
  name: "Flat Sorter Guarding & Lockout",
  title: simTitle("Flat Sorter Guarding & Lockout"),
  tagline: "A flat sorter's interlocked guard door and sweep-arm pinch point worked the plant's own way: a defeated interlock and a missing panel found before either is trusted, the disconnect isolated and locked before the guard opens, residual motion actually checked, a jammed flat cleared with a hand that never trusts the restart timer, the interlock proven rather than assumed, and the isolation returned in the order it went on",
  accent: ML4_ACCENT,
  accentCss: `#${ML4_ACCENT.toString(16).padStart(6, "0")}`,
  parSeconds: 280,
  footprint: 2.8,
  badge: { id: "sorter-loto-certified", name: "Sorter LOTO Certified", note: "Isolated and locked the sorter before opening the guard, cleared the jam without reaching past a live pinch point, and proved the interlock before trusting it again" },

  game: system({
    name: "Sorter Isolation",
    currency: "ISOLATION",
    ranks: ["Plant Clerk", "Jam Aware", "Isolation Handler", "Sorter Isolation Authority", "Sorter LOTO Certified"],
    badges: [
      { id: "clean-machine-read", name: "Clean Machine Read", note: "Every guarding defect found without a hint", test: AWARD.stepClean("machine-hazard-read") },
      { id: "locked-before-opened", name: "Locked Before Opened", note: "Isolated and locked the sorter before the guard ever opened", test: AWARD.stepClean("main-disconnect-loto") },
      { id: "interlock-proven", name: "Interlock Proven", note: "The interlock was actually tested, not just trusted", test: AWARD.stepClean("interlock-test") },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "quick-clear", name: "Quick Clear", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "isolation-streak", name: "Isolation Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your APWU local's member assistance representative, or the plant's own employee assistance line",

  hazards: {
    "interlock-defeated-hazard": "The guard door's own safety interlock has been taped over instead of left to do its job. A taped interlock is a door that can open on a running sorter with nothing at all stopping the sweep arm — the whole reason an interlocked guard exists is defeated by a strip of tape nobody ever needs to touch again.",
    "missing-access-panel-hazard": "A side access panel has been left off entirely, leaving the induction belt's own pulleys exposed at hand height. A panel that is not there is not a maintenance shortcut — it is a nip point with nothing at all between it and whoever walks past.",
    "reach-in-sweep-hazard": "That is the shortcut habit of reaching straight into the sweep arm's own pinch point to free a stuck flat by hand instead of isolating the machine first. The sweep arm does not know the difference between a jammed envelope and the fingers pulling it loose, and it closes on either one exactly the same way.",
    "tag-no-lock-hazard": "That disconnect carries a danger tag with no personal lock behind it. A tag with nothing locked is only a note somebody left — anyone can close that disconnect back up without ever knowing a hand might be inside the guard, because nothing is actually stopping them.",
  },

  lateNotes: {
    "sorter-guard-door": "The guard door opens only once the disconnect is isolated and locked, never as the first move toward a jam.",
    "jammed-flat": "The jam is cleared once the sorter is proven isolated, not on the strength of how it sounds or looks.",
  },

  interrupts: [
    {
      id: "upstream-backup",
      kind: "Flats backing up at the induction belt",
      after: "clear-jammed-flat", delay: 3, seconds: 12,
      alert: "Flats are backing up against the induction belt's own guard as the upstream feed keeps running into the paused sorter.",
      cue: "Signal the upstream operator to pause the feed rather than reaching in to clear the backup by hand.",
      target: "upstream-signal",
      why: "A backup at a paused machine's own intake is a second hazard forming behind the first, and reaching into a growing pile of flats to clear it treats a live upstream feed as if it were already isolated along with the sorter — it is not, and the signal is what actually stops it.",
      missNote: "The backup was reached into instead of signalled upstream. The induction belt feeding it was never isolated by anything this station did to the sorter — it kept running the whole time.",
      wrongNote: "Not that — the upstream feed gets signalled to pause before the backup is touched.",
    },
    {
      id: "sweeper-crossing",
      kind: "Floor sweeper crosses the discharge chute",
      after: "interlock-test", delay: 3, seconds: 11,
      alert: "A floor sweeper has started crossing directly in front of the sorter's discharge chute just as the restart begins.",
      cue: "Call out to the sweeper and hold the restart until they are clear of the chute.",
      target: "floor-sweeper-call",
      why: "A discharge chute throws sorted flats out at the machine's own running speed, and someone crossing it during a restart has no reason to expect that yet — calling out is what turns an assumption that they will notice into an actual confirmation that they have.",
      missNote: "The restart continued with the sweeper still crossing the chute. A discharge chute at running speed does not pause for someone who has not been told to look up.",
      wrongNote: "Not that — the sweeper crossing the chute is called out to before the restart continues.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["safety-glasses", "hearing-protection"],
      itemNames: { "safety-glasses": "safety glasses", "hearing-protection": "hearing protection" },
      title: "Suit up before approaching the sorter",
      cue: "Safety glasses and hearing protection before stepping up to the sorter.",
      why: "A flat sorter runs loud enough over a full shift to matter for hearing, and a jammed envelope can flick a sharp paper edge or a staple hard enough to reach an eye — both are covered before a hand goes anywhere near the machine.",
    },
    {
      id: "permit-read", kind: "select", target: "loto-permit-board",
      title: "Read the isolation permit",
      cue: "Confirm today's LOTO permit for this sorter before touching anything on it.",
      why: "The permit is what tells a clerk which disconnect actually isolates this sorter and who else may already be locked onto it — clearing a jam without reading it first means guessing at a disconnect that might belong to an entirely different machine.",
    },
    {
      id: "machine-hazard-read", kind: "find", noHint: true,
      targets: ["interlock-defeated-hazard", "missing-access-panel-hazard"],
      itemNames: { "interlock-defeated-hazard": "the taped-over guard interlock", "missing-access-panel-hazard": "the missing side access panel" },
      itemNotes: {
        "interlock-defeated-hazard": "Taped over instead of left to work. It gets reported and freed before this guard is trusted at all.",
        "missing-access-panel-hazard": "Left off entirely, exposing the belt pulleys. It gets refitted, not walked past.",
      },
      decoyNotes: { "intact-panel-decoy": "That access panel is seated and fastened, showing no damage. Nothing to flag there." },
      title: "Read the sorter for what is already wrong with it",
      cue: "Look over the sorter before touching it. Two things are already wrong with it — find them.",
      why: "A sorter that looks fine from the aisle is not the same thing as one a clerk has actually checked — a taped interlock or a missing panel each quietly removes a control the machine depends on, and finding them now costs a work order instead of costing someone the moment the guard door opens on a running machine.",
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
      why: "A sweep arm that has just been isolated can still be coasting down under its own momentum, and opening the guard on the assumption that isolated means stopped is exactly the gap a residual motion check exists to close — the indicator is the only honest answer, not how quiet the machine sounds.",
      gauge: { label: "RESIDUAL MOTION", speed: 0.6, green: [0.0, 0.14], readout: (t) => (t > 0.14 ? "still coasting — do not open the guard" : "fully stopped"), missNote: "Committed while the sweep arm was still coasting. The guard does not open until this reads fully stopped." },
    },
    {
      id: "guard-door-open", kind: "turn", target: "sorter-guard-door",
      title: "Open the interlocked guard door",
      cue: "Turn the guard door latch to open it, now that the sorter is isolated and stopped.",
      why: "The guard door is the last thing between a hand and the sweep arm's own pinch point, and opening it only after the sorter is proven isolated and stopped is what keeps this step from ever being the moment the machine was still live.",
      turn: { turns: 0.4, axis: "x", label: "GUARD DOOR" },
    },
    {
      id: "clear-jammed-flat", kind: "drag", target: "jammed-flat",
      title: "Clear the jammed flat",
      cue: "Carry the jammed flat clear of the feed rollers to the reject tray.",
      why: "Clearing the flat with the sorter isolated and the guard open means a hand never has to trust the machine's own restart timer while it is inside the pinch point — the flat comes free because a hand pulled it, not because the sweep arm happened to still be stopped when it did.",
      drag: { to: "reject-tray-socket", radius: 0.45, missNote: "Not into the reject tray — carry the flat all the way clear of the rollers before letting go." },
    },
    {
      id: "sweep-inspect-and-find", kind: "find", noHint: true,
      targets: ["tag-no-lock-hazard", "reach-in-sweep-hazard"],
      itemNames: { "tag-no-lock-hazard": "the tag with no lock behind it", "reach-in-sweep-hazard": "the reach-in shortcut habit" },
      itemNotes: {
        "tag-no-lock-hazard": "A tag on the disconnect with no personal lock behind it. It gets a lock added or reported, never treated as isolation on its own.",
        "reach-in-sweep-hazard": "A worn shortcut path straight into the sweep arm's own pinch point. It gets reported and the habit broken, not repeated.",
      },
      decoyNotes: { "proper-lock-decoy": "That disconnect carries both a lock and a tag, correctly applied. Nothing to flag there." },
      title: "Inspect the sweep arm and read for shortcuts",
      cue: "Check the sweep arm the jam was wedged against, and read for two more things already wrong nearby.",
      why: "A sweep arm that was scored or bent by the jam will keep snagging the next flat that crosses it, and a tag with no lock or a worn reach-in path are both the kind of shortcut that looks like nothing until the day it is the reason someone's hand was where the sweep arm closed.",
    },
    {
      id: "guard-door-close", kind: "turn", target: "sorter-guard-door",
      title: "Close and latch the guard door",
      cue: "Turn the guard door latch closed and confirm it seats before restoring power.",
      why: "A guard door that is not actually latched is not a guard once the sorter is re-energised — confirming the latch now is what keeps this from being the jam that gets cleared safely and then reopened by the first vibration once the machine is running again.",
      turn: { turns: 0.4, axis: "x", label: "GUARD DOOR" },
    },
    {
      id: "restore-power", kind: "sequence", anyOrder: false,
      targets: ["sorter-tag-remove", "sorter-lock-remove", "crew-notify"],
      itemNames: { "sorter-tag-remove": "remove the tag", "sorter-lock-remove": "remove your lock", "crew-notify": "notify the crew" },
      title: "Return the isolation",
      cue: "Remove the tag, remove your lock, then notify the crew — in that order, before the sorter is re-energised.",
      why: "The tag and the lock come off in the order they went on, and notifying the crew before restoring power is what keeps anyone else on the floor from being surprised by a sorter that starts moving again — reversing this order is how somebody re-energises a machine while another clerk still believes it is locked out.",
      outOfOrderNote: "Tag off, then lock off, then the crew notified — restoring power before the crew knows is restoring it onto an assumption, not a confirmation.",
    },
    {
      id: "interlock-test", kind: "hold", target: "sorter-guard-door", seconds: 8,
      title: "Prove the interlock before trusting it",
      cue: "Hold the guard door ajar and confirm the power indicator drops before letting it swing shut again.",
      why: "An interlock that was taped over once is an interlock worth proving rather than assuming fixed — holding the door ajar and watching for the power to actually drop is the difference between an interlock that is trusted because it was repaired and one that is trusted because nobody checked.",
      holdBreakNote: "The door was released before the power indicator was confirmed to drop. The interlock is proven by watching it work, not by how it looks once it's back together.",
    },
    {
      id: "restart-tracking", kind: "track", target: "induction-belt-roller", seconds: 8,
      title: "Bring the sorter back up to speed",
      cue: "Restart the sorter while keeping the induction belt's tracking indicator inside the centred band.",
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
      cue: "Log the jam, the interlock repair, the missing panel, and the restart before moving on.",
      why: "The maintenance log is what turns one cleared jam and one taped-over interlock into a pattern the plant's own maintenance team can actually see — found but never logged is a recurring guarding failure nobody upstream ever gets the chance to fix for good.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.8, ML4_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.8, 0.14, 6.2, 0, 0.07, 0, 0xffffff, { rough: 0.86 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#5c6266", base2: "#4f5559", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.86, metal: 0.06, color: ML4_PAL.ground },
    );
    for (const sx of [-1.6, 1.6]) box(g, 0.06, 0.007, 5.6, sx, 0.148, 0, ML4_PAL.trim, { rough: 0.6, cast: false });

    // ------------------------------------------------------------------ the sorter body
    const sorter = group(g, 0, 0.14, -0.4);
    box(sorter, 2.2, 1.5, 1.6, 0, 0.75, 0, 0x6d7379, { rough: 0.55, metal: 0.4, finish: "painted" });
    holoTag(sorter, "flat sorter 6", 0, 1.8, 0, { css: "#2f6fb0", w: 0.34 });

    // Induction belt feeding into the sorter body.
    const belts = [];
    for (let i = -2; i <= -1; i++) belts.push(conveyorSection(g, 0, 0.14, i * 1.2 - 0.4, { ry: Math.PI / 2, colour: 0x4a5560 }));
    const feedSection = belts[1];
    const beltReturnRoller = group(feedSection, 0, 0.1, -0.55);
    cyl(beltReturnRoller, 0.05, 0.05, 0.55, 0, 0, 0, 0x6d7379, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    reg2(beltReturnRoller, "induction-belt-roller");

    // Missing access panel, exposing the belt pulleys.
    const panelFrame = group(sorter, -1.1, 0, 0.3, -0.3);
    box(panelFrame, 0.03, 0.9, 0.7, 0, 0.45, 0, 0x2b2f34, { rough: 0.6 });
    reg2(panelFrame, "missing-access-panel-hazard");
    const intactPanel = group(sorter, -1.1, 0, -0.5, -0.3);
    box(intactPanel, 0.6, 0.9, 0.03, 0, 0.45, 0, 0x9aa1a6, { rough: 0.5, metal: 0.3 });
    reg2(intactPanel, "intact-panel-decoy");

    // The interlocked guard door, on the front face.
    const guardDoor = group(sorter, 1.12, 0.3, 0.4, 0);
    box(guardDoor, 0.04, 1.1, 0.9, 0, 0, 0, 0xd8d9d4, { rough: 0.5, finish: "painted" });
    reg2(guardDoor, "sorter-guard-door");
    const interlockSwitch = box(guardDoor, 0.06, 0.08, 0.04, 0, 0.5, 0.4, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const interlockTape = box(guardDoor, 0.1, 0.03, 0.02, 0, 0.5, 0.42, 0xd8c98a, { rough: 0.7 });
    reg2(interlockTape, "interlock-defeated-hazard");
    void interlockSwitch;

    // Sweep arm, visible through the open guard.
    const sweepArm = group(sorter, 0.5, 0.4, 0.35);
    box(sweepArm, 0.5, 0.06, 0.08, 0, 0, 0, 0x9aa2a8, { rough: 0.4, metal: 0.5 });
    holoTag(sweepArm, "sweep arm", 0, 0.2, 0, { css: "#d89a1c", w: 0.24 });

    const reachInLever = box(sorter, 0.09, 0.06, 0.02, 0.9, 0.5, 0.82, 0xd2312b, { rough: 0.5 });
    decal(reachInLever, 0.08, 0.05, 0, 0, 0.011, signFace("REACH", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.5 }));
    reg2(reachInLever, "reach-in-sweep-hazard");

    // The jammed flat and the reject tray.
    const jammedFlat = group(g, 0.2, 0.5, -0.15);
    box(jammedFlat, 0.24, 0.16, 0.01, 0, 0, 0, 0xe8e4d8, { rough: 0.7, finish: "brushed" });
    jammedFlat.rotation.y = 0.3;
    reg2(jammedFlat, "jammed-flat");
    const rejectTray = group(g, 2.4, 0.14, -1.4);
    box(rejectTray, 0.6, 0.1, 0.5, 0, 0.06, 0, 0x8a8f95, { rough: 0.6, metal: 0.3 });
    holoTag(rejectTray, "reject tray", 0, 0.4, 0, { css: "#2f6fb0", w: 0.28 });
    hits["reject-tray-socket"] = group(g, 2.4, 0.18, -1.4);

    // ------------------------------------------------------------------ disconnect panel
    const drivePanel = group(g, 1.7, 0, -2.4, -0.3);
    box(drivePanel, 0.5, 0.8, 0.28, 0, 0.5, 0, 0xd8d9d4, { rough: 0.5, finish: "painted" });
    holoTag(drivePanel, "sorter disconnect", 0, 0.95, 0, { css: "#2f6fb0", w: 0.36 });
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

    // The second disconnect, correctly locked and tagged (decoy).
    const properPanel = group(g, -1.7, 0, -2.4, 0.3);
    box(properPanel, 0.4, 0.7, 0.24, 0, 0.4, 0, 0xd8d9d4, { rough: 0.5, finish: "painted" });
    const properLockTag = lockTag(properPanel, 0, 0.3, 0.14, { ry: 0.1 });
    reg2(properLockTag, "proper-lock-decoy");

    // The tag-with-no-lock hazard, on a third stray panel nearby.
    const strayPanel = group(g, -2.5, 0, -0.8, 0.5);
    box(strayPanel, 0.32, 0.5, 0.2, 0, 0.35, 0, 0xd8d9d4, { rough: 0.5, finish: "painted" });
    const strayTag = decal(strayPanel, 0.05, 0.07, 0, 0.3, 0.11, signFace("TAG", { bg: "#f4e9d8", accent: "#b81410", scale: 0.6 }));
    reg2(strayTag, "tag-no-lock-hazard");

    const motionIndicator = group(g, 1.7, 0, -1.85, -0.3);
    box(motionIndicator, 0.14, 0.1, 0.03, 0, 0.75, 0, 0x0d1c24, { rough: 0.5 });
    holoTag(motionIndicator, "motion indicator", 0, 0.85, 0, { css: "#2f6fb0", w: 0.34 });
    reg2(motionIndicator, "residual-motion-indicator");

    const powerIndicator = instrument(guardDoor, 0.2, 0.95, 0, { idle: "POWER", color: ML4_ACCENT, w: 0.1, d: 0.1 });
    void powerIndicator;

    // ------------------------------------------------------------------ PPE
    const ppeRack = group(g, -2.9, 0, 2.3, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const glassesProp = group(ppeRack, 0.2, 0.6, 0);
    box(glassesProp, 0.1, 0.03, 0.03, 0, 0, 0, 0x1c1e21, { rough: 0.4, metal: 0.3 });
    holoTag(glassesProp, "safety glasses", 0, 0.15, 0, { css: "#2f6fb0", w: 0.32 });
    reg2(glassesProp, "safety-glasses");
    const earmuffProp = box(ppeRack, 0.12, 0.14, 0.05, 0, 0.55, 0.15, 0x2b3138, { rough: 0.7 });
    holoTag(earmuffProp, "hearing protection", 0, 0.2, 0.15, { css: "#2f6fb0", w: 0.38 });
    reg2(earmuffProp, "hearing-protection");

    // ------------------------------------------------------------------ dressing, crew, boards
    const rack = palletRackBay(g, -2.9, 0.14, 0.5, { ry: Math.PI / 2 });
    holoTag(rack, "staging rack", 0, 4.4, 0, { css: "#2f6fb0", w: 0.34 });
    palletStack(g, 2.8, 0, 1.6, { ry: -0.3 });

    const mechanic = standingFigure(g, -3.3, -1.5, { ry: 0.9, cloth: 0x2b3138, vest: ML4_PAL.accent, helmet: 0xf2f2f2 });
    holoTag(mechanic, "mechanic", 0, 1.95, 0.15, { css: "#2f6fb0", w: 0.28 });
    const upstreamSignal = group(g, -2.6, 0, -1.7, 0.3);
    box(upstreamSignal, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(upstreamSignal, "upstream signal", 0, 1.35, 0, { css: "#2f6fb0", w: 0.34 });
    reg2(upstreamSignal, "upstream-signal");

    const sweeper = standingFigure(g, 3.2, 2.5, { ry: -1.6, cloth: 0x37505f, vest: ML4_PAL.accent });
    const sweeperCall = group(g, 2.5, 0, 1.0, 0.3);
    box(sweeperCall, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(sweeperCall, "call the sweeper", 0, 1.35, 0, { css: "#2f6fb0", w: 0.36 });
    reg2(sweeperCall, "floor-sweeper-call");
    void sweeper;

    const permitBoard = holoPanel(g, 0.58, 0.4, -2.7, 1.5, 1.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f6fb0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#c9b98f";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LOTO PERMIT · SORTER 6", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("ISOLATE BEFORE OPENING", w * 0.06, h * 0.36);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Disconnect: drive panel, sorter 6", "Lock + tag: per clerk"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.58 + i * 0.15)));
    }, { ry: 0.5, accent: ML4_ACCENT });
    reg2(permitBoard, "loto-permit-board");

    const maintLog = group(g, 2.7, 0, -2.0, 0.5);
    box(maintLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const maintLogFace = decal(maintLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("MAINTENANCE LOG\nOPEN", { bg: "#11181f", accent: "#2f6fb0", scale: 0.26 }), { px: 320 });
    holoTag(maintLog, "maintenance log", 0, 1.32, 0, { css: "#2f6fb0", w: 0.34 });
    reg2(maintLog, "maintenance-log");

    const crewNotifyPost = group(g, -2.5, 0, 0.9, -0.3);
    box(crewNotifyPost, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(crewNotifyPost, "notify crew", 0, 1.35, 0, { css: "#2f6fb0", w: 0.32 });
    reg2(crewNotifyPost, "crew-notify");

    // Backup for the second interrupt: a visible pile of flats at the belt.
    const backupPile = group(g, 0, 0.4, -2.1);
    for (let i = 0; i < 5; i++) box(backupPile, 0.2, 0.14, 0.01, (i - 2) * 0.08, 0, 0, 0xe8e4d8, { rough: 0.7 });
    backupPile.visible = false;

    return {
      hits,
      footprint: 2.8,

      onInterrupt(it) {
        if (it.id === "upstream-backup") { backupPile.visible = true; }
        if (it.id === "sweeper-crossing") { sweeper.position.set(1.2, 0, 2.0); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "upstream-backup") { backupPile.visible = false; }
        if (it.id === "sweeper-crossing") { sweeper.position.set(3.2, 0, 2.5); }
      },
      onStepComplete(step) {
        if (step.id === "machine-hazard-read") {
          interlockTape.material = mat(0x59c97b, { rough: 0.6 });
          panelFrame.children.forEach((c) => { c.material = mat(0x9aa1a6, { rough: 0.5, metal: 0.3 }); });
        }
        if (step.id === "guard-door-open") { guardDoor.rotation.y = -0.9; }
        if (step.id === "guard-door-close") { guardDoor.rotation.y = 0; }
        if (step.id === "clear-jammed-flat") { jammedFlat.visible = false; }
        if (step.id === "sweep-inspect-and-find") { reachInLever.material = mat(0x59c97b, { rough: 0.5 }); }
        if (step.id === "main-disconnect-loto") { sorterLockProp.visible = false; sorterTagProp.visible = false; sorterLockedTag.visible = true; }
        if (step.id === "restore-power") { sorterLockedTag.visible = false; }
        if (step.id === "closing-log") {
          repaint(maintLogFace, signFace("MAINTENANCE LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
        }
      },

      animate(t, dt, session) {
        mechanic.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        if (session?.step?.id === "interlock-test") guardDoor.rotation.y = session.holding ? -0.3 : 0;
        void dt;
      },
    };
  },
};
