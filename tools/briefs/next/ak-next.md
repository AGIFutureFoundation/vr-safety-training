# AKAMAI-2 brief: take the Akamai Cloud path live, once the owner has an account

Read first: `docs/deploy-akamai.md`, `deploy/akamai/robot-train.md`, `docs/consoles/AKAMAI.md`,
`docs/consoles/memory/AKAMAI.md`. Prefix `ak`. Nothing deploys from the machine you work on unless the owner has put
the names in its environment and allowed the hosts.

## Where AKAMAI left it
- `node tools/check_deploy_akamai.mjs` → 125 checks: 2 workflows gated (probes run under bash), deploy agent dry runs
  4 of 4 and job dry runs 5 of 5 with 0 requests and 0 processes, 0 token literals in 10,181 files, 7 plan steps,
  5 verify assertions, 4 cache groups, 35 redirect objects.
- Never run against a live account. The `aws` CLI's S3 calls, the redirect-object header, and the Linode API request
  and response shapes come from the providers' public documentation, not from a run.

## What to do, and how to check each
1. **Owner prerequisites (no code):** the read-only token, the deploy token, the bucket and its limited access key,
   the CDN property with the headers the plan prints, the GitHub secrets and variables, an `akamai` environment with
   a required reviewer. Check: the Actions run of `Deploy to Akamai Cloud` shows the probe `have_secrets=true`.
2. **First live deploy from the workflow.** Check: the run log artifact shows every step `ok` and the five verify
   lines; `curl -sI https://$AK_CDN_HOSTNAME/` shows the CSP and `cache-control: no-store`. Commit nothing that holds
   an id; record the verdicts in `docs/deploy/akamai-last-run.md` only if `check_deploy_akamai` still passes on it.
3. **Exercise the rollback once on purpose** (e.g. a CDN hostname variable pointing at a host without the headers):
   the verify fails, the snapshot is synced back, the run exits 1. Check: the log's `rollback · ok`.
4. **Redirect objects.** If the cluster does not honour `--website-redirect-location`, move all redirects to the
   CDN property and drop them from the agent. Check: `curl -sI https://$AK_CDN_HOSTNAME/home.html` is a 301.
5. **The GPU job, after ROBO-ARENA is merged:** commit a new declaration (`ra/2`, new held-out seeds) first; run
   `--discover`, then `--apply`. Check: `deploy/akamai/out/<sha12>/arena.json` and `run.json`, the ledger line, the
   destroy line with the 404; then a note reporting the result whatever it is.
6. **Hash-named shared modules** would let `shared/*` be immutable on both targets (EDGE memory names it); a bundler
   change for its own console.

## Rules that stay
No token, key or id in any file; no price, plan size or region list in the docs; no claim of any relationship with
the provider; `check_deploy_akamai`, `check_deploy`, `check_guide` pass; never run `tools/check_all.mjs` from a console.
