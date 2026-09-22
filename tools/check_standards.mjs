/**
 * Gate on the standards registry: tools/standards.json.
 *
 *     node tools/check_standards.mjs
 *
 * A certificate claim rests on three facts, and this checker is the only thing
 * that keeps them true:
 *
 *   1. Every standard the platform teaches against is written down once, with
 *      a body, a title, the catalog categories it governs, and whether we are
 *      sure of the citation form. No entry is half-filled and no id is used twice.
 *   2. Every station cites at least one registered standard that is in scope
 *      for the kind of work it teaches. A station whose only citations govern
 *      somebody else's trade is not grounded, however well it reads.
 *   3. Every `guides` id on a training programme in curricula.js names a real
 *      registry entry, so the union and the standards printed on a programme
 *      are the ones the registry can be asked about.
 *
 * It is a gate, not a score: it asks for one in-scope standard per station and
 * nothing about quality. The ranking lives in tools/eval_content.mjs, which
 * reads the same registry and scores the whole citation set per station.
 *
 * The registry-reading code below is this checker's own copy on purpose: a gate
 * must not depend on tooling built on top of it.
 *
 *     node tools/check_standards.mjs --docs
 *
 * also re-renders docs/standards/README.md from the registry and the
 * programmes' guides, so the published page cannot drift from the data.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = JSON.parse(readFileSync(join(ROOT, "tools/standards.json"), "utf8"));
const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));

let failures = 0;
const fail = (what, msg) => { failures += 1; console.log(`  ✗ ${what}: ${msg}`); };
const ok = (msg) => console.log(`  ✓ ${msg}`);

console.log(`Standards registry — ${REGISTRY.standards?.length ?? 0} entries against ${catalog.stations.length} stations\n`);

// ------------------------------------------------------------------ 1. the registry itself

const CATEGORIES = new Set(catalog.stations.map((s) => s.category).filter(Boolean));
const SOURCES = new Set(["verified", "unverified"]);
const seen = new Map();
const byCite = new Map();

for (const e of REGISTRY.standards ?? []) {
  const where = e.id ? `entry "${e.id}"` : `entry ${JSON.stringify(e).slice(0, 40)}`;
  for (const field of ["id", "body", "title", "scope", "source", "cites"]) {
    if (e[field] === undefined || e[field] === null || e[field] === "") fail("registry", `${where} is missing ${field}`);
  }
  if (!e.id) continue;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(e.id)) fail("registry", `${where} is not a slug`);
  if (seen.has(e.id)) fail("registry", `duplicate id "${e.id}"`); else seen.set(e.id, e);
  if (!SOURCES.has(e.source)) fail("registry", `${where} has source "${e.source}", which is neither verified nor unverified`);
  if (!Array.isArray(e.scope) || !e.scope.length) fail("registry", `${where} governs no category`);
  else for (const c of e.scope) if (!CATEGORIES.has(c)) fail("registry", `${where} claims scope over "${c}", which is not a catalog category`);
  if (!Array.isArray(e.cites) || !e.cites.length) fail("registry", `${where} has no citation form to match a station's text against`);
  else for (const c of e.cites) {
    if (byCite.has(c)) fail("registry", `"${c}" is claimed by both ${byCite.get(c)} and ${e.id}`);
    else byCite.set(c, e.id);
  }
  // A clause number we are not sure of is the one thing this platform must not
  // publish, so an unverified entry has to read as a body and a title.
  if (e.source === "verified" && /\bTBD\b|\?\?/.test(e.title)) fail("registry", `${where} is marked verified but its title is not settled`);
}
if (!failures) ok(`${seen.size} entries across ${new Set([...seen.values()].map((e) => e.body)).size} bodies, every field filled, no id or citation form used twice`);
const unverified = [...seen.values()].filter((e) => e.source === "unverified").length;
ok(`${seen.size - unverified} citation forms verified, ${unverified} carried as body and title only`);

const declared = new Set(REGISTRY.categories ?? []);
for (const c of CATEGORIES) if (!declared.has(c)) fail("registry", `catalog category "${c}" is not in the registry's category list`);

// ------------------------------------------------------------------ 2. citations, resolved against the registry

const CITE_RE = new RegExp(
  `(?<![A-Za-z0-9])(?:${[...byCite.keys()].sort((a, b) => b.length - a.length)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![A-Za-z0-9])(?!\\.\\d)`, "g");

/** The station's own source is the record, the same text the compliance matrix reads. */
function sourceOf(s) {
  const file = s.app === "trades"
    ? join(ROOT, "WebXR/trades/js/rooms", `${s.id}.js`)
    : join(ROOT, "WebXR/smartcity/js/sims", `${s.id}.js`);
  return existsSync(file) ? readFileSync(file, "utf8") : `${s.certification ?? ""} ${s.tagline ?? ""}`;
}
function registered(text) {
  const out = new Map();
  for (const m of text.matchAll(CITE_RE)) { const id = byCite.get(m[0]); if (id) out.set(id, seen.get(id)); }
  return out;
}

const thin = [];
for (const s of catalog.stations) {
  if (!s.category) { fail("stations", `${s.id} has no category, so nothing can be in scope for it`); continue; }
  const hits = registered(sourceOf(s));
  const inScope = [...hits.values()].filter((e) => e.scope.includes(s.category));
  if (!inScope.length) {
    thin.push(s);
    fail("stations", `${s.name} (${s.app}:${s.id}) cites no registered standard in scope for ${s.category}` +
      (hits.size ? ` — it cites ${[...hits.keys()].join(", ")}, none of which governs that category` : " — it cites no registered standard at all"));
  }
}
if (!thin.length) ok(`every one of ${catalog.stations.length} stations cites a registered standard in scope for its category`);

// ------------------------------------------------------------------ 3. the programmes' guides

const { CURRICULA } = await import("../WebXR/smartcity/js/curricula.js");
let guideIds = 0;
for (const p of CURRICULA) {
  if (!Array.isArray(p.guides) || !p.guides.length) { fail("curricula", `programme "${p.id}" names no guides`); continue; }
  const dupes = p.guides.filter((id, i, a) => a.indexOf(id) !== i);
  if (dupes.length) fail("curricula", `programme "${p.id}" repeats guide ${dupes.join(", ")}`);
  for (const id of p.guides) {
    guideIds += 1;
    if (!seen.has(id)) fail("curricula", `programme "${p.id}" names guide "${id}", which is not in the registry`);
  }
  // A programme is a union's block: it has to name at least one of theirs.
  if (!p.guides.some((id) => seen.get(id)?.body === "union")) {
    fail("curricula", `programme "${p.id}" names no union apprenticeship or training fund among its guides`);
  }
}
if (!failures) ok(`${CURRICULA.length} programmes name ${guideIds} guides, every one a registry entry`);

// ------------------------------------------------------------------ the page

if (process.argv.includes("--docs")) {
  const mark = (e) => (e.source === "verified" ? "✓" : "?");
  const governs = (e) => (e.scope.length === CATEGORIES.size ? `all ${CATEGORIES.size} categories` : [...e.scope].sort().join(", "));
  const byBody = new Map();
  for (const e of [...seen.values()].sort((a, b) => a.id.localeCompare(b.id))) {
    if (!byBody.has(e.body)) byBody.set(e.body, []);
    byBody.get(e.body).push(e);
  }
  const md = [];
  md.push("# Standards registry");
  md.push("");
  md.push(`_Rendered from \`tools/standards.json\` by \`node tools/check_standards.mjs --docs\` on ${new Date().toISOString().slice(0, 10)}: ${seen.size} entries across ${byBody.size} bodies, over the ${CATEGORIES.size} catalog categories. Never edit this page by hand._`);
  md.push("");
  md.push("This is the one place a standard this platform teaches against is written down: the body that publishes it, its title, the catalog categories it governs, and the forms a station's own text is matched against. `tools/eval_content.mjs` scores every station on the share of its cited authorities that resolve to an entry in scope for that station's category, and `tools/check_standards.mjs` gates on every station citing at least one in-scope entry and every programme guide naming a real one.");
  md.push("");
  md.push("**A clause number is never invented.** ✓ marks a citation form we are sure of. ? marks an entry carried as a body and a title because the exact designation, edition or course code is not certain — there the claim is the body and the subject, not the number.");
  md.push("");
  md.push("Scope is a judgement about what a standard governs, not a record of who cites it. A citation that resolves out of scope for a station's category costs that station in the content eval, which is how a code borrowed from somebody else's trade becomes visible.");
  md.push("");
  md.push("## By body");
  md.push("");
  for (const [body, list] of [...byBody.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))) {
    md.push(`### ${body === "union" ? "Unions, apprenticeships and training funds" : body} (${list.length})`);
    md.push("");
    md.push("| | Standard or programme | Registry id | Governs | Cited as |");
    md.push("|---|---|---|---|---|");
    for (const e of list) md.push(`| ${mark(e)} | ${e.title} | \`${e.id}\` | ${governs(e)} | ${e.cites.map((c) => "`" + c + "`").join(", ")} |`);
    md.push("");
  }
  md.push("## By programme");
  md.push("");
  md.push("What governs each training programme in `WebXR/smartcity/js/curricula.js`, as its `guides` field names it.");
  md.push("");
  for (const p of CURRICULA) {
    md.push(`### ${p.name}`);
    md.push("");
    md.push(`\`${p.id}\` · ${p.union}`);
    md.push("");
    const guides = p.guides.map((id) => seen.get(id)).filter(Boolean);
    md.push("**Union and trade guide.** " + (guides.filter((e) => e.body === "union").map((e) => e.title).join(" · ") || "—"));
    md.push("");
    md.push("**Standards.**");
    md.push("");
    for (const e of guides.filter((e) => e.body !== "union")) md.push(`- ${mark(e)} ${e.title} (\`${e.id}\`)`);
    md.push("");
  }
  mkdirSync(join(ROOT, "docs/standards"), { recursive: true });
  writeFileSync(join(ROOT, "docs/standards/README.md"), md.join("\n") + "\n");
  console.log(`  ✓ wrote docs/standards/README.md — ${seen.size} entries, ${CURRICULA.length} programmes`);
}

console.log(failures ? `\n${failures} standards problem(s) found.` : `\nAll standards checks pass.`);
process.exit(failures ? 1 : 0);
