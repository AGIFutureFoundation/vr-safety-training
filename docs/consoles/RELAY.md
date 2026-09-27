# Console RELAY — cross-app interoperability

Team: RELAY · Brief: `tools/briefs/interop-brief.md`, with `console-brief.md` · Branch: `claude/vr-ar-safety-training-wkwmve`

Deliverables: `WebXR/shared/passport.js` (the learner passport over records, identity, competency and every world's ledger); the round trip from every world's job board through a finished SmartCiti.X station and back (`&return=`, "Back to <world>", board done, award once per attempt id, quest advance); `ppProgressChip` on the home rails, the job boards and the instructor console; `ppExport` with the source app; `tools/check_interop.mjs` in `check_all`; `docs/interop.md`.

- 21:50 UTC · Branch fetched and fast-forwarded to 119fc78; briefs, records, identity, episodes, lrs, competency, game, the SmartCiti.X runner, every world's progress store, gen_home, the instructor console, TrainingRecord.cs and the bundler read. Baseline gate: All 59 checkers pass · next: passport.
- 21:58 UTC · Decisions: the passport adds one key (`vr-passport-v1`: awards with source, boards done, returns handed) and reads every other store; worlds that already pay into their own career (Bay World, the Deep, the regatta via Bay World) record a `native` award so the ledger never counts twice; the programme catalogue is generated to `shared/passport-programmes.js` (27 KB) rather than bundling the 241 KB curricula into every world; records gain a `source` column (CSV, xAPI `source-app` extension and `context.platform`), carried to Unity through `tools/lib/unity_runtime.mjs` and `export_unity.mjs` · next: commit, then the round trip.
