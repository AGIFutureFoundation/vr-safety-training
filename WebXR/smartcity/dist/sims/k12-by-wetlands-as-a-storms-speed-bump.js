import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Wetlands as a Storm's Speed Bump. Lower-secondary science at the Central Wetlands Restoration site in St. Bernard Parish: how marsh grass and shallow water take energy out of waves, tested fairly in a wave tank with and without plants, and how the restoration crew replants the marsh, using only what the tank and the marsh in the scene show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_BY_WETLANDS_AS_A_STORMS_SPEED_BUMP = {
  id: "k12-by-wetlands-as-a-storms-speed-bump",
  index: "831",
  domain: "Education",
  trade: "Science class on the restoration crew's boat at the wetlands — learner and restoration crew lead",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Wetlands as a Storm's Speed Bump",
  title: simTitle("Wetlands as a Storm's Speed Bump"),
  tagline: "Grass, mud and shallow water slow a wave down — test it fairly, then help the crew plant",
  accent: 0x7aa84e,
  accentCss: "#7aa84e",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"marsh-maker","name":"Marsh Maker","note":"Ran a fair wave-tank test with and without marsh plants, explained where the wave's energy went and planted with the crew"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Marsh Board",
    currency: "STEMS",
    ranks: ["Seedling","Sprout","Stem","Clump","Marsh Keeper"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-slows-the-water-in") },
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
    "plants-stop-all-water": "You said the marsh stops storm water completely. A marsh slows water and takes energy out of waves, like a speed bump slows a car. It does not stop the water, which is why a parish uses wetlands, levees and pumps together.",
    "change-two-things": "You added plants and turned the wave maker down in the same run. With two changes you cannot tell which one made the waves smaller. A fair test changes one thing, the plants, and keeps the wave maker the same.",
    "step-off-the-boat": "You stepped off the boat onto the marsh. Marsh mud is soft and can hold a boot fast, and trampling kills young plants. The crew plants from the boat or from mats laid down for the job, and visitors stay aboard.",
    "pull-up-a-plant": "You pulled up a marsh plant. Every stem helps hold the mud together, and the crew planted each one by hand. Look, sketch and photograph; the plants stay where they are."
  },

  lateNotes: {
    "byw-tank-log": "The wave-tank record is written once both runs are done — nothing to record yet.",
    "byw-checkin": "The check-in comes at the very end of the trip."
  },

  steps: [
    {
      id: "find-what-slows-the-water-in",
      kind: "find",
      noHint: true,
      targets: [
        "byw-stems",
        "byw-mud",
        "byw-width"
      ],
      itemNames: {
        "byw-stems": "the grass stems standing in the water",
        "byw-mud": "the shallow mud floor",
        "byw-width": "the wide stretch of marsh"
      },
      itemNotes: {
        "byw-stems": "Stems rub against the moving water.",
        "byw-mud": "Shallow bottoms drag on the wave.",
        "byw-width": "A longer path takes away more energy."
      },
      decoyNotes: {
        "byw-heron": "Lovely to see, but it is not what slows the wave."
      },
      title: "Find what slows the water in the marsh",
      cue: "Mark the three parts of the marsh that take energy out of a wave.",
      why: "A wave carries energy. When it moves over a marsh, grass stems rub against the water, shallow mud drags on the bottom of the wave, and a wide stretch of marsh gives the water a long way to travel. Each of these takes a little energy away, and together they make the wave smaller before it reaches land."
    },
    {
      id: "put-the-wave-tank-test-in",
      kind: "sequence",
      targets: [
        "byw-ord-bare",
        "byw-ord-measure",
        "byw-ord-plant",
        "byw-ord-again"
      ],
      itemNames: {
        "byw-ord-bare": "1 · run waves over the bare tank",
        "byw-ord-measure": "2 · measure the waves at the far end",
        "byw-ord-plant": "3 · add the model marsh plants",
        "byw-ord-again": "4 · run the same waves again"
      },
      title: "Put the wave-tank test in order",
      cue: "Run waves with no plants, measure them, add the plants, then run the same waves again.",
      why: "Running the tank first with no plants gives you something to compare against, called a control. Measuring before you add the plants, then keeping the wave maker exactly the same for the second run, means the plants are the only difference. Then any change you see belongs to the plants.",
      outOfOrderNote: "Out of order. Run and measure the waves with no plants first, as your control."
    },
    {
      id: "sit-down-in-the-boat-before",
      kind: "select",
      target: "byw-seat-card",
      title: "Sit down in the boat before it moves",
      cue: "Take your seat and put on your life jacket before the crew lead starts the engine.",
      why: "A boat in a marsh channel can turn and stop suddenly around bends and shallow spots. Sitting down low with a life jacket fastened keeps everyone steady and ready if the boat rocks. The crew does the same before every trip, because a calm start makes the whole visit calm."
    },
    {
      id: "set-the-wave-maker-and-leave",
      kind: "turn",
      target: "byw-wave-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "WAVES"
      },
      title: "Set the wave maker and leave it",
      cue: "Turn the wave maker dial to the teacher's setting and do not touch it again.",
      why: "The wave maker must stay on the same setting for both runs. If the waves are different sizes each time, you cannot tell whether the plants did anything. Setting it once and leaving it is how scientists control a variable, the thing they keep the same on purpose."
    },
    {
      id: "read-the-wave-height-at-the",
      kind: "gauge",
      target: "byw-wave-meter",
      gauge: {
        label: "WAVE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the top of the wave. Read where the crest meets the ruler.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the wave height at the far end",
      cue: "Commit when the marker sits at the top of the wave on the far ruler.",
      why: "To compare the two runs, you read the wave at the same place each time, on the ruler at the land end of the tank. Reading at the top of the wave, and at eye level, makes your reading one that a classmate would agree with. Careful reading is what makes the comparison honest."
    },
    {
      id: "hold-the-model-plants-in-place",
      kind: "hold",
      target: "byw-mat-hold",
      seconds: 6,
      title: "Hold the model plants in place",
      cue: "Hold the plant mat flat on the tank floor until its weights settle.",
      why: "If the plant mat lifts or slides, the test changes halfway through. Holding it flat until the weights settle keeps the plants standing where you put them. Real marsh grass is held in place by its roots, which is exactly what the weights stand in for in the model.",
      holdBreakNote: "The mat lifted before the weights settled. Hold it flat again until it stays."
    },
    {
      id: "set-the-plant-mat-in-the",
      kind: "drag",
      target: "byw-plant-mat",
      drag: {
        to: "byw-marsh-strip",
        radius: 0.45,
        missNote: "Not on the marsh strip yet. Place it between the waves and the shore."
      },
      title: "Set the plant mat in the middle of the tank",
      cue: "Drag the plant mat to the marked strip between the wave maker and the shore.",
      why: "A real marsh lies between open water and the land. Putting the plant mat in the same place in the tank means the waves must cross it to reach the model shore, just as storm waves cross a marsh. The position matters, because plants behind the shore would not slow anything."
    },
    {
      id: "spot-what-the-restoration-crew-is",
      kind: "find",
      noHint: true,
      targets: [
        "byw-cr-rows",
        "byw-cr-mats",
        "byw-cr-fence"
      ],
      itemNames: {
        "byw-cr-rows": "rows of young grass plants",
        "byw-cr-mats": "mats laid over bare mud",
        "byw-cr-fence": "a low fence that traps sediment"
      },
      itemNotes: {
        "byw-cr-rows": "New plants will spread and knit the mud.",
        "byw-cr-mats": "Mats stop the mud washing away.",
        "byw-cr-fence": "It helps the ground build up again."
      },
      decoyNotes: {
        "byw-cr-cooler": "Important to the crew, but not part of the restoration."
      },
      title: "Spot what the restoration crew is doing",
      cue: "Look across the marsh from the boat and mark each part of the crew's work.",
      why: "Restoring a marsh is patient work. The crew plants young grass in rows, lays mats that stop the mud washing away, and places fences that trap sediment so the ground can build up again. Seeing each job helps you understand that a marsh can be helped to grow back, and that people do that work."
    },
    {
      id: "say-what-the-plants-did-to",
      kind: "select",
      target: "byw-result-card",
      title: "Say what the plants did to the waves",
      cue: "Choose the sentence that says what your two runs showed.",
      why: "Your control run and your plant run used the same waves. If the waves were smaller at the shore with plants, the plants took energy out of them. A good conclusion says only that, with your readings as the evidence, and does not claim more than the test showed."
    },
    {
      id: "follow-a-wave-across-the-marsh",
      kind: "track",
      target: "byw-wave-track",
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
      title: "Follow a wave across the marsh strip",
      cue: "Keep the marker on one wave as it travels over the plants and shrinks.",
      why: "Watching one wave from start to finish shows the change happening, not just the result. You see it lose height as it pushes through the stems and over the shallow floor. That picture, energy being taken away step by step, is the heart of why wetlands act like a speed bump.",
      holdBreakNote: "The marker lost the wave. Find the same wave again and follow it to the shore."
    },
    {
      id: "record-both-runs-side-by-side",
      kind: "select",
      target: "byw-tank-log",
      doneLine: "Both runs recorded",
      title: "Record both runs side by side",
      cue: "Write the wave height for the control run and the plant run in a two-column table.",
      why: "Two columns side by side make the comparison easy to see and easy to check. Anyone reading your table can see the setting, the two readings and the one thing that changed. That is how a test result travels from your bench to someone else's, and how it can be repeated."
    },
    {
      id: "compare-with-another-group",
      kind: "select",
      target: "byw-share-board",
      doneLine: "Results compared",
      title: "Compare with another group",
      cue: "Put your table next to another group's and look for the same pattern.",
      why: "One test can be a fluke. If another group, with its own tank, sees waves shrink over plants too, the result is much stronger. Comparing results is how scientists build confidence, and it is why the crew shares its marsh surveys with other crews along the coast."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "byw-checkin",
      doneLine: "Checked in",
      title: "Check in before the boat heads back",
      cue: "What did the tank show you? What is one way people help a marsh grow back?",
      why: "The restoration crew talks over each day's planting on the ride back, so the class does the same before the engine starts. Each learner says what the plants did to the waves and names one job they saw the crew doing. If anyone thinks the marsh stops all water, the group sorts that out together now."
    }
  ],

  interrupts: [
    {
      id: "a-boat-wake-rocks-the-deck",
      kind: "Boat wake",
      after: "hold-the-model-plants-in-place",
      delay: 3,
      seconds: 12,
      target: "byw-hold-rail",
      alert: "A passing work boat's wake rocks the deck and the tank sloshes.",
      cue: "Sit low, hold the handrail and wait for the rocking to stop.",
      why: "A wake can tip a standing person off balance. Sitting low and holding on keeps everyone safe until the water is calm again. The test can be run again afterwards; a slip on a wet deck cannot be undone.",
      missNote: "Nobody sat down, and a classmate lost their balance on the wet deck as the boat rocked from side to side.",
      wrongNote: "That leaves you standing on a rocking deck. Sit low and hold the rail. Choose the response that deals with it now."
    },
    {
      id: "the-crew-lead-asks-about-the-control",
      kind: "Crew question",
      after: "follow-a-wave-across-the-marsh",
      delay: 3,
      seconds: 12,
      target: "byw-name-control",
      alert: "The crew lead asks which run you are comparing the plant run against.",
      cue: "Say that the bare-tank run is the control, with the same waves and no plants.",
      why: "Naming the control shows you understand why the test is fair. Without it, a smaller wave means nothing, because you have nothing to compare it with. The crew compares restored marsh with bare mud in exactly the same way.",
      missNote: "You could not say which run was the control, and the crew lead had to explain the comparison before the group could go on.",
      wrongNote: "That does not name the control run. Say which run had no plants. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x7aa84e;
    const CSS = "#7aa84e";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6e6a52", base2: "#615d48", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e0e4d0", base2: "#d0d6bc", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "byw-stems", "the grass stems standing in the water", {});
    bead(-1.42, 1.18, -0.62, "byw-mud", "the shallow mud floor", {});
    bead(-1.03, 1.46, -0.71, "byw-width", "the wide stretch of marsh", {});
    bead(-1.08, 0.9, -1.11, "byw-heron", "a heron standing in the shallows", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "byw-ord-bare", "1 · run waves over the bare tank", {});
    bead(-0.58, 1.46, -1.44, "byw-ord-measure", "2 · measure the waves at the far end", {});
    bead(-0.24, 0.9, -1.23, "byw-ord-plant", "3 · add the model marsh plants", {});
    bead(0, 1.18, -1.55, "byw-ord-again", "4 · run the same waves again", {});
    bead(0.24, 1.46, -1.23, "byw-mat-hold", "Hold the plant mat", {});
    bead(0.58, 0.9, -1.44, "byw-cr-rows", "rows of young grass plants", {});
    bead(0.68, 1.18, -1.05, "byw-cr-mats", "mats laid over bare mud", {});
    bead(1.08, 1.46, -1.11, "byw-cr-fence", "a low fence that traps sediment", {});
    bead(1.03, 0.9, -0.71, "byw-cr-cooler", "the crew's lunch cooler", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "byw-hold-rail", "Sit low and hold the handrail", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "byw-name-control", "Say which run was the control", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "byw-seat-card", "Seated with a life jacket", "SEAT AND\nJACKET", { ry: 1.2 });
    dials["byw-wave-dial"] = dial(-1.89, -1.4, 0.93, "byw-wave-dial", "Wave maker setting");
    meters["byw-wave-meter"] = meter(-1.45, -1.85, 0.67, "byw-wave-meter", "Wave height");
    tokens["byw-plant-mat"] = token(-0.92, -2.16, 0.4, "byw-plant-mat", "Plant mat");
    spots["byw-marsh-strip"] = spot(-0.31, -2.33, 0.13, "byw-marsh-strip", "The marsh strip");
    card(0.31, 1.35, -2.33, "byw-result-card", "State the result", "WHAT DID\nPLANTS DO?", { ry: -0.13 });
    meters["byw-wave-track"] = meter(0.92, -2.16, -0.4, "byw-wave-track", "Wave followed");
    boards["byw-tank-log"] = board(1.45, -1.85, -0.67, "byw-tank-log", "Wave-tank record");
    boards["byw-share-board"] = board(1.89, -1.4, -0.93, "byw-share-board", "Compare with a group");
    boards["byw-checkin"] = board(2.19, -0.85, -1.2, "byw-checkin", "End-of-trip check-in");
    hazardCard(-1.53, 0.72, -1.21, "plants-stop-all-water", "Say the marsh stops the water completely?", "STOPS\nALL?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "change-two-things", "Add plants and make the waves smaller in the same run?", "TWO\nCHANGES", 0.3);
    hazardCard(0.58, 0.72, -1.86, "step-off-the-boat", "Step off the boat onto the soft marsh to look closer?", "STEP\nOFF", -0.3);
    hazardCard(1.53, 0.72, -1.21, "pull-up-a-plant", "Pull up a marsh plant to take home?", "PULL\nUP", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Control first, then plants."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Restoration crew lead", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Boat deckhand", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-boat-wake-rocks-the-deck"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-boat-wake-rocks-the-deck"].visible = false;
    arrivals["the-crew-lead-asks-about-the-control"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-crew-lead-asks-about-the-control"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "set-the-plant-mat-in-the") { const s = spots["byw-marsh-strip"]; tokens["byw-plant-mat"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-both-runs-side-by-side") repaint(boards["byw-tank-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Both runs recorded"], "#59c97b"));
        if (step.id === "compare-with-another-group") repaint(boards["byw-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Results compared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["byw-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-the-plants-did-to") paintGuide("Smaller waves: energy taken away.");
      },

      onHazard() {
        paintGuide("Stop. One change only — and stay aboard.");
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
        if (it.id === "a-boat-wake-rocks-the-deck") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Group seated and holding on, the wake passed. The lesson carries on."); }
        if (it.id === "the-crew-lead-asks-about-the-control") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Control named. The lesson carries on."); }
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
