// ENV-HD-4 — lit robot rooms and the hive's operations room (console `hd4`, docs/consoles/ENV-HD-4.md).
// SmartCiti.X Powered by AGI Corp.
//
// 1. Interior lighting in ROBO-INTERIORS' six robot rooms (one more dresser per style, desktop high tier only — not balanced,
//    not the phone, not a headset browser): LED ceiling light panels between the shell's lamp rows, a pendant task light over
//    every station pad with a soft pool of light on the floor, three wall-mounted amber warning beacons (two on the back wall
//    over the robot area, one by the door), and one real light — a task spotlight over the room's robot — which with the
//    shell's hemisphere and point light makes 3, IX_BUDGET's desktop limit. Everything else is emissive (no texture).
//    Nothing moves: the beacons glow steadily, so reduced motion needs no special case.
// 2. The hive's operations room (`hd4-hive-ops`, an INTERIORS style), GENERIC BY KIND: a control room where the Omega Hive's
//    seven software agents' consoles stand in an arc facing a video wall (two panels either side of the shell's honesty sign).
//    Each console has a desk, a monitor whose screen is a cell of one shared canvas, a chair, a strip in the agent's accent
//    colour and an agent spot behind it (room.spots.agent, one per role) where the hive's figures can stand. The screens show
//    procedural placeholder content (no words): they are the seam for the hive console's content (HIVE-4's "Omega Hive" tab),
//    see hd4OpsScreens below. The room has its own door beside the dispatcher's home robot site.
//
// SEAMS (every top-level name is hd4/HD4_-prefixed: the bundler shares one scope; three.js comes from the caller):
//   HD4_OPS_STYLE                      "hd4-hive-ops"
//   HD4_ROOM_LIGHT_BUDGET              what the lighting adds per room per tier (meshes, real lights, triangles, texture bytes)
//   HD4_ROOM_TARGETS                   plain data: style -> [x, z] the task spotlight aims at (the room's robot)
//   HD4_OPS_ROLES / HD4_OPS_BUDGET     the seven role keys in console order; the ops room's stated budget per tier
//   hd4LightRoom({ three, group, room, tier, ua }) -> { panels, pendants, beacons, lights } | null (null where it builds nothing)
//   hd4OpsLayout(agents?)              -> [{ key, agentId, accent, x, z, yaw, spot: { x, z, yaw } }] (pure, room metres)
//   hd4DressOps({ three, group, room, site, tier, agents }) -> room.hd4Ops = { consoles, screens, spots }
//   hd4OpsScreens(room)                -> { canvas, texture, cells: [{ key, agentId, role, x, y, w, h }], wall: { canvas, texture,
//                                          w, h }, paint(key, painter), repaint() } | null — `paint(agentId | "wall",
//                                          (ctx, w, h, cell) => …)` draws into that screen and re-uploads it. A page that wants its
//                                          own content on every screen may set `globalThis.hd4OpsPainter = (agent, ctx, w, h, kind)`
//                                          before the room is entered (kind "console" or "wall"; agent null for the wall).
//   hd4OpsSite(rbSite, parish)         -> the site object ixWorld.enter takes for the ops room (stations and returns of the
//                                          dispatcher's home robot site)
//   hd4OpsDoor({ doors, homeSite, blocked, colliders }) -> { x, z, face } beside that site's room door, or null
//   hd4RegisterDressers(ix, { ultra, ua }) -> the styles registered (the six robot rooms: lighting, + Ultra when on; the ops room)

import { IXR_ROOMS, ixrSiteFor } from "./ixr-robo-interiors.js";
import { RB_SITES } from "./rb-robotics-data.js";
import { OH_AGENTS } from "./oh-hive-data.js";
import { hd4Headset, hd4UltraRoom } from "./hd4-ultra.js";

/** The dispatcher's home robot site (an RB_SITES entry): the ops room's door stands beside its room door and the room shows
 *  its stations. */
export function hd4OpsHome(agents = OH_AGENTS) {
  const id = (agents ?? []).find((a) => a.key === "dispatcher")?.homeSite;
  return RB_SITES.find((s) => s.id === id) ?? RB_SITES[0] ?? null;
}

export const HD4_OPS_STYLE = "hd4-hive-ops";
export const HD4_ROOM_LIGHT_BUDGET = { meshesAdded: { low: 0, balanced: 0, high: 4 }, lightsAdded: { low: 0, balanced: 0, high: 1 }, trianglesAdded: { low: 0, balanced: 0, high: 900 }, textureBytes: 0 };
export const HD4_ROOM_TARGETS = { "ixr-cell-hall": [0, -4], "ixr-cobot-lab": [0, -2.2], "ixr-amr-warehouse": [-3.5, -3], "ixr-port-control": [0, -3.3], "ixr-drilling-deck": [0, -3.5], "ixr-maint-bay": [3.6, -3.2], "hd4-hive-ops": [0, -2.4] };
export const HD4_OPS_ROLES = ["dispatcher", "safety-steward", "maintenance-planner", "consent-keeper", "trainer", "auditor", "logistics"];
const hd4OpsMiB = 1024 * 1024;
export const HD4_OPS_BUDGET = {
  meshes: { low: 40, balanced: 40, high: 40 }, triangles: { low: 3000, balanced: 6000, high: 6000 }, lights: { low: 1, balanced: 2, high: 3 },
  textureBytes: { low: 3 * hd4OpsMiB, balanced: 3 * hd4OpsMiB, high: 24 * hd4OpsMiB },
  screenPx: { low: 256, balanced: 256, high: 1024 }, wallPx: { low: [256, 64], balanced: [256, 64], high: [1024, 256] },
};

const hd4Lit = (tier, ua) => tier === "high" && !hd4Headset(ua);
/** A soft pool of light: a unit disc fan, bright at the centre and black at the rim (drawn additively). */
function hd4PoolGeometry(THREE, warm = [0.34, 0.3, 0.22], n = 20) {
  const pos = [], col = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    pos.push(0, 0, 0, Math.cos(a1), 0, Math.sin(a1), Math.cos(a0), 0, Math.sin(a0));
    col.push(...warm, 0, 0, 0, 0, 0, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  return g;
}

/** Light one room (the six robot rooms and the ops room): panels, pendants with pools, beacons, one task spotlight. */
export function hd4LightRoom({ three: THREE, group, room, tier = "high", ua = typeof navigator !== "undefined" ? navigator.userAgent : "" }) {
  if (!THREE || !room || !group || !hd4Lit(tier, ua)) return null;
  const { w, d, h } = room, style = room.style ?? {};
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), col = new THREE.Color();
  const lamp = style.lamp ?? 0xf2f6fa;
  // LED panels between the shell's lamp columns (the shell keeps its own strip lamps).
  const rows = Math.max(2, Math.round(d / 5)), cols = Math.max(2, Math.round(w / 6)), panels = [];
  for (let r = 0; r < rows; r++) for (let c = 1; c < cols; c++) panels.push([-w / 2 + (w / cols) * c, -d / 2 + (d / rows) * (r + 0.5)]);
  const pm = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), new THREE.MeshBasicMaterial({ color: lamp, toneMapped: false }), panels.length);
  pm.name = "hd4-light-panels";
  panels.forEach(([x, z], i) => { m4.makeTranslation(x, h - 0.03, z); pm.setMatrixAt(i, m4); });
  group.add(pm);
  // Pendant task lights over the station pads (and, in the ops room, over each console), each with a pool on the floor.
  const spots = room.actions.filter((a) => a.kind === "station").map((a) => [a.x, a.z]);
  for (const c of room.hd4Ops?.consoles ?? []) spots.push([c.x * 0.86, c.z * 0.86 + (-2.4) * 0.14]);
  const yLamp = Math.min(2.75, h - 0.6), rod = Math.max(0.1, h - yLamp);
  // Wall beacons (robot rooms only): two on the back wall over the robot area, one beside the door.
  const beacons = IXR_ROOMS[room.id] ? [[-w / 4, Math.min(h * 0.62, h - 0.6), -d / 2 + 0.14, 0], [w / 4, Math.min(h * 0.62, h - 0.6), -d / 2 + 0.14, 0], [1.6, Math.min(2.75, h - 0.5), d / 2 - 0.14, Math.PI]] : [];
  const body = [], glow = [];
  for (const [x, z] of spots) {
    body.push([0.03, rod, 0.03, x, yLamp + rod / 2, z, 0x6d737a], [0.6, 0.14, 0.34, x, yLamp, z, 0x3b4046]);
    glow.push([0.52, 0.03, 0.28, x, yLamp - 0.085, z, 0xfff1d6]);
  }
  for (const [x, y, z] of beacons) { body.push([0.22, 0.14, 0.16, x, y - 0.1, z, 0x2a2e33]); glow.push([0.17, 0.16, 0.17, x, y + 0.04, z, 0xff9a1f]); }
  const addBoxes = (list, mat, name) => {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, list.length); im.name = name;
    list.forEach(([bw, bh, bd, x, y, z, c], i) => { m4.compose(v.set(x, y, z), q.identity(), s.set(bw, bh, bd)); im.setMatrixAt(i, m4); im.setColorAt(i, col.setHex(c)); });
    group.add(im); return im;
  };
  const bm = addBoxes(body, new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.3 }), "hd4-task-fittings");
  const gm = addBoxes(glow, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), "hd4-task-lamps");
  const pools = new THREE.InstancedMesh(hd4PoolGeometry(THREE), new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), spots.length);
  pools.name = "hd4-light-pools"; pools.renderOrder = 2;
  spots.forEach(([x, z], i) => { m4.compose(v.set(x, 0.075, z), q.identity(), s.set(1.25, 1, 1.25)); pools.setMatrixAt(i, m4); });
  group.add(pools);
  // The one real light: a task spotlight over the room's robot (3 lights in all on the desktop high tier).
  const [tx, tz] = HD4_ROOM_TARGETS[room.id] ?? [0, 0];
  const spot = new THREE.SpotLight(0xfff2dc, 28, h * 3.2, 0.72, 0.65, 1.3);
  spot.name = "hd4-task-spot"; spot.position.set(tx, h - 0.25, tz + 0.4); spot.target.position.set(tx, 0, tz);
  group.add(spot); group.add(spot.target);
  const triangles = 12 * (pm.count + bm.count + gm.count) + 20 * pools.count;
  room.hd4Lights = { panels: panels.length, pendants: spots.length, beacons: beacons.length, lights: 1, meshes: 4, triangles };
  return room.hd4Lights;
}

// ------------------------------------------------------------------------------------------------------- the ops room

/** The consoles in an arc (radius 5.6 m round a point 0.6 m off the back wall's middle), facing the video wall; each agent
 *  spot stands 1.8 m behind its console, facing the same way (yaw as the learner's: 0 faces the back wall). */
export function hd4OpsLayout(agents = OH_AGENTS) {
  const byKey = new Map((agents ?? []).map((a) => [a.key, a]));
  const cz = -14 / 2 + 0.6, R = 5.6;
  return HD4_OPS_ROLES.map((key, i) => {
    const th = ((i - 3) * 18 * Math.PI) / 180, a = byKey.get(key) ?? null;
    const at = (r) => [Math.sin(th) * r, cz + Math.cos(th) * r];
    const [x, z] = at(R), [sx, sz] = at(R + 1.8);
    return { key, agentId: a?.id ?? `oh-${key}`, name: a?.name ?? key, accent: a?.avatar?.accent ?? 0x7b6cf0, x, z, yaw: th, spot: { x: sx, z: sz, yaw: th } };
  });
}

function hd4Canvas(w, h) {
  if (typeof document === "undefined" || !document.createElement) return null;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  return c.getContext("2d") ? c : null;
}
const hd4Hex = (n) => `#${(n >>> 0).toString(16).padStart(6, "0").slice(-6)}`;
/** The placeholder console screen (no words): the agent's colour band, a ring glyph, queue bars and a trace. */
function hd4PaintConsole(g, w, h, c, i) {
  g.fillStyle = "#0d1724"; g.fillRect(0, 0, w, h);
  g.fillStyle = hd4Hex(c.accent); g.fillRect(0, 0, w, Math.max(2, h * 0.12));
  const r = h * 0.2; g.strokeStyle = hd4Hex(c.accent); g.lineWidth = Math.max(1, h * 0.035);
  g.beginPath(); g.arc(w * 0.14, h * 0.45, r, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#e8eef4"; g.beginPath(); g.arc(w * 0.14, h * 0.45, r * 0.35, 0, Math.PI * 2); g.fill();
  for (let k = 0; k < 5; k++) { const len = 0.25 + (((i * 7 + k * 3) % 10) / 10) * 0.45; g.fillStyle = k === 0 ? "#37d6c0" : "#3a4b5e"; g.fillRect(w * 0.3, h * (0.24 + k * 0.12), w * len * 0.62, h * 0.07); }
  g.strokeStyle = "#8fd3ff"; g.lineWidth = Math.max(1, h * 0.02); g.beginPath();
  for (let k = 0; k <= 24; k++) { const x = w * (0.06 + (k / 24) * 0.88), y = h * (0.9 - 0.08 * (1 + Math.sin(k * 0.7 + i))); if (k) g.lineTo(x, y); else g.moveTo(x, y); }
  g.stroke();
}
/** The placeholder video wall (no words): left, the seven agents round the governor; right, the six robot sites' tiles. */
function hd4PaintWall(g, w, h, layout) {
  g.fillStyle = "#0b1420"; g.fillRect(0, 0, w, h);
  const half = w / 2, cx = half * 0.5, cy = h * 0.5, R = Math.min(half * 0.36, h * 0.38);
  g.strokeStyle = "#2c3e52"; g.lineWidth = Math.max(1, h * 0.012);
  layout.forEach((c, i) => { const a = (i / layout.length) * Math.PI * 2 - Math.PI / 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke(); });
  layout.forEach((c, i) => { const a = (i / layout.length) * Math.PI * 2 - Math.PI / 2; g.fillStyle = hd4Hex(c.accent); g.beginPath(); g.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, h * 0.07, 0, Math.PI * 2); g.fill(); });
  g.fillStyle = "#e8eef4"; g.beginPath();
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; const x = cx + Math.cos(a) * h * 0.1, y = cy + Math.sin(a) * h * 0.1; if (k) g.lineTo(x, y); else g.moveTo(x, y); }
  g.closePath(); g.fill();
  for (let k = 0; k < 6; k++) {
    const x = half + half * (0.08 + (k % 3) * 0.3), y = h * (0.14 + Math.floor(k / 3) * 0.42), tw = half * 0.26, th = h * 0.34;
    g.fillStyle = "#16263a"; g.fillRect(x, y, tw, th);
    g.fillStyle = "#37d6c0"; g.beginPath(); g.arc(x + tw * 0.15, y + th * 0.2, Math.max(2, h * 0.03), 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3a4b5e"; for (let b = 0; b < 3; b++) g.fillRect(x + tw * 0.1, y + th * (0.45 + b * 0.16), tw * (0.8 - b * 0.2), th * 0.08);
  }
}

/** Furnish the ops room: consoles in an arc, their screens (one shared canvas), the video wall, chairs, accent strips, spots. */
export function hd4DressOps({ three: THREE, group, room, site = null, tier = "high", agents = OH_AGENTS }) {
  if (!THREE || !room || room.id !== HD4_OPS_STYLE) return null;
  const low = tier === "low", layout = hd4OpsLayout(agents);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
  const inst = (geo, mat, list, name, colours = null) => {
    const im = new THREE.InstancedMesh(geo, mat, list.length); im.name = name;
    list.forEach(([x, y, z, ry, sx, sy, sz], i) => { q.setFromAxisAngle(up, ry); m4.compose(v.set(x, y, z), q, s.set(sx, sy, sz)); im.setMatrixAt(i, m4); if (colours) im.setColorAt(i, col.setHex(colours[i])); });
    group.add(im); return im;
  };
  // Console parts in each console's frame: local +z points away from the video wall (toward the operator's chair).
  const P = (c, lx, ly, lz) => { const sn = Math.sin(c.yaw), cs = Math.cos(c.yaw); return [c.x + lx * cs + lz * sn, ly, c.z - lx * sn + lz * cs]; };
  const desks = [], housings = [], strips = [], chairs = [];
  for (const c of layout) {
    desks.push([...P(c, 0, 0.375, 0), c.yaw, 1.7, 0.75, 0.8]);
    housings.push([...P(c, 0, 1.12, -0.28), c.yaw, 1.3, 0.62, 0.05]);
    strips.push([...P(c, 0, 0.73, 0.41), c.yaw, 1.7, 0.04, 0.03]);
    chairs.push([...P(c, 0, 0.45, 0.9), c.yaw, 0.52, 0.9, 0.5]);
    for (const [lz, bw, bd] of [[0, 1.7, 0.8], [0.9, 0.52, 0.5]]) {
      const [x, , z] = P(c, 0, 0, lz), ex = Math.abs(Math.cos(c.yaw)) * bw / 2 + Math.abs(Math.sin(c.yaw)) * bd / 2, ez = Math.abs(Math.sin(c.yaw)) * bw / 2 + Math.abs(Math.cos(c.yaw)) * bd / 2;
      room.colliders.push({ min: [x - ex, 0, z - ez], max: [x + ex, lz ? 0.9 : 0.75, z + ez], kind: "hd4-console", prop: lz ? "chair" : "console desk" });
    }
  }
  const box = () => new THREE.BoxGeometry(1, 1, 1);
  inst(box(), new THREE.MeshStandardMaterial({ color: 0x3d4650, roughness: 0.7, metalness: 0.15 }), desks, "hd4-ops-desks");
  inst(box(), new THREE.MeshStandardMaterial({ color: 0x1c2229, roughness: 0.5, metalness: 0.3 }), housings, "hd4-ops-monitors");
  inst(box(), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), strips, "hd4-ops-accents", layout.map((c) => c.accent));
  if (!low) inst(box(), new THREE.MeshStandardMaterial({ color: 0x2f3a46, roughness: 0.8 }), chairs, "hd4-ops-chairs");
  // The screens: one canvas, a 2 × 4 grid of 2:1 cells (7 used), mapped onto each monitor's face.
  const sp = HD4_OPS_BUDGET.screenPx[tier] ?? HD4_OPS_BUDGET.screenPx.high, cw = sp / 2, ch = sp / 4;
  const canvas = hd4Canvas(sp, sp), cells = layout.map((c, i) => ({ key: c.agentId, agentId: c.agentId, role: c.key, x: (i % 2) * cw, y: Math.floor(i / 2) * ch, w: cw, h: ch }));
  const tex = (cv, w, h, name) => {
    const t = cv ? new THREE.CanvasTexture(cv) : new THREE.Texture();
    if (!cv) t.image = { width: w, height: h };
    t.name = name; if (cv && "colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return t;
  };
  const screenTex = tex(canvas, sp, sp, "hd4-ops-screens");
  const pos = [], uv = [];
  layout.forEach((c, i) => {
    const cell = cells[i], u0 = cell.x / sp, u1 = (cell.x + cell.w) / sp, v1 = 1 - cell.y / sp, v0 = 1 - (cell.y + cell.h) / sp;
    const corner = (lx, ly) => P(c, lx, ly, -0.25);
    const a = corner(-0.61, 0.85), b = corner(0.61, 0.85), cc = corner(0.61, 1.39), dd = corner(-0.61, 1.39);
    pos.push(...a, ...b, ...cc, ...a, ...cc, ...dd); uv.push(u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1);
  });
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  const screens = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false })); screens.name = "hd4-ops-screens"; group.add(screens);
  // The video wall: two panels either side of the shell's honesty sign, one canvas (left half, right half).
  const [ww, wh] = HD4_OPS_BUDGET.wallPx[tier] ?? HD4_OPS_BUDGET.wallPx.high;
  const wallCanvas = hd4Canvas(ww, wh), wallTex = tex(wallCanvas, ww, wh, "hd4-ops-wall");
  const wz = -room.d / 2 + 0.38, wpos = [], wuv = [];
  for (const [x0, x1, u0, u1] of [[-7.67, -2.27, 0, 0.5], [2.27, 7.67, 0.5, 1]]) { wpos.push(x0, 1.1, wz, x1, 1.1, wz, x1, 3.3, wz, x0, 1.1, wz, x1, 3.3, wz, x0, 3.3, wz); wuv.push(u0, 0, u1, 0, u1, 1, u0, 0, u1, 1, u0, 1); }
  const wg = new THREE.BufferGeometry(); wg.setAttribute("position", new THREE.Float32BufferAttribute(wpos, 3)); wg.setAttribute("uv", new THREE.Float32BufferAttribute(wuv, 2));
  const wall = new THREE.Mesh(wg, new THREE.MeshBasicMaterial({ map: wallTex, toneMapped: false })); wall.name = "hd4-ops-wall"; group.add(wall);
  // The agent spots (behind each console, one per role), marked like ROBO-INTERIORS' rings.
  room.spots = { ...(room.spots ?? {}), agent: layout.map((c) => ({ id: `hd4-ops-${c.key}`, name: `at the ${c.key.replace(/-/g, " ")} console`, role: c.key, x: c.spot.x, z: c.spot.z, yaw: c.spot.yaw })) };
  const rings = new THREE.InstancedMesh(new THREE.RingGeometry(0.42, 0.52, low ? 16 : 28), new THREE.MeshBasicMaterial({ color: 0x37d6c0, side: THREE.DoubleSide }), layout.length);
  rings.name = "hd4-ops-agent-spots";
  layout.forEach((c, i) => { m4.compose(v.set(c.spot.x, 0.012, c.spot.z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), s.set(1, 1, 1)); rings.setMatrixAt(i, m4); });
  group.add(rings);
  const api = {
    canvas, texture: screenTex, cells, wall: { canvas: wallCanvas, texture: wallTex, w: ww, h: wh },
    /** Draw into one screen (an agent id) or the wall ("wall") and re-upload it. painter(ctx, w, h, cell). */
    paint(key, painter) {
      if (key === "wall") { const g = wallCanvas?.getContext("2d"); if (!g) return false; painter(g, ww, wh, null); wallTex.needsUpdate = true; return true; }
      const cell = cells.find((c) => c.key === key || c.role === key); const g = canvas?.getContext("2d");
      if (!cell || !g) return false;
      g.save(); g.translate(cell.x, cell.y); g.beginPath(); g.rect(0, 0, cell.w, cell.h); g.clip(); painter(g, cell.w, cell.h, cell); g.restore();
      screenTex.needsUpdate = true; return true;
    },
    repaint() {
      const custom = typeof globalThis.hd4OpsPainter === "function" ? globalThis.hd4OpsPainter : null;
      layout.forEach((c, i) => api.paint(c.agentId, (g, w, h) => { if (custom) custom(agents?.find?.((a) => a.id === c.agentId) ?? null, g, w, h, "console"); else hd4PaintConsole(g, w, h, c, i); }));
      api.paint("wall", (g, w, h) => { if (custom) custom(null, g, w, h, "wall"); else hd4PaintWall(g, w, h, layout); });
    },
  };
  api.repaint();
  room.hd4Ops = { style: HD4_OPS_STYLE, site: site?.id ?? null, consoles: layout.map((c) => ({ key: c.key, agentId: c.agentId, x: c.x, z: c.z, yaw: c.yaw })), screens: api, spots: room.spots.agent.length };
  return room.hd4Ops;
}
export function hd4OpsScreens(room) { return room?.hd4Ops?.screens ?? null; }

/** The ops room's site object: the dispatcher's home robot site's stations and returns, under the room's own id and name. */
export function hd4OpsSite(rb, parish = null) {
  const base = ixrSiteFor(rb, parish);
  if (!base) return null;
  return { ...base, id: HD4_OPS_STYLE, name: "Hive operations room", kind: "hive-ops", style: HD4_OPS_STYLE, homeSite: rb.id };
}
/** A door spot for the ops room 3 m along the wall from the home site's robot-room door (either side), clear of `blocked`,
 *  of the lots' collider boxes and of every other door by 2.5 m. */
export function hd4OpsDoor({ doors = [], homeSite = null, blocked = null, colliders = [] } = {}) {
  const d = doors.find((x) => x?.site?.id === homeSite);
  if (!d) return null;
  const along = d.face === "n" || d.face === "s" ? [1, 0] : [0, 1];
  for (const k of [3, -3, 4.5, -4.5]) {
    const x = d.x + along[0] * k, z = d.z + along[1] * k;
    if (blocked?.(x, z)) continue;
    if (colliders.some((c) => x > c.min[0] - 0.4 && x < c.max[0] + 0.4 && z > c.min[2] - 0.4 && z < c.max[2] + 0.4)) continue;
    if (doors.some((o) => Math.hypot(o.x - x, o.z - z) < 2.5)) continue;
    return { x, z, face: d.face };
  }
  return null;
}

/** Register the dressers: the six robot rooms take the lighting (and Ultra's hero textures and detail when on); the ops room
 *  its consoles, then the same lighting. Register after ROBO-INTERIORS' dressers (the lighting reads the station pads). */
export function hd4RegisterDressers(ix, { ultra = false, ua = typeof navigator !== "undefined" ? navigator.userAgent : "" } = {}) {
  if (!ix || typeof ix.ixRegisterDresser !== "function") return [];
  const out = [];
  for (const st of Object.keys(IXR_ROOMS)) {
    ix.ixRegisterDresser(st, (a) => { hd4LightRoom({ ...a, ua }); if (ultra && a.tier === "high" && !hd4Headset(ua)) hd4UltraRoom(a); });
    out.push(st);
  }
  ix.ixRegisterDresser(HD4_OPS_STYLE, (a) => { hd4DressOps(a); hd4LightRoom({ ...a, ua }); });
  out.push(HD4_OPS_STYLE);
  return out;
}
