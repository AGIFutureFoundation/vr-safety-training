# Random events

A station that runs exactly the same way every time teaches the answer key on
the second attempt, the same problem [assessment variants](ladders.md)
(`WebXR/shared/variants.js`) exist to solve for the *assessment* — but a
variant only varies hints, alarms and the clock. It says nothing about
whether the *run itself* feels different from the last one. `WebXR/shared/
events.js` is the other half: a seeded ambient-event scheduler every
SmartCiti.X station gets for free, with no station file touched to get it.

Two things live in this one module:

1. **Ambient events** — a weather shift, a passing kit vehicle, a crew member
   walking through, a radio call, a dropped tool, a mast light flicker at
   night. They change the scene. They never change the procedure or the
   score.
2. **Timing variance** on the station's own declared interruptions
   (`WebXR/shared/game.js`) — a seeded jitter on each one's `delay`, and,
   where a station declares more than two, a seeded reshuffle of which of the
   extra ones lands on which of their own steps.

Both are held to two rules by `tools/check_events.mjs`:

- **Rule 1 — scene, never procedure or score.** An ambient event never
  touches `session.step`, `session.index` or `session.score`, and it never
  counts as a hazard. If a kind cannot be shown honestly for a station
  (weather indoors, a road where there is none, a radio line with nothing
  real to say) it is simply never offered for that station — see
  `eligible()` in `shared/events.js`.
- **Rule 2 — everything is seeded.** The same room id and the same `?seed=`
  always produce the same ambient timeline and the same interrupt-timing
  jitter, so an instructor can hand a learner `?seed=7` and replay their
  exact run.

## Turning it on

| Query | Effect |
| --- | --- |
| `?events=on` | Forces events on for this attempt. |
| `?events=off` | Forces events off — always wins except see the instructor case below. |
| (unset) | The default: **off** in the base run, **on** for an assessment/pressure variant (`?variant=`) and **on** for level 11+ of a ladder chain. |

Whatever the query says, events are **always off** the instant an instructor
is already driving this run's own interruption — a live `CMD_INTERRUPT`
(`shared/observer.js`), or the station opened under a ladder task's own
`?interrupt=<id>` condition. Either way the moment they staged must not
compete with a randomly-timed one; from that point the ambient scheduler
(`state.eventsScheduler.disable()` in `smartcity/js/app.js`) fires nothing
more, though whatever already fired stays logged.

`?seed=` seeds both halves (it defaults to the station id when unset, so two
learners on the same unseeded station still see *some* ambient variety from
run to run, just not a reproducible one). It is the same query param a
`variant:` ladder condition already uses (`docs/ladders.md`), so a level task
that names a seed seeds its events too.

## Ambient events

| Kind | What it needs to be eligible | What it does |
| --- | --- | --- |
| `weather-shift` | Outdoor station, more than one weather kind available | Rebuilds the plaza's weather (`shared/weather.js`) to a different kind, drawn from the same `WEATHER_KINDS` the station's own `?weather=` condition uses |
| `vehicle-pass` | The station's district has a road — every outdoor station except the bay floor and the gym court | A kit vehicle (`shared/fleet.js`: pickup, sedan, cargo van or box truck) crosses well behind the pad and is gone |
| `crew-walkthrough` | Outdoor station | A crew figure (`standingFigure`, `smartcity/js/citykit.js`) walks across the background, then turns to watch for a moment |
| `radio-call` | The station has a real line to read — its own `supportLine`, or (failing that) the duty a crew split hands the counterpart role (`shared/crew.js`'s `splitByRole`) | The line is spoken and pushed to the events chip; **never invented** — a station with neither gets no radio-call event at all |
| `dropped-tool` | Always eligible | A clatter (`Sfx.bad()`, `shared/game.js`) |
| `mast-light` | Outdoor station, night (the stage's default hour) | A point light near the pad flickers for about a second |

`shared/events.js` decides *when* a beat fires and, for the two kinds that
need it, *which* variant of it (a weather kind, a vehicle kind) — all from the
seed. It never touches three.js, SIMS_META or the DOM: it hands the caller a
plain descriptor (`{ id, kind, payload, text, at }`) and the caller
(`smartcity/js/app.js`'s `performAmbientEvent()`) is the one holding the live
scene, so it is the one that turns a fired beat into a mesh, a light or a
spoken line. That split is also what makes the scheduler a safe no-op
wherever the caller's own three.js or SIMS_META is stubbed or missing (the
headless checkers, `tools/check_events.mjs` included) — there is nothing
three.js-shaped inside `events.js` for that to break.

## Timing variance on declared interruptions

`varyInterruptTiming(room, { seed })`:

- Jitters every interruption's `delay` by up to **±40%**, never under the 2s
  floor `tools/check_interrupts.mjs` already holds every delay to.
- Where a station declares **more than two**, reshuffles which of the ones
  after the first two lands on which of their own steps — a seeded
  permutation among that group only. The first two interruptions always keep
  the step they were authored on.
- Never changes which control answers an interruption, its wording, how many
  a station has, or whether it fires at all. A reassignment that would land
  an interruption on a step whose own target is that interruption's answer
  (turning it from something to notice into a nudge — the same rule
  `shared/variants.js` and `tools/check_interrupts.mjs` already hold every
  interruption to) is left as it was rather than silently dropped.

No station in the current catalog declares more than two interruptions yet,
so `tools/check_events.mjs` exercises the reshuffle path on a small
hand-built fixture — the same function, a case the real content does not
happen to reach today.

## The events HUD chip and the attempt record

Every fired event — ambient or not — is logged in order on
`state.eventsScheduler.log`. Two places read it:

- **The events HUD chip** (`react-ui.js`'s `EventsChip`, `#hud-events` in
  `smartcity/index.html`): the last four events this run, so a learner (and
  later, the debrief) can name what just happened rather than wonder about
  it. Empty, and therefore invisible, whenever no event has fired yet —
  including the whole of a run with events off.
- **The attempt record** (`TrainingRecords.record`, `shared/records.js`):
  carries the full log as `events: [{ id, kind, payload, text, at }]`, so an
  export or an instructor's after-action view can see exactly what the seed
  staged. `renderDebrief()` also lists it under "This run's events" on the
  results card, next to the interruption summary.

## Checking it

```
node tools/check_events.mjs
```

Runs every ambient event kind headless across ten stations spanning ten
different districts: no exception, no `NaN`, `session.step` and the score
both untouched, a weather shift only ever to a kind in `WEATHER_KINDS`, a
vehicle only where the district has a road, the interrupt-timing jitter
reproducible per seed and inside its ±40% bound, and `?events=off` firing
zero events over a long simulated run.
