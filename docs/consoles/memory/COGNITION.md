# COGNITION memory (console COGNITION, third wave of the Holodeck Packs run)

- Base 039f09e (worktree started on 589f0d8; reset per the brief). Prefix `cg`, port 8975. Plan, cycles, seams: docs/consoles/COGNITION.md.
- Generator `tools/gen_cg_units.mjs` (`--check` for staleness) → `WebXR/shared/cg-units.js` (~115 KB: 4 units, 40 lessons,
  40 embedded flows, meta stripped from the embedded BAYOU flows), `WebXR/flows/cg-*.json` (28), `WebXR/flows/index.json`.
- "Has a flow" = some flow has a `station` node for it. The four K-12 programme flows only pre-brief their first station,
  so those four stations got generated flows too (24 + 4 = 28).
- Runner `WebXR/shared/cg-runner.js` reuses `byMountFlowAgent` by mapping node kinds onto by-flow-agent's display
  phases (station/programme → lesson, checkin with check → check, external → apply, last checkin → close, else brief).
- check_flowhub requires every flow id to appear in docs/flowhub.md — the COGNITION section lists them; regenerate that list if the flows change.
- Checker `tools/check_cognition.mjs` (~3–6 s): 308 checks (sections 1–7 with 5b and 6b). Eval before: mean 98 (15 subjects), SF districts 97 (REACTOR's).
- Lessons carry `places` (BAYOU sites, field lesson anchors, Redwood sites, the ten maps' own field lessons and site boards); `cgLessonsAt` matches any place and sets `here`. All ten maps place lessons.
- A miss on a check with no `when.passed` branch stays on the check (BAYOU's flows); a miss on a branching check takes the re-teach edge (COGNITION's flows).
- Browser proof: one-off probe `$SP/packs/cognition/browser.mjs` (pv_browser, port 8975) walks a parishes lesson to "Lesson complete", 0 page errors.
- Next brief: tools/briefs/next/cognition-next.md.
