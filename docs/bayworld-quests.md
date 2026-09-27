# Bay World quests

Bay World is an Oakland/East Bay open-world game two sibling teams are
building alongside this platform: BAY1 owns the map data
(`WebXR/shared/bayworld-data.js` — `BAY_ZONES`, `BAY_LANDMARKS`,
`BAY_SITES`) and BAY2 owns the app and quest engine
(`WebXR/bayworld/`, `registerQuests(list)`). This file documents the
**quest layer** — the data and pure helpers BAY3 owns:

- `WebXR/bayworld/js/quests.js` — the combined quest list and pure helpers.
- `WebXR/bayworld/js/quests-data.js` — the data itself, **generated**.
- `tools/gen_bay_quests.mjs` — the generator.
- `tools/check_bay_quests.mjs` — the checker, part of `tools/check_all.mjs`.

Neither the generator nor its output imports BAY1's
`WebXR/shared/bayworld-data.js`, which may not exist yet in a given
worktree: sites and landmarks are plain name strings (`quest.site`,
`egg.landmark`). The checker cross-references those strings against
`BAY_SITES`/`BAY_LANDMARKS` only when that file exists, and prints a note
and skips that one assertion otherwise.

## What is generated versus authored

Running `node tools/gen_bay_quests.mjs` rebuilds
`WebXR/bayworld/js/quests-data.js` from scratch. Two different rules apply
to what ends up in it:

- The **side quests** (§2 below) are built programmatically from
  `WebXR/smartcity/js/curricula.js`'s `CURRICULA` — one opener and one
  capstone per programme, picked up automatically from whatever stations a
  programme currently lists. A programme's stations changing, growing or
  reordering is reflected the next time this script runs.
- The **main story arc** (§1), the **easter-egg field notes** (§3) and the
  **side activities** (§4) are authored as data inside the generator
  script, but every line of dialogue that names a station's own reasoning
  is pulled live from that station's `why` field in `curricula.js` rather
  than retyped, so a why-line edited there is picked up here too, and a
  station id removed or renamed makes the generator throw instead of
  silently shipping a stale quest.

Regenerate after any curricula change with real stakes for this file:

```
node tools/gen_bay_quests.mjs
node tools/check_bay_quests.mjs
```

## 1. Main story arc — the Job Readiness Edition

Seven main quests walk a new arrival through the wojrc.org pathway
described in `tools/briefs/wojrc-brief.md`, one site at a time:

| # | Quest | Site | Giver (job title only) |
|---|---|---|---|
| 0 | Where the Trades Began | Trades Heritage Walk | the hall's history keeper |
| 1 | First Day on the Floor | Bay Intermodal Warehouse | the warehouse floor supervisor |
| 2 | Yard Qualified | Class A Training Yard | the yard trainer |
| 3 | On the Road | Class A Training Yard | the driving instructor |
| 4 | Sign the Book | Apprenticeship Hall | the apprenticeship coordinator |
| 5 | Balance the Books | Financial Coaching Center | the financial coach |
| 6 | Ask for the Door | Wellness Resource Center | the wellness guide |

Each quest `requires` the one before it, and its reward tier (and so its
`reward.xp`, see §5) increases along the chain. Every "station" step's
`text` is that station's own `why` line from the Job Readiness Edition's
curriculum entry, so the chain's dialogue never states a fact about the
station beyond what the curriculum already carries. Between every two
programmes in the pathway sits one `goto` and one `talk` step of original,
plain dialogue — the giver is always a job title, never a person's name.
The whole 32-station Job Readiness Edition roster is covered exactly once
across the seven quests.

No sentence in this arc states a fact about wojrc.org beyond what
`tools/briefs/wojrc-brief.md` sources, and the edition's sponsor is not
named anywhere in the quest data — `tools/check_bay_quests.mjs` fails the
build if either of that sponsor's name fragments appears.

## 2. Side quests — every other programme

`CURRICULA.filter(p => p.id !== "job-readiness-edition")` gets two
generated quests each: an opener running its first three stations, and a
capstone (`requires` the opener) running its last three. Both quote the
programme's own `why` lines for every station step, and both close with a
`talk` step quoting the programme's own `summary` (opener) or
`certification` (capstone) text verbatim — this file invents no new facts
about any programme, it only re-presents what `curricula.js` already
states. The anchor site is the programme's own name, standing in for a
real `BAY_SITES` entry until BAY1 assigns one.

44 programmes × 2 quests = 88 side quests.

## 3. Easter-egg field notes

24 eggs, each hidden at a real, generic Bay Area public landmark and each
teaching one true safety or trade habit — quoted **verbatim**, not
paraphrased — from a real station's own step text (`cite`d as
`{ app, stationId, stepId }`). `tools/check_bay_quests.mjs` reads the
cited station's own source file as plain text and asserts both the step id
and the lesson string appear in it exactly.

Every landmark note is the landmark's public name plus one generic,
one-line description — no date, height, count, founding fact or "named
after" claim. The checker enforces this with a denylist (`built`,
`opened`, `founded`, `established`, `dedicated`, `acres`, `feet`, `miles`,
`tall`, `population`, `century`, `anniversary`, `named after`) and a flat
ban on digits in every landmark note.

Half the eggs are found by walking to the landmark (`method: "goto"`); the
other half are found by answering a short radio prompt first
(`method: "radio"`) — a call-in riddle whose answer is the lesson itself.
Eggs are collectibles, not chain progress: they carry `tier: 0` and a flat
`reward` rather than the main/side reward curve.

## 4. Side activities

Four scored activities that are not violence and not gambling, exposed as
`SIDE_ACTIVITIES` (not part of `registerQuests()`'s list, since they carry
their own scoring shape rather than the quest step schema):

| Activity | What it is | Scoring |
|---|---|---|
| Delivery Run | Drive a box truck between two sites | Time, plus the same driving checks (following distance, signalling, speed, smooth braking) the platform's Class A driving stations already score |
| Lake Merritt Loop Time Trial | A timed lap of the lake on foot | Time against four checkpoints |
| Port Yard Spotting | Spot marked equipment faults and hazard flags in a container yard | Points per correct spot, a penalty per false call, against the clock |
| Skyline Lookout Photo Mode | A non-competitive photo mode along a hillside ridge | Coverage of marked viewpoints, not competitive |

## 5. Reward tiers

Every main and side quest carries a positive-integer `tier` and a
`reward.xp` equal to `rewardForTier(tier) = 100 + (tier - 1) * 150`,
exported from both `tools/gen_bay_quests.mjs` (where it is used to build
the data) and `WebXR/bayworld/js/quests.js` (where an app or a checker
that never imports the generator can still recompute it). The checker
verifies every quest's `reward.xp` against this formula, and separately
verifies that a quest's reward is never lower than the quest it
`requires` — the two together are what "rewards monotone by tier" means
here. Egg quests are flat collectibles (`tier: 0`) and sit outside this
curve on purpose.

## 6. The quest graph

`requires` links form a directed graph across main and side quests (eggs
never require anything). `WebXR/bayworld/js/quests.js` exports
`findCycle()` (a plain DFS, returns the first cycle or `null`) and
`questGraphHasCycle()`; the checker asserts the graph is acyclic and that
every `requires` target actually exists as a quest id.

## 7. The map the quests resolve onto

BAY1's `WebXR/shared/bayworld-data.js` is the ground truth the resolvers
above (`resolveQuestSite`, `resolveLandmark`) read. Since the expansion
(`tools/briefs/bayexpand-brief.md`) the field is `BAY_BOUNDS` x:[-1200,
1200] z:[-800, 800] — 2400 × 1600 m — tiled by nearest centre into
**16 zones**: the original ten (downtown, uptown, the lake, the estuary
waterfront, the port, West Oakland, Fruitvale, the Coliseum area, the
hills and the bridge approach), none of which moved, plus an island
harbour across the estuary, a north shoreline marina town, Emery
Crossing (a small distribution-and-lab town), a south shoreline marina and
treatment plant, the upper hills above the hills, and the outer bay's open
water with a shipping channel and a buoy-tender pier at its edge. The map
carries **50 training sites** (every programme in `curricula.js` anchored
at least once) and **28 public landmarks** (plain public names, generic
one-line descriptions, no date, height, count, owner, event, organisation
or brand), joined by **15 roads** in one connected network; the height
field reads flat on the island, both shorelines and the outer bay and
climbs to a second dome on the ridge above the hills.

Generated quests resolve by programme anchor (the first site listing the
programme), main-arc quests by `MAIN_SITE_ALIASES`, eggs by
`LANDMARK_ALIASES`; the expansion's new sites and landmarks need no alias
because no existing quest names them, and `tools/check_bayworld.mjs`
raises its floors to 16 zones, 28 landmarks and 50 sites. The game
(`WebXR/bayworld/js/`) and `tools/check_bayworld_game.mjs` read every
count from the data rather than assuming one.

## Regenerating and checking

```
node tools/gen_bay_quests.mjs      # rebuild quests-data.js from curricula.js
node tools/check_bay_quests.mjs    # the checks in this file, standalone
node tools/check_all.mjs           # the whole platform, check_bay_quests.mjs included
```
