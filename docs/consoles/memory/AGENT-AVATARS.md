# AGENT-AVATARS memory (loop 10, `aa`, port 9092)

- 10:17 UTC · base 43d3e3f6 (fast-forward from 589f0d87), identity set. Read the loop-10 brief, packs-brief, packs-brief-3, AVATARS, GRIOT,
  VBRIDGE, ROBOTRAIN-4, crew.js (`ctAvatarFigure`, `CT_AVATAR_BUDGET` 12), av-characters.js, av-sprites.js, npc.js (radii 150 / 600 m),
  rb-world.js, vb-panel.js, vb-bridge.js, the parishes app and the instructor governance view.
- 10:33 UTC · 6069124b · `aa-agent-avatars.js` (figures, events, VBRIDGE source) + `aa-agent-portraits.js` (faceless agent-outfit
  portraits, 2× raster cache, createElement roster) + `check_agent_avatars.mjs`. Two fixes on the way: a queued line could start
  before it arrived (start is now max(arrival, previous end)); steward and governor drew the same shield (distinct glyphs now).
- 10:36 UTC · 86041c98 · parishes app mounts the four VBRIDGE personas over `__parishTest.vbridge` (hive attach guarded on
  `__parishTest.hive`); governance tab roster; bundler lists; check_all row; estimated baseline row (1.5 s, labelled an estimate).
- 10:50 UTC · drive 1 under load 22: per-tier costs measured (low unchanged); provider at the job's site; fixture hive exact 5/5 in
  real frames. Two lessons: read captions and gestures from the logs (a frame can outlast a short line at load 22 — `gestureLog()`
  added); robot sites on one map are about a kilometre apart, so a long move now re-projects 24 m short and walks in.
- Traps: `scene.traverse` counts children of a hidden group — use `traverseVisible` for a "layer hidden" measurement. The
  instructor bundle lists av-sprites.js after governance.js; that is fine because governance reads the portraits at render time.
- Commit trailer: `Co-Authored-By: Claude <noreply@anthropic.com>` — no model identifier (the first commit was amended for that).
