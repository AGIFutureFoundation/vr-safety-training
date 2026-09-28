import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Circuits at the Electrical Bench. Upper-primary and lower-secondary science with safe low-voltage kits only: a complete circuit, a switch, series and parallel, and why mains electricity is never part of a classroom lesson.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_CIRCUITS_AT_THE_ELECTRICAL_BENCH = {
  id: "k12-circuits-at-the-electrical-bench",
  index: "808",
  domain: "Education",
  trade: "Science class at the school's electrical bench — learner and teacher",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Circuits at the Electrical Bench",
  title: simTitle("Circuits at the Electrical Bench"),
  tagline: "A circuit needs a complete loop — and in class, it is always a low-voltage kit",
  accent: 0x4fb88a,
  accentCss: "#4fb88a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"full-loop","name":"Full Loop","note":"A circuit built, tested, explained and packed away safely"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Circuit Board",
    currency: "SPARKS",
    ranks: ["Builder","Connector","Tester","Explainer","Designer"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-parts-of-a-circuit") },
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
    "plug-into-the-wall": "You reached for the wall socket. Mains electricity can kill, and it is never part of a classroom circuits lesson; everything here runs from the low-voltage kit the teacher has checked. Knowing the difference between a safe kit and the mains is the most important thing this lesson teaches.",
    "short-the-battery": "You joined the battery's two ends with a bare wire. That is a short circuit: with nothing in the loop to use the energy, the wire and battery can get hot quickly. Every circuit has a component in the loop, and a warm battery is disconnected and reported.",
    "current-gets-used-up": "You said the first bulb uses up the current before the second. The current is the same all the way round a simple loop; what the bulbs use is energy, not the current itself. Getting this right is what makes series and parallel make sense.",
    "pack-away-connected": "You packed the kit away with the battery still connected. A connected battery in a box can short against other parts and heat up; disconnecting first is the last step of every circuits lesson."
  },

  lateNotes: {
    "kce-lab-log": "The lab record is written once both arrangements are tested — nothing to record yet.",
    "kce-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-the-parts-of-a-circuit",
      kind: "find",
      noHint: true,
      targets: [
        "kce-battery",
        "kce-wires",
        "kce-bulb"
      ],
      itemNames: {
        "kce-battery": "the battery pack",
        "kce-wires": "the connecting wires",
        "kce-bulb": "the bulb"
      },
      itemNotes: {
        "kce-battery": "The push that drives the current round the loop.",
        "kce-wires": "The path. It must be a complete loop.",
        "kce-bulb": "Where the energy is used and you can see it."
      },
      decoyNotes: {
        "kce-kit-label": "The box tells you what kit this is, not how the circuit works. Look at the parts."
      },
      title: "Find the parts of a circuit",
      cue: "Mark the three parts every working circuit on the bench needs.",
      why: "Every circuit needs something to push the current, a path for it to flow round and something that uses the energy. On this bench that is the battery pack, the connecting wires and the bulb. Knowing the parts is what lets you find why a circuit does not work."
    },
    {
      id: "confirm-you-are-using-the-checked",
      kind: "select",
      target: "kce-kit-card",
      title: "Confirm you are using the checked kit",
      cue: "Confirm the teacher has checked the kit and there is no mains lead on the bench.",
      why: "Classroom circuits use low-voltage kits that the teacher has checked because mains electricity is dangerous. Confirming the kit, and that nothing on the bench plugs into the wall, is the first step every time and the habit that keeps a curious learner safe at home too."
    },
    {
      id: "build-the-circuit-in-order",
      kind: "sequence",
      targets: [
        "kce-ord-out",
        "kce-ord-wire",
        "kce-ord-in",
        "kce-ord-test"
      ],
      itemNames: {
        "kce-ord-out": "1 · battery out",
        "kce-ord-wire": "2 · wire the loop",
        "kce-ord-in": "3 · battery in",
        "kce-ord-test": "4 · test"
      },
      title: "Build the circuit in order",
      cue: "Battery out, wires to the bulb, then battery in, then test.",
      why: "Building with the battery out means nothing can short while you work. Connecting the wires to the bulb and checking the loop before the battery goes in means the first thing to happen is the bulb lighting, not a surprise. It is the same order an electrician works in.",
      outOfOrderNote: "Out of order. Keep the battery out while you wire, so nothing can short."
    },
    {
      id: "trace-the-loop-from-one-end",
      kind: "hold",
      target: "kce-trace-loop",
      seconds: 6,
      title: "Trace the loop from one end to the other",
      cue: "Follow the path with your finger from the battery, round, and back.",
      why: "Tracing the loop by hand finds a loose clip or a gap faster than guessing. If your finger cannot get back to where it started along wires and parts, the current cannot either, and the bulb will stay dark.",
      holdBreakNote: "You lost the path. Start again at the battery and follow it all the way round."
    },
    {
      id: "close-the-switch",
      kind: "turn",
      target: "kce-switch-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "ON"
      },
      title: "Close the switch",
      cue: "Turn the switch to close the gap in the loop.",
      why: "A switch is simply a controlled gap in the loop. Closing it completes the circuit and the bulb lights; opening it breaks the loop and the bulb goes out. Seeing that shows why a complete loop is the one rule of every circuit."
    },
    {
      id: "judge-the-brightness-with-two-bulbs",
      kind: "gauge",
      target: "kce-bright-meter",
      gauge: {
        label: "BRIGHT",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Look again and compare with the single bulb before you commit."
      },
      title: "Judge the brightness with two bulbs in series",
      cue: "Commit when you judge how bright the two bulbs in series are compared with one.",
      why: "Adding a second bulb in series shares the battery's push between them, so each glows more dimly. Judging the change carefully, rather than guessing, is observation, and it sets up the comparison with parallel next."
    },
    {
      id: "move-the-second-bulb-onto-its",
      kind: "drag",
      target: "kce-bulb-token",
      drag: {
        to: "kce-parallel-spot",
        radius: 0.45
      },
      title: "Move the second bulb onto its own branch",
      cue: "Drag the second bulb onto a separate branch, in parallel.",
      why: "In parallel, each bulb has its own branch back to the battery, so each gets the full push and glows as brightly as one alone. Moving the bulb and seeing the change is the clearest way to learn the difference between series and parallel."
    },
    {
      id: "say-what-to-do-if-a",
      kind: "select",
      target: "kce-warm-card",
      title: "Say what to do if a battery feels warm",
      cue: "Say what you do if a battery or wire feels warm.",
      why: "A warm battery or wire is a sign that something is wrong, often a short. Disconnecting it and telling the teacher at once is the rule, and knowing it before anything warms up is what lets you act quickly."
    },
    {
      id: "spot-the-faults-in-a-classmate",
      kind: "find",
      noHint: true,
      targets: [
        "kce-fault-gap",
        "kce-fault-short",
        "kce-fault-loose-bulb"
      ],
      itemNames: {
        "kce-fault-gap": "a gap in the loop",
        "kce-fault-short": "a wire straight across the battery",
        "kce-fault-loose-bulb": "a bulb not seated"
      },
      itemNotes: {
        "kce-fault-gap": "No complete loop, no current. Close it.",
        "kce-fault-short": "A short circuit. Take it out before the battery goes in.",
        "kce-fault-loose-bulb": "A loose bulb is a gap. Seat it."
      },
      decoyNotes: {
        "kce-fault-tidy": "Tidy wiring makes faults easy to find. Keep it."
      },
      title: "Spot the faults in a classmate's circuit",
      cue: "Look at the classmate's circuit and mark each fault.",
      why: "Fault-finding is what makes circuits make sense. The usual faults are a gap in the loop, a wire straight across the battery and a bulb not seated in its holder. Finding them in someone else's circuit, with the battery out, trains the same method you will use on your own."
    },
    {
      id: "keep-observations-steady-as-you-swap",
      kind: "track",
      target: "kce-track-meter",
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
        label: "STEADY"
      },
      title: "Keep observations steady as you swap branches",
      cue: "Hold your attention in band as you switch between series and parallel and note each change.",
      why: "Swapping between arrangements quickly makes it easy to mix up which result went with which. Steady, careful observation and noting each change as it happens keeps the comparison clean.",
      holdBreakNote: "Your notes and the circuit drifted apart. Check which arrangement is on the bench and note it again."
    },
    {
      id: "record-the-circuits-and-what-you",
      kind: "select",
      target: "kce-lab-log",
      doneLine: "Circuits recorded",
      title: "Record the circuits and what you saw",
      cue: "Draw each circuit and note the brightness in series and in parallel.",
      why: "A drawn circuit with its observation beside it is how electricians and scientists record what they built. It means anyone can rebuild it and check your observation for themselves."
    },
    {
      id: "disconnect-and-pack-the-kit-away",
      kind: "select",
      target: "kce-share-board",
      doneLine: "Kit disconnected and packed",
      title: "Disconnect and pack the kit away",
      cue: "Battery out first, then pack the parts in their places.",
      why: "Disconnecting the battery before packing stops anything shorting in the box, and putting parts in their places means the next class finds a working kit. Finishing safely is part of the lesson, not an afterthought."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kce-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "How did the circuits lesson go? What surprised you, and what would you test next?",
      why: "Ending with a short check-in lets the teacher hear what made sense and what did not, and gives each learner a moment to name one thing they would test next. Nobody is marked here, and anyone who found the lesson hard can talk to the teacher or a trusted adult afterwards."
    }
  ],

  interrupts: [
    {
      id: "a-wire-gets-hot",
      kind: "Hot wire",
      after: "trace-the-loop-from-one-end",
      delay: 3,
      seconds: 12,
      target: "kce-disconnect-and-tell",
      alert: "A classmate says a wire on their circuit is getting hot.",
      cue: "Take the battery out straight away, do not touch the wire, and tell the teacher.",
      why: "A hot wire usually means a short circuit. Removing the battery stops the current at once, and leaving the wire alone until it cools and the teacher has looked is the safe response.",
      missNote: "Nobody took the battery out, and the wire's covering softened before the teacher saw it.",
      wrongNote: "That does not stop the current. Take the battery out."
    },
    {
      id: "the-technician-asks-about-the-mains",
      kind: "Technician question",
      after: "keep-observations-steady-as-you-swap",
      delay: 3,
      seconds: 12,
      target: "kce-explain-mains",
      alert: "The technician asks why the lesson never uses the wall socket.",
      cue: "Explain that mains can kill and that class circuits use checked low-voltage kits only.",
      why: "Being able to say why mains is off limits, in your own words, is the understanding that keeps you safe outside the classroom too. The technician asks because that answer matters more than any circuit on the bench.",
      missNote: "You said it would just make the bulb brighter, missing why it is dangerous.",
      wrongNote: "That does not explain the danger. Say why mains is never used."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x4fb88a;
    const CSS = "#4fb88a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6d7470", base2: "#616864", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dfe6e2", base2: "#cfd8d4", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
      box(desk, 0.9, 0.04, 0.55, 0, 0.74, 0, 5216890, { rough: 0.6 });
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
    bead(-1.22, 0.9, -0.27, "kce-battery", "the battery pack", {});
    bead(-1.42, 1.18, -0.62, "kce-wires", "the connecting wires", {});
    bead(-1.03, 1.46, -0.71, "kce-bulb", "the bulb", {});
    bead(-1.08, 0.9, -1.11, "kce-kit-label", "the kit box label", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kce-ord-out", "1 · battery out", {});
    bead(-0.58, 1.46, -1.44, "kce-ord-wire", "2 · wire the loop", {});
    bead(-0.24, 0.9, -1.23, "kce-ord-in", "3 · battery in", {});
    bead(0, 1.18, -1.55, "kce-ord-test", "4 · test", {});
    bead(0.24, 1.46, -1.23, "kce-trace-loop", "Tracing the loop with a finger", {});
    bead(0.58, 0.9, -1.44, "kce-fault-gap", "a gap in the loop", {});
    bead(0.68, 1.18, -1.05, "kce-fault-short", "a wire straight across the battery", {});
    bead(1.08, 1.46, -1.11, "kce-fault-loose-bulb", "a bulb not seated", {});
    bead(1.03, 0.9, -0.71, "kce-fault-tidy", "tidy, colour-matched wires", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kce-disconnect-and-tell", "Disconnect the battery and tell the teacher", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kce-explain-mains", "Explain why mains is never used", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kce-kit-card", "Low-voltage kit only", "KIT ONLY", { ry: 1.2 });
    dials["kce-switch-dial"] = dial(-1.89, -1.4, 0.93, "kce-switch-dial", "Switch");
    meters["kce-bright-meter"] = meter(-1.45, -1.85, 0.67, "kce-bright-meter", "Bulb brightness");
    tokens["kce-bulb-token"] = token(-0.92, -2.16, 0.4, "kce-bulb-token", "Second bulb");
    spots["kce-parallel-spot"] = spot(-0.31, -2.33, 0.13, "kce-parallel-spot", "On its own branch");
    card(0.31, 1.35, -2.33, "kce-warm-card", "A warm battery is reported", "WARM?\nDISCONNECT", { ry: -0.13 });
    meters["kce-track-meter"] = meter(0.92, -2.16, -0.4, "kce-track-meter", "Careful observation");
    boards["kce-lab-log"] = board(1.45, -1.85, -0.67, "kce-lab-log", "Lab record");
    boards["kce-share-board"] = board(1.89, -1.4, -0.93, "kce-share-board", "Pack away safely");
    boards["kce-checkin"] = board(2.19, -0.85, -1.2, "kce-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "plug-into-the-wall", "Try the bulb in the wall socket instead?", "WALL\nSOCKET", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "short-the-battery", "Join the battery's ends with a bare wire?", "WIRE ACROSS\nTHE ENDS", 0.3);
    hazardCard(0.58, 0.72, -1.86, "current-gets-used-up", "Say the first bulb uses up the current?", "CURRENT\nUSED UP", -0.3);
    hazardCard(1.53, 0.72, -1.21, "pack-away-connected", "Pack the kit away with the battery still connected?", "PACK IT\nLIVE", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["A complete loop. Low voltage only."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Technician", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Teaching assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-wire-gets-hot"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-wire-gets-hot"].visible = false;
    arrivals["the-technician-asks-about-the-mains"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-technician-asks-about-the-mains"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "move-the-second-bulb-onto-its") { const s = spots["kce-parallel-spot"]; tokens["kce-bulb-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-circuits-and-what-you") repaint(boards["kce-lab-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Circuits recorded"], "#59c97b"));
        if (step.id === "disconnect-and-pack-the-kit-away") repaint(boards["kce-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Kit disconnected and packed"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kce-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-to-do-if-a") paintGuide("No complete loop, no current.");
      },

      onHazard() {
        paintGuide("Stop. Check the loop and the kit before you go on.");
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
        if (it.id === "a-wire-gets-hot") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Battery out, teacher told. The short was found and taken out."); }
        if (it.id === "the-technician-asks-about-the-mains") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Explained: mains can kill, kits are checked and low voltage."); }
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
