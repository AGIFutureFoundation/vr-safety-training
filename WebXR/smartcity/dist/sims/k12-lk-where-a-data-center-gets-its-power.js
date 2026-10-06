import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Where a Data Center Gets Its Power. Lower-secondary science on the energy that runs a big computer building, as general science: how energy stored in natural gas becomes electricity at a power plant, travels on lines through a substation, turns into heat inside computers, and is carried away by a cooling plant, and why gas can be stored underground in a salt dome, worked on a model power path in the scene.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_LK_WHERE_A_DATA_CENTER_GETS_ITS_POWER = {
  id: "k12-lk-where-a-data-center-gets-its-power",
  index: "966",
  domain: "Education",
  trade: "Science lesson on energy and electricity with a power and cooling crew — learner and electrician",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Where a Data Center Gets Its Power",
  title: simTitle("Where a Data Center Gets Its Power"),
  tagline: "Energy changes form but never vanishes — follow it from stored gas to hot chips and back out as heat",
  accent: 0xd8a33a,
  accentCss: "#d8a33a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"energy-tracker","name":"Energy Tracker","note":"Followed energy from a store to a spinning generator, through a substation to computer chips and out through the cooling plant"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Energy Board",
    currency: "SPARKS",
    ranks: ["Spark","Current","Circuit","Grid","Power Tracker"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-energy-stores-in-the") },
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
    "open-the-substation-gate": "You went for the substation gate. The equipment inside carries electricity at very high voltage, and it can jump through the air to anyone who gets too close. Only trained electricians go inside, under a permit, and everyone else stays outside the fence.",
    "energy-gets-used-up": "You said the energy is used up. Energy never disappears; it changes form. In the computers almost all of the electrical energy turns into heat, which is why the building needs such a big cooling plant to carry that heat away.",
    "touch-a-fallen-line": "You reached for the fallen line. A line on the ground may still be live, and the ground around it can carry electricity too. Stay far back, keep others back and tell an adult to call the power company.",
    "unplug-to-save-power": "You went to pull a plug in the model data hall. The servers are doing work for many people, and only the operations crew switches equipment, following a plan. Saving energy is a good idea, but it is done by design, not by unplugging."
  },

  lateNotes: {
    "lke-energy-log": "The energy record is written once you have followed the whole path — nothing to record yet.",
    "lke-checkin": "The check-in comes at the very end of the tour."
  },

  steps: [
    {
      id: "find-the-energy-stores-in-the",
      kind: "find",
      noHint: true,
      targets: [
        "lke-gas",
        "lke-battery",
        "lke-sun"
      ],
      itemNames: {
        "lke-gas": "the gas store",
        "lke-battery": "the battery bank",
        "lke-sun": "the solar panel in sunlight"
      },
      itemNotes: {
        "lke-gas": "Chemical energy released by burning.",
        "lke-battery": "Chemical energy stored for later.",
        "lke-sun": "Light energy turned to electricity."
      },
      decoyNotes: {
        "lke-fence": "It keeps people safe, but it stores no energy."
      },
      title: "Find the energy stores in the model",
      cue: "Mark the three places where energy is stored before it becomes electricity or heat.",
      why: "Energy is stored in many forms. Natural gas holds chemical energy that is released when it burns. A battery holds chemical energy that can flow out as electricity. Sunlight falling on a solar panel carries light energy. A power system starts from stores like these and changes the energy into electricity people can use."
    },
    {
      id: "stay-outside-the-fence-with-the",
      kind: "select",
      target: "lke-line-card",
      title: "Stay outside the fence with the electrician",
      cue: "Stand with the electrician at the yellow line outside the substation fence.",
      why: "The substation is where electricity from the long lines is changed to a voltage the building can use. The equipment inside carries so much electrical energy that the fence and the yellow line are there to keep people well back. The electrician explains from outside the fence, which is exactly where the class should be."
    },
    {
      id: "put-the-power-path-in-order",
      kind: "sequence",
      targets: [
        "lke-ord-burn",
        "lke-ord-generate",
        "lke-ord-substation",
        "lke-ord-chip"
      ],
      itemNames: {
        "lke-ord-burn": "1 · gas burns and spins a turbine",
        "lke-ord-generate": "2 · the generator makes electricity",
        "lke-ord-substation": "3 · the substation changes the voltage",
        "lke-ord-chip": "4 · computers use it and give off heat"
      },
      title: "Put the power path in order",
      cue: "Order the steps from stored gas to a working computer chip.",
      why: "Electricity has a path. At the power plant, burning gas heats and spins a turbine, and the turbine turns a generator that makes electricity. Long lines carry it to a substation, which changes the voltage. Cables bring it into the building, where the computers use it and turn it into heat. Each step changes the energy into the next form.",
      outOfOrderNote: "Out of order. The energy starts in the stored gas, before the plant spins anything."
    },
    {
      id: "hold-the-crank-to-light-the",
      kind: "hold",
      target: "lke-crank-hold",
      seconds: 6,
      title: "Hold the crank to light the bulbs",
      cue: "Keep turning the hand-crank generator steadily until every bulb is lit.",
      why: "A generator turns movement into electricity. When you keep turning the crank, your muscles supply the energy, and the bulbs glow as long as you keep going. Stop, and they go out. A power plant does the same job with a huge turbine instead of your arm, turning all day and night.",
      holdBreakNote: "The crank stopped and the bulbs went dark. Keep turning steadily."
    },
    {
      id: "turn-the-dial-to-share-out",
      kind: "turn",
      target: "lke-load-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "LOAD"
      },
      title: "Turn the dial to share out the load",
      cue: "Turn the load dial until the model's supply matches the computers' demand.",
      why: "Electricity has to be made at the same moment it is used. If the computers need more than the supply gives, the lights dim; if the supply is too high, it is wasted. Operators keep supply and demand matched all day. Turning the dial to balance them shows why a big building needs careful planning with the power company."
    },
    {
      id: "read-the-cooling-water-temperature",
      kind: "gauge",
      target: "lke-temp-meter",
      gauge: {
        label: "TEMP",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the reading yet. Read where the liquid stops in the thermometer.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Read the cooling water temperature",
      cue: "Commit when the marker sits at the reading on the cooling loop's thermometer.",
      why: "The computers turn electricity into heat, and the heat has to go somewhere. Water flows past the equipment, warms up and carries the heat to the cooling plant. Reading the thermometer on the loop shows how much heat the water is carrying. Technicians check it so the computers never get too hot."
    },
    {
      id: "place-the-gas-store-in-the",
      kind: "drag",
      target: "lke-gas-store",
      drag: {
        to: "lke-dome-spot",
        radius: 0.45,
        missNote: "Not inside the salt yet. Place it in the hollow space."
      },
      title: "Place the gas store in the salt dome",
      cue: "Drag the model gas store into the space hollowed out inside the salt dome.",
      why: "Deep under parts of the Louisiana coast are huge underground bodies of salt called salt domes. Salt is so tightly packed that gas cannot leak through it. Engineers can hollow out a cave inside the salt with water and keep natural gas there until it is needed. Placing the store shows why salt makes a good sealed box."
    },
    {
      id: "say-where-the-electrical-energy-ends",
      kind: "select",
      target: "lke-result-card",
      title: "Say where the electrical energy ends up",
      cue: "Choose the sentence that says what happens to the energy the computers use.",
      why: "You felt the warm air and read the warm water. A good answer says that the electrical energy does not vanish: almost all of it turns into heat inside the computers, and the cooling plant carries that heat out of the building. It says what the model showed and nothing more."
    },
    {
      id: "spot-the-jobs-that-keep-the",
      kind: "find",
      noHint: true,
      targets: [
        "lke-electrician",
        "lke-hvac",
        "lke-network"
      ],
      itemNames: {
        "lke-electrician": "an electrician at the switchgear",
        "lke-hvac": "a cooling technician at the chiller",
        "lke-network": "a network technician at a rack"
      },
      itemNotes: {
        "lke-electrician": "Keeps the power flowing.",
        "lke-hvac": "Carries the heat away.",
        "lke-network": "Connects the computers."
      },
      decoyNotes: {
        "lke-visitor": "Welcome, but not keeping the power on."
      },
      title: "Spot the jobs that keep the power on",
      cue: "Look around the model campus and mark three kinds of work that keep the building running.",
      why: "A big computer building needs many trades. Electricians install and look after the wiring and switchgear. Heating and cooling technicians run the chillers and pumps. Network technicians connect the servers so they can talk to one another. These are kinds of work people train for, and each one uses the science in this lesson."
    },
    {
      id: "follow-the-heat-out-of-the",
      kind: "track",
      target: "lke-heat-track",
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
      title: "Follow the heat out of the building",
      cue: "Keep the marker on the warm water as it flows from the computers to the cooling tower.",
      why: "Following the warm water shows the last step of the energy's journey. It leaves the computers, travels to the cooling plant, and gives up its heat to the outside air. Then the cooled water flows back to pick up more. The loop never stops while the computers are working.",
      holdBreakNote: "The marker lost the warm water. Find it again and follow it to the tower."
    },
    {
      id: "record-each-form-the-energy-took",
      kind: "select",
      target: "lke-energy-log",
      doneLine: "Energy path recorded",
      title: "Record each form the energy took",
      cue: "Write one line each for stored, moving, electrical and heat energy.",
      why: "Naming each form in order shows the whole journey in a few lines. Anyone reading your record can see that the energy was never lost, only changed. Engineers draw the same kind of energy path when they plan a building, so they know how much power and cooling it will need."
    },
    {
      id: "compare-energy-paths-with-another-group",
      kind: "select",
      target: "lke-share-board",
      doneLine: "Paths compared",
      title: "Compare energy paths with another group",
      cue: "Put your energy path next to another group's and check that nothing went missing.",
      why: "If two groups tracked the same energy, their paths should match. Comparing them catches a step one group forgot. Crews check each other's plans in the same way before work starts, because a second pair of eyes spots gaps that the first one missed."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "lke-checkin",
      doneLine: "Checked in",
      title: "Check in before leaving the campus",
      cue: "Where does the energy start and where does it end? Why does the building need cooling?",
      why: "The electrician finishes the tour by checking what the class understood. Each learner names the first and last form of the energy and one reason for the cooling plant. If anyone still thinks the energy just gets used up, the group sorts it out now."
    }
  ],

  interrupts: [
    {
      id: "a-storm-rolls-in-over-the-yard",
      kind: "Weather",
      after: "hold-the-crank-to-light-the",
      delay: 3,
      seconds: 12,
      target: "lke-go-inside",
      alert: "Thunder rumbles and dark clouds roll over the substation yard.",
      cue: "Walk with the class into the building and wait until the storm has passed.",
      why: "If you can hear thunder, lightning is close enough to reach you, and tall metal equipment and open yards are the wrong place to be. Moving indoors straight away is what the crew does too.",
      missNote: "The class stayed in the open yard while the thunder got closer. When you hear thunder, go inside a building straight away and stay there until the storm has passed.",
      wrongNote: "That keeps the class outside. Move indoors now. Choose the response that deals with it now."
    },
    {
      id: "the-electrician-asks-about-the-generator",
      kind: "Crew question",
      after: "follow-the-heat-out-of-the",
      delay: 3,
      seconds: 12,
      target: "lke-name-motion",
      alert: "The electrician asks what a generator actually does.",
      cue: "Say that a generator turns spinning motion into electrical energy.",
      why: "The crank showed it: turning made the bulbs glow. Every power plant, whatever its fuel, spins a generator. Knowing that links the whole energy path together.",
      missNote: "You could not say what a generator does, and the electrician explained before the tour went on.",
      wrongNote: "That does not describe the generator. Say what it turns into what. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0xd8a33a;
    const CSS = "#d8a33a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6e7076", base2: "#606268", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e6e2d8", base2: "#d4cfc2", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
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
    bead(-1.22, 0.9, -0.27, "lke-gas", "the gas store", {});
    bead(-1.42, 1.18, -0.62, "lke-battery", "the battery bank", {});
    bead(-1.03, 1.46, -0.71, "lke-sun", "the solar panel in sunlight", {});
    bead(-1.08, 0.9, -1.11, "lke-fence", "the fence around the yard", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "lke-ord-burn", "1 · gas burns and spins a turbine", {});
    bead(-0.58, 1.46, -1.44, "lke-ord-generate", "2 · the generator makes electricity", {});
    bead(-0.24, 0.9, -1.23, "lke-ord-substation", "3 · the substation changes the voltage", {});
    bead(0, 1.18, -1.55, "lke-ord-chip", "4 · computers use it and give off heat", {});
    bead(0.24, 1.46, -1.23, "lke-crank-hold", "Hold the crank turning", {});
    bead(0.58, 0.9, -1.44, "lke-electrician", "an electrician at the switchgear", {});
    bead(0.68, 1.18, -1.05, "lke-hvac", "a cooling technician at the chiller", {});
    bead(1.08, 1.46, -1.11, "lke-network", "a network technician at a rack", {});
    bead(1.03, 0.9, -0.71, "lke-visitor", "a visitor at the front desk", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "lke-go-inside", "Move indoors with the class", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "lke-name-motion", "Say a generator turns motion into electricity", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "lke-line-card", "Behind the line", "OUTSIDE\nTHE FENCE", { ry: 1.2 });
    dials["lke-load-dial"] = dial(-1.89, -1.4, 0.93, "lke-load-dial", "Load dial");
    meters["lke-temp-meter"] = meter(-1.45, -1.85, 0.67, "lke-temp-meter", "Cooling water temperature");
    tokens["lke-gas-store"] = token(-0.92, -2.16, 0.4, "lke-gas-store", "Gas store");
    spots["lke-dome-spot"] = spot(-0.31, -2.33, 0.13, "lke-dome-spot", "The space in the salt");
    card(0.31, 1.35, -2.33, "lke-result-card", "State where it goes", "WHERE DOES\nIT GO?", { ry: -0.13 });
    meters["lke-heat-track"] = meter(0.92, -2.16, -0.4, "lke-heat-track", "Heat followed");
    boards["lke-energy-log"] = board(1.45, -1.85, -0.67, "lke-energy-log", "Energy record");
    boards["lke-share-board"] = board(1.89, -1.4, -0.93, "lke-share-board", "Compare paths");
    boards["lke-checkin"] = board(2.19, -0.85, -1.2, "lke-checkin", "End-of-tour check-in");
    hazardCard(-1.53, 0.72, -1.21, "open-the-substation-gate", "Open the substation fence to look closer?", "OPEN\nGATE", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "energy-gets-used-up", "Say the energy just gets used up?", "USED\nUP?", 0.3);
    hazardCard(0.58, 0.72, -1.86, "touch-a-fallen-line", "Pick up the fallen wire in the model?", "PICK\nUP", -0.3);
    hazardCard(1.53, 0.72, -1.21, "unplug-to-save-power", "Pull the plug on a server rack to save power?", "PULL\nPLUG", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Outside the fence with the electrician."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Electrician", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Cooling technician", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-storm-rolls-in-over-the-yard"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-storm-rolls-in-over-the-yard"].visible = false;
    arrivals["the-electrician-asks-about-the-generator"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-electrician-asks-about-the-generator"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "place-the-gas-store-in-the") { const s = spots["lke-dome-spot"]; tokens["lke-gas-store"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-each-form-the-energy-took") repaint(boards["lke-energy-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Energy path recorded"], "#59c97b"));
        if (step.id === "compare-energy-paths-with-another-group") repaint(boards["lke-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Paths compared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["lke-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-where-the-electrical-energy-ends") paintGuide("Energy changes form; it never vanishes.");
      },

      onHazard() {
        paintGuide("Stop. Stay behind the yellow line.");
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
        if (it.id === "a-storm-rolls-in-over-the-yard") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Class indoors, the storm passed. The lesson carries on."); }
        if (it.id === "the-electrician-asks-about-the-generator") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Generator explained. The lesson carries on."); }
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
