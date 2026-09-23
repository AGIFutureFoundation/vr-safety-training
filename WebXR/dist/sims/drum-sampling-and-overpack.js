import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument,
  standingFigure, reg, surfaceTexture, texturedMat, mudflatFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Drum Sampling & Overpack VR — Environmental Monitoring, the
// hazmat and environmental response block.
//
// An abandoned-drum site on a gravel pad inside the exclusion zone: a row of
// unlabelled steel drums on rotten pallets, one bulging, one weeping at its
// bottom chime, a salvage drum and a small gantry hoist staged, a windsock on
// its pole and the decon corridor at the edge of the zone. The learner is the
// LIUNA hazmat laborer or environmental technician in Level B who samples
// the drums and overpacks the leaker, with a buddy in the same protection
// and the site safety officer at decon. The site is generic.

const DSO_ACCENT = 0x78c8a0;
const DSO_CSS = "#78c8a0";

export const SIM_DRUM_SAMPLING_AND_OVERPACK = {
  id: "drum-sampling-and-overpack",
  index: "315",
  domain: "Environmental Monitoring",
  trade: "LIUNA hazmat laborer or environmental technician — drum sampling and overpacking in Level B, with a buddy and the site safety officer at decon",
  category: "Environmental Monitoring",
  weather: "overcast",
  certification: "OSHA 29 CFR 1910.120 HAZWOPER, including its drum and container handling provisions, and 29 CFR 1910.134 for the SCBA; EPA RCRA 40 CFR 261 waste identification and 40 CFR 262 generator marking for the overpack; PHMSA 49 CFR 172 hazard communication for the shipment; EPA QA/G-5 sampling quality practice and chain of custody; NIOSH guidance on chemical protective clothing; LIUNA Training hazardous waste worker courses",
  name: "Drum Sampling & Overpack",
  title: simTitle("Drum Sampling & Overpack"),
  tagline: "Abandoned drums in the exclusion zone: the site safety plan read, Level B on in order, a bulging drum found and left shut, the vapour read, a good drum bonded and its bung cracked with a brass wrench, a full-depth sample drawn while the wind swings round, the jar sealed, a weeping chime found and bermed, the leaker lifted into a salvage drum while a buddy's low-air bell rings, the lid ring torqued, the overpack marked, and the custody form signed",
  accent: DSO_ACCENT,
  accentCss: DSO_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "sampled-and-contained", name: "Sampled and Contained", note: "The bulging drum left for remote opening, the sample drawn full depth and sealed, the wind and the low-air bell both answered, and the leaker overpacked and marked" },

  supportLine: "your LIUNA local's member assistance programme, or the employee assistance line on the site safety plan",

  game: system({
    name: "Drum Crew",
    currency: "DRUM",
    ranks: ["Site Laborer", "Drum Handler", "Sampler", "Drum Crew Lead", "Hazardous Waste Worker Certified"],
    badges: [
      { id: "full-column", name: "Full Column", note: "The sampler held to the bottom long enough to take the whole column", test: AWARD.stepClean("coliwasa") },
      { id: "level-lift", name: "Level Lift", note: "The leaker hoisted into the salvage drum without a swing", test: AWARD.unbroken },
      { id: "no-sparks-no-shortcuts", name: "No Sparks, No Shortcuts", note: "No bulging drum opened, no steel wrench, never downwind, never a drum by hand", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-drum-run", name: "Clean Drum Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "vapour-read-true", name: "Vapour Read True", note: "The monitor reading committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "air-to-spare", name: "Air To Spare", note: "Custody signed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-bulging-drum": "You put the bung wrench on the bulging drum. A drum whose ends have domed is holding pressure — gas off a reacting or decomposing contents — and cracking its bung by hand puts your face at the one opening that pressure has been waiting for. HAZWOPER's drum rules have a drum that may be under pressure opened so that the pressure is relieved safely, from a remote location or behind shielding; this one gets a remote opener or goes into a salvage drum as it is.",
    "steel-bung-wrench": "You picked up the steel bung wrench. Drums of unknown contents are treated as flammable until the monitor says otherwise, and a steel wrench slipping on a steel bung throws exactly the spark that lights a drum's headspace. The non-sparking brass wrench is on the pallet for that reason, and the drum is bonded before either touches it.",
    "stand-downwind": "You stepped round to the downwind side of the drums. Whatever comes out of an opened drum goes where the wind takes it, and on the downwind side it goes through the crew — Level B's SCBA protects your lungs, but the vapour on your suit, the monitor's readings and the next worker's approach all depend on staying upwind of the work. The windsock is read before every move.",
    "lift-drum-by-hand": "You went to tip the drum onto its chime to roll it by hand. A full drum weighs a few hundred kilograms, its rusted chime can split as it tips, and its contents are unknown — rolled by hand, it either crushes a foot, strains a back or splits and empties onto the person rolling it. Drums on this site move on the drum lifter and the hoist, not by hand.",
  },

  lateNotes: {
    "custody-seal": "The custody seal goes on once the jar is filled and capped — there is nothing to seal yet.",
    "lid-ring-bolt": "The lid ring is torqued once the leaking drum is down inside the salvage drum and the lid is on.",
    "custody-form": "The custody form is signed once the sample is sealed and the overpack is marked — it is the last thing.",
  },

  steps: [
    {
      id: "site-plan", kind: "select", target: "hasp-board",
      title: "Read the site safety plan: zones, protection and action levels",
      cue: "Read the site safety plan: the exclusion zone and decon corridor, Level B, the monitor action levels, the buddy system, the emergency signal and the drum handling rules.",
      why: "An abandoned-drum site is a room full of unknowns, and the site-specific safety and health plan HAZWOPER requires is where the unknowns are turned into rules: which zone is which, what protection each needs, the monitor readings at which the crew stops or leaves, who watches whom, and the one signal that means get out. It is read before the suit goes on, because once the facepiece is on, the plan cannot be read — only remembered.",
    },
    {
      id: "level-b", kind: "sequence",
      targets: ["chem-suit", "scba-facepiece"],
      itemNames: { "chem-suit": "chemical-resistant suit, boots and gloves", "scba-facepiece": "SCBA facepiece on and seal checked" },
      outOfOrderNote: "Suit first — the SCBA facepiece goes on last, after the suit, boots and gloves, and its seal is checked before the hood comes up.",
      title: "Put on Level B in order: suit, then the SCBA facepiece",
      cue: "Chemical-resistant suit, boots and gloves on and taped, then the SCBA on, the facepiece sealed and checked, and the hood up — with your buddy checking you.",
      why: "Level B is the protection for an atmosphere nobody has identified yet: supplied air from the SCBA, because a cartridge cannot be chosen for a chemical nobody knows, and a chemical-resistant suit over it. It goes on in order with a buddy checking, because the facepiece seal and the tape at the gloves are the two places it fails, and neither can be seen by the person wearing it. 29 CFR 1910.134 governs the SCBA and its seal check.",
    },
    {
      id: "drum-survey", kind: "find", noHint: true,
      targets: ["bulging-drum"],
      itemNames: { "bulging-drum": "bulging drum — domed ends, fourth in the row" },
      itemNotes: { "bulging-drum": "The fourth drum's top and bottom heads have domed outward, and its bung is crusted — it is holding pressure. It is marked, left shut and kept out of the sampling round until it can be opened remotely or overpacked as it is." },
      title: "Walk the drum row and read every drum before touching any",
      cue: "From upwind, look over each drum: labels, bulging heads, corrosion, crystals round the bung, leaks at the chimes.",
      why: "The drums tell you what they are before you open them, if you look: domed heads mean pressure, crystals round a bung can mean a shock-sensitive residue, rust through a chime means the drum will not survive being moved, and a label or its absence decides what the monitor has to look for. The survey is done upwind, eyes only, before anyone touches a drum, because the drum that should not be opened looks the same as the others to a wrench.",
    },
    {
      id: "vapour-reading", kind: "gauge", target: "pid-monitor",
      title: "Read the vapour at the drums against the action level",
      cue: "Hold the monitor's probe at the drum tops, upwind side first, and commit the reading once it settles against the plan's action level.",
      why: "The photoionisation and flammable-gas readings at the drums are what decide whether sampling goes ahead in Level B or stops for a higher level of protection: a reading over the plan's action level changes the job before anyone opens a bung. The probe is held at the drum tops long enough for the reading to settle, because the monitor responds in seconds, not instantly, and a reading committed on the way up is a number that was never true.",
      gauge: { label: "VOC", speed: 0.7, green: [0.2, 0.38], readout: (t) => `${(t * 50).toFixed(1)} ppm`, missNote: "Not a settled reading below the action level — hold the probe still at the drum top until the number stops moving, then commit." },
    },
    {
      id: "bond-drum", kind: "drag", target: "bond-clamp",
      title: "Bond the drum before its bung is touched",
      cue: "Clamp the bonding cable onto the drum's bare chime, through the paint and rust, with the other end already on the grounding rod.",
      why: "A drum of unknown liquid is treated as flammable, and a drum sitting on a rotten pallet can carry a static charge that discharges as a spark the moment a wrench or a sampling tube touches the bung. The bonding clamp goes on first, biting through paint and rust to bare metal, with the cable already on the ground rod, so that any charge goes to earth through the cable rather than through the headspace.",
      drag: { to: "drum-chime", radius: 0.5, missNote: "Not on the chime — the clamp has to bite bare metal on the drum itself, not the pallet or a painted face." },
    },
    {
      id: "bung-vent", kind: "turn", target: "brass-bung-wrench",
      title: "Crack the bung slowly with the brass wrench",
      cue: "With the non-sparking wrench, crack the bung a quarter turn and let it vent, then open it the rest of the way — face away, never over the opening.",
      why: "Even a drum that is not visibly bulging can hold some pressure, and cracking the bung a little first lets it hiss out before the bung is free — rather than the bung and a jet of contents leaving together. The brass wrench cannot strike a spark on the steel bung, the body stays to the side, and the monitor stays in the other hand, because the first breath of the headspace is the reading that matters.",
      turn: { turns: 1.0, label: "BUNG", readout: (t) => (t < 0.3 ? "cracked — venting" : t < 0.9 ? "opening" : "open") },
    },
    {
      id: "coliwasa", kind: "hold", target: "coliwasa", seconds: 5,
      title: "Draw a full-depth sample with the COLIWASA",
      cue: "Lower the composite liquid waste sampler slowly through the bung to the bottom, close its stopper, and hold while you withdraw it steadily.",
      why: "Drummed liquids separate into layers — a light solvent floating on water, a sludge on the bottom — and a sample from the top is a sample of one layer. The COLIWASA is lowered slowly so it takes the whole column without mixing it, closed at the bottom so the column stays in the tube, and drawn out steadily so nothing drains back. EPA QA/G-5 sampling practice is built on the sample being the thing it claims to be, and this is how a drum's sample becomes that.",
      holdBreakNote: "Pulled the sampler before it was closed and steady — the column drained back into the drum. Lower it again and take the whole depth.",
    },
    {
      id: "sample-seal", kind: "sequence",
      targets: ["sample-jar", "custody-seal"],
      itemNames: { "sample-jar": "sample jar filled, capped and labelled", "custody-seal": "custody seal across the cap" },
      outOfOrderNote: "The jar is filled, capped and labelled first — the custody seal goes across a closed cap, not an open jar.",
      title: "Fill, cap and label the jar, then seal it for custody",
      cue: "Drain the sampler into the jar, cap it, label it with the drum number, then put the custody seal across the cap and into the cooler.",
      why: "A sample is only evidence if nobody could have changed it between the drum and the lab, and the custody seal across the cap is the proof: a broken seal at the lab is a sample that can no longer be relied on. The label ties the jar to the drum it came from, and both go on at the drum, in gloves, because a jar labelled later from memory can be attached to the wrong drum — and the drum's disposal follows the lab result.",
    },
    {
      id: "leak-find", kind: "find", noHint: true,
      targets: ["weeping-chime"],
      itemNames: { "weeping-chime": "weeping bottom chime on the end drum" },
      itemNotes: { "weeping-chime": "The end drum's bottom chime has rusted through and is weeping a dark liquid into the gravel under the pallet. It cannot be moved as it is without splitting further — it goes into a salvage drum where it stands." },
      title: "Find the leaker before it is moved",
      cue: "Look under and around each drum: stains in the gravel, wet chimes, a drum sitting lower on its pallet than the rest.",
      why: "A drum that has rusted through at its chime will split when it is lifted by the chime, and it is the drum most likely to be lifted, because it is the one leaking. Finding the leak before the drum is touched decides how it is handled: contain what is on the ground, then lift the drum straight up into a salvage drum without tipping it, so the leak goes into the overpack rather than onto the crew.",
    },
    {
      id: "spill-contain", kind: "select", target: "absorbent-berm",
      title: "Berm and pad the leak before the lift",
      cue: "Lay the portable berm round the leaking drum and put absorbent pads on the stain, chosen for a liquid you have not identified.",
      why: "HAZWOPER has salvage drums and absorbent kept where drums may leak, and this is why: what has already reached the ground is stopped from spreading while the drum is dealt with, and what drips during the lift lands in the berm rather than in the gravel. The absorbent is the universal kind, because a pad chosen for oil on an acid is a pad that reacts.",
    },
    {
      id: "overpack-lift", kind: "track", target: "hoist-pendant", seconds: 6,
      title: "Lift the leaker into the salvage drum on the hoist",
      cue: "With the drum lifter on, run the gantry hoist slowly and hold the drum level as it rises, swings over and lowers into the salvage drum.",
      why: "A leaking drum is lifted straight up and kept level, because a drum that tips pours from its leak and a drum that swings can strike the salvage drum's rim and split further. The hoist is run slowly on its pendant from outside the load's path, the drum is guided without hands under it, and it is lowered all the way to the salvage drum's bottom before the lifter is released.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "LIFT", readout: (v) => (v < 0.4 ? "stalling — drum swinging" : v > 0.6 ? "too fast — tipping" : "level") },
      holdBreakNote: "The drum swung or tipped on the way over — stop the hoist, let it settle level, then carry on slowly.",
    },
    {
      id: "lid-ring", kind: "turn", target: "lid-ring-bolt",
      title: "Seat the salvage drum's lid and torque the ring",
      cue: "Put the lid on the salvage drum, fit the closing ring and run the ring bolt up to the maker's figure.",
      why: "A salvage drum is only a containment if its lid seals, and the lid seals because the ring is closed to the figure on the drum maker's closure instructions — the same figure the drum was tested to as packaging. A ring left loose weeps the first time the overpack is tipped onto a dolly, and the whole point of the overpack was to stop the weeping.",
      turn: { turns: 1.0, label: "RING", readout: (t) => (t < 0.35 ? "ring on" : t < 0.9 ? "closing" : "at figure") },
    },
    {
      id: "marking", kind: "sequence", anyOrder: true,
      targets: ["salvage-marking", "waste-label"],
      itemNames: { "salvage-marking": "salvage drum marking and the hazard label", "waste-label": "hazardous waste label with the start date" },
      title: "Mark the overpack for storage and for shipment",
      cue: "Mark the overpack as a salvage drum with its hazard label, and put the hazardous waste label on with the accumulation start date.",
      why: "The overpack now holds an unknown waste, and it has to say so to everyone who handles it next. 40 CFR 262 has a generator's hazardous waste container marked with the words, its hazards and the date accumulation began, which starts the clock on how long it may stay on site; the salvage marking and the hazard label under PHMSA's 49 CFR 172 are what the driver and the receiving facility will read. Both go on at the drum, before it moves.",
    },
    {
      id: "custody-log", kind: "select", target: "custody-form",
      title: "Sign the chain-of-custody form and the drum log",
      cue: "Record the sample's drum number, time, sampler and seal on the custody form, and log the bulging drum, the leaker overpacked and the readings.",
      why: "The chain-of-custody form is the sample's passport: every hand it passes through signs it, and the lab will not rely on a sample whose form has a gap. The drum log records what cannot wait for the lab — a bulging drum awaiting remote opening, a leaker in an overpack starting its accumulation clock — and it is written in the contamination reduction zone, from the drum-side notes, not from memory after decon.",
    },
    {
      id: "crew-checkin", kind: "select", target: "site-radio",
      title: "Check in with the site safety officer and your buddy",
      cue: "Call the site safety officer: the drum run is done and you are coming through decon, and check in with your buddy after the low-air bell.",
      why: "The site safety officer tracks every person inside the exclusion zone and their air, and the walk to decon starts on this call. It is also the crew's check-in: a buddy's low-air bell ringing while a drum is on the hoist is the kind of moment that stays with both people, and hazmat crews talk it through after decon — with the member assistance line named for anyone who needs more than the debrief.",
    },
  ],

  interrupts: [
    {
      id: "wind-shift",
      kind: "Wind swinging round onto the crew",
      after: "coliwasa", delay: 2, seconds: 14,
      alert: "The windsock has swung round — the wind is now blowing from the open drum straight across the crew and toward the decon corridor.",
      cue: "Cap the drum, stop sampling and move the crew to the new upwind staging marker.",
      target: "upwind-marker",
      why: "Every position on a drum site is set by the wind — the crew upwind of the work, the decon corridor upwind of the zone — and when it swings, all of it is wrong at once. The sampling stops, the drum is capped and the crew moves to the new upwind side before anything else, because a vapour release travelling through the crew and into decon is how a contained job becomes a site evacuation.",
      missNote: "The crew stayed where they were with the wind across the open drum; the monitor on the buddy's chest went into alarm, vapour drifted into the decon corridor, and the site safety officer called the whole zone out.",
      wrongNote: "The upwind staging marker — the wind has moved, so the crew has to move with it before anything else happens.",
    },
    {
      id: "low-air-bell",
      kind: "Buddy's low-air alarm",
      after: "overpack-lift", delay: 2, seconds: 12,
      alert: "Your buddy's SCBA low-air bell has started ringing — their cylinder is down to its reserve with the drum still on the hoist.",
      cue: "Set the drum down where it is safe and send your buddy to the decon corridor now, escorted.",
      target: "decon-corridor",
      why: "An SCBA's low-air alarm means the reserve is all that is left, and the reserve is sized for getting out through decon, not for finishing the lift. The buddy system HAZWOPER requires is exactly this: the buddy with air sets the load down safely and sends the one without air to decon now, because decon itself takes time and the cylinder does not wait.",
      missNote: "The lift carried on while the bell rang; the buddy's cylinder ran down in the decon line, and the site safety officer had to pull their facepiece in a contaminated corridor.",
      wrongNote: "The decon corridor — the bell is about air, and the only answer to a low cylinder is getting that person out through decon now.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, DSO_ACCENT);

    // --------------------------------------------------------- gravel pad
    const pad = box(g, 6.4, 0.06, 5.0, 0, 0.03, 0, 0xffffff, { rough: 0.98 });
    pad.material = texturedMat(surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#4a4638", base2: "#3c392e", cracks: 20 }), { repeat: 4, px: 512 }), { rough: 0.98, metal: 0.0, color: 0xc0b8a0 });
    // Exclusion zone tape between stakes.
    const tape = group(g, 0, 0, 0);
    const stakes = [[-3.0, -2.4], [3.0, -2.4], [3.0, 0.9], [-3.0, 0.9]];
    for (const [x, z] of stakes) cyl(tape, 0.02, 0.02, 0.9, x, 0.45, z, 0xf2c14b, { rough: 0.6, seg: 6 });
    for (let i = 0; i < 4; i++) {
      const [x0, z0] = stakes[i], [x1, z1] = stakes[(i + 1) % 4];
      hose(tape, [[x0, 0.85, z0], [(x0 + x1) / 2, 0.8, (z0 + z1) / 2], [x1, 0.85, z1]], 0.006, 0xd2312b, { steps: 6, rough: 0.7 });
    }

    // ---------------------------------------------------------- the drums
    const drums = [];
    const DR = 0.29, DH = 0.88;
    for (let i = 0; i < 6; i++) {
      const x = -2.2 + i * 0.72;
      const pallet = group(g, x, 0, -1.3);
      for (let j = 0; j < 3; j++) box(pallet, 0.7, 0.03, 0.12, 0, 0.12, -0.25 + j * 0.25, 0x6b5a3a, { rough: 0.95 });
      for (const sx of [-1, 1]) box(pallet, 0.08, 0.1, 0.7, sx * 0.28, 0.05, 0, 0x5a4a2e, { rough: 0.95 });
      const d = group(pallet, 0, 0.135, 0);
      const colour = [0x2f4f6f, 0x6a3a2a, 0x3a5a3a, 0x4a4a52, 0x6a3a2a, 0x2f4f6f][i];
      const body = cyl(d, DR, DR, DH, 0, DH / 2, 0, colour, { rough: 0.8, metal: 0.4, seg: 20 });
      for (const y of [0.3, 0.6]) torus(d, DR + 0.005, 0.012, 0, y, 0, colour, { rough: 0.8, metal: 0.4, seg: 6, seg2: 24 }).rotation.x = Math.PI / 2;
      cyl(d, 0.035, 0.035, 0.02, 0.14, DH + 0.01, 0, 0x8a8f94, { rough: 0.6, metal: 0.6, seg: 10 });
      drums.push({ pallet, d, body });
    }
    // The bulging one — fourth in the row.
    const bulge = drums[3];
    const domeTop = ball(bulge.d, DR * 0.96, 0, DH - 0.12, 0, 0x4a4a52, { rough: 0.8, metal: 0.4 });
    domeTop.scale.set(1, 0.35, 1);
    reg(hits, bulge.body, "bulging-drum");
    const bulgeBung = box(bulge.d, 0.1, 0.06, 0.1, 0.14, DH + 0.05, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bulge.d, "crack this bung?", 0.1, DH + 0.35, 0.1, { css: "#d2312b", w: 0.34 });
    reg(hits, bulgeBung, "open-bulging-drum");
    // The sampled one — second in the row.
    const good = drums[1];
    const chimeSocket = torus(good.d, DR + 0.02, 0.012, 0, 0.04, 0, DSO_ACCENT, { emissive: DSO_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    chimeSocket.rotation.x = Math.PI / 2;
    holoTag(good.d, "chime — bond here", -0.3, 0.25, 0.3, { css: DSO_CSS, w: 0.34 });
    reg(hits, chimeSocket, "drum-chime");
    const bung = group(good.d, 0.14, DH + 0.02, 0);
    cyl(bung, 0.04, 0.04, 0.03, 0, 0.01, 0, 0xb08a3a, { rough: 0.4, metal: 0.8, seg: 8 });
    const coliwasa = group(good.d, 0.14, DH + 0.05, 0);
    cyl(coliwasa, 0.018, 0.018, 1.1, 0, 0.3, 0, 0xdfeaf0, { rough: 0.15, metal: 0.1, seg: 10, opacity: 0.7 });
    ball(coliwasa, 0.03, 0, 0.87, 0, 0x2b3138, { rough: 0.6 });
    holoTag(coliwasa, "COLIWASA — hold", 0, 1.1, 0, { css: DSO_CSS, w: 0.34 });
    reg(hits, coliwasa, "coliwasa");
    // The leaker — the end drum.
    const leaker = drums[5];
    const weep = group(leaker.pallet, 0.2, 0.0, 0.22);
    const stain = box(weep, 0.5, 0.004, 0.4, 0.05, 0.063, 0.05, 0x14100a, { rough: 0.1, metal: 0.2, cast: false });
    const rustHole = box(weep, 0.08, 0.04, 0.03, -0.02, 0.16, 0.04, 0x6a3a1a, { rough: 0.9 });
    void rustHole;
    reg(hits, weep, "weeping-chime");
    const tipHit = box(drums[4].d, 0.3, 0.2, 0.3, 0, 0.9, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(drums[4].d, "tip it and roll it by hand?", 0, 1.3, 0.2, { css: "#d2312b", w: 0.54 });
    reg(hits, tipHit, "lift-drum-by-hand");
    const berm = group(g, 1.4, 0, -1.3);
    const bermWalls = [];
    for (const [w, d, x, z] of [[1.0, 0.06, 0, -0.5], [1.0, 0.06, 0, 0.5], [0.06, 1.0, -0.5, 0], [0.06, 1.0, 0.5, 0]]) bermWalls.push(box(berm, w, 0.1, d, x, 0.05, z, 0xf2c14b, { rough: 0.7 }));
    for (const b of bermWalls) b.visible = false;
    const bermKit = group(g, 2.4, 0, 0.3, 0.3);
    box(bermKit, 0.5, 0.15, 0.35, 0, 0.075, 0, 0xf2c14b, { rough: 0.7 });
    for (let i = 0; i < 3; i++) box(bermKit, 0.4, 0.02, 0.3, 0, 0.16 + i * 0.022, 0, 0xe8eef2, { rough: 0.95 });
    holoTag(bermKit, "berm + pads", 0, 0.45, 0, { css: DSO_CSS, w: 0.24 });
    reg(hits, bermKit, "absorbent-berm");

    // ------------------------------------------- salvage drum and gantry
    const salvage = group(g, 2.4, 0, -0.55);
    cyl(salvage, 0.36, 0.36, 1.0, 0, 0.5, 0, 0xe8b02e, { rough: 0.7, metal: 0.3, seg: 22 });
    decal(salvage, 0.3, 0.14, 0, 0.6, 0.365, signFace("SALVAGE", { accent: "#111111", fg: "#111111", bg: "#e8b02e", scale: 0.6 }), { px: 128 });
    const lid = cyl(salvage, 0.38, 0.38, 0.03, 0, 1.02, 0, 0xd8a02e, { rough: 0.6, metal: 0.4, seg: 22 });
    lid.visible = false;
    const ringBolt = group(salvage, 0.38, 0.99, 0);
    box(ringBolt, 0.05, 0.06, 0.04, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.8 });
    cyl(ringBolt, 0.01, 0.01, 0.1, 0.05, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(salvage, "lid ring bolt", 0.35, 1.3, 0, { css: DSO_CSS, w: 0.26 });
    reg(hits, ringBolt, "lid-ring-bolt");
    const markHit = box(salvage, 0.32, 0.18, 0.02, 0, 0.6, 0.37, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(salvage, "salvage marking", -0.4, 0.95, 0.3, { css: DSO_CSS, w: 0.3 });
    reg(hits, markHit, "salvage-marking");
    const wasteLabel = decal(salvage, 0.2, 0.2, 0.25, 0.35, 0.27, paperFace("HAZARDOUS WASTE", ["start date", "hazards"], { bg: "#f2e060", band: "#d2312b" }), { px: 128 });
    wasteLabel.rotation.y = 0.75;
    holoTag(salvage, "waste label", 0.45, 0.55, 0.4, { css: DSO_CSS, w: 0.24 });
    reg(hits, wasteLabel, "waste-label");
    const gantry = group(g, 1.95, 0, -0.95);
    for (const [x, z] of [[-0.9, -0.7], [-0.9, 0.7], [0.9, -0.7], [0.9, 0.7]]) {
      const leg = cyl(gantry, 0.03, 0.03, 2.3, x * 0.95, 1.12, z * 0.95, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
      leg.rotation.x = z > 0 ? -0.08 : 0.08;
    }
    for (const x of [-0.85, 0.85]) box(gantry, 0.06, 0.06, 1.3, x, 2.25, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    box(gantry, 1.8, 0.1, 0.1, 0, 2.3, 0, 0xe8b02e, { rough: 0.5, metal: 0.5 });
    const trolley = group(gantry, -0.55, 2.2, -0.35);
    box(trolley, 0.2, 0.16, 0.16, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    const liftChain = cyl(trolley, 0.008, 0.008, 1.0, 0, -0.55, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 6 });
    const clamp = group(trolley, 0, -1.08, 0);
    box(clamp, 0.4, 0.05, 0.05, 0, 0, 0, 0xd2312b, { rough: 0.5, metal: 0.5 });
    for (const sx of [-1, 1]) box(clamp, 0.04, 0.14, 0.04, sx * 0.18, -0.07, 0, 0xd2312b, { rough: 0.5, metal: 0.5 });
    void liftChain;
    const pendant = group(g, 3.0, 0, 0.4, -0.4);
    hose(pendant, [[0, 2.2, -1.2], [0, 1.6, -0.6], [0, 1.1, 0]], 0.008, 0x14171a, { steps: 8 });
    box(pendant, 0.08, 0.2, 0.06, 0, 1.0, 0, 0xe8b02e, { rough: 0.5 });
    for (let i = 0; i < 3; i++) cyl(pendant, 0.012, 0.012, 0.02, 0, 1.05 - i * 0.05, 0.035, [0x3fae6a, 0xd2312b, 0x2b3138][i], { rough: 0.4, seg: 8 }).rotation.x = Math.PI / 2;
    holoTag(pendant, "hoist pendant — hold", 0, 1.35, 0, { css: DSO_CSS, w: 0.38 });
    reg(hits, pendant, "hoist-pendant");

    // ------------------------------------------------- tools and monitors
    const chest = toolChest(g, -1.3, 1.5, { ry: 0.25, color: 0x2f4f6f });
    const pid = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "VOC -- ppm", color: 0xf2c14b, w: 0.12, d: 0.18 });
    holoTag(pid, "PID / LEL monitor", 0, 0.16, 0, { css: DSO_CSS, w: 0.34 });
    reg(hits, pid, "pid-monitor");
    const radio = instrument(chest, 0.16, 0.79, 0.04, { ry: 0.1, idle: "CH 2 · SSO", color: DSO_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "site radio", 0, 0.16, 0, { css: DSO_CSS, w: 0.22 });
    reg(hits, radio, "site-radio");
    const bondReel = group(g, -0.2, 0, -0.35);
    cyl(bondReel, 0.12, 0.12, 0.06, 0, 0.14, 0, 0x2b3138, { rough: 0.6, seg: 14 }).rotation.x = Math.PI / 2;
    const bondClamp = group(g, -0.1, 0.05, -0.2);
    box(bondClamp, 0.12, 0.04, 0.05, 0, 0.02, 0, 0xd2312b, { rough: 0.5, metal: 0.5 });
    box(bondClamp, 0.04, 0.06, 0.05, 0.06, 0.05, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9 });
    holoTag(bondClamp, "bonding clamp", 0, 0.35, 0, { css: DSO_CSS, w: 0.28 });
    reg(hits, bondClamp, "bond-clamp");
    hose(g, [[-0.2, 0.14, -0.35], [-0.6, 0.05, 0.1], [-1.0, 0.05, 0.3], [-1.1, 0.25, 0.35]], 0.006, 0x2f8f3a, { steps: 10 });
    cyl(g, 0.012, 0.012, 0.5, -1.1, 0.25, 0.35, 0xb08a3a, { rough: 0.4, metal: 0.8, seg: 6 });
    const wrenchPallet = group(g, 0.35, 0, -0.35);
    box(wrenchPallet, 0.6, 0.05, 0.3, 0, 0.1, 0, 0x6b5a3a, { rough: 0.95 });
    const brass = group(wrenchPallet, -0.14, 0.14, 0);
    box(brass, 0.26, 0.02, 0.04, 0, 0, 0, 0xc8a040, { rough: 0.35, metal: 0.85 });
    box(brass, 0.06, 0.03, 0.06, 0.12, 0, 0, 0xc8a040, { rough: 0.35, metal: 0.85 });
    holoTag(brass, "brass bung wrench", 0, 0.28, 0, { css: DSO_CSS, w: 0.34 });
    reg(hits, brass, "brass-bung-wrench");
    const steelW = group(wrenchPallet, 0.16, 0.14, 0.02);
    box(steelW, 0.26, 0.02, 0.04, 0, 0, 0, 0x6a7078, { rough: 0.4, metal: 0.9 });
    box(steelW, 0.06, 0.03, 0.06, 0.12, 0, 0, 0x6a7078, { rough: 0.4, metal: 0.9 });
    holoTag(steelW, "steel wrench?", 0.1, 0.42, 0, { css: "#d2312b", w: 0.28 });
    reg(hits, steelW, "steel-bung-wrench");
    const cooler = group(g, -2.0, 0, 0.3, 0.3);
    box(cooler, 0.5, 0.32, 0.34, 0, 0.16, 0, 0x2f7fbf, { rough: 0.6 });
    box(cooler, 0.52, 0.04, 0.36, 0, 0.34, 0, 0xe8eef2, { rough: 0.6 });
    const jar = group(cooler, 0.1, 0.36, 0);
    cyl(jar, 0.04, 0.04, 0.12, 0, 0.06, 0, 0x8a6a3a, { rough: 0.2, metal: 0.1, seg: 12, opacity: 0.85 });
    cyl(jar, 0.042, 0.042, 0.02, 0, 0.13, 0, 0x14171a, { rough: 0.6, seg: 12 });
    holoTag(jar, "sample jar", 0, 0.3, 0, { css: DSO_CSS, w: 0.22 });
    reg(hits, jar, "sample-jar");
    const seal = box(cooler, 0.1, 0.02, 0.05, -0.12, 0.37, 0, 0xe8eef2, { rough: 0.8 });
    holoTag(cooler, "custody seal", -0.2, 0.62, 0, { css: DSO_CSS, w: 0.26 });
    reg(hits, seal, "custody-seal");
    const sealStrip = box(jar, 0.02, 0.1, 0.09, 0, 0.1, 0, 0xd2312b, { rough: 0.8 });
    sealStrip.visible = false;

    // ------------------------------------------- windsock, zones, decon
    const sock = group(g, -2.8, 0, -2.2);
    cyl(sock, 0.025, 0.025, 2.6, 0, 1.3, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const sockBody = group(sock, 0, 2.55, 0);
    const sockCone = cyl(sockBody, 0.04, 0.12, 0.6, 0.3, 0, 0, 0xf28a1c, { rough: 0.8, seg: 12, open: true });
    sockCone.rotation.z = Math.PI / 2;
    sockBody.rotation.y = 0.4;
    const downwind = box(g, 0.8, 0.1, 0.5, -0.8, 0.08, -2.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand downwind of the drums?", -0.8, 0.5, -2.1, { css: "#d2312b", w: 0.56 });
    reg(hits, downwind, "stand-downwind");
    const upwind = group(g, 0.6, 0, 1.3);
    cyl(upwind, 0.02, 0.02, 0.8, 0, 0.4, 0, 0x3fae6a, { rough: 0.5, seg: 6 });
    box(upwind, 0.24, 0.16, 0.01, 0.12, 0.72, 0, 0x3fae6a, { rough: 0.6 });
    upwind.visible = false;
    const upwindHit = torus(g, 0.25, 0.012, 0.6, 0.06, 1.3, DSO_ACCENT, { emissive: DSO_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    upwindHit.rotation.x = Math.PI / 2;
    holoTag(g, "upwind staging marker", 0.6, 0.45, 1.3, { css: DSO_CSS, w: 0.4 });
    reg(hits, upwindHit, "upwind-marker");
    const decon = group(g, 2.9, 0, 1.7, -0.5);
    for (const sx of [-1, 1]) cyl(decon, 0.025, 0.025, 1.9, sx * 0.5, 0.95, 0, 0x3fae6a, { rough: 0.5, seg: 8 });
    box(decon, 1.05, 0.08, 0.05, 0, 1.9, 0, 0x3fae6a, { rough: 0.5 });
    for (let i = 0; i < 2; i++) cyl(decon, 0.35, 0.38, 0.14, 0, 0.07, 0.6 + i * 0.8, 0x2f7fbf, { rough: 0.6, seg: 16 });
    decal(decon, 0.6, 0.14, 0, 1.75, 0.03, signFace("DECON", { accent: "#78c8a0", scale: 0.6 }), { px: 128 });
    holoTag(decon, "decon corridor", 0, 2.15, 0, { css: DSO_CSS, w: 0.3 });
    reg(hits, decon, "decon-corridor");

    // ------------------------------------------------- PPE rack and paper
    const rack = group(g, -2.7, 0, 1.7, 0.6);
    cyl(rack, 0.02, 0.02, 1.5, 0, 0.75, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.6, 0.03, 0.03, 0, 1.45, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const suit = group(rack, -0.16, 1.05, 0.03);
    box(suit, 0.24, 0.6, 0.08, 0, 0, 0, 0xe8d23a, { rough: 0.7 });
    box(suit, 0.1, 0.1, 0.08, 0, 0.36, 0, 0xe8d23a, { rough: 0.7 });
    holoTag(rack, "chemical suit", -0.16, 1.7, 0, { css: DSO_CSS, w: 0.26 });
    reg(hits, suit, "chem-suit");
    const scba = group(rack, 0.2, 1.05, 0.03);
    cyl(scba, 0.07, 0.07, 0.45, 0, 0, -0.03, 0xc0c6cc, { rough: 0.4, metal: 0.6, seg: 12 });
    const face = ball(scba, 0.08, 0, 0.2, 0.08, 0x14171a, { rough: 0.5 });
    face.scale.set(1, 1.2, 0.6);
    holoTag(rack, "SCBA facepiece", 0.24, 1.6, 0, { css: DSO_CSS, w: 0.3 });
    reg(hits, scba, "scba-facepiece");
    const hasp = holoPanel(g, 0.95, 0.66, -2.4, 1.35, -0.5, (cx, w, h) => {
      cx.fillStyle = "#07170f"; cx.fillRect(0, 0, w, h); cx.fillStyle = DSO_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f5e6"; cx.fillText("SITE SAFETY PLAN — DRUM AREA B", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eefaf3";
      ["Exclusion zone taped · decon corridor upwind", "Level B: SCBA + chemical suit · buddy system", "VOC action level: stop and upgrade above it", "Bulging drums: remote opening only",
       "Non-sparking tools · bond before opening", "Signal: three horn blasts = leave the zone"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.9, accent: DSO_ACCENT });
    reg(hits, hasp, "hasp-board");
    const form = holoPanel(g, 0.6, 0.42, 1.5, 1.3, 1.9, (cx, w, h) => {
      cx.fillStyle = "#07170f"; cx.fillRect(0, 0, w, h); cx.fillStyle = DSO_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f5e6"; cx.fillText("CHAIN OF CUSTODY", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eefaf3";
      ["Sample: —", "Drums: —", "Relinquished: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.4, accent: DSO_ACCENT });
    reg(hits, form, "custody-form");

    // ------------------------------------------------------------- crew
    const buddy = standingFigure(g, -0.6, 0.45, { ry: 2.8, cloth: 0xe8d23a, helmet: 0xe8d23a, respirator: true, gloves: 0x2f6f3a, atStation: true });
    holoTag(buddy, "buddy — Level B", 0, 1.95, 0, { css: DSO_CSS, w: 0.32 });
    const bell = ball(buddy, 0.04, 0.12, 1.2, -0.12, 0xd2312b, { emissive: 0xd2312b, ei: 2.5 });
    bell.visible = false;
    const officer = standingFigure(g, 1.2, 2.5, { ry: -2.8, cloth: 0x2b3138, vest: 0x78c8a0, helmet: 0xf2f2f2 });
    holoTag(officer, "site safety officer", 0, 1.95, 0, { css: DSO_CSS, w: 0.36 });
    const buddyHome = buddy.position.clone();

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.7, -1.1),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "drum-survey") domeTop.material = mat(0xd2312b, { emissive: 0x6a1a08, ei: 0.8, rough: 0.7 });
        if (step.id === "vapour-reading") repaint(pid.userData.screen, signFace("BELOW ACTION", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "bond-drum") chimeSocket.visible = false;
        if (step.id === "bung-vent") bung.visible = false;
        if (step.id === "sample-seal") { sealStrip.visible = true; seal.visible = false; }
        if (step.id === "spill-contain") { for (const b of bermWalls) b.visible = true; stain.material = mat(0xe8eef2, { rough: 0.95 }); bermKit.visible = false; }
        if (step.id === "overpack-lift") { leaker.d.visible = false; trolley.position.set(0.45, 2.2, 0.4); }
        if (step.id === "lid-ring") lid.visible = true;
        if (step.id === "custody-log") {
          repaint(form.userData.face, (cx, w, h) => {
            cx.fillStyle = "#07170f"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#d8f5e6"; cx.fillText("CHAIN OF CUSTODY", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Sample: drum 2 · sealed · in cooler", "Drum 4 bulging · drum 6 overpacked", "Relinquished: signed at the CRZ"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("TO DECON", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "wind-shift") { sockBody.rotation.y = 2.6; upwind.visible = true; }
        if (it.id === "low-air-bell") bell.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-shift") buddy.position.set(0.9, 0, 1.25);
        if (it.id === "low-air-bell") { buddy.position.set(2.75, 0, 1.2); bell.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        sockCone.rotation.x = Math.sin(t * 3) * 0.08;
        if (session?.turn && step?.id === "bung-vent") brass.rotation.y = session.turn.amount * Math.PI;
        if (session?.turn && step?.id === "lid-ring") ringBolt.rotation.x = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "vapour-reading") repaint(pid.userData.screen, signFace(`VOC ${(gg.t * 50).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t >= 0.2 && gg.t <= 0.38 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (step?.id === "overpack-lift" && session.holding) {
          const v = session.track.v;
          clamp.rotation.z = (v - 0.5) * 0.4;
        }
        void dt; void CITY; void buddyHome;
      },
    };
  },
};
