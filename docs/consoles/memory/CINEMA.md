# CINEMA — memory (read first)

- **three r160 defines `WebGLRenderer.render` per instance**, so a prototype patch never runs. To drive a game's camera from outside, hook `Object3D.prototype.onBeforeRender` (called for the scene inside every render) and copy a scripted camera's `matrixWorld`, `matrixWorldInverse`, `projectionMatrix` and its inverse into the game camera.
- **Deterministic capture under swiftshader:** replace `requestAnimationFrame` with a queue and step `performance.now`/`Date.now` by a fixed dt per frame, then screenshot. Real-time recording drops frames; stepping does not. About 1–3 s per frame at 960×540 on the shared 4-core box with five recorders in parallel.
- **Hide the UI** with `body *{visibility:hidden}` plus `canvas[data-cn]{visibility:visible}` (mark the WebGL canvas from the hook).
- **The headless test Chromium has no H.264 decoder** (`canPlayType("video/mp4; codecs=avc1…")` is empty). Ship a VP9 WebM first, MP4 second, or browser checks see only the fallback poster.
- **Fairway Park draws only near the player:** a far scripted camera shows an empty plain. Keep the camera near the first tee.
- **Bay World's dusk:** set `__bayworldTest.app.hours` each frame (the clock advances); its fog at dusk is 0.0034, thin it to about 0.0013 in the hook for a readable skyline.
- **Autoplay defeats `preload="metadata"`.** Only the hero autoplays; the cards and other surfaces start from an IntersectionObserver.
- **A fixed `.cn-bg` at `z-index:-1` needs `isolation:isolate` on its host**, or it paints under the host's background; over an in-flow `<img>` (world cards) use `z-index:1` instead.
- **The account chip mounts a `signin` layer on every page**, so a count of `.cn-bg` elements must be scoped (`#hero`, `#worlds`).
- **Track pages already overflow at 360 px** in the ladder rows (435 px scroll width before this console's change); the band itself fits.
- Worktree-isolated shells refuse heredoc-fed `python3 -`, `sed` on `$var` paths and backgrounded `(bash …&)` groups: write a script file and run it plainly, or use `run_in_background`.
