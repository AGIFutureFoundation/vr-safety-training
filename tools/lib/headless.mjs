/**
 * Headless harness shared by the robot trainer: the same stub three.js and
 * DOM the content checkers use, plus the module concatenation that turns the
 * browser ES modules (which import three from a CDN URL) into one Node
 * module. The checkers keep their own copies deliberately — they are the
 * gate and must not depend on anything else; this is for tooling built on
 * top of them.
 */
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const WEBXR = join(ROOT, "WebXR");

export const THREE_STUB = `
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

export function installDomStubs() {
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
  globalThis.sessionStorage = globalThis.sessionStorage ?? { getItem: () => null, setItem() {}, removeItem() {} };
  globalThis.window = globalThis.window ?? {};
  globalThis.performance = globalThis.performance ?? { now: () => Date.now() };
}

const IMPORT_RE = /^import\s+[\s\S]*?from\s+["'][^"']+["'];\s*$/gm;
const EXPORT_BLOCK_RE = /^export\s*\{[^}]*\}\s*;\s*$/gm;
const EXPORT_KEYWORD_RE = /^export\s+(?=(const|let|var|function|class|async))/gm;
export function strip(src) { return src.replace(IMPORT_RE, "").replace(EXPORT_BLOCK_RE, "").replace(EXPORT_KEYWORD_RE, ""); }

/**
 * Concatenate WebXR modules (paths relative to WebXR/) behind the stub
 * three.js, append `harness` (export statements naming what the caller
 * needs) and import the result. Returns the module namespace.
 */
export async function buildSuite(modules, harness, label = "suite") {
  installDomStubs();
  const dir = mkdtempSync(join(tmpdir(), `${label}-`));
  writeFileSync(join(dir, "three-mock.mjs"), THREE_STUB);
  const parts = modules.map((rel) => strip(readFileSync(join(WEBXR, rel), "utf8")));
  writeFileSync(join(dir, "suite.mjs"), `import * as THREE from "./three-mock.mjs";\n\n${parts.join("\n\n")}\n\n${harness}`);
  return import(pathToFileURL(join(dir, "suite.mjs")).href);
}

/** The module lists the checkers use, kept in one place for tooling. */
export const SMARTCITY_SIMS = [
  "charge-point", "signal-cabinet", "valve-vault", "solar-deck", "splice-node", "flight-deck", "track-access",
  "triage-point", "robot-cell", "chiller-plant", "tower-climb", "steel-erector", "crane-yard", "trench-box",
  "boiler-room", "elevator-pit", "abatement-chamber", "rigging-loft", "line-truck", "dock-crane", "hunters-point", "air-monitor", "sampling-well", "press-brake", "decon-line", "stage-power", "container-lashing",
  "lift-station", "mooring-line", "chain-hoist", "conveyor-guard", "cell-site-battery",
  "substation-switching", "bus-depot-lift", "fire-pump", "scaffold-erection", "aerial-ladder", "chlorine-room", "forklift-dock", "fly-system", "bunkering-watch", "microwave-backhaul", "stormwater-outfall", "battery-yard", "confined-rescue", "airport-ramp", "cooling-tower", "concrete-pour", "cnc-cell", "backflow-test", "sharps-exposure-response", "instrument-reprocessing", "operatory-turnover", "mobile-air-lab", "opacity-reading", "marsh-transect-survey", "oyster-reef-monitoring", "grill-line-burns", "cafeteria-serving", "banquet-hot-hold", "amalgam-waste-handling", "chairside-emergency", "nitrous-oxide-monitoring", "spartina-removal", "ballast-water-sampling", "haul-road-dust", "building-rad-scan", "isco-injection", "ust-removal", "spill-boom-deploy", "shore-power-hookup", "bioswale-build", "creosote-pile-removal", "transite-pipe-removal", "pcb-equipment-removal", "eelgrass-transplant", "sediment-cap", "well-install", "vapor-mitigation", "soil-loadout", "rad-survey", "dredge-barge", "living-shoreline", "tide-gate", "pump-and-treat", "broadcast-truck", "bridge-blast", "cath-lab", "gas-leak-survey", "pilot-transfer", "stack-test", "arena-rigging", "tank-lining", "ev-extrication", "aerial-lashing", "rcl-switching", "hot-tap", "landfill-gas", "grain-bin", "shipyard-hotwork", "post-tension", "pyro-cue", "ammonia-plant", "hazmat-entry", "mast-climber", "data-hall", "digester-gas", "wind-nacelle", "transformer-vault",
];
export const TRADES_ROOMS = ["electrical", "salon", "kitchen", "phlebotomy", "welding", "devops", "plumbing", "pressure-washer", "paint-sprayer"];
const constName = (id) => id.toUpperCase().replace(/-/g, "_");

export async function loadSmartCity() {
  const modules = ["shared/kit.js", "shared/game.js", "shared/robot.js", "smartcity/js/citykit.js", "smartcity/js/gamify.js",
    ...SMARTCITY_SIMS.map((id) => `smartcity/js/sims/${id}.js`)];
  const harness = `export const ROOMS = [${SMARTCITY_SIMS.map((id) => `SIM_${constName(id)}`).join(", ")}];\nexport { Session, Progress, Sfx, THREE, RobotAgent, runEpisode, calibrate, observe, applyAction };`;
  return buildSuite(modules, harness, "smartcity-robot");
}
/**
 * The scene half of incident replay, behind the stub three.js. It lives here
 * rather than being imported directly because it reaches kit.js and through
 * it the CDN three.js a Node import cannot resolve. shared/incidents.js
 * itself is pure and imports fine. See WebXR/shared/incident-stage.js.
 */
export async function loadIncidentStage() {
  return buildSuite(["shared/kit.js", "shared/incident-stage.js"],
    `export { stageReplay };`, "incident-stage");
}
export async function loadTrades() {
  const modules = ["shared/kit.js", "shared/game.js", "shared/robot.js", "trades/js/shopfit.js",
    ...TRADES_ROOMS.map((id) => `trades/js/rooms/${id}.js`)];
  const harness = `export const ROOMS = [${TRADES_ROOMS.map((id) => `ROOM_${constName(id)}`).join(", ")}];\nexport { Session, Progress, Sfx, THREE, RobotAgent, runEpisode, calibrate, observe, applyAction };`;
  return buildSuite(modules, harness, "trades-robot");
}
