# PROJECTSIM — full-procedure training simulations for each Bay Program project type (`ps`, 8969)

SmartCiti.X Powered by AGI Corp. Brief: `project-worlds-brief.md` (PROJECTSIM), `bay-program-brief.md`, the facts file
`epa-2026-facts.md`, the Shared rules (`tools/briefs/packs-brief.md`) and the reactor loop (packs-brief-3).

Five simulations, one per kind of work the 2026 EPA San Francisco Bay Program awards and the Port of Oakland Clean Ports grant pay for
(per the facts file: trash capture, green stormwater infrastructure, tidal marsh restoration with sediment reuse, zero-emission cargo
handling with charging infrastructure and a battery energy storage system, PCB source control). Every step is a real catalog station's
own step id (`WebXR/smartcity/js/sims/<station>.js`), read the way DRILLS' objectives are. No project's figures appear in a
simulation; the practice is the catalog stations' sourced practice. No injury is shown or described.

| Sim | Steps | Order gates | Plays at (in tree) | Guarded (merging maps) |
|---|---|---|---|---|
| `ps-trash-capture-cleanout` | 8 | permit, lockout | sf-bayview/port-southern-terminals, sf-mission/islais-creek-pump-station | oak-west-oakland/outer-harbor-container-terminal, bp-san-leandro-bay |
| `ps-green-stormwater-build` | 8 | locate, permit | sf-mission/mission-bay-construction-site, sf-marina/chestnut-construction | sf-outer-mission |
| `ps-tidal-channel-dig` | 8 | permit, mats | sf-bayview/yosemite-slough-restoration, sf-marina/crissy-marsh-crew | bp-strip-marsh-east |
| `ps-zero-emission-charging-yard` | 8 | permit, lockout | sf-bayview/port-southern-terminals, sf-mission/potrero-bus-yard | oak-west-oakland/port-truck-staging-yard |
| `ps-pcb-sampling` | 8 | plan, ppe, decon, sample | sf-bayview/shipyard-soil-cell, sf-bayview/shipyard-shoreline-crew | — |

BAYKEEPER `bk-*` and CLEANPORTS `cp-*` ids were not published in any branch at build time (checked with
`git log --all -- docs/consoles/BAYKEEPER.md docs/consoles/CLEANPORTS.md`: empty), so every step uses an existing station; the
coordinator swaps in `bk-*`/`cp-*` step ids when they land (one `station`/`step` pair per step).

## Seams

- `psSims()`, `psSim(id)`, `psPlacesFor(parishId)` (in-tree placements plus guarded ones whose map and site resolve through
  `npParish(id)?.sites.find(...)`).
- `psScore(sim, run)` / `psMistakes(sim, run)` / `psDebrief(sim, run)` — run: `{ order: [stepId], calls: { [stepId]: bool } }`.
- `psRecord(simId, score, { attemptId })` — best score under `vr-passport-projectsim-v1`, award via `psSetRecorder(ppAward)`,
  Crew Credits via TYCOON `tyEarn(simId, { recordId: "projectsim:<id>", level, passed })`.
- `psDeanModules()` — DEAN's assignable module shape `{ id, title, kind: "projectsim", stations, minutes, launch }`.
- `psTideWindow(parish, site)` (TERRAFORM `tfWaterDepthAt` at the nearest water), `psPlaceExcavator(parish, site, { mats })`
  (a NEWTON body settled on the parish ground), `psInfiltration(parish, site)` (the cell is dry by `tfWaterDepthAt`; a schematic
  drain-down, no figures).
- `psMountProjectSim({ three, root, parish, el, tier, reducedMotion, toast, stationHref })` -> `{ open, boardRows, list, counts, active }`,
  mounted in the parishes app (menu `#menu-ps`, site board `#board-ps`).

## Cycles

1. Reason: five sims, every step a real station step — check `check_projectsim` "steps resolved N/N". Observed: 40/40 resolved
   (20 stations), but 2 FAIL [order] — PCB `custody`/`doff` required non-gate steps.
2. Reason: fix — `sample` and `corridor` become gates (sample, decon). Observed: `check_projectsim: ok — 303 passed, 0 failed`;
   order line: trash −250 skipped permit / −250 skipped lockout, charging yard −150 permit / −250 lockout.
3. Reason: scoring arithmetic, mistake log, debrief — observed "clean 100 · one unsafe of 8 → 88 · pass mark 80 · order penalty 50".
4. Reason: every sim reachable at a real site; guarded placements only with their map — observed "10 in-tree sites across 3 maps,
   every sim reachable (2/2/2/2/2) · 5 guarded (0 resolve in this tree)".
5. Reason: TERRAFORM / NEWTON / TYCOON / passport / DEAN — observed "tide 0.24 m at the slough (window open) · excavator settles on
   mats at 0.95 (ground 0.8) in 1.13s"; "tyEarn paid 50 CC once (level 4), fail pays 0 · 3 passport awards · 5 DEAN modules".
6. Reason: mount in the parishes app (board + menu) and the bundler; live run on port 8969. Observed (`--live`): "sf-bayview menu
   5 sims · board at yosemite-slough-restoration starts ps-tidal-channel-dig · tidal dig run in order → 100/100 … +60 Crew Credits ·
   excavator meshes 1 · 0 page errors"; `check_projectsim: ok — 307 passed, 0 failed`.
7. Reason: nothing else broke — observed `check_imports`: "All 945 modules call only what they declare or import";
   `check_tycoon: 1570 passed, 0 failed`; `check_budget`: all 697 stations inside budget; `check_parishes: 12920 passed, 0 failed`.

## Left for the coordinator

- Done (BAYSEAMS): the trash-capture sim's lane, air and vacuum steps are `bk-street-drain-trash-capture-cleanout` steps; the green
  stormwater sim's locate, marks, pothole, layers, planting and drawdown steps are `bk-bioretention-rain-garden-excavation` steps;
  the charging yard's lockout and e-stop are `cp-charging-yard-connectors-and-e-stops` steps and its storage-site read is
  `cp-battery-energy-storage-site-awareness`. check_projectsim reads JSON-quoted step keys too (CLEANPORTS' station format).
- The guarded placements resolve on their own when BAYMAP's `oak-west-oakland` and TIDELANDS' `bp-*` / `sf-outer-mission` merge.
- DEAN: `psDeanModules()` is in DEAN's module shape; register it in `dnModules()` when dn-modules.js lands.
- The charging-yard e-stop step is CLEANPORTS' `test-yard-e-stop` (was the AMR fleet drill).
