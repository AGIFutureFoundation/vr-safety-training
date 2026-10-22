// ENV-HD-2 — high-detail canvas textures for the most-visited INTERIORS rooms (console `hd2`, docs/consoles/ENV-HD-2.md).
// SmartCiti.X Powered by AGI Corp.
//
// ROBO-INTERIORS drew a procedural canvas texture set for its six robotics rooms (ixr-robo-interiors.js: an epoxy floor with
// the room's floor marks, painted concrete walls, brushed metal props; 1024 px on the desktop high tier, 256 px everywhere
// else). This module puts the same set on the INTERIORS styles most sites open into, as one more dresser per style: it only
// sets texture maps on the meshes the shell and the other dressers already made — it adds no mesh, light or geometry, so a
// room's meshes and triangles are exactly what they were. Rooms stay generic by kind: every texture is drawn from code (no
// image file, no logo, no words, no company, union or trade-body name) and nothing models a real building.
//
// ENV-HD-3 (docs/consoles/ENV-HD-3.md) put the set on every other INTERIORS style: the kitchen (a stainless variant: brushed
// metal on counters, hoods, racks and cabinets), the union hall, the six Louisiana rooms of LA-ROOMS, and TYCOON's rented
// room and shop (25 of 25 styles), with a third set, "hall" (a plank floor and the painted block wall), for the halls and
// the rented room. The skin is budget-aware: it adds a map only while the room stays inside HD2_TEX_BUDGET with everything
// already in it counted (the shell's two signs and, in a Louisiana room, LA-ROOMS' name-sign canvases), floor first.
//
// SEAMS (every top-level name is hd2/HD2_-prefixed: the bundler shares one scope; three.js comes from the caller):
//   HD2_SKIN_STYLES                 plain data: style id -> { set: "industrial" | "tile" | "hall", sites, metal? } (sites = how many
//                                     parish-engine sites open the style, counted over the maps: why these first; metal = the
//                                     prop kinds that take brushed metal when not the default rack/machine/tank/cabinet/hood)
//   HD2_SIGN_BYTES                  GPU bytes of one LA-ROOMS name-sign canvas per tier (high 512 x 120; balanced and the phone
//                                     256 x 60 since ENV-HD-5, lar-rooms.js LAR_SIGN_PX; mips)
//   hd2RoomBytes(group, tier)       -> texture bytes a room already carries before the skin (shell signs + LA name signs)
//   HD2_TEX_BUDGET                  GPU texture bytes per room per tier (w × h × 4, × 4/3 with a mip chain), every texture in
//                                     the room counted, the shell's two 512 × 256 signs included: high 24 MiB, balanced and
//                                     low 3 MiB (ROBO-INTERIORS' IXR_TEX_BUDGET, the same rooms' budget)
//   hd2FloorMarks(styleId, room)    -> the floor marks an industrial room's epoxy floor carries (ixrFloorTexture's mark format)
//   hd2SkinRoom({ three, group, room, tier })  -> { style, set, res, maps } | null: the floor, the walls and the metal props
//                                     take the set; the industrial set draws ixr's epoxy floor and painted concrete, the tile set
//                                     a vinyl-tile floor and a painted block wall; brushed metal on racks, machines, tanks,
//                                     cabinets and hoods either way
//   hd2RegisterSkins(ix)            -> the style ids registered (ix = { ixRegisterDresser }; null registers none). Register
//                                     after the other dressers so the skin sees their meshes (it never adds one).

import { ixrTexRes, ixrSetTexture, ixrFloorTexture } from "./ixr-robo-interiors.js";

/** The styles skinned, most-visited first (site counts over the maps: workshop 167, plant room 139, port shed 124, civic
 *  lobby 108, classroom 62, apparatus bay 55, transit barn 53, clinic 52, warehouse 47; ENV-HD-3: kitchen 23, Louisiana
 *  crafts hall 9, union hall 6, hangar 4, compressor building 4, fabrication shop 4, control room 3, data hall 3, and
 *  TYCOON's rented room and shop, which no map site opens). */
export const HD2_SKIN_STYLES = {
  "workshop": { set: "industrial", sites: 167 },
  "plant-room": { set: "industrial", sites: 139 },
  "port-shed": { set: "industrial", sites: 124 },
  "civic-lobby": { set: "tile", sites: 80 },
  "rec-gym": { set: "hall", sites: 16 },
  "event-hall": { set: "hall", sites: 12 },
  "classroom": { set: "tile", sites: 62 },
  "apparatus-bay": { set: "industrial", sites: 55 },
  "transit-barn": { set: "industrial", sites: 53 },
  "clinic": { set: "tile", sites: 52 },
  "warehouse": { set: "industrial", sites: 47 },
  "kitchen": { set: "tile", sites: 23, metal: ["counter", "hood", "rack", "cabinet"] },
  "lar-craft-hall": { set: "hall", sites: 9 },
  "union-hall": { set: "hall", sites: 6 },
  "lar-hangar": { set: "industrial", sites: 4 },
  "lar-compressor": { set: "industrial", sites: 4 },
  "lar-fab-shop": { set: "industrial", sites: 4 },
  "lar-control-room": { set: "tile", sites: 3 },
  "lar-data-hall": { set: "tile", sites: 3 },
  "rented-room": { set: "hall", sites: 0 },
  "shop": { set: "tile", sites: 0 },
  "hd4-hive-ops": { set: "tile", sites: 0 }, // ENV-HD-4: the hive operations room (no map site opens it; it has its own door)
  // ACCESS (loop 10 round 8b): the four walk-in kinds behind the fire station, hospital, school and park doors. The app opens
  // them through IX_SITE_STYLE, not ixStyleFor, so the parish-engine count is 0; the set matches each kind's nearest style.
  "acc-fire-bay": { set: "industrial", sites: 0 },
  "acc-drop-off-lobby": { set: "tile", sites: 0 },
  "acc-classroom-wing": { set: "tile", sites: 0 },
  "acc-park-pavilion": { set: "hall", sites: 0 },
};
export const HD2_TEX_BUDGET = { high: 24 * 1024 * 1024, balanced: 3 * 1024 * 1024, low: 3 * 1024 * 1024 };
/** One LA-ROOMS name-sign canvas (lar-rooms.js LAR_SIGN_PX: 512 x 120 on high; 256 x 60 on balanced, as on the phone tier,
 *  since ENV-HD-5, so the six Louisiana rooms fit balanced's 3 MiB), with mips. */
export const HD2_SIGN_BYTES = { high: Math.round(512 * 120 * 4 * 4 / 3), balanced: Math.round(256 * 60 * 4 * 4 / 3), low: Math.round(256 * 60 * 4 * 4 / 3) };
const HD2_SHELL_BYTES = 2 * Math.round(512 * 256 * 4 * 4 / 3); // the shell's two 512 x 256 signs (IXR_SHELL_SIGNS)
const hd2MapBytes = (res) => Math.round(res * res * 4 * 4 / 3);
/** Texture bytes a room carries before the skin, counted the same way headless and in the page: the shell's two signs and one
 *  canvas per LA-ROOMS name sign (headless, LA-ROOMS draws a flat panel instead, so its canvases are counted by mesh). */
export function hd2RoomBytes(group, tier = "high") {
  let signs = 0;
  group?.traverse?.((o) => { if (o.isMesh && /^lar-sign-/.test(o.name)) signs++; });
  return HD2_SHELL_BYTES + signs * (HD2_SIGN_BYTES[tier] ?? HD2_SIGN_BYTES.high);
}

const HD2_Y = "#f2c14b", HD2_W = "#eef2f4";
const HD2_METAL_PROPS = /^ix-dress-(rack|machine|tank|cabinet|hood)$/;
const hd2MetalTest = (spec) => (spec.metal ? new RegExp(`^ix-dress-(${spec.metal.join("|")})$`) : HD2_METAL_PROPS);

/** An industrial room's floor marks (room-local metres, the door on +z): a hatched door apron, a yellow walkway from the door
 *  to the back wall, a dashed perimeter keep-clear line, and per kind a bay line or a keep-clear box. */
export function hd2FloorMarks(styleId, room) {
  const w = room?.w ?? 12, d = room?.d ?? 10, hw = w / 2, hd = d / 2;
  const m = [
    ["hatch", 0, hd - 0.7, 2.6, 1.0],
    ["line", -1.0, hd - 1.3, -1.0, -hd + 1.2, 0.1, HD2_Y], ["line", 1.0, hd - 1.3, 1.0, -hd + 1.2, 0.1, HD2_Y],
    ["dash", -hw + 0.9, -hd + 0.9, hw - 0.9, -hd + 0.9, 0.08, HD2_Y, 0.6],
    ["dash", -hw + 0.9, -hd + 0.9, -hw + 0.9, hd - 1.6, 0.08, HD2_Y, 0.6], ["dash", hw - 0.9, -hd + 0.9, hw - 0.9, hd - 1.6, 0.08, HD2_Y, 0.6],
  ];
  if (styleId === "apparatus-bay" || styleId === "transit-barn") {
    m.push(["dash", -w / 4, hd - 0.4, -w / 4, -hd + 1.5, 0.12, HD2_W, 1.2], ["dash", w / 4, hd - 0.4, w / 4, -hd + 1.5, 0.12, HD2_W, 1.2]);
  } else if (styleId === "plant-room" || styleId === "workshop") {
    m.push(["box", 0, -hd / 4, w * 0.62, d * 0.42, 0.1, HD2_Y]);
  } else if (styleId === "port-shed" || styleId === "warehouse") {
    m.push(["line", -hw + 1.6, 0, hw - 1.6, 0, 0.1, HD2_Y], ["cross", -hw + 2.2, hd - 2.2, 0.8, 0.08, HD2_W]);
  }
  return m;
}

const HD2_TEX_CACHE = new Map();
function hd2Canvas(w, h) {
  if (typeof document === "undefined" || !document.createElement) return null;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  return c.getContext("2d") ? c : null;
}
function hd2Rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
/** Wrap a canvas (or, headless, a same-size stub so the bytes are still measured) as a texture. */
function hd2Texture(THREE, canvas, w, h, name, repeat = null) {
  const tex = canvas ? new THREE.CanvasTexture(canvas) : new THREE.Texture();
  if (!canvas) tex.image = { width: w, height: h };
  tex.name = name;
  if (canvas && "colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(repeat[0], repeat[1]); }
  tex.anisotropy = 4;
  return tex;
}
function hd2Noise(g, res, rng, n, a, light = "255,255,255", dark = "0,0,0") {
  for (let i = 0; i < n; i++) {
    const s = 1 + Math.floor(rng() * (res / 256 + 1));
    g.fillStyle = `rgba(${rng() < 0.5 ? light : dark},${(a * (0.4 + rng() * 0.6)).toFixed(3)})`;
    g.fillRect(Math.floor(rng() * res), Math.floor(rng() * res), s, s);
  }
}
/** A vinyl-tile floor for the whole room (0.6 m tiles, two tones, grout lines, speckle), tinted from the style's floor colour. */
function hd2TileFloor(THREE, styleId, room, res) {
  const c = hd2Canvas(res, res);
  if (c) {
    const rng = hd2Rng(styleId.length * 131 + 7);
    const g = c.getContext("2d"), { w, d } = room, sx = res / w, sz = res / d;
    const base = new THREE.Color(room.style.floor), lite = base.clone().lerp(new THREE.Color(0xffffff), 0.1), dark = base.clone().multiplyScalar(0.92);
    g.fillStyle = `#${base.getHexString()}`; g.fillRect(0, 0, res, res);
    const t = 0.6;
    for (let i = 0; i * t < w; i++) for (let j = 0; j * t < d; j++) {
      g.fillStyle = `#${((i + j) % 2 ? lite : dark).getHexString()}`;
      g.fillRect(i * t * sx, j * t * sz, t * sx + 1, t * sz + 1);
    }
    hd2Noise(g, res, rng, res * res / 40, 0.1, "245,245,240", "40,40,40");
    g.strokeStyle = "rgba(40,42,44,0.3)"; g.lineWidth = Math.max(1, res / 900);
    for (let x = t; x < w; x += t) { g.beginPath(); g.moveTo(x * sx, 0); g.lineTo(x * sx, res); g.stroke(); }
    for (let z = t; z < d; z += t) { g.beginPath(); g.moveTo(0, z * sz); g.lineTo(res, z * sz); g.stroke(); }
    const sheen = g.createLinearGradient(0, 0, res, res); sheen.addColorStop(0, "rgba(255,255,255,0.07)"); sheen.addColorStop(0.5, "rgba(255,255,255,0)"); sheen.addColorStop(1, "rgba(255,255,255,0.05)");
    g.fillStyle = sheen; g.fillRect(0, 0, res, res);
  }
  return hd2Texture(THREE, c, res, res, `hd2-tile-floor-${styleId}`);
}
/** A plank floor for the whole room (ENV-HD-3's hall set: 0.18 m boards along x, staggered butt joints, a fine grain, a tone
 *  per board), tinted from the style's floor colour. */
function hd2PlankFloor(THREE, styleId, room, res) {
  const c = hd2Canvas(res, res);
  if (c) {
    const rng = hd2Rng(styleId.length * 173 + 11);
    const g = c.getContext("2d"), { w, d } = room, sx = res / w, sz = res / d;
    const base = new THREE.Color(room.style.floor), tone = new THREE.Color();
    g.fillStyle = `#${base.getHexString()}`; g.fillRect(0, 0, res, res);
    const bw = 0.18, lw = Math.max(1, res / 1000);
    for (let r = 0; r * bw < d; r++) {
      let x = -rng() * 2.4;
      while (x < w) {
        const len = 1.6 + rng() * 1.6;
        tone.copy(base).multiplyScalar(0.9 + rng() * 0.18);
        g.fillStyle = `#${tone.getHexString()}`; g.fillRect(x * sx, r * bw * sz, len * sx, bw * sz);
        g.fillStyle = "rgba(30,20,12,0.10)";
        for (let k = 0; k < 3; k++) g.fillRect(x * sx, (r * bw + bw * (0.2 + rng() * 0.6)) * sz, len * sx, lw);
        g.fillStyle = "rgba(25,16,10,0.45)"; g.fillRect((x + len) * sx - lw, r * bw * sz, lw, bw * sz);
        x += len;
      }
      g.fillStyle = "rgba(25,16,10,0.4)"; g.fillRect(0, r * bw * sz, res, lw);
    }
    hd2Noise(g, res, rng, res * res / 60, 0.06, "255,240,220", "40,26,16");
    const sheen = g.createLinearGradient(0, 0, res, res); sheen.addColorStop(0, "rgba(255,255,255,0.06)"); sheen.addColorStop(0.5, "rgba(255,255,255,0)"); sheen.addColorStop(1, "rgba(255,255,255,0.05)");
    g.fillStyle = sheen; g.fillRect(0, 0, res, res);
  }
  return hd2Texture(THREE, c, res, res, `hd2-plank-floor-${styleId}`);
}
/** A painted block wall (tileable, one tile = 2 m: 0.4 × 0.2 m blocks in running bond), cached per size; a clone per room. */
function hd2BlockWall(THREE, res, repeat) {
  const key = `block@${res}`;
  let base = HD2_TEX_CACHE.get(key);
  if (!base) {
    const c = hd2Canvas(res, res);
    if (c) {
      const rng = hd2Rng(29);
      const g = c.getContext("2d"), bw = res / 5, bh = res / 10, lw = Math.max(1, res / 400);
      g.fillStyle = "#eceeee"; g.fillRect(0, 0, res, res);
      hd2Noise(g, res, rng, res * res / 50, 0.07, "255,255,255", "90,94,98");
      g.fillStyle = "rgba(110,114,118,0.32)";
      for (let r = 0; r < 10; r++) {
        g.fillRect(0, r * bh, res, lw);
        for (let k = 0; k <= 5; k++) g.fillRect(((k + (r % 2 ? 0.5 : 0)) * bw) % res, r * bh, lw, bh);
      }
    }
    base = hd2Texture(THREE, c, res, res, "hd2-block-wall", [1, 1]);
    HD2_TEX_CACHE.set(key, base);
  }
  const t = base.clone(); t.name = base.name; t.needsUpdate = true; t.repeat.set(repeat[0], repeat[1]);
  if (!t.image) t.image = base.image;
  return t;
}

/** The skin: texture maps on the meshes that are already in the room (see the header). Budget-aware: a map is set only while
 *  the room's texture bytes (hd2RoomBytes, plus the maps set so far) stay inside HD2_TEX_BUDGET[tier]; floor, walls, metal. */
export function hd2SkinRoom({ three: THREE, group, room, tier = "high" } = {}) {
  const styleId = room?.id, spec = HD2_SKIN_STYLES[styleId];
  if (!THREE || !group || !spec) return null;
  const res = ixrTexRes(tier), maps = [], skipped = [], budget = HD2_TEX_BUDGET[tier] ?? HD2_TEX_BUDGET.high;
  let bytes = hd2RoomBytes(group, tier);
  const fits = () => bytes + hd2MapBytes(res) <= budget;
  const floor = group.getObjectByName("ix-floor"), wall = group.getObjectByName("ix-wall-0");
  if (floor?.material) {
    if (fits()) {
      floor.material.map = spec.set === "industrial" ? ixrFloorTexture(THREE, styleId, room, res, hd2FloorMarks(styleId, room))
        : spec.set === "hall" ? hd2PlankFloor(THREE, styleId, room, res) : hd2TileFloor(THREE, styleId, room, res);
      floor.material.color.set(0xffffff); floor.material.roughness = spec.set === "industrial" ? 0.55 : spec.set === "hall" ? 0.7 : 0.6; floor.material.needsUpdate = true;
      maps.push(floor.material.map.name); bytes += hd2MapBytes(res);
    } else skipped.push("floor");
  }
  if (wall?.material) { // the four walls share one material in ixBuild
    if (fits()) {
      const rep = [Math.max(room.w, room.d) / 2, room.h / 2];
      wall.material.map = spec.set === "industrial" ? ixrSetTexture(THREE, "concrete", res, rep) : hd2BlockWall(THREE, res, rep);
      wall.material.needsUpdate = true; maps.push(wall.material.map.name); bytes += hd2MapBytes(res);
    } else skipped.push("walls");
  }
  const metalTest = hd2MetalTest(spec), props = [];
  group.traverse((o) => { if (o.isMesh && metalTest.test(o.name) && o.material && !Array.isArray(o.material)) props.push(o); });
  if (props.length) {
    if (fits()) {
      const metal = ixrSetTexture(THREE, "metal", res, [1, 1]);
      for (const o of props) { o.material.map = metal; o.material.roughness = spec.metal ? 0.38 : 0.5; o.material.metalness = spec.metal ? 0.3 : 0.15; o.material.needsUpdate = true; }
      maps.push(metal.name); bytes += hd2MapBytes(res);
    } else skipped.push("metal");
  }
  room.hd2 = { style: styleId, set: spec.set, res, maps, skipped, bytes, budget };
  return room.hd2;
}

export function hd2RegisterSkins(ix) {
  if (!ix || typeof ix.ixRegisterDresser !== "function") return [];
  const styles = Object.keys(HD2_SKIN_STYLES);
  for (const st of styles) ix.ixRegisterDresser(st, (a) => hd2SkinRoom(a));
  return styles;
}
