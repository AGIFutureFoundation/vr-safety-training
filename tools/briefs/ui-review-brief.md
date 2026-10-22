# UI and controls review brief — every page, every input, one grammar

Binds LENS (console LENS). `console-brief.md` and `WebXR/ACCESSIBILITY.md` apply.

## Review
Open every page in `WebXR/dist/` (home, SmartCiti.X, Trade Skills, Holodeck, instructor console, arcade, race, Fairway, Bay World, Atlas, Regatta, the Deep, and three track pages) headlessly (Playwright at `/opt/node22/lib/node_modules/playwright/index.mjs`, executable `/opt/pw-browsers/chromium`, the vendored three.js at `WebXR/vendor/three/dist/` routed in place of the cdnjs URL as `tools/check_mobile.mjs` does) at desktop 1280×720 and phone 360×640, and record in `docs/ui-review.md` a table per page: controls offered for keyboard, touch, gamepad and headset; the key for each common action (move, look, interact, map, pause/menu, back to home, help, quality); focus order and visible focus; labels on icon buttons; text contrast against its panel; any overlap; any dead control.

## Fix (the same grammar everywhere)
- One control grammar across the worlds: WASD/arrows move, mouse/drag look, E interact, M map, V view, Esc menu/back, H help, Q quality; gamepad A interact, B back, Y map, Start menu; the touch layer's buttons carry the same verbs. Put it in `WebXR/shared/controls.js` (prefix `ctl…`) as a table the HUDs render into a shared help overlay (H or a "?" button), and make each world use it; keep each world's genuinely unique actions (helm, rise/sink, swing) listed under the world's own heading in the same overlay.
- Every icon-only button gets an accessible name; every modal traps and returns focus and closes on Esc; visible focus rings on every control; no text under 14 px on phone; panel text contrast ≥ 4.5:1.
- A consistent "Home" and "Back to <world>" placement across pages.
- `tools/check_ui.mjs` in `check_all`: each page at both sizes — the help overlay opens with H and lists the shared verbs; every button has an accessible name; Tab reaches the primary actions in order with a visible focus style; Esc closes the open panel; no fixed panels overlap; no page error. If the browser cannot launch, fail with a clear message.

## Process
Start with `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge --ff-only FETCH_HEAD`. Keep `docs/consoles/LENS.md`. Coordinate by reading, not editing, `WebXR/shared/touch.js` (TOUCH's module): call it, extend its button table only through its exported API. The bundler concatenates every module into one scope and erases import aliases: prefix new top-level names. Commit in steps; each commit message ends with the two trailer lines in your task. Gate with `python3 tools/bundle_webxr.py` and `node tools/check_all.mjs` (exact "All N checkers pass" line). Hand back within 45 minutes: ≤200 words, commit hashes, the check_all line, the top findings fixed.
