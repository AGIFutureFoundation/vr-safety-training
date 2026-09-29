# PACKS — the SmartCiti.X Powered by AGI Corp Holodeck Packs

Console PACKS (prefix `pk`, port 8986), the Holodeck Packs run. Brief: `tools/briefs/packs-brief.md`.

## Plan (written before code)

A **Holodeck Pack** is one shippable slice of the platform: a manifest that names the stations, programmes,
worlds and sites it plays in, the union(s) it is taught under and the STORYLINE path it belongs to.
Everything is generated from what exists; no station, union or figure is invented.

Pack kinds (each kind is its own set of manifests, `kind` on every manifest):

| kind | one per | source | path |
|---|---|---|---|
| `programme` | union-trade programme in the catalog (`curricula`, not `k12-*`) | `WebXR/smartcity/catalog.json` | STORYLINE's registry: `first-responders` (first-responders, situational-awareness), `disaster-relief` (hazmat-environmental), `un-training` (outbreak-response-who), `teachers` (education-support-staff, civic-leadership-and-ei); every other programme `union-trades` |
| `k12` | K-12 track (`k12-*` programme, with its `band`) | catalog | `k12` (also `teachers`) |
| `union` | union in `tools/unions.json` that the platform's text ties to a station (a programme's `union` string or a station's own certification naming its alias), K-12 stations excluded | unions registry + catalog | `first-responders` for IAFF, NAGE, FOP, NASW (the first-responders programme's union line); `teachers` for AFT, CSEA; else `union-trades` |
| `library` | catalog category, non-K-12 stations only — the home of the 26 stations no programme lists yet | catalog `categories` | `first-responders` for Emergency Services (also `disaster-relief`); every other category is trade stations, so `union-trades` |

**Just Roam carries no pack.** STORYLINE defines `roam` as the free-exploration path with no programmes (it turns the
prompts off), so it is not a fallback: `check_packs` asserts no pack carries it and that every other path has at least
one pack of its own. A programme STORYLINE lists under two paths takes one as `path` and the other in `alsoPaths`
(first-responders and situational-awareness: First Responders, also Disaster Relief; hazmat-environmental: Disaster
Relief, also First Responders; water-and-gas-utility-crews: Union Trades, also Disaster Relief). Two judgement calls,
recorded: basketball-fundamentals and the Youth Sports & Coaching library are taught by parks-and-recreation staff
(AFSCME, SEIU) against USA Basketball's youth guidelines — neither a classroom programme nor a teacher-facing flow in
STORYLINE's registry — so they stay `union-trades`; bay-restoration programmes are site and marine trade work and stay
`union-trades` (STORYLINE's Disaster Relief does not list them).

K-12 packs hold only `k12-*` stations and name no union package; union packs hold no `k12-*` station
(the checker holds both). A pack may carry `alsoPaths` (e.g. First Responders also serves Disaster Relief,
K-12 packs also serve Teachers) — secondary, never replacing `path`.

Manifest (`WebXR/packs/<id>.json`, written by `tools/gen_packs.mjs`):
`{ id, kind, title: "SmartCiti.X <Pack name> — Powered by AGI Corp", name, brand, audience, summary,
programmes[], stations[{app,id}], worlds[{world, parish?, sites[]}], unions[], k12Bands[], path, alsoPaths[],
version, contentHash, stationNames, generator, provenance }`. Pack ids: a programme or K-12 track keeps its
programme id; a union package is `union-<registry id>`; a library is `library-<category slug>`. `version` is `1.0.0`
with an 8-hex `contentHash` of its stations, programmes, worlds and unions (deterministic, no timestamps). A library
names the programmes that share its stations only as `relatedProgrammes` (its `programmes` is empty), so an exported
library never carries a programme whose other stations it lacks.

Where it plays: a station plays at a site when a world's site data lists it — Bay World (`BAY_SITES`), the Deep
(`DEEP_SITES`), Sierra Summit (`SM_SITES`), Redwood Reach (`RW_SITES`) and the ten parish/district maps
(`NP_PARISHES[].sites`).

Files:
- `tools/gen_packs.mjs` → `WebXR/packs/<id>.json`, `WebXR/packs/index.json`, `WebXR/shared/pk-packs-data.js`
  (compact literal for the bundles), `WebXR/packs/index.html` (source layout) and `WebXR/packs/flat/index.html`
  (flat bundle layout, copied by the bundler to `WebXR/dist/packs/index.html` with the manifests).
- `WebXR/shared/pk-packs.js` — the registry: `pkPacks(filter?)`, `pkPack(id)`, `pkPackOf(stationId)`,
  `pkPacksAt(world, placeId)`, `pkPathOf(packId)`.
- Packs page: design system (`shared/design.css`), a card per pack (worlds, stations, union chips, path),
  filter by path / audience / union / kind; "SmartCiti.X · Powered by AGI Corp" on every card and the footer; no
  logo file. Linked from the homepage and the instructor console; the parishes menu lists the packs playing in
  the open map.
- `tools/export_pack.mjs <id> [--out DIR]` — one pack alone: its Unity slice (Content/index.json filtered, only its
  stations, programmes and worlds, the Runtime) and its web slice (a catalog.json with only its stations and
  programmes, its manifest and its card page).
- `tools/check_packs.mjs` — every station in ≥1 pack; every pack's stations, programmes, worlds, sites and unions
  resolve; K-12 and union packs separate; page links resolve (both layouts); an exported pack holds only its own
  content; the data module matches the manifests; titles and branding line.

## Seams
- `pkPacks(filter?) -> [pack]`, `pkPack(id) -> pack | null`, `pkPackOf(stationId) -> [pack]` (programme packs first),
  `pkPacksAt(place) -> [pack]` (place = `bayworld` | `underwater` | `summit` | `redwood` | `parishes:<map id>`),
  `pkPathPacks(pathId) -> [pack]` — `WebXR/shared/pk-packs.js`, shapes at the top of the module. `pack` =
  `{ id, kind, title, name, audience, path, alsoPaths, unions, k12Bands, programmes, stations: [{app,id}], version, manifest }`;
  the site ids per world are in the manifest (`WebXR/packs/<id>.json`, `worlds: [{ world, parish?, sites }]`).
- STORYLINE: every `path` is one of `union-trades, k12, first-responders, un-training, disaster-relief, teachers`
  (`roam` carries no pack); `pkPacks({ path })` matches `path` or `alsoPaths`. The parishes menu probes STORYLINE's
  `stChosenPath()` (guarded with `typeof`) to put the chosen path's packs first — the coordinator imports it at merge.
- TYCOON / others: `pkPackOf(stationId)` names the pack a station belongs to.
- Mounted: parishes menu (`#menu-packs` + a "Holodeck Packs" button, bundled into parishes.html), homepage docs list
  (tools/gen_home.mjs, both layouts), instructor console fine print. The bundler copies the flat page
  (`WebXR/packs/flat/index.html`) and the manifests into `WebXR/dist/packs/`, rewrites `../packs/` for the bundles,
  and `python3 tools/bundle_webxr.py --pack <id>` / `node tools/export_unity.mjs --pack <id>` emit one pack alone.

## Results
- 144 packs: 56 programme, 4 K-12, 64 union packages, 20 station libraries; 697/697 catalog stations in a pack.
- Paths (own / with alsoPaths): union-trades 127/127, k12 4/4, first-responders 7/8, un-training 1/1,
  disaster-relief 1/8, teachers 4/8, roam 0/0.
- `check_packs.mjs`: 23,544 checks, ~1 s. Also run green: check_design (176 pages, now including the Packs page in
  both layouts), check_home, check_deploy, check_guide, check_seo, check_imports, check_unity_export.
- eval_worlds (AS_PORT=8986, browser included): before mean 98 (15 subjects, 10 findings), after mean 98 — every subject's score line identical; no finding names PACKS.
