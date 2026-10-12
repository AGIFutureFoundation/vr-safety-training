# AVATARS-HD-2 (`ah2`, port 9131): the bodies follow the voices

Loop 10, round 5. Base e252b25f (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. This console owned the voice → mouth seam
end to end this round: `oh-voice.js` (forwarding and `pending`), the one `voice.say` line in `oh-panel.js`, the `aa-*` files and the
page's wiring in `app.js`. HIVE-5 did not touch `oh-voice.js` or `aa-*.js`; this console did not touch `hw-hive-world.js` (the rooms'
figures come through `hwSyncRoom`'s `mount` seam).

The agents are software and look it: the "software agent · <role>" label, the cool porcelain shell, the role-coloured visor band,
halo and caps, no skin tone (§9c still holds the head and hands at least 0.15 RGB from crew.js's tones). Nothing in the `aa` modules
calls a network, speaks or listens. The voice stays on-device, off by default, and captions always show.

## What is here

| File | What |
|---|---|
| `WebXR/shared/oh-voice.js` | `u.onboundary` is forwarded to `say(…, { onboundary })` for the line being spoken only (a late event from a cancelled or ended line is dropped). `pending(agentId, text?)`: true while an on-device voice holds a line of that agent (queued, or being spoken). A line handed to the voice that has not started within `OH_START_WAIT_MS` (4 s, a stuck voice) makes it false for every line, so the figures fall back to their clock. `now()` option (ms). |
| `WebXR/shared/oh-panel.js` | One line: `onTalk(id, on, line)` carries the line (`{ text, jobId }`), and `onWord(id, charIndex, line)` hears each word boundary (sentence boundaries are not passed). |
| `WebXR/shared/aa-agent-avatars.js` | `voiced(agentId, text)` mount option. Such a line shows its caption when it starts and holds the light and mouth until `talkStart`; if the voice lets it go unstarted (turned off, page hidden, stuck, no local voice) the clock drives it from then. `talkStart/talkWord/talkEnd(id, …, text?)` act on the named line: a later queued line is brought forward, an unknown one is ignored, an unstarted one the voice ends runs on the clock. Boundary-driven words last as long as the voice's own pace says (`aaBoundaryWordSec`: interval = a + b × characters, least squares over the line's last eight intervals; before two boundaries a brisk prior), so the mouth closes between words. `hd: "room"` builds the room level. `aaRoomAvatarMount(extra)` is the mount for `hwSyncRoom`. `state()` adds `waiting`; `counts()` adds `hdLevel`. |
| `WebXR/shared/aa-agent-hd.js` | `AA_HD_LOD` (`full` unchanged; `room`: lighter trunk and limb profiles, fewer segments, no thumb), `AA_HD_ROOM_BUDGET` (1,000 triangles), `aaHdGeometry(spec, level)`, `aaHdBuild(three, agent, spec, { level })`. `AA_HD_STOP_POSE`: the stop hand in front of the chest. |
| `WebXR/parishes/js/app.js` | The panel's `onTalk`/`onWord` reach the outdoor and room figures with the line's text; `aaVoiced` (the panel's controller's `pending`) goes to the outdoor mount; `aaRoomMount = aaRoomAvatarMount({ voiced: aaVoiced })` is `hwSyncRoom`'s `mount`. |
| `tools/check_agent_avatars.mjs` | §9f: the controller test's stub is word-length based; per-word claim; a light-from-onstart run over the real hive. §9g: the stop line measures "in front of the chest". New: stop against raise from the front. New §9k: the six rooms on high with three room-level figures. 99 checks (92 before). |
| `tools/check_hive3.mjs`, `tools/check_hive_world.mjs` | Each grepped the seam's old call shape (`onTalk: (id, on) =>`, `talkStart(id)`); the same claims read the new shape. |
| `tools/drive_avatars_hd2.mjs` (new, not in the gate) | The built page: the voice (stubbed speechSynthesis, probed inside its own callbacks), the stop hand from the front, an agent speaking in the cell hall. |
| `docs/perf/checkers-baseline.json` | The `check_agent_avatars` row raised from 4 s to 7 s, still an estimate. |
| `docs/omega-hive.md` | Two sentences: the rooms' lighter level, and the light and mouth following the voice. |

## Evals (before → after)

| Measure | Before (e252b25f) | After | Source |
|---|---|---|---|
| Word boundaries forwarded by the real controller (oh-voice.js) | 0 | **20 of 20** words | `check_agent_avatars` §9f |
| Mouth opens per word, word-length stub, real controller (open within 25 ms of the boundary, shut before the next) | not measured: the stub fired a boundary every 0.2 s and the line counted opens (≥ 10) | **20 of 20**, worst 15.3 ms | §9f |
| The same over the real hive's lines (seed 1, 60 s, the panel's wiring) | — | **159 of 159** words in 11 lines | §9f |
| Talk light from onstart: off before it, on from onstart to onend, real hive through the controller | **0 of 11** (a mount without `voiced`: the light came on when the line arrived) | **11 of 11** | §9f |
| Captions with voice on (shown when the line starts) | every line | **11 of 11** | §9f |
| In the built page: light off just before onstart, on just after, off after onend | — | **3 of 3** lines, 3 of them waiting with the caption up | drive V |
| In the built page: word boundaries reaching the figures | 0 (none forwarded) | **48 of 48** | drive V |
| Network voice chosen (one local, one network voice) | 0 | **0** | drive V; §9f |
| Robotics rooms inside IX_BUDGET on high with three high-detail figures and captions | **0 of 6**: the rooms kept today's figure; the outdoor figure would put 6 of 6 over (9,438–10,858 triangles) | **6 of 6**; busiest AMR warehouse 5,562 of 6,000 (today's figure: 5,804) | §9k |
| Triangles per figure in a room (high) | today's figure 1,008 (mesh triangles) | room level **898–962** (≤ 1,000) | §9k; `aaHdGeometry(spec, "room")` |
| Meshes per room with three figures (high) | 49–51 | **31–33** (3 a figure against 9) | §9k |
| Cell hall in the page with its two figures | — | 30 meshes, 3,964 triangles built; 29 draw calls | drive R |
| Stop against raised hand from the front (logistics, mid-gesture) | hands **0.38** body heights apart; stop hand outside the shoulders (x −0.27 m) at 1.59 m | **0.68** apart; inside the shoulders (x −0.09 m) at 1.33 m; palm to the front 1.00; the raised hand still above the head (1.96 m) | §9g |
| Each gesture's pose on the bones mid-gesture | 5 of 5 (stop only "forward and up") | **5 of 5** (stop: in front of the chest, inside the shoulders, palm to the front, fingers up) | §9g |
| A refusal's stop hand held its full 1.8 s | 20 of 20 | **20 of 20** | §9g |
| §9f mouth timing (stubbed boundaries / caption timing) | 15.3 / 20.0 ms | **15.3 / 20.0 ms** (within 25 ms) | §9f |
| Balanced and the phone | today's figure / none | unchanged; in a room balanced is 4,712 triangles, 47 meshes, as without the level | §9b, §9k |
| Page errors / off-host requests | 0 / 0 | **0 / 0** | drive (port 9131) |

## Cycles (reason → act → observe)

1. **Boundaries to the mouth, and a mouth that closes between words.**
   - Reason: the coordinator's attempt failed because the controller test's stub fired a boundary every 0.2 s (about 300 words a
     minute) while each boundary-driven word lasted the caption's estimate (about 0.36 s), so the mouth never closed. Check: §9f per
     word, open within 25 ms and shut before the next boundary.
   - Act: forward `onboundary` (current line only); a word lasts what the voice's own pace predicts (`aaBoundaryWordSec`); the stub
     made word-length based like §9f's own.
   - Observe: 20 of 20, boundaries forwarded 0 → 20; §9f's own timing still 15.3 ms.
2. **The light waits for onstart.**
   - Reason: with voice on, the light and mouth started when the line arrived, and with a global voice queue a line can wait several
     seconds. Check: over the real hive through the real controller, off before onstart and on from onstart to onend, N of N.
   - Act: `pending()` in the controller, `voiced` in the mount, the line's text through the seam so the voice and the figure agree on
     which line (it also stops an unvoiced line's synchronous onstart/onend hitting the agent's previous line).
   - Observe: 11 of 11 (0 of 11 without `voiced`), captions 11 of 11. **Failed once:** the per-word count read 164 of 165. The miss was
     a line still speaking when the 60 s run ended; the word count now skips unfinished lines, as the line count already did:
     159 of 159.
3. **High detail inside the rooms.**
   - Reason: three outdoor figures (about 2,700 triangles each) put every room over 6,000. Check: §9k, six rooms built as the page
     builds them on a desktop (ROBO-INTERIORS, ENV-HD-4's lighting, ENV-HD-2's skins), three figures with captions, `ixrMeasure`.
   - Act: `AA_HD_LOD.room` (no more triangles than today's figure); `aaRoomAvatarMount` through `hwSyncRoom`'s `mount`.
   - Observe: 898–962 triangles a figure, 6 of 6 rooms inside, busiest 5,562.
4. **A stop hand that reads from the front.**
   - Reason: the round-4 stop hand sat beside the head (x −0.27 m, outside the shoulders), near the bid's raise. Check: §9g in front of
     the chest, inside the shoulders, palm to the front; stop against raise from the front, before → after.
   - Act: a numeric search on the real skeleton over all seven bodies (`AA_HD_STOP_POSE`).
   - Observe: the hand at about −0.09 m, 1.33 m high, 0.36 m in front of the chest, palm 1.00 to the front; 0.38 → 0.68 body heights
     from the raised hand. The §9g stop line was rewritten, because "forward and up" passed a hand beside the head.
5. **The voice in the built page.**
   - Reason: the seam must work in the page, not only in node. Check: drive V, light from onstart N of N, boundaries reaching N of N,
     network voice 0.
   - Observe, first run: **failed.** It sampled per animation frame, and at load average 8–11 the page drew 17 frames in 16 s.
   - Act: the stub reads the figure's state inside its own callbacks, just before and after each event.
   - Observe, second run: boundaries 48 of 48, but the light was right for **2 of 3** lines. Under the stall the stub's 100 ms onstart
     landed after the 1.5 s stuck-voice watchdog, so `pending()` gave up and the figure fell back to its clock.
   - Act: `OH_START_WAIT_MS` 4 s.
   - Observe: 3 of 3, page errors 0.
6. **The stills.**
   - Reason: look at the room figure and the stop hand in the page's own light. Check: both 1920×1080 stills looked at.
   - Observe: the first room still cut the caption off at the top. The figure now stands 3.3 m from the room's camera preset. The
     stop still reads as a raised palm in front of the chest.

## Stills (1920×1080, `$SP/loop10/ah2/`, each looked at)

| File | What |
|---|---|
| `ah2-room-speaking.png` | Selka (safety steward) speaking inside the robot cell hall, the room level of the high-detail figure on high. One of the hive's own lines (seed 1) is replayed on her, with the mouth open (0.92). The caption reads "Selka (software agent) to Tamsa: Tamsa, vbjob-43d6… is 3 hops from you; can your bid of…". |
| `ah2-stop-front.png` | Brann (maintenance planner), the full high-detail figure, seen from the front: the stop hand is in front of the chest, palm square to the camera, fingers up, on one of the hive's own refusals. The caption reads "Stopped: physical-target". |

To reproduce: `python3 tools/bundle_webxr.py parishes && node tools/drive_avatars_hd2.mjs 9131 <dir>`.

## Checkers (single runs)

- `node tools/check_agent_avatars.mjs`: all 99 checks pass (92 before).
- `node tools/check_hive_world.mjs`: all 35 pass. `node tools/check_hive3.mjs`: all 32 pass. Each had one regex updated to the
  seam's new call shape, with the same claim.
- `node tools/check_omega_hive.mjs`: 15 passed, 0 failed. `node tools/check_voices.mjs`: 10 passed, 0 failed.
  `node tools/check_hive4.mjs`: 11 passed, 0 failed.
- `node tools/check_avatars.mjs`: all pass. `node tools/check_console.mjs`: all pass. `node tools/check_hd4.mjs`: all 118 pass.
  `node tools/check_robo_interiors.mjs`: 302 passed, 0 failed.
- `node tools/check_imports.mjs`: all 1124 modules. `node tools/check_parse.mjs`: all 2703 modules parse.
  `node tools/check_newton.mjs`: 60 checks, 0 failed.
- `node tools/drive_avatars_hd2.mjs 9131`: all drive steps pass, page errors 0, off-host requests 0.
- `check_interface`: not run, because no control was added or changed (the panel's `onWord` is a callback, not a control).
- Not run: `tools/check_all.mjs` (the coordinator gates).

## Seams

- **oh-voice.js:** `say(agent, text, { onstart, onboundary, onend })`, where onboundary is the current line only.
  `pending(agentId, text?)`. `OH_START_WAIT_MS` is 4000. `ohVoiceController({ now })`.
- **oh-panel.js:** `ohMountHive(el, { onTalk(id, on, line), onWord(id, charIndex, line) })`, where `line = { text, jobId }`.
- **Mount:** `aaMountAgentAvatars({ voiced(agentId, text), hd: true | "room" })`. `talkStart(id, text?)`,
  `talkWord(id, charIndex, text?)`, `talkEnd(id, text?)`. `aaVoiceHooks(world, id, text?)`. `aaRoomAvatarMount(extra)` gives a
  `mount` for `hwSyncRoom`. `aaBoundaryWordSec(bw, chars)`.
- **Figure:** `aaHdGeometry(spec, "full" | "room")`, `aaHdBuild(three, agent, spec, { level })`, `AA_HD_LOD`, `AA_HD_ROOM_BUDGET`,
  `AA_HD_STOP_POSE`.
- **HIVE-5 (the operations room):** the ops room is 25 meshes and 2,022 triangles on high, and HD4_OPS_BUDGET is 40 meshes and
  6,000 triangles. Seven room-level figures would add 21 meshes and 6,486 triangles (46 meshes, 8,508 triangles in all), so seven HD
  figures do not fit there. Seven of today's figures (63 meshes, 7,056 triangles) do not fit either. That room needs fewer figures
  or a lighter level: see `ah2-next.md`.

## Left

- Frame time was not measured (ah-next item 5). The machine was loaded (load average 8–11) the whole round.
- The ops room (HIVE-5's) has no level that fits seven figures; a "crowd" level is sketched in `ah2-next.md`.
- `talkWord` stamps a boundary with the mount's last frame time. At a normal frame rate that is under 17 ms off. At about one frame
  a second, words can pass unseen. Captions and the light are unaffected.
- `check_hive_world` and `check_hive3` still mount the rooms with the default mount (today's figure). The page uses the room level,
  and §9k measures it as a worst case (three figures, captions up), not over the hive's day.
- The bundles were rebuilt for the drives and are not committed (the coordinator regenerates them).
