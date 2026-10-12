# AVATARS-HD-2 memory

- Base e252b25f (loop 10 round 5). Prefix `aa`/`AA_` in the aa files, `oh`/`OH_` in oh-voice.js, port 9131. This round owned the voice →
  mouth seam end to end: oh-voice.js, the one `voice.say` line in oh-panel.js, aa-agent-avatars.js, aa-agent-hd.js and app.js's wiring.
  The rooms' figures come through hwSyncRoom's `mount` seam (app.js `aaRoomMount`), so hw-hive-world.js was not edited.
- Which line is which: the voice controller is one queue for every agent, so a figure's current line is not always the voice's. The
  seam carries the line's text (`onTalk(id, on, line)`, `onWord(id, charIndex, line)`, `talkStart/talkWord/talkEnd(id, …, text)`). A
  later queued line named by the voice is brought forward; an unknown one is ignored. That also stops the synchronous onstart/onend of
  a line with no local voice (fired inside `say()`, before the mount even hears the event) from cutting the agent's previous line.
- Waiting for onstart: `voiced(agentId, text)` = the panel controller's `pending(agentId, text)`. The panel's speak listener runs
  before the mount's (it is mounted first), so the line is already queued when the mount asks. `pending` gives up on a voice whose
  line has not started 4 s after it was handed over (OH_START_WAIT_MS). 1.5 s misfired in a loaded page (about one frame a second): the
  stub's 100 ms onstart timer landed after 1.5 s.
- Boundary-driven words: the mouth closes at 86% of a word's `dur`. A word's `dur` is 0.8 × the predicted time to the next boundary
  (aaBoundaryWordSec: a + b × characters, least squares over the line's last eight intervals; prior a 0.05 s, b 0.025 s a character).
  With a fixed 0.2 s stub the fit gives a ≈ 0.2, b ≈ 0, so the mouth closes there too.
- Measuring a page drive under load: frames are too sparse to judge 0.2 s words. Read the figure's `state()` inside the stub's own
  callbacks, just before and after each event; the light and the boundary count change synchronously.
- The room level (`AA_HD_LOD.room`): 898–962 triangles, 3 meshes. Every room on high with ENV-HD-4's lighting and three figures fits
  (busiest AMR warehouse 5,562 of 6,000). The full level is byte-identical to round 4 (silhouettes and portraits unchanged).
- The stop pose (`AA_HD_STOP_POSE`) came from a coordinate-descent search over the seven bodies on the real skeleton (the script was in
  `$SP/loop10/ah2/stop_search.mjs`). The right palm faces +x in its bind frame (towards the body when hanging); the fingers are −y.
  The elbow twist (y) does not move the forearm (rigid limbs), only the hand's orientation.
- Stills in the page: freeze the mount by replacing `animate` (the outdoor `aaWorld.animate`, or the room mount's `animate`) and run
  the original yourself. Then place the figure in front of the camera preset (inside a room: `ixScene(style).camera`, room-local; yaw
  0 looks along −z). At 2.35 m the caption is cut at the top; 3.3 m frames the label and the caption.
- Commit trailers carry "Co-Authored-By: Claude" with no model name (the brief forbids a model identifier in any commit message).
