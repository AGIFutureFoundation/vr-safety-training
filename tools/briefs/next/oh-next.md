# OMEGA-HIVE — next

Read `docs/consoles/OMEGA-HIVE.md` (Seams, Left) and `docs/omega-hive.md` first. Prefix `oh`. Single checkers only.

1. **Wire the avatars.** Call `aaMountAgentAvatars({ three: THREE, parent: root, agents: OH_AGENTS, source:
   window.__parishTest.hive.hive, siteAt, reducedMotion: npReduced })` in the parishes app, beside the hive mount and
   behind the same gate.
   - Check: a headless drive counts one figure per agent at its home site.
   - Check: after `hive.step()` until a `move` event, the mover's figure is at the target site (or hidden beyond
     GRIOT's radius).
   - Check: the talk indicator is on for exactly the speak events: N of N.
   - Check: 0 page errors.
2. **2× portraits on the roster.** Swap the 48 px badge in `oh-panel.js` for AGENT-AVATARS' rasterised portrait,
   keeping the SVG as the fallback.
   - Check: the cards still carry the "software agent" label, and `check_avatars` stays inside `AV_ATLAS_BUDGET_BYTES`.
3. **A hive roster on the instructor console's governance tab.** Show the portrait, name, role and the last 10 hive
   audit lines read from ENTERPRISE-3.
   - Check: `check_console` and `check_enterprise3` pass, and the roster shows 7 agents.
4. **The learner as the standing approver.** Today a standing approval covers routine simulated jobs. Add a
   "supervise every job" setting where each job waits in the queue.
   - Check: with the setting on, check 4 shows 0 dispatches without a learner approval.
5. **A second language.** Add per-language cores in `OH_CORES` (not only `voice.lang`) and pick by the page's language.
   - Check: `ohGrounded` still passes N of N, style adherence holds per language, and voices stay local only.
6. **Re-measure** `check_omega_hive` on a quiet gate and replace the estimated row in `docs/perf/checkers-baseline.json`.
7. Regenerate `guide-kb.js` so the Guide can answer from `docs/omega-hive.md` (check: `check_guide`).
