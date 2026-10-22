// Bay World ↔ the world: an approximate affine fit between Bay World's scene
// metres (shared/bayworld-data.js's x/z field) and public longitude/latitude,
// so a real-world map can be drawn under the Bay World data — the Bay Atlas
// (WebXR/bayworld/atlas.html) and shared/mapbox.js both read this.
//
// Pure: no three.js, no DOM, no network. Everything here is derived from the
// eleven anchors below by least squares, so a headless checker
// (tools/check_mapbox.mjs) can prove the round trip and the bounds with no
// browser.
//
// The anchors pair a Bay World position with the *approximate* longitude and
// latitude of the kind of public place that part of the world is inspired
// by — a lakeside promenade, a downtown centre, a container port, a stadium
// district, a hills lookout, a bridge approach, and at the expanded field's
// edges an island harbour, a north shoreline and an upper ridge. Each is
// rounded to three decimals (about a hundred metres), marked `approximate:
// true`, and asserts nothing else: no name, no address, no date, no
// ownership. Bay World is a stylised 2400 m × 1600 m field (BAY_BOUNDS,
// whatever it is today), not a survey, and the fit that follows is
// what makes the two line up "well enough for a map" rather than exactly —
// bayGeoResidual() says how far off the anchors themselves land.
import { BAY_BOUNDS } from "./bayworld-data.js";

/**
 * `{ id, label, bay:[x, z], lonLat:[lon, lat], approximate: true }` — the
 * Bay World position of a landmark or a zone centre in bayworld-data.js,
 * and the approximate public coordinates of the kind of place it is
 * inspired by. Order does not matter; the fit weights every anchor equally.
 */
export const BAY_GEO_ANCHORS = [
  { id: "lakeside-promenade", label: "a lakeside promenade", bay: [275, -47], lonLat: [-122.257, 37.803], approximate: true },
  { id: "downtown-centre", label: "a downtown centre", bay: [0, 0], lonLat: [-122.272, 37.804], approximate: true },
  { id: "uptown-strip", label: "an uptown theatre strip", bay: [-40, -230], lonLat: [-122.270, 37.809], approximate: true },
  { id: "container-port", label: "a container port", bay: [-380, 350], lonLat: [-122.325, 37.797], approximate: true },
  { id: "stadium-district", label: "a stadium district", bay: [600, 370], lonLat: [-122.201, 37.752], approximate: true },
  { id: "market-district", label: "a market district", bay: [450, 260], lonLat: [-122.224, 37.775], approximate: true },
  { id: "hills-lookout", label: "a hills lookout", bay: [650, -250], lonLat: [-122.183, 37.817], approximate: true },
  { id: "bridge-approach", label: "a bridge approach", bay: [-630, -160], lonLat: [-122.312, 37.826], approximate: true },
  // The expansion's outer zones, so the fit is pinned at the field's edges
  // rather than extrapolated to them.
  { id: "island-harbour", label: "an island harbour with a ferry landing", bay: [150, 620], lonLat: [-122.257, 37.766], approximate: true },
  { id: "north-shoreline", label: "a north shoreline with a pier", bay: [-760, -620], lonLat: [-122.315, 37.862], approximate: true },
  { id: "upper-ridge", label: "an upper ridge trail summit", bay: [950, -550], lonLat: [-122.150, 37.835], approximate: true },
];

// ------------------------------------------------------------- least squares

/** Solve the 3×3 system m·v = rhs by Gaussian elimination with partial
 *  pivoting. Returns null when the system is singular. */
function bgSolve3(m, rhs) {
  const a = m.map((row, i) => [...row, rhs[i]]);
  for (let col = 0; col < 3; col++) {
    let pivot = col;
    for (let r = col + 1; r < 3; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    if (Math.abs(a[pivot][col]) < 1e-12) return null;
    if (pivot !== col) [a[col], a[pivot]] = [a[pivot], a[col]];
    for (let r = 0; r < 3; r++) {
      if (r === col) continue;
      const f = a[r][col] / a[col][col];
      for (let c = col; c < 4; c++) a[r][c] -= f * a[col][c];
    }
  }
  return [a[0][3] / a[0][0], a[1][3] / a[1][1], a[2][3] / a[2][2]];
}

/** Least-squares `target ≈ p·x + q·z + r` over the anchors' bay positions:
 *  the normal equations of the design matrix [x, z, 1]. */
function bgFitAxis(anchors, target) {
  const n = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], rhs = [0, 0, 0];
  for (const a of anchors) {
    const row = [a.bay[0], a.bay[1], 1], y = target(a);
    for (let i = 0; i < 3; i++) {
      rhs[i] += row[i] * y;
      for (let j = 0; j < 3; j++) n[i][j] += row[i] * row[j];
    }
  }
  return bgSolve3(n, rhs);
}

/**
 * The affine fit over `anchors`: `lon = a·x + b·z + c`, `lat = d·x + e·z + f`
 * and its exact inverse. Returns `{ lon:[a,b,c], lat:[d,e,f], inverse:
 * { xx, xz, zx, zz } }` — the inverse is the 2×2 matrix inverse of
 * [[a,b],[d,e]], so geoToBay(bayToGeo(p)) is p to floating-point precision
 * rather than a second, slightly different fit. Throws when fewer than three
 * anchors are given or they are collinear (no affine fit exists).
 */
export function bayGeoFit(anchors = BAY_GEO_ANCHORS) {
  if (!Array.isArray(anchors) || anchors.length < 3) throw new Error("bayGeoFit needs at least three anchors");
  const lon = bgFitAxis(anchors, (a) => a.lonLat[0]);
  const lat = bgFitAxis(anchors, (a) => a.lonLat[1]);
  if (!lon || !lat) throw new Error("bayGeoFit: the anchors are collinear");
  const [a, b] = lon, [d, e] = lat;
  const det = a * e - b * d;
  if (Math.abs(det) < 1e-18) throw new Error("bayGeoFit: the fit is degenerate");
  return { lon, lat, inverse: { xx: e / det, xz: -b / det, zx: -d / det, zz: a / det } };
}

let bgFitCache = null;
function bgFit() { return (bgFitCache ??= bayGeoFit()); }

// ------------------------------------------------------------------ mapping

/** Bay World `[x, z]` (scene metres) → `[lon, lat]` (degrees). */
export function bayToGeo([x, z]) {
  const { lon, lat } = bgFit();
  return [lon[0] * x + lon[1] * z + lon[2], lat[0] * x + lat[1] * z + lat[2]];
}

/** `[lon, lat]` (degrees) → Bay World `[x, z]` (scene metres); the exact
 *  inverse of bayToGeo(). A point outside the world maps outside BAY_BOUNDS
 *  — nothing is clamped, so a caller can tell "off the map" from "at the
 *  edge". */
export function geoToBay([lon, lat]) {
  const f = bgFit();
  const u = lon - f.lon[2], v = lat - f.lat[2];
  return [f.inverse.xx * u + f.inverse.xz * v, f.inverse.zx * u + f.inverse.zz * v];
}

/**
 * The lon/lat box that contains the whole of BAY_BOUNDS: the four corners of
 * the field through bayToGeo(), then min/max — so a fit with any rotation in
 * it still yields a box the world fits inside (the box is then a little
 * larger than the world, which is what a static map image wants). Returns
 * `{ minLon, minLat, maxLon, maxLat }`.
 */
export function bayGeoBounds() {
  const corners = [
    [BAY_BOUNDS.minX, BAY_BOUNDS.minZ], [BAY_BOUNDS.maxX, BAY_BOUNDS.minZ],
    [BAY_BOUNDS.minX, BAY_BOUNDS.maxZ], [BAY_BOUNDS.maxX, BAY_BOUNDS.maxZ],
  ].map(bayToGeo);
  return {
    minLon: Math.min(...corners.map((c) => c[0])), maxLon: Math.max(...corners.map((c) => c[0])),
    minLat: Math.min(...corners.map((c) => c[1])), maxLat: Math.max(...corners.map((c) => c[1])),
  };
}

/** Whether `[lon, lat]` lies inside bayGeoBounds() (inclusive). */
export function bayGeoContains([lon, lat]) {
  const b = bayGeoBounds();
  return lon >= b.minLon && lon <= b.maxLon && lat >= b.minLat && lat <= b.maxLat;
}

/**
 * How far each anchor's own public coordinates land from its Bay World
 * position once pushed back through the fit, in scene metres: `{ max, mean,
 * perAnchor:[{ id, metres }] }`. A diagnostic, not a promise — the anchors
 * are approximate by design and Bay World is not to scale, so a residual of
 * some tens of metres is the fit doing its job, not failing it.
 */
export function bayGeoResidual(anchors = BAY_GEO_ANCHORS) {
  const perAnchor = anchors.map((a) => {
    const [x, z] = geoToBay(a.lonLat);
    return { id: a.id, metres: Math.hypot(x - a.bay[0], z - a.bay[1]) };
  });
  const max = Math.max(...perAnchor.map((p) => p.metres));
  const mean = perAnchor.reduce((s, p) => s + p.metres, 0) / (perAnchor.length || 1);
  return { max, mean, perAnchor };
}
