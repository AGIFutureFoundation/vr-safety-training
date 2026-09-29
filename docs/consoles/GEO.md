# Console GEO: live geolocation and satellite imagery (prefix `geo`, port 9011)

Louisiana round 2. The ask: upgrade the maps with live geolocation and satellite imaging data. The user-facing
reference is [docs/geo.md](../geo.md); this page is the console's log.

## What shipped

| Piece | Where |
|---|---|
| Opt-in **Find me** (one trusted press, memory only, never stored, sent or logged; off in demo and signed-out sessions; off in K-12 class sessions unless the teacher's DEAN version turns it on) | `WebXR/shared/geo-locate.js`, the Map tab in `WebXR/parishes/parishes.html`, `app.js` |
| The teacher's switch (`geolocation` on a DEAN version, false unless literally true) | `WebXR/shared/dn-modules.js`, `WebXR/instructor/js/dean.js` |
| **Baked Sentinel-2 backdrop** for the 17 Louisiana maps, in each map's scene frame, as the parish map backdrop and an optional satellite ground (off by default), with the credit line | `tools/geo_maps.mjs`, `tools/geo_bake.py`, `WebXR/assets/geo/<map>.jpg` + `.json` |
| **Live satellite layer** (USGS National Map, NASA GIBS daily), off by default, one URL block, fails gracefully | `geo-locate.js` (`GEO_LIVE`, `geoMountLive`), the map screen |
| Checker | `tools/check_geo.mjs` (83 checks) |
| Bundler | `geo-locate.js` listed for the parishes app in `tools/bundle_webxr.py` (dist not committed) |

Budget: 1600 KB for all baked backdrops; the 17 Louisiana maps use 1007 KB (16–80 KB each, 512 px, JPEG q80).

## Cycles

1. Reason: Find me must be provably gesture-only and memory-only, so put the one `getCurrentPosition` call behind an
   `isTrusted` event check in a module with no network, storage or logging, and inject `geolocation` so a checker can
   count calls. Act: `geo-locate.js` (`geoFindMe`, `geoAllowed`, `geoIsK12`, `geoRank`/`geoNearest`/`geoPinOn`,
   `geoMountFindMe`). Observe: `node --check` clean; the module imports only np-geo.js.
2. Reason: the backdrop should line up with the parish canvas and the ground's uv without a runtime transform, so bake it
   in the map's scene frame rather than north-up. Act: `tools/geo_maps.mjs` prints each map's fit; `tools/geo_bake.py`
   mosaics Sentinel-2 in lon/lat and resamples through the fit. Observe: New Iberia baked in 14 s, 45 KB; the runway in
   the image sits on the map's drawn runway in the headless map capture — the frame is right.
3. Reason: bake all 17 Louisiana maps in the background while wiring the page. Act: the Map tab gets Find me and the
   satellite-ground toggle, the map screen gets the backdrop layer, the credit and the live layer; DEAN gets
   `geolocation`. Observe: 17/17 baked, 962 KB; but the French Quarter came out 80 % white and Uptown 55 % — the tile's
   cloud figure (0 %) said nothing about a 2 km box.
4. Reason: choose scenes by cloud over the box itself. Act: preview the five least-cloudy scenes per tile at low
   resolution over the box, keep the one with the fewest bright-white pixels, three months of scenes, recorded as
   `local_cloud` in the sidecar; re-bake in four parallel shards. Observe: every map now at most 0.11 local cloud (the
   French Quarter's remainder is bright roofs), 17/17 baked, 1007 KB; one shard's connection dropped on Rapides and a
   single retry baked it.
5. Reason: prove it. Act: `tools/check_geo.mjs` with stub storage, network, logging, geolocation and a tiny DOM.
   Observe: first run 80 pass / 3 fail, and the FAIL lines were swallowed by my own console stub; fixed the reporter,
   then 2 fails were the checker reading the word "watchPosition" in a comment — strip comments before scanning and name
   the asking module by file. 83 pass, 0 fail.
6. Reason: the unit proof is not the page. Act: headless Playwright against the real source page and the rebuilt
   parishes dist bundle. Observe: signed out, Find me is disabled with "Sign in to use Find me."; with a stub signed-in
   session and a granted position, one click made exactly one geolocation call, the pin appeared, no storage write or
   request carried the position and no live-imagery request happened; `?k12=1` disabled it with the class message; the
   satellite ground toggled on with its credit; switching the USGS layer on made 16 tile requests, all blocked from this
   machine, and the note said so while the backdrop stayed. No page errors.

## Checkers (single runs; check_all never run)

See the hand-back for the counts of `check_geo`, `check_mapbox`, `check_dean` and the parish-page checkers run after the
change.

## Left

- Real relief from USGS 3DEP for one Louisiana map (item 4): not started.
- Backdrops for the New Orleans parishes and the Bay Area maps (the budget has room for about seven more at current sizes).
- The dist bundles are rebuilt locally but not committed; the next full bundle run carries `geo-locate.js`.
