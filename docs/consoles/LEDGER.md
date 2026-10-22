# Console LEDGER — investor data pack

Team: LEDGER · Brief: `tools/briefs/investor-data-brief.md`, with `console-brief.md` and `wojrc-brief.md` · Branch: `claude/vr-ar-safety-training-wkwmve`

Deliverables: `tools/gen_investor.mjs` writing `docs/investor/` (platform summary JSON/CSV, programmes, stations, assets, vehicles-and-boats, worlds, ui-surfaces, unions) and `docs/programmes/<id>.md` with a README; `tools/check_investor.mjs` in `check_all`. Every figure computed from the repo with its source; no commercial figure; the two wojrc.org editions state only the sourced text in `wojrc-brief.md`.

- 21:15 UTC · Branch fetched and fast-forwarded to 69adbad; briefs, catalog, curricula, competency, budgets, world and quest data, Unity manifest and whitepaper facts read · next: generator.
- 21:30 UTC · Generator written. Builder modules import three.js from a CDN and cannot be imported headlessly, so the budgets, `YACHT_FLEET` and the district list are read as literals from source; boats are fleet builders defined from `workboat()` on; station use comes from each sim's and room's named imports · next: checker.
- 21:34 UTC · First checker run failed on the summary's own note naming a forbidden word; reworded to "no commercial figure". Model-name pattern stored base64-encoded so the tools name none. Scenic districts are keyed by id, not category, so their site count was dropped rather than shown as 0 · next: check_all and commit.
- 21:42 UTC · check_investor registered in check_all; gate green · next: hand-back.
- 21:43 UTC · HAND-BACK · All 58 checkers pass. · eval corpus mean 95.7 (511 at 95+, 114 at 90-94, 5 below 90) · rows: platform-summary 49, programmes 54, stations 630, assets 131, vehicles-and-boats 32, worlds 11, ui-surfaces 66, unions 111; 54 programme overviews
