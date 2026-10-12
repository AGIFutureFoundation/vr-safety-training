# GOVERNOR-2 memory

- Base 8a16ec16 (loop 9). Prefix `gv2` (extended `vb`/`ent3` modules keep their prefixes), port 9082.
- Rate limit: `VB_RATE_LIMIT` (20/min, 60 s window) in vb-shared-data.js; window per clientId in `vbGovernor`; new job ids count (refused too), a repeat of an admitted job id is a step (GAME calls) and counts once. Clock: `atMs` → `now()` → one logical second per decision.
- Anomaly: `VB_ANOMALY` (4 features, one-sided z > 4, seeded procedural history 4 × 120 rows); `vbAnomalyHistory` / `vbAnomalyModel` / `vbAnomalyScore` in vb-governor.js. Both new reasons sit after the 9 hard rules.
- Measured: injections caught 66/100 (payload 49/50, cadence 17/50, pinned), false refusals 0/200 + 0/200; registry round trip 200/200, tampered 50/50, forks 20/20.
- Gotcha: `ent3Text` strips `<>`, so the audit detail "a -> b" is stored "a - b"; match deploy lines on " <siteId> (sim)".
- Gotcha: the panel's click-through runs at machine speed; queued jobs carry scenario arrival times (`VB_PANEL_ARRIVAL_MS`) or the cadence feature fires.
- Gotcha: the governance view's note text starts with "Export registry", so Playwright `text=` matches the paragraph; use `button:has-text(...)`.
- Drives: `$SP/loop9/gv2/drive_panel.mjs` (pv_browser harness), `drive_gov.mjs` (static server, two contexts).
