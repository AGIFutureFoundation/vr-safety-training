# PACKS memory (console PACKS, the Holodeck Packs run)

- Base d85a41f (the worktree started on 589f0d8; reset per the brief). Prefix `pk`, port 8986. Plan and seams: docs/consoles/PACKS.md.
- Generator `tools/gen_packs.mjs` → 144 manifests in `WebXR/packs/` (56 programme, 4 K-12, 64 union, 20 library),
  `WebXR/packs/index.json`, `WebXR/shared/pk-packs-data.js` (compact, ~75 KB), `WebXR/packs/index.html` (source layout)
  and `WebXR/packs/flat/index.html` (flat layout; the bundler copies it and the manifests to `WebXR/dist/packs/`).
- Registry `WebXR/shared/pk-packs.js`: pkPacks(filter), pkPack(id), pkPackOf(stationId), pkPacksAt(place), pkPathPacks(path).
- Mounts: parishes menu `#menu-packs` + "Holodeck Packs" button (bundled into parishes.html), homepage docs list
  (tools/gen_home.mjs), instructor console fine print. Bundler: SIBLING_APP_DIRS has "packs"; combined_fixup maps
  `../../packs/` → `./packs/`.
- Export: `tools/export_pack.mjs <id>` (also `export_unity.mjs --pack`, `bundle_webxr.py --pack`) → `exports/packs/<id>/`
  (gitignored). Unity trade-room files are `stations/trades--<id>.json`.
- Checker `tools/check_packs.mjs` (23,544 checks, ~1 s) in check_all's list and the baseline (1100 ms); asserts no pack carries roam and every other path has one (coordinator heartbeat 1, commit 4f98e02).
- Path mapping lives in gen_packs.mjs (PK_PROGRAMME_PATHS, PK_UNION_PATHS, PK_LIBRARY_ALSO). Library packs have no
  `programmes` (only `relatedProgrammes`) so exports hold only their own content.
- Gotcha: `pkill -f <pattern>` inside a Bash call kills the calling shell when the pattern is in its own command line.
