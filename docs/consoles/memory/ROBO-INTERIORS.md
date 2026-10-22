# ROBO-INTERIORS memory

- Loop 10, base 43d3e3f6. Prefix `ixr`, port 9093. Module `WebXR/shared/ixr-robo-interiors.js`; six style keys in
  `ix-interiors.js` (`IX_STYLES`, `IX_FEATURES`, data only); checker `tools/check_robo_interiors.mjs` (headless ~1.5 s;
  `--browser` opt-in with `IXR_PORT`, `IXR_PAGE`, `IXR_TIERS`, `IXR_SHOTS`, `IXR_REPORT`).
- Site → style: soma cell → `ixr-cell-hall`, San Jose lab → `ixr-cobot-lab`, West Oakland warehouse → `ixr-amr-warehouse`,
  West Oakland port → `ixr-port-control`, Richland drilling → `ixr-drilling-deck`, Orleans warehouse (the second warehouse in
  `RB_SITES` order) → `ixr-maint-bay`.
- Robot site ids are NOT in `IX_SITE_STYLE` (check_la_rooms proves every id there is a Louisiana site); the app passes the
  style explicitly through the door record (`{ style }`), like TYCOON's rentals.
- Props: parts `[tag, kind, w, h, d, x, y, z, colour, deco]`, one InstancedMesh per kind (c box, m brushed metal, g guard mesh,
  r cylinder, e unlit lit-strip). A part with bottom < 1.9 m and top > 0.5 m becomes a collider; `e` parts never do.
- Textures: floor canvas per room (marks in room metres; canvas top = back wall, left = −x), concrete/metal/mesh cached per
  page by name@res and cloned per use (one image, one upload). Headless, a stub `Texture` with `image = { width, height }`
  keeps the byte measurement honest. INTERIORS' `exit()` disposes maps; three.js re-uploads on the next use.
- Gotchas: metalness without an environment map renders near black (use ≤ 0.15); the guard mesh needs `transparent` +
  low `alphaTest` or it vanishes at distance once mips average the wire away; anything on the right wall at fx 0.99 stands
  0.2 m off the wall, so a plane on the wall sits behind it; the HUD fills `hud-prompt` on a 0.25 s tick after `np.near`
  changes (0.5 s tick) — wait for the text, not just `np.near`.
- The dist bundle (`WebXR/parishes/dist/parishes.html`) was rebuilt locally for the drive and restored; the coordinator
  regenerates it (every console edits app.js).
