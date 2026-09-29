import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Too Much of a Good Thing. Lower-secondary science at the Crissy Field Marsh Crew site in San Francisco: how nutrients help plants grow, how too many can feed a bloom of algae that clouds the water, tested with jars of pond water and seen in the crew's water checks, using only what the jars and the lagoon in the scene show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ES_TOO_MUCH_OF_A_GOOD_THING = {
  id: "k12-es-too-much-of-a-good-thing",
  index: "879",
  domain: "Education",
  trade: "Science class with the marsh crew at a lagoon — learner and water quality crew lead",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Too Much of a Good Thing",
  title: simTitle("Too Much of a Good Thing"),
  tagline: "Nutrients feed plants, but too many feed a bloom of algae — test it in jars, then check the water with the crew",
  accent: 0x5aa07a,
  accentCss: "#5aa07a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"balance-keeper","name":"Balance Keeper","note":"Ran a fair jar test on nutrients and algae, explained why too much of a good thing clouds the water and helped the crew take a water reading"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Balance Board",
    currency: "LEAVES",
    ranks: ["Drop","Ripple","Pool","Lagoon","Water Keeper"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-where-the-nutrients-come-from") },
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
    "more-food-is-always-better": "You said more nutrients are always better. Some nutrients help plants grow, but too many feed so much algae that the water turns cloudy and green. Balance is the goal, not the most.",
    "taste-the-water": "You went to taste the water. Water tests use kits and meters, never tasting. Wear gloves when you handle sample jars and wash hands afterwards.",
    "change-two-things": "You added plant food and moved the jar into the sun at the same time. With two changes you cannot tell which one made the algae grow. Keep the light the same and change only the plant food.",
    "lean-over-the-edge": "You leaned over the lagoon edge. Edges can be slippery. The crew fills sample jars with a long-handled sampler from the dock, and visitors stay back from the edge."
  },

  lateNotes: {
    "esu-jar-log": "The jar record is written once the jars have had time — nothing to record yet.",
    "esu-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-where-the-nutrients-come-from",
      kind: "find",
      noHint: true,
      targets: [
        "esu-lawn",
        "esu-pet",
        "esu-leaves"
      ],
      itemNames: {
        "esu-lawn": "a fertilised lawn by the path",
        "esu-pet": "pet waste left on the path",
        "esu-leaves": "piles of rotting leaves"
      },
      itemNotes: {
        "esu-lawn": "Rain washes plant food off it.",
        "esu-pet": "It adds nutrients when it rains.",
        "esu-leaves": "They release nutrients as they rot."
      },
      decoyNotes: {
        "esu-rock": "Nice to sit on, but it adds no nutrients."
      },
      title: "Find where the nutrients come from",
      cue: "Mark the three places nutrients can wash into the lagoon.",
      why: "Nutrients are the food that plants need to grow. Rain can wash them into the water from fertiliser on lawns, from pet waste on paths and from rotting leaves. A little helps water plants, but when a lot arrives at once the algae in the water grow very fast and cloud it."
    },
    {
      id: "put-on-gloves-before-handling-samples",
      kind: "select",
      target: "esu-glove-card",
      title: "Put on gloves before handling samples",
      cue: "Put on gloves before you pick up a sample jar.",
      why: "Water samples are handled with gloves as a habit, even when they look clean. Gloves keep hands clean and stop anything on your hands from getting into the sample. Water quality crews wear them every time they sample, so the class does too."
    },
    {
      id: "put-the-jar-test-in-order",
      kind: "sequence",
      targets: [
        "esu-ord-fill",
        "esu-ord-food",
        "esu-ord-light",
        "esu-ord-compare"
      ],
      itemNames: {
        "esu-ord-fill": "1 · fill both jars with the same pond water",
        "esu-ord-food": "2 · add plant food to one jar only",
        "esu-ord-light": "3 · set both jars in the same light",
        "esu-ord-compare": "4 · wait and compare the colour"
      },
      title: "Put the jar test in order",
      cue: "Fill both jars, add plant food to one, set them in the same light, then wait and compare.",
      why: "A fair test changes only one thing. Both jars get the same pond water and sit in the same light, but only one gets plant food. After a few days, any difference in the green colour belongs to the plant food, because nothing else was different.",
      outOfOrderNote: "Out of order. Fill both jars with the same pond water first."
    },
    {
      id: "hold-the-sampler-steady-at-the",
      kind: "hold",
      target: "esu-sampler-hold",
      seconds: 6,
      title: "Hold the sampler steady at the dock",
      cue: "Hold the long-handled sampler still under the water until it fills.",
      why: "A steady sampler fills with water from one spot, which makes the sample fair. Stirring up the bottom mud would change the reading. Crews hold the sampler still and at the same depth every time, so samples from different days match.",
      holdBreakNote: "The sampler moved and stirred up mud. Hold it still again until it fills."
    },
    {
      id: "set-the-lamp-to-the-same",
      kind: "turn",
      target: "esu-lamp-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "LIGHT"
      },
      title: "Set the lamp to the same brightness",
      cue: "Turn the lamp dial until both jars get the teacher's brightness.",
      why: "Algae need light to grow, so both jars must get the same light. If one jar gets more, it might go greener for that reason alone. Setting the lamp once for both jars keeps light out of the question, so only the plant food changes."
    },
    {
      id: "read-the-colour-of-each-jar",
      kind: "gauge",
      target: "esu-green-meter",
      gauge: {
        label: "GREEN",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not matched yet. Slide the marker to the green that looks like the jar."
      },
      title: "Read the colour of each jar",
      cue: "Commit when the marker matches the jar's colour on the green scale.",
      why: "Matching each jar to a colour scale turns what you see into a reading you can compare. The greener the jar, the more algae have grown. Crews use meters that measure cloudiness to do the same job at the lagoon."
    },
    {
      id: "place-the-sample-jar-in-the",
      kind: "drag",
      target: "esu-sample-jar",
      drag: {
        to: "esu-cool-box",
        radius: 0.45,
        missNote: "Not in the cool box yet. Place the jar inside."
      },
      title: "Place the sample jar in the cool box",
      cue: "Drag the labelled sample jar into the cool box.",
      why: "A water sample can change if it gets warm, because algae keep growing. Putting it straight into the cool box keeps it the same until it is tested. The label tells the lab where and when it was taken."
    },
    {
      id: "say-what-the-jars-showed",
      kind: "select",
      target: "esu-result-card",
      title: "Say what the jars showed",
      cue: "Choose the sentence that says what your two jars showed.",
      why: "Both jars had the same water and light. The jar with plant food turned greener. A good answer says that extra nutrients fed more algae, and it uses your colour readings as the evidence without claiming anything else."
    },
    {
      id: "spot-how-people-keep-nutrients-out",
      kind: "find",
      noHint: true,
      targets: [
        "esu-buffer",
        "esu-bin",
        "esu-sign"
      ],
      itemNames: {
        "esu-buffer": "a strip of plants at the edge",
        "esu-bin": "a pet waste bin",
        "esu-sign": "a sign asking people not to feed birds"
      },
      itemNotes: {
        "esu-buffer": "It catches runoff before the water.",
        "esu-bin": "It keeps waste off the path.",
        "esu-sign": "Leftover bread adds nutrients."
      },
      decoyNotes: {
        "esu-bench": "Nice for resting, but it does not keep nutrients out."
      },
      title: "Spot how people keep nutrients out",
      cue: "Look around the lagoon and mark each thing that keeps extra nutrients out.",
      why: "Keeping nutrients in balance starts on land. A strip of plants along the edge catches runoff, a pet waste bin keeps waste off the path, and a sign asks people not to feed the birds. Each one keeps a little extra food out of the water."
    },
    {
      id: "follow-runoff-from-the-lawn-to",
      kind: "track",
      target: "esu-runoff-track",
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
        label: "FLOW"
      },
      title: "Follow runoff from the lawn to the lagoon",
      cue: "Keep the marker on the runoff as it flows from the lawn into the water.",
      why: "Following runoff shows how nutrients travel. Rain picks up plant food from the lawn, runs across the path and reaches the lagoon. Seeing the path helps explain why what people do on land changes the water.",
      holdBreakNote: "The marker lost the runoff. Find it on the lawn and follow it again."
    },
    {
      id: "record-both-jars-side-by-side",
      kind: "select",
      target: "esu-jar-log",
      doneLine: "Both jars recorded",
      title: "Record both jars side by side",
      cue: "Write the colour reading for the plain jar and the plant food jar.",
      why: "Two columns make the difference clear and easy to check. Anyone reading your table can see what changed and what stayed the same. Water crews keep records like this to see whether the water is getting clearer over time."
    },
    {
      id: "share-one-way-to-keep-the",
      kind: "select",
      target: "esu-share-board",
      doneLine: "Idea shared",
      title: "Share one way to keep the balance",
      cue: "Tell another group one thing people can do to keep extra nutrients out.",
      why: "Everyone who lives near water can help keep the balance. Sharing ideas like picking up pet waste or using less lawn fertiliser spreads good habits. Crews say small changes by many people add up to clearer water."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "esu-checkin",
      doneLine: "Checked in",
      title: "Check in before leaving the dock",
      cue: "Why can too many nutrients be a problem? What is one way to keep the balance?",
      why: "The crew goes over the day's samples before leaving the dock. Each learner explains what too many nutrients do and one way to help. If anyone thinks more is always better, the group sorts it out now."
    }
  ],

  interrupts: [
    {
      id: "a-wet-plank-on-the-dock",
      kind: "Wet dock",
      after: "hold-the-sampler-steady-at-the",
      delay: 3,
      seconds: 12,
      target: "esu-step-round",
      alert: "A splash leaves a slippery wet plank on the dock.",
      cue: "Step round the wet plank and tell the crew lead.",
      why: "Wet planks are slippery. Stepping round and telling the crew lead lets them put down a mat or a sign. Crews deal with small slips before they become big ones.",
      missNote: "The class walked straight over the wet plank, and the crew lead had to stop everyone to put a mat down.",
      wrongNote: "That walks you onto the slippery plank. Step round it. Choose the response that deals with it now."
    },
    {
      id: "the-crew-lead-asks-about-the-control-jar",
      kind: "Crew question",
      after: "follow-runoff-from-the-lawn-to",
      delay: 3,
      seconds: 12,
      target: "esu-name-control",
      alert: "The crew lead asks which jar you are comparing the plant food jar against.",
      cue: "Say the plain jar is the control, with the same water and light and no plant food.",
      why: "Naming the control shows the test is fair. Without it, a green jar means nothing. Crews compare water from different places in the same careful way.",
      missNote: "You could not name the control, and the crew lead had to explain before the class could go on.",
      wrongNote: "That does not name the control jar. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x5aa07a;
    const CSS = "#5aa07a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#5e6660", base2: "#525a54", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dee8e2", base2: "#cadcd2", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // a lab bench behind the station, a fume cabinet, a reagent rack and an eyewash post
    const back = group(g, 0, 0, -4.7);
    box(back, 6.4, 2.6, 0.12, 0, 1.3, 0, 0xe0dccf, { rough: 0.7 }).material = wallMat;
    const bench = group(g, 0, 0, -4.1);
    box(bench, 4.6, 0.9, 0.7, 0, 0.45, 0, 0x2b2f35, { rough: 0.6 });
    box(bench, 4.7, 0.05, 0.75, 0, 0.92, 0, 0x1a2a30, { rough: 0.3 });
    box(bench, 0.5, 0.02, 0.4, -1.4, 0.94, 0, 0x8aa0a8, { rough: 0.3, metal: 0.5 });
    cyl(bench, 0.02, 0.02, 0.3, -1.4, 1.1, -0.15, 0x8aa0a8, { rough: 0.3, metal: 0.7, seg: 8 });
    for (let i = 0; i < 6; i++) cyl(bench, 0.05, 0.05, 0.22 + (i % 3) * 0.06, -0.4 + i * 0.28, 1.06, -0.15, [0x7fc4d8, 0xf2c14b, 0xa0e0a0][i % 3], { rough: 0.2, seg: 10 });
    const hood = group(g, 2.9, 0, -4.2);
    box(hood, 1.2, 0.9, 0.8, 0, 0.45, 0, 0xd8d4cc, { rough: 0.6 });
    box(hood, 1.2, 1.3, 0.8, 0, 1.55, 0, 0xc8d8dc, { rough: 0.2, metal: 0.1 });
    box(hood, 1.1, 0.04, 0.7, 0, 0.92, 0, 0x1a2a30, { rough: 0.3 });
    const rack = group(g, -2.9, 0, -4.3);
    box(rack, 1.0, 1.8, 0.34, 0, 0.9, 0, 0x8a8f96, { rough: 0.5, metal: 0.4 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) cyl(rack, 0.06, 0.06, 0.24, -0.33 + c * 0.22, 0.32 + r * 0.55, 0.06, [0xd86a4a, 0x4a8ad8, 0xd8c04a, 0x5ab87a][(r + c) % 4], { rough: 0.3, seg: 10 });
    const wash = group(g, 3.6, 0, -2.8);
    cyl(wash, 0.03, 0.03, 1.1, 0, 0.55, 0, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 8 });
    box(wash, 0.3, 0.1, 0.3, 0, 1.12, 0, 0x59c97b, { rough: 0.5 });
    for (const bx of [-0.08, 0.08]) cyl(wash, 0.03, 0.03, 0.08, bx, 1.2, 0, 0x8aa0a8, { rough: 0.3, metal: 0.7, seg: 8 });

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "esu-lawn", "a fertilised lawn by the path", {});
    bead(-1.42, 1.18, -0.62, "esu-pet", "pet waste left on the path", {});
    bead(-1.03, 1.46, -0.71, "esu-leaves", "piles of rotting leaves", {});
    bead(-1.08, 0.9, -1.11, "esu-rock", "a big rock by the water", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "esu-ord-fill", "1 · fill both jars with the same pond water", {});
    bead(-0.58, 1.46, -1.44, "esu-ord-food", "2 · add plant food to one jar only", {});
    bead(-0.24, 0.9, -1.23, "esu-ord-light", "3 · set both jars in the same light", {});
    bead(0, 1.18, -1.55, "esu-ord-compare", "4 · wait and compare the colour", {});
    bead(0.24, 1.46, -1.23, "esu-sampler-hold", "Hold the sampler", {});
    bead(0.58, 0.9, -1.44, "esu-buffer", "a strip of plants at the edge", {});
    bead(0.68, 1.18, -1.05, "esu-bin", "a pet waste bin", {});
    bead(1.08, 1.46, -1.11, "esu-sign", "a sign asking people not to feed birds", {});
    bead(1.03, 0.9, -0.71, "esu-bench", "a bench facing the water", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "esu-step-round", "Step round the wet plank", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "esu-name-control", "Say which jar was the control", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "esu-glove-card", "Gloves on", "GLOVES\nON", { ry: 1.2 });
    dials["esu-lamp-dial"] = dial(-1.89, -1.4, 0.93, "esu-lamp-dial", "Lamp brightness");
    meters["esu-green-meter"] = meter(-1.45, -1.85, 0.67, "esu-green-meter", "Jar colour");
    tokens["esu-sample-jar"] = token(-0.92, -2.16, 0.4, "esu-sample-jar", "Sample jar");
    spots["esu-cool-box"] = spot(-0.31, -2.33, 0.13, "esu-cool-box", "The cool box");
    card(0.31, 1.35, -2.33, "esu-result-card", "State the result", "WHICH\nGREENER?", { ry: -0.13 });
    meters["esu-runoff-track"] = meter(0.92, -2.16, -0.4, "esu-runoff-track", "Runoff followed");
    boards["esu-jar-log"] = board(1.45, -1.85, -0.67, "esu-jar-log", "Jar record");
    boards["esu-share-board"] = board(1.89, -1.4, -0.93, "esu-share-board", "Share an idea");
    boards["esu-checkin"] = board(2.19, -0.85, -1.2, "esu-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "more-food-is-always-better", "Say more nutrients are always better?", "ALWAYS\nMORE?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "taste-the-water", "Taste the lagoon water to test it?", "TASTE\nIT", 0.3);
    hazardCard(0.58, 0.72, -1.86, "change-two-things", "Add plant food and move a jar to the window in one go?", "TWO\nCHANGES", -0.3);
    hazardCard(1.53, 0.72, -1.21, "lean-over-the-edge", "Lean over the lagoon edge to fill the jar?", "LEAN\nOVER", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Same water, same light."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Water quality crew lead", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Crew member with sampler", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-wet-plank-on-the-dock"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-wet-plank-on-the-dock"].visible = false;
    arrivals["the-crew-lead-asks-about-the-control-jar"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-crew-lead-asks-about-the-control-jar"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-sample-jar-in-the") { const s = spots["esu-cool-box"]; tokens["esu-sample-jar"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-both-jars-side-by-side") repaint(boards["esu-jar-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Both jars recorded"], "#59c97b"));
        if (step.id === "share-one-way-to-keep-the") repaint(boards["esu-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Idea shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["esu-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-the-jars-showed") paintGuide("Too much food, too much algae.");
      },

      onHazard() {
        paintGuide("Stop. Gloves on, stay back from the edge.");
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
        if (it.id === "a-wet-plank-on-the-dock") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Plank marked, the class stepped round. The lesson carries on."); }
        if (it.id === "the-crew-lead-asks-about-the-control-jar") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Control named. The lesson carries on."); }
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
