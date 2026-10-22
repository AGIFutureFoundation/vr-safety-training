# TQ-BRIDGE — next

1. After PALETTE, FACADES, MOTORWORKS, ROBOTICS and DATAWORKS merge: `node tools/export_shared.mjs`, then `node tools/check_bridge.mjs` and `node tools/check_dean.mjs`; commit the regenerated `exports/shared/holodeck-shared.json` (every section should read `ready`; the rehearsal gave 588.3 KiB, gzip 90.7).
2. Ask each owner to publish one plain `<PREFIX>_SHARED` object (e.g. ROBOTICS already has `rbSharedData()`), so the bridge stops depending on individual export names.
3. When the Trade Craft Academy site documents an import shape, align `tradequest-adapter.js` to it and bump `TQ_ADAPTER_VERSION`; confirm the campus routing for south-bay and bay-program maps (null today).
4. Optionally add a `--rehearse <dir>` flag to check_bridge that runs the export over an overlay tree before a merge.
