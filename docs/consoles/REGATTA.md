# Console REGATTA — the yacht fleet, hosted events and racing

Team: REGATTA · Brief: `tools/briefs/regatta-brief.md` (with `console-brief.md`, `assets-brief.md`, `bayarea-brief.md`) · Branch: `claude/vr-ar-safety-training-wkwmve`

Rules kept here: original yacht, course and event names only; no real boat, club, race, sponsor, brand or person; no gambling; no violence; right-of-way taught generically ("the give-way vessel keeps clear"), never as a clause number. Every top-level name is prefixed `rg…`/`RG_…` because the bundler concatenates every module into one scope.

- 18:40 UTC · Console opened; fetched and fast-forwarded the branch of record; read the briefs, `fleet.js` (`motorYacht`, `yachtTender`), `props.js` (`marinaBerth`), `bayworld-data.js`, the Bay World game, `weather.js`, the headless checker pattern and the bundler · next: the twelve-yacht fleet module `WebXR/shared/yacht-fleet.js`.
- 18:41 UTC · Plan: (1) `shared/yacht-fleet.js` — `YACHT_FLEET` of twelve `motorYacht` variants, `buildYacht`, `yachtById`, berth water slots; (2) `regatta/js/courses.js` (three courses, water rectangles mirrored from `bayworld.js`'s `buildWater` calls, `regattaCourseAt`), `events.js` (five hosted events paying into Bay World's career ledger), `race.js` (pure race engine: helm, wind, AI, marks, no-wake, give-way, docking, scoring); (3) `world.js` + `app.js` + `regatta.html`; (4) `tools/check_regatta.mjs` in `check_all`, bundler entry, home and Bay World links · next: write the fleet.
