/**
 * The SmartCiti.X Powered by AGI Corp Holodeck Packs — the registry (console PACKS, docs/consoles/PACKS.md).
 *
 * SEAMS (documented shapes; other consoles code against these):
 *
 *   pkPacks(filter?) -> [pack]
 *       filter = { kind?, path?, audience?, union? } — `path` matches a pack's `path` or its `alsoPaths`
 *       (STORYLINE's path ids: union-trades, k12, first-responders, un-training, disaster-relief, teachers, roam).
 *   pkPack(id) -> pack | null
 *   pkPackOf(stationId) -> [pack]            every pack that holds the station (programme packs first)
 *   pkPacksAt(place) -> [pack]               place = "bayworld" | "underwater" | "summit" | "redwood" | "parishes:<map id>"
 *   pkPathPacks(pathId) -> [pack]            the packs a chosen path shows first (pkPacks({ path }))
 *
 *   pack = { id, kind: "programme"|"k12"|"union"|"library", title: "SmartCiti.X <name> — Powered by AGI Corp", name,
 *            audience, path, alsoPaths: [pathId], unions: [unionsRegistryId], k12Bands: [string],
 *            programmes: [catalogProgrammeId], stations: [{ app, id }], version, manifest: "packs/<id>.json" }
 *
 * The data is generated (WebXR/shared/pk-packs-data.js by tools/gen_packs.mjs) from the catalog, the unions
 * registry and the worlds' site data; nothing here is hand-typed. Pure: no DOM, no fetch.
 */
import { PK_DATA, PK_NON_SMARTCITY, PK_PLACES, PK_PROGRAMME_IDS, PK_STATION_IDS } from "./pk-packs-data.js";

export const PK_BRAND_LINE = "SmartCiti.X · Powered by AGI Corp";
export const PK_PATH_IDS = ["union-trades", "k12", "first-responders", "un-training", "disaster-relief", "teachers", "roam"];

const pkNonSmartcity = new Set(PK_NON_SMARTCITY);
const pkKindOrder = { programme: 0, k12: 1, union: 2, library: 3 };
let pkCache = null;

function pkExpand(row) {
  return {
    id: row.id, kind: row.kind, name: row.name, title: `SmartCiti.X ${row.name} — Powered by AGI Corp`,
    audience: row.audience, path: row.path, alsoPaths: row.alsoPaths.slice(), unions: row.unions.slice(),
    k12Bands: row.k12Bands.slice(), programmes: row.p.map((i) => PK_PROGRAMME_IDS[i]),
    stations: row.s.map((i) => ({ app: pkNonSmartcity.has(PK_STATION_IDS[i]) ? "trades" : "smartcity", id: PK_STATION_IDS[i] })),
    version: row.version, manifest: `packs/${row.id}.json`,
  };
}
function pkAll() {
  if (!pkCache) {
    const list = PK_DATA.map(pkExpand);
    const byStation = new Map();
    list.forEach((p) => p.stations.forEach((s) => { if (!byStation.has(s.id)) byStation.set(s.id, []); byStation.get(s.id).push(p); }));
    for (const arr of byStation.values()) arr.sort((a, b) => pkKindOrder[a.kind] - pkKindOrder[b.kind]);
    pkCache = { list, byId: new Map(list.map((p) => [p.id, p])), byStation };
  }
  return pkCache;
}

/** Every pack, optionally filtered by { kind, path, audience, union }. */
export function pkPacks(filter = {}) {
  const f = filter ?? {};
  return pkAll().list.filter((p) => (!f.kind || p.kind === f.kind)
    && (!f.path || p.path === f.path || p.alsoPaths.includes(f.path))
    && (!f.audience || p.audience === f.audience)
    && (!f.union || p.unions.includes(f.union)));
}
/** One pack by id, or null. */
export function pkPack(id) { return pkAll().byId.get(String(id ?? "")) ?? null; }
/** The packs that hold a station, programme packs first. */
export function pkPackOf(stationId) { return (pkAll().byStation.get(String(stationId ?? "")) ?? []).slice(); }
/** The packs that play at a place ("bayworld", …, "parishes:<map id>"). */
export function pkPacksAt(place) { return (PK_PLACES[String(place ?? "")] ?? []).map((i) => pkAll().list[i]); }
/** The packs a chosen STORYLINE path shows. */
export function pkPathPacks(pathId) { return PK_PATH_IDS.includes(pathId) ? pkPacks({ path: pathId }) : []; }
