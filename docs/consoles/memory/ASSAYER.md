# ASSAYER — console memory

Short, durable lessons for the next team at this console. Read `docs/consoles/ASSAYER.md` for the log.

## Conventions
- **The rubric is `tools/eval_worlds.mjs`**: six criteria, fixed weights (`AS_WEIGHTS`), a criterion scores weight × pass
  ratio over the checks it ran. A finding carries "built by → fixes now" as its owner. `--no-browser` runs in ~5 s; the
  browser pass (seven pages × two viewports, plus a talk-and-board probe and a renderer.info frame read per parish)
  takes ~90 s on port 8990 — run it in the background or with a long timeout. It is an eval: it always exits 0.
- **Serve source pages, not dist,** for the browser pass: data edits show without a rebundle. three.js is answered from
  `WebXR/vendor/three/dist/` (check_mobile's pattern); everything off-host is aborted.
- **Ratio scoring hides geometry in big pools**: one wet road costs little in a 70-check "resolves" pool. The worst list
  groups alike findings per subject so distinct problems surface; read the whole findings list (`--json`), not only the ten.
- **A worktree-isolated agent's Bash refuses compound commands with runtime variables near git/sed** — write files with
  the Write tool, put multi-line edits in a scratch Python file, and run git as plain separate commands.

## The parish data
- **DELTA's modules are one JSON literal after `export const NP_X = `** — parse the literal, edit the object, write it
  back with `JSON.stringify(p, null, 1)` and the diff stays minimal (the transform lives in `$SP/bayou/assayer/fix.mjs`).
- **Derive bank features from the river, never by hand**: at a stylised scale the river is a narrow ribbon and hand-drawn
  roads and levees wander across it. `offset(river, ±d)` (miter-capped) gives levee and road lines per bank.
- **The bed test samples the ribbon's middle point only**: a site pad within 72 m (NP_PAD × 1.8) of that point flattens
  the bed above the water line — move the pad, not the river.
- **The massing test wants more than 100 spots on every third chunk**: a marsh parish needs wetland districts over its
  marsh polygons (the water kind `wetland` admits `wetland` massing).
- **Declared scale**: a parish's `scale` field (real metres per map metre) replaces the half-to-six rule; the fit must
  agree within 15 % and `docs/parishes.md` must record it ("`<id>` … N real metres per map metre").

## The mounts
- Parish characters match by `siteKind`; `GR_PARISH_KIND_ALIAS` in npc.js maps the parish spellings (`pump`,
  `pumping-station`, `streetcar`, `rail`). Orleans places all ten; the DELTA parishes three or four each.
- The parish Motor Pool board has no vehicle mode behind it: `onDrive` says where it drives today (Bay World).
