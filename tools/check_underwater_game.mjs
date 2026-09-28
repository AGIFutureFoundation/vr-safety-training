/**
 * Headless checks for The Deep (WebXR/underwater): the dive game under the
 * bay, whose job boards launch the platform's real dive and restoration
 * stations. Every rule engine — seabed.js (the adapter over the seabed
 * data), dive-sim.js (swimming, the ROV and its tether, the reserve, the
 * buddy line, ascent lines, light by depth), dive-career.js, dive-engine.js
 * with dives-select.js, activities.js and dive-map.js — touches no DOM, so
 * every rule below is driven straight from Node; world.js (the three.js
 * scene) is built once behind tools/lib/headless.mjs's stub renderer.
 *
 *     node tools/check_underwater_game.mjs
 *
 *  1. The adapted seabed is sound: counts come from the data, every site and
 *     landmark sits in its declared zone and inside DEEP_BOUNDS, every site
 *     is within a plausible swim of a dive line, the depth field is
 *     continuous, the lines are one connected network.
 *  2. The scene builds behind a three.js stub at both detail levels, inside
 *     the mesh budget, with a diver, a buddy, an ROV and an ascent line and
 *     lantern per site and egg.
 *  3. The diver swims and never passes the seabed or the surface; the ROV is
 *     faster and stops at the end of its tether.
 *  4. The reserve shrinks with time, faster deeper and finning hard, refills
 *     at the surface, and is only ever named with a word.
 *  5. Daylight falls off with depth and with the hour.
 *  6. A job-board deep link has the platform's shape, for a real station.
 *  7. A returned record awards reputation and credits once, opens the site's
 *     ascent line, and a reputation milestone opens the ROV.
 *  8. The dive engine steps a real main dive and a real lantern egg to
 *     completion, firing events, and survives a reload; every dive registers.
 *  9. Every one of the four activities starts, steps and scores.
 * 10. The map lists every site once, inside the canvas.
 * 11. The app is wired: bundled with every module, dist built, linked from
 *     the home page (both variants) and from Bay World's map, check_all runs
 *     this; the HUD never renders a depth figure or a numeric reserve.
 * 12. The content rules hold: no third-party name, no violence, no species
 *     claim, no stated limit.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSuite } from "./lib/headless.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const UW = join(WEBXR, "underwater");

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
function fakeStorage() { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; }
function distToSegment(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az, l2 = abx * abx + abz * abz;
  const t = l2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / l2)) : 0;
  return Math.hypot(px - (ax + abx * t), pz - (az + abz * t));
}

const jsPath = (f) => join(UW, "js", f);
const SEA = await import(pathToFileURL(jsPath("seabed.js")).href);
const SIM = await import(pathToFileURL(jsPath("dive-sim.js")).href);
const CAREER = await import(pathToFileURL(jsPath("dive-career.js")).href);
const ENGINE = await import(pathToFileURL(jsPath("dive-engine.js")).href);
const SEL = await import(pathToFileURL(jsPath("dives-select.js")).href);
const DIVES = await import(pathToFileURL(jsPath("dives.js")).href);
const ACT = await import(pathToFileURL(jsPath("activities.js")).href);
const MAP = await import(pathToFileURL(jsPath("dive-map.js")).href);
const PLACES = [...SEA.DV_SITES, ...SEA.DV_LANDMARKS];
const B = SEA.DEEP_BOUNDS;

console.log("The Deep — self-test\n");

// ------------------------------------------------------------ 1. the seabed

await check("the adapted seabed is sound: zones, sites, landmarks, lines and a continuous depth field", () => {
  assert(SEA.DV_ZONES.length >= 12, `only ${SEA.DV_ZONES.length} zones`);
  assert(SEA.DV_LANDMARKS.length >= 20, `only ${SEA.DV_LANDMARKS.length} landmarks`);
  assert(SEA.DV_SITES.length >= 30, `only ${SEA.DV_SITES.length} sites`);
  for (const p of PLACES) {
    assert(p.position.length === 3 && p.position[1] < 0, `${p.id} should sit on the seabed below the surface`);
    assert(p.position[0] >= B.minX && p.position[0] <= B.maxX && p.position[2] >= B.minZ && p.position[2] <= B.maxZ, `${p.id} is outside DEEP_BOUNDS`);
    eq(SEA.dvZoneAt(p.position[0], p.position[2]), p.zone, `${p.id}'s zone`);
  }
  for (const s of SEA.DV_SITES) {
    let best = Infinity;
    for (const l of SEA.DV_LINES) for (let i = 1; i < l.points.length; i++) best = Math.min(best, distToSegment(s.position[0], s.position[2], ...l.points[i - 1], ...l.points[i]));
    assert(best < 120, `site ${s.id} is ${best.toFixed(0)} m from the nearest dive line`);
  }
  for (const z of SEA.DV_ZONES) eq(SEA.dvZoneAt(z.center[0], z.center[1]), z.id, "a zone's own centre reads as itself");
  const [lo, hi] = SEA.DEEP_DEPTH_RANGE;
  let prev = null;
  for (let x = B.minX; x <= B.maxX; x += 10) {
    const d = SEA.dvDepthAt(x, 0);
    assert(d >= lo && d <= hi, `depth ${d} at (${x}, 0) is outside DEEP_DEPTH_RANGE`);
    if (prev !== null) assert(Math.abs(d - prev) < 8, `depth jumps by ${Math.abs(d - prev).toFixed(1)} m in 10 m at x=${x}`);
    prev = d;
  }
  const key = (p) => `${p[0]},${p[1]}`, adj = new Map();
  for (const l of SEA.DV_LINES) for (let i = 0; i < l.points.length; i++) {
    const k = key(l.points[i]); if (!adj.has(k)) adj.set(k, new Set());
    if (i) { adj.get(k).add(key(l.points[i - 1])); adj.get(key(l.points[i - 1])).add(k); }
  }
  const seen = new Set(), stack = [key(SEA.DV_LINES[0].points[0])];
  while (stack.length) { const k = stack.pop(); if (seen.has(k)) continue; seen.add(k); for (const n of adj.get(k)) stack.push(n); }
  eq(seen.size, adj.size, "the dive lines should be one connected network");
  assert(SEA.dvLineAt(SEA.DV_LINES[0].points[0][0], SEA.DV_LINES[0].points[0][1]).onLine, "a line's own vertex should read as on the line");
  assert(!SEA.dvLineAt(B.maxX - 5, B.maxZ - 5).onLine, "the field's far corner should read as off every line");
});

// ------------------------------------------------------------- 2. the scene

await check("the scene builds behind a three.js stub at both detail levels, inside the mesh budget", async () => {
  const modules = [
    "shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js", "shared/props.js", "smartcity/js/citykit.js",
    // The avatar style space (console CARTOGRAPHER): world.js dresses the learner's diver from it.
    "shared/crew.js",
    "shared/underwater-data.js", "shared/underwater.js",
    "underwater/js/seabed.js", "underwater/js/dive-sim.js", "underwater/js/world.js",
  ];
  const S = await buildSuite(modules, `export { dvBuildWorld, buildUnderwater, deepLighting, DEEP_MESH_BUDGET, THREE };`, "underwater-world");
  const bareGroup = () => ({ children: [], add(...cs) { this.children.push(...cs); }, remove() {}, traverse(fn) { fn(this); for (const c of this.children) if (c.traverse) c.traverse(fn); } });
  for (const detail of ["low", "high"]) {
    const root = bareGroup();
    const built = S.buildUnderwater(root, { detail });
    assert(root.children.length > 0, `buildUnderwater() at detail=${detail} added nothing`);
    assert(built.meshCount <= S.DEEP_MESH_BUDGET[detail], `detail=${detail} built ${built.meshCount} meshes, over the budget of ${S.DEEP_MESH_BUDGET[detail]}`);
  }
  const density = (L) => L.fogDensity ?? L.fog?.density;
  for (const band of ["shallow", "mid", "deep"]) { const L = S.deepLighting(band); assert(L.fog != null && L.hemi && L.key && density(L) > 0, `deepLighting(${band}) is missing a field`); }
  assert(density(S.deepLighting("deep")) > density(S.deepLighting("shallow")), "the deep should be murkier than the shallows");
  const root = bareGroup();
  const w = S.dvBuildWorld(root, S.THREE, { detail: "high" });
  assert(w.diver && w.buddy && w.rov && w.buddyLine && w.tether, "the world is missing the diver, buddy, ROV or a line");
  eq(w.ascentMeshes.length, SEA.DV_SITES.length, "one ascent line per site");
  w.dvPlaceLantern("dv-egg-test", 0, 0);
  assert(w.lanterns["dv-egg-test"], "dvPlaceLantern() should register the lantern");
  w.dvSetMarkers([{ id: "a", point: [0, 0], kind: "checkpoint" }, { id: "b", point: [1, 1], kind: "hazardous" }]);
  eq(w.markers.children.length, 2, "dvSetMarkers() should place one mesh per marker");
  w.dvMarkHit("a");
  const shallow = w.dvApplyLighting({ fog: null }, 5, 12), deep = w.dvApplyLighting({ fog: null }, 60, 12), night = w.dvApplyLighting({ fog: null }, 5, 1);
  eq(shallow.band, "shallow", "noon at the surface should read shallow"); eq(deep.band, "deep", "sixty metres down should read deep");
  assert(deep.daylight < shallow.daylight && night.daylight < shallow.daylight, "daylight should fall with depth and with the hour");
  const cam = { position: { set() {} }, lookAt() {} };
  w.placeCamera(cam, "chase", 0, -5, 0, 0); w.placeCamera(cam, "first", 0, -5, 0, 0);
});

// ------------------------------------------------------------ 3. the diver

await check("the diver swims, never passes the seabed or the surface, and the ROV is faster but stops at its tether", () => {
  const site = SEA.DV_SITES[0];
  let s = { x: site.position[0], y: site.position[1] + 2, z: site.position[2], heading: 0 };
  for (let i = 0; i < 60; i++) s = SIM.dvStepDiver(s, { forward: 1 }, 1 / 30);
  const swam = Math.hypot(s.x - site.position[0], s.z - site.position[2]);
  let r = { x: site.position[0], y: site.position[1] + 2, z: site.position[2], heading: 0 };
  for (let i = 0; i < 60; i++) r = SIM.dvStepDiver(r, { forward: 1, sprint: true }, 1 / 30);
  assert(Math.hypot(r.x - site.position[0], r.z - site.position[2]) > swam, "finning hard should cover more ground");
  let down = { ...s };
  for (let i = 0; i < 600; i++) down = SIM.dvStepDiver(down, { rise: -1 }, 1 / 30);
  assert(down.y >= SEA.dvFloorY(down.x, down.z), "the diver sank through the seabed");
  let up = { ...s };
  for (let i = 0; i < 2000; i++) up = SIM.dvStepDiver(up, { rise: 1 }, 1 / 30);
  assert(up.y <= SIM.DV_SURFACE_Y + 1e-9 && up.y > -1, "the diver should stop just under the surface");
  let rov = { x: site.position[0], y: site.position[1] + 2, z: site.position[2], heading: 0, tether: [site.position[0], site.position[2]] };
  let taut = false;
  for (let i = 0; i < 4000; i++) { rov = SIM.dvStepRov(rov, { throttle: 1 }, 1 / 30); if (rov.taut) taut = true; }
  assert(taut, "a long straight run never brought the tether taut");
  assert(Math.hypot(rov.x - site.position[0], rov.z - site.position[2]) <= SIM.DV_TETHER_RANGE + 1e-6, "the ROV passed the end of its tether");
  assert(SIM.DV_ROV_SPEED > SIM.DV_SWIM_SPEED, "the ROV should be faster than a swimmer");
});

// ---------------------------------------------------------- 4. the reserve

await check("the reserve shrinks with time, faster deeper and finning hard, refills at the surface, and is only ever a word", () => {
  let shallow = 1, deep = 1, hard = 1;
  for (let i = 0; i < 600; i++) {
    shallow = SIM.dvReserveStep(shallow, { depthFrac: 0.05 }, 1 / 10);
    deep = SIM.dvReserveStep(deep, { depthFrac: 0.8 }, 1 / 10);
    hard = SIM.dvReserveStep(hard, { depthFrac: 0.05, exertion: 1 }, 1 / 10);
  }
  assert(shallow < 1 && deep < shallow && hard < shallow, "the reserve should fall, and fall faster deeper and finning hard");
  let refilled = 0.2;
  for (let i = 0; i < 300; i++) refilled = SIM.dvReserveStep(refilled, { atSurface: true }, 1 / 10);
  assert(refilled > 0.9, "the reserve should refill at the surface");
  for (const v of [1, 0.7, 0.4, 0.2, 0.05]) {
    const word = SIM.dvReserveLabel(v);
    assert(SIM.DV_RESERVE_LABELS.includes(word) && !/\d/.test(word), `the reserve label "${word}" is not one of the qualitative words`);
  }
});

await check("daylight falls off with depth and with the hour, and the band matches", () => {
  assert(SIM.dvDaylightFactor(2, 12) > SIM.dvDaylightFactor(30, 12), "deeper should be darker at noon");
  assert(SIM.dvDaylightFactor(2, 12) > SIM.dvDaylightFactor(2, 2), "night should be darker than noon");
  eq(SIM.dvLightBand(5), "shallow", "band at 5"); eq(SIM.dvLightBand(20), "mid", "band at 20"); eq(SIM.dvLightBand(70), "deep", "band at 70");
});

// ------------------------------------------------------------- 5. job boards

await check("dvMissionLink forms the platform's deep-link shape, for a station this app actually names", () => {
  const staffed = SEA.DV_SITES.filter((s) => s.stations.length);
  assert(staffed.length === SEA.DV_SITES.length, "every seabed site should list a station");
  for (const site of staffed) eq(SIM.dvMissionLink(site), `../smartcity/dist/smartcity-x.html?sim=${site.stations[0]}&from=underwater`, `mission link for ${site.id}`);
  let threw = false;
  try { SIM.dvMissionLink({ id: "bare", stations: [] }); } catch { threw = true; }
  assert(threw, "a site with no station should refuse to link nowhere");
  const lines = SIM.dvAscentLines(SEA.DV_SITES);
  eq(lines.length, SEA.DV_SITES.length, "one ascent line per site");
  assert(SIM.dvNearestAscentLine(lines[0].x, lines[0].z, lines, 8)?.siteId === lines[0].siteId, "the nearest ascent line should be found beside its site");
});

// -------------------------------------------------------------- 6. career

await check("a returned, passing record raises reputation and credits exactly once and opens the site's ascent line; a milestone opens the ROV", () => {
  const storage = fakeStorage();
  const site = SEA.DV_SITES[0];
  eq(CAREER.dvCareerState(storage).reputation, 0, "a fresh career starts at zero");
  assert(!CAREER.dvIsAscentUnlocked(site.id, storage), "ascent lines start closed");
  const records = [{ id: "r1", simId: site.stations[0], passed: true, stars: 3, seconds: 90, at: new Date().toISOString() }];
  eq(CAREER.dvCollectDiveReturns(records, SEA.DV_SITES, { storage }).length, 1, "one fresh record awards once");
  const mid = CAREER.dvCareerState(storage);
  assert(mid.reputation > 0 && mid.credits > 0, "reputation and credits should rise");
  assert(CAREER.dvIsAscentUnlocked(site.id, storage) && CAREER.dvIsSiteVisited(site.id, storage), "the site should be visited and its ascent line open");
  eq(CAREER.dvCollectDiveReturns(records, SEA.DV_SITES, { storage }).length, 0, "the same record must not be credited twice");
  assert(!CAREER.dvIsCraftUnlocked("rov", storage), "the ROV should start locked");
  for (let i = 0; i < 6 && !CAREER.dvIsCraftUnlocked("rov", storage); i++) CAREER.dvAwardDive({ passed: true, stars: 3, siteId: `filler-${i}`, siteName: "Filler" }, { storage });
  assert(CAREER.dvIsCraftUnlocked("rov", storage), "enough reputation should open the ROV");
  const quest = SEL.DV_DIVES.find((q) => q.id === "dv-main-00-pilings");
  const award = CAREER.dvAwardDiveReward(quest.reward, { storage: fakeStorage(), siteId: quest.site, title: quest.title });
  eq(award.reputationGain, quest.reward.reputation, "a dive's declared reward is awarded exactly");
  const progress = CAREER.dvSiteProgress([{ id: "a", simId: site.stations[0], passed: true, stars: 3, seconds: 60, at: "2026-01-01T00:00:00.000Z" }, { id: "b", simId: "elsewhere", passed: true, stars: 3, seconds: 9, at: "2026-01-02T00:00:00.000Z" }], site);
  eq(progress.attempts, 1, "dvSiteProgress counts only this site's own stations");
});

// --------------------------------------------------------------- 7. dives

await check("every dive registers with an anchor, and the engine steps a main dive and a lantern egg to completion, persisting across a reload", () => {
  assert(SEL.DV_DIVES.length >= 30, `expected at least 30 dives, got ${SEL.DV_DIVES.length}`);
  ENGINE.dvClearDives();
  ENGINE.dvRegisterDives(SEL.DV_DIVES);
  eq(ENGINE.dvRegisteredDives().length, SEL.DV_DIVES.length, "every dive should register");
  for (const q of SEL.DV_DIVES) for (const step of q.steps) {
    if (step.type === "station") continue;
    if (!PLACES.some((p) => p.id === step.target) && !(typeof step.target === "string" && step.target.startsWith("dv-egg-"))) assert(Array.isArray(q.anchor), `dive "${q.id}" step targets "${step.target}" with no anchor`);
  }
  const storage = fakeStorage();
  const dones = [];
  const off = ENGINE.dvOnDiveDone((e) => dones.push(e.diveId));
  const main = SEL.DV_DIVES.find((q) => q.id === "dv-main-00-pilings");
  eq(main.steps.map((s) => s.type).join(","), "goto,talk,station,station,talk", "the first main dive's step shape");
  const site = PLACES.find((p) => p.id === main.site);
  const at = { x: site.position[0], z: site.position[2] };
  ENGINE.dvAdvanceDives({ player: at, places: PLACES }, { storage });
  ENGINE.dvAdvanceDives({ player: at, places: PLACES, interact: true }, { storage });
  ENGINE.dvNoteStationReturn(main.steps[2].target, { storage });
  ENGINE.dvNoteStationReturn(main.steps[3].target, { storage });
  ENGINE.dvAdvanceDives({ player: at, places: PLACES, interact: true }, { storage });
  assert(ENGINE.dvDiveState(storage).find((q) => q.id === main.id).done, "the first main dive should be complete");
  const egg = SEL.DV_DIVES.find((q) => q.kind === "egg" && q.method === "comms");
  eq(egg.steps.map((s) => s.type).join(","), "talk,find", "a comms egg's step shape");
  ENGINE.dvAdvanceDives({ player: { x: egg.anchor[0], z: egg.anchor[1] }, places: PLACES, interact: true }, { storage });
  ENGINE.dvAdvanceDives({ player: { x: egg.anchor[0], z: egg.anchor[1] }, places: PLACES, interact: true }, { storage });
  assert(ENGINE.dvDiveState(storage).find((q) => q.id === egg.id).done, "the lantern egg should be complete");
  const rovDive = SEL.DV_DIVES.find((q) => q.steps.some((s) => s.type === "rov"));
  assert(rovDive, "the main arc should include an ROV step");
  assert(dones.includes(main.id) && dones.includes(egg.id), "dvOnDiveDone should have fired for both");
  const reloaded = ENGINE.dvDiveState(storage);
  assert(reloaded.find((q) => q.id === main.id).done && reloaded.find((q) => q.id === egg.id).done, "progress did not survive a fresh read");
  off();
  let threw = false;
  try { ENGINE.dvRegisterDives([{ id: "bad", steps: [{ type: "swim-through", target: "x" }] }]); } catch { threw = true; }
  assert(threw, "an unknown step type should be refused at registration");
  ENGINE.dvClearDives(); ENGINE.dvRegisterDives(SEL.DV_DIVES);
});

// ------------------------------------------------------------ 8. activities

await check("each of the four activities starts, steps and scores headlessly", () => {
  const storage = fakeStorage();
  eq(DIVES.DV_ACTIVITIES.length, 4, "four activities");
  for (const def of DIVES.DV_ACTIVITIES) {
    let s = ACT.dvStartActivity(def);
    if (s.kind === "time-trial") {
      for (const m of s.markers) s = ACT.dvStepActivity(s, { player: { x: m.point[0], z: m.point[1] } }, 1);
      assert(s.done && s.score > 0, `${def.id} should finish with a time`);
    } else if (s.kind === "photo") {
      for (const m of s.markers) s = ACT.dvStepActivity(s, { player: { x: m.point[0], z: m.point[1] }, interact: true }, 0.5);
      assert(s.done && s.score === s.markers.length, `${def.id} should finish with every viewpoint framed`);
    } else if (s.kind === "sweep") {
      for (const m of s.markers) s = ACT.dvStepActivity(s, { player: { x: m.point[0], z: m.point[1] }, interact: true }, 0.5);
      assert(s.done && /flagged for the work plan/.test(s.summary), `${def.id} should end with hazardous items flagged, not lifted`);
    } else if (s.kind === "drift") {
      const p = s.corridor[0];
      for (let i = 0; i < 200; i++) s = ACT.dvStepActivity(s, { player: { x: p[0], z: p[1] } }, 0.5);
      assert(s.done && s.score > 0.99, `${def.id} held in the corridor should score the whole run`);
    }
    const best = ACT.dvRecordActivityScore(def.id, def.kind, s.score, storage);
    assert(best.isNewBest && ACT.dvBestActivityScore(def.id, storage) === s.score, `${def.id}'s first run should be its best`);
  }
});

// ---------------------------------------------------------------- 9. map

await check("the map lists every site once, inside the canvas, with its visited/ascent state", () => {
  const storage = fakeStorage();
  const sites = MAP.dvMapSites(512, storage);
  eq(sites.length, SEA.DV_SITES.length, "every site, once");
  eq(new Set(sites.map((s) => s.id)).size, sites.length, "no site twice");
  for (const s of sites) { assert(s.x >= 0 && s.x <= 512 && s.y >= 0 && s.y <= 512, `${s.id} maps outside the canvas`); assert(!s.visited && !s.ascent, "a fresh career shows nothing visited"); }
  eq(MAP.dvMapLines(512).length, SEA.DV_LINES.length, "every line"); eq(MAP.dvMapLandmarks(512).length, SEA.DV_LANDMARKS.length, "every landmark"); eq(MAP.dvMapZones(512).length, SEA.DV_ZONES.length, "every zone");
});

// --------------------------------------------------------------- 10. wiring

await check("the underwater app is in the bundler's list with every module, its dist is built, and the home pages and Bay World link it", () => {
  const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
  const block = /"underwater":\s*\{[\s\S]*?"modules":\s*\[([\s\S]*?)\]/.exec(bundler)?.[1] ?? "";
  const bundled = [...block.matchAll(/(SHARED|WEBXR)\s*\/\s*"([^"]+)"/g)].map((m) => (m[1] === "SHARED" ? `shared/${m[2]}` : m[2]));
  assert(bundled.length > 0, 'tools/bundle_webxr.py has no "underwater" app');
  for (const f of ["seabed.js", "dives-data.js", "dives.js", "dives-select.js", "dive-engine.js", "dive-career.js", "dive-sim.js", "dive-map.js", "activities.js", "world.js", "app.js"]) assert(bundled.includes(`underwater/js/${f}`), `underwater/js/${f} is not in the bundle`);
  const sharedLanded = existsSync(join(WEBXR, "shared", "underwater-data.js")) && existsSync(join(WEBXR, "shared", "underwater.js"));
  const seabedSrc = readFileSync(jsPath("seabed.js"), "utf8"), worldSrc = readFileSync(jsPath("world.js"), "utf8");
  if (/from\s+"\.\.\/\.\.\/shared\/underwater-data\.js"/.test(seabedSrc)) {
    assert(sharedLanded, "seabed.js imports shared/underwater-data.js, which is not in the tree");
    assert(bundled.includes("shared/underwater-data.js") && bundled.includes("shared/underwater.js"), "the bundle is missing DEEP1's shared modules");
    assert(!bundled.includes("underwater/js/seabed-stub.js") && !bundled.includes("underwater/js/seabed-stub-scene.js"), "the stubs are still bundled after the switch to the shared modules");
    assert(/from\s+"\.\.\/\.\.\/shared\/underwater\.js"/.test(worldSrc), "world.js still imports the builder stub");
  } else {
    assert(bundled.includes("underwater/js/seabed-stub.js") && bundled.includes("underwater/js/seabed-stub-scene.js"), "the pre-integration stubs must be bundled while seabed.js reads them");
  }
  assert(bundled.includes("shared/records.js") && bundled.includes("shared/tracking.js") && bundled.includes("shared/input.js"), "the bundle is missing records.js, tracking.js or input.js");
  assert(/"underwater":\s*"underwater\.html"/.test(bundler), "underwater.html is not copied into the combined WebXR/dist folder");
  assert(existsSync(join(UW, "underwater.html")), "WebXR/underwater/underwater.html is missing");
  const distPath = join(UW, "dist", "underwater.html");
  assert(existsSync(distPath), "WebXR/underwater/dist/underwater.html has not been built — run python3 tools/bundle_webxr.py");
  const dist = readFileSync(distPath, "utf8");
  assert(dist.includes("DV_SITES") && dist.includes("dvRegisterDives") && dist.includes("TrainingRecords") && dist.includes("dvStepDiver") && dist.includes("DV_ALL_DIVES") && dist.includes("dvStartActivity"), "WebXR/underwater/dist/underwater.html is stale — run python3 tools/bundle_webxr.py");
  const external = [...dist.matchAll(/<(?:script|link|img|audio|video|source)\b[^>]*>/g)].map((m) => m[0]).filter((tag) => !/rel="preconnect"/.test(tag))
    .map((tag) => /(?:src|href)="(https?:[^"]+)"/.exec(tag)?.[1]).filter(Boolean).filter((u) => !/fonts\.(googleapis|gstatic)\.com/.test(u));
  assert(external.every((u) => u.startsWith("https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/")), `the bundle loads an unexpected external asset: ${external.join(", ")}`);
  const combined = join(WEBXR, "dist", "underwater.html");
  assert(existsSync(combined), "WebXR/dist/underwater.html is missing — run python3 tools/bundle_webxr.py");
  assert(readFileSync(combined, "utf8").includes("./smartcity-x.html?sim="), "the combined bundle's job-board link does not point at the flat smartcity-x.html");
  const home = readFileSync(join(WEBXR, "index.html"), "utf8"), flat = readFileSync(join(WEBXR, "home.html"), "utf8");
  assert(home.includes('href="underwater/underwater.html"') && home.includes("The Deep"), "WebXR/index.html has no The Deep card");
  assert(flat.includes('href="underwater.html"') && flat.includes("The Deep"), "WebXR/home.html has no The Deep card");
  const bay = readFileSync(join(WEBXR, "bayworld", "index.html"), "utf8");
  assert(/href="\.\.\/underwater\/underwater\.html"[^>]*>Dive</.test(bay), "Bay World's map has no \"Dive\" link to The Deep");
  assert(readFileSync(join(WEBXR, "dist", "bayworld.html"), "utf8").includes('href="./underwater.html"'), "the combined Bay World bundle's Dive link does not point at the flat underwater.html");
  const all = readFileSync(join(ROOT, "tools", "check_all.mjs"), "utf8");
  assert(all.includes('"check_underwater_game.mjs"') && all.includes('"check_dive_quests.mjs"'), "check_all.mjs does not run this checker and check_dive_quests.mjs");
});

await check("the app runs standalone (keyboard, touch, gamepad, camera, map, ?site= deep link) with a Home chip, and the HUD never renders a depth figure or a numeric reserve", () => {
  const app = readFileSync(jsPath("app.js"), "utf8");
  assert(/addEventListener\("keydown"/.test(app) && /addEventListener\("keyup"/.test(app), "app.js has no keyboard wiring");
  assert(/createGamepad\(/.test(app) && /pointerdown|tcMountTouch\(/.test(app), "app.js has no gamepad or touch wiring");
  assert(/KeyV/.test(app) && /cameraMode/.test(app) && /KeyM/.test(app) && /dvToggleMap/.test(app), "app.js has no camera or map toggle");
  assert(/params\.get\("site"\)/.test(app), "app.js does not read the ?site= deep link");
  const html = readFileSync(join(UW, "underwater.html"), "utf8");
  assert(/class="home-chip"/.test(html) && /href="\.\.\/index\.html"/.test(html), "underwater.html has no Home chip");
  assert(/id="hud-reserve-fill"/.test(html) && /id="hud-reserve-word"/.test(html), "the HUD has no reserve bar and word");
  assert(!/id="hud-depth"/.test(html) && !/\bdepth\b[^<]*<\/span>/i.test(html), "the HUD must not carry a depth readout");
  // The reserve reaches the DOM as a bar width and a word; the depth never reaches it at all.
  assert(!/hud-reserve-word"\)\.textContent\s*=\s*[^;]*(toFixed|Math\.round|\d)/.test(app), "the reserve word must not be a number");
  assert(!/textContent\s*=\s*[^;]*depth/i.test(app) && !/toFixed\([^)]*\)\s*\+\s*["'`]\s*m\b/.test(app), "app.js renders a depth figure somewhere");
  assert(/dvReserveLabel\(/.test(app), "the HUD does not use the qualitative reserve label");
});

// ------------------------------------------------------------ 11. safety net

const DV_ALL_FILES = ["underwater.html", "js/app.js", "js/world.js", "js/seabed.js", "js/seabed-stub.js", "js/seabed-stub-scene.js", "js/dive-sim.js", "js/dive-career.js", "js/dive-engine.js", "js/dives-select.js", "js/dives.js", "js/dive-map.js", "js/activities.js"]
  .map((f) => readFileSync(join(UW, f), "utf8")).join("\n");

await check("no third-party game, character or brand name and no violence appears in this app's own files", () => {
  const banned = [/subnautica/i, /abz[uû]/i, /minecraft/i, /roblox/i, /fortnite/i, /nintendo/i, /playstation/i, /xbox/i, /\bweapon\b/i, /\bgun\b/i, /\bshoot(ing)?\b/i, /\bharpoon\b/i, /\bspear(gun)?\b/i, /\bkill(ed|ing)?\b/i, /\bcrime\b/i];
  for (const re of banned) assert(!re.test(DV_ALL_FILES), `found a banned name or violent word matching ${re}`);
});

await check("no depth or time limit is stated as a figure, and no species is named as a claim, in this app's own files", () => {
  const stripped = DV_ALL_FILES.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const limits = [/no deeper than/i, /max(imum)? depth/i, /\d+\s*(msw|fsw)\b/i, /\d+\s*(m|metres|meters|ft|feet)\s+(deep|down|of depth)\b/i, /bottom time of \d/i];
  for (const re of limits) assert(!re.test(stripped), `a stated limit matches ${re}`);
  const species = [/\bsea otter/i, /\bharbor seal/i, /\bleopard shark/i, /\bdungeness/i, /\bzostera/i, /\bmacrocystis/i, /\bolympia oyster/i];
  for (const re of species) assert(!re.test(stripped), `a species is named as a claim, matching ${re}`);
});

console.log(failures ? `\n${failures} check(s) failed.` : `\nAll The Deep checks pass: the seabed adapts and builds, the diver swims and the ROV holds its tether, the reserve is a bar and a word, a return awards once, ${SEL.DV_DIVES.length} dives register and a main dive and a lantern complete, four activities score, the map lists every site.`);
process.exit(failures ? 1 : 0);
