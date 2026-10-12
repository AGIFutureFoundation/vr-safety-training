/**
 * LESSONS-X: build the lesson packs' data from the real station roster.
 *
 *     node tools/gen_lx_packs.mjs          # writes WebXR/shared/lx-packs-data.js
 *     node tools/gen_lx_packs.mjs --check  # exits 1 if the committed file differs from a fresh build
 *
 * Each pack is declared by world and site. The stations come off the worlds' own site lists (RB_SITES,
 * BAY_SITES, DEEP_SITES, SM_SITES), and each station's steps (id, title, cue) are read from its own sim module
 * (WebXR/smartcity/js/sims/<id>.js), so every lesson line can quote the station it teaches. Nothing is written
 * by hand: a step title or cue in the output is a string from the sim file. K-12 stations are left out of these
 * adult packs (listed under `left`). ACCESS's interiors are declared pending until their ids land.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SH = (m) => pathToFileURL(join(ROOT, "WebXR/shared", m)).href;
const { RB_SITES } = await import(SH("rb-robotics-data.js"));
const { BAY_SITES } = await import(SH("bayworld-data.js"));
const { DEEP_SITES } = await import(SH("underwater-data.js"));
const { SM_SITES } = await import(SH("summit-data.js"));

export const LX_GEN_MAX_STATIONS = 6;

// The declarations: world, sites, title. The order of sites is the order of the pack.
export const LX_GEN_DECLS = [
  { id: "lx-pack-parish-robot-sites", world: "parishes", worldName: "The parishes (robot sites)", title: "Robot sites: cell entry, fleet traffic, cobot zones, drilling deck",
    leader: "hive", sites: RB_SITES.map((s) => ({ id: s.id, name: s.name, stations: [s.station] })) },
  { id: "lx-pack-bay-port", world: "bayworld", worldName: "Bay World", title: "Port and harbour: terminal, rail yard and maintenance shop",
    leader: "vbridge", sites: pick(BAY_SITES, ["port-container-terminal", "port-rail-yard", "port-maintenance-shop"]) },
  { id: "lx-pack-bay-estuary", world: "bayworld", worldName: "Bay World", title: "Estuary waterfront: research dock and boatyard",
    leader: "vbridge", sites: pick(BAY_SITES, ["estuary-research-dock", "estuary-marina-boatyard"]) },
  { id: "lx-pack-deep-pier", world: "underwater", worldName: "The Deep", title: "Pier diving: inspection and surface-supplied stations",
    leader: "vbridge", sites: pick(DEEP_SITES, ["pier-piling-inspection-station", "pier-surface-supplied-station"]) },
  { id: "lx-pack-summit-utilities", world: "summit", worldName: "Summit", title: "Water and power on the pass: treatment plant, dam and substation",
    leader: "hive", sites: pick(SM_SITES, ["water-plant", "dam", "substation"]) },
];

// ACCESS (round 8b) builds four walk-in interiors with station pads. Their ids are not in this tree yet; the pack
// stays pending (never filled with stand-ins) until they are posted and the pads name real stations.
export const LX_GEN_PENDING = [
  { id: "lx-pack-access-interiors", world: "parishes", worldName: "The parishes (walk-in interiors)", title: "Walk-in interiors: apparatus bay, drop-off lobby, classroom wing, park pavilion",
    waitingFor: "ACCESS's interior ids and their station pads (acc-*.js)" },
];

function pick(list, ids) {
  return ids.map((id) => {
    const s = list.find((x) => x.id === id);
    if (!s) throw new Error(`gen_lx_packs: site ${id} not found`);
    return { id: s.id, name: s.name, stations: (s.stations ?? []).slice() };
  });
}

/** The station's own steps, read from its sim module: `[{ id, title, cue }]` (empty if the file or block is missing). */
export function lxGenSteps(stationId) {
  const f = join(ROOT, "WebXR/smartcity/js/sims", `${stationId}.js`);
  if (!existsSync(f)) return [];
  const src = readFileSync(f, "utf8");
  const lines = src.split("\n");
  const start = lines.findIndex((l) => /^\s*steps:\s*\[\s*$/.test(l));
  if (start < 0) return [];
  const indent = lines[start].match(/^\s*/)[0];
  let end = start + 1;
  while (end < lines.length && !new RegExp(`^${indent}\\],?\\s*$`).test(lines[end])) end += 1;
  const block = lines.slice(start + 1, end).join("\n");
  // Split the block into its top-level objects (depth 1), skipping braces inside strings.
  const objs = [];
  let depth = 0, from = -1, q = null;
  for (let i = 0; i < block.length; i += 1) {
    const c = block[i];
    if (q) { if (c === "\\") i += 1; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") { q = c; continue; }
    if (c === "{") { if (depth === 0) from = i; depth += 1; }
    else if (c === "}") { depth -= 1; if (depth === 0 && from >= 0) { objs.push(block.slice(from, i + 1)); from = -1; } }
  }
  const str = (text, key) => {
    const m = text.match(new RegExp(`(?:^|[\\s{,])["']?${key}["']?\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    if (!m) return null;
    try { return JSON.parse(`"${m[1]}"`); } catch { return null; }
  };
  const out = [];
  for (const o of objs) {
    const id = str(o, "id"), title = str(o, "title"), cue = str(o, "cue");
    if (id && title && cue) out.push({ id, title, cue });
  }
  return out;
}

export function lxGenBuild() {
  const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
  const enterable = new Map(catalog.stations.filter((s) => !s.flat).map((s) => [s.id, s]));
  const packs = [];
  const steps = {};
  for (const d of LX_GEN_DECLS) {
    const stations = [];
    const left = [];
    for (const site of d.sites) {
      for (const id of site.stations) {
        if (stations.some((s) => s.id === id)) continue;
        if (/^k12-/.test(id)) { left.push({ id, why: "K-12 station (adult pack)" }); continue; }
        if (stations.length >= LX_GEN_MAX_STATIONS) { left.push({ id, why: `pack holds ${LX_GEN_MAX_STATIONS}` }); continue; }
        stations.push({ id, site: site.id, siteName: site.name });
        if (enterable.has(id)) {
          const st = lxGenSteps(id);
          if (st.length) steps[id] = st;
        }
      }
    }
    packs.push({ id: d.id, world: d.world, worldName: d.worldName, title: d.title, leader: d.leader, stations, left });
  }
  return { packs, pending: LX_GEN_PENDING, steps };
}

function render({ packs, pending, steps }) {
  const j = (v) => JSON.stringify(v);
  return `// GENERATED by tools/gen_lx_packs.mjs — do not hand-edit. Re-run the generator after a world's site list or a station's steps change.
// LESSONS-X: the lesson packs' declarations (stations from each world's own site list) and every pack station's own steps
// (id, title, cue), read from WebXR/smartcity/js/sims/<id>.js, so an agent-led lesson can quote the station it teaches.

export const LX_PACK_DECLS = Object.freeze(${j(packs)});

export const LX_PACK_PENDING = Object.freeze(${j(pending)});

export const LX_STATION_STEPS = Object.freeze(${j(steps)});
`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const out = join(ROOT, "WebXR/shared/lx-packs-data.js");
  const text = render(lxGenBuild());
  if (process.argv.includes("--check")) {
    const same = existsSync(out) && readFileSync(out, "utf8") === text;
    console.log(same ? "lx-packs-data.js matches a fresh build" : "lx-packs-data.js differs from a fresh build: run node tools/gen_lx_packs.mjs");
    process.exit(same ? 0 : 1);
  }
  writeFileSync(out, text);
  const b = lxGenBuild();
  console.log(`wrote ${out}: ${b.packs.length} packs, ${Object.keys(b.steps).length} stations with steps, ${text.length} bytes`);
  for (const p of b.packs) console.log(`  ${p.id}: ${p.stations.map((s) => s.id).join(", ")}${p.left.length ? ` (left: ${p.left.map((l) => l.id).join(", ")})` : ""}`);
}
