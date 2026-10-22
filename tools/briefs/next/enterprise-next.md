# ENTERPRISE — next phase brief

Read first: `docs/consoles/memory/ENTERPRISE.md`, `docs/enterprise.md`, `docs/consoles/ENTERPRISE.md`, and the holodeck
brief's shared rules (they still bind). Prefix `en…`, port 8995.

## Where it stands (measured)
- `WebXR/shared/org.js`: one store `vr-org-v1` (per profile through `gtStorage()`), organisations, cohorts with invite
  codes, members with roles and an off-by-default sharing consent, per-station snapshots (attempts, best stars, unsafe,
  interruptions handled/missed, pass, last date), needs-attention (platform defaults: 3 attempts without a pass, 14 days
  inactive), CSV (11 columns) and xAPI per cohort, cohort export/import (exact round trip), a certificate SVG (2.6 KB, the
  prototype line twice), a per-device audit log (cap 500).
- The console's Cohorts tab renders the sample (4 learners × 7 stations) with no page error at 1280×900 and no sideways
  scroll; capture in `docs/img/enterprise/cohort-view.png`; certificate in `docs/img/enterprise/certificate-sample.{svg,png}`.
- `tools/check_enterprise.mjs`: 7 checks, ~0.4 s, in `check_all` (63 checkers).
- The `enterprise` block (organisation, signInMethods, defaultLanguage, worlds, programmes, dataRetention, sso note) is
  cleaned in `auth.js` from the file only and honoured by the sign-in dialog, the homepage script and the console.
- Not yet measured: a live browser pass of the block on the homepage (hidden worlds, the brand line, the default language)
  — only the static assertions ran; the console at 360×640 (the grid scrolls inside `.en-scroll`, untested on a phone).

## Do next
1. **Live pass of the deployment block.** Serve a copy of `WebXR/` with `enterprise.organisation` set, `worlds:
   ["bayworld","summit"]`, `programmes: [two ids]`, `defaultLanguage: "es"`, `signInMethods: ["passkey","demo"]`; assert
   in Playwright that the brand line names the organisation, seven world cards are hidden, the finder lists two
   programmes, the page is Spanish until the picker is used, and the dialog shows two options. Put that in
   `check_enterprise.mjs` behind the same headless server `check_home.mjs` uses.
2. **The learner's side.** A learner joins from the account dialog, not only from the console: a "Join a cohort" line
   in `account.js` (invite code + display name + the consent checkbox), and a "My cohorts" card on the homepage's
   continue strip showing the programme ladder for their cohort. Keep the consent off by default and the join audited on
   the learner's own device.
3. **Instructor sign-offs into the cohort file.** `tracking.js`'s SignOffs are per device; carry a member's sign-offs
   (instructor name, level, date, note) in the cohort export when the instructor exports, and show them on the grid.
4. **Refreshers and retention.** Use `tracking.js`'s refresher interval (a platform default of 90 days) to flag "refresher
   due" in needs-attention, and honour `enterprise.dataRetention` as a number of days after which old snapshots are
   dropped on load, with the audit line saying so.
5. **Phone layout for the grid.** At 360 px the ladder should collapse to one card per learner (stations as a list);
   `check_mobile`-style assertions on the console page.
6. **Multiple programmes per cohort.** A cohort currently runs one programme edition; an organisation running a ladder of
   programmes wants one cohort with several. The snapshot already carries the programme id; the grid would need one
   block per programme.
