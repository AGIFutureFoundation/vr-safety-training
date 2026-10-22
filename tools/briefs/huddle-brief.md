# Huddle brief — emotional intelligence and deep basketball teamwork

Binds HUDDLE (console HUDDLE). `station-brief.md`, `ladder-brief.md`, `wave100-brief.md`, `console-brief.md` apply. Read the current `civic-leadership-and-ei` (17 stations) and `basketball-fundamentals` (18 stations) programmes, their stations in `WebXR/smartcity/js/sims/`, `WebXR/shared/ei-guide.js`, and the `gym-court` district.

## Optimise what exists
- Run `node tools/eval_content.mjs --json` for both programmes; lift every station under 94 (decision density, explanation depth, variety, a second interruption that changes the scene) without inventing facts; the flat sourced briefings stay flat but gain a practice step where the station brief allows.
- `ei-guide.js`: add lines for teamwork moments (a teammate's mistake, a disagreement at a huddle, a loss, a win shared) and a short reflection prompt after team stations; keep the peer-support rules.

## New stations (prefix `bb-` for basketball, `ei-` for EI; 12–15 steps, ≥6 kinds, 4 hazards, 2 scene-changing interruptions, eval ≥ 92 with standards score 1, citations only in registry form — coaching and youth-sport bodies already in `tools/standards.json`, and CASEL/SAMHSA-style bodies only if the registry holds them)
Basketball teamwork, played on the gym court with a crew of teammates:
1. `bb-pick-and-roll-communication` — calling the screen, the switch and the recovery out loud; the lesson is talk before you move.
2. `bb-help-defense-rotations` — help, recover, and the weak-side call; trust the rotation behind you.
3. `bb-transition-spacing-and-roles` — lanes filled, roles held, the extra pass over the hero shot.
4. `bb-timeout-huddle-and-adjustment` — a captain runs a thirty-second huddle: one fact, one change, one encouragement; nobody blamed.
5. `bb-losing-well-and-film-review` — after a loss: own your part, name one thing to fix, thank the teammate who covered for you.
Emotional intelligence at work:
6. `ei-conflict-on-the-crew` — two crew members clash on a job; notice, name, slow it down, get to the fix.
7. `ei-giving-and-taking-feedback` — feedback that names the behaviour, not the person, and taking it without defending.
8. `ei-leading-under-pressure` — a lead keeps the team steady when the schedule slips; calm voice, clear next step, credit shared.
Add the `bb-` stations to `basketball-fundamentals` and the `ei-` stations to `civic-leadership-and-ei`, update their competencies, and add a "Teamwork" side quest pair in Bay World at the court or the college (regenerate with `node tools/gen_bay_quests.mjs`).

## Process
Start with `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge --ff-only FETCH_HEAD`. Keep `docs/consoles/HUDDLE.md`. Commit per green station; each commit message ends with the two trailer lines in your task. Regenerate (`gen_catalog`, `gen_bay_quests`, `gen_dive_quests`, `gen_compliance`, `gen_wiki`, `node tools/check_interop.mjs --write`, `gen_home`, `bundle_webxr.py`, `node tools/export_unity.mjs`, `gen_investor`) and gate with `node tools/check_all.mjs` (exact "All N checkers pass" line). Hand back within 40 minutes: ≤200 words, commit hashes, the check_all line, the eval scores.
