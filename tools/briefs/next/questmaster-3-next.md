# QUESTMASTER-3, next phase: every mechanic in the world, cosmetics on the HUD frames, Summit and Redwood through the shared state

Binds the next QUESTMASTER team. Read these first, in order:
1. `docs/consoles/memory/QUESTMASTER.md`, `QUESTMASTER-2.md`, then `QUESTMASTER-3.md`
2. `docs/skill-gates.md`
3. `docs/consoles/QUESTMASTER-3.md`
4. `tools/briefs/frontier-brief.md` and the holodeck brief's shared rules

## Where it stands (measured at hand-back)

- **Gated items: 70 across eight surfaces** — Bay World 22 (14 quests, 3 treasures, 5 K-12 courses), the Deep 13 (8 games, 3 treasures, 2 K-12 courses), the Regatta 7, Fairway 6, Redwood Reach 10, Sierra Summit 11, the station runner 1 treasure. 35 are discovered from other modules (`SM_GATED`, `RW_GATED`, `TZ_GATED`, `K2_GATED`). `node tools/check_gates.mjs`: 2644 checks, 0 failed.
- **Mechanics in the world: 3 of 12 drawn with their own meshes** (`shared/side-game-stage.js`): the lift sequencer (Bay World's rigging quay, an open gated quest's anchor), the line follow (the Deep's night line), the traffic zone (Fairway's cart path). The other nine fall back to a marker row with the current step raised. Run parity with the panel is by construction (`qmStageRun` wraps `qmPlaySteps`). Browser proof on port 8992: Bay World's crane puzzle mounted and played six steps with 0 page errors (3306 scene nodes); Fairway's storm cleanup mounted on the pin and played six steps with 0 errors (247 nodes); the Deep's night line — see the console log's last entries for its line.
- **Cosmetics on two avatars** (`shared/side-game-cosmetics.js`): four slots (head 14 ids, shoulder 33, wrist 9, fin 4 across the platform), a colour per id, decals on Bay World's person figure and the Deep's diver at load and after a clean run. Stills in `docs/img/questmaster/`.
- **K-12 courses: 7** (`shared/k12-gates-data.js`, `K2_GATED`), each opened by its field lesson's station, listed, pinned and staged in Bay World and the Deep. Gate names regenerated: 81 stations.
- **Not done this round:** cosmetics on Summit's and Redwood's first-person HUD frames; Summit and Redwood quest stores in `QM_QUEST_KEYS`; Fairway map pins (no course map yet); the full `check_all` (load average above twenty; see the log for the single checkers run).

## What to do next

1. **The other nine mechanics in the world.** Add a builder per mechanic to `QM_STAGE_BUILDERS` (switching order as a breaker line-up, the inspection grid as a rack, the overboard drill as a boat and a buoy, the delivery run as a route with a shortcut, the kitchen rush as a ticket rail, lockout steps as a panel with a lock, the survey transect as flags on a line, spill response as a dock edge with a kit, the lookout watch as a tower and a ridge). Keep every builder to the stub library's surface (see memory) so the checker can build it; extend the checker's list from three keys to all twelve.
2. **Cosmetics on the first-person worlds.** Summit and Redwood have no player figure; draw the ledger's ids as a small procedural strip on the HUD frame (`qmCosmeticSlot` and `qmCosmeticColor` give the slot and colour) and keep `check_mobile`'s overlap rules at 360 px.
3. **Summit and Redwood through the shared panel state.** Add `SM_STORE_KEY` and Redwood's career store to `QM_QUEST_KEYS` with the shape each uses, so a `gate.quests` entry naming a Summit or Redwood quest opens; seed each store in the checker and prove it.
4. **Fairway map pins** when a course map lands (`qmDrawPin`; the Regatta's course-card code is the pattern).
5. **Stage in the Regatta.** The Regatta's games carry a course and a mark; mount the stage at the mark when the boat is within the toast radius (the overboard drill and the spill response builders from step 1).
6. **Guide KB.** Seven K-12 courses are not yet in the Guide's per-world gate chunks; measure before adding (`node tools/gen_guide_kb.mjs --stdout | wc -m`; the cap is 656 KB of characters).
7. **Full suite.** Run `check_all` once at the end and record the line.

## Bar

- Twelve mechanics rendered in a world, each built by the checker.
- Cosmetics visible in four worlds (two figures, two HUD frames).
- Summit and Redwood quest gates proven open through `QM_QUEST_KEYS`.
- `check_gates` at 70+ items, 0 failed; `check_all` green with the line recorded.
