import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, hose, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, equipmentCabinet,
  cone, barrierPanel, standingFigure, lockTag, valveWheel, pipeRun, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Digester Gas VR — Water & Environmental, station six.
// Changing a flame arrester on the biogas main of an anaerobic digester. The
// gas is sixty per cent methane and carries hydrogen sulphide; the line runs
// at a few inches of water column, so it will not blow the pipe apart, it will
// simply fill the space around you with something that is explosive, toxic and
// heavier than air. Nitrogen purge, gas-free proven, hot work never.

const DG_ACCENT = 0x84cc16;

export const SIM_DIGESTER_GAS = {
  id: "digester-gas",
  index: "53",
  domain: "Wastewater treatment",
  trade: "Wastewater plant operator / pipefitter",
  category: "Water & Environmental",
  weather: "fog",
  certification: "UA / AFSCME — wastewater treatment operator and plant pipefitter; OSHA 29 CFR 1910.146 permit-required confined space; NFPA 820 for the classified area; 1910.147 energy control; NFPA 69 explosion prevention by purging",
  name: "Digester Gas",
  title: simTitle("Digester Gas"),
  tagline: "Flame arrester change on a live biogas main: classified-area control, nitrogen purge, LEL and H2S proven, no hot work, bonded and re-leak-tested",
  accent: DG_ACCENT,
  accentCss: "#84cc16",
  parSeconds: 265,
  footprint: 2.2,
  badge: { id: "gas-free-proven", name: "Gas Free Proven", note: "A biogas main opened only after purge, LEL and H2S were all proven, and closed leak-tight" },

  game: system({
    name: "Digester Authority",
    currency: "SCFM",
    ranks: ["Operator I", "Operator II", "Plant Pipefitter", "Shift Supervisor", "Digester Authority Certified"],
    badges: [
      { id: "purged-first", name: "Purged First", note: "Nitrogen in before the flange came apart, first time", test: AWARD.stepClean("purge") },
      { id: "no-ignition", name: "No Ignition Source", note: "Never brought a spark into the classified area", test: AWARD.safe },
      { id: "read-true", name: "Read True", note: "LEL and H2S both read inside limits", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "leak-tight", name: "Leak Tight", note: "Passed the leak test first time", test: AWARD.stepClean("leak-test") },
      { id: "bond-held", name: "Bond Held", note: "Held the bonding contact the full count", test: AWARD.unbroken },
      { id: "back-on-gas", name: "Back On Gas", note: "Main returned to service inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "phone-out": "You brought a phone into the classified area. Division 1 means an explosive atmosphere is expected here in normal operation — the phone, the torch and the non-rated meter all stay outside the boundary, because the thing that ignites biogas is not a flame, it is any spark at all.",
    "grinder": "You reached for the grinder to free the flange. Hot work on a biogas main is not something you permit carefully — it is something you do not do. The bolts come off cold, with non-sparking tools, or the line gets gas-freed and certified first.",
    "no-scba": "You opened the flange on air alone. Hydrogen sulphide at the concentrations a digester main carries destroys your sense of smell in seconds and drops you in a couple of breaths — the warning you are relying on stops working before the gas does.",
    "vent-downwind": "You set the purge vent at grade downwind of the work. Biogas is heavier than air at these temperatures; vented low it pools around the crew's feet and sits there, which is why the vent goes up and away from anywhere anyone stands.",
  },

  lateNotes: {
    "flange-bolts": "The flange comes apart after the purge is complete and the atmosphere is proven, not before.",
    "n2-valve": "The nitrogen goes in after the main is isolated at both ends.",
  },

  steps: [
    {
      id: "permit", kind: "select", target: "csp-permit",
      title: "Take the confined space and hot work permits",
      cue: "Read the classification, the isolation points, the purge volume and the entry conditions.",
      why: "This is a classified area and the pit around the arrester is a permit space. The permit names the isolation, the purge and the atmospheric limits, and it is signed by someone who is not the person doing the work.",
    },
    {
      id: "boundary", kind: "sequence", anyOrder: true,
      targets: ["area-boundary", "phone-box", "rated-meter"],
      itemNames: { "area-boundary": "classified-area boundary", "phone-box": "phone and torch in the box", "rated-meter": "intrinsically safe meter" },
      title: "Set the boundary and strip the ignition sources",
      cue: "Boundary up, phone and non-rated torch in the box outside it, intrinsically safe meter in hand.",
      why: "Division 1 is not a warning, it is a statement that an explosive atmosphere is expected here. Everything that crosses the boundary is rated for it or it does not cross.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["upstream-valve", "downstream-valve"],
      itemNames: { "upstream-valve": "upstream plug valve", "downstream-valve": "downstream plug valve" },
      title: "Isolate the main both sides",
      cue: "Close upstream first, then downstream, and confirm both are seated.",
      why: "Upstream first, because closing the downstream valve on a live digester backs pressure into the dome. The digester makes gas whether or not you are ready for it and the roof is designed to lift, not to hold.",
    },
    {
      id: "lock", kind: "select", target: "valve-locks",
      title: "Lock both valves and tag them",
      cue: "Chain and lock on each valve, your tag on both.",
      why: "A plug valve that somebody cracks to relieve a header while you have the flange apart fills the pit with methane in under a minute. The chain is what makes that impossible rather than merely unlikely.",
    },
    {
      id: "vent-set", kind: "drag", target: "purge-vent",
      title: "Set the purge vent high and downwind",
      cue: "Carry the vent stack to the mast and get the discharge above head height, away from the crew.",
      why: "What comes out of the purge is the whole point. Up and away means it disperses; at grade it pools in the pit you are about to work in, because biogas at digester temperature is heavier than the air around it.",
      drag: { to: "vent-mast", radius: 0.45, missNote: "Not on the mast — at grade and downwind of the pit is exactly where it must not be." },
    },
    {
      id: "purge", kind: "hold", target: "n2-valve", seconds: 6,
      title: "Purge the section with nitrogen",
      cue: "Open the nitrogen and hold until the purge volume has passed.",
      why: "Nitrogen displaces the methane out through the vent so the section never passes through its explosive range at a concentration that matters. Five volumes is the figure on the permit, and it is held, not estimated.",
      holdBreakNote: "The purge stopped short. A partly purged line is a line still holding gas — start the volume again.",
    },
    {
      id: "lel", kind: "gauge", target: "gas-meter",
      title: "Prove it gas-free — LEL",
      cue: "Sample at the flange and at the bottom of the pit, and commit on the reading.",
      why: "The reading is taken where the gas would be, which is the bottom of the pit, not at head height. Zero per cent LEL at the lip of a pit means nothing about what is standing in it.",
      gauge: { label: "LEL %", speed: 0.75, green: [0.02, 0.14], readout: (t) => `${Math.round(t * 60)} %`, missNote: "Still reading gas — keep purging, and do not put a wrench on that flange." },
    },
    {
      id: "h2s", kind: "gauge", target: "h2s-meter",
      title: "Prove it gas-free — hydrogen sulphide",
      cue: "Second reading, second gas, same places.",
      why: "LEL and H2S are different instruments answering different questions. A line can be below the explosive limit and still carry enough hydrogen sulphide to kill somebody leaning into the pit.",
      gauge: { label: "H2S ppm", speed: 0.75, green: [0.02, 0.13], readout: (t) => `${Math.round(t * 120)} ppm`, missNote: "Hydrogen sulphide still present — respiratory protection stays on and the purge continues." },
    },
    {
      id: "scba", kind: "select", target: "scba-set",
      title: "Supplied air for the flange break",
      cue: "On air for the break itself, however good the readings were.",
      why: "The readings say what was in the line a minute ago. What comes out of a flange as it separates is whatever was trapped behind the gasket, and that is the moment the protection has to already be on.",
    },
    {
      id: "bond", kind: "hold", target: "bonding-cable", seconds: 4,
      title: "Bond across the flange before it opens",
      cue: "Clamp both sides of the joint and hold until the bond reads continuous.",
      why: "Separating two pieces of pipe carrying a flowing gas builds a static charge across the gap. The bond gives that charge somewhere to go other than across the joint as a spark.",
      holdBreakNote: "The bond broke before it read continuous — clamp it again and hold.",
    },
    {
      id: "break-flange", kind: "turn", target: "flange-bolts",
      title: "Break the flange with non-sparking tools",
      cue: "Bronze wrench, crack the bolts opposite each other, and let the joint open slowly.",
      why: "Opposite pairs so the flange comes apart square rather than hinging on one side and springing. Bronze because a dropped steel wrench on a steel flange in a Division 1 area is a spark with an audience.",
      turn: { turns: 1.5, axis: "z", label: "FLANGE" },
    },
    {
      id: "swap", kind: "drag", target: "new-arrester",
      title: "Fit the replacement flame arrester",
      cue: "Old element out, new element in, flow arrow pointing to the digester.",
      why: "A flame arrester only works one way round. Fitted backwards it is a restriction in the line and nothing else, and the next flashback from the flare goes straight into the dome.",
      drag: { to: "arrester-seat", radius: 0.4, missNote: "Not seated, or not the right way round — check the flow arrow against the dome." },
    },
    {
      id: "leak-test", kind: "gauge", target: "manometer",
      title: "Leak-test the joint before gas returns",
      cue: "Pressurise with nitrogen and hold the manometer inside the acceptance band.",
      why: "A few inches of water column will not tear a flange apart, which is exactly why a bad joint on a biogas main leaks quietly for months instead of announcing itself. The test is the only thing that catches it.",
      gauge: { label: "in. W.C.", speed: 0.7, green: [0.46, 0.62], readout: (t) => `${(t * 18).toFixed(1)}`, missNote: "The joint is losing pressure — break it down and re-make it." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["cracked-seal", "corroded-drip"],
      itemNames: { "cracked-seal": "cracked sight-glass seal", "corroded-drip": "corroded drip trap" },
      itemNotes: {
        "cracked-seal": "The sight glass on the condensate leg has a cracked seal. That is a continuous small release of H2S-bearing gas at head height for anybody reading the glass.",
        "corroded-drip": "The drip trap under the main is corroded through at the weld. When it fails, the main loses its water seal and the flare pulls air back down the line.",
      },
      title: "Walk the line before it goes back on gas",
      cue: "Look over the condensate legs, the traps and the supports before the valves come open; click what needs a work order.",
      why: "Biogas lines fail slowly and quietly. Almost everything that gets caught on these lines gets caught by somebody walking them with their eyes open, not by an instrument.",
    },
  ],

  interrupts: [
    {
      id: "dome-rising",
      kind: "Digester pressure",
      after: "purge", delay: 4, seconds: 12,
      alert: "The digester dome indicator is climbing. With the main isolated the gas has nowhere to go and the roof is lifting on its seal.",
      cue: "The digester did not stop making gas because you closed a valve.",
      target: "relief-bypass",
      why: "A digester produces gas continuously. Isolate its outlet and the pressure goes into the dome, which is built to lift and then to relieve through a water seal — messily, into the open, all of it. The bypass to the flare is what keeps production going somewhere safe while the main is down.",
      missNote: "The dome relieved through its seal. That is several hundred cubic metres of methane released at grade over a working plant, an odour complaint the city will hear about, and a roof seal to re-flood before the digester can run again.",
      wrongNote: "It is the relief bypass to the flare. The digester is still making gas and it needs somewhere to send it.",
    },
    {
      id: "wind-shift",
      kind: "Vent downwind of crew",
      after: "lel", delay: 3, seconds: 11,
      alert: "The wind has come round. The purge vent is now discharging straight back over the pit and your gas meter has started ticking up.",
      cue: "Your own vent is feeding the space you are working in.",
      target: "purge-vent",
      why: "A vent is only safe relative to where people are standing and which way the air is moving, and both of those change. When the meter climbs with the purge still running, the first suspect is your own discharge.",
      missNote: "The vent kept discharging over the pit. The readings you took to justify opening that flange were taken before the wind moved, and by the time the flange came apart they described a different pit.",
      wrongNote: "It is the purge vent. Move the discharge before you take another reading or turn another bolt.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, DG_ACCENT);

    // ------------------------------------------------------------ the digester
    // A fat insulated tank with a floating cover, off behind the work so it
    // reads as the thing all this gas is coming from.
    const dig = group(g, -0.2, 0, -3.5);
    cyl(dig, 1.75, 1.75, 2.1, 0, 1.05, 0, 0x7d8a72,
      { rough: 0.9, seg: 32, finish: "concrete", tile: [6, 3] });
    const dome = cyl(dig, 1.78, 1.6, 0.55, 0, 2.35, 0, 0x4b5b46,
      { rough: 0.6, metal: 0.35, seg: 32, finish: "painted", tile: [6, 1] });
    holoTag(dig, "Primary digester — 35 °C", 0, 3.0, 0, { css: "#84cc16", w: 0.44 });
    // Dome pressure indicator: a float on a post that rises when gas backs up.
    const domeFloat = ball(dig, 0.09, 1.1, 2.7, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.8, rough: 0.5 });
    cyl(dig, 0.025, 0.025, 0.9, 1.1, 3.05, 0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 8 });
    holoTag(dig, "Dome level", 1.1, 3.6, 0, { css: "#f2c14b", w: 0.24 });

    // ------------------------------------------------------- the biogas main
    const main = group(g, 0, 0, -0.5);
    pipeRun(main, [[-2.1, 1.05, -1.6], [-1.2, 1.05, -1.0], [-1.2, 1.05, 0.5], [1.5, 1.05, 0.5]], 0.11, 0x6b8f4a,
      { steps: 22, flanges: [[-1.2, 1.05, 0.1], [0.9, 1.05, 0.5]], flangeAxis: "z", finish: "painted" });
    holoTag(main, "Biogas main — 8 in. W.C.", -0.2, 1.4, 0.5, { css: "#84cc16", w: 0.42 });

    // The arrester and its pit: the work itself, set below grade.
    const pit = group(g, 0.25, 0, 0.0);
    box(pit, 1.5, 0.14, 1.2, 0, -0.07, 0, 0x6b7076, { rough: 0.95, finish: "concrete", tile: [2, 2] });
    for (const [w, d, x, z] of [[1.5, 0.12, 0, -0.6], [1.5, 0.12, 0, 0.6], [0.12, 1.2, -0.75, 0], [0.12, 1.2, 0.75, 0]]) {
      box(pit, w, 0.7, d, x, -0.35, z, 0x5a6067, { rough: 0.95, finish: "concrete", tile: [2, 1], cast: false });
    }
    for (const [w, d, x, z] of [[1.7, 0.16, 0, -0.68], [1.7, 0.16, 0, 0.68], [0.16, 1.5, -0.83, 0], [0.16, 1.5, 0.83, 0]]) {
      box(pit, w, 0.14, d, x, 0.07, z, 0x7d838a, { rough: 0.92, finish: "concrete", tile: [2, 1] });
    }
    const arrester = group(pit, 0, 0, 0);
    cyl(arrester, 0.17, 0.17, 0.34, 0, 0.55, 0, 0x8b929a, { rough: 0.5, metal: 0.55, seg: 20, finish: "brushed" });
    for (const dy of [-0.2, 0.2]) cyl(arrester, 0.19, 0.19, 0.04, 0, 0.55 + dy, 0, 0x6d7379, { rough: 0.55, metal: 0.5, seg: 20 });
    holoTag(arrester, "Flame arrester", 0, 0.92, 0, { css: "#84cc16", w: 0.3 });
    const flangeBolts = group(arrester, 0, 0.35, 0.18);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      box(flangeBolts, 0.028, 0.028, 0.05, Math.sin(a) * 0.15, Math.cos(a) * 0.15, 0, 0xd8b23a, { rough: 0.5, metal: 0.7 });
    }
    reg(hits, flangeBolts, "flange-bolts");
    const seat = box(pit, 0.3, 0.05, 0.3, 0, 0.36, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["arrester-seat"] = seat;
    const newArrester = group(g, 1.85, 0, 1.15);
    cyl(newArrester, 0.16, 0.16, 0.3, 0, 0.15, 0, 0xb6c2cc, { rough: 0.35, metal: 0.6, seg: 18, finish: "brushed" });
    decal(newArrester, 0.12, 0.05, 0, 0.3, 0.02, signFace("FLOW →", { bg: "#1b2a12", accent: "#84cc16", scale: 0.5 }), { px: 128 });
    holoTag(newArrester, "New arrester element", 0, 0.46, 0, { css: "#84cc16", w: 0.36 });
    reg(hits, newArrester, "new-arrester");

    // Plug valves either side, with chains to lock them.
    const upstream = valveWheel(main, -1.2, 1.05, -0.5, { r: 0.1, color: 0xd8232a, body: 0x6b8f4a });
    holoTag(main, "Upstream plug valve", -1.2, 1.32, -0.5, { css: "#f0645b", w: 0.36 });
    reg(hits, upstream, "upstream-valve");
    const downstream = valveWheel(main, 1.35, 1.05, 0.5, { r: 0.1, color: 0xd8232a, body: 0x6b8f4a, ry: 1.57 });
    holoTag(main, "Downstream plug valve", 1.35, 1.32, 0.5, { css: "#f0645b", w: 0.4 });
    reg(hits, downstream, "downstream-valve");
    const chains = group(g, 0.1, 0, -0.2);
    for (const [x, z] of [[-1.2, -0.7], [1.35, 0.3]]) {
      const l = lockTag(chains, x, 1.2, z, { color: 0xd8232a });
      void l;
    }
    holoTag(chains, "Valve locks", 0.1, 1.55, -0.2, { css: "#f0645b", w: 0.26 });
    reg(hits, chains, "valve-locks");

    // Relief bypass to the flare — the answer to the dome interruption.
    const bypass = group(g, -2.4, 0, -1.1);
    cyl(bypass, 0.07, 0.07, 1.4, 0, 0.7, 0, 0x6b8f4a, { rough: 0.6, metal: 0.3, seg: 14, finish: "painted" });
    const bypassLever = box(bypass, 0.05, 0.22, 0.05, 0.08, 1.15, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(bypass, "Relief bypass to flare", 0, 1.6, 0, { css: "#f2c14b", w: 0.42 });
    reg(hits, bypass, "relief-bypass");
    // The flare itself, so the bypass goes somewhere the learner can see.
    const flare = group(g, -3.3, 0, -2.4);
    cyl(flare, 0.12, 0.14, 2.6, 0, 1.3, 0, 0x59636d, { rough: 0.7, metal: 0.4, seg: 14, finish: "galvanised" });
    const flareTip = ball(flare, 0.14, 0, 2.7, 0, 0xff8a3c, { emissive: 0xff8a3c, ei: 1.2, rough: 0.5 });
    const flareFlame = particles(flare, 34, 0xffb066, { size: 0.05, life: 0.5 });

    // Nitrogen bottle, purge vent and its mast.
    const n2 = group(g, -1.85, 0, 1.4);
    cyl(n2, 0.12, 0.12, 1.15, 0, 0.58, 0, 0x2f6f8c, { rough: 0.5, metal: 0.45, seg: 18, finish: "galvanised" });
    const n2Valve = valveWheel(n2, 0, 1.22, 0, { r: 0.06, color: 0x4fd1ff, body: 0x2f6f8c });
    holoTag(n2, "Nitrogen purge", 0, 1.5, 0, { css: "#4fd1ff", w: 0.32 });
    reg(hits, n2Valve, "n2-valve");
    const n2Mist = particles(arrester, 26, 0xdfeaf2, { size: 0.02, life: 0.35, additive: false, opacity: 0.35 });

    const vent = group(g, 1.25, 0, 1.7);
    cyl(vent, 0.05, 0.05, 0.7, 0, 0.35, 0, 0xf2a23b, { rough: 0.6, metal: 0.3, seg: 12, finish: "painted" });
    cyl(vent, 0.06, 0.06, 0.2, 0, 0.75, 0, 0xf2a23b, { rough: 0.6, seg: 12 }).rotation.x = 0.5;
    holoTag(vent, "Purge vent stack", 0, 1.0, 0, { css: "#f2a23b", w: 0.34 });
    reg(hits, vent, "purge-vent");
    const ventHome = vent.position.clone();
    const mast = group(g, -0.9, 0, 1.95);
    cyl(mast, 0.045, 0.045, 2.5, 0, 1.25, 0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 12 });
    holoTag(mast, "Vent mast", 0, 2.7, 0, { css: "#8fb3c4", w: 0.24 });
    const mastSeat = box(mast, 0.24, 0.24, 0.24, 0, 2.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["vent-mast"] = mastSeat;

    // -------------------------------------------------- boundary and the traps
    const boundary = group(g, 1.4, 0, -1.3);
    for (let i = 0; i < 3; i++) barrierPanel(boundary, -0.6 + i * 0.6, 0, { color: 0xf2a23b });
    holoTag(boundary, "Class 1 Div 1 boundary", 0, 1.3, 0, { css: "#f2a23b", w: 0.44 });
    reg(hits, boundary, "area-boundary");
    const phoneBox = group(g, 2.25, 0, -1.7);
    box(phoneBox, 0.3, 0.22, 0.24, 0, 0.55, 0, 0x2b3138, { rough: 0.6, finish: "painted", tile: [1, 1] });
    box(phoneBox, 0.32, 0.5, 0.26, 0, 0.25, 0, 0x59636d, { rough: 0.6, metal: 0.3 });
    holoTag(phoneBox, "Ignition-source box", 0, 0.85, 0, { css: "#59636d", w: 0.38 });
    reg(hits, phoneBox, "phone-box");
    const phone = box(g, 0.08, 0.02, 0.15, 0.95, 0.9, -0.85, 0x1b1e22, { rough: 0.35, metal: 0.2 });
    holoTag(g, "Phone — inside the line", 0.95, 1.06, -0.85, { css: "#f0645b", w: 0.4 });
    reg(hits, phone, "phone-out");
    const grinder = group(g, 1.95, 0, 0.55);
    box(grinder, 0.26, 0.13, 0.13, 0, 0.5, 0, 0xd8232a, { rough: 0.5, finish: "painted", tile: [1, 1] });
    cyl(grinder, 0.09, 0.09, 0.012, 0.17, 0.5, 0, 0x8b929a, { rough: 0.4, metal: 0.7, seg: 18 }).rotation.y = Math.PI / 2;
    holoTag(grinder, "Angle grinder", 0, 0.72, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, grinder, "grinder");

    // Instruments, air and tools.
    const chest = toolChest(g, -2.3, 0.35, { ry: 0.6, color: 0x84cc16 });
    const gasMeter = instrument(chest, -0.04, 0.8, 0.02, { ry: 0.3, idle: "-- %", color: 0x84cc16 });
    holoTag(gasMeter, "LEL meter", 0, 0.17, 0, { css: "#84cc16", w: 0.26 });
    reg(hits, gasMeter, "gas-meter");
    const h2sMeter = instrument(g, -1.45, 0.95, 0.75, { ry: -0.4, idle: "-- ppm", color: 0xf2c14b });
    holoTag(h2sMeter, "H2S meter", 0, 0.17, 0, { css: "#f2c14b", w: 0.26 });
    reg(hits, h2sMeter, "h2s-meter");
    const ratedMeter = instrument(g, 2.0, 0.95, -0.95, { ry: -1.0, idle: "IS", color: 0x59c97b });
    holoTag(ratedMeter, "Intrinsically safe", 0, 0.17, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, ratedMeter, "rated-meter");
    const mano = instrument(g, 0.95, 0.95, -0.35, { ry: 0.8, idle: "-- W.C.", color: 0x4fd1ff });
    holoTag(mano, "Manometer", 0, 0.17, 0, { css: "#4fd1ff", w: 0.26 });
    reg(hits, mano, "manometer");

    const scbaRack = group(g, -2.55, 0, 1.05);
    box(scbaRack, 0.06, 1.5, 0.06, 0, 0.75, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const scba = group(scbaRack, 0.16, 0.95, 0.04);
    cyl(scba, 0.075, 0.075, 0.46, 0, 0, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 16, finish: "galvanised" });
    box(scba, 0.22, 0.28, 0.08, 0, -0.05, 0.1, 0x2b3138, { rough: 0.85 });
    holoTag(scbaRack, "Supplied air", 0.16, 1.32, 0.04, { css: "#f2c14b", w: 0.3 });
    reg(hits, scba, "scba-set");
    const bareAir = box(scbaRack, 0.2, 0.14, 0.08, -0.2, 0.62, 0.04, 0x8a8f96, { rough: 0.8 });
    holoTag(scbaRack, "On air alone?", -0.2, 0.8, 0.04, { css: "#f0645b", w: 0.3 });
    reg(hits, bareAir, "no-scba");

    const bond = group(pit, -0.5, 0, 0.35);
    cyl(bond, 0.012, 0.012, 0.7, 0, 0.4, 0, 0x2f7d4f, { rough: 0.7, seg: 8 });
    box(bond, 0.06, 0.05, 0.05, 0, 0.76, 0, 0x2f7d4f, { rough: 0.6, metal: 0.4 });
    holoTag(bond, "Bonding cable", 0, 0.94, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, bond, "bonding-cable");

    // Walk-round finds on the condensate leg.
    const leg = group(g, 1.05, 0, -0.35);
    cyl(leg, 0.06, 0.06, 0.85, 0, 0.42, 0, 0x6b8f4a, { rough: 0.6, metal: 0.3, seg: 12, finish: "painted" });
    const sight = cyl(leg, 0.045, 0.045, 0.14, 0, 0.78, 0, 0xdfe8ee, { rough: 0.15, opacity: 0.55, transparent: true, seg: 14 });
    torus(leg, 0.05, 0.008, 0, 0.85, 0, 0x8a3f33, { rough: 0.85, seg: 6, seg2: 14 }).rotation.x = Math.PI / 2;
    holoTag(leg, "Sight glass", 0, 1.0, 0, { css: "#bfeaf7", w: 0.24 });
    reg(hits, sight, "cracked-seal");
    const drip = group(g, -0.55, 0, 0.72);
    cyl(drip, 0.08, 0.08, 0.22, 0, 0.11, 0, 0x7a5a3a, { rough: 0.95, seg: 14, finish: "rust" });
    holoTag(drip, "Drip trap", 0, 0.34, 0, { css: "#b8794a", w: 0.24 });
    reg(hits, drip, "corroded-drip");
    const ventTrap = box(g, 0.5, 0.05, 0.5, 1.25, 0.03, 1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, ventTrap, "vent-downwind");

    const permit = holoPanel(g, 0.58, 0.42, -2.4, 1.6, -0.15, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#84cc16"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("PERMIT · CSP-2219 / NO HOT WORK", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("BIOGAS MAIN — ARRESTER SWAP", w * 0.06, h * 0.32);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Class 1 Div 1 — IS equipment only", "Isolate upstream first, then downstream",
       "N2 purge: 5 line volumes", "Entry limits: LEL < 5%, H2S < 10 ppm",
       "Supplied air for the flange break", "Leak test 8 in. W.C., 10 min hold"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.46 + i * h * 0.085));
    }, { ry: 0.4 });
    reg(hits, permit, "csp-permit");

    standingFigure(g, 2.6, 1.6, { ry: -2.3, cloth: 0x2b3138, vest: 0x84cc16, helmet: 0xf2f2f2 });
    for (let i = 0; i < 2; i++) cone(g, -1.6 + i * 0.7, 2.2, { color: 0xf2a23b });

    let purging = false, domeUp = 0, ventBad = false;

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "isolate") {
          upstream.userData.wheel.rotation.z += 1.6;
          downstream.userData.wheel.rotation.z += 1.6;
        }
        if (step.id === "vent-set") { vent.position.set(-0.9, 2.05, 1.95); }
        if (step.id === "purge") { purging = true; }
        if (step.id === "swap") {
          newArrester.position.set(0.25, 0.4, 0.0);
          arrester.children[0].material = mat(0xb6c2cc, { rough: 0.35, metal: 0.6 });
        }
        if (step.id === "leak-test") { purging = false; }
        if (step.id === "walk") { drip.children[0].material = mat(0x59c97b, { rough: 0.6 }); }
      },

      // The dome really rises, and the vent really swings back over the pit.
      onInterrupt(it) {
        if (it.id === "dome-rising") { domeUp = 1; dome.position.y += 0.14; domeFloat.position.y += 0.3; }
        if (it.id === "wind-shift") { ventBad = true; vent.position.copy(ventHome); vent.rotation.z = 0.4; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "dome-rising") { domeUp = 0; dome.position.y -= 0.14; domeFloat.position.y -= 0.3; }
        if (it.id === "wind-shift") { ventBad = false; vent.position.set(-0.9, 2.05, 1.95); vent.rotation.z = 0; }
      },

      onHazard(hitId) {
        if (hitId === "grinder" || hitId === "phone-out") flareTip.material.emissiveIntensity = 3.2;
      },

      animate(t, dt, session) {
        // The flare is always lit — it is what the plant does with the gas it
        // is not using, and it is the reason the bypass is a real answer.
        flareFlame.visible = true;
        flareFlame.userData.step(dt, new THREE.Vector3(0, 2.7, 0), 0.07, 1.6, 1.4);
        flareTip.material.emissiveIntensity = 1.0 + Math.sin(t * 5) * 0.4 + domeUp * 1.2;
        if (purging) {
          n2Mist.visible = true;
          n2Mist.userData.step(dt, new THREE.Vector3(0, 0.5, 0), 0.03, 0.4, 0.6);
        } else if (n2Mist.visible) n2Mist.visible = false;
        if (domeUp) domeFloat.material.emissiveIntensity = 1.0 + Math.sin(t * 7) * 0.8;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "lel") {
          repaint(gasMeter.userData.screen, signFace(`${Math.round(gg.t * 60)} %`, {
            bg: "#0d1c14", accent: gg.t < 0.16 ? "#59c97b" : "#f0645b", fg: "#bff7d4", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "h2s") {
          repaint(h2sMeter.userData.screen, signFace(`${Math.round(gg.t * 120)}`, {
            bg: "#1c1408", accent: gg.t < 0.15 ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "leak-test") {
          repaint(mano.userData.screen, signFace(`${(gg.t * 18).toFixed(1)}`, {
            bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.64 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        void ventBad;
      },
    };
  },
};
