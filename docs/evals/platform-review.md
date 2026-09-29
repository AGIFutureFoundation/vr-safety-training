# Platform review — every map and world (SURVEYOR)

SmartCiti.X · Powered by AGI Corp. Console SURVEYOR, base 793d16d, 2026-09-29. Walked headlessly with
`node tools/sv_survey.mjs` (one Chromium, SwiftShader, one page at a time; raw figures in `docs/evals/platform-review.json`)
and scored with `node tools/eval_worlds.mjs` before and after. Stills: `docs/screenshots/review/<map>.jpg`
(desktop, after entering the world; `orleans-phone.jpg` for the phone view).

How to read the figures: boot ms is navigation start to the first WebGL draw (Bay World, the Deep and Redwood draw
nothing until Start, so they show —); frame ms is the median rAF interval under SwiftShader on a loaded four-core box
(load ~8–19) — compare maps with each other, not with a phone; draws and triangles are counted at the GL calls on the
390×844 view (the low tier), so every world is measured the same way. "Works" lists the first- and second-wave features
reachable in the page (a `__parishTest` handle or a filled menu mount); "broken or missing" lists what was not.

## Eval (`node tools/eval_worlds.mjs`)

| | Mean | Subjects at 100 | Findings | Billing | sf-bayview facts |
|---|---:|---:|---:|---:|---:|
| Before (793d16d) | 98 | 11 of 18 | 11 | 88 | 56/57 |
| After (this branch) | 99 | 11 of 18 | 9 | 98 | 57/57 |

## Every map and world (the before walk)

| Map / world | Eval | Page errors (desk / phone) | Boot ms (desk / phone) | Frame ms (desk / phone) | Draws · triangles (phone) | Menu buttons (desk) | Works | Broken or missing |
|---|---:|---|---|---|---|---:|---|---|
| Orleans Parish (`orleans`) | 100 | 0 / 0 | 1427 / 3511 | 401 / 88 | 102 · 64785 | 56 | terraform, cityworks, newton, menagerie, storyline, tycoon, packs, dean, drills, cognition, atmos, krewe, motorpool, paths, griot | test teleport skipped streets/ground (fixed); high tier builds 346 meshes; phone: 8 targets under 44 px |
| Jefferson Parish (`jefferson`) | 100 | 0 / 0 | 2153 / 1523 | 480 / 73 | 58 · 38245 | 49 | all fifteen | test teleport (fixed); phone: 8 targets under 44 px |
| St. Bernard Parish (`st-bernard`) | 100 | 0 / 0 | 1875 / 1878 | 473 / 73 | 56 · 33463 | 54 | all fifteen | test teleport (fixed); phone: 8 targets under 44 px |
| Plaquemines Parish (`plaquemines`) | 100 | 0 / 0 | 2478 / 1903 | 355 / 85 | 47 · 29067 | 51 | all but drills | no drill (menu mount empty); phone: 8 targets under 44 px |
| St. Tammany Parish (`st-tammany`) | 100 | 0 / 0 | 2508 / 2008 | 402 / 71 | 64 · 41897 | 54 | all fifteen | phone: 8 targets under 44 px |
| Downtown & Embarcadero (`sf-downtown`) | 97 | 0 / 0 | 2903 / 2549 | 633 / 81 | 55 · 29677 | 46 | all but krewe, paths | no KREWE quests, no path board; 0 play-layer lessons; phone: 5 targets under 44 px |
| Mission & SoMa (`sf-mission`) | 97 | 0 / 0 | 2198 / 1740 | 409 / 72 | 72 · 35011 | 43 | all but krewe, paths | no KREWE quests, no path board; 0 play-layer lessons; phone: 5 small targets |
| Golden Gate Park, the Richmond & the Sunset (`sf-golden-gate-park`) | 97 | 0 / 0 | 1714 / 3113 | 489 / 77 | 58 · 48124 | 44 | all but krewe, paths | no KREWE quests, no path board; 0 play-layer lessons; phone: 5 small targets |
| Marina & Presidio (`sf-marina`) | 100 | 0 / 0 | 1725 / 1727 | 515 / 88 | 54 · 38111 | 47 | all but krewe, paths | no KREWE quests, no path board; high tier at 260 meshes (the line); phone: 5 small targets |
| Bayview & Hunters Point (`sf-bayview`) | 100 | 0 / 0 | 1798 / 1999 | 402 / 93 | 60 · 34259 | 45 | all but drills, krewe, paths | no drill, no KREWE quests, no path board; phone: 5 small targets |
| West Oakland & the Port (`oak-west-oakland`) | 97 | 0 / 0 | 1870 / 1657 | 364 / 77 | 73 · 42719 | 43 | all but drills, krewe, paths | no drill, no KREWE quests, no path board; 0 play-layer lessons; phone: 5 small targets |
| Downtown Oakland & Lake Merritt (`oak-downtown-lake`) | 97 | 0 / 0 | 2230 / 1628 | 582 / 82 | 59 · 40857 | 43 | all but drills, krewe, paths | as West Oakland |
| Fruitvale & the Estuary (`oak-fruitvale-estuary`) | 97 | 0 / 0 | 2068 / 1290 | 527 / 80 | 48 · 40149 | 43 | all but drills, krewe, paths | as West Oakland |
| Bay World (`bayworld`) | n/s | 0 / 0 | — / — | 1277 / 311 | 222 · 216724 | 6 | enters via Start, draws | 654 draws on desktop, 222 on the phone; phone: 5 small targets |
| The Deep (`deep`) | n/s | 0 / 0 | — / — | 1037 / 328 | 49 · 29210 | 6 | enters via Start, draws | slow frame for its draw count; phone: 5 small targets |
| Redwood Reach (`redwood`) | n/s | 0 / 0 | — / — | 2090 / 133 | 79 · 48765 | 8 | enters via Start, draws | 236k triangles on desktop (slowest frame); phone: 4 small targets |
| Sierra Summit (`summit`) | n/s | 0 / 0 | 2548 / 1975 | 512 / 91 | 89 · 54635 | 7 | enters via begin, draws | phone: 4 small targets |
| Packs page (`packs-page`) | n/s | 0 / 0 | — | 17 / 17 | — | 4 | cards and filters render | desktop: 3 small targets |
| Scoreboard (`scoreboard`) | n/s | 0 / 0 | — | 17 / 17 | — | 2 | tiles and badges render | — |
| Instructor console (`instructor`) | n/s | 0 | — | 17 | — | 14 | tabs render | 7 targets under 44 px |

"All fifteen" = terraform, cityworks, newton, menagerie, storyline, tycoon, packs, dean, drills, cognition, atmos, krewe,
motorpool, paths, griot. Every one of the 39 views loaded without a page error, and Motor Pool, Crew Credits and the map
opened without an error on all 13 parish-engine maps at both sizes. (The test-teleport flag shows only for the first
three maps because the fix landed while the walk was running; the Orleans re-walk confirms it.)

## The ten worst findings

1. **Orleans overbuilds at the high tier** — `world.stats()` reports 346 meshes built at the start on the desktop view
   against the engine's 260 (`NP_BUDGET.drawCalls`); Marina sits at 260. The eval only builds the low tier, so it never
   sees this. Owner: `np-world.js` (PARISH/SITEWORKS) with `cw-streets-world.js` (CITYWORKS).
2. **Bay World is the heaviest world on a phone** — 222 draws and 217k triangles per frame at 390×844 (654 draws on
   desktop), frame 311 ms against 70–100 ms for the parish maps. Owner: `bayworld/js` (Bay World, MENAGERIE's life mount).
3. **Six maps have no play-layer field lessons** — sf-downtown, sf-mission, sf-golden-gate-park and the three Oakland
   maps count 0 (eval −3 each); `sg-sf-play.js` re-reads only Marina and Bayview, and the three older SF districts'
   lessons carry no `station`. Owner: SECONDLINE / GOLDEN-B (`sg-sf-play.js`), BAYMAP.
4. **No KREWE side quests and no path board on any San Francisco or Oakland map** — `menu-krewe` and `menu-paths`
   are empty on all eight. Owner: KREWE (`kw-play-data.js`), SECONDLINE (`sl-parish-play.js`).
5. **Redwood Reach's desktop frame is the slowest** — 236k triangles, 2090 ms median frame on desktop (133 ms on the
   phone tier). Owner: `redwood/js` with TERRAFORM's creeks and ATMOS.
6. **Five maps offered no drill** — plaquemines, sf-bayview and the three Oakland maps left `menu-drills` empty.
   Owner: DRILLS (`dr-drills-data.js`). **Fixed here** (cycle 5): one drill each at a fitting real site.
7. **Touch targets under 44 px on phones** — 8 per New Orleans parish page, 4–5 on every other world (top chips and
   the quality buttons). Owner: INTERFACE (this wave).
8. **The parish menu is one long scroll of 43–59 buttons** — storyline, paths, KREWE, drills, packs and cognition
   stacked under the map chooser. Owner: INTERFACE (tabbed menu, this wave).
9. **Billing config lacked the null `levels` / `applePay` / `googlePay` keys** (eval −10 on billing). Owner: TILL.
   **Fixed here** (cycle 3).
10. **The parishes test handle repeated its keys** — a merge left a second `teleport` / `setTime` / `krewe` in
    `window.__parishTest`, so every checker and capture that teleported got no street or ground update, and `setTime`
    skipped the life remount. Owner: `parishes/js/app.js` (integration). **Fixed here** (cycle 2).

Also seen: no Upgrade view (`membership.html`) from the account chip (TILL, eval −1.9); the Bay World character
hand-off (GRIOT, eval −0.4); "record" in an sf-bayview site blurb tripping the facts regex (reworded here, cycle 4).

## Recommended next steps, ranked by learner impact

1. **Bring San Francisco and Oakland up to the New Orleans play layer** — three or more play-layer lessons with real
   stations on each of the six maps (add `station` to the older SF lessons, extend `sg-sf-play.js` or add an Oakland
   twin, regenerate treasures), plus KREWE side quests and a path board on all eight SF/Oakland maps. Learners on those
   maps get roughly half of what a parish offers. Owners: GOLDEN-B, SECONDLINE, KREWE, BAYMAP.
2. **A phone tier for Bay World** — instance or merge what draws 222 times per frame on a phone; hold it near the
   parish engine's 260-mesh line. Owner: Bay World, MENAGERIE.
3. **Hold the high tier to the engine budget** — bring Orleans under 260 meshes at the start and add a high-tier build
   to `eval_worlds`' budget check so it cannot regress unseen. Owners: PARISH/SITEWORKS, CITYWORKS, ASSAYER.
4. **The tabbed in-world menu and 44 px targets** — INTERFACE's brief this wave; land it and re-walk with
   `node tools/sv_survey.mjs`.
5. **Drills on every map** — done here for the five that had none (cycle 5); next, a second drill kind per map and the
   flood drill's water on the Oakland estuary. Owner: DRILLS.
6. Redwood Reach's desktop triangle count (LOD on the forest). Owner: Redwood, TERRAFORM.
7. TILL's Upgrade view; GRIOT's Bay World hand-off.

## Fixes made in this review

Each is a cycle in `docs/consoles/SURVEYOR.md` with its check and observed result: the parishes test handle (one key
each), the billing config's null membership and wallet keys, the sf-bayview wording, and a drill on each of the five
maps that had none. Not reached this wave: a fifth fix — the next candidates are a high-tier line in `eval_worlds`
(step 3's guard) and `station` on the older SF lessons (the first half of step 1).
