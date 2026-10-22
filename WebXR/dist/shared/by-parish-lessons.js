// BAYOU — K-12 lessons for New Orleans kids, taught as they play (docs/consoles/BAYOU.md,
// docs/k12.md section 6). One data module that the parishes app, the flows in
// WebXR/flows/by-*.json, the flow agent (by-flow-agent.js) and check_k12 section 9 all read:
//
//   BY_LESSONS       twelve parish lessons: the K-12 station, its programme, the parish site it
//                    is anchored at (np-data-<parish>.js site id), the age band, the flow, the
//                    GRIOT character who guides it, a check question and the two-minute apply step
//   BY_APPLY_GAMES   BAYOU's own two-minute mini-games on the twelve shared mechanics
//                    (side-game-mechanics.js), one per lesson, each using the idea just taught
//   BY_KREWE_KIOSKS  the kiosk ids console KREWE names (`kw-<mini-game>`); a lesson that points at
//                    one runs it when KREWE's registry carries it, else its own fallback game
//   byApplyFor()     the apply step a lesson runs now (kiosk when present, else the fallback)
//   byRecordLesson() / byRecordApply()   the passport records both (one award each, never twice)
//
// Kids rule: one idea per step, the age band's reading ceiling (BY_BAND_CEILING, checked by
// check_k12), no fear framing of storms or floods — readiness, teamwork and who helps. Facts
// rule: a place is named, never described with a figure; no digit in any learner-facing line.
// Every top-level name is prefixed `by`/`BY_` (the bundler shares one scope). No three.js here.

import { lkStationLink } from "./links.js";
import { QM_MECHANICS } from "./side-game-mechanics.js";

export const BY_WORLD = "parishes";
export const BY_PAGE = "parishes.html";
export const BY_APPLY_MINUTES = 2;

/** Flesch–Kincaid ceilings per generic band (a rough yardstick, tools/lib/reading-level.mjs). */
export const BY_BAND_CEILING = { "early primary": 6, "upper primary": 8, "lower secondary": 10, "upper secondary": 11 };

/** The kiosk ids console KREWE names for its parish mini-games (docs/consoles/KREWE.md). */
export const BY_KREWE_KIOSKS = ["kw-sandbag-relay", "kw-pump-startup", "kw-floodgate-closeout", "kw-container-sort", "kw-ferry-lineup"];

// ------------------------------------------------------------------ the apply mini-games

const byGame = (id, parish, site, siteName, title, task, mechanic, idea, summary) => ({
  id: `by-apply-${id}`, world: BY_WORLD, kind: "apply-step", parish, site, siteName, title, task, mechanic,
  minutes: BY_APPLY_MINUTES, idea, summary,
});

export const BY_APPLY_GAMES = [
  byGame("levee-walk", "orleans", "levee-floodwall", "River Levee and Floodwall Crew", "Levee Walk", "levee walk", "survey-transect",
    "A wet spot is flagged and reported, never dug.", "Walk the crest path with the inspector and flag every damp patch, bare strip and burrow on the slope."),
  byGame("pump-order", "orleans", "pumping-station", "Drainage Pumping Station", "Pump Start-Up Order", "pump start-up", "switching-order",
    "Screen clear, level read, pumps started one after another.", "Clear the screen, read the canal and bring the pumps on in order as the model rain comes."),
  byGame("marsh-planting", "st-bernard", "sb-central-wetlands", "Central Wetlands Restoration", "Marsh Planting Rows", "marsh planting", "survey-transect",
    "Plants between the water and the shore slow the waves.", "Plant the young grass in rows along the marsh strip from the crew's mats, then check each row."),
  byGame("river-lookout", "plaquemines", "pq-venice-marina", "Venice Marina at the End of the Road", "River Lookout", "river lookout", "lookout-watch",
    "Read the current before every turn.", "Keep the pilot boat's lookout: call the fast water on the bend, the shallows and the ship coming the other way."),
  byGame("go-bag-check", "st-bernard", "sb-school-campus", "Parish School Campus", "Go-Bag Check", "go-bag check", "inspection-grid",
    "Check the bag against the list, together.", "Check a family go-bag against the plan card with the nurse and mark each item packed or still needed."),
  byGame("pipe-trace", "st-tammany", "st-mandeville-harbour", "Mandeville Lakefront and Harbour", "Lake to Tap Trace", "pipe trace", "line-follow",
    "Water is cleaned and tested before it reaches a tap.", "Trace the water from the lake through each cleaning stage to a model home's tap without skipping a stage."),
  byGame("streetcar-run", "orleans", "streetcar-barn", "Streetcar Barn and Shops", "Streetcar Timetable Run", "timetable run", "delivery-run",
    "Read your trip's column and leave a little early.", "Ride the timetable: reach each stop at the time your trip's column shows, with a little time to spare."),
  byGame("ferry-boarding", "orleans", "ferry-landing", "Canal Street Ferry Landing", "Ferry Boarding Line", "ferry boarding", "traffic-zone",
    "Passengers off first, then on at the mate's wave.", "Keep the landing lanes clear: passengers off first, the ramp set to the water level, then board at the wave."),
  byGame("catch-tally", "st-bernard", "sb-shell-beach", "Shell Beach Oyster and Shrimp Harbour", "Fair Catch Tally", "catch tally", "survey-transect",
    "Scoop from all over the bin and tally every one.", "Take level scoops from the top, middle and bottom of the bin and tally each one on the board."),
  byGame("map-grid", "jefferson", "jf-lakefront-levee", "Lakefront Levee and Floodwall Crew", "Map Key Grid", "map grid", "inspection-grid",
    "Key first, then colours.", "Read each square of the practice map against its key and mark the route that stays on higher ground."),
  byGame("yard-stack", "orleans", "port-terminal", "Riverfront Wharves Terminal", "Yard Stack", "yard stack", "lift-sequencer",
    "First to leave on top, heavy boxes low.", "Order the crane's picks so the box that leaves first ends on top and no load passes over the walkway."),
  byGame("wall-pacing", "st-bernard", "sb-surge-barrier", "Surge Barrier and Floodwall Crew", "Wall Pacing", "wall pacing", "survey-transect",
    "Same pace, same unit, all the way.", "Pace the floodwall panel by panel at a steady step and check your count against the panel joins."),
];

export function byApplyGame(id) { return BY_APPLY_GAMES.find((g) => g.id === id) ?? null; }

/** The mini-game's steps, built by its shared mechanic (pure and deterministic). */
export function byApplySteps(id) {
  const g = byApplyGame(id);
  const m = g ? QM_MECHANICS[g.mechanic] : null;
  return m ? m.build(g) : [];
}

// ------------------------------------------------------------------ the lessons

const byLesson = (slug, o) => ({ id: `by-lesson-${slug}`, flow: `by-${slug}`, minutes: BY_APPLY_MINUTES, ...o });

export const BY_LESSONS = [
  byLesson("levee", {
    station: "k12-by-how-a-levee-holds-water-back", programme: "k12-science", band: "upper primary",
    parish: "orleans", site: "levee-floodwall", siteName: "River Levee and Floodwall Crew",
    guide: "gr-np-levee-inspector", tradeStation: "br-levee-inspection-and-seepage",
    title: "How a Levee Holds Water Back",
    programmeWhy: "A levee as a wide, low bank of packed clay under grass, tested in a model tank against loose sand, with a wet spot flagged and reported rather than dug.",
    steps: ["A levee is a long, low hill of packed earth.", "It is wide at the bottom, where the water pushes hardest.", "The crew walks it, and a wet spot gets a flag, never a spade."],
    check: { q: "What do you do if you see a wet spot on a levee?", options: ["Flag it and tell the crew", "Dig in to look"], answer: 0, why: "Digging weakens the bank; a flag and a report bring the crew." },
    apply: { id: "kw-sandbag-relay", fallback: "by-apply-levee-walk" },
  }),
  byLesson("pump", {
    station: "k12-by-what-a-pump-station-does-in-the-rain", programme: "k12-science", band: "upper primary",
    parish: "orleans", site: "pumping-station", siteName: "Drainage Pumping Station",
    guide: "gr-np-pump-operator", tradeStation: "stormwater-outfall",
    title: "What a Pump Station Does in the Rain",
    programmeWhy: "Rain followed from a roof to the pump station, the reason low ground needs a lift, and a model pump started in order with its screen kept clear.",
    steps: ["Rain runs down gutters and drains into canals.", "Water only runs downhill, so low ground needs a lift.", "The pumps lift it up and over, one pump after another."],
    check: { q: "Why does rain in low ground need a pump?", options: ["Water only runs downhill", "The rain is too cold"], answer: 0, why: "Low ground cannot drain downhill by itself, so the pump lifts the water out." },
    apply: { id: "kw-pump-startup", fallback: "by-apply-pump-order" },
  }),
  byLesson("wetlands", {
    station: "k12-by-wetlands-as-a-storms-speed-bump", programme: "k12-science", band: "lower secondary",
    parish: "st-bernard", site: "sb-central-wetlands", siteName: "Central Wetlands Restoration",
    guide: "gr-np-wetlands-ranger", tradeStation: "br-native-planting-and-erosion-mats",
    title: "Wetlands as a Storm's Speed Bump",
    programmeWhy: "A fair wave-tank test with and without marsh plants, the wave's energy followed as it shrinks, and the restoration crew's replanting seen from the boat.",
    steps: ["Waves carry energy.", "Grass stems and shallow mud take some of that energy away.", "The crew plants the marsh so it can keep slowing the waves."],
    check: { q: "What does a marsh do to a wave?", options: ["It slows the wave and makes it smaller", "It stops all the water"], answer: 0, why: "A marsh is a speed bump, not a wall; it works with levees and pumps." },
    apply: { id: "by-apply-marsh-planting" },
  }),
  byLesson("river", {
    station: "k12-by-the-rivers-current-and-a-pilots-job", programme: "k12-science", band: "lower secondary",
    parish: "plaquemines", site: "pq-venice-marina", siteName: "Venice Marina at the End of the Road",
    guide: "gr-np-port-foreman", tradeStation: "pilot-transfer",
    title: "The River's Current and a Pilot's Job",
    programmeWhy: "Floats timed across a channel and round a bend, the current added to or taken from a boat's speed, and an upstream aim to cross, the way a river pilot plans a turn.",
    steps: ["The current is fastest in the middle and on the outside of a bend.", "Going downstream the river helps; going upstream it pushes back.", "A pilot aims a little upstream so the river carries the ship to the landing."],
    check: { q: "How does a pilot steer to reach a landing across the current?", options: ["Aim a little upstream", "Point straight at it"], answer: 0, why: "The current carries the boat sideways, so an upstream aim lands on target." },
    apply: { id: "by-apply-river-lookout" },
  }),
  byLesson("family-plan", {
    station: "k12-by-a-family-readiness-plan", programme: "k12-literacy-and-life-skills", band: "upper primary",
    parish: "st-bernard", site: "sb-school-campus", siteName: "Parish School Campus",
    guide: "gr-np-campus-teacher", tradeStation: "shelter-intake-operations",
    title: "A Family Readiness Plan",
    programmeWhy: "A readiness plan a family makes together before storm season — who helps, what goes in the go-bag, where to meet and where to go — written down, shared and practised.",
    steps: ["A plan answers small questions: who helps, what to pack, where to go.", "The family writes it down and keeps it where everyone can see it.", "Practising it on a calm day makes it feel easy."],
    check: { q: "Where should a family keep its plan?", options: ["Where everyone can see it", "In one grown-up's head"], answer: 0, why: "A written plan in a shared place works even when someone is away." },
    apply: { id: "by-apply-go-bag-check" },
  }),
  byLesson("water-cycle", {
    station: "k12-by-the-water-cycle-from-lake-to-tap", programme: "k12-science", band: "upper primary",
    parish: "st-tammany", site: "st-mandeville-harbour", siteName: "Mandeville Lakefront and Harbour",
    guide: "gr-np-wetlands-ranger", tradeStation: "me-shoreline-debris-and-microplastics-survey",
    title: "The Water Cycle from Lake to Tap",
    programmeWhy: "The water cycle traced around the lake in a lamp-and-lid model, and the treatment plant's cleaning stages ordered before any water reaches a tap, with clear never mistaken for safe.",
    steps: ["The sun lifts water from the lake as vapour.", "It cools into clouds and falls as rain.", "A treatment plant cleans and tests water before it reaches a tap."],
    check: { q: "Is clear lake water safe to drink?", options: ["Not until it is cleaned and tested", "Yes, if it looks clear"], answer: 0, why: "Germs are too small to see; only treated, tested water is safe." },
    apply: { id: "by-apply-pipe-trace" },
  }),
  byLesson("streetcar", {
    station: "k12-by-a-streetcar-timetable", programme: "k12-practical-math", band: "upper primary",
    parish: "orleans", site: "streetcar-barn", siteName: "Streetcar Barn and Shops",
    guide: "gr-np-streetcar-mechanic", tradeStation: "signal-cabinet",
    title: "A Streetcar Timetable",
    programmeWhy: "A timetable read as rows of stops and columns of trips, the gap between departures found by subtraction and a trip chosen that arrives with time to spare.",
    steps: ["Stops run down the side and trips run across the top.", "Slide down your trip's column to your stop.", "The later time take away the earlier time gives the gap."],
    check: { q: "How do you find the journey time?", options: ["Arrival time take away departure time", "Count the stops"], answer: 0, why: "Stops are not evenly spaced, so subtract the two times." },
    apply: { id: "by-apply-streetcar-run" },
  }),
  byLesson("ferry", {
    station: "k12-by-a-ferry-timetable-and-the-tide", programme: "k12-practical-math", band: "lower secondary",
    parish: "orleans", site: "ferry-landing", siteName: "Canal Street Ferry Landing",
    guide: "gr-np-port-foreman", tradeStation: "mw-ferry-deckhand-and-passenger-safety",
    title: "A Ferry Timetable and the Tide",
    programmeWhy: "A round trip planned from both banks' departures with a sensible wait, and the water-level board read to set the landing ramp level with the deck.",
    steps: ["Each bank has its own column of departures.", "A round trip needs a wait between arriving and returning.", "The water level tells the mate where to set the ramp."],
    check: { q: "Where do you read your return ferry?", options: ["In the far bank's column", "In the column you started from"], answer: 0, why: "The return leaves from the far bank, so read that bank's departures." },
    apply: { id: "kw-ferry-lineup", fallback: "by-apply-ferry-boarding" },
  }),
  byLesson("catch", {
    station: "k12-by-a-shrimp-boats-fair-count", programme: "k12-practical-math", band: "upper primary",
    parish: "st-bernard", site: "sb-shell-beach", siteName: "Shell Beach Oyster and Shrimp Harbour",
    guide: "gr-np-wetlands-ranger", tradeStation: "br-beach-seine-fish-survey-and-handling",
    title: "A Shrimp Boat's Fair Count",
    programmeWhy: "A catch counted fairly by level scoops from all over the bin, tallied, averaged and used to estimate the whole, with the small fish returned first.",
    steps: ["A fair sample takes scoops from all over the bin.", "Tally each shrimp as you move it.", "The average scoop helps you estimate the whole catch."],
    check: { q: "What makes a sample fair?", options: ["Scoops from all over the bin", "Scoops from the top only"], answer: 0, why: "The catch is not the same all through, so sample every part." },
    apply: { id: "by-apply-catch-tally" },
  }),
  byLesson("flood-map", {
    station: "k12-by-reading-a-flood-maps-colours", programme: "k12-practical-math", band: "lower secondary",
    parish: "jefferson", site: "jf-lakefront-levee", siteName: "Lakefront Levee and Floodwall Crew",
    guide: "gr-np-levee-inspector", tradeStation: "br-levee-inspection-and-seepage",
    title: "Reading a Flood Map's Colours",
    programmeWhy: "A practice flood map read through its key, scale bar and north arrow, low ground told from high, and a route and meeting place planned calmly from the evidence.",
    steps: ["Read the key before the colours.", "The scale bar turns map distance into real distance.", "Choose a meeting place and a route on higher ground."],
    check: { q: "What do you read first on a flood map?", options: ["The key", "The brightest colour"], answer: 0, why: "A colour means only what the key says." },
    apply: { id: "by-apply-map-grid" },
  }),
  byLesson("containers", {
    station: "k12-by-sorting-containers-at-the-port", programme: "k12-practical-math", band: "upper primary",
    parish: "orleans", site: "port-terminal", siteName: "Riverfront Wharves Terminal",
    guide: "gr-np-port-foreman", tradeStation: "container-lashing",
    title: "Sorting Containers at the Port",
    programmeWhy: "Model containers sorted by a rule, grouped by destination, stacked so the first to leave sits on top and the heaviest sit low, and the sort checked in a table.",
    steps: ["Sort each box by where it is going.", "The box that leaves first goes on top.", "Heavy boxes sit low so the stack stays steady."],
    check: { q: "Which box goes on top of the stack?", options: ["The one that leaves first", "The heaviest one"], answer: 0, why: "One lift gets it out, and heavy boxes stay low." },
    apply: { id: "kw-container-sort", fallback: "by-apply-yard-stack" },
  }),
  byLesson("floodwall", {
    station: "k12-by-measuring-a-floodwall-in-steps", programme: "k12-practical-math", band: "upper primary",
    parish: "st-bernard", site: "sb-surge-barrier", siteName: "Surge Barrier and Floodwall Crew",
    guide: "gr-np-levee-inspector", tradeStation: "tide-gate",
    title: "Measuring a Floodwall in Steps",
    programmeWhy: "A stretch of floodwall measured by pacing, a pace measured against the crew's tape, steps turned into length and the answer checked against the wall's panels.",
    steps: ["Measure your own pace against the tape first.", "Walk the wall at a steady pace and count each step.", "Steps times your pace gives the length, in the tape's unit."],
    check: { q: "Why measure your pace against the tape first?", options: ["So each step has a known length", "So you can walk faster"], answer: 0, why: "A pace is a unit only when you know its length." },
    apply: { id: "kw-floodgate-closeout", fallback: "by-apply-wall-pacing" },
  }),
];

export function byLessonById(id) { return BY_LESSONS.find((l) => l.id === id || l.station === id || l.flow === id) ?? null; }
export function byLessonsFor(parish, site = null) { return BY_LESSONS.filter((l) => l.parish === parish && (!site || l.site === site)); }

/** The classroom station's link from the parish site (lkStationLink, `from=parishes`). */
export function byStationHref(lesson, { page = BY_PAGE } = {}) {
  return lkStationLink(lesson.station, { from: BY_WORLD, page, siteId: lesson.site });
}

/**
 * The apply step a lesson runs now. `kiosks` is the list of kiosk ids console KREWE's registry
 * carries on this device (pass its ids; default none): a `kw-` id runs when present, else the
 * lesson's own fallback mini-game. Returns { kind: "kiosk" | "mini-game", id, game, minutes }.
 */
export function byApplyFor(lesson, { kiosks = [] } = {}) {
  const want = lesson?.apply?.id;
  if (want && want.startsWith("kw-") && kiosks.includes(want)) return { kind: "kiosk", id: want, game: null, minutes: BY_APPLY_MINUTES };
  const id = want && want.startsWith("by-apply-") ? want : lesson?.apply?.fallback;
  const game = byApplyGame(id);
  return game ? { kind: "mini-game", id, game, minutes: BY_APPLY_MINUTES } : null;
}

/** Every apply id a lesson can name (its kiosk and its fallback), for the checker and the coordinator. */
export function byApplyIds() {
  return BY_LESSONS.flatMap((l) => [l.apply.id, l.apply.fallback].filter(Boolean));
}

// ------------------------------------------------------------------ the passport records both

const byAwardFn = (award) => award ?? (typeof ppAward === "function" ? ppAward : null); // eslint-disable-line no-undef
const byAwardedFn = (awarded) => awarded ?? (typeof ppAwarded === "function" ? ppAwarded : null); // eslint-disable-line no-undef

/** Record the lesson (its check answered right) on the passport, once. */
export function byRecordLesson(lesson, { award = null, awarded = null } = {}) {
  const put = byAwardFn(award), has = byAwardedFn(awarded);
  if (!put || !lesson) return false;
  if (has && has("by-lesson", lesson.id)) return false;
  put("by-lesson", { attemptId: lesson.id, reputation: 1, reason: `Parish lesson: ${lesson.title}` });
  return true;
}

/** Record the apply step played after the lesson, once per lesson and step. */
export function byRecordApply(lesson, applyId, { award = null, awarded = null } = {}) {
  const put = byAwardFn(award), has = byAwardedFn(awarded);
  if (!put || !lesson || !applyId) return false;
  const attemptId = `${lesson.id}:${applyId}`;
  if (has && has("by-apply", attemptId)) return false;
  put("by-apply", { attemptId, reputation: 1, reason: `Parish apply step after ${lesson.title}` });
  return true;
}

export function byCounts() {
  return { lessons: BY_LESSONS.length, games: BY_APPLY_GAMES.length, parishes: new Set(BY_LESSONS.map((l) => l.parish)).size,
    kiosks: BY_LESSONS.filter((l) => l.apply.id.startsWith("kw-")).length };
}
