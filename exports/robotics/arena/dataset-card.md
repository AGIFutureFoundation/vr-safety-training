# Dataset card — robot arena episodes (ra-ds/2)

Schema `smartcitix.robotics.arena-episode@2`, written by `node tools/ra_dataset.mjs` (console ROBO-ARENA, `docs/consoles/ROBO-ARENA.md`).
Deterministic: `tools/check_arena.mjs` rebuilds it in memory and compares byte for byte. The full set's content hash is `1fdf5d6487729ca8` (138 shards, written with `node tools/ra_dataset.mjs --full --out <dir>`); this folder commits the card, the schema, the instruction texts, the index and a sample (the first 1 episodes of each scenario and split, under `sample/`), because `exports/robotics` holds summaries and samples, not dumps.

**Every episode in this version is SYNTHETIC** (the scripted expert at skill 0.85 with action noise 0.3, a stand-in for people in tests) and carries `consent: null`. No person's data is in it.

## Motivation
Trainable sets for the robot gym: the same episodes the arena's learners train on, in one documented, versioned, line-per-step format, so a model trained elsewhere can be compared on the same splits.

## Composition
441 episodes, 35102 steps: 441 synthetic, 0 consented. Episodes / steps per scenario and split:

| scenario | train | validation | test |
|---|---|---|---|
| rb-cell-entry | 40 / 1206 | 10 / 326 | 10 / 262 |
| rb-cobot-zone-setup | 40 / 276 | 9 / 57 | 9 / 56 |
| rb-teleop-pick-place | 40 / 2340 | 10 / 580 | 10 / 584 |
| rb-amr-fleet-routing | 37 / 536 | 8 / 116 | 8 / 139 |
| rb-construction-drilling | 40 / 800 | 10 / 210 | 10 / 182 |
| rb-port-gantry | 40 / 1213 | 10 / 258 | 10 / 328 |
| rb-station-robot-cell | 20 / 5734 | 5 / 1460 | 5 / 1400 |
| rb-station-amr-fleet | 20 / 5668 | 5 / 1399 | 5 / 1402 |
| rb-station-cobot | 20 / 5763 | 5 / 1401 | 5 / 1406 |

The three robot stations are in this version: 90 episodes and 25633 steps, 20 / 5 / 5 generated per split (a station runs about 280 steps). Each station line carries `step`, the drill step's id; its text is in `instructions.json` (`stepInstructions`). The committed sample keeps the first 100 lines of one train episode per station, marked `truncated` in `index.json` (a whole station episode is about 120 KB and the folder is capped at 1.5 MB); every station episode, in every split, is in the full set.

## Collection process
Generated headlessly by `colSyntheticDemos` (shared/col-learn.js) through `dxMakeEpisode`, the same path a consented human episode takes, with fixed seeds per split: train seed 1 (episode seeds 100004+), validation seed 3 (300010+), test seed 5 (500016+).

## Consent
Synthetic episodes carry `consent: null`. A consented learner take can be added only from the learner's own device under DATAWORKS' rules (opt-in adults only; never K-12, the demo or a signed-out session; local; revoke deletes), and every one passes `dxValidateEpisode`: a human episode without an adult consent receipt is refused (0 refused in this build). Consent provenance is per sample: every line carries its own `source` and `consent`.

## De-identification
Nothing to de-identify in this version: no person is in it. A consented take carries only its consent receipt id, the adult attestation and its licence; no name, account, voice, video or location.

## Licence
Synthetic data: CC0-1.0. A consented take keeps the licence its learner chose (CC0-1.0 or CC-BY-4.0).

## Known gaps and biases
One scripted generator: the demonstrations share its habits and lapses. Six simple simulated tasks and three simulated station drills; no real robot, no sensor noise model.

## Intended uses
Training and comparing small robot policies in this simulator on fixed splits; teaching how a robotics dataset is built.

## Out-of-scope uses
Any claim about a real robot, a real workplace or a person; tuning on the test split; any use as evidence of hardware performance.

## Schema, units and frames
`schema.json` names every field and each scenario's feature names; `instructions.json` holds the task texts the `instruction` key points to. Units are the simulator's (metres, seconds, grid cells).

## Provenance
Generator `tools/ra_dataset.mjs` over `shared/col-learn.js` and `shared/rb-env.js`; instruction texts from `shared/rb-robotics-data.js` and the exported station files.

## Maintenance
Versioned: a change to the schema bumps `smartcitix.robotics.arena-episode@2`; a change to the content bumps `ra-ds/2` and the content hash. Regenerate with `node tools/ra_dataset.mjs`.

## Best practices this set follows
- **Fixed held-out splits:** splits are fixed by generator seed, and the arena's held-out seeds (7121–7180, and round 7's 7181–7240) are in no split.
- **No leakage between splits:** an episode is keyed by its content (scenario, every observation and action). Splits fill in the order train, validation, test, and a later split's copy of an earlier split's episode is removed from the later split: 6 removed in this build (the scripted generator sometimes repeats an episode exactly). Leakage left in the files: 0, re-measured from the written lines by the checker.
- **Dedup:** the same content twice inside a split is kept once (3 dropped).
- **Consent provenance per sample:** every line carries `source` and `consent`.
- **Class balance:** the same number of episodes generated per scenario in each split (40 / 10 / 10 for the gym and 20 / 5 / 5 for the stations, before dedup; the counts after dedup are in the table); action labels are not resampled, and their counts per scenario are in `index.json` (`actionLabels`) so a trainer can weight them.
- **Versioning:** a schema id, a dataset version and a content hash.
