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
//   esStartLesson(id, where)   SCHOLAR's scStartSession(lessonId, where), guarded
//   esModule()       a DEAN-assignable module shape ({ id, title, lessons: [{ lessonId, station, flow }] })
//   esOaklandSite(l) the lesson's BAYMAP site when np-data-oak-* is merged (npParish(id)?.sites.find)
//
// Kids rule: one idea per step, the band's reading ceiling, no fear framing, no digit in learner text.
// Facts rule: program facts ($SP/epa/epa-2026-facts.md) only in the careers and clean-air lessons.
// Every top-level name is prefixed `es`/`ES_` (the bundler shares one scope). No three.js here.

import { QM_MECHANICS } from "./side-game-mechanics.js";

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
  }),
];

/** Lesson ids published in docs/consoles/ESTUARY.md that have no station in this tree yet. */
export const ES_PLANNED = [
  { id: "es-lesson-rain-garden", station: "k12-es-rain-gardens-a-sponge-in-the-sidewalk", district: "sf-mission", site: "mission-school-campus", apply: "bq-rain-garden-build" },
  { id: "es-lesson-marsh-nursery", station: "k12-es-the-tidal-marsh-nursery", district: "sf-bayview", site: "herons-head-wetland", apply: null },
  { id: "es-lesson-mud-on-the-move", station: "k12-es-mud-on-the-move", district: "sf-bayview", site: "yosemite-slough-restoration", apply: "bq-tidal-channel-dig" },
  { id: "es-lesson-nutrients", station: "k12-es-too-much-of-a-good-thing", district: "sf-marina", site: "crissy-marsh-crew", apply: null },
  { id: "es-lesson-food-web", station: "k12-es-the-bay-food-web", district: "sf-marina", site: "fort-mason-piers", apply: null },
  { id: "es-lesson-plastics", station: "k12-es-plastics-and-the-bay", district: "sf-golden-gate-park", site: "ocean-beach-lifeguard-station", apply: null },
  { id: "es-lesson-clean-air-port", station: "k12-es-clean-air-at-the-port", district: "sf-bayview", site: "port-southern-terminals", oakland: { parish: "oak-west-oakland", site: "west-oakland-air-monitoring-station" }, apply: "bq-zero-emission-yard-shuffle" },
  { id: "es-lesson-who-does-this-work", station: "k12-es-who-does-this-work", district: "sf-downtown", site: "market-street-union-hall", oakland: { parish: "oak-west-oakland", site: "mandela-parkway-union-hall" }, apply: null },
  { id: "es-lesson-count-it", station: "k12-es-count-it-a-fair-survey", district: "sf-bayview", site: "india-basin-park-crew", apply: null },
  { id: "es-lesson-measure-rain-garden", station: "k12-es-measure-a-rain-garden", district: "sf-golden-gate-park", site: "sunset-school-campus", apply: null },
];

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

/** The lesson's BAYMAP Oakland site once np-data-oak-* is merged; null until then. */
export function esOaklandSite(lesson, { npParish = (typeof globalThis.npParish === "function" ? globalThis.npParish : null) } = {}) {
  const o = lesson?.oakland;
  return o ? npParish?.(o.parish)?.sites?.find((s) => s.id === o.site) ?? null : null;
}

/** SCHOLAR's session hook (scStartSession(lessonId, where)), guarded: null when SCHOLAR is absent. */
export function esStartLesson(id, where = null, { scStartSession = (typeof globalThis.scStartSession === "function" ? globalThis.scStartSession : null) } = {}) {
  const l = esLessonById(id);
  if (!l) return null;
  return scStartSession?.(l.id, where ?? { world: "parishes", district: l.district, site: l.site }) ?? null;
}

/** A DEAN-assignable module (dnModules() shape: id, title, audience, lessons). */
export function esModule() {
  return {
    id: "es-bay-ecology", title: "K-12 Ecology of the Bay", audience: "classroom", source: "ESTUARY",
    lessons: ES_LESSONS.map((l) => ({ lessonId: l.id, station: l.station, flow: l.flow, band: l.band, minutes: l.minutes })),
  };
}
