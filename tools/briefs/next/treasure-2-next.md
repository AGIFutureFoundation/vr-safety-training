# TREASURE-2 — next phase brief

Read first: `docs/consoles/memory/TREASURE.md`, `docs/consoles/memory/TREASURE-2.md`, `docs/treasures.md`,
`docs/consoles/TREASURE-2.md`, and the frontier brief's shared rules and gate contract (they still bind). Prefix `tz…`.

## Where it stands (measured)
- 159 treasures on 13 surfaces (home 6, Guide 12, Trade Skills 9, runner 14, Atlas 5, arcade 6, race 11, Bay World 24,
  the Deep 16, the Regatta 13, Fairway 9, Sierra Summit 15, Redwood Reach 19), 16 themed sets with badges, 10 gated
  (one programme gate: the seventh harbour bell on `port-operations`, minStars). `node tools/check_treasures.mjs`: 8/8.
- Gates go through `shared/skill-gates.js` (`qmIsOpen`/`qmMissing`); `TZ_GATED` is discovered by `check_gates.mjs`
  (857 checks, 0 failed; 10 treasures among 56 gated items).
- `tools/check_treasures_live.mjs` (in `check_all` after `check_links`): 17/17 in headless Chromium — the homepage's
  constellation, upside-down code and seven knocks; Summit's 15 markers planted, an open cairn found and hidden, a gated
  cairn's lock with a station link. It takes about a minute on the shared machine.
- The Treasure Map counts the earlier egg layers read-only (hard hats 14, field notes 6, Bay egg notes 34, Deep lanterns
  24, Summit notes 32, Redwood tins 36) from their own stores; `tzEarlierEggs()` returns counts only.
- `treasures.js` never spells the three.js global (asserted); arcade, race and Atlas bundles carry the treasure layer and
  the gate engine without three.js.
- Not measured this phase: `check_mobile` frame cost with 19 spinning octahedra in Redwood on the low tier (they are far
  apart and one draw call each, but nobody has timed it); Redwood's markers in the browser (only Summit ran live).

## Do next
1. **Themed rather than pooled lessons.** `siteLesson()` falls back to `pickWhy(re)`, and four Redwood treasures took an
   unthemed why (`decon-line`, `se-steam-trap…`, `rad-survey`, `ust-removal`), as do several race-course and Trade
   Skills lessons. Map each place to a named station's `why` in the generator (a table, not a regex), and make the eval
   flag any treasure whose lesson station is in a different programme from its place.
2. **Redwood live.** Extend `check_treasures_live.mjs` with Redwood (press its menu start, wait for `__redwoodTest`,
   teleport onto a logbook page and onto the gated one) and with one Guide lore question; keep the whole checker under
   two minutes.
3. **K-12 field lessons as quiet treasures.** SCHOLAR's field lessons (`SM_FIELD_LESSONS`, `RW_FIELD_LESSONS`,
   `shared/field-lessons.js`) each have a check question; make answering one find a treasure (`how: "lesson"`), lesson
   text lifted from the field lesson's own `trade` line. That is 20+ more treasures without a marker or a mesh.
4. **Accessibility.** Every marker reachable without a pointer: a "look around" key in each world that lists nearby
   markers as buttons (reuse the reveal card's chrome), screen-reader text for the constellation, and a
   `prefers-reduced-motion` stop for `tzSpin`.
5. **Frame cost.** Time `check_mobile` on the low tier with all Redwood and Summit markers in view; if it moves the
   budget, batch the markers into one `InstancedMesh` per world (still no `THREE.` in `treasures.js` — the caller's
   `T3` builds it).
6. **Programme and quest gates.** Only one programme gate exists. Gate the last Summit tower tag on the `energy-transition`
   programme and one Redwood page on a Redwood side quest id (`quests: [id]`) once `skill-gates.js` reads
   `redwood-career-v1` and `summit-v1` quest completions (today `QM_QUEST_KEYS` lists only Bay World and the Deep — that
   is QUESTMASTER's change to make, not this console's).
