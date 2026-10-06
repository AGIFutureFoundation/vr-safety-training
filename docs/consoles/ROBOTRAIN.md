# ROBOTRAIN — human interaction trains robots, deeper (`rt`, port 9042)

Loop 5 (SmartCiti.X Holodeck · Powered by AGI Corp). Base c472f079. Builds on ROBOPROG (`rp-programme*.js`, the four `rp-*`
stations), COLEARN (`col-learn.js`), DATAWORKS (`dx-data.js`), ROBOTICS (`rb-env.js`) and FIXRIG (`rb-world.js`).

## What is here

- **Four gap stations** (`WebXR/smartcity/js/sims/rt-*.js`, registered through `tools/add_station.mjs`) — the gaps ROBOPROG listed
  as open, each on a robotics site (`robotics-factory` or `robotics-training-centre`), standards named only (ISO 10218, ISO/TS 15066,
  ANSI R15.06, OSHA 29 CFR 1910.147 / 1910.212 / 1910.132), no clause text, no speed, force or distance figure stated:
  - `rt-teach-pendant-safe-jogging` — **97**. Manual reduced speed read back on the pendant, the pendant e-stop proven, the enabling
    device's three positions tested, a second person at the outside e-stop, the escape route walked, a standing mark set, the jog
    held inside the reduced-speed band, automatic restored only from outside with the gate latched. Interruptions: a coworker opens
    the gate during the jog → pendant e-stop (gate swings, coworker moves, lamp); the arm speeds past the readout → release the
    enabling device (readout and stack light repainted).
  - `rt-cobot-power-force-limit-check` — **98**. Body regions from the risk assessment, the measuring device's calibration tag, the
    device set for the region and seated at the contact point, collaborative mode read back, transient then quasi-static contact
    measured separately, a sharp gripper edge found and covered, both readings recorded as measured. Interruptions: a hand on the
    device during the contact → bench e-stop; an over-band quasi-static reading → speed override down (arm slows).
  - `rt-robot-estop-recovery-and-restart` — **96**. The stop log read first, everyone accounted for, the dropped part found in the
    light curtain, lockout and zero-energy check before the clearing entry, the gate held open, the part cleared, lock off last,
    e-stop and safety circuit reset from outside, reduced speed for the first cycle watched with a hand on the stop, the event
    written down. Interruptions: a coworker reaches for the reset with you inside → the pendant e-stop you carry; the arm swings
    toward the gate on the first cycle → outside e-stop (arm pose changes, stack light).
  - `rt-speed-separation-monitoring-setup` — **98**. Stopping distance and approach speed read from the sheet, the reach marked on
    the floor, protective then warning field set (the floor fields resize live), muting confirmed off, the scanner's shadow found
    behind a cabinet, the e-stop proven, the warning field walked with a leg-sized test piece, the stop measured against the mark,
    every approach walked, the configuration committed under its checksum and recorded. Interruptions: a coworker with a cart in
    the shadow → cell e-stop; the arm stops inside the mark → increase the protective field (field scales).
- **`WebXR/shared/rt-teleop.js`** — the VR-controller teleoperation demonstration recorder over `rb-teleop-pick-place`:
  `rtPoseToAction(pose, obs)` (pure: a hand pose → move capped at the scenario speed / grip from the squeeze as a share of the part's
  ceiling / release / estop / reset / wait), `rtRecorder(env, { store, signals })` (wraps DATAWORKS' `dxRecorder`, so it is inert
  unless an adult, signed-in, non-K-12, non-demo learner has opted in; the episode is kind `robot-game`, scenario
  `rb-teleop-pick-place`, stored locally, deleted by revoke), `rtScriptedHuman(env, { skill, tremor, lag })` (the scripted expert's
  intent through a hand with tremor and lag — the test stand-in, labelled synthetic wherever it is written), `rtRecordTakes()`,
  `rtCompare()` (the eval) and `rtMountTeleop(el)` (pointer pad in the parishes drills menu, `window.__parishTest.teleop`).
- **Programme**: `RP_GAP_STATIONS`, `RP_TELEOP_RECORDER`, `rpGapCoverage()`, `rpRecorder({ rt })` (guarded, no import) in
  `rp-programme(-data).js`; the gap stations sit in the industrial-cells, cobots, maintenance-lockout and data-AI-training ladders and
  in `RP_ROBOT_STATIONS`. `node tools/gen_robotics_programme.mjs` re-run with `col-learn.js` in the tree: the page now says
  **loop 5/5 live**, recorder live (`data-rp-recorder="live"`), gaps 4/4 (`data-rp-gaps="4/4"`); nothing showed as unwired.
- **`tools/check_robotrain.mjs`** — the gate (added to `check_all`'s list and the checker baseline; never run from here).

## Evals (before → after)

**Gap coverage** (`rpGapCoverage`: a gap is covered when its station is in the tree, in a track level and a robot station):
**0/4 → 4/4** (teach pendant in 4 levels, PFL in 2, e-stop recovery in 4, SSM in 3). The programme's own robot-station coverage
stays 30/30 and every level earnable (`check_robotics_programme` 699 checks ok).

**Recorded vs synthetic takes** (`rtCompare`, N = 40 each, behaviour cloning on clean passes only, 60 held-out seeds 7001–7060;
the "human" is `rtScriptedHuman` at skill 0.85 — a scripted stand-in, labelled synthetic, not a person):

| Demonstrations (N = 40) | Kept (clean passes) | Rows | Success | Clean | Mean steps |
|---|---|---|---|---|---|
| Recorded takes (pose → action through `rtRecorder`'s path) | 18/40 | 1234 | **0.967** | 0.967 | 83.9 |
| Synthetic demonstrations (`colSyntheticDemos`, action noise) | 19/40 | 984 | **0.967** | 0.967 | 62.6 |
| Random floor | — | — | 0.000 | 0.533 | 400 |
| Scripted expert (ceiling) | — | — | 0.983 | 0.983 | 51.1 |

Read honestly: a policy cloned from pose-driven takes reaches the same success as one cloned from direct-action demonstrations on
this task, but it copies the hand's lag and tremor (about a third more steps per episode). Before this console there was no
pose-driven path at all; the only demonstrations were synthetic action sequences.

## Cycles

1. Reason: the first gap station (teach pendant) must pass the station brief and score 95+; check: `add_station` + `eval_content --station`. Observed: 97 (207 meshes, 26 interactables, 7/7 standards in scope, originality 42 — the structural prose it shares with `rp-teleop-demonstration-collection`). Committed bfd08410.
2. Reason: the PFL check names ISO/TS 15066 and measures transient and quasi-static cases separately; check: eval ≥ 95. Observed: 98 (6/6 in scope). Committed 10ddc29c.
3. Reason: e-stop recovery teaches "reason first" and the restart from outside, with a `turn` step for the reset; check: eval ≥ 95. Observed: 96 (originality 14 — vocabulary shared with `ad-robot-cell-lockout-and-safe-reentry`); the `turn` step was first written with the wrong shape (`from/to`) and corrected to game.js' `{ turns, label, readout }`. Committed 0cde5208.
4. Reason: SSM set-up sizes the fields from the sheet and finds the scanner's shadow; check: eval ≥ 95. Observed: 98 (218 meshes). Committed e32d9b22.
5. Reason: a pose-driven recorder that is inert without consent and whose scripted stand-in trains as well as synthetic demos; check: a scratch run of `rtRecordTakes`, `rtCompare`, an inert recorder, an opted-in take, revoke. Observed: 10 takes 6 passed/6 clean, all valid; recorded 0.967 vs synthetic 0.967 (random 0, expert 0.983) in 0.6 s; inert without consent; opted-in take valid with an adult receipt, stored 1, after revoke 0 and not collecting.
6. Reason: the programme shows the loop live and the gaps covered; check: `gen_robotics_programme` + `check_robotics_programme`. Observed: "coverage 30/30, loop 5/5 live", `data-rp-recorder="live"`, `data-rp-gaps="4/4"`; check_robotics_programme ok, 699 checks (was 684: the new stations in the levels). Committed 4671a4fc.
7. Reason: one gate proves all of it; check: `check_robotrain`. Observed first: FAILED 5 of 217 — the move cap compared at 1e-6 while actions round to 3 decimals (hypot 0.1204 vs 0.12), the checker scanned its own regex source for the network-call and affiliation patterns it looks for, and this file did not exist yet → tolerance 0.002, the checker scans itself for model identifiers only, this file written. See the hand-back for the green line.
8. Reason: neighbours stay green; check: `check_imports`, `check_smartcity`, `check_dataworks`, `check_robotics`. Observed: check_imports "All 1093 modules call only what they declare or import"; check_smartcity first found 2 problems — the e-stop station's lateNote was keyed `operator-lock`, which is no step's target → keyed to `disconnect-lock` → "All 731 simulators pass"; check_dataworks 59/0; check_robotics 19/0; check_robotrain ok, 214 checks.

## Seams

- `rtPoseToAction(pose, obs, { speed, tolerance, deadband })`, `rtRecorder(env, { store, signals, clock, map })`,
  `rtScriptedHuman(env, { seed, skill, tremor, lag })`, `rtRecordTakes({ n, seed, skill })`, `rtCompare({ n, seed, heldOut, skill })`,
  `rtMountTeleop(el, { seed, store, signals, reducedMotion })`, `RT_SCENARIO`, `RT_SYNTHETIC_LABEL`, `RT_DATA_RULES` — `WebXR/shared/rt-teleop.js`.
- `RP_GAP_STATIONS`, `RP_TELEOP_RECORDER`, `rpGapCoverage({ stationIds })`, `rpRecorder({ rt })` — `WebXR/shared/rp-programme.js`
  (guarded by name, like `rpLoop`).
- **VBRIDGE / TQ-ROBOTICS** can read `rpGapCoverage()` and `rtCompare()` (plain JSON, deterministic under a seed) for the shared
  export; the four `rt-*` station ids are in `RP_ROBOT_STATIONS`.
- **AVATARS**: the stations' crew figures are `standingFigure` with `cloth`/`helmet` only (second person / safety lead / line lead and
  a coworker); outfits by trade can be swapped in there.
- Bundler: `rt-teleop.js` after `col-learn.js` in the parishes list; mounted in `WebXR/parishes/js/app.js` under `#menu-drills` as
  `#rt-teleop`, guarded (`window.__parishTest.teleop`).
- DATAWORKS rules stand: the recorder goes through `dxRecorder`; no ROBOTRAIN file stores, uploads or fetches anything itself.

## Left

- A browser drive of the four stations on port 9042 with a copy of `tools/briefs/drive_one.mjs`, and spawn screenshots
  (`check_smartcity` drives them headlessly through steps and interruptions).
- The teleop pad is a pointer pad in the drills menu; a WebXR controller pose source (`XRInputSource` grip pose → `pose.p`) is the
  next step, and the 3D arm at the ROBOTICS sites does not yet follow the pose.
- `rtCompare` runs one task (Teleop Pick-and-Place); the scripted human has no per-person model and is a stand-in only.
- The parishes dist is rebuilt by the coordinator at integration (not committed here).
