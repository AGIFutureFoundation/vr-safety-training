# REDWOOD-3 — next phase brief

Read first: `docs/consoles/memory/REDWOOD.md`, `REDWOOD-2.md`, `REDWOOD-3.md`, `docs/consoles/REDWOOD-3.md`,
`tools/briefs/frontier-brief.md` (shared rules).

## Where it stands (measured, headless SwiftShader at load average 13–16; relative numbers only, nothing is a device number)
- High tier, 1280×720, renderer triangles per rendered frame (before → after this phase): fire station facing north 445,797 →
  235,500; sawmill 388,336 → 203,766; grove 333,896 → 182,214; Mill Road 508,193 → 275,091. Every view is under 300k (PROVING had
  measured 479k, the worst of any world). 20 s Mill Road vehicle drive: mean frame 2022 → 1359 ms, mean triangles 506k → 274k.
  49 chunks, 24 of them on the far level; 8,330 tree instances in the layouts, ~17.3k instances drawn per view (was 38k).
- Low tier, 390×844: drive mean 141 ms / median 133 ms (REDWOOD-2: 150 / 133); 48–57k triangles per view; radius 2, so no far ring.
- Colliders: trunks, 98 site-building footprints, and now 490 fallen logs and 490 stumps in the high ring (all block at their
  centre); every arrival, activity start and job-board spot stays clear (the scratch probe asserts it).
- Lock UI: locked side quests are the shared rows (`qmBoardRows`), pins (`qmDrawPin`) and toast (`qmLockToast`) from
  `shared/skill-gates-ui.js`; `RW_GATED` items carry `siteName`, `steps`, `summary`, `anchor`. `check_gates` 857 checks, 0 failed.
- A drawn UTV (`world.vehicle.place`) sits under the driver while driving. `check_redwood` 395/395.
- Still 11 sites, 37 station slots, 6 main + 10 gated side quests, 36 field tins, 10 field lessons, 3 activities — no new stations.

## Do next, in order
1. **A real device.** Nothing has been measured on a phone or a headset. Record frame time at the fire station, the sawmill and on
   the Mill Road drive on a mid-range phone (low tier) and a standalone headset (high tier). If high is still short on a headset,
   the next lever is the ring-2 (`mid`) level: draw its trees from the impostor set too (`setLod` in `rw-world.js`; the far group
   already holds them) — that is ~16 chunks × 170 trees × 23 triangles saved — and hide its logs/stumps.
2. **New stations (up to six, eval 95+ via `node tools/eval_content.mjs`).** They did not fit beside the budget work. Each is a
   full sim under `WebXR/smartcity/js/sims/` (≈400 lines: 13 steps, 8 kinds, 4 hazards, 2 interruptions, `tools/briefs/station-brief.md`)
   plus a `curricula.js` row; then add the id to the site's `stations` in `rw-data.js`. Sites with no exact fit and the station
   each needs: sawmill — headrig guarding and lockout; trail-camp — crosscut and bucking; lookout — smoke report and radio;
   fire-station — water tender fill; nursery — seed cleaning; campground — host evacuation-route briefing. Limits read
   "per the plan / permit / label". `gen_redwood.mjs` throws if a field-tin lesson's (programme, station) pair leaves a programme.
3. **Fern LOD.** A closer fern (a five-frond fan at 5 m; the cone at 30 m) is still open: the `near` level could swap the cone
   clumps for the frond geometry within ring 0 only (both instanced meshes exist; toggle visibility in `setLod`).
4. **UTV habits.** The vehicle is drawn but not scored: a seatbelt prompt on the first drive, a speed read-out on the HUD, and a
   "stay on the graded road" score (distance off the road ribbon per drive) recorded through `rwRecordActivity`.
5. **Play depth.** Field tins toward 60 through TREASURE's ledger, a night-sky pass for the lookout, an Atlas-style map page if the
   Bay Atlas grows a world switcher.

## Measuring here
`$SP/holodeck/redwood-3/probe.mjs <cfg.json>` (scratch, not in the repo): serves the worktree on 8991, asserts the colliders, reads
`renderer.info.render.triangles` at four fixed views, times a 20 s drive, captures stills (`nearLog`, `board`, `driving` options).
PROVING's `tools/measure_frames.mjs`, once merged, replaces it. `WebXR/redwood/dist/redwood-base.html` is an untracked baseline
bundle — delete it.
