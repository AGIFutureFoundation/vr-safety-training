import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { holoPanel, holoTag, reg, surfaceTexture, texturedMat, siltFace, instrument, standingFigure } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Fish Visual Census & Data Sheet VR — Marine Ecology &
// Restoration, station six of the ECO1 pack, on the bay-underwater district.
//
// An underwater visual census on a fixed belt transect: the census plan read
// against the dive plan, the kit checked, the visibility committed against
// the method's minimum, the size bar checked against its calibration target,
// the timer set, the belt swum at the method's pace counting only what
// crosses ahead, the timer read, the end marker and the plume found, the
// tail count held at the end, the sheet written column by column, the slate
// bagged, the buddy checked and the dive logged. The learner is the census
// diver. Only the METHOD is taught — the corridor, the pace, the size
// classes, the rule against counting behind — and no fish, count or place is
// ever asserted. Depth, gas and time limits are the dive plan's.

const MEFC_ACCENT = 0x6fb0d6;
const MEFC_CSS = "#6fb0d6";
const MEFC_WARN = "#e8622a";

function mefcFish(parent, x, y, z, s, colour) {
  const f = group(parent, x, y, z);
  ball(f, 0.06 * s, 0, 0, 0, colour, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 }).scale.set(2.2, 0.8, 0.6);
  box(f, 0.05 * s, 0.06 * s, 0.01, -0.14 * s, 0, 0, colour, { rough: 0.5, cast: false });
  return f;
}

export const SIM_ME_FISH_VISUAL_CENSUS_AND_DATA_SHEET = {
  id: "me-fish-visual-census-and-data-sheet",
  index: "606",
  domain: "Environmental",
  trade: "Census diver on a restoration monitoring crew, swimming a fixed belt transect with a buddy and writing the data sheet on the bottom",
  category: "Water & Environmental",
  district: "bay-underwater",
  weather: "clear",
  underwater: { depthLabel: "Per dive plan", bottomTimeSeconds: 600 },
  certification: "AFSCME and LIUNA monitoring crews as training bodies; OSHA 29 CFR 1910.424 SCUBA diving as the rule the buddy and standby practice answers to; the programme's diving safety manual and dive plan for every limit; CDFW oversight of the observation method and its permits; NOAA Fisheries and the U.S. Fish and Wildlife Service consultation measures for in-water monitoring; Regional Water Quality Control Board Section 401 and Section 404 monitoring conditions the census reports on; BCDC permit conditions",
  name: "Fish Visual Census & Data Sheet",
  title: simTitle("Fish Visual Census & Data Sheet"),
  tagline: "The census plan read against the dive plan, the kit checked, the visibility committed, the size bar checked on its target, the timer set, the belt swum at the method's pace while a silt plume rolls in, the timer read, the end marker and the plume found, the tail count held while the surface recalls, the sheet written in order, the slate bagged, the buddy checked and the dive logged",
  accent: MEFC_ACCENT,
  accentCss: MEFC_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "counted-ahead", name: "Counted Ahead", note: "The belt swum at pace counting only what crossed ahead, every size class against the bar, and the sheet written on the bottom" },

  supportLine: "your union hall's member assistance programme — AFSCME or LIUNA, whichever your crew works under — with the employer's employee assistance line behind it",

  game: system({
    name: "Census Crew",
    currency: "PASS",
    ranks: ["Diver Trainee", "Census Diver", "Belt Lead", "Monitoring Lead", "Census Certified"],
    badges: [
      { id: "bar-true", name: "Bar True", note: "The size bar checked on its target first time", test: AWARD.stepClean("bar-check") },
      { id: "on-the-belt", name: "On The Belt", note: "Never a hazard, never off the line after a school", test: AWARD.safe },
      { id: "method-pace", name: "Method Pace", note: "Visibility, timer and pace all inside the band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-census", name: "Clean Census", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "unbroken-belt", name: "Unbroken Belt", note: "Pace and tail count held the whole way", test: AWARD.unbroken },
      { id: "sheet-early", name: "Sheet Early", note: "Census logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "chase-the-school": "You left the belt to follow a school that turned away behind the rocks. The census counts what crosses the corridor ahead of the diver at the method's pace and nothing else; a diver who chases a school counts it twice, leaves the buddy, and turns a fixed transect into a swim whose numbers cannot be compared with last season's or anyone else's.",
    "count-behind": "You turned to count the fish that passed behind you as you swam. The method counts only what enters the corridor ahead of the diver, because what is behind has either been counted already or has been drawn in by the diver's own passage; a census that counts behind inflates every pass and cannot be repeated by a diver who follows the method.",
    "light-into-the-school": "You put your torch beam into the school to see the size classes better. A beam changes what fish do — they scatter or they gather — and a count taken in the beam is a count of the diver's own effect. The bar and the eye at the method's distance are the instrument; a light is for reading the slate, pointed down.",
    "surface-to-check": "You started up to check where the boat was when the surface recall sounded. A census diver who leaves the buddy on the belt to look at the surface has broken the pair, and an ascent that is not the plan's ascent is where the surface loses track of the divers. The recall is acknowledged on the bottom and the pair ascends together on the plan.",
  },

  lateNotes: {
    "size-bar": "The bar is checked on its target once the visibility is committed — a size estimate in water the method says is too murky is a guess with a number on it.",
    "census-timer": "The timer is set once the bar is true — the swim starts when both the eye and the clock are calibrated.",
    "census-slate": "The sheet is written once the tail count is done — columns filled before the end marker record a census that is still happening.",
  },

  steps: [
    {
      id: "census-plan", kind: "select", target: "census-plan-board",
      title: "Read the census plan against the dive plan",
      cue: "Check the belt's number and its corridor width, the method's swim time and pace, the size classes, the rule for what counts, and the dive plan's limits as briefed.",
      why: "A visual census is a method, not a look around: one belt, one corridor width, one pace, a set of size classes read against a bar, and a rule about what counts and what does not. The plan fixes all of that so this season's numbers mean the same as last season's; the dive plan fixes the time the pair has to do it in, a number the supervisor holds. Reading both at the downline is what makes the swim a measurement.",
    },
    {
      id: "census-kit", kind: "sequence", anyOrder: true,
      targets: ["slate-check", "bar-check-kit", "timer-check"],
      itemNames: { "slate-check": "data slate with the sheet ruled", "bar-check-kit": "size bar on its lanyard", "timer-check": "bottom timer" },
      title: "Check the slate, the bar and the timer",
      cue: "Slate ruled with the sheet's columns and its pencil on, the size bar on its lanyard, and the timer running and readable.",
      why: "The census exists on the slate and nowhere else until the boat; a slate with no pencil or no ruled columns is a swim with nothing to show for it. The bar is what turns a glance into a size class and the timer is what makes the pace the method's — a diver who finds the timer dead at the start marker has spent the plan's bottom time on a swim that cannot be entered.",
    },
    {
      id: "vis-check", kind: "gauge", target: "vis-target",
      title: "Commit the visibility against the method's minimum",
      cue: "Look along the belt to the visibility target and commit whether it can be read at the method's distance — the plan's minimum, not your opinion.",
      why: "A visual census in water below the method's minimum visibility undercounts the far side of the corridor and cannot be compared with one made in clear water, so the method sets a minimum and the diver reads it before the swim, not after. The number lives in the plan; the diver's job is to read the target honestly and abort the belt if it cannot be seen, because a census that should not have been swum is worse than no census.",
      gauge: { label: "VISIBILITY TARGET", speed: 0.7, green: [0.4, 0.62], readout: (t) => (t < 0.4 ? "target not readable — below minimum" : t <= 0.62 ? "readable at the method's distance" : "over-reading — commit at the target"), missNote: "Not at the target — commit the reading where the target is actually readable, and abort the belt if it is not." },
    },
    {
      id: "bar-check", kind: "drag", target: "size-bar",
      title: "Check the size bar against its calibration target",
      cue: "Hold the size bar against the painted calibration marks on the start stake and confirm the classes line up before the swim.",
      why: "Every size class the census records is an estimate made against the bar in the diver's hand, and a bar that has lost a mark or is held at the wrong distance shifts every fish a class. The calibration marks on the start stake are the same every visit, so the bar is checked there and the eye is recalibrated with it — a census diver's eye drifts between dives, and the method knows it.",
      drag: { to: "calibration-marks", radius: 0.5, missNote: "Not on the calibration marks — hold the bar against the painted marks on the start stake." },
    },
    {
      id: "set-timer", kind: "turn", target: "census-timer",
      title: "Set the timer bezel for the method's swim time",
      cue: "Turn the bezel so the swim time the method gives reads from the timer's hand at the start marker.",
      why: "The pace is the method's and the timer is how the diver keeps it: a belt swum in half the time counts fewer fish than one swum slowly, and neither can be compared with a census swum at the method's pace. The bezel is set at the start marker, not on the way down, because the swim starts when the diver crosses the stake and the timer has to start with it.",
      turn: { turns: 0.7, label: "TIMER BEZEL", readout: (t) => (t < 0.3 ? "bezel off" : t < 0.9 ? "coming to the swim time" : "set for the method's swim time") },
    },
    {
      id: "census-swim", kind: "track", target: "belt-swim", seconds: 6,
      title: "Swim the belt at the method's pace, counting ahead",
      cue: "Swim the belt at the pace the timer sets, eyes ahead across the corridor, counting and classing what enters it — never behind, never off the line.",
      why: "The whole census is this swim: a steady pace so the corridor is sampled evenly, eyes ahead so nothing is counted twice, the bar's classes assigned as each fish crosses. Faster misses what crosses behind the diver's attention and undercounts; slower draws fish in to the diver and overcounts. The pace is the method's, kept against the timer, and the buddy swims a body length behind so their movement never enters the count.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "PACE ON THE BELT", readout: (v) => (v < 0.42 ? "too slow — drawing fish in" : v > 0.6 ? "too fast — missing the corridor" : "the method's pace, counting ahead") },
      holdBreakNote: "The pace broke out of band — racing the corridor or hanging in it. Settle on the line and take up the method's pace.",
    },
    {
      id: "timer-read", kind: "gauge", target: "timer-face",
      title: "Read the timer at the end marker and commit the swim time",
      cue: "At the end marker, read the timer against the bezel and commit whether the swim came in inside the method's band.",
      why: "The swim time is written on the sheet beside the counts because a census swum outside the method's band is flagged in the analysis, not thrown away — but only if the time is recorded honestly. Reading it at the end marker, before the tail count, is how the sheet carries the swim as it was rather than the swim as the diver hoped it went.",
      gauge: { label: "TIMER", speed: 0.7, green: [0.4, 0.6], readout: (t) => (t < 0.4 ? "under the band — swam fast" : t <= 0.6 ? "inside the method's band" : "over the band — swam slow"), missNote: "Outside the method's band — record it as it is; the analysis flags it. Commit the reading you see." },
    },
    {
      id: "find-end", kind: "find", noHint: true,
      targets: ["end-marker", "silt-plume"],
      itemNames: { "end-marker": "the belt's end marker stake", "silt-plume": "the plume of silt drifting across the last metres of the corridor" },
      itemNotes: {
        "end-marker": "The painted stake that ends the belt. The count stops here, whatever is still moving ahead — a belt that runs on to the next rock is a longer belt than last season's.",
        "silt-plume": "A plume of fine silt from the buddy's fins or the current, crossing the corridor's last stretch. It goes on the sheet as reduced visibility for that segment; the method does not pause and wait for it to clear.",
      },
      title: "Find the end marker and note the plume on the corridor",
      cue: "Pick out the belt's end stake and the silt plume that crossed the last stretch; the first ends the count, the second goes on the sheet.",
      why: "The belt has a fixed end so its length is the same every season, and the method records what got in the way rather than pretending it did not: a plume across the last segment is a note on the sheet, not a reason to swim it again. Finding both before the tail count is how the sheet's remarks column says what the numbers alone cannot.",
    },
    {
      id: "tail-count", kind: "hold", target: "tail-hold", seconds: 5,
      title: "Hold at the end marker for the tail count",
      cue: "Hold still at the end stake for the method's tail count, eyes on the corridor ahead, counting what crosses in the settle time.",
      why: "The method ends every belt with a still count at the end marker, because what was disturbed by the swim settles back into the corridor in the first moments the diver stops moving; the tail count is what records it, and it is the same length every time. Holding still for the full count, without drifting or turning, is what keeps it a measurement rather than a last look around.",
      holdBreakNote: "You moved off the end marker before the tail count was done — the settle count is broken. Take the stake and hold again.",
    },
    {
      id: "write-sheet", kind: "sequence",
      targets: ["count-column", "size-column", "remarks-column"],
      itemNames: { "count-column": "counts per class totalled from the tally marks", "size-column": "size classes confirmed against the bar", "remarks-column": "swim time, visibility, plume and initials" },
      title: "Write the data sheet column by column",
      cue: "Total the tally marks into the count column, confirm each line's size class against the bar, then fill the remarks — swim time, visibility, the plume, your initials and the time.",
      why: "The tally marks made on the swim are the raw census, and the sheet is written from them on the bottom, at the end stake, while the corridor is still in view and anything unclear can be looked at again. Counts first, classes confirmed second, remarks last — a sheet written on the boat from memory is where a class drifts and a plume is forgotten, and the analysis has no way to know.",
      outOfOrderNote: "Out of order — counts from the tallies, then the classes against the bar, then the remarks. The sheet records the swim, not the memory of it.",
    },
    {
      id: "bag-slate", kind: "drag", target: "census-slate",
      title: "Bag the slate on the downline clip",
      cue: "Clip the slate into the survey bag on the downline's travelling clip so it goes up with the stage, not in your hand.",
      why: "The slate is the census; a slate dropped on the ascent is a dive's worth of bottom time gone. It goes up on the downline in the bag, clipped, so the ascent is made with both hands free and the sheet arrives on the boat the same way every time — the boat crew know where to look for it, and nobody has to swim after a sinking census.",
      drag: { to: "downline-clip", radius: 0.5, missNote: "Not on the downline clip — the slate goes up in the bag on the downline, not in your hand." },
    },
    {
      id: "buddy-checkin", kind: "select", target: "buddy-signal",
      title: "Check in with your buddy before the ascent",
      cue: "Face your buddy at the downline: exchange the okay, confirm the recall was acknowledged, and agree the ascent on the plan.",
      why: "The ascent is the plan's and it is made as a pair; the check-in at the downline is where a buddy who has swum behind you for the whole belt says how it went, and where a recall from the surface is confirmed as understood by both. It is the crew's own moment — with the AFSCME or LIUNA member assistance line there afterwards for whatever the debrief on the boat does not settle.",
    },
    {
      id: "census-log", kind: "select", target: "dive-log-slate",
      title: "Log the census and the dive on the boat",
      cue: "On the boat's log: belt number, swim time, visibility and the plume, counts per class transcribed from the slate, the recall and the ascent, and the dive record's own entries.",
      why: "The census sheet and the dive record are two documents that must agree, and both are answered for later: the dive record to the programme's diving safety manual and 29 CFR 1910.424 practice, the census to the Section 401 monitoring conditions the restoration reports under. Writing both on deck, with the slate in hand, is how the recall and the plume become part of the record instead of a story.",
    },
  ],

  interrupts: [
    {
      id: "plume-across-belt",
      kind: "Silt plume across the corridor",
      after: "census-swim", delay: 2, seconds: 14,
      alert: "A plume of silt has rolled across the belt ahead of you — the corridor's far side has gone to a brown blur.",
      cue: "Take hold of the belt line and keep the pace, counting only what you can class — do not stop and wait for it to clear.",
      target: "belt-line",
      why: "The method does not pause: a belt swum in two halves with a wait in the middle is a different measurement, and a diver who stops in a plume drifts off the line. The line in the hand keeps the pace and the heading through the blur, what can be classed is counted, and the plume goes on the sheet as reduced visibility for that segment — the honest record of a corridor the diver could not fully see.",
      missNote: "You stopped in the plume to let it clear; the timer ran on, the pace was lost, and the belt went on the sheet as swum outside the method's band with a gap nobody can fill.",
      wrongNote: "Not that. The belt line — take hold of it and keep the method's pace through the plume.",
    },
    {
      id: "surface-recall",
      kind: "Recall from the surface",
      after: "tail-count", delay: 2, seconds: 14,
      alert: "The surface is banging the recall on the ladder — the boat crew want the pair up on the plan's ascent.",
      cue: "Acknowledge the recall on the signal line — one long pull — and stay with your buddy on the bottom until the pair ascends together.",
      target: "signal-line",
      why: "A recall from the surface is answered, not investigated: the pull on the signal line tells the boat the pair has heard it, and the pair then ascends together on the plan's ascent, not on a dash for the surface to see what is wrong. The census is closed where it stands — the tail count ends, the sheet gets a remark — because the boat crew do not sound the recall for anything that can wait.",
      missNote: "The recall went unacknowledged while you finished the tail count; the boat crew, hearing nothing, began the lost-diver procedure for a pair that was fine and thirty seconds from the downline.",
      wrongNote: "Not that. The signal line — one long pull acknowledges the recall, and the pair ascends together on the plan.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // ------------------------------------------------------- the bottom and the belt
    const siltTex = surfaceTexture((cx, w, h) => siltFace(cx, w, h), { px: 256, repeat: 3 });
    const floor = cyl(g, 3.0, 3.4, 0.1, 0, 0.03, -0.5, 0xffffff, { seg: 28, cast: false });
    floor.material = texturedMat(siltTex, { rough: 1, metal: 0, color: 0xa4aa9c });
    for (const [x, z, r] of [[-2.5, -2.0, 0.4], [2.4, -2.2, 0.45], [2.8, 0.8, 0.3], [-2.8, 0.6, 0.35], [0.2, -2.7, 0.5]]) ball(g, r, x, r * 0.35, z, 0x4a5048, { rough: 1, seg: 9, seg2: 7 }).scale.set(1.2, 0.5, 0.9);
    const startStake = group(g, -2.2, 0, 1.0);
    cyl(startStake, 0.015, 0.015, 0.7, 0, 0.35, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    for (let i = 0; i < 4; i++) box(startStake, 0.03, 0.02, 0.006, 0.02, 0.3 + i * 0.1, 0.012, [0xf06a2b, 0xf4f6f6, 0xf06a2b, 0xf4f6f6][i], { rough: 0.6, cast: false });
    const calRing = torus(startStake, 0.14, 0.01, 0, 0.45, 0, MEFC_ACCENT, { emissive: MEFC_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    void calRing;
    holoTag(startStake, "start stake — calibration marks", 0, 0.9, 0, { css: MEFC_CSS, w: 0.56 });
    reg(hits, startStake, "calibration-marks");
    const endStake = group(g, 2.2, 0, -1.3);
    cyl(endStake, 0.015, 0.015, 0.7, 0, 0.35, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    box(endStake, 0.06, 0.1, 0.008, 0.03, 0.62, 0, 0xd2312b, { rough: 0.6 });
    holoTag(endStake, "end marker", 0, 0.9, 0, { css: MEFC_CSS, w: 0.24 });
    reg(hits, endStake, "end-marker");
    const tailHold = torus(g, 0.2, 0.01, 1.8, 0.5, -1.0, MEFC_ACCENT, { emissive: MEFC_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    tailHold.rotation.x = Math.PI / 2;
    holoTag(g, "hold — tail count", 1.8, 0.7, -1.0, { css: MEFC_CSS, w: 0.32 });
    reg(hits, tailHold, "tail-hold");
    const beltLen = Math.hypot(4.4, 2.3);
    const belt = box(g, beltLen, 0.004, 0.02, 0, 0.3, -0.15, 0xf2e6b8, { rough: 0.6 });
    belt.rotation.y = Math.atan2(2.3, 4.4);
    // Corridor edge lines, faint, either side of the belt.
    for (const off of [-0.9, 0.9]) { const e = box(g, beltLen, 0.003, 0.01, off * 0.46, 0.05, -0.15 - off * 0.88, MEFC_ACCENT, { emissive: MEFC_ACCENT, ei: 0.5, rough: 0.6, cast: false, opacity: 0.5, transparent: true }); e.rotation.y = Math.atan2(2.3, 4.4); }
    const beltHit = box(g, 1.0, 0.25, 0.3, -0.4, 0.3, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    beltHit.rotation.y = Math.atan2(2.3, 4.4);
    holoTag(g, "belt line", -0.4, 0.5, 0.1, { css: MEFC_CSS, w: 0.2 });
    reg(hits, beltHit, "belt-line");
    const swim = group(g, -1.0, 0.7, 0.3);
    for (let i = 0; i < 3; i++) { const chev = box(swim, 0.12, 0.012, 0.03, i * 0.22, 0, -i * 0.11, MEFC_ACCENT, { emissive: MEFC_ACCENT, ei: 1.4, rough: 0.4, cast: false }); chev.rotation.y = 0.48; }
    holoTag(swim, "swim the belt — count ahead", 0.2, 0.18, -0.1, { css: MEFC_CSS, w: 0.5 });
    reg(hits, swim, "belt-swim");
    const behindHit = box(g, 0.5, 0.5, 0.5, -1.6, 0.6, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "turn and count behind?", -1.6, 1.0, 1.9, { css: MEFC_WARN, w: 0.42 });
    reg(hits, behindHit, "count-behind");

    // ------------------------------------------------------- the fish
    const schoolA = group(g, 0.3, 0.9, -0.9);
    for (let i = 0; i < 9; i++) mefcFish(schoolA, (i % 3) * 0.3 - 0.3, Math.floor(i / 3) * 0.2, (i % 2) * 0.2, 0.8 + (i % 3) * 0.3, 0x8aa0a8);
    const schoolB = group(g, 2.4, 0.6, 0.8);
    for (let i = 0; i < 6; i++) mefcFish(schoolB, (i % 3) * 0.25, Math.floor(i / 3) * 0.18, (i % 2) * 0.15, 1.2, 0x6a7a80);
    const singles = [];
    for (let i = 0; i < 5; i++) singles.push(mefcFish(g, Math.cos(i * 1.3) * 2.2, 0.4 + (i % 3) * 0.25, -0.4 + Math.sin(i * 1.3) * 1.8, 0.7 + (i % 2) * 0.8, [0x9aa8a0, 0x7a8a7a][i % 2]));
    const chaseHit = box(g, 0.6, 0.6, 0.6, 2.6, 0.7, 1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "follow the school off the belt?", 2.6, 1.15, 1.4, { css: MEFC_WARN, w: 0.54 });
    reg(hits, chaseHit, "chase-the-school");
    const lightHit = box(g, 0.4, 0.4, 0.4, 0.3, 1.3, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "torch into the school?", 0.3, 1.6, -0.9, { css: MEFC_WARN, w: 0.4 });
    reg(hits, lightHit, "light-into-the-school");

    // ------------------------------------------------------- the diver's kit
    const slate = decal(g, 0.28, 0.22, -0.7, 1.05, 1.4, paperFace("CENSUS SHEET", ["Class · tally · count", "Vis · time · remarks"], { bg: "#e8eef0", band: MEFC_CSS }), { px: 192 });
    slate.rotation.y = 0.3;
    holoTag(g, "census slate", -0.7, 1.24, 1.4, { css: MEFC_CSS, w: 0.26 });
    reg(hits, slate, "census-slate");
    const slateCheck = box(g, 0.05, 0.12, 0.012, -0.52, 0.95, 1.42, 0xf2c14b, { rough: 0.6 });
    reg(hits, slateCheck, "slate-check");
    const cols = [];
    for (let i = 0; i < 3; i++) { const c = box(g, 0.07, 0.16, 0.004, -0.8 + i * 0.09, 1.05, 1.41, [0x6fb0d6, 0x59c97b, 0xf2c14b][i], { rough: 0.5, emissive: [0x6fb0d6, 0x59c97b, 0xf2c14b][i], ei: 0.5, opacity: 0.35, transparent: true, cast: false }); c.rotation.y = 0.3; cols.push(c); }
    reg(hits, cols[0], "count-column"); reg(hits, cols[1], "size-column"); reg(hits, cols[2], "remarks-column");
    const bar = group(g, 0.0, 0.95, 1.5, 0.2);
    box(bar, 0.5, 0.025, 0.01, 0, 0, 0, 0xf4f6f6, { rough: 0.5 });
    for (let i = 0; i < 5; i++) box(bar, 0.008, 0.04, 0.012, -0.2 + i * 0.1, 0, 0, i % 2 ? 0x1b1e22 : 0xf06a2b, { rough: 0.6, cast: false });
    holoTag(bar, "size bar", 0, 0.16, 0, { css: MEFC_CSS, w: 0.2 });
    reg(hits, bar, "size-bar");
    const barKit = torus(bar, 0.06, 0.006, 0.28, 0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.6, rough: 0.4, cast: false, seg: 6, seg2: 14 });
    reg(hits, barKit, "bar-check-kit");
    const timer = group(g, -1.2, 1.05, 1.5, 0.3);
    cyl(timer, 0.06, 0.06, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    const bezel = group(timer, 0, 0, 0.02);
    torus(bezel, 0.058, 0.007, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6, seg2: 20 });
    box(bezel, 0.008, 0.04, 0.004, 0, 0.03, 0.01, 0xf06a2b, { rough: 0.5 });
    holoTag(timer, "timer bezel", 0, 0.14, 0, { css: MEFC_CSS, w: 0.26 });
    reg(hits, bezel, "census-timer");
    const timerFace = instrument(timer, 0.14, -0.02, 0, { idle: "-- swim", color: MEFC_ACCENT, w: 0.1, d: 0.16 });
    reg(hits, timerFace, "timer-face");
    const timerCheck = box(timer, 0.03, 0.03, 0.01, -0.09, 0, 0.02, 0xf2c14b, { rough: 0.6 });
    reg(hits, timerCheck, "timer-check");
    const visTarget = group(g, 2.6, 0, -0.2);
    cyl(visTarget, 0.012, 0.012, 0.8, 0, 0.4, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    decal(visTarget, 0.24, 0.24, 0, 0.8, 0.01, (cx, w, h) => { cx.fillStyle = "#f4f6f6"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#1b1e22"; cx.fillRect(0, 0, w / 2, h / 2); cx.fillRect(w / 2, h / 2, w / 2, h / 2); }, { px: 128 });
    const visHead = instrument(visTarget, 0.18, 0.55, 0, { idle: "-- vis", color: MEFC_ACCENT, w: 0.1, d: 0.16 });
    holoTag(visTarget, "visibility target", 0, 1.05, 0, { css: MEFC_CSS, w: 0.32 });
    reg(hits, visHead, "vis-target");

    // ------------------------------------------------------- plume, buddy, downline, signals
    const plume = group(g, 1.4, 0.5, -0.7);
    for (let i = 0; i < 5; i++) ball(plume, 0.5 + (i % 3) * 0.15, -0.6 + i * 0.4, (i % 2) * 0.2, (i % 3) * 0.3 - 0.3, 0x7a806a, { rough: 1, opacity: 0.5, transparent: true, cast: false, seg: 10, seg2: 8 });
    plume.visible = false;
    const plumeMark = torus(g, 0.16, 0.01, 1.4, 0.3, -0.7, 0xc9b48a, { emissive: 0xc9b48a, ei: 1.0, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    plumeMark.rotation.x = Math.PI / 2;
    holoTag(g, "plume — note on sheet", 1.4, 0.52, -0.7, { css: "#c9b48a", w: 0.4 });
    reg(hits, plumeMark, "silt-plume");
    const buddy = standingFigure(g, -1.4, 0.9, { ry: -0.6, cloth: 0x1a2a3a, vest: 0x2f6f5f, helmet: 0x1a2a3a, atStation: true });
    const buddyHome = buddy.position.clone();
    const buddySig = group(g, 0.9, 1.15, 1.7);
    torus(buddySig, 0.12, 0.012, 0, 0, 0, MEFC_ACCENT, { emissive: MEFC_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    holoTag(buddySig, "buddy — okay?", 0, 0.2, 0, { css: MEFC_CSS, w: 0.28 });
    reg(hits, buddySig, "buddy-signal");
    const downline = group(g, -2.4, 0, 2.0);
    box(downline, 0.4, 0.2, 0.4, 0, 0.1, 0, 0x3a3f45, { rough: 0.8, metal: 0.3 });
    cyl(downline, 0.012, 0.012, 8, 0, 4.1, 0, 0xe8dcb8, { rough: 0.8, seg: 6 });
    const clip = group(downline, 0, 1.1, 0);
    torus(clip, 0.14, 0.01, 0, 0, 0, MEFC_ACCENT, { emissive: MEFC_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    holoTag(clip, "downline clip", 0, 0.2, 0, { css: MEFC_CSS, w: 0.26 });
    reg(hits, clip, "downline-clip");
    const signalLine = group(downline, 0.3, 1.5, 0);
    cyl(signalLine, 0.006, 0.006, 3.0, 0, 1.5, 0, 0xf2c14b, { rough: 0.8, seg: 4 });
    const recallLamp = ball(signalLine, 0.05, 0, 0.2, 0, 0x8a2a2a, { emissive: 0x8a2a2a, ei: 0.3, rough: 0.4, seg: 10 });
    holoTag(signalLine, "signal line — one long pull", 0, 0.45, 0, { css: "#f2c14b", w: 0.5 });
    reg(hits, signalLine, "signal-line");
    const upHit = box(g, 0.5, 0.6, 0.5, -1.6, 2.0, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "go up and look?", -1.6, 2.4, 1.6, { css: MEFC_WARN, w: 0.32 });
    reg(hits, upHit, "surface-to-check");
    const planBoard = holoPanel(g, 0.92, 0.6, -2.3, 1.5, 0.1, (cx, w, h) => {
      cx.fillStyle = "#0b161c"; cx.fillRect(0, 0, w, h); cx.fillStyle = MEFC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff0f7"; cx.fillText("CENSUS PLAN — BELT B-2", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Corridor width and swim time per method", "Count ahead only; classes against the bar", "Visibility minimum per plan; abort below it",
       "Limits per the dive plan and the DSO", "Section 401 monitoring · CDFW · NOAA Fisheries"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.6, accent: MEFC_ACCENT });
    reg(hits, planBoard, "census-plan-board");
    const logSlate = decal(g, 0.3, 0.22, -2.0, 1.6, 2.3, paperFace("DIVE + CENSUS LOG", ["Belt · time · vis · plume", "Counts per class", "Recall · ascent"], { bg: "#e8f0ec", band: "#2b8a5a" }), { px: 192 });
    logSlate.rotation.y = 0.4;
    holoTag(g, "log slate — boat", -2.0, 1.82, 2.3, { css: MEFC_CSS, w: 0.32 });
    reg(hits, logSlate, "dive-log-slate");
    const shafts = group(g, 0, 2.8, -0.5);
    for (let i = 0; i < 5; i++) cyl(shafts, 0.06, 0.16, 2.6, -1.6 + i * 0.8, 0, (i % 2) * 0.5, 0xbfe9df, { opacity: 0.08, transparent: true, rough: 0.2, cast: false, seg: 6 });
    for (let i = 0; i < 12; i++) { const k = cyl(g, 0.006, 0.01, 0.4 + (i % 3) * 0.1, -2.6 + (i % 6) * 1.05, 0.2, -2.4 + Math.floor(i / 6) * 0.4, 0x3a7a5f, { rough: 0.9, seg: 4, cast: false }); k.rotation.z = 0.1 * (i % 3 - 1); }

    let swimming = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 0.8, -0.5),
      onStep(step) { if (step?.id === "census-swim") swimming = true; },
      onStepComplete(step) {
        if (step.id === "bar-check") bar.position.set(-2.0, 0.45, 1.0);
        if (step.id === "census-swim") swimming = false;
        if (step.id === "write-sheet") repaint(slate, paperFace("CENSUS SHEET", ["Classes 1–4 · counts totalled", "Time in band · plume last seg", "Initials · time"], { bg: "#e8eef0", band: MEFC_CSS }));
        if (step.id === "bag-slate") slate.position.set(-2.4, 1.1, 2.0);
        if (step.id === "buddy-checkin") buddy.position.set(-2.0, 0, 1.7);
        if (step.id === "census-log") repaint(logSlate, paperFace("DIVE + CENSUS LOG", ["B-2 · time in band · vis at min", "Counts transcribed · plume noted", "Recall answered · pair ascent"], { bg: "#e8f0ec", band: "#2b8a5a" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "plume-across-belt") plume.visible = true;
        if (it.id === "surface-recall") recallLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.4, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.id === "plume-across-belt") plume.visible = false;
        if (it.id === "surface-recall" && it.resolved === "answered") { recallLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.4 }); buddy.position.copy(buddyHome); }
      },
      animate(t, dt, session) {
        schoolA.position.x = 0.3 + Math.sin(t * 0.5) * 1.0; schoolA.rotation.y = Math.cos(t * 0.5) * 0.3;
        schoolB.position.z = 0.8 + Math.cos(t * 0.4) * 0.6;
        singles.forEach((f, i) => { f.position.y = 0.4 + (i % 3) * 0.25 + Math.sin(t * 1.2 + i) * 0.05; f.rotation.y = Math.sin(t * 0.3 + i) * 0.4; });
        if (plume.visible) plume.position.x = 1.4 - Math.sin(t) * 0.3;
        if (swimming) buddy.position.x = Math.min(1.6, buddy.position.x + dt * 0.12);
        const step = session?.step;
        if (session?.turn && step?.id === "set-timer") bezel.rotation.z = -session.turn.amount * 4.4;
        if (session?.gauge && !session.gauge.committed) {
          const gt = session.gauge.t ?? 0;
          if (step?.id === "vis-check") repaint(visHead.userData.screen, signFace(gt < 0.4 ? "blur" : gt <= 0.62 ? "readable" : "over", { bg: "#0d1c24", accent: gt >= 0.4 && gt <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
          if (step?.id === "timer-read") repaint(timerFace.userData.screen, signFace(gt < 0.4 ? "fast" : gt <= 0.6 ? "in band" : "slow", { bg: "#0d1c24", accent: gt >= 0.4 && gt <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
      },
    };
  },
};
