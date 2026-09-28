# SECONDLINE-2 brief — the parishes play layer, one phase further

Read first: `docs/consoles/memory/SECONDLINE.md`, `docs/consoles/SECONDLINE.md`, `docs/parish-play.md`, the Crescent brief's Shared rules and Facts rule for New Orleans, `docs/skill-gates.md`, `docs/treasures.md`. Prefix `sl`; the module is `WebXR/shared/sl-parish-play.js`.

## Where SECONDLINE left it (measured)

- 5 parishes, 42 sites (Orleans 10 on the PARISH section's ten kinds; 8 each elsewhere), 6 connectors; every site names 2–6 `CURRICULA` stations and union ids.
- Main arc: 7 chained quests, 5 parishes, 5 connector crossings (bridge, road, road, ferry, causeway), 47 steps.
- 35 skill-gated side games (Orleans 10, Jefferson 6, St. Bernard 6, Plaquemines 6, St. Tammany 7), all twelve mechanics used, one K-12 gate; `check_gates` 4135 checks, 112 gated items platform-wide.
- 42 field lessons (one at every site; every classroom programme reached; reading grade ≤ 7, 4–16 words per sentence, no digit).
- 84 parish treasures (42 Storm Kit Caches, 10 of them gated, in five per-parish sets; 42 quiet field-lesson finds); 273 treasures platform-wide in 22 sets.
- 161 NPC hand-offs (station, lesson, game, treasure hint at every site), lines re-read verbatim.
- 5 choose-your-path boards (trade / classroom / play), rendered with locks as text and a link per required station.
- `tools/check_parish_play.mjs`: 3880 checks. Binding to `np-data-<parish>.js` is written but ran against zero modules (none in this tree).

## The next phase

1. **Bind to the real data.** When PARISH's and DELTA's `np-data-<parish>.js` land, run `node tools/check_parish_play.mjs`: every SL site must bind by id or `match`, every connector by kind and parishes. Where a bind fails, prefer renaming the SL site id to the data's id over widening `match`. Then move the parish game pins onto the HUD map (`qmDrawPin` with the bound site position) and the path board into the parish gate screen; add the `parishes` app to `check_gates`'s wiring list once `WebXR/parishes/js/app.js` mounts `qmMountSideGames`.
2. **Play the arc in the engine.** `SL_MAIN_QUESTS` is data; PARISH's engine needs a small state machine (like `bayworld/js/quest-engine.js`) that advances `goto` on arrival at the bound site, `cross` on arrival at the connector's far end, `station` on a 1+ star record, `lesson` on `tzLessonAnswered`, `game` on a clean run. Keep the gate hook to one line, as Bay World does. Store under one new key listed in `GT_PROFILE_KEYS`, and teach `check_interop` about it.
3. **Field lessons in the world.** Mount the lessons through `field-kiosk.js` (`k2BuildKiosks`) at the bound sites and route the check answer to `tzLessonAnswered(l.id)`; extend `check_k12` §8d to assert the kiosks once the page exists.
4. **GRIOT hand-offs live.** Characters at a site call `slHandoffsFor({ parish, site })` and speak `slHandoffTarget(h).title`; a locked game's `missing` rows are the character's third move. Add a `check_npc` assertion that every parish character's hand-off id is in `slHandoffIds()`.
5. **Guide.** `gen_guide_kb.mjs` now emits one `gate:parishes` chunk; add a chunk per parish for the path board ("what can I do in St. Bernard Parish?") if the KB cap (640 KB) allows — measure first.
6. **More play, same rules.** Ten more games so every site has one (seven sites have none: check `slGamesFor(parish, site)`), a second arc for the north shore (the piney woods fire season), and connector treasures once connector positions exist (`trigger.connector` resolved like sites). Every lesson stays digit-free and place-fact-free; `check_parish_play`'s denylist is the bar.

## Bars to hold

`node tools/check_parish_play.mjs`, `check_gates`, `check_treasures`, `check_k12`, `check_guide` green; the full `check_all` once at the end; `gen_treasures` before `gen_gate_names` before `gen_guide_kb`.
