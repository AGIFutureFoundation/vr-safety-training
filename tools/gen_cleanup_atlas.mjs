/**
 * Cleanup atlas: the work of a hazardous-site cleanup, phase by phase, and every map site that trains part of it,
 * with the Bay's ports and shipyards called out.
 *
 *     node tools/gen_cleanup_atlas.mjs
 *
 * The phases follow the order the Hunters Point Clean-up and Bay Restoration programme already teaches (the record,
 * then survey, then removal and haul, then the groundwater that stays behind, then the water's edge), plus the
 * community's own oversight work. Each phase lists catalog stations only. A map site is in the atlas when its own
 * `stations` include a phase station (trained there) or a programme it lists teaches one (offered there); its
 * unions are its own `trades`. Nothing is invented: no site, figure or status is added here, and no real cleanup site is named that the maps do not already hold. The national list
 * of federal cleanup sites comes in separately, from EPA's own export, through tools/import_npl_csv.mjs.
 *
 * Writes, deterministically (no timestamps):
 *   WebXR/shared/cleanup-atlas-data.js   the atlas, for the bundles
 *   docs/cleanup-atlas.md                the same atlas, readable
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const CLEANUP_ATLAS_FILE = join(ROOT, "WebXR", "shared", "cleanup-atlas-data.js");
export const CLEANUP_ATLAS_DOC = join(ROOT, "docs", "cleanup-atlas.md");

// The phases of a cleanup, in the order the work runs. Station ids are catalog ids; the checker fails on any that
// is not. A station sits in one phase only.
export const CLEANUP_PHASES = [
  { id: "record", label: "The record and site entry", stations: ["hunters-point", "hazwoper-site-orientation", "can-we-live-story"] },
  { id: "survey", label: "Survey and sampling", stations: ["rad-survey", "building-rad-scan", "air-monitor", "drum-sampling-and-overpack"] },
  { id: "removal", label: "Removal, abatement and haul", stations: ["soil-loadout", "haul-road-dust", "pcb-equipment-removal", "transite-pipe-removal", "ust-removal", "abatement-chamber", "hz-drum-staging-and-compatibility-segregation", "hz-level-b-entry-and-scba-change-out", "decon-line"] },
  { id: "groundwater", label: "Groundwater and vapour", stations: ["sampling-well", "well-install", "pump-and-treat", "vapor-mitigation", "isco-injection"] },
  { id: "shoreline", label: "Stormwater, sediment and the shoreline", stations: ["stormwater-outfall", "bioswale-build", "dredge-barge", "sediment-cap", "creosote-pile-removal", "tide-gate", "living-shoreline", "oyster-reef-monitoring", "marsh-transect-survey", "spartina-removal", "eelgrass-transplant"] },
  { id: "community", label: "Community oversight", stations: ["parcel-status-walk", "public-comment-prep", "community-soil-split", "odor-complaint-log", "dust-plan-review", "garden-soil-screen"] },
];

// Region files on the San Francisco Bay maps, and the site kinds counted as the Bay's working waterfront.
export const BAY_REGION_FILE = /^np-data-(bay|bp|oak|sf)-/;
export const WATERFRONT_KINDS = ["port", "shipyard", "harbour", "marina", "ferry", "landing", "boat-landing", "boatyard", "dredge", "fuel-farm", "tank-farm", "refinery"];

// The phases a waterfront site of each kind should train: industrial yards the full sequence of survey, removal
// and the shoreline; berths for boats the shoreline work at their own piles and marsh.
const INDUSTRIAL = ["survey", "removal", "shoreline"];
export const WATERFRONT_PHASES = { port: INDUSTRIAL, shipyard: INDUSTRIAL, boatyard: INDUSTRIAL, refinery: INDUSTRIAL, "fuel-farm": INDUSTRIAL, "tank-farm": INDUSTRIAL, dredge: ["shoreline"], harbour: ["shoreline"], marina: ["shoreline"], ferry: ["shoreline"], landing: ["shoreline"], "boat-landing": ["shoreline"] };

const phaseOf = new Map(CLEANUP_PHASES.flatMap((p) => p.stations.map((s) => [s, p.id])));

const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR", "smartcity", "catalog.json"), "utf8"));
// Each catalog programme's station ids, so a site's programmes can say which phases it offers.
export const PROGRAMME_STATIONS = new Map(catalog.curricula.map((c) => [c.id, c.stations.map((s) => s.id ?? s)]));
const phasesIn = (ids) => CLEANUP_PHASES.map((p) => p.id).filter((id) => ids.some((s) => phaseOf.get(s) === id));

/**
 * One site's atlas entry, or null when the site has no cleanup phase. Pure. `phases` are the ones the site's own
 * stations train there; `offered` the ones a programme the site offers teaches in its sequence.
 */
export function cleanupSite(file, region, site, programmeStations = PROGRAMME_STATIONS) {
  const phases = phasesIn(site.stations ?? []);
  const cleanupProgrammes = (site.programmes ?? []).filter((id) => phasesIn(programmeStations.get(id) ?? []).length);
  const offered = phasesIn(cleanupProgrammes.flatMap((id) => programmeStations.get(id) ?? []));
  const bay = BAY_REGION_FILE.test(file);
  const waterfront = bay && WATERFRONT_KINDS.includes(site.kind);
  if (!phases.length && !offered.length && !waterfront) return null;
  return {
    region: region.id,
    site: site.id,
    name: site.name,
    kind: site.kind,
    bay,
    waterfront,
    phases,
    offered,
    programmes: cleanupProgrammes,
    stations: (site.stations ?? []).filter((s) => phaseOf.has(s)),
    unions: [...(site.trades ?? [])].sort(),
  };
}

/** The atlas: the phases with the unions that train each on a map, every cleanup site, and the Bay waterfront. */
export async function buildCleanupAtlas() {
  const { loadRegions, REGION_CATALOG } = await import(pathToFileURL(join(ROOT, "tools", "gen_region_training.mjs")).href);
  const regions = await loadRegions();
  const sites = [];
  for (const { file, region } of regions) for (const s of region.sites) { const e = cleanupSite(file, region, s); if (e) sites.push(e); }
  sites.sort((a, b) => a.region.localeCompare(b.region) || a.site.localeCompare(b.site));
  const phases = CLEANUP_PHASES.map((p) => {
    const at = sites.filter((s) => s.phases.includes(p.id));
    return {
      id: p.id,
      label: p.label,
      stations: p.stations,
      unresolved: p.stations.filter((s) => !REGION_CATALOG.stations.has(s)),
      sites: at.length,
      baySites: at.filter((s) => s.bay).length,
      offeredAt: sites.filter((s) => s.offered.includes(p.id)).length,
      unions: [...new Set(at.flatMap((s) => s.unions))].sort(),
    };
  });
  const waterfront = sites.filter((s) => s.waterfront);
  return {
    phases,
    sites: sites.filter((s) => s.phases.length || s.offered.length),
    bayWaterfront: waterfront.map((s) => ({ ...s, missing: WATERFRONT_PHASES[s.kind].filter((p) => !s.phases.includes(p) && !s.offered.includes(p)) })),
  };
}

function writeAll(atlas) {
  writeFileSync(CLEANUP_ATLAS_FILE,
    `// Cleanup atlas (generated by tools/gen_cleanup_atlas.mjs). The phases of a hazardous-site cleanup, every map\n` +
    `// site that trains one, and the Bay's working waterfront with the phases each site still lacks. Do not edit by hand.\n` +
    `export const CLEANUP_ATLAS = ${JSON.stringify(atlas, null, 2)};\n`);
  const L = [
    "# Cleanup atlas",
    "",
    "Generated by `tools/gen_cleanup_atlas.mjs` from each map site's own stations, programmes and trades. A phase is *trained* at a site when one of the site's stations belongs to it, and *offered* when a programme the site lists teaches it. The phases follow the order the Hunters Point Clean-up and Bay Restoration programme teaches. No cleanup site, figure or status is added here; EPA's national list comes in through `tools/import_npl_csv.mjs`.",
    "",
    "## Phases",
    "",
    "| Phase | Stations | Sites that train it | On the Bay maps | Sites offering it in a programme | Unions training it on a map |",
    "|---|---|---|---|---|---|",
    ...atlas.phases.map((p) => `| ${p.label} | ${p.stations.length} | ${p.sites} | ${p.baySites} | ${p.offeredAt} | ${p.unions.length} |`),
    "",
    "## The Bay's working waterfront",
    "",
    "Ports, shipyards, harbours, marinas, landings and the refinery yard on the San Francisco Bay maps. A missing phase is one the site should train for its kind (survey, removal and shoreline for a port, yard or refinery; the shoreline for a berth for boats) and does not yet.",
    "",
    "| Site | Region | Kind | Phases trained | Offered in a programme | Missing | Unions |",
    "|---|---|---|---|---|---|---|",
    ...atlas.bayWaterfront.map((s) => `| ${s.name} | ${s.region} | ${s.kind} | ${s.phases.join(", ") || "none"} | ${s.offered.join(", ") || "none"} | ${s.missing.join(", ") || "none"} | ${s.unions.join(", ")} |`),
    "",
    "## Every site that trains or offers a cleanup phase",
    "",
    "| Site | Region | Phases trained | Offered in a programme |",
    "|---|---|---|---|",
    ...atlas.sites.map((s) => `| ${s.name} | ${s.region} | ${s.phases.join(", ") || "none"} | ${s.offered.join(", ") || "none"} |`),
    "",
  ];
  writeFileSync(CLEANUP_ATLAS_DOC, L.join("\n"));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const atlas = await buildCleanupAtlas();
  writeAll(atlas);
  const full = atlas.bayWaterfront.filter((s) => !s.missing.length).length;
  console.log(`Wrote ${CLEANUP_ATLAS_FILE.replace(ROOT + "/", "")} — ${atlas.sites.length} cleanup sites; Bay waterfront ${atlas.bayWaterfront.length} sites, ${full} training every phase their kind needs.`);
}
