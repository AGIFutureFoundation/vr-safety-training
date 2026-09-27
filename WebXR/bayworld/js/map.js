// Bay World — the minimap and full map's own geometry and roster, kept
// separate from the canvas drawing (world.js/app.js) so the coordinate
// transform and "every site, once" rule are checkable with no DOM.
import { BAY_BOUNDS, BAY_ROADS, BW_ZONES, BW_LANDMARKS, BW_SITES } from "./city.js";
import { bwIsSiteVisited, bwIsFastTravelUnlocked } from "./career.js";

/** Metres per pixel's inverse — the one uniform scale that fits the whole of
 *  BAY_BOUNDS (whatever its size and aspect) inside a `size`-pixel square
 *  canvas with `pad` pixels of margin. Uniform, so a 2400 × 1600 m field
 *  letterboxes rather than stretches; everything else here reads it. */
export function bwMapScale(size = 512, pad = 18) {
  const w = BAY_BOUNDS.maxX - BAY_BOUNDS.minX, h = BAY_BOUNDS.maxZ - BAY_BOUNDS.minZ;
  return (size - pad * 2) / Math.max(w, h);
}

/** World (x, z) to a `size`-pixel square canvas, y-down, with `pad` pixels of
 *  margin so nothing sits on the rim, the field centred in the canvas. */
export function bwWorldToMap(x, z, size = 512, pad = 18) {
  const w = BAY_BOUNDS.maxX - BAY_BOUNDS.minX, h = BAY_BOUNDS.maxZ - BAY_BOUNDS.minZ;
  const scale = bwMapScale(size, pad);
  const offX = (size - w * scale) / 2, offY = (size - h * scale) / 2;
  return {
    x: offX + (x - BAY_BOUNDS.minX) * scale,
    y: offY + (z - BAY_BOUNDS.minZ) * scale,
  };
}

/** Every road as an array of map-space point lists, ready to stroke. */
export function bwMapRoads(size = 512) {
  return BAY_ROADS.map((road) => {
    const pts = road.points.map(([x, z]) => bwWorldToMap(x, z, size));
    return { id: road.id, lanes: road.lanes, points: pts };
  });
}

/** Every zone with its map-space centre and radius (radius scaled by the
 *  same uniform factor the world-to-map transform uses). */
export function bwMapZones(size = 512) {
  const scale = bwMapScale(size);
  return BW_ZONES.map((z) => ({ id: z.id, name: z.name, color: z.color, ...bwWorldToMap(z.center[0], z.center[1], size), radius: z.radius * scale }));
}

/** Every landmark, positioned. */
export function bwMapLandmarks(size = 512) {
  return BW_LANDMARKS.map((l) => ({ id: l.id, name: l.name, ...bwWorldToMap(l.position[0], l.position[2], size) }));
}

/**
 * Every site, positioned, with its own visited/fast-travel state — the list
 * the full map's job board and tools/check_bayworld_game.mjs's "the map
 * lists every site" rule both read. `storage` is career.js's own injectable
 * handle.
 */
export function bwMapSites(size = 512, storage) {
  return BW_SITES.map((s) => ({
    id: s.id, name: s.name, zone: s.zone,
    ...bwWorldToMap(s.position[0], s.position[2], size),
    visited: bwIsSiteVisited(s.id, storage),
    fastTravel: bwIsFastTravelUnlocked(s.id, storage),
  }));
}
