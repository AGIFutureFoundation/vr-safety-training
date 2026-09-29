import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Clean Air at the Port. Lower-secondary science at a container port by the Bay (the Port Southern Terminals site in San Francisco, and the Port of Oakland sites where the Oakland map is loaded): why diesel exhaust near a port matters to breathing, how electric trucks and cranes make no exhaust where they work, and what the Port of Oakland says about its Clean Ports conversion, using only what the scene shows and the Port of Oakland's Clean Ports page and award announcement.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ES_CLEAN_AIR_AT_THE_PORT = {
  id: "k12-es-clean-air-at-the-port",
  index: "876",
  domain: "Education",
  trade: "Science visit with the terminal equipment crew at a container port — learner and equipment crew lead",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Clean Air at the Port",
  title: simTitle("Clean Air at the Port"),
  tagline: "Electric trucks and cranes make no exhaust where they work — see why that matters to the air people breathe",
  accent: 0x4a9ab0,
  accentCss: "#4a9ab0",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"clean-air-scout","name":"Clean Air Scout","note":"Compared exhaust from a diesel and an electric model truck, explained why cleaner air near a port matters and learned what the port's conversion plans to change"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Air Board",
    currency: "BREATHS",
    ranks: ["Breeze","Gust","Wind","Clear Sky","Air Keeper"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-machines-that-move-containers") },
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
    "electric-means-no-power": "You said electric trucks are too weak for containers. Electric motors are strong, and battery and hydrogen machines are built for this work. The difference is that they make no exhaust where they run.",
    "walk-into-the-yard": "You started into the container yard. Big machines move there all the time, and electric ones are very quiet. Visitors stay behind the yellow line with the crew lead and watch from the walkway.",
    "touch-the-charger": "You reached for the charging cable. Chargers carry a lot of electricity and only trained crew connect them. Look at the charger from behind the line, and let the crew show how it works.",
    "exhaust-only-smells": "You said exhaust is only a bad smell. Diesel exhaust carries tiny particles that people breathe in. Less exhaust near homes and schools means cleaner air for the neighbours."
  },

  lateNotes: {
    "esa-plan-log": "The port plan record is written after both filter runs — nothing to record yet.",
    "esa-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-the-machines-that-move-containers",
      kind: "find",
      noHint: true,
      targets: [
        "esa-crane",
        "esa-tractor",
        "esa-dray"
      ],
      itemNames: {
        "esa-crane": "the tall container crane",
        "esa-tractor": "the yard tractor",
        "esa-dray": "the drayage truck"
      },
      itemNotes: {
        "esa-crane": "It lifts boxes off the ship.",
        "esa-tractor": "It moves boxes around the terminal.",
        "esa-dray": "It carries boxes out of the port."
      },
      decoyNotes: {
        "esa-gull": "Always around the port, but it moves no containers."
      },
      title: "Find the machines that move containers",
      cue: "Mark the three kinds of machines that move containers around the port.",
      why: "A port moves containers with several kinds of machines. Cranes lift them off ships, yard tractors pull them around the terminal, and drayage trucks carry them out to warehouses. When these machines run on diesel, they make exhaust right where people work and nearby families live, which is why the kind of power matters."
    },
    {
      id: "put-the-exhaust-test-in-order",
      kind: "sequence",
      targets: [
        "esa-ord-clean",
        "esa-ord-diesel",
        "esa-ord-check",
        "esa-ord-electric"
      ],
      itemNames: {
        "esa-ord-clean": "1 · fit a clean filter on the exhaust tube",
        "esa-ord-diesel": "2 · run the diesel model truck",
        "esa-ord-check": "3 · check the filter for dark specks",
        "esa-ord-electric": "4 · fit a fresh filter and run the electric model"
      },
      title: "Put the exhaust test in order",
      cue: "Clean the filter, run the diesel model, check it, then run the electric model with a clean filter.",
      why: "A fair comparison starts with a clean filter each time. Running the diesel model and checking the filter shows what its exhaust leaves behind. Then a fresh filter and the electric model for the same time shows the difference, with the kind of power as the only change.",
      outOfOrderNote: "Out of order. Start with a clean filter on the exhaust tube."
    },
    {
      id: "stay-behind-the-yellow-line",
      kind: "select",
      target: "esa-line-card",
      title: "Stay behind the yellow line",
      cue: "Stand behind the yellow line on the walkway with the crew lead.",
      why: "Container yards are busy places with big machines, and electric machines are so quiet you may not hear them coming. Standing behind the yellow line keeps the class clear of every moving machine. The crew lead watches the yard so the class can watch the lesson."
    },
    {
      id: "set-the-run-timer-and-leave",
      kind: "turn",
      target: "esa-timer-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "TIME"
      },
      title: "Set the run timer and leave it",
      cue: "Turn the timer dial to the teacher's setting for both runs.",
      why: "Both models must run for the same time, or the comparison is not fair. A longer run would leave more specks on the filter no matter what. Setting the timer once for both runs keeps the time the same, so only the kind of power changes."
    },
    {
      id: "read-the-specks-on-the-filter",
      kind: "gauge",
      target: "esa-speck-meter",
      gauge: {
        label: "SPECKS",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not matched yet. Slide the marker to the grey that looks like the filter."
      },
      title: "Read the specks on the filter",
      cue: "Commit when the marker matches the filter's colour on the grey scale.",
      why: "Matching the filter against a grey scale turns what you see into a reading you can compare. A dark filter means more tiny particles, and a clean one means fewer. Scientists who watch air near ports use instruments that do the same job much more precisely."
    },
    {
      id: "hold-the-filter-tube-steady",
      kind: "hold",
      target: "esa-tube-hold",
      seconds: 6,
      title: "Hold the filter tube steady",
      cue: "Hold the filter tube over the model's exhaust until the timer ends.",
      why: "If the tube slips, some exhaust escapes past the filter and the reading is too low. Holding it steady catches everything the model gives off. Careful collecting is what makes a comparison honest, for a class model and for real air monitoring.",
      holdBreakNote: "The tube slipped off the exhaust. Hold it steady again until the timer ends."
    },
    {
      id: "park-the-electric-tractor-at-the",
      kind: "drag",
      target: "esa-tractor",
      drag: {
        to: "esa-charge-bay",
        radius: 0.45,
        missNote: "Not in the charging bay yet. Park it in the marked bay."
      },
      title: "Park the electric tractor at the charger",
      cue: "Drag the model yard tractor to the charging bay on the model yard.",
      why: "Electric machines recharge between jobs in a charging yard. Parking in the marked bay puts the machine where trained crew can connect it safely. Planning where machines charge is a big part of switching a port to electric equipment."
    },
    {
      id: "spot-the-ports-zero-emission-equipment",
      kind: "find",
      noHint: true,
      targets: [
        "esa-ev-truck",
        "esa-charger",
        "esa-battery"
      ],
      itemNames: {
        "esa-ev-truck": "an electric drayage truck",
        "esa-charger": "a row of chargers",
        "esa-battery": "the battery storage building"
      },
      itemNotes: {
        "esa-ev-truck": "It carries boxes with no exhaust.",
        "esa-charger": "Machines refill with electricity here.",
        "esa-battery": "Large batteries hold electricity."
      },
      decoyNotes: {
        "esa-flag": "It shows the wind, but it is not equipment."
      },
      title: "Spot the port's zero-emission equipment",
      cue: "Look across the terminal and mark each part of the clean equipment.",
      why: "The Port of Oakland says its Clean Ports award pays for electric and hydrogen cargo handling equipment, drayage trucks, charging infrastructure and a battery energy storage system. Seeing each kind in the scene helps you picture what a zero-emission port looks like. A battery energy storage system is a set of large batteries that hold electricity until it is needed."
    },
    {
      id: "say-what-your-filters-showed",
      kind: "select",
      target: "esa-result-card",
      title: "Say what your filters showed",
      cue: "Choose the sentence that says what the two runs showed.",
      why: "Both models ran for the same time with clean filters. The diesel filter came out darker, and the electric filter stayed clean. A good answer says electric machines make no exhaust where they run, and it does not claim more than the two filters showed."
    },
    {
      id: "follow-the-breeze-from-the-port",
      kind: "track",
      target: "esa-puff-track",
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
        label: "BREEZE"
      },
      title: "Follow the breeze from the port",
      cue: "Keep the marker on the smoke puff as the breeze carries it inland.",
      why: "Exhaust does not stay where it is made. The breeze carries it over fences and streets to homes and schools. Following the puff shows why cleaner machines at the port help people who live nearby, not only the people who work there.",
      holdBreakNote: "The marker lost the puff. Find it again and follow it with the breeze."
    },
    {
      id: "record-the-ports-plan-in-your",
      kind: "select",
      target: "esa-plan-log",
      doneLine: "Plan recorded",
      title: "Record the port's plan in your own words",
      cue: "Write what the Port of Oakland says the award is for and what it expects.",
      why: "The Port of Oakland says the Clean Ports Program awarded it three hundred twenty-two million dollars for six hundred sixty-three pieces of zero-emission equipment, and expects a cut of twenty-four thousand tons of greenhouse gas a year and a significant decrease in particulate matter. Writing it in your own words, with the source named, is how a careful reporter works."
    },
    {
      id: "share-one-reason-clean-air-matters",
      kind: "select",
      target: "esa-share-board",
      doneLine: "Reason shared",
      title: "Share one reason clean air matters",
      cue: "Tell another group one reason cleaner air near a port helps people.",
      why: "Families, students and workers all breathe the air near a port. Sharing reasons helps the class see how one change at the port reaches many people. Neighbours who live near ports often ask for cleaner air for the same reasons."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "esa-checkin",
      doneLine: "Checked in",
      title: "Check in before leaving the walkway",
      cue: "Why do electric trucks and cranes help the air? Who breathes that air?",
      why: "The crew talks over each visit before the class leaves the walkway. Each learner says why electric machines help the air and names who breathes it. If anyone thinks exhaust is only a smell, the group sorts it out now."
    }
  ],

  interrupts: [
    {
      id: "a-quiet-tractor-rolls-past",
      kind: "Quiet machine",
      after: "hold-the-filter-tube-steady",
      delay: 3,
      seconds: 12,
      target: "esa-look-both",
      alert: "An electric yard tractor rolls past the walkway almost without a sound.",
      cue: "Stop, look both ways and wait for the crew lead's signal.",
      why: "Electric machines are quiet, so you cannot rely on hearing them. Stopping and looking both ways is the habit that keeps everyone safe. Crews at electric terminals practise the same thing every shift.",
      missNote: "The class kept walking without looking, and the crew lead had to stop everyone at the crossing.",
      wrongNote: "That relies on hearing the machine. Stop and look both ways. Choose the response that deals with it now."
    },
    {
      id: "the-crew-lead-asks-who-trains-the-crews",
      kind: "Crew question",
      after: "follow-the-breeze-from-the-port",
      delay: 3,
      seconds: 12,
      target: "esa-name-training",
      alert: "The crew lead asks who helps workers learn the new equipment.",
      cue: "Say the Port of Oakland names the Pacific Maritime Association for skills and safety training.",
      why: "The Port of Oakland says it partners with the Pacific Maritime Association for skills and safety training on the zero-emission equipment. New machines need crews who know them well. Training is part of every change at a port.",
      missNote: "You could not say who helps train the crews, and the crew lead had to explain before the class could go on.",
      wrongNote: "That does not name the training partner. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x4a9ab0;
    const CSS = "#4a9ab0";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#5c6266", base2: "#50565a", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dde6ea", base2: "#cad8de", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "esa-crane", "the tall container crane", {});
    bead(-1.42, 1.18, -0.62, "esa-tractor", "the yard tractor", {});
    bead(-1.03, 1.46, -0.71, "esa-dray", "the drayage truck", {});
    bead(-1.08, 0.9, -1.11, "esa-gull", "a gull on a bollard", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "esa-ord-clean", "1 · fit a clean filter on the exhaust tube", {});
    bead(-0.58, 1.46, -1.44, "esa-ord-diesel", "2 · run the diesel model truck", {});
    bead(-0.24, 0.9, -1.23, "esa-ord-check", "3 · check the filter for dark specks", {});
    bead(0, 1.18, -1.55, "esa-ord-electric", "4 · fit a fresh filter and run the electric model", {});
    bead(0.24, 1.46, -1.23, "esa-tube-hold", "Hold the filter tube", {});
    bead(0.58, 0.9, -1.44, "esa-ev-truck", "an electric drayage truck", {});
    bead(0.68, 1.18, -1.05, "esa-charger", "a row of chargers", {});
    bead(1.08, 1.46, -1.11, "esa-battery", "the battery storage building", {});
    bead(1.03, 0.9, -0.71, "esa-flag", "the port's flag", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "esa-look-both", "Stop and look both ways", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "esa-name-training", "Say who helps train crews for the new equipment", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "esa-line-card", "Behind the line", "YELLOW\nLINE", { ry: 1.2 });
    dials["esa-timer-dial"] = dial(-1.89, -1.4, 0.93, "esa-timer-dial", "Run timer");
    meters["esa-speck-meter"] = meter(-1.45, -1.85, 0.67, "esa-speck-meter", "Filter reading");
    tokens["esa-tractor"] = token(-0.92, -2.16, 0.4, "esa-tractor", "Model yard tractor");
    spots["esa-charge-bay"] = spot(-0.31, -2.33, 0.13, "esa-charge-bay", "The charging bay");
    card(0.31, 1.35, -2.33, "esa-result-card", "State the result", "WHICH WAS\nCLEANER?", { ry: -0.13 });
    meters["esa-puff-track"] = meter(0.92, -2.16, -0.4, "esa-puff-track", "Puff followed");
    boards["esa-plan-log"] = board(1.45, -1.85, -0.67, "esa-plan-log", "Port plan record");
    boards["esa-share-board"] = board(1.89, -1.4, -0.93, "esa-share-board", "Share a reason");
    boards["esa-checkin"] = board(2.19, -0.85, -1.2, "esa-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "electric-means-no-power", "Say electric trucks are too weak to move containers?", "TOO\nWEAK?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "walk-into-the-yard", "Walk into the container yard for a closer look?", "INTO\nYARD", 0.3);
    hazardCard(0.58, 0.72, -1.86, "touch-the-charger", "Touch the charging cable to see how it works?", "TOUCH\nCABLE", -0.3);
    hazardCard(1.53, 0.72, -1.21, "exhaust-only-smells", "Say exhaust only smells bad and nothing more?", "ONLY A\nSMELL?", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Same time, clean filter each run."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Equipment crew lead", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Yard tractor driver", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-quiet-tractor-rolls-past"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-quiet-tractor-rolls-past"].visible = false;
    arrivals["the-crew-lead-asks-who-trains-the-crews"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-crew-lead-asks-who-trains-the-crews"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "park-the-electric-tractor-at-the") { const s = spots["esa-charge-bay"]; tokens["esa-tractor"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-ports-plan-in-your") repaint(boards["esa-plan-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Plan recorded"], "#59c97b"));
        if (step.id === "share-one-reason-clean-air-matters") repaint(boards["esa-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Reason shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["esa-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-your-filters-showed") paintGuide("No exhaust where it runs.");
      },

      onHazard() {
        paintGuide("Stop. Behind the yellow line.");
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
        if (it.id === "a-quiet-tractor-rolls-past") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Class stopped and looking, the tractor passed. The lesson carries on."); }
        if (it.id === "the-crew-lead-asks-who-trains-the-crews") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Training partner named. The lesson carries on."); }
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
