# Next brief — SCHOLAR-3: K-12 from "complete" to "taught well"

Binds the console that follows SCHOLAR-2. Read, in order: `docs/consoles/memory/SCHOLAR-2.md`, `docs/consoles/SCHOLAR-2.md`,
`docs/k12.md`, `tools/briefs/k12-brief.md`, the SCHOLAR-2 section of `tools/briefs/frontier-brief.md`. Facts rule, bundler
prefix (`k2…` for field-lesson code) and the console rules all still apply.

## Where SCHOLAR-2 left it (measured)
- **28 / 28** K-12 stations across the four classroom programmes (8 maths, 8 science, 6 history and civics, 6 literacy);
  the fourteen new ones score **95–96** on `node tools/eval_content.mjs` (variety 94, explanation 99–100, every other
  dimension 100 except originality). Originality is the weak dimension on every K-12 station (**14–41**) because all
  of them share one scene and one thirteen-step shape (`tools/gen_k12_station.mjs`).
- **42** field lessons in `WebXR/shared/field-lessons.js` (Bay World 17, the Deep 10, the Regatta 8, Fairway Park 7),
  reading level Flesch–Kincaid ≈ 0–5, all validated by `check_k12`. The K-12 map layer is drawn on the Bay World and
  Deep full maps only.
- `check_k12` now gates the station count, reading bounds (station prose FK 4–11, ≤ 24 words per sentence; lessons
  FK ≤ 7, 4–16 words per sentence) and every field lesson's anchor, station, link and text.

## Do next
1. **Break the template.** Give the generator three or four scene variants (outdoor bench, boat deck, stage, lab
   bench) and two alternative step orders so K-12 stations stop sharing their skeleton; target originality ≥ 50 on
   every K-12 station without losing the 95+ total. Regenerate all twenty-eight from their JSON (the first fourteen
   need JSON written from their existing modules — start by writing an extractor, not by hand).
2. **Field lessons in play.** Lessons are data and a map layer today. Make them playable in-world: a small kiosk at
   each lesson's position in Bay World and the Deep that opens the three steps and the check question in the HUD,
   records completion in the passport, and counts toward a "Field Notes" badge. Add the layer to the Regatta and
   Fairway maps (neither has a full map list yet; confirm with their console before editing `regatta/js/app.js` or
   `fairway/js/app.js`).
3. **SUMMIT and REDWOOD lessons.** Each of those worlds owes ten field lessons in SCHOLAR-2's schema. Extend
   `check_k12` (section 8) to read their data modules' exported lessons once they exist, with their anchors.
4. **Teacher tools.** A printable lesson card per field lesson (title, steps, check question, trade line) from the
   same data, and a teacher view listing lessons by programme and band.
5. **Read-through.** Have a second pass read every K-12 station aloud for age fit; the lower bound of the reading
   yardstick is loose for the early-primary literacy stations.

## Gate
`node tools/check_k12.mjs`, `node tools/eval_content.mjs --station <id>` per station (95+), then
`python3 tools/bundle_webxr.py && node tools/check_all.mjs` once at the end.
