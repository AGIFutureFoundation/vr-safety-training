/**
 * Headless harness shared by the robot trainer: the same stub three.js and
 * DOM the content checkers use, plus the module concatenation that turns the
 * browser ES modules (which import three from a CDN URL) into one Node
 * module. The checkers keep their own copies deliberately — they are the
 * gate and must not depend on anything else; this is for tooling built on
 * top of them.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
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
export class CanvasTexture { constructor(){this.needsUpdate=false;this.userData={};} dispose(){} }
export class Texture { constructor(){this.needsUpdate=false;this.userData={};} dispose(){} }
// A minimal stand-in for the drop-in tile slot (shared/textures.js's
// paintTexture()): load() returns a Texture synchronously, the same shape
// three.js's real loader does, so a headless checker can exercise the
// "external tile" branch without a real image ever loading.
export class TextureLoader { load(url) { const t = new Texture(); t.image = { src: url }; return t; } }
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

const IMPORT_RE = /^(?:import\s+[\s\S]*?from|export\s*\*\s*from)\s+["'][^"']+["'];\s*$/gm;
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
  // The suite folder is scratch: remove it when the process ends, so a day of
  // checker runs does not fill the disk with thousands of copies.
  process.on("exit", () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* best effort */ } });
  writeFileSync(join(dir, "three-mock.mjs"), THREE_STUB);
  const parts = modules.map((rel) => strip(readFileSync(join(WEBXR, rel), "utf8")));
  writeFileSync(join(dir, "suite.mjs"), `import * as THREE from "./three-mock.mjs";\n\n${parts.join("\n\n")}\n\n${harness}`);
  return import(pathToFileURL(join(dir, "suite.mjs")).href);
}

/** The module lists the checkers use, kept in one place for tooling. */
export const SMARTCITY_SIMS = [
  "charge-point", "signal-cabinet", "valve-vault", "solar-deck", "splice-node", "flight-deck", "track-access", "triage-point", "robot-cell", "chiller-plant", "tower-climb", "steel-erector", "crane-yard", "trench-box", "boiler-room", "elevator-pit", "abatement-chamber", "rigging-loft", "line-truck", "dock-crane", "hunters-point", "air-monitor", "sampling-well", "press-brake", "decon-line", "stage-power", "container-lashing", "lift-station", "mooring-line", "chain-hoist", "conveyor-guard", "cell-site-battery", "substation-switching", "bus-depot-lift", "fire-pump", "scaffold-erection", "aerial-ladder", "chlorine-room", "forklift-dock", "fly-system", "bunkering-watch", "microwave-backhaul", "stormwater-outfall", "battery-yard", "confined-rescue", "airport-ramp", "cooling-tower", "concrete-pour", "cnc-cell", "backflow-test", "me-invasive-species-identification-and-reporting", "me-shoreline-debris-and-microplastics-survey", "me-fish-visual-census-and-data-sheet", "me-tidal-marsh-channel-restoration-day", "me-water-column-sampling-from-a-small-boat", "me-eelgrass-seed-collection-and-nursery", "me-oyster-reef-monitoring-and-settlement-tiles", "me-kelp-transect-survey-and-photo-quadrats", "wp-graduation-and-alumni-mentors", "wp-first-paycheck-coaching", "wp-apprenticeship-enrollment-day", "wp-permit-study-and-knowledge-test", "wp-warehouse-ride-along", "wp-employer-meet-and-greet", "wp-mock-interview-and-resume", "wp-intake-and-pathway-planning", "br-benthic-grab-and-invertebrate-sorting", "br-beach-seine-fish-survey-and-handling", "br-restoration-data-qa-and-public-reporting", "br-volunteer-cleanup-day-safety-lead", "br-drone-shoreline-survey", "bb-dribble-moves-and-change-of-pace", "bb-layups-and-finishing-at-the-rim", "bb-final-possession-decision-under-pressure", "bb-coach-feedback-and-growth-mindset", "bb-teammate-conflict-and-accountability", "bb-composure-with-a-hostile-crowd-and-officials", "br-vhf-and-navigation-in-a-work-zone", "br-cold-water-immersion-and-mob-recovery", "cs-non-entry-retrieval-and-tripod", "cs-ventilation-and-air-monitoring-plan", "cs-permit-entry-and-attendant-duties", "hw-flatwork-ironer-and-folder-guarding", "hw-banquet-room-flip-and-staging", "hw-housekeeping-cart-and-chemical-safety", "battery-storage-container-commissioning", "bus-yard-fuelling-and-brake-check", "drum-sampling-and-overpack", "leading-edge-and-horizontal-lifeline", "stage-load-in-and-truss-rigging", "vessel-gangway-and-hatch-cover-safety", "manhole-entry-and-atmospheric-monitoring", "mw-diver-emergency-and-recovery", "mw-underwater-welding-and-cutting", "mw-hull-inspection-and-cleaning-dive", "mw-pier-pile-inspection-dive", "mw-dive-supervisor-and-dive-plan", "mw-oil-transfer-watch-and-boom", "mw-workboat-towing-and-line-handling", "mw-ferry-deckhand-and-passenger-safety", "gg-pile-driver-fender-repair", "gg-fog-and-wind-work-stop", "gg-international-orange-recoat", "gg-paint-containment-on-the-deck", "gg-deck-lane-closure-and-traveller", "gg-suspender-rope-replacement", "gg-main-cable-band-inspection", "gg-tower-climb-and-tie-off", "pt-chassis-and-genset-yard", "pt-stormwater-at-the-terminal", "pt-terminal-lighting-mast-service", "pt-dock-fender-and-bollard-inspection", "pt-reefer-plug-and-power-panel", "pt-straddle-carrier-hydraulics", "pt-crane-boom-hoist-brake-service", "pt-spreader-and-twistlock-inspection", "sm-kitchen-exhaust-and-fire-wrap", "sm-air-balancing-and-testing", "sm-architectural-panels-at-height", "sm-duct-hanging-and-seismic-bracing", "sm-tig-and-spot-welding", "sm-plasma-table-and-fume", "sm-duct-fabrication-and-seams", "sm-shop-layout-and-shear", "tdl-cargo-securement-and-hours", "tdl-backing-and-docking", "tdl-coupling-and-uncoupling", "tdl-air-brake-test", "tdl-pretrip-inspection", "tdl-lifting-and-ergonomics", "tdl-hazmat-labeling-and-segregation", "tdl-trailer-loading-and-dock-plate", "tdl-pick-pack-and-scan", "tdl-pallet-jack-and-racking", "emergency-savings-and-predatory-lending", "budget-with-irregular-income", "pay-stub-and-withholding", "debt-reduction-plan", "credit-report-reading", "first-period-evaluation", "union-hall-and-dispatch", "jobsite-orientation-and-osha-10", "apprenticeship-application-and-test", "apprenticeship-standards-reading", "who-after-action-review", "who-safe-and-dignified-burial", "who-risk-communication-and-community-engagement", "who-vaccination-line", "who-water-sanitation-and-hygiene", "who-treatment-centre-triage", "who-contact-tracing-visit", "who-isolation-ward-setup", "who-ppe-donning-and-doffing", "who-surveillance-and-case-definition", "pm-storage-and-bike-room", "pm-playground-and-courtyard", "pm-landscaping-and-irrigation", "pm-loading-dock-and-moves", "pm-mail-and-package-room", "pm-community-room-and-events", "pm-fitness-room-and-gym", "pm-pool-and-spa-chemistry", "pm-laundry-room", "pm-domestic-water-and-backflow", "mentorship-and-succession", "conflict-mediation-room", "community-listening-session", "crisis-communication-podium", "ethics-and-conflict-of-interest", "budget-tradeoff-hearing", "coalition-building-table", "constituent-service-desk", "public-meeting-chair", "civic-principles-briefing", "pm-electrical-room", "pm-roof-and-drains", "pm-parking-garage", "pm-elevator-machine-room", "pm-sprinkler-riser-room", "pm-fire-alarm-panel-room", "pm-trash-and-recycling-room", "pm-unit-turnover", "pm-leasing-office-fair-housing", "pm-lobby-and-front-desk", "wellness-asking-for-help-and-resources", "wellness-substance-use-and-the-job", "wellness-peer-support-conversation", "wellness-shift-work-sleep-and-stress", "trades-lineage-briefing", "teledentistry-and-triage", "special-needs-and-geriatric-dentistry", "denture-delivery-and-adjustment", "endodontic-assisting", "implant-surgery-assisting", "school-screening-outreach", "infection-control-audit", "front-office-treatment-coordination", "oral-surgery-assisting", "orthodontic-assisting", "dental-lab-bench", "sterilisation-technician-cycle", "dental-radiography-fmx", "four-handed-dentistry", "dental-careers-pathway", "ambulance-scene-safety", "overdose-response-naloxone", "cardiac-arrest-pit-crew", "traffic-incident-management", "critical-incident-debrief", "crisis-intervention-call", "home-visit-safety", "crisis-line-shift", "trauma-informed-intake", "wildland-urban-interface", "firefighter-rehab-sector", "structure-fire-sizeup", "psychological-first-aid", "damage-assessment-team", "shelter-intake-operations", "deck-joint-replacement", "bridge-lead-containment", "bridge-cable-inspection", "banquet-setup-lift", "laundry-plant-chemicals", "housekeeping-room-turn", "masonry-silica-scaffold", "mass-timber-panel-set", "formwork-shoring", "hazmat-container-inspection", "straddle-carrier-ops", "reefer-yard-monitoring", "temporary-site-power", "arc-flash-label-study", "motor-control-center", "discharge-photo-doc", "shoreline-sediment-grab", "garden-soil-screen", "community-soil-split", "industrial-press-steam", "hem-and-buttonhole", "pattern-marking-layout", "shelter-in-place-drill", "youth-patrol-training", "public-comment-prep", "dust-plan-review", "met-station-siting", "haul-route-observation", "fenceline-dust-monitor", "odor-complaint-log", "air-network-data-qa", "sensor-colocation-check", "air-sensor-install", "decon-support-laborer", "hazwoper-site-orientation", "abatement-perimeter-awareness", "garment-inspection-finish", "alteration-repair-ticket", "sewing-ergonomics-shift", "cutting-table-rotary", "serger-overlock", "lockstitch-seam-guard", "machine-threading-needle", "retest-witnessing", "parcel-status-walk", "rad-meter-basics", "smoke-day-outreach", "results-return-visit", "sample-kit-shipping", "biomonitoring-consent", "can-we-live-story", "rbs-service-capstone", "wvpp-panic-button", "tip-pool-labor", "draught-line-cleaning", "ice-well-breakage", "keg-cellar-co2", "last-call-lockup", "allergen-cocktail", "till-drop-robbery", "patron-deescalation", "spiked-drink-response", "cutoff-overservice", "jigger-pour-spec", "id-check-underage", "bar-well-setup", "oral-cancer-screening", "pediatric-visit", "mobile-dental-outreach", "periodontal-charting", "radiograph-safety", "patient-intake-screening", "fluoride-and-sealants", "aerosol-management", "ultrasonic-scaling", "kitchen-gas-shutoff", "hood-suppression", "fryer-oil-change", "bakery-mixer", "slicer-lockout", "knife-skills", "prep-cooling", "receiving-dock-food", "walk-in-cooler", "allergen-control", "grease-trap", "dish-pit", "sharps-exposure-response", "instrument-reprocessing", "operatory-turnover", "mobile-air-lab", "opacity-reading", "marsh-transect-survey", "oyster-reef-monitoring", "grill-line-burns", "cafeteria-serving", "banquet-hot-hold", "amalgam-waste-handling", "chairside-emergency", "nitrous-oxide-monitoring", "spartina-removal", "ballast-water-sampling", "haul-road-dust", "building-rad-scan", "isco-injection", "ust-removal", "spill-boom-deploy", "shore-power-hookup", "bioswale-build", "creosote-pile-removal", "transite-pipe-removal", "pcb-equipment-removal", "eelgrass-transplant", "sediment-cap", "well-install", "vapor-mitigation", "soil-loadout", "rad-survey", "dredge-barge", "living-shoreline", "tide-gate", "pump-and-treat", "broadcast-truck", "bridge-blast", "cath-lab", "gas-leak-survey", "pilot-transfer", "stack-test", "arena-rigging", "tank-lining", "ev-extrication", "aerial-lashing", "rcl-switching", "hot-tap", "landfill-gas", "grain-bin", "shipyard-hotwork", "post-tension", "pyro-cue", "ammonia-plant", "hazmat-entry", "mast-climber", "data-hall", "digester-gas", "wind-nacelle", "transformer-vault", "drive-light-vehicle-fleet-and-forklift-course", "drive-backing-serpentine-and-alley-dock", "drive-night-fog-and-rail-crossing", "drive-mountain-grade-and-engine-brake", "drive-freeway-merge-and-following-distance", "drive-city-route-and-turns", "bb-scrimmage-and-sportsmanship-debrief", "bb-team-offense-spacing-and-screens", "bb-rebounding-and-boxing-out", "bb-defensive-stance-and-closeouts", "bb-free-throw-routine", "bb-shooting-form-and-arc", "bb-passing-and-catching", "bb-footwork-pivots-and-jump-stops", "bb-stance-and-ball-handling", "bb-warmup-injury-prevention-and-hydration", "cv-difficult-conversation-across-difference", "cv-grant-application-and-nonprofit-compliance", "cv-restorative-justice-circle-facilitation", "cv-neighborhood-emergency-block-captain", "cv-voter-registration-drive-and-nonpartisan-conduct", "cv-open-meeting-law-and-agenda-notice", "dn-public-health-dentistry-and-fluoridation-advocacy", "dn-dental-coding-billing-and-preauthorisation", "dn-oral-hygiene-instruction-and-motivational-interviewing", "dn-medical-history-and-medication-review", "dn-dental-trauma-and-avulsed-tooth-response", "dn-digital-intraoral-scanning-and-cad-cam", "bt-masonry-wall-layout-and-mortar", "bt-rebar-tying-and-impalement-protection", "bt-formwork-stripping-and-reshoring", "bs-bearing-replacement-and-jacking", "bs-tandem-lift-girder-set", "bs-structural-bolting-and-torque", "br-dive-tender-and-umbilical-management", "br-hyperbaric-chamber-standby", "br-derelict-gear-recovery-dive", "br-underwater-sediment-core-sampling", "br-underwater-debris-survey-and-mapping", "br-surface-supplied-dive-station-setup", "br-dive-site-hazard-assessment-and-jsa", "br-barge-loading-of-contaminated-sediment", "br-boom-towing-between-two-vessels", "br-debris-skimmer-vessel-operations", "br-workboat-crane-lift-from-water", "br-derelict-vessel-salvage-rigging", "br-dredge-material-screening-and-disposal-decision", "br-trash-capture-device-service", "br-legacy-mercury-and-pcb-hotspot-handling", "br-water-quality-sonde-calibration-and-deploy", "br-sediment-chain-of-custody-and-lab-prep", "br-turbidity-curtain-deployment", "br-dredge-spoils-dewatering-pad", "hz-level-b-entry-and-scba-change-out", "le-crowd-barricade-and-show-stop-call", "le-followspot-and-truss-access-at-height", "br-tidal-marsh-grading-amphibious-excavator", "br-fish-screen-maintenance", "br-levee-inspection-and-seepage", "br-intertidal-invasive-removal-by-hand-crew", "br-shoreline-cleanup-sharps-and-hazardous-debris", "br-culvert-retrofit-for-fish-passage", "br-native-planting-and-erosion-mats", "et-ev-fleet-depot-charging-and-arc-flash", "tr-wheelchair-lift-and-securement-on-a-bus", "rl-critical-lift-plan-and-signalperson", "fp-anchor-selection-and-rescue-plan", "po-yard-hostler-and-pedestrian-separation", "po-lashing-gear-inspection-and-tagging", "se-building-automation-alarm-triage", "se-steam-trap-survey-and-condensate-return", "hz-decon-corridor-for-a-mass-casualty-drill", "hz-drum-staging-and-compatibility-segregation", "bb-pre-game-routine-and-visualisation", "bb-reset-routine-after-a-miss", "br-bird-nesting-buffer-and-work-window", "br-marine-mammal-observer-during-pile-driving", "ra-blue-flag-protection-in-the-yard", "ra-locomotive-cab-startup-and-alerter", "ra-crossing-signal-maintenance-and-flagging", "ra-hand-brake-and-securement-on-a-grade", "ra-air-brake-test-and-train-inspection", "ra-switch-inspection-and-lubrication", "ra-tie-and-rail-replacement-with-track-machines", "ra-roadway-worker-protection-and-job-briefing", "op-equipment-daily-walkaround-and-fluids", "op-pile-driving-rig-and-lead-setup", "op-crawler-crane-assembly-and-load-chart", "op-compactor-lift-thickness-and-edge", "op-grader-fine-grade-and-crown", "op-loader-truck-loading-and-blind-spots", "op-dozer-slope-work-and-rollover-protection", "op-excavator-trench-and-utility-locate", "pl-natural-gas-pressure-test-and-leak-check", "pl-water-heater-and-tpr-valve-replacement", "pl-steam-trap-and-condensate-line-repair", "pl-copper-press-and-solder-rough-in", "pl-fire-sprinkler-riser-and-flow-test", "pl-underground-sewer-lateral-and-trench-shoring", "pl-hydronic-boiler-piping-and-hydrotest", "pl-medical-gas-brazing-and-purge", "or-ranch-road-grading-and-culvert", "or-solar-farm-tracker-row-maintenance", "or-wildland-fireline-construction-and-lookout", "or-transmission-line-right-of-way-patrol", "uw-lift-bag-rigging-and-object-recovery", "uw-bridge-pier-scour-survey", "uw-intake-screen-cleaning-with-lockout", "uw-underwater-concrete-and-bag-placement", "uw-pipeline-crossing-inspection-dive", "uw-rov-pre-dive-and-tether-management", "gl-shop-drawing-takeoff-and-field-measure", "gl-aluminium-panel-fabrication-and-brake", "gl-tempered-glass-breakage-and-cleanup", "gl-skylight-glass-replacement-and-fall-protection", "gl-swing-stage-glazing-and-sealant", "gl-glass-handling-cart-and-crane-vacuum-lifter", "gl-storefront-frame-and-glass-set-with-cups", "gl-curtain-wall-unit-setting-from-the-floor", "ew-door-operator-adjustment-and-gap", "ew-elevator-entrapment-and-rescue-with-fire-service", "ew-rope-inspection-and-sheave-wear", "ew-escalator-step-chain-and-comb-plate", "ew-car-top-inspection-station-and-ride", "ew-pit-work-and-buffer-inspection", "ew-machine-room-lockout-and-brake-test", "ew-hoistway-false-car-and-rail-setting", "ib-spray-foam-and-respirator-fit", "ib-hydrostatic-test-and-inspector-witness", "ib-refractory-and-castable-installation", "ib-pressure-vessel-confined-entry-and-hot-work", "ib-boiler-tube-replacement-and-rolling", "ib-asbestos-glovebag-removal-on-a-pipe", "ib-firestop-and-fire-wrap-installation", "ib-mechanical-insulation-pipe-and-jacketing", "cm-cold-weather-curing-and-blankets", "cm-epoxy-floor-coating-and-ventilation", "cm-concrete-saw-cutting-with-water-and-silica-control", "cm-exterior-plaster-scratch-brown-and-finish-coats", "cm-shotcrete-nozzle-and-rebound", "cm-curb-and-gutter-forms-and-finish", "cm-power-trowel-operation-and-guarding", "cm-slab-screed-bull-float-and-trowel", "hc-hazardous-drug-spill-kit-response", "hc-workplace-violence-deescalation-at-the-desk", "hc-code-response-support-and-crash-cart-check", "hc-linen-and-regulated-waste-handling", "hc-dietary-tray-line-and-allergy-flags", "hc-patient-transport-and-safe-handling", "hc-sterile-processing-decontamination-and-assembly", "hc-environmental-services-isolation-room-turnover", "rf-green-roof-and-overburden-placement", "rf-skylight-and-hatch-guarding", "rf-roof-tear-off-and-debris-chute", "rf-below-grade-waterproofing-and-drainage-board", "rf-standing-seam-metal-panel-and-clip", "rf-hot-asphalt-kettle-and-mop", "rf-single-ply-tpo-heat-welding-and-seam-probe", "rf-torch-applied-membrane-and-fire-watch", "ut-night-storm-response-crew-and-portable-generator", "ut-water-treatment-chemical-delivery-unloading", "ut-pe-pipe-fusion-and-squeeze-off", "ut-cathodic-protection-test-station-reading", "ut-gas-meter-set-and-regulator-vent", "ut-service-line-locate-and-hand-dig-near-gas-main", "ut-hydrant-flow-test-and-flushing-with-traffic-control", "ut-water-main-break-emergency-shutdown-and-excavation", "av-lavatory-and-potable-water-separation", "av-borescope-and-tool-control-inventory", "av-hangar-jacking-and-stands", "av-deicing-truck-boom-operations", "av-baggage-belt-loader-and-hold-loading", "av-ground-power-and-static-bonding-before-fuel", "av-pushback-tug-and-towbar-connection", "av-marshalling-and-wingwalker-signals", "tw-pick-to-light-ergonomics-and-rotation", "tw-cold-storage-ppe-and-rotation", "tw-palletizer-cell-fenced-access-permit", "tw-battery-change-and-charging-bay-safety", "tw-dock-leveler-and-trailer-restraint-check", "tw-high-bay-order-picker-fall-protection", "tw-conveyor-jam-clearing-and-loto", "tw-amr-traffic-zone-entry-and-lockout", "ed-boiler-room-filter-change-lockout", "ed-kitchen-receiving-and-warewash-sanitizing", "ed-science-lab-chemical-storage-and-eyewash", "ed-paraeducator-safe-lift-and-transfer", "ed-crossing-guard-intersection-control", "ed-bus-pretrip-and-loading-zone", "ed-playground-equipment-inspection", "ed-custodial-chemical-dilution-and-floor-machine", "gk-greenhouse-nursery-chemical-storage-and-eyewash", "gk-hardscape-paver-base-and-compaction", "gk-storm-cleanup-chipper-and-traffic-control", "gk-sports-field-line-marking-and-goal-anchoring", "gk-greens-mowing-and-hole-changing", "gk-bunker-renovation-and-drainage", "gk-chainsaw-start-and-limbing-on-the-ground", "gk-tree-work-pole-saw-and-drop-zone", "gk-pesticide-and-fertilizer-application-per-the-label", "gk-irrigation-controller-valve-box-and-backflow-check", "gk-string-trimmer-and-blower-ppe-and-bystander-zone", "gk-ride-on-mower-pre-start-and-slope-work", "gr-pharmacy-floral-chemical-handling-and-sds", "gr-ammonia-leak-alarm-response-cold-plant", "gr-meatpacking-line-knife-work-and-ppe-rotation", "gr-checkstand-ergonomics-and-robbery-prevention", "gr-night-stocking-baler-and-compactor-lockout", "gr-produce-receiving-cold-chain-and-pallet-jack", "gr-deli-slicer-sanitation-and-allergen-line", "gr-meat-dept-band-saw-and-grinder-lockout", "ca-fatigue-and-duty-time-self-check", "ca-flight-deck-crew-resource-management", "ca-door-evacuation-drill", "ca-cabin-decompression-and-oxygen-masks", "ca-unruly-passenger-deescalation", "ca-cabin-medical-event-response", "ca-galley-and-cart-safety", "ca-cabin-preflight-safety-check", "mm-conveyor-fire-and-gas-monitoring", "mm-haul-truck-berm", "mm-mine-escapeway-drill", "mm-continuous-miner-face", "mm-paper-machine-dryer", "mm-coke-oven-heat-rotation", "mm-ladle-pour", "mm-hot-strip-mill-stand", "md-newsroom-storm-scene-and-live-truck-mast", "md-theatre-fly-floor-and-quick-change-lane", "md-recording-studio-hearing-conservation-and-load-in", "md-sound-stage-electrical-distribution-and-cable-crossings", "md-location-shoot-traffic-control-and-heat-hydration", "md-camera-dolly-and-crane-track", "md-set-safety-meeting-and-stunt-go-no-go", "ml-parcel-sorter-conveyor-jam-and-loto", "ml-mail-handler-forklift-and-container-dock", "ml-flat-sorter-guarding-and-lockout", "ml-heat-and-cold-stress-on-route", "ml-dog-and-hazard-awareness-on-route", "ml-delivery-van-pretrip-and-route-loading",
];
export const TRADES_ROOMS = ["electrical", "salon", "kitchen", "phlebotomy", "welding", "devops", "plumbing", "pressure-washer", "paint-sprayer"];
const constName = (id) => id.toUpperCase().replace(/-/g, "_");

export async function loadSmartCity() {
  const modules = ["shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js", "shared/equipment.js", "shared/toolkit.js", "shared/game.js", "shared/robot.js", "shared/robot-embodiment.js", "shared/eggs.js", "smartcity/js/citykit.js", "smartcity/js/gamify.js", "shared/props.js",
    ...SMARTCITY_SIMS.map((id) => `smartcity/js/sims/${id}.js`)];
  const harness = `export const ROOMS = [${SMARTCITY_SIMS.map((id) => `SIM_${constName(id)}`).join(", ")}];\nexport { Session, Progress, Sfx, THREE, RobotAgent, runEpisode, calibrate, observe, applyAction, drivePolicy, placeVehicle, DRIVE_CHECKS };\nexport { buildEmbodiment, observeEmbodied, runEmbodiedEpisode, probeSkill, calibrateEmbodied, keepOutZones, stationPoses, stepEmbodiment, poseFor, worldPlacement, actionSpace, observationSchema, DIFFICULTY_LADDER, LICENCE_NOTE, FORCE_CLASSES, isPersonId };`;
  return buildSuite(modules, harness, "smartcity-robot");
}
/**
 * The scene half of incident replay, behind the stub three.js. It lives here
 * rather than being imported directly because it reaches kit.js and through
 * it the CDN three.js a Node import cannot resolve. shared/incidents.js
 * itself is pure and imports fine. See WebXR/shared/incident-stage.js.
 */
export async function loadIncidentStage() {
  return buildSuite(["shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/incident-stage.js"],
    `export { stageReplay };`, "incident-stage");
}
export async function loadTrades() {
  const modules = ["shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js", "shared/equipment.js", "shared/toolkit.js", "shared/game.js", "shared/robot.js", "shared/robot-embodiment.js", "shared/eggs.js", "trades/js/shopfit.js",
    ...TRADES_ROOMS.map((id) => `trades/js/rooms/${id}.js`)];
  const harness = `export const ROOMS = [${TRADES_ROOMS.map((id) => `ROOM_${constName(id)}`).join(", ")}];\nexport { Session, Progress, Sfx, THREE, RobotAgent, runEpisode, calibrate, observe, applyAction, drivePolicy, placeVehicle, DRIVE_CHECKS };\nexport { buildEmbodiment, observeEmbodied, runEmbodiedEpisode, probeSkill, calibrateEmbodied, keepOutZones, stationPoses, stepEmbodiment, poseFor, worldPlacement, actionSpace, observationSchema, DIFFICULTY_LADDER, LICENCE_NOTE, FORCE_CLASSES, isPersonId };`;
  return buildSuite(modules, harness, "trades-robot");
}
