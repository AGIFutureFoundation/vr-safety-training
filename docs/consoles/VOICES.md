# VOICES (`vc`, port 9102): every character speaks, in its own voice

Loop 10, round 2. Base f4884d71 (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp.

GRIOT's rule stands: a character says only its knowledge pack's lines, verbatim, and nothing is generated. This console gives
those lines a voice and never a word. Voice is on-device only (a `speechSynthesis` voice is used only when its `localService`
is true, never a network voice), off until the learner turns it on and not remembered between loads, captions always show,
and nothing listens (no microphone, no recognition, no recording). No model call and no network call exist in the voice code.

## What is here

| File | What |
|---|---|
| `WebXR/shared/vc-voices.js` | New. `vcProfileFor` / `vcProfiles`: a voice profile for each of the 34 characters (a language, a rate and pitch inside `VC_BAND`, preferred local voice names, a temper). `vcAssignments` / `vcPickVoice`: which local voice each character uses on this device, chosen over the whole roster so the choice does not depend on who the learner meets first. `vcDevice`: which voices exist and a note when none does. `vcNpcVoice`: the characters' voice, a wrapper over `oh-voice.js`'s controller that speaks a pack line and refuses any other text. `vcVoiceBarHtml` (the dialogue panel's voice row, pure) and `vcMountVoiceSettings` (the Me tab's block). |
| `WebXR/shared/oh-voice.js` | Extended without changing its callers: `ohVoiceController({ pick })` takes a voice chooser (default `ohPickVoice`) and re-checks `localService` on whatever it returns; `link(other)` makes two controllers share one line of speech (characters and Omega Hive agents never talk over each other); `stop()` tells the line it cuts off that it ended (so a talk light never stays lit) and cancels the browser's queue only when this controller has a line in flight (an idle controller never cuts off the Guide's or a peer's speech). |
| `WebXR/shared/npc.js` | `grMount` creates the characters' voice (`hooks.voice` / `synth` / `Utterance` for tests), speaks the taught line only (`speakLine`) when a dialogue opens or a question is answered, stops it on close, shows the **talk light** (the agents' light: one shared mesh that sits on the speaking figure only while it speaks), and draws the **voice row** in the dialogue panel (a toggle, a test, a note). Returns `voice`, `talkState()`, `talkLog()`. |
| `WebXR/parishes/parishes.html`, `js/app.js` | The Me tab: `#menu-voice` beside the sound and reduced-motion controls (the Voices toggle and a character picker with Test voice) and `#menu-voice-info` (the note about this device's voices and a table of which voice each character uses). The characters' voice is linked to the Omega Hive's controller when the hive is mounted. |
| `tools/bundle_webxr.py` | `oh-voice.js` and `vc-voices.js` before `npc.js` in the Bay World, Summit and Redwood lists; in the parishes list `vc-voices.js` follows `oh-voice.js` (used only at run time). |
| `tools/check_voices.mjs` | The checker (9 checks and the EVAL lines below). In `check_all`; `docs/perf/checkers-baseline.json` carries an **estimated** row. `tools/check_npc.mjs` lists the two modules in its suite and checks the voice row at 390 px. |

### How a voice profile is derived (who they are)

- **Temper** from the role's words (`VC_TEMPER_RULES`): `care` (nurse, teacher, host, banquet, nursery), `open` (ranger, lookout,
  scientist, watershed, wetlands, estuary), `firm` (foreman, boss, lead, conductor), `measured` (inspector, lineworker,
  electrician, millwright, mechanic, operator, technician), `brisk` (stagehand, chef, rigger), `crisp` (pilot). Each temper has a
  centre: care is a little higher and slower, firm lower and brisker, measured the slowest. That is a way of working, not a claim
  about any person; the names are first names only.
- **Place among their temper**: characters of one temper are spread along a two-dimensional low-discrepancy sequence ordered by
  their place in the avatar space (`style.i`), so six `firm` characters are not six copies.
- **A separation pass**: the roster is walked in order and a profile closer than `VC_MIN_GAP` (10 % of the band, rate and pitch
  each scaled by their band's width) to one already placed moves to the nearest free 0.01 step inside the band. It depends on the
  roster only, never on the device.
- **Preferred voice names** per temper (`VC_TEMPERS[t].prefer`): an order of names platforms commonly ship (Samantha, Daniel,
  Moira ...). They say nothing about a voice's quality; a name the device lacks is skipped.
- **The band** (`VC_BAND`): rate 0.85-1.05, pitch 0.85-1.15, gentle on purpose. **Language**: `en-US` for all 34, because the packs
  are English (verbatim from the Guide's notes, the registries and the catalog), so an English voice must read them.
- **Voice on a device**: the least-used local voice among those whose name matches one of the character's preferred names, else
  the least-used local voice of the language (the exact tag first, else the same primary language). One voice on the device is
  shared by all 34 and the rate and pitch still tell them apart.

### What is spoken, and what is not

Only the taught line (the pack line the dialogue teaches, or the one a question retrieves) is ever spoken, verbatim. The
greeting template, the hand-off sentence and the no-match line are shown on screen and never heard; `vcNpcVoice.say` refuses
any text that is not one of the character's own pack lines. With voice off, or with no on-device voice, the panel shows the
same text and the talk light follows the line's reading window on the clock (400 ms plus the words at 165 per minute, 1.5-12 s),
the way the agents' light does. With voice on the light follows the real utterance (start to end).

## Evals (before → after)

Filled in at the hand-back from `node tools/check_voices.mjs` (the EVAL lines) and the headless drive; see the table below once
it is complete.

## Cycles

Filled in at the hand-back.

## Seams

- `vcNpcVoice({ synth, Utterance, doc, win, enabled, onCaption, characters })` returns `{ enabled(), setEnabled(on), toggle(),
  canSpeak(ch), say(ch, text, { onstart, onend }), test(ch), stop(), speaking(), queued(), profile(ch), assignments(chars?),
  device(), link(other), onChange(fn), spoken(), controller }`.
- `grMount(world, { voice, synth, Utterance, reducedMotion, ... })` returns the mount with `voice`, `talkState()`, `talkLog()`.
- `ohVoiceController({ pick })` and `.link(other)` / `.kick()` / `.linked()`. The Omega Hive panel's `voiceController` can be passed
  to `asNpc.voice.link(...)`; the parishes app does it.
- `window.__parishTest.voices` (the Me tab block) and `window.__parishTest.npc.voice` for drives.
- **Model adapter (planned only):** `grAgentAdapter` is unchanged; a hosted reply is spoken only when it is a pack line verbatim.

## Left

Filled in at the hand-back.
