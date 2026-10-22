/**
 * Gates the investor data pack (tools/briefs/investor-data-brief.md):
 *  - the generator's output is up to date: a fresh run into a scratch folder
 *    matches docs/investor/ and docs/programmes/ byte for byte;
 *  - every programme in the catalog has an overview page;
 *  - every CSV parses, has a header and the same column count on every row;
 *  - no forbidden commercial word and no model name appears in any generated file.
 *
 *     node tools/check_investor.mjs
 */
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const errors = [];
const fail = (m) => errors.push(m);

const FORBIDDEN = /\b(revenues?|prices?|pricing|customers?|valuations?|market size|users?)\b|\bARR\b/i;
// Stored encoded so that this file itself names no model.
const MODEL_NAMES = new RegExp(Buffer.from("XGIoY2xhdWRlfG9wdXN8c29ubmV0fGhhaWt1fGdwdC0/XGRcdyp8Y2hhdGdwdHxnZW1pbml8bGxhbWEpXGI=", "base64").toString(), "i");

const DIRS = ["docs/investor", "docs/programmes"];
const listed = (base) => DIRS.flatMap((d) => (existsSync(join(base, d)) ? readdirSync(join(base, d)).sort().map((f) => `${d}/${f}`) : []));

// 1. Up to date.
const scratch = mkdtempSync(join(tmpdir(), "investor-"));
try {
  const r = spawnSync(process.execPath, [join(here, "gen_investor.mjs"), "--out", scratch], { encoding: "utf8" });
  if (r.status !== 0) fail(`gen_investor.mjs failed: ${(r.stderr || r.stdout).trim().split("\n").pop()}`);
  else {
    const fresh = listed(scratch), committed = listed(root);
    for (const f of fresh) {
      if (!existsSync(join(root, f))) fail(`${f} is missing — run node tools/gen_investor.mjs`);
      else if (readFileSync(join(root, f), "utf8") !== readFileSync(join(scratch, f), "utf8")) fail(`${f} is out of date — run node tools/gen_investor.mjs`);
    }
    for (const f of committed) if (!fresh.includes(f)) fail(`${f} is not produced by the generator`);
  }
} finally { rmSync(scratch, { recursive: true, force: true }); }

// 2. Every programme has an overview.
const catalog = JSON.parse(readFileSync(join(root, "WebXR/smartcity/catalog.json"), "utf8"));
for (const c of catalog.curricula) if (!existsSync(join(root, "docs/programmes", `${c.id}.md`))) fail(`docs/programmes/${c.id}.md missing`);
if (!existsSync(join(root, "docs/programmes/README.md"))) fail("docs/programmes/README.md missing");

// 3. CSVs parse with a header and consistent columns.
function parseCSV(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (q) throw new Error("unterminated quote");
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
const REQUIRED = ["platform-summary.csv", "platform-summary.json", "programmes.csv", "stations.csv", "assets.csv", "vehicles-and-boats.csv", "worlds.csv", "ui-surfaces.csv", "unions.csv"];
for (const f of REQUIRED) if (!existsSync(join(root, "docs/investor", f))) fail(`docs/investor/${f} missing`);
const counts = {};
for (const f of listed(root).filter((x) => x.endsWith(".csv"))) {
  try {
    const rows = parseCSV(readFileSync(join(root, f), "utf8"));
    if (rows.length < 2) { fail(`${f}: no header or no rows`); continue; }
    const w = rows[0].length;
    if (rows[0].some((h) => !h.trim())) fail(`${f}: empty header cell`);
    rows.forEach((r, i) => { if (r.length !== w) fail(`${f}: row ${i + 1} has ${r.length} columns, header has ${w}`); });
    counts[f.split("/").pop()] = rows.length - 1;
  } catch (e) { fail(`${f}: ${e.message}`); }
}
try {
  const s = JSON.parse(readFileSync(join(root, "docs/investor/platform-summary.json"), "utf8"));
  for (const x of s.facts ?? []) if (!x.source) fail(`platform-summary.json: ${x.key} has no source`);
} catch (e) { fail(`platform-summary.json: ${e.message}`); }

// 4. No forbidden word, no model name.
for (const f of listed(root)) {
  readFileSync(join(root, f), "utf8").split("\n").forEach((line, i) => {
    const m = line.match(FORBIDDEN);
    if (m) fail(`${f}:${i + 1}: forbidden word "${m[0]}"`);
    if (MODEL_NAMES.test(line)) fail(`${f}:${i + 1}: names a model`);
  });
}

if (errors.length) { console.log(errors.slice(0, 40).join("\n")); console.log(`check_investor: ${errors.length} problem(s)`); process.exit(1); }
console.log(`check_investor: ${listed(root).length} files current; ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(", ")}`);
