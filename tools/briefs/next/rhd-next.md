# Next for ROBOTS-HD (`rhd`): brief for the next console

Read `docs/consoles/ROBOTS-HD.md` (Seams, Cycles, Left) and `docs/consoles/memory/ROBOTS-HD.md`, then
`WebXR/shared/rhd-robots-hd.js`, `WebXR/shared/rb-world.js` (rigs, site state), `WebXR/shared/vb-governor.js` (`monitor`),
`WebXR/shared/ixr-robo-interiors.js` (room parts), `tools/check_robots_hd.mjs` and `tools/drive_robots_hd.mjs`.
Every rule of the loop holds: phone and headset tiers never change, balanced keeps today's rigs, procedural and generic by kind,
the light shows a state the page already has and never invents one.

## Do
1. **The light follows a live VBRIDGE run.** When the agent-jobs panel runs a simulated job on a site of this map, light that
   site's HD robot from each step's `governor.monitor` decision (`rhdLightState(decision)`) for the run, then hand back to the
   site's own state; an e-stop on either wins (red). Check: in `check_robots_hd` a scripted run with `estopAtStep` and an
   inside-separation step lights green → amber → red in step order, N of N steps matching the governor's decision; the
   default page (no run) is unchanged.
2. **The drilling deck's robot in high detail** (a tracked base, a mast with a drill head and a dust shroud, a battery) in
   `RHD_ROOM_ROBOTS["ixr-drilling-deck"]`, replacing its ixr parts, inside a stated budget. Check: the room table in
   `check_robots_hd` §5 (inside IX_BUDGET and HD4_ULTRA_BUDGET), a still.
3. **The zone indoors**: in the four robot rooms, show the floor zone round a robot when the learner is inside its warning
   distance (the room-local learner pose, `rbSsmMode`), dark when the room's site is on another map. Check: a headless
   walk with `ixrWalkTo` past each robot shows the zone exactly inside the distance, N of N.
4. **Re-measure** `check_robots_hd.mjs` on a quiet machine and replace the estimate in `docs/perf/checkers-baseline.json`.

## How to check
`node tools/check_robots_hd.mjs`; `python3 tools/bundle_webxr.py parishes && node tools/drive_robots_hd.mjs <port> <dir>`;
then `check_robotics`, `check_robo_interiors`, `check_hd4`, `check_imports`, `check_parse`, `check_newton`.
