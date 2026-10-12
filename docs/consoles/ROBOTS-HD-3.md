# Console ROBOTS-HD-3

- Console: ROBOTS-HD-3 (loop 10, round 8, prefix `rhd3`, port 9165)
- Brief: `$SP/loop10/brief-r8.md` (section "ROBOTS-HD-3"), under the Rules of `brief.md` (lines 11–28), `brief-r6.md` and
  `brief-r7.md`; the work list is `tools/briefs/next/rhd2-next.md` items 1–3
- Base: a10f1ff8 (fast-forward, confirmed), branch `worktree-agent-a2c59da11f968a95e`
- Owns `rhd-*.js` and `robot*.js`. Outside them: only `tools/check_robots_hd.mjs` and `tools/drive_robots_hd.mjs`.
- The usage limit stopped this console from about 20:36 to 21:20 UTC. Work resumed at 21:27 and the hand-back moved to 22:00.

## What changed
1. **The preview and the real run agree (check only).** While a job plays, the light follows the agent-jobs panel's
   preview frames: `vbRun` on a copy of the job, with a fresh governor. The panel's own governor runs the real run when the
   supervisor steps past the end or presses E-stop. `check_robots_hd` §3c drives the real `vb-panel.js` with a stand-in DOM
   and the page's `vb-colearn` provider hook. For every queued job, every earlier job is approved first and stepped to its
   end, so the panel's governor carries their chain. Then, for every E-stop step and for a clean run, it compares the
   preview's decision with the real run's at each step before the stop. The real run must stop at the E-stop step with
   `estop`, and a clean run must be as long as its preview. They agree everywhere, so the light keeps following the
   preview; no fallback to the real run was needed.
2. **Robot rooms with no held agent (agreed with AVATARS-HD-5 in the heartbeat, 20:20 / 20:22).**
   - **The rule.** The figure cap counts every mesh that can be drawn, as ixrMeasure counts: a visible mesh, or a hidden
     one that a state can show. A mesh hidden for good must leave the room's group.
   - **What is hidden today.** Headless at a10f1ff8, the only hidden meshes under the six rooms were the HD robots' floor
     zones (warehouse 272 triangles, cobot lab 272, cell hall 136, drilling deck 136). The zones show when a person is
     inside the warning distance, so they stay counted, and they are now tagged `userData.rhdCanShow = "ssm-zone"`.
   - **Why not count only what is drawn.** The 7,450 built / 6,324 drawn gap in round 7 came from frustum culling, not
     hidden meshes, so a drawn count would change with the view.
   - **The trim.** To give the held agent back, the AMR gets a room level (rooms never move their robots): casters as
     blocks, a two-ring lidar puck and coarser drive wheels. The silhouette, bumpers, skirts and light bar stay the same.
     It goes from 996 to 484 triangles in 3 calls (budget `amr-room` 600 / 3). Outdoor AMRs are unchanged.
3. **The port control room's robot.** The window is a picture plane on the shell's north wall (z −5.99), with the mullions
   0.12 m deep in front of it. A robot cannot stand behind it without cutting the shell, which is not mine. So a straddle
   carrier stands in the leftmost pane as a relief:
   - built at full size, in metres: eight wheels, sill beams, braced legs, top and cross beams, a cab, a machinery house,
     a spreader on four ropes with a container, two beacons and a light bar;
   - shown at 1:16, three-quarters on, flattened to 7 cm between the picture and the mullions, with its wheels on the
     yard's pavement band;
   - 696 triangles in 2 calls (budget `straddle` 900 / 3);
   - its beacons show the port site's state, and it has no floor zone (it stands in the yard, not on the room floor).

   The centre pane is behind the room's hanging name sign, and the next pane has an orange block of the window dressing
   over it, so the carrier moved twice. From the window it reads as flat at a steep angle, just as the yard picture does.

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| preview and real run agree, step for step before the stop | not checked | **619 of 619** steps; 5 jobs the governor lets through (the other 5 of 10 are refused before any run), 69 runs; the real run stops at the E-stop step with `estop` **64 of 64**; clean runs as long as their preview **5 of 5** | `check_robots_hd` §3c |
| robot-room hidden meshes, can show / hidden for good | untagged | **12 / 0** | `check_robots_hd` §5 |
| three crowd-budget figures fit beside the HD robots under the cap (headless) | 5 of 6 (warehouse 4,940 + 1,620 > 6,000) | **6 of 6** (warehouse 3,916 + 1,620 = 5,536) | `check_robots_hd` §5 |
| AMR in rooms, triangles / calls | 996 / 3 | **484 / 3** (≤ 600 / 3) | `check_robots_hd` §5 |
| robot rooms in the built page, inside IX_BUDGET with 3 figures and **0 held** (AVATARS-HD-4's figures merged at a10f1ff8) | 6 of 6 with **1 held** (AVATARS-HD-4 drive B, round 7) | **6 of 6, 0 held**: cell hall 41 meshes / 5,966 built / 5,866 drawn (room ×3); cobot lab 48 / 5,754 / 5,408 (room 1, crowd 2); **AMR warehouse 42 / 5,842 / 4,988 (room 1, crowd 2)**; port control 35 / 4,854 / 4,748 (room ×3); drilling deck 37 / 5,644 / 5,450 (crowd ×3); maint bay 40 / 5,824 / 5,250 (room 2, crowd 1) | `RHD_ONLY=rooms … 9165` → `$SP/loop10/rhd3/rooms2.txt` 9 ok / 0 |
| port room robot | 0 | **1** (straddle carrier, 696 tris / 2 calls ≤ 900 / 3); headless room 24 / 1,360 → 26 / 2,056; in the page on its own map 26 meshes, 26 calls, 2,016 drawn (2,056 built); beacons = the site's state (running), e-stop → red | `check_robots_hd` §5; `RHD_ONLY=port` → `port5.txt` 4 ok / 0 |
| headless rooms with HD robots (high): warehouse / maint bay / port | 4,940 / 3,992 / 1,360 | **3,916 / 3,480 / 2,056** (all ≤ 6,000); Ultra worst 5,860 ≤ 8,500 | `check_robots_hd` §5 |
| balanced / phone / headset | today's rigs and rooms | **unchanged** (rooms identical 18 of 18, mounts 15 of 15) | `check_robots_hd` §2, §5 |
| page errors / off-host requests | 0 / 0 | **0 / 0** in every drive | port1–5, rooms2 |

Drives ran on the built page (`python3 tools/bundle_webxr.py parishes`, 1920 × 1080) at load 8–47 on the shared machine.
After each drive the dist and `docs/perf/phone-maps.json` were restored.

## Cycles (reason → act → observe)
1. Reason: the light follows the preview, while the audit keeps the real run. Act: §3c drives the real panel headless
   (stand-in DOM) across every job and E-stop step. Observe: 619 / 619 agree; the first run failed only on my expected job
   count (5 of 10 queued jobs are refused before a run, so I had required too many). Check: §3c. Committed 6f9bc857.
2. Reason: AVATARS-HD-5 needs the warehouse at or below 4,380 triangles (6,000 − 3 × 540). Act: proposed the cap rule in
   the heartbeat (they agreed at 20:22), tagged the zones, and added the AMR room level. Observe: 4,940 → 3,916; 6 of 6
   rooms fit three crowd figures; check_agent_avatars 119 / 0 unchanged. Committed 2085508a.
3. Reason: the port room had no robot, and its window is an opaque picture. Act: a straddle carrier as a 7 cm relief in a
   pane. Observe: §5 numbers inside budget; in the first still the room's name sign hid it, in the second an orange block
   of the window dressing did; it now stands in the leftmost pane. Check: still looked at. Committed c1d96403, ed54ad3d.
4. Reason: measure the combined rooms in the page. Act: the rooms leg tops each room up to three agents (as AVATARS-HD-4's
   drive does) and counts held agents. Observe: at load 38 a 30 s screenshot timeout ended the drive after one room. Act:
   stills wait 120 s and a missed still is logged, not fatal. Observe: 6 of 6, 0 held. Committed b03f4517.

## Stills (1920 × 1080, `$SP/loop10/rhd3/shots/`, each looked at)
- `room-port-carrier.png`: the port room from its camera preset; the carrier in the leftmost pane, beacons green.
- `room-port-carrier-close.png`: close, after the port site's e-stop; beacons and light bar red, the container on the
  spreader. The yellow reads olive under the room's light.
- `room-ixr-*.png`: the six rooms with three agents each. In the warehouse the room-level AMR reads as before at room
  distance, and Orrin is labelled "software agent · dispatcher".

## Seams
- `rhdBuildRobot(THREE, kind, { …, detail })`: `detail: "room"` builds the AMR's room level (only the AMR has one).
  New kind `straddle` (rooms only; `RHD_KINDS` stays the four rig kinds).
- `RHD_BUDGET["amr-room"]` (600 / 3), `RHD_BUDGET.straddle` (900 / 3).
- `RHD_ROOM_ROBOTS` entries take `zone: false` and `relief: { scale, depth }`.
- Hidden meshes that a state can show carry `userData.rhdCanShow` (the zone group and both discs). AVATARS-HD-5 checks it
  on their side ("rhdCanShow or aa-talk").
- The drive has a new `RHD_ONLY=port` leg, and the rooms leg now requires three figures and 0 held.

## Left
- The carrier is a relief, not a robot behind real glass. A see-through window needs a hole in the shell's north wall
  (ix-interiors, not mine) and a yard beyond it.
- The quiet re-measure of `check_robots_hd` (rhd-next 4) is still open; the load was 8–47 all round. The baseline row
  stays an estimate.
- Room robots still do not move (ROBO-INTERIORS' rule), and the port carrier does not travel.
