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
// The walkable San Francisco districts (console NEIGHBORHOODS, docs/consoles/NEIGHBORHOODS.md).
import { NP_SF_NORTH_BEACH } from "./np-data-sf-north-beach.js";
import { NP_SF_HAIGHT_CASTRO } from "./np-data-sf-haight-castro.js";
import { NP_SF_SUNSET_SOUTH } from "./np-data-sf-sunset-south.js";
// Oakland & the East Bay (console BAYMAP, docs/consoles/BAYMAP.md).
import { NP_OAK_WEST_OAKLAND } from "./np-data-oak-west-oakland.js";
import { NP_OAK_DOWNTOWN_LAKE } from "./np-data-oak-downtown-lake.js";
import { NP_OAK_FRUITVALE_ESTUARY } from "./np-data-oak-fruitvale-estuary.js";
// More of the Bay Area (console EASTBAY, docs/consoles/EASTBAY.md): Emeryville & Berkeley (Oakland), Downtown San Jose
// (South Bay) and San Pablo & Richmond (North East Bay).
import { NP_OAK_EMERYVILLE_BERKELEY } from "./np-data-oak-emeryville-berkeley.js";
import { NP_BAY_SAN_JOSE } from "./np-data-bay-san-jose.js";
import { NP_BAY_SAN_PABLO } from "./np-data-bay-san-pablo.js";
// The Bay Program project areas (console TIDELANDS): the 2026 EPA awards' named projects as walkable maps.
import { NP_SF_OUTER_MISSION } from "./np-data-sf-outer-mission.js";
import { NP_BP_STRIP_MARSH_EAST } from "./np-data-bp-strip-marsh-east.js";
import { NP_BP_SAN_LEANDRO_BAY } from "./np-data-bp-san-leandro-bay.js";
// PROJECTLANDS (docs/consoles/PROJECTLANDS.md): representative project areas for C/CAG (San Mateo County) and BACWA (a procedural plant).
import { NP_BP_SAN_MATEO_SHORELINE } from "./np-data-bp-san-mateo-shoreline.js";
import { NP_BP_NUTRIENT_PILOT } from "./np-data-bp-nutrient-pilot.js";
// The programme worlds (console SMILES, docs/consoles/SMILES.md): procedural districts built for one programme, not real places.
import { NP_SM_UNSPOKEN_SMILES } from "./np-data-sm-unspoken-smiles.js";
// Louisiana development sites (console SITES-COAST, docs/consoles/SITES-COAST.md): the coastal / Acadiana project maps.
import { NP_LA_STARBASE_VERMILION } from "./np-data-la-starbase-vermilion.js";
import { NP_LA_BLACK_BAYOU_CAMERON } from "./np-data-la-black-bayou-cameron.js";
import { NP_LA_SARONIC_FRANKLIN } from "./np-data-la-saronic-franklin.js";
import { NP_LA_AVEX_NEW_IBERIA } from "./np-data-la-avex-new-iberia.js";
// Louisiana development sites (console SITES-NORTH, docs/consoles/SITES-NORTH.md): three inland / river project maps, layouts illustrative.
import { NP_LA_META_RICHLAND } from "./np-data-la-meta-richland.js";
import { NP_LA_DELTA_FORGE_RAPIDES } from "./np-data-la-delta-forge-rapides.js";
import { NP_LA_SHINTECH_PLAQUEMINE } from "./np-data-la-shintech-plaquemine.js";
// SOUTHWEST (docs/consoles/SOUTHWEST.md): Lake Charles and Calcasieu Parish — the lakefront and downtown, the ship channel's
// industrial reach (Woodside Louisiana LNG's site area, layout illustrative) and the Port of Vinton (a FastSites site area).
import { NP_LC_LAKEFRONT_DOWNTOWN } from "./np-data-lc-lakefront-downtown.js";
import { NP_LC_CALCASIEU_CHANNEL } from "./np-data-lc-calcasieu-channel.js";
import { NP_LC_PORT_OF_VINTON } from "./np-data-lc-port-of-vinton.js";
// New Orleans neighbourhood districts (console NOLA-DISTRICTS, docs/consoles/NOLA-DISTRICTS.md): near-true-scale children
// of the Orleans map, each declaring `parent: "orleans"` (the parent/child "zoom in" pattern, docs/parishes.md).
import { NP_NOLA_FRENCH_QUARTER_CBD } from "./np-data-nola-french-quarter-cbd.js";
import { NP_NOLA_UPTOWN_GARDEN } from "./np-data-nola-uptown-garden.js";
import { NP_NOLA_MID_CITY_GENTILLY } from "./np-data-nola-mid-city-gentilly.js";
import { NP_NOLA_BYWATER_LOWER_NINTH } from "./np-data-nola-bywater-lower-ninth.js";
// Louisiana growth-city districts (console ACADIANA, docs/consoles/ACADIANA.md): Lafayette, Carencro and Monroe.
import { NP_LAF_DOWNTOWN } from "./np-data-laf-downtown.js";
import { NP_LAF_CARENCRO_NORTH } from "./np-data-laf-carencro-north.js";
import { NP_MONROE_WEST_MONROE } from "./np-data-monroe-west-monroe.js";
// The world ways (GOLDEN-B): the Bay Bridge from Downtown across to Bay World.
import { sgWaysFor } from "./sg-ways.js";
// ...and BAYMAP's ways from the Oakland districts to their Bay World counterparts.
import { bmWaysFor } from "./bm-ways.js";
import { npGeoToXz, npToGeo } from "./np-geo.js";

/** Every parish, in the selector's order. */
export const NP_PARISHES = [
  NP_ORLEANS, NP_JEFFERSON, NP_ST_BERNARD, NP_PLAQUEMINES, NP_ST_TAMMANY,
  NP_SF_DOWNTOWN, NP_SF_MISSION, NP_SF_GOLDEN_GATE_PARK, NP_SF_MARINA, NP_SF_BAYVIEW, NP_SF_OUTER_MISSION,
  NP_SF_NORTH_BEACH, NP_SF_HAIGHT_CASTRO, NP_SF_SUNSET_SOUTH,
  NP_OAK_WEST_OAKLAND, NP_OAK_DOWNTOWN_LAKE, NP_OAK_FRUITVALE_ESTUARY, NP_OAK_EMERYVILLE_BERKELEY,
  NP_BAY_SAN_PABLO, NP_BAY_SAN_JOSE,
  NP_BP_STRIP_MARSH_EAST, NP_BP_SAN_LEANDRO_BAY, NP_BP_SAN_MATEO_SHORELINE, NP_BP_NUTRIENT_PILOT,
  NP_LA_STARBASE_VERMILION, NP_LA_BLACK_BAYOU_CAMERON, NP_LA_SARONIC_FRANKLIN, NP_LA_AVEX_NEW_IBERIA,
  NP_LAF_DOWNTOWN, NP_LAF_CARENCRO_NORTH, NP_MONROE_WEST_MONROE,
  NP_SM_UNSPOKEN_SMILES,
  NP_LA_META_RICHLAND, NP_LA_DELTA_FORGE_RAPIDES, NP_LA_SHINTECH_PLAQUEMINE,
  NP_LC_LAKEFRONT_DOWNTOWN, NP_LC_CALCASIEU_CHANNEL, NP_LC_PORT_OF_VINTON,
  NP_NOLA_FRENCH_QUARTER_CBD, NP_NOLA_UPTOWN_GARDEN, NP_NOLA_MID_CITY_GENTILLY, NP_NOLA_BYWATER_LOWER_NINTH,
];

/** The regions, in the selector's order: id, name, the page title, and what one map is called. */
export const NP_REGIONS = [
  { id: "new-orleans", name: "New Orleans", title: "New Orleans Parishes", noun: "parish", nouns: "parishes" },
  { id: "san-francisco", name: "San Francisco", title: "San Francisco Districts", noun: "district", nouns: "districts" },
  { id: "oakland", name: "Oakland & the East Bay", title: "Oakland & East Bay Districts", noun: "district", nouns: "districts" },
  { id: "north-east-bay", name: "North East Bay", title: "North East Bay Districts", noun: "district", nouns: "districts" },
  { id: "south-bay", name: "South Bay", title: "South Bay Districts", noun: "district", nouns: "districts" },
  { id: "bay-program", name: "Bay Program Project Areas", title: "Bay Program Project Areas", noun: "site area", nouns: "site areas" },
  { id: "louisiana-sites", name: "Louisiana Development Sites", title: "Louisiana Development Sites", noun: "site area", nouns: "site areas" },
  { id: "louisiana-cities", name: "Louisiana Growth Cities", title: "Louisiana Growth City Districts", noun: "district", nouns: "districts" },
  { id: "new-orleans-districts", name: "New Orleans Neighbourhoods", title: "New Orleans Neighbourhood Districts", noun: "district", nouns: "districts" },
  { id: "programmes", name: "Programme Worlds", title: "Programme Worlds (procedural)", noun: "world", nouns: "worlds" },
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

// Parent and child maps (console NOLA-DISTRICTS, docs/parishes.md "Districts inside a parish"): a map may declare
// `parent: "<map id>"` — a near-true-scale "zoom in" on part of a coarser map. The overlap rule: a child's field lies
// inside its parent's and overlaps only its parent (plus whatever the parent's own field already shares with its
// neighbours, inherited); it never overlaps a sibling or any other child. Children are one level deep.

/** The parent map of a child map, or null (a map without `parent` is a top-level map). */
export function npParentOf(parish, parishes = NP_PARISHES) { return parish?.parent ? parishes.find((p) => p.id === parish.parent) ?? null : null; }

/** The child maps that declare `id` as their parent, in registry order. */
export function npChildrenOf(id, parishes = NP_PARISHES) { return parishes.filter((p) => p.parent === id); }

/** Whether two maps' fields may overlap under the parent/child rule (the lon/lat boxes are the caller's to test). */
export function npMayOverlap(a, b) {
  if (!a || !b || a.id === b.id) return true;
  if (a.parent === b.id || b.parent === a.id) return true; // a child and its own parent
  if (a.parent || b.parent) return false; // never a sibling, another child or a stranger (inherited overlaps are the checker's)
  return true; // two top-level maps keep their own rules (the parishes' boxes already overlap at parish scale)
}

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
