/**
 * Headset mesh budget, enforced.
 *
 * catalog.json has carried a per-station mesh count and an `overBudget` flag
 * for a while, but nothing failed on it — a room could drift over the ceiling
 * and the only way to notice was to read the file. This builds every station
 * and room against the same headless harness the other checkers use and fails
 * the build on anything past the budget.
 *
 *     node tools/check_budget.mjs
 */
import { loadSmartCity, loadTrades } from "./lib/headless.mjs";

// What a Quest-class headset has left for content, which is not the same
// number in both apps because they are not the same scene.
//
// Read this as AUTHORED complexity, not as draw calls. mergeStatic() bakes the
// static scenery into one mesh per material at runtime, and it no-ops under
// this harness's three.js stub (no geometry API), so the counts here are what
// the build asks for before that happens. The shipped draw-call number is
// lower and is measured in a browser with ?perf=1 - see the headset budget
// section of the SmartCiti.X README. The ceiling here is still the right
// discipline: merging is not a licence to author without limit, because every
// merged mesh still costs vertices and every unique material still costs a
// call.
//
// A SmartCiti.X station is dropped onto the shared stage - plaza, district,
// skyline, weather and now the site apron - which is about 480 meshes before
// the station builds anything. A Trade Skills room IS the whole scene: its
// shell, its fittings and its props are all there is. So the room may carry
// what the station's stage is already spending.
const MESH_BUDGET = { smartcity: 320, trades: 430 };
const LIGHT_BUDGET = { smartcity: 12, trades: 14 };

const city = await loadSmartCity();
const trades = await loadTrades();

function count(suite, r) {
  const root = new suite.THREE.Group();
  r.build(root);
  let meshes = 0, lights = 0;
  root.traverse((o) => {
    if (o.isMesh || o.isPoints || o.isLine) meshes += 1;
    if (o.intensity !== undefined) lights += 1;
  });
  return { meshes, lights };
}

let failures = 0;
const rows = [];
for (const [app, suite, list] of [["smartcity", city, city.ROOMS], ["trades", trades, trades.ROOMS]]) {
  for (const r of list) {
    let c;
    try { c = count(suite, r); } catch (e) {
      console.log(`  ✗ ${app}/${r.id}: build threw — ${e.message}`);
      failures += 1;
      continue;
    }
    rows.push({ app, id: r.id, ...c });
    if (c.meshes > MESH_BUDGET[app]) {
      console.log(`  ✗ ${app}/${r.id}: ${c.meshes} meshes, over the ${MESH_BUDGET[app]} headset budget for ${app}`);
      failures += 1;
    }
    if (c.lights > LIGHT_BUDGET[app]) {
      console.log(`  ✗ ${app}/${r.id}: ${c.lights} lights, over the ${LIGHT_BUDGET[app]} budget for ${app}`);
      failures += 1;
    }
  }
}

rows.sort((a, b) => b.meshes / MESH_BUDGET[b.app] - a.meshes / MESH_BUDGET[a.app]);
const worst = rows.slice(0, 3).map((r) => `${r.id} ${r.meshes}/${MESH_BUDGET[r.app]}`).join(", ");
console.log(failures
  ? `\n${failures} station(s) over budget.`
  : `\nAll ${rows.length} stations inside budget (${MESH_BUDGET.smartcity} meshes on the stage, ${MESH_BUDGET.trades} standalone). Fullest: ${worst}.`);
process.exit(failures ? 1 : 0);
