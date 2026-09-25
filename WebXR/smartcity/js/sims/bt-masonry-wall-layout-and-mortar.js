import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, hose, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure,
  reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { pickup } from "../../../shared/fleet.js";
import { drill, level, tapeMeasure, radio, hoseReel } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Masonry Wall Layout & Mortar VR — Builders: Carpenters,
// Laborers and Masons.
//
// A concrete-block wall starting on its footing: BAC bricklayers laying it
// out from the gridlines, dry-bonding the first course, building the corner
// lead to the story pole and running the line, with LIUNA mason tenders
// batching the mortar to the specification's proportions and keeping the
// silica dust down, and the wall held inside its limited access zone and
// braced "per the bracing plan" as it rises. The mortar proportions, the
// unbraced height and the wind limits all belong to the specification and
// the bracing plan; this file states none of those numbers.

const BML_ACCENT = 0x8fa65a;
const BML_CSS = "#8fa65a";
const BML_WALL_Z = -1.6;            // the wall's face line on the footing
const BML_FOOT = 0.2;               // footing top

/** A concrete-block face: running bond, mortar joints, a little tone per unit. */
function bmlBlockFace(cx, w, h, courses = 6, units = 8) {
  cx.fillStyle = "#b9b4a8"; cx.fillRect(0, 0, w, h);
  const ch = h / courses, uw = w / units;
  for (let r = 0; r < courses; r++) {
    const off = r % 2 ? uw / 2 : 0;
    for (let i = -1; i <= units; i++) {
      const tone = ((r * 7 + i * 13) % 5) * 5;
      cx.fillStyle = `rgb(${170 + tone},${166 + tone},${156 + tone})`;
      cx.fillRect(i * uw + off + 2, r * ch + 2, uw - 4, ch - 4);
    }
  }
  cx.fillStyle = "rgba(0,0,0,0.06)";
  for (let i = 0; i < 600; i++) cx.fillRect((i * 97) % w, (i * 57) % h, 2, 2);
}

export const SIM_BT_MASONRY_WALL_LAYOUT_AND_MORTAR = {
  id: "bt-masonry-wall-layout-and-mortar",
  index: "323",
  domain: "Construction & Structural Trades",
  trade: "Bricklayer — BAC, with LIUNA mason tenders — block wall layout, mortar and bracing",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "BAC bricklayer apprenticeship through the International Masonry Institute, and LIUNA Training mason tender curricula; OSHA 29 CFR 1926.706 — the limited access zone for a masonry wall under construction and bracing of masonry walls against overturning and collapse — under 29 CFR 1926 Subpart Q; 29 CFR 1926.1153 respirable crystalline silica, dust from mixing and cleanup kept down by wet methods; ANSI A10.9 concrete and masonry construction safety; the project's mortar specification and the wall bracing plan",
  name: "Masonry Wall Layout & Mortar",
  title: simTitle("Masonry Wall Layout & Mortar"),
  tagline: "A block wall started right: the layout drawing and the bracing plan read, the wall line snapped and squared from the benchmarks, the first course dry-bonded, the site walked, the limited access zone set, the mortar batched to the spec's proportions with the dust kept down, the story pole set, the line run and trigged, a course laid to it, the wall braced per the bracing plan, and the day logged",
  accent: BML_ACCENT,
  accentCss: BML_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "to-the-line-and-braced", name: "To The Line And Braced", note: "A wall laid out square, laid to its line, batched to the spec and braced per the plan, with nobody inside its limited access zone" },

  supportLine: "your BAC or LIUNA local's member assistance programme, or the employee assistance line posted on the contractor's site board",

  game: system({
    name: "Wall Gang",
    currency: "COURSE",
    ranks: ["Apprentice", "Mason Tender", "Layout Mason", "Lead Mason", "Wall Gang Certified"],
    badges: [
      { id: "square-from-the-start", name: "Square From The Start", note: "Wall line snapped and squared without a correction", test: AWARD.stepClean("layout-lines") },
      { id: "true-to-the-line", name: "True To The Line", note: "The course laid to the line throughout", test: AWARD.unbroken },
      { id: "zone-kept", name: "Zone Kept", note: "No shortcut through the zone, no extra course over the plan, no leaning on the green wall, no bare hands in mortar", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-lift", name: "Clean Lift", note: "No corrections through the whole lift", test: AWARD.clean },
      { id: "batched-to-spec", name: "Batched To Spec", note: "The mortar proportioned inside the band first time", test: AWARD.precise(0.7) },
      { id: "lift-by-lunch", name: "Lift By Lunch", note: "Wall braced and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "lac-shortcut": "You cut through the limited access zone behind the wall. OSHA 29 CFR 1926.706 establishes that zone before a masonry wall goes up, on the side without scaffolding, the length of the wall and as wide as its planned height plus four feet, because a new wall that overturns lands in exactly that strip. Only the masons building the wall work inside it.",
    "extra-course": "You went to lay one more course before the brace is in. The bracing plan sets how high this wall may stand unbraced while its mortar is still green, because a fresh wall has almost no strength against wind until the mortar cures. The brace goes in at the plan's height, and only then does the next course go on.",
    "lean-on-green-wall": "You went to lean the plank against the wall laid this morning. Fresh mortar holds a block in place and very little else; a plank or ladder against green masonry pushes the top courses out of plumb or over. Nothing leans on new work until it has cured and been braced.",
    "bare-hand-mortar": "You went to work the mortar with bare hands. Wet cement is strongly alkaline and it burns skin slowly and deeply without much pain at first. Mortar is handled with the trowel and gloves, and splashes are washed off at once.",
  },

  lateNotes: {
    "chalk-line": "The wall line is snapped once the benchmarks are set up from the gridlines — a line snapped from the edge of the footing is only as straight as the footing.",
    "line-block": "The line is run once the story pole and the corner lead are set — it has nothing to be pulled to before that.",
    "wall-log": "The day is logged once the wall is braced per the plan.",
  },

  steps: [
    {
      id: "layout-drawing", kind: "select", target: "layout-drawing",
      title: "Read the layout drawing and the bracing plan",
      cue: "Read the drawing and the plan: the gridlines, the wall's length and openings, the bond, today's lift height, the mortar type, and when the bracing plan says the wall must be braced.",
      why: "A masonry wall is laid out once, at its first course, and everything above follows that first course — its line, its bond, where its openings fall. The bracing plan belongs to the same reading, because the height the wall may stand unbraced while its mortar is green sets how today's lift is built. The mason reads both before a line is snapped, because a wall started wrong is a wall taken down.",
    },
    {
      id: "layout-lines", kind: "sequence",
      targets: ["benchmark", "chalk-line", "square-check"],
      itemNames: { benchmark: "benchmarks set up from the gridlines", "chalk-line": "the wall's face line snapped on the footing", "square-check": "the corner checked square on the diagonal" },
      outOfOrderNote: "Benchmarks from the gridlines first, then snap the line between them, then check the corner square — a line snapped before the benchmarks is only guessed.",
      title: "Lay the wall out: benchmarks, line, square",
      cue: "Set the benchmarks off the gridlines, snap the wall's face line between them, then check the corner square on the diagonal.",
      why: "The wall's line comes from the building's gridlines, not from the edge of a footing that may be out by its own tolerance. Benchmarks are measured off the gridlines, the chalk line is snapped between them, and the corner is checked square on the diagonal so the return wall starts where the drawing puts it. A layout that is square and on the gridlines is the one decision that every course above inherits.",
    },
    {
      id: "dry-bond", kind: "select", target: "dry-bond",
      title: "Dry-bond the first course along the line",
      cue: "Lay the first course out dry along the line to check the bond, the joints and where the openings fall before any mortar is spread.",
      why: "Laying the first course dry shows whether the wall's length works out in whole and half units at the bond the drawing calls for, and whether the openings land on a joint. A problem found dry is solved by adjusting the joints slightly across the whole run; found five courses up, it is a cut block in the middle of a wall face and an opening off its layout.",
    },
    {
      id: "wall-walk", kind: "find", noHint: true,
      targets: ["no-access-zone", "cracked-block", "unbraced-lift"],
      itemNames: {
        "no-access-zone": "no limited access zone set behind the wall",
        "cracked-block": "cracked units in the block cube",
        "unbraced-lift": "yesterday's lift standing past the plan's unbraced height with no brace",
      },
      itemNotes: {
        "no-access-zone": "The side of the wall with no scaffold has nothing marking it off: laborers are using it as a walkway. The limited access zone goes up before the wall goes any higher.",
        "cracked-block": "Several block in the top of the cube are cracked through. A cracked unit in a wall is a weak point for good; they are set aside, not laid.",
        "unbraced-lift": "Yesterday's section was laid past the height the bracing plan allows unbraced and left overnight with no brace. It gets braced before anyone works beside it.",
      },
      title: "Walk the wall and the block before the lift starts",
      cue: "Walk the footing, the block cube, yesterday's section and the ground either side of the wall.",
      why: "The walk is where the three things that hurt masons on a new wall are caught before anyone is working beside it: a wall with no limited access zone behind it, a cube of block with cracked units in it, and a section left standing taller than its bracing allows. Each is easy to fix while the crew is still setting up and none of them is visible from the scaffold once the lift is underway.",
    },
    {
      id: "access-zone", kind: "drag", target: "zone-barricade",
      title: "Set the limited access zone behind the wall",
      cue: "Carry the barricade to the side of the wall with no scaffold and close off the strip along its length, with the danger sign on the signage pad.",
      why: "OSHA 29 CFR 1926.706 requires a limited access zone before a masonry wall is built: on the side without scaffolding, running the whole length of the wall and as wide as the wall's planned height plus four feet, entered only by the masons actually building it. It is set before the lift goes up because a wall that falls does not give the people walking beside it time to move.",
      drag: { to: "zone-mark", radius: 0.6, missNote: "Not on the zone line — the barricade closes the strip behind the wall, on the side with no scaffold, for the wall's full length." },
    },
    {
      id: "mix-ratio", kind: "gauge", target: "gauge-box",
      title: "Batch the mortar to the specification's proportions",
      cue: "Fill the gauge box with sand against the bag of cement and commit when the proportions match the mortar type the specification calls for.",
      why: "Mortar strength and workability come from its proportions, and the specification names a mortar type for this wall for a reason: too lean and the joints are weak and crumble, too rich and the mortar shrinks and cracks and is harder than the block it binds. Batching by the gauge box instead of by shovels-full is how every batch comes out the same, and a wall built from one batch at a time is only as good as its worst one.",
      gauge: {
        label: "MIX", speed: 0.7, green: [0.44, 0.6],
        readout: (t) => (t < 0.44 ? "lean — too much sand" : t <= 0.6 ? "on the specification's proportions" : "rich — too much cement"),
        missNote: "Off the specification's proportions — level the sand in the gauge box and check it against the bag again.",
      },
    },
    {
      id: "bag-dump", kind: "hold", target: "paddle-mixer", seconds: 5,
      title: "Mix with the paddle down in the tub, water in first",
      cue: "Put the water in the tub first, tip the bag in low, and hold the paddle mixer down in the batch so the dust stays in the tub.",
      why: "Dry masonry mix is fine sand and cement, and tipping it from height or spinning a paddle in a dry tub throws a cloud of respirable silica into the tender's breathing zone. Water in first, the bag opened low and the paddle held down in the batch keeps the dust wet and in the tub — one of the ways the silica rule's wet methods reach beyond cutting to everything a crew does with dry masonry material.",
      holdBreakNote: "The paddle came up out of the batch and threw dry mix into the air. Put it back down in the tub and hold it.",
    },
    {
      id: "story-pole", kind: "select", target: "story-pole",
      title: "Set the story pole at the corner",
      cue: "Stand the story pole plumb at the corner with its course heights marked to the drawing, including the openings' heads and sills.",
      why: "The story pole carries the wall's course heights from the drawing to the corner, so every course at every lead is laid to the same heights and the openings' sills and heads land where the drawing puts them. Set plumb and fixed, it is the vertical reference the corner lead is built to and the line is raised by, all day.",
    },
    {
      id: "line-block", kind: "turn", target: "line-block",
      title: "Run the mason's line taut between the leads",
      cue: "Hook the line block on the corner lead at the course height and wind the line taut to the far lead.",
      why: "The mason's line is what makes a wall straight and level between its corners: every block in the course is laid to it, a line's width away. It only works taut — a slack line sags in the middle and the course sags with it, and nobody sees that until the wall is up and the sightline along its top is wavy.",
      turn: { turns: 1, label: "LINE", readout: (t) => (t < 0.95 ? "winding — line sagging" : "line taut to the far lead") },
    },
    {
      id: "trig", kind: "select", target: "trig",
      title: "Set the trig at mid-span",
      cue: "Lay the trig block at mid-span to the story height and set the line into its trig clip so it cannot sag or blow.",
      why: "A long line sags under its own weight and moves in the wind no matter how tight it is wound. The trig — a block laid to height at mid-span, holding the line in a clip — takes out the sag and the flutter, so the middle of the course is as level and straight as its ends. On a windy day it is the difference between a line and a guess.",
    },
    {
      id: "lay-course", kind: "track", target: "course-block", seconds: 6,
      title: "Lay the course to the line",
      cue: "Set each block to the line — its top edge level with the line and a line's width off it — and keep the course true as you go.",
      why: "Laying to the line means every block's top outside edge sits level with the line and just clear of it; touching the line pushes it and every block after is off. Kept true block by block, the course comes out straight and level along its whole length; let it wander and the next course has to be laid to correct it, which is how a wall face ends up with a bow in it.",
      track: { start: 0.2, green: [0.4, 0.6], rise: 0.56, fall: 0.46, drift: 0.13, label: "COURSE", readout: (v) => (v < 0.4 ? "block low / off the line" : v > 0.6 ? "block high / pushing the line" : "to the line") },
      holdBreakNote: "The course wandered off the line while nobody was checking. Tap the last block back to the line and keep laying to it.",
    },
    {
      id: "brace", kind: "drag", target: "wall-brace",
      title: "Brace the wall per the bracing plan",
      cue: "Carry the brace to the wall and set it at the position and height the bracing plan gives, anchored at its foot, before another course goes on.",
      why: "A new masonry wall has almost no strength against the wind until its mortar cures, and OSHA 29 CFR 1926.706 requires walls over eight feet to be adequately braced unless otherwise supported against overturning. The bracing plan says where and when: the brace goes in at the height the plan allows the wall to stand unbraced, anchored at its foot, before the lift goes any higher.",
      drag: { to: "brace-anchor", radius: 0.6, missNote: "Not at the plan's brace position — the brace goes against the wall where the bracing plan marks it, anchored at its foot." },
    },
    {
      id: "wall-log", kind: "select", target: "wall-log",
      title: "Log the day's lift",
      cue: "Record the courses laid, the mortar batches, the brace set, the cracked block set aside, yesterday's section braced, the dry sweeping stopped and the wind stop.",
      why: "The mason's daily log is how the foreman and the next shift know where the wall is against its bracing plan: how high it stands, what is braced and when it was laid, which matters because mortar gains strength by the day. It is also the record that the dust from the dry sweeping was stopped and the zone was cleared for the wind — the things an inspector will ask about first.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the foreman",
      cue: "Call the foreman: lift braced and logged. Then check in with the tenders and masons about the dust and the gust on the green wall.",
      why: "The foreman plans tomorrow's lift and the bracing crew around this call, and nobody takes the zone down until it is made. It is also the crew's check-in: a gust hitting a green wall with people behind it and a dust cloud over the mortar tubs are things a crew thinks about afterward, and the trades' practice is to name them on the radio and name the member assistance line in the same breath.",
    },
  ],

  interrupts: [
    {
      id: "dry-sweeping",
      kind: "Silica dust from dry sweeping",
      after: "bag-dump", delay: 2, seconds: 12,
      alert: "A tender at the next tub has started dry-sweeping cured mortar droppings off the footing, and a cloud of dust is drifting across the crew.",
      cue: "Wet it down with the hose and stop the dry sweeping.",
      target: "water-hose",
      why: "Dried mortar droppings are sand and cement, and sweeping them dry puts respirable crystalline silica straight into the air the crew is breathing. The silica rule does not let dry sweeping be used where wet methods or a vacuum will do; the hose wets the footing down and the sweeping stops until it is wet.",
      missNote: "The dry sweeping went on across the footing for the rest of the batch; a haze of fine dust hung over the tubs and the tender at the far one was coughing by the time it settled.",
      wrongNote: "The water hose — the dust cloud over the crew comes first, and it is stopped by wetting the footing down.",
    },
    {
      id: "gust-on-green-wall",
      kind: "Wind over the bracing plan's limit",
      after: "lay-course", delay: 2, seconds: 12,
      alert: "The anemometer on the scaffold has jumped past the bracing plan's limit for walls still in their initial period, and a mason tender is standing in the limited access zone behind the green section.",
      cue: "Sound the wind alarm and clear the zone behind the wall, per the bracing plan.",
      target: "wind-alarm",
      why: "Bracing plans set wind speeds at which the zone behind a wall still in its initial period must be cleared, because past them the brace may not hold a wall whose mortar has barely set. The alarm clears the zone first; the masons come off the wall and nobody goes back in until the wind drops back below the plan's figure.",
      missNote: "The tender stayed in the zone behind the wall through the gust; the top two green courses of the unbraced end rocked and dropped a block onto the ground where he had been standing a moment before.",
      wrongNote: "The wind alarm — someone is in the zone behind a green wall in wind past the plan's limit, and the zone is cleared before anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BML_ACCENT);

    // ----------------------------------------------- ground, footing, the walls
    const ground = box(g, 9.0, 0.04, 7.0, 0, 0.02, -1.0, 0xffffff);
    ground.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6a6152", base2: "#5f574a", seam: "rgba(0,0,0,0.2)" }), { repeat: 5, px: 512 }), { rough: 0.98, color: 0xcabea8 });
    const footMat = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 2, base: "#9a968c", base2: "#908c82", seam: "rgba(0,0,0,0.1)" }), { repeat: 1, px: 256 }), { rough: 0.95, color: 0xe4e0d6 });
    const footing = box(g, 6.4, BML_FOOT, 0.7, 0, BML_FOOT / 2, BML_WALL_Z - 0.1, 0xffffff);
    footing.material = footMat;
    const blockTex = surfaceTexture((cx, w, h) => bmlBlockFace(cx, w, h, 6, 8), { repeat: 1, px: 512 });
    const blockMat = texturedMat(blockTex, { rough: 0.92, color: 0xffffff });
    // Yesterday's section at the west end — past the plan's unbraced height, no brace.
    const oldWall = box(g, 2.4, 1.2, 0.2, -1.9, BML_FOOT + 0.6, BML_WALL_Z - 0.1, 0xffffff);
    oldWall.material = blockMat;
    const oldHit = box(g, 2.4, 0.3, 0.3, -1.9, BML_FOOT + 1.05, BML_WALL_Z - 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, oldHit, "unbraced-lift");
    const oldBrace = group(g, -1.9, 0, BML_WALL_Z - 1.0);
    const ob = box(oldBrace, 0.08, 1.6, 0.08, 0, 0.75, 0.35, 0x8a6a42, { rough: 0.9 });
    ob.rotation.x = -0.55;
    oldBrace.visible = false;
    // The corner lead and today's course, built as the steps go.
    const leadMat = texturedMat(surfaceTexture((cx, w, h) => bmlBlockFace(cx, w, h, 4, 2), { repeat: 1, px: 256 }), { rough: 0.92, color: 0xffffff });
    const lead = box(g, 0.8, 0.8, 0.2, 2.8, BML_FOOT + 0.4, BML_WALL_Z - 0.1, 0xffffff);
    lead.material = leadMat;
    const course = box(g, 3.2, 0.2, 0.2, 0.9, BML_FOOT + 0.3, BML_WALL_Z - 0.1, 0xffffff);
    course.material = texturedMat(surfaceTexture((cx, w, h) => bmlBlockFace(cx, w, h, 1, 8), { repeat: 1, px: 256 }), { rough: 0.92, color: 0xffffff });
    course.scale.x = 0.01;
    course.visible = false;
    const firstCourse = box(g, 3.2, 0.2, 0.2, 0.9, BML_FOOT + 0.1, BML_WALL_Z - 0.1, 0xffffff);
    firstCourse.material = course.material;
    firstCourse.visible = false;
    // Dry bond: loose units along the line, becoming the laid first course.
    const dry = group(g, 0, BML_FOOT, BML_WALL_Z - 0.1);
    for (let i = 0; i < 6; i++) box(dry, 0.39, 0.19, 0.19, -0.3 + i * 0.44, 0.1, 0, 0xb9b4a8, { rough: 0.92 });
    dry.visible = false;
    const dryHit = box(g, 2.8, 0.3, 0.4, 0.9, BML_FOOT + 0.1, BML_WALL_Z + 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "dry bond — first course", 0.9, BML_FOOT + 0.45, BML_WALL_Z + 0.15, { css: BML_CSS, w: 0.4 });
    reg(hits, dryHit, "dry-bond");
    const courseHit = box(g, 0.5, 0.3, 0.4, 2.2, BML_FOOT + 0.3, BML_WALL_Z + 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "course — lay to the line", 2.1, BML_FOOT + 0.65, BML_WALL_Z + 0.2, { css: BML_CSS, w: 0.4 });
    reg(hits, courseHit, "course-block");

    // ----------------------------------------------- layout: benchmarks, line, square
    const bench = group(g, -2.9, 0, BML_WALL_Z + 0.5);
    cyl(bench, 0.02, 0.02, 0.5, 0, 0.25, 0, 0xe8762b, { rough: 0.7, seg: 8 });
    cyl(bench, 0.02, 0.02, 0.5, 5.9, 0.25, 0, 0xe8762b, { rough: 0.7, seg: 8 });
    holoTag(bench, "benchmarks", 0, 0.65, 0, { css: BML_CSS, w: 0.2 });
    reg(hits, bench, "benchmark");
    const chalk = box(g, 6.0, 0.004, 0.02, 0, BML_FOOT + 0.003, BML_WALL_Z + 0.01, 0x3c78c8, { rough: 0.8, cast: false });
    chalk.visible = false;
    const chalkBox = group(g, -0.4, 0, BML_WALL_Z + 0.75, 0.3);
    box(chalkBox, 0.1, 0.07, 0.04, 0, 0.035, 0, 0x3c78c8, { rough: 0.6 });
    holoTag(chalkBox, "chalk line", 0, 0.25, 0, { css: BML_CSS, w: 0.18 });
    reg(hits, chalkBox, "chalk-line");
    const tape = tapeMeasure(g, 2.9, BML_FOOT, BML_WALL_Z + 0.35, { ry: 0.8 });
    holoTag(g, "3-4-5 square check", 2.9, BML_FOOT + 0.25, BML_WALL_Z + 0.45, { css: BML_CSS, w: 0.32 });
    reg(hits, tape, "square-check");
    // Story pole, line block, line and trig.
    const pole = group(g, 3.3, 0, BML_WALL_Z + 0.2);
    const poleBar = box(pole, 0.05, 2.0, 0.05, 0, 1.0, 0, 0xc6a26a, { rough: 0.85 });
    poleBar.rotation.z = 0.25;
    holoTag(pole, "story pole", 0, 2.15, 0, { css: BML_CSS, w: 0.2 });
    reg(hits, pole, "story-pole");
    const lineBlock = group(g, 2.35, BML_FOOT + 0.4, BML_WALL_Z + 0.02);
    box(lineBlock, 0.08, 0.05, 0.06, 0, 0, 0, 0xe8b02e, { rough: 0.6 });
    holoTag(lineBlock, "line block", 0, 0.16, 0.05, { css: BML_CSS, w: 0.18 });
    reg(hits, lineBlock, "line-block");
    const line = hose(g, [[2.35, BML_FOOT + 0.4, BML_WALL_Z + 0.02], [0.9, BML_FOOT + 0.36, BML_WALL_Z + 0.02], [-0.6, BML_FOOT + 0.4, BML_WALL_Z + 0.02]], 0.003, 0xf2e14b, { steps: 10, rough: 0.7 });
    line.visible = false;
    const trig = group(g, 0.9, 0, BML_WALL_Z + 0.55);
    box(trig, 0.39, 0.19, 0.19, 0, 0.1, 0, 0xb9b4a8, { rough: 0.92 });
    holoTag(trig, "trig block", 0, 0.35, 0, { css: BML_CSS, w: 0.18 });
    reg(hits, trig, "trig");
    const lvl = level(g, 2.8, BML_FOOT + 0.8, BML_WALL_Z - 0.1, { ry: 0 });
    void lvl;

    // ----------------------------------------------- limited access zone and its sign
    const zoneMark = decal(g, 6.2, 1.6, 0, 0.045, BML_WALL_Z - 1.3, (cx, w, h) => {
      cx.clearRect(0, 0, w, h); cx.strokeStyle = "rgba(210,49,43,0.7)"; cx.lineWidth = 8; cx.setLineDash([24, 18]); cx.strokeRect(6, 6, w - 12, h - 12);
    }, { px: 512, transparent: true });
    zoneMark.rotation.x = -Math.PI / 2;
    const zoneSocket = box(g, 1.0, 0.1, 0.4, -0.2, 0.05, BML_WALL_Z - 2.1, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["zone-mark"] = zoneSocket;
    const zoneHit = box(g, 1.2, 0.08, 0.6, 1.4, 0.06, BML_WALL_Z - 1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk behind the wall?", 1.4, 0.35, BML_WALL_Z - 1.0, { css: "#d2312b", w: 0.4 });
    reg(hits, zoneHit, "lac-shortcut");
    const noZoneHit = box(g, 1.0, 0.08, 0.6, -1.4, 0.06, BML_WALL_Z - 1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, noZoneHit, "no-access-zone");
    const barricade = group(g, -2.3, 0, 0.9, 0.3);
    for (const x of [-0.5, 0.5]) cyl(barricade, 0.02, 0.025, 1.0, x, 0.5, 0, 0xe4622a, { rough: 0.7, seg: 8 });
    box(barricade, 1.1, 0.12, 0.02, 0, 0.85, 0, 0xd2312b, { rough: 0.7 });
    holoTag(barricade, "zone barricade", 0, 1.15, 0, { css: BML_CSS, w: 0.26 });
    reg(hits, barricade, "zone-barricade");
    const zoneLine = group(g, 0, 0, BML_WALL_Z - 2.1);
    for (const x of [-3.0, 0, 3.0]) cyl(zoneLine, 0.02, 0.025, 1.0, x, 0.5, 0, 0xe4622a, { rough: 0.7, seg: 8 });
    hose(zoneLine, [[-3.0, 0.9, 0], [0, 0.86, 0], [3.0, 0.9, 0]], 0.01, 0xd2312b, { steps: 8, rough: 0.7 });
    zoneLine.visible = false;
    const signPad = group(g, -3.3, 0, BML_WALL_Z - 1.2, 0.8);
    box(signPad, 0.6, 0.04, 0.4, 0, 0.02, 0, 0x3a4550, { rough: 0.8 });
    cyl(signPad, 0.025, 0.025, 1.4, 0, 0.7, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const signFaceMesh = decal(signPad, 0.5, 0.36, 0, 1.4, 0.03, (cx, w, h) => {
      cx.fillStyle = "#000"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#fff"; cx.fillRect(4, 4, w - 8, h - 8);
      cx.fillStyle = "#c8102e"; cx.fillRect(4, 4, w - 8, h * 0.3);
      cx.fillStyle = "#fff"; cx.font = `800 ${Math.round(h * 0.2)}px Arial`; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("DANGER", w / 2, h * 0.19);
      cx.fillStyle = "#000"; cx.font = `700 ${Math.round(h * 0.11)}px Arial`;
      cx.fillText("LIMITED ACCESS ZONE", w / 2, h * 0.5); cx.fillText("MASONS BUILDING THE", w / 2, h * 0.68); cx.fillText("WALL ONLY", w / 2, h * 0.84);
    }, { px: 320 });
    signFaceMesh.visible = false;

    // ----------------------------------------------- block cube, mortar, dust
    const cube = group(g, -1.6, 0, 0.9, -0.2);
    box(cube, 1.0, 0.1, 1.0, 0, 0.05, 0, 0x8a6a42, { rough: 0.95 });
    const cubeBlocks = box(cube, 0.96, 0.8, 0.96, 0, 0.5, 0, 0xffffff);
    cubeBlocks.material = texturedMat(surfaceTexture((cx, w, h) => bmlBlockFace(cx, w, h, 4, 2), { repeat: 1, px: 256 }), { rough: 0.92, color: 0xffffff });
    const cracks = decal(cube, 0.5, 0.2, 0.2, 0.8, 0.49, (cx, w, h) => { cx.clearRect(0, 0, w, h); cx.strokeStyle = "#2a241c"; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(0, h * 0.3); cx.lineTo(w * 0.4, h * 0.6); cx.lineTo(w, h * 0.4); cx.stroke(); }, { px: 128, transparent: true });
    void cracks;
    const crackHit = box(cube, 0.5, 0.25, 0.1, 0.2, 0.8, 0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, crackHit, "cracked-block");
    const tub = group(g, 0.4, 0, 1.2);
    const tubBody = cyl(tub, 0.35, 0.3, 0.3, 0, 0.15, 0, 0x2b2b2b, { rough: 0.8, seg: 16 });
    void tubBody;
    const batch = cyl(tub, 0.32, 0.32, 0.02, 0, 0.26, 0, 0x9a968c, { rough: 0.95, seg: 16 });
    const mixer = drill(tub, 0.05, 0.32, 0, { ry: 0.3 });
    cyl(tub, 0.01, 0.01, 0.3, 0.05, 0.2, 0, 0x8b949d, { rough: 0.4, metal: 0.7, seg: 6 });
    holoTag(tub, "paddle mixer — hold", 0, 0.75, 0, { css: BML_CSS, w: 0.32 });
    reg(hits, mixer, "paddle-mixer");
    const handHit = box(tub, 0.3, 0.1, 0.3, -0.2, 0.3, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(tub, "work it by hand?", -0.3, 0.45, 0.3, { css: "#d2312b", w: 0.3 });
    reg(hits, handHit, "bare-hand-mortar");
    const gaugeBox = group(g, 1.3, 0, 1.05, -0.3);
    box(gaugeBox, 0.5, 0.25, 0.35, 0, 0.125, 0, 0x8a6a42, { rough: 0.9 });
    const sand = box(gaugeBox, 0.44, 0.02, 0.29, 0, 0.12, 0, 0xc9b27a, { rough: 0.95 });
    box(gaugeBox, 0.25, 0.1, 0.18, 0.4, 0.05, 0, 0xd8d2c0, { rough: 0.9 });
    holoTag(gaugeBox, "gauge box — proportions", 0, 0.45, 0, { css: BML_CSS, w: 0.38 });
    reg(hits, gaugeBox, "gauge-box");
    const reel = hoseReel(g, -0.6, 0, 1.7, { ry: 0.4 });
    holoTag(g, "water hose", -0.6, 0.55, 1.7, { css: BML_CSS, w: 0.2 });
    reg(hits, reel, "water-hose");
    const dust = particles(g, 70, 0xd8d2c4, { size: 0.05, life: 0.9, additive: false, opacity: 0.5 });
    const dustOrigin = new THREE.Vector3(-0.8, 0.3, BML_WALL_Z + 0.6);
    const wet = box(g, 1.6, 0.003, 0.5, -0.8, BML_FOOT + 0.002, BML_WALL_Z + 0.2, 0x3a3a36, { rough: 0.2, opacity: 0.6, transparent: true, cast: false });
    wet.visible = false;
    const plank = group(g, 0.2, 0, BML_WALL_Z + 0.9, 0.1);
    const plankBoard = box(plank, 2.0, 0.04, 0.25, 0, 0.3, 0, 0xc6a26a, { rough: 0.85 });
    plankBoard.rotation.z = 0.12;
    holoTag(plank, "lean it on the new wall?", 0, 0.6, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, plank, "lean-on-green-wall");
    const extraHit = box(g, 0.8, 0.25, 0.3, 2.8, BML_FOOT + 0.95, BML_WALL_Z - 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "one more course first?", 2.8, BML_FOOT + 1.2, BML_WALL_Z + 0.05, { css: "#d2312b", w: 0.4 });
    reg(hits, extraHit, "extra-course");

    // ----------------------------------------------- brace, wind, truck
    const brace = group(g, 2.3, 0, 0.55, -0.2);
    const braceBar = box(brace, 2.0, 0.08, 0.08, 0, 0.06, 0, 0x8a6a42, { rough: 0.9 });
    void braceBar;
    holoTag(brace, "wall brace", 0, 0.3, 0, { css: BML_CSS, w: 0.2 });
    reg(hits, brace, "wall-brace");
    const braceAnchor = box(g, 0.4, 0.4, 0.4, 1.6, 0.2, BML_WALL_Z - 1.0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["brace-anchor"] = braceAnchor;
    const setBrace = group(g, 1.6, 0, BML_WALL_Z - 1.0);
    const sb = box(setBrace, 0.08, 1.4, 0.08, 0, 0.62, 0.3, 0x8a6a42, { rough: 0.9 });
    sb.rotation.x = -0.6;
    setBrace.visible = false;
    const mast = group(g, -3.4, 0, 0.2);
    cyl(mast, 0.025, 0.025, 2.4, 0, 1.2, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const cups = box(mast, 0.3, 0.012, 0.012, 0, 2.42, 0, 0x8b949d, { rough: 0.5, metal: 0.6 });
    const alarm = group(mast, 0, 1.2, 0.05);
    box(alarm, 0.22, 0.2, 0.08, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    const alarmFace = decal(alarm, 0.2, 0.16, 0, 0, 0.041, signFace("WIND\nOK", { bg: "#0d1c24", accent: BML_CSS, fg: "#bfeaf7", scale: 0.3 }), { px: 160, glow: true, ei: 0.7 });
    holoTag(mast, "wind alarm", 0, 1.45, 0.05, { css: BML_CSS, w: 0.2 });
    reg(hits, alarm, "wind-alarm");
    const truck = pickup(g, 5.4, 0, -2.2, { ry: 0.2, livery: { colour: 0x7a8a6a, fleetName: "CITY MASONRY", unitNumber: "M-5" } });
    void truck;

    // ----------------------------------------------- paper and radio
    const panelDraw = (title, rows, done = false) => (cx, w, h) => {
      cx.fillStyle = "#12160c"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BML_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eef4dc"; cx.fillText(title, w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = done ? "#d8f5e0" : "#e2ead0";
      rows.forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.28 + i * 0.12)));
    };
    const drawing = holoPanel(g, 0.95, 0.64, -2.6, 1.6, 2.0, panelDraw("WALL W2 — LAYOUT + BRACING PLAN", [
      "Face line off gridlines B and 4 · running bond", "Mortar: type and proportions per the spec", "Unbraced height: per the bracing plan",
      "Brace positions and anchors: per the plan", "Clear the zone at the plan's wind speed", "Limited access zone on the unscaffolded side",
    ]), { ry: 0.5, accent: BML_ACCENT });
    reg(hits, drawing, "layout-drawing");
    const log = group(g, 2.4, 0, 1.8, -0.6);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.62, 0.44, 0, 1.3, 0.01, panelDraw("MASON'S LOG — W2", ["Courses: —", "Batches: —", "Braced: —", "Stops: —"]), { px: 384, glow: true, ei: 0.6 });
    holoTag(log, "mason's log", 0, 1.62, 0, { css: BML_CSS, w: 0.22 });
    reg(hits, log, "wall-log");
    const stand = box(g, 0.3, 0.9, 0.3, 1.1, 0.45, 2.3, 0x3a4550, { rough: 0.6 });
    void stand;
    const crewRadio = radio(g, 1.1, 0.9, 2.3, { ry: -0.2 });
    holoTag(g, "crew radio", 1.1, 1.25, 2.3, { css: BML_CSS, w: 0.2 });
    reg(hits, crewRadio, "crew-radio");

    // ----------------------------------------------- crew
    const mason = standingFigure(g, -0.4, 0.1, { ry: 3.0, cloth: 0x4a4038, vest: 0xf2c14b, helmet: 0xf2f2f2, gloves: true });
    holoTag(mason, "mason", 0, 1.95, 0, { css: BML_CSS, w: 0.14 });
    const tender = standingFigure(g, 0.9, BML_WALL_Z - 2.9, { ry: 0.3, cloth: 0x5a4a3a, vest: 0xd8f23a, helmet: 0xf2f2f2, atStation: true });
    tender.visible = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.8, BML_WALL_Z),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "layout-lines") chalk.visible = true;
        if (step.id === "dry-bond") dry.visible = true;
        if (step.id === "wall-walk") { oldBrace.visible = true; cubeBlocks.material = mat(0xb0a898, { rough: 0.92 }); }
        if (step.id === "access-zone") { zoneLine.visible = true; signFaceMesh.visible = true; barricade.visible = false; }
        if (step.id === "mix-ratio") sand.scale.y = 4;
        if (step.id === "bag-dump") batch.material = mat(0x6e6a62, { rough: 0.6 });
        if (step.id === "story-pole") poleBar.rotation.z = 0;
        if (step.id === "line-block") { line.visible = true; dry.visible = false; firstCourse.visible = true; }
        if (step.id === "lay-course") { course.visible = true; course.scale.x = 1; }
        if (step.id === "brace") { setBrace.visible = true; brace.visible = false; }
        if (step.id === "wall-log") repaint(log.userData.face, panelDraw("MASON'S LOG — W2", ["Courses: 2 on the line, lead at 4", "Batches: to the spec's proportions", "Braced: W2 east per plan, W2 west added", "Stops: dry sweeping wetted, wind cleared"], true));
        if (step.id === "crew-checkin") repaint(crewRadio.userData.screen, signFace("W2 BRACED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "dry-sweeping") dust.visible = true;
        if (it.id === "gust-on-green-wall") { tender.visible = true; repaint(alarmFace, signFace("WIND\nOVER", { bg: "#3a0d0d", accent: "#d2312b", fg: "#ffd6d6", scale: 0.3 })); cups.scale.x = 1.6; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "dry-sweeping") { dust.visible = false; wet.visible = true; }
        if (it.id === "gust-on-green-wall") { tender.position.set(-2.4, 0, 0.3); cups.scale.x = 1; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        cups.rotation.y = t * (session?.activeInterrupt?.id === "gust-on-green-wall" ? 16 : 6);
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "mix-ratio") sand.scale.y = 1 + gg.t * 6;
        if (step?.id === "bag-dump" && session.holding) mixer.rotation.y = t * 20;
        if (session?.turn && step?.id === "line-block") lineBlock.rotation.x = session.turn.amount * Math.PI * 2;
        const tr = session?.track;
        if (tr && step?.id === "lay-course") { course.visible = true; course.scale.x = Math.max(0.02, Math.min(1, (tr.inBand ?? 0) / 6)); course.position.x = 0.9 - 1.6 * (1 - course.scale.x); course.position.y = BML_FOOT + 0.3 + (tr.v - 0.5) * 0.04; }
        if (dust.visible) dust.userData.step(dt ?? 0.016, dustOrigin, 0.8, 0.5, 0.1);
        void CITY;
      },
    };
  },
};
