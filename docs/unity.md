# The Unity content bridge

The platform's content is authored once, in the WebXR modules. `tools/export_unity.mjs` exports it so a Unity project can run the same procedures with the same scoring, and commits the result under `exports/unity/SmartCitiX/` as a UPM package. Nothing in the export is written by hand; `tools/check_unity_export.mjs` (in `check_all`) fails the build when it goes stale.

## Run it

```
node tools/export_unity.mjs              # content + runtime package
node tools/export_unity.mjs --models     # also the glTF models (needs the real three.js, below)
node tools/check_unity_export.mjs        # the gate: re-runs the content half and diffs
```

The content half needs only Node: it loads every simulator through the same headless harness the checkers use (`tools/lib/headless.mjs`), so a station's steps, hazards, interruptions, hit ids and equipment come from the code the browser runs. It takes about five seconds.

The models need three.js r160 itself, because the headless stub has no geometry. Either `npm install three@0.160.0` at the repository root (`node_modules/` is not committed) or point `SMARTCITIX_THREE` at a folder holding `build/three.module.js` and `examples/jsm/`. Without it the tool says so and leaves the committed `Models/` alone. The export is deterministic in both halves — keys sorted, no timestamps, `Math.random` seeded while the builders run — so a re-run on the same sources is a clean `git diff`.

## What is exported

| Path | Content | Source |
|---|---|---|
| `Content/stations/<id>.json` (606) | id, title, category, programme ids, the ordered steps (kind, target or targets, prompt, why, and each kind's configuration), the hazards, the late notes, the interruptions, the citations (registry standards the station's own text cites, plus catalog sources), the support line, the badge and game system, the scene's hit ids and the fleet, equipment and tool builders it places | `WebXR/smartcity/js/sims/*.js`, `WebXR/trades/js/rooms/*.js` (Trade Skills rooms are named `trades--<id>.json`), `WebXR/smartcity/catalog.json`, `tools/standards.json` |
| `Content/programmes/<id>.json` (51) | the curriculum with its union, certification, guides, stations and why each is there, the completion rule, the twenty-level ladder summary, the programme competency, and its anchors — every Bay World site (and Deep site, when the underwater world exists) whose `programmes` names it | `WebXR/smartcity/js/curricula.js`, `catalog.json`, `WebXR/shared/competency.js`, `WebXR/shared/bayworld-data.js` |
| `Content/worlds/bayworld.json`, `fairway.json` (and `underwater.json` when `WebXR/shared/underwater-data.js` exists) | every exported constant of the pure data module: bounds, zones, landmarks, roads, sites, holes, facility, budgets | `WebXR/shared/*-data.js` |
| `Content/index.json` | the file list, the nine step kinds, the pass rule, the categories | — |
| `package.json`, `Runtime/SmartCitiX.asmdef` | the UPM manifest (`org.agifuturefoundation.smartcitix`) and the assembly | `tools/lib/unity_runtime.mjs` |
| `Runtime/StationCatalog.cs` | loads the JSON into plain C# objects with its own small JSON reader (no package dependency) | |
| `Runtime/StationRunner.cs` | a MonoBehaviour state machine over select, sequence, find, gauge, hold, track, turn, drag and drive, with the scoring constants, combo, interruptions, step log and pass rule of `WebXR/shared/game.js` | |
| `Runtime/TrainingRecord.cs` | the record shape `WebXR/shared/records.js` writes — same fields, same CSV columns, same xAPI 1.0.3 statement, same `passed` rule — so a record from Unity reads in the web apps' instructor console and LRS export unchanged | |
| `README.md` | how to import, the licence notes | |
| `Models/*.glb` (87), `Models/MANIFEST.json` | every entry of `FLEET_BUDGET`, `EQUIPMENT_BUDGET` and `TOOLKIT_BUDGET` as a glTF binary: merged geometry re-indexed, UVs dropped, materials as base colour and finish, parts as named nodes; the manifest names each entry with its file or the reason it could not export | `WebXR/shared/fleet.js`, `equipment.js`, `toolkit.js` |

Sizes: Content 13.8 MB, Models 6.8 MB, 20.7 MB in all — inside the 40 MB the brief allows, so the models ship in the same folder rather than behind a second step.

## The same rules in C#

`StationRunner` mirrors `Session` in `game.js` method for method: `Select(hitId)`, `SetHolding(on)`, `CommitGauge()`, `Rotate(hitId, deltaTurns)`, `DropAt(hitId, distance)`, `DriveInput(throttle, steer)`, `DriveCheckDone(kind)`, `Tick(dt)`. A wrong touch costs 25, a hazard 50; a sequence in order earns 100 plus 20 per extra target; a gauge earns up to 50 more for landing near the band's centre; hold, track and drive score their clean time; an interruption answered is 120 plus up to 60 for speed, and one missed or answered wrongly is an unsafe action. Stars are 3 for a clean run inside par, 2 for at most one correction inside 1.5 × par, else 1; a run passes with two stars and no unsafe action. The checker holds the runtime's constants to `game.js`'s exports and its CSV columns to `records.js`'s.

## What is not covered

- **Scenes.** The stations' own scenery — the plaza, the district, the site apron, the props — is not exported. A Unity scene places the models the station file names (`scene.equipment`) and builds the rest; the hit ids (`scene.hits`) are what its interactables must answer to.
- **Textures.** The builders paint canvases at runtime (doors, grilles, tread, liveries); none is exported. Models carry geometry, normals and material colours only.
- **Equipment names by footprint.** A builder does not stamp its name on the rig it returns, only its footprint, so the exporter recovers the builder by matching the footprint to the budget tables. A rig a station shapes by hand with its own `userData.footprint` is listed as `unknown/<w>x<h>x<l>`.
- **Gamification.** XP, ranks, leaderboards, badges' predicates and the twenty-level ladder's per-level conditions stay in the web apps; the export carries the badge and rank names and the ladder's summary.
- **Licensed content.** Only the platform's own procedural builders (CC0) are exported. The ready-player avatar and the track GLB are never exported; the checker fails on any file that looks like either, on any model or vendor name, and on anything shaped like a token.
- **The trade rooms' scene budgets and the robot layer** (`shared/robot.js`, embodiment, episodes) are out of scope for this bridge.

## Console

The team console for this work is `docs/consoles/BRIDGE.md`.
