// LA-K12 — K-12 lessons for the Louisiana maps (docs/consoles/LA-K12.md). SmartCiti.X Powered by AGI Corp.
//
// One data module that check_k12 section 11, SCHOLAR (guarded), DEAN (guarded), the parishes app's session panel and the
// Louisiana programme's awareness / K-12 level read. The ESTUARY pattern (es-bay-lessons.js) for six Louisiana themes:
//
//   LK_LESSONS         the lessons: K-12 station (tools/k12-data/lk-*.json → gen_k12_station.mjs), classroom programme,
//                      band, three one-idea steps, a check question, the trade it points at and its anchors
//   anchors            fixed map + site ids on the Louisiana maps — GUARDED: an anchor counts only when that map is in the
//                      tree and the site is on it (maps merged later need no change here)
//   character          the fallback, keyed by region and site kind rather than a fixed list of map ids: on a Louisiana or
//                      New Orleans map with no fixed anchor for the lesson, the first site of a matching kind hosts it
//                      (so CAPITAL's Baton Rouge and Hammond maps pick up the river and careers lessons when they merge)
//   lkSessionLessons(parishId)  the lessons that start a SCHOLAR session on that map (mounted in the parishes app)
//   lkStartLesson(id, where)    SCHOLAR's scStartSession(lessonId, where), guarded
//   lkModule()                  a DEAN-assignable module shape
//
// Kids rule: one idea per step, the band's reading ceiling, no fear framing, no digit in learner text. Facts rule: no
// project figure, no company name and no employer's hiring in any lesson; places are named as places. The platform has no
// partnership with any company, agency or union. Every top-level name is prefixed `lk`/`LK_` (the bundler shares one scope).

// Plain (unaliased) imports: the flat bundler strips imports and keeps only the declared names, so an `as` alias would be
// undefined in dist. Callers may still pass their own npParish / scStartSession in the options.
import { scStartSession } from "./sc-scholar.js";
import { npParish } from "./np-parishes.js";

export const LK_BAND_CEILING = { "early primary": 6, "upper primary": 8, "lower secondary": 10, "upper secondary": 11 };
/** Regions whose maps are Louisiana maps (the character fallback applies only there). */
export const LK_REGIONS = /^(louisiana|new-orleans|baton-rouge|capital|acadiana|la-)/;

const lkA = (map, site) => ({ map, site });
const lkQ = (q, options, answer, why) => ({ q, options, answer, why });

export const LK_LESSONS = [
  { id: "lk-lesson-new-marsh", theme: "coastal marsh and restoration", station: "k12-lk-building-new-marsh-on-the-coast", programme: "k12-science", band: "upper primary", minutes: 3,
    programmeWhy: "Learners see why a coastal marsh shrinks and how a restoration crew builds new marsh from mud, water and grass, the science behind the coast's restoration work.",
    title: "New Marsh from Mud", trade: "Marsh restoration crews",
    tradeLine: "A restoration crew builds a wall of earth, pumps mud inside and plants grass so the new ground stays put.",
    steps: ["Look across the water where marsh used to be.", "Waves and sinking ground wear the marsh away.", "The crew pumps mud behind a wall and plants grass on it."],
    check: lkQ("What holds new marsh mud in place?", ["Grass roots", "Boat wakes", "Salty water"], 0, "Roots grip the mud like a net, so waves cannot carry it off."),
    anchors: [lkA("la-starbase-vermilion", "lsb-marsh-creation-dredge"), lkA("la-black-bayou-cameron", "lbb-marsh-restoration-crew")],
    character: { kinds: ["wetland", "dredge"], idPattern: "marsh|wetland" } },
  { id: "lk-lesson-lock-and-levee", theme: "rivers, levees and locks", station: "k12-lk-how-a-lock-lifts-a-boat", programme: "k12-practical-math", band: "upper primary", minutes: 3,
    programmeWhy: "Learners read water levels on a gauge and work a model lock in order, the measuring behind every lock and levee on the Mississippi.",
    title: "How a Lock Lifts a Boat", trade: "Lock operators and levee crews",
    tradeLine: "A lock operator reads the water on both sides and opens one gate only when the levels match.",
    steps: ["Find the gates at each end of the lock.", "Water flows from the high side into the chamber.", "When the levels match, the next gate can open."],
    check: lkQ("Why does only one gate open at a time?", ["So water does not rush through", "To save paint", "So boats go faster"], 0, "One shut gate holds the high water back while the level changes gently."),
    anchors: [lkA("nola-bywater-lower-ninth", "nbw-canal-lock-crew"), lkA("nola-bywater-lower-ninth", "nbw-river-levee-crew"), lkA("la-shintech-plaquemine", "lsp-levee-crossing"), lkA("la-delta-forge-rapides", "ldf-red-river-levee-patrol"), lkA("nola-french-quarter-cbd", "nfq-riverfront-floodwall-gate")],
    character: { kinds: ["lock", "levee", "floodgate", "floodwall"] } },
  { id: "lk-lesson-power-path", theme: "energy and electricity", station: "k12-lk-where-a-data-center-gets-its-power", programme: "k12-science", band: "lower secondary", minutes: 3,
    programmeWhy: "Learners follow energy from a store to a generator, through a substation to computers and out as heat, general science for the power and cooling trades.",
    title: "Follow the Energy", trade: "Electricians and cooling technicians",
    tradeLine: "An electrician keeps power flowing to the computers, and a cooling technician carries their heat away.",
    steps: ["Look at the fenced yard where the power comes in.", "The energy changes form at every step it takes.", "Inside, the computers turn it into heat that must leave."],
    check: lkQ("Where does most energy used by computers end up?", ["As heat", "It vanishes", "Back in the gas"], 0, "Energy changes form but never disappears; computers turn it into heat."),
    anchors: [lkA("la-meta-richland", "lmr-substation-build"), lkA("la-delta-forge-rapides", "ldf-cooling-plant"), lkA("la-black-bayou-cameron", "lbb-salt-dome-wellpad"), lkA("la-starbase-vermilion", "lsb-power-plant-build")],
    character: { kinds: ["substation", "energy-storage"] } },
  { id: "lk-lesson-wing-lift", theme: "flight and aircraft", station: "k12-lk-how-a-wing-lifts-an-aircraft", programme: "k12-science", band: "lower secondary", minutes: 3,
    programmeWhy: "Learners balance the four forces and find the wing tilt that gives lift, the science an aircraft mechanic checks on every walk-round.",
    title: "What Lifts a Wing", trade: "Aircraft mechanics",
    tradeLine: "A mechanic walks round the aircraft before flight and checks that every flap and hinge moves freely.",
    steps: ["Look at the wings of the parked aircraft.", "A moving wing pushes air down, and the air pushes it up.", "Flaps change the wing's shape to give lift at slow speed."],
    check: lkQ("When does an aircraft leave the ground?", ["When lift is bigger than weight", "When the engine is loud", "When the flaps are up"], 0, "The wheels lift once the wings' upward push beats the pull of weight."),
    anchors: [lkA("la-avex-new-iberia", "lav-apron-work"), lkA("la-avex-new-iberia", "lav-workforce-centre"), lkA("la-starbase-vermilion", "lsb-airport-apron")],
    character: { kinds: ["airport", "hangar"] } },
  { id: "lk-lesson-steel-hull", theme: "boats and shipbuilding", station: "k12-lk-why-a-steel-boat-floats", programme: "k12-science", band: "upper primary", minutes: 3,
    programmeWhy: "Learners shape a hull that floats, load it to its mark and launch it down a slip, the science behind a bayou shipyard's work.",
    title: "Why Steel Can Float", trade: "Shipfitters and welders",
    tradeLine: "A shipfitter shapes steel plates into a hollow hull that pushes aside enough water to float.",
    steps: ["Look at the new hull on the slip.", "A hollow hull pushes aside lots of water.", "The water pushes back up and holds the hull."],
    check: lkQ("Why does a steel hull float when a steel lump sinks?", ["Its hollow shape pushes aside more water", "It is painted", "It is lighter steel"], 0, "Same steel, but the wide hollow shape moves enough water to hold it up."),
    anchors: [lkA("la-saronic-franklin", "lsf-new-slip-build"), lkA("la-saronic-franklin", "lsf-launch-and-test"), lkA("la-saronic-franklin", "lsf-workforce-centre")],
    character: { kinds: ["slip", "shipyard"] } },
  { id: "lk-lesson-crews-behind-the-build", theme: "the jobs and trades behind development", station: "k12-lk-the-crews-behind-a-big-build", programme: "k12-literacy-and-life-skills", band: "lower secondary", minutes: 3,
    programmeWhy: "Learners match trades to each stage of a big build and plan a path into an apprenticeship, careers awareness about kinds of work, never about any one employer.",
    title: "Who Builds It", trade: "Apprenticeship coordinators",
    tradeLine: "A coordinator shows how people start in a trade: basics first, then paid learning on the job and in class.",
    steps: ["Look at the site from the workforce centre.", "Many trades work in turn, from survey to finish.", "An apprentice earns while learning a trade step by step."],
    check: lkQ("What is an apprenticeship?", ["Paid learning on the job and in class", "A short visit", "A test with no training"], 0, "Apprentices earn while they learn beside skilled workers and in class."),
    anchors: [lkA("la-shintech-plaquemine", "lsp-workforce-centre"), lkA("la-meta-richland", "lmr-workforce-centre"), lkA("la-delta-forge-rapides", "ldf-workforce-centre"), lkA("la-avex-new-iberia", "lav-workforce-centre"), lkA("la-saronic-franklin", "lsf-workforce-centre"), lkA("la-starbase-vermilion", "lsb-workforce-trailer"), lkA("la-black-bayou-cameron", "lbb-workforce-trailer"), lkA("nola-french-quarter-cbd", "nfq-workforce-centre")],
    character: { kinds: ["campus", "school"], idPattern: "workforce" } },
  { id: "lk-lesson-dust-you-cannot-see", theme: "air and dust on a building site", station: "k12-sil-dust-you-cannot-see-at-a-building-site", programme: "k12-science", band: "lower secondary", minutes: 3,
    programmeWhy: "Learners run a fair test with a model drill and its dust shroud, follow the breeze across a building site and name the habits a drilling crew uses to keep fine dust out of the air (console SILICA).",
    title: "Dust You Cannot See", trade: "Concrete drilling crews",
    tradeLine: "A drilling crew catches dust at the drill with a shroud, a vacuum or water, so nobody breathes it.",
    steps: ["Look at the dust that lands on a dark card.", "A shroud on the drill pulls most of that dust away.", "Standing where the breeze comes from keeps the rest off you."],
    check: lkQ("How does a drilling crew keep dust out of the air?", ["Catch it at the drill", "Blow it away", "Sweep it with a dry brush"], 0, "Catching dust where it is made stops it before anyone can breathe it."),
    anchors: [lkA("lc-calcasieu-channel", "lcc-tank-foundation")],
    character: { kinds: ["construction"] } },
];

export function lkLessons() { return LK_LESSONS; }
export function lkLessonById(id) { return LK_LESSONS.find((l) => l.id === id || l.station === id || id?.startsWith?.(`${l.id}@`)) ?? null; }
export function lkStationHref(lesson, anchor = lesson.anchors[0]) {
  return `smartcity.html?sim=${encodeURIComponent(lesson.station)}&from=parishes&parish=${encodeURIComponent(anchor.map)}&site=${encodeURIComponent(anchor.site)}`;
}
/** The session id of a lesson at one anchor: the first fixed anchor keeps the plain id, every other place gets `@map/site`. */
export const lkAnchorLessonId = (lesson, a) => (a.map === lesson.anchors[0].map && a.site === lesson.anchors[0].site ? lesson.id : `${lesson.id}@${a.map}/${a.site}`);

/**
 * The places one lesson plays on one map, GUARDED: fixed anchors whose map and site exist; else, on a Louisiana map (by
 * region) with no fixed anchor for it, the first site whose kind (and id pattern, a regular expression, when set) matches the lesson's character.
 */
export function lkPlacesOn(lesson, parish) {
  if (!parish?.sites) return [];
  const fixed = lesson.anchors.filter((a) => a.map === parish.id && parish.sites.some((s) => s.id === a.site));
  if (fixed.length || lesson.anchors.some((a) => a.map === parish.id)) return fixed;
  if (!LK_REGIONS.test(String(parish.region ?? ""))) return [];
  const c = lesson.character ?? {};
  const s = parish.sites.find((x) => (c.kinds ?? []).includes(x.kind) && (!c.idPattern || new RegExp(c.idPattern).test(x.id)));
  return s ? [{ map: parish.id, site: s.id, byCharacter: true }] : [];
}

/** The lessons that start a SCHOLAR session on one map, in the raw shape scMountSession / scNormalise read. */
export function lkSessionLessons(parishId, opts = {}) {
  const find = "npParish" in opts ? opts.npParish : npParish;
  const parish = typeof find === "function" ? find(parishId) : null;
  const out = [];
  for (const l of LK_LESSONS) for (const a of lkPlacesOn(l, parish)) {
    out.push({ id: lkAnchorLessonId(l, a), title: l.title, k12: l.station, band: l.band, minutes: l.minutes, steps: l.steps, check: l.check,
      trade: l.trade, tradeLine: l.tradeLine, parish: a.map, site: a.site });
  }
  return out;
}

/** SCHOLAR's session hook at the lesson's anchor (`where` wins). A caller that passes `scStartSession: null` gets null. */
export function lkStartLesson(id, where = null, opts = {}) {
  const start = "scStartSession" in opts ? opts.scStartSession : scStartSession;
  const l = lkLessonById(id);
  if (!l) return null;
  const at = id.includes("@") ? id.split("@")[1].split("/") : [l.anchors[0].map, l.anchors[0].site];
  return start?.(id.includes("@") ? id : l.id, where ?? { world: "parishes", parish: at[0], site: at[1] }) ?? null;
}

/** A DEAN-assignable module (dnModules() shape: id, title, audience, lessons). */
export function lkModule() {
  return {
    id: "lk-louisiana-k12", title: "K-12 Louisiana: Coast, River, Energy, Flight, Boats and Trades", audience: "classroom", source: "LA-K12",
    lessons: LK_LESSONS.map((l) => ({ lessonId: l.id, station: l.station, band: l.band, minutes: l.minutes, theme: l.theme })),
  };
}
