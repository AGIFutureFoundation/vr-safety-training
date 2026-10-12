# SMILES — memory

- Map `sm-unspoken-smiles` (Unspoken Smiles District), region `programmes` ("Programme Worlds", last in NP_REGIONS), strict.
  PROCEDURAL, not a real place; anchors on a nominal frame at zero lon/lat, declared scale 1.1 (docs/parishes.md).
  Generator kept outside the tree; the module is plain data — edit it directly.
- Games `WebXR/shared/sm-smiles.js`: names are `smiles*`/`SMILES_*` because Sierra Summit owns `SM_*`/`sm*` in the bundle scope.
  Every line: `quote` verbatim in `WebXR/smartcity/js/sims/<station>.js`; K-12 `text` uses only that file's words (≥4 letters).
- Treasures: SMILES section in `tools/gen_treasures.mjs` (set `smile-toothbrushes`); `check_treasures` resolves the sites.
- There are no K-12 dental stations in the catalog; field lessons use fitting classroom stations with dental trade stations.
- Checker `tools/check_smiles.mjs` (in check_all's list and the baseline).
