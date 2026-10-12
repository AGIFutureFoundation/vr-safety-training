# Next for ROBO-EXTERIORS (`fx`): brief for the next console

Read `docs/consoles/ROBO-EXTERIORS.md` (Seams, Cycles, Left) and `docs/consoles/memory/ROBO-EXTERIORS.md`, then
`WebXR/shared/fx-exteriors.js`, `tools/check_exteriors.mjs` and `tools/drive_exteriors_page.mjs`.

## Do
1. **Neighbouring massing takes the robotics look.** Today only each robot site's own lot is a robotics building; the sheds and
   towers around it keep FACADES' generic kits. Add a kit resolver to `fc-facades.js` (e.g. `FC_KIT_RESOLVERS`, consulted when
   `fcDetails` buckets a spot) so sheds within about 150 m of a robot site take a robotics variant (roof plant, skylights,
   dock bumpers). New detail ids go into `FC_DETAIL_KINDS` and `fcDetailParts`; keep each kit cheapest-first.
   Check: `node tools/check_facades.mjs` (phone kit = the two cheapest, per-chunk budgets) and `node tools/check_exteriors.mjs`.
2. **Wire ROBO-INTERIORS' doors to the exterior doors.** `fxDoorFor(parish, siteId)` gives the building's door and the spot
   1.4 m outside it; the interior's entrance for that site should open there (the INTERIORS door pattern in
   `WebXR/parishes/js/app.js`, `ixDoors`). Check: a headless walk from the pad to the door and inside, page errors 0.
3. **DETAIL's scatter inside the lots.** `dt-detail.js` scatters props per chunk without knowing the lots; read
   `fxColliders(parish)` and skip candidates inside a lot. Check: `node tools/check_detail.mjs` (the generation median stays
   inside its budget; report the load beside it — it is judged only on a quiet machine).
4. **The night look.** The skin's lit-window mask switches on ATMOS's clock (`atLightsOn`); the phone tier has no lit windows.
   If wanted on phones, add a few emissive quads in the body mesh (no texture) and prove the mesh count stays 1.
5. **Captures for the reel.** `node tools/drive_exteriors_page.mjs 9094 high <dir>` writes the twelve establishing shots and a
   night shot per map; the reel opens `parishes/dist/parishes.html?parish=<map>&scene=<siteId>:<wide|door>` directly.

## Rules that bind this work
- Phone and headset budgets do not change; high detail goes into the desktop `high` tier inside `FX_BUDGET` (meshes per site
  1/2/2, triangles 1,500/7,000/7,000, texture bytes per map 0/1.5 MiB/6 MiB) and the site's chunk stays inside `FC_BUDGET`.
- Procedural only; pictogram-only signs (no words); nothing names a company, union or trade body; generic by kind.
- Single checkers only; never run `tools/check_all.mjs`; never commit `docs/perf/checkers-last.json` or measured timings.
