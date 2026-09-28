// KREWE — where the parish kits stand (docs/consoles/KREWE.md). Pure: no three.js.
//
// kwPlacements(parish, { tier }) reads a parish data module (np-data-<parish>.js) through the
// engine's pure answers (np-parish.js) and returns `[{ kit, x, z, y, ry, why }]`:
//   - by site kind: a pump station house at every pump site, its pipes toward the nearest levee;
//     floodwall sections and a floodgate on the levee nearest every levee, floodwall, floodgate
//     and lock site; a shrimp boat and an oyster lugger on the open water nearest every harbour,
//     marina, port, ferry, landing and shipyard site; a ferry landing on the shore at every ferry
//     and landing site; a bandstand and a ring of live oaks at every park and campus site and park
//     landmark; two streetcars parked at a streetcar barn; and the kiosk's kit beside each KREWE
//     kiosk (kw-play-data.js).
//   - by district character: streetcars on the avenues through quarter, garden and downtown
//     districts (Orleans only: the streetcar is Orleans's), live oaks lining garden-district
//     avenues, shotgun-house blocks fronting the streets of quarter, suburb and garden districts,
//     and one parade route's barriers along an avenue through a quarter or downtown district.
// Deterministic (npRng from the parish id), capped per kit (KW_CAPS) so a parish's whole dressing
// stays inside KW_DRESS_BUDGET: at most one draw call per kit and a fixed triangle allowance on
// top of the engine's own NP_BUDGET. Names prefixed kw/KW_.

import {
  NP_WATER_Y, NP_PAD, NP_ROAD_KINDS, npRng, npPrepare, npWaterAt, npLeveeRise, npNearestRoad, npDistrictAt, npCoverAt,
  npHeightAt, npPolyDistance, npPolyPointAt, npPolyLength, npMassingForChunk, npChunkOf,
} from "./np-parish.js";
import { kwKioskSpots } from "./kw-play-data.js";

/** The whole dressing of one parish: one draw call per kit, and this many triangles at most. */
export const KW_DRESS_BUDGET = { drawCalls: 11, triangles: 45000 };
/** Placements per kit per parish, at most (high tier; `low` keeps about half of the trees, blocks and barriers). */
export const KW_CAPS = {
  streetcar: 8, pumpHouse: 4, leveeWall: 24, floodgate: 6, shrimpBoat: 6, oysterLugger: 6,
  shotgunBlock: 10, liveOak: 44, bandstand: 4, paradeBarriers: 16, ferryLanding: 4,
};
/** The triangles each kit costs as drawn (kept equal to KW_BUDGET's `tri` by tools/check_krewe.mjs). */
export const KW_TRI = {
  streetcar: 96, pumpHouse: 288, leveeWall: 60, floodgate: 128, shrimpBoat: 180, oysterLugger: 156,
  shotgunBlock: 384, liveOak: 336, bandstand: 316, paradeBarriers: 372, ferryLanding: 288,
};

const KW_SITE_RULES = [
  { re: /pump/, kits: ["pumpHouse"] },
  { re: /levee|floodwall|floodgate|lock/, kits: ["leveeWall", "floodgate"] },
  { re: /harbou?r|marina|port|ferry|landing|shipyard/, kits: ["shrimpBoat", "oysterLugger"] },
  { re: /ferry|landing/, kits: ["ferryLanding"] },
  { re: /park|campus/, kits: ["bandstand", "liveOak"] },
  { re: /streetcar/, kits: ["streetcar"] },
];
const KW_TROLLEY_CHARACTERS = new Set(["quarter", "garden", "downtown"]);
const KW_BLOCK_CHARACTERS = new Set(["quarter", "suburb", "garden"]);
const KW_PARADE_CHARACTERS = new Set(["quarter", "downtown"]);

/** Dry, off every road and not on a levee (the ground a free-standing kit needs). */
function kwDry(parish, x, z, { pad = false } = {}) {
  const c = npCoverAt(parish, x, z);
  if (c === "water" || c === "wetland" || c === "road" || c === "levee") return false;
  if (c === "pad" && !pad) return false;
  const half = npPrepare(parish).half;
  return Math.abs(x) < half - 20 && Math.abs(z) < half - 20;
}
const kwOpenWater = (parish, x, z) => { const w = npWaterAt(parish, x, z); return !!w && w.kind !== "wetland"; };

/** The nearest open water to a site: `{ x, z, shore: { x, z }, ang }` or null, searched in rings. */
function kwNearestWater(parish, sx, sz) {
  for (let r = 30; r <= 600; r += 15) {
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2, x = sx + Math.sin(a) * r, z = sz + Math.cos(a) * r;
      if (!kwOpenWater(parish, x, z)) continue;
      const x2 = sx + Math.sin(a) * (r + 18), z2 = sz + Math.cos(a) * (r + 18);
      if (!kwOpenWater(parish, x2, z2)) continue;
      return { x: sx + Math.sin(a) * (r + 12), z: sz + Math.cos(a) * (r + 12), shore: { x: sx + Math.sin(a) * (r - 14), z: sz + Math.cos(a) * (r - 14) }, ang: a };
    }
  }
  return null;
}

/** The nearest levee to a point: `{ levee, d, t }` or null. */
function kwNearestLevee(parish, x, z) {
  let best = null;
  for (const l of npPrepare(parish).levees) { const r = npPolyDistance(x, z, l.pts); if (!best || r.d < best.d) best = { levee: l, ...r }; }
  return best;
}

/** True when no engine massing part stands within `r` metres (so a kit does not sit inside a block). */
function kwClearOfMassing(parish, x, z, r, cache) {
  const { cx, cz, key } = npChunkOf(x, z);
  let spots = cache.get(key);
  if (!spots) { spots = npMassingForChunk(parish, cx, cz); cache.set(key, spots); }
  return !spots.some((s) => Math.hypot(s.x - x, s.z - z) < r);
}

/**
 * Every kit placement for a parish, deterministic. `tier` "low" keeps about half of the trees,
 * blocks and barriers. Each spot: `{ kit, x, z, y, ry, why }` (why = the rule that placed it).
 */
export function kwPlacements(parish, { tier = "high" } = {}) {
  const prep = npPrepare(parish);
  const rng = npRng((prep.seed ^ 0x6b77) >>> 0);
  const out = [];
  const count = {};
  const room = (kit) => (count[kit] ?? 0) < Math.ceil(KW_CAPS[kit] * (tier === "low" && /liveOak|shotgunBlock|paradeBarriers/.test(kit) ? 0.5 : 1));
  const put = (kit, x, z, y, ry, why) => {
    if (!room(kit)) return false;
    if (out.some((s) => Math.hypot(s.x - x, s.z - z) < (kit === "leveeWall" ? 6 : kit === "liveOak" ? 9 : 12))) return false;
    count[kit] = (count[kit] ?? 0) + 1;
    out.push({ kit, x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10, y: Math.round(y * 100) / 100, ry: Math.round(ry * 1000) / 1000, why });
    return true;
  };
  const ground = (x, z) => npHeightAt(parish, x, z);

  // ---- the KREWE kiosks: the kiosk's own kit beside it
  for (const k of kwKioskSpots(parish)) {
    const kit = k.kiosk.kit.replace(/^kw/, "").replace(/^./, (c) => c.toLowerCase());
    if (kit === "shrimpBoat" || kit === "ferryLanding" || kit === "floodgate" || kit === "leveeWall") continue; // placed by the site rules below
    const x = k.x - 10, z = k.z;
    if (kwDry(parish, x, z, { pad: true })) put(kit, x, z, ground(x, z), 0, `kiosk ${k.kiosk.id}`);
  }

  // ---- by site kind
  for (const s of prep.sites) {
    const kind = String(s.kind ?? "");
    const [sx, sz] = s.position;
    for (const rule of KW_SITE_RULES) {
      if (!rule.re.test(kind)) continue;
      for (const kit of rule.kits) {
        if (kit === "pumpHouse") {
          const lv = kwNearestLevee(parish, sx, sz);
          let ry = 0;
          if (lv && lv.d < 600) { const p = npPolyPointAt(lv.levee.pts, lv.t); ry = Math.atan2(p.x - sx, p.z - sz); }
          const x = sx + Math.sin(ry) * (NP_PAD - 16), z = sz + Math.cos(ry) * (NP_PAD - 16);
          put(kit, x, z, ground(x, z), ry, `pump site ${s.id}`);
        } else if (kit === "leveeWall" || kit === "floodgate") {
          const lv = kwNearestLevee(parish, sx, sz);
          if (!lv || lv.d > 500) continue;
          const L = npPolyLength(lv.levee.pts) || 1;
          const at = (off) => npPolyPointAt(lv.levee.pts, Math.min(1, Math.max(0, lv.t + off / L)));
          if (kit === "floodgate") { const p = at(0); if (!kwOpenWater(parish, p.x, p.z)) put(kit, p.x, p.z, ground(p.x, p.z), p.yaw, `levee near ${s.id}`); }
          else for (const off of [-30, -18, 18, 30]) { const p = at(off); if (!kwOpenWater(parish, p.x, p.z)) put(kit, p.x, p.z, ground(p.x, p.z), p.yaw, `levee near ${s.id}`); }
        } else if (kit === "shrimpBoat" || kit === "oysterLugger") {
          const w = kwNearestWater(parish, sx, sz);
          if (!w) continue;
          const side = kit === "shrimpBoat" ? 1 : -1, along = w.ang + Math.PI / 2;
          const x = w.x + Math.sin(along) * 9 * side, z = w.z + Math.cos(along) * 9 * side;
          if (kwOpenWater(parish, x, z)) put(kit, x, z, NP_WATER_Y - 0.9, along, `water by ${s.id}`);
        } else if (kit === "ferryLanding") {
          const w = kwNearestWater(parish, sx, sz);
          if (!w) continue;
          const { x, z } = w.shore;
          if (!npWaterAt(parish, x, z)) put(kit, x, z, Math.max(NP_WATER_Y, ground(x, z)), w.ang, `ferry shore by ${s.id}`);
        } else if (kit === "bandstand") {
          const x = sx + 20, z = sz + 22;
          if (kwDry(parish, x, z, { pad: true })) put(kit, x, z, ground(x, z), rng() * Math.PI, `park or campus ${s.id}`);
        } else if (kit === "liveOak") {
          for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3, x = sx + Math.sin(a) * 34, z = sz + Math.cos(a) * 34; if (kwDry(parish, x, z, { pad: true })) put(kit, x, z, ground(x, z), rng() * Math.PI * 2, `park or campus ${s.id}`); }
        } else if (kit === "streetcar") {
          for (const dx of [-6, 6]) { const x = sx + dx, z = sz - 14; put(kit, x, z, ground(x, z), 0, `barn ${s.id}`); }
        }
      }
    }
  }
  // Park landmarks: a bandstand and a few oaks.
  for (const l of parish.landmarks ?? []) {
    if (!/park|square/.test(String(l.kind ?? "")) || !Array.isArray(l.position)) continue;
    const [lx, lz] = l.position;
    if (kwDry(parish, lx + 12, lz, {})) put("bandstand", lx + 12, lz, ground(lx + 12, lz), rng() * Math.PI, `park landmark ${l.id}`);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.7, x = lx + Math.sin(a) * 28, z = lz + Math.cos(a) * 28; if (kwDry(parish, x, z, {})) put("liveOak", x, z, ground(x, z), rng() * 6.28, `park landmark ${l.id}`); }
  }

  // ---- by district character, along the roads
  const massCache = new Map();
  let paradeDone = false;
  for (const r of prep.roads) {
    if (r.kind === "ferry" || r.kind === "bridge" || r.kind === "causeway") continue;
    const L = npPolyLength(r.pts), width = NP_ROAD_KINDS[r.kind]?.width ?? 8;
    // Streetcars on Orleans avenues through quarter, garden and downtown districts.
    if (parish.id === "orleans" && r.kind === "avenue") {
      for (let d = 120; d < L - 60; d += 420) {
        const p = npPolyPointAt(r.pts, d / L), ch = npDistrictAt(parish, p.x, p.z)?.character;
        if (KW_TROLLEY_CHARACTERS.has(ch) && !npWaterAt(parish, p.x, p.z) && npLeveeRise(parish, p.x, p.z) < 0.2) put("streetcar", p.x, p.z, ground(p.x, p.z) + 0.3, p.yaw, `avenue in a ${ch} district`);
      }
    }
    // Live oaks lining garden-district avenues and streets.
    if (r.kind === "avenue" || r.kind === "street") {
      for (let d = 30; d < L - 30; d += 48) {
        const p = npPolyPointAt(r.pts, d / L);
        if (npDistrictAt(parish, p.x, p.z)?.character !== "garden") continue;
        for (const side of [1, -1]) {
          const x = p.x + Math.cos(p.yaw) * (width / 2 + 5) * side, z = p.z - Math.sin(p.yaw) * (width / 2 + 5) * side;
          if (kwDry(parish, x, z) && kwClearOfMassing(parish, x, z, 7, massCache)) put("liveOak", x, z, ground(x, z), rng() * 6.28, "garden-district avenue");
        }
      }
    }
    // Shotgun-house blocks fronting the streets of quarter, suburb and garden districts.
    if (r.kind === "street" || r.kind === "avenue" || r.kind === "riverroad") {
      for (let d = 90; d < L - 90; d += 260) {
        const p = npPolyPointAt(r.pts, d / L);
        const side = rng() < 0.5 ? 1 : -1, off = width / 2 + 11;
        const x = p.x + Math.cos(p.yaw) * off * side, z = p.z - Math.sin(p.yaw) * off * side;
        const ch = npDistrictAt(parish, x, z)?.character;
        if (!KW_BLOCK_CHARACTERS.has(ch) || !kwDry(parish, x, z)) continue;
        if (npNearestRoad(parish, x, z).d < width / 2 + 7) continue;
        if (!kwClearOfMassing(parish, x, z, 8, massCache)) continue;
        put("shotgunBlock", x, z, ground(x, z), p.yaw + (side > 0 ? -Math.PI / 2 : Math.PI / 2), `street in a ${ch} district`);
      }
    }
    // One parade route: barriers along both kerbs of the first avenue through a quarter or downtown district.
    if (!paradeDone && r.kind === "avenue") {
      let placed = 0;
      for (let d = 40; d < L - 40 && placed < KW_CAPS.paradeBarriers; d += 30) {
        const p = npPolyPointAt(r.pts, d / L);
        if (!KW_PARADE_CHARACTERS.has(npDistrictAt(parish, p.x, p.z)?.character)) continue;
        for (const side of [1, -1]) {
          const x = p.x + Math.cos(p.yaw) * (width / 2 + 1.2) * side, z = p.z - Math.sin(p.yaw) * (width / 2 + 1.2) * side;
          if (!npWaterAt(parish, x, z) && npLeveeRise(parish, x, z) < 0.2 && put("paradeBarriers", x, z, ground(x, z), p.yaw + Math.PI / 2, "parade route")) placed++;
        }
      }
      if (placed) paradeDone = true;
    }
  }
  return out;
}

/** A parish dressing's cost: `{ drawCalls, triangles, placements, byKit }` (pure, from KW_TRI). */
export function kwDressCost(spots) {
  const byKit = {};
  for (const s of spots) byKit[s.kit] = (byKit[s.kit] ?? 0) + 1;
  return { drawCalls: Object.keys(byKit).length, triangles: Object.entries(byKit).reduce((t, [k, n]) => t + n * (KW_TRI[k] ?? 0), 0), placements: spots.length, byKit };
}
