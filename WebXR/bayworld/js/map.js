// Bay World — the minimap and full map's own geometry and roster, kept
// separate from the canvas drawing (world.js/app.js) so the coordinate
// transform and "every site, once" rule are checkable with no DOM.
import { BAY_BOUNDS, BAY_ZONES, BAY_LANDMARKS, BAY_ROADS, BAY_SITES } from "./city.js";
import { bwIsSiteVisited, bwIsFastTravelUnlocked } from "./career.js";

/** World (x, z) to a `size`-pixel square canvas, y-down, with `pad` pixels of
 *  margin so nothing sits on the rim. */
export function bwWorldToMap(x, z, size = 512, pad = 18) {
  const w = BAY_BOUNDS.maxX - BAY_BOUNDS.minX, h = BAY_BOUNDS.maxZ - BAY_BOUNDS.minZ;
  const usable = size - pad * 2;
  return {
    x: pad + ((x - BAY_BOUNDS.minX) / w) * usable,
    y: pad + ((z - BAY_BOUNDS.minZ) / h) * usable,
  };
}

/** Every road as an array of map-space point lists, ready to stroke. */
export function bwMapRoads(size = 512) {
  return BAY_ROADS.map((road) => {
    const pts = (road.loop ? [...road.points, road.points[0]] : road.points).map(([x, z]) => bwWorldToMap(x, z, size));
    return { id: road.id, traffic: !!road.traffic, points: pts };
  });
}

/** Every zone with its map-space centre and radius (radius scaled by the
 *  same factor the world-to-map transform uses in x). */
export function bwMapZones(size = 512) {
  const scale = (size - 36) / (BAY_BOUNDS.maxX - BAY_BOUNDS.minX);
  return BAY_ZONES.map((z) => ({ id: z.id, name: z.name, color: z.color, ...bwWorldToMap(z.center[0], z.center[1], size), radius: z.radius * scale }));
}

/** Every landmark, positioned. */
export function bwMapLandmarks(size = 512) {
  return BAY_LANDMARKS.map((l) => ({ id: l.id, name: l.name, ...bwWorldToMap(l.position[0], l.position[2], size) }));
}

/**
 * Every site, positioned, with its own visited/fast-travel state — the list
 * the full map's job board and tools/check_bayworld_game.mjs's "the map
 * lists every site" rule both read. `storage` is career.js's own injectable
 * handle.
 */
export function bwMapSites(size = 512, storage) {
  return BAY_SITES.map((s) => ({
    id: s.id, name: s.name, zone: s.zone,
    ...bwWorldToMap(s.position[0], s.position[2], size),
    visited: bwIsSiteVisited(s.id, storage),
    fastTravel: bwIsFastTravelUnlocked(s.id, storage),
  }));
}
