# Texture assets

This directory ships two files: this note and `manifest.json`. It ships no
image — every surface in the platform is painted procedurally at runtime by
`WebXR/shared/textures.js`'s sixteen face painters (brick, concrete, asphalt,
turf, and so on; see `docs/textures.md`), from canvas fills, gradients and
`Math.random()`. Nothing is fetched from a host.

## Adding a generated tile later

If a real photographic or PBR tile is generated or licensed for one of the
sixteen painters (the account this repository was built under has none of
its image-generation credit left to make one now):

1. put the file here as `assets/textures/<id>.jpg` — the ids are the keys in
   `manifest.json` (`brick`, `block`, `concrete`, `asphalt`, `corrugated`,
   `grating`, `wood`, `tile`, `safety-stripe`, `rust`, `gravel`, `turf`,
   `sand`, `hardwood-court`, `plaster`, `stainless`);
2. set that id's `file` in `manifest.json` to the file name, and fill in
   `licence` and `provenance` with where the tile came from and under what
   terms — both are required together with a `file`, never left null;
3. serve `assets/` beside the app (the loader fetches
   `<WebXR root>/assets/textures/manifest.json` relative to the page, the
   same way `assets/brand/manifest.json` already does for union logos).

Once the manifest resolves, `facePaint()` loads that file with
`THREE.TextureLoader` instead of drawing the painter's canvas for that id —
the painter function itself, its cache key and every call site stay
unchanged; only where the pixels came from does.

Do not commit an image file here without a `licence` and `provenance` on its
entry: `tools/check_textures.mjs` fails the build on a `file` set without
both, on a shipped file with no manifest entry pointing to it, and on an
entry naming a file that is not actually present. Today every `file` is
`null` and every painter draws procedurally, exactly as before this seam
existed.
