# Console ORBIT

- Team: ORBIT
- Brief: `tools/briefs/industry-worlds-brief.md` (ORBIT section, and "What simulation options means here"), with `station-brief.md`, `assets-brief.md`, `wave100-brief.md` and `console-brief.md`
- Branch of record: `claude/vr-ar-safety-training-wkwmve`
- Scope: aerospace-and-defence depot training (civilian-style workplace safety only) and a robotics factory and training centre. Prefix `ad-`, programme `aerospace-defense-and-robotics`.

## Log

- 23:10 UTC · fetched and fast-forwarded to ebd2f94; read the briefs, the aviation and warehouse stations, the kits, districts and checkers · — · next: the builder set
- 23:22 UTC · plan: builders cleanRoomBay, testStand, depotHangarBay (reuses regionalJet), robotCell, cobotBench in equipment.js; teachPendant in toolkit.js; AMRs reuse amrRobot. Districts robotics-factory, robotics-training-centre, aerospace-depot. Eight `ad-` stations, each declaring one `?fault=` read in its own build() (no shared plumbing had landed on a fetch) · — · next: commit builders
- 23:24 UTC · builders committed; check_fleet green (cleanRoomBay 11, testStand 10, depotHangarBay 37, robotCell 16, cobotBench 10, teachPendant 4 meshes) · 51257d7 · next: districts
- 23:27 UTC · districts robotics-factory 52, robotics-training-centre 43, aerospace-depot 26 of 120 meshes; ?fault= documented in docs/districts.md · ef343c7 · next: stations
- 23:31 UTC · failed: generated stations set `indoor: true`, which check_smartcity rejects (indoor is a room type); fixed by dropping it, the scenic district carries the room · — · next: lateNotes
- 23:33 UTC · failed: lateNotes keyed to ids no step targets (quarantine-tag, eyewash-station, roster-board); fixed by keying them to real step targets · — · next: fault checker
- 23:34 UTC · check_districts now builds every station that declares `faults` with and without `?fault=` and asserts the step's answer changes and is restored (8 faults) · — · next: remaining stations
- 23:38 UTC · eight ad- stations committed, eval 94-97, standards 1 each · 1055408..e0a89e3 · next: programme
- 23:39 UTC · failed: competency cited asme-b30-2, which competency.js does not register; dropped it · e02a076 · next: regenerate and gate
- 23:47 UTC · failed: check_ladders found no milestone quotes for the programme, because the generated modules quoted their keys (`"why":`) and gen_ladder_milestones reads `why:`; fixed by emitting unquoted keys, then re-ran every generator · — · next: gate
- 00:05 UTC · failed: check_unity_export wanted the six new builders in Models/MANIFEST.json; fixed with export_unity --models against a scratch three@0.160.0, then gen_investor · — · next: gate
- 00:20 UTC · HAND-BACK · check_all: "All 61 checkers pass." · eval: ad-cleanroom-gowning-and-esd-discipline 97, ad-cobot-risk-assessment-and-speed-separation 96, ad-robot-cell-lockout-and-safe-reentry 95, ad-amr-fleet-traffic-and-estop-drill 95, ad-test-stand-exclusion-zone-and-holds 95, ad-depot-tool-control-and-fod-walk 94, ad-hazardous-fluid-servicing-with-a-buddy 94, ad-payload-crane-lift-with-a-lift-plan 94; standards score 1 on all eight · next: integrator drives and screenshots the stations
