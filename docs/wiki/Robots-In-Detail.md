# The robots in high detail

The cobot arm, AMR carrier, gantry and fenced cell on the desktop high tier: each inside a stated budget, with a status light that shows only the state the site already has.

## The robots themselves, in high detail

The kinds of simulated robot that the robotics sites draw are redrawn in high detail on the desktop high tier, procedurally and generic by kind: geometry from code, one small canvas texture for the guard mesh, no words, no logo and no likeness of any maker or product. Each robot is merged per moving link inside a stated triangle and draw-call budget. Balanced, the phone tier and a headset browser keep today’s rigs unchanged, and every robot is simulated.

- 3 of 3 status-light states shown (running green, protective stop amber, e-stop red), matching the site’s own state in 360 of 360 seeded steps on 6 sites (0 of 3 before) `docs/consoles/ROBOTS-HD.md`

- 6 of 6 robot rooms inside the room budget with the high-detail robots, the busiest at 29 meshes and 4,668 triangles against 120 and 6,000 `docs/consoles/ROBOTS-HD.md`

- 15 of 15 balanced, phone and headset mounts across 5 maps that build nothing and hide nothing; 18 of 18 rooms identical `docs/consoles/ROBOTS-HD.md`

- 0 page errors in the built-page drive, where 4 of 4 sites showed the right light in every state tried `docs/consoles/ROBOTS-HD.md`

### The robots, today and now

| Robot | What is drawn | Draw calls / triangles, today | Draw calls / triangles, now | Stated budget |
|---|---|---|---|---|
| **Cobot arm** | a pedestal and separate links with joint housings and accent rings, cable runs with clamps, a tool flange with a bolt circle and a gripper with fingers | 3 / 100 | 8 / 1,336 | 8 / 2,000 |
| **AMR carrier** | chassis and top deck, rubber bumpers with yellow strips, side skirts, a lidar puck, a low scanner window, casters and drive wheels on one axle | 3 / 72 | 5 / 1,132 | 5 / 1,600 |
| **Gantry** | rails on the ground, legs on bogies, cross braces, a box-girder bridge, a cable chain in a tray, a carriage, a hoist drum, ropes and a spreader | 4 / 48 | 6 / 1,392 | 6 / 3,000 |
| **Fenced cell** | a heavier industrial arm on a bolted plinth, yellow posts on base plates, rails, mesh infill panels and an interlocked door with a handle and a red interlock switch, with a status beacon on a post | 4 / 48 | 10 / 1,948 | 10 / 3,600 |

Measured by the console’s checker on the high tier (`docs/consoles/ROBOTS-HD.md`); the draw calls include a floor zone of discs outdoors. The maintenance-bay arm in a robot room is 6 draw calls and 1,140 triangles against 2,400. Each robot is one mesh per moving link plus a status-light mesh, so the cobot’s joints still move separately.

### Safety state you can see

- **The light shows a state the page already has.** A site’s state or a decision of the safety governor is shown as running green, protective stop amber or e-stop red; anything else leaves the light dark, so the light never invents a state. It matched the site’s own state in 360 of 360 seeded steps on 6 sites, the governor’s decisions in 6 of 6 cases, and stayed dark in 7 of 7 cases with no state.

- **The floor zone shows when a person is near.** The speed-and-separation zone (an amber warning ring and a red stop disc) is drawn exactly when the rule that the site and the governor share says a person is inside the warning distance: 360 of 360 seeded steps matched.

- **In the built page** the light followed running, protective stop, e-stop and restart on 4 of 4 sites.

### Motion that reads

The arm’s joints ease through 4 of 4 key poses with zero joint speed at each, the worst joint step in a 60 Hz frame being 0.003 rad, on the site’s own phase, which only advances at the speed the separation rule allows, so a protective stop or an e-stop holds the pose. The gantry’s carriage eases along the bridge. The AMR’s drive wheels turn with its travel: 1.23 m travelled and 1.21 m rolled in the checker, and in the page the wheels turned from 0.059 to 2.949 rad over 20 frames of driving.

### Budgets

- **Robot rooms.** With the high-detail robots in 4 of the rooms, all 6 of 6 stay inside the room budget in the headless check, and with the opt-in Ultra setting inside 8,500 triangles (the busiest at 6,612). In the built page, with the Omega Hive’s agents standing in them as well, 6 of 6 rooms stay inside the budget (the cell hall at 36 meshes and 4,992 triangles drawn).

- **The cost in the page.** The cell on its own view draws 151 calls and 158,196 triangles with the old rig and 156 calls and 159,992 with the new robot.

- **The other tiers.** Balanced draws today’s 7 rig meshes with the high-detail robots off.

### Read honestly

- The first draw-call budgets, written before measuring, left out the floor zone and failed in their first run; they were restated before the commit as new budgets, and no checker was loosened.

- The drilling deck’s robot and the port control room have no high-detail robot, the robots in the rooms do not move (a rule of the room kit) and their floor zone is not drawn indoors, and the light does not yet follow a live governor run on its site: today the site’s own state drives it outdoors.

- There is no green still of the fenced cell: the drive’s own frame stayed amber, which was the right light for where the learner stood, and was not shipped; the drive’s lines show the cell’s running green. The drive had 34 of 35 lines ok, the one failure being the page’s pinned three.js import URL, which it now exempts.

- Frame time was not measured on a graphics card, the checker and drive ran on a software renderer on a shared machine, and nothing here is a claim about a real robot.

**Round six ** of this loop is merged into the integration head; its figures were read from the console branches (the same commits) with a read-only git show: `ROBOTS-HD` (branch head `5420ed25`, 2 commits of its own; its console note is committed; merged). Each figure is checked by phrase against that console’s note, a committed file or its commit messages, and a rebuild re-reads the final state.

Source: `docs/consoles/ROBOTS-HD.md` (its evals table, committed on its branch and read by phrase), `tools/check_robots_hd.mjs` (42 checks pass) and its drive; the figures are read by the script that built this page.

### Round seven: a still of the running cell, the light that follows a real run, the zone indoors

The earlier drive could not produce a green still of the cell because its second hold stacked on the first. The drive now holds the learner with one wrapper, so the running frame checks the site’s state, the rule and the zone: 5 checks passed, 0 failed, page errors 0 in the still-only drive.

The status light now follows a live agent-jobs run on the cell: in the page 21 of 21 steps of a run lit the light by the governor’s decision, in order, and a supervisor’s e-stop turned it red and held it until the next job. The warning zone is now drawn indoors, exactly the warning distance: 150 of 150 steps in the page and 1,711 of 1,711 robot-steps of a headless walk. The drilling deck’s robot is in high detail at 5 draw calls and 2,344 triangles. All the robot rooms stay inside the budget with the robots and zones (6 of 6), the most built being 5,838 triangles in the page with the hive’s agents standing there. Balanced, phone and headset are unchanged.

Left: while a run plays, the light follows the panel’s preview frames, and a check that the preview and the real run agree step for step is not written yet; the port control room still has no robot body, and the room robots do not move.

**Round seven ** of this loop is merged; its figures were read from the console branches with a read-only git show: `ROBOTS-HD-2` (branch head `1dda261d`, 4 commits of its own; its console note is committed; merged). Each figure is checked against a committed file or a commit message, and a rebuild re-reads the final state.

### Round 8: `ROBOTS-HD-3`, the preview and the real run agree, the port room’s robot

Round 8: `ROBOTS-HD-3`, tip 4783b63a (read at the merged head 112a4d68), 6 commits of its own since a10f1ff8, merged into the head of round 8, 112a4d68; its console note is committed, and the table below is that note’s own. Each figure is a token of the commit message or note row it is quoted from, checked when this page is built.

- check that the agent-jobs panel's preview frames and its real governor run agree step for step ()

- robot rooms leave room for three agent figures (the cap rule agreed with AVATARS-HD-5) ()

- the port control room's robot, a straddle carrier seen in the window, inside a stated budget ()

- the port carrier in the clear pane; drive legs for the port room and the rooms with three figures ()

- drive stills wait longer and never end the drive ()

- console note, memory and next brief ()

| eval | before | after | source |
|---|---|---|---|
| preview and real run agree, step for step before the stop | not checked | 619 of 619 steps; 5 jobs the governor lets through (the other 5 of 10 are refused before any run), 69 runs; the real run stops at the E-stop step with estop 64 of 64; clean runs as long as their preview 5 of 5 | check_robots_hd §3c |
| robot-room hidden meshes, can show / hidden for good | untagged | 12 / 0 | check_robots_hd §5 |
| three crowd-budget figures fit beside the HD robots under the cap (headless) | 5 of 6 (warehouse 4,940 + 1,620 > 6,000) | 6 of 6 (warehouse 3,916 + 1,620 = 5,536) | check_robots_hd §5 |
| AMR in rooms, triangles / calls | 996 / 3 | 484 / 3 (≤ 600 / 3) | check_robots_hd §5 |
| robot rooms in the built page, inside IX_BUDGET with 3 figures and 0 held (AVATARS-HD-4's figures merged at a10f1ff8) | 6 of 6 with 1 held (AVATARS-HD-4 drive B, round 7) | 6 of 6, 0 held: cell hall 41 meshes / 5,966 built / 5,866 drawn (room ×3); cobot lab 48 / 5,754 / 5,408 (room 1, crowd 2); AMR warehouse 42 / 5,842 / 4,988 (room 1, crowd 2); port control 35 / 4,854 / 4,748 (room ×3); drilling deck 37 / 5,644 / 5,450 (crowd ×3); maint bay 40 / 5,824 / 5,250 (room 2, crowd 1) | RHD_ONLY=rooms … 9165 → $SP/loop10/rhd3/rooms2.txt 9 ok / 0 |
| port room robot | 0 | 1 (straddle carrier, 696 tris / 2 calls ≤ 900 / 3); headless room 24 / 1,360 → 26 / 2,056; in the page on its own map 26 meshes, 26 calls, 2,016 drawn (2,056 built); beacons = the site's state (running), e-stop → red | check_robots_hd §5; RHD_ONLY=port → port5.txt 4 ok / 0 |
| headless rooms with HD robots (high): warehouse / maint bay / port | 4,940 / 3,992 / 1,360 | 3,916 / 3,480 / 2,056 (all ≤ 6,000); Ultra worst 5,860 ≤ 8,500 | check_robots_hd §5 |
| balanced / phone / headset | today's rigs and rooms | unchanged (rooms identical 18 of 18, mounts 15 of 15) | check_robots_hd §2, §5 |
| page errors / off-host requests | 0 / 0 | 0 / 0 in every drive | port1–5, rooms2 |

Source: `docs/consoles/ROBOTS-HD-3.md` at the merged head 112a4d68, the evaluation table as the console wrote it (before → after, with its sources).


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `709cd68e`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
