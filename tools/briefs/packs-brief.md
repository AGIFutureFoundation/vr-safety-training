# Holodeck Packs run — "SmartCiti.X Powered by AGI Corp" (one hour, seven consoles)

The worlds become places people live in: water that flows, roads and sidewalks, buildings you cannot walk through,
gravity and crashes, wind in the grass, animals and passers-by, stories that branch by the path a learner picks,
a small economy, and every programme shipped as its own Holodeck Pack.

Read first, in this order: this brief; `docs/consoles/CRESCENT-RUN.md`; `docs/parishes.md`; `docs/evals/crescent-review.md`;
then the files your section names. The parish engine is `WebXR/shared/np-parish.js` (schema, `npHeightAt`, `npWaterAt`),
`np-parishes.js` (the ten maps: five New Orleans parishes, five San Francisco districts), `np-world.js` (the streamed
builder), `WebXR/parishes/js/app.js` (the page). Redwood Reach (`WebXR/redwood/`), Sierra Summit (`WebXR/summit/`) and
Bay World (`WebXR/bayworld/`) are the other open worlds; the kits are `kw-kits.js`, `kit.js`, `props.js`; characters
`npc.js`; drivables `drivables.js`, `drivables-data.js`, `drivables-board.js`; play layer `sl-parish-play.js`,
`side-game-mechanics.js`, `kw-play-data.js`; passport `passport.js`.

## Shared rules (all consoles)

- **Base.** `git log --oneline -1` must show d85a41f or later; if it shows 589f0d8 or anything older, `git reset --hard d85a41f`
  first. Do not fetch or merge origin unless the coordinator messages you that a batch merged. If a command reports ENOSPC, stop
  and hand back.
- **Identity** before the first commit: `git config user.email noreply@anthropic.com && git config user.name Claude`. Every commit
  ends with the two trailer lines in your task. Commit a working increment at least every 20 minutes.
- **Load.** Four cores, seven consoles, and the coordinator's gate. Single checkers only — **never run `tools/check_all.mjs`**
  (the coordinator gates). Headless browser runs one at a time, short. Port = your number below. Temp under
  `$SP/packs/<console>/` (SP=/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad).
- **Prefixes** (the bundler shares one scope): TERRAFORM `tf` (8980), CITYWORKS `cw` (8981), NEWTON `nw` (8982), MENAGERIE `mg`
  (8983), STORYLINE `st` (8984), TYCOON `ty` (8985), PACKS `pk` (8986). New modules are `WebXR/shared/<prefix>-*.js`, new checkers
  `tools/check_<name>.mjs`, added to `tools/check_all.mjs`'s list and to `docs/perf/checkers-baseline.json` (your checker's ms).
- **Budgets hold.** `check_mobile`, `check_fleet`, `check_parishes` (strict engine: meshes and triangles per chunk), `check_budget`.
  Everything new is instanced or merged per chunk, and has a phone tier (fewer or none). Reduced motion gets a still world (no sway,
  no wandering animals, no rain) — follow the existing `prefers-reduced-motion` handling.
- **Facts rule.** No invented figures about real places (no populations, dates, heights, rents of real buildings). Procedural things
  say they are procedural. Safety content is sourced the way the catalog's stations are; crashes and water teach safe practice
  and show no injury or gore; kids' content has no fear framing.
- **Seams.** Write your integration point as an exported function with a documented shape at the top of your module, mount it
  yourself in the parishes app (and one more world if your section says so), and list it in `docs/consoles/<CONSOLE>.md` under
  "Seams". Where you need another console's module that does not exist in your tree, code against the shape named in this brief
  and guard the call (`?.`) — the coordinator merges and closes seams.
- **Evals.** `node tools/eval_worlds.mjs` (ASSAYER's rubric) scores the worlds; run it before and after your work and put both
  scores in your hand-back. New stations score 95+ on `node tools/eval_content.mjs`. Your checker is your proof: every claim in your
  hand-back is a line it prints.
- **Hand-back** within 55 minutes, ≤200 words: commits, counts, eval before/after, the single checkers you ran and their last lines,
  seams, what is left. Write `docs/consoles/memory/<CONSOLE>.md` at each commit and `tools/briefs/next/<console>-next.md` before
  hand-back.

## The seam shapes (code against these)

- Wind (TERRAFORM): `tfWind(t) -> { dir: [x, z], speed, gust }` and `tfWindAt(x, z, t) -> number 0..1`.
- Water (TERRAFORM): `tfWaterDepthAt(parish, x, z) -> metres (0 on land)`, `tfFlowAt(parish, x, z) -> [vx, vz]`.
- Solids (CITYWORKS): `cwColliders(parish, chunkKey) -> [{ min: [x, y, z], max: [x, y, z], kind }]`, `cwSidewalkAt(parish, x, z) -> bool`,
  `cwRoadGraph(parish) -> { nodes, edges: [{ a, b, cls, width }] }`.
- Physics (NEWTON): `nwWorld({ groundAt, colliders, waterDepthAt, flowAt }) -> { addBody, step(dt), bodies }`; avatar hook
  `nwAvatarStep(state, input, dt, world) -> state` (gravity, wading, swimming, pushed by flow, blocked by walls).
- Life (MENAGERIE): `mgMountLife({ three, root, parish, groundAt, sidewalkAt, colliders, pos }) -> { animate(t, dt), counts() }`.
- Paths (STORYLINE): `stPaths()` and `stChosenPath()`; `stQuestsFor(pathId, parishId)`.
- Economy (TYCOON): `tyLedger()`, `tyListings(parishId)`, `tyEarn(stationId)`.
- Packs (PACKS): `pkPacks()`, `pkPack(id)`, `pkPackOf(stationId)`.

## TERRAFORM — water, wind and ground cover (`tf`, 8980)

Lakes, streams and waterways that read as water, not flat blue: rivers and canals as channels cut into the ground with banks
(`npHeightAt` dips under water polygons and river centrelines, gentle for streams, levees respected), a shoreline strip of wet
ground, a flow direction on rivers and streams (`tfFlowAt`, downstream along each river's polyline), animated water (a cheap shader
or vertex scroll, still under reduced motion), small streams and drainage ditches added procedurally where a parish's character
calls for them (wetland, garden, park), with culverts where a road crosses. A shared wind field (`tfWind`, `tfWindAt`) with gusts,
read by grass, bushes, trees, flags and rain. Instanced grass tufts and bushes by district character (none on roads, water or pads),
swaying with the wind; litter and trash (cans, bags, paper, a tyre by a ditch) placed sparsely by district, picked up by the play
layer later (export `tfLitterAt(parish, chunkKey)`). Budgets per chunk and a phone tier. Mount in the parishes app and in Redwood
Reach (its creeks). Checker `check_terraform.mjs`: channels are lower than banks, every river has flow downstream, wind is
deterministic by seed, grass never on road/water/pad, counts inside budget, reduced motion still.

## CITYWORKS — roads, sidewalks and solid buildings (`cw`, 8981)

Roads and sidewalks: the New Orleans parishes gain a road network from the Trade Craft Academy artifact's procedural street fabric
(saved at `$SP/packs/tcacademy/parishes/maps/streets/<fips>.json`: 22071 Orleans, 22051 Jefferson, 22087 St. Bernard, 22075 Plaquemines,
22103 St. Tammany — AUTHORED polylines in local metres around a lat/lng frame origin, classes arterial/collector/local with widths;
they are procedural, NOT the real grid, and the parishes' own `roads` stay the named ones). Project them into each parish's field
with `np-geo.js`, clip to the field, drop what crosses water polygons, thin the locals to the budget, and ship them as a generated
module per parish (`WebXR/shared/cw-streets-<parish>.js`, with a generator `tools/gen_cw_streets.mjs` and the provenance line). Draw
road surfaces with lane lines on arterials, kerbs, sidewalks both sides of collectors and arterials, crosswalks at junctions near
sites, and streetlights along arterials (instanced; lit at night). San Francisco districts get the same from their own `roads`
(sidewalks and kerbs, no imported fabric). Solid buildings: every massing building and every site building has a collider box;
the walk stops at walls (export `cwColliders`) and doors are where the pad faces the road. Checker `check_cityworks.mjs`: every
street vertex inside the field and off open water, road graph connected per parish (report components), sidewalks never on water,
colliders cover every building, budgets per chunk.

## NEWTON — gravity, crashes and water reactions (`nw`, 8982)

A small deterministic physics module (`nw-physics.js`): fixed-step integration, gravity, ground contact from `groundAt`, AABB
collisions against `cwColliders`-shaped boxes, impulses and restitution, sleeping bodies. The avatar: falls when it walks off an edge,
cannot pass through walls, wades (slower, splash ring) in shallow water, swims (surface bob, slower, breath meter only as a
readiness cue) in deep water, and is carried a little by `tfFlowAt`. Vehicles: MOTORPOOL's drivables in the parishes gain a
drive mode on this physics (`drivables.js` has the builders and the gate contract — a vehicle drives only after its pre-trip
station, as today), with crash response: a collision above a speed threshold stops the vehicle, dents it (a vertex offset or a
damaged-state material), sets hazard lights on, and opens a short, sourced "after a collision" safety card (secure the scene, check
people, call it in) drawn from an existing catalog station; no injury is ever shown. Parked cars and a few props (cones, barrels,
the litter) are dynamic bodies that tumble when hit. Mount in the parishes app (drive mode behind the Motor Pool board). Checker
`check_newton.mjs`: a body dropped from height lands on the ground at the right time, never tunnels through a wall at speed,
buoyancy holds a swimmer at the surface, a crash above threshold triggers the card and below it does not, determinism across runs.

## MENAGERIE — animals, pets and passers-by (`mg`, 8983)

Life on the streets: random pets and animals by region and district — dogs (some on leads with a walker), cats on porches, pigeons,
gulls at the waterfront, pelicans and egrets over New Orleans water, a heron in the wetland, squirrels in the parks, sea lions at the
San Francisco waterfront, a stray chicken in a garden district — schematic bodies (a few boxes and cylinders, instanced per kind),
wander/graze/flee behaviours (flee from the avatar and from vehicles, settle again), flocks that lift and land, day and night
routines (fewer at night, cats more). Passers-by: ambient pedestrians on sidewalks (use `cwSidewalkAt` when present, else the road
edges), crossing at crosswalks, waiting at transit stops, a few joggers and cyclists; GRIOT's named characters stay the ones who
talk — passers-by nod and step aside. Seeded and deterministic, budgets per chunk, a phone tier, a still world under reduced motion.
Mount in the parishes app and Bay World. Checker `check_menagerie.mjs`: counts by kind per map inside budget, no animal on open water
unless it swims or flies, flee distance honoured, determinism, reduced motion places none moving.

## STORYLINE — pick your own adventure (`st`, 8984)

Paths: at a world's start (and from the menu) the learner picks a path — Union Trades, K-12, First Responders, UN Training,
Disaster Relief, Teachers, or Just Roam — stored in the passport (`stChosenPath`). Each path reshapes the world lightly: which site
boards glow, which characters greet you first, which side quests are offered, which kiosks count. Build the path registry from what
exists (the catalog's programmes and audiences, the first-responder and UN/WHO programmes, the K-12 programmes and BAYOU's lessons,
teacher-facing flows) — no new stations unless a path has none. Side stories: for each path and parish, two or three short side
stories told through GRIOT characters (one sourced line each, a hand-off, a choice with two branches that both teach safe practice)
chaining existing stations, KREWE kiosks, BAYOU lessons and field lessons; branches remembered. "Just Roam" turns the prompts off and
leaves the world open. Mount the path picker in the parishes app and on the homepage's world card (a small chip). Checker
`check_storyline.mjs`: every path resolves to real programmes, stations, characters and kiosks; every branch ends at a station or a
lesson; no path is empty; the chosen path survives a reload.

## TYCOON — businesses and properties, like a life sim (`ty`, 8985)

A small play economy in the passport, in its own play currency ("Crew Credits"), separate from real billing (TILL's payments):
the learner earns credits for completed training shifts (a station pass pays by level, via `tyEarn`), rents a room or a shop from
listings on parish sites (generic procedural buildings, never a real address or rent), opens a small business from a short list
tied to the trades (a food truck, a tool rental, a bike repair stand, a corner shop, a boat charter where there is water) that earns
per visit while the learner trains, pays rent weekly in play time, and can hire GRIOT-style crew who unlock by completed stations.
Upkeep and a simple safety inspection (the business's own sourced checklist from an existing station) keep it open. Ledger UI in the
parishes menu, a sign on the rented building, and the passport records it. No real money, no loot boxes, no purchase flow.
Checker `check_tycoon.mjs`: earn/spend arithmetic balances, no listing names a real address or figure, every business ties to a real
station, the ledger survives a reload, and nothing in TYCOON touches `workers/payments` or billing.

## PACKS — the SmartCiti.X Powered by AGI Corp Holodeck Packs (`pk`, 8986)

Every programme, union package and K-12 track becomes its own Holodeck Pack: a manifest per pack (`WebXR/packs/<id>.json` generated
by `tools/gen_packs.mjs` from the catalog: id, title "SmartCiti.X <Pack name> — Powered by AGI Corp", audience, programmes, stations,
worlds and sites where it plays, union(s) from the unions registry, K-12 bands, the path it belongs to for STORYLINE, a version),
a registry module `pk-packs.js` (`pkPacks`, `pkPack`, `pkPackOf`), a Packs page (`WebXR/packs/index.html`, the design system, one card
per pack with its worlds and stations, filter by path/audience/union) linked from the homepage and the instructor console, and a
per-pack export (the Unity export and the bundler can emit one pack's content alone — `tools/export_pack.mjs <id>`). Branding line
"SmartCiti.X · Powered by AGI Corp" in the pack cards and the page footer; no logo files invented. Also: ship the run's shared brief
by committing a copy of this file as `tools/briefs/packs-brief.md`. Checker `check_packs.mjs`: every station belongs to at least one
pack, every pack's stations and worlds resolve, K-12 and union packs are separate modules, the page links resolve, an exported pack
contains only its own content.
