# TYCOON memory — read this first at this console

Short, durable lessons for the next team working on the Crew Credits play economy (`docs/consoles/TYCOON.md`).

- **Crew Credits are never money.** No price, no purchase, no loot box, no random reward; TYCOON never imports
  `payments.js`, `pm-*.js` or anything under `workers/`. `check_tycoon.mjs` greps for it — keep it that way.
- **The store is `ty-ledger-v1` through `gtStorage()`** (per profile, like the passport). The balance is recomputed
  from the entries on every load, so the invariant "balance = sum of entries" cannot drift; old entries fold into one
  "carried forward" entry. A charge that cannot be met is not taken (the rental lapses, the business closes).
- **The passport records milestones as zero-credit awards from source `tycoon`** via `ppAward` (handed in with
  `tySetRecorder`), so the passport's own credits never mix with Crew Credits.
- **Checklists are verbatim clauses of the station's `tagline` in `smartcity/js/sims-meta.js`.** Change a business's
  station and re-copy its clauses; the checker re-reads them.
- **Listings are procedural**: named from the site's kind (`TY_KIND_WORDS`), no digits in names; a new site kind
  falls back to "the site" — add it to the table.
- **The worktree guard refuses compound shell commands** (heredocs that run node, loops): write a script to the
  scratchpad and run it alone.
- **In the parishes app, declare anything `npHud` reads near the top** — `npBegin()` runs before the bottom blocks when
  the page opens on a return (`#site=`), and a `let` below would be in its temporal dead zone.
