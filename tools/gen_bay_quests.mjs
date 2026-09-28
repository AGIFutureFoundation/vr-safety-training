/**
 * Generates WebXR/bayworld/js/quests-data.js — the quest layer for Bay
 * World, the Oakland/East Bay open-world game two sibling teams are
 * building (BAY1: WebXR/shared/bayworld-data.js; BAY2: WebXR/bayworld/).
 *
 *     node tools/gen_bay_quests.mjs
 *
 * What is generated versus authored here:
 *
 *  - The **side quests** (one per programme in WebXR/smartcity/js/curricula.js
 *    other than the Job Readiness Edition, an opener plus a capstone) are
 *    built programmatically from CURRICULA below, so a station added,
 *    renamed or reordered in a programme is picked up the next time this
 *    runs — the whole point of generating rather than hand-writing them.
 *  - The **main story arc** (Job Readiness Edition), the **easter-egg
 *    tasks** and the **side activities** are authored as plain data in this
 *    file, but every line of dialogue that names a station's own reasoning
 *    pulls that station's `why` text live from CURRICULA rather than being
 *    retyped — so if a station's why-line changes, regenerating this file
 *    picks up the change, and if a station id is ever removed or renamed
 *    this script throws instead of silently shipping a stale quest.
 *
 * Neither this script nor its output imports WebXR/shared/bayworld-data.js:
 * BAY1's file may not exist yet in a given worktree. Quests reference sites
 * and landmarks by plain name strings, which tools/check_bay_quests.mjs
 * cross-checks against bayworld-data.js only when that file is present.
 *
 * Reward tiers: every main or side quest carries a `tier` (a positive
 * integer) and `reward.xp = rewardForTier(tier)`, the same monotone formula
 * WebXR/bayworld/js/quests.js exports, so reward never decreases as a
 * player advances a chain (`requires`). Eggs and side activities are
 * collectibles, not chain progress, and carry a flat reward instead.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const OUT_FILE = join(WEBXR, "bayworld", "js", "quests-data.js");

const { CURRICULA } = await import(pathToFileURL(join(WEBXR, "smartcity", "js", "curricula.js")));

function programme(id) {
  const p = CURRICULA.find((c) => c.id === id);
  if (!p) throw new Error(`gen_bay_quests: no programme "${id}" in curricula.js`);
  return p;
}

function whyLookup(prog) {
  const map = new Map();
  for (const s of prog.stations) map.set(s.id, s.why);
  return map;
}

function why(prog, whyMap, stationId) {
  if (!whyMap.has(stationId)) {
    throw new Error(`gen_bay_quests: station "${stationId}" is not in programme "${prog.id}" any more — update the quest chain in this script`);
  }
  return whyMap.get(stationId);
}

// --------------------------------------------------------------- rewards

/** Canonical, monotone reward curve. Exported again from quests.js so the
 *  app and the checker both compute it the same way instead of each
 *  guessing at a table. */
const XP_BASE = 100;
const XP_STEP = 150;
export function rewardForTier(tier) {
  if (!Number.isInteger(tier) || tier < 1) throw new Error(`rewardForTier: tier must be a positive integer, got ${tier}`);
  return XP_BASE + (tier - 1) * XP_STEP;
}
function tierReward(tier, badge) {
  return { xp: rewardForTier(tier), badge };
}

// ============================================================= MAIN ARC
// The Job Readiness Edition's main story: a new arrival walks the wojrc.org
// pathway end to end. Every station step's text is that station's own why
// line from curricula.js, quoted live (see why() above) — this file adds
// no facts about the sponsoring organisation beyond what curricula.js
// already carries, and states nothing about the sponsor of this edition
// beyond what tools/briefs/wojrc-brief.md sources. Every quest giver is a
// job title only, never a person's name.
const JR = programme("job-readiness-edition");
const jrWhy = whyLookup(JR);
const jw = (id) => why(JR, jrWhy, id);

const MAIN_QUESTS = [
  {
    id: "bw-main-00-heritage",
    title: "Where the Trades Began",
    giver: "the hall's history keeper",
    site: "Trades Heritage Walk",
    kind: "main",
    tier: 1,
    requires: null,
    steps: [
      { type: "goto", target: "Trades Heritage Walk", text: "A quiet corner of the hall, photographs on the wall, a doorway to the floor beyond it." },
      { type: "talk", target: "trades-heritage-keeper", text: "\"Before any of it — the forklift, the rig, the ledger — there's this. People built something enormous with their hands, and the trade you're about to learn is part of that same line.\"" },
      { type: "station", target: "trades-lineage-briefing", text: jw("trades-lineage-briefing") },
      { type: "talk", target: "trades-heritage-keeper", text: "\"There's an article listed as further reading in the briefing, if you want the fuller story — we're not going to retell it here, only point you to it. Ready for the floor?\"" },
    ],
    reward: tierReward(1, "Heritage Walk"),
  },
  {
    id: "bw-main-01-warehouse",
    title: "First Day on the Floor",
    giver: "the warehouse floor supervisor",
    site: "Bay Intermodal Warehouse",
    kind: "main",
    tier: 2,
    requires: "bw-main-00-heritage",
    steps: [
      { type: "goto", target: "Bay Intermodal Warehouse", text: "The supervisor waves you over from the dock door, clipboard already out." },
      { type: "talk", target: "warehouse-floor-supervisor", text: "\"Everybody starts at the same place: the truck and the jack. Slow is fine today. Sloppy isn't.\"" },
      { type: "station", target: "forklift-dock", text: jw("forklift-dock") },
      { type: "station", target: "tdl-pallet-jack-and-racking", text: jw("tdl-pallet-jack-and-racking") },
      { type: "station", target: "tdl-pick-pack-and-scan", text: jw("tdl-pick-pack-and-scan") },
      { type: "station", target: "tdl-trailer-loading-and-dock-plate", text: jw("tdl-trailer-loading-and-dock-plate") },
      { type: "station", target: "tdl-hazmat-labeling-and-segregation", text: jw("tdl-hazmat-labeling-and-segregation") },
      { type: "station", target: "tdl-lifting-and-ergonomics", text: jw("tdl-lifting-and-ergonomics") },
      { type: "talk", target: "warehouse-floor-supervisor", text: "\"That's the floor. Every one of those checks is one less trip to redo a load — good first day.\"" },
    ],
    reward: tierReward(2, "Warehouse Floor"),
  },
  {
    id: "bw-main-02-yard",
    title: "Yard Qualified",
    giver: "the yard trainer",
    site: "Class A Training Yard",
    kind: "main",
    tier: 3,
    requires: "bw-main-01-warehouse",
    steps: [
      { type: "goto", target: "Class A Training Yard", text: "A day cab and a pup trailer sit parked under the yard lights, the trainer already walking the tires." },
      { type: "talk", target: "yard-trainer", text: "\"Before you drive a foot, you're going to know this rig cold — every light, every gauge, every strap.\"" },
      { type: "station", target: "tdl-pretrip-inspection", text: jw("tdl-pretrip-inspection") },
      { type: "station", target: "tdl-air-brake-test", text: jw("tdl-air-brake-test") },
      { type: "station", target: "tdl-coupling-and-uncoupling", text: jw("tdl-coupling-and-uncoupling") },
      { type: "station", target: "tdl-backing-and-docking", text: jw("tdl-backing-and-docking") },
      { type: "station", target: "tdl-cargo-securement-and-hours", text: jw("tdl-cargo-securement-and-hours") },
      { type: "talk", target: "yard-trainer", text: "\"You know the rig now. Tomorrow you drive it.\"" },
    ],
    reward: tierReward(3, "Yard Qualified"),
  },
  {
    id: "bw-main-03-road",
    title: "On the Road",
    giver: "the driving instructor",
    site: "Class A Training Yard",
    kind: "main",
    tier: 4,
    requires: "bw-main-02-yard",
    steps: [
      { type: "goto", target: "Class A Training Yard", text: "The instructor takes the jump seat this time. \"Yard's behind you. Let's go find some road.\"" },
      { type: "station", target: "drive-city-route-and-turns", text: jw("drive-city-route-and-turns") },
      { type: "station", target: "drive-freeway-merge-and-following-distance", text: jw("drive-freeway-merge-and-following-distance") },
      { type: "station", target: "drive-mountain-grade-and-engine-brake", text: jw("drive-mountain-grade-and-engine-brake") },
      { type: "station", target: "drive-night-fog-and-rail-crossing", text: jw("drive-night-fog-and-rail-crossing") },
      { type: "station", target: "drive-backing-serpentine-and-alley-dock", text: jw("drive-backing-serpentine-and-alley-dock") },
      { type: "station", target: "drive-light-vehicle-fleet-and-forklift-course", text: jw("drive-light-vehicle-fleet-and-forklift-course") },
      { type: "talk", target: "driving-instructor", text: "\"That's every check-ride the terminal runs before it hands over keys. You drove all of them clean.\"" },
    ],
    reward: tierReward(4, "On the Road"),
  },
  {
    id: "bw-main-04-apprenticeship",
    title: "Sign the Book",
    giver: "the apprenticeship coordinator",
    site: "Apprenticeship Hall",
    kind: "main",
    tier: 5,
    requires: "bw-main-03-road",
    steps: [
      { type: "goto", target: "Apprenticeship Hall", text: "A noticeboard, a sign-in sheet and a coordinator who has clearly done this orientation before." },
      { type: "talk", target: "apprenticeship-coordinator", text: "\"A registered apprenticeship is a ladder with rules. Learn the rules first, and the rest of it stops being a mystery.\"" },
      { type: "station", target: "apprenticeship-standards-reading", text: jw("apprenticeship-standards-reading") },
      { type: "station", target: "apprenticeship-application-and-test", text: jw("apprenticeship-application-and-test") },
      { type: "station", target: "jobsite-orientation-and-osha-10", text: jw("jobsite-orientation-and-osha-10") },
      { type: "station", target: "union-hall-and-dispatch", text: jw("union-hall-and-dispatch") },
      { type: "station", target: "first-period-evaluation", text: jw("first-period-evaluation") },
      { type: "talk", target: "apprenticeship-coordinator", text: "\"First period, signed off. That's a real rung, not a participation trophy.\"" },
    ],
    reward: tierReward(5, "Sign the Book"),
  },
  {
    id: "bw-main-05-financial",
    title: "Balance the Books",
    giver: "the financial coach",
    site: "Financial Coaching Center",
    kind: "main",
    tier: 6,
    requires: "bw-main-04-apprenticeship",
    steps: [
      { type: "goto", target: "Financial Coaching Center", text: "A small office, a folder already labelled with your name, a coach who starts with the paperwork, not a lecture." },
      { type: "talk", target: "financial-coach", text: "\"A trade pays the bills. Whether it builds something is a different skill, and that's what we're here for.\"" },
      { type: "station", target: "credit-report-reading", text: jw("credit-report-reading") },
      { type: "station", target: "debt-reduction-plan", text: jw("debt-reduction-plan") },
      { type: "station", target: "pay-stub-and-withholding", text: jw("pay-stub-and-withholding") },
      { type: "station", target: "budget-with-irregular-income", text: jw("budget-with-irregular-income") },
      { type: "station", target: "emergency-savings-and-predatory-lending", text: jw("emergency-savings-and-predatory-lending") },
      { type: "talk", target: "financial-coach", text: "\"Same time next month. Bring the statements, not just the worry.\"" },
    ],
    reward: tierReward(6, "Balance the Books"),
  },
  {
    id: "bw-main-06-wellness",
    title: "Ask for the Door",
    giver: "the wellness guide",
    site: "Wellness Resource Center",
    kind: "main",
    tier: 7,
    requires: "bw-main-05-financial",
    steps: [
      { type: "goto", target: "Wellness Resource Center", text: "A comfortable room, no clipboard in sight, a guide who asks how the week actually went before anything else." },
      { type: "talk", target: "wellness-guide", text: "\"Everything else in this programme assumes you're still standing. This is the part that's actually about that.\"" },
      { type: "station", target: "wellness-shift-work-sleep-and-stress", text: jw("wellness-shift-work-sleep-and-stress") },
      { type: "station", target: "wellness-peer-support-conversation", text: jw("wellness-peer-support-conversation") },
      { type: "station", target: "wellness-substance-use-and-the-job", text: jw("wellness-substance-use-and-the-job") },
      { type: "station", target: "wellness-asking-for-help-and-resources", text: jw("wellness-asking-for-help-and-resources") },
      { type: "talk", target: "wellness-guide", text: "\"You've walked the whole pathway now — the floor, the rig, the hall, the ledger, and this room. Come back to any of them whenever you need to.\"" },
    ],
    reward: tierReward(7, "Ask for the Door"),
  },
];

// ============================================================ SIDE QUESTS
// One opener and one capstone per programme other than the Job Readiness
// Edition, generated from CURRICULA so a station added, dropped or
// reordered in a programme is picked up the next time this script runs.
const OPENER_STATION_COUNT = 3;
const CAPSTONE_STATION_COUNT = 3;

function buildSideQuestsForProgramme(prog) {
  const whyMap = whyLookup(prog);
  const stations = prog.stations;
  const openerStations = stations.slice(0, OPENER_STATION_COUNT);
  const capstoneStations = stations.slice(-CAPSTONE_STATION_COUNT);
  const site = prog.name; // stand-in anchor until BAY1 assigns a real BAY_SITES entry

  const openerId = `bw-side-${prog.id}-opener`;
  const capstoneId = `bw-side-${prog.id}-capstone`;

  const opener = {
    id: openerId,
    title: `${prog.name} — First Shift`,
    giver: "the programme's training lead",
    site,
    kind: "side",
    tier: 1,
    requires: null,
    programmeId: prog.id,
    role: "opener",
    steps: [
      { type: "goto", target: site, text: `The training lead meets you at ${site} and points you to the first bench.` },
      ...openerStations.map((s) => ({ type: "station", target: s.id, text: why(prog, whyMap, s.id) })),
      { type: "talk", target: "training-lead", text: `"${prog.summary}"` },
    ],
    reward: tierReward(1, `${prog.name} — Opener`),
  };

  const capstone = {
    id: capstoneId,
    title: `${prog.name} — Capstone`,
    giver: "the programme's certifying evaluator",
    site,
    kind: "side",
    tier: 2,
    requires: openerId,
    programmeId: prog.id,
    role: "capstone",
    steps: [
      { type: "goto", target: site, text: `The certifying evaluator is waiting at the last bench, sign-off sheet in hand.` },
      ...capstoneStations.map((s) => ({ type: "station", target: s.id, text: why(prog, whyMap, s.id) })),
      { type: "talk", target: "certifying-evaluator", text: `"Certified under: ${prog.certification}"` },
    ],
    reward: tierReward(2, `${prog.name} — Capstone`),
  };

  return [opener, capstone];
}

const SIDE_PROGRAMMES = CURRICULA.filter((p) => p.id !== "job-readiness-edition");
const SIDE_QUESTS = SIDE_PROGRAMMES.flatMap(buildSideQuestsForProgramme);

// The Teamwork pair: one opener and one capstone that cross two programmes —
// the basketball teamwork stations and the emotional-intelligence-at-work
// stations — at the college's gym. Marked `track: "teamwork"` so the
// per-programme coverage check counts them apart from the generated pairs.
function buildTeamworkPair() {
  const bb = CURRICULA.find((p) => p.id === "basketball-fundamentals");
  const ei = CURRICULA.find((p) => p.id === "civic-leadership-and-ei");
  if (!bb || !ei) throw new Error("teamwork quests need basketball-fundamentals and civic-leadership-and-ei");
  const bbWhy = whyLookup(bb), eiWhy = whyLookup(ei);
  const site = "Fruitvale Community College";
  const opener = {
    id: "bw-side-teamwork-opener",
    title: "Teamwork — Talk Before You Move",
    giver: "the college's team captain",
    site,
    kind: "side",
    tier: 1,
    requires: null,
    track: "teamwork",
    role: "opener",
    steps: [
      { type: "goto", target: site, text: "The captain meets you on the college gym floor, a ball under one arm, and says the first drill has no shooting in it at all." },
      ...["bb-pick-and-roll-communication", "bb-help-defense-rotations", "bb-transition-spacing-and-roles"].map((id) => ({ type: "station", target: id, text: why(bb, bbWhy, id) })),
      { type: "talk", target: "team-captain", text: "\"Every one of those was about a word said early. That is the whole of teamwork, most days.\"" },
    ],
    reward: tierReward(1, "Teamwork — Opener"),
  };
  const capstone = {
    id: "bw-side-teamwork-capstone",
    title: "Teamwork — Steady the Crew",
    giver: "the college's workforce instructor",
    site,
    kind: "side",
    tier: 2,
    requires: opener.id,
    track: "teamwork",
    role: "capstone",
    steps: [
      { type: "goto", target: site, text: "Across the quad from the gym, the workforce instructor has a crew scenario waiting: the same habits, off the court and on the job." },
      { type: "station", target: "bb-timeout-huddle-and-adjustment", text: why(bb, bbWhy, "bb-timeout-huddle-and-adjustment") },
      ...["ei-conflict-on-the-crew", "ei-giving-and-taking-feedback", "ei-leading-under-pressure"].map((id) => ({ type: "station", target: id, text: why(ei, eiWhy, id) })),
      { type: "talk", target: "workforce-instructor", text: "\"One fact, one change, one encouragement. It works in a huddle and it works beside a trench.\"" },
    ],
    reward: tierReward(2, "Teamwork — Capstone"),
  };
  return [opener, capstone];
}
SIDE_QUESTS.push(...buildTeamworkPair());

// ================================================================= EGGS
// Twenty-four easter-egg tasks, each hidden at a real, generic Bay Area
// public landmark and each teaching one true safety or trade habit quoted
// verbatim from a real station's own step text (never from curricula.js's
// programme-level why line — that is the side quests' job). Every landmark
// note below is the landmark's public name plus one generic descriptive
// sentence: no date, height, count or founding fact is stated about the
// landmark itself. Lessons are quoted exactly as tools/check_bay_quests.mjs
// verifies against the cited station's own source file.
const LANDMARK_NOTES = {
  "Lake Merritt": "A tidal lake that rings the heart of the city.",
  "Lakeside Park": "A park along the lake's northern shore.",
  "Snow Park": "A small park where the lake meets the downtown streets.",
  "Jack London Square": "A waterfront square of shops and piers by the estuary.",
  "Union Point Park": "A park where a creek meets the tidal estuary.",
  "Estuary Park": "A small waterfront green space on the estuary channel.",
  "Middle Harbor Shoreline Park": "A shoreline park on reclaimed port land.",
  "Port of Oakland": "The working seaport along the estuary.",
  "Brooklyn Basin": "A waterfront neighborhood along the estuary channel.",
  "Fruitvale Village": "A plaza around a transit station.",
  "San Antonio Park": "A neighborhood park in the flatlands.",
  "Mosswood Park": "A green square near a freeway interchange.",
  "MacArthur BART Station": "A transit interchange serving the surrounding neighborhoods.",
  "Coliseum Station": "A transit station near the bay shoreline.",
  "Alameda Point": "A former base site at the tip of the island's shoreline.",
  "Alameda Marina": "A small-craft marina on the estuary side of the island.",
  "Emeryville Marina": "A small-craft marina on the bay shoreline.",
  "Estuary Marina": "A small-craft marina with floating docks along the estuary.",
  "Berkeley Marina": "A marina along the bay shoreline to the north.",
  "Berkeley Pier": "A long fishing pier reaching out over the bay.",
  "Redwood Regional Park": "A regional park of forested hillside trails.",
  "Joaquin Miller Park": "A hillside park of wooded trails above the flatlands.",
  "Dimond Canyon Park": "A wooded canyon park along a creek.",
  "Skyline Lookout": "A hillside lookout point along the ridge road.",
  "Bay Trail — Oakland Segment": "A shoreline path along the bay's edge.",
};

function eggFromStep(id, landmark, method, app, stationId, stepId, lesson, radioPrompt) {
  const base = {
    id: `bw-egg-${id}`,
    title: `Field Note — ${landmark}`,
    giver: "found, not given",
    site: landmark,
    kind: "egg",
    tier: 0,
    requires: null,
    landmark,
    method,
    cites: { app, stationId, stepId },
    lesson,
    reward: { xp: 25, badge: "Field Note" },
  };
  base.steps = method === "radio"
    ? [
        { type: "talk", target: "maintenance-radio", text: radioPrompt },
        { type: "find", target: base.id, text: `The radio crackles once more and gives up the note: "${lesson}"` },
      ]
    : [
        { type: "goto", target: landmark, text: `Walk to ${landmark} and look for the marker.` },
        { type: "find", target: base.id, text: `Tucked near the sign at ${landmark}, a field note reads: "${lesson}"` },
      ];
  return base;
}

const EGG_QUESTS = [
  eggFromStep("pretrip-report", "Port of Oakland", "goto", "smartcity", "tdl-pretrip-inspection", "last-dvir",
    "Under 49 CFR 396 the last driver's report is the first thing a driver reads, because it says what somebody else found wrong with this truck."),
  eggFromStep("airbrake-chock", "Middle Harbor Shoreline Park", "radio", "smartcity", "tdl-air-brake-test", "chock",
    "The chock is what lets the brakes be released safely, and it goes in before any valve is touched.",
    "A yard voice comes over the channel: \"Before you crack a single valve on that trailer — what goes under the wheel first, and why?\""),
  eggFromStep("hazmat-bung", "Brooklyn Basin", "goto", "smartcity", "tdl-hazmat-labeling-and-segregation", "bung",
    "A drum that is closed hand-tight at the filler loosens with vibration and temperature, and a corrosive that weeps from a bung on a moving trailer eats through pallets, straps and the next package."),
  eggFromStep("cargo-winch", "Union Point Park", "radio", "smartcity", "tdl-cargo-securement-and-hours", "winch",
    "A strap does its job only when it is tight enough that the crate cannot move under it, and the winch is how that tension is set and held.",
    "Dispatch breaks in: \"Load's chocked, straps are on — so why isn't it secured yet?\""),
  eggFromStep("forklift-belt", "Jack London Square", "goto", "smartcity", "forklift-dock", "belt",
    "In a tip-over the overhead guard protects a belted operator. An unbelted one jumps, and the guard lands on them — the single biggest killer of forklift operators."),
  eggFromStep("grade-snub", "Skyline Lookout", "goto", "smartcity", "drive-mountain-grade-and-engine-brake", "drm-snub",
    "The state CDL handbook's snub braking is firm, short applications: once the rig reaches its safe speed, brake hard enough to feel a definite slowdown until it is about five mph below that speed, then release and let it build again."),
  eggFromStep("orientation-tieoff", "Fruitvale Village", "radio", "smartcity", "jobsite-orientation-and-osha-10", "tie-off",
    "Fall protection from six feet up, under 29 CFR 1926.501, means being tied off before you are exposed, not after you reach the work.",
    "A site radio crackles: \"You're at the top of the ladder with the deck right there — when does the lanyard actually clip on?\""),
  eggFromStep("hall-signbook", "MacArthur BART Station", "goto", "smartcity", "union-hall-and-dispatch", "sign-books",
    "Referral from the hall generally works from the order people signed in and the rules the local posts, and your own signature on the book is what puts you on it."),
  eggFromStep("credit-freereports", "San Antonio Park", "goto", "smartcity", "credit-report-reading", "request-reports",
    "Under the Fair Credit Reporting Act, as the CFPB states it, you are entitled to free reports from each of the nationwide credit reporting companies, and AnnualCreditReport.com is the one site set up for it."),
  eggFromStep("debt-sortbyrate", "Mosswood Park", "radio", "smartcity", "debt-reduction-plan", "sort-by-rate",
    "Paying extra on the highest-rate debt first while keeping every minimum current is the order that costs the least interest, which is why the plan sorts by APR rather than by balance or by whichever creditor calls most.",
    "A calm voice on the coaching line asks: \"Three cards, three rates — which one gets the extra dollar this month?\""),
  eggFromStep("sleep-naptimer", "Lakeside Park", "goto", "smartcity", "wellness-shift-work-sleep-and-stress", "nap-timer",
    "A twenty-minute nap before a night shift clears a measurable amount of the sleepiness without going deep enough to leave you groggy on waking; a ninety-minute one runs into deep sleep and you wake worse than you lay down, which is the sleep inertia that makes people swear naps do not work."),
  eggFromStep("substance-staywith", "Snow Park", "goto", "smartcity", "wellness-substance-use-and-the-job", "stay-with-him",
    "The minutes between the call and the supervisor's arrival are when a crew-mate walks — to the dock, to the lot, to his car — and every one of those is worse than the meeting he is avoiding."),
  eggFromStep("decon-berm", "Estuary Park", "radio", "smartcity", "decon-line", "berm",
    "Runoff from a decon line is not water with a little product in it; it is the product, carried in water, headed for whatever the drain connects to.",
    "A hazmat channel crackles: \"Before the first litre of wash water goes down — what's supposed to be over that storm drain?\""),
  eggFromStep("stormwater-ice", "Alameda Point", "goto", "smartcity", "stormwater-outfall", "ice",
    "Four degrees Celsius is written into the method itself, not a suggestion for the ride back."),
  eggFromStep("dredge-curtain", "Alameda Marina", "goto", "smartcity", "dredge-barge", "curtain-deploy",
    "The curtain is what keeps the plume the bucket raises inside a boundary the permit actually drew, rather than free to drift with the tide across the whole reach."),
  eggFromStep("oyster-quadrat", "Berkeley Marina", "radio", "smartcity", "oyster-reef-monitoring", "quadrat-count",
    "The count is only valid for the footprint the frame actually covers, and a frame that lifts or shifts mid-tally either double-counts a shell at the edge or misses one — holding it flat and steady for the full count is what makes this quarter's density number mean the same thing as last quarter's, taken the same way over the same square metre.",
    "A field radio check-in asks: \"Frame's down on the tag — what happens to the count if it shifts before you finish the tally?\""),
  eggFromStep("tidegate-float", "Berkeley Pier", "goto", "smartcity", "tide-gate", "hang-new-gate",
    "A self-regulating tide gate opens on the outgoing flow and swings shut against the incoming tide on its own float, with no operator — which means it only works at all if it is hung square on the flange it was designed for."),
  eggFromStep("mooring-eye", "Emeryville Marina", "goto", "smartcity", "mooring-line", "eye",
    "The eye goes over the post from the outside, so your hands are never between the rope and the steel."),
  eggFromStep("dockcrane-wind", "Bay Trail — Oakland Segment", "radio", "smartcity", "dock-crane", "wind-check",
    "A container is a sail the moment it clears the stack — forty feet of flat steel with nothing to break the wind's grip on it.",
    "The crane channel breaks in: \"Box is off the chassis and swinging — what should have been read before it ever left the stack?\""),
  eggFromStep("craneyard-level", "Coliseum Station", "goto", "smartcity", "crane-yard", "level-check",
    "A crane that is off level derates in the direction of the lean without saying so."),
  eggFromStep("scaffold-tie", "Redwood Regional Park", "goto", "smartcity", "scaffold-erection", "tie",
    "The tie is what makes this a structure fastened to the building instead of a free-standing tower carrying its own wind load — NIOSH fatality investigations into scaffold collapses keep finding the same missing element, a tie pattern that was never installed or was installed after the fact."),
  eggFromStep("rescue-refuse", "Joaquin Miller Park", "radio", "smartcity", "confined-rescue", "refuse",
    "More than half of confined-space fatalities are the would-be rescuers, per OSHA's own accident data behind 29 CFR 1910.146(k), and the instinct to go straight in after a downed coworker is exactly what produces that number.",
    "An emergency channel breaks squelch: \"Your partner just went down in the hole — what's the very first thing you do, and what do you not do?\""),
  eggFromStep("boiler-lockall", "Dimond Canyon Park", "goto", "smartcity", "boiler-room", "lock-all",
    "OSHA's control-of-hazardous-energy rule at 29 CFR 1910.147 is built on one idea: the only person who can restore an isolation is the person who locked it."),
  eggFromStep("hood-pathclear", "Lake Merritt", "goto", "smartcity", "hood-suppression", "path-clear",
    "A pull station three seconds away by sightline and ten seconds away around a stack of totes is a pull station that costs a kitchen the difference between a scorched hood and a working fire — NFPA 96 calls for it visible and reachable for exactly that reason, and reachable is something you confirm standing there, not something you assume from memory."),
  eggFromStep("cleat-hitch", "Estuary Marina", "goto", "smartcity", "yc-line-handling-and-docking-in-crosswind", "stern-hitch",
    "A cleat hitch holds because the load goes round the base of the cleat first and the figure-eights take the strain off the hitch; a line dropped straight into a hitch with no turn under it slips under load or jams so hard it cannot be cast off in a hurry."),
  eggFromStep("tender-light", "Estuary Marina", "radio", "smartcity", "yc-tender-launch-and-guest-transfer", "nav-light-check",
    "A tender running back to the yacht at dusk without a light is invisible to every other vessel in the anchorage and outside the navigation rules that let those vessels avoid her; the light is checked in daylight because a dead lamp is discovered alongside a platform, not in the channel.",
    "The marina's maintenance radio hums: 'Dusk run tonight — tell me what the tender crew check before slipping the painter.'"),
];

// ========================================================== FIELD GUIDE
// Eight wildlife-sighting eggs (docs/consoles/SKY.md, tools/briefs/sky-brief.md):
// `method: "sight"` — found by standing near a shared/wildlife.js group whose
// `userData.wildlife.kind` matches, at the map landmark the group lives by.
// Each note is one generic, informative line about the kind of animal: no
// count, no season, no claim about a real place, no figure of any sort
// (tools/check_sky.mjs holds every line to that). They are kept apart from
// EGG_QUESTS because those quote a station step verbatim and these do not.
const FIELD_GUIDE_NOTES = {
  gulls: "Gulls work the tide line and the wake of anything that stirs the water; the sound of one over a dock usually means the others are close behind.",
  pelicans: "Pelicans fly low in a line with slow, deep wingbeats and fold into a plunge when they spot a fish beneath the surface.",
  shorebirds: "Shorebirds run in short dashes along the wet sand where each wave pulls back, probing for what the water uncovered.",
  seals: "Seals haul out on floats and low rocks to rest and warm up between dives, and slip back in quietly when something comes too close.",
  fish: "A fish school moves as one body, turning and tightening together so that no single fish is easy to single out.",
  ray: "A ray glides just above the bottom on its wing-like fins and settles into the sand when it stops, showing only its eyes and tail.",
  crab: "A kelp crab clings to weed and rock with hooked legs and sidesteps into cover rather than swimming from anything that startles it.",
  gullsPier: "Gulls on a pier rail are watching the anglers, not the water; bait left on the deck goes first, and a hooked bird is a real hazard.",
};

function fieldGuideEgg(id, landmark, wildlife, noteKey) {
  const note = FIELD_GUIDE_NOTES[noteKey ?? wildlife];
  return {
    id: `bw-egg-fg-${id}`,
    title: `Field Guide — ${landmark}`,
    giver: "found, not given",
    site: landmark,
    kind: "egg",
    tier: 0,
    requires: null,
    landmark,
    method: "sight",
    wildlife,
    note,
    steps: [
      { type: "goto", target: landmark, text: `Walk to ${landmark} and watch the water and the shore for a while.` },
      { type: "find", target: `bw-egg-fg-${id}`, text: `A Field Guide page fills in: "${note}"` },
    ],
    reward: { xp: 25, badge: "Field Guide" },
  };
}

const FIELD_GUIDE_EGGS = [
  fieldGuideEgg("gulls-port", "Harbor Gantry Cranes", "gulls"),
  fieldGuideEgg("gulls-pier", "North Pier", "gulls", "gullsPier"),
  fieldGuideEgg("pelicans-channel", "Channel Marker", "pelicans"),
  fieldGuideEgg("shorebirds-beach", "Island Beach Esplanade", "shorebirds"),
  fieldGuideEgg("seals-float", "North Pier", "seals"),
  fieldGuideEgg("fish-school", "Channel Marker", "fish"),
  fieldGuideEgg("ray-channel", "Channel Marker", "ray"),
  fieldGuideEgg("crab-breakwater", "North Pier", "crab"),
];

// ========================================================= SIDE ACTIVITIES
// Scored side activities that are not violence and not gambling. These are
// not quests in BAY2's registerQuests() sense — they carry their own
// scoring shape — so quests.js exposes them separately as SIDE_ACTIVITIES
// for whatever activity engine BAY2 builds.
const SIDE_ACTIVITIES = [
  {
    id: "bw-activity-delivery-run",
    title: "Delivery Run",
    kind: "delivery",
    vehicle: "box truck",
    route: { from: "Bay Intermodal Warehouse", to: "Financial Coaching Center" },
    description: "Drive a box truck between two sites under the same driving checks the platform's Class A driving stations already score.",
    scoring: {
      time: true,
      criteria: [
        "following distance held in the safe band",
        "turn signal used before every lane change and turn",
        "speed held within the posted limit",
        "smooth starts and stops, no harsh braking",
      ],
    },
  },
  {
    id: "bw-activity-lake-loop",
    title: "Lake Merritt Loop Time Trial",
    kind: "time-trial",
    mode: "on foot",
    site: "Lake Merritt",
    description: "A timed lap of the lake on foot, checkpoint to checkpoint.",
    scoring: { time: true, checkpoints: 4 },
  },
  {
    id: "bw-activity-port-spotting",
    title: "Port Yard Spotting",
    kind: "spotting",
    site: "Port of Oakland",
    description: "Spot marked equipment faults and hazard flags placed around the yard before the timer runs out.",
    scoring: { time: true, correctSpotPoints: 10, falseCallPenalty: 5 },
  },
  {
    id: "bw-activity-harbor-cruise",
    title: "Harbor Cruise",
    kind: "cruise",
    vessel: "motor yacht",
    site: "Estuary Marina",
    route: { from: "Estuary Marina", to: "Estuary Marina" },
    description: "Take the charter yacht off her berth, out along the estuary and back to the same berth, scored on the same crew habits the yacht and charter crew stations teach.",
    scoring: {
      time: false,
      criteria: [
        "guest count read back to the captain before a line moves",
        "lines and fenders stowed before leaving the marina",
        "no-wake speed held inside the marina",
        "wake watch kept on the estuary for other vessels and the shoreline",
        "a clean return to the berth: spring first, engines confirmed stopped before the gangway",
      ],
    },
  },
  {
    // Catch-and-release at the north pier (tools/briefs/sky-brief.md). The
    // rules are the habits a pier angler is scored on; the licence is "per
    // the state's rules" and no size, bag or season figure is stated here
    // (tools/check_sky.mjs holds this entry to no digits at all).
    id: "bw-activity-pier-fishing",
    title: "North Pier Catch and Release",
    kind: "fishing",
    site: "North Pier",
    description: "Catch-and-release fishing from the north pier's rail: rig, cast, land and release, scored on the habits that keep the pier safe for the people and the fish.",
    rules: [
      "rig check before the first cast: knots pulled tight, hook point sharp, no frayed line",
      "look and call behind before every cast, and cast only with the deck clear behind you",
      "handle the hook with pliers, never with the line wrapped round a hand",
      "wet hands before touching a fish, keep it over the water and release it quickly",
      "carry the licence the state's rules ask for, and follow those rules for anything kept",
    ],
    scoring: {
      time: false,
      criteria: [
        "rig checked before the first cast",
        "area behind the cast confirmed clear every time",
        "hook handled with pliers",
        "every fish released with wet hands",
      ],
    },
  },
  {
    id: "bw-activity-hills-photo",
    title: "Skyline Lookout Photo Mode",
    kind: "photo",
    site: "Skyline Lookout",
    description: "A non-competitive photo mode: frame a set of marked viewpoints along the ridge.",
    scoring: { competitive: false, viewpointsToFrame: 6 },
  },
];

// =================================================================== I/O

const header = `/**
 * GENERATED FILE — do not hand-edit. Run \`node tools/gen_bay_quests.mjs\`
 * after changing anything in that script, or after a programme in
 * WebXR/smartcity/js/curricula.js changes, to regenerate this file.
 *
 * The Bay World quest layer's data: the Job Readiness Edition's main story
 * arc, one opener and one capstone side quest per every other programme,
 * the easter-egg field notes at generic public landmarks, the Field Guide's
 * wildlife-sighting eggs, and the scored side activities. See
 * docs/bayworld-quests.md.
 *
 * Quest shape (BAY2's WebXR/bayworld/ quest engine):
 *   { id, title, giver, site, kind: "main"|"side"|"egg",
 *     steps: [{ type: "goto"|"station"|"find"|"drive"|"talk", target, text }],
 *     reward }
 * This file adds \`tier\` (a positive integer reward tier) and \`requires\`
 * (the id of the quest that must be completed first, or null) to express
 * the quest graph and its monotone reward curve; see quests.js's
 * rewardForTier(). Egg quests additionally carry \`landmark\`, \`method\`
 * ("goto" or "radio"), \`cites\` (the station step the lesson is quoted
 * from) and \`lesson\`.
 */
`;

const body = [
  `export const MAIN_QUESTS = ${JSON.stringify(MAIN_QUESTS, null, 2)};`,
  `export const SIDE_QUESTS = ${JSON.stringify(SIDE_QUESTS, null, 2)};`,
  `export const EGG_QUESTS = ${JSON.stringify(EGG_QUESTS, null, 2)};`,
  `export const FIELD_GUIDE_EGGS = ${JSON.stringify(FIELD_GUIDE_EGGS, null, 2)};`,
  `export const SIDE_ACTIVITIES = ${JSON.stringify(SIDE_ACTIVITIES, null, 2)};`,
  `export const LANDMARK_NOTES = ${JSON.stringify(LANDMARK_NOTES, null, 2)};`,
].join("\n\n");

writeFileSync(OUT_FILE, header + "\n" + body + "\n");
console.log(`wrote ${OUT_FILE}`);
console.log(`  main quests:   ${MAIN_QUESTS.length}`);
console.log(`  side quests:   ${SIDE_QUESTS.length} (${SIDE_PROGRAMMES.length} programmes × 2, plus the Teamwork pair)`);
console.log(`  egg quests:    ${EGG_QUESTS.length}`);
console.log(`  field guide:   ${FIELD_GUIDE_EGGS.length}`);
console.log(`  side activities: ${SIDE_ACTIVITIES.length}`);
