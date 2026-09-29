# DATAWORKS (`dx`, 8995) — the consented data system

Environment & robotics wave. Owns `WebXR/shared/dx-data.js` (schema, consent, storage, export,
card, analysis), `WebXR/shared/dx-capture.js` (world capture), `WebXR/shared/dx-consent-ui.js`
(the Me-tab panel), `WebXR/data/index.html` (analysis page), `tools/dx_analyze.mjs`,
`tools/check_dataworks.mjs`.

## Cycles

1. Reason: publish the episode schema as plain data first so ROBOTICS/TQ-BRIDGE can code against it; check = `dxMakeEpisode` → `dxValidateEpisode` ok in Node. Observed: `{"ok":true,"errors":[]}`, split `train`, analysis keys present; schema table in docs/robot-datasets.md.
2. Reason: gate capture on consent in every world (panel in the Me tab `#menu-dataworks`, parish lessons and drills via dx-world.js, sessions via dx-capture.js); check = fixture analysis numbers by hand. Observed: dx_analyze --fixture 12 episodes, success 0.833, flags 1/1/1, 0 invalid; export → re-read identical numbers.
3. Reason: prove privacy + round-trip headlessly; check = new tools/check_dataworks.mjs. Observed: 55 passed, 4 failed (revoke test used an un-namespaced legacy key; eviction tie on the duplicate's timestamp; page and bundler copy not yet built).
4. Reason: fix the two test expectations (legacy key through gtKeyFor, eviction compared as a set); check = check_dataworks. Observed: 57 passed, 2 failed (page, bundler).
5. Reason: build WebXR/data/index.html (design.css, Home chip, ctlMount, gdMount, consent panel, local/sample/open/export) and copy it in bundle_webxr.py like scholar; check = check_dataworks. Observed: 59 passed, 0 failed.
6. Reason: nothing existing regressed; check = check_share, check_episodes, check_dataset_tools, check_interface. Observed: all pass; check_interface OK — 21 passed, 0 failed (menu-dataworks listed in the Me tab).

## Seams

- `DX_SCHEMA` / `DX_SCHEMA_ID` / `DX_SCHEMA_VERSION` (`smartcitix.holodeck.episode` 2.0.0), `dxMakeEpisode(meta, steps)`, `dxValidateEpisode(ep)` — ROBOTICS' `rbEnv`/`tools/rb_rollout.mjs` write episodes with `dxMakeEpisode({ source: "synthetic", world: "robotics", kind: "gym", scenario, seed, policy, generator: "tools/rb_rollout.mjs" }, steps)` and write shards with `dxExportFiles()`.
- `DX_CARD_SECTIONS`, `dxDatasetCard(manifest)`, `DX_UPLOAD_HOOK` — TQ-BRIDGE exports these as the episode schema and dataset-card template.
- `dxCaptureRollout(steps, meta)` (dx-world.js) — robot games played in the browser; inert unless opted in.
- `dxAttachSession(session, opts)` (dx-capture.js) — any shared/game.js station; not yet mounted in smartcity (its existing local recorder is unchanged).
- `dxMountConsent(el)` — `#menu-dataworks` inside the Me tab (parishes), and the data page.

## Privacy decisions

- Eligibility needs demo === false, signedIn === true, k12 === false and adult === true; any unknown (null) refuses. K-12 is read from `?k12`, `?kids`, `?audience=k12|classroom|kids|school`, a SCHOLAR session on the profile, or DEAN's active version scoped to a class — conservative on purpose (an adult who played a K-12 lesson on this profile is not offered collection).
- Revoke deletes the dx consent, salt and episodes (IndexedDB and localStorage), the legacy `shared/episodes.js` log and the share-engagement consent/receipts for the current profile.
- No fetch/XHR/beacon/WebSocket in any dx module (checked).
