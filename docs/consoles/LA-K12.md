# LA-K12: K-12 lessons for the Louisiana maps (`lk`, port 9013)

Brief: `$SP/louisiana/round2-brief.md` (LA-K12) under `wave-brief.md`, with `tools/briefs/station-brief.md` and the ESTUARY
pattern (`docs/consoles/ESTUARY.md`). Facts: `$SP/louisiana/la-facts.md` only (copy at `docs/sources/la-facts.md`). Base 6ffb8b37.
SmartCiti.X Powered by AGI Corp.

The lessons teach general science and careers awareness at the places the Louisiana maps show. They carry no project figure,
no company name and no employer's hiring (check_k12 section 11 fails on any of them), and the platform has no partnership with
any company, agency or union. Places are named as places.

## Plan (fixed before code)
- Six K-12 stations, one per theme in the brief, from `tools/k12-data/lk-*.json` via `gen_k12_station.mjs` + `add_station.mjs`
  (at most six; each 95+ on `eval_content`).
- `WebXR/shared/lk-la-lessons.js`: one SCHOLAR lesson per station (three one-idea steps, a check, a trade line), fixed anchors on
  the Louisiana maps (guarded) plus a **character fallback keyed by region and site kind**, so maps merged later (CAPITAL's
  Baton Rouge and Hammond) pick up the river, energy and careers lessons with no change here.
- `tools/k12-data/lk-wire.mjs` puts each station in its classroom programme (curricula.js); check_k12 section 11 proves it.
- Mounted in the parishes app's SCHOLAR panel and the scoreboard index (`sc-lessons.js`, source `la-k12`), like ESTUARY.
- Louisiana programme: the awareness / K-12 level of every role pathway gets its Louisiana stations (`LP_K12`) and lessons
  (`LP_K12_LESSONS`); check_la_programme proves they resolve.

## Stations (eval · band · Flesch–Kincaid station / lesson lines · programme · fixed anchors)
| Station | Eval | Band | Reading | Programme | Fixed anchors (map/site) |
| --- | --- | --- | --- | --- | --- |
| `k12-lk-building-new-marsh-on-the-coast` | 95 | upper primary | 4.5 / 0.8 | k12-science | la-starbase-vermilion/lsb-marsh-creation-dredge, la-black-bayou-cameron/lbb-marsh-restoration-crew |
| `k12-lk-how-a-lock-lifts-a-boat` | 95 | upper primary | 5.6 / 1.5 | k12-practical-math | nola-bywater-lower-ninth/nbw-canal-lock-crew, nbw-river-levee-crew, la-shintech-plaquemine/lsp-levee-crossing, la-delta-forge-rapides/ldf-red-river-levee-patrol, nola-french-quarter-cbd/nfq-riverfront-floodwall-gate |
| `k12-lk-where-a-data-center-gets-its-power` | 97 | lower secondary | 6.4 / 4.0 | k12-science | la-meta-richland/lmr-substation-build, la-delta-forge-rapides/ldf-cooling-plant, la-black-bayou-cameron/lbb-salt-dome-wellpad, la-starbase-vermilion/lsb-power-plant-build |
| `k12-lk-how-a-wing-lifts-an-aircraft` | 97 | lower secondary | 4.8 / 0.3 | k12-science | la-avex-new-iberia/lav-apron-work, lav-workforce-centre, la-starbase-vermilion/lsb-airport-apron |
| `k12-lk-why-a-steel-boat-floats` | 96 | upper primary | 4.5 / 0.5 | k12-science | la-saronic-franklin/lsf-new-slip-build, lsf-launch-and-test, lsf-workforce-centre |
| `k12-lk-the-crews-behind-a-big-build` | 96 | lower secondary | 5.8 / 3.0 | k12-literacy-and-life-skills | the workforce centres and trailers of seven Louisiana site maps and the French Quarter |

Each station: 13 steps over eight kinds, four hazards, two interruptions (one armed on the hold, one on the track, each
answered by its own green control), 233–275 meshes, median why 279–297 characters, the K-12 certification line (SDG 4, UNESCO,
INEE, national curriculum framework; AFT and NEA). Energy is taught as general science: stored gas → turbine and generator →
substation → computers → heat → cooling plant, and why a salt dome seals stored gas. The careers station names kinds of work and
the apprenticeship route only.

Themes → stations: coastal marsh and restoration (Vermilion, Cameron) → new marsh; rivers, levees and locks (Plaquemine, the
Mississippi districts) → lock; energy and electricity (data centers, gas storage) → power; flight and aircraft (New Iberia) →
wing; boats and shipbuilding (Franklin) → steel boat; the jobs and trades behind development → crews.

## Places
41 lesson places on the maps in this tree: 25 fixed anchors (all resolve; 0 pending) and 16 by character, all on
`louisiana-sites`, `louisiana-cities` or `new-orleans-districts` maps: e.g. the lock lesson at `monroe-west-monroe/mon-levee-floodwall`
and `nola-uptown-garden/nup-river-levee-crew`, the wing lesson at `laf-downtown/lafd-airport-ramp` and `mon-airport-apron`, the
marsh lesson at `lc-calcasieu-channel/lcc-marsh-restoration-crew` and `nbw-bienvenue-wetland` (the marsh fallback needs a
`marsh`/`wetland` site id, so an inland bayou buffer or a rice field never hosts it). A fixed anchor whose map is absent is
pending; one whose map is present but lacks the site is an error.

## Seams
- `lkSessionLessons(parishId, { npParish })` → raw lessons `{ id, title, k12, band, minutes, steps, check, trade, tradeLine, parish,
  site }` for `scMountSession` / `scNormalise`; the first fixed anchor keeps the plain id, every other place is `<id>@<map>/<site>`.
- `lkPlacesOn(lesson, parish)` (guarded places), `lkStartLesson(id, where, { scStartSession })` (guarded; null when SCHOLAR is
  absent), `lkModule()` → DEAN shape `{ id: "lk-louisiana-k12", audience: "classroom", lessons: [...] }`, `lkStationHref(lesson)`.
- `LP_K12_LESSONS[pathwayId]` in `lp-programme-data.js` (re-exported by `lp-programme.js`); `lpPathways()` returns them on the
  `aware` level as `lessons`; the handbook (`docs/louisiana-programme.md`) lists them per pathway.

## Cycles
1. Reason: the station pipeline (JSON → gen → add_station) carries a Louisiana coastal-marsh lesson to 95+. Act:
   `lk-new-marsh.json`, order b, deck scene. Observe: eval 95 at once (variety 94, originality 0: 36% shared with the tidal
   marsh nursery's closing steps); kept, it passes the bar.
2. Reason: the lock and energy stations reach 95+ with fresher closing steps. Act: `lk-lock.json` (lab, order c),
   `lk-power.json` (bench, order a). Observe: a fear word ("destroyed") caught by grep before generating, reworded ("never
   disappears"); eval 95 and 97.
3. Reason: wing, boat and careers stations reach 95+. Act: three JSON files. Observe: 97, 96, but careers 93: standards 79 —
   a sentence-initial "Carpenters" matched the union registry entry out of scope. Reworded ("A carpenter, an ironworker and a
   mason…") → 96.
4. Reason: a registry with guarded fixed anchors plus a character fallback, wired into the programmes, passes check_k12 with a
   new section 11. Act: `lk-la-lessons.js`, `lk-wire.mjs`, check_k12 section 11. Observe: failed 2 of 3210 — "job with" (a
   false positive of my own project regex) and "hiring" (my own disclaimer in a programme why). Dropped the naive phrase test,
   reworded the why. Also saw the marsh fallback landing on an inland bayou buffer and a rice field → added an id pattern
   (`marsh|wetland`) → 41 places, 16 by character. Observe: "All K-12 checks pass" (3209 checks).
5. Reason: the curricula change must reach the generated catalogue, competencies and ladders. Act: gen_sims_meta, gen_catalog.
   Observe: `k12-science` competency now lists four Louisiana stations, `k12-practical-math` one, literacy one; ladders and
   track pages regenerated.
6. Reason: the programme's awareness / K-12 level carries the Louisiana stations and lessons. Act: `LP_K12` (new `process`,
   `marine`, `air` lists; the careers station opens every pathway), `LP_K12_LESSONS`, `lessons` on the aware level, the handbook
   line, two checks per lesson in check_la_programme. Observe: `gen_la_programme` + `check_la_programme` ok, 1618 checks, all 30
   levels earnable.
7. Reason: the lessons start SCHOLAR sessions on the maps and on the scoreboard. Act: `lkSessionLessons` in the parishes app and
   `sc-lessons.js`, both bundle lists. Observe: check_scholar 84 failed first — "no subject" / "not a station in a classroom
   programme": `passport-programmes.js` is generated from curricula by `check_interop --write`. Regenerated → check_scholar 279
   session lessons, 2 failed, both pre-existing and outside this console's files (`lsf-fl-circuits` "dead",
   `nd-fl-raised-house` "injury" in map data); check_interop and check_imports pass.

## Left
- The two pre-existing check_scholar fear-word failures belong to the map consoles' field lessons (`np-data-la-saronic-franklin.js`
  `lsf-fl-circuits`, and `nd-fl-raised-house`); not edited here to avoid colliding with LA-PLAY.
- No FlowHub flows or apply mini-games for the Louisiana lessons yet (ESTUARY has both); no headless drive or screenshot of the
  six stations on port 9013 inside the time box.
- CLASSROOMS boards do not yet list the Louisiana lessons (the workforce-centre `school` sites on the AVEX and Saronic maps are
  candidates).
