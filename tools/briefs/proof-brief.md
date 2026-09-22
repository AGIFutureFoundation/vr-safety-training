# Proof brief — standards, scoring, badges and consoles

For every task that makes the training *provable* against what a union or trade actually demands. `tools/briefs/station-brief.md` §Verify applies; `tools/briefs/interface-brief.md` applies to anything a learner or instructor operates.

## What "proof" means here
- A **standard** is a real clause or programme a body publishes (OSHA 29 CFR section, NFPA document, ANSI/ASSP, NIOSH, the union's apprenticeship standard or training-fund course). It lives once, in `tools/standards.json`, with `id`, `body`, `title`, `scope` (categories it governs) and `source` ("verified" with the citation form you are sure of, or "unverified"). Never invent a clause number; write the body and title and mark it unverified.
- A **competency** is a named thing a journeyman can do, tied to 1–n standards and demonstrated by passing named stations under the mastery rule. Mastery = a run with ≥2 stars, zero unsafe actions, every interruption answered, and time ≤ 1.5 × par. One clean run earns "demonstrated"; three on different days earn "consistent". No other rule earns a competency badge.
- A **badge** is an Open Badges 2.0 assertion carrying the competency, the standards it evidences, the station ids and attempt ids, and the mastery rule text. Station badges (gamify) stay as they are; competency badges are a second, sober tier and never replace them.
- **Scoring** stays in `game.js`. Do not change score formulas; document them and expose them on the transcript so a learner can see why a run did or did not count.

## Consoles
The instructor console (`WebXR/instructor/`) speaks only through `shared/observer.js` and `shared/platform.js` commands; it never imports simulator code. A control it adds must exist as a command the learner app answers, must be logged in the learner's record, and must have a learner-visible effect (a note, a hold, an injected interruption the scene shows, a changed weather or device profile). Untrusted text (crew tags, notes) is set as text nodes, never HTML.

## Evals
The content eval (`tools/eval_content.mjs`) is a ranking, not a gate; a new dimension must follow that rule. A checker (`tools/check_*.mjs`) is a gate and belongs in `check_all.mjs` only for facts that must hold (every station cites ≥1 registered standard in its category's scope; every competency's stations exist; every badge validates).

## Hand-back (≤ 250 words)
Files; the last line of `node tools/check_all.mjs`; the eval or transcript rows that prove the change; screenshots under `docs/screenshots/<area>/`; what you could not verify and why.
