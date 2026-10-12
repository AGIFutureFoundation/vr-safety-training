// ENV-HD-4 — an opt-in "Ultra" desktop setting (console `hd4`, docs/consoles/ENV-HD-4.md).
// SmartCiti.X Powered by AGI Corp.
//
// Ultra is OFF by default. It is offered only on the desktop high tier: never on the phone tier, never on balanced, never in
// a standalone headset browser and never inside an XR session (hd4UltraAllowed). When the viewer switches it on (the Me tab's
// "Ultra detail" button, kept in localStorage; `?ultra=1` for one load, `?ultra=0` forces it off), the page reloads and:
//   - ROBO-EXTERIORS' facade atlas is drawn at 2048 px (512 px cells) with a 512 px lit-window mask, instead of 1024 / 256;
//   - the six robot rooms' hero textures (the epoxy floor with its marks and the painted concrete walls) are drawn at 2048 px
//     instead of 1024 (the brushed metal and the guard mesh stay at 1024);
//   - near-camera detail is built: on each robot site's building, roof-edge guard railings, roof plant with fan housings and
//     louvre fins, and a cat ladder (the construction site: slab-edge guardrails and a stair tower); in each robot room,
//     ceiling trusses and cable trays on hangers.
// The high tier is unchanged by this module: with Ultra off nothing here runs. Ultra has its own stated budget (HD4_ULTRA_BUDGET)
// and the capture drive measures its frame time beside high's (tools/drive_hd4_scenes.mjs).
//
// Assets rule: geometry from code, textures drawn on a canvas (ROBO-EXTERIORS' and ROBO-INTERIORS' own painters at a larger
// size); nothing names a company, union or trade body, no words are drawn, nothing models a real building.
//
// SEAMS (every top-level name is hd4/HD4_-prefixed: the bundler shares one scope; three.js comes from the caller):
//   HD4_ULTRA_KEY                     the localStorage key ("holodeck-ultra-v1": "on" | absent)
//   HD4_ULTRA_BUDGET                  plain data: atlas and hero sizes, texture bytes per map and per room, added triangles and
//                                       draw calls per site and per room, the room totals Ultra may reach
//   hd4Headset(ua)                    -> true for a standalone headset browser (the same test ROBO-INTERIORS uses, widened)
//   hd4UltraAllowed({ tier, ua, coarse, width, height, xr }) -> bool (pure): desktop high only
//   hd4UltraChoice({ tier, search, storage, env }) -> { on, allowed, source: "url" | "chosen" | "default" | "not offered" }
//   hd4SetUltra(on, storage?)         -> bool (stored)
//   hd4MountUltraToggle({ host, after, state, onChange, doc }) -> the button (hidden when not allowed) | null
//   hd4UltraSiteDetail(THREE, layout) -> THREE.Mesh "hd4-ultra-site-<id>" (world space; userData.hd4 = { triangles })
//   hd4MountUltraSites({ THREE, root, layouts }) -> { group, counts(), dispose() }
//   hd4UltraRoom({ three, group, room }) -> { hero: [names], meshes, triangles } (the 2048 px floor and walls, trusses, trays)
//   hd4UltraTextureBytes(kind)        -> GPU bytes Ultra's hero textures take (kind "facade" per map, "room" per room)

import { ixrFloorTexture, ixrSetTexture, IXR_ROOMS } from "./ixr-robo-interiors.js";

export const HD4_ULTRA_KEY = "holodeck-ultra-v1";
const hd4MiB = 1024 * 1024;
const hd4Bytes = (w, h = w) => Math.round(w * h * 4 * 4 / 3); // RGBA8 with a mip chain
/** Ultra's stated budget. Texture bytes are GPU bytes with mips; "added" figures are on top of the desktop high tier. */
export const HD4_ULTRA_BUDGET = {
  facadeAtlasPx: 2048, facadeMaskPx: 512, roomHeroPx: 2048,
  facadeTextureBytes: 24 * hd4MiB, // per map: the 2048 atlas (21.33 MiB) + the 512 mask (1.33 MiB) = 22.67 MiB
  roomTextureBytes: 64 * hd4MiB, // per room: floor + walls at 2048 (42.67 MiB) + metal and mesh at 1024 + the shell's signs
  siteMeshesAdded: 1, siteTrianglesAdded: 6000, siteDrawCallsAdded: 1,
  roomMeshesAdded: 2, roomTrianglesAdded: 2500, roomDrawCallsAdded: 2,
  roomTrianglesTotal: 6000 + 2500, roomMeshesTotal: 120, roomLightsTotal: 3,
};

/** A standalone headset browser (ROBO-INTERIORS' test, plus the other standalone browsers). */
export function hd4Headset(ua = typeof navigator !== "undefined" ? navigator.userAgent : "") {
  return /OculusBrowser|PICO|Quest|Wolvic|Mobile VR/i.test(String(ua || ""));
}
/** Pure: may this device turn Ultra on? Desktop high only: never the phone tier (or a coarse pointer or a small screen),
 *  never balanced, never a headset browser, never inside an XR session. */
export function hd4UltraAllowed({ tier = "high", ua = "", coarse = false, width = 1920, height = 1080, xr = false } = {}) {
  return tier === "high" && !coarse && Math.min(width, height) >= 600 && !hd4Headset(ua) && !xr;
}
function hd4Env() {
  const out = { ua: "", coarse: false, width: 1920, height: 1080, xr: false };
  try {
    if (typeof navigator !== "undefined") out.ua = navigator.userAgent || "";
    if (typeof matchMedia === "function") out.coarse = matchMedia("(pointer:coarse)").matches;
    if (typeof window !== "undefined") { out.width = window.innerWidth || 1920; out.height = window.innerHeight || 1080; }
  } catch { /* an old browser: the defaults */ }
  return out;
}
/** Whether Ultra is on for this load, and why. Off unless the viewer chose it (or `?ultra=1`) on an allowed device. */
export function hd4UltraChoice({ tier = "high", search = typeof location !== "undefined" ? location.search : "", storage = null, env = null } = {}) {
  const e = env ?? hd4Env();
  const allowed = hd4UltraAllowed({ tier, ...e });
  if (!allowed) return { on: false, allowed, source: "not offered" };
  let url = null;
  try { url = new URLSearchParams(search || "").get("ultra"); } catch { url = null; }
  if (url === "1" || url === "on") return { on: true, allowed, source: "url" };
  if (url === "0" || url === "off") return { on: false, allowed, source: "url" };
  let chosen = null;
  try { const s = storage ?? (typeof localStorage !== "undefined" ? localStorage : null); chosen = s?.getItem(HD4_ULTRA_KEY) ?? null; } catch { chosen = null; }
  return chosen === "on" ? { on: true, allowed, source: "chosen" } : { on: false, allowed, source: "default" };
}
export function hd4SetUltra(on, storage = null) {
  try {
    const s = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);
    if (!s) return false;
    if (on) s.setItem(HD4_ULTRA_KEY, "on"); else s.removeItem(HD4_ULTRA_KEY);
    return true;
  } catch { return false; }
}
/** The Me tab's button ("Ultra detail: off / on"), at least 44 px tall. Hidden (and never focusable) where Ultra is not offered. */
export function hd4MountUltraToggle({ host = null, after = null, state = null, onChange = null, doc = typeof document !== "undefined" ? document : null } = {}) {
  if (!doc || !host) return null;
  const b = doc.createElement("button");
  b.type = "button"; b.className = "btn"; b.id = "hd4-ultra";
  b.style.minHeight = "44px";
  b.title = "Desktop only: 2048 px facade and room textures and near-camera detail (reloads the page)";
  const set = (on) => { b.setAttribute("aria-pressed", String(!!on)); b.textContent = `Ultra detail: ${on ? "on" : "off"}`; };
  set(!!state?.on);
  b.hidden = !state?.allowed;
  b.addEventListener("click", () => {
    const on = b.getAttribute("aria-pressed") !== "true";
    hd4SetUltra(on); set(on);
    onChange?.(on);
  });
  if (after?.parentElement === host) after.insertAdjacentElement("afterend", b); else host.appendChild(b);
  return b;
}

/** GPU bytes of Ultra's hero textures: "facade" (per map: atlas + mask) or "room" (per room: floor + walls). */
export function hd4UltraTextureBytes(kind = "facade") {
  const B = HD4_ULTRA_BUDGET;
  return kind === "room" ? 2 * hd4Bytes(B.roomHeroPx) : hd4Bytes(B.facadeAtlasPx) + hd4Bytes(B.facadeMaskPx);
}

// ------------------------------------------------------------------------------------------------ exterior near-camera detail

const HD4_C = { rail: 0xd9b23a, steel: 0x6d737a, plant: 0x9aa3ab, dark: 0x2a2e33, fan: 0x3b4147, ladder: 0x8b9299, guard: 0xe8b923 };
/** The near-camera detail of one robot site's building, merged into one vertex-coloured mesh in world space. */
export function hd4UltraSiteDetail(THREE, l) {
  const pos = [], col = [], c = new THREE.Color();
  const bm = new THREE.Matrix4().makeRotationY(l.yaw).setPosition(l.x, l.y, l.z);
  const put = (geo, colour, x, y, z, ry = 0) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.applyMatrix4(bm.clone().multiply(new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z)));
    c.set(colour);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); col.push(c.r, c.g, c.b); }
    g.dispose(); if (g !== geo) geo.dispose();
  };
  const box = (w, h, d, colour, x, y, z, ry = 0) => put(new THREE.BoxGeometry(w, h, d), colour, x, y, z, ry);
  const cyl = (r, h, colour, x, y, z, seg = 10) => put(new THREE.CylinderGeometry(r, r, h, seg), colour, x, y, z);
  /** Guard railing round a w × d rectangle at height y (posts every ~1.6 m, a top rail and a knee rail). */
  const railing = (w, d, y, cx = 0, cz = 0, colour = HD4_C.rail) => {
    for (const [len, ax, off] of [[w, "x", d / 2], [w, "x", -d / 2], [d, "z", w / 2], [d, "z", -w / 2]]) {
      const n = Math.max(2, Math.round(len / 1.6));
      for (let i = 0; i <= n; i++) {
        const u = -len / 2 + (i * len) / n;
        if (ax === "x") box(0.05, 1.1, 0.05, colour, cx + u, y + 0.55, cz + off); else box(0.05, 1.1, 0.05, colour, cx + off, y + 0.55, cz + u);
      }
      for (const hy of [1.08, 0.55]) { if (ax === "x") box(len, 0.045, 0.045, colour, cx, y + hy, cz + off); else box(0.045, 0.045, len, colour, cx + off, y + hy, cz); }
    }
  };
  /** A rooftop air-handling unit: casing, two fan housings with grilles, louvre fins down one side, a duct into the roof. */
  const plantUnit = (x, y, z, w = 3, d = 2) => {
    box(w, 1.3, d, HD4_C.plant, x, y + 0.65, z);
    for (const fx of [-w / 4, w / 4]) { cyl(0.55, 0.35, HD4_C.fan, x + fx, y + 1.47, z, 14); cyl(0.5, 0.04, HD4_C.dark, x + fx, y + 1.66, z, 14); for (let k = 0; k < 3; k++) box(1.0, 0.03, 0.03, HD4_C.steel, x + fx, y + 1.69, z - 0.3 + k * 0.3); }
    for (let k = 0; k < 9; k++) box(0.04, 0.9, 0.08, HD4_C.steel, x - w / 2 + 0.3 + k * ((w - 0.6) / 8), y + 0.65, z + d / 2 + 0.05);
    box(0.6, 0.5, 0.6, HD4_C.steel, x - w / 2 - 0.3, y + 0.25, z);
  };
  /** A cat ladder up a wall (stiles, rungs every 0.3 m, a safety hoop cage at the top). */
  const ladder = (x, z, h, ry) => {
    for (const s of [-0.22, 0.22]) box(0.05, h + 1.1, 0.06, HD4_C.ladder, x + s * Math.cos(ry), (h + 1.1) / 2, z - s * Math.sin(ry), ry);
    for (let y = 0.3; y < h + 1; y += 0.3) box(0.44, 0.03, 0.03, HD4_C.ladder, x, y, z, ry);
    for (let y = 2.4; y < h + 1; y += 1.2) box(0.7, 0.04, 0.04, HD4_C.ladder, x + 0.35 * Math.sin(ry), y, z + 0.35 * Math.cos(ry), ry);
  };
  const K = { fabHall: [30, 20, 9], researchLab: [24, 16, 12], distWarehouse: [40, 22, 10], portTower: [34, 10, 20], constructionSite: [40, 18, 10.2] }[l.kind] ?? [l.w, l.d, l.h];
  const [W, D, H] = K;
  if (l.kind === "fabHall" || l.kind === "researchLab" || l.kind === "distWarehouse") {
    railing(W - 0.6, D - 0.6, H + (l.kind === "researchLab" ? 0 : 0.8));
    if (l.kind === "fabHall") { plantUnit(-11, H, -6); plantUnit(9, H, -5.5, 2.6, 1.8); }
    else if (l.kind === "researchLab") { plantUnit(-8, H, 4.5, 2.6, 1.8); plantUnit(8, H, 4.5, 2.6, 1.8); }
    else { plantUnit(-14, H, -5); plantUnit(0, H, -6); plantUnit(14, H, -5); }
    ladder(-W / 2 - 0.08, -D / 4, H, -Math.PI / 2);
  } else if (l.kind === "portTower") {
    railing(9.6, 9.6, H + 3.93, -12, 0); // the cab roof
    railing(10, 8, 4, -12, 0); // the base building's roof
    for (let k = 0; k < 2; k++) box(0.06, 3.2, 0.06, HD4_C.steel, -10.2 - k * 3.6, H + 5.5, 2 - k * 4); // antenna masts
    plantUnit(-12, 4, -1.6, 2.4, 1.6);
    ladder(-16.6, 2.2, 4, -Math.PI / 2);
  } else if (l.kind === "constructionSite") {
    for (const y of [3.53, 6.93]) railing(17.6, 11.6, y, 0, 0, HD4_C.guard); // slab-edge guardrails on both poured floors
    for (let k = 0; k < 6; k++) { box(2.4, 0.06, 1.0, HD4_C.steel, 10.6, 0.9 + k * 1.15, -6.2 + (k % 2) * 1.1); box(0.06, 1.2, 1.0, HD4_C.steel, 9.4, 0.6 + k * 1.15, -6.2 + (k % 2) * 1.1); } // a stair tower
    for (const [x, z] of [[9.4, -6.8], [11.8, -6.8], [9.4, -4.5], [11.8, -4.5]]) box(0.08, 7.4, 0.08, HD4_C.steel, x, 3.7, z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  mesh.name = `hd4-ultra-site-${l.id}`;
  mesh.userData.hd4 = { id: l.id, kind: l.kind, triangles: Math.round(pos.length / 9) };
  return mesh;
}
/** Mount the near-camera detail for this map's robot sites (Ultra only; the caller decides). */
export function hd4MountUltraSites({ THREE, root, layouts = [] } = {}) {
  const group = new THREE.Group(); group.name = "hd4-ultra-sites"; root?.add(group);
  const built = layouts.map((l) => { const m = hd4UltraSiteDetail(THREE, l); group.add(m); return m; });
  return {
    group,
    counts: () => ({ sites: built.length, meshes: built.length, triangles: built.reduce((a, m) => a + m.userData.hd4.triangles, 0), perSite: built.map((m) => ({ ...m.userData.hd4 })) }),
    dispose() { for (const m of built) { m.geometry.dispose(); m.material.dispose(); } root?.remove(group); },
  };
}

// ------------------------------------------------------------------------------------------------ rooms: hero textures and detail

/** Ultra in one robot room: the floor and walls redrawn at 2048 px, ceiling trusses and cable trays (two instanced meshes). */
export function hd4UltraRoom({ three: THREE, group, room }) {
  if (!THREE || !room || !IXR_ROOMS[room.id]) return null;
  const px = HD4_ULTRA_BUDGET.roomHeroPx, hero = [];
  const floor = group.getObjectByName("ix-floor"), wall = group.getObjectByName("ix-wall-0");
  if (floor?.material) { const old = floor.material.map; floor.material.map = ixrFloorTexture(THREE, room.id, room, px); floor.material.needsUpdate = true; if (old && old !== floor.material.map) old.dispose?.(); hero.push("floor"); }
  if (wall?.material) { wall.material.map = ixrSetTexture(THREE, "concrete", px, [Math.max(room.w, room.d) / 2, room.h / 2]); wall.material.needsUpdate = true; hero.push("walls"); }
  const { w, d, h } = room, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), zAxis = new THREE.Vector3(0, 0, 1);
  // Trusses across the room every ~4 m under the ceiling: top and bottom chords, verticals and alternating diagonals.
  const truss = [], depth = Math.min(0.9, h * 0.16), yTop = h - 0.12, yBot = yTop - depth;
  const nT = Math.max(2, Math.floor(d / 4));
  for (let i = 0; i < nT; i++) {
    const z = -d / 2 + (d / nT) * (i + 0.5);
    truss.push([w, 0.1, 0.12, 0, yTop, z, 0], [w, 0.1, 0.12, 0, yBot, z, 0]);
    const bays = Math.max(4, Math.round(w / 2));
    for (let k = 0; k <= bays; k++) truss.push([0.07, depth, 0.07, -w / 2 + (w * k) / bays, (yTop + yBot) / 2, z, 0]);
    for (let k = 0; k < bays; k++) { const bw = w / bays, len = Math.hypot(bw, depth), a = Math.atan2(depth, bw) * (k % 2 ? 1 : -1); truss.push([len, 0.05, 0.05, -w / 2 + bw * (k + 0.5), (yTop + yBot) / 2, z, a]); }
  }
  // Cable trays along both side walls and one across the back, on hangers every 2 m.
  const tray = [], yTray = Math.max(2.6, yBot - 0.35);
  for (const x of [-w / 2 + 0.5, w / 2 - 0.5]) {
    tray.push([0.35, 0.07, d - 1.2, x, yTray, 0, 0], [0.02, 0.1, d - 1.2, x - 0.17, yTray + 0.05, 0, 0], [0.02, 0.1, d - 1.2, x + 0.17, yTray + 0.05, 0, 0]);
    for (let z = -d / 2 + 1; z < d / 2 - 0.5; z += 2) tray.push([0.03, h - yTray, 0.03, x, (h + yTray) / 2, z, 0]);
  }
  tray.push([w - 1.2, 0.07, 0.35, 0, yTray, -d / 2 + 0.5, 0]);
  const add = (list, name, colour) => {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: colour, roughness: 0.55, metalness: 0.35 }), list.length);
    im.name = name;
    list.forEach(([bw, bh, bd, x, y, z, rz], i) => { q.setFromAxisAngle(zAxis, rz); m4.compose(v.set(x, y, z), q, s.set(bw, bh, bd)); im.setMatrixAt(i, m4); });
    group.add(im);
    return im;
  };
  const a = add(truss, "hd4-ultra-trusses", 0x7d858c), b = add(tray, "hd4-ultra-cable-trays", 0x9aa3ab);
  const triangles = 12 * (a.count + b.count);
  room.hd4Ultra = { hero, meshes: 2, triangles, trusses: nT };
  return room.hd4Ultra;
}
