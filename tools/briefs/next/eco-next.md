# eco-next: the next ECOSYSTEM console

Read `docs/consoles/ECOSYSTEM.md`, `docs/consoles/memory/ECOSYSTEM.md`, `docs/ecosystem.md` and `tools/briefs/ecosystem/`. You own the `eco-*.js` files and `docs/ecosystem/`. Do these items in order.

1. **Make the Ecosystem tab's built-page drive a checker leg.** ECOSYSTEM measured it once by hand (238 options, 0 page errors, 0 requests).
   - Rebuild with `python3 tools/bundle_webxr.py`. Serve on your own port. Open `instructor-console.html` and click Ecosystem.
   - Measure page errors (0), the option count (238) and the three blocks shown for "electrical".
   - Confirm there are no requests and no storage writes, then restore the dist (`git checkout WebXR/*/dist`).
   - **Check:** add a browser leg to `check_eco`, or write a small `check_eco_page.mjs`, together with its baseline row.
2. **Widen the rules where an adult block exists.**
   - Read the 456 unmatched stations in `docs/ecosystem/blocks-match.json`.
   - For each group, find an adult-band pack that genuinely covers it (Corporate OS adult, Global Health OS adult, Education OS). Add a declared rule only where the words truly match.
   - Never admit a school band without `k12Band` and `k12Reason`, and justify each one in `docs/ecosystem.md`.
   - **Check:** the `check_eco` 1–3 counts move N → N+k, and a 25-row sample is read by hand and recorded in the console note.
3. **Wire `eco-bus` to the learner path behind consent.**
   - Station `start`, `step` and `complete` events go to an in-memory adapter only when `dxCollecting()` is true. Nothing is sent.
   - The console's Ecosystem tab may show the count of events held on this device (no contents).
   - **Check:** with consent off, 0 events are held; with consent on, N are held; revoking consent leaves 0. Keep `check_dataworks` passing.
4. **Give the cross-repo fixture a home.**
   - Export one seeded run's adapter output as JSONL under `docs/ecosystem/` (small), so the SmartCiti.X brief's item 4 has a fixture whose owner chose to share it.
   - **Check:** every line validates (`check_eco` 4), and the size is under 50 KB.
5. **Keep Router.X honest.**
   - If a Router.X repository appears, read it and replace the "expected, not yet built" interface with its documented one, citing the file and commit.
   - Until then, `check_eco` 6 keeps the absence stated.

**Evals:**
- tab page errors 0, with options and blocks measured in the built page;
- stations mapped 214 → N of 670, with unmatched still listed;
- learner events held only with consent, N of N, with revoke leaving 0;
- fixture lines valid N of N;
- network calls 0;
- `check_eco` passes.
