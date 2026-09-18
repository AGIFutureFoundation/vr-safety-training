import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, cone, instrument, standingFigure, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Container Lashing VR — Maritime & Ports, station two.
// Securing a tier of containers on deck before sailing: twist-locks proven
// locked, lashing rods and turnbuckles set in the pattern the ship's cargo
// securing manual calls for, a lashing bridge worked with fall protection,
// and the crane held off the bay until the lashers are clear. The container
// that slides off a ship at sea is the one that was never locked.

const CL_ACCENT = 0x4f9dde;

export const SIM_CONTAINER_LASHING = {
  id: "container-lashing",
  index: "27",
  domain: "Maritime",
  trade: "Longshore worker — lasher",
  category: "Maritime & Ports",
  weather: "wind",
  certification: "ILWU — OSHA 29 CFR 1918 (longshoring) marine terminal safety; ship's Cargo Securing Manual (IMO CSS Code) lashing pattern; fall protection on lashing bridges",
  name: "Container Lashing",
  title: simTitle("Container Lashing"),
  tagline: "Deck stow securing: crane held off, twist-locks proven, rods and turnbuckles to the pattern, fall protection on the bridge, torque checked",
  accent: CL_ACCENT,
  accentCss: "#4f9dde",
  parSeconds: 240,
  footprint: 2.4,
  badge: { id: "stow-secured", name: "Stow Secured", note: "Every twist-lock proven, every rod to the pattern, the bridge worked tied off, the crane held until clear" },

  game: system({
    name: "Stow Authority",
    currency: "LASH",
    ranks: ["Lasher", "Lead Lasher", "Hatch Boss", "Walking Boss", "Stow Authority Certified"],
    badges: [
      { id: "locks-proven", name: "Locks Proven", note: "Every twist-lock checked before a rod went on", test: AWARD.stepClean("locks") },
      { id: "clear-of-crane", name: "Clear of the Crane", note: "Never under a suspended load, never untied on the bridge", test: AWARD.safe },
      { id: "torque-true", name: "Torque True", note: "Turnbuckles inside the manual's tension", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-bay", name: "Clean Bay", note: "No corrections anywhere in the bay", test: AWARD.clean },
      { id: "rod-steady", name: "Rod Steady", note: "Held the rod seating the full count", test: AWARD.unbroken },
      { id: "sailing-time", name: "Sailing Time", note: "Bay secured inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-load": "You walked under the spreader with a box on it. Nothing goes under a suspended container — a twist-lock that let go on the last lift is the one you find out about from underneath.",
    "untied-bridge": "You went onto the lashing bridge without clipping in. It is a narrow steel walkway three tiers up over open deck; the harness is worn, and it is clipped, or the bridge is not worked.",
    "hand-on-cone": "You put your hand on a twist-lock while the box is still coming down. Fingers between a 30-tonne container and its corner casting are gone before you feel the pinch.",
    "bent-rod": "You went to fit a lashing rod with a bent shank. A rod that is not straight does not seat in the casting and does not take the load the pattern assumes — it goes to the reject rack, not on the stack.",
  },

  lateNotes: {
    "turnbuckle-a": "Rods first — a turnbuckle tightened on a rod that is not seated pulls the rod out of the casting.",
    "torque-gauge": "Nothing to check until the pattern is on and the turnbuckles are hand-tight.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "bay-plan",
      title: "Read the bay plan and securing pattern",
      cue: "Check the tier heights, the weights and the rod pattern the Cargo Securing Manual calls for on this bay.",
      why: "The pattern depends on the stack: how many tiers, how heavy, where on deck. The manual decides which castings get rods — not whichever rods are closest.",
    },
    {
      id: "crane-hold", kind: "select", target: "crane-radio",
      title: "Hold the crane off the bay",
      cue: "Radio the crane: lashers entering the bay, hold all lifts until the all-clear.",
      why: "The crane and the lashers never share a bay. The hold goes on the radio before the first lasher steps onto the deck, and comes off from the same radio when the last one is out.",
    },
    {
      id: "harness", kind: "sequence", anyOrder: true,
      targets: ["harness-on", "lanyard-clip"],
      itemNames: { "harness-on": "harness", "lanyard-clip": "lanyard clipped to the bridge line" },
      title: "Harness on, clipped to the bridge line",
      cue: "Harness worn and the lanyard clipped before a foot goes on the lashing bridge.",
      why: "The bridge is the workplace three tiers up. Clipped in, a slip is a scare; unclipped, it is a fall onto steel or into the bay.",
    },
    {
      id: "locks", kind: "sequence", anyOrder: true,
      targets: ["lock-a", "lock-b", "lock-c", "lock-d"],
      itemNames: { "lock-a": "fore-port lock", "lock-b": "fore-starboard lock", "lock-c": "aft-port lock", "lock-d": "aft-starboard lock" },
      title: "Prove every twist-lock",
      cue: "Check each twist-lock's handle is in the locked position — all four corners, every tier.",
      why: "A twist-lock in the unlocked position looks exactly like a locked one from the bridge. Four corners, by hand, is the only proof — and the reason the lashers are here at all.",
    },
    {
      id: "rods", kind: "sequence",
      targets: ["rod-port", "rod-starboard"],
      itemNames: { "rod-port": "port lashing rod", "rod-starboard": "starboard lashing rod" },
      title: "Fit the lashing rods to the pattern",
      cue: "Hook the port rod into the casting, then the starboard rod, crossing as the pattern shows.",
      why: "Rods take the racking load when the ship rolls. Crossed, port and starboard, they hold the stack against both directions; one side alone holds against one.",
      outOfOrderNote: "Port then starboard — the pattern is worked one side, then crossed.",
    },
    {
      id: "seat", kind: "hold", target: "rod-seat", seconds: 4,
      title: "Seat the rod in the casting",
      cue: "Hold the rod head in the corner casting until it drops fully home.",
      why: "A rod that is hooked but not seated pulls out on the first roll. It is held in until it seats — you feel it drop.",
      holdBreakNote: "Let go before it seated — the rod head is sitting on the lip. Hold it until it drops home.",
    },
    {
      id: "turnbuckles", kind: "sequence",
      targets: ["turnbuckle-a", "turnbuckle-b"],
      itemNames: { "turnbuckle-a": "port turnbuckle", "turnbuckle-b": "starboard turnbuckle" },
      title: "Hand-tighten the turnbuckles",
      cue: "Take up the slack on each turnbuckle by hand, port then starboard, evenly.",
      why: "Even take-up on both sides keeps the stack square. One side cranked tight before the other pulls the stack over toward it.",
      outOfOrderNote: "Port then starboard, evenly — one side over-tight pulls the stack.",
    },
    {
      id: "torque", kind: "gauge", target: "torque-gauge",
      title: "Set the turnbuckle tension",
      cue: "Tension each turnbuckle to the manual's figure and commit inside the band.",
      why: "Under-tensioned lashings go slack on the first roll; over-tensioned ones pre-load the castings. The manual's figure is the figure.",
      gauge: { label: "TENSION", speed: 0.75, green: [0.45, 0.6], readout: (t) => `${Math.round(10 + t * 40)} kN`, missNote: "Off the manual's tension — reset and tension it to the figure." },
    },
    {
      id: "lock-turnbuckle", kind: "turn", target: "lock-nut",
      title: "Lock the turnbuckles",
      cue: "Run the lock nut down against the body so the tension cannot back off.",
      why: "A turnbuckle without its lock nut works loose with every roll. The nut is what keeps the tension you just set.",
      turn: { turns: 0.75, axis: "y", label: "LOCK NUT" },
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["unlocked-lock"],
      itemNames: { "unlocked-lock": "twist-lock left unlocked on the upper tier" },
      itemNotes: { "unlocked-lock": "The aft-starboard lock on the upper tier is still in the unlocked position — its handle was never thrown. That box would have gone over at sea." },
      title: "Walk the bay before the all-clear",
      cue: "Check every lock and lashing on the way out and click what was missed.",
      why: "The walk-out is the last time anyone sees this bay before the ship sails. What you do not catch here, the sea does.",
    },
    {
      id: "all-clear", kind: "select", target: "crane-radio-clear",
      title: "Give the crane the all-clear",
      cue: "Radio the crane: lashers out of the bay, lifts may resume.",
      why: "The hold comes off from the same radio it went on, by the person who put it on, when every lasher is out. Never assumed, never relayed.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, CL_ACCENT);
    // Deck, hatch coaming, a two-tier stack and the lashing bridge alongside.
    box(g, 5.6, 0.12, 5.0, 0, 0.06, 0, 0x5c6a75, { rough: 0.85, metal: 0.4 });
    const stack = group(g, 0, 0.12, -0.9);
    const colours = [0x8a3a2f, 0x2f6f8c];
    for (let tier = 0; tier < 2; tier++) box(stack, 2.4, 1.0, 1.0, 0, 0.5 + tier * 1.02, 0, colours[tier], { rough: 0.7, metal: 0.3 });
    // Corner castings with twist-locks between tiers; the aft-starboard upper one is unlocked.
    const lockSpecs = [["lock-a", -1.15, -0.45], ["lock-b", 1.15, -0.45], ["lock-c", -1.15, 0.45], ["lock-d", 1.15, 0.45]];
    const lockHandles = {};
    for (const [id, x, z] of lockSpecs) {
      const l = group(stack, x, 1.01, z);
      box(l, 0.16, 0.14, 0.16, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.6 });
      const handle = box(l, 0.12, 0.02, 0.02, 0.06, -0.02, 0.1, 0xe8b02e, { rough: 0.5 });
      lockHandles[id] = handle;
      reg(hits, l, id);
    }
    const unlocked = group(stack, 1.15, 2.03, 0.45);
    box(unlocked, 0.16, 0.14, 0.16, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.6 });
    box(unlocked, 0.02, 0.02, 0.12, 0.09, -0.02, 0.06, 0xd2312b, { rough: 0.5 });
    reg(hits, unlocked, "unlocked-lock");
    const coneHazard = box(stack, 0.3, 0.2, 0.3, 0, 2.15, -0.45, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(stack, "hand on the cone?", 0, 2.4, -0.45, { css: "#d2312b", w: 0.3 });
    reg(hits, coneHazard, "hand-on-cone");
    // Lashing rods and turnbuckles on the near face.
    const rodFaces = {};
    for (const [id, x, dir] of [["rod-port", -0.9, 1], ["rod-starboard", 0.9, -1]]) {
      const r = group(stack, x, 0.9, 0.52);
      const rod = cyl(r, 0.02, 0.02, 1.4, 0, 0, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
      rod.rotation.z = dir * 0.55; rod.visible = false; rodFaces[id] = rod;
      const hook = box(r, 0.1, 0.1, 0.06, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.6 });
      reg(hits, r, id);
    }
    const seat = box(stack, 0.2, 0.2, 0.1, -0.9, 1.05, 0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(stack, "casting — seat the rod", -0.9, 1.25, 0.6, { css: "#4f9dde", w: 0.34 });
    reg(hits, seat, "rod-seat");
    for (const [id, x] of [["turnbuckle-a", -0.55], ["turnbuckle-b", 0.55]]) {
      const tb = group(stack, x, 0.35, 0.55);
      cyl(tb, 0.035, 0.035, 0.3, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.6, seg: 12 }).rotation.z = 0.3;
      reg(hits, tb, id);
    }
    const lockNut = group(stack, -0.55, 0.2, 0.58);
    cyl(lockNut, 0.04, 0.04, 0.03, 0, 0, 0, 0xc9a227, { rough: 0.4, metal: 0.7, seg: 8 });
    reg(hits, lockNut, "lock-nut");
    const torque = instrument(g, 0.9, 0.62, 0.6, { ry: -0.4, idle: "-- kN", color: 0x4f9dde, w: 0.12, d: 0.19 });
    box(g, 0.4, 0.5, 0.3, 0.9, 0.37, 0.6, 0x2b2f34, { rough: 0.6 });
    holoTag(torque, "tension gauge", 0, 0.16, 0, { css: "#4f9dde", w: 0.28 });
    reg(hits, torque, "torque-gauge");
    // Lashing bridge: raised walkway with a lifeline; the untied entry is the hazard.
    const bridge = group(g, 0, 0.12, 0.9);
    box(bridge, 3.0, 0.06, 0.5, 0, 1.2, 0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    for (const sx of [-1.4, 1.4]) cyl(bridge, 0.03, 0.03, 1.2, sx, 0.6, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 10 });
    for (const sx of [-1.4, 0, 1.4]) cyl(bridge, 0.015, 0.015, 1.0, sx, 1.7, -0.22, 0xe8b02e, { rough: 0.5, seg: 8 });
    const lifeline = cyl(bridge, 0.008, 0.008, 3.0, 0, 2.1, -0.22, 0xe8b02e, { rough: 0.5, seg: 8 });
    lifeline.rotation.z = Math.PI / 2;
    holoTag(bridge, "lashing bridge — clip in", 0, 2.3, -0.2, { css: "#4f9dde", w: 0.4 });
    reg(hits, lifeline, "lanyard-clip");
    const ladderTop = box(bridge, 0.5, 0.3, 0.4, 1.6, 1.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bridge, "straight up, unclipped?", 1.6, 1.55, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, ladderTop, "untied-bridge");
    // Crane spreader overhead with a box on it; the deck under it is the hazard.
    const spreader = group(g, -1.8, 0.12, -0.9);
    box(spreader, 1.2, 0.5, 0.5, 0, 3.2, 0, 0x3a7d44, { rough: 0.7, metal: 0.3 });
    box(spreader, 1.3, 0.1, 0.6, 0, 3.5, 0, 0xe8b02e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-0.5, 0.5]) cyl(spreader, 0.01, 0.01, 2.0, sx, 4.5, 0, 0x22262b, { rough: 0.5, seg: 6 });
    const underLoad = cyl(spreader, 0.6, 0.6, 0.01, 0, 0.005, 0, 0xd2312b, { rough: 0.6, opacity: 0.35, transparent: true, cast: false });
    holoTag(spreader, "SUSPENDED LOAD", 0, 2.8, 0.3, { css: "#d2312b", w: 0.3 });
    reg(hits, underLoad, "under-load");
    // Plan board, radio, PPE, rod rack with a bent rod.
    const board = group(g, 2.2, 0, 1.4, -0.8);
    holoPanel(board, 0.9, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#08131e"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#4f9dde"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("BAY 22 — DECK STOW, SECURING PATTERN", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#dcefff";
      ["Tiers: 2 on deck, 24 t / 18 t", "Twist-locks: all corners, proven by hand", "Rods: crossed, port + starboard, tier 1 castings",
       "Turnbuckles: even, 30 kN, lock nuts down", "Bridge: harness + lanyard on the lifeline", "Crane: HOLD while lashers in bay"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { accent: CL_ACCENT });
    reg(hits, board, "bay-plan");
    const chest = toolChest(g, 1.9, -0.4, { ry: -0.7, color: 0x2f4f6f });
    const radio = instrument(chest, -0.08, 0.79, 0, { ry: 0.3, idle: "CH 4 · HOLD", color: 0x4f9dde, w: 0.1, d: 0.16 });
    holoTag(radio, "crane radio — hold", 0, 0.15, 0, { css: "#4f9dde", w: 0.34 });
    reg(hits, radio, "crane-radio");
    const radioClear = instrument(chest, 0.14, 0.79, 0.08, { ry: 0.1, idle: "CH 4 · CLEAR", color: 0x59c97b, w: 0.1, d: 0.16 });
    holoTag(radioClear, "all-clear", 0, 0.15, 0, { css: "#59c97b", w: 0.2 });
    reg(hits, radioClear, "crane-radio-clear");
    const harness = group(chest, 0, 0.92, -0.15);
    box(harness, 0.22, 0.1, 0.1, 0, 0, 0, 0xe4622a, { rough: 0.8 });
    holoTag(harness, "harness", 0, 0.12, 0, { css: "#4f9dde", w: 0.18 });
    reg(hits, harness, "harness-on");
    const rack = group(g, -2.2, 0.12, 1.2, 0.5);
    box(rack, 0.8, 0.05, 0.3, 0, 0.5, 0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    for (let i = 0; i < 4; i++) cyl(rack, 0.02, 0.02, 1.4, -0.3 + i * 0.2, 1.2, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    const bent = cyl(rack, 0.02, 0.02, 1.4, 0.45, 1.2, 0, 0x8a6a4a, { rough: 0.6, metal: 0.5, seg: 10 });
    bent.rotation.z = 0.12;
    holoTag(rack, "rod rack — one bent", 0, 2.0, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, bent, "bent-rod");
    standingFigure(g, -1.0, 1.6, { ry: 0.6, cloth: 0xe4622a });
    cone(g, 2.4, -1.8); cone(g, -2.4, -1.9);

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -0.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "crane-hold") repaint(radio.userData.screen, signFace("HOLD ✓", { bg: "#0d1c24", accent: "#f2c14b", fg: "#ffe9b0", scale: 0.6 }));
        if (step.id === "locks") for (const h of Object.values(lockHandles)) h.material.color.set(0x59c97b);
        if (step.id === "rods") for (const r of Object.values(rodFaces)) r.visible = true;
        if (step.id === "inspect") unlocked.children[1].rotation.y = Math.PI / 2;
        if (step.id === "all-clear") repaint(radioClear.userData.screen, signFace("CLEAR ✓", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        spreader.position.y = 0.12 + Math.sin(t * 0.8) * 0.05;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "torque") repaint(torque.userData.screen, signFace(`${Math.round(10 + gg.t * 40)} kN`, { bg: "#0d1c24", accent: gg.t >= 0.45 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.62 }));
        if (session?.turn && step?.id === "lock-turnbuckle") lockNut.rotation.y = session.turn.amount * Math.PI * 2;
      },
    };
  },
};
