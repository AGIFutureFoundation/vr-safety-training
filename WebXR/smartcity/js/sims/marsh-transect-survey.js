import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat, mudflatFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Marsh Transect Survey VR — Environmental Monitoring, station
// ninety-two.
//
// Vegetation survey along a fixed transect through a restored tidal marsh,
// on a generic marsh plain beside a former shipyard — not any one site's
// history, the trend-monitoring visit an environmental technician runs
// every survey window. Two federally listed species nest and den in marshes
// like this one — Ridgway's rail and the salt marsh harvest mouse — so the
// U.S. Fish and Wildlife Service's buffers under the Endangered Species Act
// govern where the crew can walk before the tape ever comes off the reel.
// The transect itself only produces a trend if it is the same line every
// time: the same start stake, the same bearing, the same benchmark under
// the level rod, and the same cover classes read the same way — with the
// invasive hybrid Spartina flagged for the Invasive Spartina Project's
// control crew rather than pulled by the surveyor who found it.

const MTS_ACCENT = 0x748a3c;

/** A clump of marsh grass blades, in the district's own style — a small ring
 *  of thin boxes at varied heights and tilts, so pickleweed, cordgrass and
 *  the invasive hybrid all read as planted vegetation rather than a lawn. */
function mtsGrassClump(parent, x, z, o = {}) {
  const c = group(parent, x, o.y ?? 0, z, Math.random() * Math.PI);
  const n = o.n ?? 12, tone = o.tone ?? 0x5d7a3a, tip = o.tip ?? 0x8a8f4a;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, r = 0.05 + Math.random() * (o.spread ?? 0.16), hh = (o.h ?? 0.3) + Math.random() * (o.hVar ?? 0.18);
    const b = box(c, o.w ?? 0.02, hh, o.w ?? 0.008, Math.cos(a) * r, hh / 2, Math.sin(a) * r, i % 3 ? tone : tip, { rough: 0.9, cast: false });
    b.rotation.z = (Math.random() - 0.5) * 0.4;
    b.rotation.x = (Math.random() - 0.5) * 0.3;
  }
  return c;
}

export const SIM_MARSH_TRANSECT_SURVEY = {
  id: "marsh-transect-survey",
  index: "92",
  domain: "Environmental",
  trade: "Environmental monitoring technician / vegetation survey crew",
  category: "Environmental Monitoring",
  weather: "overcast",
  certification: "Environmental monitoring technicians (AFSCME in public agencies); LIUNA laborers on the Invasive Spartina Project control crew; U.S. Fish and Wildlife Service Endangered Species Act consultation — Ridgway's rail and salt marsh harvest mouse; Invasive Spartina Project treatment protocols; San Francisco Bay Conservation and Development Commission (BCDC) permit; San Francisco Bay Regional Water Quality Control Board monitoring conditions",
  name: "Marsh Transect Survey",
  title: simTitle("Marsh Transect Survey"),
  tagline: "Vegetation survey on a fixed transect: bearing set from the start stake, tape run taut to the end stake, percent cover read to protocol class at every quadrat, elevation shot against the benchmark, the invasive hybrid Spartina flagged for the control crew, and the channel edge's erosion pins read before the tide takes the low transect",
  accent: MTS_ACCENT,
  accentCss: "#748a3c",
  parSeconds: 295,
  footprint: 2.4,
  badge: { id: "transect-closed", name: "Transect Closed", note: "Every quadrat covered, elevation shot, and the channel edge read before a flushed bird or the tide stopped the line — first time" },

  game: system({
    name: "Survey Crew",
    currency: "COVER",
    ranks: ["Field Tech", "Transect Tech", "Lead Tech", "Survey Steward", "Transect Certified"],
    badges: [
      { id: "clean-bearing", name: "Clean Bearing", note: "The compass set to the recorded bearing clean, first time", test: AWARD.stepClean("set-bearing") },
      { id: "no-flush", name: "No Flush", note: "Never a hazard, never a bird approached, never a habitat shortcut", test: AWARD.safe },
      { id: "true-shot", name: "True Shot", note: "The elevation shot and the erosion-pin reading both read inside the working band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-line", name: "Clean Line", note: "No corrections across the whole transect", test: AWARD.clean },
      { id: "steady-flag", name: "Steady Flag", note: "Held the flag and the channel-edge footing steady the whole way", test: AWARD.unbroken },
      { id: "off-before-tide", name: "Off Before The Tide", note: "Transect closed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "flush-approach": "You walked straight at the pickleweed to confirm the sighting instead of staying put and logging it from the buffer. Flushing a nesting Ridgway's rail is a take under the federal Endangered Species Act, and an adult kept off her nest by a crew that keeps closing the distance is a nest left open to a harrier for every extra minute it takes.",
    "pin-pulled": "You pulled the erosion pin out of the mud to read it up close instead of reading the exposed length in place. The pin's driven depth is the entire multi-year erosion record at that point on the channel edge — pull it to make the reading easier and the next survey has nothing left to compare its own reading to.",
    "compass-on-rebar": "You set the compass down on the steel benchmark rod to steady it while reading. Steel deflects a compass needle by degrees nobody sees happen at a glance, and a bearing read off a rebar-adjacent compass walks every quadrat down this transect further from the fixed line the trend data depends on.",
    "shortcut-through-pickleweed": "You cut straight across the dense pickleweed off the transect line to save the walk around. Pickleweed mats are exactly where the salt marsh harvest mouse nests, and the Endangered Species Act's take prohibition covers habitat disturbance as much as it covers touching the animal itself.",
  },

  lateNotes: {
    "level-rod": "Shoot the rod after the quadrat's cover is read — the elevation belongs to that quadrat's spot, not to wherever the rod happens to be standing.",
    "flag-kit": "Nothing to flag yet. The flag kit waits for the invasive clump to actually be found further down the line.",
    "tape-reel": "Nothing to run out yet — the bearing is set before the tape leaves the reel, or the line it draws isn't the line the compass just confirmed.",
  },

  // Interruptions: see shared/game.js. One is the marsh's own protected
  // species doing what a disturbed bird does; the other is the bay's tide
  // reaching the low end of the line faster than the table promised.
  interrupts: [
    {
      id: "rail-flush",
      kind: "Ridgway's rail flushing near the transect",
      after: "spartina-flag", delay: 4, seconds: 14,
      alert: "A Ridgway's rail has flushed out of the pickleweed a few metres off the line, calling as it goes — exactly the sign of a nest close enough that walking on is a taking of it.",
      cue: "Stop at the buffer and log the sighting — do not walk toward the bird or the cover it came out of.",
      target: "rail-sighting-log",
      why: "Ridgway's rail nests low in dense pickleweed within reach of tidal flooding, and a flushed adult leaves eggs or chicks exposed to gulls and harriers for every minute it stays away — the U.S. Fish and Wildlife Service's buffer exists because the survey crew's own presence is the disturbance the Endangered Species Act is written to prevent, and logging the sighting from the buffer, not approaching to confirm it, is what keeps the crew on the right side of that line.",
      missNote: "The crew kept moving toward the flushed bird's cover to finish the interval, and the rail stayed off its nest the entire time anyone was still closing the distance — exactly the outcome the buffer is meant to prevent.",
      wrongNote: "That's not it. Logging the sighting from the buffer is the one response here that doesn't put the crew closer to a bird that has already flushed.",
    },
    {
      id: "tide-arriving",
      kind: "Tide reaching the low transect early",
      after: "erosion-pins", delay: 4, seconds: 13,
      alert: "The tide gauge at the channel shows the water is already at the low transect's first interval, well ahead of today's table.",
      cue: "Read the tide gauge — if the water's really there, the low end of this transect is done for today.",
      target: "tide-gauge-stake",
      why: "A tide table is built on an average, and wind or a barometric low can push the real water tens of minutes ahead of it — on the low transect that difference is the gap between finishing the survey and finishing it wading, which is worse footing and worse data both. The gauge at the channel is the only reading of where the water actually is, and it is what tells the crew whether the last few quadrats happen today or wait for the next low.",
      missNote: "The crew kept working the table's schedule while the channel came up around the low transect's stakes, and the last interval's cover reading was taken standing in water nobody could say hadn't already covered part of the quadrat.",
      wrongNote: "Not that. The tide gauge at the channel is the only true reading of where the water is right now on this transect.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "survey-plan-board",
      title: "Read the survey plan and the cover-class protocol",
      cue: "Check today's transect ID, the percent-cover classes the crew reads to, and the benchmark elevation.",
      why: "This marsh exists as compensatory mitigation under the federal Clean Water Act (CWA), with EPA and the Regional Water Board watching the same vegetation trend this plan is built to produce, and a trend only means something if every survey reads cover to the same classes and shoots elevation against the same benchmark as the surveys before it — reading the plan here is what keeps this visit comparable to the one three months ago instead of a fresh guess at the marsh.",
    },
    {
      id: "species-brief", kind: "select", target: "species-board",
      title: "Check the species buffers and the control area map",
      cue: "Read the Ridgway's rail and salt marsh harvest mouse buffer distances, and the Invasive Spartina Project's control area map for this reach.",
      why: "Both species denning and nesting in this marsh are federally listed under the Endangered Species Act, and the U.S. Fish and Wildlife Service's buffer distances exist so a survey crew walking a transect does not become the disturbance that empties a nest — reading them before anyone steps off the levee is what keeps today's data collection from becoming tomorrow's take violation.",
    },
    {
      id: "stage", kind: "sequence", anyOrder: true,
      targets: ["stage-waders", "stage-clipboard", "stage-gps"],
      itemNames: { "stage-waders": "chest waders", "stage-clipboard": "waterproof clipboard", "stage-gps": "GPS unit" },
      title: "Stage for working the marsh plain",
      cue: "Waders, the waterproof clipboard, and the GPS unit before anyone steps onto the marsh plain.",
      why: "The marsh plain is soft mud cut by tidal channels that don't announce themselves until a boot is already in one, and waders are the same OSHA general industry PPE duty (29 CFR 1910.132) as any other job site — the clipboard and GPS are what turn today's readings into data the next survey can actually find and repeat rather than notes that only make sense to the person who wrote them.",
    },
    {
      id: "find-start", kind: "find", noHint: true,
      targets: ["start-stake", "benchmark-marker"],
      itemNames: { "start-stake": "transect start stake", "benchmark-marker": "elevation benchmark" },
      itemNotes: {
        "start-stake": "The transect's permanent start stake — every bearing, interval and quadrat on this line is measured from it, not from wherever the tape happens to be unrolled.",
        "benchmark-marker": "The fixed benchmark the level rod is shot against — without it, an elevation reading is a number with no reference to compare it to.",
      },
      title: "Find the start stake and the fixed benchmark",
      cue: "Walk the levee and find the transect's start stake and the fixed benchmark marker.",
      why: "A transect is a line between points that do not move, and the whole survey — bearing, tape, quadrats, elevation — is only repeatable if it starts from the same stake and reads against the same benchmark the last three surveys used, not a spot that merely looks close enough.",
    },
    {
      id: "gps-log", kind: "select", target: "gps-unit",
      title: "Log the GPS waypoint at the start stake",
      cue: "Log the GPS waypoint confirming the start stake before the bearing is set.",
      why: "A GPS waypoint logged at the start stake is what lets a different crew, in a different season, find this exact transect again without relying on a physical stake that erosion or a maintenance crew could eventually move — the coordinate backs up the marker, it doesn't replace the need to find it.",
    },
    {
      id: "set-bearing", kind: "turn", target: "compass",
      title: "Set the compass to the recorded bearing",
      cue: "Turn the compass housing to the transect's recorded bearing before the tape goes out.",
      turn: { turns: 0.6, axis: "y", label: "COMPASS BEARING" },
      why: "Every quadrat interval down this transect is defined as a distance along a bearing from the start stake, and a bearing set even a few degrees off walks every quadrat further from the fixed line the longer the tape runs — set it here, against the recorded heading, not by eye toward where the end stake looks like it should be.",
    },
    {
      id: "run-tape", kind: "drag", target: "tape-reel",
      title: "Run the tape to the end stake",
      cue: "Run the tape out from the start stake to the end stake along the bearing you just set.",
      why: "The tape turns a bearing and a distance into an actual line on the ground the crew can place quadrats against, and it only does that job stretched taut end to end — a tape that sags or falls short leaves every interval marked from a line that isn't really where the transect is defined to be.",
      drag: { to: "end-stake-socket", radius: 0.4, missNote: "Not at the end stake — the tape has to reach it or the intervals along the way aren't measured against anything real." },
    },
    {
      id: "place-quadrats", kind: "sequence",
      targets: ["interval-1", "interval-2", "interval-3"],
      itemNames: { "interval-1": "quadrat at interval 1", "interval-2": "quadrat at interval 2", "interval-3": "quadrat at interval 3" },
      title: "Place the quadrat frame at each interval, near to far",
      cue: "Place the quadrat frame at each marked interval, working from the near end of the tape to the far end.",
      why: "Working the transect in order, near interval to far, keeps the crew from doubling back across ground already flagged for the Spartina crew or already flushed a bird from — a quadrat placed out of sequence is also a reading that no longer matches the order the field sheet expects the data to arrive in.",
      outOfOrderNote: "Work the tape in order — interval 1, then 2, then 3. Skipping ahead means walking back across ground the buffer or the Spartina flag has already changed since you passed it.",
    },
    {
      id: "cover-estimate", kind: "sequence", anyOrder: true,
      targets: ["cover-pickleweed", "cover-cordgrass", "cover-invasive"],
      itemNames: { "cover-pickleweed": "pickleweed cover class", "cover-cordgrass": "native cordgrass cover class", "cover-invasive": "invasive Spartina cover class" },
      title: "Read the percent cover to protocol class",
      cue: "Estimate and log the percent-cover class for pickleweed, native cordgrass, and invasive Spartina in the quadrat.",
      why: "The protocol's cover classes exist so two different technicians looking at the same quadrat call it the same band of cover rather than two different guesses at a percentage — logging each species to its class, not to a number that merely feels right, is what makes this quadrat's reading comparable to the one another tech read last quarter.",
    },
    {
      id: "elevation-shot", kind: "gauge", target: "level-rod",
      title: "Shoot the elevation against the benchmark",
      cue: "Shoot the level rod against the benchmark and commit the elevation at this quadrat.",
      gauge: { label: "ELEVATION", speed: 0.7, green: [0.42, 0.6], readout: (t) => `${(t * 1.8).toFixed(2)} m NAVD88`, missNote: "Off the benchmark reading. Shoot the rod again at the marked point before committing." },
      why: "Marsh vegetation zones by elevation within centimetres, and a trend that tracks cordgrass creeping upslope or pickleweed losing ground only means something if every quadrat's elevation is shot against the same fixed benchmark the whole survey series has always used, not eyeballed against the ground beside it.",
    },
    {
      id: "spartina-flag", kind: "hold", target: "flag-kit", seconds: 5,
      title: "Flag the invasive hybrid Spartina for the control crew",
      cue: "Hold the flag stake down into the mud beside the invasive Spartina clump until it's seated.",
      why: "A flag pushed in and let go immediately works loose on the next tide, and an unflagged hybrid Spartina clump is a clump the Invasive Spartina Project's control crew has no way of finding on their own pass — holding it seated is what turns today's find into next month's treatment instead of another season of the hybrid spreading unmarked.",
      holdBreakNote: "Let go before the stake was seated — that flag is gone by the next tide. Reset it and hold until it's firm.",
    },
    {
      id: "erosion-pins", kind: "track", target: "erosion-pin-line", seconds: 7,
      title: "Read the channel edge's erosion pins",
      cue: "Hold position at the channel edge and read all three erosion pins without the tide pushing you off it.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.12, label: "CHANNEL EDGE", readout: (v) => (v < 0.4 ? "too far back — pins not read" : v > 0.6 ? "too close to the cut bank" : "holding the edge") },
      why: "The pins measure how far the channel edge has cut back since they were driven, and that only works if each one is read from the same footing every visit — crowding the cut bank to read faster risks the same undercutting the pins exist to measure, and backing too far off misses the pin closest to the water entirely.",
      holdBreakNote: "Footing broke before all three pins were read — get back to a steady position at the edge and finish the line.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["unlogged-quadrat", "loose-flagging-tape"],
      itemNames: { "unlogged-quadrat": "the unlogged quadrat", "loose-flagging-tape": "the loose flagging tape" },
      itemNotes: {
        "unlogged-quadrat": "This quadrat's cover reading never made it onto the sheet — a gap here is a hole in this quarter's dataset nobody notices until the numbers don't add up.",
        "loose-flagging-tape": "A strip of flagging tape has come untied and is loose on the transect — left here, it's litter on a marsh the crew is supposed to be protecting, not decorating.",
      },
      title: "Walk the transect before closing it out",
      cue: "Walk the transect back and check for anything left undone or left behind before you close it out.",
      why: "The last walk is the only chance to catch a quadrat whose reading never made it to the sheet or a piece of gear the marsh itself will otherwise keep — closing the transect here, on the ground, is cheaper than discovering the gap back at the office with no way to reread today's marsh.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, MTS_ACCENT);

    // ---------------------------------------------------------------- terrain
    // Levee/upland at the start-stake end (positive z), the marsh plain the
    // transect crosses in the middle, and the tidal channel toward the far
    // (negative z, low) end — all at or above y=0.
    const levee = box(g, 5.2, 0.28, 1.1, 0, 0.14, 1.75, 0x5a5540, { rough: 0.96 });
    void levee;
    const leveeTop = box(g, 5.2, 0.02, 1.1, 0, 0.291, 1.75, 0x66603f, { rough: 0.94, cast: false });
    void leveeTop;
    const slope = box(g, 5.2, 0.3, 0.5, 0, 0.13, 1.1, 0x4d4a34, { rough: 0.96 });
    slope.rotation.x = 0.3;

    // Marsh surface: mudflatFace tinted green, per the district's own tidal
    // ground treatment, rather than a flat colour plane.
    const marshTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#3f4a30", base2: "#2f3824" }), { repeat: 3, px: 256 });
    const marsh = box(g, 5.2, 0.1, 2.2, 0, 0.05, 0.1, 0x3f4a30, { rough: 0.95 });
    marsh.material = texturedMat(marshTex, { rough: 0.95, color: 0x8a9a68 });

    // Tidal channel toward the low end of the transect.
    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0c2531", mid: "#0f2e3a", base2: "#0a1f29" }), { repeat: 4, px: 256 });
    const water = box(g, 5.2, 0.03, 0.9, 0, 0.012, -1.75, 0x0f2e3a, { rough: 0.22, metal: 0.28, opacity: 0.87, transparent: true, cast: false });
    water.material = texturedMat(waterTex, { rough: 0.22, metal: 0.25, color: 0x2c6a72 });
    water.material.transparent = true;
    water.material.opacity = 0.87;

    const wave = particles(g, 20, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.35 });
    wave.position.set(0, 0.03, -2.0);

    // Cordgrass and pickleweed scattered across the marsh plain, in the
    // district's own clump style — background vegetation distinct from the
    // three specific clumps the cover-estimate step reads.
    for (let i = 0; i < 9; i++) {
      const gx = (Math.random() - 0.5) * 4.6, gz = -0.9 + Math.random() * 1.7;
      if (Math.abs(gx) < 0.35 && gz > -0.6 && gz < 0.9) continue; // keep the tape line clear
      mtsGrassClump(g, gx, gz, { n: 5 + Math.floor(Math.random() * 3), h: 0.16 + Math.random() * 0.16, spread: 0.1, tone: Math.random() > 0.5 ? 0x5d7a3a : 0x6f5a3a });
    }

    // -------------------------------------------------------- upland station
    const planBoard = holoPanel(g, 0.9, 0.62, -1.9, 1.08, 1.75, (cx, w, h) => {
      cx.fillStyle = "#161c10"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#748a3c"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaf0dc"; cx.fillText("SURVEY PLAN — TRANSECT M-3", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#e3ecd4";
      ["Bearing: 214° from start stake", "Intervals: 3 @ fixed spacing", "Cover classes: 0 / <1 / 1–5 / 5–25 / 25–50 / 50–75 / 75–95 / >95%",
       "Benchmark: BM-7, elevation fixed", "Confirm tide against the channel gauge"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { ry: 0.5, accent: MTS_ACCENT });
    reg(hits, planBoard, "survey-plan-board");

    const speciesBoard = holoPanel(g, 0.9, 0.62, 1.9, 1.08, 1.75, (cx, w, h) => {
      cx.fillStyle = "#161c10"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#748a3c"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaf0dc"; cx.fillText("SPECIES BUFFERS & CONTROL MAP", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#e3ecd4";
      ["USFWS ESA — Ridgway's rail buffer", "USFWS ESA — salt marsh harvest mouse", "Invasive Spartina Project control area",
       "BCDC permit — marsh restoration", "RWQCB monitoring conditions"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -0.5, accent: MTS_ACCENT });
    reg(hits, speciesBoard, "species-board");

    const chest = toolChest(g, 0, 1.85, { color: 0x5a6b38 });
    for (const [id, dx, color, label] of [["stage-waders", -0.2, 0x8a6a4a, "WADERS"], ["stage-clipboard", 0.0, 0xd9cbb2, "CLIP"], ["stage-gps", 0.2, 0x2b3138, "GPS"]]) {
      const it = group(chest, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#161c10", accent: "#eaf0dc", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const crewUpland = standingFigure(g, 2.25, 1.2, { ry: -2.3, cloth: 0x4a5a34, vest: 0xe8b02e });
    void crewUpland;

    const gpsUnitGrp = group(g, 1.4, 0.32, 1.55, -0.3);
    box(gpsUnitGrp, 0.09, 0.03, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    decal(gpsUnitGrp, 0.07, 0.1, 0, 0.016, 0, signFace("GPS", { bg: "#0d140a", accent: "#a7c96a", scale: 0.55 })).rotation.x = -Math.PI / 2;
    holoTag(gpsUnitGrp, "GPS unit", 0, 0.14, 0, { css: "#748a3c", w: 0.22 });
    reg(hits, gpsUnitGrp, "gps-unit");

    // ------------------------------------------------------------ transect
    const startStake = group(g, 0, 0.16, 1.4);
    cyl(startStake, 0.016, 0.018, 0.6, 0, 0.3, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
    box(startStake, 0.1, 0.06, 0.01, 0, 0.55, 0, 0xe8622a, { rough: 0.75 });
    decal(startStake, 0.09, 0.045, 0, 0.55, 0.006, signFace("START", { bg: "#161c10", accent: "#eaf0dc", scale: 0.5 }));
    reg(hits, startStake, "start-stake");

    const benchmark = group(g, -0.55, 0.15, 1.35);
    cyl(benchmark, 0.03, 0.03, 0.5, 0, 0.25, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    ball(benchmark, 0.045, 0, 0.5, 0, 0xd9c24a, { rough: 0.4, metal: 0.5, seg: 12 });
    holoTag(benchmark, "benchmark BM-7", 0, 0.66, 0, { css: "#748a3c", w: 0.3 });
    reg(hits, benchmark, "benchmark-marker");
    const rebarHazard = box(g, 0.2, 0.3, 0.2, -0.55, 0.3, 1.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "steady the compass here?", -0.55, 0.55, 1.35, { css: "#e8622a", w: 0.44 });
    reg(hits, rebarHazard, "compass-on-rebar");

    const compassGrp = group(g, 0.55, 0.14, 1.35);
    cyl(compassGrp, 0.03, 0.035, 0.4, 0, 0.2, 0, CITY.steel, { rough: 0.4, metal: 0.6, seg: 10 });
    const compassHousing = group(compassGrp, 0, 0.42, 0);
    cyl(compassHousing, 0.09, 0.09, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 20 });
    box(compassHousing, 0.014, 0.014, 0.13, 0, 0.018, 0, 0xd2312b, { rough: 0.5 });
    holoTag(compassGrp, "survey compass", 0, 0.6, 0, { css: "#748a3c", w: 0.3 });
    reg(hits, compassGrp, "compass");

    // Tape reel staged at the start stake; a taut tape line reveals once run.
    const reelGrp = group(g, 0.9, 0.14, 1.3, 0.4);
    cyl(reelGrp, 0.07, 0.07, 0.05, 0, 0, 0, 0xd9cbb2, { rough: 0.6, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(reelGrp, "tape reel — furled", 0, 0.16, 0, { css: "#748a3c", w: 0.3 });
    reg(hits, reelGrp, "tape-reel");

    const endStake = group(g, 0, 0.13, -1.4);
    cyl(endStake, 0.016, 0.018, 0.55, 0, 0.27, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
    box(endStake, 0.1, 0.06, 0.01, 0, 0.5, 0, 0xe8622a, { rough: 0.75 });
    decal(endStake, 0.09, 0.045, 0, 0.5, 0.006, signFace("END", { bg: "#161c10", accent: "#eaf0dc", scale: 0.5 }));
    const endSocket = group(endStake, 0, 0.14, 0.06);
    hits["end-stake-socket"] = endSocket;

    const tapeLine = box(g, 0.02, 0.005, 2.8, 0, 0.15, 0.0, 0xf2ae14, { rough: 0.5, cast: false });
    tapeLine.visible = false;

    // ------------------------------------------------------- quadrat intervals
    const intervalMarkers = {};
    for (const [id, z, label] of [["interval-1", 0.8, "1"], ["interval-2", 0, "2"], ["interval-3", -0.8, "3"]]) {
      const st = group(g, 0.4, 0.13, z);
      cyl(st, 0.01, 0.012, 0.3, 0, 0.15, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
      const flag = box(st, 0.06, 0.04, 0.008, 0, 0.28, 0, 0x748a3c, { rough: 0.7 });
      decal(st, 0.05, 0.03, 0, 0.28, 0.005, signFace(label, { bg: "#161c10", accent: "#eaf0dc", scale: 0.6 }));
      reg(hits, st, id);
      intervalMarkers[id] = { st, flag };
    }

    // Quadrat frame — one representative frame set at interval 2, where the
    // cover-estimate and elevation steps read.
    const frameGrp = group(g, 0.4, 0.14, 0);
    for (const [dx, dz] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) {
      cyl(frameGrp, 0.005, 0.005, 0.44, dx, 0.01, dz, 0xe8b02e, { rough: 0.5, metal: 0.4, seg: 8 }).rotation.set(dz > 0 ? Math.PI / 2 : -Math.PI / 2, 0, 0);
    }
    box(frameGrp, 0.44, 0.01, 0.01, 0, 0.01, -0.22, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    box(frameGrp, 0.44, 0.01, 0.01, 0, 0.01, 0.22, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    box(frameGrp, 0.01, 0.01, 0.44, -0.22, 0.01, 0, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    box(frameGrp, 0.01, 0.01, 0.44, 0.22, 0.01, 0, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    holoTag(frameGrp, "quadrat frame — 1 m²", 0, 0.24, 0, { css: "#748a3c", w: 0.4 });
    reg(hits, frameGrp, "quadrat-frame");

    // Three species clumps inside interval 2's quadrat, distinct from the
    // background vegetation, for the cover-estimate step.
    const coverPickleweed = group(g, 0.28, 0.14, -0.14);
    mtsGrassClump(coverPickleweed, 0, 0, { n: 6, h: 0.1, hVar: 0.05, tone: 0x8a5a4a, tip: 0xb08a5a, spread: 0.07 });
    reg(hits, coverPickleweed, "cover-pickleweed");
    const coverCordgrass = group(g, 0.5, 0.14, 0.12);
    mtsGrassClump(coverCordgrass, 0, 0, { n: 7, h: 0.26, hVar: 0.1, tone: 0x5d7a3a, tip: 0x8a8f4a, spread: 0.08 });
    reg(hits, coverCordgrass, "cover-cordgrass");
    const coverInvasive = group(g, 0.32, 0.14, 0.18);
    mtsGrassClump(coverInvasive, 0, 0, { n: 7, h: 0.3, hVar: 0.08, tone: 0x9aa04a, tip: 0xc9c95a, spread: 0.1 });
    reg(hits, coverInvasive, "cover-invasive");

    // -------------------------------------------------------------- level rod
    const rod = group(g, -0.4, 0.14, -0.15);
    cyl(rod, 0.014, 0.014, 1.1, 0, 0.55, 0, 0xf2f6fa, { rough: 0.6, seg: 8 });
    for (let i = 1; i < 10; i++) box(rod, 0.05, 0.01, 0.03, 0, i * 0.11, 0.017, i % 5 === 0 ? 0xd2312b : 0x1b1e23, { rough: 0.7, cast: false });
    const rodReadout = instrument(rod, 0.12, 0.5, 0, { idle: "-- m", color: 0x748a3c, w: 0.12, d: 0.18 });
    holoTag(rod, "level rod", 0, 1.2, 0, { css: "#748a3c", w: 0.24 });
    reg(hits, rod, "level-rod");

    // -------------------------------------------------------- invasive clump
    // A larger, further-down-transect hybrid Spartina clump — the one the
    // flag step actually marks for the control crew — distinct from the
    // small cover-estimate clump back at interval 2.
    const invasiveClump = group(g, 1.1, 0.13, -0.55);
    mtsGrassClump(invasiveClump, 0, 0, { n: 10, h: 0.34, hVar: 0.1, tone: 0x9aa04a, tip: 0xc9c95a, spread: 0.16 });
    holoTag(invasiveClump, "hybrid Spartina — unflagged", 0, 0.5, 0, { css: "#e8622a", w: 0.5 });

    const flagKitGrp = group(g, 1.45, 0.13, -0.55);
    cyl(flagKitGrp, 0.01, 0.01, 0.36, 0, 0.18, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
    const flagBanner = box(flagKitGrp, 0.09, 0.06, 0.008, 0.06, 0.32, 0, 0xd2312b, { rough: 0.6 });
    holoTag(flagKitGrp, "flag kit", 0, 0.42, 0, { css: "#748a3c", w: 0.26 });
    reg(hits, flagKitGrp, "flag-kit");
    const shortcutHazard = box(g, 0.7, 0.3, 0.6, 0.85, 0.2, -0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cut across the pickleweed?", 0.85, 0.5, -0.55, { css: "#e8622a", w: 0.5 });
    reg(hits, shortcutHazard, "shortcut-through-pickleweed");

    // Rail sighting off the transect line, in dense cover, with the
    // reporting log the interruption actually resolves against.
    const railCoverGrp = group(g, -1.3, 0.13, -0.3);
    mtsGrassClump(railCoverGrp, 0, 0, { n: 9, h: 0.24, hVar: 0.1, tone: 0x6f5a3a, tip: 0x8a7a5a, spread: 0.2 });
    const railBird = group(railCoverGrp, 0.1, 0.16, 0.05);
    ball(railBird, 0.05, 0, 0, 0, 0x4a3a2a, { rough: 0.8, seg: 10 });
    ball(railBird, 0.03, 0.06, 0.01, 0, 0x4a3a2a, { rough: 0.8, seg: 8 });
    railBird.visible = false;
    const flushHazard = box(g, 0.6, 0.3, 0.6, -1.3, 0.2, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk toward the flushed bird?", -1.3, 0.5, -0.3, { css: "#e8622a", w: 0.52 });
    reg(hits, flushHazard, "flush-approach");

    const railLogGrp = group(g, -0.85, 0.5, 1.15, 0.5);
    box(railLogGrp, 0.09, 0.06, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    decal(railLogGrp, 0.075, 0.04, 0, 0.031, 0, signFace("LOG", { bg: "#161c10", accent: "#eaf0dc", scale: 0.55 })).rotation.x = -Math.PI / 2;
    holoTag(railLogGrp, "sighting log", 0, 0.14, 0, { css: "#748a3c", w: 0.3 });
    reg(hits, railLogGrp, "rail-sighting-log");

    // ------------------------------------------------------------ erosion pins
    // A stance plaque at the channel edge — the physical thing the crew
    // reads the three pins from, and the track step's actual, clickable
    // target (the pins themselves are the fixed instruments, read from here).
    const pinLineGrp = group(g, 0.1, 0.02, -1.55);
    slab(pinLineGrp, 0.3, 0.02, 0.24, 0, 0.01, 0, 0x4a5540, { rough: 0.85 });
    holoTag(pinLineGrp, "read the pins from here", 0, 0.2, 0, { css: "#748a3c", w: 0.4 });
    reg(hits, pinLineGrp, "erosion-pin-line");
    const pins = [];
    for (const dx of [-0.35, 0, 0.35]) {
      const pin = group(g, dx + 0.1, 0.02, -1.6);
      cyl(pin, 0.008, 0.008, 0.24, 0, 0.06, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
      pins.push(pin);
    }
    const pullPinHazard = box(g, 0.4, 0.3, 0.3, 0.1, 0.2, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pull a pin to read it?", 0.1, 0.45, -1.6, { css: "#e8622a", w: 0.44 });
    reg(hits, pullPinHazard, "pin-pulled");

    // Tide gauge stake at the channel — the interruption's real reading.
    const tideStaff = group(g, -1.6, 0.02, -1.7);
    box(tideStaff, 0.06, 0.8, 0.025, 0, 0.4, 0, 0xf2f6fa, { rough: 0.7 });
    for (let i = 1; i < 8; i++) box(tideStaff, 0.06, 0.01, 0.028, 0, i * 0.09, 0.002, i % 3 === 0 ? 0xd2312b : 0x1b1e23, { rough: 0.7, cast: false });
    holoTag(tideStaff, "tide gauge — read it, not the table", 0, 0.94, 0, { css: "#748a3c", w: 0.5 });
    reg(hits, tideStaff, "tide-gauge-stake");

    // ---------------------------------------------------------------- walk
    const unloggedFlag = group(g, -0.9, 0.14, 0.35, 0.3);
    cyl(unloggedFlag, 0.008, 0.008, 0.2, 0, 0.1, 0, 0xc9b58c, { rough: 0.9, seg: 6 });
    box(unloggedFlag, 0.05, 0.04, 0.006, 0, 0.2, 0, 0xd2312b, { rough: 0.7 });
    reg(hits, unloggedFlag, "unlogged-quadrat");
    const looseTape = box(g, 0.05, 0.02, 0.14, 0.7, 0.14, 0.35, 0xe8b02e, { rough: 0.7 });
    reg(hits, looseTape, "loose-flagging-tape");

    cone(g, -2.4, 1.9, { color: MTS_ACCENT });
    cone(g, 2.4, 1.9, { color: MTS_ACCENT });
    barrierPanel(g, 0, 2.0, { color: 0xe8b02e });
    const spray = particles(g, 16, 0xbfe6f2, { size: 0.025, life: 0.7, additive: false, opacity: 0.3 });
    spray.position.set(0, 0.05, -1.65);


    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.0, 1.0),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "run-tape") {
          reelGrp.visible = false;
          tapeLine.visible = true;
        }
        if (step.id === "place-quadrats") {
          for (const m of Object.values(intervalMarkers)) m.flag.material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "cover-estimate") {
          for (const c of [coverPickleweed, coverCordgrass, coverInvasive]) {
            c.traverse((o) => { if (o.isMesh) o.material = mat(0x59c97b, { rough: 0.7 }); });
          }
        }
        if (step.id === "spartina-flag") {
          flagBanner.material = mat(0x59c97b, { rough: 0.6 });
          holoTag(invasiveClump, "hybrid Spartina — flagged", 0, 0.5, 0, { css: "#59c97b", w: 0.46 });
        }
        if (step.id === "walk") {
          unloggedFlag.visible = false;
          looseTape.visible = false;
        }
      },

      onInterrupt(it) {
        if (it.id === "rail-flush") {
          railBird.visible = true;
        }
        if (it.id === "tide-arriving") {
          water.position.z += 0.3;
          water.scale.x = 1.12;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "rail-flush") {
          railBird.visible = false;
        }
        if (it.id === "tide-arriving") {
          water.position.z -= 0.3;
          water.scale.x = 1.0;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, 0.02, -2.2), 1.2, 0.3, -0.1);
        spray.visible = true;
        spray.userData.step(dt, new THREE.Vector3(0, 0.06, -1.65), 0.5, 0.25, -0.2);
        water.position.y = 0.012 + Math.sin(t * 1.1) * 0.005;
        if (waterTex.offset) {
          waterTex.offset.x = (t * 0.012) % 1;
          waterTex.offset.y = (t * 0.008) % 1;
        }

        const step = session?.step;
        if (step?.id === "elevation-shot") {
          const gg = session?.gauge;
          if (gg && !gg.committed) {
            repaint(rodReadout.userData.screen, signFace(`${(gg.t * 1.8).toFixed(2)} m`, { bg: "#0d140a", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
          }
        }
      },
    };
  },
};
