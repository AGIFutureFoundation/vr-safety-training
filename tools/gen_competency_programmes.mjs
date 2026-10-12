// Keep the programme tier of WebXR/shared/competency.js mirrored on the
// programmes in WebXR/smartcity/js/curricula.js: one competency per
// programme, its stations the programme's SmartCiti.X and Trade Skills
// stations in programme order, `require` half of them capped at six (the
// rule docs/proof-of-training.md states). Run by gen_catalog.mjs, so any
// add_station that fills a programme slot keeps the two in step.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COMP = join(ROOT, "WebXR/shared/competency.js");
const { CURRICULA } = await import("../WebXR/smartcity/js/curricula.js");

let src = readFileSync(COMP, "utf8");
let changed = 0;
for (const prog of CURRICULA) {
  const ids = prog.stations.map((s) => s.id);
  const require = Math.max(1, Math.min(6, Math.ceil(ids.length / 2)));
  const re = new RegExp(`(\\n  \\{\\n    id: "${prog.id}",[\\s\\S]*?kind: "programme",[\\s\\S]*?stations: \\[)[\\s\\S]*?(\\],\\n    require: )\\d+(,\\n  \\},)`);
  const m = src.match(re);
  if (!m) { console.warn(`no programme competency for ${prog.id} — add one by hand`); continue; }
  const lines = [];
  for (let i = 0; i < ids.length; i += 4) lines.push("      " + ids.slice(i, i + 4).map((x) => `"${x}"`).join(", "));
  const body = "\n" + lines.join(",\n") + "\n    ";
  const next = src.replace(re, `$1${body}$2${require}$3`);
  if (next !== src) { changed++; src = next; }
}
writeFileSync(COMP, src);
console.log(`competency.js: ${changed} programme competenc${changed === 1 ? "y" : "ies"} re-synced from curricula.js`);
