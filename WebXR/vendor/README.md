# Vendored modules

`three/examples/jsm/loaders/GLTFLoader.js` and its one dependency
`utils/BufferGeometryUtils.js`, copied unchanged from three.js r160 (MIT —
see `three/LICENSE`). They import the bare specifier `three`, which each
app's page maps to the same CDN module the app itself loads, so the loader
shares the app's three instance. Vendored rather than fetched from a CDN so
a hall's kiosk works with only the one CDN fetch it already makes, and so
the environment loader can be exercised offline.

`react/dist/react.production.min.js` and `react/dist/react-dom.production.min.js`
are the React 18.3.1 UMD builds (MIT — see `react/LICENSE`), byte for byte
what SmartCiti.X and the Holodeck load from cdnjs. The pages still load them
from the CDN; `tools/check_ui.mjs` answers those two URLs from here so the
2D shell can be exercised headless and offline.
