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
| Agents embodied in the avatar checker, before and after: the hive’s agents, from a run of the real hive (seed 1); the agent-jobs personas | 0 → 7; 0 → 4 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs`) | count |
| Over that run’s 152 steps (350 spoken lines, 30 moves, 22 refusals, 56 completions): talk light on exactly while a line is spoken, sampled at 20 Hz; a caption bubble for each line; every move ending on a free spot at its named site | 350 of 350; 350 of 350; 30 of 30 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs`) | simulated |
| A calm stop gesture on every refusal; a nod on every completion | 22 of 22; 56 of 56 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs`) | simulated |
| Agent labels drawn whole inside their canvas, before → after (a label had been cut at its edge in the reel’s capture); the portraits that are distinct, before → after | 0 of 11 → 11 of 11; 10 of 11 → 11 of 11 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs`) | count |
| Against a fixture of the avatars: jobs that start where their agent’s figure stands; before the walk-back fix the fixture found 9 problems | 161 of 161 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Phone tier, before → after: draw calls; triangles drawn (it builds no figures) | 153 → 153; 56,490 → 56,490 | `docs/consoles/AGENT-AVATARS.md` | observed |
| Balanced tier, before → after, 4 figures: draw calls; triangles drawn | 192 → 228; 117,852 → 121,332 | `docs/consoles/AGENT-AVATARS.md` | observed |
| High tier, before → after, 4 figures: draw calls; triangles drawn | 190 → 226; 159,668 → 163,148 | `docs/consoles/AGENT-AVATARS.md` | observed |
| Portraits: shown at 48 px as 96 px images, drawn once and cached; atlas bytes unchanged against the budget | 155.9 KiB of 160 KiB | `docs/consoles/AGENT-AVATARS.md` | count |
| **Voices for the game’s characters: the same on-device rules** | | | |
| Characters with a voice profile, before and after; profiles inside the band (rate 0.85 to 1.05, pitch 0.85 to 1.15); distinct rate and pitch pairs; the closest pair, as a share of the band; tempers the roles fall into | 0 → 34; 34 of 34; 34 of 34; 0.100; 6 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | count |
| Stubbed speech engine with one on-device and one network voice: lines spoken, all verbatim from the knowledge pack; network voices chosen (of 136 utterances); lines spoken over another line | 136 of 136; 0; 0 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | simulated |
| With voice off: utterances; dialogues identical with voice on and off | 0; 102 of 102 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | simulated |
| Talk light on exactly while a line is spoken; meshes in the heaviest speaking figure against the budget (before the light: 8) | 34 of 34; 9 of 12 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | simulated |
| Voice checker checks | 10 passed | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | count |
| **Supervise every job, and walks that respect the buildings** | | | |
| A seeded 200 -job day: dispatches without the learner’s approval, with the setting off → with “Supervise every job” on (the toggle starts off) | 150 of 155 → 0 of 116 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_hive_world.mjs`) | simulated |
| Every dispatch line follows an approve line for its job; refusals and vetoes, the same with the setting on or off | 116 of 116; 31 and 9 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_hive_world.mjs`) | simulated |
| Walk points inside a building’s collider over 50 walks of the agents, before → after routing round buildings; walks that took a route round one; standing slots inside a building, before → after | 1,082 of 11,000 → 0 of 11,424; 8; 1 of 42 → 0 of 42 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_hive_world.mjs`) | simulated |
| **The hive in a second language** | | | |
| Languages the hive speaks, before and after (English; Spanish, picked by the page’s language, with its own phrase cores, style pools and voice names) | 1 → 2 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | count |
| A seeded Spanish day: agents inside their speaking band; sentences inside; lines whose every fact is in their event; strings flagged by the calm-text scan (of 1,071) | 7 of 7; 1,536 of 1,536; 954 of 954; 0 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | simulated |
| Speaker named by a naive-Bayes classifier on 2,269 held-out Spanish lines (chance 0.143); lines spoken on a device with no local Spanish voice (the caption stays) | 0.959; 0 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | simulated |
| **Round three: the hive sends an agent to a site, and it comes into the room** | | | |
| Agents the hive sent to a robot site, shown inside that site’s room, before → after (the checker’s job moves); rooms inside the room budget and the texture budget at every step; most figures standing in one room | 0 of 108 → 108 of 108; 5,760 of 5,760; 3 | `docs/consoles/HIVE-3.md` | simulated |
| Visitors that came in through the room’s doorway; that walked out when their job ended; agents sent elsewhere that walked out of the room they were in | 104 of 104; 80 of 80; 88 of 88 | `docs/consoles/HIVE-3.md` | simulated |
| What the learner turns on is remembered for a signed-in adult profile on this device (3 settings: the voice switch, “Supervise every job” and the language), under the profile’s own key and back after a reload; demo, K-12, signed-out and unknown sessions that store and read nothing | back after a reload under the profile's own key only; 6 of 6 | `docs/consoles/HIVE-3.md` | observed |
| The hive panel in Spanish (machine-assisted, needs a native speaker's review): UI strings covered; the agents’ role sentences; personality chips; English UI strings left in the panel | 20 of 20; 7 of 7; 8 of 8; no English UI string | `docs/consoles/HIVE-3.md` | observed |
| The voice-driven talk light in the rooms, with a stubbed speech engine offering one on-device and one network voice: on for each spoken line; off after each; network voices chosen | 15 of 15; 14 of 14; 0 of 94 | `docs/consoles/HIVE-3.md` | simulated |
| “A day in the hive”, a seeded scene for the video reviews over its own hive: seconds; beats in order; events, identical on repeated runs of one seed; seeds on which its story holds; page errors; requests to another host | 27; 12; 69; 5 of 5; 0; 0 | `docs/consoles/HIVE-3.md` | observed |
| The worst room over the hive’s day, the cell hall with 3 visitors at most: meshes (budget 120), triangles (budget 6,000) and texture MiB (budget 24) on the high tier; texture MiB on the balanced tier (budget 3) | 47; 4,712; 23.92; 2.98 | `docs/consoles/HIVE-3.md` | observed |
| Checker checks | 32 passed | `tools/check_hive3.mjs` | count |
| **Round four: the hive talks to itself, remembers its day and has a console tab** | | | |
| Agent-to-agent exchanges in a seeded 200 -job day, before → after: handoffs 173, questions 45, reports 40; and on 5 further seeds at 120 jobs | 0 → 258; 174, 163, 162, 156, 158 | `docs/consoles/HIVE-4.md` | simulated |
| Exchange lines whose every fact is re-derived from the award, the winning bid or the chain; sentences inside the speaker’s band | 516 of 516; 776 of 776 | `docs/consoles/HIVE-4.md` | count |
| Turn-taking: replies directly after their opener; lines overlapping on the floor (over 1,294 lines); with a stubbed speech engine, exchange lines spoken in order, on the on-device voice only and one line at a time | 258 of 258; 0; 56 of 56 | `docs/consoles/HIVE-4.md` | simulated |
| Memory references to the agent’s own earlier jobs that day, before → after, from 4 agents; grounded in the hive’s own chain (count, last site, hive-clock time); planted errors the grounding check caught | 0 → 36; 36 of 36; 3 of 3 | `docs/consoles/HIVE-4.md` | simulated |
| In Spanish (the panel’s Spanish hive, same seed): exchanges and memory references per day, before → after; lines grounded (exchange; memory); sentences in the speaker’s band; English fragments but names | 0 → 258; 0 → 36; 516 of 516; 36 of 36; 869 of 869; 0 | `docs/consoles/HIVE-4.md` | simulated |
| The governor with the talk on: jobs checked before dispatch; run steps monitored; physical dispatches (outcomes identical to the quiet hive) | 161 of 161; 3,631 of 3,631; 0 | `docs/consoles/HIVE-4.md` | simulated |
| Trait recovery from text, declared at 14:14 UTC before the held-out run: a ridge regressor on 8 text features fitted on seeds 1 to 50, Spearman rank correlation on the 51 to 100 held-out personas (now, after the steward’s question cooldown): warmth; formality; verbosity; caution | 0.959; 0.832; 0.977; 0.799 | `docs/consoles/HIVE-4.md` | simulated |
| The same test, first run right after the declaration; and after a fix that changed the padding only (warmth; formality; verbosity; caution each time) | 0.963; 0.812; 0.979; 0.804 and 0.958; 0.795; 0.980; 0.798 | `docs/consoles/HIVE-4.md` | simulated |
| The 7 real agents as a secondary check (too small to be the claim): warmth; formality; verbosity; caution | 0.964; 0.929; 1; 0.643 | `docs/consoles/HIVE-4.md` | simulated |
| Repetition: distinct-2 per agent (fact-masked), the default hive → the panel’s configuration: Orrin; Selka; Brann; Ivo; Tamsa; Quen; Lio; and with wording variety alone on the same events. The steward’s question cooldown (at most one question every 6 hive minutes) took it from 0.097 to 0.159, and the questions it asks a day from 103 to 45 | 0.057 → 0.075; 0.145 → 0.159; 0.078 → 0.161; 0.237 → 0.320; 0.060 → 0.110; 0.116 → 0.155; 0.050 → 0.115; 7 of 7 up; variety alone 7 of 7 up | `docs/consoles/HIVE-4.md` | simulated |
| The instructor console’s Omega Hive tab, driven in a headless page: agent cards with portraits and the “software agent” label; lines shown (exchange turns; memory lines); governor refusals listed; eval rows read from a committed JSON; buttons; page errors | 7; 65 (32; 3); 20; 12; 0; 0 | `docs/consoles/HIVE-4.md` | observed |
| On a phone, the tab and its selector, in pixels (width by height) | 96×44; 116×44 | `docs/consoles/HIVE-4.md` | observed |
| Checker checks; the default hive’s day byte-identical to the base (digest 703aa91da7bb9439); stills at 1920×1080 taken and looked at | 11 passed; 4 stills | `tools/check_hive4.mjs` | count |
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

- The talk light in the rooms comes on when the line arrives, which can be before the voice’s start (up to 20 ms in the stubbed engine); from the start to the end it stays on and it goes off after the agent’s last line, so “exact” means on for the whole of every voiced line and off afterwards, not off until the voice starts.

- “A day in the hive” is scripted: the approval is the scene’s and stands in for the learner’s click, and every caption fact comes from the scene hive’s own events. The settings gate is the panel’s own: signed in, not K-12 and not the demo, so “adult profile” here means a signed-in, non-K-12 profile.

- The rooms send an agent home when its last job ends; outdoors, a figure still stays where the hive last moved it, because the hive has no “go home” move.

- Trait recovery is high because the style grammar is a deterministic function of the traits and the features read that grammar’s vocabulary: it shows that the traits reach the text, not that the text is natural. Every reading is reported (the first run right after the declaration, the run after a fix to the padding, and the current one after the steward’s cooldown).

- The talk first made the safety steward repeat more: it asked about a hundred questions a day from six templates and its distinct-2 fell to 0.097. A cooldown of one question every 6 hive minutes with more variants lifted it (0.145 → 0.159), at the price of fewer questions (103 → 45 a day). The rule that decides when it asks is a rule, not a judgement, and the learner in the checker is a seeded stand-in.

### What it is not

### It is: Not people

The agents are software, and the page says so on every card and in every caption. Their names are invented, they are drawn with a hologram tint and a visor and halo rather than a face, and their portraits are badges. The desktop high tier’s newer figure adds eyes, brows and a mouth on its visor band so that the mouth can follow the words, on a porcelain shell with no skin tone and the same label, and its portraits are drawn from that figure.

Source: `docs/omega-hive.md`, `docs/consoles/AVATARS-HD.md`

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

The avatar layer puts a labelled hologram figure at a robot site on the balanced and high tiers (the phone tier builds none): it walks when its agent moves, shows a talk light and a caption bubble while a line is spoken, raises a palm on a refusal and nods on completion. Round one tested the layer against a fixture because the page’s avatar mount read the panel object, which holds the hive one level down. HIVE-IN-WORLD fixed the mount (it is merged into the integration head), and its checker now runs the real hive: 7 agents embodied, with the talk light, captions and moves exact over a run of 152 steps. An agent the hive sends to a site for a job comes into that site’s room through the door and walks out when the job ends (`HIVE-3`, merged into the integration head).

### Instructor console and Guide

The Data governance tab lists the agents with their portraits, and the Guide answers “What is the Omega Hive?” from its on-device knowledge base. Both were wired when round one was integrated; the console page has not yet been driven with the full roster. `HIVE-4` adds an Omega Hive tab to the console (merged): read-only, with a card for each of the 7 agents, their lines, the governor’s refusals and the evals table read from a committed JSON file; its drive on a headless page found page errors 0.

### The game’s characters

The same voice controller speaks the 34 game characters’ own knowledge-pack lines, verbatim and nothing else, and shares one line of speech with the agents so nobody talks over anybody. A character’s voice profile is derived from who they are, inside a gentle band; a note says when the device has no on-device voice, and the captions stay.

### What is left

- *Planned* Another language beyond English and Spanish needs its own phrase cores, not only another voice.

- *Planned* A person’s approval is still a stand-in in the checker, a seeded rule: no learner has used the setting, and none has been measured.

- *Planned* `check_omega_hive` carries an estimated timing row to re-measure on a quiet machine.

- *Planned* The Spanish text is machine-assisted and awaits a native speaker’s review, and the scene’s captions are English only.

- *Planned* What the learner turns on is remembered on the parishes page only: Bay World, Summit and Redwood have no hive panel.

- *Planned* The Spanish exchange and memory lines are machine-assisted, like the rest of the Spanish text; a pad can repeat across the sentences of one line, as in the round before.

- *Planned* The console tab replays a seeded day rather than reading the learner’s own hive.

**Round two of this loop** is merged into the integration head (`54c3f318`): `HIVE-IN-WORLD` (note last committed in `0c834a8a`); `VOICES` (note last committed in `dc890479`). Each figure from it is checked by phrase against that console’s committed note, not re-run from a branch; a note that is edited later stops the build.

**Round three of this loop** is merged into the integration head (`54c3f318`), and each figure from it is checked by phrase against that console’s committed note, a committed data file or a commit message, not re-run from a branch: `HIVE-3` (its last commit `bb5011ca`, 8 commits since the head that round started from; its console note is committed; merged into the integration head). A note that is edited later stops the build.

**Round four ** of this loop is **merged** into the integration head (`54c3f318`) and is read from it with a read-only git show: `HIVE-4` (its own commits end at `507a9448`, 8 commits of its own; its console note is committed; merged). Each figure is checked by phrase against that console’s note or its commit messages, and a rebuild re-reads the final state.

Sources: `docs/consoles/OMEGA-HIVE.md`, `docs/omega-hive.md`, `docs/consoles/AGENT-AVATARS.md`, `WebXR/shared/oh-hive-data.js`, `tools/check_omega_hive.mjs`. The figures are read from those notes and files by the script that built this page. The seeded runs are simulations; no person was measured, and no hardware is involved.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `54c3f318`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
