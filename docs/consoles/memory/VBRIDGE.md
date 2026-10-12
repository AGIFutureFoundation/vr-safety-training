# VBRIDGE memory

- Loop 5, base c472f079, branch worktree-agent-aa516b47f24fe75b7, port 9041, prefix `vb`.
- Owns: `WebXR/shared/vb-shared-data.js` (VB_SHARED, no imports), `vb-governor.js`, `vb-bridge.js`, `vb-providers.js`, `vb-panel.js`,
  the station `vb-supervising-agent-dispatched-robots`, `tools/check_vbridge.mjs`, `tools/vb_export_game.mjs`,
  `exports/shared/vb-game-functions.json`, `docs/virtuals-bridge.md`.
- Touched others' files minimally: `ent3-governance.js` (+`ent3AuditAppend`), `rp-programme-data.js` (RP_AI + RP_ROBOT_STATIONS),
  `parishes/js/app.js` (mount), `bundle_webxr.py` (parishes list), add_station's generated registrations.
- Hard rules: no key/wallet/signing/RPC/chain, no token/price/payment, no affiliation wording, simulated robots only,
  physical path disabled (VB_PHYSICAL frozen). check_vbridge proves each.
- State at hand-back: check_vbridge 14/0; eval 200/200 adversarial blocked, 0/200 safe false-blocked; station eval_content 98.
