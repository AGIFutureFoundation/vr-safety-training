import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace,
  shell, ceilingGrid, spreadLayout, mergeStatic, counter, trolley, cabinet, seatedFigure, particles, markInteractive, mat, lerp,
} from "../../../shared/kit.js";
import { noticeBoard, racking, wasteBin , bayCrew, breatheCrew } from "../shopfit.js";

// Room 02 — Hair stylist: oxidative colour service, station sanitation and
// client protection. The trade content here is the salon's real order of
// operations, where skipping the consultation or the disinfection step is the
// failure that actually happens on the floor.

const CHROME = 0xb9c0c6, WARMWOOD = 0x8a6244, SALON_BLACK = 0x24262b;

export const ROOM_SALON = {
  id: "salon",
  trade: "Hair stylist / colourist",
  title: "Colour Studio",
  tagline: "Oxidative colour service from consultation to rinse, with station sanitation",
  union: "Licensed trade under the state board of barbering and cosmetology (non-union in most states; some salon locals organise under UFCW)",
  certification: "State cosmetology licence issued by the board of barbering and cosmetology, which is also the thing that gets suspended over a sanitation failure; the board's disinfection rules — implements cleaned, then immersed in an EPA-registered hospital-grade disinfectant for the full contact time, single-use items discarded after one client; OSHA Hazard Communication, 29 CFR 1910.1200, for the safety data sheets, labelling and glove selection on colour and developer; and the manufacturer's directions, which are what make the 48-hour patch test non-negotiable",
  accent: 0xe2739b,
  accentCss: "#e2739b",
  parSeconds: 205,
  // The shell this room builds, so the app can let the learner walk to the
  // walls instead of clamping them to a circle in the middle of the floor.
  size: { w: 13.9, d: 13.9 },
  spawn: { x: -1.2, z: 5.7, ry: -0.21 },
  badge: { id: "clean-chair", name: "Clean Chair", note: "Full colour service with no sanitation breach" },

  hazards: {
    "metal-bowl": "That is a metal mixing bowl. Metal reacts with peroxide developer — it degrades the oxidant and can turn the formula. Colour is mixed in a non-metallic bowl, every time.",
    "dirty-shears": "Those shears came straight off the last client. Tools are cleaned and immersed in disinfectant between every client — a nicked scalp turns cross-contamination into a blood-borne exposure.",
    "flat-iron": "The iron is at 200 °C and the hair is saturated with product. Thermal styling on wet, chemically processed hair boils water inside the strand and snaps it.",
    "dev-40": "That is 40 volume. The service on the card is two levels of lift on scalp, and 40 vol against a scalp is a chemical burn rather than a faster appointment — the manufacturer's own directions restrict it to off-scalp work for exactly that reason. It does not save time either: over-processed hair has to be toned, treated and then explained.",
    "used-towel": "That towel came off the last client's neck. Linens are one client each and then they go to the wash, because a towel that has had colour, scalp oil and possibly blood on it is the shortest route there is between two people's heads — and it is the item state board inspectors look at first.",
  },

  lateNotes: {
    "mix-bowl": "Gloves first. Oxidative dye is a skin sensitiser — PPD reactions build with every unprotected exposure and they end careers.",
    "tint-brush": "Nothing goes on the head before the hair is sectioned and the formula is mixed to the right developer volume.",
    "backwash": "Rinsing now stops development early — the colour has not had its time in the strand.",
  },

  steps: [
    {
      id: "consult", kind: "select", target: "consult-card",
      title: "Consult and check the patch test",
      cue: "Read the client record: allergy history, patch test date, previous chemical services.",
      why: "The patch test goes on 48 hours ahead and the record is what proves it happened, because a PPD reaction is not a rash — it is a face that closes up in a chair on a Saturday afternoon. No record, no oxidative colour, however well you know the client. The previous services matter just as much: box colour or henna at home can react with peroxide in the strand, and the client will not volunteer it unless you ask.",
    },
    {
      id: "sanitize", kind: "hold", target: "disinfect-jar", seconds: 6,
      title: "Disinfect the tools for the full contact time",
      cue: "Clean the combs and shears, immerse them, and leave them under for the whole contact time.",
      why: "Cleaning and disinfecting are two separate jobs: visible debris comes off first, because a disinfectant cannot reach through hair and product, and then the implement is fully immersed for the contact time printed on the concentrate. That time is the whole mechanism — a quick dip wets the steel and kills nothing, and it is the sanitation failure that actually shows up on state board inspections.",
      holdBreakNote: "You lifted them out early. Contact time is the part that does the work — a dip that does not last it has cleaned the tools and disinfected nothing.",
    },
    {
      id: "cape", kind: "drag", target: "cape",
      title: "Drape the client",
      cue: "Take the cape from the chair and settle it over the client's shoulders, then set the towel at the neckline.",
      why: "The cape protects clothing, but the towel at the neckline is the part that matters: oxidative dye running onto the neck stains for days and sensitises skin that has no business meeting PPD at all. Settle it so there is no gap at the nape, because that is where the colour runs when the head goes forward at the backwash.",
      drag: { to: "client-shoulders", radius: 0.38, missNote: "Not settled on the shoulders. A cape hanging off one side leaves the neckline open, which is where the dye runs." },
    },
    {
      id: "gloves", kind: "select", target: "glove-box",
      title: "Glove up",
      cue: "Take gloves before you touch any product.",
      why: "Gloves go on before mixing, not before applying, because the first skin contact of the whole service is with the tint in the bowl. PPD sensitisation is cumulative and permanent — it builds through years of small unprotected exposures and then ends a career in a single reaction, and stylists are far more likely to develop it than clients are.",
    },
    {
      id: "mix", kind: "gauge", target: "mix-bowl",
      title: "Mix to the right developer volume",
      cue: "Select the developer for two levels of lift and commit inside the band.",
      why: "Developer volume is the whole chemistry: it sets how far the cuticle opens and how much natural pigment is lifted before the new colour deposits. Twenty volume is roughly two levels and full grey coverage, which is what the card asks for. Reaching for a higher volume to get there faster does not buy speed, it buys a swollen cuticle, a porous mid-length and a colour that washes out in three weeks.",
      gauge: {
        label: "DEVELOPER — VOLUME", speed: 0.7, green: [0.44, 0.58],
        readout: (t) => `${Math.round(10 + t * 30)} vol`,
        missNote: "Wrong strength for the target. Too low will not lift or cover; too high over-processes the mid-lengths.",
      },
    },
    {
      id: "section", kind: "sequence", anyOrder: true,
      targets: ["hair-q1", "hair-q2", "hair-q3", "hair-q4"],
      itemNames: {
        "hair-q1": "left front quadrant", "hair-q2": "right front quadrant",
        "hair-q3": "left nape quadrant", "hair-q4": "right nape quadrant",
      },
      title: "Section into four quadrants",
      cue: "Part the hair into four clean quadrants — all four before you apply.",
      why: "Four quadrants turn a whole head into four small, controlled applications, each one worked from a clean parting where you can actually see the scalp. Apply into unsectioned hair and you are guessing at coverage: the grey at the crown gets missed, the nape gets double product, and the timing runs from four different start times you never wrote down.",
      outOfOrderNote: "One or more quadrants are still unparted — every quadrant gets clipped before application starts.",
    },
    {
      id: "apply", kind: "select", target: "tint-brush",
      title: "Apply root to mid-length",
      cue: "Take the tint brush and apply through the sectioned hair.",
      why: "Regrowth first, because the root sits against a scalp at body heat and processes noticeably faster than the rest of the head. Put product on the mid-lengths at the same time and by the time the root is where you want it the mid-lengths have gone past it — the hot-root band that comes out of doing this in the wrong order is visible in daylight for months.",
    },
    {
      id: "process", kind: "gauge", target: "timer",
      title: "Process and pull on time",
      cue: "Watch the development and pull the colour inside the window.",
      why: "Development is a chemical clock that started at the first quadrant, not when you finished the last one. Pull it early and the dye has not fully oxidised inside the strand, so it deposits weakly and fades fast; leave it long and the cuticle keeps swelling after the colour has finished developing, which is damage bought for nothing. The strand test is what tells you which end of the window you are at.",
      gauge: {
        label: "PROCESSING TIMER", speed: 0.5, green: [0.62, 0.8],
        readout: (t) => `${Math.round(t * 55)} min`,
        missNote: "Off the development window — check the strand and the manufacturer's timing before you commit.",
      },
    },
    {
      id: "rinse", kind: "track", target: "backwash", seconds: 6,
      title: "Rinse and neutralise",
      cue: "Hold the water tepid and steady, and rinse until it runs clear.",
      why: "Rinsing is what stops the reaction, so it goes on until the water runs genuinely clear rather than nearly clear — residual oxidant keeps working in the strand and keeps irritating a scalp that has just had peroxide sitting on it for half an hour. The temperature is part of the job: hot water on a freshly processed scalp opens the cuticle further and stings on skin the colour has already sensitised.",
      track: {
        start: 0.14, green: [0.38, 0.58], rise: 0.5, fall: 0.45, drift: 0.1, label: "RINSE TEMPERATURE",
        readout: (v) => (v < 0.38 ? "too cold — colour not shifting" : v > 0.58 ? "too hot for a processed scalp" : "tepid — running clear"),
      },
      holdBreakNote: "Temperature off band — too hot stings a sensitised scalp and swells the cuticle, too cold leaves emulsified colour in the hair. Bring it back and hold it.",
    },
    {
      id: "dispose", kind: "select", target: "waste-bin",
      title: "Strip down the station",
      cue: "Bin the gloves and leftover product, then reset the station.",
      why: "Leftover oxidative colour is chemical waste, not rubbish: it goes in the bin for it rather than down the backwash, and the gloves go with it. Then the station is wiped and reset, because the next client's service starts from whatever state you left this one in — and a colourist is judged on the chair they hand over as much as the head they finish.",
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
      w: 13.9, d: 13.9, h: 4.0,
      floor: 0x2f3238, wall: 0xe6dfd6, ceiling: 0xf2ece4,
      floorRough: 0.28, floorMetal: 0.12, skirtColor: 0x1e2126,
          trim: 0xa8639c, door: "personnel",
});
    // Warm terrazzo speckle on the polished floor.
    for (let i = 0; i < 90; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * 3.9;
      box(root, 0.05 + Math.random() * 0.06, 0.002, 0.05 + Math.random() * 0.06,
        Math.cos(a) * r, 0.003, Math.sin(a) * r,
        [0xb9a389, 0x8d9aa3, 0xd8cfc2][i % 3], { cast: false, receive: false, rough: 0.4 });
    }

    // ----------------------------------------------------- mirror station
    const station = group(root, -1.4, 0, -4.1);
    box(station, 2.5, 2.1, 0.08, 0, 1.55, 0.06, WARMWOOD, { rough: 0.6 });
    // Mirror: faked with a cool gradient so it reads as glass without a render target.
    decal(station, 1.5, 1.5, 0, 1.62, 0.11, (g, w, h) => {
      const grad = g.createLinearGradient(0, 0, w * 0.6, h);
      grad.addColorStop(0, "#c9d6dd"); grad.addColorStop(0.45, "#93a6b2");
      grad.addColorStop(0.75, "#aebdc7"); grad.addColorStop(1, "#7d8f9c");
      g.fillStyle = grad; g.fillRect(0, 0, w, h);
      g.globalAlpha = 0.25; g.fillStyle = "#ffffff";
      g.beginPath(); g.moveTo(w * 0.1, h); g.lineTo(w * 0.45, 0); g.lineTo(w * 0.62, 0); g.lineTo(w * 0.27, h);
      g.closePath(); g.fill(); g.globalAlpha = 1;
    }, { rough: 0.08, metal: 0.85, px: 384 });
    box(station, 1.62, 1.62, 0.03, 0, 1.62, 0.09, 0x3a3d44, { rough: 0.4, metal: 0.5 });
    for (let i = 0; i < 7; i++) {                                   // bulb strip
      const bx = -0.9 + (i % 2) * 1.8, by = 0.95 + Math.floor(i / 2) * 0.42;
      if (i === 6) continue;
      ball(station, 0.045, bx, by, 0.14, 0xfff2d8, { emissive: 0xffe6bd, ei: 2.6, rough: 0.3 });
    }
    const stationLight = new THREE.PointLight(0xffe1b8, 1.6, 5.5, 2);
    stationLight.position.set(-1.4, 1.9, -3.6);
    root.add(stationLight);

    // Console shelf with the client record, glove box, disinfectant jar, tools.
    const console_ = counter(station, 2.3, 0.42, 0, 0.42, 0x2b2e33, { height: 0.86, metal: 0.25, rough: 0.5 });

    const consult = group(console_, -0.78, 0.89, 0.02, 0.25);
    slab(consult, 0.26, 0.012, 0.34, 0, 0, 0, 0x1f2227, { radius: 0.008, rough: 0.4, metal: 0.4 });
    const consultFace = decal(consult, 0.23, 0.3, 0, 0.008, 0,
      paperFace("CLIENT RECORD", [
        "Nadia K. — level 5 base",
        "Target: level 7, warm",
        "Patch test: 22/03 — clear",
        "Last service: gloss, 6 wks",
        "No metallic home colour",
      ]));
    consultFace.rotation.x = -Math.PI / 2;
    reg(consult, "consult-card");

    // Disinfectant jar: glass cylinder with blue solution and immersed combs.
    const jar = group(console_, -0.2, 0.87, 0.0);
    cyl(jar, 0.075, 0.075, 0.26, 0, 0.13, 0, 0xdfeaf2, { opacity: 0.32, rough: 0.05, metal: 0.1, seg: 22 });
    cyl(jar, 0.068, 0.068, 0.17, 0, 0.095, 0, 0x2f6fb5, { opacity: 0.72, rough: 0.15, seg: 22 });
    cyl(jar, 0.08, 0.08, 0.02, 0, 0.27, 0, CHROME, { rough: 0.25, metal: 0.9, seg: 22 });
    for (let i = 0; i < 3; i++) {
      const comb = box(jar, 0.016, 0.2, 0.05, -0.03 + i * 0.03, 0.13, 0.01, [0x1b1e22, 0x6d3f2a, 0x1b1e22][i], { rough: 0.6 });
      comb.rotation.z = -0.12 + i * 0.12;
    }
    decal(jar, 0.12, 0.05, 0, 0.1, 0.077, signFace("DISINFECTANT", { bg: "#123b63", accent: "#6cc6f0", scale: 0.55 }));
    reg(jar, "disinfect-jar");

    // Contaminated shears left out from the previous client — the trap.
    const shears = group(console_, 0.28, 0.88, 0.06, -0.6);
    for (const s of [-1, 1]) {
      const blade = box(shears, 0.012, 0.006, 0.15, s * 0.006, 0, 0.06, CHROME, { rough: 0.15, metal: 0.95 });
      blade.rotation.y = s * 0.05;
      torus(shears, 0.022, 0.005, s * 0.014, 0, -0.05, CHROME, { rough: 0.2, metal: 0.9 }).rotation.x = Math.PI / 2;
    }
    cyl(shears, 0.008, 0.008, 0.012, 0, 0, 0.005, 0x6f767d, { rough: 0.2, metal: 0.9, seg: 10 });
    box(shears, 0.14, 0.004, 0.1, 0, -0.004, 0.03, 0x8a6c58, { rough: 0.85 });      // hair clippings on the towel
    reg(shears, "dirty-shears");

    const gloveBox = group(console_, 0.78, 0.88, 0.02, -0.2);
    slab(gloveBox, 0.2, 0.11, 0.13, 0, 0.055, 0, 0x1d6b8c, { radius: 0.012, rough: 0.7 });
    box(gloveBox, 0.11, 0.005, 0.06, 0, 0.112, 0, 0x0f4257, { rough: 0.6 });
    for (let i = 0; i < 3; i++) {
      const g2 = box(gloveBox, 0.05, 0.03, 0.04, -0.02 + i * 0.02, 0.125 + i * 0.012, 0.005, 0x2b2e33, { rough: 0.9 });
      g2.rotation.set(0.3 + i * 0.2, i * 0.5, 0.2);
    }
    decal(gloveBox, 0.16, 0.045, 0, 0.06, 0.066, signFace("NITRILE  M", { bg: "#0f4257", accent: "#6cc6f0", scale: 0.6 }));
    reg(gloveBox, "glove-box");

    // The flat iron, hot on its rest.
    const iron = group(console_, 0.5, 0.88, -0.1, 0.9);
    box(iron, 0.045, 0.03, 0.26, 0, 0.02, 0, 0x2b2e33, { rough: 0.4, metal: 0.3 });
    box(iron, 0.042, 0.02, 0.16, 0, 0.045, 0.03, 0x3d4148, { rough: 0.35, metal: 0.4 });
    ball(iron, 0.008, 0, 0.058, -0.09, 0xff5a3c, { emissive: 0xff5a3c, ei: 3 });
    hose(iron, [[0, 0.02, -0.13], [-0.1, 0.01, -0.24], [-0.26, 0.005, -0.2]], 0.008, 0x1b1e22, { steps: 12 });
    reg(iron, "flat-iron");

    // --------------------------------------------------------- styling chair
    const chairBase = group(root, -1.4, 0, -2.5);
    cyl(chairBase, 0.36, 0.42, 0.06, 0, 0.03, 0, 0x1b1e22, { rough: 0.5, metal: 0.6, seg: 26 });
    cyl(chairBase, 0.07, 0.07, 0.44, 0, 0.26, 0, CHROME, { rough: 0.2, metal: 0.95, seg: 18 });
    const chairSpin = group(chairBase, 0, 0.48, 0);
    slab(chairSpin, 0.56, 0.12, 0.54, 0, 0.06, 0, SALON_BLACK, { radius: 0.06, rough: 0.75 });
    const chairBack = group(chairSpin, 0, 0.1, -0.24);
    slab(chairBack, 0.54, 0.62, 0.12, 0, 0.31, 0, SALON_BLACK, { radius: 0.06, rough: 0.75 });
    chairBack.rotation.x = -0.1;
    for (const sx of [-1, 1]) slab(chairSpin, 0.07, 0.24, 0.4, sx * 0.3, 0.16, 0.02, SALON_BLACK, { radius: 0.03, rough: 0.7 });
    cyl(chairBase, 0.22, 0.22, 0.03, 0, 0.16, 0.22, CHROME, { rough: 0.25, metal: 0.9, seg: 18 });   // footrest

    // Client, caped, with four hair quadrants that take the colour.
    const client = seatedFigure(chairSpin, 0, 0.12, 0.04, { skin: 0xd6a482, cloth: 0x3b3f46 });
    const cape = group(client.torso, 0, 0.66, 0);
    const capeBody = cyl(cape, 0.23, 0.34, 0.62, 0, -0.06, 0.02, 0x1f2a44, { rough: 0.75, seg: 22, open: true, side: 2 });
    cyl(cape, 0.13, 0.13, 0.06, 0, 0.28, 0, 0xe8e2d6, { rough: 0.9, seg: 18 });        // neck towel
    cape.visible = false;
    // A folded cape waiting on the chair arm is what the learner actually picks up.
    // Where the cape has to end up: across the shoulders, closed at the nape.
    const shoulders = group(client.torso, 0, 0.6, 0.03);
    box(shoulders, 0.3, 0.02, 0.18, 0, 0, 0, 0xe2739b, { rough: 0.6, opacity: 0.25, cast: false });
    reg(shoulders, "client-shoulders");

    const capeFolded = group(console_, 0.06, 0.88, 0.16);
    slab(capeFolded, 0.22, 0.06, 0.16, 0, 0, 0, 0x1f2a44, { radius: 0.02, rough: 0.8 });
    slab(capeFolded, 0.2, 0.03, 0.14, 0, 0.045, 0, 0xe8e2d6, { radius: 0.02, rough: 0.9 });
    reg(capeFolded, "cape");

    const hairRoot = group(client.head, 0, 0.02, 0);
    const quadrants = {};
    const quadSpec = [
      { id: "hair-q1", x: -0.06, z: 0.05, clip: [-0.09, 0.09, 0.06] },
      { id: "hair-q2", x: 0.06, z: 0.05, clip: [0.09, 0.09, 0.06] },
      { id: "hair-q3", x: -0.06, z: -0.06, clip: [-0.09, 0.08, -0.08] },
      { id: "hair-q4", x: 0.06, z: -0.06, clip: [0.09, 0.08, -0.08] },
    ];
    for (const q of quadSpec) {
      const g = group(hairRoot, 0, 0, 0);
      const lock = ball(g, 0.085, q.x, 0.03, q.z, 0x4a3227, { rough: 0.95, seg: 16 });
      lock.scale.set(1, 0.95, 1.05);
      const tail = cyl(g, 0.05, 0.035, 0.16, q.x * 1.5, -0.06, q.z * 1.6, 0x4a3227, { rough: 0.95, seg: 12 });
      tail.rotation.set(q.z * 1.2, 0, -q.x * 1.4);
      const clip = box(g, 0.055, 0.012, 0.02, q.clip[0], q.clip[1], q.clip[2], 0xe2739b, { rough: 0.4 });
      clip.visible = false;
      quadrants[q.id] = { lock, tail, clip, parted: false };
      reg(g, q.id);
    }

    // --------------------------------------------------------- colour bar
    const bar = counter(root, 2.0, 0.62, 2.9, -3.6, 0xe4ded4, { height: 0.94, metal: 0.05, rough: 0.5, ry: 0 });
    decal(bar, 1.7, 0.16, 0, 1.0, -0.32, signFace("COLOUR BAR", { bg: "#2b2e33", accent: "#e2739b", scale: 0.55 }))
      .rotation.x = -Math.PI / 2;
    // Non-metallic mixing bowl with product, and its metal twin — the trap.
    const bowl = group(bar, -0.5, 0.97, 0.05);
    lathe(bowl, [[0.001, 0], [0.09, 0.005], [0.12, 0.05], [0.125, 0.075], [0.118, 0.078], [0.113, 0.05], [0.085, 0.008], [0.001, 0.004]],
      0, 0, 0, 0x2b2e33, { rough: 0.55, seg: 26 });
    const product = cyl(bowl, 0.1, 0.075, 0.03, 0, 0.03, 0, 0x8c5a3c, { rough: 0.35, seg: 24 });
    reg(bowl, "mix-bowl");
    const metalBowl = group(bar, 0.62, 0.97, 0.12);
    lathe(metalBowl, [[0.001, 0], [0.08, 0.004], [0.11, 0.045], [0.115, 0.07], [0.108, 0.072], [0.104, 0.045], [0.075, 0.007], [0.001, 0.003]],
      0, 0, 0, CHROME, { rough: 0.12, metal: 0.95, seg: 26 });
    reg(metalBowl, "metal-bowl");

    const brush = group(bar, -0.18, 0.96, 0.02, 0.5);
    box(brush, 0.016, 0.008, 0.14, 0, 0.006, -0.02, 0x2b2e33, { rough: 0.5 });
    box(brush, 0.035, 0.006, 0.05, 0, 0.006, 0.07, 0xe8e2d6, { rough: 0.9 });
    box(brush, 0.033, 0.004, 0.02, 0, 0.008, 0.095, 0x8c5a3c, { rough: 0.4 });
    reg(brush, "tint-brush");

    // Developer bottles, lathed so they read as real containers.
    const devProfile = [[0.001, 0], [0.038, 0.004], [0.042, 0.02], [0.042, 0.17], [0.028, 0.2], [0.016, 0.21], [0.016, 0.245], [0.001, 0.248]];
    ["10", "20", "30", "40"].forEach((vol, i) => {
      const b = group(bar, -0.02 + i * 0.2, 0.96, -0.16);
      lathe(b, devProfile, 0, 0, 0, 0xf0ece4, { rough: 0.35, seg: 18 });
      cyl(b, 0.019, 0.019, 0.02, 0, 0.255, 0, [0x6cc6f0, 0x59c97b, 0xf2ae14, 0xf0645b][i], { rough: 0.5, seg: 14 });
      decal(b, 0.06, 0.05, 0, 0.11, 0.043, signFace(`${vol} VOL`, { bg: "#f0ece4", fg: "#2b2e33", accent: "#e2739b", scale: 0.55 }));
      // The 40 vol standing on the bar beside the one the card calls for.
      if (vol === "40") reg(b, "dev-40");
    });
    // Colour tubes in a tray.
    for (let i = 0; i < 5; i++) {
      const tube = cyl(bar, 0.014, 0.018, 0.13, 0.7 - i * 0.035, 0.965, -0.16, [0x8c4a2f, 0x5a3a2a, 0xb07840, 0x3a2a24, 0xa85a70][i],
        { rough: 0.4, metal: 0.35, seg: 12 });
      tube.rotation.set(Math.PI / 2, 0, 0.1 * i);
    }

    // Processing timer on the wall behind the bar.
    const timer = group(root, 2.9, 0, -4.24);
    box(timer, 0.34, 0.24, 0.05, 0, 1.6, 0, 0x1f2227, { rough: 0.5, metal: 0.3 });
    const timerFace = decal(timer, 0.28, 0.15, 0, 1.62, 0.028,
      signFace("00:00", { bg: "#12191f", accent: "#e2739b", fg: "#ffd9e6", scale: 0.72 }), { glow: true, ei: 0.7 });
    reg(timer, "timer");

    // ----------------------------------------------------------- backwash
    const wash = group(root, 3.2, 0, 0.9, -Math.PI / 2);
    counter(wash, 1.5, 0.7, 0, 0, 0xe4ded4, { height: 0.8, metal: 0.05, rough: 0.5 });
    const basin = lathe(wash, [[0.001, 0], [0.2, 0.01], [0.26, 0.08], [0.28, 0.16], [0.3, 0.17], [0.29, 0.14], [0.26, 0.06], [0.001, 0.006]],
      0, 0.82, 0.02, 0xf4f1ec, { rough: 0.16, metal: 0.05, seg: 26 });
    box(wash, 0.24, 0.05, 0.1, 0, 0.9, -0.3, 0xf4f1ec, { rough: 0.16 });              // neck rest
    cyl(wash, 0.016, 0.016, 0.26, 0, 1.0, 0.28, CHROME, { rough: 0.15, metal: 0.95, seg: 14 });
    hose(wash, [[0, 1.12, 0.28], [0.02, 1.2, 0.18], [0, 1.16, 0.05]], 0.014, CHROME, { steps: 14, rough: 0.15, metal: 0.9 });
    const water = particles(wash, 70, 0x9fd8f0, { size: 0.012, life: 0.35, additive: false, opacity: 0.7 });
    const washChair = group(wash, 0, 0, -1.15);
    slab(washChair, 0.5, 0.12, 0.5, 0, 0.44, 0, SALON_BLACK, { radius: 0.05, rough: 0.75 });
    slab(washChair, 0.5, 0.5, 0.12, 0, 0.72, -0.2, SALON_BLACK, { radius: 0.05, rough: 0.75 });
    cyl(washChair, 0.22, 0.28, 0.4, 0, 0.2, 0, 0x1b1e22, { rough: 0.5, metal: 0.5, seg: 20 });
    reg(wash, "backwash");

    // ------------------------------------------------- product wall + dryer
    const wallUnit = group(root, -4.18, 0, 0.6, Math.PI / 2);
    for (let s = 0; s < 3; s++) {
      box(wallUnit, 1.9, 0.04, 0.26, 0, 1.05 + s * 0.42, 0, WARMWOOD, { rough: 0.6 });
      for (let i = 0; i < 8; i++) {
        const p = group(wallUnit, -0.78 + i * 0.22, 1.07 + s * 0.42, 0);
        lathe(p, [[0.001, 0], [0.032, 0.003], [0.035, 0.02], [0.035, 0.15], [0.022, 0.18], [0.013, 0.19], [0.013, 0.215], [0.001, 0.218]],
          0, 0, 0, [0xf0ece4, 0x2b2e33, 0xe2739b, 0xc8b48a][(i + s) % 4], { rough: 0.35, seg: 14 });
        cyl(p, 0.015, 0.015, 0.016, 0, 0.222, 0, 0x8d959d, { rough: 0.3, metal: 0.8, seg: 10 });
      }
    }
    decal(wallUnit, 1.6, 0.14, 0, 2.4, 0.06, signFace("RETAIL", { bg: "#8a6244", accent: "#e2739b", scale: 0.5 }));

    const dryer = group(root, -3.3, 0, 2.6, -0.6);
    cyl(dryer, 0.3, 0.36, 0.05, 0, 0.025, 0, 0x1b1e22, { rough: 0.5, metal: 0.6, seg: 22 });
    cyl(dryer, 0.035, 0.035, 1.15, 0, 0.6, 0, CHROME, { rough: 0.2, metal: 0.95, seg: 14 });
    const hood = group(dryer, 0, 1.28, 0);
    lathe(hood, [[0.001, 0.0], [0.22, 0.02], [0.25, 0.1], [0.24, 0.24], [0.16, 0.3], [0.001, 0.31]], 0, 0, 0, 0xf0ece4,
      { rough: 0.35, seg: 24, side: 2 });
    const fan = group(hood, 0, 0.2, 0);
    for (let i = 0; i < 4; i++) {
      const blade = box(fan, 0.13, 0.006, 0.04, 0, 0, 0, 0xb9c0c6, { rough: 0.4, metal: 0.6, cast: false });
      blade.rotation.y = (i * Math.PI) / 2;
      blade.rotation.z = 0.3;
    }

    // Waste bin with a foot pedal.
    const bin = group(root, 1.0, 0, -3.3);
    cyl(bin, 0.19, 0.22, 0.62, 0, 0.31, 0, 0x4b5058, { rough: 0.45, metal: 0.4, seg: 22 });
    const lid = cyl(bin, 0.2, 0.2, 0.03, 0, 0.635, 0, 0x2b2e33, { rough: 0.4, metal: 0.5, seg: 22 });
    box(bin, 0.16, 0.02, 0.08, 0, 0.04, 0.2, 0x2b2e33, { rough: 0.5 });
    decal(bin, 0.2, 0.07, 0, 0.42, 0.222, signFace("SALON WASTE", { bg: "#2b2e33", accent: "#e2739b", scale: 0.5 }));
    reg(bin, "waste-bin");

    // Towel stack and a stool for dressing.
    const towels = group(root, 2.0, 0, 2.9);
    for (let i = 0; i < 4; i++) slab(towels, 0.3, 0.06, 0.22, 0, 0.9 + i * 0.065, 0, [0xe8e2d6, 0xdcd4c6][i % 2], { radius: 0.02, rough: 0.95 });
    // The towel off the last client, folded back onto the clean stack.
    const usedTowel = group(towels, 0.02, 1.18, 0.02);
    slab(usedTowel, 0.3, 0.06, 0.22, 0, 0, 0, 0xcfc0b4, { radius: 0.02, rough: 0.95 });
    box(usedTowel, 0.1, 0.004, 0.08, 0.04, 0.032, 0.03, 0x8c5a3c, { rough: 0.6 });
    reg(usedTowel, "used-towel");
    counter(towels, 0.42, 0.34, 0, 0, 0xe4ded4, { height: 0.88, rough: 0.5, metal: 0.05 });

    const dirLight = new THREE.DirectionalLight(0xfff0dd, 0.85);
    dirLight.position.set(-3, 5, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.left = -6; dirLight.shadow.camera.right = 6;
    dirLight.shadow.camera.top = 6; dirLight.shadow.camera.bottom = -6;
    root.add(dirLight);
    root.add(new THREE.HemisphereLight(0xffe9d2, 0x3a2f2a, 0.95));

    let rinsing = false;
    let coloured = false;

    // The bay is 13.9m by 13.9m now. Push the workstations out to match, so
    // the extra floor is distance between jobs rather than empty ring.
    spreadLayout(root, 1.62);

    const W = 13.9, D = 13.9;
    // ------------------------------------------------- the rest of the bay
    // A colour studio's back bar: stock shelving, the second station nobody
    // is working at, the towel trolley and the board with the patch-test
    // policy on it.
    racking(fixed, -W / 2 + 0.5, -2.4, Math.PI / 2, { w: 2.6, h: 2.0, frame: 0x8a6a52, stock: [0xc9a0b8, 0xe0d4c4, 0xb08aa0] });
    noticeBoard(fixed, 1.8, D / 2 - 0.25, Math.PI, { w: 1.5 });
    wasteBin(fixed, W / 2 - 1.2, 4.0, -1.0, { color: 0x6b4a5e, lid: 0x543a4a, label: "Colour waste" });

    // A colleague working the second station and somebody at the back bar.
    const crew = [
      bayCrew(root, 4.3, 3.1, -2.19, { task: "bench", cloth: 0x2b2f36, legs: 0x1e2126, hiVis: false, skin: 0xd9a985 }),
      bayCrew(root, -3.3, -4.9, 0.59, { task: "overhead", cloth: 0x6b4a5e, legs: 0x1e2126, hiVis: false }),
    ];

    // Fittings on a grid sized to this floor, plus the bounce a real room
    // has and this one did not: see ceilingGrid in shared/kit.js.
    ceilingGrid(fixed, 13.9, 13.9, { color: 0xfff4ea, ei: 1.3, lamp: 1.4, y: 3.84 });

    mergeStatic(fixed);

    return {
      hits,
      spawnLook: new THREE.Vector3(-1.4, 1.2, -2.6),

      onStepComplete(step) {
        if (step.id === "cape") { cape.visible = true; capeFolded.visible = false; }
        if (step.id === "gloves") {
          for (const arm of client.arms) arm.fore.children.forEach((c) => { if (c.isMesh) c.material = mat(0x2b2e33, { rough: 0.9 }); });
        }
        if (step.id === "section") Object.values(quadrants).forEach((q) => { q.clip.visible = true; q.parted = true; });
        if (step.id === "apply") {
          coloured = true;
          Object.values(quadrants).forEach((q) => {
            q.lock.material = mat(0x6b4630, { rough: 0.55, metal: 0.1 });
            q.tail.material = mat(0x6b4630, { rough: 0.55, metal: 0.1 });
          });
        }
        if (step.id === "process") {
          Object.values(quadrants).forEach((q) => {
            q.lock.material = mat(0x9a6b3c, { rough: 0.7 });
            q.tail.material = mat(0x9a6b3c, { rough: 0.7 });
          });
        }
        if (step.id === "rinse") rinsing = true;
        if (step.id === "dispose") { product.visible = false; rinsing = false; }
      },

      animate(t, dt, session) {

        breatheCrew(crew, t);
        chairSpin.rotation.y = Math.sin(t * 0.22) * 0.12;
        client.head.rotation.y = Math.sin(t * 0.35) * 0.14;
        client.head.rotation.x = Math.sin(t * 0.5) * 0.04;
        client.torso.position.y = Math.sin(t * 1.1) * 0.004;
        fan.rotation.y += dt * 3.4;
        if (rinsing) {
          water.visible = true;
          water.userData.step(dt, new THREE.Vector3(0, 1.12, 0.06), 0.05, 0.35, -2.6);
        } else if (water.visible) water.visible = false;

        const g = session?.gauge;
        if (g && !g.committed && session.step?.id === "process") {
          const mins = Math.round(g.t * 55);
          repaint(timerFace, signFace(`${String(Math.floor(mins)).padStart(2, "0")}:00`, {
            bg: "#12191f", accent: mins >= 34 && mins <= 44 ? "#59c97b" : "#e2739b", fg: "#ffd9e6", scale: 0.72,
          }));
        } else if (coloured && session?.step?.id !== "process") {
          repaint(timerFace, signFace("DONE", { bg: "#12191f", accent: "#59c97b", fg: "#ffd9e6", scale: 0.6 }));
        }
      },
    };
  },
};
