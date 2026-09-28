# Crescent run — tracking page

Two hours from 18:44 UTC on 2026-09-28, seven consoles, brief `tools/briefs/crescent-brief.md`, charter
`docs/agents/organization.md`. The coordinator updates this page at each heartbeat (19:15, 19:45, 20:16, 20:46 UTC).
Report page with video: the "Crescent Run" artifact.

## Consoles
- [x] **PARISH** — handed back 19:33. The parish engine (`np-geo.js`, `np-parish.js`, `np-world.js`, `np-parishes.js`),
  `WebXR/parishes/`, Orleans: 14 sites, 34 roads, 16 districts, 18 landmarks, 10 water, 9 levees, 6 connectors, 6 field
  lessons, 2 gated; `check_parishes.mjs` 1412/0; worst chunk 171 meshes / 70,083 tri of a 260 / 400,000 budget. Suite not
  finished (load 36); singles green. Left: connectors paired once DELTA lands, Atlas and Guide entries, richer massing.
- [ ] **DELTA** — running. `check_parish_data.mjs` committed and in `check_all`.
- [ ] **MOTORPOOL** — running. Registry of 70 drivables committed; the board reads in Bay World.
- [x] **GRIOT** — handed back 19:38. 34 characters across Bay World, Summit, Redwood and the parishes (by site kind);
  258 spoken lines, each re-read verbatim from the Guide's knowledge base, the catalog, the standards or the union
  registry; 123 hand-offs resolved; `grMount()` hook for the parishes; `check_npc.mjs` (15,308 checks) in the suite.
  Suite stopped at 69/89 for the deadline; singles green. Left: Bay World quest hand-offs, the parish mount, voice.
- [x] **SECONDLINE** — handed back 19:52. `sl-parish-play.js`: 5 parishes / 42 sites, a 7-quest arc over 5 connector crossings, 35 gated side games (all 12 mechanics), 42 field lessons, 84 parish treasures (273 platform-wide), 161 NPC hand-offs, 5 path boards; check_gates/treasures/k12 extended, `check_parish_play.mjs` (3,880 checks) in the suite; 112 gated items resolve, 0 failed. Suite 68/89 at the deadline, singles green. Left: binding to `np-data-<parish>.js` once PARISH and DELTA land.
- [ ] **TILL** — running. Five increments; scope widened to the budget agent, then to membership levels with Apple Pay,
  Google Pay and Wallet passes.
- [ ] **EDGE** — running. Four increments; scope widened to the deploy agent.

## Merges through the gate
- (none yet) — the first batch goes once the box's load allows a regeneration and a full suite; PARISH and GRIOT wait
  for it.

## Decisions
- 18:45 Seven consoles, one parish schema printed in the brief so PARISH, DELTA and SECONDLINE could work apart.
- 19:05 TILL and EDGE widened to the owner's agentic tracks (a budget-managing payments agent; a deploy agent).
- 19:25 No merge at heartbeat 1: hand-backs due from ~20:15; merging increments would have cost a suite each.
- 19:30 GitHub Issues are disabled on the repository; this page and the report carry the tracking.
- 19:36 Membership levels with Apple Pay, Google Pay and Wallet passes assigned to TILL; individual membership is the one
  purchase a person can make, in-game items never; merchant and issuer details only from a deployment's configuration.
