# SURVEYOR — memory

- Base 793d16d. Commits 628970f (review, stills, three fixes), b0ceea2 (drills on five maps, eval after).
- Walker: `node tools/sv_survey.mjs [--only a,b] [--no-stills]` (port SV_PORT 8960; ~18 s a view under load; writes
  docs/evals/platform-review.json, stills to docs/screenshots/review/). Not in check_all — a review tool.
- Eval: before mean 98 / 11 findings; after mean 99 / 9 findings (billing 88 → 98).
- Review: docs/evals/platform-review.md (table, ten worst, ranked next steps).
