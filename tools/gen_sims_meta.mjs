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
  "smartcity/js/sims/confined-rescue.js", "smartcity/js/sims/airport-ramp.js", "smartcity/js/sims/cooling-tower.js",
  "smartcity/js/sims/concrete-pour.js", "smartcity/js/sims/cnc-cell.js", "smartcity/js/sims/backflow-test.js",
  "smartcity/js/sims/transformer-vault.js",
  "smartcity/js/sims/wind-nacelle.js",
  "smartcity/js/sims/digester-gas.js",
  "smartcity/js/sims/data-hall.js",
  "smartcity/js/sims/mast-climber.js",
  "smartcity/js/sims/hazmat-entry.js",
  "smartcity/js/sims/ammonia-plant.js",
  "smartcity/js/sims/pyro-cue.js",
  "smartcity/js/sims/post-tension.js",
  "smartcity/js/sims/shipyard-hotwork.js",
  "smartcity/js/sims/grain-bin.js",
  "smartcity/js/sims/landfill-gas.js",
  "smartcity/js/sims/hot-tap.js",
  "smartcity/js/sims/rcl-switching.js",
  "smartcity/js/sims/aerial-lashing.js",
  "smartcity/js/sims/ev-extrication.js",
  "smartcity/js/sims/tank-lining.js",
  "smartcity/js/sims/arena-rigging.js",
  "smartcity/js/sims/stack-test.js",
  "smartcity/js/sims/pilot-transfer.js",
  "smartcity/js/sims/gas-leak-survey.js",
  "smartcity/js/sims/cath-lab.js",
  "smartcity/js/sims/bridge-blast.js",
  "smartcity/js/sims/broadcast-truck.js",
  "smartcity/js/sims/pump-and-treat.js",
  "smartcity/js/sims/tide-gate.js",
  "smartcity/js/sims/living-shoreline.js",
  "smartcity/js/sims/dredge-barge.js",
  "smartcity/js/sims/rad-survey.js",
  "smartcity/js/sims/soil-loadout.js",
  "smartcity/js/sims/vapor-mitigation.js",
  "smartcity/js/sims/well-install.js",
  "smartcity/js/sims/sediment-cap.js",
  "smartcity/js/sims/eelgrass-transplant.js",
  "smartcity/js/sims/pcb-equipment-removal.js",
  "smartcity/js/sims/transite-pipe-removal.js",
  "smartcity/js/sims/creosote-pile-removal.js",
  "smartcity/js/sims/bioswale-build.js",
  "smartcity/js/sims/shore-power-hookup.js",
  "smartcity/js/sims/spill-boom-deploy.js",
  "smartcity/js/sims/ust-removal.js",
  "smartcity/js/sims/isco-injection.js",
  "smartcity/js/sims/building-rad-scan.js",
  "smartcity/js/sims/haul-road-dust.js",
  "smartcity/js/sims/ballast-water-sampling.js",
  "smartcity/js/sims/spartina-removal.js",
  "smartcity/js/sims/nitrous-oxide-monitoring.js",
  "smartcity/js/sims/chairside-emergency.js",
  "smartcity/js/sims/amalgam-waste-handling.js",
  "smartcity/js/sims/banquet-hot-hold.js",
  "smartcity/js/sims/cafeteria-serving.js",
  "smartcity/js/sims/grill-line-burns.js",
  "smartcity/js/sims/oyster-reef-monitoring.js",
  "smartcity/js/sims/marsh-transect-survey.js",
  "smartcity/js/sims/opacity-reading.js",
  "smartcity/js/sims/mobile-air-lab.js",
  "smartcity/js/sims/operatory-turnover.js",
  "smartcity/js/sims/instrument-reprocessing.js",
  "smartcity/js/sims/sharps-exposure-response.js",
  "smartcity/js/sims/dish-pit.js",
  "smartcity/js/sims/grease-trap.js",
  "smartcity/js/sims/allergen-control.js",
  "smartcity/js/sims/walk-in-cooler.js",
  "smartcity/js/sims/receiving-dock-food.js",
  "smartcity/js/sims/prep-cooling.js",
  "smartcity/js/sims/knife-skills.js",
  "smartcity/js/sims/slicer-lockout.js",
  "smartcity/js/sims/bakery-mixer.js",
  "smartcity/js/sims/fryer-oil-change.js",
  "smartcity/js/sims/hood-suppression.js",
  "smartcity/js/sims/kitchen-gas-shutoff.js",
  "smartcity/js/sims/ultrasonic-scaling.js",
  "smartcity/js/sims/aerosol-management.js",
  "smartcity/js/sims/fluoride-and-sealants.js",
  "smartcity/js/sims/patient-intake-screening.js",
  "smartcity/js/sims/radiograph-safety.js",
  "smartcity/js/sims/periodontal-charting.js",
  "smartcity/js/sims/mobile-dental-outreach.js",
  "smartcity/js/sims/pediatric-visit.js",
  "smartcity/js/sims/oral-cancer-screening.js",
  "smartcity/js/sims/bar-well-setup.js",
  "smartcity/js/sims/id-check-underage.js",
  "smartcity/js/sims/jigger-pour-spec.js",
  "smartcity/js/sims/cutoff-overservice.js",
  "smartcity/js/sims/spiked-drink-response.js",
  "smartcity/js/sims/patron-deescalation.js",
  "smartcity/js/sims/till-drop-robbery.js",
  "smartcity/js/sims/allergen-cocktail.js",
  "smartcity/js/sims/last-call-lockup.js",
  "smartcity/js/sims/keg-cellar-co2.js",
  "smartcity/js/sims/ice-well-breakage.js",
  "smartcity/js/sims/draught-line-cleaning.js",
  "smartcity/js/sims/tip-pool-labor.js",
  "smartcity/js/sims/wvpp-panic-button.js",
  "smartcity/js/sims/rbs-service-capstone.js",
  "smartcity/js/sims/can-we-live-story.js",
  "smartcity/js/sims/biomonitoring-consent.js",
  "smartcity/js/sims/sample-kit-shipping.js",
  "smartcity/js/sims/results-return-visit.js",
  "smartcity/js/sims/smoke-day-outreach.js",
  "smartcity/js/sims/rad-meter-basics.js",
  "smartcity/js/sims/parcel-status-walk.js",
  "smartcity/js/sims/retest-witnessing.js",
  "smartcity/js/sims/machine-threading-needle.js",
  "smartcity/js/sims/lockstitch-seam-guard.js",
  "smartcity/js/sims/serger-overlock.js",
  "smartcity/js/sims/cutting-table-rotary.js",
  "smartcity/js/sims/sewing-ergonomics-shift.js",
  "smartcity/js/sims/alteration-repair-ticket.js",
  "smartcity/js/sims/garment-inspection-finish.js",
  "smartcity/js/sims/abatement-perimeter-awareness.js",
  "smartcity/js/sims/hazwoper-site-orientation.js",
  "smartcity/js/sims/decon-support-laborer.js",
  "smartcity/js/sims/air-sensor-install.js",
  "smartcity/js/sims/sensor-colocation-check.js",
  "smartcity/js/sims/air-network-data-qa.js",
  "smartcity/js/sims/odor-complaint-log.js",
  "smartcity/js/sims/fenceline-dust-monitor.js",
  "smartcity/js/sims/haul-route-observation.js",
  "smartcity/js/sims/met-station-siting.js",
  "smartcity/js/sims/dust-plan-review.js",
  "smartcity/js/sims/public-comment-prep.js",
  "smartcity/js/sims/youth-patrol-training.js",
  "smartcity/js/sims/shelter-in-place-drill.js",
  "smartcity/js/sims/pattern-marking-layout.js",
  "smartcity/js/sims/hem-and-buttonhole.js",
  "smartcity/js/sims/industrial-press-steam.js",
  "smartcity/js/sims/community-soil-split.js",
  "smartcity/js/sims/garden-soil-screen.js",
  "smartcity/js/sims/shoreline-sediment-grab.js",
  "smartcity/js/sims/discharge-photo-doc.js",
  "smartcity/js/sims/motor-control-center.js",
  "smartcity/js/sims/arc-flash-label-study.js",
  "smartcity/js/sims/temporary-site-power.js",
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
  SIM_SUBSTATION_SWITCHING, SIM_BUS_DEPOT_LIFT, SIM_FIRE_PUMP, SIM_SCAFFOLD_ERECTION, SIM_AERIAL_LADDER, SIM_CHLORINE_ROOM, SIM_FORKLIFT_DOCK, SIM_FLY_SYSTEM, SIM_BUNKERING_WATCH, SIM_MICROWAVE_BACKHAUL, SIM_STORMWATER_OUTFALL, SIM_BATTERY_YARD, SIM_CONFINED_RESCUE, SIM_AIRPORT_RAMP, SIM_COOLING_TOWER, SIM_CONCRETE_POUR, SIM_CNC_CELL, SIM_BACKFLOW_TEST, SIM_TRANSFORMER_VAULT, SIM_WIND_NACELLE, SIM_DIGESTER_GAS, SIM_DATA_HALL, SIM_MAST_CLIMBER, SIM_HAZMAT_ENTRY, SIM_AMMONIA_PLANT, SIM_PYRO_CUE, SIM_POST_TENSION, SIM_SHIPYARD_HOTWORK, SIM_GRAIN_BIN, SIM_LANDFILL_GAS, SIM_HOT_TAP, SIM_RCL_SWITCHING, SIM_AERIAL_LASHING, SIM_EV_EXTRICATION, SIM_TANK_LINING, SIM_ARENA_RIGGING, SIM_STACK_TEST, SIM_PILOT_TRANSFER, SIM_GAS_LEAK_SURVEY, SIM_CATH_LAB, SIM_BRIDGE_BLAST, SIM_BROADCAST_TRUCK, SIM_PUMP_AND_TREAT, SIM_TIDE_GATE, SIM_LIVING_SHORELINE, SIM_DREDGE_BARGE, SIM_RAD_SURVEY, SIM_SOIL_LOADOUT, SIM_VAPOR_MITIGATION, SIM_WELL_INSTALL, SIM_SEDIMENT_CAP, SIM_EELGRASS_TRANSPLANT, SIM_PCB_EQUIPMENT_REMOVAL, SIM_TRANSITE_PIPE_REMOVAL, SIM_CREOSOTE_PILE_REMOVAL, SIM_BIOSWALE_BUILD, SIM_SHORE_POWER_HOOKUP, SIM_SPILL_BOOM_DEPLOY, SIM_UST_REMOVAL, SIM_ISCO_INJECTION, SIM_BUILDING_RAD_SCAN, SIM_HAUL_ROAD_DUST, SIM_BALLAST_WATER_SAMPLING, SIM_SPARTINA_REMOVAL, SIM_NITROUS_OXIDE_MONITORING, SIM_CHAIRSIDE_EMERGENCY, SIM_AMALGAM_WASTE_HANDLING, SIM_BANQUET_HOT_HOLD, SIM_CAFETERIA_SERVING, SIM_GRILL_LINE_BURNS, SIM_OYSTER_REEF_MONITORING, SIM_MARSH_TRANSECT_SURVEY, SIM_OPACITY_READING, SIM_MOBILE_AIR_LAB, SIM_OPERATORY_TURNOVER, SIM_INSTRUMENT_REPROCESSING, SIM_SHARPS_EXPOSURE_RESPONSE, SIM_DISH_PIT, SIM_GREASE_TRAP, SIM_ALLERGEN_CONTROL, SIM_WALK_IN_COOLER, SIM_RECEIVING_DOCK_FOOD, SIM_PREP_COOLING, SIM_KNIFE_SKILLS, SIM_SLICER_LOCKOUT, SIM_BAKERY_MIXER, SIM_FRYER_OIL_CHANGE, SIM_HOOD_SUPPRESSION, SIM_KITCHEN_GAS_SHUTOFF, SIM_ULTRASONIC_SCALING, SIM_AEROSOL_MANAGEMENT, SIM_FLUORIDE_AND_SEALANTS, SIM_PATIENT_INTAKE_SCREENING, SIM_RADIOGRAPH_SAFETY, SIM_PERIODONTAL_CHARTING, SIM_MOBILE_DENTAL_OUTREACH, SIM_PEDIATRIC_VISIT, SIM_ORAL_CANCER_SCREENING, SIM_BAR_WELL_SETUP, SIM_ID_CHECK_UNDERAGE, SIM_JIGGER_POUR_SPEC, SIM_CUTOFF_OVERSERVICE, SIM_SPIKED_DRINK_RESPONSE, SIM_PATRON_DEESCALATION, SIM_TILL_DROP_ROBBERY, SIM_ALLERGEN_COCKTAIL, SIM_LAST_CALL_LOCKUP, SIM_KEG_CELLAR_CO2, SIM_ICE_WELL_BREAKAGE, SIM_DRAUGHT_LINE_CLEANING, SIM_TIP_POOL_LABOR, SIM_WVPP_PANIC_BUTTON, SIM_RBS_SERVICE_CAPSTONE, SIM_CAN_WE_LIVE_STORY, SIM_BIOMONITORING_CONSENT, SIM_SAMPLE_KIT_SHIPPING, SIM_RESULTS_RETURN_VISIT, SIM_SMOKE_DAY_OUTREACH, SIM_RAD_METER_BASICS, SIM_PARCEL_STATUS_WALK, SIM_RETEST_WITNESSING, SIM_MACHINE_THREADING_NEEDLE, SIM_LOCKSTITCH_SEAM_GUARD, SIM_SERGER_OVERLOCK, SIM_CUTTING_TABLE_ROTARY, SIM_SEWING_ERGONOMICS_SHIFT, SIM_ALTERATION_REPAIR_TICKET, SIM_GARMENT_INSPECTION_FINISH, SIM_ABATEMENT_PERIMETER_AWARENESS, SIM_HAZWOPER_SITE_ORIENTATION, SIM_DECON_SUPPORT_LABORER, SIM_AIR_SENSOR_INSTALL, SIM_SENSOR_COLOCATION_CHECK, SIM_AIR_NETWORK_DATA_QA, SIM_ODOR_COMPLAINT_LOG, SIM_FENCELINE_DUST_MONITOR, SIM_HAUL_ROUTE_OBSERVATION, SIM_MET_STATION_SITING, SIM_DUST_PLAN_REVIEW, SIM_PUBLIC_COMMENT_PREP, SIM_YOUTH_PATROL_TRAINING, SIM_SHELTER_IN_PLACE_DRILL, SIM_PATTERN_MARKING_LAYOUT, SIM_HEM_AND_BUTTONHOLE, SIM_INDUSTRIAL_PRESS_STEAM, SIM_COMMUNITY_SOIL_SPLIT, SIM_GARDEN_SOIL_SCREEN, SIM_SHORELINE_SEDIMENT_GRAB, SIM_DISCHARGE_PHOTO_DOC, SIM_MOTOR_CONTROL_CENTER, SIM_ARC_FLASH_LABEL_STUDY, SIM_TEMPORARY_SITE_POWER];
`;
writeFileSync(join(dir, "suite.mjs"), `import * as THREE from "./three-mock.mjs";\n\n${parts.join("\n\n")}\n\n${harness}`);

installDomStubs();
const suite = await import(pathToFileURL(join(dir, "suite.mjs")).href);

const meta = suite.SIMS.map((s) => ({
  id: s.id, index: s.index, domain: s.domain, trade: s.trade,
  category: s.category, certification: s.certification, name: s.name, weather: s.weather ?? "clear", indoor: s.indoor ?? null, district: s.district ?? null,
  title: s.title, tagline: s.tagline, accent: s.accent, accentCss: s.accentCss,
  parSeconds: s.parSeconds, badge: s.badge, stepCount: s.steps.length,
  interruptCount: (s.interrupts ?? []).length,
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
