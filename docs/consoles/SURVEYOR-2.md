# SURVEYOR-2 — evals across the platform and the known defects

Console SURVEYOR-2 (prefix `sv2`, port 9025), loop 3 (the eval console). SmartCiti.X · Powered by AGI Corp.
Base 684be2fb (46 maps in 10 regions, 863 job sites). Brief: `$SP/loop3/brief.md` (section SURVEYOR-2) under the Shared
rules of `$SP/packs/packs-brief.md` and the reactor loop of `$SP/packs/packs-brief-3.md`. Builds on SURVEYOR
(`docs/consoles/SURVEYOR.md`, `tools/sv_survey.mjs`) and the ASSAYER rubric (`tools/eval_worlds.mjs`).

## What it does

1. **Platform eval.** `node tools/eval_worlds.mjs` once, with the browser (AS_PORT=9025), post-processed into
   `$SP/loop3/eval.json` (subject scores, means per region, criteria totals, the worst findings) and a ranked list of the
   ten highest-impact next steps with evidence in `$SP/loop3/survey.md` (the coordinator's presentation reads both).
2. **The la-avex-new-iberia black triangle.** The shape in the top-left of the start capture was `mv-parked-cab`
   (MOTORWORKS' parked-vehicle cab, an InstancedMesh; instance 2) seen from below: the parishes app sets the eye 16 m on +z
   from a site (the start and fast travel), and `mvPlacements`' first ring (17 m) at bearing 0 is 1 m from that point, so
   the arriving camera stood inside a parked vehicle — its body culled from inside, the cab's underside drawn dark over the
   sky. Found by raycasting from the page's own camera through the top-left of the frame (`__parishTest.scene`). Fixed at
   source in `WebXR/shared/mv-world.js`: `MV_ARRIVAL_OFFSET`, `MV_ARRIVAL_CLEAR`, `mvArrivalPoint(site)`; a parked footprint
   keeps half its length + 3 m from every site's arrival point. The defect was systemic: 417 placement-tier instances
   (of 974, across the three tiers) covered an arrival point before, 0 after, and no map lost a vehicle.
   Proof: a `check_motorworks.mjs` line (every parked vehicle × every site's arrival point) and a re-capture with no shape.
3. **The French Quarter gallery faces the street.** DETAIL-2 hung the gallery on each quarter block's local +z face, but
   the massing turns every block by a random yaw, so +z faced the street on only 2,892 of 9,681 drawn gallery blocks
   (30 %). `dtGalleryFace(parish, spot)` in `WebXR/shared/dt-detail.js` picks the face the ray to the nearest street
   leaves the block through (CITYWORKS' `cwNearestLine`: the named roads and the generated fabric; no ferries or decks),
   cached per spot; the gallery's posts, deck, railings and ferns are laid in that face's frame. No new family, geometry
   or capacity. Proof: `check_detail.mjs` section 6b — every drawn block (after `cwMassFilter`, as the app builds) puts the
   gallery on the street face, its normal toward the street, and its deck nearer the street than the block's centre.
4. **Hammond against Sentinel-2.** CAPITAL's view came back empty: `s2view.py` picks the least-cloudy scene per MGRS tile,
   and for 15RYP (at the UTM zone edge) that was an orbit with no pixels over the box. A copy that ranks the tile's scenes
   by their cover of the box (`$SP/loop3/sv2/s2cover.py`, two calls in all) found a clear 2026-09-23 scene (the same one
   GEO baked the backdrop from). Corrected in `np-data-hammond-downtown.js`: Interstate Twelve straight east-west south of
   town; the I-55/I-12 interchange at the west edge with I-55 leaving the box to the north-west (it was drawn straight
   north-south through the middle of the west side); Highway Fifty-One north-south west of downtown (it was drawn a
   kilometre east); Thomas Street bending north-east past downtown towards the airport road; the rail line a little east
   of south through downtown; Railroad Avenue beside it; three sites, two landmarks, four anchors and two connector ends
   moved with their lines. No river crosses the box (the creek and canal stay procedural, and say so). No figure read off
   the image; no imagery committed.

## Seams

- `mvArrivalPoint(site)`, `MV_ARRIVAL_OFFSET` (16, app.js's `np.z = site + 16`), `MV_ARRIVAL_CLEAR` (3) in `mv-world.js`.
  If the app's arrival offset ever changes, change `MV_ARRIVAL_OFFSET` with it.
- `dtGalleryFace(parish, spot) -> { face, yaw, hw, hd, street }` in `dt-detail.js` (imports `cwNearestLine` from
  `cw-cityworks.js`; both are in the parishes bundle only). FACADES' own +z pieces (its gallery railing, shutters, awning
  and signs) can use it to face the street too.

## Cycles

Format: reason (the change and the check that proves it) → observed result.

0. Reason: bring the worktree to the loop's base; proof = HEAD hash. Act: `git merge --ff-only 684be2fb`. Observed:
   HEAD 684be2fb83ea. Pass.
1. Reason: the gallery sits on local +z, not the street; put it on the face toward the nearest street; proof = a
   check_detail line counting blocks. Observed: first run 468 pass / 1 fail — 46 of 9,868 decks not nearer the street;
   all 46 are Orleans blocks standing on a fabric street, which `cwMassFilter` removes in the app (never drawn). The check
   now judges drawn blocks: gallery checks pass, 9,681 blocks; the old +z rule faced the street on 2,892. Pass.
2. Reason: Hammond's roads were laid from general geography; correct them from imagery; proof = check_parish_data,
   check_parishes, check_geo green. Act: coverage-ranked Sentinel-2 view, roads/sites/anchors re-laid. Observed:
   30,820 / 0, 62,985 / 0, 90 / 0. Pass.
3. Reason: find the black triangle's mesh; proof = the raycast names it. Observed: `mv-parked-cab` instance 2, 1 m from
   the eye, face normal (0, −1, 0). Act: keep parked vehicles clear of every site's arrival point; proof = a
   check_motorworks line and a re-capture. Observed: 417 → 0 covering placements, 974 placements unchanged;
   check_motorworks 37 checks, 0 failed; the re-capture shows open sky. Pass.
4. Reason: the generator must stay in its time budget with the new gallery rule. Observed: check_detail median 12.1 ms
   CPU (budget 14); the re-timed worst 101.8 ms against 90 at load 9.5 (84.3 ms on the first run at a lower load); the
   gallery maps' warm worst chunks are 17–53 ms (nola-french-quarter-cbd 17.4), so the worst chunk is not a gallery
   chunk. Noise at load; see Left.
5. Reason: the platform eval for the presentation; proof = eval.json and survey.md by minute 30. Act: eval_worlds once
   with the browser (AS_PORT=9025), `mk_eval` into `$SP/loop3/eval.json` (means per region), the walker on six Louisiana
   maps. Observed: 51 subjects, mean 100, 5 findings; every region 100 except programmes 97 (sm-unspoken-smiles) and the
   platform subjects 99.6 (billing 98); walker 12/12 views without a page error, desktop 167k–246k triangles (2.6–3.8×
   Orleans' earlier walk), phone 39k–54k. Written at 17:25. Pass. The rubric scored 100 on both maps whose defects were
   fixed here, so it cannot see the picture (survey step 1).
6. Reason: give the walker eyes; proof = it flags the old la-avex placement and passes the fixed one. Act: sv_survey
   raycasts 28 rays through the upper half of the frame at arrival; under 2 m blocks. Observed: old placement → la-avex
   BLOCKED by mv-parked-cab at 0.8 m (desktop) and 0.77 m (phone); fixed → 0 of 4 views blocked. Pass.

7. Reason: re-run the generator's time gate; proof = check_detail green. Observed: 469 pass, 0 fail at load 11–12;
   median 11.7 ms CPU (budget 14), re-timed worst 51.3 ms (budget 90). The worst-chunk figure ranged 51–102 ms across
   three runs on the same code, so cycle 4's fail was load noise. Hammond's moved sites: check_harvest, check_walkable,
   check_parish_play, check_drills and check_treasures all green. Pass.

## Checkers (single checkers only; check_all never run or imported)

| checker | result |
|---|---|
| `check_detail.mjs` | **469 pass, 0 fail** (final, load 11–12); median 11.7 ms CPU, re-timed worst 51.3 ms |
| `check_parish_data.mjs` | 30,820 pass, 0 fail |
| `check_parishes.mjs` | 62,985 passed, 0 failed |
| `check_geo.mjs` | 90 passed, 0 failed |
| `check_motorworks.mjs` | 37 checks, 0 failed |
| `check_harvest.mjs` | 107 passed, 0 failed |
| `check_walkable.mjs` | 2,732 passed, 0 failed |
| `check_parish_play.mjs` | all pass |
| `check_drills.mjs` | all pass |
| `check_treasures.mjs` | all pass (1,120 treasures) |
| `eval_worlds.mjs` (once, browser) | 51 subjects, mean 100, 5 findings |
| `sv_survey.mjs` (6 + 2 maps) | 12/12 and 4/4 views without a page error; 0 eyes blocked after the fix |

## Left

- Fold the walker's eye check into eval_worlds' "loads" criterion and walk all 46 maps with it (this loop walked 8).
- FACADES' storefront pieces (signs, awnings, shutters, its gallery railing) still hang on the local +z face; the better
  fix is to turn the massing to its street (`np-parish.js` `rot`), then re-measure detail baselines (survey step 2).
- The other set-down points (walkable landings, interior exits, leaving a vehicle, drills, project sims) have no
  clearance check against placed objects (survey step 3).
- `$SP/geo/s2view.py` should rank scenes by cover of the box (the copy is `$SP/loop3/sv2/s2cover.py`).
- Hammond's creek and canal are procedural. The imagery shows no river in the box, so they were left alone.
- The committed dist was not rebuilt (the integration gate does that).
