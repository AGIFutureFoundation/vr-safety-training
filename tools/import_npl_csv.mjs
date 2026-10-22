/**
 * Federal cleanup sites in: reads a CSV exported from EPA's Superfund National Priorities List search and writes the
 * sites, each with the cleanup phases of tools/gen_cleanup_atlas.mjs its type of site calls for.
 *
 *     node tools/import_npl_csv.mjs <export.csv>
 *
 * Only what the CSV says is kept: the site's name, EPA ID, city, state, coordinates and NPL status, exactly as
 * exported. The one thing added is `type`, read from words in the site's name by NPL_TYPES below and marked
 * "from the site name", so a reader knows it is a guess at the kind of site and not EPA's own field. Columns are
 * found by header name, with common spellings accepted; a CSV without a site-name and state column is refused.
 * Nothing is fetched: the CSV is the only source.
 *
 * Writes, deterministically (sorted by state, then name):
 *   docs/cleanup/npl-sites.json
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const NPL_OUT = join(ROOT, "docs", "cleanup", "npl-sites.json");

// Header spellings accepted for each field, compared with case, spaces and punctuation removed.
export const NPL_COLUMNS = {
  name: ["sitename", "name"],
  epaId: ["siteepaid", "epaid", "epaidnumber", "siteid"],
  city: ["city", "sitecity"],
  state: ["state", "sitestate", "stateabbreviation", "st"],
  latitude: ["latitude", "lat"],
  longitude: ["longitude", "lon", "long"],
  status: ["nplstatus", "status", "siteliststatus", "sitestatus"],
};

// The kind of site, read from its name, and the cleanup phases that kind calls for. First match wins.
export const NPL_TYPES = [
  { type: "shipyard", words: /\b(shipyard|naval station|dry ?dock)\b/i, phases: ["record", "survey", "removal", "groundwater", "shoreline", "community"] },
  { type: "military", words: /\b(air force base|afb|air station|army|arsenal|depot|ordnance|munitions|weapons|camp|fort|naval)\b/i, phases: ["record", "survey", "removal", "groundwater", "community"] },
  { type: "mine", words: /\b(mine|mines|mining|smelter|tailings|mill)\b/i, phases: ["record", "survey", "removal", "shoreline", "community"] },
  { type: "landfill", words: /\b(landfill|dump|disposal|waste|sanitary)\b/i, phases: ["record", "survey", "groundwater", "community"] },
  { type: "wood-treating", words: /\b(wood|creosote|treating|pole|lumber)\b/i, phases: ["record", "survey", "removal", "groundwater", "shoreline", "community"] },
  { type: "waterway", words: /\b(harbor|harbour|river|creek|canal|bay|lake|estuary|sediments?)\b/i, phases: ["record", "survey", "shoreline", "community"] },
  { type: "fuel-and-chemical", words: /\b(refinery|refining|oil|petroleum|chemical|terminal|tank)\b/i, phases: ["record", "survey", "removal", "groundwater", "community"] },
  { type: "industrial", words: /./, phases: ["record", "survey", "removal", "groundwater", "community"] },
];

/** A small RFC 4180 CSV reader: quoted fields, doubled quotes, commas and newlines inside quotes. */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x !== "")) rows.push(row);
  return rows;
}

const norm = (h) => h.replace(/^﻿/, "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** The sites in a CSV text. Pure. Throws when the name or state column is missing. */
export function nplSites(text) {
  const [header, ...body] = parseCsv(text);
  if (!header) throw new Error("the CSV is empty");
  const at = Object.fromEntries(Object.entries(NPL_COLUMNS).map(([k, names]) => [k, header.findIndex((h) => names.includes(norm(h)))]));
  for (const k of ["name", "state"]) if (at[k] < 0) throw new Error(`no ${k} column (looked for ${NPL_COLUMNS[k].join(", ")}; found ${header.join(", ")})`);
  const sites = body.map((r) => {
    const get = (k) => (at[k] >= 0 ? (r[at[k]] ?? "").trim() : null);
    const name = get("name");
    const t = NPL_TYPES.find((x) => x.words.test(name));
    const num = (v) => (v === null || v === "" || Number.isNaN(Number(v)) ? null : Number(v));
    return { name, epaId: get("epaId") || null, city: get("city") || null, state: get("state"), latitude: num(get("latitude")), longitude: num(get("longitude")), status: get("status") || null, type: t.type, typeFrom: "the site name", phases: t.phases };
  }).filter((s) => s.name && s.state);
  return sites.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const file = process.argv[2];
  if (!file) { console.error("usage: node tools/import_npl_csv.mjs <export.csv>"); process.exit(2); }
  const sites = nplSites(readFileSync(file, "utf8"));
  mkdirSync(dirname(NPL_OUT), { recursive: true });
  writeFileSync(NPL_OUT, JSON.stringify({ source: "EPA Superfund National Priorities List export (CSV supplied by the user)", sites }, null, 2) + "\n");
  const states = new Set(sites.map((s) => s.state)).size;
  console.log(`Wrote ${NPL_OUT.replace(ROOT + "/", "")} — ${sites.length} sites in ${states} states.`);
}
