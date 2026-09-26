# Shared texture library

`WebXR/shared/textures.js` is the platform's procedural, tileable canvas texture
kit: sixteen face painters, a trade `palette()` helper, and a `facePaint()`
cache so the same painted canvas is never built twice. It sits alongside
`shared/kit.js` and `shared/fleet.js` as a fourth shared kit, and
`smartcity/js/citykit.js` re-exports everything in it (`export * from
"../../shared/textures.js"`) so any existing `import { X } from
"./citykit.js"` in a SmartCiti.X module keeps working unchanged. Shared
modules that cannot import a smartcity-specific file — `shared/props.js`,
`shared/fleet.js` — import straight from `shared/textures.js` instead.

Nothing here is fetched from a host: every pixel comes from canvas gradients,
fills and `Math.random()`, exactly like the district-specific painters
already in `citykit.js` (`pavingFace`, `waterFace`, `deckPlateFace`, …) that
this library is the general-purpose companion to — those stay where they
are; this file is for the surfaces every station's platform shares.

![Contact sheet of all sixteen face painters and nine trade palettes](screenshots/textures/contact-sheet.png)

## The painters

Each painter is `(g, w, h, o) => void`: a 2D context, the canvas size in
pixels, and options. Every one is designed to tile — its pattern's pitch
(brick courses, plank width, stripe count, grid cell) divides the canvas an
integer number of times, so repeating the texture across a mesh never shows
a doubled or missing unit at the seam.

| Painter | What it draws | Notable options |
|---|---|---|
| `brickFace` | Running-bond brick, staggered courses, mortar joints, per-brick tone jitter | `rows`, `cols`, `brick` (tone array), `mortar`/`mortar2` |
| `blockFace` | Concrete-masonry block coursing — bigger units than brick, tooled joints | `rows`, `cols`, `block`, `joint`/`joint2` |
| `concreteFace` | Cast concrete, `finish: "broom"` (directional striations) or `"smooth"` (fine grain only) | `finish`, `tone`/`tone2` |
| `asphaltFace` | Dark asphalt aggregate; `lanes` paints dashed white lane lines | `lanes`, `base`/`base2` |
| `corrugatedFace` | Vertical corrugated-metal siding, ridge/valley shading, painted colour | `colour`, `ribs` |
| `gratingFace` | Steel bar grating / diamond-plate deck, a diamond lattice over dark steel | `cell`, `base`/`base2` |
| `woodGrainFace` | Painted plank boards, alternating tone strips, grain streaks | `planks`, `tones` |
| `tileFace` | Ceramic/quarry tile grid, grout lines, per-tile jitter | `tiles`, `tile`, `grout`/`grout2` |
| `safetyStripeFace` | Diagonal hazard stripes, yellow/black by default | `a`, `b`, `stripes` |
| `rustFace` | Oxidised steel, mottled rust patches over a dark metal base | `base`/`base2`, `patches` |
| `gravelFace` | Loose gravel / crushed aggregate, scattered multi-tone stone specks | `stones`, `base`/`base2` |
| `grassFace` | Mowed turf, green mottle with a mow-stripe alternation | `stripes`, `a`, `b` |
| `sandFace` | Fine sand with low wind ripples | `step`, `base`/`base2` |
| `hardwoodCourtFace` | Gym-floor maple strips along the run; `line` paints a court line across the boards | `planks`, `line`, `lineAt` |
| `plasterFace` | Painted plaster/stucco, trowelled low-frequency mottle | `base`/`base2` |
| `stainlessFace` | Brushed stainless, directional brush streaks, a soft sheen band | `base`/`base2` |

## `facePaint()` — the cache

```js
import { facePaint, brickFace } from "../../shared/textures.js";

const tex = facePaint("my-wall|0x7a4a3a", (g, w, h) => brickFace(g, w, h, { brick: [0x7a4a3a] }), { px: 256, repeat: 8 });
```

`facePaint(key, draw, o)` builds a `THREE.CanvasTexture` once per distinct
`(key, px, repeat)` and hands back the **same texture instance** on every
later call — a station that paints six identical container walls, or a
district that stands a dozen bollards, costs one canvas draw, not six.
Clone the result (`tex.clone()`) before touching `.offset`/`.repeat` if the
same painted canvas is needed a second time at a different tiling — the
pattern `districts.js` already uses for its own caustic and water maps.
`facePaintCacheSize()` reports how many distinct canvases are live;
`clearFacePaintCache()` empties it (a test harness's tool, not something
runtime code calls).

`paintedMat(tex, o)` wraps a texture in a tuned `MeshStandardMaterial` —
the same contract as `citykit.js`'s own `texturedMat()`, duplicated here so
`props.js`/`fleet.js` never have to reach into a smartcity-specific file.

## `palette(name)` — trade colour sets

```js
import { palette } from "../../shared/textures.js";
const p = palette("construction"); // { accent: 0xf2c14b, ground: 0x4a3f3a, structure: 0xd24a1c, trim: 0x2b2f33 }
```

Nine named trade palettes — `construction`, `marine`, `clinical`, `kitchen`,
`utility`, `transit`, `rail`, `aviation`, `gym` — each exactly
`{ accent, ground, structure, trim }`. An unknown name falls back to
`construction` rather than throwing, and every call returns a fresh object,
so a caller's edit never leaks into the shared table. `PALETTE_NAMES` lists
the nine.

## Where it is applied

Textures cost no meshes — every application below swaps a material on a
mesh that already existed, so `tools/check_budget.mjs`'s per-station and
per-district mesh counts are unchanged:

- **The plaza ground** (`smartcity/js/stage.js`) — the inner paving disc now
  draws with `concreteFace({ finish: "broom" })` in place of a duplicate
  `pavingFace` call, giving the slab visible directional striation under
  raking light.
- **District facades and grounds** (`smartcity/js/districts.js`) —
  `restaurantRow` and `garmentLoft`'s main building boxes are `brickFace`,
  `clinicBlock`'s is `blockFace`; the gym-court's side/end walls swap their
  old ad hoc block painter for the shared `blockFace`; the coating store's
  ground pad is `asphaltFace`; the tower crane's boom/mast colour is pulled
  from `palette("construction").accent` instead of a bare hex literal.
- **The props kit's big surfaces** (`shared/props.js`) — `jerseyBarrier`'s
  panel is cast concrete via `concreteFace` under its reflective tape;
  `shippingContainer`'s corrugated skin and `siteOffice`'s wall panel both
  draw with `corrugatedFace`.
- **The fleet's hull and trailer sides** (`shared/fleet.js`) — the spud
  barge's hull-side panel is `rustFace` under its tinted paint wash and
  stencilled name/draft marks; the flatbed trailer's deck planking is
  `woodGrainFace`.

Three districts before/after this change, screenshotted headless at the
same spawn view (`?district=<name>&time=day`):

| District | Before | After |
|---|---|---|
| Culinary & Hospitality | ![before](screenshots/textures/hospitality-before.png) | ![after](screenshots/textures/hospitality-after.png) |
| Dental & Oral Health | ![before](screenshots/textures/dental-before.png) | ![after](screenshots/textures/dental-after.png) |
| Sewing & Garment Trades | ![before](screenshots/textures/garment-before.png) | ![after](screenshots/textures/garment-after.png) |

## Checked by `tools/check_textures.mjs`

Part of `check_all.mjs`. It holds the library to:

- every painter draws against the same stubbed 2D context the other content
  checkers use, at 128/256/512px and with its documented option variants,
  without throwing;
- every painter **tiles**: rendered on a small software raster context (no
  native canvas package here — the checker implements just enough of
  `fillRect`/gradients/`fillStyle` to get real pixels), its left edge's
  average colour is close to its right edge's, and top close to bottom,
  within a generous tolerance (60/255 per channel) that accounts for the
  random grain and grime every painter also layers on;
- `facePaint()`'s cache actually dedupes — the same `(key, px, repeat)`
  never redraws its canvas, a different key or a different repeat does, and
  `clearFacePaintCache()` empties it;
- `palette()` returns exactly the four keys for all nine documented trades,
  falls back to `construction` for an unknown name, and hands back a fresh
  object each call.

## Adding a painter

1. Write `export function myFace(g, w, h, o = {}) { … }` in
   `shared/textures.js`, using `gradientFill`/`noiseTexture`/`grimeOverlay`
   from `kit.js` where they fit. Keep any pattern's pitch a divisor of the
   canvas size so it tiles.
2. Call it through `facePaint()` (or `surfaceTexture()`/`texturedMat()` from
   `citykit.js` for SmartCiti.X-only code) rather than building a
   `CanvasTexture` by hand.
3. Run `node tools/check_textures.mjs` — it exercises the new painter
   automatically (every export in the harness list needs adding there too).
4. If the painter's module is now pulled into a browser bundle that did not
   carry `shared/textures.js` before, add it to that app's `"modules"` list
   in `tools/bundle_webxr.py` (right after `kit.js`, before `fleet.js`) and
   to any headless checker's own module list that builds the file calling
   it — `tools/check_imports.mjs` and a bundler run
   (`python3 tools/bundle_webxr.py`) both catch a miss.
