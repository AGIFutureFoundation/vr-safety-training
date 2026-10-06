# The TradeQuest bridge — one export for Holodeck and TradeQuest

Console TQ-BRIDGE. SmartCiti.X Holodeck and SmartCiti.X TradeQuest (the Trade Craft Academy site) read **one**
file, so every wave is built once: `exports/shared/holodeck-shared.json` (contract `smartcitix-holodeck-shared`,
semver `version`, now **2.1.0**), its JSON Schema `exports/shared/holodeck-shared.schema.json`, and the adapter
`exports/shared/tradequest-adapter.js` that maps it to the site's registry shapes. DEAN made v1
(`docs/modules.md` §4); v2 keeps every v1 field unchanged, and 2.1.0 (console TQ-ROBOTICS) is additive: no 2.0 key changes name or shape.

```
node tools/export_shared.mjs           # build v2, validate, check the budget, write both files
node tools/export_shared.mjs --check   # the same, write nothing
node tools/check_bridge.mjs            # the proof (schema, v1 compatibility, sources, guard, adapter, budget)
```

## What v2 holds

| Key | Status now | Owner and source | What |
|---|---|---|---|
| v1 fields | ready | DEAN (`dn-index.js`, `dn-modules.js`) | `contract`, `version`, `generatedBy`, `note`, `packsSource`, `packs`, `paths`, `schemas`, `worlds`, `parishes`, `provenance` — unchanged |
| `packs` | ready | PACKS `pk-packs.js` via DEAN | the packs (v1 field) |
| `paths` | ready | STORYLINE via DEAN | the seven path ids (v1 field) |
| `maps` | ready | parish engine `np-parishes.js` (`NP_PARISHES`, `NP_REGIONS`) + `lm-landmarks.js` (`lmKinds`) | the 22 maps by region: sites (id, name, kind, stations), landmarks (id, name, kind, `lm` kind), hills (id and name only) |
| `palette` | pending | PALETTE `pa-palette.js` (`PA_SHARED.categories` or `PA_CATEGORIES`) | colour categories by district character and region |
| `facades` | pending | FACADES `fc-*.js` (`FC_SHARED.{detailKinds,signs}`, or `FC_DETAIL_KINDS`/`FC_KINDS`/`FC_DETAILS` and `FC_GENERIC_SIGNS`/`FC_SIGN_WORDS`/`FC_SIGN_TRADES`/`FC_SIGNS`; `FC_KITS`) | detail kinds and the generic sign list |
| `vehicles` | partial | Motor Pool `drivables-data.js` (`DV_DRIVABLES`) + MOTORWORKS `mv-*.js` (`MV_SHARED.{classes,handling}`, or `MV_CLASSES`/`MV_VEHICLE_CLASSES`, `MV_HANDLING` (its keys are the classes), `MV_SITE_RULES`) | every drivable (medium, class, trades, gate stations, drive profile) now; per-class handling when MOTORWORKS merges |
| `robotics` | partial until VBRIDGE lands, then ready | ROBOTICS `rb-*.js` (`RB_SHARED`, `rbSharedData()`, `RB_SCENARIOS` or `rbScenarios()`) + ROBOPROG, AGENTGYM, COLEARN files + VBRIDGE `vb-*.js` (guarded) | the gym scenarios behind `rbEnv(scenarioId)` and, since 2.1.0, six facets: see "The robotics section" below |
| `dataset` | partial | `episodes.js` (`EPISODE_SCHEMA_VERSION`), `robot-embodiment.js` (`observationSchema()`, `actionSpace()`) + DATAWORKS `dx-*.js` (`DX_SHARED.{episodeSchema,datasetCard}`, `DX_EPISODE_SCHEMA`/`DX_SCHEMA`, `DX_DATASET_CARD_TEMPLATE`/`dxDatasetCard()`, `DX_CARD_SECTIONS`) | episode schema version and embodiment schemas now; DATAWORKS' episode schema and dataset-card template when it merges |
| `sections` | — | TQ-BRIDGE | `{ status, owner, sources }` per section, the index a reader checks first |
| `changelog`, `budget` | — | TQ-BRIDGE | release notes per version; the size budget |

Each section is `{ status, owner, sources, note?, data }` with `status` one of `ready | partial | pending`. A
`pending` section has `data: null`; `sources` lists every file it looked in and what it found (or the import
error), so a reader sees *why* it is pending.

## The guard, and the owner seam

`tools/tq_bridge.mjs` imports an owner's module only if the file exists, inside `try/catch`, and reads plain data
only (functions are called with no arguments, then the result is copied through JSON). The **preferred seam** is
one plain, dependency-free object in the owner's module named `<PREFIX>_SHARED` (`PA_SHARED`, `FC_SHARED`,
`MV_SHARED`, `RB_SHARED`, `DX_SHARED`); the named exports in the table are read when it is absent. When
PALETTE, FACADES, MOTORWORKS, ROBOTICS and DATAWORKS merge, **re-running `node tools/export_shared.mjs` fills their
sections with no code change** — `check_bridge` §4 proves this against a scratch tree with stand-in owner modules
(and proves a module that throws on import stays `pending` with its error recorded).

## Size budget

The written file (JSON, indent 1) must stay **≤ 768 KiB** and **≤ 128 KiB gzipped**; the exporter refuses to
write past it and `check_bridge` §7 fails. Today: 674.7 KiB (gzip 119.2 KiB). v1 was 344 KiB and `maps` adds about
172 KiB. The gzip budget is the tight one: after the robotics facets about 8.8 KiB gzipped remains. An owner that
needs more should export ids and names, not geometry and not tables: every robotics facet has its own byte cap
(`TQR_FACET_CAP` in `tools/tq_robotics.mjs`) and a facet over it is refused and left pending, so one owner cannot spend
the whole budget.

## The TradeQuest adapter (`exports/shared/tradequest-adapter.js`)

Dependency-free ESM (no imports, no DOM, no network, no clock; pure). The Trade Craft Academy site's own data are
registries of the form `{ pack, provenance, note, … }` with a small provenance vocabulary (its street-fabric files
are `{ "pack": "parishes", "provenance": "AUTHORED", … }`; its wiki labels things AUTHORED and SCHEMATIC); the site
does not document an import shape for Holodeck data, so this is the contract:

```js
import { tqAdapt, tqAccepts } from "./tradequest-adapter.js";
tqAdapt(doc) → {
  pack: "holodeck-shared", packVersion, adapter: "1.1.0", contract,
  provenance: { AUTHORED, SCHEMATIC, PROCEDURAL, GENERATED, PENDING },   // what each word means
  pending: [],                                                            // registries still waiting on an owner
  registries: {
    places:    { pack, provenance: "AUTHORED",   status, regions, items: [{ id, name, region, campus, frame: { centre, bounds, fips }, sites: [{ id, name, kind, stations }], landmarks: [{ id, name, lm }], hills: [{ id, name }] }] },
    courses:   { pack, provenance: "GENERATED",  status, source, items: [{ id, title, programmes, stations, path }] },
    paths:     { pack, provenance: "AUTHORED",   status, items: [{ id, courses }] },
    finishes:  { pack, provenance: "SCHEMATIC",  status, items: [palette categories as { id, … }] },
    kit:       { pack, provenance: "SCHEMATIC",  status, signs, items: [facade detail families as { id, … }] },
    fleet:     { pack, provenance: "AUTHORED",   status, classes, motorworks, items: [{ id, name, medium, class, trades, gatedOn, handling }] },
    scenarios: { pack, provenance: "PROCEDURAL", status, api, rules, ssm, facets, agentGym, colearn, governor, jobs, items: [robotics scenarios] },
    dataset:   { pack, provenance: "AUTHORED",   status, episodes, embodiment, episodeSchema, datasetCard, items: [] },
    pathways:  { pack, provenance: "AUTHORED",   status, levels, standards, loop, coverage, consent, note, items: [{ id, title, kinds, scenario, standards: [{ id, label }], sites, levels: [{ id, title, who, requiredScore, dueDays, stations: [{ id, robot, launch }], capstone, credential, earnable, collectsData }] }] },
    credentials: { pack, provenance: "AUTHORED", status, note, items: [{ id, title, require, earnedAt: [{ pathway, level }] }] },
    launch:    { pack, provenance: "AUTHORED",   status, base, note, items: [{ id, kind: "station", launch, robot, robotKind, scenarios, pathways: [{ pathway, level }], places: [{ place, site, campus }] } | { id, kind: "site", name, rig, place, scenario, station, launch }] },
  },
  stationIndex: { "<station id>": [{ place, site, campus }] },          // where each station plays
}
```

- The eleven registries: `places` (from `maps`, frames from `parishes`), `courses` (from `packs`), `paths`, `finishes`
  (from `palette`), `kit` (from `facades`), `fleet` (from `vehicles`), `scenarios` (from `robotics`), `dataset`, and the three
  robotics registries added in 1.1.0 (from the `programme` facet): `pathways`, `credentials` and `launch`.
- A registry whose section is `pending` has `provenance: "PENDING"` and empty `items`.
- `campus` routes a Holodeck region to a TradeQuest campus id (`TQ_CAMPUS_BY_REGION`: new-orleans → `new-orleans`,
  san-francisco → `treasure-island`, oakland and north-east-bay → `oakland`, south-bay and bay-program → `null`). It is
  an AUTHORED routing choice, not geography; change the table, not the data.
- `tqAccepts(doc)` accepts contract `smartcitix-holodeck-shared` at major 1 or 2; a v1 document adapts with places
  from `parishes` (status `partial`) and every v2-only registry `pending`. Another contract or a future major throws.

## The robotics section (2.1.0)

Console TQ-ROBOTICS. `robotics.data` keeps its 2.0 keys (`scenarios`, `api`, `schema`, `forceN`, `ssm`, `rules`, `sites`,
`sitePractices`) and adds `facets` (`{ status, source, why? }` per facet) and one key per facet, `null` while pending.
`tools/tq_robotics.mjs` builds them from the owners' own files; an owner that already puts a facet in `RB_SHARED` wins.

| Facet | Owner and source | What travels | Status |
|---|---|---|---|
| `scenarios` | ROBOTICS `rb-robotics-data.js` | the gym scenarios (the `rbEnv(scenarioId)` seam) | ready |
| `programme` | ROBOPROG `rp-programme.js` | 6 tracks × 5 levels with stations and the credential each level ends in, 5 standards by name (no clause text), the robot-station list, the learning loop with its live flags, coverage 30/30, the consent rule | ready |
| `agentGym` | AGENTGYM `docs/perf/agent-baselines.json` | the config, the four baselines' summary (random, scripted expert, retrieval, retrieval-ask; no language model), and a pass row for each of the programme's ten robot stations with the baselines' pass rate on them (random 0, expert 1, retrieval 0.1, retrieval-ask 0.4 over 30 episodes). The full run (721 stations) predates four of the programme's stations, so `docs/perf/agent-baselines-robotics.json` holds the same harness, config and seeds for the ten (`node tools/ag_eval.mjs --seeds 3 --stations <the ten> --out docs/perf/agent-baselines-robotics.json`); the six rows both files hold are identical. The 271 KB per-station table is summarised, not copied | ready |
| `colearn` | COLEARN `docs/evals/colearn.json` | behaviour cloning against random and the scripted expert on held-out seeds, per scenario and for three station wrappers, plus the tutor's simulated gain; demonstrations are synthetic and labelled so | ready |
| `governor` | VBRIDGE `vb-*.js` | the safety governor's rule list: the words of each rule, nothing that can act | pending until VBRIDGE publishes it |
| `jobs` | VBRIDGE `vb-*.js` | the job phases (request, negotiation, transaction, evaluation, completed, rejected, expired), the roles and the deliverable names | pending until VBRIDGE publishes it |

`robotics.status` is `partial` while any facet is pending and `ready` when all six are filled. **Re-running
`node tools/export_shared.mjs` after VBRIDGE merges fills `governor` and `jobs` with no code change** if its module
publishes the seam below; `check_bridge` §9 proves this against stand-in modules and, once a `vb-*.js` is in the tree,
fails if the two facets are still pending (the seam is unwired).

**The VBRIDGE seam.** One plain, dependency-free object, like the other owners:

```js
export const VB_SHARED = {
  phases: ["request", "negotiation", "transaction", "evaluation", "completed", "rejected", "expired"],
  roles: ["client", "provider", "evaluator"],
  governor: { rules: [{ id, text }, …] },   // every rejection reason, as plain data
};
```

Without `VB_SHARED` the bridge reads `VB_PHASES` / `VB_JOB_PHASES` / `vbPhases`, `VB_ROLES`, and `VB_GOVERNOR_RULES` /
`VB_REASONS` / `VB_RULES` / `vbGovernorRules` from any `WebXR/shared/vb-*.js`, and the detail VBRIDGE's modules export
today: `VB_PHYSICAL` (the physical-robot switch, shipped disabled), `VB_TASKS` (the allowlist), `VB_RIG_LIMITS` into
`governor`; `VB_SCHEMA`, `VB_TERMINAL`, `VB_MOVES`, `VB_MEMO_TYPES`, `VB_DEADLINE_TICKS` into `jobs`. Rehearsed against
VBRIDGE's own files (read from its worktree, not copied): both facets ready, 9 rules, 7 phases, 677.4 KiB in all. Extra
keys on `governor` and on `jobs` travel as they are, inside the facet's byte cap.

**What the section never carries.** It is simulation and policy data only. A facet that holds a key-shaped,
seed-phrase-shaped, PEM or wallet-address-shaped string, or an API-key-shaped one, is refused (`tqrRefuse`): the facet is
`pending` with the reason and the string never reaches the document. No token, price, market or fund wording appears, and no
affiliation: the build holds no keys, signs nothing and makes no payments. A command from a software agent reaches a
simulated robot only, through the safety governor (docs/virtuals-bridge.md, when VBRIDGE has landed it).

**TradeQuest's view.** `tqAdapt` maps the programme facet to `pathways` (the robotics pathway catalogue), `credentials`
and `launch` (station links `smartcity-x.html?sim=<station>&from=tradequest`, and site links
`parishes.html?parish=<place>&site=<building>&from=tradequest`, relative to the Holodeck's deployed root: no host is named, the
site adds its own base). The `scenarios` registry also carries the AGENTGYM and COLEARN summaries and, when present, the
governor and the job phases. A 2.0 document (robotics without facets) and a v1 document still adapt: the three new
registries read `pending`.

## Rules the export keeps

No learner data (ids, frames and schemas only). Real places are named only as places; hills travel by name only (their
shape in the stylised maps is procedural); vehicle profiles are the game's arcade units, not specifications; sign text is
generic trades only; the street fabric reused from the Trade Craft Academy is AUTHORED, not the real grid. No network at
runtime: both platforms read the committed file.

## Changelog

The document carries its own `changelog`. 2.1.0 (TQ-ROBOTICS): the robotics facets and the adapter's `pathways`,
`credentials` and `launch` registries; additive. 2.0.0 (TQ-BRIDGE): `sections`, `maps`, `palette`, `facades`, `vehicles`,
`robotics`, `dataset`, `changelog`, `budget`; the schema file is the v2 superset; the TradeQuest adapter. 1.0.0 (DEAN):
the first contract.
