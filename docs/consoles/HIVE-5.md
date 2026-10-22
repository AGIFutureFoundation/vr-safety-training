# HIVE-5 (`h5`, port 9132): the hive in its own room, live

Loop 10, round 5. Base e252b25f (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. This console builds on ENV-HD-4's hive
operations room, HIVE-IN-WORLD's room figures, HIVE-3's presence and HIVE-4's console tab.

Agents are software and say so: every figure keeps AGENT-AVATARS' "software agent" label, hologram tint, visor and halo, and every
screen card says "software agent". No LLM or network call: every word on a screen, in the console tab and in the new "home" line
comes from the persona and the hive's own events, jobs and metrics. Nothing listens and no voice was added. The governor's rules
stand: it checks every step, the e-stop comes first and the physical path stays disabled. `oh-voice.js` and `aa-*.js` were not
edited (AVATARS-HD-2 owns them this round).

## What is here

| File | What |
|---|---|
| `WebXR/shared/h5-ops-room.js` (new) | **The hive in its operations room.** `h5MountOpsRoom` stands every agent that holds no job at its console's spot (`room.spots.agent`, one per role, facing the video wall); an agent the hive gives a job walks out through the door and is released, and walks back in to its console when its last job ends (`h3RoomPresence`). **The screens:** `h5HiveModel` reads the hive's own events, jobs, pending requests and metrics; `h5PaintConsole` paints each console's card (name, "software agent", role, four trait bars, the jobs it holds, its last lines) and `h5PaintWall` the video wall (left: the day's feed; right: the governor's refusals with their reasons and the day's counts), through `hd4OpsScreens(room).paint(...)`, repainted at most every 400 ms after the hive changes. Small screens (balanced and the phone: 128 × 64 cells) take the agent's colour, bars and a talk light, no words. **Budget:** `h5LiteFigure` rebuilds each primitive part of AGENT-AVATARS' figure with fewer segments (same parts, materials, label, visor, halo), 1,008 → 408 triangles a figure, so seven fit IX_BUDGET with the room; `H5_OPS_TEXTURE_SCALE` (high 1, balanced 0.35) keeps balanced inside 3 MiB. |
| `WebXR/shared/h5-hive-live.js` (new) | **The console link.** `h5LivePublisher` posts a snapshot of the panel's own hive (lines, refusals with reasons, held jobs, waiting requests, counts) on a same-origin `BroadcastChannel` after each hive step while the learner keeps "Show on the console (this device)" on; `h5MountLiveToggle` puts that button in the panel's row (off by default, never remembered, the panel's 44 px rule on a phone); turning it off or leaving the page tells the tab to drop what it holds. `h5LiveReader` is the tab's receive-only side (stale after 6 s). No request, no storage. |
| `WebXR/shared/oh-hive.js` | `ohHive({ homeward })`, off by default: an agent whose last job ends away from its home site walks home (a `move` with `home: true`, no job id, and its own line). Nothing goes to the chain; `metrics().homeMoves` when on. |
| `WebXR/shared/oh-say.js` | The talk kind `home` in English and Spanish (`OH_CORES_TALK.home`, `OH_CORES_TALK_ES.home`), the site slotted from the event. |
| `WebXR/shared/oh-panel.js` | The panel's hive turns `homeward` on (one option). |
| `WebXR/shared/hw-hive-world.js` | `hwSyncRoom` hands the ops room (`hd4-hive-ops`) to `h5MountOpsRoom`; the robot rooms keep `hwMountRoomAgents`. |
| `WebXR/instructor/js/h4-hive.js` | The Omega Hive tab shows the learner's own hive live (heading "Omega Hive (live, read-only)", the live hive minute, cards, lines, queues, refusals, counts) when a snapshot is fresh; otherwise the seeded replay, as before. Still read-only: no storage, no post, no approve or decline, one fetch (the evals JSON). |
| `WebXR/parishes/js/app.js` | The publisher and its toggle, only where the hive panel is mounted (its own gate: signed in, adult, not K-12, not the demo); `pagehide` turns it off. `window.__parishTest.hiveLive`. |
| `tools/check_hive5.mjs` (new) | Five sections and the EVAL lines below; in `check_all.mjs`, with an **estimated** row in `docs/perf/checkers-baseline.json`. |
| `tools/bundle_webxr.py` | `h5-ops-room.js` and `h5-hive-live.js` in the parishes bundle (after `hd4-rooms.js`, before `hw-hive-world.js`); `h5-hive-live.js` in the instructor bundle before the tab. |

## Evals (before → after)

| Measure | Before (e252b25f) | After | Source |
|---|---|---|---|
| Ops-room screens painted from the hive | **0** (ENV-HD-4's procedural placeholders; 0 words) | **8 of 8** (7 consoles + the wall), high: 93 words on the seven cards, 22 on the wall at hive minute 150; every painted line is the head of one of that agent's own lines; the wall lists the last 4 refusals by job id and "physical dispatches 0" | `check_hive5` §1 |
| Texture bytes added by the screens | — | **0** (the room's own canvases: high 18.67 MiB before and after; meshes and triangles unchanged) | `check_hive5` §1 |
| Agents standing in the ops room on entering | **0** (`hwSyncRoom` returned null for a room that is not `ixr-*`) | **7 of 7** on high and balanced, each at its role's spot facing the wall; phone 0 (builds none) | `check_hive5` §2 |
| Ops room with seven speaking figures (meshes / triangles / texture) | 7 standard figures would make 9,078 triangles on high (over IX_BUDGET's 6,000) | **high 88 / 4,878 / 21.58 MiB** (≤ 120 / 6,000 / 24 MiB); **balanced 84 / 4,190 / 2.77 MiB** (≤ 120 / 6,000 / 3 MiB); phone 20 / 954 / 2.42 MiB unchanged | `check_hive5` §2; `$SP/loop10/h5/measure-ops.mjs` (the before) |
| A figure in the ops room | 1,008 triangles (meshes) | **408** (h5LiteFigure) | `check_hive5` §2 |
| Out to jobs and back (seed 1, 480 steps) | none | **107 out, 107 back**; inside IX_BUDGET and IXR_TEX_BUDGET **480 of 480** steps on high and on balanced; at its console exactly while it holds no job 3,360 of 3,360 agent-steps | `check_hive5` §2 |
| Console tab live lines (local, 0 network) | **0** (seeded replay only) | headless: **140** lines a snapshot after 40 steps, one snapshot per step with events, every line one of the hive's own captions; drive: **52** lines and **36** refusals in the tab at hive minute 261 (the page's own minute), 0 storage keys; off → the replay | `check_hive5` §3; drive B |
| Outdoor go-home | **0** (the hive had no home move; HIVE-3 "Read honestly") | **89 of 89** home moves (one after every completion that left the agent away from home holding nothing), 89 of 89 lines grounded; the outdoor figures where the hive says 7 of 7; idle agents home outdoors at the day's end 7 of 7 | `check_hive5` §4 |
| Governor with homeward on | 150 of 150 checked, physical 0 (homeward off) | **150 of 150** dispatched jobs checked, **3,061 of 3,061** steps monitored, **0** physical; completed 144 with and without | `check_hive5` §4 |
| Default hive (round 3's events) | digest 703aa91da7bb9439 | **unchanged** (homeward off by default) | `check_hive4` §1 |
| In the page (oak-west-oakland, high, SwiftShader): the ops room on entering at a quiet minute | — | **7 of 7** standing at hive minute 159 (the page's first quiet minute after 150), **8 of 8** screens painted; **88 meshes, 4,878 triangles built** (the checker's figure exactly), 88 draw calls, 4,292 triangles drawn, 3 lights, 19.25 MiB; in the next 20 minutes 6 walked out and 5 back (drive 2: from minute 259, 7 out, 8 back, all seven at their consoles again at 279) | drives 2 and 3 (`$SP/loop10/h5/drive2.txt`, `drive3.txt`) |
| Console tab live, in the page | 0 (replay only) | **live** at the page's own hive minute (261): 7 cards, 7 "software agent" labels, 52 lines, 36 refusals; 0 storage keys; the learner's "off" → back to the replay | drive 1 (`$SP/loop10/h5/drive1.txt`) |
| The console link's toggle on a 390 × 844 touch phone (signed in) | none | **284 × 44 px**; the panel row 6 of 6 buttons ≥ 44 px; no sideways scroll; page errors 0 | `$SP/loop10/h5/drive_phone.txt` |
| Page errors / off-host requests | — | **0 / 0** in all four drives (the three for the stills: 69 s, 71 s, 83 s; the phone) | drives 1–3, `drive_phone.txt` |

## Cycles (reason → act → observe)

1. **Measure before designing.** Reason: seven figures must fit IX_BUDGET in the ops room. Check: build the room with seven
   AGENT-AVATARS figures headless (`$SP/loop10/h5/measure-ops.mjs`). Observe: 88 meshes but **9,078 triangles** on high and 8,390 on
   balanced, over 6,000; a figure is 1,012 triangles (head 216, capsule torso 272, halo 288, talk light 140). Act: lighten the
   figures in this room only (`h5LiteFigure`), without touching `aa-*.js`. Then 4,878 / 4,190.
2. **Home after a job without moving round 3.** Reason: a hive move home changes the events. Check: `check_hive4` §1's digest and a
   seeded day with and without. Act: `homeward`, off by default, on in the panel. Observe: digest unchanged; 89 home moves, 89 of 89
   grounded, governor 150 of 150, completed 144 both ways.
3. **The checker's first run: 4 failures.** The canvas stub had no gradients (ENV-HD-2's skins draw them): fixed in the stub. **A real
   bug:** `standing()` counted the phone tier's unbuilt figures as standing (seven "standing" with no figure): it now needs a built
   figure. The live post count (33 for 40 steps) was a wrong check: a step without events sends no snapshot; the check is now exact
   (1 + steps with events). The instructor-bundle slice in §5 was too short. Then §1–4 passed.
4. **The wall's counts were cut.** Reason: the screens must say "physical dispatches 0". Check: §1. Observe: `h5Fit` cut the
   one-line footer before it. Act: two footer lines. Then §1 passed.
5. **An exact go-home expectation.** §4 first expected 74 against 89 home moves: an agent that went home and won a new job in the same
   step was missed. Act: a listener check (every completion that leaves the agent away and idle must be followed by its home move
   before the next completion). Observe: 89 of 89.
6. **Neighbours.** `check_hive4` 11/0, `check_hive3` 32, `check_hive_world` 35/35, `check_hd4` 118, `check_omega_hive` 15/0,
   `check_voices` 10/0 on the first run after the change.
7. **The drive.** Reason: stills of the room with the seven at their consoles and of the tab live. Act: `drive_h5.mjs` (one browser
   context, so both pages share the channel). Observe: the tab went live (52 lines at minute 261, the page's own) and fell back to the
   replay on "off"; but the drive's stop rule for "all seven free" counted requests waiting for the learner, which no agent holds, so
   the room had 6 of 7 at minute 261 (Lio out on a job). A headless scan of quiet minutes did not match the page either (minute 259
   was quiet headless and busy in the page). Act: `drive_h5b.mjs` steps the page itself to its first quiet minute after 150.
   Observe: minute 159, 7 of 7 standing, 8 of 8 painted, the in-page build 88 meshes / 4,878 triangles, page errors 0, off-host 0.
8. **The tab's own intro.** Looking at the console still, the static intro above the tab (HIVE-4's text in `index.html`) still said
   "a replay of the hive's seeded day". Act: it now names both (the learner's own hive when shared, otherwise the replay).

## Checkers (single runs)

- `node tools/check_hive5.mjs`: **5 passed, 0 failed** (sections 1–4 passed before the docs existed; 5 checks the docs too).
- `node tools/check_hive4.mjs`: 11 passed, 0 failed (§1 the default day's digest 703aa91da7bb9439, §8 the tab still read-only), run
  again after the `index.html` intro fix. `check_hive3`: all 32 pass. `check_hive_world`: all 35 pass. `check_hd4`: all 118 pass.
  `check_omega_hive`: 15 passed, 0 failed. `check_voices`: 10 passed, 0 failed. `check_console`: all instructor-console checks pass.
- `node tools/check_imports.mjs`: all 1,126 modules call only what they declare or import. `node tools/check_newton.mjs`: 60 checks,
  0 failed. `node tools/check_parse.mjs`: all 2,705 shipped modules parse.
- `UX_PORT=9132 node tools/check_interface.mjs`: **OK, 21 passed, 0 failed** (it loads signed out, so the hive panel is not
  mounted there); the new toggle measured signed in on a 390 × 844 touch phone: **284 × 44 px**, the panel row's 6 buttons all
  ≥ 44 px, no sideways scroll, page errors 0 (`$SP/loop10/h5/drive_phone.mjs`, `drive_phone.txt`, `h5-phone-toggle.png`).
- Not run: `tools/check_all.mjs` (the coordinator gates), `eval_content` (no station added), `eval_worlds` (no world subject).

## Stills (`$SP/loop10/h5/`, 1920 × 1080, each looked at)

- `h5-ops-room.png` (for the deck): the hive operations room at hive minute 159 of the page's seed-1 hive (oak-west-oakland, high),
  from the door-side corner. All seven agents (Orrin, Selka, Brann, Ivo, Tamsa, Lio, Quen) stand at their consoles under their
  "software agent · <role>" labels; the wall's left panel reads "Today's feed · hive minute 159 (02:39)" with Brann's home line ("Hey
  all, heading back to Distribution Robot Aisle (procedural)"), the right panel the governor's and the steward's refusals with their
  reasons and the counts; each console screen carries its agent's card. The page's overlays are hidden for the still.
- `h5-ops-room-centre.png`: the same minute from behind the middle of the arc: the seven figures, the cards on the screens, both wall
  panels and the room's honesty sign ("a generic room for this kind of site — not a model of the real building").
- `h5-console-live.png`: the instructor console's Omega Hive tab, "Omega Hive (live, read-only)", reading the learner's hive at
  minute 261 (the page's own minute): the counts, and each card's live queue and last lines, under the corrected intro (re-shot after cycle 8; drive 4, 14 s, page errors 0, off-host 0).
- Kept from drive 1 (minute 261, 6 of 7, overlays visible): `h5-ops-room-b.png` and `h5-ops-room-c.png` (a close view of three cards
  and the refusals panel).

## Read honestly

- The figures in the ops room are coarser than outdoors (408 triangles against 1,008): seen from the room's distance they keep their
  parts, colours, label, visor and halo, but the head and torso are visibly faceted. It is the only way seven fit with the room inside
  IX_BUDGET without editing AGENT-AVATARS' module; a lighter figure from AVATARS-HD (their item 3) should replace `h5LiteFigure`.
- "At its console" means "holds no job", read from the rooms' own presence. In a busy part of the day most agents are out: at hive
  minute 261 of seed 1 the page held 11 jobs. The seven stand together at the start of the day and whenever the hive is quiet.
- The console link carries what the panel shows and nothing else, but it is the learner's own hive: it is off by default, never
  remembered, and dropped by the tab on "off" or after 6 s of silence. A `BroadcastChannel` reaches only pages of the same origin
  in the same browser profile; it is not a network path. The Spanish toggle text is machine-assisted.
- The home move has no job and goes nowhere near the governor; it changes the hive's own idea of where an agent stands, so the next
  bids count hops from home (seed 1's outcomes did not change: 144 completed both ways).

## Seams

- `h5MountOpsRoom({ three, room, agents, source, tier, reducedMotion, mount, repaintMs })` → `{ room, placed, avatars, presence,
  screens, animate, sync, paint, standing, painted, leaving, log, counts, dispose }`; `hwSyncRoom` calls it for `hd4-hive-ops`.
- `h5LiteFigure(THREE, group, caps)`, `H5_LITE_CAPS`, `H5_OPS_TEXTURE_SCALE`. **AVATARS-HD:** replace with your lighter variant
  when it lands (pass it as the mount, or drop the call in `lite()`).
- `h5HiveModel(source, agents)`, `h5PaintConsole(ctx, w, h, card, text)`, `h5PaintWall(ctx, w, h, model, text, agents)`,
  `H5_SCREEN_TEXT` (en, es). `globalThis.hd4OpsPainter` is not set: without the hive (signed out, K-12, demo) the placeholders stay.
- `ohHive({ homeward })`; move events with `home: true`; the talk kind `home`; `metrics().homeMoves`.
- `H5_LIVE_CHANNEL`, `H5_LIVE_SCHEMA`, `h5LiveSnapshot`, `h5LivePublisher`, `h5MountLiveToggle`, `h5LiveReader`;
  `h4MountHiveTab(root, { seed, steps, Channel })`; `window.__parishTest.hiveLive`.

## Left

- A lighter figure from AVATARS-HD for the ops room (and an HD option for the nearest console), replacing `h5LiteFigure`.
- The figures walk straight from the door to their spots; a route round the consoles (the room's colliders) would be better for the
  outer consoles.
- The ops room's screens on balanced and the phone show no words (128 × 64 cells); a 256 × 128 cell on balanced fits its 3 MiB.
- The Spanish screen text and toggle need a native speaker's review, like the rest of the Spanish pack.
- `check_hive5`'s baseline row is an estimate; re-measure on a quiet gate. The dist bundles were rebuilt for the drive and restored.
