# Console TREASURE-3

- Team: TREASURE-3 — hidden treasures and easter eggs, phase three (resumes console TREASURE-2)
- Brief: the holodeck brief (shared rules) + `tools/briefs/next/treasure-2-next.md` (task list, in order) + `tools/briefs/frontier-brief.md` (gate contract)
- Branch: worktree of `claude/vr-ar-safety-training-wkwmve`, merged by the coordinator
- Prefix: `tz…` · port 8993
- Memory: `docs/consoles/memory/TREASURE-3.md` · next brief: `tools/briefs/next/treasure-3-next.md`

## Log
- 09:22 UTC · merged TREASURE-2's local branch (fast-forward, no conflicts). Read the holodeck brief, TREASURE and TREASURE-2 memory, docs/treasures.md, the log tail and treasure-2-next.md · next: plan
- 09:30 UTC · plan, in the next brief's order: (1) themed lessons — `namedWhy()` claims a named station once, `programmeWhy()` takes an unused why from the place's own programmes, `ROOM_WHY` / `TRACK_WHY` tables for the rooms and courses that are not stations, `place: { id, stations }` on every placed station lesson, eval in the generator and in check_treasures; (3) field lessons as quiet treasures — `tzLessonAnswered(id)` called by Summit and Redwood when a check question is answered right, lesson = the field lesson's own trade line (SM `trade`, RW `tradeLine`), set Field Scholar; (4) L key look-around listing nearby markers as buttons, keyboard/screen-reader constellation, reduced-motion stop in `tzSpin`; then (2) Redwood + Guide in the live checker and (5) a frame-cost sample · next: code
- 09:54 UTC · survey found 6 off-programme lessons (summit-cairn-6, redwood-page-5, blaze-2/3/6/7), 10 pooled race lessons and 3 pooled rooms (devops, plumbing, paint-sprayer); after the tables 0 remain. 179 treasures (summit 25, redwood 29), 17 sets, 10 gated; check_treasures 9/9, check_gates 857/0; docs/treasures.md updated · next: commit, then Redwood + Guide live
