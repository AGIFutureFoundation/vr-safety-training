# Treasures

Hidden treasures and easter eggs are spread across the whole platform (console TREASURE,
`tools/briefs/frontier-brief.md`). They add to the older eggs in `docs/easter-egg.md` (the hard hats,
the field notes, the Foreman's Radio, the racer and the arcade), Bay World's egg field notes
(`docs/bayworld-quests.md` §3) and the Deep's lanterns. They do not replace any of them.

## What a learner sees

- **Treasure Map** (`WebXR/treasures.html`, copied beside the homepage in `WebXR/dist/`). The account
  chip's dialog on every page links to it and shows the count. The map shows found and unfound counts
  for each world and area, set progress and badges, and the lessons from the treasures already found.
  It never shows the name, hint or place of an unfound treasure: `tzMapModel()` is the only thing it
  reads, and the checker proves nothing unfound gets into it.
- **Reveal.** A small card scales in with a gold glint and shows the treasure's name, the lesson, where
  the line comes from and the set progress. It also names a badge when the find completes a set.
  With reduced motion on, the card appears without the animation.
- **Earlier eggs.** The map's last section counts the older egg layers read-only from their own
  stores — the golden hard hats and field notes in the stations, Bay World's egg field notes, the
  Deep's lanterns, Sierra Summit's field notes and Redwood Reach's field tins. `tzEarlierEggs()`
  reads each layer's key through the same profile storage and returns counts only; nothing is copied
  into `vr-treasures-v1`, and the checker proves no egg id leaves the counts.
- **Look around.** In every open world the L key lists the still-visible treasure markers within
  ninety metres as buttons in the reveal card's chrome (distance only, never a name), and choosing
  one picks it up where the learner stands, so every marker is reachable without a pointer. The
  homepage constellation's stars are focusable buttons with screen-reader labels, and with
  reduced motion on the markers hold still.
- **Quiet treasures.** Answering a field lesson's check question right on Sierra Summit or in
  Redwood Reach finds a treasure with no marker and no mesh; the lesson shown is the field
  lesson's own trade line.
- **Locked treasures.** A few treasures use the frontier gate contract
  (`gate: { stations, programmes, quests, k12, note }`), answered by the shared gate engine
  (`WebXR/shared/skill-gates.js`, `docs/skill-gates.md`) — the same engine the side quests and games
  use. A locked treasure shows as a grey marker. Reaching or clicking it shows its note and a link to
  each station it needs (a programme requirement reads as "n of m stars"), and the find is not
  recorded. The seventh harbour bell is the one programme-gated capstone. Most treasures have no gate
  and are there to be found by exploring. The gated treasures are exported as `TZ_GATED`, so
  `tools/check_gates.mjs` verifies them with every other gate on the platform.

## Where they are (counts only — the places are the fun)

| Surface | Count | How they are found |
|---|---|---|
| Homepage | 6 | a seven-star constellation in the hero, a Konami-style key sequence (not the racer's), knocking on the brand line seven times, a typed word, the hard-hat counter, a glint |
| The Guide | 12 | secret questions: ask for the secret, lore or legend of a union, and the Guide answers with that union's line from the registry |
| Trade Skills | 9 | one brass mark in every room |
| Station runner | 14 | twelve left-behind tools at twelve stations, the tool crib, and a perfect-run secret |
| The Atlas | 5 | marks placed around the Atlas's own page controls |
| Break Room Arcade | 6 | a token for the first finished round on each cabinet, plus two glints |
| Night Highway Circuit | 11 | a finish on every course (a mirrored course counts as the original), plus a glint |
| Bay World | 24 | Seven Harbour Bells along the waterfront, one for each maritime union's registry line, and crew caches at the inland training sites |
| The Deep | 16 | sea glass beside dive sites, away from the lanterns |
| The Regatta | 13 | a pennant off every rounding mark |
| Fairway Park | 9 | a lost ball off every tee |
| Sierra Summit | 25 | a cairn off every trail vertex and a tag at the foot of the ridge's transmission towers, plus a quiet find for every field lesson's check question answered right; the field notes at the sites and landmarks stay the world's own |
| Redwood Reach | 29 | logbook pages blown from the fire lookout along the fire roads, a blaze on every foot trail, plus a quiet find for every field lesson's check question answered right; the field tins at the landmarks stay the world's own |

There are 179 treasures in 17 themed sets. Completing a set earns a badge, for example Bell Ringer for all seven harbour bells.

## Nothing invented

`tools/gen_treasures.mjs` builds `WebXR/shared/treasures-data.js`. It never writes a lesson by hand.
Each lesson is copied word for word from one of these sources, and the treasure's `source` field names
that source:

- a union's note in `tools/unions.json`
- a standard's title in `tools/standards.json`
- a station's `why` line in `WebXR/smartcity/js/curricula.js`
- a trade tool's note in `WebXR/shared/toolkit.js`
- a cabinet's "what this teaches" line in `WebXR/arcade/js/games/`
- one line from a station's own sim file
- a field lesson's own trade line in `WebXR/shared/summit-data.js` or `WebXR/redwood/js/rw-lore-data.js`

Lessons are themed, not pooled: a place's treasure takes one of the place's own stations' whys,
then an unused why from one of the place's programmes, and a place with no station of its own (a
Trade Skills room, a racing course) is mapped to a named station in a table in the generator.
Every station lesson carries `place: { id, stations }`, and the checker flags any whose lesson
station sits in a different programme from its place.

Places come from the worlds' own data (`BAY_SITES`, `DEEP_SITES`, `RG_COURSES`, `FAIRWAY_HOLES`,
`SM_TRAILS` and `SM_TRANSMISSION`, `RW_ROADS` and `RW_TRAILS`).
Bay World treasures sit at training sites because the egg field notes already use the landmarks.
Deep treasures sit six metres from dive sites, away from the lanterns. Summit and Redwood treasures
sit off trail, road and tower vertices, at least fifteen metres from every field note or tin, out of
the water and outside every site's pad; the checker measures all three.

## How it is built

- `WebXR/shared/treasures.js` stores the ledger under the key `vr-treasures-v1` and reads and writes it
  through `profiles.js`'s `gtStorage()`. The key is in `GT_PROFILE_KEYS`, so each signed-in learner, the
  device and the demo tab each keep their own ledger, and the demo's ledger ends when the tab closes.
- Every finder calls one entry point, `tzFind(id)`. It checks the gate, records the find, shows the
  reveal and fires `tz:found`.
- The account chip (`account.js`) arms each page's DOM finders on every page. The Guide's `gdAsk()`
  checks for a secret question first. SmartCiti.X and Trade Skills call
  `tzPlantHost(root, T3, host)` after a station or room is built, handing in their three.js library
  as `T3`. Bay World, the Deep, the Regatta, Fairway, Sierra Summit and Redwood Reach call
  `tzWatchWorld(world, …)` once their scene exists. The arcade and the racer call
  `tzArcadeRound()` and `tzRaceFinish()`; Sierra Summit and Redwood Reach call `tzLessonAnswered(id)`
  when a field lesson's check question is answered right.
- `treasures.js` is shared chrome and never spells the three.js global itself: the bundler loads
  three.js into any page whose modules do, and the account chip rides on every flat page. The
  library always comes from the caller.
- Gates: `tzGateOpen(gate)` and `tzGateMissing(gate)` call the shared engine's `qmIsOpen` and
  `qmMissing`. The bundler adds `skill-gates.js` (and `passport-programmes.js`) to every app that
  carries the treasure layer, and copies them into `dist/shared/` for the flat Treasure Map page.
- Plants and world markers do their own raycasting, the same way the hard hats do. They never join a
  station's selectables, so a treasure can never affect a step or a score.
- The bundler adds `treasures-data.js` and `treasures.js` after `profiles.js` in every app that
  includes `account.js` or `guide.js`. All top-level names start with `tz`.

## Checks

`node tools/check_treasures.mjs` runs as part of `tools/check_all.mjs`. It checks the following:

- the counts for each surface
- every lesson, re-read word for word from its source
- every placed station lesson is in one of its place's programmes; the field-lesson treasures
  name a real lesson and carry its trade line
- the sets and badges
- the ledger: repeat finds do nothing, finds persist, and each profile keeps its own (device and demo included)
- the gates: answered through the shared engine; every station and programme id resolves, a fresh profile sees locked, one completion short stays locked, the completions open it
- the map model, which must not leak anything unfound
- the finders: the Guide's answers, the DOM anchors on their pages, plants within reach, world markers inside the world's bounds, Summit and Redwood markers clear of the field notes and tins and out of the water, an answered field lesson finds its treasure, the look-around key and the constellation's keyboard reach, the reduced-motion stop
- that every app is wired and bundled

```
node tools/gen_treasures.mjs       # rebuild the data
node tools/check_treasures.mjs     # these checks
```
