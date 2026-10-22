# Bayou & Golden brief — the ninety-minute follow-on run

Binds five consoles: ASSAYER, BAYOU, KREWE, GOLDEN-A and GOLDEN-B. The shared rules of `tools/briefs/console-brief.md`,
`tools/briefs/frontier-brief.md`, `tools/briefs/crescent-brief.md` (the Facts rule for real places, the parish schema,
machine and identity rules) and `docs/agents/organization.md` (how consoles work as a team) bind every console; this
brief adds only what follows.

## What the tree holds (read before planning)
The Crescent run merged seven consoles through one gate: the parish engine and five New Orleans parishes
(`WebXR/parishes/`, `WebXR/shared/np-*.js`, `docs/parishes.md`), a play layer (`WebXR/shared/sl-parish-play.js`,
`docs/parish-play.md`), 70 drivables (`drivables.js`, `drivables-data.js`), NPC characters (`npc.js`, `docs/npc.md`
if present, else `docs/consoles/GRIOT.md`), seat billing and membership (`payments.js`, `pm-*.js`, `docs/payments.md`),
Cloudflare configuration (`wrangler.toml`, `workers/`, `tools/deploy_agent.mjs`). Read `docs/consoles/CRESCENT-RUN.md`
for each console's hand-back and what it left, and `tools/briefs/next/*-next.md` for their next-phase briefs — those are
your tickets where they overlap your section.

## Shared rules (all consoles)
- Your worktree starts at the coordinator's tree. Do not fetch or merge origin unless the coordinator says a batch merged;
  then `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge origin/claude/vr-ar-safety-training-wkwmve`, keep
  both sides, and check every touched `.js` in module goal (`cp f.js /tmp/x.mjs && node --check /tmp/x.mjs`).
- Identity before the first commit: `git config user.email noreply@anthropic.com && git config user.name Claude`. Every
  commit ends with the two trailer lines in your task.
- Four cores, five consoles, a gate. Single checkers while you work; the full suite at most once, started by minute 60,
  and **stop it yourself at hand-back if it has not finished** (only your own PID). Ports: ASSAYER 8990, BAYOU 8991,
  KREWE 8992, GOLDEN-A 8993, GOLDEN-B 8994. Temp files under `$SP/bayou/<console>/`.
- Prefixes (the bundler shares one scope): ASSAYER `as`, BAYOU `by`, KREWE `kw`, GOLDEN-A `sf`, GOLDEN-B `sg`.
- **Kids.** Lessons for children read at their age band (check_k12's reading ceilings), one idea per step, no fear
  framing of storms or floods (readiness, teamwork, who helps), no invented facts about places or history: a place is
  named, not described with figures; "your parish", "the levee near you" are fine. Cognition.X flow structure:
  `WebXR/flows/` (read two existing flows first) — a flow is steps with a check and a hand-off; an agent (a GRIOT
  character) can drive a flow.
- **Evals.** New stations score 95+ on `node tools/eval_content.mjs`; world work is scored by its checker; ASSAYER's
  review rubric applies to everything (see below) and every console reads `docs/evals/crescent-review.md` when ASSAYER
  publishes it (minute 25) and fixes its own findings.
- Memory and next brief as always; hand back within 75 minutes with ≤200 words: commits, counts, the single checkers
  you ran (or the suite's last line if it finished), what is left.

## ASSAYER — review the new worlds with evals; bring the four parishes onto the engine
1. **Review rubric and pass.** `tools/eval_worlds.mjs`: for each parish, the Motor Pool, the characters, the play layer,
   billing and the deploy plan, score 0–100 on: it loads without a page error at 1280×720 and 360×640; the first minute
   is legible (where am I, what can I do); every board, kiosk and chip resolves; a lesson or game can be completed
   headless; frame budget holds; no invented fact (grep for digits in names and lesson text, place descriptions). Write
   `docs/evals/crescent-review.md` by minute 25 with the scores, the ten worst findings and who owns each (console name);
   the other consoles read it and fix theirs. Re-score at hand-back.
2. **The four parishes onto the engine.** `tools/check_parishes.mjs` defers 28 engine-geometry findings for Jefferson,
   St. Bernard, Plaquemines and St. Tammany (landmarks on water, water beds above the water line, roads sampling wet,
   anchors over ten, the stylised scale outside one half to six metres per metre). Fix each parish's data so it passes
   strict, then add it to `NP_ENGINE_STRICT` in the checker; a parish drawn at ten real metres per metre is a decision to
   record in `docs/parishes.md` (and the checker's scale rule then takes a per-parish `scale` field), not a fault to hide.
3. **Mounts left by Crescent.** GRIOT's `grMount("parish:<id>", …)` hook and MOTORPOOL's `dvMountMotorPool` board in the
   parishes app (read their next briefs); TILL's Upgrade view reached from the account chip if `pm-membership.js` has it
   ready and it is a small mount. `check_npc`, `check_drivables`, `check_payments` stay green.

## BAYOU — lessons for New Orleans kids, taught as they play
1. Twelve or more K-12 stations local to the parishes (the SCHOLAR station generator and `tools/briefs/k12-brief.md`):
   how a levee holds water back; what a pump station does when it rains; wetlands as a storm's speed bump; the river's
   current and a pilot's job; a hurricane readiness plan a family makes together (who helps, what to pack, where to go);
   the water cycle from the lake to the tap; a streetcar's schedule as a timetable; a ferry's timetable and tides; a
   shrimp boat's catch and a fair count; reading a flood map's colours; the port's containers as sorting; measuring a
   floodwall in steps — each anchored at a real parish site, eval 95+, age band set, reading ceiling held.
2. Flows on the Cognition.X structure under `WebXR/flows/`: one flow per station (steps, a check question, a hand-off
   to a parish site's game or a trade station), and a `by-flow-agent.js` that lets a GRIOT character drive a flow
   (greet, step, check, hand off) on device.
3. "Teach as they play": each lesson has a two-minute apply-step in the parish — a mini-game on the twelve shared
   mechanics or a KREWE kiosk — that uses the idea just taught; the passport records both.
4. Extend `check_k12.mjs` for the parish lessons and flows; every id resolves; reading levels hold.

## KREWE — populate the parishes with assets and gamified quests
1. Procedural kits inside the mobile budget (`kit.js` / `props.js` patterns, credited if imported): a streetcar, a pump
   station house with its discharge pipes, a levee wall section and a floodgate, a shrimp boat and an oyster lugger (or
   MOTORPOOL's hulls), a shotgun-house block character, live oaks with root buttresses, a bandstand, a parade route
   barrier set, a ferry landing. Place them by district character in every parish; `check_fleet`/`check_mobile` hold.
2. Interactive kiosks and mini-games at the sites: sandbag relay (a MOTORPOOL drivable delivers), pump start-up order,
   floodgate close-out checklist, container sort at the port, ferry line-up — each scored on safe practice, each behind
   a union station (the gate contract), each rewarding a cosmetic or a stamp. GRIOT characters stand at them (use the
   parish hook once ASSAYER mounts it; until then write against `grMount`'s documented shape).
3. Ten side quests that chain a K-12 lesson (BAYOU's ids; coordinate in both logs by minute 15) with a union station
   and a mini-game. Extend `check_parish_play.mjs` or add `check_krewe.mjs` to `check_all`.

## GOLDEN-A — San Francisco on the engine: regions, hills, three districts
1. Generalise the parish engine to **regions** without breaking the parishes: `np-parishes.js` groups maps by region
   (`region: "new-orleans" | "san-francisco"`), the selector shows regions then maps, the page title follows; the schema
   gains `hills: [{ id, name, center: [x, z], radius, height }]` and `npHeightAt` adds them over the flat field so a
   district can rise (Twin Peaks, Nob Hill, Russian Hill, Telegraph Hill, Bernal Heights as gentle procedural mounds —
   names only, no elevations quoted); the ground texture and Mapbox satellite per map as before.
2. Three districts as 4096 m maps on the schema: Downtown & Embarcadero (the port, the ferry building as a place, a
   transit hub, a hospital, a union hall), Mission & SoMa (a rail yard, a construction site, a school campus, a
   stadium district, a maker workshop), Golden Gate Park with the Richmond and Sunset (park crews, a windmill as a
   landmark, an ocean beach lifeguard station, a hospital, a university campus). 8+ sites each with real stations by
   trade, landmarks, anchors, water (the bay, the ocean, the lake in the park), hills, connectors to the other districts.
3. `check_parishes.mjs` covers regions and hills; `check_parish_data.mjs` accepts the region field.

## GOLDEN-B — two more districts, the bridges, and the way to Bay World
1. Marina & Presidio (a marina and yacht harbour, the Presidio as a park with a crew yard, a coast guard-style station
   named as a place, the Golden Gate Bridge as a bridge landmark and a connector "way out" north with no map beyond it
   yet) and Bayview & Hunters Point (the shipyard site, the C.L.E.A.R. clean-up programme's sites — read
   `docs/consoles/CLEARWATER.md` and the Hunters Point track page — a rail yard, a recreation centre, a wetlands
   restoration site, the port's southern terminals). 8+ sites each, connectors to GOLDEN-A's districts (agree ids and
   lonlats in both logs by minute 15; the coordinator reconciles at the first heartbeat).
2. **The Bay Bridge to Bay World.** A connector kind `world` whose far end is another world's page
   (`bayworld.html?site=<west-oakland-site>`): the parishes app draws it as a way out and hands the learner across with
   the passport; Bay World's Atlas and map gain the way back (`parishes.html?parish=sf-downtown`). `check_links` and
   `check_parishes` cover it.
3. SF field lessons on the Redwood shape (ten, on the play layer's schema) tied to K-12 stations, and the districts on
   the treasure surfaces (`gen_treasures.mjs` reads `sl-parish-play.js`; add the SF treasures there or in a `sg` module it
   reads). Bundler, links, passport, home card, SEO entry, Guide KB chunk as PARISH did for Orleans.
