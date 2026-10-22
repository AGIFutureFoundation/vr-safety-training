# CITYWORKS — next brief

Read `docs/consoles/CITYWORKS.md` (plan, seams, log) and `docs/consoles/memory/CITYWORKS.md` first.

1. **Kits off the streets.** `kwDressParish` has no filter option today; Pass `cwMassFilter(parish)` (or a `cwSidewalkAt`/carriageway test) to `kwDressParish` so
   KREWE's porches and props never stand on a street or sidewalk; extend `check_cityworks.mjs` to hold it.
2. **Enterable site buildings.** A door gap in the site building's collider (`door` already names the face) and a
   simple interior floor, so the walk can enter where the pad faces the road.
3. **Seams after the merge.** Close NEWTON's `nwWorld({ colliders })` on `cwColliders`, MENAGERIE's `sidewalkAt` on
   `cwSidewalkAt`, and route NEWTON's drive mode on `cwRoadGraph`; add those callers to the checker's mount checks.
4. **Checker time.** `check_cityworks.mjs` takes ~60 s on a quiet box (ten maps × 256 chunks of colliders and a two-tier
   build at every site); sample chunks with buildings only if the gate needs it faster.
