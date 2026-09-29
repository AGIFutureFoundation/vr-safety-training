# PACKS — the SmartCiti.X Powered by AGI Corp Holodeck Packs

Console PACKS (prefix `pk`, port 8986), the Holodeck Packs run. Brief: `tools/briefs/packs-brief.md`.

## Plan (written before code)

A **Holodeck Pack** is one shippable slice of the platform: a manifest that names the stations, programmes,
worlds and sites it plays in, the union(s) it is taught under and the STORYLINE path it belongs to.
Everything is generated from what exists; no station, union or figure is invented.

Pack kinds (each kind is its own set of manifests, `kind` on every manifest):

| kind | one per | source | path |
|---|---|---|---|
| `programme` | union-trade programme in the catalog (`curricula`, not `k12-*`) | `WebXR/smartcity/catalog.json` | mapped table in the generator (`first-responders`, `un-training`, `teachers`, else `union-trades`) |
| `k12` | K-12 track (`k12-*` programme, with its `band`) | catalog | `k12` (also `teachers`) |
| `union` | union in `tools/unions.json` that the platform's text ties to a station (a programme's `union` string or a station's own certification naming its alias), K-12 stations excluded | unions registry + catalog | `union-trades` |
| `library` | catalog category, non-K-12 stations only — the home of the 26 stations no programme lists yet | catalog `categories` | `roam` |

K-12 packs hold only `k12-*` stations and name no union package; union packs hold no `k12-*` station
(the checker holds both). A pack may carry `alsoPaths` (e.g. First Responders also serves Disaster Relief,
K-12 packs also serve Teachers) — secondary, never replacing `path`.

Manifest (`WebXR/packs/<id>.json`, written by `tools/gen_packs.mjs`):
`{ id, kind, title: "SmartCiti.X <Pack name> — Powered by AGI Corp", name, brand, audience, summary,
programmes[], stations[{app,id}], worlds[{world, parish?, sites[]}], unions[], k12Bands[], path, alsoPaths[],
version, generator, provenance }`. Pack ids are `pk-<kind>-<slug>`… no: ids are the programme / union / category
slug with a kind prefix only where two kinds could collide (`union-<id>`, `library-<slug>`); programmes and K-12
tracks keep their programme id. `version` is `1.<stations>.<worlds>` style content version from a stable hash
(deterministic, no timestamps).

Where it plays: a station plays at a site when a world's site data lists it — Bay World (`BAY_SITES`), the Deep
(`DEEP_SITES`), Sierra Summit (`SM_SITES`), Redwood Reach (`RW_SITES`) and the ten parish/district maps
(`NP_PARISHES[].sites`).

Files:
- `tools/gen_packs.mjs` → `WebXR/packs/<id>.json`, `WebXR/packs/index.json`, `WebXR/shared/pk-packs-data.js`
  (compact literal for the bundles), `WebXR/packs/index.html` (source layout) and `WebXR/packs/dist/index.html`
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
- `pkPacks(filter?) -> [pack]`, `pkPack(id) -> pack | null`, `pkPackOf(stationId) -> [pack]` (PACKS, `WebXR/shared/pk-packs.js`),
  plus `pkPacksAt(world, placeId) -> [pack]` for a world's menu. `pack` = `{ id, kind, title, name, audience, path,
  alsoPaths, unions, k12Bands, programmes, stations: [{app,id}], worlds: [{world, parish?, sites}], version }`.
- STORYLINE: every `path` is one of `union-trades, k12, first-responders, un-training, disaster-relief, teachers,
  roam`; `pkPacks({ path })` returns the packs for a chosen path (matches `path` or `alsoPaths`). The parishes menu
  reads `stChosenPath?.()` when present to put that path's packs first.
- TYCOON / others: `pkPackOf(stationId)` names the pack a station belongs to.
- Mounted: parishes menu (`#menu-packs`), homepage docs list, instructor console footer.
