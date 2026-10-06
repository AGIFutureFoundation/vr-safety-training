/**
 * Every binary model that ships, held to the five things that make one safe to
 * ship at all.
 *
 *     node tools/check_models.mjs
 *
 * Almost everything in this product is built out of lathes and boxes at
 * runtime, and that is on purpose: 220 stations of downloaded geometry would
 * not load on a headset over a hall's wifi, and nobody can audit the licence of
 * a file whose provenance nobody wrote down. A handful of exceptions are worth
 * it — the hub's guide figure is one — so the exceptions get a gate rather
 * than a convention.
 *
 * For every `.glb` under a `WebXR/**\/models/` directory:
 *   1. it is 2 MB or smaller, because the page has to reach a headset;
 *   2. it has a line in the attribution table, with a file name, a title, an
 *      author and a source, so the credit the licence asks for actually
 *      exists and points at something;
 *   3. that line's licence is one this product may redistribute — CC0,
 *      CC-BY-4.0, CC-BY-3.0 or a marketplace licence. A file with no licence,
 *      or one nobody has checked, is not shippable however good it looks;
 *   4. some module actually names the file, so a model that no longer has a
 *      caller is deleted rather than quietly carried forever; and
 *   5. the bundler copies it alongside dist/, because a model that is only in
 *      the source tree is a 404 in the built page — which is exactly the kind
 *      of break that only shows up on the show floor.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const ATTRIBUTION = join(WEBXR, "assets/env/ATTRIBUTION.md");
const BUNDLER = join(ROOT, "tools/bundle_webxr.py");
const MAX_BYTES = 2 * 1024 * 1024;
const OK_LICENCES = new Set(["CC0", "CC-BY-4.0", "CC-BY-3.0", "marketplace"]);

let failures = 0;
const bad = (m) => { failures += 1; console.log(`  ✗ ${m}`); };
const ok = (m) => console.log(`  ✓ ${m}`);

/** Every file under `dir` whose path has a `models/` directory in it. */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      walk(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

const all = walk(WEBXR);
const models = all
  .filter((f) => f.endsWith(".glb") && /(^|[\\/])models[\\/]/.test(relative(WEBXR, f)))
  // dist/ holds the bundler's own copies of the same files; check the sources.
  .filter((f) => !relative(WEBXR, f).split(/[\\/]/).includes("dist"))
  .sort();

// The attribution table, as { file: { title, author, source, licence } }.
const rows = {};
for (const line of readFileSync(ATTRIBUTION, "utf8").split("\n")) {
  const cells = line.split("|").map((c) => c.trim());
  // A markdown row is | file | title | author | source | licence | — six cells
  // once the empty ends are counted, and the header and rule are skipped by
  // the .glb test rather than by counting lines.
  if (cells.length < 7 || !cells[1].endsWith(".glb")) continue;
  rows[cells[1]] = { title: cells[2], author: cells[3], source: cells[4], licence: cells[5] };
}

// Every module and page that could name a model, and the bundler's copy list.
const sources = all.filter((f) => /\.(m?js|html|py)$/.test(f) && !relative(WEBXR, f).split(/[\\/]/).includes("dist"));
const sourceText = sources.map((f) => readFileSync(f, "utf8")).join("\n");
const bundler = readFileSync(BUNDLER, "utf8");

console.log(`Models — ${models.length} binary model(s) under WebXR/**/models/, ` +
  `${Object.keys(rows).length} attribution row(s)\n`);

if (!models.length) bad("no models found: this checker is watching nothing, which is probably a path bug");

for (const file of models) {
  const rel = relative(ROOT, file);
  const name = rel.split(/[\\/]/).pop();
  const bytes = statSync(file).size;
  if (bytes > MAX_BYTES) {
    bad(`${rel}: ${(bytes / 1024 / 1024).toFixed(2)} MB, over the ${MAX_BYTES / 1024 / 1024} MB ceiling`);
  } else {
    ok(`${rel} — ${(bytes / 1024).toFixed(0)} KB`);
  }

  const row = rows[name];
  if (!row) {
    bad(`${name}: no row in WebXR/assets/env/ATTRIBUTION.md`);
  } else {
    if (!row.title || !row.author) bad(`${name}: attribution row needs a title and an author`);
    if (!OK_LICENCES.has(row.licence)) {
      bad(`${name}: licence "${row.licence}" is not one of ${[...OK_LICENCES].join(", ")}`);
    } else if (row.licence.startsWith("CC-BY") && (!row.source || row.source === "—")) {
      bad(`${name}: a CC-BY model needs a source URL in its attribution row`);
    } else {
      ok(`${name} — ${row.title} by ${row.author}, ${row.licence}`);
    }
  }

  if (!sourceText.includes(name)) {
    bad(`${name}: no module, page or tool names it — delete it or wire it up`);
  } else {
    ok(`${name} is referenced by a module`);
  }

  if (!bundler.includes(name)) {
    bad(`${name}: not in tools/bundle_webxr.py's copy_files, so dist/ would 404 on it`);
  } else {
    ok(`${name} is in the bundler's lazy-file list`);
  }
}

console.log(failures
  ? `\n${failures} model problem(s).`
  : `\nAll ${models.length} shipped model(s) check out: inside 2 MB, attributed with a ` +
    `redistributable licence, referenced by a module and copied into dist/.`);
process.exit(failures ? 1 : 0);
