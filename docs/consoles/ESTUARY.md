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
