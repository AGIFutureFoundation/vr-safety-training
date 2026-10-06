// BAYOU — wires the New Orleans parish K-12 stations into their classroom
// programmes in curricula.js (the parish anchor, the flow and the apply step live
// in WebXR/shared/by-parish-lessons.js, not on a Bay World board).
//     node tools/k12-data/by-wire.mjs
// Idempotent: a second run changes nothing.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const { BY_LESSONS } = await import("../../WebXR/shared/by-parish-lessons.js");

const cp = join(ROOT, "WebXR/smartcity/js/curricula.js");
let c = readFileSync(cp, "utf8");
let added = 0;
for (const l of BY_LESSONS) {
  if (c.includes(`id: "${l.station}"`)) continue;
  const at = c.indexOf(`id: "${l.programme}"`);
  if (at < 0) throw new Error(`no programme ${l.programme}`);
  const open = c.indexOf("stations: [", at);
  const close = c.indexOf("\n    ],", open);
  c = c.slice(0, close) + `\n      { app: "smartcity", id: "${l.station}", why: ${JSON.stringify(l.programmeWhy)} },` + c.slice(close);
  added++;
}
writeFileSync(cp, c);
console.log(`by-wire: ${added} parish station(s) added to their programmes`);
