# TQ-BRIDGE memory

- v2 export = DEAN's v1 (unchanged) + `tools/tq_bridge.mjs` sections; `tools/export_shared.mjs` writes it; `check_dean` builds v2 and checks the v1 fields against the v1 schema.
- Sections read owners behind a guard; the preferred owner seam is `<PREFIX>_SHARED`, else the names in `TQ_SECTIONS` (updated to the real names FACADES/MOTORWORKS/ROBOTICS/DATAWORKS use in their worktrees).
- Budget 768 KiB raw / 128 KiB gzip. In-tree 556.6 KiB (gzip 81.7); rehearsal with every owner merged 588.3 KiB (gzip 90.7).
- Adapter `exports/shared/tradequest-adapter.js`: TradeQuest registries `{ pack, provenance, status, items }`; campus routing in `TQ_CAMPUS_BY_REGION` (AUTHORED).
- Proof: `node tools/check_bridge.mjs` (86 checks).
