# UI and controls review — every page, every input, one grammar

Console LENS · brief `tools/briefs/ui-review-brief.md` · checked by `tools/check_ui.mjs` (in `check_all`).

Every page in `WebXR/dist/` was opened headless (Chromium, SwiftShader, the vendored three.js and React answering the cdnjs URLs) at a 1280×720 desktop and a 360×640 phone. The tables below record what each page offered **before** this review and what changed. `node tools/check_ui.mjs` re-runs the whole sweep; `UI_DUMP=out.json` writes the raw measurements (Tab order, unnamed buttons, small text, contrast, overlaps, page errors).

## The shared grammar (`WebXR/shared/controls.js`)

| Verb | Keyboard | Gamepad | Touch | Headset |
|---|---|---|---|---|
| Move | W A S D / arrows | Left stick | Stick, bottom left | Left thumbstick |
| Look | Mouse / drag | Right stick | Drag the scene | Head |
| Interact | E | A | E button | Trigger |
| Map | M | Y | Map button | Wrist menu |
| Change view | V | R3 | View button | — |
| Menu / back | Esc | B back · Start menu | Home chip, top left | Menu button |
| Help | H | — | ? button, top left | — |
| Quality | Q | — | Low / Balanced / High | — |

`ctlMount({ world, unique, except, helpWhen, quality })` renders this table into one modal help overlay (`#ctl-help`, `role="dialog"`, `aria-modal`), opened by **H** or the **?** button that now sits directly beside the Home chip on every page. Each world's own actions (the helm, rise and sink, the swing, the vehicle) are listed under the world's heading in the same overlay, and where a page must keep an older binding the overlay says so in the row rather than hiding it. Touch labels come from `ctlTouchButton(verb)`, which builds a definition for TOUCH's own `tcMountTouch({ buttons })`; Q presses TOUCH's quality toggle. `touch.js` is unchanged.

## Findings and fixes

| # | Finding | Pages | Fix |
|---|---|---|---|
| F1 | **Arcade dead on load**: `import * as SpoolYard` — the bundler erases namespace imports, so the single-file page threw `SpoolYard is not defined` before its menu painted | Arcade | `arcade/js/cabinets.js` uses named imports |
| F2 | No help overlay anywhere; each world documented its keys differently (or not at all) | all | `controls.js` overlay on every page, H or ? |
| F3 | Home pill drawn over the clock / speed panel at desktop (panels at `top:10px`, chip at `top:8px`) | Bay World, the Deep, Regatta | HUD top-left panels start at 48 px |
| F4 | `#hud-buttons` / `#hud-clubs` unpositioned at desktop (TOUCH positioned them for phones only), so they stacked at the top over the HUD | Bay World, the Deep, Fairway | `position:absolute` in the base rule |
| F5 | Regatta quality toggle over the helm panel; empty next-mark and checks lines drawn as blank strips | Regatta | next/checks moved below the helm; `:empty{display:none}` |
| F6 | Fairway wind panel under the taller score panel (the quality toggle widens and lengthens it) | Fairway | wind panel at 128 px |
| F7 | Objective panel under the taller clock/slate panel | Bay World, the Deep | objective at 160 / 170 px |
| F8 | Button text under 14 px on a phone: `#signin` 12.5, `#voice-btn` 12–13, `#view-btn` 12, `#field-notes-btn` 13, instructor tabs 13, `#btn-crt` 12, Home chip 12 | Home, SmartCiti.X, Trade Skills, instructor, Arcade, all chips | `ctlPhoneText()` floor of 14 px on phones; chip 14 px |
| F9 | Focus rings missing or 1 px on many HUD buttons (only the Home chip had one) | all | one `:focus-visible` ring (3 px amber + dark halo) for every control |
| F10 | Tab could leave an open modal (intro, pre-brief, results) and walk the HUD behind it | Trade Skills, SmartCiti.X, Holodeck | `ctlTrapTab()` keeps Tab inside any open `aria-modal` dialog |
| F11 | Regatta's first screen showed only "Enter the harbour" with no sign racing was inside | Regatta | one-line hint under the button |
| F12 | Icon-only buttons without a name are named from `title` / `alt` at mount and after late HUD builds (`ctlNameButtons`); the sweep found none left | all | checker asserts every visible button and link is named |
| R1 | **Open**: a three.js matrix copy throws inside the renderer (`reading 'elements'`) in Bay World and the Regatta under SwiftShader at device scale 1; `check_mobile` (scale 2) does not see it | Bay World, Regatta | listed by `check_ui` as a known render error, handed to the world teams |
| R2 | **Kept, documented**: stations (SmartCiti.X, Trade Skills, Holodeck) keep `input.js`'s Standard preset — H reads the step aloud, M mutes, Q/E turn a valve — because `check_input` holds those keys for existing learners. H opens help at the hub; inside a station the ? button (or `/`, F1) does | stations | overlay rows carry the exception |
| R3 | **Kept, documented**: the Race's IJKL preset uses H for drift and Q/E for signals; H opens help off the track and on pause | Race | overlay rows carry the exception |

## Per page

Columns: K keyboard, T touch, G gamepad, X headset. "Tab" is the first stops from the top of the page after the fix. Contrast is the help panel (15.6:1) plus any opaque HUD panel measured; all ≥ 4.5:1.

| Page | Inputs offered | Move / look / interact / map / menu / home / help / quality | Tab order and focus | Names | Overlap / dead control |
|---|---|---|---|---|---|
| Home (`index.html`) | K T | page: Tab / scroll / Enter / — / — / (is home) / H, ? / — | ? → sign in → cards; ring on all | all named | none; `#signin` 12.5 px on phone (F8) |
| SmartCiti.X | K T G X, voice | WASD / mouse / Enter (station) / — (M mute) / Esc / chip / H at hub, ? / device | modal intro traps Tab (F10) | all named | `#voice-btn`, `#view-btn`, `#field-notes-btn` small (F8) |
| Trade Skills | K T G X, voice | WASD / mouse / Enter / — (M mute) / Esc / chip / H at hub, ? / device | intro `enter-flat` first, trapped (F10) | all named | `#voice-btn` 13 px (F8) |
| Holodeck | K T G X | WASD / mouse / Enter / — / Esc (new prompt) / chip / H, ? / device | chip → ? → prompt | all named | none |
| Instructor console | K T | page / — / Enter / roster / — / chip / H, ? / — | chip → ? → tabs | all named | tabs 13 px (F8) |
| Arcade | K T G | game keys / — / Enter / — (M mute) / Esc, P / chip / H off-cabinet, ? / — | chip → ? → cabinets | all named | **dead page (F1)**; `#btn-crt` 12 px |
| Race | K T G | WASD or IJKL / — / — / — (M mute) / Esc, P / chip / H off-track, ? / — | chip → ? → modes (was: autofocus skipped the chip) | all named | none |
| Fairway Park | K T G | arrows aim / drag / Space swing / hole card / Esc / chip / H, ? / Q | chip → ? → clubs | all named | clubs over hole card; wind under score (F4, F6) |
| Bay World | K T G | WASD / mouse / E, F / M / Esc / chip / H, ? / Q | chip → ? → HUD buttons | all named | chip over clock (F3); buttons over HUD (F4); R1 |
| Atlas | K T | pan / zoom / Enter / (is map) / — / chip / H, ? / — | chip → ? → filters | all named | none |
| Regatta | K T G | WASD helm / mouse / — / course map / Esc / chip / H, ? / Q | chip → ? → menu | all named | toggle over helm, blank strips (F5); first screen (F11); R1 |
| The Deep | K T G | WASD / mouse / E / M / Esc / chip / H, ? / Q | chip → ? → HUD buttons | all named | chip over clock (F3); buttons (F4); objective (F7) |
| Track pages (3 sampled: electrical, port operations, first responders) | K T | page / scroll / Enter / — / — / chip / H, ? / — | chip → ? → stations | all named | none; chip 12 px on phone (F8) |

## Placement

Home is the chip at the top-left of every page (`.home-chip`), and the help button sits immediately to its right inside one `#ctl-nav` bar, so the two are the first two Tab stops everywhere except where a modal intro is open (then Tab stays in the intro). "Back to <world>" stays the primary button of each world's results or pre-brief dialog, and Esc does the same.
