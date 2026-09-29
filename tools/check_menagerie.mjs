/**
 * MENAGERIE's street life, held to what it declares (docs/consoles/MENAGERIE.md).
 *
 *     node tools/check_menagerie.mjs
 *
 *   - counts: every parish map (all ten) and Bay World, high and low tier, day and night: counts by kind inside
 *     MG_BUDGET.caps, agents per 256 m chunk inside perChunk, per map inside perMap, triangles inside the budget
 *     and the engine's own estimate plus life inside NP_BUDGET.triangles, draw calls inside MG_BUDGET.drawCalls;
 *     life on every map (people and at least three animal kinds); night has fewer people and no fewer cats;
 *   - ground: no animal on open water unless it swims or flies; nothing inside a stub collider; with a stub
 *     sidewalkAt every walking passer-by stands on it; only cyclists and crossers on a road;
 *   - behaviour: flee distance honoured (an animal started beside a still avatar ends at least its flee radius
 *     away and never on open water unless it swims or flies), it settles home once the avatar leaves; a passer-by
 *     steps aside and nods, and never flees;
 *   - determinism: two plans and two stepped runs match exactly;
 *   - reduced motion: a still mount places the world and one minute of animate() moves nothing;
 *   - build: on the vendored three.js, one InstancedMesh per kind plus heads, triangles as drawn equal mgCost;
 *   - facts: no digit in a kind name or a `why` line; wiring: both apps mount it, the bundler carries it,
 *     check_all runs this checker; hygiene: mg/MG_ prefixes, no three.js import in mg-life.js.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const rd = (p) => readFileSync(join(ROOT, p), "utf8");
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);
let passed = 0, failed = 0;
const fail = (area, msg) => { failed += 1; if (failed <= 60) console.log(`  FAIL [${area}] ${msg}`); };
const check = (cond, area, msg) => (cond ? (passed += 1) : fail(area, msg));
const t0 = Date.now();

const MG = await imp("shared/mg-life.js");
const NP = await imp("shared/np-parish.js");
const { NP_PARISHES } = await imp("shared/np-parishes.js");
const BAY = await imp("shared/bayworld-data.js");
const { BW_SITES } = await imp("bayworld/js/city.js");
const { MG_KINDS, MG_BUDGET, MG_PEOPLE } = MG;

const maps = NP_PARISHES.map((p) => ({ id: p.id, parish: p, map: MG.mgParishMap(p) }));
maps.push({ id: "bayworld", parish: null, map: MG.mgBayMap({ roads: BAY.BAY_ROADS, sites: BW_SITES, zoneAt: (x, z) => BAY.bayZoneAt(x, z).id, roadAt: BAY.bayRoadAt, waterTopAt: BAY.txWaterTopAt, bounds: BAY.BAY_BOUNDS }) });
check(NP_PARISHES.length >= 10, "counts", `only ${NP_PARISHES.length} parish maps`);

// ------------------------------------------------------------------ counts and ground
const lines = [];
const plans = {};
for (const { id, parish, map } of maps) {
  for (const tier of ["high", "low"]) for (const night of [false, true]) {
    const plan = MG.mgPlan(map, { tier, night });
    if (tier === "high") plans[`${id}/${night ? "night" : "day"}`] = plan;
    const cost = MG.mgCost(plan);
    const tag = `${id}/${tier}/${night ? "night" : "day"}`;
    for (const [k, n] of Object.entries(cost.counts)) check(n <= MG_BUDGET.caps[k], "counts", `${tag}: ${n} ${k} over its cap ${MG_BUDGET.caps[k]}`);
    const byChunk = {};
    for (const a of plan) byChunk[a.chunk] = (byChunk[a.chunk] ?? 0) + 1;
    const worstChunk = Math.max(0, ...Object.values(byChunk));
    check(worstChunk <= MG_BUDGET.perChunk[tier], "budget", `${tag}: ${worstChunk} agents in one chunk, over ${MG_BUDGET.perChunk[tier]}`);
    check(plan.length <= MG_BUDGET.perMap[tier], "budget", `${tag}: ${plan.length} agents, over ${MG_BUDGET.perMap[tier]}`);
    check(cost.triangles <= MG_BUDGET.triangles, "budget", `${tag}: ${cost.triangles} triangles, over ${MG_BUDGET.triangles}`);
    check(cost.drawCalls <= MG_BUDGET.drawCalls, "budget", `${tag}: ${cost.drawCalls} draw calls, over ${MG_BUDGET.drawCalls}`);
    if (parish && tier === "high") {
      const engine = NP.npTriangleEstimate(parish, "high");
      check(engine + cost.triangles <= NP.NP_BUDGET.triangles, "budget", `${tag}: engine ${engine} + life ${cost.triangles} over ${NP.NP_BUDGET.triangles}`);
    }
    for (const a of plan) {
      const k = MG_KINDS[a.kind];
      check(!!k, "ground", `${tag}: unknown kind ${a.kind}`);
      const open = map.openWaterAt(a.x, a.z);
      if (k.moves === "swims") check(open, "ground", `${tag}: ${a.id} swims but stands on land at ${a.x.toFixed(0)},${a.z.toFixed(0)}`);
      else if (k.moves !== "flies") check(!open, "ground", `${tag}: ${a.id} on open water at ${a.x.toFixed(0)},${a.z.toFixed(0)}`);
      if (k.group === "person" && !a.onRoad && !a.wait) check(map.coverAt(a.x, a.z) !== "road", "ground", `${tag}: ${a.id} (${a.why}) stands on a road`);
      if (k.group !== "person" && k.moves === "ground") check(map.coverAt(a.x, a.z) !== "road", "ground", `${tag}: ${a.id} on a road`);
      check(!/\d/.test(a.why) && !/\d/.test(a.kind), "facts", `${tag}: a digit in "${a.why}"`);
    }
    if (tier === "high" && !night) {
      const people = MG_PEOPLE.reduce((s, k) => s + (cost.counts[k] ?? 0), 0);
      const animals = Object.keys(cost.counts).filter((k) => !MG_PEOPLE.includes(k));
      check(people >= 20, "counts", `${tag}: only ${people} passers-by`);
      check(animals.length >= 3, "counts", `${tag}: only ${animals.length} animal kinds`);
      lines.push(`${id}: ${plan.length} agents (${people} people, ${animals.length} animal kinds), worst chunk ${worstChunk}, ${cost.triangles} tri, ${cost.drawCalls} draw calls`);
    }
  }
  const day = MG.mgCost(plans[`${id}/day`]).counts, nightC = MG.mgCost(plans[`${id}/night`]).counts;
  const ppl = (c) => MG_PEOPLE.reduce((s, k) => s + (c[k] ?? 0), 0);
  check(ppl(nightC) < ppl(day), "counts", `${id}: night has no fewer people (${ppl(nightC)} vs ${ppl(day)})`);
  check((nightC.cat ?? 0) >= (day.cat ?? 0), "counts", `${id}: night has fewer cats`);
}
// Region kinds: sea lions only in San Francisco and Bay World, pelicans only over New Orleans water; a chicken, a heron somewhere.
{
  const all = Object.entries(plans).filter(([k]) => k.endsWith("/day"));
  for (const [key, plan] of all) {
    const id = key.split("/")[0], m = maps.find((x) => x.id === id).map;
    const c = MG.mgCounts(plan);
    if (c.sealion) check(m.region !== "new-orleans", "region", `${id}: sea lions in New Orleans`);
    if (c.pelican) check(m.region === "new-orleans", "region", `${id}: pelicans outside New Orleans`);
  }
  const sum = (k) => all.reduce((s, [, p]) => s + (MG.mgCounts(p)[k] ?? 0), 0);
  for (const k of MG.MG_KIND_NAMES) check(sum(k) > 0, "region", `no map places a ${k}`);
}
// Seams: a stub sidewalk and a stub collider are honoured; without them the road edges are used.
{
  const p = NP_PARISHES[0], map = MG.mgParishMap(p);
  const side = (x, z) => Math.floor(x / 3) % 2 === 0; // a stub: every other three-metre strip is sidewalk
  const box = { min: [-2048, -10, -2048], max: [0, 10, 0], kind: "stub" }; // a stub: the north-west quarter is all wall
  const plan = MG.mgPlan(map, { sidewalkAt: side, colliders: () => [box] });
  const walkers = plan.filter((a) => MG_KINDS[a.kind].group === "person" && a.leg && !a.onRoad);
  check(walkers.length > 0, "seams", "no passer-by placed with a stub sidewalkAt");
  for (const a of walkers) check(side(a.x, a.z), "seams", `${a.id} off the stub sidewalk`);
  for (const a of plan) if (MG_KINDS[a.kind].moves !== "flies") check(!(a.x <= 0 && a.z <= 0), "seams", `${a.id} inside the stub collider`);
  check(plans[`${p.id}/day`].some((a) => /road edge/.test(a.why)), "seams", "the fallback does not say it uses the road edges");
}

// ------------------------------------------------------------------ behaviour
{
  const map = maps[0].map;
  const flee = [];
  for (const kind of ["dog", "cat", "squirrel", "pigeon", "gull", "chicken", "egret"]) {
    const a0 = Object.values(plans).flat().find((a) => a.kind === kind);
    if (!a0) { fail("flee", `no ${kind} to test`); continue; }
    const m = maps.find((x) => a0.id.startsWith(`${x.id}-`)).map;
    const a = MG.mgAgent(a0, 0);
    const avatar = [a.x + 1, a.z + 0.5];
    let onWater = false;
    let maxLift = 0;
    for (let i = 0; i < 400; i++) { MG.mgStep(a, { pos: avatar, threats: [], map: m, t: i / 20 }, 0.05); maxLift = Math.max(maxLift, a.lift); if (m.openWaterAt(a.x, a.z) && MG_KINDS[kind].moves === "ground") onWater = true; }
    const d = Math.hypot(a.x - avatar[0], a.z - avatar[1]);
    check(d >= MG_KINDS[kind].flee, "flee", `${kind}: ${d.toFixed(1)} m from the avatar after fleeing, under ${MG_KINDS[kind].flee}`);
    check(!onWater, "flee", `${kind}: fled onto open water`);
    if (MG_KINDS[kind].moves === "flies") check(maxLift > 0.5, "flee", `${kind}: the flock did not lift`);
    // The avatar leaves: the animal settles home.
    for (let i = 0; i < 1600; i++) MG.mgStep(a, { pos: null, threats: [], map: m, t: 20 + i / 20 }, 0.05);
    const home = Math.hypot(a.x - a.home[0], a.z - a.home[1]);
    check(home <= MG_KINDS[kind].roam * 1.3 + 1, "flee", `${kind}: ${home.toFixed(1)} m from home a while after the avatar left`);
    flee.push(`${kind} ${d.toFixed(1)}/${MG_KINDS[kind].flee} m`);
  }
  // A vehicle is a threat too.
  {
    const a0 = Object.values(plans).flat().find((a) => a.kind === "dog");
    const m = maps.find((x) => a0.id.startsWith(`${x.id}-`)).map;
    const a = MG.mgAgent(a0, 0), car = [a.x - 1, a.z];
    for (let i = 0; i < 200; i++) MG.mgStep(a, { pos: null, threats: [car], map: m, t: i / 20 }, 0.05);
    check(Math.hypot(a.x - car[0], a.z - car[1]) >= MG_KINDS.dog.flee, "flee", "a dog does not flee a vehicle");
  }
  // A passer-by steps aside and nods, and does not run.
  {
    const a0 = plans[`${maps[0].id}/day`].find((a) => a.kind === "pedestrian" && a.leg && !a.crossing);
    const a = MG.mgAgent(a0, 0);
    for (let i = 0; i < 40; i++) MG.mgStep(a, { pos: [a.x + 0.8, a.z], threats: [], map, t: i / 20 }, 0.05);
    check(a.side > 0.5 && a.nod > 0.5, "aside", `a passer-by did not step aside and nod (side ${a.side.toFixed(2)}, nod ${a.nod.toFixed(2)})`);
    check(a.mode === "idle", "aside", "a passer-by fled");
  }
  lines.push(`flee: ${flee.join(", ")}`);
}

// ------------------------------------------------------------------ determinism
{
  for (const { id, map } of maps) check(JSON.stringify(MG.mgPlan(map, {})) === JSON.stringify(plans[`${id}/day`]), "determinism", `${id}: two plans differ`);
  const run = () => {
    const agents = plans[`${maps[0].id}/day`].slice(0, 80).map((p, i) => MG.mgAgent(p, i));
    for (let i = 0; i < 300; i++) for (const a of agents) MG.mgStep(a, { pos: [agents[0].home[0] + Math.sin(i / 30) * 20, agents[0].home[1]], threats: [], map: maps[0].map, t: i / 20 }, 0.05);
    return agents.map((a) => `${a.x.toFixed(4)},${a.z.toFixed(4)},${a.heading?.toFixed(4)}`).join(";");
  };
  check(run() === run(), "determinism", "two stepped runs differ");
}

// ------------------------------------------------------------------ build and reduced motion
{
  const THREE = await import(pathToFileURL(join(WEBXR, "vendor/three/dist/three.module.min.js")).href);
  for (const { id, parish, map } of [maps[0], maps[5], maps[maps.length - 1]]) {
    const root = new THREE.Group();
    const life = MG.mgMountLife({ three: THREE, root, parish: parish ?? undefined, map: parish ? undefined : map, groundAt: () => 0, pos: () => null, still: false });
    const st = life.stats();
    let tri = 0, ims = 0;
    root.traverse((n) => { if (n.isInstancedMesh) { ims += 1; tri += (n.geometry.attributes.position.count / 3) * n.count; } });
    check(ims === st.drawCalls && ims <= MG_BUDGET.drawCalls, "build", `${id}: ${ims} InstancedMeshes (stats ${st.drawCalls})`);
    check(tri === MG.mgCost(life.agents).triangles, "build", `${id}: built ${tri} triangles, mgCost counts ${MG.mgCost(life.agents).triangles}`);
    // moving: a minute of animate moves someone near the start
    const before = life.agents.map((a) => `${a.x},${a.z}`).join(";");
    for (let i = 1; i <= 60; i++) life.animate(i, 1);
    check(life.agents.map((a) => `${a.x},${a.z}`).join(";") !== before, "motion", `${id}: nothing moved in a minute`);
    // reduced motion: still
    const still = MG.mgMountLife({ three: THREE, root: new THREE.Group(), parish: parish ?? undefined, map: parish ? undefined : map, groundAt: () => 0, pos: () => [life.agents[0].x, life.agents[0].z], still: true });
    const m0 = still.meshes.map((m) => Array.from(m.instanceMatrix.array).join(",")).join("|");
    const s0 = still.agents.map((a) => `${a.x},${a.z}`).join(";");
    for (let i = 1; i <= 60; i++) still.animate(i, 1);
    check(still.agents.length > 0, "reduced", `${id}: reduced motion places no one`);
    check(still.agents.map((a) => `${a.x},${a.z}`).join(";") === s0 && still.meshes.map((m) => Array.from(m.instanceMatrix.array).join(",")).join("|") === m0, "reduced", `${id}: reduced motion moved an agent`);
    life.dispose(); check(!root.children.length, "build", `${id}: dispose left meshes behind`);
  }
  check(MG.mgReducedMotion() === false, "reduced", "mgReducedMotion reads true in Node");
}

// ------------------------------------------------------------------ wiring and hygiene
{
  const src = rd("WebXR/shared/mg-life.js");
  check(!/from\s+["']https?:/.test(src) && !/three\.module/.test(src), "hygiene", "mg-life.js imports three.js");
  for (const m of src.matchAll(/^export (?:const|function) (\w+)/gm)) check(/^(mg|MG_)/.test(m[1]), "hygiene", `export ${m[1]} lacks the mg/MG_ prefix`);
  for (const m of src.matchAll(/^(?:const|function|let) (\w+)/gm)) check(/^(mg|MG_)/.test(m[1]), "hygiene", `top-level ${m[1]} lacks the mg/MG_ prefix`);
  check(/prefers-reduced-motion/.test(src), "reduced", "mg-life.js does not read prefers-reduced-motion");
  const par = rd("WebXR/parishes/js/app.js"), bay = rd("WebXR/bayworld/js/app.js"), bun = rd("tools/bundle_webxr.py"), all = rd("tools/check_all.mjs");
  check(/mgMountLife\(/.test(par) && /mgLife\?\.animate/.test(par), "wiring", "the parishes app does not mount and animate life");
  check(/cwSidewalkAt/.test(par) && /cwColliders/.test(par), "wiring", "the parishes app does not pass CITYWORKS's seams");
  check(/mgMountLife\(/.test(bay) && /bwApp\.life\?\.animate/.test(bay), "wiring", "Bay World does not mount and animate life");
  check((bun.match(/"mg-life\.js"/g) ?? []).length >= 2, "wiring", "the bundler does not carry mg-life.js into both worlds");
  check(/"check_menagerie\.mjs"/.test(all), "wiring", "check_all does not run check_menagerie.mjs");
  check(/"check_menagerie\.mjs"/.test(rd("docs/perf/checkers-baseline.json")), "wiring", "checkers-baseline.json has no entry");
  check(/## Seams/.test(rd("docs/consoles/MENAGERIE.md")), "wiring", "docs/consoles/MENAGERIE.md has no Seams section");
}

for (const l of lines) console.log(`  ${l}`);
console.log(`check_menagerie: ${passed} passed, ${failed} failed (${maps.length} maps, ${MG.MG_KIND_NAMES.length} kinds, ${Date.now() - t0} ms)`);
process.exit(failed ? 1 : 0);
