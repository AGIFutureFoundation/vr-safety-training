// The city, adapted from the real thing.
//
// Team BAY1's shared/bayworld-data.js (pure layout data) and
// shared/bayworld.js (the three.js builder over it) have landed. This module
// imports only the pure data — a plain Node import, so sim.js, career.js,
// quest-engine.js and map.js can all import from here with nothing pulling
// in three.js — and adapts its shapes to what the rest of this app already
// reads: a zone's `centre` becomes `center` (plus a plain `color`, the
// zone's own palette accent, for this app's map and building tint); a
// site's or a landmark's 2-vector `position:[x,z]` becomes this platform's
// usual 3-vector `[x,0,z]`; bayRoadAt()'s `null`-off-road / `{onRoad}`-on-road
// pair becomes this app's own `{ lane: "off" | "road" }`.
//
// The adapted zone/site/landmark lists are named BW_ZONES/BW_SITES/
// BW_LANDMARKS and the wrapped road/zone lookups bwZoneAt()/bwRoadAt() —
// never the shared module's own BAY_ZONES/BAY_SITES/BAY_LANDMARKS/
// bayZoneAt/bayRoadAt names — because tools/bundle_webxr.py concatenates
// every module into one flat script with no real import/export machinery:
// a second top-level `const BAY_ZONES = ...` here would redeclare the one
// shared/bayworld-data.js's own chunk already defines and the bundle would
// throw on load. BAY_BOUNDS, BAY_ROADS, BAY_MESH_BUDGET, BAY_HEIGHT_RANGE
// and bayHeight need no adapter (their shape already matches what this app
// reads), so they are re-exported unchanged.
//
// world.js imports buildBayWorld/bayLighting straight from
// ../../shared/bayworld.js (the three.js builder), the same way fairway/js/
// world.js imports buildFairwayPark straight from shared/fairway.js rather
// than through this file — a module that touches three.js never belongs on
// the pure side. bwBuildings()/bwJunctions() below are this app's own port
// of the pre-integration stub's building-scatter and road-crossing logic
// onto BAY1's real zones/roads/sites (bwSeededRng is bayworld-data.js's own
// deterministic PRNG); every module in this app imports them from here,
// never from js/world-stub.js, which is kept only as the pre-integration
// snapshot (the same convention fairway/js/course-stub.js follows once
// fairway/js/course.js switched to the real course).
import {
  BAY_BOUNDS, BAY_ZONES, BAY_LANDMARKS, BAY_ROADS, BAY_SITES,
  bayHeight, bayZoneAt, bayRoadAt, bwSeededRng,
} from "../../shared/bayworld-data.js";

export { BAY_BOUNDS, BAY_ROADS, bayHeight };

function bwTo3(position) { return [position[0], 0, position[1]]; }

/** BAY1's zones, adapted: `centre` -> `center`, plus a `color` (the zone's
 *  own palette accent). */
export const BW_ZONES = BAY_ZONES.map((z) => ({ ...z, center: z.centre, color: z.palette.accent }));
/** BAY1's sites, adapted to this platform's usual 3-vector position. */
export const BW_SITES = BAY_SITES.map((s) => ({ ...s, position: bwTo3(s.position) }));
/** BAY1's landmarks, adapted the same way. */
export const BW_LANDMARKS = BAY_LANDMARKS.map((l) => ({ ...l, position: bwTo3(l.position) }));

/** The zone id (not the zone object BAY1's own bayZoneAt() returns) nearest
 *  (x, z) — every module in this app reads a zone by its id. */
export function bwZoneAt(x, z) { return bayZoneAt(x, z).id; }

/** `{ lane: "road", heading, laneCount }` on a BAY_ROADS polyline (BAY1's own
 *  bayRoadAt() found one within its half-width), else `{ lane: "off" }`. */
export function bwRoadAt(x, z) {
  const hit = bayRoadAt(x, z);
  return hit ? { lane: "road", heading: hit.heading, laneCount: hit.lane } : { lane: "off" };
}

// -------------------------------------------------------------- buildings

const BW_BUILDING_CLEARANCE = 16; // metres kept clear around a site or landmark

/**
 * The city's building footprints — pure, deterministic and three.js-free
 * (BAY1's own buildBayWorld() draws the real geometry; this is only for this
 * app's own vehicle collision), ported from the pre-integration stub onto
 * BAY1's real BW_ZONES/BAY_ROADS/BW_SITES/BW_LANDMARKS.
 */
export function bwBuildings(detail = "high", zone = null) {
  const out = [];
  for (const z of BW_ZONES) {
    const zoneDetail = zone ? (z.id === zone ? "high" : "low") : detail;
    const count = zoneDetail === "high" ? 14 : 5;
    const rng = bwSeededRng(Math.round(z.center[0] * 733 + z.center[1] * 17 + count) >>> 0);
    let placed = 0, tries = 0;
    while (placed < count && tries < count * 10) {
      tries += 1;
      const ang = rng() * Math.PI * 2, r = 30 + rng() * Math.max(10, z.radius - 45);
      const x = z.center[0] + Math.cos(ang) * r, zz = z.center[1] + Math.sin(ang) * r;
      if (x < BAY_BOUNDS.minX + 10 || x > BAY_BOUNDS.maxX - 10 || zz < BAY_BOUNDS.minZ + 10 || zz > BAY_BOUNDS.maxZ - 10) continue;
      if (bwRoadAt(x, zz).lane !== "off") continue;
      let clear = true;
      for (const s of BW_SITES) if (Math.hypot(x - s.position[0], zz - s.position[2]) < BW_BUILDING_CLEARANCE) { clear = false; break; }
      if (clear) for (const l of BW_LANDMARKS) if (Math.hypot(x - l.position[0], zz - l.position[2]) < BW_BUILDING_CLEARANCE) { clear = false; break; }
      if (!clear) continue;
      const w = 6 + rng() * 12, d = 6 + rng() * 12, h = 6 + rng() * (zoneDetail === "high" ? 34 : 14);
      const shade = 0.55 + rng() * 0.35;
      out.push({ x, z: zz, w, d, h, zone: z.id, shade });
      placed += 1;
    }
  }
  return out;
}

// -------------------------------------------------------------- junctions

/** Where two segments (each an [x, z] pair of endpoints) cross or touch, else
 *  null — the standard two-line parametric solve, not a shared-endpoint
 *  lookup, so a spur's own end meeting the middle of a through road (a
 *  T-junction) and two roads crossing in open ground (an X) both count. */
function bwSegmentCross(a1, a2, b1, b2) {
  const [x1, y1] = a1, [x2, y2] = a2, [x3, y3] = b1, [x4, y4] = b2;
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(d) < 1e-9) return null; // parallel (or collinear — no single crossing point)
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
  const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / d;
  const eps = 1e-6;
  if (t < -eps || t > 1 + eps || u < -eps || u > 1 + eps) return null;
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}

/** Every point where two different BAY_ROADS polylines cross or touch —
 *  where ambient traffic and a player's own route both have to give way.
 *  Used by sim.js's traffic AI and by the map to draw a junction marker. */
export function bwJunctions() {
  const at = new Map();
  const key = (p) => `${Math.round(p[0] * 4)},${Math.round(p[1] * 4)}`;
  for (let i = 0; i < BAY_ROADS.length; i++) {
    for (let j = i + 1; j < BAY_ROADS.length; j++) {
      const ra = BAY_ROADS[i], rb = BAY_ROADS[j];
      for (let ai = 0; ai < ra.points.length - 1; ai++) {
        for (let bi = 0; bi < rb.points.length - 1; bi++) {
          const p = bwSegmentCross(ra.points[ai], ra.points[ai + 1], rb.points[bi], rb.points[bi + 1]);
          if (!p) continue;
          const k = key(p);
          if (!at.has(k)) at.set(k, { point: p, roads: new Set() });
          at.get(k).roads.add(ra.id).add(rb.id);
        }
      }
    }
  }
  return [...at.values()].map((v) => ({ point: v.point, roads: [...v.roads] }));
}
