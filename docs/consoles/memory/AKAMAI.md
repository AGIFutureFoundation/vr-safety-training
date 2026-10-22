# AKAMAI memory — read this first at this console

Short, durable lessons for the next team on the Akamai Cloud deploy path (docs/deploy-akamai.md).

- **No account, no network.** `api.linode.com` is blocked in these sessions and there is no token. Build so that
  nothing happens without the names; never write a response, a price, a plan id or a region list from memory.
  `--discover` prints whatever the account's API answers — that is the only place type and region ids come from.
- **Prove "does nothing", don't assert it.** The checker runs each workflow's probe step under bash with the
  secrets absent, partial and present, and runs the agents behind a `PATH` of recording shims (`aws`, `ssh`, `scp`,
  `python3`, `node`, `curl` … log and exit 1; `git` passes `ls-files|diff|rev-parse` through) with `fetch` trapped.
  Mutation-test the checker: an ungated job, an always-true probe, a literal, apply-by-default, an unguarded branch.
- **Fake credentials in the checker are built at run time** (`"0f".repeat(30)`), or the checker trips its own scan.
  The repository-wide literal scan uses `git grep -I --untracked` (fast over 10k files) and excludes only the checker.
- **Object metadata cannot carry security headers.** S3-compatible objects take `Cache-Control` and
  `Content-Type`, not CSP. The CSP and friends go on the CDN property; the agent prints the list from `_headers`' `/*`
  rule and the verify step checks the CDN serves them.
- **One source of cache rules.** The agent reads the generated `WebXR/dist/_headers`; most specific matching pattern
  wins (`/tracks/img/*` immutable beats `/tracks/*` no-store). Files no rule names revalidate.
- **Rollback on a bucket** is a server-side `_rollback/` copy taken before the upload and synced back on any failure
  after it. The first deploy has nothing to roll back to and says so.
- **The worktree guard refuses commands that mention git inside heredocs or loops** — even text like "git grep" in a
  Python string. Use the Edit tool or plain one-command calls.
- **New docs/*.md pages feed the Guide's KB**, which sits at its 672 KB cap. Run `node tools/check_guide.mjs` after
  adding a doc; an operator-only page can be given 0 chunks in `tools/gen_guide_kb.mjs`.
- **Run once means the ledger entry is written before the instance exists.** A failed run still counts. Results are
  copied to `deploy/akamai/out/`, never over `docs/evals/arena.json`.
