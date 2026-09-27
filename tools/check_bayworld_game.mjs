/**
 * Headless checks for Bay World (WebXR/bayworld): a free-roam open-world city
 * app whose missions launch the platform's own real training stations. Every
 * rule engine here — city.js/world-stub.js (the city switch and stub),
 * sim.js (on-foot and vehicle physics, traffic, day/night, weather),
 * career.js (reputation, shift credits, unlocks, mission returns) and
 * quest-engine.js/quests-sample.js (the quest board) — touches no DOM, so
 * every rule below is driven straight from Node. world.js (the three.js
 * scene) is built once headlessly behind tools/lib/headless.mjs's stub
 * renderer, the same way tools/check_fairway.mjs proves buildFairwayPark().
 *
 *     node tools/check_bayworld_game.mjs
 *
 * What is proved here:
 *
 *  1. **The stub city is sound.** Four zones, six landmarks, eight sites and
 *     a connected road network (a ring road plus two cross streets, each
 *     site reachable by its own spur), and city.js's one-line-per-module
 *     switch points at the stub (not the real shared modules, which have not
 *     landed yet).
 *  2. **The stub city loads.** buildBayWorld() builds behind a stub three.js
 *     and DOM with no throw, at both detail levels and focused on one zone,
 *     and returns real vehicle meshes for the fleet.
 *  3. **The player moves and enters a vehicle.** bwStepPlayer() walks and
 *     runs; bwStepVehicle() drives, obeys the speed cap, and a vehicle
 *     stopped by a building never drives through it.
 *  4. **Traffic advances**, follows its own road, and holds at a crossing
 *     rather than driving straight through every one it meets.
 *  5. **A mission deep-link is formed correctly**: `sim=<station>` and
 *     `from=bayworld`, for a station this app's own catalog actually names.
 *  6. **A returned record awards reputation** — a passing TrainingRecords
 *     entry for one of a site's own stations raises reputation and shift
 *     credits exactly once, unlocks fast travel to that site, and a
 *     reputation milestone opens the next fleet vehicle.
 *  7. **The quest engine steps and persists.** The two built-in sample
 *     quests advance goto, station and talk/find/drive steps in order, fire
 *     onQuestStep/onQuestDone, and the progress survives a fresh read of
 *     storage (a reload).
 *  8. **The map lists every site**, positioned inside the canvas and each
 *     carrying its own visited/fast-travel state.
 *  9. **The app is wired**: bundled with every module, given a combined dist
 *     file, linked from the homepage with a Home chip back, and this
 *     checker runs from check_all.mjs.
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

const jsPath = (f) => join(BAYWORLD, "js", f);
const CITY = await import(pathToFileURL(jsPath("city.js")).href);
const SIM = await import(pathToFileURL(jsPath("sim.js")).href);
const CAREER = await import(pathToFileURL(jsPath("career.js")).href);
const QE = await import(pathToFileURL(jsPath("quest-engine.js")).href);
const QS = await import(pathToFileURL(jsPath("quests-sample.js")).href);
const MAP = await import(pathToFileURL(jsPath("map.js")).href);

console.log("Bay World — self-test\n");

// -------------------------------------------------------------- 1. the city

await check("city.js's switch points at the stub, and the stub city is sound", () => {
  const citySrc = readFileSync(jsPath("city.js"), "utf8");
  assert(citySrc.includes('from "./world-stub.js"'), "city.js does not import the stub city");
  assert(!existsSync(join(WEBXR, "shared", "bayworld-data.js")), "shared/bayworld-data.js has landed — city.js's switch should now point at it");

  eq(CITY.BAY_ZONES.length, 4, "zone count");
  eq(CITY.BAY_LANDMARKS.length, 6, "landmark count");
  eq(CITY.BAY_SITES.length, 8, "site count");
  const zoneIds = new Set(CITY.BAY_ZONES.map((z) => z.id));
  eq(zoneIds.size, 4, "zone ids must be distinct");
  for (const l of CITY.BAY_LANDMARKS) assert(zoneIds.has(l.zone), `landmark ${l.id} names an unknown zone`);
  for (const s of CITY.BAY_SITES) {
    assert(zoneIds.has(s.zone), `site ${s.id} names an unknown zone`);
    assert(Array.isArray(s.programmes) && s.programmes.length, `site ${s.id} has no programme`);
    assert(Array.isArray(s.stations) && s.stations.length, `site ${s.id} has no station`);
    assert(Array.isArray(s.position) && s.position.length === 3, `site ${s.id} has no 3-vector position`);
  }
  const stationIds = new Set(CITY.BAY_SITES.flatMap((s) => s.stations));
  eq(stationIds.size, CITY.BAY_SITES.flatMap((s) => s.stations).length, "two sites must never share a station id");

  const ring = CITY.BAY_ROADS.find((r) => r.loop);
  assert(ring && ring.points.length >= 4, "there is no closed ring road");
  assert(CITY.BAY_ROADS.filter((r) => r.traffic).length >= 2, "ambient traffic needs at least two roads to run on");
  for (const s of CITY.BAY_SITES) {
    assert(CITY.BAY_ROADS.some((r) => r.site === s.id), `site ${s.id} has no spur road connecting it to the network`);
  }
});

await check("bayRoadAt and bayZoneAt classify sensibly, and every site sits on its own road network", () => {
  for (const s of CITY.BAY_SITES) {
    const onNet = CITY.BAY_ROADS.some((r) => r.points.some(([x, z]) => Math.hypot(x - s.position[0], z - s.position[2]) < 40));
    assert(onNet, `site ${s.id} is not near any road`);
  }
  const centreOfRing = CITY.bayRoadAt(-220, -220);
  assert(centreOfRing.lane === "road", "a ring-road corner should read as 'road'");
  const middleOfNowhere = CITY.bayRoadAt(-220 + 60, -220 + 60);
  assert(middleOfNowhere.lane === "off" || middleOfNowhere.distance > CITY.BAY_ROAD_HALF, "a point well off every road should not read as 'road'");
  for (const z of CITY.BAY_ZONES) eq(CITY.bayZoneAt(z.center[0], z.center[1]), z.id, `a zone's own centre should read as itself`);
  const heights = CITY.bayHeight(140, 140);
  assert(heights > 2, "Signal Heights' own centre should sit well above the flat street grade");
});

// ------------------------------------------------------------ 2. the world

await check("the stub city loads behind a three.js stub, at both detail levels and with a focus zone", async () => {
  const modules = [
    "shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js", "shared/weather.js",
    "bayworld/js/world-stub.js", "bayworld/js/city.js", "bayworld/js/sim.js", "bayworld/js/world.js",
  ];
  const harness = `export { bwBuildWorld, THREE, BAY_SITES };`;
  const S = await buildSuite(modules, harness, "bayworld-world");
  for (const detail of ["low", "high"]) {
    const root = { children: [], add(...cs) { this.children.push(...cs); } };
    const w = S.bwBuildWorld(root, S.THREE, { detail });
    assert(root.children.length > 0, `buildBayWorld() at detail=${detail} added nothing to its parent`);
    for (const id of ["pool-car", "pickup", "box-truck", "class-a-tractor"]) assert(w.vehicles[id], `no vehicle mesh for ${id}`);
  }
  const focusRoot = { children: [], add(...cs) { this.children.push(...cs); } };
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
    let v = { x: -260, z: -140, heading: Math.PI / 2, speed: 0, vehicleId: veh.id };
    for (let i = 0; i < 600; i++) v = SIM.bwStepVehicle(v, { throttle: 1, steer: 0, brake: false }, 1 / 30);
    assert(v.speed <= SIM.BW_SPEED_CAP + 1e-6, `${veh.id} exceeded the city speed cap: ${v.speed} > ${SIM.BW_SPEED_CAP}`);
    assert(Number.isFinite(v.x) && Number.isFinite(v.z), `${veh.id} went non-finite`);
  }
  // Drive straight at a known building until it either stops the vehicle or
  // the vehicle would have driven clean through where the building stands.
  const building = SIM.bwBuildingAt ? null : null; void building;
  let hitAny = false;
  let v = { x: -230, z: -140.68, heading: Math.PI / 2, speed: 0, vehicleId: "pool-car" };
  const startX = v.x;
  for (let i = 0; i < 200; i++) { v = SIM.bwStepVehicle(v, { throttle: 1, steer: 0, brake: false }, 1 / 30); if (v.collided) hitAny = true; }
  assert(hitAny, "driving straight down a known building row for several seconds never registered a collision");
  assert(v.x - startX < 60, "a vehicle that collided should not have travelled as if nothing were there");
});

await check("bwMissionLink forms the platform's own deep-link shape, for a station this app actually names", () => {
  for (const site of CITY.BAY_SITES) {
    const link = SIM.bwMissionLink(site);
    eq(link, `../smartcity/index.html?sim=${site.stations[0]}&from=bayworld`, `mission link for ${site.id}`);
  }
});

// -------------------------------------------------------------- 4. traffic

await check("ambient traffic advances along its own road and holds at a crossing", () => {
  const traffic = SIM.bwSpawnTraffic(2);
  assert(traffic.length >= 4, "expected at least two vehicles per traffic road");
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
  const site = CITY.BAY_SITES[0];
  const before = CAREER.bwCareerState(storage);
  eq(before.reputation, 0, "a fresh career starts at zero reputation");
  assert(!CAREER.bwIsFastTravelUnlocked(site.id, storage), "fast travel should start locked");

  const records = [{ id: "r1", simId: site.stations[0], passed: true, stars: 3, seconds: 90, at: new Date().toISOString() }];
  const first = CAREER.bwCollectMissionReturns(records, CITY.BAY_SITES, { storage });
  eq(first.length, 1, "one fresh record should award exactly one mission return");
  const mid = CAREER.bwCareerState(storage);
  assert(mid.reputation > before.reputation, "reputation should rise after a passing return");
  assert(mid.credits > before.credits, "shift credits should rise after a passing return");
  assert(CAREER.bwIsFastTravelUnlocked(site.id, storage), "a visited site should unlock its own fast travel");
  assert(CAREER.bwIsSiteVisited(site.id, storage), "a completed mission should mark its site visited");

  // The same record again (a re-read of TrainingRecords, e.g. after a
  // reload) must never be credited twice.
  const second = CAREER.bwCollectMissionReturns(records, CITY.BAY_SITES, { storage });
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
  const shift = QS.BW_SAMPLE_QUESTS.find((q) => q.id === "first-shift");
  const award = CAREER.bwAwardQuestReward(shift.reward, { storage, siteId: shift.site, title: shift.title });
  eq(award.reputationGain, shift.reward.reputation, "reputation gain must equal the quest's own declared reward");
  eq(award.creditsGain, shift.reward.credits, "credits gain must equal the quest's own declared reward");
  eq(CAREER.bwCareerState(storage).reputation, shift.reward.reputation, "the career's own total must match too");
});

await check("bwSiteProgress reads real attempts from TrainingRecords for a site's own stations", () => {
  const site = CITY.BAY_SITES[1];
  const records = [
    { id: "a", simId: site.stations[0], passed: true, stars: 3, seconds: 60, at: "2026-01-01T00:00:00.000Z" },
    { id: "b", simId: "some-other-station", passed: true, stars: 3, seconds: 99, at: "2026-01-02T00:00:00.000Z" },
  ];
  const progress = CAREER.bwSiteProgress(records, site);
  eq(progress.attempts, 1, "bwSiteProgress must only count this site's own stations");
  eq(progress.lastStation, site.stations[0], "bwSiteProgress should name the last station run");
});

// ------------------------------------------------------------- 6. quests

await check("the quest engine steps both built-in sample quests to completion and persists across a reload", () => {
  QE.bwClearQuests();
  QE.registerQuests(QS.BW_SAMPLE_QUESTS);
  eq(QE.registeredQuests().length, 2, "expected exactly the two built-in sample quests");
  const storage = fakeStorage();
  const steps = [], dones = [];
  const offStep = QE.onQuestStep((e) => steps.push(e.questId));
  const offDone = QE.onQuestDone((e) => dones.push(e.questId));
  const places = [...CITY.BAY_SITES, ...CITY.BAY_LANDMARKS];

  const initial = QE.questState(storage);
  assert(initial.every((q) => !q.done && q.stepIndex === 0), "a fresh quest state should start at step zero, undone");

  const shift = QS.BW_SAMPLE_QUESTS.find((q) => q.id === "first-shift");
  const gotoSite = places.find((p) => p.id === shift.steps[0].target);
  QE.bwAdvanceQuests({ player: { x: gotoSite.position[0], z: gotoSite.position[2] }, places }, { storage });
  QE.bwNoteStationReturn(shift.steps[1].target, { storage });
  const talkPlace = places.find((p) => p.id === shift.steps[2].target);
  QE.bwAdvanceQuests({ player: { x: talkPlace.position[0], z: talkPlace.position[2] }, places, interact: true }, { storage });

  const afterFirstShift = QE.questState(storage).find((q) => q.id === "first-shift");
  assert(afterFirstShift.done, "first-shift should be complete after its three steps");
  assert(dones.includes("first-shift"), "onQuestDone never fired for first-shift");
  assert(steps.length >= 2, "onQuestStep should have fired at least twice for first-shift's own three steps");

  const run = QS.BW_SAMPLE_QUESTS.find((q) => q.id === "harbor-run");
  const driveSite = places.find((p) => p.id === run.steps[0].target);
  QE.bwAdvanceQuests({ player: { x: driveSite.position[0], z: driveSite.position[2] }, places, inVehicle: true, speed: 5 }, { storage });
  QE.bwNoteStationReturn(run.steps[1].target, { storage });
  const findPlace = places.find((p) => p.id === run.steps[2].target);
  QE.bwAdvanceQuests({ player: { x: findPlace.position[0], z: findPlace.position[2] }, places, interact: true }, { storage });
  const afterHarborRun = QE.questState(storage).find((q) => q.id === "harbor-run");
  assert(afterHarborRun.done, "harbor-run should be complete after its own three steps");
  eq(dones.filter((id) => id === "harbor-run").length, 1, "harbor-run's onQuestDone should fire exactly once");

  // The persisted state, read fresh (as a reload would), must show both done.
  const reloaded = QE.questState(storage);
  assert(reloaded.every((q) => q.done), "quest progress did not survive a fresh read of storage");
  offStep(); offDone();
});

await check("a malformed quest is refused at registration rather than at play", () => {
  QE.bwClearQuests();
  let threw = false;
  try { QE.registerQuests([{ id: "bad", steps: [{ type: "not-a-real-type", target: "x" }] }]); } catch { threw = true; }
  assert(threw, "an unknown step type should be refused at registerQuests(), not silently accepted");
  QE.bwClearQuests();
  QE.registerQuests(QS.BW_SAMPLE_QUESTS);
});

// --------------------------------------------------------------- 7. the map

await check("the map lists every site, positioned and carrying its own visited/fast-travel state", () => {
  const storage = fakeStorage();
  const sites = MAP.bwMapSites(512, storage);
  eq(sites.length, CITY.BAY_SITES.length, "the map must list every site, once");
  eq(new Set(sites.map((s) => s.id)).size, sites.length, "the map must not list a site twice");
  for (const s of sites) {
    assert(s.x >= 0 && s.x <= 512 && s.y >= 0 && s.y <= 512, `${s.id} maps outside the canvas`);
    assert(s.visited === false, "a fresh career should show every site as not yet visited");
    assert(s.fastTravel === false, "a fresh career should show every site's fast travel as locked");
  }
  CAREER.bwAwardMission({ passed: true, stars: 2, siteId: CITY.BAY_SITES[0].id, siteName: CITY.BAY_SITES[0].name }, { storage });
  const after = MAP.bwMapSites(512, storage);
  assert(after.find((s) => s.id === CITY.BAY_SITES[0].id).visited, "a visited site should read as visited on the map");

  const roads = MAP.bwMapRoads(512);
  assert(roads.length === CITY.BAY_ROADS.length, "the map should draw every road");
  const landmarks = MAP.bwMapLandmarks(512);
  eq(landmarks.length, CITY.BAY_LANDMARKS.length, "the map should list every landmark");
  const zones = MAP.bwMapZones(512);
  eq(zones.length, CITY.BAY_ZONES.length, "the map should list every zone");
});

// -------------------------------------------------------------- 8. wiring

await check("the bayworld app is in the bundler's list with every module, and its dist file is built", () => {
  const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
  const block = /"bayworld":\s*\{[\s\S]*?"modules":\s*\[([\s\S]*?)\]/.exec(bundler)?.[1] ?? "";
  const bundled = [...block.matchAll(/(SHARED|WEBXR)\s*\/\s*"([^"]+)"/g)].map((m) => (m[1] === "SHARED" ? `shared/${m[2]}` : m[2]));
  assert(bundled.length > 0, 'tools/bundle_webxr.py has no "bayworld" app');
  for (const f of ["world-stub.js", "city.js", "quests-sample.js", "quests-select.js", "quest-engine.js", "career.js", "sim.js", "map.js", "world.js", "app.js"]) {
    assert(bundled.includes(`bayworld/js/${f}`), `bayworld/js/${f} is not in the bundle`);
  }
  assert(!bundled.includes("bayworld/js/quests.js"), "quests.js has landed (team BAY3) but the bundle still lists quests-sample.js in its place");
  assert(bundled.includes("shared/fleet.js") && bundled.includes("shared/weather.js") && bundled.includes("shared/records.js") && bundled.includes("shared/tracking.js"),
    "the bundle is missing shared/fleet.js, weather.js, records.js or tracking.js");
  assert(/"bayworld":\s*"bayworld\.html"/.test(bundler), "bayworld.html is not copied into the combined WebXR/dist folder");
  assert(existsSync(join(BAYWORLD, "index.html")), "WebXR/bayworld/index.html is missing");
  const distPath = join(BAYWORLD, "dist", "bayworld.html");
  assert(existsSync(distPath), "WebXR/bayworld/dist/bayworld.html has not been built — run python3 tools/bundle_webxr.py");
  const dist = readFileSync(distPath, "utf8");
  assert(dist.includes("BAY_SITES") && dist.includes("registerQuests") && dist.includes("TrainingRecords") && dist.includes("bwStepVehicle"),
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

const BW_ALL_FILES = ["index.html", "js/app.js", "js/world.js", "js/world-stub.js", "js/city.js", "js/sim.js", "js/career.js", "js/quest-engine.js", "js/quests-sample.js", "js/quests-select.js", "js/map.js"]
  .map((f) => readFileSync(join(BAYWORLD, f), "utf8")).join("\n");

await check("no third-party game, character, music or logo name appears anywhere in the app", () => {
  const banned = [/grand theft auto\b/i, /\bgta\b/i, /minecraft/i, /roblox/i, /fortnite/i, /cyberpunk/i, /watch dogs/i, /\bsims\b/i, /nintendo/i, /playstation/i, /xbox game/i];
  for (const re of banned) assert(!re.test(BW_ALL_FILES), `found a third-party name matching ${re}`);
});

await check("the app stays violence-free: no weapon, crime or police-chase language", () => {
  const banned = [/\bweapon\b/i, /\bgun\b/i, /\bshoot(ing)?\b/i, /\bpolice chase\b/i, /\bwanted level\b/i, /\bcrime\b/i, /\brob(bery|bing)?\b/i, /\bkill(ed|ing)?\b/i, /\barrest(ed)?\b/i];
  for (const re of banned) assert(!re.test(BW_ALL_FILES), `found violence/crime language matching ${re}`);
});

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll Bay World checks pass: the stub city loads, the player walks and drives, traffic advances and holds at crossings, missions deep-link correctly, a returned record awards reputation and credits, the quest engine steps and persists, and the map lists every site.");
process.exit(failures ? 1 : 0);
