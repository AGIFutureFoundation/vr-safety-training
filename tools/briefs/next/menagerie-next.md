# MENAGERIE — next brief

Where the Packs run left street life (`WebXR/shared/mg-life.js`, `tools/check_menagerie.mjs`, docs/consoles/MENAGERIE.md).

1. **Close the CITYWORKS seam at the merge.** The parishes app reads `globalThis.cwSidewalkAt` / `globalThis.cwColliders`
   in `mgRemount()`; in the bundle module-scope functions are not globals, so import `cwSidewalkAt` and `cwColliders`
   from CITYWORKS's module and pass `(x, z) => cwSidewalkAt(parish, x, z)` and `(key) => cwColliders(parish, key)`.
   `check_menagerie` already proves both are honoured with stubs; re-run it on the merged tree.
2. **Close the NEWTON seam.** Pass the parish drive mode's vehicle positions as `threats` (today
   `globalThis.nwVehiclePositions?.(parish)`), so animals flee and passers-by step aside from a driven vehicle.
3. **Crosswalks from the road graph.** When `cwRoadGraph(parish)` exists, cross at its junction nodes near sites instead of
   the nearest road point, and hold a crosser at the kerb while a threat is on the crossing.
4. **Cache day and night plans** (Orleans plans in ~300 ms; the T key re-plans on the night switch).
5. **Wind (TERRAFORM).** Gulls and pelicans can bank into `tfWind(t).dir`; flocks stay on the ground in a strong gust.
6. **Bay World's older pedestrians** (`bwCreatePedestrian`, one per third site) could move onto mg-life's walkers so there
   is one population; keep `bwApp.pedestrians` for the quests that read them.
7. **A sighting game.** `userData.wildlife`-style tags per kind would let the Field Guide eggs count a heron or a sea lion.
