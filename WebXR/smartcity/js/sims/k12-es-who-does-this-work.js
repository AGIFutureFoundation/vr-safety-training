import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Who Does This Work. Lower-secondary careers and life skills at the Market Street Union Hall in San Francisco (and the Mandela Parkway Union Hall where the Oakland map is loaded): the trades and crews who build and look after storm drains, rain gardens, marshes and clean ports, matched job by job, with what the U.S. EPA says about its San Francisco Bay awards and what the Port of Oakland says about its workforce partners, using only the EPA's award release and the Port of Oakland's Clean Ports announcement.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ES_WHO_DOES_THIS_WORK = {
  id: "k12-es-who-does-this-work",
  index: "877",
  domain: "Education",
  trade: "Careers class at a union hall with trades crew members from Bay restoration and port work — learner and crew mentor",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Who Does This Work",
  title: simTitle("Who Does This Work"),
  tagline: "Every clean drain, rain garden and marsh is built by a crew — meet the trades and match the jobs",
  accent: 0xb07a4a,
  accentCss: "#b07a4a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"crew-finder","name":"Crew Finder","note":"Matched Bay restoration and clean port jobs to the crews who do them, and learned how people train for that work"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Crew Board",
    currency: "HARD HATS",
    ranks: ["Visitor","Helper","Apprentice","Crew Member","Crew Leader"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-crews-in-the-bay") },
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
    "only-scientists-do-it": "You said only scientists restore the Bay. Scientists plan and measure, and trades crews do the building: operators, labourers, landscape crews, plant operators and many more. It takes both.",
    "skip-the-training": "You said a new crew member can start without training. Every crew trains before the job and keeps training, from safety basics to the machines they run. Apprenticeships mix learning with paid work for exactly this reason.",
    "guess-the-facts": "You made up a number about the projects. Only say what a source says, and name the source. If a source does not say it, the honest answer is that we do not know yet.",
    "try-on-the-harness": "You reached for the crew's harness. Safety gear is fitted and checked by trained crew. Ask the mentor to show how it is checked, and keep your hands on the display pieces."
  },

  lateNotes: {
    "esw-trade-log": "The trades record is written after you meet each crew — nothing to record yet.",
    "esw-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-the-crews-in-the-bay",
      kind: "find",
      noHint: true,
      targets: [
        "esw-operator",
        "esw-landscape",
        "esw-plant-op"
      ],
      itemNames: {
        "esw-operator": "an equipment operator in an excavator",
        "esw-landscape": "a landscape crew planting",
        "esw-plant-op": "a treatment plant operator"
      },
      itemNotes: {
        "esw-operator": "Digs channels and moves soil.",
        "esw-landscape": "Plants gardens and marsh grass.",
        "esw-plant-op": "Runs the systems that clean water."
      },
      decoyNotes: {
        "esw-tourist": "Enjoying the Bay, but not on a crew."
      },
      title: "Find the crews in the Bay projects",
      cue: "Mark the three crews you can see on the project photos on the wall.",
      why: "Bay projects need many kinds of crews. Equipment operators dig channels and move soil, landscape crews plant rain gardens and marsh grass, and treatment plant operators run the systems that clean water. Seeing each crew at work shows that caring for the Bay is a set of real jobs people train for."
    },
    {
      id: "greet-the-crew-mentor",
      kind: "select",
      target: "esw-greet-card",
      title: "Greet the crew mentor",
      cue: "Shake hands and introduce yourself to the crew mentor.",
      why: "Meeting a crew mentor is a first step into any trade. A clear greeting and your name show respect and interest. Mentors help new people learn the job, and many say the best apprentices start by asking good questions."
    },
    {
      id: "put-the-path-into-a-trade",
      kind: "sequence",
      targets: [
        "esw-ord-learn",
        "esw-ord-pre",
        "esw-ord-app",
        "esw-ord-crew"
      ],
      itemNames: {
        "esw-ord-learn": "1 · learn what the trade does",
        "esw-ord-pre": "2 · take a pre-apprenticeship course",
        "esw-ord-app": "3 · start a paid apprenticeship",
        "esw-ord-crew": "4 · join a crew on the job"
      },
      title: "Put the path into a trade in order",
      cue: "Put the steps from learning about a trade to working on a crew in order.",
      why: "Most people reach a trade through a path. They learn what the trade does, take a pre-apprenticeship to get ready, start a paid apprenticeship that mixes classes with work, and then join a crew. Knowing the order helps you plan your own path.",
      outOfOrderNote: "Out of order. Start by learning what the trade does."
    },
    {
      id: "hold-up-the-safety-gear-while",
      kind: "hold",
      target: "esw-hat-hold",
      seconds: 6,
      title: "Hold up the safety gear while the mentor explains",
      cue: "Hold up the display hard hat while the mentor explains each piece of gear.",
      why: "Safety gear is part of every trade. Holding up each piece while the mentor explains it helps you remember what it is for. Crews check their gear at the start of every shift, and learning that habit early is part of training.",
      holdBreakNote: "The hard hat went down before the mentor finished. Hold it up again."
    },
    {
      id: "say-who-trains-workers-for-the",
      kind: "select",
      target: "esw-result-card",
      title: "Say who trains workers for the clean port",
      cue: "Choose the sentence that matches what the Port of Oakland says.",
      why: "The Port of Oakland says the Pacific Maritime Association provides skills and safety training on the zero-emission equipment, and the Machinists Institute helps the West Oakland Jobs Resource Center grow its pre-apprentice program to include careers affected by zero-emission vehicles. A good answer repeats what the source says and adds nothing."
    },
    {
      id: "spot-what-the-sources-say-about",
      kind: "find",
      noHint: true,
      targets: [
        "esw-epa",
        "esw-kinds",
        "esw-port"
      ],
      itemNames: {
        "esw-epa": "the EPA card on the Bay awards",
        "esw-kinds": "the list of kinds of work",
        "esw-port": "the Port of Oakland card on training"
      },
      itemNotes: {
        "esw-epa": "Twenty projects for water and habitat.",
        "esw-kinds": "Trash capture, gardens, marshes and more.",
        "esw-port": "Named partners train workers."
      },
      decoyNotes: {
        "esw-rumour": "A guess with no source is not a fact."
      },
      title: "Spot what the sources say about the work",
      cue: "Read the two source cards and mark each fact they state.",
      why: "The U.S. EPA says its San Francisco Bay Program awarded more than eighty-two million dollars to twenty projects for water quality and habitat, including trash capture, green stormwater infrastructure, tidal marsh and wetland restoration, nutrient reduction, sediment management, fish habitat and PCB source control. Reading the source itself is how you know what is true."
    },
    {
      id: "turn-the-job-wheel-to-your",
      kind: "turn",
      target: "esw-job-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "JOBS"
      },
      title: "Turn the job wheel to your favourite",
      cue: "Turn the job wheel until it points at the job you would most like to try.",
      why: "Choosing a favourite job helps you notice what you enjoy, like working outdoors, running machines or caring for plants. There is no wrong choice. Careers advisers say knowing what you like is the best starting point for finding a trade that fits."
    },
    {
      id: "rate-how-much-each-job-uses",
      kind: "gauge",
      target: "esw-math-meter",
      gauge: {
        label: "MATHS",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not set yet. Ask the mentor and move the marker to match."
      },
      title: "Rate how much each job uses maths",
      cue: "Commit when the marker shows how much maths the chosen job uses.",
      why: "Almost every trade uses maths, from measuring a rain garden to reading a gauge at a treatment plant. Rating it helps you see why school subjects matter on a crew. Mentors often say the maths they use every day is measuring, adding up and reading scales."
    },
    {
      id: "match-a-job-to-its-crew",
      kind: "drag",
      target: "esw-job-card",
      drag: {
        to: "esw-crew-spot",
        radius: 0.45,
        missNote: "Not on the landscape crew yet. Which crew plants gardens?"
      },
      title: "Match a job to its crew",
      cue: "Drag the card that says planting a rain garden to the landscape crew.",
      why: "Matching jobs to crews shows how projects are shared out. Planting belongs to the landscape crew, digging to the operators and running a plant to the operators there. Knowing who does what is how crews work together safely on one site."
    },
    {
      id: "follow-one-project-from-plan-to",
      kind: "track",
      target: "esw-project-track",
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
        label: "PATH"
      },
      title: "Follow one project from plan to crew",
      cue: "Keep the marker on the rain garden project as it moves from plan to build.",
      why: "A project moves through many hands. Planners draw it, a locate crew marks pipes, operators dig, and landscape crews plant. Following one project shows how every step needs trained people, and how each crew hands on to the next.",
      holdBreakNote: "The marker lost the project. Find it again and follow it to the planting."
    },
    {
      id: "record-the-trades-you-met",
      kind: "select",
      target: "esw-trade-log",
      doneLine: "Trades recorded",
      title: "Record the trades you met",
      cue: "Write one line for each trade you met and what it does on a Bay project.",
      why: "A list of trades and their jobs is a map of possible careers. Reading it later helps you remember which work sounded interesting. Careers advisers ask students to keep lists like this when they explore pathways."
    },
    {
      id: "share-one-job-you-would-try",
      kind: "select",
      target: "esw-share-board",
      doneLine: "Job shared",
      title: "Share one job you would try",
      cue: "Tell another group one Bay job you would like to try and why.",
      why: "Saying a goal out loud makes it real. Hearing others' choices shows how many kinds of work there are. The Port of Oakland says its clean port work will create hundreds of green jobs, with priority for people who live nearby."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "esw-checkin",
      doneLine: "Checked in",
      title: "Check in before leaving the hall",
      cue: "Name two crews who work on Bay projects. How do people train for them?",
      why: "The mentor checks what the class learned before they leave. Each learner names two crews and one way people train. If anyone thinks only scientists do the work, the group sorts it out now."
    }
  ],

  interrupts: [
    {
      id: "the-hall-fire-drill-bell",
      kind: "Drill bell",
      after: "hold-up-the-safety-gear-while",
      delay: 3,
      seconds: 12,
      target: "esw-line-up",
      alert: "The hall's practice drill bell rings.",
      cue: "Line up calmly at the marked exit with the mentor.",
      why: "Every workplace practises leaving the building. Lining up calmly at the marked exit shows you know the plan. Crews practise the same drills on every site, and a calm line is the goal.",
      missNote: "The class stayed seated, and the mentor had to gather everyone before leading them out.",
      wrongNote: "That ignores the drill. Line up at the exit. Choose the response that deals with it now."
    },
    {
      id: "the-mentor-asks-for-a-source",
      kind: "Mentor question",
      after: "follow-one-project-from-plan-to",
      delay: 3,
      seconds: 12,
      target: "esw-name-source",
      alert: "The mentor asks where the facts about the Bay projects come from.",
      cue: "Say the facts come from the U.S. EPA's award release and the Port of Oakland.",
      why: "Naming the source shows you know how to check a fact. Anyone can look up the release and read it for themselves. Crews use the same habit when they check a drawing or a safety sheet before they start.",
      missNote: "You could not name the source, and the mentor had to show the class the release before going on.",
      wrongNote: "That does not name the source. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0xb07a4a;
    const CSS = "#b07a4a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#665c52", base2: "#5a5046", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e8e0d6", base2: "#d8ccbe", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // a hall's stage behind the station: risers, a curtain, footlights and rows of seats at the sides
    void wallMat;
    const stage = group(g, 0, 0, -4.4);
    box(stage, 6.6, 0.5, 1.6, 0, 0.25, 0, 0x4a3a30, { rough: 0.7 });
    box(stage, 6.8, 0.05, 1.7, 0, 0.52, 0, 0x6b4a2e, { rough: 0.6 });
    box(stage, 6.6, 2.6, 0.1, 0, 1.85, -0.75, 0x7a2a2a, { rough: 0.95 });
    for (let i = 0; i < 7; i++) box(stage, 0.12, 2.5, 0.06, -2.7 + i * 0.9, 1.85, -0.68, 0x8a3232, { rough: 0.95 });
    for (let i = 0; i < 6; i++) ball(stage, 0.05, -2.5 + i * 1.0, 0.56, 0.8, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.2, rough: 0.4, seg: 8 });
    for (const side of [-1, 1]) for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const seat = group(g, side * (2.9 + c * 0.55), 0, -3.2 + r * 0.7, side * 0.35);
      box(seat, 0.45, 0.06, 0.45, 0, 0.45, 0, 0x2a5a8a, { rough: 0.8 });
      box(seat, 0.45, 0.5, 0.06, 0, 0.72, -0.2, 0x2a5a8a, { rough: 0.8 });
      for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) box(seat, 0.03, 0.42, 0.03, lx, 0.21, lz, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    }

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "esw-operator", "an equipment operator in an excavator", {});
    bead(-1.42, 1.18, -0.62, "esw-landscape", "a landscape crew planting", {});
    bead(-1.03, 1.46, -0.71, "esw-plant-op", "a treatment plant operator", {});
    bead(-1.08, 0.9, -1.11, "esw-tourist", "a tourist taking photos", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "esw-ord-learn", "1 · learn what the trade does", {});
    bead(-0.58, 1.46, -1.44, "esw-ord-pre", "2 · take a pre-apprenticeship course", {});
    bead(-0.24, 0.9, -1.23, "esw-ord-app", "3 · start a paid apprenticeship", {});
    bead(0, 1.18, -1.55, "esw-ord-crew", "4 · join a crew on the job", {});
    bead(0.24, 1.46, -1.23, "esw-hat-hold", "Hold up the gear", {});
    bead(0.58, 0.9, -1.44, "esw-epa", "the EPA card on the Bay awards", {});
    bead(0.68, 1.18, -1.05, "esw-kinds", "the list of kinds of work", {});
    bead(1.08, 1.46, -1.11, "esw-port", "the Port of Oakland card on training", {});
    bead(1.03, 0.9, -0.71, "esw-rumour", "a sticky note with a guess", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "esw-line-up", "Line up calmly at the exit", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "esw-name-source", "Name the source for the Bay facts", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "esw-greet-card", "Mentor greeted", "SAY\nHELLO", { ry: 1.2 });
    dials["esw-job-dial"] = dial(-1.89, -1.4, 0.93, "esw-job-dial", "Job wheel");
    meters["esw-math-meter"] = meter(-1.45, -1.85, 0.67, "esw-math-meter", "Maths in the job");
    tokens["esw-job-card"] = token(-0.92, -2.16, 0.4, "esw-job-card", "Job card");
    spots["esw-crew-spot"] = spot(-0.31, -2.33, 0.13, "esw-crew-spot", "The landscape crew");
    card(0.31, 1.35, -2.33, "esw-result-card", "Name the partners", "WHO\nTRAINS?", { ry: -0.13 });
    meters["esw-project-track"] = meter(0.92, -2.16, -0.4, "esw-project-track", "Project followed");
    boards["esw-trade-log"] = board(1.45, -1.85, -0.67, "esw-trade-log", "Trades record");
    boards["esw-share-board"] = board(1.89, -1.4, -0.93, "esw-share-board", "Share a job");
    boards["esw-checkin"] = board(2.19, -0.85, -1.2, "esw-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "only-scientists-do-it", "Say only scientists restore the Bay?", "ONLY\nSCIENTISTS?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "skip-the-training", "Say a crew member can start without training?", "NO\nTRAINING?", 0.3);
    hazardCard(0.58, 0.72, -1.86, "guess-the-facts", "Make up a number about the projects?", "MAKE IT\nUP?", -0.3);
    hazardCard(1.53, 0.72, -1.21, "try-on-the-harness", "Put on the crew's harness to try it?", "TRY\nHARNESS", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Every project needs a crew."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Careers teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Crew mentor", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Apprentice", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-hall-fire-drill-bell"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-hall-fire-drill-bell"].visible = false;
    arrivals["the-mentor-asks-for-a-source"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-mentor-asks-for-a-source"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "match-a-job-to-its-crew") { const s = spots["esw-crew-spot"]; tokens["esw-job-card"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-trades-you-met") repaint(boards["esw-trade-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Trades recorded"], "#59c97b"));
        if (step.id === "share-one-job-you-would-try") repaint(boards["esw-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Job shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["esw-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-who-trains-workers-for-the") paintGuide("Say only what a source says.");
      },

      onHazard() {
        paintGuide("Stop. Training first, facts with a source.");
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
        if (it.id === "the-hall-fire-drill-bell") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Class lined up and counted, the drill ended. The lesson carries on."); }
        if (it.id === "the-mentor-asks-for-a-source") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Source named. The lesson carries on."); }
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
