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
- [x] **MOTORPOOL** — handed back 20:06 (4 commits). 70 entries (50 road/site/rail, 20 watercraft) in `drivables-data.js`; 31 new `dv*` builders (17 hulls on one parametric hull), all inside budget, heaviest 44 of 45 meshes; 70 `DV_GATED` items, every station resolved (check_gates 136 items, 0 failed); every entry drives or floats a 20 s headless run deterministically (`check_drivables` 2,049 checks); Motor Pool board in Bay World; `dvMountMotorPool` hook for PARISH. Suite 67/73 at hand-back, browser tail unfinished; singles green. Left: watercraft helm in a world, the parish board mount, re-entering parked drivables.
- [x] **GRIOT** — handed back 19:38. 34 characters across Bay World, Summit, Redwood and the parishes (by site kind);
  258 spoken lines, each re-read verbatim from the Guide's knowledge base, the catalog, the standards or the union
  registry; 123 hand-offs resolved; `grMount()` hook for the parishes; `check_npc.mjs` (15,308 checks) in the suite.
  Suite stopped at 69/89 for the deadline; singles green. Left: Bay World quest hand-offs, the parish mount, voice.
- [x] **SECONDLINE** — handed back 19:52. `sl-parish-play.js`: 5 parishes / 42 sites, a 7-quest arc over 5 connector crossings, 35 gated side games (all 12 mechanics), 42 field lessons, 84 parish treasures (273 platform-wide), 161 NPC hand-offs, 5 path boards; check_gates/treasures/k12 extended, `check_parish_play.mjs` (3,880 checks) in the suite; 112 gated items resolve, 0 failed. Suite 68/89 at the deadline, singles green. Left: binding to `np-data-<parish>.js` once PARISH and DELTA land.
- [x] **TILL** — handed back 20:03 (9 commits). `payments.js` adapter (quote maths, checkout without a provider → null and no request, mock hosted redirect, webhook idempotent by event id, seat provisioning through org.js, invoice SVG marked prototype); `pm-agent.js` pure `pmAgentStep` (never over the ceiling across 60 fills, over-threshold queued for a human, replays idempotent, every decision audited); Billing tab and Budget panel; `workers/payments/handler.mjs` and `workers/passes/handler.mjs` on EDGE's router contract; `pm-membership.js` with Payment Request gating; docs/payments.md; `check_payments.mjs` 13/13 in the suite. Blocked in its worktree by its permission layer: writing the null `levels`/`applePay`/`googlePay`/`wallet` keys into auth-config.json — raised to the owner, not done by the coordinator. Left: the Upgrade view and chip link, the .pkpass zip (tools/briefs/next/till-next.md).
- [x] **EDGE** — handed back 20:13 (8 commits). Root `wrangler.toml` (Pages → WebXR/dist, KV binding with a placeholder id); `workers/edge/router.mjs` (health, auth-config with an organisation's enterprise block from KV, TILL's handlers routed through a table); the bundler's `[edge]` step emitting `_headers` (33 rules: CSP for the named CDN and Mapbox hosts, no-store HTML, immutable vendor and media), `_redirects` (42) and `_routes.json`; `tools/deploy_agent.mjs` (build → gate → provision → deploy → configure → verify → roll back; dry-run by default, credentials by environment name, log at docs/deploy/last-run.md); `tools/deploy_cloudflare.sh`; a gated `deploy-cloudflare.yml`; docs/deploy-cloudflare.md; `check_deploy.mjs` in the suite — 329 checks. Suite 68/80 at the deadline; singles green. Left: the wrangler dry run (npm blocked here), TILL's handlers replacing the two stubs at the gate.

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
