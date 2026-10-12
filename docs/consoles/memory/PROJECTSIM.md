# PROJECTSIM memory

- Base 039f09e (reset from 589f0d8). Prefix `ps`, port 8969. Modules: `WebXR/shared/ps-projectsim-data.js`, `ps-projectsim.js`.
- Five sims x 8 steps = 40 steps over 20 catalog stations; step ids read like DRILLS (an `id:` whose object has `title` and `cue`).
- Order gates: `gate` on a step, `requires` on the steps behind it; a step done before its gate was done *safely* loses 50.
- Mount: parishes app `#menu-ps` + `#board-ps` (npOpenBoard), `psSetRecorder(ppAward)`, tyEarn inside psRecord (once per sim).
- bk-*/cp-* not published at build time; BAYMAP/TIDELANDS placements guarded in PS_GUARDED.
- Checker: `node tools/check_projectsim.mjs` (add `--live`, PS_PORT=8969).
