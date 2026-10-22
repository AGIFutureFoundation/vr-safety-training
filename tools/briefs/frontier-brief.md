# Frontier brief — skill-gated play, treasures, K-12 everywhere, and two new large worlds

Binds consoles SCHOLAR-2, QUESTMASTER, TREASURE, SUMMIT and REDWOOD. Read, in this order: `tools/briefs/console-brief.md`,
`tools/briefs/assets-brief.md`, `tools/briefs/station-brief.md` (for any station), `tools/briefs/k12-brief.md` (K-12),
`docs/bayworld-quests.md`, and the brief section for your console below. The shared rules here override nothing in those.

## Shared rules (all consoles)
- **Facts rule.** Never invent facts, numbers, clause numbers or limits; limits read "per the plan / permit / label / dive plan".
  Real organisations are named only as `tools/unions.json` and `tools/standards.json` already name them; add a registry entry
  only with a source line. No real brands or logos; union marks as wordmarks only.
- **No violence, no gambling, no loot boxes, no purchases.** Rewards are badges, stamps, cosmetic avatar items, map reveals.
- **Assets** are procedural and licence-clean (CC0/CC-BY only if imported, credited). Mobile budgets hold (`check_mobile`).
- **Bundler.** `tools/bundle_webxr.py` concatenates modules into one scope and erases import aliases: prefix every new top-level
  name with your console's prefix (SCHOLAR-2 `k2…`, QUESTMASTER `qm…`, TREASURE `tr…` is taken by i18n — use `tz…`, SUMMIT `sm…`,
  REDWOOD `rw…`).
- **Links.** Every door, board, kiosk and quest step resolves to a working page through `WebXR/shared/links.js`; every page has
  Home and the Guide (see how POLISH wired `theme.js` / `controls.js`).
- **Memory.** Besides your console log, keep `docs/consoles/memory/<CONSOLE>.md`: short durable lessons (what broke, the fix,
  the conventions you learned) that the next team at this console should read first. Update it at each commit.
- **Metaprompting.** Before hand-back, write `tools/briefs/next/<console>-next.md`: the brief you would give the next team to
  take your work one phase further, with the measured numbers that justify it (eval scores, counts, frame budgets).
- **Evals.** Stations are scored by `node tools/eval_content.mjs` (aim 95+). World/quest/egg work is scored by your checker.
- **Gate.** Start with `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge --ff-only FETCH_HEAD`. Commit in
  steps; messages end with the two trailer lines in your task. Run single checkers while working; run
  `python3 tools/bundle_webxr.py && node tools/check_all.mjs` once at the end and report the exact final line. The machine is
  shared (4 cores); if one checker times out, re-run it alone, then the full suite once. Never `pkill -f`/`killall`; kill only
  PIDs you started. Serve your worktree's `WebXR/` on your own free port 89xx for browser tests (8970/8971 belong to the
  coordinator). Temp files under `$SP/frontier/<console>/` (SP = the session scratchpad).
- **Hand back within 70 minutes** (a coordinator heartbeat merges every ~30 minutes, so commit working increments early):
  ≤200 words, commit hashes, the check_all line, counts, what is left.

## Shared data contract — skill gates (every console uses this schema; QUESTMASTER implements it)
A quest, side game, treasure or egg may carry
`gate: { stations?: [stationId…], programmes?: [{ id, minStars? }…], quests?: [questId…], k12?: [stationId…], note }`
meaning "locked until the learner has completed these" (a station counts as complete at 1+ star in the learner's profile /
passport records). `note` is the one-line reason shown on the lock ("Rig inspection before you ride the gondola crew").
Locked items are visible on maps and boards with a lock and the reason and a link to each required station, never hidden
(hidden items are the treasures, which are about discovery, not gates). Each world's data module exports its gated items so
`tools/check_gates.mjs` (QUESTMASTER) can verify every referenced id exists.

## SCHOLAR-2 — K-12 review and lessons across every environment
1. Review the K-12 programmes SCHOLAR shipped (`docs/consoles/SCHOLAR.md`, `tools/check_k12.mjs`, the flows under
   `WebXR/flows/`): fix anything the eval or a read-through flags (age fit, one idea per step, SDG 4 cited only as alignment).
2. Build the remaining 14 K-12 stations: slope, tides, spinner, blade sweep, kelp, sky, crane, controlled experiment, oral
   history, guilds, maps, public speaking, digital citizenship, teamwork — each taught at a real site in a world, eval 95+.
3. Spread lessons across the environments: at least 40 short "field lessons" (2–4 minute FlowHub-style micro-lessons with a
   check question) placed at landmarks in Bay World, the Deep, the Regatta and Fairway Park, each tied to a K-12 station and
   to the trade that uses the idea ("the crane operator's load chart is a ratio table"). Data in a module the worlds read;
   the in-game map shows a K-12 layer. Export the field-lesson schema so SUMMIT and REDWOOD can add their own.
4. Extend `check_k12.mjs`: station count, every field lesson anchored and linked, reading level bounds.

## QUESTMASTER — skill-gated side quests and games across every world
FIXER (another console) is currently making `WebXR/bayworld/js/quest-engine.js` honour a quest's `requires` field. Do not
rewrite that logic: put the gate engine in a new `WebXR/shared/skill-gates.js` (reads profile/passport completion; answers
`isOpen(gate)`, `missing(gate)`) and call it from each world with a small hook, so the merge with FIXER stays trivial.
1. Implement the gate contract above, the lock UI (map pin, board row, toast with links to the required stations) and a
   "Skills to unlock" panel in the quest log.
2. Side quests and games that require union skills: at least 30 across Bay World, the Deep, the Regatta and Fairway Park —
   e.g. a night-shift crane puzzle opened by the crane stations, a harbour salvage hunt opened by the dive and rigging
   stations, a timed-but-safe delivery run opened by Class A stations, a grid-restoration puzzle opened by lineman stations,
   a kitchen rush opened by culinary stations, a regatta rescue drill opened by boat-handling stations. Each game is scored on
   safe practice, never on harm; each unlocks a cosmetic reward.
3. `tools/check_gates.mjs` in `check_all`: every gate id resolves (stations, programmes, quests, k12), every gated item has a
   note and links, a fresh profile sees them locked, a profile with the required completions sees them open.

## TREASURE — hidden treasures and easter eggs through the whole system
1. A treasure ledger in the learner's profile (`WebXR/shared/treasures.js`), a Treasure Map page reached from the account
   chip that shows found / unfound counts per world and area (never the locations of unfound ones), and a small reveal
   animation when one is found.
2. At least 120 new hidden treasures and eggs across every surface: the homepage (a hidden constellation in the hero, a
   Konami-style key sequence, a click-the-logo-seven-times), every Trade Skills room, the station runner (a hidden tool in
   the tool crib, a perfect-run secret), the Atlas, the Guide (secret questions it answers with lore), the arcade and racer,
   Bay World, the Deep, the Regatta and Fairway. Each teaches or rewards something real (a union history line from the
   registry's own text, a safety habit, a trade tool's name) — never an invented fact. Themed sets (collect all seven harbour
   bells) earn a badge.
3. Some treasures sit behind skill gates (the gate contract) to reward learning; most are pure exploration.
4. `tools/check_treasures.mjs` in `check_all`: counts per surface, each has a reveal and a lesson/source, sets complete,
   ledger persists per profile, nothing on the Treasure Map leaks an unfound location.

## SUMMIT — a large mountain world (new exterior environment)
A new walkable world, `WebXR/summit/` ("Sierra Summit" is fine as a working name; generic, not a real resort), as large as the
budgets allow — target at least 4000 × 4000 m — using chunked terrain (heightmap from seeded noise with ridges, valleys, a
lake, a pass road), streaming/LOD so a phone holds its frame budget, instanced conifers, snowline and scree, weather
(the existing `sky.js`), wildlife (`wildlife.js` kinds that fit), day/night.
- Work sites for the union trades that genuinely work in mountains: transmission-line and substation crews on ridges,
  a hydroelectric dam and penstock, a mountain pass road crew with avalanche-season traffic control, a tunnel portal, a
  gondola/lift maintenance shop, a ranger station and trailhead, a water treatment plant below the dam. Each site's job
  board opens existing stations that fit (search the catalog by trade/category) — add at most 6 new stations only where a
  site has none, eval 95+.
- Quests (a main arc + side quests using the gate contract), at least 30 eggs/treasures in the existing egg format, 10 field
  lessons (SCHOLAR-2's schema, or a compatible one you document), scored activities (a safe hike-to-lookout orienteering
  course, a snowcat-free survey route), an in-game map with layers, fast-travel between visited sites.
- Home card, Atlas entry, links from the homepage and each station's "Back to world", Guide knowledge (gen_guide_kb),
  Unity export entry if other worlds have one. `tools/check_summit.mjs` in `check_all` (size, chunks, sites, links, budgets).

## REDWOOD — a large forest world (new exterior environment)
A new walkable world, `WebXR/redwood/` ("Redwood Reach" as a working name), target at least 4000 × 4000 m: coastal redwood
and mixed forest, a river valley with an estuary, fire roads, a fire lookout, a sawmill and log yard, a watershed restoration
reach, a campground and trail network, a wildland fire station, a nursery and seed bank, a rural substation. Same technical
bar as SUMMIT (chunked terrain, streaming, instancing, sky, wildlife, day/night, mobile budgets).
- Sites for trades that genuinely work there (wildland fire, forestry and trail crews, sawmill millwrights and operators,
  heavy equipment on fire roads, linemen clearing vegetation near lines, watershed restoration); job boards open fitting
  existing stations; at most 6 new stations where a site has none, eval 95+.
- Main arc and gated side quests, at least 30 eggs/treasures, 10 field lessons, scored activities (a trail-crew route, a
  fuel-break survey, a river-restoration count), in-game map with layers, fast-travel, home card, Atlas, Guide, links, Unity
  entry if applicable. `tools/check_redwood.mjs` in `check_all`.
- Fire content teaches prevention, preparedness and safe procedure; no depiction of harm.
