// check_cleanup_atlas: the cleanup atlas (tools/gen_cleanup_atlas.mjs) and the federal-site importer
// (tools/import_npl_csv.mjs).
//
//   node tools/check_cleanup_atlas.mjs
//
// Proves the committed atlas is what the generator writes now; every phase station is a catalog station and sits in
// one phase only; every atlas site and union is one the maps and the registry hold; every Bay waterfront site trains
// every phase its kind needs; and the importer reads a CSV correctly, refuses one without a name or state column and
// adds nothing but the type it marks as read from the name. The importer's test rows are fictional. Node only.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const G = await import(pathToFileURL(join(ROOT, "tools", "gen_cleanup_atlas.mjs")).href);
const I = await import(pathToFileURL(join(ROOT, "tools", "import_npl_csv.mjs")).href);
const { CLEANUP_ATLAS } = await import(pathToFileURL(G.CLEANUP_ATLAS_FILE).href);
const { REGION_CATALOG, loadRegions } = await import(pathToFileURL(join(ROOT, "tools", "gen_region_training.mjs")).href);

let passed = 0, failed = 0;
const check = (ok, label) => { if (ok) passed += 1; else { failed += 1; console.log(`  ✗ ${label}`); } };

console.log("check_cleanup_atlas: cleanup phases, map sites, the Bay waterfront and the federal-site importer");

const fresh = await G.buildCleanupAtlas();

// 1 the committed atlas and doc are what the generator writes now
check(JSON.stringify(fresh) === JSON.stringify(CLEANUP_ATLAS), "the committed atlas matches a fresh build (run tools/gen_cleanup_atlas.mjs)");
check(readFileSync(G.CLEANUP_ATLAS_DOC, "utf8").startsWith("# Cleanup atlas"), "docs/cleanup-atlas.md is written");

// 2 phase stations are catalog stations, each in one phase
const all = G.CLEANUP_PHASES.flatMap((p) => p.stations);
check(all.every((s) => REGION_CATALOG.stations.has(s)), `every phase station is a catalog station (${all.filter((s) => !REGION_CATALOG.stations.has(s)).join(", ") || "ok"})`);
check(new Set(all).size === all.length, "no station sits in two phases");
check(fresh.phases.every((p) => p.sites > 0), "every phase is trained at one map site or more");

// 3 every atlas site is a map site, with its own stations and trades, and every union is a registry union
const regions = await loadRegions();
const siteAt = new Map(regions.flatMap(({ region }) => region.sites.map((s) => [`${region.id}/${s.id}`, s])));
const bad = [...fresh.sites, ...fresh.bayWaterfront, ...fresh.otherWaterfront].filter((e) => {
  const s = siteAt.get(`${e.region}/${e.site}`);
  return !s || !e.stations.every((x) => s.stations.includes(x)) || JSON.stringify([...s.trades].sort()) !== JSON.stringify(e.unions);
});
check(bad.length === 0, `every atlas site is a map site with its own stations and trades${bad.length ? ` (${bad.slice(0, 3).map((e) => e.site).join(", ")})` : ""}`);
check(fresh.phases.every((p) => p.unions.every((u) => REGION_CATALOG.unions.has(u))), "every union in the atlas is a registry union");

// 4 the Bay's working waterfront trains every phase its kind needs
check(fresh.bayWaterfront.length >= 20, `the Bay waterfront lists its ports, yards and berths (${fresh.bayWaterfront.length})`);
check(fresh.bayWaterfront.every((s) => s.bay && G.WATERFRONT_PHASES[s.kind]), "every waterfront site is on a Bay map and has phases set for its kind");
const short = fresh.bayWaterfront.filter((s) => s.missing.length);
check(short.length === 0, `every Bay waterfront site trains every phase its kind needs${short.length ? ` (${short.slice(0, 4).map((s) => `${s.site}: ${s.missing.join("/")}`).join(", ")})` : ""}`);
// ... and so do the same kinds of site on every other map
check(fresh.otherWaterfront.length > 0 && fresh.otherWaterfront.every((s) => !s.bay && G.WATERFRONT_PHASES[s.kind]), `waterfront and industry on the other maps are listed with phases for their kind (${fresh.otherWaterfront.length})`);
const otherShort = fresh.otherWaterfront.filter((s) => s.missing.length);
check(otherShort.length === 0, `every waterfront and industrial site on the other maps trains every phase its kind needs${otherShort.length ? ` (${otherShort.slice(0, 4).map((s) => `${s.site}: ${s.missing.join("/")}`).join(", ")})` : ""}`);

// 5 the atlas states no figure, status or partnership of its own
check(!/\$|\bmillion\b|\bpartner(ship)?\b|\bcustomer\b|\bNPL\b/i.test(JSON.stringify(CLEANUP_ATLAS)), "the atlas states no figure, NPL status or partnership");

// 6 the importer reads a CSV: quoted fields, header spellings, sorted output, the type marked as read from the name
const csv = '﻿Site Name,Site EPA ID,City,State,Latitude,Longitude,NPL Status\r\n' +
  '"Example Harbor Sediments, Upper Reach",XX0000000001,Sampleton,ZZ,10.5,-20.25,Final\r\n' +
  'Fictional Naval Shipyard,XX0000000002,Testport,AA,,,"Proposed"\r\n' +
  'Imaginary Plating Works,XX0000000003,,AA,x,1,\r\n';
const sites = I.nplSites(csv);
check(sites.length === 3 && sites[0].state === "AA" && sites[2].state === "ZZ", "the importer keeps every row and sorts by state, then name");
check(sites[2].name === "Example Harbor Sediments, Upper Reach" && sites[2].latitude === 10.5 && sites[2].status === "Final", "quoted names, numbers and status are read as exported");
check(sites.find((s) => s.epaId === "XX0000000002").type === "shipyard" && sites.find((s) => s.epaId === "XX0000000001").type === "waterway" && sites.find((s) => s.epaId === "XX0000000003").type === "industrial", "the type is read from the name, first match wins");
check(sites.every((s) => s.typeFrom === "the site name"), "every type is marked as read from the name");
check(sites.find((s) => s.epaId === "XX0000000003").latitude === null && sites.find((s) => s.epaId === "XX0000000003").city === null, "a blank or non-numeric field is null, never guessed");
const phaseIds = new Set(G.CLEANUP_PHASES.map((p) => p.id));
check(I.NPL_TYPES.every((t) => t.phases.length && t.phases.every((p) => phaseIds.has(p))), "every site type's phases are atlas phases");
let refused = false;
try { I.nplSites("City,Latitude\nA,1\n"); } catch { refused = true; }
check(refused, "a CSV without a site-name or state column is refused");

// 7 deterministic
check(JSON.stringify(await G.buildCleanupAtlas()) === JSON.stringify(fresh), "two builds give the same atlas");

console.log(`  · ${fresh.sites.length} map sites train or offer a cleanup phase; ${fresh.bayWaterfront.length} Bay waterfront sites and ${fresh.otherWaterfront.length} on other maps, ${short.length + otherShort.length} short of a phase`);
console.log(`check_cleanup_atlas: ${failed === 0 ? "all" : failed} ${failed === 0 ? "checks pass" : "failed"} (${passed} passed, ${failed} failed)`);
if (failed) process.exit(1);
