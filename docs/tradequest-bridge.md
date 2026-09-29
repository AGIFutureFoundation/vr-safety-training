# The TradeQuest bridge — one export for Holodeck and TradeQuest

Console TQ-BRIDGE. SmartCiti.X Holodeck and SmartCiti.X TradeQuest (the Trade Craft Academy site) read **one**
file, so every wave is built once: `exports/shared/holodeck-shared.json` (contract `smartcitix-holodeck-shared`,
semver `version`, now **2.0.0**), its JSON Schema `exports/shared/holodeck-shared.schema.json`, and the adapter
`exports/shared/tradequest-adapter.js` that maps it to the site's registry shapes. DEAN made v1
(`docs/modules.md` §4); v2 keeps every v1 field unchanged.

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
| `facades` | pending | FACADES `fc-*.js` (`FC_SHARED.{detailKinds,signs}`, or `FC_DETAIL_KINDS`/`FC_KINDS`/`FC_DETAILS` and `FC_GENERIC_SIGNS`/`FC_SIGN_TRADES`/`FC_SIGNS`) | detail kinds and the generic sign list |
| `vehicles` | partial | Motor Pool `drivables-data.js` (`DV_DRIVABLES`) + MOTORWORKS `mv-*.js` (`MV_SHARED.{classes,handling}`, or `MV_CLASSES`/`MV_VEHICLE_CLASSES` and `MV_HANDLING`) | every drivable (medium, class, trades, gate stations, drive profile) now; per-class handling when MOTORWORKS merges |
| `robotics` | pending | ROBOTICS `rb-*.js` (`RB_SHARED.scenarios`, `RB_SCENARIOS` or `rbScenarios()`) | the gym scenarios behind `rbEnv(scenarioId)` |
| `dataset` | partial | `episodes.js` (`EPISODE_SCHEMA_VERSION`), `robot-embodiment.js` (`observationSchema()`, `actionSpace()`) + DATAWORKS `dx-*.js` (`DX_SHARED.{episodeSchema,datasetCard}`, `DX_EPISODE_SCHEMA`, `DX_DATASET_CARD_TEMPLATE`) | episode schema version and embodiment schemas now; DATAWORKS' episode schema and dataset-card template when it merges |
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
write past it and `check_bridge` §7 fails. Today: 556.6 KiB (gzip 81.7 KiB). v1 was 344 KiB; `maps` adds about
172 KiB; the remaining ~210 KiB (≈45 KiB gzipped) is headroom for the four pending sections. An owner that needs
more should export ids and names, not geometry.

## The TradeQuest adapter (`exports/shared/tradequest-adapter.js`)

Dependency-free ESM (no imports, no DOM, no network, no clock; pure). The Trade Craft Academy site's own data are
registries of the form `{ pack, provenance, note, … }` with a small provenance vocabulary (its street-fabric files
are `{ "pack": "parishes", "provenance": "AUTHORED", … }`; its wiki labels things AUTHORED and SCHEMATIC); the site
does not document an import shape for Holodeck data, so this is the contract:

```js
import { tqAdapt, tqAccepts } from "./tradequest-adapter.js";
tqAdapt(doc) → {
  pack: "holodeck-shared", packVersion, adapter: "1.0.0", contract,
  provenance: { AUTHORED, SCHEMATIC, PROCEDURAL, GENERATED, PENDING },   // what each word means
  pending: ["finishes", "kit", "scenarios"],                              // registries still waiting on an owner
  registries: {
    places:    { pack, provenance: "AUTHORED",   status, regions, items: [{ id, name, region, campus, frame: { centre, bounds, fips }, sites: [{ id, name, kind, stations }], landmarks: [{ id, name, lm }], hills: [{ id, name }] }] },
    courses:   { pack, provenance: "GENERATED",  status, source, items: [{ id, title, programmes, stations, path }] },
    paths:     { pack, provenance: "AUTHORED",   status, items: [{ id, courses }] },
    finishes:  { pack, provenance: "SCHEMATIC",  status, items: [palette categories as { id, … }] },
    kit:       { pack, provenance: "SCHEMATIC",  status, signs, items: [facade detail families as { id, … }] },
    fleet:     { pack, provenance: "AUTHORED",   status, classes, motorworks, items: [{ id, name, medium, class, trades, gatedOn, handling }] },
    scenarios: { pack, provenance: "PROCEDURAL", status, api, items: [robotics scenarios] },
    dataset:   { pack, provenance: "AUTHORED",   status, episodes, embodiment, episodeSchema, datasetCard, items: [] },
  },
  stationIndex: { "<station id>": [{ place, site, campus }] },          // where each station plays
}
```

- The eight registries: `places` (from `maps`, frames from `parishes`), `courses` (from `packs`), `paths`, `finishes`
  (from `palette`), `kit` (from `facades`), `fleet` (from `vehicles`), `scenarios` (from `robotics`), `dataset`.
- A registry whose section is `pending` has `provenance: "PENDING"` and empty `items`.
- `campus` routes a Holodeck region to a TradeQuest campus id (`TQ_CAMPUS_BY_REGION`: new-orleans → `new-orleans`,
  san-francisco → `treasure-island`, oakland and north-east-bay → `oakland`, south-bay and bay-program → `null`). It is
  an AUTHORED routing choice, not geography; change the table, not the data.
- `tqAccepts(doc)` accepts contract `smartcitix-holodeck-shared` at major 1 or 2; a v1 document adapts with places
  from `parishes` (status `partial`) and every v2-only registry `pending`. Another contract or a future major throws.

## Rules the export keeps

No learner data (ids, frames and schemas only). Real places are named only as places; hills travel by name only (their
shape in the stylised maps is procedural); vehicle profiles are the game's arcade units, not specifications; sign text is
generic trades only; the street fabric reused from the Trade Craft Academy is AUTHORED, not the real grid. No network at
runtime: both platforms read the committed file.

## Changelog

The document carries its own `changelog`. 2.0.0 (TQ-BRIDGE): `sections`, `maps`, `palette`, `facades`, `vehicles`,
`robotics`, `dataset`, `changelog`, `budget`; the schema file is the v2 superset; the TradeQuest adapter. 1.0.0 (DEAN):
the first contract.
