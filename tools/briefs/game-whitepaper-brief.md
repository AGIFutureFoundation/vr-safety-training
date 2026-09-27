# Game whitepaper brief — Bay World, the Regatta, the Deep and Fairway Park as one training game

Binds SCRIBE (console SCRIBE). `console-brief.md` applies. Every number in the paper is produced by a command or read from a file named beside it; nothing is estimated. Facts about real places, people or organisations are limited to what the repo's own sourced briefs state; the world is stylised and says so.

## Deliverable
`docs/GAME-WHITEPAPER.md` (8–12 pages of markdown) with a `docs/game-whitepaper-facts.json` beside it (the numbers, each with its source command), covering:
1. Thesis — why a free-roam training game: engagement, spaced practice, the job board as the bridge from play to graded procedures, accountability through the career ledger and the training records (`WebXR/shared/records.js`, `competency.js`).
2. The worlds — Bay World (`WebXR/shared/bayworld-data.js`: bounds, zones, landmarks, sites, roads; the game under `WebXR/bayworld/`), Fairway Park (`fairway-data.js`, `WebXR/fairway/`), the Deep (`underwater-data.js`, `WebXR/underwater/` if present), the Regatta (`WebXR/regatta/` if present), the Bay Atlas and the Mapbox layer (`docs/mapbox.md`), the sky, weather and wildlife layer (`WebXR/shared/sky.js`, `wildlife.js` if present).
3. Gamification — quests, side quests per programme, eggs, activities and scoring (`docs/bayworld-quests.md`, `WebXR/bayworld/js/quests-data.js` counts), ladders, bingo, radio quiz, liveries, milestones; what is deliberately absent (violence, gambling).
4. The unions and trades in the game — how the 111-union registry, the programmes and the categories map onto sites (`tools/unions.json`, `catalog.json` curricula, the site anchors); the yacht and charter crew, diving, ecology and maritime packs in detail.
5. Content quality — the eval (`tools/eval_content.mjs`, the corpus mean, the checkers, the facts rules, the briefs under `tools/briefs/`).
6. Data, robots and the Unity bridge — episodes, the dataset tools, the sharing layer (`docs/` pages that exist), `docs/unity.md` if present.
7. Roadmap — what the consoles under `docs/consoles/` list as open.
Also add a short "The game" section (≤300 words) to `docs/WHITEPAPER.md` linking to the game paper, and a README link.

## Process
Start with `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge --ff-only FETCH_HEAD`; re-fetch and merge again before your final commit so the paper reflects what has landed. Keep `docs/consoles/SCRIBE.md`. Commit in steps; each commit message ends with the two trailer lines in your task. Gate with `node tools/check_all.mjs` (exact "All N checkers pass" line). Hand back within 45 minutes: ≤200 words, commit hashes, the check_all line, the word count.
