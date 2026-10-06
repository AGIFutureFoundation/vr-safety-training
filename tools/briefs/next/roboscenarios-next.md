# ROBOSCENARIOS — next

1. Station wrappers (`rb-station-*` over the catalog Session) for `rp-construction-drilling-robot-setup`, so the robot learns the
   station's own episodes as the three existing wrappers do (COLEARN's station feature table; 10 held-out seeds).
2. VBRIDGE: decide whether the lane and drilling scenarios join `VB_TASKS` (gantry and cobot rig limits exist); until then
   `vbProviderCompare` skips them by design.
3. ROBOTRAIN-3's pad (`rtMountTeleop`) takes a task: the pendant (`RT_TASKS["rb-construction-drilling"]`) and joystick
   (`RT_TASKS["rb-port-gantry"]`) mappings are ready; a HUD line each.
4. A mast-on-a-carrier rig type for the drilling robot (`rbDrawRig` + `check_robotics` 8b's type table) — the deck draws the cobot arm now.
5. Headless drive of `?parish=la-meta-richland` to see the new site mount (budget 7 meshes, phone ≤ 3) — not run in loop 7.
