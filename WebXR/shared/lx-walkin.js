// LANDMARKS-2 — walk-in landmark interiors (console `lx`, docs/consoles/LANDMARKS-2.md).
//
//   lxWalkinStyleOf(kind) -> style | null          which kit kinds open into a room
//   lxWalkinDoors(lmKits) -> [{ id, kind, style, x, z, yaw }]   a door spot at the front of every walk-in kit on a map
//   lxBuildRoom(style, { three, tier = "high", ix }) -> { group, hw, hd, h, meshes, triangles, style, label }
//   lxWalkin({ three, scene, outdoor, tier, ix }) -> { enter(door, at), exit(), clamp(x, z), eyeY(eye), inside, room, door }
//
// Four public places open into a GENERIC, SCHEMATIC room: a marketplace hall under a clock tower (`ferry-building`), a
// lighthouse lamp room (`lighthouse`), a pier shed (`wharf-pier-shed`) and a conservatory glasshouse (`glasshouse`). No real
// building's interior is modelled; every room is generic by kind and says so on its label. INTERIORS (`ix`) is building a
// shared room shell in `shared/ix-interiors.js` in parallel: pass its module as `ix` (or set globalThis.IX_INTERIORS) and a
// room is built with `ix.ixBuildRoom(style, { three, tier })` when that returns a THREE.Group — guarded, so until that module
// lands (or if it throws or does not know the style) the minimal room below stands. Nothing here imports anything; three.js
// comes from the caller. Nothing moves, so the rooms are still under reduced motion.
//
// Inside, the outdoor world is hidden (`outdoor.visible = false`, the caller stops streaming while `inside`), the room stands
// at LX_ROOM_Y below the map, the player walks a box collider (`clamp`) and `exit()` returns the door spot.

export const LX_ROOM_Y = -400;
export const LX_BUDGET = { meshes: 120, trianglesHigh: 4000, trianglesLow: 1800 };
export const LX_STYLES = {
  "market-hall": { kinds: ["ferry-building"], w: 22, d: 60, h: 11, floor: 0xb9ad96, wall: 0xe6dcc6, label: "A market hall under a clock tower (a generic, schematic room)" },
  "lamp-room": { kinds: ["lighthouse"], w: 7, d: 7, h: 4, floor: 0x5b5f64, wall: 0xdfe6ea, label: "A lighthouse lamp room (a generic, schematic room)" },
  "pier-shed": { kinds: ["wharf-pier-shed"], w: 20, d: 56, h: 9, floor: 0x7a6146, wall: 0xcfc6b2, label: "A pier shed (a generic, schematic room)" },
  "glasshouse": { kinds: ["glasshouse"], w: 14, d: 36, h: 8, floor: 0x9a8f7a, wall: 0xbfd9df, label: "A conservatory glasshouse (a generic, schematic room)" },
};

/** The walk-in style of a kit kind, or null. */
export function lxWalkinStyleOf(kind) {
  for (const [style, s] of Object.entries(LX_STYLES)) if (s.kinds.includes(kind)) return style;
  return null;
}

/** Door spots for a world's lmKits ([{ id, kind, x, z, group }] from npBuildParish): the kit's front edge along its yaw. */
export function lxWalkinDoors(lmKits = []) {
  const out = [];
  for (const k of lmKits) {
    const style = lxWalkinStyleOf(k.kind);
    if (!style) continue;
    const yaw = k.group?.rotation?.y ?? 0, r = style === "lamp-room" ? 5 : 14;
    out.push({ id: k.id, kind: k.kind, style, x: k.x + Math.sin(yaw) * r, z: k.z + Math.cos(yaw) * r, yaw });
  }
  return out;
}

function lxCount(group) {
  let meshes = 0, triangles = 0;
  group.traverse((o) => { if (o.isMesh) { meshes++; const g = o.geometry, n = (g.index ? g.index.count : g.attributes.position.count) / 3; triangles += o.isInstancedMesh ? n * o.count : n; } });
  return { meshes, triangles: Math.round(triangles) };
}

/** The minimal room: floor, ceiling, four walls, and one InstancedMesh of dressing per style (stalls, rails, crates, beds). */
function lxOwnRoom(T, style, tier) {
  const s = LX_STYLES[style], low = tier === "low", g = new T.Group();
  const mat = (c, extra = {}) => new T.MeshLambertMaterial({ color: c, ...extra });
  const floor = new T.Mesh(new T.BoxGeometry(s.w, 0.2, s.d), mat(s.floor)); floor.position.y = -0.1; floor.name = "lx-floor";
  const ceil = new T.Mesh(new T.BoxGeometry(s.w, 0.2, s.d), mat(style === "glasshouse" ? 0xdfeef2 : s.wall, style === "glasshouse" ? { transparent: true, opacity: 0.6 } : {})); ceil.position.y = s.h; ceil.name = "lx-ceiling";
  g.add(floor, ceil);
  const wallMat = mat(s.wall, style === "glasshouse" || style === "lamp-room" ? { transparent: true, opacity: 0.55 } : {});
  for (const [w, d, x, z] of [[s.w, 0.3, 0, -s.d / 2], [s.w, 0.3, 0, s.d / 2], [0.3, s.d, -s.w / 2, 0], [0.3, s.d, s.w / 2, 0]]) {
    const m = new T.Mesh(new T.BoxGeometry(w, s.h, d), wallMat); m.position.set(x, s.h / 2, z); m.name = "lx-wall"; g.add(m);
  }
  // dressing: one InstancedMesh (generic by kind)
  const m4 = new T.Matrix4(); let geo, colour, spots = [];
  if (style === "market-hall") { geo = new T.BoxGeometry(3, 1, 2).translate(0, 0.5, 0); colour = 0x8e6a4a; for (let z = -24; z <= 24; z += low ? 8 : 4) for (const x of [-6, 6]) spots.push([x, z]); }
  else if (style === "pier-shed") { geo = new T.BoxGeometry(1.6, 1.6, 1.6).translate(0, 0.8, 0); colour = 0x7a6146; for (let z = -22; z <= 22; z += low ? 11 : 5.5) for (const x of [-6, -4, 6]) spots.push([x, z]); }
  else if (style === "glasshouse") { geo = new T.CylinderGeometry(0.9, 1.1, 0.8, low ? 5 : 8).translate(0, 0.4, 0); colour = 0x4d7a52; for (let z = -14; z <= 14; z += low ? 7 : 3.5) for (const x of [-4.5, 4.5]) spots.push([x, z]); }
  else { geo = new T.CylinderGeometry(1.2, 1.2, 1.8, low ? 8 : 14).translate(0, 0.9, 0); colour = 0xe8c86a; spots = [[0, 0]]; } // the lamp on its pedestal
  const im = new T.InstancedMesh(geo, mat(colour), spots.length);
  spots.forEach(([x, z], i) => { m4.makeTranslation(x, 0, z); im.setMatrixAt(i, m4); });
  im.name = "lx-dressing"; g.add(im);
  const light = new T.PointLight(0xfff1d6, 1.1, Math.max(s.w, s.d) * 1.5); light.position.set(0, s.h - 1, 0); g.add(light);
  if (style !== "lamp-room") g.add(new T.HemisphereLight(0xffffff, 0x444444, 0.6));
  return g;
}

/** Build one walk-in room. `ix` (INTERIORS' module) is tried first and guarded. */
export function lxBuildRoom(style, opts = {}) {
  const T = opts.three, s = LX_STYLES[style];
  if (!T || !s) return null;
  const tier = opts.tier === "low" ? "low" : "high";
  let group = null, via = "lx";
  const ix = opts.ix ?? globalThis.IX_INTERIORS;
  if (typeof ix?.ixBuildRoom === "function") {
    try { const r = ix.ixBuildRoom(style, { three: T, tier, w: s.w, d: s.d, h: s.h }); const gg = r?.isObject3D ? r : r?.group; if (gg?.isObject3D) { group = gg; via = "ix"; } } catch { group = null; }
  }
  if (!group) group = lxOwnRoom(T, style, tier);
  group.name = `lx-room-${style}`;
  const c = lxCount(group);
  group.userData = { ...group.userData, lxStyle: style, schematic: true, via, label: s.label };
  return { group, hw: s.w / 2 - 0.6, hd: s.d / 2 - 0.6, h: s.h, meshes: c.meshes, triangles: c.triangles, style, label: s.label, via };
}

/** The walk-in controller for one world. `outdoor` is the object hidden while inside (the parish root). */
export function lxWalkin({ three, scene, outdoor, tier = "high", ix } = {}) {
  const st = { inside: false, room: null, door: null, back: null };
  const api = {
    get inside() { return st.inside; },
    get room() { return st.room; },
    get door() { return st.door; },
    /** Go in at `door` (from lxWalkinDoors); `at` is where the player stands now. Returns the spawn { x, z } inside. */
    enter(door, at = { x: door.x, z: door.z }) {
      if (st.inside || !door?.style) return null;
      const room = lxBuildRoom(door.style, { three, tier, ix });
      if (!room) return null;
      room.group.position.set(0, LX_ROOM_Y, 0);
      scene?.add(room.group);
      if (outdoor) outdoor.visible = false;
      Object.assign(st, { inside: true, room, door, back: { x: at.x, z: at.z } });
      return { x: 0, z: room.hd - 1.5 };
    },
    /** Come out: the room is removed and disposed, the outdoor world shows again. Returns the door spot { x, z }. */
    exit() {
      if (!st.inside) return null;
      scene?.remove(st.room.group);
      st.room.group.traverse((o) => { if (o.isMesh) { o.geometry?.dispose?.(); o.material?.dispose?.(); } });
      if (outdoor) outdoor.visible = true;
      const back = { x: st.door.x, z: st.door.z };
      Object.assign(st, { inside: false, room: null, door: null, back: null });
      return back;
    },
    /** The room collider: keeps (x, z) inside the walls. */
    clamp(x, z) {
      if (!st.inside) return { x, z };
      return { x: Math.max(-st.room.hw, Math.min(st.room.hw, x)), z: Math.max(-st.room.hd, Math.min(st.room.hd, z)) };
    },
    eyeY(eye = 1.6) { return LX_ROOM_Y + eye; },
  };
  return api;
}
