# DATAWORKS (`dx`, 8995) — the consented data system

Environment & robotics wave. Owns `WebXR/shared/dx-data.js` (schema, consent, storage, export,
card, analysis), `WebXR/shared/dx-capture.js` (world capture), `WebXR/shared/dx-consent-ui.js`
(the Me-tab panel), `WebXR/data/index.html` (analysis page), `tools/dx_analyze.mjs`,
`tools/check_dataworks.mjs`.

## Cycles

1. Reason: publish the episode schema as plain data first so ROBOTICS/TQ-BRIDGE can code against it; check = `dxMakeEpisode` → `dxValidateEpisode` ok in Node. Observed: `{"ok":true,"errors":[]}`, split `train`, analysis keys present; schema table in docs/robot-datasets.md.

## Seams
