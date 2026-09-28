// The Deep — the minimap and full map's geometry and roster, kept apart from
// the canvas drawing (app.js) so the transform and the "every site, once"
// rule are checkable with no DOM. Mirrors bayworld/js/map.js over DEEP_BOUNDS.
import { DEEP_BOUNDS, DV_LINES, DV_ZONES, DV_LANDMARKS, DV_SITES } from "./seabed.js";
import { dvIsSiteVisited, dvIsAscentUnlocked } from "./dive-career.js";
import { k2MapFieldLessons } from "../../shared/field-lessons.js";

/** The K-12 layer: every Deep field lesson, positioned (shared/field-lessons.js). */
export function dvMapFieldLessons(size = 512) { return k2MapFieldLessons("deep", dvWorldToMap, size); }

/** The one uniform scale that fits all of DEEP_BOUNDS inside a `size`-pixel
 *  square canvas with `pad` pixels of margin (letterboxing, never stretching). */
export function dvMapScale(size = 512, pad = 18) {
  const w = DEEP_BOUNDS.maxX - DEEP_BOUNDS.minX, h = DEEP_BOUNDS.maxZ - DEEP_BOUNDS.minZ;
  return (size - pad * 2) / Math.max(w, h);
}

/** World (x, z) to a `size`-pixel square canvas, y-down, the field centred. */
export function dvWorldToMap(x, z, size = 512, pad = 18) {
  const w = DEEP_BOUNDS.maxX - DEEP_BOUNDS.minX, h = DEEP_BOUNDS.maxZ - DEEP_BOUNDS.minZ;
  const scale = dvMapScale(size, pad);
  const offX = (size - w * scale) / 2, offY = (size - h * scale) / 2;
  return { x: offX + (x - DEEP_BOUNDS.minX) * scale, y: offY + (z - DEEP_BOUNDS.minZ) * scale };
}

/** Every dive line as a map-space point list, ready to stroke. */
export function dvMapLines(size = 512) {
  return DV_LINES.map((line) => ({ id: line.id, kind: line.kind, points: line.points.map(([x, z]) => dvWorldToMap(x, z, size)) }));
}

/** Every zone with its map-space centre and radius. */
export function dvMapZones(size = 512) {
  const scale = dvMapScale(size);
  return DV_ZONES.map((z) => ({ id: z.id, name: z.name, color: z.color, ...dvWorldToMap(z.center[0], z.center[1], size), radius: z.radius * scale }));
}

/** Every landmark, positioned. */
export function dvMapLandmarks(size = 512) {
  return DV_LANDMARKS.map((l) => ({ id: l.id, name: l.name, ...dvWorldToMap(l.position[0], l.position[2], size) }));
}

/** Every site, positioned, with its visited/ascent-line state — the roster
 *  the full map lists and the checker's "every site, once" rule reads. */
export function dvMapSites(size = 512, storage) {
  return DV_SITES.map((s) => ({
    id: s.id, name: s.name, zone: s.zone,
    ...dvWorldToMap(s.position[0], s.position[2], size),
    visited: dvIsSiteVisited(s.id, storage),
    ascent: dvIsAscentUnlocked(s.id, storage),
  }));
}
