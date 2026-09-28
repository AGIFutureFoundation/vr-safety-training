# Console ASSAYER — review the new worlds with evals; bring the four parishes onto the engine

Team: ASSAYER · Brief: the ASSAYER section of `tools/briefs/bayou-brief.md` under `tools/briefs/console-brief.md`,
`tools/briefs/frontier-brief.md` and `tools/briefs/crescent-brief.md` · Branch: `claude/vr-ar-safety-training-wkwmve`
(worktree `worktree-agent-ad01b943d1d241d01`) · Port 8990 · prefix `as` · temp `$SP/bayou/assayer/`

Rules held: no invented fact about a place (a place is named, not described with figures); a stylised scale is a recorded
decision, not a fault hidden; `check_npc`, `check_drivables`, `check_payments` stay green; single checkers while working,
the full suite at most once.

- 22:48 UTC · Run opened. The worktree was cut at the repository's first commit (589f0d8); reset onto a643c66. Read the
  Bayou brief, CRESCENT-RUN, the GRIOT and MOTORPOOL next briefs, `check_parishes.mjs`, `np-parish.js`'s validator, the
  parishes app and page, `check_mobile`'s browser harness · next: plan.
- 22:58 UTC · Plan.
  1. **Rubric first (minute 25).** `tools/eval_worlds.mjs` scores eleven subjects (five parishes, Motor Pool, characters,
     play layer, billing, deploy plan) 0–100 on six criteria: loads (20 — the page at 1280×720 and 360×640 with no page
     error, served in-process on port 8990 with three.js from the vendor copy), legible (15 — a title, a "where am I"
     and a "what can I do" on the first screen), resolves (20 — every station, programme, union, gate, hand-off and
     link id the subject's boards, kiosks and chips name), completable (15 — a lesson, drive, dialogue, quote or plan
     run headless to its end), frame budget (15 — meshes and triangles against the subject's own budget), facts (15 —
     no digit in a name or lesson text, no history or statistics words in place text). Findings carry an owning console.
     `--no-browser` for a fast pass; `--json` writes the scores to `$SP`. Publish `docs/evals/crescent-review.md`.
  2. **Four parishes strict.** Per parish: gated items get `world: "parishes"` + `parish: <id>`; roads that sample a
     river or lake are re-drawn along the bank or become the bridge/ferry they are; landmarks on open water become a
     shore/point kind or move to the bank; water beds whose ribbon is too narrow for the bank ramp widen; St. Tammany
     drops to ten anchors. The scale rule reads a per-parish `scale` (declared real metres per metre); a declared scale
     is held to within 15 % of the fit and recorded in `docs/parishes.md`. Each passing parish joins `NP_ENGINE_STRICT`.
  3. **Mounts.** `grMount("parish:<id>", …)` and `dvMountMotorPool({ world: "parishes" })` in `WebXR/parishes/js/app.js`
     (a Motor Pool button in the HUD, the board in a modal); TILL's Upgrade view only if `pm-membership.js` has a ready
     view to call. Re-run check_npc, check_drivables, check_payments, check_parishes, check_parish_data.
  4. Re-score at hand-back; memory and next brief.
  · next: code the rubric.
