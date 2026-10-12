import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Where the Storm Drain Goes. Upper-primary science at the Marina Seawall and Storm Drain Crew site in San Francisco: how rain on a street runs to a drain and from the drain to the Bay, traced on a street model and on the crew's drain map, using only what the model and the street in the scene show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ES_WHERE_THE_STORM_DRAIN_GOES = {
  id: "k12-es-where-the-storm-drain-goes",
  index: "871",
  domain: "Education",
  trade: "Science walk with the storm drain crew on a street by the Bay — learner and storm drain crew lead",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Where the Storm Drain Goes",
  title: simTitle("Where the Storm Drain Goes"),
  tagline: "Rain on the street runs to the drain, and the drain runs to the Bay — trace it, then keep it clean",
  accent: 0x4f8fb8,
  accentCss: "#4f8fb8",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"drain-tracer","name":"Drain Tracer","note":"Traced rain from a street to the Bay, explained why only rain belongs in a drain and helped the crew mark a drain"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Drain Board",
    currency: "DROPS",
    ranks: ["Drop","Trickle","Stream","Creek","Drain Keeper"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-where-the-rain-goes-on") },
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
    "drain-goes-to-a-cleaner": "You said the storm drain water gets cleaned first. On many streets the storm drain runs straight to a creek or the Bay. What goes down the drain is what the fish and birds get, so only rain belongs in it.",
    "pour-it-in-the-drain": "You poured soapy water into the storm drain. Soap and dirt go with it to the Bay. The crew tips wash water onto grass or into a sink, so the drain carries only rain.",
    "lift-the-grate": "You reached for the drain grate. Grates are heavy and the drain below is a space only trained crew enter. Look through the grate from the kerb, and let the crew open it with the right tools.",
    "step-into-the-street": "You stepped off the kerb to follow the water. Cars use the street. Follow the water with your eyes from the sidewalk, and the crew sets cones before anyone works in the gutter."
  },

  lateNotes: {
    "esd-drain-log": "The trip record is written once the water has reached the Bay jar — nothing to record yet.",
    "esd-checkin": "The check-in comes at the very end of the walk."
  },

  steps: [
    {
      id: "find-where-the-rain-goes-on",
      kind: "find",
      noHint: true,
      targets: [
        "esd-roof",
        "esd-gutter",
        "esd-inlet"
      ],
      itemNames: {
        "esd-roof": "the roof and its downspout",
        "esd-gutter": "the gutter by the kerb",
        "esd-inlet": "the storm drain grate"
      },
      itemNotes: {
        "esd-roof": "Rain runs off the roof and down the pipe.",
        "esd-gutter": "The gutter carries water along the street.",
        "esd-inlet": "The drain takes the water under the street."
      },
      decoyNotes: {
        "esd-bench": "A good place to sit, but water does not run through it."
      },
      title: "Find where the rain goes on the street",
      cue: "Mark the three places the rain runs on its way to the drain.",
      why: "Rain that lands on a roof, a sidewalk or a road cannot soak in, so it runs downhill. It runs off the roof into a downspout, across the sidewalk into the gutter, and along the gutter to the drain. Seeing each part shows that a whole street is one big path for water."
    },
    {
      id: "stay-on-the-sidewalk-with-the",
      kind: "select",
      target: "esd-cone-card",
      title: "Stay on the sidewalk with the crew",
      cue: "Stand behind the cones on the sidewalk before the crew lead starts.",
      why: "The street is for cars and the crew's truck. Standing on the sidewalk behind the cones keeps the whole class out of the way of traffic. The crew does the same every time, and only steps into the gutter once cones and a sign warn drivers to slow down."
    },
    {
      id: "put-the-waters-trip-in-order",
      kind: "sequence",
      targets: [
        "esd-ord-roof",
        "esd-ord-gutter",
        "esd-ord-drain",
        "esd-ord-bay"
      ],
      itemNames: {
        "esd-ord-roof": "1 · rain lands on the roof",
        "esd-ord-gutter": "2 · it runs along the gutter",
        "esd-ord-drain": "3 · it drops into the storm drain",
        "esd-ord-bay": "4 · the pipe carries it to the Bay"
      },
      title: "Put the water's trip in order",
      cue: "Put the steps of the rain's trip from the roof to the Bay in order.",
      why: "Water always moves downhill, so its trip has an order. It lands, runs off, joins the gutter, drops into the drain and flows through a pipe to the Bay. Putting the steps in order helps you see that the drain is not the end of the trip, only the middle.",
      outOfOrderNote: "Out of order. Start with the rain landing on the roof."
    },
    {
      id: "hold-the-watering-can-steady-over",
      kind: "hold",
      target: "esd-can-hold",
      seconds: 6,
      title: "Hold the watering can steady over the roof",
      cue: "Hold the watering can over the model roof until the rain stops.",
      why: "A steady rain gives a fair test. If the can shakes or moves, some water misses the roof and the reading changes. Holding it steady over the same spot means the only thing you are watching is where the water goes once it lands.",
      holdBreakNote: "The can moved off the roof. Hold it over the roof again until the rain stops."
    },
    {
      id: "tilt-the-model-street-downhill",
      kind: "turn",
      target: "esd-tilt-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "SLOPE"
      },
      title: "Tilt the model street downhill",
      cue: "Turn the dial to tilt the model street towards the model Bay.",
      why: "A real street is built with a gentle slope so water runs to the drain and does not pool. Tilting the model the same way lets you watch water choose the downhill path every time. The slope is the reason drains sit at the low end of the gutter."
    },
    {
      id: "read-how-much-water-reaches-the",
      kind: "gauge",
      target: "esd-bay-meter",
      gauge: {
        label: "BAY",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the water line. Read where the water meets the jar.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read how much water reaches the model Bay",
      cue: "Commit when the marker sits at the water line in the model Bay jar.",
      why: "Reading the water line tells you how much of the rain ran off the street. Read it at eye level, where the water meets the side of the jar, so a classmate would read the same. It shows that almost all the rain on a hard street ends up in the Bay."
    },
    {
      id: "place-the-leaf-screen-over-the",
      kind: "drag",
      target: "esd-leaf-screen",
      drag: {
        to: "esd-drain-spot",
        radius: 0.45,
        missNote: "Not on the drain yet. Place the screen right over the grate."
      },
      title: "Place the leaf screen over the drain",
      cue: "Drag the model leaf screen onto the model drain.",
      why: "Leaves and litter ride the water to the drain. A screen over the drain catches them before they reach the Bay. Putting it exactly on the drain shows why crews keep grates clear: a blocked grate makes the street pool, and an open one lets litter through."
    },
    {
      id: "say-where-the-drain-water-goes",
      kind: "select",
      target: "esd-result-card",
      title: "Say where the drain water goes",
      cue: "Choose the sentence that says where the storm drain water goes.",
      why: "Your model showed the water leaving the street and reaching the Bay. A good answer says that the storm drain carries rain to the Bay, so what we drop on the street can end up there too. It does not say more than your test and the crew's map showed."
    },
    {
      id: "spot-what-does-not-belong-in",
      kind: "find",
      noHint: true,
      targets: [
        "esd-wrapper",
        "esd-drip",
        "esd-leaves"
      ],
      itemNames: {
        "esd-wrapper": "a snack wrapper by the kerb",
        "esd-drip": "an oil drip under a parked car",
        "esd-leaves": "a heap of leaves at the grate"
      },
      itemNotes: {
        "esd-wrapper": "It will float to the drain.",
        "esd-drip": "Rain will wash it along.",
        "esd-leaves": "It can block the drain."
      },
      decoyNotes: {
        "esd-puddle": "Just rain. That is what the drain is for."
      },
      title: "Spot what does not belong in the gutter",
      cue: "Look along the real gutter and mark each thing that should not reach the Bay.",
      why: "Anything in the gutter can ride the next rain to the Bay. A wrapper, a drip of oil under a car and a pile of leaves are all on their way. Spotting them helps you see how people on a street can keep the Bay clean before it even rains."
    },
    {
      id: "follow-the-drain-line-on-the",
      kind: "track",
      target: "esd-map-track",
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
        label: "PIPE",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Follow the drain line on the crew's map",
      cue: "Keep the marker on the blue drain line from the street to the shore.",
      why: "The crew's map shows pipes you cannot see under the street. Following the line from the drain to the shore shows the path the water takes underground. Crews use maps like this to find each pipe when they clean it or check it after a storm.",
      holdBreakNote: "The marker left the drain line. Find the line again and follow it to the shore."
    },
    {
      id: "record-what-you-saw-at-each",
      kind: "select",
      target: "esd-drain-log",
      doneLine: "Trip recorded",
      title: "Record what you saw at each part",
      cue: "Write one line for the roof, the gutter, the drain and the Bay.",
      why: "A short record for each part of the trip helps you remember the whole path. Anyone reading it can follow the water from the roof to the Bay. It is also how the crew keeps notes, so the next crew knows which drains need a clean."
    },
    {
      id: "share-one-way-to-keep-the",
      kind: "select",
      target: "esd-share-board",
      doneLine: "Idea shared",
      title: "Share one way to keep the drain clean",
      cue: "Tell another group one thing a family can do to keep the drain clean.",
      why: "Many people live on one street, so keeping a drain clean is a team job. Sharing ideas, like putting litter in a bin or washing a car on the grass, spreads good habits. The crew says the drains they clean least are on the streets where neighbours help."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "esd-checkin",
      doneLine: "Checked in",
      title: "Check in before the walk ends",
      cue: "Where does the storm drain go? What is one thing that should never go in it?",
      why: "The crew talks over each job before it packs up, so the class does the same. Each learner says where the drain water goes and names one thing that should stay out of it. If anyone thinks the drain water gets cleaned first, the group sorts it out now."
    }
  ],

  interrupts: [
    {
      id: "a-street-sweeper-comes-along",
      kind: "Street sweeper",
      after: "hold-the-watering-can-steady-over",
      delay: 3,
      seconds: 12,
      target: "esd-step-back",
      alert: "A street sweeper rolls along the gutter towards the class.",
      cue: "Step back behind the cones and let the sweeper pass.",
      why: "A sweeper needs the whole gutter. Stepping back behind the cones gives the driver room and keeps everyone clear. The sweeper is also a drain helper: it picks up litter before the rain can carry it away.",
      missNote: "Nobody stepped back, and the sweeper had to stop and wait for the class to clear the gutter.",
      wrongNote: "That leaves you in the sweeper's path. Step back behind the cones. Choose the response that deals with it now."
    },
    {
      id: "the-crew-lead-asks-about-the-slope",
      kind: "Crew question",
      after: "follow-the-drain-line-on-the",
      delay: 3,
      seconds: 12,
      target: "esd-name-slope",
      alert: "The crew lead asks why the water ran to the drain and not the other way.",
      cue: "Say that the street slopes down to the drain, and water runs downhill.",
      why: "Knowing about the slope shows you understand the whole idea. Water only runs downhill, so builders slope every street towards a drain. The crew checks the slope when a street floods, because a low spot in the wrong place makes a puddle.",
      missNote: "You could not say why the water ran to the drain, and the crew lead had to explain the slope before the class could go on.",
      wrongNote: "That does not explain the slope. Say which way the street tilts. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x4f8fb8;
    const CSS = "#4f8fb8";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#5e6468", base2: "#52585c", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dfe6ea", base2: "#cdd8de", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // outdoors: a low wall to sit on, planters, a notice board on posts and two trees
    void wallMat;
    for (const [bx, bz, ry] of [[-2.8, -3.4, 0.5], [2.8, -3.4, -0.5]]) {
      const b = group(g, bx, 0, bz, ry);
      box(b, 2.2, 0.42, 0.5, 0, 0.21, 0, 0x9a948a, { rough: 0.9 });
      box(b, 2.3, 0.06, 0.56, 0, 0.45, 0, 0xb89a6a, { rough: 0.6 });
    }
    for (const px of [-1.4, 1.4]) {
      const pl = group(g, px, 0, -4.5);
      box(pl, 0.9, 0.5, 0.9, 0, 0.25, 0, 0x6b4a2e, { rough: 0.8 });
      for (let i = 0; i < 5; i++) ball(pl, 0.16, -0.25 + (i % 3) * 0.25, 0.62 + (i % 2) * 0.08, -0.2 + Math.floor(i / 3) * 0.35, [0x5ab87a, 0x4a9a5a, 0x7fc464][i % 3], { rough: 0.9, seg: 8 });
    }
    const notice = group(g, 0, 0, -4.7);
    for (const nx of [-0.9, 0.9]) cyl(notice, 0.05, 0.05, 2.2, nx, 1.1, 0, 0x6b4a2e, { rough: 0.8, seg: 8 });
    box(notice, 2.0, 1.1, 0.06, 0, 1.6, 0, 0x2f4a3a, { rough: 0.9 });
    box(notice, 2.1, 0.12, 0.1, 0, 2.2, 0, 0x6b4a2e, { rough: 0.8 });
    for (const [tx, tz] of [[-3.6, -4.6], [3.6, -4.6]]) {
      cyl(g, 0.12, 0.16, 2.4, tx, 1.2, tz, 0x5a4030, { rough: 0.9, seg: 8 });
      ball(g, 1.1, tx, 2.9, tz, 0x4a8a4a, { rough: 0.9, seg: 10 });
      ball(g, 0.8, tx + 0.5, 3.3, tz + 0.3, 0x5a9a52, { rough: 0.9, seg: 10 });
    }

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "esd-roof", "the roof and its downspout", {});
    bead(-1.42, 1.18, -0.62, "esd-gutter", "the gutter by the kerb", {});
    bead(-1.03, 1.46, -0.71, "esd-inlet", "the storm drain grate", {});
    bead(-1.08, 0.9, -1.11, "esd-bench", "a bus stop bench", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "esd-ord-roof", "1 · rain lands on the roof", {});
    bead(-0.58, 1.46, -1.44, "esd-ord-gutter", "2 · it runs along the gutter", {});
    bead(-0.24, 0.9, -1.23, "esd-ord-drain", "3 · it drops into the storm drain", {});
    bead(0, 1.18, -1.55, "esd-ord-bay", "4 · the pipe carries it to the Bay", {});
    bead(0.24, 1.46, -1.23, "esd-can-hold", "Hold the watering can", {});
    bead(0.58, 0.9, -1.44, "esd-wrapper", "a snack wrapper by the kerb", {});
    bead(0.68, 1.18, -1.05, "esd-drip", "an oil drip under a parked car", {});
    bead(1.08, 1.46, -1.11, "esd-leaves", "a heap of leaves at the grate", {});
    bead(1.03, 0.9, -0.71, "esd-puddle", "a small puddle of clear rain", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "esd-step-back", "Step back behind the cones", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "esd-name-slope", "Say why the water runs to the drain", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "esd-cone-card", "Behind the cones", "SIDEWALK\nFIRST", { ry: 1.2 });
    dials["esd-tilt-dial"] = dial(-1.89, -1.4, 0.93, "esd-tilt-dial", "Street tilt");
    meters["esd-bay-meter"] = meter(-1.45, -1.85, 0.67, "esd-bay-meter", "Water in the Bay jar");
    tokens["esd-leaf-screen"] = token(-0.92, -2.16, 0.4, "esd-leaf-screen", "Leaf screen");
    spots["esd-drain-spot"] = spot(-0.31, -2.33, 0.13, "esd-drain-spot", "The model drain");
    card(0.31, 1.35, -2.33, "esd-result-card", "State where it goes", "WHERE\nDOES IT GO?", { ry: -0.13 });
    meters["esd-map-track"] = meter(0.92, -2.16, -0.4, "esd-map-track", "Drain line followed");
    boards["esd-drain-log"] = board(1.45, -1.85, -0.67, "esd-drain-log", "Drain trip record");
    boards["esd-share-board"] = board(1.89, -1.4, -0.93, "esd-share-board", "Share an idea");
    boards["esd-checkin"] = board(2.19, -0.85, -1.2, "esd-checkin", "End-of-walk check-in");
    hazardCard(-1.53, 0.72, -1.21, "drain-goes-to-a-cleaner", "Say the storm drain goes to a cleaning plant?", "CLEANED\nFIRST?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "pour-it-in-the-drain", "Pour the bucket of soapy water into the drain?", "POUR\nIT IN", 0.3);
    hazardCard(0.58, 0.72, -1.86, "lift-the-grate", "Lift the drain grate to look inside?", "LIFT\nGRATE", -0.3);
    hazardCard(1.53, 0.72, -1.21, "step-into-the-street", "Step into the street to follow the water?", "INTO\nSTREET", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Roof, gutter, drain, Bay."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Storm drain crew lead", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Crew member with cones", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-street-sweeper-comes-along"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-street-sweeper-comes-along"].visible = false;
    arrivals["the-crew-lead-asks-about-the-slope"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-crew-lead-asks-about-the-slope"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-leaf-screen-over-the") { const s = spots["esd-drain-spot"]; tokens["esd-leaf-screen"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-what-you-saw-at-each") repaint(boards["esd-drain-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Trip recorded"], "#59c97b"));
        if (step.id === "share-one-way-to-keep-the") repaint(boards["esd-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Idea shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["esd-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-where-the-drain-water-goes") paintGuide("Only rain in the drain.");
      },

      onHazard() {
        paintGuide("Stop. Stay on the sidewalk.");
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
        if (it.id === "a-street-sweeper-comes-along") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Class behind the cones, the sweeper passed. The lesson carries on."); }
        if (it.id === "the-crew-lead-asks-about-the-slope") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Slope explained. The lesson carries on."); }
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
