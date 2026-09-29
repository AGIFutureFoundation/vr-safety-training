// MENAGERIE — life on the streets (docs/consoles/MENAGERIE.md): pets and animals by region and district
// character, and ambient passers-by on the sidewalks, for the parish maps and Bay World.
//
// THE SEAM (the Packs brief's shape):
//
//   mgMountLife({ three, root, parish | map, groundAt, sidewalkAt, colliders, pos, threats, tier, night, still, seed })
//     -> { animate(t, dt), counts(), stats(), agents, meshes, dispose() }
//
//     three       the three.js namespace (passed in; this module never imports it, so Node runs it)
//     root        the group the InstancedMeshes go into
//     parish      a parish-engine map (np-data-*.js), or `map` — an adapter from mgParishMap / mgBayMap
//     groundAt    (x, z) -> ground height in metres
//     sidewalkAt  optional (x, z) -> bool (CITYWORKS `cwSidewalkAt(parish, x, z)`); absent, the road edges are used
//     colliders   optional (chunkKey) -> [{ min: [x, y, z], max: [x, y, z], kind }] (CITYWORKS `cwColliders`)
//     pos         () -> [x, z] of the avatar, or null (nothing flees a menu)
//     threats     optional () -> [[x, z], ...] moving vehicles; animals flee them, passers-by step aside
//     tier        "low" | "balanced" | "high" (the phone tier places fewer)
//     night       true places the night routine: fewer people and birds, more cats
//     still       true (and prefers-reduced-motion) places the world and moves nothing
//
// Everything is procedural and says so: the kinds are the generic urban and coastal ones, the counts are a scene
// budget and never a census, and no figure here is a fact about a real place. GRIOT's named characters stay the
// ones who talk; a passer-by the avatar walks into steps aside and nods. One InstancedMesh per kind (plus one for
// the passers-by's heads), so a whole map costs at most MG_BUDGET.drawCalls draw calls.
// Names prefixed mg/MG_ (the bundler shares one scope).

import { NP_ROAD_KINDS, npRng, npPrepare, npWaterAt, npCoverAt, npDistrictAt, npPointsAlong, npPolyDistance, npPolyPointAt, npChunkOf } from "./np-parish.js";

// ------------------------------------------------------------------ kinds

const MG_TINT = 0xffffff; // a part drawn in the instance's own colour (coat, clothing)
const MG_HEAD_Y = { pedestrian: 1.62, jogger: 1.62, walker: 1.62, cyclist: 1.66 };

/**
 * Per kind: its body as boxes `[w, h, d, x, y, z, colour]` (front +z, feet at y 0), how it moves, how far it
 * flees (metres from the avatar or a vehicle) and how fast, its speed, how night changes it, and the coat or
 * clothing colours an individual is drawn in. `tri` is the triangles one individual costs (12 per box).
 */
export const MG_KINDS = {
  pedestrian: { group: "person", moves: "ground", motion: "walk", speed: 1.3, flee: 0, aside: 1.6, night: 0.35, coats: null,
    parts: [[0.34, 0.8, 0.2, 0, 0.4, 0, 0x2b2f36], [0.46, 0.62, 0.26, 0, 1.12, 0, MG_TINT]] },
  jogger: { group: "person", moves: "ground", motion: "walk", speed: 2.8, flee: 0, aside: 2.2, night: 0.2, coats: [0xe8533a, 0x2a7de1, 0x3d9a4a, 0xf2c14b, 0xf4f4f0],
    parts: [[0.32, 0.8, 0.2, 0, 0.4, 0, 0x22252b], [0.42, 0.6, 0.24, 0, 1.12, 0, MG_TINT]] },
  walker: { group: "person", moves: "ground", motion: "walk", speed: 1.0, flee: 0, aside: 1.8, night: 0.4, coats: null,
    // a person with a dog on a lead: the dog trots ahead on the kerb side
    parts: [[0.34, 0.8, 0.2, 0, 0.4, 0, 0x2b2f36], [0.46, 0.62, 0.26, 0, 1.12, 0, MG_TINT],
      [0.26, 0.28, 0.62, 0.55, 0.36, 1.25, 0x8a5a32], [0.2, 0.2, 0.24, 0.55, 0.55, 1.62, 0x8a5a32], [0.22, 0.22, 0.5, 0.55, 0.11, 1.25, 0x5a3a22],
      [0.03, 0.03, 1.2, 0.36, 0.72, 0.72, 0xd8322c]] },
  cyclist: { group: "person", moves: "ground", motion: "walk", speed: 4.2, flee: 0, aside: 2.4, night: 0.25, coats: [0xf2c14b, 0xe8533a, 0x1c7f7a, 0xf4f4f0],
    parts: [[0.06, 0.08, 1.2, 0, 0.62, 0, 0x2b2f36], [0.05, 0.66, 0.66, 0, 0.33, 0.55, 0x1a1a1a], [0.05, 0.66, 0.66, 0, 0.33, -0.55, 0x1a1a1a],
      [0.3, 0.5, 0.22, 0, 0.82, -0.05, 0x22252b], [0.4, 0.58, 0.26, 0, 1.28, 0.05, MG_TINT]] },
  dog: { group: "pet", moves: "ground", motion: "wander", speed: 1.8, flee: 6, fleeSpeed: 4.5, roam: 10, night: 0.5, coats: [0x8a5a32, 0x2a2420, 0xd8b86a, 0xe8e6e0, 0x6a4428],
    parts: [[0.3, 0.3, 0.7, 0, 0.42, 0, MG_TINT], [0.22, 0.22, 0.26, 0, 0.62, 0.42, MG_TINT], [0.26, 0.28, 0.56, 0, 0.14, 0, 0x3a2e24], [0.05, 0.05, 0.3, 0, 0.55, -0.46, MG_TINT]] },
  cat: { group: "pet", moves: "ground", motion: "perch", speed: 0.9, flee: 5, fleeSpeed: 4.0, roam: 4, night: 1.6, coats: [0x2a2420, 0xd8904a, 0x9a9a98, 0xe8e6e0, 0x6a4428],
    parts: [[0.18, 0.2, 0.45, 0, 0.2, 0, MG_TINT], [0.16, 0.15, 0.15, 0, 0.34, 0.26, MG_TINT], [0.04, 0.04, 0.36, 0, 0.3, -0.36, MG_TINT]] },
  pigeon: { group: "bird", moves: "flies", motion: "flock", speed: 0.6, flee: 5, fleeSpeed: 6, roam: 4, lift: 7, night: 0.2, coats: [0x8a8f98, 0x6f747c, 0xa9adb3],
    parts: [[0.14, 0.14, 0.28, 0, 0.14, 0, MG_TINT], [0.08, 0.08, 0.1, 0, 0.25, 0.13, 0x5a5f68], [0.42, 0.02, 0.16, 0, 0.17, -0.02, MG_TINT]] },
  gull: { group: "bird", moves: "flies", motion: "flock", speed: 0.7, flee: 8, fleeSpeed: 7, roam: 8, lift: 12, night: 0.2, coats: [0xf2f4f6, 0xe6e9ec],
    parts: [[0.2, 0.18, 0.5, 0, 0.2, 0, MG_TINT], [0.1, 0.1, 0.12, 0, 0.32, 0.26, MG_TINT], [1.2, 0.03, 0.24, 0, 0.24, -0.02, 0xb8bfc6]] },
  pelican: { group: "bird", moves: "flies", motion: "glide", speed: 5, flee: 14, fleeSpeed: 6, roam: 60, lift: 10, night: 0.2, coats: [0xd9cfc0, 0xcfc4b2],
    parts: [[0.4, 0.34, 1.0, 0, 0, 0, MG_TINT], [2.4, 0.04, 0.45, 0, 0.05, 0, 0x6b625a], [0.1, 0.08, 0.42, 0, 0.04, 0.68, 0xd8b450]] },
  egret: { group: "bird", moves: "ground", wades: true, motion: "wander", speed: 0.4, flee: 12, fleeSpeed: 3, roam: 8, night: 0.3, coats: [0xf6f6f2],
    parts: [[0.2, 0.2, 0.4, 0, 0.65, 0, MG_TINT], [0.06, 0.5, 0.06, 0, 1.0, 0.16, MG_TINT], [0.04, 0.5, 0.04, 0, 0.25, 0, 0x2a2a28], [0.05, 0.05, 0.18, 0, 1.26, 0.26, 0xd8b450]] },
  heron: { group: "bird", moves: "ground", wades: true, motion: "wander", speed: 0.35, flee: 16, fleeSpeed: 3, roam: 10, night: 0.5, coats: [0x8a97a3],
    parts: [[0.26, 0.26, 0.5, 0, 0.8, 0, MG_TINT], [0.07, 0.6, 0.07, 0, 1.25, 0.2, MG_TINT], [0.05, 0.62, 0.05, 0, 0.31, 0, 0x2a2a28], [0.06, 0.06, 0.24, 0, 1.56, 0.32, 0xd8b450]] },
  squirrel: { group: "wild", moves: "ground", motion: "wander", speed: 1.6, flee: 7, fleeSpeed: 5, roam: 8, night: 0, coats: [0x7a5a3a, 0x8a8a86],
    parts: [[0.1, 0.12, 0.22, 0, 0.08, 0, MG_TINT], [0.08, 0.22, 0.08, 0, 0.19, -0.14, MG_TINT], [0.07, 0.07, 0.08, 0, 0.16, 0.13, MG_TINT]] },
  sealion: { group: "wild", moves: "swims", motion: "swim", speed: 0.5, flee: 10, fleeSpeed: 2.5, roam: 12, night: 0.8, coats: [0x5a4a3a, 0x4a3e32],
    parts: [[0.5, 0.36, 1.6, 0, 0.05, 0, MG_TINT], [0.24, 0.24, 0.3, 0, 0.32, 0.86, MG_TINT], [1.0, 0.05, 0.26, 0, 0.0, 0.3, 0x3a3028]] },
  chicken: { group: "wild", moves: "ground", motion: "wander", speed: 0.7, flee: 5, fleeSpeed: 3.5, roam: 6, night: 0, coats: [0xc9884a, 0xf1ece0, 0x3a2e24],
    parts: [[0.22, 0.22, 0.3, 0, 0.26, 0, MG_TINT], [0.1, 0.14, 0.1, 0, 0.44, 0.14, MG_TINT], [0.03, 0.06, 0.08, 0, 0.54, 0.14, 0xc0302a], [0.1, 0.14, 0.04, 0, 0.07, 0, 0xd8a040]] },
};
for (const k of Object.values(MG_KINDS)) k.tri = k.parts.length * 12 + (MG_HEAD_Y[Object.keys(MG_KINDS).find((n) => MG_KINDS[n] === k)] ? 12 : 0);
export const MG_KIND_NAMES = Object.keys(MG_KINDS);
/** The kinds that are passers-by (people); every other kind is an animal. */
export const MG_PEOPLE = MG_KIND_NAMES.filter((k) => MG_KINDS[k].group === "person");

/** The budget: draw calls for a whole map, agents per 256 m chunk and per map by tier, per-kind caps per map, triangles. */
export const MG_BUDGET = {
  drawCalls: MG_KIND_NAMES.length + 1, // one InstancedMesh per kind, one for the passers-by's heads
  perChunk: { high: 24, balanced: 18, low: 8 },
  perMap: { high: 360, balanced: 260, low: 120 },
  caps: { pedestrian: 120, jogger: 24, walker: 30, cyclist: 24, dog: 24, cat: 40, pigeon: 48, gull: 36, pelican: 12, egret: 10, heron: 2, squirrel: 30, sealion: 8, chicken: 2 },
  triangles: 26000,
};

/** The districts where people walk, and which animals each character keeps. */
const MG_STREET_CHARS = new Set(["quarter", "downtown", "garden", "suburb", "campus", "park", "port"]);
const MG_PORCH_CHARS = new Set(["quarter", "garden", "suburb"]);
const MG_YARD_CHARS = new Set(["garden", "suburb", "park", "campus"]);
const MG_PIGEON_CHARS = new Set(["downtown", "quarter", "port"]);
const MG_SQUIRREL_CHARS = new Set(["park", "campus", "garden"]);
const MG_WATERFRONT = /port|harbou?r|marina|ferry|landing|pier|wharf|terminal|shipyard|beach|lifeguard|embarcadero|seawall|lakefront|dock/;
const MG_TRANSIT = /transit|bus|streetcar|rail|ferry|terminal|station|hub|barn|trolley|light-rail/;

// ------------------------------------------------------------------ adapters

/** A parish-engine map as the life map: roads with widths, sites with their character, and cover from np-parish. */
export function mgParishMap(parish) {
  const prep = npPrepare(parish);
  return {
    id: parish.id, region: parish.region ?? "new-orleans", half: prep.half,
    roads: prep.roads.filter((r) => r.kind !== "ferry").map((r) => ({ id: r.id, kind: r.kind, width: NP_ROAD_KINDS[r.kind]?.width ?? 8, pts: r.pts, deck: r.kind === "bridge" || r.kind === "causeway", fast: r.kind === "interstate" })),
    sites: prep.sites.map((s) => ({ id: s.id, kind: `${s.kind ?? ""} ${s.id}`, x: s.position[0], z: s.position[1], character: npDistrictAt(parish, s.position[0], s.position[1])?.character ?? "grass" })),
    waters: prep.water.map((w) => ({ id: w.id, kind: w.kind, shape: w.shape, centre: w.centre })),
    coverAt: (x, z) => npCoverAt(parish, x, z),
    characterAt: (x, z) => npDistrictAt(parish, x, z)?.character ?? "grass",
    openWaterAt: (x, z) => { const w = npWaterAt(parish, x, z); return !!w && w.kind !== "wetland"; },
    wetlandAt: (x, z) => npWaterAt(parish, x, z)?.kind === "wetland",
    waterKindAt: (x, z) => npWaterAt(parish, x, z)?.kind ?? null,
  };
}

const MG_BAY_CHARACTER = { downtown: "downtown", uptown: "downtown", "west-oakland": "quarter", fruitvale: "quarter", "emery-crossing": "suburb", coliseum: "campus", hills: "park", "upper-hills": "park", lake: "park", port: "port", "estuary-waterfront": "port", "island-harbour": "port", "bridge-approach": "industrial", "north-shoreline": "park", "south-shoreline": "park", "outer-bay": "port" };

/**
 * Bay World as the life map, from its own pure data: `{ roads: BAY_ROADS, sites: BW_SITES, zoneAt, roadAt, waterTopAt, bounds }`
 * (bayworld-data.js's `bayZoneAt(x, z).id`, `bayRoadAt`, `txWaterTopAt`, `BAY_BOUNDS`).
 */
export function mgBayMap({ roads = [], sites = [], zoneAt = () => "downtown", roadAt = () => null, waterTopAt = () => null, bounds = { minX: -1200, maxX: 1200, minZ: -800, maxZ: 800 } } = {}) {
  const character = (x, z) => MG_BAY_CHARACTER[zoneAt(x, z)] ?? "suburb";
  const inBounds = (x, z) => x > bounds.minX + 10 && x < bounds.maxX - 10 && z > bounds.minZ + 10 && z < bounds.maxZ - 10;
  return {
    id: "bayworld", region: "bay-area", half: Math.max(bounds.maxX, bounds.maxZ),
    roads: roads.map((r) => ({ id: r.id, kind: "avenue", width: Math.max(8, (r.lanes ?? 2) * 3.4), pts: r.points ?? r.pts, fast: (r.lanes ?? 2) >= 6 })),
    sites: sites.map((s) => ({ id: s.id, kind: `${s.zone ?? ""} ${s.id}`, x: s.position[0], z: s.position.length > 2 ? s.position[2] : s.position[1], character: character(s.position[0], s.position.length > 2 ? s.position[2] : s.position[1]) })),
    waters: [],
    coverAt: (x, z) => (!inBounds(x, z) ? "water" : waterTopAt(x, z) != null ? "water" : roadAt(x, z) ? "road" : character(x, z)),
    characterAt: character,
    openWaterAt: (x, z) => !inBounds(x, z) || waterTopAt(x, z) != null,
    wetlandAt: () => false,
    waterKindAt: (x, z) => (waterTopAt(x, z) != null ? "bay" : null),
  };
}

// ------------------------------------------------------------------ planning

function mgSeedOf(id, seed = 0) { return [...String(id)].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 101 + seed); }
function mgInBox(x, z, boxes) { for (const b of boxes ?? []) if (x >= b.min[0] && x <= b.max[0] && z >= b.min[2] && z <= b.max[2]) return true; return false; }

/** The ground a kind may stand on at (x, z): fliers anywhere, swimmers only on open water, waders on land or wetland, the rest dry land. */
export function mgGroundOk(map, kind, x, z) {
  const k = MG_KINDS[kind];
  if (!k) return false;
  if (k.moves === "flies") return true;
  const open = map.openWaterAt(x, z);
  if (k.moves === "swims") return open;
  if (open) return false;
  if (map.wetlandAt(x, z)) return !!k.wades;
  return true;
}

/**
 * Where life stands on one map: a deterministic list of agents `{ id, kind, x, z, heading, leg?, chunk, why }`.
 *   map   mgParishMap(parish) or mgBayMap(...)
 *   o     { tier, night, seed, sidewalkAt(x, z) -> bool, colliders(chunkKey) -> boxes }
 */
export function mgPlan(map, o = {}) {
  const tier = MG_BUDGET.perChunk[o.tier] ? o.tier : "high";
  const rng = npRng(mgSeedOf(map.id, o.seed ?? 0));
  const cands = [];
  const sites = map.sites ?? [];
  const nearSite = (x, z) => { let d = Infinity; for (const s of sites) d = Math.min(d, Math.hypot(x - s.x, z - s.z)); return d; };
  const boxesAt = (x, z) => { try { return o.colliders?.(npChunkOf(x, z).key) ?? []; } catch { return []; } };
  const add = (kind, x, z, heading, why, extra = {}) => {
    if (!mgGroundOk(map, kind, x, z) || mgInBox(x, z, boxesAt(x, z))) return;
    cands.push({ kind, x, z, heading, why, ...extra, pri: rng() * (1 + nearSite(x, z) / 350) });
  };
  // A spot beside a road: on the sidewalk when CITYWORKS answers, else the road edge (half width plus a metre and a half).
  const edge = (p, n, width, side, extra = 1.5) => {
    for (const off of [width / 2 + extra, width / 2 + extra + 1, width / 2 + extra + 2.5]) {
      const x = p[0] + n[0] * off * side, z = p[1] + n[1] * off * side;
      if (o.sidewalkAt) { let on = false; try { on = !!o.sidewalkAt(x, z); } catch { on = false; } if (on) return [x, z]; continue; }
      const c = map.coverAt(x, z);
      if (c !== "road" && c !== "water" && c !== "wetland" && c !== "levee") return [x, z];
    }
    return null;
  };
  const off = (p, n, d, side) => { const x = p[0] + n[0] * d * side, z = p[1] + n[1] * d * side; const c = map.coverAt(x, z); return c === "road" || c === "water" || c === "levee" ? null : [x, z]; };

  // Along the streets: passers-by, walkers with dogs, joggers and cyclists, cats on porches, dogs and squirrels in yards and parks.
  for (const r of map.roads ?? []) {
    if (r.deck || !r.pts || r.pts.length < 2) continue;
    const pts = npPointsAlong(r.pts, 70);
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
      const n = [-dz / L, dx / L], heading = Math.atan2(dx, dz);
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const ch = map.characterAt(mid[0], mid[1]);
      const side = rng() < 0.5 ? 1 : -1;
      if (MG_STREET_CHARS.has(ch) && !r.fast) {
        const pa = edge(a, n, r.width, side), pb = edge(b, n, r.width, side);
        if (pa && pb) {
          const roll = rng();
          const kind = roll < 0.62 ? "pedestrian" : roll < 0.78 ? "walker" : roll < 0.9 ? "jogger" : "pedestrian";
          add(kind, pa[0], pa[1], heading, `a passer-by on the ${o.sidewalkAt ? "sidewalk" : "road edge"} of a ${ch} street`, { leg: [pa, pb] });
        }
        if (rng() < 0.3) { // a cyclist keeps to the road's own edge
          const cx0 = a[0] + n[0] * (r.width / 2 - 1) * -side, cz0 = a[1] + n[1] * (r.width / 2 - 1) * -side;
          const cx1 = b[0] + n[0] * (r.width / 2 - 1) * -side, cz1 = b[1] + n[1] * (r.width / 2 - 1) * -side;
          if (!map.openWaterAt(cx0, cz0) && !map.openWaterAt(cx1, cz1)) add("cyclist", cx0, cz0, heading, `a cyclist at the edge of a ${ch} street`, { leg: [[cx0, cz0], [cx1, cz1]], onRoad: true });
        }
      }
      if (MG_PORCH_CHARS.has(ch) && rng() < 0.35) { const p = off(mid, n, r.width / 2 + 6 + rng() * 2, -side); if (p) add("cat", p[0], p[1], heading + Math.PI / 2 * side, `a cat on a porch of a ${ch} street`); }
      if (MG_YARD_CHARS.has(ch) && rng() < 0.18) { const p = off(mid, n, r.width / 2 + 9, -side); if (p) add("dog", p[0], p[1], rng() * 6.28, `a dog in a ${ch} yard`); }
      if (MG_SQUIRREL_CHARS.has(ch) && rng() < 0.22) { const p = off(mid, n, r.width / 2 + 12, side); if (p) add("squirrel", p[0], p[1], rng() * 6.28, `a squirrel under the ${ch} trees`); }
      if (ch === "downtown" && rng() < 0.12) { const p = edge(mid, n, r.width, -side, 3); if (p) for (let k = 0; k < 4; k++) add("pigeon", p[0] + (rng() - 0.5) * 3, p[1] + (rng() - 0.5) * 3, rng() * 6.28, "pigeons on a downtown sidewalk"); }
    }
  }
  // A stray chicken in the first garden district's streets (one or two per map).
  {
    const garden = cands.filter((c) => c.kind === "cat" && map.characterAt(c.x, c.z) === "garden");
    if (garden.length) { const g = garden[Math.floor(rng() * garden.length)]; add("chicken", g.x + 2, g.z + 1, rng() * 6.28, "a stray chicken in a garden district"); add("chicken", g.x + 3, g.z - 1, rng() * 6.28, "a stray chicken in a garden district"); }
  }
  // At the sites: pigeons on downtown and quarter pads, waiting passers-by at transit, a crossing at the nearest road, the waterfront.
  for (const s of sites) {
    const kind = s.kind.toLowerCase();
    if (MG_PIGEON_CHARS.has(s.character)) { const a = rng() * 6.28, d = 30 + rng() * 10; for (let k = 0; k < 5; k++) add("pigeon", s.x + Math.cos(a) * d + (rng() - 0.5) * 4, s.z + Math.sin(a) * d + (rng() - 0.5) * 4, rng() * 6.28, "pigeons at the edge of a site pad"); }
    let best = null;
    for (const r of map.roads ?? []) { if (r.deck || r.fast || !r.pts) continue; const { d, t } = npPolyDistance(s.x, s.z, r.pts); if (!best || d < best.d) best = { d, t, r }; }
    if (best && best.d < 260) {
      const p = npPolyPointAt(best.r.pts, best.t), n = [Math.cos(p.yaw), -Math.sin(p.yaw)], w = best.r.width;
      const a = [p.x + n[0] * (w / 2 + 1.5), p.z + n[1] * (w / 2 + 1.5)], b = [p.x - n[0] * (w / 2 + 1.5), p.z - n[1] * (w / 2 + 1.5)];
      if (map.coverAt(a[0], a[1]) !== "water" && map.coverAt(b[0], b[1]) !== "water") add("pedestrian", a[0], a[1], p.yaw + Math.PI / 2, "a passer-by crossing at the junction nearest a site", { leg: [a, b], crossing: true, onRoad: true });
      if (MG_TRANSIT.test(kind)) for (let k = 0; k < 3; k++) add("pedestrian", a[0] + Math.sin(p.yaw) * (k - 1) * 1.2, a[1] + Math.cos(p.yaw) * (k - 1) * 1.2, p.yaw + Math.PI + (n[0] > 0 ? Math.PI / 2 : -Math.PI / 2), "a passer-by waiting at a transit stop", { wait: true });
    }
    if (MG_WATERFRONT.test(kind)) {
      // The first open water on a ray out from the site: gulls land on the shore, sea lions haul out in the San Francisco bay.
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2 + rng() * 0.1;
        let hit = null;
        for (let d = 20; d <= 180; d += 10) { const x = s.x + Math.cos(a) * d, z = s.z + Math.sin(a) * d; if (map.openWaterAt(x, z)) { hit = [x, z, d]; break; } }
        if (!hit) continue;
        for (let j = 0; j < 6; j++) add("gull", hit[0] - Math.cos(a) * 6 + (rng() - 0.5) * 8, hit[1] - Math.sin(a) * 6 + (rng() - 0.5) * 8, rng() * 6.28, "gulls at the waterfront beside a site");
        if (map.region === "san-francisco" || map.region === "bay-area") for (let j = 0; j < 3; j++) add("sealion", hit[0] + Math.cos(a) * (8 + j * 3), hit[1] + Math.sin(a) * (8 + j * 3), a, "sea lions in the bay off a waterfront site");
        break;
      }
    }
  }
  // Over the New Orleans water: pelicans along rivers and lakes near a site; egrets and a heron at a wetland edge.
  if (map.region === "new-orleans") {
    for (const w of map.waters ?? []) {
      const pts = w.centre ?? w.shape;
      if (!pts?.length) continue;
      if (w.kind === "wetland") {
        const p = pts[Math.floor(rng() * pts.length)], c = pts.reduce((acc, q) => [acc[0] + q[0] / pts.length, acc[1] + q[1] / pts.length], [0, 0]);
        for (let t = 0.12; t < 0.5; t += 0.06) { const x = p[0] + (c[0] - p[0]) * t, z = p[1] + (c[1] - p[1]) * t; if (map.wetlandAt(x, z)) { for (let j = 0; j < 4; j++) add("egret", x + (rng() - 0.5) * 12, z + (rng() - 0.5) * 12, rng() * 6.28, "egrets wading a wetland edge"); add("heron", x + 14, z + 6, rng() * 6.28, "a heron in the wetland"); break; } }
      } else if (w.kind === "river" || w.kind === "lake" || w.kind === "canal" || w.kind === "bayou") {
        let best = null;
        for (const q of pts) { const d = Math.min(...sites.map((s) => Math.hypot(q[0] - s.x, q[1] - s.z))); if (!best || d < best.d) best = { q, d }; }
        if (best && best.d < 500 && map.openWaterAt(best.q[0], best.q[1])) for (let j = 0; j < 3; j++) add("pelican", best.q[0] + j * 3, best.q[1] + j * 2, rng() * 6.28, `pelicans over the ${w.kind}`);
      }
    }
  }
  // The night routine, the caps (per kind, per chunk, per map) and the tier.
  cands.sort((a, b) => a.pri - b.pri);
  const perChunk = MG_BUDGET.perChunk[tier], perMap = MG_BUDGET.perMap[tier], lowScale = tier === "low" ? 0.4 : tier === "balanced" ? 0.75 : 1;
  const byKind = {}, byChunk = {}, out = [];
  for (const c of cands) {
    const k = MG_KINDS[c.kind];
    const nightMul = o.night ? k.night : 1;
    if (nightMul < 1 && rng() > nightMul) continue; // fewer out at night (none for a kind whose night is 0)
    const cap = Math.round(MG_BUDGET.caps[c.kind] * lowScale);
    if ((byKind[c.kind] ?? 0) >= Math.max(0, cap)) continue;
    const chunk = npChunkOf(c.x, c.z).key;
    if ((byChunk[chunk] ?? 0) >= perChunk || out.length >= perMap) continue;
    byKind[c.kind] = (byKind[c.kind] ?? 0) + 1; byChunk[chunk] = (byChunk[chunk] ?? 0) + 1;
    const { pri, ...a } = c;
    out.push({ id: `${map.id}-${c.kind}-${byKind[c.kind]}`, ...a, chunk });
  }
  // Night brings the cats out: a second cat on the porch beside one that is already there, inside the cap.
  if (o.night) for (const c of out.filter((x) => x.kind === "cat")) {
    if ((byKind.cat ?? 0) >= Math.round(MG_BUDGET.caps.cat * lowScale)) break;
    const x = c.x + 1.5, z = c.z + 1;
    if (!mgGroundOk(map, "cat", x, z) || (byChunk[c.chunk] ?? 0) >= perChunk || out.length >= perMap) continue;
    byKind.cat += 1; byChunk[c.chunk] += 1;
    out.push({ ...c, id: `${map.id}-cat-${byKind.cat}`, x, z, why: "a second cat out on a porch at night" });
  }
  return out;
}

/** Counts by kind of a plan (or of a mounted life's agents). */
export function mgCounts(agents) { const out = {}; for (const a of agents) out[a.kind] = (out[a.kind] ?? 0) + 1; return out; }

/** Triangles and draw calls a plan costs as drawn. */
export function mgCost(agents) {
  const counts = mgCounts(agents);
  let triangles = 0, heads = 0;
  for (const [k, n] of Object.entries(counts)) { triangles += MG_KINDS[k].tri * n; if (MG_HEAD_Y[k]) heads += n; }
  return { counts, triangles, drawCalls: Object.keys(counts).length + (heads ? 1 : 0), agents: agents.length };
}

// ------------------------------------------------------------------ behaviour

/** A live agent from a planned one: its home, its motion state and its own seeded clock. */
export function mgAgent(p, i = 0) {
  const r = npRng(mgSeedOf(p.id, i));
  return { ...p, home: [p.x, p.z], y: 0, s: r(), dir: r() < 0.5 ? 1 : -1, mode: "idle", timer: r() * 4, target: null, side: 0, nod: 0, lift: 0, rng: r, phase: r() * 6.28 };
}

function mgNearestThreat(a, ctx) {
  let best = null, bd = Infinity;
  if (ctx.pos) { const d = Math.hypot(a.x - ctx.pos[0], a.z - ctx.pos[1]); if (d < bd) { bd = d; best = ctx.pos; } }
  for (const t of ctx.threats ?? []) { const d = Math.hypot(a.x - t[0], a.z - t[1]); if (d < bd) { bd = d; best = t; } }
  return { at: best, d: bd };
}

function mgTryMove(a, ctx, nx, nz) {
  if (ctx.map && !mgGroundOk(ctx.map, a.kind, nx, nz)) return false;
  if (ctx.boxesAt && MG_KINDS[a.kind].moves !== "flies" && mgInBox(nx, nz, ctx.boxesAt(nx, nz))) return false;
  a.x = nx; a.z = nz; return true;
}

/**
 * One behaviour step, pure: `ctx = { pos: [x, z] | null, threats: [[x, z]], map, boxesAt(x, z), t }`.
 * Animals flee to their kind's flee distance and settle home once it is clear; flocks lift and land; passers-by walk
 * their leg, wait or cross, and step aside (and nod) when the avatar or a vehicle comes close.
 */
export function mgStep(a, ctx, dt) {
  const k = MG_KINDS[a.kind];
  if (!k || dt <= 0) return a;
  const th = mgNearestThreat(a, ctx);
  if (k.group === "person") {
    // Step aside toward the kerb and nod when the avatar (or a vehicle) comes close; ease back after.
    const close = th.at && th.d < k.aside;
    a.side += ((close ? 1 : 0) - a.side) * Math.min(1, dt * 4);
    a.nod = close ? Math.min(1, a.nod + dt * 3) : Math.max(0, a.nod - dt * 2);
    if (a.wait || !a.leg) return a;
    if (close && a.side > 0.5) return a; // pause while stepping aside
    const [p0, p1] = a.leg, L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
    a.s += (a.dir * k.speed * dt) / L;
    if (a.s > 1) { a.s = 1; a.dir = -1; } else if (a.s < 0) { a.s = 0; a.dir = 1; }
    const nx = [-(p1[1] - p0[1]) / L, (p1[0] - p0[0]) / L];
    a.x = p0[0] + (p1[0] - p0[0]) * a.s + nx[0] * a.side * 0.9 * a.dir;
    a.z = p0[1] + (p1[1] - p0[1]) * a.s + nx[1] * a.side * 0.9 * a.dir;
    a.heading = Math.atan2((p1[0] - p0[0]) * a.dir, (p1[1] - p0[1]) * a.dir);
    return a;
  }
  // Animals: flee first.
  if (th.at && th.d < k.flee * 1.15) {
    a.mode = "flee"; a.timer = 3;
    let ax = a.x - th.at[0], az = a.z - th.at[1];
    const L = Math.hypot(ax, az) || 1; ax /= L; az /= L;
    const step = k.fleeSpeed * dt;
    let moved = false;
    for (const turn of [0, 0.6, -0.6, 1.2, -1.2, 1.8, -1.8]) {
      const c = Math.cos(turn), s = Math.sin(turn), dx = ax * c - az * s, dz = ax * s + az * c;
      if (mgTryMove(a, ctx, a.x + dx * step, a.z + dz * step)) { a.heading = Math.atan2(dx, dz); moved = true; break; }
    }
    if (k.moves === "flies") a.lift = Math.min(1, a.lift + dt * 1.5);
    if (!moved && k.moves !== "flies") a.timer = 3; // cornered against water or a wall: holds, and tries again next step
    return a;
  }
  if (a.mode === "flee") { a.timer -= dt; if (a.timer <= 0) a.mode = "return"; return a; }
  const clear = !th.at || th.d > k.flee * 1.5;
  if (a.mode === "return") {
    if (k.moves === "flies") a.lift = Math.max(0, a.lift - dt * 0.5);
    const dx = a.home[0] - a.x, dz = a.home[1] - a.z, d = Math.hypot(dx, dz);
    if (d < 0.5) { a.mode = "idle"; a.timer = 2; return a; }
    if (!clear) return a; // wary: holds its ground until the avatar moves off
    const step = Math.min(d, k.speed * 1.2 * dt), nx = a.x + (dx / d) * step, nz = a.z + (dz / d) * step;
    // never walk back into the flee radius
    if (th.at && Math.hypot(nx - th.at[0], nz - th.at[1]) < k.flee * 1.15) return a;
    if (mgTryMove(a, ctx, nx, nz)) a.heading = Math.atan2(dx, dz); else { a.home = [a.x, a.z]; a.mode = "idle"; }
    return a;
  }
  // Idle routines.
  a.timer -= dt;
  if (k.motion === "flock" || k.motion === "glide") {
    // Land and lift in turns (a flock's own clock), circle home while up.
    const up = k.motion === "glide" ? 1 : Math.sin(ctx.t * 0.08 + a.phase * 0.2) > 0.55 ? 1 : 0;
    a.lift += (up - a.lift) * Math.min(1, dt * 0.6);
    if (a.lift > 0.2) { const ang = ctx.t * (k.motion === "glide" ? 0.05 : 0.25) + a.phase, r = k.roam * (0.6 + a.lift * 0.6); a.x = a.home[0] + Math.cos(ang) * r; a.z = a.home[1] + Math.sin(ang) * r; a.heading = -ang; }
    else if (a.timer <= 0) { a.timer = 1 + a.rng() * 3; const t = [a.home[0] + (a.rng() - 0.5) * k.roam * 0.5, a.home[1] + (a.rng() - 0.5) * k.roam * 0.5]; if (mgGroundOk(ctx.map, a.kind, t[0], t[1])) { a.heading = Math.atan2(t[0] - a.x, t[1] - a.z); a.x += (t[0] - a.x) * 0.3; a.z += (t[1] - a.z) * 0.3; } }
    return a;
  }
  if (k.motion === "swim") { a.x = a.home[0] + Math.sin(ctx.t * 0.1 + a.phase) * k.roam * 0.4; a.z = a.home[1] + Math.cos(ctx.t * 0.07 + a.phase) * k.roam * 0.3; if (ctx.map && !mgGroundOk(ctx.map, a.kind, a.x, a.z)) { a.x = a.home[0]; a.z = a.home[1]; } a.heading = ctx.t * 0.1 + a.phase; return a; }
  // wander / perch: pick a spot inside the roam radius, walk to it, pause (a cat mostly sits).
  if (!a.target && a.timer <= 0) {
    if (k.motion === "perch" && a.rng() < 0.7) { a.timer = 4 + a.rng() * 6; return a; }
    const ang = a.rng() * 6.28, r = a.rng() * k.roam;
    a.target = [a.home[0] + Math.cos(ang) * r, a.home[1] + Math.sin(ang) * r];
  }
  if (a.target) {
    const dx = a.target[0] - a.x, dz = a.target[1] - a.z, d = Math.hypot(dx, dz);
    if (d < 0.2) { a.target = null; a.timer = 1.5 + a.rng() * 4; return a; }
    const step = Math.min(d, k.speed * dt);
    if (mgTryMove(a, ctx, a.x + (dx / d) * step, a.z + (dz / d) * step)) a.heading = Math.atan2(dx, dz); else { a.target = null; a.timer = 1; }
  }
  return a;
}

// ------------------------------------------------------------------ building

/** prefers-reduced-motion, read the way a11y.js reads it (false in Node). */
export function mgReducedMotion() {
  try { return !!globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches; } catch { return false; }
}

/** One kind's boxes baked into a single vertex-coloured, non-indexed geometry. */
function mgBake(three, parts) {
  const pos = [], nor = [], col = [], c = new three.Color();
  for (const [w, h, d, x, y, z, colour] of parts) {
    const g = new three.BoxGeometry(w, h, d).toNonIndexed();
    g.translate(x, y, z);
    const p = g.attributes.position.array, n = g.attributes.normal.array;
    c.setHex(colour);
    for (let i = 0; i < p.length; i += 3) { pos.push(p[i], p[i + 1], p[i + 2]); nor.push(n[i], n[i + 1], n[i + 2]); col.push(c.r, c.g, c.b); }
    g.dispose?.();
  }
  const geo = new three.BufferGeometry();
  geo.setAttribute("position", new three.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new three.Float32BufferAttribute(nor, 3));
  geo.setAttribute("color", new three.Float32BufferAttribute(col, 3));
  return geo;
}

/** The passers-by's clothing and skin, from crew.js's avatar styles (one population with the crew). */
const MG_OUTFITS = [0x3a6ea5, 0x8a3a1e, 0x3d6b3a, 0x6a1f2a, 0x1c7f7a, 0xd8b86a, 0x2a3f6a, 0xf4f4f0, 0x9a9a98, 0xd8322c, 0xf2c14b];
const MG_SKIN = [0xf6e0d0, 0xeccbb0, 0xe0b894, 0xd4a47c, 0xc49068, 0xb07c56, 0x9a6846, 0x86563a, 0x70462e, 0x5c3824, 0x4a2c1c, 0x382014];

/** The seam: see the header. */
export function mgMountLife(o = {}) {
  const three = o.three;
  const map = o.map ?? (o.parish ? mgParishMap(o.parish) : null);
  if (!three || !map) return { animate() {}, counts: () => ({}), stats: () => ({ drawCalls: 0, triangles: 0, agents: 0 }), agents: [], meshes: [], dispose() {} };
  const still = !!(o.still ?? mgReducedMotion());
  const colliders = typeof o.colliders === "function" ? o.colliders : null;
  const boxesAt = colliders ? (x, z) => { try { return colliders(npChunkOf(x, z).key) ?? []; } catch { return []; } } : null;
  const plan = mgPlan(map, { tier: o.tier, night: o.night, seed: o.seed, sidewalkAt: o.sidewalkAt, colliders });
  const agents = plan.map((p, i) => mgAgent(p, i));
  const groundAt = o.groundAt ?? (() => 0);
  const group = new three.Group(); group.name = "mg-life";
  const material = new three.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const byKind = {};
  for (const a of agents) (byKind[a.kind] ??= []).push(a);
  const meshes = [];
  const people = agents.filter((a) => MG_HEAD_Y[a.kind]);
  const heads = people.length ? new three.InstancedMesh(mgBake(three, [[0.22, 0.24, 0.22, 0, 0, 0, MG_TINT]]), material, people.length) : null;
  const col = new three.Color();
  for (const [kind, list] of Object.entries(byKind)) {
    const k = MG_KINDS[kind];
    const im = new three.InstancedMesh(mgBake(three, k.parts), material, list.length);
    im.name = `mg-${kind}`;
    list.forEach((a, i) => {
      a.slot = i;
      const coats = k.coats ?? MG_OUTFITS;
      im.setColorAt?.(i, col.setHex(coats[Math.floor(a.rng() * coats.length)]));
    });
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.frustumCulled = false;
    group.add(im); meshes.push(im); byKind[kind].mesh = im;
  }
  if (heads) {
    heads.name = "mg-heads"; heads.frustumCulled = false;
    people.forEach((a, i) => { a.headSlot = i; heads.setColorAt?.(i, col.setHex(MG_SKIN[Math.floor(a.rng() * MG_SKIN.length)])); });
    if (heads.instanceColor) heads.instanceColor.needsUpdate = true;
    group.add(heads); meshes.push(heads);
  }
  (o.root ?? null)?.add(group);
  const m4 = new three.Matrix4(), q = new three.Quaternion(), e = new three.Euler(), v = new three.Vector3(), one = new three.Vector3(1, 1, 1);
  function place(a) {
    const k = MG_KINDS[a.kind];
    const ground = k.moves === "swims" ? 0 : groundAt(a.x, a.z);
    const fly = k.moves === "flies" ? (k.motion === "glide" ? k.lift : a.lift * k.lift) : 0;
    const y = ground + fly + (k.moves === "swims" && !still ? Math.sin((a.phase + a.s) * 3) * 0.05 : 0);
    e.set(a.nod * 0.25, a.heading ?? 0, 0, "YXZ"); q.setFromEuler(e);
    m4.compose(v.set(a.x, y, a.z), q, one);
    byKind[a.kind].mesh.setMatrixAt(a.slot, m4);
    if (heads && a.headSlot != null) {
      e.set(a.nod * 0.5, a.heading ?? 0, 0, "YXZ"); q.setFromEuler(e);
      const hy = MG_HEAD_Y[a.kind];
      m4.compose(v.set(a.x + Math.sin(a.heading ?? 0) * (a.kind === "cyclist" ? 0.08 : 0), y + hy, a.z + Math.cos(a.heading ?? 0) * (a.kind === "cyclist" ? 0.08 : 0)), q, one);
      heads.setMatrixAt(a.headSlot, m4);
    }
  }
  for (const a of agents) place(a);
  for (const m of meshes) { m.instanceMatrix.needsUpdate = true; m.computeBoundingSphere?.(); }
  const ACTIVE = 320; // metres around the avatar where life moves; beyond it, it holds where it was
  let lastT = 0;
  return {
    agents, meshes, group, still, map,
    animate(t, dt = 0) {
      if (still || dt <= 0) return;
      lastT = t;
      const pos = o.pos?.() ?? null;
      let threats = [];
      try { threats = o.threats?.() ?? []; } catch { threats = []; }
      const ctx = { pos, threats, map, boxesAt, t };
      const cx = pos?.[0] ?? agents[0]?.home[0] ?? 0, cz = pos?.[1] ?? agents[0]?.home[1] ?? 0;
      for (const a of agents) {
        if (Math.abs(a.home[0] - cx) > ACTIVE || Math.abs(a.home[1] - cz) > ACTIVE) continue;
        mgStep(a, ctx, dt); place(a);
      }
      for (const m of meshes) m.instanceMatrix.needsUpdate = true;
    },
    counts: () => mgCounts(agents),
    stats() { const c = mgCost(agents); return { ...c, drawCalls: meshes.length, budget: MG_BUDGET, still, t: lastT }; },
    dispose() { group.parent?.remove(group); for (const m of meshes) m.geometry.dispose?.(); material.dispose?.(); },
  };
}
