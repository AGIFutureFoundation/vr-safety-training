# STRANDS-2 (loop 10, round 8)

Stations through the Python harness, the arena's published small-model build, an ra-lm-h adapter, and a LeRobot-style JSONL exporter. Simulated only. Prefix `st2`; no port. Base a10f1ff8 (fast-forwarded and confirmed). Full write-up: `docs/strands-robots.md`. The STRANDS note from round 7 is `docs/consoles/STRANDS.md`.

Honesty, unchanged: no `strands_harness` package exists (`create_harness` is this repository's own); simulated only; no hosted model and no key; strands-robots, torch and lerobot are not installed; every model is trained here on synthetic data.

## What was built

1. **Stations through the bridge** (`tools/ra_bridge.mjs`, now `st-bridge/2`). The first station reset loads the headless station suite with `tools/arena_eval.mjs` `raStations()`, which is imported, not copied. Requests are handled one at a time in order, because a station reset waits for that load. A station observation adds `text_keys` (drill step, pending interruption), and a reset adds `ids` (the station's hit targets, for the random floor). `js_run` takes `build: "gym" | "stations"`. `SimRobot` types: `cobot` → `rb-station-cobot`, `amr` → `rb-station-amr-fleet`, and a new `cell` → `rb-station-robot-cell`. The rule table has station rules (an instruction naming a station or a drill). Seed gate: stations run on dev seeds only, and the protocol-3 seeds 7241–7300 are refused.
2. **The arena's published ra-lm** (`tools/ra_export_weights.mjs`). `ra-lm@stations.json.gz` is the build `arena_eval` runs (texts with the stations, nine tasks trained). It sits beside the gym-only `ra-lm.json.gz`, which is unchanged, and each file's `build` field says which it is. Three station clones are added (`bc--rb-station-*.json.gz`), each hash-equal to `raBuild`'s. That makes 18 files, 383 KB, and the earlier 13 are byte-identical.
3. **ra-lm-h** (`ra-lm-h@stations.json.gz`, `SmallLmPolicy("ra-lm-h", "stations")`): h = tanh(V·[s,1]), then the same bilinear head, and on a station the pending interruption's text is added to the instruction. The parameter lookup uses the pre-hidden scene, as `raLmPolicy` does.
5. **LeRobot-style JSONL exporter** (`robotics/strands/lerobot_jsonl.py`, standard library only). It writes LeRobot's layout (`meta/info.json`, `tasks.jsonl`, `episodes.jsonl`, `actions.jsonl`, `data/chunk-000/episode_*.jsonl`) with JSONL in place of Parquet, and says it is not readable by LeRobot's loader as it is. Its `--check` reads the output back and compares it with `index.json`.

Item 4 (MockPolicy) and item 6 (CI timing) were not in this round's section.

## Cycles (reason → act → observe)

1. **Load the stations the arena's way, not a copy** → the bridge imports `raStations`/`raTexts` from `arena_eval.mjs` lazily, and the line handler became a promise chain → a station reset replies with features, `text_keys` and the 30 hit ids for the cobot station. The gym path is unchanged, and the round-7 parity was still 16 of 16.
2. **Python must not re-normalise the station instruction vector** (JS `Math.hypot` and Python's `math.hypot` can differ in the last bit) → the exporter computes every (step, interrupt) vector with `raLmT`'s own expression and writes `tCombos`, and Python looks them up → station parity 12 of 12.
3. **Exporter variable clash** (`texts` declared twice) → renamed the option `stTexts` → 18 files written, and `--check` "weights match a fresh build".
4. **Would Python's `math.tanh` flip an argmax against V8's?** → measured, not assumed: ra-lm-h against `js_run` on 3 stations and 6 gym scenarios (including the hard variants), seeds 1–3 → all the same. A risk remains on other seeds, and it is written down.
5. **Do the station policies apply as in the arena?** → the DAgger and step-reward clones are gym-only in `raModels`, so the station set is random, bc, ra-lm@stations, ra-lm-h and the expert → devStations: 45 episodes, physical 0, every step checked.
6. **The heartbeat said ROBOLEARN-9's protocol 3 lists STRANDS-2 as a consumer** → that permission depends on `claw3.json` and on ec8bf4c5 being on this branch. Neither is true yet, so I ran nothing on 7241–7300 and the gate refuses them. I corrected my earlier heartbeat line.
7. **"No new dependency" has to be checked, not asserted** → `check_strands` parses the exporter's imports against a standard-library allowlist and runs it on the sample and on a fresh full set in a temp dir → the full set gives 441 of 441 episodes and 35,102 of 35,102 frames, with leakage 0.

## Evals

| Eval | Before → after | Source |
|---|---|---|
| Station scenarios through the bridge | 0 → 3 (cobot, AMR, robot cell; expert 3 of 3, every step governor-checked) | selftest "station scenarios through the bridge" |
| Parity with the arena per seed, stations | 0 → 12 of 12 (bc, ra-lm@stations, ra-lm-h, expert × 3 stations, dev 1–3) | selftest; `$SP/loop10/st/parity_st2.py` |
| Parity, published ra-lm build and ra-lm-h on gym | 0 → 8 of 8 in the selftest (4 robot types × 2); 12 of 12 with the hard variants in scratch | selftest; `$SP/loop10/st/parity_gym.txt` |
| Policies through the interface | 6 → 8 (adds ra-lm@stations, ra-lm-h) | selftest "8 of 8" |
| Station compare rows | 0 → 5 rows (45 episodes): bc, expert, ra-lm-h 1.000 [0.701, 1]; ra-lm@stations 0.667 [0.354, 0.879]; random 0.000 [0, 0.299] | `docs/evals/strands.json` devStations |
| Exporter rows valid | 0 → 35,102 of 35,102 (full set); 761 of 761 (sample) | `lerobot_jsonl.py --check`; `check_strands` |
| Exporter round-trip vs index.json | 441 of 441 episodes, 35,102 of 35,102 frames, per split and scenario; leakage 0 | same |
| Physical dispatches | 0 → 0 | bridge replies; strands.json totals |
| Network calls | 0 → 0 (Python sockets 0, bridge 0) | selftest |
| Selftest | 27 → 33 pass | `python3 robotics/strands/selftest.py` |
| `check_strands` | 22 → 29 checks | `node tools/check_strands.mjs` |

No ranking claim is made: the station intervals on 9 episodes are wide and overlap. On these seeds the station episodes have the same length for every seed, so the stations vary little with the seed.

## What is left

See `tools/briefs/next/st2-next.md`.
