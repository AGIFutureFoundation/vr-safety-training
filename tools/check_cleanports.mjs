/**
 * CLEANPORTS — the Port of Oakland Clean Ports conversion as training (Bay Program wave).
 *
 *     node tools/check_cleanports.mjs
 *
 * Proves, line by line:
 *   - every Clean Ports figure the platform states (CP_FACTS, each station's Clean Ports note, the WOJRC
 *     Pathway Edition summary, the pathway level's note) appears in the facts file
 *     (docs/sources/epa-2026-facts.md, a copy of the run's facts file), and no other dollar or count
 *     figure about the programme is stated;
 *   - every CLEANPORTS drivable is gated on a pre-trip station that exists and sits in a programme;
 *   - the WOJRC "Zero-emission careers" level resolves (programme, stations, the sourced MI/WOJRC line,
 *     and the "not that program" disclaimer);
 *   - placements resolve: Bay World sites exist and list the station; BAYMAP's oak-west-oakland sites
 *     resolve when that map is in the tree (else against the list in BAYMAP_SITES below, from its branch);
 *   - every union tag resolves in tools/unions.json;
 *   - every CLEANPORTS station scores 95+ on tools/eval_content.mjs.
 */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const imp = (p) => import(pathToFileURL(join(WEBXR, p)));
let failed = 0, passed = 0;
const fail = (area, msg) => { failed += 1; console.log(`  ✗ [${area}] ${msg}`); };
const ok = () => { passed += 1; };

const FACTS = readFileSync(join(ROOT, "docs/sources/epa-2026-facts.md"), "utf8");
const factsFlat = FACTS.replace(/\*\*/g, "").replace(/\s+/g, " ");
const { CP_FACTS, CP_STATIONS, CP_DRIVABLES, CP_PLACEMENTS, CP_PATHWAY_LEVEL, cpPlaceInParish } = await imp("shared/cp-cleanports.js");
const { CURRICULA } = await imp("smartcity/js/curricula.js");
const { DV_DRIVABLES } = await imp("shared/drivables-data.js");
const { BAY_SITES } = await imp("shared/bayworld-data.js");
const UNIONS = new Set(JSON.parse(readFileSync(join(ROOT, "tools/unions.json"), "utf8")).unions.map((u) => u.id));

// ------------------------------------------------------------ figures
// A figure is a dollar amount, a number of three or more digits (with commas), or a percentage.
const FIGURE = /\$[\d.,]+(?:\s*(?:million|billion))?|\b\d{1,3}(?:,\d{3})+\b|\b\d{3,}\b|\b\d+(?:\.\d+)?\s*(?:percent|%)/g;
const figuresIn = (text) => [...new Set(String(text).match(FIGURE) ?? [])];
function checkFigures(where, text) {
  const figs = figuresIn(text);
  for (const f of figs) {
    if (factsFlat.includes(f)) ok(); else fail("figures", `${where}: "${f}" is not in the facts file`);
  }
  return figs.length;
}
let figureCount = 0;
for (const [k, v] of Object.entries(CP_FACTS)) {
  if (k === "sources") continue;
  const text = typeof v === "string" ? v : JSON.stringify(v);
  figureCount += checkFigures(`CP_FACTS.${k}`, text);
  if (v?.figure) { if (factsFlat.includes(v.figure)) ok(); else fail("figures", `CP_FACTS.${k}.figure "${v.figure}" is not in the facts file`); }
}
for (const w of CP_FACTS.workforce) {
  const name = w.name.replace(/\s*\(.*\)$/, "");
  if (factsFlat.includes(name)) ok(); else fail("figures", `workforce partner "${w.name}" is not in the facts file`);
}
for (const a of CP_FACTS.activities) { if (factsFlat.includes(a)) ok(); else fail("figures", `activity "${a}" is not worded as the facts file words it`); }
for (const s of CP_FACTS.sources) { if (FACTS.includes(s.url)) ok(); else fail("figures", `source ${s.url} is not one the facts file names`); }

// Stations: loaded as source text (the modules import three.js from a CDN).
const stationSrc = {};
for (const id of CP_STATIONS) {
  const p = join(WEBXR, `smartcity/js/sims/${id}.js`);
  if (!existsSync(p)) { fail("stations", `${id}: no module`); continue; }
  stationSrc[id] = readFileSync(p, "utf8");
  const note = stationSrc[id].match(/cleanPorts: ("(?:[^"\\]|\\.)*")/)?.[1];
  if (!note) { fail("figures", `${id}: no Clean Ports note`); continue; }
  const text = JSON.parse(note);
  figureCount += checkFigures(`${id} note`, text);
  if (/\bis not\b|\bnot (?:PMA|that|any)|does not describe/.test(text)) ok(); else fail("figures", `${id}: the note does not say the station is not the partner's curriculum`);
  const unions = JSON.parse(stationSrc[id].match(/unions: (\[[^\]]*\])/)?.[1] ?? "[]");
  if (!unions.length) fail("unions", `${id}: no union tags`);
  for (const u of unions) { if (UNIONS.has(u)) ok(); else fail("unions", `${id}: union "${u}" is not in tools/unions.json`); }
}
const wojrc = CURRICULA.find((c) => c.id === "wojrc-pathway-edition");
const zeLine = wojrc?.summary?.match(/A last level, Zero-emission careers[^]*$/)?.[0] ?? "";
if (zeLine) ok(); else fail("pathway", "the WOJRC Pathway Edition summary does not carry the zero-emission careers line");
figureCount += checkFigures("WOJRC summary", zeLine);
figureCount += checkFigures("pathway level note", CP_PATHWAY_LEVEL.note);

// ------------------------------------------------------------ drivables
const inProgramme = new Set(CURRICULA.flatMap((c) => c.stations.map((s) => s.id)));
for (const id of CP_DRIVABLES) {
  const d = DV_DRIVABLES.find((x) => x.id === id);
  if (!d) { fail("drivables", `${id}: not in DV_DRIVABLES`); continue; }
  const pre = (d.gate?.stations ?? []).filter((s) => CP_STATIONS.includes(s) && /pre-use|pre-trip/.test(s));
  if (pre.length) ok(); else fail("drivables", `${id}: no CLEANPORTS pre-trip / pre-use station in its gate`);
  for (const s of d.gate?.stations ?? []) {
    if (existsSync(join(WEBXR, `smartcity/js/sims/${s}.js`)) && inProgramme.has(s)) ok(); else fail("drivables", `${id}: gate station ${s} does not resolve`);
  }
  if (d.kind === "road" && d.pretrip?.items?.length) ok(); else fail("drivables", `${id}: no pre-trip checklist`);
  for (const u of d.trades ?? []) { if (UNIONS.has(u)) ok(); else fail("unions", `${id}: union "${u}" is not in tools/unions.json`); }
}

// ------------------------------------------------------------ pathway level
const lvl = CP_PATHWAY_LEVEL;
if (lvl.programme === "wojrc-pathway-edition" && wojrc) ok(); else fail("pathway", "the level's programme does not resolve");
const wojrcIds = new Set(wojrc?.stations.map((s) => s.id) ?? []);
for (const s of lvl.stations) { if (wojrcIds.has(s) && stationSrc[s]) ok(); else fail("pathway", `level station ${s} is not in the WOJRC Pathway Edition`); }
if (new Set(lvl.stations).size === CP_STATIONS.length) ok(); else fail("pathway", "the level does not chain all six stations");
for (const phrase of ["Machinists Institute", "West Oakland Jobs Resource Center", "Pre-Apprentice Transportation, Distribution and Logistics", "careers affected by zero-emission vehicles"]) {
  if (lvl.note.includes(phrase) && factsFlat.includes(phrase)) ok(); else fail("pathway", `the level's note and the facts file do not both carry "${phrase}"`);
}
if (/it is not that program/.test(lvl.note) && /is not that program/.test(zeLine)) ok(); else fail("pathway", "the level does not say it is not WOJRC's program");

// ------------------------------------------------------------ placements
let bwPlaced = 0;
for (const p of CP_PLACEMENTS.bayworld) {
  const site = BAY_SITES.find((s) => s.id === p.site);
  if (!site) { fail("places", `Bay World site ${p.site} does not exist`); continue; }
  if (p.kind === "station") { if (site.stations.includes(p.id)) { ok(); bwPlaced += 1; } else fail("places", `Bay World ${p.site} does not list ${p.id}`); }
  else if (CP_DRIVABLES.includes(p.id)) ok(); else fail("places", `${p.id} is not a CLEANPORTS drivable`);
}
// BAYMAP's West Oakland (merging in parallel): the map module if present, else the branch, else the ids below.
const BAYMAP_SITES = ["outer-harbor-container-terminal", "seventh-street-marine-terminal", "port-maintenance-shop", "port-truck-staging-yard", "west-oakland-rail-yard", "mandela-parkway-union-hall", "mcclymonds-school-campus", "defremery-recreation-centre", "west-oakland-transit-station", "mandela-parkway-warehouse-row", "west-oakland-air-monitoring-station", "emeryville-shoreline-substation", "bay-bridge-toll-plaza-yard"];
let wo = null, woFrom = "the ids recorded from BAYMAP's branch";
const woPath = join(WEBXR, "shared/np-data-oak-west-oakland.js");
if (existsSync(woPath)) { wo = Object.values(await import(pathToFileURL(woPath))).find((v) => v?.id === "oak-west-oakland"); woFrom = "the merged map"; }
const woIds = wo ? wo.sites.map((s) => s.id) : BAYMAP_SITES;
let bmPlaced = 0;
for (const p of CP_PLACEMENTS.baymap) {
  if (p.parish === "oak-west-oakland" && woIds.includes(p.site)) { ok(); bmPlaced += 1; } else fail("places", `BAYMAP ${p.parish}/${p.site} does not resolve`);
}
// The guarded placement: a stand-in npParish with the map proves the helper adds each station once.
const stand = { id: "oak-west-oakland", sites: woIds.map((id) => ({ id, stations: [] })) };
const n1 = cpPlaceInParish((id) => (id === "oak-west-oakland" ? stand : null));
const n2 = cpPlaceInParish((id) => (id === "oak-west-oakland" ? stand : null));
const nNone = cpPlaceInParish(() => null);
if (n1 === CP_PLACEMENTS.baymap.filter((p) => p.kind === "station").length && n2 === 0 && nNone === 0) ok(); else fail("places", `cpPlaceInParish added ${n1}, then ${n2}, and ${nNone} with no map`);

// ------------------------------------------------------------ eval
// eval_content --json writes tools/eval-content.json (its tracked output) and prints only the path.
execSync("node tools/eval_content.mjs --json", { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 });
const rows = JSON.parse(readFileSync(join(ROOT, "tools/eval-content.json"), "utf8")).results.filter((r) => CP_STATIONS.includes(r.id));
const scores = [];
for (const id of CP_STATIONS) {
  const r = rows.find((x) => x.id === id);
  if (!r) { fail("eval", `${id}: not scored`); continue; }
  scores.push(`${id.replace(/^cp-/, "")} ${r.score}`);
  if (r.score >= 95) ok(); else fail("eval", `${id}: ${r.score} (needs 95)`);
}

console.log(`  figures: ${figureCount} Clean Ports figures stated, each in the facts file`);
console.log(`  drivables: ${CP_DRIVABLES.length} zero-emission machines, each gated on a pre-trip station`);
console.log(`  pathway: "${lvl.title}" on the WOJRC Pathway Edition, ${lvl.stations.length} stations, sourced and disclaimed`);
console.log(`  places: ${bwPlaced} Bay World station placements; ${bmPlaced} BAYMAP placements against ${woFrom}`);
console.log(`  eval: ${scores.join(" · ")}`);
console.log(failed
  ? `\n${failed} CLEANPORTS problem(s) (${passed} checks passed).`
  : `\nCLEANPORTS: ${CP_STATIONS.length} stations at 95+, ${CP_DRIVABLES.length} drivables gated on pre-trip stations, the Zero-emission careers level resolves, every Clean Ports figure matches the facts file (${passed} checks).`);
process.exit(failed ? 1 : 0);
