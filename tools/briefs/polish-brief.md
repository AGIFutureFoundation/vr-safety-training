# Polish brief — a professional, vivid look everywhere, and every link lands somewhere working with Home and the Guide

Binds POLISH (console POLISH). `console-brief.md`, `WebXR/ACCESSIBILITY.md`, `docs/ui-review.md` and the shared control grammar apply.

## Build
1. **Design tokens.** One shared theme (`WebXR/shared/theme.js` injecting CSS custom properties, prefix `th…`): palette, type scale, radii, elevation, focus ring, motion durations, light/dark handling — derived from the new homepage's look — applied to every app's HUD panels, menus, job boards, dialogs and the track pages so the platform reads as one product. Vivid but legible: panel text ≥ 4.5:1.
2. **Every page has Home and the Guide.** Every page in `WebXR/dist/` and the repo layout — the 11 app bundles, the homepage, the 50-plus track pages, every scenic district when entered through SmartCiti.X, the Atlas, and any error or empty state — shows a Home chip and the Guide button in the same places. Extend `tools/check_ui.mjs` (or `check_links.mjs`) to assert both on every page.
3. **Every link lands on a working environment.** Extend `tools/check_links.mjs` so each link's target is loaded (sampled where the full sweep is expensive, full under `LINKS_FULL=1`) and asserted to render its environment (a canvas with a drawn frame, or the station's first step) without a page error; fix every dead or empty landing it finds (including the Atlas programme chips opening SmartCiti.X instead of the programme's track page, and the homepage's refresher reading the device's records while signed in, both reported by earlier teams).
4. **Station runner polish.** The SmartCiti.X runner's HUD, step card, results screen and debrief adopt the tokens; the results screen shows the next station in the programme and "Back to <world>" when launched from a world.
5. Screenshots: save before/after captures of five pages at 1280 and 360 under `docs/img/polish/` for the coordinator's pitch deck.

## Process
Start with `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge --ff-only FETCH_HEAD`. Keep `docs/consoles/POLISH.md`. The bundler concatenates every module into one scope and erases import aliases: prefix new top-level names. Commit in steps; each commit message ends with the two trailer lines in your task. Gate with `python3 tools/bundle_webxr.py` and `node tools/check_all.mjs` (exact "All N checkers pass" line); the machine is shared and slow, so run single checkers while working and the full suite once at the end. Hand back within 55 minutes: ≤200 words, commit hashes, the check_all line, the fixes.
