# Console ENTERPRISE

- **Team:** ENTERPRISE — an organisation layer for the platform (organisations, cohorts, the cohort view, deployment configuration, audit and privacy)
- **Brief:** the holodeck brief's ENTERPRISE section, with `tools/briefs/console-brief.md`, `tools/briefs/frontier-brief.md` (shared rules), `tools/briefs/signin-brief.md` and `docs/consoles/GATE.md`
- **Branch:** worktree of `claude/vr-ar-safety-training-wkwmve` (started from 688afae), merged by the coordinator
- **Prefix:** `en…` · port 8995 · temp files under `$SP/holodeck/enterprise/`
- **Memory:** `docs/consoles/memory/ENTERPRISE.md` · next brief: `tools/briefs/next/enterprise-next.md`

## Log

- 08:20 UTC · the worktree branch sat on the initial commit; reset it to 688afae (the merged tree the brief says to start from). Read the holodeck, console, sign-in and frontier briefs, GATE, profiles.js, account.js, passport.js, records.js, auth.js's config parser, the instructor console (index.html, app.js, roster.js), the bundler's instructor entry and check_auth's DOM stub · — · next: plan
- 08:28 UTC · plan: (1) `WebXR/shared/org.js` — one store `vr-org-v1` per profile through `gtStorage()` (added to `GT_PROFILE_KEYS`): organisations, cohorts with an invite code, members with a role and an explicit progress-sharing consent (off by default), a per-device audit log, a progress snapshot per member that is data-minimised (best stars, unsafe actions, interruptions handled, attempts, last date — per station, no free text), cohort export/import as JSON, CSV and xAPI per cohort, a procedural SVG certificate. (2) `WebXR/instructor/js/cohort.js` — a fourth "Cohorts" tab built from `el()`/`textContent` only (check_console forbids markup from strings), with a sample-cohort loader for the capture and the checker. (3) an `enterprise` block in `WebXR/auth-config.json`, cleaned in `auth.js`'s `parseAuthConfig`, honoured by account.js (allowed methods), the homepage script (organisation name, enabled worlds, default language) and the console (programmes, name). (4) `WebXR/privacy.html`, linked from the sign-in dialog and the homepage footer; the audit list in the console. (5) `tools/check_enterprise.mjs` in check_all; docs in `docs/enterprise.md` · — · next: org.js
