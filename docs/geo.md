# Live geolocation and satellite imagery on the parish maps (console GEO)

**The plain statement first:** the parish maps now carry a real Sentinel-2 picture of every Louisiana map, baked at build
time; a viewer can ask "Find me" once, and the answer stays in the page's memory and nowhere else; a live satellite layer
exists but requests nothing until the viewer switches it on.

Implementation: `WebXR/shared/geo-locate.js` (runtime), `tools/geo_maps.mjs` and `tools/geo_bake.py` (build time), the
hooks in `WebXR/parishes/js/app.js` and `parishes.html`, the teacher's switch in `WebXR/instructor/js/dean.js` and
`dn-modules.js` (`geolocation` on a DEAN version). Checker: `node tools/check_geo.mjs`. The Mapbox pieces are unchanged
([mapbox.md](mapbox.md)).

## 1. Find me (runtime, opt-in)

In the Map tab of the in-world menu (INTERFACE, `ux-menu.js`): **Find me** and **Forget my location**.

| Rule | How it holds |
|---|---|
| Only after a user gesture | `geoFindMe(event)` refuses any event that is not `isTrusted`; nothing calls it on load or on a timer. `getCurrentPosition` is called in exactly one place, once per press; `watchPosition` is used nowhere. |
| Memory only | The position is one variable inside `geo-locate.js` (`geoHere()`); Forget or a reload drops it. |
| Never sent, stored or logged | `geo-locate.js` has no fetch, XHR, beacon, socket, storage or console call. The nearest-map link is a plain `?parish=<id>`; no URL carries a coordinate. |
| Never in demo or signed-out sessions | `geoAllowed()` allows only a `profiles.js` profile of kind `account`; `?demo` and the demo profile are refused. |
| Off by default in K-12 class sessions | A K-12 class session (`?k12=1`, a class-scoped DEAN version, a version locked to the K-12 path, or the K-12 path chosen) needs the teacher's version to carry `geolocation: true`. DEAN's cleaned version defaults it to `false`; only a literal `true` turns it on. Teachers switch it in the instructor console's versions panel ("Turn Find me on", or the "Allow Find me" box on a new version). |

What it shows: the nearest map (distance from the viewer to the map's lon/lat box, `npBounds`, by haversine; 0 inside)
with a link to it, and when the viewer stands inside the current map's box a **You are here** pin on the parish map and a
red marker in the world, placed through `npGeoToXz` (np-geo.js). Maps with no real anchors (the programme demo field at
the origin) are never offered.

## 2. Satellite backdrop per map (build time)

```
node tools/geo_maps.mjs > maps.json                  # every map's npBounds and scene<->geo fit
python3 tools/geo_bake.py maps.json                  # the Louisiana regions by default; --only id,id / --regions a,b
```

For each map `geo_bake.py` lists the Sentinel-2 L2A scenes of the last three months for every MGRS tile over the box
(Copernicus open data on AWS, `sentinel-cogs`), previews the five least-cloudy scenes **over the box itself** (a tile's
cloud figure says little about a 2 km district), mosaics the clearest, and resamples the result **into the map's own scene
frame** through its affine fit: column = scene x, row = scene z over the whole field. The picture therefore drops straight
onto the parish canvas map (`npMapXY`) and onto the ground's uv (`np-world.js`) with no transform.

Output: `WebXR/assets/geo/<map>.jpg` — 512 × 512 px, JPEG quality at most 80, at most 90 KB — and `<map>.json` with the
scenes (tile, scene id, date, scene cloud cover, local cloud over the box), coverage and the attribution.

**Budget:** 1600 KB for all baked backdrops together. The 17 Louisiana maps (regions `louisiana-sites`,
`louisiana-cities`, `new-orleans-districts`) use about 1 MB. New maps in those regions are picked up by region, not by a list.

Where it shows:
- **The parish map** (M, or Map tab → Open the map): a `satellite` layer, on by default, under translucent districts; the
  credit line sits under the canvas whenever the picture is drawn.
- **Satellite ground** (Map tab): a toggle, **off by default**, that hands the same picture to `world.setGroundTexture`;
  its own credit line shows while it is on. The Mapbox ground, with a viewer's own token, is unchanged.

Credit, wherever the image appears: **Contains modified Copernicus Sentinel data 2026.** The imagery shows real geography
only: no figure (area, length, capacity) is read off it, site layouts stay illustrative, and nothing is claimed about any
private facility visible in it.

## 3. Live satellite layer (runtime, optional)

In the parish map screen, under **Live satellite (off until you switch it on)**: USGS National Map imagery (public
domain) and NASA GIBS daily VIIRS true colour (yesterday's pass, for weather and flooding). The URLs are the one
`GEO_LIVE` block in `geo-locate.js`; no map library is vendored. Pressing a source loads at most 16 north-up tiles of the
map's box as plain images (`referrerPolicy: no-referrer`); a failed tile (offline, or a viewer that blocks the host) leaves
a note and the baked backdrop in place. Nothing is requested before the press.

## What is proved (`node tools/check_geo.mjs`)

No position without a trusted gesture (untrusted and missing events, mounting, a scripted click); one press asks exactly
once; no storage, cookie, network or log activity during a full Find me run; `geo-locate.js` contains no network, storage
or logging call and is the only module that asks for a position; demo and signed-out sessions are refused; the K-12 default
is off and only the teacher's literal `true` opens it; the nearest-map arithmetic (every map's centre is inside it at 0 m
and pins at the origin; outside, the distance equals an independent haversine to the clamped point; corners; far away);
the live layer requests nothing until switched on, then only the GEO_LIVE hosts, within 16 tiles; every Louisiana backdrop
is 512 px, quality at most 80, at most 90 KB, with its sidecar and credit; the total stays inside the budget; the credit sits
under the canvas; the satellite ground starts off; the bundler lists the module.

## Not done yet

- Real relief from USGS 3DEP (`prd-tnm` on AWS) for hills and levees, as a baked height grid handed to
  `NP_TERRAIN_HOOKS.relief` the way RELIEF's Mapbox relief is — listing works from the build machine; not wired.
- Backdrops for the New Orleans parishes, the Bay Area maps and the Bay Program maps (run `geo_bake.py --regions ...`;
  the budget has room for about 7 more at the current sizes, or raise it).
- Overture footprints (licence decision pending, see the GEO findings).
