import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, mat, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, pipeRun, surfaceTexture, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Underground Sewer Lateral & Trench Shoring VR — Water &
// Environmental, UA plumbers and pipefitters.
//
// Every part of this job happens below the level the ground was ever meant
// to hold itself open at. The protective system goes in before anyone's
// boots do, and it comes out the same careful way it went in — a shield
// pulled a lift at a time as the backfill behind it takes over the job of
// holding the wall, never yanked clear of an excavation that is still
// standing open on its own. The pipe itself lives or dies on one number
// nobody can see once it is covered: the fall from the building to the
// main, checked on a level at every joint, because a lateral laid a
// fraction flat anywhere along its run backs up for the life of the house
// on top of it.

const USL_ACCENT = 0x6fae4a;

export const SIM_PL_UNDERGROUND_SEWER_LATERAL_AND_TRENCH_SHORING = {
  id: "pl-underground-sewer-lateral-and-trench-shoring",
  index: "pl-03",
  domain: "Water & Environmental",
  trade: "UA pipelayer / underground plumbing installer",
  category: "Water & Environmental",
  weather: "rain",
  certification: "UA plumbers and pipefitters apprenticeship; the Uniform Plumbing Code (UPC) for the lateral's slope and joints; 29 CFR 1926 Subpart P Excavations; 29 CFR 1926 for the site as a whole; 8 CCR 3203 injury and illness prevention",
  name: "Underground Sewer Lateral & Trench Shoring",
  title: simTitle("Underground Sewer Lateral & Trench Shoring"),
  tagline: "A protective system placed before anyone works below grade, a sewer lateral laid and jointed on a proven fall, and the shield pulled a lift at a time as the backfill takes over holding the wall — never yanked clear of ground still standing open on its own",
  accent: USL_ACCENT,
  accentCss: "#6fae4a",
  parSeconds: 275,
  footprint: 2.3,
  badge: { id: "lateral-proven", name: "Lateral Proven", note: "A sewer lateral trenched, shored, laid to a checked fall and air-tested before backfill closes over it for good" },

  game: system({
    name: "Ground and Grade",
    currency: "FALL",
    ranks: ["Apprentice", "Pipelayer", "Journeyman", "Lead Pipelayer", "Underground Certified"],
    badges: [
      { id: "shield-before-boots", name: "Shield Before Boots", note: "The protective system was placed before anyone entered the trench", test: AWARD.stepClean("place-shield") },
      { id: "never-unshored", name: "Never Unshored", note: "No entry and no shield pull happened without the protective system doing its job", test: AWARD.safe },
      { id: "true-fall", name: "True Fall", note: "Held the slope reading inside the band on every check", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-lay", name: "Clean Lay", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "unbroken-grade", name: "Unbroken Grade", note: "The grade watch never lapsed", test: AWARD.unbroken },
      { id: "trench-closed-fast", name: "Trench Closed Fast", note: "Backfilled and signed off inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unshored-entry": "You stepped into the trench before the protective system was placed. A cubic metre of soil weighs more than a small car, and a wall with nothing holding it can let go with no warning at all, burying a person from the waist down in seconds.",
    "spoil-too-close": "That spoil pile is sitting right on the edge of the excavation. The extra weight from a pile that close is exactly the surcharge load that pushes a marginal wall past the point it can hold itself up, and it does it from the side nobody is watching because the shield is holding their attention.",
    "gas-line-unpotholed": "You brought the trenching bucket down right next to a marked gas line without hand-exposing it first. Locate paint tells you roughly where a line runs, not its exact depth or the exact swing of the trench it takes through the ground, and a bucket that finds it by feel finds it by striking it.",
    "pull-shield-early": "You pulled the shield before the backfill behind it reached the level the plan calls for. The shield was the only thing holding that section of wall open — pull it early and the ground it was holding has nothing else in its way, and it comes down on whoever is standing where the shield used to be.",
  },

  lateNotes: {
    "trench-shield": "The shield goes into the excavation and is proven set before anyone works below the level it protects, not after the first length of pipe is already in the trench.",
    "pipe-section": "The pipe goes onto the checked bedding once the fall is proven, not before the grade has been set and read.",
    "pull-lift-1": "The shield comes out a lift at a time as the backfill behind it takes over, never in one pull off a trench that is still standing open below it.",
  },

  // Two things that happen to a pipelayer whose eyes are on a slope reading
  // or a hand is on the shield's own controls. See shared/game.js.
  interrupts: [
    {
      id: "wall-sloughs",
      kind: "The trench wall sloughs behind the shield",
      // Armed on entering the atmosphere hold, so the window lands while
      // attention is on the gas meter — answered at the shield's own
      // spreader, not the meter that step's control belongs to.
      after: "air-check", delay: 3, seconds: 12,
      alert: "A section of wall just sloughed in behind the shield on the open end, away from where you're reading the meter.",
      cue: "That is the ground moving on the unprotected side — check the shield's spreader before you do anything else.",
      target: "shield-spreader",
      why: "A wall that sloughs while the shield is already in means the soil found the one section the shield was not covering, and it is telling you the ground here is worse than the plan assumed before anyone is standing under it. Checking the spreader now, while it is still a slough and not a full collapse, is what decides whether the shield needs repositioning before the crew goes back to work at all.",
      missNote: "The slough sat there while the meter reading finished. Nobody looked at what the ground had just told them about this section of trench.",
      wrongNote: "It is the shield's spreader, not the meter. The gas reading was never the thing that just moved.",
    },
    {
      id: "locate-call",
      kind: "Another crew radios a hit on an unmarked line",
      // Armed after the pipe is jointed, answered at this trench's own
      // locate ticket rather than the pipe the learner has been working on.
      after: "joint-pipe", delay: 3, seconds: 12,
      alert: "Dispatch just radioed — a crew two blocks over hit an unmarked line that was not on their locate ticket.",
      cue: "Before this trench goes any further, check your own locate ticket against what's actually in this ground.",
      target: "locate-ticket",
      why: "A locate ticket is a set of marks somebody made from records and a locator wand, not a guarantee, and a nearby crew just finding an unmarked line is the clearest warning this shift is going to get that a ticket can be wrong. Rechecking this trench's own ticket against the utilities actually exposed in it, before laying another length of pipe, is how that warning gets used instead of just being noted and moved past.",
      missNote: "The ticket never got a second look. Whatever the other crew just found out the hard way, this trench kept going on the same assumptions.",
      wrongNote: "It is this trench's own locate ticket. What happened two blocks over is a warning about assumptions, not about the pipe already in the ground here.",
    },
  ],

  steps: [
    {
      id: "ticket", kind: "select", target: "locate-ticket",
      title: "Confirm the locate ticket and the install drawing",
      cue: "Check the locate ticket against the drawing: what utilities are marked, and what fall the lateral is designed to run at.",
      why: "The Uniform Plumbing Code sizes a lateral's minimum fall around what the pipe needs to carry solids without backing up, and that number lives on the drawing next to whatever the locate ticket marked in this ground — a trench dug to the wrong fall or across a utility the ticket missed is a different, more dangerous job than the one that was planned.",
    },
    {
      id: "soil-class", kind: "select", target: "soil-class-board",
      title: "Read the soil classification for the protective system",
      cue: "Check the competent person's soil classification board before choosing shield or slope.",
      why: "29 CFR 1926 Subpart P Excavations sets the protective system a trench needs around the actual soil it is dug in, not around what a crew hopes the ground will do — a classification made from looking at the spoil and the wall face, not guessed at from the last job in a different yard.",
    },
    {
      id: "hazard-walk", kind: "find", noHint: true,
      targets: ["gas-line-flag", "unstable-spoil"],
      itemNames: { "gas-line-flag": "gas line locate flag", "unstable-spoil": "spoil piled at the edge" },
      itemNotes: {
        "gas-line-flag": "There is a yellow locate flag close to the planned trench line — that gas main has to be hand-exposed before any bucket comes near it.",
        "unstable-spoil": "The spoil from test-pitting is piled right at the edge of where the trench is about to open, adding surcharge exactly where the wall will need to hold itself up.",
      },
      title: "Walk the site before the trench opens",
      cue: "Walk the marked area and find what is going to matter once the ground is open.",
      why: "A gas line flag and a spoil pile in the wrong place are both invisible once the trench is open and full of equipment — finding them now, while the ground is still flat and everybody can see the whole picture, is what keeps either one from becoming a strike or a wall failure nobody saw building.",
    },
    {
      id: "place-shield", kind: "drag", target: "trench-shield",
      title: "Place the protective system",
      cue: "Lower the trench shield into the excavation before anyone works below the level it protects.",
      why: "The shield is the physical protection this whole job depends on, not a formality that follows the digging — it goes in as soon as the trench reaches the depth the plan calls for, so that nobody is ever standing below grade with only the wall's own word that it will hold.",
      drag: { to: "trench-socket", radius: 0.45, missNote: "Not seated in the excavation — a shield left half in does not protect the section it is only halfway covering." },
    },
    {
      id: "air-check", kind: "hold", target: "gas-meter", seconds: 5,
      title: "Check the atmosphere before entry",
      cue: "Hold the gas meter at the bottom of the trench until the reading settles before anyone climbs down.",
      why: "A trench cut near a gas main and backfilled with disturbed soil can carry gas into a low pocket with no smell and no colour to warn a pipelayer climbing down into it, and the only way to know before it matters is a meter read at the bottom, not assumed clear because the surface air was fine.",
      holdBreakNote: "The meter came up before the reading settled — hold it again at the bottom until it is steady, this is the one check that has to be right before anyone enters.",
    },
    {
      id: "set-grade", kind: "turn", target: "laser-level",
      title: "Set the grade laser to the lateral's fall",
      cue: "Turn the laser level's grade dial to the fall the drawing specifies for this run.",
      why: "Every joint in this lateral is checked against one reference for the rest of the job, and that reference is only as good as the number dialled into it here — a laser set to the wrong fall makes every single downstream reading confidently wrong in exactly the same way.",
      turn: { turns: 0.4, axis: "y", label: "GRADE LASER" },
    },
    {
      id: "bedding", kind: "find",
      targets: ["hard-spot", "high-spot"],
      itemNames: { "hard-spot": "hard spot in the bedding", "high-spot": "high spot under the pipe line" },
      itemNotes: {
        "hard-spot": "There is a chunk of broken concrete left in the bedding — a hard point under the pipe becomes the one spot the whole lateral's weight bears on once it's backfilled.",
        "high-spot": "The bedding is proud of the line here — laid on it as-is, the pipe rides up and loses fall exactly where a lateral cannot afford to.",
      },
      title: "Check the bedding before the pipe goes down",
      cue: "Look over the prepared bedding for anything that will throw the pipe off its fall.",
      why: "Bedding is what the pipe actually rests on for the rest of its life, and a hard spot or a high spot hiding under a smooth-looking surface becomes a permanent bird's mouth or belly in the line the moment backfill locks it in place — both are found now, on bare bedding, or not at all once the trench is closed.",
    },
    {
      id: "lay-pipe", kind: "drag", target: "pipe-section",
      title: "Lower the pipe section onto the bedding",
      cue: "Bring the new length down onto the checked bedding, spigot end forward.",
      why: "The pipe goes down spigot-first onto bedding that has already been checked, because setting it down before the bedding is proven means finding the hard spot or the high spot with the pipe already resting on it instead of with an empty trench still easy to fix.",
      drag: { to: "bedding-line", radius: 0.42, missNote: "Not seated on the checked bedding — a pipe set outside the prepared line rides on whatever is actually under it, hard spot or not." },
    },
    {
      id: "check-fall", kind: "gauge", target: "slope-gauge",
      title: "Check the fall on this length",
      cue: "Read the level against the laser and commit once the fall sits in the band the drawing calls for.",
      why: "A lateral's fall has to stay inside a narrow band for its whole run — too flat and solids stop moving through it, too steep and the liquid outruns the solids and leaves them behind — and the only way either failure gets caught before it is buried for good is a level read against the laser on every single length.",
      gauge: { label: "FALL", speed: 0.7, green: [0.44, 0.62], readout: (t) => `${(t * 3).toFixed(1)}% grade`, missNote: "Off the fall on this length — reset the bedding under it before the next section goes down, not after." },
    },
    {
      id: "joint-pipe", kind: "sequence",
      targets: ["lube-gasket", "push-home", "mark-insertion"],
      itemNames: { "lube-gasket": "gasket lubricated", "push-home": "spigot pushed home", "mark-insertion": "insertion depth marked and checked" },
      title: "Joint the pipe to the previous length",
      cue: "Lubricate the gasket, push the spigot home, then check the insertion mark.",
      why: "A gasketed joint depends on the spigot going in far enough to seat the gasket fully and no farther, and the insertion mark is the only way to confirm that by sight rather than by how it felt going in — a joint that looks seated but is short of the mark can pull apart under the very backfill that is about to bury it.",
      outOfOrderNote: "Lubricate, then push it home, then check the mark — checking the mark before the joint is fully made confirms nothing.",
    },
    {
      id: "backfill", kind: "track", target: "compactor", seconds: 7,
      title: "Compact the pipe zone in lifts",
      cue: "Run the compactor at a steady pace over the bedding zone, lift by lift, without walking it straight over the pipe crown.",
      why: "The pipe zone is compacted in shallow lifts at a controlled pace because a compactor run too fast skips density the pipe needs for support, and one run directly over an unprotected crown transmits impact straight into the pipe wall instead of into the soil beside it.",
      track: { start: 0.5, green: [0.4, 0.6], rise: 0.12, fall: 0.3, drift: 0.14, label: "COMPACTION PASS", readout: (v) => (v < 0.4 ? "too fast — skipping density" : v > 0.6 ? "too slow — over the crown too long" : "steady lift") },
      holdBreakNote: "That pass ran outside the band — recheck this lift before the next one goes on top of it.",
    },
    {
      id: "pull-shield", kind: "sequence",
      targets: ["pull-lift-1", "pull-lift-2", "pull-lift-3"],
      itemNames: { "pull-lift-1": "shield raised after lift one", "pull-lift-2": "shield raised after lift two", "pull-lift-3": "shield fully clear after lift three" },
      title: "Pull the shield as the backfill rises",
      cue: "Raise the shield one lift at a time as the backfill behind it reaches each level, never all at once.",
      why: "The shield is holding a wall open, and pulling it clear in one motion hands that job back to soil that has had no chance to settle or be compacted against it — raising it a lift at a time lets the backfill itself take over holding the wall exactly as fast as the shield stops doing it.",
      outOfOrderNote: "One lift, then the next, then the last — the shield only comes up as far as the backfill behind it has already risen.",
    },
    {
      id: "air-test", kind: "gauge", target: "air-test-plug",
      title: "Air-test the completed lateral",
      cue: "Bring the test plug up to the pressure the code and the drawing call for, then commit once it holds.",
      why: "An air test on the finished lateral is the only proof that every joint made it through backfill and compaction still sealed, because a joint that looked perfect going together can still be pulled or crushed by the very soil that is now covering it for good.",
      gauge: { label: "TEST PRESSURE", speed: 0.68, green: [0.55, 0.76], readout: (t) => `${Math.round(t * 100)}% of test value`, missNote: "Did not hold — there is a joint under this backfill that needs to be found before the trench is called finished." },
    },
    {
      id: "as-built", kind: "select", target: "as-built-log",
      title: "Complete the as-built record",
      cue: "Mark the as-built log with the fall, the depth, and the test result before the crew moves off site.",
      why: "Once this trench is closed, the as-built record is the only thing that tells the next person — a homeowner's plumber locating the line years later, an inspector, a crew doing emergency work nearby — exactly where this lateral runs and what fall it was proven to carry.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, USL_ACCENT);

    // Street surface around a raised apron the trench is cut into, the way
    // an open cut actually reads rather than a flat dark smudge.
    const roadTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#33383d"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (let i = 0; i < 60; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 3, 3);
    }, { repeat: 6 });
    box(g, 6.0, 0.06, 4.4, 0, 0.03, 0.2, 0xffffff, { rough: 0.95 }).material = texturedMat(roadTex, { color: 0x3a3f44, rough: 0.95 });

    const APRON = 0.32;
    const apron = group(g, 0.1, 0, -0.4);
    const dirtTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#5a4a30"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      for (let i = 0; i < 80; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 4, 2);
    }, { repeat: 2 });
    for (const sz of [-1, 1]) box(apron, 3.4, APRON, 0.5, 0, APRON / 2, sz * 1.15, 0xffffff, { rough: 0.98 }).material = texturedMat(dirtTex, { color: 0x5a4a30, rough: 0.98 });
    for (const sx of [-1, 1]) box(apron, 0.5, APRON, 1.8, sx * 1.45, APRON / 2, 0, 0xffffff, { rough: 0.98 }).material = texturedMat(dirtTex, { color: 0x5a4a30, rough: 0.98 });

    const holeD = 1.1;
    const hole = group(g, 0.1, APRON, -0.4);
    box(hole, 2.4, 0.02, 1.8, 0, -holeD, 0, 0x33291b, { rough: 0.98, cast: false });
    for (const sx of [-1, 1]) box(hole, 0.06, holeD, 1.8, sx * 1.2, -holeD / 2, 0, 0x4a3a24, { rough: 0.96, cast: false });
    for (const sz of [-1, 1]) box(hole, 2.4, holeD, 0.06, 0, -holeD / 2, sz * 0.9, 0x4a3a24, { rough: 0.96, cast: false });
    hits["trench-socket"] = hole;
    holoTag(hole, "open cut", 0, 0.5, 0.95, { css: "#6fae4a", w: 0.3 });

    // Spoil, staged well back except for the decoy pile.
    for (let i = 0; i < 4; i++) ball(apron, 0.28 + (i % 2) * 0.08, -1.4 + i * 0.7, APRON + 0.16, -1.5, 0x4a3a24, { rough: 1.0, seg: 12 });
    const badSpoil = ball(apron, 0.34, 1.55, APRON + 0.2, 0.85, 0x4a3a24, { rough: 1.0, seg: 14 });
    holoTag(apron, "spoil at the edge", 1.55, APRON + 0.55, 0.85, { css: "#d2312b", w: 0.4 });
    reg(hits, badSpoil, "unstable-spoil");
    const spoilHazard = box(apron, 0.3, 0.3, 0.3, 1.55, APRON + 0.5, 0.85, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, spoilHazard, "spoil-too-close");

    // The gas line flag on the verge, and a real gas line crossing the trench.
    const flag = group(g, -2.3, APRON, 0.6, 0.3);
    cyl(flag, 0.01, 0.01, 0.5, 0, 0.25, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    box(flag, 0.14, 0.1, 0.01, 0, 0.44, 0, 0xf2c14b, { rough: 0.5 });
    reg(hits, flag, "gas-line-flag");
    const gasLine = cyl(hole, 0.05, 0.05, 2.2, 0, -0.35, 0.55, 0xf2c14b, { rough: 0.4, metal: 0.3, seg: 14 });
    gasLine.rotation.z = Math.PI / 2;
    holoTag(hole, "gas main — hand-expose only", 0, -0.1, 0.55, { css: "#f2c14b", w: 0.58 });
    reg(hits, gasLine, "gas-line-unpotholed");

    // The shield, staged on the verge until it is dragged into the hole.
    const shield = group(g, -2.4, 0, -1.3, 0.35);
    for (const sx of [-1, 1]) box(shield, 0.05, holeD - 0.1, 1.6, sx * 1.1, holeD / 2 - 0.05, 0, 0xd8b23a, { rough: 0.55, metal: 0.5 });
    const spreader1 = cyl(shield, 0.035, 0.035, 2.15, 0, 0.5, 0.5, 0xd8b23a, { rough: 0.55, metal: 0.5, seg: 12 });
    spreader1.rotation.z = Math.PI / 2;
    const spreader2 = cyl(shield, 0.035, 0.035, 2.15, 0, 0.5, -0.5, 0xd8b23a, { rough: 0.55, metal: 0.5, seg: 12 });
    spreader2.rotation.z = Math.PI / 2;
    holoTag(shield, "trench shield", 0, holeD + 0.1, 0, { css: "#6fae4a", w: 0.36 });
    reg(hits, shield, "trench-shield");
    reg(hits, spreader1, "shield-spreader");

    // Soil classification board and the locate/drawing bench.
    const board = group(g, 1.9, 0, -1.9, -0.5);
    const soilBoard = decal(board, 0.4, 0.5, 0, 0.9, 0, paperFace("SOIL CLASSIFICATION", ["Type: B (test data attached)", "Protective system: shield or 1H:1V", "Competent person: on file"], { scale: 0.8 }));
    holoTag(board, "soil classification", 0, 1.2, 0, { css: "#6fae4a", w: 0.4 });
    reg(hits, soilBoard, "soil-class-board");

    const bench = group(g, -1.9, 0, 1.3);
    box(bench, 1.2, 0.76, 0.55, 0, 0.38, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const ticket = decal(bench, 0.34, 0.42, -0.35, 0.78, 0, paperFace("LOCATE TICKET", ["Gas — marked yellow", "Water — marked blue", "Design fall: per drawing", "Depth: per drawing"], { scale: 0.82 }));
    ticket.rotation.x = -Math.PI / 2;
    holoTag(bench, "locate ticket & drawing", -0.35, 0.98, 0, { css: "#6fae4a", w: 0.5 });
    reg(hits, ticket, "locate-ticket");
    const asBuilt = decal(bench, 0.32, 0.4, 0.35, 0.78, 0.02, paperFace("AS-BUILT LOG", ["Fall recorded ______", "Depth recorded ______", "Air test: pass / fail", "Pipelayer ______"], { scale: 0.85 }));
    asBuilt.rotation.x = -Math.PI / 2;
    holoTag(bench, "as-built log", 0.35, 0.98, 0.05, { css: "#6fae4a", w: 0.32 });
    reg(hits, asBuilt, "as-built-log");

    // Gas meter, laser level, and the working length of pipe at the bottom.
    const meter = instrument(g, -0.6, 1.05, -0.7, { idle: "-- % LEL", color: 0x2b2f34, w: 0.15, d: 0.18 });
    holoTag(g, "gas meter", -0.6, 1.24, -0.7, { css: "#6fae4a", w: 0.3 });
    reg(hits, meter, "gas-meter");

    const laser = group(g, 1.6, 0.1, -0.3, 0.4);
    cyl(laser, 0.05, 0.06, 0.6, 0, 0.3, 0, 0xd8232a, { rough: 0.5, metal: 0.4, seg: 12 });
    box(laser, 0.14, 0.12, 0.14, 0, 0.66, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    const laserDial = cyl(laser, 0.05, 0.05, 0.02, 0, 0.6, 0.08, 0xf2c14b, { rough: 0.4, seg: 12 });
    holoTag(laser, "grade laser", 0, 0.86, 0, { css: "#6fae4a", w: 0.32 });
    reg(hits, laserDial, "laser-level");

    const bottom = group(hole, 0, -holeD + 0.3, 0);
    const bedHard = ball(bottom, 0.05, -0.4, 0.02, 0.15, 0x8a8f95, { rough: 0.8, seg: 10 });
    reg(hits, bedHard, "hard-spot");
    const bedHigh = box(bottom, 0.3, 0.05, 0.2, 0.3, 0.02, -0.1, 0x5a4a30, { rough: 0.9 });
    reg(hits, bedHigh, "high-spot");
    const beddingLine = group(bottom, -0.1, 0, 0.2);
    hits["bedding-line"] = beddingLine;
    holoTag(bottom, "checked bedding", -0.1, 0.28, 0.2, { css: "#6fae4a", w: 0.34 });

    const pipeStage = group(g, 2.4, 0.6, -0.6, -0.4);
    const pipeSection = cyl(pipeStage, 0.09, 0.09, 0.7, 0, 0, 0, 0xd8a35a, { rough: 0.4, metal: 0.3, seg: 16 });
    pipeSection.rotation.z = Math.PI / 2;
    holoTag(pipeStage, "new lateral section", 0, 0.2, 0, { css: "#6fae4a", w: 0.4 });
    reg(hits, pipeStage, "pipe-section");

    const laidPipe = pipeRun(bottom, [[-0.9, 0.06, 0.2], [0.6, 0.06, 0.2]], 0.09, 0xc78a4a, {});
    void laidPipe;
    const jointBell = group(bottom, 0.05, 0.06, 0.2);
    const gasketRing = cyl(jointBell, 0.1, 0.1, 0.05, 0, 0, 0, 0x3a7a5f, { rough: 0.5, seg: 16 });
    gasketRing.rotation.z = Math.PI / 2;
    reg(hits, gasketRing, "lube-gasket");
    const spigot = cyl(jointBell, 0.08, 0.08, 0.2, 0.15, 0, 0, 0xc78a4a, { rough: 0.4, metal: 0.3, seg: 16 });
    spigot.rotation.z = Math.PI / 2;
    reg(hits, spigot, "push-home");
    const insertMark = box(jointBell, 0.01, 0.16, 0.16, 0.22, 0, 0, 0xf2c14b, { rough: 0.5, cast: false });
    reg(hits, insertMark, "mark-insertion");

    const slopeGaugeInst = instrument(bottom, 0.6, 0.32, 0.2, { idle: "-- % grade", color: 0x2b2f34, w: 0.15, d: 0.18 });
    holoTag(bottom, "fall check", 0.6, 0.5, 0.2, { css: "#6fae4a", w: 0.3 });
    reg(hits, slopeGaugeInst, "slope-gauge");

    // Compactor and the shield-pull markers.
    const compactor = group(g, 2.2, 0.1, 1.0, -0.5);
    box(compactor, 0.32, 0.5, 0.3, 0, 0.25, 0, 0xd8232a, { rough: 0.55, metal: 0.3 });
    box(compactor, 0.4, 0.08, 0.4, 0, 0.02, 0.1, 0x2b3138, { rough: 0.4, metal: 0.6 });
    holoTag(compactor, "plate compactor", 0, 0.6, 0, { css: "#6fae4a", w: 0.36 });
    reg(hits, compactor, "compactor");

    const lift1 = box(hole, 0.3, 0.1, 0.3, -0.5, -0.5, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, lift1, "pull-lift-1");
    const lift2 = box(hole, 0.3, 0.1, 0.3, 0.0, -0.2, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, lift2, "pull-lift-2");
    const lift3 = box(hole, 0.3, 0.1, 0.3, 0.5, 0.1, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, lift3, "pull-lift-3");
    holoTag(hole, "pull the shield with the backfill", 0, 0.75, -0.4, { css: "#6fae4a", w: 0.6 });
    const pullEarlyTarget = box(g, 0.24, 0.24, 0.24, -1.6, 1.0, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just pull it clear now?", -1.6, 1.24, 0.2, { css: "#d2312b", w: 0.5 });
    reg(hits, pullEarlyTarget, "pull-shield-early");

    // Air-test plug.
    const testPlug = group(g, -0.4, 0.5, 1.3, 0.4);
    cyl(testPlug, 0.09, 0.09, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 14 });
    const testGauge = instrument(testPlug, 0, 0.2, 0, { idle: "-- psi", color: 0x2b2f34, w: 0.14, d: 0.16 });
    holoTag(testPlug, "air-test plug", 0, 0.36, 0, { css: "#6fae4a", w: 0.32 });
    reg(hits, testGauge, "air-test-plug");
    const unshoredTarget = box(g, 0.24, 0.24, 0.24, 0.6, 0.5, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "climb in before it's shielded?", 0.6, 0.72, 0.3, { css: "#d2312b", w: 0.56 });
    reg(hits, unshoredTarget, "unshored-entry");

    const boardPanel = group(g, 2.2, 0, 1.9, -0.5);
    holoPanel(boardPanel, 0.95, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#12280d"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#6fae4a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e4f7dc"; ctx.fillText("SEWER LATERAL — OPEN CUT", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eefcea";
      ["Shield in before anyone works below grade", "Hand-expose any marked line before the bucket", "Check the fall against the laser every length", "Air-test before backfill closes it for good", "Pull the shield a lift at a time, never all at once"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.12)));
    }, { accent: USL_ACCENT });

    const layer = standingFigure(g, -0.2, 2.2, { ry: 3.0, cloth: 0x3a5a2f });
    holoTag(layer, "pipelayer", 0, 1.9, 0, { css: "#6fae4a", w: 0.3 });
    toolChest(g, 2.5, 1.6);
    // A short stack of extra pipe lengths staged on the verge, and a second
    // ladder tied off at the shield for a clear second means of egress.
    for (let i = 0; i < 3; i++) {
      const stock = cyl(g, 0.09, 0.09, 0.6, -2.7 + i * 0.02, 0.1 + i * 0.19, 1.5, 0xd8a35a, { rough: 0.4, metal: 0.3, seg: 14 });
      stock.rotation.z = Math.PI / 2;
    }
    const ladder = group(g, 0.9, 0, -0.9, 0.2);
    for (const sx of [-0.14, 0.14]) cyl(ladder, 0.012, 0.012, 1.3, sx, 0.65, 0, 0xd8b23a, { rough: 0.45, metal: 0.6, seg: 8 });
    for (let i = 0; i < 5; i++) box(ladder, 0.3, 0.02, 0.02, 0, 0.15 + i * 0.24, 0, 0xd8b23a, { rough: 0.45, metal: 0.6 });
    barrierPanel(g, -2.0, 2.1, { color: 0xf2a13a });
    for (const [x, z] of [[2.4, -2.1], [-2.4, -2.1]]) cone(g, x, z);

    let sloughing = false;
    const slough = particles(g, 14, 0x6a563a, { size: 0.03, life: 0.6, additive: false, opacity: 0.6 });
    slough.position.set(-0.9, -0.4, -0.4);
    slough.visible = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 0.5, -0.3),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "hazard-walk") { badSpoil.material = mat(0x4a3a24, { rough: 1.0 }); flag.visible = false; }
        if (step.id === "place-shield") { shield.position.set(0.1, APRON, -1.5); shield.rotation.y = 0; }
        if (step.id === "bedding") { bedHard.visible = false; bedHigh.visible = false; }
        if (step.id === "lay-pipe") { pipeSection.parent.position.set(0.1, APRON - holeD + 0.3, -0.55); }
        if (step.id === "check-fall") repaint(slopeGaugeInst.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 }));
        if (step.id === "air-test") repaint(testGauge.userData.screen, signFace("HELD", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "wall-sloughs") { sloughing = true; slough.visible = true; }
        if (it.id === "locate-call") ticket.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.4, rough: 0.5 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wall-sloughs") { sloughing = false; slough.visible = false; }
        if (it.id === "locate-call") ticket.material = mat(0xffffff, { rough: 0.6 });
      },
      animate(t, dt, session) {
        if (sloughing) slough.userData.step(dt, new THREE.Vector3(0.1, -0.3, 0), 0.05, 0.5, -1.0);
        if (session?.turn && session.step?.id === "set-grade") laserDial.rotation.z = session.turn.amount * Math.PI * 2;
      },
    };
  },
};
