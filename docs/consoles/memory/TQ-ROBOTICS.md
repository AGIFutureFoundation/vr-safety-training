# TQ-ROBOTICS memory

- Contract 2.1.0 (minor, additive): `robotics.data` keeps its 2.0 keys and adds `facets` plus `programme`, `agentGym`, `colearn`, `governor`, `jobs` (null while pending). v1 and 2.0 documents still adapt; the adapter is 1.1.0.
- `tools/tq_robotics.mjs` builds the facets from the owners' files: `rp-programme.js` (ROBOPROG), `docs/perf/agent-baselines.json` plus `docs/perf/agent-baselines-robotics.json` (AGENTGYM; the supplement baselines the ten programme robot stations with the same harness), `docs/evals/colearn.json` (COLEARN), and VBRIDGE's `vb-*.js` (guarded; `VB_SHARED`, else its named exports `VB_REASONS`, `VB_PHASES`, `VB_ROLES`, `VB_PHYSICAL`, `VB_TASKS`, ...).
- `robotics.status` is `partial` while any facet is pending, `ready` when all six are filled. Re-run `node tools/export_shared.mjs` after VBRIDGE merges; `check_bridge` §9 then expects governor and jobs ready.
- Refusals at the export boundary: a facet with a key-, seed-, PEM-, wallet-address- or API-key-shaped string, or over its byte cap (`TQR_FACET_CAP`), stays pending with the reason.
- Budget: 674.2 KiB of 768 raw, gzip 119.0 of 128 with four facets; 676.5 KiB with VBRIDGE's real files (rehearsed). The gzip budget is the tight one.
- Adapter registries added: `pathways` (6 tracks x 5 levels), `credentials` (6), `launch` (48 station links, 5 site links), relative to the Holodeck's deployed root; no host named.
- Proof: `node tools/check_bridge.mjs` (136 checks, §9 is robotics).
