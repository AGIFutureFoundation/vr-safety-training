# Console ROBOTS-HD

- Console: ROBOTS-HD (loop 10, round 6, prefix `rhd`, port 9144)
- Brief: `$SP/loop10/brief-r6.md` (section ROBOTS-HD), under the Rules of `$SP/loop10/brief.md` (lines 11–28)
- Base: 230105b7 (fast-forward), branch `worktree-agent-ac54278335ff01c76`

## What is here
- **`WebXR/shared/rhd-robots-hd.js`** — the four simulated rig kinds ROBOTICS draws (`rb-world.js` `RB_RIG_TYPES`) at full
  detail, on the **desktop high tier only** (`rhdAllowed`: not balanced, not the phone tier, not a Quest or PICO browser).
  Procedural and generic by kind: geometry from code, one 128 px canvas for the guard mesh, no words drawn, no logo, no maker
  or product likeness.
  - **Cobot arm**: a pedestal with a base housing, a turret, upper arm, forearm and wrist as separate links, each joint with a
    housing and accent rings, cable runs with clamps down the links and the pedestal, a tool flange with a bolt circle, a
    gripper body and two fingers with pads.
  - **AMR carrier** (forward is +z, the way the site's loop drives it): chassis, top deck, rubber bumpers with yellow strips
    front and back, side skirts, a lidar puck with a dark window band, a low safety-scanner window, four casters (swivel
    plate, fork, wheel) and the two drive wheels on one axle as their own link.
  - **Gantry**: rails on the ground (static, on the site group, so they do not travel with the bridge), legs on bogies with
    wheels, cross braces and a cable run down each leg, a box-girder bridge with stiffeners and carriage rails, a cable chain
    lying in a tray, a carriage with wheels, a hoist drum, ropes and a spreader.
  - **The fenced cell's guarding** round a heavier industrial arm: yellow posts on base plates, top and bottom rails, mesh
    infill panels (canvas grid with alpha, UVs in metres), and an **interlocked door** on the front: a framed leaf, two hinges,
    a handle and a red interlock switch with its tongue. The arm stands on a bolted plinth with a floor connector box and a
    status beacon on a post above the fence line.
  - Each robot is **merged per moving link** (one mesh a link, vertex colours, one shared material) plus one status-light
    mesh and, outdoors, one floor-zone mesh (two discs). `RHD_BUDGET` states each robot's triangle and draw-call budget.
- **Safety state you can see.** `rhdLightState(src)` shows a state the page already has and never one of its own: an
  rb-world site state (`estopped` or `locked` → **e-stop red**, `mode: "stop"` → **protective stop amber**, `"full"` /
  `"reduced"` → **running green**) or a VBRIDGE governor monitor decision (`"estop"` → red, `"protective-stop"` → amber,
  `"continue"` / `"slow"` → green). Anything else → `null`, and the light is dark. The **speed-and-separation zone** (an amber
  warning annulus, a red stop disc) shows on the floor exactly when `rbSsmMode` (the rule the site and the governor share)
  says a person is inside the warning distance; the band the person is in is the brighter one.
- **Motion that reads.** The arm's three pitch joints move between four key poses with a smootherstep blend (zero joint
  speed and acceleration at each key), on the site's own phase (which advances only at the speed the SSM rule allows, so a
  protective stop or an e-stop holds the pose). The turret keeps ROBOTICS' sweep. The gantry's carriage eases along the bridge.
  The AMR's drive wheels turn by the distance the rig moves along its heading (`roll`, wheel radius 0.09 m), and hold still
  when it stops.
- **The mount** (`rhdMountRobots`, in `WebXR/parishes/js/app.js` after `rbMountRobotics`): on the high tier each site's rig
  meshes (and the cell's see-through box fence) are hidden — not removed — and the HD robot goes into the rig group, so a
  teleop pose source that drives the rig group (`rt-teleop.js rtFollowRig`) still drives the HD robot. `tick(dt, x, z)` runs
  right after `rbWorld.animate` with the same learner position. `window.__parishTest.robotsHd` = `{ on, robots, tick,
  light(id), measure() }`.
- **The robot rooms** (`rhdDressRoom`, an INTERIORS dresser registered after ROBO-INTERIORS' and before ENV-HD-4's): on the
  high tier the cell hall's robot, the cobot lab's two bench arms, the warehouse's two AMRs and the maintenance bay's arm (on
  its stand) and AMR (on the lift) are HD robots; the blocky ixr parts they replace are compacted out of their instanced meshes
  (the second cobot cell's bench is kept). The port control room has no robot body and the drilling deck's robot is not one
  of the four kinds: both keep today's parts. Each frame the app passes the room's site state to `rhdRoomLights`; a room whose
  site is on another map is dark, and the maintenance bay's locked-out robots stay dark (de-energised).
- **Checker** `tools/check_robots_hd.mjs` (in `tools/check_all.mjs`, an estimated row in `docs/perf/checkers-baseline.json`
  labelled as an estimate to re-measure quiet). **Drive** `tools/drive_robots_hd.mjs` (not in the gate).

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| cobot, high: draw calls / triangles (budget) | 3 / 100 (today's rig) | **8 / 1,336** (6 links and light + 2 zone discs; ≤ 8 / 2,000) | `node tools/check_robots_hd.mjs` §1 |
| AMR, high | 3 / 72 | **5 / 1,132** (≤ 5 / 1,600) | `check_robots_hd` §1 |
| gantry, high | 4 / 48 | **6 / 1,392** (rails included; ≤ 6 / 3,000) | `check_robots_hd` §1 |
| fenced cell, high (arm + guarding) | 4 / 48 (arm, tool, base, box fence) | **10 / 1,948** (≤ 10 / 3,600) | `check_robots_hd` §1 |
| maintenance-bay arm (room only, no zone) | — | 6 / 1,140 (≤ 6 / 2,400) | `check_robots_hd` §1 |
| balanced, phone, headset browser | today's rigs | **identical**: 15 of 15 mounts on 5 maps build nothing and hide nothing; rooms 18 of 18 identical | `check_robots_hd` §2, §5 |
| robot rooms inside IX_BUDGET with the HD robots | — | **6 of 6** headless (4 carry HD robots; worst: warehouse 29 meshes / 4,668 tris ≤ 120 / 6,000); with Ultra **6 of 6** ≤ 120 / 8,500 (worst 6,612) | `check_robots_hd` §5 table |
| status-light states shown | 0 of 3 (no light) | **3 of 3** | `check_robots_hd` §3 |
| light matches the site's state | — | **360 of 360** seeded steps on 6 sites; the governor's decisions **6 of 6**; no state → dark **7 of 7** | `check_robots_hd` §3 |
| floor zone when a person is near | always-on rings only | **360 of 360** shown exactly inside the warning distance | `check_robots_hd` §3 |
| motion | rigid sweep, AMR sliding | arm eased 4 of 4 keys (0 joint speed), worst 0.003 rad / 60 Hz frame; AMR wheels: 1.23 m travelled → 1.21 m rolled (13.45 rad) | `check_robots_hd` §4 |
| page errors | — | see the drive table below | `node tools/drive_robots_hd.mjs 9144 <dir>` |

Measured in the built page (`node tools/drive_robots_hd.mjs 9144 $SP/loop10/rhd/shots`, rebuilt bundle, 1920 × 1080, load
8.8–12 on the shared machine; `$SP/loop10/rhd/drive2.txt`): 34 of 35 lines ok. The one fail was the page's import-map
three.js URL on cdnjs, which the drive now exempts the way `drive_exteriors_page.mjs` does (the still-only rerun reports
off-host requests 0).

| measured in the page (high) | before → after | source |
|---|---|---|
| cell on its own view: draw calls / triangles drawn | 151 / 158,196 → **156 / 159,992** | drive2 (rig shown vs HD shown, in one task) |
| gantry | 154 / 69,758 → **154 / 70,966** (4 meshes either way) | drive2 |
| AMR | 161 / 183,878 → **161 / 184,802** (3 meshes either way) | drive2 |
| cobot | 156 / 154,928 → **159 / 156,028** | drive2 |
| status light on the real sites | — | running, protective stop (learner 2.2 m from the centre, zone shown), e-stop (act), restart → running: **4 of 4 sites, every state matching the site's state by the rule** | drive2 |
| AMR wheels while it drives | — | 0.059 → 2.949 rad over 20 frames | drive2 |
| robot rooms with the HD robots **and the Omega Hive's agents** (signed in, hive mounted) | — | **6 of 6 inside IX_BUDGET**: cell hall 36 meshes / 37 calls / 4,992 tris drawn (2 agents); cobot lab 38 / 38 / 4,400 (1); warehouse 32 / 28 / 4,484 (1); port control 27 / 27 / 2,236 (1); drilling deck 26 / 26 / 2,764 (1); maintenance bay 34 / 30 / 3,856 (1); ≤ 120 / 6,000 | drive2 |
| balanced | — | HD off, 0 HD meshes, today's rig meshes drawn (7) | drive2 |
| page errors | — | **0** (drive2 and the still-only rerun) | drive2, drive3 |

## Cycles (reason → act → observe)
1. Reason: the rigs live in `rb-world.js`'s `rbDrawRig`, and the rooms draw their own blocky robots; a separate module that
   hides the rig meshes and adds a merged HD robot into the rig group keeps balanced and phone byte-for-byte and keeps the
   teleop seam. Act: `rhd-robots-hd.js` (a merge kit, four kinds, light, zone, pose, roll), a headless measure. Observe:
   cobot 1,200 / AMR 996 / gantry 1,256 / cell 1,728 triangles, all far inside the budgets I had pencilled (2,000 / 1,600 /
   3,000 / 3,600). Check: the measure script's table.
2. Reason: the light must show the page's state, not a state of its own. Act: `rhdLightState` over both shapes that exist
   (the site's `rbSiteEvent` state and the governor's monitor decision), `null` for anything else; the zone from
   `rbSsmMode`. Observe: in `check_robots_hd` 360 of 360 seeded steps match, the governor 6 of 6, no state → dark 7 of 7.
3. Reason: the stated draw-call budgets must count what draws. Act: counted the zone's two discs in each robot. Observe:
   two fails — cobot 8 > 7 and cell 10 > 9 calls: my pencilled call budgets had left the zone out. Stated them at 8 and 10
   before committing (they are new budgets, not a loosened checker); the AMR's wheel check also failed because it compared
   a wrapped angle with the unwrapped travel, so the robot now reports `rolled` metres and the check compares those
   (1.23 m travelled → 1.21 m rolled along the heading). Check: `check_robots_hd` 42 passed, 0 failed.
4. Reason: measure in the built page, with HIVE's agents in the rooms. Act: rebuilt the bundles, `drive_robots_hd.mjs` on
   port 9144 (signed in, so the hive is mounted and its agents stand in their rooms). Observe: all three lights and the zone
   on the real sites, six rooms inside IX_BUDGET with HD robots and agents (cell hall 4,908 triangles drawn with 2 agents),
   page errors 0 — and five fails: the gantry and the AMR draw the same number of calls as today's rigs on their view (true:
   4 → 4 and 3 → 3, the check wanted "more"), my camera put the learner 6.2 m and 5.7 m from the centre for the "near" step
   (it added the robot's offset), and 6 off-host requests.
5. Reason: fix the drive, not the rule. Act: the learner now stands at a distance from the site centre (the SSM distance),
   the cost check asks for ≥ calls and more triangles, off-host URLs printed. Looking at the stills: the cell's beacon on
   the plinth corner was hidden by the fence and too small, so it now stands on a post above the top rail; the status-light
   meshes take vertex colours so the post stays dark. Observe: drive2 34 of 35 ok (the cdnjs import-map URL the only fail),
   the rooms 6 of 6 inside IX_BUDGET with the hive's agents standing in them, page errors 0.
6. Reason: the beacon still sat behind the arm from the usual approach. Act: moved it to the plinth's front corner, rebuilt,
   reshot the cell (`RHD_ONLY=still`). Observe: the amber beacon reads above the fence in `cell-protective-stop.png`
   (protective stop and e-stop ok, off-host 0, page errors 0). The "running" frame failed because of the drive's own nested
   wrapper (described under Stills) and was deleted.

## Stills (1920 × 1080, `$SP/loop10/rhd/shots/`, each looked at)
- `cobot-running.png`, `amr-running.png`, `gantry-running.png`: green light, no zone (learner outside 6 m).
- `cell-protective-stop.png`: **the protective stop** — the learner stands 2.2 m from the cell (held for the site while the
  camera backs out to 6.8 m); the amber beacon on its post above the fence, the red stop disc and the amber warning band on
  the floor. Also `cell-protective-stop-inside.png` (from the learner's own place) and `*-protective-stop-close.png` for
  each kind (amber, zone shown).
- `cobot-estop.png`, `amr-estop.png`, `gantry-estop.png`, `cell-estop.png`: red after the site's own e-stop.
- `room-ixr-*.png`: the six robot rooms on the high tier with the HD robots and the hive's agents (lights dark: the rooms
  open from sf-downtown, so the other sites' rooms have no state here, and the cell hall's robot shows its site's state).
- No green still of the cell: the still-only rerun's "running" frame stayed amber (a drive bug: its second wrapper called
  the first, which still held the learner inside the stop distance; the light was right to stay amber). That frame was
  deleted, not shipped. drive2's lines prove the cell's running green in the page.

## Seams
- `rhdLightState(src)` takes any object with `action` (a governor monitor decision) or `mode` / `estopped` / `locked` (a site
  state). A future pose source (rt-teleop, a VBRIDGE run) can light a robot with `robot.setLight(rhdLightState(decision))`.
- `rhdBuildRobot(THREE, kind, { zone, ground, scale, pedestal })` builds any kind anywhere (a reel, a station).
- `RHD_ROOM_ROBOTS[style]` says which ixr parts each room's HD robots replace and where they stand.

## Left
- The drilling deck's robot (a tracked base with a mast) and the port room have no HD robot.
- The room robots do not move (ROBO-INTERIORS' rule: nothing in a room moves); their floor zone is not drawn indoors.
- The light could also follow a live VBRIDGE run on its site (the governor's `monitor` per step); today the site's own state
  drives it outdoors.
