# Next for LESSONS-X (`lx`)

Read `docs/consoles/LESSONS-X.md` (Seams, Read honestly) and `docs/consoles/memory/LESSONS-X.md`. Own `lx-*.js` and the
additions to `lessons.js`. Call the hive and figure APIs; do not edit `oh-*` or `aa-*`.

1. **A menu entry for the lesson at a robot site.** Today a lesson at a robot site starts only from `?lxLesson=` or
   `__parishTest.lxLesson(id)`. Add a "Lesson with the site's agent" action through the INTERFACE menu's existing mounts, and
   start it when the learner reaches the site, not at load.
   **Check:** `check_interface` passes, plus a built-page drive: the figure is on screen while its caption shows.
2. **The real try feeds the debrief.** When the learner finishes the station, pass the station's own result (`score` and the
   steps with corrections or misses) to `lxAgentLesson(..., { result })`. Only for opted-in adults, through `lxProgressStore`.
   **Check:** check_lx gets a section with a recorded session. Missed steps named N of N. Nothing is stored for K-12, demo or
   signed-out sessions.
3. **Lessons in ACCESS's rooms.** Once ACCESS's interiors merge (b98b57fe and later), run `lxMountLessonFigure({ mount:
   aaRoomAvatarMount(), lesson })` with the leader at `room.agentSpots[0]`.
   **Check:** check_lx §2a reports 4 of 4 styles in the tree. In the built page each room stays inside 120 meshes, 6,000
   triangles and 24 MiB with the leader standing.
4. **All four VBRIDGE personas.** The governor states the station's standards in the brief, the provider demonstrates and the
   evaluator debriefs. Each line stays grounded.
   **Check:** §3b stays N of N, and each persona gets at least one line per lesson.
5. **Page weight.** `lx-packs-data.js` is 113 KB in two bundles. Measure it, or split it per world (the parishes page needs only
   its two packs).
   **Check:** bundle bytes before → after.
