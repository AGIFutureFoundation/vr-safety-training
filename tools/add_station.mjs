/**
 * Registers a new SmartCiti.X station everywhere it has to be known.
 *
 *     node tools/add_station.mjs transformer-vault
 *
 * A station is one authored module, but the tooling has to be told about it in
 * five separate places: the module list and the harness array in both
 * check_smartcity.mjs and gen_sims_meta.mjs, and the id list in
 * lib/headless.mjs. Missing any one of them fails in a different and
 * unhelpful way — a sim that checks clean but never appears on the hub, or a
 * hub kiosk for a sim the checkers never look at. Forty more stations at five
 * edits each is four hundred chances to get one wrong by hand.
 *
 * The export name is read out of the module rather than guessed from the id,
 * because the two have drifted before.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const id = process.argv[2];
if (!id) { console.error("usage: node tools/add_station.mjs <station-id>"); process.exit(1); }

const simPath = join(ROOT, `WebXR/smartcity/js/sims/${id}.js`);
if (!existsSync(simPath)) { console.error(`no such station module: WebXR/smartcity/js/sims/${id}.js`); process.exit(1); }

const src = readFileSync(simPath, "utf8");
const exp = src.match(/export const (SIM_[A-Z0-9_]+)\s*=/)?.[1];
if (!exp) { console.error(`${id}.js does not export a SIM_… constant`); process.exit(1); }

let touched = 0, already = 0;
function edit(rel, fn) {
  const p = join(ROOT, rel);
  const before = readFileSync(p, "utf8");
  const after = fn(before);
  if (after === before) { already += 1; return; }
  writeFileSync(p, after);
  touched += 1;
  console.log(`  updated ${rel}`);
}

// The module lists: append after the last sims/ entry so the order stays the
// order stations were added.
const appendModule = (s) => {
  if (s.includes(`sims/${id}.js`)) return s;
  const last = s.lastIndexOf('"smartcity/js/sims/');
  const end = s.indexOf("\n", last);
  return s.slice(0, end) + `\n  "smartcity/js/sims/${id}.js",` + s.slice(end);
};
// The harness arrays: append before the closing bracket.
const appendHarness = (s, name) => {
  if (new RegExp(`\\b${exp}\\b`).test(s)) return s;
  const re = new RegExp(`(${name} = \\[)([\\s\\S]*?)(\\];)`);
  return s.replace(re, (_, a, body, c) => `${a}${body.trimEnd().replace(/,$/, "")}, ${exp}${c}`);
};

edit("tools/check_smartcity.mjs", (s) => appendHarness(appendModule(s), "SIMS"));
edit("tools/gen_sims_meta.mjs", (s) => appendHarness(appendModule(s), "SIMS"));
edit("tools/lib/headless.mjs", (s) => {
  if (new RegExp(`"${id}"`).test(s)) return s;
  const m = s.match(/(\n\s*"[a-z0-9-]+",)(\s*\n\s*\];?)/);
  return m ? s.replace(m[0], `${m[1]} "${id}",${m[2]}`) : s.replace(/"backflow-test",/, `"backflow-test", "${id}",`);
});

console.log(`${id} → ${exp}: ${touched} file(s) updated${already ? `, ${already} already had it` : ""}`);
console.log("regenerating metadata…");
for (const cmd of ["node tools/gen_sims_meta.mjs", "node tools/gen_catalog.mjs"]) {
  console.log("  " + execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim().split("\n").pop());
}
console.log("run node tools/check_all.mjs next.");
