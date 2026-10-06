# TREASURE-3 — next phase brief

Read first: `docs/consoles/memory/TREASURE.md`, `TREASURE-2.md`, `TREASURE-3.md`, `docs/treasures.md`,
`docs/consoles/TREASURE-3.md`, and the frontier brief's shared rules and gate contract (they still bind). Prefix `tz…`.

## Where it stands (measured)
- 179 treasures on 13 surfaces (home 6, Guide 12, Trade Skills 9, runner 14, Atlas 5, arcade 6, race 11, Bay World 24,
  the Deep 16, the Regatta 13, Fairway 9, Sierra Summit 25, Redwood Reach 29), 17 themed sets with badges, 10 gated.
  `node tools/check_treasures.mjs`: 9/9. `check_gates.mjs`: 857 checks, 0 failed.
- Lessons are themed, not pooled: every placed station lesson carries `place: { id, stations }`; the generator and the
  checker both assert the lesson station's programme is one of the place's (75 placed station lessons judged, 0 off-programme;
  before this phase 6 Summit/Redwood, 10 race and 3 Trade Skills lessons were pooled). Rooms and courses that are not
  stations map to a named station in `ROOM_WHY` / `TRACK_WHY` in `tools/gen_treasures.mjs`.
- 20 field-lesson treasures (`how: "lesson"`, set Field Scholar): Summit's 10 and Redwood's 10 field lessons each find
  one when the check question is answered right (`tzLessonAnswered(id)`), lesson = the field lesson's own trade line.
- Pointer-free: the L key (`TZ_LOOK_KEY`, `near` 90 m) lists visible markers as buttons by distance only; the
  constellation's stars are focusable buttons with labels; `tzSpin` holds still under `prefers-reduced-motion`.
- `tools/check_treasures_live.mjs`: 29/29 in headless Chromium in 1 min 58 s (homepage finders, a Guide lore question,
  Summit 15 markers + open/gated, Redwood 19 markers + open/gated, L key list + Enter pick). It is at the two-minute
  line: add nothing to it without taking something out or sharing the browser with `check_mobile`.
- Frame cost, SwiftShader (relative only): Summit 332 ms/frame with 15 markers spinning vs 310 ms/frame hidden — about
  7 %, one draw call each. Not measured: Redwood's 19 (same code path), a real device, the low tier explicitly.
- check_summit 4579/0, check_redwood 395/0, check_guide 252 (KB regenerated), check_investor current, check_imports 869.

## Do next
1. **K2 field lessons in the four flat worlds.** `K2_FIELD_LESSONS` (Bay, Deep, Regatta, Fairway) have check questions
   but no in-world answering flow — the map only lists them with a link. Once SCHOLAR adds an in-world check (or a
   check on the map row), add them to the generator's field-lesson block (`tradeLine`, source `shared/field-lessons.js`)
   and call `tzLessonAnswered(id)`; that is 20+ more quiet treasures.
2. **Instanced markers if the budget moves.** The 7 % SwiftShader delta did not justify an `InstancedMesh` per world;
   measure on the low tier in `check_mobile` (TC_ONLY=redwood.html) before and after hiding `treasure:*` meshes. If the
   delta is over a frame budget's tenth, batch per world with the caller's `T3` (still no `THREE.` in `treasures.js`).
3. **Look-around everywhere in the controls overlays.** Only Summit and Redwood list the L key in `ctlMount`; add the
   row to Bay World, the Deep, the Regatta and Fairway (the key already works there) and a touch button where the
   touch layer has room.
4. **Programme and quest gates.** Still one programme gate. Gate the last Summit tower tag on `energy-transition` and
   one Redwood page on a Redwood side quest once `skill-gates.js` reads `summit-v1` and `redwood-career-v1` quest
   completions (QUESTMASTER's change).
5. **Lesson treasures on the Treasure Map.** The map counts them under "Field lessons" per world; a line under the
   Earlier eggs section could say how many field lessons remain (counts only, from `summit-v1.lessons` and
   `redwood-career-v1.lessons`), the way the earlier eggs are counted read-only.
