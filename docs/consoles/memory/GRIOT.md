# GRIOT — console memory

Short, durable lessons for the next team at this console. Read `docs/consoles/GRIOT.md` for the log.

## Conventions
- **Everything spoken is generated, never typed.** `tools/gen_npc.mjs` holds the roster (names, roles, sites, PPE, routine)
  and copies every line from a source with a pointer: `{ kb }` a sentence of a Guide chunk (guide.js's sentence split,
  `grSplitSentences`), `{ union }` the registry note, `{ standard }` a *verified* standard's title, `{ station }` the catalog
  tagline. `check_npc` diffs `npc-data.js` against a fresh build and re-reads each line, so edit the generator and re-run it —
  never the data module. Regenerate after any change to `guide-kb.js`, the catalog, `unions.json` or `standards.json`
  (a KB sentence that moves breaks the diff first, then the verbatim read).
- **Hand-offs are derived**, not authored: the site's first two stations, the field lesson nearest the site (Redwood's
  lessons anchor by `site`, the others by position within 260 m), the side quest posted at the site, the treasure whose
  trigger is nearest (its `hint` copied — the ledger's own public line, never a coordinate). Bay World's quests key on
  programme names, not site ids, so Bay characters carry no quest hand-off yet.
- **Templates are not facts.** The greeting names the character and the role; the checker forbids digits in it
  ("K-12" excepted, as a role's own name). The no-match line says so and never guesses.
- **The engine never spells `THREE.`** — three.js comes in as `hooks.three`; the bundler pulls the library into any bundle
  whose text contains `THREE.`, which would drag it into DOM-only pages if npc.js were ever listed there.
- **Retrieval is a copy of the Guide's tokenizer and BM25 in miniature** (`grTokens`, `grRetrieve`) rather than an import
  from guide.js: guide.js is inserted by the bundler just before controls.js, after every listed module, so a module that
  imports from it would run before its definitions in the bundle.
- **`grHasDom`** must reject the checkers' DOM stub (it has `createElement` alone): test for `getElementById`, `body`
  and `addEventListener`, or every headless mount throws.
- **Placement.** Routine points are 7–13 m from the site centre on the east/west/north side. Summit's board is 6 m south
  of the centre and its arrival 16 m south; Redwood's board is `pad × 0.5` *north* and its arrival `pad × 0.75` south
  (both far outside 13 m); Bay World's E radius on a site is 14 m, so talking uses its own key (G) and a Talk button.
  `check_npc` asserts the clearances with each world's real sites.
- **Per-character loop offset** (`style.i × 3.7 s`) keeps eight figures from moving in step; tests that look for a figure
  must use its current position, not its work spot.
- **Bundler order:** `crew.js`, `npc-data.js`, `npc.js` after `links.js`; Summit and Redwood did not list crew.js before.
  `python3 tools/bundle_webxr.py bayworld summit redwood` refreshes the three per-app bundles; the combined `WebXR/dist/`
  only on a full run.

## Numbers (this run)
- 34 characters (8 Bay World, 8 Summit, 8 Redwood, 10 parish by site kind), 258 sourced lines (117 KB sentences, 96 taglines,
  34 standards, 11 union notes), 123 hand-offs (68 stations, 22 lessons, 16 quests, 17 treasure hints), 8 figures × ≤ 12
  meshes per world (56–60 meshes mounted), `check_npc` ≈ 15,300 checks in ~10 s including a 390 × 844 Chromium render.
