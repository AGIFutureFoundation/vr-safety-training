# Accessibility statement — SmartCiti.X ~VR Simulators, Trade Skills Simulator, Holodeck

_Self-assessment. Last reviewed 2026-09-18 against WCAG 2.1 Level AA and the Section 508
refresh (36 CFR 1194, which adopts WCAG 2.0 AA). No third-party audit has been carried out,
and this document says so rather than implying one. Where the network does not conform, that
is stated plainly below instead of being left out._

## Why this document exists

A training centre funded with public money cannot buy a simulator it cannot make available to
every apprentice in the hall, and a procurement officer will ask for this statement before
anything else. More to the point, a worker who uses a keyboard, a screen reader or reduced
motion belongs in the trade, and a simulator that locks them out is a worse simulator.

## Scope

This statement covers the flat-screen (desktop and laptop) mode of all three applications, the
portal, the credential verifier and the instructor console. It does **not** claim conformance
for the AR and VR modes; see "What does not conform" below.

## Operating the simulators without a pointer

The whole procedure is operable from the keyboard in flat mode. Nothing in a station requires
a mouse, a trackpad or a touchscreen.

| Key | What it does |
|---|---|
| `Tab` / `Shift`+`Tab` | Move through the controls this step can act on, in the order the procedure names them |
| `←` / `→` | The same, for a learner who finds the arrows easier than Tab |
| `Enter` | Take the control in focus: select it, mark it, commit a reading, or pick up and place an item |
| `Space` (held) | Hold a control that has to be held — a wash wand, a test button, a tracked reading |
| `↑` / `↓` | Work an analogue control: move a gauge reading, turn a valve, correct a drifting reading |
| `Esc` | Close the topmost overlay, or leave the station for the hub |
| `W` `A` `S` `D` | Walk, for a learner who wants to; it is never required to complete a procedure |
| `M` | Mute or unmute the sound |

The control in focus is highlighted in the scene exactly as a pointer hover highlights it, and
is read out as a sentence that says what it is, where it sits in the list, and which key works
it — for example, "gross decon pool. 2 of 3. Press Enter to take it in turn."

## Screen readers

Every line the applications speak aloud is also written to an ARIA live region, whether or not
the synthesised voice is switched on or muted. That covers each new step with its number, title
and cue; the name and operating instructions of the focused control; every piece of feedback;
and the verdict at the end. Unsafe actions are written to an assertive region, because a hazard
is an interruption; everything else is polite. The regions are clipped rather than hidden, so
they are not skipped.

The 2D interface — the intro, records, programmes, pre-brief, results, editor, verifier and
instructor console — is built from real elements with accessible names, is reachable by Tab, and
its dialogs carry `role="dialog"` and `aria-modal`.

## Reduced motion

When the operating system asks for reduced motion, the plaza holds still: the weather, the
district animation, the skyline beacons and the celebration effects stop. The station itself
keeps moving, because a valve that does not turn when you turn it is not a simulator. Interface
animations are already reduced by the same media query.

## Colour and contrast

No instruction, state or verdict depends on colour alone. A gauge and a tracked reading both
print their value as text ("54 psi", "steady", "too hard") next to the coloured band; a pass or
failure is the word PASSED or NOT PASSED as well as a colour; step completion is a tick as well
as a colour; hazards are a full sentence. Body text and interface chrome are dark-on-light-text
combinations at or above the 4.5:1 ratio, and the large display type is above 3:1. This has been
checked by eye and by the design tokens, not by an automated sweep of every rendered state.

## Language, timing and seizure safety

Pages declare `lang="en"`. Nothing in a station has a time limit that ends the task: the par
time is scoring information, not a cut-off, and a learner who takes four times par still
completes and still records an attempt. There is no content that flashes more than three times
a second. The storm weather includes lightning; it fires at most once every five seconds, is
brief, and is switched off with reduced motion or by choosing a different condition.

## What does not conform

- **The AR and VR modes are not keyboard-operable and are not claimed to conform.** A headset
  session is hand controllers and head tracking by definition. The accessible path is the
  flat-screen mode, which runs the same procedure, scores it with the same engine, applies the
  same hazards and writes the same training record — so a learner who cannot use a headset is
  not on a lesser version of the course, and their record is not a lesser record.
- **The 3D scene is not exposed as an accessibility tree.** A screen reader hears the procedure,
  the focused control and the feedback, but it cannot explore the scene freely the way it can
  explore a page. Finding something by looking around is therefore a visual task; every step
  that depends on it (`find` steps) also names what is to be found in words.
- **No third-party audit or assistive-technology test lab has reviewed this.** The statement is
  a self-assessment by the people who wrote the code. Testing with real screen-reader users is
  a funded roadmap item and has not happened.
- **Speech input is convenience, not an input method.** The voice commands need a browser
  speech API and a quiet room; nothing requires them.
- **The single-file bundles are large.** A station page is a few hundred kilobytes before the
  3D library; on a slow connection the first load is slow. There is no low-bandwidth mode yet.

## Reporting a barrier

If something here keeps you or a learner out, that is a defect and we want it filed like one.
Open an issue on the repository describing what you were trying to do, what happened, and the
browser and assistive technology you were using. Barriers reported by a training centre take
priority over roadmap work.

## How this was evaluated

By keyboard-only walkthrough of representative stations in each interaction kind (select,
sequence, find, gauge, hold, track, turn, drag); by reading the live-region output; by forcing
reduced motion; and by an automated check (`tools/check_a11y.mjs`) that runs on every commit.
That check verifies the live region is a real clipped status region, that the keyboard cursor
walks a step's controls in procedure order, that every step kind tells the learner which key
works it, and — across all 56 procedures — that every step has a title, a cue and a rationale in
words, that every item in a multi-target step is named in words, that every graded control
prints its value as text, and that every hazard explains itself in a full sentence.
