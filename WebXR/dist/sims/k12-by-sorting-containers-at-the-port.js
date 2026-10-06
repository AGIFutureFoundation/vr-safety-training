import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Sorting Containers at the Port. Upper-primary maths at the Riverfront Wharves Terminal in Orleans Parish: sorting containers by a rule, grouping them by where they are going, stacking so the one needed first sits on top and the heaviest sit low, and checking a sort with a table, using only the model boxes and labels the scene shows.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BY_SORTING_CONTAINERS_AT_THE_PORT = {
  id: "k12-by-sorting-containers-at-the-port",
  index: "839",
  domain: "Education",
  trade: "Maths class at the port terminal with a yard planner — learner and container yard planner",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Sorting Containers at the Port",
  title: simTitle("Sorting Containers at the Port"),
  tagline: "Sort by where it is going, stack what leaves first on top — and heavy boxes go low",
  accent: 0xc0503e,
  accentCss: "#c0503e",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"yard-sorter","name":"Yard Sorter","note":"Sorted model containers by destination, stacked them so the first to leave sat on top and checked the sort with a table"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Yard Board",
    currency: "BOXES",
    ranks: ["Tallier","Sorter","Stacker","Checker","Yard Planner"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-the-label-tells-you") },
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
    "sort-by-colour": "You sorted the boxes by colour. A box's colour often shows which company owns it, not where it is going. The yard sorts by destination, read from the label, so each ship gets the right boxes.",
    "first-out-at-the-bottom": "You put the first box to leave at the bottom. To reach it, every box on top would have to be moved first. The yard stacks in reverse order, so the box that leaves first sits on top and comes off in one lift.",
    "heavy-on-top": "You put the heaviest box on top. A stack with its weight high up is wobbly, like a tower of books with the dictionary on top. Heavy boxes go low and lighter ones higher, so the stack stays steady.",
    "walk-under-a-lift": "You walked under a box that was being lifted. On a real terminal nobody ever stands under a load, and the model follows the same rule. Walk around the marked path and wait for the box to be set down."
  },

  lateNotes: {
    "byo-yard-log": "The sort table is written once the boxes are stacked — nothing to record yet.",
    "byo-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-what-the-label-tells-you",
      kind: "find",
      noHint: true,
      targets: [
        "byo-dest",
        "byo-ship",
        "byo-weight"
      ],
      itemNames: {
        "byo-dest": "where the box is going",
        "byo-ship": "which ship or train takes it",
        "byo-weight": "how heavy it is"
      },
      itemNotes: {
        "byo-dest": "The first thing a sort uses.",
        "byo-ship": "Boxes for one ship stay together.",
        "byo-weight": "Heavy boxes go low in a stack."
      },
      decoyNotes: {
        "byo-paint": "It often shows the owner, not where it is going."
      },
      title: "Find what the label tells you",
      cue: "Mark the three parts of a container's label a yard planner reads to sort it.",
      why: "Every container carries a label that answers the questions the yard needs. Where is it going? Which ship or train takes it? How heavy is it? With those three facts from the label, the planner can decide which pile it joins and where in the stack it goes, without ever opening the doors."
    },
    {
      id: "stand-on-the-walkway-behind-the",
      kind: "select",
      target: "byo-walkway-card",
      title: "Stand on the walkway behind the model yard",
      cue: "Take your place on the green walkway before the planner switches on the model crane.",
      why: "On a real terminal people walk only on marked paths, away from moving machines and lifted loads. The green walkway around the model yard follows the same rule. Standing there first means you can see the whole yard and the crane can work without anyone being in its way."
    },
    {
      id: "put-the-sorting-steps-in-order",
      kind: "sequence",
      targets: [
        "byo-ord-read",
        "byo-ord-group",
        "byo-ord-order",
        "byo-ord-stack"
      ],
      itemNames: {
        "byo-ord-read": "1 · read every label",
        "byo-ord-group": "2 · group boxes by destination",
        "byo-ord-order": "3 · order each group by when it leaves",
        "byo-ord-stack": "4 · stack them"
      },
      title: "Put the sorting steps in order",
      cue: "Read each label, group boxes by destination, order each group by when it leaves, then stack.",
      why: "Sorting works best in layers. Reading every label first means no box is misplaced. Grouping by destination puts boxes for the same ship together. Ordering each group by when it leaves tells you which goes on top. Stacking last means the stack is right the first time and nothing has to be moved twice.",
      outOfOrderNote: "Out of order. Read each box's label before you group anything."
    },
    {
      id: "hold-the-stop-sign-while-the",
      kind: "hold",
      target: "byo-stop-sign",
      seconds: 6,
      title: "Hold the stop sign while the crane moves",
      cue: "Hold the stop sign up until the model crane has set its box down.",
      why: "When a crane is lifting, a signal person keeps everyone back and watches the load. Holding the sign until the box is down shows you understand that the lift is not finished until it is on the ground. Real signal people hold their position through every lift, however many there are.",
      holdBreakNote: "You lowered the sign before the box was down. Hold it up until the lift is finished."
    },
    {
      id: "choose-the-sorting-rule",
      kind: "select",
      target: "byo-rule-card",
      title: "Choose the sorting rule",
      cue: "Choose the rule the yard uses to decide which pile each box joins.",
      why: "A sorting rule is a question you can answer the same way for every box. Where is it going? is the yard's rule, because it keeps each ship's boxes together. Choosing a clear rule, and using it for every box, is what sorting means in maths, whether you sort shapes, numbers or containers."
    },
    {
      id: "spot-the-mistakes-in-a-sample",
      kind: "find",
      noHint: true,
      targets: [
        "byo-yd-pile",
        "byo-yd-buried",
        "byo-yd-heavy"
      ],
      itemNames: {
        "byo-yd-pile": "a box in the wrong destination pile",
        "byo-yd-buried": "the first box to leave at the bottom",
        "byo-yd-heavy": "a heavy box on top of a stack"
      },
      itemNotes: {
        "byo-yd-pile": "Read its label again.",
        "byo-yd-buried": "Put it on top.",
        "byo-yd-heavy": "Move it lower."
      },
      decoyNotes: {
        "byo-yd-labels": "Good practice. Keep it."
      },
      title: "Spot the mistakes in a sample yard",
      cue: "Look at another group's model yard and mark each mistake.",
      why: "Yards go wrong in familiar ways: a box in the wrong destination pile, the first box to leave buried at the bottom, or a heavy box sitting on top. Spotting them in someone else's yard teaches you to check your own before the crane starts."
    },
    {
      id: "turn-the-crane-to-the-right",
      kind: "turn",
      target: "byo-crane-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "CRANE"
      },
      title: "Turn the crane to the right pile",
      cue: "Turn the model crane's dial until its arm points at the destination pile.",
      why: "The crane lifts one box at a time and must point at the right pile before it lowers. Turning it deliberately, and checking before you drop, means the box lands where the sort says. Real crane operators line up every move with care, because a box in the wrong place causes delays later."
    },
    {
      id: "lower-the-box-gently",
      kind: "gauge",
      target: "byo-lower-meter",
      gauge: {
        label: "LOWER",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Too fast or too far. Stop just above the stack, then set it down.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Lower the box gently",
      cue: "Commit when the box is just above the stack, ready to be set down gently.",
      why: "Setting a box down gently keeps the stack steady and protects what is inside. Stopping just above the stack and then lowering the last bit slowly is how operators land every box. In the model, a gentle landing keeps your careful sort from toppling over."
    },
    {
      id: "place-the-first-to-leave-box",
      kind: "drag",
      target: "byo-first-box",
      drag: {
        to: "byo-stack-top",
        radius: 0.45,
        missNote: "Not on top yet. The first box to leave goes on the top of its stack."
      },
      title: "Place the first-to-leave box on top",
      cue: "Drag the box that leaves first onto the top of its stack.",
      why: "The box that leaves first must be easy to reach. Putting it on top means one lift gets it out, with nothing to move. This idea, last in and first out, is used in stacks of plates, piles of homework and big container yards alike, and it saves time every single day."
    },
    {
      id: "follow-the-box-along-the-truck",
      kind: "track",
      target: "byo-lane-meter",
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
        label: "LANE",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Follow the box along the truck lane",
      cue: "Keep the marker on the box as the model truck carries it along the lane to the ship.",
      why: "After sorting, boxes travel to the ship or the train. Following one along its lane shows why a good sort matters: the right box arrives at the right place in the right order. Yard planners watch these movements all day and adjust the plan if anything is out of place.",
      holdBreakNote: "The marker lost the box. Find the truck again and follow it along the lane."
    },
    {
      id: "record-your-sort-in-a-table",
      kind: "select",
      target: "byo-yard-log",
      doneLine: "Sort recorded in a table",
      title: "Record your sort in a table",
      cue: "Write each box's destination, when it leaves and its place in the stack in a table.",
      why: "A table shows the whole sort at a glance and lets anyone check it. If a box is in the wrong place, the table shows it straight away. Yard planners keep a table like this for every stack, so the crane operators and truck drivers all work from the same plan."
    },
    {
      id: "check-your-sort-with-the-planner",
      kind: "select",
      target: "byo-share-board",
      doneLine: "Sort checked",
      title: "Check your sort with the planner",
      cue: "Show your table to the yard planner and ask if they would stack it the same way.",
      why: "The planner sorts real boxes every day and knows the tricks. Checking with them tests your rule and your stacking order. If they would do something differently, ask why; the answer usually teaches a new idea, like keeping a lane clear for a late arrival."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "byo-checkin",
      doneLine: "Checked in",
      title: "Check in on the walkway",
      cue: "What rule did you sort by? Where else could you use last in, first out?",
      why: "The yard crew ends every shift by checking the stacks together, so the class ends by checking in on the walkway. Each learner names the sorting rule and one place at home or school where last in, first out helps. If anyone still sorts by colour, the group reads the labels together once more."
    }
  ],

  interrupts: [
    {
      id: "a-model-truck-enters-the-lane",
      kind: "Truck moving",
      after: "hold-the-stop-sign-while-the",
      delay: 3,
      seconds: 12,
      target: "byo-stay-on-walkway",
      alert: "A model truck rolls into the lane beside the walkway.",
      cue: "Stay on the green walkway and keep your hands out of the lane.",
      why: "Lanes are for trucks and walkways are for people, on a model yard and a real one. Keeping to the walkway lets the truck pass safely. The sort can wait a moment while it goes by.",
      missNote: "A classmate reached into the lane, and the model truck had to stop until everyone was back on the walkway.",
      wrongNote: "That puts hands in the truck lane. Stay on the walkway. Choose the response that deals with it now."
    },
    {
      id: "the-planner-asks-which-box-goes-on-top",
      kind: "Planner question",
      after: "follow-the-box-along-the-truck",
      delay: 3,
      seconds: 12,
      target: "byo-say-top",
      alert: "The planner points to a stack and asks which box should be on top.",
      cue: "Say that the box leaving first goes on top so it comes off in one lift.",
      why: "Explaining the stacking rule shows you understand why, not just what. The reason, saving lifts and time, is what makes the rule worth following. Planners ask new crew members the same question on their first day.",
      missNote: "You picked a box without a reason, and the planner had to explain last in, first out before the group could go on.",
      wrongNote: "That does not give the rule or the reason. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0xc0503e;
    const CSS = "#c0503e";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#74716c", base2: "#66635e", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#ecdcd8", base2: "#dccac4", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "byo-dest", "where the box is going", {});
    bead(-1.42, 1.18, -0.62, "byo-ship", "which ship or train takes it", {});
    bead(-1.03, 1.46, -0.71, "byo-weight", "how heavy it is", {});
    bead(-1.08, 0.9, -1.11, "byo-paint", "the box's paint colour", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "byo-ord-read", "1 · read every label", {});
    bead(-0.58, 1.46, -1.44, "byo-ord-group", "2 · group boxes by destination", {});
    bead(-0.24, 0.9, -1.23, "byo-ord-order", "3 · order each group by when it leaves", {});
    bead(0, 1.18, -1.55, "byo-ord-stack", "4 · stack them", {});
    bead(0.24, 1.46, -1.23, "byo-stop-sign", "Hold the stop sign", {});
    bead(0.58, 0.9, -1.44, "byo-yd-pile", "a box in the wrong destination pile", {});
    bead(0.68, 1.18, -1.05, "byo-yd-buried", "the first box to leave at the bottom", {});
    bead(1.08, 1.46, -1.11, "byo-yd-heavy", "a heavy box on top of a stack", {});
    bead(1.03, 0.9, -0.71, "byo-yd-labels", "every pile clearly labelled", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "byo-stay-on-walkway", "Stay on the walkway and let the truck pass", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "byo-say-top", "Say which box goes on top and why", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "byo-walkway-card", "On the walkway", "GREEN\nWALKWAY", { ry: 1.2 });
    dials["byo-crane-dial"] = dial(-1.89, -1.4, 0.93, "byo-crane-dial", "Crane arm");
    meters["byo-lower-meter"] = meter(-1.45, -1.85, 0.67, "byo-lower-meter", "Box height");
    tokens["byo-first-box"] = token(-0.92, -2.16, 0.4, "byo-first-box", "First-to-leave box");
    spots["byo-stack-top"] = spot(-0.31, -2.33, 0.13, "byo-stack-top", "Top of the stack");
    card(0.31, 1.35, -2.33, "byo-rule-card", "Choose the rule", "WHICH\nRULE?", { ry: -0.13 });
    meters["byo-lane-meter"] = meter(0.92, -2.16, -0.4, "byo-lane-meter", "Box followed");
    boards["byo-yard-log"] = board(1.45, -1.85, -0.67, "byo-yard-log", "Sort table");
    boards["byo-share-board"] = board(1.89, -1.4, -0.93, "byo-share-board", "Check with the planner");
    boards["byo-checkin"] = board(2.19, -0.85, -1.2, "byo-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "sort-by-colour", "Sort the boxes by their paint colour?", "BY\nCOLOUR", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "first-out-at-the-bottom", "Put the box that leaves first at the bottom of the stack?", "FIRST\nAT BOTTOM", 0.3);
    hazardCard(0.58, 0.72, -1.86, "heavy-on-top", "Stack the heaviest box on the top?", "HEAVY\nON TOP", -0.3);
    hazardCard(1.53, 0.72, -1.21, "walk-under-a-lift", "Walk under the model crane's box to reach the other side?", "UNDER\nTHE LOAD", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Read the label; sort by where it is going."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Container yard planner", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Signal person", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-model-truck-enters-the-lane"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-model-truck-enters-the-lane"].visible = false;
    arrivals["the-planner-asks-which-box-goes-on-top"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-planner-asks-which-box-goes-on-top"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-first-to-leave-box") { const s = spots["byo-stack-top"]; tokens["byo-first-box"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-your-sort-in-a-table") repaint(boards["byo-yard-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Sort recorded in a table"], "#59c97b"));
        if (step.id === "check-your-sort-with-the-planner") repaint(boards["byo-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Sort checked"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["byo-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "choose-the-sorting-rule") paintGuide("First to leave sits on top.");
      },

      onHazard() {
        paintGuide("Stop. Heavy goes low — and never under a load.");
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
        if (it.id === "a-model-truck-enters-the-lane") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Walkway kept clear, the truck passed. The lesson carries on."); }
        if (it.id === "the-planner-asks-which-box-goes-on-top") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Top box and reason given. The lesson carries on."); }
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
