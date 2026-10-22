# Next brief — AGENT-AVATARS-2 (`aa`): the hive's agents in person, after integration

Read first: `docs/consoles/AGENT-AVATARS.md` (Seams, Left), `docs/consoles/OMEGA-HIVE.md` once it lands, `WebXR/shared/aa-agent-avatars.js`
(the header is the contract), `aa-agent-portraits.js`, `tools/check_agent_avatars.mjs`, `tools/drive_agent_avatars.mjs`.

## What to do

1. **Close the seam with the real hive.** OMEGA-HIVE's `ohHive()` and `OH_AGENTS` exist after integration. In the parishes app the
   avatars already attach to `window.__parishTest.hive` when it is set before the avatar mount; check the order in `app.js`
   (the hive's panel mount must come first), then replace the fixture in `tools/check_agent_avatars.mjs` section 2 with a seeded
   `ohHive({ seed: 1, governor, audit })` run of 50 steps: every `speak` event's talk window exact, a caption per speak, every
   `move` ending at the named site. Check: the checker prints "N of N" for the real hive with N ≥ 30.
2. **The voice drives the light.** Wire `ohSpeakAs(agent, text, { onstart, onend })` to `aaWorld.talkStart(agent.id)` /
   `aaWorld.talkEnd(agent.id)` when voice is on (captions stay on the clock when it is off). Check: in the drive, with the stubbed
   `speechSynthesis` (one local voice, one network voice), the light is on from `onstart` to `onend` for every line, and the network
   voice is never chosen.
3. **The instructor roster gets the seven.** Pass `OH_AGENTS` to `ent3MountGovernanceView(root, { agents: OH_AGENTS })` in
   `WebXR/instructor/js/app.js` (and add `oh-hive-data.js` to the instructor bundle list before `governance.js`). Check: the drive's
   section 5 counts 11 cards, every portrait a 96 px PNG at 48 px CSS on a 2× screen.
4. **Walking that respects the city.** Moves now walk straight (re-projecting 24 m short when the sites are more than 150 m apart).
   Use CITYWORKS' `cwSidewalkAt` / colliders to route the walk-in round buildings (a two- or three-leg path is enough). Check: no
   walk point inside a `cwColliders` box on the five robot-site maps.
5. **If time:** an agent spot inside each ROBO-INTERIORS room (`room.spots.agent`): when the learner is inside a robotics room,
   the site's agents stand at those spots. Check: each of the six rooms shows its agents at its spots, inside `IX_BUDGET`.

## Rules that stay

Agents are software and say so (label, hologram tint, no face); no LLM or network call; on-device voices only and off by default;
captions always show; nothing listens. Phone tier builds no figures. One figure ≤ `AA_AGENT_BUDGET` (12) meshes + sprites.
Single checkers only; `check_agent_avatars`, `check_avatars`, `check_imports`, `check_console`, `check_robotics`, `check_vbridge`.
Rebuild bundles (`python3 tools/bundle_webxr.py parishes instructor`) before `node tools/drive_agent_avatars.mjs <port>`.
