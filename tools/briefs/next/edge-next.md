# EDGE-2 brief — the next phase of the Cloudflare layer

Read first: `tools/briefs/console-brief.md`, `docs/deploy-cloudflare.md`, `docs/consoles/memory/EDGE.md`,
`docs/consoles/EDGE.md`. Prefix `cf`. Nothing deploys from the machine you work on.

## Where EDGE left it (measured, commit c7b2a76 and after)
- `node tools/check_deploy.mjs` → **329 checks**, 33 `_headers` rules, 42 redirects, 6 routes (3 own + the union
  of TILL's payments and passes handlers' `ROUTES`, both stubbed here), 7 plan steps, 5 verify assertions, ~1.8 s.
  `check_parse` 2272 modules, `check_imports` 876 clean with the new files. The full suite started at 19:09 under
  load 6→24 (seven consoles) and had 68 ✓ of 80 at hand-back: ✗ `check_investor` (fixed, 817ee9a) and ✗ `check_guide`
  (`guide-kb.js` stale because the new doc joined the Guide's sources — regenerated in the last commit); 10 heavy
  browser checkers were still queued. Re-run `node tools/check_all.mjs` once on a quiet machine first.
- The flat build: 1,119 files, 72 MB; the largest bundle `smartcity-x.html` 5.6 MB; 13 bundles between 1.0 and
  5.6 MB; 61 track pages. Nothing is hash-named.
- The dry-run plan prints 7 steps, 19 commands/API calls, 15 checks; the log redactor replaces credential values
  and any 32-hex line whole.
- wrangler was not installed here (npm blocked), so the `wrangler … --dry-run` branch of the checker has run
  only its skip note. The Functions directory convention (`functions/` at the repo root, cwd-relative for
  `wrangler pages deploy`) and the `[[path]].js` catch-all are written from wrangler's documented behaviour, not
  from a run.

## Do next
1. **Run wrangler once.** In a network that allows npm: `npm install --no-save wrangler`, then
   `node tools/check_deploy.mjs` (the dry-run branch must pass), `npx wrangler pages dev WebXR/dist` and hit
   `/api/health`, `/auth-config.json`, `/smartcity/index.html` (a 301) to confirm Functions routing,
   `_routes.json`, `_headers` and `_redirects` behave as documented. Fix `functions/` placement if wrangler
   resolves it differently; record the answer in the memory file.
2. **Hash-name the shared modules.** Extend `tools/bundle_webxr.py`'s `[dist]` step to write `shared/<name>.<8-hex>.js`
   and `sims/**` with content hashes and rewrite the import paths in the bundles and `citykit.js`; then
   `_headers` can give them `immutable` (the bundles keep `must-revalidate`). Measure the transfer saved on a
   second visit with the headless server in `check_seo.mjs` (bytes with 304s vs without).
3. **Bundle size at the edge.** Pages compresses on the fly; measure the brotli size of each bundle
   (`node -e` with `zlib.brotliCompressSync`) and record them in `docs/perf/`; a bundle over a size you choose
   gets a `check_budget` rule.
4. **The Worker path.** When `CF_WORKER_ZONE` is used, `/api/*` is served twice (Functions and the Worker). Decide:
   either drop `/api/*` from `_routes.json` when the Worker is published (the agent rewrites it) or drop the
   standalone Worker. Prove the choice in `check_deploy`.
5. **TILL's real handler.** Replace the stub with `workers/payments/handler.mjs` from TILL (take TILL's file whole),
   confirm `ROUTES` normalises through `cfRoute()`, and add the webhook's signature-failure path to the router
   test (a wrong signature is a 400 that never reaches a receipt).
6. **Per-organisation domains.** A second custom domain per organisation and its `org:<host>` KV entry as one
   agent sub-command (`--org <slug> --domain <host> --block <file>`), with the checker proving the block is
   whitelisted before it is written.
7. **Observability without secrets.** `wrangler pages deployment tail` in the agent's verify step for 30 s after
   deploy, redacted through `cfRedact`, and a `docs/deploy/` history (one file per run, the last ten kept).
