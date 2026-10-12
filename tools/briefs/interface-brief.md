# Interface brief — controls, headsets, avatars

Applies to every task that touches how a learner drives the platform rather than what a station teaches. Read `tools/briefs/station-brief.md` §Verify for the checker/bundle/screenshot routine; it applies here too.

## Rules that never bend
- **Hands do the work.** Voice, gamepad and keyboard may navigate, focus, describe, read back, open panels and answer check-ins. Only the existing select/press/drag/turn paths advance a procedure. Do not add a voice command that completes a step.
- **Mesh budgets hold.** `check_layout.mjs` and `check_smartcity.mjs` gate every station; a figure or control that adds meshes to 196 stations breaks budgets. Keep the mesh count of any shared builder equal or lower than before (merge with `mergeStatic`, vertex colours, or a decal instead of extra geometry).
- **Device profiles are data.** `WebXR/shared/devices.js` is the one place a headset is described; app code reads a profile, never sniffs a user agent itself. New fields go on every DEVICES entry and get a checker rule in `tools/check_devices.mjs`.
- **Every input has a fallback.** A bound action must also be reachable by keyboard and mouse. Bindings are persisted in localStorage under one versioned key and reset from the panel.
- **No invented device facts.** Use only field-of-view, resolution, input and UA facts you are sure of; write "unverified" in `docs/devices.md` otherwise, and detect such a device only by `?device=` override.
- **Never touch** station ids, indices, programme entries, or the `game.js` step engine.

## Hand-back (≤ 250 words)
Files changed; the new checker line from `node tools/check_all.mjs` (must read "All N checkers pass" with N one higher if you added one); before/after screenshots under `docs/screenshots/<area>/`; anything you could not do and why.
