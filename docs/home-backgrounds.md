# Background loops (homepage and UI)

The homepage hero, the six world cards, every world's start screen, the programme track pages' header band, the Bay Atlas header, the Holodeck landing and the sign-in dialog's backdrop play short, muted, looping background videos. Console CINEMA built the layer (`docs/consoles/CINEMA.md`); CINEMA-2 made the recorder a tool, added Sierra Summit and Redwood Reach, and keyed the track bands to the world each programme is anchored in (`docs/consoles/CINEMA-2.md`).

## What ships today

Every slot is **recorded in the platform's own worlds** (`kind: "in-game"`). None of it is stock or generated footage: stock-footage sites were not reachable from the build environment and no video-generation credits were available.

| File | Where it was recorded | Size |
|---|---|---|
| `hero.mp4` / `hero.webm` | Bay World at dusk: a slow sideways move over the estuary, toward the downtown towers | 1280 × 720 |
| `bayworld.mp4` / `.webm` | Bay World at dusk: a slow push toward the Port Container Terminal's gantry cranes | 960 × 540 |
| `underwater.mp4` / `.webm` | The Deep: a slow orbit round the diver and the dive buddy on the seabed, under sunbeams drawn at capture time | 960 × 540 |
| `regatta.mp4` / `.webm` | Bay Regatta: a slow orbit round the race fleet, late afternoon | 960 × 540 |
| `fairway.mp4` / `.webm` | Fairway Park: a slow move beside the first tee, looking down the hole | 960 × 540 |
| `summit.mp4` / `.webm` | Sierra Summit: a slow drift over the reservoir from the shore trees toward the gondola ridge | 960 × 540 |
| `redwood.mp4` / `.webm` | Redwood Reach: a slow push between the trunks of the old-growth stand | 960 × 540 |

Each loop is 8.8 s at 24 fps, H.264 MP4 (faststart, no audio) plus a VP9 WebM that browsers without H.264 pick first, and a JPEG poster taken from its first frame. Budgets, held by `tools/check_home.mjs`: the hero ≤ 2.5 MB per file, every other slot ≤ 1.2 MB per file.

### How they were made: `tools/record_backgrounds.mjs`

```sh
node tools/record_backgrounds.mjs --list              # the shots
node tools/record_backgrounds.mjs summit redwood      # record and encode into WebXR/home/media
node tools/record_backgrounds.mjs summit --probe      # stills of the probe poses only
node tools/record_backgrounds.mjs summit --encode     # re-encode frames already recorded
```

1. The tool serves `WebXR/` on the console's port (`CN_PORT`, default 8997) and opens the world's single-file bundle in headless Chromium with the high texture tier. three.js is answered through a small wrapper that hooks the scene's `onBeforeRender`, so a scripted camera path replaces the game camera without editing any game code. `requestAnimationFrame`, `performance.now` and `Date.now` are stepped by exactly 1/24 s per frame, so the frames are evenly spaced however slow the software renderer is. Every DOM overlay is hidden; only the WebGL canvas is captured.
2. Every shot is data in `tools/record_backgrounds.json`: the page, the buttons that leave its menu, the size and length, a `dolly` (from/to poses) or an `orbit` (centre, radius, angle, height) path, the grade, and the world hooks it needs. The hooks live in the tool by name: `bay-dusk` sets Bay World's clock to 18:33 and thins its fog so the skyline reads; `summit-follow` and `redwood-follow` keep the player under the camera so the chunked terrain streams round it; `regatta-fleet` orbits the live centre of the fleet at 17:36; `deep-sunbeams` adds soft camera-facing light columns from the surface round the diver, in the capture only.
3. `ffmpeg` grades each sequence (a gentle S-curve, a named colour balance — dusk, warm, sea, alpine, forest — a soft vignette, fine temporal grain, a 0.55 px blur against aliasing), crossfades the last 1.2 s into the first frames so the loop has no seam, and encodes the MP4, the WebM and the poster.

A slot written `name:probe` takes stills in the same run as recordings (one server, one port); frames go to `CN_FRAMES` (the session scratchpad by default). The recorder is not part of the repository's checks.

## The one file to edit: `WebXR/home/media/backgrounds.json`

```json
{ "slot": "regatta", "surface": "homepage Bay Regatta card",
  "src": "regatta.mp4", "webm": "regatta.webm", "poster": "regatta.jpg",
  "kind": "in-game", "credit": "Recorded in Bay Regatta: the race fleet",
  "licence": "Project-owned recording of this repository's own world; no third-party footage" }
```

- `slot` — the surface's id. The homepage uses `hero`, `bayworld`, `underwater`, `regatta`, `fairway`, `summit`, `redwood`; the start screens `start-<world>`; the track pages `track-bayworld`, `track-underwater`, `track-summit`, `track-redwood` and `track-default`; plus `atlas-header`, `signin` and `holodeck-landing`.
- **Which world a track page shows** (`trackWorld` in `tools/gen_tracks.mjs`): the world whose job boards and dive sites host the most of the programme's stations, read from the worlds' data. Every programme is on a Bay World board, so a tie goes to the more specific world — the Deep, then Sierra Summit, then Redwood Reach; a programme with no station in any world takes `track-default`. Today that is 42 Bay World, 6 Deep, 5 Summit, 2 Redwood and 5 default bands.
- `src`, `webm`, `poster` — plain file names in `WebXR/home/media/`. `webm` is optional.
- `kind` — `"in-game"` or `"licensed"`. A `licensed` slot shows its `credit` as a small line on the page.
- `credit`, `licence` — required for every slot.

Several slots may point at the same files; give a surface its own clip by giving its slot its own files.

## Dropping in licensed or generated footage

1. **Get the rights first.** Acceptable: CC0; CC BY (credit required); a purchased stock licence that allows use on a website; footage you shot or generated yourself under terms that allow this use. Keep the licence text or receipt with the project's records. No footage showing real brands, logos or identifiable people without releases.
2. **Cut and encode** to the slot's size (1280 × 720 for `hero`, 960 × 540 for the others), 8–12 s, no audio, with a seamless loop:

   ```sh
   # in.mp4 → a 10 s loop whose last 1.2 s crossfades into its first frames
   ffmpeg -i in.mp4 -filter_complex "[0]scale=960:540,fps=24,trim=0:11.2,setpts=PTS-STARTPTS,split[a][b];\
   [a]trim=start=1.2,setpts=PTS-STARTPTS[A];[b]trim=end=1.2,setpts=PTS-STARTPTS[B];\
   [A][B]xfade=transition=fade:duration=1.2:offset=8.8,format=yuv420p[v]" \
     -map "[v]" -an -c:v libx264 -preset slow -crf 25 -movflags +faststart slot.mp4
   ffmpeg -i slot.mp4 -an -c:v libvpx-vp9 -crf 38 -b:v 0 slot.webm
   ffmpeg -i slot.mp4 -frames:v 1 -q:v 5 slot.jpg
   ```
3. **Put the files** in `WebXR/home/media/` and edit the slot: new `src`/`webm`/`poster`, `"kind": "licensed"`, the exact `credit` the licence asks for (for CC BY: title, author, source and licence name) and the `licence`.
4. **Rebuild and check:** `node tools/gen_home.mjs && node tools/gen_tracks.mjs && python3 tools/bundle_webxr.py && node tools/check_home.mjs`. The checker refuses a missing file, a file over budget, an MP4 without faststart or with an audio track, and a slot without credit or licence.

Generated footage (from a video-generation service) follows the same steps; its `kind` is `"licensed"` and its `credit` names the service's required attribution, if any, and says it is generated. Captions never claim more than the clip shows.

## Behaviour (shared/cinema.js)

- `<video muted loop playsinline preload="metadata" poster=…>`. Only the hero carries `autoplay`; world cards and the other surfaces start when they scroll into view (IntersectionObserver) and pause when they leave it or the tab is hidden, so first paint fetches one loop, not five.
- `prefers-reduced-motion: reduce` hides every loop in CSS before any script runs, and the helper stops fetching; `navigator.connection.saveData` does the same. The poster stays as the layer's background.
- A clip that fails to load is removed and the poster stays.
- The hero has a Pause/Play button (WCAG 2.2.2), with `aria-pressed`.
- A scrim sits between the loop and any text (the hero keeps its own gradient; start screens, the Atlas header, the sign-in backdrop and the track bands use a darker one).
- The helper finds `backgrounds.json` from the first of `media/`, `../media/`, `home/media/`, `../home/media/`, `../../home/media/` that answers, so one module works in the repository layout, the per-app dist folders and the flat published folder. Opened from `file://`, bundled pages keep their plain backgrounds; the homepage keeps its posters and its autoplaying hero.
- `tools/bundle_webxr.py` copies `WebXR/home/media/` to `WebXR/dist/media/` and ships `shared/cinema.js`.
