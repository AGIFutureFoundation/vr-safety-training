# REDWOOD — next phase brief

Read first: `docs/consoles/memory/REDWOOD.md`, `docs/consoles/REDWOOD.md`, `tools/briefs/frontier-brief.md`.

## Where it stands (measured)
- 4096 m world, 256 chunks, ring of 49 chunks on high / 25 on low; ~8.3k tree instances and ~100k ground triangles on high at the
  fire station (SwiftShader, headless, no page errors). Bundle 809 KB.
- 11 sites, 37 station slots (all existing catalog stations), 6 main + 10 gated side quests, 36 field tins, 10 field lessons,
  3 activities. `node tools/check_redwood.mjs`: 395 checks pass.

## Do next, in order
1. **Frame budget on a real phone.** The `check_mobile`/`check_ui` rows pass; now measure frame time on the low tier on a device.
   If the ring costs too much, drop low to radius 1 with a denser horizon mesh. Add site-building colliders (only trunks collide).
2. **Links, Guide, Atlas, Unity.** Rows in `tools/check_links.mjs` (every board link in the repo and flat layouts), Guide knowledge in
   `tools/gen_guide_kb.mjs` (sites, trades, controls), an Atlas-style entry, and a Unity export entry in `tools/export_unity.mjs`
   if the other worlds keep theirs.
3. **Skill gates.** When QUESTMASTER's `WebXR/shared/skill-gates.js` lands, replace `rwGateOpen`/`rwGateMissing` with its
   `isOpen`/`missing` and register `rwGatedItems()` with `tools/check_gates.mjs`.
4. **Up to six new stations** where a site has no exact fit (eval 95+ via `node tools/eval_content.mjs`): sawmill headrig / saw
   guarding and lockout; trail-crew crosscut and bucking; lookout smoke report and radio; fire-road water tender fill; nursery seed
   cleaning; campground host evacuation-route briefing. Facts rule: limits read "per the plan / permit / label".
5. **Play depth.** A drawn UTV that follows the road ribbon (with seatbelt and speed habits scored), more field tins toward 60
   (TREASURE's ledger when it lands), SCHOLAR-2's field-lesson schema if it differs from ours, and a night-sky pass for the lookout.
