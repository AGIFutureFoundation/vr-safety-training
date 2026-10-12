# PACKS — next brief

1. Close the STORYLINE seam: once `st-*.js` is merged, import `stChosenPath` in `WebXR/parishes/js/app.js` (the menu mount
   currently probes it with `typeof`) and add a "Your path's packs" chip to STORYLINE's path picker via `pkPathPacks(path)`.
2. TYCOON: `tyEarn(stationId)` can name the pack through `pkPackOf(stationId)[0]` in the ledger line.
3. Mount a packs strip in one more world (Bay World's menu) with `pkPacksAt("bayworld")`; the registry is ~75 KB, so
   consider a per-world slice if a world's bundle budget tightens.
4. Paths with few packs of their own: Disaster Relief (1 own — hazmat-environmental — 8 with alsoPaths), UN Training (1). New content decides these, not the
   generator — do not relabel programmes to fill a path.
5. Per-pack thumbnails: the cards carry no image by design (no logo files); a screenshot per pack could reuse the
   track thumbnails (WebXR/home/tracks/img/) for programme packs.
6. Edge: add `packs/index.html` to EDGE_NO_STORE_PAGES in tools/bundle_webxr.py and `/packs/*` to the headers if
   check_deploy asks for it.
