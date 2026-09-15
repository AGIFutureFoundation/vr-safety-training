/**
 * Headless content check for the Trade Skills Simulator.
 *
 * Builds every room against a stubbed three.js and DOM, then plays a scripted
 * perfect run through the real procedure engine. It catches the failure modes
 * that only show up at runtime in a browser: a step pointing at an interactable
 * that no longer exists, a hazard id with no object, a room whose animate()
 * throws, or scoring that stops advancing.
 *
 *     node tools/check_trades.mjs
 */

import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");

const MODULES = [
  "shared/kit.js", "shared/game.js",
  "trades/js/rooms/electrical.js", "trades/js/rooms/salon.js", "trades/js/rooms/kitchen.js",
  "trades/js/rooms/phlebotomy.js", "trades/js/rooms/welding.js", "trades/js/rooms/devops.js",
];

// ------------------------------------------------------------- three.js stub

const THREE_STUB = `
const noop = () => {};
class Vec2 {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  set(x, y) { this.x = x; this.y = y; return this; }
}
class Vec3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  setScalar(v) { return this.set(v, v, v); }
  copy(v) { return this.set(v.x, v.y, v.z); }
  clone() { return new Vec3(this.x, this.y, this.z); }
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  addScaledVector(v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
  multiplyScalar(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
  normalize() { const l = Math.hypot(this.x, this.y, this.z) || 1; return this.multiplyScalar(1 / l); }
  length() { return Math.hypot(this.x, this.y, this.z); }
  lengthSq() { return this.x ** 2 + this.y ** 2 + this.z ** 2; }
  distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z); }
  distanceToSquared(v) { return this.distanceTo(v) ** 2; }
  applyMatrix4() { return this; }
  setFromMatrixPosition() { return this; }
}
class Euler {
  constructor() { this.x = 0; this.y = 0; this.z = 0; this.order = "XYZ"; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
}
class Obj3D {
  constructor() {
    this.children = []; this.parent = null; this.visible = true; this.userData = {};
    this.position = new Vec3(); this.rotation = new Euler(); this.scale = new Vec3(1, 1, 1);
    this.castShadow = false; this.receiveShadow = false; this.name = "";
    this.matrixWorld = {}; this.renderOrder = 0; this.frustumCulled = true; this.layers = { test: () => true };
  }
  add(...cs) { for (const c of cs) { if (!c) continue; c.parent = this; this.children.push(c); } return this; }
  remove(c) { const i = this.children.indexOf(c); if (i >= 0) { this.children.splice(i, 1); c.parent = null; } return this; }
  traverse(fn) { fn(this); for (const c of this.children) c.traverse(fn); }
  getWorldPosition(t) { return (t ?? new Vec3()).copy(this.position); }
  getWorldDirection(t) { return (t ?? new Vec3()).set(0, 0, -1); }
  lookAt() { return this; }
  updateProjectionMatrix() {}
  clone() { return this; }
}
class Geometry {
  constructor() { this.attributes = { position: { needsUpdate: false } }; }
  dispose() {} rotateX() { return this; } translate() { return this; }
  setAttribute() { return this; } setFromPoints() { return this; }
}
class Material {
  constructor(p = {}) {
    Object.assign(this, p);
    this.userData = {};
    this.emissive = p.emissive !== undefined ? new Color(p.emissive) : new Color(0);
    this.color = new Color(p.color ?? 0xffffff);
    this.emissiveIntensity = p.emissiveIntensity ?? 1;
  }
  clone() { const m = new Material(); Object.assign(m, this); m.userData = {}; m.emissive = new Color(0); return m; }
  dispose() {}
}
class Color {
  constructor(v = 0) { this.v = v; }
  set(v) { this.v = v; return this; }
}
class Mesh extends Obj3D {
  constructor(geometry, material) { super(); this.geometry = geometry; this.material = material; this.isMesh = true; }
}
class Points extends Mesh { constructor(g, m) { super(g, m); this.isMesh = false; this.isPoints = true; } }
class Line extends Mesh { constructor(g, m) { super(g, m); this.isMesh = false; this.isLine = true; } }
class Shape {
  moveTo() {} lineTo() {} quadraticCurveTo() {}
}
export const FrontSide = 0, DoubleSide = 2, AdditiveBlending = 1, NormalBlending = 0, PCFSoftShadowMap = 1;
export { Vec2 as Vector2, Vec3 as Vector3, Mesh, Points, Line, Shape, Color };
export class Group extends Obj3D {}
export class Object3D extends Obj3D {}
export class BoxGeometry extends Geometry {}
export class CylinderGeometry extends Geometry {}
export class SphereGeometry extends Geometry {}
export class TorusGeometry extends Geometry {}
export class RingGeometry extends Geometry {}
export class PlaneGeometry extends Geometry {}
export class CircleGeometry extends Geometry {}
export class OctahedronGeometry extends Geometry {}
export class CapsuleGeometry extends Geometry {}
export class ExtrudeGeometry extends Geometry {}
export class LatheGeometry extends Geometry {}
export class TubeGeometry extends Geometry {}
export class BufferGeometry extends Geometry {}
export class BufferAttribute {}
export class CatmullRomCurve3 { constructor(p) { this.points = p; } }
export class MeshStandardMaterial extends Material {}
export class MeshBasicMaterial extends Material {}
export class PointsMaterial extends Material {}
export class LineBasicMaterial extends Material {}
export class CanvasTexture { constructor() { this.needsUpdate = false; } dispose() {} }
export class DirectionalLight extends Obj3D {
  constructor(c, i) { super(); this.color = c; this.intensity = i; this.shadow = { mapSize: { set: noop }, camera: {} }; }
}
export class PointLight extends Obj3D { constructor(c, i) { super(); this.color = c; this.intensity = i; } }
export class HemisphereLight extends Obj3D {}
export class Box3 {
  setFromObject(o) { const p = o.position ?? new Vec3(); this.min = new Vec3(p.x - 0.2, 0, p.z - 0.2); this.max = new Vec3(p.x + 0.2, 1, p.z + 0.2); return this; }
  getCenter(t) { return (t ?? new Vec3()).set((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2, (this.min.z + this.max.z) / 2); }
}
export class Matrix4 { identity() { return this; } extractRotation() { return this; } }
`;

// ---------------------------------------------------------------- DOM stubs

function installDomStubs() {
  const ctx2d = new Proxy({}, {
    get(_t, prop) {
      if (prop === "measureText") return () => ({ width: 10 });
      if (prop === "createLinearGradient") return () => ({ addColorStop() {} });
      if (prop === "canvas") return { width: 1, height: 1 };
      return () => {};
    },
    set() { return true; },
  });
  globalThis.document = {
    createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d }),
  };
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  globalThis.window = {};
  globalThis.performance = globalThis.performance ?? { now: () => Date.now() };
}

// --------------------------------------------------------------- assembly

const IMPORT_RE = /^import\s+[\s\S]*?from\s+["'][^"']+["'];\s*$/gm;
const EXPORT_BLOCK_RE = /^export\s*\{[^}]*\}\s*;\s*$/gm;
const EXPORT_KEYWORD_RE = /^export\s+(?=(const|let|var|function|class|async))/gm;

function strip(src) {
  return src.replace(IMPORT_RE, "").replace(EXPORT_BLOCK_RE, "").replace(EXPORT_KEYWORD_RE, "");
}

const dir = mkdtempSync(join(tmpdir(), "trades-check-"));
writeFileSync(join(dir, "three-mock.mjs"), THREE_STUB);

const parts = MODULES.map((rel) => strip(readFileSync(join(WEBXR, rel), "utf8")));
const harness = `
export const ROOMS = [ROOM_ELECTRICAL, ROOM_SALON, ROOM_KITCHEN, ROOM_PHLEBOTOMY, ROOM_WELDING, ROOM_DEVOPS];
export { Session, Progress, Sfx, THREE };
`;
writeFileSync(join(dir, "suite.mjs"),
  `import * as THREE from "./three-mock.mjs";\n\n${parts.join("\n\n")}\n\n${harness}`);

installDomStubs();

const suite = await import(pathToFileURL(join(dir, "suite.mjs")).href);
suite.Sfx.muted = true;

// ----------------------------------------------------------------- checking

let failures = 0;
const fail = (room, msg) => { failures++; console.log(`  ✗ [${room}] ${msg}`); };

console.log(`Trade Skills Simulator — content check (${suite.ROOMS.length} rooms)\n`);

for (const room of suite.ROOMS) {
  const root = new suite.THREE.Group();
  let api;
  try {
    api = room.build(root);
  } catch (err) {
    fail(room.id, `build() threw: ${err.message}`);
    continue;
  }

  // Every step must point at an interactable that the room actually built.
  for (const step of room.steps) {
    const ids = step.kind === "sequence" ? step.targets : [step.target];
    for (const id of ids) {
      if (!id) { fail(room.id, `step "${step.id}" has no target`); continue; }
      if (!api.hits[id]) fail(room.id, `step "${step.id}" targets missing interactable "${id}"`);
    }
    if (!step.why || step.why.length < 20) fail(room.id, `step "${step.id}" has no real rationale`);
    if (!step.cue) fail(room.id, `step "${step.id}" has no cue`);
    if (step.kind === "gauge" && !step.gauge) fail(room.id, `gauge step "${step.id}" has no gauge config`);
    if (step.kind === "hold" && !(step.seconds > 0)) fail(room.id, `hold step "${step.id}" has no duration`);
    if (step.kind === "turn" && !(step.turn?.turns > 0)) fail(room.id, `turn step "${step.id}" has no turns amount`);
    if (step.kind === "drag") {
      if (!step.drag?.to) fail(room.id, `drag step "${step.id}" has no drop socket`);
      else if (!api.hits[step.drag.to]) fail(room.id, `drag step "${step.id}" socket "${step.drag.to}" has no object in the room`);
    }
  }

  // Reaching-ahead notes must name objects that exist, and steps that come later.
  for (const [id, note] of Object.entries(room.lateNotes ?? {})) {
    if (!api.hits[id]) fail(room.id, `lateNote "${id}" has no object in the room`);
    const owned = room.steps.some((s) => s.target === id || s.targets?.includes(id));
    if (!owned) fail(room.id, `lateNote "${id}" is not a target of any step`);
    if ((note ?? "").length < 30) fail(room.id, `lateNote "${id}" is too thin`);
  }

  // Every hazard must be reachable, or the lesson can never fire.
  for (const id of Object.keys(room.hazards ?? {})) {
    if (!api.hits[id]) fail(room.id, `hazard "${id}" has no object in the room`);
    if ((room.hazards[id] ?? "").length < 40) fail(room.id, `hazard "${id}" explanation is too thin`);
  }

  // Play a perfect run: correct target, gauge committed mid-band, holds held.
  const session = new suite.Session(room, {
    onStep: (step, s) => api.onStep?.(step, s),
    onStepComplete: (step, s) => api.onStepComplete?.(step, s),
    onFeedback: (fb, s) => api.onFeedback?.(fb, s),
    onHazard: (id, s) => api.onHazard?.(id, s),
  });
  session.start();

  let guard = 0;
  while (!session.finished && guard++ < 400) {
    const step = session.step;
    if (!step) break;
    if (step.kind === "select") {
      session.select(step.target);
    } else if (step.kind === "sequence") {
      for (const id of step.targets) session.select(id);
    } else if (step.kind === "gauge") {
      const [lo, hi] = step.gauge.green ?? [0.44, 0.62];
      session.gauge.t = (lo + hi) / 2;
      session.select(step.target);
    } else if (step.kind === "hold") {
      session.setHolding(true);
      for (let i = 0; i < step.seconds * 20 + 4 && !session.finished && session.step === step; i++) {
        session.tick(0.05);
      }
    } else if (step.kind === "turn") {
      session.rotate(step.target, (step.turn?.turns ?? 1) + 1);
    } else if (step.kind === "drag") {
      session.dropAt(step.target, 0);
    }
    // Rooms animate every frame in the browser; make sure they survive it.
    try { api.animate?.(guard * 0.05, 0.05, session); } catch (err) {
      fail(room.id, `animate() threw at step "${step.id}": ${err.message}`);
      break;
    }
  }

  if (!session.finished) fail(room.id, `perfect run did not complete (stalled at step ${session.index + 1}/${room.steps.length})`);
  else if (session.errors !== 0) fail(room.id, `perfect run recorded ${session.errors} error(s)`);
  else if (session.score <= 0) fail(room.id, `perfect run scored ${session.score}`);

  // A hazard pick must cost points and reset the combo.
  const hazardId = Object.keys(room.hazards ?? {})[0];
  if (hazardId) {
    const probe = new suite.Session(room, {});
    probe.start();
    probe.select(room.steps[0].kind === "select" ? room.steps[0].target : hazardId);
    const before = probe.score;
    const fb = probe.wrong(hazardId);
    if (!fb?.hazard) fail(room.id, `hazard "${hazardId}" did not register as an unsafe action`);
    if (probe.score >= before && before > 0) fail(room.id, `hazard "${hazardId}" applied no penalty`);
  }

  if (!failures) {
    console.log(`  ✓ ${room.title.padEnd(16)} ${room.steps.length} steps · ` +
      `${Object.keys(room.hazards ?? {}).length} hazards · ` +
      `${Object.keys(api.hits).length} interactables · perfect run ${session.score} pts`);
  } else {
    console.log(`    ${room.title}: ${room.steps.length} steps, ${Object.keys(api.hits).length} interactables`);
  }
}

console.log(failures ? `\n${failures} problem(s) found.` : "\nAll rooms pass.");
process.exit(failures ? 1 : 0);
