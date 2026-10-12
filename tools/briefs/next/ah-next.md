# Next brief — AVATARS-HD-2 (`ah`, uses AGENT-AVATARS' `aa` files): the high-detail agents everywhere they stand, and the voice in the mouth

Read first: `docs/consoles/AVATARS-HD.md` (Seams, Left, Read honestly) and `docs/consoles/memory/AVATARS-HD.md`, then
`WebXR/shared/aa-agent-hd.js` (the header is the contract), `aa-agent-avatars.js` (the `hd` option, `talkWord`, `aaVoiceHooks`,
`AA_GESTURE_FOR`), `aa-agent-portraits.js` (`aaPortrait`), `tools/check_agent_avatars.mjs` section 9 and
`tools/drive_avatars_hd.mjs`. Single checkers only. Rebuild `python3 tools/bundle_webxr.py parishes instructor` before a drive,
one drive at a time on your own port.

## What to do

1. **The voice's word boundaries reach the mouth in the page.** oh-voice.js (OMEGA-HIVE / HIVE-4's file) must forward
   `u.onboundary = (e) => item.opts.onboundary?.(e)` in `pump()`. The panel's `onTalk` must then pass the boundary to the page,
   for example as `onTalk(id, "word", e.charIndex)`. In app.js, call `aaWorld?.talkWord(id, charIndex)` and
   `hwRoomMount?.avatars?.talkWord(id, charIndex)` there. Agree the shape through the seam; do not edit the other console's file.
   - Check: `check_agent_avatars` §9f's controller line prints "boundaries forwarded by the controller: N" with N > 0.
   - Check: the mouth opens within 25 ms of each forwarded boundary, N of N.
   - Check: a drive with a stubbed `speechSynthesis` (one local voice, one network voice) sees the mouth open on each boundary
     in the built page, and the network voice is never chosen.
2. **Wait for onstart when voice is on** (h3-next item 2). Add an `aaMountAgentAvatars({ voiced: () => bool })` option. When it
   is true at a line's start, the light and the mouth wait for `talkStart`. The caption still shows when the line arrives.
   If no `onstart` arrives within 1.5 s, fall back to the clock.
   - Check: the light and the mouth are off before onstart and on from onstart to onend, N of N.
   - Check: the caption is up for every line.
3. **HD inside the robotics rooms, inside `IX_BUDGET`.** Three HD figures at about 2,700 triangles each would take the cell hall
   (1,688 triangles of shell) past 6,000 on high, so the rooms keep today's figure. Add a lighter HD level (`AA_HD_ROOM`, about
   1,300 triangles: segment counts from the spec), or show HD for the two nearest figures only. Pass it through
   `hwSyncRoom(…, { mount })` from app.js; do not edit hw-hive-world.js unless that console's seam allows it.
   - Check: `check_hive_world` and `check_hive3` rooms stay inside `IX_BUDGET` with three figures on high.
   - Check: textures stay inside `IXR_TEX_BUDGET` (the label and caption canvases are unchanged).
4. **A stop hand that reads as "stop" from the front.** The stop hand is held in full now (20 of 20), but from a camera in front
   it sits beside the head, close to the bid's raised hand. Bring it in front of the chest: adduct the shoulder and turn the
   palm to the camera. Today's figure (balanced) could also lift its tablet a little on a bid.
   - Check: §9g's pose line measures the stop hand's wrist inside the shoulders' width and in front of the chest.
   - Check: the raise is still above the head.
   - Check: a retaken `ah-stop-high.png` shows the palm square to the camera.
5. **Frame time on the capture machine.** Measure the high tier with the seven HD figures in view against today's figure:
   frames over 10 s, quiet machine, load average reported beside the numbers. Today only draw calls and triangles are measured.
   - Check: the median frame time per tier, before → after, in the console note.

## Rules that stay

Agents are software and look it: the label "software agent · <role>", a cool porcelain shell with role-coloured visor band, halo
and caps, and no skin tone. §9c holds the head and hands at least 0.15 RGB from crew.js's twelve tones. No real person's
likeness, procedural geometry only. The phone tier builds no figures, balanced keeps today's figure, and HD is opt-in per mount
on the desktop high tier (`AA_HD_BUDGET`: 12 meshes + sprites, 3,000 triangles, 3 draw calls silent). No network, voice or
microphone in the aa modules. Captions always show; voice stays on-device and off by default. Never run `tools/check_all.mjs`.
Never commit `docs/perf/checkers-last.json` or measured timings.
