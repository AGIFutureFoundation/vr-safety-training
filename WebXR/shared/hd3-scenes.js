// ENV-HD-3 — establishing shots beyond the robot sites (console `hd3`, docs/consoles/ENV-HD-3.md).
// SmartCiti.X Powered by AGI Corp.
//
// ROBO-EXTERIORS gave each of the six robot sites two establishing-shot presets (fxScene: "wide" and "door", 12 in all) for
// the reel. This module adds two for each of the three non-robot locations a learner visits most — the catalog's busiest
// sites by station count, one per kind: the bridge yard on the San Francisco Marina map (7 stations, the busiest site in
// the catalog), the port terminal on the Orleans map (6, on the first map the page opens) and the construction site on the
// Mission map (6; construction is the busiest kind, 350 stations over 91 sites). The shots frame the parish engine's own
// generic site (its low building and job board) in the procedural streets around it: nothing here models a real building
// and every label is generic by kind.
// ENV-HD-5 (docs/consoles/ENV-HD-5.md) adds the same two shots for the next busiest kinds after construction, by catalog
// stations: parks (214 stations over 54 sites), fire stations (178 over 46), hospitals (169 over 40) and schools (168 over
// 43) — the busiest site of each kind, a tie going to a map the presets already open (one page load frames more shots).
// The labels say only the kind ("Park crew yard", not the site's own name): the frame is the engine's generic building.
//
// SEAMS (every top-level name is hd3/HD3_-prefixed: the bundler shares one scope; no three.js):
//   HD3_SHOTS                         ["wide", "street"]: a high three-quarter view from the road side, and an eye-level view
//                                       from the near sidewalk of the nearest street
//   HD3_SCENE_SITES                   plain data: [{ id, parish, kind, label, stations, by }] (why these: see above; by "site" =
//                                       one of the catalog's busiest sites, "kind" = the busiest site of a next-busiest kind)
//   hd3Scene(parish, siteId, shot)    -> { siteId, shot, parish, kind, label, position, target, fov } | null — the camera spot is
//                                       the first candidate that stands dry and clear of massing with its sight line clear;
//                                       deterministic (no randomness), so a still can be re-shot exactly
//   hd3ScenePresets()                 -> [{ siteId, shot, parish }] for the fourteen presets (seven sites x two shots)
//   HD3_KW_HALF, hd3KitRects(parish)  ENV-HD-6: KREWE's kits (live oaks, bandstands, kiosks ...) count as obstacles too
//   The parishes app routes `window.__parishTest.scene(siteId, shot)` (and `?scene=<siteId>:<shot>`) here for these sites.

import { npHeightAt, npWaterAt, npChunkOf, npMassingForChunk, NP_SIZE } from "./np-parish.js";
import { cwMassFilter, cwSpotBoxes, cwSiteBuilding, cwNearestLine } from "./cw-cityworks.js";
import { kwPlacements } from "./kw-place.js";

export const HD3_SHOTS = ["wide", "street"];
export const HD3_SCENE_SITES = [
  { id: "bridge-yard", parish: "sf-marina", kind: "bridge", label: "Bridge yard", stations: 7, by: "site" },
  { id: "port-terminal", parish: "orleans", kind: "port", label: "Port terminal", stations: 6, by: "site" },
  { id: "mission-bay-construction-site", parish: "sf-mission", kind: "construction", label: "Construction site", stations: 6, by: "site" },
  // ENV-HD-5: the next busiest kinds (ties of the busiest count go to a map already listed above)
  { id: "presidio-crew-yard", parish: "sf-marina", kind: "park", label: "Park crew yard", stations: 5, by: "kind" },
  { id: "no-sw-mid-city-fire-station", parish: "orleans", kind: "fire-station", label: "Fire station", stations: 4, by: "kind" },
  { id: "hospital-district", parish: "orleans", kind: "hospital", label: "Hospital campus", stations: 6, by: "kind" },
  { id: "mission-school-campus", parish: "sf-mission", kind: "school", label: "School campus", stations: 5, by: "kind" },
];

export function hd3ScenePresets() {
  return HD3_SCENE_SITES.flatMap((s) => HD3_SHOTS.map((shot) => ({ siteId: s.id, shot, parish: s.parish })));
}

// ENV-HD-6: KREWE's dressing (kw-place.js) plants live oaks and street kits the massing does not list; the park's street
// camera stood 8 m from one, under its crown. A live oak counts by its crown (15.5 x 14.6 m) plus 8 m: with 1.5 m a camera 17 m
// out still had a low crown across the frame's top-left corner (looked at); the 3.5 m first pass now keeps a camera >= 11 m from
// any crown's edge. Every other kit counts by a generic 6 m half-size.
export const HD3_KW_HALF = { liveOak: 7.8 + 8, other: 6 };
const hd3KwCache = new WeakMap();
/** KREWE's placements as obstacle rects (the high tier's set, a superset of the phone tier's), cached per map. */
export function hd3KitRects(parish) {
  if (hd3KwCache.has(parish)) return hd3KwCache.get(parish);
  let list = [];
  try { list = kwPlacements(parish, { tier: "high" }); } catch { list = []; }
  const rects = list.map((k) => { const r = HD3_KW_HALF[k.kit] ?? HD3_KW_HALF.other; return Object.assign([k.x - r, k.z - r, k.x + r, k.z + r], { kit: k.kit, x: k.x, z: k.z }); });
  hd3KwCache.set(parish, rects);
  return rects;
}
const hd3Hit = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
/** Massing rects (grown by 2 m) and tree crowns around (x, z), and the other catalog sites' buildings; cached per map + chunk. */
const hd3NearCache = new WeakMap();
function hd3Obstacles(parish, x, z, skip) {
  let per = hd3NearCache.get(parish); if (!per) hd3NearCache.set(parish, (per = new Map()));
  const { cx, cz, key } = npChunkOf(x, z), k = `${key}|${skip}`;
  if (per.has(k)) return per.get(k);
  const keep = cwMassFilter(parish), rects = [];
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
    for (const spot of npMassingForChunk(parish, cx + dx, cz + dz)) {
      if (!keep(spot)) continue;
      const boxes = cwSpotBoxes(spot);
      if (boxes.length) for (const b of boxes) rects.push([b.min[0] - 2, b.min[2] - 2, b.max[0] + 2, b.max[2] + 2]);
      else rects.push([spot.x - 4, spot.z - 4, spot.x + 4, spot.z + 4]); // a tree crown
    }
  }
  (parish.sites ?? []).forEach((s, i) => {
    if (i === skip) return;
    try { const b = cwSiteBuilding(parish, i); rects.push([b.cx - b.w / 2 - 2, b.cz - b.d / 2 - 2, b.cx + b.w / 2 + 2, b.cz + b.d / 2 + 2]); } catch { /* none */ }
  });
  for (const r of hd3KitRects(parish)) if (Math.abs(r.x - x) < 300 && Math.abs(r.z - z) < 300) rects.push(r); // ENV-HD-6
  per.set(k, rects);
  return rects;
}
function hd3Clear(parish, x, z, m, skip) {
  const half = NP_SIZE / 2 - 30;
  if (Math.abs(x) > half || Math.abs(z) > half || npWaterAt(parish, x, z)) return false;
  const box = [x - m, z - m, x + m, z + m];
  return !hd3Obstacles(parish, x, z, skip).some((r) => hd3Hit(box, r));
}

/** The camera for one preset (see SEAMS), or null for a site or shot this module does not frame. */
export function hd3Scene(parish, siteId, shot = "wide") {
  const spec = HD3_SCENE_SITES.find((s) => s.id === siteId);
  if (!spec || !HD3_SHOTS.includes(shot) || parish?.id !== spec.parish) return null;
  const i = (parish.sites ?? []).findIndex((s) => s.id === siteId);
  if (i < 0) return null;
  const s = parish.sites[i], [sx, sz] = s.position, y = npHeightAt(parish, sx, sz);
  let b = null; try { b = cwSiteBuilding(parish, i); } catch { b = null; }
  // the subject: between the site's building and its job board (the board stands 6 m south of the site point)
  const tx = b ? (b.cx + sx) / 2 : sx, tz = b ? (b.cz + sz + 6) / 2 : sz + 3;
  // the road side: the bearing from the subject to the nearest street line (the side a learner walks up from)
  const near = cwNearestLine(parish, tx, tz, 800, (l) => l.cls !== "ferry");
  const a0 = near ? Math.atan2(near.px - tx, near.pz - tz) : Math.PI / 4;
  const out = (pos, ty, fov) => ({ siteId, shot, parish: parish.id, kind: spec.kind, label: spec.label, position: pos, target: [tx, ty, tz], fov });
  const bearings = [0.45, -0.45, 0.8, -0.8, 0, 1.2, -1.2, Math.PI - 0.6, Math.PI + 0.6];
  if (shot === "wide") {
    // the first spot with no building within ~18 m (nothing looms in the frame's near corners), else within ~12 m, else 7 m
    for (const m of [16, 10, 5]) for (const dist of [72, 62, 86]) for (const da of bearings) {
      const a = a0 + da, px = tx + Math.sin(a) * dist, pz = tz + Math.cos(a) * dist;
      if (!hd3Clear(parish, px, pz, m, i)) continue;
      return out([px, Math.max(y, npHeightAt(parish, px, pz)) + 26, pz], y + 3, 55);
    }
    return out([tx + Math.sin(a0 + 0.45) * 72, y + 30, tz + Math.cos(a0 + 0.45) * 72], y + 3, 55);
  }
  // street: eye height on the near sidewalk of the nearest street, a little along it for an oblique view of the building and
  // its board, with the near half of the sight line clear of massing; a street farther than 44 m: 34 m out on its side
  const ux = Math.sin(a0), uz = Math.cos(a0), vx = -uz, vz = ux;
  const hw = (near?.line?.width ?? 10) / 2, back = near && near.d <= 44 ? Math.max(14, near.d - hw - 1.9) : 34;
  // the site's own building counts here (skip -1): the subject sits beside it, so a line from the wrong side runs through it
  const cands = [];
  for (const lat of [11, -11, 17, -17, 5, -5, 0]) for (const extra of [0, -3, 3]) cands.push([tx + ux * (back + extra) + vx * lat, tz + uz * (back + extra) + vz * lat]);
  for (const dist of [28, 34, 24]) for (const da of bearings) cands.push([tx + Math.sin(a0 + da) * dist, tz + Math.cos(a0 + da) * dist]);
  // ENV-HD-5: a first pass keeps the camera 3.5 m clear of any building's grown footprint and 12 m from the site's own
  // building, so its wall does not fill the frame's near side (the hospital campus's camera stood 8.3 m from it); the old
  // 1.2 m pass is the fallback
  const ownD = (px, pz) => (b ? Math.hypot(Math.max(Math.abs(px - b.cx) - b.w / 2, 0), Math.max(Math.abs(pz - b.cz) - b.d / 2, 0)) : 99);
  for (const [m, own] of [[3.5, 12], [1.2, 0]]) for (const [px, pz] of cands) {
    if (ownD(px, pz) < own || !hd3Clear(parish, px, pz, m, -1)) continue;
    if (![0.2, 0.35, 0.5, 0.65].every((t) => hd3Clear(parish, px + (tx - px) * t, pz + (tz - pz) * t, 0.8, -1))) continue;
    return out([px, Math.max(y, npHeightAt(parish, px, pz)) + 1.7, pz], y + 3.2, 62);
  }
  const px = tx + ux * back, pz = tz + uz * back;
  return out([px, Math.max(y, npHeightAt(parish, px, pz)) + 1.7, pz], y + 3.2, 62);
}
