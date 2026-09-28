// The parish registry (console PARISH, docs/consoles/PARISH.md): every
// parish map on the shared schema, in selector order. DELTA adds one import
// and one array entry per parish; tools/check_parishes.mjs also globs
// shared/np-data-*.js so a module missing from this list is a failure.
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
// San Francisco (GOLDEN-B): Marina & Presidio, Bayview & Hunters Point, and the world ways (the Bay Bridge to Bay World).
import { NP_SF_MARINA } from "./np-data-sf-marina.js";
import { NP_SF_BAYVIEW } from "./np-data-sf-bayview.js";
import { sgWaysFor } from "./sg-ways.js";
import { npGeoToXz, npToGeo } from "./np-geo.js";

/** Every parish, in the selector's order. */
export const NP_PARISHES = [NP_ORLEANS, NP_JEFFERSON, NP_ST_BERNARD, NP_PLAQUEMINES, NP_ST_TAMMANY, NP_SF_MARINA, NP_SF_BAYVIEW];

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
  return [...(parish.connectors ?? []), ...sgWaysFor(parish.id)].map((c) => {
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
