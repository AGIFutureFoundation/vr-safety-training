import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument, lockTag, valveWheel, rackFrame, rackUnit, reg } from "../citykit.js";
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
  indoor: "plant",
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
      why: "The order names the pump that tripped and the plan names how the flow keeps moving while it is out on the pad. A crew that starts pulling before the bypass plan is set is scheduling an overflow, not preventing one — the catchment above this station does not pause for maintenance.",
    },
    {
      id: "gas", kind: "sequence",
      targets: ["gas-oxygen", "gas-flammable", "gas-h2s"],
      itemNames: { "gas-oxygen": "oxygen", "gas-flammable": "flammable gas", "gas-h2s": "hydrogen sulfide" },
      title: "Test the wet-well atmosphere through the vent",
      cue: "Drop the meter probe through the vent port — oxygen, then flammable, then H2S — before the hatch moves.",
      why: "Testing through the vent with the hatch still closed means the first reading is taken with nobody's face anywhere near the opening it turns out to be bad news at. Oxygen is read first because the flammable sensor's catalytic bead cannot be trusted at all in an oxygen-deficient atmosphere, which a sewer headspace routinely is.",
      outOfOrderNote: "Oxygen, flammable, then H2S — the combustible reading depends on the oxygen reading.",
    },
    {
      id: "lockout", kind: "turn", target: "pump-disconnect",
      title: "Lock out the duty pump",
      cue: "Open the pump's disconnect at the control panel and hang your lock.",
      why: "The level controller does not know a pump is on the chain — it will call for the duty pump the instant the well rises past its set point, exactly as it does on any ordinary night. Your lock is the only thing standing between that call and a four-hundred-kilogram pump trying to start while it hangs in the shaft.",
      turn: { turns: 0.5, axis: "y", label: "DISCONNECT" },
    },
    {
      id: "bypass", kind: "sequence",
      targets: ["bypass-suction", "bypass-discharge", "bypass-start"],
      itemNames: { "bypass-suction": "suction hose in the well", "bypass-discharge": "discharge to the downstream manhole", "bypass-start": "bypass pump start" },
      title: "Set up bypass pumping",
      cue: "Suction into the wet well, discharge to the downstream manhole, then start the bypass pump.",
      why: "Suction and discharge are both connected before the pump ever starts, because starting it with the discharge still open is not a delay, it is a spill onto the ground next to the crew. The bypass exists to take the inflow the duty pump was carrying so the well can be worked on without the level climbing behind everyone's back.",
      outOfOrderNote: "Connect both ends before the bypass starts — a running pump with an open discharge is a spill.",
    },
    {
      id: "bypass-level", kind: "gauge", target: "level-readout",
      title: "Confirm the bypass is holding the level",
      cue: "Watch the well level and commit once the bypass holds it steady below the pump-on set point.",
      why: "A bypass that cannot hold the level down is not a bypass, it is a smaller pump adding a false sense of coverage to the same problem. The level has to sit demonstrably below the set point before anyone commits to pulling the duty pump, because once that pump is on the chain there is nothing else in the well to catch a rise.",
      gauge: { label: "WELL LEVEL", speed: 0.75, green: [0.36, 0.52], readout: (t) => `${(0.4 + t * 2.4).toFixed(2)} m`, missNote: "Level not holding below set point — check the bypass before pulling the pump." },
    },
    {
      id: "hatch", kind: "select", target: "hatch",
      title: "Open the hatch and set the guard",
      cue: "Open the wet-well hatch and drop the safety grate across the opening.",
      why: "The hatch opens onto a four-metre drop into a permit space with hydrogen sulfide sitting in the bottom of it. The grate is what keeps a foot, a tool or a person on the surface once that opening exists, while the pump itself is what actually comes up through it on the rail.",
    },
    {
      id: "lift", kind: "hold", target: "hoist-lever", seconds: 6,
      title: "Lift the pump on the guide rail",
      cue: "Hold the hoist up until the pump clears the hatch and swings to the pad.",
      why: "The pump breaks its mechanical seal off the discharge elbow at the bottom of the rail and then rides that rail all the way to the top, guided the whole way so it never swings free over the shaft. A stalled lift leaves four hundred kilograms hanging half out of a permit space on a chain, which is its own hazard on top of the one already down there.",
      holdBreakNote: "Hoist stopped mid-lift — the pump is hanging in the well. Bring it up the rest of the way.",
    },
    {
      id: "set-down", kind: "drag", target: "pump-body",
      title: "Land the pump on the pad",
      cue: "Swing the pump over and set it down on the wash-down pad before anyone handles it.",
      why: "The pump gets handled on solid ground, never in the air, because a load on a chain can shift the instant a hand touches it and a hoist is not a hand rated to catch anything. Hands go on the pump only after the chain has gone slack and the weight is fully on the pad, not before.",
      drag: { to: "pad-socket", radius: 0.45, missNote: "Not on the pad — land it square before the chain goes slack." },
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["impeller-rag"],
      itemNames: { "impeller-rag": "ragged impeller" },
      itemNotes: { "impeller-rag": "The impeller is bound with rags and wipes — the reason the pump tripped. It gets cleared on the pad, never with the pump on the chain or in the well." },
      title: "Find the fault on the pad",
      cue: "Inspect the pump and click the fault.",
      why: "The whole pull exists to find whatever tripped this pump, and it gets found here, on the pad, in daylight, with the pump locked out and sitting flat on the ground — never on the chain, and never by reaching into the wet well to check it in place, which is exactly the shortcut this pull was designed to avoid.",
    },
    {
      id: "restart", kind: "select", target: "restart-panel",
      title: "Rail the pump back, close the hatch, remove the lock, restart",
      cue: "Pump back on the rail, hatch closed, your lock off, bypass off, duty pump to auto.",
      why: "Everything goes back in reverse order for a reason: the well is closed before the bypass comes off so nothing is exposed while flow transfers back, and the lock comes off last, by the same person who put it on, because that lock was never anyone else's to remove.",
    },
  ],

  interrupts: [
    {
      id: "bypass-died",
      kind: "Bypass lost",
      after: "lift", delay: 3, seconds: 12,
      alert: "The bypass has stopped. The six-inch pump has gone quiet behind you and the duty pump is halfway up the rail on the chain.",
      cue: "Nothing has stopped arriving at this station.",
      target: "bypass-start",
      why: "A lift station is the bottom of a catchment and the catchment does not know you are working. Inflow keeps arriving at whatever the morning is sending — and with the duty pump off its discharge elbow and hanging in the shaft, the bypass is the only thing moving any of it. Bypass pumps lose prime, run their tanks down and trip on their own overload, which is why the bypass is watched rather than started and forgotten. You have minutes at most: the well fills to the overflow and from there it goes to the street and into the lowest basements on the collection system.",
      missNote: "The well came up with the bypass dead and the duty pump in the air. That is a sanitary sewer overflow with your name on the shift log — a reportable discharge, a street closed, and somebody else cleaning out the basements it reached first.",
      wrongNote: "It is the bypass pump. Everything else on this job assumes something is still moving the flow, and right now nothing is.",
    },
    {
      id: "h2s-at-the-opening",
      kind: "Gas at the hatch",
      after: "inspect", delay: 3, seconds: 12,
      alert: "Your personal monitor has gone off. You are crouched over the impeller at knee height and the open hatch is a metre behind you.",
      cue: "Something came out of that well when the pump came out of it.",
      target: "hatch",
      why: "Pulling four hundred kilos of pump out of a wet well displaces its headspace, and the level swinging behind the bypass keeps pushing that headspace out through the only opening it has. Hydrogen sulphide is heavier than air, so what comes over the coaming does not rise and disperse — it runs across the slab at knee and ankle height, which is exactly where you are while you are picking rag off an impeller. The grate keeps a person out of the shaft; it does nothing at all about gas. Close the hatch. You will open it again to rail the pump back, and you will do that standing up and upwind.",
      missNote: "The hatch stayed open and the monitor kept alarming while you worked at knee height in the layer the gas was sitting in. H2S kills the sense of smell before it kills anything else, so the alarm was the only warning available and it was ignored.",
      wrongNote: "The gas is coming out of the well, and the well has one opening. Shut the hatch before you do anything else with that pump.",
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
    // Personal monitor beacon clipped at the coaming — dark until the gas
    // coming out of the opening sets it off.
    const gasAlarm = ball(well, 0.045, 0.55, 0.22, 0.42, 0xd2312b, { emissive: 0xd2312b, ei: 3.0, rough: 0.4 });
    gasAlarm.visible = false;
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
    // Fault lamp on the bypass set: lit when the six-inch has dropped out.
    const bypassFault = ball(bypass, 0.05, -0.2, 0.52, 0.31, 0xd2312b, { emissive: 0xd2312b, ei: 3.0, rough: 0.4 });
    bypassFault.visible = false;
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

    // -------------------------------------------------------- yard dressing
    // A confined-space tripod and retrieval kit staged at the hatch (never
    // rigged — this pull never enters), a spare-parts rack behind the
    // control panel, a wall extinguisher, a lockout signage board, a
    // toolbox, and the yard's own cable tray feeding the panel — the plant
    // yard this pump pull actually happens in.
    const tripod = group(g, -1.3, 0.12, -1.5, 0.5);
    for (const a of [0, 2.1, 4.2]) { const leg = cyl(tripod, 0.02, 0.02, 1.5, 0, 0.75, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 }); leg.rotation.x = 0.35; leg.rotation.y = a; }
    ball(tripod, 0.05, 0, 1.5, 0, 0x22262b, { rough: 0.6 });
    holoTag(tripod, "confined-space tripod — not rigged this pull", 0, 1.75, 0, { css: "#5bb0a8", w: 0.6 });
    const retrievalBag = group(tripod, 0.3, 0.1, -0.3);
    box(retrievalBag, 0.28, 0.2, 0.2, 0, 0.1, 0, 0xe8b02e, { rough: 0.7 });
    holoTag(retrievalBag, "retrieval kit", 0, 0.28, 0, { css: "#5bb0a8", w: 0.28 });

    const partsRack = rackFrame(g, 2.5, 1.6, { ry: -0.6, h: 1.2 });
    for (let i = 0; i < 3; i++) rackUnit(partsRack, 0.25 + i * 0.32, ["IMPELLER KIT", "SEAL KIT", "GASKETS"][i], { css: "#5bb0a8" });

    const ext = group(g, -2.3, 0.12, 2.0, -0.5);
    cyl(ext, 0.06, 0.07, 0.42, 0, 0.35, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.025, 0.025, 0.08, 0, 0.6, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "extinguisher", 0, 0.72, 0, { css: "#d2312b", w: 0.3 });

    const safetyBoard = group(g, 2.6, 0.12, -1.3, -0.4);
    box(safetyBoard, 0.5, 0.4, 0.03, 0, 1.1, 0, 0x1b2026, { rough: 0.6 });
    decal(safetyBoard, 0.44, 0.34, 0, 1.1, 0.018,
      signFace("PERMIT\nSPACE\nNO ENTRY", { bg: "#0d1c24", accent: "#5bb0a8", fg: "#dff4ff", scale: 0.28 }));
    cyl(safetyBoard, 0.02, 0.02, 1.1, 0, 0.55, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });

    const toolbox2 = toolChest(g, -2.6, -0.4, { ry: 0.9, color: 0x5bb0a8 });
    void toolbox2;

    const cableTray = group(g, 2.1, 0.12, 0.8);
    for (let i = 0; i < 5; i++) box(cableTray, 0.5, 0.06, 0.18, 0, 1.9, -1.0 + i * 0.5, 0x3a4550, { rough: 0.55, metal: 0.5 }).rotation.y = Math.PI / 2;
    for (let i = 0; i < 4; i++) cyl(cableTray, 0.012, 0.012, 0.48, 0, 1.9, -0.8 + i * 0.5, 0x1b1e22, { rough: 0.7, seg: 8 });

    const drum = group(g, -0.4, 0.12, 2.3, 0.2);
    cyl(drum, 0.24, 0.24, 0.6, 0, 0.3, 0, 0x2f6f4a, { rough: 0.7, metal: 0.3, seg: 16 });
    cyl(drum, 0.06, 0.06, 0.04, 0, 0.62, 0, 0x22262b, { rough: 0.5, seg: 10 });
    decal(drum, 0.22, 0.14, 0.245, 0.3, 0, signFace("GREASE", { bg: "#0d1c24", accent: "#5bb0a8", scale: 0.45 }));

    for (const [x, z] of [[1.9, -2.1], [-2.0, 0.6]]) cone(g, x, z);
    const spillKit = group(g, -0.9, 0.12, -2.1, 0.3);
    box(spillKit, 0.34, 0.28, 0.28, 0, 0.14, 0, 0xf2ae14, { rough: 0.7 });
    decal(spillKit, 0.3, 0.1, 0, 0.29, 0, signFace("SPILL KIT", { bg: "#22262b", accent: "#5bb0a8", scale: 0.42 }));
    holoTag(spillKit, "spill kit", 0, 0.42, 0, { css: "#5bb0a8", w: 0.24 });

    let lifted = 0;
    let bypassDown = false;
    let gasAlarming = false;
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
      // Both of these are things you can see from where you are standing: the
      // bypass set goes into fault, and the monitor at the coaming lights up.
      onInterrupt(it) {
        if (it.id === "bypass-died") { bypassFault.visible = true; bypassStart.position.y -= 0.02; bypassDown = true; }
        if (it.id === "h2s-at-the-opening") { gasAlarm.visible = true; gasAlarming = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bypass-died") { bypassFault.visible = false; bypassStart.position.y += 0.02; bypassDown = false; }
        if (it.id === "h2s-at-the-opening") {
          gasAlarm.visible = false; gasAlarming = false;
          hatch.position.set(0, 0.03, 0); grate.visible = false;
        }
      },
      animate(t, dt, session) {
        if (bypassDown) bypassFault.material.emissiveIntensity = 1.8 + Math.sin(t * 9) * 1.4;
        if (gasAlarming) gasAlarm.material.emissiveIntensity = 1.8 + Math.sin(t * 13) * 1.4;
        const step = session?.step;
        fumes.visible = true; fumes.userData.step(dt, new THREE.Vector3(0.7, 0.3, -0.4), 0.05, 0.3, 0.15);
        if (step?.id === "lift" && session.holding) { lifted = Math.min(1, session.holdFor / 6); pump.position.y = -1.8 + lifted * 2.3; chain.scale.y = 1 - lifted * 0.6; chain.position.y = 1.2 + lifted * 0.6; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "bypass-level") repaint(level, signFace(`${(0.4 + gg.t * 2.4).toFixed(2)} m`, { bg: "#0d1c24", accent: gg.t >= 0.36 && gg.t <= 0.52 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
      },
    };
  },
};
