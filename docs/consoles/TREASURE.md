# Console TREASURE

- Team: TREASURE — hidden treasures and easter eggs through the whole system
- Brief: `tools/briefs/frontier-brief.md` (TREASURE section, shared rules, gate contract)
- Branch: worktree of `claude/vr-ar-safety-training-wkwmve`, merged by the coordinator
- Prefix: `tz…` (the language layer owns `tr…`)
- Memory: `docs/consoles/memory/TREASURE.md` · next brief: `tools/briefs/next/treasure-next.md`

## Log
- 05:25 UTC · gate: fetch + ff-only merge to 11cbde3; read the frontier brief, docs/easter-egg.md, docs/bayworld-quests.md, shared/eggs.js, the Deep's lantern eggs · next: design a generated treasure layer that builds on the hard hats / field notes rather than duplicating them
- 05:45 UTC · plan: generator `tools/gen_treasures.mjs` → `WebXR/shared/treasures-data.js` (every lesson verbatim from unions.json / standards.json / curricula.js whys / toolkit.js notes / arcade TEACHES); runtime `WebXR/shared/treasures.js` (ledger through gtStorage, gate contract, reveal, finders); Treasure Map `WebXR/treasures.html`; bay treasures at SITES (Bay eggs own the landmarks), Deep sea glass 6 m off sites (lanterns sit 2 m off landmarks) · next: build
- 06:10 UTC · 125 treasures on 11 surfaces, 12 sets, 7 gated; wired: account chip (dialog link + tzArmPage on every page), Guide (gdAsk secret questions), SmartCiti.X + Trade Skills (tzPlantHost after room.build), Bay World / Deep / Regatta / Fairway (tzWatchWorld), arcade (round over), race (results); bundler auto-inserts treasures-data.js + treasures.js after profiles.js wherever account.js or guide.js ride; dist gets treasures.html + both modules · next: checker
- 06:12 UTC · fixed: the homepage already binds the classic up-up-down-down code to the racer egg, so the treasure uses it upside down instead of colliding · next: check_treasures.mjs
