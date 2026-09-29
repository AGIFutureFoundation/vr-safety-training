# Next brief — SCHOLAR-5: the rest of the words, and the read-through

Binds the console that follows SCHOLAR-4. Read, in order: `docs/consoles/memory/SCHOLAR-4.md`,
`docs/consoles/memory/SCHOLAR-3.md`, `docs/consoles/SCHOLAR-4.md`, `docs/k12.md`, `tools/briefs/k12-brief.md`. Facts rule,
bundler prefix (`k2…`) and the console rules all still apply.

## Where SCHOLAR-4 left it (measured)
- **28 / 28** K-12 stations have JSON in `tools/k12-data/` (the fourteen hand-written ones extracted by
  `tools/extract_k12_station.mjs`, round trip proven), each with a `scene` and an `order`; the generator exports `gen`,
  `ORDERS`, `CERT`; the wall scene's desk colour is the JSON field `desk`.
- `node tools/eval_content.mjs` (685 procedures, corpus mean 96, unchanged): every K-12 station **95–97** (was 94–97).
  Originality **18–58** (was 0–58): court 0→52, map scale 0→28, timeline 1→37, buoyancy 1→39, energy 1→34, sources 1→30,
  water 23→34, tides 39→40; the rest unchanged. Five stations at fifty or over (court 52, oral 53, sky 55, map literacy 58,
  speaking 51). Lowest now: report 18, labels 18, kitchen 23, first aid 27, slope 28, council 28, map scale 28.
- Measured method: rewriting one station's cues, whys, hazards and interruptions in its own setting's vocabulary moved
  `org` by +36 to +52 and the total by +1 or +2, never down, and lifted its former twin by +27 to +33 untouched. What
  stays shared after a rewrite is the ring of template words every K-12 station carries (adult, anyone, anything, asks,
  check-in, classmate, commit, drag, hold, look, mark, teacher, trusted, "Next time, stop the lesson and deal with it
  first") plus each setting's core nouns. Shared-word tool: `$SP/holodeck/scholar-4/orig.mjs [ids…]`.
- `check_k12`: **1032 checks** green (new: the kiosk award in Summit and Redwood, section 8d the teacher page).
  `check_imports`: 870 modules green. Bundles rebuilt (13). `check_all` was not run to completion by SCHOLAR-4 (see its
  hand-back line).
- **Summit and Redwood** write the shared `field-lesson` passport award on a right answer
  (`k2RecordLesson(k2AdaptLesson(l, world), list)`), so one Field Notes badge counts in all six worlds; both list their
  lessons under the map through `k2RenderLessonList`. **Teacher tools**: `tools/gen_k12_cards.mjs` →
  `WebXR/k12/teacher.html` (62 cards, the teacher view by programme and band, Field Notes from the passport, no network).

## Do next
1. **Originality to fifty everywhere.** Twenty-three stations sit under fifty. Two levers, in this order:
   (a) the template ring: the check-in why, the interruption `miss` tail ("Next time, stop the lesson and deal with it
   first") and the hold/track `brk` lines are near-identical across stations — give each JSON its own, in its setting's
   words (the check-in why alone moved +0 to +14 last round); (b) per station, rewrite cues, hazards and the interaction
   whys as SCHOLAR-4 did for court, timeline and buoyancy (`$SP/holodeck/scholar-4/{court,timeline,buoyancy}.mjs` are
   the patterns). Start with the twins that still share a setting: report/labels (18/18), timeline/sources (27%),
   buoyancy/water (26%), energy/water. Keep sentences under twenty-four words, reading grade 4–11, whys' median ≥ 200
   characters; check_k12 fails otherwise. Measure with `eval_content --station <id>` and report the full-corpus row.
2. **Read-through** of the twenty-eight stations aloud for age fit (SCHOLAR-2's item 5, still open): the three rewrites
   lean on setting nouns (hardwood, typescript, upthrust) that a teacher should hear read by the band they are for.
3. **Teacher tools, second pass.** A per-lesson print (one card, not the whole world), the teacher view filtered by
   band, and a bundler entry for `WebXR/k12/teacher.html` if the coordinator wants it in `dist/` (today it is served
   from `WebXR/` and imports `../shared/field-kiosk.js` directly).
4. **Kiosk style.** `k2RenderLessonList` rows use Bay World's `map-site-row` classes; Summit and Redwood have no such
   rule, so their lists render unstyled. Add one shared rule set (the design-system batch may already carry it — check
   `WebXR/shared/design.css` first) rather than restyling either page.

## Gate
`node tools/check_k12.mjs`, `node tools/eval_content.mjs --station <id>` per station touched (95+, report the full-corpus
row), `node tools/gen_k12_cards.mjs` after any lesson change, then `python3 tools/bundle_webxr.py && node tools/check_all.mjs`
once at the end.
