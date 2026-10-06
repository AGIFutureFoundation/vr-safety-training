# ROBOSCENARIOS — next

1. Side-game boards for the two new scenarios in `rb-world.js` `RB_GAME_MECHANICS` (`rb-construction-drilling`, `rb-port-gantry`):
   the port yard lost its board when its scenario changed (`rbGamesFor` filters on the mechanics table). Rules: ≥ 3 steps, exactly
   one safe option, no digits, gated on the site's station (`check_robotics` 10).
2. VBRIDGE: decide whether the lane and drilling scenarios join `VB_TASKS` (gantry and cobot rig limits exist); until then
   `vbProviderCompare` skips them by design.
3. ROBOTRAIN-3's pad (`rtMountTeleop`) takes a task: the pendant (`RT_TASKS["rb-construction-drilling"]`) and joystick
   (`RT_TASKS["rb-port-gantry"]`) mappings are ready; a HUD line each.
4. A mast-on-a-carrier rig type for the drilling robot (`rbDrawRig` + `check_robotics` 8b's type table) — the deck draws the cobot arm now.
5. Headless drive of `?parish=la-meta-richland` to see the new site mount (budget 7 meshes, phone ≤ 3) — not run in loop 7.
