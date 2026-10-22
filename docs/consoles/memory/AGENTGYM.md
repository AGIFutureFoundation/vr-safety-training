# AGENTGYM memory

- Base 949c0919 (loop 4). Prefix `ag`, port 9036.
- Modules: `WebXR/shared/ag-gym.js` (task API + baselines + walkthrough), `ag-feedback.js` (ratings as DX episodes, preference pairs), `ag-walkthroughs.js` (generated). Page `WebXR/agentgym/index.html`. Tools `tools/ag_eval.mjs`, `tools/check_agentgym.mjs`.
- Key facts: 721 stations from `loadSmartCity()`; 0.05 s per decision; 900-decision cap; pass rule = runEpisode's (finished, 2+ stars, 0 hazards).
- Scripted expert passes 100% through the task API (proves the observation/action space is sufficient). Retrieval finishes ~all stations but rarely passes (too many corrections). Success with hints tracks hint count.
- Gotcha: `globalThis.navigator` is getter-only in Node 22, so trap sendBeacon with defineProperty.
- Gotcha: the station score floors at 0, so a per-step delta sum equals the final score only when the floor never bit.
