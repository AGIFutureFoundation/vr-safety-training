/**
 * Headless checks for the Bay Regatta (WebXR/regatta) and the yacht fleet
 * (WebXR/shared/yacht-fleet.js): a fleet of twelve individual motor yachts,
 * three courses on Bay World's water, a race engine and a hosted-events
 * calendar that pays into Bay World's own career ledger.
 *
 *     node tools/check_regatta.mjs
 *
 * What is proved here:
 *
 *  1. **The fleet is sound.** Twelve yachts, ids and names unique, each a
 *     motorYacht variant (FLEET_BUDGET unchanged) with a home berth that is a
 *     real shared/bayworld-data.js site, a berth slot that floats on water
 *     inside BAY_BOUNDS, a length inside the safe range, a crew and events
 *     that exist; and every one builds behind the stub three.js.
 *  2. **The courses are on the water.** Three courses, every mark, line end,
 *     no-wake centre and dock afloat and inside BAY_BOUNDS, every leg afloat
 *     by sampling, and regattaCourseAt() answers for each kind of point.
 *  3. **A race is walked to the finish** on every course: the learner's yacht
 *     on the autopilot rounds every mark on its side, holds the no-wake zone,
 *     keeps clear at crossings and docks clean, so the score passes with
 *     three stars and a place; a yacht that holds full throttle through the
 *     harbour mouth is caught by the no-wake check. Wind and fog follow the
 *     weather kind.
 *  4. **The events reference real stations** (`yc-` ids in the catalog),
 *     real berths, real courses and rostered yachts; the briefing marks
 *     right and wrong answers; and an award lands in the SAME career ledger
 *     Bay World keeps (career.js's storage key), marking the host quay
 *     visited.
 *  5. **The app is wired**: bundled, in the combined dist folder, linked from
 *     the homepage, from Bay World's map and its yacht-harbour job board, and
 *     this checker runs from check_all.mjs.
 *  6. **The content rules hold**: no gambling, no violence, no right-of-way
 *     clause number, no third-party name in the regatta's own files.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSuite } from "./lib/headless.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const REGATTA = join(WEBXR, "regatta");

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

console.log("Bay Regatta — self-test\n");

const S = await buildSuite([
  "shared/weather.js", "shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js",
  "shared/records.js", "shared/a11y.js", "shared/game.js", "shared/competency.js", "shared/ladder-milestones-data.js", "shared/ladder.js", "shared/tracking.js",
  "shared/bayworld-data.js", "shared/yacht-fleet.js", "bayworld/js/career.js",
  "regatta/js/courses.js", "regatta/js/race.js", "regatta/js/events.js",
  "shared/props.js", "smartcity/js/citykit.js", "shared/bayworld.js", "regatta/js/world.js",
], `export { THREE, FLEET_BUDGET, BAY_SITES, BAY_BOUNDS, YACHT_FLEET, RG_BERTHS, RG_YACHT_LENGTH_RANGE, yachtById, rgYachtBerthSite, rgYachtBerthPose, rgYachtsForEvent, buildYacht,
  RG_COURSES, RG_WATER, rgOnWater, TX_BAY_WATER, txWaterTopAt, txGroundMaxAt, txGroundHeight, rgCourseById, rgCourseWaypoints, regattaCourseAt, rgLegOnWater, rgWorldToMap, rgCourseToMap,
  rgCreateRace, rgStepRace, rgAutoHelm, rgScoreRace, rgLearner, rgWindFor, rgMarkVisibility, rgGiveWayDuty, rgTargetFor,
  RG_EVENTS, rgEventById, rgCalendar, rgBriefingChecklist, rgBriefingResult, rgAwardEvent, rgLifeJacketsNeeded, rgStationLink, bwCareerState,
  rgBuildWorld, txGroundSurfaceAt };`, "regatta");

const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
const STATION_IDS = new Set((catalog.stations ?? []).map((s) => s.id));
const SITE_IDS = new Set(S.BAY_SITES.map((s) => s.id));
const inBounds = (x, z) => x >= S.BAY_BOUNDS.minX && x <= S.BAY_BOUNDS.maxX && z >= S.BAY_BOUNDS.minZ && z <= S.BAY_BOUNDS.maxZ;

// ------------------------------------------------------------- 1. the fleet

await check("twelve yachts, ids and names unique, each a real berth, a floating slot, a safe length, a crew and real events", () => {
  eq(S.YACHT_FLEET.length, 12, "fleet size");
  eq(new Set(S.YACHT_FLEET.map((y) => y.id)).size, 12, "yacht ids must be unique");
  eq(new Set(S.YACHT_FLEET.map((y) => y.name)).size, 12, "yacht names must be unique");
  const eventIds = new Set(S.RG_EVENTS.map((e) => e.id));
  const [lo, hi] = S.RG_YACHT_LENGTH_RANGE;
  for (const y of S.YACHT_FLEET) {
    assert(/^rg-/.test(y.id), `${y.id} is not rg- prefixed`);
    assert(SITE_IDS.has(y.berth), `${y.id}: berth "${y.berth}" is not a shared/bayworld-data.js site`);
    assert(S.RG_BERTHS[y.berth], `${y.id}: berth "${y.berth}" has no water slot row`);
    const pose = S.rgYachtBerthPose(y);
    assert(pose && inBounds(pose.x, pose.z) && S.rgOnWater(pose.x, pose.z), `${y.id}: berth slot (${pose?.x}, ${pose?.z}) is not afloat inside BAY_BOUNDS`);
    assert(y.length >= lo && y.length <= hi, `${y.id}: length ${y.length} outside [${lo}, ${hi}]`);
    assert(["open", "hardtop"].includes(y.flybridge), `${y.id}: flybridge "${y.flybridge}"`);
    assert(Array.isArray(y.crew) && y.crew.length >= 2 && y.crew.includes("skipper"), `${y.id}: crew must include a skipper`);
    assert(y.events.length >= 1 && y.events.every((e) => eventIds.has(e)), `${y.id}: events ${JSON.stringify(y.events)} must all be RG_EVENTS ids`);
    for (const k of ["hull", "trim", "burgee"]) assert(Number.isInteger(y[k]), `${y.id}: ${k} must be a hex colour`);
    assert(S.rgYachtBerthSite(y)?.id === y.berth, `${y.id}: rgYachtBerthSite`);
  }
  const berths = new Set(S.YACHT_FLEET.map((y) => y.berth));
  eq(berths.size, 4, "the fleet must be spread over the four marinas");
  const slots = new Set(S.YACHT_FLEET.map((y) => `${y.berth}:${y.slot}`));
  eq(slots.size, 12, "two yachts share a berth slot");
  eq(S.yachtById("rg-saltmarsh-heron")?.name, "Saltmarsh Heron", "yachtById");
  eq(S.yachtById("nope"), null, "yachtById of an unknown id");
});

await check("every yacht builds as a motorYacht variant, scaled to its length, named on the transom, with FLEET_BUDGET untouched", () => {
  eq(S.FLEET_BUDGET.motorYacht.meshes, 35, "FLEET_BUDGET.motorYacht must not change");
  const baseline = new S.THREE.Group();
  for (const y of S.YACHT_FLEET) {
    const g = S.buildYacht(baseline, y.id, 0, -1.2, 0, 0.5);
    eq(g.userData.kind, "motorYacht", `${y.id} is not a motorYacht build`);
    eq(g.userData.yacht?.id, y.id, `${y.id}: userData.yacht`);
    assert(Math.abs(g.scale.x - y.length) < 1e-9 && g.scale.x === g.scale.y && g.scale.y === g.scale.z, `${y.id}: not uniformly scaled to its length`);
    assert(g.userData.parts?.helm && g.userData.parts?.navLights, `${y.id}: the motorYacht parts are missing`);
    let boards = 0; g.traverse((o) => { if (o.isMesh && o.material?.userData?.fleetCanvas === `yacht|name|${y.id}`) boards += 1; });
    eq(boards, 1, `${y.id}: transom name board`);
    eq(g.rotation.y, 0.5, `${y.id}: heading`);
  }
  let threw = false; try { S.buildYacht(baseline, "not-a-yacht", 0, 0, 0); } catch { threw = true; }
  assert(threw, "buildYacht must refuse an unknown id");
});

// ------------------------------------------------------------ 2. the courses

await check("three courses, every point afloat inside BAY_BOUNDS and every leg on water", () => {
  eq(S.RG_COURSES.length, 3, "course count");
  eq(new Set(S.RG_COURSES.map((c) => c.id)).size, 3, "course ids unique");
  eq(new Set(S.RG_COURSES.map((c) => c.name)).size, 3, "course names unique");
  eq(S.RG_WATER.length, 4, "the water slabs mirror shared/bayworld.js's four buildWater() calls");
  for (const c of S.RG_COURSES) {
    assert(c.marks.length >= 4, `${c.id}: fewer than four marks`);
    eq(new Set(c.marks.map((m) => m.id)).size, c.marks.length, `${c.id}: mark ids unique`);
    for (const m of c.marks) assert(["port", "starboard"].includes(m.side) && S.rgOnWater(m.x, m.z), `${c.id}/${m.id}: not afloat or no side`);
    for (const p of [c.start.a, c.start.b]) assert(S.rgOnWater(p[0], p[1]), `${c.id}: start line end (${p}) is ashore`);
    assert(S.rgOnWater(c.noWake.x, c.noWake.z) && c.noWake.cap > 0 && c.noWake.r > 0, `${c.id}: no-wake zone`);
    assert(S.rgOnWater(c.dock.x, c.dock.z), `${c.id}: dock ashore`);
    assert(Math.hypot(c.dock.x - c.noWake.x, c.dock.z - c.noWake.z) <= c.noWake.r, `${c.id}: the dock must sit inside the harbour-mouth no-wake zone`);
    const wp = S.rgCourseWaypoints(c);
    for (let i = 1; i < wp.length; i++) assert(S.rgLegOnWater(wp[i - 1][0], wp[i - 1][1], wp[i][0], wp[i][1]), `${c.id}: leg ${i} crosses the shore`);
    for (const p of wp) assert(inBounds(p[0], p[1]), `${c.id}: waypoint outside BAY_BOUNDS`);
    const m0 = c.marks[0];
    eq(S.regattaCourseAt(c, m0.x + 5, m0.z).kind, "mark", `${c.id}: regattaCourseAt at a mark`);
    eq(S.regattaCourseAt(c, c.dock.x, c.dock.z).kind, "dock", `${c.id}: regattaCourseAt at the dock`);
    eq(S.regattaCourseAt(c, c.start.a[0], c.start.a[1]).kind, "line", `${c.id}: regattaCourseAt on the line`);
    eq(S.regattaCourseAt(c, 0, 0).kind, "shore", `${c.id}: regattaCourseAt downtown is ashore`);
    const toMap = S.rgCourseToMap(c, 240);
    for (const p of wp) { const q = toMap(p[0], p[1]); assert(q.x >= 0 && q.x <= 240 && q.y >= 0 && q.y <= 240, `${c.id}: course card point off the canvas`); }
    const w = S.rgWorldToMap(m0.x, m0.z, 512);
    assert(w.x >= 0 && w.x <= 512 && w.y >= 0 && w.y <= 512, `${c.id}: world map point off the canvas`);
  }
  assert(!S.rgOnWater(0, 0) && !S.rgOnWater(5000, 0) && S.rgOnWater(-900, 450), "rgOnWater sanity");
  eq(S.rgCourseById("nope"), null, "rgCourseById of an unknown id");
});

await check("a water surface covers every start line, mark, dock and berth, above any ground there", () => {
  // Bay World's terrain once buried every water slab (bayHeight() never goes
  // below 0 m, the slabs sit at -0.4 m): the fleet raced on turf. The built
  // ground now carves under TX_BAY_WATER; this holds the pair together.
  for (let i = 0; i < S.RG_WATER.length; i++) {
    eq(JSON.stringify(S.TX_BAY_WATER[i].slice(0, 4)), JSON.stringify(S.RG_WATER[i]), `RG_WATER[${i}] must mirror shared/bayworld-data.js's TX_BAY_WATER[${i}]`);
  }
  const afloat = (x, z, what) => {
    const top = S.txWaterTopAt(x, z), ground = S.txGroundMaxAt(x, z);
    assert(top !== null, `${what} (${x}, ${z}): no water surface is built there`);
    assert(top > ground + 0.2, `${what} (${x}, ${z}): water top ${top} m does not sit above the ground (up to ${ground.toFixed(2)} m) there`);
  };
  for (const c of S.RG_COURSES) {
    const [a, b] = [c.start.a, c.start.b];
    afloat(a[0], a[1], `${c.id} start pin A`); afloat(b[0], b[1], `${c.id} start pin B`);
    afloat((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, `${c.id} start line`);
    for (const m of c.marks) afloat(m.x, m.z, `${c.id}/${m.id}`);
    afloat(c.dock.x, c.dock.z, `${c.id} dock`);
    const wp = S.rgCourseWaypoints(c);
    for (let i = 1; i < wp.length; i++) for (let t = 0; t <= 1; t += 0.1) afloat(wp[i - 1][0] + (wp[i][0] - wp[i - 1][0]) * t, wp[i - 1][1] + (wp[i][1] - wp[i - 1][1]) * t, `${c.id} leg ${i}`);
  }
  for (const y of S.YACHT_FLEET) { const p = S.rgYachtBerthPose(y); afloat(p.x, p.z, `${y.id} berth`); }
  // Every Bay World water body, the lake included, reads as water at its centre.
  for (const [x, z] of S.TX_BAY_WATER) afloat(x, z, "water body centre");
  assert(S.txGroundHeight(0, 0) >= 0, "downtown ground must stay dry");
});

await check("on every course the learner's yacht floats at the start line: boot-top at the water, sheer above it, keel clear of the ground", () => {
  // The race view once showed a sky-blue lower half with no hull: the
  // renderer threw mid-frame on a cloned texture's JSON-copied bump map
  // (fixed in textures.js paintedMat() and bayworld.js txBayTiled()). This
  // holds the other half of "the yacht floats on the water": the placed
  // hull against the built water surface at the start line.
  const root = new S.THREE.Group();
  const world = S.rgBuildWorld(root, S.THREE, { detail: "low" });
  for (const c of S.RG_COURSES) {
    const state = S.rgCreateRace(c.id, "rg-saltmarsh-heron", { weather: "clear" });
    const me = S.rgLearner(state);
    const mesh = world.yachts[me.id];
    assert(mesh, `${c.id}: the learner's yacht was not built`);
    world.rgPlaceYacht(mesh, me, 0);
    const top = S.txWaterTopAt(me.x, me.z);
    assert(top !== null, `${c.id}: no water surface under the learner's yacht at the start (${me.x.toFixed(1)}, ${me.z.toFixed(1)})`);
    const k = mesh.userData.lengthScale ?? 1, draft = mesh.userData.draft ?? 1.2 * k;
    const bootTop = mesh.position.y + draft, sheer = mesh.position.y + 2.4 * k;
    assert(Math.abs(bootTop - top) <= 0.2, `${c.id}: boot-top at ${bootTop.toFixed(2)} m, the water top at ${top.toFixed(2)} m — the hull is ${bootTop < top ? "sunk" : "flying"}`);
    assert(sheer >= top + 0.5, `${c.id}: the sheer (${sheer.toFixed(2)} m) does not stand above the water (${top.toFixed(2)} m)`);
    assert(mesh.position.y > S.txGroundSurfaceAt(me.x, me.z), `${c.id}: the keel (${mesh.position.y.toFixed(2)} m) is aground`);
  }
});

// --------------------------------------------------------------- 3. the race

function walkRace(courseId, opts = {}, helm = null, limit = 4000) {
  const state = S.rgCreateRace(courseId, opts.yacht ?? "rg-saltmarsh-heron", opts);
  const me = S.rgLearner(state);
  const dt = 0.1;
  while (!me.finished && state.t < limit) S.rgStepRace(state, helm ? helm(state, me) : S.rgAutoHelm(state, me), dt);
  return state;
}

for (const c of S.RG_COURSES) {
  await check(`a headless race on ${c.name} is walked to the finish: every mark on its side, no-wake held, give-way kept, docked clean`, () => {
    const state = walkRace(c.id, { weather: "overcast" });
    const score = S.rgScoreRace(state);
    assert(score.finished, `the learner's yacht never finished (t=${state.t.toFixed(0)}s, next=${S.rgLearner(state).next})`);
    eq(score.marksOk, score.marksTotal, `${c.id}: marks rounded on the correct side`);
    assert(score.noWakeOk, `${c.id}: no-wake zone violated ${score.noWakeViolations} time(s)`);
    assert(score.giveWayOk, `${c.id}: give-way violated ${score.giveWayViolations} time(s)`);
    assert(score.dockingOk, `${c.id}: docking was not clean (${JSON.stringify(S.rgLearner(state).docking)})`);
    eq(score.stars, 3, `${c.id}: stars`);
    assert(score.passed, `${c.id}: passed`);
    assert(Number.isFinite(score.time) && score.time > 60, `${c.id}: finish time ${score.time}`);
    assert(score.place >= 1 && score.place <= state.boats.length, `${c.id}: place ${score.place}`);
    eq(score.fleet, 12, `${c.id}: the whole fleet races`);
    assert(state.finishedOrder.length >= 3, `${c.id}: the AI fleet did not race (${state.finishedOrder.length} across the line)`);
    for (const b of state.boats) assert(S.rgOnWater(b.x, b.z), `${c.id}: ${b.id} ended ashore`);
  });
}

await check("holding full throttle through the harbour mouth is caught by the no-wake check, and a skipped mark fails the marks", () => {
  const c = S.RG_COURSES[0];
  const state = S.rgCreateRace(c.id, "rg-quiet-fathom", { weather: "clear" });
  const me = S.rgLearner(state);
  for (let i = 0; i < 400; i++) S.rgStepRace(state, { throttle: 1, rudder: 0 }, 0.1);
  assert(state.noWake.violations >= 1, "full throttle inside the no-wake zone was not flagged");
  assert(!S.rgScoreRace(state).noWakeOk, "the score should show the no-wake check failed");
  // A helm that ignores the first mark entirely and steers for the second.
  const skip = walkRace(c.id, { weather: "clear" }, (st, boat) => {
    if (boat.next === 0) { boat.next = 1; boat.roundings.push({ mark: c.marks[0].id, side: null, ok: false }); boat.missed += 1; }
    return S.rgAutoHelm(st, boat);
  });
  const sc = S.rgScoreRace(skip);
  assert(sc.finished && sc.marksOk === sc.marksTotal - 1 && !sc.passed && sc.stars < 3, `a skipped mark must cost the pass: ${JSON.stringify(sc)}`);
});

await check("wind and fog follow the weather: more wind in a blow, shorter mark visibility in fog, and the give-way duty reads starboard crossings", () => {
  assert(S.rgWindFor("wind").speed > S.rgWindFor("clear").speed, "a windy day must blow harder than a clear one");
  assert(S.rgWindFor("storm").speed > S.rgWindFor("wind").speed, "a storm must blow harder than wind");
  assert(S.rgMarkVisibility("fog") < S.rgMarkVisibility("overcast") && S.rgMarkVisibility("overcast") < S.rgMarkVisibility("clear"), "fog must shorten mark visibility");
  const state = S.rgCreateRace(S.RG_COURSES[1].id, "rg-saltmarsh-heron", { fleet: ["rg-saltmarsh-heron", "rg-quiet-fathom"] });
  const [me, other] = state.boats;
  me.x = 0; me.z = 0; me.heading = 0; me.speed = 5;
  other.x = -30; other.z = 30; other.heading = Math.PI / 2; other.speed = 5;      // crossing from starboard, closing
  eq(S.rgGiveWayDuty(state, me)?.id, other.id, "a yacht crossing from starboard makes this one the give-way vessel");
  other.x = 30;                                                                   // now on the port bow: stand on
  eq(S.rgGiveWayDuty(state, me), null, "a yacht on the port bow leaves this one the stand-on vessel");
});

// -------------------------------------------------------------- 4. events

await check("five hosted events reference real yacht-crew stations, real berths, real courses and rostered yachts", () => {
  eq(S.RG_EVENTS.length, 5, "event count");
  eq(new Set(S.RG_EVENTS.map((e) => e.id)).size, 5, "event ids unique");
  const kinds = new Set(S.RG_EVENTS.map((e) => e.kind));
  assert(kinds.has("race") && kinds.has("cruise") && kinds.has("training") && kinds.has("flotilla"), "the calendar needs a race, cruises, a training day and a flotilla");
  for (const e of S.RG_EVENTS) {
    assert(e.stations.length >= 2, `${e.id}: fewer than two briefing stations`);
    for (const s of e.stations) assert(/^yc-/.test(s) && STATION_IDS.has(s), `${e.id}: station "${s}" is not a yc- station in the catalog`);
    assert(SITE_IDS.has(e.berth) && S.RG_BERTHS[e.berth], `${e.id}: berth "${e.berth}"`);
    assert(S.rgCourseById(e.course), `${e.id}: course "${e.course}"`);
    assert(S.rgYachtsForEvent(e.id).length >= 1, `${e.id}: no yacht is rostered`);
    assert(e.reward.reputation > 0 && e.reward.credits > 0, `${e.id}: reward`);
    assert(e.day >= 0 && e.day <= 6 && e.hour >= 0 && e.hour < 24, `${e.id}: calendar slot`);
    assert(S.rgStationLink(e.stations[0]).includes(`sim=${e.stations[0]}`) && S.rgStationLink(e.stations[0]).includes("from=regatta"), `${e.id}: station link`);
  }
  const cal = S.rgCalendar();
  for (let i = 1; i < cal.length; i++) assert(cal[i - 1].day * 24 + cal[i - 1].hour <= cal[i].day * 24 + cal[i].hour, "the calendar is out of order");
  eq(S.rgEventById("rg-regatta-day")?.kind, "race", "rgEventById");
});

await check("a briefing marks right and wrong answers, and an award lands in Bay World's own career ledger", () => {
  const e = S.rgEventById("rg-family-day-cruise");
  const items = S.rgBriefingChecklist(e);
  eq(items.length, 4, "briefing items");
  eq(S.rgLifeJacketsNeeded(e), e.guests + e.crew + 1, "one jacket per person plus a spare");
  assert(S.rgBriefingResult(e, { guests: e.guests, jackets: e.guests + e.crew + 1, muster: e.musterPoint, course: e.course }).ok, "a correct briefing must pass");
  const bad = S.rgBriefingResult(e, { guests: e.guests - 1, jackets: 2, muster: e.musterPoint, course: e.course });
  assert(!bad.ok && bad.wrong.includes("guests") && bad.wrong.includes("jackets"), "a wrong guest count and too few jackets must both be flagged");
  const storage = fakeStorage();
  const before = S.bwCareerState(storage);
  eq(before.reputation, 0, "a fresh ledger");
  const award = S.rgAwardEvent(e, { briefingOk: true, score: { stars: 3 }, storage });
  eq(award.reward.reputation, e.reward.reputation, "a three-star run pays the full reward");
  const after = S.bwCareerState(storage);
  eq(after.reputation, e.reward.reputation, "reputation must land in the shared ledger");
  eq(after.credits, e.reward.credits, "credits must land in the shared ledger");
  assert(after.visitedSites.includes(e.berth), "the host quay must read as visited in Bay World");
  assert(storage.getItem("bayworld-career-v1"), "the award must be stored under Bay World's own career key");
  const half = S.rgAwardEvent(e, { briefingOk: false, score: { stars: 3 }, storage });
  eq(half.reward.reputation, Math.round(e.reward.reputation / 2), "a failed briefing halves the reward");
  const poor = S.rgAwardEvent(e, { briefingOk: true, score: { stars: 0 }, storage });
  assert(poor.reward.reputation > 0 && poor.reward.reputation < e.reward.reputation, "an attempt still logs something, never the full reward");
});

// -------------------------------------------------------------- 5. wiring

await check("the regatta is bundled with every module, in the combined dist folder, linked from the homepage, Bay World's map and the yacht-harbour job board, and check_all runs this", () => {
  const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
  const block = /"regatta":\s*\{[\s\S]*?"modules":\s*\[([\s\S]*?)\]/.exec(bundler)?.[1] ?? "";
  const bundled = [...block.matchAll(/(SHARED|WEBXR)\s*\/\s*"([^"]+)"/g)].map((m) => (m[1] === "SHARED" ? `shared/${m[2]}` : m[2]));
  assert(bundled.length > 0, 'tools/bundle_webxr.py has no "regatta" app');
  for (const f of ["courses.js", "events.js", "race.js", "world.js", "app.js"]) assert(bundled.includes(`regatta/js/${f}`), `regatta/js/${f} is not in the bundle`);
  for (const f of ["shared/yacht-fleet.js", "shared/fleet.js", "shared/weather.js", "shared/bayworld-data.js", "shared/bayworld.js", "bayworld/js/career.js", "shared/tracking.js"]) assert(bundled.includes(f), `${f} is not in the regatta bundle`);
  assert(/"regatta":\s*"regatta\.html"/.test(bundler), "regatta.html is not copied into the combined WebXR/dist folder");
  assert(existsSync(join(REGATTA, "regatta.html")), "WebXR/regatta/regatta.html is missing");
  const distPath = join(REGATTA, "dist", "regatta.html");
  assert(existsSync(distPath), "WebXR/regatta/dist/regatta.html has not been built — run python3 tools/bundle_webxr.py");
  const dist = readFileSync(distPath, "utf8");
  assert(dist.includes("YACHT_FLEET") && dist.includes("RG_COURSES") && dist.includes("rgStepRace") && dist.includes("RG_EVENTS") && dist.includes("bwAwardQuestReward"), "WebXR/regatta/dist/regatta.html is stale — run python3 tools/bundle_webxr.py");
  const external = [...dist.matchAll(/<(?:script|link|img|audio|video|source)\b[^>]*>/g)].map((m) => m[0])
    .filter((tag) => !/rel="preconnect"/.test(tag))
    .map((tag) => /(?:src|href)="(https?:[^"]+)"/.exec(tag)?.[1]).filter(Boolean)
    .filter((u) => !/fonts\.(googleapis|gstatic)\.com/.test(u));
  assert(external.every((u) => u.startsWith("https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/")), `the bundle loads an unexpected external asset: ${external.join(", ")}`);
  assert(existsSync(join(WEBXR, "dist", "regatta.html")), "WebXR/dist/regatta.html is missing — run python3 tools/bundle_webxr.py");
  const page = readFileSync(join(REGATTA, "regatta.html"), "utf8");
  assert(/class="home-chip"/.test(page) && /href="\.\.\/index\.html"/.test(page), "regatta.html has no Home chip");
  assert(/type="module" src="\.\/js\/app\.js"/.test(page), "regatta.html does not load js/app.js as a module");
  const app = readFileSync(join(REGATTA, "js", "app.js"), "utf8");
  assert(/addEventListener\("keydown"/.test(app) && /pointerdown|tcMountTouch\(/.test(app) && /createGamepad\(/.test(app), "app.js lacks keyboard, touch or gamepad wiring");
  const home = readFileSync(join(WEBXR, "index.html"), "utf8"), flat = readFileSync(join(WEBXR, "home.html"), "utf8");
  assert(home.includes('href="regatta/regatta.html"') && home.includes("Bay Regatta"), "WebXR/index.html has no Bay Regatta card");
  assert(flat.includes('href="regatta.html"') && flat.includes("Bay Regatta"), "WebXR/home.html has no Bay Regatta card");
  const gen = readFileSync(join(ROOT, "tools", "gen_home.mjs"), "utf8");
  assert(/regatta:\s*"regatta\/regatta\.html"/.test(gen) && /regatta:\s*"regatta\.html"/.test(gen), "gen_home.mjs's layouts do not carry a regatta entry");
  const bw = readFileSync(join(WEBXR, "bayworld", "index.html"), "utf8");
  assert(bw.includes("../regatta/regatta.html") && /id="jb-regatta"/.test(bw) && /Regatta/.test(bw), "Bay World's map and job board do not link the Regatta");
  const bwApp = readFileSync(join(WEBXR, "bayworld", "js", "app.js"), "utf8");
  assert(/jb-regatta/.test(bwApp) && /island-yacht-harbor/.test(bwApp), "Bay World's job board does not show the Regatta link at the yacht harbour");
  const all = readFileSync(join(ROOT, "tools", "check_all.mjs"), "utf8");
  assert(all.includes('"check_regatta.mjs"'), "check_all.mjs does not run check_regatta.mjs");
});

// ------------------------------------------------------------ 6. safety net

const RG_ALL_FILES = ["regatta.html", "js/app.js", "js/world.js", "js/courses.js", "js/events.js", "js/race.js"]
  .map((f) => readFileSync(join(REGATTA, f), "utf8")).concat(readFileSync(join(WEBXR, "shared", "yacht-fleet.js"), "utf8")).join("\n");

await check("no gambling: no betting, wagers or odds anywhere in the regatta's files", () => {
  for (const re of [/\bbet(s|ting)?\b/i, /\bwager(s|ed|ing)?\b/i, /\bodds\b/i, /\bgambl(e|ing)\b/i, /\bbookmaker/i, /\bjackpot\b/i, /\bcasino\b/i]) assert(!re.test(RG_ALL_FILES), `found gambling language matching ${re}`);
});
await check("no violence, no right-of-way clause number, no third-party name", () => {
  for (const re of [/\bweapon\b/i, /\bgun\b/i, /\bshoot(ing)?\b/i, /\bkill(ed|ing)?\b/i, /\bcrime\b/i, /\bramm(ed|ing)\b/i]) assert(!re.test(RG_ALL_FILES), `found violence language matching ${re}`);
  for (const re of [/\b83\.\d+\b/, /\bRule\s+\d+/i, /\bCOLREG/i, /\bCFR\b/]) assert(!re.test(RG_ALL_FILES), `right-of-way must be taught generically, not as a clause: ${re}`);
  for (const re of [/america'?s cup/i, /\bvolvo\b/i, /\brolex\b/i, /\bsunseeker\b/i, /\bazimut\b/i, /\bferretti\b/i, /\bprincess yachts/i, /\byacht club\b/i]) assert(!re.test(RG_ALL_FILES), `found a third-party or club name matching ${re}`);
});

console.log(failures ? `\n${failures} check(s) failed.` : `\nAll Bay Regatta checks pass: ${S.YACHT_FLEET.length} yachts berthed and afloat, ${S.RG_COURSES.length} courses on the water, a race walked to a clean finish on each, ${S.RG_EVENTS.length} hosted events paying into Bay World's ledger.`);
process.exit(failures ? 1 : 0);
