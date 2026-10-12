# HIVE-IN-WORLD (`hw`, port 9101): the Omega Hive's agents in person

Loop 10, round 2. Base f4884d71 (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. This console joins round 1's
pieces: OMEGA-HIVE's hive, AGENT-AVATARS' figures, ROBO-INTERIORS' rooms and ROBO-EXTERIORS' buildings. It also fixes the
seams that only showed once the pieces met.

Agents are software and say so: every figure keeps AGENT-AVATARS' "software agent · <role>" label, hologram tint and visor
instead of a face. Nothing here calls a model or the network, nothing listens, and voice stays on-device and off by default.
Robots are simulated, and the governor's rules stand: the e-stop comes first and the physical path stays disabled.

## What is here

| File | What |
|---|---|
| `WebXR/shared/hw-hive-world.js` (new) | Four pieces. **Agents in the rooms:** `hwRoomAgents`, `hwMountRoomAgents`, `hwSyncRoom`, `hwFigureYaw`. **One door:** `hwFxDoorAt`. **The return into a room:** `hwReturnHash`, `hwRoomFromHash`. **Walks round buildings:** `hwRouter`, `hwBoxesIn`, `hwSegBox`. Every top-level name carries `hw`/`HW_`. No network, voice or microphone. |
| `WebXR/shared/aa-agent-avatars.js` | `aaMountAgentAvatars` gains four options. `spotFor` sets a fixed standing spot (a room's agent spot). `textureScale` sets the label and caption canvas scale. `blocked` skips standing slots inside buildings. `route` makes a walk follow waypoints. Labels now fit their canvas (`aaFitFont`, `AA_LABEL_TEXT`), and `state()` reports `yaw` and `routed`. |
| `WebXR/shared/aa-agent-portraits.js` | A portrait now draws the outfit its agent names. Before, the hive's safety steward and VBRIDGE's governor persona shared one portrait. |
| `WebXR/shared/ixr-robo-interiors.js` | `ixrAgentSpot` reads the hive agent's role key first: the hive's `role` field is a sentence, so every agent was falling to the first spot. `ixrMeasure` now counts sprite textures (a figure's label and caption canvases). |
| `WebXR/shared/links.js` | `lkStationLink(…, { returnHash })` adds `&key=value` after `#site=` on the return. A link without it is unchanged. |
| `WebXR/shared/oh-hive.js`, `oh-say.js`, `oh-panel.js` | "Supervise every job": `ohHive({ supervise })`, `setSupervise`, `supervising` and `metrics().dispatchedWithoutLearner`, with two new consent-keeper lines. The panel's cards show the 2× portraits (`aaPortraitImg`, with the badge SVG as the fallback) and have a toggle. |
| `WebXR/parishes/js/app.js` | The outdoor avatars attach the hive itself (`window.__parishTest.hive.hive`). The room door is the building door, and pads launched in a robotics room carry the room in the return link; arrival re-enters it. `hwSync` keeps the room's agents in step with the open room, the voice's talk light reaches them, and walks route round the page's own colliders. Inside a room, the HUD location chip names the room. Test handle: `window.__parishTest.hiveWorld`. |
| `WebXR/instructor/js/governance.js` | The Data governance tab shows refusals and successes on the tab itself, in `#ent3-notice`: in the registry panel for export and import, at the top for the rest. |
| `tools/check_hive_world.mjs` (new) | 35 checks and the EVAL lines below. Listed in `check_all.mjs`; `docs/perf/checkers-baseline.json` carries an **estimated** row. |
| `tools/check_agent_avatars.mjs` | Embodies the real hive (ohHive seed 1) instead of the three-agent fixture. Adds the label-fit check (2b). 70 checks. |
| `tools/drive_hive_world.mjs` (new) | The headless drive of the built pages (not in the gate). Sections A–D are listed under the evals. |
| `tools/bundle_webxr.py` | `hw-hive-world.js` goes after the avatars and the robotics rooms. The portraits module now comes before the hive panel. |

## Evals (before → after)

| Measure | Before (f4884d71) | After | Source |
|---|---|---|---|
| Real hive in the avatar checker: talk light exact for each speak event | 6 of 6, fixture hive of 3 agents | **350 of 350**, real hive (seed 1, 152 steps, 41,788 frames at 20 Hz) | `check_agent_avatars` (`$SP/loop10/hw/aa-check-before.txt` → `aa-check-after.txt`) |
| A caption per speak event | 6 of 6 (fixture) | **350 of 350**; each bubble is the hive's caption naming the agent as a software agent | same |
| Every move ends at its named site | 1 fixture move | **30 of 30**, none superseded. Refusals raise the stop gesture 22 of 22; completions nod 56 of 56. | same |
| Agent portraits distinct (7 hive + 4 personas) | 10 of 11: the steward and the governor persona matched | **11 of 11** | `check_agent_avatars` |
| Hive agents embodied outdoors in the page | 0 (found by reading the code, not by a drive: the mount read the panel's API, which has no `on()` and no `agents`) | **2 of 2** agents homed on sf-downtown | drive A |
| Agents standing at their room spots (rooms × agents) | 0 (the spots were floor rings only) | **7 of 7** on high and on balanced, facing the spot's yaw, in `room.group`. The phone tier stands them in the state machine with no figure, as AGENT-AVATARS' phone rule requires. In the page: 2 of 2 in the cell hall. | `check_hive_world`; drive A |
| The hive's captions over the room figures | 0 | **7 of 7** first lines (high and balanced). In the page, the steward's next line. | same |
| Rooms inside `IX_BUDGET` and `IXR_TEX_BUDGET` with the agents in | 18 of 18 room-tiers, no agents | **18 of 18** with agents and captions; worst room in the next table | `check_hive_world` |
| One door | 0 of 6 rooms opened at the building: the door was a pad-side spot 8.6 m south of the rig | **6 of 6** doors at the building door's outside spot (`fxDoorFor`), clear of every exterior collider. In the page: W from the pad along the approach, the prompt "E — go inside: Fabrication Robot Cell (procedural)", then E to enter. | `check_hive_world`; drive A |
| Return into the room | 0: a pad launched in a room returned outdoors to the anchor site | **6 of 6** links carry `#site=…&ixr=<style>`. In the page: launch a pad, follow the Back link, and land back in the cell hall with its agents. The room's job board: **4 of 4** station links return into the room. | `check_hive_world`; drive A |
| Dispatches without the learner's approval, "supervise every job" on (seeded 200-job day) | No setting: 150 of 155 dispatches ran under the standing approval | **0 of 116**; 116 of 116 dispatch lines follow an approve line for their job. In the page: 0 after 40 steps, with 8 jobs waiting. | `check_hive_world`; drive C |
| The refused-import message visible on the governance tab | Not visible: the text went only to `#sent`, which the drive found hidden while the tab is open | **Visible** in the registry panel: "Refused (bad-schema): not a registry export …" (role alert). A re-import shows "Nothing new: …" (status). | drive D; `check_console`, `check_enterprise3` |
| The reel's label bug: "software agent · <role>" fits its canvas | 0 of 11 by the same 0.62 em per character measure (17 px, 253–316 px on a 236 px line; four of them also cut at 30 characters) | **11 of 11**, smallest 10 px under that measure. The real font in the page: 14–17 px. | `check_agent_avatars` 2b; drive A |
| The reel's HUD bug: the location chip inside a room | Named the street (the reel's capture) | **"Robot cell hall · generic room · Fabrication Robot Cell (procedural)"**, restored on exit, signed out too | drive A, B |
| Walks round buildings (five robot-site maps, the page's colliders) | 1,082 of 11,000 walk points inside a collider box (11 of 50 walk-ins); 1 of 42 standing slots inside | **0 of 11,424** walk points (8 walks took a route round a building); **0 of 42** slots | `check_hive_world` |
| Roster portraits on the hive panel | 48 px badge SVGs | **96 px PNGs at 48 px** on a 2× screen, 7 of 7 cards, each with the "software agent" label | drive C |
| Page errors / off-host requests in the drives | — | **0 / 0** | drive (`$SP/loop10/hw/drive-out.txt`) |

**The worst room, measured** (`check_hive_world`; vendored three.js; shell signs counted):

| Cell hall (2 agents) | Meshes | Triangles | Textures |
|---|---|---|---|
| High | 20 → 38 (of 120) | 1,688 → 3,704 (of 6,000) | 22.67 → 23.50 MiB (of 24) |
| Balanced | 20 → 38 | 1,688 → 3,704 | 2.67 → 2.87 MiB (of 3). Without half-size canvases it would be 3.50 MiB (arithmetic, not measured). |
| Low | 20 → 20 (no figures) | 1,332 → 1,332 | unchanged |

Rooms with one agent add 9 meshes, about 1,000 triangles and 2 sprites. In the page, ixrMeasure counts every texture in the room, so the shell's real sign canvases are included: 38 meshes, 3,704 triangles and 16 draw calls; 22.83 MiB before a caption is drawn and 23.17 MiB with one.

**Read honestly.**
- The talk-light and caption checks are exact by construction: the light follows the line's clock window. The checks show the windows hold over a real hive's bursts and queues; they do not test a voice. The voice seam (`onTalk` → `talkStart`/`talkEnd`) also reaches the room figures but was not driven with a stubbed `speechSynthesis` here.
- "Supervise every job" changes who approves, not what is refused: refusals 31 and vetoes 9 are the same either way. The learner in the checker is a seeded stand-in that declines by the job id's last digit; it is not a person.
- The walk checks use synthetic walk-ins: a far site 200 m out in eight directions, plus each other site's direction. On four of the five maps the page itself rarely walks an agent, because moves from other maps jump. The two before figures for page facts (outdoor figures 0, the HUD chip) come from reading the code and from the reel's capture, not from a drive of the base build.

## Cycles (reason → act → observe)

1. **The real hive in the avatar checker.**
   - Reason: replace the fixture with a seeded hive. Check: talk, caption and move N of N with N ≥ 30.
   - Act: run ohHive seed 1 for at least 50 steps, until it has made 30 moves.
   - Observe: **failed**. Talk was 83 of 350: the frame at the event's own clock was sampled before the step (an artifact of the checker; the fixture loop had re-sampled). Portraits were 10 of 11: the steward and the governor persona drew one portrait because the outfit was ignored.
   - Fixed both: re-sample after each step; draw the outfit. Then 350/350, 350/350, 30/30, 11/11. Committed c64a6be5.
2. **Agents in the rooms.**
   - Reason: stand homed agents at their room spots inside the budgets. Check: `check_hive_world`.
   - Act: `hw-hive-world.js`, plus `spotFor` and `textureScale` on the avatar mount.
   - Observe: textures read 22.67 → 22.67 MiB with two figures in the room, because `ixrMeasure` skipped sprites. Counted, they read 23.50 MiB (high). On balanced, full-size canvases would have reached 3.50 MiB of 3 (arithmetic), so the canvases are drawn at half size there: 2.87 MiB.
   - Found by reading before the first run: `ixrAgentSpot` read the hive agent's sentence-long `role`, so every agent took spot 0. It now reads `key`, and a checker line proves it.
   - Found by reading the page: the avatars attached the panel's API, so no hive agent was embodied outdoors. Drive A now shows 2 of 2.
   - Then 7/7 and 18/18. Committed 7fcebcb6.
3. **One door.**
   - Reason: the room opens at the building's door. Check: drive A walks from the pad to the door and presses E.
   - Act: `doorAt` = `hwFxDoorAt(fxDoorFor(…))`.
   - Observe: **failed**. The walk timed out 14.7 m short: the headless page draws about four frames a second, and 30 s per leg was too short. With Shift held until 3 m out and 150 s per leg, it reached the door, the prompt offered the room, and E entered the cell hall.
4. **Return into the room.**
   - Reason: a pad launched in a robotics room returns into that room. Check: drive A and the six links.
   - Act: `returnHash` on `lkStationLink`; `onLaunch` passes the room; arrival re-enters it.
   - Observe: passed first time. Back inside the cell hall with both agents standing (in 7fcebcb6 and 2d2dd221).
   - Follow-up: the room's job board built its own links without the room. `npOpenBoard(site, returnHash)` now carries it,
     and drive A reads 4 of 4 board links returning into the room.
5. **The reel's two display bugs.**
   - Reason: "oftware agent · safety stewa", and the HUD chip naming the street inside a room. Checks: 11 of 11 labels fit; drive A, A5 and B for the chip.
   - Act: fit the font and pass `fillText`'s maxWidth; make `npHud` room-aware.
   - Observe: 11/11 (smallest 10 px under the wide measure; 14–17 px in the page). The chip reads "Robot cell hall · generic room · …" inside and the street after exit. Committed bc1eafc3 and 2d2dd221.
6. **Supervise every job.**
   - Reason: with the setting on, nothing dispatches without the learner. Check: 0 in a seeded day.
   - Act: `supervise` and `setSupervise` in the hive, plus a hold at dispatch for jobs approved earlier under the standing approval; the panel toggle; 2× portraits on the cards.
   - Observe: **failed twice in the checker, both checker errors.**
     - A physical-path approval re-creates the job under a new id, so its approve line names the first id.
     - My mid-run check read the dispatch set after the approved job had run.
   - Then 0 of 116 against 150 of 155, and drive C confirmed it. Committed 0ad43d5d.
7. **The governance tab's messages.**
   - Reason: a refused import must show on the tab. Check: drive D, `check_console`, `check_enterprise3`.
   - Act: an `#ent3-notice` status line in the panel where the action happened.
   - Observe: the refusal and the success are both visible on the tab; `#sent` held the same text but was not visible. Committed d83a07be.
8. **Walks round buildings.**
   - Reason: no walk point inside a collider box on the five maps. Check: `check_hive_world` before → after.
   - Act: `route` and `blocked` on the avatar mount; `hwRouter`.
   - Observe: **failed**. Walk-ins crossing a box went from 10 of 50 to 1 of 50, and the last one started inside a 45 m shed that `blocked()` called clear. The seam files a box under its centre's chunk, so a small query in the neighbouring chunk missed it. Reading the chunks within 64 m and keeping overlapping boxes gave 0 of 11,424 points and 0 of 42 slots. Committed 0947484d.

## Checkers (single runs)

- `node tools/check_hive_world.mjs`: all 35 checks pass.
- `node tools/check_agent_avatars.mjs`: all 70 agent-avatar checks pass.
- `node tools/check_omega_hive.mjs`: 15 passed, 0 failed.
- `node tools/check_avatars.mjs`: all avatar checks pass.
- `node tools/check_robo_interiors.mjs`: PASS, 302 passed, 0 failed.
- `node tools/check_imports.mjs`: all 1114 modules call only what they declare or import.
- `node tools/check_console.mjs`: all instructor-console checks pass.
- `node tools/check_enterprise3.mjs`: 16 passed, 0 failed.
- `node tools/check_robotics.mjs`: 19 passed, 0 failed.
- `python3 tools/bundle_webxr.py parishes instructor && node tools/drive_hive_world.mjs 9101`: all steps pass, page errors 0, off-host requests 0.
- Not run: `tools/check_all.mjs` (the coordinator gates), `eval_worlds` (no world subject changed), `eval_content` (no station added).

## Seams

- **Rooms:** `hwSyncRoom(current, { room, three, agents, source, tier, reducedMotion })` is called every frame and right after an enter. The mount is `{ room, siteId, placed, avatars, animate, counts, dispose }`. A figure stands at `(spot.x, 0, spot.z)` with `rotation.y = spot.yaw + π`: the crew figure faces +z, and the spot's yaw is the learner's. ROBO-INTERIORS' note "rotation.y = yaw" would make it face away. `HW_ROOM_TEXTURE_SCALE` is `{ high: 1, balanced: 0.5, low: 0 }`.
- **The avatar mount:** `aaMountAgentAvatars({ …, spotFor(agent, siteId), textureScale, blocked(x, z), route(from, to) })`. Each is optional, and without them behaviour is unchanged. Labels are fitted by `aaFitFont`, and the fit is recorded on `label.userData.fit`.
- **`ixrAgentSpot(room, agent)`** reads `agent.key` first. `ixrMeasure(room)` returns `sprites` and counts their textures.
- **Doors:** `hwFxDoorAt(fxDoorFor(parish, siteId))` gives `{ x, z, face }` at the door's outside spot. `globalThis.fxRobotDoorAt` stays as the fallback.
- **Return:** `lkStationLink(id, { …, returnHash: hwReturnHash(style) })`. The page reads `hwRoomFromHash(location.hash, location.search)`, so `?parish=sf-downtown&ixr=ixr-cell-hall` opens straight into the cell hall: a capture preset for the reel.
- **Hive:** `ohHive({ supervise })`, `.setSupervise(on)`, `.supervising()`, `metrics().supervise` and `.dispatchedWithoutLearner`. `pending()[i].reason` is `"supervise"` or `"physical-target"`. The audit actions are `oh-supervise`, plus `oh-approval-request` and `oh-approve` carrying the supervise wording. The panel API has `supervise(on)` and the state has `supervise`.
- **Governance:** `ent3Say(text, { kind: "ok" | "bad", where: "top" | "registry" })` renders `#ent3-notice` with `data-kind`, role alert or status.
- **Walks:** `hwRouter(boxesIn, { radius, margin, step, reach })` returns `{ route, blocked }`. `hwBoxesIn(colliders, parish, x0, z0, x1, z1, { cache, pad })` reads the page's `wkColliders`.
- **Test handle:** `window.__parishTest.hiveWorld = { sync, room(), doors, returned, returnStyle }`.

## Left

- Only agents **homed** at a site stand in its room. An agent the hive moves there for a job is not shown inside.
- Room agents appear only where the hive is mounted: signed in, adult, not K-12 and not the demo. Signed out, the room is empty of agents.
- The voice's talk light is wired to the room figures but was not driven with a stubbed `speechSynthesis`.
- "Supervise every job" is not remembered across reloads. A job held at dispatch keeps its standing-approval record in the VBRIDGE job; the hive's audit line records the learner's approval.
- The bundles were rebuilt for the drives and are not committed (the coordinator regenerates them).
- The `check_hive_world` row in `docs/perf/checkers-baseline.json` is an estimate; re-measure it on a quiet gate.
- `guide-kb.js` was not regenerated.
