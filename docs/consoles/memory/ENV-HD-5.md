# Memory: ENV-HD-5 (loop 10, round 5, `hd5`, port 9133)

- Base e252b25f (fast-forward). Branch `worktree-agent-a6814868e45070b08`. Scratch `$SP/loop10/hd5/` (stills in
  `reshoot/`, `scenes/`, `balanced/`; drive logs `driveA.txt` …).
- **LA rooms on balanced (item 1).** `lar-rooms.js` `LAR_SIGN_PX` high 512 × 120, balanced and low 256 × 60;
  `larSignMaterial(THREE, text, tier)`. `hd2-room-skins.js` `HD2_SIGN_BYTES.balanced` = 256 × 60. `check_room_skins`:
  `larSignPx(tier)` is its model (near line 85); a room over budget before the skin now FAILS; the measured pass installs a
  `globalThis.document` stub (recording canvases, a Proxy 2D context) around fresh LA builds with the skin, then deletes it.
  Balanced is only ever chosen (URL or the toggle; `tcAutoTier` gives phones "low" and desktops and headsets "high"), so the
  phone and headset tiers are untouched.
- **Re-shoot (item 2).** `drive_hd4_scenes.mjs 9133 high <dir> bay-san-jose,oak-west-oakland dawn,fog rooms high notime`
  (13 captures, 232 s at load 5). Room stills renamed `<site>-<style>-lit-interior.jpg` by `$SP/loop10/hd5/rename-rooms.mjs`
  (location, kind, preset, time of day = interior).
- **Scenes (item 3, cycle 5).** `HD3_SCENE_SITES` + presidio-crew-yard (sf-marina, park, 5), no-sw-mid-city-fire-station
  (orleans, 4), hospital-district (orleans, 6), mission-school-campus (sf-mission, 5), `by: "kind"`; ties of the busiest
  count go to a map already listed. The street solver's first pass asks 12 m from the site's own building and 3.5 m clear
  of grown footprints (only the hospital's camera moved, 8.3 → 19.7 m). The school's wide camera is the fallback (30 m up;
  rowhouses ≤ 9.9 m). `drive_hd3_scenes.mjs` writes JPEG and loads each map once.
- **Balanced lighting (item 4).** `hd4LightRoomBalanced` in `hd4-rooms.js` (hd4 prefix: check_hd4 requires it in hd4
  modules): one InstancedMesh `hd4-light-balanced`, MeshBasicMaterial, per-instance colour; called from `hd4LightRoom` when
  tier is balanced and the UA is not a headset. `check_hd4` §3 now: low + balanced-in-a-headset + high-in-a-headset
  identical (18 of 18), balanced vs budget (6 of 6); §5 balanced fixtures (6 of 6 + the ops room).
- Commits: 36799b3e (item 1), e3bd3134 (item 3), 1cc43e0a (item 4), the street-camera fix (cycle 5), docs at the end.
  The committed dist files were rebuilt for the drives and restored.
