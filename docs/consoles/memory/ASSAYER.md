# ASSAYER — console memory

Short, durable lessons for the next team at this console. Read `docs/consoles/ASSAYER.md` for the log.

## Conventions
- **The rubric is `tools/eval_worlds.mjs`**: six criteria, fixed weights (`AS_WEIGHTS`), a criterion scores weight × pass
  ratio over the checks it ran. A finding carries "built by → fixes now" as its owner. `--no-browser` runs in ~5 s; the
  browser pass (seven pages × two viewports) takes ~80 s on port 8990. It is an eval: it always exits 0.
- **Serve source pages, not dist,** for the browser pass: data edits show without a rebundle. three.js is answered from
  `WebXR/vendor/three/dist/` (check_mobile's pattern); everything off-host is aborted.
- **Ratio scoring hides geometry in big pools**: one wet road costs little in a 70-check "resolves" pool. The worst list
  groups alike findings per subject so distinct problems surface; read the whole findings list (`--json`), not only the ten.
- **A worktree-isolated agent's Bash refuses compound commands with runtime variables near git/sed** — write files with
  the Write tool and run git as plain separate commands.
