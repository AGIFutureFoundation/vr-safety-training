# KREWE-2 brief — the parish kits, kiosks and side quests, one phase further

Read first: `docs/consoles/memory/KREWE.md`, `docs/consoles/KREWE.md`, the KREWE section of `tools/briefs/bayou-brief.md`
with its Shared rules, the Crescent Facts rule for New Orleans, `docs/skill-gates.md`. Prefix `kw`; modules
`WebXR/shared/kw-kits.js`, `kw-place.js`, `kw-play-data.js`; checker `tools/check_krewe.mjs` (in check_all).

## Where KREWE left it (measured)
- 13 procedural kits (streetcar, pump station house with discharge pipes, floodwall section, floodgate, shrimp boat,
  oyster lugger, shotgun-house block, live oak with root buttresses, bandstand, parade barrier run, ferry landing, kiosk
  board, sandbag pallet), held by `check_fleet` (143 builders) and `check_krewe` (triangles counted from the builders'
  own geometry and confirmed on the vendored three.js).
- Placement by district character and site kind in all five parishes: Orleans 109 kits / 13 draw calls / 29,208 tri,
  Jefferson 33, St. Bernard 41, Plaquemines 21, St. Tammany 71. Worst site with the engine: Orleans 184 meshes /
  99,349 tri headless (260 / 400,000 budget); in the page at 1280×720 high 236 meshes (sky, wildlife and HUD included).
- 5 kiosks (`kw-sandbag-relay`, `kw-pump-startup`, `kw-floodgate-closeout`, `kw-container-sort`, `kw-ferry-lineup`) in
  the side-game contract (KW_GATED, discovered by check_gates), each behind union stations, scored on safe practice with
  three kiosk-specific calls, rewarding a cosmetic and a derived stamp; listed on the side-game panel and site boards.
- 10 side quests (lesson → union station → game) on BAYOU placeholder lesson ids `by-<topic>`; a quest board on the
  parish menu (`#menu-krewe`).

## The next phase
1. **Reconcile BAYOU's lesson ids.** Replace the placeholders in `KW_BAYOU_LESSONS` and the ten `kwMakeQuest` rows with
   BAYOU's merged ids; make `check_krewe` resolve each lesson in BAYOU's station list (`CURRICULA` classroom audience or
   BAYOU's flow ids) instead of the placeholder pattern; link the lesson row on the quest board to the lesson opener.
2. **GRIOT at the kiosks.** When the parish `grMount` lands, pass `[...kwGriotSites(parish), ...parish.sites]` so a
   character stands at every kiosk (Jefferson's pump site is kind `pumping-station`, which no character matches), and
   add a `check_npc` or `check_krewe` assertion that each kiosk has a figure within ten metres.
3. **The sandbag relay's drive.** Once MOTORPOOL's board is mounted in the parishes (`dvMountMotorPool`), start the relay
   from the kiosk: take the `flatbed-truck` out beside the kiosk, drive to the sandbag stacks, and score the pre-trip and
   spotter calls in the same run.
4. **Kiosk games in the world.** Walking up to a kiosk board (4 m) should open that kiosk in the side-game panel
   directly (an `open(id)` on `qmMountSideGames`' return, one line in the app), and a pin on the HUD map at each kiosk.
5. **Massing hook.** Let np-world's massing take a kit geometry per character (`opts.massGeo`), so a quarter or suburb
   district can swap some generic houses for `kwShotgunBlock` and garden avenues' generic oaks for `kwLiveOak`, without
   adding draw calls.
6. **More sites, same budget.** St. Tammany has no kiosk; add one (a staging-yard roll-out load plan or a lakefront
   debris sort) and give Plaquemines its pump and floodgate kits where its data has such sites. Keep every parish
   inside `KW_DRESS_BUDGET` and the worst site under 200 meshes / 150,000 triangles on high (PARISH-2's bar).

## Bars to hold
`node tools/check_krewe.mjs`, `check_fleet`, `check_gates`, `check_parish_play`, `check_parishes`, `check_npc`; rebuild the
parishes bundle (`python3 tools/bundle_webxr.py parishes`) after any change to the app or the kw modules; the full
`check_all` once at the end.
