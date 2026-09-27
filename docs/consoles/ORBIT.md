# Console ORBIT

- Team: ORBIT
- Brief: `tools/briefs/industry-worlds-brief.md` (ORBIT section, and "What simulation options means here"), with `station-brief.md`, `assets-brief.md`, `wave100-brief.md` and `console-brief.md`
- Branch of record: `claude/vr-ar-safety-training-wkwmve`
- Scope: aerospace-and-defence depot training (civilian-style workplace safety only) and a robotics factory and training centre. Prefix `ad-`, programme `aerospace-defense-and-robotics`.

## Log

- 23:10 UTC · fetched and fast-forwarded to ebd2f94; read the briefs, the aviation and warehouse stations, the kits, districts and checkers · — · next: the builder set
- 23:22 UTC · plan: builders cleanRoomBay, testStand, depotHangarBay (reuses regionalJet), robotCell, cobotBench in equipment.js; teachPendant in toolkit.js; AMRs reuse amrRobot. Districts robotics-factory, robotics-training-centre, aerospace-depot. Eight `ad-` stations, each declaring one `?fault=` read in its own build() (no shared plumbing had landed on a fetch) · — · next: commit builders
