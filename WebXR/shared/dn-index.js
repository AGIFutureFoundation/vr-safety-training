// DEAN's lesson index across every world (docs/modules.md): what a module may
// hold and where each piece plays — catalogue programme stations, the parish
// and district sites' stations, the K-12 field lessons of every world
// (K2_FIELD_LESSONS and each parish's own `fieldLessons`), and BAYOU's parish
// lessons (BY_LESSONS) — plus each parish/district's lat/lng frame for the
// shared export (tools/export_shared.mjs). Pure: no DOM, no network. Every
// top-level name is prefixed dn/DN_.

import { PP_PROGRAMMES } from "./passport-programmes.js";
import { NP_PARISHES, npRegionOf } from "./np-parishes.js";
import { npToGeo, npBounds } from "./np-geo.js";
import { K2_FIELD_LESSONS } from "./field-lessons.js";
import { BY_LESSONS } from "./by-parish-lessons.js";

/** The New Orleans parishes' county FIPS codes (the Trade Craft Academy's street-fabric files are keyed by them). */
export const DN_PARISH_FIPS = { orleans: "22071", jefferson: "22051", "st-bernard": "22087", plaquemines: "22075", "st-tammany": "22103" };

/**
 * The index: `{ lessons: [{ kind, id, world, parish, site, title }], byKey: Map, resolve(ref), byWorld() }`.
 * `catalogIds` (the catalogue's station ids, when the caller has catalog.json) widens the station set.
 */
export function dnLessonIndex({ catalogIds = [] } = {}) {
  const lessons = [];
  const byKey = new Map();
  const add = (l) => { const k = `${l.kind}:${l.id}`; if (!byKey.has(k)) { byKey.set(k, l); lessons.push(l); } else if (l.world && !byKey.get(k).worlds.includes(l.world)) byKey.get(k).worlds.push(l.world); };
  for (const p of NP_PARISHES) {
    for (const s of p.sites ?? []) for (const id of s.stations ?? []) add({ kind: "station", id, world: "parishes", worlds: ["parishes"], parish: p.id, site: s.id, title: id.replace(/-/g, " ") });
    for (const l of p.fieldLessons ?? []) add({ kind: "field", id: l.id, world: "parishes", worlds: ["parishes"], parish: p.id, site: l.site ?? null, title: l.title, station: l.k12 ?? null });
  }
  for (const [pid, prog] of Object.entries(PP_PROGRAMMES)) for (const id of prog.stations ?? []) add({ kind: "station", id, world: "smartcity", worlds: ["smartcity"], parish: null, site: null, title: id.replace(/-/g, " "), programme: pid });
  for (const id of catalogIds) add({ kind: "station", id, world: "smartcity", worlds: ["smartcity"], parish: null, site: null, title: id.replace(/-/g, " ") });
  for (const l of K2_FIELD_LESSONS) add({ kind: "field", id: l.id, world: l.world, worlds: [l.world], parish: null, site: l.anchor?.id ?? null, title: l.title, station: l.station });
  for (const l of BY_LESSONS) add({ kind: "parish-lesson", id: l.id, world: "parishes", worlds: ["parishes"], parish: l.parish, site: l.site ?? null, title: l.title ?? l.id, station: l.station ?? null });
  return {
    lessons, byKey,
    resolve: (ref) => byKey.get(`${ref?.kind}:${ref?.id}`) ?? null,
    byWorld() {
      const out = {};
      for (const l of lessons) for (const w of l.worlds) { (out[w] ??= { station: [], field: [], "parish-lesson": [] })[l.kind].push(l.id); }
      for (const w of Object.values(out)) for (const k of Object.keys(w)) w[k] = [...new Set(w[k])].sort();
      return out;
    },
  };
}

/** Every parish/district with its frame: `[{ id, name, region, size, fips, centre: [lng, lat], bounds, sites }]`. */
export function dnFrames() {
  return NP_PARISHES.map((p) => {
    const c = npToGeo(p, [0, 0]); const b = npBounds(p);
    const r6 = (v) => Math.round(v * 1e6) / 1e6;
    return {
      id: p.id, name: p.name, region: npRegionOf(p), size: p.size ?? 4096, fips: DN_PARISH_FIPS[p.id] ?? null,
      centre: [r6(c[0]), r6(c[1])], bounds: { minLng: r6(b.minLon), minLat: r6(b.minLat), maxLng: r6(b.maxLon), maxLat: r6(b.maxLat) },
      sites: (p.sites ?? []).map((s) => ({ id: s.id, stations: [...(s.stations ?? [])] })),
    };
  });
}
