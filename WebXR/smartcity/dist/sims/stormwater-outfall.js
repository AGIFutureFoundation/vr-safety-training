import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, paperFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, cone, instrument, standingFigure, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Stormwater Outfall VR — Environmental Monitoring, station four.
// A wet-weather discharge sample at an industrial outfall, on the clock:
// the permit's first-flush window, the field meters calibrated before the
// rain, the bank approached with a tripod and a buddy, the grab taken from
// the flow and not the bank, bottles filled in preservation order, field
// readings logged, the chain of custody signed and sealed, and the sample
// on ice inside its hold time.

const SO_ACCENT = 0x78c8a0;

export const SIM_STORMWATER_OUTFALL = {
  id: "stormwater-outfall",
  index: "43",
  domain: "Environmental Monitoring",
  trade: "Environmental sampling technician — stormwater",
  category: "Environmental Monitoring",
  weather: "rain",
  certification: "Clean Water Act NPDES industrial stormwater permit (first-flush grab within 30 minutes of discharge); 40 CFR 136 approved methods, preservation and hold times; chain-of-custody per EPA SESD; OSHA HAZWOPER awareness and 29 CFR 1910.146 for confined vault access",
  name: "Stormwater Outfall",
  title: simTitle("Stormwater Outfall"),
  tagline: "Wet-weather NPDES grab: permit window, meters calibrated before the rain, bank staged with a buddy and tripod, grab from the flow, bottles in preservation order, field readings logged, custody sealed, sample on ice",
  accent: SO_ACCENT,
  accentCss: "#78c8a0",
  parSeconds: 260,
  footprint: 2.4,
  badge: { id: "first-flush", name: "First Flush", note: "A grab inside the permit window, in preservation order, sealed and iced — first time" },

  game: system({
    name: "Field Sampling",
    currency: "mL",
    ranks: ["Field Assistant", "Sampling Technician", "Field Lead", "QA Officer", "Field Sampling Certified"],
    badges: [
      { id: "calibrated", name: "Calibrated", note: "Meters calibrated against standards before the first bottle, first time", test: AWARD.stepClean("calibrate") },
      { id: "chain-unbroken", name: "Chain Unbroken", note: "Never an unlabelled bottle, never alone on the bank, never a sample left warm", test: AWARD.safe },
      { id: "reading-true", name: "Reading True", note: "Field pH and the flow estimate both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-sample", name: "Clean Sample", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-fill", name: "Steady Fill", note: "Bottle filled without a break in the stream", test: AWARD.unbroken },
      { id: "inside-window", name: "Inside the Window", note: "Sample sealed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wade-the-channel": "You waded into the channel to reach the flow. Six inches of moving stormwater takes a person off their feet, the outfall is a culvert, and nobody on the bank can reach you once you are in it.",
    "bare-hands-sample": "You handled the sample with bare hands. Industrial stormwater carries the site's chemistry; bare skin contaminates the sample with your own and exposes you to whatever washed off the yard.",
    "vault-entry-alone": "You opened the junction vault and leaned in alone. A stormwater vault is a permit-required confined space: it collects heavier-than-air vapour off the yard and it has drowned people in a metre of water.",
    "unlabelled-bottle": "You filled a bottle with no label and no time. A sample without a label, a time and a signature is not evidence of anything; the lab will reject it and the permit sample is gone with the rain.",
  },

  lateNotes: {
    "grab-pole": "The grab comes after the meters are calibrated and the bank is staged — a sample taken before the meters are proven has no field data to go with it.",
    "ph-meter": "Field pH is read on the sample, so it follows the grab.",
    "sample-set": "The bottle set goes on ice once it is labelled, sealed and signed for.",
  },

  steps: [
    {
      id: "permit", kind: "select", target: "permit-board",
      title: "Read the permit's sampling requirement",
      cue: "Check the parameters, the first-flush window, the bottle set and the hold times.",
      why: "The permit says what a qualifying storm is, how long you have after discharge starts, which bottles and preservatives, and how long the lab has. Miss the window and the quarter has no sample.",
    },
    {
      id: "weather", kind: "select", target: "rain-gauge",
      title: "Confirm the storm qualifies",
      cue: "Read the rain gauge and the antecedent dry period on the logger.",
      why: "A qualifying event needs enough rain after enough dry days. Sampling a storm that does not qualify wastes the bottles and still leaves the permit unsatisfied.",
    },
    {
      id: "calibrate", kind: "sequence",
      targets: ["ph-buffer-4", "ph-buffer-7", "cond-standard"],
      itemNames: { "ph-buffer-4": "pH 4 buffer", "ph-buffer-7": "pH 7 buffer", "cond-standard": "conductivity standard" },
      title: "Calibrate the field meters",
      cue: "Two-point the pH meter on buffer 7 then buffer 4, then the conductivity standard.",
      why: "Field readings are data of record. A meter calibrated after the sample, or not at all, turns every number on the form into an estimate the regulator can strike.",
      outOfOrderNote: "Buffer 7 first to set the offset, then buffer 4 for the slope, then conductivity.",
    },
    {
      id: "stage", kind: "sequence", anyOrder: true,
      targets: ["buddy-present", "tripod-set", "gloves-on"],
      itemNames: { "buddy-present": "second person on the bank", "tripod-set": "tripod and line", "gloves-on": "nitrile gloves" },
      title: "Stage the bank",
      cue: "Second person on the bank, tripod and line set over the flow, clean gloves on.",
      why: "The bank is wet, steep and moving. The tripod keeps the sampler over the flow without anyone leaning out, and the gloves keep the site's chemistry out of the bottle and off the technician.",
    },
    {
      id: "flow", kind: "gauge", target: "flow-staff",
      title: "Estimate the flow",
      cue: "Read the staff gauge in the channel and commit the stage inside the band.",
      why: "A concentration without a flow is half a number. The stage reading is what turns milligrams per litre into the pounds per day the permit is actually written against.",
      gauge: { label: "STAGE", speed: 0.7, green: [0.42, 0.58], readout: (t) => `${(t * 1.2).toFixed(2)} m`, missNote: "Read the staff again at the marked point — a stage off by a tenth changes the load by a third." },
    },
    {
      id: "grab", kind: "hold", target: "grab-pole", seconds: 5,
      title: "Take the grab from the flow",
      cue: "Hold the sampler in the moving flow, mouth upstream, until the bottle is full.",
      why: "The sample is taken from the flow, not from the bank eddy where solids settle and oil collects. Mouth upstream so what goes in is what is running past.",
      holdBreakNote: "You lifted the sampler mid-fill — the bottle is part air and part eddy. Empty it and take the grab again.",
    },
    {
      id: "bottles", kind: "sequence",
      targets: ["bottle-og", "bottle-metals", "bottle-bod"],
      itemNames: { "bottle-og": "oil and grease (no headspace)", "bottle-metals": "metals (nitric acid)", "bottle-bod": "BOD / TSS (unpreserved)" },
      title: "Fill the bottles in preservation order",
      cue: "Oil and grease first from the grab, then the acid-preserved metals bottle, then the unpreserved bottles.",
      why: "Oil and grease is a bottle you never pour between, so it is taken first and directly. The acid bottle is filled before anything can carry acid into a bottle that must not have it.",
      outOfOrderNote: "Oil and grease, then metals, then the unpreserved bottles — preservatives never travel backwards.",
    },
    {
      id: "ph", kind: "gauge", target: "ph-meter",
      title: "Read field pH",
      cue: "Take pH on a separate aliquot and commit the reading.",
      why: "pH has a fifteen-minute hold time: it is a field parameter or it is nothing. It is read on an aliquot, never in the sample bottle going to the lab.",
      gauge: { label: "FIELD pH", speed: 0.75, green: [0.42, 0.6], readout: (t) => `${(4 + t * 7).toFixed(2)} pH`, missNote: "Let the reading settle and commit when it stops drifting." },
    },
    {
      id: "label", kind: "sequence",
      targets: ["label-bottles", "custody-seal", "sign-coc"],
      itemNames: { "label-bottles": "labels with time and site", "custody-seal": "custody seals", "sign-coc": "chain of custody signed" },
      title: "Label, seal and sign custody",
      cue: "Label every bottle with the site, date, time and preservative, seal them, and sign the chain of custody.",
      why: "Custody is what makes the sample evidence. Every hand that holds it signs for it, and a broken seal at the lab ends the sample's life as a legal record.",
      outOfOrderNote: "Label, then seal, then sign — the form describes bottles that are already labelled and sealed.",
    },
    {
      id: "ice", kind: "drag", target: "sample-set",
      title: "Get the samples on ice",
      cue: "Carry the sealed bottle set to the cooler and set it on the ice.",
      why: "Four degrees is part of the method. A metals sample survives, but the unpreserved bottles start changing the moment they are warm, and the lab reports the sample as out of compliance on arrival.",
      drag: { to: "cooler-ice", radius: 0.45, missNote: "Not in the cooler — set the bottle set down on the ice bed." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["sheen-upstream"],
      itemNames: { "sheen-upstream": "sheen on the upstream water" },
      itemNotes: { "sheen-upstream": "There is a rainbow sheen on the water upstream of the outfall — an oil source on the yard that the grab will have caught and the site needs to know about today." },
      title: "Walk the outfall before you leave",
      cue: "Look over the channel above and below the pipe and click anything the site needs to hear about now.",
      why: "The sampler is the only person who sees the outfall during the storm. What is visible in the flow is reportable the same day, not when the lab report comes back in three weeks.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, SO_ACCENT);
    // Bank on +z, channel running across at -z, outfall pipe in the far bank.
    box(g, 5.8, 0.1, 2.4, 0, 0.05, 1.2, 0x3f4a37, { rough: 0.95 });
    const bankSlope = box(g, 5.8, 0.5, 0.9, 0, -0.12, -0.2, 0x4a4433, { rough: 0.95 });
    bankSlope.rotation.x = 0.35;
    const channel = box(g, 5.8, 0.1, 2.2, 0, -0.5, -1.7, 0x2a2f2a, { rough: 0.95 });
    const water = slab(g, 5.8, 0.02, 2.0, 0, -0.34, -1.7, 0x3a6a7a, { rough: 0.15, metal: 0.5, opacity: 0.75, transparent: true, cast: false });
    const sheen = slab(g, 1.0, 0.01, 0.6, -1.7, -0.32, -2.2, 0xa07fd8, { rough: 0.1, metal: 0.8, opacity: 0.55, transparent: true, cast: false });
    reg(hits, sheen, "sheen-upstream");
    const outfall = group(g, 0.6, -0.2, -2.7);
    cyl(outfall, 0.4, 0.4, 0.5, 0, 0, 0, 0x6b6660, { rough: 0.9, seg: 18, open: true }).rotation.x = Math.PI / 2;
    cyl(outfall, 0.5, 0.5, 0.12, 0, 0, 0.26, 0x7b756d, { rough: 0.9, seg: 18 }).rotation.x = Math.PI / 2;
    holoTag(outfall, "outfall 001 — discharging", 0, 0.7, 0.2, { css: "#78c8a0", w: 0.46 });
    const discharge = particles(g, 60, 0x9fd8e8, { size: 0.03, life: 0.8, additive: false, opacity: 0.6 });
    const wadeHit = box(g, 3.0, 0.5, 1.4, 0, -0.2, -1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "wade out to the pipe?", 1.9, 0.25, -1.7, { css: "#d2312b", w: 0.4 });
    reg(hits, wadeHit, "wade-the-channel");
    // Staff gauge in the channel.
    const staff = group(g, -0.9, -0.5, -1.4);
    box(staff, 0.09, 1.2, 0.03, 0, 0.6, 0, 0xf2f6fa, { rough: 0.7 });
    for (let i = 1; i < 10; i++) box(staff, 0.09, 0.012, 0.035, 0, i * 0.12, 0.002, i % 5 === 0 ? 0xd2312b : 0x1b1e23, { rough: 0.7, cast: false });
    holoTag(staff, "staff gauge", 0, 1.35, 0, { css: "#78c8a0", w: 0.24 });
    reg(hits, staff, "flow-staff");
    // Tripod over the flow with the pole sampler.
    const tripod = group(g, 0.2, 0.1, 0.1);
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const leg = cyl(tripod, 0.015, 0.02, 1.5, Math.sin(a) * 0.3, 0.75, Math.cos(a) * 0.3, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 }); leg.rotation.z = -Math.sin(a) * 0.2; leg.rotation.x = Math.cos(a) * 0.2; }
    box(tripod, 0.12, 0.05, 0.12, 0, 1.5, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const line = cyl(tripod, 0.006, 0.006, 1.0, 0, 1.0, -0.4, 0xf2f6fa, { rough: 0.7, seg: 6 });
    holoTag(tripod, "tripod and line", 0, 1.75, 0, { css: "#78c8a0", w: 0.3 });
    reg(hits, tripod, "tripod-set");
    void line;
    const pole = group(g, 0.2, 0.1, -0.6, 0.3);
    const rod = cyl(pole, 0.012, 0.012, 1.8, 0, 0.75, 0, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 8 });
    rod.rotation.x = 0.6;
    const cupHolder = cyl(pole, 0.06, 0.06, 0.16, 0, 0.2, -0.75, 0xdfe6ec, { rough: 0.5, seg: 14 });
    holoTag(pole, "pole sampler", 0, 1.45, 0.3, { css: "#78c8a0", w: 0.26 });
    reg(hits, pole, "grab-pole");
    void cupHolder;
    // Bench on the bank: bottles, meters, buffers, labels, seals, custody form, cooler.
    const bench = group(g, -1.9, 0.1, 1.2, 0.35);
    box(bench, 1.5, 0.8, 0.7, 0, 0.4, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const bottleSet = group(bench, -0.45, 0.82, 0);
    const bottles = {};
    for (const [id, dx, color, label] of [["bottle-og", -0.18, 0x8fd8ff, "O&G"], ["bottle-metals", 0, 0xd2a03b, "METALS"], ["bottle-bod", 0.18, 0xdfe6ec, "BOD/TSS"]]) {
      const b = group(bottleSet, dx, 0, 0);
      cyl(b, 0.045, 0.045, 0.16, 0, 0.08, 0, color, { rough: 0.25, opacity: 0.75, transparent: true, seg: 14 });
      cyl(b, 0.03, 0.03, 0.03, 0, 0.175, 0, 0x2b2f34, { rough: 0.6, seg: 10 });
      holoTag(b, label, 0, 0.3, 0, { css: "#78c8a0", w: 0.18 });
      reg(hits, b, id);
      bottles[id] = b;
    }
    holoTag(bench, "bottle set", -0.45, 1.2, 0, { css: "#78c8a0", w: 0.22 });
    reg(hits, bottleSet, "sample-set");
    const phMeter = instrument(bench, 0.2, 0.82, -0.12, { idle: "-.-- pH", color: 0x78c8a0, w: 0.13, d: 0.2 });
    holoTag(bench, "pH meter", 0.2, 1.02, -0.12, { css: "#78c8a0", w: 0.2 });
    reg(hits, phMeter, "ph-meter");
    for (const [id, dx, color, label] of [["ph-buffer-7", 0.42, 0x78c8a0, "pH 7"], ["ph-buffer-4", 0.56, 0xd2745b, "pH 4"], ["cond-standard", 0.7, 0x8fd8ff, "COND"]]) {
      const b = cyl(bench, 0.028, 0.028, 0.1, dx, 0.86, 0.15, color, { rough: 0.3, opacity: 0.8, transparent: true, seg: 12 });
      holoTag(bench, label, dx, 1.0, 0.15, { css: "#78c8a0", w: 0.14 });
      reg(hits, b, id);
    }
    const labels = decal(bench, 0.2, 0.14, -0.1, 0.815, 0.24, paperFace("SAMPLE LABELS", ["Site / outfall", "Date and time", "Preservative", "Sampler"], { scale: 0.8 }));
    labels.rotation.x = -Math.PI / 2;
    holoTag(bench, "labels", -0.1, 1.0, 0.3, { css: "#78c8a0", w: 0.18 });
    reg(hits, labels, "label-bottles");
    const seals = box(bench, 0.12, 0.01, 0.06, 0.15, 0.81, 0.26, 0xf2c14b, { rough: 0.7 });
    holoTag(bench, "custody seals", 0.15, 0.98, 0.3, { css: "#78c8a0", w: 0.28 });
    reg(hits, seals, "custody-seal");
    const coc = decal(bench, 0.3, 0.4, 0.45, 0.815, -0.05, paperFace("CHAIN OF CUSTODY", ["Project / outfall 001", "Bottles: O&G, metals, BOD/TSS", "Relinquished by: ______", "Received by: ______", "Time / date: ______"], { scale: 0.85 }));
    coc.rotation.x = -Math.PI / 2;
    holoTag(bench, "chain of custody", 0.45, 1.0, -0.3, { css: "#78c8a0", w: 0.34 });
    reg(hits, coc, "sign-coc");
    const unlabelled = box(bench, 0.12, 0.2, 0.12, -0.72, 0.9, -0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bench, "fill it now, label later?", -0.72, 1.12, -0.15, { css: "#d2312b", w: 0.42 });
    reg(hits, unlabelled, "unlabelled-bottle");
    const gloves = box(bench, 0.16, 0.05, 0.12, 0.62, 0.84, -0.2, 0x4a7fd8, { rough: 0.8 });
    holoTag(bench, "nitrile gloves", 0.62, 1.0, -0.2, { css: "#78c8a0", w: 0.28 });
    reg(hits, gloves, "gloves-on");
    const bareHands = box(bench, 0.2, 0.2, 0.2, -0.45, 1.05, 0.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bench, "bare hands?", -0.45, 1.28, 0.25, { css: "#d2312b", w: 0.24 });
    reg(hits, bareHands, "bare-hands-sample");
    const cooler = group(g, -0.6, 0.1, 1.9, -0.2);
    box(cooler, 0.75, 0.45, 0.5, 0, 0.22, 0, 0xdfe6ec, { rough: 0.7 });
    const iceBed = slab(cooler, 0.65, 0.06, 0.4, 0, 0.45, 0, 0xbfe6f5, { radius: 0.02, rough: 0.3, opacity: 0.85, transparent: true });
    holoTag(cooler, "cooler — 4 °C on ice", 0, 0.75, 0, { css: "#78c8a0", w: 0.4 });
    hits["cooler-ice"] = iceBed;
    // Junction vault on the bank, lid closed; opening it alone is the hazard.
    const vault = group(g, 2.0, 0.1, 0.6);
    cyl(vault, 0.36, 0.36, 0.06, 0, 0.03, 0, 0x5b5f64, { rough: 0.8, metal: 0.4, seg: 20 });
    for (let i = -1; i <= 1; i++) box(vault, 0.5, 0.012, 0.04, 0, 0.065, i * 0.12, 0x44484d, { rough: 0.7, metal: 0.4, cast: false });
    holoTag(vault, "junction vault — permit space", 0, 0.45, 0, { css: "#f2c14b", w: 0.5 });
    const vaultHit = box(vault, 0.7, 0.4, 0.7, 0, 0.22, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, vaultHit, "vault-entry-alone");
    // Rain gauge and logger, permit board, buddy.
    const rainGauge = group(g, 1.4, 0.1, 1.7, -0.3);
    cyl(rainGauge, 0.02, 0.02, 1.0, 0, 0.5, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 });
    cyl(rainGauge, 0.09, 0.07, 0.3, 0, 1.15, 0, 0xdfe6ec, { rough: 0.5, seg: 16, open: true });
    const logger = instrument(rainGauge, 0.0, 0.8, 0.08, { idle: "0.00 in", color: 0x78c8a0, w: 0.12, d: 0.18 });
    holoTag(rainGauge, "rain gauge and logger", 0, 1.45, 0, { css: "#78c8a0", w: 0.42 });
    reg(hits, rainGauge, "rain-gauge");
    const board = group(g, 2.4, 0, 1.8, -0.7);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0b1d16"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#78c8a0"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d8f5e6"; ctx.fillText("NPDES PERMIT — OUTFALL 001", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#edfbf4";
      ["Qualifying storm: 0.1 in after 72 h dry", "Grab within 30 min of discharge start", "Bottles: O&G (no headspace), metals HNO₃,", "   BOD/TSS unpreserved — in that order", "Field: pH (15 min hold), stage, visual", "Preserve at 4 °C; metals 6 mo, BOD 48 h", "Custody: label, seal, sign, no gaps"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.1)));
    }, { accent: SO_ACCENT });
    reg(hits, board, "permit-board");
    const buddy = standingFigure(g, -2.6, 0.4, { ry: 1.4, cloth: 0x2b7a5a });
    holoTag(buddy, "second person on the bank", 0, 1.9, 0, { css: "#78c8a0", w: 0.48 });
    reg(hits, buddy, "buddy-present");
    for (const [x, z] of [[-2.4, 2.0], [2.4, 2.0]]) cone(g, x, z);

    let filled = 0;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 0.9, -1.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "grab") filled = 1;
        if (step.id === "ice") { bottleSet.parent.remove(bottleSet); cooler.add(bottleSet); bottleSet.position.set(0, 0.5, 0); bottleSet.rotation.set(0, 0, 0); }
        if (step.id === "walk") sheen.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        discharge.visible = true;
        discharge.userData.step(dt, new THREE.Vector3(0.6, -0.2, -2.5), 0.12, 0.7, 1.2);
        water.position.y = -0.34 + Math.sin(t * 1.6) * 0.008;
        sheen.position.x = -1.7 + Math.sin(t * 0.4) * 0.15;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "flow") repaint(logger.userData.screen, signFace(`${(gg.t * 1.2).toFixed(2)} m`, { bg: "#0b1d16", accent: gg.t >= 0.42 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#edfbf4", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "ph") repaint(phMeter.userData.screen, signFace(`${(4 + gg.t * 7).toFixed(2)} pH`, { bg: "#0b1d16", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#edfbf4", scale: 0.62 }));
        if (step?.id === "grab" && session.holding) pole.rotation.x = -0.25 + Math.sin(t * 3) * 0.02;
        else pole.rotation.x = filled ? -0.1 : 0;
      },
    };
  },
};
