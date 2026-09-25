import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, valveWheel, cone, barrierPanel,
  standingFigure, lockTag, reg, surfaceTexture, texturedMat, mudflatFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Level B Entry & SCBA Change-Out VR — Environmental Monitoring,
// the hazmat and environmental response block.
//
// A fenced entry corridor at the edge of a spill site: a hot line staked
// across a gravel apron, a backup/rescue pair staged at the control point with
// a spare-cylinder cart, and a leaking valve pit inside the hot zone that is
// today's assignment. The learner is the LIUNA hazmat laborer making the
// entry in Level B, with an IAFF technical-rescue backup pair and an
// environmental technician running the entry board. The site is generic.

const HLB_ACCENT = 0x4fd18a;
const HLB_CSS = "#4fd18a";

export const SIM_HZ_LEVEL_B_ENTRY_AND_SCBA_CHANGE_OUT = {
  id: "hz-level-b-entry-and-scba-change-out",
  index: "341",
  domain: "Environmental Monitoring",
  trade: "LIUNA hazmat laborer — Level B entry, with an IAFF technical-rescue backup pair and an environmental technician running the entry board",
  category: "Environmental Monitoring",
  weather: "overcast",
  certification: "OSHA 29 CFR 1910.120 HAZWOPER entry and air-management provisions, 29 CFR 1910.134 for the SCBA and its cylinder change-out, and 29 CFR 1910.1200 hazard communication for the cylinder and cart markings; LIUNA Training hazardous waste worker courses; technical-rescue backup training",
  name: "Level B Entry & SCBA Change-Out",
  title: simTitle("Level B Entry & SCBA Change-Out"),
  tagline: "A hot-line entry: the entry plan read, the backup pair briefed, a spare-cylinder cart staged at the line, Level B donned and its seal held, the cylinder proven above the entry plan's minimum, the tag board signed, the line crossed with backup's word, a hidden valve pit found before it is stepped in, the atmosphere reread at the work point, the leaking valve throttled shut, the flow watched to zero while the alarm cuts through it, the cylinder swapped at the line in order, and the board closed",
  accent: HLB_ACCENT,
  accentCss: HLB_CSS,
  parSeconds: 320,
  footprint: 2.7,
  badge: { id: "in-and-out-on-air", name: "In and Out on Air", note: "Every entry crossed with backup's word, the cylinder swapped before the reserve ran out, and never a step taken off the tape line" },

  supportLine: "your LIUNA local's member assistance programme, with the IAFF peer support line for the backup pair",

  game: system({
    name: "Entry Team",
    currency: "TAG",
    ranks: ["Line Watcher", "Entry Hand", "Entry Team Lead", "Backup Qualified", "Level B Certified"],
    badges: [
      { id: "sealed-before-entry", name: "Sealed Before Entry", note: "The facepiece seal held its full check before the line was crossed", test: AWARD.stepClean("fit-check") },
      { id: "swap-before-empty", name: "Swap Before Empty", note: "Broke off the valve work and reached the change-out point on the first alarm", test: AWARD.stepClean("swap-cylinder") },
      { id: "line-discipline", name: "Line Discipline", note: "Never crossed without backup's word, never a loose seal, never the wrong cylinder off the cart", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-entry", name: "Clean Entry", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "flow-held-to-zero", name: "Flow Held to Zero", note: "Held the valve's flow reading through the whole watch", test: AWARD.unbroken },
      { id: "board-closed-fast", name: "Board Closed Fast", note: "Entry board closed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cross-without-ack": "You started across the hot line before backup answered you. The two-person rule behind every HAZWOPER entry only works if someone outside the line knows the moment you go in — cross before backup acknowledges and the person timing your air, watching your line and ready to come get you does not yet know you are on the clock.",
    "skip-seal-check": "You pulled the hood up over the facepiece without holding the seal check first. A facepiece that leaks at the cheek or the strap does not announce itself — 29 CFR 1910.134 has the wearer prove a seal before entry precisely because the entrant is the one person who cannot feel a slow leak on their own face over the fit check's own held breath.",
    "walk-through-sump": "You stepped straight over the depression instead of routing the marked path around it. Grass and blown dust hide an uncapped valve pit as easily as they hide the drop itself, and a boot that finds it going in finds a leg down a hole that also holds whatever the leaking valve has been putting there — the path is walked around a find like this, never over it.",
    "grab-tagged-cylinder": "You pulled the cylinder marked EMPTY — RETEST off the cart instead of the full one beside it. A hazmat air cart carries a spent bottle back to the compressor along with the fresh ones, and 29 CFR 1910.1200's marking rule is exactly why that bottle wears a tag a glance can read — grabbing the nearest cylinder instead of the tagged one is how an entrant walks away from the change-out point with no air behind the facepiece at all.",
  },

  lateNotes: {
    "cylinder-valve-close": "Nothing to swap yet — the cylinder change-out happens at the change-out point, once the low-air alarm has actually sounded.",
    "regulator-swap": "The regulator only comes off a cylinder that has already been shut down and bled — not before.",
    "functional-check": "There is no fresh cylinder connected yet to functional-check — fit it and open its valve first.",
  },

  steps: [
    {
      id: "entry-plan", kind: "select", target: "hasp-board",
      title: "Read the entry plan: zones, air management and the backup pair",
      cue: "Read the entry plan: the hot line, the backup pair's roles, the cylinder reserve the plan requires before entry, and the recall signal.",
      why: "An entry plan turns a hot zone from a guess into a set of rules everybody on the line is working from: where the hot line actually sits, what the backup pair does if the entrant does not answer, how much air has to be left in the cylinder before the line is crossed, and the one signal that means come out now. It is read before the suit goes on, because the plan cannot be read again once the facepiece seals.",
    },
    {
      id: "backup-brief", kind: "select", target: "backup-radio",
      title: "Brief the backup pair before you suit up",
      cue: "Tell the backup pair the assignment, how long it should take, and the recall signal, before either of you reaches for a suit.",
      why: "The backup pair standing at the line only protects an entrant they understand: what the entrant is going in to do, how long it is expected to take, and what signal means stop and come get them. A backup pair briefed after the entrant is already sealed into a facepiece is a backup pair guessing at all three, and the brief is the one part of this job that has to happen face to face.",
    },
    {
      id: "stage-cylinder-cart", kind: "drag", target: "cylinder-cart",
      title: "Stage the spare-cylinder cart at the hot line",
      cue: "Wheel the cart carrying the fresh cylinders to the change-out point at the hot line before anyone suits up.",
      why: "A cylinder change-out only works fast if the fresh air is already where the entrant will come back to — staged at the line, not fetched from a truck once the low-air alarm is already ringing. The entry plan's air-management section exists because an SCBA cylinder empties on a schedule that does not wait for someone to go find a spare one.",
      drag: { to: "changeout-point", radius: 0.5, missNote: "Not at the line — the cart has to be staged at the change-out point before anyone suits up, or a low-air alarm mid-entry has nothing waiting for it." },
    },
    {
      id: "don-level-b", kind: "sequence",
      targets: ["chem-suit", "scba-facepiece"],
      itemNames: { "chem-suit": "chemical-resistant suit, boots and gloves", "scba-facepiece": "SCBA facepiece seated and strapped" },
      outOfOrderNote: "Suit, boots and gloves first — the facepiece goes on last, over a hood that is already sealed at the wrists and ankles.",
      title: "Don Level B in order: suit, then the SCBA facepiece",
      cue: "Chemical-resistant suit, boots and gloves on and taped, then the SCBA facepiece seated and strapped, with backup checking you.",
      why: "Level B protects against an atmosphere the plan has not fully characterised: a NIOSH-certified SCBA supplying air because a cartridge cannot be trusted against an unknown chemical, and a chemical-resistant suit over it for splash. It goes on in the same order every time, checked by backup rather than by the person wearing it, because the two places Level B actually fails — a gap at the wrist tape and a facepiece seated crooked — are both places the wearer cannot see on themselves.",
    },
    {
      id: "fit-check", kind: "hold", target: "scba-facepiece", seconds: 6,
      title: "Hold the facepiece seal check before the hood comes up",
      cue: "Cover the regulator inlet and inhale gently, holding the facepiece against your face by suction alone, before the hood is pulled up over it.",
      why: "29 CFR 1910.134 has the wearer prove a seal before every entry, and the only way to prove one is to try to break it: cover the inlet, breathe in, and hold the facepiece in place on suction for the full check. A seal that lets go under a gentle draw would have let go the moment the atmosphere inside the hot line turned out to be worse than the plan expected, and there is no way to feel that failure once the hood is up and the entry has started.",
      holdBreakNote: "Let go of the check before it finished — a seal proven for three seconds is a seal that was never actually proven. Hold it the full six.",
    },
    {
      id: "cylinder-check", kind: "gauge", target: "scba-gauge",
      title: "Verify the cylinder above the entry plan's minimum reserve",
      cue: "Read the cylinder gauge and commit the reading once it settles inside the band the entry plan sets for going in.",
      why: "The entry plan's minimum reserve is not a suggestion — it is the margin between the walk in, the work, and the walk back out through decon, all done on the air already on your back. A cylinder committed below that margin is an entry that starts the change-out clock before the first step across the line, and the gauge is read now, in daylight, rather than guessed at once the facepiece has fogged.",
      gauge: { label: "CYLINDER", speed: 0.7, green: [0.76, 0.94], readout: (t) => `${Math.round(t * 100)}% reserve`, missNote: "Not settled above the entry plan's minimum — hold the gauge steady until the reading stops moving, then commit." },
    },
    {
      id: "entry-log", kind: "select", target: "entry-tag-board",
      title: "Sign the entry tag board before crossing the line",
      cue: "Hang your entry tag, log the time in and your cylinder reading, and confirm backup has logged the same.",
      why: "The tag board is how the environmental technician running the line knows, without asking, who is inside, when they went in and how much air they went in with — the same numbers backup needs the moment an alarm sounds. An entry made before the tag is up is an entry nobody outside the line can account for, which is the one thing a permit-based entry system is built to prevent.",
    },
    {
      id: "cross-hotline", kind: "select", target: "hotline-marker",
      title: "Cross the hot line once backup answers you",
      cue: "Call across the line, wait for backup's acknowledgement, then step across at the marked gap.",
      why: "The hot line means nothing as a piece of tape — it means something because backup is watching the exact moment someone crosses it, and that moment only counts if backup actually answered first. Stepping across on your own timing, before the word comes back, is the same line with nobody on the other side of it paying attention yet.",
    },
    {
      id: "path-hazard", kind: "find", noHint: true,
      targets: ["sump-depression"],
      itemNames: { "sump-depression": "grass-covered depression over an uncapped valve pit" },
      itemNotes: { "sump-depression": "The ground dips slightly a few metres inside the line, grass grown over what used to be a valve pit's cover. It is marked and walked around, not stepped over — an uncapped pit takes a boot as readily as it took its own lid." },
      title: "Walk the entry path and find what the ground is hiding",
      cue: "Look at the ground the whole way in: a dip in the grass, a stain the weeds have grown through, anything that is not flat.",
      why: "A hot zone's ground hazards do not announce themselves the way a labelled drum does — a pit that lost its cover months ago just looks like uneven grass until a boot finds the edge of it. Finding it from a look at the ground, before the path is walked at pace with a facepiece narrowing the field of view, is what keeps the walk in from being where the day's injury actually happens.",
    },
    {
      id: "atmosphere-recheck", kind: "gauge", target: "four-gas-meter",
      title: "Reread the atmosphere at the work point before touching anything",
      cue: "Hold the meter at the valve pit and commit the reading once it settles — the entry-point reading does not carry all the way to the work.",
      why: "The atmosphere at the hot line and the atmosphere at a leaking valve are not the same reading, and HAZWOPER's monitoring provisions exist because a plume behaves differently ten metres downwind of where it started. The meter is read again at the actual work point, held until it settles, because the number that cleared the entry does not clear the job by itself.",
      gauge: { label: "LEL / O2", speed: 0.65, green: [0.3, 0.5], readout: (t) => `${(t * 20).toFixed(1)}% LEL`, missNote: "Not a settled reading in the safe band at the work point — hold the meter still until the number stops moving, then commit." },
    },
    {
      id: "isolate-valve", kind: "turn", target: "leak-valve",
      title: "Throttle the leaking valve shut",
      cue: "Take the valve's handwheel and close it slowly, watching the flow gauge rather than counting turns.",
      why: "A valve that has been leaking long enough to need an entry team is not always a valve that closes cleanly — a seat that has been eroding under a flow can bind or jump partway through, and closing by feel on the flow gauge rather than by a fixed number of turns is what catches that before the handwheel is forced past a point it should have stopped at.",
      turn: { turns: 1.25, label: "VALVE", readout: (t) => (t < 0.3 ? "cracked open" : t < 0.85 ? "closing" : "seated") },
    },
    {
      id: "hold-flow-check", kind: "track", target: "flow-gauge", seconds: 6,
      title: "Watch the flow settle to zero as the valve seats",
      cue: "Hold your attention on the flow gauge as the valve closes, keeping the reading inside the band all the way to zero.",
      why: "A valve that looks shut can still be passing a slow flow past a worn seat, and the only way to know it has actually stopped is to watch the gauge all the way down rather than declaring the job done the moment the handwheel stops turning. The watch is held to the end because a leak that restarts once the crew has already turned away is the leak that gets rediscovered somewhere much worse than a valve pit.",
      track: { start: 0.55, green: [0.15, 0.35], rise: 0.1, fall: 0.62, drift: 0.08, label: "FLOW", readout: (v) => (v > 0.35 ? "still passing" : v < 0.15 ? "reading lost" : "falling to zero") },
      holdBreakNote: "The watch broke before the flow reached zero — a valve that stops being watched partway through its close is a valve nobody actually proved shut. Settle it and hold the watch to the end.",
    },
    {
      id: "swap-cylinder", kind: "sequence",
      targets: ["cylinder-valve-close", "regulator-swap", "functional-check"],
      itemNames: { "cylinder-valve-close": "spent cylinder valve closed and bled", "regulator-swap": "regulator moved to the fresh cylinder off the cart", "functional-check": "positive-pressure functional check on the fresh cylinder" },
      outOfOrderNote: "Close and bleed the spent cylinder first, then move the regulator to the fresh one, then run the functional check — never the other way round.",
      title: "Change the SCBA cylinder at the line in order",
      cue: "At the change-out point: close and bleed the spent cylinder, swap the regulator to a fresh one from the cart, and run the functional check before turning back in.",
      why: "A cylinder swap done out of order is how a facepiece ends up connected to a bottle that was never actually opened, or a regulator crossed onto a cylinder nobody proved dead first: the spent cylinder is closed and bled before it is touched again, the fresh one goes on next, and the functional check afterward is the only proof the whole chain from cylinder to facepiece is actually delivering air before anyone turns back toward the line.",
    },
    {
      id: "return-log", kind: "select", target: "entry-tag-board",
      title: "Close the entry on the tag board",
      cue: "Take your tag down, log the time out, the cylinder swap, and the valve reading, and confirm with the technician running the board.",
      why: "The tag coming down is the only signal the technician running the board has that this entry is actually finished — a tag left up after the entrant is out is an entry the next shift's count still carries, and a valve reading left unlogged is a repair the plant engineer never hears was needed.",
    },
    {
      id: "crew-checkin", kind: "select", target: "backup-radio",
      title: "Check in with the backup pair after the swap",
      cue: "Call backup: the valve is shut, the cylinder was swapped mid-entry, and ask how the low-air alarm felt from their side of the line.",
      why: "A low-air alarm inside a hot line is the kind of moment a backup pair remembers longer than the entrant does — they are the ones who do not know, until the radio call comes back, whether it was a routine swap or the start of a rescue. The check-in says it out loud rather than letting it sit, and the LIUNA local's member assistance line exists for whichever side of that radio call needs more than a debrief on the tailgate.",
    },
  ],

  interrupts: [
    {
      id: "perimeter-breach",
      kind: "Pedestrian crossing the tape while the team suits up",
      after: "fit-check", delay: 3, seconds: 16,
      alert: "Backup radios that someone has ducked under the outer tape and is walking toward the hot line while you are still suiting up.",
      cue: "Break off and sound the recall horn — the hot line is not the place for a person who does not know it is there.",
      target: "recall-horn",
      why: "A hot line means nothing to somebody who never read the entry plan, and a pedestrian walking toward one with no facepiece and no idea what is on the other side of the tape is a second casualty forming in real time. The recall horn is the one thing on this pad loud enough to stop them before backup has to physically intercept someone who may already be past the tape.",
      missNote: "The horn stayed silent while the pedestrian kept walking; backup had to leave the change-out point to physically turn them back, and for the length of that chase nobody was watching the entry line at all.",
      wrongNote: "The recall horn — a person walking toward an unmarked hazard answers to noise, not to a radio call they cannot hear.",
    },
    {
      id: "low-air-mid-valve",
      kind: "Low-air alarm with the valve only half closed",
      after: "hold-flow-check", delay: 2, seconds: 14,
      alert: "Your SCBA's low-air alarm starts ringing with the valve only half seated and the flow still above zero.",
      cue: "Leave the valve where it stands, radio backup that you're coming out, and head straight for the change-out point.",
      target: "changeout-point",
      why: "The reserve behind a low-air alarm is sized for the walk out through the hot line and no further, not for finishing a valve that is already most of the way closed. The valve stays where it is — a slower leak is a problem the next entry can finish — because an entrant who keeps working past the alarm to save a second entry is the entrant backup ends up making the actual rescue for.",
      missNote: "The valve work carried on past the alarm; the cylinder ran to its true reserve on the walk back, and backup met an entrant at the line who was already breathing hard against a regulator giving them nothing.",
      wrongNote: "The change-out point — a low-air alarm has one answer, and it is getting to the fresh cylinder staged there before the reserve actually runs out.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, HLB_ACCENT);

    // ---------------------------------------------------------- gravel apron
    const pad = box(g, 6.6, 0.06, 5.2, 0, 0.03, 0, 0xffffff, { rough: 0.98 });
    pad.material = texturedMat(surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#494636", base2: "#3a3728", cracks: 18 }), { repeat: 4, px: 512 }), { rough: 0.98, metal: 0.0, color: 0xc2b998 });

    // The hot line: stakes and tape across the pad, a gap marker to cross at.
    const stakes = [[-3.1, -0.6], [3.1, -0.6]];
    for (const [x, z] of stakes) cyl(g, 0.02, 0.02, 0.9, x, 0.45, z, 0x8a949d, { rough: 0.6, seg: 6 });
    hose(g, [[stakes[0][0], 0.85, stakes[0][1]], [0, 0.82, -0.62], [stakes[1][0], 0.85, stakes[1][1]]], 0.006, 0xd2312b, { steps: 10 });
    const gapPost = group(g, 0.6, 0, -0.6);
    const gapRing = torus(gapPost, 0.22, 0.012, 0, 0.06, 0, HLB_ACCENT, { emissive: HLB_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    gapRing.rotation.x = Math.PI / 2;
    holoTag(gapPost, "hot line — cross here", 0, 0.4, 0, { css: HLB_CSS, w: 0.42 });
    reg(hits, gapRing, "hotline-marker");
    const jumpHit = box(g, 1.0, 0.1, 0.3, -2.0, 0.08, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cross without backup's word?", -2.0, 0.4, -0.6, { css: "#d2312b", w: 0.56 });
    reg(hits, jumpHit, "cross-without-ack");

    // ------------------------------------------------------- hidden valve pit
    const sumpArea = group(g, 1.1, 0, -2.0);
    const sumpFloor = cyl(sumpArea, 0.34, 0.34, 0.03, 0, 0.0, 0, 0x3a3324, { rough: 0.95, seg: 16 });
    sumpFloor.position.y = 0.005;
    holoTag(sumpArea, "sump — walk around", 0, 0.4, 0, { css: HLB_CSS, w: 0.4 });
    reg(hits, sumpFloor, "sump-depression");
    const sumpStep = box(sumpArea, 0.5, 0.08, 0.5, 0, -0.02, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(sumpArea, "step over it?", 0.4, 0.25, 0.3, { css: "#d2312b", w: 0.32 });
    reg(hits, sumpStep, "walk-through-sump");

    // ----------------------------------------------------- the leaking valve
    const pit = group(g, 1.7, 0, -2.5);
    box(pit, 0.9, 0.5, 0.9, 0, -0.24, 0, 0x2b2f34, { rough: 0.85 });
    const valve = valveWheel(pit, 0, 0.02, 0, { color: 0xb8402f });
    holoTag(pit, "leaking valve", 0, 0.65, 0, { css: HLB_CSS, w: 0.32 });
    reg(hits, valve.userData.wheel, "leak-valve");
    const weep = box(pit, 0.14, 0.02, 0.1, 0.16, -0.19, 0.12, 0x14100a, { rough: 0.15, metal: 0.2, emissive: 0x0a0806, ei: 0.2 });
    const flowMeter = instrument(pit, 0.35, 0.32, 0.28, { ry: -0.4, idle: "-- FLOW", color: HLB_ACCENT, w: 0.1, d: 0.16 });
    holoTag(flowMeter, "flow gauge", 0, 0.16, 0, { css: HLB_CSS, w: 0.26 });
    reg(hits, flowMeter, "flow-gauge");

    // ------------------------------------------------------- change-out cart
    const cart = group(g, 2.4, 0, 1.6);
    box(cart, 0.7, 0.05, 0.4, 0, 0.42, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    for (const [wx, wz] of [[-0.28, -0.15], [0.28, -0.15], [-0.28, 0.15], [0.28, 0.15]]) cyl(cart, 0.05, 0.05, 0.04, wx, 0.05, wz, 0x14171a, { rough: 0.8, seg: 12 }).rotation.z = Math.PI / 2;
    const goodTank = cyl(cart, 0.09, 0.09, 0.5, -0.15, 0.7, 0, 0xe8b02e, { rough: 0.4, metal: 0.5, seg: 16 });
    const spareTank = cyl(cart, 0.09, 0.09, 0.5, 0.15, 0.7, 0, 0xe8b02e, { rough: 0.4, metal: 0.5, seg: 16 });
    const emptyTank = cyl(cart, 0.09, 0.09, 0.5, 0.4, 0.7, 0, 0x8a8f94, { rough: 0.5, metal: 0.4, seg: 16 });
    decal(cart, 0.16, 0.1, 0.4, 0.98, 0.05, signFace("EMPTY", { bg: "#3a1414", accent: "#f0645b", fg: "#ffd8d0", scale: 0.5 }), { px: 96 });
    holoTag(cart, "spare cylinder cart", 0, 1.05, 0, { css: HLB_CSS, w: 0.4 });
    reg(hits, cart, "cylinder-cart");
    const changeout = group(g, 2.4, 0, 0.9);
    const changeoutRing = torus(changeout, 0.3, 0.012, 0, 0.02, 0, HLB_ACCENT, { emissive: HLB_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    changeoutRing.rotation.x = Math.PI / 2;
    holoTag(changeout, "change-out point", 0, 0.32, 0, { css: HLB_CSS, w: 0.38 });
    reg(hits, changeoutRing, "changeout-point");
    const lowAirLamp = ball(cart, 0.04, 0, 1.02, -0.15, 0xd2312b, { emissive: 0xd2312b, ei: 2.4 });
    lowAirLamp.visible = false;
    reg(hits, spareTank, "cylinder-valve-close");
    reg(hits, goodTank, "regulator-swap");
    const functionalMarker = box(changeout, 0.2, 0.2, 0.05, 0, 0.5, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, functionalMarker, "functional-check");
    const badCyl = emptyTank;
    reg(hits, badCyl, "grab-tagged-cylinder");

    // -------------------------------------------------------- tools & board
    const chest = toolChest(g, -1.4, 1.6, { ry: 0.3, color: 0x2f4f6f });
    const gauge = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "-- % ", color: HLB_ACCENT, w: 0.1, d: 0.18 });
    holoTag(gauge, "SCBA cylinder gauge", 0, 0.16, 0, { css: HLB_CSS, w: 0.4 });
    reg(hits, gauge, "scba-gauge");
    const fourGas = instrument(chest, 0.16, 0.79, 0.04, { ry: 0.1, idle: "-- LEL", color: HLB_ACCENT, w: 0.1, d: 0.16 });
    holoTag(fourGas, "four-gas meter", 0, 0.16, 0, { css: HLB_CSS, w: 0.34 });
    reg(hits, fourGas, "four-gas-meter");
    const radio = instrument(chest, -0.2, 0.79, -0.14, { ry: 0.4, idle: "CH 3 · BACKUP", color: HLB_ACCENT, w: 0.08, d: 0.12 });
    holoTag(radio, "backup radio", 0, 0.16, 0, { css: HLB_CSS, w: 0.3 });
    reg(hits, radio, "backup-radio");

    const hasp = holoPanel(g, 0.95, 0.66, -2.6, 1.35, 1.0, (cx, w, h) => {
      cx.fillStyle = "#07170f"; cx.fillRect(0, 0, w, h); cx.fillStyle = HLB_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f5e6"; cx.fillText("ENTRY PLAN — HOT LINE B", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eefaf3";
      ["Hot line staked at the tape · gap marker only", "Level B: SCBA + chem suit · backup pair at line",
        "Minimum reserve to enter: plan's band on the gauge", "Recall signal: continuous horn = all entrants out",
        "Spare cylinders staged before any entry", "Sump/pit hazards marked, never crossed"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.6, accent: HLB_ACCENT });
    reg(hits, hasp, "hasp-board");

    const board = holoPanel(g, 0.6, 0.42, -0.2, 1.3, 1.9, (cx, w, h) => {
      cx.fillStyle = "#07170f"; cx.fillRect(0, 0, w, h); cx.fillStyle = HLB_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f5e6"; cx.fillText("ENTRY TAG BOARD", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eefaf3";
      ["In: —", "Cylinder: —", "Out: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.5, accent: HLB_ACCENT });
    reg(hits, board, "entry-tag-board");

    // -------------------------------------------------------------- PPE rack
    const rack = group(g, -2.7, 0, 1.3, 0.5);
    cyl(rack, 0.02, 0.02, 1.5, 0, 0.75, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.6, 0.03, 0.03, 0, 1.45, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const suit = group(rack, -0.16, 1.05, 0.03);
    box(suit, 0.24, 0.6, 0.08, 0, 0, 0, 0xe8d23a, { rough: 0.7 });
    box(suit, 0.1, 0.1, 0.08, 0, 0.36, 0, 0xe8d23a, { rough: 0.7 });
    holoTag(rack, "chemical suit", -0.16, 1.7, 0, { css: HLB_CSS, w: 0.26 });
    reg(hits, suit, "chem-suit");
    const scba = group(rack, 0.2, 1.05, 0.03);
    cyl(scba, 0.07, 0.07, 0.45, 0, 0, -0.03, 0xc0c6cc, { rough: 0.4, metal: 0.6, seg: 12 });
    const facepiece = ball(scba, 0.08, 0, 0.2, 0.08, 0x14171a, { rough: 0.5 });
    facepiece.scale.set(1, 1.2, 0.6);
    const looseHood = box(scba, 0.14, 0.02, 0.05, 0, 0.36, 0.06, 0x2b3138, { opacity: 0.001, transparent: true, cast: false });
    holoTag(rack, "SCBA facepiece", 0.24, 1.6, 0, { css: HLB_CSS, w: 0.32 });
    reg(hits, scba, "scba-facepiece");
    holoTag(rack, "hood up now?", 0.5, 1.55, 0.06, { css: "#d2312b", w: 0.3 });
    reg(hits, looseHood, "skip-seal-check");

    // ---------------------------------------------------------- perimeter
    const hornPost = group(g, -3.0, 0, 2.0);
    cyl(hornPost, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const horn = cyl(hornPost, 0.06, 0.1, 0.16, 0, 1.28, 0, 0xd2312b, { rough: 0.5, seg: 12 });
    holoTag(hornPost, "recall horn", 0, 1.5, 0, { css: HLB_CSS, w: 0.3 });
    reg(hits, horn, "recall-horn");
    cone(g, -3.4, -1.4); cone(g, 3.4, -1.4);
    barrierPanel(g, -2.6, -1.1, { color: 0xf2c14b, ry: 0.3 });

    // ------------------------------------------------------------------ crew
    const backup1 = standingFigure(g, 2.9, 2.3, { ry: -2.6, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xe8b02e });
    holoTag(backup1, "backup — IAFF", 0, 1.95, 0, { css: HLB_CSS, w: 0.32 });
    const backup2 = standingFigure(g, 2.1, 2.6, { ry: -2.9, cloth: 0x2b3138, vest: HLB_ACCENT, helmet: 0xf2f2f2 });
    holoTag(backup2, "entry technician", 0, 1.95, 0, { css: HLB_CSS, w: 0.36 });
    const pedestrian = standingFigure(g, -3.6, 3.6, { ry: 0.5, cloth: 0x3a5a7a, trousers: 0x2b3138 });
    pedestrian.visible = false;
    const pedestrianHome = pedestrian.position.clone();

    return {
      hits,
      spawnLook: new THREE.Vector3(0.5, 0.8, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "stage-cylinder-cart") cart.position.set(2.4, 0, 1.0);
        if (step.id === "fit-check") looseHood.visible = false;
        if (step.id === "cylinder-check") repaint(gauge.userData.screen, signFace("RESERVE OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "entry-log") {
          repaint(board.userData.face, (cx, w, h) => {
            cx.fillStyle = "#07170f"; cx.fillRect(0, 0, w, h); cx.fillStyle = HLB_CSS; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#d8f5e6"; cx.fillText("ENTRY TAG BOARD", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eefaf3";
            ["In: logged", "Cylinder: above minimum", "Out: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "path-hazard") sumpFloor.material = mat(0x5a4a2a, { rough: 0.9 });
        if (step.id === "atmosphere-recheck") repaint(fourGas.userData.screen, signFace("BELOW LEL", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "isolate-valve") weep.visible = false;
        if (step.id === "swap-cylinder") { lowAirLamp.visible = false; repaint(gauge.userData.screen, signFace("FRESH · 100%", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 })); }
        if (step.id === "return-log") {
          repaint(board.userData.face, (cx, w, h) => {
            cx.fillStyle = "#07170f"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#d8f5e6"; cx.fillText("ENTRY TAG BOARD", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["In: cleared", "Cylinder: swapped mid-entry", "Out: logged — valve shut"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("LINE CLEAR", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "perimeter-breach") { pedestrian.visible = true; pedestrian.position.set(-1.4, 0, -0.4); }
        if (it.id === "low-air-mid-valve") lowAirLamp.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "perimeter-breach") { pedestrian.position.copy(pedestrianHome); pedestrian.visible = false; }
        if (it.id === "low-air-mid-valve") cart.position.set(2.4, 0, 1.0);
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "isolate-valve") valve.userData.wheel.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "cylinder-check") repaint(gauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.76 && gg.t <= 0.94 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (gg && !gg.committed && step?.id === "atmosphere-recheck") repaint(fourGas.userData.screen, signFace(`${(gg.t * 20).toFixed(1)}%`, { bg: "#0d1c24", accent: gg.t >= 0.3 && gg.t <= 0.5 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (step?.id === "hold-flow-check" && session.holding) {
          const v = session.track.v;
          repaint(flowMeter.userData.screen, signFace(v > 0.02 ? `${(v * 40).toFixed(0)} L/M` : "0 L/M", { bg: "#0d1c24", accent: v <= 0.35 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        void dt; void CITY; void lockTag;
      },
    };
  },
};
