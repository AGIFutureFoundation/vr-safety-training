import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, repaint, signFace, mat, particles } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Stormwater at the Terminal VR — Maritime & Ports, the port
// maintenance pack.
//
// A container yard drains to the bay through catch basins, a trench drain and
// an oil-water separator, and the terminal's stormwater permit is the reason
// every one of them is maintained. A sheen has shown up in the separator's
// outlet chamber. The learner is the ILWU maintenance and repair worker on the
// stormwater crew; the IUOE operator runs the vacuum truck. The lane beside
// the basin stays live, and the storm that would flush the sheen to the
// outfall is on the radio before it is on the yard.

const PTW_ACCENT = 0x3f9f8a;

export const SIM_PT_STORMWATER_AT_THE_TERMINAL = {
  id: "pt-stormwater-at-the-terminal",
  index: "223",
  domain: "Maritime & Ports",
  trade: "ILWU maintenance and repair — terminal stormwater crew, PMA training programme, with the IUOE operator on the vacuum truck",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "rain",
  certification: "ILWU maintenance and repair with the PMA training programme; IUOE vacuum truck operation; EPA 40 CFR 122.26 storm water discharges under the terminal's industrial permit; 40 CFR 136 test procedures for the discharge samples; OSHA 29 CFR 1917 marine terminals; 29 CFR 1910.132 for the gloves, goggles and hi-vis at the basin",
  name: "Stormwater at the Terminal",
  title: simTitle("Stormwater at the Terminal"),
  tagline: "A sheen in the separator: the permit's plan read, gloves and goggles on, the lane coned before the grate comes up on the hook, the sheen watched while a hustler turns into the lane, a new basin insert set, the leak traced to a parked stacker, the oil layer measured, the separator valved off and pumped down while a storm cell closes on the outfall, the discharge sampled to the method, the empty spill kit found, and the log closed",
  accent: PTW_ACCENT,
  accentCss: "#3f9f8a",
  parSeconds: 270,
  footprint: 2.6,
  badge: { id: "outfall-held", name: "Outfall Held", note: "The sheen kept out of the bay: source found, separator pumped, outfall gated before the storm, and the sample taken to the method" },

  supportLine: "your ILWU local's member assistance programme, with the PMA-ILWU benefit plan's counselling line behind it",

  game: system({
    name: "Stormwater Crew",
    currency: "LITRE",
    ranks: ["Yard Hand", "Drainage Mechanic", "Stormwater Tech", "Lead Mechanic", "Stormwater Certified"],
    badges: [
      { id: "hook-not-hand", name: "Hook, Not Hand", note: "The grate came up on the hook, after the cones, every time", test: AWARD.stepClean("open-basin") },
      { id: "source-found", name: "Source Found", note: "The sheen traced to its source rather than pumped and forgotten", test: AWARD.stepClean("trace-source") },
      { id: "basin-discipline", name: "Basin Discipline", note: "Never fingers under a grate, never a hose to the drain, never in the basin, never an open basin left in a live lane", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-response", name: "Clean Response", note: "No corrections anywhere in the response", test: AWARD.clean },
      { id: "steady-pumpdown", name: "Steady Pump-down", note: "Held the vacuum rate in band for the whole pump-out", test: AWARD.unbroken },
      { id: "before-the-rain", name: "Before The Rain", note: "Log closed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "fingers-under-grate": "You lifted the catch basin grate by getting your fingers under its edge. A cast grate is heavier than it looks and drops the moment its far edge slips off the frame — onto the fingers under the near one. The hook is the tool for the grate and 29 CFR 1917's rule on handling gear by its intended means is written for exactly this piece of iron.",
    "hose-into-basin": "You reached for the wash-down hose to sluice the sheen off the apron into the basin. The basin drains to the separator and the separator drains to the bay, and the terminal's permit under 40 CFR 122.26 exists to keep exactly that oil out of exactly that water — a spill is absorbed and disposed of, never washed down the drain that is the reason the crew is here.",
    "enter-basin": "You started down into the catch basin to reach the insert. A catch basin is a permit-required confined space the moment a person's head goes below its rim — an unmonitored atmosphere, a way in that is not a way out, and a lane of hustlers above it. The insert comes out on its handles from the deck, or with the vacuum truck, never with a person in the basin.",
    "open-basin-unbarricaded": "You walked away from the open basin to fetch the insert with no barricade across it in a live lane. An open catch basin in a hustler lane is a hole a wheel drops into and a person steps into, and 29 CFR 1917 has openings guarded whenever nobody is standing at them — the barricade goes across before anyone leaves the rim, or the rim is not left.",
  },

  lateNotes: {
    "separator-valve": "The separator's outlet is valved off once the oil layer has been measured — there is nothing to isolate until the reading says so.",
    "vac-pump-lever": "The vacuum truck pumps the separator once its outlet is closed — not while the chamber is still flowing to the outfall.",
    "stormwater-log": "The log closes once the sample is taken and the spill kits walked — it is the last thing, not the first.",
  },

  steps: [
    {
      id: "plan-read", kind: "select", target: "stormwater-plan-board",
      title: "Read the terminal's stormwater plan for the sheen response",
      cue: "Check the permit's pollution prevention plan: which drainage area the separator serves, the response steps for a sheen, and who is notified.",
      why: "A marine terminal discharges its stormwater under an industrial permit, and 40 CFR 122.26 has that permit carry a pollution prevention plan that says what the crew does when a sheen appears: which basins drain to which separator, what gets sampled, who at the terminal and beyond is told, and by when. Reading it first is what makes the response the terminal's response rather than the crew's improvisation — and the notification clock on a sheen starts when it is seen, not when the paperwork is found.",
    },
    {
      id: "basin-ppe", kind: "sequence", anyOrder: true,
      targets: ["nitrile-gloves", "splash-goggles", "hivis-vest"],
      itemNames: { "nitrile-gloves": "chemical-resistant gloves", "splash-goggles": "splash goggles", "hivis-vest": "hi-vis vest" },
      title: "Gloves, goggles and hi-vis before the basin",
      cue: "Chemical-resistant gloves, splash goggles and the hi-vis vest on before the grate or the separator is touched.",
      why: "A catch basin insert comes out dripping with whatever the yard has shed onto it — hydraulic oil, diesel, the reefer wash-down — and the separator chamber is the concentrate of all of it; 29 CFR 1910.132 has the gloves and goggles on before the exposure, not after the first splash. The hi-vis is for the lane: the crew at a basin is kneeling at wheel height beside hustlers that read a vest before they read a person.",
    },
    {
      id: "open-basin", kind: "sequence",
      targets: ["cone-lane", "grate-hook", "insert-lift"],
      itemNames: { "cone-lane": "cones across the lane at the basin", "grate-hook": "grate lifted on the hook", "insert-lift": "filter insert lifted by its handles" },
      title: "Cone the lane, lift the grate on the hook, lift the insert",
      cue: "Cones across the lane first, then the grate up on the hook, then the insert out by its handles onto the tray.",
      why: "The order is the order the hazards arrive: the lane is coned before anyone kneels at wheel height in it, the grate comes up on the hook because a cast grate lifted by hand drops on the fingers under it, and the insert comes out by its handles onto a tray because it is holding what the yard shed into it and the deck is the drain's own catchment. 29 CFR 1917 puts traffic control before the work and handling gear by its means, and a basin worked in the other order is a basin worked in a live lane by hand.",
      outOfOrderNote: "Cones first, then the grate on the hook, then the insert — nobody kneels in the lane before it is coned, and nobody's fingers go under the grate.",
    },
    {
      id: "sheen-watch", kind: "hold", target: "sheen-window", seconds: 4,
      title: "Watch the separator's outlet chamber for sheen",
      cue: "Hold your watch on the outlet chamber's sight window: sheen on the surface, its colour and how it moves, and whether the outlet weir is carrying it.",
      why: "The separator's outlet chamber is the last place oil can be seen before it reaches the outfall, and a sheen there is either the separator overwhelmed by a slug it was not sized for or oil arriving as an emulsion it cannot split. The watch is held rather than glanced because the two look different over time — a rainbow that thins and breaks is a slug passing; one that holds is a continuing source upstream — and which it is decides whether the crew pumps the separator or goes looking for the leak first.",
      holdBreakNote: "The watch broke before the sheen had shown whether it was thinning or holding — that is the whole question. Watch the window again.",
    },
    {
      id: "set-insert", kind: "drag", target: "new-insert",
      title: "Set the new filter insert in the basin frame",
      cue: "Carry the new insert from the truck and seat it in the basin frame, its lip on the frame's ledge and its overflow ports clear.",
      why: "The insert is the first thing the yard's runoff meets on its way to the bay, and it works only if it sits on the frame's ledge so water goes through its media rather than around it: an insert dropped in askew passes everything past one side and clogs on the other. The overflow ports stay clear because a basin that cannot pass a storm floods the lane, and a flooded lane is a lane that hustlers are driving through blind — the insert manages oil; it must never manage the flood.",
      drag: { to: "basin-frame", radius: 0.5, missNote: "Not on the ledge — the insert has to seat on the frame's lip all the way round or the runoff goes past it." },
    },
    {
      id: "trace-source", kind: "find", noHint: true,
      targets: ["leaking-line"],
      itemNames: { "leaking-line": "leaking hydraulic line on the parked reach stacker" },
      itemNotes: { "leaking-line": "The reach stacker parked at the head of the trench drain has a hydraulic line weeping onto the apron, and the trail runs straight into the trench — the sheen is this machine, and it has been dripping since it was parked." },
      title: "Trace the sheen to its source upstream",
      cue: "Walk the drainage area upstream of the separator: the trench drain, the apron, the parked equipment — find where the oil is coming from.",
      why: "Pumping the separator without finding the source is a response that has to be repeated the next time it rains, and a sheen with a continuing source will overwhelm any separator eventually. The permit's plan has the source found and stopped as part of the response because the separator is the last defence, not the first, and a machine weeping onto the apron at the head of a trench drain is the kind of source that is found by walking the drainage area rather than by watching the outlet.",
    },
    {
      id: "oil-layer", kind: "gauge", target: "interface-probe",
      title: "Measure the oil layer in the separator with the interface probe",
      cue: "Lower the interface probe into the separator's oil chamber and commit the oil-layer thickness reading.",
      why: "An oil-water separator holds its oil in a layer on top of the water in its chamber, and that layer has a thickness the unit was designed to hold before the oil starts to carry over the weir with the water. The interface probe reads where the oil ends and the water begins, and the thickness is the number that decides whether the separator is pumped now, before the storm, or can wait — the sight window shows sheen; only the probe shows how much oil is behind it.",
      gauge: { label: "OIL LAYER", speed: 0.7, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 300)} mm`, missNote: "Outside the band — lower the probe slowly until the interface tone changes and hold it there for the reading." },
    },
    {
      id: "isolate-separator", kind: "turn", target: "separator-valve",
      title: "Close the separator's outlet valve before pumping",
      cue: "Turn the outlet valve closed so nothing leaves the separator to the outfall while it is pumped down.",
      why: "Pumping a separator disturbs its layers, and a separator pumped with its outlet open sends the disturbed oil over the weir to the outfall while the truck is taking the rest from the top — the one moment in the response most likely to put oil in the bay. The outlet valve is closed first, and it is closed by the crew at the separator rather than assumed closed from the plan, because the valve's position is the fact and the plan is only what it should be.",
      turn: { turns: 1.0, label: "OUTLET VALVE", readout: (t) => (t < 0.35 ? "open" : t < 0.9 ? "closing" : "closed") },
    },
    {
      id: "vac-pumpout", kind: "track", target: "vac-pump-lever", seconds: 6,
      title: "Pump the separator down with the vacuum truck",
      cue: "Bring the vacuum truck's suction up on the lever and hold a steady rate — skim the oil layer, never surge into the water below it.",
      why: "The vacuum truck skims the oil layer off the top of the separator, and the rate is what decides whether it takes oil or water: a surge pulls the interface up into the suction and fills the truck's tank with water the terminal pays to dispose of as oily waste, while a stall lets the layer re-settle behind the wand. The rate is held steady with the operator watching the sight glass on the truck, because the truck's tank is finite and the storm that will refill the separator is on its way.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.48, drift: 0.12, label: "VACUUM RATE", readout: (v) => (v < 0.4 ? "stalling — layer settling" : v > 0.6 ? "surging — pulling water" : "skimming steady") },
      holdBreakNote: "The rate broke out of band — the wand pulled water or lost the layer. Bring the suction back to a steady skim.",
    },
    {
      id: "sample", kind: "select", target: "sample-bottle",
      title: "Take the discharge sample to the method and start its chain of custody",
      cue: "Take the sample from the outlet chamber in the method's bottle, fill it as the method says, label it and start the chain-of-custody form.",
      why: "The terminal's permit has the discharge sampled and analysed by the test procedures in 40 CFR 136, and a sample taken in the wrong bottle, overfilled, unlabelled or with no chain of custody is a sample the laboratory cannot use and the regulator will not accept. The sample is taken now, at the outlet after the response, because it is the terminal's own evidence of what did and did not reach the bay — and a sheen event with no sample is a sheen event the terminal cannot answer for.",
    },
    {
      id: "spill-kit-walk", kind: "find", noHint: true,
      targets: ["empty-spill-kit"],
      itemNames: { "empty-spill-kit": "spill kit station stripped of absorbent" },
      itemNotes: { "empty-spill-kit": "The spill kit at the head of the lane has been used and never restocked — the drum has two pads and no boom in it. The last crew to use it left the yard with a kit that would not have held this morning's leak." },
      title: "Walk the spill kit stations",
      cue: "Check each spill kit station in the drainage area: sealed, stocked with pads and boom, and where the plan says it is.",
      why: "The permit's plan puts spill kits where the yard's leaks happen, and a kit that has been used and not restocked is a plan that has quietly stopped working — the next leaking stacker meets a drum with nothing in it. Walking the stations after a response is how the crew finds the one that was emptied by the last event, and the kits are checked against the plan's list rather than against memory because the plan is what the regulator inspects.",
    },
    {
      id: "stormwater-log", kind: "select", target: "stormwater-log",
      title: "Close the response in the stormwater log and make the notifications",
      cue: "Record the sheen, its source, the insert changed, the oil layer and pump-out, the sample's custody number, and make the notifications the plan requires.",
      why: "The stormwater log is the permit's own record of the terminal's discharges and its responses to them, and 40 CFR 122.26 has the terminal keep it and produce it: a sheen with a source found, a separator pumped and a sample in custody is a response the terminal can show; the same event unlogged is a discharge nobody can explain. The notifications go with the log because the plan names who is told and by when, and that clock has been running since the sheen was first seen.",
    },
    {
      id: "crew-checkin", kind: "select", target: "yard-radio",
      title: "Check in with the vacuum truck operator and the yard",
      cue: "Call the yard and the operator: the separator is back in service, the stacker is tagged out for its leak, and how the crew is after a shift in the rain beside the lane.",
      why: "The yard takes the lane back on this call and the stacker's operator needs to know the machine is tagged for a leak before the next shift climbs into it, so the call closes two loops at once. It is also the crew's own check-in: a wet shift kneeling at a basin with a hustler turning in and a storm cell on the radio is a shift with something left in it, and the ILWU's way is to ask before the truck leaves — the member assistance line is named because a crew that has heard it named will use it.",
    },
  ],

  interrupts: [
    {
      id: "hustler-basin-lane",
      kind: "Hustler entering the lane at the open basin",
      after: "sheen-watch", delay: 2, seconds: 12,
      alert: "A hustler has turned into the lane toward the open basin with a chassis on — the cones are across it, but the driver is reading the block numbers, not the lane.",
      cue: "Set the lane gate flag to stop now — the cones are not enough for a driver looking the other way.",
      target: "lane-gate-flag",
      why: "Cones mark a hazard for a driver who is looking for one, and a hustler driver hunting a block number is not; the lane gate flag at the head of the lane is the signal every driver in the yard is trained to stop on, and 29 CFR 1917 puts that control on the terminal rather than on the crew's hope of being seen. It is set the moment a vehicle turns in, because an open basin in a lane is a hole a wheel drops into at yard speed.",
      missNote: "The hustler came down the lane with nothing but cones between it and the open basin; the chassis clipped a cone and the wheel passed the open frame by less than its own width while the sheen watch went on.",
      wrongNote: "The lane gate flag — the driver answers to the flag at the head of the lane, and nothing else here is in his eyeline from the cab.",
    },
    {
      id: "storm-cell-outfall",
      kind: "Storm cell called on the terminal radio",
      after: "vac-pumpout", delay: 2, seconds: 14,
      alert: "The terminal radio calls a storm cell across the bay — heavy rain on the yard inside minutes, and the separator is half pumped with a sheen still in its outlet chamber.",
      cue: "Close the outfall gate now — the first flush of the storm would carry the sheen straight to the bay.",
      target: "outfall-gate",
      why: "The first flush of a storm is the runoff that carries what the yard has shed since the last one, and a separator half pumped with sheen in its outlet is a separator that will pass that sheen to the outfall the moment the rain arrives. The permit's plan has the outfall gate closed ahead of a storm during a response for exactly this, and it is closed on the radio call rather than the first drops because the flush arrives with the rain, not after it.",
      missNote: "The storm arrived with the outfall gate open and the outlet chamber still carrying sheen — the first flush took it to the bay, and the response became a discharge the terminal now has to report as one.",
      wrongNote: "The outfall gate — the call is about what the storm's first flush carries to the bay, and the gate is the only thing here that stops it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PTW_ACCENT);

    // ---------------------------------------------------------------- apron
    const apron = box(g, 6.4, 0.1, 5.6, 0, 0.05, 0, 0xffffff, { rough: 0.92 });
    apron.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#1f262c", base2: "#181e24", seam: "rgba(0,0,0,0.45)" }), { repeat: 6, px: 512 }),
      { rough: 0.85, metal: 0.05, color: 0xa9b3bb },
    );
    // The lane along the west side, and the trench drain along it.
    for (let i = 0; i < 5; i++) box(g, 0.08, 0.012, 0.5, -1.7, 0.111, -2.4 + i * 1.1, 0xf2c14b, { rough: 0.7, cast: false });
    for (let i = 0; i < 5; i++) box(g, 0.08, 0.012, 0.5, -3.0, 0.111, -2.4 + i * 1.1, 0xf2c14b, { rough: 0.7, cast: false });
    const trench = box(g, 0.2, 0.02, 4.4, -1.4, 0.101, -0.4, 0x22262b, { rough: 0.6, metal: 0.4, cast: false });
    void trench;
    for (let i = 0; i < 11; i++) box(g, 0.18, 0.02, 0.03, -1.4, 0.112, -2.5 + i * 0.42, 0x5b6771, { rough: 0.5, metal: 0.6, cast: false });
    // Puddles and the sheen trail from the stacker to the trench.
    box(g, 0.9, 0.012, 0.5, -0.6, 0.111, -2.2, 0x3a4e5c, { rough: 0.1, metal: 0.4, emissive: 0x1a2a34, ei: 0.2, cast: false });
    box(g, 0.7, 0.012, 0.16, -1.05, 0.113, -2.1, 0x5a4a20, { rough: 0.1, metal: 0.5, emissive: 0x3a2a08, ei: 0.4, cast: false });

    // ------------------------------------------------------------ catch basin
    // Raised frame on the deck with a dark opening — the deck is solid below.
    const basin = group(g, -0.8, 0.1, 0.6);
    for (const [fx, fz, fw, fd] of [[0, -0.36, 0.84, 0.12], [0, 0.36, 0.84, 0.12], [-0.36, 0, 0.12, 0.6], [0.36, 0, 0.12, 0.6]]) box(basin, fw, 0.1, fd, fx, 0.05, fz, 0x3a4148, { rough: 0.6, metal: 0.5 });
    box(basin, 0.6, 0.02, 0.6, 0, 0.011, 0, 0x06090c, { rough: 1.0, cast: false });
    const frameSocket = torus(basin, 0.3, 0.008, 0, 0.11, 0, PTW_ACCENT, { emissive: PTW_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    frameSocket.rotation.x = Math.PI / 2;
    reg(hits, frameSocket, "basin-frame");
    const setInsert = box(basin, 0.5, 0.12, 0.5, 0, 0.06, 0, 0x2f6f4a, { rough: 0.7, metal: 0.3 });
    setInsert.visible = false;
    // The old insert, half out on its handles.
    const oldInsert = group(basin, 0, 0.16, 0);
    box(oldInsert, 0.5, 0.3, 0.5, 0, 0, 0, 0x2b3138, { rough: 0.7, metal: 0.3 });
    for (const hx of [-0.2, 0.2]) box(oldInsert, 0.04, 0.2, 0.04, hx, 0.24, 0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    holoTag(basin, "insert — lift by handles", 0, 0.62, 0, { css: "#3f9f8a", w: 0.46 });
    reg(hits, oldInsert, "insert-lift");
    // The grate, leaning against the frame, and the hook beside it.
    const grate = group(basin, 0.62, 0.1, 0, 0);
    grate.rotation.z = 1.2;
    box(grate, 0.7, 0.03, 0.7, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    for (let i = 0; i < 6; i++) box(grate, 0.04, 0.035, 0.66, -0.25 + i * 0.1, 0.002, 0, 0x5b6771, { rough: 0.5, metal: 0.6, cast: false });
    const fingerHit = box(grate, 0.7, 0.06, 0.1, 0, 0.02, 0.36, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(basin, "fingers under it?", 0.62, 0.9, 0.3, { css: "#d2312b", w: 0.36 });
    reg(hits, fingerHit, "fingers-under-grate");
    const hook = group(basin, -0.75, 0.1, 0.3);
    cyl(hook, 0.012, 0.012, 0.9, 0, 0.45, 0, 0x8a949d, { rough: 0.45, metal: 0.8, seg: 6 });
    torus(hook, 0.04, 0.01, 0, 0.92, 0, 0x8a949d, { rough: 0.45, metal: 0.8, seg: 6, seg2: 12 });
    holoTag(basin, "grate hook", -0.75, 1.15, 0.3, { css: "#3f9f8a", w: 0.26 });
    reg(hits, hook, "grate-hook");
    const ladder = group(basin, 0, 0.3, -0.5);
    for (const lx of [-0.15, 0.15]) cyl(ladder, 0.015, 0.015, 0.7, lx, 0, 0, 0xe8b02e, { rough: 0.5, metal: 0.5, seg: 6 });
    for (let i = 0; i < 3; i++) box(ladder, 0.3, 0.02, 0.02, 0, -0.25 + i * 0.22, 0, 0xe8b02e, { rough: 0.5, metal: 0.5 });
    ladder.rotation.x = -0.4;
    holoTag(basin, "climb in?", 0, 0.9, -0.6, { css: "#d2312b", w: 0.24 });
    reg(hits, ladder, "enter-basin");
    const foldedBarrier = box(g, 1.3, 0.04, 0.3, -0.8, 0.13, 1.5, 0xf2c14b, { rough: 0.6 });
    holoTag(g, "leave it open in the lane?", -0.8, 0.45, 1.5, { css: "#d2312b", w: 0.5 });
    reg(hits, foldedBarrier, "open-basin-unbarricaded");
    const laneCones = group(g, -1.6, 0.1, 1.1);
    cone(laneCones, 0, -0.6); cone(laneCones, 0, 0.6);
    holoTag(laneCones, "cones — lane", 0, 0.8, 0, { css: "#3f9f8a", w: 0.28 });
    reg(hits, laneCones, "cone-lane");
    const washHose = hose(g, [[0.4, 0.14, 1.8], [-0.2, 0.14, 1.9], [-0.6, 0.14, 1.3]], 0.02, 0x2f6f4a, { steps: 10, rough: 0.75 });
    holoTag(g, "wash it down the drain?", 0.0, 0.42, 1.9, { css: "#d2312b", w: 0.48 });
    reg(hits, washHose, "hose-into-basin");

    // --------------------------------------------------------- the separator
    const sep = group(g, 1.6, 0.1, -1.1);
    for (const sx of [-0.7, 0.7]) box(sep, 0.3, 0.3, 0.8, sx, 0.15, 0, 0x3a4148, { rough: 0.6, metal: 0.4 });
    const tank = cyl(sep, 0.42, 0.42, 2.2, 0, 0.7, 0, 0x8b98a5, { rough: 0.5, metal: 0.5, seg: 20 });
    tank.rotation.z = Math.PI / 2;
    box(sep, 0.5, 0.3, 0.5, 0.9, 1.05, 0, 0x6b7680, { rough: 0.55, metal: 0.4 });
    // Outlet chamber with the sight window, on the east end.
    const chamber = group(sep, 1.35, 0.6, 0);
    box(chamber, 0.5, 0.7, 0.6, 0, 0, 0, 0x6b7680, { rough: 0.55, metal: 0.4 });
    const window_ = box(chamber, 0.02, 0.3, 0.3, 0.26, 0.05, 0, 0x5a7a60, { rough: 0.15, metal: 0.1, emissive: 0x2a4a30, ei: 0.5 });
    const sheen = box(chamber, 0.005, 0.03, 0.26, 0.275, 0.14, 0, 0xa07a30, { rough: 0.1, metal: 0.6, emissive: 0x6a4a10, ei: 0.8 });
    holoTag(sep, "outlet window — watch", 1.35, 1.15, 0.0, { css: "#3f9f8a", w: 0.44 });
    reg(hits, window_, "sheen-window");
    // Outlet pipe to the outfall headwall and its gate.
    const outPipe = cyl(sep, 0.08, 0.08, 1.2, 1.9, 0.35, 0, 0x5b6771, { rough: 0.5, metal: 0.5, seg: 12 });
    outPipe.rotation.z = Math.PI / 2;
    const sepValve = valveWheel(sep, 1.75, 0.5, 0.0, { r: 0.09, color: 0xd2312b, body: 0x2f6f4a });
    holoTag(sep, "outlet valve — turn", 1.75, 1.0, 0.0, { css: "#3f9f8a", w: 0.38 });
    reg(hits, sepValve.userData.wheel, "separator-valve");
    // Interface probe hanging at the oil chamber's inspection port.
    const port = cyl(sep, 0.09, 0.09, 0.14, -0.4, 1.16, 0, 0x3a4148, { rough: 0.5, metal: 0.5, seg: 12 });
    void port;
    const probe = instrument(sep, -0.4, 1.26, 0.0, { idle: "-- mm", color: 0x3f9f8a, w: 0.1, d: 0.12 });
    cyl(sep, 0.008, 0.008, 0.6, -0.4, 0.9, 0.12, 0x1b1e23, { rough: 0.7, seg: 6 });
    holoTag(sep, "interface probe", -0.4, 1.5, 0, { css: "#3f9f8a", w: 0.32 });
    reg(hits, probe, "interface-probe");
    // Outfall headwall and gate at the edge of the apron.
    const headwall = group(g, 2.9, 0.1, -2.5);
    box(headwall, 0.9, 0.7, 0.3, 0, 0.35, 0, 0x6b7680, { rough: 0.9 });
    const gate = box(headwall, 0.4, 0.4, 0.04, 0, 0.7, 0.17, 0xd2312b, { rough: 0.55, metal: 0.4 });
    cyl(headwall, 0.02, 0.02, 0.5, 0, 0.95, 0.17, 0x8a949d, { rough: 0.45, metal: 0.8, seg: 8 });
    const gateWheel = torus(headwall, 0.08, 0.012, 0, 1.22, 0.17, 0xd2312b, { rough: 0.5, metal: 0.4, seg: 6, seg2: 16 });
    gateWheel.rotation.x = Math.PI / 2;
    holoTag(headwall, "outfall gate", 0, 1.45, 0.17, { css: "#3f9f8a", w: 0.28 });
    reg(hits, headwall, "outfall-gate");

    // ------------------------------------------------------- vacuum truck
    const truck = group(g, 1.4, 0.1, 1.9, 0.15);
    box(truck, 1.0, 0.3, 2.6, 0, 0.55, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    box(truck, 0.96, 0.7, 0.8, 0, 1.05, -1.0, 0xd8dde2, { rough: 0.5, metal: 0.3 });
    box(truck, 0.8, 0.3, 0.02, 0, 1.15, -1.41, 0x274a5f, { rough: 0.3, metal: 0.2, cast: false });
    for (const [wx, wz] of [[-0.5, -0.8], [0.5, -0.8], [-0.5, 0.7], [0.5, 0.7]]) cyl(truck, 0.26, 0.26, 0.22, wx, 0.26, wz, 0x14171a, { rough: 0.85, seg: 14 }).rotation.z = Math.PI / 2;
    const vacTank = cyl(truck, 0.45, 0.45, 1.5, 0, 1.15, 0.35, 0x3f7ab8, { rough: 0.45, metal: 0.5, seg: 18 });
    vacTank.rotation.x = Math.PI / 2;
    const sightGlass = box(truck, 0.04, 0.4, 0.1, 0.46, 1.15, 0.6, 0x8fb8d0, { rough: 0.2, metal: 0.1, emissive: 0x3a5a70, ei: 0.4 });
    void sightGlass;
    const pumpLever = group(truck, 0.55, 0.9, -0.3);
    box(pumpLever, 0.16, 0.16, 0.08, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
    cyl(pumpLever, 0.012, 0.012, 0.2, 0, 0.14, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 6 });
    ball(pumpLever, 0.03, 0, 0.25, 0, 0xd2312b, { rough: 0.5, seg: 8 });
    holoTag(truck, "vacuum — hold", 0.55, 1.35, -0.3, { css: "#3f9f8a", w: 0.3 });
    reg(hits, pumpLever, "vac-pump-lever");
    const vacReadout = instrument(truck, 0.55, 0.78, -0.55, { ry: -Math.PI / 2, idle: "-- L/min", color: 0x3f9f8a, w: 0.1, d: 0.1 });
    hose(g, [[1.9, 1.2, 2.6], [2.4, 0.9, 1.0], [1.3, 1.2, -1.0]], 0.035, 0x1b1e23, { steps: 14, rough: 0.75 });
    const newInsert = group(truck, -0.2, 0.75, 1.5);
    box(newInsert, 0.46, 0.3, 0.46, 0, 0, 0, 0x2f6f4a, { rough: 0.7, metal: 0.3 });
    for (const hx of [-0.18, 0.18]) box(newInsert, 0.04, 0.2, 0.04, hx, 0.24, 0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    holoTag(truck, "new insert", -0.2, 1.2, 1.5, { css: "#3f9f8a", w: 0.26 });
    reg(hits, newInsert, "new-insert");

    // ------------------------------------------------- reach stacker, parked
    const stacker = group(g, -1.9, 0.1, -2.6, 0.3);
    box(stacker, 1.4, 0.5, 2.4, 0, 0.6, 0, 0xe8b02e, { rough: 0.55, metal: 0.35 });
    box(stacker, 0.9, 0.7, 0.7, -0.2, 1.2, 0.6, 0x2b3138, { rough: 0.5, metal: 0.4 });
    box(stacker, 0.7, 0.4, 0.02, -0.2, 1.3, 0.96, 0x274a5f, { rough: 0.3, metal: 0.2, cast: false });
    for (const [wx, wz] of [[-0.7, -0.8], [0.7, -0.8], [-0.7, 0.8], [0.7, 0.8]]) cyl(stacker, 0.36, 0.36, 0.3, wx, 0.36, wz, 0x14171a, { rough: 0.85, seg: 14 }).rotation.z = Math.PI / 2;
    const stackBoom = box(stacker, 0.5, 0.4, 3.0, 0.2, 1.4, -0.8, 0xe8b02e, { rough: 0.55, metal: 0.35 });
    stackBoom.rotation.x = -0.5;
    const leak = hose(stacker, [[0.4, 0.5, 1.2], [0.5, 0.35, 1.3], [0.55, 0.2, 1.35]], 0.014, 0x1b1e23, { steps: 8, rough: 0.75 });
    const drip = box(stacker, 0.3, 0.012, 0.2, 0.55, 0.012, 1.45, 0x5a4a20, { rough: 0.1, metal: 0.5, emissive: 0x3a2a08, ei: 0.4, cast: false });
    holoTag(stacker, "hydraulic line", 0.55, 0.9, 1.4, { css: "#3f9f8a", w: 0.3 });
    reg(hits, leak, "leaking-line");
    const drips = particles(stacker, 8, 0x7a6a2a, { size: 0.02, life: 0.8, additive: false, opacity: 0.6 });

    // ------------------------------------------------- spill kits, flag, hustler
    const kitFull = group(g, 2.6, 0.1, 0.4);
    cyl(kitFull, 0.28, 0.28, 0.8, 0, 0.4, 0, 0xe8c14b, { rough: 0.7, seg: 16 });
    cyl(kitFull, 0.29, 0.29, 0.04, 0, 0.82, 0, 0x2b2f34, { rough: 0.6, seg: 16 });
    const kitEmpty = group(g, -2.6, 0.1, -0.4);
    cyl(kitEmpty, 0.28, 0.28, 0.8, 0, 0.4, 0, 0xe8c14b, { rough: 0.7, seg: 16 });
    const emptyLid = cyl(kitEmpty, 0.29, 0.29, 0.04, 0.3, 0.05, 0.25, 0x2b2f34, { rough: 0.6, seg: 16 });
    emptyLid.rotation.x = 0.3;
    holoTag(kitEmpty, "spill kit", 0, 1.05, 0, { css: "#3f9f8a", w: 0.24 });
    holoTag(kitFull, "spill kit", 0, 1.05, 0, { css: "#3f9f8a", w: 0.24 });
    reg(hits, kitEmpty, "empty-spill-kit");
    const flagPost = group(g, -2.3, 0.1, 2.4);
    cyl(flagPost, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const flag = box(flagPost, 0.3, 0.2, 0.02, 0.17, 1.3, 0, 0x59c97b, { rough: 0.7 });
    holoTag(flagPost, "lane gate flag", 0, 1.62, 0, { css: "#3f9f8a", w: 0.3 });
    reg(hits, flagPost, "lane-gate-flag");
    const hustler = group(g, -2.35, 0.1, 4.8);
    box(hustler, 0.9, 0.5, 1.4, 0, 0.45, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    box(hustler, 0.86, 0.6, 0.7, 0, 1.0, -0.3, 0xe8c14b, { rough: 0.5, metal: 0.3 });
    box(hustler, 0.7, 0.3, 0.02, 0, 1.1, -0.66, 0x274a5f, { rough: 0.3, metal: 0.2, cast: false });
    for (const [wx, wz] of [[-0.45, -0.4], [0.45, -0.4], [-0.45, 0.45], [0.45, 0.45]]) cyl(hustler, 0.22, 0.22, 0.2, wx, 0.22, wz, 0x14171a, { rough: 0.85, seg: 12 }).rotation.z = Math.PI / 2;
    box(hustler, 0.9, 0.12, 2.2, 0, 0.55, 1.8, 0x8b98a5, { rough: 0.6, metal: 0.4 });
    hustler.visible = false;
    const hustlerHome = hustler.position.clone();
    // Storm on the horizon.
    const cloud = box(g, 16, 3.0, 2.0, 0, 6.5, -15, 0x1c232b, { rough: 1.0, cast: false, receive: false });
    cloud.visible = false;
    const rainSheet = box(g, 16, 5.0, 0.05, 0, 3.0, -14, 0x6a7a88, { rough: 1.0, opacity: 0.35, transparent: true, cast: false, receive: false });
    rainSheet.visible = false;

    // ------------------------------------------------------- chest and PPE
    const chest = toolChest(g, 0.6, 2.3, { ry: 3.3, color: 0x2f4f6f });
    const bottle = group(chest, -0.12, 0.8, 0.02);
    cyl(bottle, 0.04, 0.04, 0.14, 0, 0, 0, 0xc8b27a, { rough: 0.3, metal: 0.1, opacity: 0.85, transparent: true, seg: 12 });
    cyl(bottle, 0.03, 0.03, 0.03, 0, 0.085, 0, 0x2b2f34, { rough: 0.6, seg: 12 });
    holoTag(chest, "sample bottle + custody form", -0.12, 1.1, 0.02, { css: "#3f9f8a", w: 0.52 });
    reg(hits, bottle, "sample-bottle");
    const radio = instrument(chest, 0.16, 0.79, 0.04, { ry: 0.1, idle: "CH 8 · YARD", color: 0x3f9f8a, w: 0.1, d: 0.16 });
    holoTag(radio, "yard radio", 0, 0.15, 0, { css: "#3f9f8a", w: 0.26 });
    reg(hits, radio, "yard-radio");
    const gloves = group(chest, 0.0, 0.8, -0.15);
    box(gloves, 0.16, 0.05, 0.1, 0, 0, 0, 0x2f6f4a, { rough: 0.8 });
    holoTag(chest, "gloves", 0.0, 1.02, -0.15, { css: "#3f9f8a", w: 0.18 });
    reg(hits, gloves, "nitrile-gloves");
    const goggles = group(chest, 0.2, 0.8, -0.14);
    box(goggles, 0.14, 0.05, 0.06, 0, 0, 0, 0x6a8a9a, { rough: 0.3, metal: 0.1, opacity: 0.7, transparent: true });
    holoTag(chest, "goggles", 0.2, 1.02, -0.02, { css: "#3f9f8a", w: 0.2 });
    reg(hits, goggles, "splash-goggles");
    const vestRack = group(g, 2.0, 0.1, 1.0, -0.5);
    cyl(vestRack, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(vestRack, 0.5, 0.03, 0.03, 0, 1.3, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const vest = group(vestRack, 0.14, 1.05, 0);
    box(vest, 0.26, 0.4, 0.1, 0, 0, 0, 0xfcee21, { rough: 0.8 });
    box(vest, 0.26, 0.05, 0.11, 0, 0.05, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(vestRack, "hi-vis vest", 0.14, 1.5, 0, { css: "#3f9f8a", w: 0.26 });
    reg(hits, vest, "hivis-vest");

    // ------------------------------------------------------------ paperwork
    const board = holoPanel(g, 0.95, 0.62, -1.4, 1.25, 2.4, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3f9f8a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d2f2ea"; cx.fillText("STORMWATER PLAN — DRAINAGE AREA 4", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Basins 4-1 to 4-6 → trench → separator 4 → outfall 4", "Sheen: watch outlet · find source · isolate · pump · sample", "Notify: terminal environmental lead, then per the permit",
       "Storm during response: outfall gate closed on the call", "Sample: method bottle, chain of custody started on site", "Spill kits: 4 stations, stocked per the list"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { ry: 2.8, accent: PTW_ACCENT });
    reg(hits, board, "stormwater-plan-board");
    const logBoard = holoPanel(g, 0.6, 0.42, 2.7, 1.25, -0.9, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3f9f8a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d2f2ea"; cx.fillText("STORMWATER LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Separator 4: SHEEN — OPEN", "Source: —", "Sample: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -1.3, accent: PTW_ACCENT });
    reg(hits, logBoard, "stormwater-log");

    // ---------------------------------------------------------------- crew
    const crew = standingFigure(g, 0.3, -0.7, { ry: 2.2, cloth: 0x1f3a52, vest: 0xfcee21, helmet: 0xe8b02e, gloves: true, glasses: true });
    holoTag(crew, "stormwater crew", 0, 1.9, 0, { css: "#3f9f8a", w: 0.34 });
    const operator = standingFigure(g, 2.7, 2.6, { ry: -2.6, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0x1b1e22 });
    holoTag(operator, "vac truck operator", 0, 1.9, 0, { css: "#3f9f8a", w: 0.38 });
    barrierPanel(g, 0.0, -2.5, { color: 0xf2c14b, ry: 0 });

    const flagStop = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4, rough: 0.7 });
    let leaking = true;
    let sheenOn = true;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.6, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "open-basin") { oldInsert.position.set(0.9, 0.15, 0.5); }
        if (step.id === "set-insert") { newInsert.visible = false; oldInsert.visible = false; setInsert.visible = true; }
        if (step.id === "trace-source") { leaking = false; drip.material = mat(0x3a4148, { rough: 0.9 }); }
        if (step.id === "oil-layer") repaint(probe.userData.screen, signFace("READ", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "vac-pumpout") { sheenOn = false; sheen.visible = false; repaint(vacReadout.userData.screen, signFace("PUMPED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 })); }
        if (step.id === "spill-kit-walk") { emptyLid.rotation.x = 0; emptyLid.position.set(0, 0.82, 0); }
        if (step.id === "stormwater-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#d2f2ea"; cx.fillText("STORMWATER LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#bfeaf7";
            ["Separator 4: pumped · outfall held · CLOSED", "Source: stacker 31 hydraulic line — tagged out", "Sample: in custody · notifications made"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("LANE BACK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "hustler-basin-lane") { hustler.visible = true; hustler.position.set(-2.35, 0.1, 1.6); }
        if (it.id === "storm-cell-outfall") { cloud.visible = true; rainSheet.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hustler-basin-lane") { hustler.position.copy(hustlerHome); hustler.visible = false; flag.material = flagStop; }
        if (it.id === "storm-cell-outfall") { gate.position.y = 0.35; gateWheel.rotation.z = Math.PI; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "isolate-separator") sepValve.userData.wheel.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "oil-layer") repaint(probe.userData.screen, signFace(`${Math.round(gg.t * 300)} mm`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "vac-pumpout" && session.holding) {
          const v = session.track.v;
          repaint(vacReadout.userData.screen, signFace(`${Math.round(v * 600)} L/min`, { bg: "#0d1c24", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (sheenOn) sheen.position.z = Math.sin(t * 0.8) * 0.02;
        drips.visible = leaking;
        if (leaking) drips.userData.step(dt, new THREE.Vector3(0.55, 0.3, 1.35), 0.02, 0.05, -0.8);
        if (rainSheet.visible) rainSheet.position.y = 3.0 + Math.sin(t * 3) * 0.1;
        void CITY;
      },
    };
  },
};
