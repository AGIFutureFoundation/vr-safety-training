# Next brief: AVATARS-HD-6 (`ah6`, uses AGENT-AVATARS' `aa` files): a mood you can see from the door, frame time, the ops room's budget

Read first: `docs/consoles/AVATARS-HD-5.md` (Evals, Read honestly, Seams, Left) and `docs/consoles/memory/AVATARS-HD-5.md`. Then
`WebXR/shared/aa-agent-avatars.js` (`aaMoodOf`, `seedMood`, `moodOf`, `aaRoomHeadroom`, `aaCrowdAvatarMount`, `capLevel`),
`tools/check_agent_avatars.mjs` §9m and §9n, and `tools/drive_avatars_hd5.mjs`. Single checkers only. Rebuild with
`python3 tools/bundle_webxr.py parishes` before a drive, run drives one at a time on your own port, and restore the committed dist after
(`git checkout WebXR/*/dist docs/perf/phone-maps.json`).

## What to do

1. **A mood you can read at a distance.** In `ah5-concerned-beside-calm.png` the concerned figure reads as arms in and head a little
   lower, but only up close; the glow's pulse does not show in a still. Try a posture cue that reads from the door (for example the
   tablet lowered for concerned), inside the traits' ranges, never the face and never the stop hand.
   - Check: §9m's mood lines stay true, and a new line measures the cue (for example the tablet's height in each mood), 7 of 7. Shoot
     the room from the door with one concerned figure and look at it.
2. **Frame time on a quiet machine** (open since ah-next 5). Rounds 7 and 8 ran drives at load 20–38.
   - Check: if the load is under 4, record the median over 10 s for the ops room (one room and six crowd figures against seven crowd),
     with the load beside it. Otherwise say it is still open.
3. **The ops room's budget.** The room-level figure stays (AVATARS-HD-5's decision) with its headroom measured at mount, so additions
   come out of it first. If HIVE or ENV-HD add to the ops room, re-measure in the built page and say which figure level it ends at.
   - Check: §9n's "last triangles" line with the margin printed; the drive's ops-room line.
4. **The robot rooms with ROBOTS-HD's later robots.** The cap rule (every mesh that can be drawn is counted; hidden for good leaves the
   group) is checked by §9n. Re-run drive B (`node tools/drive_avatars_hd4.mjs <port> <dir> after B`) whenever a room's robot changes.
   - Check: drive B: 6 of 6 inside IX_BUDGET with 0 held.

## Rules that stay

Agents are software and look it: the label "software agent · <role>", the porcelain shell, visor band, halo and caps, no skin tone
(§9c, §9l). Moods never touch the face and never change the stop hand. No real person's likeness; procedural geometry only. The phone
tier builds no figures. Balanced keeps today's figure. HD is opt-in per mount on the desktop high tier. No network, voice or microphone
in the aa modules. `aa-agent-avatars.js` imports nothing of the hive's. Never run `tools/check_all.mjs`. Never commit
`docs/perf/checkers-last.json` or measured timings.
