# Next brief — SCHOLAR-4: K-12 originality by the words, and the teacher's tools

Binds the console that follows SCHOLAR-3. Read, in order: `docs/consoles/memory/SCHOLAR-3.md`,
`docs/consoles/memory/SCHOLAR-2.md`, `docs/consoles/SCHOLAR-3.md`, `docs/k12.md`, `tools/briefs/k12-brief.md`. Facts rule,
bundler prefix (`k2…`) and the console rules all still apply.

## Where SCHOLAR-3 left it (measured)
- **28 / 28** K-12 stations, all 94–97 on `node tools/eval_content.mjs` (corpus mean 96, unchanged). Originality after this
  round: the fourteen JSON stations 18–58 (was 14–53; slope 14→28, crane 36→44, blade 22→33, tides 34→39, oral 48→53,
  maps 52→58, others +0 to +3); the fourteen hand-written stations unchanged, six of them at **0–1** (court, map scale,
  timeline, sources, buoyancy, energy) because each pair was written from the other.
- Measured fact that changes the plan: the eval's originality reads **prose only**. Scene and step order do nothing to it.
  The generator now has five scenes and three orders (`scene`, `order` in the JSON); the fourteen JSON stations use them.
- **Field lessons are playable**: `WebXR/shared/field-kiosk.js`; kiosks in Bay World (17) and the Deep (10), a lesson
  screen, passport awards (`field-lesson`, `field-notes`), the Field Notes badge at five per world. The Regatta lists and
  draws its 8 on the course card and briefing; Fairway lists its 7 on the facility screen. Summit's 10 and Redwood's 10
  are read by `check_k12` section 8c against their anchors. `check_k12`: 1004 checks green.

## Do next
1. **The extractor.** `tools/extract_k12_station.mjs <id>`: load the room headless (steps, hazards, interrupts, name,
   tagline, badge, board) and read the labels and faces back from the generated `bead(`/`card(`/`dial(`/`meter(`/
   `token(`/`spot(`/`board(`/`hazardCard(` lines; write `tools/k12-data/<slug>.json`; prove the round trip by regenerating
   and diffing against the module (whitespace aside) before committing. Then give the fourteen a scene and an order each.
2. **Originality by the words.** For the six pairs at 0–1, rewrite the interaction cues and the hazards of one station in
   each pair in its own setting's vocabulary (a court is not an archive); target `org` ≥ 50 on every K-12 station without
   the total dropping under 95. Check the shared-word list first: `$SP/holodeck/scholar-3/orig.mjs` (the memory file
   describes it; rebuild it from the eval's token function if the scratchpad is gone).
3. **Teacher tools.** A printable lesson card per field lesson (title, steps, check, trade line) from the same data, and a
   teacher view listing lessons by programme and band, with each learner's Field Notes count read from the passport
   (`k2FieldNotes(world)`); nothing leaves the device.
4. **Kiosks in Summit and Redwood.** Both worlds already open their lessons in-world; make their completion write the same
   passport award (`k2RecordLesson`-shaped) so one Field Notes badge counts across worlds, and draw their lessons through
   `k2RenderLessonList` on their map lists.
5. **Read-through** of the twenty-eight stations aloud for age fit (SCHOLAR-2's item 5, still open).

## Gate
`node tools/check_k12.mjs`, `node tools/eval_content.mjs --station <id>` per station touched (95+, report the full-corpus
row), then `python3 tools/bundle_webxr.py && node tools/check_all.mjs` once at the end.
