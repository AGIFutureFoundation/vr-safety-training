# LESSONS-X memory (loop 10, round 8b)

- **Station steps as data:** the catalog has step counts but no step text. The text is in `WebXR/smartcity/js/sims/<id>.js` under
  `steps: [`, written in three styles: one object per line, objects over several lines, and quoted (JSON-style) keys. Split the
  block into its top-level objects by brace depth, skipping strings, and take the first `id` / `title` / `cue` in each. Check the
  count against the catalog's `steps` (35 of 35 matched).
- **The page's figure mount** (`window.__parishTest.agentAvatars`, the parishes page's `aaWorld`) has `attach(source)`,
  `detach`, `addAgents`, `agents()` and `state(id)`. A lesson only needs to attach a source that emits `speak` / `move` /
  `complete`; the figure shows the caption itself. `aaWorld` is null on a map with no robot site.
- **The hive's agents are in `aaWorld` only when the page hive mounts** (eligible, non-demo sessions). The VBRIDGE personas are
  always there. So `lxRunInWorld` calls `addAgents` for a missing leader.
- **Interior pads:** `ix-interiors.js` builds one pad per site station, `slice(0, low ? 4 : 8)`. A pack station with pad < 4 is on a
  pad on every tier.
- **Instructor drives:** that bundle imports three.js from the CDN. A drive that aborts external requests must serve
  `WebXR/vendor/three/dist/three.module.min.js` for that URL, or the app never runs (0 cards, no page error, one console
  ERR_FAILED).
- **The standard regex** matches both "OSHA 29 CFR 1910.212" and "29 CFR 1910.212" in one line. `standardsOf` keeps the longer;
  `composeLesson` still prints both (left as it was).
- `check_parse` takes 10+ minutes on the shared box. Run it in the background early.
- The usage limit stopped this console 20:36–21:20; the coordinator moved the hand-back to 22:00.
