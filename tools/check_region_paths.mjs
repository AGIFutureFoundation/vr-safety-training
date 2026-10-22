// check_region_paths: the region paths (tools/gen_region_paths.mjs).
//
//   node tools/check_region_paths.mjs
//
// Proves the committed paths are what the generator writes now, that every step is
// an id the region's own training table lists and the catalog holds, that steps run
// in order (K-12, then trade programme, then robot), and that every path has at
// least two steps. Node only, no browser.

import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { buildRegionPaths, regionPath } = await import(pathToFileURL(join(ROOT, "tools", "gen_region_paths.mjs")).href);
const { REGION_TRAINING } = await import(pathToFileURL(join(ROOT, "WebXR", "shared", "region-training-data.js")).href);
const { REGION_PATHS } = await import(pathToFileURL(join(ROOT, "WebXR", "shared", "region-paths-data.js")).href);
const { REGION_CATALOG } = await import(pathToFileURL(join(ROOT, "tools", "gen_region_training.mjs")).href);

let passed = 0, failed = 0;
const check = (ok, label) => { if (ok) passed += 1; else { failed += 1; console.log(`  ✗ ${label}`); } };

console.log("check_region_paths: the region paths");

const fresh = await buildRegionPaths();

// 1 the committed paths are what the generator writes now
check(JSON.stringify(fresh) === JSON.stringify(REGION_PATHS), "the committed paths match a fresh build (run tools/gen_region_paths.mjs)");

// 2 one path per region, and the region ids match the table
check(REGION_PATHS.length === REGION_TRAINING.length, `one path per region (${REGION_PATHS.length} of ${REGION_TRAINING.length})`);
check(REGION_PATHS.every((p) => REGION_TRAINING.some((r) => r.id === p.id)), "every path belongs to a region in the table");

// 3 every step is an id the region's own table lists
const rank = { k12: 0, programme: 1, robot: 2 };
const listed = (row, step) => {
  if (step.kind === "k12") return row.k12Stations.includes(step.id) || row.k12.includes(step.id);
  if (step.kind === "programme") return row.programmes.includes(step.id);
  if (step.kind === "robot") return row.robot.includes(step.id);
  return false;
};
const byId = new Map(REGION_TRAINING.map((r) => [r.id, r]));
const unlisted = REGION_PATHS.flatMap((p) => p.steps.filter((s) => !listed(byId.get(p.id), s)).map((s) => `${p.id}: ${s.id}`));
check(unlisted.length === 0, `every step is listed by its region${unlisted.length ? ` (${unlisted.slice(0, 5).join(", ")})` : ""}`);

// 4 every step resolves in the catalog
const unresolved = REGION_PATHS.flatMap((p) => p.steps.filter((s) => s.kind === "k12" ? !REGION_CATALOG.stations.has(s.id) && !REGION_CATALOG.programmes.has(s.id) : !REGION_CATALOG.programmes.has(s.id)).map((s) => `${p.id}: ${s.id}`));
check(unresolved.length === 0, `every step resolves in the catalog${unresolved.length ? ` (${unresolved.slice(0, 5).join(", ")})` : ""}`);

// 5 steps run in order: K-12, then trade programme, then robot
check(REGION_PATHS.every((p) => p.steps.every((s, i) => i === 0 || rank[p.steps[i - 1].kind] <= rank[s.kind])), "steps run in order: K-12, trade programme, robot");

// 6 every path has at least two steps, and no step repeats
check(REGION_PATHS.every((p) => p.steps.length >= 2), "every path has at least two steps");
check(REGION_PATHS.every((p) => new Set(p.steps.map((s) => s.id)).size === p.steps.length), "no step repeats inside a path");

// 7 deterministic: a second run is identical
const again = await buildRegionPaths();
check(JSON.stringify(again) === JSON.stringify(fresh), "two runs give the same paths");

// 8 the path function is pure: the same row gives the same path
check(JSON.stringify(regionPath(REGION_TRAINING[0])) === JSON.stringify(regionPath(REGION_TRAINING[0])), "the path function is pure");

// Reported, not asserted: regions with no robot step yet
const noRobot = REGION_PATHS.filter((p) => !p.steps.some((s) => s.kind === "robot")).length;
console.log(`  · ${REGION_PATHS.length - noRobot} of ${REGION_PATHS.length} regions have a robot step; ${noRobot} do not yet`);

console.log(`check_region_paths: ${failed === 0 ? "all" : failed} ${failed === 0 ? "checks pass" : "failed"} (${passed} passed, ${failed} failed)`);
if (failed) process.exit(1);
