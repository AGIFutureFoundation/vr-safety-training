# BAYQUEST — complementary quests, Crew Credits and easter eggs for the Bay Program

Team: BAYQUEST · Brief: `$SP/epa/bay-program-brief.md` (BAYQUEST section) with `packs-brief.md` (Shared rules, Kids rule)
and `packs-brief-3.md` (the reactor loop) · Base `039f09e` · Port 8973 · Prefix `bq`. Facts about the EPA awards and
Clean Ports come only from `$SP/epa/epa-2026-facts.md` (copied verbatim, with its source links, into `bq-facts.js`).
Crew Credits stay a play currency (TYCOON's ledger); nothing here touches billing or payments.

## Published ids (also in `$SP/epa/bayquest-ids.md`)
- Games: `bq-trash-capture-cleanout`, `bq-rain-garden-build`, `bq-tidal-channel-dig`, `bq-zero-emission-yard-shuffle`.
- Treasure set: `bq-bay-keepers-trail` (treasures `bq-t-*`).

## Plan
1. **Games** `WebXR/shared/bq-games-data.js` (`BQ_GAMES`, `BQ_GATED` for check_gates' discovery): four side games in the
   shared contract (docs/skill-gates.md) — a mechanic from `side-game-mechanics.js`, three+ safe-practice keys, three
   game calls (safe/unsafe), a cosmetic reward, a gate on real catalog stations (`br-trash-capture-device-service`,
   `op-excavator-trench-and-utility-locate`, `br-tidal-marsh-grading-amphibious-excavator`,
   `et-ev-fleet-depot-charging-and-arc-flash` + `po-yard-hostler-and-pedestrian-separation`), with BAYKEEPER / CLEANPORTS
   station ids recorded as `pendingStations` (guarded, joined by the coordinator). Anchored at Bay World sites, with
   BAYMAP Oakland ids and San Francisco district sites as guarded second anchors. The tidal dig builds a NEWTON world
   (`nwWorld`) with TERRAFORM water (`tfWaterDepthAt`/`tfFlowAt`, guarded) — spoil into bins, never into the water;
   the yard shuffle names CLEANPORTS' electric drivables (guarded) and falls back to MOTORPOOL's yard class.
2. **The Bay Keeper's Trail** `tools/gen_bq_trail.mjs` -> `WebXR/shared/bq-trail-data.js`: gen_treasures' readers
   (station `why` lines verbatim from curricula.js, places from BAY_SITES), themed to the program's categories (trash
   capture, stormwater, green infrastructure, tidal marsh, sediment, nutrients, fish habitat, PCB, zero-emission port),
   plus facts-file lines (verbatim, with the release URL). Each placed off water (`txWaterTopAt`) and off roads
   (`bayRoadAt`), 15 m clear of each other.
3. **Crew Credits** `bq-bayquest.js`: `bqEarnStation(id, level)` -> `tyEarn`; `bqEarnGame(id, score)` pays by score band
   once per game (record `bq-game:<id>`); two TYCOON businesses (`native-plant-nursery` on
   `br-native-planting-and-erosion-mats`, `charging-yard-stand` on `et-ev-fleet-depot-charging-and-arc-flash`), their
   checklists verbatim from sims-meta taglines, registered through a new TYCOON seam `tyAddBusinesses` (the five stay the five).
4. **Stories** `BQ_STORIES` in STORYLINE's `stQuestsFor` shape for Union Trades, K-12, Disaster Relief and Just-Roam-friendly
   (`roam: true`, no prompt), chaining ESTUARY lessons (`k12-es-*`, guarded), stations and the games; registered through
   a new STORYLINE seam `stAddStories`. DEAN template "Bay Program week" (`bqDeanTemplate()`, `dnModules` shape, guarded).
5. **Checker** `tools/check_bayquest.mjs`.

## Seams
- `bqGames()`, `bqGame(id)`, `bqTrail()`, `bqEarnStation(id, {level})`, `bqEarnGame(id, score)`, `bqStories(pathId)`,
  `bqDeanTemplate()`, `bqMount({ world })` in `WebXR/shared/bq-bayquest.js`.
- TYCOON: `tyAddBusinesses(list)`; STORYLINE: `stAddStories(list)`.

## Cycles
1. Reason: four games in the gate contract, discovered by check_gates. Act: `bq-games-data.js` (BQ_GATED). Observe:
   check_gates first run "5 failed" (unknown station `confined-space`, four missing display names) -> gate on
   `cs-non-entry-retrieval-and-tripod`, regenerated gate names -> "7082 checks · 0 failed".
