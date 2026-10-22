# MOTORWORKS — next

1. Parked vehicles as NEWTON heavy bodies (static until hit) so a drive into one is a crash, not a pass-through;
   the instanced matrix follows the body.
2. A vacuum truck in the Motor Pool registry (MOTORPOOL: entry, builder, gate on a stormwater station) and swap it
   in for the stormwater rule's water truck.
3. Watercraft at marinas once NEWTON has a water drive (helm) mode — `dvStepHelm` already exists.
4. Close the PALETTE seam in app.js (`categories: PA_CATEGORIES`) after the merge; add CITYWORKS' generated street
   fabric (`cwStreets`) to the road-clearance test for the New Orleans parishes.
5. Near-ring full builders (dvBuild) behind a weight decision for the parish bundle.
