# Attribution

Every `.glb` shipped in this repository is listed here, with the licence that
lets it ship. `tools/check_models.mjs` reads this table: a model under a
`models/` directory that is not on it, or whose licence is not one this product
can redistribute, fails the build.

| file | title | author | source | licence |
|---|---|---|---|---|
| sample-street.glb | Sample street (placeholder) | this repository | — | CC0 |
| guide-worker.glb | Construction worker in high visibility | restore50 | https://sketchfab.com/3d-models/construction-worker-in-high-visibility-5f04313c5a254cbf80c5002ee1ed06c7 | CC-BY-4.0 |

`guide-worker.glb` lives in `WebXR/smartcity/models/` and is the one scanned
figure in the product: the guide who stands by the campus totem in the hub. It
is a decimated copy of the original (about 3% of its triangles, one 1024px
base-colour map, no normal or roughness maps), and the credit line required by
CC-BY 4.0 is carried in the hub's intro panel as well as here.
