# Loop brief — the 15-minute build tick

The standing instruction, rewritten once so every tick and every team reads the same thing.

## What a tick is
Every 15 minutes, for the length of the loop the user set:
1. **Heartbeat** — `node tools/check_all.mjs` (gate) and `node tools/eval_content.mjs` (ranking). Report the checker count, corpus mean, and anything under 90 other than the two flat briefings.
2. **Integrate** — every team worktree that has handed back: three-way apply excluding `dist/` and screenshots, copy screenshots, keep every checker in `check_all.mjs`, regenerate metadata with the generators (never by hand), gate the commit on the exact "All N checkers pass" line joined with `&&`, push to the working branch with the required trailers.
3. **Publish** — rebuild the site (`build_site.sh`) and republish the artifact at its existing URL; regenerate the compliance matrix and the wiki series page; refresh `docs/STATUS.md` with the wave's stations, scores, screenshots and what failed first.
4. **Show** — record a narrated review film of the stations that landed since the last tick (`tools/review`), and send it to the user as a downloadable file with a one-line caption. If nothing landed, send the strongest still from the wave instead and say so.
5. **Re-arm** — schedule the next tick; stop when the loop's time is up or every team is integrated, and say which.

## Rules
- Never push red: a commit that follows a failed checker is a bug in the loop, not in the content.
- Never guess: a fact about a real person, organisation, standard or device that cannot be sourced is written as unverified.
- One task per team, one worktree per team, unique ports and helper-script copies; hand back ≤ 250 words in the brief's format.
- Consoles, evals, heartbeat, wiki, GitHub updates and films are the loop's outputs; the briefs under `tools/briefs/` are its inputs. Change the brief, not the tick.
