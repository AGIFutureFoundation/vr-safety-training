import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace,
  shell, ceilingGrid, spreadLayout, mergeStatic, counter, particles, markInteractive, mat, clamp,
} from "../../../shared/kit.js";
import { noticeBoard, racking, sideBench, spillStation, wasteBin , bayCrew, breatheCrew } from "../shopfit.js";

// Room 03 — Commercial cook: the hot line. Hand hygiene, colour-coded boards,
// cook temperature, and the grease flare-up that every kitchen eventually gets.

const SS = 0xb4bcc3, SS_DARK = 0x767e86, GRATE = 0x2b2f34;

export const ROOM_KITCHEN = {
  id: "kitchen",
  trade: "Commercial cook",
  title: "Hot Line",
  tagline: "Hand hygiene, cross-contamination control, cook temperature and a grease flare-up",
  union: "UNITE HERE — hospitality and food service workers",
  certification: "ANSI-accredited food handler card and ServSafe Food Protection Manager (FDA Food Code: hand hygiene, cross-contamination, cook temperatures, three-compartment warewashing); NSF/ANSI 2 food equipment and NSF/ANSI 7 refrigerated storage; NFPA 96 ventilation control and fire protection of commercial cooking operations; OSHA 29 CFR 1910.157 portable extinguishers (Class K) and 1910.22 walking-working surfaces",
  accent: 0xf2894b,
  accentCss: "#f2894b",
  parSeconds: 235,
  // The shell this room builds, so the app can let the learner walk to the
  // walls instead of clamping them to a circle in the middle of the floor.
  size: { w: 14.6, d: 13.9 },
  spawn: { x: 0.0, z: 4.9, ry: 0 },
  badge: { id: "clean-line", name: "Clean Line", note: "Full service with no cross-contamination and a controlled flare-up" },

  hazards: {
    "green-board": "That is the produce board. Raw poultry on a board that goes back to salad is textbook cross-contamination — the pathogen does not care that you rinsed it.",
    "water-jug": "Never water on a grease fire. Cooking oil burns far above the boiling point of water, so a jug of it flashes to steam underneath the surface and throws burning oil across the line. Cut the gas and smother it.",
    "sink-knife": "There is a blade under the water in that soak tub. Knives never go into cloudy water — the next person plunging a hand in to fish out a whisk finds the edge before they ever see it.",
    "salad-station": "Those are ready-to-eat greens and you still have raw chicken on your hands. Ready-to-eat food gets no further kill step, so whatever you carry across from the raw side reaches the customer alive.",
    "extinguisher-a": "That is a water-based Class A extinguisher. On burning oil it does exactly what the water jug does. The kitchen unit is the wet chemical Class K by the range, which saponifies the oil instead of splashing it.",
  },

  lateNotes: {
    "chef-knife": "Board and sanitiser first. A knife in your hand over a surface that has not had its sanitiser contact time is a shortcut you cannot take back.",
    "raw-tray": "Nothing goes near the heat before it is portioned — uneven pieces reach different internal temperatures, and the probe reading you take will only be true for the piece you probed.",
    "hot-well": "Hot holding is for cooked product that has already passed its temperature check. Putting undercooked product in a well only holds it in the danger zone for longer.",
  },

  steps: [
    {
      id: "handwash", kind: "hold", target: "hand-sink", seconds: 20,
      title: "Wash hands — full 20 seconds",
      cue: "Hold at the hand sink and scrub for the full twenty seconds.",
      why: "The twenty seconds is friction time, not rinse time: soap lifts the soil and the scrubbing physically carries organisms off the skin and down the drain. Norovirus, which causes more restaurant outbreaks than every other pathogen combined, is untouched by hand gel and survives a three-second rinse intact.",
      holdBreakNote: "You stopped short. Restart the full twenty seconds — a partial wash moves contamination around your hands instead of removing it.",
    },
    {
      id: "board", kind: "select", target: "red-board",
      title: "Take the raw-poultry board",
      cue: "Pull the correct colour-coded board for raw chicken.",
      why: "Red is raw meat and poultry. Colour coding exists so the decision stays visible from across the line under service pressure rather than remembered — and so the board that carried salmonella never turns up under a salad, where nothing downstream will ever kill it again.",
    },
    {
      id: "sanitize-board", kind: "hold", target: "sani-spray", seconds: 8,
      title: "Sanitise the board and let it stand",
      cue: "Spray the board and hold while the sanitiser stands for its contact time.",
      why: "Cleaning removes soil and sanitising reduces what survived it — two separate actions the Food Code treats separately. A sanitiser only earns its kill claim at label concentration for the full wet contact time, so spraying and immediately wiping it dry takes the chemical away before it has done anything at all.",
      holdBreakNote: "Wiped off early. The surface went dry before the sanitiser reached its contact time, so that board is clean and not sanitised — spray it again and let it stand.",
    },
    {
      id: "knife", kind: "select", target: "chef-knife",
      title: "Draw a knife from the rack",
      cue: "Take the chef knife off the magnetic strip.",
      why: "Knives live on the rack or in your hand and nowhere else. Lacerations are the most common injury on a hot line and most of them land on the second person — whoever reached into a sink, under a towel or across a cluttered board for something else and found an edge nobody had told them was there.",
    },
    {
      id: "cut", kind: "gauge", target: "cut-board",
      title: "Portion to an even thickness",
      cue: "Slice to the target portion thickness and commit inside the band.",
      why: "Even portions reach temperature together. Ragged thickness leaves the thin end dry and stringy while the thick end is still under 165 °F, and because you only ever probe one piece, the reading you write down is true for that piece and a guess for the rest of the tray.",
      gauge: {
        label: "PORTION THICKNESS", speed: 0.9, green: [0.42, 0.56],
        readout: (t) => `${(6 + t * 30).toFixed(1)} mm`,
        missNote: "Off the spec portion. Reset your claw grip, guide the blade with your knuckles and cut again.",
      },
    },
    {
      id: "cook", kind: "drag", target: "raw-tray",
      title: "Carry the portions to the flat top",
      cue: "Pick up the tray of portioned chicken and set it down on the flat top.",
      why: "Product goes straight from board to heat. 41 °F to 135 °F is the temperature danger zone, and on raw poultry sitting in it the bacterial load can double roughly every twenty minutes — the tray parked on the bench while a burner comes up to heat is the delay that spends your margin before cooking has even started.",
      drag: { to: "flat-top", radius: 0.5, missNote: "Not on the griddle — carry the tray right onto the flat top surface, not the rail beside it." },
    },
    {
      id: "temp", kind: "gauge", target: "probe",
      title: "Probe the internal temperature",
      cue: "Probe the thickest part and commit when the reading is safe for poultry.",
      why: "Poultry is done at 165 °F in the thickest part, the point where the required lethality is reached essentially on contact. Colour, firmness and clear juices all turn well before that and all three of them lie, which is why the Food Code names a temperature and a calibrated thermometer rather than an appearance.",
      gauge: {
        label: "PROBE — INTERNAL TEMP", speed: 0.6, green: [0.72, 0.86],
        readout: (t) => `${Math.round(40 + t * 160)} °F`,
        missNote: "Not there yet — or well past it. Poultry needs 165 °F at the thickest part; probe the centre, not the edge that cooked first.",
      },
    },
    {
      id: "kill-heat", kind: "turn", target: "burner-knob",
      title: "Cut the heat",
      cue: "The pan behind you has flared. Turn the burner valve all the way to OFF.",
      why: "Fuel first. A burner still firing under a pan of burning oil feeds the flame faster than any lid can starve it, and it relights the instant the cover shifts. Take the valve all the way round to its stop — a gas cock left part way round is still passing gas into the fire.",
      turn: { turns: 0.35, axis: "z", label: "BURNER 2 — GAS VALVE" },
    },
    {
      id: "smother", kind: "select", target: "pan-lid",
      title: "Smother the flare-up",
      cue: "Cover the pan with the lid and leave it covered.",
      why: "A tight lid starves the fire of oxygen and keeps the burning oil inside the pan, which is the other half of the job. Leave it on until the pan is cool to the hand: oil still above its autoignition point relights on its own the second air reaches it, and it does that into the face of whoever lifted the lid to look.",
    },
    {
      id: "hot-hold", kind: "select", target: "hot-well",
      title: "Move to hot holding",
      cue: "Transfer the cooked portions into the hot well.",
      why: "Hot holding is 135 °F or above, continuously, and it holds food rather than cooking it. Let the well drop below that and you have stopped killing and started incubating, with a four-hour discard clock running from the moment the product fell out of temperature and a bin at the end of it.",
    },
    {
      id: "warewash", kind: "sequence",
      targets: ["sink-wash", "sink-rinse", "sink-sani"],
      itemNames: { "sink-wash": "wash — detergent", "sink-rinse": "rinse — clear water", "sink-sani": "sanitise — final soak" },
      itemNotes: {
        "sink-wash": "Detergent and friction take the fat and protein off. No sanitiser works through a film of chicken fat.",
        "sink-rinse": "Clear water carries the detergent away. Detergent dragged into the third sink neutralises the sanitiser sitting in it.",
      },
      title: "Run the board through the three-compartment sink",
      cue: "Wash, rinse, then sanitise — the raw-poultry board goes through all three, in that order.",
      why: "Three compartments in a fixed order, because each one undoes the last if you swap them: detergent carried into the sanitiser neutralises it, and a board rinsed after sanitising has had the sanitiser washed straight back off. This is the board that held raw chicken, and it is the last thing standing between that and tomorrow's prep.",
      outOfOrderNote: "Wrong compartment for this point in the sequence. Wash, rinse, sanitise — the order is the control, and taking them out of order quietly cancels the compartment before it.",
    },
  ],

  // Two things that arrive while the cook's hands are already full. One is
  // the building; one is another person. See shared/game.js.
  interrupts: [
    {
      id: "oil-spill",
      kind: "Floor hazard",
      after: "cut", delay: 4, seconds: 13,
      alert: "A porter has just tipped a tray of fryer oil across the walkway behind you and carried straight on to the walk-in.",
      cue: "That slick is between you and the range, and you are about to walk it carrying hot product.",
      target: "spill-kit",
      why: "Slips and falls are the largest single source of lost-time injury in commercial kitchens, and OSHA 1910.22 puts the duty on keeping the walking surface clean and dry rather than on telling people to watch their step. The spill gets coned and mopped before anybody crosses it — starting with you, thirty seconds from now, with a pan in both hands.",
      missNote: "The oil stayed where it was. You crossed it carrying a sauté pan and the second cook crossed it behind you; a film of fryer oil on quarry tile has about the grip of wet ice, and the fall that follows normally puts whatever was in your hands onto whoever tried to catch you.",
      wrongNote: "It is the wet-floor kit by the pass. Cone the slick and mop it before anyone else takes that route across the line.",
    },
    {
      id: "hood-down",
      kind: "Ventilation failure",
      after: "temp", delay: 3, seconds: 12,
      alert: "The canopy has gone quiet. The hood lamp is red and smoke off the flat top is rolling out over the pass instead of going up the duct.",
      cue: "Nothing cooks under a dead hood. Find the control, not the pan.",
      target: "hood-switch",
      why: "NFPA 96 requires the exhaust system to be running whenever the cooking appliances under it are operating. The canopy is not only there for smoke: it is the capture path the wet chemical system discharges into, so with the fan stopped a flare-up spreads sideways along the ceiling instead of being drawn up and away from the line.",
      missNote: "You finished the cook under a dead canopy. Grease-laden vapour that should have gone up the duct condensed across the ceiling and the light fittings over the pass, and the flare-up that arrives one step from now had nothing pulling it away from you.",
      wrongNote: "It is the hood control hanging off the end of the canopy. Until that fan is running again, nothing on this line should be lit.",
    },
  ],

  build(root) {
    // The shell, the fittings and the shop furniture never move and are
    // never clicked, so they go in one group that is baked into a handful
    // of meshes at the end of the build. See mergeStatic in shared/kit.js.
    const fixed = group(root);
    const hits = {};
    const reg = (obj, id) => { markInteractive(obj, id); hits[id] = obj; return obj; };

    shell(fixed, {
      w: 14.6, d: 13.9, h: 4.0,
      floor: 0x4e4a46, wall: 0xd8dde1, ceiling: 0xc9ced3,
      floorRough: 0.7, skirtColor: 0x8d949b,
          walkway: { lane: 0xe0562c, hatch: 0x9aa2a8, laneFrac: 0.38 },
      trim: 0xb7431f, structure: "pipes", structureColor: 0x8d959d, door: "personnel",
});
    // Quarry-tile grid on the floor.
    for (let i = -6; i <= 6; i++) {
      box(root, 8.9, 0.004, 0.018, 0, 0.004, i * 0.62, 0x3c3936, { cast: false, receive: false });
      box(root, 0.018, 0.004, 8.5, i * 0.62, 0.004, 0, 0x3c3936, { cast: false, receive: false });
    }
    // Anti-fatigue mat in front of the range.
    slab(root, 2.6, 0.02, 0.9, -1.2, 0.012, -1.9, 0x22262b, { radius: 0.04, rough: 0.95, cast: false });
    for (let i = 0; i < 7; i++) for (let j = 0; j < 3; j++) {
      box(root, 0.1, 0.006, 0.1, -2.2 + i * 0.34, 0.024, -2.15 + j * 0.26, 0x14171a, { cast: false, receive: false });
    }

    // ------------------------------------------------------------- the range
    const range = group(root, -1.4, 0, -3.5);
    counter(range, 2.5, 0.86, 0, 0, SS_DARK, { height: 0.9, metal: 0.8, rough: 0.3, undershelf: false });
    box(range, 2.5, 0.5, 0.84, 0, 0.6, 0, SS_DARK, { rough: 0.32, metal: 0.78 });
    box(range, 2.5, 0.06, 0.86, 0, 0.92, 0, 0x2f3439, { rough: 0.5, metal: 0.5 });
    // Four open burners with grates and pilot flames.
    const burners = [];
    for (let i = 0; i < 4; i++) {
      const bx = -0.86 + (i % 2) * 0.56, bz = -0.2 + Math.floor(i / 2) * 0.42;
      const b = group(range, bx, 0.95, bz);
      cyl(b, 0.11, 0.13, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.75, seg: 18 });
      for (let s = 0; s < 6; s++) {
        const bar = box(b, 0.02, 0.02, 0.24, 0, 0.03, 0, GRATE, { rough: 0.8 });
        bar.rotation.y = (s * Math.PI) / 6;
      }
      const flame = cyl(b, 0.02, 0.075, 0.06, 0, 0.02, 0, 0x4aa3ff,
        { emissive: 0x2f7fff, ei: 2.4, rough: 0.4, opacity: 0.75, seg: 14, cast: false });
      flame.visible = i === 1;
      burners.push(flame);
    }
    // Flat top griddle to the right of the burners.
    const flatTop = group(range, 0.66, 0.95, 0.1);
    slab(flatTop, 0.82, 0.05, 0.72, 0, 0, 0, 0x33383d, { radius: 0.02, rough: 0.42, metal: 0.6 });
    box(flatTop, 0.86, 0.05, 0.04, 0, 0.03, -0.37, SS_DARK, { rough: 0.35, metal: 0.8 });
    const chicken = [];
    for (let i = 0; i < 3; i++) {
      const c = slab(flatTop, 0.16, 0.035, 0.11, -0.2 + i * 0.2, 0.045, 0.06, 0xe8c9a0, { radius: 0.03, rough: 0.75 });
      c.visible = false;
      chicken.push(c);
    }
    reg(flatTop, "flat-top");
    const griddleSteam = particles(flatTop, 60, 0xdfe8ee, { size: 0.05, life: 1.1, additive: false, opacity: 0.28 });

    // Burner control knobs along the front rail. Burner 2's valve is its own
    // group so the turn step can spin that one knob and leave the rest alone.
    const knobRow = group(range, 0, 0.78, 0.45);
    let burnerKnob = null;
    for (let i = 0; i < 4; i++) {
      const knob = group(knobRow, -0.86 + i * 0.38, 0, 0);
      cyl(knob, 0.036, 0.04, 0.05, 0, 0, 0, 0x1b1e22, { rough: 0.55, seg: 16 }).rotation.x = Math.PI / 2;
      box(knob, 0.008, 0.03, 0.052, 0, 0.018, 0.001, 0xf2ae14, { rough: 0.5 });
      if (i === 1) burnerKnob = knob;
    }
    reg(burnerKnob, "burner-knob");

    // Sauté pan on burner 2 — this is what flares up.
    const pan = group(range, -0.3, 0.99, 0.22);
    lathe(pan, [[0.001, 0], [0.1, 0.004], [0.115, 0.05], [0.12, 0.06], [0.112, 0.058], [0.095, 0.008], [0.001, 0.003]],
      0, 0, 0, 0x4a4f55, { rough: 0.35, metal: 0.7, seg: 24 });
    const panHandle = cyl(pan, 0.012, 0.014, 0.24, 0, 0.04, 0.2, 0x22262b, { rough: 0.6, seg: 10 });
    panHandle.rotation.set(Math.PI / 2.3, 0, 0);
    const oil = cyl(pan, 0.09, 0.088, 0.012, 0, 0.02, 0, 0xd8a44e, { rough: 0.2, metal: 0.1, seg: 22 });
    const fire = particles(pan, 120, 0xff9a3c, { size: 0.05, life: 0.5 });
    const smoke = particles(pan, 60, 0x9aa0a6, { size: 0.09, life: 1.4, additive: false, opacity: 0.22 });
    const fireLight = new THREE.PointLight(0xff8a3c, 0, 7, 2);
    fireLight.position.set(-1.7, 1.4, -3.3);
    root.add(fireLight);

    // The lid, hanging on the rail — the correct response.
    const lid = group(range, 0.2, 1.42, -0.36);
    lathe(lid, [[0.001, 0.03], [0.06, 0.028], [0.1, 0.018], [0.118, 0.002], [0.118, 0], [0.001, 0]], 0, 0, 0, 0x9aa1a8,
      { rough: 0.3, metal: 0.8, seg: 24 });
    ball(lid, 0.018, 0, 0.045, 0, 0x22262b, { rough: 0.6 });
    reg(lid, "pan-lid");

    // Ventilation hood with baffle filters and a turning fan.
    const hood = group(root, -1.4, 0, -3.5);
    box(hood, 2.8, 0.5, 1.15, 0, 2.35, 0, SS, { rough: 0.3, metal: 0.85 });
    box(hood, 2.9, 0.1, 1.25, 0, 2.06, 0, SS, { rough: 0.3, metal: 0.85 });
    for (let i = 0; i < 6; i++) {
      const baffle = box(hood, 0.42, 0.34, 0.03, -1.05 + i * 0.42, 2.2, 0.5, 0x8d959d, { rough: 0.35, metal: 0.9 });
      baffle.rotation.x = 0.35;
    }
    cyl(hood, 0.26, 0.26, 0.5, 0.7, 2.85, 0, SS, { rough: 0.3, metal: 0.85, seg: 20 });
    const hoodFan = group(hood, 0.7, 2.62, 0);
    for (let i = 0; i < 5; i++) {
      const blade = box(hoodFan, 0.2, 0.008, 0.06, 0, 0, 0, 0x6f767d, { rough: 0.4, metal: 0.7, cast: false });
      blade.rotation.y = (i * Math.PI * 2) / 5;
      blade.rotation.z = 0.4;
    }
    decal(hood, 0.9, 0.16, 0, 2.5, 0.6, signFace("HOOD ON", { bg: "#1f2429", accent: "#f2894b", scale: 0.55 }));
    // Run/stop station hanging off the end of the canopy, with the status lamp
    // that goes red when the fan drops out from under the cook.
    const hoodPanel = group(hood, 1.25, 1.85, 0.5);
    box(hoodPanel, 0.26, 0.2, 0.07, 0, 0, 0, SS, { rough: 0.3, metal: 0.8 });
    cyl(hoodPanel, 0.012, 0.012, 0.24, 0, 0.22, -0.02, SS, { rough: 0.3, metal: 0.8, seg: 8 });
    const hoodLamp = ball(hoodPanel, 0.022, -0.07, 0.035, 0.04, 0x59c97b,
      { emissive: 0x59c97b, ei: 2.2, rough: 0.3 });
    box(hoodPanel, 0.03, 0.05, 0.03, 0.06, 0.03, 0.045, 0x22262b, { rough: 0.5 });
    decal(hoodPanel, 0.2, 0.05, 0, -0.06, 0.037,
      signFace("HOOD RUN / STOP", { bg: "#1f2429", accent: "#f2894b", scale: 0.42 }));
    reg(hoodPanel, "hood-switch");
    // Grease-laden vapour spilling out under the canopy lip once the fan stops.
    const hoodRollout = particles(hood, 70, 0xb8bfc6, { size: 0.11, life: 1.6, additive: false, opacity: 0.3 });

    // ------------------------------------------------------------ prep table
    const prep = counter(root, 2.4, 0.85, 1.9, -1.0, SS, { height: 0.92, metal: 0.8, rough: 0.28, ry: -Math.PI / 2 });
    // Colour-coded board rack.
    const rack = group(prep, 0, 0.95, -0.28);
    box(rack, 0.5, 0.02, 0.3, 0, 0, 0, SS_DARK, { rough: 0.4, metal: 0.7 });
    const boardColours = [
      { id: "red-board", c: 0xc0392b, label: "RAW MEAT", x: -0.16 },
      { id: "green-board", c: 0x27904e, label: "PRODUCE", x: 0 },
      { id: "blue-board", c: 0x2d6fb5, label: "SEAFOOD", x: 0.16 },
    ];
    for (const b of boardColours) {
      const bd = slab(rack, 0.28, 0.014, 0.02, b.x, 0.12, 0, b.c, { radius: 0.006, rough: 0.6 });
      bd.rotation.x = -0.18;
      reg(bd, b.id);
    }
    // Working board on the table, where the cutting happens.
    const cutBoard = slab(prep, 0.46, 0.016, 0.32, 0, 0.935, 0.1, 0xc0392b, { radius: 0.01, rough: 0.6 });
    cutBoard.visible = false;
    reg(cutBoard, "cut-board");
    // The sheet pan the portions are carried to the heat on. Empty and dull
    // until the cutting is done; it is the thing the cook picks up and walks.
    const rawTray = group(prep, 0.78, 0.95, 0.1);
    slab(rawTray, 0.34, 0.02, 0.26, 0, 0, 0, SS_DARK, { radius: 0.01, rough: 0.35, metal: 0.75 });
    for (const [tw, td, tx, tz] of [[0.34, 0.03, 0, -0.13], [0.34, 0.03, 0, 0.13]]) {
      box(rawTray, tw, 0.035, td, tx, 0.025, tz, SS_DARK, { rough: 0.35, metal: 0.75 });
    }
    reg(rawTray, "raw-tray");
    const rawPortions = [];
    for (let i = 0; i < 3; i++) {
      const p = slab(rawTray, 0.09, 0.03, 0.14, -0.11 + i * 0.11, 0.03, 0, 0xe9bfa8, { radius: 0.03, rough: 0.8 });
      p.visible = false;
      rawPortions.push(p);
    }

    // Magnetic knife strip on the wall above the prep table.
    const strip = group(root, 4.24, 0, -1.0, -Math.PI / 2);
    box(strip, 0.7, 0.05, 0.03, 0, 1.62, 0, 0x2b2f34, { rough: 0.5, metal: 0.6 });
    const knifeSpecs = [[0.2, 0.19], [0.06, 0.15], [-0.08, 0.13], [-0.22, 0.1]];
    knifeSpecs.forEach(([kx, len], i) => {
      const k = group(strip, kx, 1.5, 0.02);
      box(k, 0.032, len, 0.004, 0, -len / 2 + 0.04, 0, 0xdfe4e8, { rough: 0.12, metal: 0.95 });
      box(k, 0.024, 0.1, 0.016, 0, 0.09, 0, 0x22262b, { rough: 0.6 });
      if (i === 0) reg(k, "chef-knife");
    });
    decal(strip, 0.66, 0.1, 0, 1.75, 0.02, signFace("KNIVES — RETURN AFTER USE", { scale: 0.5 }));

    // Sanitiser spray and bucket.
    const sani = group(prep, 0.38, 0.94, -0.06);
    lathe(sani, [[0.001, 0], [0.035, 0.004], [0.038, 0.02], [0.038, 0.15], [0.03, 0.17], [0.016, 0.18], [0.016, 0.2], [0.001, 0.203]],
      0, 0, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.85, seg: 16 });
    cyl(sani, 0.014, 0.014, 0.11, 0, 0.09, 0, 0x59c97b, { rough: 0.3, opacity: 0.8, seg: 12 });
    box(sani, 0.03, 0.05, 0.05, 0, 0.225, 0.01, 0x2b6f47, { rough: 0.6 });
    box(sani, 0.02, 0.02, 0.05, 0, 0.21, 0.045, 0x2b6f47, { rough: 0.6 });
    decal(sani, 0.06, 0.05, 0, 0.1, 0.04, signFace("SANI", { bg: "#dfe4e8", fg: "#1d3b2a", accent: "#59c97b", scale: 0.6 }));
    reg(sani, "sani-spray");

    // Probe thermometer in its sleeve.
    const probe = group(prep, -0.5, 0.94, -0.04, 0.4);
    slab(probe, 0.045, 0.02, 0.11, 0, 0.01, 0, 0xf2ae14, { radius: 0.008, rough: 0.55 });
    cyl(probe, 0.0035, 0.0035, 0.13, 0, 0.012, 0.12, 0xdfe4e8, { rough: 0.15, metal: 0.95, seg: 8 })
      .rotation.x = Math.PI / 2;
    const probeScreen = decal(probe, 0.035, 0.02, 0, 0.021, -0.02,
      signFace("--", { bg: "#12191f", accent: "#f2894b", fg: "#ffd9b0", scale: 0.7 }), { glow: true, ei: 0.7 });
    probeScreen.rotation.x = -Math.PI / 2;
    reg(probe, "probe");

    // ------------------------------------------------------------- hand sink
    const handSink = group(root, -4.2, 0, -0.4, Math.PI / 2);
    box(handSink, 0.5, 0.34, 0.4, 0, 0.9, 0, SS, { rough: 0.25, metal: 0.85 });
    box(handSink, 0.42, 0.02, 0.32, 0, 1.03, 0, 0x8d959d, { rough: 0.2, metal: 0.9 });
    cyl(handSink, 0.014, 0.014, 0.26, 0, 1.2, -0.14, SS, { rough: 0.18, metal: 0.95, seg: 14 });
    hose(handSink, [[0, 1.33, -0.14], [0, 1.38, -0.06], [0, 1.32, 0.02]], 0.012, SS, { steps: 10, rough: 0.18, metal: 0.9 });
    box(handSink, 0.08, 0.14, 0.08, 0.28, 1.24, -0.08, 0xe4e8eb, { rough: 0.5 });     // soap dispenser
    box(handSink, 0.16, 0.22, 0.09, -0.3, 1.3, -0.08, 0xe4e8eb, { rough: 0.5 });      // towel dispenser
    decal(handSink, 0.44, 0.14, 0, 1.55, 0.02,
      signFace("HANDWASHING ONLY", { bg: "#1d3b63", accent: "#6cc6f0", scale: 0.5 }));
    const washWater = particles(handSink, 60, 0xbfe0f2, { size: 0.011, life: 0.3, additive: false, opacity: 0.65 });
    reg(handSink, "hand-sink");

    // Three-compartment sink — wash, rinse, sanitise, in that order — with a
    // soak tub on the drainboard and a blade under its cloudy water.
    const bigSink = group(root, -4.2, 0, 1.8, Math.PI / 2);
    counter(bigSink, 2.4, 0.6, 0, 0, SS, { height: 0.9, metal: 0.8, rough: 0.28, undershelf: false });
    const compartments = [
      { id: "sink-wash", water: 0x38708a },
      { id: "sink-rinse", water: 0x2f6f8a },
      { id: "sink-sani", water: 0x2f8a7a },
    ];
    compartments.forEach((c, i) => {
      const bx = -0.9 + i * 0.55;
      const basin = box(bigSink, 0.48, 0.26, 0.44, bx, 0.79, 0, 0x8d959d, { rough: 0.25, metal: 0.85 });
      box(bigSink, 0.44, 0.02, 0.4, bx, 0.9, 0, c.water, { rough: 0.12, metal: 0.2, opacity: 0.78 });
      reg(basin, c.id);
    });
    decal(bigSink, 1.5, 0.12, -0.35, 1.4, 0.02, signFace("WASH   RINSE   SANITISE", { scale: 0.45 }));
    // Utensils left soaking on the drainboard, with a boning knife in the tub.
    const soakTub = box(bigSink, 0.5, 0.22, 0.44, 0.82, 1.03, 0, 0x8d959d, { rough: 0.3, metal: 0.8 });
    box(bigSink, 0.46, 0.02, 0.4, 0.82, 1.11, 0, 0x5b6f72, { rough: 0.2, metal: 0.15, opacity: 0.82 });
    const soakBlade = box(bigSink, 0.026, 0.004, 0.19, 0.78, 1.095, 0.04, 0xdfe4e8, { rough: 0.2, metal: 0.9 });
    soakBlade.rotation.y = 0.3;
    cyl(bigSink, 0.012, 0.012, 0.2, 0.92, 1.12, -0.06, 0xc9a86a, { rough: 0.6, seg: 8 }).rotation.z = 1.2;
    decal(bigSink, 0.4, 0.09, 0.82, 1.28, 0.02, signFace("SOAK", { bg: "#1f2429", accent: "#6cc6f0", scale: 0.5 }));
    reg(soakTub, "sink-knife");

    // ------------------------------------------------- hot well & ready side
    const pass = group(root, 2.6, 0, 1.4);
    counter(pass, 2.2, 0.8, 0, 0, SS, { height: 0.92, metal: 0.8, rough: 0.28 });
    const well = group(pass, -0.4, 0.94, 0);
    box(well, 0.9, 0.04, 0.6, 0, 0, 0, SS_DARK, { rough: 0.35, metal: 0.8 });
    for (let i = 0; i < 2; i++) {
      box(well, 0.38, 0.14, 0.5, -0.22 + i * 0.44, 0.05, 0, 0x9aa1a8, { rough: 0.3, metal: 0.85 });
      box(well, 0.34, 0.02, 0.46, -0.22 + i * 0.44, 0.13, 0, 0xc98a4a, { rough: 0.5 });
    }
    const wellSteam = particles(well, 50, 0xe4ecf2, { size: 0.05, life: 1.2, additive: false, opacity: 0.22 });
    decal(pass, 0.7, 0.12, -0.4, 1.06, 0.34, signFace("HOT HOLD ≥ 135 °F", { bg: "#2b1a12", accent: "#f2894b", scale: 0.5 }))
      .rotation.x = -Math.PI / 2;
    reg(well, "hot-well");

    // Ready-to-eat salad station — the raw-to-ready trap.
    const salad = group(pass, 0.62, 0.95, 0);
    box(salad, 0.5, 0.12, 0.42, 0, 0.06, 0, 0xdfe4e8, { rough: 0.4, opacity: 0.6 });
    for (let i = 0; i < 16; i++) {
      const leaf = box(salad, 0.05, 0.012, 0.04, (Math.random() - 0.5) * 0.4, 0.11 + Math.random() * 0.02,
        (Math.random() - 0.5) * 0.32, [0x4b8f3a, 0x62a54a, 0x3c7a2e][i % 3], { rough: 0.85 });
      leaf.rotation.set(Math.random(), Math.random() * 3, Math.random());
    }
    decal(salad, 0.4, 0.08, 0, 0.2, 0.22, signFace("READY TO EAT", { bg: "#1c3320", accent: "#59c97b", scale: 0.5 }));
    reg(salad, "salad-station");

    // Wet-floor kit parked out of the traffic lane by the pass, and the slick
    // it exists for — invisible until somebody puts it on the floor.
    const spillKit = group(root, 3.3, 0, 1.0, -0.35);
    box(spillKit, 0.34, 0.02, 0.3, 0, 0.02, 0, 0xf2c14b, { rough: 0.6 });
    for (const sgn of [-1, 1]) {
      const leaf = box(spillKit, 0.3, 0.62, 0.02, 0, 0.33, sgn * 0.06, 0xf2c14b, { rough: 0.6 });
      leaf.rotation.x = sgn * 0.17;
    }
    decal(spillKit, 0.24, 0.16, 0, 0.38, 0.1,
      signFace("WET FLOOR", { bg: "#f2c14b", fg: "#1b1e22", accent: "#b81410", scale: 0.5 }));
    cyl(spillKit, 0.15, 0.12, 0.32, 0.36, 0.16, 0, 0x2f5d3a, { rough: 0.6, seg: 14 });
    cyl(spillKit, 0.014, 0.014, 1.15, 0.36, 0.72, -0.07, 0xa9814f, { rough: 0.8, seg: 8 }).rotation.x = 0.18;
    reg(spillKit, "spill-kit");

    const spill = group(root, -0.9, 0, -1.1);
    const slick = slab(spill, 1.5, 0.006, 0.95, 0, 0.009, 0, 0x6e5a28,
      { radius: 0.32, rough: 0.1, metal: 0.3, cast: false });
    slick.visible = false;

    // Ticket rail with service dockets.
    const rail = group(root, 2.6, 0, -0.4);
    cyl(rail, 0.012, 0.012, 2.0, 0, 1.62, 0, SS, { rough: 0.2, metal: 0.9, seg: 10 }).rotation.z = Math.PI / 2;
    for (let i = 0; i < 4; i++) {
      const t = decal(rail, 0.17, 0.24, -0.6 + i * 0.4, 1.48, 0.01,
        paperFace("TABLE " + (11 + i), ["2× grilled chicken", "1× side salad", "ALLERGY: none"], { bg: "#fbf7ee" }));
      t.rotation.z = (i % 2 ? 1 : -1) * 0.05;
    }

    // Fire equipment: correct Class K by the line, wrong water unit on the far wall.
    const classK = group(root, -3.0, 0, -4.2);
    cyl(classK, 0.09, 0.09, 0.52, 0, 0.55, 0, 0xb81410, { rough: 0.4, metal: 0.3, seg: 18 });
    cyl(classK, 0.06, 0.09, 0.1, 0, 0.85, 0, 0xb81410, { rough: 0.4, metal: 0.3, seg: 18 });
    box(classK, 0.14, 0.04, 0.05, 0, 0.92, 0, 0x22262b, { rough: 0.5 });
    hose(classK, [[0.05, 0.88, 0], [0.16, 0.7, 0.06], [0.1, 0.45, 0.02]], 0.012, 0x1b1e22, { steps: 12 });
    decal(classK, 0.14, 0.1, 0, 0.6, 0.095, signFace("K", { bg: "#f2ae14", fg: "#1b1e22", accent: "#b81410", scale: 0.9 }));
    decal(classK, 0.5, 0.12, 0, 1.3, 0.02, signFace("CLASS K — KITCHEN", { bg: "#2b1a12", accent: "#f2ae14", scale: 0.5 }));

    const waterExt = group(root, 4.2, 0, 2.6, -Math.PI / 2);
    cyl(waterExt, 0.085, 0.085, 0.5, 0, 0.5, 0, 0xb81410, { rough: 0.4, metal: 0.3, seg: 18 });
    decal(waterExt, 0.13, 0.09, 0, 0.55, 0.09, signFace("A", { bg: "#2d6fb5", fg: "#ffffff", accent: "#6cc6f0", scale: 0.9 }));
    reg(waterExt, "extinguisher-a");

    const jug = group(root, -2.2, 0, -2.6);
    lathe(jug, [[0.001, 0], [0.08, 0.005], [0.085, 0.03], [0.085, 0.26], [0.06, 0.3], [0.045, 0.31], [0.045, 0.34], [0.001, 0.342]],
      0, 0.92, 0, 0xdfe4e8, { rough: 0.25, opacity: 0.55, seg: 20 });
    cyl(jug, 0.078, 0.078, 0.2, 0, 1.02, 0, 0x3f7f9e, { rough: 0.15, opacity: 0.8, seg: 20 });
    counter(jug, 0.5, 0.5, 0, 0, SS_DARK, { height: 0.9, metal: 0.7, rough: 0.35, undershelf: false });
    reg(jug, "water-jug");

    // Wire shelving with hotel pans, for depth behind the pass.
    const shelf = group(root, 4.2, 0, -3.2, -Math.PI / 2);
    for (let s = 0; s < 4; s++) {
      box(shelf, 1.5, 0.02, 0.45, 0, 0.5 + s * 0.5, 0, 0x9aa1a8, { rough: 0.4, metal: 0.7 });
      for (let i = 0; i < 3; i++) {
        box(shelf, 0.38, 0.1, 0.3, -0.5 + i * 0.5, 0.57 + s * 0.5, 0, SS, { rough: 0.3, metal: 0.8 });
      }
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(shelf, 0.018, 0.018, 2.0, sx * 0.72, 1.0, sz * 0.2, 0x9aa1a8, { rough: 0.4, metal: 0.7, seg: 8 });
    }

    const key = new THREE.DirectionalLight(0xf2f6fa, 0.9);
    key.position.set(3, 5.5, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -6; key.shadow.camera.right = 6;
    key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
    root.add(key);
    root.add(new THREE.HemisphereLight(0xdce8f2, 0x353a40, 1.15));

    let flareOn = false;
    let cooking = false;
    let holding = false;
    let hoodRunning = true;

    // The bay is 14.6m by 13.9m now. Push the workstations out to match, so
    // the extra floor is distance between jobs rather than empty ring.
    spreadLayout(root, 1.62);

    const W = 14.6, D = 13.9;
    // ------------------------------------------------- the rest of the bay
    // Back of house: dry store racking, the chemical station, bins split the
    // way a health inspector expects, and the board with the rota on it.
    racking(fixed, -W / 2 + 0.55, -2.6, Math.PI / 2, { w: 3.0, h: 2.2, frame: 0x9aa3ab, stock: [0xc9bfa8, 0x8a7a5e, 0xb0a48c] });
    sideBench(fixed, -3.4, 4.6, 0.1, { w: 2.6, top: 0xb8c0c8 });
    noticeBoard(fixed, 1.6, D / 2 - 0.25, Math.PI, { w: 1.8 });
    wasteBin(fixed, W / 2 - 1.2, 4.2, -0.9, { color: 0x2f5d3a, lid: 0x24462c, label: "Food waste" });
    wasteBin(fixed, W / 2 - 2.0, 4.5, -0.9, { color: 0x2f4a63, lid: 0x24384a, label: "Dry mixed" });
    spillStation(fixed, -W / 2 + 1.2, 4.6, 0.8, { color: 0xc0392b });

    // A second cook on the line and a porter carrying stock through. A
    // kitchen with one person in it is not a kitchen.
    const crew = [
      bayCrew(root, 2.7, 0.7, -1.81, { task: "bench", cloth: 0xf2f2f2, legs: 0x2b3138, hiVis: false, hat: 0xf2f2f2 }),
      bayCrew(root, -4.1, -2.9, 0.95, { task: "carry", cloth: 0xdfe6ec, legs: 0x2b3138, hiVis: false, load: 0xc9bfa8 }),
    ];

    // Fittings on a grid sized to this floor, plus the bounce a real room
    // has and this one did not: see ceilingGrid in shared/kit.js.
    ceilingGrid(fixed, 14.6, 13.9, { color: 0xf6f9ff, ei: 1.4, lamp: 1.55, y: 3.84 });

    mergeStatic(fixed);

    return {
      hits,
      spawnLook: new THREE.Vector3(-1.4, 1.2, -3.2),

      onStep(step) {
        // The flare-up starts the moment the cook step is behind the learner.
        if (step.id === "kill-heat" && !flareOn) {
          flareOn = true;
          fire.visible = true;
          smoke.visible = true;
        }
      },

      onStepComplete(step) {
        if (step.id === "board") cutBoard.visible = true;
        if (step.id === "cut") rawPortions.forEach((p) => { p.visible = true; });
        if (step.id === "cook") {
          cooking = true;
          rawTray.visible = false;
          rawPortions.forEach((p) => { p.visible = false; });
          chicken.forEach((c) => { c.visible = true; });
        }
        if (step.id === "temp") chicken.forEach((c) => { c.material = mat(0xc98a4a, { rough: 0.7 }); });
        if (step.id === "kill-heat") { burners.forEach((b) => { b.visible = false; }); }
        if (step.id === "smother") {
          flareOn = false;
          fire.visible = false;
          smoke.visible = false;
          fireLight.intensity = 0;
          lid.position.set(-0.3, 1.03, 0.22);
          oil.visible = false;
        }
        if (step.id === "hot-well" || step.id === "hot-hold") {
          holding = true;
          chicken.forEach((c) => { c.visible = false; });
        }
        if (step.id === "warewash") cutBoard.visible = false;
      },

      // Both interruptions put something on the floor or on the wall the
      // moment they fire, not in the caption: a slick across the walkway, and
      // a canopy that has stopped with its lamp gone red.
      onInterrupt(it) {
        if (it.id === "oil-spill") slick.visible = true;
        if (it.id === "hood-down") {
          hoodRunning = false;
          hoodLamp.material = mat(0xb81410, { emissive: 0xb81410, ei: 2.6, rough: 0.3 });
          hoodRollout.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "oil-spill") {
          slick.visible = false;
          spillKit.position.set(-1.46, 0, -1.05);
        }
        if (it.id === "hood-down") {
          hoodRunning = true;
          hoodLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.2, rough: 0.3 });
          hoodRollout.visible = false;
        }
      },

      animate(t, dt, session) {

        breatheCrew(crew, t);
        if (hoodRunning) hoodFan.rotation.y += dt * 5.5;
        if (hoodRollout.visible) {
          hoodRollout.userData.step(dt, new THREE.Vector3(0, 2.0, 0.55), 0.9, 0.3, 0.12);
        }
        // Running water while the learner is actually at the sink scrubbing.
        const washing = session?.step?.id === "handwash" && session.holding;
        washWater.visible = washing;
        if (washing) washWater.userData.step(dt, new THREE.Vector3(0, 1.3, 0), 0.04, 0.3, -3.2);
        burners.forEach((b, i) => {
          if (!b.visible) return;
          b.scale.y = 0.85 + Math.sin(t * 11 + i) * 0.16;
          b.material.emissiveIntensity = 2.1 + Math.sin(t * 14 + i) * 0.5;
        });
        if (cooking) {
          griddleSteam.visible = true;
          griddleSteam.userData.step(dt, new THREE.Vector3(0, 0.06, 0.04), 0.3, 0.22, 0.35);
        }
        if (holding) {
          wellSteam.visible = true;
          wellSteam.userData.step(dt, new THREE.Vector3(0, 0.14, 0), 0.4, 0.18, 0.3);
        }
        if (flareOn) {
          fire.userData.step(dt, new THREE.Vector3(0, 0.05, 0), 0.14, 1.5, -0.7);
          smoke.userData.step(dt, new THREE.Vector3(0, 0.3, 0), 0.2, 0.35, 0.5);
          fireLight.intensity = 5 + Math.random() * 5;
        }

        const g = session?.gauge;
        if (g && !g.committed && session.step?.id === "temp") {
          const f = Math.round(40 + g.t * 160);
          repaint(probeScreen, signFace(`${f}`, {
            bg: "#12191f", accent: f >= 160 && f <= 178 ? "#59c97b" : "#f2894b", fg: "#ffd9b0", scale: 0.7,
          }));
        }
      },
    };
  },
};
