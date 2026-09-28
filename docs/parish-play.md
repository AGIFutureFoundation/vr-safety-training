# Parish play — quests, gates, treasures and field lessons across the five parishes

Console SECONDLINE (`docs/consoles/SECONDLINE.md`, the Crescent brief). The five New Orleans parishes — Orleans, Jefferson, St. Bernard, Plaquemines and St. Tammany — are streamed worlds on the shared parish schema (PARISH builds the engine and Orleans; DELTA the other four). This layer gamifies them from one data module, `WebXR/shared/sl-parish-play.js`, keyed by parish id and site id.

## The Facts rule

Real places are named only by their public names, as places. Nothing in this module states a date, a statistic, a population, an address or a business; nothing carries a coordinate (positions belong to `np-data-<parish>.js`); every lesson teaches a generic idea and says which trade uses it. `tools/check_parish_play.mjs` fails a digit or a fact-shaped word (built, opened, founded, population, acres, miles …) anywhere in the learner-facing text.

## Binding to the parish data

The consoles work in parallel, so a site is bound by **id first, then by `match`**: `slResolveSite(parishData, siteId)` returns the data site with the same id, else the first whose id, name or kind matches the SL site's pattern (`hospital|medical`, `pump`, `causeway` …). A connector binds by kind and the two parishes, either way round (`slResolveConnector(parishData.connectors, id)`). When an `np-data-<parish>.js` is in the tree, the checker proves every SL site and connector binds; until then it says so and checks the data alone.

Orleans's ten sites carry the PARISH section's ten kinds: `port-terminal`, `levee-crew`, `pumping-station`, `streetcar-barn`, `rail-yard`, `hospital-district`, `university-campus`, `stadium-district`, `hospitality-row`, `wetlands-restoration`. Every site names existing catalog stations by trade and union ids from `tools/unions.json`, and a giver (a job title, never a name).

## What the module holds

| Export | What | Count |
|---|---|---|
| `SL_PARISHES` | parishes → sites (id, name, kind, match, trades, stations, giver) | 5 parishes, 42 sites |
| `SL_CONNECTORS` | the crossings the arc uses: the river bridge, the river road, the river road south, the river ferry, the causeway, the lake bridge | 6 |
| `SL_MAIN_QUESTS` | the storm-season readiness arc: Walk the Levee → Keep the Pumps Turning → Tie Down the Port → The Hospital Stays Open → Down the River Road → Across the River → North Shore Staging; one `requires` chain, every step `goto`, `talk`, `station`, `lesson`, `cross` or `game`; rewards are badges and XP tiers (`slRewardForTier`) | 7 quests, 5 parishes, 5 crossings |
| `SL_SIDE_GAMES` = `SL_GATED` | skill-gated side games in the shared contract (`docs/skill-gates.md`): `world: "parishes"`, `parish`, `site`, `siteName`, `task`, `mechanic`, `gate`, `practices`, `reward.cosmetic`; every one of the twelve mechanics used; one K-12 gate | 35 |
| `SL_FIELD_LESSONS` | the Redwood field-lesson shape plus `parish` and the trade `station`: `{ id (sl-fl-), parish, site, k12, station, trade, tradeLine, title, minutes, steps[3], check { q, options, answer, why } }`; one at every site, every classroom programme reached | 42 |
| `SL_HANDOFFS` | one hand-off per site per kind — station, lesson, game, treasure hint — with the site's giver; the line is the target's own title, re-read verbatim | 161 |
| `SL_PATHS`, `slPathBoard()`, `slMountPathBoard()` | the "choose your path" board at every parish gate | 5 boards |

Helpers: `slParish`, `slSiteDef`, `slSiteName`, `slLessonsFor`, `slGamesFor`, `slGameById`, `slLesson`, `slMainQuest`, `slFindCycle`, `slSitePlay(parish, site)` (everything at one site), `slCounts()`.

## Hooks for the other consoles

- **PARISH (the engine).** List `shared/sl-parish-play.js` in the parishes bundle after `links.js`, `skill-gates.js`, `side-games-data.js`, `side-game-mechanics.js` and `treasures.js`. At the parish gate: `slMountPathBoard(el, parish.id, { page: "parishes.html", treasures: n })`. On the world page: `qmMountSideGames({ world: "parishes", items: slGamesFor(parish.id), page: "parishes.html" })`, `qmBoardRows` on a site's job board with `slGamesFor(parish.id, siteId)`, and `tzWatchWorld("parishes", { scene, THREE, pos, camera, groundAt, at: slTreasureAt(parish) })`. When a field lesson's check question is answered right, `tzLessonAnswered(lesson.id)`. The arc's `cross` steps name a connector; `slResolveConnector(parish.connectors, step.connector)` gives the crossing to draw.
- **GRIOT (characters).** `slHandoffsFor({ parish, site })` lists what a character at a site can hand off; `slHandoffTarget(h)` gives `{ kind, id, title, href, gate?, open?, missing? }` — a station link through `links.js`, `#lesson=` or `#game=` on the parishes page, and nothing for a treasure hint (a treasure stays hidden). A locked game's hand-off carries its `missing` rows for the character to say.
- **TREASURE (the ledger).** `tools/gen_treasures.mjs` adds the `parishes` surface: a Storm Kit Cache off every site (lesson: the site's own station why or a why from one of its programmes, verbatim) in five per-parish sets, and a quiet Field Scholar find for every parish lesson. A parish trigger is site-relative — `{ world: "parishes", parish, site, dx, dz, r }` — and `tzWatchWorld`'s new `at(trigger)` option resolves it; `tzTriggerAt(t, at)` is the helper.

## KREWE: kits, kiosks and side quests (docs/consoles/KREWE.md)

- **Kits.** `shared/kw-kits.js` holds thirteen procedural kits in the fleet contract (a streetcar, a pump station house with its discharge pipes, a floodwall section, a floodgate, a shrimp boat, an oyster lugger, a shotgun-house block, a live oak with root buttresses, a bandstand, a parade barrier run, a ferry landing, a kiosk board, a sandbag pallet). `shared/kw-place.js` (pure) places them by site kind and district character; `kwDressParish(root, THREE, parish, { tier })` bakes each kit once and draws every placement as one InstancedMesh, so a parish's dressing is at most 13 draw calls and 45,000 triangles (`KW_DRESS_BUDGET`). Streetcars appear only in Orleans.
- **Kiosks.** `shared/kw-play-data.js`'s `KW_KIOSKS` (also `KW_GATED`) are five mini-games in the side-game contract at SECONDLINE sites: `kw-sandbag-relay`, `kw-pump-startup`, `kw-floodgate-closeout`, `kw-container-sort`, `kw-ferry-lineup`. Each is behind union stations, scored on safe practice (the mechanic, the shared practice calls and the kiosk's own `calls`, which `qmRounds` appends), and rewards a cosmetic and a stamp (`kwStampsEarned(snap)`, derived from the clean run). The parishes app lists them with SECONDLINE's games. `kwGriotSites(parish)` gives grMount-shaped site records so a GRIOT character stands at each kiosk.
- **Side quests.** `KW_QUESTS`: ten quests, each a lesson (a BAYOU id, placeholders `by-<topic>` until reconciled), a union station and a mini-game; `kwMountQuestBoard(el, parish.id, { completed, onGame })` draws them on the parish menu.
- **Checker.** `tools/check_krewe.mjs` (in `check_all`) holds the kits' triangles, the placements (water, roads, levees, caps, budgets with the engine on the vendored three.js), the kiosks, the quests, facts and wiring; `check_fleet` holds the kits' meshes and footprints; `check_gates` discovers `KW_GATED`.

## Checkers

- `tools/check_parish_play.mjs` (in `check_all`): the sites, the arc, the games' mechanics, the lessons' anchors, the hand-offs, the boards, the caches, the binding to any parish data module present, hygiene.
- `tools/check_gates.mjs`: reads `SL_GATED` by name (the module is not a `*-data.js`); 25+ parish games, five or more per parish, each at an SL site with its name and an explicit mechanic; the parishes page's lock UI is checked once `WebXR/parishes/js/app.js` exists.
- `tools/check_treasures.mjs`: the `parishes` floor (40), a cache at every site, site-relative triggers with no coordinate, the resolver's binding, the parish lessons' quiet finds.
- `tools/check_k12.mjs` §8d: the parish lessons — 25+, five or more per parish, anchored, classroom and trade stations resolving, three steps, a check with a why, no digit, reading level inside the field-lesson bound, every programme reached.
- `tools/gen_gate_names.mjs` reads `SL_GATED` so every gated station has its display name. Run `node tools/gen_treasures.mjs` before `node tools/gen_gate_names.mjs` (the gated caches name stations too).

```
node tools/gen_treasures.mjs && node tools/gen_gate_names.mjs
node tools/check_parish_play.mjs
node tools/check_gates.mjs && node tools/check_treasures.mjs && node tools/check_k12.mjs
```
