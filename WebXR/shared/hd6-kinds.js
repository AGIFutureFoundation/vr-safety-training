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
//   hd6KindSites(parish)              -> [{ index, id, kind, b, door, yaw }] the cued sites on this map (pure)
//   hd6CueParts(parish, site, tier)   -> [{ size: [w, h, d], at: [x, y, z], ry, colour }] world-space boxes (pure)
//   hd6LampParts(board)               -> the boxes of one board lamp's post (pure)
//   hd6Build({ THREE, parish, boards, tier, ua }) -> THREE.Mesh "hd6-kind-cues" | null (userData.hd6 = { sites, lamps, triangles })
//   hd6UltraShells({ THREE, parish, doc }) -> THREE.Mesh "hd6-ultra-kinds" | null (userData.hd6 = { atlasPx, textureBytes, triangles })

import { cwSiteBuilding, cwDoorOf } from "./cw-cityworks.js";
import { HD3_SCENE_SITES } from "./hd3-scenes.js";

export const HD6_KINDS = ["fire-station", "hospital", "school", "park"];
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
  kerb: 0xe2c44a, schoolCanopy: 0x2a9d8f, schoolPost: 0xe9c46a, fence: 0x3d6b4f, play: 0xb5654a, frameA: 0xe9c46a, frameB: 0x3a7bc8,
  timber: 0x7a5a3c, roof: 0x3f6e4a, gravel: 0xc8b68a, soil: 0x4a3a2a, shrub: 0x3c7a3a, shed: 0x8b7355, shedRoof: 0x55595e, lamp: 0x5c6167,
};

/** The cued sites on this map: the busiest site of each of the four kinds (ENV-HD-5's "kind" presets). */
export function hd6KindSites(parish) {
  const out = [];
  for (const spec of HD3_SCENE_SITES) {
    if (spec.by !== "kind" || spec.parish !== parish?.id || !HD6_KINDS.includes(spec.kind)) continue;
    const index = (parish.sites ?? []).findIndex((s) => s.id === spec.id);
    if (index < 0) continue;
    let b = null; try { b = cwSiteBuilding(parish, index); } catch { b = null; }
    if (!b) continue;
    const door = cwDoorOf(parish, b);
    const yaw = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[door.face] ?? 0;
    out.push({ index, id: spec.id, kind: spec.kind, b, door, yaw });
  }
  return out;
}

/** World-space boxes of one site's kind cue (local frame: +z out of the door face, x along it, y up from the ground). */
export function hd6CueParts(parish, site, tier = "high") {
  const { b, yaw, kind } = site, hi = tier === "high";
  const ns = Math.abs(Math.sin(yaw)) < 0.5, L2 = (ns ? b.w : b.d) / 2, D2 = (ns ? b.d : b.w) / 2, H = b.h;
  const cs = Math.cos(yaw), sn = Math.sin(yaw);
  // the board (6 m south of the site point) in the local frame: yards go on the side away from it
  const bx = site.b.site.position[0] - b.cx, bz = site.b.site.position[1] + 6 - b.cz;
  const boardLocalX = bx * cs - bz * sn;
  const side = boardLocalX > 0 ? -1 : 1;
  const parts = [];
  const box = (w, h, d, x, y, z, colour, ry = 0) => parts.push({ size: [w, h, d], local: [x, y, z], ry, colour });
  if (kind === "fire-station") {
    const bw = 3.4, bh = Math.min(4, H - 1.3), off = Math.max(2.9, L2 * 0.5);
    for (const sx of [-off, off]) {
      box(bw + 0.5, 0.35, 0.22, sx, bh + 0.17, D2 + 0.11, HD6_C.bayFrame); // header
      for (const jx of [-1, 1]) box(0.25, bh, 0.22, sx + jx * (bw / 2 + 0.12), bh / 2, D2 + 0.11, HD6_C.bayFrame); // jambs
      box(bw, bh, 0.1, sx, bh / 2, D2 + 0.06, HD6_C.bayPanel); // roll-up panel
      box(bw - 0.3, 0.45, 0.04, sx, bh * 0.68, D2 + 0.13, HD6_C.glass); // the glazed band
      if (hi) for (let k = 1; k <= 7; k++) if (Math.abs(k / 8 - 0.68) > 0.08) box(bw - 0.1, 0.05, 0.03, sx, (bh * k) / 8, D2 + 0.12, HD6_C.slat);
      box(bw + 0.8, 0.06, 5, sx, 0.03, D2 + 2.5, HD6_C.apron); // apron
    }
    box(2 * L2 + 0.3, 0.55, 0.16, 0, H - 0.45, D2 + 0.08, HD6_C.trim); // trim band under the roof edge
    // the hose-drying tower at a back corner, on the side away from the board
    const tx = side * (L2 - 1.6), tz = -D2 + 1.6, th = H + 7;
    box(3.2, th, 3.2, tx, th / 2, tz, HD6_C.tower);
    box(3.6, 0.35, 3.6, tx, th + 0.17, tz, HD6_C.towerCap);
    box(3.3, 0.8, 3.3, tx, th - 0.9, tz, HD6_C.glass); // a louvred band near the top
    if (hi) for (let k = 0; k < 3; k++) for (const [fx, fz, w, d] of [[0, 1.62, 0.3, 0.04], [1.62, 0, 0.04, 0.3]]) box(w, 1.2, d, tx + fx * side, H + 0.8 + k * 1.8, tz + fz, HD6_C.glass);
  } else if (kind === "hospital") {
    const cw = Math.min(9, 2 * L2 - 1), cy = 3.6;
    box(cw, 0.35, 6, 0, cy + 0.17, D2 + 3, HD6_C.canopy); // the canopy slab
    box(cw + 0.1, 0.5, 0.14, 0, cy + 0.1, D2 + 6.02, HD6_C.blue); // its fascia
    for (const px of [-cw / 2 + 0.4, cw / 2 - 0.4]) box(0.28, cy, 0.28, px, cy / 2, D2 + 5.6, HD6_C.post);
    // the "H" sign: a blue square standing on the canopy's front edge, a white letter on each face (boxes, no words)
    const sy = cy + 0.35 + 0.95;
    box(1.8, 1.8, 0.14, 0, sy, D2 + 5.75, HD6_C.blue);
    for (const fz of [0.09, -0.09]) {
      for (const lx of [-0.42, 0.42]) box(0.26, 1.25, 0.04, lx, sy, D2 + 5.75 + fz, HD6_C.white);
      box(0.6, 0.24, 0.04, 0, sy, D2 + 5.75 + fz, HD6_C.white);
    }
    box(0.18, 0.4, 0.18, 0, cy + 0.35 + 0.05, D2 + 5.75, HD6_C.post);
    // the drop-off lane under the canopy, with kerb lines
    box(Math.min(16, 2 * L2 + 4), 0.05, 4.4, 0, 0.03, D2 + 3.6, HD6_C.lane);
    if (hi) for (const kz of [D2 + 1.35, D2 + 5.85]) box(Math.min(16, 2 * L2 + 4), 0.06, 0.18, 0, 0.04, kz, HD6_C.kerb);
  } else if (kind === "school") {
    const cy = 3.0;
    box(5.2, 0.28, 3.4, 0, cy + 0.14, D2 + 1.7, HD6_C.schoolCanopy);
    box(5.3, 0.42, 0.12, 0, cy + 0.05, D2 + 3.42, HD6_C.schoolPost);
    for (const px of [-2.3, 2.3]) box(0.22, cy, 0.22, px, cy / 2, D2 + 3.1, HD6_C.schoolPost);
    // the play yard beside the building, on the side away from the board: fence (a gate gap on its road side), surface, frame
    const x0 = side > 0 ? L2 + 1.5 : -L2 - 11.5, x1 = x0 + 10, z0 = -D2, z1 = D2, fh = 1.8;
    box(10, 0.05, z1 - z0, (x0 + x1) / 2, 0.03, (z0 + z1) / 2, HD6_C.play);
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
    for (const [px, pz] of [[-1.5, -1], [1.5, -1], [-1.5, 1], [1.5, 1]]) box(0.12, 2.2, 0.12, fx + px, 1.1, fz + pz, HD6_C.frameA);
    for (const pz of [-1, 1]) box(3.1, 0.1, 0.1, fx, 2.2, fz + pz, HD6_C.frameB);
    if (hi) for (const px of [-1, -0.33, 0.33, 1]) box(0.08, 0.08, 2.1, fx + px * 1.5, 2.2, fz, HD6_C.frameB);
  } else if (kind === "park") {
    // the pavilion beside the building, on the side away from the board
    const px = side * (L2 + 5.5), pz = 0, pw = 6, pd = 4.6, ph = 2.7;
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.22, ph, 0.22, px + dx * (pw / 2 - 0.3), ph / 2, pz + dz * (pd / 2 - 0.3), HD6_C.timber);
    // the gable roof: two slabs pitched about the ridge (rotated about the pavilion's long axis by building them in pieces)
    const pitch = 0.5, half = pd / 2 + 0.4, rl = half / Math.cos(pitch);
    for (const s of [-1, 1]) parts.push({ size: [pw + 0.6, 0.16, rl], local: [px, ph + Math.sin(pitch) * half / 2 + 0.05, pz + s * half / 2], ry: 0, rx: s * pitch, colour: HD6_C.roof });
    box(2.2, 0.08, 0.8, px, 0.75, pz, HD6_C.timber); // picnic table
    for (const s of [-1, 1]) box(2.2, 0.06, 0.28, px, 0.45, pz + s * 0.7, HD6_C.timber);
    if (hi) for (const s of [-1, 1]) box(0.08, 0.72, 0.6, px + s * 0.9, 0.36, pz, HD6_C.timber);
    // gravel paths: from the door out toward the road, and along the front to the pavilion
    box(2, 0.05, 10, 0, 0.03, D2 + 5, HD6_C.gravel);
    box(Math.abs(px) + 1, 0.05, 1.8, px / 2, 0.035, D2 + 2, HD6_C.gravel);
    box(1.8, 0.05, Math.abs(D2 + 2 - pz) - pd / 2 + 1, px, 0.035, (D2 + 2 + pz + pd / 2) / 2, HD6_C.gravel);
    // a planting bed along the front, the board's side of the door
    const bedX = -side * (L2 * 0.5 + 1);
    box(5, 0.35, 1.4, bedX, 0.17, D2 + 1.2, HD6_C.soil);
    if (hi) for (let k = 0; k < 5; k++) box(0.6, 0.55, 0.6, bedX - 2 + k, 0.55, D2 + 1.2 + ((k % 2) - 0.5) * 0.4, HD6_C.shrub, k * 0.6);
    // a tool shed at the back corner on the pavilion's side
    const sx = side * (L2 + 2.2), sz = -D2 + 1.5;
    box(2.6, 2.2, 2.2, sx, 1.1, sz, HD6_C.shed);
    box(2.9, 0.12, 2.6, sx, 2.32, sz, HD6_C.shedRoof);
    if (hi) box(0.9, 1.8, 0.04, sx, 0.9, sz + 1.12, HD6_C.timber);
  }
  // to world space: rotate the local frame by the site's yaw about the building's centre
  return parts.map((p) => {
    const [lx, ly, lz] = p.local;
    return { size: p.size, at: [b.cx + lx * cs + lz * sn, b.y + ly, b.cz - lx * sn + lz * cs], ry: yaw + (p.ry ?? 0), rx: p.rx ?? 0, colour: p.colour };
  });
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

/** Bake boxes into one non-indexed, vertex-coloured geometry. */
function hd6Bake(THREE, parts) {
  const pos = [], col = [], c = new THREE.Color(), m4 = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
  for (const p of parts) {
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
  return geo;
}
const hd6Headset = (ua) => /OculusBrowser|PICO|Quest|Wolvic|Mobile VR/i.test(String(ua || ""));

/** The map's kind cues and board lamp posts as one mesh (see the header); null on the phone tier and in a headset browser. */
export function hd6Build({ THREE, parish, boards = [], tier = "high", ua = typeof navigator !== "undefined" ? navigator.userAgent : "" } = {}) {
  if (!THREE || !parish || (tier !== "high" && tier !== "balanced") || hd6Headset(ua)) return null;
  const parts = [], sites = [];
  for (const s of hd6KindSites(parish)) {
    const p = hd6CueParts(parish, s, tier);
    sites.push({ id: s.id, kind: s.kind, parts: p.length, triangles: p.length * 12 });
    parts.push(...p);
  }
  for (const bd of boards) parts.push(...hd6LampParts(bd));
  if (!parts.length) return null;
  const mesh = new THREE.Mesh(hd6Bake(THREE, parts), new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  mesh.name = "hd6-kind-cues"; mesh.matrixAutoUpdate = false;
  mesh.userData.hd6 = { tier, sites, lamps: boards.length, triangles: parts.length * 12 };
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
  const sites = hd6KindSites(parish);
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
