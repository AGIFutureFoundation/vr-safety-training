# OMEGA-HIVE (`oh`, port 9091): the agents that manage the robots, with personality and voice

Loop 10. Base 43d3e3f6 (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. "Omega Hive" is the feature name
for the agent collective. What it is and is not: `docs/omega-hive.md`.

Robots are simulated. Every agent is software and says so. No model call and no network call exist anywhere in the
hive. Voice is on-device only and off by default. Nothing listens. VBRIDGE's governor is unchanged: the e-stop comes
first, and the physical path stays disabled.

## What is here

| File | What |
|---|---|
| `WebXR/shared/oh-hive-data.js` | `OH_AGENTS`: the seven agents (dispatcher Orrin, safety steward Selka, maintenance planner Brann, consent keeper Ivo, trainer Tamsa, auditor Quen, logistics Lio). Each has an invented name, a role sentence, a home site from `RB_SITES` and an avatar (an `av-sprites` glyph, an accent and an outfit from the tablet/visor/vest set). Each has four traits in [0, 1], a style that `ohStyleFromTraits` derives from them (band, register, openers, closers, hedges, rates), the agent's own padding lexicon, voice parameters and skills. Plain data and pure functions; no imports. |
| `WebXR/shared/oh-say.js` | `ohSay(agent, event)` builds a line from the style grammar and the event's own data, seeded by the agent and the event. `ohGrounded(line, event)` checks that every number, id and site name in the line is in the event. `ohDialogueAdapter` is the refuse-until-configured adapter. |
| `WebXR/shared/oh-hive.js` | `ohHive(...)` runs over a seeded VBRIDGE job stream (`ohJobStream`), step by step: announce, bid (skill, hops, load), award, governor (`vbNegotiate`), steward veto (`ohStewardReview`: adds a refusal only), approval requests for the physical path, standing approval for simulated jobs, walk, robot lock per site, `vbRun` (the governor monitors every step), complete, coach, audit. It emits the contract's eight event types. `ohHiveDay` runs one whole day. |
| `WebXR/shared/oh-voice.js` | `ohPickVoice` picks local voices only. `ohVoiceController` holds the queue, is off by default, stops on page hide and calls `onCaption` whether or not voice is on. `ohSpeakAs` speaks through the page's default controller. `voice-assist.js` is unchanged. |
| `WebXR/shared/oh-panel.js` | `ohMountHive(el, …)`: roster cards (portrait, name, "software agent" label, role, home site, trait chips, talk dot), the caption feed, Step / Run 10 steps / Voice (off), the approval queue and a status line. |
| `WebXR/parishes/js/app.js` | Mounts the panel in `menu-drills`, after the agent-jobs panel, only when `!?demo` and DATAWORKS' `dxEligibility(dxReadSignals(), { stage: "offer" })` both allow it, so never in K-12, demo or signed-out sessions. Headless drives reach it through `window.__parishTest.hive`. |
| `tools/bundle_webxr.py` | The five `oh-*` modules sit in the parishes list after `vb-panel.js`. The bundle builds at 189 modules. |
| `tools/check_omega_hive.mjs` | 15 checks and the EVAL lines below. Listed in `check_all.mjs`. `docs/perf/checkers-baseline.json` carries an **estimated** 7.5 s row, labelled for a quiet re-measure. |
| `docs/omega-hive.md` | What the hive is and what it is not. |

## Evals (before → after)

| Measure | Before (43d3e3f6) | After | Source |
|---|---|---|---|
| Agents with a persona, voice and avatar | 0 | **7** | `check_omega_hive` 1: "7/7 complete" |
| Personality distinctiveness: naive Bayes names the speaker | n/a (no agents) | **0.950** on 5,686 held-out lines (trained on 5,649 lines from seeds 1–100, tested on seeds 101–200) against chance **0.143**. The majority-class baseline is 0.269. The same events said in one neutral style (role signal only) score 0.870. | check 9, EVAL line |
| Style adherence: mean words per sentence inside the declared band | n/a | **7/7** agents; 1,529/1,529 sentences inside | check 6 |
| Grounding: every number, id and site name in a line appears in its event | n/a | **954/954** lines with facts. One line carries no fact (the standing-approval line). A planted number and site id are caught. | check 7 |
| Governor: every dispatched step checked | n/a | Jobs checked `allow-sim` before dispatch: **161/161**. Run steps monitored: **3,631/3,631**. Physical dispatches: **0**. | check 4 |
| Vetoes never grant | n/a | 7 vetoes; 0 vetoed jobs moved past negotiation; the steward was never consulted on a governor refusal | check 4 |
| Approvals requested wherever required | n/a | **10/10 (100%)**. Each of the 7 approvals ran only as a new simulated job, and 0 declined jobs ran. With the e-stop held at a site: 0 runs there, 40 refused `estop-held`. | check 4 |
| Audit to ENTERPRISE-3 | n/a | 40-job day: 162 lines, chain intact. Every `oh-award` / `oh-veto` / `oh-refuse` / `oh-approval-request` / `oh-approve` / `oh-decline` / `oh-dispatch` / `oh-complete` count equals its event count, and the governor's own lines are present. In the page: 121 lines, of which 88 are `oh-*` (equal to the hive's chain) and 33 are the governor's. | check 5; drive B.audit |
| Coordination: a seeded 200-job day (seed 7, 480 steps of one simulated minute) | n/a | Hive against a single dispatcher, in the table below | check 10 |
| Against an avatar-side fixture: every job starts where its agent's figure stands | n/a | **161/161**; 98 moves followed; 954 speak events, each with one talk span. Before the walk-back fix: 9 problems. | check 2b |
| Voice: stubbed `speechSynthesis` with one local and one network voice | n/a | Checker: 22 utterances, all on the local voice, network voice chosen 0 times, 0 overlaps, 0 spoken while off. Page: 15/15 on the local voice, 0 network, 0 overlaps, and with voice off 43 captions and 0 utterances. | check 11; drive B.voiceOff / B.voiceOn |
| Headless drive of the panel | n/a | 0 page errors and 0 external requests over 5 loads. The only non-loopback request is three.js from its CDN URL, answered from the vendored copy, 5 times. | `$SP/loop10/oh/drive_hive.mjs`, `drive-out.txt` |
| `check_omega_hive` | 1 passed, 13 failed (only the vacuous hygiene scan passed: 0 files) | **15 passed, 0 failed** | `OH_ROOT=<base export> node tools/check_omega_hive.mjs` → `$SP/loop10/oh/before-check.txt`; then the tree |

**Coordination detail** (check 10). The hive's four workers each have capacity 2. The single dispatcher works alone
with the same capacity, behind the same governor, steward and approvals.

| | Hive | Single dispatcher |
|---|---|---|
| Completed / 200 | 159 | 159 |
| Refused (governor) / vetoed / declined / not accepted | 29 / 7 / 3 / 2 | 29 / 7 / 3 / 2 |
| Mean steps from announcement to award | **0.034** | 13.715 |
| Mean steps from arrival to completion | **4.398** | 18.478 |
| Contested awards (more than one bid) resolved, double awards | 207, 0 | 0, 0 |
| Site conflicts (a robot busy) resolved | 19/19 | 15/15 |
| Most jobs on one robot at once | 1 | 1 |
| Awards to the best-skilled agent | 158/207 | 207/207 (only one agent) |

Corrected in loop 10 round 2: the single-dispatcher column first carried 14.159, 18.882 and 18/18, from an earlier run; the figures above are what `check_omega_hive` prints on this commit. The hive column and the safety counts did not change.

**Read honestly.**
- The day has slack, so the single dispatcher also finishes all 159 completable jobs. It just takes four times as
  long per job. The 41 jobs that did not complete are the same in both columns: the safety outcomes do not depend on
  who works the job, and check 10 asserts that.
- Style adherence is 100% by construction. The builder pads and picks cores to the band, so the check proves the
  builder holds the band with real site names. It does not show that the style is natural.
- Distinctiveness is inflated by role. Each agent speaks about different events, so even the neutral control names
  the speaker 0.870 of the time. Personality adds about 8 points on top of that.
- The governor results are invariants of the design, not discoveries.
- The approval stand-in in the checker is a seeded rule (approve or decline by the job id's last byte), not a person.

## Budgets (measured: the panel is DOM only)

`$SP/loop10/oh/drive_budget.mjs` ran on the built page on 9091 at `?parish=sf-downtown`, at load average about 26. Each
figure is taken after the world settles (two equal measures 3 s apart), with one render into `npRenderer.info`. Texture
bytes are the RGBA bytes of the scene's material maps.

| Tier | Panel absent (signed out) | Panel mounted (signed in) | After 60 hive steps | Control: the same wait, no steps |
|---|---|---|---|---|
| Desktop (default tier) | 312 meshes (115 instanced), 114,395 triangles, 137 draw calls, 2 textures, 1,048,576 B | identical | identical | 312 meshes, 118,855 triangles, 148 draw calls (the world's own drift) |
| Phone (390 × 844) | 218 meshes (72 instanced), 40,726 triangles, 90 draw calls, 0 textures, 0 B | identical | identical | identical |

The hive adds no mesh, light, triangle, draw call or texture on either tier. The desktop control drifts on its own
while the hive is idle. The first run measured 1.5 s after load and showed the same kind of rise before the world had
settled. The phone and headset budgets do not change. No high-detail work was in scope for this console.

## Cycles

1. Reason: seven agents whose style is derived from the traits, not written per agent. Check: re-derive every style
   from its traits and compare (later check 1); print each band. Act: `oh-hive-data.js`. Observe: 7 agents; bands
   6–12 (logistics) to 12–18 (consent keeper); styles re-derive. Committed f9e07f9f.
2. Reason: lines must hold the band and carry only the event's facts. Check: words per sentence against the band and
   `ohGrounded`, over 42 lines (7 agents × 6 kinds). Act: `oh-say.js`. Observe: **failed**.
   - Approval cores ran to 25 words, past every band.
   - Refusals ran to 16 words for a 6–12 speaker.
   - Sentence-initial ids were capitalised ("Vbjob-…"), which also hid them from the lowercase id scan: a false pass.

   Fix: the reason's phrase moved into a second sentence fitted to the band, the cores got shorter, ids keep their
   case, and the scan is case-insensitive. Then 1,497/1,497 sentences inside the band and 936/936 grounded (checks
   6 and 7).
3. Reason: the hive must make the same safety decisions whoever works the job. Check: a 200-job day, hive against
   single dispatcher, refusal, veto and approval counts equal. Act: `oh-hive.js`. Observe: **failed**. Single had 30
   refusals to the hive's 28, because requests reached the governor out of time order. `atMs` was stamped at arrival
   but checked at award, so the cadence feature read a negative gap as 0 s and refused two jobs as `anomalous`. Fixed
   at the source: the request carries the hive clock when the provider negotiates. Then the outcomes were identical
   (29/7/10 in both) and the latency differed: 0.034 against 13.715 steps to award. Committed with the hive.
4. Reason: one checker proves every claim, with the before from the same script. Check: `check_omega_hive` on a
   `git archive` of 43d3e3f6 and on the tree. Act: the checker, the `check_all` entry and the estimated baseline row.
   Observe: base 1/13. Tree 12/2:
   - `check_all` did not list the checker yet;
   - the claim-wording regex matched its own source; it is now built from pieces, as the model-name regex is.

   After `docs/omega-hive.md`: 14/0. Committed bce599e5 and ca9692a5.
5. Reason: the panel must work in the real built page, with voice off and on, approvals, and the gate. Check: a
   headless drive on 9091 with a stubbed `speechSynthesis` (one local and one network voice). Act: `oh-panel.js`,
   `oh-voice.js`, the app mount and the bundle list. Observe: **failed twice**.
   - The ENTERPRISE-3 lines read 0. The registry key is profile-namespaced (`ent3-governance-v1::<ns>`), and the drive
     read the bare key.
   - `?demo=1` still mounted the panel. DATAWORKS' demo signal is the session flag, and the app's GEO gate also reads
     `?demo`.

   Fixed: the gate also refuses `?demo`, and the drive reads the namespaced key. Then every step passed:
   - signed out, K-12, `?demo` and the demo session all get no panel;
   - voice off: 43 captions and 0 utterances;
   - voice on: 15/15 utterances on the local voice and 0 overlaps;
   - an approval ran as a simulated job only, and a decline never ran;
   - 0 page errors and 0 external requests.

   Committed 24761a3e.
6. Reason: the DOM-only panel must leave the 3D budgets alone. Check: meshes, triangles, draw calls and texture bytes,
   desktop and phone, with the panel absent, mounted, and after 60 steps, against a no-step control of the same
   length. Act: `$SP/loop10/oh/drive_budget.mjs`. Observe: the first run measured 1.5 s after load and showed
   triangles rising (57,132 to 114,395) with meshes unchanged, while the world was still filling its instanced meshes.
   The settled run with a control separates the two. Desktop and phone are identical with the panel absent, with it
   mounted, and after 60 steps. Only the desktop no-step control drifts.
7. Reason: the neighbours must still pass. Check: their single checkers. Observe:
   - `check_vbridge` 18/0 with the EVAL lines unchanged;
   - `check_enterprise3` 16/0;
   - `check_imports`: 1,108 modules;
   - `check_dataworks` 59/0;
   - `check_robotrain` "ok — 334 checks";
   - `check_avatars` "All avatar checks pass";
   - `check_parse` did not finish inside 400 s at load average about 19; it was not completed.

8. Reason: AGENT-AVATARS builds against a fixture of the hive, and the hive should be tested against a fixture of
   the avatars. Check: a consumer that only uses `on(type, fn)`. It keeps one figure per agent, follows `move`, and
   requires each `dispatch` to happen where the agent's figure stands (check 2b). Act: the fixture. Observe:
   **failed**, 9 problems. An agent holding two jobs walked to its second job's site, and its first job then started
   at a site it had left. Fixed: the agent walks back (a `move` event and line) before a job starts away from it.
   Then 161/161 jobs started where their agent stands, and the checker passed 15/0. The coordination timings are
   unchanged, since the walk-back moves only the figure.

## Checkers (single runs)

- `node tools/check_omega_hive.mjs`: 15 passed, 0 failed (5.2–13.1 s at loads 11–26), then the EVAL lines.
- `node tools/check_vbridge.mjs`: 18 passed, 0 failed (EVAL 200/200 and 0/200; EVAL-2 66/100).
- `node tools/check_enterprise3.mjs`: 16 passed, 0 failed.
- `node tools/check_imports.mjs`: All 1108 modules call only what they declare or import.
- `node tools/check_dataworks.mjs`: 59 passed, 0 failed.
- `node tools/check_robotrain.mjs`: ok — 334 checks.
- `node tools/check_avatars.mjs`: All avatar checks pass.
- `node tools/check_parse.mjs`: not completed (killed at 400 s under load).
- Not run: `tools/check_all.mjs` (the coordinator gates), `eval_worlds` (no world subject changes: the panel sits in an
  existing menu) and `eval_content` (no station added).

### Drive output (headless Chromium, port 9091, built page, load average 19.6)

```
A.signedOut {"hive":true,"panel":false}
B.panel {"panel":true,"cards":7,"labelled":7,"portraits":7,"voiceButton":"false","names":["Orrin","Selka","Brann","Ivo","Tamsa","Quen","Lio"]}
B.voiceOff {"captions":43,"feedLines":40,"spoken":0,"firstCaption":"[2] Orrin (software agent): Right, job vbjob-1cc7b19e64ebb848 is in for Automated Warehouse Aisle (procedural)."}
B.voiceOn {"pressed":"true","spoken":15,"local":15,"network":0,"overlaps":0,"captionsNow":58,"sample":{"voice":"Local Test Voice","localService":true,"rate":1.11,"pitch":1.08,...}}
B.approval {... "approvedRanAsSim":true,"declinedJob":{"status":"declined","ran":false},"status":"Step 58 · completed 18 · refused 9 · vetoed 1 · declined 1 · waiting for you 0 · audit chain 88 line(s), intact"}
B.audit {"ent3Key":"ent3-governance-v1::id-…","hiveChain":{"ok":true,"lines":88},"ent3Lines":121,"ohLines":{"oh-standing-approval":1,"oh-award":32,"oh-refuse":11,"oh-approval-request":2,"oh-dispatch":20,"oh-complete":19,"oh-veto":1,"oh-approve":1,"oh-decline":1},"governorLines":33,"checked":"20/20","monitored":"386/386","physicalDispatched":0}
C.k12 {"hive":true,"panel":false}
D.demoUrl {"hive":true,"panel":false}
E.demoSession {"hive":true,"panel":false}
pageErrors []
offHost []
routedThree 5
```

The screenshot of the panel is `$SP/loop10/oh/hive-panel.png`.

## Seams

- **AGENT-AVATARS** (the contract, built to the brief; neither side imports the other):
  - `OH_AGENTS[i] = { id, key, name, role, label: "software agent", homeSite, avatar: { glyph, accent, outfit },
    voice: { lang, rate, pitch, prefer }, traits, style, lexicon, skills }`.
  - `ohHive({ seed, governor, audit, … })` returns `{ agents, step(), run(n), on(type, fn), off(type, fn), events(),
    approve(id), decline(id), … }`.
  - Every event is `{ t, type, agent, to?, jobId?, reason?, text?, caption? }` plus facts.
  - `move` carries `to` (the site) and `hops`.
  - `speak` carries `text` and a `caption` that names the agent and "software agent".
  - `refused` comes from the agent who stops: the winner on a governor refusal, the steward on a veto, the consent
    keeper on a decline.
  - `complete` carries `ok`, `score` and `steps`.
  - `approval-request` comes from the consent keeper.
  - To wire: `aaMountAgentAvatars({ three, parent, agents: OH_AGENTS, source: window.__parishTest.hive.hive, siteAt,
    reducedMotion })`. The panel's `hive` is anything with `on(type, fn)`.
- **Governor:** `ohHive({ governor })` takes any `vbGovernor`; without one it builds its own with
  `ent3: { auditAppend: audit }`. `ohStewardReview(steward, request, decision)` is exported and pure.
- **ENTERPRISE-3:** `audit` is `ent3AuditAppend`. The hive's actions are `oh-standing-approval`, `oh-award`, `oh-refuse`,
  `oh-veto`, `oh-approval-request`, `oh-approve`, `oh-decline`, `oh-dispatch` and `oh-complete`.
- **Voice:** `ohVoiceController({ synth, Utterance, doc, win, enabled, onCaption })`; `ohSpeakAs(agent, text, { onstart, onend })`.
- **Model adapter (planned only):** `ohDialogueAdapter(agent, { transport })` refuses until `endpoint`, `model` and a
  handed-in transport exist. A reply is used only when `ohGrounded` passes.
- **REEL:** `window.__parishTest.hive.step()`, `.run(n)`, `.voice(true)`, `.approve(jobId)` and `.state()`. The panel
  is `#oh-hive` in the drills menu, and it mounts only when signed in.

## Left

- AGENT-AVATARS is not wired yet. The coordinator connects `aaMountAgentAvatars` to `window.__parishTest.hive.hive` at
  integration.
- The dist bundle was rebuilt for the drives and then reverted. The coordinator's `python3 tools/bundle_webxr.py`
  carries the panel into `WebXR/parishes/dist/`.
- The panel uses the badge sprites at 48 px. AGENT-AVATARS' 2× portraits can replace them through the same card slot.
- Not in the instructor console. A hive roster on the governance tab is AGENT-AVATARS' item 4.
- Only one language (en-US). Other languages need per-language cores in `OH_CORES`, not only a voice.
- `guide-kb.js` was not regenerated for `docs/omega-hive.md`.
- The checker's baseline row is an estimate. Re-measure it on a quiet gate.
