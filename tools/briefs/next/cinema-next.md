# CINEMA — next phase

The homepage, world start screens, track pages, the Bay Atlas header, the Holodeck landing and the sign-in backdrop now play loops recorded in the platform's own worlds (docs/home-backgrounds.md). Measured today: hero 0.88 MB MP4 / 0.55 MB WebM at 1280×720; cards 0.16–0.89 MB MP4 at 960×540; every loop 8.8 s at 24 fps; 15 slots in `WebXR/home/media/backgrounds.json`, 5 distinct clips.

## Brief for the next team

1. **Licensed or generated footage where the engine look is thin.** Fairway Park (bare plain, 0.16 MB — little detail to encode) and the Deep (no light shafts in the engine) gain most. Follow docs/home-backgrounds.md: CC0 / CC BY / purchased, credited, `kind: "licensed"`; the credit line appears automatically. No real brands or identifiable people.
2. **Give the surfaces their own clips.** Atlas header, sign-in, Holodeck landing and `track-default` reuse the hero; record a Holodeck course loop and an Atlas map pan. Track pages: all 60 programmes are on a Bay World board today, so every band shows the Bay World card loop — a per-district clip (port, downtown, hills) keyed from the programme's first Bay World site would make the bands distinct.
3. **Make the recorder a tool.** It lives in a scratchpad today (a three.js wrapper hooking `Object3D.onBeforeRender`, a stepped clock, per-slot camera paths). Commit it as `tools/record_backgrounds.mjs` with the slot paths in data, so a world change re-records with one command.
4. **Engine-side realism for the recordings:** anti-aliasing (FXAA pass) in capture mode, a warmer dusk band (the dusk sky reads purple), light shafts in the Deep, sailing yachts in the Regatta fleet.
5. **Budget watch:** first paint fetches the hero loop only; hold the hero ≤ 2.5 MB and cards ≤ 1.2 MB per file (check_home enforces both).
