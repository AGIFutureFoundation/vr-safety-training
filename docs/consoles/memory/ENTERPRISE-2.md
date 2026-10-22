# ENTERPRISE-2 memory — read this first (after ENTERPRISE's)

Short, durable lessons from the second run at this console. `docs/consoles/memory/ENTERPRISE.md` still holds.

- **The dist console bundle imports three.js from its CDN** (devices.js and eggs-app.js spell `THREE.`), so a headless
  run that aborts every external request silently gets a page with no chip, no tabs filled and no page error. Answer
  `three.module(.min).js` from `WebXR/vendor/three/` (check 8 does) instead of aborting it.
- **Inject the enterprise block by fulfilling the page's `auth-config.json` request** (`context.route`) — no temporary
  config file, nothing to restore, and the same run can visit the console and the homepage with one block.
- **`account.js` may import `org.js` statically** (check_auth forbids `import(` in it): the bundler block `for _en_cfg`
  puts org.js after the last of profiles/records/passport-programmes in every app carrying account.js and adds any it
  lacked (three apps lacked passport-programmes.js). `org.js` evaluates `isoDuration` at load, so order matters.
- **The homepage's default language arrives through a lazy import**; wait for `documentElement.lang`, not a fixed delay.
- **The learner's own ladder needs no consent.** `enMyCohorts()` computes from this device's records and stores nothing;
  consent governs only the coordinator's snapshot. Keep that line when adding to either side.
- **The console applies the block on `gt:profile` and a 1.5 s timer only** — on a slow machine the line can miss; a
  `gt:config` event from account.js after `loadConfig` would remove the race (left for the next run).
- **Captures** come free from the checker: `EN_SHOTS=docs/img/enterprise node tools/check_enterprise.mjs`.
