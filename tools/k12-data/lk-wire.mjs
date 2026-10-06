// LA-K12 — wires the Louisiana K-12 stations into their classroom programmes in curricula.js (the map anchors, the
// character fallback and the SCHOLAR hooks live in WebXR/shared/lk-la-lessons.js).
//     node tools/k12-data/lk-wire.mjs
// Idempotent: a second run changes nothing.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const { LK_LESSONS } = await import("../../WebXR/shared/lk-la-lessons.js");

const cp = join(ROOT, "WebXR/smartcity/js/curricula.js");
let c = readFileSync(cp, "utf8");
let added = 0;
for (const l of LK_LESSONS) {
  if (c.includes(`id: "${l.station}"`)) continue;
  const at = c.indexOf(`id: "${l.programme}"`);
  if (at < 0) throw new Error(`no programme ${l.programme}`);
  const open = c.indexOf("stations: [", at);
  const close = c.indexOf("\n    ],", open);
  c = c.slice(0, close) + `\n      { app: "smartcity", id: "${l.station}", why: ${JSON.stringify(l.programmeWhy)} },` + c.slice(close);
  added++;
}
writeFileSync(cp, c);
console.log(`lk-wire: ${added} Louisiana K-12 station(s) added to their programmes`);
