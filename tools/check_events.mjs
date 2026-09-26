/**
 * Random events (shared/events.js, docs/events.md): the seeded ambient
 * scheduler and the interrupt-timing jitter every SmartCiti.X station gets
 * for free, with no station file touched to get it.
 *
 *     node tools/check_events.mjs
 *
 * Held to rule 1 (an ambient beat changes the SCENE, never the PROCEDURE or
 * the SCORE) and rule 2 (everything is seeded, so an instructor's `?seed=`
 * replays the exact run) — see shared/events.js's own header for both.
 */
import { buildSuite, SMARTCITY_SIMS } from "./lib/headless.mjs";
import { SIMS_META } from "../WebXR/smartcity/js/sims-meta.js";

let failures = 0;
const note = (id, msg) => { console.log(`  ✗ ${id}: ${msg}`); failures += 1; };
const ok = (msg) => console.log(`  ✓ ${msg}`);

// ---- ten stations spanning distinct districts, all real sims this suite has ----
const byCategory = new Map();
for (const m of SIMS_META) {
  if (!byCategory.has(m.category) && SMARTCITY_SIMS.includes(m.id)) byCategory.set(m.category, m.id);
}
const PICK = [...byCategory.values()].slice(0, 10);
const PICK_DISTRICTS = new Set(PICK.map((id) => SIMS_META.find((m) => m.id === id)?.category));
if (PICK.length < 10) note("setup", `only found ${PICK.length} distinct districts to sample, wanted 10`);

// Three known two-role stations with no supportLine of their own (shared/
// crew.js's splitByRole succeeds on them — see tools/check_crew.mjs), loaded
// alongside the ten district picks only to prove the radio-call event can
// honestly draw a line from a station's crew split; none of the ten district
// picks happens to be a crew-split station.
const CREW_EXTRA = ["crane-yard", "trench-box", "confined-rescue"];

const constName = (id) => id.toUpperCase().replace(/-/g, "_");
const ALL_PICK = [...PICK, ...CREW_EXTRA];
const modules = [
  "shared/kit.js", "shared/fleet.js", "shared/equipment.js", "shared/toolkit.js", "shared/game.js",
  "shared/robot.js", "shared/robot-embodiment.js", "shared/eggs.js",
  "shared/weather.js", "shared/crew.js", "shared/events.js",
  "smartcity/js/citykit.js", "smartcity/js/gamify.js",
  ...ALL_PICK.map((id) => `smartcity/js/sims/${id}.js`),
];
const harness = `export const ROOMS = [${PICK.map((id) => `SIM_${constName(id)}`).join(", ")}];
export const CREW_ROOMS = [${CREW_EXTRA.map((id) => `SIM_${constName(id)}`).join(", ")}];
export { Session, THREE, WEATHER_KINDS };
export { eventsRng, shuffleSeeded, eventsFromQuery, eventsEnabled, varyInterruptTiming, planAmbientEvents, createEventScheduler };
export { splitByRole };`;

const suite = await buildSuite(modules, harness, "events-check");
const {
  ROOMS, CREW_ROOMS, Session, WEATHER_KINDS,
  eventsRng, eventsFromQuery, eventsEnabled, varyInterruptTiming, planAmbientEvents, createEventScheduler,
  splitByRole,
} = suite;

console.log(`Random events — ${ROOMS.length} stations across ${PICK_DISTRICTS.size} districts\n`);

// --------------------------------------------------------------- on/off gate

if (eventsFromQuery("?events=off") !== "off") note("gate", '?events=off did not parse as "off"');
if (eventsFromQuery("?events=on") !== "on") note("gate", '?events=on did not parse as "on"');
if (eventsFromQuery("") !== null) note("gate", "no ?events= param should read as unset, not a default");
if (eventsEnabled({ explicit: "off", isVariant: true, ladderLevel: 20 }) !== false) note("gate", "?events=off did not win over a variant/high ladder level");
if (eventsEnabled({ explicit: null, isVariant: false, ladderLevel: null }) !== false) note("gate", "the base run must default to events off");
if (eventsEnabled({ explicit: null, isVariant: true, ladderLevel: null }) !== true) note("gate", "an assessment variant must default to events on");
if (eventsEnabled({ explicit: null, isVariant: false, ladderLevel: 11 }) !== true) note("gate", "ladder level 11 must default to events on");
if (eventsEnabled({ explicit: null, isVariant: false, ladderLevel: 10 }) !== false) note("gate", "ladder level 10 must still default to events off");
if (eventsEnabled({ explicit: "on", instructorArmed: true }) !== false) note("gate", "an instructor-armed interruption must win even over an explicit ?events=on");
else ok("the on/off gate: query, ladder level 11+, assessment variants, and the instructor override all read correctly");

// ----------------------------------------------------- interrupt timing jitter

const withInterrupts = ROOMS.filter((r) => (r.interrupts ?? []).length);
if (!withInterrupts.length) note("timing", "none of the sampled stations declare an interruption to jitter");

/** Reconstruct exactly what varyInterruptTiming() should have computed, so
 *  the assertion is exact rather than a loose bound. */
function expectedDelays(room, seed) {
  const rng = eventsRng(`${room.id}:${seed}:events-timing`);
  return (room.interrupts ?? []).map((it) => {
    const factor = 1 + (rng() * 2 - 1) * 0.4;
    return Math.max(2, Math.round((Number(it.delay) || 3) * factor));
  });
}

let jitterChecked = 0, reorderedSeen = 0;
for (const room of withInterrupts) {
  for (const seed of [1, 2, "instructor-7"]) {
    const varied = varyInterruptTiming(room, { seed });
    if (varied === room) { note(`timing/${room.id}`, "a station with interrupts must get a new object, not the same reference"); continue; }
    if (varied.interrupts.length !== room.interrupts.length) { note(`timing/${room.id}`, "jitter changed how many interruptions the station has"); continue; }
    const expected = expectedDelays(room, seed);
    for (let i = 0; i < room.interrupts.length; i++) {
      jitterChecked += 1;
      const orig = room.interrupts[i], v = varied.interrupts[i];
      if (v.id !== orig.id && room.interrupts.length <= 2) note(`timing/${room.id}/${orig.id}`, "reordered an id it should not have (2 or fewer interruptions)");
      const found = varied.interrupts.find((x) => x.target === orig.target && x.alert === orig.alert);
      if (!found) { note(`timing/${room.id}/${orig.id}`, "lost an interruption in the jitter"); continue; }
      if (found.delay < 2) note(`timing/${room.id}/${orig.id}`, `delay ${found.delay} is under the 2s floor`);
      const lo = Math.max(2, Math.floor((orig.delay ?? 3) * 0.6) - 1);
      const hi = Math.ceil((orig.delay ?? 3) * 1.4) + 1;
      if (found.delay < lo || found.delay > hi) note(`timing/${room.id}/${orig.id}`, `delay ${found.delay} is outside ±40% of its authored ${orig.delay}`);
    }
    // Exact reproducibility: recomputing the same seed's expected delays must
    // match one of the varied delays each, position for position on the head
    // (unreordered) pair, and as a multiset for the rest.
    if (room.interrupts.length <= 2) {
      const gotDelays = varied.interrupts.map((it) => it.delay);
      if (JSON.stringify(gotDelays) !== JSON.stringify(expected)) note(`timing/${room.id}`, "the same seed did not reproduce the same delays");
    } else {
      const gotSorted = [...varied.interrupts.map((it) => it.delay)].sort((a, b) => a - b);
      const wantSorted = [...expected].sort((a, b) => a - b);
      if (JSON.stringify(gotSorted) !== JSON.stringify(wantSorted)) note(`timing/${room.id}`, "the same seed did not reproduce the same set of delays");
      if (varied.interrupts.slice(2).some((it, i) => it.after !== room.interrupts[2 + i].after)) reorderedSeen += 1;
      // Validity: nothing reassigned may answer with the target of the step
      // it now interrupts — the same rule tools/check_interrupts.mjs holds
      // every interruption to.
      for (const it of varied.interrupts) {
        const host = varied.steps.find((s) => s.id === it.after);
        if (!host) { note(`timing/${room.id}/${it.id}`, `reassigned to step "${it.after}" which does not exist`); continue; }
        if (host.target === it.target || (host.targets ?? []).includes(it.target)) {
          note(`timing/${room.id}/${it.id}`, "reassigned onto a step whose own target is this interruption's answer");
        }
      }
    }
    // Same seed, called again: identical result (rule 2).
    const again = varyInterruptTiming(room, { seed });
    if (JSON.stringify(again) !== JSON.stringify(varied)) note(`timing/${room.id}`, "varyInterruptTiming is not reproducible for the same seed");
  }
}
if (!failures) ok(`${jitterChecked} interruption-seed pairs jittered within ±40% of their authored delay, never under the 2s floor`);
if (reorderedSeen) ok(`${reorderedSeen} station-seed pairs with more than two interruptions reshuffled which of the extras lands on which step`);
else console.log(`  (none of the ${withInterrupts.length} sampled stations declares more than two interruptions — the current catalog tops out at two; see the synthetic fixture below for that path)`);

// No real station declares more than two interruptions today (the catalog
// tops out at two), so the ">2 extras get reshuffled" path is exercised on a
// small hand-built fixture instead — the same function, a case the real
// content just does not happen to reach yet.
{
  const fixture = {
    id: "fixture-4-interrupts",
    steps: [
      { id: "s1", target: "t1" }, { id: "s2", target: "t2" }, { id: "s3", target: "t3" },
      { id: "s4", target: "t4" }, { id: "s5", target: "t5" },
    ],
    interrupts: [
      { id: "i1", after: "s1", target: "a1", delay: 4, seconds: 12 },
      { id: "i2", after: "s2", target: "a2", delay: 5, seconds: 12 },
      { id: "i3", after: "s3", target: "a3", delay: 6, seconds: 12 },
      { id: "i4", after: "s4", target: "a4", delay: 7, seconds: 12 },
    ],
  };
  let fixtureReordered = false;
  for (let seed = 0; seed < 30 && !fixtureReordered; seed++) {
    const v = varyInterruptTiming(fixture, { seed });
    if (v.interrupts[0].after !== "s1" || v.interrupts[1].after !== "s2") { note("timing/fixture", "reshuffled one of the first two interruptions, which must stay put"); break; }
    if (v.interrupts[2].after !== fixture.interrupts[2].after || v.interrupts[3].after !== fixture.interrupts[3].after) fixtureReordered = true;
    for (const it of v.interrupts) {
      const host = fixture.steps.find((s) => s.id === it.after);
      if (!host || host.target === it.target) note("timing/fixture", `seed ${seed}: an interruption landed on a step whose own target is its answer`);
    }
  }
  if (fixtureReordered) ok("a 4-interruption fixture gets its extras (3rd and 4th) reshuffled among their own steps, on some seed, while the first two never move");
  else note("timing/fixture", "a 4-interruption fixture never had its extras reshuffled across 30 seeds — the reorder path looks dead");
}

// ---------------------------------------------------------------- ambient plan

const weatherKindsOutdoor = WEATHER_KINDS;
let ambientRuns = 0, sawWeather = false, sawVehicle = false, sawNoRoadStation = false;
for (const room of ROOMS) {
  const indoor = !!room.indoor;
  const hasRoad = !indoor; // the same rule app.js's ambientHasRoad() applies
  if (!hasRoad) sawNoRoadStation = true;
  for (const seed of [3, "seed-b"]) {
    ambientRuns += 1;
    let timeline;
    try {
      timeline = planAmbientEvents(room, {
        seed, parSeconds: room.parSeconds, weatherKinds: indoor ? [] : weatherKindsOutdoor,
        night: true, hasRoad, radioLine: "Radio check, standing by.",
      });
    } catch (e) { note(`ambient/${room.id}`, `planAmbientEvents threw: ${e.message}`); continue; }
    for (const ev of timeline) {
      if (!Number.isFinite(ev.at) || ev.at < 0) note(`ambient/${room.id}/${ev.kind}`, `"at" is not a sane number: ${ev.at}`);
      if (typeof ev.text !== "string" || !ev.text.trim()) note(`ambient/${room.id}/${ev.kind}`, "no text to log or show");
      if (ev.kind === "weather-shift") {
        sawWeather = true;
        if (indoor) note(`ambient/${room.id}`, "planned a weather shift for an indoor station");
        if (!WEATHER_KINDS.includes(ev.payload?.weatherKind)) note(`ambient/${room.id}/${ev.id}`, `weather kind "${ev.payload?.weatherKind}" is not one of shared/weather.js's WEATHER_KINDS`);
      }
      if (ev.kind === "vehicle-pass") {
        sawVehicle = true;
        if (!hasRoad) note(`ambient/${room.id}`, "planned a vehicle pass for a station with no road");
      }
      if (ev.kind === "mast-light" && indoor) note(`ambient/${room.id}`, "planned a mast-light flicker for an indoor station");
    }
    // Reproducible.
    const again = planAmbientEvents(room, {
      seed, parSeconds: room.parSeconds, weatherKinds: indoor ? [] : weatherKindsOutdoor,
      night: true, hasRoad, radioLine: "Radio check, standing by.",
    });
    if (JSON.stringify(again) !== JSON.stringify(timeline)) note(`ambient/${room.id}`, "the same seed did not reproduce the same ambient timeline");
  }
}
if (!sawWeather) note("ambient", "no outdoor station across the sample ever planned a weather-shift event");
if (!sawVehicle) note("ambient", "no station across the sample ever planned a vehicle-pass event");
if (!failures) ok(`${ambientRuns} station-seed timelines planned; every weather shift stayed inside WEATHER_KINDS and no indoor station got weather, a road vehicle or a mast flicker it cannot honestly show`);

// `?events=off` (enabled: false) must produce zero events, always.
for (const room of ROOMS.slice(0, 3)) {
  const sched = createEventScheduler(room, { enabled: false, seed: 5, parSeconds: room.parSeconds, weatherKinds: WEATHER_KINDS, night: true, hasRoad: true, radioLine: "x" });
  if (sched.timeline.length) note(`off/${room.id}`, "a disabled scheduler still built a timeline");
  const fakeSession = { elapsed: 0, finished: false, activeInterrupt: null };
  for (let t = 0; t < 400; t += 1) { fakeSession.elapsed = t; if (sched.tick(fakeSession)) note(`off/${room.id}`, "a disabled scheduler fired an event"); }
}
if (!failures) ok("?events=off (enabled: false) yields zero events, over a long simulated run");

// ------------------------------------------------------ radio-call, real crew

let sawRadioFromCrew = 0;
for (const room of [...ROOMS, ...CREW_ROOMS]) {
  if (room.supportLine) continue; // already covered by the plain supportLine path
  let split;
  try { split = splitByRole(room); } catch (e) { note(`crew/${room.id}`, `splitByRole threw: ${e.message}`); continue; }
  if (!split.split) continue;
  const line = split.roles[1]?.post ?? split.roles[0]?.post ?? null;
  if (typeof line !== "string" || !line.trim()) continue;
  sawRadioFromCrew += 1;
  const timeline = planAmbientEvents(room, { seed: 9, parSeconds: room.parSeconds, weatherKinds: [], hasRoad: false, radioLine: line });
  const call = timeline.find((e) => e.kind === "radio-call");
  if (call && !call.text.includes(line)) note(`crew/${room.id}`, "a radio-call event's text does not carry the real line it was given");
}
if (sawRadioFromCrew) ok(`${sawRadioFromCrew} station(s) with no supportLine still had a real crew-post line (shared/crew.js) available for a radio call, and it showed up verbatim`);
else note("crew", "no station in the sample — including two known crew-split stations — ever produced a crew-post radio line");

// ----------------------------------------------------------- rule 1, headless

let hazardTouched = 0, stepTouched = 0, nanSeen = 0, exceptions = 0;
for (const room of ROOMS) {
  for (const seed of [11, "z"]) {
    let session;
    try { session = new Session(room, {}); session.start(); } catch (e) { note(`engine/${room.id}`, `Session could not start: ${e.message}`); continue; }
    const startStep = session.step, startIndex = session.index;
    const sched = createEventScheduler(room, {
      seed, enabled: true, parSeconds: room.parSeconds,
      weatherKinds: room.indoor ? [] : WEATHER_KINDS, night: seed === "z",
      hasRoad: !room.indoor, radioLine: room.supportLine ?? "Radio check, standing by.",
    });
    // Advance the clock directly rather than through session.tick(dt), so the
    // station's OWN declared interruptions (a separate, already-checked
    // system — see tools/check_interrupts.mjs) never fire and confound what
    // this loop is actually testing: the ambient scheduler alone.
    try {
      for (let t = 0; t <= (room.parSeconds ?? 180) + 20; t += 1) {
        session.elapsed = t;
        const fired = sched.tick(session);
        if (fired) {
          if (!Number.isFinite(fired.at)) nanSeen += 1;
          if (fired.payload && Object.values(fired.payload).some((v) => typeof v === "number" && !Number.isFinite(v))) nanSeen += 1;
        }
      }
    } catch (e) { exceptions += 1; note(`engine/${room.id}`, `the scheduler threw mid-run: ${e.message}`); }
    if (session.step !== startStep || session.index !== startIndex) stepTouched += 1;
    if (session.hazardHits !== 0 || session.score !== 0) hazardTouched += 1;
    // Gating: with an interruption "live", nothing may fire even well past due.
    const gated = createEventScheduler(room, { seed: 1, enabled: true, parSeconds: 30, weatherKinds: WEATHER_KINDS, night: true, hasRoad: true, radioLine: "x" });
    const busy = { elapsed: 0, finished: false, activeInterrupt: { id: "x" } };
    for (let t = 0; t < 60; t += 1) { busy.elapsed = t; if (gated.tick(busy)) note(`engine/${room.id}`, "fired an ambient event while the session had a live interruption"); }
    const finished = { elapsed: 0, finished: true, activeInterrupt: null };
    for (let t = 0; t < 60; t += 1) { finished.elapsed = t; if (gated.tick(finished)) note(`engine/${room.id}`, "fired an ambient event after the session had finished"); }
  }
}
if (stepTouched) note("engine", `${stepTouched} run(s) had their step or index move without the learner doing anything — the ambient scheduler touched the procedure`);
if (hazardTouched) note("engine", `${hazardTouched} run(s) picked up score or a hazard hit from ambient events alone`);
if (nanSeen) note("engine", `${nanSeen} fired event(s) carried a non-finite number`);
if (!exceptions && !stepTouched && !hazardTouched && !nanSeen) {
  ok(`every ambient event ran headless on ${ROOMS.length} stations across ${PICK_DISTRICTS.size} districts with no exception, no NaN, and the procedure and score both untouched`);
}

console.log(failures
  ? `\n${failures} random-events problem(s) found.`
  : "\nAll random-events checks pass.");
process.exit(failures ? 1 : 0);
