import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Count It: a Fair Survey. Upper-primary maths at the India Basin Shoreline Park Crew site in San Francisco: how to count shorebirds fairly with a survey box, the same time and the same rules, and why a fair count lets people compare the shore over time, using only what the shore and the survey sheet in the scene show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ES_COUNT_IT_A_FAIR_SURVEY = {
  id: "k12-es-count-it-a-fair-survey",
  index: "878",
  domain: "Education",
  trade: "Maths class with the shoreline park crew on a bird count — learner and park survey lead",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Count It: a Fair Survey",
  title: simTitle("Count It: a Fair Survey"),
  tagline: "Same box, same time, same rules — count the shorebirds fairly so the numbers mean something",
  accent: 0x8a7ab0,
  accentCss: "#8a7ab0",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"fair-counter","name":"Fair Counter","note":"Ran a fair shorebird count with a survey box and fixed rules, tallied without counting twice and compared with another group"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Count Board",
    currency: "TALLIES",
    ranks: ["Spotter","Counter","Tallier","Surveyor","Survey Lead"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-parts-of-a-fair") },
      { id: "no-shortcut", name: "No Shortcuts", note: "No misconception or unsafe shortcut anywhere in the run", test: AWARD.safe },
      { id: "in-the-band", name: "In the Band", note: "Every gauge and meter held inside its band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-hands", name: "Steady Hands", note: "Every hold and track carried its full count", test: AWARD.unbroken },
      { id: "quick-and-right", name: "Quick and Right", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "count-the-same-bird-twice": "You counted the same bird twice when it flew back. A fair count gives each bird one tally. Sweep the box once from left to right and count only what you see on that sweep.",
    "count-only-the-busy-spot": "You chose the busiest spot to count. Picking the best spot makes the shore look busier than it is. Count in the box the survey lead marked, busy or quiet.",
    "walk-to-the-waterline": "You started down to the waterline. The shore can be slippery, and walking close sends the birds away, which spoils the count. Count from the path with binoculars.",
    "change-the-rules-halfway": "You added gulls halfway through the count. Changing the rules during a count means the start and end do not match. Decide what counts before you begin, and keep it."
  },

  lateNotes: {
    "esc-tally-log": "The totals are written once the sweep is done — nothing to record yet.",
    "esc-checkin": "The check-in comes at the very end of the survey."
  },

  steps: [
    {
      id: "find-the-parts-of-a-fair",
      kind: "find",
      noHint: true,
      targets: [
        "esc-box",
        "esc-timer",
        "esc-rules"
      ],
      itemNames: {
        "esc-box": "the marked survey box on the shore",
        "esc-timer": "the survey timer",
        "esc-rules": "the rule card"
      },
      itemNotes: {
        "esc-box": "Count only inside it.",
        "esc-timer": "Everyone counts for the same time.",
        "esc-rules": "It says which birds to count."
      },
      decoyNotes: {
        "esc-kite": "Fun to watch, but not part of the survey."
      },
      title: "Find the parts of a fair survey",
      cue: "Mark the three things that make the count fair.",
      why: "A fair survey follows fixed rules so anyone can repeat it. The survey box marks exactly where to count, the timer sets how long to count, and the rule card says which birds count. When the place, the time and the rules stay the same, counts from different days can be compared honestly."
    },
    {
      id: "agree-on-the-rules-before-you",
      kind: "select",
      target: "esc-rule-card",
      title: "Agree on the rules before you start",
      cue: "Read the rule card aloud with your group before the timer starts.",
      why: "Agreeing on the rules first means everyone counts the same way. If one person counts gulls and another does not, the totals cannot be added or compared. Survey leads always read the rules together at the start, because a count is only as good as its rules."
    },
    {
      id: "put-the-survey-steps-in-order",
      kind: "sequence",
      targets: [
        "esc-ord-rules",
        "esc-ord-timer",
        "esc-ord-sweep",
        "esc-ord-total"
      ],
      itemNames: {
        "esc-ord-rules": "1 · agree on the rules",
        "esc-ord-timer": "2 · start the survey timer",
        "esc-ord-sweep": "3 · sweep the box once from left to right",
        "esc-ord-total": "4 · stop and add up the tallies"
      },
      title: "Put the survey steps in order",
      cue: "Put the steps of a fair count in order.",
      why: "A survey has a fixed order so it can be repeated. You agree on the rules, start the timer, sweep the box once from left to right, and then stop and add up. Doing it the same way every time is what lets a count from this week be compared with one from next month.",
      outOfOrderNote: "Out of order. Start by agreeing on the rules."
    },
    {
      id: "hold-the-binoculars-steady-through-the",
      kind: "hold",
      target: "esc-sweep-hold",
      seconds: 6,
      title: "Hold the binoculars steady through the sweep",
      cue: "Hold the binoculars steady while you sweep the box slowly.",
      why: "A steady sweep means each bird passes through your view once. Jerky movement makes birds jump in and out of view, and that leads to double counts. Careful, slow sweeping is the skill real surveyors practise most. Surveyors often practise sweeping on an empty stretch first, so their movement is smooth when the birds are there.",
      holdBreakNote: "The binoculars jumped. Hold them steady and carry on the sweep."
    },
    {
      id: "focus-the-binoculars-on-the-survey",
      kind: "turn",
      target: "esc-focus-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "FOCUS"
      },
      title: "Focus the binoculars on the survey box",
      cue: "Turn the focus wheel until the birds in the survey box are sharp.",
      why: "Sharp binoculars help you tell one kind of bird from another and see birds that are close together. A blurry view leads to missed birds or double counts. Setting the focus before the timer starts means your count begins cleanly."
    },
    {
      id: "read-the-survey-timer",
      kind: "gauge",
      target: "esc-timer-meter",
      gauge: {
        label: "TIME",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the end yet. Stop when the timer reaches the mark.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the survey timer",
      cue: "Commit when the timer marker reaches the end of the counting time.",
      why: "Stopping exactly when the timer ends keeps every count the same length. Counting longer would find more birds even if the shore had not changed. Reading the timer carefully is a small step that keeps the whole survey fair. Counts of different lengths cannot be compared, just like races of different lengths cannot."
    },
    {
      id: "place-the-tally-mark-in-the",
      kind: "drag",
      target: "esc-tally",
      drag: {
        to: "esc-sand-col",
        radius: 0.45,
        missNote: "Not in the sandpiper column yet. Check the heading and place it there."
      },
      title: "Place the tally mark in the right column",
      cue: "Drag the tally for the sandpiper into the sandpiper column.",
      why: "Each kind of bird has its own column on the survey sheet. Putting each tally in the right place keeps the totals correct for every kind. Survey sheets are laid out this way so that anyone can add them up and check them. A tally in the wrong column makes one kind of bird look common and another look rare."
    },
    {
      id: "say-why-the-count-is-fair",
      kind: "select",
      target: "esc-result-card",
      title: "Say why the count is fair",
      cue: "Choose the sentence that explains why your count can be compared.",
      why: "Your count used the same box, the same time and the same rules as the other group. That is why the two counts can be compared. A good answer names those three things and does not claim the count shows more than it does. When the place, the time and the rules match, a difference in the count is more likely to be real."
    },
    {
      id: "spot-the-kinds-of-shorebirds-in",
      kind: "find",
      noHint: true,
      targets: [
        "esc-sandpiper",
        "esc-egret",
        "esc-duck"
      ],
      itemNames: {
        "esc-sandpiper": "a small sandpiper at the edge",
        "esc-egret": "a tall white egret",
        "esc-duck": "a duck floating near the shore"
      },
      itemNotes: {
        "esc-sandpiper": "Quick and small; count it once.",
        "esc-egret": "Stands still in the shallows.",
        "esc-duck": "Counts if it is inside the box."
      },
      decoyNotes: {
        "esc-dog": "A friendly visitor, but not on the rule card."
      },
      title: "Spot the kinds of shorebirds in the box",
      cue: "Look through the binoculars and mark each kind on the rule card.",
      why: "Knowing the kinds on the rule card helps you count only what the survey asks for. A small sandpiper running at the edge, a tall egret standing still and a duck floating nearby are each counted in their own column. Telling them apart is the first skill of any bird survey."
    },
    {
      id: "follow-one-bird-as-it-moves",
      kind: "track",
      target: "esc-bird-track",
      seconds: 8,
      track: {
        start: 0.3,
        green: [
          0.4,
          0.62
        ],
        rise: 0.46,
        fall: 0.38,
        drift: 0.14,
        label: "FOLLOW",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Follow one bird as it moves in the box",
      cue: "Keep the marker on the egret as it walks across the survey box.",
      why: "Following one bird shows why counting in a single sweep matters. The egret walks from one side to the other, so a careless counter might count it twice. Watching it helps you see how surveyors avoid double counts. The same idea works for counting cars, people or trees: count each one once, on one pass.",
      holdBreakNote: "The marker lost the egret. Find it again and follow it across the box."
    },
    {
      id: "record-the-tally-totals",
      kind: "select",
      target: "esc-tally-log",
      doneLine: "Totals recorded",
      title: "Record the tally totals",
      cue: "Write the total for each kind of bird at the bottom of its column.",
      why: "Adding each column gives the totals that the survey reports. Writing them neatly lets another person check your adding. The park crew keeps these totals from every survey, so changes on the shore can be seen over time. Clear totals let the park crew see whether more or fewer birds use the shore as the seasons change."
    },
    {
      id: "compare-totals-with-another-group",
      kind: "select",
      target: "esc-share-board",
      doneLine: "Totals compared",
      title: "Compare totals with another group",
      cue: "Put your totals next to another group's and talk about any difference.",
      why: "If two groups counted the same box at the same time, their totals should be close. A big difference means someone missed birds or counted twice. Comparing is how surveyors check their counts, and it is why fair rules matter so much."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "esc-checkin",
      doneLine: "Checked in",
      title: "Check in before leaving the path",
      cue: "What three things keep a count fair? Why does that matter?",
      why: "The survey lead checks each group's understanding before the count is filed. Each learner names the box, the time and the rules. If anyone counted a bird twice, the group sorts out how to avoid it next time. Understanding why the rules matter is what lets you run a fair survey anywhere, not just on this shore."
    }
  ],

  interrupts: [
    {
      id: "a-cyclist-rings-a-bell",
      kind: "Cyclist",
      after: "hold-the-binoculars-steady-through-the",
      delay: 3,
      seconds: 12,
      target: "esc-move-in",
      alert: "A cyclist rings a bell coming along the shoreline path.",
      cue: "Move to the side of the path and let the cyclist pass.",
      why: "The shoreline path is shared. Moving to one side lets the cyclist pass safely. Surveyors choose spots at the edge of paths so they can keep counting without blocking anyone.",
      missNote: "The class blocked the path, and the cyclist had to stop and wait.",
      wrongNote: "That leaves you in the cyclist's way. Move to the side. Choose the response that deals with it now."
    },
    {
      id: "the-survey-lead-asks-about-double-counts",
      kind: "Survey question",
      after: "follow-one-bird-as-it-moves",
      delay: 3,
      seconds: 12,
      target: "esc-name-sweep",
      alert: "The survey lead asks how you avoid counting the same bird twice.",
      cue: "Say you sweep the box once from left to right and count each bird once.",
      why: "A single sweep is the main way surveyors avoid double counts. Knowing it shows you understand what makes a count fair. The same rule works for counting anything that moves.",
      missNote: "You could not say how to avoid double counts, and the survey lead had to explain before the class went on.",
      wrongNote: "That does not explain the sweep. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x8a7ab0;
    const CSS = "#8a7ab0";
    stationPad(g, 2.7, ACC);

    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      cyl(m, 0.012, 0.012, y - 0.05, 0, (y - 0.05) / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? ACC, { emissive: o.color ?? ACC, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? CSS, w: o.w ?? 0.46 });
      reg(hits, b, id);
      return m;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      cyl(c, 0.014, 0.014, y - 0.1, 0, (y - 0.1) / 2, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const plate = decal(c, o.cw ?? 0.4, o.ch ?? 0.22, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1c1a24", accent: o.accent ?? CSS, scale: 0.36 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.18, 0.002, { css: o.css ?? CSS, w: o.w ?? 0.5 });
      reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.52 });
    const text = (cx, w, h, title, rows, accent = CSS) => {
      cx.fillStyle = "rgba(20,18,26,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = accent; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fff4e2"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.42 + i * 0.14)));
    };
    const board = (x, z, ry, id, label) => {
      const b = group(g, x, 1.55, z, ry);
      box(b, 0.64, 0.4, 0.02, 0, 0, -0.012, ACC, { rough: 0.5, emissive: ACC, ei: 0.25 });
      cyl(b, 0.02, 0.02, 1.35, 0, -0.85, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, 0.6, 0.36, 0, 0, 0, (cx, w, h) => text(cx, w, h, label.toUpperCase(), ["Open"]), { px: 384, glow: true, ei: 0.9 });
      reg(hits, b.userData.face, id);
      return b;
    };
    const meter = (x, z, ry, id, label) => {
      const s = stand(x, z, ry);
      const m = instrument(s, 0, 1.02, 0, { idle: "READY", color: ACC, w: 0.2, d: 0.26 });
      holoTag(s, label, 0, 1.24, 0, { css: CSS, w: 0.46 });
      reg(hits, m, id);
      return m;
    };
    const dial = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.9);
      const dd = cyl(s, 0.09, 0.09, 0.06, 0, 0.95, 0, 0xd8a54a, { rough: 0.5, metal: 0.3, seg: 18 });
      box(s, 0.02, 0.02, 0.1, 0, 0.99, 0.05, 0x1a1a1a, { rough: 0.6 });
      holoTag(s, label, 0, 1.15, 0, { css: CSS, w: 0.42 });
      reg(hits, dd, id);
      return dd;
    };
    const token = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const tk = cyl(s, 0.06, 0.06, 0.025, 0, 0.98, 0, 0xd8a54a, { rough: 0.5, seg: 16 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.4 });
      reg(hits, tk, id);
      return tk;
    };
    const spot = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const p = box(s, 0.2, 0.012, 0.2, 0, 0.965, 0, ACC, { emissive: ACC, ei: 0.5, rough: 0.6 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.42 });
      reg(hits, p, id);
      return s;
    };

    // ------------------------------------------------------------ the place
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#625e68", base2: "#56525c", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e4e0ea", base2: "#d4cede", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // a learning wall behind the station, with a board the class works on
    const wall = group(g, 0, 0, -4.7);
    box(wall, 6.4, 2.6, 0.12, 0, 1.3, 0, 0xe0dccf, { rough: 0.7 }).material = wallMat;
    box(wall, 2.6, 1.2, 0.03, 0, 1.55, 0.08, 0x2f4a3a, { rough: 0.9 });
    box(wall, 2.7, 0.05, 0.08, 0, 0.93, 0.1, 0xb89a6a, { rough: 0.6 });
    for (let i = 0; i < 5; i++) box(wall, 0.34, 0.24, 0.02, -2.6 + i * 0.3 + (i > 2 ? 3.1 : 0) - (i > 2 ? 0.9 : 0), 1.8, 0.08, [0xf2c14b, 0x7fc4d8, 0xf0a0a0, 0xa0e0a0, 0xd0b0f0][i], { rough: 0.8 });
    // desks and stools for the class, clear of every control
    for (let i = 0; i < 4; i++) {
      const side = i < 2 ? -1 : 1, k = i % 2;
      const desk = group(g, side * (3.2 + (k % 2) * 0.2), 0, -2.4 + k * 1.3, side * 0.3);
      box(desk, 0.9, 0.04, 0.55, 0, 0.74, 0, 5930936, { rough: 0.6 });
      for (const [lx, lz] of [[-0.4, -0.23], [0.4, -0.23], [-0.4, 0.23], [0.4, 0.23]]) box(desk, 0.035, 0.72, 0.035, lx, 0.36, lz, 0x3a3f46, { rough: 0.5, metal: 0.5 });
      box(desk, 0.3, 0.02, 0.22, 0.1, 0.77, 0, 0xf4f0e6, { rough: 0.9 });
      const stool = group(desk, 0, 0, 0.55);
      cyl(stool, 0.16, 0.16, 0.04, 0, 0.45, 0, 0x2b2f35, { rough: 0.6, seg: 14 });
      for (let a = 0; a < 3; a++) box(stool, 0.03, 0.44, 0.03, Math.sin(a * 2.1) * 0.11, 0.22, Math.cos(a * 2.1) * 0.11, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    }
    // shelves of the lesson's materials
    for (const sx of [-2.9, 2.9]) {
      const sh = group(g, sx, 0, -4.2);
      box(sh, 1.0, 1.6, 0.34, 0, 0.8, 0, 0x6b4a2e, { rough: 0.7 });
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) box(sh, 0.18, 0.28, 0.24, -0.33 + c * 0.22, 0.3 + r * 0.5, 0.04, [0xd86a4a, 0x4a8ad8, 0xd8c04a, 0x5ab87a][(r + c) % 4], { rough: 0.8 });
    }

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "esc-box", "the marked survey box on the shore", {});
    bead(-1.42, 1.18, -0.62, "esc-timer", "the survey timer", {});
    bead(-1.03, 1.46, -0.71, "esc-rules", "the rule card", {});
    bead(-1.08, 0.9, -1.11, "esc-kite", "a kite over the park", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "esc-ord-rules", "1 · agree on the rules", {});
    bead(-0.58, 1.46, -1.44, "esc-ord-timer", "2 · start the survey timer", {});
    bead(-0.24, 0.9, -1.23, "esc-ord-sweep", "3 · sweep the box once from left to right", {});
    bead(0, 1.18, -1.55, "esc-ord-total", "4 · stop and add up the tallies", {});
    bead(0.24, 1.46, -1.23, "esc-sweep-hold", "Hold the sweep", {});
    bead(0.58, 0.9, -1.44, "esc-sandpiper", "a small sandpiper at the edge", {});
    bead(0.68, 1.18, -1.05, "esc-egret", "a tall white egret", {});
    bead(1.08, 1.46, -1.11, "esc-duck", "a duck floating near the shore", {});
    bead(1.03, 0.9, -0.71, "esc-dog", "a dog on a lead on the path", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "esc-move-in", "Move to the side of the path", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "esc-name-sweep", "Say how to avoid counting twice", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "esc-rule-card", "Rules agreed", "RULES\nFIRST", { ry: 1.2 });
    dials["esc-focus-dial"] = dial(-1.89, -1.4, 0.93, "esc-focus-dial", "Binocular focus");
    meters["esc-timer-meter"] = meter(-1.45, -1.85, 0.67, "esc-timer-meter", "Survey timer");
    tokens["esc-tally"] = token(-0.92, -2.16, 0.4, "esc-tally", "Tally mark");
    spots["esc-sand-col"] = spot(-0.31, -2.33, 0.13, "esc-sand-col", "The sandpiper column");
    card(0.31, 1.35, -2.33, "esc-result-card", "Explain the fairness", "WHY\nFAIR?", { ry: -0.13 });
    meters["esc-bird-track"] = meter(0.92, -2.16, -0.4, "esc-bird-track", "Bird followed");
    boards["esc-tally-log"] = board(1.45, -1.85, -0.67, "esc-tally-log", "Tally totals");
    boards["esc-share-board"] = board(1.89, -1.4, -0.93, "esc-share-board", "Compare totals");
    boards["esc-checkin"] = board(2.19, -0.85, -1.2, "esc-checkin", "End-of-survey check-in");
    hazardCard(-1.53, 0.72, -1.21, "count-the-same-bird-twice", "Count the bird again when it flies back?", "COUNT\nAGAIN?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "count-only-the-busy-spot", "Count only where there are lots of birds?", "ONLY\nBUSY?", 0.3);
    hazardCard(0.58, 0.72, -1.86, "walk-to-the-waterline", "Walk down to the waterline for a better view?", "TO THE\nWATER", -0.3);
    hazardCard(1.53, 0.72, -1.21, "change-the-rules-halfway", "Start counting gulls halfway through?", "NEW\nRULE?", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Same box, same time, same rules."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
    const paintGuide = (msg) => repaint(guideFace, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      let line = "", yy = h * 0.1; const x0 = w * 0.05, maxW = w * 0.9, lh = h * 0.13;
      for (const word of String(msg).split(" ")) {
        const tt = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(tt)?.width ?? tt.length * lh * 0.45) > maxW && line) { cx.fillText(line, x0, yy); line = word; yy += lh; }
        else line = tt;
      }
      if (line) cx.fillText(line, x0, yy);
    });

    // ------------------------------------------------------------ the people (clear of every control)
    const crew = {};
    crew["a"] = standingFigure(g, 3, 0.7, { ry: -1.9, cloth: 0x3a6a4a, trousers: 0x2b2f35 });
    holoTag(g, "Maths teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Park survey lead", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Park crew member", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-cyclist-rings-a-bell"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-cyclist-rings-a-bell"].visible = false;
    arrivals["the-survey-lead-asks-about-double-counts"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-survey-lead-asks-about-double-counts"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-tally-mark-in-the") { const s = spots["esc-sand-col"]; tokens["esc-tally"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-tally-totals") repaint(boards["esc-tally-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Totals recorded"], "#59c97b"));
        if (step.id === "compare-totals-with-another-group") repaint(boards["esc-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Totals compared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["esc-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-why-the-count-is-fair") paintGuide("One sweep, one tally each.");
      },

      onHazard() {
        paintGuide("Stop. Count from the path.");
      },

      onInterrupt(it) {
        const who = arrivals[it.id];
        if (who) { who.visible = true; who.position.z += 0.4; }
        alarmLamp.material = lampLit;
      },
      onInterruptEnd(it) {
        alarmLamp.material = lampOn;
        const who = arrivals[it.id];
        if (it.resolved !== "answered") { if (who) who.rotation.y += 0.6; paintGuide("That one went unanswered. Next time, stop and deal with it first."); return; }
        if (it.id === "a-cyclist-rings-a-bell") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Path clear, the cyclist passed. The lesson carries on."); }
        if (it.id === "the-survey-lead-asks-about-double-counts") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Sweep explained. The lesson carries on."); }
      },

      animate(tm, dt, session) {
        void tm; void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && meters[session.step?.target]) {
          const [lo, hi] = session.step.gauge.green;
          const ok = gg.t >= lo && gg.t <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "IN BAND" : gg.t < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
        const tr = session?.track;
        if (tr && meters[session.step?.target]) {
          const [lo, hi] = session.step.track.green;
          const ok = tr.v >= lo && tr.v <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "STEADY" : tr.v < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
      },
    };
  },
};
