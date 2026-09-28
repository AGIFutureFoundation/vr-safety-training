# Console REDWOOD-3 — Redwood Reach, phase three

Team: REDWOOD-3 (round three of the forest world). Brief: the Holodeck brief (shared rules) + `tools/briefs/next/redwood-2-next.md`
(the predecessor's next-phase brief) + PROVING's measurement: Redwood high is the worst view of any world (479k triangles, 38k
instances per view, headless). Branch: `worktree-agent-a93031609d954e521`, merged from REDWOOD-2's `worktree-agent-a9f9a711f79e768db`
(fast-forward, no conflicts). Port 8991, prefix `rw`. Memory: `docs/consoles/memory/REDWOOD-3.md`.

## Plan (09:46 UTC)
The next brief's order, with PROVING's budget task folded in where it touches the same code, and no device here (relative headless
numbers only, as before):
1. **Understory colliders** — factor the per-chunk understory layout out of `buildChunk` into a pure `rwChunkUnderstory(cx, cz, tier)`
   (same seeded noise), cache it beside the tree layouts, and have `blocked()` test fallen logs (an oriented rectangle) and stumps
   (a disc) after trunks and before site footprints. The probe asserts a log centre blocks and arrivals stay clear.
2. **High tier under 300k triangles per view** — each chunk gets a `near` group (full trees, understory) and a `far` group
   (impostor trees: a 4-sided open cone on a 3-sided open trunk, 10 triangles against 52; no understory). `stream()` sets the
   level by chunk ring: ring ≤ 2 near, ring 3 far; the ferns split into a `sparse` set (always) and a `dense` set (rings ≤ 1 only),
   so the fern spacing thins with distance without changing the walking view. Record renderer triangles/instances before and after.
3. **Lock UI parity** — job-board quest rows, the near-quest toast and the map pins through `shared/skill-gates-ui.js`
   (`qmBoardRows`, `qmLockToast`, `qmDrawPin`); `RW_GATED` items carry `siteName` and `steps` so the checker's tone test reads them.
4. **UTV** — a drawn vehicle (a low box body, cab, four wheels) that appears under the camera while driving and follows the heading;
   seatbelt/lights/speed habits stay in the toast and the HUD.
5. Three new stills into `docs/img/redwood/`; memory, next brief, hand-back.
New stations (item 3 of the predecessor's brief) need a full sim each (≈400 lines, 13 steps, 4 hazards, 2 interruptions, eval 95+);
they do not fit beside the budget work in 70 minutes and stay on the next brief with the site → station pairs named.

## Log
- 10:04 UTC · Phase 1+2: understory colliders (pure rwChunkUnderstory layout shared by the drawing and blocked(): 490 logs and 490 stumps in the high ring block, arrivals/starts/boards clear) and the high-tier triangle budget — per-chunk near/mid/far levels toggled by ring (impostor trees and a half-segment ground on ring 3, the dense fern set hidden on ring 2), open-ended trunks; headless SwiftShader triangles per view (before → after): fire station 446k → 236k, sawmill 388k → 204k, grove 334k → 182k, Mill Road 508k → 275k; Mill Road drive mean 2022 → 1359 ms; low tier drive 141 ms mean / 133 median (was 150 / 133). check_redwood 395/395 · next: lock UI parity, UTV
