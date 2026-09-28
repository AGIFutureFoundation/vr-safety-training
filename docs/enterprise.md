# The organisation layer — organisations, cohorts, the cohort view, deployment configuration, audit and privacy

The platform trains individuals; an enterprise — a union hall, a school district, a company, a relief agency — trains
cohorts. This layer sits on top of the private profiles (`WebXR/shared/profiles.js`, `account.js`, `passport.js`) and
the instructor console (`WebXR/instructor/`) without changing what they store or how. Console: `docs/consoles/ENTERPRISE.md`.
Checker: `node tools/check_enterprise.mjs`.

**The hard rule, stated once:** nothing about a person leaves their device without their opt-in. This layer makes no
network request, never reads the sign-in session's raw id, keys members by a random local handle, shares progress only
after the learner turns sharing on, and moves a cohort between devices only as a file a coordinator downloads and
imports. `WebXR/privacy.html` says the same in learner-facing words and is linked from the sign-in dialog and the
homepage footer.

## 1. Data model — `WebXR/shared/org.js`

One store, **`vr-org-v1`**, read and written through `gtStorage()` so it is private to the signed-in profile, to
"This device" when nobody is signed in, or to the demo tab (where it dies with the tab). It is listed in
`GT_PROFILE_KEYS`. Every top-level name in the module is prefixed `en`/`EN_` for the bundler.

```jsonc
{
  "v": 1,
  "orgs":    [{ "id": "org-…", "name": "…", "colour": "#rrggbb", "programmes": ["fall-protection", …], "createdAt": "ISO" }],
  "cohorts": [{ "id": "cohort-…", "orgId": "org-…", "name": "…", "programme": "<passport programme id>",
                "edition": "…", "startDate": "YYYY-MM-DD", "seats": 20, "code": "XXXX-XXXX", "createdAt": "ISO" }],
  "members": [{ "id": "m-…", "cohortId": "cohort-…", "name": "<display name the person typed>",
                "role": "learner" | "instructor" | "coordinator", "joinedAt": "ISO", "local": true,
                "consent": { "progress": false, "at": "ISO" },
                "progress": null | { "at": "ISO", "programme": "<id>",
                  "stations": [{ "simId": "…", "attempts": 2, "stars": 3, "unsafe": 0, "handled": 1, "missed": 0, "passed": true, "lastAt": "ISO" }] } }],
  "audit":   [{ "at": "ISO", "action": "cohort-export" | "cohort-import" | "role-change" | "cohort-create" | "org-create" | "member-join" | "member-remove" | "sample-load", "detail": "…" }]
}
```

- **Organisation** — a name, a wordmark-free colour (`#rrggbb`, else the platform slate), the programmes it runs
  (filtered to `PP_PROGRAMMES`, the passport's catalogue generated from SmartCiti.X's curricula).
- **Cohort** — a name, one programme, an edition label, a start date, a seat count, and an **invite code** of eight
  characters from an alphabet without 0/O/1/I/L (`enInviteCode`), unique in the store.
- **Member** — joins with `enJoin(code, { name, role, local, consent })`. The name is what the person typed (initials
  are fine); the id is random and local. `local: true` marks the person training on this device, whose snapshot
  `enRefreshLocal()` recomputes from `records.js` on every render — **only while `consent.progress` is true**.
  Turning consent off drops the snapshot. A join is audited (`member-join`) on the device where it happens — the
  learner's own when they join from the sign-in dialog.
- **The learner's own view** — `enMyCohorts(records?)`: every cohort the person on this device joined, with the
  organisation, the programme and its ladder (`[{ simId, state: "passed" | "tried" | "todo", stars, attempts }]`)
  computed from **this device's records** and never stored. It is what the person sees of their own training, so the
  sharing consent is not involved — that consent governs what the coordinator may see. The sign-in dialog and the
  homepage's continue strip render it (section 2b).
- **Roles** — `learner`, `instructor`, `coordinator`. Seats count learners only. `enSetRole` is audited.
- **Snapshot** — `enSnapshot(records, programmeId)` is the data-minimised view of a record list: per station, attempts,
  best stars (and the unsafe actions on that best run), interruptions handled and missed, a pass flag, the last date.
  No crew tag, no id, no debrief text, no timings beyond the date.
- **Audit** — `enAudit(action, detail)`; `enAuditList()` newest first; capped at 500 lines; never exported.
- **Export / import** — `enExportCohort(id)` returns `{ v: 1, kind: "cohort", exportedAt, org, cohort, members }` with
  a member's snapshot only when they consented (audited). `enValidateCohortDoc(doc)` lists what is wrong with a file;
  `enImportCohort(doc)` merges by id (an existing member keeps its own consent and snapshot unless the import's is
  newer) and is audited. The round trip is exact (`check_enterprise`).
- **Cohort view model** — `enCohortProgress(id)` → `{ cohort, programme: { id, name, stations }, rows: [{ name, shared,
  cells: [null | { stars, unsafe, handled, missed, attempts, passed }], passed, total, stars, lastAt }] }`.
- **Needs attention** — `enNeedsAttention(id, { stuckAttempts = 3, inactiveDays = 14 })`: *stuck* (that many attempts
  at a station without a pass), *inactive* (no attempt in that many days, counted from the cohort start when there is
  none), *not sharing*. The thresholds are **platform defaults** (`EN_ATTENTION`), named as such in the console and
  never presented as a rule.
- **Exports per cohort** — `enCohortCSV(id)` (columns `cohort, programme, learner, station, attempts, bestStars,
  unsafeActions, interruptsHandled, interruptsMissed, passed, lastAt`, RFC 4180) and `enCohortXAPI(id)` (xAPI 1.0.3
  statements per learner per attempted station, the same verbs and extension names `records.js`'s `toXAPI` uses; the
  actor account is the local member handle under the cohort's activity id). Learners who did not share contribute
  nothing to either.
- **Certificate** — `enCertificateSVG({ org, cohort, programme, learner, passed, total, stars, date })`: a procedural
  A4-landscape SVG with the organisation's and the programme's names, the learner's display name, cohort and edition,
  stations passed and stars, the date, and **"PROTOTYPE — NOT A CREDENTIAL"** twice (a watermark and a footer line).
  No logo, no image, no script; every text is escaped. Returns `null` unless every station is passed.
- **Sample** — `enLoadSample()` creates "Sample Organisation / Sample cohort" (Working at Height) with four learners:
  one complete, one stuck, one inactive, one not sharing. It is what the console's empty state, the capture and the
  checker use. Idempotent.

## 2. The cohort view — the instructor console's fourth tab

`WebXR/instructor/js/cohort.js` renders **Cohorts** from `el()`/`textContent` only — `tools/check_console.mjs` forbids
markup from strings on this page, and a learner's display name is untrusted input. Panels, top to bottom:

1. **Organisation** — the organisations here (colour dot, cohort count, programmes), create one, *Load sample cohort*,
   *Forget everything on this device*. When the deployment names an organisation, the form is pre-filled with it.
2. **Cohorts** — every cohort with its programme, edition, start, seats used and invite code; a *New cohort* form
   (programmes limited to the deployment's enabled list); and **Join a cohort on this device** — code, display name,
   role and the sharing consent checkbox, off until ticked.
3. **Cohort view** — members (role select, joined date, sharing state with a start/stop button for the local member,
   remove); the **programme ladder as a grid** (rows: learners; columns: the programme's stations; each cell: stars,
   unsafe actions, interruptions handled of total, attempts; pass, stuck and attempted cells tinted; a learner who has
   not shared reads "not sharing progress" across the row); **Needs attention**; **Export CSV / Export xAPI / Export
   cohort (JSON)**; **Import cohort JSON** (a file input); and a **Certificate** button per learner, enabled once every
   station is passed — it downloads the SVG for printing.
4. **Audit log** — this device's coordinator actions, newest first.

Captures: `docs/img/enterprise/cohort-view.png`, `docs/img/enterprise/certificate-sample.png` (and the `.svg`).

## 2b. The learner's side — the sign-in dialog and the homepage

A learner does not need the instructor console to join. The shared sign-in dialog (`WebXR/shared/account.js`, on every
page) carries **Join a cohort**: the invite code, a display name and the progress-sharing consent checkbox, off until
ticked (`#gt-join-code`, `#gt-join-name`, `#gt-join-consent`, `#gt-join`). The join calls `enJoin(..., { local: true })`
on this device's store; a wrong code is refused with the reason in the dialog's status line; the dialog then lists the
cohorts joined here (`#gt-cohorts`: cohort, organisation, role, stations passed on this device, sharing state).
`account.js` imports `org.js` statically, so `tools/bundle_webxr.py` gives every app that carries `account.js` the
module (after `profiles.js`, `records.js` and `passport-programmes.js`, adding any it lacked) and copies it into
`dist/shared/`.

The homepage's continue strip shows **My cohorts** (`#hm-cont-cohorts`, one `.hm-cont-cohort` card per cohort joined on
this device): the cohort and organisation (the organisation's colour as the card's tint), the programme, stations
passed of total from this device's records, the sharing state, the ladder as rungs (`.hm-rung-passed` ★,
`.hm-rung-tried` ·, `.hm-rung-todo`) and a link into the programme. It is built by `hmCohorts()` in the page's runtime
script through a lazy import of `./shared/org.js`, string-built like the rest of that script, and reads nothing but the
store of whoever is using the page.

Captures: `docs/img/enterprise/dialog-join.png`, `docs/img/enterprise/home-my-cohort.png` (written by check 8 below
with `EN_SHOTS=docs/img/enterprise`).

## 3. Deployment configuration — the `enterprise` block of `WebXR/auth-config.json`

```jsonc
"enterprise": {
  "organisation": null,        // the organisation's name, shown on the homepage brand line, the sign-in dialog and the console
  "signInMethods": null,       // null = all; else a subset of ["google","microsoft","wallet","email","passkey","demo"]
  "defaultLanguage": null,     // a language code the platform ships (docs/i18n.md); applied until the visitor picks one
  "worlds": null,              // null = all; else a subset of ["bayworld","regatta","underwater","summit","parishes","fairway","redwood","atlas","smartcity","holodeck"]
  "programmes": null,          // null = all; else passport programme ids
  "dataRetention": "…",        // a note the deployment writes for itself; shown nowhere but here and the privacy page's summary
  "sso": { "note": "…" }       // see below
}
```

`cleanEnterprise()` in `auth.js` parses the block into `Auth.config.enterprise`. **It is read from the file only** —
a launch URL cannot rename the organisation or re-enable a method the deployment turned off. Who honours it:

| Surface | What it does with the block |
|---|---|
| Sign-in dialog (`account.js`) | Shows "Training for *organisation*"; lists only the methods in `signInMethods` (`enterpriseAllows`); links the privacy page. |
| Homepage (`tools/gen_home.mjs`, runtime script) | Adds the organisation to the brand line; hides world cards not in `worlds`; hides programme cards not in `programmes`; applies `defaultLanguage` when the visitor has not chosen a language. |
| Instructor console (`app.js`, `cohort.js`) | Shows a deployment line; limits the programme picker and the new-cohort form to `programmes`; pre-fills the organisation. |

**Single sign-on** is a configuration point, not a feature of these static pages. The honest architecture is the one
`docs/sign-in.md` already describes: the host page that embeds the platform verifies the credential with the
organisation's identity provider and passes the learner through the existing launch context (`?learner=`,
`?learner_id=`, `?learner_home=`) or the `smartcitix:identity` message. Nothing here is implemented against a real
identity provider and no vendor is named; `signInMethods` is how a deployment hides the public methods it does not use.

## 4. Audit log and privacy

Every export, import, role change, cohort creation and member removal a coordinator makes is written to the audit list
of the store on **that device**, shown newest first in the console's Cohorts tab, capped at 500 lines, and never
exported. `WebXR/privacy.html` (copied into `WebXR/dist/` beside the homepage) states what each store holds, where it
lives, and what leaves the device and when; the sign-in dialog and the homepage footer link it.

## 5. Checker — `tools/check_enterprise.mjs`

In `check_all`. Headless, with a Map-backed storage and a small DOM stub: the schema (an empty store, the sample, every
member field), the invite flow (normalisation, a wrong code, a full cohort, consent off by default), the cohort
export/import round trip (exact rows; snapshots of non-sharing members absent from the file), the cohort view rendering
with the sample (grid dimensions, tinted cells, the not-sharing row, the attention list, the audit rows, one enabled
certificate button), the certificate (well-formed SVG, both names, the prototype line twice, no image/script, escaped
text, null for a partial programme), the config block honoured (`cleanEnterprise` drops junk, `enterpriseAllows`, the
dialog hides switched-off methods, the homepage script and the console filter), and no network calls (a static scan of
`org.js`, `cohort.js`, `privacy.html`; no identity-vendor name in this document or the block).

Check 8 is the **live pass**, in headless Chromium against the flat build (`WebXR/dist`) on a temporary port, the way
`check_home` runs: the deployment block (an organisation, `signInMethods: ["passkey","demo"]`, `defaultLanguage: "es"`,
two worlds, two programmes) is injected by fulfilling the page's own request for `auth-config.json` — no file is
touched. It asserts the console's deployment line and programme picker, the homepage's brand line, two world cards and
two programme cards shown, the page in Spanish until the visitor picks, the dialog naming the organisation and offering
exactly two methods; then a learner joins the sample cohort from the dialog (a wrong code refused first, consent off),
and the homepage's continue strip shows the card with one rung per station, the join audited as `member-join` on that
device and no snapshot stored. The console bundle's three.js import is answered from `WebXR/vendor/three/` so the run
makes no external request. ~15 s on the shared machine.
