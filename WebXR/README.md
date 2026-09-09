# Safety Campus WebXR — web companion

`index.html` is a self-contained WebXR version of the campus inspection curriculum: all six
sites, the same 24 authored conditions (two hazards and two controlled look-alikes per site),
and the same deterministic scoring as the Unity build (+100 correct hazard, −25 first false
positive, repeats score nothing). Progress persists per browser via `localStorage`; nothing is
transmitted. The hands-on placement practicals and the LLM coach remain exclusive to the
Unity headset build.

## Device support — the honest matrix

| Surface | Status |
|---|---|
| Meta Quest 2 / 3 / 3S — Meta Quest Browser | Immersive VR: controller ray + trigger to inspect, left-stick glide, right-stick 30° snap turn |
| PC VR headset via a WebXR desktop browser | Immersive VR, same controls |
| Any desktop / laptop browser | Flat fallback: WASD + drag-look + click |
| Phone / tablet | Flat fallback (view + tap) |
| Ray-Ban Meta / Meta Ray-Ban Display glasses | **Not supported for immersive use.** These glasses do not run third-party immersive apps or WebXR; Meta's wearables toolkit exposes camera/audio to phone apps only. On those devices this page is at most a flat phone-browser view. |

For native (non-browser) Meta Quest support, use the Unity build:
`Safety Training > Configure Meta Quest (Android)` then `Safety Training > Build Meta Quest APK`,
and sideload `Builds/Quest/VR-Safety-Training.apk` with `adb install -r`.

## Deploying to rb1.com

The page is a single static file with one pinned external dependency
(three.js 0.160.0 from cdnjs.cloudflare.com; swap the import URL for a self-hosted copy of
`three.module.min.js` if the site must be fully self-contained).

1. Copy `index.html` to the web root (or a path such as `/safety-campus/`).
2. Serve over **HTTPS** — WebXR requires a secure context.
3. No headers are strictly required; if the site sets a Content-Security-Policy it must allow
   `script-src` from `cdnjs.cloudflare.com` and `style-src`/`font-src` from
   `fonts.googleapis.com` / `fonts.gstatic.com` (or self-host those too).
4. If the page is ever embedded in an iframe, the embedding page must grant
   `allow="xr-spatial-tracking"`, or the Enter VR button will report VR unavailable.
5. Open the URL in the Meta Quest Browser and press **Enter VR**.

ASSUMPTION: `rb1.com` was named as the hosting domain for this experience. It was not
reachable or identifiable from the authoring environment, so nothing here is specific to it —
the same file deploys to any HTTPS static host. If rb1.com is actually a platform or SDK with
its own integration contract, this page is the wrong artifact and the integration should be
specified against that contract instead.

## Verification status

Authored and syntax-checked offline; not yet exercised on Quest hardware. Before treating it
as released: load over HTTPS on a Quest, confirm Enter VR, controller select on all 24
conditions, stick locomotion comfort, and the in-VR HUD readability, per the QA rubric.
