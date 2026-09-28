# Console REDWOOD-2 — Redwood Reach, phase two

Team: REDWOOD-2 (round two of the forest world). Brief: the Holodeck brief (`tools/briefs/frontier-brief.md` shared rules +
`tools/briefs/next/redwood-next.md`, the predecessor's next-phase brief). Branch: `worktree-agent-a9f9a711f79e768db`, forked
from `claude/vr-ar-safety-training-wkwmve` at 688afae. Port 8991, prefix `rw`. Memory: `docs/consoles/memory/REDWOOD-2.md`.

## Plan (08:28 UTC)
The next brief's order, adapted to what can be measured here:
1. **Frame budget** — no real phone on this machine, so measure headless (SwiftShader, relative numbers only) on the low and
   high tiers over a scripted walk; drop the low tier to radius 1 with a denser horizon only if the headless numbers say the ring
   dominates. Add site-building colliders (only trunks collide today). Thicken the forest feel — light shafts under the canopy,
   fern variety, more fallen logs — within the mobile budget, keeping trunk clearance and spawn-in-clearings intact.
2. **Links, Guide, Atlas, Unity** — Redwood rows in `check_links` (per-station board links like Summit's), Guide knowledge in
   `gen_guide_kb`, Guide site checks in `check_guide`, a Unity export entry (`export_unity` + its checker).
3. **Skill gates** — `rw-career.js` reads `shared/skill-gates.js` (`qmIsOpen`/`qmMissing`); `rw-data.js` exports `RW_GATED`
   so `check_gates` discovers it.
4. Three new stills into `docs/img/redwood/`; memory, next brief, hand-back. New stations and the UTV stay on the next brief.

## Log
- 08:42 UTC · Phase 1: site-building colliders (98 footprints across 11 sites; arrivals, activity starts and board spots stay clear), thicker understory (sword ferns, root-plate logs, stumps, canopy light shafts lit only by day), long site labels fit their plate; headless SwiftShader drive: high 2197→2346 ms/frame (+7%, relative only), low 163 ms/frame at 390×844; three new stills · next: Guide, Atlas, Unity, links
- 08:49 UTC · Phase 2: Redwood wired into the platform — per-station board rows in check_links (repo and flat pages), a world and eleven site chunks in the Guide knowledge base (the cap goes 640→672 KB for the ninth world; the merged file was already 642 KB) with check_guide asserting them, a Unity world export (exports/unity/.../worlds/redwood.json, 5 worlds) and its checker row; skill gates through shared/skill-gates.js (rwGateMissing delegates programme/quest fields to qmMissing, the app's done() is the engine's one-star rule, RW_GATED discovered by check_gates: 56 items, 857 checks). check_redwood 395/395, check_gates 0 failed, check_unity_export up to date · next: check_all, next brief
