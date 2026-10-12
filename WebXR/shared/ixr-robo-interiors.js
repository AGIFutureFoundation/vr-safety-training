// ROBO-INTERIORS — walk into every robot site (console `ixr`, docs/consoles/ROBO-INTERIORS.md).
// SmartCiti.X Powered by AGI Corp.
//
// Six robotics rooms on INTERIORS' shell (ix-interiors.js styles ixr-cell-hall, ixr-cobot-lab, ixr-amr-warehouse,
// ixr-port-control, ixr-drilling-deck, ixr-maint-bay), one for each ROBOTICS site (rb-robotics-data.js RB_SITES). The rooms are
// GENERIC BY KIND: the shell's back-wall sign says "a generic room for this kind of site — not a model of the real building";
// nothing here models a real building, robot maker or product, and every texture is drawn on a canvas from code (no downloaded
// image, no logo, no company, union or trade-body name). Robots are simulated and nothing in a room moves.
//
// SEAMS (every top-level name is ixr/IXR_-prefixed: the bundler shares one scope; three.js comes from the caller):
//   IXR_SITE_STYLE                  plain data: RB_SITES id -> style id (six of six)
//   IXR_ROOMS                       plain data per style: { what, stations: [catalog ids], props: [names],
//                                     spots: { agent: [{ id, name, role, x, z, yaw }] }, camera: { x, z, yaw, pitch }, floor: [marks] }
//                                     (room-local metres as INTERIORS: x across, z from the back wall −d/2 to the door wall +d/2;
//                                     yaw as the learner's: 0 faces the back wall, +π/2 faces −x)
//   IXR_TEX_BUDGET                  GPU texture bytes per room per tier (w × h × 4, × 4/3 with a mip chain), every texture in
//                                     the room counted (this set, the port room's window and status canvases, the shell's two signs)
//   ixrTexRes(tier, ua?)            -> 1024 on the desktop high tier; 256 on the phone ("low"), "balanced" and a headset browser
//   ixrSiteFor(rbSite, parish?)     -> the site object ixMountInteriors.enter takes: { id, name, kind: "robotics", style,
//                                     stations, anchor, linkSite, board } (board/linkSite: the anchor's job board and station return)
//   ixrDoorsFor(parish, { sites, blocked, doorAt })  -> [{ site, x, z, face, style, title }]: one door spot beside each robot
//                                     site's pad on this map, off the pad, out of the warning ring and clear of `blocked(x, z)`;
//                                     ROBO-EXTERIORS' building door wins when `doorAt(siteId)` returns { x, z, face }
//   ixrDress({ three, group, room, site, tier })  furnish one room: the texture set on the floor and walls, the props (≤ 7 meshes,
//                                     instanced by material), tall props as colliders, room.spots.agent (the hive's avatars stand
//                                     there: AGENT-AVATARS reads room.spots.agent[i].x/z/yaw), the spot rings
//   ixrRegisterDressers(ix)         -> the six style ids registered (ix = { ixRegisterDresser }; null registers none)
//   ixrAgentSpot(room, agent)       -> the spot for a hive agent ({ id: "oh-<role>" } or { role }): its role's spot, else the first
//   ixrMeasure(room)                -> { meshes, triangles, textureBytes, textures: [{ name, w, h, bytes }], props, instances }
//   ixrPlan(room, from, to)         -> [{ x, z }]: an A* path on a 0.2 m grid, cells clear of tall colliders by 0.42 m, or null
//   ixrWalkAll(room, step = ixWalk) -> { reached, total, results }: from the door (where enter() stands the learner) to every
//                                     station pad (ixNear must name it) and agent spot, NEWTON's avatar step along the path
//   ixrSceneSite(styleId, parish?, sites?)  -> the site a camera preset enters: this map's robot site of that style, else its
//                                     RB_SITES entry (so a capture can open all six rooms from one page)

import { RB_SITES } from "./rb-robotics-data.js";
import { ixWalk, ixNear } from "./ix-interiors.js";

/** RB_SITES id -> room style. The second warehouse (Orleans) is the maintenance bay; the first (West Oakland) the AMR floor. */
export const IXR_SITE_STYLE = {
  "rb-site-soma-robot-cell": "ixr-cell-hall",
  "rb-site-san-jose-robotics-lab": "ixr-cobot-lab",
  "rb-site-west-oakland-warehouse": "ixr-amr-warehouse",
  "rb-site-west-oakland-port-automation": "ixr-port-control",
  "rb-site-richland-drilling-robot": "ixr-drilling-deck",
  "rb-site-orleans-warehouse": "ixr-maint-bay",
};

const IXR_Y = "#f2c14b", IXR_K = "#1f2328", IXR_W = "#eef2f4", IXR_R = "#d8452a", IXR_G = "#3f8f5a", IXR_B = "#3a8fd8";

/**
 * The rooms as plain data. Floor marks (painted into the epoxy floor texture, room metres, rects by centre):
 * ["line", x1, z1, x2, z2, width, colour] · ["dash", x1, z1, x2, z2, width, colour, dash] · ["hatch", cx, cz, w, d] (yellow/black)
 * · ["band", cx, cz, w, d, width] (a hatched outline) · ["ring", cx, cz, r, width, colour] · ["zebra", cx, cz, w, d, colour, bar]
 * · ["box", cx, cz, w, d, width, colour] · ["cross", x, z, size, width, colour].
 */
export const IXR_ROOMS = {
  "ixr-cell-hall": {
    what: "a robot cell hall: a fenced industrial robot cell with light curtains, e-stop posts, floor striping and a teach-pendant cart",
    stations: ["ad-robot-cell-lockout-and-safe-reentry", "rt-teach-pendant-safe-jogging", "rt-robot-estop-recovery-and-restart", "robot-cell"],
    props: ["perimeter guard fence", "fence posts", "light-curtain posts", "e-stop posts", "floor striping", "teach-pendant cart", "cell robot", "fixture table", "transfer table", "controller cabinet", "wall rack", "pallet"],
    spots: { agent: [
      { id: "ixr-cell-gate", name: "by the cell gate", role: "trainer", x: 3.4, z: 0.9, yaw: 0 },
      { id: "ixr-cell-pendant", name: "beside the pendant cart", role: "safety-steward", x: 6.6, z: -0.8, yaw: Math.PI / 2 },
    ] },
    camera: { x: -6.5, z: 6.0, yaw: -0.576, pitch: -0.12 },
    floor: [["band", 0, -4, 9.2, 7.2, 0.45], ["line", -1.2, 4.6, -1.2, 0.2, 0.1, IXR_Y], ["line", 3.2, 4.6, 3.2, 0.2, 0.1, IXR_Y],
      ["box", 0, 0, 18, 16, 0.1, IXR_Y], ["hatch", 1, -0.2, 2, 0.5], ["box", 6.2, -3, 1.6, 1.4, 0.06, IXR_W], ["cross", -5, -2, 0.6, 0.06, IXR_W]],
  },
  "ixr-cobot-lab": {
    what: "a cobot lab: benches, painted safety-zone rings round each collaborative arm, an area scanner and e-stops",
    stations: ["ad-cobot-risk-assessment-and-speed-separation", "rt-cobot-power-force-limit-check", "rt-speed-separation-monitoring-setup", "rp-teleop-demonstration-collection"],
    props: ["cobot bench", "cobot arm", "second cobot cell", "area scanner", "bench e-stop", "wall benches", "monitors", "back bench", "printer", "storage cabinet", "tool cart", "painted safety-zone rings"],
    spots: { agent: [
      { id: "ixr-lab-rings", name: "outside the warning ring", role: "trainer", x: 2.9, z: 0.4, yaw: 0.88 },
      { id: "ixr-lab-visitor", name: "by the second cobot", role: "consent-keeper", x: -2.6, z: -0.4, yaw: 0.59 },
    ] },
    camera: { x: -5.5, z: 5.0, yaw: -0.633, pitch: -0.18 },
    floor: [["ring", 0, -2.2, 1.6, 0.12, IXR_R], ["ring", 0, -2.2, 2.6, 0.12, IXR_Y], ["ring", -5, -4.2, 1.2, 0.1, IXR_R], ["ring", -5, -4.2, 2.0, 0.1, IXR_Y],
      ["box", 0, 0, 14, 12, 0.08, IXR_B], ["line", 0, 5.5, 0, 1.2, 0.08, IXR_W]],
  },
  "ixr-amr-warehouse": {
    what: "an AMR warehouse: four racking rows, travel lanes, a marked pedestrian walkway crossing, chargers and the mobile robots",
    stations: ["ad-amr-fleet-traffic-and-estop-drill", "vb-supervising-agent-dispatched-robots", "rp-robot-policy-evaluation-review", "forklift-dock"],
    props: ["racking frames", "racking beams", "racked loads", "AMR", "docked AMR", "chargers", "charger lights", "walkway bollards", "e-stop posts", "walkway crossing", "travel lanes"],
    spots: { agent: [
      { id: "ixr-amr-crossing", name: "at the walkway crossing", role: "dispatcher", x: 5.0, z: 4.4, yaw: -0.3 },
      { id: "ixr-amr-chargers", name: "by the chargers", role: "logistics", x: -9.3, z: 4.6, yaw: Math.PI / 2 },
    ] },
    camera: { x: -4.5, z: 8.0, yaw: -0.464, pitch: -0.1 },
    floor: [["band", 0, 2.0, 24, 2.2, 0.12], ["zebra", 0, 2.0, 23.6, 1.9, IXR_W, 0.45], ["dash", -3.5, 0.6, -3.5, -9.6, 0.1, IXR_W, 0.8], ["dash", 3.5, 0.6, 3.5, -9.6, 0.1, IXR_W, 0.8],
      ["box", -11.2, 3.5, 1.6, 1.2, 0.06, IXR_G], ["box", -11.2, 5.5, 1.6, 1.2, 0.06, IXR_G], ["line", -12, 0.8, 12, 0.8, 0.08, IXR_Y], ["line", -12, 3.2, 12, 3.2, 0.08, IXR_Y]],
  },
  "ixr-port-control": {
    what: "a port control room: console desks facing a window wall onto a procedural container yard, and a plain status wall",
    stations: ["ad-amr-fleet-traffic-and-estop-drill", "vb-supervising-agent-dispatched-robots", "crane-yard", "dock-crane"],
    props: ["console desks", "monitors", "screens", "chairs", "window wall", "mullions", "status wall", "supervisor desk", "comms rack", "rack beacon"],
    spots: { agent: [
      { id: "ixr-port-desks", name: "behind the centre desk", role: "dispatcher", x: 1.6, z: -1.4, yaw: 0 },
      { id: "ixr-port-status", name: "at the status wall", role: "safety-steward", x: 6.0, z: -0.4, yaw: -Math.PI / 2 },
    ] },
    camera: { x: -6.5, z: 4.4, yaw: -0.673, pitch: -0.05 },
    floor: [["box", 0, 0, 14, 10, 0.06, IXR_W], ["line", -0.3, 5.2, -0.3, -1.6, 0.06, IXR_W]],
  },
  "ixr-drilling-deck": {
    what: "a ceiling-drilling deck: shoring, a barricade round the robot's reach, a dust extractor, the anchor layout on the soffit and the drilling robot",
    stations: ["rp-construction-drilling-robot-setup", "sil-concrete-drilling-and-silica-dust-cues", "rt-robot-estop-recovery-and-restart"],
    props: ["barricade", "barricade feet", "shoring posts", "shoring beams", "dust extractor", "extractor hose", "ceiling grid", "layout marks", "drilling robot", "robot battery", "control tablet stand", "deck scanner"],
    spots: { agent: [
      { id: "ixr-deck-entry", name: "at the barricade entry", role: "safety-steward", x: 2.8, z: 1.4, yaw: 0 },
      { id: "ixr-deck-side", name: "by the shoring", role: "auditor", x: -5.6, z: 1.0, yaw: -0.894 },
    ] },
    camera: { x: -5.0, z: 6.0, yaw: -0.524, pitch: 0.06 },
    floor: [["band", 0, -3.5, 8.6, 6.6, 0.3], ["line", 0.2, 3.6, 0.2, 0.4, 0.1, IXR_Y], ["line", 1.8, 3.6, 1.8, 0.4, 0.1, IXR_Y],
      ["cross", -2.5, -5.2, 0.5, 0.06, IXR_R], ["cross", 2.5, -5.2, 0.5, 0.06, IXR_R], ["cross", -2.5, -1.8, 0.5, 0.06, IXR_R], ["cross", 2.5, -1.8, 0.5, 0.06, IXR_R]],
  },
  "ixr-maint-bay": {
    what: "a robot maintenance bay: a lockout board, parts racks, a robot arm on a maintenance stand and a mobile robot on a lift table",
    stations: ["rt-robot-estop-recovery-and-restart", "ad-robot-cell-lockout-and-safe-reentry", "ad-amr-fleet-traffic-and-estop-drill", "rt-teach-pendant-safe-jogging"],
    props: ["lockout board", "padlocks", "lock tags", "parts racks", "parts bins", "maintenance stand", "robot arm on the stand", "stand lockout tag", "lift table", "AMR on the lift", "workbench", "parts cart"],
    spots: { agent: [
      { id: "ixr-bay-board", name: "at the lockout board", role: "maintenance-planner", x: -6.4, z: -0.6, yaw: Math.PI / 2 },
      { id: "ixr-bay-stand", name: "by the maintenance stand", role: "auditor", x: 1.4, z: -0.6, yaw: -0.74 },
    ] },
    camera: { x: 4.4, z: 4.6, yaw: 0.77, pitch: -0.12 },
    floor: [["band", 3.6, -3.2, 3.4, 3.4, 0.25], ["box", 0, 0, 14, 12, 0.08, IXR_Y], ["box", 5.8, -0.2, 1.8, 1.4, 0.06, IXR_W]],
  },
};

/** GPU texture bytes per room per tier (budget; ixrMeasure and the walk-through report the measured figure beside it). */
export const IXR_TEX_BUDGET = { high: 24 * 1024 * 1024, balanced: 3 * 1024 * 1024, low: 3 * 1024 * 1024 };
/** The shell's two canvas signs (ix-interiors.js ixSignMaterial: the job board and the honesty label, 512 × 256 each). */
export const IXR_SHELL_SIGNS = [[512, 256], [512, 256]];

export function ixrTexRes(tier = "high", ua = typeof navigator !== "undefined" ? navigator.userAgent : "") {
  if (tier !== "high") return 256;
  return /OculusBrowser|PICO/i.test(ua || "") ? 256 : 1024; // a standalone headset keeps the cheap set
}

// ------------------------------------------------------------------------------------------------------------- textures

const IXR_TEX_CACHE = new Map();
function ixrCanvas(w, h) {
  if (typeof document === "undefined" || !document.createElement) return null;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  return c.getContext("2d") ? c : null;
}
/** A seeded generator for the paint (deterministic textures). */
function ixrRng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
/** Wrap a canvas (or, headless, a stub of the same size so the bytes are still measured) as a texture. */
function ixrTexture(THREE, canvas, w, h, name, repeat = null) {
  const tex = canvas ? new THREE.CanvasTexture(canvas) : new THREE.Texture();
  if (!canvas) tex.image = { width: w, height: h };
  tex.name = name;
  if (canvas && "colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(repeat[0], repeat[1]); }
  tex.anisotropy = 4;
  return tex;
}
function ixrNoise(g, res, rng, n, a, light = "255,255,255", dark = "0,0,0") {
  for (let i = 0; i < n; i++) {
    const s = 1 + Math.floor(rng() * (res / 256 + 1));
    g.fillStyle = `rgba(${rng() < 0.5 ? light : dark},${(a * (0.4 + rng() * 0.6)).toFixed(3)})`;
    g.fillRect(Math.floor(rng() * res), Math.floor(rng() * res), s, s);
  }
}
/** Painted concrete (tileable, one tile = 2 m): mottled paint over pores, faint form-tie dots. */
function ixrPaintConcrete(g, res) {
  const rng = ixrRng(11);
  g.fillStyle = "#e4e6e8"; g.fillRect(0, 0, res, res);
  for (let i = 0; i < 70; i++) {
    const x = rng() * res, y = rng() * res, r = res * (0.04 + rng() * 0.12);
    const gr = g.createRadialGradient(x, y, 0, x, y, r); const a = 0.03 + rng() * 0.05, tone = rng() < 0.5 ? "255,255,255" : "120,124,128";
    gr.addColorStop(0, `rgba(${tone},${a})`); gr.addColorStop(1, `rgba(${tone},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ixrNoise(g, res, rng, res * res / 60, 0.08, "255,255,255", "70,74,78");
  g.fillStyle = "rgba(90,94,98,0.35)";
  for (const fx of [0.25, 0.75]) for (const fy of [0.25, 0.75]) { g.beginPath(); g.arc(fx * res, fy * res, res / 140 + 1, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "rgba(80,84,88,0.25)"; g.fillRect(0, 0, res, Math.max(1, res / 512)); // a panel joint per tile
}
/** Brushed metal (tileable): fine horizontal grain. */
function ixrPaintMetal(g, res) {
  const rng = ixrRng(23);
  g.fillStyle = "#c3c8cd"; g.fillRect(0, 0, res, res);
  for (let i = 0; i < res * 1.5; i++) {
    const y = rng() * res, a = 0.03 + rng() * 0.09;
    g.fillStyle = rng() < 0.5 ? `rgba(255,255,255,${a})` : `rgba(60,66,72,${a})`;
    g.fillRect(0, y, res, Math.max(1, res / 1024 * (1 + rng() * 2)));
  }
  ixrNoise(g, res, rng, res * 6, 0.05);
}
/** Guard mesh (tileable, one tile = 0.5 m): a welded wire grid on transparency (alpha-tested), the colour per instance. */
function ixrPaintMesh(g, res) {
  g.clearRect(0, 0, res, res);
  const n = 10, step = res / n, wire = Math.max(2, res / 160);
  g.fillStyle = "#ffffff";
  for (let i = 0; i < n; i++) { g.fillRect(i * step, 0, wire, res); g.fillRect(0, i * step, res, wire); }
  g.fillStyle = "rgba(255,255,255,0.9)";
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) g.fillRect(i * step - wire * 0.5, j * step - wire * 0.5, wire * 2, wire * 2); // weld nodes
}
/** One tileable texture of the set, cached by name and size (the canvas is painted once per page). */
function ixrSetTexture(THREE, name, res, repeat) {
  const key = `${name}@${res}`;
  let base = IXR_TEX_CACHE.get(key);
  if (!base) {
    const c = ixrCanvas(res, res);
    if (c) { const g = c.getContext("2d"); ({ concrete: ixrPaintConcrete, metal: ixrPaintMetal, mesh: ixrPaintMesh })[name](g, res); }
    base = ixrTexture(THREE, c, res, res, `ixr-${name}`, [1, 1]);
    IXR_TEX_CACHE.set(key, base);
  }
  // A clone shares the canvas (one image, one upload per page) and carries its own repeat.
  const t = base.clone(); t.name = base.name; t.needsUpdate = true; t.repeat.set(repeat[0], repeat[1]);
  if (!t.image) t.image = base.image;
  return t;
}
/** The epoxy floor of one room: base, speckle, joints every 4 m, then the room's floor marks (ROOMS[style].floor). */
function ixrFloorTexture(THREE, styleId, room, res) {
  const c = ixrCanvas(res, res);
  if (c) {
    const g = c.getContext("2d"), rng = ixrRng(styleId.length * 97 + 5);
    const { w, d } = room, sx = res / w, sz = res / d;
    const X = (x) => (x + w / 2) * sx, Z = (z) => (z + d / 2) * sz;
    const base = new THREE.Color(room.style.floor);
    g.fillStyle = `#${base.getHexString()}`; g.fillRect(0, 0, res, res);
    const sheen = g.createLinearGradient(0, 0, res, res); sheen.addColorStop(0, "rgba(255,255,255,0.06)"); sheen.addColorStop(0.5, "rgba(255,255,255,0)"); sheen.addColorStop(1, "rgba(255,255,255,0.05)");
    g.fillStyle = sheen; g.fillRect(0, 0, res, res);
    ixrNoise(g, res, rng, res * res / 30, 0.12, "235,240,245", "25,28,32");
    g.strokeStyle = "rgba(20,22,26,0.28)"; g.lineWidth = Math.max(1, res / 700);
    for (let x = -w / 2 + 4; x < w / 2; x += 4) { g.beginPath(); g.moveTo(X(x), 0); g.lineTo(X(x), res); g.stroke(); }
    for (let z = -d / 2 + 4; z < d / 2; z += 4) { g.beginPath(); g.moveTo(0, Z(z)); g.lineTo(res, Z(z)); g.stroke(); }
    const hatch = (cx, cz, hw, hd) => {
      const x0 = X(cx - hw / 2), z0 = Z(cz - hd / 2), x1 = X(cx + hw / 2), z1 = Z(cz + hd / 2);
      g.save(); g.beginPath(); g.rect(x0, z0, x1 - x0, z1 - z0); g.clip();
      g.fillStyle = IXR_Y; g.fillRect(x0, z0, x1 - x0, z1 - z0); g.fillStyle = IXR_K;
      const p = 0.25 * sx, span = (x1 - x0) + (z1 - z0);
      for (let t = -span; t < span; t += p * 2) { g.beginPath(); g.moveTo(x0 + t, z0); g.lineTo(x0 + t + p, z0); g.lineTo(x0 + t + p + (z1 - z0), z1); g.lineTo(x0 + t + (z1 - z0), z1); g.closePath(); g.fill(); }
      g.restore();
    };
    for (const m of IXR_ROOMS[styleId]?.floor ?? []) {
      const [k] = m;
      if (k === "line" || k === "dash") {
        const [, x1, z1, x2, z2, lw, col, dash] = m;
        g.strokeStyle = col; g.lineWidth = lw * sx; g.setLineDash(k === "dash" ? [dash * sx, dash * sx * 0.6] : []);
        g.beginPath(); g.moveTo(X(x1), Z(z1)); g.lineTo(X(x2), Z(z2)); g.stroke(); g.setLineDash([]);
      } else if (k === "hatch") hatch(m[1], m[2], m[3], m[4]);
      else if (k === "band") {
        const [, cx, cz, bw, bd, t] = m;
        hatch(cx, cz - bd / 2 + t / 2, bw, t); hatch(cx, cz + bd / 2 - t / 2, bw, t);
        hatch(cx - bw / 2 + t / 2, cz, t, bd); hatch(cx + bw / 2 - t / 2, cz, t, bd);
      } else if (k === "ring") {
        const [, cx, cz, r, lw, col] = m;
        g.strokeStyle = col; g.lineWidth = lw * sx; g.beginPath(); g.ellipse(X(cx), Z(cz), r * sx, r * sz, 0, 0, Math.PI * 2); g.stroke();
      } else if (k === "zebra") {
        const [, cx, cz, zw, zd, col, bar] = m;
        g.fillStyle = col;
        for (let x = cx - zw / 2; x < cx + zw / 2; x += bar * 2) g.fillRect(X(x), Z(cz - zd / 2), bar * sx, zd * sz);
      } else if (k === "box") {
        const [, cx, cz, bw, bd, lw, col] = m;
        g.strokeStyle = col; g.lineWidth = lw * sx; g.strokeRect(X(cx - bw / 2), Z(cz - bd / 2), bw * sx, bd * sz);
      } else if (k === "cross") {
        const [, x, z, s, lw, col] = m;
        g.strokeStyle = col; g.lineWidth = lw * sx; g.beginPath();
        g.moveTo(X(x - s / 2), Z(z)); g.lineTo(X(x + s / 2), Z(z)); g.moveTo(X(x), Z(z - s / 2)); g.lineTo(X(x), Z(z + s / 2)); g.stroke();
      }
    }
  }
  return ixrTexture(THREE, c, res, res, `ixr-floor-${styleId}`);
}
/** The port room's window view onto a procedural container yard (no real port), and its plain status wall. */
function ixrYardTexture(THREE, res) {
  const w = res >= 1024 ? 512 : 256, h = w / 2, c = ixrCanvas(w, h);
  if (c) {
    const g = c.getContext("2d"), rng = ixrRng(77);
    const sky = g.createLinearGradient(0, 0, 0, h * 0.55); sky.addColorStop(0, "#9cc4e4"); sky.addColorStop(1, "#dfeaf2");
    g.fillStyle = sky; g.fillRect(0, 0, w, h * 0.55);
    g.fillStyle = "#6f8fa6"; g.fillRect(0, h * 0.5, w, h * 0.08); // water beyond the yard
    g.fillStyle = "#7d8186"; g.fillRect(0, h * 0.58, w, h * 0.42); // yard pavement
    const cols = ["#b5523b", "#3d6f8e", "#c79a3a", "#5b7f4f", "#8a8f96", "#a8463f"];
    for (let row = 0; row < 3; row++) for (let x = 0; x < w; x += w / 18) {
      if (rng() < 0.2) continue;
      const stack = 1 + Math.floor(rng() * 3), cw = w / 20, ch = h * 0.045, y0 = h * (0.66 + row * 0.1);
      for (let s = 0; s < stack; s++) { g.fillStyle = cols[Math.floor(rng() * cols.length)]; g.fillRect(x + row * 4, y0 - s * ch, cw, ch - 1); }
    }
    g.strokeStyle = "#f2f2f2"; g.lineWidth = Math.max(1, w / 256); g.setLineDash([w / 40, w / 60]);
    g.beginPath(); g.moveTo(0, h * 0.95); g.lineTo(w, h * 0.95); g.stroke(); g.setLineDash([]);
    g.fillStyle = "#e0c341"; // two gantry cranes, plain shapes
    for (const gx of [0.22, 0.68]) {
      const x = gx * w; g.fillRect(x, h * 0.18, w * 0.012, h * 0.62); g.fillRect(x + w * 0.16, h * 0.18, w * 0.012, h * 0.62); g.fillRect(x - w * 0.01, h * 0.16, w * 0.2, h * 0.04);
      g.fillStyle = "#3d4650"; g.fillRect(x + w * 0.06, h * 0.2, w * 0.04, h * 0.05); g.fillStyle = "#e0c341";
    }
  }
  return ixrTexture(THREE, c, w, h, "ixr-yard-view");
}
function ixrStatusTexture(THREE, res) {
  const w = res >= 1024 ? 512 : 256, h = w / 2, c = ixrCanvas(w, h);
  if (c) {
    const g = c.getContext("2d");
    g.fillStyle = "#14202a"; g.fillRect(0, 0, w, h);
    const rows = [["Yard lanes", IXR_G], ["Pedestrian crossing", "#e8b923"], ["Gantry", IXR_G], ["Lashing crew area", "#e8b923"], ["E-stop circuit", IXR_G]];
    g.font = `${Math.round(h / 11)}px system-ui, sans-serif`; g.textBaseline = "middle";
    rows.forEach(([t, col], i) => {
      const y = h * (0.14 + i * 0.18);
      g.fillStyle = col; g.beginPath(); g.arc(w * 0.08, y, h / 22, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#e6eef4"; g.fillText(t, w * 0.15, y);
    });
  }
  return ixrTexture(THREE, c, w, h, "ixr-status-wall");
}

// ---------------------------------------------------------------------------------------------------------------- props

/**
 * Each room's parts as [tag, kind, w, h, d, x, y, z, colour, deco?]: unit shapes scaled per instance, room-local metres, y the
 * centre height. Kinds: "c" coloured box, "m" brushed-metal box (tinted), "g" guard-mesh panel, "r" cylinder, "e" lit box.
 * `deco` parts are dropped on the phone tier. One InstancedMesh per kind; a part standing in the walk is a collider.
 */
function ixrPartsFor(styleId) {
  const P = [], p = (tag, kind, w, h, d, x, y, z, col, deco = false) => P.push([tag, kind, w, h, d, x, y, z, col, deco]);
  const Y = 0xf2c14b, K = 0x2a2f36, O = 0xe2701f, RED = 0xd8322a, GR = 0x8b959c, WH = 0xf0f0f0, BL = 0x3a8fd8, WOOD = 0x8a6a48;
  const estop = (tag, x, z) => { p(tag, "c", 0.14, 1.1, 0.14, x, 0.55, z, Y); p(tag, "r", 0.16, 0.07, 0.16, x, 1.14, z, RED); };
  if (styleId === "ixr-cell-hall") {
    for (const x of [-3, -1, 1, 3]) p("perimeter guard fence", "g", 2, 2.2, 0.05, x, 1.2, -7, 0x33383e);
    for (const x of [-3, -1, 3]) p("perimeter guard fence", "g", 2, 2.2, 0.05, x, 1.2, -1, 0x33383e);
    for (const z of [-6, -4]) p("perimeter guard fence", "g", 0.05, 2.2, 2, -4, 1.2, z, 0x33383e);
    for (const z of [-6, -4, -2]) p("perimeter guard fence", "g", 0.05, 2.2, 2, 4, 1.2, z, 0x33383e);
    for (const x of [-4, -2, 0, 2, 4]) { p("fence posts", "c", 0.09, 2.35, 0.09, x, 1.175, -7, Y); p("fence posts", "c", 0.09, 2.35, 0.09, x, 1.175, -1, Y); }
    for (const z of [-5, -3]) { p("fence posts", "c", 0.09, 2.35, 0.09, -4, 1.175, z, Y); p("fence posts", "c", 0.09, 2.35, 0.09, 4, 1.175, z, Y); }
    for (const [x, z] of [[0.12, -0.85], [1.88, -0.85], [-4.0, -2.85], [-4.0, -1.15]]) { p("light-curtain posts", "c", 0.07, 1.8, 0.07, x, 0.9, z, K); p("light-curtain posts", "e", 0.025, 1.6, 0.025, x + (z > -1 ? 0 : 0.04), 0.95, z + (z > -1 ? -0.04 : 0), 0xff5a3c); }
    p("light-curtain posts", "c", 0.14, 0.2, 0.1, 2.05, 1.2, -0.95, RED); // the gate interlock
    estop("e-stop posts", 2.8, -0.4); estop("e-stop posts", -5.6, -0.4); estop("e-stop posts", 5.4, -6.4);
    p("teach-pendant cart", "m", 0.8, 0.8, 0.6, 6.2, 0.45, -3, 0x9aa3ab); p("teach-pendant cart", "c", 0.86, 0.04, 0.66, 6.2, 0.87, -3, K);
    p("teach-pendant cart", "c", 0.34, 0.22, 0.07, 6.1, 1.0, -3.05, 0x3d4650); p("teach-pendant cart", "e", 0.2, 0.12, 0.01, 6.1, 1.01, -3.01, 0x7fd1c9);
    p("teach-pendant cart", "m", 0.04, 0.32, 0.6, 6.62, 1.05, -3, GR);
    p("cell robot", "c", 1.1, 0.9, 1.1, 0, 0.45, -4, 0x4a5058); p("cell robot", "r", 0.8, 0.4, 0.8, 0, 1.1, -4, O);
    p("cell robot", "c", 0.38, 1.7, 0.38, 0, 2.15, -4, O); p("cell robot", "r", 0.46, 0.46, 0.46, 0, 3.0, -4, O);
    p("cell robot", "c", 0.32, 0.32, 1.5, 0, 3.0, -3.25, O); p("cell robot", "c", 0.26, 0.42, 0.26, 0, 2.75, -2.5, K); p("cell robot", "c", 0.32, 0.12, 0.22, 0, 2.48, -2.5, GR);
    p("fixture table", "m", 1.6, 0.85, 1.0, 2.4, 0.425, -5.6, 0x8f99a3); p("fixture table", "c", 0.4, 0.2, 0.3, 2.4, 0.95, -5.6, O);
    p("transfer table", "m", 1.0, 0.9, 1.6, -5.0, 0.45, -2.0, 0x8f99a3); p("transfer table", "c", 0.5, 0.25, 0.4, -5.0, 1.02, -2.2, O, true);
    p("controller cabinet", "m", 0.8, 1.9, 0.6, -6.6, 0.95, -6.5, 0x6d7782); p("controller cabinet", "e", 0.12, 0.2, 0.12, -6.6, 2.0, -6.5, 0x4cd964);
    p("wall rack", "m", 0.6, 2.4, 2.4, 9.4, 1.2, 2.2, 0x5d7fa3, true); p("wall rack", "c", 0.5, 0.4, 2.2, 9.4, 1.0, 2.2, WOOD, true);
    p("pallet", "c", 1.2, 0.15, 1.0, -6.6, 0.075, -2.6, WOOD, true); p("pallet", "c", 1.0, 0.5, 0.8, -6.6, 0.4, -2.6, 0xb08a5a, true);
  } else if (styleId === "ixr-cobot-lab") {
    const cobot = (tag, x, z, s) => {
      p(tag, "r", 0.3 * s, 0.2, 0.3 * s, x - 0.4 * s, 1.0, z, 0x5d6a78); p(tag, "r", 0.22 * s, 0.25, 0.22 * s, x - 0.4 * s, 1.22, z, WH);
      p(tag, "c", 0.14 * s, 0.7 * s, 0.14 * s, x - 0.4 * s, 1.3 + 0.35 * s, z, WH); p(tag, "r", 0.2 * s, 0.2 * s, 0.2 * s, x - 0.4 * s, 1.3 + 0.7 * s, z, WH);
      p(tag, "c", 0.12 * s, 0.12 * s, 0.6 * s, x - 0.4 * s, 1.3 + 0.7 * s, z + 0.3 * s, WH); p(tag, "r", 0.12 * s, 0.08, 0.12 * s, x - 0.4 * s, 1.24 + 0.7 * s, z + 0.62 * s, BL);
    };
    p("cobot bench", "c", 1.8, 0.9, 1.0, 0, 0.45, -2.2, 0xd9dde0); cobot("cobot arm", 0, -2.2, 1); p("cobot bench", "c", 0.5, 0.06, 0.35, 0.4, 0.93, -2.2, BL);
    p("area scanner", "c", 0.15, 0.12, 0.15, 0.82, 0.96, -1.78, Y); p("bench e-stop", "c", 0.12, 0.06, 0.12, 0.7, 0.93, -1.82, Y); p("bench e-stop", "r", 0.09, 0.05, 0.09, 0.7, 0.98, -1.82, RED);
    p("second cobot cell", "c", 1.4, 0.9, 0.8, -5, 0.45, -4.2, 0xd9dde0); cobot("second cobot cell", -4.8, -4.2, 0.8);
    for (const z of [-4.0, -1.2]) { p("wall benches", "c", 0.8, 0.9, 2.0, 7.4, 0.45, z, 0xd9dde0); p("monitors", "c", 0.05, 0.36, 0.56, 7.62, 1.15, z, K); p("monitors", "e", 0.01, 0.31, 0.5, 7.59, 1.15, z, 0x6fb6e0); }
    p("back bench", "c", 3.0, 0.9, 0.8, 3.5, 0.45, -6.4, 0xd9dde0); p("printer", "c", 0.5, 0.5, 0.5, 3.0, 1.15, -6.4, 0xe6ecef, true); p("back bench", "c", 0.35, 0.2, 0.3, 4.3, 1.0, -6.4, BL, true);
    p("storage cabinet", "m", 0.6, 1.9, 1.2, -7.55, 0.95, 1.2, 0x9aa3ab); p("tool cart", "m", 0.9, 0.9, 0.6, -2.6, 0.45, -6.3, 0xb03a2e, true);
  } else if (styleId === "ixr-amr-warehouse") {
    const row = (x, depth, z0, bays) => {
      for (let i = 0; i <= bays; i++) p("racking frames", "m", depth, 5.4, 0.1, x, 2.7, z0 + i * 2.6, 0x2f5d8c);
      for (let i = 0; i < bays; i++) {
        const zc = z0 + i * 2.6 + 1.3;
        for (const y of [1.7, 3.5, 5.2]) p("racking beams", "m", depth, 0.12, 2.5, x, y, zc, 0xe2701f);
        p("racked loads", "c", depth * 0.8, 0.9, 2.2, x, 0.5, zc, 0xb08a5a);
        p("racked loads", "c", depth * 0.8, 0.9, 2.2, x, 2.25, zc, 0xc49a63, true); p("racked loads", "c", depth * 0.8, 0.9, 2.2, x, 4.05, zc, 0xa77f52, true);
      }
    };
    // Four rows, the centre aisle left open so the back-wall honesty sign reads from the door.
    row(-11.4, 1.0, -9.6, 3); row(11.4, 1.0, -9.6, 3); row(-7.0, 2.0, -9.6, 3); row(7.0, 2.0, -9.6, 3);
    p("AMR", "c", 0.8, 0.45, 1.2, -3.5, 0.3, -3.0, 0xf2a33a); p("AMR", "r", 0.28, 0.12, 0.28, -3.5, 0.59, -3.42, K); p("AMR", "c", 0.6, 0.06, 0.9, -3.5, 0.56, -2.9, BL);
    p("docked AMR", "c", 1.2, 0.45, 0.8, -10.9, 0.3, 3.5, 0xf2a33a); p("docked AMR", "c", 0.9, 0.06, 0.6, -10.9, 0.56, 3.5, BL, true);
    for (const z of [3.5, 5.5]) { p("chargers", "c", 0.35, 0.8, 0.7, -11.8, 0.4, z, K); p("charger lights", "e", 0.03, 0.15, 0.3, -11.61, 0.6, z, 0x4cd964); }
    for (const [x, z] of [[-6.4, 0.5], [6.4, 0.5], [-6.4, 3.5], [6.4, 3.5]]) p("walkway bollards", "r", 0.2, 1.0, 0.2, x, 0.5, z, Y);
    estop("e-stop posts", -7.0, 0.3); estop("e-stop posts", 7.0, 3.7);
  } else if (styleId === "ixr-port-control") {
    for (const x of [-3, 0, 3]) {
      p("console desks", "c", 2.6, 0.75, 0.9, x, 0.375, -3.3, 0x3d4650);
      for (const dx of [-0.6, 0.6]) { p("monitors", "c", 0.62, 0.4, 0.05, x + dx, 1.05, -3.6, K); p("screens", "e", 0.56, 0.34, 0.01, x + dx, 1.05, -3.57, 0x5fb3d9); }
      p("chairs", "c", 0.5, 0.9, 0.5, x, 0.45, -2.3, 0x2a2f36, true);
    }
    for (let i = 0; i <= 8; i++) p("mullions", "c", 0.08, 2.0, 0.12, -6.5 + i * 1.625, 2.0, -5.93, K);
    p("supervisor desk", "c", 1.8, 0.75, 0.8, -5.2, 0.375, 0.4, 0x3d4650, true); p("supervisor desk", "e", 0.5, 0.3, 0.01, -5.2, 1.0, 0.1, 0x5fb3d9, true);
    p("comms rack", "m", 0.6, 1.9, 0.6, -7.4, 0.95, -4.8, 0x5d6a78); p("rack beacon", "e", 0.1, 0.12, 0.1, -7.4, 1.98, -4.8, 0x4cd964);
  } else if (styleId === "ixr-drilling-deck") {
    const bar = (x, z, w, d, i) => { p("barricade", "c", w, 1.0, d, x, 0.6, z, i % 2 ? WH : 0xd8452a); p("barricade feet", "c", w > d ? 0.4 : 0.5, 0.06, w > d ? 0.5 : 0.4, x, 0.03, z, K, true); };
    let i = 0;
    for (const x of [-3, -1, 1, 3]) bar(x, -6.5, 1.9, 0.08, i++);
    for (const x of [-3, -1, 3]) bar(x, -0.5, 1.9, 0.08, i++);
    for (const z of [-5.5, -3.5, -1.5]) { bar(-4, z, 0.08, 1.9, i++); bar(4, z, 0.08, 1.9, i++); }
    for (const x of [-7.5, 7.5]) {
      for (const z of [-6, -3.5, -1, 1.5]) { p("shoring posts", "m", 0.1, 4.0, 0.1, x, 2.0, z, 0xc9a227); p("shoring posts", "c", 0.3, 0.04, 0.3, x, 0.02, z, K, true); }
      p("shoring beams", "m", 0.15, 0.2, 8.0, x, 4.1, -2.25, 0xc9a227);
    }
    p("dust extractor", "c", 0.8, 1.1, 0.6, 5.4, 0.55, -2.4, 0x6d7379); p("dust extractor", "r", 0.3, 0.3, 0.3, 5.4, 1.25, -2.4, K);
    p("extractor hose", "c", 2.6, 0.1, 0.1, 3.4, 0.05, -2.6, K);
    for (const x of [-3, -1.5, 0, 1.5, 3]) p("ceiling grid", "e", 0.03, 0.012, 6.0, x, 4.19, -3.5, 0xe6d27a);
    for (const z of [-6.0, -4.75, -3.5, -2.25, -1.0]) p("ceiling grid", "e", 7.0, 0.012, 0.03, 0, 4.19, z, 0xe6d27a);
    for (const [x, z] of [[-1.5, -4.75], [0, -4.75], [1.5, -4.75], [-1.5, -2.25], [0, -2.25], [1.5, -2.25]]) p("layout marks", "c", 0.14, 0.014, 0.14, x, 4.185, z, RED);
    p("drilling robot", "c", 1.0, 0.45, 1.4, 0, 0.3, -3.5, 0x2e3338); p("drilling robot", "c", 0.2, 0.3, 1.5, -0.55, 0.15, -3.5, K, true); p("drilling robot", "c", 0.2, 0.3, 1.5, 0.55, 0.15, -3.5, K, true);
    p("drilling robot", "c", 0.8, 0.5, 0.9, 0, 0.75, -3.5, 0xe0c341); p("drilling robot", "c", 0.2, 2.2, 0.2, 0, 2.1, -3.6, GR);
    p("drilling robot", "c", 0.26, 0.45, 0.26, 0, 3.42, -3.6, K); p("drilling robot", "r", 0.05, 0.35, 0.05, 0, 3.82, -3.6, 0xc3c8cd);
    p("robot battery", "c", 0.45, 0.3, 0.35, 0, 1.15, -3.0, 0x3f8f5a);
    p("control tablet stand", "c", 0.08, 1.2, 0.08, 3.0, 0.6, 0.4, GR); p("control tablet stand", "c", 0.32, 0.22, 0.04, 3.0, 1.25, 0.4, K); p("control tablet stand", "e", 0.27, 0.17, 0.01, 3.0, 1.25, 0.42, 0x7fd1c9);
    p("deck scanner", "c", 0.4, 0.15, 0.3, -2.2, 0.075, 0.3, Y, true);
  } else if (styleId === "ixr-maint-bay") {
    p("lockout board", "c", 0.05, 1.3, 2.2, -7.96, 1.6, -2.0, 0xe6ecef); p("lockout board", "c", 0.07, 0.15, 2.2, -7.95, 2.35, -2.0, RED);
    for (let k = 0; k < 8; k++) {
      const z = -2.8 + (k % 4) * 0.53, y = k < 4 ? 1.95 : 1.45;
      p("padlocks", "c", 0.05, 0.12, 0.08, -7.9, y, z, RED); p("lock tags", "c", 0.02, 0.16, 0.1, -7.92, y - 0.17, z, Y, k % 2 === 1);
    }
    for (const x of [-5.0, -2.4, 0.2]) {
      for (const xs of [-1.08, 1.08]) p("parts racks", "m", 0.05, 2.2, 0.6, x + xs, 1.1, -6.6, 0x6d7782);
      for (const y of [0.1, 0.8, 1.5, 2.15]) p("parts racks", "m", 2.2, 0.05, 0.6, x, y, -6.6, 0x8b959c);
      for (const y of [0.24, 0.94, 1.64]) for (let b = 0; b < 4; b++) p("parts bins", "c", 0.4, 0.22, 0.45, x - 0.78 + b * 0.52, y, -6.6, b % 2 ? BL : Y, b > 1);
    }
    p("maintenance stand", "c", 1.3, 0.9, 1.3, 3.6, 0.45, -3.2, 0x3d4650); p("robot arm on the stand", "r", 0.7, 0.35, 0.7, 3.6, 1.07, -3.2, O);
    p("robot arm on the stand", "c", 0.34, 1.3, 0.34, 3.6, 1.9, -3.2, O); p("robot arm on the stand", "c", 0.3, 0.3, 1.2, 3.6, 2.5, -2.6, O);
    p("stand lockout tag", "c", 0.04, 0.18, 0.12, 4.27, 0.62, -3.2, RED); p("stand lockout tag", "c", 0.03, 0.22, 0.14, 4.27, 0.38, -3.2, Y);
    p("lift table", "m", 1.4, 0.7, 1.0, 5.8, 0.35, -0.2, 0x8f99a3); p("AMR on the lift", "c", 1.2, 0.45, 0.8, 5.8, 0.925, -0.2, 0xf2a33a); p("AMR on the lift", "c", 0.9, 0.06, 0.6, 5.8, 1.18, -0.2, BL, true);
    p("workbench", "c", 2.2, 0.9, 0.8, -3.0, 0.45, -3.0, WOOD); p("workbench", "c", 0.6, 0.15, 0.3, -3.4, 0.98, -3.0, 0xb03a2e, true); p("workbench", "c", 0.3, 0.3, 0.3, -2.4, 1.05, -3.0, GR, true);
    p("parts cart", "m", 0.9, 0.9, 0.6, -5.8, 0.45, 1.8, 0x9aa3ab, true);
  }
  return P;
}

// ------------------------------------------------------------------------------------------------------------- dresser

/** Furnish one ixr room (the dresser INTERIORS runs after the shell). Returns { parts, textures }. */
export function ixrDress({ three: THREE, group, room, site = null, tier = "high" }) {
  const styleId = room?.id, R = IXR_ROOMS[styleId];
  if (!THREE || !R) return null;
  const low = tier === "low", res = ixrTexRes(tier);
  // The texture set on the shell: the epoxy floor (this room's marks), painted concrete walls, brushed metal on the props.
  const floor = group.getObjectByName("ix-floor"), wall = group.getObjectByName("ix-wall-0");
  const floorTex = ixrFloorTexture(THREE, styleId, room, res);
  if (floor) { floor.material.map = floorTex; floor.material.color.set(0xffffff); floor.material.roughness = 0.55; floor.material.needsUpdate = true; }
  if (wall) { wall.material.map = ixrSetTexture(THREE, "concrete", res, [Math.max(room.w, room.d) / 2, room.h / 2]); wall.material.needsUpdate = true; }
  const parts = ixrPartsFor(styleId).filter((q) => !(low && q[9]));
  const kinds = { c: [], m: [], g: [], r: [], e: [] };
  for (const q of parts) kinds[q[1]].push(q);
  const m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(), col = new THREE.Color();
  const mats = {
    c: () => new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.1 }),
    // Brushed metal: the grain is in the texture; a low metalness keeps the tint readable with no environment map in the room.
    m: () => new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.15, map: ixrSetTexture(THREE, "metal", res, [1, 1]) }),
    g: () => new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.3, map: ixrSetTexture(THREE, "mesh", res, [4, 4.4]), transparent: true, alphaTest: 0.05, depthWrite: false, side: THREE.DoubleSide }),
    r: () => new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.15 }),
    e: () => new THREE.MeshBasicMaterial({ color: 0xffffff }), // lit strips, screens and lamps: unlit, coloured per instance
  };
  const geos = { c: () => new THREE.BoxGeometry(1, 1, 1), m: () => new THREE.BoxGeometry(1, 1, 1), g: () => new THREE.BoxGeometry(1, 1, 1), r: () => new THREE.CylinderGeometry(0.5, 0.5, 1, low ? 8 : 14), e: () => new THREE.BoxGeometry(1, 1, 1) };
  for (const [k, list] of Object.entries(kinds)) {
    if (!list.length) continue;
    const im = new THREE.InstancedMesh(geos[k](), mats[k](), list.length); im.name = `ixr-${k === "c" ? "props" : k === "m" ? "metal" : k === "g" ? "guard-mesh" : k === "r" ? "round" : "lit"}`;
    im.userData.ixrTags = list.map((q) => q[0]);
    list.forEach(([, , w, h, d, x, y, z, c], i) => {
      m4.compose(new THREE.Vector3(x, y, z), q0, new THREE.Vector3(w, h, d)); im.setMatrixAt(i, m4); im.setColorAt(i, col.setHex(c));
      // A part that stands in the walk (bottom below head height, top above a step) is a collider; a lit strip is not.
      if (k !== "e" && y - h / 2 < 1.9 && y + h / 2 > 0.5) room.colliders.push({ min: [x - w / 2, 0, z - d / 2], max: [x + w / 2, y + h / 2, z + d / 2], kind: "ixr-prop", prop: list[i][0] });
    });
    group.add(im);
  }
  // The port room: the window wall onto a procedural yard and the plain status wall (two planes).
  if (styleId === "ixr-port-control") {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(13, 2.0), new THREE.MeshBasicMaterial({ map: ixrYardTexture(THREE, res) }));
    win.position.set(0, 2.0, -room.d / 2 + 0.01); win.name = "ixr-window-wall"; group.add(win);
    const st = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.5), new THREE.MeshBasicMaterial({ map: ixrStatusTexture(THREE, res) }));
    st.position.set(room.w / 2 - 0.03, 1.9, -0.6); st.rotation.y = -Math.PI / 2; st.name = "ixr-status-wall"; group.add(st);
    parts.push(["window wall"], ["status wall"]);
  }
  // The agent spots: where the hive's avatars stand (AGENT-AVATARS reads room.spots.agent), marked by a ring on the floor.
  room.spots = { ...(room.spots ?? {}), agent: R.spots.agent.map((s) => ({ ...s })) };
  const rings = new THREE.InstancedMesh(new THREE.RingGeometry(0.42, 0.52, low ? 16 : 28), new THREE.MeshBasicMaterial({ color: 0x37d6c0, side: THREE.DoubleSide }), R.spots.agent.length);
  rings.name = "ixr-agent-spots";
  R.spots.agent.forEach((s, i) => { m4.compose(new THREE.Vector3(s.x, 0.012, s.z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), new THREE.Vector3(1, 1, 1)); rings.setMatrixAt(i, m4); });
  group.add(rings);
  room.ixr = { style: styleId, site: site?.id ?? null, parts: parts.length, tags: [...new Set(parts.map((q) => q[0]))] };
  return room.ixr;
}

export function ixrRegisterDressers(ix) {
  if (!ix || typeof ix.ixRegisterDresser !== "function") return [];
  const styles = Object.keys(IXR_ROOMS);
  for (const st of styles) ix.ixRegisterDresser(st, (a) => ixrDress(a));
  return styles;
}

export function ixrAgentSpot(room, agent = null) {
  const spots = room?.spots?.agent ?? [];
  const role = agent?.role ?? String(agent?.id ?? "").replace(/^oh-/, "");
  return spots.find((s) => s.role === role) ?? spots[0] ?? null;
}

// ------------------------------------------------------------------------------------------------------- sites and doors

export function ixrSiteFor(rb, parish = null) {
  const style = IXR_SITE_STYLE[rb?.id];
  if (!style) return null;
  const R = IXR_ROOMS[style], anchor = (parish?.sites ?? []).find((s) => s.id === rb.anchor) ?? null;
  const stations = [...R.stations];
  return {
    id: rb.id, name: rb.name, kind: "robotics", style, stations, anchor: rb.anchor, linkSite: anchor ? anchor.id : null,
    board: { id: anchor ? anchor.id : rb.id, name: rb.name, kind: "robotics site", trades: anchor?.trades ?? ["robotics"], blurb: `A generic room: ${R.what}.`, stations },
  };
}

/** Door-spot candidates round a robot site's 16 × 12 m pad (site-local metres): off the pad, outside the 6 m warning ring,
 * never on the e-stop post's side first. */
export const IXR_DOOR_OFFSETS = [[0, 8.6, "s"], [0, -8.6, "n"], [-9.6, 0, "w"], [9.8, 3.0, "e"]];
export function ixrDoorsFor(parish, { sites = [], blocked = null, doorAt = null } = {}) {
  const out = [];
  for (const s of sites) {
    const site = ixrSiteFor(s, parish);
    if (!site || !s.position) continue;
    let spot = null;
    const fx = doorAt?.(s.id);
    if (fx && Number.isFinite(fx.x) && Number.isFinite(fx.z)) spot = { x: fx.x, z: fx.z, face: fx.face ?? "s" };
    for (const [dx, dz, face] of IXR_DOOR_OFFSETS) {
      if (spot) break;
      const x = s.position[0] + dx, z = s.position[1] + dz;
      if (!blocked || !blocked(x, z)) spot = { x, z, face };
    }
    if (!spot) { const [dx, dz, face] = IXR_DOOR_OFFSETS[0]; spot = { x: s.position[0] + dx, z: s.position[1] + dz, face }; }
    out.push({ site, ...spot, style: site.style, title: null });
  }
  return out;
}

export function ixrSceneSite(styleId, parish = null, sites = []) {
  const here = sites.find((s) => IXR_SITE_STYLE[s.id] === styleId);
  if (here) return { ...ixrSiteFor(here, parish), here: true };
  const rb = RB_SITES.find((s) => IXR_SITE_STYLE[s.id] === styleId);
  return rb ? { ...ixrSiteFor(rb, null), here: false } : null;
}

// ------------------------------------------------------------------------------------------------------------- walking

/** An A* path from one room-local point to another over a 0.2 m grid; cells keep 0.42 m (NEWTON's avatar radius 0.35 plus a
 * margin) from every collider taller than a step (0.5 m). Null when no path exists. */
export function ixrPlan(room, from, to) {
  const step = 0.2, rad = 0.42, W = room.w, D = room.d;
  const nx = Math.floor(W / step), nz = Math.floor(D / step);
  const tall = room.colliders.filter((c) => c.max[1] > 0.5);
  const free = new Uint8Array(nx * nz);
  const cx = (i) => -W / 2 + (i + 0.5) * step, cz = (j) => -D / 2 + (j + 0.5) * step;
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const x = cx(i), z = cz(j);
    if (Math.abs(x) > W / 2 - rad || Math.abs(z) > D / 2 - rad) continue;
    let ok = true;
    for (const c of tall) { const px = Math.max(c.min[0], Math.min(x, c.max[0])), pz = Math.max(c.min[2], Math.min(z, c.max[2])); if (Math.hypot(x - px, z - pz) < rad) { ok = false; break; } }
    free[i * nz + j] = ok ? 1 : 0;
  }
  const cell = (x, z) => [Math.max(0, Math.min(nx - 1, Math.floor((x + W / 2) / step))), Math.max(0, Math.min(nz - 1, Math.floor((z + D / 2) / step)))];
  const nearestFree = ([i0, j0]) => { for (let r = 0; r < 8; r++) for (let di = -r; di <= r; di++) for (let dj = -r; dj <= r; dj++) { const i = i0 + di, j = j0 + dj; if (i >= 0 && j >= 0 && i < nx && j < nz && free[i * nz + j]) return [i, j]; } return null; };
  const s = nearestFree(cell(from.x, from.z)), g = nearestFree(cell(to.x, to.z));
  if (!s || !g) return null;
  const key = (i, j) => i * nz + j, dist = new Float32Array(nx * nz).fill(Infinity), prev = new Int32Array(nx * nz).fill(-1), done = new Uint8Array(nx * nz);
  const open = [[0, s[0], s[1]]]; dist[key(s[0], s[1])] = 0;
  while (open.length) {
    let bi = 0; for (let k = 1; k < open.length; k++) if (open[k][0] < open[bi][0]) bi = k;
    const [, i, j] = open[bi]; open[bi] = open[open.length - 1]; open.pop();
    if (done[key(i, j)]) continue; done[key(i, j)] = 1;
    if (i === g[0] && j === g[1]) break;
    for (const [di, dj, c] of IXR_STEPS) {
      const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= nx || b >= nz || !free[key(a, b)]) continue;
      if (di && dj && (!free[key(i + di, j)] || !free[key(i, j + dj)])) continue;
      const nd = dist[key(i, j)] + c;
      if (nd < dist[key(a, b)]) { dist[key(a, b)] = nd; prev[key(a, b)] = key(i, j); open.push([nd + Math.hypot(a - g[0], b - g[1]), a, b]); }
    }
  }
  if (!Number.isFinite(dist[key(g[0], g[1])])) return null;
  const path = []; for (let k = key(g[0], g[1]); k !== -1; k = prev[k]) path.push({ x: cx(Math.floor(k / nz)), z: cz(k % nz) });
  return path.reverse();
}
const IXR_STEPS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
/** Walk from `from` to `to` along ixrPlan's path with an avatar step (default NEWTON's, ixWalk): arrived within 0.3 m. */
export function ixrWalkTo(room, from, to, stepFn = ixWalk) {
  const path = ixrPlan(room, from, to);
  if (!path) return { ok: false, pose: from, d: Infinity, why: "no path" };
  const pts = [...path.filter((_, i) => i % 3 === 0), to];
  let p = { ...from }, k = 0;
  for (let n = 0; n < 4000 && k < pts.length; n++) {
    const t = pts[k], dx = t.x - p.x, dz = t.z - p.z, L = Math.hypot(dx, dz);
    if (L < (k === pts.length - 1 ? 0.08 : 0.2)) { k++; continue; }
    const v = Math.min(2.5, L * 30);
    p = stepFn(room, p, { vx: (dx / L) * v, vz: (dz / L) * v }, 1 / 30);
  }
  const d = Math.hypot(p.x - to.x, p.z - to.z);
  return { ok: d <= 0.3, pose: p, d };
}
/** The walk-through of one room: the door to every station pad and agent spot. */
export function ixrWalkAll(room, stepFn = ixWalk) {
  const start = { x: room.door.x, z: room.door.z - 0.8, yaw: 0, pitch: 0 };
  const targets = [...room.actions.filter((a) => a.kind === "station").map((a) => ({ ...a, what: `station ${a.station}` })), ...(room.spots?.agent ?? []).map((a) => ({ ...a, what: `agent spot ${a.id}` }))];
  const results = targets.map((t) => {
    const r = ixrWalkTo(room, start, t, stepFn);
    const ok = r.ok && (t.kind !== "station" || ixNear(room, r.pose.x, r.pose.z)?.id === t.id);
    return { what: t.what, ok, d: r.d, at: [r.pose.x, r.pose.z], why: r.why };
  });
  return { reached: results.filter((r) => r.ok).length, total: results.length, results };
}

// ---------------------------------------------------------------------------------------------------------------- measure

/** GPU bytes of one texture: w × h × 4 (RGBA8), × 4/3 when it carries a mip chain. */
export function ixrTexBytes(tex) {
  const img = tex?.image; if (!img?.width || !img?.height) return 0;
  const mips = tex.generateMipmaps !== false && tex.minFilter !== 1006 && tex.minFilter !== 1003; // LinearFilter / NearestFilter
  return Math.round(img.width * img.height * 4 * (mips ? 4 / 3 : 1));
}
export function ixrMeasure(room) {
  let meshes = 0, triangles = 0, instances = 0;
  const seen = new Map();
  room.group.traverse((o) => {
    if (!o.isMesh) return;
    meshes++;
    const g = o.geometry, n = (g.index ? g.index.count : g.attributes.position.count) / 3;
    triangles += n * (o.isInstancedMesh ? o.count : 1);
    if (o.isInstancedMesh && /^ixr-/.test(o.name)) instances += o.count;
    for (const m of [].concat(o.material)) {
      const t = m?.map; if (!t?.image) continue;
      const key = t.image; // clones share one image: one upload
      if (!seen.has(key)) seen.set(key, { name: t.name || o.name, w: t.image.width, h: t.image.height, bytes: ixrTexBytes(t) });
    }
  });
  const textures = [...seen.values()];
  return { meshes, triangles, instances, props: room.ixr?.tags?.length ?? 0, textures, textureBytes: textures.reduce((a, t) => a + t.bytes, 0) };
}
