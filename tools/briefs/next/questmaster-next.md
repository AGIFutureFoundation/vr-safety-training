# QUESTMASTER, next phase: from gated rounds to playable gated games

Binds the next QUESTMASTER team. Read these first, in order:
1. `docs/consoles/memory/QUESTMASTER.md`
2. `docs/skill-gates.md`
3. `docs/consoles/QUESTMASTER.md`
4. `tools/briefs/frontier-brief.md`, whose shared rules still apply

## Where it stands (measured at hand-back)

- **Gated items: 35.** Bay World has 14 generated quests with world steps. The Deep has 8 side games, the Bay Regatta 7 and Fairway Park 6. `node tools/check_gates.mjs` runs 620 checks with 0 failures, and no gated items are discovered from other consoles yet.
- **Engine.** `shared/skill-gates.js` covers stations, K-12, programmes (all stations, or `minStars`), quests and side-game runs. Bay World's quest engine carries one hook line in each of its two advance loops.
- **Lock UI.**
  - All four worlds have the "Side games" chip and panel (open rows, locked rows, Skills to unlock, cosmetics).
  - Bay World and the Deep also have job-board rows and map pins.
  - Bay World shows the lock toast when you walk up to a site.
  - In a browser test, every world panel rendered with 0 page errors. Seeding two station records opened the Harbour Salvage Hunt, and a clean run awarded its cosmetic.
- **Scoring.** Every item plays three safe-practice calls drawn from 17 generic habits. Only a run with every call safe counts.

## What to do next

1. **Make the games playable in the world, not just in the panel.** Build one small, safe, three.js-free mechanic per item family, and keep the safe-practice score. Examples:
   - a crane lift sequencer: order the picks so nothing passes over a person;
   - a switching-order puzzle: a read-back on every step;
   - a lashing-gear inspection grid;
   - a dive-line follow with buddy checks;
   - an overboard drill with a spotter timer that is never scored on speed.
   Target 12 mechanics that cover all 35 items. Each is a pure module plus its checker cases.
2. **Add map pins and board rows in the Regatta and Fairway.** Fairway items already carry `pin: [x, z]`. The Regatta needs a site on its course map. Add the lock toast on approach in the Deep, the Regatta and Fairway.
3. **Wire the other consoles.** Gated treasures (TREASURE), the SUMMIT and REDWOOD side quests, and K-12 field lessons should reach `check_gates` through the `…GATED…` export discovery. Check that each world's data module exports its gated items and that the discovered count is above 0.
4. **Use real station names.** Links currently show `lkStationLabel`, the id read aloud. Use the catalog's display names (`WebXR/smartcity/catalog.json`) in the panel and the toast.
5. **Cosmetics on the avatar.** The ledger stores cosmetic ids, but nothing renders them yet. Show them on the account chip and on the Bay World and Deep avatars as procedural decals. Check the mobile budgets with `check_mobile`.
6. **Guide knowledge.** Add a short "side games and skill gates" entry to `tools/gen_guide_kb.mjs` so the Guide can answer "how do I unlock the night-shift crane puzzle?" with the stations to complete.
7. **Merge with `requires`.** Once FIXER's `requires` lands in `quest-engine.js`, give each Bay World gated quest a `requires` where the chain is real, such as mentor after apprenticeship. Keep `gate` for skills.

## Bar

- `check_gates` passes with 60+ items across 6+ worlds.
- 12 playable mechanics.
- Pins, rows and toasts in all four original worlds.
- 0 page errors in all four worlds, and `check_all` green.
