import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Ecosystems at the Kelp Transect. Upper-primary and lower-secondary science aboard a survey tender above the kelp forest: producers, consumers and decomposers along a transect line watched on the dive team's live camera, a food web built from what the camera shows, and why a survey counts rather than guesses. Learners stay on deck; the divers do the diving.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ECOSYSTEMS_AT_THE_KELP_TRANSECT = {
  id: "k12-ecosystems-at-the-kelp-transect",
  index: "819",
  domain: "Education",
  trade: "Science class on the survey tender, watching the kelp transect — learner and marine scientist",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Ecosystems at the Kelp Transect",
  title: simTitle("Ecosystems at the Kelp Transect"),
  tagline: "Every living thing on the line eats or is eaten — and learners watch from the deck, never the water",
  accent: 0x4fb88a,
  accentCss: "#4fb88a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"web-of-life","name":"Web of Life","note":"A kelp food web built from what the transect camera showed, with producers, consumers and decomposers named and the count kept honest"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Transect Board",
    currency: "SIGHTINGS",
    ranks: ["Spotter","Counter","Recorder","Ecologist","Marine Scientist"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-three-roles-on-the") },
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
    "arrows-point-to-the-eater": "You drew the food-web arrow from the animal to its food. By agreement the arrow shows where the energy goes, so it points from the food to the eater: kelp to urchin, urchin to its predator. Backwards arrows make the web say the opposite of what happens.",
    "remove-one-changes-nothing": "You said taking one kind of animal out of the kelp forest would change nothing. In a food web, everything that ate it loses food and everything it ate loses a predator; one change spreads through the whole web, which is why ecologists watch every link.",
    "lean-over-the-gunwale": "You leaned over the side of the tender to look for the divers. Learners stay inside the rail on deck, wearing their lifejackets, and the camera screen shows everything the divers see; the side is the dive team's working area.",
    "count-what-you-expect": "You added animals to the count that you expected but did not see on the camera. A survey records what was observed along the line, nothing more; a count padded with guesses cannot show whether the forest is changing."
  },

  lateNotes: {
    "kek-survey-log": "The survey record is written once the line is finished — nothing to record yet.",
    "kek-checkin": "The check-in comes at the very end of the trip."
  },

  steps: [
    {
      id: "find-the-three-roles-on-the",
      kind: "find",
      noHint: true,
      targets: [
        "kek-producer",
        "kek-consumer",
        "kek-decomposer"
      ],
      itemNames: {
        "kek-producer": "the kelp fronds reaching for the light",
        "kek-consumer": "an urchin grazing on the holdfast",
        "kek-decomposer": "a crab picking over drift on the seabed"
      },
      itemNotes: {
        "kek-producer": "A producer: it makes food from sunlight.",
        "kek-consumer": "A consumer: it eats the kelp.",
        "kek-decomposer": "Part of the clean-up crew that breaks down what dies."
      },
      decoyNotes: {
        "kek-tape-line": "The tape marks where the survey runs. It is not part of the ecosystem."
      },
      title: "Find the three roles on the transect",
      cue: "Mark one producer, one consumer and one decomposer on the camera feed.",
      why: "Every ecosystem runs on three jobs. Producers, like the kelp, make food from sunlight; consumers, like urchins and fish, eat other living things; decomposers break down what dies and return it to the water. Finding one of each on the real transect shows that the diagram in the textbook is happening right below the boat."
    },
    {
      id: "check-your-lifejacket-and-stay-inside",
      kind: "select",
      target: "kek-lifejacket-card",
      title: "Check your lifejacket and stay inside the rail",
      cue: "Check your lifejacket is fastened and take your place inside the rail by the screen.",
      why: "On a boat above a dive, the deck crew's first rule for visitors is a fastened lifejacket and a place inside the rail. The divers depend on the tender crew's full attention, and a learner who stays put lets them give it, which is part of keeping the dive safe."
    },
    {
      id: "put-the-survey-method-in-order",
      kind: "sequence",
      targets: [
        "kek-ord-follow",
        "kek-ord-identify",
        "kek-ord-record",
        "kek-ord-web"
      ],
      itemNames: {
        "kek-ord-follow": "1 · follow the transect line",
        "kek-ord-identify": "2 · identify each living thing",
        "kek-ord-record": "3 · record it straight away",
        "kek-ord-web": "4 · build the food web from the record"
      },
      title: "Put the survey method in order",
      cue: "Follow the line, identify each living thing, record it, then build the web.",
      why: "A transect survey follows a fixed line so the same place can be surveyed again and compared. Identifying each living thing as the camera passes, recording it straight away, and only then building the food web from the record keeps the web based on evidence rather than on what you expected to find.",
      outOfOrderNote: "Out of order. Record what the camera shows before you build the web."
    },
    {
      id: "hold-the-screen-view-steady-on",
      kind: "hold",
      target: "kek-hold-view",
      seconds: 6,
      title: "Hold the screen view steady on the line",
      cue: "Hold the camera control steady on the tape while the diver moves along it.",
      why: "A survey only counts what is along the line, so the camera has to stay on the tape. Holding the view steady while the diver swims keeps the survey fair: the same strip is watched from start to end, and nothing is counted twice or missed because the camera wandered.",
      holdBreakNote: "The view drifted off the tape. Bring it back to the line and hold it."
    },
    {
      id: "turn-the-web-card-to-add",
      kind: "turn",
      target: "kek-arrow-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "ENERGY"
      },
      title: "Turn the web card to add a link",
      cue: "Turn the arrow on the web card so it points from the kelp to the urchin.",
      why: "The arrow in a food web shows where the energy goes, so it points from the food to the animal that eats it. Turning it the right way for one link, kelp to urchin, sets the pattern for every other link you draw."
    },
    {
      id: "judge-the-visibility-before-counting",
      kind: "gauge",
      target: "kek-vis-meter",
      gauge: {
        label: "VISIBILITY",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not clear enough to call. Wait for a steady reading before counting."
      },
      title: "Judge the visibility before counting",
      cue: "Commit when the visibility bar shows the water is clear enough to count.",
      why: "If the water is too murky, animals are missed and the count comes out low for the wrong reason. Surveyors note the visibility before they count and write it in the record, so that a low count on a murky day is not mistaken for a real decline in the forest."
    },
    {
      id: "place-the-sea-star-in-the",
      kind: "drag",
      target: "kek-star-token",
      drag: {
        to: "kek-star-spot",
        radius: 0.45,
        missNote: "Not in its place yet. Put it where the arrow comes from the urchin."
      },
      title: "Place the sea star in the web",
      cue: "Drag the sea star card to where it belongs: an eater of urchins.",
      why: "A predator that eats urchins keeps their numbers in check, and fewer urchins means more kelp survives. Placing it above the urchin in the web shows that chain, and it is the kind of link marine scientists watch when they ask why a kelp forest is thriving or thinning."
    },
    {
      id: "say-what-happens-if-the-urchins",
      kind: "select",
      target: "kek-compare-card",
      title: "Say what happens if the urchin's predator goes",
      cue: "Say what could happen to the kelp if the urchins' predator disappeared, and why.",
      why: "With no predator, urchins can grow in number and graze the kelp faster than it regrows. Explaining that chain, predator to urchin to kelp, is understanding the web as a system rather than a list, which is what ecology is about."
    },
    {
      id: "spot-the-problems-in-a-classmates",
      kind: "find",
      noHint: true,
      targets: [
        "kek-fw-backwards",
        "kek-fw-unseen",
        "kek-fw-no-base"
      ],
      itemNames: {
        "kek-fw-backwards": "an arrow pointing from eater to food",
        "kek-fw-unseen": "an animal the camera never showed",
        "kek-fw-no-base": "no producer at the base"
      },
      itemNotes: {
        "kek-fw-backwards": "Arrows follow the energy, food to eater.",
        "kek-fw-unseen": "Only what was observed goes in.",
        "kek-fw-no-base": "Every web starts with a producer."
      },
      decoyNotes: {
        "kek-fw-key": "A key helps anyone read the web. Keep it."
      },
      title: "Spot the problems in a classmate's food web",
      cue: "Look at the draft food web and mark each problem.",
      why: "Food webs go wrong in a few ways: an arrow pointing the wrong way, an animal the camera never showed and a missing producer at the base. Spotting them in someone else's web helps you check that your own tells the truth about the transect."
    },
    {
      id: "follow-the-diver-along-the-line",
      kind: "track",
      target: "kek-track-meter",
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
        label: "PACE"
      },
      title: "Follow the diver along the line",
      cue: "Keep the survey marker on the diver as they move along the transect.",
      why: "The diver moves steadily along the tape, and the count keeps pace with them. Following at their speed, not racing ahead to the interesting bits, is what makes every stretch of the line get the same attention.",
      holdBreakNote: "The marker lost the diver. Find them again on the screen and keep pace."
    },
    {
      id: "record-the-count-and-the-web",
      kind: "select",
      target: "kek-survey-log",
      doneLine: "Count and web recorded",
      title: "Record the count and the web",
      cue: "Write each kind seen, how many, the visibility and your food web.",
      why: "A written survey can be compared with next season's, and only then can anyone say whether the forest is changing. Recording visibility with the count, and the web with its evidence, lets another scientist trust and reuse your work."
    },
    {
      id: "hand-the-record-to-the-scientist",
      kind: "select",
      target: "kek-share-board",
      doneLine: "Record handed over",
      title: "Hand the record to the scientist",
      cue: "Give your record to the marine scientist for the season's log.",
      why: "A class record that joins the scientist's own adds another pair of eyes to the survey. Handing it over, complete and labelled, is how citizen science works: careful observation by many people building a picture no one person could."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kek-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the trip",
      cue: "What did the camera show you that surprised you? What would you look for next time?",
      why: "Ending the trip with a check-in lets every learner name what they noticed, which is where curiosity for the next survey comes from. It is not marked, and anyone who felt uneasy on the boat can say so to the teacher or a trusted adult."
    }
  ],

  interrupts: [
    {
      id: "the-dive-flag-goes-up",
      kind: "Dive signal",
      after: "hold-the-screen-view-steady-on",
      delay: 3,
      seconds: 12,
      target: "kek-stay-seated",
      alert: "The tender crew raises a hand and calls that the divers are coming up.",
      cue: "Sit down in your place and keep clear of the side while the divers surface.",
      why: "When divers surface, the crew needs the side clear to help them aboard. Sitting down and keeping out of the way lets the crew do that quickly and safely; crowding to watch is how a busy deck becomes a dangerous one.",
      missNote: "Learners crowded the side, and the crew had to stop and move everyone back.",
      wrongNote: "That keeps you in the crew's way. Sit down and keep clear. Choose the response that deals with it now."
    },
    {
      id: "the-scientist-asks-which-way",
      kind: "Scientist question",
      after: "follow-the-diver-along-the-line",
      delay: 3,
      seconds: 12,
      target: "kek-say-arrow",
      alert: "The marine scientist points at your web and asks which way the arrow between kelp and urchin should go.",
      cue: "Say it points from the kelp to the urchin, because energy goes to the eater.",
      why: "The scientist is checking you understand what the arrow means. Saying it follows the energy, food to eater, shows you can read and draw any food web, not just this one.",
      missNote: "You said from the urchin to the kelp, and the scientist had to explain the arrow again.",
      wrongNote: "That points the wrong way. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x4fb88a;
    const CSS = "#4fb88a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#5f7470", base2: "#546864", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#d6e4e0", base2: "#c6d6d2", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "kek-producer", "the kelp fronds reaching for the light", {});
    bead(-1.42, 1.18, -0.62, "kek-consumer", "an urchin grazing on the holdfast", {});
    bead(-1.03, 1.46, -0.71, "kek-decomposer", "a crab picking over drift on the seabed", {});
    bead(-1.08, 0.9, -1.11, "kek-tape-line", "the yellow transect tape", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kek-ord-follow", "1 · follow the transect line", {});
    bead(-0.58, 1.46, -1.44, "kek-ord-identify", "2 · identify each living thing", {});
    bead(-0.24, 0.9, -1.23, "kek-ord-record", "3 · record it straight away", {});
    bead(0, 1.18, -1.55, "kek-ord-web", "4 · build the food web from the record", {});
    bead(0.24, 1.46, -1.23, "kek-hold-view", "Camera held on the line", {});
    bead(0.58, 0.9, -1.44, "kek-fw-backwards", "an arrow pointing from eater to food", {});
    bead(0.68, 1.18, -1.05, "kek-fw-unseen", "an animal the camera never showed", {});
    bead(1.08, 1.46, -1.11, "kek-fw-no-base", "no producer at the base", {});
    bead(1.03, 0.9, -0.71, "kek-fw-key", "a key explaining the arrows", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kek-stay-seated", "Sit down and keep clear of the side", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kek-say-arrow", "Say which way the arrow points", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kek-lifejacket-card", "Lifejacket on, inside the rail", "LIFEJACKET\nON", { ry: 1.2 });
    dials["kek-arrow-dial"] = dial(-1.89, -1.4, 0.93, "kek-arrow-dial", "Food-web arrow");
    meters["kek-vis-meter"] = meter(-1.45, -1.85, 0.67, "kek-vis-meter", "Visibility");
    tokens["kek-star-token"] = token(-0.92, -2.16, 0.4, "kek-star-token", "Sea star card");
    spots["kek-star-spot"] = spot(-0.31, -2.33, 0.13, "kek-star-spot", "Eats the urchin");
    card(0.31, 1.35, -2.33, "kek-compare-card", "Follow the chain", "NO\nPREDATOR?", { ry: -0.13 });
    meters["kek-track-meter"] = meter(0.92, -2.16, -0.4, "kek-track-meter", "Diver followed");
    boards["kek-survey-log"] = board(1.45, -1.85, -0.67, "kek-survey-log", "Survey record");
    boards["kek-share-board"] = board(1.89, -1.4, -0.93, "kek-share-board", "Hand to the scientist");
    boards["kek-checkin"] = board(2.19, -0.85, -1.2, "kek-checkin", "End-of-trip check-in");
    hazardCard(-1.53, 0.72, -1.21, "arrows-point-to-the-eater", "Draw the arrow from the eater to what it eats?", "ARROW\nBACKWARDS", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "remove-one-changes-nothing", "Say removing one animal changes nothing?", "NOTHING\nCHANGES", 0.3);
    hazardCard(0.58, 0.72, -1.86, "lean-over-the-gunwale", "Lean over the side to see the divers' bubbles?", "LEAN\nOVER", -0.3);
    hazardCard(1.53, 0.72, -1.21, "count-what-you-expect", "Add animals you expect to be there but did not see?", "EXPECTED\nNOT SEEN", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Energy flows from food to eater."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Science teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Marine scientist", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Tender crew", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-dive-flag-goes-up"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-dive-flag-goes-up"].visible = false;
    arrivals["the-scientist-asks-which-way"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-scientist-asks-which-way"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-sea-star-in-the") { const s = spots["kek-star-spot"]; tokens["kek-star-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-count-and-the-web") repaint(boards["kek-survey-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Count and web recorded"], "#59c97b"));
        if (step.id === "hand-the-record-to-the-scientist") repaint(boards["kek-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Record handed over"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kek-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-happens-if-the-urchins") paintGuide("Lose the predator, lose the kelp.");
      },

      onHazard() {
        paintGuide("Stop. Is it what the camera showed, arrows food to eater?");
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
        if (it.id === "the-dive-flag-goes-up") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Learners seated, side clear, divers aboard. The lesson carries on."); }
        if (it.id === "the-scientist-asks-which-way") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Arrow direction explained. The scientist adds a tick to your web."); }
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
