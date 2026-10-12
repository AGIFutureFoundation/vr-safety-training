# Console ECOSYSTEM (loop 10, round 7, prefix `eco`, port 9150)

**Task.** Map the seams between this platform and its sibling repositories, SmartCiti.X and Cognition.X. Build a Cognition.X blocks bridge and a SmartCiti.X bus adapter, write loop briefs for the other two repositories, and add `check_eco`.

**Base.** `40d97421` (fast-forwarded, hash confirmed).

**Sources.** Both sibling clones were read only. Nothing was written to them or pushed:
- SmartCiti.X at `398f287` has no licence file. Nothing of its code or data is copied.
- Cognition.X at `47c1820` is Apache-2.0 for code and CC BY 4.0 for content. An attributed extract of 91 blocks is committed.
- There is no Router.X repository. Its expected interface is marked "not yet built".

## What was built

| Item | Files | Check |
|---|---|---|
| 1. The seam map | `docs/ecosystem.md` | `check_eco` 6 (Router.X absent) |
| 2. The blocks bridge | `WebXR/shared/eco-blocks.js` (rules and matcher, plus the instructor panel), `WebXR/shared/eco-blocks-data.js` (generated extract, 73 KB), `tools/eco_extract.mjs`, `docs/ecosystem/blocks-match.json`, the instructor console's Ecosystem tab (`WebXR/instructor/index.html`, `js/app.js`, `tools/bundle_webxr.py`) | `check_eco` 1, 2, 2b, 3, 6 |
| 3. The bus adapter | `WebXR/shared/eco-bus.js` | `check_eco` 4, 5 |
| 4. Loop briefs | `tools/briefs/ecosystem/{ecosystem-loop-rules,smartcitix-adopt-bus-adapter,cognitionx-vr-station-links}.md` | `check_eco` 6 |
| 5. `check_eco` | `tools/check_eco.mjs`, plus a row in `tools/check_all.mjs` and an estimated row in `docs/perf/checkers-baseline.json` | 7 of 7 pass |

## Cycles (reason → act → observe, each with its check)

1. **Base.**
   - Reason: the brief fixes the base.
   - Act: `git merge --ff-only 40d97421`.
   - Observe: `git rev-parse HEAD` returned 40d9742128f6…; the clones' `refs/heads/main` read 398f287… and 47c1820…, matching the brief.
2. **Match on words, not substrings.**
   - Reason: the first pass matched 277 of 670 stations, but "meter" hit "perimeter", "ot-" hit "cobot" and "deploy" hit "turbidity curtain deployment".
   - Act: station patterns now match at word starts, against the id and name with hyphens as spaces. Short tokens are whole words, and the robot rule comes first.
   - Observe: 214 of 670 matched. A 25-row sample read correctly apart from a few borderline rows (for example, a fire-alarm panel room matched as electrical). The check is `check_eco` 2.
3. **Determinism without the source.**
   - Reason: CI has no Cognition.X clone.
   - Act: the checker re-matches against the extract alone. The top k of a superset, restricted to that top k, is unchanged. It also runs on shuffled input.
   - Observe: 214 station rows and 24 skill rows are reproduced, and the full re-extract from the clone is byte-identical. The checks are `check_eco` 2 and 2b.
4. **Adults only.**
   - Reason: a K-12 block must never reach an adult path silently.
   - Act: a block's band must be adult unless its rule names the band and gives a reason (no rule does). The awareness level is never mapped. A planted K-12 block is refused without a reason and admitted with one.
   - Observe: 91 of 91 extract blocks are in an adult band. The check is `check_eco` 3.
5. **The adapter against the real contract.**
   - Reason: a hand-written shape can drift from the real one.
   - Act: the checker imports SmartCiti.X's `bus.mjs`, `telemetry.mjs` and `audit.mjs` from the read-only clone at run time, without copying them. It publishes through the strict `Bus`, compares `envelope()` keys, runs `extractSignals` and appends to `AuditLog`.
   - Observe: all 2,189 events validate. The real Bus accepts 11 of 11 messages and AuditLog 2,178 of 2,178 entries. The check is `check_eco` 4.
6. **Privacy at the seam.**
   - Reason: DATAWORKS rules apply on top of SmartCiti.X's.
   - Act: six ineligible consent states are tested (unknown, demo, signed out, K-12, no adult attestation, not opted in). The checker also covers stripping of affect, mood and name, refusal of an email as an id, server time under clock skew, dedupe and revoke.
   - Observe: all hold. The check is `check_eco` 4.
7. **No network.**
   - Act: `fetch`, `XMLHttpRequest` and `WebSocket` are stubbed to count calls, and the eco sources are grepped for network and storage APIs.
   - Observe: 0 network calls. The check is `check_eco` 5.

## Evals (before → after, with sources)

| Eval | Before | After | Source |
|---|---|---|---|
| Ecosystem seams documented, with sources | 0 | 10 | `docs/ecosystem.md` seam table |
| Union and trade stations mapped to blocks | 0 of 670 | 214 of 670 (456 unmatched, listed with a reason) | `docs/ecosystem/blocks-match.json`, `check_eco` 1 |
| Robotics programme adult skills mapped | 0 of 24 | 24 of 24 (6 awareness / K-12 levels excluded) | same |
| Extract size and provenance | none | 91 blocks, 73.0 KB, commit, licence and attribution | `check_eco` 1 |
| Bus events validated | 0 | 2,189 of 2,189 (11 telemetry messages, 2,178 audit entries), also accepted by SmartCiti.X's real modules | `check_eco` 4 |
| Loop briefs | 0 | 3 (rules, SmartCiti.X adopts the adapter, Cognition.X VR-station links) | `tools/briefs/ecosystem/` |
| Network calls | n/a | 0 | `check_eco` 5 |
| Physical dispatches | 0 | 0 | `check_eco` 4 (`stats.physical`) |

## Integration

- The instructor console gains one tab, Ecosystem. It sits after Omega Claw, is mounted on first open and is read-only, with no request and no storage.
- `check_eco` 6 checks the markup, the app wiring and the bundle order, and drives the panel on a stub DOM. The tab is not yet measured in the built page.
- No other console's files were edited, apart from the one-line additions to the instructor console (index.html, app.js) and the bundle list. No console owns those files this round.

## What is left

See `tools/briefs/next/eco-next.md`.
- Drive the instructor tab in the built page on port 9150.
- Widen the rules, for example for culinary stations against Culinary Trades, which is school-band only and so needs a stated rule.
- Wire `eco-bus` to the live learner path behind DATAWORKS consent.
