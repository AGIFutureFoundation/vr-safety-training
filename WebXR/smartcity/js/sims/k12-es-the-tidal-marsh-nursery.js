import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — The Tidal Marsh Nursery. Upper-primary science at Heron's Head Wetland Restoration in San Francisco: why a tidal marsh is a nursery where young fish and birds start life, with sheltered channels, food and hiding places observed from the boardwalk and a model channel, using only what the marsh and the model in the scene show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ES_THE_TIDAL_MARSH_NURSERY = {
  id: "k12-es-the-tidal-marsh-nursery",
  index: "874",
  domain: "Education",
  trade: "Science walk with the wetland restoration crew at a tidal marsh — learner and restoration crew lead",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "The Tidal Marsh Nursery",
  title: simTitle("The Tidal Marsh Nursery"),
  tagline: "Shallow channels, food and hiding places make the marsh a nursery — look closely, then help the crew",
  accent: 0x7aa060,
  accentCss: "#7aa060",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"nursery-watcher","name":"Nursery Watcher","note":"Found what makes a marsh a safe nursery, watched young fish in a model channel and helped the crew keep the boardwalk quiet"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Nursery Board",
    currency: "SPROUTS",
    ranks: ["Egg","Hatchling","Fledgling","Swimmer","Marsh Friend"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-makes-the-marsh-a") },
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
    "marsh-is-just-mud": "You said the marsh is just mud. The mud and channels are full of small life: tiny crabs, worms and young fish. That food and shelter is why fish and birds raise their young here.",
    "leave-the-boardwalk": "You stepped off the boardwalk. Marsh mud is soft and can hold a boot fast, and feet crush nests and young plants. The boardwalk is there so people can watch without harming the nursery.",
    "chase-the-birds": "You ran towards the birds. Parent birds leave their nests when people rush close, and the eggs get cold. Move slowly, stay on the boardwalk and use the binoculars to see them up close.",
    "catch-a-fish": "You reached to scoop a young fish. Young fish are small and easily hurt. Watch them in the model channel or through the viewer, and leave the marsh's fish in the water."
  },

  lateNotes: {
    "esn-marsh-log": "The marsh record is written once you have seen each place — nothing to record yet.",
    "esn-checkin": "The check-in comes at the very end of the walk."
  },

  steps: [
    {
      id: "find-what-makes-the-marsh-a",
      kind: "find",
      noHint: true,
      targets: [
        "esn-channel",
        "esn-grass",
        "esn-mud"
      ],
      itemNames: {
        "esn-channel": "the shallow winding channel",
        "esn-grass": "the tall marsh grass",
        "esn-mud": "the mud full of tiny animals"
      },
      itemNotes: {
        "esn-channel": "Big hunting fish cannot follow.",
        "esn-grass": "Young birds and fish hide here.",
        "esn-mud": "Plenty of food for the young."
      },
      decoyNotes: {
        "esn-bench": "A good place to rest, but not part of the nursery."
      },
      title: "Find what makes the marsh a nursery",
      cue: "Mark the three things that help young fish and birds grow up here.",
      why: "A nursery is a safe place for young animals to grow. In a tidal marsh, shallow channels keep out big fish that hunt, tall grass gives hiding places, and the mud is full of tiny animals to eat. Food, shelter and calm water together make the marsh a place where young life can start."
    },
    {
      id: "move-quietly-onto-the-boardwalk",
      kind: "select",
      target: "esn-quiet-card",
      title: "Move quietly onto the boardwalk",
      cue: "Walk slowly and quietly onto the boardwalk with the crew lead.",
      why: "Birds nesting in the marsh notice noise and quick movement. Walking slowly and talking quietly lets you watch without making parent birds leave their nests. The restoration crew works the same way, calmly and gently, so the nursery stays a calm place."
    },
    {
      id: "put-the-tides-visit-in-order",
      kind: "sequence",
      targets: [
        "esn-ord-rise",
        "esn-ord-fish",
        "esn-ord-fall",
        "esn-ord-birds"
      ],
      itemNames: {
        "esn-ord-rise": "1 · the tide rises into the channels",
        "esn-ord-fish": "2 · young fish swim in to feed and hide",
        "esn-ord-fall": "3 · the tide falls and the channels drain",
        "esn-ord-birds": "4 · birds feed on the open mud"
      },
      title: "Put the tide's visit in order",
      cue: "Put the steps of the tide coming into the marsh and going out in order.",
      why: "Twice a day the tide rises and falls. As it rises, water fills the channels and brings in young fish and food. As it falls, the channels drain and the mud is left for birds to feed on. Knowing this order explains why the marsh is busy at every stage of the tide.",
      outOfOrderNote: "Out of order. Start with the tide rising into the channels."
    },
    {
      id: "hold-the-viewer-still-over-the",
      kind: "hold",
      target: "esn-viewer-hold",
      seconds: 6,
      title: "Hold the viewer still over the channel",
      cue: "Hold the underwater viewer still until the young fish come back.",
      why: "Young fish dart away from movement and come back when all is calm. Holding the viewer still for a while lets them return so you can see them. Patience is a big part of watching wildlife, and the crew counts fish in exactly this careful way.",
      holdBreakNote: "The viewer moved and the fish darted off. Hold it still again and wait."
    },
    {
      id: "focus-the-binoculars",
      kind: "turn",
      target: "esn-focus-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "FOCUS"
      },
      title: "Focus the binoculars",
      cue: "Turn the focus wheel until the nest across the channel is sharp.",
      why: "Binoculars let you see small things from far away, so you do not need to go closer. A sharp picture helps you notice details, like how the nest is hidden in the grass. Good watching from a distance is how scientists study animals without disturbing them."
    },
    {
      id: "read-the-water-level-in-the",
      kind: "gauge",
      target: "esn-tide-meter",
      gauge: {
        label: "TIDE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the water line. Read where the water meets the post."
      },
      title: "Read the water level in the model channel",
      cue: "Commit when the marker sits at the water line on the channel post.",
      why: "The model channel shows the tide rising and falling. Reading the water line on the post shows how deep the channel is right now. Shallow water is the key to the nursery, because it keeps the big hunters out while the small fish stay safe."
    },
    {
      id: "place-the-grass-clump-in-the",
      kind: "drag",
      target: "esn-grass-clump",
      drag: {
        to: "esn-edge-spot",
        radius: 0.45,
        missNote: "Not on the bare edge yet. Place it where the channel has no grass."
      },
      title: "Place the grass clump in the model marsh",
      cue: "Drag the model grass clump to the bare edge of the channel.",
      why: "The restoration crew plants grass along bare channel edges so young fish have more hiding places. Putting the model clump on the bare edge shows how each new plant adds shelter. A marsh with more grass along its channels can shelter more young animals."
    },
    {
      id: "say-why-the-marsh-is-a",
      kind: "select",
      target: "esn-result-card",
      title: "Say why the marsh is a nursery",
      cue: "Choose the sentence that says why young animals start life here.",
      why: "You saw food in the mud, hiding places in the grass and shallow water that keeps big hunters away. A good answer puts those together: the marsh is a nursery because it gives young animals food and shelter. It says what you saw and nothing more."
    },
    {
      id: "spot-the-young-animals-in-the",
      kind: "find",
      noHint: true,
      targets: [
        "esn-ducklings",
        "esn-fry",
        "esn-nest"
      ],
      itemNames: {
        "esn-ducklings": "ducklings following a parent",
        "esn-fry": "tiny fish in the channel",
        "esn-nest": "a nest tucked in the grass"
      },
      itemNotes: {
        "esn-ducklings": "Young birds learning to feed.",
        "esn-fry": "Young fish growing in calm water.",
        "esn-nest": "Eggs kept warm and hidden."
      },
      decoyNotes: {
        "esn-gull": "A lovely bird, but a grown-up, not a young one."
      },
      title: "Spot the young animals in the marsh",
      cue: "Look from the boardwalk and mark each young animal you can see.",
      why: "Spotting young animals is proof that the nursery is working. A line of ducklings behind a parent, tiny fish in a channel and a nest tucked in the grass all show that the marsh is doing its job. Crews use sightings like these to know a restored marsh is healthy."
    },
    {
      id: "follow-a-young-fish-along-the",
      kind: "track",
      target: "esn-fish-track",
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
        label: "FOLLOW"
      },
      title: "Follow a young fish along the channel",
      cue: "Keep the marker on one young fish as it swims into the grass.",
      why: "Following one fish shows how it uses the marsh. It swims along the shallow channel, then slips into the grass when something moves. Watching that shows you exactly why the grass edges matter so much to the nursery.",
      holdBreakNote: "The marker lost the fish. Find it again and follow it into the grass."
    },
    {
      id: "record-what-you-saw-at-each",
      kind: "select",
      target: "esn-marsh-log",
      doneLine: "Marsh recorded",
      title: "Record what you saw at each place",
      cue: "Write one line for the channel, the grass and the mud.",
      why: "A short note for each place shows how the parts of the marsh work together. Anyone reading your notes can see where the young animals were and why. The crew keeps records the same way, so they can compare the marsh from year to year."
    },
    {
      id: "compare-sightings-with-another-group",
      kind: "select",
      target: "esn-share-board",
      doneLine: "Sightings compared",
      title: "Compare sightings with another group",
      cue: "Put your notes next to another group's and look for the same animals.",
      why: "Two groups watching the same marsh may see different things. Comparing notes gives a fuller picture of the nursery. Scientists share sightings in the same way, because many careful watchers see more than one."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "esn-checkin",
      doneLine: "Checked in",
      title: "Check in before leaving the boardwalk",
      cue: "Why is the marsh a nursery? What is one way people keep it calm?",
      why: "The crew talks about the day before leaving, and the class does the same. Each learner says one reason the marsh is a nursery and one way visitors help. If anyone thinks the marsh is just empty mud, the group sorts it out now."
    }
  ],

  interrupts: [
    {
      id: "a-flock-lifts-off-the-mud",
      kind: "Birds lifting",
      after: "hold-the-viewer-still-over-the",
      delay: 3,
      seconds: 12,
      target: "esn-freeze",
      alert: "A flock of birds lifts off the mud near the boardwalk.",
      cue: "Stop still, stay quiet and let the birds settle again.",
      why: "Birds lift when something startles them. Standing still and quiet shows them there is no danger, so they land again and keep feeding. The crew pauses its work the same way when birds are close.",
      missNote: "The class kept moving and talking, and the flock flew off to the far side of the marsh.",
      wrongNote: "That keeps the birds startled. Stop still and stay quiet. Choose the response that deals with it now."
    },
    {
      id: "the-crew-lead-asks-about-the-grass",
      kind: "Crew question",
      after: "follow-a-young-fish-along-the",
      delay: 3,
      seconds: 12,
      target: "esn-name-grass",
      alert: "The crew lead asks why they plant grass along the channel edges.",
      cue: "Say the grass gives young fish and birds places to hide.",
      why: "Knowing why the grass matters shows you understand the nursery. Every clump along a channel is another hiding place. That is why the crew plants the edges first when it restores a marsh.",
      missNote: "You could not say why the grass matters, and the crew lead had to explain before the class could go on.",
      wrongNote: "That does not explain the grass. Say what young animals use it for. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x7aa060;
    const CSS = "#7aa060";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6a6652", base2: "#5e5a48", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e2e6d2", base2: "#d0d8bc", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // a working boat's deck: a rail along the stern, a wheelhouse, coiled lines and a life ring
    void wallMat;
    const rail = group(g, 0, 0, -4.6);
    for (let i = 0; i < 9; i++) cyl(rail, 0.025, 0.025, 1.0, -3.2 + i * 0.8, 0.5, 0, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 8 });
    box(rail, 6.6, 0.05, 0.05, 0, 1.0, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    box(rail, 6.6, 0.03, 0.03, 0, 0.55, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    const house = group(g, -2.6, 0, -3.9);
    box(house, 1.8, 2.1, 1.2, 0, 1.05, 0, 0xf4f0e6, { rough: 0.7 });
    box(house, 1.5, 0.6, 0.04, 0, 1.5, 0.61, 0x2a3a4a, { rough: 0.3, metal: 0.2 });
    box(house, 1.9, 0.08, 1.3, 0, 2.14, 0, 0xd8a54a, { rough: 0.6 });
    for (const [cx0, cz0] of [[2.4, -3.8], [3.0, -3.3]]) for (let i = 0; i < 3; i++) cyl(g, 0.28 - i * 0.03, 0.28 - i * 0.03, 0.05, cx0, 0.03 + i * 0.05, cz0, 0xd8c04a, { rough: 0.9, seg: 14 });
    const ring = group(g, 3.3, 1.2, -4.55);
    cyl(ring, 0.32, 0.32, 0.06, 0, 0, 0, 0xf0645b, { rough: 0.6, seg: 18 }).rotation.x = Math.PI / 2;
    cyl(ring, 0.18, 0.18, 0.08, 0, 0, 0, 0xf4f0e6, { rough: 0.6, seg: 18 }).rotation.x = Math.PI / 2;
    for (const bx of [-3.6, 3.6]) box(g, 0.5, 0.5, 0.5, bx, 0.25, -2.6, 0x6b4a2e, { rough: 0.8 });

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "esn-channel", "the shallow winding channel", {});
    bead(-1.42, 1.18, -0.62, "esn-grass", "the tall marsh grass", {});
    bead(-1.03, 1.46, -0.71, "esn-mud", "the mud full of tiny animals", {});
    bead(-1.08, 0.9, -1.11, "esn-bench", "the boardwalk bench", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "esn-ord-rise", "1 · the tide rises into the channels", {});
    bead(-0.58, 1.46, -1.44, "esn-ord-fish", "2 · young fish swim in to feed and hide", {});
    bead(-0.24, 0.9, -1.23, "esn-ord-fall", "3 · the tide falls and the channels drain", {});
    bead(0, 1.18, -1.55, "esn-ord-birds", "4 · birds feed on the open mud", {});
    bead(0.24, 1.46, -1.23, "esn-viewer-hold", "Hold the viewer", {});
    bead(0.58, 0.9, -1.44, "esn-ducklings", "ducklings following a parent", {});
    bead(0.68, 1.18, -1.05, "esn-fry", "tiny fish in the channel", {});
    bead(1.08, 1.46, -1.11, "esn-nest", "a nest tucked in the grass", {});
    bead(1.03, 0.9, -0.71, "esn-gull", "a grown gull on a post", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "esn-freeze", "Stop still and stay quiet", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "esn-name-grass", "Say why the grass edges matter", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "esn-quiet-card", "Quiet on the boardwalk", "SLOW AND\nQUIET", { ry: 1.2 });
    dials["esn-focus-dial"] = dial(-1.89, -1.4, 0.93, "esn-focus-dial", "Binocular focus");
    meters["esn-tide-meter"] = meter(-1.45, -1.85, 0.67, "esn-tide-meter", "Channel water level");
    tokens["esn-grass-clump"] = token(-0.92, -2.16, 0.4, "esn-grass-clump", "Grass clump");
    spots["esn-edge-spot"] = spot(-0.31, -2.33, 0.13, "esn-edge-spot", "The bare channel edge");
    card(0.31, 1.35, -2.33, "esn-result-card", "State why", "WHY A\nNURSERY?", { ry: -0.13 });
    meters["esn-fish-track"] = meter(0.92, -2.16, -0.4, "esn-fish-track", "Fish followed");
    boards["esn-marsh-log"] = board(1.45, -1.85, -0.67, "esn-marsh-log", "Marsh record");
    boards["esn-share-board"] = board(1.89, -1.4, -0.93, "esn-share-board", "Compare sightings");
    boards["esn-checkin"] = board(2.19, -0.85, -1.2, "esn-checkin", "End-of-walk check-in");
    hazardCard(-1.53, 0.72, -1.21, "marsh-is-just-mud", "Say the marsh is just empty mud?", "JUST\nMUD?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "leave-the-boardwalk", "Step off the boardwalk onto the marsh?", "STEP\nOFF", 0.3);
    hazardCard(0.58, 0.72, -1.86, "chase-the-birds", "Run closer to see the birds?", "RUN\nCLOSER", -0.3);
    hazardCard(1.53, 0.72, -1.21, "catch-a-fish", "Scoop a young fish out of the channel?", "SCOOP\nIT", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Slow and quiet on the boardwalk."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Restoration crew lead", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Crew member with binoculars", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-flock-lifts-off-the-mud"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-flock-lifts-off-the-mud"].visible = false;
    arrivals["the-crew-lead-asks-about-the-grass"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-crew-lead-asks-about-the-grass"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-grass-clump-in-the") { const s = spots["esn-edge-spot"]; tokens["esn-grass-clump"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-what-you-saw-at-each") repaint(boards["esn-marsh-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Marsh recorded"], "#59c97b"));
        if (step.id === "compare-sightings-with-another-group") repaint(boards["esn-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Sightings compared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["esn-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-why-the-marsh-is-a") paintGuide("Food and shelter for the young.");
      },

      onHazard() {
        paintGuide("Stop. Stay on the boardwalk.");
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
        if (it.id === "a-flock-lifts-off-the-mud") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Class still, the flock settled. The lesson carries on."); }
        if (it.id === "the-crew-lead-asks-about-the-grass") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Grass explained. The lesson carries on."); }
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
