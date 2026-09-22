# Vendored modules

`three/examples/jsm/loaders/GLTFLoader.js` and its one dependency
`utils/BufferGeometryUtils.js`, copied unchanged from three.js r160 (MIT —
see `three/LICENSE`). They import the bare specifier `three`, which each
app's page maps to the same CDN module the app itself loads, so the loader
shares the app's three instance. Vendored rather than fetched from a CDN so
a hall's kiosk works with only the one CDN fetch it already makes, and so
the environment loader can be exercised offline.
