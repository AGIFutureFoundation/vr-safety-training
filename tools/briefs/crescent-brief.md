# Crescent brief — the two-hour New Orleans parishes run

Binds seven consoles: PARISH, DELTA, MOTORPOOL, GRIOT, SECONDLINE, TILL and EDGE. The shared rules of
`tools/briefs/console-brief.md`, `tools/briefs/frontier-brief.md` (facts, bundler, links, memory, metaprompting, gate
contract) and the Holodeck brief's machine rules still bind every console; this brief adds only what follows.

## Shared rules (all consoles)
- Read, in order: `tools/briefs/console-brief.md`, `tools/briefs/frontier-brief.md`, `tools/briefs/mapbox-brief.md`,
  `docs/consoles/memory/SUMMIT-3.md` (how a 4096 m streamed world is built here), `docs/consoles/memory/CARTOGRAPHER.md`
  (maps, fleets, avatars), and your section below. Plan in your console log `docs/consoles/<CONSOLE>.md` before code.
- **Your tree.** Your worktree starts at the coordinator's current tree, which is *ahead of origin* (the Holodeck batch
  and its repairs are committed locally and push once the suite passes). Do **not** fetch or merge origin on your own;
  when the coordinator tells you a batch has merged, run
  `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge origin/claude/vr-ar-safety-training-wkwmve` and resolve
  conflicts by keeping both sides, then `node --check` / `python3 -m py_compile` every file the merge touched.
- **Identity.** Before your first commit: `git config user.email noreply@anthropic.com && git config user.name Claude`
  in your worktree. Never commit under any other address. End every commit message with the two trailer lines in your task.
- **Machine.** Four cores shared by seven consoles and a merge gate. Single checkers while you work; the full
  `node tools/check_all.mjs` at most once, at the end (it takes 25–40 minutes under load — start it by minute 70). Never
  `pkill -f`/`killall`; kill only PIDs you started. Serve your worktree's `WebXR/` on your own port: PARISH 8990,
  DELTA 8991, MOTORPOOL 8992, GRIOT 8993, SECONDLINE 8994, TILL 8995, EDGE 8996; stop it when done. Temp files under
  `$SP/crescent/<console>/` where `SP=/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad`.
- **Bundler.** `tools/bundle_webxr.py` concatenates modules into one scope and erases import aliases: prefix every new
  top-level name with your prefix — PARISH `np`, DELTA `nd`, MOTORPOOL `dv`, GRIOT `gr`, SECONDLINE `sl`, TILL `pm`,
  EDGE `cf`. Shared chrome modules must not spell `THREE.` (take the library from the caller under another name). A module
  every app imports must be in every app's module list *before* the module that imports it (the bundler refuses otherwise).
- **Facts rule for New Orleans.** Real places are named only by their public names (a parish, a neighbourhood, a bridge,
  a park, a port, a university, a stadium district) as *places*; no invented history, dates, statistics, populations,
  addresses or business names; no brands or logos. Coordinates are approximate (three decimals, `approximate: true`) and
  exist only to place a map; nothing is presented as survey data. Satellite imagery and geocoding come only from Mapbox,
  only when a viewer supplies a token (`WebXR/shared/mapbox.js`, `docs/mapbox.md`); the platform ships no token and makes no
  network request without one; every page works in the procedural / SVG fallback.
- **Safety and money.** No violence, no gambling, no loot boxes, no learner purchases. The only money in the platform is
  the enterprise seat billing TILL builds for organisations; it shows no invented prices (amounts are configuration).
- **Memory and next brief.** Update `docs/consoles/memory/<CONSOLE>.md` at every commit; before hand-back write
  `tools/briefs/next/<console>-next.md` with measured numbers.
- **Cadence.** The coordinator merges every thirty minutes and reports with a video; commit a working increment before
  each half hour. Hand back within 100 minutes with ≤200 words: commits, counts, the exact final `check_all` line (or
  which single checkers you ran if the suite did not finish), what is left.

## Shared data contract — a parish map (PARISH implements the engine; DELTA and SECONDLINE write to this shape)
Each parish is one 4096 × 4096 m streamed world (256 m chunks like Summit) in `WebXR/shared/np-data-<parish>.js`:
```
export const NP_<PARISH> = {
  id, name, size: 4096,
  anchors: [{ xz: [x, z], lonlat: [lon, lat], approximate: true, name }],        // 6–10; np-geo.js fits an affine
  water: [{ id, kind: "river"|"lake"|"canal"|"bayou"|"wetland"|"gulf", poly: [[x, z]…], width? }],
  levees: [{ id, pts: [[x, z]…], height }],
  roads: [{ id, kind: "interstate"|"avenue"|"street"|"riverroad"|"bridge"|"causeway"|"ferry", pts: [[x, z]…] }],
  districts: [{ id, name, poly: [[x, z]…], character: "quarter"|"garden"|"industrial"|"suburb"|"port"|"wetland"|"refinery"|"campus" }],
  sites:     [{ id, name, kind, position: [x, z], trades: [unionId…], programmes: [programmeId…], stations: [stationId…] }],
  landmarks: [{ id, name, position: [x, z], kind }],
  connectors: [{ id, kind: "bridge"|"causeway"|"ferry"|"road", from: { parish, position }, to: { parish, position }, name }],
  fieldLessons: [ /* RW_FIELD_LESSONS shape: id (-fl-), title, site, landmark?, k12, trade, tradeLine, minutes 2–4, steps[3], check { q, options, answer, why } */ ],
  gated: [ /* the gate contract: id, kind, title, site, gate { stations?, programmes?, quests?, k12?, note } */ ],
};
```
`WebXR/shared/np-geo.js` (pure): `npToGeo(parish, [x, z])`, `npGeoToXz(parish, [lon, lat])`, `npBounds(parish)`; a
connector's two ends must project within 1 km of each other in lon/lat. `sites[].stations` name existing catalog
stations only (`WebXR/smartcity/catalog.json`); a site with no fitting station gets at most one new station, eval 95+.

## PARISH — the parish world engine and Orleans Parish
`WebXR/parishes/` (page `parishes.html?parish=orleans`, bundle out `parishes.html`): flat delta terrain with levees, the
river's bend, the lake shore, canals and wetlands; streamed 256 m chunks with LOD; a road network drawn from the data;
district character by block massing (a quarter's low blocks and galleries, a garden district's houses and live oaks,
industrial sheds, port cranes on the river) — all procedural, no real building is modelled; Mapbox satellite ground per
parish when a token exists (`bayGroundTexture`'s pattern, per parish bounds); day/night, weather, wildlife that fit
(egrets, pelicans, herons through `wildlife.js`). Orleans Parish first: its data module with 10+ sites (port terminal,
levee and floodwall crews, a pumping station, a streetcar barn, a rail yard, a hospital district, a university campus, a
stadium district, a hospitality row, a wetlands restoration site) whose job boards open existing stations by trade. The
parish selector, HUD map with the districts and connectors, the passport round trip, Home and the Guide on every page,
`WebXR/shared/links.js` entries, the bundler module list, the home generator's world card, `tools/check_parishes.mjs`
in `check_all` (every parish's data validates, terrain builds headless within the mobile mesh budget, every road and
site on ground, every connector's ends project within 1 km, every station id resolves). Coordinate with DELTA on the
schema in the first ten minutes (a note in both console logs).

## DELTA — four more parishes on PARISH's schema, connected
Data modules for Jefferson (Metairie and the airport side, the west bank, the river bridges), St. Bernard (the river
road, a refinery corridor, the battlefield park, the wetlands), Plaquemines (the river road south, a marine and delta
world, the last road), St. Tammany (the north shore across the causeway: Slidell, Mandeville, Covington, the piney
woods) — each a 4096 m map with water, levees, roads, districts, 8+ sites with real stations by trade, landmarks,
anchors, and connectors to its neighbours (the causeway, the river bridges, a ferry). A `docs/parishes.md` map of how
the five connect. Validate every module with PARISH's checker as it lands (write your own `nd` validator first if the
engine is not there yet, then hand it to PARISH's checker). Satellite anchors per parish; nothing invented.

## MOTORPOOL — 50 drivable vehicles and 20 watercraft
`WebXR/shared/drivables.js`: a registry of 50 road and site vehicles (crew pickups, bucket and digger derricks, dump and
water trucks, tractor-trailer, flatbed, forklift classes, yard hostler, sweeper, ambulance, fire engine and ladder,
transit bus, school bus, streetcar, rail switcher, loaders, excavators, graders, telehandler, boom and scissor lifts,
concrete mixer, utility vans …) and 20 watercraft (pilot boat, tug, push boat with barges, crew boat, skiff, airboat,
dredge tender, fireboat, patrol boat, ferry, shrimp trawler, oyster lugger, sailing dinghy, pontoon, kayak, research
vessel, buoy tender, work barge, lift boat, bay shrimper), each with the kit builder (`fleet.js` patterns; instanced,
inside budget), the drive or helm profile (the Bay World drive engine `WebXR/bayworld/js/sim.js` and the Regatta's
water model), the union trades that operate it, the stations that qualify a learner (a vehicle is *available* to drive
after its pre-trip / pre-departure station: the gate contract), and a pre-trip checklist step. A "Motor Pool" board in
Bay World and in the parishes lists them; `tools/check_drivables.mjs` in `check_all` (70 entries, every builder renders
headless inside its mesh budget, every gate id resolves, each drives or floats a scripted 20 s headless run clean).

## GRIOT — NPC characters with agents that pass knowledge along
`WebXR/shared/npc.js`: a roster of characters (journeyworkers, foremen, a levee inspector, a pilot, a K-12 teacher, a
ranger, a nurse, a stagehand, a chef …) with procedural figures from the crew avatar space (`crew.js`), placed at sites
with routines (walk between two points, work a station's pad, break); each carries a knowledge pack drawn only from
the Guide's knowledge base chunks (`WebXR/shared/guide-kb.js`), the registries (`tools/unions.json`,
`tools/standards.json`) and the station text — never invented; a dialogue engine on the Guide's retrieval (deterministic,
on-device) with three moves: greet, teach one line with its source, hand off (open a station, a field lesson, a side
quest or a treasure hint); an agent adapter in the `agent-protocols.js` shape so a deployment can point a character at a
model later (nothing contacted now). Mount in Bay World, Summit, Redwood and the parishes through a small hook each.
`tools/check_npc.mjs` in `check_all`: every line has a source that re-reads verbatim, every hand-off id resolves, no
character blocks a door or a pad, the dialogue renders headless on a phone.

## SECONDLINE — gamify the parishes: quests, gates, treasures, field lessons
Across the five parishes on the shared schema: a main quest arc that crosses parishes over the connectors (a storm season
readiness story: levee walk, pump station, port, hospital, north-shore staging), 25+ side quests and games behind union
skills (the gate contract and the twelve mechanics in `side-game-mechanics.js`), 40+ treasures and eggs in the treasure
ledger format (`gen_treasures.mjs`'s surfaces), 25+ field lessons on the RW shape tied to Cognition.X K-12 stations and
the trade that uses the idea, a "choose your path" board (trade, classroom, or just play) at every parish gate; NPC
hand-offs coordinated with GRIOT (a note in both logs). Extend `check_gates.mjs`, `check_treasures.mjs` and
`check_k12.mjs` so the parishes are covered; every id resolves.

## TILL — payments for the main platform: enterprise seat billing
On the organisation layer (`WebXR/shared/org.js`, `docs/enterprise.md`): plans as configuration (`auth-config.json`
`payments` block: provider name, publishable key `null`, currency, plan ids; no amounts in code — a plan's amount is
whatever the block says, shown as configured), seats per cohort, a provider-agnostic `WebXR/shared/payments.js`
adapter (`describe()`, `quote(plan, seats)`, `checkout(quote) → hosted redirect stub`, `webhook(event)`, `status(receipt)`)
with a mock provider that never leaves the device, a billing tab in the instructor console (seats used / licensed,
invoices as procedural SVG marked "prototype — not an invoice", the audit log entries), a webhook handler module a Worker
can import (`workers/payments/handler.mjs`: signature check against a placeholder secret from the environment, idempotent
receipts), `docs/payments.md`. No learner ever buys anything; no key or secret committed (`check_payments.mjs` in
`check_all` asserts it, plus: quote maths, checkout without a provider returns null with no request, webhook idempotency,
the billing tab renders with sample data, the enterprise block honoured).

## EDGE — Cloudflare for the platform
The flat build `WebXR/dist/` is what deploys. Add `wrangler.toml` (Pages project for `WebXR/dist`, a Worker for
`/api/*`: the payments webhook route importing TILL's handler, an `auth-config` route that can inject an organisation's
enterprise block at the edge from a KV namespace, health), `WebXR/dist/_headers` and `_redirects` generated by
`tools/bundle_webxr.py` (cache-immutable the hashed or large bundles, HTML no-store, security headers that still allow
cdnjs and Mapbox hosts named in the code), `tools/deploy_cloudflare.sh` (dry-run by default; account id and token only
from the environment; prints the commands), a GitHub Actions workflow `.github/workflows/deploy-cloudflare.yml` gated
on the suite and on secrets being present, `docs/deploy-cloudflare.md` (setup, custom domain, preview branches, what the
free tier holds), `tools/check_deploy.mjs` in `check_all` (config parses, every header path exists, no secret or
account id anywhere, the worker's routes match the handler's exports, `wrangler` dry run when installed else skipped
with a note). Nothing is deployed from this machine.
