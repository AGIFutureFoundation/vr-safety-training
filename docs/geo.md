# Live geolocation and satellite imagery on the parish maps (console GEO)

**The plain statement first:** every parish map of a real place now carries a real Sentinel-2 picture, baked at build
time (representative and procedural maps carry none, on purpose); two Louisiana maps stand on real USGS 3DEP relief; a viewer can ask "Find me" once, and the answer stays in the page's memory and nowhere else; a live satellite layer
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
python3 tools/geo_bake.py maps.json                  # the Louisiana regions by default; --only id,id / --regions a,b / --regions all
```

For each map `geo_bake.py` lists the Sentinel-2 L2A scenes of the last three months for every MGRS tile over the box
(Copernicus open data on AWS, `sentinel-cogs`), previews the five least-cloudy scenes **over the box itself** (a tile's
cloud figure says little about a 2 km district), mosaics the clearest, and resamples the result **into the map's own scene
frame** through its affine fit: column = scene x, row = scene z over the whole field. The picture therefore drops straight
onto the parish canvas map (`npMapXY`) and onto the ground's uv (`np-world.js`) with no transform.

Output: `WebXR/assets/geo/<map>.jpg` at its budget tier's size (below) and `<map>.json` with the scenes (tile, scene id,
date, scene cloud cover, local cloud over the box), the tier, coverage and the attribution.

**Budget (BACKDROPS-2, `tools/geo_budget.json`, read by both the bake and the checker): 2600 KB for all backdrops
together, no file over 90 KB.** A map takes the first tier it matches:

| Tier | Maps | Size, quality, cap | Why | Used |
|---|---|---|---|---|
| `louisiana` | the 21 maps of `louisiana-sites`, `louisiana-cities`, `new-orleans-districts` | 512 px, q ≤ 80, ≤ 90 KB | GEO's bakes, unchanged: small boxes where site detail reads on the parish map | 21 maps, 1269 KB |
| `wide` | any other box 20 km or wider: Jefferson, St. Bernard, Plaquemines, St. Tammany | 384 px, q ≤ 70, ≤ 48 KB | a picture of a box this wide shows land, water and towns, not site detail, at either size, so 384 px keeps the read and saves bytes | 4 maps, 81 KB |
| `city` | the rest: Orleans, the 9 San Francisco, 4 Oakland, North East Bay, South Bay and 2 Bay Program maps | 512 px, q ≤ 75, ≤ 64 KB | full size, a lower quality ceiling and a 64 KB cap, so 18 maps fit | 18 maps, 1013 KB |

Total 2363 KB of 2600 KB for 43 maps. The page loads only the current map's picture, so the per-file cap is what a
viewer downloads; the total is the repository and deploy weight, with room for about four more city maps.

**No real backdrop** for a map that is `representative: true` or `procedural: true`, or in the programme worlds: San
Mateo County Bayside (representative), the nutrient pilot plant (representative) and the Unspoken Smiles District
(procedural). Such a map is not the place in any picture, so a real one would claim what it is not. The bake skips
them, `geoBackdropAllowed(parish)` in `geo-locate.js` returns false, and the app requests no image for them.

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

## 4. Real relief from USGS 3DEP (in the engine, opt-in per map)

`python3 tools/geo_relief.py maps.json <map>` reads the USGS 3DEP 1/3 arc-second DEM (public domain, cloud-optimised
GeoTIFF on AWS `prd-tnm`) over the map's box and writes a 65 x 65 height grid in the map's scene frame to
`WebXR/assets/geo/<map>.relief.json` (integer decimetres, with the source tiles and the credit "Heights: USGS 3D Elevation
Program, 1/3 arc-second (public domain)").

BACKDROPS-2 wired it in. A map opts in with `relief: "3dep"` in its data **and** a committed grid:

1. `python3 tools/geo_relief.py maps.json --module` writes `WebXR/shared/bd2-relief-data.js` (`BD2_RELIEF`) from the
   committed grids of the opted-in maps; the checker proves the two copies match.
2. `np-parishes.js` attaches each grid to its map as `reliefGrid`, so every consumer of the registry (the apps, the
   checkers, the detail measure) sees the same ground with no mount step and no request.
3. `np-parish.js` `npDemSampler(parish)` scales it into the map's schematic range exactly as RELIEF's Mapbox relief is
   (`NP_DEM` equals `RL_FLAT_CAP`, `RL_MAX_RATIO`, `RL_SHORE`, `RL_GRID`): the dry field's real range (2nd to 98th
   percentile, sea level at the bottom) squeezed under the tallest named hill (3 m on a map with none), at most 0.5 map
   metres per real metre, faded out within 96 m of open water, sampled on a per-chunk node grid cached by chunk.
   `npGroundRise` takes the higher of it and the hills; pads terrace at the rise; water beds ignore it. A viewer's Mapbox
   relief never stacks on a committed grid.

On for two Louisiana maps where the ground really rises:

- **Plaquemine Expansion Site** (`la-shintech-plaquemine`): the Mississippi's natural levee ridge and the river levees,
  falling away to the fields and Bayou Plaquemine.
- **Baton Rouge — Downtown & Riverfront** (`br-downtown-riverfront`): the riverfront levee and the higher ground the
  downtown stands on, rising east from the river.

Every other map keeps its schematic ground. No figure is quoted from the heights; they only shape the schematic field.
The detail baselines of the two maps were re-measured on the relief (`tools/dt_measure.mjs --missing`).

## What is proved (`node tools/check_geo.mjs`)

No position without a trusted gesture (untrusted and missing events, mounting, a scripted click); one press asks exactly
once; no storage, cookie, network or log activity during a full Find me run; `geo-locate.js` contains no network, storage
or logging call and is the only module that asks for a position; demo and signed-out sessions are refused; the K-12 default
is off and only the teacher's literal `true` opens it; the nearest-map arithmetic (every map's centre is inside it at 0 m
and pins at the origin; outside, the distance equals an independent haversine to the clamped point; corners; far away);
the live layer requests nothing until switched on, then only the GEO_LIVE hosts, within 16 tiles; every map that may carry
a backdrop has one at its tier's size, quality and cap, with local cloud at most 0.12, its sidecar and credit; each tier
stays inside its caps and the total inside the budget; the representative and procedural maps have none on disk, are
refused by `geoBackdropAllowed`, and loading them the app's way requests no image; no stray picture; the credit sits
under the canvas; the satellite ground starts off; the bundler lists the module and the grid module before every
np-parishes.js. For the relief: exactly the opted-in maps carry grids, the engine's copy equals the committed grid, the
scaling constants equal RELIEF's, the rise stays within the schematic cap and is not flat, water has the same height with
and without the relief, every site pad stays flat and dry, the rise is the higher of hills and relief, a Mapbox hook does
not stack, and an unflagged map has no sampler.

## Not done yet

- More relief maps: Monroe and West Monroe, and Baton Rouge's north industrial map, have grids that show real rises
  (baked to scratch, not committed); opting one in is `relief: "3dep"`, the grid, `--module`, and a detail re-measure.
- Re-bake a backdrop whenever a map's anchors change (the picture is in the map's scene frame).
- Overture footprints (licence decision pending, see the GEO findings).
