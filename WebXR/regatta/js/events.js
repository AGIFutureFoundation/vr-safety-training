// Bay Regatta — the hosted-events calendar. Five original events, each run
// as a briefing (guest count read back, life jackets counted, muster point
// named, and the yacht-crew stations the briefing draws on) before the
// on-water part, and each paying reputation and credits into the SAME career
// ledger Bay World keeps (bayworld/js/career.js — imported, never forked), so
// a regatta day and a shift in the city add up in one place.
//
// No event has anything at stake but the result: the "regatta day" is raced for
// a place and a clean sheet, the credits are a plain score, and nothing is
// ever bought or staked. Every event, club-free and sponsor-free, is
// invented for this platform.
import { bwAwardQuestReward } from "../../bayworld/js/career.js";
import { rgCourseById } from "./courses.js";

/** Where a briefing's station link goes: the platform's own station, with `from=regatta` so the return is recognised. */
// Given this page's own path, `&return=<page>#site=<event id>` is the way home
// the runner's "Back to the Bay Regatta" button takes (docs/interop.md).
export function rgStationLink(stationId, { page = null, eventId = null } = {}) {
  const back = page ? `&return=${encodeURIComponent(`${page}${eventId ? `#site=${encodeURIComponent(eventId)}` : ""}`)}` : "";
  return `../smartcity/index.html?sim=${encodeURIComponent(stationId)}&from=regatta${back}`;
}

/**
 * `{ id, name, kind, day, hour, berth, course, guests, crew, musterPoint,
 * stations, reward, blurb }`. `berth` is the host quay (a Bay World site id),
 * `course` the courses.js id the on-water part runs, `stations` the yacht-crew
 * (`yc-`) stations the briefing is built from — every one a real station in
 * the catalog, which the checker holds them to. `day` is 0–6 from the start
 * of the season week, `hour` the start time on the day clock.
 */
export const RG_EVENTS = [
  { id: "rg-family-day-cruise", name: "Union Family Day Cruise", kind: "cruise", day: 0, hour: 10,
    berth: "island-yacht-harbor", course: "rg-estuary-sprint", guests: 24, crew: 4, musterPoint: "aft deck, by the life-ring rail",
    stations: ["yc-pre-departure-safety-briefing-and-guest-count", "yc-line-handling-and-docking-in-crosswind"],
    reward: { reputation: 12, credits: 60 },
    blurb: "A slow lap of the estuary for members' families: the guest count read back twice, a life jacket for every guest and the muster point shown before the lines come off." },
  { id: "rg-sunset-safety-cruise", name: "Sunset Safety Cruise", kind: "cruise", day: 2, hour: 18,
    berth: "north-marina-pier", course: "rg-outer-bay-loop", guests: 12, crew: 3, musterPoint: "flybridge ladder foot",
    stations: ["yc-man-overboard-recovery-drill", "yc-shore-power-connection-and-in-water-electrical-safety"],
    reward: { reputation: 14, credits: 70 },
    blurb: "Out past the channel at dusk with the navigation lights checked before departure and the recovery drill talked through on the way out." },
  { id: "rg-regatta-day", name: "Harbour Lantern Regatta Day", kind: "race", day: 4, hour: 11,
    berth: "north-marina-pier", course: "rg-north-channel-passage", guests: 6, crew: 3, musterPoint: "aft cockpit sole",
    stations: ["yc-engine-room-pre-start-and-bilge-check", "yc-line-handling-and-docking-in-crosswind"],
    reward: { reputation: 20, credits: 90 },
    blurb: "The fleet's own race day on the long course: engine-room checks before the start, every mark on its side, the give-way vessel keeping clear, and a clean docking to finish." },
  { id: "rg-crew-training-day", name: "Crew Training Day", kind: "training", day: 5, hour: 9,
    berth: "estuary-marina-boatyard", course: "rg-estuary-sprint", guests: 0, crew: 5, musterPoint: "swim platform steps",
    stations: ["yc-galley-fire-and-fixed-system", "yc-tender-launch-and-guest-transfer"],
    reward: { reputation: 10, credits: 50 },
    blurb: "No guests aboard: the crew rotate through the galley fire drill and a tender launch at the berth, then run the sprint course for boat handling." },
  { id: "rg-harbour-cleanup-flotilla", name: "Harbour Clean-up Flotilla", kind: "flotilla", day: 6, hour: 8,
    berth: "south-shoreline-marina", course: "rg-outer-bay-loop", guests: 16, crew: 4, musterPoint: "foredeck, forward of the windlass",
    stations: ["yc-fuel-dock-transfer-and-spill-kit", "yc-pre-departure-safety-briefing-and-guest-count"],
    reward: { reputation: 16, credits: 75 },
    blurb: "Volunteers aboard several yachts sweep the shoreline for drift debris: fuel-dock and spill-kit checks first, guest count and jackets, then the loop at cruising speed." },
];

/** The event with this id, or null. */
export function rgEventById(id) { return RG_EVENTS.find((e) => e.id === id) ?? null; }

/** The calendar in order of day and hour. */
export function rgCalendar() { return [...RG_EVENTS].sort((a, b) => a.day - b.day || a.hour - b.hour); }

/** Life jackets the briefing must count: one per person aboard plus a spare. */
export function rgLifeJacketsNeeded(event) { return (event.guests | 0) + (event.crew | 0) + 1; }

/** The briefing's checklist for an event — the items the learner answers before the lines come off. */
export function rgBriefingChecklist(event) {
  return [
    { id: "guests", text: `Read back the guest count (${event.guests} guest${event.guests === 1 ? "" : "s"} aboard, ${event.crew} crew).`, answer: event.guests },
    { id: "jackets", text: `Count life jackets: one per person aboard plus a spare (${rgLifeJacketsNeeded(event)}).`, answer: rgLifeJacketsNeeded(event) },
    { id: "muster", text: `Name the muster point: ${event.musterPoint}.`, answer: event.musterPoint },
    { id: "course", text: `Confirm the course: ${rgCourseById(event.course)?.name ?? event.course}.`, answer: event.course },
  ];
}

/**
 * Marks a briefing's answers: `{ guests, jackets, muster, course }`. The guest
 * count must be exact, the jackets at least the count needed, the muster
 * point and course the event's own. Returns `{ ok, wrong: [ids] }`.
 */
export function rgBriefingResult(event, answers = {}) {
  const wrong = [];
  if ((answers.guests | 0) !== (event.guests | 0)) wrong.push("guests");
  if ((answers.jackets | 0) < rgLifeJacketsNeeded(event)) wrong.push("jackets");
  if (String(answers.muster ?? "") !== event.musterPoint) wrong.push("muster");
  if (String(answers.course ?? "") !== event.course) wrong.push("course");
  return { ok: wrong.length === 0, wrong };
}

/**
 * Pays an event into Bay World's career ledger: the event's own reward, scaled
 * by the briefing (all or nothing) and the race score's stars (a third each,
 * with a floor so an attempt still logs), through bwAwardQuestReward() so the
 * toast and the total agree, with the host quay marked visited. Returns the
 * award career.js returns, plus the gains as decided here.
 */
export function rgAwardEvent(event, { briefingOk = true, score = null, storage } = {}) {
  const stars = score ? Math.max(0, Math.min(3, score.stars | 0)) : 3;
  const factor = (briefingOk ? 1 : 0.5) * (score ? Math.max(0.25, stars / 3) : 1);
  const reward = { reputation: Math.round(event.reward.reputation * factor), credits: Math.round(event.reward.credits * factor) };
  const award = bwAwardQuestReward(reward, { storage, siteId: event.berth, title: event.name });
  return { ...award, reward, stars, briefingOk };
}
