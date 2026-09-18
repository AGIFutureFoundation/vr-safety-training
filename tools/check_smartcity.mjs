/**
 * Headless content check for SmartCiti.X.
 *
 * Builds all twenty simulators against a stubbed three.js and DOM, then plays a
 * scripted perfect run through the real procedure engine for each. Same
 * contract as tools/check_trades.mjs: catches a step pointing at a missing
 * interactable, an unreachable hazard or lateNote, a throwing animate(), a
 * stalled run, or a badge/challenge predicate that throws.
 *
 *     node tools/check_smartcity.mjs
 */

import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");

const MODULES = [
  "shared/kit.js", "shared/game.js",
  "smartcity/js/citykit.js", "smartcity/js/gamify.js",
  "smartcity/js/sims/charge-point.js", "smartcity/js/sims/signal-cabinet.js",
  "smartcity/js/sims/valve-vault.js", "smartcity/js/sims/solar-deck.js",
  "smartcity/js/sims/splice-node.js", "smartcity/js/sims/flight-deck.js",
  "smartcity/js/sims/track-access.js", "smartcity/js/sims/triage-point.js",
  "smartcity/js/sims/robot-cell.js", "smartcity/js/sims/chiller-plant.js",
  "smartcity/js/sims/tower-climb.js", "smartcity/js/sims/steel-erector.js",
  "smartcity/js/sims/crane-yard.js", "smartcity/js/sims/trench-box.js",
  "smartcity/js/sims/boiler-room.js", "smartcity/js/sims/elevator-pit.js",
  "smartcity/js/sims/abatement-chamber.js", "smartcity/js/sims/rigging-loft.js",
  "smartcity/js/sims/line-truck.js", "smartcity/js/sims/dock-crane.js",
  "smartcity/js/sims/hunters-point.js", "smartcity/js/sims/air-monitor.js", "smartcity/js/sims/sampling-well.js",
  "smartcity/js/sims/press-brake.js", "smartcity/js/sims/decon-line.js", "smartcity/js/sims/stage-power.js",
  "smartcity/js/sims/container-lashing.js",
  "smartcity/js/sims/lift-station.js", "smartcity/js/sims/mooring-line.js", "smartcity/js/sims/chain-hoist.js", "smartcity/js/sims/conveyor-guard.js", "smartcity/js/sims/cell-site-battery.js",
  "smartcity/js/sims/substation-switching.js", "smartcity/js/sims/bus-depot-lift.js", "smartcity/js/sims/fire-pump.js", "smartcity/js/sims/scaffold-erection.js",
  "smartcity/js/sims/aerial-ladder.js", "smartcity/js/sims/chlorine-room.js", "smartcity/js/sims/forklift-dock.js", "smartcity/js/sims/fly-system.js", "smartcity/js/sims/bunkering-watch.js",
  "smartcity/js/sims/microwave-backhaul.js", "smartcity/js/sims/stormwater-outfall.js", "smartcity/js/sims/battery-yard.js",
  "smartcity/js/sims/confined-rescue.js", "smartcity/js/sims/airport-ramp.js", "smartcity/js/sims/cooling-tower.js",
];

const THREE_STUB = `
const noop = () => {};
class Vec2 { constructor(x=0,y=0){this.x=x;this.y=y;} set(x,y){this.x=x;this.y=y;return this;} }
class Vec3 {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
  setScalar(v){return this.set(v,v,v);} copy(v){return this.set(v.x,v.y,v.z);} clone(){return new Vec3(this.x,this.y,this.z);}
  add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}
  addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;}
  sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this;}
  multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this;}
  normalize(){const l=Math.hypot(this.x,this.y,this.z)||1;return this.multiplyScalar(1/l);}
  length(){return Math.hypot(this.x,this.y,this.z);} lengthSq(){return this.x**2+this.y**2+this.z**2;}
  distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);} distanceToSquared(v){return this.distanceTo(v)**2;}
  applyMatrix4(){return this;} setFromMatrixPosition(){return this;}
}
class Euler { constructor(){this.x=0;this.y=0;this.z=0;this.order="XYZ";} set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} }
class Obj3D {
  constructor(){
    this.children=[]; this.parent=null; this.visible=true; this.userData={};
    this.position=new Vec3(); this.rotation=new Euler(); this.scale=new Vec3(1,1,1);
    this.castShadow=false; this.receiveShadow=false; this.name="";
    this.matrixWorld={}; this.renderOrder=0; this.frustumCulled=true; this.layers={test:()=>true};
  }
  add(...cs){for(const c of cs){if(!c)continue;c.parent=this;this.children.push(c);}return this;}
  remove(c){const i=this.children.indexOf(c);if(i>=0){this.children.splice(i,1);c.parent=null;}return this;}
  traverse(fn){fn(this);for(const c of this.children)c.traverse(fn);}
  getWorldPosition(t){return (t??new Vec3()).copy(this.position);}
  getWorldScale(t){return (t??new Vec3()).set(1,1,1);}
  getWorldDirection(t){return (t??new Vec3()).set(0,0,-1);}
  lookAt(){return this;} updateProjectionMatrix(){} clone(){return this;}
}
class Geometry { constructor(){this.attributes={position:{needsUpdate:false}};} dispose(){} rotateX(){return this;} translate(){return this;} setAttribute(){return this;} setFromPoints(){return this;} }
class Material {
  constructor(p={}){ Object.assign(this,p); this.userData={};
    this.emissive=p.emissive!==undefined?new Color(p.emissive):new Color(0);
    this.color=new Color(p.color??0xffffff); this.emissiveIntensity=p.emissiveIntensity??1; }
  clone(){const m=new Material();Object.assign(m,this);m.userData={};m.emissive=new Color(0);return m;} dispose(){}
}
class Color { constructor(v=0){this.v=v;} set(v){this.v=v;return this;} }
class Mesh extends Obj3D { constructor(g,m){super();this.geometry=g;this.material=m;this.isMesh=true;} }
class Points extends Mesh { constructor(g,m){super(g,m);this.isMesh=false;this.isPoints=true;} }
class Line extends Mesh { constructor(g,m){super(g,m);this.isMesh=false;this.isLine=true;} }
class Shape { moveTo(){} lineTo(){} quadraticCurveTo(){} }
export const FrontSide=0, DoubleSide=2, AdditiveBlending=1, NormalBlending=0, PCFSoftShadowMap=1;
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
export class CatmullRomCurve3 { constructor(p){this.points=p;} }
export class MeshStandardMaterial extends Material {}
export class MeshBasicMaterial extends Material {}
export class PointsMaterial extends Material {}
export class LineBasicMaterial extends Material {}
export class CanvasTexture { constructor(){this.needsUpdate=false;} dispose(){} }
export class DirectionalLight extends Obj3D { constructor(c,i){super();this.color=c;this.intensity=i;this.shadow={mapSize:{set:noop},camera:{}};} }
export class PointLight extends Obj3D { constructor(c,i){super();this.color=c;this.intensity=i;} }
export class HemisphereLight extends Obj3D {}
export class Box3 {
  setFromObject(o){const p=o.position??new Vec3();this.min=new Vec3(p.x-0.2,0,p.z-0.2);this.max=new Vec3(p.x+0.2,1,p.z+0.2);return this;}
  getCenter(t){return (t??new Vec3()).set((this.min.x+this.max.x)/2,(this.min.y+this.max.y)/2,(this.min.z+this.max.z)/2);}
}
export class Matrix4 { identity(){return this;} extractRotation(){return this;} }
`;

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
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d }) };
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  globalThis.window = {};
  globalThis.performance = globalThis.performance ?? { now: () => Date.now() };
}

const IMPORT_RE = /^import\s+[\s\S]*?from\s+["'][^"']+["'];\s*$/gm;
const EXPORT_BLOCK_RE = /^export\s*\{[^}]*\}\s*;\s*$/gm;
const EXPORT_KEYWORD_RE = /^export\s+(?=(const|let|var|function|class|async))/gm;
function strip(src) { return src.replace(IMPORT_RE, "").replace(EXPORT_BLOCK_RE, "").replace(EXPORT_KEYWORD_RE, ""); }

const dir = mkdtempSync(join(tmpdir(), "smartcity-check-"));
writeFileSync(join(dir, "three-mock.mjs"), THREE_STUB);
const parts = MODULES.map((rel) => strip(readFileSync(join(WEBXR, rel), "utf8")));
const harness = `
export const SIMS = [SIM_CHARGE_POINT, SIM_SIGNAL_CABINET, SIM_VALVE_VAULT, SIM_SOLAR_DECK, SIM_SPLICE_NODE,
  SIM_FLIGHT_DECK, SIM_TRACK_ACCESS, SIM_TRIAGE_POINT, SIM_ROBOT_CELL, SIM_CHILLER_PLANT,
  SIM_TOWER_CLIMB, SIM_STEEL_ERECTOR, SIM_CRANE_YARD, SIM_TRENCH_BOX, SIM_BOILER_ROOM,
  SIM_ELEVATOR_PIT, SIM_ABATEMENT_CHAMBER, SIM_RIGGING_LOFT, SIM_LINE_TRUCK, SIM_DOCK_CRANE,
  SIM_HUNTERS_POINT, SIM_AIR_MONITOR, SIM_SAMPLING_WELL,
  SIM_PRESS_BRAKE, SIM_DECON_LINE, SIM_STAGE_POWER, SIM_CONTAINER_LASHING,
  SIM_LIFT_STATION, SIM_MOORING_LINE, SIM_CHAIN_HOIST, SIM_CONVEYOR_GUARD, SIM_CELL_SITE_BATTERY,
  SIM_SUBSTATION_SWITCHING, SIM_BUS_DEPOT_LIFT, SIM_FIRE_PUMP, SIM_SCAFFOLD_ERECTION, SIM_AERIAL_LADDER, SIM_CHLORINE_ROOM, SIM_FORKLIFT_DOCK, SIM_FLY_SYSTEM, SIM_BUNKERING_WATCH, SIM_MICROWAVE_BACKHAUL, SIM_STORMWATER_OUTFALL, SIM_BATTERY_YARD, SIM_CONFINED_RESCUE, SIM_AIRPORT_RAMP, SIM_COOLING_TOWER];
export { Session, Progress, Sfx, THREE };
`;
writeFileSync(join(dir, "suite.mjs"), `import * as THREE from "./three-mock.mjs";\n\n${parts.join("\n\n")}\n\n${harness}`);

installDomStubs();
const suite = await import(pathToFileURL(join(dir, "suite.mjs")).href);
suite.Sfx.muted = true;

let failures = 0;
const fail = (id, msg) => { failures++; console.log(`  ✗ [${id}] ${msg}`); };

console.log(`SmartCiti.X — content check (${suite.SIMS.length} simulators)\n`);

for (const sim of suite.SIMS) {
  const root = new suite.THREE.Group();
  let api;
  try { api = sim.build(root); }
  catch (err) { fail(sim.id, `build() threw: ${err.message}`); continue; }

  for (const step of sim.steps) {
    const ids = step.kind === "sequence" || step.kind === "find" ? step.targets : [step.target];
    for (const id of ids) {
      if (!id) { fail(sim.id, `step "${step.id}" has no target`); continue; }
      if (!api.hits[id]) fail(sim.id, `step "${step.id}" targets missing interactable "${id}"`);
    }
    if (!step.why || step.why.length < 20) fail(sim.id, `step "${step.id}" has no real rationale`);
    if (!step.cue) fail(sim.id, `step "${step.id}" has no cue`);
    if (step.kind === "gauge" && !step.gauge) fail(sim.id, `gauge step "${step.id}" has no gauge config`);
    if ((step.kind === "hold" || step.kind === "track") && !(step.seconds > 0)) fail(sim.id, `timed step "${step.id}" has no duration`);
    if (step.kind === "turn" && !(step.turn?.turns > 0)) fail(sim.id, `turn step "${step.id}" has no turns amount`);
    if (step.kind === "drag") {
      if (!step.drag?.to) fail(sim.id, `drag step "${step.id}" has no drop socket`);
      else if (!api.hits[step.drag.to]) fail(sim.id, `drag step "${step.id}" socket "${step.drag.to}" has no object in the station`);
    }
  }

  for (const id of Object.keys(sim.hazards ?? {})) {
    if (!api.hits[id]) fail(sim.id, `hazard "${id}" has no object in the station`);
    if ((sim.hazards[id] ?? "").length < 40) fail(sim.id, `hazard "${id}" explanation is too thin`);
  }
  if (sim.weather !== undefined && !["clear", "overcast", "rain", "fog", "wind", "storm"].includes(sim.weather)) {
    fail(sim.id, `weather "${sim.weather}" is not one of clear/overcast/rain/fog/wind/storm`);
  }
  for (const [id, note] of Object.entries(sim.lateNotes ?? {})) {
    if (!api.hits[id]) fail(sim.id, `lateNote "${id}" has no object in the station`);
    const owned = sim.steps.some((s) => s.target === id || s.targets?.includes(id));
    if (!owned) fail(sim.id, `lateNote "${id}" is not a target of any step`);
    if ((note ?? "").length < 30) fail(sim.id, `lateNote "${id}" is too thin`);
  }
  if (!sim.game?.system) fail(sim.id, "missing its own gamified system name");
  if (!sim.game?.ranks?.length) fail(sim.id, "missing a rank ladder");
  if (!sim.title?.startsWith("SmartCiti.X~")) fail(sim.id, `title "${sim.title}" does not follow the SmartCiti.X~ naming convention`);

  const session = new suite.Session(sim, {
    onStep: (step, s) => api.onStep?.(step, s),
    onStepComplete: (step, s) => api.onStepComplete?.(step, s),
    onFeedback: (fb, s) => api.onFeedback?.(fb, s),
    onHazard: (id, s) => api.onHazard?.(id, s),
  });
  session.start();

  let guard = 0;
  while (!session.finished && guard++ < 500) {
    const step = session.step;
    if (!step) break;
    if (step.kind === "select") session.select(step.target);
    else if (step.kind === "sequence" || step.kind === "find") for (const id of step.targets) session.select(id);
    else if (step.kind === "gauge") {
      const [lo, hi] = step.gauge.green ?? [0.44, 0.62];
      session.gauge.t = (lo + hi) / 2;
      session.select(step.target);
    } else if (step.kind === "hold") {
      session.setHolding(true);
      for (let i = 0; i < step.seconds * 20 + 4 && !session.finished && session.step === step; i++) session.tick(0.05);
    } else if (step.kind === "track") {
      session.setHolding(true);
      const [lo, hi] = step.track?.green ?? [0.42, 0.62];
      session.track = { v: (lo + hi) / 2, green: [lo, hi], rise: 0, fall: 0, drift: 0, wobble: 0, inBand: 0, dropouts: 0, wasIn: true };
      for (let i = 0; i < (step.seconds ?? 5) * 20 + 4 && !session.finished && session.step === step; i++) session.tick(0.05);
    } else if (step.kind === "turn") {
      // A real player drags in small increments; one oversized call exercises
      // the same clamp-to-required path a full drag would, deterministically.
      session.rotate(step.target, (step.turn?.turns ?? 1) + 1);
    } else if (step.kind === "drag") {
      // Distance 0 stands in for "dropped exactly on the socket" — a real
      // player's drag-and-release is a UI concern the checker does not model.
      session.dropAt(step.target, 0);
    }
    try { api.animate?.(guard * 0.05, 0.05, session); }
    catch (err) { fail(sim.id, `animate() threw at step "${step.id}": ${err.message}`); break; }
  }

  if (!session.finished) fail(sim.id, `perfect run did not complete (stalled at step ${session.index + 1}/${sim.steps.length})`);
  else if (session.errors !== 0) fail(sim.id, `perfect run recorded ${session.errors} error(s)`);
  else if (session.score <= 0) fail(sim.id, `perfect run scored ${session.score}`);

  for (const award of [...(sim.game?.badges ?? []), ...(sim.game?.challenges ?? [])]) {
    try { award.test?.(session); }
    catch (err) { fail(sim.id, `award "${award.id}" predicate threw: ${err.message}`); }
  }

  const hazardId = Object.keys(sim.hazards ?? {})[0];
  if (hazardId) {
    const probe = new suite.Session(sim, {});
    probe.start();
    const before = probe.score;
    const fb = probe.wrong(hazardId);
    if (!fb?.hazard) fail(sim.id, `hazard "${hazardId}" did not register as an unsafe action`);
  }

  if (!failures) {
    const rank = suite.Progress.simRank(sim.id, sim.game);
    console.log(`  ✓ ${sim.title.padEnd(38)} ${sim.steps.length} steps · ` +
      `${Object.keys(sim.hazards ?? {}).length} hazards · ${Object.keys(api.hits).length} interactables · ` +
      `${(sim.game.badges?.length ?? 0) + (sim.game.challenges?.length ?? 0)} awards · perfect run ${session.score} pts`);
  } else {
    console.log(`    ${sim.title}: ${sim.steps.length} steps, ${Object.keys(api.hits).length} interactables`);
  }
}

console.log(failures ? `\n${failures} problem(s) found.` : `\nAll ${suite.SIMS.length} simulators pass.`);
process.exit(failures ? 1 : 0);
