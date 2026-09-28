// Cosmetics on the avatar (docs/skill-gates.md, QUESTMASTER-3). A clean
// side-game run puts one cosmetic id in the per-profile ledger
// (skill-gates.js). This module turns those ids into small procedural decals
// on a world's player figure: each id names a slot by its words (a helmet
// decal, a shoulder patch, a wristband, a fin tag) and takes a colour from a
// hash of the id, so the same cosmetic looks the same in every world. No
// textures, no assets, nothing bought.
//
// The 3D library is taken from the caller as `lib`. Names prefixed `qm`.

import { qmLedger } from "./skill-gates.js";

/** The slots a cosmetic can sit in, matched against the id's words in this order. */
export const QM_COSMETIC_SLOTS = [
  ["head", /helmet|hard ?hat|decal|sticker|\bcap\b|beanie|hood|bandana|wool/i],
  ["wrist", /wrist|bracelet|glove|tape measure|buckle/i],
  ["fin", /\bfin\b|fin-|fins|ribbon|waders|boot/i],
  ["shoulder", /./],
];
export const QM_COSMETIC_PALETTE = [0xff7a1a, 0x4fd1ff, 0x8fe3a1, 0xffd400, 0xd46bff, 0xff5c8a];

function qmCosHash(s) { let h = 11; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }
/** The slot an id sits in: head, wrist, fin or shoulder. */
export function qmCosmeticSlot(id) { return QM_COSMETIC_SLOTS.find(([, re]) => re.test(String(id ?? "")))?.[0] ?? "shoulder"; }
/** The colour an id takes, the same everywhere. */
export function qmCosmeticColor(id) { return QM_COSMETIC_PALETTE[qmCosHash(id) % QM_COSMETIC_PALETTE.length]; }

/**
 * Where each slot sits on a figure: `[x, y, z]` plus the decal's facing.
 * Bay World's person figure stands on y = 0 facing +z; the Deep's diver
 * lies along +z with the mask at the front.
 */
export const QM_FIGURE_ANCHORS = {
  person: { head: [0, 1.66, 0.14], shoulder: [0.27, 1.3, 0.1], wrist: [0.32, 0.92, 0.12], fin: [0.1, 0.03, 0.14] },
  diver: { head: [0, 0.34, 0.42], shoulder: [0.24, 0.32, 0.22], wrist: [0.3, 0.16, 0.34], fin: [0.16, 0.19, -0.8] },
};

function qmDecalMesh(lib, slot, color) {
  const mat = new lib.MeshStandardMaterial({ color, roughness: 0.5, emissive: color, emissiveIntensity: 0.25 });
  // Sized to read from the chase camera: a decal the width of the figure's hand, not a pixel.
  if (slot === "head") { const m = new lib.Mesh(new lib.CylinderGeometry(0.075, 0.075, 0.025, 12), mat); m.rotation.x = Math.PI / 2; return m; }
  if (slot === "wrist") { const m = new lib.Mesh(new lib.TorusGeometry(0.06, 0.022, 6, 12), mat); m.rotation.z = Math.PI / 2; return m; }
  if (slot === "fin") return new lib.Mesh(new lib.BoxGeometry(0.1, 0.04, 0.14), mat);
  return new lib.Mesh(new lib.BoxGeometry(0.14, 0.11, 0.04), mat); // the shoulder patch
}

/**
 * Dress a figure with the cosmetics `ids`: one small decal per id in its
 * slot, several in one slot stepped along. Earlier decals are replaced, so
 * a world can call it again after a game. Returns the decals added.
 */
export function qmDressFigure(lib, figure, ids, anchors = QM_FIGURE_ANCHORS.person) {
  if (!lib || !figure) return 0;
  const old = figure.children?.find?.((c) => c.userData?.qmCosmetics);
  if (old) { old.traverse?.((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); }); figure.remove(old); }
  const list = [...new Set((ids ?? []).filter((x) => typeof x === "string" && x))];
  const g = new lib.Group();
  g.userData.qmCosmetics = list;
  const perSlot = {};
  for (const id of list) {
    const slot = qmCosmeticSlot(id);
    const n = perSlot[slot] = (perSlot[slot] ?? 0) + 1;
    const a = anchors[slot] ?? anchors.shoulder;
    const m = qmDecalMesh(lib, slot, qmCosmeticColor(id));
    const step = (n - 1) * 0.09;
    m.position.set(a[0] + (slot === "head" || slot === "fin" ? step - 0.04 * (n - 1) : 0), a[1] - (slot === "shoulder" || slot === "wrist" ? step : 0), a[2] + (slot === "wrist" ? 0 : 0));
    m.userData.qmCosmetic = id;
    g.add(m);
  }
  figure.add(g);
  return list.length;
}

/** Dress a figure from the profile's ledger. `kind`: "person" or "diver" (or an anchors object). */
export function qmDressFromLedger(lib, figure, kind = "person", storage = null) {
  const anchors = typeof kind === "string" ? QM_FIGURE_ANCHORS[kind] ?? QM_FIGURE_ANCHORS.person : kind;
  return qmDressFigure(lib, figure, qmLedger(storage).cosmetics, anchors);
}
