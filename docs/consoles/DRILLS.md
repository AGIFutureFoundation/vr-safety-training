# DRILLS — scenario drills for first responders, disaster relief and UN training (`dr`, 8977)

SmartCiti.X Powered by AGI Corp · the Holodeck Packs run, third wave (the reactor loop).

Four in-world timed scenario drills in the parishes app: **Rising Water** (flood), **Scene on the Shoulder** (traffic
incident), **Campus Shelter Setup** (disaster relief) and **Sector Check-In** (UN / cluster coordination). Each has a
briefing, 5–6 timed objectives, GRIOT characters in the drill's roles, a debrief (what went well, one improvement), a
score on safe practice, and a passport record. Every objective names a real catalog station **and one of that station's
own step ids** (`WebXR/smartcity/js/sims/<station>.js`); its practice line is that step's cue in a drill's words.
The scenarios are practice exercises: no injury, no gore, no fear framing anywhere in drill text.

| Drill | Objectives (station · step) | Paths | Sites |
| --- | --- | --- | --- |
| `dr-flood` | tide-gate·levels-up; k12-by-reading-a-flood-maps-colours·choose-the-route-that-stays-on; br-levee-inspection-and-seepage·boil-ring (kiosk `kw-sandbag-relay`); tide-gate·tide-window (kiosk `kw-floodgate-closeout`); br-levee-inspection-and-seepage·log-inspection | Disaster Relief, First Responders | st-bernard/sb-violet-floodgate, orleans/lakefront-levee, sf-marina/marina-seawall-crew |
| `dr-traffic` | traffic-incident-management · set-the-block, vest-before-stepping-out, driver-clear-of-the-lane, tow-request, clearance-and-reopen | First Responders, Disaster Relief | jefferson/jf-causeway-yard, st-tammany/st-causeway-north, sf-downtown/bay-bridge-crew-yard |
| `dr-shelter` | shelter-intake-operations · ics-checkin, intake-questions, cot-spacing, quiet-room; who-water-sanitation-and-hygiene · residual-read | Disaster Relief, First Responders, UN Training | st-bernard/sb-school-campus, st-tammany/st-covington-campus, sf-mission/mission-school-campus, sf-golden-gate-park/sunset-school-campus |
| `dr-cluster` | damage-assessment-team · ics-assignment, buddy-check, handover-log; who-surveillance-and-case-definition · case-definition; who-risk-communication-and-community-engagement · share-log; who-after-action-review · share-report | UN Training, Disaster Relief | st-tammany/st-slidell-staging, orleans/hospital-district, sf-golden-gate-park/parnassus-hospital-campus |

Scoring: an objective is 100 when the safe call is made inside its time, 60 when safe but over time, 0 when unsafe; the
drill's score is the mean (0–100), passed at 80. The debrief lists only the drill's own objectives: those at 100 as
"went well", and one improvement (the first unsafe objective, else the first late one, with its practice line).

## Seams

- `drDrills()`, `drDrill(id)`, `drPlacesFor(parishId)`, `drDrillsFor(pathId, parishId)`, `drTimer(objective, s)`,
  `drObjectivePoints`, `drScore(drill, results)`, `drDebrief(drill, results)`, `drRecord(drillId, result, { attemptId })`,
  `drSetRecorder(fn)`, `drDeanModules()`, `drMountDrills({...})` — `WebXR/shared/dr-drills.js` (shapes at the top).
  Data: `WebXR/shared/dr-drills-data.js` (`DR_DRILLS`, `DR_PLACES`).
- Mounted: the parishes app (`#menu-drills` in the menu, `window.__parishTest.drills`), recorder `ppAward`
  (source `drills:<id>`), best scores under `vr-passport-drills-v1` in the passport's identity-scoped storage.
- NEWTON: `nwMountPhysics`'s `onCard` now calls `drWorld?.offer("dr-traffic")` — the "after a collision" card offers the
  traffic incident drill at this map's placement.
- STORYLINE: drills are filtered by `stChosenPath()` (First Responders / Disaster Relief / UN Training); Just Roam and no
  path leave every drill open; the list re-renders on `st:path`.
- DEAN (for the coordinator): `drDeanModules()` returns the drills in an assignable module shape
  `{ id: "drill:<id>", title, kind: "drill", stations, paths, minutes, launch: { world, parish, site } }` —
  DEAN's `dnModules()` can concatenate it; not merged in this tree (DEAN lands in parallel).
- Flood water: one translucent plane at the drill site that rises over the drill (none on the low tier, set still at
  its final level under reduced motion). TERRAFORM's channel water is not modified.

## Cycles

1. Reason: data + registry — every objective resolves to a catalog station and one of its step ids. Check:
   `check_drills` resolve lines. Observed: 20/21 resolved; the K-12 flood-map sim writes steps without `kind` on the id
   line and the catalog's `sources` arrays are empty → fix the checker's step reader (title + cue in the step body) and
   read the station's sourced standards from `certification`.
2. Reason: the fix from cycle 1 plus wiring (app, page, bundler, check_all, baseline) and this doc. Check:
   `check_drills` prints "All drills checks pass." Observed: pass — "4 drills · 21 objectives (21 resolve to a station step) · 13 placements · 8 GRIOT roles · 230 checks · 0 failed"; a hazard id swapped in for a step fails `[resolve]` (negative test); check_imports, check_newton, check_parishes pass; the parishes bundle builds (83 modules).
