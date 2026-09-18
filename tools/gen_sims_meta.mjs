/**
 * Generates WebXR/smartcity/js/sims-meta.js — the lightweight per-sim
 * metadata (id, name, tagline, accent, rank ladder, etc.) the hub, the
 * roster and the scenario editor need to render instantly, without pulling
 * in any sim's full `steps`/`build()` content.
 *
 * This exists because SmartCiti.X's 20 sims are lazy-loaded on demand (see
 * tools/bundle_webxr.py and smartcity/js/app.js) — the hub still needs to
 * show all 20 kiosks with real names, taglines and rank/progress before any
 * of them has been fetched. Generating this file from the real sim modules
 * (the same stub-THREE + temp-bundle technique tools/check_smartcity.mjs
 * uses) means it can never silently drift from the content it describes —
 * re-run this whenever a sim's header fields change.
 *
 *     node tools/gen_sims_meta.mjs
 */

import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const OUT = join(WEBXR, "smartcity/js/sims-meta.js");

const SIM_MODULES = [
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
];
const MODULES = ["shared/kit.js", "shared/game.js", "smartcity/js/citykit.js", "smartcity/js/gamify.js", ...SIM_MODULES];

// A trimmed three.js stub — gen_sims_meta only calls each sim's own header
// fields, never build(), so this needs far less than check_smartcity.mjs's.
const THREE_STUB = `
class Vec3 { constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;} set(){return this;} clone(){return this;} }
class Obj3D { constructor(){this.children=[];this.userData={};this.position=new Vec3();} add(){return this;} traverse(){} }
class Material { constructor(p={}){Object.assign(this,p);this.userData={};} clone(){return this;} dispose(){} }
class Color { constructor(v=0){this.v=v;} }
export { Vec3 as Vector3, Obj3D as Group, Obj3D as Object3D, Material as MeshStandardMaterial, Material as MeshBasicMaterial, Color };
export class BoxGeometry {} export class CylinderGeometry {} export class SphereGeometry {} export class TorusGeometry {}
export class RingGeometry {} export class PlaneGeometry {} export class CircleGeometry {} export class OctahedronGeometry {}
export class CapsuleGeometry {} export class ExtrudeGeometry {} export class LatheGeometry {} export class TubeGeometry {}
export class BufferGeometry {} export class BufferAttribute {} export class CatmullRomCurve3 {}
export class CanvasTexture { constructor(){} } export class DirectionalLight extends Obj3D {} export class PointLight extends Obj3D {}
export class HemisphereLight extends Obj3D {} export class Box3 { setFromObject(){return this;} getCenter(){return new Vec3();} }
export class Matrix4 { identity(){return this;} extractRotation(){return this;} }
export const FrontSide=0, DoubleSide=2, AdditiveBlending=1, NormalBlending=0, PCFSoftShadowMap=1;
`;

function installDomStubs() {
  const ctx2d = new Proxy({}, { get: (_t, p) => (p === "measureText" ? () => ({ width: 10 }) : () => {}), set: () => true });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d }) };
  globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  globalThis.window = {};
}

const IMPORT_RE = /^import\s+[\s\S]*?from\s+["'][^"']+["'];\s*$/gm;
const EXPORT_BLOCK_RE = /^export\s*\{[^}]*\}\s*;\s*$/gm;
const EXPORT_KEYWORD_RE = /^export\s+(?=(const|let|var|function|class|async))/gm;
function strip(src) { return src.replace(IMPORT_RE, "").replace(EXPORT_BLOCK_RE, "").replace(EXPORT_KEYWORD_RE, ""); }

const dir = mkdtempSync(join(tmpdir(), "smartcity-meta-"));
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
  SIM_SUBSTATION_SWITCHING, SIM_BUS_DEPOT_LIFT, SIM_FIRE_PUMP, SIM_SCAFFOLD_ERECTION, SIM_AERIAL_LADDER, SIM_CHLORINE_ROOM, SIM_FORKLIFT_DOCK, SIM_FLY_SYSTEM, SIM_BUNKERING_WATCH, SIM_MICROWAVE_BACKHAUL, SIM_STORMWATER_OUTFALL, SIM_BATTERY_YARD];
`;
writeFileSync(join(dir, "suite.mjs"), `import * as THREE from "./three-mock.mjs";\n\n${parts.join("\n\n")}\n\n${harness}`);

installDomStubs();
const suite = await import(pathToFileURL(join(dir, "suite.mjs")).href);

const meta = suite.SIMS.map((s) => ({
  id: s.id, index: s.index, domain: s.domain, trade: s.trade,
  category: s.category, certification: s.certification, name: s.name,
  title: s.title, tagline: s.tagline, accent: s.accent, accentCss: s.accentCss,
  parSeconds: s.parSeconds, badge: s.badge, stepCount: s.steps.length,
  ...(s.flat ? { flat: true, dossier: s.dossier ?? [] } : {}),
  game: { system: s.game.system, currency: s.game.currency, ranks: s.game.ranks, rankAt: s.game.rankAt },
}));

const banner = `/**
 * GENERATED FILE — do not hand-edit. Run \`node tools/gen_sims_meta.mjs\`
 * after changing any sim's header fields (name, tagline, accent, badge,
 * game.ranks, etc.) to regenerate this from the real sim modules.
 *
 * This is the lightweight metadata the hub, the roster and the scenario
 * editor read to render instantly, before a sim's full module (steps,
 * hazards, build()) has been lazy-loaded. See smartcity/js/app.js's
 * loadSim()/findSim() and tools/bundle_webxr.py's smartcity dist layout.
 */
export const SIMS_META = `;

writeFileSync(OUT, banner + JSON.stringify(meta, null, 2) + ";\n");
console.log(`Wrote ${OUT} (${meta.length} sims)`);
