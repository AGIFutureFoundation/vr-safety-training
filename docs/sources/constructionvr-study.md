# ConstructionVR drilling-dust study — aggregate statistics

Credit: the **ConstructionVR user study** (repository `AGIFutureFoundation/constructionvr`, a Unity VR study of PM2.5
dust cues during construction work). This page holds **aggregate statistics only**, computed read-only from the study's
CSV files. No participant row, participant code, timestamp or per-person value is copied into this repository, and
nothing here can be traced back to a person.

**Not for training.** The study's consent covered research use. These data are **not** used to train, tune or
evaluate any robot policy, agent tutor or model on this platform, and the station that ports the design
(`sil-concrete-drilling-and-silica-dust-cues`) records only its own opt-in learners through DATAWORKS' consent gate.

## What the study measured (from its scripts)

Read from `Assets/Scripts/UserStudyInterface.cs`, `PM25TrailBurst.cs`, `PM25PhysicsBurst.cs`, `Drilling.cs` and
`AutoCueChop.cs`:

- **Conditions.** `ActiveDrilling`: the participant holds a drill to each of several drilling points; holding it there
  for 5 s (`requiredHoldTime`) completes the point, and while the drill is in contact a hidden PM2.5 value rises.
  `PassiveMoving`: the participant does not drill; the hidden PM2.5 value rises on a timer (every 1.5 s) while they move
  through the scene.
- **Modes.** A Training mode shows the dust bursts as particles; the Study mode hides the burst visualisation, so the
  dust is a hidden quantity during data collection. The random seed is fixed (`Random.InitState(123)`).
- **The cue and the response.** A response is a press of the left index trigger (or the right mouse button). Each press
  logs `TimeToResponse` — seconds since the session started — and `ResponseTimes`, a running press count. Later
  versions also log `TimeToPM2.5`, the time the hidden PM2.5 value first reached 25 µg/m³, and the time each drilling
  point was started. The scripts do not record the instruction participants were given, so this page does not claim
  what a press meant to them; the port treats a press as the participant signalling the dust hazard.
- **Instrument versions.** The CSVs come in three header layouts (3, 7 and 8 columns): the logging grew during data
  collection. All three carry `TimeToResponse` and `ResponseTimes`.

## Aggregates per condition

Responses are rows with `TimeToResponse ≥ 0` and `ResponseTimes ≥ 1` (rows logging the PM2.5 crossing or a drilling
point's start carry −1 there and are not responses). Quartiles use linear interpolation between order statistics.
Times are in seconds from the start of the session.

| Condition | Session files | Files with responses | Responses (n) | TimeToResponse median | IQR (Q1–Q3) | First response per session: median (IQR) | Responses per session: median (IQR) |
|---|---|---|---|---|---|---|---|
| ActiveDrilling | 6 | 5 | 37 | 25.41 | 13.76–33.43 | 13.19 (11.20–13.76), n = 5 | 7 (3–10) |
| PassiveMoving | 6 | 6 | 39 | 10.98 | 6.97–15.88 | 4.37 (2.98–6.64), n = 6 | 5 (5–8) |

The hidden PM2.5 value reached 25 µg/m³ (`TimeToPM2.5`, logged only by the later instrument versions) at a median of
16.24 s (IQR 16.08–24.01, n = 3) in ActiveDrilling and 10.52 s (IQR 10.51–10.52, n = 5) in PassiveMoving.

Twelve session files from seven participant codes; five codes appear in both conditions.

## Caveats

- **Small n.** Six sessions per condition and a few dozen presses; the medians are descriptive, not an effect estimate.
  No test is reported because the sample cannot carry one honestly.
- **Not independent.** Responses within a session are repeated presses by the same person; the per-session first
  response is the more independent figure.
- **Different clocks.** The study's TimeToResponse runs from the start of the session; the Holodeck station's
  reaction-time eval runs from the moment a cue fires to the learner's answer. They are not the same quantity, and the
  station shows the study's numbers as design context only, never as a norm.
- **Simulated PM2.5.** The study's PM2.5 value is a simulated parameter, not a measured concentration; the 25 µg/m³
  threshold's rationale is not stated in the scripts.

## How these numbers were made

A Node script outside the repository read the twelve CSV files, kept only the counts and order statistics above, and
printed nothing finer. `tools/check_silica.mjs` recomputes the same aggregates from the read-only clone when it is
present on the machine (and prints only aggregates), and otherwise checks this page against
`SIL_STUDY` in `WebXR/shared/sil-reaction.js`.
