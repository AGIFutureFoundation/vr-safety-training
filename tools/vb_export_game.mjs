// VBRIDGE: write the GAME-style function descriptors for the Holodeck's robot actions
// (simulated robots only) to exports/shared/vb-game-functions.json. Deterministic.
// Usage: node tools/vb_export_game.mjs [--check]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { vbGameFunctions } from "../WebXR/shared/vb-providers.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "exports/shared/vb-game-functions.json");
const text = JSON.stringify(vbGameFunctions(), null, 2) + "\n";
if (process.argv.includes("--check")) {
  let cur = ""; try { cur = readFileSync(OUT, "utf8"); } catch (_) { /* missing */ }
  console.log(cur === text ? "vb-game-functions.json up to date" : "vb-game-functions.json STALE: run node tools/vb_export_game.mjs");
  process.exit(cur === text ? 0 : 1);
}
writeFileSync(OUT, text);
const d = JSON.parse(text);
console.log(`wrote ${OUT.slice(ROOT.length + 1)}: ${d.workers.length} workers, ${d.workers.reduce((n, w) => n + w.functions.length, 0)} functions, ${text.length} bytes`);
