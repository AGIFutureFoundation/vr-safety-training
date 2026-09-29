import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — The Bay Food Web. Upper-primary science at the Fort Mason Piers site in San Francisco: how plants, tiny animals, fish, birds and seals in the Bay are linked by who eats what, built as a food web on a board and seen from the pier, using only what the board and the water in the scene show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ES_THE_BAY_FOOD_WEB = {
  id: "k12-es-the-bay-food-web",
  index: "880",
  domain: "Education",
  trade: "Science class with the pier crew and a naturalist at a Bay pier — learner and naturalist",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "The Bay Food Web",
  title: simTitle("The Bay Food Web"),
  tagline: "Tiny plants feed tiny animals, which feed fish, which feed birds and seals — build the web and see the links",
  accent: 0x4a7ab0,
  accentCss: "#4a7ab0",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"web-weaver","name":"Web Weaver","note":"Built a Bay food web with arrows that point the right way, explained what happens when one link changes and spotted the web from the pier"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Web Board",
    currency: "LINKS",
    ranks: ["Strand","Thread","Knot","Net","Web Weaver"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-living-things-in-the") },
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
    "arrow-points-to-the-eater": "You pointed the arrow from the seal to the fish. In a food web the arrow shows where the food energy goes, so it points from the fish to the seal that eats it.",
    "one-animal-does-not-matter": "You said one small animal does not matter. Tiny animals feed many fish, so a change to them reaches the birds and seals too. Every link holds the web together.",
    "lean-over-the-rail": "You leaned over the pier rail. Stay behind the rail and use the viewer on the deck. The pier crew keeps everyone behind the rail at all times.",
    "feed-the-gulls": "You threw a snack to the gulls. Human food is not part of the Bay food web and is not good for birds. Watch the gulls find their own food instead."
  },

  lateNotes: {
    "esf-link-log": "The links record is written after you watch the water — nothing to record yet.",
    "esf-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-the-living-things-in-the",
      kind: "find",
      noHint: true,
      targets: [
        "esf-plankton",
        "esf-fish",
        "esf-pelican"
      ],
      itemNames: {
        "esf-plankton": "the green tint of tiny floating plants",
        "esf-fish": "a school of small fish",
        "esf-pelican": "a pelican diving"
      },
      itemNotes: {
        "esf-plankton": "They make food from sunlight.",
        "esf-fish": "They eat tiny animals.",
        "esf-pelican": "It eats the small fish."
      },
      decoyNotes: {
        "esf-buoy": "It marks the water, but it is not alive."
      },
      title: "Find the living things in the Bay",
      cue: "Mark the three living things you can see from the pier.",
      why: "A food web starts with living things. Tiny floating plants make food from sunlight, small fish eat the tiny animals that eat those plants, and birds and seals eat the fish. Seeing each one from the pier helps you notice that they all live in the same water and depend on each other."
    },
    {
      id: "stay-behind-the-pier-rail",
      kind: "select",
      target: "esf-rail-card",
      title: "Stay behind the pier rail",
      cue: "Stand behind the rail on the pier deck with the naturalist.",
      why: "The pier is a great place to watch the Bay, and the rail is there to keep everyone safely on the deck. Standing behind it lets you see the water without leaning out. The pier crew and the naturalist keep every group behind the rail."
    },
    {
      id: "put-one-food-chain-in-order",
      kind: "sequence",
      targets: [
        "esf-ord-plants",
        "esf-ord-animals",
        "esf-ord-fish",
        "esf-ord-seal"
      ],
      itemNames: {
        "esf-ord-plants": "1 · tiny floating plants",
        "esf-ord-animals": "2 · tiny floating animals",
        "esf-ord-fish": "3 · small fish",
        "esf-ord-seal": "4 · a harbour seal"
      },
      title: "Put one food chain in order",
      cue: "Put the tiny plants, tiny animals, small fish and seal in order of who eats whom.",
      why: "A food chain shows one path the food energy takes. Tiny plants are eaten by tiny animals, which are eaten by small fish, which are eaten by a seal. Putting them in order shows how energy from the sun reaches a big animal in steps.",
      outOfOrderNote: "Out of order. Start with the tiny plants that make food from sunlight."
    },
    {
      id: "hold-the-viewer-steady-over-the",
      kind: "hold",
      target: "esf-viewer-hold",
      seconds: 6,
      title: "Hold the viewer steady over the water",
      cue: "Hold the pier viewer steady on the school of fish.",
      why: "A steady view lets you watch the fish long enough to see them feed. Moving the viewer around makes it hard to follow them. Naturalists watch patiently in one spot, because the most interesting moments happen when you keep still. Watching for a whole minute often shows more than looking quickly at many places.",
      holdBreakNote: "The viewer drifted off the fish. Hold it steady on the school again."
    },
    {
      id: "say-what-happens-if-the-small",
      kind: "select",
      target: "esf-result-card",
      title: "Say what happens if the small fish go away",
      cue: "Choose the sentence that says what would change if the small fish became fewer.",
      why: "The small fish link the tiny animals to the birds and seals. If there were fewer of them, the birds and seals would have less to eat. A good answer follows the arrows on your web and does not guess beyond them. Thinking through what happens when one link changes is how scientists predict changes in real places."
    },
    {
      id: "spot-the-web-at-work-from",
      kind: "find",
      noHint: true,
      targets: [
        "esf-dive",
        "esf-seal",
        "esf-flash"
      ],
      itemNames: {
        "esf-dive": "a pelican diving for fish",
        "esf-seal": "a seal with a fish",
        "esf-flash": "small fish feeding at the surface"
      },
      itemNotes: {
        "esf-dive": "A fish-to-bird link.",
        "esf-seal": "A fish-to-seal link.",
        "esf-flash": "A tiny-animal-to-fish link."
      },
      decoyNotes: {
        "esf-boat": "A fine sight, but not part of the web."
      },
      title: "Spot the web at work from the pier",
      cue: "Watch the water and mark each moment of feeding you see.",
      why: "The food web is happening in front of you. A pelican dives for fish, a seal pops up with a fish, and small fish flash at the surface as they feed. Spotting these moments shows that the web on the board is a picture of the real Bay."
    },
    {
      id: "turn-the-arrow-to-point-the",
      kind: "turn",
      target: "esf-arrow-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "ARROW"
      },
      title: "Turn the arrow to point the right way",
      cue: "Turn the arrow on the board so it points from the fish to the pelican.",
      why: "Arrows in a food web point the way the food energy moves. The fish is eaten, so its energy goes to the pelican, and the arrow points to the pelican. Getting the arrows right is what turns a picture into a web that explains something."
    },
    {
      id: "count-the-links-for-the-small",
      kind: "gauge",
      target: "esf-link-meter",
      gauge: {
        label: "LINKS",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not matched yet. Count every arrow that touches the fish.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Count the links for the small fish",
      cue: "Commit when the marker shows how many arrows touch the small fish.",
      why: "The small fish has arrows coming in from what it eats and going out to what eats it. Counting them shows how important it is to the web. Animals with many links hold the web together, which is why scientists watch them closely. An animal with lots of links is a bit like a busy crossroads: many paths run through it."
    },
    {
      id: "place-the-seal-card-on-the",
      kind: "drag",
      target: "esf-seal-card",
      drag: {
        to: "esf-top-spot",
        radius: 0.45,
        missNote: "Not at the top yet. Place the seal where nothing eats it."
      },
      title: "Place the seal card on the web",
      cue: "Drag the seal card to its place at the top of the web.",
      why: "The seal eats fish and is not eaten by anything else in this web, so it sits at the top. Placing it there shows how energy flows up to it. Every card in its right place makes the web easier to read. Animals near the top of a web depend on every link below them, so a change lower down reaches them too."
    },
    {
      id: "follow-a-pelican-as-it-hunts",
      kind: "track",
      target: "esf-pelican-track",
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
      title: "Follow a pelican as it hunts",
      cue: "Keep the marker on the pelican as it circles and dives.",
      why: "Following a pelican shows a link in action. It circles, spots the fish from above and dives in. Watching it helps you remember that each arrow on the board is a real animal finding its food. Pelicans, gulls and seals all hunt the same small fish, which is why those fish sit in the middle of so many links.",
      holdBreakNote: "The marker lost the pelican. Find it again and follow it to the dive."
    },
    {
      id: "record-the-links-you-saw",
      kind: "select",
      target: "esf-link-log",
      doneLine: "Links recorded",
      title: "Record the links you saw",
      cue: "Write each feeding link you saw from the pier with an arrow.",
      why: "Writing the links with arrows turns what you saw into a small food web of your own. Anyone reading it can follow the energy from plant to fish to bird. Naturalists record sightings the same way to learn how the Bay changes through the year."
    },
    {
      id: "compare-webs-with-another-group",
      kind: "select",
      target: "esf-share-board",
      doneLine: "Webs compared",
      title: "Compare webs with another group",
      cue: "Put your web next to another group's and look for the same links.",
      why: "Two groups may see different links from the same pier. Comparing webs makes a bigger, fuller picture. Scientists build food webs by putting together many people's observations in exactly this way. Putting many small webs together is how scientists see the whole Bay and not just one corner of it."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "esf-checkin",
      doneLine: "Checked in",
      title: "Check in before leaving the pier",
      cue: "Which way do the arrows point? Why does every link matter?",
      why: "The naturalist checks what each group learned before they leave the pier. Each learner says which way the arrows point and why a small animal matters. If anyone has arrows pointing the wrong way, the group sorts it out now. Getting the arrows right is the key idea, because it shows where the energy from the sun ends up."
    }
  ],

  interrupts: [
    {
      id: "a-boat-docks-at-the-pier",
      kind: "Boat docking",
      after: "hold-the-viewer-steady-over-the",
      delay: 3,
      seconds: 12,
      target: "esf-stand-back",
      alert: "A work boat comes in to dock at the pier's landing.",
      cue: "Stand back from the landing so the crew can tie up.",
      why: "Docking crews need room to throw and tie lines. Standing back from the landing keeps everyone clear of the ropes. The class can watch from the deck once the boat is tied.",
      missNote: "The class stayed by the landing, and the crew had to wait before tying up.",
      wrongNote: "That keeps you by the landing. Stand back. Choose the response that deals with it now."
    },
    {
      id: "the-naturalist-asks-about-the-arrows",
      kind: "Naturalist question",
      after: "follow-a-pelican-as-it-hunts",
      delay: 3,
      seconds: 12,
      target: "esf-name-arrow",
      alert: "The naturalist asks which way the arrow between the fish and the seal points.",
      cue: "Say it points from the fish to the seal, the way the food energy goes.",
      why: "Knowing the arrow direction shows you understand the web. Arrows follow the energy, not the hunter. That rule works for every food web anywhere.",
      missNote: "You could not say which way the arrow points, and the naturalist had to explain before the class could go on.",
      wrongNote: "That points the arrow the wrong way. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x4a7ab0;
    const CSS = "#4a7ab0";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#5a6068", base2: "#4e545c", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dce2ea", base2: "#c8d2de", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "esf-plankton", "the green tint of tiny floating plants", {});
    bead(-1.42, 1.18, -0.62, "esf-fish", "a school of small fish", {});
    bead(-1.03, 1.46, -0.71, "esf-pelican", "a pelican diving", {});
    bead(-1.08, 0.9, -1.11, "esf-buoy", "a red buoy", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "esf-ord-plants", "1 · tiny floating plants", {});
    bead(-0.58, 1.46, -1.44, "esf-ord-animals", "2 · tiny floating animals", {});
    bead(-0.24, 0.9, -1.23, "esf-ord-fish", "3 · small fish", {});
    bead(0, 1.18, -1.55, "esf-ord-seal", "4 · a harbour seal", {});
    bead(0.24, 1.46, -1.23, "esf-viewer-hold", "Hold the viewer", {});
    bead(0.58, 0.9, -1.44, "esf-dive", "a pelican diving for fish", {});
    bead(0.68, 1.18, -1.05, "esf-seal", "a seal with a fish", {});
    bead(1.08, 1.46, -1.11, "esf-flash", "small fish feeding at the surface", {});
    bead(1.03, 0.9, -0.71, "esf-boat", "a sailboat passing", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "esf-stand-back", "Stand back from the landing", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "esf-name-arrow", "Say which way the arrows point", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "esf-rail-card", "Behind the rail", "BEHIND\nTHE RAIL", { ry: 1.2 });
    dials["esf-arrow-dial"] = dial(-1.89, -1.4, 0.93, "esf-arrow-dial", "Arrow direction");
    meters["esf-link-meter"] = meter(-1.45, -1.85, 0.67, "esf-link-meter", "Links on the fish");
    tokens["esf-seal-card"] = token(-0.92, -2.16, 0.4, "esf-seal-card", "Seal card");
    spots["esf-top-spot"] = spot(-0.31, -2.33, 0.13, "esf-top-spot", "The top of the web");
    card(0.31, 1.35, -2.33, "esf-result-card", "Follow the arrows", "WHAT\nCHANGES?", { ry: -0.13 });
    meters["esf-pelican-track"] = meter(0.92, -2.16, -0.4, "esf-pelican-track", "Pelican followed");
    boards["esf-link-log"] = board(1.45, -1.85, -0.67, "esf-link-log", "Links record");
    boards["esf-share-board"] = board(1.89, -1.4, -0.93, "esf-share-board", "Compare webs");
    boards["esf-checkin"] = board(2.19, -0.85, -1.2, "esf-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "arrow-points-to-the-eater", "Point the arrow from the seal to the fish?", "WRONG\nWAY?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "one-animal-does-not-matter", "Say one small animal does not matter to the web?", "DOES NOT\nMATTER?", 0.3);
    hazardCard(0.58, 0.72, -1.86, "lean-over-the-rail", "Lean over the pier rail to see the fish?", "LEAN\nOVER", -0.3);
    hazardCard(1.53, 0.72, -1.21, "feed-the-gulls", "Throw a snack to the gulls?", "FEED\nGULLS", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Arrows follow the food energy."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Naturalist", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Pier crew member", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-boat-docks-at-the-pier"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-boat-docks-at-the-pier"].visible = false;
    arrivals["the-naturalist-asks-about-the-arrows"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-naturalist-asks-about-the-arrows"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-seal-card-on-the") { const s = spots["esf-top-spot"]; tokens["esf-seal-card"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-links-you-saw") repaint(boards["esf-link-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Links recorded"], "#59c97b"));
        if (step.id === "compare-webs-with-another-group") repaint(boards["esf-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Webs compared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["esf-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-happens-if-the-small") paintGuide("Every link matters.");
      },

      onHazard() {
        paintGuide("Stop. Stay behind the rail.");
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
        if (it.id === "a-boat-docks-at-the-pier") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Landing clear, the boat tied up. The lesson carries on."); }
        if (it.id === "the-naturalist-asks-about-the-arrows") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Arrow explained. The lesson carries on."); }
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
