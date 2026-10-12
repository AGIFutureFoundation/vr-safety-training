# Memory: ENV-HD-5 (loop 10, round 5, `hd5`, port 9133)

- Base e252b25f (fast-forward). Branch `worktree-agent-a6814868e45070b08`. Scratch `$SP/loop10/hd5/`.
- **LA rooms on balanced (item 1).** `lar-rooms.js` `LAR_SIGN_PX` high 512 × 120, balanced and low 256 × 60;
  `larSignMaterial(THREE, text, tier)`. `hd2-room-skins.js` `HD2_SIGN_BYTES.balanced` = 256 × 60. `check_room_skins`:
  `larSignPx(tier)` is its model (near line 85); a room over budget before the skin now FAILS; the measured pass installs a
  `globalThis.document` stub (recording canvases, a Proxy 2D context) around fresh LA builds with the skin, then deletes it.
  Balanced is only ever chosen (URL or the toggle; `tcAutoTier` gives phones "low" and desktops and headsets "high"), so the
  phone and headset tiers are untouched.
