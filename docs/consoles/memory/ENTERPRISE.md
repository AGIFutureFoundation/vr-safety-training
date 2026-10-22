# ENTERPRISE memory — read this first

Short, durable lessons for the next team at this console.

- **The worktree branch may sit on the initial commit.** Check `git log --oneline -1` first; the merged tree is the coordinator's branch tip (`git reset --hard <tip>` on your own worktree branch, never on the main checkout).
- **The worktree guard refuses long compound shell commands and heredocs.** Put multi-file edits in a Python script under `$SP/holodeck/enterprise/` and run it as one plain command; run git steps one at a time.
- **One store, through `gtStorage()`.** `vr-org-v1` is in `GT_PROFILE_KEYS`, so it is per profile and dies with the demo tab. Read the whole store, change it, save it — never hold a reference across a call that saves (`enAudit(action, detail, state)` takes the state you are already mutating for that reason).
- **The console sets no markup from strings.** `check_console` greps `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`document.write` in `instructor/js/*.js` and the page body. Build everything from `el()`/`textContent`; the certificate is an SVG *string* handed to a Blob download, never inserted into the page.
- **The bundler erases import aliases and shares one scope.** No `import { X as Y }`; every top-level name in org.js and cohort.js is `en…`. Add a module to the instructor entry in `tools/bundle_webxr.py` in dependency order (org.js after profiles, records, passport-programmes).
- **`Auth.config` is read once per page by the account chip.** In the console the enterprise block is only there after `controls.js` mounted the chip and `auth-config.json` came back, so `enApplyDeployment` runs on `gt:profile` and again on a short timer.
- **Consent is a field on the member, off by default**, and the snapshot exists only while it is on; `enSetConsent(id, false)` drops it. Exports copy snapshots only for consenting members — keep that invariant when adding fields.
- **check_auth asserts the four auth modules appear once per bundle** (module-list lines), that account.js/profiles.js contain no `fetch(`, `<img`, `<svg` or `.src =`, and that no real client id or wallet address is committed. The privacy link in the dialog is an `<a>` built with `gtEl`, not markup.
- **Captures.** Serve `WebXR/` on 8995, `node $SP/holodeck/enterprise/capture.mjs` (Playwright at `/opt/node22/lib/node_modules/playwright`, Chromium at `/opt/pw-browsers/chromium`) writes `docs/img/enterprise/*`.
