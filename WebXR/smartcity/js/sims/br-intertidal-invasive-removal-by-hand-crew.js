import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat, mudflatFace, pavingFace,
} from "../citykit.js";
import { cargoVan } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Intertidal Invasive Removal By Hand Crew VR — Water &
// Environmental, Bay Restoration & Cleanup pack C.
//
// Hand-pulling an invasive stand out of the upper intertidal on a generic
// restoration bench — not any one marsh, and no claim about any one site's
// history, and not the herbicide-and-drift-card job a Spartina crew runs
// elsewhere in this catalogue. This crew carries no sprayer at all: every
// plant comes out by the root, on a wrench or by hand, which means the job's
// whole risk sits in two places a sprayer crew never has to think about —
// the fragment of root left behind that resprouts before anyone notices, and
// the fragment carried out on a boot into ground that was never invaded in
// the first place. Neither one looks like an incident. Both undo the season.

const BRIR_ACCENT = 0x5f9e5a;
const BRIR_FLAG = 0xe8622a;

export const SIM_BR_INTERTIDAL_INVASIVE_REMOVAL_BY_HAND_CREW = {
  id: "br-intertidal-invasive-removal-by-hand-crew",
  index: "br-c5",
  domain: "Environmental",
  trade: "Invasive species control laborer — hand-removal crew",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "clear",
  certification: "LIUNA Local 261 laborers — hand-removal and biosecurity crew; OSHA 29 CFR 1926 general construction safety; U.S. Army Corps of Engineers Clean Water Act (CWA) Section 404 permit conditions; San Francisco Bay Regional Water Quality Control Board CWA Section 401 water quality certification for decon wash water; San Francisco Bay Conservation and Development Commission (BCDC) permit; California Department of Fish and Wildlife habitat protections; U.S. Fish and Wildlife Service Endangered Species Act nesting buffer; work window per the permit",
  name: "Intertidal Invasive Removal By Hand Crew",
  title: simTitle("Intertidal Invasive Removal By Hand Crew"),
  tagline: "Hand-pulling an invasive stand out of the upper intertidal with no sprayer at all: zones and buffer checked, roots levered whole and fragments hunted out of the disturbed soil, every bag tagged and held shut against the wind, boots decontaminated between zones, and the bench walked before a single stray fragment gets the chance to resprout or hitch a ride into clean ground",
  accent: BRIR_ACCENT,
  accentCss: "#5f9e5a",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "root-and-branch", name: "Root And Branch", note: "Every fragment found, every boot decontaminated, buffer never crossed — first time" },

  game: system({
    name: "Removal Crew",
    currency: "ROOTWAD",
    ranks: ["Laborer", "Crew Hand", "Lead Hand", "Site Steward", "Invasive Control Certified"],
    badges: [
      { id: "no-spread", name: "No Spread", note: "Never a hazard, boots decontaminated between every zone", test: AWARD.safe },
      { id: "clean-decon", name: "Decon Read Clean", note: "The decon wash reading held inside the safe band", test: AWARD.precise(0.7) },
      { id: "zones-first", name: "Zones Read Clean", note: "Zones and buffer both read clean before the first plant came out", test: AWARD.stepClean("buffer-check") },
    ],
    challenges: [
      { id: "clean-bench", name: "Clean Bench", note: "No corrections across the whole removal run", test: AWARD.clean },
      { id: "steady-haul", name: "Steady Haul", note: "Held the cart haul inside the working band the whole pass", test: AWARD.unbroken },
      { id: "bench-fast", name: "Bench Cleared Fast", note: "Removal closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wrench-pinch-point": "You worked the weed wrench's lever without keeping your other hand clear of the jaw pivot. The jaw closes on the root with enough force to lever a whole plant out of wet ground, and a finger caught in that pivot when the lever comes down does not get a warning first.",
    "cross-contaminate-boots": "You walked from the treatment zone into the clean buffer without decontaminating your boots first. A root fragment small enough to hide in a boot tread is exactly large enough to start a new stand, and carrying one across the line the decon station exists to hold undoes the whole reason this crew works zone by zone instead of wherever looks thick that day.",
    "manual-lift-bag-solo": "You went to swing a full disposal bag onto the cart by yourself instead of getting a second set of hands. A bag this size is a wet, awkward weight with no good grip on it, and a back strained loading it is exactly the injury the second person on this crew was there to prevent.",
    "truck-unspotted-back": "You backed the van toward the staging area without the spotter's call. The van's own body blocks the driver's view of the exact ground the crew works on foot, and backing on a guess instead of a confirmed all-clear is how a vehicle finds a person the mirror never showed.",
  },

  lateNotes: {
    "weed-wrench": "Lever the plant out only after the zone is confirmed and the buffer is checked — pulling ahead of either one is pulling material nobody has cleared this crew to touch yet.",
    "boot-brush": "Decontaminate boots only after the bags from this zone are tagged and sealed — brushing off early just means walking back into the treatment zone still carrying whatever the last plant left on your boots.",
    "van-spotter-radio": "Check in with the spotter only once the cart is loaded and ready to move — calling it in before there is anything to back up to just wastes the spotter's attention on nothing.",
  },

  // Interruptions: see shared/game.js. The first is the wind doing to an
  // open bag exactly what the wind does to anything open on a tidal bench;
  // the second is the buffer doing its job the moment cover is disturbed.
  interrupts: [
    {
      id: "gust-scatters-fragments",
      kind: "Wind gust scatters fragments from an open bag",
      after: "bag-and-tag", delay: 3, seconds: 12,
      alert: "A gust off the bay caught one of the tagged bags before it was cinched, and loose fragments are already blowing back across the ground the crew just cleared.",
      cue: "Throw the wind guard over the open bags now, before more fragments scatter.",
      target: "wind-guard",
      why: "A fragment that blows back onto cleared ground is a fragment this crew now has to find a second time, if anyone finds it at all — the wind guard is what keeps an unsealed bag from undoing a zone's worth of work in the time it takes to notice the gust.",
      missNote: "The gust kept scattering fragments while the crew finished tagging the other bags, and by the time anyone reached the guard, loose material had already blown past the treatment line into ground the crew had just cleared.",
      wrongNote: "That is not it. The wind guard is what goes over the open bags — nothing else on this bench stops the gust from scattering them further.",
    },
    {
      id: "bird-flushed-near-buffer",
      kind: "Bird flushed from cover near the buffer",
      after: "weed-wrench", delay: 4, seconds: 12,
      alert: "A ground-nesting bird broke from a clump of cover right at the edge of the buffer flag, close enough that the next wrench pull would have gone straight past it.",
      cue: "Stop work now at the buffer strobe. Nothing moves past that flag while a bird is on the ground beside it.",
      target: "buffer-estop",
      why: "A bird flushed from cover next to the buffer line is the closure doing exactly what it was drawn for — proof something was closer to the work than the flagged line assumed — and the crew stops at the strobe the moment that is seen, not once the current plant is fully out of the ground.",
      missNote: "The crew kept pulling plants past the flushed bird, and the wrench went in again within a few feet of where it went back to ground. A federally listed species disturbed by continuing work is not a near miss the Endangered Species Act treats as harmless just because no wrench ever touched the bird itself.",
      wrongNote: "It's the buffer stop-work strobe. Nothing else on this bench halts work at the closure the moment a bird is flushed beside it.",
    },
  ],

  steps: [
    {
      id: "check-in", kind: "select", target: "removal-plan-board",
      title: "Check the removal plan and the work window before staging",
      cue: "Read the treatment zones, the 404 and 401 conditions, the habitat protections, and the nesting buffer before any tool is staged.",
      why: "This bench is worked under the same signatures the rest of the restoration crew answers to — the Corps' Section 404 permit, the Water Board's 401 certification for the decon wash water, California Department of Fish and Wildlife's habitat protections, and a nesting buffer the permit itself sets — and a hand crew that skips the plan because 'it's just pulling weeds' is still bound by every condition on it.",
    },
    {
      id: "stage-ppe", kind: "sequence", anyOrder: true,
      targets: ["stage-gloves", "stage-hi-vis", "stage-eye"],
      itemNames: { "stage-gloves": "gloves", "stage-hi-vis": "high-visibility vest", "stage-eye": "eye protection" },
      title: "Stage the removal crew's PPE",
      cue: "Gloves, high-visibility vest and eye protection before anyone works the treatment zone.",
      why: "Gloves are for whatever the invasive stand's own stems and the wrench's jaw both do to bare skin over a full shift; the vest is what lets the van driver see a body on a bench the same colour as the exposed mud; eye protection is for the whip-back a root gives the moment the wrench finally breaks it free.",
    },
    {
      id: "find-zones", kind: "find", noHint: true,
      targets: ["zone-stake-1", "zone-stake-2", "zone-stake-3"],
      itemNames: { "zone-stake-1": "zone stake 1 — treatment start", "zone-stake-2": "zone stake 2 — mid-bench", "zone-stake-3": "zone stake 3 — treatment end" },
      itemNotes: {
        "zone-stake-1": "Stake 1 marks where today's treatment zone starts. The crew works from here, not from wherever the stand looks thickest.",
        "zone-stake-2": "Stake 2 is the mid-bench control — it is what tells the crew the zone is being worked systematically instead of skipped over in patches.",
        "zone-stake-3": "Stake 3 marks where today's zone ends. Past it is tomorrow's zone, or the buffer, not today's work.",
      },
      title: "Find the stakes that set today's treatment zone",
      cue: "Walk the bench and click the three stakes the treatment zone is built from.",
      why: "A bench worked without a marked zone gets the easy plants close to the trail and misses whatever is past the last convenient stopping point — finding all three stakes first is what turns removal into a zone the whole crew covers instead of three honest guesses at where the stand is worst.",
    },
    {
      id: "buffer-check", kind: "select", target: "nesting-buffer-flag",
      title: "Confirm the nesting buffer is flagged before work starts",
      cue: "Check the buffer flag line along the cover at the edge of the zone before the first plant is pulled.",
      why: "The buffer exists because a bird low in dense cover cannot get up and clear a hand crew that is already working past it, and that is exactly as true for a crew pulling plants by hand as it is for an excavator — the flag has to be checked and respected before anyone is close enough to the cover for it to matter.",
    },
    {
      id: "weed-wrench", kind: "turn", target: "weed-wrench",
      title: "Lever the plant out whole with the weed wrench",
      cue: "Set the wrench's jaw at the base of the stem and lever the whole root out of the ground.",
      why: "A plant cut at the surface just regrows from whatever root stays in the ground; the wrench's jaw is built to grip below the crown and lever the entire root mass out in one motion, which is the only way this crew's work actually reduces the stand instead of just mowing it for a season.",
      turn: { turns: 0.8, axis: "y", label: "WEED WRENCH" },
    },
    {
      id: "find-fragments", kind: "find", noHint: true,
      targets: ["root-fragment-1", "root-fragment-2"],
      itemNotes: {
        "root-fragment-1": "A root fragment broke off during the pull and is still in the disturbed soil — left here, it resprouts before the season is out.",
        "root-fragment-2": "A second fragment sits half-buried nearby. Every fragment left behind is a plant this crew will be pulling again next season.",
      },
      title: "Hunt the disturbed soil for root fragments",
      cue: "Check the freshly disturbed ground for any fragment the wrench left behind.",
      why: "A fragment left in the soil looks like nothing to a crew that has already moved on to the next plant, and it is exactly what turns a zone marked complete into a zone that needs the same work again next season — checking now, while the soil is still disturbed and the fragment is still visible, is the only point in the whole job this is easy to catch.",
    },
    {
      id: "bag-hold", kind: "hold", target: "disposal-bag", seconds: 5,
      title: "Hold the disposal bag open while it's loaded",
      cue: "Hold the bag's mouth open while the crew stuffs the pulled material and fragments into it.",
      why: "A bag that collapses shut mid-load spills whatever was already in it back onto the ground the crew just cleared — held open and steady until it's full, it stays a bag doing its job instead of one more thing the wind gets to undo.",
      holdBreakNote: "The bag's mouth closed before it was full — reopen it and hold steady until the load is all the way in.",
    },
    {
      id: "bag-and-tag", kind: "sequence", anyOrder: true,
      targets: ["bag-1", "bag-2", "bag-3"],
      itemNames: { "bag-1": "bag — zone 1", "bag-2": "bag — zone 2", "bag-3": "bag — zone 3" },
      title: "Tag each filled bag with its zone",
      cue: "Tag all three filled bags with the zone they came from before they leave the bench.",
      why: "A bag that reaches the landfill without its zone tag is a bag nobody can trace back to confirm the zone was actually cleared, and this material is landfilled rather than composted specifically because composting does not reliably kill every fragment — the tag is what keeps that chain of custody honest all the way to disposal.",
    },
    {
      id: "boot-brush", kind: "turn", target: "boot-brush",
      title: "Decontaminate boots at the brush station between zones",
      cue: "Work each boot across the brush station's bristles before crossing into the next zone or the buffer.",
      why: "A boot tread holds a fragment small enough to be invisible and large enough to start a new stand, and the brush station is the one control between a fragment riding out on somebody's boot and that fragment staying exactly where the crew already dealt with it.",
      turn: { turns: 0.6, axis: "y", label: "BOOT BRUSH" },
    },
    {
      id: "decon-check", kind: "gauge", target: "decon-meter",
      title: "Read the decon wash water turbidity",
      cue: "Take the reading on the decon station's wash water and commit it inside the permit's limit.",
      why: "The 401 certification treats the decon station's own runoff the same as any other discharge on this bench — reading the meter is what confirms the wash water is still within the permitted limit instead of assuming it is because the brushes look like they're doing their job.",
      gauge: { label: "TURBIDITY", speed: 0.7, green: [0.4, 0.6], readout: (t) => `${Math.round(t * 40)} NTU`, missNote: "Outside the permit's limit. Let the reading settle and commit again once the wash water clears." },
    },
    {
      id: "haul-bag", kind: "drag", target: "loaded-bag",
      title: "Haul the loaded bag out to the cart",
      cue: "Carry the sealed bag out to the cart before it is left sitting on the treatment zone.",
      why: "A bag left sitting on the bench is a bag the next tide or the next gust gets another chance at — moving it to the cart the moment it's sealed is what keeps a cleared zone from quietly becoming a re-seeded one before the crew is even off the bench.",
      drag: { to: "cart-line", radius: 0.5, missNote: "Not at the cart — a bag left short of it is a bag still sitting where the wind can still reach it." },
    },
    {
      id: "cart-haul", kind: "track", target: "removal-cart", seconds: 7,
      title: "Haul the loaded cart to the staging area",
      cue: "Walk the cart along the bench at a steady pace, staying inside the working band.",
      why: "A steady pull keeps the cart's wheels tracking the firm ground instead of digging into the soft bench; too fast and bags bounce loose on the uneven ground, too slow and the cart bogs down in exactly the soft soil the whole crew has been working hard not to compact any further than the treatment already has.",
      track: { start: 0.1, green: [0.36, 0.58], rise: 0.55, fall: 0.45, drift: 0.12, label: "HAUL", readout: (v) => (v < 0.36 ? "stalled in the soil" : v > 0.58 ? "bouncing, too fast" : "steady pull") },
      holdBreakNote: "The pull broke and the cart settled into the soft ground. Bring it back to a steady pace before the wheels dig in further.",
    },
    {
      id: "cargo-van-spotter", kind: "select", target: "van-spotter-radio",
      title: "Check in with the spotter before backing the van",
      cue: "Call the spotter on the radio and get a clear signal before backing the van to load the bagged material.",
      why: "The van's own body blocks the driver's view of the exact ground the crew works on foot, and backing without the spotter's call is backing on a guess about people the mirror was never going to show in the first place.",
    },
    {
      id: "walk-hazards", kind: "find", noHint: true,
      targets: ["missed-fragment-flag", "untagged-bag"],
      itemNotes: {
        "missed-fragment-flag": "A fragment sits here that the first pass missed — click it to confirm the crew catches it before it has the chance to resprout.",
        "untagged-bag": "This bag never got its zone tag. Untraced, nobody downstream can confirm which zone it came from.",
      },
      title: "Walk the bench and confirm nothing is left behind",
      cue: "Check the missed fragment and the untagged bag before the crew calls this zone done.",
      why: "A fragment missed on the first pass or a bag that never got tagged is easy to overlook once the crew's attention has moved to loading the van — walking the zone now, before anyone leaves, is the last chance to catch what next season would otherwise find instead.",
    },
    {
      id: "log-removal", kind: "select", target: "closing-log",
      title: "Log the day's removal",
      cue: "Record the zones cleared, the bags tagged, the decon readings, and the buffer status for the crew's record.",
      why: "The next crew on this bench reads today's log, not today's memory of it — a removal run that was clean but never logged looks, from tomorrow's map, exactly like a zone nobody has treated yet, and a buffer status that was never written down is a fact the next shift has no way to confirm on its own.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BRIR_ACCENT);

    // ---------------------------------------------------------------- terrain
    // Upland staging pad toward +z where the van parks, a wide upper-intertidal
    // bench where the invasive stand and the removal happen, mudflat and open
    // water toward -z.
    const upland = box(g, 6.0, 0.3, 1.3, 0, 0.15, 1.9, 0x5a4a34, { rough: 0.96 });
    void upland;
    const padTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#4a4a4c", base2: "#3d3d40", seam: "rgba(0,0,0,0.4)" }), { repeat: 4, px: 256 });
    const pad = box(g, 6.0, 0.02, 1.3, 0, 0.311, 1.9, 0x4a4a4c, { rough: 0.9, cast: false });
    pad.material = texturedMat(padTex, { rough: 0.9, color: 0x9a9a9e });

    const slope = box(g, 6.0, 0.4, 0.6, 0, 0.14, 1.1, 0x4d3f2c, { rough: 0.96 });
    slope.rotation.x = 0.3;
    const benchTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#5a6a3a", base2: "#465428", cracks: 8, pools: 3 }), { repeat: 4, px: 256 });
    const bench = box(g, 6.0, 0.1, 1.8, 0, 0.02, 0.1, 0x5a6a3a, { rough: 0.92, cast: false });
    bench.material = texturedMat(benchTex, { rough: 0.92, color: 0x7a8a54 });

    const waterTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#1c4a52"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 22; i++) {
        cx.strokeStyle = "rgba(180,220,225,0.10)"; cx.lineWidth = 1 + Math.random() * 2;
        cx.beginPath(); const y = Math.random() * h;
        cx.moveTo(0, y); cx.bezierCurveTo(w * 0.25, y + 16, w * 0.75, y - 16, w, y); cx.stroke();
      }
    }, { repeat: 4, px: 256 });
    const water = box(g, 6.0, 0.03, 0.7, 0, 0.012, -1.5, 0x1c4a52, { rough: 0.2, metal: 0.3, opacity: 0.88, transparent: true, cast: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x2c6a72 });
    water.material.transparent = true;
    water.material.opacity = 0.88;
    const wave = particles(g, 20, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.4 });
    wave.position.set(0, 0.03, -1.55);

    // Invasive stand: a scatter of upright stems the crew works through.
    const standGrp = group(g, 0.4, 0.05, 0.4);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2, r = 0.5 + (i % 3) * 0.2;
      cyl(standGrp, 0.015, 0.02, 0.35 + (i % 2) * 0.1, Math.cos(a) * r, 0.17, Math.sin(a) * r * 0.6, 0x5a7a3a, { rough: 0.9, seg: 6 });
    }

    // -------------------------------------------------------- upland station
    const planBoard = holoPanel(g, 0.92, 0.62, -2.15, 1.08, 2.15, (cx, w, h) => {
      cx.fillStyle = "#0d1c14"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5f9e5a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff3d8"; cx.fillText("REMOVAL PLAN — ZONE 5", w * 0.06, h * 0.11);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#e7f7e0";
      ["USACE CWA §404 permit — this bench", "RWQCB CWA §401 — decon wash water",
       "CDFW habitat protections apply", "Nesting buffer per USFWS", "Hand removal only — no herbicide"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.27 + i * 0.1)));
    }, { ry: 0.4, accent: BRIR_ACCENT });
    reg(hits, planBoard, "removal-plan-board");

    const van = cargoVan(g, 2.3, 0.02, 2.0, { ry: Math.PI, livery: { colour: 0x3f6f4a, fleetName: "INVASIVE CONTROL", unitNumber: "V-5" } });
    void van;

    const chest = toolChest(g, 0, 2.05, { color: 0x2f6f4a });
    for (const [id, dx, color, label] of [["stage-gloves", -0.2, 0x8a6a4a, "GLOVES"], ["stage-hi-vis", 0.0, 0xf2ae14, "HI-VIS"], ["stage-eye", 0.2, 0x2f4d3a, "EYE PRO"]]) {
      const it = group(chest, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#0d1c14", accent: "#dff3d8", scale: 0.42 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const crewUpland = standingFigure(g, -2.75, 0.9, { ry: 0.9, cloth: 0x2f4d3a, vest: 0xe8b02e });
    void crewUpland;

    // ---------------------------------------------------------- zone stakes
    for (const [id, x, z, label] of [["zone-stake-1", -1.9, 1.2, "ZONE START"], ["zone-stake-2", 0.2, 0.7, "ZONE MID"], ["zone-stake-3", 2.1, 0.2, "ZONE END"]]) {
      const st = group(g, x, 0.05, z);
      cyl(st, 0.012, 0.014, 0.5, 0, 0.25, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
      box(st, 0.09, 0.06, 0.01, 0, 0.46, 0, BRIR_FLAG, { rough: 0.75 });
      decal(st, 0.08, 0.04, 0, 0.46, 0.006, signFace(label, { bg: "#1b1e12", accent: "#dff3d8", scale: 0.42 }));
      reg(hits, st, id);
    }

    // ------------------------------------------------------------ buffer flag
    const bufferFlagGrp = group(g, -2.3, 0.02, -1.0);
    cyl(bufferFlagGrp, 0.012, 0.014, 0.45, 0, 0.22, 0, 0xc9b58c, { rough: 0.9, seg: 6 });
    box(bufferFlagGrp, 0.09, 0.06, 0.006, 0, 0.4, 0, BRIR_FLAG, { rough: 0.7 });
    holoTag(bufferFlagGrp, "nesting buffer — flagged", 0, 0.62, 0, { css: "#5f9e5a", w: 0.5 });
    reg(hits, bufferFlagGrp, "nesting-buffer-flag");

    const buffStrobe = group(g, -2.5, 0.05, -1.25);
    cyl(buffStrobe, 0.02, 0.02, 0.4, 0, 0.2, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
    const strobeLamp = ball(buffStrobe, 0.06, 0, 0.42, 0, 0x3c444c, { rough: 0.5, metal: 0.4, seg: 8 });
    holoTag(buffStrobe, "buffer stop-work strobe", 0, 0.58, 0, { css: "#5f9e5a", w: 0.42 });
    reg(hits, strobeLamp, "buffer-estop");
    const bird = group(g, -2.1, 0.05, -0.85);
    ball(bird, 0.05, 0, 0.05, 0, 0x6a5a3c, { rough: 0.8, seg: 8 });

    // ------------------------------------------------------------- weed wrench
    const wrenchGrp = group(g, 0.6, 0.05, 0.5);
    cyl(wrenchGrp, 0.02, 0.02, 0.75, 0, 0.38, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
    const wrenchJawGrp = group(wrenchGrp, 0, 0.03, 0);
    box(wrenchJawGrp, 0.14, 0.06, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.5 });
    const wrenchHandleGrp = group(wrenchGrp, 0, 0.7, 0);
    box(wrenchHandleGrp, 0.5, 0.03, 0.03, 0.2, 0, 0, 0x5f9e5a, { rough: 0.7 });
    holoTag(wrenchGrp, "weed wrench", 0, 0.95, 0, { css: "#5f9e5a", w: 0.32 });
    reg(hits, wrenchHandleGrp, "weed-wrench");
    const pinchHit = box(g, 0.16, 0.16, 0.16, 0.6, 0.08, 0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "fingers near the jaw?", 0.6, 0.3, 0.5, { css: "#e8622a", w: 0.36 });
    reg(hits, pinchHit, "wrench-pinch-point");

    // ------------------------------------------------------------ fragments
    const frag1 = box(g, 0.06, 0.02, 0.04, 0.75, 0.03, 0.6, 0x6a5a3c, { rough: 0.9 });
    reg(hits, frag1, "root-fragment-1");
    const frag2 = box(g, 0.05, 0.02, 0.04, 0.4, 0.03, 0.35, 0x6a5a3c, { rough: 0.9 });
    reg(hits, frag2, "root-fragment-2");

    // ---------------------------------------------------------------- bags
    const bagGrp = group(g, -0.6, 0.04, 0.9);
    box(bagGrp, 0.3, 0.08, 0.3, 0, 0.04, 0, 0x3c6a56, { rough: 0.85, opacity: 0.85, transparent: true });
    holoTag(bagGrp, "disposal bag — hold it open", 0, 0.3, 0, { css: "#5f9e5a", w: 0.42 });
    reg(hits, bagGrp, "disposal-bag");

    const windGuardGrp = group(g, -0.6, 0.9, 0.9);
    slab(windGuardGrp, 0.4, 0.3, 0.01, 0, 0, 0, 0x2b3138, { rough: 0.8, opacity: 0.001, transparent: true, cast: false });
    holoTag(windGuardGrp, "wind guard tarp", 0, 0.2, 0, { css: "#5f9e5a", w: 0.36 });
    reg(hits, windGuardGrp, "wind-guard");

    const bagPositions = { "bag-1": [-1.0, 0.5], "bag-2": [-0.6, 0.75], "bag-3": [-0.2, 0.5] };
    const bagMeshes = {};
    for (const [id, [x, z]] of Object.entries(bagPositions)) {
      const bag = box(g, 0.28, 0.08, 0.28, x, 0.04, z, 0x3c6a56, { rough: 0.85, opacity: 0.85, transparent: true });
      reg(hits, bag, id);
      bagMeshes[id] = bag;
    }

    // ------------------------------------------------------------- boot brush
    const brushGrp = group(g, 1.1, 0.311, 1.7);
    box(brushGrp, 0.4, 0.06, 0.2, 0, 0.03, 0, 0x2b3138, { rough: 0.7 });
    const brushHeadGrp = group(brushGrp, 0, 0.09, 0);
    box(brushHeadGrp, 0.36, 0.02, 0.16, 0, 0, 0, 0x8a6a2a, { rough: 0.95 });
    holoTag(brushGrp, "boot brush station", 0, 0.32, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, brushHeadGrp, "boot-brush");

    const deconMeter = instrument(g, 1.45, 0.311, 1.55, { idle: "-- NTU", color: 0x5f9e5a, w: 0.12, d: 0.18 });
    holoTag(g, "decon wash meter", 1.45, 0.5, 1.55, { css: "#5f9e5a", w: 0.36 });
    reg(hits, deconMeter, "decon-meter");

    const crossContamHit = box(g, 0.3, 0.3, 0.3, -2.0, 0.2, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cross into the buffer unbrushed?", -2.0, 0.45, -0.7, { css: "#e8622a", w: 0.46 });
    reg(hits, crossContamHit, "cross-contaminate-boots");

    // ---------------------------------------------------------------- cart + haul
    const cartHome = new THREE.Vector3(2.1, 0.16, 1.1);
    const cart = group(g, -0.3, 0.16, 1.5);
    box(cart, 0.5, 0.3, 0.7, 0, 0.15, 0, 0x3c444c, { rough: 0.6, metal: 0.4 });
    for (const dx of [-0.2, 0.2]) cyl(cart, 0.08, 0.08, 0.05, dx, 0.06, 0.3, 0x1b1e23, { rough: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(cart, "removal cart", 0, 0.5, 0, { css: "#5f9e5a", w: 0.32 });
    reg(hits, cart, "removal-cart");
    const cartLine = group(g, 1.6, 0.16, 1.3);
    hits["cart-line"] = cartLine;

    const liftHit = box(g, 0.3, 0.3, 0.3, -0.3, 0.4, 1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "swing the bag on solo?", -0.3, 0.65, 1.5, { css: "#e8622a", w: 0.4 });
    reg(hits, liftHit, "manual-lift-bag-solo");

    const loadedBagGrp = group(g, -0.2, 0.04, 0.5);
    box(loadedBagGrp, 0.28, 0.1, 0.28, 0, 0.05, 0, 0x3c6a56, { rough: 0.85, opacity: 0.85, transparent: true });
    holoTag(loadedBagGrp, "loaded bag", 0, 0.3, 0, { css: "#5f9e5a", w: 0.32 });
    reg(hits, loadedBagGrp, "loaded-bag");

    // ------------------------------------------------------------- spotter + radio
    const spotter = standingFigure(g, 2.0, 1.6, { ry: -1.6, cloth: 0x2b3138, vest: 0xe8622a });
    const radioProp = group(spotter, 0.14, 0.9, 0.05);
    box(radioProp, 0.05, 0.11, 0.03, 0, 0, 0, 0x1b1e23, { rough: 0.7 });
    holoTag(spotter, "spotter — radio check-in", 0, 1.85, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, radioProp, "van-spotter-radio");
    const backHazHit = box(g, 0.3, 0.3, 0.3, 2.7, 0.4, 1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "back the van unspotted?", 2.7, 0.65, 1.5, { css: "#e8622a", w: 0.44 });
    reg(hits, backHazHit, "truck-unspotted-back");

    // -------------------------------------------------------------- walk-round
    const missedFrag = box(g, 0.05, 0.02, 0.04, 1.0, 0.03, 0.2, 0x6a5a3c, { rough: 0.9 });
    reg(hits, missedFrag, "missed-fragment-flag");
    const untaggedBag = box(g, 0.28, 0.08, 0.28, 1.5, 0.04, 0.4, 0x3c6a56, { rough: 0.85, opacity: 0.85, transparent: true });
    reg(hits, untaggedBag, "untagged-bag");

    // --------------------------------------------------------------- closing log
    const logTable = group(g, -2.3, 0.311, 1.9, -0.3);
    box(logTable, 0.5, 0.02, 0.35, 0, 0.01, 0, 0x565656, { rough: 0.7, cast: false });
    const logDecal = decal(logTable, 0.3, 0.4, 0, 0.021, 0, paperFace("REMOVAL LOG", ["Zones cleared, bags tagged", "Decon readings", "Fragments found", "Buffer status — clean / crossed"], { scale: 0.85 }));
    logDecal.rotation.x = -Math.PI / 2;
    holoTag(logTable, "log the removal", 0, 0.3, 0, { css: "#5f9e5a", w: 0.36 });
    reg(hits, logDecal, "closing-log");

    cone(g, -3.1, 2.3, { color: BRIR_ACCENT });
    cone(g, 3.1, 2.3, { color: BRIR_ACCENT });
    barrierPanel(g, 0, 2.4, { color: 0xe8b02e });

    let wrenchAmount = 0, brushAmount = 0, bagHolding = false, cartMoved = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.9, 0.7),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "find-fragments") { frag1.visible = false; frag2.visible = false; }
        if (step.id === "bag-and-tag") { for (const b of Object.values(bagMeshes)) b.material = mat(0x59c97b, { rough: 0.8, opacity: 0.9, transparent: true }); }
        if (step.id === "haul-bag") { loadedBagGrp.visible = false; }
        if (step.id === "cart-haul") { cart.position.copy(cartHome); cartMoved = true; }
        if (step.id === "walk-hazards") { missedFrag.visible = false; untaggedBag.visible = false; }
      },

      // Both interruptions really change the scene: the wind guard actually
      // covers the open bags, and the buffer strobe lights while the bird
      // marker moves off.
      onInterrupt(it) {
        if (it.id === "gust-scatters-fragments") {
          for (const b of Object.values(bagMeshes)) b.position.y += 0.03;
        }
        if (it.id === "bird-flushed-near-buffer") {
          strobeLamp.material = mat(0xffee55, { emissive: 0xffee55, ei: 1.6, rough: 0.4 });
          bird.position.set(-1.7, 0.3, -0.55);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-scatters-fragments") {
          for (const b of Object.values(bagMeshes)) b.position.y -= 0.03;
          windGuardGrp.children[0].material.opacity = 0.85;
        }
        if (it.id === "bird-flushed-near-buffer") {
          strobeLamp.material = mat(0x3c444c, { rough: 0.5, metal: 0.4 });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, 0.02, -1.6), 1.3, 0.35, -0.1);
        water.position.y = 0.012 + Math.sin(t * 1.2) * 0.006;
        void standGrp;

        const step = session?.step;
        if (step?.id === "weed-wrench" && session.turn) wrenchAmount = session.turn.amount;
        wrenchHandleGrp.rotation.z = -wrenchAmount * 1.1;
        wrenchJawGrp.scale.y = 1 - wrenchAmount * 0.4;

        if (step?.id === "boot-brush" && session.turn) brushAmount = session.turn.amount;
        brushHeadGrp.position.x = Math.sin(brushAmount * Math.PI * 4) * 0.08;

        if (step?.id === "bag-hold") bagHolding = !!session.holding;
        bagGrp.scale.y = bagHolding ? 1.15 : 1;

        if (cartMoved) cart.position.y = 0.16 + Math.sin(t * 1.5) * 0.002;

        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "decon-check") {
          repaint(deconMeter.userData.screen, signFace(`${Math.round(gg.t * 40)} NTU`, { bg: "#0d1c14", accent: gg.t >= 0.4 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff3d8", scale: 0.6 }));
        }
      },
    };
  },
};
