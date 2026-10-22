import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat, mudflatFace, roadwayFace, waterFace,
} from "../citykit.js";
import { excavator } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Culvert Retrofit For Fish Passage VR — Water & Environmental,
// Bay Restoration & Cleanup pack C.
//
// Replacing a generic perched, undersized road culvert with an embedded box
// culvert sized for fish passage — not any one crossing, and no claim about
// any one site's history. The whole sequence exists to answer one question
// the old pipe could not: whether a fish swimming upstream from the bay can
// actually get through this crossing instead of stalling at a lip of
// concrete a foot above the water it just left. None of that answer counts
// if the crew drowns the channel in silt getting there, so the fish come out
// of the reach before the water does, the water leaves through a filter
// before the channel does, and the new culvert goes in to a grade a laser
// checks, not to a grade that looks about right from the cab.

const BRCF_ACCENT = 0x5f9e5a;
const BRCF_FLAG = 0xe8622a;

export const SIM_BR_CULVERT_RETROFIT_FOR_FISH_PASSAGE = {
  id: "br-culvert-retrofit-for-fish-passage",
  index: "br-c3",
  domain: "Environmental",
  trade: "Operating engineer — excavator, culvert retrofit crew",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "IUOE Local 3 operating engineer — excavator; LIUNA Local 261 laborers — confined space and dewatering ground crew; OSHA 29 CFR 1926 Subpart P excavations; OSHA 29 CFR 1926 Subpart AA confined spaces in construction; U.S. Army Corps of Engineers Clean Water Act (CWA) Section 404 permit conditions; San Francisco Bay Regional Water Quality Control Board CWA Section 401 water quality certification; California Department of Fish and Wildlife Lake and Streambed Alteration Agreement for fish passage; U.S. Fish and Wildlife Service Endangered Species Act consultation; work window per the permit",
  name: "Culvert Retrofit For Fish Passage",
  title: simTitle("Culvert Retrofit For Fish Passage"),
  tagline: "Replacing a perched culvert with a fish-passage crossing on a dewatered reach: fish excluded and the channel dammed before the pump starts, the old bedding dug to a controlled swing, the barrel entered only on a confined space permit, the new box set to the laser and backfilled lift by lift, and the invert grade checked before the dam ever comes out",
  accent: BRCF_ACCENT,
  accentCss: "#5f9e5a",
  parSeconds: 330,
  footprint: 2.8,
  badge: { id: "passage-restored", name: "Passage Restored", note: "Every fish out, every lift compacted to grade, invert reading true — first time" },

  game: system({
    name: "Culvert Crew",
    currency: "CULVERT",
    ranks: ["Laborer", "Oiler", "Operator", "Lead Operator", "Culvert Certified"],
    badges: [
      { id: "dry-clean", name: "Dry And Clean", note: "Never a hazard, dewatering discharge always filtered", test: AWARD.safe },
      { id: "grade-true", name: "Invert True", note: "Dewatering meter and invert grade both read inside the working band", test: AWARD.precise(0.7) },
      { id: "channel-first", name: "Channel Read Clean", note: "Fish exclusion and dam both read clean before the pump ever started", test: AWARD.stepClean("fish-exclusion-net") },
    ],
    challenges: [
      { id: "clean-crossing", name: "Clean Crossing", note: "No corrections across the whole retrofit", test: AWARD.clean },
      { id: "steady-swing", name: "Steady Swing", note: "Held the excavator swing inside the working band the whole pass", test: AWARD.unbroken },
      { id: "crossing-fast", name: "Crossing Closed Fast", note: "Retrofit closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "excavator-swing-radius": "You walked into the excavator's swing radius while the house was powered and turning. The counterweight and boom sweep an arc with no warning beyond the beacon and the whistle, and a trench full of exposed bedding does not make that arc any smaller or any more forgiving of a body standing in it.",
    "confined-entry-no-permit": "You climbed into the culvert barrel without a confined space permit or an attendant topside. A concrete barrel this size is exactly the kind of space Subpart AA exists for — no natural ventilation, one way in and out, and an atmosphere nobody has tested — and going in on a guess instead of a permit is the guess that ends with somebody topside not knowing you're in trouble until it's too late to matter.",
    "manual-lift-baffle": "You went to muscle the precast baffle section into the trench by hand instead of walking it in on the tag line while the excavator took the weight. A precast section this size has no safe grip for a human hand, and a crushed hand in a trench is not an injury this crew gets to walk off.",
    "dewater-discharge-unfiltered": "You ran the bypass pump's discharge straight into the creek below the dam instead of through the filter bag staged for it. Every gallon this pump moves is water the 401 certification expects to leave this site cleaner than the trench it came out of, not sediment-laden water dumped straight into the same reach the fish exclusion net was set up to protect in the first place.",
  },

  lateNotes: {
    "excavator-swing": "The swing pass starts only after the fish exclusion net and the dam are both in — digging bedding in a channel that still has fish or flow in it undoes the reason either one was set up.",
    "baffle-set": "Set the baffle section only after the invert bedding is dug to grade — lowering a precast section onto an unchecked bed just buries a bad grade under concrete nobody can fix afterward.",
    "invert-rod": "Read the invert grade only after backfill is compacted around the culvert — a reading taken before the lifts are in is not the grade the crossing will actually hold once loaded.",
  },

  // Interruptions: see shared/game.js. The first is the pump doing exactly
  // what an unwatched pump does; the second is the fish exclusion doing its
  // job the moment the shrinking pool proves it wrong.
  interrupts: [
    {
      id: "pump-loses-prime",
      kind: "Bypass pump loses prime",
      after: "dewatering-meter", delay: 4, seconds: 14,
      alert: "The bypass pump has lost its prime and the water in the excavation is climbing back up around the old culvert invert instead of draining past it.",
      cue: "Get to the priming valve now, not after the trench floods back out — the pump needs to be re-primed before the pit fills further.",
      target: "pump-priming-valve",
      why: "A pump that has lost prime stops moving water but keeps running, and every minute it sits unprimed is a minute the trench refills with exactly the water the whole dewatering plan exists to keep out of it — re-priming it the moment it is noticed is what keeps a lost prime from becoming a flooded excavation the crew has to dewater a second time.",
      missNote: "The trench kept filling while the pump idled unprimed, and by the time anyone reached the valve the water was back over the old invert — the whole morning's dewatering undone in the time it took to notice a gauge nobody was watching.",
      wrongNote: "That is not it. The pump's own priming valve is what gets it moving water again — nothing else in this trench does that job.",
    },
    {
      id: "fish-in-exclusion-zone",
      kind: "Fish trapped in the shrinking dewatering pool",
      after: "excavator-swing", delay: 3, seconds: 13,
      alert: "A juvenile fish is trapped in the last pool of water inside the exclusion zone, right where the bucket's next pass would go.",
      cue: "Hit the dig estop now. Nothing digs in that pool while a fish is still in it.",
      target: "dig-estop",
      why: "The fish exclusion net was set up specifically because a fish that slipped past it before dewatering started is not a hypothetical — it is exactly this pool, and the bucket stops the moment it is seen, not once the current pass is finished, because the Endangered Species Act and the CDFW streambed agreement both treat a fish struck by machinery as the harm the whole exclusion effort exists to prevent.",
      missNote: "The bucket went in on the next pass anyway, and nobody could afterward say whether the fish made it out from under it — a question that never has a good answer once the pass is already made.",
      wrongNote: "It's the excavator's own dig estop. Nothing else in this trench stops the bucket before it reaches the pool.",
    },
  ],

  steps: [
    {
      id: "check-in", kind: "select", target: "permit-board",
      title: "Check the permit conditions and the work window before staging",
      cue: "Read the Corps' 404 conditions, the 401 certification, the streambed agreement, and the work window before anything is staged.",
      why: "This crossing is worked under the same set of signatures every in-water retrofit on the Bay carries — the Corps' Section 404 permit, the Water Board's 401 certification, California Department of Fish and Wildlife's streambed alteration agreement, and a work window the permit itself sets — and a culvert crew that treats this as a road job instead of a permitted in-water job answers for every condition on it regardless.",
    },
    {
      id: "stage-ppe", kind: "sequence", anyOrder: true,
      targets: ["stage-hardhat", "stage-hi-vis", "stage-hearing"],
      itemNames: { "stage-hardhat": "hard hat", "stage-hi-vis": "high-visibility vest", "stage-hearing": "hearing protection" },
      title: "Stage the ground crew's PPE",
      cue: "Hard hat, high-visibility vest and hearing protection before anyone works near the running excavator.",
      why: "A ground crew works within feet of a swinging counterweight and a running diesel all day in a trench that is also loud enough on its own to mask a shouted warning — the vest is what lets the operator see a person against the trench wall, the hard hat is for whatever the boom or a baffle section finds on the way down, and hearing protection is for noise nobody notices is a problem until the day it already was one.",
    },
    {
      id: "find-stakes", kind: "find", noHint: true,
      targets: ["align-stake-1", "align-stake-2", "align-stake-3"],
      itemNames: { "align-stake-1": "alignment stake — upstream", "align-stake-2": "alignment stake — center", "align-stake-3": "alignment stake — downstream" },
      itemNotes: {
        "align-stake-1": "Stake 1 marks the upstream end of the new culvert alignment. The trench is dug from here, not from wherever the old pipe happened to sit.",
        "align-stake-2": "Stake 2 is the center control — the check that the trench is still following the surveyed alignment and not drifting off it a bucket load at a time.",
        "align-stake-3": "Stake 3 marks the downstream end. Past it, whatever the bucket cuts is not part of the permitted crossing.",
      },
      title: "Find the survey stakes that set the culvert alignment",
      cue: "Walk the crossing and click the three stakes the new alignment is built from.",
      why: "The trench, the baffle placement and the backfill lifts are all set against stakes a surveyor already placed, not against where the old culvert looked like it belonged. Finding all three before anything is dug is what keeps a whole day of excavation building the one permitted alignment instead of three honest guesses at it.",
    },
    {
      id: "fish-exclusion-net", kind: "select", target: "exclusion-net",
      title: "Confirm the fish exclusion net is deployed across the channel",
      cue: "Check that the exclusion net spans the full channel width upstream of the work zone before any dewatering starts.",
      why: "Every fish upstream of this crossing has to be given the chance to be somewhere else before the channel is dammed and pumped dry, and the net is what makes that a fact instead of a hope — dewatering behind a net that does not span the full channel just concentrates whatever fish it missed into the exact pool the crew is about to dig through.",
    },
    {
      id: "dam-place", kind: "drag", target: "cofferdam-bags",
      title: "Build the cofferdam across the channel",
      cue: "Carry the sandbags out and stack them along the marked dam line above the work zone.",
      why: "The dam is what turns a live channel into a dry excavation, and a dam that does not run the full width of the channel is a dam the first real flow finds the gap in — every bag placed on the line is one more foot of channel the pump does not have to fight to keep dry.",
      drag: { to: "dam-line", radius: 0.5, missNote: "Not on the line — the dam has to run bank to bank or the flow finds the gap on the first real push." },
    },
    {
      id: "pump-start", kind: "turn", target: "bypass-pump-valve",
      title: "Start the bypass pump",
      cue: "Open the bypass pump's valve to start diverting flow around the work zone.",
      why: "The bypass is what keeps the reach downstream of the dam wet and passable for anything already below it while the crew works dry above — a dam with no bypass running just backs the whole channel's flow up against the sandbags until something gives.",
      turn: { turns: 0.8, axis: "y", label: "BYPASS PUMP" },
    },
    {
      id: "dewatering-meter", kind: "gauge", target: "dewatering-meter",
      title: "Read the dewatering discharge meter",
      cue: "Take the turbidity reading on the filtered discharge and commit it inside the permit's limit.",
      why: "The 401 certification does not care how clean the water in the trench looks — it cares what comes out of the filter bag before it reaches the creek, and reading the meter now is what tells the crew the filter is doing its job instead of assuming it is because nobody has checked.",
      gauge: { label: "DISCHARGE", speed: 0.7, green: [0.4, 0.6], readout: (t) => `${Math.round(t * 40)} NTU`, missNote: "Outside the permit's discharge limit. Let the filtered reading settle and commit again inside the band." },
    },
    {
      id: "excavator-swing", kind: "track", target: "excavator-swing", seconds: 7,
      title: "Swing the boom to dig out the old culvert bedding",
      cue: "Work the swing at a controlled rate across the trench, keeping it inside the working band.",
      why: "A steady swing rate is what lets the operator stop the house exactly where the trench wall is, every single pass; swing too fast and the boom's own momentum carries the bucket into ground that was not supposed to be cut yet, swing too slow and the crew is burning the dewatered window on a pass that should already be done.",
      track: { start: 0.1, green: [0.36, 0.58], rise: 0.55, fall: 0.45, drift: 0.12, label: "SWING", readout: (v) => (v < 0.36 ? "stalled short of the cut" : v > 0.58 ? "swinging too fast to stop clean" : "controlled swing") },
      holdBreakNote: "The swing broke off the rate and the boom drifted off its arc. Bring it back to a controlled rate before it reaches the trench wall.",
    },
    {
      id: "confined-space-permit", kind: "select", target: "confined-space-board",
      title: "Confirm the confined space permit before anyone enters the barrel",
      cue: "Check the permit board and confirm the attendant is posted before the crew climbs into the old culvert barrel.",
      why: "The old culvert barrel is a permit-required confined space the moment a crew member's shoulders go past the opening — no through ventilation, one way out, and an atmosphere nobody has tested until it is — and the permit and the attendant are what stand between that and a rescue nobody topside knows to start.",
    },
    {
      id: "baffle-set", kind: "hold", target: "baffle-set", seconds: 5,
      title: "Guide the new box culvert section onto the bedding",
      cue: "Hold the tag line steady while the excavator lowers the precast section onto the checked bedding.",
      why: "A precast section swinging on a single cable drifts the moment it clears the trench wall, and a taut tag line is what a person on the ground uses to walk it straight down onto the bedding instead of letting it swing and land wherever the crane's own drift happens to put it.",
      holdBreakNote: "The tag line went slack and the section started to swing — take it up again and hold it steady until the section is seated.",
    },
    {
      id: "backfill-lifts", kind: "sequence",
      targets: ["lift-bottom", "lift-mid", "lift-top"],
      itemNames: { "lift-bottom": "backfill lift — bottom", "lift-mid": "backfill lift — mid", "lift-top": "backfill lift — top" },
      title: "Compact the backfill in lifts, bottom to top",
      cue: "Place and compact the backfill lifts in order: bottom, then mid, then top.",
      why: "A culvert backfilled in one pass leaves voids under the haunches that settle unevenly the first time a vehicle loads the road above it; compacted bottom lift first, each lift is proven solid before the next one goes on top of it, which is the only way this crossing ends up carrying a road instead of slowly swallowing one.",
      outOfOrderNote: "Bottom lift, then mid, then top. A lift compacted before the one below it is proven just traps whatever voids that lower lift still has.",
    },
    {
      id: "invert-grade", kind: "gauge", target: "invert-rod",
      title: "Check the culvert invert grade",
      cue: "Read the level rod at the culvert invert and commit the reading inside the design band.",
      why: "A fish-passage culvert only works if its invert sits at the slope the design called for — too steep and the flow through it is too fast for a fish to swim against, too flat and it silts in behind the very backfill the crew just compacted. The rod reading is the only honest check that the crossing was actually built to the design instead of just poured to look about right.",
      gauge: { label: "INVERT", speed: 0.72, green: [0.42, 0.6], readout: (t) => `${(t * 1.4).toFixed(2)}% slope`, missNote: "Off the design slope. Read the rod again at the marked point before the dam comes out." },
    },
    {
      id: "walk-hazards", kind: "find", noHint: true,
      targets: ["pinch-point-flag", "blind-spot-cone"],
      itemNotes: {
        "pinch-point-flag": "This flag marks a pinch point at the excavator's swing frame that a hand could still reach into while the machine sits idling — click it to confirm the crew has kept clear.",
        "blind-spot-cone": "This cone sits in the operator's blind spot behind the counterweight, exactly where nobody should be standing while the machine is powered.",
      },
      title: "Walk the crossing and confirm the crew is clear of the machine",
      cue: "Check the pinch point and the blind spot before the excavator is shut down for the day.",
      why: "The two places on this machine most likely to catch a hand or a body are also the two places easiest to forget once the grading itself is done — walking them now, machine still idling, is the last chance to catch a crew habit that a shutdown checklist alone will not.",
    },
    {
      id: "log-culvert", kind: "select", target: "closing-log",
      title: "Log the day's retrofit",
      cue: "Record the trench dug, the discharge readings, the lifts compacted, and the invert grade for the crew's record.",
      why: "The next crew on this crossing — and the inspector who signs off the fish-passage design — reads today's log, not today's memory of it. A retrofit that went in clean but was never logged looks, from the record, exactly like a crossing nobody has verified, and an invert reading that was never written down is a fact nobody downstream can confirm on its own.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, BRCF_ACCENT);

    // ---------------------------------------------------------------- terrain
    // The road/levee crossing runs toward +z, a dewatered channel trench cuts
    // through the middle where the retrofit happens, and a short remnant
    // pool of open channel continues toward -z beyond the dam.
    const roadTex = surfaceTexture((cx, w, h) => roadwayFace(cx, w, h, { lanes: 4 }), { repeat: 4, px: 256 });
    const roadBase = box(g, 6.4, 0.34, 1.3, 0, 0.17, 2.1, 0x3a3d41, { rough: 0.92 });
    void roadBase;
    const road = box(g, 6.4, 0.02, 1.3, 0, 0.341, 2.1, 0x3a3d41, { rough: 0.85, cast: false });
    road.material = texturedMat(roadTex, { rough: 0.85, color: 0x9a9a9e });

    const slopeA = box(g, 6.4, 0.4, 0.6, 0, 0.14, 1.15, 0x4d3f2c, { rough: 0.96 });
    slopeA.rotation.x = 0.4;
    const trenchTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#4a4638", base2: "#3a362a", cracks: 10, pools: 2 }), { repeat: 3, px: 256 });
    const trench = box(g, 6.0, 0.1, 1.8, 0, -0.15, 0.1, 0x4a4638, { rough: 0.95, cast: false });
    trench.material = texturedMat(trenchTex, { rough: 0.95, color: 0x8a7a58 });
    const trenchWall = box(g, 6.0, 0.5, 0.06, 0, 0.1, -0.79, 0x3f3b30, { rough: 0.95, cast: false });
    void trenchWall;

    const slopeB = box(g, 6.4, 0.34, 0.5, 0, 0.02, -1.25, 0x453a28, { rough: 0.96 });
    slopeB.rotation.x = -0.3;
    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0c2531", mid: "#123542", base2: "#0a1f29" }), { repeat: 3, px: 256 });
    const water = box(g, 6.4, 0.03, 0.9, 0, -0.24, -2.0, 0x0f2e3a, { rough: 0.2, metal: 0.3, opacity: 0.9, transparent: true, cast: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x1e5060 });
    water.material.transparent = true;
    water.material.opacity = 0.9;
    const wave = particles(g, 20, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.4 });
    wave.position.set(0, -0.2, -2.05);

    // ------------------------------------------------------------ residual pool
    const pool = box(g, 0.7, 0.02, 0.5, 0.6, -0.13, 0.4, 0x123542, { rough: 0.3, metal: 0.2, opacity: 0.85, transparent: true, cast: false });

    // -------------------------------------------------------- upland station
    const permitBoard = holoPanel(g, 0.95, 0.64, -2.4, 1.1, 2.35, (cx, w, h) => {
      cx.fillStyle = "#0d1c14"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5f9e5a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff3d8"; cx.fillText("PERMIT CONDITIONS — CROSSING 7", w * 0.06, h * 0.11);
      cx.font = `${Math.round(h * 0.062)}px Arial, sans-serif`; cx.fillStyle = "#e7f7e0";
      ["USACE CWA §404 permit — this crossing", "RWQCB CWA §401 water quality cert.",
       "CDFW streambed alteration agreement", "USFWS Endangered Species Act consult", "Work window per the permit"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.27 + i * 0.1)));
    }, { ry: 0.4, accent: BRCF_ACCENT });
    reg(hits, permitBoard, "permit-board");

    const chest = toolChest(g, 2.5, 2.35, { color: 0x2f6f4a });
    for (const [id, dx, color, label] of [["stage-hardhat", -0.2, 0xe8b02e, "HARD HAT"], ["stage-hi-vis", 0.0, 0xf2ae14, "HI-VIS"], ["stage-hearing", 0.2, 0x2f4d3a, "HEARING"]]) {
      const it = group(chest, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#0d1c14", accent: "#dff3d8", scale: 0.42 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const crewUpland = standingFigure(g, -2.6, 1.8, { ry: -0.9, cloth: 0x2f4d3a, vest: 0xe8b02e });
    void crewUpland;

    // ---------------------------------------------------------- survey stakes
    for (const [id, x, label] of [["align-stake-1", -2.2, "ALIGN 1"], ["align-stake-2", 0.0, "ALIGN 2"], ["align-stake-3", 2.2, "ALIGN 3"]]) {
      const st = group(g, x, -0.05, 1.4);
      cyl(st, 0.012, 0.014, 0.5, 0, 0.25, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
      box(st, 0.09, 0.06, 0.01, 0, 0.46, 0, BRCF_FLAG, { rough: 0.75 });
      decal(st, 0.08, 0.04, 0, 0.46, 0.006, signFace(label, { bg: "#1b1e12", accent: "#dff3d8", scale: 0.5 }));
      reg(hits, st, id);
    }

    // ------------------------------------------------------------ fish exclusion net
    const netGrp = group(g, 0, -0.1, -1.05);
    for (let x = -3.0; x <= 3.0; x += 0.5) cyl(netGrp, 0.015, 0.015, 0.4, x, 0.2, 0, 0xc9b58c, { rough: 0.85, seg: 6 });
    const netMesh = slab(netGrp, 6.0, 0.4, 0.02, 0, 0.2, 0, 0x3c6a56, { rough: 0.9, opacity: 0.7, transparent: true, cast: false });
    void netMesh;
    holoTag(netGrp, "fish exclusion net", 0, 0.46, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, netGrp, "exclusion-net");

    // ------------------------------------------------------------ cofferdam
    const damBundle = group(g, -2.6, -0.1, -0.55);
    for (let i = 0; i < 3; i++) box(damBundle, 0.5, 0.16, 0.3, 0, 0.08 + i * 0.001, -0.2 + i * 0.15, 0x8a7a54, { rough: 0.9 });
    holoTag(damBundle, "sandbags — staged", 0, 0.36, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, damBundle, "cofferdam-bags");
    const damLine = group(g, 0, -0.08, -0.65);
    hits["dam-line"] = damLine;
    const damDeployed = group(g, 0, -0.08, -0.65);
    damDeployed.visible = false;
    for (let x = -2.8; x <= 2.8; x += 0.42) box(damDeployed, 0.4, 0.24, 0.28, x, 0.12, 0, 0x8a7a54, { rough: 0.9 });

    // ------------------------------------------------------------- excavator
    const machine = excavator(g, 1.6, -0.08, -0.15, {
      ry: -0.35,
      livery: { colour: 0xc9a227, fleetName: "CULVERT RETROFIT", unitNumber: "EX-7" },
    });
    const { house, boom, stick, bucket, door } = machine.userData.parts;
    void boom; void stick; void door;
    reg(hits, house, "excavator-swing");
    const digEstop = box(machine, 0.08, 0.08, 0.06, 1.1, 1.55, -0.1, 0xd2312b, { rough: 0.55 });
    holoTag(machine, "dig estop", 1.1, 1.75, -0.1, { css: "#5f9e5a", w: 0.28 });
    reg(hits, digEstop, "dig-estop");

    const swingHazHit = box(g, 0.5, 0.4, 0.5, 0.6, 0.2, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk into the swing radius?", 0.6, 0.5, -1.0, { css: "#e8622a", w: 0.5 });
    reg(hits, swingHazHit, "excavator-swing-radius");

    // ------------------------------------------------------------- bypass pump
    const pumpGrp = group(g, -1.5, -0.14, 0.8);
    box(pumpGrp, 0.34, 0.28, 0.5, 0, 0.14, 0, 0x3c444c, { rough: 0.6, metal: 0.4 });
    const pumpValveGrp = group(pumpGrp, 0.2, 0.3, 0);
    const pumpValve = valveWheel(pumpValveGrp, 0, 0.05, 0, { r: 0.07, color: 0x5f9e5a, body: 0x2b5a6a });
    holoTag(pumpGrp, "bypass pump", 0, 0.5, 0, { css: "#5f9e5a", w: 0.32 });
    reg(hits, pumpValve.userData.wheel, "bypass-pump-valve");
    const primingValveGrp = group(pumpGrp, -0.2, 0.3, 0);
    const primingValve = valveWheel(primingValveGrp, 0, 0.05, 0, { r: 0.06, color: 0xe8b02e, body: 0x2b5a6a });
    holoTag(pumpGrp, "priming valve", -0.2, 0.5, 0, { css: "#5f9e5a", w: 0.3 });
    reg(hits, primingValve.userData.wheel, "pump-priming-valve");
    const hose = cyl(g, 0.05, 0.05, 1.6, -1.5, -0.1, 0.05, 0x2b3138, { rough: 0.7, seg: 10 });
    hose.rotation.z = Math.PI / 2;
    void hose;

    const dewMeter = instrument(g, -1.1, -0.14, 0.25, { idle: "-- NTU", color: 0x5f9e5a, w: 0.12, d: 0.19 });
    holoTag(g, "dewatering discharge meter", -1.1, 0.05, 0.25, { css: "#5f9e5a", w: 0.4 });
    reg(hits, dewMeter, "dewatering-meter");

    const dischargeHit = box(g, 0.3, 0.3, 0.3, -1.9, 0.1, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "discharge it unfiltered?", -1.9, 0.35, 0.05, { css: "#e8622a", w: 0.42 });
    reg(hits, dischargeHit, "dewater-discharge-unfiltered");

    // ------------------------------------------------------------- confined space board
    const csBoardGrp = holoPanel(g, 0.7, 0.5, 2.0, -0.05, 0.55, (cx, w, h) => {
      cx.fillStyle = "#1c0d0d"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#c8102e"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f4d8d8"; cx.fillText("CONFINED SPACE ENTRY", w * 0.07, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f0c9c9";
      ["Permit signed", "Attendant posted", "Atmosphere tested"].forEach((l, i) => cx.fillText(l, w * 0.07, h * (0.36 + i * 0.16)));
    }, { ry: -0.6, accent: 0xc8102e });
    reg(hits, csBoardGrp, "confined-space-board");
    const attendant = standingFigure(g, 2.6, 0.6, { ry: -2.2, cloth: 0x2b3138, vest: 0xe8622a });
    void attendant;
    const confinedHazHit = box(g, 0.3, 0.3, 0.3, 1.6, -0.1, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "enter the barrel without a permit?", 1.6, 0.15, 0.7, { css: "#e8622a", w: 0.48 });
    reg(hits, confinedHazHit, "confined-entry-no-permit");

    // -------------------------------------------------------------- culvert pipe
    const oldPipe = cyl(g, 0.28, 0.28, 2.2, 0, -0.18, 0.9, 0x6a6a6c, { rough: 0.8, metal: 0.2, seg: 14 });
    oldPipe.rotation.x = Math.PI / 2;
    void oldPipe;
    const boxCulvertHome = new THREE.Vector3(0.2, -0.05, 0.9);
    const baffle = group(g, -1.9, 0.7, 0.9);
    box(baffle, 0.9, 0.5, 0.9, 0, 0, 0, 0x8a8a8c, { rough: 0.85, metal: 0.1 });
    const tagLineHandle = group(baffle, 0.5, 0, 0);
    box(tagLineHandle, 0.04, 0.04, 0.2, 0, 0, 0, 0x2b3138, { rough: 0.7 });
    holoTag(baffle, "box culvert section — tag line", 0, 0.4, 0, { css: "#5f9e5a", w: 0.5 });
    reg(hits, tagLineHandle, "baffle-set");
    const baffleLiftHit = box(g, 0.3, 0.3, 0.3, -2.4, 0.9, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "muscle the section in solo?", -2.4, 1.15, 0.9, { css: "#e8622a", w: 0.44 });
    reg(hits, baffleLiftHit, "manual-lift-baffle");

    // -------------------------------------------------------------- backfill lifts
    for (const [id, y] of [["lift-bottom", -0.05], ["lift-mid", 0.08], ["lift-top", 0.2]]) {
      const lift = box(g, 1.1, 0.1, 1.0, 0.2, y, 0.9, 0x6a5c40, { rough: 0.95 });
      reg(hits, lift, id);
    }

    // ------------------------------------------------------------- invert grade
    const invertRod = group(g, 0.7, -0.12, 0.55);
    cyl(invertRod, 0.014, 0.014, 1.0, 0, 0.5, 0, 0xf2f6fa, { rough: 0.6, seg: 8 });
    for (let i = 1; i < 9; i++) box(invertRod, 0.05, 0.01, 0.03, 0, i * 0.11, 0.017, i % 5 === 0 ? 0xd2312b : 0x1b1e23, { rough: 0.7, cast: false });
    const invertReadout = instrument(invertRod, 0.12, 0.45, 0, { idle: "-- %", color: 0x5f9e5a, w: 0.12, d: 0.18 });
    holoTag(invertRod, "invert level rod", 0, 1.1, 0, { css: "#5f9e5a", w: 0.3 });
    reg(hits, invertRod, "invert-rod");

    // Blind spot cone and pinch point flag near the excavator.
    const blindSpotCone = cone(g, 0.3, -0.9, { color: 0xf2ae14 });
    void blindSpotCone;
    const blindSpotHit = box(g, 0.22, 0.3, 0.22, 0.3, -0.1, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, blindSpotHit, "blind-spot-cone");
    const pinchFlag = group(g, 2.1, -0.1, -0.3);
    cyl(pinchFlag, 0.008, 0.008, 0.3, 0, 0.15, 0, 0xc9b58c, { rough: 0.9, seg: 6 });
    box(pinchFlag, 0.06, 0.04, 0.006, 0, 0.28, 0, 0xf2ae14, { rough: 0.7 });
    reg(hits, pinchFlag, "pinch-point-flag");

    // --------------------------------------------------------------- closing log
    const logTable = group(g, 2.6, 0.341, 1.9, -0.3);
    box(logTable, 0.5, 0.02, 0.35, 0, 0.01, 0, 0x565656, { rough: 0.7, cast: false });
    const logDecal = decal(logTable, 0.3, 0.4, 0, 0.021, 0, paperFace("CULVERT LOG", ["Trench dug / alignment", "Discharge + invert readings", "Backfill lifts compacted", "Fish exclusion status"], { scale: 0.85 }));
    logDecal.rotation.x = -Math.PI / 2;
    holoTag(logTable, "log the retrofit", 0, 0.3, 0, { css: "#5f9e5a", w: 0.36 });
    reg(hits, logDecal, "closing-log");

    cone(g, -3.2, 2.5, { color: BRCF_ACCENT });
    cone(g, 3.2, 2.5, { color: BRCF_ACCENT });
    barrierPanel(g, 0, 2.6, { color: 0xe8b02e });

    let baffleHolding = false, pumpAmount = 0, pitFlooded = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.6, 0.4),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "dam-place") { damBundle.visible = false; damDeployed.visible = true; }
        if (step.id === "backfill-lifts") { /* lifts read complete via the checklist itself */ }
      },

      // Both interruptions really change the scene: the trench water level
      // visibly rises against the old invert, and the dig estop lights while
      // the fish marker sits directly in the bucket's path.
      onInterrupt(it) {
        if (it.id === "pump-loses-prime") {
          pitFlooded = true;
          trench.position.y += 0.08;
          primingValve.userData.wheel.material = mat(0xffee55, { emissive: 0xffee55, ei: 1.4, rough: 0.4 });
        }
        if (it.id === "fish-in-exclusion-zone") {
          digEstop.material = mat(0xffee55, { emissive: 0xffee55, ei: 1.6, rough: 0.4 });
          pool.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "pump-loses-prime") {
          pitFlooded = false;
          trench.position.y -= 0.08;
          primingValve.userData.wheel.material = mat(0xe8b02e, { rough: 0.5, metal: 0.3 });
        }
        if (it.id === "fish-in-exclusion-zone") {
          digEstop.material = mat(0xd2312b, { rough: 0.55 });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, -0.18, -2.1), 1.3, 0.35, -0.1);
        water.position.y = -0.24 + Math.sin(t * 1.2) * 0.006;
        void pitFlooded;

        const step = session?.step;
        if (step?.id === "excavator-swing" && session.track) {
          house.rotation.y = (session.track.v - 0.5) * 1.1;
        }
        if (step?.id === "pump-start" && session.turn) pumpAmount = session.turn.amount;
        pumpValveGrp.rotation.y = -pumpAmount * Math.PI * 2;

        if (step?.id === "baffle-set") baffleHolding = !!session.holding;
        if (baffleHolding) {
          baffle.position.lerp(boxCulvertHome, Math.min(1, dt * 1.2));
        }

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "dewatering-meter") {
            repaint(dewMeter.userData.screen, signFace(`${Math.round(gg.t * 40)} NTU`, { bg: "#0d1c14", accent: gg.t >= 0.4 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff3d8", scale: 0.6 }));
          }
          if (step?.id === "invert-grade") {
            repaint(invertReadout.userData.screen, signFace(`${(gg.t * 1.4).toFixed(2)}%`, { bg: "#0d1c14", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff3d8", scale: 0.6 }));
          }
        }
      },
    };
  },
};
