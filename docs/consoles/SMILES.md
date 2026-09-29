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
