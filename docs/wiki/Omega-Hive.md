# The Omega Hive: the agents that manage the robots

Seven software agents, each with a persona, an on-device voice and an avatar, coordinate every simulated robot job through the safety governor. Every figure comes from a checker named beside it.

## The Omega Hive: the agents that manage the robots

The Omega Hive is the name for the software agents that manage the simulated robots in the Holodeck. 7 named agents each have a personality, an on-device voice that stays off until the learner turns it on, and an avatar built to stand at its home robot site. They coordinate every robot job through the safety governor, and a request that names the physical path, which ships disabled, comes to the human supervisor as an approval request. They are software: no language model, no network call, no chain call and no real robot.

- 0.950 accuracy of a classifier that names which agent spoke a line, on 5,686 held-out lines; naming one of the 7 at random scores 0.143 `docs/consoles/OMEGA-HIVE.md`
- 3,631 of 3,631 simulated run steps checked by the safety governor, with 0 dispatches to a physical robot `docs/consoles/OMEGA-HIVE.md`
- 10 of 10 requests that named the physical path went to the human supervisor as approval requests `docs/consoles/OMEGA-HIVE.md`
- 0.034 / 13.715 mean simulated steps from a job's announcement to its award: the hive against one dispatcher working alone `docs/consoles/OMEGA-HIVE.md`

### The 7 agents, stationed at 6 of the 6 robot sites

Names are invented and belong to no real person. Each of the 4 traits runs on a scale of 0 to 1; the bar and the number show the value, and the number of words in a sentence follows from the verbosity. Every card is labelled “software agent”.

### Dispatcher: Orrin

 software agent

Announces each robot job, collects the agents' bids and awards the job to the best-placed agent.

 Warmth 0.55 Formality 0.45 Verbosity 0.35 Caution 0.50

- **Home site** Automated Warehouse Aisle
- **Speaks in** 8 to 14 words a sentence
- **Voice** rate 1.06, pitch 1.04; on this device only

### Safety steward: Selka

 software agent

Reviews every job the governor allows and may veto it; a veto only ever adds a refusal.

 Warmth 0.40 Formality 0.80 Verbosity 0.60 Caution 0.95

- **Home site** Fabrication Robot Cell
- **Speaks in** 10 to 16 words a sentence
- **Voice** rate 0.91, pitch 0.99; on this device only

### Maintenance planner: Brann

 software agent

Takes cell-entry and zone set-up jobs, plans lockout and keeps the rigs ready.

 Warmth 0.60 Formality 0.30 Verbosity 0.50 Caution 0.70

- **Home site** Distribution Robot Aisle
- **Speaks in** 9 to 15 words a sentence
- **Voice** rate 0.99, pitch 1.06; on this device only

### Consent keeper: Ivo

 software agent

Asks the human supervisor wherever a person's say is needed, and keeps the consent records straight.

 Warmth 0.85 Formality 0.65 Verbosity 0.75 Caution 0.85

- **Home site** Ceiling-Drilling Robot Deck
- **Speaks in** 12 to 18 words a sentence
- **Voice** rate 0.92, pitch 1.15; on this device only

### Trainer: Tamsa

 software agent

Takes pick-and-place and zone set-up jobs, and coaches after every run that did not finish clean.

 Warmth 0.95 Formality 0.20 Verbosity 0.65 Caution 0.55

- **Home site** Campus Robotics Lab
- **Speaks in** 11 to 17 words a sentence
- **Voice** rate 1.02, pitch 1.18; on this device only

### Auditor: Quen

 software agent

Re-walks the audit chain after jobs close and reports whether every line is intact.

 Warmth 0.20 Formality 0.95 Verbosity 0.25 Caution 0.75

- **Home site** Fabrication Robot Cell
- **Speaks in** 7 to 13 words a sentence
- **Voice** rate 1.00, pitch 0.92; on this device only

### Logistics: Lio

 software agent

Takes the warehouse and port routing jobs and moves totes between the robot sites.

 Warmth 0.65 Formality 0.15 Verbosity 0.15 Caution 0.40

- **Home site** Port Automation Yard
- **Speaks in** 6 to 12 words a sentence
- **Voice** rate 1.11, pitch 1.08; on this device only

### How a job moves through the hive

1. **Announce.** The dispatcher announces a job from the agent-jobs panel's seeded stream of simulated jobs.

2. **Bid.** The working agents bid. A bid weighs an agent's skill for the task against the hops to the site and its current load, and the best bid is awarded the job.

3. **Check.** The winner's request goes through the safety governor, unchanged: the e-stop first, then the other refusal reasons. The governor also monitors every step of the run.

4. **Review.** The safety steward looks at every job the governor allowed and may veto it. A veto only ever adds a refusal.

5. **Ask.** A request that names a physical robot is refused by the governor, because that path ships disabled, and it comes to the learner as an approval request. Approving re-queues it as a simulated job, which passes the governor again like any other. Declining closes it.

6. **Walk and run.** The agent’s avatar walks to the site, the simulated job runs step by step, and the job completes. After a run that did not finish clean, the trainer coaches.

7. **Record.** Every award, veto, refusal, approval request, approval, decline, dispatch and completion goes into the hive’s own hash chain and into the governance audit log, beside the governor’s lines.

### What was measured

| Measure | Result | Source file | Kind |
|---|---|---|---|
| **Personality: do the agents sound different?** | | | |
| Agents with a persona, voice and avatar, before and after | 0 → 7 | `docs/consoles/OMEGA-HIVE.md` | count |
| A naive-Bayes classifier trained on 5,649 lines from seeds 1–100 names the speaking agent on 5,686 lines from seeds 101–200. Chance is 0.143; always guessing the most common speaker scores 0.269 | 0.950 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| The same events said in one neutral style, so that only the role is left to give the speaker away. Personality adds about 8 points on top of that | 0.870 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Agents whose mean words per sentence sit inside the band their style declares; sentences inside their band | 7 of 7; 1,529 of 1,529 | `docs/consoles/OMEGA-HIVE.md` | count |
| Lines in which every number, id and site name also appears in the event the line describes (one line carries no fact, the standing-approval line) | 954 of 954 | `docs/consoles/OMEGA-HIVE.md` | count |
| **Safety: does the hive keep the governor’s rules?** | | | |
| Jobs the governor allowed for simulation before dispatch; run steps it monitored; dispatches to a physical robot | 161 of 161; 3,631 of 3,631; 0 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Steward vetoes in the day; vetoed jobs that moved past negotiation (a veto never grants) | 7; 0 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Approvals requested wherever the physical path is named | 10 of 10 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Approvals that ran, each only as a new simulated job; declined jobs that ran | 7; 0 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| With the e-stop held at a site: runs there; requests refused as `estop-held` | 0; 40 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Audit lines written to the governance log by a 40 -job day, chain intact | 162 | `docs/consoles/OMEGA-HIVE.md` | count |
| In the built page: lines in the governance log; of them the hive’s; the governor’s | 121; 88; 33 | `docs/consoles/OMEGA-HIVE.md` | count |
| **Voice and captions: on the device only** | | | |
| Checker with a stubbed speech engine offering one on-device and one network voice: utterances, all on the on-device voice; times the network voice was chosen | 22; 0 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Built page: utterances on the on-device voice; then, with voice off, captions shown and utterances | 15 of 15; 43, 0 | `docs/consoles/OMEGA-HIVE.md` | observed |
| Headless drive of the panel over 5 page loads: page errors; requests to other hosts (the one address that named another host was the rendering library’s, answered from a local copy) | 0; 0 | `docs/consoles/OMEGA-HIVE.md` | observed |
| **Avatars in the world** | | | |
| Agents embodied in the avatar checker, before and after: the hive’s agents, from a run of the real hive (seed 1); the agent-jobs personas | 0 → 7; 0 → 4 | `tools/check_agent_avatars.mjs` on `0c834a8a` | count |
| Over that run’s 152 steps (350 spoken lines, 30 moves, 22 refusals, 56 completions): talk light on exactly while a line is spoken, sampled at 20 Hz; a caption bubble for each line; every move ending on a free spot at its named site | 350 of 350; 350 of 350; 30 of 30 | `tools/check_agent_avatars.mjs` on `0c834a8a` | simulated |
| A calm stop gesture on every refusal; a nod on every completion; each agent standing at its home site | 22 of 22; 56 of 56; 7 of 7 | `tools/check_agent_avatars.mjs` on `0c834a8a` | simulated |
| Meshes and sprites in the heaviest figure, against the budget (the same ceiling as the game’s characters); agent labels drawn whole inside their canvas | 11 of 12; 11 of 11 | `tools/check_agent_avatars.mjs` on `0c834a8a` | count |
| Against a fixture of the avatars: jobs that start where their agent’s figure stands; before the walk-back fix the fixture found 9 problems | 161 of 161 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Phone tier, before → after: draw calls; triangles drawn (it builds no figures) | 153 → 153; 56,490 → 56,490 | `docs/consoles/AGENT-AVATARS.md` | observed |
| Balanced tier, before → after, 4 figures: draw calls; triangles drawn | 192 → 228; 117,852 → 121,332 | `docs/consoles/AGENT-AVATARS.md` | observed |
| High tier, before → after, 4 figures: draw calls; triangles drawn | 190 → 226; 159,668 → 163,148 | `docs/consoles/AGENT-AVATARS.md` | observed |
| Portraits: shown at 48 px as 96 px images, drawn once and cached; atlas bytes unchanged against the budget | 155.9 KiB of 160 KiB | `docs/consoles/AGENT-AVATARS.md` | count |
| **Voices for the game’s characters: the same on-device rules** | | | |
| Characters with a voice profile, before and after; profiles inside the band (rate 0.85 to 1.05, pitch 0.85 to 1.15); distinct rate and pitch pairs; the closest pair, as a share of the band; tempers the roles fall into | 0 → 34; 34 of 34; 34 of 34; 0.100; 6 | `tools/check_voices.mjs` on `dc890479` | count |
| Stubbed speech engine with one on-device and one network voice: lines spoken, all verbatim from the knowledge pack; network voices chosen (of 136 utterances); lines spoken over another line | 136 of 136; 0; 0 | `tools/check_voices.mjs` on `dc890479` | simulated |
| With voice off: utterances; dialogues identical with voice on and off | 0; 102 of 102 | `tools/check_voices.mjs` on `dc890479` | simulated |
| Talk light on exactly while a line is spoken; meshes in the heaviest speaking figure against the budget (before the light: 8) | 34 of 34; 9 of 12 | `tools/check_voices.mjs` on `dc890479` | simulated |
| Voice checker checks | 10 passed | `tools/check_voices.mjs` on `dc890479` | count |
| **Supervise every job, and walks that respect the buildings** | | | |
| A seeded 200 -job day: dispatches without the learner’s approval, with the setting off → with “Supervise every job” on (the toggle starts off) | 150 of 155 → 0 of 116 | `tools/check_hive_world.mjs` on `0c834a8a` | simulated |
| Every dispatch line follows an approve line for its job; supervise requests, one for every governor-allowed job; declined jobs that ran; physical dispatches; audit lines, chain intact | 116 of 116; 150; 0; 0; 816 | `tools/check_hive_world.mjs` on `0c834a8a` | simulated |
| The setting’s lines grounded in their events (and inside the consent keeper’s speaking band) | 151 of 151 | `tools/check_hive_world.mjs` on `0c834a8a` | simulated |
| Walk points inside a building’s collider over 50 walks of the agents, before → after routing round buildings; walks that took a route round one; standing slots inside a building, before → after | 1,082 of 11,000 → 0 of 11,424; 8; 1 of 42 → 0 of 42 | `tools/check_hive_world.mjs` on `0c834a8a` | simulated |
| **The hive in a second language** | | | |
| Languages the hive speaks, before and after (English; Spanish, picked by the page’s language, with its own phrase cores, style pools and voice names) | 1 → 2 | `tools/check_voices.mjs` on `dc890479` | count |
| A seeded Spanish day of 955 spoken lines: agents inside their speaking band; sentences inside; lines whose every fact is in their event; strings flagged by the calm-text scan (of 1,071) | 7 of 7; 1,536 of 1,536; 954 of 954; 0 | `tools/check_voices.mjs` on `dc890479` | simulated |
| Speaker named by a naive-Bayes classifier on 2,269 held-out Spanish lines (chance 0.143); lines spoken on a device with no local Spanish voice (the caption stays) | 0.959; 0 | `tools/check_voices.mjs` on `dc890479` | simulated |
| **What the panel costs** | | | |
| Meshes, lights, triangles, draw calls and texture bytes the panel adds on the desktop or phone tier, mounted and after 60 hive steps | 0 | `docs/consoles/OMEGA-HIVE.md` | observed |
| The desktop world it was measured in: meshes; triangles; draw calls | 312; 114,395; 137 | `docs/consoles/OMEGA-HIVE.md` | observed |
| The phone world it was measured in: meshes; triangles; draw calls | 218; 40,726; 90 | `docs/consoles/OMEGA-HIVE.md` | observed |

### Coordination: the hive against one dispatcher, a seeded 200 -job day of 480 simulated minutes

| Measure | Hive of 4 workers | One dispatcher |
|---|---|---|
| Jobs completed, of 200 | 159 | 159 |
| Refused by the governor / vetoed / declined / not accepted | 29 / 7 / 3 / 2 | 29 / 7 / 3 / 2 |
| Mean steps from announcement to award | 0.034 | 13.715 |
| Mean steps from arrival to completion | 4.398 | 18.478 |
| Contested awards resolved / duplicate awards | 207 / 0 | 0 / 0 |
| Site conflicts (a robot busy) resolved | 19 of 19 | 15 of 15 |
| Awards to the best-skilled agent (with one agent, every award) | 158 of 207 | 207 of 207 |

Both columns run behind the same governor, steward and approvals, with a capacity of 2 jobs each. The safety outcomes are identical (29 / 7 / 10 refusals, vetoes and approvals in both); what differs is how long a job waits. Source: `docs/consoles/OMEGA-HIVE.md`.

### Read honestly

- The day has slack, so the single dispatcher also finishes all 159 completable jobs. It takes four times as long per job. The 41 jobs that did not complete are the same in both columns, because the safety outcomes do not depend on who works the job, and the checker asserts that.

- Style adherence is full by construction: the builder pads and picks phrases to fit the band, so the check proves it holds the band with real site names, not that the style sounds natural.

- Distinctiveness is inflated by role, because each agent speaks about different events. The neutral control still names the speaker 0.870 of the time, and personality adds about 8 points on top.

- The governor results are invariants of the design, not discoveries. The approval stand-in in the checker is a seeded rule, not a person.

- While it was built, the check found its own mistakes: the single dispatcher refused 30 jobs to the hive’s 28 because requests reached the governor out of time order; fixed at the source, the outcomes became identical.

### What it is not

### It is: Not people

The agents are software, and the page says so on every card and in every caption. Their names are invented, they are drawn with a hologram tint and a visor and halo rather than a face, and their portraits are badges.

Source: `docs/omega-hive.md`

### It is: Not a language model

Each line is built on the device from the agent’s style grammar and the event’s own data. No model call and no network call exist anywhere in the hive. A dialogue adapter exists in the shape of the game’s own, and it refuses until it is configured and sends nothing; even configured, it would speak a reply only if every fact in the reply is in the event.

Source: `docs/omega-hive.md`

### It is: Not a robot controller

Every robot is simulated. The physical path is disabled and nothing in the hive turns it on. Approving a request lets only the simulated job run, and the governor’s rules stand: the e-stop first, then the allowlist, speed and separation, policy lineage, the rate limit and the anomaly check.

Source: `docs/omega-hive.md`

### It is: Not a chain or a market

No keys, no wallets, no chain calls, no tokens and no payments. Virtuals Protocol is a technology the project plans to use for on-chain agents, and it is planned only: nothing from it is installed, bundled or called, and no partnership is stated.

Source: `docs/virtuals-bridge.md`

### It is: Not a measure of real operations

The job stream, its rates and its limits are simulation parameters. A hop between robot sites counts maps and regions, not distance, and a step is one simulated minute.

Source: `docs/omega-hive.md`

### Where it is in the product

### The Omega Hive panel

In the parishes app’s drills menu, beside the agent-jobs panel: roster cards, a live caption feed, a voice toggle that starts off, the approval queue and Step and Run controls, and a “Supervise every job” toggle that also starts off, with crisper portraits on the roster cards. It is not mounted in K-grade, demo or signed-out sessions.

### In the world

The avatar layer puts a labelled hologram figure at a robot site on the balanced and high tiers (the phone tier builds none): it walks when its agent moves, shows a talk light and a caption bubble while a line is spoken, raises a palm on a refusal and nods on completion. Round one tested the layer against a fixture because the page’s avatar mount read the panel object, which holds the hive one level down. HIVE-IN-WORLD fixed the mount (it is merged into the integration head), and its checker now runs the real hive: 7 agents embodied, with the talk light, captions and moves exact over a run of 152 steps.

### Instructor console and Guide

The Data governance tab lists the agents with their portraits, and the Guide answers “What is the Omega Hive?” from its on-device knowledge base. Both were wired when round one was integrated; the console page has not yet been driven with the full roster.

### The game’s characters

The same voice controller speaks the 34 game characters’ own knowledge-pack lines, verbatim and nothing else, and shares one line of speech with the agents so nobody talks over anybody. A character’s voice profile is derived from who they are, inside a gentle band; a note says when the device has no on-device voice, and the captions stay.

### What is left

- *Planned* Another language beyond English and Spanish needs its own phrase cores, not only another voice.

- *Planned* A person’s approval is still a stand-in in the checker, a seeded rule: no learner has used the setting, and none has been measured.

- *Planned* `check_omega_hive` carries an estimated timing row to re-measure on a quiet machine.

**Round two of this loop** is read from its console branches while the coordinator merges them: `HIVE-IN-WORLD` (committed, head `0c834a8a`, merged; its console note is committed, and its figures here come from its checkers re-run on a snapshot of that commit); `VOICES` (committed, head `dc890479`, merged; its figures here come from its checker re-run on a snapshot of that commit, beside its committed console note). The pages are rebuilt by one command, and each figure is re-checked then.

Sources: `docs/consoles/OMEGA-HIVE.md`, `docs/omega-hive.md`, `docs/consoles/AGENT-AVATARS.md`, `WebXR/shared/oh-hive-data.js`, `tools/check_omega_hive.mjs`. The figures are read from those notes and files by the script that built this page. The seeded runs are simulations; no person was measured, and no hardware is involved.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `41e41366`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
