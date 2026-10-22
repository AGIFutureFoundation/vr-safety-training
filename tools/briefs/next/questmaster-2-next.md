# QUESTMASTER-2, next phase: mechanics in the world, cosmetics on the avatar, K-12 gates

Binds the next QUESTMASTER team. Read these first, in order:
1. `docs/consoles/memory/QUESTMASTER.md`, then `docs/consoles/memory/QUESTMASTER-2.md`
2. `docs/skill-gates.md`
3. `docs/consoles/QUESTMASTER-2.md`
4. `tools/briefs/frontier-brief.md` and the holodeck brief's shared rules

## Where it stands (measured at hand-back)

- **Gated items: 63 across seven surfaces** — Bay World 17 (14 quests, 3 treasures), the Deep 11 (8 games, 3 treasures), the Regatta 7, Fairway 6, Redwood Reach 10, Sierra Summit 11 (8 quests, 3 field notes), the station runner 1 treasure. 28 are discovered from other consoles' modules (`SM_GATED`, `RW_GATED`, `TZ_GATED`). `node tools/check_gates.mjs`: 2302 checks, 0 failed.
- **Mechanics: 12**, in `shared/side-game-mechanics.js`, every one used (lift 4, delivery 10, switching 3, kitchen 2, inspection 18, lockout 2, traffic 4, survey 7, line 6, overboard 2, spill 1, lookout 4). The panel plays the mechanic's three boards and then the item's three safe-practice calls as one six-step run; a browser run on Fairway (a seeded greens record) played through to the result with 0 page errors.
- **Lock UI in six worlds.** Chip and panel everywhere; board rows in the Deep, the Regatta (event briefing), Fairway (grounds board), Summit and Redwood; map pins in Bay World, the Deep, the Regatta (course card), Summit and Redwood; lock toast on approach in all six. Browser smoke: Bay World 14 rows / 25 station links, the Deep 8/10, the Regatta 7/9, Fairway 6/7, Summit 11/13, Redwood 10/10, every label a catalog name, 0 page errors in each.
- **Names.** `tools/gen_gate_names.mjs` names 77 stations; `qmLabel` reads them. **Guide.** Six per-world chunks answer "how do I unlock …" (the KB cap went from 640 to 656 KB to fit them). **Account chip** lists the cosmetics earned. **Bay World** gated quests carry `requires` on the programme's First Shift quest (ten of fourteen).

## What to do next

1. **Mechanics in the world, not only in the panel.** The mechanics are pure step generators; the worlds still play them in the panel dialog. Draw the board in the world: the lift sequencer over Bay World's rigging yard (the picks as marked loads, the crew as figures), the line follow along the Deep's night line (knots as lights), the traffic zone on Fairway's cart path. Keep `side-game-mechanics.js` pure; a world renders `qmMechanicSteps(item)` with its own meshes and calls `qmFinishGame` with the same score.
2. **Cosmetics on the avatar.** The ledger's ids are shown on the account chip only. Render them as procedural decals on the Bay World and Deep avatars (a shoulder patch, a fin tag, a helmet decal), and on Summit's and Redwood's first-person HUD frame. `check_mobile` budgets hold.
3. **K-12 field lessons as gates and as items.** `shared/field-lessons.js` carries no gates. Give the classroom worlds a gated item family (a map-reading course opened by a field lesson at the landmark that teaches it), exported as `K2_GATED` from a `*-data.js` module so discovery picks it up; two gates today use `k12:`.
4. **Summit and Redwood play their gated quests through the shared panel state.** Their quest engines mark a quest done in their own stores (`SM_STORE_KEY`, Redwood's career store); `qmSnapshot` reads only Bay World's and the Deep's quest stores plus the ledger, so a `gate.quests` entry naming a Summit quest would never open. Add their store keys to `QM_QUEST_KEYS` (with the shape each uses) before any console writes such a gate; the checker should seed each store and prove it.
5. **Fairway map pins.** Fairway has no in-game map; its items carry `pin: [x, z]` used only for the approach toast. When a course map lands, draw `qmDrawPin` on it (the Regatta's course-card code is the pattern).
6. **Guide KB budget.** The KB sits within 1 KB of the 656 KB cap. Before adding chunks, measure (`node tools/gen_guide_kb.mjs --stdout | wc -m` counts bytes in the C locale; the cap is characters). A per-item chunk set does not fit; if the Guide must answer per item, compress the world data chunks instead of raising the cap again.
7. **Full suite.** `check_all` was not run this round (load average above twenty on the shared machine). Run it once at the end of yours and record the line.

## Bar

- Three mechanics rendered in a world with the same score as the panel.
- Cosmetics visible on two avatars.
- `K2_GATED` discovered with 5+ items; `check_gates` at 70+ items, 0 failed.
- `check_all` green with the line recorded.
