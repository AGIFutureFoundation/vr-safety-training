// WALKABLE (docs/consoles/WALKABLE.md): the 22 parish-engine maps and the standalone worlds as one walkable world.
//
// Pure, dependency-light data and geometry (no DOM, no three.js) so tools/check_walkable.mjs runs it headlessly and
// the parishes page runs the same code:
//   wkPair(parish, conn)          -> { conn, back, to, landing:[x,z], yaw } | null   the paired connector on the far map
//   wkPairs()                     -> every paired crossing in the 22 maps
//   wkLanding(parish, pos, from)  -> a dry, off-centreline spot a few metres onward of `pos`
//   wkCarry(pair, state)          -> the same-page URL that carries the player across with their state
//   wkArrival(params, parish)     -> { landing, yaw, time, weather, drive, via } for a page opened by wkCarry, or null
//   wkEdge(parish, x, z)          -> { soft, push:[dx,dz], way } near the edge of the map: a soft boundary that names the
//                                    nearest way on instead of an invisible wall
//   wkAtlas()                     -> six regions, 22 maps joined by their connectors, the standalone worlds and their ways in
//   wkSolidBoxes(parish, placements) -> NEWTON boxes for MOTORWORKS' parked vehicles (placements from mv-world.js)
//
// Path, Crew Credits and the passport live in the learner's own storage (npSave, TYCOON's ledger, the passport), so a
// same-page navigation keeps them; time of day, weather and a vehicle being driven ride in the URL (`wk*` params).

import { NP_PARISHES, NP_REGIONS, npParish, npResolveConnectors, npRegionOf } from "./np-parishes.js";
import { NP_ROAD_KINDS, NP_PAD, npWaterAt, npPolyDist } from "./np-parish.js";

/** Walking within this many metres of a paired connector carries you across. */
export const WK_TRIGGER = 7;
/** You land this far onward of the far connector (outside its trigger, so no ping-pong). */
export const WK_ONWARD = 18;
/** The trigger re-arms once you are this far from every connector (after a landing). */
export const WK_REARM = WK_TRIGGER + 5;
/** The soft band along the edge of a map (metres). */
export const WK_EDGE = 60;
/** A round trip lands within a pad of where it started. */
export const WK_PAD = NP_PAD;
/** The fade across (ms); zero under reduced motion. */
export const WK_FADE_MS = 450;

/** The standalone worlds and their ways in (plain data; TradeQuest can read it). */
export const WK_WORLDS = [
  { id: "bayworld", name: "Bay World", href: "../bayworld/index.html", ride: "the Bay Bridge or the Oakland ways" },
  { id: "underwater", name: "the Deep", href: "../underwater/underwater.html", ride: "a dive from the Bay shore" },
  { id: "redwood", name: "Redwood Reach", href: "../redwood/redwood.html", ride: "the road north" },
  { id: "summit", name: "Sierra Summit", href: "../summit/index.html", ride: "the road east over the pass" },
  { id: "regatta", name: "Regatta", href: "../regatta/regatta.html", ride: "a boat from the waterfront" },
];

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const half = (p) => (p.size ?? 4096) / 2;

/** How far (x, z) is from the nearest road centreline, in units of that road's half width (< 1: on the carriageway). */
export function wkRoadClear(parish, x, z) {
  let best = Infinity;
  for (const r of parish.roads ?? []) {
    const w = (NP_ROAD_KINDS[r.kind]?.width ?? 10) / 2;
    if (!w) continue;
    const d = npPolyDist(x, z, r.pts);
    best = Math.min(best, d / w);
  }
  return best;
}

/** A spot is fit to land on: inside the field, dry, off the carriageway (`clear` half widths from any centreline). */
export function wkSpotOk(parish, x, z, clear = 1.15) {
  const h = half(parish) - 20;
  return Math.abs(x) <= h && Math.abs(z) <= h && !npWaterAt(parish, x, z) && wkRoadClear(parish, x, z) >= clear;
}
/** Never on a road centreline: the shoulder (0.6 half widths out) is the least a landing keeps. */
export const WK_SHOULDER = 0.6;

/** On a bridge or causeway deck, in the kerb lane (between 0.4 and 0.9 half widths off its centreline), or null. */
export function wkDeckAt(parish, x, z) {
  for (const r of parish.roads ?? []) {
    // A bridge or causeway, or any road where it runs over water (the Twin Spans, the interstate over the marsh).
    if (r.kind !== "bridge" && r.kind !== "causeway" && !npWaterAt(parish, x, z)) continue;
    const w = (NP_ROAD_KINDS[r.kind]?.width ?? 14) / 2;
    if (!w) continue;
    const d = npPolyDist(x, z, r.pts) / w;
    if (d >= 0.4 && d <= 0.9) return r;
  }
  return null;
}

/** Fit to land: a dry spot off the carriageway, or the kerb lane of a bridge or causeway deck (over water, never its centreline). */
export function wkLandOk(parish, x, z) {
  return wkSpotOk(parish, x, z) || (!!wkDeckAt(parish, x, z) && wkRoadClear(parish, x, z) >= 0.4 && Math.abs(x) <= half(parish) - 20 && Math.abs(z) <= half(parish) - 20);
}

/** A dry, off-centreline landing a little onward of `pos` (onward = away from the edge, toward the map's heart). */
export function wkLanding(parish, pos) {
  const [x0, z0] = pos;
  let ox = -x0, oz = -z0; const n = Math.hypot(ox, oz) || 1; ox /= n; oz /= n;
  const base = Math.atan2(ox, oz);
  const ring = (r0, r1, step, ok) => {
    for (let r = r0; r <= r1; r += step) {
      for (let k = 0; k < 24; k++) {
        const a = base + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 12);
        const x = x0 + Math.sin(a) * r, z = z0 + Math.cos(a) * r;
        if (ok(parish, x, z)) return { at: [Math.round(x), Math.round(z)], yaw: Math.atan2(-(x - x0), -(z - z0)), ok: true };
      }
    }
    return null;
  };
  const shoulder = (p, x, z) => wkSpotOk(p, x, z, WK_SHOULDER);
  const hit = ring(WK_ONWARD, WK_ONWARD + 14, 2, wkSpotOk) ?? ring(WK_ONWARD, WK_ONWARD + 14, 2, shoulder) ?? ring(WK_ONWARD, WK_ONWARD + 14, 2, wkLandOk) ?? ring(WK_ONWARD + 16, 400, 8, wkSpotOk) ?? ring(416, 1200, 24, wkSpotOk);
  if (hit) return hit;
  const x = x0 + ox * WK_ONWARD, z = z0 + oz * WK_ONWARD;
  return { at: [Math.round(x), Math.round(z)], yaw: Math.atan2(-ox, -oz), ok: false };
}

const wkCache = new Map();
function resolved(p) { let r = wkCache.get(p.id); if (!r) { r = npResolveConnectors(p); wkCache.set(p.id, r); } return r; }

/**
 * The paired connector on the far map: of the far map's connectors back to this one, the one whose own end lies
 * nearest the far end of `conn`. Pairing is mutual when wkPair(back) is `conn` again.
 */
export function wkPair(parish, conn) {
  if (!conn || conn.world || !conn.resolved || conn.to?.parish === parish.id) return null;
  const to = conn.other ?? npParish(conn.to.parish);
  if (!to) return null;
  let back = null, bd = Infinity;
  for (const d of resolved(to)) {
    if (d.world || d.to?.parish !== parish.id) continue;
    const dd = dist(d.from.position, conn.to.position);
    if (dd < bd) { bd = dd; back = d; }
  }
  if (!back) return null;
  const land = wkLanding(to, back.from.position);
  return { from: parish.id, conn, to, back, landing: land.at, yaw: land.yaw, dry: land.ok };
}

/** Every paired crossing in the 22 maps. */
export function wkPairs(parishes = NP_PARISHES) {
  const out = [];
  for (const p of parishes) for (const c of resolved(p)) { const pr = wkPair(p, c); if (pr) out.push(pr); }
  return out;
}

/** The URL that carries the player across (same page, `?parish=` swap) with the state that is not in storage. */
export function wkCarry(pair, { time = null, weather = null, drive = null } = {}) {
  const q = new URLSearchParams({ parish: pair.to.id, wkvia: pair.back.id });
  if (time != null) q.set("wktime", String(time));
  if (weather != null) q.set("wkwx", String(weather));
  if (drive) q.set("wkdrive", drive);
  return `?${q}`;
}

/** Read a page opened by wkCarry: where to stand, which way to face, and the carried state. */
export function wkArrival(params, parish) {
  const via = params.get("wkvia");
  if (!via) return null;
  const back = resolved(parish).find((c) => c.id === via);
  if (!back) return null;
  const land = wkLanding(parish, back.from.position);
  const num = (k) => (params.has(k) && Number.isFinite(+params.get(k)) ? +params.get(k) : null);
  return { via, back, landing: land.at, yaw: land.yaw, time: num("wktime"), weather: num("wkwx"), drive: params.get("wkdrive") || null };
}

/** The nearest way on (a paired connector, a world way, a within-map crossing) from (x, z). */
export function wkNearestWay(parish, x, z) {
  let best = null, bd = Infinity;
  for (const c of resolved(parish)) { const d = dist([x, z], c.from.position); if (d < bd) { bd = d; best = c; } }
  return best ? { conn: best, d: bd } : null;
}

/**
 * The edge of a map is a soft boundary: inside the band the walk is eased back toward the field (never a hard stop
 * mid-street) and the nearest way on is named. `push` is a gentle inward velocity (m/s) that grows toward the rim.
 */
export function wkEdge(parish, x, z) {
  const h = half(parish);
  const over = (v) => Math.max(0, Math.abs(v) - (h - WK_EDGE));
  const ex = over(x), ez = over(z);
  if (!ex && !ez) return { soft: false, push: [0, 0], way: null };
  const k = (e) => Math.min(1, e / WK_EDGE) * 6;
  const push = [-Math.sign(x) * k(ex), -Math.sign(z) * k(ez)];
  return { soft: true, push, way: wkNearestWay(parish, x, z) };
}

/** Clamp inside the field (the last metre only — the soft band does the work before it). */
export function wkClamp(parish, x, z) {
  const h = half(parish) - 2;
  return [Math.max(-h, Math.min(h, x)), Math.max(-h, Math.min(h, z))];
}

/** The region atlas: six regions, 22 maps joined by their connectors, the standalone worlds and their ways in. */
export function wkAtlas(parishes = NP_PARISHES) {
  const regions = NP_REGIONS.map((r) => ({ id: r.id, name: r.name, maps: parishes.filter((p) => npRegionOf(p) === r.id).map((p) => ({ id: p.id, name: p.name })) })).filter((r) => r.maps.length);
  const links = [];
  const seen = new Set();
  for (const pr of wkPairs(parishes)) {
    const key = [pr.from, pr.to.id].sort().join("|") + "|" + [pr.conn.id, pr.back.id].sort().join("|");
    if (seen.has(key)) continue; seen.add(key);
    links.push({ a: pr.from, b: pr.to.id, name: pr.conn.name, kind: pr.conn.kind, conn: pr.conn.id });
  }
  const worldWays = new Map(WK_WORLDS.map((w) => [w.id, []]));
  for (const p of parishes) for (const c of resolved(p)) if (c.world) {
    const id = String(c.to.world).split(",")[0];
    worldWays.get(id)?.push({ parish: p.id, conn: c.id, name: c.name, href: c.to.href });
  }
  const worlds = WK_WORLDS.map((w) => ({ ...w, ways: worldWays.get(w.id) ?? [] }));
  return { regions, links, worlds };
}

/** NEWTON boxes for MOTORWORKS' parked vehicles (mv-world.js placements: x, z, heading, dims [w, h, l]) in one chunk box. */
export function wkSolidBoxes(placements, groundAt = () => 0) {
  return (placements ?? []).map((p) => {
    const [w, h, l] = p.dims ?? [2.2, 2.2, 6];
    const c = Math.abs(Math.cos(p.heading ?? 0)), s = Math.abs(Math.sin(p.heading ?? 0));
    const hx = (w * c + l * s) / 2, hz = (w * s + l * c) / 2, y = groundAt(p.x, p.z);
    return { min: [p.x - hx, y - 0.2, p.z - hz], max: [p.x + hx, y + h, p.z + hz], kind: "parked-vehicle", id: p.id };
  });
}

/**
 * NEWTON's collider seam with the parked vehicles added: `base(parish, key)` (CITYWORKS' cwColliders, else the
 * parish's own boxes via `fallback`) plus every parked-vehicle box whose centre lies in the chunk.
 */
export function wkColliderSeam(base, fallback, boxes, size = 4096, chunk = 256) {
  const byKey = new Map();
  for (const b of boxes ?? []) {
    const cx = (b.min[0] + b.max[0]) / 2, cz = (b.min[2] + b.max[2]) / 2;
    const n = size / chunk, key = `${Math.max(0, Math.min(n - 1, Math.floor((cx + size / 2) / chunk)))},${Math.max(0, Math.min(n - 1, Math.floor((cz + size / 2) / chunk)))}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(b);
  }
  return (parish, key) => {
    let own = null;
    try { own = base?.(parish, key) ?? null; } catch { own = null; }
    if (!Array.isArray(own)) own = fallback(parish, key);
    const extra = byKey.get(String(key));
    return extra ? [...own, ...extra] : own;
  };
}
