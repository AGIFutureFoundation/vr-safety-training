import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace,
  shell, ceilingGrid, spreadLayout, mergeStatic, counter, particles, markInteractive, mat, clamp,
} from "../../../shared/kit.js";
import { noticeBoard, racking, sideBench, spillStation, wasteBin } from "../shopfit.js";

// Room 03 — Commercial cook: the hot line. Hand hygiene, colour-coded boards,
// cook temperature, and the grease flare-up that every kitchen eventually gets.

const SS = 0xb4bcc3, SS_DARK = 0x767e86, GRATE = 0x2b2f34;

export const ROOM_KITCHEN = {
  id: "kitchen",
  trade: "Commercial cook",
  title: "Hot Line",
  tagline: "Hand hygiene, cross-contamination control, cook temperature and a grease flare-up",
  union: "UNITE HERE — hospitality and food service workers",
  certification: "ANSI-accredited food handler card and ServSafe Food Protection Manager (FDA Food Code: hand hygiene, cross-contamination, cook temperatures); OSHA 29 CFR 1910.157 portable extinguishers (Class K) for grease fires",
  accent: 0xf2894b,
  accentCss: "#f2894b",
  parSeconds: 215,
  // The shell this room builds, so the app can let the learner walk to the
  // walls instead of clamping them to a circle in the middle of the floor.
  size: { w: 14.6, d: 13.9 },
  spawn: { x: 0.0, z: 4.9, ry: 0 },
  badge: { id: "clean-line", name: "Clean Line", note: "Full service with no cross-contamination and a controlled flare-up" },

  hazards: {
    "green-board": "That is the produce board. Raw poultry on a board that goes back to salad is textbook cross-contamination — the pathogen does not care that you rinsed it.",
    "water-jug": "Never water on a grease fire. Water flashes to steam under burning oil and throws the whole pan across the line. Cut the heat and smother it.",
    "sink-knife": "There is a knife under the water in that sink. Blades never go into a full sink — the next person reaching in finds it with their hand.",
    "salad-station": "Those are ready-to-eat greens and you still have raw chicken on your hands. Change gloves and wash before you cross from raw to ready.",
    "extinguisher-a": "That is a water-based extinguisher. On burning oil it does exactly what the water jug does. The kitchen unit is the wet chemical Class K on the other wall.",
  },

  lateNotes: {
    "chef-knife": "Board and sanitiser first. A knife in your hand over an unsanitised surface is a shortcut you cannot take back.",
    "flat-top": "Nothing hits the heat before it is portioned — uneven pieces cook to different internal temperatures.",
    "hot-well": "Hot holding is for cooked product that has passed its temperature check.",
  },

  steps: [
    {
      id: "handwash", kind: "hold", target: "hand-sink", seconds: 20,
      title: "Wash hands — full 20 seconds",
      cue: "Hold at the hand sink and scrub for the full twenty seconds.",
      why: "Twenty seconds of friction is the whole point; a three-second rinse moves contamination around instead of removing it.",
      holdBreakNote: "You stopped short. Restart the full twenty seconds — a partial wash does not count.",
    },
    {
      id: "board", kind: "select", target: "red-board",
      title: "Take the raw-poultry board",
      cue: "Pull the correct colour-coded board for raw chicken.",
      why: "Red is raw meat and poultry. Colour coding exists so the decision is visible from across the line, not remembered.",
    },
    {
      id: "sanitize-board", kind: "select", target: "sani-spray",
      title: "Sanitise the board and surface",
      cue: "Spray and wipe the board before the protein touches it.",
      why: "Clean removes soil, sanitise reduces pathogens. A board that looks clean has not been sanitised.",
    },
    {
      id: "knife", kind: "select", target: "chef-knife",
      title: "Draw a knife from the rack",
      cue: "Take the chef knife off the magnetic strip.",
      why: "Knives live on the rack or in your hand — never loose in a sink or under a towel where somebody finds the edge.",
    },
    {
      id: "cut", kind: "gauge", target: "cut-board",
      title: "Portion to an even thickness",
      cue: "Slice to the target portion thickness and commit inside the band.",
      why: "Even portions cook evenly. Ragged thickness means the thin end is dry before the thick end is safe.",
      gauge: {
        label: "PORTION THICKNESS", speed: 0.9, green: [0.42, 0.56],
        readout: (t) => `${(6 + t * 30).toFixed(1)} mm`,
        missNote: "Off the spec portion. Reset your claw grip, guide with the knuckles and cut again.",
      },
    },
    {
      id: "cook", kind: "select", target: "flat-top",
      title: "Cook on the flat top",
      cue: "Move the portioned chicken onto the flat top.",
      why: "The protein goes straight from board to heat — nothing sits at room temperature in the danger zone waiting for a burner.",
    },
    {
      id: "temp", kind: "gauge", target: "probe",
      title: "Probe the internal temperature",
      cue: "Probe the thickest part and commit when the reading is safe for poultry.",
      why: "Poultry is done at 74 °C / 165 °F in the thickest part. Colour is not a doneness test — the probe is.",
      gauge: {
        label: "PROBE — INTERNAL TEMP", speed: 0.6, green: [0.72, 0.86],
        readout: (t) => `${Math.round(40 + t * 160)} °F`,
        missNote: "Not there yet — or well past it. Poultry needs 165 °F in the thickest part, held for the required time.",
      },
    },
    {
      id: "kill-heat", kind: "select", target: "burner-knob",
      title: "Cut the heat",
      cue: "The pan behind you has flared. Shut the gas off first.",
      why: "Fuel first. Smothering a burner that is still firing just feeds the flame from underneath.",
    },
    {
      id: "smother", kind: "select", target: "pan-lid",
      title: "Smother the flare-up",
      cue: "Cover the pan with the lid and leave it covered.",
      why: "Starve it of oxygen and leave the lid on until it cools. Lifting the lid to look re-ignites it.",
    },
    {
      id: "hot-hold", kind: "select", target: "hot-well",
      title: "Move to hot holding",
      cue: "Transfer the cooked portions into the hot well.",
      why: "Hot holding stays at or above 135 °F. Below that you are incubating what the cook step just killed.",
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

    // Burner control knobs along the front rail.
    const knobRow = group(range, 0, 0.78, 0.45);
    for (let i = 0; i < 4; i++) {
      const k = cyl(knobRow, 0.036, 0.04, 0.05, -0.86 + i * 0.38, 0, 0, 0x1b1e22, { rough: 0.55, seg: 16 });
      k.rotation.x = Math.PI / 2;
      box(knobRow, 0.008, 0.03, 0.052, -0.86 + i * 0.38, 0.018, 0.001, 0xf2ae14, { rough: 0.5 });
    }
    reg(knobRow, "burner-knob");

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
    const rawPortions = [];
    for (let i = 0; i < 3; i++) {
      const p = slab(prep, 0.13, 0.03, 0.1, -0.14 + i * 0.14, 0.955, 0.1, 0xe9bfa8, { radius: 0.03, rough: 0.8 });
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

    // Three-compartment sink with a knife hidden under the water — the trap.
    const bigSink = group(root, -4.2, 0, 1.8, Math.PI / 2);
    counter(bigSink, 1.7, 0.6, 0, 0, SS, { height: 0.9, metal: 0.8, rough: 0.28, undershelf: false });
    for (let i = 0; i < 3; i++) {
      const basin = box(bigSink, 0.48, 0.26, 0.44, -0.55 + i * 0.55, 0.79, 0, 0x8d959d, { rough: 0.25, metal: 0.85 });
      const water = box(bigSink, 0.44, 0.02, 0.4, -0.55 + i * 0.55, 0.9, 0, 0x2f6f8a,
        { rough: 0.12, metal: 0.2, opacity: 0.78 });
      if (i === 1) {
        const submerged = box(bigSink, 0.026, 0.004, 0.17, -0.02, 0.885, 0.03, 0xdfe4e8, { rough: 0.2, metal: 0.9 });
        submerged.rotation.y = 0.3;
        reg(basin, "sink-knife");
      }
    }
    decal(bigSink, 1.4, 0.12, 0, 1.4, 0.02, signFace("WASH   RINSE   SANITISE", { scale: 0.45 }));

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
      },

      animate(t, dt, session) {
        hoodFan.rotation.y += dt * 5.5;
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
