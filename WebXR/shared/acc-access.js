// ACCESS — inside and outside, every building you can approach (console `acc`, docs/consoles/ACCESS.md).
//
// SEAMS (every top-level name is acc/ACC_-prefixed: the bundler shares one scope; three.js comes from the caller):
//
//   ACC_DOOR, ACC_RAMP, ACC_BUDGET    plain data: the clear door width, the ramp rule and the per-tier budget
//   accEntrances(parish)              -> one entrance per enterable site building: { site, b, door, spot, face, rise, ramp, width,
//                                        route: { ok, len, blocked } } (the same door spots the parishes app enters from)
//   accStepFree(parish, e)            -> { ok, len, blocked }: the walk from the door spot to the nearest street, sampled each metre,
//                                        clear of every site footprint (+ the avatar radius) and out of water
//   accSiteStyles(parish, { skip })   -> { siteId: styleId }: the sites of the four cued kinds open the ACCESS rooms
//   accRegisterSiteStyles(ix, parish, { skip })  writes accSiteStyles into INTERIORS' IX_SITE_STYLE (its seam), returns the count
//   accStreetAt(parish, x, z)         -> the street name the HUD shows outside ("Canal Street", else "local street")
//   accParts(parish, e, tier)         -> world-space boxes of one entrance: the marked frame, threshold, lit lamp, ramp and rails,
//                                        and the pictogram wayfinding sign beside the facade
//   accBuild({ THREE, parish, tier, ua }) -> { group, meshes, triangles, entrances } (null on the phone tier or a headset browser)
//   ACC_INPUTS, accWireXR(session, use)  one grammar for in and out: E, the touch Use button, the pad's A and the headset's
//                                        select all call the app's one use()
//
// Generic by kind and procedural: boxes in vertex colours, no texture, no light, no words on the sign (a walking figure, a door
// and an arrow; a ramp glyph where the door has a ramp), no protected emblem. Desktop high and balanced only; the phone tier and a
// headset browser build nothing, so their budgets do not change.

import { cwSiteBuilding, cwDoorOf, cwNearestLine } from "./cw-cityworks.js";
import { npHeightAt, npPrepare } from "./np-parish.js";
import { tfWaterDepthAt } from "./tf-terraform.js";
import { NW_AVATAR } from "./nw-physics.js";
import { ixDoorSpot } from "./ix-interiors.js";

/** The marked door: clear width at least the walk collider's diameter plus 0.25 m each side. */
export const ACC_DOOR = { width: 1.2, height: 2.3, frame: 0.12 };
/** A ramp where the door sill stands above the spot's ground: 1:12 at most, 1.2 m wide, a 1.2 m landing, rails both sides. */
export const ACC_RAMP = { maxSlope: 1 / 12, minRise: 0.02, width: 1.2, landing: 1.2, rail: 0.9 };
/** Stated budget (measured by check_acc): meshes per map and triangles per entrance; no texture, no light. */
export const ACC_BUDGET = {
  meshesPerMap: { low: 0, balanced: 2, high: 2 },
  trianglesPerEntrance: { low: 0, balanced: 168, high: 360 },
  trianglesPerChunk: { low: 0, balanced: 2400, high: 4800 },
  textureBytes: 0, lights: 0,
};
export const ACC_KIND_STYLE = { "fire-station": "acc-fire-bay", hospital: "acc-drop-off-lobby", school: "acc-classroom-wing", park: "acc-park-pavilion" };
const ACC_COL = { frame: 0xf2c14b, jamb: 0xf7f8f9, sill: 0xf2c14b, housing: 0x3a3f45, lit: 0xfff4d6, ramp: 0xb9b5ad, rail: 0x8a9096,
  post: 0x5c6167, panel: 0x1f4e79, glyph: 0xf7f8f9, arrow: 0xf2c14b };

/** The walk from the door spot to the nearest street: out from the door, then straight or round one corner, each leg sampled
 *  every metre clear of every site footprint (+ the avatar radius) and out of water. The first clear path counts. */
export function accStepFree(parish, e, blds = null) {
  blds ??= (parish.sites ?? []).map((_, i) => { try { return cwSiteBuilding(parish, i); } catch { return null; } }).filter(Boolean);
  const near = cwNearestLine(parish, e.spot.x, e.spot.z, 400, (l) => l.cls !== "ferry" && !l.deck);
  if (!near) return { ok: false, len: 0, blocked: "no street within 400 m", approach: accApproach(parish, e, blds) };
  const r = NW_AVATAR.radius, o = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[e.face] ?? [0, 1];
  const leg = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(len));
    for (let k = 0; k <= n; k++) {
      const t = k / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      const hit = blds.find((b) => Math.abs(x - b.cx) < b.w / 2 + r && Math.abs(z - b.cz) < b.d / 2 + r);
      if (hit) return `site building ${hit.site.id}`;
      let wd = 0; try { wd = tfWaterDepthAt(parish, x, z); } catch { wd = 0; }
      if (wd > 0.02) return "water";
    }
    return null;
  };
  const S = e.spot, a = [-o[1], o[0]];
  // Street points to reach: the nearest street to probes out from the door and along the face (a street may run under a site
  // footprint, so a target inside any footprint is skipped).
  const inFoot = (x, z) => blds.some((b) => Math.abs(x - b.cx) < b.w / 2 + r && Math.abs(z - b.cz) < b.d / 2 + r);
  const targets = [];
  for (const dir of [o, a, [-a[0], -a[1]]]) for (const k of [0, 3, 6, 12, 24]) {
    const q = cwNearestLine(parish, S.x + dir[0] * k, S.z + dir[1] * k, 400, (l) => l.cls !== "ferry" && !l.deck);
    if (q && !inFoot(q.px, q.pz) && !targets.some((t) => Math.hypot(t[0] - q.px, t[1] - q.pz) < 0.5)) targets.push([q.px, q.pz]);
  }
  const paths = [];
  for (const P of targets.slice(0, 8)) {
    paths.push([[S.x, S.z], P], [[S.x, S.z], [S.x, P[1]], P], [[S.x, S.z], [P[0], S.z], P]);
    for (const k of [3, 6, 12]) { const q = [S.x + o[0] * k, S.z + o[1] * k]; paths.push([[S.x, S.z], q, P], [[S.x, S.z], q, [q[0], P[1]], P], [[S.x, S.z], q, [P[0], q[1]], P]); }
  }
  let first = targets.length ? null : "every nearby street point is under a site footprint";
  for (const path of paths) {
    let why = null, len = 0;
    for (let i = 1; i < path.length && !why; i++) { why = leg(path[i - 1][0], path[i - 1][1], path[i][0], path[i][1]); len += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); }
    if (!why) return { ok: true, len, blocked: null, path };
    first ??= why;
  }
  return { ok: false, len: near.d, blocked: first, approach: accApproach(parish, e, blds) };
}

/** Where no street reaches: the 6 m apron straight out from the door, clear of footprints and water (an open approach). */
function accApproach(parish, e, blds) {
  const o = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[e.face] ?? [0, 1], r = NW_AVATAR.radius;
  for (let k = 0; k <= 6; k++) {
    const x = e.spot.x + o[0] * k, z = e.spot.z + o[1] * k;
    if (blds.some((b) => Math.abs(x - b.cx) < b.w / 2 + r && Math.abs(z - b.cz) < b.d / 2 + r)) return false;
    let wd = 0; try { wd = tfWaterDepthAt(parish, x, z); } catch { wd = 0; }
    if (wd > 0.02) return false;
  }
  return true;
}

/** One input grammar for in and out: every input calls the same use (the parishes app's npUse), which enters at a door spot and
 *  leaves at the room's door. The headset's select (a controller trigger or a hand pinch) is wired by accWireXR. */
export const ACC_INPUTS = [
  { input: "keyboard", bind: "KeyE", label: "E" },
  { input: "touch", bind: "np-use", label: "Use" },
  { input: "gamepad", bind: "button 0", label: "A" },
  { input: "headset", bind: "select", label: "Trigger" },
];
/** Wire a WebXR session's select to the same use. Returns an unwire function. */
export function accWireXR(session, use) {
  if (!session?.addEventListener || typeof use !== "function") return () => {};
  const fn = () => use("headset");
  session.addEventListener("select", fn);
  return () => { try { session.removeEventListener?.("select", fn); } catch (_) { /* ended */ } };
}

const accCache = new WeakMap();
/** One entrance per site building (the parishes app's door spots: CITYWORKS' door, 1.4 m out on the road face). */
export function accEntrances(parish) {
  if (!parish) return [];
  if (accCache.has(parish)) return accCache.get(parish);
  const sites = npPrepare(parish).sites ?? [];
  const blds = sites.map((_, i) => { try { return cwSiteBuilding(parish, i); } catch { return null; } });
  const out = [];
  blds.forEach((b) => {
    if (!b) return;
    const door = cwDoorOf(parish, b), spot = ixDoorSpot(door);
    const ground = npHeightAt(parish, door.x + (spot.x - door.x) * 0.5, door.z + (spot.z - door.z) * 0.5);
    const rise = Math.abs(b.y - npHeightAt(parish, spot.x, spot.z)); // a sill above or below the spot's ground both need a ramp
    const ramp = rise > ACC_RAMP.minRise ? { rise, len: Math.max(1.2, rise / ACC_RAMP.maxSlope), slope: 0 } : null;
    if (ramp) ramp.slope = ramp.rise / ramp.len;
    const e = { site: b.site, b, door, spot, face: door.face, ground, rise, ramp, width: ACC_DOOR.width, lit: true, marked: true };
    e.route = accStepFree(parish, e, blds.filter(Boolean));
    out.push(e);
  });
  accCache.set(parish, out);
  return out;
}

/** The sites of the four cued kinds open the ACCESS rooms, except a site CLASSROOMS furnishes (its teaching room stays). */
export function accSiteStyles(parish, { skip = new Set() } = {}) {
  const out = {};
  for (const s of parish?.sites ?? []) if (ACC_KIND_STYLE[s.kind] && !skip.has(s.id)) out[s.id] = ACC_KIND_STYLE[s.kind];
  return out;
}
export function accRegisterSiteStyles(ix, parish, opts = {}) {
  if (!ix?.IX_SITE_STYLE) return 0;
  const m = accSiteStyles(parish, opts);
  for (const [id, st] of Object.entries(m)) if (!ix.IX_SITE_STYLE[id]) ix.IX_SITE_STYLE[id] = st;
  return Object.keys(m).length;
}

/** The street the HUD names outside: the nearest named road within 120 m, else "local street". */
export function accStreetAt(parish, x, z) {
  try {
    const near = cwNearestLine(parish, x, z, 120, (l) => l.named && l.cls !== "ferry");
    if (near) { const r = (parish.roads ?? []).find((q) => q.id === near.line.id); if (r?.name) return r.name; }
    return cwNearestLine(parish, x, z, 120) ? "local street" : "off-street";
  } catch { return "local street"; }
}

/** World-space boxes of one entrance, in the door face's frame (+out away from the wall, along the face). */
export function accParts(parish, e, tier = "high") {
  if (tier === "low") return [];
  const hi = tier === "high";
  const o = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[e.face] ?? [0, 1], a = [-o[1], o[0]]; // out, along
  const y0 = e.b.y, yg = npHeightAt(parish, e.spot.x, e.spot.z), W = ACC_DOOR.width, H = ACC_DOOR.height, F = ACC_DOOR.frame;
  const parts = [];
  // A box at (along u, out v, up y) in the face frame, size (su along, sv out, sy up).
  const box = (u, v, y, su, sv, sy, col, name) => {
    const x = e.door.x + a[0] * u + o[0] * v, z = e.door.z + a[1] * u + o[1] * v;
    const alongX = Math.abs(a[0]) > 0.5;
    parts.push({ x, y, z, w: alongX ? su : sv, h: sy, d: alongX ? sv : su, col, name });
  };
  // The marked door: two jambs and a head in a contrasting colour, 4 cm proud of the facade; a contrasting sill strip.
  box(-(W / 2 + F / 2), 0.04, y0 + H / 2, F, 0.08, H, ACC_COL.jamb, "jamb");
  box(W / 2 + F / 2, 0.04, y0 + H / 2, F, 0.08, H, ACC_COL.jamb, "jamb");
  box(0, 0.04, y0 + H + F / 2, W + 2 * F, 0.08, F, ACC_COL.frame, "head");
  box(0, 0.35, y0 + 0.01, W + 0.4, 0.7, 0.02, ACC_COL.sill, "sill");
  // The lit entrance: a housing on a short arm over the head, its lit face below (the lit faces are their own unlit mesh).
  box(0, 0.25, y0 + H + 0.45, 0.6, 0.5, 0.12, ACC_COL.housing, "housing");
  box(0, 0.25, y0 + H + 0.38, 0.5, 0.4, 0.02, ACC_COL.lit, "lit");
  // The ramp where the sill stands above the spot's ground: a sloped slab (as stepped-free wedge: one box, pitched), two rails.
  if (e.ramp) {
    const L = e.ramp.len, mid = ACC_RAMP.landing + L / 2;
    parts.push({ ...rampBox(e, o, a, mid, L, yg, y0), col: ACC_COL.ramp, name: "ramp" });
    box(-(ACC_RAMP.width / 2 + 0.05), mid, (yg + y0) / 2 + ACC_RAMP.rail, 0.05, L, 0.05, ACC_COL.rail, "rail");
    box(ACC_RAMP.width / 2 + 0.05, mid, (yg + y0) / 2 + ACC_RAMP.rail, 0.05, L, 0.05, ACC_COL.rail, "rail");
  }
  // The pictogram wayfinding sign, beside the facade 1.8 m along from the jamb: a post, a panel, and on it (high) a walking
  // figure, a door and an arrow; balanced keeps the panel, the door and the arrow. A ramp glyph where there is a ramp.
  const su = W / 2 + 1.8, sv = 0.9, top = yg + 2.1;
  box(su, sv, yg + 1.05, 0.08, 0.08, 2.1, ACC_COL.post, "sign-post");
  box(su, sv + 0.06, top, 0.9, 0.04, 0.7, ACC_COL.panel, "sign-panel");
  const g = (du, dy, w, h, col = ACC_COL.glyph, name = "glyph") => box(su + du, sv + 0.09, top + dy, w, 0.02, h, col, name);
  g(0.22, 0.12, 0.05, 0.38); g(0.42, 0.12, 0.05, 0.38); g(0.32, 0.29, 0.25, 0.05); // the door: two jambs and a head
  g(-0.12, -0.24, 0.42, 0.05, ACC_COL.arrow, "arrow"); g(0.1, -0.24, 0.08, 0.14, ACC_COL.arrow, "arrow"); // the arrow toward the door
  if (hi) {
    g(-0.2, 0.25, 0.09, 0.09); g(-0.2, 0.1, 0.07, 0.2); g(-0.25, -0.05, 0.05, 0.16); g(-0.15, -0.05, 0.05, 0.16); // head, body, legs
    g(-0.27, 0.12, 0.05, 0.14); g(-0.13, 0.12, 0.05, 0.14); // arms
    if (e.ramp) g(0.32, -0.12, 0.3, 0.04, ACC_COL.arrow, "ramp-glyph");
  }
  return parts;
}
function rampBox(e, o, a, mid, L, yg, y0) {
  const x = e.door.x + o[0] * mid, z = e.door.z + o[1] * mid, alongX = Math.abs(a[0]) > 0.5;
  const pitch = Math.atan2(y0 - yg, L);
  return { x, y: (yg + y0) / 2 - 0.05, z, w: alongX ? ACC_RAMP.width : L, h: 0.1, d: alongX ? L : ACC_RAMP.width, pitch, out: o };
}

/** A headset browser builds nothing (its budget stays as it was). */
function accHeadset(ua) { return /OculusBrowser|Quest|Pico|Wolvic|XR/i.test(String(ua ?? "")); }

/** Two merged meshes per map: the entrances' structure (lit by the scene) and the lamps' lit faces (unlit, always bright). */
export function accBuild({ THREE, parish, tier = "high", ua = typeof navigator !== "undefined" ? navigator.userAgent : "" } = {}) {
  if (!THREE || !parish || tier === "low" || accHeadset(ua)) return null;
  const ents = accEntrances(parish);
  const solid = [], lit = [];
  for (const e of ents) for (const p of accParts(parish, e, tier)) (p.name === "lit" ? lit : solid).push(p);
  const group = new THREE.Group(); group.name = "acc-entrances";
  const unit = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
  const merge = (parts, material, name) => {
    if (!parts.length) return null;
    const n = unit.attributes.position.count, pos = new Float32Array(parts.length * n * 3), nor = new Float32Array(parts.length * n * 3), col = new Float32Array(parts.length * n * 3);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), nv = new THREE.Vector3(), c = new THREE.Color(), nm = new THREE.Matrix3();
    parts.forEach((p, k) => {
      if (p.pitch) { const axis = new THREE.Vector3(-p.out[1], 0, p.out[0]); q.setFromAxisAngle(axis, -p.pitch); } else q.identity();
      m4.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(p.w, p.h, p.d)); nm.getNormalMatrix(m4); c.setHex(p.col);
      for (let i = 0; i < n; i++) {
        v.fromBufferAttribute(unit.attributes.position, i).applyMatrix4(m4); nv.fromBufferAttribute(unit.attributes.normal, i).applyMatrix3(nm).normalize();
        const o3 = (k * n + i) * 3; pos[o3] = v.x; pos[o3 + 1] = v.y; pos[o3 + 2] = v.z; nor[o3] = nv.x; nor[o3 + 1] = nv.y; nor[o3 + 2] = nv.z; col[o3] = c.r; col[o3 + 1] = c.g; col[o3 + 2] = c.b;
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, material); mesh.name = name; mesh.matrixAutoUpdate = false; group.add(mesh); return mesh;
  };
  merge(solid, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0.1 }), "acc-entrance-parts");
  merge(lit, new THREE.MeshBasicMaterial({ vertexColors: true }), "acc-entrance-lamps");
  unit.dispose();
  let meshes = 0, triangles = 0;
  group.traverse((o) => { if (o.isMesh) { meshes++; triangles += o.geometry.attributes.position.count / 3; } });
  return { group, meshes, triangles, entrances: ents.length, parts: solid.length + lit.length };
}
