# Instructor console

`WebXR/instructor/index.html` — a live view of the training sessions it can
hear, and the controls for each learner. It owns no simulation, no scoring and
no records: it speaks only the observer protocol (`WebXR/shared/observer.js`)
and reads the static catalog (`WebXR/smartcity/catalog.json`) for its roster.
Every control it offers exists as a command the learner app answers, has an
effect the learner can see, and is written into that learner's attempt record.

Open it in a second tab, a second window, or on the second monitor at the front
of the room. It hears SmartCiti.X, the Trade Skills Simulator and Holodeck.

    python3 -m http.server 8970 --directory WebXR
    # learner:   http://localhost:8970/smartcity/index.html?sim=trench-box
    # console:   http://localhost:8970/instructor/index.html

## The three views

**Live class** — one card per session: learner (their crew tag), station, app,
the step they are on out of the station's total, score, stars, corrections,
unsafe actions, interruptions answered out of the station's declared total, how
many instructor commands that session has answered, elapsed time, and when it
was last heard from. A card carries the last twelve notable events for that
learner: each unsafe action with its consequence, each command and what the app
did with it, and the verdict when the run ends. Selecting a card opens the
per-learner panel below the header.

**Roster** — the whole catalog: 23 programmes, then 17 categories holding all
202 SmartCiti.X stations and the 9 Trade Skills rooms, each with its trade,
certification, step and interruption counts, weather and par time. The search
box matches a station's id, name, category, trade, certification or tagline, and
a programme's own words or any station it contains. Each row can be sent to the
selected learner or to every live session at once.

**Session log** — every command this console sent and every event it received,
newest first, with the time, direction, kind, learner, station and detail.
**Export CSV** writes it out (`at, direction, kind, learner, station, detail`,
RFC 4180 quoting). The page itself stores nothing: closing it loses the log, and
the durable record is the learner's own attempt record.

## What each control does

| Control | Command | What the learner sees | What is recorded |
| --- | --- | --- | --- |
| Roll call | `roll` | nothing | nothing — it only asks running sessions to say hello |
| Send note | `note` | the line on their feedback rail, prefixed *Instructor:*, and read out by the screen-reader announcer | `{cmd: "note", at, detail: <the text>}` |
| Hold / Release | `freeze` | "Held by the instructor. The clock is stopped until they release it." The session is paused: the clock, the interruption fuses and the scene all stop. Release resumes from the same place | `{cmd: "freeze", at, detail: "on" \| "off"}` |
| Send selected / Send all live (Roster) | `open` | the station loads and the run starts, exactly as a deep link would open it. A programme id opens the first station in that programme the learner has not yet passed — in Trade Skills, the browser follows to that app | `{cmd: "open", at, detail: <station or programme id>}` |
| Fire now (per interruption) | `interrupt` | the station's own interruption, immediately: the alarm banner, the read-back, the scene change the station declares, its own clock and its own scoring. The button is disabled once that interruption has fired | `{cmd: "interrupt", at, detail: <interruption id>}` |
| Set weather | `weather` | a rail line naming the conditions, then the **next** station is built under that weather instead of the one it declares — rain, fog, wind, storm, smoke, overcast or clear | `{cmd: "weather", at, detail: <kind>}` |
| Set profile | `profile` | a rail line naming the profile, then the **next** station runs under that device profile: pixel ratio, shadows, weather allowance, skyline, HUD scale, contrast and background. Either a device id from `WebXR/shared/devices.js` or a bare run profile (`desktop`, `vr`, `hands`, `mr`, `seethrough`, `assisted`) | `{cmd: "profile", at, detail: <device or profile id>}` |
| Coach / Assess | `hazard-mode` | *Coach:* an unsafe action is still called out and explained once, but it is taken back off the unsafe count, so the run can still end as a pass and the learner works on through it. *Assess:* the scored behaviour — an unsafe action counts, as it does in a real assessment | `{cmd: "hazard-mode", at, detail: "coach" \| "assess"}`, plus `hazardMode` on the attempt |
| Assign (programme) | `assign` | the programme is pinned at the top of the learner's own Training programmes panel, marked *Assigned by your instructor*, with a rail line naming it | `{cmd: "assign", at, detail: <programme id>}` |

Only SmartCiti.X has a stage with weather, a device profile per station and a
programmes panel, so it answers all nine. The Trade Skills Simulator and
Holodeck answer `roll`, `note`, `freeze`, `open` and `interrupt`; a station id
the other app owns is handed over to that app rather than silently dropped.

A command the app cannot honour — an interruption that has already fired, an
unknown station, a weather kind that does not exist — is refused, and the
refusal appears in the session log with the reason. It is not recorded as an
action on the attempt, because nothing happened.

## What is logged where

Three separate places, on purpose:

* **The session log** in this console: both directions, live, exportable as CSV,
  gone when the page closes.
* **The learner's attempt record** (`WebXR/shared/records.js`, exported as CSV,
  xAPI or Open Badges from the learner's own Training Records panel): the
  finished attempt carries `instructorActions: [{cmd, at, detail}]` in order,
  and `hazardMode`. An attempt driven from a console is auditable as such — an
  assessor can see that an interruption was fired by hand at 00:42, or that the
  run was coached rather than assessed.
* **The host page**, when a simulator is embedded in an LMS: the same events go
  up through `Identity.emit` to the learner's home origin only
  (`WebXR/shared/platform.js`).

The console itself never writes to a learner's records — it cannot; the record
is written by the app that ran the attempt, in that browser.

## Untrusted text

Crew tags, station taglines, instructor notes and the interruption alerts are
all set as text nodes. There is no markup assignment anywhere in
`WebXR/instructor/js/`, and `tools/check_console.mjs` fails the build if one
appears.

## Across the network: the relay

A `BroadcastChannel` is same-origin and same-device by definition, which covers
a hall with a row of laptops or headsets mirrored to one screen. For an
instructor on their own machine, both the console and each learner app accept
`?relay=<ws url>` and put the same JSON envelope on a WebSocket as well:

    node tools/relay_server.mjs            # ws://0.0.0.0:8787
    node tools/relay_server.mjs 9100       # another port

Then open every page with the relay named:

    http://localhost:8970/smartcity/index.html?sim=trench-box&relay=ws://192.168.1.20:8787
    http://localhost:8970/instructor/index.html?relay=ws://192.168.1.20:8787

The relay is a dumb fan-out: a frame from one client is written to every other
client, unparsed and unmodified. It stores nothing, has no room concept (one
relay is one class — run a second on another port for a second class) and has no
dependencies: the built-in `http` server's `upgrade` event, the RFC 6455
handshake and a small frame reader for text, ping, pong and close. A plain
`GET` on the port answers with the client count, which is how you check it is
up.

Both legs run at once when both are available, and each side drops a message it
has already handled (every envelope carries its own id), so a console on the
same machine as a learner does not show a note twice.

What the relay is **not**: authentication, encryption, or an audit trail. Anyone
who can reach the port can send commands to every learner on it, so run it on
the training room's own network — behind a TLS terminator, with `wss://`, if it
leaves the room. Only `ws://` and `wss://` URLs are accepted from `?relay=`;
anything else is ignored.

## Protocol version

`OBSERVER_PROTOCOL` is 2. Protocol 1 — `roll`, `note`, `freeze` and the five
original events — is still accepted by both sides, so a console or an app that
predates the bump keeps working with the commands it knows.

## Checks

* `node tools/check_observer.mjs` — the protocol itself: both directions, the
  addressing rule, clipping, throttling, the roster reducer, the relay leg, the
  protocol-1 fallback, and the no-op fallback when neither leg exists.
* `node tools/check_console.mjs` — that every command is handled by the learner
  apps, recorded on the attempt, and reduced into the roster; that the console
  sets no markup and imports no simulator code; and that the catalog roster
  covers all 202 SmartCiti.X stations.

Screenshots: `docs/screenshots/console/`.
