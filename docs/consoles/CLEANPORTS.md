# CLEANPORTS — zero-emission port operations and the pathway (`cp`, 8971)

Bay Program wave. Brief: `$SP/epa/bay-program-brief.md` (CLEANPORTS section). Facts: `$SP/epa/epa-2026-facts.md` is the only
source for Clean Ports facts — every figure the platform shows about the programme lives once, in `WebXR/shared/cp-cleanports.js`
(`CP_FACTS`), and `tools/check_cleanports.mjs` compares each against the facts file's own wording.

## Plan

1. **Six stations** (`cp-` prefix, sourced like the catalog's, 12–15 steps, ≥5 kinds, 4 hazards, 2 interruptions, 95+ on
   `node tools/eval_content.mjs`), union tags only from `tools/unions.json`:
   - `cp-high-voltage-lockout-on-electric-cargo-equipment` — HV awareness and lockout on battery-electric cargo handling equipment
     and a battery-electric drayage tractor (ILWU, IAM, IBEW).
   - `cp-charging-yard-connectors-and-e-stops` — charging infrastructure: connectors, e-stops, cable management, the yard (IBEW, ILWU).
   - `cp-battery-energy-storage-site-awareness` — the BESS site, its hazards, who may enter (IBEW, ILWU).
   - `cp-hydrogen-fuel-cell-equipment-and-fuelling` — hydrogen fuel cell equipment and fuelling (ILWU, IAM).
   - `cp-zero-emission-terminal-equipment-pre-use` — yard tractor / top pick / straddle carrier pre-use inspection (ILWU, IAM).
   - `cp-zero-emission-drayage-truck-pre-trip` — drayage truck zero-emission pre-trip (Teamsters).
   Each station carries a `cleanPorts` note naming which workforce partner the Port says provides that kind of training (PMA for
   operating the zero-emission equipment; MI assisting WOJRC's pre-apprentice TDL programme) — never claimed as their curriculum.
2. **MOTORPOOL drivables**: electric variants in `drivables-data.js` — battery-electric yard tractor, battery-electric top pick,
   battery-electric straddle carrier, hydrogen fuel cell yard tractor, battery-electric drayage tractor — each gated on its pre-trip
   station above; NEWTON's `nwDrive` drives any `DV_DRIVABLES` road entry, so they drive with no new code.
3. **Placement**: `cp-cleanports.js` keys stations and drivables to BAYMAP's `oak-west-oakland` sites (guarded
   `npParish(id)?.sites.find(...)`) and to Bay World's port / West Oakland sites.
4. **Pathway**: a "Zero-emission careers" level on the WOJRC Pathway Edition (`CP_PATHWAY_LEVEL` + the stations appended to the
   `wojrc-pathway-edition` programme), citing the release's line that MI assists WOJRC in expanding its pre-apprentice TDL programme
   to careers affected by zero-emission vehicles — and saying the level is not that programme.
5. **Checker** `tools/check_cleanports.mjs`: figures match the facts file, every new drivable has a pre-trip station that exists,
   the pathway level resolves, placements resolve (Bay World now; BAYMAP ids against the BAYMAP branch's list), union tags resolve,
   stations score 95+.

## Seams

- `cpCleanPortsFacts() -> CP_FACTS` (figures with their source urls).
- `cpPlacements(worldId) -> [{ kind: "station"|"drivable", id, site, parish? }]`, `cpPlaceInParish(npParish, parishId)` (guarded).
- `cpPathwayLevel() -> { id, title, stations, note, source }`.
- Drivables: new `DV_DRIVABLES` entries (NEWTON `nwDrive` reads them as any road drivable).

## Cycles

(reason → act → observe; one line each)
1. Reason: three stations (HV lockout, charging yard, BESS) from one spec generator can each clear 95 → Act: `cp-high-voltage-lockout-on-electric-cargo-equipment`, `cp-charging-yard-connectors-and-e-stops`, `cp-battery-energy-storage-site-awareness`, registered with add_station → Observe: `eval_content --station` 95 / 97 / 99 (228–243 meshes, 21–23 interactables). PASS.
2. Reason: the other three stations (hydrogen, terminal pre-use, drayage pre-trip) clear 95 and the first three stay there → Act: generated from specs, registered; first eval showed 94 (terminal) and 91 (drayage) — IAM's registry standard is out of scope for Maritime & Ports, 29 CFR 1917 out of scope for Mobility & Transit, and runs of three selects → Act 2: dropped the out-of-scope cites (IAM stays as a union tag), added ANSI Z535.4 / 29 CFR 1910.132 to the drayage line, broke the select runs → Observe: eval 98 / 98 / 99 / 99 / 97 / 97; `check_smartcity` "All 694 simulators pass."; `check_interrupts` "1392 interruptions across 696 procedures check out". PASS.
3. Reason: five zero-emission drivables gated on the new pre-trip stations pass MOTORPOOL's checker and drive in NEWTON → Act: `cp-electric-yard-tractor`, `cp-hydrogen-yard-tractor`, `cp-electric-top-pick`, `cp-electric-straddle-carrier` (new `dvStraddleCarrier` builder, budget row 30), `cp-electric-drayage-tractor`; the six stations join the WOJRC Pathway Edition (check_drivables resolves gates through the curricula); count rule 50→55 → Observe: first run 13 FAIL (unknown station, gate names, count) → after gen_gate_names + curricula: `check_drivables` "Motor Pool: 55 drivables and 20 watercraft, every builder inside budget, every gate resolved, every entry drove or floated its twenty-second run clean (2188 checks)"; `check_gates` "7079 checks · 0 failed"; `check_newton` "All NEWTON checks pass." PASS.
4. Reason: one data module (`cp-cleanports.js`) states the Clean Ports figures once, places stations/drivables (Bay World now, BAYMAP guarded) and defines the Zero-emission careers level, and `check_cleanports.mjs` proves it → Act: module + parishes-app mount (`cpPlaceInParish(npParish)`, bundler list), Bay World site lists, WOJRC summary line (sourced, "not that program"), facts copy at `docs/sources/epa-2026-facts.md`, checker in check_all list and baseline → Observe: first run failed (a note worded "does not describe", eval JSON read from stdout) → fixed → `check_cleanports` "CLEANPORTS: 6 stations at 95+, 5 drivables gated on pre-trip stations, the Zero-emission careers level resolves, every Clean Ports figure matches the facts file (110 checks)."; `check_bayworld` pass; `check_tracks` "All track checks pass: 60 pages…"; `check_packs` "all 23604 checks pass — 144 packs, 703 stations each in a pack"; `check_imports` "All 950 modules call only what they declare or import." PASS.
5. Reason: crew figures stand clear of floor-standing things (check_layout) → Act: generator puts interrupt figures on a clear row at z 1.25 instead of the prop arc → Observe: first run "cp-charging-yard…: a crew figure at (2.5, -0.4) is 0.2m from something floor-standing" → after: `check_layout` "All 703 stations reachable."; eval unchanged 97–99. PASS. (Browser drive not done: `tools/briefs/drive_one.mjs` fails on existing stations too — `#enter-flat` never appears.)
6. Reason: the whole set stays green after the last regeneration → Observe: `check_smartcity` flagged "summary says 'six stations' but has 46" (the WOJRC line) → Act: dropped the count, regenerated catalog, packs, bundle → Observe: `check_smartcity` "All 694 simulators pass."; `check_tracks`, `check_packs`, `check_cleanports`, `check_drivables`, `check_interrupts` pass. PASS.
