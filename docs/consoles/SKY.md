# Console SKY — skybox, live weather and wildlife

Team: SKY · Brief: `tools/briefs/sky-brief.md` (with `console-brief.md`) · Branch: `claude/vr-ar-safety-training-wkwmve`

- 18:33 UTC · Run opened; fetched and fast-forwarded to 8bfb0f6; read the briefs, weather.js, environment.js, bayworld.js (bayLighting, buildBayWorld), bayworld/js/world.js + app.js, fairway.js, gen_bay_quests.mjs, check_fleet.mjs, bundle_webxr.py · next: sky.js and wildlife.js.
- 18:38 UTC · Plan: sky.js imports only weather.js (fairway's bundle has no bayworld.js) and takes a bucket or an hour; wildlife.js takes a plain rectangle zone so it imports no world data; Field Guide eggs go in their own FIELD_GUIDE_EGGS array (kind "egg", method "sight") because check_bay_quests requires every EGG_QUESTS entry to quote a station step verbatim; the dive game and the regatta are absent from this worktree, so sky.js documents the skyFor hook instead of editing them · next: write the modules.
