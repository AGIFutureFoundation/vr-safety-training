# EASTBAY memory

- Base 793d16d. Three maps: `oak-emeryville-berkeley` (oakland), `bay-san-pablo` (north-east-bay), `bay-san-jose`
  (south-bay); 13 sites each; generator `$SP/packs/eastbay/gen_eb.mjs` (the modules are the source of truth now).
- West Oakland carries the mirror `eb-wo-san-pablo-avenue-north`; check_parishes' BAYMAP block allows that one `eb-wo-` id.
- Regenerated `st-stories-data.js` (gen_st_stories), `cg-units.js` (gen_cg_units) and the homepage (gen_home).
- Not done: the dist bundles (`python3 tools/bundle_webxr.py`, the coordinator's gate — check_home reports dist stale),
  PACKS' generated pack manifests (gen_packs) for the new sites, play-layer field lessons for the eval's last point.
