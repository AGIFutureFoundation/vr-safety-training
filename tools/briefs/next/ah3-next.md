# Next brief — AVATARS-HD-4 (`ah4`, uses AGENT-AVATARS' `aa` files): the nearest console in full detail, frame time, the room's moods

Read first: `docs/consoles/AVATARS-HD-3.md` (Evals, Read honestly, Seams, Left) and `docs/consoles/memory/AVATARS-HD-3.md`. Then
`WebXR/shared/aa-agent-hd.js` (`AA_HD_LOD.crowd`, `AA_HD_CROWD_BUDGET`), `aa-agent-avatars.js` (`aaCrowdAvatarMount`, `aaRoomRoute`,
`stampOf`/`mouthShown`, `boundaryLog`, `state().walkPath`), `h5-ops-room.js` (HIVE's: `h5MountOpsRoom`, `lite()`),
`tools/check_agent_avatars.mjs` §9l and `tools/drive_avatars_hd3.mjs`. Single checkers only. Rebuild with
`python3 tools/bundle_webxr.py parishes` before a drive, run drives one at a time on your own port, and restore the committed dist file
after (`git checkout WebXR/parishes/dist/parishes.html`).

## What to do

1. **The console nearest the learner at the room level.** The ops room on high is 46 meshes and 5,586 triangles with seven crowd
   figures (≤ 120 / 6,000). One room-level figure in place of one crowd figure adds about 400 triangles (898–962 against 496–524), so
   one fits (about 6,000 − 5,586 = 414: measure it, it is tight). A mixed mount: the room level for the agent whose spot is nearest the
   learner's pose when they enter, the crowd level for the rest, and no swap while the learner moves (a swap rebuilds a skinned mesh).
   - Check: a §9l line, the ops room on high with one room-level and six crowd figures and captions up, inside IX_BUDGET; if it does not
     fit, say so with the number.
2. **Frame time on a quiet machine** (open since ah-next 5). The machine was at load 10–16 through round 6 too. Median frame time over
   10 s for the ops room with the seven crowd figures against HIVE-5's seven lightened standard figures, and the busiest robotics room
   with three room-level figures against three of today's figures, each with the load average beside it.
   - Check: the console note gives the median per case, before → after, with the load.
3. **Moods on the body** (HIVE-6's `mood` event, when it lands): a small posture shift per mood inside the traits' ranges (calm:
   none; busy: a little faster idle tempo; concerned: head a little lower, hands closer; relieved: shoulders a little lower), never a
   face, and the stop hand unchanged on a refusal. Code against HIVE-6's event shape (`{ type: "mood", agent, mood, cause }`), guarded.
   - Check: a §9 line per mood on the bones (before → after), and the default (no mood events) byte-identical in pose.
4. **The routed walks by eye.** In round 6 only the two outer consoles' walks bend (the straight line from the door passes within the
   router's 0.35 m of a chair corner), and a straight walk from the door never crossed a console box (0 of 214). Look at the walk still
   (`ah3-walk-round-console.png`) and decide whether the bend reads as natural; if not, smooth the corner (a short arc through the
   waypoint) without coming nearer than 0.3 m to a box.
   - Check: §9l's walk line (0 within 0.3 m) still holds; a still looked at.
5. **The stop hand by eye in a room** (ah2-next 5, still open): the room and crowd levels have no thumb.
   - Check: a still looked at, with the triangles a 4-segment thumb adds per level.

## Rules that stay

Agents are software and look it: the label "software agent · <role>", a cool porcelain shell, role-coloured visor band, halo and caps,
no skin tone (§9c and §9l). No real person's likeness; procedural geometry only. The phone tier builds no figures, balanced keeps today's
figure (HIVE-5 lightens it in the ops room), and HD is opt-in per mount on the desktop high tier (outdoor `AA_HD_BUDGET`; robotics rooms
`AA_HD_ROOM_BUDGET`; the ops room `AA_HD_CROWD_BUDGET`). No network, voice or microphone in the aa modules; `aa-agent-avatars.js` imports
nothing of the hive's (the router comes in as an argument). The voice is on-device only, off by default; captions always show; nothing
listens. Never run `tools/check_all.mjs`. Never commit `docs/perf/checkers-last.json` or measured timings.
