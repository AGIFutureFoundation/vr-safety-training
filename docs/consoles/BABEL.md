# Console BABEL

- Team: BABEL
- Brief: `tools/briefs/i18n-brief.md` (with `tools/briefs/console-brief.md`)
- Branch: `claude/vr-ar-safety-training-wkwmve`

## Log

- 02:40 UTC · fast-forwarded to the branch of record; read the briefs, controls.js, account.js, guide.js, touch.js, gen_home, the world HUDs, the runner UI, check_ui and the bundler · — · next: the language layer
- 02:55 UTC · plan: `shared/i18n.js` (`tr…` names) with `data-tr*` hooks for static markup and `trT()` for built strings; the picker is a chip after the account chip in `#ctl-nav` so Tab still reaches Home then help; tables generated from `tools/i18n/*.json` by `tools/gen_i18n.mjs`; the bundler prepends both modules to every app that carries the chrome · — · next: string tables
- 03:10 UTC · 321 English keys (chrome, account, Guide, homepage, world HUDs and menus, runner, 10 world cards, 56 programme titles and taglines); Spanish complete; the other 19 languages carry the chrome and picker, every other key the explicit `@en` fallback marker · — · next: wiring
- 03:20 UTC · wired controls.js (help overlay, Home chip, picker), account.js, guide.js, react-ui.js (intro buttons, HUD, pre-brief, results, step note), the four world pages and the Atlas, and the homepage (chrome, world cards, programme cards with taglines) · — · next: check_i18n and docs
- Failed and fixed: the worktree guard refused compound shell commands with heredocs; scratch scripts were written with the Write tool and run by absolute path.
- 03:32 UTC · added tools/check_i18n.mjs to check_all and wrote docs/i18n.md; check_i18n passes 195 of 196: the homepage at 360x640 in Arabic lays out wider than the phone, so the header sits off-screen (x −1072). The page overflows sideways in RTL and the header is not the cause. Not fixed · — · next: find the element that overflows on the homepage in RTL at 360 px, then run the full check_all
- HAND-BACK · time ran out before the full check_all run; check_i18n: 1 failed, 195 passed · no eval scores for this brief
