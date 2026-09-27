/**
 * Generates WebXR/underwater/js/dives-data.js — the dive quest layer for
 * The Deep, the dive game under the bay (DEEP2: WebXR/underwater/; DEEP1:
 * WebXR/shared/underwater-data.js, read here through the game's own adapter
 * WebXR/underwater/js/seabed.js, so this script follows whichever seabed
 * module that adapter is switched to).
 *
 *     node tools/gen_dive_quests.mjs
 *
 * What is generated versus authored here, mirroring tools/gen_bay_quests.mjs:
 *
 *  - The **side dives** — one opener and one capstone per programme that a
 *    DEEP_SITES entry anchors — are built from CURRICULA and the seabed's own
 *    sites, so a station added to a programme or a programme anchored at a
 *    new site is picked up the next time this runs.
 *  - The **main arc** (six dives, a survey career from the pier pilings to
 *    the seamount), the **lantern eggs** and the **four scored activities**
 *    are authored as plain data below, but every station step's text is that
 *    station's own `why` line from CURRICULA, quoted live, and every lantern
 *    egg's lesson is the FIRST SENTENCE of a real station step's own `why`,
 *    read from that station's source file at generation time — so a lesson
 *    is always a verbatim quote of shipped content (tools/check_dive_quests.mjs
 *    re-verifies the substring), and a station or step renamed makes this
 *    script throw instead of shipping a stale dive.
 *
 * Content rules (tools/briefs/underwater-brief.md): generic names only, no
 * species fact stated as a claim, no date, count, owner, organisation or
 * brand, and no depth, gas, decompression or current limit ever stated —
 * "per the dive plan and the tables the supervisor holds". Every giver is a
 * job title, never a name. No violence, no gambling.
 *
 * Reward tiers: every main or side dive carries a `tier` and
 * `reward.xp = dvRewardForTier(tier)`, the same monotone formula
 * WebXR/underwater/js/dives.js exports; eggs and activities carry a flat
 * collectible reward.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const OUT_FILE = join(WEBXR, "underwater", "js", "dives-data.js");
const SIM_DIR = join(WEBXR, "smartcity", "js", "sims");

const { CURRICULA } = await import(pathToFileURL(join(WEBXR, "smartcity", "js", "curricula.js")));
const { DV_SITES, DV_LANDMARKS } = await import(pathToFileURL(join(WEBXR, "underwater", "js", "seabed.js")));

function programme(id) {
  const p = CURRICULA.find((c) => c.id === id);
  if (!p) throw new Error(`gen_dive_quests: no programme "${id}" in curricula.js`);
  return p;
}
function whyLookup(prog) { return new Map(prog.stations.map((s) => [s.id, s.why])); }
function why(prog, whyMap, stationId) {
  if (!whyMap.has(stationId)) throw new Error(`gen_dive_quests: station "${stationId}" is not in programme "${prog.id}" — update the dive chain in this script`);
  return whyMap.get(stationId);
}
function siteNamed(id) {
  const s = DV_SITES.find((x) => x.id === id);
  if (!s) throw new Error(`gen_dive_quests: no DEEP_SITES entry "${id}"`);
  return s.name;
}
function landmarkNamed(id) {
  const l = DV_LANDMARKS.find((x) => x.id === id);
  if (!l) throw new Error(`gen_dive_quests: no DEEP_LANDMARKS entry "${id}"`);
  return l.name;
}

// --------------------------------------------------------------- rewards

const DV_XP_BASE = 100;
const DV_XP_STEP = 150;
export function dvRewardForTier(tier) {
  if (!Number.isInteger(tier) || tier < 1) throw new Error(`dvRewardForTier: tier must be a positive integer, got ${tier}`);
  return DV_XP_BASE + (tier - 1) * DV_XP_STEP;
}
const tierReward = (tier, badge) => ({ xp: dvRewardForTier(tier), badge });

// ============================================================= MAIN ARC
// A survey career, six dives from the pier pilings to the seamount. Each
// station step quotes that station's own why line live from CURRICULA.
const BR = programme("bay-restoration-maritime-underwater"), brWhy = whyLookup(BR), brw = (id) => why(BR, brWhy, id);
const MW = programme("bay-area-union-edition"), mwWhy = whyLookup(MW), mww = (id) => why(MW, mwWhy, id);
const HP = programme("hunters-point-bay-restoration"), hpWhy = whyLookup(HP), hpw = (id) => why(HP, hpWhy, id);

const MAIN_DIVES = [
  {
    id: "dv-main-00-pilings", title: "First Splash", giver: "the dive supervisor", site: siteNamed("pier-surface-supplied-station"), kind: "main", tier: 1, requires: null,
    steps: [
      { type: "goto", target: siteNamed("pier-surface-supplied-station"), text: "The dive station is set up on the pier deck above the pilings, the supervisor at the panel." },
      { type: "talk", target: "dive-supervisor", text: "\"Nobody gets wet until the deck is right. The plan, the hazards, the station — in that order. Then the pilings.\"" },
      { type: "station", target: "br-dive-site-hazard-assessment-and-jsa", text: brw("br-dive-site-hazard-assessment-and-jsa") },
      { type: "station", target: "br-surface-supplied-dive-station-setup", text: brw("br-surface-supplied-dive-station-setup") },
      { type: "talk", target: "dive-supervisor", text: "\"That's a station I'd breathe from. Welcome to the survey crew.\"" },
    ],
    reward: tierReward(1, "First Splash"),
  },
  {
    id: "dv-main-01-shelf", title: "Shelf Hand", giver: "the standby diver", site: siteNamed("shelf-checkout-site"), kind: "main", tier: 2, requires: "dv-main-00-pilings",
    steps: [
      { type: "goto", target: siteNamed("shelf-checkout-site"), text: "Sun-lit sand, a training grid and the standby diver waiting at the down line." },
      { type: "talk", target: "standby-diver", text: "\"Before you survey anything, you learn how we come and get you. Then we read the gauge post together.\"" },
      { type: "station", target: "mw-diver-emergency-and-recovery", text: mww("mw-diver-emergency-and-recovery") },
      { type: "goto", target: landmarkNamed("tide-gauge-post"), text: "Swim to the tide-gauge post on the shelf and read the water from below." },
      { type: "talk", target: "standby-diver", text: "\"Good. The shelf's yours now — and every ascent line on it.\"" },
    ],
    reward: tierReward(2, "Shelf Hand"),
  },
  {
    id: "dv-main-02-meadow", title: "The Meadow Grid", giver: "the transplant lead", site: siteNamed("eelgrass-transplant-plots"), kind: "main", tier: 3, requires: "dv-main-01-shelf",
    steps: [
      { type: "goto", target: siteNamed("eelgrass-transplant-plots"), text: "Grass blades bend with the tide over a planting grid of numbered stakes." },
      { type: "talk", target: "transplant-lead", text: "\"The grid is the survey. Every planting has a stake, every stake has a number, and the supervisor never gets in the water.\"" },
      { type: "station", target: "eelgrass-transplant", text: hpw("eelgrass-transplant") },
      { type: "find", target: landmarkNamed("eelgrass-nursery-plots"), text: "Find the nursery plots' corner stake and note its tag." },
      { type: "talk", target: "transplant-lead", text: "\"Logged. The meadow's edge is the next line out — the reef field is past it.\"" },
    ],
    reward: tierReward(3, "Meadow Grid"),
  },
  {
    id: "dv-main-03-reef", title: "Cores on the Flats", giver: "the sampling lead", site: siteNamed("flats-sediment-core-site"), kind: "main", tier: 4, requires: "dv-main-02-meadow",
    steps: [
      { type: "goto", target: siteNamed("flats-sediment-core-site"), text: "A core rack on the flats beside the station marker, the sampling lead pointing at the sampling plan's number." },
      { type: "talk", target: "sampling-lead", text: "\"A core is a record. It only stays one if it goes in straight, comes out sealed and travels under custody.\"" },
      { type: "station", target: "br-underwater-sediment-core-sampling", text: brw("br-underwater-sediment-core-sampling") },
      { type: "station", target: "br-sediment-chain-of-custody-and-lab-prep", text: brw("br-sediment-chain-of-custody-and-lab-prep") },
      { type: "talk", target: "sampling-lead", text: "\"Custody signed. The channel's next — and the hollow past it.\"" },
    ],
    reward: tierReward(4, "Core Sampler"),
  },
  {
    id: "dv-main-04-wreck", title: "The Hollow", giver: "the survey lead", site: siteNamed("wreck-photo-survey"), kind: "main", tier: 5, requires: "dv-main-03-reef",
    steps: [
      { type: "goto", target: siteNamed("wreck-photo-survey"), text: "A scoured hollow, a small derelict hull settled in it bow to the current." },
      { type: "talk", target: "survey-lead", text: "\"Nothing comes off this bottom until it's on the map. Baseline first, then the ROV runs the hull for us.\"" },
      { type: "station", target: "br-underwater-debris-survey-and-mapping", text: brw("br-underwater-debris-survey-and-mapping") },
      { type: "rov", target: landmarkNamed("wreck-bow"), text: "Pilot the ROV along the hull to its bow, tether tended, and hold there." },
      { type: "talk", target: "survey-lead", text: "\"Mapped and photographed. One stop left on this career: the pinnacle.\"" },
    ],
    reward: tierReward(5, "Wreck Surveyor"),
  },
  {
    id: "dv-main-05-seamount", title: "The Pinnacle", giver: "the compliance biologist", site: siteNamed("seamount-capstone-survey"), kind: "main", tier: 6, requires: "dv-main-04-wreck",
    steps: [
      { type: "goto", target: siteNamed("seamount-capstone-survey"), text: "The seamount rises out of deep water; the survey boat lies over its pinnacle." },
      { type: "talk", target: "compliance-biologist", text: "\"Out here the watch matters as much as the work, and the data only says what the reviewed sheets back up.\"" },
      { type: "station", target: "br-marine-mammal-observer-during-pile-driving", text: brw("br-marine-mammal-observer-during-pile-driving") },
      { type: "station", target: "br-restoration-data-qa-and-public-reporting", text: brw("br-restoration-data-qa-and-public-reporting") },
      { type: "goto", target: landmarkNamed("seamount-pinnacle"), text: "Swim to the top of the pinnacle and look back over the whole field." },
      { type: "talk", target: "compliance-biologist", text: "\"From the pilings to here — that's a survey career. Every line on this map is yours to dive again.\"" },
    ],
    reward: tierReward(6, "Pinnacle"),
  },
];

// ============================================================ SIDE DIVES
// One opener and one capstone per programme a DEEP_SITES entry anchors,
// generated from CURRICULA and the seabed's own sites. The stations a dive
// names are the programme's stations that some seabed site actually lists
// (first three in programme order for the opener, last three for the
// capstone), falling back to the programme's own first/last three when the
// seabed lists fewer, so a dive always points at a real bench.
const OPENER_STATION_COUNT = 3;
const CAPSTONE_STATION_COUNT = 3;

function buildSideDivesForProgramme(prog, site) {
  const whyMap = whyLookup(prog);
  const anchored = new Set(DV_SITES.filter((s) => s.programmes.includes(prog.id)).flatMap((s) => s.stations));
  const inSeabed = prog.stations.filter((s) => anchored.has(s.id));
  const pool = inSeabed.length >= OPENER_STATION_COUNT + 1 ? inSeabed : prog.stations;
  const openerStations = pool.slice(0, OPENER_STATION_COUNT);
  const capstoneStations = pool.length > OPENER_STATION_COUNT ? pool.slice(-CAPSTONE_STATION_COUNT) : pool.slice(0, CAPSTONE_STATION_COUNT);
  const openerId = `dv-side-${prog.id}-opener`;
  const opener = {
    id: openerId, title: `${prog.name} — First Dive`, giver: "the programme's dive lead", site: site.name, kind: "side", tier: 1, requires: null,
    programmeId: prog.id, role: "opener",
    steps: [
      { type: "goto", target: site.name, text: `The dive lead meets you at ${site.name} and walks you to the first bench.` },
      ...openerStations.map((s) => ({ type: "station", target: s.id, text: why(prog, whyMap, s.id) })),
      { type: "talk", target: "dive-lead", text: `"${prog.summary}"` },
    ],
    reward: tierReward(1, `${prog.name} — Opener`),
  };
  const capstone = {
    id: `dv-side-${prog.id}-capstone`, title: `${prog.name} — Capstone Dive`, giver: "the programme's certifying evaluator", site: site.name, kind: "side", tier: 2, requires: openerId,
    programmeId: prog.id, role: "capstone",
    steps: [
      { type: "goto", target: site.name, text: "The certifying evaluator is waiting at the last bench, sign-off sheet in hand." },
      ...capstoneStations.map((s) => ({ type: "station", target: s.id, text: why(prog, whyMap, s.id) })),
      { type: "talk", target: "certifying-evaluator", text: `"Certified under: ${prog.certification}"` },
    ],
    reward: tierReward(2, `${prog.name} — Capstone`),
  };
  return [opener, capstone];
}

const SIDE_PROGRAMME_IDS = [...new Set(DV_SITES.flatMap((s) => s.programmes))];
const SIDE_DIVES = SIDE_PROGRAMME_IDS.flatMap((id) => {
  const prog = programme(id);
  const site = DV_SITES.find((s) => s.programmes.includes(id));
  return buildSideDivesForProgramme(prog, site);
});

// ================================================================= EGGS
// Lantern eggs: a small lantern at a landmark, or a field note that comes
// over the comms. Each teaches one habit quoted verbatim — the first
// sentence of a real station step's own `why` line, read from the station's
// source file here (never retyped). Landmark notes are the landmark's name
// plus one generic sentence: no digit, no fact-shaped word.
// A landmark's own blurb, except where this layer keeps a plainer note of
// its own (the checker refuses any height- or history-shaped word in a note).
const DV_OWN_NOTES = {
  "kelp-cathedral": "The grandest stand in the forest, where the stipes rise like columns and the canopy closes overhead.",
  "marsh-mouth-bar": "A ridge of sand where the marsh channel drops its load, shifting a little with every big tide.",
};
const LANDMARK_NOTES = Object.fromEntries(DV_LANDMARKS.map((l) => [l.name, DV_OWN_NOTES[l.id] ?? l.blurb]));

function stepWhyFirstSentence(stationId, stepId) {
  const file = join(SIM_DIR, `${stationId}.js`);
  const src = readFileSync(file, "utf8");
  const at = src.indexOf(`id: "${stepId}"`);
  if (at < 0) throw new Error(`gen_dive_quests: step "${stepId}" not found in ${stationId}.js`);
  const m = /\swhy: "((?:[^"\\]|\\.)*)"/.exec(src.slice(at));
  if (!m) throw new Error(`gen_dive_quests: step "${stepId}" in ${stationId}.js has no why line`);
  const whole = JSON.parse(`"${m[1]}"`);
  const first = whole.split(/(?<=\.)\s/)[0];
  if (!src.includes(first)) throw new Error(`gen_dive_quests: lesson for ${stationId}/${stepId} is not a verbatim substring`);
  return first;
}

function lanternEgg(id, landmarkId, method, stationId, stepId, commsPrompt = null) {
  const landmark = landmarkNamed(landmarkId);
  const lesson = stepWhyFirstSentence(stationId, stepId);
  const base = {
    id: `dv-egg-${id}`, title: `Lantern — ${landmark}`, giver: "found, not given", site: landmark, kind: "egg", tier: 0, requires: null,
    landmark, method, cites: { app: "smartcity", stationId, stepId }, lesson,
    reward: { xp: 25, badge: "Lantern" },
  };
  base.steps = method === "comms"
    ? [
        { type: "talk", target: "supervisor-comms", text: commsPrompt },
        { type: "find", target: base.id, text: `The comms clear and the note follows: "${lesson}"` },
      ]
    : [
        { type: "goto", target: landmark, text: `Swim to ${landmark} and look for the lantern.` },
        { type: "find", target: base.id, text: `Clipped beside the lantern at ${landmark}, a field note reads: "${lesson}"` },
      ];
  return base;
}

const EGG_DIVES = [
  lanternEgg("ladder-lead", "pier-ladder", "lantern", "br-dive-tender-and-umbilical-management", "lead-umbilical"),
  lanternEgg("pile-zones", "piling-forest", "lantern", "mw-pier-pile-inspection-dive", "pile-one"),
  lanternEgg("gauge-riddle", "tide-gauge-post", "comms", "tide-gate", "flood-early",
    "The supervisor's voice over the comms: \"The table said one time and the water says another — which one do you believe, and why?\""),
  lanternEgg("quadrat-stake", "shelf-boulder-garden", "lantern", "oyster-reef-monitoring", "quadrat-locate"),
  lanternEgg("slack-water", "eelgrass-edge", "comms", "eelgrass-transplant", "tide-window",
    "The comms crackle: \"You're drifting off the grid on every breath — what did the plan say about the tide, and why?\""),
  lanternEgg("hull-overhead", "eelgrass-nursery-plots", "lantern", "eelgrass-transplant", "vessel-incursion"),
  lanternEgg("upcurrent-anchor", "marsh-mouth-bar", "lantern", "br-turbidity-curtain-deployment", "lower-anchor"),
  lanternEgg("turbidity-proof", "sonde-mooring", "comms", "br-water-quality-sonde-calibration-and-deploy", "turbidity-check",
    "The supervisor asks over the comms: \"The sonde's calibrated — so what else has to happen before the dredge is stopped on its word?\""),
  lanternEgg("bank-buddy", "outfall-diffuser", "lantern", "stormwater-outfall", "buddy-steps-away"),
  lanternEgg("slow-baseline", "kelp-cathedral", "lantern", "br-underwater-debris-survey-and-mapping", "swim-baseline"),
  lanternEgg("holdfast-upcurrent", "holdfast-ledge", "lantern", "br-derelict-gear-recovery-dive", "hold-upcurrent"),
  lanternEgg("follow-line", "marsh-drift-line", "comms", "mw-diver-emergency-and-recovery", "follow-umbilical",
    "The comms break in: \"Visibility's gone and your buddy's somewhere ahead — what's the one certain path to him?\""),
  lanternEgg("straight-core", "reef-ball-rows", "lantern", "br-underwater-sediment-core-sampling", "push-core"),
  lanternEgg("cap-first", "settlement-tile-rack", "comms", "br-underwater-sediment-core-sampling", "cap-core",
    "The sampling lead over the comms: \"Core's in. Which cap goes on first, and what happens if you get it backwards?\""),
  lanternEgg("screw-locked", "channel-marker-chain", "lantern", "mw-dive-supervisor-and-dive-plan", "lockout-and-flag"),
  lanternEgg("steady-pace", "approach-buoy-chain", "lantern", "uw-pipeline-crossing-inspection-dive", "swim-crossing"),
  lanternEgg("ground-first", "wreck-bow", "comms", "mw-underwater-welding-and-cutting", "ground-and-switch",
    "The comms: \"Before anyone calls 'make it hot' — what goes on first, and where?\""),
  lanternEgg("pin-then-wire", "wreck-stern", "lantern", "uw-lift-bag-rigging-and-object-recovery", "rig-bridle"),
  lanternEgg("bight", "mud-plain-mooring", "lantern", "mooring-line", "hand-in-the-bight"),
  lanternEgg("chamber-plan", "trench-lip", "comms", "br-hyperbaric-chamber-standby", "standby-brief",
    "The supervisor over the comms: \"There's a chamber on the deck above you. Is it an afterthought, or part of something?\""),
  lanternEgg("benchmark", "seamount-pinnacle", "lantern", "uw-bridge-pier-scour-survey", "find-benchmark"),
  lanternEgg("pfd-gasp", "old-anchor", "lantern", "br-cold-water-immersion-and-mob-recovery", "pfd-on"),
  lanternEgg("prove-zero", "outfall-pipe-run", "comms", "uw-intake-screen-cleaning-with-lockout", "verify-zero-energy",
    "The supervisor over the comms: \"The breaker's open and the lock is on. So is the intake locked out yet — how do you know?\""),
  lanternEgg("plan-is-the-dive", "trench-floor-cairn", "lantern", "mw-dive-supervisor-and-dive-plan", "dive-plan"),
];

// ========================================================= ACTIVITIES
// Four scored activities, run by WebXR/underwater/js/activities.js: none is
// violence or gambling; every score is a time, a count or a fraction held.
const ACTIVITIES = [
  {
    id: "dv-activity-kelp-transect", title: "Kelp Transect Time Trial", kind: "time-trial", line: "kelp-transect",
    site: siteNamed("kelp-transect-start"),
    description: "Swim the kelp transect checkpoint to checkpoint against the clock, level and steady so the fins never lift the silt.",
    scoring: { time: true, checkpoints: 5 },
  },
  {
    id: "dv-activity-wreck-photo", title: "Wreck Photo Survey", kind: "photo", landmark: landmarkNamed("wreck-bow"),
    site: siteNamed("wreck-photo-survey"),
    description: "A non-competitive photo survey: frame the hull from every marked viewpoint around the bow.",
    scoring: { competitive: false, viewpointsToFrame: 6 },
  },
  {
    id: "dv-activity-debris-sweep", title: "Debris Sweep", kind: "sweep", site: siteNamed("shelf-debris-sweep"),
    description: "Collect the marked debris across the shelf before the timer runs out — and flag, never lift, the items marked hazardous, which wait for the work plan.",
    scoring: { time: true, seconds: 180, items: 8, hazardousItems: 2, collectedPoints: 1, flaggedPoints: 2 },
  },
  {
    id: "dv-activity-marsh-drift", title: "Marsh-Mouth Drift", kind: "drift", line: "marsh-drift-transect",
    site: siteNamed("marsh-mouth-culvert"),
    description: "Ride the ebb out of the marsh channel and hold the corridor between the stakes for the whole run.",
    scoring: { seconds: 90, corridorHalfWidth: 8, heldFraction: true },
  },
];

// =================================================================== I/O

const header = `/**
 * GENERATED FILE — do not hand-edit. Run \`node tools/gen_dive_quests.mjs\`
 * after changing anything in that script, after a programme in
 * WebXR/smartcity/js/curricula.js changes, or after the seabed's sites or
 * landmarks change, to regenerate this file.
 *
 * The Deep's dive quest layer: a six-dive main arc (a survey career from the
 * pier pilings to the seamount), one opener and one capstone side dive per
 * programme the seabed's sites anchor, the lantern eggs at the seabed's
 * landmarks, and four scored activities.
 *
 * Dive shape (WebXR/underwater/js/dive-engine.js):
 *   { id, title, giver, site, kind: "main"|"side"|"egg",
 *     steps: [{ type: "goto"|"station"|"find"|"rov"|"talk", target, text }],
 *     reward }
 * plus \`tier\` and \`requires\` for the dive graph and its monotone reward
 * curve (dives.js's dvRewardForTier()). Egg dives carry \`landmark\`,
 * \`method\` ("lantern" or "comms"), \`cites\` and \`lesson\` (a verbatim
 * first sentence of the cited step's own why line).
 */
`;

const body = [
  `export const DV_MAIN_DIVES = ${JSON.stringify(MAIN_DIVES, null, 2)};`,
  `export const DV_SIDE_DIVES = ${JSON.stringify(SIDE_DIVES, null, 2)};`,
  `export const DV_EGG_DIVES = ${JSON.stringify(EGG_DIVES, null, 2)};`,
  `export const DV_ACTIVITIES = ${JSON.stringify(ACTIVITIES, null, 2)};`,
  `export const DV_LANDMARK_NOTES = ${JSON.stringify(LANDMARK_NOTES, null, 2)};`,
].join("\n\n");

writeFileSync(OUT_FILE, header + "\n" + body + "\n");
console.log(`wrote ${OUT_FILE}`);
console.log(`  main dives:  ${MAIN_DIVES.length}`);
console.log(`  side dives:  ${SIDE_DIVES.length} (${SIDE_PROGRAMME_IDS.length} programmes × 2)`);
console.log(`  lantern eggs: ${EGG_DIVES.length}`);
console.log(`  activities:  ${ACTIVITIES.length}`);
