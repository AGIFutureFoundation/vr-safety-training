// AGENT-AVATARS — the Omega Hive's software agents, embodied at the robot sites
// they manage (console AGENT-AVATARS, docs/consoles/AGENT-AVATARS.md).
// SmartCiti.X Holodeck · Powered by AGI Corp.
//
// One figure per agent: crew.js's ctAvatarFigure (the body every GRIOT character
// has) re-tinted as a hologram of the agent's accent colour — no skin, no face —
// wearing the agent outfit set: a visor where a face would be, a halo above it, a
// high-visibility vest with a neutral glyph badge and a tablet. A floating label
// reads "software agent · <role>" under the agent's name, so nobody can take an
// agent for a person. The whole figure — body, marker, outfit, talk light, label
// and caption — stays inside AA_AGENT_BUDGET (crew.js CT_AVATAR_BUDGET, 12, the
// same ceiling GRIOT's figures keep).
//
// It listens to anything with on(type, fn) — the hive (OMEGA-HIVE's ohHive), the
// VBRIDGE adapter below, or a fixture — for the contract's events:
//   { t, type: "speak" | "move" | "bid" | "award" | "dispatch" | "refused" | "approval-request" | "complete",
//     agent, text?, to?: siteId, jobId?, reason?, caption? }
//   move     → walks to a free standing spot at the target site (property writes per frame, only within GRIOT's
//              animate radius of the learner, hidden beyond its hide radius); a move longer than AA_WALK_MAX re-projects
//              the agent AA_WALK_IN m short of the spot and it walks in; reduced motion or an off-map start jumps.
//   speak    → the talk light runs for exactly the line (aaLineMs, queued per agent so an agent never talks over
//              itself; talkStart/talkEnd let an on-device voice drive it instead) and a caption bubble shows the
//              line above the figure.
//   refused  → a calm stop gesture (the tablet raised, palm-out), with the refusal's own text as a caption.
//   complete → a nod.
// Reduced motion: no walking, no nod or bob — figures jump, gestures hold still, captions still show.
// The phone tier ("low") builds no figures, so its mesh, triangle and texture budgets do not move.
//
// Standing spots sit 9–17 m from a site's centre on its north, east and west sides: outside the robot's
// warning zone (RB_SSM.warn, 6 m) and its pad, never in the south corridor where boards and arrival spots
// are (GRIOT's placement rule). No network, no voice, no microphone: this module draws and listens to
// events only. Every top-level name starts with `aa`/`AA_` (the bundler shares one scope); three.js comes
// from the caller as `three`.
//
// SEAM (the contract in the loop-10 brief):
//   aaMountAgentAvatars({ three, parent, agents, source, siteAt, reducedMotion, tier, groundAt, spotFor, textureScale })
//     spotFor(agent, siteId) -> { x, y?, z, yaw } | null: a fixed standing spot (HIVE-IN-WORLD: a robotics room's agent spot,
//              room-local; yaw is the figure's rotation.y) used instead of a slot round the site; null falls back to a slot.
//     textureScale (default 1): the label and caption canvases are drawn at this fraction of their size (a room on the
//              balanced tier uses 0.5 to stay inside its texture budget); the layout is the same at every scale.
//     -> { root, handle(ev), animate(t, dt, here), attach(source), detach(source), addAgents(list), agents(),
//          state(id), talkStart(id), talkEnd(id), talkLog(), captionLog(), gestureLog(), counts(), dispose() }
//   aaVbridgeAgents(homeSite) -> the four VBRIDGE personas as agents standing at homeSite
//   aaVbridgeSource(vbApi)    -> an on/off source that turns the agent-jobs panel's job (vbApi.state()) into
//                                contract events: the client asks, the governor checks or refuses, the provider
//                                walks to the job's site and runs it, the evaluator nods or refuses. poll() reads.
//   aaEmitter()               -> a small on/off/emit event source (fixtures and adapters)

import { ctAvatarFigure, ctAvatarOption, CT_AVATAR_BUDGET } from "./crew.js";
import { aaAgentLook, aaRoleLabel, aaHash, AA_VBRIDGE_PERSONAS } from "./aa-agent-portraits.js";
import { RB_SITES } from "./rb-robotics-data.js";
import { VB_TASKS, VB_REASONS } from "./vb-shared-data.js";

/** Meshes and sprites per agent figure, every part included: crew.js's figure ceiling (GRIOT's figures keep it too). */
export const AA_AGENT_BUDGET = CT_AVATAR_BUDGET;
/** GRIOT's radii (npc.js GR_ANIMATE_RADIUS, GR_HIDE_RADIUS); check_agent_avatars holds them equal. */
export const AA_ANIMATE_RADIUS = 150;
export const AA_HIDE_RADIUS = 600;
/** Walking speed (m/s) and the longest walk. A longer move (robot sites on one map can be a kilometre apart) re-projects
 * the agent AA_WALK_IN metres short of the target, on the line from where it was, and it walks the rest in. */
export const AA_WALK_SPEED = 2.2;
export const AA_WALK_MAX = 150;
export const AA_WALK_IN = 24;
/** A line's duration with no voice driving it: 400 ms plus the words at AA_WPM, clamped. */
export const AA_WPM = 165;
export const AA_LINE_MS = Object.freeze({ min: 1500, max: 12000 });
export const AA_GESTURE_MS = Object.freeze({ stop: 1800, nod: 900 });
/** Canvas sizes (px) for the label (drawn at mount) and the caption (drawn on the first line). */
export const AA_LABEL_PX = Object.freeze([256, 64]);
export const AA_CAPTION_PX = Object.freeze([512, 128]);
/** Texture bytes one figure can hold (RGBA): the label plus the caption. The phone tier holds none. */
export const AA_TEXTURE_BYTES_PER_FIGURE = (AA_LABEL_PX[0] * AA_LABEL_PX[1] + AA_CAPTION_PX[0] * AA_CAPTION_PX[1]) * 4;
/** Which render tiers build figures (perf.js tcTierSettings names). */
export const AA_TIERS = Object.freeze({ low: false, balanced: true, high: true });
export const AA_EVENT_TYPES = Object.freeze(["speak", "move", "bid", "award", "dispatch", "refused", "approval-request", "complete"]);
/** Standing spots around a site centre ([dx, dz] m): north, west and east sides, 9.3–16 m out. */
export const AA_SLOTS = Object.freeze([[-4, -9.5], [4, -9.5], [-10.5, -3], [10.5, -3], [0, -12.5], [-10.5, 3], [10.5, 3], [-8, -13], [8, -13], [-13, -8], [13, -8], [0, -16]]);

const aaClamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** A line's duration (ms) when no voice drives it. */
export function aaLineMs(text) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.round(aaClamp(400 + (words * 60000) / AA_WPM, AA_LINE_MS.min, AA_LINE_MS.max));
}

/** A small event source: on(type, fn), off(type, fn), emit(ev); "*" hears every type. */
export function aaEmitter() {
  const subs = new Map();
  const api = {
    on(type, fn) { if (typeof fn !== "function") return api; if (!subs.has(type)) subs.set(type, new Set()); subs.get(type).add(fn); return api; },
    off(type, fn) { subs.get(type)?.delete(fn); return api; },
    emit(ev) {
      if (!ev?.type) return 0; let n = 0;
      for (const fn of [...(subs.get(ev.type) ?? []), ...(subs.get("*") ?? [])]) { try { fn(ev); n += 1; } catch (_) { /* a listener's error stays its own */ } }
      return n;
    },
    listeners: (type) => subs.get(type)?.size ?? 0,
  };
  return api;
}

/** A site lookup's answer as { x, y, z } (accepts [x, z], [x, y, z], { x, z }, { position: [x, z] }), or null. */
export function aaSitePoint(v) {
  if (!v) return null;
  if (Array.isArray(v)) return v.length >= 3 ? { x: +v[0], y: +v[1] || 0, z: +v[2] } : v.length === 2 ? { x: +v[0], y: 0, z: +v[1] } : null;
  if (Array.isArray(v.position)) return { x: +v.position[0], y: +(v.y ?? 0) || 0, z: +v.position[1] };
  if (Number.isFinite(+v.x) && Number.isFinite(+v.z)) return { x: +v.x, y: +(v.y ?? 0) || 0, z: +v.z };
  return null;
}

const aaAgentId = (a) => (typeof a === "string" ? a : a?.id ?? null);

// ------------------------------------------------------------------ canvases

function aaCanvas(w, h, scale = 1) {
  try {
    if (typeof document === "undefined" || typeof document.createElement !== "function") return null;
    const k = scale > 0 ? scale : 1;
    const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
    const g = c.getContext?.("2d"); if (!g) return null;
    g.scale?.(c.width / w, c.height / h); // draw in the logical w × h box at any scale
    return { c, g, w, h };
  } catch (_) { return null; }
}
const aaCss = (n) => `#${(n >>> 0).toString(16).padStart(6, "0").slice(-6)}`;

function aaRoundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
  g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
}

/** Label text room on the label canvas (logical px): the width inside the rounded frame, and the smallest legible font. */
export const AA_LABEL_TEXT = Object.freeze({ maxWidth: AA_LABEL_PX[0] - 20, minPx: 10 });

/** The largest font (from `px` down to `minPx`) at which `text` fits `maxWidth` on context `g`; leaves g.font set to it. */
export function aaFitFont(g, text, maxWidth, px, minPx = AA_LABEL_TEXT.minPx, weight = 500) {
  let size = px, width = Infinity;
  for (; size >= minPx; size -= 1) { g.font = `${weight} ${size}px system-ui, sans-serif`; width = Number(g.measureText(text)?.width) || 0; if (width <= maxWidth) break; }
  if (size < minPx) { size = minPx; g.font = `${weight} ${size}px system-ui, sans-serif`; width = Number(g.measureText(text)?.width) || 0; }
  return { px: size, width, maxWidth, fits: width <= maxWidth };
}

/** The label: the name, then "software agent · <role>" whole, each fitted to the frame (the font shrinks; fillText's maxWidth
 * holds anything still wider), so the words "software agent" are never cut at the canvas edge. Returns the fits. */
function aaDrawLabel(cv, name, roleText, accent) {
  const { g, w, h } = cv, max = AA_LABEL_TEXT.maxWidth;
  g.clearRect(0, 0, w, h);
  aaRoundRect(g, 2, 2, w - 4, h - 4, 14); g.fillStyle = "rgba(8,22,32,0.86)"; g.fill(); g.lineWidth = 3; g.strokeStyle = aaCss(accent); g.stroke();
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffffff";
  const nameText = String(name), nameFit = aaFitFont(g, nameText, max, 22, 12, 600);
  g.fillText(nameText, w / 2, h * 0.34, max);
  g.fillStyle = aaCss(accent);
  const roleFit = aaFitFont(g, roleText, max, 17, AA_LABEL_TEXT.minPx, 500);
  g.fillText(roleText, w / 2, h * 0.72, max);
  return { name: { text: nameText, ...nameFit }, role: { text: roleText, ...roleFit } };
}

/** Wrap text into at most `max` lines that fit `width` (an ellipsis marks a cut). */
function aaWrap(g, text, width, max) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean), lines = [];
  let line = "";
  for (const wd of words) {
    const next = line ? `${line} ${wd}` : wd;
    if (g.measureText(next).width <= width || !line) line = next; else { lines.push(line); line = wd; }
    if (lines.length === max) break;
  }
  if (lines.length < max && line) lines.push(line);
  if (lines.length === max && lines.join(" ").length < words.join(" ").length) lines[max - 1] = `${lines[max - 1].replace(/\s*\S*$/, "")}…`;
  return lines;
}

function aaDrawCaption(cv, text, accent) {
  const { g, w, h } = cv;
  g.clearRect(0, 0, w, h);
  aaRoundRect(g, 3, 3, w - 6, h - 22, 16); g.fillStyle = "rgba(255,255,255,0.94)"; g.fill(); g.lineWidth = 3; g.strokeStyle = aaCss(accent); g.stroke();
  g.beginPath(); g.moveTo(w / 2 - 12, h - 20); g.lineTo(w / 2, h - 4); g.lineTo(w / 2 + 12, h - 20); g.closePath(); g.fillStyle = "rgba(255,255,255,0.94)"; g.fill();
  g.font = "500 24px system-ui, sans-serif"; g.fillStyle = "#0b1a24"; g.textAlign = "center"; g.textBaseline = "middle";
  const lines = aaWrap(g, text, w - 36, 3), lh = 28, top = (h - 18) / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((ln, i) => g.fillText(ln, w / 2, top + i * lh));
}

// ------------------------------------------------------------------ the figure

const AA_BODIES = ["average", "slender", "tall", "broad", "compact", "full"];

function aaSprite(T, cv, w, h) {
  const map = cv && T.CanvasTexture ? new T.CanvasTexture(cv.c) : null;
  if (T.Sprite && T.SpriteMaterial) {
    const s = new T.Sprite(new T.SpriteMaterial({ map, transparent: true, depthWrite: false }));
    s.scale.set(w, h, 1); return s;
  }
  const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map, transparent: true, depthWrite: false })); return m;
}

/** Build one agent's figure into a new group (feet at y = 0, facing +z). Returns { group, parts, label, caption, captionCv, labelCv, headY }. */
function aaBuildFigure(T, agent, look, textureScale = 1) {
  const h = aaHash(agent.id);
  const body = AA_BODIES[h % AA_BODIES.length];
  const g = ctAvatarFigure(T, { body, skin: "tone-6", hair: "shaved", hairColour: "black", ppe: "none", hardHat: "white" });
  g.name = `aa-agent-${agent.id}`;
  const parts = g.userData.parts;
  const holo = new T.MeshStandardMaterial({ color: look.accent, emissive: look.accent, emissiveIntensity: 0.35, roughness: 0.45, metalness: 0.05, transparent: true, opacity: 0.82 });
  for (const m of Object.values(parts)) { m.material?.dispose?.(); m.material = holo; m.castShadow = false; }
  const B = ctAvatarOption("body", body), H = B.h, W = B.w, headY = parts.head.position.y;
  const add = (name, geo, mat, x, y, z) => { const mesh = new T.Mesh(geo, mat); mesh.position.set(x, y, z); mesh.name = `aa-${name}`; g.add(mesh); parts[name] = mesh; return mesh; };
  add("visor", new T.BoxGeometry(0.25, 0.07, 0.12), new T.MeshStandardMaterial({ color: 0x0b1a24, emissive: look.accent, emissiveIntensity: 0.55, roughness: 0.2, metalness: 0.4 }), 0, headY + 0.01, 0.085);
  const halo = add("halo", new T.TorusGeometry(0.17, 0.018, 6, 24), new T.MeshBasicMaterial({ color: look.accent }), 0, headY + 0.27, 0); halo.rotation.x = Math.PI / 2;
  add("vest", new T.CylinderGeometry(0.25 * W, 0.25 * W, 0.42 * H, 10, 1, true), new T.MeshStandardMaterial({ color: 0xd8ff3a, emissive: 0x202000, roughness: 0.7 }), 0, 1.12 * H, 0);
  add("badge", new T.CircleGeometry(0.055, 16), new T.MeshBasicMaterial({ color: look.accent }), -0.1 * W, 1.24 * H, 0.256 * W);
  const tablet = add("tablet", new T.BoxGeometry(0.2, 0.27, 0.02), new T.MeshStandardMaterial({ color: 0x1d2a33, emissive: look.accent, emissiveIntensity: 0.25, roughness: 0.4 }), 0.2 * W, 1.0 * H, 0.27 * W);
  tablet.rotation.x = -0.6;
  const talk = add("talk", new T.SphereGeometry(0.045, 10, 8), new T.MeshBasicMaterial({ color: 0xffffff }), 0, headY - 0.07, 0.125);
  talk.visible = false;
  const roleText = `software agent · ${aaRoleLabel(agent)}`;
  const labelCv = aaCanvas(AA_LABEL_PX[0], AA_LABEL_PX[1], textureScale);
  const labelFit = labelCv ? aaDrawLabel(labelCv, agent.name ?? agent.id, roleText, look.accent) : null;
  const label = aaSprite(T, labelCv, 1.6, 0.4); label.position.set(0, headY + 0.62, 0); label.name = "aa-label";
  label.userData.text = roleText; label.userData.name = agent.name ?? agent.id; label.userData.fit = labelFit; g.add(label);
  const caption = aaSprite(T, null, 2.8, 0.7); caption.position.set(0, headY + 1.22, 0); caption.name = "aa-caption"; caption.visible = false; caption.userData.text = ""; g.add(caption);
  g.userData.aaAgent = { id: agent.id, name: agent.name ?? agent.id, label: roleText, software: true };
  return { group: g, parts, label, caption, labelCv, captionCv: null, headY, tabletRest: { y: tablet.position.y, z: tablet.position.z, rx: tablet.rotation.x }, roleText };
}

function aaCountObject(obj) {
  let meshes = 0, sprites = 0, triangles = 0;
  obj?.traverse?.((o) => {
    if (o.isSprite) { sprites += 1; triangles += 2; return; }
    if (!o.isMesh) return;
    meshes += 1;
    const geo = o.geometry; const n = geo?.index?.count ?? geo?.attributes?.position?.count ?? 0;
    triangles += Math.floor(n / 3);
  });
  return { meshes, sprites, triangles };
}

// ------------------------------------------------------------------ the mount

/**
 * Mount the agents' figures. `agents` follow the contract (OMEGA-HIVE's OH_AGENTS shape: id, name, role, homeSite,
 * avatar { glyph, accent, outfit }); `source` is anything with on(type, fn) (or an array of them); `siteAt(siteId)`
 * answers this map's site position ({ x, y, z } / [x, z] / null when the site is not on this map). `here` passed to
 * animate is the learner's [x, z] (null = everyone near). Headless without `three`: the state machine still runs.
 */
export function aaMountAgentAvatars({ three = null, parent = null, agents = [], source = null, siteAt = () => null, reducedMotion = false, tier = "high", groundAt = null, spotFor = null, textureScale = 1 } = {}) {
  const T = three;
  const build = !!(T && parent && AA_TIERS[tier] !== false);
  const root = build ? new T.Group() : null;
  if (root) { root.name = "aa-agent-avatars"; parent.add(root); }
  const figures = new Map();
  const occupied = new Map(); // siteId -> Set(slot index)
  const talkLog = [], captionLog = [], gestureLog = [];
  let clock = 0, textureBytes = 0;
  const sources = new Set();
  const subs = new Map();

  const sitePt = (id) => { if (!id) return null; let p = null; try { p = aaSitePoint(siteAt(id)); } catch (_) { p = null; } return p; };
  function takeSlot(siteId, agentIndex) {
    const used = occupied.get(siteId) ?? new Set();
    let i = 0; const start = agentIndex % AA_SLOTS.length;
    for (let k = 0; k < AA_SLOTS.length; k += 1) { const s = (start + k) % AA_SLOTS.length; if (!used.has(s)) { i = s; break; } }
    used.add(i); occupied.set(siteId, used); return i;
  }
  const freeSlot = (siteId, i) => occupied.get(siteId)?.delete(i);
  function spotAt(siteId, slot, agent = null) {
    if (typeof spotFor === "function" && agent && siteId) { // a fixed spot (a room's agent spot) wins over the slots
      let o = null; try { o = spotFor(agent, siteId); } catch (_) { o = null; }
      if (o && Number.isFinite(+o.x) && Number.isFinite(+o.z)) return { x: +o.x, y: Number.isFinite(+o.y) ? +o.y : 0, z: +o.z, cx: +o.x, cz: +o.z, yaw: Number.isFinite(+o.yaw) ? +o.yaw : 0, fixed: true };
    }
    const c = sitePt(siteId); if (!c) return null;
    const [dx, dz] = AA_SLOTS[slot]; const x = c.x + dx, z = c.z + dz;
    const y = groundAt ? Number(groundAt(x, z)) || c.y : c.y;
    return { x, y, z, cx: c.x, cz: c.z, yaw: Math.atan2(c.x - x, c.z - z) };
  }

  function ensureFig(f) {
    if (!build || f.fig) return;
    f.fig = aaBuildFigure(T, f.agent, f.look, textureScale);
    f.fig.group.position.set(f.x, f.y, f.z); f.fig.group.rotation.y = f.yaw; f.fig.group.visible = f.visible;
    root.add(f.fig.group);
    if (f.fig.labelCv) textureBytes += f.fig.labelCv.c.width * f.fig.labelCv.c.height * 4;
  }

  function addAgents(list) {
    for (const a of list ?? []) {
      if (!a?.id || figures.has(a.id)) continue;
      const look = aaAgentLook(a);
      const idx = figures.size;
      const site = a.homeSite ?? null;
      const slot = site ? takeSlot(site, idx) : 0;
      const spot = site ? spotAt(site, slot, a) : null;
      const f = { agent: a, look, idx, site, slot, x: spot?.x ?? 0, y: spot?.y ?? 0, z: spot?.z ?? 0, yaw: spot?.yaw ?? 0, offMap: !spot,
        walk: null, queue: [], talk: null, caption: null, gesture: null, visible: !!spot, fig: null };
      if (spot) ensureFig(f); // an agent whose site is on another map gets its figure when it first arrives here
      figures.set(a.id, f);
    }
    return figures.size;
  }

  // ---- talk and captions
  function showCaption(f, text, start, end, kind) {
    f.caption = { text: String(text ?? ""), start, end, kind };
    captionLog.push({ agent: f.agent.id, text: f.caption.text, start, end, kind });
    const cap = f.fig?.caption;
    if (cap) {
      if (!f.fig.captionCv) {
        f.fig.captionCv = aaCanvas(AA_CAPTION_PX[0], AA_CAPTION_PX[1], textureScale);
        if (f.fig.captionCv && T.CanvasTexture) { cap.material.map = new T.CanvasTexture(f.fig.captionCv.c); cap.material.needsUpdate = true; textureBytes += f.fig.captionCv.c.width * f.fig.captionCv.c.height * 4; }
      }
      if (f.fig.captionCv) { aaDrawCaption(f.fig.captionCv, f.caption.text, f.look.accent); if (cap.material.map) cap.material.map.needsUpdate = true; }
      cap.userData.text = f.caption.text; cap.visible = true;
    }
  }
  function startNextLine(f, prevEnd) {
    const next = f.queue.shift(); if (!next) return false;
    const start = Math.max(next.at, prevEnd ?? next.at); // a queued line follows the last one exactly, never before it arrived
    f.talk = { text: next.text, start, end: start + next.ms / 1000, voiced: false, jobId: next.jobId ?? null };
    talkLog.push({ agent: f.agent.id, text: next.text, start, end: f.talk.end });
    showCaption(f, next.caption ?? next.text, start, f.talk.end, "speak");
    if (f.fig) f.fig.parts.talk.visible = true;
    return true;
  }
  function tickTalk(f) {
    if (f.talk && !f.talk.voiced && clock >= f.talk.end) {
      const end = f.talk.end; f.talk = null;
      if (f.fig) f.fig.parts.talk.visible = false;
      if (f.queue.length) startNextLine(f, end);
    }
    if (f.caption && clock >= f.caption.end && !(f.talk && f.talk.voiced)) { f.caption = null; if (f.fig) { f.fig.caption.visible = false; f.fig.caption.userData.text = ""; } }
  }

  // ---- the events
  function handle(ev) {
    if (!ev?.type) return false;
    const f = figures.get(aaAgentId(ev.agent)); if (!f) return false;
    if (ev.type === "speak") {
      const text = String(ev.text ?? ev.caption ?? "").trim(); if (!text) return false;
      tickTalk(f);
      f.queue.push({ text, at: clock, caption: ev.caption && ev.caption !== ev.text ? String(ev.caption) : null, ms: Number(ev.ms) > 0 ? Number(ev.ms) : aaLineMs(text), jobId: ev.jobId });
      if (!f.talk) startNextLine(f, clock);
      return true;
    }
    if (ev.type === "move") { moveTo(f, ev.to); return true; }
    if (ev.type === "refused") {
      f.gesture = { kind: "stop", start: clock, end: clock + AA_GESTURE_MS.stop / 1000 }; gestureLog.push({ agent: f.agent.id, ...f.gesture, reason: ev.reason ?? null });
      const t = ev.caption ?? ev.text ?? (ev.reason ? `Stopped: ${ev.reason}` : null);
      if (t && !f.talk) showCaption(f, t, clock, clock + Math.max(AA_GESTURE_MS.stop, aaLineMs(t)) / 1000, "refused");
      poseGesture(f); return true;
    }
    if (ev.type === "complete") { f.gesture = { kind: "nod", start: clock, end: clock + AA_GESTURE_MS.nod / 1000 }; gestureLog.push({ agent: f.agent.id, ...f.gesture }); poseGesture(f); return true; }
    if ((ev.type === "approval-request" || ev.type === "award" || ev.type === "dispatch" || ev.type === "bid") && ev.caption && !f.talk) {
      showCaption(f, ev.caption, clock, clock + aaLineMs(ev.caption) / 1000, ev.type); return true;
    }
    return false;
  }

  function moveTo(f, siteId) {
    if (!siteId) return;
    const prevSite = f.site, prevSlot = f.slot;
    if (prevSite === siteId && !f.offMap) return;
    if (prevSite) freeSlot(prevSite, prevSlot);
    const slot = takeSlot(siteId, f.idx);
    const spot = spotAt(siteId, slot, f.agent);
    f.site = siteId; f.slot = slot;
    if (!spot) { f.offMap = true; f.walk = null; f.visible = false; if (f.fig) f.fig.group.visible = false; return; }
    const dist = Math.hypot(spot.x - f.x, spot.z - f.z);
    if (!reducedMotion && !f.offMap && dist > AA_WALK_MAX) { // re-project short of the spot, then walk in
      const k = AA_WALK_IN / dist; f.x = spot.x + (f.x - spot.x) * k; f.z = spot.z + (f.z - spot.z) * k; f.y = spot.y;
      f.walk = { from: { x: f.x, y: f.y, z: f.z }, to: spot, start: clock, dur: AA_WALK_IN / AA_WALK_SPEED, reprojected: true };
      if (f.fig) f.fig.group.position.set(f.x, f.y, f.z);
      return;
    }
    if (reducedMotion || f.offMap || dist < 0.05) {
      f.offMap = false; f.walk = null; f.x = spot.x; f.y = spot.y; f.z = spot.z; f.yaw = spot.yaw; f.visible = true;
      ensureFig(f);
      if (f.fig) { f.fig.group.position.set(f.x, f.y, f.z); f.fig.group.rotation.y = f.yaw; f.fig.group.visible = true; }
      return;
    }
    f.walk = { from: { x: f.x, y: f.y, z: f.z }, to: spot, start: clock, dur: dist / AA_WALK_SPEED };
  }

  function poseGesture(f) {
    const fig = f.fig; if (!fig) return;
    const tab = fig.parts.tablet, head = fig.parts.head, r = fig.tabletRest;
    const g = f.gesture && clock < f.gesture.end ? f.gesture : null;
    if (g?.kind === "stop") { tab.position.y = r.y + 0.32; tab.position.z = r.z + 0.12; tab.rotation.x = 0; }
    else { tab.position.y = r.y; tab.position.z = r.z; tab.rotation.x = r.rx; }
    if (g?.kind === "nod" && !reducedMotion) head.rotation.x = Math.sin(((clock - g.start) / (g.end - g.start)) * Math.PI) * 0.35;
    else head.rotation.x = 0;
  }

  function animate(t, dt = 0, here = null) {
    clock = Number.isFinite(t) ? t : clock + (dt || 0);
    for (const s of sources) s.poll?.();
    for (const f of figures.values()) {
      tickTalk(f);
      if (f.gesture && clock >= f.gesture.end) f.gesture = null;
      if (f.walk) {
        const w = f.walk, k = aaClamp((clock - w.start) / w.dur, 0, 1);
        f.x = w.from.x + (w.to.x - w.from.x) * k; f.z = w.from.z + (w.to.z - w.from.z) * k; f.y = w.from.y + (w.to.y - w.from.y) * k;
        f.yaw = Math.atan2(w.to.x - w.from.x, w.to.z - w.from.z);
        if (k >= 1) { f.walk = null; f.yaw = w.to.yaw; }
      }
      if (!f.fig) continue;
      const d = here ? Math.hypot(here[0] - f.x, here[1] - f.z) : 0;
      const vis = !f.offMap && d <= AA_HIDE_RADIUS;
      f.visible = vis; f.fig.group.visible = vis;
      if (!vis || d > AA_ANIMATE_RADIUS) continue;
      // property writes, within GRIOT's animate radius only
      const bob = f.walk && !reducedMotion ? Math.abs(Math.sin(clock * 7)) * 0.04 : 0;
      f.fig.group.position.set(f.x, f.y + bob, f.z); f.fig.group.rotation.y = f.yaw;
      const talkOn = !!(f.talk && clock >= f.talk.start && (f.talk.voiced || clock < f.talk.end));
      const tk = f.fig.parts.talk; tk.visible = talkOn;
      if (talkOn) { const s = reducedMotion ? 1 : 0.75 + 0.5 * Math.abs(Math.sin(clock * 11)); tk.scale.set(1, s, 1); }
      poseGesture(f);
    }
  }

  // ---- sources
  function attach(src) {
    for (const s of Array.isArray(src) ? src : [src]) {
      if (!s || typeof s.on !== "function" || sources.has(s)) continue;
      const fns = AA_EVENT_TYPES.map((type) => { const fn = (ev) => handle({ ...ev, type: ev?.type ?? type }); s.on(type, fn); return [type, fn]; });
      subs.set(s, fns); sources.add(s);
    }
    return sources.size;
  }
  function detach(src) { const fns = subs.get(src); if (!fns) return; for (const [type, fn] of fns) { try { src.off?.(type, fn); } catch (_) { /* gone */ } } subs.delete(src); sources.delete(src); }

  addAgents(agents);
  if (source) attach(source);

  function counts() {
    let worst = 0, meshes = 0, sprites = 0, triangles = 0;
    for (const f of figures.values()) {
      if (!f.fig) continue;
      const c = aaCountObject(f.fig.group); worst = Math.max(worst, c.meshes + c.sprites); meshes += c.meshes; sprites += c.sprites; triangles += c.triangles;
    }
    return { figures: [...figures.values()].filter((f) => f.fig).length, agents: figures.size, meshes, sprites, triangles, worstPerFigure: worst, budget: AA_AGENT_BUDGET, textureBytes, tier, built: build };
  }
  const stateOf = (f) => ({ id: f.agent.id, name: f.agent.name ?? f.agent.id, label: f.fig?.roleText ?? `software agent · ${aaRoleLabel(f.agent)}`, site: f.site, slot: f.slot, x: f.x, y: f.y, z: f.z, yaw: f.yaw, offMap: f.offMap, visible: f.visible, walking: !!f.walk,
    speaking: !!(f.talk && clock >= f.talk.start && (f.talk.voiced || clock < f.talk.end)), line: f.talk?.text ?? null, caption: f.caption?.text ?? null, gesture: f.gesture?.kind ?? null, queued: f.queue.length,
    talkVisible: f.fig ? !!f.fig.parts.talk.visible : null, captionVisible: f.fig ? !!f.fig.caption.visible : null, headPitch: f.fig ? f.fig.parts.head.rotation.x : null, tabletY: f.fig ? f.fig.parts.tablet.position.y : null });

  return {
    root, handle, animate, attach, detach, addAgents,
    agents: () => [...figures.values()].map(stateOf),
    state: (id) => { const f = figures.get(id); return f ? stateOf(f) : null; },
    figure: (id) => figures.get(id)?.fig?.group ?? null,
    /** An on-device voice can drive the talk light instead of the clock: start holds it on, end lets it go. */
    talkStart: (id) => { const f = figures.get(id); if (f?.talk) { f.talk.voiced = true; return true; } return false; },
    talkEnd: (id) => { const f = figures.get(id); if (!f?.talk) return false; f.talk.voiced = false; f.talk.end = clock; const last = talkLog.findLast?.((x) => x.agent === id) ?? null; if (last) last.end = clock; if (f.caption) f.caption.end = clock; tickTalk(f); return true; },
    talkLog: () => talkLog.slice(), captionLog: () => captionLog.slice(), gestureLog: () => gestureLog.slice(),
    clock: () => clock, counts, sources: () => sources.size,
    dispose() { for (const s of [...sources]) detach(s); if (root) { root.parent?.remove(root); root.traverse((o) => { o.geometry?.dispose?.(); o.material?.map?.dispose?.(); o.material?.dispose?.(); }); } figures.clear(); },
  };
}

// ------------------------------------------------------------------ VBRIDGE: the four personas and their events

/** The four VBRIDGE personas (av-characters.js registry entries) as agents standing at `homeSite`. */
export function aaVbridgeAgents(homeSite = null) {
  return AA_VBRIDGE_PERSONAS.map((p) => ({ ...p, homeSite }));
}

const aaSiteName = (id) => RB_SITES.find((s) => s.id === id)?.name ?? String(id ?? "");

/**
 * The agent-jobs panel (vb-panel.js vbMountDispatch's api) as a contract source. poll() reads vbApi.state() and
 * emits what changed: a new job → the client asks and the governor checks (or refuses, with its own reason); the
 * supervisor's approval → the provider walks to the job's site and runs it; a supervisor's refusal → the provider
 * stops; the evaluation → the evaluator nods (completed) or stops (rejected, with the evaluation's reason). Every
 * fact in a line comes from the job. Reads only; the panel is never driven from here.
 */
export function aaVbridgeSource(vb, { siteName = aaSiteName } = {}) {
  const em = aaEmitter(); const log = [];
  let last = { id: null, phase: null, evaluated: false }, t = 0;
  function poll() {
    let st = null; try { st = vb?.state?.() ?? null; } catch (_) { st = null; }
    const job = st?.job; if (!job?.id) return 0;
    const out = [];
    const ev = (o) => out.push({ t: (t += 1), jobId: job.id, ...o });
    const short = String(job.id).replace(/^vbjob-/, "").slice(0, 6);
    const site = siteName(job.request?.siteId), task = VB_TASKS[job.request?.taskType]?.label ?? job.request?.taskType ?? "job";
    if (job.id !== last.id) {
      ev({ type: "speak", agent: "agent-client", text: `Job ${short}: ${task} at ${site}.` });
      if (job.governor?.decision === "refuse") {
        const why = job.governor.why ?? VB_REASONS.find((r) => r.id === job.governor.primary)?.text ?? job.governor.primary;
        ev({ type: "refused", agent: "agent-governor", reason: job.governor.primary, text: `Job ${short} refused: ${why}` });
      } else if (job.governor) ev({ type: "speak", agent: "agent-governor", text: `Job ${short} checked: allowed in the sim. The supervisor decides.` });
      last = { id: job.id, phase: job.phase, evaluated: false };
    }
    if (job.phase !== last.phase) {
      if (job.phase === "TRANSACTION") {
        ev({ type: "move", agent: "agent-provider", to: job.request.siteId });
        ev({ type: "speak", agent: "agent-provider", text: `Running job ${short} on the simulated robot at ${site}.` });
      }
      if (job.phase === "REJECTED" && job.approval && job.approval.approve === false) ev({ type: "refused", agent: "agent-provider", reason: "refused by the supervisor", text: `Job ${short} refused by the supervisor.` });
      last.phase = job.phase;
    }
    if (job.evaluation && !last.evaluated) {
      last.evaluated = true;
      if (job.evaluation.accepted) { ev({ type: "speak", agent: "agent-evaluator", text: `Job ${short} completed: ${job.evaluation.reason}.` }); ev({ type: "complete", agent: "agent-evaluator" }); }
      else ev({ type: "refused", agent: "agent-evaluator", reason: job.evaluation.reason, text: `Job ${short} not accepted: ${job.evaluation.reason}.` });
    }
    for (const e of out) { log.push(e); em.emit(e); }
    return out.length;
  }
  return { on: em.on, off: em.off, poll, events: () => log.slice() };
}
