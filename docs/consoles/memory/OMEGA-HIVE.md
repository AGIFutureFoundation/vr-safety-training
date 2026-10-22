# OMEGA-HIVE memory

- Base 43d3e3f6 (loop 10). Prefix `oh`/`OH_`, port 9091. Modules: `oh-hive-data.js` (no imports), `oh-say.js`, `oh-voice.js`,
  `oh-hive.js`, `oh-panel.js`. Checker `tools/check_omega_hive.mjs` (15 checks; `OH_ROOT=<tree>` runs it against another checkout).
- Contract with AGENT-AVATARS: `OH_AGENTS`, `ohHive(...)` → `{ agents, step, run, on, off, events, approve, decline, pending, metrics, jobs, log, verify }`.
  Eight event types, listed in `OH_EVENT_TYPES`. `on("*")` gets every event. A speak caption names the agent plus "(software agent)".
- Hive step = one simulated minute (`OH_TICK_MS`). Bids: 0.6 skill − 0.12 hops − 0.25 load. Capacity 2. A hop counts the
  same site, the same map, the same region or another region; it is not a distance. One job per robot site at a time.
- Steward veto thresholds come from caution: payload z > 4 − 2c, or speed share ≥ 1 − 0.15c with a person inside the warning
  distance. The steward is consulted only after a governor allow.
- Physical path: the governor refuses `physical-target` → an approval request. `approve()` re-queues the job as a NEW
  simulated job (new id), which goes through bidding and the governor again. `decline()` closes it.
- Gotcha: stamp `atMs` when the provider negotiates (the hive clock), not at arrival. An out-of-order check makes the
  governor's cadence feature read 0 s and refuse the job as `anomalous`.
- Gotcha: `ohCap` must not capitalise a sentence-initial job id. "Vbjob-…" also slipped past the lowercase id scan, so the
  scan is case-insensitive now.
- Gotcha: ENTERPRISE-3's localStorage key is profile-namespaced (`ent3-governance-v1::<ns>`) when signed in.
- Gotcha: DATAWORKS' demo signal is the session flag `vr-training-demo-v1`. The page's `?demo` is a separate flag (GEO
  reads it), so the hive gate checks both.
- Gotcha: an agent with two jobs can walk to its second job's site, so `dispatch` emits a walk-back `move` first (check 2b,
  the avatar-side fixture). Without it, 9 jobs on seed 7 started away from their figure.
- Measured: NB distinctiveness 0.950 (neutral control 0.870, chance 0.143); style 7/7; grounding 954/954; governor
  161/161 jobs checked and 3,631/3,631 steps monitored; approvals 10/10; hive 0.034 against single 13.715 steps to
  award (both 159 completed).
- Drives: `$SP/loop10/oh/drive_hive.mjs` (gate, voice stub, approvals, audit), `drive_budget.mjs` (scene stats with a
  settle wait and a no-step control). Signing in for a drive:
  `localStorage["vr-training-auth-v1"] = {"id":"learner-check"}`.
