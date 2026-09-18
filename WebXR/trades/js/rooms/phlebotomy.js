import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace,
  shell, ceilingGrid, spreadLayout, counter, trolley, cabinet, seatedFigure, particles, markInteractive, mat, clamp,
} from "../../../shared/kit.js";
import { noticeBoard, racking, sideBench, spillStation, wasteBin } from "../shopfit.js";

// Room 04 — Phlebotomy technician: patient identification, venipuncture and the
// order of draw. This is the one room where sequence is genuinely non-negotiable:
// additive carryover between tubes changes results.

const CLINIC_WHITE = 0xeef1f4, TRIM = 0x7fa8bd, CLINIC_STEEL = 0xb9c0c6;

export const ROOM_PHLEBOTOMY = {
  id: "phlebotomy",
  trade: "Phlebotomy technician",
  title: "Draw Station",
  tagline: "Two-identifier check, venipuncture technique and the order of draw",
  union: "SEIU / NUHW — healthcare workers (hospital and laboratory locals)",
  certification: "NHA CPT or ASCP PBT phlebotomy technician certification; CLSI GP41 venipuncture standard (two-identifier check, order of draw); OSHA Bloodborne Pathogens (29 CFR 1910.1030)",
  accent: 0x53c1c9,
  accentCss: "#53c1c9",
  parSeconds: 220,
  // The shell this room builds, so the app can let the learner walk to the
  // walls instead of clamping them to a circle in the middle of the floor.
  size: { w: 13.0, d: 13.0 },
  spawn: { x: 2.6, z: 4.5, ry: -0.3 },
  badge: { id: "order-of-draw", name: "Order of Draw", note: "Correct draw sequence with no additive carryover" },

  hazards: {
    "recap": "Never recap a used needle two-handed. That is the classic needlestick — activate the safety device and drop it straight into sharps.",
    "sharps-full": "That container is past the fill line. Forcing another sharp in is how the one already inside comes back out at your hand. Seal it and start a fresh one.",
    "iv-arm": "There is an infusion running in that arm. Drawing above an IV dilutes the sample with whatever is in the bag — wrong arm, wrong result.",
    "pre-labelled": "Those tubes were labelled before the draw. Pre-labelling is how samples get attributed to the wrong patient; tubes are labelled at the bedside, after they are filled.",
  },

  lateNotes: {
    "needle": "Not yet. The site is not prepped, and a needle in hand before the tourniquet and the prep is how the sequence falls apart.",
    "tube-culture": "The needle is not in the vein yet — tubes are filled from a live draw, not staged ahead of it.",
    "label-printer": "Labels are printed once the tubes are filled and the patient is still in front of you.",
  },

  steps: [
    {
      id: "identify", kind: "select", target: "wristband",
      title: "Verify two patient identifiers",
      cue: "Check the wristband against the requisition — name and date of birth.",
      why: "Two identifiers, actively confirmed. Room number and 'the patient said yes' are not identifiers.",
    },
    {
      id: "gloves", kind: "select", target: "glove-box",
      title: "Hand hygiene and gloves",
      cue: "Sanitise and glove before you touch the patient or the tray.",
      why: "Gloves protect both directions. They go on after hand hygiene, not instead of it.",
    },
    {
      id: "tourniquet", kind: "select", target: "tourniquet",
      title: "Apply the tourniquet",
      cue: "Apply the tourniquet three to four inches above the site.",
      why: "It stays on for no more than a minute. Longer and you get haemoconcentration — the results shift before the needle is even in.",
    },
    {
      id: "clean", kind: "select", target: "alcohol-pad",
      title: "Clean the site and let it dry",
      cue: "Prep the site with alcohol and let it air dry.",
      why: "Wet alcohol stings on entry and haemolyses the sample. Drying time is part of the antisepsis, not a delay.",
    },
    {
      id: "insert", kind: "gauge", target: "needle",
      title: "Insert bevel up at the right angle",
      cue: "Set the insertion angle and commit inside the band.",
      why: "Fifteen to thirty degrees, bevel up. Too shallow and you skate off the vein; too steep and you go straight through it.",
      gauge: {
        label: "INSERTION ANGLE", speed: 0.8, green: [0.3, 0.6],
        readout: (t) => `${Math.round(t * 50)}°`,
        missNote: "Outside the safe window. Anchor the vein below the site and reset your angle.",
      },
    },
    {
      id: "draw", kind: "sequence",
      targets: ["tube-culture", "tube-blue", "tube-gold", "tube-green", "tube-lavender", "tube-gray"],
      itemNames: {
        "tube-culture": "blood culture", "tube-blue": "light blue — citrate", "tube-gold": "gold — SST",
        "tube-green": "green — heparin", "tube-lavender": "lavender — EDTA", "tube-gray": "grey — fluoride",
      },
      title: "Fill tubes in the order of draw",
      cue: "Blood culture, light blue, gold, green, lavender, grey — in that order.",
      why: "Additive carries over from tube to tube. EDTA before a chemistry tube throws potassium and calcium; citrate ratios break if the blue tube is not early and full.",
      outOfOrderNote: "Wrong tube for this point in the sequence. Additive carryover contaminates every tube after it — the order is the control.",
    },
    {
      id: "release", kind: "select", target: "tourniquet",
      title: "Release the tourniquet",
      cue: "Release the tourniquet before you withdraw the needle.",
      why: "Withdrawing under pressure forces a haematoma. The tourniquet comes off first, then the needle.",
    },
    {
      id: "sharps", kind: "select", target: "sharps-container",
      title: "Activate the safety device and dispose",
      cue: "Engage the needle guard and drop it into the sharps container.",
      why: "The device is activated before your hand leaves the needle, and it goes into sharps immediately — never onto the tray.",
    },
    {
      id: "pressure", kind: "hold", target: "gauze", seconds: 10,
      title: "Hold pressure on the site",
      cue: "Hold gauze on the site with the arm straight.",
      why: "Direct pressure until bleeding stops. Bending the elbow over the gauze is what produces the bruise the patient remembers you by.",
      holdBreakNote: "You let go early — the site is still bleeding. Reapply and hold the full time.",
    },
    {
      id: "label", kind: "select", target: "label-printer",
      title: "Label the tubes at the bedside",
      cue: "Print and apply the labels here, in front of the patient.",
      why: "Labelling happens at the bedside with the patient present. Every step away from the chair is a chance for the sample to become someone else's.",
    },
  ],

  build(root) {
    const hits = {};
    const reg = (obj, id) => { markInteractive(obj, id); hits[id] = obj; return obj; };

    shell(root, {
      w: 13.0, d: 13.0, h: 3.8,
      floor: 0xa8b3b8, wall: CLINIC_WHITE, ceiling: 0xf4f7f9,
      floorRough: 0.5, floorMetal: 0.05, skirtColor: 0x6f7d85,
          trim: 0x3d8f8a, door: "personnel",
});
    // Vinyl sheet floor with a welded-seam grid and a colour band.
    for (let i = -3; i <= 3; i++) box(root, 7.9, 0.003, 0.01, 0, 0.004, i * 1.2, 0x93a0a7, { cast: false, receive: false });
    box(root, 7.9, 0.004, 0.4, 0, 0.005, 1.6, 0x8fc0c9, { cast: false, receive: false });
    // Wall dado rail and a handwashing poster.
    for (const [wx, wz, wry] of [[0, -3.95, 0], [-3.95, 0, Math.PI / 2], [3.95, 0, -Math.PI / 2]]) {
      const w = group(root, wx, 0, wz, wry);
      box(w, 7.9, 0.05, 0.02, 0, 0.95, 0.06, TRIM, { cast: false, rough: 0.5 });
    }

    // ------------------------------------------------------------- draw chair
    const chair = group(root, -1.0, 0, -1.6, 0.35);
    slab(chair, 0.62, 0.14, 0.58, 0, 0.48, 0, 0x3f6f86, { radius: 0.06, rough: 0.7 });
    const chairBack = slab(chair, 0.6, 0.72, 0.14, 0, 0.9, -0.26, 0x3f6f86, { radius: 0.06, rough: 0.7 });
    chairBack.rotation.x = -0.12;
    for (const sx of [-1, 1]) {
      cyl(chair, 0.03, 0.03, 0.46, sx * 0.26, 0.24, -0.2, CLINIC_STEEL, { rough: 0.25, metal: 0.9, seg: 12 });
      cyl(chair, 0.03, 0.03, 0.46, sx * 0.26, 0.24, 0.2, CLINIC_STEEL, { rough: 0.25, metal: 0.9, seg: 12 });
      box(chair, 0.05, 0.03, 0.5, sx * 0.26, 0.03, 0, CLINIC_STEEL, { rough: 0.25, metal: 0.9 });
    }
    // The hinged phlebotomy armrest, angled across the front.
    const armrest = group(chair, 0.33, 0.72, 0.1, -0.25);
    slab(armrest, 0.5, 0.06, 0.2, 0, 0, 0, 0x2f5768, { radius: 0.03, rough: 0.65 });
    box(armrest, 0.5, 0.06, 0.02, 0, 0.05, -0.1, 0x2f5768, { rough: 0.65 });
    cyl(armrest, 0.02, 0.02, 0.3, -0.2, -0.16, 0, CLINIC_STEEL, { rough: 0.25, metal: 0.9, seg: 10 });

    const patient = seatedFigure(chair, 0, 0.55, 0.06, { skin: 0xd9a985, cloth: 0x6b7f8c });
    // The right arm rests on the armrest, presented for the draw.
    const drawArm = patient.arms[1];
    drawArm.shoulder.rotation.set(-0.5, 0, -0.5);
    drawArm.fore.rotation.set(0.2, 0, 0.35);
    // Antecubital site marker on the presented forearm.
    const site = group(drawArm.fore, 0.02, -0.16, 0.04);
    const vein = cyl(site, 0.006, 0.006, 0.12, 0, 0, 0.02, 0x4a6f9a, { rough: 0.8, seg: 8 });
    vein.rotation.x = Math.PI / 2.2;
    reg(site, "draw-site");

    // Wristband on the near wrist.
    const band = group(drawArm.fore, 0, -0.26, 0.04);
    cyl(band, 0.05, 0.05, 0.03, 0, 0, 0, 0xf2f2f2, { rough: 0.6, seg: 16, open: true, side: 2 });
    decal(band, 0.075, 0.03, 0, 0, 0.051, paperFace("", ["MARSH, J.  DOB 14/07/71"], { bg: "#ffffff" }), { px: 256 });
    reg(band, "wristband");

    // The other arm carries a running infusion — drawing there is the trap.
    const ivArm = patient.arms[0];
    ivArm.shoulder.rotation.set(-0.25, 0, 0.25);
    const ivSite = group(ivArm.fore, 0, -0.2, 0.05);
    box(ivSite, 0.05, 0.005, 0.05, 0, 0, 0, 0xdce6ec, { rough: 0.5 });
    hose(ivSite, [[0, 0.005, 0], [0.1, 0.1, -0.1], [0.16, 0.5, -0.4]], 0.004, 0xcfe4ee, { steps: 16, opacity: 0.8, rough: 0.2 });
    reg(ivSite, "iv-arm");

    const pole = group(root, -1.95, 0, -1.95);
    cyl(pole, 0.14, 0.18, 0.03, 0, 0.02, 0, 0x8d959d, { rough: 0.4, metal: 0.7, seg: 18 });
    cyl(pole, 0.014, 0.014, 1.85, 0, 0.93, 0, CLINIC_STEEL, { rough: 0.2, metal: 0.95, seg: 12 });
    box(pole, 0.2, 0.014, 0.014, 0, 1.83, 0, CLINIC_STEEL, { rough: 0.2, metal: 0.95 });
    const ivBag = lathe(pole, [[0.001, 0], [0.06, 0.03], [0.07, 0.1], [0.06, 0.24], [0.02, 0.27], [0.001, 0.275]],
      0.08, 1.5, 0, 0xd8e8f0, { rough: 0.2, opacity: 0.72, seg: 16 });
    const ivFluid = cyl(pole, 0.055, 0.05, 0.16, 0.08, 1.58, 0, 0xa9d6e8, { rough: 0.15, opacity: 0.85, seg: 16 });
    const dripChamber = cyl(pole, 0.018, 0.018, 0.07, 0.08, 1.44, 0, 0xdff0f6, { rough: 0.1, opacity: 0.6, seg: 12 });
    const drip = ball(pole, 0.006, 0.08, 1.46, 0, 0xbfe4f2, { rough: 0.1, opacity: 0.9 });

    // ------------------------------------------------------------- draw tray
    const cart = trolley(root, 0.4, -1.5, 0x36434c, { ry: -0.3, w: 0.62, d: 0.46 });
    const tray = group(cart, 0, 0.87, 0);
    slab(tray, 0.56, 0.03, 0.4, 0, 0, 0, 0x2d3940, { radius: 0.02, rough: 0.5 });
    box(tray, 0.56, 0.05, 0.02, 0, 0.03, -0.19, 0x2d3940, { rough: 0.5 });
    box(tray, 0.56, 0.05, 0.02, 0, 0.03, 0.19, 0x2d3940, { rough: 0.5 });

    // Tube rack with six colour-coded tubes, each fills as it is drawn.
    const rackRoot = group(tray, -0.06, 0.02, -0.06);
    box(rackRoot, 0.34, 0.05, 0.11, 0, 0.025, 0, 0x1f2a30, { rough: 0.6 });
    const TUBES = [
      { id: "tube-culture", c: 0xf0d24a, name: "CULT" },
      { id: "tube-blue", c: 0x6cb6e8, name: "CIT" },
      { id: "tube-gold", c: 0xd6a83c, name: "SST" },
      { id: "tube-green", c: 0x4fae63, name: "HEP" },
      { id: "tube-lavender", c: 0xa285c9, name: "EDTA" },
      { id: "tube-gray", c: 0x9aa0a6, name: "FLU" },
    ];
    const tubeFills = {};
    TUBES.forEach((t, i) => {
      const tg = group(rackRoot, -0.14 + i * 0.056, 0.04, 0);
      cyl(tg, 0.019, 0.019, 0.1, 0, 0.05, 0, 0xdfe8ee, { rough: 0.12, opacity: 0.55, seg: 14 });
      cyl(tg, 0.02, 0.02, 0.022, 0, 0.108, 0, t.c, { rough: 0.5, seg: 14 });
      const fill = cyl(tg, 0.016, 0.016, 0.06, 0, 0.032, 0, 0x8e1c1c, { rough: 0.3, seg: 14 });
      fill.scale.y = 0.001;
      fill.visible = false;
      tubeFills[t.id] = fill;
      reg(tg, t.id);
    });
    decal(tray, 0.34, 0.05, -0.06, 0.018, 0.06, signFace("ORDER OF DRAW →", { bg: "#2d3940", accent: "#53c1c9", scale: 0.55 }))
      .rotation.x = -Math.PI / 2;

    // Tourniquet, alcohol pads, gauze, needle assembly on the tray.
    const tq = group(tray, 0.19, 0.02, -0.1);
    torus(tq, 0.05, 0.008, 0, 0.01, 0, 0x3f7f9e, { rough: 0.85 });
    torus(tq, 0.042, 0.008, 0.012, 0.022, 0.01, 0x3f7f9e, { rough: 0.85 });
    reg(tq, "tourniquet");

    const pads = group(tray, 0.19, 0.02, 0.08);
    for (let i = 0; i < 4; i++) {
      const p = box(pads, 0.05, 0.004, 0.05, (i % 2) * 0.055 - 0.027, i * 0.005, Math.floor(i / 2) * 0.055 - 0.027,
        0xdfe8ee, { rough: 0.6 });
      p.rotation.y = i * 0.2;
    }
    decal(pads, 0.04, 0.02, -0.027, 0.024, -0.027, signFace("70%", { bg: "#dfe8ee", fg: "#1d3b4a", accent: "#53c1c9", scale: 0.7 }))
      .rotation.x = -Math.PI / 2;
    reg(pads, "alcohol-pad");

    const gauze = group(tray, -0.24, 0.02, 0.1);
    for (let i = 0; i < 3; i++) slab(gauze, 0.05, 0.008, 0.05, 0, i * 0.009, 0, 0xf4f6f8, { radius: 0.004, rough: 0.95 });
    reg(gauze, "gauze");

    const needle = group(tray, 0.02, 0.03, 0.11, 0.3);
    cyl(needle, 0.011, 0.011, 0.09, 0, 0, 0, 0xdfe8ee, { rough: 0.3, seg: 12 }).rotation.z = Math.PI / 2;
    cyl(needle, 0.0018, 0.0018, 0.035, 0.06, 0, 0, CLINIC_STEEL, { rough: 0.1, metal: 0.95, seg: 8 }).rotation.z = Math.PI / 2;
    box(needle, 0.03, 0.008, 0.016, 0.02, 0.008, 0, 0x53c1c9, { rough: 0.5 });     // safety shield, un-deployed
    reg(needle, "needle");

    // Pre-labelled tubes sitting on the lower shelf — the identification trap.
    const preLab = group(cart, 0.14, 0.62, 0.02);
    for (let i = 0; i < 2; i++) {
      const t = cyl(preLab, 0.019, 0.019, 0.1, i * 0.05, 0.05, 0, 0xdfe8ee, { rough: 0.12, opacity: 0.55, seg: 12 });
      decal(preLab, 0.03, 0.03, i * 0.05, 0.05, 0.021, paperFace("", ["PT 0413"], { bg: "#ffffff" }), { px: 128 });
    }
    reg(preLab, "pre-labelled");

    // ------------------------------------------------- sharps & waste on wall
    const sharps = group(root, 3.9, 0, -1.2, -Math.PI / 2);
    box(sharps, 0.34, 0.42, 0.26, 0, 1.15, 0, 0xd8342a, { rough: 0.6 });
    box(sharps, 0.36, 0.06, 0.28, 0, 1.39, 0, 0xf2e9c9, { rough: 0.55 });
    box(sharps, 0.16, 0.02, 0.1, 0, 1.42, 0.02, 0x2b2e33, { rough: 0.6 });          // drop slot
    decal(sharps, 0.3, 0.16, 0, 1.18, 0.132, signFace("SHARPS\nBIOHAZARD", { bg: "#a5261e", accent: "#f2ae14", fg: "#ffffff", scale: 0.34 }));
    box(sharps, 0.36, 0.5, 0.3, 0, 1.15, 0, 0x8d959d, { rough: 0.5, opacity: 0.001, transparent: true, cast: false });
    reg(sharps, "sharps-container");

    // An overfull unit next to it — do not force another sharp in.
    const sharpsFull = group(root, 3.9, 0, -0.4, -Math.PI / 2);
    box(sharpsFull, 0.3, 0.36, 0.24, 0, 1.12, 0, 0xd8342a, { rough: 0.6 });
    box(sharpsFull, 0.32, 0.05, 0.26, 0, 1.32, 0, 0xf2e9c9, { rough: 0.55 });
    for (let i = 0; i < 5; i++) {
      const s = cyl(sharpsFull, 0.008, 0.008, 0.07, -0.08 + i * 0.04, 1.37, 0.02, 0xdfe8ee, { rough: 0.3, seg: 8 });
      s.rotation.set(0.4 * Math.random(), 0, 0.6 * (Math.random() - 0.5));
    }
    decal(sharpsFull, 0.26, 0.06, 0, 1.24, 0.122, signFace("FULL — DO NOT FORCE", { bg: "#7d1512", accent: "#f2ae14", scale: 0.42 }));
    reg(sharpsFull, "sharps-full");

    // Loose needle cap on the counter — recapping is the trap.
    const bench = counter(root, 2.4, 0.6, 2.6, -3.4, 0xdfe4e8, { height: 0.9, metal: 0.1, rough: 0.5, ry: 0 });
    const cap = cyl(bench, 0.008, 0.01, 0.05, -0.7, 0.945, 0.06, 0x53c1c9, { rough: 0.5, seg: 10 });
    cap.rotation.z = Math.PI / 2;
    reg(cap, "recap");

    // Label printer and requisition on the bench.
    const printer = group(bench, 0.5, 0.92, 0);
    slab(printer, 0.28, 0.16, 0.22, 0, 0.08, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    box(printer, 0.2, 0.02, 0.03, 0, 0.17, 0.09, 0x1b1e22, { rough: 0.6 });
    const labelStrip = decal(printer, 0.16, 0.05, 0, 0.175, 0.14,
      paperFace("", ["MARSH, J. — 14/07/71"], { bg: "#ffffff" }), { px: 256 });
    labelStrip.rotation.x = -Math.PI / 3;
    labelStrip.visible = false;
    const printerScreen = decal(printer, 0.1, 0.04, 0, 0.162, -0.02,
      signFace("READY", { bg: "#11242b", accent: "#53c1c9", fg: "#bff0f4", scale: 0.6 }), { glow: true, ei: 0.7 });
    printerScreen.rotation.x = -Math.PI / 2;
    reg(printer, "label-printer");

    const req = decal(bench, 0.24, 0.32, -0.2, 0.925, 0.02,
      paperFace("REQUISITION", ["MARSH, JORDAN", "DOB 14/07/1971", "MRN 55-2041", "CBC · CMP · PT/INR", "Fasting: yes"]));
    req.rotation.x = -Math.PI / 2;

    // Glove box and sanitiser on the wall.
    const gloveWall = group(root, -3.9, 0, -0.6, Math.PI / 2);
    box(gloveWall, 0.26, 0.15, 0.14, 0, 1.35, 0, 0x2f7f9e, { rough: 0.6 });
    for (let i = 0; i < 3; i++) {
      const g2 = box(gloveWall, 0.06, 0.03, 0.05, -0.02 + i * 0.02, 1.44 + i * 0.012, 0.02, 0x8fd6e8, { rough: 0.85 });
      g2.rotation.set(0.3, i * 0.6, 0.2);
    }
    decal(gloveWall, 0.22, 0.05, 0, 1.29, 0.075, signFace("NITRILE", { bg: "#0f4257", accent: "#6cc6f0", scale: 0.6 }));
    const dispenser = group(gloveWall, 0.45, 1.35, 0);
    box(dispenser, 0.11, 0.24, 0.1, 0, 0, 0, 0xf0f4f6, { rough: 0.4 });
    box(dispenser, 0.07, 0.03, 0.06, 0, -0.15, 0.02, 0x2b3138, { rough: 0.5 });
    decal(dispenser, 0.09, 0.05, 0, 0.06, 0.052, signFace("SANITISE", { bg: "#f0f4f6", fg: "#0f4257", accent: "#53c1c9", scale: 0.55 }));
    reg(gloveWall, "glove-box");

    // Hand hygiene poster and a specimen fridge for depth.
    decal(root, 0.6, 0.8, -3.93, 1.75, 1.4, paperFace("HAND HYGIENE", [
      "1  Wet and lather", "2  Palm to palm", "3  Between fingers", "4  Thumbs and tips", "5  Rinse and dry",
    ])).rotation.y = Math.PI / 2;

    const fridge = group(root, -2.9, 0, 3.2);
    box(fridge, 0.7, 1.5, 0.62, 0, 0.75, 0, 0xdfe4e8, { rough: 0.4, metal: 0.2 });
    box(fridge, 0.66, 0.9, 0.03, 0, 1.0, 0.32, 0x2f4a58, { rough: 0.15, metal: 0.3, opacity: 0.55 });
    box(fridge, 0.03, 0.4, 0.03, 0.28, 1.0, 0.35, CLINIC_STEEL, { rough: 0.25, metal: 0.9 });
    const fridgeScreen = decal(fridge, 0.16, 0.07, -0.1, 1.56, 0.32,
      signFace("+4.0 °C", { bg: "#11242b", accent: "#53c1c9", fg: "#bff0f4", scale: 0.6 }), { glow: true, ei: 0.6 });

    const key = new THREE.DirectionalLight(0xf4f9ff, 0.85);
    key.position.set(-2.5, 5, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -6; key.shadow.camera.right = 6;
    key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
    root.add(key);
    root.add(new THREE.HemisphereLight(0xe8f4fa, 0x39434a, 1.0));

    let tourniquetOn = false;
    let needleIn = false;
    let dripT = 0;
    const drawnTubes = new Set();

    // The bay is 13.0m by 13.0m now. Push the workstations out to match, so
    // the extra floor is distance between jobs rather than empty ring.
    spreadLayout(root, 1.62);

    const W = 13.0, D = 13.0;
    // ------------------------------------------------- the rest of the bay
    // A draw room's stores: consumables on shelving, the notice board with
    // the competency list, the spill kit for a blood spill, and the sharps
    // and clinical waste separated the way they have to be.
    racking(root, -W / 2 + 0.55, -2.2, Math.PI / 2, { w: 2.6, h: 2.0, frame: 0xb8c0c8, stock: [0xdfe6ec, 0xc9d6de, 0xdfe6ec] });
    sideBench(root, -3.2, 4.0, 0.15, { w: 2.2, top: 0xdfe6ec });
    noticeBoard(root, 1.4, D / 2 - 0.25, Math.PI, { w: 1.6 });
    spillStation(root, W / 2 - 1.2, 3.8, -0.9, { color: 0xc0392b });
    wasteBin(root, W / 2 - 2.1, 4.1, -0.7, { color: 0xb03a2f, lid: 0x8c2c22, label: "Clinical" });

    // Fittings on a grid sized to this floor, plus the bounce a real room
    // has and this one did not: see ceilingGrid in shared/kit.js.
    ceilingGrid(root, 13.0, 13.0, { color: 0xf2f8ff, ei: 1.35, lamp: 1.5, y: 3.64 });

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.8, 1.1, -1.6),

      onStepComplete(step, session) {
        if (step.id === "tourniquet" && !tourniquetOn) {
          tourniquetOn = true;
          tq.position.set(0, 0, 0);
          drawArm.shoulder.add(tq);
          tq.position.set(0, -0.06, 0.01);
          tq.rotation.set(Math.PI / 2, 0, 0);
        }
        if (step.id === "insert") {
          needleIn = true;
          site.add(needle);
          needle.position.set(0.02, 0.02, 0.02);
          needle.rotation.set(0.4, 0, -0.5);
        }
        if (step.id === "release") {
          tourniquetOn = false;
          tq.visible = false;
        }
        if (step.id === "sharps") { needleIn = false; needle.visible = false; }
        if (step.id === "label") labelStrip.visible = true;
      },

      onFeedback(feedback, session) {
        // Fill each tube as it is drawn in sequence.
        if (session.step?.id === "draw") {
          for (const id of session.sequence) {
            if (drawnTubes.has(id)) continue;
            drawnTubes.add(id);
            const fill = tubeFills[id];
            if (fill) { fill.visible = true; fill.userData.target = 1; }
          }
        }
      },

      animate(t, dt, session) {
        patient.head.rotation.y = -0.2 + Math.sin(t * 0.4) * 0.1;
        patient.torso.position.y = Math.sin(t * 1.05) * 0.005;

        // IV drip falls on a slow loop — the running line the learner must notice.
        dripT += dt * 0.8;
        if (dripT > 1) dripT = 0;
        drip.position.y = 1.47 - dripT * 0.05;
        drip.visible = dripT < 0.7;

        for (const id of Object.keys(tubeFills)) {
          const fill = tubeFills[id];
          if (!fill.visible) continue;
          const target = fill.userData.target ?? 0;
          fill.scale.y = Math.min(target, fill.scale.y + dt * 2.2);
          fill.position.y = 0.032 - (1 - fill.scale.y) * 0.03;
        }

        const g = session?.gauge;
        if (g && !g.committed && session.step?.id === "insert") {
          needle.rotation.z = -0.1 - g.t * 0.9;
          const deg = Math.round(g.t * 50);
          repaint(printerScreen, signFace(`${deg}°`, {
            bg: "#11242b", accent: deg >= 15 && deg <= 30 ? "#59c97b" : "#f2ae14", fg: "#bff0f4", scale: 0.6,
          }));
        }
      },
    };
  },
};
