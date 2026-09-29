# CLEANPORTS — next

1. When BAYMAP merges: run `node tools/check_cleanports.mjs` — its places line should read "against the merged map";
   confirm the parishes app shows the six stations at the West Oakland port sites and the five drivables on the Motor Pool board.
2. BAYQUEST's `bq-zero-emission-yard-shuffle` should use `cp-electric-yard-tractor` / `cp-electric-top-pick` /
   `cp-electric-straddle-carrier`, gated on `cp-zero-emission-terminal-equipment-pre-use`.
3. BAYKEEPER's hub should read Clean Ports figures from `CP_FACTS` (`cpCleanPortsFacts()`), not restate them.
4. The ladder gives the WOJRC track 20 generated levels; `CP_PATHWAY_LEVEL` names the zero-emission careers level as data
   and the programme summary carries the sourced line. If the track page should show it as its own level, extend
   `tools/gen_tracks.mjs` to read `CP_PATHWAY_LEVEL`.
5. Fix `tools/briefs/drive_one.mjs` (missing `pro/helpers.mjs`, `#enter-flat` selector) and drive the six stations in the browser.
