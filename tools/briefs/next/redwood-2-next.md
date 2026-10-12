# REDWOOD-2 — next phase brief

Read first: `docs/consoles/memory/REDWOOD.md`, `docs/consoles/memory/REDWOOD-2.md`, `docs/consoles/REDWOOD-2.md`,
`tools/briefs/frontier-brief.md` (shared rules).

## Where it stands (measured, headless SwiftShader on a machine at load average 12–20; relative numbers only)
- 4096 m world, 256 chunks; high tier 49 chunks, 8.3k tree instances, ~28k understory instances (fern clumps, sword ferns,
  logs, stumps), ~690 light shafts, 100k ground triangles, 98 site-building colliders; low tier 25 chunks, 1.75k trees, ~6.1k
  understory, no shafts, 12.8k ground triangles.
- 20 s scripted vehicle drive from the fire station, mean frame time: high 1280×720 2197 ms (previous bundle) → 2346 ms;
  low 390×844 142 ms (previous) → 150 ms mean, median 133 ms both. Nothing here is a device number.
- Wiring: `check_links` (Redwood board rows), Guide KB (world + 11 sites; cap 672 KB), `check_guide`, Unity export
  (`worlds/redwood.json`, 5 worlds), `check_gates` (10 Redwood items of 56, 857 checks), `check_redwood` 395/395.
- 11 sites, 37 station slots, 6 main + 10 gated side quests, 36 field tins, 10 field lessons, 3 activities.

## Do next, in order
1. **A real device.** Nothing above was measured on a phone or a headset. On a mid-range phone (low tier, 390×844) and a
   standalone headset, record frame time at the fire station, the sawmill and on the Mill Road drive; if the ring costs
   too much on low, drop `RW_BUDGET.low.radius` to 1 with `horizon` 64 and shorten `fog` so `check_redwood`'s
   ring-vs-fog assertion still holds. PROVING's `tools/measure_frames.mjs`, once merged, replaces the scratch probe.
2. **Understory colliders and detail.** Stumps and fallen logs do not collide (the trunk and building colliders do). Record
   log/stump footprints per chunk in `rwChunkTrees`'s style (deterministic from the same noise) and check them in
   `blocked()`. Ferns near the camera could use a second, closer LOD (a five-frond fan reads at 5 m; the cone reads at 30 m).
3. **Up to six new stations** where a site has no exact fit (eval 95+ via `node tools/eval_content.mjs`): sawmill headrig
   guarding and lockout; trail-crew crosscut and bucking; lookout smoke report and radio; water tender fill; nursery seed
   cleaning; campground host evacuation-route briefing. Limits read "per the plan / permit / label".
4. **Lock UI parity.** Redwood draws its own lock rows and toasts; swap them for `shared/skill-gates-ui.js`
   (`qmBoardRows`, `qmLockToast`, `qmDrawPin`) so a lock reads the same in every world, and give side quests `steps` text the
   gate checker's tone test can read.
5. **Play depth.** A drawn UTV that follows the road ribbon (seatbelt and speed habits scored), field tins toward 60 through
   TREASURE's ledger, a night-sky pass for the lookout, and an Atlas-style map page if the Bay Atlas grows a world switcher.
