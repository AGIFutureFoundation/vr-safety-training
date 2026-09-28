# GOLDEN-B-2 brief — the San Francisco districts, one phase further

Read first: `docs/consoles/GOLDEN-B.md` (the connector contract and schema decisions), `docs/consoles/memory/GOLDEN-B.md`,
`docs/parishes.md` (the San Francisco section and the `world` connector), and GOLDEN-A's log for the region and hills
engine. Prefix `sg`; the district data modules are `np-data-sf-*.js` (np/NP_ names).

## Where GOLDEN-B left it (measured)
- Two districts on the parish schema with `region: "san-francisco"` and `hills`: **sf-marina** (Marina & Presidio, 10
  sites, 13 roads, 8 districts, 12 landmarks, 4 connectors, 5 lessons, 2 gated) and **sf-bayview** (Bayview & Hunters
  Point, 11 sites, 11 roads, 10 districts, 10 landmarks, 2 connectors, 5 lessons, 2 gated). Both at about 2.05 real
  metres per map metre, anchor residual 0.6 m; headless high tier 49 chunks, worst ~146 meshes / ~63 k triangles.
- Every station of `hunters-point-bay-restoration` (the C.L.E.A.R. clean-up programme) is worked at one of Bayview's
  shipyard, soil cell, groundwater yard, shoreline crew, Heron's Head or Yosemite Slough sites.
- Connectors to GOLDEN-A's districts (`sf-van-ness-north`, `sf-embarcadero-north`, `sf-park-presidio`,
  `sf-third-street-south`, `sf-bayshore-south`) were *pending* at hand-back: GOLDEN-A's modules were in a parallel
  worktree. `sf-golden-gate-bridge` stays pending by design (a way out north to `marin-headlands`, no map yet).
- **The Bay Bridge** (`sf-bay-bridge`, kind `world`) lives in `shared/sg-ways.js`, keyed to sf-downtown; check_parishes
  tests it on a stand-in Downtown until GOLDEN-A's module is registered, then on the real one. Bay World's Atlas and map
  carry the way back (`parishes.html?parish=sf-downtown`).
- check_parishes, check_parish_data, check_k12 (section 8e), check_treasures, check_gates, check_home, check_seo and
  check_guide green in the worktree; check_links gained section 9 (the Bay Bridge in both layouts, a crossing loaded).

## Phase 2
1. **After the merge, close the pairs.** Once sf-downtown / sf-mission / sf-golden-gate-park are registered, the
   checker holds both ends within 2 km; if a gap prints, adopt the `to.position` it suggests on whichever side is off.
   Confirm the Bay Bridge's `from` end lands on sf-downtown's shore (it is projected from −122.387, 37.790 and clamped
   into the field) and give it a bridge deck road east over the bay in Downtown's module (GOLDEN-A's file).
2. **Hills in the scene.** With GOLDEN-A's `npHeightAt` mounds in, re-run check_parishes: every SF site is held outside
   `radius + 40` of every hill, so pads stay flat; tune heights so the Presidio Heights and Bayview Hill read from the
   harbour and the shipyard.
3. **The page title and controls line follow the region** (`document.title`, `ctlMount({ world })` in
   `parishes/js/app.js` still say "New Orleans Parishes") — GOLDEN-A's selector change; check it covers SF.
4. **Treasures in the scene.** `gen_treasures` writes a Fog-Day Kit off every SF site and the ten lessons as Field
   Scholar finds, but the parishes app mounts no treasure watcher at all (`tzWatchWorld("parishes", { at:
   slTreasureAt(parish) })` is not called anywhere) — mount it once for every district and parish.
5. **A kit for the bay.** A bridge tower and cable profile for the Golden Gate landmark, sailboat masts in the harbour,
   gantry cranes on the shipyard's dry docks, a rescue station's slip; `kit.js` patterns inside the mobile budget.
6. **Marin Headlands** as the district beyond the Golden Gate, or a Bay World-style world way north, so
   `sf-golden-gate-bridge` resolves.
7. **The home capture.** `WebXR/home/img/sanfrancisco.jpg` faces a job board at the harbour; re-capture looking over
   the Marina Green at the bridge once the landmark has a model (`HM_ONLY=sanfrancisco node tools/capture_home_thumbs.mjs`).
