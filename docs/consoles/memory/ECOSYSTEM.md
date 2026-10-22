# ECOSYSTEM memory: what the next console needs to know

## Sibling clones and licences

- The sibling clones are at `/home/user/agifuturefoundation/{smartciti.x,cognition.x}` and are read-only.
- In this environment, worktree isolation refuses shell commands that touch another repository's `.git`. Read the refs with the Read tool, or `cat .git/refs/heads/main` in a plain command.
- SmartCiti.X has no licence: import its modules at run time from the clone in a checker, and never copy them.
- Cognition.X content is CC BY 4.0. The extract carries the attribution line in both the data module header and the match table.

## Regenerating and checking

- Rebuild the extract with `node tools/eco_extract.mjs`. It is deterministic. Re-run it whenever `WebXR/packs/*.json`, `rp-programme-data.js` or `ECO_RULES` change.
- If you skip the rebuild, `check_eco` 2 fails, and 2b fails too when the clone is present.
- `check_eco` 2b and the live half of 4 are skipped or degraded when the clones are absent, as in CI. The documented-shape validators still run.

## Matcher behaviour

- Station patterns match at word starts against `" id name "`, with hyphens as spaces.
- A pattern with a trailing space is a whole word (`"rp "`, `"ot "`, `"port "`).
- The first matching rule that finds an adult block wins.

## The bus adapter

- Only `telemetry.event` / `client` is a real SmartCiti.X topic at 398f287.
- Governor, hive and arena events go to the audit-entry shape with `learner: null`.
- The proposed topics are in the SmartCiti.X brief, not in code.

## Not done yet

- `eco-bus.js` is in no bundle. No page loads it yet.
- The instructor tab was not driven in a browser this round.
