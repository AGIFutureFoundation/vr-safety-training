# Course tracking: My Training, refreshers, transcripts and sign-off

[Proof of training](proof-of-training.md) is what a hall can *prove*: a competency, demonstrated under one rule that never bends. This page is the layer above it — the blunter, day-to-day accountability question a union rep or a training director actually asks: is this member training regularly, is anything of theirs going stale, and can an instructor put their name on a level a learner claims.

The code is `WebXR/shared/tracking.js`: pure data and pure functions over the same training record `records.js` stores and the same ladders `ladder.js` and `smartcity/js/ladders.js` already gate a level with. It touches no DOM and no station file, so `tools/check_records.mjs` runs the whole layer in Node against a small fixture ladder — never the real thirty-programme catalog — the same way `tools/check_competency.mjs` runs the mastery rule.

## My Training

The **My Training** card in SmartCiti.X (`viewMyTraining` → the "My Training" button on the intro panel) reads nothing that is not already in the training record. Per programme it shows:

| Field | Where it comes from |
|---|---|
| Levels completed / total | `levelState()` (`shared/ladder.js`) against this programme's ladder — the same state the Programmes card's ladder view already shows. |
| Lessons completed / total | The `lessons` field of every **passed** level, against the ladder's own total. |
| Time on task | The sum of every attempt's own `seconds` on this programme's stations — the session's real measured elapsed time, the same number the results card shows after a run. Never estimated, never a clock started on page load. |
| Last station / next level | The most recent attempt on one of the programme's stations, and the first `open` level. |
| Badges earned | Every station badge (`records.js`'s `badges` field) earned on one of the programme's stations. |
| Standards evidenced | The union of the `standards` ids on every **passed** level, resolved to registry titles (`smartcity/js/ladders.js`'s `LADDER_STANDARDS`) rather than printed as bare ids. |

A platform-wide **streak** — consecutive calendar days (UTC) with at least one attempt — sits above the programme cards, with an `active` flag so a streak that ended three weeks ago is not shown as current.

## Refreshers due

A station's last **clean run** — `records.js`'s own pass rule, two or more stars and no unsafe action — ages. `refreshersDue()` flags a station whose last clean run is older than the programme's refresher interval:

```
refresherInterval(curriculum, ladder) → { days, isDefault }
```

It checks `curriculum.completionRule.refresherDays`, then `ladder.refresherDays`, and falls back to `DEFAULT_REFRESHER_DAYS = 90` when neither is declared — which is every programme in this tree today. **The default is always labelled a platform default, never a union rule**: the card and the transcript both print `refresherLabel()`'s sentence ("platform default (90 days)" vs "programme rule (45 days)") rather than let a learner mistake this engine's fallback for something their local negotiated. A station never run, or never passed, is not "due" — there is no clean baseline yet to age.

The same rule surfaces on the homepage: `tools/gen_home.mjs`'s "Continue where you left off" strip reads `vr-training-records-v1` directly (the same pattern the hard-hat counter already uses) and counts stations due a refresher across every programme, without importing the ladder/competency/procedure-engine chain onto the marketing page.

## The transcript: a record, not a credential

`buildTranscript(records, { learner, curricula, ladders, standardsById, signOffs })` returns one JSON object:

```
{
  generatedAt, learner,
  disclaimer: "This is a record of simulator activity on this platform, not a certification.",
  totals: { attempts, timeOnTaskSeconds, streak, badges },
  attempts,       // every record, in records.js's own shape — this is what round-trips
  programmes: [ { ...myTrainingSummary output, signOffs } ],
}
```

`attempts` is the training record itself, unmodified — the same shape a CSV or xAPI export already carries — so a transcript a hall receives can be re-imported or diffed against a fresh export without translation. `transcriptHtml(data)` renders the same data as a printable page: pure string assembly with every learner-, note- and station-supplied value passed through `escapeHtml` first (`shared/a11y.js`), so it is exactly as safe to write with `document.write()` as SmartCiti.X's DOM-built proof transcript is safe to build with `createTextNode`. It runs identically in Node (`tools/check_records.mjs`) and in a browser's print window.

**No credential word appears as a claim.** The word "certified" never appears; "certification" appears exactly twice, both inside a plain negation ("not a certification", "not a licence or a certification issued by any standards body") — never as something the learner achieved. `tools/check_records.mjs` asserts this by counting every occurrence of `certificat\w*` and confirming each one sits inside a `not … certificat…` phrase.

SmartCiti.X exposes this as **Export transcript (JSON)** and **Print transcript** on the My Training card, beside (not instead of) the existing Records card's CSV/xAPI/Open-Badges exports and the Proof tab's competency transcript — those stay exactly as `proof-of-training.md` describes them.

## Instructor sign-off

An instructor watching a learner complete a level can attest to it from the **instructor console** (`WebXR/instructor/`): a programme (from the same picker used to assign one), a level number, the instructor's own name, and an optional note. `SignOffs.add({ programme, level, learner, instructor, note })` stores it the same append-only way `TrainingRecords.record()` stores an attempt, under its own `vr-training-signoffs-v1` key — never mixed into the attempt log itself, because a sign-off is not a run.

A sign-off is:

- **never a credential.** It carries no pass/fail verdict of its own and changes nothing about whether a level, a station or a competency counts — those are decided exactly as `proof-of-training.md` and `ladders.md` state, by the mastery rule and the record alone.
- **shown as "instructor attestation."** Both the console's own per-learner panel and the learner's printed transcript label it with that exact phrase — never "certified," never "approved," never a badge.
- **plain data.** The instructor's name and note are untrusted input by the time they reach either page, and both are escaped (via `escapeHtml` on the transcript, via `textContent`/`el()` on the console) rather than trusted as markup — the same rule `check_console.mjs` already holds the whole instructor console to.

`SignOffs.forLevel(programme, level, learner)` reads sign-offs back, newest first, scoped to one learner (or every learner's, when none is named — the console's own view of "who signed off on this rung").

## Accountability gamification

Every bonus and badge below is a pure function over the record, the same shape `shared/competency.js` already uses for the mastery rule — never a separate mutable ledger, so a number the card shows today is exactly reproducible from the same attempts tomorrow.

| What | Rule |
|---|---|
| **Streak XP** | `streakBonusXp(days)` — cumulative: +50 XP at 3 days, +150 at 7, +400 at 14, +1000 at 30. Reaching 30 days carries all four (1600 XP total). |
| **On-time refresher XP** | `onTimeRefreshers()` counts a station's second clean run when it lands 60–100% of the way through the refresher interval — renewed before it lapsed, not merely eventually redone. Each one is worth `ON_TIME_REFRESHER_XP` (100). |
| **Clean-run badge series** | `cleanRunBadges(records, curriculum)` — a run with zero corrections and zero unsafe actions is "clean"; a programme earns the 5-, 10- and 20-clean-run tiers as its count crosses each (`CLEAN_RUN_TIERS`). |
| **Hazard-Free Week** | `hazardFreeWeekBadge()` — any week (a coarse seven-day bucket, not a calendar week) in which every attempt platform-wide had zero unsafe actions earns the badge; one bad run anywhere in the week denies it. |
| **Programme leaderboard** | `programmeLeaderboard(records, { curriculum, ladder })` ranks by lessons completed, grouped on whatever the learner typed into the crew-tag field (`learnerName`/`learner` — the same field `game.js`'s intro card already limits to 12 characters and never asks to be a full name). It shows exactly what was typed, first name or initials, because that is the only thing this engine ever collects. |

None of this changes a station's score, a level's pass/fail, or a competency's status — all of that stays exactly as `proof-of-training.md` describes it. It is a second, separate read of the same record, the same way the Leaderboards overlay's per-simulator ranks are a separate read from the Records overlay's pass/fail table.

## What this is not

Same rule as `proof-of-training.md`: nothing on the My Training card, the transcript or an instructor's sign-off is a licence or a certification. A streak, a badge tier and an instructor's attestation are accountability and motivation — evidence that training happened, watched and on schedule — never evidence issued by OSHA, NFPA, ANSI, a state board or a union, and never claimed to be.
