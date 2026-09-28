# REDWOOD-2 — console memory

Read `docs/consoles/memory/REDWOOD.md` first (conventions, prefixes, the river/pad rule); this file adds phase-two lessons.

## Conventions added
- **Site colliders** are recorded while a site is dressed: `box()`, `cyl()` and `tent()` in `rw-world.js` push a local-frame
  rectangle whenever a solid is taller than 1.5 m and stands below 1.6 m (flat pads, boardwalks, stakes and the overhead
  conveyor stay walkable). `world.blocked()` checks trunks first, then `blockedBySite()`. Arrivals (`rwArrival`, 0.75 × pad
  south), activity starts (0.3 × pad south) and the spot 3 m south of every job board must stay clear — the probe asserts it.
- **Understory** per chunk: fern clumps, sword ferns (five-frond geometry), fallen logs with a root plate, cut stumps, and light
  shafts (additive gradient planes, visible only in the `day` band — `setHour` toggles `shaftMeshes`). Stumps and logs do not
  collide. Density: `fstep` 9 on high, 12 on low; log cap 10/6, shaft cap 14/6 per chunk.
- Site labels shrink long names to fit the plate (`label()` measures the text) — "Fern Hollow Campground & Trailhead" clipped before.

## Measuring here
- No device on this machine. `$SP/holodeck/redwood-2/probe.mjs <cfg.json>` serves the worktree on 8991, asserts the colliders,
  holds W in the vehicle for 20 s and reports rAF deltas — SwiftShader numbers, relative only. A baseline page is the old
  bundle written from `git show <sha>:WebXR/redwood/dist/redwood.html` into `WebXR/redwood/dist/redwood-base.html` (untracked, delete after).
- The worktree sandbox refuses compound shell lines that mix `cat <<EOF` and variables; write configs with the editor.

## Numbers (headless SwiftShader, 20 s vehicle drive from the fire station)
- High, 1280×720: baseline 2197 ms/frame mean → 2346 ms with the thicker understory (+7%); 49 chunks, 8.3k trees, ~28k
  understory instances, ~690 shafts, 100k ground triangles, 98 site colliders.
- Low, 390×844: 163 ms/frame mean, p90 200 ms; 25 chunks, 1.75k trees, ~8.2k understory, 95 shafts, 12.8k ground triangles.
