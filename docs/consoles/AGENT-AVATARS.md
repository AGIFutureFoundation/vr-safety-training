# AGENT-AVATARS (`aa`, port 9092) — the software agents get a body, a face that is not a face, and a voice light

Loop 10 (SmartCiti.X Holodeck · Powered by AGI Corp). Base 43d3e3f6. Built to the contract between OMEGA-HIVE and
AGENT-AVATARS in the loop-10 brief and tested against a **fixture hive** of three agents emitting the contract's events;
OMEGA-HIVE's modules (`oh-hive-data.js`, `oh-hive.js`) were written in parallel and are not imported. The four VBRIDGE personas
are embodied for real, over the agent-jobs panel's own job stream.

## What is here

| File | What |
|---|---|
| `WebXR/shared/aa-agent-avatars.js` | `aaMountAgentAvatars` (the seam): one figure per agent — crew.js `ctAvatarFigure` re-tinted as a hologram of the agent's accent (no skin, no face) plus the agent marker (a visor and a halo) and the agent outfit set (high-visibility vest with a neutral glyph badge, a tablet); a floating label "software agent · <role>" under the name; a talk light; a caption bubble. Listens to any `on(type, fn)` source for the contract's eight event types. `aaVbridgeAgents`, `aaVbridgeSource` (the agent-jobs panel as a contract source), `aaEmitter`, `aaLineMs`. |
| `WebXR/shared/aa-agent-portraits.js` | Faceless agent portraits in the outfit set (`aaPortraitSvg`), drawn over av-sprites.js's `AV_PARTS` head and torso silhouettes; `aaPortraitPng` rasterises at size × device pixel ratio once and caches; `aaPortraitImg`; `aaMountAgentRoster` (createElement/textContent only); `AA_VBRIDGE_PERSONAS` (mirrors the registry's four entries, held equal by the checker). |
| `WebXR/parishes/js/app.js` | Mounts the four VBRIDGE personas at the map's first robot site over `aaVbridgeSource(window.__parishTest.vbridge)`, attaches the hive when `window.__parishTest.hive` exists (guarded), animates in the frame loop, exposes `window.__parishTest.agentAvatars`. |
| `WebXR/instructor/js/governance.js` | "Software agents (roster)" panel on the governance tab: portraits at 2×, name, a "software agent" chip, role and home site; `ent3MountGovernanceView(root, { agents })` takes the hive's agents. |
| `tools/check_agent_avatars.mjs` | The checker (69 checks; in `check_all`, estimated baseline row). |
| `tools/drive_agent_avatars.mjs` | The headless drive of the built pages (not in the gate): per-tier cost, the VBRIDGE job, the fixture hive in real frames, reduced motion, the instructor roster at 2×. |
| `tools/bundle_webxr.py` | Parishes bundle: the portraits then the avatars after `vb-panel.js`. Instructor bundle: the portraits after `av-sprites.js`. Bundles rebuilt for the drive, not committed. |

Behaviour, per event (contract: `{ t, type, agent, text?, to?, jobId?, reason?, caption? }`):
- **move** — the agent takes a free standing spot at the target site (12 spots, 9.3–16 m out on the north, east and west sides:
  outside the robot's 6 m warning zone and its pad, never in the south corridor where boards and arrival spots are — GRIOT's
  placement rule) and walks there at 2.2 m/s. Positions are written per frame only within GRIOT's animate radius (150 m) of the
  learner; beyond its hide radius (600 m) the figure is hidden. Robot sites on one map can be a kilometre apart, so a move longer
  than 150 m re-projects the agent 24 m short of its spot on the line it was travelling and it walks in. A site not on this map
  hides the figure; coming back onto the map shows it at once.
- **speak** — the talk light runs for exactly the line's window (400 ms plus the words at 165 per minute, 1.5–12 s; lines queue
  end to start so an agent never talks over itself) and a caption bubble shows the line above the figure for the same window.
  `talkStart(id)` / `talkEnd(id)` let an on-device voice hold the light for the real utterance instead.
- **refused** — a calm stop gesture (the tablet raised, palm-out) for 1.8 s, with the refusal's own text as a caption.
- **complete** — a nod (0.9 s).
- **bid / award / dispatch / approval-request** — a caption when the event carries one; nothing moves.
- **Reduced motion** — no walking (figures jump), no nod or bob, the talk light holds still; captions show as always.
- **Tiers** — the phone tier ("low") builds no figures: its meshes, triangles, draw calls and texture bytes do not change.
  Balanced and high build them. Budget per figure: `AA_AGENT_BUDGET` = crew.js `CT_AVATAR_BUDGET` = 12 meshes + sprites
  (GRIOT's ceiling); the figure uses 11 (9 meshes, 2 sprites). Texture: a 256 × 64 label canvas per figure at mount and a
  512 × 128 caption canvas on its first line — at most 320 KiB per figure, desktop tiers only.

## Evals (before → after)

| Measure | Before (43d3e3f6) | After | Source |
|---|---|---|---|
| Agents embodied | 0 | **3 fixture hive agents** (a seven-role roster fixture builds 7) **+ 4 VBRIDGE personas** in the built page | `check_agent_avatars` sections 2 and 5; drive section 1 (4 figures at the SoMa robot cell, balanced and high) |
| Meshes + sprites per figure | — | worst **11** (≤ 12) | `check_agent_avatars` "meshes + sprites per figure ≤ 12 — worst 11"; drive section 1 |
| Every robot site's own total inside its site budget | 7.5 / 7 / 7 / 7 / 8 per site (≤ 8; phone ≤ 3) | **unchanged** (agents on their own root, 0 added to a site group) | `check_robotics` 19/0; `check_agent_avatars` site line |
| Talk light active exactly during each speak event | — | **6 of 6** (20 Hz samples); **5 of 5** in real frames in the built page | `check_agent_avatars`; drive section 3 |
| A caption bubble for every speak event | — | **6 of 6**; **5 of 5** in the built page | same |
| Provider stands at the job's site when the panel runs a job | — | **yes** (job 1, `rb-site-soma-robot-cell`, 10.3 m from its centre) | drive section 2; `check_agent_avatars` section 6 |
| Portraits crisp at 2× | SVG badges only | 48 px cards showing **96 px PNGs** rasterised once and cached | `check_agent_avatars` "48 px at 2× → 96 px, cached"; drive section 5 |
| Atlas bytes (`AV_ATLAS_BUDGET_BYTES` 160 KiB) | 155.9 KiB | **155.9 KiB** (hive portraits drawn at runtime, not packed) | `check_avatars`, `check_agent_avatars` |
| `eval_worlds --no-browser` (ASSAYER's rubric) | 51 subjects, mean 100, 5 findings | **51 subjects, mean 100, 5 findings** — all 51 subject lines identical | `node tools/eval_worlds.mjs --no-browser` on an export of 43d3e3f6 and on this tree |
| Page errors / external requests in the drives | — | **0 / 0** (second run) | `node tools/drive_agent_avatars.mjs 9092` |

Per tier, measured in the built parishes page (`node tools/drive_agent_avatars.mjs 9092`, section 1, second run) on sf-downtown
with the camera 24 m south of the robot site looking at it; "before" is the same frame with the agent layer hidden (nothing
else differs from the base tree); scene meshes and sprites are counted with `traverseVisible`. Load average was 22–25 on the
shared four-core machine, which affects frame times, not these counts.

| Tier | Draw calls before → after | Triangles drawn before → after | Visible scene meshes / sprites before → after | Layer meshes / sprites / triangles | Layer texture bytes |
|---|---|---|---|---|---|
| low (phone) | 153 → **153** | 56,490 → **56,490** | 194 / 0 → **194 / 0** | 0 / 0 / 0 (no figures) | 0 |
| balanced | 192 → **228** (+36) | 117,852 → **121,332** (+3,480) | 266 / 0 → **298 / 4** | 36 / 8 / 4,048 (4 figures) | 262,144 (4 labels; a 262,144-byte caption canvas is added per figure on its first line) |
| high | 190 → **226** (+36) | 159,668 → **163,148** (+3,480) | 266 / 0 → **298 / 4** | 36 / 8 / 4,048 (4 figures) | 262,144 |

The +36 draw calls are the 32 shown meshes and 4 labels (talk lights and captions are hidden while no one speaks); a speaking
agent adds its talk light and caption (2 calls). Headset: the tier a headset gets is one of these three; on "low" nothing is
built. A map with no robot site mounts nothing, and an agent homed on another map has no figure here until it arrives.

## Cycles (reason → act → observe)

1. Reason: one figure per agent inside GRIOT's ceiling, labelled, visibly software; check = `check_agent_avatars` "meshes +
   sprites per figure ≤ 12" and the label line. Act: `aaBuildFigure` (ctAvatarFigure, hologram material, visor, halo, vest,
   badge, tablet, talk light, label, caption). Observe: worst 11, 3/3 labelled, 3/3 hologram — pass (6069124b).
2. Reason: the talk light exactly during each speak event; check = the 20 Hz exactness line, N of N. Act: per-agent line queue.
   Observe: 3 of 6 — fail. Two causes: the checker sampled the frame at an event's own timestamp before the event was heard,
   and a queued line could start at the previous line's end even when it arrived later. Fixed both (a line starts at
   max(arrival, previous end); samples read the state after the event). Observe: 6 of 6 — pass.
3. Reason: every agent's portrait is its own; check = "distinct of N". Observe: 13 of 14 — the steward and the governor drew the
   same shield. Act: distinct glyphs (a shield with a bar; a shield with a dot). Observe: 14 of 14 — pass.
4. Reason: wired into the product without breaking neighbours; check = the wiring lines, `check_imports`, `check_console`,
   `check_avatars`, `check_vbridge`, `check_robotics`. Act: app mount, governance roster, bundler lists, check_all, baseline.
   Observe: 66/66; 1105 modules; console, avatars (57/57, atlas 155.9 KiB), vbridge and robotics (19/0) green (86041c98).
5. Reason: the cost per tier, measured in the built page; check = drive section 1. Act: the drive. Observe: low unchanged
   (154 calls, 57,228 triangles); balanced and high +36 calls, +3,480 triangles, 256 KiB of label textures for 4 figures — pass.
6. Reason: the VBRIDGE job in the built page; check = drive section 2. Observe: the provider stands at the job's site — pass; the
   caption and nod checks failed because at load 22 a frame outlasted the short lines. Act: read the caption and the new
   `gestureLog()` instead of the instant. Observe: see cycle 8.
7. Reason: on oak-west-oakland the two robot sites are about 980 m apart, so every hive move was a jump and nothing walked in the
   page; check = drive section 3 `walkSeen` and a checker line. Act: a move longer than 150 m re-projects 24 m short and walks in.
   Observe: checker "re-projects 24 m short of the spot and walks in" — pass (67/67); the page result is in cycle 8.
8. Reason: the second drive on the rebuilt page; check = every drive line. Observe: (filled in below at the hand-back).

## Seams

- **The contract seam** (OMEGA-HIVE ↔ AGENT-AVATARS): `aaMountAgentAvatars({ three, parent, agents, source, siteAt,
  reducedMotion, tier, groundAt })`. `agents` is `OH_AGENTS` (any array of `{ id, name, role, homeSite, avatar: { glyph,
  accent, outfit } }`; `roleLabel` is used when present, else a short `role`, else the id's words). `source` is the hive (anything
  with `on(type, fn)`), or an array of sources. `siteAt(siteId)` returns `{ x, y, z }`, `[x, z]` or null when the site is not on
  this map. Returns `{ root, handle(ev), animate(t, dt, here), attach(src), detach(src), addAgents(list), agents(), state(id),
  figure(id), talkStart(id), talkEnd(id), talkLog(), captionLog(), gestureLog(), counts(), dispose() }`.
- **How the coordinator wires it to the hive in `WebXR/parishes/js/app.js`** — the avatar mount is already in place right after
  the agent-jobs mount (`window.__parishTest.vbColearn = vbProvider;`) and reads the hive from `window.__parishTest.hive`:
  ```js
  var aaWorld = (() => { try {
    const hive = window.__parishTest.hive ?? null;
    const hiveAgents = hive ? (typeof hive.agents === "function" ? hive.agents() : hive.agents) ?? [] : [];
    return aaMountAgentAvatars({ three: THREE, parent: root, agents: [...hiveAgents, ...aaVbridgeAgents(rbWorld?.sites?.[0]?.id ?? null)],
      source: [hive, aaVbSource].filter(Boolean), siteAt: aaSiteAt, reducedMotion: npReduced, tier: npTierName, groundAt: … });
  } catch (_) { return null; } })();
  ```
  So the only integration step is **order**: OMEGA-HIVE's Omega Hive panel mount (the line that sets `window.__parishTest.hive =
  ohMount…(…)`) must run **before** this block. If the hive is created later (for example lazily when its panel opens), call
  `window.__parishTest.agentAvatars.addAgents(hive.agents)` and `window.__parishTest.agentAvatars.attach(hive)` at that moment
  instead — both are idempotent. `aaSiteAt` maps a site id to `rbWorld.sites` (this map's robot sites, with ground height).
  The frame loop already calls `aaWorld?.animate(now / 1000, dt, np.playing && !np.modal ? [np.x, np.z] : null)`.
- **Voice** (OMEGA-HIVE's `ohSpeakAs(agent, text, { onstart, onend })`): pass `onstart: () => aaWorld?.talkStart(agent.id)` and
  `onend: () => aaWorld?.talkEnd(agent.id)` when voice is on; with voice off the light follows the line's clock window.
- **Instructor console**: `ent3MountGovernanceView($("ent3-root"), { toast, agents: OH_AGENTS })` in `WebXR/instructor/js/app.js`,
  plus `oh-hive-data.js` in the instructor bundle list; the roster then shows the seven agents beside the four personas.
- **Portraits for OMEGA-HIVE's roster cards**: `aaPortraitImg(agent, { size: 48 })` returns an `<img>` that shows the SVG at once
  and swaps to the cached 2× PNG; `aaPortraitSvg(agent, { size, kind })` for markup; `aaRoleLabel(agent)` for the short role.
- **VBRIDGE**: `aaVbridgeSource(vbApi)` reads `vbApi.state()` only (polled from `animate`); the panel is never driven from here.

## Left

- The real hive: until integration the seven agents are embodied through fixtures only (three with events, seven for the
  roster shape). The coordinator's order fix above closes it; `tools/briefs/next/aa-next.md` has the checks.
- Walks are straight lines (through buildings when a route crosses one); routing round CITYWORKS' colliders is next.
- Agent spots inside ROBO-INTERIORS' rooms (`room.spots.agent`) are not used yet.
- The talk light is clock-driven unless the voice seam is wired (above).
