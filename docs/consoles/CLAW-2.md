# CLAW-2 (`oc2`, keeps the `oc-*` files; port 9152): the claw runs the next comparison, and people and robots side by side

Loop 10, round 7. Base 40d97421 (fast-forward, confirmed). One other console's commit is merged here: ARENA-2's declaration 8ea01d3c (`docs/evals/arena-declared-r7.json`, merged with `git merge 8ea01d3c`, a fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. Read `docs/consoles/OMEGA-CLAW.md` first: this note covers only what round 7 added.

The agents are software and say so. There is no language model, no network call and no key. The "small language-conditioned model" (`ra-lm`) is a small model trained in this repository, not a large language model. Robots are simulated, and the governor's rules stand. Learner data stays on the device, under DATAWORKS' gate.

## What is here

| File | What changed |
|---|---|
| `WebXR/shared/oc-claw.js` | `OC_PROTOCOL_2` and `OC_HELD_OUT_2` (7181–7240, taken from ARENA-2's committed declaration and checked against it at run time). `ocProtocolDeclarations` takes an id prefix (`oc2-`). `ocRaAdapter(ra, { lmOptions })` passes the small model's declared texts and station tasks to `raRun`. `ocScenarioDrills` / `OC_SCENARIO_DRILLS` (each robot scenario's learner stations, from the programme's tracks), `ocSideBySide` (people and robots per scenario), and `ocVerifyHead` (the page's check of a trimmed chain). Protocol 1 is unchanged: its hash is still 0f1f0548ef7b5658. |
| `WebXR/shared/oc-world.js` | `ocMountSiteLamps` and `OC_LAMP_BUDGET`: one status lamp per robot site on the desktop high tier only, amber while a job is at work there and green when idle. |
| `WebXR/shared/oc-panel.js` | A protocol select (44 px) when there are several records. The chain line shows the head hash, checked against its last line re-hashed in the page. A new side-by-side table. |
| `WebXR/shared/oc-claw-record.js` | Generated. It holds both records, `OC_RECORD_1` and `OC_RECORD_2` (`OC_RECORDS`; `OC_RECORD` is the latest). Each chain is trimmed to its head hash, its line count and its last line. |
| `docs/evals/claw2.json` | Protocol 2's record, measured once. It includes the full chain. |
| `tools/claw_eval.mjs` | `--protocol 2` runs protocol 2 once and writes `claw2.json`. It refuses `--dry`, and it refuses if the seeds differ from ARENA-2's file. `--dev` is the stub: the same flow on development seeds 1–20, and it writes nothing. `--module-only` writes both records into the page module. |
| `tools/check_claw.mjs` | Three new checks: 9 (protocol 2), 10 (side by side and the trimmed module) and 11 (the lamps). Check 1's key-prefix pattern now starts at a word boundary, because unanchored it matched inside the station id "ri·sk-assessment". Check 7 now expects `records: OC_RECORDS` on the instructor tab. |
| `WebXR/parishes/js/app.js` | The claw panel gets `records: OC_RECORDS`. Inside the same DATAWORKS gate as before, the learner object also gets `stations`, taken from `ppRecords()` (passed and best score per station). `ocWorldStart` mounts the lamps with the tier in force and updates them on every tick. |
| `WebXR/instructor/js/app.js` | The claw tab gets `records: OC_RECORDS`. It still passes `human: null`. |

## Evals (before → after)

| Measure | Before (40d97421) | After | Source |
|---|---|---|---|
| Declared comparisons, each run once | 45 (protocol 1, 7121–7180) | **90**: protocol 2 adds 45 on 7181–7240. All 45 ran once: 4,140 episodes, 9 gym scenarios × 5 challengers. | `node tools/claw_eval.mjs --protocol 2` → `$SP/loop10/oc2/protocol2-out.txt`; `check_claw` 9 |
| Declared before the run | protocol 1 only | ARENA-2's declaration 8ea01d3c → protocol 2 f36a0af6 → record 0c2a7d80, each an ancestor of the next. The protocol-2 hash is unchanged since. | `check_claw` 9 |
| Refusals exercised | 3 of 3 (protocol 1) | **3 of 3 again in protocol 2**: undeclared 1, seed-reused 1, rule-broken 22. A fourth: not-held-out 1, a declaration on protocol 1's spent seeds 7121–7130, refused at declaration. Also not-better 23. The probes ran nothing. | `docs/evals/claw2.json` `counts`; `check_claw` 9 |
| Promotions only with a clear interval | 0 of 0 | **0 of 0**. No challenger cleared the gate. 45 of 45 verdicts re-derive from the record's numbers through `claw.judge`. | `check_claw` 9 |
| Small model (ra-lm) against the clone (bc), measured once on 7181–7240 | not compared (stub) | See the table below. ra-lm is never better than bc. It ties on 4 scenarios, falls short on 2 and breaks rules on 4. | `claw2.json` `smallModel` |
| Governor on the arena runs | 133,061/133,061 | Protocol 2: **155,744/155,744 steps, physical 0** | `check_claw` 9 |
| Persistent loop | 960 min (record 1) | Protocol 2's record: **960 simulated minutes** (seed 2), 141 jobs, governor 3,024/3,024 steps, **0 physical dispatches**. Checker: 700 minutes, 0 steps while hidden. | `claw2.json` `world`; `check_claw` 5, 9 |
| Audit chain | intact, 229 lines | Protocol 2: **intact, 230 lines**, re-walked in full by the checker. The page re-hashes each record's last line and matches it to the head: a9480870 (230 lines) and 3ef72653 (229 lines). A tampered last line is caught. | `check_claw` 9, 10; drive A |
| People and robots side by side | none | **9 rows**, one per scenario. Robot gaps on 4 scenarios: teleop (3 rule breaks), AMR (11), AMR hard (9), port hard (0.733 < 0.9). The programme has no learner station for port gantry (base or hard), so that shows as a gap too. Learner values appear only when eligible. | `check_claw` 10; drive F |
| People, through real play (oc-next 2) | fixture drill key | The traffic drill was **played through its own buttons** (two unsafe answers), so `drRecord` stored best 60. Tutor attempts went through `colTutor().record` + `save()`. After a reload, the practice block shows "drill dr-traffic — best 60 under the pass mark 80; cell-entry step approach — 2 of 3 tries wrong; test-estop — 1 of 2". Both blocks have `data-learner="local"`. The same profile under `?demo` or `?k12` shows `none`. 0 page errors, 0 off-host requests. The one station pass (robot-cell) is a training-record fixture: no station was played. | `$SP/loop10/oc2/drive_oc2.mjs` → `drive-out.txt`; still `oc2-side-by-side.png` |
| Page module | 101,484 B (1 record, full chain) | **101,403 B with 2 records** (chains trimmed to their heads; the full chains, 52,277 B and 53,306 B, stay in the JSON) | `stat`; `check_claw` 10 |
| Bundles | parishes 8,591,407 B; instructor 4,492,812 B | parishes 8,603,665 B (+12,258); instructor 4,502,862 B (+10,050) | `stat` vs `git cat-file -s`; dist restored after |
| World in the scene (oc-next 3) | none | See Budgets below. | `drive_lamps.mjs` → `lamps-out.txt`; `check_claw` 11 |
| `check_claw` | 8 passed, 0 failed | **11 passed, 0 failed** | `node tools/check_claw.mjs` |

**ra-lm against bc on 7181–7240** (60 seeds each; Wilson 95%; rule breaks in brackets):

| Scenario | ra-lm | bc | Verdict |
|---|---|---|---|
| cell entry | 60/60 [0.94–1] (0) | 60/60 [0.94–1] (0) | not better |
| cobot zone setup | 57/60 [0.863–0.983] (3) | 60/60 [0.94–1] (0) | rule broken |
| teleop pick-place | 57/60 [0.863–0.983] (3) | 57/60 [0.863–0.983] (3) | rule broken |
| AMR fleet routing | 40/60 [0.541–0.773] (20) | 49/60 [0.701–0.894] (11) | rule broken |
| construction drilling | 60/60 (0) | 60/60 (0) | not better |
| port gantry | 45/60 [0.628–0.842] (0) | 60/60 [0.94–1] (0) | not better |
| drilling, hard | 60/60 (0) | 60/60 (0) | not better |
| port gantry, hard | 40/60 [0.541–0.773] (0) | 44/60 [0.61–0.829] (0) | not better |
| AMR, hard | 7/60 [0.058–0.222] (12) | 4/60 [0.026–0.159] (9) | rule broken |

**Read honestly.**
- The claw measured ARENA-2's ra/1 small model on 7181–7240 once, through its own declared protocol. ARENA-2 measures its own comparisons, with ra-lm-h, on the same seeds. The declaration's consumers section allows this and asks for disclosure. This is that disclosure: the same seeds, measured once by each consumer with different models.
- ra-lm-h, ARENA-2's declared change, is not in this branch. Only its declaration is, and the brief said to merge just that commit. So it is not compared here. On the same seeds the claw would treat ra-lm-h as a new model and scenario pair, but its comparison should be declared first, after integration.
- No promotion again. DAgger-3 on AMR, round 6's clear-but-rule-broken case, is 57/60 here against bc's 49/60. Its interval overlaps bc's (0.863 is below 0.894), and it broke 2 rules.
- The reactive agent is a hand-written rule policy and is declared as a model, not a challenger. It is the strongest non-expert on the hard variants: AMR hard 55/60 and port gantry hard 60/60, with 0 rule breaks. No protocol has declared it as a challenger, so nothing here claims it.
- The learner-station map comes from the programme's tracks only. A station that teaches a scenario's skill but sits in no track for it is not counted. Port gantry has no track.
- The station pass in the drive is a fixture record. The drill and the tutor attempts were real calls through the page's own code.

## Budgets

The lamps run on the desktop high tier only, which is the desktop default. The stated budget is 1 mesh and 48 triangles per site (one 8 × 4 sphere geometry, shared), 2 shared untextured basic materials, 0 lights and 0 textures. Measured in the built page at `?parish=sf-downtown` (1 robot site there) on port 9152, at load average about 28. Same frame, lamps shown and then hidden:

| Tier | World absent, settled | Lamps' cost, same frame shown vs hidden | Lamp in view (camera aimed at it) |
|---|---|---|---|
| Desktop (high, the default) | 287 meshes (89 instanced), 2 lights, 107,270 triangles, 187 draw calls, 6 textures | **+1 mesh**, +0 lights, +0 textures. +0 triangles and +0 draw calls in that view, because the lamp is outside the frustum. | **+48 triangles, +1 draw call, +0 textures** (69,093 → 69,141; 106 → 107) |
| Phone (390 × 844, auto tier low) | 197 meshes (64 instanced), 2 lights, 48,424 triangles, 102 draw calls, 0 textures | **0**: no lamp is mounted (`lamps: null`) | n/a |

- Over 600 simulated minutes the desktop lamp was seen both idle and busy. The headset tiers mount nothing either: the lamp is gated on `tier === "high"`.
- Sources: `$SP/loop10/oc2/drive_lamps.mjs` → `lamps-out.txt`, and `drive_lamp_view.mjs` → `lamp-view-out.txt`.
- There is no usable still: in the headless page the menu covers the view of the site.
- Bundle bytes: `WebXR/parishes/dist/parishes.html` 8,591,407 → 8,603,665 B (+12,258 with both records and the lamps). `WebXR/instructor/dist/instructor-console.html` 4,492,812 → 4,502,862 B (+10,050). Measured with `stat` against `git cat-file -s HEAD:…`; the committed dist was restored afterwards.

## Checkers run (single checkers, never check_all)

| Checker | Result |
|---|---|
| `check_claw` | 11 passed, 0 failed (base 40d97421: 8 passed) |
| `check_newton` | 60 checks, 0 failed |
| `check_imports` | 1,137 modules pass |
| `check_interface` | 21 passed, 0 failed (a control was added: the protocol select) |
| `check_dataworks` | 59 passed, 0 failed (the learner gate) |
| `check_omega_hive` | 15 passed, 0 failed (the world runs the hive) |
| `check_parse` | 2,716 shipped modules parse |

## Cycles

1. **Run the small model through the claw.** Reason: round 6 could not compare it (stub). Check: time every family on development seeds 1–20 (scratch `t1.mjs`). Observe: ra-lm reported not applicable even in the integrated tree. `raBuild` needs `lmOptions.texts` and, to be the model ROBO-ARENA declared, the station tasks too. Act: `ocRaAdapter(ra, { lmOptions })`, which builds the same model as `arena_eval`. Observe: all 9 scenarios are applicable, in about 9 s for the first build.
2. **Declare before running, on ARENA-2's seeds only.** Reason: the brief allows 7181–7240 only through ARENA-2's committed file. Check: the heartbeat named 8ea01d3c. I merged that commit alone and read its consumers section. Act: `OC_PROTOCOL_2`, plus a run-time check that its seeds equal the file's gym range, and a `--dev` stub on seeds 1–20 that writes nothing. Observe: the stub gave 45/45, refusals 4/4 and the chain intact. Committed f36a0af6 before any held-out run.
3. **Run once.** Check: `claw_eval --protocol 2`. Observe: 45/45, 0 promotions, 155,744/155,744 governed steps, physical 0. ra-lm is never better than bc. Committed 0c2a7d80 with `check_claw` 9. Then 9 passed again with the ancestry chain declaration → protocol → record.
4. **People beside robots, per scenario.** Reason: the brief adds the human side, the matching learner drills for each robot scenario. Check: read the programme. The robot scenarios link to tracks (`RP_TRACKS[].scenario`), not to the disaster drills (`DR_DRILLS`). Act: `ocScenarioDrills` from the tracks' operator and technician robot stations, frozen for the page, with check 10 re-deriving it. Observe: **failed first**. Check 1 flagged "key wording" in `oc-claw.js`: its `sk-` pattern matched "ri·sk-assessment" in a station id. The fix anchors the pattern at a word boundary, with the reason written in the checker.
5. **Trim the record (oc-next 4).** Act: the module keeps each chain's head hash, line count and last line. `ocVerifyHead` re-hashes the last line in the page. Observe: two records in 101,403 B, against 101,484 B for one.
6. **Drive the built page.** Check: `drive_oc2.mjs` on 9152. Observe: **failed first**. Playwright's click on a drill answer waited on a navigation and timed out. Clicking from inside the page fixed it. Then everything passed: the protocol select switched protocols, the chain heads matched, the played drill and the tutor steps showed `local`, `?demo` and `?k12` showed `none`, the phone controls were 298×44 and 250×44 with no horizontal scroll, and there were 0 errors and 0 off-host requests.
7. **The world in the scene (oc-next 3).** Act: `ocMountSiteLamps`, high tier only. Check: `check_claw` 11 (real three.js geometry: 48 triangles a site, low and balanced mount nothing), then `drive_lamps.mjs`. Observe: +1 mesh, 0 lights, 0 textures, and the phone mounts none. In the first view the lamp was outside the frustum, so it added 0 triangles and 0 draw calls there. A second drive aimed the camera at the lamp and measured +48 triangles and +1 draw call, exactly the stated budget.

## Seams

- ARENA-2 owns `ra-*.js`, `tools/arena_eval.mjs` and the declaration files. I import `raTexts`, `raStations` and `RA_DEV_SEEDS` from `arena_eval.mjs`, which is guarded so it does not run on import. If ARENA-2 renames them, `claw_eval --protocol 2` stops at import. Nothing at page time depends on them.
- The robotics programme's `RP_TRACKS` is the source of `OC_SCENARIO_DRILLS`. If a track's stations change, `check_claw` 10 fails until the frozen table is regenerated (`ocScenarioDrills(RP_TRACKS, rpIsRobotStation)`).
- ROBOTS-HD-2 owns the robot rigs and their beacons. The claw's lamp floats 7.5 m above the site's ground, apart from the rig.

## Left

- Declare ra-lm-h (ARENA-2's model) as a claw challenger after integration, in a protocol 3 committed first.
- Consider declaring the reactive agent as a challenger on the hard variants.
- Play one robot station headless so the people side's station pass is real rather than a fixture.
- Refresh the panel's people block when the learner opts in, without a reload.
