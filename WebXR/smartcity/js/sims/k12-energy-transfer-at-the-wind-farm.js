import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Energy Transfer at the Wind Farm. Upper-primary and lower-secondary science at the wind farm's visitor point: energy followed from moving air to turning blades to electricity, qualitatively, with no output figures stated.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ENERGY_TRANSFER_AT_THE_WIND_FARM = {
  id: "k12-energy-transfer-at-the-wind-farm",
  index: "814",
  domain: "Education",
  trade: "Science class at the wind farm's visitor point — learner and teacher",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Energy Transfer at the Wind Farm",
  title: simTitle("Energy Transfer at the Wind Farm"),
  tagline: "Energy is never made or lost — follow it from the wind to the wire",
  accent: 0x4fb88a,
  accentCss: "#4fb88a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"energy-followed","name":"Energy Followed","note":"Energy traced store to store with a model turbine, wasted energy named and nothing claimed that the test did not show"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Energy Board",
    currency: "JOULES",
    ranks: ["Observer","Tracer","Tester","Explainer","Engineer"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-energy-stores-and-transfers") },
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
    "say-the-turbine-makes-energy": "You said the turbine makes energy. Energy is never made or destroyed; the turbine transfers the energy of moving air into electrical energy, with some wasted as heat and sound. Saying where the energy came from is the whole point of the lesson.",
    "ignore-the-wasted-energy": "You said all of the wind's energy becomes electricity. Every real transfer wastes some energy, here as heat in the moving parts and as sound; naming the wasted energy is what makes the energy story complete and honest.",
    "cross-the-visitor-barrier": "You walked past the visitor barrier towards the tower. The barrier keeps visitors clear of the working area around a turbine, and the model turbine is brought to the visitor point for the lesson; the lesson stays behind the barrier.",
    "change-fan-and-blades-together": "You changed the fan speed and the blades in the same test. A fair test changes one thing at a time, so you know which change made the difference to the model's output."
  },

  lateNotes: {
    "kew-lab-log": "The lab record is written once the tests are done — nothing to record yet.",
    "kew-checkin": "The check-in comes at the very end of the lesson."
  },

  steps: [
    {
      id: "find-the-energy-stores-and-transfers",
      kind: "find",
      noHint: true,
      targets: [
        "kew-moving-air",
        "kew-turning-blades",
        "kew-lamp-circuit"
      ],
      itemNames: {
        "kew-moving-air": "the moving air from the fan",
        "kew-turning-blades": "the turning blades and shaft",
        "kew-lamp-circuit": "the lamp in the circuit"
      },
      itemNotes: {
        "kew-moving-air": "The energy starts here, in moving air.",
        "kew-turning-blades": "The moving air's energy is transferred to the turning parts.",
        "kew-lamp-circuit": "Electrical energy, transferred to light — and some heat."
      },
      decoyNotes: {
        "kew-tower-paint": "The paint does not store or transfer the energy we are following."
      },
      title: "Find the energy stores and transfers",
      cue: "Mark the three places on the model where energy is stored or transferred.",
      why: "Following energy starts with finding where it is: in the moving air from the fan, in the turning blades and shaft, and in the electrical circuit that lights the small lamp. Naming each store and transfer before testing anything is what lets you tell the full energy story afterwards."
    },
    {
      id: "take-your-place-behind-the-barrier",
      kind: "select",
      target: "kew-barrier-card",
      title: "Take your place behind the barrier",
      cue: "Stand at the visitor point; the guide brings the model turbine to you.",
      why: "The visitor barrier keeps people clear of the working area around real turbines, and the model is brought to the visitor point for exactly that reason. Starting behind the barrier is the site's rule, and a lesson at a working site always keeps the site's rules first."
    },
    {
      id: "put-the-energy-chain-in-order",
      kind: "sequence",
      targets: [
        "kew-ord-air",
        "kew-ord-blades",
        "kew-ord-generator",
        "kew-ord-circuit"
      ],
      itemNames: {
        "kew-ord-air": "1 · moving air",
        "kew-ord-blades": "2 · turning blades",
        "kew-ord-generator": "3 · the generator",
        "kew-ord-circuit": "4 · electricity in the circuit"
      },
      title: "Put the energy chain in order",
      cue: "Moving air, turning blades, generator, electricity in the circuit.",
      why: "Each link in the chain passes energy to the next: moving air pushes the blades, the turning shaft drives the generator, and the generator transfers energy into the circuit. Putting the links in order shows how the energy travels, which matters far more than memorising the words.",
      outOfOrderNote: "Out of order. The energy starts in the moving air — follow it from there."
    },
    {
      id: "watch-the-lamp-as-the-blades",
      kind: "hold",
      target: "kew-watch-lamp",
      seconds: 6,
      title: "Watch the lamp as the blades turn",
      cue: "Keep still and watch the lamp brighten as the model's blades speed up.",
      why: "Watching the lamp while the blades turn links something you can see to the energy transfer you cannot. Keeping still and watching carefully, without nudging the model, lets you see the lamp respond to the moving air, which is the evidence for the whole chain.",
      holdBreakNote: "You nudged the model and spoiled the observation. Let it run on its own again."
    },
    {
      id: "turn-the-fan-to-a-faster",
      kind: "turn",
      target: "kew-fan-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "FASTER"
      },
      title: "Turn the fan to a faster setting",
      cue: "Turn only the fan setting up, keeping the blades the same.",
      why: "Changing only the fan setting, with the same blades, is the fair test that shows more moving air means more energy transferred. Keeping everything else the same is what lets you say the fan speed made the difference."
    },
    {
      id: "set-the-blade-angle-to-catch",
      kind: "gauge",
      target: "kew-angle-meter",
      gauge: {
        label: "ANGLE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Flat or edge on, the blades barely turn. Try again."
      },
      title: "Set the blade angle to catch the wind",
      cue: "Commit when the blade angle catches the moving air well — not flat to it, not edge on.",
      why: "Blades flat to the wind are pushed but do not turn well; blades edge on let the air slip past. An angle in between turns the push of the air into rotation best, which is why real turbines can change their blade angle."
    },
    {
      id: "put-your-result-on-the-class",
      kind: "drag",
      target: "kew-result-token",
      drag: {
        to: "kew-results-spot",
        radius: 0.45
      },
      title: "Put your result on the class board",
      cue: "Drag your result card onto the class results board beside everyone else's.",
      why: "One group's result could be a fluke; the whole class's results together show whether the pattern is real. Putting yours on the board is how science builds confidence in a finding, and it lets the class spot any result worth repeating."
    },
    {
      id: "name-where-energy-is-wasted",
      kind: "select",
      target: "kew-waste-card",
      title: "Name where energy is wasted",
      cue: "The model hums and the shaft is slightly warm. Say where energy is being wasted.",
      why: "The hum and the warm shaft are energy transferred to places we did not want: sound and heat. Naming the wasted energy completes the story and explains why no machine turns all of its input into useful output."
    },
    {
      id: "spot-the-problems-in-a-classmate",
      kind: "find",
      noHint: true,
      targets: [
        "kew-es-made",
        "kew-es-no-waste",
        "kew-es-unfair"
      ],
      itemNames: {
        "kew-es-made": "energy described as made",
        "kew-es-no-waste": "no wasted energy mentioned",
        "kew-es-unfair": "a conclusion from an unfair test"
      },
      itemNotes: {
        "kew-es-made": "Energy is transferred, not made. Where did it come from?",
        "kew-es-no-waste": "Some always goes to heat and sound.",
        "kew-es-unfair": "Two things changed at once. Which made the difference?"
      },
      decoyNotes: {
        "kew-es-chain": "The chain in order is right. Keep it."
      },
      title: "Spot the problems in a classmate's energy story",
      cue: "Look at the classmate's energy story and mark each problem.",
      why: "Energy stories go wrong in predictable ways: saying energy is made, forgetting wasted energy and drawing a conclusion from an unfair test. Spotting them in someone else's story makes your own explanation more careful and more complete."
    },
    {
      id: "keep-your-notes-matched-to-the",
      kind: "track",
      target: "kew-track-meter",
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
        label: "HONEST"
      },
      title: "Keep your notes matched to the model",
      cue: "Hold your notes in band with what the lamp actually does as you change settings.",
      why: "It is easy to write the result you expected. Keeping notes matched to what the lamp actually does, including a result that surprised you, is the honesty that makes a science finding worth trusting and repeating.",
      holdBreakNote: "Your notes drifted from what the model shows. Look again and write what you see."
    },
    {
      id: "record-the-energy-story-and-the",
      kind: "select",
      target: "kew-lab-log",
      doneLine: "Energy story recorded",
      title: "Record the energy story and the tests",
      cue: "Write the energy chain, the fair tests and where energy was wasted.",
      why: "Recording the chain, the tests and the wasted energy gives a complete, checkable energy story. Anyone can repeat the tests from your record, and the record shows how your explanation was built from evidence."
    },
    {
      id: "tell-the-energy-story-to-the",
      kind: "select",
      target: "kew-share-board",
      doneLine: "Energy story shared",
      title: "Tell the energy story to the class",
      cue: "Tell the class where the energy came from, where it went, and where some was wasted.",
      why: "Telling the energy story aloud, from moving air to light and the heat and sound along the way, is the best test of whether it makes sense. Classmates who said the turbine makes energy learn most from hearing where it really comes from."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kew-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the lesson",
      cue: "How did the energy lesson go? What surprised you, and what would you test next?",
      why: "Ending with a short check-in lets the teacher hear what made sense and what did not, and gives each learner a moment to name one thing they would test next. Nobody is marked here, and anyone who found the lesson hard can talk to the teacher or a trusted adult afterwards."
    }
  ],

  interrupts: [
    {
      id: "a-gust-knocks-the-model",
      kind: "Gust",
      after: "watch-the-lamp-as-the-blades",
      delay: 3,
      seconds: 12,
      target: "kew-steady-and-tell",
      alert: "A gust of wind tips the model turbine towards the edge of the table.",
      cue: "Step back from the spinning blades and tell the guide; do not grab them.",
      why: "Grabbing spinning blades, even small ones, is how fingers get hurt. Stepping back and telling the guide, who can stop the fan and steady the model, is the safe response, and the test can be run again.",
      missNote: "Nobody told the guide, and a classmate grabbed the blades and caught a finger.",
      wrongNote: "That does not make it safe. Step back and tell the guide."
    },
    {
      id: "the-guide-asks-where-the-energy-comes-from",
      kind: "Guide question",
      after: "keep-your-notes-matched-to-the",
      delay: 3,
      seconds: 12,
      target: "kew-trace-to-the-wind",
      alert: "The visitor point guide asks where the lamp's energy came from.",
      cue: "Trace it back through the generator and blades to the moving air.",
      why: "The guide is checking that you understand energy is transferred, not made. Tracing the lamp's energy back through each link to the moving air shows the whole chain and the idea underneath it.",
      missNote: "You said the turbine made it, which misses where the energy came from.",
      wrongNote: "That says the turbine made it. Trace it back to the moving air."
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
    bead(-1.22, 0.9, -0.27, "kew-moving-air", "the moving air from the fan", {});
    bead(-1.42, 1.18, -0.62, "kew-turning-blades", "the turning blades and shaft", {});
    bead(-1.03, 1.46, -0.71, "kew-lamp-circuit", "the lamp in the circuit", {});
    bead(-1.08, 0.9, -1.11, "kew-tower-paint", "the colour of the model tower", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kew-ord-air", "1 · moving air", {});
    bead(-0.58, 1.46, -1.44, "kew-ord-blades", "2 · turning blades", {});
    bead(-0.24, 0.9, -1.23, "kew-ord-generator", "3 · the generator", {});
    bead(0, 1.18, -1.55, "kew-ord-circuit", "4 · electricity in the circuit", {});
    bead(0.24, 1.46, -1.23, "kew-watch-lamp", "Watching the lamp", {});
    bead(0.58, 0.9, -1.44, "kew-es-made", "energy described as made", {});
    bead(0.68, 1.18, -1.05, "kew-es-no-waste", "no wasted energy mentioned", {});
    bead(1.08, 1.46, -1.11, "kew-es-unfair", "a conclusion from an unfair test", {});
    bead(1.03, 0.9, -0.71, "kew-es-chain", "the energy chain in order", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kew-steady-and-tell", "Step back and tell the guide", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kew-trace-to-the-wind", "Trace the energy back to the moving air", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kew-barrier-card", "Stay behind the visitor barrier", "BEHIND THE\nBARRIER", { ry: 1.2 });
    dials["kew-fan-dial"] = dial(-1.89, -1.4, 0.93, "kew-fan-dial", "Fan setting");
    meters["kew-angle-meter"] = meter(-1.45, -1.85, 0.67, "kew-angle-meter", "Blade angle");
    tokens["kew-result-token"] = token(-0.92, -2.16, 0.4, "kew-result-token", "Your result card");
    spots["kew-results-spot"] = spot(-0.31, -2.33, 0.13, "kew-results-spot", "On the class results board");
    card(0.31, 1.35, -2.33, "kew-waste-card", "Name the wasted energy", "HEAT +\nSOUND", { ry: -0.13 });
    meters["kew-track-meter"] = meter(0.92, -2.16, -0.4, "kew-track-meter", "Honest observation");
    boards["kew-lab-log"] = board(1.45, -1.85, -0.67, "kew-lab-log", "Lab record");
    boards["kew-share-board"] = board(1.89, -1.4, -0.93, "kew-share-board", "Share with the class");
    boards["kew-checkin"] = board(2.19, -0.85, -1.2, "kew-checkin", "End-of-lesson check-in");
    hazardCard(-1.53, 0.72, -1.21, "say-the-turbine-makes-energy", "Say the turbine makes energy?", "TURBINE\nMAKES IT", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "ignore-the-wasted-energy", "Say all the wind's energy becomes electricity?", "ALL OF IT\nBECOMES POWER", 0.3);
    hazardCard(0.58, 0.72, -1.86, "cross-the-visitor-barrier", "Walk past the visitor barrier towards the tower?", "PAST THE\nBARRIER", -0.3);
    hazardCard(1.53, 0.72, -1.21, "change-fan-and-blades-together", "Change the fan speed and the blade shape in one test?", "CHANGE\nBOTH", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Where does the energy go next?"], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Visitor point guide", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Teaching assistant", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-gust-knocks-the-model"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-gust-knocks-the-model"].visible = false;
    arrivals["the-guide-asks-where-the-energy-comes-from"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-guide-asks-where-the-energy-comes-from"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "put-your-result-on-the-class") { const s = spots["kew-results-spot"]; tokens["kew-result-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-energy-story-and-the") repaint(boards["kew-lab-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Energy story recorded"], "#59c97b"));
        if (step.id === "tell-the-energy-story-to-the") repaint(boards["kew-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Energy story shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kew-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "name-where-energy-is-wasted") paintGuide("Moving air, turning blades, electricity, and some wasted as heat and sound.");
      },

      onHazard() {
        paintGuide("Stop. Energy is transferred, not made — where did it come from?");
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
        if (it.id === "a-gust-knocks-the-model") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Guide told, fan off, model steadied. The test runs again."); }
        if (it.id === "the-guide-asks-where-the-energy-comes-from") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Traced back to the moving air. The chain is understood."); }
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
