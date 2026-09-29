# PLAYLAYER — the Bay Area play layer (`pl`, 8990)

Environment & robotics wave, base 9914455. Brief: bring every San Francisco, Oakland, North East Bay, South Bay (and the
two Bay Program) maps up to the New Orleans play layer — three or more play-layer field lessons with real stations, KREWE-style
side quests in `#menu-krewe`, a path board in `#menu-paths`, treasures regenerated — measured by `eval_worlds` and
`tools/check_playlayer.mjs`.

## Decision: a shared Bay Area module, not more districts in `sg-sf-play.js`

`WebXR/shared/pl-bay-play.js` carries the fifteen Bay Area maps GOLDEN-B's `sg-sf-play.js` does not (Marina and Bayview stay
there). Why: `check_k12` section 8e holds GOLDEN-B's districts to five `sg-fl-` lessons each, while the other maps' lessons
carry their own consoles' prefixes (`sf-downtown-fl-`, `sf-om-fl-`, `sn-fl-`, `bm-fl-`, `eb-fl-`, `bp-…-fl-`) and three or
four lessons each, and half of them are not San Francisco. The shapes are SG's (`PL_DISTRICTS` = `SG_DISTRICTS`,
`PL_FIELD_LESSONS` = `SG_FIELD_LESSONS`), so every consumer (eval, treasures, checkers) reads `[...SG, ...PL]` the same way,
and the lessons still live in each map's own `fieldLessons` (one source for the lesson signs, this layer and the treasures).
Quests follow `kw-play-data.js`'s quest shape with a `field` last step (the map's own lesson) in place of a game (the Bay Area
maps have no kiosks); the board follows `sl-parish-play.js`'s `slPathBoard` shape and markup.

## Cycles

1. Reason: the eleven older SF lessons (sf-downtown ×4, sf-mission ×3, sf-golden-gate-park ×3, sf-outer-mission ×1) name no
   trade `station`; add one from each site's own board (the windmill lesson's lock-before-you-climb takes
   `ws-nacelle-lockout-and-yaw-brake-fault`). Check: no Bay Area lesson without a station; `check_k12` passes. Observed: 0
   lessons without a station; `All K-12 checks pass.` (2955 checks).
2. Reason: `pl-bay-play.js` re-reads the fifteen maps' lessons on SG's shape and `eval_worlds` counts them. Check: every Bay
   Area map has ≥3 play-layer lessons (`plCounts`). Observed: 17 maps, 49 new + 10 GOLDEN-B = 59 lessons, 3–5 per map.
3. Reason: KREWE-style quests (one per lesson, ending at the lesson sign) and the path board, mounted in the parishes app as the
   fallback when SECONDLINE's / KREWE's boards are empty. Check: `check_playlayer` quest, board and mount lines. Observed:
   59 quests, 17 boards, mounts found; only the treasure lines and registration failed (next cycles).

## Seams

- `plLessonsFor(parishId, siteId?)`, `plBayLessons(parishId)`, `plQuestsFor(parishId)`, `plPathBoard(parishId)` — pure.
- `plMountQuestBoard(el, parishId, { page, completed, openLesson })` → `#menu-krewe`; `plMountPathBoard(el, parishId, { page, openLesson })`
  → `#menu-paths` (both in `WebXR/parishes/js/app.js`, after SECONDLINE's and KREWE's mounts, only when those render nothing).
- `PL_DISTRICTS` / `PL_FIELD_LESSONS` / `PL_QUESTS` are plain data for TQ-BRIDGE's export (paths and packs section).
