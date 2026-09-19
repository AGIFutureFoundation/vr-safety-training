import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, cone, barrierPanel, instrument, standingFigure, valveWheel, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Decon Line VR — Emergency Services, station two.
// A hazmat decontamination corridor at a chemical release: zones set by the
// wind, a corridor that walks contamination off a responder one pool at a
// time, a doffing order that keeps the mask on until the suit is off, and
// runoff that stays in the berm instead of the storm drain.

const DL_ACCENT = 0xf2c14b;

export const SIM_DECON_LINE = {
  id: "decon-line",
  index: "25",
  domain: "Emergency Services",
  trade: "Hazmat firefighter / decon technician",
  category: "Emergency Services",
  weather: "wind",
  certification: "IAFF — NFPA 470 hazardous materials operations (decontamination mission-specific competency); OSHA 29 CFR 1910.120(q) emergency response",
  name: "Decon Line",
  title: simTitle("Decon Line"),
  tagline: "Hazmat decontamination corridor: zones by the wind, pools in order, gross wash, doffing order, runoff contained",
  accent: DL_ACCENT,
  accentCss: "#f2c14b",
  parSeconds: 250,
  footprint: 2.4,
  badge: { id: "corridor-clean", name: "Corridor Clean", note: "A corridor set by the wind, a responder walked through clean, mask on until the suit is off, and not a litre to the drain" },

  game: system({
    name: "Decon Command",
    currency: "PASS",
    ranks: ["Decon Tech", "Corridor Lead", "Decon Officer", "Hazmat Ops", "Decon Command Certified"],
    badges: [
      { id: "zones-first", name: "Zones First", note: "Hot, warm and cold set in order, first time", test: AWARD.stepClean("zones") },
      { id: "mask-on", name: "Mask On", note: "Never unmasked in the warm zone, never shortcut the corridor", test: AWARD.safe },
      { id: "vitals-true", name: "Vitals True", note: "Medical monitoring read inside the criteria", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-corridor", name: "Clean Corridor", note: "No corrections anywhere on the line", test: AWARD.clean },
      { id: "wash-held", name: "Wash Held", note: "Held the gross wash steady the whole pass", test: AWARD.unbroken },
      { id: "line-up-fast", name: "Line Up Fast", note: "Corridor established inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "shortcut-hot": "You stepped from the hot zone straight into the cold zone. Every step of the corridor exists to leave contamination behind; a shortcut carries it into the rehab area, the ambulance and the crew that never suited up.",
    "mask-off-warm": "You pulled the mask off in the warm zone. The SCBA comes off last, in the cold zone, after the suit — the air around the corridor is still the release's air.",
    "runoff-drain": "You let the wash water run to the storm drain. Decon runoff is the contaminant in solution; it is bermed and pumped to the collection tank, never sent downstream.",
    "bare-hands-rinse": "You rinsed a responder with bare hands. The decon crew is in PPE too — the corridor's own people are exposed to everything they wash off.",
  },

  lateNotes: {
    "hydrant-valve": "Water comes after the corridor is set and the crew is in PPE — a charged line with nowhere contained for it to go is the runoff hazard you are here to prevent.",
    "wash-wand": "The gross wash starts once the responder is in the first pool and the water supply is up.",
  },

  steps: [
    {
      id: "iap", kind: "select", target: "iap-board",
      title: "Read the incident action plan",
      cue: "Check the product, the decon method, the zone layout and who is medical.",
      why: "The plan says what the product is, whether it is a water-soluble wash or a dry decon, and where the zones go. The corridor is built from the plan, not from habit.",
    },
    {
      id: "wind", kind: "select", target: "wind-flag",
      title: "Check the wind",
      cue: "Read the flag — the corridor runs upwind of the release, hot to cold.",
      why: "Decon is set upwind and uphill of the release so the crew working the line is not in the plume. The flag decides the direction of every zone.",
    },
    {
      id: "zones", kind: "sequence",
      targets: ["zone-hot", "zone-warm", "zone-cold"],
      itemNames: { "zone-hot": "hot zone line", "zone-warm": "warm zone line", "zone-cold": "cold zone line" },
      title: "Establish the zones",
      cue: "Set the hot zone boundary, then the warm zone, then the cold zone — in that order, upwind.",
      why: "Hot first because it bounds the hazard; warm is the corridor; cold is where clean people stand. Setting cold first puts the safe area before anyone knows where the danger ends.",
      outOfOrderNote: "Hot, then warm, then cold — the boundaries are set from the hazard outward.",
    },
    {
      id: "corridor", kind: "sequence",
      targets: ["pool-gross", "pool-technical", "pool-rinse"],
      itemNames: { "pool-gross": "gross decon pool", "pool-technical": "technical wash pool", "pool-rinse": "rinse pool" },
      title: "Lay out the corridor",
      cue: "Gross decon pool at the hot line, technical wash next, rinse last, walking toward cold.",
      why: "Each pool takes off what the last left. Gross removes the bulk, technical scrubs the suit, rinse clears the soap — reversed, the responder arrives at cold still carrying product.",
      outOfOrderNote: "Pools go in the order the responder walks them — gross, technical, rinse.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["decon-suit", "decon-gloves", "decon-scba"],
      itemNames: { "decon-suit": "splash suit", "decon-gloves": "outer gloves", "decon-scba": "SCBA" },
      title: "Suit the decon crew",
      cue: "Splash suit, outer gloves and SCBA on the crew working the line.",
      why: "The decon crew is inside the warm zone. Everything they wash off a responder is in the air and on the ground around them; they are protected to the same level, minus one, as the entry team.",
    },
    {
      id: "berm", kind: "drag", target: "berm-dam",
      title: "Berm the drain",
      cue: "Carry the drain dam from the truck and seat it over the storm drain below the corridor.",
      why: "Runoff is the product in water. The drain is bermed before the first litre is sprayed, and the pool liners drain to the collection tank.",
      drag: { to: "drain-socket", radius: 0.4, missNote: "Not over the grate — seat the dam square on the drain." },
    },
    {
      id: "water", kind: "turn", target: "hydrant-valve",
      title: "Charge the decon line",
      cue: "Open the hydrant valve to charge the low-pressure wash line.",
      why: "Low pressure, high volume: a wash that rinses without driving product through the suit fabric. The line charges once there is somewhere for the water to go.",
      turn: { turns: 1, axis: "y", label: "HYDRANT" },
    },
    {
      id: "wash", kind: "track", target: "wash-wand", seconds: 7,
      title: "Gross-decon the responder",
      cue: "Hold a steady, low-pressure wash from the top down — head, shoulders, torso, legs, boots.",
      why: "Top down, so what runs off runs off clean skin of the suit below. Steady pressure: enough to move product, not enough to drive it into seams.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.5, drift: 0.12, label: "WASH", readout: (v) => (v < 0.4 ? "too light" : v > 0.6 ? "too hard" : "steady") },
      holdBreakNote: "Wash dropped out of the band — product is being left or driven in. Bring it back and hold.",
    },
    {
      id: "doff", kind: "sequence",
      targets: ["doff-boots", "doff-suit", "doff-scba"],
      itemNames: { "doff-boots": "outer boots and gloves", "doff-suit": "suit", "doff-scba": "SCBA and mask" },
      title: "Doff in order",
      cue: "Outer boots and gloves off first, then the suit peeled away from the body, and the SCBA and mask last — at the cold line.",
      why: "The mask stays on until the suit is off because the suit's outside is still the release. Air on the face comes last, in clean air.",
      outOfOrderNote: "Boots and gloves, then suit, then the mask last — the face is protected until everything contaminated is off.",
    },
    {
      id: "medical", kind: "gauge", target: "vitals-monitor",
      title: "Medical monitoring",
      cue: "Take the responder's post-entry vitals and commit inside the rehab criteria.",
      why: "Heat, exertion and the product all show in the numbers. A responder is not released from decon until medical says the vitals are inside criteria.",
      gauge: { label: "HEART RATE", speed: 0.75, green: [0.4, 0.58], readout: (t) => `${Math.round(70 + t * 90)} bpm`, missNote: "Outside rehab criteria — the responder stays in rehab and is re-checked." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["liner-tear"],
      itemNames: { "liner-tear": "torn pool liner" },
      itemNotes: { "liner-tear": "The technical pool liner is torn at the corner and wash water is running under it toward the drain." },
      title: "Walk the corridor for leaks",
      cue: "Check every pool and the berm, and click where containment failed.",
      why: "A corridor that looks right can still be leaking. The walk-down is what proves not a litre left the line.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, DL_ACCENT);
    box(g, 5.6, 0.1, 5.0, 0, 0.05, 0, 0x4d5157, { rough: 0.95 });

    // Release on the far left: a leaking drum, vapour. Corridor runs left → right (hot → cold).
    const drum = group(g, -2.4, 0.1, -1.6, 0.3);
    cyl(drum, 0.22, 0.22, 0.7, 0, 0.35, 0, 0xe8b02e, { rough: 0.6, metal: 0.3, seg: 18 });
    const vapour = particles(drum, 60, 0xd6f0a0, { size: 0.04, life: 1.4, additive: false, opacity: 0.35 });
    holoTag(drum, "RELEASE — corrosive", 0, 0.9, 0, { css: "#d2312b", w: 0.36 });
    // Zone tapes: three lines across the pad, laid when their step completes.
    const zoneLines = {};
    for (const [id, x, css, label] of [["zone-hot", -1.5, "#d2312b", "HOT"], ["zone-warm", -0.2, "#f2c14b", "WARM"], ["zone-cold", 1.4, "#59c97b", "COLD"]]) {
      const z = group(g, x, 0.1, 0);
      for (const zz of [-2.2, 2.2]) cone(z, 0, zz, { color: parseInt(css.slice(1), 16) });
      const tape = box(z, 0.02, 0.01, 4.4, 0, 0.6, 0, parseInt(css.slice(1), 16), { emissive: parseInt(css.slice(1), 16), ei: 0.8, rough: 0.5, cast: false });
      tape.visible = false; zoneLines[id] = tape;
      holoTag(z, label, 0, 0.9, -2.2, { css, w: 0.16 });
      reg(hits, z, id);
    }
    // The shortcut path: a gap between hot and cold with no corridor — hazard.
    const shortcut = box(g, 2.6, 0.01, 0.5, 0, 0.11, 2.0, 0xd2312b, { opacity: 0.25, transparent: true, rough: 0.6, cast: false });
    holoTag(g, "straight to cold?", 0, 0.4, 2.0, { css: "#d2312b", w: 0.3 });
    reg(hits, shortcut, "shortcut-hot");
    // Pools in the warm zone.
    const pools = {};
    for (const [id, x, label] of [["pool-gross", -0.9, "GROSS"], ["pool-technical", -0.2, "TECHNICAL"], ["pool-rinse", 0.5, "RINSE"]]) {
      const p = group(g, x, 0.1, -0.3);
      box(p, 0.6, 0.12, 0.9, 0, 0.06, 0, 0x2f6f8c, { rough: 0.7 });
      const water = slab(p, 0.52, 0.02, 0.82, 0, 0.12, 0, 0x6fb4d8, { rough: 0.15, metal: 0.2, opacity: 0.6, transparent: true, cast: false });
      water.visible = false; pools[id] = water;
      holoTag(p, label, 0, 0.3, 0.5, { css: "#f2c14b", w: 0.22 });
      reg(hits, p, id);
    }
    const tear = box(g, 0.1, 0.13, 0.1, 0.1, 0.16, 0.15, 0x1b1e22, { rough: 0.9 });
    reg(hits, tear, "liner-tear");
    // Storm drain below the corridor with an invisible socket; the dam on the truck.
    const drain = group(g, -0.3, 0.1, 1.2);
    box(drain, 0.5, 0.02, 0.5, 0, 0.005, 0, 0x2b2f34, { rough: 0.7, metal: 0.4 });
    for (let i = -2; i <= 2; i++) box(drain, 0.44, 0.012, 0.03, 0, 0.018, i * 0.09, 0x4a4e52, { rough: 0.6, metal: 0.4 });
    const drainSocket = box(drain, 0.5, 0.02, 0.5, 0, 0.03, 0, 0xffffff, { rough: 0.5 });
    drainSocket.visible = false; hits["drain-socket"] = drainSocket;
    const runoff = slab(g, 0.3, 0.008, 1.2, -0.3, 0.104, 0.6, 0x6fb4d8, { rough: 0.2, opacity: 0.5, transparent: true, cast: false });
    runoff.visible = false;
    reg(hits, runoff, "runoff-drain");

    // Wind flag, IAP board, hydrant, medical.
    const flag = group(g, 2.2, 0.1, -1.8);
    cyl(flag, 0.02, 0.02, 2.2, 0, 1.1, 0, CITY.steel, { rough: 0.45, metal: 0.7, seg: 10 });
    const cloth = box(flag, 0.5, 0.25, 0.01, 0.25, 2.0, 0, 0xe4622a, { rough: 0.8 });
    holoTag(flag, "wind: from the east", 0, 1.6, 0.05, { css: "#f2c14b", w: 0.34 });
    reg(hits, flag, "wind-flag");
    const board = group(g, 2.2, 0, 1.6, -0.9);
    holoPanel(board, 0.9, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#1a1608"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#f2c14b"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("INCIDENT ACTION PLAN — DECON GROUP", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fff5d6";
      ["Product: corrosive liquid, water-soluble", "Method: wet decon, 3 pools, low pressure", "Zones: upwind, hot → warm → cold",
       "Crew PPE: splash suit, gloves, SCBA", "Doff: boots/gloves → suit → SCBA last", "Runoff: berm drain, collect to tank"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { accent: DL_ACCENT });
    reg(hits, board, "iap-board");
    const hydrant = group(g, 1.8, 0.1, 0.6);
    cyl(hydrant, 0.1, 0.12, 0.7, 0, 0.35, 0, 0xd2312b, { rough: 0.6, metal: 0.3, seg: 16 });
    const hv = valveWheel(hydrant, 0, 0.8, 0, { color: 0xd2312b, body: 0x8a1f1f, r: 0.09 });
    reg(hits, hv, "hydrant-valve");
    hose(g, [[1.7, 0.4, 0.6], [1.0, 0.15, 0.3], [-0.6, 0.15, 0.4], [-1.0, 0.5, 0.1]], 0.025, 0xe8b02e, { steps: 22 });
    const wand = group(g, -1.0, 0.6, 0.1, 0.4);
    cyl(wand, 0.015, 0.015, 0.5, 0, 0, -0.25, CITY.steel, { rough: 0.3, metal: 0.8, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(wand, "wash wand", 0, 0.18, 0, { css: "#f2c14b", w: 0.22 });
    reg(hits, wand, "wash-wand");
    const spray = particles(g, 70, 0x6fb4d8, { size: 0.02, life: 0.45, additive: false, opacity: 0.7 });
    // Responder in the gross pool; decon crew member; medical station.
    const responder = standingFigure(g, -0.81, -0.79, { ry: 1.4, cloth: 0xe8b02e });
    holoTag(responder, "entry team — contaminated", 0, 1.9, 0, { css: "#d2312b", w: 0.42 });
    const crew = standingFigure(g, -0.6, 0.9, { ry: -0.4, cloth: 0x37505f });
    const ppeKit = group(g, 0.4, 0.1, 1.8, 0.3);
    box(ppeKit, 0.9, 0.5, 0.5, 0, 0.25, 0, 0x2b2f34, { rough: 0.6 });
    for (const [id, dx, color, label] of [["decon-suit", -0.28, 0xe8b02e, "SUIT"], ["decon-gloves", 0, 0x2f7d4a, "GLOVES"], ["decon-scba", 0.28, 0xb9bec4, "SCBA"]]) {
      const it = group(ppeKit, dx, 0.55, 0);
      box(it, 0.2, 0.12, 0.2, 0, 0, 0, color, { rough: 0.6 });
      decal(it, 0.16, 0.05, 0, 0.061, 0, signFace(label, { bg: "#1b1e22", accent: "#f2c14b", scale: 0.55 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const bareHands = box(crew, 0.2, 0.2, 0.2, 0.25, 1.0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(crew, "crew — no gloves", 0.3, 1.3, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, bareHands, "bare-hands-rinse");
    // Doffing stations at the cold line.
    for (const [id, z, label] of [["doff-boots", -1.4, "1 · BOOTS/GLOVES"], ["doff-suit", -0.6, "2 · SUIT"], ["doff-scba", 0.2, "3 · SCBA"]]) {
      const d = group(g, 1.2, 0.1, z);
      box(d, 0.4, 0.04, 0.4, 0, 0.02, 0, 0x59c97b, { rough: 0.7, opacity: 0.6, transparent: true });
      holoTag(d, label, 0, 0.3, 0, { css: "#59c97b", w: 0.36 });
      reg(hits, d, id);
    }
    const maskOff = box(g, 0.3, 0.3, 0.3, 0.5, 1.6, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "mask off here?", 0.5, 1.9, -0.3, { css: "#d2312b", w: 0.28 });
    reg(hits, maskOff, "mask-off-warm");
    const vitals = instrument(g, 2.0, 0.6, -0.6, { ry: -0.6, idle: "-- bpm", color: 0xf2c14b, w: 0.13, d: 0.2 });
    box(g, 0.5, 0.5, 0.4, 2.0, 0.35, -0.6, 0xe8eef2, { rough: 0.6 });
    holoTag(vitals, "medical monitoring", 0, 0.16, 0, { css: "#f2c14b", w: 0.34 });
    reg(hits, vitals, "vitals-monitor");
    const dam = group(g, 1.9, 0.1, 1.7);
    box(dam, 0.55, 0.06, 0.55, 0, 0.03, 0, 0x2f7d4a, { rough: 0.85 });
    holoTag(dam, "drain dam", 0, 0.2, 0, { css: "#f2c14b", w: 0.22 });
    reg(hits, dam, "berm-dam");

    let charged = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 1.0, -0.3),
      onStep(step) { if (step.id === "wash") runoff.visible = true; },
      onStepComplete(step) {
        if (step.id === "zones") for (const t of Object.values(zoneLines)) t.visible = true;
        if (step.id === "corridor") for (const w of Object.values(pools)) w.visible = true;
        if (step.id === "berm") { dam.parent.remove(dam); drain.add(dam); dam.position.set(0, 0.03, 0); dam.rotation.set(0, 0, 0); runoff.visible = false; }
        if (step.id === "water") charged = true;
        if (step.id === "wash") { responder.position.set(-0.2, 0, -0.3); }
        if (step.id === "doff") { responder.position.set(1.4, 0, 0.2); }
        if (step.id === "walk") tear.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        vapour.visible = true; vapour.userData.step(dt, new THREE.Vector3(0, 0.7, 0), 0.3, 0.3, 0.2);
        cloth.rotation.y = Math.sin(t * 2) * 0.15;
        if (session?.turn && step?.id === "water") hv.rotation.y = session.turn.amount * Math.PI * 2;
        if (step?.id === "wash" && session.holding && charged) { spray.visible = true; spray.userData.step(dt, new THREE.Vector3(-0.85, 1.6 - session.track.inBand / 7 * 1.3, -0.25), 0.15, 1.2, -3); }
        else if (spray.visible) spray.visible = false;
        for (const id of Object.keys(zoneLines)) if (step?.id === "zones" && !session.sequence.includes(id)) zoneLines[id].visible = false;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "medical") repaint(vitals.userData.screen, signFace(`${Math.round(70 + gg.t * 90)} bpm`, { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#ffe9b0", scale: 0.62 }));
      },
    };
  },
};
