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
- 22:51 UTC · Plan.
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
- 22:56 UTC · `tools/eval_worlds.mjs` landed and `docs/evals/crescent-review.md` published (9c2b592): ten subjects, mean
  97 before, every page loads at both sizes with no page error; the worst findings are TILL's blocked `auth-config.json`
  keys, the four DELTA parishes' missing menu blurbs, the two unmounted hooks (Motor Pool, characters) and the wet roads.
  Two fixes on the way: `slHandoffTarget` needs a real `qmSnapshot` (a bare object throws); `DV_BUDGET` rows put
  `belowGround` before `meshes` for hulls, so the row regex reads the whole line · next: the four parishes.
- 23:03 UTC · Four parishes strict. A scratch transform (`$SP/bayou/assayer/fix.mjs`) edits each module's literal and
  re-serialises it in DELTA's own format: `scale` (8, 8, 20, 10) and a menu `blurb` per parish; gated items onto
  `world: "parishes"` + `parish`; Jefferson's expressway ends at the bridge approach and Williams Boulevard at the
  levee; St. Bernard Highway and St. Claude Avenue re-derived 140 m inland of the river; Plaquemines's levees (45 m) and
  river roads (78 m) re-derived from the river on both banks, the Pointe à la Hache landings and ferry on the new banks,
  the lock moved along the waterway, Woodland Highway on the West Bank, two marsh districts so the massing has ground;
  St. Tammany's Highway 190 on Covington's east bank, Highway 22 and the Trace off the rivers, Lakeshore Drive behind
  the seawall, two pads moved back from narrow rivers, ten anchors; bridge/river landmarks at their banks. The checker's
  scale rule reads a declared `scale` (fit within 15 %, declared between one half and twenty-five, recorded in
  `docs/parishes.md`); `npValidate` checks the field. `NP_ENGINE_STRICT` holds all five: check_parishes 6,496 / 0,
  check_parish_data 2,763 / 0, check_parish_play 3,933 / 0, check_gates 6,246 / 0 · next: commit, the mounts.
