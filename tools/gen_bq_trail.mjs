#!/usr/bin/env node
// BAYQUEST (docs/consoles/BAYQUEST.md) — writes WebXR/shared/bq-trail-data.js: the Bay Keeper's Trail, an
// easter-egg hunt of hidden treasures at the Bay Program's work sites in Bay World (the port, the estuary
// shoreline, West Oakland, Fruitvale, the Coliseum edge and the shorelines).
//
// The treasure rules (tools/gen_treasures.mjs, docs/treasures.md), read the same way:
//   - every reveal teaches ONE sourced line: a station's own `why` copied verbatim from
//     WebXR/smartcity/js/curricula.js (the same reader as gen_treasures' whyLesson), or a Bay Program /
//     Clean Ports line copied verbatim into WebXR/shared/bq-facts.js from the facts file, with its page;
//   - places come from the world's own data (BAY_SITES), nudged until the spot is off the water
//     (txWaterTopAt, unless on a quay), off every road (bayRoadAt, with a kerb margin), and 15 m clear of
//     every other treasure (the platform's TZ treasures included);
//   - no station why is used twice.
//
//   node tools/gen_bq_trail.mjs           # write the module
//   node tools/gen_bq_trail.mjs --check   # exit 1 if the module on disk differs from a fresh generation

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const OUT = path.join(ROOT, "WebXR/shared/bq-trail-data.js");
globalThis.localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} };

const { CURRICULA } = await imp("WebXR/smartcity/js/curricula.js");
const { BAY_SITES, BAY_BOUNDS, txWaterTopAt, txQuayAt, bayRoadAt } = await imp("WebXR/shared/bayworld-data.js");
const { TZ_TREASURES } = await imp("WebXR/shared/treasures-data.js");
const { BQ_FACTS } = await imp("WebXR/shared/bq-facts.js");
const CURR_SRC = fs.readFileSync(path.join(ROOT, "WebXR/smartcity/js/curricula.js"), "utf8");

const WHY = new Map();
for (const c of CURRICULA) for (const s of c.stations) {
  if (WHY.has(s.id) || typeof s.why !== "string") continue;
  if (!CURR_SRC.includes(`"${s.why}"`)) continue;
  WHY.set(s.id, s.why);
}

/** Off the water (a quay counts as land), off every road with a kerb margin, inside the world. */
export function bqSpotOk(x, z) {
  const { minX, maxX, minZ, maxZ } = BAY_BOUNDS;
  if (x < minX + 10 || x > maxX - 10 || z < minZ + 10 || z > maxZ - 10) return false;
  if (txWaterTopAt(x, z) !== null && txQuayAt(x, z, 2) < 0) return false; // txQuayAt is an index, -1 off every quay
  for (const [dx, dz] of [[0, 0], [3, 0], [-3, 0], [0, 3], [0, -3]]) if (bayRoadAt(x + dx, z + dz)) return false;
  return true;
}

const taken = TZ_TREASURES.filter((t) => t.trigger?.world === "bayworld").map((t) => [t.trigger.x, t.trigger.z]);
function place(site) {
  const [sx, sz] = site.position;
  for (let r = 8; r <= 80; r += 4) {
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2 + r * 0.37;
      const x = Math.round(sx + Math.cos(a) * r), z = Math.round(sz + Math.sin(a) * r);
      if (!bqSpotOk(x, z)) continue;
      if (taken.some(([tx, tz]) => Math.hypot(tx - x, tz - z) < 15)) continue;
      taken.push([x, z]);
      return [x, z];
    }
  }
  throw new Error(`no dry, off-road spot near ${site.id}`);
}

// The theme table: a Bay World site, the program category it stands for, and the station whose why it teaches
// (or a facts-file line). Places by the world's own site ids only.
const THEMES = [
  ["port-maintenance-shop", "Trash capture", { station: "br-trash-capture-device-service" }],
  ["port-hazmat-response-yard", "Stormwater", { station: "pt-stormwater-at-the-terminal" }],
  ["port-rail-yard", "Port of Oakland trash capture", { fact: "port-trash-capture" }],
  ["port-container-terminal", "Zero-emission port", { station: "straddle-carrier-ops" }],
  ["west-oakland-truck-yard", "Zero-emission port", { station: "po-yard-hostler-and-pedestrian-separation" }],
  ["west-oakland-substation-yard", "Charging", { station: "et-ev-fleet-depot-charging-and-arc-flash" }],
  ["west-oakland-utility-yard", "Battery storage", { station: "battery-storage-container-commissioning" }],
  ["west-oakland-union-hall", "Clean Ports equipment", { fact: "cleanports-equipment" }],
  ["west-oakland-air-monitoring-post", "Clean Ports workforce", { fact: "cleanports-workforce" }],
  ["west-oakland-warehouse-district", "Green stormwater infrastructure", { station: "op-excavator-trench-and-utility-locate" }],
  ["estuary-shoreline-park-trailhead", "The Bay Program", { fact: "program" }],
  ["estuary-research-dock", "Sediment", { station: "br-sediment-chain-of-custody-and-lab-prep" }],
  ["estuary-marina-boatyard", "Tidal marsh", { station: "br-tidal-marsh-grading-amphibious-excavator" }],
  ["fruitvale-community-college", "Native planting", { station: "br-native-planting-and-erosion-mats" }],
  ["fruitvale-elementary-school", "Stormwater", { station: "stormwater-outfall" }],
  ["coliseum-stadium", "Tidal marsh", { station: "me-tidal-marsh-channel-restoration-day" }],
  ["south-treatment-plant", "Nutrients and water quality", { station: "me-water-column-sampling-from-a-small-boat" }],
  ["south-shoreline-marina", "Fish habitat", { station: "br-beach-seine-fish-survey-and-handling" }],
  ["north-shoreline-field-lab", "Fish habitat", { station: "br-culvert-retrofit-for-fish-passage" }],
  ["north-marina-pier", "PCB source control", { station: "br-legacy-mercury-and-pcb-hotspot-handling" }],
  ["coliseum-arena", "Sediment", { station: "br-dredge-spoils-dewatering-pad" }],
  ["fruitvale-fire-station", "Eelgrass and habitat", { station: "eelgrass-transplant" }],
];
const REVEALS = ["river otter token", "egret feather", "oyster shell", "eelgrass sprig", "tide marker", "sea glass", "crab tag", "heron print"];

const used = new Set();
const treasures = THEMES.map(([siteId, category, pick], i) => {
  const site = BAY_SITES.find((s) => s.id === siteId);
  if (!site) throw new Error(`unknown Bay World site ${siteId}`);
  let lesson, source;
  if (pick.station) {
    if (!WHY.has(pick.station)) throw new Error(`no verbatim why for ${pick.station}`);
    if (used.has(pick.station)) throw new Error(`${pick.station} used twice`);
    used.add(pick.station);
    lesson = WHY.get(pick.station);
    source = { file: "WebXR/smartcity/js/curricula.js", station: pick.station };
  } else {
    const f = BQ_FACTS.find((x) => x.id === pick.fact);
    if (!f) throw new Error(`unknown fact ${pick.fact}`);
    lesson = f.text;
    source = { file: "WebXR/shared/bq-facts.js", fact: f.id, page: f.source };
  }
  const [x, z] = place(site);
  return {
    id: `bq-t-${String(i + 1).padStart(2, "0")}-${siteId}`, set: "bq-bay-keepers-trail", world: "bayworld",
    site: siteId, siteName: site.name, zone: site.zone, category, reveal: REVEALS[i % REVEALS.length],
    hint: `Look near ${site.name}, off the road and above the waterline.`,
    trigger: { world: "bayworld", x, z, r: 5 }, lesson, source,
  };
});

const header = `// GENERATED by tools/gen_bq_trail.mjs — do not hand-edit. BAYQUEST's Bay Keeper's Trail (docs/consoles/BAYQUEST.md).
// Every lesson is verbatim from its source (a station's why in curricula.js, or a facts line in bq-facts.js with its page);
// every spot is off the water and off the roads of Bay World (tools/check_bayquest.mjs re-checks both).
`;
const body = `${header}
export const BQ_TRAIL = ${JSON.stringify({ id: "bq-bay-keepers-trail", name: "The Bay Keeper's Trail", badge: "Bay Keeper", world: "bayworld", storageKey: "bq-trail-v1", total: treasures.length }, null, 2)};

export const BQ_TREASURES = ${JSON.stringify(treasures, null, 2)};
`;
if (process.argv.includes("--check")) {
  const same = fs.existsSync(OUT) && fs.readFileSync(OUT, "utf8") === body;
  console.log(same ? `bq trail: up to date (${treasures.length} treasures)` : "bq trail: STALE — run node tools/gen_bq_trail.mjs");
  process.exit(same ? 0 : 1);
}
fs.writeFileSync(OUT, body);
console.log(`bq trail: ${treasures.length} treasures -> WebXR/shared/bq-trail-data.js`);
