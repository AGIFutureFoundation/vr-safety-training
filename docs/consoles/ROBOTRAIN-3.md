# ROBOTRAIN-3 — the learning loop's last mile, in the app (`rt3`, port 9062)

Loop 7 (SmartCiti.X Holodeck · Powered by AGI Corp). Base a8c677ed (the pushed head of PR #1). Builds on ROBOTRAIN
(`rt-teleop.js`), ROBOTRAIN-2 (`rtXRPose`, `rtFollowRig`, `vb-colearn.js`), COLEARN (`colLocalDemos`, `colGhost`), VBRIDGE
(`vb-panel.js`, the governor) and DATAWORKS (`dx-data.js`, `dx-consent-ui.js`). Read `docs/consoles/ROBOTRAIN.md`,
`ROBOTRAIN-2.md`, `COLEARN.md`, `VBRIDGE.md` and `DATAWORKS.md` first; this file adds to them.

## What is here

1. **Consented local takes train the provider** (`WebXR/shared/vb-colearn.js`, `vb-panel.js`, `WebXR/parishes/js/app.js`).
   - `vbColearnLocalSource({ store, signals })` → `{ refresh(), demosFor(sc), count(sc), tag(sc), clear() }`: `refresh()` re-reads
     the learner's own episodes per task through COLEARN's `colLocalDemos`, which returns nothing unless `dxCollecting()` (adult,
     signed in, not K-12, not the demo, opted in); `demosFor(sc)` is the synchronous hook the provider calls and returns
     `{ demos, tag }`, the tag naming the take set so a new take retrains and a revoke (store emptied, consent gone) drops the
     model back to synthetic demonstrations. Nothing here writes, uploads or fetches.
   - `vbColearnModel` keys its cache by that tag; a handed-in set trains the model only when at least one clean pass is in it,
     else the synthetic demonstrations do and the provenance says so (`ownOffered`). `vbColearnDescribe(model)` is the honest
     label: "your 12 takes (12 clean passes kept; consented, on this device)" or "synthetic demonstrations (scripted stand-in)".
     The provider gained `modelFor(sc)` and `describe(sc)`.
   - `vbMountDispatch(el, { providerLabel })`: the card's Provider line asks the provider what it trained on for the job's task.
   - The app mounts `vbLocal = vbColearnLocalSource()`, hands `demosFor` to the provider, refreshes it at boot, when the Me tab's
     consent panel changes (`dxMountConsent(..., { onChange })`: opt-in or revoke) and when a teleop take ends (`onTake`).
2. **The WebXR session loop** (`app.js`). `npXRBegin(session)` requests a `local-floor` (else `local`) reference space, hands the
   session to the renderer's XR manager where it can, and runs `session.requestAnimationFrame(npXRFrame)`: each XR frame feeds
   `teleop.xr(xrFrame, refSpace)` (the rig follows the controller) and then runs the world frame. Outside a session nothing
   changes: `npXR.session` is null, the window's `requestAnimationFrame` drives `frame`, and `teleop.xr` is called nowhere else
   (the checker counts the calls). "Enter VR" is added to the menu only when `navigator.xr.isSessionSupported("immersive-vr")`
   resolves true. `window.__parishTest.xr = { begin, end, state }` takes a stubbed session for the headless proof.
3. **The cell task in the pad** (`rt-teleop.js`). `rtMountTeleop(el, { task, onTake, modelFor })` takes any `RT_TASKS` id and a
   select on the pad switches it; on the cell task the pad's x/y are the hand's offset at the e-stop post (`RT_CELL_CONTROLS`),
   the wheel walks the body along the approach (up: toward the cell; the walk stops at the gate), a left press is the light
   squeeze (test the e-stop), a right press the firm one (hold it in). In XR the cell frame is floor-based: the controller's
   height is the hand's height at the controls, its z the body's place. `rtHudLine(sc, obs, …)` is the HUD line per task
   ("cell entry: 2 m from the cell · e-stop tested, stopped, locked out, verified, jam"). `RT_REST_POSE` per task.
   The app starts the pad on the cell task where the map's first robot rig is a cell (`sf-downtown`), else on pick-and-place.
4. **"Robot demonstrates back"** — one button on the pad, enabled after a take: `demonstrate()` replays `colGhost(model)` on the
   same rig (`rtFollowRig` per frame where the observation has an effector; the explanation on the status line), with the
   model the provider would run (`modelFor`: the learner's own takes when consented, else synthetic) and names the source.
   `ghost()` steps it by hand (reduced motion, headless).
5. `tools/check_robotrain.mjs` section 8 (the three consent states, the panel and app wiring, the XR loop, the cell pad, the
   ghost) and hygiene over this file. 253 → 291 checks.

## Evals (before → after)

| Measure | Before (a8c677ed) | After |
|---|---|---|
| loop steps live in the app without hand-wiring (demonstrate, consent, train on *own* takes, evaluate, demonstrate back) | 3/5 (`demosFor` unwired; no XR session loop; the ghost only in COLEARN's panel) | **5/5** |
| provider's training data when a consented learner has takes | synthetic always | the learner's own takes: Node, 12 cell takes → "your 12 takes (12 clean passes kept)", a seeded cell job **COMPLETED** with the governor's verdict on 31/31 steps; a 13th take retrains; revoke → store 0, not collecting, "synthetic demonstrations" |
| the same, in the built page (headless, port 9062, `?parish=sf-downtown`) | — | signed out → "synthetic demonstrations" on the card, job 107 COMPLETED with the governor on 25/25 steps, audit chain intact; opted in (account profile, Me-tab opt-in: "Data sharing: ON") + 3 cell takes through the XR seam (31/31/33 steps, every take "restarted", the recorder active and the episode returned) — **but** the page's store read (`vbLocal.refresh()`) still saw 0 after 10 s of polling: the recorder's IndexedDB write runs on an idle slot the busy headless page did not grant, so the page-level "your 3 takes" card and the revoke-in-page step were **not observed** in the time box (the Node run proves the store path; the page proof is left) |
| XR frames fed to the pad outside a session | 0 (no loop) | 0 — `teleop.xr` is called from `npXRFrame` only; with a stubbed session `begin` → frames and `fed` count up, `source() === "xr"`, the rig's yaw moves; `end` → active false, frames stop |
| tasks the pad drives | 1 (pick-and-place) | **2** (+ cell entry with its own HUD line; through the pointer: light press tests the e-stop, firm press holds it) |
| pose sources on the cell task | API only | pointer, touch, WebXR controller |
| "robot demonstrates back" inside the pad | none | one button; 27 ghost frames on the cell task, the rig driven on the arm task |
| page errors / requests off localhost in the headless drive | — | 0 / 0 (recorded in the drive's last line) |

Read honestly: every "learner" in the proofs is the scripted stand-in through the pose path, labelled synthetic where it is
written and consented only through the same `dxOptIn` a person would click; no person was measured. The three-take model in the
page is a k-NN over three clean passes of a discrete task, which is why it completes the cell job — it says "your 3 takes",
not that it generalises.

## Cycles

1. Reason: the provider must read the learner's own consented takes and say so; check: a Node run through signed-out → opted-in (12 recorded cell takes) → revoke. Observed: signed out → counts all 0, "synthetic demonstrations"; opted in → store 12, "your 12 takes (12 clean passes kept; consented, on this device)", seeded cell job COMPLETED, governor on 31/31 steps; revoke → store 0, not collecting, "synthetic demonstrations".
2. Reason: the pad drives the cell task through the pose path to the restart with its own HUD line, and the ghost replays on the rig; check: a DOM-stub mount in Node. Observed: 31 steps to "restarted · cell entry: 2 m from the cell · e-stop tested, jam cleared, restarted", `onTake` fired (episode null: signed out), ghost 27 frames, stepped to "done". Committed f323654d with the app wiring and the XR loop.
3. Reason: the XR session loop must feed the pad from the session's own frames and nothing outside; check: the built page on 9062 with a stubbed session. Observed first: `window.__parishTest.xr` was assigned before `__parishTest` existed (a boot TypeError in the bundle) → the loop's test object is defined at the loop and attached beside the teleop mount. Then: before any session frames 0, source "pointer"; `begin` → began, frames 2 fed 2, source "xr", rig yaw 0 → −0.657; `end` → active false, frames unchanged after.
4. Reason: the page's takes must reach the provider; check: the headless drive's opted-in state. Observed first: three takes fed 31 poses each but ended "inside the cell · jam" — the XR mapping for the cell task added 0.9 m to a height clamped at the bench origin (1.0 m), so the hand could never reach the jam at 0.6 m → the cell frame is floor-based (origin y 0). Then every take ran to "restarted" with the recorder active; the page's store still read 0 after 10 s of polling (the idle-slot IndexedDB write was not granted on the busy headless page) — not resolved in the time box; the Node proof (cycle 1, the checker) covers the store path.
5. Reason: the pointer path on the cell pad; check: wheel-ups then a light and a firm press on the e-stop. Observed first: "8 m from the cell · too-far" after 8 wheel-ups — the walker starts 12 m or more out (the scenario's seeded start), not at the rest pose's 8 → the drive and the checker walk until the gate stops the walk; light press "e-stop tested", firm press "stopped".
6. Reason: one gate proves all of it; check: `check_robotrain` section 8. Observed first: FAILED 4 of 291 — the `teleop.xr(` count included two comment lines (now code lines only), the wheel-up count (cycle 5), and this file missing. Then: see the hand-back's green line. `check_imports` "All 1103 modules call only what they declare or import" before and after.

## Seams

- `vbColearnLocalSource({ store, signals })`, `vbColearnDescribe(model)`, `VB_SOURCE_OWN`, `VB_SOURCE_SYNTHETIC`,
  `vbColearnProvider(opts).modelFor(sc)` / `.describe(sc)` — `WebXR/shared/vb-colearn.js`; `vbMountDispatch(el, { providerLabel })`.
- `rtMountTeleop(el, { task, onTake, modelFor })` → `{ …, task(id?), tasks, demonstrate(seed), ghost(), lastTake() }`, `rtHudLine(sc, obs, opts)`,
  `RT_REST_POSE` — `WebXR/shared/rt-teleop.js`.
- `window.__parishTest.xr = { begin(session), end(), state() }`, `window.__parishTest.vbLocal` — `WebXR/parishes/js/app.js`.
  **CAPTURE-R2**: `__parishTest.teleop.task("rb-cell-entry")`, `demonstrate()` and `ghost()`; the card's Provider line is the
  honest label. **WHITEPAPER-R2**: the figures above are printed by `node tools/check_robotrain.mjs` (one line).
- DATAWORKS rules stand: the only reader of takes is `colLocalDemos` (behind `dxCollecting`), the only writer is `dxRecorder`;
  no ROBOTRAIN-3 file stores, uploads or fetches anything; revoke deletes the takes and the provider retrains on synthetic.

## Left

- The page-level proof of "opted in with takes → your N takes on the card → revoke": the headless drive recorded the takes but the
  store write (an idle-slot IndexedDB put in `dxRecorder.finish`) was not observed within 10 s on the busy headless page; a drive
  with the world paused, or a store flush hook, is the next step (`$SP/loop7/rt3/drive.mjs` is the script).
- A real headset session: the loop is proven with a stubbed session; the renderer's XR manager path (`npRenderer.xr.setSession`)
  is try-guarded and untested on hardware.
- The ghost drives the rig on the arm task only (the cell task's observation has no effector); a cell-entry ghost on the rig
  would need the walker drawn.
- The parishes dist is rebuilt by the coordinator at integration (the drive's bundle was scratch and reverted).
