import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dredge Barge VR — Maritime & Ports, station seventy-eight.
//
// Environmental dredging of contaminated bay sediment on a generic reach
// beside a former shipyard — a clamshell dredge on a spud barge, filling a
// scow that a tug will take to a disposal site. The learner is the deck
// lead: the dredge operator on the crane is IUOE Local 3, the tug and scow
// crew are IBU. Nothing here is about any one site's history; it is the
// procedure every environmental dredging job on the Bay runs, because
// contaminated sediment does not stay contaminated to the sediment alone —
// it is in the water the moment the bucket opens, and the whole job is a
// set of controls built to keep it where the permit says it can go.

const DB_ACCENT = 0x7c93a5;

export const SIM_DREDGE_BARGE = {
  id: "dredge-barge",
  index: "78",
  domain: "Maritime",
  trade: "Dredge deck lead / marine construction crew",
  category: "Maritime & Ports",
  weather: "fog",
  certification: "IUOE Local 3 operating engineers (dredge crane operator); Inlandboatmen's Union of the Pacific (IBU, ILWU marine division) — tug and scow crew; U.S. Army Corps of Engineers dredging permit conditions; San Francisco Bay Dredged Material Management Office (DMMO) sediment testing; OSHA 29 CFR 1926 Subpart CC cranes and derricks; USCG barge and towing regulations",
  name: "Dredge Barge",
  title: simTitle("Dredge Barge"),
  tagline: "Environmental dredging of contaminated bay sediment: baseline turbidity read, curtain and anchors checked, the closed bucket over the open one, a controlled cycle with no overflow, the scow to the freeboard line, decant tested before discharge, and the tug called before the scow moves",
  accent: DB_ACCENT,
  accentCss: "#7c93a5",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "clean-cut", name: "Clean Cut", note: "A load dredged, tested and moved without a reading over limit or a line unaccounted for" },

  game: system({
    name: "Dredge Deck",
    currency: "CY",
    ranks: ["Deckhand", "Dredge Deck Lead", "Scow Boss", "Dredging Foreman", "Dredge Deck Certified"],
    badges: [
      { id: "baseline-honest", name: "Baseline Honest", note: "Read the pre-dredge turbidity baseline clean before the first bucket", test: AWARD.stepClean("baseline") },
      { id: "nothing-over-limit", name: "Nothing Over Limit", note: "Never a hazard, never a reading called outside its band", test: AWARD.safe },
      { id: "true-freeboard", name: "True Freeboard", note: "Freeboard and decant both read inside the working band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-load", name: "Clean Load", note: "No corrections across the whole load", test: AWARD.clean },
      { id: "steady-cycle", name: "Steady Cycle", note: "Held the bucket cycle in band the whole way", test: AWARD.unbroken },
      { id: "scow-away", name: "Scow Away", note: "Scow cast off inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-bucket-pick": "You reached for the open clamshell bucket instead of the sealed environmental one. An open bucket loses its load through the seams on every lift — fine sediment sifting out the sides all the way up through the water column. The environmental bucket exists because the permit was written on the assumption that what leaves the bottom is what lands in the scow, not what leaks out on the way.",
    "hopper-reach": "You reached into the scow's hopper to clear a hang-up while the bucket was still cycling overhead. A loaded clamshell bucket swinging on a crane wire does not stop for a hand in the hopper, and a caught-between injury at a moving load happens faster than anybody can react to a shout. The bucket stops and locks out before anyone's arm goes anywhere near that opening.",
    "vessel-gap-step": "You stepped across the open gap between the dredge barge and the scow instead of using the gangway. Two vessels working alongside each other move independently on every wake and swell — the gap between them opens and closes on its own schedule, and a foot caught in it when the hulls come back together is a foot that does not come back out clean.",
    "premature-decant-discharge": "You opened the scow's decant valve before the water was tested. Decant is exactly the water the DMMO sediment testing program exists to check — release it untested and whatever the dredged sediment was carrying goes straight back into the bay the whole permit was written to keep it out of, with no sample to show it didn't.",
  },

  lateNotes: {
    "hoist-lever": "The cycle starts after the environmental bucket is on and the spuds are set — nothing to cycle before the barge is actually anchored.",
    "freeboard-mark": "Read the freeboard after the cycle is running, not before there is anything in the scow to read it against.",
    "decant-meter": "Decant is tested after the scow carries a load — there's no decant water off an empty hopper.",
    "vhf-tug": "The tug is called once the scow is loaded and tested, not before there is anything ready to move.",
  },

  // Interruptions: see shared/game.js. One is the sediment itself pushing
  // back on the one number the permit is written against; the other is the
  // bay finding the one line holding a loaded scow to the barge.
  interrupts: [
    {
      id: "turbidity-exceedance",
      kind: "Turbidity monitor alarming",
      after: "cycle", delay: 4, seconds: 13,
      alert: "The real-time turbidity monitor off the stern has jumped past the permit limit — the last two bucket cycles are stirring more than the curtain is holding.",
      cue: "The monitor is over limit. Check it and call a pause before the next cycle.",
      target: "baseline-monitor",
      why: "The dredging permit is not a promise to be careful, it is a number a monitor either confirms or contradicts in real time, and a reading over limit means the curtain and the cycle rate together are not doing the job the permit assumed they would. It gets read and acted on the moment it alarms — not after the next bucket has already gone in on the same bad conditions.",
      missNote: "The crane kept cycling through the alarm and the plume kept building past the curtain's own capacity to hold it, turning one exceedance into a run of them — which is the difference between a reading a regulator notes and a permit violation a regulator acts on.",
      wrongNote: "That's not it. The turbidity monitor is the one instrument reading what is actually leaving the work area right now — nothing else on this deck tells you that.",
    },
    {
      id: "scow-line-parted",
      kind: "Scow line parted",
      after: "tug-call", delay: 3, seconds: 12,
      alert: "The scow's forward mooring line has parted under the strain of the current, and the loaded scow is swinging out on the line still holding aft.",
      cue: "Get a second line on before the one line left lets go too.",
      target: "scow-winch",
      why: "A loaded scow held by a single remaining line is a load the size of a building held by one point of failure, and the line still holding is now carrying a share of the strain it was never rigged to take alone. A second line on the winch is what turns one point of failure back into an arrangement that can actually hold — done now, while there is still a line left to work with.",
      missNote: "The one remaining line let go under the extra load it was never meant to carry alone, and a loaded scow went adrift on a falling tide with the channel still open behind it — a recoverable moment became a boat somebody now has to chase down.",
      wrongNote: "It's the scow's own mooring winch. Getting a second line on is the only thing that takes the load off the line still holding.",
    },
  ],

  steps: [
    {
      id: "permit", kind: "select", target: "permit-board",
      title: "Check the dredging permit and the sediment testing conditions",
      cue: "Read the Corps' dredging permit, the DMMO sediment testing results, and today's disposal call.",
      why: "Sediment testing under the Dredged Material Management Office program is what decides where this load is even allowed to go — open water, an upland site, or nowhere until it is tested again. Dredging first and asking where the material goes afterward is how a scow ends up sitting loaded with nowhere permitted to take it.",
    },
    {
      id: "baseline", kind: "gauge", target: "baseline-monitor",
      title: "Read the pre-dredge turbidity baseline",
      cue: "Take the reading at the monitoring buoy and commit it before the first bucket goes in.",
      why: "Every reading taken for the rest of the job is judged against this one. Skip it, or take it after the water is already stirred, and there is no honest baseline left to prove the dredging itself is the reason for anything the monitor reads later.",
      gauge: { label: "BASELINE NTU", speed: 0.7, green: [0.38, 0.58], readout: (t) => `${Math.round(t * 30)} NTU`, missNote: "Outside the expected background band. Let the buoy settle and read it again before anything else starts." },
    },
    {
      id: "stage", kind: "sequence", anyOrder: true,
      targets: ["stage-vest", "stage-helmet", "stage-comms"],
      itemNames: { "stage-vest": "life vest", "stage-helmet": "hard hat", "stage-comms": "radio headset" },
      title: "Stage the deck lead's own gear",
      cue: "Life vest, hard hat, and a radio headset before stepping under the boom.",
      why: "A dredge deck is a working crane over open water with a scow alongside and a tug standing by — the vest is buoyancy the moment a wet steel deck takes a foot out, the hard hat is for a rigging failure nobody sees coming, and the headset is how the deck lead and the crane operator stay one crew instead of two people guessing at each other's hand signals over diesel noise.",
    },
    {
      id: "curtain-deploy", kind: "drag", target: "turbidity-curtain",
      title: "Deploy the turbidity curtain around the work area",
      cue: "Carry the curtain out and clip it to the ring around the dredge footprint.",
      why: "The curtain is what keeps the plume the bucket raises inside a boundary the permit actually drew, rather than free to drift with the tide across the whole reach. Everything the crew reads on the turbidity monitor for the rest of the job is a measurement of how well this curtain is doing its one job.",
      drag: { to: "curtain-ring", radius: 0.5, missNote: "Not on the ring — the curtain has to close the full loop around the footprint or the plume goes straight out the gap." },
    },
    {
      id: "anchor-check", kind: "find", noHint: true,
      targets: ["anchor-1", "anchor-2", "anchor-3"],
      itemNames: { "anchor-1": "anchor 1", "anchor-2": "anchor 2", "anchor-3": "anchor 3" },
      itemNotes: {
        "anchor-1": "Anchor 1 is set and holding — chain taut, no slack for the curtain to sag on.",
        "anchor-2": "Anchor 2 is set and holding — the curtain skirt hangs plumb here, not bellied by the current.",
        "anchor-3": "Anchor 3 is set and holding — the last point in the loop, and the one a tug's wake finds first if it drags.",
      },
      title: "Walk the curtain and check every anchor",
      cue: "Click all three anchors and confirm each one is actually holding, not just clipped on.",
      why: "A curtain is only as good as the anchors holding it against the bottom, and an anchor that looks set from the deck can already be walking in soft mud. Checking all three before the first cycle is the only way to know the boundary the monitor is about to be judged against is actually where it is supposed to be.",
    },
    {
      id: "bucket-select", kind: "select", target: "env-bucket",
      title: "Rig the environmental clamshell bucket",
      cue: "Confirm the sealed environmental bucket is on the wire, not the open one on the rack beside it.",
      why: "An environmental bucket closes level and seals its own seams, so what closes on the bottom is what arrives in the scow instead of sifting out through the water column on the way up. It is the one piece of rigging that decides whether every other control on this deck is protecting real water quality or just looking like it does.",
    },
    {
      id: "spuds", kind: "turn", target: "spud-winch",
      title: "Lower and set the spuds",
      cue: "Wind the spud winch down until both piles are seated and the barge stops moving on the current.",
      why: "A dredge barge working loose on the current is a crane trying to place a bucket from a platform that will not hold still, and every cycle after that is a guess at where the bucket actually lands. The spuds pin the barge to the bottom so the footprint the curtain is drawn around stays the footprint the bucket is actually working.",
      turn: { turns: 1.0, axis: "y", label: "SPUD WINCH" },
    },
    {
      id: "cycle", kind: "track", target: "hoist-lever", seconds: 7,
      title: "Run the bucket cycle at a controlled speed",
      cue: "Hold the hoist lever in the working range — no rushed cycles, no overflow on the way up.",
      why: "A bucket hoisted too fast trails water and fines over its own sealed edges before it clears the surface, which is exactly the overflow an environmental bucket is supposed to prevent; hoisted too slow, the crew is burning cycle time the tide is not going to give back. Steady is what keeps a sealed bucket actually sealed all the way to the scow.",
      track: { start: 0.1, green: [0.38, 0.58], rise: 0.55, fall: 0.45, drift: 0.12, label: "HOIST RATE", readout: (v) => (v < 0.38 ? "too slow — losing the tide" : v > 0.58 ? "overflow risk" : "steady cycle") },
      holdBreakNote: "The cycle broke rhythm and the bucket lurched on the wire — that is exactly where an overflow starts. Bring it back to a steady rate.",
    },
    {
      id: "freeboard", kind: "gauge", target: "freeboard-mark",
      title: "Watch the scow's freeboard as it loads",
      cue: "Read the load marks on the scow's side and commit before the waterline passes the working line.",
      why: "A scow loaded past its marked freeboard rides low enough that its own wake, or a following sea in the channel, comes aboard over the coaming — a boat is not overloaded gradually, it is overloaded and then it is a different, much worse problem. The mark is what says stop while there is still freeboard left to lose.",
      gauge: { label: "FREEBOARD", speed: 0.68, green: [0.4, 0.6], readout: (t) => `${(1.4 - t * 0.9).toFixed(2)} m`, missNote: "Past the working mark. Stop loading and read the freeboard again before the next bucket goes in." },
    },
    {
      id: "decant", kind: "gauge", target: "decant-meter",
      title: "Test the decant water before any discharge",
      cue: "Draw the sample from the scow's decant line and commit the reading against the DMMO limit.",
      why: "Decant is the water the load releases as the sediment settles, and it carries whatever that sediment was carrying — it is tested under the same DMMO program that decided where the sediment itself could go, because the water is not exempt just because the solid already passed.",
      gauge: { label: "DECANT", speed: 0.72, green: [0.4, 0.6], readout: (t) => `${Math.round(t * 50)} NTU`, missNote: "Over the discharge limit. This water does not go back to the bay until a retest reads inside the band." },
    },
    {
      id: "tug-call", kind: "hold", target: "vhf-tug", seconds: 5,
      title: "Call the tug before the scow moves",
      cue: "Hold the transmit key and make the full call — scow loaded, tested, ready to take in tow.",
      why: "The tug crew cannot see the freeboard mark or the decant result from where they are standing off, and they are about to put a line on a loaded scow on the strength of what this call tells them. Made in full, it is the deck lead putting a name to the load being ready, not a wave across open water.",
      holdBreakNote: "The call cut off partway through. A half-made call leaves the tug taking a line on a load it only half knows about — key up and finish it.",
    },
    {
      id: "cast-off", kind: "turn", target: "scow-winch",
      title: "Cast off the scow to the tug",
      cue: "Wind the mooring winch to pay out the line as the tug takes up the strain.",
      why: "A line cast off in a rush snaps taut the instant the tug takes the strain, and a snap load on deck hardware is how a cleat or a winch drum lets go. Paid out steadily against the tug's own pull, the same line comes off the barge clean instead of coming off however it happens to.",
      turn: { turns: 0.85, axis: "y", reverse: true, label: "SCOW WINCH" },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["bridle-check", "curtain-seam-check"],
      itemNames: { "bridle-check": "the tow bridle", "curtain-seam-check": "the curtain seam" },
      itemNotes: {
        "bridle-check": "The tow bridle's shackles are pinned and moused. An unmoused pin works itself loose exactly when the load on it is highest, which is the moment the tug takes up the tow.",
        "curtain-seam-check": "The curtain seam nearest the scow has come open under the day's traffic. Left as is, it is a gap in the one boundary still supposed to be holding the last of today's plume.",
      },
      title: "Walk the deck before the scow gets underway",
      cue: "Check the tow bridle and the curtain before anything moves off this footprint.",
      why: "The tug is about to take a loaded scow into a channel with other traffic in it, and the curtain is about to be the only control left running with the crew's attention on the departure instead of on the water. Both get one more look here, because neither one gets a second chance once the scow is moving.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, DB_ACCENT);

    // ------------------------------------------------------------ the water
    const water = slab(g, 6.0, 0.02, 5.6, 0, 0.01, -0.3, 0x1c3a48, { rough: 0.18, metal: 0.3, opacity: 0.85, transparent: true, cast: false });
    const fog = particles(g, 34, 0xc7d6dd, { size: 0.05, life: 1.1, additive: false, opacity: 0.28 });
    fog.position.set(0, 0.6, -1.6);

    // ------------------------------------------------------- the dredge barge
    const barge = group(g, -0.55, 0.19, 0.3);
    box(barge, 3.0, 0.36, 2.6, 0, -0.16, 0, 0x3a424a, { rough: 0.72, metal: 0.35, cast: false });
    box(barge, 3.0, 0.05, 2.6, 0, 0.03, 0, 0x454e57, { rough: 0.7, metal: 0.3 });
    for (let i = -1; i <= 1; i++) box(barge, 0.03, 0.01, 2.6, i * 1.0, 0.06, 0, 0x2b3238, { rough: 0.8, cast: false });

    // Spuds at the forward corners.
    const spudGroup = group(barge, 0, 0, 0.9);
    const spuds = [];
    for (const sx of [-1.25, 1.25]) {
      const spud = cyl(spudGroup, 0.05, 0.05, 1.4, sx, 0.4, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 12 });
      spuds.push(spud);
    }
    const spudWinchGrp = group(barge, 0, 0.06, 0.55);
    const spudWinch = valveWheel(spudWinchGrp, 0, 0.16, 0, { r: 0.09, color: 0xe8b02e, body: 0x2b3138 });
    holoTag(spudWinchGrp, "spud winch", 0, 0.42, 0, { css: "#7c93a5", w: 0.32 });
    reg(hits, spudWinch.userData.wheel, "spud-winch");

    // Crane tower and boom over the aft side, dredging into the water.
    const craneBase = group(barge, 0, 0.03, -0.7);
    box(craneBase, 0.4, 1.3, 0.4, 0, 0.65, 0, 0x4a545e, { rough: 0.6, metal: 0.4 });
    const boomPivot = group(craneBase, 0, 1.3, 0);
    const boom = group(boomPivot, 0, 0, 0);
    boom.rotation.x = -0.55;
    box(boom, 0.16, 0.16, 2.4, 0, 0, 1.2, 0x3f4850, { rough: 0.55, metal: 0.5 });
    const cableAnchor = group(boom, 0, 0, 2.3);
    const cable = cyl(cableAnchor, 0.012, 0.012, 1.1, 0, -0.55, 0, 0x2b2f34, { rough: 0.5, metal: 0.6, seg: 8 });
    const bucketGrp = group(cableAnchor, 0, -1.1, 0);
    const bucketShell = [
      box(bucketGrp, 0.36, 0.28, 0.24, -0.08, 0, 0, 0x2f5f7a, { rough: 0.5, metal: 0.55 }),
      box(bucketGrp, 0.36, 0.28, 0.24, 0.08, 0, 0, 0x2f5f7a, { rough: 0.5, metal: 0.55 }),
    ];
    void bucketShell;

    // Environmental (closed) bucket on its rack, and the open bucket beside it
    // as the decoy.
    const rack = group(barge, -1.0, 0.06, -0.2);
    const envBucket = group(rack, -0.35, 0, 0);
    box(envBucket, 0.32, 0.24, 0.22, 0, 0.12, 0, 0x2f7a5f, { rough: 0.5, metal: 0.5 });
    box(envBucket, 0.34, 0.04, 0.24, 0, 0.26, 0, 0x244f3c, { rough: 0.5, metal: 0.5, cast: false });
    holoTag(rack, "environmental bucket — sealed", -0.35, 0.42, 0, { css: "#7c93a5", w: 0.5 });
    reg(hits, envBucket, "env-bucket");
    const openBucket = group(rack, 0.35, 0, 0);
    for (const side of [-1, 1]) {
      const half = box(openBucket, 0.16, 0.24, 0.22, side * 0.09, 0.12, 0, 0x8a5a3a, { rough: 0.6, metal: 0.4 });
      half.rotation.z = side * 0.12;
    }
    holoTag(rack, "open bucket?", 0.35, 0.42, 0, { css: "#e8622a", w: 0.34 });
    reg(hits, openBucket, "open-bucket-pick");

    // Deck console for the hoist lever and the deck lead's own gear.
    const console_ = toolChest(barge, 1.1, 0.5, { color: 0x2f4d5f });
    for (const [id, dx, color, label] of [["stage-vest", -0.2, 0xe8b02e, "VEST"], ["stage-helmet", 0.0, 0xf2c14b, "HELMET"], ["stage-comms", 0.2, 0x2f4d5f, "COMMS"]]) {
      const it = group(console_, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#0d1c24", accent: "#dbeaf0", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const hoistPost = group(barge, 0.5, 0.06, -0.55);
    cyl(hoistPost, 0.03, 0.035, 0.7, 0, 0.35, 0, 0x4a545e, { rough: 0.5, metal: 0.5, seg: 10 });
    const hoistLever = group(hoistPost, 0, 0.7, 0);
    box(hoistLever, 0.05, 0.32, 0.05, 0, 0.14, 0, CITY.hiVis, { rough: 0.5 });
    holoTag(hoistPost, "hoist lever", 0, 1.05, 0, { css: "#7c93a5", w: 0.28 });
    reg(hits, hoistLever, "hoist-lever");
    const hoistReadout = instrument(hoistPost, -0.22, 0.72, 0, { idle: "----", color: 0x7c93a5, w: 0.13, d: 0.19 });

    const crewOnBarge = standingFigure(barge, 0.55, -1.25, { ry: 2.6, cloth: 0x2b3138, vest: 0xe8b02e, helmet: 0xf2c14b });
    void crewOnBarge;

    // ------------------------------------------------------------- the scow
    const scow = group(g, 1.75, 0.05, -0.55, -0.15);
    box(scow, 2.4, 0.5, 1.7, 0, 0.05, 0, 0x53606b, { rough: 0.7, metal: 0.3, cast: false });
    const hopperInner = box(scow, 2.0, 0.32, 1.35, 0, 0.24, 0, 0x2b3138, { rough: 0.85, cast: false });
    void hopperInner;
    const spoilLevel = box(scow, 1.9, 0.05, 1.25, 0, 0.14, 0, 0x5a4a34, { rough: 0.95, cast: false });
    const hopperReach = box(scow, 1.5, 0.4, 0.9, 0, 0.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(scow, "reach in to clear it?", 0, 0.65, 0, { css: "#e8622a", w: 0.44 });
    reg(hits, hopperReach, "hopper-reach");

    for (let i = 0; i < 6; i++) {
      const y = 0.06 + i * 0.06;
      box(scow, 2.42, 0.012, 0.02, 0, y, 0.86, i === 3 ? 0xe8622a : 0xdfe6ec, { rough: 0.5, cast: false });
    }
    const freeboardMark = box(scow, 0.3, 0.015, 0.02, 0, 0.24, 0.87, 0xe8622a, { rough: 0.5, emissive: 0xe8622a, ei: 0.5, cast: false });
    const freeboardReadout = instrument(scow, 0.4, 0.28, 0.87, { idle: "-- m", color: 0x7c93a5, w: 0.12, d: 0.18 });
    holoTag(scow, "freeboard mark", 0, 0.5, 0.87, { css: "#7c93a5", w: 0.32 });
    reg(hits, freeboardMark, "freeboard-mark");

    const decantLine = group(scow, -1.0, 0.06, 0.8);
    cyl(decantLine, 0.03, 0.03, 0.3, 0, 0.1, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    const decantMeter = instrument(decantLine, 0, 0.24, 0.02, { idle: "-- NTU", color: 0x7c93a5, w: 0.12, d: 0.18 });
    holoTag(decantLine, "decant sample", 0, 0.42, 0.02, { css: "#7c93a5", w: 0.34 });
    reg(hits, decantMeter, "decant-meter");
    const decantValve = valveWheel(decantLine, 0, 0.02, -0.18, { r: 0.06, color: 0xd2312b, body: 0x2b3138 });
    const dumpHit = box(scow, 0.24, 0.24, 0.24, -1.0, 0.05, 0.62, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(scow, "dump the decant now?", -1.0, 0.35, 0.62, { css: "#e8622a", w: 0.5 });
    reg(hits, dumpHit, "premature-decant-discharge");
    void decantValve;

    const scowWinchGrp = group(scow, 1.0, 0.06, -0.7);
    const scowWinch = valveWheel(scowWinchGrp, 0, 0.16, 0, { r: 0.09, color: 0xe8b02e, body: 0x2b3138 });
    holoTag(scowWinchGrp, "scow mooring winch", 0, 0.42, 0, { css: "#7c93a5", w: 0.4 });
    reg(hits, scowWinch.userData.wheel, "scow-winch");

    const bridle = group(scow, 0, 0.08, -0.85);
    torus(bridle, 0.08, 0.014, 0, 0, 0, 0x8a939b, { rough: 0.4, metal: 0.8, seg: 8, seg2: 18 }).rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) cyl(bridle, 0.012, 0.012, 0.4, sx * 0.5, 0.05, -0.1, 0xc3ccd3, { rough: 0.5, metal: 0.7, seg: 8 });
    holoTag(bridle, "tow bridle", 0, 0.3, -0.1, { css: "#7c93a5", w: 0.3 });
    reg(hits, bridle, "bridle-check");

    // Gangway between the dredge barge and the scow, with the unsafe
    // shortcut as its own hotspot right beside it.
    const gangway = box(g, 0.9, 0.04, 0.4, 0.62, 0.19, -0.15, 0xc3ccd3, { rough: 0.55, metal: 0.5 });
    void gangway;
    const gapHit = box(g, 0.6, 0.5, 0.6, 0.62, 0.35, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step across the gap?", 0.62, 0.65, -0.7, { css: "#e8622a", w: 0.42 });
    reg(hits, gapHit, "vessel-gap-step");

    // ------------------------------------------------------- turbidity curtain
    const bundle = group(g, -2.3, 0.1, 1.4, 0.4);
    cyl(bundle, 0.09, 0.09, 0.55, 0, 0.09, 0, 0xe8b02e, { rough: 0.7, seg: 14 }).rotation.z = Math.PI / 2;
    holoTag(bundle, "turbidity curtain — furled", 0, 0.28, 0, { css: "#7c93a5", w: 0.46 });
    reg(hits, bundle, "turbidity-curtain");

    const curtainRing = group(g, -0.4, 0, -0.3);
    curtainRing.visible = false;
    const anchorSpots = [["anchor-1", -2.0, 1.0], ["anchor-2", -0.4, -1.8], ["anchor-3", 1.3, 0.9]];
    for (const [, x, z] of anchorSpots) {
      const seg = cyl(curtainRing, 0.03, 0.03, 0.4, x, 0.24, z, 0xe8b02e, { rough: 0.6, seg: 10 });
      seg.rotation.z = Math.PI / 2;
    }
    const socket = group(curtainRing, 0, 0.15, 0);
    hits["curtain-ring"] = socket;
    for (const [id, x, z] of anchorSpots) {
      const anchor = group(g, x, 0.03, z);
      cyl(anchor, 0.05, 0.06, 0.06, 0, 0.03, 0, 0x3a3f45, { rough: 0.9, seg: 10 });
      reg(hits, anchor, id);
    }

    const seamHit = box(g, 0.3, 0.3, 0.15, 1.3, 0.2, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "curtain seam — open", 1.3, 0.5, 0.9, { css: "#e8622a", w: 0.36 });
    reg(hits, seamHit, "curtain-seam-check");

    // ------------------------------------------------------- baseline monitor
    const monitorBuoy = group(g, -1.9, 0.02, -1.7);
    const monitorBall = ball(monitorBuoy, 0.12, 0, 0.1, 0, 0xe8622a, { rough: 0.6, seg: 14 });
    const monitorInst = instrument(monitorBuoy, 0.16, 0.16, 0, { idle: "-- NTU", color: 0x7c93a5, w: 0.13, d: 0.19 });
    holoTag(monitorBuoy, "turbidity monitor — real time", 0, 0.36, 0, { css: "#7c93a5", w: 0.5 });
    reg(hits, monitorInst, "baseline-monitor");

    // ------------------------------------------------------------- permit + VHF
    const permitBoard = holoPanel(g, 0.92, 0.62, 2.15, 1.1, 0.9, (cx, w, h) => {
      cx.fillStyle = "#0c1620"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#7c93a5"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dbeaf0"; cx.fillText("USACE DREDGING PERMIT — DMMO", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#e6f0f5";
      ["Sediment tested and cleared — DMMO", "Turbidity limit: differential over curtain", "Environmental bucket required",
       "Freeboard: do not exceed marked line", "Decant tested before any discharge"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -0.4, accent: DB_ACCENT });
    reg(hits, permitBoard, "permit-board");

    const vhfPost = group(g, 2.3, 0.19, 0.85);
    cyl(vhfPost, 0.03, 0.035, 0.9, 0, 0.45, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    const vhf = instrument(vhfPost, 0, 0.92, 0, { ry: 0.4, idle: "CH 13", color: 0x7c93a5, w: 0.11, d: 0.17 });
    holoTag(vhfPost, "VHF — tug", 0, 1.14, 0, { css: "#7c93a5", w: 0.28 });
    reg(hits, vhf, "vhf-tug");

    // ---------------------------------------------------------------- the tug
    const tugHome = new THREE.Vector3(3.6, 0.02, 1.2);
    const tug = group(g, tugHome.x, tugHome.y, tugHome.z, -0.6);
    box(tug, 1.6, 0.4, 0.75, 0, 0.24, 0, 0x1f2a33, { rough: 0.7, metal: 0.25, cast: false });
    box(tug, 0.7, 0.5, 0.6, -0.2, 0.62, 0, 0xe8edf1, { rough: 0.6, cast: false });
    cyl(tug, 0.03, 0.03, 0.7, -0.2, 1.15, 0, 0xc3ccd3, { rough: 0.5, metal: 0.6, seg: 8, cast: false });
    const tugLight = ball(tug, 0.06, -0.2, 1.55, 0, 0xffe9a8, { emissive: 0xffe9a8, ei: 1.2, rough: 0.4, cast: false });
    standingFigure(tug, 0.5, 0.05, { ry: -2.2, cloth: 0x243a4a, vest: 0xf2681f, atStation: true }).position.y = 0.42;
    holoTag(g, "tug standing by", tugHome.x, 1.7, tugHome.z, { css: "#7c93a5", w: 0.3 });
    const wake = particles(g, 24, 0xcfe4f0, { size: 0.035, life: 0.8, additive: false, opacity: 0.35 });

    cone(g, -2.5, 2.0, { color: DB_ACCENT });
    cone(g, 2.7, -1.7, { color: DB_ACCENT });
    barrierPanel(g, -0.2, 2.15, { color: 0xe8b02e });

    let scowDeparting = false, monitorHigh = false, lineParted = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.0, 0.6),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "curtain-deploy") {
          bundle.visible = false;
          curtainRing.visible = true;
        }
        if (step.id === "bucket-select") {
          openBucket.visible = false;
        }
        if (step.id === "spuds") {
          for (const spud of spuds) spud.position.y = 0.02;
        }
        if (step.id === "freeboard") {
          spoilLevel.position.y = 0.19;
        }
        if (step.id === "cast-off") {
          scowDeparting = true;
        }
        if (step.id === "walk") {
          seamHit.visible = false;
        }
      },

      onInterrupt(it) {
        if (it.id === "turbidity-exceedance") {
          monitorHigh = true;
          monitorBall.material = mat(0xf0645b, { rough: 0.4, emissive: 0xf0645b, ei: 2.2 });
          repaint(monitorInst.userData.screen, signFace("OVER", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffdada", scale: 0.6 }));
        }
        if (it.id === "scow-line-parted") {
          lineParted = true;
          scow.rotation.y = -0.18;
          bridle.material = mat(0xf0645b, { rough: 0.5, metal: 0.7, emissive: 0xf0645b, ei: 1.0 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "turbidity-exceedance") {
          monitorHigh = false;
          monitorBall.material = mat(0xe8622a, { rough: 0.6 });
        }
        if (it.id === "scow-line-parted") {
          lineParted = false;
          scow.rotation.y = 0;
          bridle.material = mat(0x8a939b, { rough: 0.4, metal: 0.8 });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        fog.visible = true;
        fog.userData.step(dt, new THREE.Vector3(0, 0.5, -1.5), 1.6, 0.15, 0.1);
        wake.visible = scowDeparting;
        if (scowDeparting) wake.userData.step(dt, new THREE.Vector3(1.0, 0.03, -0.4), 0.7, 0.4, -0.5);
        water.position.y = 0.01 + Math.sin(t * 1.1) * 0.004;
        tugLight.material = mat(0xffe9a8, { emissive: monitorHigh ? 0xf0645b : 0xffe9a8, ei: monitorHigh ? 2.0 : 1.2, rough: 0.4 });

        const step = session?.step;
        if (step?.id === "cycle") {
          boomPivot.rotation.y = Math.sin(t * 0.4) * 0.12;
          const rate = session.track ? session.track.v : 0;
          cableAnchor.position.y = -0.3 - rate * 0.6;
          repaint(hoistReadout.userData.screen, signFace(rate < 0.38 ? "SLOW" : rate > 0.58 ? "FAST" : "STEADY", {
            bg: "#0c1620", accent: rate >= 0.38 && rate <= 0.58 ? "#59c97b" : "#f0645b", fg: "#dbeaf0", scale: 0.55,
          }));
        }
        if (lineParted) scow.position.x += Math.sin(t * 5) * 0.001;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "baseline") {
            repaint(monitorInst.userData.screen, signFace(`${Math.round(gg.t * 30)} NTU`, { bg: "#0c1620", accent: gg.t >= 0.38 && gg.t <= 0.58 ? "#59c97b" : "#f0645b", fg: "#dbeaf0", scale: 0.6 }));
          }
          if (step?.id === "freeboard") {
            repaint(freeboardReadout.userData.screen, signFace(`${(1.4 - gg.t * 0.9).toFixed(2)} m`, { bg: "#0c1620", accent: gg.t >= 0.4 && gg.t <= 0.6 ? "#59c97b" : "#f0645b", fg: "#dbeaf0", scale: 0.55 }));
          }
          if (step?.id === "decant") {
            repaint(decantMeter.userData.screen, signFace(`${Math.round(gg.t * 50)} NTU`, { bg: "#0c1620", accent: gg.t >= 0.4 && gg.t <= 0.6 ? "#59c97b" : "#f0645b", fg: "#dbeaf0", scale: 0.6 }));
          }
        }
      },
    };
  },
};
