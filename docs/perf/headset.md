# Headset pass

What the platform's "one build for phone, laptop and headset" claim can and cannot be proven about here (console PROVING, `docs/consoles/PROVING.md`). This machine has no WebXR runtime and no emulator that can be installed offline, so the pass has a headless half and a manual half.

## Headless half — `node tools/headset_pass.mjs`

`navigator.xr` is stubbed by an init script: `isSessionSupported("immersive-vr")` answers true and `requestSession` throws a named `NotSupportedError`, which is how a WebXR-capable browser behaves with no headset attached. For every page the tool records whether the page asks for VR at all (`renderer.xr.enabled`), whether its Enter VR control appears and enables once VR is supported, whether pressing it fails cleanly (the page keeps running and says why, with no page error), and whether the shared controls overlay (H) opens with its verb rows and the Guide button is on the page.

<!-- headset:start -->
<!-- headset:end -->

### What this proves, and what it does not

- **Proven headless:** the three station apps — Trade Skills, the Holodeck and SmartCiti.X — enable XR on their renderer, show an Enter VR control that enables when the browser reports support, and take a refused session without a page error, falling back to the desktop view with a message. The controls overlay and the Guide are on every page.
- **Not proven, and a finding for the world teams:** the six open worlds (Bay World, the Deep, the Regatta, Fairway Park, Redwood Reach, Sierra Summit) run plain `requestAnimationFrame` loops with `renderer.xr` never enabled and no Enter VR control. They cannot enter VR today on any device; the claim holds for the station apps only. The next PROVING brief carries the numbers.
- **Needs a real device** (the manual checklist below): that the session actually starts, the frame rate in the headset, that the VR HUD panel (Trade Skills' `vrPanel`, a mesh in front of the camera) and the controls text are legible at headset resolution, controller and hand input, and where the Guide sits in VR (today it is a DOM button, which a headset session does not show — the Guide is reachable before entering VR and after leaving it, not inside the session).

## Manual checklist — a real headset

Run once per station app on a standalone headset browser (any WebXR browser; no vendor is assumed), from the flat build served over HTTPS. Record the browser's name and version, the build commit, and the result of each line in `docs/perf/headset-runs/<date>.md`.

1. The page loads to its menu without a console error; the Enter VR control is enabled.
2. Enter VR: the session starts within five seconds; the floor is at floor height (`local-floor`); nothing renders inside the near plane.
3. Frame rate: the browser's own performance overlay, or `?perf=1` and the perf HUD line, over a full station run — record average and 95th percentile per station; the heaviest stations first (`docs/perf/README.md` ranks them).
4. The controls overlay: the VR HUD panel reads at arm's length; every verb it lists does what it says with the controller and with hands.
5. The Guide: leave the session, the Guide button is where it was and answers a question; re-enter, the world is where it was left.
6. Leave the session with the system gesture and with the page's own control: the desktop view resumes, progress is kept, no page error.
7. Repeat 2–6 once with hand tracking on, where the headset offers it.

Nothing in this file is a device measurement until a line in `docs/perf/headset-runs/` says so.
