# Memory: ENV-HD-6 (loop 10, round 6, `hd6`, port 9143)

- Base 230105b7 (fast-forward). Scratch `$SP/loop10/hd6/` (stills in `scenes/`, `ultra/`; drive logs `driveA.txt` …;
  probes in `probe/`: `tree*.mjs` found the park's tree, `cams.mjs` compares the 14 non-robot cameras with
  `before-cameras.json`, `tiers.mjs` measures the cue mesh per tier in the built page).
- **The tree (item 2a).** The tree over the park's street camera is KREWE's live oak (`kw-place.js` `kwPlacements`, crown
  15.5 × 14.6 m), 7.95 m from the old camera: not massing, not DETAIL. `hd3-scenes.js` `hd3KitRects(parish)` adds KREWE's
  placements to `hd3Obstacles` (live oak half 7.8 + 1.5 m, other kits 6 m). Only the park's street camera moved
  (-554,-50 → -543,-50; crown edge 0.2 → 9.3 m). `check_exteriors` +7 lines (309 → 316).
- **The lamp (item 2b).** The "bar in the sky" is ATMOS's site lamp (`at-world.js` `rebuildLamps`: a 1.4 × 0.5 m MeshBasic
  quad at y + 6.5 over each board, `siteLights: world.siteBoards`). at-world.js is untouched (phone unchanged);
  `hd6LampParts(board)` draws a pole 1.9 m east of the board, an arm, a housing just over the quad and a back plate, in
  the hd6 mesh (high and balanced only). `check_hd6` reads at-world.js' lamp line, so a moved lamp fails it.
- **The cues (item 1).** `hd6-kinds.js`: `hd6KindSites` = HD3_SCENE_SITES' four `by: "kind"` sites; the local frame's +z
  is out of the door face (`cwDoorOf`), yards go on the side away from the board. One merged vertex-coloured Lambert mesh
  per map `hd6-kind-cues`, mounted in app.js after the hd4 site lights (`window.__parishTest.hd6()`).
- **Ultra (item 3).** `hd6UltraShells`: one 2048 px canvas atlas (four 1024 px cells by kind), four wall planes 3 cm proud
  per building, polygonOffset; only when `hd4Ultra.on`.
- Bundler: `hd6-kinds.js` after `hd4-rooms.js` (check_hd4 wants the three hd4 modules adjacent).
- New checker `tools/check_hd6.mjs` in check_all with an ESTIMATED baseline row (1.5 s).
