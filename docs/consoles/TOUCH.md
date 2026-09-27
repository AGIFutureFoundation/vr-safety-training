# Console TOUCH — the mobile play surface

Team: TOUCH · Brief: `tools/briefs/mobile-look-brief.md` (TOUCH section, with `console-brief.md`) · Branch: `claude/vr-ar-safety-training-wkwmve`

Rules kept here: every new top-level name is prefixed `tc…` because the bundler concatenates every module into one scope; storage reads and writes are wrapped in try/catch; nothing is downloaded at run time.

- 21:14 UTC · Console opened; fetched and fast-forwarded the branch of record; read the brief, `perf.js`, `input.js`, the four games' touch and HUD code, the bundler and the headless screenshot scripts · next: `shared/touch.js`.
- 21:16 UTC · Plan: (1) `shared/touch.js` — stick bottom left, context buttons bottom right (56 px, 2–3 columns), safe-area insets, `navigator.vibrate` buzz, one-time hint, and the Low / Balanced / High toggle; (2) `perf.js` play tiers (`tcAutoTier`, `tcTierChoice`, `tcSetTier`, `tcApplyRenderer`) — coarse pointer or short side < 600 px picks low; (3) converge Bay World, the Regatta, the Deep and Fairway Park on it, each with a phone HUD layout for 360×640 and 640×360; (4) `tools/check_mobile.mjs` in `check_all` · next: write it.
- 21:22 UTC · Games converged: the per-game stick code is gone (each now reads `tcMountTouch().stick`); Bay World and the Deep drop their duplicate touch Map button (the HUD has one); Fairway Park's aim arrows and swing button become the shared stick (left-right aims) and a Swing context button. Low tier: pixel ratio ≤ 1, no antialias, no shadows, fog density ×1.6 (Fairway's linear fog ÷1.6), Bay World wildlife ×0.4, one car per road instead of two, a pedestrian every sixth site · next: the checker.
- 21:23 UTC · The cdnjs three.js is unreachable here and `WebXR/vendor/three/` held only `examples/jsm`; vendored `build/three.module.min.js` (0.160.0, MIT, licence already beside it) so the checker answers the cdnjs URL from the repo · next: run `check_mobile.mjs`.
