# ACCESS — memory

- Door spots are the parishes app's: `ixDoorSpot(cwDoorOf(parish, cwSiteBuilding(parish, i)))`. `accEntrances` reuses them, so
  a marked door and the E prompt are at the same place.
- On several maps a street polyline runs under a site footprint (Orleans' Treme kitchen: the nearest line to the building
  centre is 0.47 m away). A route test must skip street points under any footprint.
- `cwSiteBuilding().y` is the ground height at the site's position; across all 46 maps the door spot's ground matches it to
  within 2 cm, so no ramp is needed anywhere today. Keep the ramp path: it runs when the terrain or a plinth changes.
- SF Marina and parts of Golden Gate Park and Mission have site buildings with no CITYWORKS line within 400 m.
- CLASSROOMS (`cr-classrooms.js`) registers its dresser on the KIND style (`IX_KIND_STYLE[kind]`); mapping a site to a new
  style through `IX_SITE_STYLE` would drop its fixtures, so its sites are skipped (`crRoomsFor(parish)`).
- `check_interiors` picks the first fire station with stations and expects `apparatus-bay`: it does not import
  `acc-access.js`, so registering site styles in the app (not at module load) keeps it true.
- The app's touch Use button, the pad's A and E all call `npUse()`; only the XR select was missing.
- Worktree isolation refuses compound shell commands with variables or heredocs piped to tools; write scripts to the scratchpad
  and run them with plain arguments.
- `check_acc` reads about 10 s; `check_parse` is several minutes on the shared machine.
