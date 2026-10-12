# ROBOEXPORT (`rx`, port 9072) — the sim-to-real readiness package, with no hardware claim

Loop 8 (SmartCiti.X Holodeck · Powered by AGI Corp). Base b7caa08e. Builds on ROBOTICS (`rb-env.js`, `tools/rb_rollout.mjs`,
`tools/lib/dataset_formats.mjs`), COLEARN (`col-learn.js`, `docs/evals/colearn.json`), ROBOSCENARIOS (the six gym scenarios),
DATAWORKS (`dx-data.js` datasheets and consent), ENTERPRISE-3 (`ent3-governance.js` lineage and audit chain) and VBRIDGE (the
governor's rules). Read `ROBOTICS.md`, `DATAWORKS.md`, `ENTERPRISE-3.md` and `ROBOSCENARIOS.md` first; this file adds to them.

Robots are simulated. Every dataset here is synthetic and labelled so. **No hardware run has happened and none is claimed**; the
bench protocol is a method. The learner-data terms say only what the code enforces and are marked a draft for counsel.

## What is here

1. **`tools/rb_export.mjs` → `exports/robotics/`** (81 files, 1,026 KB; largest file 128 KB). For each of the six gym scenarios
   (`COL_SCENARIOS`): `dataset.json` (the synthetic demonstration set COLEARN trains on: the 40 seeds, counts, licence CC0-1.0,
   the set's hash, the rules, what it is not), `dataset-card.md` (DATAWORKS' datasheet `dxDatasetCard` with every
   `DX_CARD_SECTIONS` heading, plus Source / Synthetic label / Seeds / Counts / Licence / What this dataset is not), a 3-episode
   **sample** in the LeRobot- and RLDS-style layouts (`lerobot/`, `rlds/`; `validateFormats` valid; every episode `source:
   "synthetic"`, consent not required) — the full set is reproduced by seed, not shipped — `policy.json` (the trained k-NN
   clone's parameters: features, weights, k and its rows; `colHash` equals `colearn.json`'s `modelHash`), `eval-card.json` /
   `eval-card.md` (random / clone / expert on the 60 held-out seeds from `colearn.json`, invariant violations counted live,
   lineage ids, audit head). `governance.json`: an ENTERPRISE-3 registry built in memory (no device store touched) — 6 datasets →
   6 policies → 12 measured evals → 6 sim site deployments — with the hash-chained audit log (30 lines, verified) and its head.
   `index.json` and `README.md` index it. Deterministic (fixed timestamps): `--check` rebuilds in memory and compares.
2. **`tools/rb_report.mjs` → `docs/perf/robot-policies.html`**: one card per policy (scenario, synthetic data source, seeds,
   success bars against the random floor and the expert, violation steps and the episodes they fall in, lineage, audit head), a
   summary table and five stat tiles. Static HTML, no script, no external request, the design system's `--at-*` tokens inlined
   for both colour schemes, phone-safe. `--check` compares with disk.
3. **`docs/bench-protocol.md`**: how the same six tasks would be scored on hardware — the sim metric already measured, the
   hardware metric with the same definition, the gap to report, the governor's rules as preconditions (e-stop first, the
   physical path disabled and frozen, no keys or chain calls, separation, speed, registered current policy, every step logged,
   mannequins never people), who approves (a named supervisor, the site's safety officer, the policy's registrant, an
   independent reviewer), what a report must contain, and a status table that says **no hardware run has happened**.
4. **`docs/learner-data-terms.md`** ("draft for counsel"): what is recorded (only after opt-in by an adult, signed-in learner;
   never demo, signed-out or K-12; unknown refuses), what is never collected (`DX_NEVER`), where it lives (this device; no
   network call), what it trains (the local provider only), how to revoke (one tap; it deletes), the licences, what the project
   does not promise, and a table of where the code enforces each claim. Linked from the DATAWORKS consent panel (`dx-consent-ui.js`,
   `#dx-terms`, option `termsHref`) and from the Guide's FAQ (`tools/gen_guide_kb.mjs` entry `data-terms`; `guide-kb.js` regenerated,
   671 KB under its 672 KB cap — the two new docs contribute no doc chunks, the FAQ entry carries the terms).
5. **`tools/check_roboexport.mjs`** (8 checks, ~2 s CPU): exports present, small and valid; current (byte-identical rebuild, so
   every model hash matches `colearn.json`); cards complete and every sample episode labelled synthetic; policies load and run;
   the audit chain verifies and every card's head is a line; the report current and static; the terms marked a draft, naming
   what the code enforces (the five eligibility refusals exercised live against `dxEligibility`, the never-list, both licences,
   revoke, this device), with a forbidden-promise scan (any sentence naming a guarantee, a regulation, encryption, anonymity, a
   server or an upload must be a negation) and both links; no hardware result, partner, customer or financial claim in anything
   this console wrote, no model identifier, no import alias. Listed in `check_all.mjs` after `check_roboscenarios` and in
   `docs/perf/checkers-baseline.json`.

## Evals (before → after)

| Measure | Before (b7caa08e) | After |
|---|---|---|
| Gym scenarios with an exported, labelled dataset card **and** a policy card | 0 of 6 | **6 of 6** |
| Policies with a static evaluation report card (scenario, source, seeds, random/expert, violations, lineage id, audit head) | 0 | **6** (`docs/perf/robot-policies.html`) |
| Docs the whitepaper FAQ marks as missing (learner-data terms) | 1 | **0** (`docs/learner-data-terms.md`, draft for counsel; linked from the consent panel and the Guide FAQ) |
| Bench protocol (method, no result) | none | `docs/bench-protocol.md`; hardware runs: **0**, stated |
| Clone vs expert on 60 held-out seeds (from `colearn.json`, unchanged here) | — | cell-entry 1.0/1.0, cobot 1.0/1.0, teleop 0.967/0.983, AMR 0.817/1.0, drilling 1.0/1.0, port 1.0/1.0 |
| Clone violation steps over the 60 seeds (new, counted live) | — | cell-entry 0, cobot 0, teleop 755 (in 2 of 60 episodes: a held protective stop repeats every step), AMR 785 (in 11 of 60), drilling 0, port 0; expert 1 (teleop), else 0 |
| Export size | — | 81 files, 1,026 KB (summaries, cards, 3-episode samples; no episode dumps) |

The violation-step figures are the honest part of the report: the AMR clone (0.817 success) and the teleop clone (0.967) fail
by pushing into a held conflict or keep-out until the episode cap, so the steps pile up in the failed episodes; the expert
breaks one rule once (teleop, 1 of 60). Nothing here is a hardware figure.

## Cycles

1. Reason: the package is only real if the exporter reproduces the exact models `colearn.json` reports; check = `colHash(model)
   === colearn.modelHash` for all six, and `--check` byte-identical → Act: `tools/rb_export.mjs` (demos via `colSyntheticDemos`
   seed 1, `colTrain` filtered, `dxDatasetCard` + extra sections, `createFormatWriters` on a 3-episode sample, ENTERPRISE-3
   registry in memory with fixed timestamps) → Observe: 6 hashes match; 81 files, 1,024 KB, largest 132 KB; `--check` current in
   2.8 s; `validateFormats` valid on all six samples. Committed 078e7644.
2. Reason: a violation count that says "755" beside "96.7% clean" misleads unless it says where the steps fall; check = the eval
   card names the episodes → Act: `rxViolations` counts episodes with violations and the card and README say "a held protective
   stop repeats every step" → Observe: teleop 755 steps in 2 of 60 episodes, AMR 785 in 11 of 60; the clean ones 0 in 0.
3. Reason: the report must be static and current; check = `rb_report --check`, 0 `<script`, 0 external URLs → Act:
   `tools/rb_report.mjs` with the `--at-*` tokens inlined (dark default, light via `prefers-color-scheme` and `data-theme`) →
   Observe: 23,432 bytes, 6 cards, 0 scripts, 0 external hrefs; `--check` current.
4. Reason: the terms must be linked where consent is given and where people ask; check = `check_dataworks` still 59/0 and the
   guide KB under its cap → Act: `termsHref` + `#dx-terms` in `dx-consent-ui.js`, FAQ entry `data-terms` in `gen_guide_kb.mjs` →
   Observe: `check_dataworks` 59 passed, 0 failed; `gen_guide_kb` refused twice (675 KB, then 673 KB over the 672 KB cap with the
   two new docs' sections) → the two docs contribute no doc chunks and the FAQ answer was shortened → 1,549 chunks, 671 KB.
5. Reason: one checker proves every claim above; check = `check_roboexport` → Act: the checker → Observe: 6/2 — its own source
   matched the claim scan (the regex text) and the consent panel's header comment matched `innerHTML` → the checker skips its own
   file in the claim scan and looks for HTML sinks (`.innerHTML =`) → 7/1 — the bench protocol's method sentences ("a bench run
   produces…") matched a mention scan → the scan now targets result phrasing only (a sentence claiming a completed physical run) and keeps
   the business-claim words negation-only → **8 passed, 0 failed**.
6. Reason: neighbours must still pass; check = `check_guide` after the KB regeneration → Observe: see the hand-back line.

## Seams

- `rxBuild()` / `rxDiff(files)` in `tools/rb_export.mjs` (also `RX_OUT`, `rxDemoSeeds`); `rxReportHtml({ index, cards, governance })`
  in `tools/rb_report.mjs`. Both deterministic; WHITEPAPER-R3 reads `exports/robotics/index.json` and `README.md` for figures.
- `dxMountConsent(el, { termsHref })` — the terms link; `null` hides it. Default `../../docs/learner-data-terms.md` (both mounts,
  the parishes app and `WebXR/data/index.html`, sit two levels deep).
- The Guide FAQ `faq:data-terms` (`gen_guide_kb.mjs`). `docs/bench-protocol.md` and `docs/learner-data-terms.md` are excluded
  from the KB's doc chunks on purpose (the cap); add them back when something else leaves.
- `exports/robotics/governance.json` lineage ids: `rx-ds-<scenario>` → `rx-bc-<scenario>@<hash8>`; audit head in `index.json`.

## Left

- The bench protocol is a method; no bench, rig or site exists in this repository, and the status table says so. Nothing to
  measure until someone outside this repo runs one under section 3's approvals.
- The LeRobot/RLDS files are 3-episode samples; a full-set export is `node tools/rb_rollout.mjs` (episodes) or
  `colSyntheticDemos` by seed. A parquet/TFRecord writer is still not built (the layouts are "style", as before).
- The terms are a draft for counsel; nothing here is legal review. The whitepaper FAQ (scratch) still carries the "no terms"
  sentence until WHITEPAPER-R3 refreshes it.
- The report has no history: it shows the current export only. A per-loop diff would need the previous `index.json` kept.
- `check_roboexport` was timed under load (13 on four cores); the baseline is an estimate from CPU time, to re-measure quiet.
