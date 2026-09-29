import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — A Shrimp Boat's Fair Count. Upper-primary maths at the Shell Beach Oyster and Shrimp Harbour in St. Bernard Parish: counting a catch fairly by taking sample scoops from all over the bin, keeping a tally, repeating and finding the average, and using the sample to estimate the whole, using only the scoops and the tally board the scene shows.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BY_A_SHRIMP_BOATS_FAIR_COUNT = {
  id: "k12-by-a-shrimp-boats-fair-count",
  index: "837",
  domain: "Education",
  trade: "Maths class aboard a shrimp boat at the harbour — learner and shrimp boat deckhand",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "A Shrimp Boat's Fair Count",
  title: simTitle("A Shrimp Boat's Fair Count"),
  tagline: "Scoop from all over, tally every one, repeat — a fair sample tells you about the whole catch",
  accent: 0xd0764a,
  accentCss: "#d0764a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"fair-counter","name":"Fair Counter","note":"Took fair sample scoops from a catch bin, tallied them, found the average and estimated the whole catch from it"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Catch Board",
    currency: "TALLIES",
    ranks: ["Sorter","Counter","Tallier","Sampler","Deck Boss"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-you-need-for-a") },
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
    "pick-the-biggest": "You scooped only from the top, where the biggest shrimp sat. A sample from one spot is not fair, because the catch is not the same all through the bin. Scooping from the top, middle and bottom gives a sample that looks like the whole catch.",
    "count-by-guessing": "You guessed the number in the scoop. A guess can be far off, and nobody can check it. Moving each shrimp to the other side as you make a tally mark means every one is counted once, and the count can be trusted.",
    "one-scoop-is-enough": "You stopped after one scoop. One scoop might be unusually full or empty. Taking several and finding the average smooths out the odd ones, so your estimate is closer to the truth.",
    "hands-near-the-winch": "You reached past the winch drum. Winches wind rope with great force, and deckhands keep hands well clear. Ask the deckhand to pass the scoop back; the count can wait a moment."
  },

  lateNotes: {
    "byk-catch-log": "The catch record is written once the scoops are counted — nothing to record yet.",
    "byk-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-what-you-need-for-a",
      kind: "find",
      noHint: true,
      targets: [
        "byk-scoop",
        "byk-tray",
        "byk-tally"
      ],
      itemNames: {
        "byk-scoop": "the measuring scoop",
        "byk-tray": "the sorting tray",
        "byk-tally": "the tally board"
      },
      itemNotes: {
        "byk-scoop": "It holds the same amount each time.",
        "byk-tray": "Spread the scoop out to count it.",
        "byk-tally": "One mark for each shrimp counted."
      },
      decoyNotes: {
        "byk-flag": "It shows the wind, but it will not help you count."
      },
      title: "Find what you need for a fair count",
      cue: "Mark the three things on deck you need to count the catch fairly.",
      why: "Counting a big catch one by one would take far too long, so crews count a sample. For that you need a scoop that holds the same amount each time, a sorting tray to spread the shrimp out, and a tally board to keep your marks. With those three, a fair count takes minutes instead of hours."
    },
    {
      id: "put-the-fair-count-steps-in",
      kind: "sequence",
      targets: [
        "byk-ord-scoop",
        "byk-ord-spread",
        "byk-ord-tally",
        "byk-ord-repeat"
      ],
      itemNames: {
        "byk-ord-scoop": "1 · take a level scoop",
        "byk-ord-spread": "2 · spread it on the tray",
        "byk-ord-tally": "3 · tally each one",
        "byk-ord-repeat": "4 · repeat from another part of the bin"
      },
      title: "Put the fair-count steps in order",
      cue: "Scoop, spread it on the tray, tally each one, then repeat from another part of the bin.",
      why: "Doing the steps in order keeps the count honest. A level scoop gives the same amount each time, spreading it out means none are hidden, tallying one at a time means none are counted twice, and repeating from another part of the bin makes the sample fair. Skip a step and the count stops being trustworthy.",
      outOfOrderNote: "Out of order. Take a level scoop before you spread anything on the tray."
    },
    {
      id: "put-on-gloves-and-stand-at",
      kind: "select",
      target: "byk-glove-card",
      title: "Put on gloves and stand at the sorting table",
      cue: "Put on the deck gloves and stand at the sorting table before the bin lid comes off.",
      why: "Shrimp have small sharp points, and the deck can be wet and cold. Gloves protect your hands, and the sorting table keeps you in one safe spot away from ropes and the winch. Deckhands suit up the same way at the start of every sort, so the work can be quick and calm."
    },
    {
      id: "turn-the-bin-to-reach-a",
      kind: "turn",
      target: "byk-bin-handle",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "BIN"
      },
      title: "Turn the bin to reach a new part of the catch",
      cue: "Turn the bin handle so the next scoop comes from a different part of the catch.",
      why: "Turning the bin lets you reach the middle and the bottom, not just the top. Different parts of a catch can hold different sizes, so a fair sample comes from all over. Crews move around the bin for each scoop for exactly this reason, so the count describes the whole haul."
    },
    {
      id: "level-the-scoop",
      kind: "gauge",
      target: "byk-level-meter",
      gauge: {
        label: "SCOOP",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not level yet. Fill to the line and sweep off the heap."
      },
      title: "Level the scoop",
      cue: "Commit when the scoop is filled exactly to the level line.",
      why: "Each scoop must hold the same amount, or you cannot compare them. Filling it to the line and sweeping off the heap makes every scoop equal. That sameness is what lets you use your average scoop to estimate how many shrimp are in the whole bin."
    },
    {
      id: "keep-your-place-on-the-tray",
      kind: "hold",
      target: "byk-count-stick",
      seconds: 6,
      title: "Keep your place on the tray",
      cue: "Hold the counting stick at your place on the tray until the tally mark is made.",
      why: "When you count many small things it is easy to lose your place. Holding your stick where you are while a partner makes the mark means none are skipped or counted twice. Pairs of deckhands count the same way: one moves, one marks, and they check each other.",
      holdBreakNote: "The stick slipped and you lost your place. Go back to the last marked shrimp."
    },
    {
      id: "return-the-small-fish-to-the",
      kind: "drag",
      target: "byk-small-fish",
      drag: {
        to: "byk-chute",
        radius: 0.45,
        missNote: "Not in the chute yet. Slide the fish to the return chute."
      },
      title: "Return the small fish to the water",
      cue: "Drag the small fish from the tray to the return chute.",
      why: "Nets catch other creatures along with shrimp. Crews return them to the water quickly, so they have the best chance to swim away. Moving them off the tray also keeps your shrimp count honest, because only shrimp should be tallied."
    },
    {
      id: "spot-the-unfair-counts-on-the",
      kind: "find",
      noHint: true,
      targets: [
        "byk-tb-same",
        "byk-tb-heaped",
        "byk-tb-guess"
      ],
      itemNames: {
        "byk-tb-same": "every scoop from the top of the bin",
        "byk-tb-heaped": "a heaped scoop marked as level",
        "byk-tb-guess": "a number with no tally marks"
      },
      itemNotes: {
        "byk-tb-same": "Scoop from all over.",
        "byk-tb-heaped": "Level every scoop.",
        "byk-tb-guess": "Show the marks, not just the number."
      },
      decoyNotes: {
        "byk-tb-labels": "Good practice. Keep it."
      },
      title: "Spot the unfair counts on the board",
      cue: "Look at another group's tally board and mark each problem.",
      why: "Counts go wrong in familiar ways: every scoop from the same spot, a scoop that was heaped instead of level, or a number written with no tally marks to back it up. Spotting these on another board teaches you what makes a count fair, and helps you check your own."
    },
    {
      id: "choose-how-to-estimate-the-whole",
      kind: "select",
      target: "byk-method-card",
      title: "Choose how to estimate the whole catch",
      cue: "Choose the method that uses your average scoop to estimate the whole bin.",
      why: "If you know how many shrimp are in an average scoop, and how many scoops fill the bin, you can multiply to estimate the whole. It is an estimate, not an exact count, and saying so is honest. Crews and scientists use this same idea to count things far too many to count one by one."
    },
    {
      id: "follow-the-sorting-belt",
      kind: "track",
      target: "byk-belt-meter",
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
        label: "BELT"
      },
      title: "Follow the sorting belt",
      cue: "Keep the marker on the shrimp as they move along the sorting belt to the ice.",
      why: "After counting, the catch moves along the belt to be iced so it stays fresh. Following it shows the whole job: catch, count, sort and keep. Watching carefully also lets you spot anything that is not shrimp and lift it off before it reaches the ice.",
      holdBreakNote: "The marker left the belt. Find the shrimp again and follow them."
    },
    {
      id: "record-your-scoops-and-your-estimate",
      kind: "select",
      target: "byk-catch-log",
      doneLine: "Scoops and estimate recorded",
      title: "Record your scoops and your estimate",
      cue: "Write each scoop's tally, the average and your estimate for the whole bin.",
      why: "A record of every scoop lets anyone check your average and your estimate. It also shows how much the scoops varied, which tells you how confident to be. Crews keep catch records for every trip, so they can see how the season is going and share fair numbers with others."
    },
    {
      id: "compare-with-the-deckhands-count",
      kind: "select",
      target: "byk-share-board",
      doneLine: "Estimates compared",
      title: "Compare with the deckhand's count",
      cue: "Put your estimate next to the deckhand's and talk about any difference.",
      why: "Comparing with an experienced counter tests your method. If the two estimates are close, your sample was fair. If they are far apart, you look for the reason, perhaps scoops from one spot or a heaped scoop. Finding the reason is just as useful as being right."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "byk-checkin",
      doneLine: "Checked in",
      title: "Check in on the dock",
      cue: "What made your count fair? Where else could a sample help you count something big?",
      why: "Shrimp crews finish by talking over the haul on the dock, so the class does the same. Each learner says one thing that makes a sample fair and one place they could use the idea, like counting birds or leaves. If anyone still thinks one scoop is enough, the group looks at the tally board together."
    }
  ],

  interrupts: [
    {
      id: "the-winch-starts-to-turn",
      kind: "Winch moving",
      after: "keep-your-place-on-the-tray",
      delay: 3,
      seconds: 12,
      target: "byk-step-clear",
      alert: "The captain calls out and the winch starts turning to lift the net.",
      cue: "Step back to the sorting table and keep your hands at your sides.",
      why: "A turning winch pulls rope with great force. Stepping back to your spot and keeping your hands still keeps everyone clear. The count waits until the captain says the winch has stopped.",
      missNote: "A classmate stayed near the winch, and the captain had to stop the lift until the deck was clear again.",
      wrongNote: "That does not move you clear of the winch. Step back to the table. Choose the response that deals with it now."
    },
    {
      id: "the-deckhand-asks-about-the-average",
      kind: "Deckhand question",
      after: "follow-the-sorting-belt",
      delay: 3,
      seconds: 12,
      target: "byk-say-average",
      alert: "The deckhand asks how you worked out your average scoop.",
      cue: "Say that you added the tallies and shared the total equally across the scoops.",
      why: "Explaining the average shows you understand it as sharing out fairly. That idea is what makes the estimate work. Saying it clearly also lets the deckhand check your working, just as crews check each other's counts.",
      missNote: "You could not say how you found the average, and the deckhand had to show the sharing before the group could go on.",
      wrongNote: "That does not explain the average. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0xd0764a;
    const CSS = "#d0764a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#736c62", base2: "#655f56", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#ece0d6", base2: "#ddcfc2", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "byk-scoop", "the measuring scoop", {});
    bead(-1.42, 1.18, -0.62, "byk-tray", "the sorting tray", {});
    bead(-1.03, 1.46, -0.71, "byk-tally", "the tally board", {});
    bead(-1.08, 0.9, -1.11, "byk-flag", "the boat's flag on the mast", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "byk-ord-scoop", "1 · take a level scoop", {});
    bead(-0.58, 1.46, -1.44, "byk-ord-spread", "2 · spread it on the tray", {});
    bead(-0.24, 0.9, -1.23, "byk-ord-tally", "3 · tally each one", {});
    bead(0, 1.18, -1.55, "byk-ord-repeat", "4 · repeat from another part of the bin", {});
    bead(0.24, 1.46, -1.23, "byk-count-stick", "Hold your place", {});
    bead(0.58, 0.9, -1.44, "byk-tb-same", "every scoop from the top of the bin", {});
    bead(0.68, 1.18, -1.05, "byk-tb-heaped", "a heaped scoop marked as level", {});
    bead(1.08, 1.46, -1.11, "byk-tb-guess", "a number with no tally marks", {});
    bead(1.03, 0.9, -0.71, "byk-tb-labels", "each scoop labelled by where it came from", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "byk-step-clear", "Step back from the winch to the sorting table", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "byk-say-average", "Say how you found the average scoop", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "byk-glove-card", "Gloves on at the table", "GLOVES\nON", { ry: 1.2 });
    dials["byk-bin-handle"] = dial(-1.89, -1.4, 0.93, "byk-bin-handle", "Bin turned");
    meters["byk-level-meter"] = meter(-1.45, -1.85, 0.67, "byk-level-meter", "Scoop level");
    tokens["byk-small-fish"] = token(-0.92, -2.16, 0.4, "byk-small-fish", "Small fish");
    spots["byk-chute"] = spot(-0.31, -2.33, 0.13, "byk-chute", "The return chute");
    card(0.31, 1.35, -2.33, "byk-method-card", "Choose the method", "HOW MANY\nIN ALL?", { ry: -0.13 });
    meters["byk-belt-meter"] = meter(0.92, -2.16, -0.4, "byk-belt-meter", "Belt followed");
    boards["byk-catch-log"] = board(1.45, -1.85, -0.67, "byk-catch-log", "Catch record");
    boards["byk-share-board"] = board(1.89, -1.4, -0.93, "byk-share-board", "Compare with the deckhand");
    boards["byk-checkin"] = board(2.19, -0.85, -1.2, "byk-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "pick-the-biggest", "Scoop from the top where the biggest shrimp are?", "TOP\nONLY", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "count-by-guessing", "Look at the scoop and guess how many are in it?", "JUST\nGUESS", 0.3);
    hazardCard(0.58, 0.72, -1.86, "one-scoop-is-enough", "Stop after one scoop and call it the answer?", "ONE\nSCOOP", -0.3);
    hazardCard(1.53, 0.72, -1.21, "hands-near-the-winch", "Reach past the winch drum to grab a dropped scoop?", "BY THE\nWINCH", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Scoop from all over, tally every one."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Shrimp boat deckhand", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Boat captain", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-winch-starts-to-turn"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-winch-starts-to-turn"].visible = false;
    arrivals["the-deckhand-asks-about-the-average"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-deckhand-asks-about-the-average"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "return-the-small-fish-to-the") { const s = spots["byk-chute"]; tokens["byk-small-fish"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-your-scoops-and-your-estimate") repaint(boards["byk-catch-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Scoops and estimate recorded"], "#59c97b"));
        if (step.id === "compare-with-the-deckhands-count") repaint(boards["byk-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Estimates compared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["byk-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "choose-how-to-estimate-the-whole") paintGuide("Average scoop, then estimate.");
      },

      onHazard() {
        paintGuide("Stop. Level scoops — and hands clear of the winch.");
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
        if (it.id === "the-winch-starts-to-turn") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Deck clear, the net lifted. The lesson carries on."); }
        if (it.id === "the-deckhand-asks-about-the-average") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Average explained. The lesson carries on."); }
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
