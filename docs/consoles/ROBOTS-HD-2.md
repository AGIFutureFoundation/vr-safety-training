# Console ROBOTS-HD-2

- Console: ROBOTS-HD-2 (loop 10, round 7, prefix `rhd2`, port 9156)
- Brief: `$SP/loop10/brief-r7.md` (section "HIVE-7, AVATARS-HD-4, ENV-HD-7, ROBOTS-HD-2" and its seams table), under the Rules
  of `$SP/loop10/brief.md` (lines 11–28) and `brief-r6.md`; the work list is `tools/briefs/next/rhd-next.md` (ROBOTS-HD's)
- Base: 40d97421 (fast-forward, confirmed), branch `worktree-agent-ac7592721205a912a`
- Owns `rhd-*.js` and `robot*.js`. One additive, read-only line outside them: `vb-panel.js` `state()` now also returns `run`
  (see Seams).

## What changed
1. **A green still of the cell.** Round 6's still-only rerun wrapped its own wrapper: the second hold called the first, which
   still passed the learner at 2.2 m, so the "running" frame stayed amber (the light was right). `drive_robots_hd.mjs` now has
   one `holdLearner(page, id, d)`: it keeps the page's `robotics.animate` and `robotsHd.tick` once (on first use) and every
   later call only moves the held point. The running frame checks the site's state, the rule and the zone, and that the page
   was wrapped once.
2. **The light follows a live agent-jobs run.** `rhdJobRun(vb)` reads the agent-jobs panel (`vb-panel.js vbMountDispatch`):
   while a job runs on the simulated robot it returns the job's site and the governor's monitor decision for the step the
   panel is on; once the run is over, a run the governor halted keeps its last decision (the real run's last step, the one in
   the audit chain) until the supervisor takes the next job, and a clean run hands back at once. `rhdMountRobots({ …, jobs })`
   lights that site's HD robot with **the more severe** of the site's own state and the step's decision (`rhdWorst`: e-stop >
   protective stop > running), so an e-stop on either side is red and a person inside the stop distance still shows amber
   while the run says continue. A robot whose light is not green holds its pose. A run on another map's site lights nothing
   here. The mount logs every (job, step) it showed (`robotsHd.runLog()`). The app hands it the panel lazily
   (`jobs: { state: () => window.__parishTest.vbridge?.state?.() }`, the panel mounts later).
3. **The drilling deck's robot in high detail** (`drill` kind, rooms only): rubber tracks with sprockets, idlers, road wheels
   and grouser pads; four outrigger jacks on pads (the set-up position); a yellow upper body on a slew ring with side vents
   and an e-stop; a square mast with feed rails, slots and a cable chain; a feed carriage, the drill head (motor housing,
   gearbox, chuck), the bit inside an open dust shroud with a brush lip at the soffit and its hose down the mast; a swappable
   battery pack with a handle, terminal caps and a charge strip; a control box; a status beacon on the body. Generic by kind,
   no words, no maker. Merged into three meshes (base, mast, light). It replaces ROBO-INTERIORS' "drilling robot" and "robot
   battery" parts (8 instances compacted out).
4. **The zone indoors.** Every room robot that shows its site's state now has the floor zone (warning annulus, stop disc)
   on the room floor under it (a bench lifts the robot, never the zone); `rhdRoomLights(room, siteState, pose)` shows it by
   `rbSsmMode` on the distance from the learner's room-local pose (`ixWorld.pose`), the same rule as outdoors, and keeps it
   dark when the room's site is on another map. The maintenance bay's locked-out robots (stand, lift) have none.

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| green still of the cell | 0 (frame deleted in round 6) | **1** (`cell-running.png`: green beacon above the fence, zone hidden, held learner 8.96 m, wrapped once) | `RHD_ONLY=still node tools/drive_robots_hd.mjs 9156 …` → `$SP/loop10/rhd2/still1.txt` 5 ok / 0 |
| light follows a live agent-jobs run, in the page | not wired | **21 of 21** steps of the cell's job matching the governor's decision, in order; clean run → handed back; the supervisor's E-stop at step 2 → **red**, held until the next job, audit chain intact; next job → handed back; run log 25 of 25 | `RHD_ONLY=jobs … 9156` → `jobs1.txt` 7 ok / 0 |
| light follows a run, headless | — | real `vbRun` with `estopAtStep: 4` **5 of 5**; scripted monitor run (continue, slow, inside-separation, e-stop) **green → amber → red 4 of 4**; the more severe wins 2 of 2; no run → lights, pose and zone identical **120 of 120** | `node tools/check_robots_hd.mjs` §3b |
| drilling robot, high: draw calls / triangles (budget) | 8 blocky parts in shared instanced meshes | **5 / 2,344** (3 meshes + 2 zone discs; ≤ 5 / 2,400) | `check_robots_hd` §1 |
| drilling deck room (high, lit) | 23 meshes / 1,904 tris | **28 / 4,108** (≤ 120 / 6,000); Ultra 30 / 5,488 (≤ HD4_ULTRA_BUDGET 8,500) | `check_robots_hd` §5 |
| zone indoors, headless walk | not drawn | **1,711 of 1,711** robot-steps exactly inside the warning distance on an `ixrWalkTo` walk from the door past 6 of 6 robots; dark with no site state **1,072 of 1,072** | `check_robots_hd` §5b |
| zone indoors, in the page | not drawn | **150 of 150** steps, 6 of 6 robots | `RHD_ONLY=zone … 9156` → `zone1.txt` |
| robot rooms inside IX_BUDGET with the HD robots and zones (headless) | 6 of 6 (round 6) | **6 of 6** (worst: warehouse 33 meshes / 4,940 tris); Ultra 6 of 6 (worst 6,884 ≤ 8,500) | `check_robots_hd` §5 |
| balanced / phone / headset | today's rigs and rooms | **unchanged**: 15 of 15 mounts, 18 of 18 rooms identical | `check_robots_hd` §2, §5 |

Measured in the built page (`python3 tools/bundle_webxr.py parishes`, then `RHD_ONLY=<part> node tools/drive_robots_hd.mjs 9156
$SP/loop10/rhd2/shots`, 1920 × 1080, load 15–35 on the shared machine; outputs `$SP/loop10/rhd2/{still1,jobs1,zone1,rooms1}.txt`):

| measured in the page (high) | before (round 6, drive2) → after | source |
|---|---|---|
| the cell's running still | none → **green, zone hidden** (5 ok / 0) | still1 |
| agent-jobs run on the cell (job 1, seed 101) | not wired → **21 of 21** steps lit by the governor's decision, in order; finished → handed back to the site (running) | jobs1 |
| the supervisor's E-stop mid-run (seed 107, step 2) | — → governor's last decision `estop` (REJECTED, audit 8 lines, chain intact), light **e-stop**, held; next job → handed back | jobs1 |
| the zone indoors, each room on its own site's map | not drawn → **150 of 150** steps exactly inside the warning distance, **6 of 6** robots shown (drilling deck 25/25, cell hall 25/25, cobot lab 50/50, warehouse 50/50) | zone1 |
| robot rooms with the HD robots, the zones **and the Omega Hive's agents** (signed in, hive mounted), meshes / calls / tris drawn | cell hall 36 / 37 / 4,992 → **38 / 37 / 4,992** (2 agents); cobot lab 38 / 38 / 4,400 → **42 / 38 / 4,400** (1); warehouse 32 / 28 / 4,484 → **36 / 28 / 4,484** (1); port control 27 / 27 / 2,236 → **27 / 27 / 2,236** (1); drilling deck 26 / 26 / 2,764 → **31 / 29 / 4,832** (1; the HD drill); maintenance bay 34 / 30 / 3,856 → **34 / 30 / 3,856** (1) — **6 of 6 inside IX_BUDGET** (≤ 120 / 6,000; worst built 5,838 in the warehouse) | rooms1 |
| page errors / off-host requests | 0 / 0 → **0 / 0** in every drive | all four |

The rooms open from sf-downtown in that table, so only the cell hall's robot has its site's state there, and its zone is
hidden at the camera preset (outside the warning distance); the other rooms' zones are built but dark (two meshes a robot, no
calls or triangles drawn). The zone drive opens each room on its own map.

## Cycles (reason → act → observe)
1. Reason: round 6's missing green still was the drive, not the page. Act: one `holdLearner` that keeps the page's functions
   once and moves a held point. Observe: `cell-running.png` green, zone hidden, 5 ok / 0, page errors 0. Check: the still-only
   drive. Committed ff2a4fea.
2. Reason: the panel steps its preview run inside a closure; nothing outside sees which step it shows. Act: one read-only field
   in `vb-panel.js state()` (`run: { step, of, action }`), `rhdJobRun` reading it, `rhdWorst` combining it with the site's
   state. Observe: §3b first run 47 / 2 — my hand-back test expected "running" right after the learner stepped out of the stop
   distance, but the site holds its stop until a "near" event outside the warning distance arrives. Fixed the test to step back
   out past the warning distance and compare with the site's own state by the rule (not a hard-coded colour). Check: 49 / 0.
3. Reason: measure the run in the built page, where the panel auto-advances every 350 ms — faster than a loaded SwiftShader
   frame. Act: the drive emulates reduced motion (the panel then waits for Step) and presses Step itself, two frames apart.
   Observe: 21 of 21 steps, E-stop red and held, hand-back, page errors 0.
4. Reason: the drilling robot at the detail I first drew was 2,844 triangles with its zone, over the 2,400 I had stated. Act:
   kept the budget and cut the geometry (grousers on the top run only, fewer chain links and slots, no fins, fewer segments on
   the track ends and road wheels). Observe: 2,344 ≤ 2,400. Check: §1.
5. Reason: the zone indoors must sit on the floor even under a bench arm, and go dark off-map. Act: the zone goes in a floor
   group at the robot's x, z on the room; `rhdRoomLights` takes the pose. Observe: 6 of 6 zones at floor height; the walk
   1,711 of 1,711; dark 1,072 of 1,072. Check: §5b. Committed 43bbc30c.
6. Reason: the seam with AVATARS-HD-4: measure the robot rooms with the agents in the built page. Act: `RHD_ONLY=rooms`
   (signed in, hive mounted). Observe: 6 of 6 inside IX_BUDGET with the HD robots, zones and agents (drilling deck 31 meshes / 4,832 tris drawn, the most it grew), page errors 0.

## Stills (1920 × 1080, `$SP/loop10/rhd2/shots/`, each looked at)
- `cell-running.png` — **the green still**: the cell's beacon green above the fence, no zone (the held learner 8.96 m out).
- `cell-protective-stop.png`, `cell-protective-stop-inside.png`, `cell-estop.png` — the same framing for amber and red.
- `cell-job-running.png`, `cell-job-estop.png` — the agent-jobs run on the cell; after the supervisor's E-stop the beacon is red.
- `room-drill.png` (the deck from its camera preset, the robot inside the barricade) and `room-drill-zone.png` (close, the
  learner 3 m away: green beacon, the zone on the deck floor, the mast, shroud and hose up to the soffit).
- `room-ixr-*.png` — the six rooms with the HD robots and the hive's agents (rooms drive).

## Seams
- `vb-panel.js state().run` = `{ step, of, action }` while a job is in TRANSACTION with preview frames, else null. Read-only;
  `check_vbridge` passes unchanged. `check_robots_hd` §6 guards both ends of the wire.
- `rhdJobRun(vb).read()` → `{ jobId, siteId, step, of, decision: { action }, live } | null`; `rhdWorst(a, b)`.
- `rhdRoomLights(room, siteState, pose)` — the third argument is new; without it the zones stay dark.
- `RHD_ROOM_ROBOTS["ixr-drilling-deck"]`, `RHD_BUDGET.drill`.
- The robot rooms with AVATARS-HD-4's figures: measured here with the base figures (40d97421); AVATARS-HD-4's figure changes
  land on their branch, so the combined room needs the coordinator's re-run of `RHD_ONLY=rooms` after both merge.

## Left
- Re-measure `check_robots_hd` on a quiet machine (rhd-next 4): the machine was at load 15–30 all round, so the baseline
  row stays an estimate (raised for §3b and §5b).
- The port control room still has no robot body (it watches the yard).
- Room robots still do not move (ROBO-INTERIORS' rule).
- While a run plays the light follows the panel's preview frames (a fresh governor, as the panel shows them); the panel's own
  governor runs the real run when it finishes, and the halted run's real last step is what holds afterwards. A check that the
  preview and the real run agree step for step is not written yet.
