# UNIONSIMS — craft trainings and simulations per Bay Program project type (`us`, 8999)

Bay Restoration Academy wave. Facts only from the wave's facts file; no project figure appears in any station or simulation. Union
tags are `tools/unions.json` ids for the craft, as a **trade reference**: the platform has no partnership with any union, and no
station or simulation is any union's programme. Base 9914455.

## Inventory (what the catalog already taught) and the gaps filled

| Project type | Craft | Existing coverage | Added |
|---|---|---|---|
| Trash capture | laborer cleanout from the surface | `bk-street-drain-trash-capture-cleanout` | sim `us-sim-trash-capture-surface-cleanout` |
| | vacuum truck operator | only the laborer's guide step | station `us-vacuum-truck-operator-hookup-and-offload` (98) + sim |
| | regulated-waste haul | `soil-loadout` (excavation load-out) | station `us-regulated-soil-haul-load-tarp-and-manifest` (97) + sim `us-sim-regulated-waste-haul` |
| Green stormwater infrastructure | excavation and shoring | `trench-box` | sim `us-sim-gsi-excavation-and-shoring` |
| | underdrain and infiltration piping | `pl-underground-sewer-lateral-and-trench-shoring` | sim `us-sim-gsi-underdrain-piping` |
| | soil and planting | `bk-bioretention-rain-garden-excavation` | sim `us-sim-gsi-soil-and-planting` |
| | utility locates | `op-excavator-trench-and-utility-locate` | sim `us-sim-gsi-utility-locate` |
| | survey and assessment for a plan | none | left (see below) |
| Tidal channels and berm lowering | operating engineer on mats | `br-tidal-marsh-grading-amphibious-excavator` | sim `us-sim-tidal-operator-on-mats` |
| | laborers on the levee | `br-levee-inspection-and-seepage` | sim `us-sim-levee-laborer` |
| | water-control structures | `tide-gate` | sim `us-sim-water-control-structure` |
| | small-boat crew | `me-water-column-sampling-from-a-small-boat` | sim `us-sim-small-boat-crew` |
| Nutrient reduction | operator rounds, chemical feed, aeration | `bk-wastewater-nutrient-chemical-feed` | sim `us-sim-plant-operator-rounds` |
| | lockout on process equipment | none at a treatment plant | station `us-treatment-plant-process-pump-lockout` (96) + sim `us-sim-process-lockout` |
| PCB source control | sampling with PPE and decon | `ps-pcb-sampling` (PROJECTSIM) | reuse |
| | chain of custody | `br-sediment-chain-of-custody-and-lab-prep` | sim `us-sim-pcb-chain-of-custody` |
| | regulated-soil handling and haul | `soil-loadout` | station (above) + sim `us-sim-regulated-soil-haul` |
| Clean Ports | ZE equipment pre-use | `cp-zero-emission-terminal-equipment-pre-use` | sim `us-sim-ze-equipment-pre-use` |
| | battery-electric maintenance lockout | `cp-high-voltage-lockout-on-electric-cargo-equipment` | sim `us-sim-battery-electric-lockout` |
| | charging-yard electrical work | `cp-charging-yard-connectors-and-e-stops` | sim `us-sim-charging-yard-electrical` |
| | drayage pre-trip | `cp-zero-emission-drayage-truck-pre-trip` | sim `us-sim-drayage-pre-trip` |

## Seams

- `WebXR/shared/us-unionsims.js`: `usSims()`, `usSim(id)`, `usSimsFor(project)`, `usPlaces(simId)`, `usScore/usMistakes/usDebrief`
  (PROJECTSIM's scoring), `usRecord(simId, result)` (Crew Credits via `tyEarn`, record id `unionsims:<id>`), `usDeanModules()`
  (DEAN's module shape, kind `projectsim`). Data: `WebXR/shared/us-unionsims-data.js` (`US_SIMS`, `US_PROJECTS`, `US_PLACES_BY_PROJECT`).
- Gate: the UNIONSIMS block in `tools/check_projectsim.mjs` (steps resolve, union tags in unions.json, order penalties, arithmetic,
  partnership wording, reachability, Crew Credits once, DEAN modules). Bundler carries both modules.

## Cycles

1. Reason: the vacuum truck operator, regulated haul and plant process lockout have no station — generate three station-brief stations; check eval_content 95+. Observed: 90 / 83 / 81 — standards (1926.600, 49 CFR 393/396, NFPA 70E, Z244.1, Title 8 3314 unregistered or out of scope) and missing out-of-order notes.
2. Reason: cite only registry standards in scope for each category, add out-of-order notes, break select runs with drags; check eval. Observed: 98 / 97 / 92 (pump: 3 authorities, no find step).
3. Reason: pump station gets a find step (the seal-water source the breaker does not cover) and ANSI/NIOSH grounding; check eval. Observed: 96; stations committed (9f0eef4) after gen_sims_meta + gen_catalog.
4. Reason: 19 PROJECTSIM-shaped craft simulations, every step a real station step, gated by an extended check_projectsim; check "steps resolved N/N". Observed: 1 FAIL (a practice line under 30 chars) — 113/113 steps resolved to 18 stations.
5. Reason: fix the short practice and the bundler entries; check check_projectsim. Observed: `check_projectsim: ok — 998 passed, 0 failed` · "19 craft simulations over 6 project types · 11 unions, all in unions.json · Crew Credits once (50 CC) · 19 DEAN modules".
6. Reason: nothing else broke — single checkers smartcity, layout, interrupts, a11y, signage. Observed: see hand-back.

## Left

- Survey and assessment for a green stormwater plan (San Jose's plan work) has no station or simulation yet.
- A UI mount for the craft sims (PROJECTSIM's board/menu) and DEAN registration of `usDeanModules()`; the three stations are not yet in a programme.
- Browser drive of the three stations not run (shared box).
