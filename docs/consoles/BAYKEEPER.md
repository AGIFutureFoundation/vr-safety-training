# BAYKEEPER — the Bay Program training system and resource hub (`bk`, port 8970)

Brief: the Bay Program wave (EPA San Francisco Bay Program awards of 22 September 2026, Port of Oakland Clean Ports).
Facts come only from the wave's facts file (EPA release and stormwater.com coverage for the awards). Base 039f09e.

## Plan
- **Data** `WebXR/shared/bk-bayprogram.js` (pure data, no imports): the program paragraph and sources, the eight named projects
  exactly as the facts file states them, the "twelve more" line, Clean Ports and its workforce partners, the union crafts, the
  station map (project -> stations that teach its work) with union ids from `tools/unions.json`, and the markers (Port of Oakland
  -> BAYMAP `oak-west-oakland` guarded; SFPUC Outer Mission -> `sf-mission` southern edge (approximate centre projects to z~2011
  of a 2048 half-field, beyond Glen Park, the southernmost anchor); the rest -> Bay World's regional atlas, "outside the walkable maps").
- **Programme** `bay-program-projects` in `curricula.js`: new `bk-` stations plus the existing sourced `br-` stations that already
  teach the tidal channel / sediment, PCB and fish-habitat work.
- **New stations** (station-brief shape, 95+): `bk-bioretention-rain-garden-excavation` (green stormwater infrastructure: locates,
  trench/excavation, soil and plants), `bk-street-drain-trash-capture-cleanout` (confined-space awareness, lockout, traffic control,
  PPE, debris), `bk-wastewater-nutrient-chemical-feed` (operator safety at chemical feed and aeration). Existing coverage used for
  the rest: `br-tidal-marsh-grading-amphibious-excavator`, `br-dredge-spoils-dewatering-pad`, `br-legacy-mercury-and-pcb-hotspot-handling`,
  `br-sediment-chain-of-custody-and-lab-prep`, `br-culvert-retrofit-for-fish-passage`, `br-fish-screen-maintenance`, `br-trash-capture-device-service`.
- **Hub** `WebXR/bayprogram/index.html` + `bk-hub.js` (design system `shared/design.css`).
- **Checker** `tools/check_bayprogram.mjs`: figures vs the facts file, every project links to >=1 station that exists, no unnamed
  project named, union tags resolve, markers placed as the facts file says, new stations 95+ (reads eval output).

## Seams
- `bkProjects()`, `bkStationsFor(projectId)`, `bkMarkers(world)` in `bk-bayprogram.js`.
- `bkPlaceMarkers(npParish, world)` guarded: `npParish?.("oak-west-oakland")?.sites.find(s => s.id === "outer-harbor-container-terminal")`.

## Cycles
1. Reason: green stormwater infrastructure has no station — add `bk-bioretention-rain-garden-excavation`; check: eval_content 95+. Observed: **98** (8 kinds, 4 hazards, 2 interruptions, median why 360, 271 meshes).
2. Reason: the awards need a programme and a hub with facts-exact rows; check: `check_bayprogram` rows/figures/links lines. Observed: first run FAIL 1 ("figures not in the facts file: 100, 1021" — "100 percent" and SEIU 1021's name).
3. Reason: fix the checker's figure scan (union local numbers are names; 100 is "100 percent"); check: PASS. Observed: **PASS** — 8 projects, 14 stations linked, union tags 8 unions resolve, markers placed.
