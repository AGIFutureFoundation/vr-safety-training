# TERRAFORM — memory (the Packs run)

- Base d85a41f (the worktree started on 589f0d8 and was reset per the brief). Prefix `tf`, port 8980.
- Modules: `tf-water.js` (import-free: wind, motion, water ripple), `tf-terraform.js` (pure: streams, ditches,
  culverts, channel cut + wet strip on `NP_TERRAIN_HOOKS`, depth, flow, cover, litter), `tf-world.js` (three.js mount).
- Engine touch: `np-parish.js` exports `NP_TERRAIN_HOOKS = { cut, wet }` (null = unchanged field); `npHeightAt` calls
  `cut` before the levee rise, skipped where a levee rises; `np-world.js` darkens ground by `wet`.
- Mounts: parishes app (`tfMountTerraform`, `__parishTest.terraform`), Redwood Reach river (`tfAnimateWater` with a
  per-vertex `tfFlow`, source to mouth). Bundler lists carry the tf modules.
- Checker `tools/check_terraform.mjs` in `check_all` and the baseline (30 s).
- Eval before: `eval_worlds` mean 98 (parishes 100 ×5, SF districts 97 ×5).
