import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { stationPad, holoPanel, holoTag, reg, surfaceTexture, texturedMat, waterFace, instrument, valveWheel, standingFigure } from "../citykit.js";
import { workboat } from "../../../shared/fleet.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Water Column Sampling From A Small Boat VR — Marine Ecology &
// Restoration, station four of the ECO1 pack.
//
// The afterdeck of a small workboat held on a monitoring station: the
// sampling plan read, the disk lowered until it vanishes, a sampling bottle
// clipped to the line, lowered to the plan's mark, tripped, brought up
// steady, decanted through the rinse-fill-label chain into the cooler, the
// temperature blank read, and the cooler racked under custody. The learner
// is the sampling technician; the skipper holds the boat. What is taught is
// the METHOD that makes a bottle of water evidence — the marks, the rinses,
// the labels, the cold and the custody — and nothing about what the water
// held. Depths are the plan's marks on the line, never a number here.

const MEWC_ACCENT = 0x4fa3c8;
const MEWC_CSS = "#4fa3c8";
const MEWC_WARN = "#e8622a";

function mewcLog(lines, band = MEWC_CSS) {
  return (cx, w, h) => {
    cx.fillStyle = "#0b161c"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#dff0f7"; cx.fillText("STATION LOG + CUSTODY", w * 0.06, h * 0.2);
    cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.45 + i * 0.17)));
  };
}

export const SIM_ME_WATER_COLUMN_SAMPLING_FROM_A_SMALL_BOAT = {
  id: "me-water-column-sampling-from-a-small-boat",
  index: "604",
  domain: "Environmental",
  trade: "Sampling technician on a monitoring crew, working the afterdeck of a small workboat held on station by its skipper",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "AFSCME and LIUNA monitoring crews as training bodies; OSHA 29 CFR 1910.132 personal protective equipment for work over the side; 40 CFR 136 analytical methods and the sample handling they require, under a quality assurance project plan written to EPA QA/G-5; Regional Water Quality Control Board Section 401 monitoring conditions and the Section 404 record the samples answer; BCDC permit conditions; NOAA Fisheries consultation measures for the in-water work the samples watch",
  name: "Water Column Sampling From A Small Boat",
  title: simTitle("Water Column Sampling From A Small Boat"),
  tagline: "The sampling plan read, the vest and gloves on, the disk lowered to its vanishing, the bottle clipped to the line, wound down to the plan's mark, held while the messenger trips and a wake comes through, brought up steady while the line fouls aft, the split seal and the blank label found, rinsed, filled and labelled in order, the blank read, the cooler racked under custody, the skipper called and the station logged",
  accent: MEWC_ACCENT,
  accentCss: MEWC_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "bottle-is-evidence", name: "Bottle Is Evidence", note: "Every bottle rinsed, filled, labelled and cold under custody, and nobody over the rail to get it" },

  supportLine: "your union hall's member assistance programme — AFSCME or LIUNA, whichever your crew works under — with the employer's employee assistance line behind it",

  game: system({
    name: "Sampling Crew",
    currency: "BOTTLE",
    ranks: ["Deck Hand", "Sampler", "Field Sampler", "Sampling Lead", "Custody Certified"],
    badges: [
      { id: "to-the-mark", name: "To The Mark", note: "The bottle wound to the plan's mark first time", test: AWARD.stepClean("lower-to-mark") },
      { id: "inboard", name: "Inboard", note: "Never a hazard, never a hand in the line or a body over the rail", test: AWARD.safe },
      { id: "true-blank", name: "True Blank", note: "The disk and the blank both read inside the band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-station", name: "Clean Station", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "steady-line", name: "Steady Line", note: "The trip held and the retrieve steady the whole way", test: AWARD.unbroken },
      { id: "racked-in-time", name: "Racked In Time", note: "Cooler racked and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "over-the-gunwale": "You leaned out over the open rail gate to reach the bottle instead of bringing it to the gate with the line. The afterdeck is low and wet, the gate is open for the whole cast, and a technician bent over cold water with both hands on a bottle has nothing holding them in the boat but balance — the line brings the bottle to you, and the work vest is the second chance, not the plan.",
    "hand-in-the-line": "You took hold of the sampling line between the block and the winch drum to guide it. A line under a bottle's weight runs through a block with force enough to take fingers into the sheave, and a gust or a wake loads it without warning; the line is handled only outboard of the block, on the bottle side, with the winch stopped.",
    "bottle-in-the-sun": "You set the filled sample bottle on the engine box to fill the next one. Sample water warms fast in a clear bottle on a hot lid, and the plan's holding conditions for the parameters it carries begin the moment it is capped — every filled bottle goes straight into the cooler's ice, and the lid goes down between bottles.",
    "bare-hand-on-the-mouth": "You steadied the sample bottle by its mouth with a bare hand while pouring. Whatever is on a hand — sunscreen, fuel from the winch, the last station's water — is now in the sample, and the laboratory has no way to tell it from the bay; the bottle is held by its body, gloved, and the mouth touches nothing but the decanting spout.",
  },

  lateNotes: {
    "sampling-bottle": "The bottle is clipped once the disk has been read — the transparency reading is taken before the column is disturbed by a cast.",
    "sample-bottle-rinse": "The bottles are filled once the cast is aboard and inspected — a bottle rinsed before the seal is checked is a bottle rinsed twice.",
    "cooler-custody": "The cooler is racked once the blank is read — a cooler racked warm is a custody form with a hole in it.",
  },

  steps: [
    {
      id: "sampling-plan", kind: "select", target: "sampling-plan-board",
      title: "Read the sampling plan for this station",
      cue: "Check the station's position, the marks on the line the plan calls for, the bottles and preservatives per parameter, the holding conditions, and the custody chain to the laboratory.",
      why: "A bottle of bay water is only evidence if it was taken where the plan says, at the mark the plan says, into the bottle the plan says and kept as the plan says until the laboratory signs for it — 40 CFR 136's methods begin on the deck, not at the bench. The plan is read on station because the skipper is holding position on fuel and the skipper's patience, and a technician who finds out at the third bottle that this station wanted a preserved bottle has spent both for nothing.",
    },
    {
      id: "deck-kit", kind: "sequence", anyOrder: true,
      targets: ["vest-on", "nitrile-gloves", "cooler-iced"],
      itemNames: { "vest-on": "work vest zipped", "nitrile-gloves": "clean nitrile gloves", "cooler-iced": "cooler iced and open" },
      title: "Vest, clean gloves and an iced cooler before the gate opens",
      cue: "Work vest zipped before the rail gate is touched, a fresh pair of nitrile gloves from the box, and the cooler iced with its lid ready.",
      why: "The rail gate opens for the cast and stays open until the bottle is aboard, and 29 CFR 1910.132 asks the employer to have thought about exactly this deck: cold water a step away, a technician's hands full and eyes on the line. The gloves are for the sample as much as the hands — a bare thumb on a bottle mouth is a contaminant — and the cooler is iced first because a bottle waiting for ice is a bottle warming.",
    },
    {
      id: "disk-read", kind: "gauge", target: "disk-line",
      title: "Lower the disk and commit the reading where it vanishes",
      cue: "Lower the disk on the shaded side until it disappears, raise it until it just reappears, and commit the mark between the two.",
      why: "The transparency reading is the one measurement that depends entirely on the technician's own eye and is therefore made the same way every time: the shaded side of the boat, no sunglasses, the vanishing and the reappearance averaged. It is taken before the cast because the bottle and the line stir the column the disk is reading, and a reading committed late reads the boat's own disturbance.",
      gauge: { label: "DISK LINE", speed: 0.7, green: [0.4, 0.6], readout: (t) => (t < 0.4 ? "disk still visible" : t <= 0.6 ? "at the vanishing" : "past it — disk long gone"), missNote: "Not at the vanishing — raise the disk until it just shows again and commit between the two marks." },
    },
    {
      id: "clip-bottle", kind: "drag", target: "sampling-bottle",
      title: "Clip the sampling bottle to the line, open and cocked",
      cue: "Open both ends of the sampling bottle, cock the trip, and clip it to the line's snap above the weight.",
      why: "The sampling bottle goes down open so the water at the plan's mark flows through it and closes only when the messenger trips it there; a bottle clipped shut, or clipped below the weight, brings up water from wherever it happened to close. It is clipped to the line's snap inboard, at the gate, with the winch stopped — the line does the reaching over the side, the technician does not.",
      drag: { to: "line-snap", radius: 0.5, missNote: "Not on the line's snap — the bottle clips to the snap above the weight, inboard, before it goes anywhere near the rail." },
    },
    {
      id: "lower-to-mark", kind: "turn", target: "line-winch",
      title: "Wind the bottle down to the plan's mark on the line",
      cue: "Pay the line out on the winch until the plan's coloured mark is at the block — no further, no less.",
      why: "The marks on the line are the plan's depths, measured and taped on the dock so nobody on a moving deck has to count metres of wet line; the mark at the block is what makes this bottle comparable with last month's at the same station. It is wound down, not dropped, because a bottle free-falling through the column trips itself on the jolt and closes on water from the wrong place.",
      turn: { turns: 0.85, label: "LINE WINCH", readout: (t) => (t < 0.35 ? "bottle near the surface" : t < 0.9 ? "paying out — mark coming to the block" : "plan's mark at the block") },
    },
    {
      id: "trip-hold", kind: "hold", target: "line-hold", seconds: 5,
      title: "Hold the line still and send the messenger",
      cue: "Hold the line steady at the mark with the winch locked, drop the messenger, and keep the line still for the full count until you feel the trip.",
      why: "The messenger runs down the line and closes the bottle when it arrives, and it arrives at the right place only if the line is vertical and still: a line swinging or being hauled while the messenger runs trips the bottle on the way down or not at all. The count is felt through the hand on the line, and holding through it is what makes the sample the plan's mark rather than the deck's guess.",
      holdBreakNote: "The line moved before the trip — the messenger would have closed the bottle off the mark. Steady the line and hold again.",
    },
    {
      id: "retrieve-steady", kind: "track", target: "retrieve-crank", seconds: 6,
      title: "Bring the bottle up steady on the winch",
      cue: "Wind the bottle up at a steady rate, watching the line and the block, and stop with the bottle at the gate rather than at the block.",
      why: "The bottle is closed and the water in it is the sample; a retrieve that jerks or races slams the bottle against the hull or two-blocks it into the sheave and opens a seal. Steady is also what the skipper needs to hold station against, and the stop at the gate — never at the block — is what lets the bottle be lifted inboard by its bail with both feet on the deck.",
      track: { start: 0.14, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.12, label: "RETRIEVE RATE", readout: (v) => (v < 0.4 ? "stalled — line slack against the hull" : v > 0.6 ? "racing — two-block coming" : "steady up the column") },
      holdBreakNote: "The retrieve broke rhythm — racing toward the block or slack against the hull. Settle the crank and bring it up steady.",
    },
    {
      id: "inspect-cast", kind: "find", noHint: true,
      targets: ["seal-split", "label-blank"],
      itemNames: { "seal-split": "the sampling bottle's split end seal", "label-blank": "the sample bottle with no station on its label" },
      itemNotes: {
        "seal-split": "The bottle's lower end seal has a split in it, and water is weeping from the end. Whatever it brought up has been mixing with the surface on the way up; this cast is discarded, the seal changed from the kit, and the cast repeated before any bottle is filled.",
        "label-blank": "A sample bottle whose label carries the parameter and the preservative but no station or time. It is filled only once the label is complete — a bottle labelled at the laboratory from memory of which cast it came from is a bottle the custody form cannot vouch for.",
      },
      title: "Inspect the cast and the bottles before decanting",
      cue: "Look over the sampling bottle's seals and the empty sample bottles' labels before a drop of water is poured.",
      why: "The cast is worth nothing if the bottle leaked on the way up, and the sample bottles are worth nothing if their labels do not say where and when; both are cheap to catch on the deck and impossible to recover at the bench. The inspection is a step of its own rather than a glance during the pour because a technician decanting with wet gloves is watching the spout, not the seal.",
    },
    {
      id: "rinse-fill-label", kind: "sequence",
      targets: ["sample-bottle-rinse", "sample-bottle-fill", "sample-bottle-label"],
      itemNames: { "sample-bottle-rinse": "bottle rinsed three times from the cast", "sample-bottle-fill": "bottle filled to the shoulder and capped", "sample-bottle-label": "station, time and initials completed on the label" },
      title: "Rinse, fill and label each sample bottle in order",
      cue: "For each unpreserved bottle: rinse it three times with a little of the cast, fill it to the shoulder and cap it, then complete its label — preserved bottles are filled without the rinse, as the plan says.",
      why: "The rinse takes the bottle's own history off its walls with the sample's own water, so the first thing the laboratory measures is the bay and not the bottle; the fill is to the shoulder so the preserved bottles have room and the unpreserved ones little air; the label is completed last, from the bottle in hand, so the time written is the time the cap went on. The order is the method, and a preserved bottle rinsed by habit has just diluted its preservative.",
      outOfOrderNote: "Out of order — rinse, fill and cap, then complete the label from the bottle in your hand. A label written first records an intention, not a sample.",
    },
    {
      id: "blank-read", kind: "gauge", target: "temperature-blank",
      title: "Read the cooler's temperature blank against the plan's band",
      cue: "Read the temperature blank riding in the cooler's ice and commit it against the holding band the plan gives.",
      why: "The laboratory will read the blank when the cooler arrives and decide from it whether every bottle inside was held cold enough to be trusted; reading it on the deck is how the technician finds out now, with ice still to hand, rather than from a rejection letter. The band is the plan's, written from the methods, and the reading is committed so the custody form carries a number somebody stood behind.",
      gauge: { label: "TEMPERATURE BLANK", speed: 0.7, green: [0.34, 0.54], readout: (t) => (t < 0.34 ? "under — ice on the bottles" : t <= 0.54 ? "inside the holding band" : "over the band — more ice"), missNote: "Outside the holding band — re-ice the cooler and read the blank again before it is sealed." },
    },
    {
      id: "rack-cooler", kind: "drag", target: "cooler-custody",
      title: "Seal the cooler and rack it under custody",
      cue: "Sign the custody form, seal it in its bag on the lid, put the custody tape across the lid, and rack the cooler in the wheelhouse rack.",
      why: "From the moment the tape goes across the lid, the cooler is a sealed record: whoever breaks the tape signs for it, and the form on the lid says who filled it, where and when. It is racked in the wheelhouse rather than left on the afterdeck because the afterdeck is wet, sunny and the place the next cast happens — and the form's chain begins with the cooler being somewhere it cannot be knocked over the side.",
      drag: { to: "custody-rack", radius: 0.55, missNote: "Not in the rack — a sealed cooler goes into the wheelhouse rack under custody, not back on the afterdeck." },
    },
    {
      id: "skipper-checkin", kind: "select", target: "skipper-radio",
      title: "Check in with the skipper before leaving station",
      cue: "On the radio: the station is sampled, racked and logged, the gate is shut, and how the deck is after the wake and the fouled line.",
      why: "The skipper held the boat on station through a wake and a fouled line and cannot see the afterdeck from the wheel; the check-in says the gate is shut and the deck is stowed before the boat moves, and it is the moment the two people on board say how it went. A wake across an open gate is a frightening second, and saying so is part of the job — with the AFSCME or LIUNA member assistance line there for whatever the run home does not settle.",
    },
    {
      id: "station-log", kind: "select", target: "station-log",
      title: "Write the station log and close the custody form",
      cue: "Log the station, the disk reading, the marks sampled, bottles filled by parameter, the split seal and the repeated cast, the blank, the wake and the fouled line, and the cooler's custody number.",
      why: "The station log is what the Regional Water Quality Control Board's monitoring conditions are answered from, and the custody form is what the laboratory's results are attached to; if the two disagree the sample is an orphan. Both are finished on station, while the skipper holds and the deck is in view, because a log written on the run home records the memory of a cast rather than the cast.",
    },
  ],

  interrupts: [
    {
      id: "wake-coming",
      kind: "Wake from a passing vessel",
      after: "trip-hold", delay: 2, seconds: 14,
      alert: "The skipper has called a wake — a vessel has passed close and its wash is a few seconds from the open gate.",
      cue: "Take hold of the grab rail with your free hand and keep your feet inside the gate until the boat settles.",
      target: "grab-rail",
      why: "A wake across a small boat's afterdeck lifts and drops the deck under a technician who is bent over a line at an open gate, and the difference between a stumble and a person in the water is a hand on something solid. The line can stand a second's slack; the grab rail is fitted beside the gate for exactly this call, and the skipper's warning is answered with a hand on it, not with a glance astern.",
      missNote: "The wake came through with both your hands on the line; you went to one knee against the open gate and the messenger's trip was lost in the lurch, so the cast was repeated with a bruised shin and a shaken skipper.",
      wrongNote: "Not that. The grab rail — a hand on it and your feet inside the gate before the wash arrives.",
    },
    {
      id: "line-fouled-aft",
      kind: "Line fouled toward the stern",
      after: "retrieve-steady", delay: 2, seconds: 14,
      alert: "The line has swung aft under the counter as the boat swings — it is leading toward the outboards, not straight down.",
      cue: "Call the skipper to go to neutral now, before the winch pulls the line into the propellers.",
      target: "skipper-radio",
      why: "A sampling line led under the stern of a boat with its engines engaged will find the propellers, and a winch retrieve pulls it there faster; the bottle, the weight and the cast are lost, and a fouled propeller on a boat holding station in wind is the skipper's problem for the rest of the day. The call is made before the line is touched, because the skipper can take the engines out of gear in a second and the technician cannot unfoul a running propeller at all.",
      missNote: "The winch kept pulling and the line found the propeller; the bottle and the weight were cut away, the station's cast was lost, and the boat drifted off station with one engine down while the skipper cleared the shaft.",
      wrongNote: "Not that. The skipper's radio — engines to neutral before the line goes any nearer the stern.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, MEWC_ACCENT);

    // ------------------------------------------------------- the water
    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#12343e", mid: "#174a52", base2: "#0e2a32" }), { repeat: 4, px: 256 });
    const water = box(g, 7.0, 0.03, 6.4, 0, -0.1, -0.6, 0x174a52, { cast: false });
    water.material = texturedMat(waterTex, { rough: 0.22, metal: 0.25, color: 0x3a8a98 });
    water.material.transparent = true; water.material.opacity = 0.88;
    for (let i = 0; i < 8; i++) { const c = box(g, 0.5 + (i % 3) * 0.3, 0.01, 0.06, -3 + i * 0.85, -0.08, -2.6 + (i % 2) * 0.5, 0xdfeef2, { rough: 0.3, opacity: 0.5, transparent: true, cast: false }); c.rotation.y = 0.3; }

    // ------------------------------------------------------- the workboat — the learner stands on its afterdeck
    // Floated by its draft; the afterdeck is the learner's floor, so the boat's
    // deck (y 1.19 in its own frame) is dropped to just above the pad.
    const boatGrp = group(g, 0, -1.15, 0);
    const boat = workboat(boatGrp, 0.2, -0.05, -1.6, { ry: Math.PI, livery: { colour: 0xd9dde0, fleetName: "MONITORING", unitNumber: "WB-6", accent: 0x4fa3c8 } });
    void boat;
    const boatHome = boatGrp.position.clone();
    // Rail gate (open), grab rail, block and winch on the afterdeck.
    const gate = group(g, 1.4, 0.05, 0.6);
    for (const sz of [-0.45, 0.45]) cyl(gate, 0.02, 0.02, 0.8, 0, 0.4, sz, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 8 });
    const gateLeaf = box(gate, 0.03, 0.06, 0.9, -0.25, 0.75, 0, 0xf2c14b, { rough: 0.5, metal: 0.5 });
    gateLeaf.rotation.y = 1.2;
    holoTag(gate, "rail gate — open for the cast", 0, 1.05, 0, { css: MEWC_CSS, w: 0.5 });
    const overHit = box(gate, 0.4, 0.6, 0.5, 0.35, 0.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(gate, "lean out for the bottle?", 0.35, 0.9, 0.3, { css: MEWC_WARN, w: 0.44 });
    reg(hits, overHit, "over-the-gunwale");
    const grab = cyl(g, 0.02, 0.02, 0.9, 1.35, 0.9, -0.3, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 8 });
    grab.rotation.x = Math.PI / 2;
    holoTag(g, "grab rail", 1.35, 1.05, -0.3, { css: "#f2c14b", w: 0.2 });
    reg(hits, grab, "grab-rail");
    // Davit block over the gate, line down to the water.
    const davit = group(g, 1.2, 0.05, 0.0);
    cyl(davit, 0.04, 0.04, 1.8, 0, 0.9, 0, 0x4a5c58, { rough: 0.5, metal: 0.6, seg: 10 });
    const arm = cyl(davit, 0.035, 0.035, 0.9, 0.35, 1.78, 0.3, 0x4a5c58, { rough: 0.5, metal: 0.6, seg: 10 });
    arm.rotation.set(0, 0, -1.2);
    const block = cyl(davit, 0.06, 0.06, 0.05, 0.75, 1.55, 0.55, 0x2b3138, { rough: 0.5, metal: 0.6, seg: 14 });
    block.rotation.x = Math.PI / 2;
    const line = cyl(davit, 0.006, 0.006, 1.7, 0.75, 0.7, 0.6, 0xe8dcb8, { rough: 0.8, seg: 5 });
    for (let i = 0; i < 4; i++) torus(davit, 0.01, 0.004, 0.75, 1.3 - i * 0.28, 0.6, [0xd2312b, 0xf2c14b, 0x2b5aa8, 0x59c97b][i], { rough: 0.6, cast: false, seg: 4, seg2: 8 });
    const lineHit = box(davit, 0.14, 0.5, 0.14, 0.75, 1.05, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(davit, "hold the line still", 0.75, 1.9, 0.6, { css: MEWC_CSS, w: 0.34 });
    reg(hits, lineHit, "line-hold");
    const snap = torus(davit, 0.05, 0.008, 0.75, 0.35, 0.6, MEWC_ACCENT, { emissive: MEWC_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(davit, "line snap", 0.75, 0.5, 0.75, { css: MEWC_CSS, w: 0.2 });
    reg(hits, snap, "line-snap");
    const weight = ball(davit, 0.06, 0.75, 0.05, 0.6, 0x3a3f45, { rough: 0.6, metal: 0.4, seg: 10, seg2: 8 });
    void weight;
    const handHit = box(davit, 0.2, 0.2, 0.2, 0.45, 1.6, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(davit, "hand on the line at the block?", 0.45, 1.85, 0.2, { css: MEWC_WARN, w: 0.54 });
    reg(hits, handHit, "hand-in-the-line");
    const fouled = cyl(g, 0.006, 0.006, 2.2, 1.6, 0.2, 1.4, 0xe8dcb8, { rough: 0.8, seg: 5 });
    fouled.rotation.x = 1.2; fouled.visible = false;
    const wakeCrest = box(g, 3.0, 0.12, 0.3, 2.6, 0.0, 0.6, 0xdfeef2, { rough: 0.3, opacity: 0.7, transparent: true, cast: false });
    wakeCrest.visible = false;
    // Winch on the deck.
    const winchGrp = group(g, 0.6, 0.05, 0.4);
    box(winchGrp, 0.3, 0.25, 0.3, 0, 0.12, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const drum = cyl(winchGrp, 0.1, 0.1, 0.2, 0, 0.3, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 16 });
    drum.rotation.z = Math.PI / 2;
    const winch = valveWheel(winchGrp, 0.2, 0.3, 0, { r: 0.09, color: 0xe8b02e, body: 0x2b3138 });
    holoTag(winchGrp, "line winch", 0, 0.6, 0, { css: MEWC_CSS, w: 0.24 });
    reg(hits, winch.userData.wheel, "line-winch");
    const crank = torus(winchGrp, 0.14, 0.01, -0.2, 0.3, 0, MEWC_ACCENT, { emissive: MEWC_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    crank.rotation.y = Math.PI / 2;
    holoTag(winchGrp, "retrieve — steady", -0.2, 0.55, 0, { css: MEWC_CSS, w: 0.32 });
    reg(hits, crank, "retrieve-crank");
    // Sampling bottle, disk, sample bottles, cooler, bench.
    const sampler = group(g, 0.2, 0.55, 1.2);
    cyl(sampler, 0.06, 0.06, 0.4, 0, 0, 0, 0xdfe6ea, { rough: 0.2, opacity: 0.7, transparent: true, seg: 14 });
    for (const sy of [-0.2, 0.2]) cyl(sampler, 0.07, 0.07, 0.03, 0, sy, 0, 0x2b5aa8, { rough: 0.5, seg: 14 });
    box(sampler, 0.02, 0.5, 0.02, 0.08, 0, 0, 0x8a939b, { rough: 0.4, metal: 0.7 });
    holoTag(sampler, "sampling bottle", 0, 0.34, 0, { css: MEWC_CSS, w: 0.3 });
    reg(hits, sampler, "sampling-bottle");
    const seal = torus(sampler, 0.07, 0.008, 0, -0.22, 0, 0x1b1e22, { rough: 0.6, seg: 5, seg2: 14 });
    reg(hits, seal, "seal-split");
    const messenger = ball(g, 0.04, 0.5, 0.6, 1.1, 0x8a4a2a, { rough: 0.5, metal: 0.6, seg: 10, seg2: 8 });
    void messenger;
    const disk = group(g, -0.5, 0.5, 1.5);
    const diskFace = cyl(disk, 0.12, 0.12, 0.01, 0, 0, 0, 0xf4f6f6, { rough: 0.5, seg: 16 });
    decal(disk, 0.22, 0.22, 0, 0.006, 0, (cx, w, h) => { cx.fillStyle = "#f4f6f6"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#1b1e22"; cx.fillRect(0, 0, w / 2, h / 2); cx.fillRect(w / 2, h / 2, w / 2, h / 2); }, { px: 128 }).rotation.x = -Math.PI / 2;
    cyl(disk, 0.004, 0.004, 0.6, 0, 0.3, 0, 0xe8dcb8, { rough: 0.8, seg: 4 });
    holoTag(disk, "disk line", 0, 0.72, 0, { css: MEWC_CSS, w: 0.2 });
    reg(hits, diskFace, "disk-line");
    const bench = group(g, -1.3, 0.05, 0.5);
    box(bench, 1.2, 0.5, 0.5, 0, 0.25, 0, 0x36474d, { rough: 0.6, metal: 0.25 });
    const bottles = [];
    for (let i = 0; i < 5; i++) {
      const b = group(bench, -0.45 + i * 0.22, 0.55, 0);
      cyl(b, 0.04, 0.04, 0.16, 0, 0.08, 0, [0xdfe6ea, 0x8a6a2a, 0xdfe6ea, 0xdfe6ea, 0x8a6a2a][i], { rough: 0.15, opacity: 0.7, transparent: true, seg: 12 });
      cyl(b, 0.035, 0.035, 0.03, 0, 0.17, 0, 0x1b1e22, { rough: 0.5, seg: 12 });
      box(b, 0.05, 0.05, 0.004, 0, 0.08, 0.042, i === 2 ? 0xf4f6f6 : 0xf2c14b, { rough: 0.6 });
      bottles.push(b);
    }
    holoTag(bench, "sample bottles", 0, 0.9, 0, { css: MEWC_CSS, w: 0.3 });
    reg(hits, bottles[0], "sample-bottle-rinse"); reg(hits, bottles[1], "sample-bottle-fill"); reg(hits, bottles[3], "sample-bottle-label"); reg(hits, bottles[2], "label-blank");
    const mouthHit = box(bench, 0.2, 0.2, 0.2, 0.5, 0.65, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bench, "steady it by the mouth, bare?", 0.5, 0.95, 0.25, { css: MEWC_WARN, w: 0.52 });
    reg(hits, mouthHit, "bare-hand-on-the-mouth");
    const gloves = box(bench, 0.14, 0.08, 0.1, -0.5, 0.55, -0.18, 0x2b5aa8, { rough: 0.7 });
    reg(hits, gloves, "nitrile-gloves");
    const cooler = group(g, -1.0, 0.05, 1.5);
    box(cooler, 0.6, 0.4, 0.4, 0, 0.2, 0, 0xe8edf1, { rough: 0.6 });
    const coolerLid = box(cooler, 0.62, 0.05, 0.42, 0, 0.5, -0.18, 0x2b5aa8, { rough: 0.55 });
    coolerLid.rotation.x = -1.2;
    for (let i = 0; i < 6; i++) ball(cooler, 0.04, -0.2 + (i % 3) * 0.2, 0.42, -0.08 + Math.floor(i / 3) * 0.16, 0xeaf6fb, { rough: 0.3, seg: 6, seg2: 5 });
    holoTag(cooler, "cooler — iced", 0, 0.8, 0, { css: MEWC_CSS, w: 0.26 });
    reg(hits, cooler, "cooler-custody");
    const iceRing = torus(cooler, 0.16, 0.008, 0, 0.44, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.6, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    iceRing.rotation.x = Math.PI / 2;
    reg(hits, iceRing, "cooler-iced");
    const blank = instrument(cooler, 0.2, 0.44, 0.1, { idle: "-- blank", color: MEWC_ACCENT, w: 0.1, d: 0.16 });
    reg(hits, blank, "temperature-blank");
    const sunHit = box(g, 0.4, 0.2, 0.3, 0.6, 0.75, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "set it on the engine box?", 0.6, 1.0, -0.9, { css: MEWC_WARN, w: 0.44 });
    reg(hits, sunHit, "bottle-in-the-sun");
    const vest = box(g, 0.28, 0.34, 0.1, -2.0, 0.85, -0.3, 0xd2312b, { rough: 0.7 });
    holoTag(g, "work vest", -2.0, 1.1, -0.3, { css: MEWC_CSS, w: 0.2 });
    reg(hits, vest, "vest-on");
    // Wheelhouse-side custody rack and radio.
    const rack = group(g, -2.2, 0.05, -1.4);
    box(rack, 0.8, 1.0, 0.5, 0, 0.5, 0, 0x1f2b30, { rough: 0.6, metal: 0.2 });
    box(rack, 0.74, 0.02, 0.46, 0, 0.5, 0, 0x8a939b, { rough: 0.5, metal: 0.5 });
    const rackSlot = torus(rack, 0.22, 0.01, 0, 0.55, 0.05, MEWC_ACCENT, { emissive: MEWC_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    rackSlot.rotation.x = Math.PI / 2;
    holoTag(rack, "custody rack — wheelhouse", 0, 1.2, 0, { css: MEWC_CSS, w: 0.48 });
    reg(hits, rackSlot, "custody-rack");
    const radioGrp = group(g, -1.6, 0.9, -1.6);
    const rad = radio(radioGrp, 0, 0, 0, {});
    holoTag(radioGrp, "skipper radio", 0, 0.28, 0, { css: MEWC_CSS, w: 0.28 });
    reg(hits, rad, "skipper-radio");
    const skipper = standingFigure(g, -0.6, -1.9, { ry: Math.PI, cloth: 0x2f4d5f, vest: 0xe8b02e, atStation: true });
    skipper.position.y = 0.05;
    const planBoard = holoPanel(g, 0.9, 0.6, -2.3, 1.55, 0.6, (cx, w, h) => {
      cx.fillStyle = "#0b161c"; cx.fillRect(0, 0, w, h); cx.fillStyle = MEWC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff0f7"; cx.fillText("SAMPLING PLAN — STATION S-4", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Marks: per plan, taped on the line", "Bottles per parameter · preserved as marked", "Holding: iced, blank in the cooler",
       "40 CFR 136 methods · QA/G-5 plan", "Section 401 monitoring · custody to lab"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.8, accent: MEWC_ACCENT });
    reg(hits, planBoard, "sampling-plan-board");
    const logPanel = holoPanel(g, 0.5, 0.32, -2.4, 1.3, -0.5, mewcLog(["S-4 · disk · marks", "Pending"]), { ry: 0.6, accent: MEWC_ACCENT });
    reg(hits, logPanel, "station-log");
    // A buoy on station and gulls.
    const buoy = group(g, 2.6, -0.1, -2.0);
    cyl(buoy, 0.15, 0.2, 0.5, 0, 0.25, 0, 0xf06a2b, { rough: 0.6, seg: 12 });
    cyl(buoy, 0.02, 0.02, 0.6, 0, 0.8, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 6 });
    for (let i = 0; i < 5; i++) { const b = ball(g, 0.05, -2.6 + i * 0.6, 2.4 + Math.sin(i) * 0.3, -2.8, 0xdfe6ea, { rough: 0.6, seg: 6, seg2: 5 }); b.scale.set(1.6, 0.6, 0.8); }

    const wmap = water.material.map;
    let wake = false, retrieving = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.8, 0.9, 0.4),
      onStep(step) { if (step?.id === "retrieve-steady") retrieving = true; },
      onStepComplete(step) {
        if (step.id === "deck-kit") { coolerLid.rotation.x = -1.2; }
        if (step.id === "clip-bottle") { sampler.position.set(1.95, 0.4, 0.6); sampler.scale.set(0.8, 0.8, 0.8); }
        if (step.id === "lower-to-mark") sampler.position.y = -0.1;
        if (step.id === "retrieve-steady") { retrieving = false; sampler.position.set(1.3, 0.6, 0.8); }
        if (step.id === "inspect-cast") { seal.material = mat(0x59c97b, { rough: 0.6 }); bottles[2].children[2].material = mat(0xf2c14b, { rough: 0.6 }); }
        if (step.id === "rinse-fill-label") for (const b of bottles) b.position.set(b.position.x * 0.4 + 0.3, 0.55, 1.0);
        if (step.id === "rack-cooler") { cooler.position.set(-2.2, 0.6, -1.4); cooler.scale.set(0.8, 0.8, 0.8); coolerLid.rotation.x = 0; coolerLid.position.set(0, 0.42, 0); }
        if (step.id === "skipper-checkin") rad.userData.show?.("S-4 DONE\nGATE SHUT");
        if (step.id === "station-log") repaint(logPanel.userData.face, mewcLog(["S-4 · disk read · 2 marks · 5 bottles", "Seal split, cast repeated · blank in band"], "#59c97b"));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "wake-coming") { wake = true; wakeCrest.visible = true; boatGrp.rotation.z = 0.08; }
        if (it.id === "line-fouled-aft") { fouled.visible = true; line.visible = false; }
      },
      onInterruptEnd(it) {
        if (it.id === "wake-coming") { wake = false; wakeCrest.visible = false; boatGrp.position.copy(boatHome); boatGrp.rotation.z = 0; }
        if (it.id === "line-fouled-aft") { fouled.visible = false; line.visible = true; if (it.resolved === "answered") skipper.rotation.y = Math.PI + 0.6; }
      },
      animate(t, dt, session) {
        if (wmap?.offset) { wmap.offset.x = t * 0.004; wmap.offset.y = t * 0.006; }
        boatGrp.position.y = boatHome.y + Math.sin(t * 0.9) * 0.02;
        if (wake) { boatGrp.rotation.z = Math.sin(t * 4) * 0.08; wakeCrest.position.x -= dt * 1.5; if (wakeCrest.position.x < -3) wakeCrest.position.x = 2.6; }
        if (retrieving) drum.rotation.x += dt * 3;
        buoy.position.y = -0.1 + Math.sin(t * 1.2) * 0.04;
        const step = session?.step;
        if (session?.turn && step?.id === "lower-to-mark") { winch.userData.wheel.rotation.y = session.turn.amount * 5; sampler.position.y = 0.4 - session.turn.amount * 0.5; }
        if (session?.gauge && !session.gauge.committed) {
          const gt = session.gauge.t ?? 0;
          if (step?.id === "disk-read") { disk.position.y = 0.5 - gt * 0.6; diskFace.material = mat(0xf4f6f6, { rough: 0.5, opacity: Math.max(0.1, 1 - gt * 1.4), transparent: true }); }
          if (step?.id === "blank-read") repaint(blank.userData.screen, signFace(gt < 0.34 ? "under" : gt <= 0.54 ? "in band" : "over", { bg: "#0d1c24", accent: gt >= 0.34 && gt <= 0.54 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
      },
    };
  },
};
