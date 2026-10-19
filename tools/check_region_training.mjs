// check_region_training: the region training map (tools/gen_region_training.mjs).
//
//   node tools/check_region_training.mjs
//
// Proves the committed table is what the generator writes now, that every region
// resolves against the catalog and the unions registry, and that a run is
// deterministic and carries no contact details. Node only, no browser.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { buildRegionTraining, loadRegions, REGION_CATALOG, ROBOT_PROGRAMMES } = await import(
  pathToFileURL(join(ROOT, "tools", "gen_region_training.mjs")).href
);
const { REGION_TRAINING } = await import(pathToFileURL(join(ROOT, "WebXR", "shared", "region-training-data.js")).href);

let passed = 0, failed = 0;
const check = (ok, label) => { if (ok) passed += 1; else { failed += 1; console.log(`  ✗ ${label}`); } };

console.log("check_region_training: the region training map");

const fresh = await buildRegionTraining();
const regionFiles = readdirSync(join(ROOT, "WebXR", "shared")).filter((f) => /^np-data-.*\.js$/.test(f));

// 1 the committed table is what the generator writes now
check(JSON.stringify(fresh) === JSON.stringify(REGION_TRAINING), "the committed table matches a fresh build (run tools/gen_region_training.mjs)");

// 2 every mapped region is in the table, once
check(fresh.length === regionFiles.length, `every region file is in the table (${fresh.length} of ${regionFiles.length})`);
check(new Set(fresh.map((r) => r.id)).size === fresh.length, "no region id appears twice");

// 3 every region has training at some site, and a name
check(fresh.every((r) => r.sitesWithProgrammes > 0), "every region has at least one site with training");
check(fresh.every((r) => r.name && r.name.trim().length > 0), "every region has a name");

// 4 nothing unresolved: every programme and union id is in the catalog or the registry
const unresolvedP = fresh.flatMap((r) => r.unresolved.programmes.map((p) => `${r.id}: ${p}`));
const unresolvedU = fresh.flatMap((r) => r.unresolved.unions.map((u) => `${r.id}: ${u}`));
check(unresolvedP.length === 0, `every programme id resolves in the catalog${unresolvedP.length ? ` (${unresolvedP.slice(0, 5).join(", ")})` : ""}`);
check(unresolvedU.length === 0, `every union id resolves in the registry${unresolvedU.length ? ` (${unresolvedU.slice(0, 5).join(", ")})` : ""}`);

// 5 the lists are sound: programmes from the catalog, K-12 tracks are k12-, robot programmes are the named ones
check(fresh.every((r) => r.programmes.every((p) => REGION_CATALOG.programmes.has(p))), "every listed programme is a catalog programme");
check(fresh.every((r) => r.k12.every((p) => p.startsWith("k12-"))), "every K-12 entry is a K-12 track");
check(fresh.every((r) => r.robot.every((p) => ROBOT_PROGRAMMES.includes(p))), "every robot entry is one of the named robot programmes");
check(ROBOT_PROGRAMMES.every((p) => REGION_CATALOG.programmes.has(p)), "the named robot programmes exist in the catalog");

// 6 deterministic: a second run is identical
const again = await buildRegionTraining();
check(JSON.stringify(again) === JSON.stringify(fresh), "two runs give the same table");

// 7 no contact details in the table
const text = JSON.stringify(fresh);
check(!/[\w.+-]+@[\w-]+\.[\w.]+/.test(text), "no email address in the table");
check(!/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(text), "no phone number in the table");

// 8 the loader reads each region's first export only
const loaded = await loadRegions();
check(loaded.length === regionFiles.length, "the loader reads every region module");

console.log(`check_region_training: ${failed === 0 ? "all" : failed} ${failed === 0 ? "checks pass" : "failed"} (${passed} passed, ${failed} failed)`);
if (failed) process.exit(1);
