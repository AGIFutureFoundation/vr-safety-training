import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, rackFrame, rackUnit, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Solar Deck VR — its own gamified system: Rooftop Authority.
// Rooftop PV and battery commissioning. Two ways to be killed up here: the edge,
// and a DC string that has no off switch as long as the sun is up.

export const SIM_SOLAR_DECK = {
  id: "solar-deck",
  index: "04",
  domain: "Energy",
  trade: "Solar / BESS technician",
  name: "Solar Deck",
  title: simTitle("Solar Deck"),
  tagline: "Rooftop array and battery commissioning: fall protection, rapid shutdown and string test",
  accent: 0xffb648,
  accentCss: "#ffb648",
  parSeconds: 215,
  badge: { id: "rooftop-authority", name: "Rooftop Authority", note: "Anchored, isolated and commissioned with no shortcut" },

  game: system({
    name: "Rooftop Authority",
    currency: "SOLAR",
    ranks: ["Roof Hand", "Array Technician", "String Tester", "Commissioning Lead", "Rooftop Certified"],
    badges: [
      { id: "tied-off", name: "Tied Off", note: "Anchor before the edge, every run", test: AWARD.safe },
      { id: "string-true", name: "String True", note: "Hold every electrical reading near band centre", test: AWARD.precise(0.72) },
      { id: "shutdown-clean", name: "Rapid Shutdown", note: "Isolate DC and AC without a misstep", test: AWARD.all(AWARD.stepClean("dc-isolate"), AWARD.stepClean("ac-isolate")) },
    ],
    challenges: [
      { id: "daylight", name: "Daylight Run", note: "Commission inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-callback", name: "No Callback", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "array-streak", name: "Array Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "roof-edge": "You walked to an unprotected edge with no anchor. Falls from height are the single largest killer in this trade and the roof does not care how experienced you are.",
    "hot-mc4": "You pulled an MC4 under load. A live DC string will not stop arcing when the plug separates — the array is a current source for as long as the sun is on it.",
    "battery-terminal": "Those are the battery terminals. A DC battery bank has no zero-crossing: a spanner across them vaporises and takes your hand with it.",
    "damaged-conduit": "That conduit is crushed and the conductors inside are chafed. Energising a damaged run puts fault current into the roof structure.",
  },

  lateNotes: {
    "string-meter": "Nothing gets metered until the array is in rapid shutdown and both disconnects are open.",
    "bess-panel": "The battery comes last — the array side is isolated first so you are not working two live sources at once.",
  },

  steps: [
    {
      id: "survey", kind: "select", target: "roof-plan",
      title: "Survey the roof and anchor plan",
      cue: "Read the plan: anchor points, edge distances, array layout.",
      why: "You establish where the anchors are and where the unprotected edges start before you step onto the deck, not while you are on it.",
    },
    {
      id: "anchor", kind: "select", target: "anchor-point",
      title: "Connect to the anchor",
      cue: "Clip the lanyard to the certified anchor point.",
      why: "The anchor is rated and inspected. Connecting to a vent stack or a pipe because it is closer is how anchors fail at the worst moment.",
    },
    {
      id: "harness", kind: "select", target: "harness",
      title: "Don and check the harness",
      cue: "Fit the harness and check the D-ring and lanyard condition.",
      why: "The harness is inspected at every use. A frayed lanyard passes right up until the day it does not.",
    },
    {
      id: "shutdown", kind: "select", target: "rapid-shutdown",
      title: "Initiate rapid shutdown",
      cue: "Hit the rapid shutdown initiator at the roof access.",
      why: "Rapid shutdown drops the array conductors to a safe voltage outside the modules. It is the only thing that makes the roof wiring approachable in daylight.",
    },
    {
      id: "dc-isolate", kind: "turn", target: "dc-disconnect",
      title: "Open the DC disconnect",
      cue: "Grab the DC disconnect handle and pull it open.",
      why: "DC first. Opening AC while DC is still feeding the inverter leaves stored energy and a live front end behind the cover.",
      turn: { turns: 0.25, axis: "z", reverse: true, label: "DC DISCONNECT" },
    },
    {
      id: "ac-isolate", kind: "turn", target: "ac-disconnect",
      title: "Open the AC disconnect",
      cue: "Grab the AC disconnect handle and pull it open.",
      why: "Now the inverter has neither a source nor a grid connection. Both sides are what makes it isolated rather than just quiet.",
      turn: { turns: 0.25, axis: "z", reverse: true, label: "AC DISCONNECT" },
    },
    {
      id: "lock", kind: "select", target: "lock-point",
      title: "Lock both disconnects",
      cue: "Lock and tag the DC and AC disconnects.",
      why: "Two isolations, two locks. An inverter that gets reset remotely during a string test is a very expensive lesson.",
    },
    {
      id: "voc", kind: "gauge", target: "string-meter",
      title: "Measure string open-circuit voltage",
      cue: "Read Voc on string 3 and commit inside the expected band.",
      why: "Voc against the expected value for this string length and temperature is how you find a missing module, a reversed pair or a shaded run before you energise.",
      gauge: {
        label: "STRING 3 — OPEN CIRCUIT VOLTAGE", speed: 0.68, green: [0.5, 0.64],
        readout: (t) => `${Math.round(t * 1200)} V DC`,
        missNote: "Off the expected Voc for this string. That is a module count or a connection problem — find it before commissioning.",
      },
    },
    {
      id: "checks", kind: "sequence",
      targets: ["check-polarity", "check-insulation", "check-continuity"],
      itemNames: {
        "check-polarity": "polarity", "check-insulation": "insulation resistance", "check-continuity": "earth continuity",
      },
      title: "Complete the string tests in order",
      cue: "Polarity, then insulation resistance, then earth continuity.",
      why: "Polarity first, because an insulation test on a reversed string tells you nothing useful and can damage the tester. Continuity last confirms the protective path you have been relying on.",
      outOfOrderNote: "Wrong order — polarity is confirmed before any test that injects voltage into the string.",
    },
    {
      id: "bess", kind: "gauge", target: "bess-panel",
      title: "Check the battery state",
      cue: "Read pack state of charge and commit inside the commissioning window.",
      why: "A battery commissioned at the extremes of its charge window cannot be balanced properly, and the first cycle is when cell imbalance shows itself.",
      gauge: {
        label: "PACK STATE OF CHARGE", speed: 0.6, green: [0.4, 0.58],
        readout: (t) => `${Math.round(t * 100)} % SOC`,
        missNote: "Outside the commissioning window — bring the pack into range before the first cycle.",
      },
    },
    {
      id: "energise", kind: "select", target: "commission-panel",
      title: "Energise and record",
      cue: "Remove the locks, energise in reverse order and log the commissioning data.",
      why: "Energise AC then DC, watch the inverter come up, and record the readings. The commissioning record is what the next technician inherits.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.05, 0xffb648);

    // ------------------------------------------------------------- roof deck
    box(g, 4.6, 0.16, 4.6, 0, 0.08, 0, 0x4a4f55, { rough: 0.96 });
    for (let i = -3; i <= 3; i++) {
      box(g, 4.6, 0.005, 0.03, 0, 0.165, i * 0.7, 0x3c4147, { cast: false, receive: false });
    }
    // Parapet on two sides, open edge on the third — that open edge is the hazard.
    for (const [px, pz, pw, pd, pry] of [[0, -2.3, 4.6, 0.16, 0], [-2.3, 0, 0.16, 4.6, 0]]) {
      box(g, pw, 0.5, pd, px, 0.4, pz, 0x5d646b, { rough: 0.9 });
      box(g, pw + 0.04, 0.05, pd + 0.04, px, 0.67, pz, 0x6d747b, { rough: 0.8 });
    }
    const edge = box(g, 4.6, 0.02, 0.5, 0, 0.17, 2.15, 0x2b3138, { rough: 0.95, cast: false });
    for (let i = 0; i < 9; i++) {
      box(g, 0.28, 0.006, 0.1, -2.1 + i * 0.52, 0.18, 2.15, 0xf0645b, { rough: 0.8, cast: false });
    }
    holoTag(g, "Unprotected edge", 0, 0.55, 2.15, { css: "#f0645b", w: 0.36 });
    reg(hits, edge, "roof-edge");

    // ------------------------------------------------------------ PV array
    const array = group(g, -0.35, 0, -1.15, 0.12);
    const modules = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const m = group(array, -0.98 + col * 0.98, 0, -0.45 + row * 0.92);
        // Tilted frame on ballasted feet.
        for (const sx of [-1, 1]) {
          cyl(m, 0.02, 0.024, 0.36, sx * 0.42, 0.18, -0.3, 0xa8b0b8, { rough: 0.4, metal: 0.7, seg: 8 });
          cyl(m, 0.02, 0.024, 0.12, sx * 0.42, 0.06, 0.3, 0xa8b0b8, { rough: 0.4, metal: 0.7, seg: 8 });
          box(m, 0.2, 0.07, 0.18, sx * 0.42, 0.035, 0, 0x53585e, { rough: 0.95 });
        }
        const panel = group(m, 0, 0.3, 0);
        panel.rotation.x = 0.34;
        box(panel, 0.92, 0.03, 0.6, 0, 0, 0, 0x9aa3ab, { rough: 0.4, metal: 0.6 });
        const glass = box(panel, 0.88, 0.012, 0.56, 0, 0.021, 0, 0x152a48,
          { rough: 0.1, metal: 0.25, opacity: 0.95 });
        for (let c = 0; c < 6; c++) {
          box(panel, 0.008, 0.004, 0.54, -0.37 + c * 0.148, 0.028, 0, 0x2c4a72, { rough: 0.3, cast: false });
        }
        modules.push({ panel, glass });
      }
    }
    holoTag(array, "String 3 · 18 modules", 0, 0.95, -0.5, { css: "#ffb648", w: 0.42 });

    // MC4 connectors under the array — pulling one live is the trap.
    const mc4 = group(array, 0.55, 0.16, 0.42);
    for (const sx of [-1, 1]) {
      cyl(mc4, 0.014, 0.014, 0.09, sx * 0.03, 0, 0, sx < 0 ? 0x1b1e22 : 0xb8402f, { rough: 0.5, seg: 10 })
        .rotation.z = Math.PI / 2;
    }
    hose(mc4, [[-0.08, 0, 0], [-0.3, -0.04, 0.14], [-0.5, -0.1, 0.02]], 0.008, 0x1b1e22, { steps: 12 });
    holoTag(mc4, "String connector", 0, 0.2, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, mc4, "hot-mc4");

    // ----------------------------------------------------- inverter + combiner
    const wall = group(g, -2.05, 0, -0.4, Math.PI / 2);
    const inverter = group(wall, 0, 0, 0);
    slab(inverter, 0.66, 0.9, 0.28, 0, 0.95, 0, 0x2f3a44, { radius: 0.04, rough: 0.45, metal: 0.4 });
    for (let i = 0; i < 7; i++) box(inverter, 0.6, 0.02, 0.02, 0, 0.62 + i * 0.09, 0.15, 0x22272c, { rough: 0.7 });
    const invScreen = decal(inverter, 0.3, 0.16, 0, 1.28, 0.15,
      signFace("OFFLINE", { bg: "#2a1a0d", accent: "#ffb648", fg: "#ffe3ac", scale: 0.42 }),
      { glow: true, ei: 0.85, px: 320 });
    holoTag(inverter, "Inverter", 0, 1.52, 0.1, { css: "#ffb648", w: 0.24 });

    const dcBox = group(wall, -0.62, 0, 0);
    slab(dcBox, 0.34, 0.36, 0.2, 0, 1.05, 0, 0x53585e, { radius: 0.02, rough: 0.5, metal: 0.5 });
    const dcHandle = box(dcBox, 0.05, 0.13, 0.04, 0, 1.05, 0.11, 0xf0645b, { rough: 0.5 });
    decal(dcBox, 0.26, 0.06, 0, 1.27, 0.101, signFace("DC DISCONNECT", { accent: "#ffb648", scale: 0.5 }));
    reg(hits, dcBox, "dc-disconnect");
    dcBox.userData.wheel = dcHandle; // the part app.js actually spins for the 'turn' step

    const acBox = group(wall, 0.62, 0, 0);
    slab(acBox, 0.3, 0.32, 0.18, 0, 1.05, 0, 0x53585e, { radius: 0.02, rough: 0.5, metal: 0.5 });
    const acHandle = box(acBox, 0.05, 0.12, 0.04, 0, 1.05, 0.1, 0xf2c14b, { rough: 0.5 });
    decal(acBox, 0.24, 0.06, 0, 1.25, 0.091, signFace("AC DISCONNECT", { accent: "#ffb648", scale: 0.5 }));
    reg(hits, acBox, "ac-disconnect");
    acBox.userData.wheel = acHandle;

    const lockPoint = group(wall, 0, 0.62, 0.16);
    box(lockPoint, 0.2, 0.1, 0.03, 0, 0, 0, 0xd8232a, { rough: 0.6 });
    decal(lockPoint, 0.18, 0.05, 0, 0.03, 0.018, signFace("LOTO", { bg: "#7d1512", accent: "#f2ae14", scale: 0.6 }));
    const dcLock = lockTag(dcBox, 0, 0.9, 0.11, { color: 0xd8232a });
    const acLock = lockTag(acBox, 0, 0.9, 0.1, { color: 0x1f7ae0 });
    dcLock.visible = false; acLock.visible = false;
    reg(hits, lockPoint, "lock-point");

    // Rapid shutdown initiator by the roof access.
    const rsd = group(g, 1.85, 0, 1.35, -0.7);
    cyl(rsd, 0.035, 0.045, 1.0, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    box(rsd, 0.24, 0.24, 0.12, 0, 1.12, 0, 0xf0d24a, { rough: 0.6 });
    const rsdButton = cyl(rsd, 0.06, 0.06, 0.05, 0, 1.12, 0.08, 0xd8232a, { rough: 0.5, seg: 18 });
    rsdButton.rotation.x = Math.PI / 2;
    decal(rsd, 0.22, 0.06, 0, 1.28, 0.062, signFace("RAPID SHUTDOWN", { bg: "#7d1512", accent: "#f2ae14", scale: 0.46 }));
    holoTag(rsd, "Initiator", 0, 1.45, 0.05, { css: "#ffb648", w: 0.24 });
    reg(hits, rsd, "rapid-shutdown");

    // ---------------------------------------------------------- battery bank
    const bess = group(g, 1.55, 0, -1.35, -0.35);
    slab(bess, 0.9, 1.25, 0.42, 0, 0.63, 0, 0x36414b, { radius: 0.04, rough: 0.5, metal: 0.35 });
    box(bess, 0.94, 0.05, 0.46, 0, 1.28, 0, 0x2a333c, { rough: 0.55, metal: 0.4 });
    for (let i = 0; i < 4; i++) {
      box(bess, 0.8, 0.02, 0.02, 0, 0.28 + i * 0.24, 0.215, 0x22272c, { rough: 0.7 });
    }
    const bessScreen = decal(bess, 0.4, 0.2, 0, 1.06, 0.215,
      signFace("PACK\nSTANDBY", { bg: "#0d1c24", accent: "#4fd1ff", fg: "#bfeaf7", scale: 0.3 }),
      { glow: true, ei: 0.85, px: 384 });
    const bessLamps = [];
    for (let i = 0; i < 6; i++) {
      bessLamps.push(ball(bess, 0.012, -0.3 + i * 0.12, 0.72, 0.215, CITY.good,
        { emissive: CITY.good, ei: 1.4 }));
    }
    holoTag(bess, "BESS 30 kWh", 0, 1.5, 0.1, { css: "#ffb648", w: 0.3 });
    reg(hits, bessScreen, "bess-panel");

    const terminals = group(bess, 0.3, 0.4, 0.22);
    for (const sx of [-1, 1]) {
      cyl(terminals, 0.022, 0.022, 0.03, sx * 0.05, 0, 0, sx < 0 ? 0xb8402f : 0x1b1e22,
        { rough: 0.4, metal: 0.8, seg: 12 }).rotation.x = Math.PI / 2;
    }
    box(terminals, 0.16, 0.05, 0.01, 0, 0.05, 0, 0xf2c14b, { rough: 0.6 });
    reg(hits, terminals, "battery-terminal");

    // Crushed conduit run — the trap you find by looking.
    const conduit = group(g, -1.2, 0, 1.5, 0.25);
    hose(conduit, [[-0.8, 0.22, 0], [-0.2, 0.24, 0.1], [0.5, 0.22, -0.05]], 0.035, 0x8d959d,
      { steps: 16, rough: 0.5, metal: 0.5 });
    box(conduit, 0.14, 0.05, 0.09, -0.05, 0.22, 0.06, 0x6d757d, { rough: 0.7, metal: 0.4 });
    holoTag(conduit, "Crushed run", 0, 0.48, 0, { css: "#f0645b", w: 0.26 });
    reg(hits, conduit, "damaged-conduit");

    // -------------------------------------------------------- anchor + harness
    const anchor = group(g, -1.45, 0, -1.9);
    cyl(anchor, 0.11, 0.14, 0.1, 0, 0.21, 0, 0xd8b23a, { rough: 0.5, metal: 0.5, seg: 16 });
    torus(anchor, 0.06, 0.012, 0, 0.31, 0, 0xd8b23a, { rough: 0.4, metal: 0.7 });
    decal(anchor, 0.2, 0.05, 0, 0.44, 0, signFace("ANCHOR · 22 kN", { accent: "#ffb648", scale: 0.5 }));
    holoTag(anchor, "Certified anchor", 0, 0.62, 0, { css: "#ffb648", w: 0.34 });
    reg(hits, anchor, "anchor-point");
    const lifeline = hose(g, [[-1.45, 0.31, -1.9], [-0.9, 0.6, -1.2], [-0.3, 0.9, -0.4]], 0.01, 0xf2c14b,
      { steps: 18, rough: 0.8 });
    lifeline.visible = false;

    const chest = toolChest(g, 0.85, 1.5, { ry: -0.4, color: 0xffb648 });
    const harness = group(chest, -0.1, 0.79, 0, 0.4);
    for (const sx of [-1, 1]) {
      const strap = box(harness, 0.03, 0.02, 0.22, sx * 0.06, 0, 0, 0xf2c14b, { rough: 0.85 });
      strap.rotation.x = 0.22;
    }
    box(harness, 0.16, 0.02, 0.04, 0, 0.014, 0.03, 0xf2c14b, { rough: 0.85 });
    torus(harness, 0.022, 0.005, 0, 0.035, -0.07, CITY.steel, { rough: 0.3, metal: 0.9 });
    holoTag(harness, "Harness + lanyard", 0, 0.2, 0, { css: "#ffb648", w: 0.36 });
    reg(hits, harness, "harness");

    const meter = instrument(chest, 0.14, 0.79, 0.04, { ry: -0.3, idle: "0 V", color: 0xffb648 });
    holoTag(meter, "String tester", 0, 0.16, 0, { css: "#ffb648", w: 0.28 });
    reg(hits, meter, "string-meter");

    // String test checkpoints as holo markers on the combiner.
    const checks = [
      { id: "check-polarity", label: "POLARITY", x: -0.22 },
      { id: "check-insulation", label: "INSULATION", x: 0 },
      { id: "check-continuity", label: "CONTINUITY", x: 0.22 },
    ];
    const checkFaces = {};
    for (const c of checks) {
      const holder = group(wall, c.x, 1.62, 0.06);
      box(holder, 0.19, 0.1, 0.012, 0, 0, 0, 0x11181f, { rough: 0.6 });
      checkFaces[c.id] = decal(holder, 0.18, 0.085, 0, 0, 0.008,
        signFace(c.label + "\nPENDING", { bg: "#11181f", accent: "#ffb648", scale: 0.28 }), { px: 256 });
      reg(hits, holder, c.id);
    }

    // Holographic paperwork.
    const plan = holoPanel(g, 0.58, 0.4, 1.9, 1.5, 0.15, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffb648"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("ROOF PLAN · BLOCK C", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("ARRAY 3 COMMISSIONING", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Anchor: 22 kN, south-west", "Unprotected edge: north side",
       "String 3: 18 modules, Voc 620 V ±5%", "Insulation: >1 MΩ at 1000 V",
       "BESS commissioning SOC: 40–58%"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: -0.75, accent: 0xffb648 });
    reg(hits, plan, "roof-plan");

    const commission = holoPanel(g, 0.44, 0.28, -1.05, 1.45, 1.85, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffb648"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("COMMISSIONING LOG", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ctx.fillText("Energise AC then DC · record", w / 2, h * 0.62);
      ctx.fillText("Voc, IR, continuity, SOC", w / 2, h * 0.8);
    }, { ry: 0.3, accent: 0xffb648 });
    reg(hits, commission, "commission-panel");

    let live = true;
    let anchored = false;
    let arcTimer = 0;
    const arc = particles(mc4, 50, 0xbfe4ff, { size: 0.016, life: 0.28 });

    return {
      hits,
      footprint: 2.05,

      onStepComplete(step) {
        if (step.id === "anchor") { anchored = true; lifeline.visible = true; }
        if (step.id === "shutdown") {
          live = false;
          rsdButton.position.z = 0.055;
          modules.forEach(({ glass }) => { glass.material = mat(0x1b3050, { rough: 0.15, metal: 0.2 }); });
          repaint(invScreen, signFace("RAPID\nSHUTDOWN", { bg: "#2a1a0d", accent: "#f0645b", fg: "#ffd2ce", scale: 0.3 }));
        }
        // Both handles are turned live by the player's drag — app.js drives
        // their rotation from session.turn while each step is active.
        if (step.id === "lock") { dcLock.visible = true; acLock.visible = true; }
        if (step.id === "checks") {
          for (const c of checks) {
            repaint(checkFaces[c.id], signFace(c.label + "\nPASS", {
              bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.28,
            }));
          }
        }
        if (step.id === "energise") {
          dcLock.visible = false; acLock.visible = false;
          dcHandle.rotation.z = 0; acHandle.rotation.z = 0;
          repaint(invScreen, signFace("ONLINE\n11.4 kW", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
          repaint(bessScreen, signFace("PACK\nBALANCING", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },

      onHazard(hitId) { if (hitId === "hot-mc4" && live) arcTimer = 0.45; },

      animate(t, dt, session) {
        bessLamps.forEach((l, i) => { l.material.emissiveIntensity = 1.0 + Math.sin(t * 2 + i * 0.6) * 0.6; });
        if (live) modules.forEach(({ glass }, i) => {
          glass.material.emissiveIntensity = 0.2 + Math.sin(t * 0.7 + i) * 0.08;
        });
        if (arcTimer > 0) {
          arcTimer -= dt;
          arc.visible = true;
          arc.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.06, 1.6, -3.2);
        } else if (arc.visible) arc.visible = false;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "voc") {
            const v = Math.round(gg.t * 1200);
            repaint(meter.userData.screen, signFace(`${v} V`, {
              bg: "#0d1c24", accent: gg.t > 0.5 && gg.t < 0.64 ? "#59c97b" : "#ffb648", fg: "#bfeaf7", scale: 0.6,
            }));
          }
          if (session.step?.id === "bess") {
            repaint(bessScreen, signFace(`SOC\n${Math.round(gg.t * 100)}%`, {
              bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.58 ? "#59c97b" : "#ffb648", fg: "#bfeaf7", scale: 0.3,
            }));
          }
        }
      },
    };
  },
};
