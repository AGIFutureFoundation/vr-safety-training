# VOICES (`vc`, port 9102): every character speaks, in its own voice

Loop 10, round 2. Base f4884d71 (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp.

GRIOT's rule stands: a character says only its knowledge pack's lines, verbatim, and nothing is generated. This console gives
those lines a voice and never a word. Voice is on-device only (a `speechSynthesis` voice is used only when its `localService`
is true, never a network voice), off until the learner turns it on and not remembered between loads, captions always show,
and nothing listens (no microphone, no recognition, no recording). No model call and no network call exist in the voice code.
Item 4 (the hive in a second language) is done for Spanish.

## What is here

| File | What |
|---|---|
| `WebXR/shared/vc-voices.js` | New. `vcProfileFor` / `vcProfiles`: a voice profile for each of the 34 characters (a language, a rate and pitch inside `VC_BAND`, preferred local voice names, a temper). `vcAssignments` / `vcPickVoice`: which local voice each character uses on this device, chosen over the whole roster so the choice does not depend on who the learner meets first. `vcDevice`: which voices exist and a note when none does. `vcNpcVoice`: the characters' voice, a wrapper over `oh-voice.js`'s controller that speaks a pack line and refuses any other text. `vcVoiceBarHtml` (the dialogue panel's voice row, pure) and `vcMountVoiceSettings` (the Me tab's block). |
| `WebXR/shared/oh-voice.js` | Extended without changing its callers: `ohVoiceController({ pick })` takes a voice chooser (default `ohPickVoice`) and re-checks `localService` on whatever it returns; `link(other)` makes two controllers share one line of speech and take turns at line boundaries (characters and Omega Hive agents never talk over each other); `stop()` tells the line it cuts off that it ended (so a talk light never stays lit) and cancels the browser's queue only when this controller has a line in flight (an idle controller never cuts off the Guide's or a peer's speech). |
| `WebXR/shared/npc.js` | `grMount` creates the characters' voice (`hooks.voice` / `synth` / `Utterance` for tests), speaks the taught line only (`speakLine`) when a dialogue opens or a question is answered, stops it on close, shows the **talk light** (the agents' light: one shared mesh that sits on the speaking figure only while it speaks), and draws the **voice row** in the dialogue panel (a toggle, a test, a note). Returns `voice`, `talkState()`, `talkLog()`. |
| `WebXR/parishes/parishes.html`, `js/app.js` | The Me tab: `#menu-voice` beside the sound and reduced-motion controls (the Voices toggle) and `#menu-voice-info` (a character picker with Test voice, the note about this device's voices and a table of which voice each character uses). The characters' voice is linked to the Omega Hive's controller when the hive is mounted. |
| `WebXR/shared/oh-say.js`, `oh-hive-data.js`, `oh-panel.js` | Item 4. `OH_CORES_ES` and `OH_PACKS` (per-language cores, reason phrases and the approval sentence); `OH_LANGS`, `ohLangFor(code)`, the Spanish style pools, `OH_REASON_PHRASES_ES`, `OH_PADS_ES` (each agent's own padding), `OH_PREFER_ES` (preferred Spanish voice names) and `ohAgentIn(agent, lang)` in the data module; `ohSay(agent, event, { lang })`; `ohMountHive({ lang })` (default: the page's `<html lang>`), which gives the hive a Spanish `say` and Spanish agents and speaks as the localised agent. English output is unchanged. |
| `tools/bundle_webxr.py` | `oh-voice.js` and `vc-voices.js` before `npc.js` in the Bay World, Summit and Redwood lists; in the parishes list `vc-voices.js` follows `oh-voice.js` (used only at run time). |
| `tools/check_voices.mjs` | The checker (10 checks and the EVAL lines below). In `check_all`; `docs/perf/checkers-baseline.json` carries an **estimated** row. `tools/check_npc.mjs` lists the two modules in its suite and checks the voice row at 390 px. |
| `tools/drive_voices.mjs` | The headless drive of the built pages (not in the gate; `VC_PARTS=A,B,...` runs a subset). |

### How a voice profile is derived (who they are)

- **Temper** from the role's words (`VC_TEMPER_RULES`): `care` (nurse, teacher, host, banquet, nursery), `open` (ranger, lookout,
  scientist, watershed, wetlands, estuary), `firm` (foreman, boss, lead, conductor), `measured` (inspector, lineworker,
  electrician, millwright, mechanic, operator, technician), `brisk` (stagehand, chef, rigger), `crisp` (pilot). Each temper has a
  centre: care is a little higher and slower, firm lower and brisker, measured the slowest. That is a way of working, not a claim
  about any person; the names are first names only.
- **Place among their temper**: characters of one temper are spread along a two-dimensional low-discrepancy sequence ordered by
  their place in the avatar space (`style.i`), so six `firm` characters are not six copies.
- **A separation pass**: the roster is walked in order and a profile closer than `VC_MIN_GAP` (10 % of the band, rate and pitch
  each scaled by their band's width) to one already placed moves to the nearest free 0.01 step inside the band. 13 of the 34
  were moved. It depends on the roster only, never on the device.
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
the way the agents' light does. With voice on the light follows the real utterance (start to end). A new question replaces the
line still being read (the old one is cancelled, never spoken over).

### The hive in Spanish

The Omega Hive speaks the page's language when it has one (`ohLangFor(<html lang>)`: `es`, `es-MX` ... are Spanish, anything else
English). A language is a phrase pack (cores per event kind, the calm phrase for each governor reason, the sentence that explains an
approval request), a set of style pools (openers, closers, hedges), each agent's own padding phrases and the voice language and
preferred local voice names. The style grammar (the band of words per sentence, the rates) is derived from the traits exactly as in
English, so each agent is the same persona in both languages. Every fact in a line (job id, site name, score, count, reason id) is
slotted from the event and is the same in both languages; site names, the supervisor label's name and reason ids stay as the event
has them (proper names stay in English, as the platform's languages note says), and the Spanish announce line has no `{task}` slot
because a task's label is the registry's English name. A Spanish line is read only by a local Spanish voice; with none the agent is
silent and its caption still shows. The Spanish text is machine-assisted and needs a native-speaker review.

## Evals (before → after)

| Measure | Before (f4884d71) | After | Source |
|---|---|---|---|
| Characters with a voice profile | **0** | **34 of 34**, all inside the band (rate 0.85-1.05, pitch 0.85-1.15; observed 0.86-1.02 and 0.87-1.11), six tempers | `check_voices` 1; before: `VC_ROOT=<base export> node tools/check_voices.mjs` → "0 of 34" |
| Profiles distinct | n/a | **34 of 34** rate/pitch pairs; closest two 0.100 of the band apart (the floor); no two characters share rate, pitch and voice on any of seven stubbed devices (none, one, two + a network voice, three, eight, network-only, French-only) | check 1, 2 |
| Lines spoken verbatim | n/a (no speech) | **136 of 136** utterances are a pack line verbatim (34 characters × 3 dialogues + a matching question); the greeting, hand-off and no-match templates: 0 spoken | check 3 EVAL |
| Network voices chosen | n/a | **0** of 136 (stubbed `speechSynthesis` with a local and a network voice; the controller also refuses a network voice a `pick` returns) | check 2, 3 |
| Utterances with voice off | n/a | **0** over 102 dialogues and 68 questions; the synth is never touched (0 speaks, 0 cancels); the dialogue is identical with voice on (102 of 102) | check 3; drive A.voiceOff |
| Talk light exactly while a line is spoken | none | **34 of 34** (start to end); the reading window with voice off 34 of 34; held still under reduced motion; in the built page 10 of 10 parish characters | check 4; drive A.allCharacters, D |
| Meshes per figure | worst 8 (of 12) | worst **9** (of 12) while speaking; 8 idle (the light is one shared mesh, on the speaking figure only) | check 4 |
| Cost of the light, measured in the built parishes page (idle → speaking, camera 4 m from the figure) | n/a | desktop 1280×720: 318 → **319** draw calls, 145,726 → 145,866 triangles (+140), 411 → 412 visible meshes. Phone 390×844: 133 → **134**, 62,460 → 62,600 (+140), 276 → 277. Back to the idle mesh count after the line. Texture bytes: 0 added. The pair is read back to back; the world's own chunk streaming moves the absolute numbers between runs (an earlier run read 331 → 332 and 198,332 → 198,472: the same +1 call, +140 triangles) | drive F, final run `$SP/loop10/vc/drive-final.txt` |
| Never over another line | n/a | **0 overlaps** across the checker's 136 utterances and the page (the hive's 7 lines and a character's line: 8 utterances, 0 overlaps, the character's line spoken between the hive's) | check 3, 5; drive A2 |
| `check_npc` | 17,792 checks pass | **17,793** checks pass (the voice row at 390 px) | `node tools/check_npc.mjs` |
| `check_omega_hive` | 15 passed, 0 failed | **15 passed, 0 failed**; the EVAL lines unchanged (1,529/1,529 sentences, 954/954 grounded, 0.950) | `node tools/check_omega_hive.mjs` |
| Languages the Omega Hive speaks | 1 | **2** (English, Spanish) | check 10 |
| Hive in Spanish: style adherence | n/a | **7 of 7** agents inside their bands; **1,536 of 1,536** sentences | check 10 |
| Hive in Spanish: grounding | n/a | **954 of 954** lines with facts; a planted number and site id are caught | check 10 |
| Hive in Spanish: personality | n/a | naive Bayes names the speaker **0.959** (2,269 held-out lines) against chance 0.143; calm text in 1,071 strings, 0 flagged | check 10 |
| A Spanish line read by an English or a network voice | n/a | **0**: with English voices only, 17 captions and 0 utterances; with local Spanish voices, 17 of 17 spoken by them, 0 network | check 10; drive E |
| Page errors / off-host requests in the drive | n/a | **0 / 0** (the only failed requests are five pre-existing 404s: `parishes/assets/geo/orleans.jpg` and `media/backgrounds.json` at four paths) | `node tools/drive_voices.mjs 9102` |
| `check_voices` | 0 of 34 (module absent) | **10 passed, 0 failed** | `node tools/check_voices.mjs` |

Honest reading:
- The profiles are derived, not measured against listeners. What is measured is that they are inside the band, distinct and
  deterministic. Whether two profiles *sound* different depends on the device's voices and engine; one voice on a device gives 34
  characters differing only by rate and pitch.
- Distinctness is a floor set by the checker (`VC_MIN_GAP`), and the separation pass moved 13 of the 34 profiles to reach it.
- The drive and the checker use a stubbed `speechSynthesis`. No real engine or voice list was exercised.
- Style adherence is true by construction (the builder pads and picks cores to the band); it proves the Spanish cores and
  pads hold the band with real site names, not that the Spanish reads naturally.

## Cycles (reason → act → observe)

1. Reason: a profile per character, derived from who they are, inside a gentle band and distinct. Check: `check_voices` 1
   (inside the band, deterministic, distinct, closest pair). Act: `vcProfileFor`. Observe: **failed twice**.
   - First version (place by `style.i` along a low-discrepancy sequence): 34 distinct pairs but the closest two (Adaeze and Keiko)
     had the same rate and pitches 0.01 apart, which no listener could hear.
   - Second version (place by rank within the temper, a wider band): 33 distinct pairs, Luis and Dante from different tempers
     landed on 0.99 / 0.97.
   - Fix: a separation pass with a floor of 0.10 of the band. Then 34 of 34 distinct, closest 0.100, 13 moved.
2. Reason: only pack lines spoken, verbatim, local voices only, off by default, never over another line. Check: sections 2 and 3
   on a stubbed device with a local and a network voice. Act: `vcNpcVoice.say` refuses text outside the pack; the controller
   re-checks `localService`. Observe: 136 of 136 verbatim, 0 network, 0 utterances with voice off. The first run of section 4
   failed on the checker's own mistake (each dialogue advances the seed, so the line measured was not the line spoken); the
   test was fixed, the code was right.
3. Reason: the talk light exactly while a line is spoken, free when idle. Check: section 4 and the per-tier frame in the drive.
   Act: one shared mesh attached to the speaking figure only. Observe: 34 of 34 exact, idle meshes unchanged, +1 call and +140
   triangles while speaking on desktop and phone, worst figure 9 of 12.
4. Reason: the controls in the real built page. Check: drive A. Observe: **failed**: the Me tab's Test button was covered by
   the open dialogue panel (a drive artefact: in play the menu is closed) and the caption comparison counted a log that grows. The
   drive was fixed (close the dialogue; compare before and after the toggle). Then: Voices beside reduced motion, the panel's
   toggle and the Me tab's in step, Samantha at rate 0.97 and pitch 0.97 for Dante, the captions identical after the toggle, 0
   speaks and 0 cancels with voice off, the light exact for 10 of 10 characters.
5. Reason: the hive and the characters on one page must not talk over each other. Check: drive A2 and section 5. Observe:
   **failed**: with the hive's 11 queued lines the character the learner had just spoken to never got a turn (11 hive lines, 0
   character lines). The controller finished its own next line before telling the waiting peer. Fix: tell the peer first, so
   linked controllers take turns at line boundaries. Then the hive's lines and the character's line, 0 overlaps.
6. Reason: the other three worlds. Check: drive B. Observe: Bay World and Redwood showed no NPC mount: they build the world on
   Start. After clicking Start: 8 characters each, the voice row, one pack line spoken on a local voice, the light on, 0 page errors.
7. Reason: the hive in Spanish with grounding and style adherence per language. Check: section 10, then the page with
   `?lang=es`. Observe: passed on the first run (7 of 7 agents, 1,536 of 1,536 sentences, 954 grounded, 0.959), and reading the
   sample lines found an English task label inside a Spanish sentence, so the Spanish announce core lost its `{task}` slot. In the
   page: English-only voices speak nothing and show 17 captions; with local Spanish voices 17 of 17 are spoken by them.
8. Reason: nothing else moved. Check: the neighbours. Observe: `check_npc` 17,793, `check_omega_hive` 15/0 with identical EVAL
   lines, `check_avatars` pass, `check_agent_avatars` 69/69, `check_storyline` 11,547 checks 0 failed, `check_imports` 1,114 modules.

## Seams

- `vcNpcVoice({ synth, Utterance, doc, win, enabled, onCaption, characters })` returns `{ enabled(), setEnabled(on), toggle(),
  canSpeak(ch), say(ch, text, { onstart, onend }), test(ch), stop(), speaking(), queued(), profile(ch), assignments(chars?),
  device(), link(other), onChange(fn), spoken(), controller }`.
- `grMount(world, { voice, synth, Utterance, reducedMotion, ... })` returns the mount with `voice`, `talkState()`, `talkLog()`.
- `ohVoiceController({ pick })` and `.link(other)` / `.kick()` / `.linked()`. The parishes app links the characters' voice to the
  Omega Hive panel's `voiceController` (`window.__parishTest.hive.voiceController`).
- `ohMountHive(el, { lang })`; `ohLangFor(code)`, `ohAgentIn(agent, lang)`, `OH_PACKS`, `OH_CORES_ES`, `OH_LANGS` (a third language is a
  new core table, a new set of pools, padding and voice names, and a voice tag).
- `window.__parishTest.voices` (the Me tab block) and `window.__parishTest.npc.voice` for drives; the dialogue panel's row is
  `#gr-voice` with `[data-vc="toggle"]` and `[data-vc="test"]`.
- **Model adapter (planned only):** `grAgentAdapter` and `ohDialogueAdapter` are unchanged; a hosted reply is spoken only when it is
  a pack line verbatim (characters) or passes `ohGrounded` (agents).
- Merge notes for the coordinator: this console edited `oh-panel.js` (the `lang` option, the localised agent for the voice; a few
  lines near the top of `ohMountHive` and the `speak` handler) and `WebXR/parishes/js/app.js` (one import and one block before
  `uxOb`), which HIVE-IN-WORLD may also touch.

## Checkers (single runs)

- `node tools/check_voices.mjs`: 10 passed, 0 failed (about 3 s).
- `node tools/check_npc.mjs`: 17,793 checks pass (before 17,792).
- `node tools/check_omega_hive.mjs`: 15 passed, 0 failed, EVAL lines unchanged.
- `node tools/check_imports.mjs`: all 1,114 modules call only what they declare or import.
- `node tools/check_avatars.mjs`: all avatar checks pass. `node tools/check_agent_avatars.mjs`: 69 pass. `node tools/check_storyline.mjs`: 11,547 checks, 0 failed.
- `node tools/check_guide.mjs`: 267 passed, **1 failed** ("guide-kb.js is fresh"). Not caused here: none of the files the generator
  reads (`docs/*.md`, `docs/programmes`, `unions.json`, `standards.json`, the catalog) differs from f4884d71, and the same single failure
  shows with this console's docs edits reverted. Regenerate at integration with `node tools/gen_guide_kb.mjs` (mind the 672 KB cap).
- Not run: `tools/check_all.mjs` (the coordinator gates), `check_parse` (long under load; `node --check` on every edited file passes),
  `eval_worlds` and `eval_content` (no world subject or station changed), `check_mobile`/`check_budget` (the idle scene is unchanged;
  the speaking figure's cost is measured per tier in drive F).
- Dist bundles were rebuilt for the drive and are not committed.

## Left

- The Spanish text is machine-assisted and needs a native-speaker review (the platform's rule for every non-English table); "gobernador"
  stands for the safety governor and a reviewer may prefer another word. The hive panel's own UI text (roster cards, the note, button
  labels) and the agents' role sentences are still English; only the agents' lines, their captions and their voices follow the language.
- The hive's language is read when the panel mounts; changing the page language afterwards needs a reload.
- The characters speak English only: their packs are English and verbatim, so a second language needs sources in that language.
  Never machine-translate a pack line.
- Real devices: no real engine or voice list was exercised (Chrome fills `getVoices()` late; the `voiceschanged` listener refreshes
  the UI but is untested against a real engine). The preferred voice names are a guess at what platforms ship.
- The voice setting is not remembered and there is no per-character voice choice. Bay World, Summit and Redwood have the toggle
  only in the dialogue panel (no settings tab).
- Under a headset the dialogue panel is a DOM overlay (unchanged from GRIOT); the light is on the figure, the voice is the page's.
- The checker's baseline row is an estimate. Re-measure it on a quiet gate.
