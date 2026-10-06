# Bay World expansion brief — a larger map, an island harbour and the shoreline towns

Binds the BAY4 team. `bayarea-brief.md`'s facts rule and the rules at the top of `WebXR/shared/bayworld-data.js` apply: public place names only, generic one-line descriptions, no date, height, count, owner or event, no real organisation or brand.

## The expansion
Grow `BAY_BOUNDS` to x:[-1200,1200], z:[-800,800] (2400 × 1600 m). Keep every existing zone, landmark, site and road exactly where it is (quests, the game and the checkers reference them). Add six zones, placed so nearest-centre assignment still gives every landmark and site its own declared zone:
- `island-harbour` (an island across the estuary, south of the waterfront): sites `island-yacht-harbor` (programmes `yacht-and-charter-crew`, `bay-area-union-edition`; stations: the `yc-` ids if present, else the marine stations already in the catalog), `island-ferry-landing`, `island-airfield-park`; landmarks `island-ferry-landing-clock`, `island-beach-esplanade`.
- `north-shoreline` (a university-town marina and pier to the north-west): sites `north-marina-pier`, `north-shoreline-field-lab` (environmental monitoring and bay restoration programmes); landmark `north-pier`.
- `emery-crossing` (a small distribution-and-lab town between the port and the north shoreline): sites `emery-distribution-center` (warehouse and logistics), `emery-lab-campus` (healthcare support); landmark `emery-public-market`.
- `south-shoreline` (a marina and treatment plant to the south-east): sites `south-shoreline-marina`, `south-treatment-plant` (water and gas utility crews); landmark `south-shoreline-park`.
- `upper-hills` (the ridge above the hills): sites `ridge-fire-lookout` (first responders), `ridge-reservoir-yard`; landmark `ridge-trail-summit`.
- `outer-bay` (open water west of the port with a shipping channel and a buoy-tender pier at its edge): site `channel-buoy-tender-pier` (port operations); landmark `channel-marker`.
Each new site anchors real programme ids from `WebXR/smartcity/js/curricula.js` and real station ids; every programme must still be anchored somewhere.

Roads: extend the network so it stays one connected piece — an island crossing (a bridge or tube approach), a north shoreline arterial, a south shoreline arterial and a ridge road; `bayRoadAt` and the far-corner test in `tools/check_bayworld.mjs` must still pass. Heights: the island, the shorelines and the outer bay read flat; the upper hills read higher than the hills; the height function stays continuous. Update `BAY_MESH_BUDGET.high` and the builder in `WebXR/shared/bayworld.js` so the new zones build (water for `outer-bay`, a marina with berths, a ridge lookout) within the budget; the `low` vignette does not change.

## The game and the checkers
- `WebXR/bayworld/js/city.js`, `map.js`, `world.js`, `app.js`: nothing may assume 10 zones, 37 sites, 21 landmarks or 10 roads; the minimap scales from `BAY_BOUNDS`; traffic and buildings come from the data.
- `tools/check_bayworld_game.mjs`: replace the hard-coded counts with counts read from the data; keep the quest walk-throughs.
- `tools/check_bayworld.mjs`: raise the minimums to 16 zones, 28 landmarks, 50 sites.
- `tools/check_bay_quests.mjs` and `node tools/gen_bay_quests.mjs` must stay green (new sites need no quests, but add each new site and landmark to the alias tables in `WebXR/bayworld/js/quests.js` if the resolvers need them).
- `docs/bayworld-quests.md` and the header comment of `bayworld-data.js`: update the counts and the geometry paragraph.

## Process
Start with `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge --ff-only FETCH_HEAD`. Commit in steps (data, builder, game, checkers, docs); each commit message ends with the two trailer lines given in your task. `python3 tools/bundle_webxr.py` and `node tools/check_all.mjs` must end in the exact "All N checkers pass" line before the hand-back. Hand back within 60 minutes: ≤250 words, commit hashes, the check_all line, the new zone/site/landmark/road counts and the high-detail mesh count.
