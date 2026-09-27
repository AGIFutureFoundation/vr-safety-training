# Console LENS — the UI and controls review

Team: LENS · Brief: `tools/briefs/ui-review-brief.md` (with `console-brief.md`) · Branch: `claude/vr-ar-safety-training-wkwmve`

Rules kept here: every new top-level name is prefixed `ctl…` because the bundler concatenates every module into one scope; `shared/touch.js` (TOUCH) is called through its API, never edited.

- 10:02 UTC · Console opened; fast-forwarded the branch; read the brief, ACCESSIBILITY.md, touch.js, input.js, a11y.js, check_mobile.mjs, the bundler and every app's key and HUD code · next: controls.js.
- 10:10 UTC · Plan: (1) `shared/controls.js` — verb table, help overlay (H / ?), focus ring, Tab trap, icon-button names, phone text floor; (2) `ctlMount` in all 11 bundles plus the home and track generators; (3) `tools/check_ui.mjs` over 15 pages × 2 sizes; (4) `docs/ui-review.md` · next: write it.
- 10:18 UTC · Decision: stations keep input.js's Standard preset (H read aloud, M mute, Q/E turn) because check_input holds those keys; H opens help only at the hub there (`helpWhen`), the ? button always. Race likewise off the track · next: checker.
- 10:26 UTC · First check_ui run: Arcade dead on load (`import * as` erased by the bundler) — cabinets.js now uses named imports; SmartCiti.X and the Holodeck could not paint without React from cdnjs — React 18.3.1 UMD vendored at `WebXR/vendor/react/dist/` for the checker only · next: overlaps.
- 10:34 UTC · Overlaps at 1280×720 (coordinator's captures agree): Home chip over the clock/helm, `#hud-buttons`/`#hud-clubs` unpositioned at desktop, regatta toggle over the helm and blank status strips, Fairway wind under score — all moved; regatta first screen hint added · next: gate.
- 10:40 UTC · Open: a three.js renderer throw (`reading 'elements'`) in Bay World and the Regatta under SwiftShader at scale 1; listed as a known render error in check_ui (finding R1), handed to the world teams · next: hand-back.
- 10:52 UTC · Gate: check_investor was stale (UI surfaces and checker counts); regenerated with gen_investor · next: hand-back.
- HAND-BACK · `node tools/check_all.mjs`: "All 60 checkers pass."; check_ui 442 checks over 15 pages at 1280x720 and 360x640. No learner eval runs in this brief.
