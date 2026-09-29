# Robot and model training datasets

[docs/robot-training.md](robot-training.md) covers the policy and the body — a
skill-parameterised agent, the procedure engine, and the embodiment layer that
turns a station's own scene into poses, grasps, force ceilings and keep-out
volumes. This page covers the layer above that: turning a run of the engine —
synthetic or a person actually playing — into a dataset a training pipeline
can consume directly, and what it does and does not claim.

Two files carry it:

| file | what it owns |
| --- | --- |
| `WebXR/shared/episodes.js` | the **recorder**: attaches to a live session, captures each decision and a low-rate pose track, stores locally, hashes anything that could identify a person |
| `tools/export_dataset.mjs` | the **exporter**: headless rollouts + any exported human episodes → JSON Lines shards, a manifest, a dataset card |

---

## The episode recorder (`WebXR/shared/episodes.js`)

`attachEpisodeRecorder(session, opts)` wraps the handful of methods
`WebXR/smartcity/js/app.js` already calls to apply an action — `select`,
`rotate`, `dropAt`, `setHolding`, `driveCheck` — the same surface
`shared/robot.js`'s `applyAction()` drives. No call site changes: the wrapper
captures the observation before the call, calls through unchanged, and logs
the action in the same shape a synthetic rollout already uses (`select`,
`commit`, `press`, `release`, `rotate`, `drop`, `check`). It merges into the
session's own `onFinish` hook to persist the finished episode, so attaching it
is one call, right after `new Session(...)` and before `.start()`.

### What one decision carries

```json
{
  "t": 12.4, "wall": 1758901234567,
  "obs": { "stepIndex": 1, "kind": "select", "targets": ["a"], "hazardHits": 0,
           "interrupt": null, "interactables": ["a", "g", "haz1"],
           "weather": "clear", "timeOfDay": "day", "eventSeed": "charge-point",
           "viewMode": "vr" },
  "action": { "type": "select", "id": "a" },
  "reward": 100,
  "outcome": { "kind": "ok", "hazard": false, "clean": true }
}
```

`obs` is exactly `shared/robot.js`'s `observe()` — or, when the recorder was
given the built station (`room`/`api`), `shared/robot-embodiment.js`'s
`observeEmbodied()`, which adds the step's grasp, force ceiling, pose and
keep-out account — plus four fields `observe()` doesn't carry: the full
**interactable set** the room built, and the **weather**, **time of day**,
**event seed** and **view mode** (`"vr" | "ar" | "desktop"`) the app already
knows. A gauge step's commit is told apart from a plain select — the same
`commit`/`select` split `shared/robot.js`'s `applyAction()` makes — with `at`
read from the gauge the instant before it commits.

### The pose track

Sampled at `POSE_HZ` (~4 Hz), independent of the decision log, so the track
shows the approach and the retreat between decisions and not just the touch:

```json
{ "t": 12.25, "wall": 1758901234400,
  "camera": { "p": [0.1, 1.62, -0.4], "q": [0, 0.02, 0, 1] },
  "controllers": [{ "p": [0.2, 1.1, -0.3], "q": [0, 0, 0, 1] }],
  "endEffector": { "position": [0.18, 1.05, -0.28], "normal": [0, 0, 1], "approach": [0.18, 1.05, -0.16], "standoff": 0.12, "euler": [0, 0, 0] } }
```

Camera pose always; controller and hand poses only while actually present
(VR); the end-effector target only when the station is built and the current
step's target has one (see `robot-embodiment.js`'s `poseFor()`).

### Storage, size and data minimisation

* **Schema-versioned** — `EPISODE_SCHEMA_VERSION`, bumped whenever the shape
  of a decision or the digest changes.
* **Capped, oldest-first eviction** — `EpisodeStore` keeps the episode list
  under `MAX_STORE_BYTES` (1.5 MB of JSON) and `MAX_EPISODES` (400), dropping
  the oldest episode first; a single episode still over budget on its own
  keeps its summary and drops its pose track (the heaviest field) rather than
  being dropped whole.
* **Never blocks the render loop.** Every wrapped action method only pushes
  to an in-memory array; `localStorage` is touched only from a deferred timer
  (`requestIdleCallback` where available, a short `setTimeout` otherwise), on
  a periodic scratch flush during the run and once, off the hook, when the
  run finishes.
* **No names, no free text.** A crew tag never reaches storage — only
  `hashCrewTag(tag)`'s salted, non-reversible-looking digest does. The salt is
  a random value generated once per browser and held in its own
  `localStorage` key; this is data minimisation, not cryptography, and the
  module's own comment says so.

### `sessionDigest()` and the dedupe key

`sessionDigest(episode)` compresses an episode into a fixed-length feature
vector (`DIGEST_FEATURES` names each position: duration, step and decision
counts, score, stars, errors, unsafe actions, interruption tally, mean reward
per decision, the clean-step fraction, keep-out violations, handoffs) plus a
short, time-ordered list of the episode's salient events (every hazard, every
interruption outcome), capped at `MAX_DIGEST_EVENTS` — small enough to upload
from a slow connection where the full episode, pose track included, is not.

`dedupeKeyFor(episode)` (also `digest.dedupeKey`) derives a key from fields
that are each stable once an episode has finished: the station, when it
started, the hashed crew tag, the decision count and the final score. **Two
episodes with the same dedupe key are the same episode** — a consumer merging
shards (a local export re-uploaded, a digest sent twice off a flaky
connection) keeps only one, keyed on this rather than on any single field
that two different short runs could share.

### The export button and the off switch

The records overlay's **Export episodes** button downloads every stored
episode as one JSON file (`smartcitix-episodes-<date>.json`) — a local
download, no network call, exactly like the existing CSV/xAPI/badge exports
beside it. `?episodes=off` on the launch URL turns the recorder off entirely
for that session (a kiosk that wants nothing beyond the training record
itself, or a developer isolating an unrelated repro).

---

## The dataset exporter (`tools/export_dataset.mjs`)

```bash
node tools/export_dataset.mjs                                   # default sample, both apps, a few seconds
node tools/export_dataset.mjs --stations 100 --seeds 3 --out /tmp/ds
node tools/export_dataset.mjs --human episodes-a.json,episodes-b.json
node tools/export_dataset.mjs --embodied=false --skills 0.5,1
```

| flag | default | what it does |
| --- | --- | --- |
| `--stations` | 40 | stations sampled **per app**, evenly spaced across that app's own catalog by list index (deterministic — the same count always names the same stations); a value at or above the catalog size runs all of it |
| `--seeds` | 2 | episodes recorded per (station, skill) |
| `--skills` | `0.3,0.65,1` | the skill ladder rolled out — `shared/robot.js`'s policy is a single number in [0, 1] |
| `--apps` | `smartcity,trades` | which suites to sample |
| `--embodied` | on | run through `shared/robot-embodiment.js`'s `runEmbodiedEpisode()` rather than `shared/robot.js`'s plain `runEpisode()` |
| `--seed` | 1 | the base seed every per-episode seed is derived from |
| `--human` | — | comma-separated paths to JSON files exported by the app's "Export episodes" button |
| `--out` | `tools/out/dataset` | output folder — refused if it resolves under `WebXR/dist` |

The default sample (40 stations per app, 3 skills, 2 seeds) finishes in a few
seconds on this project's own dev box and comfortably under three minutes on
a loaded shared four-core one; the full catalog (`--stations` at or above the
list size) still finishes in under a minute. Every synthetic episode's seed is
derived from `--seed`, the station and the skill, so the same arguments always
reproduce the same shards.

### Output

```
<out>/episodes-smartcity.jsonl   one JSON object per line, one per episode
<out>/episodes-trades.jsonl      (only written if that app was sampled)
<out>/episodes-human.jsonl       (only written if --human was given)
<out>/manifest.json              arguments, per-station counts, the field map, the shard list
<out>/DATASET_CARD.md            contents, fields, licence, provenance, limitations, "not a certification"
```

### Fields

Every line in a shard is one episode, with a fixed set of top-level fields
regardless of source (`"synthetic"` or `"human"`):

```json
{
  "schemaVersion": 1, "source": "synthetic",
  "app": "smartcity", "station": "charge-point", "name": "Charge Point", "category": "Energy & Power",
  "embodied": true, "skill": 0.65, "seed": 100065, "crewTagHash": null,
  "steps": [ { "observation": { "...": "..." }, "action": { "type": "select", "id": "a" }, "reward": 100, "done": false, "info": { "...": "..." } } ],
  "summary": { "score": 2300, "stars": 3, "errors": 0, "hazardHits": 0, "seconds": 90, "passed": true }
}
```

Each step in `steps` is deliberately named plainly rather than after any one
framework's convention:

| field | what it is |
| --- | --- |
| `observation` | `shared/robot.js`'s `observe()`, or (when `embodied`) `shared/robot-embodiment.js`'s `observeEmbodied()` — the same shape a live episode's recorder logs |
| `action` | one of `shared/robot.js`'s `applyAction()` shapes: `select`, `commit`, `press`, `release`, `rotate`, `drop`, `drive`, `check`, `wait` |
| `reward` | the engine's own score delta for that decision |
| `done` | `true` on an episode's last step only |
| `info` | everything else: sim/wall timestamps, the feedback kind, whether it was a hazard, and — when `embodied` — who performed it (`"robot"` or `"human"`, for a `noRobot` step handed to the clinician), the pose worked, the grasp, the force ceiling and the keep-out account |

`skill` and `seed` are set only for a synthetic rollout, letting the exact
episode be regenerated with `tools/robot_train.mjs`. `crewTagHash` is only
ever the salted hash `shared/episodes.js`'s `hashCrewTag()` produces — never a
name, and never present on a synthetic rollout.

### Mapping to common dataset conventions

The table below is a bridge for a reader who already has tooling for one of
two common *kinds* of dataset, described generically. **This is not a claim of
byte compatibility with any specific named framework's on-disk format** — a
consumer needing that writes its own converter from these fields; the
exporter itself and its manifest carry the same table (`FIELD_MAP`) as data.

| this dataset | episodic reinforcement-learning datasets (generic) | imitation-learning datasets (generic) |
| --- | --- | --- |
| `observation` | observation / state | observation |
| `action` | action | expert action (the demonstration) |
| `reward` | reward | usually unused; here it also flags a clean vs. corrected step |
| `done` | terminal / done flag | episode boundary |
| `info` | infos / auxiliary diagnostics | per-step metadata |
| episode (the `steps` array) | trajectory / rollout | demonstration |

### Provenance and licence

* **Synthetic rollouts** (`source: "synthetic"`) are `shared/robot.js`'s
  skill-parameterised policy played against the real procedure engine
  (`shared/game.js`), headlessly, through `tools/lib/headless.mjs`'s stub
  renderer — the same machinery `tools/robot_train.mjs` uses. **Licence:
  CC0-1.0** — generated data with no creative authorship behind it.
* **Human episodes** (`source: "human"`) are whatever was handed to
  `--human`: a JSON file downloaded from the app's "Export episodes" button,
  carrying no name and no free text, only a salted crew-tag hash if the run
  carried one at all. **No licence is asserted here** for these — whoever
  distributes a dataset that includes them is responsible for having the
  exporting learner's or hall's permission to do so.

### Known limitations

* A synthetic rollout's policy models a learner (`RobotAgent`, a single skill
  parameter in [0, 1]); it is not a recording of a real one.
* A `track` step's wobble is seeded from `Math.random()` inside the engine
  (see [docs/robot-training.md](robot-training.md)), so an episode containing
  one is reproducible in its decisions but not its exact tick timing.
* `--stations` samples a deterministic, evenly-spaced subset for a fast
  default run, not the full catalog — pass a station count at or above the
  catalog size (or use `tools/robot_train.mjs` directly) for a complete one.
* An embodied observation's poses and keep-out accounts are only as good as a
  station's own `forceClass`/`noRobot` declarations — see
  [docs/robot-training.md](robot-training.md#the-dental-rule-set).

### What this is not

Every dataset card this tool writes says so directly: this dataset evidences
how a station's procedure plays out under this engine's scoring. **It is not
a certification**, and passing or failing here is not a credential issued by
any standards body a station's own `certification` field names — see
[docs/proof-of-training.md](proof-of-training.md).

---

## Quality report (`tools/eval_dataset.mjs`)

```bash
node tools/eval_dataset.mjs tools/out/dataset          # writes into the dataset folder itself
node tools/eval_dataset.mjs tools/out/dataset --out /tmp/report
```

Reads every `episodes-*.jsonl` shard back (not the manifest's own counts —
independently, from the shards themselves) and writes `quality-report.json`
and `QUALITY_REPORT.md`: coverage per station / step kind / skill / seed,
action-class balance, hazard and interruption coverage, the duplicate-episode
rate (by a dedupe key documented at the top of the script, adapted from
`shared/episodes.js`'s `dedupeKeyFor()` to this exported schema), pose-track
presence, schema validity against the fields this page documents, and a
single 0–100 **quality score** — the weighted sum of seven sub-scores (each
already in [0, 1]); the exact weights and every sub-score's raw value are in
the tool's own header comment and in the report itself, never a black box.
Deterministic: the same dataset folder always produces the same numbers
(`generatedAt` aside).

A real run, the default two-app sample (`node tools/export_dataset.mjs`, 40
smartcity stations + all 9 trades rooms, 3 skills, 2 seeds — 294 episodes,
32,895 steps, 49 stations):

| sub-score | value | weight | contribution |
| --- | --- | --- | --- |
| schemaValidity | 100% | 30 | 30.0 |
| actionBalance | 70% | 15 | 10.5 |
| hazardCoverage | 100% | 10 | 10.0 |
| interruptionCoverage | 100% | 10 | 10.0 |
| duplicateRate | 100% | 15 | 15.0 |
| stationDiversity | 100% | 10 | 10.0 |
| poseTrackPresence | 52% | 10 | 5.2 |

**Score: 91/100.** The one sub-score not near-perfect on this sample is
`poseTrackPresence`, and that is expected rather than a defect: a `release`
action always carries `info.pose: null` (letting go has no target id to
pose — see `robot-embodiment.js`'s `actedId()`), and a `drive` step's
observation has no per-target pose to report either. Both action classes are
common in this sample (10,378 `release` and 4,909 `drive` decisions out of
32,895), so the presence rate over *all* embodied steps naturally lands well
under 100% even on a clean export — a station whose steps are mostly
`select`/`sequence`/`gauge` would read much higher on this sub-score. Read
`poseTrackPresence` as "does pose data show up on the steps that can carry
it," not as a defect count.

## Baseline trainer (`tools/train_baseline.mjs`)

```bash
node tools/train_baseline.mjs tools/out/dataset --out tools/out/baseline
node tools/train_baseline.mjs tools/out/dataset --out /tmp/b --epochs 10 --limit 2000
```

A small behaviour-cloning baseline, plain JS, no external dependencies:
featurises every step's `observation` (a fixed numeric digest, a one-hot step
kind, a hashed bag of interactable ids — see the tool's own header comment),
fits a multinomial logistic-regression policy over the nine action classes
with mini-batch gradient descent, holds out 20% of episodes **by station**
(every distinct station either trains or evaluates, never both), reports
top-1/top-3 action accuracy per step kind and per station on the held-out
set, then **replays the learned policy through the real procedure engine**
headlessly — the same suite loader `tools/robot_train.mjs` uses — on the
held-out stations, and reports its pass rate and mean score against the
scripted expert (skill 1) and novice (skill 0) policies from
`WebXR/shared/robot.js`. Saves `weights.json` (a documented layout — see the
file's own `layout` field), a `training-report.json`/`.md`, and a
`MODEL_CARD.md` (intended use, architecture, data, limitations — **a
research baseline, not a certification of anything**). `--epochs` and
`--limit` control training length and data volume; the default run finishes
in well under a minute on this project's own dev box, comfortably inside the
four-minute budget on a loaded shared four-core one.

A real run, on the dataset above (25 epochs, the defaults): 39 training
stations, 10 held out.

| held-out accuracy | value |
| --- | --- |
| top-1 | 98.9% |
| top-3 | 100% |

Replayed on the 10 held-out stations, 5 episodes per policy per station:

| policy | pass rate | mean score |
| --- | --- | --- |
| learned | 10% | 1170 |
| expert (skill 1) | 80% | 3182 |
| novice (skill 0) | 0% | 1704 |

Read together, these two tables are the point of shipping both a
classification metric and a replay: 98.9% top-1 accuracy on individual
held-out decisions did **not** carry over to a comparable pass rate once the
policy actually ran a full station — a textbook behaviour-cloning
compounding-error effect (a continuous-adjustment step like `hold`/`track` is
ticked far more often than it is logged as a decision, so one tick where the
classifier disagrees with the expert can carry the rest of that step into
states the classifier never trained on). `MODEL_CARD.md` writes this up from
each run's own numbers, not as a fixed claim — see its own "Limitations"
section. The lesson for a reader is the standard one for this whole layer:
**a metric on isolated decisions is not a substitute for replaying a policy
through the real engine**, which is exactly why this tool does both.

## The gate

```bash
node tools/check_episodes.mjs       # or node tools/check_all.mjs
```

Checks: a recorder attached to a real `shared/game.js` `Session` round-trips a
decision (observation/action/reward, a gauge commit logged as `commit` with
`at`, a hazard flagged); `EpisodeStore` evicts oldest-first once over its byte
budget and trims a single over-budget episode's pose track rather than
dropping it; a crew tag never appears in plain text anywhere in storage;
`sessionDigest()`'s vector matches its own field list and its dedupe key is
stable and content-sensitive; and a tiny `tools/export_dataset.mjs` run
(one app, two stations, one seed, plus a human-episode fixture) produces a
valid manifest, dataset card and JSON-Lines shards whose every step carries
`observation`/`action`/`reward`/`done`/`info`, and refuses to write under
`WebXR/dist`.

```bash
node tools/check_dataset_tools.mjs   # or node tools/check_all.mjs
```

Checks the quality reporter and the baseline trainer against a tiny dataset
generated for the run (five trades stations, two skills, two seeds — deleted
on exit): the exporter → `eval_dataset.mjs` → `train_baseline.mjs` round
trip; the quality score stays in [0, 100] with weights summing to 100; a
fresh export reads back with zero schema issues and zero duplicates; an
injected duplicate episode is caught; `eval_dataset.mjs` is deterministic
rerun to rerun; the station-level train/test split is disjoint and
non-empty; held-out top-1 accuracy clears chance across the nine action
classes; `weights.json` round-trips (two independent deserialisations of the
same file predict identically, and its declared shapes match this build's
feature spec); and the replay smoke test produces well-formed pass-rate/
score summaries for the learned, expert and novice policies alike.

## LeRobot-style and RLDS-style layouts, and the skill registry

`tools/export_dataset.mjs` also writes, beside the native shards (`--formats native,lerobot,rlds`, all by default):

- `lerobot/`: `meta/info.json`, `meta/episodes.jsonl`, `meta/tasks.jsonl` and `data/chunk-NNN/episode_NNNNNN.jsonl`, one frame per line with `observation`, `action`, `reward`, `done`, `primitive` and `language_instruction`. JSON Lines values; no parquet dependency.
- `rlds/`: `episodes.jsonl` (`episode_metadata` plus `steps`, each with `observation`, `action`, `reward`, `discount`, `is_first`, `is_last`, `is_terminal`, `language_instruction` from the step prompt) and `features.json`.

Every episode in both carries the station, its programmes and union, its hazard and interruption labels, the passport's source app, a licence and a consent field, and only the anonymised crew-tag hash. Neither layout claims byte compatibility with any framework's own loader. `tools/eval_dataset.mjs` validates both; `node tools/robot_train.mjs --from-lerobot <dir>/lerobot` trains a per-primitive baseline and reports success per primitive. The primitive vocabulary and every station's task graph live in `WebXR/shared/skill-registry.js`, generated by `tools/gen_skill_registry.mjs`. Consent is unchanged: exports are local files, and a human episode only exists here because the learner exported it from their own device. See `docs/agent-roadmap.md`.

---

## The consented data system (DATAWORKS, `WebXR/shared/dx-data.js`)

One consented data system across every world: consent, capture, local storage,
export and analysis. **Privacy is the first requirement.** Nothing is recorded
before an explicit opt-in; K-12, classroom, signed-out and demo sessions are
never collected, and an unreadable signal counts as *do not collect*; no name,
free text, voice or real-world location is ever captured; every human episode
carries its consent receipt; one tap revokes and deletes everything local.
The module contains **no network code** — see *The upload hook* below.

### The published schema — `smartcitix.holodeck.episode` v2.0.0

`DX_SCHEMA` (exported plain data: `id`, `version`, `units`, `frames`,
`episodeFields`, `stepFields`, `neverCollected`) is the contract ROBOTICS'
gym and `tools/rb_rollout.mjs` write to and TQ-BRIDGE exports. Build an
episode with `dxMakeEpisode(meta, steps)` and check it with
`dxValidateEpisode(ep)` → `{ ok, errors }`.

| episode field | type | meaning |
| --- | --- | --- |
| `schema` | string | always `"smartcitix.holodeck.episode"` |
| `schemaVersion` | string | semver, `"2.0.0"`; a major bump needs a converter |
| `episodeId` | string | random per episode, never derived from a person |
| `sessionHash` | string \| null | salted per-profile session hash (rotates daily and on revoke) — the train/validation split key; `null` for synthetic |
| `source` | string | `human` \| `synthetic` |
| `world`, `map` | string, string \| null | which world (`parishes`, `smartcity`, `robotics`, …) and map |
| `kind` | string | `station` \| `lesson` \| `drill` \| `robot-game` \| `gym` \| `field` |
| `scenario` | string | station, lesson, drill or robot scenario id |
| `startedAt`, `endedAt` | ISO-8601 UTC | `endedAt` is `null` when cut off |
| `durationS` | number | seconds |
| `steps` | array | RLDS-style step list (below) |
| `summary` | object | `{ success, safePractice, score, errors, hazardHits, interrupts: { answered, missed, wrong }, truncated }` |
| `consent` | object \| null | the consent receipt (human episodes); `null` only for synthetic |
| `provenance` | object | `{ generator, generatorVersion, recordedWith, seed?, policy?, createdAt, notes? }` |

| step field | type | meaning |
| --- | --- | --- |
| `t` | number (s) | seconds since the episode started |
| `observation` | object | `observe()` / `observeEmbodied()` or a robot game's observation; in-world values only |
| `action` | object | `{ type, ... }` — `applyAction()` shapes or a robot-game action |
| `reward` | number (points) | the engine's score delta |
| `done` | boolean | `true` on the last step only |
| `info` | object | `{ outcome?, hazard?, clean?, unsafe?, interrupt?: { id, outcome, responseS } }` |

**Units:** time s, distance m, angle rad (quaternions `[x, y, z, w]`),
speed m/s, force N, reward points, wall clock ISO-8601 UTC. **Frames:** world
is right-handed, +Y up, metres, origin at the world/map origin (three.js) —
in-world only, never a real-world coordinate; station values are in the room
frame; robot values in the robot base frame (`robot-embodiment.js`).

Legacy `shared/episodes.js` episodes (schema 1) convert with
`dxFromLegacy()` in `shared/dx-capture.js`.
