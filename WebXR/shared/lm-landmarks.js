// LANDMARKS — the procedural landmark kit (console `lm`, docs/consoles/LANDMARKS.md).
//
//   lmBuild(kind, { three, scale = 1, tier = "high", span, deck }) -> THREE.Group | null
//
// A registry of familiar Bay Area landmarks as SCHEMATIC SILHOUETTES: boxes, cylinders, cones and lathes, in kit metres chosen
// to read well in the stylised parish maps. Nothing here is measured, nothing is taken from drawings, and no shape claims to be
// accurate — a kit only makes a named place recognisable at a glance in a procedural world.
//
// Contract: y = 0 is the ground (the waterline for a bridge), the long axis of a bridge, shed or row runs along local +Z, the
// footprint is centred. Each kind is ONE mesh: its parts merged into one vertex-coloured geometry, or, where a part repeats (the
// row of houses, the cranes), one InstancedMesh. `tier: "low"` is the phone tier (fewer segments, fewer repeats). Nothing moves,
// so the kit is still under reduced motion. Bridge kinds take `span` (the distance between towers) and `deck` (the deck height
// over the water) so the engine can fit them to a map's bridge road. Every top-level name is prefixed lm/LM_ (one bundle scope);
// three.js comes from the caller as `three`.

const LM_C = {
  orange: 0xc0452f, grey: 0x9aa3ab, pale: 0xd9dde0, cream: 0xe6dcc6, stone: 0xcfc6b2, white: 0xefeee9, dark: 0x3b4046,
  glass: 0x33414d, roof: 0x5d5f63, red: 0x8e2a24, wood: 0x7a6146, rail: 0x6c7075, pile: 0x5e5244, crane: 0xc9d3db, green: 0x4d7a52,
};

/** Per-kind budgets: meshes and triangles on the desktop tier and the phone tier ("low"). tools/check_landmarks.mjs holds them. */
export const LM_BUDGET = {
  "golden-gate-bridge": { meshes: 1, high: 2600, low: 1300 },
  "bay-bridge-suspension": { meshes: 1, high: 2600, low: 1300 },
  "bay-bridge-east-tower": { meshes: 1, high: 1600, low: 900 },
  "coit-tower": { meshes: 1, high: 600, low: 300 },
  "transamerica-pyramid": { meshes: 1, high: 200, low: 120 },
  "ferry-building": { meshes: 1, high: 400, low: 260 },
  "painted-ladies": { meshes: 1, high: 900, low: 600 },
  "cable-car": { meshes: 1, high: 300, low: 200 },
  "cable-car-turntable": { meshes: 1, high: 500, low: 300 },
  "container-cranes": { meshes: 1, high: 1200, low: 500 },
  "lake-merritt-pergola": { meshes: 1, high: 1700, low: 600 },
  "victorian-house": { meshes: 1, high: 200, low: 150 },
  "wharf-pier-shed": { meshes: 1, high: 900, low: 400 },
  "lighthouse": { meshes: 1, high: 400, low: 200 },
  // LANDMARKS-2 (`lx`): set from the measured builds with a margin
  "truss-bridge": { meshes: 1, high: 1900, low: 900 },
  "church-towers": { meshes: 1, high: 220, low: 140 },
  "mission-church-front": { meshes: 1, high: 180, low: 120 },
  "windmill": { meshes: 1, high: 220, low: 140 },
  "glasshouse": { meshes: 1, high: 380, low: 240 },
  "rotunda-colonnade": { meshes: 1, high: 1300, low: 700 },
  "masonry-fort": { meshes: 1, high: 220, low: 180 },
  "lattice-mast": { meshes: 1, high: 760, low: 340 },
  "switchback-street": { meshes: 1, high: 420, low: 240 },
  "theatre-marquee": { meshes: 1, high: 140, low: 110 },
  "campanile": { meshes: 1, high: 200, low: 140 },
  "civic-tower": { meshes: 1, high: 280, low: 140 },
  "transit-station": { meshes: 1, high: 220, low: 150 },
  "memorial-plaza": { meshes: 1, high: 220, low: 110 },
  "canal-lock": { meshes: 1, high: 260, low: 120 },
  "levee-pump-station": { meshes: 1, high: 220, low: 140 },
  "marsh-boardwalk": { meshes: 1, high: 360, low: 200 },
  "tide-gate": { meshes: 1, high: 120, low: 60 },
  "shotgun-row": { meshes: 1, high: 520, low: 180 },
  "streetcar": { meshes: 1, high: 80, low: 60 },
  "gateway-arch": { meshes: 1, high: 160, low: 150 },
};

/** The registry's kind ids. */
export function lmKinds() { return Object.keys(LM_KINDS); }
/** Is `kind` a registry kind? */
export function lmHas(kind) { return typeof kind === "string" && Object.prototype.hasOwnProperty.call(LM_KINDS, kind); }
/** The kit kind a map landmark draws with: its `lm` field, else its `kind` when that is a registry kind, else null. */
export function lmKindOf(landmark) {
  if (!landmark) return null;
  if (lmHas(landmark.lm)) return landmark.lm;
  return lmHas(landmark.kind) ? landmark.kind : null;
}
/** Bridge kinds are fitted to a map's bridge road (the engine passes span and deck). */
export const LM_BRIDGES = new Set(["golden-gate-bridge", "bay-bridge-suspension", "bay-bridge-east-tower", "truss-bridge"]);

// ---- geometry helpers (a parts list: [geometry, colour, Matrix4?])
const lmMats = new WeakMap();
function lmMaterial(T) {
  if (!lmMats.has(T)) lmMats.set(T, new T.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  return lmMats.get(T);
}
function lmMergeParts(T, parts) {
  const geos = parts.map(([geo, colour, m]) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); geo.dispose?.(); if (m) g.applyMatrix4(m); return [g, colour]; });
  const total = geos.reduce((s, [g]) => s + g.attributes.position.count, 0);
  const pos = new Float32Array(total * 3), col = new Float32Array(total * 3), c = new T.Color();
  let o = 0;
  for (const [g, colour] of geos) {
    pos.set(g.attributes.position.array, o * 3);
    c.set(colour);
    for (let i = 0; i < g.attributes.position.count; i++) { col[(o + i) * 3] = c.r; col[(o + i) * 3 + 1] = c.g; col[(o + i) * 3 + 2] = c.b; }
    o += g.attributes.position.count;
    g.dispose();
  }
  const out = new T.BufferGeometry();
  out.setAttribute("position", new T.BufferAttribute(pos, 3));
  out.setAttribute("color", new T.BufferAttribute(col, 3));
  out.computeVertexNormals();
  out.computeBoundingSphere();
  return out;
}
const lmAt = (T, x, y, z, ry = 0) => new T.Matrix4().makeRotationY(ry).setPosition(x, y, z);
/** A box from (x, y0, z) standing `h` tall. */
const lmBox = (T, parts, w, h, d, x, y0, z, colour, ry = 0) => parts.push([new T.BoxGeometry(w, h, d), colour, lmAt(T, x, y0 + h / 2, z, ry)]);
/** A cylinder (or cone when r1 = 0) standing on (x, y0, z). */
const lmCyl = (T, parts, r0, r1, h, seg, x, y0, z, colour, ry = 0) => parts.push([new T.CylinderGeometry(r1, r0, h, seg), colour, lmAt(T, x, y0 + h / 2, z, ry)]);
/** A square beam from a to b ([x, y, z]), `t` thick. */
function lmBeam(T, parts, a, b, t, colour) {
  const va = new T.Vector3(...a), vb = new T.Vector3(...b), dir = vb.clone().sub(va), len = dir.length();
  if (len < 1e-6) return;
  const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, 1), dir.normalize());
  parts.push([new T.BoxGeometry(t, t, len), colour, new T.Matrix4().compose(va.add(vb).multiplyScalar(0.5), q, new T.Vector3(1, 1, 1))]);
}
/** A gable roof (a triangular prism) of width w, rise r, length l, its ridge along +Z, eaves at y0. */
function lmGable(T, parts, w, r, l, x, y0, z, colour, ry = 0) {
  const g = new T.CylinderGeometry(1, 1, l, 3, 1);
  g.rotateX(Math.PI / 2); g.rotateZ(Math.PI / 2 * 0); // ridge along Z; a 3-sided cylinder points one edge up after the turn below
  g.rotateZ(Math.PI); // edge up
  g.scale(w / Math.sqrt(3), r / 1.5, 1);
  g.translate(0, r / 3, 0);
  parts.push([g, colour, lmAt(T, x, y0, z, ry)]);
}
function lmMesh(T, geo, name) { const m = new T.Mesh(geo, lmMaterial(T)); m.name = name; return m; }

// ---- the suspension bridges: two towers, two main cables, suspenders (the road ribbon is the engine's deck)
function lmSuspension(T, o, { colour, braced, anchorage }) {
  const low = o.tier === "low", S = o.span ?? 600, D = o.deck ?? 25, half = S / 2, back = S * 0.32;
  const H = D + 0.16 * S + 24, legX = 9, parts = [];
  for (const zt of [-half, half]) {
    for (const x of [-legX, legX]) lmBox(T, parts, 3.4, H, 4.6, x, 0, zt, colour);
    const struts = braced ? [D + 6, H - 3] : [D + 6, D + (H - D) * 0.55, H - 3];
    for (const y of struts) lmBox(T, parts, legX * 2, 2.6, 3.4, 0, y - 1.3, zt, colour);
    if (braced && !low) { lmBeam(T, parts, [-legX, D + 7, zt], [legX, H - 4, zt], 1.4, colour); lmBeam(T, parts, [legX, D + 7, zt], [-legX, H - 4, zt], 1.4, colour); }
    lmBox(T, parts, legX * 2 + 6, 3, 8, 0, -2, zt, LM_C.stone); // pier cap at the waterline
  }
  const n = low ? 10 : 18, sag = D + 4;
  const cableY = (z) => { const u = z / half; return sag + (H - 1 - sag) * u * u; };
  for (const x of [-legX, legX]) {
    let prev = [x, cableY(-half), -half];
    for (let i = 1; i <= n; i++) { const z = -half + (S * i) / n, p = [x, cableY(z), z]; lmBeam(T, parts, prev, p, 1.1, colour); prev = p; }
    for (const s of [-1, 1]) lmBeam(T, parts, [x, H - 1, s * half], [x, D + 1, s * (half + back)], 1.1, colour); // back stays to the shore
    for (let i = 1; i < n; i++) { const z = -half + (S * i) / n; lmBeam(T, parts, [x, cableY(z), z], [x, D + 0.5, z], 0.35, colour); }
  }
  if (anchorage) lmBox(T, parts, 30, D + 10, 26, 0, -2, half + back, LM_C.stone);
  return parts;
}

function lmEastTower(T, o) {
  const low = o.tier === "low", S = o.span ?? 500, D = o.deck ?? 25, H = D + 0.22 * S + 30, parts = [], c = LM_C.pale;
  // One tower of four legs tapering toward the top, with shear struts.
  for (const x of [-4, 4]) for (const z of [-3, 3]) lmCyl(T, parts, 2.4, 1.5, H, low ? 4 : 6, x, 0, z, c);
  for (let y = D + 10; y < H - 6; y += low ? 30 : 18) lmBox(T, parts, 10, 1.4, 1.4, 0, y, 0, c);
  lmBox(T, parts, 14, 3, 12, 0, -2, 0, LM_C.stone);
  // The single main cable looping over the tower to the deck at both ends of the span.
  const n = low ? 8 : 14, half = S / 2;
  for (const x of [-10, 10]) {
    for (const s of [-1, 1]) {
      let prev = [x * 0.3, H - 1, 0];
      for (let i = 1; i <= n; i++) { const u = i / n, z = s * half * u, y = H - 1 - (H - 1 - D - 1) * Math.pow(u, 0.7), p = [x * (0.3 + 0.7 * u), y, z]; lmBeam(T, parts, prev, p, 1, c); prev = p; }
      for (let i = 1; i < n; i++) { const u = i / n, z = s * half * u, y = H - 1 - (H - 1 - D - 1) * Math.pow(u, 0.7); lmBeam(T, parts, [x * (0.3 + 0.7 * u), y, z], [x * (0.3 + 0.7 * u), D + 0.5, z], 0.3, c); }
    }
  }
  return parts;
}

function lmCoit(T, o) {
  const seg = o.tier === "low" ? 8 : 16, parts = [];
  lmCyl(T, parts, 16, 14, 3, seg, 0, 0, 0, LM_C.stone); // the hilltop terrace
  lmCyl(T, parts, 9, 9, 5, seg, 0, 3, 0, LM_C.cream); // the base
  lmCyl(T, parts, 4.8, 4.6, 46, seg, 0, 8, 0, LM_C.cream); // the fluted column (its facets read as flutes)
  lmCyl(T, parts, 5.2, 5.2, 4, seg, 0, 54, 0, LM_C.cream); // the crown
  for (let i = 0; i < (o.tier === "low" ? 4 : 8); i++) { const a = (i / (o.tier === "low" ? 4 : 8)) * Math.PI * 2; lmBox(T, parts, 1.2, 2.2, 0.4, Math.cos(a) * 5.25, 54.9, Math.sin(a) * 5.25, LM_C.dark, -a + Math.PI / 2); }
  lmCyl(T, parts, 4.4, 4.0, 1.2, seg, 0, 58, 0, LM_C.stone);
  return parts;
}

function lmTransamerica(T, o) {
  const parts = [], H = 150;
  const body = new T.CylinderGeometry(1.2, 15, H, 4, 1); body.rotateY(Math.PI / 4);
  parts.push([body, LM_C.white, lmAt(T, 0, H / 2, 0)]);
  for (const s of [-1, 1]) { const w = new T.CylinderGeometry(0.6, 4.2, H * 0.55, 4, 1); w.rotateY(Math.PI / 4); parts.push([w, LM_C.white, lmAt(T, s * 12.5, H * 0.55 / 2 + H * 0.22, 0)]); }
  lmCyl(T, parts, 1.2, 0, 34, 4, 0, H, 0, LM_C.white);
  if (o.tier !== "low") lmBox(T, parts, 26, 5, 26, 0, 0, 0, LM_C.stone);
  return parts;
}

function lmFerryBuilding(T, o) {
  const parts = [];
  lmBox(T, parts, 22, 11, 120, 0, 0, 0, LM_C.stone); // the long shed along +Z
  lmBox(T, parts, 22.4, 1.2, 120.4, 0, 3.6, 0, LM_C.cream); // the arcade line
  lmBox(T, parts, 23, 1, 121, 0, 11, 0, LM_C.roof);
  lmBox(T, parts, 11, 34, 11, 0, 0, 0, LM_C.cream); // the clock tower
  lmBox(T, parts, 9, 10, 9, 0, 34, 0, LM_C.cream);
  lmBox(T, parts, 7, 6, 7, 0, 44, 0, LM_C.cream);
  lmCyl(T, parts, 4.6, 0, 8, 4, 0, 50, 0, LM_C.roof, Math.PI / 4);
  for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2; lmBox(T, parts, 4.4, 4.4, 0.4, Math.sin(a) * 4.7, 36.8, Math.cos(a) * 4.7, LM_C.white, a); } // clock faces
  if (o.tier !== "low") lmCyl(T, parts, 0.3, 0.3, 6, 4, 0, 58, 0, LM_C.dark);
  return parts;
}

/** One Victorian house: a narrow deep body, a bay window on the front (+Z), a front gable, a stoop. White body so a row can tint it. */
function lmVictorianParts(T, o, body = LM_C.white) {
  const parts = [], low = o.tier === "low";
  lmBox(T, parts, 7, 9, 13, 0, 0, 0, body);
  lmGable(T, parts, 7.4, 4, 13.2, 0, 9, 0, LM_C.roof);
  lmBox(T, parts, 3.4, 5.2, 1.4, -1.2, 2.4, 7.1, body); // the bay window
  if (!low) lmBox(T, parts, 3.0, 3.6, 0.2, -1.2, 3.2, 7.85, LM_C.glass);
  lmBox(T, parts, 3.8, 0.4, 1.8, -1.2, 7.6, 7.1, LM_C.roof);
  lmBox(T, parts, 1.6, 2.4, 2.2, 2.2, 0, 7.6, LM_C.stone); // the stoop
  lmBox(T, parts, 7.6, 0.6, 0.6, 0, 8.6, 6.8, LM_C.white); // the cornice
  return parts;
}
const LM_PASTELS = [0xf2c7c7, 0xc9dcf0, 0xf3e3b5, 0xcfe6cf, 0xe3d0ee, 0xf6d6b8];

function lmCableCarParts(T, o, y0 = 0) {
  const parts = [], low = o.tier === "low";
  lmBox(T, parts, 2.6, 0.5, 8.6, 0, y0 + 0.4, 0, LM_C.dark); // the chassis
  lmBox(T, parts, 2.5, 1.9, 3.6, 0, y0 + 0.9, 0, LM_C.red); // the closed centre
  lmBox(T, parts, 2.54, 0.7, 3.4, 0, y0 + 1.8, 0, LM_C.glass);
  for (const s of [-1, 1]) {
    lmBox(T, parts, 2.5, 0.6, 2.4, 0, y0 + 0.9, s * 3.0, LM_C.cream); // the open ends' benches
    if (!low) for (const x of [-1.15, 1.15]) lmBox(T, parts, 0.12, 1.3, 0.12, x, y0 + 1.5, s * 4.1, LM_C.dark);
  }
  lmBox(T, parts, 2.8, 0.25, 8.8, 0, y0 + 2.8, 0, LM_C.cream); // the roof
  lmBox(T, parts, 2.4, 0.2, 7.8, 0, y0 + 3.05, 0, LM_C.red);
  return parts;
}

function lmTurntable(T, o) {
  const seg = o.tier === "low" ? 12 : 20, parts = [];
  lmCyl(T, parts, 6.2, 6.2, 0.3, seg, 0, 0, 0, LM_C.wood);
  lmCyl(T, parts, 6.8, 6.8, 0.12, seg, 0, 0, 0, LM_C.rail);
  for (const x of [-0.8, 0.8]) lmBox(T, parts, 0.15, 0.1, 12, x, 0.3, 0, LM_C.rail);
  parts.push(...lmCableCarParts(T, o, 0.35));
  return parts;
}

/** One container crane: four legs, portal beams, the boom out over the water (+Z), the back-reach, the machinery house. */
function lmCraneParts(T, o) {
  const parts = [], low = o.tier === "low", c = LM_C.crane;
  for (const x of [-8, 8]) for (const z of [-7, 7]) lmBox(T, parts, 1.4, 40, 1.4, x, 0, z, c);
  for (const z of [-7, 7]) lmBox(T, parts, 17.4, 1.8, 1.6, 0, 38.2, z, c);
  for (const x of [-8, 8]) lmBox(T, parts, 1.6, 1.8, 15.4, x, 38.2, 0, c);
  if (!low) for (const x of [-8, 8]) lmBox(T, parts, 1.2, 1.2, 15.4, x, 12, 0, c);
  lmBox(T, parts, 3, 2.4, 78, 0, 40, 18, c); // the boom and back-reach
  lmBox(T, parts, 7, 5, 9, 0, 42.4, -8, LM_C.white); // the machinery house
  lmBeam(T, parts, [0, 40, -7], [0, 52, -2], 1.2, c); lmBeam(T, parts, [0, 52, -2], [0, 42, 44], 0.5, c); // the A-frame and its stay
  if (!low) lmBeam(T, parts, [0, 52, -2], [0, 42, -18], 0.5, c);
  lmBox(T, parts, 3.2, 2.4, 3.2, 0, 37, 30, LM_C.dark); // the trolley and cab under the boom
  return parts;
}

function lmPergola(T, o) {
  const low = o.tier === "low", n = low ? 8 : 16, seg = low ? 5 : 8, R = 24, a0 = -Math.PI * 0.4, a1 = Math.PI * 0.4, parts = [];
  lmBox(T, parts, 2 * R * Math.sin(a1) + 6, 0.5, 8, 0, 0, R * 0.55, LM_C.stone); // the terrace
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * i) / (n - 1);
    for (const dr of [-2.2, 2.2]) { const x = Math.sin(a) * (R + dr), z = Math.cos(a) * (R + dr); lmCyl(T, parts, 0.55, 0.5, 6, seg, x, 0.5, z, LM_C.cream); }
    pts.push(a);
  }
  for (let i = 1; i < n; i++) for (const dr of [-2.2, 2.2]) {
    const pa = pts[i - 1], pb = pts[i];
    lmBeam(T, parts, [Math.sin(pa) * (R + dr), 6.8, Math.cos(pa) * (R + dr)], [Math.sin(pb) * (R + dr), 6.8, Math.cos(pb) * (R + dr)], 0.7, LM_C.cream);
  }
  if (!low) for (let i = 0; i < n; i++) { const a = pts[i]; lmBeam(T, parts, [Math.sin(a) * (R - 3), 7.3, Math.cos(a) * (R - 3)], [Math.sin(a) * (R + 3), 7.3, Math.cos(a) * (R + 3)], 0.45, LM_C.cream); }
  return parts;
}

function lmPierShed(T, o) {
  const low = o.tier === "low", parts = [];
  const rows = low ? 5 : 9;
  for (let i = 0; i < rows; i++) for (const x of [-13, 0, 13]) { if (low && x === 0) continue; lmCyl(T, parts, 0.6, 0.6, 4, 5, x, -2.5, -42 + (84 * i) / (rows - 1), LM_C.pile); }
  lmBox(T, parts, 30, 1, 92, 0, 1.2, 0, LM_C.wood); // the deck
  lmBox(T, parts, 22, 8, 72, 0, 2.2, -4, LM_C.stone); // the shed
  lmGable(T, parts, 23, 4, 72.4, 0, 10.2, -4, LM_C.roof);
  lmBox(T, parts, 26, 13, 2, 0, 2.2, 33, LM_C.cream); // the bulkhead front toward the street (+Z)
  lmCyl(T, parts, 9, 0, 4, 3, 0, 15.2, 33, LM_C.cream, Math.PI / 2); // its pediment
  lmBox(T, parts, 8, 6, 0.3, 0, 2.2, 34.1, LM_C.dark); // the door
  return parts;
}

function lmLighthouse(T, o) {
  const low = o.tier === "low", seg = low ? 8 : 14, parts = [];
  const prof = [[3.4, 0], [3.2, 2], [2.4, 16], [2.2, 18]].map(([r, y]) => new T.Vector2(r, y));
  parts.push([new T.LatheGeometry(prof, seg), LM_C.white, null]);
  lmCyl(T, parts, 3.2, 3.2, 0.5, seg, 0, 18, 0, LM_C.dark); // the gallery
  lmCyl(T, parts, 1.7, 1.7, 2.6, seg, 0, 18.5, 0, LM_C.glass); // the lantern
  lmCyl(T, parts, 2.0, 0, 1.8, seg, 0, 21.1, 0, LM_C.red); // the cap
  if (!low) { lmBox(T, parts, 6, 4, 8, 7, 0, 0, LM_C.white); lmGable(T, parts, 6.4, 2, 8.2, 7, 4, 0, LM_C.red); } // the keeper's house
  return parts;
}

/** Instance `unitParts` `count` times along +X at `step`, stepping up `rise` a house; colours from `palette`. */
function lmRow(T, name, unitParts, count, step, rise, palette) {
  const geo = lmMergeParts(T, unitParts);
  const im = new T.InstancedMesh(geo, lmMaterial(T), count);
  const m = new T.Matrix4(), c = new T.Color();
  for (let i = 0; i < count; i++) {
    m.makeTranslation((i - (count - 1) / 2) * step, i * rise, 0);
    im.setMatrixAt(i, m);
    if (palette) im.setColorAt(i, c.set(palette[i % palette.length]));
  }
  im.name = name;
  im.computeBoundingSphere?.();
  return im;
}

const LM_KINDS = {
  "golden-gate-bridge": (T, o) => lmMesh(T, lmMergeParts(T, lmSuspension(T, o, { colour: LM_C.orange, braced: false })), "lm-golden-gate-bridge"),
  "bay-bridge-suspension": (T, o) => lmMesh(T, lmMergeParts(T, lmSuspension(T, o, { colour: LM_C.grey, braced: true, anchorage: true })), "lm-bay-bridge-suspension"),
  "bay-bridge-east-tower": (T, o) => lmMesh(T, lmMergeParts(T, lmEastTower(T, o)), "lm-bay-bridge-east-tower"),
  "coit-tower": (T, o) => lmMesh(T, lmMergeParts(T, lmCoit(T, o)), "lm-coit-tower"),
  "transamerica-pyramid": (T, o) => lmMesh(T, lmMergeParts(T, lmTransamerica(T, o)), "lm-transamerica-pyramid"),
  "ferry-building": (T, o) => lmMesh(T, lmMergeParts(T, lmFerryBuilding(T, o)), "lm-ferry-building"),
  "painted-ladies": (T, o) => lmRow(T, "lm-painted-ladies", lmVictorianParts(T, o), o.tier === "low" ? 4 : 6, 7.6, 0.9, LM_PASTELS),
  "cable-car": (T, o) => lmMesh(T, lmMergeParts(T, lmCableCarParts(T, o)), "lm-cable-car"),
  "cable-car-turntable": (T, o) => lmMesh(T, lmMergeParts(T, lmTurntable(T, o)), "lm-cable-car-turntable"),
  "container-cranes": (T, o) => lmRow(T, "lm-container-cranes", lmCraneParts(T, o), o.tier === "low" ? 2 : 4, 34, 0, null),
  "lake-merritt-pergola": (T, o) => lmMesh(T, lmMergeParts(T, lmPergola(T, o)), "lm-lake-merritt-pergola"),
  "victorian-house": (T, o) => lmMesh(T, lmMergeParts(T, lmVictorianParts(T, o, o.colour ?? LM_PASTELS[1])), "lm-victorian-house"),
  "wharf-pier-shed": (T, o) => lmMesh(T, lmMergeParts(T, lmPierShed(T, o)), "lm-wharf-pier-shed"),
  "lighthouse": (T, o) => lmMesh(T, lmMergeParts(T, lmLighthouse(T, o)), "lm-lighthouse"),
  // LANDMARKS-2 (`lx`)
  "truss-bridge": (T, o) => lmMesh(T, lmMergeParts(T, lmTrussBridge(T, o)), "lm-truss-bridge"),
  "church-towers": (T, o) => lmMesh(T, lmMergeParts(T, lmChurchTowers(T, o)), "lm-church-towers"),
  "mission-church-front": (T, o) => lmMesh(T, lmMergeParts(T, lmMissionFront(T, o)), "lm-mission-church-front"),
  "windmill": (T, o) => lmMesh(T, lmMergeParts(T, lmWindmill(T, o)), "lm-windmill"),
  "glasshouse": (T, o) => lmMesh(T, lmMergeParts(T, lmGlasshouse(T, o)), "lm-glasshouse"),
  "rotunda-colonnade": (T, o) => lmMesh(T, lmMergeParts(T, lmRotunda(T, o)), "lm-rotunda-colonnade"),
  "masonry-fort": (T, o) => lmMesh(T, lmMergeParts(T, lmFort(T, o)), "lm-masonry-fort"),
  "lattice-mast": (T, o) => lmMesh(T, lmMergeParts(T, lmLatticeMast(T, o)), "lm-lattice-mast"),
  "switchback-street": (T, o) => lmMesh(T, lmMergeParts(T, lmSwitchbacks(T, o)), "lm-switchback-street"),
  "theatre-marquee": (T, o) => lmMesh(T, lmMergeParts(T, lmMarquee(T, o)), "lm-theatre-marquee"),
  "campanile": (T, o) => lmMesh(T, lmMergeParts(T, lmCampanile(T, o)), "lm-campanile"),
  "civic-tower": (T, o) => lmMesh(T, lmMergeParts(T, lmCivicTower(T, o)), "lm-civic-tower"),
  "transit-station": (T, o) => lmMesh(T, lmMergeParts(T, lmTransitStation(T, o)), "lm-transit-station"),
  "memorial-plaza": (T, o) => lmMesh(T, lmMergeParts(T, lmMemorialPlaza(T, o)), "lm-memorial-plaza"),
  "canal-lock": (T, o) => lmMesh(T, lmMergeParts(T, lmCanalLock(T, o)), "lm-canal-lock"),
  "levee-pump-station": (T, o) => lmMesh(T, lmMergeParts(T, lmPumpStation(T, o)), "lm-levee-pump-station"),
  "marsh-boardwalk": (T, o) => lmMesh(T, lmMergeParts(T, lmBoardwalk(T, o)), "lm-marsh-boardwalk"),
  "tide-gate": (T, o) => lmMesh(T, lmMergeParts(T, lmTideGate(T, o)), "lm-tide-gate"),
  "shotgun-row": (T, o) => lmRow(T, "lm-shotgun-row", lmShotgunParts(T, o), o.tier === "low" ? 3 : 6, 6.4, 0, LM_PASTELS),
  "streetcar": (T, o) => lmMesh(T, lmMergeParts(T, lmStreetcarParts(T, o)), "lm-streetcar"),
  "gateway-arch": (T, o) => lmMesh(T, lmMergeParts(T, lmGateway(T, o)), "lm-gateway-arch"),
};

// ---- LANDMARKS-2 (console `lx`, docs/consoles/LANDMARKS-2.md): more kinds, the same rules — schematic silhouettes, no
// measured dimensions, no claim of accuracy, one mesh each, a phone tier.

/** A truss bridge: piers and a through-truss rising over the two main piers (the deck is the engine's road). */
function lmTrussBridge(T, o) {
  const low = o.tier === "low", S = o.span ?? 500, D = o.deck ?? 30, half = S / 2, parts = [], c = LM_C.grey;
  const bays = low ? 8 : 16, W = 9, rise = (z) => D + 6 + 34 * Math.max(0, 1 - Math.abs(Math.abs(z) - half) / (half * 0.7));
  for (const zt of [-half, half]) lmBox(T, parts, W * 2 + 6, D, 8, 0, -2, zt, LM_C.stone); // the main piers
  for (const x of [-W, W]) {
    let prevTop = null, prevBot = null;
    for (let i = 0; i <= bays; i++) {
      const z = -half * 1.3 + (2.6 * half * i) / bays, top = [x, rise(z), z], bot = [x, D + 1, z];
      lmBeam(T, parts, bot, top, 1.2, c);
      if (prevTop) { lmBeam(T, parts, prevTop, top, 1.4, c); lmBeam(T, parts, prevBot, bot, 1.4, c); if (!low || i % 2) lmBeam(T, parts, prevBot, top, 0.9, c); }
      prevTop = top; prevBot = bot;
    }
  }
  for (let i = 0; i <= bays; i += low ? 4 : 2) { const z = -half * 1.3 + (2.6 * half * i) / bays; lmBeam(T, parts, [-W, rise(z), z], [W, rise(z), z], 1, c); }
  return parts;
}

/** A church front with towers: a nave with a gable, a tall centre tower with a spire and two flanking towers. */
function lmChurchTowers(T, o) {
  const low = o.tier === "low", seg = low ? 4 : 6, parts = [];
  lmBox(T, parts, 18, 14, 34, 0, 0, -8, LM_C.white); lmGable(T, parts, 18.4, 6, 34.2, 0, 14, -8, LM_C.roof);
  lmBox(T, parts, 7, 26, 7, 0, 0, 9, LM_C.white); lmCyl(T, parts, 3.6, 0, 14, seg, 0, 26, 9, LM_C.dark, Math.PI / 4);
  for (const x of [-7.5, 7.5]) { lmBox(T, parts, 5, 18, 5, x, 0, 9, LM_C.white); lmCyl(T, parts, 2.6, 0, 8, seg, x, 18, 9, LM_C.dark, Math.PI / 4); }
  lmBox(T, parts, 3, 6, 0.4, 0, 0, 12.6, LM_C.wood); // the door
  if (!low) for (const x of [-7.5, 0, 7.5]) lmBox(T, parts, 1.6, 3, 0.3, x, x ? 12 : 16, x ? 11.6 : 12.6, LM_C.glass);
  return parts;
}

/** A mission-style church front: a thick wall, a stepped parapet with bell openings, buttress columns, a low tiled nave behind. */
function lmMissionFront(T, o) {
  const low = o.tier === "low", parts = [];
  lmBox(T, parts, 12, 8, 30, 0, 0, -14, LM_C.cream); lmGable(T, parts, 12.6, 3, 30.4, 0, 8, -14, LM_C.red);
  lmBox(T, parts, 14, 10, 2.4, 0, 0, 1, LM_C.cream); lmBox(T, parts, 9, 2.4, 2.4, 0, 10, 1, LM_C.cream); lmBox(T, parts, 4, 2, 2.4, 0, 12.4, 1, LM_C.cream);
  for (const x of [-5.8, 5.8]) lmBox(T, parts, 1.6, 9, 3, x, 0, 1.4, LM_C.cream);
  if (!low) for (const x of [-2.4, 0, 2.4]) lmBox(T, parts, 1, 1.4, 0.3, x, 10.6, 2.3, LM_C.dark);
  lmBox(T, parts, 3, 4.5, 0.3, 0, 0, 2.3, LM_C.wood);
  return parts;
}

/** A windmill: a tapering body, a cap, four sails (still — nothing turns), a stage. */
function lmWindmill(T, o) {
  const low = o.tier === "low", seg = low ? 6 : 8, parts = [];
  lmCyl(T, parts, 5.6, 3.2, 18, seg, 0, 0, 0, LM_C.white); lmCyl(T, parts, 3.6, 0.6, 4, seg, 0, 18, 0, LM_C.roof);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2, r = 7;
    lmBeam(T, parts, [0, 19.5, 4.2], [Math.cos(a) * r * 2, 19.5 + Math.sin(a) * r * 2, 4.2], 0.5, LM_C.wood);
    if (!low) parts.push([new T.BoxGeometry(r * 1.6, 2.2, 0.15), LM_C.cream, new T.Matrix4().makeRotationZ(a).setPosition(Math.cos(a) * r * 1.15, 19.5 + Math.sin(a) * r * 1.15, 4.4)]);
  }
  lmBox(T, parts, 13, 0.6, 13, 0, 5, 0, LM_C.wood);
  return parts;
}

/** A glasshouse: a central domed pavilion with two long glazed wings and end pavilions. */
function lmGlasshouse(T, o) {
  const low = o.tier === "low", seg = low ? 8 : 14, parts = [];
  lmBox(T, parts, 14, 8, 14, 0, 0, 0, LM_C.glass); lmCyl(T, parts, 7.4, 7.4, 3, seg, 0, 8, 0, LM_C.white);
  parts.push([new T.SphereGeometry(7, seg, low ? 4 : 6, 0, Math.PI * 2, 0, Math.PI / 2), LM_C.pale, lmAt(T, 0, 11, 0)]);
  lmCyl(T, parts, 1.2, 0, 3, 6, 0, 18, 0, LM_C.white);
  for (const s of [-1, 1]) { lmBox(T, parts, 22, 6, 9, s * 18, 0, 0, LM_C.glass); lmGable(T, parts, 9.4, 3, 22.2, s * 18, 6, 0, LM_C.pale, Math.PI / 2); lmBox(T, parts, 6, 9, 10, s * 31, 0, 0, LM_C.white); }
  return parts;
}

/** A rotunda and colonnade: an open domed rotunda on columns with a curved colonnade either side. */
function lmRotunda(T, o) {
  const low = o.tier === "low", n = low ? 6 : 8, seg = low ? 6 : 10, parts = [], R = 40;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; lmCyl(T, parts, 0.9, 0.8, 16, seg, Math.cos(a) * 10, 0, Math.sin(a) * 10, LM_C.stone); }
  lmCyl(T, parts, 11.5, 11.5, 3, seg + 4, 0, 16, 0, LM_C.stone); lmCyl(T, parts, 10.5, 8, 4, seg + 4, 0, 19, 0, LM_C.stone);
  parts.push([new T.SphereGeometry(8, seg + 4, low ? 4 : 6, 0, Math.PI * 2, 0, Math.PI / 2), LM_C.orange, lmAt(T, 0, 23, 0)]);
  const m = low ? 6 : 12, arc = (a) => [Math.sin(a) * R, 10.4, Math.cos(a) * R - R + 4];
  for (const s of [-1, 1]) {
    for (let i = 0; i < m; i++) { const a = s * (0.5 + (1.3 * i) / m); lmCyl(T, parts, 0.7, 0.6, 10, 5, Math.sin(a) * R, 0, Math.cos(a) * R - R + 4, LM_C.stone); }
    const a0 = s * 0.5, a1 = s * 1.8, am = (a0 + a1) / 2;
    lmBeam(T, parts, arc(a0), arc(am), 1.2, LM_C.stone); lmBeam(T, parts, arc(am), arc(a1), 1.2, LM_C.stone);
  }
  return parts;
}

/** A masonry fort: thick brick walls round a parade, corner bastions, a parapet and a flagstaff. */
function lmFort(T, o) {
  const low = o.tier === "low", parts = [];
  for (const [w, d, x, z] of [[44, 5, 0, -20], [44, 5, 0, 20], [5, 35, -20, 0], [5, 35, 20, 0]]) lmBox(T, parts, w, 12, d, x, 0, z, LM_C.red);
  for (const [x, z] of [[-22, -22], [22, -22], [-22, 22], [22, 22]]) lmCyl(T, parts, 5, 5, 13, 4, x, 0, z, LM_C.red, Math.PI / 4);
  if (!low) for (const z of [-22.4, 22.4]) lmBox(T, parts, 44, 1.2, 1, 0, 12, z, LM_C.stone);
  lmBox(T, parts, 36, 0.4, 36, 0, 0.1, 0, LM_C.green); lmCyl(T, parts, 0.25, 0.2, 14, 4, 0, 0, 0, LM_C.dark);
  return parts;
}

/** A lattice mast: three legs tapering to a waist and splaying to a three-armed crown, cross-braced. */
function lmLatticeMast(T, o) {
  const low = o.tier === "low", parts = [], c = LM_C.orange, H = 110, arms = [0, 1, 2].map((i) => (i / 3) * Math.PI * 2);
  const at = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r], rAt = (y) => (y < 70 ? 14 - (10 * y) / 70 : 4 + (8 * (y - 70)) / 40);
  const steps = low ? [0, 35, 70, 90, H] : [0, 18, 35, 52, 70, 80, 90, 100, H];
  for (const a of arms) for (let i = 1; i < steps.length; i++) lmBeam(T, parts, at(a, rAt(steps[i - 1]), steps[i - 1]), at(a, rAt(steps[i]), steps[i]), 1.4, c);
  for (let i = 1; i < steps.length; i += low ? 2 : 1) for (let k = 0; k < 3; k++) lmBeam(T, parts, at(arms[k], rAt(steps[i]), steps[i]), at(arms[(k + 1) % 3], rAt(steps[i]), steps[i]), 0.8, LM_C.white);
  for (const a of arms) lmCyl(T, parts, 0.8, 0.5, 18, 5, Math.cos(a) * 12, H, Math.sin(a) * 12, LM_C.white);
  return parts;
}

/** Switchbacks: a steep lane of hairpin bends between low hedges, a house at the top and the bottom. */
function lmSwitchbacks(T, o) {
  const low = o.tier === "low", n = low ? 5 : 8, L = 90, parts = [];
  for (let i = 0; i < n; i++) {
    const z0 = -L / 2 + (L * i) / n, z1 = z0 + L / n, y0 = (i * 18) / n, y1 = ((i + 1) * 18) / n, s = i % 2 ? 1 : -1;
    lmBeam(T, parts, [-s * 5, y0 + 0.2, z0], [s * 5, y1 + 0.2, z1], 3, LM_C.rail);
    for (const side of [-1, 1]) lmBox(T, parts, 3, 0.9, L / n - 2, side * 8, y0, (z0 + z1) / 2, LM_C.green);
  }
  lmBox(T, parts, 22, 0.6, L + 4, 0, -0.4, 0, LM_C.stone);
  if (!low) for (const [z, y] of [[-L / 2 - 8, 0], [L / 2 + 8, 18]]) { lmBox(T, parts, 12, 9, 10, 0, y, z, LM_C.white); lmGable(T, parts, 12.4, 3, 10.2, 0, y + 9, z, LM_C.roof); }
  return parts;
}

/** A theatre front: a tall facade, a projecting marquee canopy and a vertical blade sign — both blank (no lettering). */
function lmMarquee(T, o) {
  const low = o.tier === "low", parts = [];
  lmBox(T, parts, 20, 16, 26, 0, 0, -12, LM_C.stone); lmBox(T, parts, 22, 18, 2, 0, 0, 1, LM_C.cream);
  lmBox(T, parts, 16, 2.4, 6, 0, 5, 4, LM_C.red); lmBox(T, parts, 16.4, 0.5, 6.4, 0, 7.4, 4, LM_C.white);
  lmBox(T, parts, 1.2, 14, 3.4, 0, 8, 3.2, LM_C.red); lmBox(T, parts, 1.4, 12, 2.4, 0, 9, 3.2, LM_C.cream);
  lmBox(T, parts, 10, 4.4, 0.3, 0, 0, 2.1, LM_C.glass);
  if (!low) for (const x of [-7, 7]) lmBox(T, parts, 3, 5, 0.3, x, 10, 2.1, LM_C.glass);
  return parts;
}

/** A campanile: a tall square shaft, clock faces, an open belfry, a pyramid roof and a finial. */
function lmCampanile(T, o) {
  const low = o.tier === "low", parts = [];
  lmBox(T, parts, 12, 2, 12, 0, 0, 0, LM_C.stone); lmBox(T, parts, 9, 58, 9, 0, 2, 0, LM_C.stone);
  for (const [x, z] of [[-3.8, -3.8], [3.8, -3.8], [-3.8, 3.8], [3.8, 3.8]]) lmBox(T, parts, 1.4, 10, 1.4, x, 60, z, LM_C.stone);
  if (!low) for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2; lmBox(T, parts, 3, 3, 0.3, Math.sin(a) * 4.65, 50, Math.cos(a) * 4.65, LM_C.white, a); }
  lmBox(T, parts, 10, 1.4, 10, 0, 70, 0, LM_C.stone); lmCyl(T, parts, 7, 0, 12, 4, 0, 71.4, 0, LM_C.green, Math.PI / 4); lmCyl(T, parts, 0.3, 0.2, 4, 4, 0, 83.4, 0, LM_C.dark);
  return parts;
}

/** A civic tower: a long low civic block, a glazed rotunda with a shallow dome and a slim tower beside it. */
function lmCivicTower(T, o) {
  const low = o.tier === "low", seg = low ? 8 : 14, parts = [];
  lmBox(T, parts, 50, 12, 20, 0, 0, -10, LM_C.pale); lmBox(T, parts, 50.4, 0.8, 20.4, 0, 12, -10, LM_C.roof);
  lmCyl(T, parts, 9, 9, 16, seg, 0, 0, 6, LM_C.glass); parts.push([new T.SphereGeometry(9, seg, low ? 3 : 5, 0, Math.PI * 2, 0, Math.PI / 2), LM_C.white, lmAt(T, 0, 16, 6)]);
  lmBox(T, parts, 10, 60, 10, 30, 0, -12, LM_C.pale); if (!low) lmBox(T, parts, 10.4, 2, 10.4, 30, 60, -12, LM_C.roof);
  return parts;
}

/** A transit station: a long platform with a canopy on columns, rails either side and a small head house. Generic by kind. */
function lmTransitStation(T, o) {
  const low = o.tier === "low", n = low ? 4 : 8, parts = [];
  lmBox(T, parts, 10, 1.2, 90, 0, 0, 0, LM_C.stone);
  for (let i = 0; i < n; i++) lmBox(T, parts, 0.6, 5, 0.6, 0, 1.2, -40 + (80 * i) / (n - 1), LM_C.dark);
  lmBox(T, parts, 9, 0.5, 84, 0, 6.2, 0, LM_C.pale);
  for (const x of [-7.4, 7.4]) lmBox(T, parts, 1.6, 0.2, 90, x, 0, 0, LM_C.rail);
  lmBox(T, parts, 12, 6, 10, 0, 0, 52, LM_C.cream); lmBox(T, parts, 12.4, 0.6, 10.4, 0, 6, 52, LM_C.roof);
  return parts;
}

/** A memorial plaza: a paved walk, a long low wall of panels beside it, benches and a lookout rail at the end (+Z). */
function lmMemorialPlaza(T, o) {
  const low = o.tier === "low", parts = [];
  lmBox(T, parts, 14, 0.4, 70, 0, 0, 0, LM_C.stone);
  for (let i = 0; i < (low ? 4 : 8); i++) lmBox(T, parts, 0.6, 1.2 + (i % 3) * 0.5, 6.5, 6, 0.4, -30 + i * (low ? 16 : 8), LM_C.pale);
  if (!low) for (let i = 0; i < 4; i++) lmBox(T, parts, 2, 0.5, 0.6, -4, 0.4, -24 + i * 16, LM_C.wood);
  lmBox(T, parts, 16, 0.6, 5, 0, 0, 37, LM_C.stone); lmBox(T, parts, 16, 1.1, 0.2, 0, 0.6, 39.4, LM_C.rail);
  return parts;
}

/** A canal lock: two concrete lock walls, a closed pair of mitre gates at each end, a small control house. */
function lmCanalLock(T, o) {
  const low = o.tier === "low", parts = [];
  for (const x of [-12, 12]) lmBox(T, parts, 6, 8, 110, x, -4, 0, LM_C.pale);
  for (const z of [-50, 50]) for (const s of [-1, 1]) lmBox(T, parts, 9.6, 6, 1.2, s * 4.6, -3, z + s * 1.2, LM_C.dark, s * 0.25);
  lmBox(T, parts, 5, 4, 6, 15, 4, 44, LM_C.cream); lmBox(T, parts, 5.4, 0.5, 6.4, 15, 8, 44, LM_C.roof);
  if (!low) for (let z = -40; z <= 40; z += 20) for (const x of [-9.4, 9.4]) lmBox(T, parts, 0.6, 0.6, 0.6, x, 4, z, LM_C.dark);
  return parts;
}

/** A levee pump station: a boxy pump house on the levee crown, intake bays on the canal side, discharge pipes over the crest. */
function lmPumpStation(T, o) {
  const low = o.tier === "low", parts = [], k = low ? 3 : 5;
  lmBox(T, parts, 60, 4, 16, 0, 0, 0, LM_C.green);
  lmBox(T, parts, 30, 14, 14, 0, 0, -6, LM_C.pale); lmBox(T, parts, 30.4, 0.8, 14.4, 0, 14, -6, LM_C.roof);
  for (let i = 0; i < k; i++) { const x = -12 + (i * 24) / (k - 1); lmBox(T, parts, 4, 3, 2, x, 0, -14, LM_C.dark); lmBeam(T, parts, [x, 10, 1], [x, 6, 10], 1.6, LM_C.rail); }
  if (!low) lmBox(T, parts, 6, 5, 6, 18, 0, -8, LM_C.cream);
  return parts;
}

/** A marsh boardwalk: a narrow plank walk on short posts with a dog-leg and a small railed viewing platform at the end. */
function lmBoardwalk(T, o) {
  const low = o.tier === "low", parts = [], n = low ? 3 : 6;
  for (const [a, b] of [[[0, 0], [0, 40]], [[0, 40], [24, 62]]]) {
    lmBeam(T, parts, [a[0], 1.1, a[1]], [b[0], 1.1, b[1]], 2.4, LM_C.wood);
    for (let i = 0; i <= n; i++) lmCyl(T, parts, 0.2, 0.2, 1.4, 4, a[0] + ((b[0] - a[0]) * i) / n, -0.4, a[1] + ((b[1] - a[1]) * i) / n, LM_C.pile);
  }
  lmBox(T, parts, 8, 0.3, 8, 27, 1.0, 65, LM_C.wood);
  if (!low) for (const [w, d, x, z] of [[8, 0.2, 27, 69], [0.2, 8, 31, 65], [0.2, 8, 23, 65]]) lmBox(T, parts, w, 1, d, x, 1.3, z, LM_C.wood);
  return parts;
}

/** A tide gate: a concrete headwall across a channel with flap gates and a railed walkway over it. */
function lmTideGate(T, o) {
  const low = o.tier === "low", parts = [], k = low ? 2 : 4;
  lmBox(T, parts, 24, 5, 4, 0, -2, 0, LM_C.pale); lmBox(T, parts, 26, 0.4, 2, 0, 3, 0, LM_C.stone);
  for (let i = 0; i < k; i++) lmBox(T, parts, 3.2, 3, 0.4, -7.5 + (i * 15) / (k - 1), -1.5, 2.2, LM_C.dark);
  if (!low) for (const z of [-0.9, 0.9]) lmBox(T, parts, 26, 1, 0.1, 0, 3.4, z, LM_C.rail);
  return parts;
}

/** One shotgun house: narrow, single storey, a front gable, a porch roof on posts, raised on piers. White so a row can tint it. */
function lmShotgunParts(T, o) {
  const parts = [], low = o.tier === "low";
  lmBox(T, parts, 5, 0.9, 16, 0, 0, 0, LM_C.stone); lmBox(T, parts, 4.8, 4.4, 15, 0, 0.9, 0, LM_C.white); lmGable(T, parts, 5.2, 2.2, 15.2, 0, 5.3, 0, LM_C.roof);
  lmBox(T, parts, 5.4, 0.3, 2.2, 0, 4.2, 8.4, LM_C.roof);
  if (!low) for (const x of [-2.3, 2.3]) lmBox(T, parts, 0.25, 3.3, 0.25, x, 0.9, 9.2, LM_C.white);
  return parts;
}

/** A streetcar / light-rail car: one long car, a window band, a roof and a trolley pole. */
function lmStreetcarParts(T, o) {
  const parts = [], low = o.tier === "low";
  lmBox(T, parts, 2.6, 0.6, 14, 0, 0.4, 0, LM_C.dark); lmBox(T, parts, 2.6, 2.1, 14, 0, 1.0, 0, LM_C.green);
  lmBox(T, parts, 2.64, 0.9, 12.6, 0, 1.9, 0, LM_C.glass); lmBox(T, parts, 2.7, 0.3, 14.2, 0, 3.1, 0, LM_C.cream);
  if (!low) lmBeam(T, parts, [0, 3.4, -4], [0, 5.2, 2], 0.12, LM_C.dark);
  return parts;
}

/** A gateway arch (paifang style): four posts, a wide centre roof and two lower side roofs, a blank name board. */
function lmGateway(T, o) {
  const low = o.tier === "low", parts = [];
  for (const x of [-7, -3, 3, 7]) lmBox(T, parts, 1, Math.abs(x) === 7 ? 7 : 9, 1, x, 0, 0, LM_C.stone);
  lmBox(T, parts, 7.6, 1.6, 2.4, 0, 9, 0, LM_C.red); lmGable(T, parts, 9, 1.8, 3.6, 0, 10.6, 0, LM_C.green, Math.PI / 2);
  for (const s of [-1, 1]) { lmBox(T, parts, 5, 1.2, 2, s * 5, 7, 0, LM_C.red); lmGable(T, parts, 6, 1.2, 3, s * 5, 8.2, 0, LM_C.green, Math.PI / 2); }
  if (!low) lmBox(T, parts, 3, 1, 0.3, 0, 9.3, 1.3, LM_C.cream);
  return parts;
}

/**
 * Build one landmark kit. `opts`: { three (required), scale = 1, tier = "high" | "balanced" | "low", span?, deck?, colour? }.
 * Returns a THREE.Group named `lm-<kind>` holding one mesh (userData: { lmKind, triangles, meshes }), or null for an unknown
 * kind or a missing three.js.
 */
export function lmBuild(kind, opts = {}) {
  const T = opts.three;
  if (!T || !lmHas(kind)) return null;
  const o = { ...opts, tier: opts.tier === "low" ? "low" : "high" };
  const mesh = LM_KINDS[kind](T, o);
  const g = new T.Group();
  g.name = `lm-${kind}`;
  g.add(mesh);
  const s = Number.isFinite(opts.scale) && opts.scale > 0 ? opts.scale : 1;
  g.scale.setScalar(s);
  const tri = mesh.geometry.attributes.position.count / 3 * (mesh.isInstancedMesh ? mesh.count : 1);
  g.userData = { lmKind: kind, triangles: Math.round(tri), meshes: 1, schematic: true };
  return g;
}
