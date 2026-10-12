# AVATARS-HD (`ah`, port 9121): the hive's agents in high resolution, their bodies driven by the hive

Loop 10, round 4. Base 048869d5 (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. This console owns AGENT-AVATARS'
files (`aa-agent-avatars.js`, `aa-agent-portraits.js`) and the figure code. HIVE-4 owns `oh-*.js` and the instructor console's
hive tab. Neither edited the other's files.

The agents are software and look it. Every figure keeps the "software agent · <role>" label. The high-detail figure is a cool
porcelain shell with graphite joints, a glowing role-coloured visor band with the eyes on it, a thin halo and role-coloured caps.
It has no skin tone anywhere: the checker measures the head and hands against crew.js's twelve tones. No figure has a real
person's likeness: each is built from its persona's own numbers. Geometry is procedural. Nothing calls a network, speaks or
listens in these modules.

## What is here

| File | What |
|---|---|
| `WebXR/shared/aa-agent-hd.js` (new, no imports) | The high-detail figure. `aaHdSpec(agent)` gives body, role colours, outfit and posture from the traits. `aaHdGeometry(spec)` builds plain arrays: rounded lathed torso and head, tapered limbs with rounded joints, jointed arms with mitten hands and a thumb, feet. Brows and mouth are on their own bones. The glow is the visor band, the eyes, the halo, the badge and the tablet's screen. `aaHdBuild(three, agent)` makes one skinned body, one unlit skinned glow and the mouth's lit opening on one skeleton (23 bones). `aaHdPose(spec, st)` is the pure pose. `aaHdRender` is a small software rasteriser for portraits and silhouettes. `aaWordOnsets` and `aaHdMouth` time the mouth. `AA_HD_BUDGET`. |
| `WebXR/shared/aa-agent-avatars.js` | `aaMountAgentAvatars({ hd })`: with `hd: true` the mount builds the high-detail figure on the desktop high tier only. Balanced keeps today's figure, the phone tier builds none, and a three.js without skinning (the checkers' stub) builds today's figure. Every frame poses the figure: posture, walk, mouth and beat hands, blink and the current gesture. Gestures come from the hive's own events (`AA_GESTURE_FOR`): bid → raise, award → accept, refused → stop, the speak about "approved" → approve (a nod), complete → nod. `talkWord(id, charIndex)` takes a voice's word boundary. `aaVoiceHooks(world, id)` gives `{ onstart, onboundary, onend }` for a voice's `say()`. `state()` reports `mouth`, `hd` and `boundaries`; `counts()` reports `hd`. |
| `WebXR/shared/aa-agent-portraits.js` | Portraits drawn from the new figure. `aaPortraitFigureRgba(agent, px)` takes the same spec, geometry and rest pose through the rasteriser: head and shoulders on the card colour with the card's corners. `aaPortraitFigurePng` caches it as a PNG. `aaPortrait(agent, { size, scale })` is the seam HIVE-4's tab calls: it shows the SVG badge at once, then the figure portrait at size × scale (2× or 3×). `aaPortraitImg` now returns the same, so the hive panel's cards and the governance roster change with no edit to their files. The card layout is unchanged. Tokens keep the SVG raster. |
| `WebXR/parishes/js/app.js` | The outdoor avatar mount passes `hd: true` (one option). |
| `tools/bundle_webxr.py` | `aa-agent-hd.js` goes before `aa-agent-portraits.js` in the parishes and the instructor bundles. |
| `tools/check_agent_avatars.mjs` | Section 9, AVATARS-HD: 22 new checks (70 → 92). The rest of the checker still runs on the stub; section 9 imports the vendored three.js r160 (nothing renders). |
| `tools/drive_avatars_hd.mjs` (new, not in the gate) | The headless drive of the built pages. A is the per-tier cost in the page. B is the 1920×1080 stills and the draw calls with the seven in view. C is the instructor roster at 2× and 3×. |

**Budget, stated:** `AA_HD_BUDGET` per figure on the desktop high tier is 12 meshes + sprites (crew.js `CT_AVATAR_BUDGET`, as
today), 3,000 triangles, and 3 draw calls silent / 5 speaking. Balanced and the phone tier do not change. The robotics rooms keep
today's figure: three HD figures at about 2,700 triangles would take the cell hall (1,688 triangles of shell) past
`IX_BUDGET`'s 6,000 on high. A mount that does not ask for `hd` keeps today's figure, and the checker proves it.

## Evals (before → after)

| Measure | Before (048869d5) | After | Source |
|---|---|---|---|
| Triangles per figure, phone (low) | 0 (no figure) | **0** (no figure) | `check_agent_avatars` §9b; drive A |
| Triangles per figure, balanced | 1,012 | **1,012** (today's figure) | §9b |
| Triangles per figure, high | 1,012 (today's figure) | **2,693 mean, worst 2,774** (budget 3,000) | §9b, real three.js geometry |
| Meshes + sprites per figure, high | 11 (9 + 2) | **5** (3 meshes + 2 sprites; ≤ 12) | §9b |
| Draw calls per figure, silent / speaking | balanced 9 / 11; high 9 / 11 | balanced **9 / 11**; high **3 / 5** | §9b (visible meshes + sprites; one material each) |
| Draw calls and triangles in the page, the layer shown against hidden | see the next table | see the next table | drive A, B |
| Distinct silhouettes (front, IoU ≤ 0.9) | 18 of 21: three agents share the average body, IoU 1.000 | **21 of 21**; most alike dispatcher/logistics 0.844, median 0.677 (before: median 0.828) | §9d |
| Personality in the body (Spearman ρ over the seven) | — (no posture) | caution ↔ upright **0.89**, warmth ↔ open stance **1.00**, verbosity ↔ hand motion while speaking **1.00**, formality ↔ tidy silhouette **0.93** | §9e |
| Mouth timing, stubbed voice (word boundaries) | no mouth | within **15.3 ms** of each boundary, **20 of 20** within 25 ms | §9f |
| Mouth timing, voice off (caption word timing) | no mouth | within **20.0 ms** of each word onset, **20 of 20**; closes between words 19 of 19 | §9f |
| Gestures fired per event type (real hive, seed 1, 120 steps, a seeded stand-in learner who approves) | stop 20, nod 45; no raise, accept or approve | bid → raise **200 of 200**, award → accept **67 of 67**, refused → stop **20 of 20**, approved → approve **47 of 47**, complete → nod **45 of 45** | §9g |
| A refusal's stop hand held for its full 1.8 s (real hive, every frame sampled) | 15 of 20 (a bid's raise or an award's accept cut five short) | **20 of 20** (9 gestures waited behind a stop; 4 replaced while waiting) | §9g |
| Each gesture's pose, measured on the bones mid-gesture | — | **5 of 5** (raise: hand above the head; accept: hand at the chest; stop: hand forward and up, palm out; approve and complete: head pitch > 0.2) | §9g |
| No skin tone on the head and hands | — | closest **0.177** RGB to crew.js's 12 tones (≥ 0.15) | §9c |
| Portraits from the new figure | SVG badges rasterised at 2× | **22 of 22** at 96 px (2×) and 144 px (3×), distinct 11 of 11. In the built instructor console: **11 of 11** cards drawn from the figure, 96 px PNGs at 48 px on a 2× screen and 144 px on a 3× screen | §9j; drive C |
| Phone tier in the page | 154 calls, 56,062 triangles | **154 / 56,062**, unchanged with the layer | drive A |
| Page errors / off-host requests | — | **0 / 0** | drive (second full run, `$SP/loop10/ah/drive-out-2.txt`) |

**In the built page** (`node tools/drive_avatars_hd.mjs 9121`, section A). This is sf-downtown, signed in, with the camera 24 m
south of the first robot site looking at it. Six figures are in view: the two hive agents homed there and the four VBRIDGE
personas. "Without" is the same frame with the agent layer hidden. The machine was shared (load average 7–10), which changes
frame times, not these counts.

| Tier | Draw calls without → with the agents | Triangles without → with | Layer: figures (HD) / meshes / sprites / triangles |
|---|---|---|---|
| low (phone) | 154 → **154** | 56,062 → **56,062** | 0 (0) / 0 / 0 / 0 |
| balanced | 195 → **249** (+54, 9 a figure) | 116,754 → **121,974** (+5,220) | 6 (0) / 54 / 12 / 6,072 |
| high | 194 → **212** (+18, 3 a figure) | 163,576 → **179,864** (+16,288) | 6 (6) / 18 / 12 / 16,588 |

On high before this console (048869d5), the figure was today's figure, the one balanced still builds: 9 draw calls and 1,012
triangles a figure (`check_agent_avatars` §9b measures a high-tier mount without `hd`). Six of them in this frame would add 54
calls and about 5,200 triangles. The high-detail figure trades about two-thirds of the agents' draw calls for about three times
their triangles: 18 calls against 54, and 16,288 triangles against about 5,200. With all eleven figures in view at 1920×1080
(section B), the layer adds 22 to 33 calls on high and 75 to 85 on balanced across three runs. B's "without" frame comes one
streamed frame later, so its deltas move from run to run and its triangles are not used. Section A's frames are stationary
and are the measure: balanced was +54 calls and +5,220 triangles in the cleaner first run, and high +18 calls in both runs.

## Cycles (reason → act → observe)

1. **An HD figure inside the budget.**
   - Reason: build the figure from code and keep it inside the ceiling. Check: real three.js r160 in node, meshes + sprites ≤ 12
     and triangles ≤ 3,000.
   - Act: `aa-agent-hd.js`: one skinned body, one skinned glow, the mouth.
   - Observe: 3 meshes + 2 sprites, 2,618 to 2,770 triangles. **Failed by eye**, though: the first render mixed the role colour
     into the whole shell, and the red steward and the pink trainer looked like skin.
2. **No skin tone where skin would show.**
   - Reason: the agents must not read as people. Check: §9c, the head and hands at least 0.15 RGB from crew.js's twelve tones,
     and the portrait sheet by eye.
   - Act: a cool porcelain shell. The role colour goes only on the visor band, the halo, the shoulder caps, the belt, the badge
     and the collar or yoke.
   - Observe: closest 0.177. The sheet reads as seven software agents. Passed.
3. **Wired in without moving anyone else's numbers.**
   - Reason: HD only where asked. Check: `check_agent_avatars` 70/70, `check_hive_world`, `check_hive3`.
   - Act: the `hd` option, `aaBuildHdFigure` and a pose every frame.
   - Observe: 70/70 and hive3 32/32, but **hive_world failed 34/35**. It greps the mount line's ending `route: …, blocked: … });`.
     I moved `hd: true` after `tier:`; then 35/35. Committed e54d7144 with cycles 4 and 5.
4. **The evals in the checker.**
   - Reason: measure silhouettes, posture, mouth timing and gestures. Check: the §9 lines.
   - Act: section 9.
   - Observe: **four failures**:
     - The personas had no home site in the test, so no figure was built.
     - The voiced test claimed the mouth was shut before onstart. It is not: the line runs on the caption's timing until the
       voice starts (h3-next item 2).
     - The tolerance was one frame, but the measured error includes the mouth's rise to 15% open.
     - Approvals were 0 of 0 because nobody approved.
   - Fixed: a home site; the voiced claim scoped to after onstart; a 25 ms tolerance fixed before the re-run; a seeded stand-in
     learner who approves (not a person). Then 89/89.
5. **Portraits from the figure at 2× and 3×.**
   - Reason: the roster shows the new figure. Check: §9j 22 of 22, deterministic and distinct, and a contact sheet by eye.
   - Act: `aaPortraitFigureRgba`, `aaPortrait`, and `aaPortraitImg` delegating to them.
   - Observe: a crash, because the checkers' DOM stub has no `dataset`; guarded. Then 91/91. The sheet shows the visor band,
     eyes, brows, mouth, halo and outfit.
6. **The cost and the look in the built page.**
   - Reason: measure the page, take the stills. Check: drive A, B and C; page errors 0; every still looked at.
   - Act: `tools/drive_avatars_hd.mjs`.
   - Observe: the first run crashed. `window.__parishTest.scene` is now the exteriors' shot preset, not the three.js scene, so
     the drive counts the agent layer only. The next run passed A, B and C, but two things failed:
     - The stills showed the start menu over the agents, and the speaking still was framed too close to read the mouth.
     - The roster screenshot's clip lay below the fold and stopped the run before the page-error count.
   - Fixed: the page's panels are hidden for the still (the canvas stays), the agents stand 1.75 m apart so the labels clear, the
     earlier lines end before the row still, the speaking camera is wider, and the roster shot scrolls into view.
   - Third run: all steps pass, page errors 0, off-host requests 0 (`$SP/loop10/ah/drive-out-2.txt`).
7. **The figures in the page's light.**
   - Reason: the stills must show software agents, not coloured people. Check: look at every still.
   - Observe: the porcelain shell was right in the rasteriser, but in the page the body material's role-colour emissive (0.12)
     tinted every shell and joint. Lio's head read greyish-tan in shade and his legs brown; Selka read as a red suit.
   - Act: the body's emissive is now a cool blue-grey lift (0x5a6e82 at 0.5), so the role colour stays on the visor band,
     halo, caps, belt, badge and collar or yoke.
   - Observe: §9 unchanged (91/91); stills retaken with section B (`drive-out-3.txt`) and looked at again.
8. **A stop hand held in full.**
   - Reason: a bid's raise or an award's accept could cut a refusal's stop hand short when both reach one agent within 1.8 s.
     Check: a new §9g line samples every agent's posed gesture every frame of the real hive's run; no frame inside a stop's
     window may show raise or accept.
   - Observe, before (the previous commit's module under the new line): **15 of 20** stops held; five were cut.
   - Act: raise and accept wait behind a stop and start where it ends (at most one waits; a newer one replaces it). A newer stop
     or nod still wins.
   - Observe: **20 of 20**. 9 gestures waited and 4 were replaced while waiting; every event type is still logged N of N.
     92/92. Committed 51d7a2f6.

## Stills (1920×1080, `$SP/loop10/ah/`, each looked at)

| File | What |
|---|---|
| `ah-seven-high.png` | The seven hive agents in a row at the SoMa robot cell on the high tier: the high-detail figure, each labelled. |
| `ah-seven-balanced.png` | The same row and camera on balanced: today's figure, for comparison. |
| `ah-speaking-high.png` | Orrin (dispatcher) speaking one of the hive's own lines (seed 1), replayed on him. The mouth is open (0.91) and the caption reads "Orrin (software agent): Posting vbjob-… for Distribution Robot Aisle (procedural): …". |
| `ah-stop-high.png` | Lio (logistics) raises the stop hand, palm out, on the hive's own over-speed refusal. The caption reads "Stopped: over-speed". |
| `ah-roster-3x.png` | The instructor console's governance roster at device pixel ratio 3: eleven portraits drawn from the figure. |

To reproduce: `python3 tools/bundle_webxr.py parishes instructor`, then `node tools/drive_avatars_hd.mjs 9121 <dir> B` for the
stills (`ABC` for everything). The drive signs in on sf-downtown and steps the page's own hive (seed 1) to collect its lines and
refusals. It sends the seven to the SoMa cell through the mount's `move` events and stands them 1.75 m apart for the capture. The
drive writes those positions and holds the mount's `animate` while each frame is taken. It runs the mount's own clock to the
moment wanted (mouth over 0.9; mid-gesture), and hides the page's panels.

## Checkers (single runs)

- `node tools/check_agent_avatars.mjs`: all 92 checks pass (70 before).
- `node tools/check_hive_world.mjs`: all 35 checks pass.
- `node tools/check_hive3.mjs`: all 32 checks pass.
- `node tools/check_avatars.mjs`: all avatar checks pass.
- `node tools/check_console.mjs`: all instructor-console checks pass.
- `node tools/check_imports.mjs`: all 1119 modules call only what they declare or import.
- `node tools/check_parse.mjs`: all 2698 shipped modules parse.
- `node tools/check_newton.mjs`: 60 checks, 0 failed.
- `python3 tools/bundle_webxr.py parishes instructor && node tools/drive_avatars_hd.mjs 9121 $SP/loop10/ah`: all drive steps
  pass, page errors 0, off-host requests 0.
- `docs/perf/checkers-baseline.json`: the `check_agent_avatars` row is raised from 1.5 s to 4 s. It is still an estimate, not a
  measurement (section 9 adds three.js, 14 silhouettes, 22 portraits and a 120-step hive); re-measure on a quiet gate.
- `check_interface`: not run, because no control was added or changed (portraits are images in the existing cards).
- Not run: `tools/check_all.mjs` (the coordinator gates), `eval_worlds` and `eval_content` (no world subject or station changed).

## Seams

- **HIVE-4's hive tab:** `aaPortrait(agent, { size = 48, scale = devicePixelRatio (1..3), kind = "portrait" })` returns an
  `<img>`. It shows the SVG badge at once, then the portrait drawn from the figure at size × scale. Off a browser it returns
  null. `data-aa-raster="png@<scale>x"` and `data-aa-source="figure"` once drawn. `aaPortraitImg` gives the same.
- **The voice in the mouth:** `aaVoiceHooks(world, agentId)` returns `{ onstart, onboundary, onend }`, or call `world.talkWord(id,
  charIndex)` per word boundary. Two lines are needed on the other side, and neither is mine to edit:
  - oh-voice.js `pump()`: `u.onboundary = (e) => item.opts.onboundary?.(e)`.
  - The panel's `onTalk`: pass the boundary on, for example `onTalk(id, "word", e.charIndex)`.
  In app.js, `onTalk` would then call `aaWorld?.talkWord(id, charIndex)`. Until then, with voice on, the mouth follows
  onstart/onend with word timing at the voice's rate. `check_agent_avatars` §9f prints "boundaries forwarded by the controller:
  0" against the real oh-voice.js.
- **Events the hive does not emit:** none needed. The approval is the hive's own `speak` with `about: "approved"`. A dedicated
  `approve` event (`{ type: "approve", agent, jobId }`) would be cleaner. If OMEGA-HIVE adds one, map it in `AA_GESTURE_FOR`.
- **The mount:** `aaMountAgentAvatars({ …, hd })`. Gesture log entries carry `{ agent, kind, start, end, on, jobId, reason? }`.
- **The figure:** `aaHdBuild(three, agent)` returns `{ group, body, glow, talk, bones, skeleton, apply(pose), spec, triangles,
  headY }`. `aaHdPose(spec, { t, walking, walkPhase, speaking, mouth, beat, gesture: { kind, k }, blink, reduced })` returns
  `{ r, s, o }`.

## Left

- The voice's word boundaries do not reach the mouth in the page yet. They need the two lines above on HIVE-4's side. Tested with
  a stubbed utterance that fires boundaries, and with the real oh-voice.js, which forwards none.
- With voice on, the line (light, mouth, caption) starts when the line arrives, not at onstart (h3-next item 2).
- The robotics rooms keep today's figure (budget, above). HD there needs a lighter level or a two-nearest rule (`ah-next.md`).
- Frame time was not measured. Draw calls and triangles were, in the page and in the checker.
- The bundles were rebuilt for the drive and are not committed (the coordinator regenerates them).
