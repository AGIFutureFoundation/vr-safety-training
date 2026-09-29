import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, mudflatFace,
} from "../citykit.js";
import { excavator } from "../../../shared/equipment.js";
import { pickup } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bioretention Rain Garden Excavation VR — Bay Program projects
// (console BAYKEEPER, docs/consoles/BAYKEEPER.md).
//
// Green stormwater infrastructure on a city sidewalk: a bioretention cell (a
// rain garden) cut into the planting strip between the kerb and the walk, so
// the street's runoff soaks through engineered soil instead of running
// straight to the storm drain. The learner is the LIUNA laborer crew lead; an
// IUOE Local 3 operating engineer digs with a compact excavator. The job is
// the dig and the fill: the plan and the locate ticket read, the sidewalk
// closed with a detour, the paint checked against the ticket, the marked line
// exposed by vacuum in its tolerance zone, the cut signalled to grade and
// checked on the rod, the gravel, underdrain and soil media placed in order,
// the cleanout capped, the plants set to the plan, the inlet and the edge
// checked, the log written and the crew checked in. Nothing here is a real
// street, and no design dimension or drawdown time is stated as a number —
// those belong to the project's own plans.

const BKRG_ACCENT = 0x6fae4a;

/** Engineered soil media: a sandy loam speckled with compost, on a canvas. */
function bkrgSoilFace(g, w, h) {
  g.fillStyle = "#5a4630"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 700; i++) {
    g.fillStyle = i % 3 ? "rgba(196,170,120,0.35)" : "rgba(40,28,18,0.45)";
    g.fillRect((i * 97) % w, (i * 53) % h, 2 + (i % 3), 2);
  }
}

/** Washed drain rock, round and grey. */
function bkrgGravelFace(g, w, h) {
  g.fillStyle = "#7c7d7a"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    g.fillStyle = i % 2 ? "#9a9b96" : "#5e5f5c";
    g.beginPath(); g.arc((i * 61) % w, (i * 37) % h, 3 + (i % 4), 0, Math.PI * 2); g.fill();
  }
}

export const SIM_BK_BIORETENTION_RAIN_GARDEN_EXCAVATION = {
  id: "bk-bioretention-rain-garden-excavation",
  index: "BK-1",
  domain: "Construction",
  trade: "LIUNA laborer crew lead on a sidewalk bioretention cell, with an IUOE Local 3 operating engineer on the compact excavator",
  category: "Construction & Structural Trades",
  weather: "overcast",
  certification: "LIUNA Training and Education Fund construction craft laborer training for the ground crew; IUOE Local 3 operating engineer apprenticeship for the excavator; OSHA 29 CFR 1926 Subpart P Excavations for the cut, its spoil, its egress and the competent person's inspection; 29 CFR 1926.602 for the earthmoving machine; the California excavation notice law (Government Code 4216, the 811 call) for the locate ticket and the tolerance zone; the MUTCD for the sidewalk closure and the pedestrian detour; ANSI/ISEA 107 high-visibility garments; 29 CFR 1926.21 safety training",
  name: "Bioretention Rain Garden Excavation",
  title: simTitle("Bioretention Rain Garden Excavation"),
  tagline: "A rain garden cut into a city sidewalk: the plan and the locate ticket read, the walk closed with a detour, the paint checked, the marked line exposed by vacuum, the cut signalled to grade and read on the rod, the gravel, underdrain and soil placed in order, the cleanout capped, the plants set, the inlet and the edge checked, logged and the crew checked in",
  accent: BKRG_ACCENT,
  accentCss: "#6fae4a",
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "sponge-in-the-sidewalk", name: "Sponge In The Sidewalk", note: "The cell dug to grade over a located line, layered in order and planted, with the walk kept open for everyone who needed it" },

  supportLine: "your union hall's member assistance programme — LIUNA or IUOE Local 3 — with the employer's employee assistance line behind it",

  game: system({
    name: "Rain Garden Build",
    currency: "CELL",
    ranks: ["Planting Hand", "Pothole Hand", "Grade Checker", "Cell Foreman", "Rain Garden Certified"],
    badges: [
      { id: "ticket-matched", name: "Ticket Matched", note: "The locate ticket read and every mark checked against it before a shovel went in", test: AWARD.all(AWARD.stepClean("work-plan"), AWARD.stepClean("paint-check")) },
      { id: "outside-the-swing", name: "Outside The Swing", note: "Never inside the swing, never spoil on the edge, never down into the cut without the ladder, never the bucket in the tolerance zone", test: AWARD.safe },
      { id: "on-grade", name: "On Grade", note: "The rod and the drawdown gauge both committed inside their bands", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-cell", name: "Clean Cell", note: "No corrections from the plan to the check-in", test: AWARD.clean },
      { id: "steady-signals", name: "Steady Signals", note: "Kept the operator in band for the whole dig", test: AWARD.unbroken },
      { id: "before-the-rain", name: "Before The Rain", note: "Cell logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "swing-radius": "You stepped inside the excavator's swing radius to point at the grade stake. The counterweight of a compact machine swings round behind the operator where the cab cannot see, and 29 CFR 1926.602 practice keeps the ground crew out of that circle entirely. Grade is pointed at from outside the barricaded swing, and the operator stops the house before anyone comes closer.",
    "spoil-at-edge": "You started piling the dug soil right on the lip of the cut. Spoil on the edge is weight on exactly the ground that holds the wall up, and it can roll back in on anyone below; OSHA's excavation rule keeps it at least two feet back from the edge. The spoil goes in the truck or onto the tarp set back on the far side of the walk.",
    "jump-in-cut": "You hopped down into the excavation to clear a root instead of using the ladder. A cut into sidewalk fill has soft walls and sharp edges of old concrete, and a jump down onto uneven ground is how ankles and backs are hurt before the wall ever moves. The ladder goes in first and is the way in and out, and nobody goes in until the competent person has looked at the walls today.",
    "dig-past-marks": "You waved the operator to keep the bucket going inside the tolerance zone of the marked line. Inside that zone the line is found by hand or vacuum, never by the bucket, because the paint shows roughly where a line runs and not how deep. A bucket tooth through a gas service in a sidewalk is a fire in a street full of people.",
  },

  lateNotes: {
    "vac-wand": "Expose the marked line by vacuum only once the paint has been checked against the ticket — potholing the wrong mark proves nothing about the right one.",
    "cleanout-cap": "The cleanout is capped once the underdrain is bedded and the soil media is over it — a cap on a loose pipe just marks where it used to be.",
    "drawdown-gauge": "Read the drawdown once the plants are in and the cell has been test-flooded — before that there is nothing on the gauge to read.",
    "maintenance-log": "The log is written after the final walk — it records the edge and the inlet as well as the dig.",
  },

  steps: [
    {
      id: "work-plan", kind: "select", target: "work-plan",
      title: "Read the cell's plan and the locate ticket",
      cue: "At the board: the cell's outline and layers, the locate ticket's number and its expiry, which utilities answered, the traffic control plan for the walk, and who signals the operator.",
      why: "A rain garden is a hole dug on purpose into the one strip of a street where every utility likes to run, so the plan and the locate ticket are read together before anything else happens. A ticket that has expired, or a utility that never responded, means the marks on the ground cannot be trusted, and the call goes back in rather than the crew guessing. The plan also carries the layers, which cannot be put back in the right order once they are mixed.",
    },
    {
      id: "gear", kind: "sequence", anyOrder: true,
      targets: ["ppe-vest", "ppe-hardhat", "ppe-boots", "ppe-gloves"],
      itemNames: { "ppe-vest": "ANSI/ISEA 107 vest", "ppe-hardhat": "hard hat", "ppe-boots": "safety-toe boots", "ppe-gloves": "work gloves" },
      title: "Gear up for a street job",
      cue: "The high-visibility vest for a crew working beside traffic, the hard hat under the bucket, safety-toe boots for concrete and tools, and gloves for broken edges.",
      why: "The crew works a metre from moving traffic and under a swinging bucket, so being seen and having a hard hat on are the first two controls, not extras. Old sidewalk concrete breaks into slabs with edges like a blade and heavy corners that land on feet, which is what the boots and gloves are for — the injuries on a job like this are usually the ordinary ones, not the dramatic ones.",
    },
    {
      id: "close-walk", kind: "drag", target: "walk-closure",
      title: "Close the sidewalk and open the detour",
      cue: "Carry the SIDEWALK CLOSED sign to its mark at the end of the work zone, where the detour ramp leads people round.",
      why: "The MUTCD treats the sidewalk as a travel lane too: when the work takes it, a closure goes at the point where someone can still choose another route, with a detour that a wheelchair, a stroller or a person who cannot see the cones can actually use. A sign dropped halfway along the work zone leaves people already committed to a walk that ends at an open hole.",
      drag: { to: "closure-mark", radius: 0.5, missNote: "Not on the mark — the closure sign stands where the detour ramp starts, before anyone reaches the cut." },
    },
    {
      id: "paint-check", kind: "find", noHint: true,
      targets: ["paint-faded", "valve-unmarked"],
      itemNames: { "paint-faded": "yellow gas paint washed almost away at the kerb", "valve-unmarked": "a water valve box inside the outline with no blue mark" },
      itemNotes: {
        "paint-faded": "The yellow gas mark has washed nearly off where the run crosses the kerb. Nobody digs off a mark they can barely see: the utility is called back to re-mark before the cut reaches it.",
        "valve-unmarked": "A water valve box sits inside the cell's outline, but no blue paint leads to or from it. A valve box means a pipe, whatever the paint says; the water utility is asked to mark it before the dig goes near.",
      },
      title: "Walk the outline and check every mark against the ticket",
      cue: "Look along the cell's outline: the paint and flags on the ground, the covers and boxes in the walk, and whether each one is on the ticket.",
      why: "Locate marks are the utilities' answer to the ticket, and they can be washed out by rain, missed by a locator or never painted at all. A valve box or a meter lid inside the outline is the street telling you there is a pipe underneath whatever the paint says, and it is found now, on foot, when the answer is a phone call rather than a broken main filling the hole.",
    },
    {
      id: "pothole", kind: "hold", target: "vac-wand",
      seconds: 6,
      title: "Expose the marked gas line by vacuum",
      cue: "In the tolerance zone either side of the yellow mark, hold the vacuum wand steady until the line shows at the bottom of the pothole.",
      why: "Inside the tolerance zone the line is located by hand or by vacuum excavation, so its actual position and depth are seen rather than inferred from paint on the surface. Holding the wand steady and letting the air and suction do the work keeps the nozzle from gouging a plastic service; once the line shows, the operator knows exactly where the bucket must not go.",
      holdBreakNote: "The wand came off before the line showed. Hold it steady in the pothole until the pipe is visible at the bottom.",
    },
    {
      id: "dig-signal", kind: "track", target: "dig-signal", seconds: 7,
      title: "Signal the operator down to grade",
      cue: "From outside the swing, keep the hand signal steady so the bucket takes even bites down toward the grade stake.",
      why: "The operator cannot see the bottom of the cut from the seat, so the ground signaller is their eyes, and one agreed signaller is the rule for a reason — two people waving is no one signalling. Steady signals give steady bites; a hurried wave digs past grade, and over-dug native soil under a rain garden is compacted, loosened ground that changes how the cell drains.",
      track: { start: 0.18, green: [0.4, 0.6], rise: 0.54, fall: 0.44, drift: 0.13, label: "HAND SIGNAL", readout: (v) => (v < 0.4 ? "too slow — the operator is guessing" : v > 0.6 ? "hurried — digging past grade" : "steady — even bites to the stake") },
      holdBreakNote: "The signal went ragged and the operator stopped to guess. Bring it back to steady from outside the swing.",
    },
    {
      id: "grade-check", kind: "gauge", target: "grade-rod",
      title: "Read the bottom of the cut on the grade rod",
      cue: "With the machine stopped and the house swung away, read the rod on the cut's bottom against the grade stake's mark.",
      why: "The plan's layers only fit if the bottom of the cut is where the plan puts it, and the rod read against the stake is the only honest answer. It is read with the machine stopped and the bucket swung away, from the ladder, because standing in a cut beside a working bucket to read a number is exactly the position the swing hazard describes.",
      gauge: { label: "ROD vs STAKE", speed: 0.68, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "high — more to dig" : t <= 0.6 ? "on grade" : "rod not plumb — re-read"), missNote: "Outside the band — plumb the rod on the bottom of the cut and read it against the stake again." },
    },
    {
      id: "layers", kind: "sequence",
      targets: ["gravel-bed", "underdrain-pipe", "soil-media"],
      itemNames: { "gravel-bed": "drain rock bed", "underdrain-pipe": "perforated underdrain on the rock", "soil-media": "engineered soil media over it" },
      title: "Place the layers in the plan's order",
      cue: "Drain rock first, then the perforated underdrain bedded on it, then the engineered soil media over the top.",
      why: "A bioretention cell works because water soaks down through the soil media into the drain rock and the underdrain carries away what the ground cannot take. Put in the wrong order — soil under the rock, or a pipe laid on bare subgrade — the cell ponds on the sidewalk or pipes dirty water straight to the drain, and there is no fixing it without digging it all out again.",
      outOfOrderNote: "Out of order — the drain rock goes down first, the underdrain is bedded on it, and the soil media goes over the top.",
    },
    {
      id: "cap-cleanout", kind: "turn", target: "cleanout-cap",
      title: "Thread the cap onto the underdrain cleanout",
      cue: "Turn the cleanout cap down onto its riser until it seats flush with the finished grade.",
      why: "The cleanout is how the maintenance crew will flush the underdrain for the life of the cell, and an uncapped riser fills with soil and litter on the first storm. Threaded down flush, it stays open for a jetting hose and does not become a trip edge sticking up out of the planting on a sidewalk full of people.",
      turn: { turns: 1.25, label: "CLEANOUT CAP", readout: (t) => (t < 0.3 ? "cross-threaded risk — start square" : t < 0.9 ? "threading down" : "seated flush") },
    },
    {
      id: "planting", kind: "drag", target: "plant-plug",
      title: "Set the plants where the plan puts them",
      cue: "Carry the plug tray to the planting mark in the cell's bottom, where the plan's wetter-tolerant plants go.",
      why: "A rain garden's plants are chosen by where they sit: the bottom floods and dries, the side slopes stay drier, and a plant set in the wrong zone drowns or dries out and leaves bare soil that washes into the underdrain. Setting them where the plan says also keeps the crew's boots off the soil media they have just placed, because trampled media stops soaking.",
      drag: { to: "plant-mark", radius: 0.5, missNote: "Not on the mark — the bottom of the cell takes the plants the plan puts there; set the tray on the planting mark." },
    },
    {
      id: "drawdown", kind: "gauge", target: "drawdown-gauge",
      title: "Read the drawdown gauge after the test flood",
      cue: "After the test flood from the water truck, read the ponding level on the gauge against the plan's drawdown band.",
      why: "The test flood proves the cell drains the way the design intends before it is handed over, and it is read on the gauge rather than judged by eye from the kerb. A cell that holds water too long breeds mosquitoes and kills its plants; one that empties at once means water is short-circuiting down the side of the underdrain and not being treated at all.",
      gauge: { label: "PONDING vs BAND", speed: 0.72, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "reading the kerb, not the water" : t <= 0.58 ? "inside the drawdown band" : "ripple on the gauge — wait"), missNote: "Outside the band — let the water settle on the gauge and read the ponding level again." },
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["edge-open", "inlet-blocked"],
      itemNames: { "edge-open": "a drop from the walk into the cell with no edge", "inlet-blocked": "the kerb-cut inlet clogged with spoil" },
      itemNotes: {
        "edge-open": "One side of the cell drops straight off the walk with nothing to stop a foot or a cane. The plan's kerb edge or a temporary barrier goes in before the walk reopens.",
        "inlet-blocked": "Spoil from the dig has washed into the kerb-cut inlet. A blocked inlet means the street's water runs past the rain garden to the drain; it is cleared by hand before the crew leaves.",
      },
      title: "Walk the finished cell before the sidewalk reopens",
      cue: "Look along the cell's edges where people will walk and at the kerb-cut inlet where the street's water comes in.",
      why: "The finished cell is a planted hole beside a busy walk, and it only opens back to the public once the edges are safe for someone who cannot see them. The inlet is the whole point of the cell: blocked by the job's own spoil, the first storm runs straight past it into the drain the project was built to spare.",
    },
    {
      id: "maintenance-log", kind: "select", target: "maintenance-log",
      title: "Write the installation log",
      cue: "Log the re-marked gas line and the valve box, the pothole, the grade read, the layers placed, the cleanout capped, the plants, the drawdown read, the edge barrier and the inlet cleared, and the pedestrian and the edge crack.",
      why: "The log becomes the cell's first maintenance record, and the crew who will look after it for years start from it: where the gas line actually runs, where the cleanout is, how it drained on day one. Writing down the crack at the edge and the pedestrian at the closure is how the next job's traffic plan and shoring decision get better.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the operator and the crew",
      cue: "On the radio: the walk reopened and the log done, the re-mark request closed, and how the operator and the crew are after a crack at the edge and a close pass by the closure.",
      why: "A wall starting to move and a person squeezing past the cones are both near misses, and the check-in names them while everyone is still together. It also closes the day's open items out loud; the member assistance line is there for anything still sitting with someone once the truck has left.",
    },
  ],

  interrupts: [
    {
      id: "stroller-squeeze",
      kind: "Pedestrian past the closure",
      after: "pothole", delay: 2, seconds: 12,
      alert: "A parent pushing a stroller has come past the SIDEWALK CLOSED sign and is squeezing between the cones and the open pothole.",
      cue: "Stop the vacuum and set the detour ramp so they can go round safely on the ramp.",
      target: "detour-ramp",
      why: "A closure only works if the detour is easier than squeezing past, and the moment someone is in the work zone the work stops, not the person. Setting the detour ramp in front of them gives a level route round the cut that a stroller or a wheelchair can use, which is what the MUTCD's pedestrian provisions ask the traffic control to provide.",
      missNote: "The vacuum kept running while the stroller squeezed by; a wheel dropped into the edge of the pothole and the parent had to wrench it out beside the hose.",
      wrongNote: "The detour ramp — stop, and give them a level way round the cut.",
    },
    {
      id: "edge-crack",
      kind: "Crack at the cut's edge",
      after: "dig-signal", delay: 3, seconds: 12,
      alert: "A crack has opened in the sidewalk slab along the edge of the cut, and a sliver of fill is dropping off the wall.",
      cue: "Give the operator the all-stop signal and keep everyone back from the edge.",
      target: "all-stop",
      why: "A crack running parallel to a cut is the ground telling you the wall is starting to move, and Subpart P expects the competent person to stop the work and get people clear when they see signs of a possible cave-in. The machine's weight and vibration are part of what is loading that edge, so stopping the bucket is the first control, before anyone decides on shoring or a flatter slope.",
      missNote: "The bucket kept biting beside the crack; the slab edge broke off and slid into the cut, taking the grade stake with it.",
      wrongNote: "The all-stop signal — stop the machine first, then keep everyone back from the edge.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, BKRG_ACCENT);

    // ---------------------------------------------- street, kerb and walk
    const street = box(g, 16, 0.04, 5, 0, 0.02, -5.2, 0xffffff, { rough: 0.9 });
    street.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#34363a", base2: "#2e3034", seam: "rgba(0,0,0,0.2)" }), { repeat: 4, px: 512 }), { rough: 0.9, color: 0xb8bcc2 });
    const walk = box(g, 16, 0.05, 3.4, 0, 0.1, 1.9, 0xffffff, { rough: 0.9 });
    walk.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#a9a59c", base2: "#9d998f", seam: "rgba(0,0,0,0.3)" }), { repeat: 5, px: 512 }), { rough: 0.9, color: 0xe4e0d6 });
    box(g, 16, 0.18, 0.2, 0, 0.09, -2.7, 0xb8b4aa, { rough: 0.9 });
    for (let i = -7; i <= 7; i += 2) box(g, 1.2, 0.01, 0.12, i, 0.045, -5.2, 0xf2f2ee, { rough: 0.6 });
    // The cell: a raised planting strip cut open.
    const strip = group(g, 0, 0, -1.3);
    for (const [w, d, x, z] of [[6.2, 0.2, 0, -1.2], [6.2, 0.2, 0, 1.2], [0.2, 2.6, -3.1, 0], [0.2, 2.6, 3.1, 0]]) box(strip, w, 0.36, d, x, 0.18, z, 0x8e8a80, { rough: 0.9 });
    const cutFloor = box(strip, 6, 0.04, 2.2, 0, 0.04, 0, 0xffffff, { rough: 0.98, cast: false });
    cutFloor.material = texturedMat(surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#5a4630", base2: "#4a3a28", pools: 4 }), { repeat: 2, px: 256 }), { rough: 0.98, color: 0xc8b8a0 });
    const gravel = box(strip, 5.9, 0.08, 2.1, 0, 0.1, 0, 0xffffff, { rough: 0.95 });
    gravel.material = texturedMat(surfaceTexture(bkrgGravelFace, { repeat: 3, px: 256 }), { rough: 0.95 });
    gravel.visible = false;
    const pipe = cyl(strip, 0.07, 0.07, 5.8, 0, 0.16, 0.2, 0x2a2a2a, { rough: 0.6, seg: 10 });
    pipe.rotation.z = Math.PI / 2; pipe.visible = false;
    const media = box(strip, 5.9, 0.14, 2.1, 0, 0.24, 0, 0xffffff, { rough: 0.98 });
    media.material = texturedMat(surfaceTexture(bkrgSoilFace, { repeat: 2, px: 256 }), { rough: 0.98 });
    media.visible = false;
    const plants = group(strip, 0, 0.3, 0);
    for (let i = 0; i < 9; i++) ball(plants, 0.16, -2.4 + i * 0.6, 0.1, (i % 2 ? 0.4 : -0.4), 0x4f8a3a, { rough: 0.9, seg: 7, seg2: 5 });
    plants.visible = false;
    const water = box(strip, 5.6, 0.02, 1.9, 0, 0.33, 0, 0x5d8aa8, { rough: 0.1, metal: 0.3, opacity: 0.6, transparent: true, cast: false });
    water.visible = false;

    // Locate marks and the unmarked valve box.
    const gasMark = group(g, -1.2, 0.13, -1.3);
    for (let i = 0; i < 5; i++) box(gasMark, 0.08, 0.005, 0.26, 0, 0, -1.1 + i * 0.5, 0xe8c21e, { rough: 0.7, emissive: 0x3a2e00, ei: 0.3 });
    const fadedMark = box(g, 0.3, 0.02, 0.3, -1.2, 0.14, -2.55, 0xb8a860, { rough: 0.8, opacity: 0.55, transparent: true });
    reg(hits, fadedMark, "paint-faded");
    const valveBox = cyl(g, 0.12, 0.12, 0.04, 1.6, 0.14, -1.0, 0x3a3f45, { rough: 0.7, metal: 0.4, seg: 12 });
    reg(hits, valveBox, "valve-unmarked");
    holoTag(g, "yellow mark: gas", -1.2, 0.6, -0.2, { css: "#e8c21e", w: 0.3 });

    // Grade stake and rod.
    const stake = group(g, 2.6, 0.1, -2.2);
    box(stake, 0.05, 0.9, 0.05, 0, 0.45, 0, 0xc8a878, { rough: 0.9 });
    box(stake, 0.12, 0.06, 0.02, 0, 0.8, 0.03, 0xe8622a, { rough: 0.6 });
    const rod = decal(g, 0.08, 1.2, 2.2, 0.7, -1.4, (cx, w, h) => {
      cx.fillStyle = "#f2f2ee"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 12; i++) { cx.fillStyle = i % 2 ? "#1b1e22" : "#d2312b"; cx.fillRect(0, (i * h) / 12, w * (i % 3 === 0 ? 1 : 0.5), h / 24); }
    }, { px: 64 });
    holoTag(g, "grade rod", 2.2, 1.45, -1.4, { css: "#6fae4a", w: 0.2 });
    reg(hits, rod, "grade-rod");
    const drawGauge = decal(g, 0.08, 0.6, -2.6, 0.55, -1.3, (cx, w, h) => { cx.fillStyle = "#f2f2ee"; cx.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { cx.fillStyle = "#1b4d7a"; cx.fillRect(0, (i * h) / 6, w, 3); } }, { px: 64 });
    holoTag(g, "drawdown gauge", -2.6, 1.0, -1.3, { css: "#6fae4a", w: 0.3 });
    reg(hits, drawGauge, "drawdown-gauge");

    // Vacuum wand and truck hose.
    const vac = group(g, -1.0, 0.1, -0.2);
    cyl(vac, 0.04, 0.04, 1.2, 0, 0.6, 0, 0x3a3f45, { rough: 0.6, seg: 8 }).rotation.z = 0.25;
    box(vac, 0.3, 0.05, 0.05, 0.15, 1.15, 0, 0xe0a040, { rough: 0.5 });
    holoTag(vac, "vacuum wand", 0, 1.45, 0, { css: "#6fae4a", w: 0.26 });
    reg(hits, vac, "vac-wand");
    const hose = cyl(g, 0.06, 0.06, 4.0, -3.2, 0.14, 0.2, 0x1b1e22, { rough: 0.7, seg: 8 });
    hose.rotation.z = Math.PI / 2;
    const pothole = cyl(g, 0.25, 0.25, 0.02, -1.2, 0.13, -1.0, 0x2a2018, { rough: 1, seg: 14, cast: false });
    const gasPipe = cyl(g, 0.04, 0.04, 0.5, -1.2, 0.15, -1.0, 0xe8c21e, { rough: 0.5, seg: 8 });
    gasPipe.rotation.x = Math.PI / 2; gasPipe.visible = false;
    void pothole;

    // ------------------------------------------------ the excavator
    const exc = excavator(g, 5.6, 0.1, -1.4, { ry: -Math.PI / 2, livery: { colour: 0xe0a040, fleetName: "GSI CREW", unitNumber: "CX-3" } });
    const parts = exc.userData?.parts || {};
    holoTag(g, "compact excavator — IUOE Local 3", 5.6, 3.4, -1.4, { css: "#6fae4a", w: 0.6 });
    const swingRing = torus(g, 2.6, 0.015, 5.6, 0.12, -1.4, 0xe8622a, { emissive: 0xe8622a, ei: 1.0, rough: 0.4, cast: false, seg: 6, seg2: 40 });
    swingRing.rotation.x = Math.PI / 2;
    const swingHit = box(g, 0.6, 0.6, 0.6, 4.0, 0.9, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step inside the swing to point?", 4.0, 1.4, 0.2, { css: "#e8622a", w: 0.56 });
    reg(hits, swingHit, "swing-radius");
    const digPost = group(g, 3.2, 0.1, 1.0);
    box(digPost, 0.5, 0.05, 0.5, 0, 0.02, 0, 0x6fae4a, { rough: 0.6, emissive: 0x1a3a10, ei: 0.4 });
    standingFigure(digPost, 0, 0, { ry: -1.2, cloth: 0x3f4a55, vest: 0xf2c14b, helmet: 0xf2f2ee, gloves: true });
    holoTag(digPost, "signaller's spot — outside the swing", 0, 2.0, 0, { css: "#6fae4a", w: 0.6 });
    reg(hits, digPost, "dig-signal");
    const stopPost = group(g, 1.6, 0.1, 1.6);
    cyl(stopPost, 0.03, 0.03, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    decal(stopPost, 0.3, 0.3, 0, 1.3, 0.02, signFace("ALL\nSTOP", { bg: "#d2312b", accent: "#f2f2ee", fg: "#ffffff", scale: 0.34 }), { px: 128 });
    holoTag(stopPost, "all-stop signal to the operator", 0, 1.6, 0, { css: "#6fae4a", w: 0.5 });
    reg(hits, stopPost, "all-stop");
    const crack = box(g, 2.4, 0.012, 0.04, 0.4, 0.13, -0.05, 0x1b1e22, { rough: 0.9 });
    crack.visible = false;

    // Hazard targets round the cut.
    const spoilHit = box(g, 0.7, 0.4, 0.4, 0.8, 0.4, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pile the spoil on the lip?", 0.8, 0.8, -0.05, { css: "#e8622a", w: 0.46 });
    reg(hits, spoilHit, "spoil-at-edge");
    const jumpHit = box(g, 0.5, 0.4, 0.5, -2.2, 0.5, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "hop down into the cut?", -2.2, 0.95, -0.3, { css: "#e8622a", w: 0.42 });
    reg(hits, jumpHit, "jump-in-cut");
    const pastHit = box(g, 0.5, 0.4, 0.5, -0.4, 0.6, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "keep the bucket going by the mark?", -0.4, 1.0, -2.0, { css: "#e8622a", w: 0.6 });
    reg(hits, pastHit, "dig-past-marks");
    const ladder = group(g, -2.8, 0.1, -0.4);
    for (const x of [-0.18, 0.18]) box(ladder, 0.04, 1.1, 0.04, x, 0.4, 0, 0xe0a040, { rough: 0.6 });
    for (let i = 0; i < 4; i++) box(ladder, 0.36, 0.03, 0.03, 0, 0.05 + i * 0.25, 0, 0xe0a040, { rough: 0.6 });
    ladder.rotation.x = 0.3;

    // Layers, cleanout, plants.
    const stock = group(g, -5.2, 0.1, 1.0);
    const rockPile = ball(stock, 0.5, -0.8, 0.2, 0, 0x7c7d7a, { rough: 0.95, seg: 8, seg2: 5 });
    holoTag(stock, "drain rock", -0.8, 0.8, 0, { css: "#6fae4a", w: 0.22 });
    reg(hits, rockPile, "gravel-bed");
    const pipeRack = group(stock, 0.3, 0, 0);
    for (let i = 0; i < 3; i++) cyl(pipeRack, 0.06, 0.06, 1.2, 0, 0.08 + i * 0.12, 0, 0x2a2a2a, { rough: 0.6, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(pipeRack, "perforated underdrain", 0, 0.6, 0, { css: "#6fae4a", w: 0.38 });
    reg(hits, pipeRack, "underdrain-pipe");
    const mediaPile = ball(stock, 0.5, 1.4, 0.2, 0, 0x5a4630, { rough: 0.98, seg: 8, seg2: 5 });
    holoTag(stock, "soil media", 1.4, 0.8, 0, { css: "#6fae4a", w: 0.22 });
    reg(hits, mediaPile, "soil-media");
    const cleanout = group(g, 2.6, 0.1, -1.0);
    cyl(cleanout, 0.07, 0.07, 0.3, 0, 0.15, 0, 0xf2f2ee, { rough: 0.5, seg: 12 });
    const cap = cyl(cleanout, 0.085, 0.085, 0.05, 0, 0.32, 0, 0x2f4d5f, { rough: 0.5, seg: 12 });
    holoTag(cleanout, "cleanout cap", 0, 0.6, 0, { css: "#6fae4a", w: 0.24 });
    reg(hits, cleanout, "cleanout-cap");
    const tray = group(g, -3.8, 0.1, 2.4);
    box(tray, 0.6, 0.08, 0.4, 0, 0.04, 0, 0x1b1e22, { rough: 0.8 });
    for (let i = 0; i < 6; i++) ball(tray, 0.07, -0.2 + (i % 3) * 0.2, 0.14, (i < 3 ? -0.1 : 0.1), 0x4f8a3a, { rough: 0.9, seg: 6, seg2: 4 });
    holoTag(tray, "plug tray", 0, 0.45, 0, { css: "#6fae4a", w: 0.2 });
    reg(hits, tray, "plant-plug");
    const plantMark = group(g, 0.3, 0.14, -1.3);
    const plantRing = torus(plantMark, 0.45, 0.012, 0, 0.01, 0, BKRG_ACCENT, { emissive: BKRG_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    plantRing.rotation.x = Math.PI / 2;
    hits["plant-mark"] = plantMark;
    holoTag(plantMark, "planting mark", 0, 0.3, 0, { css: "#6fae4a", w: 0.26 });

    // Closure sign, its mark, the detour ramp.
    const closure = group(g, -6.0, 0.1, 2.9, 0.3);
    box(closure, 0.05, 0.9, 0.05, 0, 0.45, 0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    decal(closure, 0.5, 0.3, 0, 0.95, 0.03, signFace("SIDEWALK\nCLOSED", { bg: "#f2f2ee", accent: "#1b1e22", fg: "#1b1e22", scale: 0.3 }), { px: 128 });
    holoTag(closure, "sidewalk closed sign", 0, 1.35, 0, { css: "#6fae4a", w: 0.36 });
    reg(hits, closure, "walk-closure");
    const closeMark = group(g, -4.6, 0.14, 1.2);
    const closeRing = torus(closeMark, 0.45, 0.012, 0, 0.01, 0, BKRG_ACCENT, { emissive: BKRG_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    closeRing.rotation.x = Math.PI / 2;
    hits["closure-mark"] = closeMark;
    holoTag(closeMark, "closure mark", 0, 0.3, 0, { css: "#6fae4a", w: 0.24 });
    const ramp = group(g, -3.6, 0.1, 3.4);
    const rampDeck = box(ramp, 1.4, 0.06, 0.8, 0, 0.03, 0, 0x6b7178, { rough: 0.8 });
    holoTag(ramp, "detour ramp", 0, 0.4, 0, { css: "#6fae4a", w: 0.24 });
    reg(hits, ramp, "detour-ramp");
    for (const x of [-4.8, -3.8, -2.8, -1.8, -0.8, 0.2, 1.2, 2.2, 3.2]) {
      cyl(g, 0.02, 0.12, 0.45, x, 0.32, 0.4, 0xf06a2b, { rough: 0.7, seg: 8 });
      cyl(g, 0.121, 0.121, 0.06, x, 0.2, 0.4, 0xf2f2ee, { rough: 0.6, seg: 8 });
    }
    const walker = standingFigure(g, -2.4, 2.9, { ry: 1.6, cloth: 0x6b4a8a });
    const stroller = box(g, 0.4, 0.4, 0.6, -2.0, 0.4, 2.9, 0x2f4d5f, { rough: 0.7 });
    walker.visible = false; stroller.visible = false;
    const walkerHome = walker.position.clone();

    // Finished-cell hazards.
    const edgeOpen = box(g, 2.0, 0.08, 0.06, -1.6, 0.4, 0.0, 0xe8622a, { rough: 0.7, emissive: 0x3a1206, ei: 0.35 });
    reg(hits, edgeOpen, "edge-open");
    const barrier = box(g, 2.0, 0.3, 0.06, -1.6, 0.35, 0.05, 0xf2f2ee, { rough: 0.6 });
    barrier.visible = false;
    const inlet = group(g, 3.4, 0.1, -2.6);
    box(inlet, 0.6, 0.12, 0.2, 0, 0.06, 0, 0x8e8a80, { rough: 0.9 });
    const inletSpoil = box(inlet, 0.5, 0.08, 0.16, 0, 0.13, 0, 0x5a4630, { rough: 0.98 });
    reg(hits, inletSpoil, "inlet-blocked");
    holoTag(inlet, "kerb-cut inlet", 0, 0.45, 0, { css: "#6fae4a", w: 0.28 });

    // ------------------------------------------- boards, gear, radio
    const gear = group(g, -5.4, 0.1, -0.4, 0.5);
    box(gear, 1.1, 0.05, 0.4, 0, 0.72, 0, 0x5a4a38, { rough: 0.8 });
    box(gear, 1.0, 0.7, 0.04, 0, 0.35, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    for (const [id, dx, colour, label] of [["ppe-vest", -0.39, 0xe8e21e, "VEST"], ["ppe-hardhat", -0.13, 0xf2f2ee, "HARD HAT"], ["ppe-boots", 0.13, 0x3a2a1a, "BOOTS"], ["ppe-gloves", 0.39, 0x3a4a2a, "GLOVES"]]) {
      const it = group(gear, dx, 0.8, 0);
      box(it, 0.2, 0.08, 0.16, 0, 0, 0, colour, { rough: 0.8 });
      decal(it, 0.18, 0.05, 0, 0.041, 0, signFace(label, { bg: "#1b1e22", accent: "#6fae4a", scale: 0.45 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const plan = decal(g, 0.56, 0.4, 0.6, 1.25, 3.2, paperFace("CELL PLAN · LOCATE TICKET", ["Ticket: current · all utilities answered?", "Layers: rock · underdrain · media", "Walk: closure + detour ramp", "One signaller · outside the swing", "Tolerance zone: vacuum only"], { bg: "#f4ecdc", band: "#6fae4a" }), { px: 320 });
    cyl(g, 0.03, 0.035, 1.0, 0.6, 0.6, 3.18, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, plan, "work-plan");
    const logBoard = decal(g, 0.46, 0.34, 2.2, 1.2, 3.0, paperFace("INSTALLATION LOG", ["Locates: —", "Grade: —", "Layers: —", "Remarks: —"], { bg: "#f4ecdc", band: "#6b7178" }), { px: 256 });
    logBoard.rotation.y = -0.4;
    cyl(g, 0.03, 0.035, 1.0, 2.2, 0.6, 2.98, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, logBoard, "maintenance-log");
    const radioPost = group(g, -0.8, 0.1, 3.3);
    box(radioPost, 0.08, 0.95, 0.08, 0, 0.47, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const radioBody = box(radioPost, 0.07, 0.2, 0.05, 0, 1.05, 0.03, 0x1b1e22, { rough: 0.5 });
    holoTag(radioPost, "crew radio", 0, 1.3, 0, { css: "#6fae4a", w: 0.24 });
    reg(hits, radioBody, "crew-radio");

    pickup(g, -6.5, 0, -4.4, { ry: Math.PI / 2, livery: { fleetName: "GSI CREW", unitNumber: "GS-2" } });
    holoTag(g, "crew pickup", -6.5, 2.4, -4.4, { css: "#6fae4a", w: 0.24 });
    const hand = standingFigure(g, -4.2, -0.2, { ry: 0.8, cloth: 0x3f4a55, vest: 0xf2c14b, helmet: 0xf2f2ee, gloves: true });
    holoTag(hand, "second laborer", 0, 1.95, 0, { css: "#6fae4a", w: 0.28 });
    void CITY;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.6, -1.3),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "close-walk") { closure.position.set(-4.6, 0.1, 1.2); closeRing.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (step.id === "paint-check") { fadedMark.material = mat(0xe8c21e, { rough: 0.7 }); valveBox.material = mat(0x2f6fb8, { rough: 0.6 }); }
        if (step.id === "pothole") gasPipe.visible = true;
        if (step.id === "grade-check") repaint(rod, (cx, w, h) => { cx.fillStyle = "#f2f2ee"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, h * 0.45, w, h * 0.1); });
        if (step.id === "layers") { gravel.visible = true; pipe.visible = true; media.visible = true; cutFloor.visible = false; }
        if (step.id === "cap-cleanout") cap.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "planting") { plants.visible = true; tray.visible = false; plantRing.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (step.id === "drawdown") water.visible = false;
        if (step.id === "final-walk") { barrier.visible = true; edgeOpen.visible = false; inletSpoil.visible = false; }
        if (step.id === "maintenance-log") repaint(logBoard, paperFace("INSTALLATION LOG", ["Locates: gas re-marked · valve marked", "Grade: on the stake", "Layers: rock · drain · media · capped", "Edge barrier · inlet cleared"], { bg: "#f4ecdc", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "stroller-squeeze") { walker.visible = true; stroller.visible = true; walker.position.x = walkerHome.x + 0.8; }
        if (it.id === "edge-crack") crack.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "stroller-squeeze") { ramp.position.set(-2.4, 0.1, 2.6); rampDeck.material = mat(0x59c97b, { rough: 0.7 }); walker.position.set(walkerHome.x - 1.4, 0, walkerHome.z + 0.3); stroller.position.x = -3.0; }
        if (it.id === "edge-crack") { crack.material = mat(0xe8622a, { emissive: 0xe8622a, ei: 0.8 }); spoilHit.position.x = 0.8; swingRing.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.2 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "cap-cleanout") cap.rotation.y = session.turn.amount * Math.PI * 2;
        if (step?.id === "drawdown") { water.visible = true; water.position.y = 0.33 + Math.sin(t * 0.8) * 0.01; }
        if (step?.id === "dig-signal" && parts.boom) parts.boom.rotation.x = -0.4 + Math.sin(t * 0.9) * 0.12 * (session.track?.v ?? 0.5);
        void dt;
      },
    };
  },
};
