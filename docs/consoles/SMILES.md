# SMILES — the Unspoken Smiles world (prefix `sm`, port 9006)

A procedural community-health district on the parish engine for the Unspoken Smiles programmes
(`dental-hygiene-unspoken-smiles`, `dental-careers-unspoken-smiles`), with dental-health games and easter eggs whose every
line is quoted from, or traced word by word to, a dental station's own text. Not a real place.

## Seams
- Map: `WebXR/shared/np-data-sm-unspoken-smiles.js` (`NP_SM_UNSPOKEN_SMILES`, id `sm-unspoken-smiles`, region `programmes`
  "Programme Worlds"), registered in `np-parishes.js`, strict in `check_parishes`.

## Cycles
1. Reason: a procedural 4 km map on the strict engine, registered, with a nominal geo frame — proof: check_parish_data and
   check_parishes 0 fail. Act: `np-data-sm-unspoken-smiles.js` (15 sites, 5 K-12 lessons, 2 gated), region `programmes`,
   bundle lists, docs/parishes.md. Observe: check_parish_data 16903 pass / 0 fail; check_parishes first run 2 fail (a
   footbridge landmark on the creek needs a water kind; the module missing from the bundle lists) → fixed → 32186 pass / 0 fail.
2. Reason: six games on the shared step shape whose every line traces to a dental station's own text — proof: check_smiles
   passes every line/game check. Act: `WebXR/shared/sm-smiles.js` (27 traced lines, 6 games: Every Surface, Floss the Gaps,
   Snack Sort, Plaque Attack, Clean Hands for K-12 spots; The Sterilisation Order for an adult site) and `tools/check_smiles.mjs`.
   Observe: every quote re-reads verbatim and every K-12 word is the station's own on the first run; 297 pass / 5 fail
   (treasures and wiring not yet made).
3. Reason: wire the panel with one import and one mount — proof: check_smiles wiring checks. Act: app.js import + mount
   (tyEarn pays once per game), `menu-smiles` in the Play tab, check_interface's Play list, the bundler. Observe: 301 pass /
   1 fail (treasures only).
4. Reason: hidden toothbrush / tooth-fairy treasures through gen_treasures.mjs at K-12 spots only — proof: check_treasures
   all pass and check_smiles' treasure checks. Act: a SMILES section in `tools/gen_treasures.mjs` (six treasures, set
   `smile-toothbrushes`, each lesson a dental station's own why, claimed once), regenerated `treasures-data.js`, and
   `check_treasures` taught to resolve the programme world's sites. Observe: check_treasures "All checks pass: 345 treasures
   on 14 surfaces, 25 sets"; check_smiles 315 pass / 5 fail — my own fear-word list caught "Lost" in "Lost Toothbrush"
   (misplaced, not a fear line) → dropped `lost` from the list → 320 pass / 0 fail. check_k12: all pass.
5. Reason: the bundle shares one scope — prove sm-smiles.js adds no clashing top-level name, and extend check_parishes for
   the programme world. Act: prefixed four bare constants (`OHI` → `SMILES_OHI` …); a SMILES block in check_parishes (region
   last, strict, procedural label, nominal frame, required site kinds, no figures); check_smiles in check_all's list and the
   baseline. Observe: `bundle_webxr.py parishes` wrote the page (121 modules) and `node --check` on its module script passes
   (dist not committed); check_parishes first showed only +2 checks — its `check()` returns nothing, so my `if (check(…))`
   skipped the block → fixed → 32201 pass / 0 fail; check_smiles 320 / 0.

## Seams (continued)
- Games: `smilesGamesFor(parishId, { k12 })`, `smilesSteps(id)`, `smilesScore(id, picks)`, `smilesPay(id, picks, earn)`,
  `smilesMount({ el, parish, k12, toast, earn })` — mounted once in `WebXR/parishes/js/app.js` into `#menu-smiles` (Play tab),
  `earn` = TYCOON's `tyEarn(stationId, { recordId })`; `?k12=1` hides the adult game.
- Treasures: `tools/gen_treasures.mjs` SMILES section, set `smile-toothbrushes`.
6. Reason: score the new world once with ASSAYER's rubric — proof: its eval_worlds row. Act: `node tools/eval_worlds.mjs
   --no-browser` (port shared). Observe: Unspoken Smiles District 95 — legible 3/3, resolves 65/65, completable 3/4, budget
   4/4, facts 37/37; overall 28 subjects, mean 97, 19 findings. The one miss is the shared play-layer reader
   (`slLessonsFor`/`sgLessonsFor`) not reading `sm-fl-` lessons — the same finding ten Bay Area maps carry, PLAYLAYER's reader.
