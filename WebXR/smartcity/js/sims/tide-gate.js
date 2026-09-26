import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles,
  noiseTexture, gradientFill,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { plantHardHat } from "../../../shared/eggs.js";

// SmartCiti.X~ Tide Gate VR — Water & Environmental, station eighty.
// Restoring tidal exchange to a diked former wetland: a crew replaces a
// failed flap gate with a self-regulating tide gate on a culvert through a
// levee, at low water. Sited generically — a levee, a culvert, a marsh —
// rather than at any named restoration project. See hunters-point.js for why
// a real, contested site gets a flat briefing instead of a walkable scene;
// this station teaches the trade procedure a crew like that runs, without
// inventing facts about any specific shoreline.
//
// The whole job runs on a clock the crew does not control: the tide. Every
// step before the cofferdam is proving the window is real and long enough;
// every step after it is a race to have the new gate bolted down and the
// cofferdam back out before the water the tide table promised actually
// arrives — because a flood that comes back to an open culvert does not wait
// for anyone to finish.

const TG_ACCENT = 0x8a9b4a;

/** The levee top: earth and matted marsh grass, not a flat green slab. */
function leveeTopFace(g, w, h) {
  gradientFill(g, w, h, [[0, "#5a5136"], [1, "#4a4530"]]);
  noiseTexture(g, w, h, { density: 2200, alpha: 0.12, tone: "70,74,42" });
  noiseTexture(g, w, h, { density: 900, alpha: 0.1, tone: "30,26,16" });
  // Streaks of matted grass laid down by the last high tide, not a uniform
  // lawn — a levee top is walked, driven on and occasionally overtopped.
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * w, y = Math.random() * h, len = 10 + Math.random() * 24;
    g.strokeStyle = `rgba(${110 + Math.random() * 40},${120 + Math.random() * 30},${50 + Math.random() * 20},0.18)`;
    g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + len * 0.3, y + len); g.stroke();
  }
}

export const SIM_TIDE_GATE = {
  id: "tide-gate",
  index: "80",
  domain: "Water",
  trade: "Operating engineer / laborer — tidal wetland restoration crew",
  category: "Water & Environmental",
  // Filed with the water trades, worked at the water's edge: stand it in
  // front of the bay rather than a treatment works.
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "IUOE Local 3 operating engineers on the plant; LIUNA laborers on the cofferdam and gate work; Pile Drivers Local 34 (Carpenters) on the culvert carpentry; a U.S. Army Corps of Engineers Section 404 permit and the Regional Water Board's Clean Water Act (CWA) Section 401 certification; the San Francisco Bay Conservation and Development Commission (BCDC); OSHA 29 CFR 1926.106 for work near water; the fish-window restriction on in-water work",
  name: "Tide Gate",
  title: simTitle("Tide Gate"),
  tagline: "Tide-window gate swap: levels read before the cofferdam goes in, a failed flap gate backed out and replaced, the new gate levelled to design elevation, and the cofferdam pulled in order before the first flood",
  accent: TG_ACCENT,
  accentCss: "#8a9b4a",
  parSeconds: 300,
  footprint: 2.7,
  badge: { id: "gate-holds", name: "Gate Holds", note: "A tide gate swapped inside the low-water window, levelled to design and proven on the first flood" },

  game: system({
    name: "Tidal Works Authority",
    currency: "TIDE",
    ranks: ["Laborer", "Wetland Hand", "Crew Lead", "Restoration Foreman", "Tidal Works Certified"],
    badges: [
      { id: "window-read", name: "Window Read", note: "Both water levels read against the tide table before the cofferdam went in", test: AWARD.all(AWARD.stepClean("levels-up"), AWARD.stepClean("levels-down")) },
      { id: "never-flooded", name: "Never Flooded", note: "The culvert was never entered open and the cofferdam never pulled early", test: AWARD.safe },
      { id: "true-elevation", name: "True Elevation", note: "Held the float-arm level and the tide readings near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-swap", name: "Clean Swap", note: "No corrections through the whole gate swap", test: AWARD.clean },
      { id: "steady-level", name: "Steady Level", note: "Held the float-arm adjustment in band without a break", test: AWARD.unbroken },
      { id: "beat-the-tide", name: "Beat The Tide", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "enter-open-culvert": "You started into the culvert while it was still open to tidal flow. A culvert this size fills fast once the tide turns, it is a straight pipe with one way out at each end, and nobody works inside it while either end is still open to the water — the cofferdam is what makes this a dry excavation instead of a drowning risk.",
    "pull-early": "You pulled the cofferdam before the new gate was bolted down. The sandbags are the only thing standing between the works and the tide right now; pull them with the gate still loose on the flange and the first water back in floats it off before a single bolt is torqued.",
    "no-pfd": "You went to the water's edge without a personal flotation device. OSHA's rule for work near water (29 CFR 1926.106) exists because a slip off a levee crown into moving tidal water, in boots and a tool belt, is not a swim — a PFD is worn at the edge every time, not fetched after somebody goes in.",
    "dump-old-gate": "You dropped the old flap gate into the tidal channel instead of carrying it to the laydown. Anything left in the water on a permitted restoration site is unauthorized fill and debris under the Corps' Section 404 permit and BCDC's jurisdiction — the old gate goes out the same controlled way the new one came in, not over the side.",
  },

  lateNotes: {
    "float-arm": "The float arm is set once the new gate is actually hung on the flange — there is nothing to level against before it is hanging there.",
    "new-bolt-a": "The new gate is bolted down after its float is set to design elevation, not before — torquing it down first locks in whatever angle it happened to be hanging at.",
    "pull-top-course": "The cofferdam comes out once the new gate is bolted down and proven, not while the culvert behind it is still open at a loose flange.",
    "viewing-point": "The first-flood observation happens once the gate is bolted and the cofferdam is out — there is no exchange to watch while the works are still sealed off and dry.",
  },

  // Both interruptions land on steps long enough to be caught mid-task, and
  // each is answered by something other than the control that step already
  // has the learner's hands on.
  interrupts: [
    {
      id: "flood-early",
      kind: "Tide arriving early",
      after: "pack-cofferdam", delay: 5, seconds: 16,
      alert: "The channel gauge on the bay side has started climbing well ahead of the tide table's predicted turn.",
      cue: "The window you planned this whole job around is closing faster than the book said it would.",
      target: "add-flood-course",
      why: "A tide table is a prediction built on an average year, and wind, barometric pressure and a wet season upstream can all push a real tide ahead of the printed time. The cofferdam was built to the water level the table promised, and a wall built to yesterday's number does not automatically hold today's — the fix is another course on now, while there is still dry ground to stand on to place it, not a wait-and-see.",
      missNote: "The tide came over the top of the cofferdam while the crew kept working the plan as written. Water arriving faster than a wall can be raised is exactly how a controlled low-tide job turns into an uncontrolled one, with the culvert wide open behind it.",
      wrongNote: "That does not raise the wall. Another course of sandbags on the cofferdam is what buys the time the table's number just took away.",
    },
    {
      id: "wall-slumping",
      kind: "Cofferdam slumping",
      after: "level-float", delay: 4, seconds: 14,
      alert: "One face of the sandbag wall has slumped and is bulging outward under the head of water behind it.",
      cue: "The thing keeping the tide out of the excavation you are standing in just moved.",
      target: "reinforce-slump",
      why: "A sandbag wall holds by friction and mass, not by a bond between bags, and a wall built a little too steep or on soft footing creeps before it fails outright — a bulge is the wall telling you it is partway through that process. Reinforcing the slumping face now, while it is still standing, is the difference between a wall that needs a few more bags and a wall that needs the whole crew out of the hole.",
      missNote: "The slumping face was left alone and kept moving while the gate work continued a few feet away from it. A cofferdam that fails while people are working behind it does not give a second warning after the first one is ignored.",
      wrongNote: "That is not the slumping face. The bulge in the wall is what needs bags against it right now.",
    },
  ],

  steps: [
    {
      id: "tide-window", kind: "select", target: "tide-board",
      title: "Read the tide table and confirm the low-water window",
      cue: "Check today's predicted low tide, the turn time and how long the window actually gives the crew.",
      why: "The entire job is scheduled around one number: how long the channel stays low enough to work in. Everything from the cofferdam to the last bolt has to fit inside that window, so it is read and confirmed before a single sandbag moves.",
    },
    {
      id: "levels-up", kind: "gauge", target: "upstream-gauge",
      title: "Read the marsh-side water level",
      cue: "Watch the upstream staff gauge and commit while the level sits inside today's predicted band.",
      why: "The marsh side is what the gate is supposed to be reconnecting to tidal exchange, and its level right now is the baseline every later reading is judged against — a marsh already higher or lower than expected changes how much head the cofferdam actually has to hold.",
      gauge: { label: "MARSH LEVEL", speed: 0.68, green: [0.4, 0.58], readout: (t) => `${(0.8 + t * 1.6).toFixed(2)} ft MLLW`, missNote: "Outside today's predicted band. Confirm the reading again before committing the crew to the window." },
    },
    {
      id: "levels-down", kind: "gauge", target: "downstream-gauge",
      title: "Read the bay-side channel level",
      cue: "Watch the downstream channel gauge and commit while the level sits inside today's predicted low.",
      why: "The bay side is where the flood is going to come back from, and this reading is the one the cofferdam height and the whole window's margin are actually built on — a channel not as low as the table predicted means less time than planned, not the same time with less warning.",
      gauge: { label: "CHANNEL LEVEL", speed: 0.7, green: [0.38, 0.56], readout: (t) => `${(0.2 + t * 1.4).toFixed(2)} ft MLLW`, missNote: "Not inside today's predicted low. Re-read before the cofferdam goes in on a number that might already be stale." },
    },
    {
      id: "build-cofferdam", kind: "sequence",
      targets: ["bag-course-1", "bag-course-2", "bag-course-3"],
      itemNames: { "bag-course-1": "base course", "bag-course-2": "middle course", "bag-course-3": "top course" },
      title: "Build the sandbag cofferdam",
      cue: "Lay the base course across the culvert mouth, then the middle course, then the top course.",
      why: "Base to top, each course keyed over the joints of the one below it, the way any dry-stacked wall is built — starting at the top or skipping the base leaves a wall with no foundation under the water pressure it is about to be asked to hold.",
      outOfOrderNote: "Base course first, then middle, then top — a wall built out of order has nothing under its own weight.",
    },
    {
      id: "pack-cofferdam", kind: "hold", target: "tamper", seconds: 6,
      title: "Tamp and seat the cofferdam",
      cue: "Hold the tamper on the wall until every course is seated tight against the culvert mouth.",
      why: "A stacked wall that has not been tamped down has gaps between the bags that the tide finds immediately — seating it is what turns a pile of sandbags into a wall that actually holds back water rather than seeping through it.",
      holdBreakNote: "Released before the wall was fully seated. An unseated cofferdam seeps at every gap between the bags — go back and hold the full duration.",
    },
    {
      id: "inspect-culvert", kind: "find", noHint: true,
      targets: ["scour-void", "spalled-invert"],
      itemNames: { "scour-void": "a scour void under the culvert", "spalled-invert": "a spalled section of the invert" },
      itemNotes: {
        "scour-void": "There is a void scoured out beneath the culvert barrel where years of tidal flow have undercut the bedding. A new gate bolted onto a pipe sitting over an empty void is a repair that fails again from underneath.",
        "spalled-invert": "The invert — the low point the flow actually runs along — has spalled concrete exposing the rebar. Left alone, this is where the next failure starts, gate or no gate.",
      },
      title: "Inspect the culvert before the old gate comes off",
      cue: "Look over the exposed culvert now that it is dry, and click anything the barrel itself needs before the new gate goes on.",
      why: "This is the only time all year the barrel is dry enough to actually see. A defect found now gets fixed on this shift; a defect missed now is buried under the new gate and the tide for another year.",
    },
    {
      id: "unbolt-old", kind: "sequence",
      targets: ["old-bolt-a", "old-bolt-b", "old-bolt-c"],
      itemNames: { "old-bolt-a": "bolt A", "old-bolt-b": "bolt B", "old-bolt-c": "bolt C" },
      title: "Back out the old flap gate's bolts",
      cue: "Back the bolts out in a cross pattern — A, then B, then C.",
      why: "A gate that has sat under tidal load for years is never sitting perfectly square on its seat. Backing the bolts out in a cross pattern releases that load evenly, the same reason a wheel's lug nuts come off in a star pattern rather than around the circle.",
      outOfOrderNote: "Cross pattern — A, then B, then C. Working around the flange in order lets the gate bind and jam on the way off.",
    },
    {
      id: "remove-old-gate", kind: "drag", target: "old-gate",
      title: "Lift the old flap gate clear",
      cue: "Carry the failed gate off the flange and set it down on the laydown mat.",
      why: "The old gate is evidence of why it failed and it is disposed of through the proper waste stream, not left where it fell. It comes off the flange and goes straight to the laydown, with nowhere in between for it to end up.",
      drag: { to: "laydown-mat", radius: 0.45, missNote: "Not on the laydown mat — set the old gate down there, not beside it or back on the flange." },
    },
    {
      id: "hang-new-gate", kind: "drag", target: "new-gate",
      title: "Hang the new self-regulating tide gate",
      cue: "Bring the new gate up to the culvert flange and seat it square.",
      why: "A self-regulating tide gate opens on the outgoing flow and swings shut against the incoming tide on its own float, with no operator — which means it only works at all if it is hung square on the flange it was designed for.",
      drag: { to: "gate-flange-socket", radius: 0.45, missNote: "Not seated on the flange — a gate that is not square against the culvert will not seal against the tide." },
    },
    {
      id: "level-float", kind: "track", target: "float-arm", seconds: 7,
      title: "Set the float arm to design elevation",
      cue: "Hold the adjustment steady while the bubble level stays in the band at the design elevation.",
      why: "The float arm is what tells this gate when the tide has turned. Set too high, the gate opens late and holds water on the marsh longer than the design calls for; set too low, it closes early and starves the marsh of the exchange this whole job exists to restore.",
      track: {
        start: 0.15, green: [0.38, 0.6], rise: 0.5, fall: 0.42, drift: 0.12, label: "FLOAT LEVEL",
        readout: (v) => (v < 0.38 ? "low of design elevation" : v > 0.6 ? "high of design elevation" : "on design elevation"),
      },
      holdBreakNote: "The float arm drifted out of band before the level was proven. Bring it back to design elevation and hold it there for the full check.",
    },
    {
      id: "bolt-new", kind: "sequence",
      targets: ["new-bolt-a", "new-bolt-b", "new-bolt-c"],
      itemNames: { "new-bolt-a": "bolt A", "new-bolt-b": "bolt B", "new-bolt-c": "bolt C" },
      title: "Bolt the new gate down",
      cue: "Torque the new gate's bolts in the same cross pattern — A, then B, then C.",
      why: "The same cross pattern that took the old gate off evenly is what seats the new one evenly. A gate torqued around the flange in order can end up cocked half a degree off the barrel — enough for the tide to work at for the next twenty years.",
      outOfOrderNote: "Cross pattern — A, then B, then C, same as it came apart. Working around the flange risks cocking the new gate on its seat.",
    },
    {
      id: "pull-cofferdam", kind: "sequence",
      targets: ["pull-top-course", "pull-mid-course", "pull-base-course"],
      itemNames: { "pull-top-course": "top course", "pull-mid-course": "middle course", "pull-base-course": "base course" },
      title: "Pull the cofferdam, top to base",
      cue: "Pull the top course first, then the middle course, then the base course.",
      why: "Top to base lets water start easing over gradually as the wall comes down, rather than the whole head of water arriving at once against a wall that is suddenly gone at the base — the base course is what is actually protecting the culvert toe, so it is the last thing removed, not the first.",
      outOfOrderNote: "Top course first, then middle, then base. Pulling the base first collapses the wall all at once against the toe it was protecting.",
    },
    {
      id: "observe-flood", kind: "hold", target: "viewing-point", seconds: 6,
      title: "Observe the first flood through the new gate",
      cue: "Hold your position at the viewing point and watch the gate swing and seal as the tide returns.",
      why: "The design is only proven once, on the water it was actually built for. Watching the first flood is how the crew confirms the float is really set right and the gate really swings free, rather than assuming it from the bolts and the level check alone.",
      holdBreakNote: "You looked away before the gate had cycled with the incoming tide. The first flood is the only test this gate gets before the crew leaves the site — watch it through.",
    },
    {
      id: "permit-log", kind: "select", target: "permit-board",
      title: "Sign off against the permits",
      cue: "Log today's work against the Corps' Section 404 permit, the Water Board's 401 certification and the fish-window restriction.",
      why: "This restoration exists inside a permit, not outside one. The Corps, the Regional Water Board and BCDC all conditioned this work on it happening inside the fish window and inside the scope they approved — the log is what proves it did.",
    },
    {
      id: "walk-site", kind: "find", noHint: true,
      targets: ["fish-window-sign-missing", "sediment-fence-gap", "tool-in-marsh"],
      itemNames: { "fish-window-sign-missing": "the fish-window posting, taken down", "sediment-fence-gap": "a gap in the sediment fence", "tool-in-marsh": "a tool left down in the marsh grass" },
      itemNotes: {
        "fish-window-sign-missing": "The posted fish-window notice at the work access has come down. It is what tells the next crew, and any inspector who visits, what dates this in-water work is actually authorized for.",
        "sediment-fence-gap": "There is a gap in the sediment fence along the levee toe. Turbid runoff into the channel past this point is exactly what the 401 certification's conditions exist to prevent.",
        "tool-in-marsh": "A hand tool was left down in the marsh grass at the base of the levee. Left there, it is debris in a tidal wetland under active restoration — picked up now, it is nothing.",
      },
      title: "Walk the site before you leave",
      cue: "Look over the access point, the sediment fence and the marsh below the levee, and click anything that needs fixing.",
      why: "The gate swap is the interesting part of the day and these three are the part that gets missed on the way out: the posting that proves the work was authorized, the fence that is the whole point of the 401 conditions, and anything the crew brought in that has to leave with them.",
    },
  ],

  build(root) {
    plantHardHat(root, THREE, "tide-gate", [-3.0, 1.1, -2.0]); // Hard Hat Hunt — docs/easter-egg.md
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, TG_ACCENT);

    // ---------------------------------------------------------------- the levee
    // A raised earthen pad cut through by the culvert, the same trick trench-box
    // and hot-tap use to make an excavation read as a hole rather than a smudge
    // — here it is a whole levee cross-section instead of a street.
    const LEVEE_H = 0.62;
    const levee = group(g, 0, 0, 0);
    const leveeTex = surfaceTexture((cx, w, h) => leveeTopFace(cx, w, h), { repeat: 3, px: 384 });
    const leveeMat = texturedMat(leveeTex, { color: 0xffffff, rough: 0.95, metal: 0.02 });
    const leveeTop = box(levee, 5.4, LEVEE_H, 2.6, 0, LEVEE_H / 2, 0, 0xffffff, { rough: 0.95, cast: false });
    leveeTop.material = leveeMat;
    // Sloped faces down to the marsh and the channel, textured the same way.
    const slopeUp = box(levee, 5.4, LEVEE_H, 0.9, 0, LEVEE_H / 2 - 0.05, -1.75, 0xffffff, { rough: 0.95, cast: false });
    slopeUp.material = leveeMat; slopeUp.rotation.x = 0.32;
    const slopeDown = box(levee, 5.4, LEVEE_H, 0.9, 0, LEVEE_H / 2 - 0.05, 1.75, 0xffffff, { rough: 0.95, cast: false });
    slopeDown.material = leveeMat; slopeDown.rotation.x = -0.32;

    // The culvert hole through the levee: cut into the pad rather than sitting
    // on top of it, so it reads as a barrel through the earth.
    const culvertY = -0.05;
    const holeGroup = group(levee, 0.1, LEVEE_H, 0);
    box(holeGroup, 1.0, 0.02, 2.6, 0, -0.02, 0, 0x33291b, { rough: 0.98, cast: false });
    const barrel = cyl(holeGroup, 0.32, 0.32, 2.7, 0, culvertY, 0, 0x6f6a5c, { rough: 0.85, metal: 0.15, seg: 22, open: true, side: 2 });
    barrel.rotation.x = Math.PI / 2;
    holoTag(holeGroup, "culvert barrel", -0.5, 0.28, -1.0, { css: "#8a9b4a", w: 0.32 });
    const scourVoid = box(holeGroup, 0.3, 0.14, 0.3, -0.35, culvertY - 0.28, -0.3, 0x1c1712, { rough: 0.98, cast: false });
    reg(hits, scourVoid, "scour-void");
    const spalled = box(holeGroup, 0.26, 0.05, 0.3, 0.25, culvertY - 0.3, 0.2, 0x9a8f78, { rough: 0.9, cast: false });
    reg(hits, spalled, "spalled-invert");

    // ------------------------------------------------------------- marsh + bay
    const marsh = group(g, 0, 0, -2.1);
    const marshWater = box(marsh, 5.6, 0.03, 1.4, 0, LEVEE_H - 0.28, -0.4, 0x5a6a3a, { rough: 0.2, metal: 0.3, opacity: 0.8, transparent: true, cast: false });
    holoTag(marsh, "marsh side", -2.2, LEVEE_H, -0.5, { css: "#8a9b4a", w: 0.3 });
    const marshStaff = group(marsh, 0.55, 0, -0.7);
    box(marshStaff, 0.08, 1.0, 0.03, 0, LEVEE_H - 0.28 + 0.4, 0, 0xf2f6fa, { rough: 0.7 });
    for (let i = 1; i < 8; i++) box(marshStaff, 0.08, 0.01, 0.032, 0, LEVEE_H - 0.28 + 0.05 + i * 0.09, 0.002, i % 4 === 0 ? 0xd2312b : 0x1b1e23, { rough: 0.7, cast: false });
    holoTag(marshStaff, "marsh staff gauge", 0, LEVEE_H + 1.15, 0, { css: "#8a9b4a", w: 0.32 });
    reg(hits, marshStaff, "upstream-gauge");

    const bay = group(g, 0, 0, 2.15);
    const bayWater = box(bay, 5.6, 0.03, 1.4, 0, LEVEE_H - 0.34, 0.4, 0x3a6a7a, { rough: 0.15, metal: 0.4, opacity: 0.8, transparent: true, cast: false });
    holoTag(bay, "bay / tidal channel", 2.1, LEVEE_H, 0.5, { css: "#8a9b4a", w: 0.4 });
    const bayStaff = group(bay, -0.6, 0, 0.7);
    box(bayStaff, 0.08, 1.0, 0.03, 0, LEVEE_H - 0.34 + 0.4, 0, 0xf2f6fa, { rough: 0.7 });
    for (let i = 1; i < 8; i++) box(bayStaff, 0.08, 0.01, 0.032, 0, LEVEE_H - 0.34 + 0.05 + i * 0.09, 0.002, i % 4 === 0 ? 0xd2312b : 0x1b1e23, { rough: 0.7, cast: false });
    holoTag(bayStaff, "channel staff gauge", 0, LEVEE_H + 1.1, 0, { css: "#8a9b4a", w: 0.36 });
    reg(hits, bayStaff, "downstream-gauge");
    const tideRipple = particles(bay, 30, 0x9fd0d8, { size: 0.03, life: 1.0, additive: false, opacity: 0.25 });
    tideRipple.position.set(0, LEVEE_H - 0.3, 0.4);

    // ---------------------------------------------------------------- cofferdam
    // Built at the bay-mouth of the culvert, three courses tall, so the barrel
    // is a dry excavation for the whole gate swap.
    const cofferdam = group(g, 0.1, LEVEE_H, 1.15);
    const bagCourses = [];
    for (let c = 0; c < 3; c++) {
      const course = group(cofferdam, 0, c * 0.16, -c * 0.05);
      for (let i = -3; i <= 3; i++) {
        cyl(course, 0.09, 0.1, 0.32, i * 0.19, 0.09, 0, 0xb8a878, { rough: 0.85, seg: 10 }).rotation.z = Math.PI / 2;
      }
      bagCourses.push(course);
      reg(hits, course, `bag-course-${c + 1}`);
    }
    // Pull targets reuse the same course objects under their own ids, since a
    // course removed and a course placed are the same physical stack.
    hits["pull-top-course"] = bagCourses[2];
    hits["pull-mid-course"] = bagCourses[1];
    hits["pull-base-course"] = bagCourses[0];
    holoTag(cofferdam, "sandbag cofferdam", 0, 0.75, -0.1, { css: "#f2c14b", w: 0.36 });
    const slumpFace = box(cofferdam, 0.5, 0.3, 0.15, 0.55, 0.2, 0.08, 0x9a8858, { rough: 0.85, cast: false });
    slumpFace.visible = false;
    reg(hits, slumpFace, "reinforce-slump");
    const floodCourse = group(cofferdam, 0, 0.5, -0.14);
    for (let i = -3; i <= 3; i++) cyl(floodCourse, 0.09, 0.1, 0.32, i * 0.19, 0.09, 0, 0xa89868, { rough: 0.85, seg: 10 }).rotation.z = Math.PI / 2;
    floodCourse.visible = false;
    reg(hits, floodCourse, "add-flood-course");
    const tamperTool = group(g, 0.85, LEVEE_H, 0.85, 0.4);
    cyl(tamperTool, 0.02, 0.02, 0.7, 0, 0.35, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 10 });
    box(tamperTool, 0.16, 0.08, 0.16, 0, 0.72, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    holoTag(tamperTool, "tamper", 0, 0.92, 0, { css: "#f2c14b", w: 0.24 });
    reg(hits, tamperTool, "tamper");
    const enterCulvert = box(holeGroup, 0.5, 0.4, 0.5, 0.15, culvertY, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, enterCulvert, "enter-open-culvert");
    const pullEarly = box(cofferdam, 0.6, 0.4, 0.3, 0, 0.2, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cofferdam, "pull it now?", 0, 0.55, 0.1, { css: "#d2312b", w: 0.3 });
    reg(hits, pullEarly, "pull-early");

    // ---------------------------------------------------------------- old / new gates
    const oldGate = group(g, -0.6, LEVEE_H, 1.35, 0.3);
    box(oldGate, 0.5, 0.5, 0.05, 0, 0, 0, 0x6f5a3a, { rough: 0.9, metal: 0.1 });
    for (let i = -1; i <= 1; i += 2) for (let j = -1; j <= 1; j += 2) cyl(oldGate, 0.014, 0.014, 0.05, i * 0.18, j * 0.18, 0.03, CITY.steel, { rough: 0.4, metal: 0.85, seg: 8 });
    const oldBoltA = cyl(oldGate, 0.016, 0.016, 0.05, -0.18, 0.18, 0.04, 0xd8232a, { rough: 0.4, metal: 0.7, seg: 8 });
    const oldBoltB = cyl(oldGate, 0.016, 0.016, 0.05, 0.18, -0.18, 0.04, 0xd8232a, { rough: 0.4, metal: 0.7, seg: 8 });
    const oldBoltC = cyl(oldGate, 0.016, 0.016, 0.05, 0.18, 0.18, 0.04, 0xd8232a, { rough: 0.4, metal: 0.7, seg: 8 });
    reg(hits, oldBoltA, "old-bolt-a"); reg(hits, oldBoltB, "old-bolt-b"); reg(hits, oldBoltC, "old-bolt-c");
    holoTag(oldGate, "failed flap gate", 0, 0.36, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, oldGate, "old-gate");

    const laydown = group(g, -1.9, LEVEE_H, 1.9);
    box(laydown, 1.0, 0.02, 0.9, 0, 0.01, 0, 0x4a5560, { rough: 0.9, cast: false });
    holoTag(laydown, "gate laydown", 0, 0.24, 0, { css: "#8a9b4a", w: 0.28 });
    hits["laydown-mat"] = laydown;
    const channelDrop = box(g, 0.5, 0.3, 0.5, -0.9, LEVEE_H - 0.3, 1.85, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "over the side?", -0.9, LEVEE_H, 1.9, { css: "#d2312b", w: 0.26 });
    reg(hits, channelDrop, "dump-old-gate");

    const flangeSocket = group(g, 0.1, LEVEE_H, 1.35);
    cyl(flangeSocket, 0.36, 0.36, 0.04, 0, 0, 0, 0x8a949d, { rough: 0.45, metal: 0.6, seg: 20 });
    hits["gate-flange-socket"] = flangeSocket;

    const newGate = group(g, 1.9, LEVEE_H, 1.35, -0.3);
    box(newGate, 0.5, 0.5, 0.06, 0, 0.28, 0, 0x3c7f45, { rough: 0.55, metal: 0.3 });
    const floatArmGroup = group(newGate, 0, 0.28, 0.1);
    cyl(floatArmGroup, 0.012, 0.012, 0.4, 0, 0.15, 0, CITY.steel, { rough: 0.4, metal: 0.75, seg: 8 });
    ball(floatArmGroup, 0.06, 0, 0.36, 0, 0xdfe6ec, { rough: 0.3, metal: 0.1, seg: 14 });
    holoTag(floatArmGroup, "float arm", 0, 0.55, 0, { css: "#f2c14b", w: 0.24 });
    reg(hits, floatArmGroup, "float-arm");
    for (let i = -1; i <= 1; i += 2) for (let j = -1; j <= 1; j += 2) cyl(newGate, 0.014, 0.014, 0.05, i * 0.18, 0.28 + j * 0.18, 0.03, CITY.steel, { rough: 0.4, metal: 0.85, seg: 8 });
    const newBoltA = cyl(newGate, 0.016, 0.016, 0.05, -0.18, 0.46, 0.04, 0x59c97b, { rough: 0.4, metal: 0.6, seg: 8 });
    const newBoltB = cyl(newGate, 0.016, 0.016, 0.05, 0.18, 0.1, 0.04, 0x59c97b, { rough: 0.4, metal: 0.6, seg: 8 });
    const newBoltC = cyl(newGate, 0.016, 0.016, 0.05, 0.18, 0.46, 0.04, 0x59c97b, { rough: 0.4, metal: 0.6, seg: 8 });
    reg(hits, newBoltA, "new-bolt-a"); reg(hits, newBoltB, "new-bolt-b"); reg(hits, newBoltC, "new-bolt-c");
    holoTag(newGate, "new self-regulating gate", 0, 0.75, 0, { css: "#59c97b", w: 0.5 });
    reg(hits, newGate, "new-gate");

    // ---------------------------------------------------------------- boards, PPE, viewing point
    const tideBoard = group(g, -2.35, LEVEE_H, -0.6, 0.4);
    holoPanel(tideBoard, 0.66, 0.44, 0, 1.05, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0e1608"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#8a9b4a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e6f0d0"; ctx.fillText("TIDE TABLE — TODAY", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#cbe0a8";
      ["Low water: 0620", "Turn to flood: 0805", "Window: ~105 min", "Predicted low: +0.3 ft MLLW"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.15)));
    }, { accent: TG_ACCENT });
    const tideHit = box(tideBoard, 0.66, 0.44, 0.04, 0, 1.05, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tideHit, "tide-board");

    const permitBoard = group(g, 2.4, LEVEE_H, -0.85, -0.4);
    holoPanel(permitBoard, 0.68, 0.46, 0, 1.08, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0e1608"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#8a9b4a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e6f0d0"; ctx.fillText("SECTION 404 / CWA 401 / BCDC", w * 0.06, h * 0.15);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`; ctx.fillStyle = "#cbe0a8";
      ["Fish window: open", "In-water work: authorized today", "Sediment control: required", "Gate elevation: per design"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { accent: TG_ACCENT });
    const permitHit = box(permitBoard, 0.68, 0.46, 0.04, 0, 1.08, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, permitHit, "permit-board");

    const fishSign = group(g, -2.5, LEVEE_H, 1.15, 0.5);
    box(fishSign, 0.3, 0.22, 0.02, 0, 0.9, 0, 0xdfe6ec, { rough: 0.7 });
    decal(fishSign, 0.26, 0.18, 0, 0.9, 0.012, signFace("FISH WINDOW\nOPEN", { bg: "#0e1608", accent: "#8a9b4a", scale: 0.32 }));
    cyl(fishSign, 0.02, 0.02, 0.9, 0, 0.45, 0, 0x6f6a5c, { rough: 0.7, seg: 8 });
    holoTag(fishSign, "fish-window posting", 0, 1.1, 0, { css: "#8a9b4a", w: 0.36 });
    reg(hits, fishSign, "fish-window-sign-missing");

    const sedFence = group(g, -1.0, LEVEE_H - 0.12, -1.5, 0.2);
    for (let i = -2; i <= 2; i++) box(sedFence, 0.02, 0.36, 0.02, i * 0.32, 0.18, 0, 0x6f6a5c, { rough: 0.7, cast: false });
    const fenceFabric = box(sedFence, 1.5, 0.3, 0.01, 0, 0.2, 0, 0xd8b23a, { rough: 0.8, opacity: 0.85, transparent: true, cast: false });
    const fenceGap = box(sedFence, 0.3, 0.3, 0.15, 0.5, 0.16, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(sedFence, "sediment fence", 0, 0.5, 0, { css: "#8a9b4a", w: 0.3 });
    reg(hits, fenceGap, "sediment-fence-gap");
    void fenceFabric;

    const droppedTool = box(g, 0.14, 0.05, 0.05, 1.4, 0.02, -2.0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    holoTag(g, "tool in the marsh grass", 1.4, 0.28, -2.0, { css: "#f2c14b", w: 0.36 });
    reg(hits, droppedTool, "tool-in-marsh");

    const pfdRack = group(g, 2.2, LEVEE_H, 1.2, -0.3);
    box(pfdRack, 0.05, 0.9, 0.05, 0, 0.45, 0, 0x6f6a5c, { rough: 0.7 });
    const pfd = box(pfdRack, 0.34, 0.4, 0.08, 0, 0.6, 0, 0xf2894b, { rough: 0.8 });
    holoTag(pfdRack, "PFDs", 0, 0.9, 0, { css: "#8a9b4a", w: 0.2 });
    void pfd;
    const noPfd = box(g, 0.4, 0.5, 0.4, 0.4, LEVEE_H + 0.1, 1.95, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step to the edge without one?", 0.4, LEVEE_H + 0.5, 2.0, { css: "#d2312b", w: 0.56 });
    reg(hits, noPfd, "no-pfd");

    const viewGroup = group(g, 1.6, LEVEE_H, 2.15, -0.5);
    box(viewGroup, 0.02, 0.9, 0.02, 0, 0.45, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(viewGroup, "viewing point", 0, 1.0, 0, { css: "#8a9b4a", w: 0.3 });
    reg(hits, viewGroup, "viewing-point");

    // ---------------------------------------------------------------- guarding, tools, crew
    // The crown of the levee is wide enough to work and stand on, so the
    // ancillary props sit up there with the gate work, not buried in the
    // mound at ground level the way a naive y=0 placement would put them.
    const crown = group(g, 0, LEVEE_H, 0);
    barrierPanel(g, -0.3, -2.35, { color: 0xe4622a, w: 1.4 });
    cone(g, 2.9, -1.4, { color: 0xe4622a });
    cone(g, -2.9, -1.4, { color: 0xe4622a });
    toolChest(crown, -2.3, 0.65, { ry: 0.5, color: 0x2f6f4a });
    standingFigure(crown, 2.3, 0.55, { ry: 1.2, cloth: 0x2b6f8f, helmet: 0xf2c14b, vest: 0xd8e33a });

    let bagFlow = 0;
    let addedFlood = false;
    let slumping = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.15, LEVEE_H + 0.8, 0.1),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "pack-cofferdam") for (const c of bagCourses) c.position.z = 0;
        if (step.id === "unbolt-old") { oldBoltA.visible = false; oldBoltB.visible = false; oldBoltC.visible = false; oldGate.rotation.y = 0.4; }
        if (step.id === "remove-old-gate") { oldGate.parent.remove(oldGate); laydown.add(oldGate); oldGate.position.set(0, 0.28, 0); oldGate.rotation.set(0, 0, 0); }
        if (step.id === "hang-new-gate") { newGate.parent.remove(newGate); flangeSocket.add(newGate); newGate.position.set(0, 0.28, 0.02); newGate.rotation.set(0, 0, 0); }
        if (step.id === "level-float") floatArmGroup.rotation.x = 0;
        if (step.id === "bolt-new") { newBoltA.material.emissiveIntensity = 0; }
        if (step.id === "pull-cofferdam") { bagCourses.forEach((c) => { c.visible = false; }); addedFlood = false; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "flood-early") { addedFlood = true; floodCourse.visible = true; tideRipple.position.z = 0.9; }
        if (it.id === "wall-slumping") { slumping = true; slumpFace.visible = true; bagCourses[2].position.z -= 0.08; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "flood-early") { addedFlood = false; tideRipple.position.z = 0.4; }
        if (it.id === "wall-slumping") { slumping = false; slumpFace.visible = false; bagCourses[2].position.z += 0.08; }
      },
      animate(t, dt) {
        tideRipple.visible = true;
        tideRipple.userData.step(dt, new THREE.Vector3(0, LEVEE_H - 0.3, addedFlood ? 0.9 : 0.4), 0.4, 0.15, 0.05);
        marshWater.position.y = LEVEE_H - 0.28 + Math.sin(t * 0.5) * 0.005;
        bayWater.position.y = LEVEE_H - 0.34 + Math.sin(t * 0.6 + 1) * 0.006;
        if (slumping) slumpFace.position.x = 0.55 + Math.sin(t * 4) * 0.01;
        floatArmGroup.rotation.x = Math.sin(t * 0.8) * 0.03;
        void bagFlow;
      },
    };
  },
};

