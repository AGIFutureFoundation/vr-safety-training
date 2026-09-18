import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument, lockTag, valveWheel, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Lift Station VR — Water & Environmental, station three.
// A wastewater lift station pump pull: the wet well is a permit space with
// hydrogen sulfide in it, the pump is a 400 kg machine on a guide rail, and
// the bypass has to be running before the duty pump comes out or the
// neighbourhood's sewage backs up into basements. Gas first, lockout, bypass,
// then the lift — and nobody goes down the well.

const LS_ACCENT = 0x5bb0a8;

export const SIM_LIFT_STATION = {
  id: "lift-station",
  index: "28",
  domain: "Water",
  trade: "Wastewater collection system operator",
  category: "Water & Environmental",
  weather: "rain",
  certification: "AFSCME / LIUNA — state wastewater collection system operator certification (CWEA Collection System Maintenance Grade II or equivalent); OSHA 29 CFR 1910.146 permit-required confined space; 1910.147 lockout/tagout",
  name: "Lift Station",
  title: simTitle("Lift Station"),
  tagline: "Wet-well pump pull: gas test, lockout, bypass pumping, guide-rail lift, no-entry retrieval, restart and level check",
  accent: LS_ACCENT,
  accentCss: "#5bb0a8",
  parSeconds: 245,
  footprint: 2.4,
  badge: { id: "well-never-entered", name: "Well Never Entered", note: "Gas tested, locked out, bypassed, pump pulled from the top and restarted with the well never entered" },

  game: system({
    name: "Collection Command",
    currency: "LIFT",
    ranks: ["Operator I", "Operator II", "Crew Lead", "Collection Supervisor", "Collection Command Certified"],
    badges: [
      { id: "gas-first", name: "Gas First", note: "Wet well tested before any hatch work, first time", test: AWARD.stepClean("gas") },
      { id: "top-side", name: "Top Side", note: "Never entered the well, never bypassed the lockout", test: AWARD.safe },
      { id: "level-true", name: "Level True", note: "Bypass and restart levels held inside band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "dry-basements", name: "Dry Basements", note: "No corrections through the whole pull", test: AWARD.clean },
      { id: "lift-steady", name: "Lift Steady", note: "Held the hoist through the full lift", test: AWARD.unbroken },
      { id: "shift-pull", name: "Shift Pull", note: "Pump pulled and restarted inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "well-ladder": "You started down the wet-well ladder. This is a permit-required confined space with hydrogen sulfide in it; the pump comes out on the guide rail from the top, and nobody goes down without a permit, an attendant and retrieval — which is not this job.",
    "hatch-no-gas": "You opened the hatch before the gas test. The first breath at the opening is the one the meter is for — H2S at the concentration a wet well can hold takes a person down at the hatch, not at the bottom.",
    "run-no-bypass": "You pulled the duty pump with no bypass running. The inflow does not stop for maintenance; without bypass pumping, the well overflows into the street and the neighbourhood's basements inside the hour.",
    "chain-under-load": "You reached under the pump while it was hanging on the hoist. Four hundred kilograms on a chain is not a thing you put hands under — it is set down on the pad, then handled.",
  },

  lateNotes: {
    "hoist-lever": "The lift comes after lockout and bypass. A pump lifted live is a pump that starts on the chain.",
    "restart-panel": "Not yet — the pump goes back on the rail and the bypass comes off before the restart.",
  },

  steps: [
    {
      id: "workorder", kind: "select", target: "work-order",
      title: "Read the work order and the well data",
      cue: "Check which pump, the wet-well depth, the last gas readings and the bypass plan.",
      why: "The order names the pump and the plan names how the flow keeps moving while it is out. A pull without a bypass plan is an overflow with a schedule.",
    },
    {
      id: "gas", kind: "sequence",
      targets: ["gas-oxygen", "gas-flammable", "gas-h2s"],
      itemNames: { "gas-oxygen": "oxygen", "gas-flammable": "flammable gas", "gas-h2s": "hydrogen sulfide" },
      title: "Test the wet-well atmosphere through the vent",
      cue: "Drop the meter probe through the vent port — oxygen, then flammable, then H2S — before the hatch moves.",
      why: "Through the vent, with the hatch closed, so the first reading is taken with no one's face over the opening. Oxygen first because the flammable sensor cannot be trusted without it.",
      outOfOrderNote: "Oxygen, flammable, then H2S — the combustible reading depends on the oxygen reading.",
    },
    {
      id: "lockout", kind: "turn", target: "pump-disconnect",
      title: "Lock out the duty pump",
      cue: "Open the pump's disconnect at the control panel and hang your lock.",
      why: "The level controller will call the pump the moment the well rises. Your lock is what stops it starting while it is hanging on the chain.",
      turn: { turns: 0.5, axis: "y", label: "DISCONNECT" },
    },
    {
      id: "bypass", kind: "sequence",
      targets: ["bypass-suction", "bypass-discharge", "bypass-start"],
      itemNames: { "bypass-suction": "suction hose in the well", "bypass-discharge": "discharge to the downstream manhole", "bypass-start": "bypass pump start" },
      title: "Set up bypass pumping",
      cue: "Suction into the wet well, discharge to the downstream manhole, then start the bypass pump.",
      why: "Suction and discharge are connected before the pump starts, or the start is a spill. The bypass takes the inflow so the well can be worked without rising.",
      outOfOrderNote: "Connect both ends before the bypass starts — a running pump with an open discharge is a spill.",
    },
    {
      id: "bypass-level", kind: "gauge", target: "level-readout",
      title: "Confirm the bypass is holding the level",
      cue: "Watch the well level and commit once the bypass holds it steady below the pump-on set point.",
      why: "A bypass that cannot keep up is not a bypass. The level has to sit below the set point before the duty pump comes out.",
      gauge: { label: "WELL LEVEL", speed: 0.75, green: [0.36, 0.52], readout: (t) => `${(0.4 + t * 2.4).toFixed(2)} m`, missNote: "Level not holding below set point — check the bypass before pulling the pump." },
    },
    {
      id: "hatch", kind: "select", target: "hatch",
      title: "Open the hatch and set the guard",
      cue: "Open the wet-well hatch and drop the safety grate across the opening.",
      why: "The hatch opens onto a drop with H2S at the bottom. The grate keeps a person on the surface while the pump comes through it.",
    },
    {
      id: "lift", kind: "hold", target: "hoist-lever", seconds: 6,
      title: "Lift the pump on the guide rail",
      cue: "Hold the hoist up until the pump clears the hatch and swings to the pad.",
      why: "The pump breaks its seal off the discharge elbow and rides the rail to the top. A steady lift; a stalled one leaves it hanging half out of the well.",
      holdBreakNote: "Hoist stopped mid-lift — the pump is hanging in the well. Bring it up the rest of the way.",
    },
    {
      id: "set-down", kind: "drag", target: "pump-body",
      title: "Land the pump on the pad",
      cue: "Swing the pump over and set it down on the wash-down pad before anyone handles it.",
      why: "The pump is handled on the ground, not in the air. Hands go on it after the chain goes slack.",
      drag: { to: "pad-socket", radius: 0.45, missNote: "Not on the pad — land it square before the chain goes slack." },
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["impeller-rag"],
      itemNames: { "impeller-rag": "ragged impeller" },
      itemNotes: { "impeller-rag": "The impeller is bound with rags and wipes — the reason the pump tripped. It gets cleared on the pad, never with the pump on the chain or in the well." },
      title: "Find the fault on the pad",
      cue: "Inspect the pump and click the fault.",
      why: "The pull exists to find this. It is found on the pad, in daylight, with the pump locked out and on the ground.",
    },
    {
      id: "restart", kind: "select", target: "restart-panel",
      title: "Rail the pump back, close the hatch, remove the lock, restart",
      cue: "Pump back on the rail, hatch closed, your lock off, bypass off, duty pump to auto.",
      why: "Back in reverse order: the well is closed before the bypass comes off, and the lock comes off last, by the person who put it on.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, LS_ACCENT);
    box(g, 5.6, 0.12, 5.0, 0, 0.06, 0, 0x6b6f66, { rough: 0.95 });
    // Wet well hatch in the slab, with a ladder descending; the vent port beside it.
    const well = group(g, -0.6, 0.12, -0.6);
    const hatch = box(well, 1.0, 0.06, 1.0, 0, 0.03, 0, 0x4a4e52, { rough: 0.7, metal: 0.5 });
    reg(hits, hatch, "hatch");
    const grate = box(well, 1.0, 0.02, 1.0, 0, 0.08, 0, 0x8a949d, { rough: 0.5, metal: 0.6, opacity: 0.7, transparent: true });
    grate.visible = false;
    const shaft = cyl(well, 0.48, 0.48, 2.4, 0, -1.2, 0, 0x161b21, { rough: 0.98, seg: 24, open: true, side: 2, cast: false });
    const ladder = group(well, -0.42, 0, 0);
    for (const sz of [-0.15, 0.15]) cyl(ladder, 0.015, 0.015, 2.2, 0, -1.1, sz, 0xa8b0b8, { rough: 0.5, metal: 0.7, seg: 8 });
    for (let i = 0; i < 6; i++) cyl(ladder, 0.012, 0.012, 0.3, 0, -0.2 - i * 0.35, 0, 0xa8b0b8, { rough: 0.5, metal: 0.7, seg: 8 }).rotation.x = Math.PI / 2;
    reg(hits, ladder, "well-ladder");
    const hatchNoGas = box(well, 1.0, 0.1, 1.0, 0, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hatchNoGas, "hatch-no-gas");
    const vent = cyl(well, 0.06, 0.06, 0.3, 0.7, 0.15, -0.4, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 12 });
    holoTag(well, "vent port — gas test here", 0.7, 0.5, -0.4, { css: "#5bb0a8", w: 0.4 });
    const gasFaces = {};
    for (const [id, dz, label] of [["gas-oxygen", -0.12, "O₂"], ["gas-flammable", 0, "LEL"], ["gas-h2s", 0.12, "H₂S"]]) {
      const pt = group(well, 0.7, 0.34, -0.4 + dz);
      ball(pt, 0.03, 0, 0, 0, 0x5bb0a8, { emissive: 0x5bb0a8, ei: 1.4, rough: 0.4 });
      gasFaces[id] = decal(pt, 0.08, 0.03, 0, 0.06, 0, signFace(label, { bg: "#0d1c24", accent: "#5bb0a8", scale: 0.55 }));
      reg(hits, pt, id);
    }
    // Guide rail, the submersible pump and the hoist davit over the hatch.
    const rail = cyl(well, 0.02, 0.02, 2.6, 0.3, -1.1, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const pump = group(well, 0.3, -1.8, 0);
    cyl(pump, 0.18, 0.2, 0.6, 0, 0.3, 0, 0x2f6f8c, { rough: 0.55, metal: 0.4, seg: 18 });
    cyl(pump, 0.1, 0.1, 0.2, 0, 0.7, 0, 0x22262b, { rough: 0.6, metal: 0.5, seg: 12 });
    const rag = box(pump, 0.2, 0.06, 0.2, 0, -0.02, 0, 0xb8b0a0, { rough: 0.9 });
    rag.visible = false;
    reg(hits, rag, "impeller-rag");
    reg(hits, pump, "pump-body");
    const underPump = box(pump, 0.5, 0.2, 0.5, 0, -0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, underPump, "chain-under-load");
    const davit = group(well, 0, 0, 0.7);
    cyl(davit, 0.04, 0.04, 2.2, 0, 1.1, 0, 0xe8b02e, { rough: 0.5, metal: 0.4, seg: 12 });
    box(davit, 0.06, 0.06, 1.0, 0, 2.2, -0.45, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    const chain = cyl(davit, 0.008, 0.008, 2.0, 0.3, 1.2, -0.7, 0x22262b, { rough: 0.5, seg: 6 });
    const hoist = group(davit, 0.15, 1.2, 0);
    box(hoist, 0.16, 0.24, 0.12, 0, 0, 0, 0xb8402f, { rough: 0.5, metal: 0.3 });
    box(hoist, 0.03, 0.2, 0.03, 0.1, 0.05, 0.05, 0x22262b, { rough: 0.6 });
    holoTag(hoist, "hoist — hold to lift", 0, 0.22, 0, { css: "#5bb0a8", w: 0.32 });
    reg(hits, hoist, "hoist-lever");
    // Wash-down pad with an invisible landing socket.
    const pad = group(g, 1.2, 0.12, -0.6);
    box(pad, 1.2, 0.04, 1.2, 0, 0.02, 0, 0x8a8f8a, { rough: 0.9 });
    const padSocket = box(pad, 0.6, 0.02, 0.6, 0, 0.05, 0, 0xffffff, { rough: 0.5 });
    padSocket.visible = false; hits["pad-socket"] = padSocket;
    holoTag(pad, "wash-down pad", 0, 0.3, 0.7, { css: "#5bb0a8", w: 0.28 });
    // Control panel with the disconnect and the level readout; bypass pump and hoses.
    const panel = group(g, 2.1, 0.12, 0.8, -0.8);
    box(panel, 0.7, 1.4, 0.3, 0, 0.7, 0, 0x6f7a83, { rough: 0.5, metal: 0.5 });
    const disc = group(panel, -0.2, 1.05, 0.16);
    cyl(disc, 0.05, 0.05, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const discHandle = box(disc, 0.02, 0.1, 0.02, 0, 0, 0.02, 0xd2312b, { rough: 0.5 });
    decal(disc, 0.14, 0.03, 0, 0.09, 0.01, signFace("PUMP 1 DISC", { bg: "#22262b", accent: "#5bb0a8", scale: 0.5 }));
    reg(hits, disc, "pump-disconnect");
    const lock = lockTag(disc, 0.06, -0.06, 0.02, { color: 0x5bb0a8 });
    lock.visible = false;
    const level = decal(panel, 0.28, 0.12, 0.12, 1.0, 0.152, signFace("-- m", { bg: "#0d1c24", accent: "#5bb0a8", fg: "#bfeaf7", scale: 0.6 }), { glow: true, ei: 0.7 });
    reg(hits, level, "level-readout");
    const restart = box(panel, 0.14, 0.06, 0.03, 0.12, 0.6, 0.16, 0x59c97b, { rough: 0.5 });
    decal(panel, 0.14, 0.04, 0.12, 0.68, 0.16, signFace("AUTO / RESTART", { bg: "#22262b", accent: "#59c97b", scale: 0.45 }));
    reg(hits, restart, "restart-panel");
    holoPanel(panel, 0.6, 0.42, -0.6, 1.35, 0.1, (ctx, w, h) => {
      ctx.fillStyle = "#08201e"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#5bb0a8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK ORDER — LS-07 PUMP 1", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#dff3f0";
      ["Wet well 4.2 m, H2S last read 18 ppm", "Permit space — NO ENTRY", "Bypass: 6-inch pump to MH-12", "Set point: pump on 2.0 m", "Fault: trip on overload"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: LS_ACCENT });
    const wo = box(panel, 0.6, 0.42, 0.04, -0.6, 1.35, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, wo, "work-order");
    const bypass = group(g, -2.2, 0.12, 1.2, 0.4);
    box(bypass, 0.8, 0.6, 0.6, 0, 0.3, 0, 0xe8b02e, { rough: 0.55, metal: 0.3 });
    const bypassStart = box(bypass, 0.12, 0.06, 0.03, 0.2, 0.5, 0.31, 0x59c97b, { rough: 0.5 });
    reg(hits, bypassStart, "bypass-start");
    holoTag(bypass, "bypass pump", 0, 0.75, 0, { css: "#5bb0a8", w: 0.26 });
    const suction = group(bypass, -0.5, 0.2, 0.2);
    cyl(suction, 0.06, 0.06, 0.2, 0, 0, 0, 0x2b2f34, { rough: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(suction, "suction → well", 0, 0.16, 0, { css: "#5bb0a8", w: 0.26 });
    reg(hits, suction, "bypass-suction");
    const discharge = group(bypass, 0.5, 0.2, 0.2);
    cyl(discharge, 0.06, 0.06, 0.2, 0, 0, 0, 0x2b2f34, { rough: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(discharge, "discharge → MH-12", 0, 0.16, 0, { css: "#5bb0a8", w: 0.3 });
    reg(hits, discharge, "bypass-discharge");
    const noBypass = box(g, 0.4, 0.3, 0.4, -0.3, 0.6, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pull it now?", -0.3, 0.9, -0.6, { css: "#d2312b", w: 0.24 });
    reg(hits, noBypass, "run-no-bypass");
    hose(g, [[-1.9, 0.3, 1.0], [-1.2, 0.2, 0.2], [-0.9, 0.15, -0.4]], 0.05, 0x2b2f34, { steps: 12 });
    const fumes = particles(well, 40, 0xc8e08a, { size: 0.03, life: 1.2, additive: false, opacity: 0.3 });
    cone(g, 2.4, -1.8); barrierPanel(g, 0.4, 1.9, { color: 0xe4622a });

    let lifted = 0;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 0.9, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "gas") for (const f of Object.values(gasFaces)) repaint(f, signFace("✓", { bg: "#0d2b22", accent: "#59c97b", scale: 0.6 }));
        if (step.id === "lockout") { lock.visible = true; discHandle.rotation.z = Math.PI / 2; }
        if (step.id === "hatch") { hatch.position.set(0.7, 0.03, 0.5); grate.visible = true; }
        if (step.id === "set-down") { pump.parent.remove(pump); pad.add(pump); pump.position.set(0, 0.04, 0); pump.rotation.set(0, 0, 0); rag.visible = true; }
        if (step.id === "inspect") rag.visible = false;
        if (step.id === "restart") { lock.visible = false; discHandle.rotation.z = 0; grate.visible = false; hatch.position.set(0, 0.03, 0); repaint(level, signFace("1.6 m · AUTO", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 })); }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        fumes.visible = true; fumes.userData.step(dt, new THREE.Vector3(0.7, 0.3, -0.4), 0.05, 0.3, 0.15);
        if (step?.id === "lift" && session.holding) { lifted = Math.min(1, session.holdFor / 6); pump.position.y = -1.8 + lifted * 2.3; chain.scale.y = 1 - lifted * 0.6; chain.position.y = 1.2 + lifted * 0.6; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "bypass-level") repaint(level, signFace(`${(0.4 + gg.t * 2.4).toFixed(2)} m`, { bg: "#0d1c24", accent: gg.t >= 0.36 && gg.t <= 0.52 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
      },
    };
  },
};
