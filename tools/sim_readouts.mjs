// A gauge or track step that shows only a coloured band gets a text readout in the band's own words, so the value is
// never colour alone (check_a11y). Used by gen_k12_station.mjs on what it writes, and run once over the committed sims:
//   node tools/sim_readouts.mjs            rewrite every sim missing a readout
//   node tools/sim_readouts.mjs --check    exit 1 if any would change
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RE = /(\n(\s*)(gauge|track): \{)([^{}]*?)(\n\s*\},?)/g;
/** Add `readout` to every gauge/track object literal (no nested braces) that has a `green` band and no readout. */
export function simWithReadouts(src) {
  return src.replace(RE, (all, head, ind, kind, body, tail) => {
    if (/\breadout\s*:/.test(body)) return all;
    const g = body.match(/green:\s*\[\s*([\d.]+)\s*,\s*([\d.]+)\s*\]/);
    if (!g) return all;
    const pad = `${ind}  `, sep = /,\s*$/.test(body) ? "" : ",";
    return `${head}${body}${sep}\n${pad}readout: (v) => (v < ${g[1]} ? "below the band" : v > ${g[2]} ? "above the band" : "in the band"),${tail.replace(/^\n/, "\n")}`;
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "WebXR", "smartcity", "js", "sims");
  let changed = 0;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".js"))) {
    const p = join(dir, f), src = readFileSync(p, "utf8"), out = simWithReadouts(src);
    if (out === src) continue;
    changed += 1;
    if (!process.argv.includes("--check")) writeFileSync(p, out);
  }
  console.log(`sim_readouts: ${changed} sim(s) ${process.argv.includes("--check") ? "missing a readout" : "given band readouts"}`);
  if (process.argv.includes("--check") && changed) process.exit(1);
}
