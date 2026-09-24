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

import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");

// The interior styles a station may declare. Read out of interiors.js rather
// than written down here, because a list kept in two places is a list that
// goes stale — this checker rejected a style that had already shipped.
const INTERIOR_STYLES = (readFileSync(join(WEBXR, "smartcity/js/interiors.js"), "utf8")
  .match(/export const INTERIOR_STYLES = \[([^\]]*)\]/)?.[1] ?? "")
  .split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
if (!INTERIOR_STYLES.length) throw new Error("could not read INTERIOR_STYLES from interiors.js");
// The districts a station may stand in front of, read the same way.
const DISTRICT_NAMES = [...readFileSync(join(WEBXR, "smartcity/js/districts.js"), "utf8").matchAll(/^  "([A-Za-z &-]+)": \{/gm)].map((m) => m[1]);
if (!DISTRICT_NAMES.length) throw new Error("could not read DISTRICTS from districts.js");
// The weather kinds, read out of weather.js for the same reason.
const WEATHER_KINDS = (readFileSync(join(WEBXR, "shared/weather.js"), "utf8")
  .match(/export const WEATHER_KINDS = \[([^\]]*)\]/)?.[1] ?? "")
  .split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
if (!WEATHER_KINDS.length) throw new Error("could not read WEATHER_KINDS from weather.js");

const MODULES = [
  "shared/kit.js", "shared/fleet.js", "shared/equipment.js", "shared/toolkit.js", "shared/game.js",
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
  "smartcity/js/sims/reefer-yard-monitoring.js",
  "smartcity/js/sims/straddle-carrier-ops.js",
  "smartcity/js/sims/hazmat-container-inspection.js",
  "smartcity/js/sims/formwork-shoring.js",
  "smartcity/js/sims/mass-timber-panel-set.js",
  "smartcity/js/sims/masonry-silica-scaffold.js",
  "smartcity/js/sims/housekeeping-room-turn.js",
  "smartcity/js/sims/laundry-plant-chemicals.js",
  "smartcity/js/sims/banquet-setup-lift.js",
  "smartcity/js/sims/bridge-cable-inspection.js",
  "smartcity/js/sims/bridge-lead-containment.js",
  "smartcity/js/sims/deck-joint-replacement.js",
  "smartcity/js/sims/shelter-intake-operations.js",
  "smartcity/js/sims/damage-assessment-team.js",
  "smartcity/js/sims/psychological-first-aid.js",
  "smartcity/js/sims/structure-fire-sizeup.js",
  "smartcity/js/sims/firefighter-rehab-sector.js",
  "smartcity/js/sims/wildland-urban-interface.js",
  "smartcity/js/sims/trauma-informed-intake.js",
  "smartcity/js/sims/crisis-line-shift.js",
  "smartcity/js/sims/home-visit-safety.js",
  "smartcity/js/sims/crisis-intervention-call.js",
  "smartcity/js/sims/critical-incident-debrief.js",
  "smartcity/js/sims/traffic-incident-management.js",
  "smartcity/js/sims/cardiac-arrest-pit-crew.js",
  "smartcity/js/sims/overdose-response-naloxone.js",
  "smartcity/js/sims/ambulance-scene-safety.js",
  "smartcity/js/sims/dental-careers-pathway.js",
  "smartcity/js/sims/four-handed-dentistry.js",
  "smartcity/js/sims/dental-radiography-fmx.js",
  "smartcity/js/sims/sterilisation-technician-cycle.js",
  "smartcity/js/sims/dental-lab-bench.js",
  "smartcity/js/sims/orthodontic-assisting.js",
  "smartcity/js/sims/oral-surgery-assisting.js",
  "smartcity/js/sims/front-office-treatment-coordination.js",
  "smartcity/js/sims/infection-control-audit.js",
  "smartcity/js/sims/school-screening-outreach.js",
  "smartcity/js/sims/implant-surgery-assisting.js",
  "smartcity/js/sims/endodontic-assisting.js",
  "smartcity/js/sims/denture-delivery-and-adjustment.js",
  "smartcity/js/sims/special-needs-and-geriatric-dentistry.js",
  "smartcity/js/sims/teledentistry-and-triage.js",
  "smartcity/js/sims/trades-lineage-briefing.js",
  "smartcity/js/sims/wellness-shift-work-sleep-and-stress.js",
  "smartcity/js/sims/wellness-peer-support-conversation.js",
  "smartcity/js/sims/wellness-substance-use-and-the-job.js",
  "smartcity/js/sims/wellness-asking-for-help-and-resources.js",
  "smartcity/js/sims/pm-lobby-and-front-desk.js",
  "smartcity/js/sims/pm-leasing-office-fair-housing.js",
  "smartcity/js/sims/pm-unit-turnover.js",
  "smartcity/js/sims/pm-trash-and-recycling-room.js",
  "smartcity/js/sims/pm-fire-alarm-panel-room.js",
  "smartcity/js/sims/pm-sprinkler-riser-room.js",
  "smartcity/js/sims/pm-elevator-machine-room.js",
  "smartcity/js/sims/pm-parking-garage.js",
  "smartcity/js/sims/pm-roof-and-drains.js",
  "smartcity/js/sims/pm-electrical-room.js",
  "smartcity/js/sims/civic-principles-briefing.js",
  "smartcity/js/sims/public-meeting-chair.js",
  "smartcity/js/sims/constituent-service-desk.js",
  "smartcity/js/sims/coalition-building-table.js",
  "smartcity/js/sims/budget-tradeoff-hearing.js",
  "smartcity/js/sims/ethics-and-conflict-of-interest.js",
  "smartcity/js/sims/crisis-communication-podium.js",
  "smartcity/js/sims/community-listening-session.js",
  "smartcity/js/sims/conflict-mediation-room.js",
  "smartcity/js/sims/mentorship-and-succession.js",
  "smartcity/js/sims/pm-domestic-water-and-backflow.js",
  "smartcity/js/sims/pm-laundry-room.js",
  "smartcity/js/sims/pm-pool-and-spa-chemistry.js",
  "smartcity/js/sims/pm-fitness-room-and-gym.js",
  "smartcity/js/sims/pm-community-room-and-events.js",
  "smartcity/js/sims/pm-mail-and-package-room.js",
  "smartcity/js/sims/pm-loading-dock-and-moves.js",
  "smartcity/js/sims/pm-landscaping-and-irrigation.js",
  "smartcity/js/sims/pm-playground-and-courtyard.js",
  "smartcity/js/sims/pm-storage-and-bike-room.js",
  "smartcity/js/sims/who-surveillance-and-case-definition.js",
  "smartcity/js/sims/who-ppe-donning-and-doffing.js",
  "smartcity/js/sims/who-isolation-ward-setup.js",
  "smartcity/js/sims/who-contact-tracing-visit.js",
  "smartcity/js/sims/who-treatment-centre-triage.js",
  "smartcity/js/sims/who-water-sanitation-and-hygiene.js",
  "smartcity/js/sims/who-vaccination-line.js",
  "smartcity/js/sims/who-risk-communication-and-community-engagement.js",
  "smartcity/js/sims/who-safe-and-dignified-burial.js",
  "smartcity/js/sims/who-after-action-review.js",
  "smartcity/js/sims/apprenticeship-standards-reading.js",
  "smartcity/js/sims/apprenticeship-application-and-test.js",
  "smartcity/js/sims/jobsite-orientation-and-osha-10.js",
  "smartcity/js/sims/union-hall-and-dispatch.js",
  "smartcity/js/sims/first-period-evaluation.js",
  "smartcity/js/sims/credit-report-reading.js",
  "smartcity/js/sims/debt-reduction-plan.js",
  "smartcity/js/sims/pay-stub-and-withholding.js",
  "smartcity/js/sims/budget-with-irregular-income.js",
  "smartcity/js/sims/emergency-savings-and-predatory-lending.js",
  "smartcity/js/sims/tdl-pallet-jack-and-racking.js",
  "smartcity/js/sims/tdl-pick-pack-and-scan.js",
  "smartcity/js/sims/tdl-trailer-loading-and-dock-plate.js",
  "smartcity/js/sims/tdl-hazmat-labeling-and-segregation.js",
  "smartcity/js/sims/tdl-lifting-and-ergonomics.js",
  "smartcity/js/sims/tdl-pretrip-inspection.js",
  "smartcity/js/sims/tdl-air-brake-test.js",
  "smartcity/js/sims/tdl-coupling-and-uncoupling.js",
  "smartcity/js/sims/tdl-backing-and-docking.js",
  "smartcity/js/sims/tdl-cargo-securement-and-hours.js",
  "smartcity/js/sims/sm-shop-layout-and-shear.js",
  "smartcity/js/sims/sm-duct-fabrication-and-seams.js",
  "smartcity/js/sims/sm-plasma-table-and-fume.js",
  "smartcity/js/sims/sm-tig-and-spot-welding.js",
  "smartcity/js/sims/sm-duct-hanging-and-seismic-bracing.js",
  "smartcity/js/sims/sm-architectural-panels-at-height.js",
  "smartcity/js/sims/sm-air-balancing-and-testing.js",
  "smartcity/js/sims/sm-kitchen-exhaust-and-fire-wrap.js",
  "smartcity/js/sims/pt-spreader-and-twistlock-inspection.js",
  "smartcity/js/sims/pt-crane-boom-hoist-brake-service.js",
  "smartcity/js/sims/pt-straddle-carrier-hydraulics.js",
  "smartcity/js/sims/pt-reefer-plug-and-power-panel.js",
  "smartcity/js/sims/pt-dock-fender-and-bollard-inspection.js",
  "smartcity/js/sims/pt-terminal-lighting-mast-service.js",
  "smartcity/js/sims/pt-stormwater-at-the-terminal.js",
  "smartcity/js/sims/pt-chassis-and-genset-yard.js",
  "smartcity/js/sims/gg-tower-climb-and-tie-off.js",
  "smartcity/js/sims/gg-main-cable-band-inspection.js",
  "smartcity/js/sims/gg-suspender-rope-replacement.js",
  "smartcity/js/sims/gg-deck-lane-closure-and-traveller.js",
  "smartcity/js/sims/gg-paint-containment-on-the-deck.js",
  "smartcity/js/sims/gg-international-orange-recoat.js",
  "smartcity/js/sims/gg-fog-and-wind-work-stop.js",
  "smartcity/js/sims/gg-pile-driver-fender-repair.js",
  "smartcity/js/sims/mw-ferry-deckhand-and-passenger-safety.js",
  "smartcity/js/sims/mw-workboat-towing-and-line-handling.js",
  "smartcity/js/sims/mw-oil-transfer-watch-and-boom.js",
  "smartcity/js/sims/mw-dive-supervisor-and-dive-plan.js",
  "smartcity/js/sims/mw-pier-pile-inspection-dive.js",
  "smartcity/js/sims/mw-hull-inspection-and-cleaning-dive.js",
  "smartcity/js/sims/mw-underwater-welding-and-cutting.js",
  "smartcity/js/sims/mw-diver-emergency-and-recovery.js",
  "smartcity/js/sims/manhole-entry-and-atmospheric-monitoring.js",
  "smartcity/js/sims/vessel-gangway-and-hatch-cover-safety.js",
  "smartcity/js/sims/stage-load-in-and-truss-rigging.js",
  "smartcity/js/sims/leading-edge-and-horizontal-lifeline.js",
  "smartcity/js/sims/drum-sampling-and-overpack.js",
  "smartcity/js/sims/bus-yard-fuelling-and-brake-check.js",
  "smartcity/js/sims/battery-storage-container-commissioning.js",
  "smartcity/js/sims/bb-warmup-injury-prevention-and-hydration.js",
  "smartcity/js/sims/bb-stance-and-ball-handling.js",
  "smartcity/js/sims/bb-footwork-pivots-and-jump-stops.js",
  "smartcity/js/sims/bb-passing-and-catching.js",
  "smartcity/js/sims/bb-shooting-form-and-arc.js",
  "smartcity/js/sims/bb-free-throw-routine.js",
  "smartcity/js/sims/bb-defensive-stance-and-closeouts.js",
  "smartcity/js/sims/bb-rebounding-and-boxing-out.js",
  "smartcity/js/sims/bb-team-offense-spacing-and-screens.js",
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
  SIM_SUBSTATION_SWITCHING, SIM_BUS_DEPOT_LIFT, SIM_FIRE_PUMP, SIM_SCAFFOLD_ERECTION, SIM_AERIAL_LADDER, SIM_CHLORINE_ROOM, SIM_FORKLIFT_DOCK, SIM_FLY_SYSTEM, SIM_BUNKERING_WATCH, SIM_MICROWAVE_BACKHAUL, SIM_STORMWATER_OUTFALL, SIM_BATTERY_YARD, SIM_CONFINED_RESCUE, SIM_AIRPORT_RAMP, SIM_COOLING_TOWER, SIM_CONCRETE_POUR, SIM_CNC_CELL, SIM_BACKFLOW_TEST, SIM_TRANSFORMER_VAULT, SIM_WIND_NACELLE, SIM_DIGESTER_GAS, SIM_DATA_HALL, SIM_MAST_CLIMBER, SIM_HAZMAT_ENTRY, SIM_AMMONIA_PLANT, SIM_PYRO_CUE, SIM_POST_TENSION, SIM_SHIPYARD_HOTWORK, SIM_GRAIN_BIN, SIM_LANDFILL_GAS, SIM_HOT_TAP, SIM_RCL_SWITCHING, SIM_AERIAL_LASHING, SIM_EV_EXTRICATION, SIM_TANK_LINING, SIM_ARENA_RIGGING, SIM_STACK_TEST, SIM_PILOT_TRANSFER, SIM_GAS_LEAK_SURVEY, SIM_CATH_LAB, SIM_BRIDGE_BLAST, SIM_BROADCAST_TRUCK, SIM_PUMP_AND_TREAT, SIM_TIDE_GATE, SIM_LIVING_SHORELINE, SIM_DREDGE_BARGE, SIM_RAD_SURVEY, SIM_SOIL_LOADOUT, SIM_VAPOR_MITIGATION, SIM_WELL_INSTALL, SIM_SEDIMENT_CAP, SIM_EELGRASS_TRANSPLANT, SIM_PCB_EQUIPMENT_REMOVAL, SIM_TRANSITE_PIPE_REMOVAL, SIM_CREOSOTE_PILE_REMOVAL, SIM_BIOSWALE_BUILD, SIM_SHORE_POWER_HOOKUP, SIM_SPILL_BOOM_DEPLOY, SIM_UST_REMOVAL, SIM_ISCO_INJECTION, SIM_BUILDING_RAD_SCAN, SIM_HAUL_ROAD_DUST, SIM_BALLAST_WATER_SAMPLING, SIM_SPARTINA_REMOVAL, SIM_NITROUS_OXIDE_MONITORING, SIM_CHAIRSIDE_EMERGENCY, SIM_AMALGAM_WASTE_HANDLING, SIM_BANQUET_HOT_HOLD, SIM_CAFETERIA_SERVING, SIM_GRILL_LINE_BURNS, SIM_OYSTER_REEF_MONITORING, SIM_MARSH_TRANSECT_SURVEY, SIM_OPACITY_READING, SIM_MOBILE_AIR_LAB, SIM_OPERATORY_TURNOVER, SIM_INSTRUMENT_REPROCESSING, SIM_SHARPS_EXPOSURE_RESPONSE, SIM_DISH_PIT, SIM_GREASE_TRAP, SIM_ALLERGEN_CONTROL, SIM_WALK_IN_COOLER, SIM_RECEIVING_DOCK_FOOD, SIM_PREP_COOLING, SIM_KNIFE_SKILLS, SIM_SLICER_LOCKOUT, SIM_BAKERY_MIXER, SIM_FRYER_OIL_CHANGE, SIM_HOOD_SUPPRESSION, SIM_KITCHEN_GAS_SHUTOFF, SIM_ULTRASONIC_SCALING, SIM_AEROSOL_MANAGEMENT, SIM_FLUORIDE_AND_SEALANTS, SIM_PATIENT_INTAKE_SCREENING, SIM_RADIOGRAPH_SAFETY, SIM_PERIODONTAL_CHARTING, SIM_MOBILE_DENTAL_OUTREACH, SIM_PEDIATRIC_VISIT, SIM_ORAL_CANCER_SCREENING, SIM_BAR_WELL_SETUP, SIM_ID_CHECK_UNDERAGE, SIM_JIGGER_POUR_SPEC, SIM_CUTOFF_OVERSERVICE, SIM_SPIKED_DRINK_RESPONSE, SIM_PATRON_DEESCALATION, SIM_TILL_DROP_ROBBERY, SIM_ALLERGEN_COCKTAIL, SIM_LAST_CALL_LOCKUP, SIM_KEG_CELLAR_CO2, SIM_ICE_WELL_BREAKAGE, SIM_DRAUGHT_LINE_CLEANING, SIM_TIP_POOL_LABOR, SIM_WVPP_PANIC_BUTTON, SIM_RBS_SERVICE_CAPSTONE, SIM_CAN_WE_LIVE_STORY, SIM_BIOMONITORING_CONSENT, SIM_SAMPLE_KIT_SHIPPING, SIM_RESULTS_RETURN_VISIT, SIM_SMOKE_DAY_OUTREACH, SIM_RAD_METER_BASICS, SIM_PARCEL_STATUS_WALK, SIM_RETEST_WITNESSING, SIM_MACHINE_THREADING_NEEDLE, SIM_LOCKSTITCH_SEAM_GUARD, SIM_SERGER_OVERLOCK, SIM_CUTTING_TABLE_ROTARY, SIM_SEWING_ERGONOMICS_SHIFT, SIM_ALTERATION_REPAIR_TICKET, SIM_GARMENT_INSPECTION_FINISH, SIM_ABATEMENT_PERIMETER_AWARENESS, SIM_HAZWOPER_SITE_ORIENTATION, SIM_DECON_SUPPORT_LABORER, SIM_AIR_SENSOR_INSTALL, SIM_SENSOR_COLOCATION_CHECK, SIM_AIR_NETWORK_DATA_QA, SIM_ODOR_COMPLAINT_LOG, SIM_FENCELINE_DUST_MONITOR, SIM_HAUL_ROUTE_OBSERVATION, SIM_MET_STATION_SITING, SIM_DUST_PLAN_REVIEW, SIM_PUBLIC_COMMENT_PREP, SIM_YOUTH_PATROL_TRAINING, SIM_SHELTER_IN_PLACE_DRILL, SIM_PATTERN_MARKING_LAYOUT, SIM_HEM_AND_BUTTONHOLE, SIM_INDUSTRIAL_PRESS_STEAM, SIM_COMMUNITY_SOIL_SPLIT, SIM_GARDEN_SOIL_SCREEN, SIM_SHORELINE_SEDIMENT_GRAB, SIM_DISCHARGE_PHOTO_DOC, SIM_MOTOR_CONTROL_CENTER, SIM_ARC_FLASH_LABEL_STUDY, SIM_TEMPORARY_SITE_POWER, SIM_REEFER_YARD_MONITORING, SIM_STRADDLE_CARRIER_OPS, SIM_HAZMAT_CONTAINER_INSPECTION, SIM_FORMWORK_SHORING, SIM_MASS_TIMBER_PANEL_SET, SIM_MASONRY_SILICA_SCAFFOLD, SIM_HOUSEKEEPING_ROOM_TURN, SIM_LAUNDRY_PLANT_CHEMICALS, SIM_BANQUET_SETUP_LIFT, SIM_BRIDGE_CABLE_INSPECTION, SIM_BRIDGE_LEAD_CONTAINMENT, SIM_DECK_JOINT_REPLACEMENT, SIM_SHELTER_INTAKE_OPERATIONS, SIM_DAMAGE_ASSESSMENT_TEAM, SIM_PSYCHOLOGICAL_FIRST_AID, SIM_STRUCTURE_FIRE_SIZEUP, SIM_FIREFIGHTER_REHAB_SECTOR, SIM_WILDLAND_URBAN_INTERFACE, SIM_TRAUMA_INFORMED_INTAKE, SIM_CRISIS_LINE_SHIFT, SIM_HOME_VISIT_SAFETY, SIM_CRISIS_INTERVENTION_CALL, SIM_CRITICAL_INCIDENT_DEBRIEF, SIM_TRAFFIC_INCIDENT_MANAGEMENT, SIM_CARDIAC_ARREST_PIT_CREW, SIM_OVERDOSE_RESPONSE_NALOXONE, SIM_AMBULANCE_SCENE_SAFETY, SIM_DENTAL_CAREERS_PATHWAY, SIM_FOUR_HANDED_DENTISTRY, SIM_DENTAL_RADIOGRAPHY_FMX, SIM_STERILISATION_TECHNICIAN_CYCLE, SIM_DENTAL_LAB_BENCH, SIM_ORTHODONTIC_ASSISTING, SIM_ORAL_SURGERY_ASSISTING, SIM_FRONT_OFFICE_TREATMENT_COORDINATION, SIM_INFECTION_CONTROL_AUDIT, SIM_SCHOOL_SCREENING_OUTREACH, SIM_IMPLANT_SURGERY_ASSISTING, SIM_ENDODONTIC_ASSISTING, SIM_DENTURE_DELIVERY_AND_ADJUSTMENT, SIM_SPECIAL_NEEDS_AND_GERIATRIC_DENTISTRY, SIM_TELEDENTISTRY_AND_TRIAGE, SIM_TRADES_LINEAGE_BRIEFING, SIM_WELLNESS_SHIFT_WORK_SLEEP_AND_STRESS, SIM_WELLNESS_PEER_SUPPORT_CONVERSATION, SIM_WELLNESS_SUBSTANCE_USE_AND_THE_JOB, SIM_WELLNESS_ASKING_FOR_HELP_AND_RESOURCES, SIM_PM_LOBBY_AND_FRONT_DESK, SIM_PM_LEASING_OFFICE_FAIR_HOUSING, SIM_PM_UNIT_TURNOVER, SIM_PM_TRASH_AND_RECYCLING_ROOM, SIM_PM_FIRE_ALARM_PANEL_ROOM, SIM_PM_SPRINKLER_RISER_ROOM, SIM_PM_ELEVATOR_MACHINE_ROOM, SIM_PM_PARKING_GARAGE, SIM_PM_ROOF_AND_DRAINS, SIM_PM_ELECTRICAL_ROOM, SIM_CIVIC_PRINCIPLES_BRIEFING, SIM_PUBLIC_MEETING_CHAIR, SIM_CONSTITUENT_SERVICE_DESK, SIM_COALITION_BUILDING_TABLE, SIM_BUDGET_TRADEOFF_HEARING, SIM_ETHICS_AND_CONFLICT_OF_INTEREST, SIM_CRISIS_COMMUNICATION_PODIUM, SIM_COMMUNITY_LISTENING_SESSION, SIM_CONFLICT_MEDIATION_ROOM, SIM_MENTORSHIP_AND_SUCCESSION, SIM_PM_DOMESTIC_WATER_AND_BACKFLOW, SIM_PM_LAUNDRY_ROOM, SIM_PM_POOL_AND_SPA_CHEMISTRY, SIM_PM_FITNESS_ROOM_AND_GYM, SIM_PM_COMMUNITY_ROOM_AND_EVENTS, SIM_PM_MAIL_AND_PACKAGE_ROOM, SIM_PM_LOADING_DOCK_AND_MOVES, SIM_PM_LANDSCAPING_AND_IRRIGATION, SIM_PM_PLAYGROUND_AND_COURTYARD, SIM_PM_STORAGE_AND_BIKE_ROOM, SIM_WHO_SURVEILLANCE_AND_CASE_DEFINITION, SIM_WHO_PPE_DONNING_AND_DOFFING, SIM_WHO_ISOLATION_WARD_SETUP, SIM_WHO_CONTACT_TRACING_VISIT, SIM_WHO_TREATMENT_CENTRE_TRIAGE, SIM_WHO_WATER_SANITATION_AND_HYGIENE, SIM_WHO_VACCINATION_LINE, SIM_WHO_RISK_COMMUNICATION_AND_COMMUNITY_ENGAGEMENT, SIM_WHO_SAFE_AND_DIGNIFIED_BURIAL, SIM_WHO_AFTER_ACTION_REVIEW, SIM_APPRENTICESHIP_STANDARDS_READING, SIM_APPRENTICESHIP_APPLICATION_AND_TEST, SIM_JOBSITE_ORIENTATION_AND_OSHA_10, SIM_UNION_HALL_AND_DISPATCH, SIM_FIRST_PERIOD_EVALUATION, SIM_CREDIT_REPORT_READING, SIM_DEBT_REDUCTION_PLAN, SIM_PAY_STUB_AND_WITHHOLDING, SIM_BUDGET_WITH_IRREGULAR_INCOME, SIM_EMERGENCY_SAVINGS_AND_PREDATORY_LENDING, SIM_TDL_PALLET_JACK_AND_RACKING, SIM_TDL_PICK_PACK_AND_SCAN, SIM_TDL_TRAILER_LOADING_AND_DOCK_PLATE, SIM_TDL_HAZMAT_LABELING_AND_SEGREGATION, SIM_TDL_LIFTING_AND_ERGONOMICS, SIM_TDL_PRETRIP_INSPECTION, SIM_TDL_AIR_BRAKE_TEST, SIM_TDL_COUPLING_AND_UNCOUPLING, SIM_TDL_BACKING_AND_DOCKING, SIM_TDL_CARGO_SECUREMENT_AND_HOURS, SIM_SM_SHOP_LAYOUT_AND_SHEAR, SIM_SM_DUCT_FABRICATION_AND_SEAMS, SIM_SM_PLASMA_TABLE_AND_FUME, SIM_SM_TIG_AND_SPOT_WELDING, SIM_SM_DUCT_HANGING_AND_SEISMIC_BRACING, SIM_SM_ARCHITECTURAL_PANELS_AT_HEIGHT, SIM_SM_AIR_BALANCING_AND_TESTING, SIM_SM_KITCHEN_EXHAUST_AND_FIRE_WRAP, SIM_PT_SPREADER_AND_TWISTLOCK_INSPECTION, SIM_PT_CRANE_BOOM_HOIST_BRAKE_SERVICE, SIM_PT_STRADDLE_CARRIER_HYDRAULICS, SIM_PT_REEFER_PLUG_AND_POWER_PANEL, SIM_PT_DOCK_FENDER_AND_BOLLARD_INSPECTION, SIM_PT_TERMINAL_LIGHTING_MAST_SERVICE, SIM_PT_STORMWATER_AT_THE_TERMINAL, SIM_PT_CHASSIS_AND_GENSET_YARD, SIM_GG_TOWER_CLIMB_AND_TIE_OFF, SIM_GG_MAIN_CABLE_BAND_INSPECTION, SIM_GG_SUSPENDER_ROPE_REPLACEMENT, SIM_GG_DECK_LANE_CLOSURE_AND_TRAVELLER, SIM_GG_PAINT_CONTAINMENT_ON_THE_DECK, SIM_GG_INTERNATIONAL_ORANGE_RECOAT, SIM_GG_FOG_AND_WIND_WORK_STOP, SIM_GG_PILE_DRIVER_FENDER_REPAIR, SIM_MW_FERRY_DECKHAND_AND_PASSENGER_SAFETY, SIM_MW_WORKBOAT_TOWING_AND_LINE_HANDLING, SIM_MW_OIL_TRANSFER_WATCH_AND_BOOM, SIM_MW_DIVE_SUPERVISOR_AND_DIVE_PLAN, SIM_MW_PIER_PILE_INSPECTION_DIVE, SIM_MW_HULL_INSPECTION_AND_CLEANING_DIVE, SIM_MW_UNDERWATER_WELDING_AND_CUTTING, SIM_MW_DIVER_EMERGENCY_AND_RECOVERY, SIM_MANHOLE_ENTRY_AND_ATMOSPHERIC_MONITORING, SIM_VESSEL_GANGWAY_AND_HATCH_COVER_SAFETY, SIM_STAGE_LOAD_IN_AND_TRUSS_RIGGING, SIM_LEADING_EDGE_AND_HORIZONTAL_LIFELINE, SIM_DRUM_SAMPLING_AND_OVERPACK, SIM_BUS_YARD_FUELLING_AND_BRAKE_CHECK, SIM_BATTERY_STORAGE_CONTAINER_COMMISSIONING, SIM_BB_WARMUP_INJURY_PREVENTION_AND_HYDRATION, SIM_BB_STANCE_AND_BALL_HANDLING, SIM_BB_FOOTWORK_PIVOTS_AND_JUMP_STOPS, SIM_BB_PASSING_AND_CATCHING, SIM_BB_SHOOTING_FORM_AND_ARC, SIM_BB_FREE_THROW_ROUTINE, SIM_BB_DEFENSIVE_STANCE_AND_CLOSEOUTS, SIM_BB_REBOUNDING_AND_BOXING_OUT, SIM_BB_TEAM_OFFENSE_SPACING_AND_SCREENS];
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
  if (sim.district !== undefined && sim.district !== null && !DISTRICT_NAMES.includes(sim.district)) {
    fail(sim.id, `district "${sim.district}" is not one of ${DISTRICT_NAMES.join(" / ")}`);
  }
  if (sim.indoor !== undefined && sim.indoor !== null && !INTERIOR_STYLES.includes(sim.indoor)) {
    fail(sim.id, `indoor "${sim.indoor}" is not one of ${INTERIOR_STYLES.join("/")}`);
  }
  if (sim.environment !== undefined && sim.environment !== null) {
    const url = sim.environment.url;
    if (typeof url !== "string" || !url) fail(sim.id, "environment has no url");
    else if (!/^https?:/.test(url) && !existsSync(join(WEBXR, url))) fail(sim.id, `environment "${url}" is not a file under WebXR/`);
    else if (!/\.(glb|gltf)$/i.test(url)) fail(sim.id, `environment "${url}" is not a .glb or .gltf`);
  }
  if (sim.weather !== undefined && !WEATHER_KINDS.includes(sim.weather)) {
    fail(sim.id, `weather "${sim.weather}" is not one of ${WEATHER_KINDS.join("/")}`);
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
    // An interruption is part of the assessment, so a perfect run answers it.
    // Anything scheduled on this step is armed the moment the step is entered,
    // so wind the clock to its fuse and deal with it before doing the step.
    for (const it of session.interrupts) {
      if (it.fired || it.after !== step.id) continue;
      session.tick((it.delay ?? 3) + 0.1);
      if (session.activeInterrupt) session.select(it.target);
    }
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

// Training programmes (curricula.js) name stations across both apps; a
// programme that points at a station that does not exist would show a
// learner a block they can never finish, so it fails the build.
{
  const { CURRICULA } = await import("../WebXR/smartcity/js/curricula.js");
  const { loadTrades } = await import("./lib/headless.mjs");
  const trades = await loadTrades();
  const known = {
    smartcity: new Set(suite.SIMS.map((r) => r.id)),
    trades: new Set(trades.ROOMS.map((r) => r.id)),
  };
  const seen = new Set();
  for (const c of CURRICULA) {
    if (seen.has(c.id)) fail("curricula", `duplicate programme id "${c.id}"`);
    seen.add(c.id);
    if (!c.stations?.length) fail("curricula", `programme "${c.id}" has no stations`);
    for (const st of c.stations ?? []) {
      if (!known[st.app]) { fail("curricula", `programme "${c.id}" names unknown app "${st.app}"`); continue; }
      if (!known[st.app].has(st.id)) fail("curricula", `programme "${c.id}" names "${st.app}:${st.id}", which does not exist`);
      if (!st.why || st.why.length < 30) fail("curricula", `programme "${c.id}" station "${st.id}" has no reason for being in the block`);
    }
    for (const field of ["name", "union", "certification", "summary"]) {
      if (!c[field]) fail("curricula", `programme "${c.id}" is missing ${field}`);
    }
  }
  if (!failures) console.log(`  ✓ ${String(CURRICULA.length).padStart(2)} training programmes${" ".repeat(22)} ${CURRICULA.reduce((a, c) => a + c.stations.length, 0)} station entries, all resolved`);
}

console.log(failures ? `\n${failures} problem(s) found.` : `\nAll ${suite.SIMS.length} simulators pass.`);
process.exit(failures ? 1 : 0);
