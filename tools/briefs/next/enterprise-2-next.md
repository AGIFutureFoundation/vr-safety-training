# ENTERPRISE-2 — next phase brief

Read first: `docs/consoles/memory/ENTERPRISE.md`, `docs/consoles/memory/ENTERPRISE-2.md`, `docs/enterprise.md`,
`docs/consoles/ENTERPRISE-2.md`, and the holodeck brief's shared rules (they still bind). Prefix `en…`, port 8995.

## Where it stands (measured)
- Everything in `tools/briefs/next/enterprise-next.md`'s "where it stands" holds, plus:
- `tools/check_enterprise.mjs`: 8 checks; the seven headless ones ~0.5 s, the live pass (check 8) ~15 s on the shared
  machine: the block on the console (deployment line, picker of 2), the homepage (brand line, 2 of 9 world cards, 2 of
  60 programme cards, `lang=es`), the dialog (organisation, methods `demo,passkey`, join form folded, consent off), a
  wrong code refused, the join, the card with 7 rungs, `member-join` first in the audit, no snapshot stored.
- The learner's side: `enMyCohorts()`, the dialog's join form and cohort lines, the homepage card
  (`docs/img/enterprise/dialog-join.png`, `home-my-cohort.png`). Every bundle carries org.js (13 bundles, +29 KB each,
  +29 KB more for the three that lacked passport-programmes.js); `dist/shared/org.js` exists.
- Single checkers run alone after the change: check_enterprise 8/8, check_auth, check_console, check_i18n (200) pass;
  check_home and check_links were started at hand-back (see the console log for what finished).
- Not done from the previous brief: items 3–6 (sign-offs in the cohort file, refreshers and retention, the phone layout
  of the grid, several programmes per cohort).

## Do next
1. **Instructor sign-offs into the cohort file.** `tracking.js`'s `SignOffs` are per device (`vr-training-signoffs-v1`,
   `{ programme, level, learner, instructor, note, at }`). Carry a member's sign-offs in `enExportCohort` when the
   exporting device holds any whose `learner` matches the member's display name (or `null`), merge them on import
   without duplicates (by id), and show them on the grid as a small "signed off · level n · date" line under the
   learner's name. Keep them out of CSV/xAPI unless asked.
2. **Refreshers and retention.** In `enNeedsAttention`, add `refresher-due` from `tracking.js`'s `refresherInterval`
   (platform default 90 days, named as such) using the snapshot's `lastAt` of passed stations; honour
   `enterprise.dataRetention` when it parses as a number of days (`"30 days"`, `"P30D"`) by dropping snapshots whose
   `at` is older on `enLoad`, with an audit line `retention-drop` saying how many. Document the parse in section 3.
3. **Phone layout for the grid.** At 360 px, one card per learner with the stations as a list (`.en-grid` stays for
   ≥ 720 px); `check_mobile`-style assertions on `dist/instructor-console.html` in check 8 (no sideways scroll, tap
   targets ≥ 44 px on the Cohorts tab).
4. **Remove the console's timer race.** Dispatch `gt:config` from `account.js` once `loadConfig` resolves and have
   `app.js`'s `enApplyDeployment` listen for it (keep the timer as a fallback); assert in check 8 with a delayed
   `auth-config.json` route (2 s) that the line still appears.
5. **Multiple programmes per cohort.** Unchanged from the previous brief: the snapshot already carries the programme
   id; the grid needs one block per programme and `enMyCohorts` one ladder per programme.
6. **Strings.** The dialog's join form and the homepage card are English-only text (the rest of the dialog is
   translated through `trT`); add `acct.join*` keys to `tools/i18n/en.json` and regenerate `shared/i18n-strings.js`
   with the language console's tool rather than by hand.
