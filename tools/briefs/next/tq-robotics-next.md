# TQ-ROBOTICS — next

1. After every loop-5 console has merged: `node tools/export_shared.mjs`, then `node tools/check_bridge.mjs` and `node tools/check_dean.mjs`, and commit the regenerated `exports/shared/holodeck-shared.json`. `robotics` should read `ready` (six of six facets) once VBRIDGE's `vb-*.js` is in the tree; `check_bridge` §9 fails if it is still `partial` then, which means the VBRIDGE seam is unwired. Expect about 677 KiB (gzip about 119 of 128).
2. ROBOTRAIN adds robot stations to the programme: `check_bridge` §9 prints a note listing any robot station without a baseline; regenerate `docs/perf/agent-baselines-robotics.json` with `node tools/ag_eval.mjs --seeds 3 --stations <the robot stations from RP_ROBOT_STATIONS> --out docs/perf/agent-baselines-robotics.json` (a few seconds), and re-run the export.
3. AGENTGYM's full run (`docs/perf/agent-baselines.json`, 721 stations) predates ROBOPROG's four new stations; whoever next regenerates it can retire the supplement (the facet reads the full run first).
4. Ask VBRIDGE to add one plain `VB_SHARED = { phases, roles, governor: { rules } }` to a `vb-*.js` module; until then the bridge reads its named exports.
5. The gzip budget has about 8.8 KiB left. Before another section is added, export ids and names only, and give it a facet cap like `TQR_FACET_CAP`.
6. When the Trade Craft Academy site documents an import shape, align the `pathways`, `credentials` and `launch` registries and the launch path forms (`smartcity-x.html?sim=…`, `parishes.html?parish=…&site=…`) to it and bump `TQ_ADAPTER_VERSION`.
