# Performance proofs

Console PROVING (`docs/consoles/PROVING.md`) measures what the platform claims — one build for phone, laptop and headset — and keeps the checkers fast. Everything in this folder is written by a tool and can be regenerated:

| File | Tool | What it holds |
|---|---|---|
| `frames.json`, the table below | `node tools/measure_frames.mjs` | frame time per world and station app on the low and high tiers over a 20-second scripted walk, with mesh, instance, triangle and draw-call counts |
| `phone.json`, `phone.md`, `../img/proving/` | `node tools/phone_pass.mjs` | every page at 360×640 and 390×844: overflow, tap targets, HUD text, first contentful paint, captures |
| `headset.json`, `headset.md` | `node tools/headset_pass.mjs` | what a headless box can prove about VR entry, and the manual checklist for a device |
| `soak.json`, `soak.md` | `node tools/soak.mjs` | a ten-minute soak of Bay World and Redwood Reach with the JS heap sampled every 30 s |
| `checkers-last.json`, `checkers-baseline.json` | `node tools/check_all.mjs`, `node tools/check_proving.mjs --rebaseline` | per-checker times of the last run and the recorded baseline |
| `baseline.json` | `node tools/check_proving.mjs --rebaseline` | the frame-time and tap-target baseline `check_proving` judges against |

`tools/check_proving.mjs` (in `check_all`) asserts the files exist and are fresh, every recorded budget holds, and no checker regressed by more than 20% against the baseline when the run was made at a load the machine could carry.

## SwiftShader numbers are relative

Every browser measurement here comes from headless Chromium on **SwiftShader, a software rasteriser, on a four-core machine shared by several consoles**. A frame that takes 90 ms here takes a few milliseconds on a laptop GPU and a different few on a headset. The numbers are for comparing **world against world, tier against tier, and run against run at a similar load average** — the load average is written beside every row for that reason. They are never device frame times; the device numbers come from the manual headset checklist (`headset.md`) and the perf HUD (`?perf=1`, `WebXR/shared/perf.js`) on real hardware.

## Frame times

<!-- frames:start -->
Measured 2026-09-28T08:34:12.790Z at commit 688afae, 20 s walk per row, 1280×720, SwiftShader (relative numbers, see the note above).

| Page | Tier | avg ms | p95 ms | worst ms | fps | meshes + instanced×(instances) | triangles | draw calls | conditions |
|---|---|---:|---:|---:|---:|---|---:|---:|---|
| Bay World | low | 623.71 | 983.4 | 1049.9 | 1.6 | 948 + 0×(0) | 253k | 342 | load 4.63→12.75 |
| Bay World | high | 912.08 | 1033.3 | 1149.9 | 1.1 | 1345 + 0×(0) | 253k | 515 | load 12.75→14.98 |
| Redwood Reach | low | 322.84 | 449.9 | 666.7 | 3.1 | 279 + 101×(8062) | 116k | 81 | load 14.98→15.3 |
| Redwood Reach | high | 1769.37 | 2016.5 | 2016.5 | 0.6 | 303 + 199×(38194) | 479k | 150 | load 15.3→16.73 |
| Sierra Summit | low | 169.32 | 266.6 | 350 | 5.9 | 130 + 14×(721) | 59k | 104 | load 16.73→18.12 |
| Sierra Summit | high | 417 | 500 | 566.7 | 2.4 | 141 + 30×(2971) | 111k | 121 | load 18.12→15.66 |
| The Deep | low | 247.93 | 316.7 | 366.7 | 4 | 241 + 0×(0) | 27k | 69 | load 15.66→13.96 |
| The Deep | high | 640.6 | 966.6 | 1000 | 1.6 | 241 + 0×(0) | 28k | 68 | load 13.96→13.66 |
| Bay Regatta | low | 761.7 | 1099.9 | 1316.6 | 1.3 | 980 + 0×(0) | 261k | 532 | load 13.66→15 |
| Bay Regatta | high | 1681.88 | 2266.6 | 2266.6 | 0.6 | 1078 + 0×(0) | 249k | 626 | load 15→14.05 |
| Fairway Park | low | 192.53 | 283.4 | 400 | 5.2 | 133 + 0×(0) | 15k | 70 | load 14.05→13.32 |
| Fairway Park | high | 1085.05 | 1366.6 | 1366.6 | 0.9 | 133 + 0×(0) | 15k | 70 | load 13.32→15.07 |
| Trade Skills (station runner, hub) | low | 1057.85 | 1399.9 | 1399.9 | 0.9 | 117 + 0×(0) | 4k | 84 | load 15.07→17.7 |
| Trade Skills (station runner, hub) | high | 705.72 | 1083.2 | 1433.3 | 1.4 | 117 + 0×(0) | 4k | 84 | load 17.24→14.08 |
| SmartCiti.X (station runner) | low | 44.82 | 66.7 | 133.3 | 22.3 | 23 + 2×(50) | 0k | 0 | load 14.08→11.72 |
| SmartCiti.X (station runner) | high | 43.89 | 66.7 | 100 | 22.8 | 23 + 2×(50) | 0k | 0 | load 11.72→10.11 |
<!-- frames:end -->

### Reading the table

- **Tier low** is `?tier=low&quality=low`: pixel scale 0.75, shadows off, fog ×1.6, wildlife ×0.4, traffic ×0.5, 512 px painted textures — what a phone gets on its own. **Tier high** is `?tier=high&quality=high`: pixel scale 1, shadows on, full agents, 1024 px textures.
- **meshes + instanced×(instances)** counts the live scene's `Mesh` objects, its `InstancedMesh` objects and the instances they carry. A world with many meshes and no instancing pays a draw call per mesh; the draw-call column shows it.
- **triangles** and **draw calls** are `renderer.info.render` after the walk, i.e. the last frame drawn.

## Checker speed

Before this console, `check_all` ran its checkers one after another; the wall time was the sum of their times (15–25 minutes on the shared machine). Now the two gatekeepers and the two tree-writing checkers run first and alone, and the rest run in a pool whose size follows the load average (`CHECK_JOBS` pins it; `CHECK_JOBS=1` is the old behaviour). Browser checkers weigh two slots so at most two headless Chromiums share the four cores. The before/after numbers for the run recorded in this session are in `docs/consoles/PROVING.md` and `checkers-baseline.json` (`sumMs` is what the one-at-a-time run would have taken; `wallMs` is what the pool took).
