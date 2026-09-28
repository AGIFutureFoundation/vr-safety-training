// Wires a generated K-12 station into its programme (curricula.js) and onto a
// Bay World or Deep site board (bayworld-data.js / underwater-data.js).
//     node tools/k12-data/wire.mjs <stationId> <programmeId> <bay|deep>:<siteId> "<one-sentence why>"
// Idempotent: a second run changes nothing.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const [id, prog, where, why] = process.argv.slice(2);
if (!why) { console.error("usage: wire.mjs <stationId> <programmeId> <bay|deep>:<siteId> <why>"); process.exit(1); }

const cp = join(ROOT, "WebXR/smartcity/js/curricula.js");
let c = readFileSync(cp, "utf8");
if (!c.includes(`id: "${id}"`)) {
  const at = c.indexOf(`id: "${prog}"`);
  const open = c.indexOf("stations: [", at);
  const close = c.indexOf("\n    ],", open);
  c = c.slice(0, close) + `\n      { app: "smartcity", id: "${id}", why: ${JSON.stringify(why)} },` + c.slice(close);
  writeFileSync(cp, c);
}

const [world, site] = where.split(":");
const dp = join(ROOT, world === "deep" ? "WebXR/shared/underwater-data.js" : "WebXR/shared/bayworld-data.js");
let d = readFileSync(dp, "utf8");
const at = d.search(new RegExp(`id: ["']${site}["']`));
if (at < 0) { console.error(`no site ${site}`); process.exit(1); }
const end = d.indexOf("}", d.indexOf("stations:", at));
let row = d.slice(at, end);
if (!row.includes(`"${id}"`)) row = row.replace(/stations: \[([^\]]*)\]/, (m, s) => `stations: [${s.trim() ? s + ", " : ""}"${id}"]`);
if (!row.includes(`"${prog}"`)) row = row.replace(/programmes: \[([^\]]*)\]/, (m, s) => `programmes: [${s.trim() ? s + ", " : ""}"${prog}"]`);
d = d.slice(0, at) + row + d.slice(end);
writeFileSync(dp, d);
console.log(`wired ${id} → ${prog} @ ${where}`);
