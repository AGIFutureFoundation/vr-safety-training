# Module 06 — Immersive Lab (XR headset safety)

Delivered in-headset by the VR Safety Training Explorer. This module teaches the physical
safety controls that immersive technology itself requires: a cleared and re-verified play
space, managed tethers, separation between head-mounted-display users and moving equipment,
and a hygiene and comfort handover between users.

| Field | Value |
|---|---|
| Site id | `TrainingSiteId.ImmersiveLab` |
| Scene root | `Immersive Lab` (campus origin `900, 0, 120`) |
| Hub portal | `06 — IMMERSIVE LAB / XR HEADSET SAFETY` |
| Coach | Immersive technology safety officer (Rocketbox `Construction_Male_01`) |
| Guided duration | 4 active minutes, 2 coach turns, 4 condition reviews, 3 placement controls |
| Score available | 200 inspection points + 75 practical bonus |

## 1. Audience and prerequisites

For anyone who sets up, supervises, cleans, or hands over XR hardware: lab technicians,
training facilitators, demo staff, and shift supervisors who host head-mounted-display
sessions in a working area. No prior module is required. Learners need the same desktop or
XR input path as the rest of the campus; the module contains no fine-motor or two-handed
simultaneous interaction.

## 2. Learning objectives

On completion the learner can, without prompting:

1. Identify an object left inside an active room-scale boundary as a strike and trip hazard,
   and state the control (clear to the marked boundary, then re-run boundary setup).
2. Identify a head-mounted-display route that crosses a powered equipment lane as a
   situational-awareness hazard, and state the control (physical separation plus a spotter).
3. Distinguish a managed overhead tether from a floor-level cable hazard and explain why the
   overhead route is the accepted control.
4. Recognise the hygiene and comfort station as a required control point, not an optional
   convenience, and state what is checked at every handover.
5. Physically place three controls — clear the play space, separate the AR route, record the
   readiness sign-off — in the required order.

## 3. Construct → evidence → mechanic → signal

| Construct | Evidence anchor | Implemented mechanic | Telemetry signal |
|---|---|---|---|
| A cleared, bounded play space is a precondition, not a preference | Manufacturer guidance requires an unobstructed area of at least 2 m × 2 m for room-scale use and a buffer beyond it; the boundary does not detect objects, people, or pets that enter after setup | Authored boundary is 3.6 m × 3.6 m with corner posts; a flight case and stool sit inside it as the scored hazard, and a loose crate must be physically dragged out in step 1 | `inspection` outcome for `play-space-obstruction`; `placement_attempt` for `Clear the play space` |
| Obstructions in walking routes are a regulated hazard, not only a VR one | OSHA 1910.22 requires walking-working surfaces, aisles, and passageways to be kept clear, in good repair, and free of hazards | The same rule is applied to the play space and the AR route; the coach states the general-industry basis when asked | condition review order and false-positive count |
| Head-mounted displays reduce awareness of moving equipment | OSHA 1910.178 governs powered industrial truck operation and pedestrian exposure; separation and designated routes are the accepted controls | The AR walkthrough route crosses a powered equipment lane with no barrier and no spotter; step 2 places a barrier at the lane edge | `inspection` outcome for `unspotted-ar-route`; `placement_attempt` for `Separate the AR route` |
| Photosensitivity and motion discomfort need a posted stop rule | ISO 9241-391:2016 covers reduction of photosensitive seizures for displayed content; the Simulator Sickness Questionnaire (Kennedy et al., 1993) is the standard instrument for reporting discomfort | The hygiene and comfort station carries the posted notice and is the delivery point for the readiness sign-off in step 3 | `placement_attempt` for `Record headset readiness` |
| Accessible operation across input paths | W3C XR Accessibility User Requirements | Every condition and control works through desktop pointer and XR select/grab with the same scoring rule | `inputMode = DesktopDrag \| XRGrab` |

## 4. Site layout

Coordinates are site-local metres; the learner arrives at `(0, -3.55)` facing `+z`.

| Element | Position | Role |
|---|---|---|
| Active play boundary | centre `(-2.5, 0.4)`, 3.6 m × 3.6 m | Marked room-scale area with corner posts |
| Headset Station A / B | `(-2.6, 2.95)` / `(2.6, 2.95)` | Desk, headset on stand, controllers, operator display |
| Equipment Case in Play Space | `(-2.7, 0.5)` | **Hazard** — flight case and folding stool inside the boundary |
| AR Walkthrough Station | `(-1.7, -1.9)` | **Hazard** — AR headset and route sign at the head of the marked route |
| AR walkthrough route | strip at `z = -1.9`, x `-1.9 → 4.2` | Crosses the powered equipment lane |
| Powered equipment lane | centre `(2.5, -0.7)`, 2.4 m × 4.6 m | Yellow-edged vehicle/equipment route |
| Overhead Tether Management | `(2.6, 2.35)` | **Controlled look-alike** — boom stand, retractor drum, suspended tether |
| Hygiene and Comfort Station | `(-3.2, -2.9)` | **Controlled look-alike** — wipes, liners, posted notice |
| Equipment staging bay | centre `(-1.2, -3.0)`, 2.2 m × 1.5 m | Destination for the cleared crate |

Nothing is coloured or labelled as a hazard before inspection. Unlike the first five modules,
the two hazards are not both on the learner's left: `unspotted-ar-route` sits centre-left and
its consequence lies to the right, so position cannot be used as a tell.

## 5. Inspection conditions

Scoring is deterministic and owned by `TrainingSession`: +100 for a correct hazard, −25 for the
first selection of a controlled condition, 0 for any repeat. The language model cannot change it.

| Id | Hazard | Condition | Why it is or is not a hazard | Required control |
|---|:---:|---|---|---|
| `play-space-obstruction` | yes | Equipment case in play space | A hard case and stool sit inside the marked room-scale boundary while a headset session is running | Clear the play space back to the marked boundary and re-run boundary setup before the next session |
| `unspotted-ar-route` | yes | AR walkthrough crossing a live equipment lane | The marked AR route crosses the powered equipment lane with no barrier and no spotter | Barrier the route from the lane and assign a spotter before any head-mounted walkthrough |
| `managed-tether` | no | Overhead-managed headset tether | The tether is carried on an overhead retractor and stays clear of the floor and the walking route | Keep the retractor travel free and inspect the cable jacket before each session |
| `hygiene-comfort-station` | no | Stocked hygiene and comfort station | Disinfection supplies, the photosensitivity notice, and the comfort-break rule are posted with a clear approach | Restock the wipes and keep the approach clear for every headset handover |

The two controlled conditions are deliberate look-alikes: a hanging cable reads as a trip
hazard until the learner traces it to the boom, and a station full of consumables reads as
clutter until the learner reads the notice.

## 6. Practical placement sequence

Each step must be grabbed (XR) or dragged (desktop) and released inside its highlighted
`DROP HERE` zone. A click without movement does not complete a step, steps are gated in order,
and a completed control cannot be scored twice. Each successful placement awards 25 points.

| Step | Control | Start | Destination | Acceptance radius |
|---:|---|---|---|---:|
| 1 | Clear the play space — move the loose equipment crate out of the marked boundary | `(-1.5, 1.2)` | Equipment staging bay `(-1.2, -3.0)` | 0.85 m |
| 2 | Separate the AR route — set the barrier between the route and the powered equipment lane | `(0.8, 0.9)` | Lane edge `(1.25, -1.9)` | 1.10 m |
| 3 | Record headset readiness — sign off cleaning, boundary setup, and the comfort briefing | `(-0.2, 1.5)` | Hygiene station approach `(-3.2, -2.05)` | 0.85 m |

Completion message: *"Immersive lab practical complete. Play space, AR route, and headset
handover are controlled."*

## 7. Coach knowledge base

The site coach is grounded on these authored facts and may not contradict them:

> The marked play space must be clear and the boundary re-run before every headset session.
> Tethers belong overhead, AR walkthroughs need a barrier and a spotter near powered equipment,
> and headsets are cleaned and comfort-briefed at every handover.

The coach cycles inspection guidance → progress-aware hint → control explanation → score-neutral
debrief, and answers typed questions through the configured endpoint with the same grounded
offline fallback as the other modules.

## 8. Facilitator script (4 active minutes)

| Phase | Time | Facilitator action |
|---|---:|---|
| Pre-brief (outside the headset) | 0:30 | State the stop rule aloud: remove the headset at the first sign of nausea, dizziness, eye strain, or visual aura, and report it. Confirm the learner's own play space is clear before they start. |
| Orientation | 0:30 | Learner enters through portal 06, walks the bay, and reads the two station layouts before selecting anything. |
| Condition review | 1:30 | Learner records all four conditions. Do not name the hazards; if the learner stalls, direct them to ask the coach. |
| Coach turns | 0:30 | At least two questions. Useful prompts: *"why is the hanging cable not a hazard?"*, *"what makes the AR route unsafe?"* |
| Practical | 1:00 | Three ordered placements. Out-of-order attempts produce a sequence cue rather than a failure. |
| Debrief | 0:30 | Coach debrief plus one transfer question: *"what would you change in this room before your next session?"* |

## 9. Comfort, accessibility, and stop rules

- The stop rule is stated before the headset goes on and posted in-scene at the hygiene station.
- No strobing, rapid flashing, or high-frequency flicker is authored into this module; all state
  changes are colour plus text.
- Locomotion is the campus default: one transform writer, stable horizon, no forced acceleration.
- Every condition and control is reachable through desktop pointer or XR select; no step needs
  fine or simultaneous motion.
- A learner who reports discomfort stops the session. Partial progress is retained; the module
  can be resumed from the hub.

## 10. Assessment and pass criteria

| Check | Threshold |
|---|---|
| Hazards identified | 2 / 2 |
| Conditions reviewed | 4 / 4 |
| False positives | ≤ 1 for a pass, 0 for a clean pass |
| Coach turns | ≥ 2 |
| Placement controls | 3 / 3 in order |
| Active site time | ≥ 4 minutes |

Module completion contributes to campus certification, which now requires 24 active minutes,
24 / 24 condition reviews, 12 coach turns, all hazards, and 20 / 20 placement controls.

## 11. Telemetry

Written as JSONL under Unity's persistent data folder, with no learner identity and no raw
conversation text: `inspection` records (site, target, outcome, score delta) and
`placement_attempt` records (site, step, action, release distance, success, input mode).

## 12. Starting values and tuning plan

| Value | Start | Pass metric | Adjustment |
|---|---:|---|---|
| Play boundary | 3.6 m × 3.6 m | Learner reads the boundary as a single enclosed area from the entry point in 10/10 approaches | Enlarge in 0.4 m steps if the corner posts read as separate props |
| Portable acceptance radius | 0.85 m | Intended releases succeed ≥ 9/10 without accepting visibly wrong zones | ±0.10 m |
| Barrier acceptance radius | 1.10 m | As above | ±0.10 m |
| AR route width | 1.15 m | The crossing of the lane is legible from the entry point | ±0.15 m |

## 13. Abuse and readability checks

- A press-and-release at the start pose must not advance progress.
- Dropping a later-step control must not advance progress.
- A completed control cannot be moved or scored again.
- Selecting the tether or hygiene station twice must not apply a second penalty.
- An observer must be able to name the active control, its destination, and the last outcome
  from one frame.

## 14. Assumptions

- ASSUMPTION: the module teaches the physical safety of operating XR equipment, not the safety
  of a simulated workplace. IMPACT: hazards are drawn from headset operation rather than from a
  trade. IF WRONG: the site can be re-themed without changing the engine. VALIDATE: review with
  the team that runs the headsets.
- ASSUMPTION: a 3.6 m × 3.6 m authored boundary generalises to smaller real rooms. IMPACT:
  learners transfer the "clear to the boundary, then re-run setup" rule, not the dimension.
  IF WRONG: the boundary size becomes a distracting anchor. VALIDATE: ask learners at debrief
  what their own minimum clear area is.
- ASSUMPTION: an AR walkthrough beside powered equipment is representative of the deployment
  site. IMPACT: step 2 teaches barrier-plus-spotter. IF WRONG: replace the lane with the actual
  moving-equipment exposure at the deployment site. VALIDATE: site walk with the safety lead.

## 15. Sources

- OSHA 1910.22, *Walking-Working Surfaces — General requirements* (clear aisles and passageways,
  surfaces free of hazards): <https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.22>
- OSHA 1910.178, *Powered industrial trucks*:
  <https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.178>
- W3C *XR Accessibility User Requirements*: <https://www.w3.org/TR/xaur/>
- ISO 9241-391:2016, *Ergonomics of human-system interaction — Part 391: Requirements, analysis
  and compliance test methods for the reduction of photosensitive seizures*:
  <https://www.iso.org/standard/56350.html>
- Kennedy, R. S., Lane, N. E., Berbaum, K. S., & Lilienthal, M. G. (1993). Simulator Sickness
  Questionnaire: An enhanced method for quantifying simulator sickness. *The International
  Journal of Aviation Psychology, 3*(3), 203–220.
  [DOI 10.1207/s15327108ijap0303_3](https://doi.org/10.1207/s15327108ijap0303_3)
- Meta Quest Safety Centre, play-area and boundary guidance (minimum 2 m × 2 m unobstructed area
  for room-scale, buffer beyond the boundary, boundary does not detect people or pets):
  <https://www.meta.com/quest/safety-center/> and
  <https://www.meta.com/help/quest/1190192431422476/>

Manufacturer guidance is device-specific. Before summative deployment, replace the Meta
reference with the health-and-safety guidance for the headset actually in use, and have a
competent safety person confirm the two hazard controls against site rules.

## 16. Verification status

- Authored content, scoring, sequence gating, and scene composition are covered by the EditMode
  suite (`SceneCompositionTests`, `SitePracticalVisibilityTests`).
- Scene regeneration (`Safety Training > Build Prototype Scene`), the EditMode run, and headset
  verification for this module have not been executed in the environment where it was authored;
  run them before labelling a build VR-ready.
