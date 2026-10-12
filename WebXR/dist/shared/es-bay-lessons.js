// ESTUARY — K-12 ecology of the Bay (docs/consoles/ESTUARY.md). One data module that the flows in
// WebXR/flows/es-*.json, check_k12 section 10, SCHOLAR (guarded) and DEAN (guarded) read:
//
//   ES_LESSONS       the built lessons: K-12 station, programme, band, San Francisco district site
//                    (np-data-<district>.js), an optional BAYMAP Oakland anchor (guarded), the flow,
//                    three one-idea steps, a check question and the apply step
//   ES_PLANNED       the lesson ids published for BAYQUEST and STORYLINE that have no station yet
//   ES_APPLY_GAMES   ESTUARY's own two-minute fallback games on the shared mechanics
//   ES_BQ_GAMES      BAYQUEST's published game ids ($SP/epa/bayquest-ids.md); a lesson runs one when
//                    bqGame(id) resolves, else its own fallback
//   esApplyFor(l)    the apply step a lesson runs now
//   esStartLesson(id, where)   SCHOLAR's scStartSession(lessonId, where)
//   esSessionLessons(parishId) the lessons that start a SCHOLAR session on that map (mounted in the parishes app)
//   esModule()       a DEAN-assignable module shape ({ id, title, lessons: [{ lessonId, station, flow }] })
//   esOaklandSite(l) the lesson's BAYMAP West Oakland site (throws on an anchor that names no real site)
//
// Kids rule: one idea per step, the band's reading ceiling, no fear framing, no digit in learner text.
// Facts rule: program facts ($SP/epa/epa-2026-facts.md) only in the careers and clean-air lessons.
// Every top-level name is prefixed `es`/`ES_` (the bundler shares one scope). No three.js here.

import { QM_MECHANICS } from "./side-game-mechanics.js";

import { scStartSession as esScStart } from "./sc-scholar.js";
import { npParish as esNpParish } from "./np-parishes.js";

export const ES_APPLY_MINUTES = 2;
export const ES_BAND_CEILING = { "early primary": 6, "upper primary": 8, "lower secondary": 10, "upper secondary": 11 };
export const ES_BQ_GAMES = ["bq-trash-capture-cleanout", "bq-rain-garden-build", "bq-tidal-channel-dig", "bq-zero-emission-yard-shuffle"];

const esGame = (id, district, site, title, mechanic, idea, summary) => ({
  id: `es-apply-${id}`, world: "parishes", kind: "apply-step", district, site, title, task: title.toLowerCase(), mechanic,
  minutes: ES_APPLY_MINUTES, idea, summary,
});

export const ES_APPLY_GAMES = [
  esGame("drain-trace", "sf-marina", "marina-seawall-crew", "Drain Trace", "line-follow",
    "Rain runs from the roof to the gutter, the drain and the Bay.", "Trace a raindrop from a roof along the gutter and the drain line to the shore without skipping a stop."),
  esGame("screen-sort", "sf-mission", "islais-creek-pump-station", "Screen Sort", "inspection-grid",
    "The screen lets water through and keeps trash back.", "Check each square of the model screen and mark it clear, blocked or holding trash for the crew."),
  esGame("garden-layers", "sf-mission", "mission-school-campus", "Garden Layers", "lift-sequencer",
    "Marks first, then loose soil and plants in the right order.", "Build a model rain garden layer by layer: check the pipe marks, dig, add loose soil, plant thirsty plants in the low middle."),
  esGame("nursery-spotting", "sf-bayview", "herons-head-wetland", "Nursery Spotting", "lookout-watch",
    "Food, shelter and calm water make a nursery.", "Keep a quiet lookout from the boardwalk and call each young fish, duckling and hidden nest without leaving the path."),
  esGame("sediment-path", "sf-bayview", "yosemite-slough-restoration", "Sediment Path", "line-follow",
    "Slow water drops its mud.", "Trace a cloud of mud from the channel mouth to the marsh plants where the water slows and it settles."),
  esGame("nutrient-balance", "sf-marina", "crissy-marsh-crew", "Nutrient Balance", "switching-order",
    "Keep extra nutrients out at the start.", "Switch on the fixes in order around the lagoon: plant strip, pet waste bin, no-feeding sign, then take the water reading."),
  esGame("food-web-links", "sf-marina", "fort-mason-piers", "Food Web Links", "inspection-grid",
    "Arrows follow the food energy.", "Check each square of the web grid and mark every arrow right or wrong way round, from tiny plants up to the seal."),
  esGame("shoreline-sweep", "sf-golden-gate-park", "ocean-beach-lifeguard-station", "Shoreline Sweep", "survey-transect",
    "Gloves, tongs and a partner; sharps in the tub.", "Sweep the flagged strip with a partner above the wet sand line and tally caps, strips and bits as you go."),
  esGame("yard-route", "sf-bayview", "port-southern-terminals", "Clean Yard Route", "delivery-run",
    "No exhaust where it runs; look both ways for quiet machines.", "Route a model electric yard tractor from the ship to the stack and back to its charging bay, stopping at every crossing."),
  esGame("crew-match", "sf-downtown", "market-street-union-hall", "Crew Match", "inspection-grid",
    "Every project needs a trained crew.", "Match each Bay job card on the grid to the crew who does it: operators, landscape crews and plant operators."),
  esGame("bird-tally", "sf-bayview", "india-basin-park-crew", "Shorebird Tally", "survey-transect",
    "Same box, same time, same rules; one tally each.", "Sweep the survey box once from left to right and tally each shorebird in its column before the timer ends."),
  esGame("garden-pacing", "sf-golden-gate-park", "sunset-school-campus", "Garden Pacing", "survey-transect",
    "Start at zero; length times width.", "Measure each side of the model bed from its zero mark, then work out the area and check it by counting grid squares."),
];

export function esApplyGame(id) { return ES_APPLY_GAMES.find((g) => g.id === id) ?? null; }
export function esApplySteps(id) {
  const g = esApplyGame(id);
  const m = g ? QM_MECHANICS[g.mechanic] : null;
  return m ? m.build(g) : [];
}

const esLesson = (slug, o) => ({ id: `es-lesson-${slug}`, flow: `es-${slug}`, minutes: ES_APPLY_MINUTES, ...o });

export const ES_LESSONS = [
  esLesson("storm-drain", {
    station: "k12-es-where-the-storm-drain-goes", programme: "k12-science", band: "upper primary",
    district: "sf-marina", site: "marina-seawall-crew", siteName: "Marina Seawall and Storm Drain Crew",
    oakland: null,
    title: "Where the Storm Drain Goes",
    programmeWhy: "Rain traced from a roof to the gutter, the drain and the Bay on a street model and the crew's drain map, and why only rain belongs in a storm drain.",
    steps: ["Rain on a street cannot soak in, so it runs downhill.", "The gutter takes it to the storm drain.", "The drain pipe takes it to the Bay, so only rain goes in."],
    check: { q: "Where does the water in a storm drain go?", options: ["To the Bay", "Into a big tank under the school"], answer: 0, why: "On many streets the storm drain pipe runs to a creek or the Bay." },
    apply: { id: null, fallback: "es-apply-drain-trace" },
  }),
  esLesson("trash-capture", {
    station: "k12-es-what-a-trash-capture-device-does", programme: "k12-science", band: "upper primary",
    district: "sf-mission", site: "islais-creek-pump-station", siteName: "Islais Creek Pump Station",
    oakland: { parish: "oak-west-oakland", site: "outer-harbor-container-terminal" },
    title: "What a Trash Capture Device Does",
    programmeWhy: "A fair test with a model screen in a drain, a bottle cap followed to the screen, and the crew's safe cleanout of a real device watched from behind the barrier.",
    steps: ["A trash capture device sits inside a storm drain.", "Its screen has holes that let the water through.", "Trash is too big for the holes, so it stays in the basket."],
    check: { q: "What does the screen let through?", options: ["The water", "The bottles and bags"], answer: 0, why: "The holes are big enough for water and small enough to keep trash back." },
    apply: { id: "bq-trash-capture-cleanout", fallback: "es-apply-screen-sort" },
  }),  esLesson("rain-garden", {
    station: "k12-es-rain-gardens-a-sponge-in-the-sidewalk", programme: "k12-science", band: "upper primary",
    district: "sf-mission", site: "mission-school-campus", siteName: "Mission District School Campus", oakland: null,
    title: "Rain Gardens: a Sponge in the Sidewalk",
    programmeWhy: "Garden soil and packed ground compared in a fair soak test, water followed from the kerb gap into a school rain garden, and the crew's pipe marks checked before any digging.",
    steps: ["A hard sidewalk sends rain away to the drain.", "A rain garden has loose soil that soaks rain up like a sponge.", "Plant roots keep the soil loose, so feet stay on the path."],
    check: { q: "What does a rain garden do with the rain?", options: ["It soaks it into the ground", "It keeps it like a pond"], answer: 0, why: "A rain garden holds rain for a short time and lets it soak down into the soil." },
    apply: { id: "bq-rain-garden-build", fallback: "es-apply-garden-layers" },
  }),
  esLesson("marsh-nursery", {
    station: "k12-es-the-tidal-marsh-nursery", programme: "k12-science", band: "upper primary",
    district: "sf-bayview", site: "herons-head-wetland", siteName: "Heron's Head Wetland Restoration", oakland: null,
    title: "The Tidal Marsh Nursery",
    programmeWhy: "Channels, grass and mud found as the food and shelter that make a tidal marsh a nursery, young fish watched in a model channel, and the boardwalk kept quiet with the crew.",
    steps: ["A nursery is a safe place for young animals to grow.", "Shallow channels and tall grass give young fish and birds places to hide.", "The mud is full of tiny animals for them to eat."],
    check: { q: "Why do young fish grow up in the marsh?", options: ["It has food and places to hide", "The water is always deep"], answer: 0, why: "Shallow channels, grass and food-rich mud make the marsh a nursery." },
    apply: { id: null, fallback: "es-apply-nursery-spotting" },
  }),
  esLesson("mud-on-the-move", {
    station: "k12-es-mud-on-the-move", programme: "k12-science", band: "lower secondary",
    district: "sf-bayview", site: "yosemite-slough-restoration", siteName: "Yosemite Slough Restoration Site", oakland: null,
    title: "Mud on the Move",
    programmeWhy: "A tide tray run slow and fast with the same mud, the layer each leaves, why a marsh needs that mud to keep up with the water, and the crew working from mats.",
    steps: ["Moving water can carry tiny grains of mud.", "When the water slows down, the mud settles.", "Each tide leaves a thin layer, and the layers help the marsh grow."],
    check: { q: "Where does moving water drop its mud?", options: ["Where it slows down", "Where it moves fastest"], answer: 0, why: "Slow water cannot hold the grains, so they settle among the plants." },
    apply: { id: "bq-tidal-channel-dig", fallback: "es-apply-sediment-path" },
  }),
  esLesson("nutrients", {
    station: "k12-es-too-much-of-a-good-thing", programme: "k12-science", band: "lower secondary",
    district: "sf-marina", site: "crissy-marsh-crew", siteName: "Crissy Field Marsh Crew", oakland: null,
    title: "Too Much of a Good Thing",
    programmeWhy: "Two jars of the same pond water in the same light, plant food in one, the green that follows, and the crew's careful water sample from the dock.",
    steps: ["Nutrients are food that helps plants grow.", "Too many can feed so much algae that the water turns green.", "Keeping extra nutrients out on land keeps the water in balance."],
    check: { q: "What can too many nutrients do to a lagoon?", options: ["Feed a lot of algae", "Make the water saltier"], answer: 0, why: "Extra nutrients feed algae, and lots of algae cloud the water." },
    apply: { id: null, fallback: "es-apply-nutrient-balance" },
  }),
  esLesson("food-web", {
    station: "k12-es-the-bay-food-web", programme: "k12-science", band: "upper primary",
    district: "sf-marina", site: "fort-mason-piers", siteName: "Fort Mason Piers", oakland: null,
    title: "The Bay Food Web",
    programmeWhy: "A Bay food web built on a board with arrows that follow the food energy, and the links spotted live from behind the pier rail.",
    steps: ["Tiny plants in the Bay make food from sunlight.", "Tiny animals eat them, fish eat the tiny animals, and birds and seals eat the fish.", "The arrows point the way the food goes."],
    check: { q: "Which way does the arrow go between a fish and a seal?", options: ["From the fish to the seal", "From the seal to the fish"], answer: 0, why: "Arrows follow the food energy, from what is eaten to what eats it." },
    apply: { id: null, fallback: "es-apply-food-web-links" },
  }),
  esLesson("plastics", {
    station: "k12-es-plastics-and-the-bay", programme: "k12-science", band: "upper primary",
    district: "sf-golden-gate-park", site: "ocean-beach-lifeguard-station", siteName: "Ocean Beach Lifeguard Station", oakland: null,
    title: "Plastics and the Bay",
    programmeWhy: "A float test in salty water, plastics sorted into floaters and sinkers, and a paired shoreline sweep with gloves, tongs and a sharps tub.",
    steps: ["Sun and waves break plastic into smaller pieces.", "The pieces do not go away, and many of them float.", "Keeping plastic out of the water at the start works best."],
    check: { q: "What happens to plastic in the water?", options: ["It breaks into smaller pieces that stay", "It melts away"], answer: 0, why: "Plastic breaks up into smaller and smaller bits, but the bits stay." },
    apply: { id: null, fallback: "es-apply-shoreline-sweep" },
  }),
  esLesson("clean-air-port", {
    station: "k12-es-clean-air-at-the-port", programme: "k12-science", band: "lower secondary",
    district: "sf-bayview", site: "port-southern-terminals", siteName: "Port Southern Terminals",
    oakland: { parish: "oak-west-oakland", site: "west-oakland-air-monitoring-station" },
    title: "Clean Air at the Port",
    programmeWhy: "Diesel and electric model trucks compared with clean filters, the breeze followed from the port to homes, and what the Port of Oakland says its Clean Ports award pays for.",
    steps: ["Diesel machines make exhaust where they work.", "The breeze carries it to homes and schools nearby.", "Electric trucks and cranes make no exhaust where they run."],
    check: { q: "Why do electric trucks help the air near a port?", options: ["They make no exhaust where they run", "They drive faster"], answer: 0, why: "No exhaust where they work means cleaner air for workers and neighbours." },
    apply: { id: "bq-zero-emission-yard-shuffle", fallback: "es-apply-yard-route" },
    sources: ["https://www.portofoakland.com/cleanports", "https://www.portofoakland.com/port-of-oakland-awarded-historic-322-million-epa-grant"],
  }),
  esLesson("who-does-this-work", {
    station: "k12-es-who-does-this-work", programme: "k12-literacy-and-life-skills", band: "lower secondary",
    district: "sf-downtown", site: "market-street-union-hall", siteName: "Market Street Union Hall",
    oakland: { parish: "oak-west-oakland", site: "mandela-parkway-union-hall" },
    title: "Who Does This Work",
    programmeWhy: "The trades behind Bay restoration and clean port work matched job by job, the path from pre-apprenticeship to crew, and what the EPA and the Port of Oakland say, with each source named.",
    steps: ["Crews build and look after drains, gardens, marshes and ports.", "People train for this work, often through an apprenticeship.", "When we share a fact, we name where it came from."],
    check: { q: "How do most people get ready for a trade?", options: ["Training, often an apprenticeship", "No training at all"], answer: 0, why: "Crews train before the job and keep training on it." },
    apply: { id: null, fallback: "es-apply-crew-match" },
    sources: ["https://www.epa.gov/newsreleases/epa-awards-record-82-million-improve-water-quality-and-restore-habitat-across-san", "https://www.portofoakland.com/port-of-oakland-awarded-historic-322-million-epa-grant"],
  }),
  esLesson("count-it", {
    station: "k12-es-count-it-a-fair-survey", programme: "k12-practical-math", band: "upper primary",
    district: "sf-bayview", site: "india-basin-park-crew", siteName: "India Basin Shoreline Park Crew", oakland: null,
    title: "Count It: a Fair Survey",
    programmeWhy: "A shorebird count with a marked box, a timer and a rule card, one sweep and one tally per bird, compared with another group's count.",
    steps: ["A fair count uses the same box, the same time and the same rules.", "Sweep the box once and give each bird one tally.", "Fair counts can be compared from day to day."],
    check: { q: "How do you stop counting a bird twice?", options: ["Sweep the box once, left to right", "Count again when it flies back"], answer: 0, why: "A single sweep gives each bird one tally." },
    apply: { id: null, fallback: "es-apply-bird-tally" },
  }),
  esLesson("measure-rain-garden", {
    station: "k12-es-measure-a-rain-garden", programme: "k12-practical-math", band: "upper primary",
    district: "sf-golden-gate-park", site: "sunset-school-campus", siteName: "Sunset District School Campus", oakland: null,
    title: "Measure a Rain Garden",
    programmeWhy: "A rain garden bed measured from zero with a tape, length times width for the area, and the bed drawn to scale on a grid for the crew.",
    steps: ["Measure from the zero mark on the tape.", "Area is the length times the width.", "Always write the unit with the number."],
    check: { q: "How do you find the area of the bed?", options: ["Multiply the length by the width", "Add the length and the width"], answer: 0, why: "Area counts the squares inside, so you multiply." },
    apply: { id: null, fallback: "es-apply-garden-pacing" },
  }),
];

/** Lesson ids published in docs/consoles/ESTUARY.md that have no station in this tree yet. */
export const ES_PLANNED = [];

export function esLessons() { return ES_LESSONS; }
export function esLessonById(id) { return ES_LESSONS.find((l) => l.id === id || l.station === id || l.flow === id) ?? null; }

export function esStationHref(lesson) {
  return `smartcity.html?sim=${encodeURIComponent(lesson.station)}&from=parishes&district=${encodeURIComponent(lesson.district)}&site=${encodeURIComponent(lesson.site)}`;
}

/** BAYQUEST's game when its registry carries it (bqGame, guarded), else ESTUARY's fallback game. */
export function esApplyFor(lesson, { bqGame = (typeof globalThis.bqGame === "function" ? globalThis.bqGame : null) } = {}) {
  const want = lesson?.apply?.id;
  if (want && ES_BQ_GAMES.includes(want) && bqGame?.(want)) return { kind: "bayquest", id: want, game: bqGame(want), minutes: ES_APPLY_MINUTES };
  const game = esApplyGame(lesson?.apply?.fallback);
  return game ? { kind: "mini-game", id: game.id, game, minutes: ES_APPLY_MINUTES } : null;
}

/** The lesson's BAYMAP Oakland site (np-data-oak-*, in the tree): the site object, or null when the lesson has no
 *  Oakland anchor. An anchor that names no real site is an error. */
export function esOaklandSite(lesson, { npParish = esNpParish } = {}) {
  const o = lesson?.oakland;
  if (!o) return null;
  const site = npParish(o.parish)?.sites.find((s) => s.id === o.site);
  if (!site) throw new Error(`esOaklandSite: ${lesson.id} anchors on ${o.parish}/${o.site}, which is not a site of that map`);
  return site;
}

/** The Oakland copy of a lesson carries its own id (SCHOLAR's index keeps one entry per id). */
export const esOaklandLessonId = (lesson) => `${lesson.id}-oakland`;

/** The lessons that start a SCHOLAR session on one parish or district map, in the raw shape scMountSession /
 *  scNormalise read: the San Francisco anchor (`district`/`site`) and the West Oakland anchor (`oakland`). */
export function esSessionLessons(parishId) {
  const out = [];
  for (const l of ES_LESSONS) {
    const base = { title: l.title, k12: l.station, band: l.band, minutes: l.minutes, steps: l.steps, check: l.check, trade: l.trade ?? "", tradeLine: l.programmeWhy ?? "" };
    if (l.district === parishId) out.push({ ...base, id: l.id, parish: l.district, site: l.site });
    if (l.oakland?.parish === parishId) out.push({ ...base, id: esOaklandLessonId(l), parish: l.oakland.parish, site: l.oakland.site });
  }
  return out;
}

/** SCHOLAR's session hook: scStartSession(lessonId, where) at the lesson's anchor (the Oakland one when `where`
 *  names oak-west-oakland). SCHOLAR's own hook by default; a caller that passes `scStartSession: null` gets null. */
export function esStartLesson(id, where = null, { scStartSession = esScStart } = {}) {
  const l = esLessonById(id) ?? ES_LESSONS.find((x) => esOaklandLessonId(x) === id) ?? null;
  if (!l) return null;
  const oak = l.oakland && (where?.parish === l.oakland.parish || id === esOaklandLessonId(l));
  const lessonId = oak ? esOaklandLessonId(l) : l.id;
  return scStartSession?.(lessonId, where ?? (oak ? { world: "parishes", parish: l.oakland.parish, site: l.oakland.site } : { world: "parishes", parish: l.district, site: l.site })) ?? null;
}

/** A DEAN-assignable module (dnModules() shape: id, title, audience, lessons). */
export function esModule() {
  return {
    id: "es-bay-ecology", title: "K-12 Ecology of the Bay", audience: "classroom", source: "ESTUARY",
    lessons: ES_LESSONS.map((l) => ({ lessonId: l.id, station: l.station, flow: l.flow, band: l.band, minutes: l.minutes })),
  };
}
