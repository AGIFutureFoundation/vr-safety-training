# Console KREWE — kits, kiosks and side quests in the five parishes

Team: KREWE · Brief: the KREWE section of `tools/briefs/bayou-brief.md` (with the Shared rules and the Crescent Facts rule) ·
Branch: a worktree off `claude/vr-ar-safety-training-wkwmve` at a643c66 · Prefix `kw` / `KW_` · Port 8992.

## Ids (fixed at minute 7 — BAYOU and the coordinator read these)

### Kiosks (mini-games at parish sites, in the shared side-game contract)
| id | parish / site (SECONDLINE's `SL_PARISHES` ids) | mechanic | union gate station(s) | reward |
|---|---|---|---|---|
| `kw-sandbag-relay` | orleans / levee-crew | delivery-run (a Motor Pool `flatbed-truck` delivers) | `br-levee-inspection-and-seepage`, `tdl-trailer-loading-and-dock-plate` | cosmetic + stamp |
| `kw-pump-startup` | jefferson / drainage-canal-pumps | lockout-steps (start-up order) | `stormwater-outfall`, `cs-non-entry-retrieval-and-tripod` | cosmetic + stamp |
| `kw-floodgate-closeout` | st-bernard / floodgate-station | switching-order (close-out checklist) | `tide-gate`, `valve-vault` | cosmetic + stamp |
| `kw-container-sort` | orleans / port-terminal | lift-sequencer (sort by stack) | `container-lashing`, `dock-crane` | cosmetic + stamp |
| `kw-ferry-lineup` | plaquemines / ferry-landing | traffic-zone (line-up lanes) | `mw-ferry-deckhand-and-passenger-safety` | cosmetic + stamp |

Stamps: `kw-stamp-<game>` (e.g. `kw-stamp-sandbag-relay`). A GRIOT character stands at each kiosk (by site kind,
through `grMount("parish:<id>", …)`'s documented `sites` shape).

### Side quests (`KW_QUESTS`): lesson → union station → mini-game
Lesson ids are BAYOU placeholders `by-<topic>` (BAYOU works in a separate worktree; the coordinator reconciles).

| quest id | lesson (placeholder) | station | game |
|---|---|---|---|
| `kw-q-sandbag-line` | `by-levee-holds` | `br-levee-inspection-and-seepage` | `kw-sandbag-relay` |
| `kw-q-rain-night-pumps` | `by-pump-rain` | `stormwater-outfall` | `kw-pump-startup` |
| `kw-q-close-the-gate` | `by-floodwall-steps` | `tide-gate` | `kw-floodgate-closeout` |
| `kw-q-box-by-box` | `by-container-sort` | `container-lashing` | `kw-container-sort` |
| `kw-q-ferry-morning` | `by-ferry-tides` | `mw-ferry-deckhand-and-passenger-safety` | `kw-ferry-lineup` |
| `kw-q-marsh-speed-bump` | `by-wetland-speed-bump` | `marsh-transect-survey` | `sl-orleans-marsh-count` |
| `kw-q-pilot-ladder` | `by-river-pilot` | `pilot-transfer` | `sl-plaquemines-pilot-transfer-watch` |
| `kw-q-family-plan` | `by-readiness-plan` | `shelter-intake-operations` | `sl-st-tammany-staging-yard-roll-out` |
| `kw-q-barn-timetable` | `by-streetcar-timetable` | `bus-depot-lift` | `sl-orleans-barn-power-switching` |
| `kw-q-fair-catch` | `by-fair-count` | `oyster-reef-monitoring` | `sl-st-bernard-harbour-recovery` |

Unused BAYOU topics KREWE can take next: `by-lake-to-tap`, `by-flood-map-colours`.

### Kits (`KW_KIT_BUILDERS` in `WebXR/shared/kw-kits.js`)
`kwStreetcar`, `kwPumpHouse`, `kwLeveeWall`, `kwFloodgate`, `kwShrimpBoat`, `kwOysterLugger`, `kwShotgunBlock`,
`kwLiveOak`, `kwBandstand`, `kwParadeBarriers`, `kwFerryLanding`.

## Plan
- `WebXR/shared/kw-kits.js` — procedural builders on the fleet/props pattern (merged-by-material meshes, ≤ 45 meshes each),
  registered in `check_fleet`'s KITS.
- `WebXR/shared/kw-place.js` — pure placement by district character and site kind (streetcar on quarter/garden avenues,
  shotgun blocks in suburb/quarter, live oaks in garden, pump house at pump sites, floodwall + gate at levee/floodgate
  sites, boats at harbour/port/ferry, ferry landing at ferry sites, bandstand in parks/campus, parade barriers on one
  quarter avenue), deterministic, capped per parish so the worst chunk stays inside `NP_BUDGET`.
- `WebXR/shared/kw-play.js` — pure: `KW_KIOSKS` (the five games, `KW_GATED` for check_gates), `KW_QUESTS`, `kwKiosksFor`,
  `kwCharacterAt` (the GRIOT character standing at a kiosk).
- `tools/check_krewe.mjs` in `check_all`.

## Log
- 22:48 UTC · Base reset from 589f0d8 to a643c66; read the brief, the previous KREWE plan, sl-parish-play.js,
  side-game-mechanics.js · next: ids (this page), then np-world/np-parish/kit patterns.
