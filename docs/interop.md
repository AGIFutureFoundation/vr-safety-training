# Interoperability — one learner, one ledger, one set of records

Every app on the platform keeps its progress in this browser. Before the passport each kept it alone: a station finished from a Bay World job board showed in Bay World and nowhere else. `WebXR/shared/passport.js` is the one read/write API over all of those stores. It reads every store as it is and deletes none of them. It adds one small key of its own for the three things no existing store held.

## The flow

1. **Launch.** A job board opens the station in SmartCiti.X with the way home on the link: `smartcity/index.html?sim=<station>&from=<world>&return=<the world's page>#site=<site>`. The links are built by `bwMissionLink` (Bay World), `dvMissionLink` (the Deep), `rgStationLink` (the regatta's briefing stations) and `ppLaunchLink` (Fairway's grounds crew board), each given the world's own path through `ppHerePage()`.
2. **Run.** The learner runs the station as normal. At the finish, SmartCiti.X's `showResults` calls `ppRecordStation`, which writes **one** record per attempt through `records.js`. The record carries the learner (from `identity.js`), `app: "smartcity"` and `source: <world>`. When an episode is being recorded (`episodes.js`), the record and the episode carry each other's id. The Trade Skills rooms, the Holodeck and Fairway's round also record through `ppRecordStation`.
3. **Back.** The results card shows **Back to <world>** (`ppReturnTarget`). The button is only shown for a same-origin return, so the parameter can never send the learner to another site.
4. **Home.** The world reads `#site=<id>`, starts beside that site and opens its board:
   - It collects fresh returns and pays each one **once per attempt id**. Bay World and the Deep pay through their own careers (`bwCollectMissionReturns`, `dvCollectDiveReturns`, each of which already keeps a seen-record list) and then `ppAward(..., { native: true, attemptId })`. The regatta and Fairway pay through `ppCompleteReturns`, which keeps a handed-returns list in the passport, so a replayed return pays nothing.
   - A pass marks that board done (`ppMarkBoard`, read back by `ppBoardDone`).
   - Any quest step naming that station or site advances (`bwNoteStationReturn`, `dvNoteStationReturn`).
5. **Everywhere else.** `ppProgressChip(el, programmeId)` draws "<passed>/<total> passed · <stars>★ · <competency status>" from the passport alone. It appears on the home page's programme rail (lazily imported, shown once a programme has a pass), on each world's job board (Bay World and the Deep show the site's first programme, the regatta shows yacht and charter crew, Fairway shows grounds and landscaping) and in the instructor console's learner panel for the selected programme.
6. **Out.** `ppExport()` returns `{ csv, xapi }` for every attempt:
   - The CSV uses `records.js`'s columns, which now end in `source`. Unity's `TrainingRecord.cs` writes the same column, generated through `tools/lib/unity_runtime.mjs` and `tools/export_unity.mjs`.
   - Each xAPI statement carries `context.platform` naming the source world (for example "SmartCiti.X ~Holodeck · Bay World via SmartCiti.X") and a `source-app` extension.
   - The instructor console's session-log tab downloads both.

## API (`WebXR/shared/passport.js`)

| Call | What it does |
| --- | --- |
| `ppLearner()` | `{ name, id, homePage, source }` from the launch identity, else the local crew tag |
| `ppRecordStation(result, { episode })` | Writes one attempt through `records.js`, adding `source` and the episode link |
| `ppCompleted(stationId)` | True when the station has a passing attempt |
| `ppProgramme(programmeId)` | `{ id, name, passed, total, stars, competencyStatus }`, with the status from `competency.js` over the competencies built from the programme's stations |
| `ppLedger()` | `{ reputation, credits, bySource, rounds, awards }` summed across Bay World, the Deep, the regatta, Fairway and the rooms |
| `ppAward(source, { reputation, credits, reason, attemptId, native })` | Pays one award with its source kept. It is idempotent per `source:attemptId` |
| `ppOn(event, fn)` | Subscribes to an event. Returns the unsubscribe function |
| `ppLaunchLink`, `ppHerePage`, `ppReturnTarget`, `ppReturnSite` | The round trip's links, read on both sides |
| `ppMarkBoard`, `ppBoardDone`, `ppReturns`, `ppCompleteReturns` | Board state and paying for returns exactly once |
| `ppProgressChip(el, programmeId)` | The one programme progress widget |
| `ppExport()` | `{ csv, xapi }` with the source app |

The programme catalogue the passport counts against is `WebXR/shared/passport-programmes.js`. It is generated from `smartcity/js/curricula.js` by `node tools/check_interop.mjs --write`, which saves each world from bundling the full 241 KB of curricula text. The checker fails when the file is stale.

## Keys

| Key | Owner | The passport |
| --- | --- | --- |
| `vr-training-records-v1` | `records.js` | Reads and appends (through `TrainingRecords.record`) |
| `vr-training-identity-v1` (sessionStorage) | `identity.js` | Reads |
| `vr-training-profile-name` | `game.js` | Reads (the crew-tag fallback) |
| `bayworld-career-v1` | `bayworld/js/career.js` | Reads the reputation and credits. The regatta pays in here too |
| `underwater-career-v1` | `underwater/js/dive-career.js` | Reads the reputation and credits |
| `fairway-park-v1` | `fairway/js/scores.js` | Reads the rounds count. It holds no currency |
| `bayworld-quests-v1`, `underwater-dives-v1` | The quest and dive engines | Untouched. The worlds advance them on a return |
| `vr-passport-v1` | `passport.js` | `{ awards: [{ id, source, attemptId, reputation, credits, reason, native, at }], boards: { <app>: { <site>: { at, recordId } } }, returns: { <app>: [recordId] } }` |

**Migration by reading:**

- A learner's older Bay World and Deep totals count in the ledger as they stand.
- Regatta awards made before the passport stay inside Bay World's share, because they carry no source tag.
- A board whose stations were all passed before the passport shows as done.
- No store is rewritten or cleared.

**Ledger arithmetic:**

- A `native` award was already added to its world's own store. It is kept in the passport for the source split and the audit log, and is not counted a second time.
- A native regatta award is moved from Bay World's share to the regatta's.
- A non-native award (the regatta's briefing stations, Fairway's grounds board) is added on top.

## Events

| Event | Fired by | Detail |
| --- | --- | --- |
| `station-passed` | `ppRecordStation` on a pass | `{ record, stationId, source }` |
| `programme-milestone` | `ppRecordStation` when a programme crosses ¼, ½ or all of its stations | `{ programmeId, mark, progress, record }` |
| `award` | `ppAward` for a new (not duplicate) award | The award entry |

## Rules the checker holds (`tools/check_interop.mjs`)

It runs headlessly with stub storage and checks the following:

- A pass recorded from a Bay World board shows in the passport.
- A replayed return pays nothing.
- The quest step advances.
- The programme chip counts the pass.
- The export carries the source app.
- The Unity record has the `source` field.
- Each of the eight app pages' bundles (SmartCiti.X, Trade Skills, the Holodeck, the instructor console, Fairway, Bay World, the Deep and the regatta) includes `passport.js`.
- Every storage write in the four worlds names a key that existed before the passport. A new key must go through the passport, or be added to the checker's list with its reason recorded here.
