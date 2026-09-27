# The Bay Atlas and the real-world map under Bay World

**The plain statement first: this repository ships no Mapbox token, and nothing in it contacts a Mapbox host until a viewer supplies one.** Out of the box the Bay Atlas draws its map from Bay World's own data and Bay World keeps its procedural ground. A token turns on two things — a real-world map under the atlas, and a satellite image under the city — and turns on nothing else.

Implementation: `WebXR/shared/bay-geo.js` (the fit), `WebXR/shared/mapbox.js` (token, loader, map, ground), `WebXR/bayworld/atlas.html` + `js/atlas.js` (the page), the hook in `WebXR/bayworld/js/world.js`. Checker: `tools/check_mapbox.mjs`.

## What the Bay Atlas is

`WebXR/bayworld/atlas.html` (bundled to `WebXR/dist/atlas.html`) lists every Bay World training site and public landmark — 50 sites and 28 landmarks across sixteen zones, straight from `WebXR/shared/bayworld-data.js`, and whatever those counts become — with, for each one:

- the programmes it anchors, as chips that open SmartCiti.X on that programme (`smartcity-x.html?programme=…`);
- **Open in Bay World**, which starts a shift beside that place (`bayworld.html?site=…`, or `?landmark=…`);
- **Launch a station**, which opens the site's first training station (`smartcity-x.html?sim=…&from=atlas`), for the sites that have one.

Over the list sits the map. Which map depends on one thing:

| | Without a token | With a token |
|---|---|---|
| **The atlas map** | An SVG drawn from the data: zone circles in their accents, roads by lane count, a diamond per landmark, a circle per site. Click or focus a marker for its card and links. Works offline, from `file://`, and anywhere the pages are served. | A Mapbox GL map fitted to the world's lon/lat box, the same markers placed by the fit, translucent zone circles, and a popup per marker with the same chips and links. Falls back to the SVG the moment the library or its tiles cannot load. |
| **Bay World's ground** | The procedural grass. | One satellite image of the world's lon/lat box (the Static Images API), applied to the ground slab with the uv transform that lines it up with the fit. If the image never arrives, the grass stays. |
| **Network** | None to any Mapbox host. The atlas reads `auth-config.json` beside itself (same origin, the same file the sign-in dialog reads) and nothing else. | Mapbox GL JS from cdnjs (one `<script>`, inserted at runtime, never vendored) and the requests that library and the Static Images call make to `api.mapbox.com`, each carrying the token. |

The badge over the map says which mode is showing; the status line under it says why.

## How the two worlds line up

Bay World is a stylised 2400 m × 1600 m field, not a survey. `bay-geo.js` holds eleven anchors that pair a Bay World position with the approximate longitude and latitude of the *kind* of public place that part of the world is inspired by — a lakeside promenade, a downtown centre, an uptown strip, a container port, a stadium district, a market district, a hills lookout, a bridge approach, and at the field's edges an island harbour, a north shoreline and an upper ridge. Each is rounded to three decimals, marked `approximate: true`, and asserts nothing else. `bayToGeo()`/`geoToBay()` are one least-squares affine fit over those anchors and its exact inverse; `bayGeoBounds()` is the lon/lat box the whole field maps into. The anchors themselves land a hundred-odd Bay metres from their own coordinates once pushed back through the fit (`bayGeoResidual()`), which is the fit doing its job on a world that is not to scale. It is good enough for a map, and it is only ever presented as that.

## Getting a token

1. Create a Mapbox account and open **Access tokens** in your account page.
2. Create a **public** token — it begins with `pk.` — and give it only the scopes a browser map needs: `styles:read`, `styles:tiles`, `fonts:read` and, for the ground image, the static images scope. Do not use a secret (`sk.`) token anywhere near a browser; `mapbox.js` refuses any value that is not shaped like a public token.
3. Restrict the token to the URLs you serve these pages from. A public token is visible to anyone who opens the page, so the URL restriction is what keeps it yours.

Mapbox meters map loads and static images against the token, on its own free tier and pricing; check both before pointing a class at it.

## Where to put it

`mapbox.js`'s `mapboxToken()` looks in three places, in this order, and the first public-shaped value wins:

| Where | Scope | How |
|---|---|---|
| `?mapbox=…` on the launch URL | This tab (kept in `sessionStorage`) | Open `atlas.html?mapbox=<token>` or `bayworld.html?mapbox=<token>`. Handy for a demo or an LMS launch link. |
| This browser | This browser (`localStorage["smartciti.mapboxToken"]`) | Paste it into the atlas's **Paste a Mapbox public token** field and press **Use this token**. **Forget it** removes it. |
| The deployment | Every viewer of that copy | Set `"mapboxToken"` in `WebXR/auth-config.json` (`null` out of the box — see [sign-in.md](sign-in.md) for the rest of that file). The bundler copies the file beside each bundle that reads it. |

Nothing here is ever written back to the repository, and `tools/check_mapbox.mjs` fails the build if any string shaped like a Mapbox token appears anywhere in it.

## Where it works, and where it does not

- **A self-hosted copy or GitHub Pages**: both modes. Serve over HTTPS, put the token in one of the three places above, and restrict the token to that origin.
- **The claude.ai artifact viewer** (the page published from this repository): the viewer's content policy allows scripts only from a short list of CDNs and blocks Mapbox's own hosts, so the library may load but its style, tiles and static images cannot. The atlas detects the failure and shows the SVG map; Bay World keeps its grass. Everything else on the page — the list, the chips, the deep links — works exactly the same.
- **Offline, or `file://`**: the SVG map. The library is never bundled, so there is nothing to load.

## What is proved

`tools/check_mapbox.mjs`, run by `node tools/check_all.mjs`:

- the eleven anchors are approximate, three-decimal, inside the field, and round-trip through `bayToGeo`/`geoToBay` within a millimetre; every site and landmark projects inside `bayGeoBounds()`;
- no string shaped like a Mapbox token (`pk.` or `sk.` followed by a base64url run) appears anywhere in the repository;
- with `fetch` and the script insertion stubbed and no token, `mapboxToken()` is null and `loadMapboxGl()`, `createBayMap()` and `bayGroundTexture()` all return null without a single request or insertion; with a fake token and a stub library, the loader inserts exactly the pinned cdnjs URL once, the map gets one marker per site and landmark and one polygon per zone, and the ground request goes to the Static Images endpoint alone;
- the atlas page renders headlessly in fallback mode with one marker per site and per landmark, every deep link, and every programme chip;
- `WebXR/auth-config.json` carries `mapboxToken: null`, the bundler lists the modules, the dist files exist and load no external asset, and the home page, the Bay World map screen and this index all link the atlas.
