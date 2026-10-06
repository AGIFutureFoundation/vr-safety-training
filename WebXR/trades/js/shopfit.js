import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, standingPerson, mergeStatic } from "../../shared/kit.js";

// What is in a bay besides the job.
//
// The rooms were laid out inside about eight metres and every object in them
// was load-bearing for the procedure. At 1.62x that, the procedure's own kit
// is spread across a floor with nothing else on it, and a real bay is never
// like that: there is a shadow board with the tools outlined on it, racking
// with stock on it, a notice board somebody actually reads, a bottle rack,
// a spill station, a fan, a bin, a bench that is not the bench you are
// working at.
//
// None of it is interactive. A bay full of clickable scenery would make every
// find step a lottery, so these are deliberately not registered: they are what
// the room looks like, and the procedure stays exactly as authored.

// Namespaced: a trades room already owns the plain names.
const FIT_STEEL = 0x8b949c, FIT_DARKSTEEL = 0x4a535d;

/** Wall-mounted shadow board: tools outlined where they belong. */
export function shadowBoard(parent, x, z, ry, o = {}) {
  const g = group(parent, x, 0, z, ry);
  const w = o.w ?? 2.0, h = o.h ?? 1.3, y = o.y ?? 1.55;
  box(g, w, h, 0.05, 0, y, 0, o.color ?? 0x2f4a63, { rough: 0.85 });
  decal(g, w - 0.08, h - 0.08, 0, y, 0.031, (c, cw, ch) => {
    c.fillStyle = o.css ?? "#2b4459"; c.fillRect(0, 0, cw, ch);
    // Outlines, not tools: that is the whole point of a shadow board.
    c.strokeStyle = "rgba(10,16,22,0.7)"; c.lineWidth = Math.max(2, cw * 0.007);
    for (let i = 0; i < 6; i++) {
      const bx = cw * (0.07 + i * 0.152);
      c.strokeRect(bx, ch * 0.12, cw * 0.055, ch * 0.42);
      c.beginPath(); c.arc(bx + cw * 0.028, ch * 0.7, cw * 0.032, 0, Math.PI * 2); c.stroke();
    }
    c.fillStyle = "rgba(233,243,250,0.55)";
    c.font = `600 ${Math.round(ch * 0.07)}px 'Barlow Condensed', Arial, sans-serif`;
    c.textAlign = "left"; c.textBaseline = "middle";
    c.fillText(String(o.label ?? "TOOL BOARD — RETURN EVERY TOOL TO ITS OUTLINE").toUpperCase(), cw * 0.05, ch * 0.93);
  }, { px: 512, rough: 0.85 });
  // A few tools actually hanging on it, and a few gaps where they are not.
  for (const [i, kind] of [[0, "sp"], [1, "sp"], [3, "wr"], [5, "wr"]]) {
    const bx = -w / 2 + 0.1 + (0.07 + i * 0.152) * (w - 0.08) + 0.03;
    if (kind === "sp") box(g, 0.05, h * 0.38, 0.03, bx, y + h * 0.16, 0.04, FIT_STEEL, { rough: 0.4, metal: 0.8 });
    else cyl(g, 0.026, 0.026, h * 0.3, bx, y + h * 0.18, 0.04, FIT_STEEL, { rough: 0.4, metal: 0.8, seg: 8 });
  }
  return g;
}

/** Bolted shelving with stock on it — the wall of every store and bay. */
export function racking(parent, x, z, ry, o = {}) {
  const g = group(parent, x, 0, z, ry);
  const w = o.w ?? 2.4, d = o.d ?? 0.6, h = o.h ?? 2.2, shelves = o.shelves ?? 4;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(g, 0.06, h, 0.06, sx * (w / 2 - 0.04), h / 2, sz * (d / 2 - 0.04), o.frame ?? 0x9c5a32, { rough: 0.7, metal: 0.25 });
  }
  const tone = o.stock ?? [0x6b7480, 0x8a7a5e, 0x4d6b7a, 0x7a5f4a];
  for (let i = 0; i < shelves; i++) {
    // Leave the top shelf's stock room under the uprights: at (h - 0.4) the
    // boxes on the top shelf stood 0.2m proud of the frame.
    const y = 0.28 + i * ((h - 0.78) / (shelves - 1));
    box(g, w, 0.04, d, 0, y, 0, 0x9aa3ab, { rough: 0.6, metal: 0.4, cast: false });
    // Stock: a couple of boxed items per shelf, never a full one.
    const n = 2 + (i % 2);
    for (let k = 0; k < n; k++) {
      const bw = w / (n + 1.2);
      box(g, bw * 0.82, 0.3, d * 0.72, -w / 2 + bw * (k + 0.75), y + 0.17, 0,
        tone[(i + k) % tone.length], { rough: 0.9 });
    }
  }
  return g;
}

/** The notice board every shop has by the door, with paper actually on it. */
export function noticeBoard(parent, x, z, ry, o = {}) {
  const g = group(parent, x, 0, z, ry);
  const w = o.w ?? 1.5, h = o.h ?? 1.0, y = o.y ?? 1.6;
  box(g, w + 0.06, h + 0.06, 0.04, 0, y, 0, 0x6b5a42, { rough: 0.9 });
  decal(g, w, h, 0, y, 0.026, (c, cw, ch) => {
    c.fillStyle = "#4c5a45"; c.fillRect(0, 0, cw, ch);
    const sheets = o.sheets ?? [
      [0.05, 0.08, 0.26, 0.4, "#f2efe6"], [0.36, 0.05, 0.3, 0.46, "#eef3f7"],
      [0.7, 0.1, 0.25, 0.34, "#f7f1de"], [0.08, 0.56, 0.34, 0.36, "#eef3f7"],
      [0.48, 0.58, 0.22, 0.3, "#f2efe6"], [0.74, 0.5, 0.2, 0.42, "#e9eff4"],
    ];
    for (const [sx, sy, sw, sh, col] of sheets) {
      c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(cw * sx + 3, ch * sy + 3, cw * sw, ch * sh);
      c.fillStyle = col; c.fillRect(cw * sx, ch * sy, cw * sw, ch * sh);
      c.fillStyle = "rgba(40,50,58,0.5)";
      const lines = Math.max(3, Math.round(sh * 12));
      for (let i = 0; i < lines; i++) {
        c.fillRect(cw * sx + cw * 0.012, ch * sy + ch * sh * (0.14 + i * (0.72 / lines)),
          cw * sw * (0.55 + ((i * 37) % 40) / 100), Math.max(1.5, ch * 0.008));
      }
      c.fillStyle = "#c43a2f";
      c.beginPath(); c.arc(cw * (sx + sw / 2), ch * sy + ch * 0.012, Math.max(2, cw * 0.007), 0, Math.PI * 2); c.fill();
    }
  }, { px: 512, rough: 0.9 });
  return g;
}

/** Bottle rack — gas, solvent or chemistry, upright and chained. */
export function bottleRack(parent, x, z, ry, o = {}) {
  const g = group(parent, x, 0, z, ry);
  const n = o.count ?? 4, colours = o.colors ?? [0x2f5d3a, 0x8a3a2f, 0x2f4a63, 0xb0902f];
  box(g, n * 0.32 + 0.2, 0.08, 0.42, 0, 0.04, 0, FIT_DARKSTEEL, { rough: 0.7, metal: 0.4 });
  for (const sx of [-1, 1]) cyl(g, 0.03, 0.03, 1.5, sx * (n * 0.16 + 0.05), 0.75, -0.16, FIT_DARKSTEEL, { rough: 0.5, metal: 0.6, seg: 8 });
  box(g, n * 0.32 + 0.2, 0.04, 0.04, 0, 1.15, -0.16, 0xd8a33a, { rough: 0.6 });
  for (let i = 0; i < n; i++) {
    const bx = -n * 0.16 + 0.16 + i * 0.32;
    cyl(g, 0.115, 0.115, 1.18, bx, 0.67, 0, colours[i % colours.length], { rough: 0.6, metal: 0.25, seg: 12 });
    cyl(g, 0.045, 0.06, 0.16, bx, 1.34, 0, 0xb8bfc6, { rough: 0.45, metal: 0.7, seg: 10 });
  }
  return g;
}

/** Spill station: absorbent, a bin of granules and the sign that names it. */
export function spillStation(parent, x, z, ry, o = {}) {
  const g = group(parent, x, 0, z, ry);
  cyl(g, 0.33, 0.3, 0.86, 0, 0.43, 0, o.color ?? 0xd8a33a, { rough: 0.7, seg: 16 });
  cyl(g, 0.34, 0.34, 0.06, 0, 0.89, 0, 0x2b323a, { rough: 0.6, seg: 16 });
  box(g, 0.5, 0.34, 0.03, 0, 1.36, 0, 0x1d2630, { rough: 0.8 });
  decal(g, 0.46, 0.3, 0, 1.36, 0.018, (c, cw, ch) => {
    c.fillStyle = "#121a22"; c.fillRect(0, 0, cw, ch);
    c.fillStyle = "#e8b53c";
    c.font = `700 ${Math.round(ch * 0.27)}px 'Barlow Condensed', Arial, sans-serif`;
    c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText("SPILL", cw / 2, ch * 0.3);
    c.fillText("STATION", cw / 2, ch * 0.62);
    c.font = `500 ${Math.round(ch * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
    c.fillStyle = "#c9d6de";
    c.fillText("ABSORBENT · BAGS · SIGNS", cw / 2, ch * 0.87);
  }, { px: 256, rough: 0.8 });
  cyl(g, 0.02, 0.02, 1.3, 0, 0.65, -0.02, FIT_DARKSTEEL, { rough: 0.5, metal: 0.6, seg: 6 });
  return g;
}

/** A second bench — the one you are not working at, with clutter on it. */
export function sideBench(parent, x, z, ry, o = {}) {
  const g = group(parent, x, 0, z, ry);
  const w = o.w ?? 2.2, d = o.d ?? 0.7, h = o.h ?? 0.9;
  box(g, w, 0.08, d, 0, h, 0, o.top ?? 0x6b6255, { rough: 0.85 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(g, 0.07, h, 0.07, sx * (w / 2 - 0.1), h / 2, sz * (d / 2 - 0.1), FIT_DARKSTEEL, { rough: 0.6, metal: 0.4 });
  }
  box(g, w - 0.3, 0.05, d - 0.2, 0, 0.3, 0, FIT_DARKSTEEL, { rough: 0.7, metal: 0.3, cast: false });
  // Clutter, because an empty bench reads as furniture rather than a shop.
  box(g, 0.34, 0.14, 0.26, -w * 0.3, h + 0.11, 0.04, 0x8a3a2f, { rough: 0.7 });
  cyl(g, 0.07, 0.07, 0.19, w * 0.06, h + 0.14, -0.1, 0x3d4a55, { rough: 0.5, metal: 0.4, seg: 10 });
  box(g, 0.26, 0.03, 0.2, w * 0.3, h + 0.055, 0.08, 0xdfe6ec, { rough: 0.85 });
  for (let i = 0; i < 3; i++) box(g, 0.4, 0.2, 0.3, -w / 2 + 0.35 + i * 0.5, 0.42, 0, i % 2 ? 0x5f6b74 : 0x7a6a52, { rough: 0.9, cast: false });
  return g;
}

/** Pedestal fan — every shop has one, and it is always pointed somewhere. */
export function shopFan(parent, x, z, ry, o = {}) {
  const g = group(parent, x, 0, z, ry);
  cyl(g, 0.3, 0.32, 0.05, 0, 0.025, 0, 0x2b323a, { rough: 0.8, seg: 14 });
  cyl(g, 0.035, 0.045, 1.05, 0, 0.55, 0, FIT_STEEL, { rough: 0.5, metal: 0.6, seg: 10 });
  const head = group(g, 0, 1.2, 0, o.tilt ?? 0.3);
  cyl(head, 0.3, 0.3, 0.1, 0, 0, 0, 0x39424b, { rough: 0.6, metal: 0.4, seg: 18 }).rotation.x = Math.PI / 2;
  const blades = cyl(head, 0.25, 0.25, 0.03, 0, 0, 0.05, 0x9aa3ab, { rough: 0.5, metal: 0.5, seg: 14 });
  blades.rotation.x = Math.PI / 2;
  return { root: g, blades };
}

/** Wheelie bin with a colour that means something on a real site. */
export function wasteBin(parent, x, z, ry, o = {}) {
  const g = group(parent, x, 0, z, ry);
  slab(g, 0.62, 0.92, 0.55, 0, 0.5, 0, o.color ?? 0x2f5d3a, { radius: 0.04, rough: 0.8 });
  slab(g, 0.64, 0.07, 0.57, 0, 0.99, 0, o.lid ?? 0x24462c, { radius: 0.03, rough: 0.7 });
  for (const sx of [-1, 1]) {
    const wheel = cyl(g, 0.09, 0.09, 0.05, sx * 0.24, 0.09, -0.18, 0x15181c, { rough: 0.95, seg: 10 });
    wheel.rotation.z = Math.PI / 2;
  }
  decal(g, 0.44, 0.22, 0, 0.62, 0.281, (c, cw, ch) => {
    c.fillStyle = "rgba(240,248,252,0.9)"; c.fillRect(0, 0, cw, ch);
    c.fillStyle = "#1d2630";
    c.font = `700 ${Math.round(ch * 0.42)}px 'Barlow Condensed', Arial, sans-serif`;
    c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(String(o.label ?? "GENERAL").toUpperCase(), cw / 2, ch * 0.54);
  }, { px: 192, rough: 0.85 });
  return g;
}

/** Hose or cable reel on the wall — air, water, welding lead, extension. */
export function wallReel(parent, x, z, ry, o = {}) {
  const g = group(parent, x, 0, z, ry);
  const y = o.y ?? 2.0;
  box(g, 0.5, 0.14, 0.14, 0, y, -0.06, FIT_DARKSTEEL, { rough: 0.6, metal: 0.5 });
  const drum = cyl(g, 0.3, 0.3, 0.22, 0, y, 0.14, o.color ?? 0x8a3a2f, { rough: 0.6, metal: 0.2, seg: 18 });
  drum.rotation.z = Math.PI / 2;
  cyl(g, 0.33, 0.33, 0.02, 0, y, 0.25, 0x2b323a, { rough: 0.7, metal: 0.4, seg: 18 }).rotation.z = Math.PI / 2;
  cyl(g, 0.014, 0.014, Math.max(0.5, y - 0.55), 0.2, y - Math.max(0.5, y - 0.55) / 2 - 0.1, 0.18,
    o.hose ?? 0x22282e, { rough: 0.8, seg: 6 });
  return g;
}

// --------------------------------------------------------------- the crew

/**
 * Somebody else in the bay.
 *
 * The rooms got bigger and got furniture and were still empty of people. A
 * trade is not a solo activity — there is always somebody at the next bench,
 * and a learner being assessed on working safely around other people should be
 * able to see one. None of them is interactive and none is a hazard: the
 * procedure is unchanged.
 *
 * `task` poses the arms for what they are doing. The figure is then baked in
 * local space, so it is three meshes that still shift their weight and glance
 * about — see mergeStatic's `local` mode in shared/kit.js.
 */
export function bayCrew(parent, x, z, ry, o = {}) {
  const p = standingPerson(parent, x, z, { ry, cloth: o.cloth, legs: o.legs, skin: o.skin, hat: o.hat, vis: o.vis, hiVis: o.hiVis });
  const [left, right] = p.arms;
  switch (o.task) {
    case "bench":       // both hands down at a bench in front of them
      left.shoulder.rotation.x = -0.85; left.fore.rotation.x = -0.55;
      right.shoulder.rotation.x = -0.9; right.fore.rotation.x = -0.5;
      break;
    case "overhead":    // reaching up at something on a rack or a run
      right.shoulder.rotation.x = -2.5; right.fore.rotation.x = 0.4;
      left.shoulder.rotation.x = -0.35;
      break;
    case "clipboard":   // holding a board and reading it
      left.shoulder.rotation.x = -1.2; left.fore.rotation.x = -1.1;
      right.shoulder.rotation.x = -1.0; right.fore.rotation.x = -1.2;
      box(p.torso, 0.24, 0.3, 0.02, 0.06, 1.05, 0.3, 0xdfe6ec, { rough: 0.8 });
      break;
    case "carry":       // one arm down with weight in it
      right.shoulder.rotation.z = -0.12;
      box(p.torso, 0.3, 0.22, 0.2, 0.3, 0.72, 0.02, o.load ?? 0x8a7a5e, { rough: 0.9 });
      break;
    default:            // just standing, watching
      left.shoulder.rotation.x = -0.1; right.shoulder.rotation.x = -0.1;
  }
  mergeStatic(p.root, { local: true });
  // Tagged so tools/check_layout.mjs can insist a person is standing in the
  // room rather than inside the bench — which is exactly what happened the
  // first time these were placed by hand.
  p.root.userData.crew = true;
  p.root.userData.phase = Math.random() * Math.PI * 2;
  p.root.userData.home = ry;
  return p.root;
}

/**
 * Give a list of crew the small, constant motion that separates a person from
 * a mannequin. Drive it from the room's animate().
 */
export function breatheCrew(list, t) {
  for (const c of list) {
    const ph = c.userData.phase ?? 0;
    c.rotation.y = (c.userData.home ?? 0) + Math.sin(t * 0.3 + ph) * 0.14;
    c.position.y = Math.sin(t * 1.1 + ph) * 0.011;
  }
}
