# Skill gates: side quests and games you unlock by learning

Console QUESTMASTER (`tools/briefs/frontier-brief.md`). A quest, side game, treasure or egg can carry a **gate**: it stays locked until the learner has finished the named training. A locked item is still shown on maps and boards, with a padlock, the reason and a link to each required station. Treasures are the only items that stay hidden, because finding them is the point. A gate is never used to hide something.

## The contract

```js
gate: {
  stations?:   ["crane-yard", ...],                // complete at 1+ star in the attempt log
  programmes?: [{ id: "hotel-workers", minStars?: 4 }],  // every station done, or best stars summed >= minStars
  quests?:     ["bw-main-02-yard", ...],           // Bay World quest, a Deep dive, or a clean side-game run
  k12?:        ["k12-reading-a-map-scale-in-bay-world"],  // a classroom programme station, 1+ star
  note: "Crane yard and dock crane stations before you take a night-shift lift."
}
```

- `WebXR/shared/skill-gates.js` is the engine. It uses no DOM and its storage can be injected.
  - `qmSnapshot()` reads the attempt log (`vr-training-records-v1`), the quest stores (`bayworld-quests-v1`, `underwater-dives-v1`) and the side-game ledger (`qm-side-games-v1`, which is stored per profile).
  - `qmIsOpen(gate, snap)` and `qmMissing(gate, snap)` answer the gate. `qmMissing` returns rows ready to display.
  - `qmSkillsToUnlock(items, snap)` builds the "Skills to unlock" roll-up.
  - `qmFinishGame(game, { score, of })` records a run.
  - `qmCachedSnapshot()` re-reads at most once a second, for per-frame callers.
- `WebXR/shared/skill-gates-ui.js` is the lock UI:
  - `qmMountSideGames()` adds the "Side games" chip in the shared nav and opens the quest-log panel. The panel lists open rows, then locked rows, then **Skills to unlock** and the cosmetics earned.
  - `qmBoardRows()` adds rows to a job board.
  - `qmLockToast()` shows the lock reason with links to the required stations.
  - `qmDrawPin()` draws a map pin: a padlock while locked, a star once open.
- **Bay World hook.** `bayworld/js/quest-engine.js` has one line in each advance loop: `if (quest.gate && !qmIsOpen(...)) continue;`. That is the only gate logic in the engine, so the change that makes the engine honour `requires` merges beside it cleanly.

## The items (35)

| World | Where the data lives | Count |
|---|---|---|
| Bay World | `tools/gen_bay_quests.mjs` generates `GATED_QUESTS` in `bayworld/js/quests-data.js`. Each entry is a real quest (goto, talk, find, and one drive) at a programme's site. | 14 |
| The Deep | `shared/side-games-data.js`, `QM_WORLD_GAMES.underwater` | 8 |
| The Bay Regatta | `shared/side-games-data.js`, `QM_WORLD_GAMES.regatta` | 7 |
| Fairway Park | `shared/side-games-data.js`, `QM_WORLD_GAMES.fairway` | 6 |

Examples:
- The night-shift crane puzzle is opened by the crane yard and dock crane stations.
- The harbour salvage hunt is opened by the dive supervisor and lift-bag rigging stations.
- The timed-but-safe delivery run is opened by the pre-trip and air-brake test stations plus the Yard Qualified quest.
- The grid restoration puzzle is opened by the line truck and substation switching stations.
- The kitchen rush is opened by the kitchen, knife skills and allergen control stations.
- The regatta rescue drill is opened by the overboard recovery and cold-water immersion stations.
- Two items use K-12 gates, a map-scale course and a buoyancy trim course.

**Scoring and rewards.** Every item is scored only on safe practice. A round is one prompt with a safe call and an unsafe call. The prompts come from `QM_SAFE_PRACTICES`, which holds generic habits phrased "per the plan / label / dive plan" and contains no numbers. Only a run in which every call is safe marks the item done and unlocks its one cosmetic avatar item. A run with an unsafe call counts as practice. Nothing can be bought, nothing is random and nothing scores harm.

## Adding gated items from another console

Export an array whose name contains `GATED` from a `*-data.js` module under `WebXR/`. The module must not import from a CDN. Each item needs at least `{ id, world, title, gate, practices, reward: { cosmetic } }`. `tools/check_gates.mjs` discovers the module and checks each item. To show the items, mount `qmMountSideGames({ world, items, from, page })` on the world page and add the three modules to that world's bundle.

## The checker

`node tools/check_gates.mjs` is part of `check_all`. It checks that:
- every gate id resolves (stations, K-12 stations, programmes, quests) and that each station link routes to a page that exists;
- every item has a note, and the note contains no digit;
- a fresh profile sees every item locked, the exact required completions open it, and removing one required station locks it again;
- scoring, rewards and wording follow the rules above;
- the side-game ledger behaves correctly and is stored per profile;
- the quest-engine hook stops a locked quest from advancing and lets an open one advance;
- each world mounts the lock UI and each world's bundle includes the modules.
