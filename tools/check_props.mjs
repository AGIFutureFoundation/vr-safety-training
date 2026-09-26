/**
 * The shared site-dressing prop kit, held to what it declares.
 *
 *     node tools/check_props.mjs            # gate
 *     node tools/check_props.mjs --measure  # print measured counts and footprints
 *
 * WebXR/shared/props.js exports PROPS_BUDGET, naming per builder the mesh
 * count it costs after mergeStatic(), its footprint in metres and the parts a
 * district or a station can animate. This builds every entry headlessly and
 * fails on any of:
 *   - the builder throws;
 *   - more meshes than declared;
 *   - more than 14 AUTHORED meshes (before merge) — the assets brief's ceiling
 *     for a prop, so a district can dress its horizon with dozens of these
 *     without the count running away;
 *   - a footprint that is not the declared one (within 3 % or 6 cm per axis)
 *     or is not centred on the origin;
 *   - a declared part missing from userData.parts, or not in the tree.
 *
 * Same stub and merge accounting as tools/check_fleet.mjs — see that file's
 * header for how a baked group's mesh count is computed without a renderer.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const MEASURE = process.argv.includes("--measure");
const PROP_CEILING = 14;

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
class Euler {
  constructor(){this.x=0;this.y=0;this.z=0;this.order="XYZ";}
  set(x,y,z,order){this.x=x;this.y=y;this.z=z;if(order)this.order=order;return this;}
}
function bbFrom(pts){const mn=[Infinity,Infinity,Infinity],mx=[-Infinity,-Infinity,-Infinity];for(const p of pts)for(let i=0;i<3;i++){mn[i]=Math.min(mn[i],p[i]);mx[i]=Math.max(mx[i],p[i]);}return {mn,mx};}
function corners(bb){const o=[];for(const x of [bb.mn[0],bb.mx[0]])for(const y of [bb.mn[1],bb.mx[1]])for(const z of [bb.mn[2],bb.mx[2]])o.push([x,y,z]);return o;}
function rotPts(pts,axis,a){const c=Math.cos(a),s=Math.sin(a);return pts.map(([x,y,z])=>axis==="x"?[x,y*c-z*s,y*s+z*c]:axis==="y"?[x*c+z*s,y,-x*s+z*c]:[x*c-y*s,x*s+y*c,z]);}
class Geometry {
  constructor(){this.attributes={position:{needsUpdate:false}};this.bb=null;}
  dispose(){} setAttribute(){return this;} setFromPoints(){return this;}
  _xf(f){if(this.bb)this.bb=bbFrom(f(corners(this.bb)));return this;}
  rotateX(a){return this._xf((p)=>rotPts(p,"x",a));} rotateY(a){return this._xf((p)=>rotPts(p,"y",a));} rotateZ(a){return this._xf((p)=>rotPts(p,"z",a));}
  translate(x,y,z){return this._xf((p)=>p.map(([a,b,c])=>[a+x,b+y,c+z]));}
  scale(x,y,z){return this._xf((p)=>p.map(([a,b,c])=>[a*x,b*y,c*z]));}
}
class Material {
  constructor(p={}){ Object.assign(this,p); this.userData={};
    this.emissive=p.emissive!==undefined?new Color(p.emissive):new Color(0);
    this.color=new Color(p.color??0xffffff); this.emissiveIntensity=p.emissiveIntensity??1; }
  clone(){const m=new Material();Object.assign(m,this);m.userData={};m.emissive=new Color(0);return m;} dispose(){}
}
class Color { constructor(v=0){this.v=v;} set(v){this.v=v;return this;} getHex(){return this.v;} }
class Obj3D {
  constructor(){
    this.children=[]; this.parent=null; this.visible=true; this.userData={};
    this.position=new Vec3(); this.rotation=new Euler(); this.scale=new Vec3(1,1,1);
    this.castShadow=false; this.receiveShadow=false; this.name="";
    this.matrixWorld={}; this.renderOrder=0; this.frustumCulled=true; this.layers={test:()=>true};
  }
  add(...cs){for(const c of cs){if(!c)continue;if(c.parent)c.parent.remove(c);c.parent=this;this.children.push(c);}return this;}
  remove(c){const i=this.children.indexOf(c);if(i>=0){this.children.splice(i,1);c.parent=null;}return this;}
  traverse(fn){fn(this);for(const c of this.children)c.traverse(fn);}
  getWorldPosition(t){return (t??new Vec3()).copy(this.position);}
  getWorldScale(t){return (t??new Vec3()).set(1,1,1);}
  getWorldDirection(t){return (t??new Vec3()).set(0,0,-1);}
  lookAt(){return this;} updateProjectionMatrix(){} clone(){return this;}
  _local(pts){
    const s=this.scale, r=this.rotation, p=this.position;
    let out=pts.map(([x,y,z])=>[x*s.x,y*s.y,z*s.z]);
    const seq={XYZ:["z","y","x"],YXZ:["z","x","y"],ZXY:["y","x","z"],ZYX:["x","y","z"],XZY:["y","z","x"],YZX:["x","z","y"]}[r.order]??["z","y","x"];
    for(const ax of seq){const a=r[ax];if(a)out=rotPts(out,ax,a);}
    return out.map(([x,y,z])=>[x+p.x,y+p.y,z+p.z]);
  }
}
class Mesh extends Obj3D { constructor(g,m){super();this.geometry=g;this.material=m;this.isMesh=true;} }
class Points extends Mesh { constructor(g,m){super(g,m);this.isMesh=false;this.isPoints=true;} }
class Line extends Mesh { constructor(g,m){super(g,m);this.isMesh=false;this.isLine=true;} }
class Shape { constructor(){this.pts=[];} moveTo(x,y){this.pts.push([x,y]);} lineTo(x,y){this.pts.push([x,y]);} quadraticCurveTo(a,b,x,y){this.pts.push([a,b],[x,y]);} }
export const FrontSide=0, DoubleSide=2, AdditiveBlending=1, NormalBlending=0, PCFSoftShadowMap=1;
export { Vec2 as Vector2, Vec3 as Vector3, Mesh, Points, Line, Shape, Color };
export class Group extends Obj3D {}
export class Object3D extends Obj3D {}
export class BoxGeometry extends Geometry { constructor(w=1,h=1,d=1){super();this.bb={mn:[-w/2,-h/2,-d/2],mx:[w/2,h/2,d/2]};} }
export class CylinderGeometry extends Geometry { constructor(a=1,b=1,h=1){super();const r=Math.max(a,b);this.bb={mn:[-r,-h/2,-r],mx:[r,h/2,r]};} }
export class SphereGeometry extends Geometry { constructor(r=1){super();this.bb={mn:[-r,-r,-r],mx:[r,r,r]};} }
export class TorusGeometry extends Geometry { constructor(r=1,t=0.4){super();this.bb={mn:[-r-t,-r-t,-t],mx:[r+t,r+t,t]};} }
export class RingGeometry extends Geometry { constructor(i=0.5,o=1){super();this.bb={mn:[-o,-o,0],mx:[o,o,0]};} }
export class PlaneGeometry extends Geometry { constructor(w=1,h=1){super();this.bb={mn:[-w/2,-h/2,0],mx:[w/2,h/2,0]};} }
export class CircleGeometry extends Geometry { constructor(r=1){super();this.bb={mn:[-r,-r,0],mx:[r,r,0]};} }
export class OctahedronGeometry extends Geometry { constructor(r=1){super();this.bb={mn:[-r,-r,-r],mx:[r,r,r]};} }
export class CapsuleGeometry extends Geometry { constructor(r=1,l=1){super();this.bb={mn:[-r,-l/2-r,-r],mx:[r,l/2+r,r]};} }
export class ExtrudeGeometry extends Geometry {
  constructor(shape,o={}){super();const b=o.bevelEnabled?(o.bevelSize??0.1)+(o.bevelOffset??0):0,t=o.bevelEnabled?(o.bevelThickness??0.1):0,d=o.depth??1;
    const xs=shape.pts.map((p)=>p[0]),ys=shape.pts.map((p)=>p[1]);
    this.bb={mn:[Math.min(...xs)-b,Math.min(...ys)-b,-t],mx:[Math.max(...xs)+b,Math.max(...ys)+b,d+t]};}
}
export class LatheGeometry extends Geometry {
  constructor(pts=[]){super();const r=Math.max(...pts.map((p)=>p.x)),ys=pts.map((p)=>p.y);this.bb={mn:[-r,Math.min(...ys),-r],mx:[r,Math.max(...ys),r]};}
}
export class TubeGeometry extends Geometry {
  constructor(curve,steps,rad=0.1){super();const b=bbFrom(curve.points.map((p)=>[p.x,p.y,p.z]));this.bb={mn:b.mn.map((v)=>v-rad),mx:b.mx.map((v)=>v+rad)};}
}
export class BufferGeometry extends Geometry {}
export class BufferAttribute {}
export class Float32BufferAttribute {}
export class CatmullRomCurve3 { constructor(p){this.points=p;} }
export class MeshStandardMaterial extends Material {}
export class MeshBasicMaterial extends Material {}
export class PointsMaterial extends Material {}
export class LineBasicMaterial extends Material {}
export class CanvasTexture { constructor(){this.needsUpdate=false;} dispose(){} }
export class DirectionalLight extends Obj3D { constructor(c,i){super();this.color=c;this.intensity=i;this.shadow={mapSize:{set:noop},camera:{}};} }
export class PointLight extends Obj3D { constructor(c,i){super();this.color=c;this.intensity=i;} }
export class SpotLight extends Obj3D { constructor(c,i){super();this.color=c;this.intensity=i;this.target=new Obj3D();} }
export class HemisphereLight extends Obj3D {}
export class Box3 {
  setFromObject(o){const p=o.position??new Vec3();this.min=new Vec3(p.x-0.2,0,p.z-0.2);this.max=new Vec3(p.x+0.2,1,p.z+0.2);return this;}
  getCenter(t){return (t??new Vec3()).set((this.min.x+this.max.x)/2,(this.min.y+this.max.y)/2,(this.min.z+this.max.z)/2);}
}
export class Matrix4 { identity(){return this;} extractRotation(){return this;} }
export function __bounds(root){
  const mn=[Infinity,Infinity,Infinity],mx=[-Infinity,-Infinity,-Infinity];
  root.traverse((o)=>{
    if(!(o.isMesh||o.isPoints||o.isLine)||!o.geometry?.bb)return;
    let pts=corners(o.geometry.bb);
    for(let n=o;n&&n!==root;n=n.parent)pts=n._local(pts);
    for(const p of pts)for(let i=0;i<3;i++){mn[i]=Math.min(mn[i],p[i]);mx[i]=Math.max(mx[i],p[i]);}
  });
  return {mn,mx};
}
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
  globalThis.window = globalThis.window ?? {};
}

const IMPORT_RE = /^import\s+[\s\S]*?from\s+["'][^"']+["'];\s*$/gm;
const EXPORT_BLOCK_RE = /^export\s*\{[^}]*\}\s*;\s*$/gm;
const EXPORT_KEYWORD_RE = /^export\s+(?=(const|let|var|function|class|async))/gm;
const strip = (src) => src.replace(IMPORT_RE, "").replace(EXPORT_BLOCK_RE, "").replace(EXPORT_KEYWORD_RE, "");

if (!existsSync(join(WEBXR, "shared/props.js"))) { console.log("  ✗ shared/props.js is missing\n\n1 prop kit problem(s)."); process.exit(1); }

installDomStubs();
const dir = mkdtempSync(join(tmpdir(), "props-"));
process.on("exit", () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* scratch folder; best effort */ } });
writeFileSync(join(dir, "three-mock.mjs"), THREE_STUB);
// shared/props.js reuses shared/fleet.js's rig/bake/paint helpers (flRig,
// flDone, flLivery, the canvas-material cache…), so both go in behind the
// stub, fleet.js first since props.js's stripped imports must resolve
// against definitions already in scope.
const parts = ["shared/kit.js", "shared/fleet.js", "shared/props.js"].map((rel) => strip(readFileSync(join(WEBXR, rel), "utf8")));
writeFileSync(join(dir, "suite.mjs"), `import * as THREE from "./three-mock.mjs";\nimport { __bounds } from "./three-mock.mjs";\n\n${parts.join("\n\n")}\n\nexport { THREE, __bounds, PROPS_BUDGET, PROPS_BUILDERS };`);
const suite = await import(pathToFileURL(join(dir, "suite.mjs")).href);

/** The mesh count mergeStatic() leaves, per baked group — same accounting as check_fleet.mjs. */
function mergedCount(root) {
  const groups = new Map();
  let loose = 0, raw = 0;
  root.traverse((o) => {
    if (o.isPoints || o.isLine) { loose += 1; raw += 1; return; }
    if (!o.isMesh) return;
    raw += 1;
    let anc = o.parent;
    while (anc && !anc.userData?.fleetBake) { if (anc === root) { anc = null; break; } anc = anc.parent; }
    if (!anc) { loose += 1; return; }
    let g = groups.get(anc);
    if (!g) { g = { mats: new Set(), solo: 0 }; groups.set(anc, g); }
    const solo = o.userData?.interactiveId || o.userData?.noMerge || o.userData?.canvas ||
      o.material?.userData?.ownMaterial || Array.isArray(o.material) || !o.geometry?.attributes?.position;
    if (solo) g.solo += 1; else g.mats.add(o.material);
  });
  let merged = loose;
  for (const g of groups.values()) merged += g.mats.size + g.solo;
  return { merged, raw };
}

const r2 = (v) => Math.round(v * 100) / 100;
let failures = 0, total = 0;
const fail = (msg) => { console.log(`  ✗ ${msg}`); failures += 1; };
const table = suite.PROPS_BUDGET, builders = suite.PROPS_BUILDERS;
if (!table || !builders) { fail("shared/props.js: exports PROPS_BUDGET and PROPS_BUILDERS are required"); }
const counts = [];
for (const [key, e] of Object.entries(table ?? {})) {
  total += 1;
  const fn = builders[e.build];
  if (typeof fn !== "function") { fail(`${key}: no builder named "${e.build}"`); continue; }
  const root = new suite.THREE.Group();
  let g;
  try { g = fn(root, 0, 0, 0, { ...(e.opts ?? {}) }); } catch (err) { fail(`${key}: build threw — ${err.message}`); continue; }
  if (!g || !g.isMesh && !g.children) { fail(`${key}: builder returned nothing`); continue; }
  // A second build with a colour/livery and a turn must also succeed — a
  // district passes both when it dresses its own horizon.
  try { fn(new suite.THREE.Group(), 1, 0, -2, { ...(e.opts ?? {}), ry: 0.6, colour: 0x3a6ea5, livery: { colour: "#3a6ea5", fleetName: "TEST SITE", unitNumber: "9" } }); }
  catch (err) { fail(`${key}: build with opts.colour/livery/ry threw — ${err.message}`); }
  const { merged, raw } = mergedCount(g);
  const b = suite.__bounds(g);
  const size = [0, 1, 2].map((i) => b.mx[i] - b.mn[i]);
  const centre = [(b.mn[0] + b.mx[0]) / 2, (b.mn[2] + b.mx[2]) / 2];
  counts.push(`${key} ${merged}`);
  if (MEASURE) { console.log(`${key.padEnd(26)} meshes ${String(merged).padStart(3)} (raw ${raw})  footprint [${size.map(r2).join(", ")}]  min-y ${r2(b.mn[1])}  centre x ${r2(centre[0])} z ${r2(centre[1])}`); }
  if (typeof e.meshes !== "number") fail(`${key}: no declared mesh count`);
  else if (merged > e.meshes) fail(`${key}: ${merged} meshes after merge, declared ${e.meshes}`);
  if (raw > PROP_CEILING) fail(`${key}: ${raw} authored meshes, over the ${PROP_CEILING} the assets brief allows a prop`);
  if (!Array.isArray(e.footprint) || e.footprint.length !== 3) fail(`${key}: footprint must be [width, height, length]`);
  else {
    for (let i = 0; i < 3; i++) {
      const tol = Math.max(0.06, e.footprint[i] * 0.03);
      if (Math.abs(size[i] - e.footprint[i]) > tol) fail(`${key}: ${"WHL"[i]} measures ${r2(size[i])} m, declared ${e.footprint[i]} m`);
    }
    if (Math.abs(centre[0]) > 0.1 + size[0] * 0.03 || Math.abs(centre[1]) > 0.1 + size[2] * 0.03) fail(`${key}: footprint not centred (x ${r2(centre[0])}, z ${r2(centre[1])})`);
    if (b.mn[1] < -0.02 && !e.belowGround) fail(`${key}: geometry below the ground (y ${r2(b.mn[1])})`);
  }
  const ps = g.userData?.parts ?? {};
  const inTree = (o) => { for (let n = o; n; n = n.parent) if (n === g) return true; return false; };
  for (const name of e.parts ?? []) {
    const p = ps[name];
    const list = Array.isArray(p) ? p : p ? [p] : [];
    if (!list.length) fail(`${key}: part "${name}" missing from userData.parts`);
    else if (list.some((o) => !o || typeof o.traverse !== "function" || !inTree(o))) fail(`${key}: part "${name}" is not an object in the builder's tree`);
  }
}
console.log(failures
  ? `\n${failures} prop kit problem(s).`
  : `\nAll ${total} props render headlessly inside their mesh budget, ${PROP_CEILING}-mesh authored ceiling, footprint and parts (shared/props.js).`);
process.exit(failures ? 1 : 0);
