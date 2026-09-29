// The parishes ↔ the world: an approximate affine fit between one parish
// map's scene metres (a NP_<PARISH> module's x/z field, docs/consoles/PARISH.md)
// and public longitude/latitude, so a satellite ground or an atlas can be
// placed under the parish data, and so two parishes' connectors can be
// checked against each other in one frame (tools/check_parishes.mjs).
//
// Pure: no three.js, no DOM, no network. Everything is derived from the
// parish's `anchors` by least squares (the same maths as shared/bay-geo.js,
// kept self-contained so a parish module never pulls Bay World data). The
// anchors are approximate by design (three decimals, `approximate: true`)
// and assert nothing but "this part of the map is inspired by the public
// place at about these coordinates"; a parish is drawn at its own stylised
// scale, not as a survey.
//
// Every top-level name is prefixed np/NP_ (the bundler concatenates all
// modules into one scope).

/** Metres per degree of latitude, and of longitude at a latitude (a sphere). */
export const NP_M_PER_DEG_LAT = 111320;
export function npMetresPerDegLon(lat) { return NP_M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180); }

/** Solve the 3×3 system m·v = rhs by Gaussian elimination with partial pivoting; null when singular. */
function npSolve3(m, rhs) {
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

/** Least-squares `target ≈ p·x + q·z + r` over the anchors' map positions. */
function npFitAxis(anchors, target) {
  const n = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], rhs = [0, 0, 0];
  for (const a of anchors) {
    const row = [a.xz[0], a.xz[1], 1], y = target(a);
    for (let i = 0; i < 3; i++) {
      rhs[i] += row[i] * y;
      for (let j = 0; j < 3; j++) n[i][j] += row[i] * row[j];
    }
  }
  return npSolve3(n, rhs);
}

const npFitCache = new WeakMap();

/**
 * The affine fit for one parish: `lon = a·x + b·z + c`, `lat = d·x + e·z + f`
 * and its exact 2×2 inverse, cached per parish object. Throws when the
 * parish has fewer than three anchors or they are collinear.
 */
export function npGeoFit(parish) {
  const hit = npFitCache.get(parish);
  if (hit) return hit;
  const anchors = parish?.anchors;
  if (!Array.isArray(anchors) || anchors.length < 3) throw new Error(`npGeoFit: ${parish?.id ?? "parish"} needs at least three anchors`);
  const lon = npFitAxis(anchors, (a) => a.lonlat[0]);
  const lat = npFitAxis(anchors, (a) => a.lonlat[1]);
  if (!lon || !lat) throw new Error(`npGeoFit: ${parish.id}'s anchors are collinear`);
  const [a, b] = lon, [d, e] = lat;
  const det = a * e - b * d;
  if (Math.abs(det) < 1e-18) throw new Error(`npGeoFit: ${parish.id}'s fit is degenerate`);
  const fit = { lon, lat, inverse: { xx: e / det, xz: -b / det, zx: -d / det, zz: a / det } };
  npFitCache.set(parish, fit);
  return fit;
}

/** Parish `[x, z]` (scene metres) → `[lon, lat]` (degrees). */
export function npToGeo(parish, [x, z]) {
  const { lon, lat } = npGeoFit(parish);
  return [lon[0] * x + lon[1] * z + lon[2], lat[0] * x + lat[1] * z + lat[2]];
}

/** `[lon, lat]` → parish `[x, z]`; the exact inverse of npToGeo, unclamped. */
export function npGeoToXz(parish, [lon, lat]) {
  const f = npGeoFit(parish);
  const u = lon - f.lon[2], v = lat - f.lat[2];
  return [f.inverse.xx * u + f.inverse.xz * v, f.inverse.zx * u + f.inverse.zz * v];
}

/** The parish's field in scene metres: `{ minX, maxX, minZ, maxZ }` from its `size`. */
export function npFieldBounds(parish) {
  const h = (parish?.size ?? 4096) / 2;
  return { minX: -h, maxX: h, minZ: -h, maxZ: h };
}

/** The lon/lat box containing the whole field: `{ minLon, minLat, maxLon, maxLat }`. */
export function npBounds(parish) {
  const b = npFieldBounds(parish);
  const corners = [[b.minX, b.minZ], [b.maxX, b.minZ], [b.minX, b.maxZ], [b.maxX, b.maxZ]].map((c) => npToGeo(parish, c));
  return {
    minLon: Math.min(...corners.map((c) => c[0])), maxLon: Math.max(...corners.map((c) => c[0])),
    minLat: Math.min(...corners.map((c) => c[1])), maxLat: Math.max(...corners.map((c) => c[1])),
  };
}

/** Whether `[lon, lat]` lies inside npBounds(parish) (inclusive). */
export function npGeoContains(parish, [lon, lat]) {
  const b = npBounds(parish);
  return lon >= b.minLon && lon <= b.maxLon && lat >= b.minLat && lat <= b.maxLat;
}

/** Whether a scene `[x, z]` lies inside the parish's field (inclusive). */
export function npInField(parish, [x, z]) {
  const b = npFieldBounds(parish);
  return x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ;
}

/** Great-circle distance in metres between two `[lon, lat]` points (haversine). */
export function npGeoDistance([lon1, lat1], [lon2, lat2]) {
  const R = 6371008.8, r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r, dLon = (lon2 - lon1) * r;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** How many real metres one scene metre covers along x and z at the field's centre (the parish's stylisation). */
export function npScale(parish) {
  const c = npToGeo(parish, [0, 0]), ex = npToGeo(parish, [100, 0]), ez = npToGeo(parish, [0, 100]);
  return { x: npGeoDistance(c, ex) / 100, z: npGeoDistance(c, ez) / 100 };
}

/**
 * How far each anchor's own coordinates land from its map position once
 * pushed back through the fit, in scene metres: `{ max, mean, perAnchor }`.
 * A diagnostic — anchors are approximate by design.
 */
export function npGeoResidual(parish) {
  const perAnchor = parish.anchors.map((a) => {
    const [x, z] = npGeoToXz(parish, a.lonlat);
    return { name: a.name, metres: Math.hypot(x - a.xz[0], z - a.xz[1]) };
  });
  const max = Math.max(...perAnchor.map((p) => p.metres));
  const mean = perAnchor.reduce((s, p) => s + p.metres, 0) / (perAnchor.length || 1);
  return { max, mean, perAnchor };
}

// ------------------------------------------------------------------ satellite

/** The Mapbox Static Images base for a satellite view (shared/mapbox.js names the same endpoint). */
export const NP_STATIC_BASE = "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static";

function npMercatorY(lat) { const r = (lat * Math.PI) / 180; return Math.log(Math.tan(Math.PI / 4 + r / 2)); }

/** The static image's pixel size for the parish's box: the long side at most 1280, the short side in the box's own Mercator aspect. */
export function npSatelliteSize(parish, longSide = 1280) {
  const b = npBounds(parish);
  const dx = ((b.maxLon - b.minLon) * Math.PI) / 180;
  const dy = npMercatorY(b.maxLat) - npMercatorY(b.minLat);
  const aspect = dx / (dy || 1e-9);
  const side = Math.max(1, Math.min(1280, Math.round(longSide)));
  return aspect >= 1 ? { width: side, height: Math.max(1, Math.round(side / aspect)) } : { width: Math.max(1, Math.round(side * aspect)), height: side };
}

/**
 * The Static Images URL for a satellite view of npBounds(parish). Pure — it
 * builds a string and requests nothing; without a token there is no URL
 * (null), so no request can exist without a viewer's token (docs/mapbox.md).
 */
export function npSatelliteUrl(parish, token, opts = {}) {
  const clean = typeof token === "string" ? token.trim() : "";
  if (!/^pk\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(clean)) return null;
  const b = npBounds(parish);
  const { width, height } = npSatelliteSize(parish, opts.longSide);
  const box = [b.minLon, b.minLat, b.maxLon, b.maxLat].map((v) => v.toFixed(6)).join(",");
  return `${NP_STATIC_BASE}/[${box}]/${width}x${height}${opts.retina ? "@2x" : ""}?access_token=${encodeURIComponent(clean)}`;
}

/**
 * The 3×3 uv transform (row-major, for a three.js Matrix3's set()) that maps
 * the parish ground plane's uv square onto the static image of npBounds():
 * a PlaneGeometry `size` by `size` centred at the origin and rotated flat,
 * u running +x and v running −z. Pure.
 */
export function npGroundUvMatrix(parish) {
  const fit = npGeoFit(parish), b = npBounds(parish), size = parish?.size ?? 4096;
  const dLon = b.maxLon - b.minLon || 1, dLat = b.maxLat - b.minLat || 1;
  const [a, bb, c] = fit.lon, [dd, e, f] = fit.lat;
  const x0 = -size / 2, z0 = size / 2;
  const s0 = (a * x0 + bb * z0 + c - b.minLon) / dLon, su = (a * size) / dLon, sv = (-bb * size) / dLon;
  const t0 = (dd * x0 + e * z0 + f - b.minLat) / dLat, tu = (dd * size) / dLat, tv = (-e * size) / dLat;
  return [su, sv, s0, tu, tv, t0, 0, 0, 1];
}
