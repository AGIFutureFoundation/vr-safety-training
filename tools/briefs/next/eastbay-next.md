# EASTBAY — next

1. Play-layer field lessons for `oak-emeryville-berkeley`, `bay-san-pablo`, `bay-san-jose` (the eval's completable 4/5,
   shared with every Oakland map): wire the maps' `fieldLessons` into the play layer the way GOLDEN-B's `sg-sf-play.js` does.
2. Rebuild the bundles (`python3 tools/bundle_webxr.py`) and regenerate the packs (`node tools/gen_packs.mjs`) at the gate.
3. When LANDMARKS' `lmBuild` registry lands, map the landmark kinds used here (`pier`, `tower`, `station`, `port`, `hill`)
   to registry kinds where one fits.
4. Neighbours to build next: `bay-santa-clara` and `bay-peninsula` (the San Jose ways out already name them), and the
   rest of the San Pablo Bay shore in `north-east-bay` (clear of `bp-strip-marsh-east`).
