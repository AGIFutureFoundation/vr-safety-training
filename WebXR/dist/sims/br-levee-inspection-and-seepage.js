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

// SmartCiti.X~ Levee Inspection And Seepage VR — Water & Environmental,
// Bay Restoration & Cleanup pack C.
//
// A routine walking inspection of a generic bay-fronting levee — not any one
// levee, and no claim about any one district's history. Most of what this
// crew finds on an ordinary patrol is nothing at all; the job exists for the
// day it is not nothing, and on that day the two facts that matter most are
// both counterintuitive to somebody who has never walked a levee before. A
// sand boil gets ringed with sandbags, never blocked, because stopping the
// flow outright is what turns a boil into a blowout. A burrow gets flagged
// and reported, never poked at or dug out on the spot, because the animal
// that made it may be protected and the hole itself is already a piping
// pathway nobody wants widened by a probe.

const BRLI_ACCENT = 0x5f9e5a;
const BRLI_FLAG = 0xe8622a;

export const SIM_BR_LEVEE_INSPECTION_AND_SEEPAGE = {
  id: "br-levee-inspection-and-seepage",
  index: "br-c6",
  domain: "Environmental",
  trade: "Levee inspection laborer — flood control patrol crew",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "LIUNA Local 261 laborers — levee inspection and patrol crew; OSHA 29 CFR 1926 general construction safety; USACE Levee Safety Program periodic inspection protocol; U.S. Army Corps of Engineers Clean Water Act (CWA) Section 404 permit conditions; San Francisco Bay Regional Water Quality Control Board CWA Section 401 water quality certification; San Francisco Bay Conservation and Development Commission (BCDC) permit; California Department of Fish and Wildlife habitat protections; U.S. Fish and Wildlife Service Endangered Species Act reporting for a protected burrow",
  name: "Levee Inspection And Seepage",
  title: simTitle("Levee Inspection And Seepage"),
  tagline: "Walking a bay levee's crown and toe on a routine patrol: stations and the piezometer read before the walk starts, a sand boil ringed with sandbags instead of blocked, a crack measured and every deficiency flagged and logged, a burrow reported instead of disturbed, and the trail closed to the public before the crew works an unmarked hazard beside it",
  accent: BRLI_ACCENT,
  accentCss: "#5f9e5a",
  parSeconds: 310,
  footprint: 2.7,
  badge: { id: "levee-sound", name: "Levee Read Sound", note: "Every deficiency flagged, the boil ringed not blocked, nothing left unreported — first time" },

  game: system({
    name: "Patrol Crew",
    currency: "REACH",
    ranks: ["Laborer", "Patrol Hand", "Lead Patrol", "Site Steward", "Levee Inspection Certified"],
    badges: [
      { id: "no-blowout", name: "No Blowout Risk", note: "Never a hazard, the boil always ringed and never blocked", test: AWARD.safe },
      { id: "reach-true", name: "Reach Read True", note: "The piezometer reading held inside the expected band", test: AWARD.precise(0.7) },
      { id: "stations-first", name: "Stations Read Clean", note: "Station markers and the piezometer both read clean before the walk started", test: AWARD.stepClean("piezometer-reading") },
    ],
    challenges: [
      { id: "clean-reach", name: "Clean Reach", note: "No corrections across the whole patrol", test: AWARD.clean },
      { id: "steady-walk", name: "Steady Walk", note: "Held the crown walk inside the working band the whole pass", test: AWARD.unbroken },
      { id: "reach-fast", name: "Reach Cleared Fast", note: "Patrol closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "boil-block-not-ring": "You started stacking sandbags directly on top of the sand boil instead of building a ring around it. Blocking a boil outright traps the pressure that was finding its own way out through it, and that pressure has to go somewhere — usually into a bigger, faster failure a few feet away. The ring works because it raises the water level over the boil without ever stopping the flow through it.",
    "walk-levee-crest-edge-unmarked-crack": "You stepped past the unmarked crack instead of flagging it and routing the crew around it. A crack on a levee crown is not cosmetic — it can be the surface sign of a slip plane already moving underneath, and walking over it instead of around it risks being the exact load that finishes what the crack already started.",
    "animal-burrow-reach-in": "You reached a bare hand into the burrow to feel how deep it went instead of using the probe staged for exactly that. A burrow this size can hold anything from a protected species to a snake denning for the season, and a hand is not the tool this crew is trained to use to find out which.",
    "truck-unspotted-back": "You backed the patrol truck along the crown road without checking for the public trail traffic this levee also carries. A levee crown this width is a shared trail as much as it is a patrol road, and backing on a guess instead of a confirmed all-clear is how a truck finds a cyclist the mirror never showed.",
  },

  lateNotes: {
    "sandbags": "Ring the boil only after the piezometer reading and the crown walk both confirm where the seepage is coming from — sandbagging blind just guesses at a ring that may not even be centered on the boil.",
    "toe-drain-valve": "Check the toe drain valve only after the boil is ringed — a valve reading taken before the ring is in place does not reflect what the ring itself is about to change.",
    "deficiency-flag-1": "Flag the deficiencies only after the crack has been measured — a flag placed before the measurement is a flag with no record behind it for the engineer who reads this log next.",
  },

  // Interruptions: see shared/game.js. The first is the tide doing to the
  // boil's flow exactly what a rising tide does to any seepage path; the
  // second is the public trail doing what a shared levee crown always does.
  interrupts: [
    {
      id: "boil-flow-increasing",
      kind: "Sand boil flow visibly increasing",
      after: "boil-ring", delay: 3, seconds: 13,
      alert: "The boil's flow has picked up noticeably since the ring went in — the water inside the ring is rising faster than it was a few minutes ago.",
      cue: "Notify the levee watch now over the radio, not at the end of the patrol — this is exactly the change they need to hear about while it's happening.",
      target: "emergency-notify",
      why: "A boil that is quietly seeping and a boil whose flow is visibly increasing are two different situations, and the difference is exactly what the levee watch needs to know about in real time — calling it in the moment the change is seen is what turns a patrol's observation into a decision somebody with the authority to act on it can actually make.",
      missNote: "The flow kept increasing while the crew finished the rest of the patrol before calling it in, and the watch found out about a boil that had already been getting worse for the better part of an hour instead of the few minutes it actually took to notice.",
      wrongNote: "That is not it. The levee watch radio is what gets this change reported while it still matters — nothing else on this patrol does that job.",
    },
    {
      id: "cyclist-approaches-work-zone",
      kind: "Cyclist approaches the unmarked work zone",
      after: "crown-walk", delay: 4, seconds: 12,
      alert: "A cyclist on the public trail is approaching the stretch of crown the crew is working, and there is no closure sign up yet to route them around it.",
      cue: "Get the trail closure sign out now, before the cyclist reaches the work zone.",
      target: "trail-closure-sign",
      why: "This levee crown is a public trail as much as it is a patrol route, and a crew working it without a closure sign up is relying on every single trail user to notice and avoid them on their own — the sign is what makes that everyone else's problem to solve instead of this crew's problem to hope works out.",
      missNote: "The cyclist rode straight into the work zone before anyone got the sign out, close enough to the flagged crack that the whole point of flagging it — keeping foot and wheel traffic off it — was already undone for this one rider.",
      wrongNote: "It's the trail closure sign. Nothing else on this crown routes a cyclist around the work zone before they reach it.",
    },
  ],

  steps: [
    {
      id: "check-in", kind: "select", target: "inspection-plan-board",
      title: "Check the inspection plan before the patrol starts",
      cue: "Read the USACE Levee Safety Program schedule, the permit conditions, and the work window before stepping onto the crown.",
      why: "This levee is inspected on the same schedule the USACE Levee Safety Program sets for it, and the permit conditions under the Corps' Section 404 authorization and the Water Board's 401 certification apply to anything the patrol finds and treats along the way — a crew that skips the plan because 'it's just a walk-through' still answers for every condition on it.",
    },
    {
      id: "stage-ppe", kind: "sequence", anyOrder: true,
      targets: ["stage-hi-vis", "stage-boots", "stage-gloves"],
      itemNames: { "stage-hi-vis": "high-visibility vest", "stage-boots": "waterproof boots", "stage-gloves": "gloves" },
      title: "Stage the patrol crew's PPE",
      cue: "High-visibility vest, waterproof boots and gloves before anyone walks the crown.",
      why: "The vest is what lets a cyclist or a patrol truck see a body on a crown that doubles as a public trail; waterproof boots are for the toe of the levee, which is wet ground on an ordinary day and worse the moment a boil turns up; gloves are for sandbags and whatever else the patrol ends up handling along the way.",
    },
    {
      id: "find-stations", kind: "find", noHint: true,
      targets: ["station-marker-1", "station-marker-2", "station-marker-3"],
      itemNames: { "station-marker-1": "station marker — 10+00", "station-marker-2": "station marker — 15+00", "station-marker-3": "station marker — 20+00" },
      itemNotes: {
        "station-marker-1": "Marker 10+00 sets the start of today's inspection reach. The patrol walks from here, not from wherever looks like a reasonable start.",
        "station-marker-2": "Marker 15+00 is the mid-reach control — it is what lets the log record exactly where along the levee anything found today actually is.",
        "station-marker-3": "Marker 20+00 sets the end of today's reach. Past it is the next patrol's stretch, not today's.",
      },
      title: "Find the station markers that set today's inspection reach",
      cue: "Walk the crown and click the three station markers the reach is built from.",
      why: "A levee deficiency reported without a station number is a deficiency the next inspector cannot find again — finding all three markers first is what turns today's patrol into a located record instead of a memory of roughly where something was.",
    },
    {
      id: "piezometer-reading", kind: "gauge", target: "piezometer",
      title: "Read the piezometer before starting the walk",
      cue: "Take the groundwater level reading at the piezometer and commit it inside the expected band.",
      why: "The piezometer is the one instrument on this levee that reads what the water table is doing inside the embankment, not just what the crew can see on the surface — a reading taken before the walk is the baseline every seepage sign found today gets compared against.",
      gauge: { label: "PIEZOMETER", speed: 0.7, green: [0.4, 0.6], readout: (t) => `${(t * 3.2).toFixed(2)} m`, missNote: "Outside the expected band. Let the reading settle and commit again before starting the walk." },
    },
    {
      id: "crown-walk", kind: "track", target: "crown-path", seconds: 7,
      title: "Walk the crown at a systematic scanning pace",
      cue: "Walk the reach at a steady pace, staying inside the working band so nothing on the slopes gets missed.",
      why: "A steady pace is what lets an inspector's eye actually cover both slopes and the crown itself; walk too fast and the toe on the far side never gets a real look, walk too slow and the patrol burns the whole shift on one reach the schedule needs covered along with several others.",
      track: { start: 0.1, green: [0.36, 0.58], rise: 0.55, fall: 0.45, drift: 0.12, label: "PACE", readout: (v) => (v < 0.36 ? "too slow to finish the reach" : v > 0.58 ? "too fast to see the slopes" : "steady scanning pace") },
      holdBreakNote: "The pace broke and drifted off the working band. Bring it back to a steady scan before the next station.",
    },
    {
      id: "find-seepage", kind: "find", noHint: true,
      targets: ["sand-boil", "wet-spot", "animal-burrow"],
      itemNotes: {
        "sand-boil": "Water is welling up here carrying fine sand with it — a sand boil, and the single most urgent thing this patrol can find.",
        "wet-spot": "This patch of the toe stays wet well after the last rain — worth noting even though it is not yet an active boil.",
        "animal-burrow": "A burrow opens into the levee fill here. It gets flagged and reported, not probed or dug at on the spot.",
      },
      title: "Find the seepage signs at the toe",
      cue: "Walk the toe and click the boil, the wet spot and the burrow.",
      why: "None of these three looks urgent from the crown, and all three change what the rest of today's patrol has to do — a boil gets ringed within minutes, a wet spot gets logged for the next inspector to watch, and a burrow gets flagged for a report instead of a repair this crew is not equipped to make.",
    },
    {
      id: "boil-ring", kind: "drag", target: "sandbags",
      title: "Build a sandbag ring around the boil",
      cue: "Carry the sandbags out and ring the boil completely — never stack them on top of it.",
      why: "A ring raises the water level over the boil, which reduces the pressure difference driving the flow without ever blocking the path that pressure is already using — blocking it outright just moves the same pressure to whatever weaker path finds it next, which is a worse problem in a worse place.",
      drag: { to: "boil-ring-line", radius: 0.5, missNote: "Not a complete ring — a gap in the sandbags is a gap the boil's own flow finds first." },
    },
    {
      id: "crack-measure", kind: "hold", target: "crack-tape", seconds: 5,
      title: "Hold the tape steady to measure the crack",
      cue: "Hold the measuring tape steady across the crack while the width is read and recorded.",
      why: "A crack's width only means something if it is measured the same way every time it is checked — held steady long enough for an honest reading, it becomes a number the next inspection can compare against instead of an estimate nobody can verify was taken the same way twice.",
      holdBreakNote: "The tape shifted before the reading was taken — reset it across the crack and hold steady until the measurement is recorded.",
    },
    {
      id: "toe-drain-valve", kind: "turn", target: "toe-drain-valve",
      title: "Check the toe drain valve",
      cue: "Turn the toe drain valve to confirm it moves freely and is not seized open or shut.",
      why: "The toe drain is what carries ordinary underseepage safely out from under the levee instead of letting it build up pressure inside the embankment, and a valve seized shut turns a designed drainage path into one more thing holding pressure in — checking it is part of the same seepage picture the boil and the piezometer are already building.",
      turn: { turns: 0.6, axis: "y", label: "TOE DRAIN" },
    },
    {
      id: "flag-deficiencies", kind: "sequence", anyOrder: true,
      targets: ["deficiency-flag-1", "deficiency-flag-2", "deficiency-flag-3"],
      itemNames: { "deficiency-flag-1": "flag — the crack", "deficiency-flag-2": "flag — the wet spot", "deficiency-flag-3": "flag — the burrow" },
      title: "Flag every deficiency found on this reach",
      cue: "Place a numbered flag at the crack, the wet spot and the burrow before leaving this reach.",
      why: "A deficiency found and not flagged is a deficiency the next patrol has to find all over again, on a levee where finding it a second time might mean it grew in between — flagging all three now is what makes today's find part of a continuous record instead of a one-time observation nobody else can locate.",
    },
    {
      id: "burrow-report", kind: "select", target: "burrow-probe",
      title: "Report the burrow instead of disturbing it",
      cue: "Log the burrow's location and note it for wildlife and habitat follow-up — do not dig at it or force anything into it.",
      why: "This crew's job stops at finding and reporting; a burrow may belong to a species California Department of Fish and Wildlife or the Endangered Species Act protects, and even where it does not, digging into it is exactly the kind of disturbance that turns a small piping pathway into a bigger one this crew is not equipped to repair on the spot.",
    },
    {
      id: "trail-checkin", kind: "select", target: "truck-spotter-radio",
      title: "Check in with the spotter before repositioning the truck",
      cue: "Call the spotter on the radio and get a clear signal before backing the truck along the crown road.",
      why: "The crown road doubles as a public trail, and the truck's own body blocks the driver's view of that shared use — backing without the spotter's call is backing on a guess about who else might be on this crown right now.",
    },
    {
      id: "walk-hazards", kind: "find", noHint: true,
      targets: ["loose-flag", "trail-debris"],
      itemNotes: {
        "loose-flag": "A flag has come loose from its stake here — click it to confirm the crew resets it before leaving.",
        "trail-debris": "Debris from today's work is still sitting on the public trail surface, a trip hazard for the next cyclist through.",
      },
      title: "Walk the reach and confirm nothing is left behind",
      cue: "Check the loose flag and the trail debris before the crew calls this reach done.",
      why: "A flag that comes loose or debris left on a shared trail is easy to miss once the crew's attention has moved to the next reach — walking it now, before anyone leaves, is the last chance to catch what the next trail user or the next patrol would otherwise find instead.",
    },
    {
      id: "log-inspection", kind: "select", target: "closing-log",
      title: "Log the day's inspection",
      cue: "Record the reach walked, the piezometer reading, the boil and its ring, and every flagged deficiency for the crew's record.",
      why: "The engineer who reviews this levee's condition reads today's log, not today's memory of it — an inspection that was thorough but never logged looks, from the record, exactly like a reach nobody has walked yet, and a boil that was ringed but never written down is a fact the next patrol has no way to confirm on its own.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, BRLI_ACCENT);

    // ---------------------------------------------------------------- terrain
    // Crown road toward +z where the truck patrols, the levee slope running
    // down to the toe where the seepage signs sit, and the bay beyond.
    const crownTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#8a8560", base2: "#7a7554", seam: "rgba(0,0,0,0.3)" }), { repeat: 4, px: 256 });
    const crownBase = box(g, 6.2, 0.32, 1.1, 0, 0.16, 2.0, 0x8a8560, { rough: 0.9 });
    void crownBase;
    const crown = box(g, 6.2, 0.02, 1.1, 0, 0.321, 2.0, 0x8a8560, { rough: 0.88, cast: false });
    crown.material = texturedMat(crownTex, { rough: 0.88, color: 0xb0aa80 });

    const slope = box(g, 6.2, 0.5, 1.6, 0, 0.06, 0.7, 0x6a7a48, { rough: 0.95 });
    slope.rotation.x = 0.42;
    const toeTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#5a6a3c", base2: "#465228", cracks: 6, pools: 3 }), { repeat: 4, px: 256 });
    const toe = box(g, 6.2, 0.1, 1.2, 0, -0.15, -0.5, 0x5a6a3c, { rough: 0.92, cast: false });
    toe.material = texturedMat(toeTex, { rough: 0.92, color: 0x7a8a54 });

    const waterTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#1c4a52"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 22; i++) {
        cx.strokeStyle = "rgba(180,220,225,0.10)"; cx.lineWidth = 1 + Math.random() * 2;
        cx.beginPath(); const y = Math.random() * h;
        cx.moveTo(0, y); cx.bezierCurveTo(w * 0.25, y + 16, w * 0.75, y - 16, w, y); cx.stroke();
      }
    }, { repeat: 4, px: 256 });
    const water = box(g, 6.2, 0.03, 0.7, 0, -0.24, -1.5, 0x1c4a52, { rough: 0.2, metal: 0.3, opacity: 0.88, transparent: true, cast: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x2c6a72 });
    water.material.transparent = true;
    water.material.opacity = 0.88;
    const wave = particles(g, 20, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.4 });
    wave.position.set(0, -0.22, -1.55);

    // -------------------------------------------------------- crown station
    const planBoard = holoPanel(g, 0.95, 0.62, -2.3, 1.1, 2.25, (cx, w, h) => {
      cx.fillStyle = "#0d1c14"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5f9e5a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff3d8"; cx.fillText("INSPECTION PLAN — REACH 14", w * 0.06, h * 0.11);
      cx.font = `${Math.round(h * 0.062)}px Arial, sans-serif`; cx.fillStyle = "#e7f7e0";
      ["USACE Levee Safety Program schedule", "USACE CWA §404 / RWQCB §401",
       "BCDC permit — shoreline levee", "CDFW habitat protections apply", "Public trail — crown shared use"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.27 + i * 0.1)));
    }, { ry: 0.4, accent: BRLI_ACCENT });
    reg(hits, planBoard, "inspection-plan-board");

    const truck = pickup(g, 2.4, 0.321, 2.1, { ry: Math.PI, livery: { colour: 0x3f6f4a, fleetName: "LEVEE PATROL", unitNumber: "P-14" } });
    void truck;

    const chest = toolChest(g, 0, 2.15, { color: 0x2f6f4a });
    for (const [id, dx, color, label] of [["stage-hi-vis", -0.2, 0xf2ae14, "HI-VIS"], ["stage-boots", 0.0, 0x3c444c, "BOOTS"], ["stage-gloves", 0.2, 0x8a6a4a, "GLOVES"]]) {
      const it = group(chest, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#0d1c14", accent: "#dff3d8", scale: 0.42 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const crewUpland = standingFigure(g, -2.8, 1.4, { ry: 0.9, cloth: 0x2f4d3a, vest: 0xe8b02e });
    void crewUpland;

    // ---------------------------------------------------------- station markers
    for (const [id, x, label] of [["station-marker-1", -2.2, "STA 10+00"], ["station-marker-2", 0.0, "STA 15+00"], ["station-marker-3", 2.2, "STA 20+00"]]) {
      const st = group(g, x, 0.321, 1.55);
      cyl(st, 0.012, 0.014, 0.5, 0, 0.25, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
      box(st, 0.09, 0.06, 0.01, 0, 0.46, 0, BRLI_FLAG, { rough: 0.75 });
      decal(st, 0.08, 0.04, 0, 0.46, 0.006, signFace(label, { bg: "#1b1e12", accent: "#dff3d8", scale: 0.42 }));
      reg(hits, st, id);
    }

    // ------------------------------------------------------------- piezometer
    const piezoGrp = group(g, -1.6, 0.05, -0.9);
    cyl(piezoGrp, 0.03, 0.03, 0.5, 0, 0.25, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 10 });
    const piezoReadout = instrument(piezoGrp, 0.12, 0.55, 0, { idle: "-- m", color: 0x5f9e5a, w: 0.12, d: 0.18 });
    holoTag(piezoGrp, "piezometer", 0, 0.75, 0, { css: "#5f9e5a", w: 0.32 });
    reg(hits, piezoGrp, "piezometer");

    // ---------------------------------------------------------------- crown path
    hits["crown-path"] = group(g, 0, 0.321, 2.0);

    // ------------------------------------------------------------- seepage finds
    const boilGrp = group(g, 0.4, -0.13, -0.7);
    cyl(boilGrp, 0.14, 0.16, 0.04, 0, 0.02, 0, 0x8a7a54, { rough: 0.9, seg: 14 });
    const boilWater = cyl(boilGrp, 0.07, 0.07, 0.03, 0, 0.03, 0, 0x2c6a72, { rough: 0.3, metal: 0.2, opacity: 0.85, transparent: true, seg: 12 });
    holoTag(boilGrp, "sand boil", 0, 0.24, 0, { css: "#e8622a", w: 0.3 });
    reg(hits, boilGrp, "sand-boil");
    const wetSpot = box(g, 0.4, 0.01, 0.4, -0.6, -0.14, -0.6, 0x3a4a2c, { rough: 0.95, opacity: 0.7, transparent: true, cast: false });
    reg(hits, wetSpot, "wet-spot");
    const burrowGrp = group(g, 1.3, -0.13, -0.6);
    torus(burrowGrp, 0.09, 0.03, 0, 0.02, 0, 0x2b2418, { rough: 0.95, seg: 12 });
    holoTag(burrowGrp, "burrow", 0, 0.2, 0, { css: "#5f9e5a", w: 0.24 });
    reg(hits, burrowGrp, "animal-burrow");
    const burrowReachHit = box(g, 0.2, 0.2, 0.2, 1.3, 0.05, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reach into the burrow?", 1.3, 0.3, -0.6, { css: "#e8622a", w: 0.4 });
    reg(hits, burrowReachHit, "animal-burrow-reach-in");
    const burrowProbe = group(g, 1.5, -0.1, -0.4);
    cyl(burrowProbe, 0.01, 0.01, 0.4, 0, 0.2, 0, 0x5f9e5a, { rough: 0.7, seg: 6 });
    holoTag(burrowProbe, "burrow probe — report, do not dig", 0, 0.44, 0, { css: "#5f9e5a", w: 0.46 });
    reg(hits, burrowProbe, "burrow-probe");

    // ------------------------------------------------------------- sandbag ring
    const bagBundle = group(g, -1.0, -0.13, -0.5);
    for (let i = 0; i < 3; i++) box(bagBundle, 0.3, 0.1, 0.2, 0, 0.05 + i * 0.001, -0.15 + i * 0.1, 0x8a7a54, { rough: 0.9 });
    holoTag(bagBundle, "sandbags — staged", 0, 0.3, 0, { css: "#5f9e5a", w: 0.36 });
    reg(hits, bagBundle, "sandbags");
    const ringLine = group(g, 0.4, -0.13, -0.7);
    hits["boil-ring-line"] = ringLine;
    const ringDeployed = group(g, 0.4, -0.11, -0.7);
    ringDeployed.visible = false;
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      box(ringDeployed, 0.14, 0.08, 0.1, Math.cos(ang) * 0.22, 0.04, Math.sin(ang) * 0.22, 0x8a7a54, { rough: 0.9 });
    }
    const boilBlockHit = box(g, 0.2, 0.2, 0.2, 0.4, 0.05, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stack sandbags on top of it?", 0.4, 0.3, -0.7, { css: "#e8622a", w: 0.46 });
    reg(hits, boilBlockHit, "boil-block-not-ring");

    // ------------------------------------------------------------- crack + tape
    const crackGrp = group(g, -0.6, 0.321, 1.7);
    box(crackGrp, 0.7, 0.01, 0.03, 0, 0.006, 0, 0x2b2418, { rough: 0.95, cast: false });
    holoTag(crackGrp, "crack — flag, don't walk it", 0, 0.24, 0, { css: "#e8622a", w: 0.44 });
    reg(hits, crackGrp, "crack-tape");
    const crackWalkHit = box(g, 0.7, 0.2, 0.2, -0.6, 0.4, 1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step over the unmarked crack?", -0.6, 0.6, 1.7, { css: "#e8622a", w: 0.48 });
    reg(hits, crackWalkHit, "walk-levee-crest-edge-unmarked-crack");

    // ------------------------------------------------------------- toe drain
    const drainGrp = group(g, -1.9, -0.14, -0.2);
    cyl(drainGrp, 0.06, 0.06, 0.3, 0, 0.15, 0, 0x3c444c, { rough: 0.6, metal: 0.4, seg: 10 });
    const drainValveGrp = group(drainGrp, 0, 0.32, 0);
    const drainValve = valveWheel(drainValveGrp, 0, 0.06, 0, { r: 0.06, color: 0x5f9e5a, body: 0x2b5a6a });
    holoTag(drainGrp, "toe drain valve", 0, 0.55, 0, { css: "#5f9e5a", w: 0.36 });
    reg(hits, drainValve.userData.wheel, "toe-drain-valve");

    // ------------------------------------------------------------ deficiency flags
    const flagPositions = { "deficiency-flag-1": [-0.6, 1.7], "deficiency-flag-2": [-0.6, -0.6], "deficiency-flag-3": [1.3, -0.6] };
    const flagMeshes = {};
    for (const [id, [x, z]] of Object.entries(flagPositions)) {
      const y = z > 1 ? 0.321 : -0.12;
      const flagGrp = group(g, x + 0.15, y, z + 0.15);
      cyl(flagGrp, 0.01, 0.01, 0.3, 0, 0.15, 0, 0xc9b58c, { rough: 0.9, seg: 6 });
      const cloth = box(flagGrp, 0.07, 0.05, 0.006, 0, 0.28, 0, 0x555a4a, { rough: 0.7 });
      reg(hits, flagGrp, id);
      flagMeshes[id] = cloth;
    }

    // ------------------------------------------------------------- emergency notify
    const notifyGrp = group(g, -2.5, 0.05, -1.0);
    cyl(notifyGrp, 0.02, 0.02, 0.4, 0, 0.2, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
    const notifyLamp = ball(notifyGrp, 0.05, 0, 0.42, 0, 0x3c444c, { rough: 0.5, metal: 0.4, seg: 8 });
    holoTag(notifyGrp, "levee watch radio", 0, 0.58, 0, { css: "#5f9e5a", w: 0.36 });
    reg(hits, notifyLamp, "emergency-notify");

    // ------------------------------------------------------------- trail closure
    const closureBundle = group(g, 2.6, 0.321, 0.9);
    box(closureBundle, 0.08, 0.6, 0.04, 0, 0.3, 0, 0xe8b02e, { rough: 0.7 });
    box(closureBundle, 0.4, 0.08, 0.04, 0, 0.55, 0, 0x1b1e23, { rough: 0.7 });
    closureBundle.visible = false;
    const closureStaged = group(g, 2.7, 0.321, 1.6);
    box(closureStaged, 0.08, 0.5, 0.04, 0, 0.25, 0, 0xe8b02e, { rough: 0.7 });
    holoTag(closureStaged, "trail closure sign — staged", 0, 0.56, 0, { css: "#5f9e5a", w: 0.42 });
    reg(hits, closureStaged, "trail-closure-sign");

    // ------------------------------------------------------------- spotter + radio
    const spotter = standingFigure(g, 1.8, 2.1, { ry: -1.6, cloth: 0x2b3138, vest: 0xe8622a });
    const radioProp = group(spotter, 0.14, 0.9, 0.05);
    box(radioProp, 0.05, 0.11, 0.03, 0, 0, 0, 0x1b1e23, { rough: 0.7 });
    holoTag(spotter, "spotter — radio check-in", 0, 1.85, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, radioProp, "truck-spotter-radio");
    const backHazHit = box(g, 0.3, 0.3, 0.3, 2.7, 0.5, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "back the truck unspotted?", 2.7, 0.75, 1.6, { css: "#e8622a", w: 0.44 });
    reg(hits, backHazHit, "truck-unspotted-back");

    // -------------------------------------------------------------- walk-round
    const looseFlag = box(g, 0.06, 0.04, 0.006, -1.5, 0.4, 1.6, 0x555a4a, { rough: 0.7 });
    reg(hits, looseFlag, "loose-flag");
    const trailDebris = box(g, 0.2, 0.03, 0.15, 1.0, 0.331, 1.9, 0x6a5636, { rough: 0.9 });
    reg(hits, trailDebris, "trail-debris");

    // --------------------------------------------------------------- closing log
    const logTable = group(g, -2.4, 0.321, 1.95, -0.3);
    box(logTable, 0.5, 0.02, 0.35, 0, 0.01, 0, 0x565656, { rough: 0.7, cast: false });
    const logDecal = decal(logTable, 0.3, 0.4, 0, 0.021, 0, paperFace("PATROL LOG", ["Reach walked, piezometer reading", "Boil ring + toe drain status", "Deficiencies flagged", "Burrow report filed"], { scale: 0.85 }));
    logDecal.rotation.x = -Math.PI / 2;
    holoTag(logTable, "log the inspection", 0, 0.3, 0, { css: "#5f9e5a", w: 0.36 });
    reg(hits, logDecal, "closing-log");

    cone(g, -3.1, 2.4, { color: BRLI_ACCENT });
    cone(g, 3.1, 2.4, { color: BRLI_ACCENT });
    barrierPanel(g, 0, 2.5, { color: 0xe8b02e });

    let ringed = false, holding = false, drainAmount = 0, boilRising = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.6, 0.6),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "boil-ring") { bagBundle.visible = false; ringDeployed.visible = true; ringed = true; }
        if (step.id === "flag-deficiencies") { for (const c of Object.values(flagMeshes)) c.material = mat(0x59c97b, { rough: 0.7 }); }
        if (step.id === "walk-hazards") { looseFlag.visible = false; trailDebris.visible = false; }
      },

      // Both interruptions really change the scene: the boil's water visibly
      // rises inside the ring, and the closure sign is actually planted on
      // the trail.
      onInterrupt(it) {
        if (it.id === "boil-flow-increasing") {
          boilRising = true;
          notifyLamp.material = mat(0xffee55, { emissive: 0xffee55, ei: 1.5, rough: 0.4 });
        }
        if (it.id === "cyclist-approaches-work-zone") {
          closureBundle.visible = true;
          closureStaged.visible = false;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "boil-flow-increasing") {
          boilRising = false;
          notifyLamp.material = mat(0x3c444c, { rough: 0.5, metal: 0.4 });
        }
        if (it.id === "cyclist-approaches-work-zone") { /* sign stays planted */ }
      },

      onHazard() {},

      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, -0.2, -1.6), 1.3, 0.35, -0.1);
        water.position.y = -0.24 + Math.sin(t * 1.2) * 0.006;
        boilWater.scale.y = boilRising ? 1.6 : 1;
        boilWater.position.y = 0.03 + (boilRising ? Math.sin(t * 6) * 0.01 : 0);
        void ringed;

        const step = session?.step;
        if (step?.id === "crack-measure") holding = !!session.holding;
        crackGrp.scale.x = holding ? 1.05 : 1;

        if (step?.id === "toe-drain-valve" && session.turn) drainAmount = session.turn.amount;
        drainValveGrp.rotation.y = -drainAmount * Math.PI * 2;

        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "piezometer-reading") {
          repaint(piezoReadout.userData.screen, signFace(`${(gg.t * 3.2).toFixed(2)} m`, { bg: "#0d1c14", accent: gg.t >= 0.4 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff3d8", scale: 0.6 }));
        }
      },
    };
  },
};
