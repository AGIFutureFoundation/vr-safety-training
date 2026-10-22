import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { stationPad, holoPanel, holoTag, reg, surfaceTexture, texturedMat, waterFace, deckPlateFace, instrument, valveWheel, standingFigure } from "../citykit.js";
import { skiff } from "../../../shared/fleet.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Eelgrass Seed Collection & Nursery VR — Marine Ecology &
// Restoration, station three of the ECO1 pack.
//
// Two places in one morning: a skiff drifting along the edge of a
// flowering eelgrass bed while a technician snips reproductive shoots into
// mesh bags to the collecting permit's share, and the shore nursery where
// the bags hang in flow-through tanks until the seeds drop, are sieved,
// and go into dark cold storage. The learner is the nursery technician; a
// skiff tender runs the boat. This teaches the seed METHOD — what is cut,
// how it is kept wet and cool, how a bag keeps its identity to the tank and
// the jar — and asserts nothing about any bed, season or yield.

const MESN_ACCENT = 0x3fae8f;
const MESN_CSS = "#3fae8f";
const MESN_WARN = "#e8622a";

function mesnShoot(parent, x, z, h, seed, flowering) {
  const g = group(parent, x, 0, z, seed);
  for (let i = 0; i < 2; i++) {
    const b = cyl(g, 0.005, 0.008, h, 0.02 * (i - 0.5), h / 2, 0.01 * i, flowering ? 0x6b8f3a : 0x2f7a5f, { rough: 0.9, seg: 4, cast: false });
    b.rotation.z = 0.12 * (i - 0.5);
  }
  if (flowering) for (let i = 0; i < 2; i++) ball(g, 0.012, 0.02 * (i - 1), h * 0.7 + i * 0.05, 0.02, 0xc9c25a, { rough: 0.8, seg: 5, seg2: 4, cast: false });
  return g;
}

export const SIM_ME_EELGRASS_SEED_COLLECTION_AND_NURSERY = {
  id: "me-eelgrass-seed-collection-and-nursery",
  index: "603",
  domain: "Environmental",
  trade: "Nursery technician on a seagrass restoration crew, collecting flowering shoots from a skiff and running the shore nursery's flow-through tanks",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "AFSCME and LIUNA restoration and nursery crews as training bodies; OSHA 29 CFR 1910.132 personal protective equipment for work over the side and in the nursery; CDFW oversight of the collecting permit's share and handling; NOAA Fisheries and the U.S. Fish and Wildlife Service consultation measures for in-water work at the bed; BCDC permit conditions; Regional Water Quality Control Board Section 401 conditions on the nursery's discharge and the Section 404 record the planting will answer to",
  name: "Eelgrass Seed Collection & Nursery",
  title: simTitle("Eelgrass Seed Collection & Nursery"),
  tagline: "The collecting permit read, the share meter set, the kit checked, the first bag cut into the cooler, the skiff drifted along the bed's edge while a bag heats on the thwart, the seeded and the torn bag found, the tank valve opened, bags labelled and hung in order, the sieve held while the flow alarm trips, the tank band read, the seed jar racked in the dark, the tender called and the collection logged",
  accent: MESN_ACCENT,
  accentCss: MESN_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "seed-kept-cold", name: "Seed Kept Cold", note: "Every bag cut to the share, kept wet and cool, hung by its label and its seed racked in the dark — first time" },

  supportLine: "your union hall's member assistance programme — AFSCME or LIUNA, whichever your crew works under — with the employer's employee assistance line behind it",

  game: system({
    name: "Seed Crew",
    currency: "SPATHE",
    ranks: ["Nursery Hand", "Collector", "Nursery Tech", "Seed Lead", "Nursery Certified"],
    badges: [
      { id: "to-the-share", name: "To The Share", note: "The share meter committed inside the permit's band first time", test: AWARD.stepClean("share-meter") },
      { id: "bed-kept", name: "Bed Kept", note: "Never a hazard, never a rhizome pulled", test: AWARD.safe },
      { id: "steady-drift", name: "Steady Drift", note: "The drift and the tank band both read inside the band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-collection", name: "Clean Collection", note: "No corrections from the permit to the log", test: AWARD.clean },
      { id: "sieve-steady", name: "Sieve Steady", note: "The drift and the sieve held without a break", test: AWARD.unbroken },
      { id: "racked-early", name: "Racked Early", note: "Seed racked and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "pull-the-rhizome": "You pulled a flowering shoot up by hand and the rhizome came with it. The permit allows the reproductive shoot to be cut above the sheath, because the rhizome is the plant that will flower again next year; a shoot pulled out roots and all takes next season's seed with this season's, and the bed the nursery exists to expand has just been thinned by the crew collecting from it.",
    "bag-on-the-thwart": "You left a full mesh bag lying on the skiff's thwart in the open while you cut the next one. Shoots out of water heat in minutes under a grey sky as fast as a blue one, and seed that has cooked in a bag will never germinate in the tank — every bag goes into the cooler's seawater the moment it is tied off, and the cooler lid goes down.",
    "motor-over-the-bed": "You had the tender run the outboard across the bed to reach the next patch. A propeller over shallow eelgrass cuts the canopy and scars the rhizome mat, and the permit's condition for working the bed is drift and paddle only: the skiff is walked along the edge on the pole, never driven over it.",
    "tank-to-the-drain": "You pulled the nursery tank's plug to the yard's storm drain to change the water. Tank water carries seed, shoot fragments and whatever the flow-through picked up, and the nursery's Section 401 conditions route it through the settling tank and back to the intake reach, not down a drain that reaches the bay untreated with the nursery's name on it.",
  },

  lateNotes: {
    "mesh-bag": "The bag is cut and filled once the share meter is committed — cutting before the share is set is cutting blind against the permit.",
    "tank-valve": "The tank valve is opened once the collection is in the cooler — flow through an empty tank is an hour of pumping for nothing.",
    "seed-jar": "The jar goes to the dark rack once the tank band is read — seed racked from a tank that ran warm is seed nobody can trust.",
  },

  steps: [
    {
      id: "permit-plan", kind: "select", target: "permit-board",
      title: "Read the collecting permit and the day's plan",
      cue: "Check the bed the permit names, the share of flowering shoots it allows, the cutting method it specifies, how bags are labelled, and the nursery tank each bag goes to.",
      why: "A collecting permit is a set of conditions, not a licence to gather: which bed, what share of the flowering shoots, cut how, kept how, and where the seed goes afterwards. CDFW's oversight of collecting is written into those lines, and NOAA Fisheries' interest in the bed is why the share is small. Reading the permit before the skiff leaves the ramp is how the technician knows what a full day's collection looks like before the first shoot is cut.",
    },
    {
      id: "share-meter", kind: "gauge", target: "share-meter",
      title: "Set and commit the collection share for this bed",
      cue: "Read the share meter against the permit's allowance for this bed and commit it before a bag is opened.",
      why: "The share is set before the first cut because a collector counting shoots as they go always finds one more patch worth taking; the meter committed at the start is the stop the permit asked for, made while the permit is still the loudest voice in the boat. The number is the permit's, not the technician's estimate of how well the bed is doing — the bed's condition is for the monitoring crew's data, not for a collector's judgement over the gunwale.",
      gauge: { label: "COLLECTION SHARE", speed: 0.7, green: [0.3, 0.5], readout: (t) => (t < 0.3 ? "under — bags will be light" : t <= 0.5 ? "the permit's share" : "over the permit's share"), missNote: "Over the permit's share — reset the meter to the allowance before a bag is opened." },
    },
    {
      id: "kit-check", kind: "sequence", anyOrder: true,
      targets: ["shears-check", "bag-labels", "cooler-water"],
      itemNames: { "shears-check": "cutting shears", "bag-labels": "pre-written bag labels", "cooler-water": "cooler filled with bed water" },
      title: "Check the shears, the labels and the cooler",
      cue: "Shears sharp and on their lanyard, the bag labels written for this bed and tank, and the cooler filled from the bed before the first bag goes in.",
      why: "A bag with no label is a bag of seed nobody can trace to a bed or a tank; a cooler filled from the tap is fresh water that kills what it was meant to keep alive; dull shears tear the sheath and pull the shoot. The three are checked at the bed's edge because they are cheap to fix there and ruinous to discover at the nursery — a whole morning's collection that cannot be labelled, or has been sitting in the wrong water for the ride back.",
    },
    {
      id: "cut-and-bag", kind: "drag", target: "mesh-bag",
      title: "Cut the flowering shoots into the bag and into the cooler",
      cue: "Cut each flowering shoot above the sheath with the shears, fill the mesh bag to its mark, tie it off and put it straight into the cooler's water.",
      why: "The cut is above the sheath so the rhizome stays in the bed to flower again, and the bag goes from the water to the cooler without a stop on the thwart, because the shoots begin to heat the moment they leave the bay. The bag's mark is the volume the permit and the tank were planned around; a bag stuffed past it crushes the spathes and drops seed in the skiff instead of the tank.",
      drag: { to: "cooler-socket", radius: 0.5, missNote: "Not in the cooler — a tied bag goes straight into the cooler's water, not onto the thwart." },
    },
    {
      id: "drift-the-edge", kind: "track", target: "drift-pole", seconds: 6,
      title: "Drift the skiff along the bed's edge on the pole",
      cue: "Walk the skiff along the edge with the pole at a pace that keeps the hull over the sand and the collector's reach over the bed — no motor, no drifting onto the canopy.",
      why: "The skiff is kept off the bed on the pole because a hull grounding on the canopy or a propeller turning over it does more harm than the whole collection is worth, and the permit's condition says so. The pace is the collector's: fast enough that the next patch of flowering shoots is in reach when the bag is tied, slow enough that the pole never has to be jabbed into the rhizome mat to stop the boat.",
      track: { start: 0.14, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.12, label: "DRIFT ALONG THE EDGE", readout: (v) => (v < 0.4 ? "stalled — hull settling onto the bed" : v > 0.6 ? "too fast — collector out of reach" : "walking the edge over the sand") },
      holdBreakNote: "The drift broke out of band — the hull settled onto the canopy or ran past the collector's reach. Pole off the edge and take it up again.",
    },
    {
      id: "check-bags", kind: "find", noHint: true,
      targets: ["bag-torn", "shoot-green"],
      itemNames: { "bag-torn": "the mesh bag with a split seam", "shoot-green": "the shoot whose spathes are still closed" },
      itemNotes: {
        "bag-torn": "A bag whose seam has split along one side. Seed will drop through it in the tank and be lost to the sieve; it is double-bagged now, with the same label, before it goes any further.",
        "shoot-green": "A shoot cut with its spathes still tight and green. It will not drop seed in the tank in the time the plan gives; the method is to leave those in the bed and note that the patch was early — it goes on the log, not in the bag.",
      },
      title: "Check the bags in the cooler before the run in",
      cue: "Look through the cooler for a bag that has split and for shoots that were not ready to be cut; fix the bag and note the shoot before leaving the bed.",
      why: "The cooler is the last place the collection can be put right: a split bag double-bagged here keeps its seed and its label, while one found at the nursery has already dropped seed into the cooler water where it belongs to no tank. A shoot cut too early is a lesson for the collector's eye and a note for the log about the bed's timing — the method improves from what is written down, not from what is quietly discarded.",
    },
    {
      id: "open-flow", kind: "turn", target: "tank-valve",
      title: "Open the nursery tank's flow-through valve",
      cue: "Turn the intake valve to the tank's marked flow, watching the overflow weir begin to run before any bag goes in.",
      why: "The tank is flow-through so the water the bags hang in is the bay's own, changed continuously, and the valve is opened to the marked setting rather than full because too much flow tumbles the bags and drops seed early through the mesh onto the tank floor. The weir running is the proof that the tank is exchanging before the collection is trusted to it — a tank that looks full and is not flowing is a tank that will run warm by afternoon.",
      turn: { turns: 0.8, label: "INTAKE VALVE", readout: (t) => (t < 0.3 ? "closed — no exchange" : t < 0.85 ? "opening — weir starting" : "at the marked flow, weir running") },
    },
    {
      id: "hang-bags", kind: "sequence",
      targets: ["tank-label", "tank-hook", "tank-sheet"],
      itemNames: { "tank-label": "bag label read against the tank card", "tank-hook": "bag hung on its numbered hook", "tank-sheet": "hook number and bag written on the tank sheet" },
      title: "Label, hang and record each bag in order",
      cue: "For each bag: read its label against the tank card, hang it on the next numbered hook, then write the hook and the bag on the tank sheet — one bag at a time.",
      why: "The tank sheet is what ties a jar of seed weeks from now back to a bed and a day, and it stays true only if the hook a bag hangs on is written down the moment it is hung. Label first, so the wrong bed's bag is caught before it is in the tank; hook next; sheet last, from what was actually done — a sheet written ahead of the hanging is a sheet that records intentions.",
      outOfOrderNote: "Out of order — read the label, hang the bag, then write the sheet. The sheet records what was hung, not what was about to be.",
    },
    {
      id: "sieve-hold", kind: "hold", target: "sieve-hold", seconds: 5,
      title: "Hold the sieve steady while the settled seed is rinsed",
      cue: "Hold the sieve level in the rinse flow for the full count so the seed stays in the mesh and the debris goes over the lip.",
      why: "Seed that has dropped from the bags lies on the tank floor with sheath fragments and silt, and the sieve separates them only if it is held level and still in a gentle flow: tilted, the seed rides over the lip with the debris; shaken, it bounces through the mesh. Holding for the full count is what a clean jar looks like on the tank side — a hurried rinse is a jar the storage log will later call a poor batch without knowing why.",
      holdBreakNote: "The sieve tilted before the rinse was done — seed would have gone over the lip with the debris. Level it and hold again.",
    },
    {
      id: "tank-band", kind: "gauge", target: "tank-logger",
      title: "Read the tank logger against the nursery's band",
      cue: "Read the tank's temperature logger and commit the reading against the band the nursery plan gives for seed storage.",
      why: "Seed in the tank is alive and its keeping depends on the water staying inside the band the nursery plan sets — a number that lives in the plan, not in the technician's memory of what felt right last year. The logger is read and committed before the seed is jarred so a tank that ran warm is caught as a batch note now rather than as a failed germination test in the spring.",
      gauge: { label: "TANK LOGGER", speed: 0.7, green: [0.36, 0.56], readout: (t) => (t < 0.36 ? "under the band" : t <= 0.56 ? "inside the nursery's band" : "over the band — flow check"), missNote: "Outside the nursery's band — check the flow and the intake before the seed is jarred, and read it again." },
    },
    {
      id: "rack-seed", kind: "drag", target: "seed-jar",
      title: "Rack the labelled seed jar in the dark store",
      cue: "Carry the labelled jar of rinsed seed to the dark storage rack and set it in its numbered slot.",
      why: "Seed keeps in the cold and the dark, and the jar's slot on the rack is the last link in the chain from the bed to the planting crew that will sow it: the label on the jar, the slot on the rack and the line on the storage log all say the same thing. A jar left on the bench in the light for the afternoon is seed whose viability the log can no longer vouch for.",
      drag: { to: "rack-slot", radius: 0.5, missNote: "Not in its slot — the jar goes into the dark rack's numbered slot, not the bench." },
    },
    {
      id: "tender-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the tender and the crew",
      cue: "On the radio: the collection is hung and the seed racked, the tank is flowing and logged, and how the pair is after the bag that heated and the flow alarm.",
      why: "The tender spent the morning holding a skiff off a bed with a pole and the afternoon is somebody else's; the check-in closes the day between the two people who did it and tells the nursery lead what to watch overnight. It is also the crew's own moment — the AFSCME or LIUNA member assistance line is there for whatever a long day over the side leaves behind.",
    },
    {
      id: "collection-log", kind: "select", target: "collection-log",
      title: "Write the collection and nursery log",
      cue: "Log the bed, the share committed, bags cut and hung by hook, the split bag and the early shoot, the valve setting, the logger reading, the jar's slot, and the alarm.",
      why: "The collecting permit and the nursery's Section 401 conditions are both answered from this log, and so is the planting crew's question in the spring about which jar came from which bed on which day. It is written on the tank side while the sheet, the cooler and the rack are all in view, so the record matches the room rather than the memory of it.",
    },
  ],

  interrupts: [
    {
      id: "bag-heating",
      kind: "Bag heating on the thwart",
      after: "drift-the-edge", delay: 2, seconds: 14,
      alert: "The last bag you tied is still lying on the thwart in the open, and the mesh is already dry to the touch.",
      cue: "Get it into the cooler now — lift the lid and put the bag under the water.",
      target: "cooler-lid",
      why: "A bag of flowering shoots dries from the outside in, and the seed inside a spathe that has warmed and dried will not germinate whatever the tank does for it afterwards. The cooler lid is the answer because the cooler is the only cool, dark, wet place in the skiff; the drift can wait the ten seconds it takes, the bag cannot.",
      missNote: "The bag sat in the open for the rest of the drift; by the nursery its shoots were limp and warm, and the whole bag went on the sheet as a loss against the permit's share.",
      wrongNote: "Not that. The cooler lid — the bag goes under the cooler's water before anything else happens.",
    },
    {
      id: "flow-alarm",
      kind: "Flow alarm on the tank",
      after: "sieve-hold", delay: 2, seconds: 14,
      alert: "The tank's flow alarm has sounded — the weir has stopped running and the intake gauge is falling.",
      cue: "Open the bypass so the tank keeps exchanging while the intake is checked — do not leave the bags in still water.",
      target: "bypass-valve",
      why: "A flow-through tank that stops flowing is a tank of bags in a warming bath, and the alarm is fitted because the change is silent — the water looks the same. The bypass keeps the exchange going from the header tank while somebody finds the blocked intake screen; the sieve in hand waits, because rinsed seed on the bench is safe for a minute and hanging bags in still water are not.",
      missNote: "The tank sat still while you finished the rinse; the logger's afternoon trace climbed out of the band and every bag hanging in it got a note on the sheet that the planting crew will read as doubt.",
      wrongNote: "Not that. The bypass valve is what keeps the tank exchanging while the intake is found — open it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, MESN_ACCENT);

    // ------------------------------------------------------- the water and the bed (left half)
    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0f3a3a", mid: "#12504a", base2: "#0b2e2e" }), { repeat: 4, px: 256 });
    const water = box(g, 3.6, 0.03, 5.6, -1.7, 0.012, -0.4, 0x12504a, { cast: false });
    water.material = texturedMat(waterTex, { rough: 0.22, metal: 0.25, color: 0x2c8a7a });
    water.material.transparent = true; water.material.opacity = 0.86;
    const bed = group(g, -2.0, -0.05, -1.4);
    for (let i = 0; i < 22; i++) mesnShoot(bed, (Math.cos(i * 1.9) * 1.1), (Math.sin(i * 1.3) * 0.9), 0.22 + (i % 3) * 0.05, i, i % 3 === 0);
    const rhizomeHit = box(g, 0.4, 0.3, 0.4, -2.6, 0.15, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pull it up by the roots?", -2.6, 0.45, -0.6, { css: MESN_WARN, w: 0.44 });
    reg(hits, rhizomeHit, "pull-the-rhizome");
    const greenShoot = mesnShoot(g, -1.3, -1.9, 0.26, 2, true);
    greenShoot.children.forEach((c) => { if (c.geometry?.type?.includes("Sphere")) c.material = mat(0x4f7a2a, { rough: 0.8 }); });
    holoTag(g, "spathes still closed", -1.3, 0.4, -1.9, { css: MESN_CSS, w: 0.36 });
    reg(hits, greenShoot, "shoot-green");

    // ------------------------------------------------------- the skiff and the collector's kit
    const sk = skiff(g, -1.3, -0.3, 0.9, { ry: Math.PI / 2, livery: { colour: 0xc8ced4, fleetName: "SEED CREW", unitNumber: "SK-4", accent: 0x3fae8f } });
    void sk;
    const tender = standingFigure(g, -2.6, 0.9, { ry: 1.6, cloth: 0x2f4d5f, vest: 0xe8b02e, atStation: true });
    tender.position.y = 0.1;
    const pole = cyl(g, 0.014, 0.014, 2.4, -2.9, 0.9, 0.9, 0xc9b58c, { rough: 0.8, seg: 6 });
    pole.rotation.x = 0.4;
    const driftHit = torus(g, 0.16, 0.01, -2.4, 1.2, 0.9, MESN_ACCENT, { emissive: MESN_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    holoTag(g, "drift the edge — pole", -2.4, 1.42, 0.9, { css: MESN_CSS, w: 0.38 });
    reg(hits, driftHit, "drift-pole");
    const motorHit = box(g, 0.4, 0.4, 0.4, -1.3, 0.6, 2.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "run the motor over the bed?", -1.3, 0.95, 2.1, { css: MESN_WARN, w: 0.5 });
    reg(hits, motorHit, "motor-over-the-bed");
    const cooler = group(g, -0.9, 0.55, 0.6);
    box(cooler, 0.5, 0.36, 0.34, 0, 0.18, 0, 0xe8edf1, { rough: 0.6 });
    box(cooler, 0.44, 0.02, 0.28, 0, 0.3, 0, 0x2f6f6a, { rough: 0.2, metal: 0.3, opacity: 0.8, transparent: true, cast: false });
    const coolerLid = box(cooler, 0.52, 0.05, 0.36, 0, 0.5, -0.15, 0x2b5aa8, { rough: 0.55 });
    coolerLid.rotation.x = -1.2;
    holoTag(cooler, "cooler — bed water", 0, 0.75, 0, { css: MESN_CSS, w: 0.34 });
    reg(hits, cooler, "cooler-socket");
    holoTag(cooler, "cooler lid", 0.3, 0.6, -0.2, { css: "#f06a2b", w: 0.22 });
    reg(hits, coolerLid, "cooler-lid");
    const coolerWater = torus(cooler, 0.12, 0.008, 0, 0.32, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.6, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    coolerWater.rotation.x = Math.PI / 2;
    reg(hits, coolerWater, "cooler-water");
    const bag = group(g, -1.9, 0.45, 0.2);
    const bagMesh = ball(bag, 0.11, 0, 0, 0, 0xdfe6ea, { rough: 0.5, opacity: 0.55, transparent: true, seg: 10, seg2: 8 });
    bagMesh.scale.set(1, 1.4, 1);
    for (let i = 0; i < 4; i++) cyl(bag, 0.004, 0.006, 0.18, (i - 1.5) * 0.03, 0, 0.02, 0x6b8f3a, { rough: 0.9, seg: 4, cast: false });
    box(bag, 0.06, 0.03, 0.004, 0.08, 0.16, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(bag, "mesh bag", 0, 0.3, 0, { css: MESN_CSS, w: 0.2 });
    reg(hits, bag, "mesh-bag");
    const thwartHit = box(g, 0.4, 0.2, 0.3, -0.5, 0.5, 1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "leave the bag on the thwart?", -0.5, 0.8, 1.4, { css: MESN_WARN, w: 0.5 });
    reg(hits, thwartHit, "bag-on-the-thwart");
    const shears = group(g, -0.6, 0.55, 0.1, -0.3);
    box(shears, 0.05, 0.16, 0.02, 0, 0.08, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    box(shears, 0.14, 0.02, 0.02, 0.05, 0.16, 0, 0xf06a2b, { rough: 0.6 });
    holoTag(shears, "shears", 0, 0.32, 0, { css: MESN_CSS, w: 0.18 });
    reg(hits, shears, "shears-check");
    const labels = box(g, 0.1, 0.01, 0.14, -0.6, 0.55, 0.9, 0xf2c14b, { rough: 0.6 });
    holoTag(g, "bag labels", -0.6, 0.75, 0.9, { css: MESN_CSS, w: 0.22 });
    reg(hits, labels, "bag-labels");
    const tornBag = ball(g, 0.1, -0.7, 0.62, 0.35, 0xdfe6ea, { rough: 0.5, opacity: 0.55, transparent: true, seg: 8, seg2: 6 });
    tornBag.scale.set(1, 1.3, 1);
    box(g, 0.02, 0.2, 0.004, -0.62, 0.62, 0.42, 0xd2312b, { rough: 0.6, cast: false });
    holoTag(g, "split seam", -0.7, 0.9, 0.35, { css: MESN_CSS, w: 0.22 });
    reg(hits, tornBag, "bag-torn");
    const shareMeter = instrument(g, -0.2, 0.6, 1.3, { idle: "-- share", color: MESN_ACCENT, w: 0.14, d: 0.2, ry: -0.4 });
    holoTag(g, "share meter — permit", -0.2, 0.85, 1.3, { css: MESN_CSS, w: 0.4 });
    reg(hits, shareMeter, "share-meter");

    // ------------------------------------------------------- the nursery (right half): deck, tank, rack
    const deckTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a3f3a" }), { repeat: 3, px: 256 });
    const deck = box(g, 3.2, 0.06, 5.6, 1.7, 0.0, -0.4, 0x3a3f3a, { cast: false });
    deck.material = texturedMat(deckTex, { rough: 0.85, metal: 0.2, color: 0x6a726a });
    const tank = group(g, 1.6, 0.03, -1.0);
    box(tank, 1.6, 0.7, 0.9, 0, 0.35, 0, 0x2f6f8a, { rough: 0.6 });
    const tankWater = box(tank, 1.5, 0.02, 0.8, 0, 0.66, 0, 0x2f8a7a, { rough: 0.15, metal: 0.3, opacity: 0.8, transparent: true, cast: false });
    void tankWater;
    box(tank, 0.2, 0.08, 0.06, 0.85, 0.66, 0, 0x8a949d, { rough: 0.5, metal: 0.6 }); // weir
    const weirFlow = box(tank, 0.06, 0.2, 0.03, 0.98, 0.55, 0, 0x8ad0c8, { rough: 0.2, opacity: 0.7, transparent: true, cast: false });
    weirFlow.visible = false;
    const hooks = [];
    for (let i = 0; i < 6; i++) {
      const hk = group(tank, -0.6 + i * 0.24, 0.72, 0);
      cyl(hk, 0.006, 0.006, 0.1, 0, 0.05, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 6 });
      box(hk, 0.04, 0.03, 0.004, 0, 0.14, 0, 0xf4f6f6, { rough: 0.6 });
      hooks.push(hk);
    }
    holoTag(tank, "hook 3", -0.12, 0.98, 0, { css: MESN_CSS, w: 0.16 });
    reg(hits, hooks[2], "tank-hook");
    const tankCard = decal(tank, 0.2, 0.14, -0.5, 0.45, 0.46, paperFace("TANK T-2", ["Bed per permit", "Hooks 1–6"], { bg: "#e8eef0", band: MESN_CSS }), { px: 160 });
    reg(hits, tankCard, "tank-label");
    const tankSheet = decal(tank, 0.22, 0.16, 0.5, 0.45, 0.46, paperFace("TANK SHEET", ["Hook · bag", "—"], { bg: "#f4f6f6", band: "#2b8a5a" }), { px: 160 });
    reg(hits, tankSheet, "tank-sheet");
    const drainHit = box(tank, 0.3, 0.2, 0.3, 0.6, 0.1, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(tank, "pull the plug to the storm drain?", 0.6, 0.4, 0.6, { css: MESN_WARN, w: 0.6 });
    reg(hits, drainHit, "tank-to-the-drain");
    // Header pipe, intake valve, bypass valve, alarm lamp.
    cyl(g, 0.03, 0.03, 1.8, 2.7, 0.9, -1.0, 0x4a5c58, { rough: 0.5, metal: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    const valveGrp = group(g, 2.7, 0.9, -0.2);
    const tankValve = valveWheel(valveGrp, 0, 0.1, 0, { r: 0.08, color: 0xe8b02e, body: 0x2b3138 });
    holoTag(valveGrp, "intake valve", 0, 0.34, 0, { css: MESN_CSS, w: 0.26 });
    reg(hits, tankValve.userData.wheel, "tank-valve");
    const bypassGrp = group(g, 2.7, 0.9, -1.8);
    const bypass = valveWheel(bypassGrp, 0, 0.1, 0, { r: 0.07, color: 0xd2312b, body: 0x2b3138 });
    holoTag(bypassGrp, "bypass valve", 0, 0.34, 0, { css: "#d2312b", w: 0.26 });
    reg(hits, bypass.userData.wheel, "bypass-valve");
    const alarmLamp = ball(g, 0.04, 2.7, 1.3, -1.0, 0x3a3f45, { rough: 0.5, seg: 12 });
    const logger = instrument(g, 2.4, 0.76, -0.2, { idle: "-- band", color: MESN_ACCENT, w: 0.13, d: 0.19 });
    holoTag(g, "tank logger", 2.4, 1.0, -0.2, { css: MESN_CSS, w: 0.24 });
    reg(hits, logger, "tank-logger");
    // Sieve bench and rinse.
    const bench = group(g, 0.9, 0, 1.2);
    box(bench, 1.0, 0.5, 0.5, 0, 0.25, 0, 0x6f6248, { rough: 0.8, finish: "brushed" });
    const sieve = group(bench, -0.2, 0.6, 0);
    cyl(sieve, 0.14, 0.14, 0.06, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 18 });
    cyl(sieve, 0.13, 0.13, 0.004, 0, 0.02, 0, 0xc9c25a, { rough: 0.9, seg: 18, cast: false });
    const sieveHold = torus(sieve, 0.18, 0.01, 0, 0.12, 0, MESN_ACCENT, { emissive: MESN_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    sieveHold.rotation.x = Math.PI / 2;
    holoTag(sieve, "hold the sieve level", 0, 0.3, 0, { css: MESN_CSS, w: 0.36 });
    reg(hits, sieveHold, "sieve-hold");
    const jar = group(bench, 0.3, 0.55, 0);
    cyl(jar, 0.06, 0.06, 0.14, 0, 0.07, 0, 0xdfe6ea, { rough: 0.15, opacity: 0.6, transparent: true, seg: 14 });
    cyl(jar, 0.05, 0.05, 0.05, 0, 0.03, 0, 0xc9c25a, { rough: 0.9, seg: 12, cast: false });
    box(jar, 0.05, 0.04, 0.004, 0, 0.08, 0.062, 0xf2c14b, { rough: 0.6 });
    holoTag(jar, "seed jar", 0, 0.28, 0, { css: MESN_CSS, w: 0.2 });
    reg(hits, jar, "seed-jar");
    const rack = group(g, 2.4, 0, 1.4);
    box(rack, 0.7, 1.4, 0.4, 0, 0.7, 0, 0x1b1e22, { rough: 0.7 });
    for (let i = 0; i < 3; i++) box(rack, 0.64, 0.02, 0.36, 0, 0.35 + i * 0.4, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 4; i++) cyl(rack, 0.05, 0.05, 0.12, -0.24 + i * 0.16, 0.42, 0, 0x8aa0a8, { rough: 0.2, opacity: 0.6, transparent: true, seg: 10 });
    const slot = torus(rack, 0.08, 0.008, 0.1, 0.82, 0.1, MESN_ACCENT, { emissive: MESN_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    slot.rotation.x = Math.PI / 2;
    holoTag(rack, "dark rack — slot 7", 0, 1.55, 0, { css: MESN_CSS, w: 0.34 });
    reg(hits, slot, "rack-slot");

    // ------------------------------------------------------- boards, radio, crew
    const permitBoard = holoPanel(g, 0.9, 0.6, 0.2, 1.5, -2.3, (cx, w, h) => {
      cx.fillStyle = "#0b1c1a"; cx.fillRect(0, 0, w, h); cx.fillStyle = MESN_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff5ee"; cx.fillText("COLLECTING PERMIT — FLOWERING SHOOTS", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#e6faf3";
      ["Share: per permit, set on the meter", "Cut above the sheath; drift and pole only", "Bags labelled bed · date · tank",
       "CDFW oversight · NOAA Fisheries · USFWS", "Nursery discharge per Section 401"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.1, accent: MESN_ACCENT });
    reg(hits, permitBoard, "permit-board");
    const logPanel = holoPanel(g, 0.5, 0.32, 1.9, 1.35, 2.3, (cx, w, h) => {
      cx.fillStyle = "#0b1c1a"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#2b8a5a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff5ee"; cx.fillText("COLLECTION + NURSERY LOG", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#e6faf3";
      ["Bed · share · bags · hooks", "Pending"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.45 + i * 0.17)));
    }, { ry: -0.4, accent: 0x2b8a5a });
    reg(hits, logPanel, "collection-log");
    const radioGrp = group(g, 0.4, 0.55, 2.0);
    const rad = radio(radioGrp, 0, 0, 0, {});
    holoTag(radioGrp, "crew radio", 0, 0.28, 0, { css: MESN_CSS, w: 0.24 });
    reg(hits, rad, "crew-radio");
    const lead = standingFigure(g, 2.6, 0.6, { ry: -1.8, cloth: 0x1f5f5a, vest: 0xf2c14b, atStation: true });
    void lead;
    for (let i = 0; i < 6; i++) { const b = ball(g, 0.05, -2.8 + i * 0.4, 2.3 + Math.sin(i) * 0.3, -2.8, 0xdfe6ea, { rough: 0.6, seg: 6, seg2: 5 }); b.scale.set(1.6, 0.6, 0.8); }
    for (let i = 0; i < 6; i++) cyl(g, 0.04, 0.04, 0.5, 0.3 + (i % 3) * 0.3, 0.25, -2.6 + Math.floor(i / 3) * 0.3, 0x2b5aa8, { rough: 0.5, seg: 10 });

    const wmap = water.material.map;
    let drifting = false, alarm = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 0.8, -0.6),
      onStep(step) { if (step?.id === "drift-the-edge") drifting = true; },
      onStepComplete(step) {
        if (step.id === "cut-and-bag") { bag.position.set(-0.9, 0.7, 0.6); bag.scale.set(0.7, 0.7, 0.7); }
        if (step.id === "drift-the-edge") drifting = false;
        if (step.id === "check-bags") { tornBag.scale.set(1.15, 1.45, 1.15); }
        if (step.id === "open-flow") weirFlow.visible = true;
        if (step.id === "hang-bags") { bag.position.set(1.48, 0.55, -1.0); bag.scale.set(0.6, 0.6, 0.6); repaint(tankSheet, paperFace("TANK SHEET", ["Hook 3 · bag B-1", "Hook 4 · bag B-2"], { bg: "#f4f6f6", band: "#2b8a5a" })); }
        if (step.id === "rack-seed") { jar.position.set(1.5, 0.82, 0.2); }
        if (step.id === "tender-checkin") rad.userData.show?.("HUNG · RACKED\nFLOW LOGGED");
        if (step.id === "collection-log") repaint(logPanel.userData.face, (cx, w, h) => {
          cx.fillStyle = "#0b1c1a"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#dff5ee"; cx.fillText("COLLECTION + NURSERY LOG", w * 0.06, h * 0.2);
          cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#e6faf3";
          ["Share set · bags hung 3–4 · jar slot 7", "Split bag · early shoot · flow alarm"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.45 + i * 0.17)));
        });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "bag-heating") { bagMesh.material = mat(0xb8a878, { rough: 0.7, opacity: 0.8, transparent: true }); bag.position.set(-0.5, 0.6, 1.4); }
        if (it.id === "flow-alarm") { alarm = true; weirFlow.visible = false; alarmLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.2, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.id === "bag-heating" && it.resolved === "answered") { bag.position.set(-0.9, 0.7, 0.6); coolerLid.rotation.x = 0; coolerLid.position.set(0, 0.385, 0); bagMesh.material = mat(0xdfe6ea, { rough: 0.5, opacity: 0.55, transparent: true }); }
        if (it.id === "flow-alarm") { alarm = false; if (it.resolved === "answered") { weirFlow.visible = true; alarmLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.4 }); bypass.userData.wheel.rotation.y = 2.0; } }
      },
      animate(t, dt, session) {
        if (wmap?.offset) { wmap.offset.x = t * 0.004; wmap.offset.y = t * 0.006; }
        bed.children.forEach((s, i) => { s.rotation.z = Math.sin(t * 1.1 + i * 0.5) * 0.08; });
        if (drifting) sk.position.z = 0.9 + Math.sin(t * 0.5) * 0.3;
        if (alarm) alarmLamp.visible = Math.sin(t * 8) > 0;
        else alarmLamp.visible = true;
        const step = session?.step;
        if (session?.turn && step?.id === "open-flow") tankValve.userData.wheel.rotation.y = session.turn.amount * 5;
        if (session?.gauge && !session.gauge.committed) {
          const gt = session.gauge.t ?? 0;
          if (step?.id === "share-meter") repaint(shareMeter.userData.screen, signFace(gt < 0.3 ? "under" : gt <= 0.5 ? "permit share" : "over", { bg: "#0d1c24", accent: gt >= 0.3 && gt <= 0.5 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
          if (step?.id === "tank-band") repaint(logger.userData.screen, signFace(gt < 0.36 ? "under band" : gt <= 0.56 ? "in band" : "over band", { bg: "#0d1c24", accent: gt >= 0.36 && gt <= 0.56 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
      },
    };
  },
};
