# BAYKEEPER — next

- Mount `bkPlaceMarkers(npParish)` (WebXR/shared/bk-bayprogram.js) in the parishes app: one instanced marker per resolved project
  (Port of Oakland at oak-west-oakland/outer-harbor-container-terminal once BAYMAP merges; SFPUC at sf-mission [-1280, 1990],
  approximate) with a board linking `../bayprogram/index.html#<projectId>`. Keep it inside check_parishes' per-chunk budget.
- Bay World: add the six regional projects to the atlas as a "Bay Program" layer (outside the walkable maps), from `bkMarkers("bayworld-atlas")`.
- Stations still to write for the brief's list: tidal channel excavation and berm lowering from mats with a spill kit (today covered
  by br-tidal-marsh-grading-amphibious-excavator and br-dredge-spoils-dewatering-pad), a dedicated PCB source-control sampling station
  (today br-legacy-mercury-and-pcb-hotspot-handling + br-sediment-chain-of-custody-and-lab-prep), fish habitat (br-culvert-retrofit-for-fish-passage,
  br-fish-screen-maintenance), and an underground infiltration gallery install for GSI.
- Link the hub from the homepage / instructor console and from the packs page once PACKS regenerates (gen_packs picks up bay-program-projects).
- Regenerate the hub with `node tools/gen_bayprogram.mjs` after any change to bk-bayprogram.js; gate `node tools/check_bayprogram.mjs`.
