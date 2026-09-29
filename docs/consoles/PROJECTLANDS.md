# PROJECTLANDS — a walkable place for every announced project (`pj`, port 8998)

Brief: `$SP/restoration/wave-brief.md` (section PROJECTLANDS), `$SP/epa/project-worlds-brief.md` (the geography rule) and the
facts file `$SP/epa/epa-2026-facts.md` (the only source for project facts). Base 9914455. Builds on TIDELANDS
(docs/consoles/TIDELANDS.md: `bp-strip-marsh-east`, `bp-san-leandro-bay`, `sf-outer-mission`).

## What was built

| project (facts file) | where it is walkable | how |
|---|---|---|
| Port of Oakland — four trash capture devices on port property | `oak-west-oakland` | precinct: two trash capture device sites (placement procedural, labelled) |
| Port of Oakland — Clean Ports zero-emission conversion | `oak-west-oakland` | precinct: charging yard, battery energy storage site, drayage staging, zero-emission cargo equipment yard |
| C/CAG — monitor and control PCB sources (sites not named) | `bp-san-mateo-shoreline` (new, **representative**) | 13 sites |
| BACWA — five nutrient-reduction pilots (sites not stated) | `bp-nutrient-pilot` (new, **procedural, representative**) | 12 sites |
| City of San Jose — GSI implementation plan | `bay-san-jose` | precinct: street survey, site assessment, planning studio |
| City of San Pablo — build and monitor GSI | `bay-san-pablo` | precinct: bioretention build, monitoring point, underdrain crew |
| ABAG — Strip Marsh East | `bp-strip-marsh-east` | +3: small-boat landing, water-control structure, swamp mat crossing |
| City of San Leandro — two trash capture devices | `bp-san-leandro-bay` | +2: vacuum truck staging, debris haul transfer |
| SFPUC — Outer Mission GSI | `sf-outer-mission` | +2: underdrain piping crew, GSI monitoring crew |

**Port of Oakland: a precinct, not `bp-oakland-seaport`.** `npBounds(oak-west-oakland)` = lon −122.361 … −122.263, lat 37.773 …
37.851, which holds the Outer Harbor, the Middle Harbor and the Seventh Street terminals, so a second map would duplicate the
seaport. The precinct sits inside the port districts.

**Overlap.** Each new field was checked against all 22 existing maps' `npBounds` before it was written: bp-san-mateo-shoreline
(lon −122.296 … −122.194, lat 37.480 … 37.560) and bp-nutrient-pilot (lon −122.321 … −122.219, lat 37.990 … 38.070, San Pablo
Bay's southern shore between bay-san-pablo's 37.972 N edge and bp-strip-marsh-east's 38.095 N edge) overlap none. Held by
check_parishes for every map.

**Representative.** Both new maps carry `representative: true`, say so in their name, blurb and module header, and stand a
sign landmark on the map. The plant names only the water body (San Pablo Bay); every other feature is labelled procedural. No
real plant, property or facility is implied to be part of a project.

**UNIONSIMS' ids, guarded.** `WebXR/shared/pj-precincts.js` indexes the nine project precincts (project → map → sites) and lists
UNIONSIMS' final `us-` stations and simulations for each; `pjGuardedUs()` admits an id only once it resolves (the catalog for
stations, `us-unionsims.js`'s `usSims()` for simulations, read only when that module is in the tree). The sites' own `stations`
carry only catalog stations that resolve today; after the merge the `us-` stations can be added to the precinct sites.

**Where UNIONSIMS' nutrient-reduction simulations should move** (they play at `islais-creek-pump-station` for lack of a plant):
re-point `usPlaces` to `bp-nutrient-pilot` / `npp-operator-rounds` (us-sim-plant-operator-rounds) and
`bp-nutrient-pilot` / `npp-pilot-process-skid` and `npp-maintenance-shop` (us-sim-process-lockout). PCB simulations fit
`bp-san-mateo-shoreline` / `smc-regulated-soil-loadout` (us-sim-regulated-soil-haul) and `smc-lab-intake`
(us-sim-pcb-chain-of-custody); Clean Ports simulations fit the `oak-port-*` precinct sites.

## Cycles

1. Reason: does oak-west-oakland already cover the seaport? Act: `npBounds` of all 22 maps (scratch tools/pj_bounds.mjs). Observed:
   lon −122.361 … −122.263, lat 37.773 … 37.851 holds the Outer Harbor and Seventh Street terminals → a precinct there, no new
   port map; the two new boxes chosen clear of every map.
2. Reason: positions must be dry, flat and clear before any module is written. Act: tools/pj_probe.mjs on 40+ candidates across
   seven maps. Observed: 3 candidates in the Middle Harbor water or the bay and one on Mission Street, moved; the rest OK.
3. Reason: the two maps and 19 precinct sites written, registered, bundled and held strict. Act: check_parish_data. Observed: 6
   fails, all docs (the two map ids and four connectors unlisted) → docs/parishes.md section → 17752 pass, 0 fail.
4. Reason: engine geometry and budgets. Act: check_parishes. Observed: 33629 passed, 0 failed; worst high-tier meshes / triangles
   oak-west-oakland 146 / 66486, bp-san-mateo-shoreline 119 / 78647, bp-nutrient-pilot 124 / 69117 (budget 260 / 400000).
5. Reason: checker extension (representative label, only the water body named, no overlap, port precinct, precinct kinds, several
   crafts per project, the us- guard). Act: check_parishes. Observed: 2 fails — the plant's blurb lacked "representative", the
   port's trash capture precinct had two unions → blurb fixed, iuoe-local3 on the vacuum-truck site.
6. Reason: UNIONSIMS' final ids replaced one station and dropped two simulations. Act: pj-precincts updated, the guard reads
   `usSims()` when us-unionsims.js is present, usPlaces sites listed. Observed: see the hand-back line below.

## Left

- After UNIONSIMS merges: add its three `us-` stations to the precinct sites' `stations` and re-point `usPlaces` (above).
- Home card counts by region and gen_treasures for the two new maps (the play layer owns treasures; not run here).
- The rebuilt dist bundles (the coordinator regenerates).
