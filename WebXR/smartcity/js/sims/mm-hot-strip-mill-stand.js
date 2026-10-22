import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, rackFrame, rackUnit,
  cone, barrierPanel, reg,
} from "../citykit.js";
import { rollingMillStand } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hot-Strip Mill Stand VR — Manufacturing & Automation, mill and
// mine pack, station one.
//
// A roll change on a hot-strip finishing stand. The work rolls and backup
// rolls together weigh many tonnes, the spindle that drives them carries the
// stand's whole torque, and the crane that lifts the old set out crosses a
// bay that other crews are also working under. Nothing about a roll change
// starts until the drive and the screwdown are both locked out and the
// spindle is proven at zero speed on the tachometer, not by eye; nothing
// about a lift starts until the crane's travel path is called clear; and the
// guard across the bite goes back before the stand is ever asked to turn
// again. Per the plan and the manufacturer's procedure throughout — no
// figure here is a fact this platform is claiming to know.

const HSM_ACCENT = 0xe0632e;

export const SIM_MM_HOT_STRIP_MILL_STAND = {
  id: "mm-hot-strip-mill-stand",
  index: "708",
  domain: "Manufacturing",
  trade: "Hot-strip mill roll-shop operator",
  category: "Manufacturing & Automation",
  indoor: "plant",
  certification: "USW Tony Mazzocchi Center health and safety training; OSHA 29 CFR 1910.147 control of hazardous energy (lockout/tagout); OSHA 29 CFR 1910.212 general machine guarding; ASME B30.2 overhead and gantry cranes",
  name: "Hot-Strip Mill Stand",
  title: simTitle("Hot-Strip Mill Stand"),
  tagline: "A finishing-stand roll change: drive and screwdown locked out, zero speed proven, the crane path called, the old rolls rigged out and the new set coupled and set",
  accent: HSM_ACCENT,
  accentCss: "#e0632e",
  parSeconds: 320,
  footprint: 2.4,
  badge: { id: "stand-cleared", name: "Stand Cleared", note: "A roll change made locked out, zero speed proven, the crane path called clear, and the guard back before the stand turned again" },

  game: system({
    name: "Roll Shop Authority",
    currency: "COIL",
    ranks: ["Roll-Shop Helper", "Millwright", "Roll-Shop Operator", "Turn Boss", "Roll Shop Authority Certified"],
    badges: [
      { id: "locked-both", name: "Locked Both", note: "Drive and screwdown both locked out before the guard opened, first time", test: AWARD.stepClean("lockout-drive") },
      { id: "clear-of-the-bite", name: "Clear Of The Bite", note: "Never reached the roll bite, the crane's load path or a pulled keeper", test: AWARD.safe },
      { id: "gap-on-schedule", name: "Gap On Schedule", note: "Roll gap set inside the schedule's band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-change", name: "Clean Change", note: "No corrections through the whole roll change", test: AWARD.clean },
      { id: "lift-steady", name: "Lift Steady", note: "The hoist never broke its controlled rate", test: AWARD.unbroken },
      { id: "change-fast", name: "Change Fast", note: "Roll change inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-in-roll-bite": "You reached into the roll bite. Nothing about a stopped drive changes what happens if it is re-energised with a hand between the rolls — the bite is treated as live until it is locked out, proven at zero speed and guarded, never on the strength of the motor being switched off a minute ago.",
    "crane-load-under": "You stood under the crane's load path while it carried the roll set across the bay. A multi-tonne load on a hook has one failure mode worth caring about, and there is no position under its path that is a safe place to be standing when it happens — you stand clear of the path, not just clear of the load.",
    "screwdown-bypass": "You opened the screwdown's hydraulic bypass instead of its isolation valve. A bypass is there to let the ram move for setup under power; it does the opposite of what an isolation does, and it is one handle away from the tonnes of preset force in the screwdown finding somewhere to go while hands are at the housing.",
    "chock-keeper-pulled": "You pulled the chock keeper before the sling was taking the roll's weight. The keeper is the only thing holding an unclamped roll in its housing window once the screwdown is backed off — pull it early and the roll comes out of the window on its own schedule, not the crane's.",
  },

  lateNotes: {
    "screwdown-gauge": "The gap is set after the new rolls are coupled and pinned — a gap for rolls that are not driven yet is a number for nothing.",
    "run-pendant": "Not yet. The guard is back across the bite and the lockout is off before the stand turns again.",
  },

  steps: [
    {
      id: "mill-schedule", kind: "select", target: "schedule-board",
      title: "Read the rolling schedule",
      cue: "Check the gauge, the width and which roll set the schedule calls for this coil.",
      why: "The schedule names the roll set this coil needs, not the set that happens to still be sitting in the stand from the last order. A roll change that starts from what is already in the housing rather than from the schedule is a bet that this coil matches the last one, and a finishing stand that rolls the wrong crown onto a strip does it to every metre before anyone downstream measures the first one.",
    },
    {
      id: "call-crane", kind: "select", target: "crane-phone",
      title: "Call the crane operator",
      cue: "Radio the crane operator and confirm the bay's travel path is clear before the lift.",
      why: "The crane's path across the bay crosses ground other crews use for their own work, and the operator up in the cab cannot see everyone under the hook from that angle. Calling ahead so the path is cleared before the load moves is what keeps a scheduled lift from becoming a surprise to somebody working underneath it.",
    },
    {
      id: "lockout-drive", kind: "sequence",
      targets: ["motor-disconnect", "spindle-lock", "hydraulic-isolation-valve"],
      itemNames: { "motor-disconnect": "drive motor disconnect opened and locked", "spindle-lock": "spindle brake locked", "hydraulic-isolation-valve": "screwdown hydraulics isolated" },
      title: "Lock out the drive and the screwdown",
      cue: "Open and lock the motor disconnect, lock the spindle brake, then isolate the screwdown hydraulics.",
      why: "A stand this size stores energy two different ways — electrical in the drive motor and hydraulic in the screwdown — and one lock only covers one of them. Isolating the drive stops the rolls from turning; isolating the screwdown stops the housing from moving the gap while hands are at the chocks. Skipping either leaves exactly the hazard the other one was locked out to remove.",
      outOfOrderNote: "Motor disconnect, then the spindle brake, then the screwdown valve — the drive is dead before the brake is trusted, and the brake is locked before the hydraulics are touched.",
    },
    {
      id: "tach-check", kind: "hold", target: "tach-readout", seconds: 5,
      title: "Prove zero speed on the tachometer",
      cue: "Hold the test lead on the tachometer take-off and watch the readout settle at zero.",
      why: "A stand this size coasts for a while after the drive is cut, and a spindle that is still turning looks the same from across the floor as one that has fully stopped. The tachometer is what tells the difference, and it is watched to zero rather than guessed at, because the alternative is treating a coasting spindle as safe on nothing but how quiet it sounds.",
      holdBreakNote: "You let go before the readout settled. A reading taken halfway through the coast is a reading for a spindle that has not actually stopped yet.",
    },
    {
      id: "screwdown-release", kind: "turn", target: "screwdown-handwheel",
      title: "Back the screwdown off by hand",
      cue: "Turn the screwdown handwheel to relieve the preset load on the top backup roll chocks.",
      why: "The rolls run under tonnes of preset force to hold the gap under load, and that force is still in the housing the instant the hydraulics are isolated. Backing it off by hand, slowly, is what lets that force leave the stand in a controlled turn of the wheel instead of all at once the moment somebody pulls a keeper expecting the chocks to already be free.",
      turn: { turns: 1, axis: "y", label: "SCREWDOWN" },
    },
    {
      id: "guard-gate", kind: "select", target: "guard-gate",
      title: "Swing the entry guard clear",
      cue: "Swing the guard away from the bite now that the stand is locked out.",
      why: "The guard's interlock is what cuts the drive if it is opened while the stand is running — a backup for the moment the lockout is forgotten, not a substitute for it. Opening it only after the lockout and the zero-speed check keeps the interlock in its proper place: the thing that would have caught a mistake, not the thing the roll change is relying on.",
    },
    {
      id: "rig-old-rolls", kind: "drag", target: "old-roll-set",
      title: "Rig the sling on the old roll set",
      cue: "Carry the sling to the old roll necks and land it on the crane hook.",
      why: "A sling choked around the roll necks, not the barrel, is what keeps a roll that is many times heavier than a person from rolling out of the hitch the moment it clears the housing window. The hook takes the sling's full weight before anything at the housing is disturbed, which is the whole reason the order runs sling-first.",
      drag: { to: "hook-point", radius: 0.4, missNote: "Not on the hook — land the sling square on the hook before calling for tension." },
    },
    {
      id: "crane-lift-old", kind: "track", target: "crane-hoist-lever", seconds: 6,
      title: "Lift the old rolls clear of the housing",
      cue: "Hold the hoist control steady and lift the roll set clear of the window at a controlled rate.",
      why: "A lift taken too fast can strike the housing window on the way out or swing the roll into the chocks it just cleared, and a lift taken too slow tells the rigger nothing about whether the sling is actually seated right. A controlled, steady rate is what a rigger watches the whole way, because the lift is over the instant the roll clears the window, not before.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.5, fall: 0.4, drift: 0.12, label: "HOIST", readout: (v) => (v < 0.4 ? "too slow to tell" : v > 0.6 ? "too fast for the window" : "controlled") },
      holdBreakNote: "Hoist rate out of band — bring it back before the roll reaches the window edge.",
    },
    {
      id: "inspect-new-rolls", kind: "find", noHint: true,
      targets: ["roll-surface-spall", "coupling-key-worn"],
      itemNames: { "roll-surface-spall": "a spall on the new work roll's barrel", "coupling-key-worn": "a worn key in the spindle coupling" },
      itemNotes: {
        "roll-surface-spall": "There is a spalled patch on the barrel surface of the new work roll, the kind of flaw that prints straight into every metre of strip that rolls across it.",
        "coupling-key-worn": "The key in the spindle coupling is visibly worn at the edges — the fit that is supposed to carry the stand's whole drive torque without play.",
      },
      title: "Walk the new roll set before it goes in",
      cue: "Check the new rolls and the coupling and click what is wrong.",
      why: "The new roll set is staged on trust that it left the roll shop ready to run, and that trust is checked here, on the stand, before it costs a coil rather than after. A flaw found on the ground beside the housing is a flaw fixed before the mill starts; the same flaw found in the finished strip is a flaw that already ran.",
    },
    {
      id: "rig-new-rolls", kind: "drag", target: "new-roll-set",
      title: "Set the new roll set into the housing window",
      cue: "Carry the new roll set into the housing and seat it square in the chock guides.",
      why: "The chock guides in the housing window are what keep the rolls square to each other and to the strip; a roll that goes in cocked rides on the edge of its guide under load, and the first thing a cocked roll does under tonnes of force is bind, and the second is chatter into the strip.",
      drag: { to: "roll-socket", radius: 0.4, missNote: "Not square in the guide — reseat the roll before the chocks close on it." },
    },
    {
      id: "couple-spindle", kind: "select", target: "spindle-coupling",
      title: "Engage the spindle coupling",
      cue: "Engage the coupling onto the new roll neck and confirm the keeper pin is through.",
      why: "The spindle carries the stand's entire drive torque into the roll, and an unpinned coupling has nothing holding it onto the neck but friction. Under load, a coupling that can walk off the neck does not do it gently — it whips, and it does it right beside where the operator is standing to make the check.",
    },
    {
      id: "screwdown-gauge", kind: "gauge", target: "screwdown-gauge",
      title: "Set the roll gap to the schedule",
      cue: "Bring the screwdown up to the roll-gap setting the schedule calls for.",
      why: "The roll gap is what sets the finished gauge of the strip, and it is set from the schedule's number, proven on a test pass — never nudged in by eye against how the last coil looked, because two coils that look the same from the pulpit can be tenths of a millimetre apart on the schedule.",
      gauge: { label: "ROLL GAP", speed: 0.72, green: [0.45, 0.6], readout: (t) => `${(0.8 + t * 3.4).toFixed(2)} mm`, missNote: "Off the schedule's gap — reset the screwdown before the test pass." },
    },
    {
      id: "guard-close", kind: "select", target: "guard-gate",
      title: "Close the entry guard",
      cue: "Swing the guard back across the bite before the stand turns again.",
      why: "The guard goes back before power is restored, not after — the interlock it carries is the backup for the day the lockout gets skipped, and a backup left open on the day it is actually needed is no backup at all.",
    },
    {
      id: "restore-drive", kind: "turn", target: "motor-disconnect",
      title: "Remove your lock and restore the drive",
      cue: "Confirm the bite is clear, take your lock off, then close the motor disconnect.",
      why: "Your lock, your call — restoring power is the one action on this stand that only the person who applied the lock gets to take, because only that person actually watched the bite the whole time it was open.",
      turn: { turns: 0.5, axis: "y", label: "DRIVE" },
    },
    {
      id: "proof-pass", kind: "hold", target: "run-pendant", seconds: 4,
      title: "Run a slow proof pass",
      cue: "Hold the run pendant for a slow proof pass before the stand goes back to schedule speed.",
      why: "A proof pass at a slow, watched speed is what catches a coupling that is not quite seated or a gap that is not quite right, while it is still one length of test material and not the first coil of the shift. The stand only goes back to full schedule speed once the proof pass has actually been watched, not assumed clean because the setup looked right on paper.",
      holdBreakNote: "Released mid-pass — a proof pass stopped partway proves nothing about the far half of it.",
    },
  ],

  interrupts: [
    {
      id: "crane-swings",
      kind: "Load overhead",
      after: "rig-old-rolls", delay: 3, seconds: 12,
      alert: "A second crane on the same runway has picked up a load two bays over and is travelling this way, straight along the path over your open stand.",
      cue: "A load is about to cross directly overhead.",
      target: "crane-hold-button",
      why: "The path you called clear was for your own lift; it says nothing about a second crane on the same runway with its own job to do. The hold button at the stand is what stops a load from crossing overhead while your crew still has the guard open and people standing at the housing.",
      missNote: "The second load crossed directly overhead while your crew was still at the open housing. A crane's failure mode does not announce itself in advance, and standing under its path on the strength of it having crossed safely before is exactly the bet a hold button exists to end.",
      wrongNote: "It is the crane hold button. Nothing else stops a load already moving on the runway above you.",
    },
    {
      id: "line-feed-warning",
      kind: "Line about to feed",
      after: "screwdown-release", delay: 4, seconds: 13,
      alert: "The pulpit calls down that the upstream stand is about to feed a bar, and from where you are it is not obvious the sequencing knows this stand is open.",
      cue: "The line may be about to feed a bar toward the open stand.",
      target: "line-stop",
      why: "Your lockout covers this stand's own drive; it does nothing to stop a bar arriving from an upstream stand that thinks the line is ready to run. The line stop is what actually halts the mill before hot steel reaches a housing with the guard open and hands at the chocks.",
      missNote: "The line kept running toward the open stand. A stand that is locked out is safe from its own drive turning — it is not safe from several tonnes of hot steel arriving from the stand behind it, and that is a hazard the lockout you already applied cannot answer.",
      wrongNote: "It is the line stop. Nothing else reaches back up the mill to the stand that is actually about to feed.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, HSM_ACCENT);
    box(g, 6.4, 0.12, 6.0, 0, 0.06, 0, 0x3a3f44, { rough: 0.85, finish: "concrete" });
    for (let i = -2; i <= 2; i++) box(g, 0.06, 0.13, 6.0, i * 1.2, 0.065, 0, 0xf0b323, { rough: 0.6, opacity: 0.5, transparent: true, cast: false });

    // ------------------------------------------------------- the mill stand
    const stand = rollingMillStand(g, 0, 0, -0.3, { colour: 0x545c63 });
    const P = stand.userData.parts;
    reg(hits, P.screwdown, "screwdown-handwheel");
    reg(hits, P.guardGate, "guard-gate");
    // A readout on the screwdown housing for the roll-gap setting — its own
    // marker, since P.screwdown already answers to "screwdown-handwheel".
    const gapFace = decal(P.screwdown, 0.3, 0.1, 0, -0.32, 0.51, signFace("-- mm", { bg: "#0d1c24", accent: "#e0632e", fg: "#ffe9b0", scale: 0.55 }), { glow: true, ei: 0.7 });
    const gapHit = box(P.screwdown, 0.32, 0.12, 0.02, 0, -0.32, 0.52, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, gapHit, "screwdown-gauge");
    // Chock keeper — a small pin at the housing face, a hazard if pulled early.
    const keeper = box(g, 0.05, 0.16, 0.05, -1.55, 1.05, 0.55, 0xd2312b, { rough: 0.5, metal: 0.4 });
    reg(hits, keeper, "chock-keeper-pulled");
    // Roll bite — invisible hazard zone between the top and bottom work rolls.
    const bite = box(g, 2.4, 0.24, 0.3, 0, 1.35, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, bite, "reach-in-roll-bite");
    // The housing-window socket the new roll set drops into.
    const rollSocket = box(g, 2.0, 0.02, 0.2, 0, 0.6, -0.3, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, rollSocket, "roll-socket");
    // Spindle coupling, on the drive side of the stand.
    const coupling = group(g, 2.55, 1.35, -0.3);
    cyl(coupling, 0.22, 0.22, 0.5, 0, 0, 0, 0x2b2f34, { rough: 0.55, metal: 0.5, seg: 16 });
    const keyPin = box(coupling, 0.04, 0.04, 0.5, 0, 0.2, 0, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    reg(hits, coupling, "spindle-coupling");
    // Screwdown hydraulic isolation valve and its bypass, on the pendant.
    const pendant = group(g, -2.7, 0, 1.3);
    box(pendant, 0.5, 1.4, 0.14, 0, 0.7, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const disc = group(pendant, -0.13, 1.05, 0.08);
    cyl(disc, 0.04, 0.04, 0.02, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const discHandle = box(disc, 0.02, 0.09, 0.02, 0, 0, 0.02, 0xd2312b, { rough: 0.5 });
    decal(disc, 0.14, 0.03, 0, 0.07, 0.01, signFace("MOTOR", { bg: "#22262b", accent: "#e0632e", scale: 0.5 }));
    reg(hits, disc, "motor-disconnect");
    const brake = group(pendant, 0.13, 1.05, 0.08);
    cyl(brake, 0.04, 0.04, 0.02, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    decal(brake, 0.14, 0.03, 0, 0.07, 0.01, signFace("SPINDLE", { bg: "#22262b", accent: "#e0632e", scale: 0.5 }));
    reg(hits, brake, "spindle-lock");
    const iso = group(pendant, -0.13, 0.65, 0.08);
    valveHandle(iso);
    decal(iso, 0.16, 0.03, 0, 0.11, 0.01, signFace("SCREWDOWN ISO", { bg: "#22262b", accent: "#e0632e", scale: 0.4 }));
    reg(hits, iso, "hydraulic-isolation-valve");
    const bypass = group(pendant, 0.13, 0.65, 0.08);
    valveHandle(bypass, 0xd2312b);
    decal(bypass, 0.14, 0.03, 0, 0.11, 0.01, signFace("BYPASS", { bg: "#22262b", accent: "#d2312b", scale: 0.4 }));
    reg(hits, bypass, "screwdown-bypass");
    function valveHandle(parentGroup, colour = 0xb9bec4) {
      cyl(parentGroup, 0.035, 0.035, 0.05, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
      box(parentGroup, 0.13, 0.02, 0.02, 0, 0, 0.03, colour, { rough: 0.4, metal: 0.6 });
    }
    // Locks that appear once applied.
    const lockA = lockTag(pendant, -0.13, 0.95, 0.08, { color: 0xe0632e }); lockA.visible = false;
    const lockB = lockTag(pendant, 0.13, 0.95, 0.08, { color: 0xe0632e }); lockB.visible = false;
    const lockC = lockTag(pendant, -0.13, 0.55, 0.08, { color: 0xe0632e }); lockC.visible = false;

    // Tachometer test point.
    const tachStand = group(g, -2.1, 0, -0.9);
    cyl(tachStand, 0.03, 0.035, 0.7, 0, 0.35, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const tach = instrument(tachStand, 0, 0.72, 0, { ry: 0.6, idle: "-- RPM", color: HSM_ACCENT });
    reg(hits, tach, "tach-readout");

    // Schedule board and crane phone.
    const board = holoPanel(g, 0.62, 0.44, -2.6, 1.5, -1.4, (cx, w, h) => {
      cx.fillStyle = "#1a1208"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e0632e"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ROLLING SCHEDULE — COIL 4402", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#f6ead6";
      ["Gauge: 2.6 mm target", "Width: per order", "Roll set: work #2, backup #2", "Gap: per schedule band"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { accent: HSM_ACCENT });
    reg(hits, board, "schedule-board");
    const phone = group(g, -2.6, 0, -0.55);
    box(phone, 0.2, 0.3, 0.1, 0, 1.2, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    holoTag(phone, "crane radio", 0, 1.42, 0, { css: "#e0632e", w: 0.28 });
    reg(hits, phone, "crane-phone");

    // ---------------------------------------------------------- overhead crane
    const rail = group(g, 0, 0, 0);
    for (const sx of [-2.6, 2.6]) cyl(rail, 0.05, 0.05, 6.0, sx, 3.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.55, seg: 10 }).rotation.x = Math.PI / 2;
    const bridge = group(rail, 0, 3.5, 0);
    box(bridge, 5.4, 0.18, 0.3, 0, 0, 0, 0x4a5057, { rough: 0.5, metal: 0.5, finish: "painted" });
    const trolley = group(bridge, 0, -0.25, 0);
    box(trolley, 0.4, 0.22, 0.35, 0, 0, 0, 0x2b2f34, { rough: 0.55, metal: 0.45 });
    const hookGroup = group(trolley, 0, -1.0, 0);
    cyl(hookGroup, 0.02, 0.02, 1.6, 0, 0.8, 0, 0xb9bec4, { rough: 0.4, metal: 0.6, seg: 8 });
    const hookPt = box(hookGroup, 0.14, 0.14, 0.1, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
    reg(hits, hookGroup, "hook-point");
    // A pendant-mounted hoist lever, hanging within reach of the rigger.
    const hoistPendant = group(g, -2.3, 0, -0.3);
    cyl(hoistPendant, 0.02, 0.02, 1.2, 0, 2.9, 0, 0x8a929a, { rough: 0.5, metal: 0.5, seg: 8 });
    box(hoistPendant, 0.18, 0.28, 0.1, 0, 2.2, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const hoistLever = cyl(hoistPendant, 0.018, 0.018, 0.22, 0, 2.36, 0.06, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 8 });
    hoistLever.rotation.x = -0.5;
    holoTag(hoistPendant, "hoist control", 0, 2.5, 0, { css: "#e0632e", w: 0.32 });
    reg(hits, hoistPendant, "crane-hoist-lever");
    const oldRolls = group(g, -1.9, 0.6, -0.3);
    cyl(oldRolls, 0.36, 0.36, 2.3, 0, 0, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(oldRolls, "old roll set", 0, 0.6, 0, { css: "#e0632e", w: 0.32 });
    reg(hits, oldRolls, "old-roll-set");
    // Load path zone under the crane's travel line.
    const loadPath = box(g, 0.9, 3.0, 6.0, 0, 1.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, loadPath, "crane-load-under");
    // Crane hold pendant and line-stop pushbutton at the stand.
    const holdPost = group(g, 2.3, 0, 1.6);
    box(holdPost, 0.2, 1.0, 0.12, 0, 0.5, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const holdBtn = ball(holdPost, 0.06, 0, 0.86, 0.09, 0xd2312b, { emissive: 0x000000, ei: 0.4, rough: 0.4, seg: 12, seg2: 10 });
    holoTag(holdPost, "crane hold", 0, 1.1, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, holdPost, "crane-hold-button");
    const lineStopPost = group(g, -0.4, 0, 2.6);
    box(lineStopPost, 0.2, 1.0, 0.12, 0, 0.5, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const lineStopBtn = ball(lineStopPost, 0.07, 0, 0.86, 0.09, 0xd2312b, { emissive: 0x000000, ei: 0.4, rough: 0.4, seg: 12, seg2: 10 });
    holoTag(lineStopPost, "line stop", 0, 1.1, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, lineStopPost, "line-stop");

    // New roll set staged, with the flaws to find, and the run pendant.
    const newRolls = group(g, 1.9, 0.6, 1.6);
    const nrBarrel = cyl(newRolls, 0.36, 0.36, 2.3, 0, 0, 0, 0xc7ccd1, { rough: 0.32, metal: 0.6, finish: "brushed", seg: 16 });
    nrBarrel.rotation.z = Math.PI / 2;
    holoTag(newRolls, "new roll set", 0, 0.6, 0, { css: "#e0632e", w: 0.32 });
    reg(hits, newRolls, "new-roll-set");
    const spall = box(newRolls, 0.1, 0.02, 0.12, 0.4, 0.35, 0, 0x6a5030, { rough: 0.85 });
    reg(hits, spall, "roll-surface-spall");
    const wornKey = box(newRolls, 0.03, 0.03, 0.14, -1.1, 0, 0, 0x8a6a3a, { rough: 0.75, metal: 0.3 });
    reg(hits, wornKey, "coupling-key-worn");
    const runPendant = group(g, -2.4, 0, 0.6);
    box(runPendant, 0.3, 0.4, 0.1, 0, 1.15, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const runBtn = ball(runPendant, 0.05, 0, 1.28, 0.07, 0x59c97b, { emissive: 0x2f7d4a, ei: 1.1, rough: 0.4, seg: 12, seg2: 10 });
    holoTag(runPendant, "run pendant", 0, 1.4, 0, { css: "#59c97b", w: 0.28 });
    reg(hits, runPendant, "run-pendant");

    // ------------------------------------------------------------ dressing
    const rollShopRack = toolChest(g, -2.7, -1.7, { ry: 0.6, color: 0x545c63 });
    const spareRack = rackFrame(g, 2.6, -2.0, { ry: -0.5, h: 1.4 });
    for (let i = 0; i < 3; i++) rackUnit(spareRack, 0.3 + i * 0.35, ["ROLL #1", "ROLL #3", "COUPLING"][i], { css: "#e0632e" });
    for (const [x, z] of [[-2.9, 2.2], [2.9, -1.0], [0.6, -2.6]]) cone(g, x, z);
    barrierPanel(g, 0, 2.95, { ry: 1.57, color: 0xf0b323 });
    const scaleGuard = group(g, -1.5, 0.1, -2.4);
    box(scaleGuard, 0.7, 0.4, 0.5, 0, 0.2, 0, 0x2b2f34, { rough: 0.7, metal: 0.35, finish: "galvanised" });
    holoTag(scaleGuard, "descaling manifold", 0, 0.5, 0, { css: "#8fb3c4", w: 0.42 });
    const scaleParticles = particles(g, 18, 0xd8dfe6, { size: 0.03, life: 0.6, additive: false, opacity: 0.3 });
    scaleParticles.position.set(-1.5, 0.4, -2.4);

    let locked = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.4, -0.3),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lockout-drive") {
          discHandle.rotation.z = Math.PI / 2; lockA.visible = true;
          decal(brake, 0.14, 0.03, 0, 0.07, 0.011, signFace("LOCKED", { bg: "#22262b", accent: "#59c97b", scale: 0.5 }));
          lockB.visible = true;
        }
        if (step.id === "tach-check") { /* zero proven */ }
        if (step.id === "screwdown-release") { P.screwdown.rotation.y = -0.4; lockC.visible = true; }
        if (step.id === "guard-gate") { P.guardGate.rotation.y = -1.3; }
        if (step.id === "rig-old-rolls") { oldRolls.userData.slung = true; hookPt.material = mat(0x59c97b, { emissive: 0x2f7d4a, ei: 0.8, rough: 0.4 }); }
        if (step.id === "crane-lift-old") {
          oldRolls.parent.remove(oldRolls); trolley.add(oldRolls); oldRolls.position.set(0, -1.3, 0);
        }
        if (step.id === "rig-new-rolls") { newRolls.rotation.z = Math.PI / 2; newRolls.position.set(0, 1.35, -0.3); stand.add(newRolls); }
        if (step.id === "couple-spindle") { keyPin.material = mat(0x59c97b, { emissive: 0x2f7d4a, ei: 0.8, rough: 0.4 }); }
        if (step.id === "guard-close") { P.guardGate.rotation.y = 0; }
        if (step.id === "restore-drive") { discHandle.rotation.z = 0; lockA.visible = false; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "crane-swings") { bridge.position.x = -1.6; holdBtn.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.4, rough: 0.4 }); }
        if (it.id === "line-feed-warning") { lineStopBtn.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.4, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "crane-swings") { bridge.position.x = 0; holdBtn.material = mat(0xd2312b, { emissive: 0x000000, ei: 0.4, rough: 0.4 }); }
        if (it.id === "line-feed-warning") { lineStopBtn.material = mat(0xd2312b, { emissive: 0x000000, ei: 0.4, rough: 0.4 }); }
      },
      animate(t, dt, session) {
        void locked; void dt;
        scaleParticles.visible = true;
        scaleParticles.userData.step?.(0.016, new THREE.Vector3(-1.5, 0.4, -2.4), 0.1, 0.2, 0.4);
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "screwdown-gauge") {
          repaint(gapFace, signFace(`${(0.8 + gg.t * 3.4).toFixed(2)} mm`, { bg: "#0d1c24", accent: gg.t >= 0.45 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#ffe9b0", scale: 0.55 }));
        }
        if (step?.kind === "track" && step.id === "crane-lift-old" && session.track) {
          trolley.position.y = -0.25 - session.track.v * 1.2;
        }
      },
    };
  },
};
