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
`kwLiveOak`, `kwBandstand`, `kwParadeBarriers`, `kwFerryLanding`, and two small ones added at 23:04: `kwKioskBoard`
(the kiosk itself) and `kwSandbagStack` (the relay's load).

### For the coordinator and ASSAYER (the GRIOT mount)
GRIOT's parish characters are keyed by site kind; Jefferson's pump site is kind `pumping-station` and St. Bernard's
floodgate is `floodgate`, so a mount over `parish.sites` alone does not put a character at every kiosk. Pass the kiosks
first: `grMount(\`parish:${parish.id}\`, { three: THREE, root, sites: [...kwGriotSites(parish), ...parish.sites], groundAt, pos })`
(`kwGriotSites` from `shared/kw-play-data.js`; records in grMount's documented `{ id, name, kind, position }` shape).

### For BAYOU (lesson ids)
KREWE's quests hold `by-levee-holds`, `by-pump-rain`, `by-floodwall-steps`, `by-container-sort`, `by-ferry-tides`,
`by-wetland-speed-bump`, `by-river-pilot`, `by-readiness-plan`, `by-streetcar-timetable`, `by-fair-count` (list in
`KW_BAYOU_LESSONS`, which `check_krewe` holds the quests to). If BAYOU's ids differ, change `KW_BAYOU_LESSONS` and the ten
`kwMakeQuest` rows together; BAYOU's apply-steps can point at the five `kw-*` kiosk ids above.

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

## Decisions
- Kits are baked once per parish into one vertex-coloured geometry each and drawn as one InstancedMesh per kit (the
  engine's own convention), so the whole dressing of a parish is at most 13 draw calls and 45,000 triangles
  (`KW_DRESS_BUDGET`); builders still follow the fleet contract so `check_fleet` holds meshes and footprints.
- Streetcars only in Orleans (the streetcar is Orleans's); everything else by district character or site kind.
- Kiosks reuse the side-game panel (`qmMountSideGames`): the parishes app lists them with SECONDLINE's games. Scoring
  is safe practice only: the mechanic's steps, the shared practice calls and three kiosk-specific calls
  (`calls`, appended by `qmRounds`); every call safe earns the cosmetic, and the kiosk's stamp is derived from the
  clean run (`kwStampsEarned(snap)`), so no new storage key.
- The sandbag relay names the Motor Pool `flatbed-truck` as its delivering drivable (`drivable`); the flatbed itself
  is driven through MOTORPOOL's board once ASSAYER mounts it.
- Shotgun blocks front the streets and keep clear of the engine's massing parts (8 m), so they never sit inside a
  quarter block; a massing hook in np-world would let a district swap its generic house for the block (next brief).

## Log
- 22:48 UTC · Base reset from 589f0d8 to a643c66; read the brief, the previous KREWE plan, sl-parish-play.js,
  side-game-mechanics.js · next: ids (this page), then np-world/np-parish/kit patterns.
- 22:55 UTC · Ids committed (46c8a68); every gate station verified in CURRICULA · next: kits.
- 22:58 UTC · `kw-kits.js` (eleven builders, in check_fleet's KITS: 141 builders green), `kw-place.js`,
  `kw-play-data.js`; qmRounds appends a game's own calls (1c077a4) · next: wiring and checker.
- 23:01 UTC · Parishes app dresses the parish and lists the kiosks; the three modules in the parishes bundle;
  `check_krewe.mjs` in check_all; check_gates learns a game's own calls; gate names regenerated (b6ae7fe).
- 23:05 UTC · Kiosk boards and sandbag stacks; check_krewe builds every parish on the vendored three.js with the
  engine: worst Orleans 184 meshes / 99,349 triangles (21befd8).
- 23:09 UTC · Side-quest board on the parish menu; parishes bundle rebuilt; browser smoke on 8992 for five parishes
  at 1280×720 and 360×640, no page error (a1f61bf).
