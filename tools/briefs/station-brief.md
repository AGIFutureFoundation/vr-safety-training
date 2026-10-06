# Station brief (all teams)

Worktree of /home/user/vr-safety-training. First: `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge --ff-only origin/claude/vr-ar-safety-training-wkwmve` (or reset if clean). Touch only the files your task names plus the registration edits below; anything else is discarded at integration.

## Frame
Real union trades, real procedures, sited generically. Read the comment atop `WebXR/smartcity/js/sims/hunters-point.js`: never invent facts about a real site, name real people, or a clause number you are not sure of — name the body instead.

## Shape (copy three siblings your task names)
One module → one `SIM_…` object: `id, index, domain, trade, category, [district], [indoor], weather, certification, name, title, tagline, accent, accentCss, parSeconds, footprint, badge, game, hazards, steps, interrupts, lateNotes, build()`. Per station: 12–15 steps over ≥5 kinds (select/sequence/find/gauge/hold/track/turn/drag — `WebXR/shared/game.js`), 4 hazards on registered objects, 2 interruptions, `why` on every step (median ≥200 chars: the consequence or mechanism, never padding), ≥4 real authorities, 150–280 meshes, textured large surfaces (`surfaceTexture` + `pavingFace`/`deckPlateFace`/`waterFace`/`mudflatFace` in citykit), crew figures clear of controls (`tools/briefs/clear_spot.mjs`).

## Register
`node tools/add_station.mjs <id>` after each file (never hand-edit sims-meta/catalog). Programme entries go only where your task says, one-sentence `why` in the neighbours' voice.

## Footguns no checker catches
- Module-scope `const` names collide across concatenated sims: prefix uniquely, grep `sims/` first.
- `holoPanel()` returns a group: repaint `panel.userData.face`.
- `reg()` twice on one object overwrites the first hitId: give the second target its own (invisible) marker.
- Interruptions: armed on a `hold`/`track` step, answered by a control that is NOT the host step's own, and the handler must change the scene (material swap, moved mesh, `.visible`) — not only `animate()`, a canvas repaint or `.opacity`.
- `lateNotes` are keyed by the step's target hit id. Guard texture animation with `if (tex.offset)`.
- The plaza deck is solid from y −0.30 to 0: cut pits into a raised pad (`trench-box.js`, `hot-tap.js`).
- Ids ending in a common word (build/test/power/watch) confuse the incident parser. Ids like "spotter"/"attendant" mean a second crew role.
- Never write a model name or identifier anywhere.

## Verify (all of it)
1. `node tools/check_all.mjs` — 23 pass; check_smartcity reports the count your task states.
2. `python3 tools/bundle_webxr.py`.
3. Serve only on your assigned port: `python3 -m http.server <port> --directory WebXR`. Drive every station end to end with a copy of `tools/briefs/drive_one.mjs` (port + repo path changed); every interruption must fire and be answered. Chromium: `/opt/pw-browsers/chromium --use-gl=swiftshader --enable-unsafe-swiftshader`. The box is shared: retry on "Target closed"; never `pkill` anything you did not start.
4. Screenshot from spawn (`tools/briefs/shot.mjs` copy) and look at it; fix what you see.
5. `node tools/eval_content.mjs` — report each row; aim ≥90.

## Hand back
Commit in the worktree (no push, no PR). Report: eval rows, mesh counts, what each interruption does, what failed first.
