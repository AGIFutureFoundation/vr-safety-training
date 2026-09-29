// The parish registry (console PARISH, docs/consoles/PARISH.md): every
// parish map on the shared schema, in selector order. DELTA adds one import
// and one array entry per parish; tools/check_parishes.mjs also globs
// shared/np-data-*.js so a module missing from this list is a failure.
//
// Regions (console GOLDEN-A): the engine carries more than New Orleans. Each
// map names its `region` (a map without one is a New Orleans parish, so the
// five parish modules need no edit); NP_REGIONS lists the regions in selector
// order with the words the page uses — the page title, and whether a map is a
// "parish" or a "district". The selector shows regions, then their maps.
//
// A connector's far end may be written by its owner as the crossing's
// approximate `lonlat` with `position: null` (the owner never guesses the
// other parish's frame); npResolveConnectors() fills the position through
// the other parish's own fit once that module is registered. Pure.
import { NP_ORLEANS } from "./np-data-orleans.js";
import { NP_JEFFERSON } from "./np-data-jefferson.js";
import { NP_ST_BERNARD } from "./np-data-st-bernard.js";
import { NP_PLAQUEMINES } from "./np-data-plaquemines.js";
import { NP_ST_TAMMANY } from "./np-data-st-tammany.js";
import { NP_SF_DOWNTOWN } from "./np-data-sf-downtown.js";
import { NP_SF_MISSION } from "./np-data-sf-mission.js";
import { NP_SF_GOLDEN_GATE_PARK } from "./np-data-sf-golden-gate-park.js";
import { NP_SF_MARINA } from "./np-data-sf-marina.js";
import { NP_SF_BAYVIEW } from "./np-data-sf-bayview.js";
// Oakland & the East Bay (console BAYMAP, docs/consoles/BAYMAP.md).
import { NP_OAK_WEST_OAKLAND } from "./np-data-oak-west-oakland.js";
import { NP_OAK_DOWNTOWN_LAKE } from "./np-data-oak-downtown-lake.js";
import { NP_OAK_FRUITVALE_ESTUARY } from "./np-data-oak-fruitvale-estuary.js";
// The world ways (GOLDEN-B): the Bay Bridge from Downtown across to Bay World.
import { sgWaysFor } from "./sg-ways.js";
// ...and BAYMAP's ways from the Oakland districts to their Bay World counterparts.
import { bmWaysFor } from "./bm-ways.js";
import { npGeoToXz, npToGeo } from "./np-geo.js";

/** Every parish, in the selector's order. */
export const NP_PARISHES = [
  NP_ORLEANS, NP_JEFFERSON, NP_ST_BERNARD, NP_PLAQUEMINES, NP_ST_TAMMANY,
  NP_SF_DOWNTOWN, NP_SF_MISSION, NP_SF_GOLDEN_GATE_PARK, NP_SF_MARINA, NP_SF_BAYVIEW,
  NP_OAK_WEST_OAKLAND, NP_OAK_DOWNTOWN_LAKE, NP_OAK_FRUITVALE_ESTUARY,
];

/** The regions, in the selector's order: id, name, the page title, and what one map is called. */
export const NP_REGIONS = [
  { id: "new-orleans", name: "New Orleans", title: "New Orleans Parishes", noun: "parish", nouns: "parishes" },
  { id: "san-francisco", name: "San Francisco", title: "San Francisco Districts", noun: "district", nouns: "districts" },
  { id: "oakland", name: "Oakland & the East Bay", title: "Oakland & East Bay Districts", noun: "district", nouns: "districts" },
];

/** The region id a map belongs to: its `region`, else New Orleans (the parish modules predate regions). */
export function npRegionOf(parish) { return parish?.region ?? "new-orleans"; }

/** A region by id, or null. */
export function npRegion(id) { return NP_REGIONS.find((r) => r.id === id) ?? null; }

/** The regions in order, each with its maps in registry order: `[{ region, parishes }]` (a region with no map is left out). */
export function npRegionGroups(parishes = NP_PARISHES) {
  return NP_REGIONS.map((region) => ({ region, parishes: parishes.filter((p) => npRegionOf(p) === region.id) })).filter((g) => g.parishes.length);
}

/** A parish by id, or null. */
export function npParish(id) { return NP_PARISHES.find((p) => p.id === id) ?? null; }

/** The ids in order (the selector, `?parish=`). */
export function npParishIds() { return NP_PARISHES.map((p) => p.id); }

/**
 * A parish's connectors with every far end resolved to a position in the
 * other parish's frame when that parish is registered: `{ …connector,
 * to: { parish, position, lonlat }, other, resolved }`. `resolved` is false
 * when the other parish is not in the tree yet (the map still draws the
 * connector as a way out).
 */
export function npResolveConnectors(parish, parishes = NP_PARISHES) {
  // A `world` connector (shared/sg-ways.js) leaves this parish for another world's page: its `from` end is projected
  // through this parish's own fit from the crossing's lonlat and kept inside the field; it is always resolved.
  const npWay = (c) => {
    const half = (parish.size ?? 4096) / 2 - 8;
    const position = c.from?.position ?? npGeoToXz(parish, c.lonlat).map((v) => Math.max(-half, Math.min(half, Math.round(v))));
    return { ...c, from: { ...c.from, parish: parish.id, position }, to: { ...c.to }, other: null, resolved: true, world: c.to?.world ?? null };
  };
  return [...(parish.connectors ?? []), ...sgWaysFor(parish.id), ...bmWaysFor(parish.id)].map((c) => {
    if (c.kind === "world") return npWay(c);
    const other = parishes.find((p) => p.id === c.to?.parish) ?? null;
    const fromLL = npToGeo(parish, c.from.position);
    let position = c.to?.position ?? null, lonlat = c.to?.lonlat ?? null;
    if (other) {
      if (position) lonlat = lonlat ?? npToGeo(other, position);
      else position = npGeoToXz(other, lonlat ?? fromLL);
    }
    return { ...c, to: { parish: c.to?.parish, position, lonlat: lonlat ?? fromLL }, other, resolved: !!other && !!position };
  });
}
