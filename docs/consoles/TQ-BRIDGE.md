# TQ-BRIDGE — one export for SmartCiti.X Holodeck and SmartCiti.X TradeQuest (`tq`, 8996)

Brief: `$SP/robotics/wave-brief.md` § TQ-BRIDGE. Contract: `docs/tradequest-bridge.md`.

Base 9914455 (fast-forwarded from 589f0d8; the tree was clean and 589f0d8 is an ancestor).

## Cycles

1. Reason: v2 = DEAN's v1 + guarded sections (maps, palette, facades, vehicles, robotics, dataset), a v2 schema that is a superset of v1, a changelog and a size budget; proof = `export_shared` prints valid + every section status, and `check_dean` stays green on the v2 file. Act: `tools/tq_bridge.mjs` (section readers, `TQ_SECTIONS`, `tqSchemaV2`, `tqValidate`, changelog, budget), `export_shared.mjs` builds `dnBuildSharedV2()`, `check_dean` builds v2. Observe: first run failed the schema — 6 drivables have `medium` rail/site, not road/water (the checker caught real data); enum widened → `export_shared: v2.0.0 · … sections: maps ready, palette pending, facades pending, vehicles partial, robotics pending, dataset partial, packs ready, paths ready · 556.6 KiB of 768 KiB (gzip 81.7 of 128) · valid`; `check_dean: 1810/1810 checks, 0 failed`.
2. Reason: the TradeQuest adapter — v2 → the site's `{ pack, provenance, status, items }` registries with its provenance words; proof = a smoke run lists every registry with its status. Act: `exports/shared/tradequest-adapter.js` (`tqAdapt`, `tqAccepts`, `tqStationIndex`, `TQ_CAMPUS_BY_REGION`). Observe: `pending [finishes, kit, scenarios] · places ready 22 · courses ready 145 · paths ready 7 · fleet partial 75 · dataset partial · 342 stations indexed`.
3. Reason: `tools/check_bridge.mjs` — schema, v1 compatibility, sources-or-pending, the guard with stand-in owner modules, maps, adapter shape, budget; proof = its last line. Act: 8 sections. Observe: first run 81/86 — the throwing-module guard test passed through Node's ES-module cache (same URL re-imported), fixed with a second scratch tree; the doc checks failed (no doc yet) → next cycle.
4. Reason: the contract doc names every section, registry, the budget and the `<PREFIX>_SHARED` seam; proof = check_bridge §8. Act: `docs/tradequest-bridge.md`, a v2 note in `docs/modules.md` §4, checker listed in `check_all.mjs` (not run) and `checkers-baseline.json`. Observe: 85/86 (registries only inside a code block) → listed with backticks → `check_bridge: 86/86 checks, 0 failed · v2.0.0 · maps ready, palette pending, facades pending, vehicles partial, robotics pending, dataset partial · 556.6 KiB (gzip 81.7) · 522 ms`.

## Seams

- `tqExtend(v1, { shared })` (tools/tq_bridge.mjs) — v1 document → v2 document.
- Owner seam (preferred): a plain `<PREFIX>_SHARED` export in the owner's module (`PA_SHARED`, `FC_SHARED`, `MV_SHARED`, `RB_SHARED`, `DX_SHARED`); else the named exports in `TQ_SECTIONS`.
- `tqAdapt(v2)` (exports/shared/tradequest-adapter.js) — v2 → the TradeQuest registries.
