# DRILLS — next brief

1. DEAN: when `dn-modules.js` lands, concatenate `drDeanModules()` into `dnModules()` and let `dnApplyModule(world)` open an
   assigned drill (`drill:<id>` → `drWorld.open(id, launch.site)`); add a `[dean]` line to check_drills for the merged list.
2. SCHOLAR: report a finished drill as a session (`scStartSession("drill:<id>", { parish, site })`) for classroom groups.
3. STORYLINE: list the path's drills inside the side-story panel (today they sit in the menu under "Scenario drills").
4. TERRAFORM: drive the flood drill's water from `tfWaterDepthAt` along the site's nearest channel instead of the drill's own
   plane (keep it one mesh, none on the low tier, still under reduced motion).
5. NEWTON: after a crash, open the traffic drill directly at the crash point when the map has no traffic placement.
6. Redwood Reach / Bay World: a wildland (wildland-urban-interface) and a waterfront drill using the same data shape.
