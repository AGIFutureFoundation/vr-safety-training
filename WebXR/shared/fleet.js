import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, mat, mergeStatic, gradientFill, noiseTexture, grimeOverlay } from "./kit.js";

// Shared fleet kit — every vehicle a station parks, drives or inspects.
//
// Before this file every station drew its own truck inline: a box for a cab,
// six cylinders for wheels, a slab for a boom. They read as diagrams, they
// were a different size in every station, and a Class 8 tractor in one yard
// was a pickup-sized block in the next. These builders are the one version.
//
// Conventions every builder here (and in equipment.js / toolkit.js) keeps:
//   - signature `(parent, x, y, z, opts)`; `opts.ry` turns it about Y.
//   - metres, real proportions of the class it stands for.
//   - the front faces +Z; the driver's (left) side is +X; y = 0 is the ground.
//   - the footprint is centred on the origin in X and Z.
//   - returns a Group whose `userData.parts` names what a station animates or
//     registers as a control: doors, wheels, mirrors, lights, boom, bucket,
//     mast, outriggers. Every named part is its own small baked mesh set, so it
//     still moves; the static shell is baked with mergeStatic() into one mesh
//     per material. `userData.footprint` is [width X, height Y, length Z].
//   - paint is textured, not flat: the kit's painted/brushed finishes, and
//     canvas faces (door panels, grilles, tread plate, tyres) that are cached
//     per look so the same door on ten trucks is one texture and still merges.
//   - `opts.livery` = { colour, fleetName, unitNumber } is painted onto doors
//     and side panels. Defaults are the platform's own generic names. A
//     station must never pass a real company's or union's name or mark, and no
//     real emblem (Star of Life, Red Cross, a carrier's logo) is ever drawn.
//
// The declared mesh count per builder is FLEET_BUDGET below, and
// tools/check_fleet.mjs holds every builder to it, to its footprint and to its
// named parts. See docs/fleet.md.

// ------------------------------------------------------------------ helpers

/** A colour as a number, from a number or a css hex string. */
export function flHex(c, fallback = 0xffffff) {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return fallback;
  let s = c.trim().replace(/^#/, "");
  if (s.length === 3) s = s.split("").map((ch) => ch + ch).join("");
  const n = parseInt(s, 16);
  return Number.isFinite(n) ? n : fallback;
}
export function flCss(n) { return `#${((n >>> 0) & 0xffffff).toString(16).padStart(6, "0")}`; }
/** Multiply a colour's channels by k (k < 1 darkens, > 1 lightens). */
export function flShade(n, k) {
  const ch = (s) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

// Material presets, as [colour, mat() options] pairs spread into box()/cyl().
// Every one is a cached kit material, so the shell merges them per material.
export const FL = {
  // Metalness stays moderate on purpose: the scenes carry no environment map,
  // and a 0.9-metal chrome with nothing to reflect renders nearly black.
  chrome: [0xe4e8ec, { rough: 0.22, metal: 0.55, finish: "brushed" }],
  alu: [0xc8ced4, { rough: 0.32, metal: 0.45, finish: "brushed" }],
  frame: [0x25292e, { rough: 0.6, metal: 0.5, finish: "painted" }],
  black: [0x17191c, { rough: 0.78, metal: 0.1, finish: "rubber" }],
  steel: [0x7d858d, { rough: 0.45, metal: 0.5, finish: "galvanised" }],
  amber: [0xffab2e, { emissive: 0xff8a00, ei: 0.9, rough: 0.35 }],
  red: [0xd8322c, { emissive: 0xc01810, ei: 0.8, rough: 0.35 }],
  lamp: [0xf6f4ea, { emissive: 0xfff2cc, ei: 1.1, rough: 0.2 }],
  blue: [0x2f6fe0, { emissive: 0x1650ff, ei: 0.9, rough: 0.35 }],
  green: [0x3fc26a, { emissive: 0x16b04a, ei: 0.9, rough: 0.35 }],
  hoseRed: [0xc62828, { rough: 0.6 }],
  hoseBlue: [0x1f5fb8, { rough: 0.6 }],
};
/** Body paint for a colour: a painted finish with a clear-coat sheen. */
export function flPaint(colour) { return [colour, { rough: 0.36, metal: 0.32, finish: "painted" }]; }

const flCanvasCache = new Map();
/**
 * A cached material with its own canvas face. Keyed by look, so every door of
 * the same livery shares one texture and the meshes that use it can merge.
 * Not flagged ownMaterial, deliberately: mergeStatic() leaves ownMaterial
 * alone, and these are shared, never animated.
 */
export function flCanvasMat(key, pw, ph, draw, o = {}) {
  const hit = flCanvasCache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = pw; canvas.height = ph;
  const g = canvas.getContext("2d");
  try { draw(g, pw, ph); } catch (e) { /* headless 2D stub: no pixels, same build */ }
  const tex = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (o.repeat) {
    if (THREE.RepeatWrapping !== undefined) { tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; }
    tex.repeat?.set?.(o.repeat[0], o.repeat[1]);
  }
  const m = new THREE.MeshStandardMaterial({
    map: tex, roughness: o.rough ?? 0.6, metalness: o.metal ?? 0.1,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1, emissiveMap: o.glow ? tex : null,
    transparent: !!o.transparent, alphaTest: o.transparent ? 0.05 : 0,
    side: o.double ? THREE.DoubleSide : THREE.FrontSide,
  });
  m.userData.fleetCanvas = key;
  flCanvasCache.set(key, m);
  return m;
}

/** A flat painted panel facing `face` ("+x", "-x", "+z", "-z", "+y"), optionally tilted back by `tilt`. */
export function flPanel(parent, w, h, x, y, z, material, face = "+z", tilt = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  m.position.set(x, y, z);
  if (face === "+y") m.rotation.set(-Math.PI / 2, 0, 0);
  else if (face === "-y") m.rotation.set(Math.PI / 2, 0, 0);
  else {
    // Tilt back first (about local X), then face the direction (about Y).
    const ry = { "+z": 0, "-z": Math.PI, "+x": Math.PI / 2, "-x": -Math.PI / 2 }[face] ?? 0;
    m.rotation.set(-tilt, ry, 0, "YXZ");
  }
  m.castShadow = false; m.receiveShadow = true;
  parent.add(m);
  return m;
}

/** A box with a given material object (a canvas face) rather than a colour. */
export function flBox(parent, w, h, d, x, y, z, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m);
  return m;
}

/**
 * A side profile extruded across the vehicle: `pts` are [back, y] pairs where
 * `back` runs rearward (toward -Z) from z, `width` is across X. Hoods, cabs,
 * fenders and fairings read as vehicles from this one call where stacked
 * boxes read as blocks. `extra` merges into the material options (bevel).
 */
export function flSide(parent, pts, width, x, y, z, colour, o = {}, extra = {}) {
  o = { ...o, ...extra };
  const shape = new THREE.Shape();
  pts.forEach(([pb, py], i) => (i ? shape.lineTo(pb, py) : shape.moveTo(pb, py)));
  // The bevel rounds the edges inward (bevelOffset), so `pts` stay the true
  // outer outline and a panel laid on the surface sits where the numbers say.
  const bevel = Math.min(o.bevel ?? 0.03, width / 4);
  const depth = Math.max(0.002, width - 2 * bevel);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 2, curveSegments: 4,
  });
  geo.translate(0, 0, -depth / 2);
  const m = new THREE.Mesh(geo, o.material ?? mat(colour, o));
  m.position.set(x, y, z);
  m.rotation.y = Math.PI / 2;
  m.castShadow = o.cast !== false; m.receiveShadow = true;
  parent.add(m);
  return m;
}

/** A plan shape ([x, z] pairs, seen from above) extruded upward by `h` from y. */
export function flPlan(parent, pts, h, x, y, z, colour, o = {}, extra = {}) {
  o = { ...o, ...extra };
  const shape = new THREE.Shape();
  pts.forEach(([px, pz], i) => (i ? shape.lineTo(px, -pz) : shape.moveTo(px, -pz)));
  const bevel = Math.min(o.bevel ?? 0.02, h / 4);
  const depth = Math.max(0.002, h - 2 * bevel);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 1, curveSegments: 4,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, bevel, 0);
  const m = new THREE.Mesh(geo, o.material ?? mat(colour, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false; m.receiveShadow = true;
  parent.add(m);
  return m;
}

/** A cylinder laid along an axis ("x" or "z"). */
export function flRod(parent, r, len, x, y, z, axis, colour, o = {}, extra = {}) {
  o = { ...o, ...extra };
  const c = cyl(parent, r, o.r2 ?? r, len, x, y, z, colour, { seg: o.seg ?? 12, ...o });
  if (axis === "x") c.rotation.z = Math.PI / 2;
  else if (axis === "z") c.rotation.x = Math.PI / 2;
  return c;
}

/** A straight rod between two points — handrails, rungs, hydraulic rams, tie bars. */
export function flStrut(parent, a, b, r, colour, o = {}, extra = {}) {
  o = { ...o, ...extra };
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const len = Math.hypot(dx, dy, dz) || 0.001;
  const c = cyl(parent, r, o.r2 ?? r, len, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, colour, { seg: o.seg ?? 8, ...o });
  // Cylinder axis is +Y: tip it onto the segment (pitch about X, then yaw about Y).
  const yaw = Math.atan2(dx, dz), pitch = Math.acos(Math.max(-1, Math.min(1, dy / len)));
  c.rotation.set(pitch, yaw, 0, "YXZ");
  return c;
}

/**
 * A box from point a to point b with a w × h section — booms, sticks, arms,
 * beams. The box's length runs along the segment; its height stays "up".
 */
export function flBeam(parent, a, b, w, h, colour, o = {}, extra = {}) {
  o = { ...o, ...extra };
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const len = Math.hypot(dx, dy, dz) || 0.001;
  const m = box(parent, w, h, len, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, colour, o);
  m.rotation.set(-Math.atan2(dy, Math.hypot(dx, dz)), Math.atan2(dx, dz), 0, "YXZ");
  return m;
}

// ------------------------------------------------------------------- rigs

/**
 * Start a builder: the root group (placed and turned), a static shell that
 * will be baked, and a `part()` factory for the named pieces that stay free.
 * A part may hang off another part (a stick off a boom, a bucket off a stick)
 * and each still bakes only its own meshes.
 */
export function flRig(parent, x, y, z, opts = {}, kind = "vehicle", offset = null) {
  const root = group(parent, x, y, z, opts.ry ?? 0);
  root.name = kind;
  // `offset` shifts everything inside the root, for builders authored from a
  // natural origin (an excavator's swing centre) that must still be centred.
  const base = offset ? group(root, offset[0], offset[1], offset[2]) : root;
  const shell = group(base);
  shell.name = `${kind}:shell`;
  shell.userData.fleetBake = true;
  const parts = {};
  return {
    root, base, shell, parts, kind,
    part(name, px = 0, py = 0, pz = 0, host = base) {
      const p = group(host, px, py, pz);
      p.name = name;
      p.userData.fleetPart = name;
      p.userData.fleetBake = true;
      parts[name] = p;
      return p;
    },
    /** A container that names a set of parts without baking anything itself. */
    set(name, list, host = null) {
      parts[name] = list;
      void host;
      return list;
    },
  };
}

/** Bake a part or shell: merge its own meshes, leaving nested parts free. */
function flBake(g) {
  const cut = [];
  const walk = (o) => { for (const c of [...o.children]) { if (c.userData?.fleetBake) cut.push([o, c]); else walk(c); } };
  walk(g);
  for (const [p, c] of cut) p.remove(c);
  mergeStatic(g, { local: true });
  for (const [p, c] of cut) p.add(c);
}

/** Finish a builder: bake every shell and part, then publish parts and metadata. */
export function flDone(rig, meta = {}) {
  const baked = [];
  rig.root.traverse((o) => { if (o.userData?.fleetBake) baked.push(o); });
  for (const b of baked) flBake(b);
  rig.root.userData.parts = rig.parts;
  rig.root.userData.kind = rig.kind;
  Object.assign(rig.root.userData, meta);
  return rig.root;
}

// ----------------------------------------------------------------- livery

/**
 * The livery a builder paints: colour plus the fleet name and unit number.
 * The defaults are the platform's own; USDOT numbers are always the all-zero
 * placeholder so no real carrier's registration is ever shown.
 */
export function flLivery(l = {}, defaults = {}) {
  const colour = flHex(l.colour ?? l.color ?? defaults.colour ?? 0xf2f2ee);
  const fleetName = String(l.fleetName ?? defaults.fleetName ?? "SMARTCITI FLEET").slice(0, 28);
  const unitNumber = String(l.unitNumber ?? defaults.unitNumber ?? "101").slice(0, 8);
  const accent = flHex(l.accent ?? defaults.accent ?? 0x1c6fb0);
  return { colour, fleetName, unitNumber, accent, key: `${colour}|${fleetName}|${unitNumber}|${accent}` };
}

function flTextFit(g, text, maxW, px, weight = 700) {
  let size = px;
  g.font = `${weight} ${size}px 'Barlow Condensed', Arial, sans-serif`;
  const w = g.measureText(text)?.width ?? 0;
  if (w > maxW && w > 0) size = Math.max(8, Math.floor(size * maxW / w));
  g.font = `${weight} ${size}px 'Barlow Condensed', Arial, sans-serif`;
  return size;
}

/** Painted glass: sky reflection at the top, dark cabin below, one soft streak. */
function flGlassPaint(g, x, y, w, h) {
  let grad = null;
  try { grad = g.createLinearGradient(x, y, x, y + h); } catch { grad = null; }
  if (grad && typeof grad.addColorStop === "function") {
    grad.addColorStop(0, "#9fb6c8"); grad.addColorStop(0.35, "#4d6477"); grad.addColorStop(1, "#141c24");
    g.fillStyle = grad;
  } else g.fillStyle = "#34495a";
  g.fillRect(x, y, w, h);
  g.fillStyle = "rgba(255,255,255,0.10)";
  g.beginPath?.();
  g.moveTo?.(x + w * 0.15, y + h); g.lineTo?.(x + w * 0.45, y); g.lineTo?.(x + w * 0.62, y); g.lineTo?.(x + w * 0.32, y + h);
  g.closePath?.(); g.fill?.();
}

/** Glass for windshields and fixed windows. */
export function flGlassMat() {
  return flCanvasMat("glass", 128, 128, (g, w, h) => flGlassPaint(g, 0, 0, w, h), { rough: 0.08, metal: 0.55, double: true });
}

/**
 * A door face: body colour, painted window (if any), shut line, handle at the
 * rear edge, and the livery. `side` is "L" or "R" because the handle is at the
 * rear edge and a box face's u runs rear-to-front on the right-hand side.
 */
export function flDoorMat(lv, side, o = {}) {
  const win = o.window ?? 0.42;          // fraction of the door height that is glass
  const marks = o.marks ?? "dot";         // "dot" (fleet + unit + USDOT), "fleet", "none"
  const key = `door:${lv.key}:${side}:${win}:${marks}:${o.body ?? ""}`;
  const body = o.body !== undefined ? flHex(o.body) : lv.colour;
  return flCanvasMat(key, 256, 384, (g, w, h) => {
    gradientFill(g, w, h, [[0, flCss(flShade(body, 1.06))], [1, flCss(flShade(body, 0.86))]]);
    noiseTexture(g, w, h, { density: 900, alpha: 0.05 });
    const rearRight = side === "L";        // canvas right edge is the door's rear edge on the left side
    if (win > 0) {
      const wh = h * win;
      g.fillStyle = "#15191d"; g.fillRect(w * 0.04, h * 0.03, w * 0.92, wh);
      flGlassPaint(g, w * 0.07, h * 0.05, w * 0.86, wh - h * 0.04);
    }
    g.strokeStyle = "rgba(0,0,0,0.55)"; g.lineWidth = 4; g.strokeRect?.(2, 2, w - 4, h - 4);
    // handle and lock at the rear edge, just under the belt line
    const hx = rearRight ? w * 0.72 : w * 0.08, hy = h * (win > 0 ? win + 0.1 : 0.4);
    g.fillStyle = "#2a2e33"; g.fillRect(hx, hy, w * 0.2, h * 0.035);
    g.fillStyle = "#c9ced3"; g.fillRect(hx + 2, hy + 2, w * 0.2 - 4, h * 0.02);
    // livery
    if (marks !== "none") {
      const ty = h * (win > 0 ? win + 0.25 : 0.55);
      const fg = (((body >> 16) & 255) * 0.3 + ((body >> 8) & 255) * 0.59 + (body & 255) * 0.11) > 150 ? "#1b2530" : "#f3f5f7";
      g.fillStyle = flCss(lv.accent);
      g.fillRect(w * 0.06, ty - h * 0.07, w * 0.88, h * 0.012);
      g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
      flTextFit(g, lv.fleetName, w * 0.86, Math.round(h * 0.075));
      g.fillText(lv.fleetName, w / 2, ty);
      flTextFit(g, `UNIT ${lv.unitNumber}`, w * 0.8, Math.round(h * 0.05), 600);
      g.fillText(`UNIT ${lv.unitNumber}`, w / 2, ty + h * 0.075);
      if (marks === "dot") {
        g.font = `600 ${Math.round(h * 0.034)}px Arial, sans-serif`;
        g.fillText("USDOT 0000000", w / 2, ty + h * 0.14);
        g.fillText("GVWR SEE PLATE", w / 2, ty + h * 0.185);
      }
    }
    grimeOverlay(g, w, h, { blotches: 2, streaks: 2, alpha: 0.08 });
  }, { rough: 0.38, metal: 0.3 });
}

/** A side panel carrying the fleet name large, unit number and a stripe — box bodies, sleepers, fairings. */
export function flLiveryMat(lv, kind = "panel", o = {}) {
  const key = `livery:${lv.key}:${kind}:${o.base ?? ""}:${o.tape ? 1 : 0}:${o.posts ?? 0}`;
  const pw = o.pw ?? 1024, ph = o.ph ?? 256;
  const base = o.base !== undefined ? flHex(o.base) : null;
  return flCanvasMat(key, pw, ph, (g, w, h) => {
    if (base !== null) {
      gradientFill(g, w, h, [[0, flCss(flShade(base, 1.04))], [1, flCss(flShade(base, 0.9))]]);
      noiseTexture(g, w, h, { density: 1200, alpha: 0.05 });
    } else g.clearRect?.(0, 0, w, h);
    if (o.posts) {                    // aluminium side posts and top/bottom rails on a van
      for (let i = 0; i <= o.posts; i++) {
        const px = (i / o.posts) * w;
        g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(px - 2, 0, 4, h);
        g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(px + 2, 0, 2, h);
        g.fillStyle = "rgba(90,96,104,0.45)";
        for (let y = h * 0.06; y < h * 0.9; y += h * 0.08) g.fillRect(px - 5, y, 2, 2);
      }
      g.fillStyle = "#b7bdc3"; g.fillRect(0, 0, w, h * 0.035); g.fillRect(0, h * 0.94, w, h * 0.06);
    }
    // stripe
    g.fillStyle = flCss(lv.accent);
    g.fillRect(w * 0.04, h * (o.stripeY ?? 0.68), w * 0.92, h * 0.06);
    // fleet name
    const light = base !== null && (((base >> 16) & 255) + ((base >> 8) & 255) + (base & 255)) / 3 > 140;
    g.fillStyle = o.fg ?? (light ? "#18222c" : "#f3f5f7");
    g.textAlign = "center"; g.textBaseline = "middle";
    flTextFit(g, o.title ?? lv.fleetName, w * 0.8, Math.round(h * (o.titleScale ?? 0.3)), 800);
    g.fillText(o.title ?? lv.fleetName, w / 2, h * (o.titleY ?? 0.42));
    g.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
    g.textAlign = "left";
    g.fillText(o.sub ?? `UNIT ${lv.unitNumber}`, w * 0.06, h * 0.84);
    if (o.tape) {                     // DOT-C2 conspicuity tape: alternating red and white
      const seg = w / 60;
      for (let i = 0; i < 60; i++) { g.fillStyle = i % 2 ? "#f4f4f0" : "#c8201c"; g.fillRect(i * seg, h * 0.905, seg, h * 0.035); }
    }
    grimeOverlay(g, w, h, { blotches: 3, streaks: 5, alpha: 0.07 });
  }, { rough: 0.42, metal: 0.25, transparent: base === null });
}

/** Diamond tread plate for steps, catwalks and decks. */
export function flTreadMat() {
  return flCanvasMat("treadplate", 128, 128, (g, w, h) => {
    gradientFill(g, w, h, [[0, "#aab1b8"], [1, "#8d949b"]]);
    noiseTexture(g, w, h, { density: 3000, alpha: 0.12 });
    for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < w; x += 16) {
      g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(x, y, 7, 2);
      g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(x + 1, y + 2, 7, 2);
    }
  }, { rough: 0.4, metal: 0.8 });
}

/** A chrome bar grille in a painted or black surround. */
export function flGrilleMat(kind = "truck", surround = 0x1c1f22) {
  return flCanvasMat(`grille:${kind}:${surround}`, 256, 256, (g, w, h) => {
    g.fillStyle = flCss(surround); g.fillRect(0, 0, w, h);
    if (kind === "car") {
      g.fillStyle = "#0d0f11"; g.fillRect(w * 0.08, h * 0.2, w * 0.84, h * 0.6);
      for (let x = w * 0.1; x < w * 0.9; x += 10) for (let y = h * 0.22; y < h * 0.78; y += 10) {
        g.fillStyle = "#2c3136"; g.fillRect(x, y, 6, 6);
      }
      return;
    }
    g.fillStyle = "#0b0c0e"; g.fillRect(w * 0.06, h * 0.05, w * 0.88, h * 0.9);
    const bars = kind === "vertical" ? 16 : 12;
    for (let i = 0; i < bars; i++) {
      if (kind === "vertical") {
        const x = w * 0.08 + i * (w * 0.84 / bars);
        g.fillStyle = "#d9dee3"; g.fillRect(x, h * 0.06, w * 0.84 / bars * 0.45, h * 0.88);
      } else {
        const y = h * 0.08 + i * (h * 0.84 / bars);
        g.fillStyle = "#d9dee3"; g.fillRect(w * 0.07, y, w * 0.86, h * 0.84 / bars * 0.5);
        g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(w * 0.07, y + h * 0.84 / bars * 0.38, w * 0.86, 2);
      }
    }
    g.strokeStyle = "#e6eaee"; g.lineWidth = 8; g.strokeRect?.(4, 4, w - 8, h - 8);
  }, { rough: 0.25, metal: 0.75 });
}

// ------------------------------------------------------------------- wheels

const FL_WHEEL_STYLES = {
  steel: { rim: "#e9eae6", rim2: "#b3b7ba", holes: 10, lugs: 10 },     // white steel disc
  alloy: { rim: "#dde2e6", rim2: "#9aa3ab", holes: 10, lugs: 10 },     // polished aluminium
  car: { rim: "#9aa1a8", rim2: "#3f454b", spokes: 5, lugs: 5 },        // painted alloy
  black: { rim: "#2b3035", rim2: "#1b1e21", holes: 6, lugs: 6 },       // black steel
  equip: { rim: "#f0c02c", rim2: "#a5831a", holes: 8, lugs: 8 },       // plant yellow
  grey: { rim: "#a8adb2", rim2: "#6b7177", holes: 6, lugs: 6 },
  red: { rim: "#c43129", rim2: "#8a1f1a", holes: 8, lugs: 8 },
};
// Profile indices (0..13) the canvas bands are drawn against; see flWheel.
const FL_WHEEL_N = 13;
function flWheelMat(style, tread) {
  const st = FL_WHEEL_STYLES[style] ?? FL_WHEEL_STYLES.steel;
  return flCanvasMat(`wheel:${style}:${tread}`, 256, 256, (g, w, h) => {
    const row = (j) => (1 - j / FL_WHEEL_N) * h;
    const band = (a, b, fill) => { g.fillStyle = fill; g.fillRect(0, row(b), w, row(a) - row(b)); };
    band(0, 3, st.rim2);
    band(3, 5, "#1c1e21");
    band(5, 8, "#1a1b1d");
    // tread: blocks for a road tyre, chevrons for a lug tyre, smooth for cushion
    if (tread === "lug") {
      for (let i = 0; i < 18; i++) { g.fillStyle = "#0a0b0c"; g.fillRect(i * w / 18, row(8), w / 36, row(5) - row(8)); }
    } else if (tread !== "smooth") {
      for (let i = 0; i < 40; i++) {
        g.fillStyle = "#0c0d0e"; g.fillRect(i * w / 40, row(8), w / 110, row(5) - row(8));
      }
      for (const f of [0.3, 0.5, 0.7]) { g.fillStyle = "#08090a"; g.fillRect(0, row(5 + 3 * f) - 1.5, w, 3); }
      if (tread === "dual") { g.fillStyle = "#050505"; g.fillRect(0, row(6.5) - 5, w, 10); }
    }
    band(8, 9, "#202226");
    g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(0, row(9) + 2, w, 3);  // sidewall lettering line
    band(9, 10, st.rim);
    band(10, 12, st.rim);
    // hand holes / spokes around the disc
    if (st.spokes) {
      for (let i = 0; i < st.spokes; i++) {
        g.fillStyle = "#15181b";
        g.fillRect(((i + 0.5) / st.spokes) * w - w / (st.spokes * 3.2), row(11.4), w / (st.spokes * 1.6), row(10) - row(11.4));
      }
    } else {
      for (let i = 0; i < st.holes; i++) {
        g.fillStyle = "#1b1e21";
        g.fillRect(((i + 0.5) / st.holes) * w - w / (st.holes * 5), row(11.2), w / (st.holes * 2.5), row(10.2) - row(11.2));
      }
    }
    band(12, 13, st.rim2);
    for (let i = 0; i < st.lugs; i++) {           // lug nuts
      g.fillStyle = "#e4e7ea"; g.fillRect(((i + 0.5) / st.lugs) * w - 3, row(12.2), 6, row(11.9) - row(12.2) + 3);
    }
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, row(9.1), w, 2);
    noiseTexture(g, w, h, { density: 1400, alpha: 0.1 });
  }, { rough: 0.72, metal: 0.18 });
}

/**
 * One wheel and tyre as a single lathe mesh: tread, sidewalls, rim, disc hand
 * holes and lug nuts are bands of one canvas, so a wheel costs one mesh and
 * all the wheels on an axle merge into one. `side` +1 faces +X, -1 faces -X.
 */
export function flWheel(parent, x, y, z, r, w, o = {}) {
  const hw = w / 2, R = r, rr = r * (o.rim ?? 0.56);
  const P = [
    [0.01, -hw * 0.55], [rr * 0.9, -hw * 0.55], [rr, -hw], [rr * 1.04, -hw],
    [R * 0.95, -hw * 0.94], [R, -hw * 0.74], [R, 0], [R, hw * 0.74],
    [R * 0.95, hw * 0.94], [rr * 1.04, hw], [rr, hw * 0.98], [rr * 0.9, hw * 0.62],
    [rr * 0.34, hw * 0.55], [0.01, hw * 0.7],
  ];
  const tread = o.tread ?? (o.dual ? "dual" : "road");
  const m = new THREE.Mesh(new THREE.LatheGeometry(P.map(([a, b]) => new THREE.Vector2(a, b)), o.seg ?? 24),
    flWheelMat(o.style ?? "steel", tread));
  m.position.set(x, y, z);
  m.rotation.z = (o.side ?? 1) > 0 ? -Math.PI / 2 : Math.PI / 2;
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m);
  return m;
}

/**
 * A pair of wheels on one axle as one part (duals if `dual`). Returns the
 * part group at the axle centre, so `part.rotation.x` rolls the wheels.
 */
export function flAxle(rig, name, z, r, track, o = {}) {
  const p = rig.part(name, 0, r, z, o.host ?? rig.base);
  const w = o.width ?? (o.dual ? 0.6 : 0.3);
  for (const s of [1, -1]) flWheel(p, s * track / 2, 0, 0, r, w, { side: s, dual: o.dual, style: o.style, tread: o.tread });
  if (o.hub !== false) flRod(rig.shell, o.hubR ?? 0.09, Math.max(0.1, track - w), 0, r, z, "x", ...FL.frame);
  return p;
}
/** A single steerable wheel as its own part (front wheels that turn). */
export function flSteerWheel(rig, name, x, z, r, w, o = {}) {
  const p = rig.part(name, x, r, z, o.host ?? rig.base);
  flWheel(p, 0, 0, 0, r, w, { side: Math.sign(x) || 1, style: o.style, tread: o.tread });
  return p;
}

/** A mirror on an arm, as its own part; `sx` is +1 for left (+X), -1 for right. */
export function flMirror(rig, name, sx, x, y, z, o = {}) {
  const p = rig.part(name, x, y, z);
  const reach = o.reach ?? 0.26, hgt = o.h ?? 0.42;
  flRod(p, 0.016, reach, sx * reach / 2, 0.1, 0, "x", ...FL.black);
  flRod(p, 0.016, reach, sx * reach / 2, -0.1, 0, "x", ...FL.black);
  box(p, 0.07, hgt, o.w ?? 0.2, sx * reach, 0, 0, ...FL.black);
  if (o.convex !== false) ball(p, 0.07, sx * reach, -hgt / 2 - 0.08, 0.02, ...FL.black);
  return p;
}

/**
 * A hinged door as its own part. The group sits on the hinge line; the door
 * runs back along -Z by `len`. `userData.openAngle` is the swing a station
 * should use (outward for either side).
 */
export function flDoor(rig, name, sx, x, y, z, len, h, material, o = {}) {
  const p = rig.part(name, x, y, z, o.host);
  const t = o.t ?? 0.05;
  flBox(p, t, h, len, sx * t / 2, h / 2, -len / 2, material);
  p.userData.openAngle = sx > 0 ? -1.15 : 1.15;
  p.userData.hinge = o.hinge ?? "front";
  return p;
}

/** A pair of glad hands (service blue, emergency red) as parts, on hoses from `a` to the coupling point. */
export function flGladHands(rig, pts, o = {}) {
  const out = {};
  for (const [name, colour, dx] of [["gladHandService", FL.hoseBlue, -0.12], ["gladHandEmergency", FL.hoseRed, 0.12]]) {
    const p = rig.part(name, 0, 0, 0, o.host ?? rig.base);
    const path = pts.map(([x, y, z]) => [x + dx, y, z]);
    if (o.hose !== false) hose(p, path, 0.016, ...colour);
    const end = path[path.length - 1];
    box(p, 0.12, 0.05, 0.07, end[0], end[1], end[2], ...colour);
    cyl(p, 0.035, 0.035, 0.03, end[0], end[1] + 0.035, end[2], ...colour, { seg: 10 });
    out[name] = p;
  }
  return out;
}

// --------------------------------------------------------------- tractors

const FL_TRACTOR = {
  day: { L: 6.85, cabBack: 4.05, axles: [4.95, 6.25], fifth: 5.45 },
  sleeper: { L: 8.65, cabBack: 5.85, axles: [6.75, 8.05], fifth: 7.25 },
};

/**
 * Class 8 conventional tractor, tandem drive. `opts.cab` "day" (default) or
 * "sleeper". 2.59 m over the drive tyres, cab roof 3.1 m with a 3.85 m roof
 * fairing (day) or a 3.95 m raised-roof sleeper; exhaust stack to 3.95 m.
 * Fifth wheel top at 1.22 m. Parts: doorL/doorR, mirrorL/mirrorR,
 * wheels [wheelFL, wheelFR, axle2, axle3], lights {headlights, markerLights,
 * tailLights}, fifthWheel, fifthWheelRelease, gladHandService, gladHandEmergency.
 * `userData.fifthWheelZ` is the kingpin point, for coupling a trailer.
 */
export function semiTractor(parent, x, y, z, opts = {}) {
  const sleeper = opts.cab === "sleeper";
  const T = sleeper ? FL_TRACTOR.sleeper : FL_TRACTOR.day;
  const lv = flLivery(opts.livery, { colour: 0xb8322c });
  const { L, cabBack } = T;
  const Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, sleeper ? "semiTractor-sleeper" : "semiTractor");
  const S = rig.shell, P = flPaint(lv.colour);
  const wheelStyle = opts.wheels ?? "alloy";

  // Frame rails and cross members.
  for (const sx of [1, -1]) box(S, 0.1, 0.28, L - 0.35, sx * 0.43, 0.98, Z((0.3 + L - 0.05) / 2), ...FL.frame);
  for (const s of [0.5, cabBack + 0.2, T.fifth, L - 0.12]) box(S, 0.86, 0.14, 0.1, 0, 0.98, Z(s), ...FL.frame);
  // Bumper, hood, grille, fenders.
  box(S, 2.44, 0.36, 0.22, 0, 0.56, Z(0.11), ...FL.chrome);
  flSide(S, [[0.16, 0.78], [0.13, 1.5], [0.2, 1.76], [0.5, 1.9], [2.05, 2.08], [2.05, 1.0], [0.9, 1.0], [0.6, 0.78]], 1.86, 0, 0, Z(0) , ...P, { bevel: 0.06 });
  flPanel(S, 1.2, 0.86, 0, 1.3, Z(0.1), flGrilleMat("truck"), "+z");
  for (const sx of [1, -1]) {
    const arc = [];
    for (let i = 0; i <= 8; i++) { const a = Math.PI * (0.06 + 0.88 * i / 8); arc.push([1.05 - 0.64 * Math.cos(a), 0.52 + 0.64 * Math.sin(a)]); }
    for (let i = 8; i >= 0; i--) { const a = Math.PI * (0.06 + 0.88 * i / 8); arc.push([1.05 - 0.57 * Math.cos(a), 0.52 + 0.57 * Math.sin(a)]); }
    flSide(S, arc, 0.4, sx * 1.02, 0, Z(0), ...P, { bevel: 0.02 });
    box(S, 0.34, 0.06, 0.5, sx * 1.02, 1.1, Z(1.95), ...P);
  }
  // Cab (and sleeper), windshield, roof fairing.
  const cabPts = sleeper
    ? [[2.0, 1.2], [2.0, 2.1], [2.35, 2.95], [2.7, 3.2], [3.4, 3.78], [3.9, 3.95], [cabBack, 3.95], [cabBack, 1.2]]
    : [[2.0, 1.2], [2.0, 2.1], [2.35, 2.95], [2.6, 3.1], [cabBack, 3.1], [cabBack, 1.2]];
  flSide(S, cabPts, 2.3, 0, 0, Z(0), ...P, { bevel: 0.04 });
  if (!sleeper) flSide(S, [[2.65, 3.08], [3.2, 3.5], [3.75, 3.82], [cabBack, 3.85], [cabBack, 3.08]], 2.2, 0, 0, Z(0), ...P, { bevel: 0.04 });
  const glass = flGlassMat();
  const tilt = Math.atan2(0.35, 0.85);
  flPanel(S, 2.05, 0.9, 0, 2.53 + Math.sin(tilt) * 0.02, Z(2.175) + Math.cos(tilt) * 0.02, glass, "+z", tilt);
  box(S, 0.06, 0.95, 0.06, 1.12, 2.52, Z(2.18), ...FL.black).rotation.x = -tilt;
  box(S, 0.06, 0.95, 0.06, -1.12, 2.52, Z(2.18), ...FL.black).rotation.x = -tilt;
  // Fleet name on the fairing or sleeper side.
  const sideLen = sleeper ? cabBack - 3.55 : cabBack - 3.3;
  const sideMat = flLiveryMat(lv, "cabside", { titleScale: 0.34, stripeY: 0.72 });
  for (const sx of [1, -1]) flPanel(S, sideLen, sleeper ? 0.95 : 0.5, sx * 1.19, sleeper ? 2.6 : 3.45, Z(cabBack - sideLen / 2 - 0.05), sideMat, sx > 0 ? "+x" : "-x");
  if (sleeper) for (const sx of [1, -1]) flPanel(S, 0.5, 0.32, sx * 1.19, 3.35, Z(cabBack - 0.6), glass, sx > 0 ? "+x" : "-x");
  // Steps, grab handles, fuel tanks, catwalk.
  const tread = flTreadMat();
  const tankEnd = sleeper ? cabBack - 0.1 : cabBack + 0.3;
  for (const sx of [1, -1]) {
    for (const [sy, sd] of [[0.52, 0.3], [0.9, 0.24]]) flBox(S, sd, 0.05, 0.62, sx * (1.22 - sd / 2), sy, Z(2.85), tread);
    box(S, 0.04, 0.5, 0.62, sx * 1.2, 0.72, Z(2.85), ...FL.frame);
    flRod(S, 0.018, 1.2, sx * 1.22, 2.0, Z(2.3), "y", ...FL.chrome);
    flRod(S, 0.018, 1.2, sx * 1.22, 2.0, Z(3.55), "y", ...FL.chrome);
    flRod(S, 0.33, tankEnd - 3.3, sx * 0.9, 0.8, Z((3.3 + tankEnd) / 2), "z", ...FL.chrome, { seg: 20 });
    for (const s of [3.45, tankEnd - 0.15]) flRod(S, 0.338, 0.05, sx * 0.9, 0.8, Z(s), "z", ...FL.frame, { seg: 20 });
  }
  flBox(S, 0.9, 0.04, 0.55, 0, 1.2, Z(cabBack + 0.35), tread);
  // Exhaust stack behind the cab, right side, and the 7-way electrical coil.
  flRod(S, 0.1, 2.6, -0.98, 2.65, Z(cabBack + 0.14), "y", ...FL.chrome, { seg: 14 });
  box(S, 0.24, 1.2, 0.05, -0.98, 2.2, Z(cabBack + 0.02), ...FL.frame);
  hose(S, [[0.0, 1.9, Z(cabBack + 0.03)], [0.1, 1.55, Z(cabBack + 0.2)], [0.0, 1.35, Z(cabBack + 0.3)], [-0.1, 1.55, Z(cabBack + 0.4)], [0.0, 1.62, Z(cabBack + 0.5)]], 0.014, ...FL.black, { steps: 40, seg: 6 });
  // Drive-axle housings, mud flaps.
  for (const s of T.axles) box(S, 1.3, 0.22, 0.22, 0, 0.52, Z(s), ...FL.frame);
  for (const sx of [1, -1]) box(S, 0.62, 0.7, 0.02, sx * 1.0, 0.5, Z(L - 0.06), ...FL.frame);
  box(S, 2.2, 0.08, 0.08, 0, 0.9, Z(L - 0.06), ...FL.frame);

  // Parts: doors, mirrors, wheels, lights, fifth wheel, glad hands.
  flDoor(rig, "doorL", 1, 1.15, 1.15, Z(2.36), 1.1, 1.82, flDoorMat(lv, "L"));
  flDoor(rig, "doorR", -1, -1.15, 1.15, Z(2.36), 1.1, 1.82, flDoorMat(lv, "R"));
  flMirror(rig, "mirrorL", 1, 1.18, 2.45, Z(2.3));
  flMirror(rig, "mirrorR", -1, -1.18, 2.45, Z(2.3));
  const wheels = [
    flSteerWheel(rig, "wheelFL", 1.02, Z(1.05), 0.52, 0.3, { style: wheelStyle }),
    flSteerWheel(rig, "wheelFR", -1.02, Z(1.05), 0.52, 0.3, { style: wheelStyle }),
    flAxle(rig, "axle2", Z(T.axles[0]), 0.52, 1.99, { dual: true, style: wheelStyle, hub: false }),
    flAxle(rig, "axle3", Z(T.axles[1]), 0.52, 1.99, { dual: true, style: wheelStyle, hub: false }),
  ];
  rig.set("wheels", wheels);
  const lights = rig.part("lights");
  lights.userData.fleetBake = false;           // a container; its children bake
  const head = rig.part("headlights", 0, 0, 0, lights);
  for (const sx of [1, -1]) box(head, 0.34, 0.16, 0.08, sx * 0.72, 1.36, Z(0.2), ...FL.lamp);
  const marks = rig.part("markerLights", 0, 0, 0, lights);
  const roofY = sleeper ? 3.97 : 3.12, roofS = sleeper ? 3.95 : 2.66;
  for (const dx of [-0.95, -0.2, 0, 0.2, 0.95]) box(marks, 0.1, 0.05, 0.06, dx, roofY, Z(roofS), ...FL.amber);
  for (const sx of [1, -1]) box(marks, 0.03, 0.06, 0.1, sx * 1.23, 1.12, Z(1.85), ...FL.amber);
  const tail = rig.part("tailLights", 0, 0, 0, lights);
  for (const sx of [1, -1]) box(tail, 0.22, 0.1, 0.05, sx * 0.62, 0.98, Z(L - 0.02), ...FL.red);
  const fw = rig.part("fifthWheel", 0, 1.1, Z(T.fifth));
  box(fw, 0.18, 0.12, 0.7, 0.35, 0, 0, ...FL.frame);
  box(fw, 0.18, 0.12, 0.7, -0.35, 0, 0, ...FL.frame);
  const plate = flSide(fw, [[0.45, 0.06], [0.45, 0.1], [-0.1, 0.12], [-0.45, 0.07], [-0.45, 0.04], [0.45, 0.04]], 0.9, 0, 0, 0, ...FL.frame);
  void plate;
  box(fw, 0.2, 0.1, 0.38, 0.26, 0.1, -0.3, ...FL.frame);
  box(fw, 0.2, 0.1, 0.38, -0.26, 0.1, -0.3, ...FL.frame);
  const rel = rig.part("fifthWheelRelease", 0.46, 1.16, Z(T.fifth - 0.1));
  flRod(rel, 0.014, 0.5, 0.25, 0, 0, "x", 0xf2c14b, { rough: 0.5 });
  box(rel, 0.05, 0.08, 0.05, 0.5, 0, 0, 0xf2c14b, { rough: 0.5 });
  const gs = cabBack + 0.03;
  flGladHands(rig, [[0.2, 1.95, Z(gs)], [0.3, 1.5, Z(gs + 0.15)], [0.25, 1.3, Z(gs + 0.3)], [0.35, 1.6, Z(gs + 0.42)], [0.45, 1.72, Z(gs + 0.5)]]);
  return flDone(rig, { footprint: FLEET_BUDGET[sleeper ? "semiTractor:sleeper" : "semiTractor"].footprint, fifthWheelZ: Z(T.fifth), fifthWheelY: 1.22, livery: lv });
}

// ---------------------------------------------------------------- trailers

const FL_TRAILERS = {
  dryVan: { L: 16.15, axles: [13.62, 14.85], landing: 3.8 },
  reefer: { L: 16.15, axles: [13.62, 14.85], landing: 3.8 },
  flatbed: { L: 14.63, axles: [12.2, 13.43], landing: 3.6 },
  tanker: { L: 12.8, axles: [10.9, 12.13], landing: 3.2 },
};

/**
 * Semi-trailer. `opts.kind` "dryVan" (53 ft, 4.11 m), "reefer" (53 ft with a
 * nose-mounted refrigeration unit), "flatbed" (48 ft, deck 1.52 m, stake
 * pockets and winches) or "tanker" (42 ft DOT-406 style, elliptical barrel).
 * Kingpin 0.91 m behind the nose at y 1.2. Parts: wheels [axle1, axle2],
 * landingGear, gladHands (gladHandService + gladHandEmergency), lights
 * {markerLights, tailLights}; van kinds add doorL/doorR (rear swing doors),
 * the reefer reeferUnit, the flatbed stakePockets and winches, the tanker
 * manholes and valves. `userData.kingpinZ` is the kingpin point.
 */
export function trailer(parent, x, y, z, opts = {}) {
  const kind = FL_TRAILERS[opts.kind] ? opts.kind : "dryVan";
  const T = FL_TRAILERS[kind];
  const lv = flLivery(opts.livery, { colour: kind === "tanker" ? 0xc9cfd5 : 0xf1f2ee });
  const { L } = T;
  const Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, `trailer-${kind}`);
  const S = rig.shell;
  const W = 2.59;
  const van = kind === "dryVan" || kind === "reefer";

  // Kingpin, upper coupler, running gear, landing gear.
  cyl(S, 0.045, 0.045, 0.12, 0, 1.14, Z(0.91), ...FL.steel, { seg: 10 });
  if (kind === "tanker") box(S, 1.6, 0.06, 1.6, 0, 1.23, Z(1.25), ...FL.frame);
  else box(S, 2.2, 0.06, 2.0, 0, 1.23, Z(1.1), ...FL.frame);
  const deckY = kind === "flatbed" ? 1.37 : 1.2;
  for (const sx of [1, -1]) box(S, 0.08, 0.3, L - 0.6, sx * 0.45, deckY - 0.12, Z(L / 2 + 0.2), ...FL.frame);
  for (const s of T.axles) box(S, 1.3, 0.2, 0.2, 0, 0.5, Z(s), ...FL.frame);
  box(S, 1.0, 0.5, 2.6, 0, deckY - 0.45, Z((T.axles[0] + T.axles[1]) / 2), ...FL.frame);
  // Rear underride guard and mud flaps.
  box(S, 2.3, 0.12, 0.12, 0, 0.52, Z(L - 0.08), ...FL.frame);
  for (const sx of [1, -1]) box(S, 0.1, 0.62, 0.1, sx * 0.8, 0.85, Z(L - 0.12), ...FL.frame);
  for (const sx of [1, -1]) box(S, 0.62, 0.6, 0.02, sx * 1.0, 0.5, Z(T.axles[1] + 0.7), ...FL.frame);

  const lg = rig.part("landingGear", 0, 0, Z(T.landing));
  for (const sx of [1, -1]) {
    box(lg, 0.12, deckY - 0.1, 0.12, sx * 0.85, (deckY - 0.1) / 2 + 0.08, 0, ...FL.frame);
    box(lg, 0.3, 0.05, 0.3, sx * 0.85, 0.03, 0, ...FL.frame);
  }
  flRod(lg, 0.02, 1.7, 0, 0.75, 0, "x", ...FL.frame);
  flRod(lg, 0.015, 0.3, 1.05, 0.75, 0, "x", ...FL.frame);
  box(lg, 0.03, 0.22, 0.03, 1.2, 0.66, 0, ...FL.frame);

  // Wheels.
  rig.set("wheels", T.axles.map((s, i) => flAxle(rig, `axle${i + 1}`, Z(s), 0.5, 1.99, { dual: true, style: opts.wheels ?? "steel", hub: false })));
  const lights = rig.part("lights"); lights.userData.fleetBake = false;
  const marks = rig.part("markerLights", 0, 0, 0, lights);
  const tail = rig.part("tailLights", 0, 0, 0, lights);
  const topY = kind === "flatbed" ? 1.5 : kind === "tanker" ? 1.2 : 4.08;
  for (const sx of [1, -1]) {
    for (const s of [0.1, L / 2]) box(marks, 0.02, 0.06, 0.1, sx * (W / 2 + 0.01), kind === "flatbed" ? 1.3 : 1.35, Z(s), ...FL.amber);
    box(tail, 0.22, 0.1, 0.03, sx * 0.9, 0.95, Z(L - 0.02), ...FL.red);
    box(tail, 0.06, 0.05, 0.03, sx * 1.15, topY, Z(L - 0.01), ...FL.red);
  }

  let gh;
  if (van) {
    // Body with its aluminium side posts, livery and conspicuity tape.
    const H = 4.11 - deckY;
    box(S, W - 0.02, H, L - 0.05, 0, deckY + H / 2, Z(L / 2), ...flPaint(lv.colour));
    const side = flLiveryMat(lv, `van:${kind}`, { base: lv.colour, posts: 40, tape: true, pw: 2048, ph: 360, titleScale: 0.26, titleY: 0.36, stripeY: 0.6 });
    for (const sx of [1, -1]) flPanel(S, L - 0.1, H, sx * (W / 2 + 0.004), deckY + H / 2, Z(L / 2), side, sx > 0 ? "+x" : "-x");
    // Rear frame around the doors.
    box(S, W, 0.16, 0.08, 0, 4.03, Z(L - 0.02), ...FL.steel);
    for (const sx of [1, -1]) box(S, 0.06, H, 0.08, sx * 1.265, deckY + H / 2, Z(L - 0.02), ...FL.steel);
    const doorMat = (sd) => flCanvasMat(`vanRear:${lv.key}:${sd}`, 256, 512, (g, w, h) => {
      gradientFill(g, w, h, [[0, flCss(flShade(lv.colour, 1.02))], [1, flCss(flShade(lv.colour, 0.88))]]);
      noiseTexture(g, w, h, { density: 900, alpha: 0.05 });
      for (const f of [0.28, 0.72]) {             // lock rods and cam keepers
        g.fillStyle = "#9aa1a8"; g.fillRect(w * f - 5, h * 0.02, 10, h * 0.96);
        g.fillStyle = "#6e757c"; g.fillRect(w * f - 12, h * 0.05, 24, 14); g.fillRect(w * f - 12, h * 0.93, 24, 14);
        g.fillStyle = "#b8bec4"; g.fillRect(w * f - 4, h * 0.55, 8, h * 0.12);
      }
      for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#f4f4f0" : "#c8201c"; g.fillRect(i * w / 8, h * 0.95, w / 8, h * 0.03); }
      g.fillStyle = "#c8201c"; g.fillRect(sd === "L" ? w * 0.84 : 0, 0, w * 0.16, h * 0.04);
      g.fillStyle = "#1b2530"; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = `700 ${Math.round(h * 0.04)}px 'Barlow Condensed', Arial, sans-serif`;
      if (sd === "L") g.fillText(`${lv.unitNumber}`, w * 0.5, h * 0.2);
      grimeOverlay(g, w, h, { blotches: 3, streaks: 4, alpha: 0.1 });
    }, { rough: 0.45, metal: 0.25 });
    const dh = H - 0.18, dw = 1.23;
    const dl = rig.part("doorL", 1.24, deckY, Z(L - 0.02));
    flBox(dl, dw, dh, 0.05, -dw / 2, dh / 2, 0.03, doorMat("L"));
    dl.userData.openAngle = Math.PI * 0.95; dl.userData.hinge = "outer";
    const dr = rig.part("doorR", -1.24, deckY, Z(L - 0.02));
    flBox(dr, dw, dh, 0.05, dw / 2, dh / 2, 0.03, doorMat("R"));
    dr.userData.openAngle = -Math.PI * 0.95; dr.userData.hinge = "outer";
    gh = flGladHands(rig, [[0.45, 1.45, Z(-0.02)], [0.5, 1.45, Z(-0.06)]], { hose: false });
    box(S, 0.12, 0.12, 0.05, 0.1, 1.45, Z(-0.02), ...FL.black);   // 7-way receptacle
    if (kind === "reefer") {
      const ru = rig.part("reeferUnit", 0, 2.75, Z(-0.28));
      box(ru, 2.1, 1.85, 0.5, 0, 0, 0, 0xe9ebe8, { rough: 0.5, metal: 0.1, finish: "painted" });
      flPanel(ru, 2.0, 1.75, 0, 0, 0.253, flCanvasMat("reeferFace", 256, 224, (g, w, h) => {
        gradientFill(g, w, h, [[0, "#eceeea"], [1, "#d3d6d2"]]);
        for (const [cx, cy] of [[0.3, 0.4], [0.7, 0.4]]) {
          g.fillStyle = "#2a2f35"; g.beginPath?.(); g.arc?.(cx * w, cy * h, h * 0.24, 0, Math.PI * 2); g.fill?.();
          g.strokeStyle = "#8f969d"; g.lineWidth = 3;
          for (let r = 8; r < h * 0.24; r += 8) { g.beginPath?.(); g.arc?.(cx * w, cy * h, r, 0, Math.PI * 2); g.stroke?.(); }
        }
        g.fillStyle = "#1a2229"; g.fillRect(w * 0.38, h * 0.74, w * 0.24, h * 0.14);
        g.fillStyle = "#59e38a"; g.font = `700 ${Math.round(h * 0.09)}px monospace`; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText("-18.0", w * 0.5, h * 0.81);
        for (let i = 0; i < 9; i++) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(w * 0.05, h * (0.72 + i * 0.03), w * 0.28, 2); g.fillRect(w * 0.67, h * (0.72 + i * 0.03), w * 0.28, 2); }
      }), "-z");
      flRod(S, 0.25, 1.1, -0.8, 0.95, Z(5.5), "z", ...FL.alu, { seg: 14 });  // reefer fuel tank
    }
  } else if (kind === "flatbed") {
    const deck = flCanvasMat("flatbedDeck", 128, 512, (g, w, h) => {
      gradientFill(g, w, h, [[0, "#8a6a45"], [1, "#6e5234"]]);
      for (let i = 0; i < 8; i++) { g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(i * w / 8, 0, 2, h); }
      noiseTexture(g, w, h, { density: 5000, alpha: 0.14 });
      for (let i = 0; i < 40; i++) { g.fillStyle = "rgba(40,24,10,0.25)"; g.fillRect(Math.random() * w, Math.random() * h, 1, 20 + Math.random() * 40); }
    }, { rough: 0.9, metal: 0 });
    flBox(S, W - 0.1, 0.06, L - 0.05, 0, 1.49, Z(L / 2), deck);
    for (const sx of [1, -1]) box(S, 0.05, 0.16, L - 0.05, sx * (W / 2 - 0.025), 1.44, Z(L / 2), ...FL.alu);
    box(S, W, 0.16, 0.06, 0, 1.44, Z(0.03), ...FL.alu);
    const pk = rig.part("stakePockets");
    const winches = rig.part("winches");
    for (let s = 0.6; s < L - 0.3; s += 0.61) {
      for (const sx of [1, -1]) box(pk, 0.05, 0.1, 0.07, sx * (W / 2 + 0.01), 1.45, Z(s), ...FL.alu);
      if (Math.round(s / 0.61) % 2 === 0) {
        box(winches, 0.14, 0.14, 0.2, 1.16, 1.28, Z(s + 0.3), ...FL.steel);
        flRod(winches, 0.05, 0.16, 1.16, 1.28, Z(s + 0.3), "x", ...FL.steel);
      }
    }
    box(S, 0.1, 0.06, L - 1, 1.17, 1.36, Z(L / 2), ...FL.steel);      // winch track
    gh = flGladHands(rig, [[0.45, 1.3, Z(0.02)], [0.5, 1.3, Z(-0.02)]], { hose: false });
  } else {
    // Tanker: elliptical barrel with dished heads, catwalk, overturn rails,
    // manholes, bottom valves and placards.
    const cy = 2.16, rx = 1.2, ry = 0.86;
    const barrelLen = L - 0.9;
    const barrel = flRod(S, rx, barrelLen, 0, cy, Z(L / 2 + 0.05), "z", ...FL.chrome, { seg: 28 });
    barrel.scale.set(1, 1, ry / rx);
    for (const [s, dir] of [[L / 2 + 0.05 - barrelLen / 2, 1], [L / 2 + 0.05 + barrelLen / 2, -1]]) {
      const head = ball(S, rx, 0, cy, Z(s), ...FL.chrome, { seg: 24, seg2: 12 });
      head.scale.set(1, ry / rx, 0.22);
      void dir;
    }
    box(S, 0.5, 0.04, L - 2.2, 0, cy + ry + 0.02, Z(L / 2 + 0.05), ...FL.steel);
    for (const sx of [1, -1]) box(S, 0.05, 0.2, L - 2.6, sx * 0.34, cy + ry + 0.14, Z(L / 2 + 0.05), ...FL.alu);
    for (const s of [2.0, L - 1.4]) box(S, 2.2, 0.3, 0.3, 0, cy - ry + 0.1, Z(s), ...FL.frame);
    for (const sx of [1, -1]) flRod(S, 0.05, L - 3, sx * 1.05, cy - ry + 0.02, Z(L / 2 + 0.3), "z", ...FL.alu);
    const mh = rig.part("manholes");
    for (let i = 0; i < 4; i++) {
      const s = 2.4 + i * (L - 4.4) / 3;
      cyl(mh, 0.3, 0.3, 0.1, 0, cy + ry + 0.06, Z(s), ...FL.alu, { seg: 18 });
      cyl(mh, 0.2, 0.26, 0.08, 0, cy + ry + 0.14, Z(s), ...FL.alu, { seg: 18 });
    }
    const vv = rig.part("valves");
    for (let i = 0; i < 4; i++) {
      const s = 2.4 + i * (L - 4.4) / 3;
      box(vv, 0.2, 0.25, 0.2, 0, cy - ry - 0.08, Z(s), ...FL.frame);
      flRod(vv, 0.07, 1.0, -0.5, cy - ry - 0.15, Z(s), "x", ...FL.frame);
    }
    const plac = flCanvasMat("placard3-1203", 128, 128, (g, w, h) => {
      g.clearRect?.(0, 0, w, h);
      g.fillStyle = "#d8261c"; g.beginPath?.(); g.moveTo?.(w / 2, 2); g.lineTo?.(w - 2, h / 2); g.lineTo?.(w / 2, h - 2); g.lineTo?.(2, h / 2); g.closePath?.(); g.fill?.();
      g.fillStyle = "#fff"; g.fillRect(w * 0.24, h * 0.44, w * 0.52, h * 0.14);
      g.fillStyle = "#111"; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = `700 ${Math.round(h * 0.12)}px Arial, sans-serif`; g.fillText("1203", w / 2, h * 0.51);
      g.fillStyle = "#fff"; g.font = `700 ${Math.round(h * 0.13)}px Arial, sans-serif`; g.fillText("3", w / 2, h * 0.82);
    }, { transparent: true, rough: 0.5 });
    for (const sx of [1, -1]) flPanel(S, 0.3, 0.3, sx * (rx + 0.01), cy, Z(L - 2.0), plac, sx > 0 ? "+x" : "-x");
    flPanel(S, 0.3, 0.3, 0, cy - 0.2, Z(L - 0.05) - 0.24, plac, "-z");
    gh = flGladHands(rig, [[0.45, 1.3, Z(0.62)], [0.5, 1.3, Z(0.58)]], { hose: false });
  }
  rig.set("gladHands", [gh.gladHandService, gh.gladHandEmergency]);
  return flDone(rig, { footprint: FLEET_BUDGET[`trailer:${kind}`].footprint, kingpinZ: Z(0.91), kingpinY: 1.2, livery: lv, trailerKind: kind });
}

/** The four trailers by name, each `(parent, x, y, z, opts)`. */
export const trailers = {
  dryVan: (p, x, y, z, o = {}) => trailer(p, x, y, z, { ...o, kind: "dryVan" }),
  flatbed: (p, x, y, z, o = {}) => trailer(p, x, y, z, { ...o, kind: "flatbed" }),
  reefer: (p, x, y, z, o = {}) => trailer(p, x, y, z, { ...o, kind: "reefer" }),
  tanker: (p, x, y, z, o = {}) => trailer(p, x, y, z, { ...o, kind: "tanker" }),
};

/**
 * A coupled tractor-trailer: `opts.cab` and `opts.trailer` pick the pieces,
 * the trailer's kingpin sits over the fifth wheel. Parts: tractor, trailer
 * (each carrying its own userData.parts).
 */
export function tractorTrailer(parent, x, y, z, opts = {}) {
  const sleeper = opts.cab === "sleeper";
  const T = sleeper ? FL_TRACTOR.sleeper : FL_TRACTOR.day;
  const kind = FL_TRAILERS[opts.trailer] ? opts.trailer : "dryVan";
  const TL = FL_TRAILERS[kind].L;
  const total = T.fifth - 0.91 + TL;
  const root = group(parent, x, y, z, opts.ry ?? 0);
  root.name = "tractorTrailer";
  const tractor = semiTractor(root, 0, 0, total / 2 - T.L / 2, { cab: opts.cab, livery: opts.livery, wheels: opts.wheels });
  const trailerG = trailer(root, 0, 0, total / 2 - (T.fifth - 0.91) - TL / 2, { kind, livery: opts.trailerLivery ?? opts.livery });
  root.userData.parts = { tractor, trailer: trailerG };
  root.userData.kind = "tractorTrailer";
  root.userData.footprint = FLEET_BUDGET.tractorTrailer.footprint;
  return root;
}

// ------------------------------------------------------- straight trucks

/**
 * A conventional medium-duty cab (hood, cab, windshield, bumper, grille) on
 * the shell, with doors and mirrors as parts. Shared by the box truck,
 * bucket truck, dump truck and the fire engine's commercial cousins.
 */
export function flMediumCab(rig, lv, Z, o = {}) {
  const S = rig.shell, P = flPaint(o.body ?? lv.colour);
  const cw = o.cabW ?? 2.3, roof = o.roof ?? 2.85, back = o.cabBack ?? 3.3, hoodS = o.hoodS ?? 1.6;
  box(S, cw + 0.1, 0.32, 0.2, 0, 0.5, Z(0.1), ...FL.chrome);
  flSide(S, [[0.14, 0.7], [0.12, 1.35], [0.25, 1.6], [hoodS, 1.75], [hoodS, 0.9], [0.5, 0.7]], cw - 0.5, 0, 0, Z(0), ...P, { bevel: 0.06 });
  flPanel(S, 1.05, 0.62, 0, 1.08, Z(0.1), flGrilleMat("truck"), "+z");
  for (const sx of [1, -1]) {
    const arc = [], cz = o.frontAxle ?? 1.05, r = (o.wheelR ?? 0.48) + 0.1;
    for (let i = 0; i <= 8; i++) { const a = Math.PI * (0.06 + 0.88 * i / 8); arc.push([cz - r * Math.cos(a), (o.wheelR ?? 0.48) + r * Math.sin(a)]); }
    for (let i = 8; i >= 0; i--) { const a = Math.PI * (0.06 + 0.88 * i / 8); arc.push([cz - (r - 0.06) * Math.cos(a), (o.wheelR ?? 0.48) + (r - 0.06) * Math.sin(a)]); }
    flSide(S, arc, 0.36, sx * (cw / 2 - 0.12), 0, Z(0), ...P, { bevel: 0.02 });
  }
  flSide(S, [[hoodS, 1.05], [hoodS, 1.8], [hoodS + 0.35, roof - 0.08], [hoodS + 0.55, roof], [back, roof], [back, 1.05]], cw, 0, 0, Z(0), ...P, { bevel: 0.04 });
  const tilt = Math.atan2(0.35, roof - 0.08 - 1.8);
  const wh = Math.hypot(0.35, roof - 0.08 - 1.8);
  flPanel(S, cw - 0.25, wh * 0.95, 0, (1.8 + roof - 0.08) / 2 + Math.sin(tilt) * 0.02, Z(hoodS + 0.175) + Math.cos(tilt) * 0.02, flGlassMat(), "+z", tilt);
  const tread = flTreadMat();
  for (const sx of [1, -1]) flBox(S, 0.26, 0.05, 0.55, sx * (cw / 2 - 0.05), 0.6, Z(hoodS + 0.6), tread);
  const dlen = back - hoodS - 0.45, dh = roof - 1.0 - 0.12;
  flDoor(rig, "doorL", 1, cw / 2, 1.0, Z(hoodS + 0.36), dlen, dh, flDoorMat(lv, "L", { marks: o.doorMarks ?? "dot", body: o.body }));
  flDoor(rig, "doorR", -1, -cw / 2, 1.0, Z(hoodS + 0.36), dlen, dh, flDoorMat(lv, "R", { marks: o.doorMarks ?? "dot", body: o.body }));
  flMirror(rig, "mirrorL", 1, cw / 2 + 0.03, 2.1, Z(hoodS + 0.3), { h: 0.36 });
  flMirror(rig, "mirrorR", -1, -cw / 2 - 0.03, 2.1, Z(hoodS + 0.3), { h: 0.36 });
  return { roof, back, hoodS };
}

/** Headlights, marker (roof identification) lights and tail lights as three parts under `lights`. */
export function flLights(rig, heads, markers, tails) {
  const lights = rig.part("lights"); lights.userData.fleetBake = false;
  const h = rig.part("headlights", 0, 0, 0, lights);
  for (const [x, y, z, w = 0.26, hh = 0.14] of heads) box(h, w, hh, 0.06, x, y, z, ...FL.lamp);
  if (markers?.length) {
    const m = rig.part("markerLights", 0, 0, 0, lights);
    for (const [x, y, z] of markers) box(m, 0.09, 0.05, 0.06, x, y, z, ...FL.amber);
  }
  const t = rig.part("tailLights", 0, 0, 0, lights);
  for (const [x, y, z, w = 0.2, hh = 0.12] of tails) box(t, w, hh, 0.04, x, y, z, ...FL.red);
  return lights;
}

/**
 * Class 6 box truck: conventional cab and a 26 ft dry box with a roll-up rear
 * door. 10.0 m long, 2.59 m wide over the box, 4.0 m tall. Parts: doorL,
 * doorR, mirrorL, mirrorR, wheels [wheelFL, wheelFR, axle2], lights, rearDoor.
 */
export function boxTruck(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf2f2ee, accent: 0x2a7de1 });
  const L = 10.0, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "boxTruck");
  const S = rig.shell;
  for (const sx of [1, -1]) box(S, 0.09, 0.24, L - 0.4, sx * 0.42, 0.85, Z(L / 2 + 0.1), ...FL.frame);
  flMediumCab(rig, lv, Z, { body: opts.cabColour ?? 0xe8e9e5, cabW: 2.3, roof: 2.85, cabBack: 3.3, hoodS: 1.6, frontAxle: 1.15 });
  const b0 = 3.45, H = 4.0 - 1.1;
  box(S, 2.57, H, L - b0 - 0.05, 0, 1.1 + H / 2, Z((b0 + L - 0.05) / 2), ...flPaint(lv.colour));
  const side = flLiveryMat(lv, "box", { base: lv.colour, posts: 16, tape: true, pw: 1536, ph: 384, titleScale: 0.28 });
  for (const sx of [1, -1]) flPanel(S, L - b0 - 0.15, H - 0.1, sx * 1.29, 1.1 + H / 2, Z((b0 + L - 0.05) / 2), side, sx > 0 ? "+x" : "-x");
  box(S, 2.2, 0.35, 0.3, 0, 0.62, Z(L - 0.2), ...FL.steel);   // step bumper
  flPanel(S, 2.3, 0.35, 0, 3.6, Z(b0) + 0.01, flLiveryMat(lv, "boxFront", { base: lv.colour, titleScale: 0.55, titleY: 0.45, sub: " ", stripeY: 0.86 }), "+z");
  const rd = rig.part("rearDoor", 0, 1.15, Z(L - 0.04));
  flBox(rd, 2.35, H - 0.2, 0.04, 0, (H - 0.2) / 2, 0, flCanvasMat(`rollup:${lv.colour}`, 256, 256, (g, w, h) => {
    gradientFill(g, w, h, [[0, flCss(flShade(lv.colour, 1.0))], [1, flCss(flShade(lv.colour, 0.85))]]);
    for (let y = 0; y < h; y += 16) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, y, w, 2); g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(0, y + 2, w, 1); }
    g.fillStyle = "#6e757c"; g.fillRect(w * 0.44, h * 0.9, w * 0.12, h * 0.05);
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#f4f4f0" : "#c8201c"; g.fillRect(i * w / 8, h * 0.96, w / 8, h * 0.03); }
  }, { rough: 0.5, metal: 0.3 }));
  rd.userData.openLift = H - 0.3;
  rig.set("wheels", [
    flSteerWheel(rig, "wheelFL", 1.0, Z(1.15), 0.48, 0.28, { style: "steel" }),
    flSteerWheel(rig, "wheelFR", -1.0, Z(1.15), 0.48, 0.28, { style: "steel" }),
    flAxle(rig, "axle2", Z(7.6), 0.48, 1.94, { dual: true, style: "steel" }),
  ]);
  flLights(rig, [[0.78, 1.25, Z(0.16)], [-0.78, 1.25, Z(0.16)]],
    [[-0.3, 4.02, Z(b0 + 0.1)], [0, 4.02, Z(b0 + 0.1)], [0.3, 4.02, Z(b0 + 0.1)], [1.2, 4.0, Z(L - 0.05)], [-1.2, 4.0, Z(L - 0.05)]],
    [[1.05, 0.95, Z(L - 0.02)], [-1.05, 0.95, Z(L - 0.02)]]);
  return flDone(rig, { footprint: FLEET_BUDGET.boxTruck.footprint, livery: lv });
}

// ------------------------------------------------------------ light vehicles

/**
 * Light-vehicle body: a lower body profile and a greenhouse, four (or two)
 * doors, three wheel parts, mirrors, head and tail lights. `spec` carries the
 * silhouette; the pickup, sedan and cargo van are three specs of this.
 */
function flLightBody(rig, lv, spec) {
  const S = rig.shell, P = flPaint(lv.colour);
  const { L, W } = spec;
  const Z = (s) => L / 2 - s;
  flSide(S, spec.lower, W, 0, 0, Z(0), ...P, { bevel: 0.07 });
  if (spec.upper) flSide(S, spec.upper, W - 0.16, 0, 0, Z(0), ...P, { bevel: 0.05 });
  const glass = flGlassMat();
  for (const g of spec.glass ?? []) flPanel(S, g.w, g.h, g.x ?? 0, g.y, Z(g.s) + (g.dz ?? 0), glass, g.face, g.tilt ?? 0);
  box(S, W + 0.02, 0.2, 0.16, 0, spec.bumperY ?? 0.45, Z(0.08), ...FL.black);
  box(S, W + 0.02, 0.2, 0.16, 0, spec.bumperY ?? 0.45, Z(L - 0.08), ...FL.black);
  flPanel(S, spec.grilleW ?? W * 0.55, spec.grilleH ?? 0.3, 0, spec.grilleY ?? 0.75, Z(0) + 0.005, flGrilleMat(spec.grille ?? "car"), "+z");
  const doors = [];
  for (const d of spec.doors) {
    const sx = d.side === "L" ? 1 : -1;
    const m = flDoorMat(lv, d.side, { window: d.window ?? 0.42, marks: spec.marks ?? "none" });
    const dr = flDoor(rig, d.name, sx, sx * (W / 2 - 0.02), d.y, Z(d.s), d.len, d.h, m, { t: 0.05 });
    if (d.slide) { dr.userData.openAngle = 0; dr.userData.slide = -d.len; }
    doors.push(dr);
  }
  const r = spec.wheelR, tw = spec.track;
  rig.set("wheels", [
    flSteerWheel(rig, "wheelFL", tw / 2, Z(spec.axles[0]), r, spec.tyreW ?? 0.25, { style: spec.wheelStyle ?? "car" }),
    flSteerWheel(rig, "wheelFR", -tw / 2, Z(spec.axles[0]), r, spec.tyreW ?? 0.25, { style: spec.wheelStyle ?? "car" }),
    flAxle(rig, "axle2", Z(spec.axles[1]), r, tw, { style: spec.wheelStyle ?? "car", width: spec.tyreW ?? 0.25, dual: spec.dual }),
  ]);
  flMirror(rig, "mirrorL", 1, W / 2, spec.mirrorY, Z(spec.mirrorS), { reach: 0.16, h: spec.mirrorH ?? 0.16, w: 0.24, convex: false });
  flMirror(rig, "mirrorR", -1, -W / 2, spec.mirrorY, Z(spec.mirrorS), { reach: 0.16, h: spec.mirrorH ?? 0.16, w: 0.24, convex: false });
  const hy = spec.headY ?? 0.8, ty = spec.tailY ?? 0.9;
  flLights(rig, [[W / 2 - 0.2, hy, Z(0.02), 0.32, 0.12], [-(W / 2 - 0.2), hy, Z(0.02), 0.32, 0.12]], spec.markers,
    [[W / 2 - 0.12, ty, Z(L - 0.01), 0.18, spec.tailH ?? 0.2], [-(W / 2 - 0.12), ty, Z(L - 0.01), 0.18, spec.tailH ?? 0.2]]);
  return { Z, doors };
}

/**
 * Full-size crew-cab pickup, 5.9 m × 2.03 m × 1.95 m, 1.65 m bed. Parts:
 * doorFL, doorFR, doorRL, doorRR, wheels, mirrorL, mirrorR, lights,
 * tailgate.
 */
export function pickup(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xe6e8ea, fleetName: opts.livery?.fleetName ?? "SMARTCITI FLEET" });
  const L = 5.9, W = 2.0;
  const rig = flRig(parent, x, y, z, opts, "pickup");
  const { Z } = flLightBody(rig, lv, {
    L, W, wheelR: 0.4, track: 1.72, axles: [0.95, 4.6], tyreW: 0.28, wheelStyle: opts.wheels ?? "car",
    lower: [[0.05, 0.4], [0.02, 0.95], [0.1, 1.12], [1.3, 1.2], [4.05, 1.18], [4.08, 0.75], [5.88, 0.75], [5.9, 0.45], [5.4, 0.35], [0.4, 0.35]],
    upper: [[1.55, 1.18], [2.2, 1.88], [2.35, 1.93], [3.9, 1.93], [4.0, 1.85], [4.05, 1.18]],
    glass: [
      { w: 1.66, h: 0.84, y: 1.54, s: 1.88, face: "+z", tilt: Math.atan2(0.65, 0.7), dz: 0.05 },
      { w: 1.66, h: 0.6, y: 1.55, s: 4.07, face: "-z", dz: -0.01 },
    ],
    doors: [
      { name: "doorFL", side: "L", s: 1.9, len: 1.05, h: 0.9, y: 0.82, window: 0.4 },
      { name: "doorFR", side: "R", s: 1.9, len: 1.05, h: 0.9, y: 0.82, window: 0.4 },
      { name: "doorRL", side: "L", s: 2.98, len: 0.95, h: 0.9, y: 0.82, window: 0.4 },
      { name: "doorRR", side: "R", s: 2.98, len: 0.95, h: 0.9, y: 0.82, window: 0.4 },
    ],
    marks: opts.livery?.fleetName ? "fleet" : "none",
    grille: "truck", grilleW: 1.2, grilleH: 0.42, grilleY: 0.86, headY: 0.98, tailY: 1.0, mirrorY: 1.42, mirrorS: 1.95,
  });
  // Doors cover the greenhouse sides; the bed is open with a liner.
  const S = rig.shell;
  box(S, W - 0.2, 0.04, 1.76, 0, 0.78, Z(4.97), ...FL.black);
  for (const sx of [1, -1]) box(S, 0.08, 0.44, 1.8, sx * (W / 2 - 0.04), 0.97, Z(4.97), ...flPaint(lv.colour));
  box(S, W - 0.1, 0.44, 0.06, 0, 0.97, Z(4.1), ...flPaint(lv.colour));
  const tg = rig.part("tailgate", 0, 0.7, Z(5.88));
  flBox(tg, W - 0.1, 0.48, 0.06, 0, 0.24, 0, flDoorMat(lv, "L", { window: 0, marks: "none" }));
  tg.userData.openAxis = "x"; tg.userData.openAngle = Math.PI / 2;
  return flDone(rig, { footprint: FLEET_BUDGET.pickup.footprint, livery: lv });
}

/** Mid-size sedan, 4.9 m × 1.85 m × 1.45 m. Parts: doorFL, doorFR, doorRL, doorRR, wheels, mirrorL, mirrorR, lights, trunk. */
export function sedan(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0x31557a, fleetName: opts.livery?.fleetName ?? "" });
  const L = 4.9, W = 1.84;
  const rig = flRig(parent, x, y, z, opts, "sedan");
  const tiltF = Math.atan2(0.7, 0.42), tiltR = Math.atan2(0.62, 0.4);
  const { Z } = flLightBody(rig, lv, {
    L, W, wheelR: 0.33, track: 1.58, axles: [0.95, 3.8], tyreW: 0.23, wheelStyle: opts.wheels ?? "car",
    lower: [[0.03, 0.35], [0.0, 0.62], [0.15, 0.78], [1.4, 0.92], [3.9, 0.95], [4.8, 0.92], [4.9, 0.7], [4.85, 0.32], [0.3, 0.26]],
    upper: [[1.45, 0.9], [2.15, 1.38], [2.4, 1.45], [3.45, 1.45], [3.75, 1.36], [4.2, 0.95]],
    glass: [
      { w: 1.46, h: 0.78, y: 1.16, s: 1.8, face: "+z", tilt: tiltF, dz: 0.05 },
      { w: 1.4, h: 0.68, y: 1.18, s: 3.97, face: "-z", tilt: -tiltR, dz: -0.05 },
    ],
    doors: [
      { name: "doorFL", side: "L", s: 1.62, len: 1.08, h: 0.82, y: 0.45, window: 0.45 },
      { name: "doorFR", side: "R", s: 1.62, len: 1.08, h: 0.82, y: 0.45, window: 0.45 },
      { name: "doorRL", side: "L", s: 2.72, len: 0.98, h: 0.82, y: 0.45, window: 0.45 },
      { name: "doorRR", side: "R", s: 2.72, len: 0.98, h: 0.82, y: 0.45, window: 0.45 },
    ],
    marks: opts.livery?.fleetName ? "fleet" : "none",
    bumperY: 0.4, grilleW: 0.9, grilleH: 0.2, grilleY: 0.52, headY: 0.7, tailY: 0.82, tailH: 0.14, mirrorY: 1.02, mirrorS: 1.7, mirrorH: 0.13,
  });
  const tk = rig.part("trunk", 0, 0.95, Z(4.2));
  flSide(tk, [[0, 0], [0.62, -0.02], [0.68, -0.22], [0, -0.05]], W - 0.18, 0, 0, 0, ...flPaint(lv.colour), { bevel: 0.02 });
  tk.userData.openAxis = "x"; tk.userData.openAngle = -1.1;
  return flDone(rig, { footprint: FLEET_BUDGET.sedan.footprint, livery: lv });
}

/**
 * High-roof full-size cargo van, 5.93 m × 2.05 m × 2.75 m. Parts: doorL,
 * doorR, doorSlide (curb side), doorRearL, doorRearR, wheels, mirrorL,
 * mirrorR, lights.
 */
export function cargoVan(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf3f4f2, accent: 0x2a7de1 });
  const L = 5.93, W = 2.02;
  const rig = flRig(parent, x, y, z, opts, "cargoVan");
  const { Z } = flLightBody(rig, lv, {
    L, W, wheelR: 0.37, track: 1.74, axles: [0.9, 4.55], tyreW: 0.24, wheelStyle: opts.wheels ?? "grey",
    lower: [[0.03, 0.38], [0.0, 0.85], [0.15, 1.0], [0.9, 1.2], [1.35, 1.95], [1.7, 2.62], [2.0, 2.72], [5.85, 2.72], [5.93, 2.6], [5.93, 0.45], [5.5, 0.35], [0.3, 0.32]],
    glass: [{ w: 1.7, h: 0.82, y: 1.6, s: 1.14, face: "+z", tilt: Math.atan2(0.45, 0.75), dz: 0.12 }],
    doors: [
      { name: "doorL", side: "L", s: 1.35, len: 0.95, h: 1.55, y: 0.5, window: 0.38 },
      { name: "doorR", side: "R", s: 1.35, len: 0.95, h: 1.55, y: 0.5, window: 0.38 },
      { name: "doorSlide", side: "R", s: 2.4, len: 1.3, h: 1.8, y: 0.45, window: 0, slide: true },
    ],
    marks: "fleet", grilleW: 1.0, grilleH: 0.3, grilleY: 0.72, headY: 0.92, tailY: 1.2, tailH: 0.5, mirrorY: 1.55, mirrorS: 1.4, mirrorH: 0.28,
  });
  const S = rig.shell;
  const side = flLiveryMat(lv, "vanside", { titleScale: 0.3 });
  for (const sx of [1, -1]) flPanel(S, 2.2, 0.8, sx * (W / 2 + 0.006), 1.9, Z(4.35), side, sx > 0 ? "+x" : "-x");
  const rdm = flDoorMat(lv, "L", { window: 0.25, marks: "none" });
  const rl = rig.part("doorRearL", W / 2 - 0.02, 0.5, Z(L) - 0.03);
  flBox(rl, W / 2 - 0.04, 2.0, 0.05, -(W / 2 - 0.04) / 2, 1.0, 0, rdm);
  rl.userData.openAngle = Math.PI * 0.75; rl.userData.hinge = "outer";
  const rr = rig.part("doorRearR", -(W / 2 - 0.02), 0.5, Z(L) - 0.03);
  flBox(rr, W / 2 - 0.04, 2.0, 0.05, (W / 2 - 0.04) / 2, 1.0, 0, rdm);
  rr.userData.openAngle = -Math.PI * 0.75; rr.userData.hinge = "outer";
  return flDone(rig, { footprint: FLEET_BUDGET.cargoVan.footprint, livery: lv });
}

// ------------------------------------------------------------ emergency

/** A light bar of alternating red and white (or amber) warning lamps as its own part. */
export function flLightBar(rig, name, x, y, z, w, o = {}) {
  const p = rig.part(name, x, y, z, o.host ?? rig.base);
  box(p, w, 0.06, 0.3, 0, 0, 0, ...FL.black);
  const n = o.n ?? 6;
  for (let i = 0; i < n; i++) {
    const colour = o.colours ? o.colours[i % o.colours.length] : (i % 2 ? FL.lamp : FL.red);
    box(p, w / n - 0.03, 0.1, 0.26, -w / 2 + (i + 0.5) * w / n, 0.08, 0, ...colour);
  }
  return p;
}

/**
 * Type III ambulance: cutaway van cab and a modular patient box, 7.0 m ×
 * 2.4 m × 3.0 m. Markings are generic: "AMBULANCE" (mirrored on the front),
 * a stripe, the fleet name and unit number, and rear chevrons. No Star of
 * Life, no cross. Parts: doorL, doorR, doorSide (curb-side box door),
 * doorRearL, doorRearR, compartments, warningLights, wheels, mirrorL,
 * mirrorR, lights.
 */
export function ambulance(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf4f5f3, fleetName: "CITY EMS", unitNumber: "12", accent: 0xd8322c });
  const L = 7.0, W = 2.36, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "ambulance");
  const S = rig.shell, P = flPaint(lv.colour);
  for (const sx of [1, -1]) box(S, 0.09, 0.2, L - 0.5, sx * 0.44, 0.72, Z(L / 2), ...FL.frame);
  // Cutaway cab.
  flSide(S, [[0.03, 0.4], [0.0, 0.9], [0.15, 1.08], [0.95, 1.28], [1.45, 2.1], [1.75, 2.22], [2.3, 2.22], [2.3, 0.5], [0.3, 0.36]], 2.02, 0, 0, Z(0), ...P, { bevel: 0.07 });
  flPanel(S, 1.72, 0.85, 0, 1.68, Z(1.2) + 0.1, flGlassMat(), "+z", Math.atan2(0.5, 0.82));
  flPanel(S, 1.0, 0.3, 0, 0.75, Z(0) + 0.005, flGrilleMat("car"), "+z");
  box(S, 2.06, 0.2, 0.16, 0, 0.45, Z(0.08), ...FL.black);
  flPanel(S, 1.6, 0.3, 0, 2.62, Z(2.3) + 0.01, flCanvasMat("ambulanceMirrorWord", 512, 96, (g, w, h) => {
    g.fillStyle = "#f4f5f3"; g.fillRect(0, 0, w, h);
    g.save?.(); g.translate?.(w, 0); g.scale?.(-1, 1);
    g.fillStyle = "#d8322c"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `800 ${Math.round(h * 0.7)}px 'Barlow Condensed', Arial, sans-serif`; g.fillText("AMBULANCE", w / 2, h * 0.54);
    g.restore?.();
  }), "+z");
  // Patient module.
  const b0 = 2.3, H = 3.0 - 0.9;
  box(S, W, H, L - b0 - 0.05, 0, 0.9 + H / 2, Z((b0 + L - 0.05) / 2), ...P);
  const side = flCanvasMat(`ambSide:${lv.key}`, 1024, 448, (g, w, h) => {
    g.clearRect?.(0, 0, w, h);
    g.fillStyle = flCss(lv.accent); g.fillRect(0, h * 0.4, w, h * 0.1);
    g.fillStyle = "#f2b84b"; g.fillRect(0, h * 0.5, w, h * 0.025);
    g.fillStyle = flCss(lv.accent); g.textAlign = "center"; g.textBaseline = "middle";
    flTextFit(g, "AMBULANCE", w * 0.6, Math.round(h * 0.15), 800); g.fillText("AMBULANCE", w * 0.55, h * 0.22);
    g.fillStyle = "#1b2530"; flTextFit(g, lv.fleetName, w * 0.3, Math.round(h * 0.07), 700); g.fillText(lv.fleetName, w * 0.55, h * 0.92);
    g.textAlign = "left"; g.font = `800 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`; g.fillText(`MEDIC ${lv.unitNumber}`, w * 0.03, h * 0.08);
  }, { transparent: true, rough: 0.45 });
  for (const sx of [1, -1]) flPanel(S, L - b0 - 0.2, H - 0.1, sx * (W / 2 + 0.005), 0.9 + H / 2, Z((b0 + L) / 2), side, sx > 0 ? "+x" : "-x");
  box(S, 1.9, 0.3, 0.35, 0, 0.62, Z(L - 0.12), ...FL.steel);
  // Parts.
  flDoor(rig, "doorL", 1, 1.0, 0.55, Z(1.35), 0.9, 1.55, flDoorMat(lv, "L", { window: 0.4, marks: "none" }));
  flDoor(rig, "doorR", -1, -1.0, 0.55, Z(1.35), 0.9, 1.55, flDoorMat(lv, "R", { window: 0.4, marks: "none" }));
  flMirror(rig, "mirrorL", 1, 1.02, 1.75, Z(1.45), { reach: 0.22, h: 0.34 });
  flMirror(rig, "mirrorR", -1, -1.02, 1.75, Z(1.45), { reach: 0.22, h: 0.34 });
  const ds = rig.part("doorSide", -W / 2 - 0.01, 0.95, Z(b0 + 0.25));
  flBox(ds, 0.04, H - 0.2, 0.8, 0, (H - 0.2) / 2, -0.4, flDoorMat(lv, "R", { window: 0.25, marks: "none" }));
  ds.userData.openAngle = 1.3;
  const rearMat = flCanvasMat(`ambRear:${lv.key}`, 256, 512, (g, w, h) => {
    gradientFill(g, w, h, [[0, flCss(lv.colour)], [1, flCss(flShade(lv.colour, 0.9))]]);
    // NFPA-style rear chevrons: alternating red and fluorescent yellow, pointing up
    for (let i = -6; i < 12; i++) {
      g.fillStyle = i % 2 ? "#d8322c" : "#e4f24a";
      g.beginPath?.(); const y0 = h * 0.45 + i * 40;
      g.moveTo?.(0, y0); g.lineTo?.(w / 2, y0 - 70); g.lineTo?.(w, y0); g.lineTo?.(w, y0 + 40); g.lineTo?.(w / 2, y0 - 30); g.lineTo?.(0, y0 + 40);
      g.closePath?.(); g.fill?.();
    }
    g.fillStyle = "#15191d"; g.fillRect(w * 0.1, h * 0.06, w * 0.8, h * 0.22); flGlassPaint(g, w * 0.13, h * 0.08, w * 0.74, h * 0.18);
  }, { rough: 0.45, metal: 0.2 });
  const dw = W / 2 - 0.08;
  const rl = rig.part("doorRearL", W / 2 - 0.05, 0.95, Z(L - 0.02));
  flBox(rl, dw, H - 0.25, 0.04, -dw / 2, (H - 0.25) / 2, 0.02, rearMat);
  rl.userData.openAngle = Math.PI * 0.8; rl.userData.hinge = "outer";
  const rr = rig.part("doorRearR", -(W / 2 - 0.05), 0.95, Z(L - 0.02));
  flBox(rr, dw, H - 0.25, 0.04, dw / 2, (H - 0.25) / 2, 0.02, rearMat);
  rr.userData.openAngle = -Math.PI * 0.8; rr.userData.hinge = "outer";
  const comp = rig.part("compartments");
  const cm = flCanvasMat("ambCompartment", 128, 256, (g, w, h) => {
    gradientFill(g, w, h, [[0, "#e9ebe8"], [1, "#cfd3d0"]]);
    g.strokeStyle = "#7d858c"; g.lineWidth = 4; g.strokeRect?.(3, 3, w - 6, h - 6);
    g.fillStyle = "#9aa1a8"; g.fillRect(w * 0.4, h * 0.45, w * 0.2, h * 0.08);
  }, { rough: 0.4, metal: 0.3 });
  for (const sx of [1, -1]) for (const s of sx > 0 ? [3.0, 3.85, 5.8] : [3.8, 5.8]) flBox(comp, 0.03, 0.85, 0.72, sx * (W / 2 + 0.012), 1.45, Z(s), cm);
  flLightBar(rig, "warningLights", 0, 3.0, Z(b0 + 0.2), 2.1, { n: 6 });
  flLights(rig, [[0.72, 0.85, Z(0.03), 0.3, 0.13], [-0.72, 0.85, Z(0.03), 0.3, 0.13]],
    [[1.05, 2.97, Z(L - 0.03)], [-1.05, 2.97, Z(L - 0.03)], [0, 2.97, Z(L - 0.03)]],
    [[1.0, 1.1, Z(L - 0.01), 0.18, 0.4], [-1.0, 1.1, Z(L - 0.01), 0.18, 0.4]]);
  rig.set("wheels", [
    flSteerWheel(rig, "wheelFL", 0.87, Z(0.9), 0.39, 0.24, { style: "grey" }),
    flSteerWheel(rig, "wheelFR", -0.87, Z(0.9), 0.39, 0.24, { style: "grey" }),
    flAxle(rig, "axle2", Z(5.2), 0.39, 1.84, { dual: true, width: 0.5, style: "grey" }),
  ]);
  return flDone(rig, { footprint: FLEET_BUDGET.ambulance.footprint, livery: lv });
}

/**
 * Pumper fire engine on a custom cab: 10.2 m × 2.5 m × 3.3 m. Pump panel on
 * the driver's side, hose bed over the rear, a roof ladder rack. Markings are
 * generic ("ENGINE" + unit number + fleet name). Parts: doorL, doorR,
 * doorCrewL, doorCrewR, pumpPanel, pumpControls, hoseBed, ladder,
 * compartments, warningLights, wheels, mirrorL, mirrorR, lights.
 */
export function fireEngine(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xb3171b, fleetName: "CITY FIRE", unitNumber: "7", accent: 0xf2c14b });
  const L = 10.2, W = 2.5, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "fireEngine");
  const S = rig.shell, P = flPaint(lv.colour);
  for (const sx of [1, -1]) box(S, 0.1, 0.26, L - 0.4, sx * 0.45, 0.9, Z(L / 2), ...FL.frame);
  // Custom cab: flat face, crew cab stepped up behind the front seats.
  flSide(S, [[0.1, 0.6], [0.05, 1.6], [0.12, 2.1], [0.35, 2.95], [0.7, 3.0], [3.4, 3.0], [3.4, 0.9], [0.6, 0.6]], W - 0.02, 0, 0, Z(0), ...P, { bevel: 0.06 });
  box(S, W - 0.1, 0.12, 2.8, 0, 3.0, Z(1.9), 0xf2f2ee, { rough: 0.4, metal: 0.2, finish: "painted" });
  flPanel(S, W - 0.3, 0.8, 0, 2.5, Z(0.25) + 0.06, flGlassMat(), "+z", Math.atan2(0.23, 0.85));
  flPanel(S, 1.3, 0.5, 0, 1.3, Z(0.05) + 0.01, flGrilleMat("truck", 0x2a2e33), "+z");
  box(S, W + 0.05, 0.34, 0.3, 0, 0.62, Z(0.15), ...FL.chrome);
  // Body: pump house then compartment body to the rear.
  box(S, W, 2.25, 1.3, 0, 0.75 + 2.25 / 2, Z(4.1), ...P);
  box(S, W, 2.05, L - 4.8, 0, 0.75 + 2.05 / 2, Z((4.75 + L) / 2), ...P);
  const side = flCanvasMat(`fireSide:${lv.key}`, 1536, 256, (g, w, h) => {
    g.clearRect?.(0, 0, w, h);
    g.fillStyle = "#f2f2ee"; g.fillRect(0, h * 0.78, w, h * 0.1);
    g.fillStyle = flCss(lv.accent); g.fillRect(0, h * 0.88, w, h * 0.06);
    g.fillStyle = flCss(lv.accent); g.textAlign = "center"; g.textBaseline = "middle";
    flTextFit(g, lv.fleetName, w * 0.5, Math.round(h * 0.28), 800); g.fillText(lv.fleetName, w * 0.5, h * 0.38);
    g.font = `800 ${Math.round(h * 0.22)}px 'Barlow Condensed', Arial, sans-serif`; g.fillText(`ENGINE ${lv.unitNumber}`, w * 0.5, h * 0.64);
  }, { transparent: true, rough: 0.4 });
  for (const sx of [1, -1]) flPanel(S, L - 5.0, 1.0, sx * (W / 2 + 0.005), 2.25, Z((4.9 + L) / 2), side, sx > 0 ? "+x" : "-x");
  box(S, W - 0.1, 0.3, 0.4, 0, 0.75, Z(L - 0.15), ...FL.steel);
  // Doors.
  flDoor(rig, "doorL", 1, W / 2, 0.95, Z(0.55), 1.0, 1.95, flDoorMat(lv, "L", { window: 0.42, marks: "none" }));
  flDoor(rig, "doorR", -1, -W / 2, 0.95, Z(0.55), 1.0, 1.95, flDoorMat(lv, "R", { window: 0.42, marks: "none" }));
  flDoor(rig, "doorCrewL", 1, W / 2, 0.95, Z(1.75), 1.05, 1.95, flDoorMat(lv, "L", { window: 0.42, marks: "fleet" }));
  flDoor(rig, "doorCrewR", -1, -W / 2, 0.95, Z(1.75), 1.05, 1.95, flDoorMat(lv, "R", { window: 0.42, marks: "fleet" }));
  flMirror(rig, "mirrorL", 1, W / 2, 2.3, Z(0.5), { reach: 0.28, h: 0.4 });
  flMirror(rig, "mirrorR", -1, -W / 2, 2.3, Z(0.5), { reach: 0.28, h: 0.4 });
  // Pump panel (driver's side) with gauges, and its discharge handles as controls.
  const pp = rig.part("pumpPanel", W / 2 + 0.006, 1.85, Z(4.1));
  flPanel(pp, 1.25, 1.9, 0, 0, 0, flCanvasMat("pumpPanelFace", 256, 384, (g, w, h) => {
    gradientFill(g, w, h, [[0, "#d7dce0"], [1, "#b5bcc2"]]);
    for (let y = 0; y < h; y += 6) { g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(0, y, w, 2); }
    const gauge = (cx, cy, r, label) => {
      g.fillStyle = "#1a1d20"; g.beginPath?.(); g.arc?.(cx, cy, r + 4, 0, Math.PI * 2); g.fill?.();
      g.fillStyle = "#f4f4ee"; g.beginPath?.(); g.arc?.(cx, cy, r, 0, Math.PI * 2); g.fill?.();
      g.strokeStyle = "#d8322c"; g.lineWidth = 3; g.beginPath?.(); g.moveTo?.(cx, cy); g.lineTo?.(cx + r * 0.7, cy - r * 0.5); g.stroke?.();
      g.fillStyle = "#1b2530"; g.font = `600 ${Math.round(r * 0.35)}px Arial`; g.textAlign = "center"; g.fillText(label, cx, cy + r * 0.55);
    };
    gauge(w * 0.3, h * 0.13, 30, "INTAKE"); gauge(w * 0.7, h * 0.13, 30, "PUMP");
    const cols = ["#d8322c", "#2a7de1", "#f2c14b", "#3fae5a"];
    for (let i = 0; i < 4; i++) { gauge(w * (0.2 + i * 0.2), h * 0.35, 18, `D${i + 1}`); g.fillStyle = cols[i]; g.fillRect(w * (0.13 + i * 0.2), h * 0.44, w * 0.14, h * 0.03); }
    g.fillStyle = "#1a1d20"; g.fillRect(w * 0.15, h * 0.52, w * 0.7, h * 0.08);
    g.fillStyle = "#59e38a"; g.font = "700 22px monospace"; g.textAlign = "center"; g.fillText("RPM 0850  150 PSI", w / 2, h * 0.575);
    for (let i = 0; i < 2; i++) { g.fillStyle = "#6e757c"; g.beginPath?.(); g.arc?.(w * (0.3 + i * 0.4), h * 0.82, 34, 0, Math.PI * 2); g.fill?.(); g.fillStyle = "#b8bec4"; g.beginPath?.(); g.arc?.(w * (0.3 + i * 0.4), h * 0.82, 24, 0, Math.PI * 2); g.fill?.(); }
  }, { rough: 0.35, metal: 0.6 }), "+x");
  const pc = rig.part("pumpControls", W / 2 + 0.02, 1.85, Z(4.1));
  for (let i = 0; i < 4; i++) {
    flRod(pc, 0.012, 0.16, 0.08, 0.05, 0.47 - i * 0.25 - 0.1, "x", ...FL.chrome);
    ball(pc, 0.028, 0.16, 0.05, 0.47 - i * 0.25 - 0.1, ...FL.chrome, { seg: 8, seg2: 6 });
  }
  for (const dz of [-0.35, 0.35]) flRod(pc, 0.07, 0.14, 0.07, -0.62, dz, "x", ...FL.chrome, { seg: 12 });
  // Hose bed over the rear body, with the load showing.
  const hb = rig.part("hoseBed", 0, 2.8, Z(7.3));
  flBox(hb, W - 0.4, 0.3, 5.0, 0, 0, 0, flCanvasMat("hoseLoad", 256, 512, (g, w, h) => {
    g.fillStyle = "#1d2126"; g.fillRect(0, 0, w, h);
    const cols = ["#e8e2d0", "#e8e2d0", "#d7c24a", "#d7c24a", "#c9412c"];
    for (let i = 0; i < 5; i++) for (let y = 4; y < h; y += 14) {
      g.fillStyle = cols[i]; g.fillRect(4 + i * (w - 8) / 5, y, (w - 8) / 5 - 4, 10);
      g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(4 + i * (w - 8) / 5, y + 8, (w - 8) / 5 - 4, 2);
    }
  }, { rough: 0.85 }));
  // Ground ladders on the roof rack (driver's side), as one part.
  const ld = rig.part("ladder", 0.75, 3.02, Z(6.8));
  for (const dx of [-0.2, 0.2]) box(ld, 0.05, 0.1, 5.6, dx, 0, 0, ...FL.alu);
  for (let i = 0; i < 17; i++) flRod(ld, 0.015, 0.4, 0, 0, -2.7 + i * 0.34, "x", ...FL.alu);
  // Roll-up compartment doors, both sides.
  const comp = rig.part("compartments");
  const rm = flCanvasMat("rollupAlu", 256, 256, (g, w, h) => {
    gradientFill(g, w, h, [[0, "#d5dadf"], [1, "#aab1b8"]]);
    for (let y = 0; y < h; y += 12) { g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(0, y, w, 2); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(0, y + 2, w, 1); }
    g.fillStyle = "#3b4148"; g.fillRect(w * 0.1, h * 0.9, w * 0.8, h * 0.05);
  }, { rough: 0.3, metal: 0.8 });
  for (const sx of [1, -1]) for (const [s, len] of [[5.3, 1.1], [6.5, 1.1], [7.7, 1.1], [9.1, 1.1]]) flBox(comp, 0.02, 1.1, len, sx * (W / 2 + 0.012), 1.25, Z(s), rm);
  flLightBar(rig, "warningLights", 0, 3.1, Z(0.55), 2.2, { n: 8 });
  flLights(rig, [[0.85, 1.2, Z(0.06), 0.28, 0.2], [-0.85, 1.2, Z(0.06), 0.28, 0.2]],
    [[1.1, 2.95, Z(L - 0.03)], [-1.1, 2.95, Z(L - 0.03)]],
    [[1.05, 1.1, Z(L - 0.01), 0.18, 0.3], [-1.05, 1.1, Z(L - 0.01), 0.18, 0.3]]);
  rig.set("wheels", [
    flSteerWheel(rig, "wheelFL", 1.02, Z(1.3), 0.53, 0.33, { style: "alloy" }),
    flSteerWheel(rig, "wheelFR", -1.02, Z(1.3), 0.53, 0.33, { style: "alloy" }),
    flAxle(rig, "axle2", Z(6.2), 0.53, 1.92, { dual: true, style: "alloy" }),
  ]);
  return flDone(rig, { footprint: FLEET_BUDGET.fireEngine.footprint, livery: lv });
}

// ----------------------------------------------------------------- utility

/**
 * Insulated aerial device on a Class 7 utility body: 9.6 m × 2.5 m × 3.7 m
 * stowed. Articulated as turret → boom → boomUpper → bucket, each a part at
 * its pivot (rotate turret about Y, booms about X). Outriggers deploy down
 * and out. Parts: doorL, doorR, mirrorL, mirrorR, wheels, lights, turret,
 * boom, boomUpper, bucket, outriggers [outriggerL, outriggerR], compartments,
 * controls.
 */
export function bucketTruck(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf2f2ee, fleetName: "CITY POWER", accent: 0x2a7de1 });
  const L = 9.6, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "bucketTruck");
  const S = rig.shell;
  for (const sx of [1, -1]) box(S, 0.1, 0.26, L - 0.4, sx * 0.43, 0.88, Z(L / 2 + 0.1), ...FL.frame);
  flMediumCab(rig, lv, Z, { cabW: 2.3, roof: 2.85, cabBack: 3.3, hoodS: 1.6, frontAxle: 1.15 });
  // Utility body: compartments either side, a flat bed between.
  const b0 = 3.45, bl = L - b0 - 0.3;
  const P = flPaint(lv.colour);
  for (const sx of [1, -1]) box(S, 0.55, 1.2, bl, sx * 0.99, 1.62, Z(b0 + bl / 2), ...P);
  box(S, 1.45, 0.08, bl, 0, 1.08, Z(b0 + bl / 2), ...FL.steel);
  const side = flLiveryMat(lv, "utility", { titleScale: 0.3, stripeY: 0.8 });
  for (const sx of [1, -1]) flPanel(S, 2.4, 0.6, sx * 1.27, 2.1, Z(b0 + 1.4), side, sx > 0 ? "+x" : "-x");
  const comp = rig.part("compartments");
  const cm = flCanvasMat(`utilDoor:${lv.colour}`, 128, 192, (g, w, h) => {
    gradientFill(g, w, h, [[0, flCss(lv.colour)], [1, flCss(flShade(lv.colour, 0.86))]]);
    g.strokeStyle = "rgba(0,0,0,0.4)"; g.lineWidth = 3; g.strokeRect?.(2, 2, w - 4, h - 4);
    g.fillStyle = "#3b4148"; g.fillRect(w * 0.42, h * 0.1, w * 0.16, h * 0.08);
  }, { rough: 0.4, metal: 0.3 });
  for (const sx of [1, -1]) for (const s of [b0 + 2.9, b0 + 3.9, b0 + 4.9]) flBox(comp, 0.02, 0.95, 0.9, sx * 1.275, 1.5, Z(s), cm);
  // Pedestal at the rear of the body.
  const ts = 8.45;
  cyl(S, 0.4, 0.45, 0.9, 0, 1.75, Z(ts), ...FL.steel, { seg: 16 });
  // Outriggers (rear, A-frame down to pads) as two parts.
  const outs = [];
  for (const [name, sx] of [["outriggerL", 1], ["outriggerR", -1]]) {
    const o = rig.part(name, sx * 0.6, 0.95, Z(L - 0.55));
    const legLen = 1.2;
    const leg = box(o, 0.14, legLen, 0.16, sx * 0.45, -legLen / 2 + 0.2, 0, ...FL.steel);
    leg.rotation.z = sx * 0.6;
    box(o, 0.4, 0.05, 0.4, sx * 0.85, -0.9, 0, ...FL.frame);
    o.userData.deploy = { axis: "z", stowed: 0, deployed: sx * 0.6 };
    outs.push(o);
  }
  rig.set("outriggers", outs);
  // Articulated aerial device, stowed: the lower boom lies forward over the
  // body, the upper boom folds back beside it, the bucket rides at the rear.
  // turret.rotation.y slews; boom.rotation.x and boomUpper.rotation.x raise
  // (negative is up); the bucket is levelled by the station.
  const turret = rig.part("turret", 0, 2.2, Z(ts));
  cyl(turret, 0.45, 0.45, 0.2, 0, 0, 0, 0xf2c14b, { seg: 18, rough: 0.5 });
  box(turret, 0.5, 0.45, 0.6, 0, 0.3, 0, 0xf2c14b, { rough: 0.5 });
  const boom = rig.part("boom", 0, 0.45, 0, turret);
  box(boom, 0.3, 0.3, 3.7, 0, 0, 1.85, 0xf2f2ee, { rough: 0.4, metal: 0.2, finish: "painted" });
  flRod(boom, 0.06, 1.4, 0, -0.22, 0.9, "z", ...FL.chrome);
  const elbow = rig.part("boomUpper", 0, 0, 3.6, boom);
  box(elbow, 0.26, 0.26, 3.4, -0.32, 0, -1.7, 0xf2c14b, { rough: 0.45, finish: "painted" });
  box(elbow, 0.265, 0.265, 1.0, -0.32, 0, -2.9, 0xe8e8e0, { rough: 0.35 });   // insulated section
  const bucket = rig.part("bucket", -0.32, 0.05, -4.35, elbow);
  box(bucket, 0.75, 1.0, 0.75, 0, 0.2, 0, 0xf2c14b, { rough: 0.5, finish: "painted" });
  box(bucket, 0.62, 0.06, 0.62, 0, 0.71, 0, ...FL.black);
  const ctrl = rig.part("controls", -1.28, 1.35, Z(L - 1.3));
  box(ctrl, 0.08, 0.35, 0.45, 0, 0, 0, 0x3b4148, { rough: 0.5 });
  for (let i = 0; i < 4; i++) flRod(ctrl, 0.01, 0.12, -0.08, 0.1, -0.15 + i * 0.1, "x", ...FL.red);
  rig.set("wheels", [
    flSteerWheel(rig, "wheelFL", 1.0, Z(1.15), 0.5, 0.3, { style: "steel" }),
    flSteerWheel(rig, "wheelFR", -1.0, Z(1.15), 0.5, 0.3, { style: "steel" }),
    flAxle(rig, "axle2", Z(6.6), 0.5, 1.94, { dual: true, style: "steel" }),
  ]);
  flLights(rig, [[0.78, 1.25, Z(0.16)], [-0.78, 1.25, Z(0.16)]],
    [[-0.3, 2.88, Z(1.95)], [0, 2.88, Z(1.95)], [0.3, 2.88, Z(1.95)]],
    [[1.05, 1.1, Z(L - 0.02)], [-1.05, 1.1, Z(L - 0.02)]]);
  return flDone(rig, { footprint: FLEET_BUDGET.bucketTruck.footprint, livery: lv });
}

// -------------------------------------------------------------- transit bus

/**
 * 40 ft low-floor transit bus: 12.2 m × 2.59 m × 3.25 m to the roof pod.
 * Window band, livery and doors painted; destination sign lit. Parts:
 * doorFront, doorRear, destinationSign, wheels, mirrorL, mirrorR, lights.
 */
export function busTransit(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf1f2ee, fleetName: "CITI TRANSIT", unitNumber: "4021", accent: 0x1c8f6f });
  const L = 12.2, W = 2.56, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "busTransit");
  const S = rig.shell, P = flPaint(lv.colour);
  flSide(S, [[0.05, 0.3], [0.0, 1.0], [0.08, 2.6], [0.3, 2.95], [0.6, 3.0], [L - 0.2, 3.0], [L, 2.8], [L, 0.35], [L - 0.3, 0.28], [0.3, 0.25]], W, 0, 0, Z(0), ...P, { bevel: 0.08 });
  box(S, 1.8, 0.28, 3.4, 0, 3.12, Z(4.8), ...P);
  const side = flCanvasMat(`busSide:${lv.key}`, 2048, 384, (g, w, h) => {
    g.clearRect?.(0, 0, w, h);
    flGlassPaint(g, w * 0.02, h * 0.1, w * 0.96, h * 0.42);
    g.fillStyle = "#15191d";
    for (let i = 0; i <= 8; i++) g.fillRect(w * 0.02 + i * (w * 0.96 / 8) - 4, h * 0.1, 8, h * 0.42);
    g.fillStyle = flCss(lv.accent); g.fillRect(0, h * 0.58, w, h * 0.1);
    g.fillStyle = flCss(flShade(lv.accent, 0.7)); g.fillRect(0, h * 0.68, w, h * 0.03);
    g.fillStyle = "#18222c"; g.textAlign = "left"; g.textBaseline = "middle";
    flTextFit(g, lv.fleetName, w * 0.3, Math.round(h * 0.1), 800); g.fillText(lv.fleetName, w * 0.06, h * 0.8);
    g.textAlign = "right"; g.font = `700 ${Math.round(h * 0.08)}px 'Barlow Condensed', Arial, sans-serif`; g.fillText(lv.unitNumber, w * 0.95, h * 0.8);
  }, { transparent: true, rough: 0.3, metal: 0.2 });
  for (const sx of [1, -1]) flPanel(S, L - 1.4, 2.7, sx * (W / 2 + 0.006), 1.55, Z(L / 2 + 0.5), side, sx > 0 ? "+x" : "-x");
  flPanel(S, W - 0.2, 1.35, 0, 1.9, Z(0) + 0.1, flGlassMat(), "+z", 0.05);
  flPanel(S, W - 0.4, 0.9, 0, 2.2, Z(L) - 0.09, flGlassMat(), "-z");
  box(S, W, 0.25, 0.14, 0, 0.45, Z(0.04), ...FL.black);
  box(S, W, 0.25, 0.14, 0, 0.45, Z(L - 0.04), ...FL.black);
  const dm = flCanvasMat("busDoor", 128, 320, (g, w, h) => {
    g.fillStyle = "#2a2f35"; g.fillRect(0, 0, w, h);
    flGlassPaint(g, 8, 8, w / 2 - 12, h - 16); flGlassPaint(g, w / 2 + 4, 8, w / 2 - 12, h - 16);
  }, { rough: 0.2, metal: 0.5 });
  const df = rig.part("doorFront", -W / 2 - 0.022, 0.3, Z(1.55));
  flBox(df, 0.04, 2.45, 1.1, 0, 1.22, 0, dm);
  const drr = rig.part("doorRear", -W / 2 - 0.022, 0.3, Z(7.2));
  flBox(drr, 0.04, 2.45, 1.1, 0, 1.22, 0, dm);
  const ds = rig.part("destinationSign", 0, 2.75, Z(0) + 0.1);
  flPanel(ds, 2.0, 0.26, 0, 0, 0, flCanvasMat(`busDest:${opts.route ?? "12"}`, 512, 64, (g, w, h) => {
    g.fillStyle = "#0b0d0f"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#ffb52e"; g.textBaseline = "middle"; g.font = `700 ${Math.round(h * 0.7)}px monospace`;
    g.textAlign = "left"; g.fillText(String(opts.route ?? "12"), w * 0.04, h * 0.55);
    g.textAlign = "center"; g.fillText(String(opts.destination ?? "DOWNTOWN"), w * 0.58, h * 0.55);
  }, { emissive: 0xffffff, ei: 0.9, glow: true }), "+z");
  flMirror(rig, "mirrorL", 1, W / 2, 2.35, Z(0.15), { reach: 0.3, h: 0.36 });
  flMirror(rig, "mirrorR", -1, -W / 2, 2.35, Z(0.15), { reach: 0.3, h: 0.36 });
  rig.set("wheels", [
    flSteerWheel(rig, "wheelFL", 1.02, Z(2.45), 0.5, 0.3, { style: "alloy" }),
    flSteerWheel(rig, "wheelFR", -1.02, Z(2.45), 0.5, 0.3, { style: "alloy" }),
    flAxle(rig, "axle2", Z(9.1), 0.5, 1.94, { dual: true, style: "alloy" }),
  ]);
  flLights(rig, [[0.95, 0.8, Z(0.02), 0.34, 0.16], [-0.95, 0.8, Z(0.02), 0.34, 0.16]],
    [[1.1, 2.95, Z(0.35)], [-1.1, 2.95, Z(0.35)], [1.1, 2.95, Z(L - 0.25)], [-1.1, 2.95, Z(L - 0.25)]],
    [[1.05, 1.0, Z(L - 0.01), 0.2, 0.34], [-1.05, 1.0, Z(L - 0.01), 0.2, 0.34]]);
  return flDone(rig, { footprint: FLEET_BUDGET.busTransit.footprint, livery: lv });
}

// ----------------------------------------------------------- yard vehicles

/**
 * Counterbalance forklift, 5,000 lb LPG class: 2.3 m truck + 1.07 m forks,
 * 1.15 m wide, overhead guard 2.15 m, mast lowered 2.1 m. The mast tilts at
 * the front axle, the inner mast and carriage lift inside it, the LPG tank
 * sits on the counterweight. Parts: mast (tilt about X), innerMast (lift Y),
 * carriage (lift Y, carries forks and backrest), forks, overheadGuard,
 * counterweight, lpgTank, seat, controls, beacon, wheels [wheelsFront,
 * wheelsRear], lights.
 */
export function forkliftCounterbalance(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf2b21b, fleetName: "", unitNumber: "FL-3" });
  // s is measured from the mast; the fork tips are 1.25 m ahead of it.
  const L = 3.62, Z = (s) => L / 2 - (s + 0.13);
  const rig = flRig(parent, x, y, z, opts, "forkliftCounterbalance");
  const S = rig.shell, P = flPaint(lv.colour);
  // Truck body: front axle at s 1.35 (behind the mast), steer axle at s 2.85.
  flSide(S, [[1.2, 0.2], [1.2, 1.0], [1.5, 1.05], [2.4, 1.05], [2.5, 1.2], [3.35, 1.2], [3.37, 0.25], [2.2, 0.2]], 1.08, 0, 0, Z(0), ...P, { bevel: 0.04 });
  box(S, 0.8, 0.06, 0.9, 0, 1.08, Z(1.95), ...FL.black);                    // floor plate / hood
  flSide(S, [[1.3, 0.9], [1.35, 1.2], [1.55, 1.25], [1.6, 0.9]], 0.9, 0, 0, Z(0), ...FL.black);   // dash cowl
  flRod(S, 0.13, 0.03, 0, 1.35, Z(1.6), "y", ...FL.black, { seg: 16 });  // steering wheel
  flStrut(S, [0, 1.1, Z(1.5)], [0, 1.35, Z(1.6)], 0.025, ...FL.black);
  flPanel(S, 0.5, 0.18, 0.55, 0.65, Z(2.3), flLiveryMat(lv, "forkSide", { title: lv.unitNumber, sub: " ", titleScale: 0.6, titleY: 0.5, stripeY: 2 }), "+x");
  // Parts.
  const seat = rig.part("seat", 0, 1.08, Z(2.2));
  box(seat, 0.5, 0.1, 0.48, 0, 0.05, 0, ...FL.black);
  box(seat, 0.5, 0.5, 0.1, 0, 0.32, -0.22, ...FL.black);
  const cw = rig.part("counterweight", 0, 0, Z(3.05));
  flSide(cw, [[-0.2, 0.25], [-0.2, 1.3], [0.1, 1.35], [0.32, 1.1], [0.34, 0.25]], 1.12, 0, 0, 0, 0x3a3f45, { rough: 0.6, metal: 0.4, finish: "painted" });
  const og = rig.part("overheadGuard", 0, 0, 0);
  for (const sx of [1, -1]) {
    flStrut(og, [sx * 0.5, 1.05, Z(1.45)], [sx * 0.5, 2.15, Z(1.55)], 0.035, ...FL.black);
    flStrut(og, [sx * 0.5, 1.25, Z(2.75)], [sx * 0.5, 2.15, Z(2.6)], 0.035, ...FL.black);
    box(og, 0.06, 0.06, 1.15, sx * 0.5, 2.15, Z(2.05), ...FL.black);
  }
  for (let i = 0; i < 6; i++) box(og, 1.0, 0.04, 0.05, 0, 2.17, Z(1.6 + i * 0.19), ...FL.black);
  const lpg = rig.part("lpgTank", 0, 1.62, Z(3.05));
  flRod(lpg, 0.16, 0.78, 0, 0, 0, "x", 0xdfe3e6, { rough: 0.4, metal: 0.4, seg: 16 });
  cyl(lpg, 0.05, 0.05, 0.08, 0.3, 0.17, 0, ...FL.chrome, { seg: 8 });
  // Mast (tilts at its foot), inner mast and carriage lift inside it.
  const mast = rig.part("mast", 0, 0.28, Z(1.12));
  for (const sx of [1, -1]) box(mast, 0.1, 1.85, 0.14, sx * 0.36, 0.92, 0, ...FL.frame);
  for (const my of [0.15, 1.8]) box(mast, 0.82, 0.08, 0.1, 0, my, -0.02, ...FL.frame);
  flRod(mast, 0.045, 1.5, 0, 0.8, -0.08, "y", ...FL.chrome);
  const inner = rig.part("innerMast", 0, 0.05, 0.03, mast);
  for (const sx of [1, -1]) box(inner, 0.08, 1.85, 0.1, sx * 0.26, 0.93, 0.08, ...FL.frame);
  box(inner, 0.62, 0.07, 0.08, 0, 1.82, 0.08, ...FL.frame);
  const carriage = rig.part("carriage", 0, 0.1, 0.2, mast);
  box(carriage, 1.0, 0.4, 0.06, 0, 0.25, 0, ...FL.frame);
  for (let i = 0; i < 6; i++) box(carriage, 0.04, 0.8, 0.03, -0.45 + i * 0.18, 0.85, 0, ...FL.frame);
  box(carriage, 1.0, 0.05, 0.04, 0, 1.25, 0, ...FL.frame);
  const forks = rig.part("forks", 0, 0, 0, carriage);
  for (const sx of [1, -1]) {
    box(forks, 0.1, 0.5, 0.05, sx * 0.3, 0.22, 0.05, ...FL.steel);
    box(forks, 0.1, 0.045, 1.07, sx * 0.3, -0.03, 0.56, ...FL.steel);
  }
  const ctl = rig.part("controls", 0.3, 1.2, Z(1.62));
  for (let i = 0; i < 3; i++) { flRod(ctl, 0.008, 0.2, i * 0.05, 0.1, 0, "y", ...FL.black); ball(ctl, 0.02, i * 0.05, 0.2, 0, ...FL.red, { seg: 8, seg2: 6 }); }
  const beacon = rig.part("beacon", -0.4, 2.22, Z(2.7));
  cyl(beacon, 0.06, 0.07, 0.12, 0, 0, 0, ...FL.amber, { seg: 12 });
  rig.set("wheels", [
    flAxle(rig, "wheelsFront", Z(1.35), 0.3, 0.9, { width: 0.22, style: "black", tread: "smooth", hubR: 0.07 }),
    flAxle(rig, "wheelsRear", Z(2.85), 0.24, 0.84, { width: 0.18, style: "black", tread: "smooth", hubR: 0.06 }),
  ]);
  flLights(rig, [[0.46, 2.05, Z(1.5), 0.1, 0.08], [-0.46, 2.05, Z(1.5), 0.1, 0.08]], null,
    [[0.48, 1.1, Z(3.36), 0.1, 0.08], [-0.48, 1.1, Z(3.36), 0.1, 0.08]]);
  return flDone(rig, { footprint: FLEET_BUDGET.forkliftCounterbalance.footprint, livery: lv, capacityKg: 2270 });
}

/**
 * Terminal tractor (yard hustler): single-seat cab offset to the left, lifting
 * fifth wheel, rear catwalk. 5.6 m × 2.6 m × 3.3 m. Parts: doorL, doorRear,
 * mirrorL, mirrorR, wheels, fifthWheel (lifts), gladHandService,
 * gladHandEmergency, beacon, lights.
 */
export function yardHustler(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xf0a31c, fleetName: "YARD", unitNumber: "Y-14" });
  const L = 5.6, W = 2.55, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "yardHustler");
  const S = rig.shell, P = flPaint(lv.colour);
  for (const sx of [1, -1]) box(S, 0.1, 0.3, L - 0.3, sx * 0.45, 0.85, Z(L / 2), ...FL.frame);
  box(S, 2.4, 0.4, 0.25, 0, 0.6, Z(0.12), ...FL.frame);                             // push bumper
  flSide(S, [[0.2, 0.8], [0.2, 1.6], [0.5, 1.75], [2.3, 1.75], [2.3, 0.8]], 1.1, -0.55, 0, Z(0), ...P, { bevel: 0.04 });   // engine hood, right
  flSide(S, [[0.25, 0.9], [0.22, 3.2], [0.4, 3.3], [1.9, 3.3], [1.9, 0.9]], 1.2, 0.62, 0, Z(0), ...P, { bevel: 0.04 });     // cab, left
  const glass = flGlassMat();
  flPanel(S, 1.05, 1.1, 0.62, 2.55, Z(0.22) + 0.05, glass, "+z", 0.02);
  flPanel(S, 1.2, 0.9, -0.01, 2.6, Z(1.05), glass, "-x");
  flPanel(S, 0.8, 0.5, -0.55, 1.2, Z(0.2) + 0.02, flGrilleMat("vertical", 0x25292e), "+z");
  flBox(S, 2.0, 0.05, 2.2, 0, 1.25, Z(3.0), flTreadMat());                              // catwalk / deck
  flPanel(S, 0.9, 0.35, 1.23, 2.5, Z(1.05), flLiveryMat(lv, "hustlerSide", { title: lv.unitNumber, titleScale: 0.55, titleY: 0.45, sub: lv.fleetName, stripeY: 0.92 }), "+x");
  flDoor(rig, "doorL", 1, 1.22, 1.0, Z(0.5), 1.05, 2.1, flDoorMat(lv, "L", { window: 0.5, marks: "none" }));
  const dr = rig.part("doorRear", 0.62, 1.2, Z(1.92));
  flBox(dr, 0.8, 1.9, 0.04, 0, 0.95, 0, flDoorMat(lv, "R", { window: 0.45, marks: "none" }));
  dr.userData.openAngle = 1.2;
  flMirror(rig, "mirrorL", 1, 1.22, 2.6, Z(0.35), { reach: 0.25, h: 0.36 });
  flMirror(rig, "mirrorR", -1, -1.1, 1.9, Z(0.35), { reach: 0.2, h: 0.3 });
  const fw = rig.part("fifthWheel", 0, 1.35, Z(4.3));
  flSide(fw, [[0.45, 0.0], [0.45, 0.05], [-0.1, 0.08], [-0.45, 0.04], [-0.45, 0.0]], 0.9, 0, 0, 0, ...FL.frame);
  for (const sx of [1, -1]) flStrut(fw, [sx * 0.35, 0, -1.1], [sx * 0.35, 0, 0.1], 0.05, ...FL.frame);
  fw.userData.lift = 0.5;
  flGladHands(rig, [[0.2, 2.8, Z(1.95)], [0.3, 2.2, Z(2.3)], [0.35, 1.9, Z(2.6)], [0.4, 2.1, Z(2.9)]]);
  const bc = rig.part("beacon", 0.62, 3.36, Z(1.2));
  cyl(bc, 0.07, 0.08, 0.14, 0, 0, 0, ...FL.amber, { seg: 12 });
  rig.set("wheels", [
    flSteerWheel(rig, "wheelFL", 1.02, Z(1.05), 0.5, 0.3, { style: "steel" }),
    flSteerWheel(rig, "wheelFR", -1.02, Z(1.05), 0.5, 0.3, { style: "steel" }),
    flAxle(rig, "axle2", Z(4.4), 0.5, 1.99, { dual: true, style: "steel" }),
  ]);
  flLights(rig, [[1.05, 1.2, Z(0.25), 0.2, 0.14], [-1.05, 1.2, Z(0.25), 0.2, 0.14]], null,
    [[0.95, 1.0, Z(L - 0.02)], [-0.95, 1.0, Z(L - 0.02)]]);
  return flDone(rig, { footprint: FLEET_BUDGET.yardHustler.footprint, livery: lv });
}

// ---------------------------------------------------------------- workboat

/**
 * Small aluminium workboat: 7.6 m × 2.6 m, keel at y 0, wheelhouse to 3.1 m
 * with mast. Twin outboards, bow push knees, a davit, side fenders. A station
 * floats it by setting y to minus its draft (about 0.45 m). Parts:
 * wheelhouseDoor, outboards, davit, navLights {portLight, starboardLight,
 * mastheadLight}.
 */
export function workboat(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xd9dde0, fleetName: "HARBOR WORKS", unitNumber: "WB-3", accent: 0xe0592a });
  const L = 7.6, W = 2.6, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "workboat");
  const S = rig.shell;
  // Hull: plan shape with a fine bow, a lower chine hull and a flared topside.
  const hw = W / 2;
  const plan = (k) => [[k * hw, -L / 2], [k * hw, L / 2 - 2.2], [k * hw * 0.8, L / 2 - 1.0], [k * hw * 0.35, L / 2 - 0.25], [0, L / 2], [-k * hw * 0.35, L / 2 - 0.25], [-k * hw * 0.8, L / 2 - 1.0], [-k * hw, L / 2 - 2.2], [-k * hw, -L / 2]];
  flPlan(S, plan(0.82), 0.45, 0, 0, 0, ...FL.alu, { bevel: 0.06 });
  flPlan(S, plan(1.0), 0.75, 0, 0.42, 0, 0xd9dde0, { rough: 0.35, metal: 0.7, finish: "brushed", bevel: 0.04 });
  const hullSide = flLiveryMat(lv, "hull", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.32, titleY: 0.4, stripeY: 0.78 });
  for (const sx of [1, -1]) flPanel(S, 4.6, 0.62, sx * (hw + 0.045), 0.8, Z(4.6), hullSide, sx > 0 ? "+x" : "-x");
  flBox(S, W - 0.24, 0.03, L - 2.4, 0, 1.19, Z((2.2 + L - 0.15) / 2), flTreadMat());   // deck
  // Fender (rub) rail and hanging fenders.
  for (const sx of [1, -1]) flRod(S, 0.06, L - 2.4, sx * (hw + 0.04), 1.12, Z(L / 2 + 0.7), "z", ...FL.black);
  for (const sx of [1, -1]) for (const s of [2.6, 4.2, 5.8]) cyl(S, 0.1, 0.1, 0.45, sx * (hw + 0.14), 0.8, Z(s), 0x1f5fb8, { seg: 10, rough: 0.6 });
  // Bow push knees.
  for (const sx of [1, -1]) box(S, 0.12, 1.3, 0.25, sx * 0.3, 1.1, Z(0.2), ...FL.black);
  // Handrails.
  for (const sx of [1, -1]) {
    flRod(S, 0.022, L - 3.2, sx * (hw - 0.08), 1.95, Z(L / 2 + 1.2), "z", ...FL.alu);
    for (let s = 2.0; s < L - 0.5; s += 1.1) flRod(S, 0.02, 0.8, sx * (hw - 0.08), 1.55, Z(s), "y", ...FL.alu);
  }
  // Wheelhouse, forward of midships.
  const wh0 = 2.2, wh1 = 4.3;
  flSide(S, [[wh0, 1.15], [wh0 - 0.15, 2.2], [wh0 + 0.1, 2.75], [wh1, 2.75], [wh1, 1.15]], 1.9, 0, 0, Z(0), 0xf0f1ee, { rough: 0.4, metal: 0.2, finish: "painted", bevel: 0.04 });
  const glass = flGlassMat();
  flPanel(S, 1.6, 0.5, 0, 2.47, Z(wh0 - 0.03) + 0.05, glass, "+z", 0.43);
  for (const sx of [1, -1]) flPanel(S, 1.6, 0.55, sx * 0.99, 2.3, Z(3.1), glass, sx > 0 ? "+x" : "-x");
  // Mast with lights on it.
  flRod(S, 0.04, 0.6, 0, 3.05, Z(3.6), "y", ...FL.alu);
  const door = rig.part("wheelhouseDoor", -0.65, 1.2, Z(wh1) - 0.02);
  flBox(door, 0.6, 1.45, 0.04, 0.3, 0.73, 0, flDoorMat(lv, "R", { window: 0.4, marks: "none", body: 0xf0f1ee }));
  door.userData.openAngle = -1.4;
  const ob = rig.part("outboards", 0, 0.8, Z(L) - 0.05);
  for (const sx of [0.5, -0.5]) {
    box(ob, 0.42, 0.55, 0.55, sx, 0.55, -0.25, 0x1b1e22, { rough: 0.45, metal: 0.3, finish: "painted" });
    box(ob, 0.14, 0.9, 0.2, sx, -0.2, -0.25, 0x1b1e22, { rough: 0.45, metal: 0.3 });
  }
  const dv = rig.part("davit", 0.9, 1.17, Z(5.7));
  flRod(dv, 0.05, 1.5, 0, 0.75, 0, "y", ...FL.steel);
  flStrut(dv, [0, 1.5, 0], [0.7, 1.7, 0], 0.04, ...FL.steel);
  flRod(dv, 0.006, 0.8, 0.7, 1.3, 0, "y", 0xb0b4b8, { rough: 0.5 });
  const nav = rig.part("navLights"); nav.userData.fleetBake = false;
  const port = rig.part("portLight", -0.95, 2.72, Z(wh0 + 0.25), nav);
  box(port, 0.08, 0.08, 0.1, 0, 0, 0, ...FL.red);
  const stbd = rig.part("starboardLight", 0.95, 2.72, Z(wh0 + 0.25), nav);
  box(stbd, 0.08, 0.08, 0.1, 0, 0, 0, ...FL.green);
  const mh = rig.part("mastheadLight", 0, 3.4, Z(3.6), nav);
  cyl(mh, 0.05, 0.05, 0.1, 0, 0, 0, ...FL.lamp, { seg: 10 });
  rig.set("lights", nav);
  return flDone(rig, { footprint: FLEET_BUDGET.workboat.footprint, livery: lv, draft: 0.45 });
}

// ------------------------------------------------------- marine: skiff

/**
 * Aluminium centre-console skiff: 5.2 m × 2.0 m, keel at y 0, gunwale at
 * about 0.8 m, console and grab rail to 1.4 m, one outboard on the transom.
 * Used as a rescue boat, a boom-tending boat and a survey tender. A station
 * floats it by setting y to minus its draft (about 0.3 m). Parts: outboard,
 * console, killSwitch, bowCleat, sternCleat, navLights {portLight,
 * starboardLight, sternLight}. Port is +X, as the driver's side is on the
 * road vehicles: facing the bow (+Z), port is on the left.
 */
export function skiff(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0xc8ced4, fleetName: "HARBOR WORKS", unitNumber: "SK-1", accent: 0xe0592a });
  const L = 5.2, W = 2.0, hw = W / 2, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "skiff", [0, 0, 0.24]);
  const S = rig.shell;
  const plan = (k) => [[k * hw, -L / 2], [k * hw, L / 2 - 1.5], [k * hw * 0.7, L / 2 - 0.55], [k * hw * 0.25, L / 2 - 0.1], [0, L / 2], [-k * hw * 0.25, L / 2 - 0.1], [-k * hw * 0.7, L / 2 - 0.55], [-k * hw, L / 2 - 1.5], [-k * hw, -L / 2]];
  flPlan(S, plan(0.78), 0.32, 0, 0, 0, ...FL.alu, { bevel: 0.05 });
  flPlan(S, plan(1.0), 0.48, 0, 0.3, 0, lv.colour, { rough: 0.35, metal: 0.6, finish: "brushed", bevel: 0.03 });
  const side = flLiveryMat(lv, "skiff", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.34, titleY: 0.42, stripeY: 0.8 });
  for (const sx of [1, -1]) flPanel(S, 2.8, 0.36, sx * (hw + 0.012), 0.56, Z(2.2), side, sx > 0 ? "+x" : "-x");
  flBox(S, W - 0.2, 0.025, L - 1.3, 0, 0.79, Z(L / 2 + 0.45), flTreadMat());
  // Gunwale rub rail and the bow grab rail.
  for (const sx of [1, -1]) flRod(S, 0.035, L - 1.2, sx * (hw + 0.02), 0.78, Z(L / 2 + 0.5), "z", ...FL.black);
  flStrut(S, [0.55, 1.05, Z(0.6)], [-0.55, 1.05, Z(0.6)], 0.02, ...FL.alu);
  // Centre console with its windscreen, and the leaning post behind it.
  const con = rig.part("console", 0, 0.8, Z(2.6));
  box(con, 0.62, 0.62, 0.55, 0, 0.31, 0, 0xe9ecee, { rough: 0.45, metal: 0.15, finish: "painted" });
  flPanel(con, 0.58, 0.26, 0, 0.74, 0.2, flGlassMat(), "+z", 0.5);
  const kill = rig.part("killSwitch", 0.2, 0.64, 0.28, con);
  cyl(kill, 0.03, 0.03, 0.03, 0, 0, 0, ...FL.red, { seg: 10 });
  box(S, 0.5, 0.5, 0.36, 0, 1.05, Z(3.25), 0x2b3138, { rough: 0.7, finish: "rubber" });
  // Cleats, bow and stern.
  const bc = rig.part("bowCleat", 0, 0.82, Z(0.35));
  box(bc, 0.16, 0.04, 0.05, 0, 0.02, 0, ...FL.steel);
  const sc = rig.part("sternCleat", 0.7, 0.82, Z(L - 0.2));
  box(sc, 0.16, 0.04, 0.05, 0, 0.02, 0, ...FL.steel);
  // Outboard on the transom: cowl, leg and skeg.
  const ob = rig.part("outboard", 0, 0.62, Z(L) - 0.02);
  box(ob, 0.4, 0.55, 0.5, 0, 0.45, -0.22, 0x1b1e22, { rough: 0.45, metal: 0.3, finish: "painted" });
  box(ob, 0.12, 0.85, 0.18, 0, -0.2, -0.2, 0x1b1e22, { rough: 0.45, metal: 0.3 });
  const nav = rig.part("navLights"); nav.userData.fleetBake = false;
  const port = rig.part("portLight", hw * 0.55, 0.9, Z(0.7), nav);
  box(port, 0.06, 0.06, 0.08, 0, 0, 0, ...FL.red);
  const stbd = rig.part("starboardLight", -hw * 0.55, 0.9, Z(0.7), nav);
  box(stbd, 0.06, 0.06, 0.08, 0, 0, 0, ...FL.green);
  const stern = rig.part("sternLight", -0.6, 0.8, Z(L - 0.15), nav);
  flRod(stern, 0.015, 0.9, 0, 0.45, 0, "y", ...FL.alu);
  cyl(stern, 0.04, 0.04, 0.08, 0, 0.94, 0, ...FL.lamp, { seg: 10 });
  rig.set("lights", nav);
  return flDone(rig, { footprint: FLEET_BUDGET.skiff.footprint, livery: lv, draft: 0.3 });
}

// ----------------------------------------------------- marine: barges

/**
 * The shared hull of a deck barge: a box hull with raked bow and stern, a
 * steel deck, hull-side livery with draft marks, four double bitts and a
 * boarding ladder. `L`, `W`, `D` are length, beam and depth. Adds its parts
 * to `rig` and returns the deck height.
 */
function flBargeHull(rig, lv, L, W, D, o = {}) {
  const S = rig.shell, Z = (s) => L / 2 - s, hw = W / 2;
  const rake = Math.min(1.8, L * 0.1);
  flSide(S, [[0, D], [rake, 0.15], [rake + 0.4, 0], [L - rake - 0.4, 0], [L - rake, 0.15], [L, D]], W, 0, 0, Z(0), 0x3b4148, { rough: 0.62, metal: 0.45, finish: "painted", bevel: 0.05 });
  const deckMat = flCanvasMat(`barge-deck:${L}x${W}`, 256, 256, (g, w, h) => {
    gradientFill(g, w, h, [[0, "#6f757b"], [1, "#5b6167"]]);
    noiseTexture(g, w, h, { density: 3200, alpha: 0.12 });
    g.strokeStyle = "rgba(20,22,24,0.55)"; g.lineWidth = 2;
    for (let i = 1; i < 4; i++) { g.beginPath?.(); g.moveTo?.(i * w / 4, 0); g.lineTo?.(i * w / 4, h); g.stroke?.(); }
    for (let i = 1; i < 2; i++) { g.beginPath?.(); g.moveTo?.(0, i * h / 2); g.lineTo?.(w, i * h / 2); g.stroke?.(); }
    grimeOverlay(g, w, h, { blotches: 6, streaks: 4, alpha: 0.14 });
  }, { rough: 0.7, metal: 0.4, repeat: [Math.max(1, Math.round(W / 3)), Math.max(1, Math.round(L / 4))] });
  flPanel(S, W - 0.1, L - 0.1, 0, D + 0.012, 0, deckMat, "+y");
  const side = flCanvasMat(`barge-side:${lv.key}`, 1024, 128, (g, w, h) => {
    gradientFill(g, w, h, [[0, flCss(flShade(lv.colour, 1.05))], [1, flCss(flShade(lv.colour, 0.8))]]);
    noiseTexture(g, w, h, { density: 1400, alpha: 0.06 });
    g.fillStyle = "#f3f5f7"; g.textAlign = "center"; g.textBaseline = "middle";
    flTextFit(g, `${lv.fleetName}  ${lv.unitNumber}`, w * 0.5, Math.round(h * 0.34), 800);
    g.fillText(`${lv.fleetName}  ${lv.unitNumber}`, w / 2, h * 0.4);
    // Draft marks at each end: white numerals up the side, read at the waterline.
    g.font = `700 ${Math.round(h * 0.16)}px Arial, sans-serif`;
    for (const mx of [w * 0.05, w * 0.95]) for (let i = 0; i < 4; i++) g.fillText(String(2 + i * 2), mx, h * (0.9 - i * 0.22));
    grimeOverlay(g, w, h, { blotches: 5, streaks: 8, alpha: 0.12 });
  }, { rough: 0.6, metal: 0.35 });
  for (const sx of [1, -1]) flPanel(S, L - 2 * rake - 0.2, D * 0.72, sx * (hw + 0.012), D * 0.55, 0, side, sx > 0 ? "+x" : "-x");
  // Bullnose rub bar along each side at the deck edge.
  for (const sx of [1, -1]) flRod(S, 0.07, L - 2 * rake, sx * (hw + 0.05), D - 0.08, 0, "z", 0x22262a, { rough: 0.7, metal: 0.4 });
  const bitts = [];
  for (const [bx, s] of [[hw - 0.5, 0.9], [-(hw - 0.5), 0.9], [hw - 0.5, L - 0.9], [-(hw - 0.5), L - 0.9]]) {
    const b = rig.part(`bitt${bitts.length + 1}`, bx, D, Z(s));
    for (const dz of [-0.2, 0.2]) cyl(b, 0.11, 0.12, 0.42, 0, 0.21, dz, 0x25292e, { rough: 0.55, metal: 0.5, seg: 12 });
    box(b, 0.14, 0.05, 0.62, 0, 0.44, 0, 0xe8b02e, { rough: 0.5, metal: 0.3, finish: "painted" });
    bitts.push(b);
  }
  rig.set("bitts", bitts);
  const ladder = rig.part("ladder", hw + 0.06, 0, Z(L / 2 - 1.5));
  for (const dz of [-0.2, 0.2]) flRod(ladder, 0.018, D + 0.9, 0.02, (D + 0.9) / 2, dz, "y", ...FL.steel);
  for (let r = 0; r < 5; r++) flRod(ladder, 0.014, 0.4, 0.02, D * (r + 0.5) / 5, 0, "z", ...FL.steel);
  return D;
}

/**
 * Flat steel deck barge, 16 m × 6 m × 1.8 m deep, raked both ends, four
 * double bitts and a side ladder; `opts.kind: "hopper"` adds a lined
 * sediment hopper — a coaming round the hold with a watertight liner and a
 * load that a station raises as it fills (`load.scale.y`). A station floats
 * it by setting y to minus the draft it wants. Parts: bitts, ladder, and for
 * the hopper coaming, liner, load.
 */
export function deckBarge(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0x31465c, fleetName: "BAY MARINE", unitNumber: "DB-12", accent: 0xe8b02e });
  const L = 16, W = 6, D = 1.8;
  const rig = flRig(parent, x, y, z, opts, "deckBarge");
  flBargeHull(rig, lv, L, W, D);
  if (opts.kind === "hopper") {
    const HL = 10, HW = 4.6, HH = 1.3;
    const co = rig.part("coaming", 0, D, 0);
    for (const sx of [1, -1]) box(co, 0.12, HH, HL, sx * HW / 2, HH / 2, 0, 0x8a4a2a, { rough: 0.6, metal: 0.4, finish: "painted" });
    for (const sz of [1, -1]) box(co, HW, HH, 0.12, 0, HH / 2, sz * HL / 2, 0x8a4a2a, { rough: 0.6, metal: 0.4, finish: "painted" });
    const liner = rig.part("liner", 0, D + 0.02, 0);
    box(liner, HW - 0.2, 0.02, HL - 0.2, 0, 0, 0, 0x1d2a22, { rough: 0.35, metal: 0.05 });
    const load = rig.part("load", 0, D + 0.03, 0);
    box(load, HW - 0.3, 1.0, HL - 0.4, 0, 0.5, 0, 0x4a3f33, { rough: 0.95, finish: "concrete" });
    load.scale.y = 0.25;
  }
  return flDone(rig, { footprint: FLEET_BUDGET[opts.kind === "hopper" ? "deckBarge:hopper" : "deckBarge"].footprint, livery: lv, deckY: D });
}

/**
 * Salvage crane barge: an 18 m spud barge carrying a revolving lattice-boom
 * crane aft, its boom luffed over the bow. The crane's house slews on its
 * turntable, the boom luffs about its foot pin, and the hook block hangs
 * plumb under the boom tip on its fall — a separate part, so a station can
 * lower it without it swinging with the boom. `opts.boomAngle` luffs the
 * boom (radians above horizontal), `opts.slew` turns the house, and
 * `opts.hookDrop` sets the fall; `userData.tip` is the boom tip in the
 * builder's frame. Parts: house, boom, hook, hoistLine, counterweight,
 * cabDoor, spuds, bitts, ladder.
 */
export function salvageCraneBarge(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0x3a3f46, fleetName: "BAY MARINE", unitNumber: "CB-4", accent: 0xe8b02e });
  const L = 18, W = 7, D = 1.9, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "salvageCraneBarge");
  flBargeHull(rig, lv, L, W, D);
  // Spuds in their wells at the stern corners, pinned up.
  const spuds = [];
  for (const sx of [1, -1]) {
    const sp = rig.part(`spud${spuds.length + 1}`, sx * (W / 2 - 0.55), D, Z(L - 0.55));
    box(sp, 0.7, 0.9, 0.7, 0, 0.45, 0, 0x5b6167, { rough: 0.6, metal: 0.45, finish: "painted" });
    box(sp, 0.42, 7.4, 0.42, 0, 1.9, 0, 0xe0892a, { rough: 0.5, metal: 0.4, finish: "painted" });
    spuds.push(sp);
  }
  rig.set("spuds", spuds);
  // Revolving crane: turntable, house, cab, A-frame gantry and counterweight.
  const cz = Z(L - 4.2);
  box(rig.shell, 2.6, 0.5, 2.6, 0, D + 0.25, cz, 0x2b3138, { rough: 0.6, metal: 0.5 });
  const house = rig.part("house", 0, D + 0.5, cz);
  box(house, 3.0, 1.9, 4.2, 0, 0.95, -0.4, 0xe8b02e, { rough: 0.45, metal: 0.3, finish: "painted" });
  flBox(house, 1.0, 1.5, 1.3, 1.95, 0.95, 0.9, flCanvasMat("crane-cab", 128, 128, (g, w, h) => {
    gradientFill(g, w, h, [[0, "#f0c13a"], [1, "#d59e22"]]);
    g.fillStyle = "#15191d"; g.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.46);
    flGlassPaint(g, w * 0.1, h * 0.1, w * 0.8, h * 0.42);
  }));
  const cabDoor = rig.part("cabDoor", 2.46, 0.3, 0.6, house);
  box(cabDoor, 0.04, 1.3, 0.6, 0, 0.65, 0, 0xd59e22, { rough: 0.45, metal: 0.3, finish: "painted" });
  cabDoor.userData.openAngle = 1.3;
  for (const sx of [1, -1]) flStrut(house, [sx * 1.1, 1.9, -1.8], [sx * 0.6, 4.2, -1.2], 0.08, 0x2b3138, { rough: 0.5, metal: 0.5 });
  const cw = rig.part("counterweight", 0, 0.2, -2.5, house);
  box(cw, 2.8, 1.5, 0.9, 0, 0.75, 0, 0x2b3138, { rough: 0.6, metal: 0.4, finish: "painted" });
  // Lattice boom: two chords each side with lacing, luffed by `angle`.
  const len = 13, angle = opts.boomAngle ?? 0.75;
  const boom = rig.part("boom", 0, 1.2, 1.1, house);
  boom.rotation.x = -angle;
  for (const sx of [1, -1]) for (const sy of [0, 0.9]) flRod(boom, 0.06, len, sx * 0.55 * (1 - sy * 0.3), sy, len / 2, "z", 0xe8b02e, { rough: 0.45, metal: 0.4, finish: "painted" });
  for (let i = 1; i < 6; i++) for (const sx of [1, -1]) flStrut(boom, [sx * 0.55, 0, i * len / 6 - 1], [sx * 0.42, 0.9, i * len / 6 + 0.9], 0.03, 0xe8b02e, { rough: 0.45, metal: 0.4 });
  box(boom, 1.0, 0.8, 0.6, 0, 0.45, len, 0x2b3138, { rough: 0.5, metal: 0.5 });
  boom.userData.len = len; boom.userData.angle = angle;
  // Pendants from the gantry to the tip, slewing with the house.
  const reach = 1.1 + Math.cos(angle) * len, tipY = D + 0.5 + 1.2 + Math.sin(angle) * len;
  flStrut(house, [0, 4.2, -1.2], [0, tipY - D - 0.5 + 0.9, reach], 0.03, 0x9aa1a8, { rough: 0.5, metal: 0.6 });
  // `opts.slew` turns the house on its turntable (radians about Y, 0 = boom
  // over the bow); the hook block hangs plumb under wherever the tip is.
  const slew = opts.slew ?? 0;
  house.rotation.y = slew;
  const tipX = Math.sin(slew) * reach, tipZ = cz + Math.cos(slew) * reach;
  const fall = opts.hookDrop ?? 5.5;
  const hoist = rig.part("hoistLine", tipX, tipY, tipZ);
  flRod(hoist, 0.02, fall, 0, -fall / 2, 0, "y", 0x9aa1a8, { rough: 0.5, metal: 0.6 });
  const hook = rig.part("hook", tipX, tipY - fall, tipZ);
  box(hook, 0.45, 0.6, 0.3, 0, -0.3, 0, 0xe8b02e, { rough: 0.45, metal: 0.4, finish: "painted" });
  torus(hook, 0.13, 0.04, 0, -0.75, 0, 0x2b3138, { rough: 0.4, metal: 0.7, seg: 8, seg2: 14 });
  return flDone(rig, { footprint: FLEET_BUDGET.salvageCraneBarge.footprint, livery: lv, deckY: D, tip: [tipX, tipY, tipZ] });
}

// ------------------------------------------------- marine: skimmer vessel

/**
 * Debris and oil skimming vessel: an 11 m aluminium catamaran with a bow
 * conveyor that lowers into the water and carries floating debris up into a
 * collection basket, two sweep arms that swing out to funnel a slick or a
 * trash line to the bow, a recovered-product tank with its hatch, and the
 * wheelhouse aft. A station floats it at about 0.6 m draft. Parts: conveyor
 * (pivots at its deck end; rotation.x lowers it), basket, sweepArms
 * [port, starboard] (rotation.y swings them out), tankHatch, wheelhouseDoor,
 * navLights {portLight, starboardLight, mastheadLight}.
 */
export function skimmerVessel(parent, x, y, z, opts = {}) {
  const lv = flLivery(opts.livery, { colour: 0x2a6f8f, fleetName: "BAY CLEANUP", unitNumber: "SV-2", accent: 0xf2c14b });
  const L = 11, W = 4.2, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "skimmerVessel", [0, 0, -0.6]);
  const S = rig.shell;
  // Twin demihulls and the bridging deck.
  for (const sx of [1, -1]) {
    const h = 0.55, cx = sx * (W / 2 - h);
    flPlan(S, [[cx + h, -L / 2], [cx + h, L / 2 - 1.2], [cx, L / 2 - 0.1], [cx - h, L / 2 - 1.2], [cx - h, -L / 2]], 1.0, 0, 0, 0, lv.colour, { rough: 0.4, metal: 0.55, finish: "brushed", bevel: 0.05 });
  }
  const side = flLiveryMat(lv, "skimmer", { title: lv.fleetName, sub: lv.unitNumber, titleScale: 0.34, stripeY: 0.78 });
  for (const sx of [1, -1]) flPanel(S, 5.6, 0.6, sx * (W / 2 + 0.012), 0.55, Z(5.4), side, sx > 0 ? "+x" : "-x");
  flBox(S, W, 0.3, L - 1.6, 0, 1.12, Z((L + 1.6) / 2), 0xc8ced4, { rough: 0.4, metal: 0.6 });
  flBox(S, W - 0.2, 0.02, L - 1.8, 0, 1.28, Z((L + 1.8) / 2), flTreadMat());
  for (const sx of [1, -1]) flRod(S, 0.025, L - 2.6, sx * (W / 2 - 0.08), 2.0, Z(L / 2 + 1.1), "z", ...FL.alu);
  for (const sx of [1, -1]) for (let s = 2.2; s < L - 0.5; s += 1.4) flRod(S, 0.022, 0.72, sx * (W / 2 - 0.08), 1.64, Z(s), "y", ...FL.alu);
  // Recovered-product tank amidships, hatch on top.
  box(S, 2.2, 1.0, 2.4, 0, 1.8, Z(5.3), 0x6f7a83, { rough: 0.5, metal: 0.45, finish: "painted" });
  const hatch = rig.part("tankHatch", 0, 2.32, Z(5.3));
  cyl(hatch, 0.32, 0.32, 0.08, 0, 0, 0, 0xe8b02e, { rough: 0.5, metal: 0.3, seg: 16 });
  // Wheelhouse aft of the tank.
  const wh0 = 7.0, wh1 = 9.4;
  flSide(S, [[wh0, 1.3], [wh0 - 0.15, 2.5], [wh0 + 0.1, 3.2], [wh1, 3.2], [wh1, 1.3]], 2.4, 0, 0, Z(0), 0xf0f1ee, { rough: 0.4, metal: 0.2, finish: "painted", bevel: 0.04 });
  const glass = flGlassMat();
  flPanel(S, 2.0, 0.6, 0, 2.85, Z(wh0 - 0.03) + 0.05, glass, "+z", 0.43);
  for (const sx of [1, -1]) flPanel(S, 1.8, 0.6, sx * 1.22, 2.7, Z(8.2), glass, sx > 0 ? "+x" : "-x");
  flRod(S, 0.04, 0.8, 0, 3.6, Z(8.4), "y", ...FL.alu);
  const door = rig.part("wheelhouseDoor", 1.21, 1.3, Z(9.1));
  flBox(door, 0.04, 1.6, 0.62, 0, 0.8, 0.31, flDoorMat(lv, "L", { window: 0.4, marks: "none", body: 0xf0f1ee }));
  door.userData.openAngle = 1.4;
  // Bow conveyor between the hulls, pivoting at its deck end.
  const conv = rig.part("conveyor", 0, 1.3, Z(1.4));
  const beltMat = flCanvasMat("skimmer-belt", 128, 256, (g, w, h) => {
    g.fillStyle = "#1b1e22"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#3a4046"; for (let yy = 0; yy < h; yy += 16) g.fillRect(4, yy, w - 8, 5);
  }, { rough: 0.7, metal: 0.2 });
  const CL = 2.6;
  conv.rotation.x = opts.conveyorDown ? 0.55 : 0.05;
  flBox(conv, 1.9, 0.08, CL, 0, 0, CL / 2, beltMat);
  for (const sx of [1, -1]) box(conv, 0.08, 0.35, CL, sx * 1.0, 0.1, CL / 2, 0xe8b02e, { rough: 0.5, metal: 0.4, finish: "painted" });
  const basket = rig.part("basket", 0, 1.3, Z(3.0));
  box(basket, 2.0, 0.9, 1.2, 0, 0.45, 0, 0x7d858d, { rough: 0.5, metal: 0.5, finish: "galvanised" });
  // Sweep arms, stowed fore-and-aft along each hull.
  const arms = [];
  for (const sx of [1, -1]) {
    const arm = rig.part(sx > 0 ? "sweepPort" : "sweepStarboard", sx * (W / 2 - 0.1), 1.35, Z(2.2));
    box(arm, 0.14, 0.14, 3.2, 0, 0, 1.5, 0xf2c14b, { rough: 0.5, metal: 0.3, finish: "painted" });
    box(arm, 0.06, 0.5, 3.0, sx * 0.05, -0.3, 1.5, 0xe8722a, { rough: 0.7 });
    arm.userData.deploy = sx * 0.9;
    arms.push(arm);
  }
  rig.set("sweepArms", arms);
  const nav = rig.part("navLights"); nav.userData.fleetBake = false;
  const port = rig.part("portLight", 1.23, 3.1, Z(wh0 + 0.3), nav);
  box(port, 0.08, 0.08, 0.1, 0, 0, 0, ...FL.red);
  const stbd = rig.part("starboardLight", -1.23, 3.1, Z(wh0 + 0.3), nav);
  box(stbd, 0.08, 0.08, 0.1, 0, 0, 0, ...FL.green);
  const mh = rig.part("mastheadLight", 0, 4.05, Z(8.4), nav);
  cyl(mh, 0.05, 0.05, 0.1, 0, 0, 0, ...FL.lamp, { seg: 10 });
  rig.set("lights", nav);
  return flDone(rig, { footprint: FLEET_BUDGET.skimmerVessel.footprint, livery: lv, draft: 0.6 });
}

// ------------------------------------------------ marine: knuckle crane

/**
 * Marine knuckle-boom deck crane, pedestal mounted, for a workboat's or a
 * barge's deck: slewing column, main boom, knuckle jib and hook on its fall,
 * with the operator's lever bank on the pedestal. Stands at y 0 on the deck
 * it is bolted to; the main boom is raised and the jib folded out forward
 * (+Z). Nested parts pivot where the real ones do: `slew` turns about Y,
 * `mainBoom` and `jib` luff about X, and `hook` hangs off the jib tip (a
 * station keeps it plumb by countering the luff). Parts: slew, mainBoom, jib,
 * hook, controls.
 */
export function deckCrane(parent, x, y, z, opts = {}) {
  const rig = flRig(parent, x, y, z, opts, "deckCrane", [-0.06, 0, -1.77]);
  const S = rig.shell;
  const paint = [0xe8b02e, { rough: 0.45, metal: 0.3, finish: "painted" }];
  cyl(S, 0.36, 0.42, 0.9, 0, 0.45, 0, 0x2b3138, { rough: 0.55, metal: 0.5, seg: 16 });
  const slew = rig.part("slew", 0, 0.9, 0);
  cyl(slew, 0.34, 0.34, 1.1, 0, 0.55, 0, ...paint, { seg: 16 });
  box(slew, 0.5, 0.3, 0.7, 0, 1.0, -0.2, 0x2b3138, { rough: 0.5, metal: 0.4 });
  const main = rig.part("mainBoom", 0, 1.05, 0.1, slew);
  main.rotation.x = -(opts.boomAngle ?? 0.85);
  box(main, 0.3, 0.34, 2.9, 0, 0, 1.45, ...paint);
  flStrut(slew, [0, 0.35, 0.3], [0, 1.2, 1.1], 0.07, ...FL.chrome);
  const jib = rig.part("jib", 0, 0, 2.9, main);
  jib.rotation.x = opts.jibAngle ?? 1.35;
  box(jib, 0.24, 0.28, 2.3, 0, 0, 1.15, ...paint);
  flStrut(main, [0, 0.2, 2.0], [0, 0.3, 3.2], 0.05, ...FL.chrome);
  const hook = rig.part("hook", 0, 0, 2.3, jib);
  hook.rotation.x = -(main.rotation.x + jib.rotation.x);   // hangs plumb
  flRod(hook, 0.012, 1.0, 0, -0.5, 0, "y", 0x9aa1a8, { rough: 0.5, metal: 0.6 });
  box(hook, 0.16, 0.22, 0.12, 0, -1.1, 0, ...paint);
  torus(hook, 0.06, 0.02, 0, -1.28, 0, 0x2b3138, { rough: 0.4, metal: 0.7, seg: 8, seg2: 12 });
  const ctl = rig.part("controls", 0.44, 0.7, -0.2);
  box(ctl, 0.18, 0.3, 0.34, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
  for (let i = 0; i < 4; i++) flRod(ctl, 0.008, 0.16, 0.05, 0.22, -0.12 + i * 0.08, "y", ...FL.red);
  return flDone(rig, { footprint: FLEET_BUDGET.deckCrane.footprint });
}

// ----------------------------------------------- marine: derelict vessel

/**
 * A derelict fibreglass sailboat, 9 m, dismasted, the kind that drags its
 * anchor onto a mudflat or sinks at a mooring: faded gelcoat, a band of
 * marine growth at the waterline, a stump of mast, open companionway, bow
 * and stern cleats, a fuel vent on the quarter, and two marked sling points
 * where a salvage rigger passes the lifting slings. Keel at y 0 (the fin keel
 * included); a station sinks, lists or trims it by its own transform. Parts:
 * hatch, cleats, slingPoints [bow, stern], fuelVent.
 */
export function derelictBoat(parent, x, y, z, opts = {}) {
  const L = 9, W = 2.9, hw = W / 2, Z = (s) => L / 2 - s;
  const rig = flRig(parent, x, y, z, opts, "derelictBoat");
  const S = rig.shell;
  // Fin keel and skeg under the hull.
  box(S, 0.18, 0.9, 1.4, 0, 0.45, Z(4.2), 0x2b2f33, { rough: 0.8 });
  box(S, 0.12, 0.6, 0.5, 0, 0.6, Z(7.8), 0x2b2f33, { rough: 0.8 });
  const plan = (k) => [[k * hw * 0.8, -L / 2], [k * hw, -L / 2 + 2.2], [k * hw, L / 2 - 3.0], [k * hw * 0.65, L / 2 - 1.2], [0, L / 2], [-k * hw * 0.65, L / 2 - 1.2], [-k * hw, L / 2 - 3.0], [-k * hw, -L / 2 + 2.2], [-k * hw * 0.8, -L / 2]];
  flPlan(S, plan(0.72), 0.5, 0, 0.85, 0, 0x5b6d52, { rough: 0.9, bevel: 0.08 });
  flPlan(S, plan(1.0), 0.95, 0, 1.3, 0, 0xd9d4c6, { rough: 0.75, metal: 0.05, bevel: 0.05 });
  const topside = flCanvasMat("derelict-topside", 512, 128, (g, w, h) => {
    gradientFill(g, w, h, [[0, "#e2ddce"], [0.7, "#c9c2ae"], [1, "#6d7a5a"]]);
    noiseTexture(g, w, h, { density: 2400, alpha: 0.12 });
    g.fillStyle = "rgba(60,80,50,0.7)"; g.fillRect(0, h * 0.82, w, h * 0.18);   // growth band
    g.fillStyle = "rgba(120,70,40,0.35)"; for (let i = 0; i < 9; i++) g.fillRect(w * (0.08 + i * 0.1), h * 0.1, 4, h * 0.7);   // rust streaks
    g.fillStyle = "#2b2f33"; g.font = "700 26px Arial, sans-serif"; g.textAlign = "left"; g.fillText("CF 0000 XX", w * 0.1, h * 0.35);
    grimeOverlay(g, w, h, { blotches: 8, streaks: 10, alpha: 0.2 });
  }, { rough: 0.8 });
  for (const sx of [1, -1]) flPanel(S, 5.4, 0.9, sx * (hw + 0.012), 1.75, Z(4.6), topside, sx > 0 ? "+x" : "-x");
  // Cabin trunk and the stump of the mast.
  box(S, 1.8, 0.5, 3.0, 0, 2.5, Z(4.0), 0xcfc9b8, { rough: 0.75 });
  flRod(S, 0.07, 1.2, 0, 3.3, Z(3.2), "y", 0xa7adb3, { rough: 0.5, metal: 0.4 });
  const hatch = rig.part("hatch", 0, 2.76, Z(5.3));
  box(hatch, 0.7, 0.05, 0.6, 0, 0, 0, 0x7a6a52, { rough: 0.8 });
  const cleats = [];
  for (const s of [0.5, L - 0.4]) {
    const c = rig.part(`cleat${cleats.length + 1}`, 0, 2.27, Z(s));
    box(c, 0.2, 0.05, 0.06, 0, 0.03, 0, ...FL.steel);
    cleats.push(c);
  }
  rig.set("cleats", cleats);
  const slings = [];
  for (const s of [2.4, 6.6]) {
    const sp = rig.part(slings.length ? "slingStern" : "slingBow", 0, 1.3, Z(s));
    for (const sx of [1, -1]) box(sp, 0.03, 0.9, 0.16, sx * (hw + 0.03), 0.45, 0, 0xf2c14b, { rough: 0.6, emissive: 0x6a5010, ei: 0.3 });
    slings.push(sp);
  }
  rig.set("slingPoints", slings);
  const vent = rig.part("fuelVent", -hw + 0.05, 1.9, Z(7.2));
  cyl(vent, 0.04, 0.04, 0.06, 0, 0, 0, ...FL.chrome, { seg: 10 });
  return flDone(rig, { footprint: FLEET_BUDGET.derelictBoat.footprint });
}

// ------------------------------------------------------------------ budget

/**
 * Declared mesh count (after mergeStatic), footprint [width X, height Y,
 * length Z] in metres and required named parts per builder. check_fleet.mjs
 * builds each headlessly and holds it to all three; the gallery prints the
 * count it actually measured. `build` is the FLEET_BUILDERS key, `opts` the
 * options the entry is built with.
 */
export const FLEET_BUDGET = {
  semiTractor: { build: "semiTractor", meshes: 23, footprint: [3.02, 3.95, 6.86], parts: ["doorL", "doorR", "mirrorL", "mirrorR", "wheels", "lights", "headlights", "markerLights", "tailLights", "fifthWheel", "fifthWheelRelease", "gladHandService", "gladHandEmergency"], note: "Class 8 day cab, tandem drive, fifth wheel, air lines and glad hands" },
  "semiTractor:sleeper": { build: "semiTractor", opts: { cab: "sleeper" }, meshes: 23, footprint: [3.02, 4, 8.66], parts: ["doorL", "doorR", "mirrorL", "mirrorR", "wheels", "lights", "fifthWheel", "gladHandService", "gladHandEmergency"], note: "Class 8 raised-roof sleeper" },
  "trailer:dryVan": { build: "trailer", opts: { kind: "dryVan" }, meshes: 14, footprint: [2.63, 4.11, 16.27], parts: ["doorL", "doorR", "wheels", "landingGear", "gladHands", "lights"], note: "53 ft dry van, swing doors, conspicuity tape" },
  "trailer:flatbed": { build: "trailer", opts: { kind: "flatbed" }, meshes: 13, footprint: [2.66, 1.53, 14.69], parts: ["wheels", "landingGear", "gladHands", "lights", "stakePockets", "winches"], note: "48 ft flatbed with stake pockets and winches" },
  "trailer:reefer": { build: "trailer", opts: { kind: "reefer" }, meshes: 17, footprint: [2.63, 4.11, 16.7], parts: ["doorL", "doorR", "wheels", "landingGear", "gladHands", "lights", "reeferUnit"], note: "53 ft reefer with nose-mounted unit" },
  "trailer:tanker": { build: "trailer", opts: { kind: "tanker" }, meshes: 14, footprint: [2.63, 3.26, 12.94], parts: ["wheels", "landingGear", "gladHands", "lights", "manholes", "valves"], note: "42 ft DOT-406 style tanker, placarded 3 / 1203" },
  tractorTrailer: { build: "tractorTrailer", meshes: 37, footprint: [3.02, 4.11, 20.71], parts: ["tractor", "trailer"], note: "day cab coupled to a 53 ft dry van" },
  boxTruck: { build: "boxTruck", meshes: 21, footprint: [3.02, 4.05, 10], parts: ["doorL", "doorR", "mirrorL", "mirrorR", "wheels", "lights", "rearDoor"], note: "Class 6, 26 ft box, roll-up door" },
  pickup: { build: "pickup", meshes: 17, footprint: [2.39, 1.93, 5.92], parts: ["doorFL", "doorFR", "doorRL", "doorRR", "wheels", "mirrorL", "mirrorR", "lights", "tailgate"], note: "full-size crew cab" },
  sedan: { build: "sedan", meshes: 17, footprint: [2.23, 1.45, 4.92], parts: ["doorFL", "doorFR", "doorRL", "doorRR", "wheels", "mirrorL", "mirrorR", "lights", "trunk"], note: "mid-size four-door" },
  cargoVan: { build: "cargoVan", meshes: 18, footprint: [2.41, 2.72, 5.99], parts: ["doorL", "doorR", "doorSlide", "doorRearL", "doorRearR", "wheels", "mirrorL", "mirrorR", "lights"], note: "high-roof cargo van" },
  ambulance: { build: "ambulance", meshes: 25, footprint: [2.62, 3.13, 7.06], parts: ["doorL", "doorR", "doorSide", "doorRearL", "doorRearR", "compartments", "warningLights", "wheels", "mirrorL", "mirrorR", "lights"], note: "Type III, generic markings, rear chevrons" },
  fireEngine: { build: "fireEngine", meshes: 28, footprint: [3.2, 3.23, 10.25], parts: ["doorL", "doorR", "doorCrewL", "doorCrewR", "pumpPanel", "pumpControls", "hoseBed", "ladder", "compartments", "warningLights", "wheels", "mirrorL", "mirrorR", "lights"], note: "pumper: pump panel, hose bed, roof ladders" },
  bucketTruck: { build: "bucketTruck", meshes: 32, footprint: [3.3, 3.44, 9.6], parts: ["doorL", "doorR", "mirrorL", "mirrorR", "wheels", "lights", "turret", "boom", "boomUpper", "bucket", "outriggers", "compartments", "controls"], note: "insulated aerial device, articulated turret-boom-bucket" },
  busTransit: { build: "busTransit", meshes: 16, footprint: [3.3, 3.26, 12.42], parts: ["doorFront", "doorRear", "destinationSign", "wheels", "mirrorL", "mirrorR", "lights"], note: "40 ft low-floor" },
  forkliftCounterbalance: { build: "forkliftCounterbalance", meshes: 21, footprint: [1.12, 2.28, 3.57], parts: ["mast", "innerMast", "carriage", "forks", "overheadGuard", "counterweight", "lpgTank", "seat", "controls", "beacon", "wheels", "lights"], note: "5,000 lb LPG counterbalance" },
  yardHustler: { build: "yardHustler", meshes: 19, footprint: [2.91, 3.43, 5.61], parts: ["doorL", "doorRear", "mirrorL", "mirrorR", "wheels", "fifthWheel", "gladHandService", "gladHandEmergency", "beacon", "lights"], note: "terminal tractor, lifting fifth wheel" },
  workboat: { build: "workboat", meshes: 16, footprint: [3.15, 3.45, 8.18], parts: ["wheelhouseDoor", "outboards", "davit", "navLights", "portLight", "starboardLight", "mastheadLight"], note: "7.6 m aluminium workboat" },
  skiff: { build: "skiff", meshes: 17, footprint: [2.11, 1.79, 5.69], parts: ["outboard", "console", "killSwitch", "bowCleat", "sternCleat", "navLights", "portLight", "starboardLight", "sternLight"], note: "5.2 m aluminium centre-console skiff" },
  deckBarge: { build: "deckBarge", meshes: 13, footprint: [6.24, 2.7, 16], parts: ["bitts", "ladder"], note: "16 m flat steel deck barge, raked ends" },
  "deckBarge:hopper": { build: "deckBarge", opts: { kind: "hopper" }, meshes: 16, footprint: [6.24, 3.1, 16], parts: ["bitts", "ladder", "coaming", "liner", "load"], note: "deck barge with a lined sediment hopper" },
  salvageCraneBarge: { build: "salvageCraneBarge", meshes: 30, footprint: [7.24, 13.59, 18], parts: ["house", "boom", "hook", "hoistLine", "counterweight", "cabDoor", "spuds", "bitts", "ladder"], note: "18 m spud barge with a revolving lattice-boom crane" },
  skimmerVessel: { build: "skimmerVessel", meshes: 20, footprint: [4.22, 4.1, 12.21], parts: ["conveyor", "basket", "sweepArms", "tankHatch", "wheelhouseDoor", "navLights", "portLight", "starboardLight", "mastheadLight"], note: "11 m catamaran debris and oil skimmer" },
  deckCrane: { build: "deckCrane", meshes: 12, footprint: [0.95, 4.58, 4.65], parts: ["slew", "mainBoom", "jib", "hook", "controls"], note: "pedestal knuckle-boom deck crane" },
  derelictBoat: { build: "derelictBoat", meshes: 12, footprint: [2.99, 3.9, 9], parts: ["hatch", "cleats", "slingPoints", "fuelVent"], note: "9 m derelict sailboat, dismasted and fouled" },
};

/** The builders by the name FLEET_BUDGET's `build` field uses. */
export const FLEET_BUILDERS = {
  semiTractor, trailer, tractorTrailer, boxTruck, pickup, sedan, cargoVan, ambulance, fireEngine,
  bucketTruck, busTransit, forkliftCounterbalance, yardHustler, workboat,
  skiff, deckBarge, salvageCraneBarge, skimmerVessel, deckCrane, derelictBoat,
};
