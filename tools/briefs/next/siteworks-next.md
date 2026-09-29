# SITEWORKS — next

1. After the batch merge, re-run `node tools/gen_sw_sites.mjs`, then `gen_treasures`, `gen_home`, `gen_guide_kb` and
   the bundler; the generator only rewrites its `// sw:begin … // sw:end` block in each map's `sites`.
2. check_links' browser phase was cut short under load in this worktree (its 21146 static checks passed); run it
   whole at the gate.
3. Orleans sits at 248 of 260 meshes with KREWE's dressing: site buildings are three meshes each; instancing the
   site houses, boards and posts in np-world.js would free room for more sites everywhere.
4. Plaquemines is capped at 21 by dry room; more sites there need a marsh-platform site type the engine can pad on
   wetland (and KREWE's pump house given its own dry test).
5. The SF districts' play layer has no field lessons for the new sites (eval_worlds' SECONDLINE → BAYOU finding
   predates this run).
