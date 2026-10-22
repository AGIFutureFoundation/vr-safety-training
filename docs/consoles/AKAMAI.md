# AKAMAI — a deploy path and a training-job path on Akamai Cloud

Loop 10, round 6c. Prefix `ak`. Base 86ca8491. Deploy page: [docs/deploy-akamai.md](../deploy-akamai.md).

**Nothing here has run against a live account.** There was no account or token in this session and the API host
was blocked by the network policy. Every file does nothing without its secrets; no API was called; no response,
price, region list or result was written. Naming Akamai Cloud is operational (a deployment target), not a claim of
any relationship.

## What landed

| File | What |
|---|---|
| `tools/ak_deploy.mjs` | Deploy agent: build → gate → preflight → snapshot → upload → verify → rollback. Object Storage static website behind a CDN hostname; Cache-Control per object from the generated `WebXR/dist/_headers` (most specific rule wins); concrete redirects as redirect objects, wildcards and the security headers printed for the CDN property. Dry run by default; `--apply` needs 3 credentials and 4 variables. |
| `.github/workflows/deploy-akamai.yml` | `workflow_dispatch` only (off the default path). Probe job like Cloudflare's; deploy job: build, `check_all.mjs`, then the agent with `--apply`; log uploaded as an artifact. |
| `deploy/akamai/ak-robot-train.mjs`, `deploy/akamai/robot-train.md` | GPU training job: preflight → declare (ledger entry before anything is created) → provision → wait → run (`git archive` of the commit, `node tools/arena_eval.mjs`) → collect (eval JSON to `deploy/akamai/out/<sha12>/`) → destroy (in `finally`, confirmed by 404). Dry run by default; `--apply` needs the token, five `AK_TRAIN_*` names and a committed, never-run declaration. `--discover` lists types and regions read-only, printing only what the API returns. |
| `.mcp.json.example` | `akamai-cloud` server: `uvx akamai-cloud-mcp`, `LINODE_TOKEN` expanded from `${LINODE_TOKEN_READONLY}`. Not enabled. |
| `tools/check_deploy_akamai.mjs` | 125 checks (below); in `check_all.mjs`; baseline row 12 s, an estimate. |
| `docs/deploy/akamai-last-run.md` | The committed dry-run log. |
| `docs/README.md`, `docs/product-overview.md` | The second deployment target listed. |
| `tools/gen_guide_kb.mjs` | `docs/deploy-akamai.md` contributes no Guide chunks (the KB would have been 674 KB, over its 672 KB cap); `guide-kb.js` is byte-identical. |

## Evals (before → after)

| Eval | Before | After | Source |
|---|---|---|---|
| Deploy targets documented | 1 | 2 | `node tools/check_deploy_akamai.mjs` → "deploy targets documented: 2 (deploy-cloudflare.md, deploy-akamai.md)" |
| Workflows gated on their secrets, proven by running the probe | 1 (Cloudflare, regex-checked by `check_deploy`) | 2 | same → "workflows gated on their secrets: 2 (deploy-cloudflare.yml, deploy-akamai.yml)"; each probe run under bash: absent → `false`, one secret → `false`, all → `true`; a run without secrets executes the probe job only |
| Token or key literals in the repository | 0 | 0 | same → "token literals in the repository: 0 (in 10181 files scanned by git grep)" |
| Job script dry run by default | 0 of 0 | 1 of 1 | same → "the training job defaults to a dry run (1 of 1 job scripts)"; five dry runs, 0 requests, 0 processes |
| Deploy agent dry runs calling nothing | — | 4 of 4 | same: without credentials, with fake ones, `--apply` without credentials, `--apply` without variables: exit 0, 0 requests, 0 processes (recording `PATH` shims) |

## Cycles

1. **Reason:** the agent must print the whole plan and call nothing without its names; check: dry run exits 0 with 7 steps. **Act:** `tools/ak_deploy.mjs`. **Observe:** exit 0; 1,407 files in 4 Cache-Control groups, 35 redirect objects, 2 wildcard redirects for the CDN; `not executed · dry run`. Committed 0b97243d.
2. **Reason:** the workflow must be a no-op without secrets and off the default path; check: YAML parses to jobs `secrets`, `deploy`, trigger `workflow_dispatch` only. **Act:** `deploy-akamai.yml`. **Observe:** parses, two jobs. Committed 0b97243d.
3. **Reason:** the GPU job must refuse without token, flag and a committed, never-run declaration; check: dry run and `--apply` without names exit 0 with "not executed". **Act:** `ak-robot-train.mjs`, `robot-train.md`, `.mcp.json.example`. **Observe:** both exit 0; the plan reports the declaration absent on this base (it lands with ROBO-ARENA). Committed 3540d202.
4. **Reason:** prove the gating, the dry runs and the absence of literals rather than assert them; check: `check_deploy_akamai` passes and fails on each breakage. **Act:** the checker (probes run under bash; fetch trapped; `PATH` of recording shims). **Observe:** 122/122; mutations caught 5 of 5 (deploy job `if: always()`, probe always `true`, a `LINODE_TOKEN=` literal in an untracked file, agent `apply: true` by default — the shim recorded `python3 tools/bundle_webxr.py` — and `--discover` without its token guard). Committed b7e9814a.
5. **Reason:** the committed log must be a dry run, and the overview must name the target; check: a checker line. **Act:** log, overview paragraph, assertion. **Observe:** 125/125. Committed 496f5f3e.
6. **Reason:** a new doc joins the Guide's sources; check: `check_guide`. **Act:** ran it. **Observe:** ✗ 1 — the KB would be 674 KB, over the 672 KB cap. **Act:** the operator-only deploy page contributes no chunks (as `bench-protocol.md` and `omega-hive.md` already do). **Observe:** `gen_guide_kb` writes 1,550 chunks, 672 KB, `guide-kb.js` unchanged; `check_guide` 268 checks pass (1,550 chunks, 672 KB).
7. **Reason:** nothing else broke; check: single checkers. **Observe:** `check_deploy` 345 pass; `check_newton` 60 pass; `check_imports` 1,127 modules clean; `check_mapbox` pass (its repository-wide token scan included); `check_parse` 2,706 shipped modules parse.

## Seams

- `tools/arena_eval.mjs` and `docs/evals/arena-declared.json` (ROBO-ARENA, round 6b) are not on this base. The job
  names them and refuses until they are in the tree. After the merge, `ra/1` is refused too: `docs/evals/arena.json`
  already holds its results (measured once on seeds 7121–7180). A GPU run needs a new declaration (`ra/2`) with new
  held-out seeds, committed first.
- `WebXR/dist/_headers` is the one source of cache and header rules for both targets. Change it in
  `tools/bundle_webxr.py` (`edge_headers`), never in the agent.
- `guide-kb.js` is at its cap. Any console adding a `docs/*.md` page will hit the same failure; the coordinator may
  need to raise `GD_KB_CAP` or trim.
