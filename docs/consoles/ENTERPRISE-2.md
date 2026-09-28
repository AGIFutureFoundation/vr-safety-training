# Console ENTERPRISE-2

- **Team:** ENTERPRISE-2 — the organisation layer, second run (the learner's side of cohorts, the live pass of the deployment block)
- **Brief:** `tools/briefs/next/enterprise-next.md` in its order, under the holodeck brief's shared rules and ENTERPRISE section
- **Branch:** worktree of `claude/vr-ar-safety-training-wkwmve`, started by merging ENTERPRISE's local branch (`worktree-agent-aaf44d74e10d8baa9`, clean, no conflict)
- **Prefix:** `en…` · port 8995 · temp files under `$SP/holodeck/enterprise-2/`
- **Memory:** `docs/consoles/memory/ENTERPRISE-2.md` · next brief: `tools/briefs/next/enterprise-2-next.md`

## Log

- 09:40 UTC · merged ENTERPRISE's branch (fast-forward, nothing to `node --check`). Read the holodeck brief, ENTERPRISE's memory, log tail and next brief, `docs/enterprise.md`, org.js, cohort.js, account.js, check_enterprise.mjs, check_home's headless server, the homepage's enterprise hook and continue strip, tracking.js's SignOffs, the bundler's auto-dependency blocks and check_auth's rules on account.js (no `import(`, no `fetch(`, one module-list line per bundle) · — · next: plan
- 09:42 UTC · verified 2ec0efb already carries the two suite fixes (privacy.html's three docs links are repository URLs; `LK_DOC_PAGES` lists `privacy.html`) — nothing more to do there beyond re-running check_links alone at the end · — · plan: (1) the live pass of the deployment block as check 8 of `check_enterprise.mjs` — the same headless server and Playwright launch `check_home` uses, the block injected by fulfilling the page's `auth-config.json` request (no file is touched); (2) the learner's side — `enJoin` audited as `member-join`, `enMyCohorts()` in org.js (the local member's own ladder from this device's records, shown to the learner only, so no consent is involved), a "Join a cohort" form in the sign-in dialog (`account.js`, static import; the bundler gives every app carrying account.js the module and its two deps, `dist/shared` copies org.js), and a "My cohorts" card on the homepage's continue strip through a lazy import, string-built like the rest of that script; (3) two stills; (4) docs, memory, next brief. Sign-offs, refreshers/retention, the phone grid and multi-programme cohorts go to the next brief with what is measured · — · next: org.js
