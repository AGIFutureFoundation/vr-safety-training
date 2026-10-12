import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat, mudflatFace, pavingFace,
} from "../citykit.js";
import { pickup } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Native Planting & Erosion Control Mats VR — Water &
// Environmental, Bay Restoration & Cleanup pack C.
//
// Revegetating a graded bank above a generic tidal bench with native plant
// plugs and coir erosion-control matting — not any one restoration site, and
// no claim about any one site's history. The mat and the planting are the
// same permit condition seen from two directions: the mat is what keeps the
// freshly graded soil on the slope until roots can do that job themselves,
// and the plugs are what eventually replace the mat as the thing holding the
// bank together. Skip the buffer around the nesting closure because the crew
// is "just planting, not digging," and the Endangered Species Act does not
// care which tool disturbed the cover — only that something did.

const BRNP_ACCENT = 0x5f9e5a;
const BRNP_FLAG = 0xe8622a;

export const SIM_BR_NATIVE_PLANTING_AND_EROSION_MATS = {
  id: "br-native-planting-and-erosion-mats",
  index: "br-c2",
  domain: "Environmental",
  trade: "Restoration laborer — native planting and erosion control crew",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "LIUNA Local 261 laborers — native planting and erosion control; OSHA 29 CFR 1926 general construction safety; U.S. Army Corps of Engineers Clean Water Act (CWA) Section 404 permit conditions; San Francisco Bay Regional Water Quality Control Board CWA Section 401 water quality certification; California Department of Fish and Wildlife Lake and Streambed Alteration Agreement; U.S. Fish and Wildlife Service Endangered Species Act nesting buffer; work window per the permit",
  name: "Native Planting & Erosion Control Mats",
  title: simTitle("Native Planting & Erosion Control Mats"),
  tagline: "Revegetating a graded bank on a permit and a buffer: plan and nesting closure checked, coir matting pinned top to bottom before a single plug goes in, holes bored and moisture read at the design depth, plants tamped in on a steady cart haul, the drip line opened, and the bench walked for anything the next gust or tide can still take",
  accent: BRNP_ACCENT,
  accentCss: "#5f9e5a",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "bank-held", name: "Bank Held", note: "Every mat pinned before the plugs went in, buffer never crossed, nothing left for the next gust to take — first time" },

  game: system({
    name: "Planting Crew",
    currency: "ROOT",
    ranks: ["Laborer", "Crew Hand", "Lead Hand", "Site Steward", "Restoration Certified"],
    badges: [
      { id: "buffer-held", name: "Buffer Held", note: "Never a hazard, never a step past the nesting closure", test: AWARD.safe },
      { id: "grade-true", name: "Moisture And Grade True", note: "Soil moisture and the auger depth both read inside the working band", test: AWARD.precise(0.7) },
      { id: "bench-first", name: "Plan Read Clean", note: "Planting plan and buffer both read clean before the first mat went down", test: AWARD.stepClean("buffer-check") },
    ],
    challenges: [
      { id: "clean-bank", name: "Clean Bank", note: "No corrections across the whole planting run", test: AWARD.clean },
      { id: "steady-haul", name: "Steady Haul", note: "Held the cart haul inside the working band the whole pass", test: AWARD.unbroken },
      { id: "bank-fast", name: "Bank Closed Fast", note: "Planting closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "slope-slip-no-cleats": "You started across the wet coir matting on the slope without the cleated boots staged for this ground. Coir over freshly graded soil is slick the moment the fog burns off or the sprinkler runs, and a slip here does not end at the mat — it ends downslope, on whatever the bench happens to be at the bottom of that fall.",
    "manual-lift-flat": "You went to muscle a full flat of plant plugs up the slope solo instead of walking it up on the cart or with a second hand. A loaded flat is an awkward, off-balance weight on ground that is already uneven, and a back strained on a plant flat is exactly as real an injury as one strained on anything heavier — it just happens to nobody's incident report until it does.",
    "staple-gun-freehand": "You fired the mat stapler without bracing the mat flat and keeping your free hand clear of the line the staple travels. A pneumatic stapler drives a staple hard enough to anchor coir into graded soil, and a hand in the wrong place when the trigger goes is not a scrape — it is a puncture wound that ends a shift.",
    "truck-unspotted-back": "You backed the pickup toward the slope edge without the spotter's call. The load bed blocks the driver's view of exactly the ground the crew is working on foot, and backing on a guess instead of a confirmed all-clear is how a truck finds a person the mirror never showed.",
  },

  lateNotes: {
    "mat-pin-top": "Pin from the top of the slope down — a mat pinned bottom-first leaves the upper edge free to lift the first time water runs under it.",
    "planting-auger": "Bore the planting holes only after the mat is pinned down — an auger through an unpinned mat just tears the hole it was supposed to plant through.",
    "plant-tamp": "Tamp the plug in only after the moisture reading confirms the hole, not before — a plug seated in a hole nobody has checked is a plug seated in a guess.",
  },

  // Interruptions: see shared/game.js. The first is the wind doing to a
  // freshly pinned mat exactly what the pins exist to prevent; the second is
  // the buffer doing its job the moment cover is disturbed nearby.
  interrupts: [
    {
      id: "gust-lifts-mat-corner",
      kind: "Wind gust lifts a pinned mat corner",
      after: "mat-pin", delay: 3, seconds: 13,
      alert: "A gust off the bay has caught the downslope corner of the mat you just pinned and worked one pin loose — the corner is standing up off the soil.",
      cue: "That corner needs re-staking now, not at the end of the pass — go re-drive the corner pin before the edge lifts any further.",
      target: "mat-corner-restake",
      why: "A mat corner standing proud of the soil is a lever the next gust gets a better grip on, and a mat that lifts at one corner peels back from that corner in exactly the way it is pinned in the first place to prevent — re-driving it the moment it is seen is what keeps one working pin from becoming a whole mat edge free of the slope.",
      missNote: "The corner stayed up while the crew kept working further down the slope, and by the time anyone came back to it the wind had worked a second pin loose beside the first — a two-pin repair instead of the one-pin fix that was available a few minutes earlier.",
      wrongNote: "That is not it. The lifted mat corner needs its own pin driven back down — nothing else on this slope puts it back against the soil.",
    },
    {
      id: "songbird-flushed-from-buffer",
      kind: "Songbird flushed from cover near the buffer",
      after: "plant-tamp", delay: 4, seconds: 12,
      alert: "A ground-nesting songbird broke from a clump of cover right at the edge of the buffer flag, close enough that the cart's next pass would have gone straight past it.",
      cue: "Stop work now at the buffer strobe. Nothing moves past that flag while a bird is on the ground beside it.",
      target: "buffer-estop",
      why: "A bird flushed from cover next to the buffer line is the closure doing exactly what it was drawn for — proof something was closer to the work than the flagged line assumed — and the crew stops at the strobe the moment that is seen, not once the current pass down the slope is finished.",
      missNote: "The cart kept moving down the slope past the flushed bird, and plugs went in within a few feet of where it went back to ground. A federally listed species disturbed by continuing work is not a near miss the Endangered Species Act or the CDFW streambed agreement treats as harmless because no plug ever touched the bird itself.",
      wrongNote: "It's the buffer stop-work strobe. Nothing else on this bank halts work at the closure the moment a bird is flushed beside it.",
    },
  ],

  steps: [
    {
      id: "check-in", kind: "select", target: "planting-plan-board",
      title: "Check the planting plan and the work window before staging",
      cue: "Read the planting plan, the 404 and 401 conditions, the streambed agreement, and the nesting buffer before any mat or plug is staged.",
      why: "This bank is planted under the same signatures the grading was cut under — the Corps' Section 404 permit, the Water Board's 401 certification, California Department of Fish and Wildlife's streambed alteration agreement, and a work window the permit itself sets — and a planting crew that skips the plan because 'it's just plants' is still bound by every condition on it.",
    },
    {
      id: "stage-ppe", kind: "sequence", anyOrder: true,
      targets: ["stage-gloves", "stage-hi-vis", "stage-eye"],
      itemNames: { "stage-gloves": "gloves", "stage-hi-vis": "high-visibility vest", "stage-eye": "eye protection" },
      title: "Stage the planting crew's PPE",
      cue: "Gloves, high-visibility vest and eye protection before anyone works the slope.",
      why: "Gloves are for the wire on the coir bales and the staple gun's own hardware; the vest is what lets the truck driver see a body on a slope the same colour as the graded soil; eye protection is for the staple gun's own kickback and whatever the auger throws when it bites into root-bound ground.",
    },
    {
      id: "find-zones", kind: "find", noHint: true,
      targets: ["zone-stake-1", "zone-stake-2", "zone-stake-3"],
      itemNames: { "zone-stake-1": "zone stake 1 — upper bank", "zone-stake-2": "zone stake 2 — mid-slope", "zone-stake-3": "zone stake 3 — toe" },
      itemNotes: {
        "zone-stake-1": "Stake 1 marks the upper bank zone. The mat and the plugs both start here, at the design template, not wherever the graded soil looks plantable this morning.",
        "zone-stake-2": "Stake 2 is the mid-slope control — the check that the planting zones are still following the design and not drifting off it a flat at a time.",
        "zone-stake-3": "Stake 3 marks the toe, where the planting bank meets the marsh bench. Past it belongs to a different crew's permit condition, not this one.",
      },
      title: "Find the survey stakes that set the planting zones",
      cue: "Walk the bank and click the three stakes the planting design is built from.",
      why: "The mat lines, the auger spacing and the plant species zones are all set against stakes a surveyor already placed, not against where the slope looks right from the truck. Finding all three before anything is staged is what keeps a whole afternoon of planting building the one permitted design instead of three honest guesses at it.",
    },
    {
      id: "buffer-check", kind: "select", target: "nesting-buffer-flag",
      title: "Confirm the nesting buffer is flagged before work starts",
      cue: "Check the buffer flag line along the cover at the toe of the slope before the first mat is carried down.",
      why: "The buffer exists because a bird low in dense cover cannot get up and clear a crew that is already working past it, and that is exactly as true for a planting crew stapling mat as it is for an excavator — the flag has to be checked and respected before anyone is close enough to the cover for it to matter.",
    },
    {
      id: "mat-haul", kind: "drag", target: "erosion-mat-roll",
      title: "Carry the erosion mat roll out to the slope",
      cue: "Carry the mat roll out and lay it along the marked line before pinning starts.",
      why: "A mat rolled out crooked leaves a gap at the seam for the first real rain to find, and re-rolling a mat that is already half-pinned costs the crew twice the time a straight lay would have taken — the line is set before the mat ever comes off the roll.",
      drag: { to: "mat-line", radius: 0.5, missNote: "Not on the line — the mat has to run straight down the slope or the seam opens a channel the first rain finds." },
    },
    {
      id: "mat-pin", kind: "sequence",
      targets: ["mat-pin-top", "mat-pin-mid", "mat-pin-toe"],
      itemNames: { "mat-pin-top": "pin — top of slope", "mat-pin-mid": "pin — mid-slope", "mat-pin-toe": "pin — toe" },
      title: "Pin the mat from the top of the slope down",
      cue: "Drive the pins in order: top of the slope first, then mid-slope, then the toe.",
      why: "A mat pinned top-first is held against the soil before gravity and water both start pulling on the loose end below it; pinned toe-first, the top edge stays free to lift on the very first gust or sheet of runoff, and the whole mat peels from the top exactly the way the bottom pin was supposed to prevent.",
      outOfOrderNote: "Top of the slope, then mid-slope, then the toe. A mat pinned from the bottom up leaves its own top edge loose for the wind to find first.",
    },
    {
      id: "bore-holes", kind: "turn", target: "planting-auger",
      title: "Bore the planting holes to design depth",
      cue: "Run the auger down through the pinned mat to the marked depth at each planting point.",
      why: "A plug set too shallow dries out and dies before its roots reach anything worth holding onto; set too deep, it drowns in its own hole the first time the ground is saturated. The auger's depth stop is what makes every hole on this slope the same hole, instead of however deep today's operator feels like digging.",
      turn: { turns: 0.8, axis: "y", label: "AUGER DEPTH" },
    },
    {
      id: "moisture-check", kind: "gauge", target: "soil-moisture-meter",
      title: "Read the soil moisture before committing the plugs",
      cue: "Take the moisture reading at the bored hole and commit it inside the planting band.",
      why: "A plug set into soil that is too dry never gets the establishment window it needs before the irrigation schedule catches up to it, and a plug set into soil that is still saturated from grading just rots at the root ball — the meter is what tells the crew this hole is ready instead of guessing from how the soil looks on top.",
      gauge: { label: "MOISTURE", speed: 0.7, green: [0.4, 0.62], readout: (t) => `${Math.round(t * 40)}%`, missNote: "Outside the planting band. Let the reading settle and commit again once the hole reads inside it." },
    },
    {
      id: "cart-haul", kind: "track", target: "plant-cart", seconds: 7,
      title: "Haul the plant cart along the slope",
      cue: "Walk the loaded cart along the bank at a steady pace, staying inside the working band.",
      why: "A steady pull keeps the cart's wheels tracking the bench instead of digging into the graded soil; too fast and it bounces plugs out of their flats on the uneven ground, too slow and it bogs down in the same soft ground the mats are there to protect from foot traffic in the first place.",
      track: { start: 0.1, green: [0.36, 0.58], rise: 0.55, fall: 0.45, drift: 0.12, label: "HAUL", readout: (v) => (v < 0.36 ? "stalled in the soil" : v > 0.58 ? "bouncing, too fast" : "steady pull") },
      holdBreakNote: "The pull broke and the cart settled into the soft ground. Bring it back to a steady pace before the wheels dig in further.",
    },
    {
      id: "plant-tamp", kind: "hold", target: "plant-tamp", seconds: 5,
      title: "Tamp the plug in and firm the soil around it",
      cue: "Set the plug in the bored hole and hold the tamp until the soil closes around the roots.",
      why: "A plug dropped in and left alone has air pockets around its roots that dry them out within a day; held and tamped until the soil closes solid, it is seated the way its own establishment depends on instead of sitting loose in a hole shaped like it but not actually holding it.",
      holdBreakNote: "The tamp lifted before the soil closed around the roots — reset it on the plug and hold until the fit is solid.",
    },
    {
      id: "irrigation-check", kind: "select", target: "drip-valve",
      title: "Open the temporary drip line for establishment watering",
      cue: "Confirm the drip valve for this zone is open before the crew moves to the next section.",
      why: "A native plug survives its own planting on the strength of the establishment watering that follows it, not on whatever rain happens to fall in the first few weeks — a valve left closed on a zone that was just planted is a zone that is already behind before the crew has even left the slope.",
    },
    {
      id: "spotter-checkin", kind: "select", target: "truck-spotter-radio",
      title: "Check in with the spotter before backing the truck",
      cue: "Call the spotter on the radio and get a clear signal before backing the pickup toward the slope for the next load.",
      why: "The truck bed blocks the driver's view of the exact ground the crew works on foot, and backing without the spotter's call is backing on a guess about people the mirror was never going to show in the first place.",
    },
    {
      id: "walk-hazards", kind: "find", noHint: true,
      targets: ["loose-staple-flag", "torn-mat-corner"],
      itemNotes: {
        "loose-staple-flag": "A staple sits proud of the mat here instead of flush — click it to confirm the crew has caught it before a boot or a knee finds it instead.",
        "torn-mat-corner": "This mat corner tore free during placement and needs a patch before the crew calls this section done.",
      },
      title: "Walk the bank and confirm nothing is left loose",
      cue: "Check the proud staple and the torn mat corner before the crew stands down for the day.",
      why: "A staple standing proud or a torn corner is easy to miss once the crew's attention has moved to the next zone, and walking the bank now, before anyone leaves, is the last chance to catch what tomorrow's foot traffic or the next rain would otherwise find on its own.",
    },
    {
      id: "log-planting", kind: "select", target: "closing-log",
      title: "Log the day's planting",
      cue: "Record the zones planted, the moisture readings, the mat pinned, and the buffer status for the crew's record.",
      why: "The next crew on this bank reads today's log, not today's memory of it — a planting run that was clean but never logged looks, from tomorrow's map, exactly like a bank nobody has touched yet, and a buffer status that was never written down is a fact the next shift has no way to confirm on its own.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BRNP_ACCENT);

    // ---------------------------------------------------------------- terrain
    // Upland staging pad toward +z where the truck parks, a wide graded slope
    // where the planting actually happens, marsh bench, mudflat and open
    // water toward -z so the bank reads as the top of the same restoration
    // reach the rest of pack C works lower down.
    const upland = box(g, 6.0, 0.3, 1.4, 0, 0.15, 1.95, 0x5a4a34, { rough: 0.96 });
    void upland;
    const padTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#4a4a4c", base2: "#3d3d40", seam: "rgba(0,0,0,0.4)" }), { repeat: 4, px: 256 });
    const pad = box(g, 6.0, 0.02, 1.4, 0, 0.311, 1.95, 0x4a4a4c, { rough: 0.9, cast: false });
    pad.material = texturedMat(padTex, { rough: 0.9, color: 0x9a9a9e });

    const slope = box(g, 6.0, 0.5, 1.7, 0, 0.2, 0.85, 0x4d3f2c, { rough: 0.96 });
    slope.rotation.x = 0.34;
    const bench = box(g, 6.0, 0.12, 1.4, 0, 0.06, -0.55, 0x4f4632, { rough: 0.95 });
    void bench;
    const mudTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#5a4a30", base2: "#463a24", cracks: 26, pools: 4 }), { repeat: 4, px: 256 });
    const mudflat = box(g, 6.0, 0.05, 0.8, 0, 0.025, -1.6, 0x5a4a30, { rough: 0.95, cast: false });
    mudflat.material = texturedMat(mudTex, { rough: 0.95, color: 0x8a7a58 });

    const waterTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#1c4a52"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 24; i++) {
        cx.strokeStyle = "rgba(180,220,225,0.10)"; cx.lineWidth = 1 + Math.random() * 2;
        cx.beginPath(); const y = Math.random() * h;
        cx.moveTo(0, y); cx.bezierCurveTo(w * 0.25, y + 16, w * 0.75, y - 16, w, y); cx.stroke();
      }
    }, { repeat: 4, px: 256 });
    const water = box(g, 6.0, 0.03, 0.7, 0, 0.012, -2.35, 0x1c4a52, { rough: 0.2, metal: 0.3, opacity: 0.88, transparent: true, cast: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x2c6a72 });
    water.material.transparent = true;
    water.material.opacity = 0.88;
    const wave = particles(g, 20, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.4 });
    wave.position.set(0, 0.03, -2.45);

    // -------------------------------------------------------- upland station
    const planBoard = holoPanel(g, 0.92, 0.62, -2.15, 1.08, 2.15, (cx, w, h) => {
      cx.fillStyle = "#0d1c14"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5f9e5a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff3d8"; cx.fillText("PLANTING PLAN — BANK 4", w * 0.06, h * 0.11);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#e7f7e0";
      ["USACE CWA §404 permit — this bank", "RWQCB CWA §401 water quality cert.",
       "CDFW streambed alteration agreement", "Nesting buffer per USFWS", "Work window per the permit"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.27 + i * 0.1)));
    }, { ry: 0.4, accent: BRNP_ACCENT });
    reg(hits, planBoard, "planting-plan-board");

    const truck = pickup(g, 2.3, 0.02, 2.0, { ry: Math.PI, livery: { colour: 0x3f6f4a, fleetName: "RESTORATION CREW", unitNumber: "P-4" } });
    void truck;

    const chest = toolChest(g, 0, 2.05, { color: 0x2f6f4a });
    for (const [id, dx, color, label] of [["stage-gloves", -0.2, 0x8a6a4a, "GLOVES"], ["stage-hi-vis", 0.0, 0xf2ae14, "HI-VIS"], ["stage-eye", 0.2, 0x2f4d3a, "EYE PRO"]]) {
      const it = group(chest, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#0d1c14", accent: "#dff3d8", scale: 0.42 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const crewUpland = standingFigure(g, -2.75, 0.15, { ry: 0.9, cloth: 0x2f4d3a, vest: 0xe8b02e });
    void crewUpland;

    // ---------------------------------------------------------- survey stakes
    for (const [id, x, z, label] of [["zone-stake-1", -2.0, 1.3, "ZONE 1"], ["zone-stake-2", 0.0, 0.85, "ZONE 2"], ["zone-stake-3", 2.0, 0.35, "ZONE 3"]]) {
      const st = group(g, x, 0.05, z);
      cyl(st, 0.012, 0.014, 0.5, 0, 0.25, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
      box(st, 0.09, 0.06, 0.01, 0, 0.46, 0, BRNP_FLAG, { rough: 0.75 });
      decal(st, 0.08, 0.04, 0, 0.46, 0.006, signFace(label, { bg: "#1b1e12", accent: "#dff3d8", scale: 0.55 }));
      reg(hits, st, id);
    }

    // ------------------------------------------------------------ buffer flag
    const bufferFlagGrp = group(g, 2.5, 0.02, -1.45);
    cyl(bufferFlagGrp, 0.012, 0.014, 0.45, 0, 0.22, 0, 0xc9b58c, { rough: 0.9, seg: 6 });
    box(bufferFlagGrp, 0.09, 0.06, 0.006, 0, 0.4, 0, BRNP_FLAG, { rough: 0.7 });
    holoTag(bufferFlagGrp, "nesting buffer — flagged", 0, 0.62, 0, { css: "#5f9e5a", w: 0.5 });
    reg(hits, bufferFlagGrp, "nesting-buffer-flag");

    const buffStrobe = group(g, 2.7, 0.05, -1.7);
    cyl(buffStrobe, 0.02, 0.02, 0.4, 0, 0.2, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
    const strobeLamp = ball(buffStrobe, 0.06, 0, 0.42, 0, 0x3c444c, { rough: 0.5, metal: 0.4, seg: 8 });
    holoTag(buffStrobe, "buffer stop-work strobe", 0, 0.58, 0, { css: "#5f9e5a", w: 0.42 });
    reg(hits, strobeLamp, "buffer-estop");

    const bird = group(g, 2.35, 0.05, -1.55);
    ball(bird, 0.05, 0, 0.05, 0, 0x6a5a3c, { rough: 0.8, seg: 8 });
    cone(g, -3.4, 2.3, { color: BRNP_ACCENT });
    void bird;

    // ------------------------------------------------------------ erosion mat
    const matBundle = group(g, -2.6, 0.12, 1.6, 0.3);
    cyl(matBundle, 0.09, 0.09, 0.65, 0, 0.09, 0, 0xa08a54, { rough: 0.9, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(matBundle, "erosion mat — rolled", 0, 0.28, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, matBundle, "erosion-mat-roll");
    const matLine = group(g, 0, 0.22, 0.85);
    hits["mat-line"] = matLine;

    const matDeployed = group(g, 0, 0.24, 0.85, 0.34);
    matDeployed.visible = false;
    slab(matDeployed, 5.4, 1.5, 0.02, 0, 0, 0, 0x7a6238, { rough: 0.98, opacity: 0.92, transparent: true, cast: false });
    for (let i = -2.4; i <= 2.4; i += 0.6) cyl(matDeployed, 0.02, 0.02, 1.5, i, 0.012, 0, 0x5a4a2c, { rough: 0.95, seg: 6 }).rotation.x = Math.PI / 2;

    const pinPositions = { "mat-pin-top": [-1.6, 0.4, 0.55], "mat-pin-mid": [0.1, 0.28, 0.85], "mat-pin-toe": [1.8, 0.16, 1.15] };
    const pinMeshes = {};
    for (const [id, [x, y, z]] of Object.entries(pinPositions)) {
      const pin = group(g, x, y, z);
      cyl(pin, 0.01, 0.012, 0.14, 0, 0.07, 0, 0xc9b58c, { rough: 0.85, seg: 6 });
      reg(hits, pin, id);
      pinMeshes[id] = pin;
    }
    const restakeTarget = group(g, -1.6, 0.4, 0.55);
    reg(hits, restakeTarget, "mat-corner-restake");

    // ------------------------------------------------------------- auger + moisture
    const augerGrp = group(g, -0.9, 0.05, 1.35);
    cyl(augerGrp, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    const augerHandleGrp = group(augerGrp, 0, 0.85, 0);
    const augerHandle = valveWheel(augerHandleGrp, 0, 0.06, 0, { r: 0.09, color: 0x5f9e5a, body: 0x2b5a6a });
    holoTag(augerGrp, "planting auger", 0, 1.1, 0, { css: "#5f9e5a", w: 0.36 });
    reg(hits, augerHandle.userData.wheel, "planting-auger");

    const moistureMeter = instrument(g, -0.55, 0.05, 1.5, { idle: "-- %", color: 0x5f9e5a, w: 0.12, d: 0.18 });
    holoTag(g, "soil moisture meter", -0.55, 0.24, 1.5, { css: "#5f9e5a", w: 0.36 });
    reg(hits, moistureMeter, "soil-moisture-meter");

    // ---------------------------------------------------------------- cart + plant
    const cartHome = new THREE.Vector3(-2.5, 0.2, 1.0);
    const cartEnd = new THREE.Vector3(2.2, 0.16, 1.2);
    const cart = group(g, cartHome.x, cartHome.y, cartHome.z);
    box(cart, 0.5, 0.3, 0.7, 0, 0.15, 0, 0x3c444c, { rough: 0.6, metal: 0.4 });
    for (const dx of [-0.2, 0.2]) cyl(cart, 0.08, 0.08, 0.05, dx, 0.06, 0.3, 0x1b1e23, { rough: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    const plugTray = group(cart, 0, 0.32, 0);
    const plugs = [];
    for (let i = 0; i < 6; i++) {
      const px = -0.16 + (i % 3) * 0.16, pz = -0.2 + Math.floor(i / 3) * 0.2;
      plugs.push(cyl(plugTray, 0.02, 0.02, 0.12, px, 0.06, pz, 0x3f6b3a, { rough: 0.9, seg: 8 }));
    }
    holoTag(cart, "plant cart — haul it in", 0, 0.5, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, cart, "plant-cart");

    const tampTarget = group(g, -0.55, 0.05, 1.35);
    reg(hits, tampTarget, "plant-tamp");

    const liftHit = box(g, 0.3, 0.3, 0.3, -2.6, 0.5, 1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "muscle the flat up solo?", -2.6, 0.75, 1.0, { css: "#e8622a", w: 0.4 });
    reg(hits, liftHit, "manual-lift-flat");

    const staplerHit = box(g, 0.3, 0.3, 0.3, -1.2, 0.4, 1.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "fire the stapler freehand?", -1.2, 0.65, 1.15, { css: "#e8622a", w: 0.42 });
    reg(hits, staplerHit, "staple-gun-freehand");

    const slipHit = box(g, 0.3, 0.3, 0.3, 0.9, 0.4, 0.95, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cross the mat without cleats?", 0.9, 0.65, 0.95, { css: "#e8622a", w: 0.44 });
    reg(hits, slipHit, "slope-slip-no-cleats");

    const backHit = box(g, 0.3, 0.3, 0.3, 2.3, 0.4, 1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "back the truck unspotted?", 2.3, 0.65, 1.5, { css: "#e8622a", w: 0.44 });
    reg(hits, backHit, "truck-unspotted-back");

    // ---------------------------------------------------------------- drip valve
    const dripGrp = group(g, -1.9, 0.05, -0.4);
    cyl(dripGrp, 0.02, 0.024, 0.3, 0, 0.15, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
    const dripWheel = valveWheel(dripGrp, 0, 0.32, 0, { r: 0.07, color: 0x5f9e5a, body: 0x2b5a6a });
    holoTag(dripGrp, "drip line valve", 0, 0.56, 0, { css: "#5f9e5a", w: 0.36 });
    reg(hits, dripWheel.userData.wheel, "drip-valve");

    // ------------------------------------------------------------- spotter + radio
    const spotter = standingFigure(g, 2.6, -0.3, { ry: -1.6, cloth: 0x2b3138, vest: 0xe8622a });
    const radioProp = group(spotter, 0.14, 0.9, 0.05);
    box(radioProp, 0.05, 0.11, 0.03, 0, 0, 0, 0x1b1e23, { rough: 0.7 });
    holoTag(spotter, "spotter — radio check-in", 0, 1.85, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, radioProp, "truck-spotter-radio");

    // -------------------------------------------------------------- walk-round
    const staple = box(g, 0.02, 0.03, 0.02, 1.1, 0.24, 0.7, 0xc9b58c, { rough: 0.7 });
    reg(hits, staple, "loose-staple-flag");
    const tornCorner = box(g, 0.2, 0.02, 0.15, -1.9, 0.25, 0.5, 0x7a6238, { rough: 0.98 });
    tornCorner.rotation.z = 0.3;
    reg(hits, tornCorner, "torn-mat-corner");

    // --------------------------------------------------------------- closing log
    const logTable = group(g, -2.3, 0.311, 1.9, -0.3);
    box(logTable, 0.5, 0.02, 0.35, 0, 0.01, 0, 0x565656, { rough: 0.7, cast: false });
    const logDecal = decal(logTable, 0.3, 0.4, 0, 0.021, 0, paperFace("PLANTING LOG", ["Zones planted, plug counts", "Moisture + auger readings", "Mat pinned, top to toe", "Buffer status — clean / crossed"], { scale: 0.85 }));
    logDecal.rotation.x = -Math.PI / 2;
    holoTag(logTable, "log the planting", 0, 0.3, 0, { css: "#5f9e5a", w: 0.38 });
    reg(hits, logDecal, "closing-log");

    cone(g, -3.2, 2.4, { color: BRNP_ACCENT });
    cone(g, 3.2, 2.4, { color: BRNP_ACCENT });
    barrierPanel(g, 0, 2.5, { color: 0xe8b02e });

    let tamping = false, augerAmount = 0, cartMoved = false, dripAmount = 0;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, 0.9),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "mat-haul") { matBundle.visible = false; matDeployed.visible = true; }
        if (step.id === "mat-pin") { for (const p of Object.values(pinMeshes)) p.material = mat(0x59c97b, { rough: 0.7 }); }
        if (step.id === "cart-haul") { cart.position.copy(cartEnd); cartMoved = true; }
        if (step.id === "walk-hazards") { staple.visible = false; tornCorner.visible = false; }
      },

      // Both interruptions really change the scene: the mat corner visibly
      // lifts off the slope, and the buffer strobe lights while the bird
      // marker actually moves off.
      onInterrupt(it) {
        if (it.id === "gust-lifts-mat-corner") {
          const pin = pinMeshes["mat-pin-top"];
          if (pin) { pin.position.y += 0.12; pin.rotation.z = 0.6; }
        }
        if (it.id === "songbird-flushed-from-buffer") {
          strobeLamp.material = mat(0xffee55, { emissive: 0xffee55, ei: 1.6, rough: 0.4 });
          bird.position.set(2.6, 0.4, -1.2);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-lifts-mat-corner") {
          const pin = pinMeshes["mat-pin-top"];
          if (pin) { pin.position.y -= 0.12; pin.rotation.z = 0; }
        }
        if (it.id === "songbird-flushed-from-buffer") {
          strobeLamp.material = mat(0x3c444c, { rough: 0.5, metal: 0.4 });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, 0.02, -2.6), 1.3, 0.35, -0.1);
        water.position.y = 0.012 + Math.sin(t * 1.2) * 0.006;

        const step = session?.step;
        if (step?.id === "bore-holes" && session.turn) augerAmount = session.turn.amount;
        augerHandleGrp.rotation.y = -augerAmount * Math.PI * 2;

        if (step?.id === "plant-tamp") tamping = !!session.holding;
        for (const plug of plugs) plug.position.y = tamping ? 0.06 + Math.sin(t * 6) * 0.02 : 0.06;

        if (step?.id === "drip-valve" && session.turn) dripAmount = session.turn.amount;
        void dripAmount;

        if (cartMoved) for (let i = 0; i < plugs.length; i++) plugs[i].position.y = 0.06 + Math.sin(t * 1.5 + i) * 0.002;

        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "moisture-check") {
          repaint(moistureMeter.userData.screen, signFace(`${Math.round(gg.t * 40)}%`, { bg: "#0d1c14", accent: gg.t >= 0.4 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#dff3d8", scale: 0.6 }));
        }
      },
    };
  },
};
