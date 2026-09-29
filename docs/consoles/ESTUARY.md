# Console ESTUARY — K-12 ecology of the Bay

Team: ESTUARY · Brief: `$SP/epa/bay-program-brief.md` (ESTUARY section) with `packs-brief.md` (Shared rules, Kids rule),
`packs-brief-3.md` (the reactor loop), `tools/briefs/k12-brief.md`, `tools/briefs/station-brief.md` · Base: `039f09e` ·
Port 8972 · Prefix `es`. Facts: `$SP/epa/epa-2026-facts.md` only, and only in the two program stations.

## Lesson ids (published for BAYQUEST, STORYLINE and the coordinator)

| # | Station id | Flow id | Apply step (BAYQUEST id if it ships; own fallback always) |
| --- | --- | --- | --- |
| 1 | `k12-es-where-the-storm-drain-goes` | `es-storm-drain` | fallback `es-apply-drain-trace` (line-follow) |
| 2 | `k12-es-what-a-trash-capture-device-does` | `es-trash-capture` | `bq-trash-capture-cleanout` (fallback `es-apply-screen-sort`, inspection-grid) |
| 3 | `k12-es-rain-gardens-a-sponge-in-the-sidewalk` | `es-rain-garden` | `bq-rain-garden-build` (fallback `es-apply-garden-layers`, lift-sequencer) |
| 4 | `k12-es-the-tidal-marsh-nursery` | `es-marsh-nursery` | fallback `es-apply-nursery-spotting` (lookout-watch) |
| 5 | `k12-es-mud-on-the-move` | `es-mud-on-the-move` | `bq-tidal-channel-dig` (fallback `es-apply-sediment-path`, line-follow) |
| 6 | `k12-es-too-much-of-a-good-thing` | `es-nutrients` | fallback `es-apply-nutrient-balance` (switching-order) |
| 7 | `k12-es-the-bay-food-web` | `es-food-web` | fallback `es-apply-food-web-links` (inspection-grid) |
| 8 | `k12-es-plastics-and-the-bay` | `es-plastics` | fallback `es-apply-shoreline-sweep` (survey-transect) |
| 9 | `k12-es-clean-air-at-the-port` | `es-clean-air-port` | `bq-zero-emission-yard-shuffle` (fallback `es-apply-yard-route`, delivery-run) |
| 10 | `k12-es-who-does-this-work` | `es-who-does-this-work` | fallback `es-apply-crew-match` (inspection-grid) |
| 11 | `k12-es-count-it-a-fair-survey` | `es-count-it` | fallback `es-apply-bird-tally` (survey-transect) |
| 12 | `k12-es-measure-a-rain-garden` | `es-measure-rain-garden` | fallback `es-apply-garden-pacing` (survey-transect) |

Registry module: `WebXR/shared/es-bay-lessons.js` (`ES_LESSONS`, `ES_APPLY_STEPS`, `esLessons()`, `esApplyFor(id)`,
`esStartLesson(id, where)` → SCHOLAR `scStartSession` guarded, `esModule()` → a DEAN-assignable module shape).

## Plan (fixed before code)
- Twelve K-12 stations from `tools/k12-data/es-*.json` via `gen_k12_station.mjs` + `add_station.mjs`, wired by
  `tools/k12-data/es-wire.mjs` into `k12-science` / `k12-practical-math` / `k12-literacy-and-life-skills` (BAYOU's route).
- Anchors: San Francisco district sites (np-data-sf-*.js); Oakland ids from BAYMAP (`oak-west-oakland`) as a guarded
  second anchor (`npParish(id)?.sites.find(...)`) for the port, trash capture and careers lessons.
- `WebXR/shared/es-bay-lessons.js`; flows `WebXR/flows/es-*.json` from `tools/gen_es_flows.mjs`; check_k12 section 10.
- Program facts only in `k12-es-who-does-this-work` and `k12-es-clean-air-at-the-port`, words not digits, from the facts file.

## Cycles
1. Reason: the station pipeline works for Bay lessons (storm drain, trash capture) → eval_content 95+. Observe: 94/93 first
   (explanation 91, originality 0) — fixed in cycle 3.
2. Reason: registry + flows + check_k12 section 10 → "All K-12 checks pass". Observe: failed once — trash capture read at
   Flesch–Kincaid 3.5, under the station floor of 4.
3. Reason: lengthen nine whys in trash capture (reasons, not padding) → reading 4–8 and eval 95. Observe: reads 4.9 (storm
   drain 4.4), both stations 95; check_k12 all pass (2,522 checks).
4. Reason: flows documented → check_flowhub passes. Observe: failed ("docs/flowhub.md does not describe es-storm-drain.json"),
   section added, "All FlowHub checks pass".
5. Reason: ten more stations + lessons + fallback games → check_k12 all pass, eval 95+. Observe: check_k12 all pass
   (2,955 checks); eval 93–97 — seven stations under 95 on explanation (median why under 250 chars).
6. Reason: add one reasoned sentence to the shortest whys of those seven → all twelve 95+. Observe: 95 ×8, 96 ×3, 97 ×1;
   check_k12, check_flowhub, check_smartcity ("All 700 simulators pass") all pass.

## Stations (eval · band · Flesch–Kincaid station / lesson lines · anchor · apply)
| Station | Eval | Band | Reading | Anchor (Oakland, guarded) | Apply (fallback) |
| --- | --- | --- | --- | --- | --- |
| where-the-storm-drain-goes | 95 | upper primary | 4.4 / 1.1 | sf-marina/marina-seawall-crew | es-apply-drain-trace |
| what-a-trash-capture-device-does | 95 | upper primary | 4.9 / 2.0 | sf-mission/islais-creek-pump-station (oak-west-oakland/outer-harbor-container-terminal) | bq-trash-capture-cleanout (es-apply-screen-sort) |
| rain-gardens-a-sponge-in-the-sidewalk | 95 | upper primary | 5.0 / 2.0 | sf-mission/mission-school-campus | bq-rain-garden-build (es-apply-garden-layers) |
| the-tidal-marsh-nursery | 95 | upper primary | 5.1 / 2.9 | sf-bayview/herons-head-wetland | es-apply-nursery-spotting |
| mud-on-the-move | 95 | lower secondary | 4.8 / 2.3 | sf-bayview/yosemite-slough-restoration | bq-tidal-channel-dig (es-apply-sediment-path) |
| too-much-of-a-good-thing | 95 | lower secondary | 5.2 / 2.9 | sf-marina/crissy-marsh-crew | es-apply-nutrient-balance |
| the-bay-food-web | 96 | upper primary | 5.2 / 2.7 | sf-marina/fort-mason-piers | es-apply-food-web-links |
| plastics-and-the-bay | 96 | upper primary | 4.6 / 2.9 | sf-golden-gate-park/ocean-beach-lifeguard-station | es-apply-shoreline-sweep |
| clean-air-at-the-port | 97 | lower secondary | 6.5 / 2.3 | sf-bayview/port-southern-terminals (oak-west-oakland/west-oakland-air-monitoring-station) | bq-zero-emission-yard-shuffle (es-apply-yard-route) |
| who-does-this-work | 95 | lower secondary | 6.1 / 2.3 | sf-downtown/market-street-union-hall (oak-west-oakland/mandela-parkway-union-hall) | es-apply-crew-match |
| count-it-a-fair-survey | 96 | upper primary | 5.2 / 1.1 | sf-bayview/india-basin-park-crew | es-apply-bird-tally |
| measure-a-rain-garden | 95 | upper primary | 5.1 / 2.0 | sf-golden-gate-park/sunset-school-campus | es-apply-garden-pacing |


## Seams
- `esStartLesson(id, where)` → SCHOLAR `scStartSession(lessonId, where)` (guarded). `esModule()` → DEAN module shape
  `{ id: "es-bay-ecology", title, audience: "classroom", lessons: [{ lessonId, station, flow, band, minutes }] }`.
- `esApplyFor(lesson, { bqGame })` prefers BAYQUEST's `bqGame(id)` when present, else the ESTUARY fallback.
- `esOaklandSite(lesson, { npParish })` resolves the BAYMAP site once `np-data-oak-*` merges (null until then).

## Left
- Not mounted in the parishes app yet (the lessons launch from their station links and flows; a site-board mount like
  BAYOU's is the next step). BAYOU's `by-flow-agent.js` is tied to BY_* apply games, so ESTUARY flows run on flowhub only.
- Headless drive of each station and screenshots not done; eval_worlds not run.
