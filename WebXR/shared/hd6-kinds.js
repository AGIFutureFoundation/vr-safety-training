// ENV-HD-6 — buildings that read as their kind (console `hd6`, docs/consoles/ENV-HD-6.md).
// SmartCiti.X Powered by AGI Corp.
//
// The parish engine draws every catalog site as the same low box with a door (np-world.js "parish-site-buildings"), so
// ENV-HD-5's establishing shots of the busiest park, fire station, hospital and school read only as "a low building". This
// module adds a kind cue to the generic building at the busiest site of each of those four kinds (HD3_SCENE_SITES' "kind"
// entries), generic by kind and procedural:
//   - fire station: two apparatus-bay doors (framed roll-up panels with a glazed band) on the road face, a concrete apron
//     before each, a trim band under the roof edge and a hose-drying tower at a back corner;
//   - hospital: a covered drop-off canopy over the door on two posts, a drop-off lane with kerb lines, and a generic "H"
//     sign (white letter on a blue square, built from boxes; no protected emblem, no words);
//   - school: an entrance canopy on two posts, a fenced play yard beside the building (no flagpole), its play surface and a
//     climbing frame;
//   - park crew yard: an open pavilion with a gable roof and a picnic table, gravel paths, a planting bed and a tool shed.
// It also draws the post and arm of every site board's lamp (ATMOS's "site" lamp, a lit quad 6.5 m over the board that read
// as a bar floating in the sky at night): a pole beside the board, an arm, a lamp housing and a back plate.
// Everything is one merged, vertex-coloured mesh per map (one draw call, no texture, no light), on the desktop high tier and
// balanced only (balanced takes a lighter build); the phone tier and a standalone headset browser build nothing here.
// Nothing names a company, union or trade body, no words are drawn, nothing models a real building.
//
// Ultra (the opt-in desktop setting, hd4-ultra.js): the four kinds' hero buildings take a 2048 px canvas facade atlas (one
// 1024 px cell per kind: brick with bay-door bands, white panels with ribbon windows, buff brick with tall windows, timber
// boards), drawn on four side planes just proud of the walls — one more mesh, inside HD6_KIND_BUDGET.ultra.
//
// SEAMS (every top-level name is hd6/HD6_-prefixed: the bundler shares one scope; three.js comes from the caller):
//   HD6_KINDS                         ["fire-station", "hospital", "school", "park"]
//   HD6_KIND_BUDGET                   plain data: meshes per map and triangles per site by tier, the lamp posts, Ultra's atlas
//   hd6KindSites(parish)              -> [{ index, id, kind, b, door, yaw, hero }] ENV-HD-7: every site of the four kinds on
//                                       this map (the presets first, then by station count), not only the busiest (pure)
//   hd6HeroSites(parish)              -> the four presets' sites only (Ultra's facades stay on these)
//   hd6CueParts(parish, site, tier, side?, variant?) -> [{ size, at, ry, colour, group, glow }] world-space boxes (pure);
//                                       ENV-HD-8: variant "full" (default, unchanged), "small" or "back" (see HD6_SMALL, HD6_BACK)
//   hd6FitCue(parish, site, tier, taken?) -> { parts, skipped } ENV-HD-7: each part group (yard, pavilion, tower ...) placed
//                                       on its preferred side, else the other side, else skipped: never on a carriageway, in the
//                                       water, into another building or cue, or within 1.5 m of the board
//   hd6Obstacles(parish, site), hd6PartFault(parish, part, ctx), hd6Footprint(part)  the fitting's pieces (pure)
//   HD6_SMALL                         ENV-HD-8: the groups with a smaller variant (hd6CueParts(..., side, "small")), tried on both
//                                       sides after the full group and before skipping; hd6FitCue's result adds `small: [groups]`
//   hd6LampParts(board)               -> the boxes of one board lamp's post (pure)
//   hd6Build({ THREE, parish, boards, tier, ua }) -> THREE.Mesh "hd6-kind-cues" | null (userData.hd6 = { sites, lamps, triangles });
//                                       ENV-HD-9: each site record carries `footprint` [x0, z0, x1, z1] (its cue's ground bbox) or null
//   hd6UltraShells({ THREE, parish, doc }) -> THREE.Mesh "hd6-ultra-kinds" | null (userData.hd6 = { atlasPx, textureBytes, triangles })

import { cwSiteBuilding, cwDoorOf, cwMassFilter, cwSpotBoxes, cwNearestLine } from "./cw-cityworks.js";
import { npWaterAt, npChunkOf, npMassingForChunk } from "./np-parish.js";
import { HD3_SCENE_SITES } from "./hd3-scenes.js";

export const HD6_KINDS = ["fire-station", "hospital", "school", "park"];
/** ENV-HD-7: the next busiest kinds without a cue (catalog counts on the 46 maps: utility 36, substation 31; construction, the
 *  busiest, is the robot and crane sites' kind and has its own exteriors): a fenced equipment compound beside the building. */
export const HD6_MORE_KINDS = ["utility", "substation", "wetland", "workshop"];
/** ENV-HD-8: the kinds after utility and substation (catalog counts: wetland 24, workshop 23, port 22). Port is a robot kind
 *  (ROBO-EXTERIORS' port control tower at the port-automation robot site, fx-exteriors.js FX_SITE_KIND): the 22 catalog port
 *  sites are not robot sites (fxSitesFor lists RB_SITES only), but port is left to the robot exteriors this round. */
export const HD6_KIND_COUNTS = { wetland: 24, workshop: 23, port: 22 };
export const HD6_CUED_KINDS = [...HD6_KINDS, ...HD6_MORE_KINDS];
const hd6Bytes = (w, h = w) => Math.round(w * h * 4 * 4 / 3); // RGBA8 with a mip chain
/** The stated budget. The cue mesh is one per map; triangles are per cued site; the lamp posts are counted per board. */
export const HD6_KIND_BUDGET = {
  meshesPerMap: { low: 0, balanced: 1, high: 1 },
  trianglesPerSite: { low: 0, balanced: 1200, high: 3600 },
  lampTriangles: { low: 0, balanced: 48, high: 48 },
  lights: 0, textureBytes: 0,
  ultra: { meshesAdded: 1, atlasPx: 2048, textureBytes: 24 * 1024 * 1024, trianglesPerSite: 8 },
};
const HD6_C = {
  bayFrame: 0xa8322a, bayPanel: 0xd8dbdd, slat: 0x9aa0a6, glass: 0x2b3a46, apron: 0xb9b6ae, trim: 0xa8322a,
  tower: 0xbdb3a2, towerCap: 0x5c6167, canopy: 0xeef0f2, blue: 0x2f6db5, white: 0xf7f8f9, post: 0x8a9096, lane: 0x4a4d52,
  kerb: 0xe2c44a, chain: 0x8e959b, pad: 0xa9a59c, xfmr: 0x6f7f74, bushing: 0xc9c2b0, cabinet: 0xb8bcb4, pipe: 0x5b6f86, unit: 0x9aa0a6, schoolCanopy: 0x2a9d8f, schoolPost: 0xe9c46a, fence: 0x3d6b4f, play: 0xb5654a, frameA: 0xe9c46a, frameB: 0x3a7bc8,
  timber: 0x7a5a3c, roof: 0x3f6e4a, gravel: 0xc8b68a, soil: 0x4a3a2a, shrub: 0x3c7a3a, shed: 0x8b7355, shedRoof: 0x55595e, lamp: 0x5c6167,
  deck: 0x8a6a48, reed: 0x6f8f3a, reedTip: 0x9a8a50, gauge: 0xf2f2f2, gaugeBand: 0x2f6db5, louvre: 0x6b5238,
  roll: 0x9aa4ab, rollFrame: 0x4a5560, leanto: 0x5b6f86, bench: 0x7a5a3c, pallet: 0xb08a5a, vent: 0x9aa0a6,
};

/** The cued sites on this map. ENV-HD-6 cued the busiest site of each kind (ENV-HD-5's "kind" presets); ENV-HD-7 cues every
 *  site of the four kinds: the presets first (they keep their placements), then the rest by station count, then catalog order. */
const hd6SitesCache = new WeakMap();
export function hd6KindSites(parish) {
  if (!parish) return [];
  if (hd6SitesCache.has(parish)) return hd6SitesCache.get(parish);
  const heroes = new Set(HD3_SCENE_SITES.filter((x) => x.by === "kind" && x.parish === parish.id && HD6_KINDS.includes(x.kind)).map((x) => x.id));
  const out = [];
  (parish.sites ?? []).forEach((st, index) => {
    if (!HD6_CUED_KINDS.includes(st.kind)) return;
    let b = null; try { b = cwSiteBuilding(parish, index); } catch { b = null; }
    if (!b) return;
    const door = cwDoorOf(parish, b);
    const yaw = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[door.face] ?? 0;
    out.push({ index, id: st.id, kind: st.kind, b, door, yaw, hero: heroes.has(st.id), stations: (st.stations ?? []).length });
  });
  out.sort((a, c) => (c.hero - a.hero) || (c.stations - a.stations) || (a.index - c.index));
  hd6SitesCache.set(parish, out);
  return out;
}
/** The four presets' sites (ENV-HD-6's set): Ultra's facade atlas stays on these hero buildings. */
export function hd6HeroSites(parish) { return hd6KindSites(parish).filter((s) => s.hero); }

/** World-space boxes of one site's kind cue (local frame: +z out of the door face, x along it, y up from the ground). */
export function hd6CueParts(parish, site, tier = "high", sideOverride = 0, variant = "full") {
  const { b, yaw, kind } = site, hi = tier === "high", sm = variant === "small"; // ENV-HD-8: the smaller variant (HD6_SMALL)
  const ns = Math.abs(Math.sin(yaw)) < 0.5, L2 = (ns ? b.w : b.d) / 2, D2 = (ns ? b.d : b.w) / 2, H = b.h;
  const cs = Math.cos(yaw), sn = Math.sin(yaw);
  // the board (6 m south of the site point) in the local frame: yards go on the side away from it
  const bx = site.b.site.position[0] - b.cx, bz = site.b.site.position[1] + 6 - b.cz;
  const boardLocalX = bx * cs - bz * sn;
  const side = sideOverride || (boardLocalX > 0 ? -1 : 1);
  const parts = [];
  let group = "front", glow = false; // ENV-HD-7: each part carries its group (fitted or skipped together); glow = the lit sign
  const box = (w, h, d, x, y, z, colour, ry = 0) => parts.push({ size: [w, h, d], local: [x, y, z], ry, colour, group, glow });
  if (kind === "fire-station") {
    group = "bays";
    const bw = sm ? 3 : 3.4, bh = Math.min(4, H - 1.3), off = sm ? Math.min(Math.max(2.9, L2 * 0.5), Math.max(1.8, L2 - bw / 2 - 0.3)) : Math.max(2.9, L2 * 0.5), ad = sm ? 2.2 : 5;
    for (const sx of [-off, off]) {
      box(bw + 0.5, 0.35, 0.22, sx, bh + 0.17, D2 + 0.11, HD6_C.bayFrame); // header
      for (const jx of [-1, 1]) box(0.25, bh, 0.22, sx + jx * (bw / 2 + 0.12), bh / 2, D2 + 0.11, HD6_C.bayFrame); // jambs
      box(bw, bh, 0.1, sx, bh / 2, D2 + 0.06, HD6_C.bayPanel); // roll-up panel
      box(bw - 0.3, 0.45, 0.04, sx, bh * 0.68, D2 + 0.13, HD6_C.glass); // the glazed band
      if (hi) for (let k = 1; k <= 7; k++) if (Math.abs(k / 8 - 0.68) > 0.08) box(bw - 0.1, 0.05, 0.03, sx, (bh * k) / 8, D2 + 0.12, HD6_C.slat);
      box(bw + 0.8, 0.06, ad, sx, 0.03, D2 + ad / 2, HD6_C.apron); // apron (ENV-HD-8: 2.2 m deep in the smaller variant)
    }
    // ENV-HD-8: where the bays cannot fit (the building stands at the carriageway's edge, so even the doors' frames meet it), the
    // bay doors go flush on the wall with no apron (on the building itself, as the trim is): a fallback, built only then
    group = "baydoors";
    {
      const dw = 3, doff = Math.min(Math.max(2.9, L2 * 0.5), Math.max(1.8, L2 - dw / 2 - 0.3));
      for (const sx of [-doff, doff]) {
        box(dw + 0.4, 0.3, 0.12, sx, bh + 0.15, D2 + 0.06, HD6_C.bayFrame);
        for (const jx of [-1, 1]) box(0.2, bh, 0.12, sx + jx * (dw / 2 + 0.1), bh / 2, D2 + 0.06, HD6_C.bayFrame);
        box(dw, bh, 0.06, sx, bh / 2, D2 + 0.03, HD6_C.bayPanel);
        box(dw - 0.3, 0.45, 0.03, sx, bh * 0.68, D2 + 0.08, HD6_C.glass);
      }
    }
    group = "trim";
    box(2 * L2 + 0.3, 0.55, 0.16, 0, H - 0.45, D2 + 0.08, HD6_C.trim); // trim band under the roof edge
    group = "tower";
    // the hose-drying tower at a back corner, on the side away from the board
    const tx = side * (L2 - 1.6), tz = -D2 + 1.6, th = H + 7;
    box(3.2, th, 3.2, tx, th / 2, tz, HD6_C.tower);
    box(3.6, 0.35, 3.6, tx, th + 0.17, tz, HD6_C.towerCap);
    box(3.3, 0.8, 3.3, tx, th - 0.9, tz, HD6_C.glass); // a louvred band near the top
    if (hi) for (let k = 0; k < 3; k++) for (const [fx, fz, w, d] of [[0, 1.62, 0.3, 0.04], [1.62, 0, 0.04, 0.3]]) box(w, 1.2, d, tx + fx * side, H + 0.8 + k * 1.8, tz + fz, HD6_C.glass);
  } else if (kind === "hospital") {
    group = "canopy";
    // ENV-HD-8: the smaller variant is a 3.4 m deep porch canopy (a street close to the door), at most 6 m wide
    const cw = Math.min(sm ? 6 : 9, 2 * L2 - 1), cy = 3.6, cd = sm ? 3.4 : 6;
    box(cw, 0.35, cd, 0, cy + 0.17, D2 + cd / 2, HD6_C.canopy); // the canopy slab
    box(cw + 0.1, 0.5, 0.14, 0, cy + 0.1, D2 + cd + 0.02, HD6_C.blue); // its fascia
    for (const px of [-cw / 2 + 0.4, cw / 2 - 0.4]) box(0.28, cy, 0.28, px, cy / 2, D2 + cd - 0.4, HD6_C.post);
    // the "H" sign: a blue square standing on the canopy's front edge, a white letter on each face (boxes, no words)
    // ENV-HD-7: the square and the letter are the lit sign (glow: drawn unlit, so it reads at night with no light)
    const sy = cy + 0.35 + 0.95;
    glow = true;
    const sz = D2 + cd - 0.25;
    box(1.8, 1.8, 0.14, 0, sy, sz, HD6_C.blue);
    for (const fz of [0.09, -0.09]) {
      for (const lx of [-0.42, 0.42]) box(0.26, 1.25, 0.04, lx, sy, sz + fz, HD6_C.white);
      box(0.6, 0.24, 0.04, 0, sy, sz + fz, HD6_C.white);
    }
    glow = false;
    box(0.18, 0.4, 0.18, 0, cy + 0.35 + 0.05, sz, HD6_C.post);
    group = "lane";
    // the drop-off lane under the canopy, with kerb lines
    // ENV-HD-8: the smaller variant is a short pull-in, 2.6 m deep and at most 10 m long, by the door
    const lw = Math.min(sm ? 10 : 16, 2 * L2 + (sm ? 1 : 4)), ld = sm ? 2.6 : 4.4, lz = sm ? D2 + 1.5 : D2 + 3.6;
    box(lw, 0.05, ld, 0, 0.03, lz, HD6_C.lane);
    if (hi) for (const kz of sm ? [lz - ld / 2 - 0.05, lz + ld / 2 + 0.05] : [D2 + 1.35, D2 + 5.85]) box(lw, 0.06, 0.18, 0, 0.04, kz, HD6_C.kerb);
    // ENV-HD-7: where the canopy cannot fit (a street close to the door), the H sign goes on the wall over the door instead
    group = "wallsign"; glow = true;
    const wy = Math.min(H - 1.1, 4.4);
    box(1.6, 1.6, 0.1, 0, wy, D2 + 0.06, HD6_C.blue);
    for (const lx of [-0.37, 0.37]) box(0.23, 1.1, 0.04, lx, wy, D2 + 0.13, HD6_C.white);
    box(0.52, 0.21, 0.04, 0, wy, D2 + 0.13, HD6_C.white);
    glow = false;
  } else if (kind === "school") {
    group = "canopy";
    const cy = 3.0, scw = sm ? 3.6 : 5.2, scd = sm ? 2 : 3.4; // ENV-HD-8: the smaller canopy is 3.6 x 2 m
    box(scw, 0.28, scd, 0, cy + 0.14, D2 + scd / 2, HD6_C.schoolCanopy);
    box(scw + 0.1, 0.42, 0.12, 0, cy + 0.05, D2 + scd + 0.02, HD6_C.schoolPost);
    for (const px of [-(scw / 2 - 0.3), scw / 2 - 0.3]) box(0.22, cy, 0.22, px, cy / 2, D2 + scd - 0.3, HD6_C.schoolPost);
    // the play yard beside the building, on the side away from the board: fence (a gate gap on its road side), surface, frame
    // ENV-HD-7: where the canopy cannot fit, a teal entrance surround (two pilasters and a lintel band) frames the door instead
    group = "entry";
    for (const px of [-1.3, 1.3]) box(0.4, Math.min(3.2, H - 0.4), 0.12, px, Math.min(3.2, H - 0.4) / 2, D2 + 0.06, HD6_C.schoolCanopy);
    box(3.0, 0.42, 0.12, 0, Math.min(3.2, H - 0.4) + 0.2, D2 + 0.06, HD6_C.schoolPost);
    group = "yard";
    // ENV-HD-8: the smaller yard is 7 m wide and at most 8 m deep, at the back
    const yw = sm ? 7 : 10, x0 = side > 0 ? L2 + 1.5 : -L2 - 1.5 - yw, x1 = x0 + yw, z0 = -D2, z1 = sm ? Math.min(D2, -D2 + 8) : D2, fh = 1.8;
    box(yw, 0.05, z1 - z0, (x0 + x1) / 2, 0.03, (z0 + z1) / 2, HD6_C.play);
    const run = (ax, az, bx2, bz2, gap = false) => {
      const len = Math.hypot(bx2 - ax, bz2 - az), n = Math.max(2, Math.round(len / 2.5)), alongX = Math.abs(bx2 - ax) > Math.abs(bz2 - az);
      for (let k = 0; k <= n; k++) { const t = k / n; box(0.1, fh, 0.1, ax + (bx2 - ax) * t, fh / 2, az + (bz2 - az) * t, HD6_C.fence); }
      const segs = gap ? [[0, 0.4], [0.6, 1]] : [[0, 1]];
      for (const [t0, t1] of segs) {
        const mx = ax + (bx2 - ax) * (t0 + t1) / 2, mz = az + (bz2 - az) * (t0 + t1) / 2, l = len * (t1 - t0);
        for (const ry of hi ? [fh - 0.05, fh / 2, 0.15] : [fh - 0.05, 0.15]) box(alongX ? l : 0.05, 0.05, alongX ? 0.05 : l, mx, ry, mz, HD6_C.fence);
        if (hi) { const m = Math.round(l / 0.35); for (let k = 1; k < m; k++) { const t = t0 + ((t1 - t0) * k) / m; box(0.03, fh - 0.2, 0.03, ax + (bx2 - ax) * t, fh / 2, az + (bz2 - az) * t, HD6_C.fence); } }
      }
    };
    run(x0, z1, x1, z1, true); run(x0, z0, x1, z0); run(side > 0 ? x1 : x0, z0, side > 0 ? x1 : x0, z1);
    const fx = (x0 + x1) / 2, fz = (z0 + z1) / 2;
    for (const [px, pz] of [[-1.5, -1], [1.5, -1], [-1.5, 1], [1.5, 1]]) box(0.12, 2.2, 0.12, fx + px, 1.1, fz + (sm ? Math.min(1, (z1 - z0) / 2 - 0.6) : 1) * pz, HD6_C.frameA);
    for (const pz of [-1, 1]) box(3.1, 0.1, 0.1, fx, 2.2, fz + (sm ? Math.min(1, (z1 - z0) / 2 - 0.6) : 1) * pz, HD6_C.frameB);
    if (hi) for (const px of [-1, -0.33, 0.33, 1]) box(0.08, 0.08, 2.1, fx + px * 1.5, 2.2, fz, HD6_C.frameB);
  } else if (kind === "utility" || kind === "substation") {
    // ENV-HD-7: a fenced equipment compound beside the building (side away from the board): a gravel pad, a chain-link fence
    // with a gate gap on its road side, and the kind's plant — three transformers with bushings (substation) or two cabinets
    // and a pipe rack (utility); a rooftop unit on the building. Generic by kind; no signs, no words.
    group = "compound";
    // ENV-HD-8: the smaller compound is 8 x 8 m with two transformers (substation) or one cabinet and a short rack (utility)
    const cw = sm ? 8 : 12, x0 = side > 0 ? L2 + 1.5 : -L2 - 1.5 - cw, x1 = x0 + cw, z0 = -D2, z1 = Math.min(D2, -D2 + (sm ? 8 : 12)), fh = 2.2;
    box(cw, 0.06, z1 - z0, (x0 + x1) / 2, 0.03, (z0 + z1) / 2, HD6_C.pad);
    const fence = (ax, az, bx2, bz2, gap) => {
      const len = Math.hypot(bx2 - ax, bz2 - az), n = Math.max(2, Math.round(len / 3)), alongX = Math.abs(bx2 - ax) > Math.abs(bz2 - az);
      for (let k = 0; k <= n; k++) { const t = k / n; if (gap && t > 0.38 && t < 0.62) continue; box(0.1, fh, 0.1, ax + (bx2 - ax) * t, fh / 2, az + (bz2 - az) * t, HD6_C.chain); }
      for (const [t0, t1] of gap ? [[0, 0.4], [0.6, 1]] : [[0, 1]]) {
        const mx = ax + (bx2 - ax) * (t0 + t1) / 2, mz = az + (bz2 - az) * (t0 + t1) / 2, l = len * (t1 - t0);
        box(alongX ? l : 0.04, hi ? fh - 0.25 : 0.06, alongX ? 0.04 : l, mx, hi ? fh / 2 : fh - 0.05, mz, HD6_C.chain); // the mesh as a thin panel on high, a top rail on balanced
      }
    };
    fence(x0, z1, x1, z1, true); fence(x0, z0, x1, z0, false); fence(x0, z0, x0, z1, false); fence(x1, z0, x1, z1, false);
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    if (kind === "substation") {
      for (const dx of sm ? [-1.8, 1.8] : [-3.5, 0, 3.5]) {
        box(2, 2.2, 1.6, mx + dx, 1.1, mz, HD6_C.xfmr);
        if (hi) for (const bx2 of [-0.6, 0, 0.6]) box(0.18, 0.7, 0.18, mx + dx + bx2, 2.55, mz, HD6_C.bushing);
        if (hi) box(0.1, 1.8, 1.7, mx + dx + 1.05, 1.1, mz, HD6_C.xfmr); // cooling fins
      }
    } else {
      for (const dx of sm ? [-2] : [-3.6, -1.4]) box(1.6, 1.9, 0.9, mx + dx, 0.95, mz - 1.5, HD6_C.cabinet);
      const rl = sm ? 4 : 6, rx = sm ? 0.6 : 1.6;
      for (const py of [1.2, 1.9]) box(rl, 0.32, 0.32, mx + rx, py, mz + 1.2, HD6_C.pipe); // a pipe rack
      for (const dx of sm ? [rx - rl / 2 + 0.2, rx + rl / 2 - 0.2] : [-1.2, 4.2]) box(0.2, 2.2, 0.8, mx + dx, 1.1, mz + 1.2, HD6_C.chain);
    }
    group = "roof";
    box(Math.min(3, L2), 1.1, Math.min(2.2, D2), 0, H + 0.55, -D2 * 0.3, HD6_C.unit); // a rooftop unit
  } else if (kind === "wetland") {
    // ENV-HD-8: a wetland field station: a timber viewing deck on posts with a rail beside the building (side away from the
    // board), reed clumps along the deck's outer edge, a water-level gauge post (white with blue bands, no numbers), and a
    // timber fascia with a louvred screen on the door face. Generic by kind; no signs, no words.
    group = "deck";
    const dw = sm ? 5 : 8, dd = sm ? 3.5 : 5, dx0 = side * (L2 + 1.2 + dw / 2), dh = 0.6;
    box(dw, 0.12, dd, dx0, dh, 0, HD6_C.deck);
    for (const [ax, az] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1]]) box(0.18, dh, 0.18, dx0 + ax * (dw / 2 - 0.2), dh / 2, az * (dd / 2 - 0.2), HD6_C.deck);
    box(dw, 0.08, 0.08, dx0, dh + 1, dd / 2 - 0.05, HD6_C.deck); // rails on three sides (open to the building)
    box(dw, 0.08, 0.08, dx0, dh + 1, -dd / 2 + 0.05, HD6_C.deck);
    box(0.08, 0.08, dd, dx0 + side * (dw / 2 - 0.05), dh + 1, 0, HD6_C.deck);
    if (hi) for (let k = 0; k <= 4; k++) for (const rz of [dd / 2 - 0.05, -dd / 2 + 0.05]) box(0.08, 1, 0.08, dx0 - dw / 2 + (dw * k) / 4, dh + 0.5, rz, HD6_C.deck);
    box(1.2, 0.3, 1.6, side * (L2 + 0.6), dh / 2, 0, HD6_C.deck); // a step up from the ground at the wall
    group = "reeds";
    const rx = dx0 + side * (dw / 2 + 0.8), n = sm ? 4 : hi ? 9 : 5;
    for (let k = 0; k < n; k++) {
      const z = -dd / 2 + (dd * (k + 0.5)) / n, h = 1.1 + ((k * 37) % 5) * 0.12;
      box(0.5, h, 0.4, rx + ((k % 2) - 0.5) * 0.4, h / 2, z, HD6_C.reed, k * 0.5);
      if (hi) box(0.12, 0.3, 0.12, rx + ((k % 2) - 0.5) * 0.4, h + 0.15, z, HD6_C.reedTip);
    }
    group = "gauge";
    const gx = dx0 + side * (dw / 2 - 0.6), gz = dd / 2 + 0.9;
    box(0.2, 2.4, 0.08, gx, 1.2, gz, HD6_C.gauge);
    for (let k = 0; k < (hi ? 6 : 3); k++) box(0.22, 0.12, 0.09, gx, 0.3 + k * (hi ? 0.36 : 0.72), gz, HD6_C.gaugeBand);
    group = "trim";
    box(2 * L2 + 0.3, 0.45, 0.14, 0, H - 0.4, D2 + 0.07, HD6_C.louvre); // the timber fascia
    const lw = Math.min(4, L2 - 1.5), lx = -side * (L2 - lw / 2 - 0.6);
    for (let k = 0; k < (hi ? 8 : 4); k++) box(lw, 0.08, 0.1, lx, 1 + k * (hi ? 0.28 : 0.56), D2 + 0.05, HD6_C.louvre); // a louvred screen
  } else if (kind === "workshop") {
    // ENV-HD-8: a workshop: a wide roll-up door flush on the door face (beside the door), a lean-to canopy on posts over a work
    // yard with a workbench on the side away from the board, a stack of pallets and timber, and two roof vents. Generic by
    // kind; no signs, no words.
    group = "rolldoor";
    const rw = Math.min(4.2, L2 - 1.4), rh = Math.min(3.8, H - 1), rxc = side * Math.max(rw / 2 + 1.4, L2 * 0.45);
    box(rw + 0.4, 0.3, 0.12, rxc, rh + 0.15, D2 + 0.06, HD6_C.rollFrame);
    for (const jx of [-1, 1]) box(0.2, rh, 0.12, rxc + jx * (rw / 2 + 0.1), rh / 2, D2 + 0.06, HD6_C.rollFrame);
    box(rw, rh, 0.06, rxc, rh / 2, D2 + 0.03, HD6_C.roll);
    if (hi) for (let k = 1; k <= 9; k++) box(rw - 0.05, 0.04, 0.03, rxc, (rh * k) / 10, D2 + 0.08, HD6_C.rollFrame);
    group = "leanto";
    const ld = sm ? 3 : 4.5, ll = sm ? 2 * D2 * 0.5 : 2 * D2 * 0.8, lx0 = side * (L2 + ld / 2), lh = Math.min(3.2, H - 0.3);
    box(ld + 0.3, 0.14, ll, lx0, lh, 0, HD6_C.leanto, 0); // the roof slab (flat, a slight fall is not modelled)
    for (const pz of [-ll / 2 + 0.3, ll / 2 - 0.3]) box(0.18, lh, 0.18, side * (L2 + ld - 0.2), lh / 2, pz, HD6_C.rollFrame);
    box(sm ? 1.6 : 2.4, 0.9, 0.7, side * (L2 + 0.6), 0.45, 0, HD6_C.bench); // a workbench against the wall
    if (hi) box(sm ? 1.6 : 2.4, 0.06, 0.8, side * (L2 + 0.6), 0.93, 0, HD6_C.rollFrame);
    group = "stack";
    const sxs = side * (L2 + (sm ? 3 : 4.5) + 1.6), szs = -D2 + 1.2;
    for (let k = 0; k < (hi ? 4 : 2); k++) box(1.2, 0.14, 1.0, sxs, 0.07 + k * 0.16, szs, HD6_C.pallet);
    for (let k = 0; k < (hi ? 3 : 1); k++) box(0.25, 0.25, 3, sxs + 1.0 + k * 0.28, 0.13, szs + 0.9, HD6_C.timber);
    group = "roof";
    for (const vx of [-L2 * 0.4, L2 * 0.4]) { box(0.8, 0.6, 0.8, vx, H + 0.3, -D2 * 0.3, HD6_C.vent); if (hi) box(1, 0.1, 1, vx, H + 0.65, -D2 * 0.3, HD6_C.rollFrame); }
  } else if (kind === "park") {
    // the pavilion beside the building, on the side away from the board
    group = "pavilion";
    // ENV-HD-8: the smaller pavilion is 4 x 3.4 m, 3.6 m from the wall (a tight lot)
    // and the "back" variant stands the small pavilion behind the building (a street along the side), a short path from the
    // back wall
    const back = variant === "back", small = sm || back;
    const px = back ? 0 : side * (L2 + (sm ? 3.6 : 5.5)), pz = back ? -(D2 + 3.2) : 0, pw = small ? 4 : 6, pd = small ? 3.4 : 4.6, ph = small ? 2.5 : 2.7;
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.22, ph, 0.22, px + dx * (pw / 2 - 0.3), ph / 2, pz + dz * (pd / 2 - 0.3), HD6_C.timber);
    // the gable roof: two slabs pitched about the ridge (rotated about the pavilion's long axis by building them in pieces)
    const pitch = 0.5, half = pd / 2 + 0.4, rl = half / Math.cos(pitch);
    for (const s of [-1, 1]) parts.push({ size: [pw + 0.6, 0.16, rl], local: [px, ph + Math.sin(pitch) * half / 2 + 0.05, pz + s * half / 2], ry: 0, rx: s * pitch, colour: HD6_C.roof, group, glow });
    const tl = small ? 1.6 : 2.2;
    box(tl, 0.08, 0.8, px, 0.75, pz, HD6_C.timber); // picnic table
    for (const s of [-1, 1]) box(tl, 0.06, 0.28, px, 0.45, pz + s * 0.7, HD6_C.timber);
    if (hi) for (const s of [-1, 1]) box(0.08, 0.72, 0.6, px + s * (small ? 0.6 : 0.9), 0.36, pz, HD6_C.timber);
    // gravel paths: from the door out toward the road, and along the front to the pavilion
    group = "path";
    const pl = sm ? 4 : 10, pfz = sm ? D2 + 1.4 : D2 + 2, pfw = sm ? 1.2 : 1.8; // ENV-HD-8: the smaller path is a 4 m stub
    box(sm ? 1.4 : 2, 0.05, pl, 0, 0.03, D2 + pl / 2, HD6_C.gravel);
    group = "pavilion";
    if (back) {
      box(1.2, 0.05, 1.5, 0, 0.035, -D2 - 0.75, HD6_C.gravel); // a short path from the back wall to the pavilion
    } else {
      box(Math.abs(px) + 1, 0.05, pfw, px / 2, 0.035, pfz, HD6_C.gravel);
      box(pfw, 0.05, Math.abs(pfz - pz) - pd / 2 + 1, px, 0.035, (pfz + pz + pd / 2) / 2, HD6_C.gravel);
    }
    // a planting bed along the front, the board's side of the door
    group = "bed";
    // ENV-HD-8: the smaller bed is 3 x 0.9 m against the wall, three shrubs
    // and the "back" variant lays the small bed along a side wall (the street at the door)
    if (back) {
      const sxw = side * (L2 + 0.55);
      box(0.9, 0.35, 3, sxw, 0.17, 0, HD6_C.soil);
      if (hi) for (let k = 0; k < 3; k++) box(0.6, 0.55, 0.6, sxw + ((k % 2) - 0.5) * 0.2, 0.55, k - 1, HD6_C.shrub, k * 0.6);
    } else {
      const bedX = -side * (L2 * 0.5 + 1), bl = sm ? 3 : 5, bd = sm ? 0.9 : 1.4, bz = sm ? D2 + 0.55 : D2 + 1.2;
      box(bl, 0.35, bd, bedX, 0.17, bz, HD6_C.soil);
      if (hi) for (let k = 0; k < bl; k++) box(0.6, 0.55, 0.6, bedX - (bl - 1) / 2 + k, 0.55, bz + ((k % 2) - 0.5) * (sm ? 0.2 : 0.4), HD6_C.shrub, k * 0.6);
    }
    // a tool shed at the back corner on the pavilion's side
    group = "shed";
    const shw = sm ? 1.8 : 2.6, shd = sm ? 1.6 : 2.2, sx = side * (L2 + 0.9 + shw / 2), sz = sm ? -D2 + 0.3 + shd / 2 : -D2 + 1.5; // ENV-HD-8: smaller 1.8 x 1.6 m
    box(shw, 2.2, shd, sx, 1.1, sz, HD6_C.shed);
    box(sm ? 2.1 : 2.9, 0.12, sm ? 2 : 2.6, sx, 2.32, sz, HD6_C.shedRoof);
    if (hi) box(0.9, 1.8, 0.04, sx, 0.9, sz + (sm ? 0.82 : 1.12), HD6_C.timber);
    // the crew house itself: a green gable roof over the box (ridge along the long face), stepped timber gable ends and
    // corner boards, so the building reads as a park building from every side (the street camera may face its back)
    group = "roof";
    const rp = 0.42, rh = D2 + 0.5, rise = Math.tan(rp) * D2;
    for (const s of [-1, 1]) parts.push({ size: [2 * L2 + 0.9, 0.2, rh / Math.cos(rp)], local: [0, H + Math.tan(rp) * rh / 2, s * rh / 2], ry: 0, rx: s * rp, colour: HD6_C.roof, group, glow });
    for (const ex of [-L2 - 0.05, L2 + 0.05]) for (let k = 0; k < 3; k++) box(0.12, rise / 3, 2 * D2 * (1 - (k + 0.5) / 3), ex, H + (rise * (k + 0.5)) / 3, 0, HD6_C.timber);
    if (hi) for (const [ex, ez] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.32, H, 0.32, ex * (L2 + 0.06), H / 2, ez * (D2 + 0.06), HD6_C.timber);
  }
  // to world space: rotate the local frame by the site's yaw about the building's centre
  return parts.map((p) => {
    const [lx, ly, lz] = p.local;
    return { size: p.size, at: [b.cx + lx * cs + lz * sn, b.y + ly, b.cz - lx * sn + lz * cs], ry: yaw + (p.ry ?? 0), rx: p.rx ?? 0, colour: p.colour, group: p.group, glow: !!p.glow };
  });
}

// ------------------------------------------------------------------------------------------------ ENV-HD-7: fitting
/** A part's ground rectangle (a rotated box's corners), [x0, z0, x1, z1]. */
export function hd6Footprint(part) {
  const [w, , d] = part.size, c = Math.cos(part.ry), s = Math.sin(part.ry), xs = [], zs = [];
  for (const [u, v] of [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]) { xs.push(part.at[0] + u * c + v * s); zs.push(part.at[2] - u * s + v * c); }
  return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
}
const hd6Hit = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
/** The boxes a site's cue keeps clear of: the other catalog sites' buildings and the massing in the 3 x 3 chunks round it. */
export function hd6Obstacles(parish, site) {
  const out = [];
  (parish.sites ?? []).forEach((_, i) => { if (i === site.index) return; try { const o = cwSiteBuilding(parish, i); out.push([o.cx - o.w / 2, o.cz - o.d / 2, o.cx + o.w / 2, o.cz + o.d / 2]); } catch { /* none */ } });
  const { cx, cz } = npChunkOf(site.b.cx, site.b.cz), keep = cwMassFilter(parish);
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (const m of npMassingForChunk(parish, cx + dx, cz + dz)) if (keep(m)) for (const bx of cwSpotBoxes(m)) out.push([bx.min[0], bx.min[2], bx.max[0], bx.max[2]]);
  return out;
}
/** Why a part may not stand where it is ("road" | "water" | "building" | "board" | "cue"), or null when it may. */
export function hd6PartFault(parish, part, ctx) {
  const f = hd6Footprint(part);
  for (const [x, z] of [[f[0], f[1]], [f[2], f[1]], [f[2], f[3]], [f[0], f[3]], [(f[0] + f[2]) / 2, (f[1] + f[3]) / 2]]) {
    const n = cwNearestLine(parish, x, z, 60, (l) => l.cls !== "ferry");
    if (n && n.d < (n.line.width ?? 10) / 2) return "road";
  }
  if (!ctx.wetOk && npWaterAt(parish, (f[0] + f[2]) / 2, (f[1] + f[3]) / 2)) return "water"; // ENV-HD-8: HD6_WET groups may
  if (ctx.obstacles.some((o) => hd6Hit(f, o))) return "building";
  const [bx, bz] = ctx.board;
  if (hd6Hit(f, [bx - 1.3 - 1.5, bz - 0.1 - 1.5, bx + 1.3 + 1.5, bz + 0.1 + 1.5])) return "board";
  if ((ctx.taken ?? []).some((o) => hd6Hit(f, o))) return "cue";
  return null;
}
/** The side (+1 / -1 along the door face) the side-dependent groups prefer: away from the board (ENV-HD-6's rule). */
function hd6PreferredSide(parish, site) {
  const { b, yaw } = site, cs = Math.cos(yaw), sn = Math.sin(yaw);
  const bx = b.site.position[0] - b.cx, bz = b.site.position[1] + 6 - b.cz;
  return bx * cs - bz * sn > 0 ? -1 : 1;
}
/** ENV-HD-8: the wetland's deck (on posts), reeds and gauge post may stand in the water (a marsh is where they belong; 13 of
 *  the 24 wetland sites' buildings stand in it): exempt from the water test only, never from road, building, board or cue. */
export const HD6_WET = ["deck", "reeds", "gauge"];
const HD6_FREE = ["yard", "pavilion", "shed", "bed", "compound", "deck", "reeds", "gauge", "leanto", "stack"]; // ENV-HD-8: + the next kinds
/** The groups that stand on or against the building itself (within 0.5 m of its walls): where the engine's building stands over
 *  water or at a carriageway's edge (a fort on a levee, a clinic on a narrow street), they may too, as the building does;
 *  the building is the engine's, not a cue's placement. */
export const HD6_ON_BUILDING = ["roof", "trim", "wallsign", "entry", "baydoors", "rolldoor"];
/** The fallback groups: each stands only where the group it replaces was skipped. ENV-HD-8 adds the fire station's wall-flush
 *  bay doors (no aprons) for the bays. */
export const HD6_FALLBACK = { wallsign: "canopy", entry: "canopy", baydoors: "bays" };
/** ENV-HD-8: the groups with a smaller variant, tried (preferred side, then the other) after the full group and before skipping
 *  it: 33 of 250 sites skipped a group on a tight lot (ENV-HD-7). */
export const HD6_SMALL = ["bays", "canopy", "lane", "yard", "compound", "pavilion", "path", "bed", "shed", "deck", "reeds", "leanto", "stack"];
/** ENV-HD-8: groups with a further variant after the small one (the park pavilion behind the building, the bed along a side). */
export const HD6_BACK = ["pavilion", "bed"];
/** One site's cue fitted to its ground (see SEAMS). `taken` collects the footprints of the cues already placed on the map. */
export function hd6FitCue(parish, site, tier = "high", taken = []) {
  const pref = hd6PreferredSide(parish, site);
  const first = hd6CueParts(parish, site, tier, pref), flipped = hd6CueParts(parish, site, tier, -pref);
  let smallSets = null, backSets = null; // built only when a group needs them (ENV-HD-8)
  const ctx = { obstacles: hd6Obstacles(parish, site), board: [site.b.site.position[0], site.b.site.position[1] + 6] };
  const parts = [], skipped = [], own = [], small = [];
  for (const g of [...new Set(first.map((p) => p.group))]) {
    // the fallbacks stand only where the canopy could not
    if (HD6_FALLBACK[g] && !skipped.includes(HD6_FALLBACK[g])) continue;
    let placed = null;
    const sets = [first, flipped];
    if (HD6_SMALL.includes(g)) sets.push(...(smallSets ??= [hd6CueParts(parish, site, tier, pref, "small"), hd6CueParts(parish, site, tier, -pref, "small")]));
    if (HD6_BACK.includes(g)) sets.push(...(backSets ??= [hd6CueParts(parish, site, tier, pref, "back"), hd6CueParts(parish, site, tier, -pref, "back")]));
    for (const set of sets) {
      // the free-standing groups (yard, pavilion, shed, bed) keep clear of each other; paths, lanes and roofs may meet them
      const ps = set.filter((p) => p.group === g), all = HD6_FREE.includes(g) ? [...taken, ...own] : taken;
      if (ps.length && ps.every((p) => { const f = hd6PartFault(parish, p, { ...ctx, taken: all, wetOk: site.kind === "wetland" && HD6_WET.includes(g) }); return !f || ((f === "water" || f === "road") && HD6_ON_BUILDING.includes(g)); })) { placed = ps; if (sets.indexOf(set) > 1) small.push(sets.indexOf(set) > 3 ? `${g} (back)` : g); break; }
    }
    if (!placed) { skipped.push(g); continue; }
    parts.push(...placed);
    if (HD6_FREE.includes(g)) for (const p of placed) own.push(hd6Footprint(p));
  }
  for (const p of parts) taken.push(hd6Footprint(p));
  return { parts, skipped, small };
}

/** One board lamp's post (world space): a pole beside the board, an arm, a lamp housing and a back plate behind the lit face.
 *  `board` is np-world's siteBoards entry ({ x, y, z }: the board's foot); ATMOS draws the lit face at y + 6.5. */
export function hd6LampParts(board) {
  const { x, y, z } = board, top = 6.95;
  return [
    { size: [0.16, top, 0.16], at: [x + 1.9, y + top / 2, z - 0.25], ry: 0, rx: 0, colour: HD6_C.lamp },
    { size: [1.95, 0.1, 0.1], at: [x + 0.95, y + top - 0.08, z - 0.25], ry: 0, rx: 0, colour: HD6_C.lamp },
    { size: [1.7, 0.2, 0.62], at: [x, y + 6.86, z - 0.02], ry: 0, rx: 0, colour: HD6_C.lamp },
    { size: [1.55, 0.56, 0.05], at: [x, y + 6.5, z - 0.3], ry: 0, rx: 0, colour: HD6_C.lamp },
  ];
}

/** Bake boxes into one non-indexed, vertex-coloured geometry (ENV-HD-7: the lit-sign parts last, as geometry group 1). */
function hd6Bake(THREE, parts) {
  const pos = [], col = [], c = new THREE.Color(), m4 = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
  const lit = parts.filter((p) => !p.glow), glowing = parts.filter((p) => p.glow);
  for (const p of [...lit, ...glowing]) {
    const g = new THREE.BoxGeometry(...p.size).toNonIndexed();
    e.set(p.rx ?? 0, p.ry ?? 0, 0, "YXZ"); q.setFromEuler(e);
    g.applyMatrix4(m4.compose(v.set(...p.at), q, one));
    c.set(p.colour);
    const a = g.attributes.position;
    for (let i = 0; i < a.count; i++) { pos.push(a.getX(i), a.getY(i), a.getZ(i)); col.push(c.r, c.g, c.b); }
    g.dispose();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  const n0 = lit.length * 36, n1 = glowing.length * 36;
  geo.addGroup(0, n0, 0);
  if (n1) geo.addGroup(n0, n1, 1);
  return geo;
}
const hd6Headset = (ua) => /OculusBrowser|PICO|Quest|Wolvic|Mobile VR/i.test(String(ua || ""));

/** The map's kind cues and board lamp posts as one mesh (see the header); null on the phone tier and in a headset browser. */
export function hd6Build({ THREE, parish, boards = [], tier = "high", ua = typeof navigator !== "undefined" ? navigator.userAgent : "" } = {}) {
  if (!THREE || !parish || (tier !== "high" && tier !== "balanced") || hd6Headset(ua)) return null;
  const parts = [], sites = [], taken = [];
  for (const s of hd6KindSites(parish)) {
    const fit = hd6FitCue(parish, s, tier, taken), { parts: p, skipped } = fit;
    // ENV-HD-9: the cue's ground footprint (the bbox of its parts, world x/z), so the street camera can count it as subject
    const fp = p.length ? p.map(hd6Footprint).reduce((a, r) => [Math.min(a[0], r[0]), Math.min(a[1], r[1]), Math.max(a[2], r[2]), Math.max(a[3], r[3])]) : null;
    sites.push({ id: s.id, kind: s.kind, hero: s.hero, parts: p.length, triangles: p.length * 12, skipped, small: fit.small, footprint: fp });
    parts.push(...p);
  }
  for (const bd of boards) parts.push(...hd6LampParts(bd));
  if (!parts.length) return null;
  // ENV-HD-7: two materials on one mesh: the lit parts (Lambert) and the hospital signs drawn unlit (MeshBasic, vertex
  // colours) so the H reads at night without a light. The second group costs one draw call on a map with a hospital sign;
  // no texture, no light, no extra triangles.
  const glowParts = parts.filter((p) => p.glow).length;
  const mats = [new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })];
  if (glowParts) mats.push(new THREE.MeshBasicMaterial({ vertexColors: true }));
  const mesh = new THREE.Mesh(hd6Bake(THREE, parts), glowParts ? mats : mats[0]);
  mesh.name = "hd6-kind-cues"; mesh.matrixAutoUpdate = false;
  mesh.userData.hd6 = { tier, sites, lamps: boards.length, triangles: parts.length * 12, signTriangles: glowParts * 12, drawCalls: glowParts ? 2 : 1 };
  return mesh;
}

// ------------------------------------------------------------------------------------------------ Ultra: the facade atlas

/** Paint one kind's 1024 px facade cell (procedural; no words, no logos). */
function hd6PaintCell(ctx, kind, x0, y0, n) {
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x0 + x, y0 + y, w, h); };
  const brick = (base, mortar, bw, bh) => {
    rect(0, 0, n, n, mortar);
    for (let r = 0, y = 0; y < n; r++, y += bh) for (let x = (r % 2) * -bw / 2; x < n; x += bw) {
      const k = ((r * 31 + Math.round(x) * 7) % 9) / 9;
      ctx.fillStyle = `rgb(${base[0] + k * 18 | 0},${base[1] + k * 10 | 0},${base[2] + k * 8 | 0})`;
      ctx.fillRect(x0 + Math.max(0, x) + 2, y0 + y + 2, Math.min(bw - 4, n - Math.max(0, x) - 2), bh - 4);
    }
  };
  const windowAt = (x, y, w, h, frame) => { rect(x - 6, y - 6, w + 12, h + 12, frame); rect(x, y, w, h, "#2b3a46"); rect(x, y, w * 0.45, h, "#3a5064"); rect(x + w / 2 - 3, y, 6, h, frame); };
  if (kind === "fire-station") {
    brick([150, 62, 48], "#8a7d70", 64, 24);
    rect(0, 40, n, 26, "#d8d2c4"); // a stone band under the parapet
    for (let i = 0; i < 4; i++) windowAt(80 + i * 240, 170, 120, 170, "#e8e2d4");
    rect(0, n - 60, n, 60, "#7a6e62"); // plinth
  } else if (kind === "hospital") {
    rect(0, 0, n, n, "#e9ebee");
    for (let y = 0; y < n; y += 128) rect(0, y, n, 3, "#c9ced4");
    for (let x = 0; x < n; x += 256) rect(x, 0, 3, n, "#c9ced4");
    for (const y of [150, 470]) { rect(0, y, n, 150, "#9fb1c2"); for (let x = 0; x < n; x += 128) rect(x, y, 8, 150, "#dfe3e8"); rect(0, y + 70, n, 6, "#dfe3e8"); }
    rect(0, 0, n, 40, "#2f6db5"); // a blue band under the parapet
    rect(0, n - 50, n, 50, "#b9bec4");
  } else if (kind === "school") {
    brick([196, 170, 120], "#a8a090", 64, 24);
    for (let i = 0; i < 5; i++) windowAt(56 + i * 196, 200, 110, 360, "#2a9d8f");
    rect(0, 120, n, 20, "#e9c46a");
    rect(0, n - 60, n, 60, "#8f8676");
  } else {
    rect(0, 0, n, n, "#7a5a3c");
    for (let x = 0; x < n; x += 32) { rect(x, 0, 4, n, "#5f452d"); rect(x + 10, 0, 2, n, "#86664a"); }
    for (let i = 0; i < 3; i++) windowAt(150 + i * 300, 260, 140, 140, "#e6dccb");
    rect(0, n - 50, n, 50, "#5a5048");
  }
}

/** Ultra only (the app calls it when Ultra is on): the four kinds' hero buildings in a 2048 px canvas facade atlas, drawn on
 *  four side planes 3 cm proud of each wall (no roof plane). One mesh, one texture; null without a canvas or a cued site. */
export function hd6UltraShells({ THREE, parish, doc = typeof document !== "undefined" ? document : null } = {}) {
  const sites = hd6HeroSites(parish);
  if (!THREE || !sites.length || !doc) return null;
  const px = HD6_KIND_BUDGET.ultra.atlasPx, cell = px / 2;
  const cvs = doc.createElement("canvas"); cvs.width = cvs.height = px;
  const ctx = cvs.getContext("2d"); if (!ctx) return null;
  const cellOf = (kind) => HD6_KINDS.indexOf(kind); // 0..3: a 2 x 2 grid
  for (const s of sites) { const k = cellOf(s.kind); hd6PaintCell(ctx, s.kind, (k % 2) * cell, Math.floor(k / 2) * cell, cell); }
  const pos = [], uv = [];
  for (const s of sites) {
    const { b } = s, k = cellOf(s.kind), u0 = (k % 2) / 2, v1 = 1 - Math.floor(k / 2) / 2, v0 = v1 - 0.5, hw = b.w / 2 + 0.03, hd = b.d / 2 + 0.03, y0 = b.y, y1 = b.y + b.h;
    // four walls, each wound outward: [ax, az, bx, bz] from left to right seen from outside
    for (const [ax, az, bx, bz] of [[-hw, hd, hw, hd], [hw, hd, hw, -hd], [hw, -hd, -hw, -hd], [-hw, -hd, -hw, hd]]) {
      const A = [b.cx + ax, b.cz + az], B = [b.cx + bx, b.cz + bz];
      pos.push(A[0], y0, A[1], B[0], y0, B[1], B[0], y1, B[1], A[0], y0, A[1], B[0], y1, B[1], A[0], y1, A[1]);
      uv.push(u0, v0, u0 + 0.5, v0, u0 + 0.5, v1, u0, v0, u0 + 0.5, v1, u0, v1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals(); geo.computeBoundingSphere();
  const tex = new THREE.CanvasTexture(cvs);
  if ("colorSpace" in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
  mesh.name = "hd6-ultra-kinds"; mesh.matrixAutoUpdate = false;
  mesh.userData.hd6 = { atlasPx: px, textureBytes: hd6Bytes(px), triangles: pos.length / 9, sites: sites.map((s) => s.kind) };
  return mesh;
}
