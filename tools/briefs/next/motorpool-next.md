# MOTORPOOL-2 brief — the next phase of the Motor Pool

Read first: `docs/consoles/memory/MOTORPOOL.md`, `docs/consoles/MOTORPOOL.md`, `WebXR/shared/drivables-data.js`, `drivables.js`, `drivables-board.js`, `tools/check_drivables.mjs`.

## Where MOTORPOOL left it (measured)
- Registry: 70 entries — 50 road/site/rail (37 on fleet.js/equipment.js builders, 14 new `dv*` builders) and 20 watercraft (3 on fleet.js hulls, 17 new hulls on one parametric `dvHull`). Every entry has a kit, a drive or helm profile, trades (or a `tradeNote`), a gate (the contract) and a pre-trip step.
- Kit: 31 new builders, 1,416 meshes over all 70 builds, heaviest 44 (the push boat with two barges; ceiling 45); `check_fleet` holds 130 builders across four kits.
- Gates: 70 `DV_GATED` items discovered by `check_gates` (136 gated items on the platform, 0 failed); 116 gate station names generated.
- Engines: `dvStepDrive` (Bay World's rules over a profile, plus rails) and `dvStepHelm` (the Regatta's rules over a profile, plus a no-reverse airboat and an off-wind-only sail); all 70 drive or float a 20 s scripted run clean and deterministically (`check_drivables`: 2,049 checks).
- Bay World: HUD "Motor Pool" button → board → pre-trip → one kit build beside the learner, driven through the existing vehicle mode; `equipment.js` now rides in the bayworld bundle (2.85 MB, was 2.58 MB).

## What to build next
1. **Helm in a world.** Watercraft are proven headless only; the board links the Regatta. Mount `dvStepHelm` in Bay World's harbour (spawn on water at `y = -draft`, `rgOnWater`-style shore test from `bwZoneAt`) and in the parishes' rivers and lake (PARISH's `water` polygons), with a wake and the no-wake cap the Regatta already scores.
2. **Parishes board.** Call `dvMountMotorPool({ el, world: "parishes", page, onDrive, onHelm })` from `WebXR/parishes/` once PARISH's HUD exists; add the site kind `motor-pool` at a port terminal and a streetcar barn so the board has a place. Filter the board by what fits the parish (rail rows at the barn, watercraft at the port).
3. **Re-entry and parking.** A Motor Pool vehicle left parked cannot be re-entered with F (the near-vehicle loop reads `BW_VEHICLES` only); extend the loop to `bwApp.world.vehicles` and let the depot show the last three taken out.
4. **Rails in Bay World.** The streetcar and switcher drive as road vehicles there; give them `env.rails` from a short track polyline near the rail yard site so `dvStepDrive`'s rail branch is used in play, not only in the checker.
5. **Pre-trip as a station.** The checklist is a board step; make the four pre-trip lists (road, CDL, plant, water) real stations (eval 95+) and gate the drivables on them, so the board's "Qualify at" links land on the exact walk-around.
6. **Articulation in play.** `tractor-dry-van`, `tractor-flatbed`, `tractor-tanker` are re-hung with `flArticulate`; Bay World's vehicle stepping does not yet swing the trailer (shared/game.js's `placeVehicle` does). Wire it.
7. **Watercraft liveries.** The three fishing craft carry fictional boat names (`GULF STAR`, `BAYOU PEARL`, `MISS DELTA`); decide whether the platform wants named hulls (the Regatta's twelve yachts are) or generic ones, and hold it in `check_drivables`.

## Numbers to hold
70 entries (50 + 20); every builder ≤ its DV_BUDGET row and ≤ 45 meshes; the bayworld bundle under 3 MB; `check_drivables`, `check_fleet`, `check_gates` green; `check_mobile` frame budget on Bay World unchanged (one kit build at a time).
