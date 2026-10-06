# KREWE memory

- Base a643c66 (reset from 589f0d8). Prefix kw; port 8992; temp $SP/bayou/krewe/ (smoke.mjs = browser smoke).
- Ids fixed in docs/consoles/KREWE.md: five kiosks kw-sandbag-relay, kw-pump-startup, kw-floodgate-closeout,
  kw-container-sort, kw-ferry-lineup; ten quests kw-q-*; lesson slots are BAYOU's K-12 stations k12-by-<topic>
  (reconciled 23:45; pending in CURRICULA until BAYOU merges)
  (KW_BAYOU_LESSONS). Every gate station verified in WebXR/smartcity/js/curricula.js CURRICULA (union, not classroom).
- Modules: WebXR/shared/kw-kits.js (13 builders + kwBakeKit + kwDressParish), kw-place.js (pure placements, KW_CAPS,
  KW_TRI, KW_DRESS_BUDGET 13 draws / 45k tri), kw-play-data.js (KW_KIOSKS = KW_GATED, KW_QUESTS, kwKioskSpots,
  kwGriotSites, kwQuestBoard / kwMountQuestBoard).
- Touched shared files: side-games-data.js qmRounds (appends `calls`), check_gates.mjs (run length counts calls),
  check_fleet.mjs (KITS), check_all.mjs, bundle_webxr.py (parishes block), parishes/js/app.js, parishes.html,
  gate-names-data.js (regenerated), parishes/dist/parishes.html (rebuilt with `python3 tools/bundle_webxr.py parishes`).
- Measured: check_krewe 1,063 checks; worst site with dressing Orleans 184 meshes / 99,349 tri headless; in the page
  236 meshes / 90,913 tri (1280×720, high). check_fleet 143 builders; check_gates 6,432/0; check_parish_play 3,933/0;
  check_parishes 6,461/0; check_npc and check_drivables green.
- The worktree isolation refuses bash with `$var` in sed args, heredocs with backticks, and `cd && git a && git b`
  chains: write python edit scripts to the scratchpad and run them; one git command per call.
