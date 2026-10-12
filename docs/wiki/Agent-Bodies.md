# The agents' bodies

How the Omega Hive's seven software agents look on each device tier: the figure, personality in posture, speech in the mouth and gestures, and the budgets each tier holds.

## The agents’ bodies: how they look, move and speak

Each of the 7 software agents of the Omega Hive has a body in the world: a labelled hologram figure with a visor and a halo where a face would be (on the desktop high tier the visor band carries eyes, brows and a mouth, so that the mouth can follow the words), standing at its robot site or inside its room. It speaks with a talk light and a caption bubble, walks when the hive moves it, raises a palm when a request is refused and nods when a job completes. It is software and looks it: no skin tone, and no real person’s likeness. The phone tier builds no figure. This cell says what the body is today, from the notes of the earlier rounds, and what this loop’s last round added on the desktop high tier, from its note.

- 11 of 12 meshes and sprites in the heaviest agent figure (9 meshes and 2 sprites), the same ceiling as the game’s characters `docs/consoles/AGENT-AVATARS.md`
- 36 / 3,480 draw calls and triangles that 4 figures add on the balanced and the high tier; the phone tier builds no figure and its 153 draw calls do not move `docs/consoles/AGENT-AVATARS.md`
- 350 of 350 spoken lines, over a run of the real hive, with the figure’s talk light on exactly while the line is spoken and a caption bubble for each `docs/consoles/HIVE-IN-WORLD.md`
- 0 of 11 → 11 of 11 agent labels drawn whole inside their canvas (a long role had been cut at its edge in a capture) `docs/consoles/HIVE-IN-WORLD.md`

### The figure, tier by tier, today

| Tier | What is built | Draw calls, before → after | Triangles, before → after |
|---|---|---|---|
| Phone (low) | No figure: each agent keeps its place in the state machine, and its captions still show. | 153 → 153 | 56,490 → 56,490 |
| Balanced | The figure: a hologram tint, a visor and halo instead of a face, a high-visibility vest and a tablet, a label and a caption bubble; 9 meshes and 2 sprites. | 192 → 228 | 117,852 → 121,332 |
| High (desktop) | The same figure; at most 320 KiB of textures a figure on the desktop tiers (a label canvas of 256 × 64 and a caption canvas of 512 × 128). | 190 → 226 | 159,668 → 163,148 |

Measured in the built page with 4 figures standing in it; the layer as a whole is 36 meshes, 8 sprites and 4,048 triangles, and its texture bytes are 262,144. Source: `docs/consoles/AGENT-AVATARS.md`.

### How the body follows the hive

| The hive does | The body does | Measured |
|---|---|---|
| A line is spoken | The talk light is on for the line’s window and a caption bubble shows above the figure. | 350 of 350 lines (350 over 152 steps); a caption for 350 of 350 |
| The agent moves to another site | It walks at 2.2 m/s, animated only within 150 m of the learner and hidden beyond; walks route round buildings. | 30 of 30 moves end at the named site; walk points inside a building 1,082 of 11,000 → 0 of 11,424 |
| A request is refused | A calm stop gesture, a raised palm. | 22 of 22 |
| A job completes | A nod. | 56 of 56 |
| Reduced motion is on | No walking (the figure jumps), no nod or bob, the talk light holds still; captions show as always. | by design |

The measured figures are the real hive’s run in the avatar checker, 152 steps with 350 spoken lines, 30 moves, 22 refusals and 56 completions. Source: `docs/consoles/HIVE-IN-WORLD.md`.

### In the rooms

| Room, tier | Meshes | Triangles | Textures, MiB |
|---|---|---|---|
| Cell hall, high | 20 → 38 with 2 agents; 47 with up to 3 visitors (of 120) | 1,688 → 3,704; 4,712 (of 6,000) | 22.67 → 23.50; 23.92 (of 24) |
| A room with one agent | adds 9 | adds about 1,000 | 2 sprites added |

The cell hall is the worst room: the figures are what take it to the edge of its texture budget on the high tier, which is why no more than 3 figures stand in a room at once. Agents homed at a site stand at its agent spots (7 of 7), and an agent the hive sends there comes in through the door and walks out when its job ends (0 of 108 → 108 of 108 job moves shown). Sources: `docs/consoles/HIVE-IN-WORLD.md`, `docs/consoles/HIVE-3.md`.

### Portraits

The roster and the instructor console show each agent as a portrait: 96 px images drawn once and cached, shown at 48 px so that a high-density screen is sharp, on 7 of 7 roster cards; portraits that are distinct 10 of 11 → 11 of 11 once the steward and the governor persona stopped sharing one; the atlas is 155.9 KiB of its 160 KiB budget. Sources: `docs/consoles/AGENT-AVATARS.md`, `docs/consoles/HIVE-IN-WORLD.md`.

### Round four, on the desktop high tier: the high-detail figure (AVATARS-HD)

The console built one skinned body and one skinned glow mesh for each agent (rounded forms, jointed arms with mitten hands, a role-coloured visor band with eyes, brows and a mouth, a thin halo; a cool porcelain shell and never a skin tone), personality in the posture, a mouth that follows the words and gestures that follow the hive’s own events, and portraits drawn from the figure. Every figure below is read from `docs/consoles/AVATARS-HD.md` (merged into the integration head; the console’s last commit is `5e810d5d`).

- 2,774 of 3,000 triangles in the heaviest high-detail figure (mean 2,693; today’s figure has 1,012), against a budget the console states itself
- +18 vs +54 draw calls the 6 agents in view add in the built page, the new figure on high against today’s on balanced (16,288 triangles against 5,220)
- 18 of 21 → 21 of 21 agent pairs whose silhouettes are distinct (front-view overlap at most 0.9); three agents shared one body shape in today’s figure
- 15.3 ms mean time for the mouth to open after a word boundary from a stubbed voice (20 of 20 within 25 ms), and 20.0 ms after a word’s onset in the caption when the voice is off

### The figure, tier by tier

| Tier | The figure | Triangles per figure | Draw calls, silent / speaking |
|---|---|---|---|
| Phone (low) | None: unchanged | 0 | none |
| Balanced | Today’s figure, unchanged | 1,012 | 9 / 11 |
| High (desktop), the outdoor mount | The high-detail figure: 3 meshes and 2 sprites (11 before, of the 12 a figure may use) | 1,012 → 2,693 on average, worst 2,774 (budget 3,000) | 9 / 11 → 3 / 5 |
| High (desktop), the robot rooms | Today’s figure: three new figures at about 2,700 triangles each would take the cell hall (1,688 triangles of shell) past the rooms’ 6,000 | unchanged | unchanged |

Measured by the checker `tools/check_agent_avatars.mjs` on the real three.js geometry, with the budget held in `WebXR/shared/aa-agent-hd.js`: 12 meshes and sprites, 3,000 triangles and 3 draw calls silent / 5 speaking a figure. The new figure is built only on the desktop high tier’s outdoor mount, and a mount that does not ask for it keeps today’s figure, which the checker proves.

### What it costs in the built page

| Tier | Draw calls, without → with the agents | Triangles, without → with | Figures built |
|---|---|---|---|
| Phone (low) | 154 → 154 | 56,062 → 56,062 | none |
| Balanced | 195 → 249 (+54) | 116,754 → 121,974 (+5,220) | 6, today’s figure |
| High | 194 → 212 (+18) | 163,576 → 179,864 (+16,288) | 6, of which 6 high-detail |

The console’s headless drive `tools/drive_avatars_hd.mjs` of the built page, at `sf-downtown` with the camera on the first robot site; the drive found page errors 0 and off-host requests 0. On the high tier the new figure trades about two-thirds of the agents’ draw calls for about three times their triangles (18 calls against 54; 16,288 triangles against 5,220); with all eleven figures in view the layer adds 22 to 33 calls on high and 75 to 85 on balanced across three runs, a spread the console puts down to a frame that streams in between, which is why the stationary frames above are the measure. Frame time was not measured.

### Personality in the body

| Measured | Result | Over |
|---|---|---|
| Caution ↔ an upright spine and head | Spearman ρ 0.89 | the 7 agents |
| Warmth ↔ an open stance (arms away from the body, feet apart) | Spearman ρ 1.00 | the same agents |
| Verbosity ↔ hand motion while speaking | Spearman ρ 1.00 | the same agents |
| Formality ↔ a tidier silhouette (arms close, hands together) | Spearman ρ 0.93 | the same agents |
| Distinct silhouettes among the 21 pairs of agents (front-view overlap at most 0.9) | 18 of 21 → 21 of 21; most alike pair 1.000 → 0.844, median 0.828 → 0.677 | today’s figure → the new one |

Each correlation compares a trait with a number the figure sets from it (a lean, a stance, a hand-motion tempo, a tidiness), so it shows that the mapping runs the right way and not that a learner would notice it. The silhouettes are the figure’s own front-view outlines. Source: `docs/consoles/AVATARS-HD.md`.

### Speech and gesture in the body

| Measured | Result | Note |
|---|---|---|
| The mouth with the voice on: a stubbed utterance’s word boundaries | within 15.3 ms of each boundary; 20 of 20 within 25 ms | the tolerance was fixed before the re-run |
| The mouth with the voice off: the caption’s own word timing | within 20.0 ms of each word’s onset (20 of 20); closes between words (19 of 19) | the line’s own clock |
| The real voice controller: word boundaries forwarded to the figure | 0 | two lines on the `HIVE-4` side are needed (see Left) |
| A bid → the hand is raised | 200 of 200 | a real hive run of 120 steps |
| An award → the accepting gesture | 67 of 67 | before: none |
| A refusal → the stop gesture (hand forward and up, palm out) | 20 of 20 | before: 20 stop gestures |
| A refusal’s stop hand held for its full 1.8 s, every frame sampled | 15 of 20 → 20 of 20 | a bid’s raise or an award’s accept had cut some short; now they wait behind it (9 waited, 4 replaced while waiting) |
| An approval → a nod; a completed job → a nod | 47 of 47; 45 of 45 | approvals come from a seeded stand-in learner; before, 45 nods |
| Each gesture’s pose, measured on the figure’s bones in the middle of the gesture | 5 of 5 | the gesture kinds |

Reduced motion holds the high figure still, and a gesture rests at its pose. Portraits are drawn from the new figure too: 22 of 22 at 96 px for an ordinary high-density screen and 144 px for a denser one, deterministic and distinct (11 of 11), in the roster’s same card layout; in the built instructor console 11 of 11 cards are drawn from the figure. The head and hands stay at least 0.15 (RGB distance) from each of the game’s 12 skin tones; the closest is 0.177. The checker went from 70 to 92 checks (22 new), all passing, with the neighbours (`check_hive_world` 35, `check_hive3` 32, `check_imports` 1,119 modules, `check_parse` 2,698 modules); the console looked at 5 stills at 1920×1080.

### Read honestly

- The talk-light and caption checks are exact by construction, because the light follows the line’s clock window; they show that the windows hold over a real hive’s bursts and queues, and they do not test a voice. With a stubbed speech engine in the rooms the light was on for 15 of 15 voiced lines, and it can come on slightly before the voice starts (the notes of `HIVE-IN-WORLD` and `HIVE-3`).

- The agents are not people and are not drawn as people, but a figure with arms, a visor and a voice can still feel like a person; whether learners read the label has not been tested on anyone.

- Outdoors an agent stays where the hive last moved it, because the hive has no “go home” move; only the rooms send an agent home.

- The personality check compares each trait with a number the figure sets from it, so it proves the mapping and not the impression: no learner was asked whether a hesitant agent looks hesitant. The silhouette check is the same kind of test, on outlines rather than on people.

- The voice’s word boundaries do not reach the mouth in the page yet: the real voice controller forwards 0 of them, and two lines on `HIVE-4` ’s side are needed. Until then, with the voice on, the mouth follows the start and the end of the line with word timing at the voice’s rate; the timing figures above are for a stubbed voice and for the caption’s clock.

- The robot rooms keep today’s figure, where a learner meets the agents up close; the new figure there needs a lighter level or a rule that draws only the nearest.

- The cost was measured in draw calls and triangles, in the page and in the checker, and not in frame time, so whether a modest desktop holds its frame rate with the new figure is not shown.

- The look was checked by eye as well as by number. In the first render the role colour tinted the whole shell and the steward and the trainer read as skin, which is why the shell is now a cool porcelain with a measured distance from every skin tone; in the page the body’s own glow then warmed the shells again until it was replaced by a cool lift.

**Round four ** of this loop is **merged** into the integration head (`54c3f318`) and is read from it with a read-only git show: `AVATARS-HD` (its own commits end at `5e810d5d`, 5 commits of its own; its console note is committed; merged). Each figure is checked by phrase against that console’s note or its commit messages, and a rebuild re-reads the final state.

Sources: `docs/consoles/AGENT-AVATARS.md`, `docs/consoles/HIVE-IN-WORLD.md`, `docs/consoles/HIVE-3.md`, `docs/consoles/VOICES.md`. The figures are read from those notes by the script that built this page. The seeded runs are simulations; no person was measured, and no hardware is involved.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `54c3f318`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
