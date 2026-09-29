# HARVEST — hidden, regional and seasonal activities (`hv`, 9005)

Module: `WebXR/shared/hv-harvest.js` (data, pure logic and the parish mount in one file). Checker: `tools/check_harvest.mjs`.

## What it adds

- **Hidden spots by the water** on every parish-engine map with fishable water: procedural placement (a bank, a levee
  path, a pier, a beach) on dry ground beside a lake, bayou, canal, river, the Gulf, the Bay or the Pacific shore, off
  every road; each shows as a hand-painted sign post (one InstancedMesh for the map) and is **found** by walking within
  `HV_FIND_RADIUS` of it (a toast, remembered in this browser).
- **Activities**, each a short step game in `side-game-mechanics.js`' step shape (`{ board, prompt, options: [{ text, safe }] }`,
  one right move per step), each teaching one line:
  - **fish** — pick the rod or pole that fits the spot (cane pole, spinning rod, surf rod), life jacket and footing, the
    bait the water's fish take, look behind before casting, reel with the drag, wet hands and pliers for the release;
    the catch is a real regional species of that water (New Orleans river, brackish lake, bayou, canal and Gulf species;
    Bay, Pacific-shore and Bay Area lake species), logged and added to the album, released;
  - **crab** — a crab line from a pier, dock or bank (blue crab in New Orleans; Dungeness and red rock crab in the Bay);
  - **crawfish** and **rice** — on a procedural rice field beside a bayou or marsh on the rural New Orleans maps; the
    rice stage follows the play season (flood and plant, tend, drain and harvest) and the rice–crawfish rotation is
    taught as the general practice it is;
  - **gator** — for everyone by default, **gator watch** (distance, never feed, tell a grown-up and call the agency);
    for signed-in adults off the K-12 path who confirm they are adult learners, **alligator season** framed around
    licensed hunters and wildlife agents: licence and tags per the agency's current rules, boat check, hook safety,
    nuisance calls handled by the agency. Non-graphic throughout.
- **Lines** (`HV_LINES`): each names its source (LSU AgCenter for the rice–crawfish rotation, OSHA's heat campaign for
  the field heat line) or is general practice without figures. No regulation, season, limit, size or date appears
  anywhere: "seasons, licences and limits are set by {agency}; check the current rules" with the real agency
  (Louisiana Department of Wildlife and Fisheries / California Department of Fish and Wildlife).
- **The play calendar** (`hvSeasonAt(ms)`): one play season per TYCOON week (`TY_DAY_SECONDS` × 7), deterministic in
  ms, labelled as a game cycle and not the real season; activities come in and out (`HV_OPEN`). ATMOS' time of day
  (`AT_BUCKET_HOUR` via the app's time bucket, `atBand`) tilts the catch toward night-biting fish at dusk and night.
- **Rewards**: a clean run pays Crew Credits once per spot and activity through TYCOON's `tyEarn`
  (`recordId: hv:<spot>:<activity>`); replays add log and album entries only. Nothing blocks training.

## Seams

- `hvMount({ THREE, root, parish, el, pos, toast, heightAt, hour })` — mounted once in `WebXR/parishes/js/app.js` into
  `menu-harvest` (Play tab; listed in `tools/check_interface.mjs`), exposed as `window.__parishTest.harvest`.
- `hvSpotsFor(parish)`, `hvSeasonAt(ms)`, `hvActivityOpen(a, season)`, `hvGameSteps(spot, a, opts)`, `hvCatch(spot, opts)`,
  `hvFinish(spot, a, moves, opts)`, `hvAdultAllowed({ profileKind, path, confirmed })` — pure, headless.
- Reads: `np-parish.js` (water, roads), `tf-terraform.js` (`tfWaterDepthAt`), `ty-economy.js` (`tyEarn`), `at-atmos.js`
  (`atBand`), `profiles.js` (`gtProfile`), `st-paths.js` (`stChosenPath`). Data is plain and dependency-free for BRIDGE.

## Cycles

1. Reason: spots must land on dry ground beside water and off roads on every map → Act: `hvSpotsFor` (boundary walk,
   8-way land probe, round-robin per water, spacing) → Observe: 94 spots on 20 maps in ≤ 130 ms per map; Bay marsh
   spots had no activity → dropped.
2. Reason: one activity end to end (find, play, log, pay once) proven by a checker → Act: fishing game, catch, log,
   album, `tyEarn` once; `tools/check_harvest.mjs` → Observe: clean run 100 % pays, second run pays nothing, unsafe run
   scores 0 and catches nothing.
3. Reason: widen to crab, crawfish, rice, gator watch / adult gator with the adult gate → Act: step games, `hvAdultAllowed`
   → Observe: checker flagged "kill-switch" as graphic wording → reworded to "engine cut-off lanyard"; 71/71 pass.
4. Reason: mount in the parishes app's Play tab without breaking the menu → Act: one import, one mount, `menu-harvest`
   in the Play panel and in check_interface's list, the bundler's parishes list → Observe: check_interface OK 21/21, no
   page errors.
