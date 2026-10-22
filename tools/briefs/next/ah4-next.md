# Next brief: AVATARS-HD-5 (`ah5`, uses AGENT-AVATARS' `aa` files): moods in the page, robot rooms without held agents, frame time

Read first: `docs/consoles/AVATARS-HD-4.md` (Evals, Read honestly, Seams, Left) and `docs/consoles/memory/AVATARS-HD-4.md`. Then
`WebXR/shared/aa-agent-avatars.js` (`aaCrowdAvatarMount` `nearest`/`learner`, `aaNearestRole`, `setMood`, `capLevel`/`triCap`,
`AA_WALK_TURN`), `aa-agent-hd.js` (`AA_HD_MOOD_POSE`, `aaHdMoodTempo`, `AA_HD_NEAR_EXTRA`), `tools/check_agent_avatars.mjs` §9m and
`tools/drive_avatars_hd4.mjs`. Single checkers only. Rebuild with `python3 tools/bundle_webxr.py parishes` before a drive, run drives one
at a time on your own port, and restore the committed dist after (`git checkout WebXR/*/dist docs/perf/phone-maps.json`).

## What to do

1. **Moods in the page** (with HIVE): once the page's hive runs with `moods: true` (HIVE's switch; the figures already subscribe), drive
   the ops room to a refusal and shoot a concerned figure beside a calm one.
   - Check: in the drive, each built figure's `state(id).mood` equals `hive.mood(id).mood`, N of N, and a still is looked at.
2. **Robot rooms with no held agent** (with ROBOTS-HD): the AMR warehouse at 40d97421 built 7,450 triangles but drew 6,324 with three
   room-level figures. Find the hidden triangles in the room's group (a hidden rig still counted by ixrMeasure?). With ROBOTS-HD,
   either drop them from the group or count only what is drawn, with the reason. Then see whether three crowd or room figures fit.
   - Check: drive B's rooms line: 6 of 6 inside IX_BUDGET with 0 held; §9m's cap line unchanged.
3. **Frame time on a quiet machine** (open since ah-next 5). Round 7 ran at load 30–38, with 2–4 s a frame in software rendering.
   - Check: if the load is under 4, record the median over 10 s for the ops room (one room and six crowd figures against seven crowd),
     with the load beside it. Otherwise say it is still open.
4. **The ops room's last 8 triangles.** The room on high is at 5,988–5,992 of 6,000. Before anything else is added to it, decide with
   HIVE and ENV-HD whether the room-level figure stays, or whether the crowd level should lose a ring to make room.
   - Check: §9m's mixed-room line with the margin printed.

## Rules that stay

Agents are software and look it: the label "software agent · <role>", the porcelain shell, visor band, halo and caps, no skin tone
(§9c, §9l). Moods never touch the face and never change the stop hand. No real person's likeness; procedural geometry only. The phone
tier builds no figures. Balanced keeps today's figure. HD is opt-in per mount on the desktop high tier. No network, voice or microphone
in the aa modules. `aa-agent-avatars.js` imports nothing of the hive's. Never run `tools/check_all.mjs`. Never commit
`docs/perf/checkers-last.json` or measured timings.
