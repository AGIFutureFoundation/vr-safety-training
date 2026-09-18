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

// A Quest-class headset comfortably draws a few hundred small meshes per
// station on top of the shared stage. Keep this in step with gen_catalog.mjs.
const MESH_BUDGET = 320;
const LIGHT_BUDGET = 12;

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
    if (c.meshes > MESH_BUDGET) {
      console.log(`  ✗ ${app}/${r.id}: ${c.meshes} meshes, over the ${MESH_BUDGET} headset budget`);
      failures += 1;
    }
    if (c.lights > LIGHT_BUDGET) {
      console.log(`  ✗ ${app}/${r.id}: ${c.lights} lights, over the ${LIGHT_BUDGET} budget`);
      failures += 1;
    }
  }
}

rows.sort((a, b) => b.meshes - a.meshes);
const worst = rows.slice(0, 3).map((r) => `${r.id} ${r.meshes}`).join(", ");
console.log(failures
  ? `\n${failures} station(s) over budget.`
  : `\nAll ${rows.length} stations inside the ${MESH_BUDGET}-mesh headset budget. Heaviest: ${worst}.`);
process.exit(failures ? 1 : 0);
