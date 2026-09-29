import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — A Family Readiness Plan. Upper-primary life skills at the Parish School Campus in St. Bernard Parish: a readiness plan a family makes together before storm season — who helps, what goes in the go-bag, where to meet and where to go — written down, shared and practised calmly, using only the planning cards the scene shows.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BY_A_FAMILY_READINESS_PLAN = {
  id: "k12-by-a-family-readiness-plan",
  index: "833",
  domain: "Education",
  trade: "Life-skills class in the school hall with the parish readiness team — learner and school nurse",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "A Family Readiness Plan",
  title: simTitle("A Family Readiness Plan"),
  tagline: "Who helps, what to pack, where to go — made together, written down and practised before it is needed",
  accent: 0xd49a3a,
  accentCss: "#d49a3a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"ready-together","name":"Ready Together","note":"Made a family readiness plan with helpers, a packed go-bag list, a meeting place and a way to go, and practised it with a classmate"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Ready Board",
    currency: "PLANS",
    ranks: ["Listener","Packer","Planner","Helper","Neighbour"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-four-parts-of-a") },
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
    "plan-in-one-head": "You left the plan in one person's head. If that person is at work or busy, nobody else knows what to do. A plan works when it is written down, kept where everyone can find it and talked through by the whole family.",
    "pack-only-fun-things": "You filled the go-bag with games and snacks. A comfort item is a good idea, but the bag also needs water, medicines, copies of important papers, a torch, a phone charger and clothes. The list comes first; then there is room for a favourite toy.",
    "believe-every-message": "You acted on a forwarded message without checking it. Families follow the parish's own announcements and trusted local news, and ask a grown-up when something sounds odd. Checking the source keeps the plan calm and correct.",
    "forget-the-pets": "You left the pet out of the plan. Pets need food, water, a lead or carrier and a place that welcomes them. Adding them to the plan early means nobody has to make hard choices in a hurry later."
  },

  lateNotes: {
    "byf-plan-log": "The plan card is written once the group has talked and practised — nothing to write yet.",
    "byf-checkin": "The check-in comes at the very end of the session."
  },

  steps: [
    {
      id: "find-the-four-parts-of-a",
      kind: "find",
      noHint: true,
      targets: [
        "byf-helpers",
        "byf-gobag",
        "byf-meet"
      ],
      itemNames: {
        "byf-helpers": "the list of people who help",
        "byf-gobag": "the go-bag checklist",
        "byf-meet": "the meeting place card"
      },
      itemNotes: {
        "byf-helpers": "Family, neighbours and trusted grown-ups.",
        "byf-gobag": "What we pack ahead of time.",
        "byf-meet": "Where we find each other."
      },
      decoyNotes: {
        "byf-poster": "Fun to read, but it is not part of the plan."
      },
      title: "Find the four parts of a readiness plan",
      cue: "Mark three of the plan's parts on the planning wall: who helps, what to pack and where to meet.",
      why: "A good readiness plan answers a few clear questions. Who can help us, and whom do we help? What goes in the go-bag? Where do we meet if we are apart? Seeing those parts on the wall shows that a plan is not one huge job, it is a set of small answers a family works out together."
    },
    {
      id: "sit-with-your-planning-group",
      kind: "select",
      target: "byf-group-card",
      title: "Sit with your planning group",
      cue: "Join your planning group at the table before the nurse hands out the cards.",
      why: "Making a plan is teamwork, so the class works in small groups just like a family would. Sitting together at one table means everyone can see the cards and have a say. In a real family, every person, even the youngest, has a job in the plan, and that starts with being part of the talk."
    },
    {
      id: "put-the-planning-steps-in-order",
      kind: "sequence",
      targets: [
        "byf-ord-talk",
        "byf-ord-write",
        "byf-ord-pack",
        "byf-ord-practise"
      ],
      itemNames: {
        "byf-ord-talk": "1 · talk it through as a family",
        "byf-ord-write": "2 · write the plan down",
        "byf-ord-pack": "3 · pack the go-bag",
        "byf-ord-practise": "4 · practise the plan"
      },
      title: "Put the planning steps in order",
      cue: "Talk it through, write it down, pack the go-bag, then practise the plan.",
      why: "Talking first lets everyone share ideas and worries. Writing it down turns those ideas into something anyone can follow. Packing the go-bag ahead of time means it is ready when needed. Practising last shows what works and what is missing, so the family can fix it on a calm day.",
      outOfOrderNote: "Out of order. Talk the plan through together before anything is written down."
    },
    {
      id: "listen-to-each-persons-idea",
      kind: "hold",
      target: "byf-talk-stick",
      seconds: 6,
      title: "Listen to each person's idea",
      cue: "Hold the talking stick steady while your classmate shares their idea, and do not interrupt.",
      why: "Everyone in a family notices different things. A younger child might remember the pet's medicine; a grandparent might know a neighbour who needs help. Listening fully, without jumping in, is how a plan picks up those ideas. Good listening is a readiness skill just like packing a bag.",
      holdBreakNote: "The talking stick moved before your classmate finished. Let them finish their idea."
    },
    {
      id: "choose-a-trusted-place-to-get",
      kind: "select",
      target: "byf-source-card",
      title: "Choose a trusted place to get updates",
      cue: "Choose the source your family will use to hear updates from the parish.",
      why: "When weather is on the way, lots of messages go round. Some are helpful and some are wrong. Choosing ahead of time to follow the parish's own announcements and trusted local news means your family hears the same calm, correct information, and knows whom to believe."
    },
    {
      id: "spot-what-is-missing-from-a",
      kind: "find",
      noHint: true,
      targets: [
        "byf-bag-water",
        "byf-bag-meds",
        "byf-bag-charger"
      ],
      itemNames: {
        "byf-bag-water": "bottled water",
        "byf-bag-meds": "medicines the family needs",
        "byf-bag-charger": "a phone charger"
      },
      itemNotes: {
        "byf-bag-water": "Pack enough for everyone.",
        "byf-bag-meds": "Ask a grown-up to pack them.",
        "byf-bag-charger": "So the family can stay in touch."
      },
      decoyNotes: {
        "byf-bag-torch": "Good — it is on the list and already packed."
      },
      title: "Spot what is missing from a sample go-bag",
      cue: "Look at the sample go-bag on the table and mark each thing it still needs.",
      why: "Checking a bag against the list shows what is easy to forget. Water, medicines and a phone charger are often missed because they are used every day and not thought of as supplies. Finding the gaps on a sample bag trains you to check your own family's bag the same careful way."
    },
    {
      id: "turn-the-map-to-face-the",
      kind: "turn",
      target: "byf-map-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "MAP"
      },
      title: "Turn the map to face the way you will go",
      cue: "Turn the map dial until your route to the meeting place points the right way.",
      why: "A map is easiest to follow when it faces the same way you are going. Turning it to match the real streets means left on the map is left in the street. Families practise their route so that on the day, going there feels familiar and calm rather than new and confusing."
    },
    {
      id: "choose-when-to-leave",
      kind: "gauge",
      target: "byf-leave-meter",
      gauge: {
        label: "LEAVE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the early point. Leave when the plan says, not at the last minute.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Choose when to leave",
      cue: "Commit when the marker reaches the point on the plan's timeline where the family leaves early.",
      why: "Leaving early, when the parish advises it, gives a family time to travel calmly and to help others on the way. Picking that point on the timeline before the day comes means nobody has to argue about it later. An early start is one of the kindest choices a family can make for itself."
    },
    {
      id: "put-the-plan-where-everyone-can",
      kind: "drag",
      target: "byf-plan-card",
      drag: {
        to: "byf-fridge",
        radius: 0.45,
        missNote: "Not on the fridge yet. Put the plan where the whole family will see it."
      },
      title: "Put the plan where everyone can find it",
      cue: "Drag the finished plan card to the fridge door on the model kitchen.",
      why: "A plan in a drawer is easy to lose. On the fridge, or another place everyone sees every day, it stays in mind and is easy to grab. Families also keep a copy in the go-bag and on a grown-up's phone, so the plan is there wherever they are."
    },
    {
      id: "walk-the-practice-route-with-your",
      kind: "track",
      target: "byf-route-meter",
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
        label: "ROUTE",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Walk the practice route with your group",
      cue: "Keep the marker on the route line as your group walks to the meeting place on the floor map.",
      why: "Practising the route shows whether it really works: a street that is often busy, a turn that is easy to miss. Walking it together, and staying on the line, lets the family spot problems and change the plan on a calm day. Practice is what turns a plan on paper into something everyone knows.",
      holdBreakNote: "The group drifted off the route. Find the line again and follow it to the meeting place."
    },
    {
      id: "write-your-groups-plan",
      kind: "select",
      target: "byf-plan-log",
      doneLine: "Plan card written",
      title: "Write your group's plan",
      cue: "Fill in the plan card: helpers, go-bag list, meeting place, where to go and the trusted source.",
      why: "Writing it all on one card means the plan can be read by anyone, even a babysitter or a visiting cousin. Clear words and a tidy list make it quick to follow. Your group's card is a model you can take home and fill in with your own family."
    },
    {
      id: "explain-your-plan-to-another-group",
      kind: "select",
      target: "byf-share-board",
      doneLine: "Plan shared and improved",
      title: "Explain your plan to another group",
      cue: "Read your plan card to another group and ask them what they would add.",
      why: "Another group will notice things yours missed, just as a neighbour might. Asking what they would add makes the plan stronger. Sharing plans is also how neighbours learn to help each other, which is one of the best parts of being ready together."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "byf-checkin",
      doneLine: "Checked in",
      title: "Check in with the nurse before you go",
      cue: "How do you feel about making a plan at home? Who will you talk to about it first?",
      why: "Talking about storms can bring up feelings, and that is normal. The school nurse ends the session by asking each learner how they feel and who they will share the plan with. Anyone who feels worried can say so, and the nurse or teacher will help them take the plan home in a way that feels good."
    }
  ],

  interrupts: [
    {
      id: "a-classmate-feels-worried",
      kind: "Classmate worry",
      after: "listen-to-each-persons-idea",
      delay: 3,
      seconds: 12,
      target: "byf-tell-teacher",
      alert: "A classmate in your group goes quiet and says they feel worried about storms.",
      cue: "Tell the teacher kindly so they can help your classmate.",
      why: "Feeling worried is normal, and a trusted grown-up can help. Telling the teacher kindly, without making a fuss, means your classmate gets support. Being ready includes looking after each other's feelings, not just packing bags.",
      missNote: "Nobody told the teacher, and your classmate stayed worried and quiet for the rest of the planning session.",
      wrongNote: "That does not get your classmate help. Tell the teacher kindly. Choose the response that deals with it now."
    },
    {
      id: "the-nurse-asks-who-helps",
      kind: "Nurse question",
      after: "walk-the-practice-route-with-your",
      delay: 3,
      seconds: 12,
      target: "byf-name-helper",
      alert: "The nurse asks your group to name one person your plan says can help.",
      cue: "Name a helper from the plan and say how to reach them.",
      why: "A helper's name is only useful if you know how to reach them. Saying the name and the way to contact them shows the plan is real and ready. Families write these on the plan card so nobody has to remember them on the day.",
      missNote: "Your group could not name a helper or say how to reach one, and the nurse sent you back to the plan card.",
      wrongNote: "That does not name a helper or how to reach them. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0xd49a3a;
    const CSS = "#d49a3a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7c7466", base2: "#6e675a", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#ece4d4", base2: "#ddd4c0", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "byf-helpers", "the list of people who help", {});
    bead(-1.42, 1.18, -0.62, "byf-gobag", "the go-bag checklist", {});
    bead(-1.03, 1.46, -0.71, "byf-meet", "the meeting place card", {});
    bead(-1.08, 0.9, -1.11, "byf-poster", "a school sports poster", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "byf-ord-talk", "1 · talk it through as a family", {});
    bead(-0.58, 1.46, -1.44, "byf-ord-write", "2 · write the plan down", {});
    bead(-0.24, 0.9, -1.23, "byf-ord-pack", "3 · pack the go-bag", {});
    bead(0, 1.18, -1.55, "byf-ord-practise", "4 · practise the plan", {});
    bead(0.24, 1.46, -1.23, "byf-talk-stick", "Hold the talking stick", {});
    bead(0.58, 0.9, -1.44, "byf-bag-water", "bottled water", {});
    bead(0.68, 1.18, -1.05, "byf-bag-meds", "medicines the family needs", {});
    bead(1.08, 1.46, -1.11, "byf-bag-charger", "a phone charger", {});
    bead(1.03, 0.9, -0.71, "byf-bag-torch", "a torch already in the bag", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "byf-tell-teacher", "Tell the teacher your classmate feels worried", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "byf-name-helper", "Name a helper from your plan", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "byf-group-card", "Join your group", "PLANNING\nGROUP", { ry: 1.2 });
    dials["byf-map-dial"] = dial(-1.89, -1.4, 0.93, "byf-map-dial", "Map turned to the route");
    meters["byf-leave-meter"] = meter(-1.45, -1.85, 0.67, "byf-leave-meter", "When to leave");
    tokens["byf-plan-card"] = token(-0.92, -2.16, 0.4, "byf-plan-card", "Finished plan");
    spots["byf-fridge"] = spot(-0.31, -2.33, 0.13, "byf-fridge", "The fridge door");
    card(0.31, 1.35, -2.33, "byf-source-card", "Choose a trusted source", "TRUSTED\nUPDATES", { ry: -0.13 });
    meters["byf-route-meter"] = meter(0.92, -2.16, -0.4, "byf-route-meter", "Route followed");
    boards["byf-plan-log"] = board(1.45, -1.85, -0.67, "byf-plan-log", "Plan card");
    boards["byf-share-board"] = board(1.89, -1.4, -0.93, "byf-share-board", "Share with a group");
    boards["byf-checkin"] = board(2.19, -0.85, -1.2, "byf-checkin", "End-of-session check-in");
    hazardCard(-1.53, 0.72, -1.21, "plan-in-one-head", "Keep the plan in one grown-up's head?", "IN ONE\nHEAD", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "pack-only-fun-things", "Fill the go-bag with games and snacks only?", "ONLY\nGAMES", 0.3);
    hazardCard(0.58, 0.72, -1.86, "believe-every-message", "Follow a message a friend forwarded without checking it?", "FORWARDED\nMESSAGE", -0.3);
    hazardCard(1.53, 0.72, -1.21, "forget-the-pets", "Leave the family pet out of the plan?", "NO PET\nPLAN", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Who helps, what to pack, where to go."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Class teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "School nurse", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Parish readiness volunteer", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-classmate-feels-worried"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-classmate-feels-worried"].visible = false;
    arrivals["the-nurse-asks-who-helps"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-nurse-asks-who-helps"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "put-the-plan-where-everyone-can") { const s = spots["byf-fridge"]; tokens["byf-plan-card"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "write-your-groups-plan") repaint(boards["byf-plan-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Plan card written"], "#59c97b"));
        if (step.id === "explain-your-plan-to-another-group") repaint(boards["byf-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Plan shared and improved"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["byf-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "choose-a-trusted-place-to-get") paintGuide("Written down, shared, practised.");
      },

      onHazard() {
        paintGuide("Stop. Check the source — ask a grown-up.");
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
        if (it.id === "a-classmate-feels-worried") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Teacher told, classmate supported. The lesson carries on."); }
        if (it.id === "the-nurse-asks-who-helps") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Helper named with a way to reach them. The lesson carries on."); }
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
