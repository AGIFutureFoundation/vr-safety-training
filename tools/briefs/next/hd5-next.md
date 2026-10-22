# Next for ENV-HD-5 (`hd5`): brief for the next console

Read `docs/consoles/ENV-HD-5.md` (Seams, Cycles, Left) and `docs/consoles/memory/ENV-HD-5.md`, then
`WebXR/shared/hd3-scenes.js` (the scene solver and its seven sites), `WebXR/shared/hd4-rooms.js` (`hd4LightRoom`,
`hd4LightRoomBalanced`), `WebXR/shared/lar-rooms.js` (`LAR_SIGN_PX`), `tools/check_room_skins.mjs` (the measured LA pass),
`tools/check_exteriors.mjs` (the non-robot scene section), `tools/check_hd4.mjs` §3 and §5, `tools/drive_hd3_scenes.mjs`.

## Do
1. **The four new kinds read as their kind.** The park, fire station, hospital and school presets frame the parish engine's
   plain generic site building (a box with a door), so they read as "a low building". Give the site building a kind cue
   generic by kind, procedural, inside FC_BUDGET and the phone tier's build unchanged: an apparatus-bay door row and a
   drill-tower stub for a fire station, an entrance canopy and a drop-off lane for a hospital, a covered entrance and a
   fenced yard for a school, a tool shed and a planting bed for a park crew yard. No words on walls, no logos. Check:
   `node tools/check_facades.mjs` (phone tier identical, FC_BUDGET), then `python3 tools/bundle_webxr.py` and
   `node tools/drive_hd3_scenes.mjs <port> high <dir> wide,street presidio-crew-yard,no-sw-mid-city-fire-station,hospital-district,mission-school-campus`;
   look at every still.
2. **The street camera knows every tree.** The park's street shot stands under a tree crown that `hd3Obstacles` does not see
   (it reads the massing's crowns only; the tree in the frame comes from another source). Find the source (CITYWORKS'
   street dressing, DETAIL or the park character) and add its crowns to the solver's obstacles, or test the sight cone
   against the scene in the page. Check: `check_exteriors` (a new line: no tree crown within 5 m of a street camera) and the
   re-shot `sf-marina-park-street-day.jpg`.
3. **The job board's lamp at night.** In every night still a small white bar hangs over the site's job board (by its
   position, the board's lamp — ATMOS's site light), and in the low street shots it reads as a bar floating in the sky (the
   fire station's night street shot shows it large, near the camera). Draw its arm or post, or give it a glow that reads
   as a lamp. Check: re-shot `orleans-fire-station-street-night.jpg` and `sf-marina-park-street-night.jpg`.
4. **Room sign framing.** In the cell hall a guard-fence post covers part of the shell sign's honesty line, and in the port
   control room the window mullions draw over the sign: move the sign (or the preset camera) so the honesty line reads.
   Check: `check_interiors`, `check_robo_interiors`, and re-shot room stills
   (`node tools/drive_hd4_scenes.mjs <port> high <dir> oak-west-oakland dawn rooms high notime none`).
5. **Quiet re-measures** of the estimated rows in `docs/perf/checkers-baseline.json` (`check_room_skins`, `check_hd4`).

## Rules that bind this work
- Phone and headset tiers never change (`check_hd4` §3: 18 of 18 identical builds; `check_facades` §7 for facades).
  Balanced is only ever chosen (URL or the toggle), never auto: phones get "low", desktops and headsets "high".
- Rooms stay inside `HD2_TEX_BUDGET` with every texture counted (`check_room_skins` now fails on any room over budget and
  measures the LA rooms' canvases); balanced lighting stays emissive-only (`HD4_ROOM_LIGHT_BUDGET.balanced`: +1 mesh,
  +0 lights, +0 texture bytes, ≤ 400 triangles).
- Procedural only; generic by kind; labels name the kind only; no words on floors, walls or facades; nothing names a
  company, union or trade body; no model identifier in any file.
- Single checkers only; never run `tools/check_all.mjs`; never commit `docs/perf/checkers-last.json` or measured timings.
  Rebuild the bundles (`python3 tools/bundle_webxr.py`) before any drive, drives one at a time on your own port, restore
  the committed dist files afterwards (`git checkout -- WebXR/dist/parishes.html WebXR/parishes/dist/parishes.html`).
