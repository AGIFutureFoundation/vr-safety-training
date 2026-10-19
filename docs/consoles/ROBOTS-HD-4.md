# Console ROBOTS-HD-4

- Console: ROBOTS-HD-4 (loop 10, round 9, prefix `rhd4`, port 9174)
- Brief: `$SP/loop10/brief-r9.md` (section "ROBOTS-HD-4"), under the Rules of `brief.md` (lines 11–28), `brief-r6.md`,
  `brief-r7.md` and `brief-r8.md`; the work list is `tools/briefs/next/rhd3-next.md` items 2, 1 (once the window opened), 3, 4
- Base: 61d85871 (fast-forward, confirmed), branch `worktree-agent-a3e2b429027c88d66`
- Owns `rhd-*.js` and `robot*.js`. Outside them: `tools/check_robots_hd.mjs`, `tools/drive_robots_hd.mjs`, and one pin in
  `WebXR/shared/vb-panel.js` (item 3's fix lives there; nobody owned `vb-*` this round, said in the heartbeat at 01:38).
- Merged exactly one commit from another console: ENV-HD-9's 7d24e92f (the port room's window opening), at 149a33ca.

## What changed
1. **The carrier moves (rhd3-next 2).** A room robot may travel only while its light is green. `RHD_ROOM_ROBOTS` entries take
   `lane: { length, speed }` (yard metres along the room's x, back and forth at m/s); `rhdLaneDrive` moves the robot on a tick
   only when its light is `running`, and holds it on a protective stop, an e-stop, a lock-out or no state at all (the site on
   another map). `rhdRoomLights` gained `dt`: a check passes it, the page passes none, so the room keeps its own clock, capped
   at a tenth of a second so a pause never jumps the carrier; the viewer's reduced-motion preference holds it still. The relief
   shows the travel at 1/16: the carrier's relief is 0.80 m wide in a 1.545 m clear pane, so the lane is 11 m (5.5 m each way
   is 0.344 m in the pane, 19 mm short of each mullion; 5.81 m was measured to touch). `room.rhd.motion()` reads each lane
   robot's position, whether the last tick moved it and the room-x it is drawn at. Every other room's robots have no lane.
2. **The carrier at full scale in the yard (rhd3-next 1): not this round, with the reason.** ENV-HD-9 posted the opening at
   01:38 and committed it (7d24e92f), which I merged. Their `check_hd9` §3 ("nothing void through the hole") casts its rays
   from z −3 with `ray.far = 10`, so anything beyond z −13 is unseen by it, while the yard picture is to go 20–40 m out. With
   the picture moved, their checker fails on the high tier of the merged head; I may neither edit it nor merge a later commit
   of theirs this round. Posted the seam and the fix (far ≥ 45, the picture at z about −26, 34 × 5.4 m) at 01:45; the pane
   version stays, as the brief says, and `rhd4-next` item 1 carries the plan with the measured numbers.
3. **The one known divergence (rhd3-next 3): fixed at `approve()`.** `vbColearnModel`'s cache key carries the local source's
   own-takes tag (`own:N:ids`), and `vbLocal.refresh()` runs after a take and on the consent panel's change, so a consented
   take recorded between `approve()` and `finish` could hand the real run a model the preview never ran. The cache did not pin
   it. `vb-panel.js` now pins the provider's answer at `approve()`: the preview and the real run ask one memoising wrapper
   (`policyId | scenario | seed`), so the audited run is the policy the supervisor watched; `next()` asks the provider afresh.
   `check_robots_hd` §3c drives the real panel with a provider whose `demosFor` changes mid-run (a clean pass as the learner's
   own, under its own tag) for both colearn jobs the governor lets through (107, 108), at three E-stop steps and a clean run.
4. **Re-measure `check_robots_hd` at load under 2 (rhd3-next 4): not possible.** The load was 5–28 all round (ten consoles on
   four cores). The baseline row stays an estimate.

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| carrier motion follows the site state (headless walk, 30 Hz) | no motion | **900 of 900** steps: green 450 of 450 moved; amber, red or no state 450 of 450 held; e-stop or lock-out red 315 of 315 | `check_robots_hd` §5a |
| carrier in its pane, clear of the 9 mullions, inside its lane | static | **900 of 900** steps; turned back 2 times at 1.5 m/s; a zero step moves nothing | `check_robots_hd` §5a |
| own clock with no dt / reduced motion | — | a 5 s gap moves 0.150 m (= 0.1 s cap × 1.5 m/s); reduced motion 0 m after 1 s | `check_robots_hd` §5a |
| other rooms' robots move | 0 | **0** (8 of 8 in place after 60 running steps) | `check_robots_hd` §5a |
| preview = real with a take recorded mid-run | untested (rhd3's "one known divergence") | **75 of 75** steps, 8 runs of 2 colearn jobs; the take changed the provider's model 8 of 8 times; un-pinned, the real run's actions would have differed in **4 of 8** runs | `check_robots_hd` §3c |
| preview = real, no take (rhd3's line) | 619 of 619 | **619 of 619** (E-stop 64 of 64, clean 5 of 5) unchanged | `check_robots_hd` §3c |
| port room with the opening, high (combined ixr + rhd + hd4 + skins) | 26 meshes / 2,056 tris (no opening) | **29 meshes / 2,092 tris** ≤ 120 / 6,000; 85 of 85 rays through the hole covered on every tier | `check_hd9` §3 on 149a33ca |
| full-scale yard carrier | relief | **relief still** (reason in item 2) | — |
| built page, port room on oak-west-oakland: travel while running / hold after e-stop | static | DRIVE_ROW | `RHD_ONLY=port … 9174` → `$SP/loop10/rhd4/port1.txt` |
| page errors / off-host requests | 0 / 0 | DRIVE_ERR | `port1.txt` |
| balanced / phone / headset | today's rigs and rooms | **unchanged** (rooms identical 18 of 18, mounts 15 of 15) | `check_robots_hd` §2, §5 |
| checkers | — | `check_robots_hd` 67 / 0; `check_vbridge` 18 / 0; `check_hd9` 31 / 0; `check_robo_interiors` 302 / 0; `check_newton` 60 / 0; `check_imports` 1,148; `check_parse` PARSE_ROW | this round's runs |

## Cycles (reason → act → observe)
1. Reason: a room robot that travels must obey the light. Act: `rhdLaneDrive` ticks only on `running`; §5a walks 900 steps of a
   seeded state sequence. Observe: 900 of 900 followed the state, but the pane line read 848 of 900: at ±6 m the relief touched
   a mullion. Act: measured the relief (0.80 m in a 1.545 m clear pane → 5.81 m each way touches), set the lane to 11 m.
   Observe: 900 of 900. Check: §5a.
2. Reason: the page's per-frame call passes no dt. Act: the room keeps its own clock, capped at 0.1 s; reduced motion holds.
   Observe: a 5 s gap moves exactly 0.150 m; 0 m under reduced motion. Check: §5a.
3. Reason: does the cache already pin the provider mid-run? Act: read `vbColearnModel`'s key (`…|tag`) and the local source's tag
   (`own:N:ids`): a take changes the key. Act: §3c case with a provider whose `demosFor` changes after `approve()`. Observe:
   the un-pinned real run's actions differed in 4 of 8 runs — the divergence is real. Act: `pinProvider()` in `vb-panel.js`.
   Observe: 75 of 75; my first draft of the check compared the stop step itself (6 false mismatches: "estop" vs "continue" at
   k, by design) and now stops before it, as the original §3c does. Check: §3c, `check_vbridge` 18 / 0.
4. Reason: the window opening landed (7d24e92f). Act: merged only that commit; ran `check_hd9` on the combined tree. Observe:
   31 / 0, the room 29 / 2,092 with my carrier; but §3's `ray.far = 10` would fail with the picture 20–40 m out. Act: posted the
   seam to ENV-HD-9 (01:45), kept the pane version, wrote the plan with measured numbers into `rhd4-next`. Check: `check_hd9`.
5. Reason: measure the motion in the built page. Act: the drive's port leg samples 40 frames of `room.rhd.motion()` while the
   site runs, then after the e-stop. Observe: DRIVE_CYCLE. Check: drive line.

## Stills (1920 × 1080, `$SP/loop10/rhd4/shots/`)
- `room-port-carrier.png`: the port room from its camera preset, the window now a real opening with the picture and the
  mullions in front of it; the carrier in the leftmost pane, beacons green, moving along its lane.
- `room-port-carrier-close.png`: from the centre desk after the port site's e-stop; the carrier stopped 3.2 m right of its
  mark (0.2 m in the pane), clear of both mullions, beacons and light bar red, the container on the spreader.
Both looked at.

## Seams
- `RHD_ROOM_ROBOTS[*].robots[*].lane = { length, speed, start? }` (yard metres; the relief scales it). `room.rhd.motion()`.
- `rhdRoomLights(room, state, pose, dt)`: dt optional; `room.rhd.clock`, `room.rhd.reducedMotion`.
- `rhdDressRoom({ …, reducedMotion })` defaults to the viewer's `prefers-reduced-motion`.
- `vb-panel.js`: `pinProvider()` at `approve()`; `finish` runs `pinned ?? policyFor`; `next()` clears it.
- Drive: `RHD_ONLY=port` now has a travel line (40 frames moving, then held after the e-stop).

## Left
- The full-scale yard carrier (rhd4-next 1), once `check_hd9` §3's rays reach the yard.
- A mid-run take through the real DX store in the built page (rhd4-next 2).
- The quiet re-measure of `check_robots_hd` (rhd4-next 3); the load was 5–28.
