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
