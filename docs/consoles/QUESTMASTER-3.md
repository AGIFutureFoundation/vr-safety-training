# Console QUESTMASTER-3 — skill gates, round three: mechanics in the world, cosmetics on the avatar, K-12 gates

- Team: QUESTMASTER-3 (resumes QUESTMASTER-2)
- Brief: `tools/briefs/next/questmaster-2-next.md` under the holodeck brief (`$SP/holodeck/holodeck-brief.md`), with `tools/briefs/frontier-brief.md` and `tools/briefs/console-brief.md`
- Branch: worktree `agent-a50a5f3533288cddd`, merged from QUESTMASTER-2's local branch (clean, no conflicts) · port 8992 · prefix `qm`
- Memory: `docs/consoles/memory/QUESTMASTER-3.md` · Next brief: `tools/briefs/next/questmaster-3-next.md`

## Log

- 09:27 UTC · Gate: merged `worktree-agent-a498489a009170c59` (fast-forward, nothing to resolve). Read the holodeck brief, both QUESTMASTER memories, `docs/skill-gates.md`, the log tail and the next brief. Load average above twenty again · — · next: plan
- 09:31 UTC · Plan, in the next brief's order: (1) `shared/side-game-stage.js` — a three.js-free-by-text stage that takes the library from the caller (`lib`), builds a 3D board per mechanic step (lift sequencer: marked loads, hook, landing pad, crew figures on the walkway side the board names; line follow: knots as lights along the line with the buddy behind; traffic zone: signs, cone taper and spotter on the path; a marker row for the rest) and runs `qmPlaySteps` as a pure state machine (`qmStageRun`) so the world scores exactly what the panel scores, then `qmFinishGame`; Bay World mounts it on the rigging quay for an open gated quest, the Deep at the night line, Fairway on the cart path. (2) `shared/side-game-cosmetics.js` — the ledger's ids mapped to a slot (head, shoulder, wrist, fin) and a colour, drawn as small procedural decals on Bay World's person figure and the Deep's diver. (3) `shared/k12-gates-data.js` exporting `K2_GATED`, five items derived from field lessons (a course opened by the K-12 lesson at the landmark that teaches it), listed in Bay World and the Deep. (4) checker: stage builders and run parity with a stub library, cosmetic slots, `K2_GATED` discovered, 70+ bar; bundles; docs; four stills into `docs/img/questmaster/` · — · next: build (1)
