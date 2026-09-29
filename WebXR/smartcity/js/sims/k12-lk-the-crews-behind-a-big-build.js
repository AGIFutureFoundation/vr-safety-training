import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — The Crews Behind a Big Build. Lower-secondary careers awareness at a workforce centre beside a large development site in Louisiana: the many trades a big build needs from the first survey to the finished building, how an apprenticeship pays people while they learn a trade, and why every crew starts the day with a safety talk, worked on a job board, a site model and a tool wall in the scene. Kinds of work only; no employer's hiring is described.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_LK_THE_CREWS_BEHIND_A_BIG_BUILD = {
  id: "k12-lk-the-crews-behind-a-big-build",
  index: "969",
  domain: "Education",
  trade: "Careers awareness at a workforce centre beside a large Louisiana development site — learner and apprenticeship coordinator",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "The Crews Behind a Big Build",
  title: simTitle("The Crews Behind a Big Build"),
  tagline: "Surveyors to electricians, operators to painters — match the crews to the work and plan a path into a trade",
  accent: 0xc77a3c,
  accentCss: "#c77a3c",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"crew-matcher","name":"Crew Matcher","note":"Matched trades to each stage of a big build, sorted the tools each trade uses and planned a path into an apprenticeship"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Workforce Board",
    currency: "HARD HATS",
    ranks: ["Visitor","Explorer","Pre-Apprentice","Apprentice","Crew Matcher"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-first-crews-on-a") },
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
    "only-one-kind-of-job": "You said a big build is just construction workers. A large site needs surveyors, operators, electricians, pipefitters, ironworkers, carpenters, welders, painters, mechanics and many more, and after it opens it needs people to run and repair it. There are many different trades to choose from.",
    "skip-the-safety-talk": "You wanted to skip the safety talk. Every crew starts the day by talking through the jobs, the risks and who does what. It takes a few minutes and it is how the whole crew gets home well. Skipping it is never a shortcut.",
    "trades-need-no-school": "You said trades need no maths or reading. Electricians work with measurements and formulas, fitters read drawings, operators read load charts, and everyone reads safety labels. The maths and reading from school are tools of every trade.",
    "try-the-tool-without-training": "You reached for a power tool. Power tools are used by trained people wearing the right protection, after they learn how. In the workforce centre, tools on the wall are for looking at; you would learn to use them step by step in a training programme."
  },

  lateNotes: {
    "lkj-trade-log": "The trade list is written once you have explored the site model — nothing to record yet.",
    "lkj-checkin": "The check-in comes at the end of the visit."
  },

  steps: [
    {
      id: "find-the-first-crews-on-a",
      kind: "find",
      noHint: true,
      targets: [
        "lkj-survey",
        "lkj-operator",
        "lkj-utility"
      ],
      itemNames: {
        "lkj-survey": "a surveyor with a tripod",
        "lkj-operator": "an operator on a dozer",
        "lkj-utility": "a utility crew laying pipe"
      },
      itemNotes: {
        "lkj-survey": "Measures and marks the land.",
        "lkj-operator": "Clears and levels the ground.",
        "lkj-utility": "Brings water and power in."
      },
      decoyNotes: {
        "lkj-banner": "It names the project, but it is not a crew."
      },
      title: "Find the first crews on a new site",
      cue: "Mark the three kinds of work that happen before any building goes up.",
      why: "A big build starts long before the walls go up. Surveyors measure the land and mark where everything will go. Equipment operators clear and level the ground with large machines. Utility crews bring in water, power and roads. Knowing the order shows that a big build is a chain of trades, each ready for the next."
    },
    {
      id: "put-the-stages-of-the-build",
      kind: "sequence",
      targets: [
        "lkj-ord-site",
        "lkj-ord-frame",
        "lkj-ord-systems",
        "lkj-ord-finish"
      ],
      itemNames: {
        "lkj-ord-site": "1 · clear, level and pour foundations",
        "lkj-ord-frame": "2 · raise the steel and concrete frame",
        "lkj-ord-systems": "3 · install power, pipes and cooling",
        "lkj-ord-finish": "4 · finish, test and open the building"
      },
      title: "Put the stages of the build in order",
      cue: "Order the stages from bare land to a working building.",
      why: "Each stage of a build needs different trades. Site work comes first: clearing, levelling and foundations. Then the structure goes up with steel and concrete. Next come the systems: power, pipes, heating and cooling. Last is finishing and testing before the building opens. Seeing the stages shows how one project keeps many trades busy for a long time.",
      outOfOrderNote: "Out of order. The ground has to be ready before any steel goes up."
    },
    {
      id: "join-the-morning-safety-talk",
      kind: "select",
      target: "lkj-talk-card",
      title: "Join the morning safety talk",
      cue: "Stand with the crew at the board and listen to the morning safety talk.",
      why: "Every good crew starts the same way: a short talk about what work is planned, what could hurt someone and how the crew will prevent it. Everyone listens, and anyone can ask a question or raise a worry. Joining the talk shows that on a well-run site, safety is part of the job, not something extra."
    },
    {
      id: "turn-the-dial-to-match-a",
      kind: "turn",
      target: "lkj-match-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "MATCH"
      },
      title: "Turn the dial to match a trade to its tool",
      cue: "Turn the matching dial until the pipefitter lines up with the pipe wrench.",
      why: "Every trade has tools it knows best. Pipefitters use pipe wrenches and threaders, electricians use testers and wire strippers, and ironworkers use spud wrenches and harnesses. Matching tools to trades helps you picture a day in each job and notice which kind of work suits the way you like to use your hands."
    },
    {
      id: "read-the-tape-to-the-drawings",
      kind: "gauge",
      target: "lkj-tape-meter",
      gauge: {
        label: "TAPE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the length yet. Read the mark the drawing asks for.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the tape to the drawing's length",
      cue: "Commit when the marker sits at the length the drawing asks for on the tape.",
      why: "Trades turn drawings into real things, and that means measuring exactly. The drawing gives a length; the tape shows it on the material. Reading the tape carefully is the difference between a part that fits and one that must be made again. Measuring is school maths used every single day on site."
    },
    {
      id: "hold-the-level-on-the-model",
      kind: "hold",
      target: "lkj-level-hold",
      seconds: 6,
      title: "Hold the level on the model beam",
      cue: "Hold the spirit level on the model beam until the bubble settles in the middle.",
      why: "A spirit level shows whether something is truly flat. The bubble moves to the high end and sits in the middle only when the beam is level. Holding it still gives the bubble time to settle so you can read it. A carpenter, an ironworker and a mason all use a level many times a day.",
      holdBreakNote: "The level moved and the bubble ran off. Hold it still and let it settle."
    },
    {
      id: "put-your-hard-hat-on-the",
      kind: "drag",
      target: "lkj-hat-token",
      drag: {
        to: "lkj-path-spot",
        radius: 0.45,
        missNote: "Not on the pre-apprentice step yet. Place it at the first training step."
      },
      title: "Put your hard hat on the pathway board",
      cue: "Drag your hard hat token onto the pathway board at the pre-apprentice step.",
      why: "A pathway board shows how people move into a trade: exploring the trades at school, a pre-apprenticeship to learn the basics and safety, an apprenticeship to learn the full trade while earning, and then journey-level work. Placing your token at the first training step shows where a learner could begin after school."
    },
    {
      id: "spot-the-trades-that-run-the",
      kind: "find",
      noHint: true,
      targets: [
        "lkj-electrician",
        "lkj-hvac",
        "lkj-safety"
      ],
      itemNames: {
        "lkj-electrician": "an electrician at a panel",
        "lkj-hvac": "a technician on the cooling units",
        "lkj-safety": "a safety officer on a walk-round"
      },
      itemNotes: {
        "lkj-electrician": "Keeps the power on safely.",
        "lkj-hvac": "Keeps things at the right temperature.",
        "lkj-safety": "Looks after the people inside."
      },
      decoyNotes: {
        "lkj-tree": "Nice to have, but not a kind of work."
      },
      title: "Spot the trades that run the finished building",
      cue: "Look at the finished-building side of the model and mark three kinds of work that keep it running.",
      why: "When a building opens, the work does not stop. Electricians keep the power safe and working. Heating and cooling technicians keep the air and equipment at the right temperature. Security and safety staff look after the people inside. These long-term jobs mean a big build can lead to careers that last."
    },
    {
      id: "say-what-an-apprenticeship-is",
      kind: "select",
      target: "lkj-result-card",
      title: "Say what an apprenticeship is",
      cue: "Choose the sentence that describes an apprenticeship correctly.",
      why: "An apprenticeship is a way into a trade where you are paid while you learn. Apprentices work on real jobs beside experienced workers and also take classes, step by step, until they reach full skill in the trade. A good answer includes both parts: learning on the job and in class, while earning."
    },
    {
      id: "follow-the-concrete-truck-to-the",
      kind: "track",
      target: "lkj-truck-track",
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
      title: "Follow the concrete truck to the pour",
      cue: "Keep the marker on the model concrete truck as it drives from the gate to the pour.",
      why: "Following one delivery shows how many crews one task needs. The driver brings the truck, a flagger guides it, labourers place the concrete, and finishers smooth it. Each depends on the others doing their part at the right moment. Big builds work because crews plan and talk to one another all day.",
      holdBreakNote: "The marker lost the truck. Find it again and follow it to the pour."
    },
    {
      id: "record-three-trades-you-want-to",
      kind: "select",
      target: "lkj-trade-log",
      doneLine: "Trades listed",
      title: "Record three trades you want to learn about",
      cue: "Write the names of three trades and one thing each one does.",
      why: "Writing down trades that interest you turns a visit into a plan. Later you can look each one up, ask a teacher or talk to someone who does the work. Choosing a career starts with noticing what you enjoy, and a short list is a good first step."
    },
    {
      id: "tell-a-partner-which-trade-suits",
      kind: "select",
      target: "lkj-share-board",
      doneLine: "Choice shared",
      title: "Tell a partner which trade suits you",
      cue: "Tell a partner which trade you picked first and why it suits you.",
      why: "Saying your choice out loud helps you think it through. Your partner might notice a reason you had not thought of, or suggest a trade you missed. Crews talk through choices together too, because good decisions come from sharing ideas."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "lkj-checkin",
      doneLine: "Checked in",
      title: "Check in before leaving the centre",
      cue: "Name two trades a big build needs. What is an apprenticeship?",
      why: "The coordinator ends the visit by checking what each learner will take away. Everyone names two trades and describes an apprenticeship in their own words. If anyone still thinks a big build is only one kind of job, the group sorts it out now."
    }
  ],

  interrupts: [
    {
      id: "a-forklift-beeps-in-the-training-bay",
      kind: "Moving machine",
      after: "hold-the-level-on-the-model",
      delay: 3,
      seconds: 12,
      target: "lkj-step-aside",
      alert: "A forklift beeps as it reverses across the training bay with a pallet.",
      cue: "Step onto the marked walkway and wait until the forklift has passed.",
      why: "A reversing beep means a machine is backing up and the driver's view is limited. Moving to the walkway and waiting keeps you where the driver expects people to be. On every site, people and machines keep to their own lanes.",
      missNote: "The class stayed in the bay while the forklift reversed. When a reversing alarm beeps, step back to the marked walkway and wait until the driver has stopped and seen you.",
      wrongNote: "That keeps the class in the forklift's path. Step onto the walkway. Choose the response that deals with it now."
    },
    {
      id: "the-coordinator-asks-about-school-subjects",
      kind: "Coordinator question",
      after: "follow-the-concrete-truck-to-the",
      delay: 3,
      seconds: 12,
      target: "lkj-name-maths",
      alert: "The coordinator asks which school subjects help in a trade.",
      cue: "Say maths and reading help every trade, for measuring, drawings and safety labels.",
      why: "Every trade measures, reads drawings and follows written instructions. Knowing that shows why doing well in school keeps doors open to every kind of work on a big build.",
      missNote: "You could not name a useful subject, and the coordinator explained before the class went on.",
      wrongNote: "That does not name a subject. Say which subjects help and why. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0xc77a3c;
    const CSS = "#c77a3c";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#707070", base2: "#626262", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#ebe4d8", base2: "#dad1c2", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
      box(desk, 0.9, 0.04, 0.55, 0, 0.74, 0, 12089916, { rough: 0.6 });
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
    bead(-1.22, 0.9, -0.27, "lkj-survey", "a surveyor with a tripod", {});
    bead(-1.42, 1.18, -0.62, "lkj-operator", "an operator on a dozer", {});
    bead(-1.03, 1.46, -0.71, "lkj-utility", "a utility crew laying pipe", {});
    bead(-1.08, 0.9, -1.11, "lkj-banner", "the site sign at the gate", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "lkj-ord-site", "1 · clear, level and pour foundations", {});
    bead(-0.58, 1.46, -1.44, "lkj-ord-frame", "2 · raise the steel and concrete frame", {});
    bead(-0.24, 0.9, -1.23, "lkj-ord-systems", "3 · install power, pipes and cooling", {});
    bead(0, 1.18, -1.55, "lkj-ord-finish", "4 · finish, test and open the building", {});
    bead(0.24, 1.46, -1.23, "lkj-level-hold", "Hold the level", {});
    bead(0.58, 0.9, -1.44, "lkj-electrician", "an electrician at a panel", {});
    bead(0.68, 1.18, -1.05, "lkj-hvac", "a technician on the cooling units", {});
    bead(1.08, 1.46, -1.11, "lkj-safety", "a safety officer on a walk-round", {});
    bead(1.03, 0.9, -0.71, "lkj-tree", "a young tree by the car park", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "lkj-step-aside", "Step to the walkway and wait", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "lkj-name-maths", "Say maths and reading are trade tools", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "lkj-talk-card", "Safety talk", "JOIN THE\nTALK", { ry: 1.2 });
    dials["lkj-match-dial"] = dial(-1.89, -1.4, 0.93, "lkj-match-dial", "Matching dial");
    meters["lkj-tape-meter"] = meter(-1.45, -1.85, 0.67, "lkj-tape-meter", "Tape reading");
    tokens["lkj-hat-token"] = token(-0.92, -2.16, 0.4, "lkj-hat-token", "Hard hat token");
    spots["lkj-path-spot"] = spot(-0.31, -2.33, 0.13, "lkj-path-spot", "The pre-apprentice step");
    card(0.31, 1.35, -2.33, "lkj-result-card", "State what it is", "WHAT IS\nIT?", { ry: -0.13 });
    meters["lkj-truck-track"] = meter(0.92, -2.16, -0.4, "lkj-truck-track", "Truck followed");
    boards["lkj-trade-log"] = board(1.45, -1.85, -0.67, "lkj-trade-log", "Trade list");
    boards["lkj-share-board"] = board(1.89, -1.4, -0.93, "lkj-share-board", "Tell a partner");
    boards["lkj-checkin"] = board(2.19, -0.85, -1.2, "lkj-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "only-one-kind-of-job", "Say a big build is just construction workers?", "JUST\nONE JOB?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "skip-the-safety-talk", "Skip the morning safety talk to start sooner?", "SKIP\nTALK", 0.3);
    hazardCard(0.58, 0.72, -1.86, "trades-need-no-school", "Say trades do not need maths or reading?", "NO\nMATHS?", -0.3);
    hazardCard(1.53, 0.72, -1.21, "try-the-tool-without-training", "Pick up a power tool from the wall to try it?", "TRY\nIT", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Join the safety talk at the board."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Apprenticeship coordinator", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Journey-level electrician", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-forklift-beeps-in-the-training-bay"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-forklift-beeps-in-the-training-bay"].visible = false;
    arrivals["the-coordinator-asks-about-school-subjects"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-coordinator-asks-about-school-subjects"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "put-your-hard-hat-on-the") { const s = spots["lkj-path-spot"]; tokens["lkj-hat-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-three-trades-you-want-to") repaint(boards["lkj-trade-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Trades listed"], "#59c97b"));
        if (step.id === "tell-a-partner-which-trade-suits") repaint(boards["lkj-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Choice shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["lkj-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-an-apprenticeship-is") paintGuide("Many trades, one build, one team.");
      },

      onHazard() {
        paintGuide("Stop. Tools are for trained hands.");
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
        if (it.id === "a-forklift-beeps-in-the-training-bay") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Class on the walkway, the forklift passed. The lesson carries on."); }
        if (it.id === "the-coordinator-asks-about-school-subjects") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Subjects named. The lesson carries on."); }
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
