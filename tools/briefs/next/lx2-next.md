# Next for LESSONS-X-2 (`lx2`)

Read `docs/consoles/LESSONS-X-2.md` (Evals, Read honestly) and `docs/consoles/memory/LESSONS-X-2.md`. Own `lx-*.js` and the
additions to `lessons.js`. Call the hive and figure APIs; do not edit `oh-*`, `aa-*`, `acc-*` or `ix-interiors.js`.

1. **Split the pack data per world** (lx-next 5, measured this round: the parishes page needs 36,959 B of 112,464 B). The bundler
   requires every imported module in the app's list, so: make `lx-packs-data.js` a small core with mutable containers and
   `lxPacksRegister({ decls, pending, steps, meta })`; have `gen_lx_packs.mjs` also write `lx-packs-<world>.js` files that call it;
   list the core plus the parishes file in the parishes bundle and all worlds in the instructor's. `lxRoster()`/`lxPacks` read the
   containers. **Check:** `check_lx` §1 compares every generated file; §12 prints the parishes bundle's bytes before → after
   (expect about 75 KB less); the instructor tab still shows 6 packs.
2. **Walk to the site in the drive.** This round's drive teleported 4 m south of the site position (inside the cell). Teleport to
   the leader's spot (`agentAvatars.state(id).at`) and take the still with the figure in the foreground and its caption plate
   legible. **Check:** the still, looked at.
3. **Interruption misses in the debrief.** The record's `debrief.interrupts` (answered, wrong, missed) is not mapped to steps.
   Add one grounded debrief line for missed interruptions (the station's own interrupt text). **Check:** §3b stays N of N.
4. **The room lesson's station deep link.** In an ACCESS room the lesson's try is the pad station; after the try the learner comes
   back to the room (`ixr=` style hash is only for robotics rooms). Give ACCESS rooms a return hash the same way and feed the
   record into a room debrief with `lxRoomLesson({ phases: ["debrief"] })`, gated by `lxProgressStore` as outdoors.
   **Check:** a check_lx section with a recorded session in a room; nothing for K-12, demo or signed-out.
5. **Voice per persona.** With voice on, a VBRIDGE lesson speaks each line through `ohSpeakAs` with the line's own agent; the
   personas have no `voice` record (`aa-agent-portraits.js`), so the default voice is used for all four. Ask the figures' owner for
   a per-persona voice band, or state that one voice is intended. **Check:** `check_voices` unchanged; local voices only.
