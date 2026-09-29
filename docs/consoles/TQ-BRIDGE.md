# TQ-BRIDGE — one export for SmartCiti.X Holodeck and SmartCiti.X TradeQuest (`tq`, 8996)

Brief: `$SP/robotics/wave-brief.md` § TQ-BRIDGE. Contract: `docs/tradequest-bridge.md`.

Base 9914455 (fast-forwarded from 589f0d8; the tree was clean and 589f0d8 is an ancestor).

## Cycles

1. Reason: v2 = DEAN's v1 + guarded sections (maps, palette, facades, vehicles, robotics, dataset), a v2 schema that is a superset of v1, a changelog and a size budget; proof = `export_shared` prints valid + every section status, and `check_dean` stays green on the v2 file. Act: `tools/tq_bridge.mjs` (section readers, `TQ_SECTIONS`, `tqSchemaV2`, `tqValidate`, changelog, budget), `export_shared.mjs` builds `dnBuildSharedV2()`, `check_dean` builds v2. Observe: first run failed the schema — 6 drivables have `medium` rail/site, not road/water (the checker caught real data); enum widened → `export_shared: v2.0.0 · … sections: maps ready, palette pending, facades pending, vehicles partial, robotics pending, dataset partial, packs ready, paths ready · 556.6 KiB of 768 KiB (gzip 81.7 of 128) · valid`; `check_dean: 1810/1810 checks, 0 failed`.

## Seams

- `tqExtend(v1, { shared })` (tools/tq_bridge.mjs) — v1 document → v2 document.
- Owner seam (preferred): a plain `<PREFIX>_SHARED` export in the owner's module (`PA_SHARED`, `FC_SHARED`, `MV_SHARED`, `RB_SHARED`, `DX_SHARED`); else the named exports in `TQ_SECTIONS`.
- `tqAdapt(v2)` (exports/shared/tradequest-adapter.js) — v2 → the TradeQuest registries.
