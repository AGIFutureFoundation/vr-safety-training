/**
 * The sky, the weather recipe and the wildlife (shared/sky.js,
 * shared/wildlife.js — docs/consoles/SKY.md), checked headlessly:
 *
 *   - skyFor(time, weather) is finite and in range for every time band, a
 *     spread of clock hours, and every WEATHER_KINDS entry: colours are
 *     0..0xffffff, fog density and visibility bounded, sunDir a unit vector,
 *     wind speed and direction bounded, and the same inputs give the same
 *     numbers twice;
 *   - buildSky() builds at every band × kind inside SKY_BUDGET (meshes and
 *     vertices), and set()/animate() run without throwing;
 *   - buildWildlife() builds every WILDLIFE_KINDS entry at its default count
 *     inside WILDLIFE_BUDGET[kind].meshes, tags the group and every animal
 *     with userData.wildlife.kind, animates without throwing, and one of
 *     everything stays inside WILDLIFE_BUDGET.total;
 *   - advanceSky() walks SKY_DRIFT in order, wraps the clock inside [0, 24)
 *     and delivers every event to a skyOn() hook;
 *   - the Field Guide: eight FIELD_GUIDE_EGGS, each an egg sighted (not
 *     quoted) at a real BAY_LANDMARKS entry, naming a WILDLIFE_KINDS kind,
 *     one line each with no digit, no season word and no real-place claim;
 *   - the pier-fishing activity exists at the north pier with the rig,
 *     cast-clear, hook, wet-hands and licence rules, and carries no digit
 *     anywhere (no size, bag or season figure);
 *   - the wiring: Bay World and Fairway Park import sky.js, the Bay World HUD
 *     shows the weather word and the wind, the bundler lists both modules
 *     for both apps, and this checker is in check_all.
 *
 *     node tools/check_sky.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildSuite, WEBXR, ROOT } from "./lib/headless.mjs";

const MODULES = ["shared/weather.js", "shared/sky.js", "shared/wildlife.js"];
const HARNESS = `export {
  WEATHER_KINDS, SKY_BUDGET, SKY_DRIFT, skyFor, skyTimeBucket, skyCloudCover, skyCompass, buildSky, skyState, skyOn, advanceSky, skySetWeather,
  WILDLIFE_BUDGET, WILDLIFE_KINDS, buildWildlife, wlSightings, THREE,
};`;
const S = await buildSuite(MODULES, HARNESS, "sky");
const {
  WEATHER_KINDS, SKY_BUDGET, SKY_DRIFT, skyFor, skyTimeBucket, skyCompass, buildSky, skyState, skyOn, advanceSky, skySetWeather,
  WILDLIFE_BUDGET, WILDLIFE_KINDS, buildWildlife, wlSightings, THREE,
} = S;

let failures = 0;
const fail = (id, msg) => { console.log(`  ✗ ${id}: ${msg}`); failures += 1; };
const colourOk = (c) => Number.isInteger(c) && c >= 0 && c <= 0xffffff;
const countMeshes = (root) => { let n = 0; root.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) n += 1; }); return n; };

// ------------------------------------------------------------------ recipe
const TIMES = ["day", "dusk", "night", 0, 3, 5.5, 6, 9, 12, 17.9, 18, 19.5, 20, 23.5];
let recipes = 0;
for (const time of TIMES) {
  for (const kind of WEATHER_KINDS) {
    const id = `skyFor(${time}, ${kind})`;
    let r;
    try { r = skyFor(time, kind); } catch (e) { fail(id, `threw: ${e.message}`); continue; }
    recipes += 1;
    if (!colourOk(r.sky)) fail(id, `sky colour ${r.sky} out of range`);
    if (!colourOk(r.fog)) fail(id, `fog colour ${r.fog} out of range`);
    if (!(r.fogDensity > 0 && r.fogDensity <= 0.05)) fail(id, `fogDensity ${r.fogDensity} out of (0, 0.05]`);
    if (!(r.visibility >= 50 && r.visibility <= 5000)) fail(id, `visibility ${r.visibility} out of [50, 5000]`);
    const len = Math.hypot(r.sunDir?.x, r.sunDir?.y, r.sunDir?.z);
    if (!(Math.abs(len - 1) < 1e-6) || !(r.sunDir.y > 0)) fail(id, `sunDir is not a unit vector above the horizon`);
    if (!(r.wind?.speed >= 0 && r.wind.speed <= 30)) fail(id, `wind speed ${r.wind?.speed} out of [0, 30]`);
    if (!(r.wind?.dir >= 0 && r.wind.dir < Math.PI * 2)) fail(id, `wind dir ${r.wind?.dir} out of [0, 2π)`);
    if (!(r.cover >= 0 && r.cover <= 1)) fail(id, `cover ${r.cover} out of [0, 1]`);
    if (r.band !== skyTimeBucket(time) || r.kind !== kind || typeof r.label !== "string") fail(id, "band/kind/label do not read back");
    for (const [k, v] of Object.entries(r)) if (typeof v === "number" && !Number.isFinite(v)) fail(id, `${k} is not finite`);
    const again = skyFor(time, kind);
    if (JSON.stringify(again) !== JSON.stringify(r)) fail(id, "not deterministic");
  }
}
if (skyTimeBucket(9) !== "day" || skyTimeBucket(19) !== "dusk" || skyTimeBucket(2) !== "night" || skyTimeBucket("dusk") !== "dusk") fail("skyTimeBucket", "hour → band mapping is off");
if (skyFor("day", "storm").fogDensity <= skyFor("day", "clear").fogDensity) fail("recipe", "storm must be foggier than clear");
if (skyFor("night", "clear").sky >= skyFor("day", "clear").sky) fail("recipe", "night sky must be darker than day");
if (skyFor("day", "wind").wind.speed <= skyFor("day", "clear").wind.speed) fail("recipe", "the wind kind must blow harder than clear");
if (!["N", "NE", "E", "SE", "S", "SW", "W", "NW"].includes(skyCompass(1.3))) fail("skyCompass", "no compass word");
if (skyFor("day", "not-a-kind").kind !== "clear" || skyFor("noon", "clear").band !== "day") fail("recipe", "unknown inputs must fall back to clear/day");

// -------------------------------------------------------------------- dome
let domes = 0;
for (const band of ["day", "dusk", "night"]) {
  for (const kind of WEATHER_KINDS) {
    const id = `buildSky(${band}, ${kind})`;
    const root = new THREE.Group();
    let sky;
    try { sky = buildSky(root, { time: band, weather: kind }); } catch (e) { fail(id, `threw: ${e.message}`); continue; }
    domes += 1;
    const meshes = countMeshes(root);
    if (meshes > SKY_BUDGET.meshes) fail(id, `${meshes} meshes, budget ${SKY_BUDGET.meshes}`);
    if (sky.meshCount !== meshes) fail(id, `reports meshCount ${sky.meshCount}, tree holds ${meshes}`);
    if (!(sky.vertices > 0 && sky.vertices <= SKY_BUDGET.vertices)) fail(id, `${sky.vertices} vertices, budget ${SKY_BUDGET.vertices}`);
    if (!root.children.some((c) => c.userData?.sky)) fail(id, "dome group is not tagged userData.sky");
    try {
      sky.set(19.5, "fog"); sky.set("night", "storm"); sky.set(band, kind);
      sky.animate(1, 1 / 60, { position: { x: 100, y: 2, z: -50 } }); sky.animate(2, 1 / 60, null);
    } catch (e) { fail(id, `set/animate threw: ${e.message}`); }
    if (sky.recipe?.kind !== kind || sky.recipe?.band !== band) fail(id, "recipe does not read back after set()");
  }
}

// ---------------------------------------------------------------- wildlife
const kindsBuilt = [];
let wildlifeTotal = 0;
const all = new THREE.Group();
for (const kind of WILDLIFE_KINDS) {
  const id = `buildWildlife(${kind})`;
  const budget = WILDLIFE_BUDGET[kind];
  if (!budget || typeof budget.meshes !== "number" || typeof budget.count !== "number") { fail(id, "no WILDLIFE_BUDGET entry with count and meshes"); continue; }
  let g;
  try { g = buildWildlife(all, { zone: { x: 20, z: -30, w: 80, d: 60, y: -0.4 }, kind }); } catch (e) { fail(id, `threw: ${e.message}`); continue; }
  kindsBuilt.push(kind);
  const meshes = countMeshes(g.root);
  wildlifeTotal += meshes;
  if (meshes > budget.meshes) fail(id, `${meshes} meshes, budget ${budget.meshes}`);
  if (g.meshCount !== meshes) fail(id, `reports meshCount ${g.meshCount}, tree holds ${meshes}`);
  if (g.root.userData?.wildlife?.kind !== kind) fail(id, "group is not tagged userData.wildlife.kind");
  let tagged = 0;
  g.root.traverse((o) => { if (o !== g.root && o.userData?.wildlife?.kind === kind) tagged += 1; });
  if (tagged < 1) fail(id, "no individual is tagged userData.wildlife");
  if (g.count < 1 || g.count > budget.count) fail(id, `count ${g.count} outside 1..${budget.count}`);
  try { for (let t = 0; t < 30; t += 0.5) g.animate(t, 0.5); } catch (e) { fail(id, `animate threw: ${e.message}`); }
  const over = buildWildlife(new THREE.Group(), { zone: { x: 0, z: 0, w: 10, d: 10, y: 0 }, kind, count: 9999 });
  if (over.count > budget.count) fail(id, "count is not capped at the budget");
}
if (wildlifeTotal > WILDLIFE_BUDGET.total) fail("wildlife", `one of everything is ${wildlifeTotal} meshes, WILDLIFE_BUDGET.total is ${WILDLIFE_BUDGET.total}`);
{
  const seen = wlSightings(all, 20, -30, 10);
  for (const kind of kindsBuilt) if (seen[kind] !== 1) fail("wlSightings", `${kind} not sighted at its own zone centre`);
  const none = wlSightings(all, 900, 900, 10);
  if (Object.keys(none).length) fail("wlSightings", "sighted wildlife far from every group");
}
if (buildWildlife(new THREE.Group(), { kind: "dragons" }).kind !== "gulls") fail("wildlife", "an unknown kind must fall back to gulls");

// ------------------------------------------------------------------- drift
{
  const st = skyState({ hours: 17.5, weather: "clear", dayRate: 1 / 60, driftEvery: 10 });
  const got = [];
  skyOn(st, (e) => got.push(e));
  const polled = [];
  for (let i = 0; i < 120; i++) polled.push(...advanceSky(st, 0.5));   // 60 s: six drift steps, half an hour of clock
  const weatherEvents = polled.filter((e) => e.type === "weather");
  const expected = ["overcast", "fog", "wind", "clear", "overcast", "fog"];
  if (weatherEvents.map((e) => e.to).join(",") !== expected.join(",")) fail("advanceSky", `drift order ${weatherEvents.map((e) => e.to).join(",")}, expected ${expected.join(",")}`);
  for (const e of weatherEvents) if (!SKY_DRIFT.includes(e.to) || !WEATHER_KINDS.includes(e.to)) fail("advanceSky", `drifted to unknown kind ${e.to}`);
  if (JSON.stringify(got) !== JSON.stringify(polled)) fail("skyOn", "hook did not receive exactly the polled events");
  if (!polled.some((e) => e.type === "band" && e.from === "day" && e.to === "dusk")) fail("advanceSky", "no day → dusk band event at 18:00");
  if (!(st.hours >= 0 && st.hours < 24)) fail("advanceSky", `hours ${st.hours} outside [0, 24)`);
  const wrap = skyState({ hours: 23.9, dayRate: 1, driftEvery: 0 });
  advanceSky(wrap, 1);
  if (!(wrap.hours >= 0 && wrap.hours < 1)) fail("advanceSky", `clock did not wrap: ${wrap.hours}`);
  const frozen = skyState({ hours: 9, dayRate: 0, driftEvery: 0 });
  if (advanceSky(frozen, 1000).length || frozen.hours !== 9) fail("advanceSky", "dayRate 0 / driftEvery 0 must change nothing");
  const set = skyState({ weather: "clear", driftEvery: 5 });
  skySetWeather(set, "fog");
  const next = advanceSky(set, 5).find((e) => e.type === "weather");
  if (set.weather !== "wind" || next?.from !== "fog") fail("skySetWeather", "the drift does not continue from the kind set");
}

// ------------------------------------------------------------- field guide
const Q = await import(pathToFileURL(join(WEBXR, "bayworld", "js", "quests.js")).href);
const { BAY_LANDMARKS } = await import(pathToFileURL(join(WEBXR, "shared", "bayworld-data.js")).href);
const SEASON_WORDS = ["spring", "summer", "autumn", "fall ", "winter", "season", "migrat", "breeding", "nesting", "annual"];
const PLACE_WORDS = ["oakland", "alameda", "berkeley", "san francisco", "bay area", "california", "pacific", "golden gate", "emeryville", "richmond"];
const COUNT_WORDS = ["hundred", "thousand", "dozen", "million", "colony of", "population"];
{
  const eggs = Q.FIELD_GUIDE_EGGS;
  if (!Array.isArray(eggs) || eggs.length !== 8) fail("field guide", `expected eight FIELD_GUIDE_EGGS, found ${eggs?.length}`);
  const ids = new Set();
  const kinds = new Set();
  for (const e of eggs ?? []) {
    const id = `field guide ${e.id}`;
    if (ids.has(e.id)) fail(id, "duplicate id"); ids.add(e.id);
    if (e.kind !== "egg" || e.method !== "sight" || e.giver !== "found, not given") fail(id, "must be kind egg, method sight, found not given");
    if (!WILDLIFE_KINDS.includes(e.wildlife)) fail(id, `wildlife "${e.wildlife}" is not a WILDLIFE_KINDS entry`);
    kinds.add(e.wildlife);
    if (!Q.resolveLandmark(e.landmark, BAY_LANDMARKS)) fail(id, `landmark "${e.landmark}" resolves to no BAY_LANDMARKS entry`);
    if (typeof e.note !== "string" || !e.note.trim() || e.note.includes("\n") || e.note.length > 200) fail(id, "note must be one line");
    const lower = (e.note ?? "").toLowerCase();
    if (/\d/.test(lower)) fail(id, "note contains a digit (a count or a figure)");
    for (const w of [...SEASON_WORDS, ...PLACE_WORDS, ...COUNT_WORDS]) if (lower.includes(w)) fail(id, `note contains "${w.trim()}"`);
    if (!Array.isArray(e.steps) || !e.steps.some((s) => s.type === "goto") || !e.steps.some((s) => s.type === "find")) fail(id, "needs a goto step and a find step");
    if (!Q.ALL_QUESTS.includes(e)) fail(id, "not in ALL_QUESTS, so the game never registers it");
    if (Q.EGG_QUESTS.includes(e)) fail(id, "must not sit in EGG_QUESTS (those quote a station step)");
  }
  if (kinds.size < 6) fail("field guide", `only ${kinds.size} wildlife kinds covered across the eight eggs`);
}

// ------------------------------------------------------------ pier fishing
{
  const a = Q.SIDE_ACTIVITIES.find((x) => x.id === "bw-activity-pier-fishing");
  if (!a) fail("pier fishing", "bw-activity-pier-fishing is missing from SIDE_ACTIVITIES");
  else {
    const id = "pier fishing";
    if (a.kind !== "fishing") fail(id, `kind is "${a.kind}", expected "fishing"`);
    if (!Q.resolveLandmark(a.site, BAY_LANDMARKS) || !/pier/i.test(a.site)) fail(id, `site "${a.site}" is not the pier landmark`);
    const blob = JSON.stringify(a).toLowerCase();
    if (/\d/.test(blob)) fail(id, "the activity carries a digit (no size, bag or season figure is allowed)");
    for (const w of ["inch", " cm", "pound", "bag limit", "season", "per day"]) if (blob.includes(w)) fail(id, `text contains "${w.trim()}"`);
    for (const w of PLACE_WORDS) if (blob.includes(w)) fail(id, `text names a real place: "${w}"`);
    const rules = (a.rules ?? []).join(" ").toLowerCase();
    for (const [need, why] of [["rig", "rig check"], ["behind", "cast with the area clear behind"], ["hook", "hook handling"], ["wet hands", "release with wet hands"], ["release", "release"], ["licence", "the licence"], ["state's rules", "per the state's rules"]]) {
      if (!rules.includes(need)) fail(id, `rules do not cover ${why}`);
    }
    if (!a.scoring || !Array.isArray(a.scoring.criteria) || !a.scoring.criteria.length) fail(id, "no scoring criteria");
  }
}

// ------------------------------------------------------------------ wiring
{
  const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
  const bw = read("WebXR/bayworld/js/world.js"), fw = read("WebXR/fairway/js/world.js"), app = read("WebXR/bayworld/js/app.js");
  if (!bw.includes("shared/sky.js") || !bw.includes("shared/wildlife.js")) fail("wiring", "bayworld/js/world.js does not import sky.js and wildlife.js");
  if (!bw.includes("buildSky(") || !bw.includes("buildWildlife(") || !bw.includes("advanceSky(")) fail("wiring", "bayworld/js/world.js does not build the sky, the wildlife and drift the weather");
  if (!fw.includes("shared/sky.js") || !fw.includes("buildSky(")) fail("wiring", "fairway/js/world.js does not use the same sky");
  if (!app.includes("hud-weather") || !/hud-weather[\s\S]{0,200}wind/.test(app)) fail("wiring", "bayworld/js/app.js's HUD does not show the weather word and the wind");
  if (!read("WebXR/bayworld/index.html").includes('id="hud-weather"')) fail("wiring", "bayworld/index.html has no hud-weather element");
  const bundler = read("tools/bundle_webxr.py");
  if ((bundler.match(/SHARED \/ "sky\.js"/g) ?? []).length < 2 || (bundler.match(/SHARED \/ "wildlife\.js"/g) ?? []).length < 2) fail("wiring", "tools/bundle_webxr.py must list sky.js and wildlife.js for both bayworld and fairway");
  if (!read("tools/check_all.mjs").includes("check_sky.mjs")) fail("wiring", "check_all.mjs does not list check_sky.mjs");
}

console.log(failures
  ? `\n${failures} sky/wildlife problem(s).`
  : `\nSky: ${recipes} time × weather recipes finite and in range, ${domes} domes built ≤ ${SKY_BUDGET.meshes} meshes / ${SKY_BUDGET.vertices} vertices, ${kindsBuilt.length} wildlife kinds ≤ their budgets (${wildlifeTotal}/${WILDLIFE_BUDGET.total} meshes for one of everything), the drift walks ${SKY_DRIFT.join(" → ")}, eight Field Guide eggs and the pier-fishing activity present with no figures.`);
process.exit(failures ? 1 : 0);
