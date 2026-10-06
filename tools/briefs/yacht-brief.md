# Yacht and charter crew brief — the yacht in the training and the game

Binds the YACHT1 team. `station-brief.md`, `ladder-brief.md`, `assets-brief.md`, `proof-brief.md` and `wave100-brief.md` apply in full.

## The pack
Prefix `yc-`, programme `yacht-and-charter-crew`, category "Maritime & Ports", eight stations on a mid-size motor yacht at a marina berth and under way on the estuary. Crew roles: deckhand, mate, engineer, steward. Unions and training bodies are the registry's own maritime entries only (`ibu`, `siu`, `mmp`, `meba`, `sup`, `mfow` and their training bodies as `tools/unions.json` / `tools/standards.json` list them); do not add a union.

1. `yc-pre-departure-safety-briefing-and-guest-count` — guest count against the manifest, life-jacket stowage shown, muster point, no-go areas, the captain's standing orders read back.
2. `yc-line-handling-and-docking-in-crosswind` — spring line first, hands clear of the bight, fenders at the rub rail, cleat hitch, the `drag`/`turn`/`track` kinds for the approach.
3. `yc-fuel-dock-transfer-and-spill-kit` — declaration before transfer, absorbent boom staged, vent watch, no phones, the spill kit within reach; quantities are never stated ("per the vessel's fuel plan").
4. `yc-engine-room-pre-start-and-bilge-check` — blower run before start, bilge sniff and pump test, sea strainer, belts and hoses, hearing protection.
5. `yc-man-overboard-recovery-drill` — spotter never loses sight, throwable first, approach from downwind, recovery at the swim platform with the propellers stopped.
6. `yc-galley-fire-and-fixed-system` — fuel shut-off, fixed system pull, portable extinguisher on a pan fire, guests mustered, the vent and hatch drill.
7. `yc-tender-launch-and-guest-transfer` — davit and tender launch, kill-cord on, weight limit "per the tender's plate", guest step-across with two hands free.
8. `yc-shore-power-connection-and-in-water-electrical-safety` — cord inspection, connect at the boat first, the pedestal breaker last, the no-swimming-at-the-berth rule, a tingling report treated as an emergency.

Every station: 12–15 steps, at least 6 distinct kinds, 4 hazards, 2 interruptions with a visible scene change, `why` and `supportLine`, at least 5 citations in exact registry form (candidates: `33 CFR 83`, `33 CFR 155`, `33 CFR 156.150`, `46 CFR 25`, `46 CFR 199`, `NFPA 306`, `29 CFR 1910.147`, `29 CFR 1910.132`, `IBU`, `SIU`, `MM&P`, `MEBA` — check `tools/standards.json` and use only what it holds). No fuel quantity, distance, wind speed, weight, voltage or clause number is ever stated; thresholds read "per the vessel's safety management plan", "per the captain's standing orders", "per the tender's plate". Eval at or above 92 with a standards score of 1.

## The yacht itself
Add to `WebXR/shared/fleet.js` (beside `workboat`): `motorYacht(parent, x, y, z, opts)` — a ~24 m motor yacht: hull with bow flare and swim platform, main deck house, flybridge with radar arch and mast light, side decks with rails and stanchions, mooring cleats at bow, spring and stern, a fuel fill, a shore-power inlet, a tender in a davit on the aft deck, navigation lights; `yachtTender` (a rigid inflatable with an outboard and kill-cord); and `marinaBerth` in `WebXR/shared/props.js` (finger dock, cleats, a power pedestal with breaker, a fire-extinguisher box, a spill-kit cabinet, a fuel-dock pump with boom). Register in `FLEET_BUDGET` / `FLEET_BUILDERS` (and the props equivalent), with parts the stations can reach; `check_fleet.mjs` must pass. Use the shared textures (`textures.js`) for the hull and deck.

## The game
- Anchor the programme in `WebXR/shared/bayworld-data.js`: add `"yacht-and-charter-crew"` and the eight station ids to the `estuary-marina-boatyard` site's `programmes` / `stations`.
- In `tools/gen_bay_quests.mjs`'s authored sections add one side activity `bw-activity-harbor-cruise` (kind `cruise`, vessel `motor yacht`, scored on guest count read back, lines and fenders stowed, no-wake speed held in the marina, wake watch on the estuary, a clean return to the berth) and two field-note eggs at the Estuary Marina (a rope-work note and a night-lights note; generic, no history). Run `node tools/gen_bay_quests.mjs`; the opener and capstone side quests for the programme come from the generator.
- Programme in `CURRICULA` (accent `#2b6f9e`, one-sentence `why` per station), competency in `WebXR/shared/competency.js` (`require: 4`; add any standard ids its local `STANDARDS` table lacks).

## Process
Start with `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge --ff-only FETCH_HEAD`. Commit each green station, then one commit for the fleet/props builders and one for the registration; each commit's message ends with the two trailer lines given in your task. Regenerate (`gen_catalog`, `gen_bay_quests`, `gen_compliance`, `gen_wiki`, `bundle_webxr.py`) and finish with `node tools/check_all.mjs` ending in the exact "All N checkers pass" line and `node tools/eval_content.mjs --json` scores for the eight. Hand back within 60 minutes: ≤250 words, commit hashes, the check_all line, the eight scores.
