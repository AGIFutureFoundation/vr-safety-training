/**
 * Generates WebXR/shared/bingo-hazards-data.js — the honest hazard-label pool
 * behind Toolbox Talk Bingo's per-programme padding (docs/easter-egg.md,
 * "Toolbox Talk Bingo").
 *
 *     node tools/gen_bingo_hazards.mjs
 *
 * Every station in every programme in WebXR/smartcity/js/curricula.js already
 * names its own hazards, as short kebab-case ids on its own station module's
 * `hazards: {}` object (the same ids a wrong click already reports by — see
 * shared/kit.js and any smartcity/js/sims/*.js or trades/js/rooms/*.js file).
 * This script does nothing but read those ids back out of the station's own
 * source and turn each one into a short label ("fouling-point" ->
 * "Fouling point"): never an invented hazard, never a number, and never the
 * hazard's own long explanatory sentence — too long for a bingo cell, and not
 * needed when the id already names the hazard.
 *
 * STATION_HAZARDS maps a station id to the labels its own hazards use.
 * PROGRAMME_HAZARDS maps a programme id (WebXR/smartcity/js/curricula.js) to
 * the union of its own stations' labels, for a coverage view of the whole
 * programme rather than one station.
 *
 * It is run at the end of tools/gen_catalog.mjs, so this can never drift from
 * the stations' own source.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");

function sourcePath(station) {
  return station.app === "trades"
    ? join(WEBXR, "trades", "js", "rooms", `${station.id}.js`)
    : join(WEBXR, "smartcity", "js", "sims", `${station.id}.js`);
}

/** "fouling-point" -> "Fouling point" — a label, never the hazard's own sentence. */
export function hazardLabel(id) {
  const words = String(id).split("-").filter(Boolean);
  if (!words.length) return "";
  const [first, ...rest] = words;
  return first.charAt(0).toUpperCase() + first.slice(1) + (rest.length ? " " + rest.join(" ") : "");
}

/** The hazard ids a station's own source declares on its `hazards: {}` object,
 *  found by brace-matching from `hazards: {` rather than a fixed indentation,
 *  so it survives the object being reformatted. */
export function hazardIdsOf(src) {
  const at = src.indexOf("hazards: {");
  if (at === -1) return [];
  const braceStart = src.indexOf("{", at);
  let depth = 0, i = braceStart;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth += 1;
    else if (src[i] === "}") { depth -= 1; if (depth === 0) break; }
  }
  const body = src.slice(braceStart, i + 1);
  return [...body.matchAll(/"([a-z][a-z0-9-]*)":\s*"/g)].map((m) => m[1]);
}

/** Computes STATION_HAZARDS and PROGRAMME_HAZARDS and the exact file text,
 *  without touching disk — so tools/check_eggs_app.mjs can prove the shipped
 *  file matches this, read-only, the same way it holds every other generated
 *  file to its source. */
export async function buildBingoHazardsData() {
  const { CURRICULA } = await import(pathToFileURL(join(WEBXR, "smartcity", "js", "curricula.js")).href);
  const stationHazards = {};
  const programmeHazards = {};
  for (const p of CURRICULA) {
    const labels = new Set();
    for (const s of p.stations ?? []) {
      if (stationHazards[s.id]) { for (const l of stationHazards[s.id]) labels.add(l); continue; }
      let src;
      try { src = readFileSync(sourcePath(s), "utf8"); } catch { continue; }
      const stationLabels = [...new Set(hazardIdsOf(src).map(hazardLabel).filter(Boolean))].sort();
      if (stationLabels.length) stationHazards[s.id] = stationLabels;
      for (const l of stationLabels) labels.add(l);
    }
    programmeHazards[p.id] = [...labels].sort();
  }
  const text = `// GENERATED FILE — do not hand-edit. Run \`node tools/gen_bingo_hazards.mjs\`
// (or \`node tools/gen_catalog.mjs\`, which runs it).
//
// The hazard-label pool behind Toolbox Talk Bingo's per-programme padding
// (docs/easter-egg.md, "Toolbox Talk Bingo"). Every label is lifted straight
// off a station's own \`hazards: {}\` object — its own kebab-case hazard id,
// title-cased into a short label — never an invented hazard, and never the
// hazard's own long explanatory sentence. STATION_HAZARDS maps a station id
// to its own labels; PROGRAMME_HAZARDS maps a programme id (from
// WebXR/smartcity/js/curricula.js) to the union of its stations' labels.
export const STATION_HAZARDS = ${JSON.stringify(stationHazards)};
export const PROGRAMME_HAZARDS = ${JSON.stringify(programmeHazards)};
`;
  return { stationHazards, programmeHazards, text };
}

export async function writeBingoHazardsData() {
  const { stationHazards, programmeHazards, text } = await buildBingoHazardsData();
  const outPath = join(WEBXR, "shared", "bingo-hazards-data.js");
  writeFileSync(outPath, text);
  console.log(`Wrote WebXR/shared/bingo-hazards-data.js — ${Object.keys(stationHazards).length} stations, ${Object.keys(programmeHazards).length} programmes`);
  return outPath;
}

if (import.meta.url === `file://${process.argv[1]}`) writeBingoHazardsData();
