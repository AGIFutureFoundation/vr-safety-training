# ROBO-ARENA: robots compete on tasks, model against model (`ra`, port 9145)

Loop 10, round 6b (SmartCiti.X Holodeck · Powered by AGI Corp). Base 230105b7 (loops 3–9, loop 10 rounds 1–5). This builds
on COLEARN (`col-learn.js`), ROBOTRAIN-6/7/8 (`rt6-learn.js`, `rt7-learn.js`, `rt8-learn.js`), ROBOTICS' gym (`rb-env.js`),
VBRIDGE's governor (`vb-governor.js`) and DATAWORKS (`dx-data.js`). Every robot is simulated. Every model here is built and
trained in this repository, on the device, with no network call, no external API and no key. Every demonstration is
synthetic and says so. No person was measured.

## The contract (committed first, c720e927; OMEGA-CLAW codes against it)

`WebXR/shared/ra-arena.js`:

- `raModels()` → `[{ id, family, trainedOn, params }]`: `random`, `reactive`, `bc`, `dagger-r1`, `dagger-r3`, `step-reward`,
  `ra-lm`, `expert` (8). `gymOnly: true` marks the families that have no station form.
- `raScenarios()` → `[{ id, kind: "gym" | "station", hard }]`: the six gym games, their three hard variants and the three
  robot stations (12).
- `raRun({ modelId, scenarioId, seeds, station?, lmOptions? })` →
  `{ success, ruleBreaks, steps, stops, governorChecked, physical: 0, perSeed: [...] }`, plus `applicable`, `n`, `successes`,
  `stepsRun`, `stepsChecked`, `auditOk`, `modelHash`, `modelSize`.
  - It is deterministic for the seeds.
  - A station needs `{ station }`, the full suite's room, as COLEARN's eval builds it.
  - A family with no form for the scenario returns `applicable: false`. These are the reactive agent off its three
    scenarios, and DAgger and the step-reward clone on stations.
- `raLeaderboard(results)` → rows ranked by success, each with a Wilson 95% interval, rule breaks, mean steps, governor
  stops and coverage, and a per-scenario breakdown.

**The governor.** Each episode runs as a seeded safe simulated job at the scenario's robot site. The job runs at half the
rig's speed limit, with the nearest person at 8 m. `vbGovernor().monitor()` sees every step. A broken safe-practice rule is a
deviation, and the governor halts the run with a protective stop, as `vbRun` does. The target is always the simulator.
`physical` counts dispatches to a non-sim target, and it is 0 by construction (and checked). Each episode's governor audit
chain is verified.

## Declared before running (docs/evals/arena-declared.json, commit 00e20dce)

That file is the declaration, and `tools/arena_eval.mjs` refuses a held-out run unless its protocol matches the code. In
short:

- **Seeds.** The held-out seeds are **7121–7180** (fresh) for the gym, and 7121–7130 for the stations: a station runs about
  280 steps, and a random policy runs to the 20,000-step cap.
- **Training data.** COLEARN's synthetic demonstrations (the scripted expert at skill 0.85 with action noise 0.3, seed 1):
  40 per gym task and 20 per station. Learners keep clean passes only. DAgger uses 1 and 3 rounds of 20 rollouts on seeds
  800100+, labelled with the scripted expert's action, not a person's. The step-reward clone uses ROBOTRAIN-7/8's window
  reward at threshold 0.25.
- **Held-out tasks.** The hard variants are never trained on: each learned model trains on the base task and runs on the
  variant.
- **Headline.** ra-lm minus bc, pooled on the three hard variants, 180 episodes each, with Newcombe's 95% interval,
  measured once. No claim is made from a difference whose interval spans 0.
- **Disclosure.** Development used seeds 1–20 (gym) and 1–3 (stations) only. On dev seeds:
  - the cache key was fixed;
  - the reactive agent's n/a scenarios were found;
  - ra-lm's parameter head changed from ridge regression to the 5 nearest moments, after teleop scored 0 of 20.

## What is here

- `WebXR/shared/ra-arena.js` holds the contract, the model builders (cached per scenario) and the governed episode loop.
- `WebXR/shared/ra-lm.js` is **a small language-conditioned model trained here. It is not a large language model.**
  - **Input.** The task text is the scenario's name, blurb, actions and rules, its variant's parameters in words, and the
    linked station's step titles, prompts and hazards (`exports/unity/SmartCitiX/Content/stations/*.json`). The text is
    TF-IDF weighted and hashed into 24 buckets. On a station, the current step's text is added at every step.
  - **Model.** A masked softmax over tᵀ·W·[s, 1], where s is COLEARN's scene features: 26,640 weights. It is trained with
    seeded SGD (6 epochs) on all nine trained tasks at once.
  - **Continuous parameters** come from the 5 nearest training moments of the same task and label, said plainly.
  - **Provenance** is recorded per sample. Consented takes enter only through `colDemosFromEpisodes`, which refuses an
    episode without an adult consent receipt.
  - **Ablation.** `blankText` gives the same model and data with the instruction removed.
- `tools/arena_eval.mjs` writes `docs/evals/arena.json`. It is deterministic, with no timestamp and no timing.
- `tools/ra_dataset.mjs` writes `exports/robotics/arena/`.
  - The format is the schema `smartcitix.robotics.arena-episode@1`, one JSONL line per step. Each line holds the
    observation, the instruction id, the action, the reward, the rule flags, the consent provenance, the scenario, the
    station and the split.
  - Splits are fixed by generator seed: train is seed 1, validation seed 3, test seed 5.
  - Dedup and leakage removal key on episode content.
  - The folder holds the dataset card, `schema.json`, `instructions.json`, `index.json` and a one-episode sample per scenario
    and split. ROBOEXPORT caps the `exports/robotics` folder at 1.5 MB, so the full set (43 shards) is written only with
    `--full --out <dir>`.
- `tools/rb_export.mjs` `rxDiff` now skips `arena/` (`RX_FOREIGN`). `check_arena` rebuilds that folder byte for byte instead,
  so every other unexpected file still fails `check_roboexport`.
- `WebXR/shared/ra-panel.js` and `tools/gen_robotics_programme.mjs` add the read-only **Robot arena** section on
  `WebXR/robotics/programme.html`.
  - It is static HTML from `arena.json`: three headline figures, the leaderboard with intervals, and 12 per-scenario bar
    cards.
  - The hero has a "Robot arena" link.
  - No script runs for it, and nothing is fetched.
- `tools/drive_arena_panel.mjs` is a headless drive on port 9145.
- `tools/check_arena.mjs` is the new checker, in `check_all` with an estimated baseline row.

## Evals (before → after)

| What | Before | After | Source |
|---|---|---|---|
| Model families compared on the same scenarios and seeds | 0 | **8 families on 12 scenarios** (81 applicable model × scenario rows, 4,260 episodes) | `docs/evals/arena.json` `totals`, `results` |
| Steps the governor checked | — | **179,248 of 179,248** (every row `governorChecked` 1.000); physical dispatches **0**; audit chains intact | `arena.json` `totals` |
| Gym leaderboard, pooled success (Wilson 95%) | — | expert 1.000 [0.993, 1] · reactive 0.939 [0.909, 0.959] (6 scenarios) · dagger-r3 0.859 [0.827, 0.886] · bc 0.837 [0.804, 0.866] · dagger-r1 0.809 [0.774, 0.840] · step-reward 0.802 [0.766, 0.833] · ra-lm 0.757 [0.720, 0.792] · random 0.000 [0, 0.007] | `arena.json` `leaderboard.gym` |
| Rule breaks (= governor stops) on the gym, per family | — | expert 0 · reactive 0 · dagger-r3 19 · bc 35 · dagger-r1 37 · step-reward 43 · ra-lm 64 · random 670 (476 stops) | same |
| **Small model vs clone, held-out tasks** (3 hard variants × 60 seeds) | — | ra-lm **0.600** [0.527, 0.669] vs bc **0.622** [0.550, 0.690]; difference **−0.022 [−0.122, 0.078]**. No difference can be claimed. | `arena.json` `smallModel.heldOutTasks` |
| Small model vs clone, every scenario, held-out seeds | — | ra-lm 0.753 [0.716, 0.786] vs bc 0.846 [0.814, 0.873]; difference **−0.093 [−0.139, −0.047]**: the clone is better | `smallModel.heldOutSeeds` |
| Text ablation (same model, instruction blanked) | — | 0.719 [0.681, 0.755] overall (ra-lm − blank +0.033 [−0.018, 0.084]); on the held-out tasks 0.606 (−0.006 [−0.106, 0.095]) | same |
| Where ra-lm leads or trails | — | AMR hard 0.167 vs bc 0.067. AMR base 0.417 vs 0.700. Port 0.767 vs 1.000. Cobot setup 0.883 vs 1.000. Cobot station **0 of 10** vs 10 of 10. Robot-cell and AMR stations 10 of 10, as bc. | `arena.json` `results` |
| Dataset episodes / steps by split | 0 | train 237 / 6,371 · validation 57 / 1,547 · test 57 / 1,551 (351 / 9,469; all synthetic, 0 consented, 0 refused). 6 cross-split copies removed from the later split; 3 within-split duplicates dropped. **Leakage 0**, re-measured from the full lines. | `exports/robotics/arena/index.json`; `check_arena` 7 |
| `check_colearn` / `check_roboscenarios` / `check_dataworks` / `check_roboexport` | pass | 69/0 · 13/0 · 59/0 · 8/0 (pass) | single runs, below |
| `check_arena` | — | 8 passed, 0 failed | `node tools/check_arena.mjs` |
| Panel drive (1920×1080) | — | page errors 0, off-host requests 0, 8 leaderboard rows, 12 scenario cards, no horizontal overflow | `node tools/drive_arena_panel.mjs 9145 <dir>` |

What the table says, plainly:

- The scripted expert is an upper bound, not a learner.
- Of the learners, three DAgger rounds lead the gym.
- The small language-conditioned model trails the clone over all scenarios. On the held-out tasks it is level with the clone
  within a wide interval.
- Reading the instruction text adds about 3 points overall, with an interval that spans 0.
- Where the text matters is the stations, whose step text changes as the drill moves on. With the instruction blanked, the
  robot-cell and AMR stations drop from 10 of 10 to 0 of 10 on 7121–7130. On the gym, the blanked model scores the same as
  the full one on every scenario except AMR hard (0.183 against 0.167). Source: `arena.json` `ablation`.

## Cycles

1. **Reason:** OMEGA-CLAW codes against the contract, so it must exist before any model does. **Act:** `ra-arena.js` with
   six working families and an `ra-lm` stub that reports `applicable: false`. **Observe:** a smoke run on dev seeds 1–5 threw
   `pol is not a function` for `reactive` on cell entry: `rt7ReactivePolicy` returns null off its three scenarios. Made it
   n/a. **Check:** smoke on dev seeds (random 0, bc 1, expert 1 on cell entry; reactive 1 on AMR hard); commit c720e927 at
   17:40.
2. **Reason:** a language-conditioned model across tasks needs the text to choose how the scene is weighed, not just a bias.
   **Act:** a bilinear masked softmax tᵀ·W·[s, 1] with TF-IDF hashed text. **Observe:** teleop scored 0 of 20 on dev seeds;
   the ridge parameter head could not follow the expert's curved path (its dx kept one sign). **Check:** replaced it with the
   5 nearest moments; teleop 17 of 20 on dev seeds, disclosed in the declaration.
3. **Reason:** the ablation must change the model. **Act:** ran it with the text blanked. **Observe:** the dev numbers were
   identical to the text model's, because the per-scenario cache key ignored `blankText`, so both used one model. **Check:**
   the key now carries the options. The station ablation then differed (0 of 3 on dev seeds).
4. **Reason:** declare before measuring. **Act:** `arena-declared.json`, with `arena_eval.mjs` refusing a held-out run unless
   the protocol matches. Committed (00e20dce), then one held-out run. **Observe:** 4,260 episodes, every step checked, 0
   physical. **Check:** `check_arena` 2 (the declaration is an ancestor of the first results commit, 54d8ce84) and 5 (six
   rows re-run live and identical).
5. **Reason:** splits must not leak. **Act:** dedup keyed on scenario, seed and actions. **Observe:** "leakage 7". The key
   lacked the seed field (DX keeps it elsewhere), and the scripted generator sometimes repeats an episode exactly. **Check:**
   key on content (observations and actions), and fill splits in order, removing later copies. 6 removed, and leakage
   re-measured from the written lines is 0.
6. **Reason:** exports live under `exports/robotics/`, which ROBOEXPORT guards. **Act:** wrote the shards there. **Observe:**
   `check_roboexport` failed twice: once for extra files in `rxDiff`, once for the folder at 5.1 MB against its 1.5 MB cap.
   **Check:** a one-episode sample plus the card, schema, texts and index (1,277 KB for the whole folder); the full set
   only with `--full --out`; `rxDiff` skips only `arena/`, which `check_arena` compares byte for byte. The cap was not
   loosened. `check_roboexport` 8/0.
7. **Reason:** the page must show the measured file, not a live run. **Act:** a static section generated from `arena.json`.
   **Observe:** a negative interval rendered as "-12.2%–7.8%". **Check:** "−12.2% to 7.8%" for intervals with a negative
   end. The drive found 0 page errors and 0 off-host requests; `check_arena` 8 and `check_robotics_programme` pass.

## Checkers run (single checkers; last lines)

- `check_arena`: 8 passed, 0 failed
- `check_colearn`: 69 passed, 0 failed
- `check_roboscenarios`: 13 passed, 0 failed
- `check_dataworks`: 59 passed, 0 failed
- `check_roboexport`: 8 passed, 0 failed
- `check_robotics_programme`: ok — 714 checks
- `check_robotrain`: ok — 334 checks
- `check_imports`: all 1,130 modules call only what they declare or import
- `check_parse`: all 2,709 shipped modules parse
- `check_newton`: all NEWTON checks pass
- `check_interface`: not run; no control was added or changed (the panel is static, read-only HTML)

## Seams

- **OMEGA-CLAW** reads `raModels`, `raScenarios`, `raRun` and `raLeaderboard`. For held-out runs it should pass seeds from
  7121–7180 or a fresh range of its own; the arena's published rows already used 7121–7180 once.
  - `raRun` for a station needs `{ station }`.
  - `raRun` for `ra-lm` needs `lmOptions.texts` (`raLmTaskTexts(readStation)`; `tools/arena_eval.mjs` exports `raTexts()`),
    and `stationFor` for the station tasks.
- **Bundling.** `ra-arena.js` imports `rt6/7/8-learn.js` and `vb-governor.js`, and the rt modules are in no page bundle. So
  the arena runs in Node, and the page shows `arena.json` through the static panel. Loading `ra-arena.js` in a page would
  mean adding rt6–rt8, col-learn and ra-* to that page's list in `tools/bundle_webxr.py`.
- **COLEARN.** `col-learn.js` now exports `colRows` and `colAction`; the change is additive, and its outputs are
  byte-identical (`check_colearn` 69/0).

## Left

- The small model trails the clone overall (−0.093). Its weak spots are AMR base (0.417), port (0.767) and the cobot station
  (0 of 10). A fresh range is needed for any retest; this one has been seen once.
- The station tasks are not in the dataset yet (they need the suite; about 5,600 steps a station).
- No consented learner take exists in a headless run. The page has no "export my takes into the arena set" button yet.
- The light scheme of the programme page renders dark: the page's own design tokens are dark-only. The arena section
  follows the page.
