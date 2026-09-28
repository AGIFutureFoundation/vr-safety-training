# Soak

Measured 2026-09-28T08:49:18.420Z at commit 688afae. Each world runs the loop — walk ten seconds with a turn, open and close the map, open and close the help overlay, leave for the station runner and come back — for 1 minute(s) in headless Chromium under SwiftShader; the JS heap and the renderer's geometry and texture counts are sampled every 20 s after one settling loop. **Threshold:** the median of the last three heap samples may not exceed the first by more than 25%; any page error fails. Tool: `node tools/soak.mjs` (`SOAK_MINUTES`, `SOAK_ONLY`).

| World | minutes | samples | first heap MB | settled heap MB | growth | verdict |
|---|---:|---:|---:|---:|---:|---|
| Bay World | 1.6 | 2 | 68.7 | 83.3 | 21.3% | pass |
| Redwood Reach | 1.6 | 2 | 19.4 | 19.4 | 0% | pass |

## Samples

### Bay World

| t (s) | heap MB | DOM nodes | listeners | geometries | textures | meshes | load |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 51 | 68.7 | 1604 | 105 | 537 | 135 | 1345 | 15.36 |
| 98 | 83.3 | 3697 | 109 | undefined | undefined | undefined | 19.52 |

### Redwood Reach

| t (s) | heap MB | DOM nodes | listeners | geometries | textures | meshes | load |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 56 | 19.4 | 1312 | 104 | 67 | 2 | 303 | 23.31 |
| 98 | 19 | 1312 | 104 | undefined | undefined | undefined | 23.13 |
