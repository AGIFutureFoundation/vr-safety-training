/**
 * FACADES (the environment wave, prefix `fc`, docs/consoles/FACADES.md): architectural exterior detail and generic
 * business signs on the parish engine's massing, set as `NP_MASSING_HOOKS.details` (shared/np-world.js).
 *
 * Seam (the engine calls it per massing chunk):
 *
 *     fcDetails({ THREE, parish, chunk: { cx, cz, key, ring, lod }, spots: [{ kind, x, z, y, rot, s, h }], tier })
 *       -> THREE.Group named "mass-details-<key>" | null
 *
 * The group holds a handful of meshes per chunk, never one per building: one InstancedMesh per massing kind present
 * (a merged, vertex-coloured "kit" of that kind's details, drawn with the building's own matrix), one more for the roof
 * items of stretched kinds (roof tanks ride at the top, unstretched), and one merged mesh of signs (text from one canvas
 * atlas). Near ring only (FC_NEAR_RING); the phone tier ("low") keeps each kit's two cheapest details and no signs.
 * `group.userData.fc` = { kits, signs: [{ word, type, x, z }], triangles, meshes }; `group.dispose()` frees what the chunk owns.
 *
 * Everything here is procedural and generic: nothing models a real building, and the signs name generic trades only
 * (FC_SIGN_WORDS) — never a real business or brand. TYCOON's player-opened businesses keep their own sign at their
 * listing's site (parishes app, `tySignsFor`). The data (FC_DETAIL_KINDS, FC_KITS, FC_SIGN_WORDS, FC_SIGN_COLOURS,
 * FC_BUDGET) is plain and dependency-free so TQ-BRIDGE can export it to exports/shared/.
 */
import { NP_MASSING_HOOKS } from "./np-world.js";
import { npDistrictAt } from "./np-parish.js";

/** The detail kinds FACADES draws (plain data; `stretch` = drawn in the building's unit-height space). */
export const FC_DETAIL_KINDS = [
  { id: "windowGrid", label: "Window grid", note: "dark window panes on the facades, a grid per floor" },
  { id: "windowBand", label: "Window band", note: "ribbon windows along a floor (sheds, campus blocks)" },
  { id: "mullions", label: "Curtain-wall mullions", note: "vertical glazing strips up a tower" },
  { id: "cornice", label: "Cornice", note: "a projecting band at the roof line" },
  { id: "parapet", label: "Parapet", note: "a low wall around a flat roof" },
  { id: "shutters", label: "Shutters", note: "painted shutters beside the windows (New Orleans)" },
  { id: "gallery", label: "Gallery", note: "posts and an iron-style railing under the upper gallery (New Orleans quarter)" },
  { id: "balcony", label: "Balcony", note: "a small railed balcony on the upper floor" },
  { id: "bayWindow", label: "Bay window", note: "a projecting upper-floor window bay (San Francisco / Oakland)" },
  { id: "stoop", label: "Stoop", note: "front steps up to the door" },
  { id: "porch", label: "Porch", note: "a front porch with posts and a roof" },
  { id: "awning", label: "Awning", note: "a sloped awning over a ground-floor shopfront" },
  { id: "fireEscape", label: "Fire escape", note: "landings and rails up a side wall (San Francisco / Oakland)" },
  { id: "roofTank", label: "Roof tank", note: "a water tank on legs on the roof (San Francisco / Oakland downtown)" },
  { id: "rollUpDoor", label: "Roll-up doors", note: "loading doors with a lintel on sheds and warehouses" },
  { id: "loadingDock", label: "Loading dock", note: "a raised dock apron in front of the doors (port sheds)" },
  { id: "tankRail", label: "Tank rail and ladder", note: "a top guard rail and a ladder on a storage tank" },
];

/**
 * Which details each massing kind gets, per region group ("new-orleans" or "bay" for every Bay Area region), listed
 * cheapest first: the phone tier keeps the first two (tools/check_facades.mjs proves the order by triangle count).
 * A kind's shed kit also varies by character ("port" adds the loading dock).
 */
export const FC_KITS = {
  quarterBlock: { "new-orleans": ["cornice", "awning", "windowGrid", "shutters", "gallery"], bay: ["cornice", "awning", "windowGrid", "bayWindow", "fireEscape"] },
  gardenHouse: { "new-orleans": ["windowGrid", "shutters", "stoop", "porch"], bay: ["windowGrid", "bayWindow", "stoop", "porch"] },
  suburbHouse: { "new-orleans": ["windowGrid", "shutters", "stoop", "porch"], bay: ["windowGrid", "bayWindow", "stoop", "balcony"] },
  shed: { "new-orleans": ["windowBand", "rollUpDoor", "parapet"], bay: ["windowBand", "rollUpDoor", "parapet"], port: ["windowBand", "rollUpDoor", "loadingDock"] },
  tower: { "new-orleans": ["mullions", "cornice"], bay: ["mullions", "cornice", "fireEscape", "roofTank"] },
  campusBlock: { "new-orleans": ["windowBand", "cornice", "parapet"], bay: ["windowBand", "cornice", "parapet"] },
  tank: { "new-orleans": ["tankRail"], bay: ["tankRail"] },
};

/** The generic trades a storefront sign may name — never a real business or brand. */
export const FC_SIGN_WORDS = [
  "Hardware", "Bakery", "Laundry", "Tool Rental", "Café", "Grocery", "Barber", "Tailor",
  "Books", "Bike Repair", "Deli", "Florist", "Shoe Repair", "Print Shop", "Diner", "Pharmacy",
];
/** Board and lettering colours (hex), paired by word index modulo the list; PALETTE checks their contrast. */
export const FC_SIGN_COLOURS = [
  { board: "#1f3a5f", text: "#f4efe3" }, { board: "#7a2e22", text: "#fbf3e4" },
  { board: "#f1e6c8", text: "#2a2320" }, { board: "#234d36", text: "#f2f0e6" },
];
/** Budgets: detail rings per tier, meshes and triangles per chunk per tier, and the sign share of shop buildings. */
export const FC_BUDGET = {
  nearRing: { low: 0, balanced: 1, high: 1 },
  meshesPerChunk: { low: 4, balanced: 6, high: 6 },
  trianglesPerChunk: { low: 6000, balanced: 24000, high: 24000 },
  signShare: 0.35,
  signKinds: ["quarterBlock", "tower"],
};

// -------------------------------------------------------------------- kits

/** The massing bodies' footprints in the engine's geometry (np-world.js npMassingGeometries); `unit` kinds stretch by h. */
const FC_BODY = {
  quarterBlock: { w: 16, d: 12, h: 8 }, gardenHouse: { w: 12, d: 10, h: 6 }, suburbHouse: { w: 10, d: 9, h: 4.5 },
  shed: { w: 40, d: 22, h: 1, unit: true }, tower: { w: 22, d: 22, h: 1, unit: true }, campusBlock: { w: 28, d: 18, h: 1, unit: true },
  tank: { w: 18, d: 18, h: 1, unit: true },
};
const FC_C = { glass: 0x2b3440, glassBay: 0x35434f, trim: 0xefe9dc, shutterNo: 0x2f5d45, iron: 0x23262a, awning: 0x8c3b2e, stone: 0x9a938a, door: 0x6d7378, steel: 0xb8bcc0, wood: 0x7a5a3c, tank: 0x6b5140, dock: 0x8a8f94 };

const fcCache = new WeakMap(); // THREE -> { kits: Map, mat, signMat }
function fcStore(THREE) { let s = fcCache.get(THREE); if (!s) { s = { kits: new Map(), mat: null, signMat: null, parts: new Map() }; fcCache.set(THREE, s); } return s; }

/** Parts of one detail on one body: [[geometry, colour, Matrix4]] in the building's local space (y up from its base). */
function fcDetailParts(THREE, id, kind, b) {
  const P = [], M = (x, y, z, ry = 0) => new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z);
  const box = (w, h, d, c, x, y, z, ry = 0) => P.push([new THREE.BoxGeometry(w, h, d), c, M(x, y, z, ry)]);
  const quad = (w, h, c, x, y, z, ry) => P.push([new THREE.PlaneGeometry(w, h), c, M(x, y, z, ry)]);
  const fw = b.w / 2, fd = b.d / 2;
  // a face: its outward yaw, its centre offset and its width
  const faces = [[0, 0, fd + 0.03, b.w], [Math.PI, 0, -fd - 0.03, b.w], [Math.PI / 2, fw + 0.03, 0, b.d], [-Math.PI / 2, -fw - 0.03, 0, b.d]];
  const onFace = ([ry, ox, oz], u, y, w, h, c) => quad(w, h, c, ox + Math.cos(ry) * u, y, oz - Math.sin(ry) * u, ry);
  if (id === "windowGrid") {
    const rows = kind === "quarterBlock" ? [5.6] : kind === "gardenHouse" ? [3.2] : [2.4];
    for (const f of faces.slice(0, 2)) {
      const cols = Math.max(2, Math.round(f[3] / 4));
      for (const y of rows) for (let i = 0; i < cols; i++) onFace(f, -f[3] / 2 + (i + 0.5) * (f[3] / cols), y, 1.2, 1.6, FC_C.glass);
    }
  } else if (id === "shutters") {
    const y = kind === "quarterBlock" ? 5.6 : kind === "gardenHouse" ? 3.2 : 2.4, f = faces[0];
    const cols = Math.max(2, Math.round(f[3] / 4));
    for (let i = 0; i < cols; i++) { const u = -f[3] / 2 + (i + 0.5) * (f[3] / cols); onFace(f, u - 0.95, y, 0.55, 1.7, FC_C.shutterNo); onFace(f, u + 0.95, y, 0.55, 1.7, FC_C.shutterNo); }
  } else if (id === "cornice") {
    if (b.unit) box(b.w + 1, 0.014, b.d + 1, FC_C.stone, 0, 0.993, 0);
    else box(b.w + 0.8, 0.45, b.d + 0.8, FC_C.trim, 0, b.h + 0.1, 0);
  } else if (id === "parapet") {
    const top = b.unit ? 1 : b.h, t = b.unit ? 0.03 : 0.9, y = top + t / 2 - (b.unit ? 0.005 : 0.1);
    box(b.w, t, 0.3, FC_C.stone, 0, y, fd - 0.15); box(b.w, t, 0.3, FC_C.stone, 0, y, -fd + 0.15);
    box(0.3, t, b.d - 0.6, FC_C.stone, fw - 0.15, y, 0); box(0.3, t, b.d - 0.6, FC_C.stone, -fw + 0.15, y, 0);
  } else if (id === "gallery") {
    // the quarter block's slab at 3.4 m is the gallery floor: posts under it and a railing on it
    for (const x of [-7.4, -2.5, 2.5, 7.4]) box(0.18, 3.3, 0.18, FC_C.iron, x, 1.65, 6.8);
    box(17.6, 0.9, 0.08, FC_C.iron, 0, 3.55 + 0.45, 6.9);
  } else if (id === "balcony") {
    box(3.2, 0.15, 1.1, FC_C.trim, 0, 3.1, fd + 0.55); box(3.2, 0.8, 0.06, FC_C.iron, 0, 3.55, fd + 1.08);
  } else if (id === "bayWindow") {
    const n = kind === "quarterBlock" ? 2 : 1, y0 = kind === "quarterBlock" ? 3.7 : kind === "gardenHouse" ? 2.6 : 2.0, hh = kind === "quarterBlock" ? 4.0 : 2.4;
    for (let i = 0; i < n; i++) { const x = n === 1 ? 0 : (i ? 4 : -4); box(3.2, hh, 0.9, FC_C.trim, x, y0 + hh / 2, fd + 0.45); quad(2.4, hh * 0.6, FC_C.glassBay, x, y0 + hh / 2, fd + 0.92, 0); }
  } else if (id === "stoop") {
    box(2.2, 0.35, 1.4, FC_C.stone, 1.5, 0.175, fd + 0.7); box(2.2, 0.35, 0.7, FC_C.stone, 1.5, 0.525, fd + 0.35);
  } else if (id === "porch") {
    const w = Math.min(b.w - 1, 8);
    box(w, 0.3, 2.2, FC_C.wood, 0, 0.3, fd + 1.1); box(w + 0.4, 0.2, 2.5, FC_C.trim, 0, 2.9, fd + 1.2);
    box(0.2, 2.6, 0.2, FC_C.trim, -w / 2 + 0.2, 1.6, fd + 2.1); box(0.2, 2.6, 0.2, FC_C.trim, w / 2 - 0.2, 1.6, fd + 2.1);
  } else if (id === "awning") {
    const a = new THREE.BoxGeometry(6, 0.12, 1.6).rotateX(0.35);
    P.push([a, FC_C.awning, M(-3.5, 2.7, fd + 0.8)]);
  } else if (id === "fireEscape") {
    if (b.unit) { // up the lower two thirds of a tower's side wall, in unit-height space
      for (let i = 1; i <= 4; i++) box(3.4, 0.004, 1.3, FC_C.iron, 0, i * 0.14, fd + 0.65);
      box(0.1, 0.62, 0.1, FC_C.iron, -1.65, 0.33, fd + 1.25); box(0.1, 0.62, 0.1, FC_C.iron, 1.65, 0.33, fd + 1.25);
    } else {
      for (const y of [3.6, 6.4]) box(3.4, 0.12, 1.3, FC_C.iron, 0, y, -fd - 0.65);
      box(0.1, 5, 0.1, FC_C.iron, -1.65, 4.6, -fd - 1.25); box(0.1, 5, 0.1, FC_C.iron, 1.65, 4.6, -fd - 1.25);
    }
  } else if (id === "roofTank") { // unstretched; a tower draws it in the roof mesh at y + h
    const y = b.unit ? 0 : b.h + 0.3, x = b.unit ? 4 : 4.5, z = b.unit ? -4 : -2.5;
    box(2.6, 1.4, 2.6, FC_C.iron, x, y + 0.7, z);
    P.push([new THREE.CylinderGeometry(1.5, 1.5, 2.6, 8, 1, true), FC_C.tank, M(x, y + 2.7, z)]);
    P.push([new THREE.ConeGeometry(1.6, 0.9, 8), FC_C.tank, M(x, y + 4.45, z)]);
  } else if (id === "mullions") {
    for (const f of faces) { const cols = 4; for (let i = 0; i < cols; i++) onFace(f, -f[3] / 2 + (i + 0.5) * (f[3] / cols), 0.5, 2.6, 0.9, FC_C.glass); }
  } else if (id === "windowBand") {
    const ys = kind === "shed" ? [0.8] : [0.3, 0.6, 0.88];
    const hh = kind === "shed" ? 0.1 : 0.07;
    for (const f of faces.slice(0, 2)) for (const y of ys) onFace(f, 0, y, f[3] - 3, hh, FC_C.glass);
  } else if (id === "rollUpDoor") {
    const f = faces[0];
    for (const u of [-12, 0, 12]) onFace(f, u, 0.28, 4.2, 0.56, FC_C.door);
  } else if (id === "loadingDock") {
    box(34, 0.13, 3, FC_C.dock, 0, 0.065, fd + 1.5);
  } else if (id === "tankRail") { // unit-height space on the unit cylinder of radius 9
    P.push([new THREE.CylinderGeometry(9.25, 9.25, 0.04, 12, 1, true), FC_C.steel, M(0, 1.02, 0)]);
    box(0.5, 1, 0.12, FC_C.steel, 0, 0.5, 9.1);
  }
  return P;
}

/** One detail's own parts count in triangles (the checker's cost order). */
export function fcDetailTriangles(THREE, id, kind) {
  return fcDetailParts(THREE, id, kind, FC_BODY[kind]).reduce((s, [g]) => s + (g.index ? g.index.count : g.attributes.position.count) / 3, 0);
}

function fcMergeParts(THREE, parts) {
  const polys = parts.map(([geo, colour, m]) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(m); return [g, colour]; });
  const total = polys.reduce((s, [g]) => s + g.attributes.position.count, 0);
  const pos = new Float32Array(total * 3), col = new Float32Array(total * 3);
  let o = 0; const c = new THREE.Color();
  for (const [g, colour] of polys) {
    pos.set(g.attributes.position.array, o * 3); c.set(colour);
    for (let i = 0; i < g.attributes.position.count; i++) { col[(o + i) * 3] = c.r; col[(o + i) * 3 + 1] = c.g; col[(o + i) * 3 + 2] = c.b; }
    o += g.attributes.position.count; g.dispose();
  }
  for (const [geo] of parts) geo.dispose();
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("color", new THREE.BufferAttribute(col, 3));
  out.computeVertexNormals();
  return out;
}

/** The region group a parish's kits read: New Orleans or the Bay Area. */
export function fcRegionGroup(parish) { return (parish?.region ?? "new-orleans") === "new-orleans" ? "new-orleans" : "bay"; }

/** The detail ids of one kit on a tier (the phone tier keeps the two cheapest). */
export function fcKitDetails(kind, group, tier = "high") {
  const set = FC_KITS[kind]?.[group] ?? FC_KITS[kind]?.["new-orleans"] ?? [];
  return tier === "low" ? set.slice(0, 2) : set;
}

/** A cached kit: { body, roof } merged geometries for (kind, group, tier); `roof` holds the unstretched roof items of a unit kind. */
export function fcKit(THREE, kind, group, tier = "high") {
  const st = fcStore(THREE), key = `${kind}/${group}/${tier === "low" ? "low" : "high"}`;
  if (st.kits.has(key)) return st.kits.get(key);
  const b = FC_BODY[kind]; let kit = null;
  if (b) {
    const ids = fcKitDetails(kind, group, tier);
    const bodyParts = [], roofParts = [];
    for (const id of ids) (b.unit && id === "roofTank" ? roofParts : bodyParts).push(...fcDetailParts(THREE, id, kind, b));
    kit = { ids, body: bodyParts.length ? fcMergeParts(THREE, bodyParts) : null, roof: roofParts.length ? fcMergeParts(THREE, roofParts) : null };
  }
  st.kits.set(key, kit);
  return kit;
}

// -------------------------------------------------------------------- signs

const FC_ATLAS = { cols: 2, rows: 8, cw: 256, ch: 64 };
function fcSignMaterial(THREE) {
  const st = fcStore(THREE);
  if (st.signMat) return st.signMat;
  let map = null;
  if (typeof document !== "undefined" && document.createElement) {
    try {
      const cv = document.createElement("canvas"); cv.width = FC_ATLAS.cols * FC_ATLAS.cw; cv.height = FC_ATLAS.rows * FC_ATLAS.ch;
      const g = cv.getContext("2d");
      if (g) {
        FC_SIGN_WORDS.forEach((w, i) => {
          const cx = (i % FC_ATLAS.cols) * FC_ATLAS.cw, cy = Math.floor(i / FC_ATLAS.cols) * FC_ATLAS.ch, pal = FC_SIGN_COLOURS[i % FC_SIGN_COLOURS.length];
          g.fillStyle = pal.board; g.fillRect(cx, cy, FC_ATLAS.cw, FC_ATLAS.ch);
          g.strokeStyle = pal.text; g.lineWidth = 3; g.strokeRect(cx + 5, cy + 5, FC_ATLAS.cw - 10, FC_ATLAS.ch - 10);
          g.fillStyle = pal.text; g.font = "bold 32px system-ui, -apple-system, Segoe UI, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
          g.fillText(w, cx + FC_ATLAS.cw / 2, cy + FC_ATLAS.ch / 2 + 1, FC_ATLAS.cw - 24);
        });
        map = new THREE.CanvasTexture(cv);
        if ("SRGBColorSpace" in THREE) map.colorSpace = THREE.SRGBColorSpace;
        map.anisotropy = 4;
      }
    } catch { map = null; }
  }
  st.signMat = map ? new THREE.MeshLambertMaterial({ map }) : new THREE.MeshLambertMaterial({ color: 0xe6dcc4 });
  st.signMat.name = "fc-sign-atlas";
  return st.signMat;
}

function fcHash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
/** The sign (or null) one massing spot carries, deterministic by parish and position: { word, index, type }. */
export function fcSignFor(parish, spot) {
  if (!FC_BUDGET.signKinds.includes(spot.kind)) return null;
  const h = fcHash(`${parish?.id ?? ""}|${Math.round(spot.x * 10)}|${Math.round(spot.z * 10)}`);
  if ((h % 1000) / 1000 >= FC_BUDGET.signShare) return null;
  const index = (h >>> 10) % FC_SIGN_WORDS.length;
  return { word: FC_SIGN_WORDS[index], index, type: ((h >>> 20) % 10) < 7 ? "fascia" : "blade" };
}

/** The merged sign quads of a chunk (world space, atlas UVs) or null. */
function fcSignGeometry(THREE, list) {
  if (!list.length) return null;
  const pos = [], nor = [], uv = [], idx = [];
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  const pushQuad = (m, w, h, cell, flip) => {
    const u0 = (cell % FC_ATLAS.cols) / FC_ATLAS.cols, u1 = u0 + 1 / FC_ATLAS.cols;
    const r = Math.floor(cell / FC_ATLAS.cols), v1 = 1 - r / FC_ATLAS.rows, v0 = v1 - 1 / FC_ATLAS.rows;
    const base = pos.length / 3, s = flip ? -1 : 1;
    const corners = [[-w / 2, -h / 2, u0, v0], [w / 2, -h / 2, u1, v0], [w / 2, h / 2, u1, v1], [-w / 2, h / 2, u0, v1]];
    for (const [x, y, uu, vv] of corners) { v.set(x * s, y, 0).applyMatrix4(m); pos.push(v.x, v.y, v.z); uv.push(uu, vv); }
    n.set(0, 0, s).transformDirection(m); for (let i = 0; i < 4; i++) nor.push(n.x, n.y, n.z);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), p = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  for (const { spot, sign } of list) {
    const b = FC_BODY[spot.kind], fd = b.d / 2 * spot.s, fw = b.w / 2 * spot.s;
    q.setFromAxisAngle(up, spot.rot);
    if (sign.type === "fascia") {
      const local = spot.kind === "quarterBlock" ? new THREE.Vector3(3.5 * spot.s, 2.5, fd + 0.08) : new THREE.Vector3(0, 4.2, fd + 0.08);
      p.copy(local).applyQuaternion(q).add(v.set(spot.x, spot.y - 0.15, spot.z));
      m.compose(p, q, one); pushQuad(m, spot.kind === "quarterBlock" ? 3.6 : 6, spot.kind === "quarterBlock" ? 0.9 : 1.5, sign.index, false);
    } else {
      const local = new THREE.Vector3(fw - 0.6, spot.kind === "quarterBlock" ? 2.9 : 4.6, fd + 0.7);
      p.copy(local).applyQuaternion(q).add(v.set(spot.x, spot.y - 0.15, spot.z));
      const qb = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(up, Math.PI / 2));
      m.compose(p, qb, one); pushQuad(m, 1.6, 0.4 * 1.6, sign.index, false); pushQuad(m, 1.6, 0.4 * 1.6, sign.index, true);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

// -------------------------------------------------------------------- the hook

const fcTri = (g) => (g.index ? g.index.count : g.attributes.position.count) / 3;

/** The seam: build one chunk's exterior detail and signs (see the header). */
export function fcDetails({ THREE, parish, chunk, spots, tier = "high" } = {}) {
  if (!THREE || !parish || !chunk || !Array.isArray(spots) || !spots.length) return null;
  const tierKey = tier === "low" ? "low" : tier === "balanced" ? "balanced" : "high";
  if ((chunk.ring ?? 0) > (FC_BUDGET.nearRing[tierKey] ?? 0)) return null;
  const st = fcStore(THREE);
  st.mat ??= Object.assign(new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), { name: "fc-details" });
  const group = new THREE.Group(); group.name = `mass-details-${chunk.key}`;
  const regionGroup = fcRegionGroup(parish);
  // the spots the engine drew (the phone tier drops every fifth of each kind, as np-world.js does)
  const byKind = {};
  for (const s of spots) (byKind[s.kind] ??= []).push(s);
  const drawn = {};
  for (const [kind, list] of Object.entries(byKind)) drawn[kind] = tierKey === "low" ? list.filter((_, i) => i % 5 !== 4) : list;
  // bucket per kit (a shed's kit reads its district: a port shed has a loading dock)
  const buckets = new Map();
  for (const [kind, list] of Object.entries(drawn)) {
    if (!FC_BODY[kind]) continue;
    for (const s of list) {
      let g = regionGroup;
      if (kind === "shed" && npDistrictAt(parish, s.x, s.z)?.character === "port") g = "port";
      const k = `${kind}|${g}`; if (!buckets.has(k)) buckets.set(k, { kind, g, list: [] }); buckets.get(k).list.push(s);
    }
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), v = new THREE.Vector3(), sc = new THREE.Vector3();
  const kits = [];
  let triangles = 0;
  for (const { kind, g, list } of buckets.values()) {
    const kit = fcKit(THREE, kind, g, tierKey);
    if (!kit) continue;
    kits.push(`${kind}/${g}`);
    const unit = FC_BODY[kind].unit;
    if (kit.body) {
      const im = new THREE.InstancedMesh(kit.body, st.mat, list.length);
      list.forEach((s, i) => { q.setFromAxisAngle(up, s.rot); m4.compose(v.set(s.x, s.y - 0.15, s.z), q, unit ? sc.set(s.s, s.h, s.s) : sc.set(s.s, s.s, s.s)); im.setMatrixAt(i, m4); });
      im.name = `fc-${kind}-${g}`; im.userData.fcKit = kit.ids; group.add(im); triangles += fcTri(kit.body) * list.length;
    }
    if (kit.roof) {
      const im = new THREE.InstancedMesh(kit.roof, st.mat, list.length);
      list.forEach((s, i) => { q.setFromAxisAngle(up, s.rot); m4.compose(v.set(s.x, s.y - 0.15 + s.h, s.z), q, sc.set(s.s, 1, s.s)); im.setMatrixAt(i, m4); });
      im.name = `fc-${kind}-${g}-roof`; group.add(im); triangles += fcTri(kit.roof) * list.length;
    }
  }
  // signs over ground-floor shops (not on the phone tier)
  const signs = [];
  if (tierKey !== "low") {
    const list = [];
    for (const kind of FC_BUDGET.signKinds) for (const s of drawn[kind] ?? []) { const sign = fcSignFor(parish, s); if (sign) { list.push({ spot: s, sign }); signs.push({ word: sign.word, type: sign.type, x: s.x, z: s.z }); } }
    const geo = fcSignGeometry(THREE, list);
    if (geo) { const mesh = new THREE.Mesh(geo, fcSignMaterial(THREE)); mesh.name = "fc-signs"; group.add(mesh); triangles += fcTri(geo); }
  }
  if (!group.children.length) return null;
  group.userData.fc = { kits, signs, triangles: Math.round(triangles), meshes: group.children.length };
  group.dispose = () => { for (const o of group.children) { if (o.name === "fc-signs") o.geometry.dispose(); o.dispose?.(); } };
  return group;
}

// Register the hook (FACADES owns `details`; PALETTE owns `material` — never touched here).
NP_MASSING_HOOKS.details = fcDetails;
