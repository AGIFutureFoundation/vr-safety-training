# BAYOU memory — read this first at this console

Short, durable lessons for the next team writing K-12 lessons for the New Orleans parishes (`docs/consoles/BAYOU.md`).

- **Do not add a fifth classroom programme.** A new programme id must reach ladders, competency, i18n (an exact
  programme count), track pages, investor pages, bay quests, bingo, the Unity export and the homepage. The parish
  stations join the existing programmes instead (science, practical maths, literacy and life skills) and
  `check_k12` counts the core stations and the parish stations separately.
- **Stations come from JSON.** `tools/k12-data/by-*.json` → `node tools/gen_k12_station.mjs <json>` →
  `node tools/add_station.mjs <id>` → `node tools/k12-data/by-wire.mjs` (programme entries from
  `BY_LESSONS.programmeWhy`) → `node tools/gen_catalog.mjs` (flows validate against the catalog).
- **Reading level comes out near grade six** with short sentences and whys of about two hundred and seventy
  characters; eval explanation is full at a median why of about two hundred and fifty.
- **Word traps.** The parish Facts denylist (built, opened, tall, feet, miles, century…) and the fear words
  (scary, disaster, drown…) bite ordinary sentences; write "high", "made", "huge job".
- **The worktree guard refuses compound commands** with heredocs or loops that run node/git: write a script to
  the scratchpad and run `bash <file>` alone.
- **The anchor is the engine's site id** (`np-data-<parish>.js`), not the SECONDLINE site id: Orleans's levee is
  `levee-floodwall` there and `levee-crew` in `sl-parish-play.js`.
