import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — A Household Budget and a First Paycheck. Lower- and upper-secondary maths for life: percentages on a first pay slip and a month's budget, using only the amounts the scene's own slip and bills show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_HOUSEHOLD_BUDGET_AND_FIRST_PAYCHECK = {
  id: "k12-household-budget-and-first-paycheck",
  index: "805",
  domain: "Education",
  trade: "Maths class at the community centre's money desk — learner and teacher",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "A Household Budget and a First Paycheck",
  title: simTitle("A Household Budget and a First Paycheck"),
  tagline: "Read the slip, find the percentage, plan the month — and keep something back for the unexpected",
  accent: 0x5a9fd8,
  accentCss: "#5a9fd8",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"month-planned","name":"Month Planned","note":"Pay slip read, percentages worked and a budget that balances with something saved"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Budget Board",
    currency: "COINS",
    ranks: ["Saver","Planner","Budgeter","Adviser","Treasurer"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-parts-of-the-pay") },
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
    "plan-with-the-gross-pay": "You planned the month with the pay before deductions. The money that actually arrives is the net pay, after tax and other deductions are taken; a budget built on the bigger figure runs out before the month does. Every budget starts from what reaches the account.",
    "percentage-of-the-wrong-total": "You worked out the percentage of the wrong total. A percentage always means a part of a particular whole, so the first question is: per cent of what? Taking it of the net pay when the slip means the gross, or the reverse, gives an answer that looks right and is not.",
    "no-money-kept-back": "You planned to spend every coin. A month always brings something unexpected, and a budget with nothing kept back turns a small surprise into borrowing; setting a part aside first is the habit that makes a budget survive real life.",
    "share-the-account-details": "You read your account details aloud to the group. Personal financial details are private even in a practice lesson, and the habit of keeping them private is part of what the lesson teaches; the practice slip uses made-up details for exactly this reason."
  },

  lateNotes: {
    "kbp-budget-log": "The budget record is written once the budget balances — nothing to record yet.",
    "kbp-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-the-parts-of-the-pay",
      kind: "find",
      noHint: true,
      targets: [
        "kbp-gross",
        "kbp-deductions",
        "kbp-net"
      ],
      itemNames: {
        "kbp-gross": "the gross pay",
        "kbp-deductions": "the deductions",
        "kbp-net": "the net pay"
      },
      itemNotes: {
        "kbp-gross": "What was earned before anything is taken. Not what arrives.",
        "kbp-deductions": "What is taken first. Gross minus deductions gives net.",
        "kbp-net": "What actually reaches the account. The budget starts here."
      },
      decoyNotes: {
        "kbp-employer-logo": "The logo says who paid, not how much arrived. Stick to the numbers."
      },
      title: "Find the parts of the pay slip",
      cue: "Mark the three parts of the practice pay slip you need before you can plan anything.",
      why: "A pay slip is a small table of arithmetic. The gross pay is what was earned, the deductions are what is taken before it reaches you, and the net pay is what arrives. Finding all three first stops you planning with the wrong number, which is the commonest mistake a first-time earner makes."
    },
    {
      id: "put-the-budget-steps-in-order",
      kind: "sequence",
      targets: [
        "kbp-ord-net",
        "kbp-ord-needs",
        "kbp-ord-save",
        "kbp-ord-wants"
      ],
      itemNames: {
        "kbp-ord-net": "1 · start from the net pay",
        "kbp-ord-needs": "2 · cover the needs",
        "kbp-ord-save": "3 · set something aside",
        "kbp-ord-wants": "4 · plan the wants"
      },
      title: "Put the budget steps in order",
      cue: "Net pay first, then needs, then something saved, then wants.",
      why: "The order is what makes a budget work. Starting from the net pay tells you what you actually have; covering needs such as rent, food and travel comes next because they cannot be skipped; setting something aside before the wants means saving actually happens, instead of being whatever is left.",
      outOfOrderNote: "Out of order. Start from what actually arrives, then the needs, before anything else."
    },
    {
      id: "keep-your-practice-details-private",
      kind: "select",
      target: "kbp-private-card",
      title: "Keep your practice details private",
      cue: "Turn the slip face down when you are not working on it.",
      why: "Keeping personal financial details private is a life skill in its own right, and it starts in practice. The slip uses made-up details, but turning it face down when you are not working on it builds the same habit you will need with a real slip, a bank card or a message asking for account details."
    },
    {
      id: "turn-the-fraction-into-a-percentage",
      kind: "turn",
      target: "kbp-percent-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "PER CENT"
      },
      title: "Turn the fraction into a percentage",
      cue: "Turn the dial from the fraction of pay spent on rent to the same amount as a percentage.",
      why: "A percentage is a fraction out of a hundred, which is why it makes different amounts easy to compare. Turning the fraction of pay spent on rent into a percentage lets you compare it with advice or with a friend's budget, even when the pay is different."
    },
    {
      id: "choose-a-realistic-amount-to-set",
      kind: "gauge",
      target: "kbp-save-meter",
      gauge: {
        label: "SAVE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Too little and a surprise sinks the month; too much and the needs go unpaid. Try again."
      },
      title: "Choose a realistic amount to set aside",
      cue: "Commit when the amount saved is realistic: enough to matter, not so much the needs go unpaid.",
      why: "Saving too little leaves nothing for a surprise; saving so much that the needs go unpaid leads to borrowing, which undoes the saving. A realistic amount is one the month can actually bear, and it is the same judgement adults make every month."
    },
    {
      id: "add-up-the-bills-without-skipping",
      kind: "hold",
      target: "kbp-add-bills",
      seconds: 6,
      title: "Add up the bills without skipping one",
      cue: "Hold your place and add the bills on the table one by one.",
      why: "Adding a column of bills is easy to get wrong by skipping one or counting one twice. Working through them one by one, keeping your place, gives a total you can trust; it is the same care anyone takes with a real month's bills, where one forgotten bill can undo the whole plan.",
      holdBreakNote: "You lost your place and skipped a bill. Go back to the last one you are sure of."
    },
    {
      id: "cover-the-surprise-from-the-buffer",
      kind: "drag",
      target: "kbp-surprise-token",
      drag: {
        to: "kbp-buffer-spot",
        radius: 0.45,
        missNote: "It is not covered yet. Take it all the way to what you kept back."
      },
      title: "Cover the surprise from the buffer",
      cue: "A surprise cost arrives. Drag it onto the amount you kept back.",
      why: "This is what the kept-back amount is for. Covering a surprise from the buffer, rather than from the needs or by borrowing, shows the plan working exactly as designed, and it is why every budget keeps something in reserve."
    },
    {
      id: "spot-the-problems-in-a-classmate",
      kind: "find",
      noHint: true,
      targets: [
        "kbp-bud-gross",
        "kbp-bud-wrong-percent",
        "kbp-bud-no-buffer"
      ],
      itemNames: {
        "kbp-bud-gross": "a plan built on the gross pay",
        "kbp-bud-wrong-percent": "a percentage of the wrong total",
        "kbp-bud-no-buffer": "nothing kept back"
      },
      itemNotes: {
        "kbp-bud-gross": "The plan has to start from what arrives, the net pay.",
        "kbp-bud-wrong-percent": "Per cent of what? Check the whole the percentage belongs to.",
        "kbp-bud-no-buffer": "One surprise and this budget is borrowing."
      },
      decoyNotes: {
        "kbp-bud-needs-first": "Needs before wants is right. Keep it."
      },
      title: "Spot the problems in a classmate's budget",
      cue: "Look at the draft budget and mark each problem before it is handed in.",
      why: "Checking someone else's budget trains you to see the traps in your own. The usual problems are planning from the gross pay, a percentage taken of the wrong total and nothing kept back for surprises. Each one looks fine on paper until the month begins."
    },
    {
      id: "check-the-budget-balances",
      kind: "select",
      target: "kbp-check-card",
      title: "Check the budget balances",
      cue: "Check that everything planned adds up to the net pay, no more.",
      why: "A budget balances when everything planned adds up to what arrives. Checking it before the month starts, rather than finding out at the end, is what separates a plan from a hope, and it is the same check a business does with its own accounts."
    },
    {
      id: "keep-spending-on-plan-through-the",
      kind: "track",
      target: "kbp-track-meter",
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
        label: "ON PLAN"
      },
      title: "Keep spending on plan through the month",
      cue: "Hold spending in band with the plan as the weeks go by.",
      why: "A plan only works if spending follows it. Checking spending against the plan as the month goes on catches drift early, when a small change fixes it, rather than at the end when the money has gone.",
      holdBreakNote: "Spending drifted off the plan. Look at what changed and bring it back before the month ends."
    },
    {
      id: "record-the-budget-and-the-working",
      kind: "select",
      target: "kbp-budget-log",
      doneLine: "Budget and working recorded",
      title: "Record the budget and the working",
      cue: "Write down the net pay, the percentages, the buffer and how the surprise was covered.",
      why: "A written budget, with the working shown, can be checked and improved next month. Recording how the surprise was covered shows the buffer earning its place, which is the lesson most worth keeping."
    },
    {
      id: "share-one-budgeting-tip",
      kind: "select",
      target: "kbp-share-board",
      doneLine: "Tips shared",
      title: "Share one budgeting tip",
      cue: "Tell the class one thing that made your budget work.",
      why: "Sharing a tip helps classmates who found it hard, and saying it out loud fixes it in your own memory. The best tips are simple and anyone can use them, like starting from the net pay or keeping something back."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kbp-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "How did the budget go? What was hard, and what would you try next time?",
      why: "A short check-in at the end tells the teacher who is confident and who needs another go, and it gives every learner a moment to notice what they learned. Nobody is graded here, and the teacher or a trusted adult is there for anyone who found the lesson hard and wants to talk it through."
    }
  ],

  interrupts: [
    {
      id: "a-message-asks-for-card-details",
      kind: "Suspicious message",
      after: "add-up-the-bills-without-skipping",
      delay: 3,
      seconds: 12,
      target: "kbp-ignore-and-tell",
      alert: "A message pops up on the practice tablet saying your pay is on hold unless you send your card details.",
      cue: "Do not reply or click anything; show the teacher.",
      why: "A message that creates urgency and asks for card details is a classic scam. The right response is always the same: do not reply, do not click, and show a trusted adult. Real employers and banks do not ask for details that way.",
      missNote: "Nobody told the teacher, and a classmate typed made-up details in to see what would happen.",
      wrongNote: "That engages with the message. Do not reply; show the teacher."
    },
    {
      id: "the-adviser-asks-what-percentage-rent-is",
      kind: "Adviser question",
      after: "keep-spending-on-plan-through-the",
      delay: 3,
      seconds: 12,
      target: "kbp-say-the-percentage",
      alert: "The community centre adviser asks what percentage of your pay goes on rent.",
      cue: "Say the percentage and which pay it is a percentage of.",
      why: "The adviser wants two things: the percentage and what it is a percentage of. Saying both shows you understand that a percentage without its whole is meaningless, which is the idea the whole lesson rests on.",
      missNote: "You gave a percentage without saying of what, and the adviser could not tell whether it was right.",
      wrongNote: "That leaves out what it is a percentage of. Say both. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x5a9fd8;
    const CSS = "#5a9fd8";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7a7d80", base2: "#6c6f72", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e8e2d4", base2: "#dcd6c8", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "kbp-gross", "the gross pay", {});
    bead(-1.42, 1.18, -0.62, "kbp-deductions", "the deductions", {});
    bead(-1.03, 1.46, -0.71, "kbp-net", "the net pay", {});
    bead(-1.08, 0.9, -1.11, "kbp-employer-logo", "the employer's logo", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kbp-ord-net", "1 · start from the net pay", {});
    bead(-0.58, 1.46, -1.44, "kbp-ord-needs", "2 · cover the needs", {});
    bead(-0.24, 0.9, -1.23, "kbp-ord-save", "3 · set something aside", {});
    bead(0, 1.18, -1.55, "kbp-ord-wants", "4 · plan the wants", {});
    bead(0.24, 1.46, -1.23, "kbp-add-bills", "Adding the bills on the table", {});
    bead(0.58, 0.9, -1.44, "kbp-bud-gross", "a plan built on the gross pay", {});
    bead(0.68, 1.18, -1.05, "kbp-bud-wrong-percent", "a percentage of the wrong total", {});
    bead(1.08, 1.46, -1.11, "kbp-bud-no-buffer", "nothing kept back", {});
    bead(1.03, 0.9, -0.71, "kbp-bud-needs-first", "needs listed first", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kbp-ignore-and-tell", "Do not reply, tell the teacher", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kbp-say-the-percentage", "Say the rent percentage and of what", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kbp-private-card", "Keep your details private", "KEEP IT\nPRIVATE", { ry: 1.2 });
    dials["kbp-percent-dial"] = dial(-1.89, -1.4, 0.93, "kbp-percent-dial", "Fraction to percentage");
    meters["kbp-save-meter"] = meter(-1.45, -1.85, 0.67, "kbp-save-meter", "Amount set aside");
    tokens["kbp-surprise-token"] = token(-0.92, -2.16, 0.4, "kbp-surprise-token", "Unexpected cost");
    spots["kbp-buffer-spot"] = spot(-0.31, -2.33, 0.13, "kbp-buffer-spot", "Covered from what was kept back");
    card(0.31, 1.35, -2.33, "kbp-check-card", "Check it balances", "IN = OUT?", { ry: -0.13 });
    meters["kbp-track-meter"] = meter(0.92, -2.16, -0.4, "kbp-track-meter", "Spending against the plan");
    boards["kbp-budget-log"] = board(1.45, -1.85, -0.67, "kbp-budget-log", "Budget record");
    boards["kbp-share-board"] = board(1.89, -1.4, -0.93, "kbp-share-board", "Share with the class");
    boards["kbp-checkin"] = board(2.19, -0.85, -1.2, "kbp-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "plan-with-the-gross-pay", "Plan the month with the pay before deductions?", "SPEND THE\nGROSS", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "percentage-of-the-wrong-total", "Take the percentage of the wrong amount?", "PERCENT OF\nANYTHING", 0.3);
    hazardCard(0.58, 0.72, -1.86, "no-money-kept-back", "Spend every last coin on the plan?", "NOTHING\nKEPT BACK", -0.3);
    hazardCard(1.53, 0.72, -1.21, "share-the-account-details", "Read your account details aloud to the group?", "READ OUT\nMY DETAILS", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Gross, deductions, net. Then plan."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Community centre adviser", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Teaching assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-message-asks-for-card-details"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-message-asks-for-card-details"].visible = false;
    arrivals["the-adviser-asks-what-percentage-rent-is"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-adviser-asks-what-percentage-rent-is"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "cover-the-surprise-from-the-buffer") { const s = spots["kbp-buffer-spot"]; tokens["kbp-surprise-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-budget-and-the-working") repaint(boards["kbp-budget-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Budget and working recorded"], "#59c97b"));
        if (step.id === "share-one-budgeting-tip") repaint(boards["kbp-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Tips shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kbp-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "check-the-budget-balances") paintGuide("Needs first, a little saved, then wants.");
      },

      onHazard() {
        paintGuide("Stop. Check which number that percentage is of.");
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
        if (it.id === "a-message-asks-for-card-details") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Shown to the teacher and closed. That is how a real one is handled too."); }
        if (it.id === "the-adviser-asks-what-percentage-rent-is") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Percentage and whole given. The adviser can check it."); }
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
