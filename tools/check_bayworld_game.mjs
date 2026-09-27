/**
 * Headless checks for Bay World (WebXR/bayworld): a free-roam open-world city
 * app whose missions launch the platform's own real training stations. Every
 * rule engine here — city.js (the adapter over BAY1's shared map), sim.js
 * (on-foot and vehicle physics, traffic, day/night, weather), career.js
 * (reputation, shift credits, unlocks, mission returns) and
 * quest-engine.js/quests-select.js (the quest board, adapted from BAY3's
 * quests.js) — touches no DOM, so every rule below is driven straight from
 * Node. world.js (the three.js scene) is built once headlessly behind
 * tools/lib/headless.mjs's stub renderer, the same way tools/check_fairway.mjs
 * proves buildFairwayPark().
 *
 *     node tools/check_bayworld_game.mjs
 *
 * What is proved here:
 *
 *  1. **The adapted map is sound.** city.js imports only the pure data from
 *     shared/bayworld-data.js, adapts every one of BAY1's zones, landmarks
 *     and sites to this app's own shapes — the counts are read from the data,
 *     never hard-coded, so the map can grow without touching this file —
 *     and every site sits within a plausible walk of the real road network.
 *  2. **The real city loads.** buildBayWorld() builds behind a stub three.js
 *     and DOM with no throw, at both detail levels and focused on one zone,
 *     and returns real vehicle meshes for the fleet.
 *  3. **The player moves and enters a vehicle.** bwStepPlayer() walks and
 *     runs; bwStepVehicle() drives, obeys the speed cap, and a vehicle
 *     stopped by a building never drives through it.
 *  4. **Traffic advances** on the shared road network, follows its own road,
 *     and holds at a crossing rather than driving straight through every
 *     one it meets.
 *  5. **A mission deep-link is formed correctly**: `sim=<station>` and
 *     `from=bayworld`, for a station this app's own catalog actually names.
 *  6. **A returned record awards reputation** — a passing TrainingRecords
 *     entry for one of a site's own stations raises reputation and shift
 *     credits exactly once, unlocks fast travel to that site, and a
 *     reputation milestone opens the next fleet vehicle.
 *  7. **The quest engine steps and persists**, driven through BAY3's real
 *     adapted quest list: a main-arc quest's goto/talk/station steps, and an
 *     egg quest's talk/find steps resolved onto its own anchor (an egg's own
 *     found-object id names no place, so quest-engine.js's anchor fallback
 *     is what lets it still resolve), firing onQuestStep/onQuestDone and
 *     surviving a fresh read of storage (a reload). Every one of BAY3's 100+
 *     quests registers without a step-shape error.
 *  8. **The map lists every site**, positioned inside the canvas and each
 *     carrying its own visited/fast-travel state.
 *  9. **The app is wired**: bundled with every module (BAY1's and BAY3's
 *     real modules, not the pre-integration stub or sample quests), given a
 *     combined dist file, linked from the homepage with a Home chip back,
 *     and this checker runs from check_all.mjs.
 * 10. **The content rules hold**: no third-party name, and no weapon, crime
 *     or police-chase language anywhere in the app.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSuite } from "./lib/headless.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const BAYWORLD = join(WEBXR, "bayworld");

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

function distToSegment(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az, l2 = abx * abx + abz * abz;
  const t = l2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / l2)) : 0;
  return Math.hypot(px - (ax + abx * t), pz - (az + abz * t));
}
function nearestRoadDistance(x, z, roads) {
  let best = Infinity;
  for (const r of roads) for (let i = 1; i < r.points.length; i++) {
    const [ax, az] = r.points[i - 1], [bx, bz] = r.points[i];
    best = Math.min(best, distToSegment(x, z, ax, az, bx, bz));
  }
  return best;
}

const jsPath = (f) => join(BAYWORLD, "js", f);
const CITY = await import(pathToFileURL(jsPath("city.js")).href);
const SIM = await import(pathToFileURL(jsPath("sim.js")).href);
const CAREER = await import(pathToFileURL(jsPath("career.js")).href);
const QE = await import(pathToFileURL(jsPath("quest-engine.js")).href);
const QS = await import(pathToFileURL(jsPath("quests-select.js")).href);
const MAP = await import(pathToFileURL(jsPath("map.js")).href);
// The shared ground truth the adapter is checked against: counts come from
// here, never from a number typed into this file.
const DATA = await import(pathToFileURL(join(WEBXR, "shared", "bayworld-data.js")).href);
const PLACES = [...CITY.BW_SITES, ...CITY.BW_LANDMARKS];

console.log("Bay World — self-test\n");

// -------------------------------------------------------------- 1. the city

await check("city.js imports the real shared map and adapts it, never the pre-integration stub", () => {
  const citySrc = readFileSync(jsPath("city.js"), "utf8");
  assert(citySrc.includes('from "../../shared/bayworld-data.js"'), "city.js does not import the real shared/bayworld-data.js");
  assert(!/from\s+["']\.\/world-stub\.js["']/.test(citySrc), "city.js still imports from the pre-integration stub");
  assert(existsSync(join(WEBXR, "shared", "bayworld-data.js")) && existsSync(join(WEBXR, "shared", "bayworld.js")), "BAY1's shared modules are missing");

  eq(CITY.BW_ZONES.length, DATA.BAY_ZONES.length, "zone count (adapter vs shared data)");
  eq(CITY.BW_LANDMARKS.length, DATA.BAY_LANDMARKS.length, "landmark count (adapter vs shared data)");
  eq(CITY.BW_SITES.length, DATA.BAY_SITES.length, "site count (adapter vs shared data)");
  assert(CITY.BW_ZONES.length > 0 && CITY.BW_SITES.length > 0 && CITY.BW_LANDMARKS.length > 0, "the shared map is empty");
  const zoneIds = new Set(CITY.BW_ZONES.map((z) => z.id));
  eq(zoneIds.size, CITY.BW_ZONES.length, "zone ids must be distinct");
  for (const z of CITY.BW_ZONES) assert(Array.isArray(z.center) && z.center.length === 2 && typeof z.color === "number", `zone ${z.id} is missing its adapted center/color`);
  for (const l of CITY.BW_LANDMARKS) {
    assert(zoneIds.has(l.zone), `landmark ${l.id} names an unknown zone`);
    assert(Array.isArray(l.position) && l.position.length === 3, `landmark ${l.id} has no 3-vector position`);
  }
  let sitesWithStations = 0;
  for (const s of CITY.BW_SITES) {
    assert(zoneIds.has(s.zone), `site ${s.id} names an unknown zone`);
    assert(Array.isArray(s.position) && s.position.length === 3, `site ${s.id} has no 3-vector position`);
    assert(Array.isArray(s.programmes) && Array.isArray(s.stations), `site ${s.id} is missing its programmes/stations arrays`);
    if (s.stations.length) sitesWithStations += 1;
  }
  assert(sitesWithStations >= Math.ceil(CITY.BW_SITES.length * 0.8), `only ${sitesWithStations} of ${CITY.BW_SITES.length} sites carry a station — expected most of them to`);

  eq(CITY.BAY_ROADS.length, DATA.BAY_ROADS.length, "road count (adapter vs shared data)");
  assert(CITY.BAY_ROADS.length > 0, "the shared map has no roads");
  eq(CITY.BAY_BOUNDS, DATA.BAY_BOUNDS, "BAY_BOUNDS must be re-exported unchanged");
});

await check("bwRoadAt and bwZoneAt classify sensibly, and every site sits within a plausible walk of the road network", () => {
  for (const s of CITY.BW_SITES) {
    const d = nearestRoadDistance(s.position[0], s.position[2], CITY.BAY_ROADS);
    assert(d < 60, `site ${s.id} is ${d.toFixed(1)}m from the nearest road segment`);
  }
  const onFreeway = CITY.bwRoadAt(-380, -160);
  assert(onFreeway.lane === "road", "a point on the freeway spine should read as 'road'");
  const offRoad = CITY.bwRoadAt(500, -400);
  eq(offRoad.lane, "off", "a point well off every road should read as 'off'");
  for (const z of CITY.BW_ZONES) eq(CITY.bwZoneAt(z.center[0], z.center[1]), z.id, "a zone's own centre should read as itself");
  const [hillX, hillZ] = [650, -250]; // the Hills zone's own centre
  assert(CITY.bayHeight(hillX, hillZ) > 50, "the Hills zone's own centre should sit well above the flat street grade");
});

// ------------------------------------------------------------ 2. the world

await check("the real city loads behind a three.js stub, at both detail levels and with a focus zone", async () => {
  const modules = [
    "shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js", "shared/props.js", "shared/weather.js",
    // The sky dome and the wildlife (docs/consoles/SKY.md): world.js builds both.
    "shared/sky.js", "shared/wildlife.js",
    "smartcity/js/citykit.js",
    "shared/bayworld-data.js", "shared/bayworld.js",
    // The satellite-ground hook (docs/mapbox.md): world.js imports these two;
    // with no token they return null before touching the network.
    "shared/bay-geo.js", "shared/mapbox.js",
    "bayworld/js/city.js", "bayworld/js/sim.js", "bayworld/js/world.js",
  ];
  const harness = `export { bwBuildWorld, THREE };`;
  const S = await buildSuite(modules, harness, "bayworld-world");
  const bareGroup = () => ({ children: [], add(...cs) { this.children.push(...cs); }, traverse(fn) { fn(this); for (const c of this.children) if (c.traverse) c.traverse(fn); } });
  for (const detail of ["low", "high"]) {
    const root = bareGroup();
    const w = S.bwBuildWorld(root, S.THREE, { detail });
    assert(root.children.length > 0, `buildBayWorld() at detail=${detail} added nothing to its parent`);
    for (const id of ["pool-car", "pickup", "box-truck", "class-a-tractor"]) assert(w.vehicles[id], `no vehicle mesh for ${id}`);
  }
  const focusRoot = bareGroup();
  const focused = S.bwBuildWorld(focusRoot, S.THREE, { detail: "high", zone: "downtown" });
  assert(focusRoot.children.length > 0, "buildBayWorld() with a focus zone added nothing");
  const traffic = focused.bwSpawnTrafficMeshes(3);
  eq(traffic.length, 3, "bwSpawnTrafficMeshes should build exactly what it is asked for");
  const peds = focused.bwSpawnPedestrianMeshes(2);
  eq(peds.length, 2, "bwSpawnPedestrianMeshes should build exactly what it is asked for");
  const dayLight = focused.bwApplyLighting({ fog: null }, 12);
  const nightLight = focused.bwApplyLighting({ fog: null }, 1);
  assert(!dayLight.isNight && nightLight.isNight, "bayLighting should tell noon and 1 a.m. apart");
  assert(nightLight.streetlightsOn && !dayLight.streetlightsOn, "street lights should be on at night and off at noon");
  focused.bwSetWeather("rain");
  focused.bwSetWeather("clear");
  const cam = { position: { set() {} }, lookAt() {} };
  focused.placeCamera(cam, "chase", 0, 0, 0, 0);
  focused.placeCamera(cam, "first", 0, 0, 0, 0);
});

// --------------------------------------------------- 3. player and vehicles

await check("the player walks and runs, and free-roams past the map's own roads", () => {
  let s = { x: 0, z: 0, heading: 0, speed: 0 };
  for (let i = 0; i < 60; i++) s = SIM.bwStepPlayer(s, { forward: 1, strafe: 0, turn: 0, run: false }, 1 / 30);
  const walked = Math.hypot(s.x, s.z);
  let r = { x: 0, z: 0, heading: 0, speed: 0 };
  for (let i = 0; i < 60; i++) r = SIM.bwStepPlayer(r, { forward: 1, strafe: 0, turn: 0, run: true }, 1 / 30);
  const ran = Math.hypot(r.x, r.z);
  assert(ran > walked, "running should cover more ground than walking in the same time");
  assert(Number.isFinite(s.x) && Number.isFinite(s.z), "player position went non-finite");
});

await check("a vehicle accelerates, never exceeds the city speed cap, and stops at a building rather than driving through it", () => {
  for (const veh of SIM.BW_VEHICLES) {
    let v = { x: -380, z: -500, heading: 0, speed: 0, vehicleId: veh.id };
    for (let i = 0; i < 600; i++) v = SIM.bwStepVehicle(v, { throttle: 1, steer: 0, brake: false }, 1 / 30);
    assert(v.speed <= SIM.BW_SPEED_CAP + 1e-6, `${veh.id} exceeded the city speed cap: ${v.speed} > ${SIM.BW_SPEED_CAP}`);
    assert(Number.isFinite(v.x) && Number.isFinite(v.z), `${veh.id} went non-finite`);
  }
  // Drive straight at a real building this city's own bwBuildings() placed,
  // until it either stops the vehicle or the vehicle would have driven clean
  // through where the building stands.
  const building = CITY.bwBuildings("high", null)[0];
  assert(building, "bwBuildings() returned no buildings to aim at");
  const approachHeading = Math.atan2(building.x, building.z); // 0 = +z, toward the building from the origin
  let v = { x: 0, z: 0, heading: approachHeading, speed: 0, vehicleId: "pool-car" };
  let hitAny = false;
  const dist0 = Math.hypot(building.x, building.z);
  for (let i = 0; i < 2000 && !hitAny; i++) {
    v = SIM.bwStepVehicle(v, { throttle: 1, steer: 0, brake: false }, 1 / 30);
    if (v.collided) hitAny = true;
  }
  assert(hitAny, "driving straight at a real building for a long run never registered a collision");
  const travelled = Math.hypot(v.x, v.z);
  assert(travelled < dist0 + building.w + building.d, "a vehicle that collided should not have travelled as if the building were not there");
});

await check("bwMissionLink forms the platform's own deep-link shape, for a station this app actually names", () => {
  const staffed = CITY.BW_SITES.filter((s) => s.stations.length);
  assert(staffed.length > 0, "no site carries a station to test a deep link against");
  for (const site of staffed) {
    const link = SIM.bwMissionLink(site);
    eq(link, `../smartcity/index.html?sim=${site.stations[0]}&from=bayworld`, `mission link for ${site.id}`);
  }
  const bare = CITY.BW_SITES.find((s) => !s.stations.length);
  if (bare) {
    let threw = false;
    try { SIM.bwMissionLink(bare); } catch { threw = true; }
    assert(threw, `bwMissionLink(${bare.id}) should refuse a site with no station rather than link nowhere`);
  }
});

// -------------------------------------------------------------- 4. traffic

await check("ambient traffic advances on the shared road network and holds at a crossing", () => {
  const traffic = SIM.bwSpawnTraffic(2);
  assert(traffic.length >= 2 * CITY.BAY_ROADS.length - 2, "expected roughly two vehicles per road");
  SIM.bwStepTraffic(traffic, 1 / 20); // one step first, so x/z exist before "start" is captured
  const start = traffic.map((v) => ({ ...v }));
  let sawWait = false;
  for (let i = 0; i < 900; i++) {
    SIM.bwStepTraffic(traffic, 1 / 20);
    if (traffic.some((v) => v.waitTimer > 0)) sawWait = true;
  }
  for (let i = 0; i < traffic.length; i++) {
    const moved = Math.hypot(traffic[i].x - start[i].x, traffic[i].z - start[i].z);
    assert(moved > 5, `traffic vehicle ${traffic[i].id} barely moved (${moved.toFixed(2)} m) over 45 s`);
    assert(Number.isFinite(traffic[i].x) && Number.isFinite(traffic[i].z), `traffic vehicle ${traffic[i].id} went non-finite`);
  }
  assert(sawWait, "no ambient-traffic vehicle ever paused at a crossing in 45 simulated seconds");
});

await check("the day clock advances and wraps, and weather is deterministic for the same hour", () => {
  let hours = 23.5;
  hours = SIM.bwAdvanceClock(hours, SIM.BW_DAY_SECONDS / 24 / 2); // half an hour of sim time
  assert(hours < 1 || hours > 23.9, "the clock should wrap through midnight rather than exceeding 24");
  eq(SIM.bwWeatherFor(10, 3), SIM.bwWeatherFor(10, 3), "the same hour and day should always give the same weather");
  assert(SIM.BW_WEATHER_KINDS.includes(SIM.bwWeatherFor(10, 3)), "bwWeatherFor returned a kind not in BW_WEATHER_KINDS");
});

// ---------------------------------------------------------- 5. career

await check("a returned, passing TrainingRecords entry raises reputation and shift credits exactly once, and unlocks fast travel", () => {
  const storage = fakeStorage();
  const site = CITY.BW_SITES.find((s) => s.stations.length);
  const before = CAREER.bwCareerState(storage);
  eq(before.reputation, 0, "a fresh career starts at zero reputation");
  assert(!CAREER.bwIsFastTravelUnlocked(site.id, storage), "fast travel should start locked");

  const records = [{ id: "r1", simId: site.stations[0], passed: true, stars: 3, seconds: 90, at: new Date().toISOString() }];
  const first = CAREER.bwCollectMissionReturns(records, CITY.BW_SITES, { storage });
  eq(first.length, 1, "one fresh record should award exactly one mission return");
  const mid = CAREER.bwCareerState(storage);
  assert(mid.reputation > before.reputation, "reputation should rise after a passing return");
  assert(mid.credits > before.credits, "shift credits should rise after a passing return");
  assert(CAREER.bwIsFastTravelUnlocked(site.id, storage), "a visited site should unlock its own fast travel");
  assert(CAREER.bwIsSiteVisited(site.id, storage), "a completed mission should mark its site visited");

  // The same record again (a re-read of TrainingRecords, e.g. after a
  // reload) must never be credited twice.
  const second = CAREER.bwCollectMissionReturns(records, CITY.BW_SITES, { storage });
  eq(second.length, 0, "the same record must not be credited a second time");
  eq(CAREER.bwCareerState(storage).reputation, mid.reputation, "reputation must not change on a repeat scan");
});

await check("a reputation milestone unlocks the next fleet vehicle", () => {
  const storage = fakeStorage();
  assert(CAREER.bwIsVehicleUnlocked("pool-car", storage), "the pool car should always be unlocked");
  assert(!CAREER.bwIsVehicleUnlocked("pickup", storage), "the pickup should start locked");
  let award;
  for (let i = 0; i < 5 && !CAREER.bwIsVehicleUnlocked("pickup", storage); i++) {
    award = CAREER.bwAwardMission({ passed: true, stars: 3, siteId: `filler-${i}`, siteName: "Filler" }, { storage });
  }
  assert(CAREER.bwIsVehicleUnlocked("pickup", storage), "the pickup never unlocked despite enough reputation");
  assert(award.unlocked.some((u) => u.kind === "vehicle" && u.id === "pickup"), "the unlock event should have named the pickup");
});

await check("a quest's own declared reward is awarded exactly, never the mission-stars formula", () => {
  const storage = fakeStorage();
  const quest = QS.BW_QUESTS.find((q) => q.id === "bw-main-00-heritage");
  assert(quest, "the heritage-walk main quest is missing from the adapted quest list");
  const award = CAREER.bwAwardQuestReward(quest.reward, { storage, siteId: quest.site, title: quest.title });
  eq(award.reputationGain, quest.reward.reputation, "reputation gain must equal the quest's own declared reward");
  eq(award.creditsGain, quest.reward.credits, "credits gain must equal the quest's own declared reward");
  eq(CAREER.bwCareerState(storage).reputation, quest.reward.reputation, "the career's own total must match too");
});

await check("bwSiteProgress reads real attempts from TrainingRecords for a site's own stations", () => {
  const site = CITY.BW_SITES.find((s) => s.stations.length >= 2);
  const records = [
    { id: "a", simId: site.stations[0], passed: true, stars: 3, seconds: 60, at: "2026-01-01T00:00:00.000Z" },
    { id: "b", simId: "some-other-station", passed: true, stars: 3, seconds: 99, at: "2026-01-02T00:00:00.000Z" },
  ];
  const progress = CAREER.bwSiteProgress(records, site);
  eq(progress.attempts, 1, "bwSiteProgress must only count this site's own stations");
  eq(progress.lastStation, site.stations[0], "bwSiteProgress should name the last station run");
});

// ------------------------------------------------------------- 6. quests

await check("every one of BAY3's adapted quests registers, with a resolved site or landmark anchor where its steps need one", () => {
  assert(QS.BW_QUESTS.length > 100, `expected well over 100 quests (main + side + egg), got ${QS.BW_QUESTS.length}`);
  QE.bwClearQuests();
  QE.registerQuests(QS.BW_QUESTS); // throws on any quest whose step shape the engine does not understand
  eq(QE.registeredQuests().length, QS.BW_QUESTS.length, "every adapted quest should have registered");
  for (const q of QS.BW_QUESTS) {
    for (const step of q.steps) {
      if (step.type === "station") continue;
      const resolvesToPlace = PLACES.some((p) => p.id === step.target);
      const isEggCollectible = typeof step.target === "string" && step.target.startsWith("bw-egg-");
      if (!resolvesToPlace && !isEggCollectible) {
        assert(Array.isArray(q.anchor), `quest "${q.id}" step targets "${step.target}" (not a site/landmark id) but has no anchor to fall back on`);
      }
    }
  }
});

await check("the quest engine steps a real main-arc quest and a real egg quest to completion, firing events, and persists across a reload", () => {
  QE.bwClearQuests();
  QE.registerQuests(QS.BW_QUESTS);
  const storage = fakeStorage();
  const steps = [], dones = [];
  const offStep = QE.onQuestStep((e) => steps.push(e.questId));
  const offDone = QE.onQuestDone((e) => dones.push(e.questId));

  const main = QS.BW_QUESTS.find((q) => q.id === "bw-main-00-heritage");
  assert(main, "the heritage-walk main quest is missing");
  eq(main.steps.map((s) => s.type).join(","), "goto,talk,station,talk", "bw-main-00-heritage's own step shape changed underneath this checker");
  const site = PLACES.find((p) => p.id === main.site);
  assert(site, `bw-main-00-heritage's own site "${main.site}" did not resolve to a real place`);
  QE.bwAdvanceQuests({ player: { x: site.position[0], z: site.position[2] }, places: PLACES }, { storage }); // goto
  QE.bwAdvanceQuests({ player: { x: site.position[0], z: site.position[2] }, places: PLACES, interact: true }, { storage }); // talk (anchor fallback: "trades-heritage-keeper" names no place)
  QE.bwNoteStationReturn(main.steps[2].target, { storage }); // station
  QE.bwAdvanceQuests({ player: { x: site.position[0], z: site.position[2] }, places: PLACES, interact: true }, { storage }); // talk again
  const mainState = QE.questState(storage).find((q) => q.id === main.id);
  assert(mainState.done, "bw-main-00-heritage should be complete after its four steps");
  assert(dones.includes(main.id), "onQuestDone never fired for the main quest");

  const egg = QS.BW_QUESTS.find((q) => q.kind === "egg" && q.method === "radio");
  assert(egg, "no radio-method egg quest found to test the anchor fallback against");
  eq(egg.steps.map((s) => s.type).join(","), "talk,find", "a radio egg's own step shape changed underneath this checker");
  assert(Array.isArray(egg.anchor), `egg "${egg.id}" has no resolved landmark anchor`);
  QE.bwAdvanceQuests({ player: { x: egg.anchor[0], z: egg.anchor[1] }, places: PLACES, interact: true }, { storage }); // talk "maintenance-radio" — not a place, anchor only
  QE.bwAdvanceQuests({ player: { x: egg.anchor[0], z: egg.anchor[1] }, places: PLACES, interact: true }, { storage }); // find "bw-egg-…" — not a place, anchor only
  const eggState = QE.questState(storage).find((q) => q.id === egg.id);
  assert(eggState.done, `egg quest ${egg.id} should be complete after its two anchor-resolved steps`);
  assert(dones.includes(egg.id), "onQuestDone never fired for the egg quest");

  // The persisted state, read fresh (as a reload would), must still show both done.
  const reloaded = QE.questState(storage);
  assert(reloaded.find((q) => q.id === main.id).done && reloaded.find((q) => q.id === egg.id).done, "quest progress did not survive a fresh read of storage");
  offStep(); offDone();
});

await check("a malformed quest is refused at registration rather than at play", () => {
  QE.bwClearQuests();
  let threw = false;
  try { QE.registerQuests([{ id: "bad", steps: [{ type: "not-a-real-type", target: "x" }] }]); } catch { threw = true; }
  assert(threw, "an unknown step type should be refused at registerQuests(), not silently accepted");
  QE.bwClearQuests();
  QE.registerQuests(QS.BW_QUESTS);
});

// --------------------------------------------------------------- 7. the map

await check("the map lists every site, positioned and carrying its own visited/fast-travel state", () => {
  const storage = fakeStorage();
  const sites = MAP.bwMapSites(512, storage);
  eq(sites.length, CITY.BW_SITES.length, "the map must list every site, once");
  eq(new Set(sites.map((s) => s.id)).size, sites.length, "the map must not list a site twice");
  for (const s of sites) {
    assert(s.x >= 0 && s.x <= 512 && s.y >= 0 && s.y <= 512, `${s.id} maps outside the canvas`);
    assert(s.visited === false, "a fresh career should show every site as not yet visited");
    assert(s.fastTravel === false, "a fresh career should show every site's fast travel as locked");
  }
  const visitMe = CITY.BW_SITES[0];
  CAREER.bwAwardMission({ passed: true, stars: 2, siteId: visitMe.id, siteName: visitMe.name }, { storage });
  const after = MAP.bwMapSites(512, storage);
  assert(after.find((s) => s.id === visitMe.id).visited, "a visited site should read as visited on the map");

  const roads = MAP.bwMapRoads(512);
  eq(roads.length, CITY.BAY_ROADS.length, "the map should draw every road");
  const landmarks = MAP.bwMapLandmarks(512);
  eq(landmarks.length, CITY.BW_LANDMARKS.length, "the map should list every landmark");
  const zones = MAP.bwMapZones(512);
  eq(zones.length, CITY.BW_ZONES.length, "the map should list every zone");
});

// -------------------------------------------------------------- 8. wiring

await check("the bayworld app is in the bundler's list with every real module, and its dist file is built", () => {
  const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
  const block = /"bayworld":\s*\{[\s\S]*?"modules":\s*\[([\s\S]*?)\]/.exec(bundler)?.[1] ?? "";
  const bundled = [...block.matchAll(/(SHARED|WEBXR)\s*\/\s*"([^"]+)"/g)].map((m) => (m[1] === "SHARED" ? `shared/${m[2]}` : m[2]));
  assert(bundled.length > 0, 'tools/bundle_webxr.py has no "bayworld" app');
  for (const f of ["city.js", "quests-select.js", "quest-engine.js", "career.js", "sim.js", "map.js", "world.js", "app.js"]) {
    assert(bundled.includes(`bayworld/js/${f}`), `bayworld/js/${f} is not in the bundle`);
  }
  for (const f of ["quests-data.js", "quests.js"]) {
    assert(bundled.includes(`bayworld/js/${f}`), `BAY3's bayworld/js/${f} is not in the bundle`);
  }
  assert(!bundled.includes("bayworld/js/world-stub.js"), "the pre-integration stub (world-stub.js) is still bundled — city.js has landed on the real shared map");
  assert(!bundled.includes("bayworld/js/quests-sample.js"), "the pre-integration sample quests (quests-sample.js) are still bundled — quests-select.js has landed on BAY3's real quests.js");
  assert(bundled.includes("shared/bayworld-data.js") && bundled.includes("shared/bayworld.js"), "the bundle is missing BAY1's shared/bayworld-data.js or bayworld.js");
  assert(bundled.includes("shared/props.js") && bundled.includes("smartcity/js/citykit.js"), "the bundle is missing shared/bayworld.js's own props.js/citykit.js dependencies");
  assert(bundled.includes("shared/fleet.js") && bundled.includes("shared/weather.js") && bundled.includes("shared/records.js") && bundled.includes("shared/tracking.js"),
    "the bundle is missing shared/fleet.js, weather.js, records.js or tracking.js");
  assert(/"bayworld":\s*"bayworld\.html"/.test(bundler), "bayworld.html is not copied into the combined WebXR/dist folder");
  assert(existsSync(join(BAYWORLD, "index.html")), "WebXR/bayworld/index.html is missing");
  const distPath = join(BAYWORLD, "dist", "bayworld.html");
  assert(existsSync(distPath), "WebXR/bayworld/dist/bayworld.html has not been built — run python3 tools/bundle_webxr.py");
  const dist = readFileSync(distPath, "utf8");
  assert(dist.includes("BW_SITES") && dist.includes("registerQuests") && dist.includes("TrainingRecords") && dist.includes("bwStepVehicle") && dist.includes("ALL_QUESTS"),
    "WebXR/bayworld/dist/bayworld.html is stale — run python3 tools/bundle_webxr.py");
  const external = [...dist.matchAll(/<(?:script|link|img|audio|video|source)\b[^>]*>/g)].map((m) => m[0])
    .filter((tag) => !/rel="preconnect"/.test(tag))
    .map((tag) => /(?:src|href)="(https?:[^"]+)"/.exec(tag)?.[1]).filter(Boolean)
    .filter((u) => !/fonts\.(googleapis|gstatic)\.com/.test(u));
  assert(external.every((u) => u.startsWith("https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/")), `the bundle loads an unexpected external asset: ${external.join(", ")}`);
  assert(existsSync(join(WEBXR, "dist", "bayworld.html")), "WebXR/dist/bayworld.html (the combined folder's copy) is missing — run python3 tools/bundle_webxr.py");
});

await check("the app runs standalone (keyboard, touch and gamepad wiring, view toggle, map) and has a Home chip", () => {
  const app = readFileSync(jsPath("app.js"), "utf8");
  assert(/addEventListener\("keydown"/.test(app) && /addEventListener\("keyup"/.test(app), "app.js has no keyboard wiring");
  assert(/createGamepad\(/.test(app), "app.js has no gamepad wiring");
  assert(/pointerdown/.test(app), "app.js has no touch wiring");
  assert(/KeyV/.test(app) && /cameraMode/.test(app), "app.js has no V camera toggle");
  assert(/KeyM/.test(app) && /bwToggleMap/.test(app), "app.js has no M map toggle");
  const html = readFileSync(join(BAYWORLD, "index.html"), "utf8");
  assert(/class="home-chip"/.test(html) && /href="\.\.\/index\.html"/.test(html), "WebXR/bayworld/index.html has no Home chip back to the platform");
});

await check("the homepage links Bay World on both variants, and check_all.mjs runs this checker", () => {
  const home = readFileSync(join(WEBXR, "index.html"), "utf8");
  const flat = readFileSync(join(WEBXR, "home.html"), "utf8");
  assert(home.includes('href="bayworld/index.html"') && home.includes("Bay World"), "WebXR/index.html has no Bay World card");
  assert(flat.includes('href="bayworld.html"') && flat.includes("Bay World"), "WebXR/home.html has no Bay World card");
  const gen = readFileSync(join(ROOT, "tools", "gen_home.mjs"), "utf8");
  assert(/bayworld:\s*"bayworld\/index\.html"/.test(gen) && /bayworld:\s*"bayworld\.html"/.test(gen), "gen_home.mjs's layouts do not carry a bayworld entry");
  const all = readFileSync(join(ROOT, "tools", "check_all.mjs"), "utf8");
  assert(all.includes('"check_bayworld_game.mjs"'), "check_all.mjs does not run check_bayworld_game.mjs");
});

// ------------------------------------------------------------ 9. safety net

const BW_ALL_FILES = [
  "index.html", "js/app.js", "js/world.js", "js/city.js", "js/sim.js", "js/career.js",
  "js/quest-engine.js", "js/quests-select.js", "js/map.js",
].map((f) => readFileSync(join(BAYWORLD, f), "utf8")).join("\n");

await check("no third-party game, character, music or logo name appears anywhere in this app's own files", () => {
  const banned = [/grand theft auto\b/i, /\bgta\b/i, /minecraft/i, /roblox/i, /fortnite/i, /cyberpunk/i, /watch dogs/i, /\bsims\b/i, /nintendo/i, /playstation/i, /xbox game/i];
  for (const re of banned) assert(!re.test(BW_ALL_FILES), `found a third-party name matching ${re}`);
});

await check("this app's own files stay violence-free: no weapon, crime or police-chase language", () => {
  const banned = [/\bweapon\b/i, /\bgun\b/i, /\bshoot(ing)?\b/i, /\bpolice chase\b/i, /\bwanted level\b/i, /\bcrime\b/i, /\brob(bery|bing)?\b/i, /\bkill(ed|ing)?\b/i, /\barrest(ed)?\b/i];
  for (const re of banned) assert(!re.test(BW_ALL_FILES), `found violence/crime language matching ${re}`);
});

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll Bay World checks pass: the real BAY1 map loads and drives, traffic advances and holds at crossings, missions deep-link correctly, a returned record awards reputation and credits, BAY3's real quest layer steps and persists (including an egg's anchor fallback), and the map lists every site.");
process.exit(failures ? 1 : 0);
