/**
 * BAYKEEPER gate — the Bay Program hub and its stations (docs/consoles/BAYKEEPER.md).
 *
 *     node tools/check_bayprogram.mjs
 *
 * - every figure on the hub (WebXR/bayprogram/index.html) and in its data
 *   (WebXR/shared/bk-bayprogram.js) matches the verified facts below, copied
 *   from the wave's facts file (EPA release of 22 September 2026 and its
 *   stormwater.com coverage; the Port of Oakland Clean Ports pages); when that
 *   file is present (BK_FACTS or the default scratch path) its table is parsed
 *   and compared too;
 * - every named project links to at least one station that exists in the catalog;
 * - no project beyond the eight named ones is named (the twelve stay unnamed);
 * - every union tag resolves in tools/unions.json;
 * - the markers sit where the facts file's mapping says (Port of Oakland in
 *   BAYMAP's West Oakland, guarded; SFPUC in sf-mission's field; the rest regional);
 * - every new bk- station scores 95+ on tools/eval_content.mjs.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const t0 = Date.now();
const bk = await import(pathToFileURL(join(ROOT, "WebXR/shared/bk-bayprogram.js")).href);
const hub = readFileSync(join(ROOT, "WebXR/bayprogram/index.html"), "utf8");
const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
const unionList = JSON.parse(readFileSync(join(ROOT, "tools/unions.json"), "utf8")).unions;
const unions = new Set(unionList.map((u) => u.id));
// Local numbers inside a union's registry name (SEIU 1021, Local 261) are names, not figures.
const unionNumbers = new Set(unionList.flatMap((u) => `${u.name} ${u.abbrev}`.match(/\d{3,}/g) || []));
const stations = new Set(catalog.stations.map((s) => s.id));

let fails = 0;
const fail = (m) => { fails += 1; console.log(`  FAIL ${m}`); };
const ok = (m) => console.log(`  ok   ${m}`);
const unesc = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');

// The eight named projects, verbatim from the facts file.
const FACTS = [
  ["Association of Bay Area Governments (ABAG)", "$5.6 million", "Strip Marsh East, along Highway 37, San Pablo Bay", "habitat restoration by reusing sediment produced from excavating new tidal channels and lowering berms; a report on how sediment moves through the Bay-Delta estuary, to inform long-term plans to restore 100,000 acres of tidal wetlands in the region"],
  ["Bay Area Clean Water Agencies (BACWA)", "$7 million", "Bay-wide", "five pilot projects aimed at reducing nutrient inputs to San Francisco Bay"],
  ["City of San Jose", "$3.16 million", "San Jose", "develop a green stormwater infrastructure implementation plan"],
  ["City of San Pablo", "$1.26 million", "San Pablo", "construct and monitor green stormwater infrastructure designed to capture and treat stormwater runoff"],
  ["San Francisco Public Utilities Commission (SFPUC)", "$5 million", "Outer Mission neighborhood, San Francisco", "green stormwater infrastructure, including planted sidewalk filtration systems, rain gardens and an underground infiltration system"],
  ["City of San Leandro", "$2.49 million", "San Leandro Creek, draining to San Leandro Bay", "two large trash capture devices in stormwater drains, to reduce trash and pollutants entering San Leandro Bay"],
  ["Port of Oakland", "$5 million", "Port of Oakland", "four large trash capture devices collecting stormwater from 427 acres of port property, reducing more than 4,700 gallons of trash from entering San Francisco Bay"],
  ["City/County Association of Governments of San Mateo County (C/CAG)", "$3.8 million", "San Mateo County", "monitor and control PCB sources"],
];
// Every figure the facts file states (program and Clean Ports).
const FIGURES = new Set(["$82 million", "20", "8", "12", "$322 million", "663", "475", "188", "24,000", "427", "4,700", "100,000", "22 September 2026", "100 percent", "100",
  ...FACTS.map((f) => f[1])]);

console.log("check_bayprogram — the Bay Program hub and stations");

// 0. The facts file itself, when this box has it.
const factsPath = process.env.BK_FACTS || "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad/epa/epa-2026-facts.md";
if (existsSync(factsPath)) {
  const md = readFileSync(factsPath, "utf8");
  const rows = md.split("\n").filter((l) => /^\| [^-R|]/.test(l) && !l.startsWith("| Recipient")).map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
  const bad = FACTS.filter((f) => !rows.some((r) => r[0] === f[0] && r[1] === f[1] && r[2] === f[2] && r[3] === f[3]));
  bad.length ? fail(`checker's facts differ from the facts file: ${bad.map((b) => b[0]).join("; ")}`) : ok(`checker's eight rows match the facts file (${rows.length} table rows read)`);
} else ok("facts file not on this box — using the checker's copy of its table");

// 1. Data module rows equal the facts.
for (const f of FACTS) {
  const p = bk.BK_PROJECTS.find((x) => x.recipient === f[0]);
  if (!p) { fail(`data: no project for ${f[0]}`); continue; }
  if (p.amount !== f[1] || p.place !== f[2] || p.does !== f[3]) fail(`data: ${f[0]} differs from the facts`);
}
bk.BK_PROJECTS.length === 8 ? ok("data: exactly eight named projects, each matching the facts") : fail(`data: ${bk.BK_PROJECTS.length} projects, expected 8`);

// 2. Hub rows equal the facts.
const hubRows = [...hub.matchAll(/<tr id="([^"]+)" data-bk-project[^>]*>\s*<th scope="row">([^<]+)<\/th>\s*<td data-bk-amount>([^<]+)<\/td>\s*<td data-bk-place>([^<]+)<\/td>\s*<td data-bk-does>([^<]+)<\/td>/g)]
  .map((m) => [unesc(m[2]), unesc(m[3]), unesc(m[4]), unesc(m[5]), m[1]]);
let rowBad = 0;
for (const f of FACTS) if (!hubRows.some((r) => r[0] === f[0] && r[1] === f[1] && r[2] === f[2] && r[3] === f[3])) { rowBad += 1; fail(`hub: row for ${f[0]} missing or differs`); }
if (hubRows.length !== 8) fail(`hub: ${hubRows.length} project rows, expected 8`);
if (!rowBad && hubRows.length === 8) ok("hub: eight project rows — recipient, amount, place and what it does exactly as the facts file");

// 3. Every figure on the hub is one the facts file states.
const text = unesc(hub.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " "));
const money = [...text.matchAll(/\$[\d.,]+ (?:million|billion)/g)].map((m) => m[0]);
const big = [...text.matchAll(/(?<![\w$.])\d{1,3}(?:,\d{3})+(?![\w])|(?<![\w$.,])\d{3,}(?![\w,])/g)].map((m) => m[0]).filter((n) => !/^20\d\d$/.test(n));
const stray = [...money, ...big].filter((f) => !FIGURES.has(f) && !unionNumbers.has(f));
stray.length ? fail(`hub: figures not in the facts file: ${[...new Set(stray)].join(", ")}`) : ok(`hub: ${money.length} money figures and ${big.length} counts, every one stated by the facts file`);
for (const [k, v] of [["total", "more than $82 million"], ["projects", "20"], ["named", "8"], ["cp-award", "$322 million"], ["cp-equipment", "663"], ["cp-drayage", "475"], ["cp-che", "188"], ["cp-ghg", "24,000"]]) {
  const m = hub.match(new RegExp(`data-bk-fig="${k}">([^<]+)<`));
  if (!m || unesc(m[1]) !== v) fail(`hub: figure ${k} is ${m ? m[1] : "missing"}, facts say ${v}`);
}
ok("hub: program and Clean Ports headline figures match ($82M · 20 · $322M · 663 = 475 + 188 · 24,000 t)");
if (bk.BK_CLEAN_PORTS.equipment.drayage + bk.BK_CLEAN_PORTS.equipment.cargoHandling !== bk.BK_CLEAN_PORTS.equipment.total) fail("data: Clean Ports equipment does not add up");
for (const p of ["Pacific Maritime Association (PMA)", "Machinists Institute (MI)", "West Oakland Jobs Resource Center (WOJRC)"]) if (!text.includes(p)) fail(`hub: workforce partner ${p} missing`);
ok("hub: the three Clean Ports workforce partners are named with their roles");

// 4. Every project links to at least one real station.
let linkBad = 0;
for (const r of hubRows) {
  const block = hub.slice(hub.indexOf(`<tr id="${r[4]}"`), hub.indexOf("</tr>", hub.indexOf(`<tr id="${r[4]}"`)));
  const ids = [...block.matchAll(/data-bk-station="([^"]+)"/g)].map((m) => m[1]);
  const missing = ids.filter((id) => !stations.has(id));
  if (!ids.length || missing.length) { linkBad += 1; fail(`hub: ${r[0]} links ${ids.length} stations${missing.length ? `, unknown: ${missing.join(", ")}` : ""}`); }
}
const linked = [...new Set([...hub.matchAll(/data-bk-station="([^"]+)"/g)].map((m) => m[1]))];
if (!linkBad) ok(`hub: every project links to at least one catalog station (${linked.length} distinct stations linked, all resolve)`);

// 5. The twelve stay unnamed.
if (!text.includes(bk.BK_PROGRAM.unnamedLine)) fail("hub: the twelve-more line is missing");
const allowed = new Set(FACTS.map((f) => f[0]));
const orgs = [...text.matchAll(/\b(City of [A-Z][a-z]+(?: [A-Z][a-z]+)?|County of [A-Z][a-z]+(?: [A-Z][a-z]+)?|[A-Z][A-Za-z]+ (?:Water|Sanitary|Flood|Resource Conservation) District)\b/g)].map((m) => m[1]);
const unnamedHit = orgs.filter((o) => ![...allowed].some((a) => a.startsWith(o)));
unnamedHit.length ? fail(`hub: names an organisation outside the eight: ${[...new Set(unnamedHit)].join(", ")}`) : ok("hub: the twelve unnamed projects are noted as twelve and never named, placed or priced");

// 6. Union tags resolve.
const tags = [...hub.matchAll(/data-bk-union="([^"]+)"/g)].map((m) => m[1]).concat(bk.BK_PROJECTS.flatMap((p) => p.unions), bk.BK_CRAFTS.map((c) => c.union));
const badTags = tags.filter((t) => !unions.has(t));
badTags.length ? fail(`union tags not in tools/unions.json: ${[...new Set(badTags)].join(", ")}`) : ok(`union tags: ${tags.length} tags (${new Set(tags).size} unions), every one resolves in tools/unions.json`);

// 7. Markers where the facts file maps them.
const byId = Object.fromEntries(bk.BK_PROJECTS.map((p) => [p.recipient, p.marker]));
const port = byId["Port of Oakland"];
if (port.parish !== "oak-west-oakland") fail("marker: Port of Oakland is not in oak-west-oakland");
const oakPath = join(ROOT, "WebXR/shared/np-data-oak-west-oakland.js");
if (existsSync(oakPath)) {
  const src = readFileSync(oakPath, "utf8");
  src.includes(`"id":"${port.site}"`) || src.includes(`id: "${port.site}"`) ? ok(`marker: Port of Oakland → oak-west-oakland/${port.site} (site resolves)`) : fail(`marker: site ${port.site} not in oak-west-oakland`);
} else ok(`marker: Port of Oakland → oak-west-oakland/${port.site} (BAYMAP not merged in this tree — guarded, resolves at runtime via npParish)`);
const sf = byId["San Francisco Public Utilities Commission (SFPUC)"];
const { NP_SF_MISSION } = await import(pathToFileURL(join(ROOT, "WebXR/shared/np-data-sf-mission.js")).href);
const half = NP_SF_MISSION.size / 2;
sf.parish === "sf-mission" && Math.abs(sf.position[0]) <= half && Math.abs(sf.position[1]) <= half ? ok(`marker: SFPUC Outer Mission → sf-mission [${sf.position}] inside the ${NP_SF_MISSION.size} m field (approximate, southern edge)`) : fail("marker: SFPUC is not inside sf-mission's field");
const regional = bk.BK_PROJECTS.filter((p) => p.marker.world === "bayworld-atlas");
regional.length === 6 && regional.every((p) => /outside the walkable maps/.test(p.marker.note)) ? ok("marker: the other six projects sit in Bay World's regional atlas, marked outside the walkable maps") : fail(`marker: ${regional.length} regional projects, expected 6`);

// 8. The programme and the new stations' scores.
const prog = catalog.curricula.find((c) => c.id === bk.BK_PROGRAMME_ID);
const bkIds = [...stations].filter((id) => id.startsWith("bk-"));
if (!prog) fail(`programme ${bk.BK_PROGRAMME_ID} missing from the catalog`);
else {
  const inProg = new Set(prog.stations.map((s) => s.id));
  const out = bkIds.filter((id) => !inProg.has(id));
  out.length ? fail(`bk- stations outside the programme: ${out.join(", ")}`) : ok(`programme ${prog.id}: ${prog.stations.length} stations, all ${bkIds.length} bk- stations in it`);
}
const hubMissing = bkIds.filter((id) => !linked.includes(id));
if (hubMissing.length) fail(`bk- stations the hub never links: ${hubMissing.join(", ")}`);
const scores = [];
for (const id of bkIds) {
  const out = execFileSync(process.execPath, [join(ROOT, "tools/eval_content.mjs"), "--station", id], { cwd: ROOT, encoding: "utf8" });
  const m = out.match(new RegExp(`^\\s+(\\d+)\\s+${id}\\b`, "m"));
  const s = m ? Number(m[1]) : 0;
  scores.push(`${id} ${s}`);
  if (s < 95) fail(`${id} scores ${s} on eval_content (needs 95+)`);
}
ok(`stations 95+: ${scores.join(" · ")}`);

console.log(`\ncheck_bayprogram: ${fails ? `FAILED ${fails}` : "PASS"} — ${bk.BK_PROJECTS.length} named projects, ${linked.length} stations linked, ${bkIds.length} bk- stations (${Date.now() - t0} ms)`);
process.exit(fails ? 1 : 0);
