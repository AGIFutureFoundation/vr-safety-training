# Next brief — AVATARS-HD-3 (`ah`, uses AGENT-AVATARS' `aa` files): the hive's room, frame time, and the mouth at any frame rate

Read first: `docs/consoles/AVATARS-HD-2.md` (Evals, Seams, Left) and `docs/consoles/memory/AVATARS-HD-2.md`. Then
`WebXR/shared/aa-agent-hd.js` (`AA_HD_LOD`, `AA_HD_ROOM_BUDGET`, `AA_HD_STOP_POSE`), `aa-agent-avatars.js` (`voiced`, `talk*` with
the line's text, `aaBoundaryWordSec`, `aaRoomAvatarMount`), `oh-voice.js` (`pending`, `OH_START_WAIT_MS`), `tools/check_agent_avatars.mjs`
§9f, §9g and §9k, and `tools/drive_avatars_hd2.mjs`. Single checkers only. Rebuild with `python3 tools/bundle_webxr.py parishes` before
a drive, and run drives one at a time on your own port.

## What to do

1. **Seven figures in the hive's operations room** (with HIVE's ops-room console; that room is theirs). The ops room is 25 meshes and
   2,022 triangles on high, against HD4_OPS_BUDGET's 40 meshes and 6,000 triangles. Seven room-level figures would add 21 meshes and
   6,486 triangles, so they do not fit. Add an `AA_HD_LOD.crowd` level of about 500 triangles (`hd: "crowd"`, a mount like
   `aaRoomAvatarMount`), or show the room level for the three nearest and the crowd level for the rest.
   - Check: a §9k-style line builds the ops room on high as the page does (`hd4DressOps` + `hd4LightRoom`) with seven figures and
     their captions, and it is inside HD4_OPS_BUDGET (meshes, triangles, texture bytes).
   - Check: §9c (no skin tone) and the "software agent" label hold at that level.
2. **Frame time on a quiet machine** (ah-next item 5, still open). Measure the median frame time over 10 s for: the high tier with
   the seven outdoor HD figures in view against today's figure, and the busiest robotics room with three room-level figures against
   three of today's figures. Report the load average beside each number.
   - Check: the console note gives the median per case, before → after, with the load.
3. **The mouth at a low frame rate.** `talkWord` stamps a boundary with the mount's last frame time, so at about one frame a second
   the words pass unseen. Pass the event's own time instead (`e.elapsedTime`, or `performance.now()` in the page's wiring) and let
   `animate` show the newest word.
   - Check: the §9f per-word line run at 2 Hz animate still sees each word open at least once, N of N, and §9f at 60 Hz is unchanged.
4. **One check of the room level over the hive's day.** §9k is a worst case: three figures with captions up. `check_hive3` §1 walks
   the day with the default mount (today's figure). Agree with that checker's owner to run its day loop once more with
   `aaRoomAvatarMount()`, or add the same loop to §9k.
   - Check: 6 rooms × 480 steps on high inside IX_BUDGET and IXR_TEX_BUDGET with the room level.
5. **The stop hand by eye in a room.** The room level has no thumb. Look at a stop still in the cell hall and decide whether the hand
   needs one there: a 4-segment thumb is 48 more triangles a figure.
   - Check: a still looked at, with triangles reported.

## Rules that stay

Agents are software and look it: the label "software agent · <role>", a cool porcelain shell, role-coloured visor band, halo and caps,
no skin tone (§9c). No real person's likeness; procedural geometry only. The phone tier builds no figures, balanced keeps today's
figure, and HD is opt-in per mount on the desktop high tier (outdoor `AA_HD_BUDGET`; rooms `AA_HD_ROOM_BUDGET`). No network, voice or
microphone in the aa modules. The voice is on-device only (`localService` true), off by default; captions always show; nothing
listens. Never run `tools/check_all.mjs`. Never commit `docs/perf/checkers-last.json` or measured timings.
