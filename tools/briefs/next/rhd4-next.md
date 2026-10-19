# Next for ROBOTS-HD-4 (`rhd4`): brief for the next console

Read `docs/consoles/ROBOTS-HD-4.md` (Evals, Seams, Left) and `docs/consoles/memory/ROBOTS-HD-4.md`. Then read
`WebXR/shared/rhd-robots-hd.js` (`rhdLaneDrive`, `RHD_ROOM_ROBOTS["ixr-port-control"]`, `rhdRoomLights`'s dt and clock),
`WebXR/shared/vb-panel.js` (`pinProvider`, `approve()`, `finish`), `tools/check_robots_hd.mjs` §3c (the mid-run take) and §5a,
`tools/drive_robots_hd.mjs` (`RHD_ONLY=port`, the 40-frame travel sample), and ENV-HD-9's `tools/check_hd9.mjs` §3.

Every rule of the loop holds:
- phone and headset never change, and balanced keeps today's rigs;
- assets are procedural and generic by kind;
- the light shows a state the page already has, and a moving room robot moves only while its light is green;
- the robot-room cap rule (ROBOTS-HD-3 with AVATARS-HD-5) stands: count every mesh that can be drawn, tag hidden meshes a
  state can show with `userData.rhdCanShow`, remove meshes hidden for good.

## Do
1. **The carrier at full scale in the yard.** ENV-HD-9's opening is real (7d24e92f: north wall, x −6.5..6.5, y 1.0..3.0,
   through z −6.0..−6.3; `room.openings`). What stopped it this round: `check_hd9` §3 casts its "nothing void through the hole"
   rays from z −3 with `ray.far = 10` (they end at z −13), while the yard picture is to go 20–40 m out. Agree the ray reach with
   ENV-HD (far ≥ 45, posted 01:45) first. Then, in `rhdDressRoom` when `room.openings` reports the north hole: move ROBO-INTERIORS'
   `ixr-window-wall` picture to z ≈ −26 and scale it to cover the view cone from inside the room (about 34 × 5.4 m: factor
   (11.8 + 20) / 11.8 from the room's far side), lay a pavement plane from the wall's outer face to the picture, and stand the
   `straddle` at full size (no relief) at z ≈ −18, y 0, with `lane: { length: 20, speed: 1.5 }`. From the desk (eye y 1.6, z −4)
   the whole 16 m carrier is in the cone beyond 20 m; at 12 m only the wheels, legs and container show. Budget: the carrier is
   696 triangles / 2 calls (`RHD_BUDGET.straddle` 900 / 3) plus the pavement's 2; the room stayed 29 meshes / 2,092 triangles
   with the opening (check_hd9 §3, high).
   - Check: §5 port line (budget, room ≤ IX_BUDGET), `check_hd9` §3 still covered on every tier, a §5a walk at full scale, and
     a still from the preset and one from the window.
2. **A take arriving mid-run in the built page.** §3c proves the pin headless with a synthetic own-take. Drive it: start a
   colearn job (seeds 107 or 108), record a consented take through the real DX store (`dxCollecting()` on, adult, signed in),
   let `vbLocal.refresh()` run, finish the job, and compare `vbridge.state().job.deliverable.episode.steps` with the preview.
   - Check: a drive line, N of N steps; `check_dataworks` unchanged.
3. **Re-measure `check_robots_hd` on a quiet machine** (load under 2) and replace the estimate in
   `docs/perf/checkers-baseline.json` (never commit `checkers-last.json`). The load was 5–28 all this round.

## How to check
- Headless: `node tools/check_robots_hd.mjs` (67 lines), `node tools/check_hd9.mjs` (31), `node tools/check_vbridge.mjs` (18).
- Built page: `python3 tools/bundle_webxr.py parishes && RHD_ONLY=port node tools/drive_robots_hd.mjs <port> <dir>`.
- Then `check_robo_interiors`, `check_agent_avatars`, `check_imports`, `check_parse`, `check_newton`.
- Restore `WebXR/*/dist`, `WebXR/dist`, `docs/perf/phone-maps.json` and `docs/perf/reactor.json` after a drive.
