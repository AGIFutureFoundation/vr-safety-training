# OMEGA-CLAW — next

Read `docs/consoles/OMEGA-CLAW.md` (Read honestly, Seams, Left) and `docs/omega-claw.md` first. Prefix `oc`. Single checkers only. Never re-run `tools/claw_eval.mjs` on seeds 7121–7180: they are spent.

1. **Compare the small language-conditioned model, declared first, on fresh seeds.** After ROBO-ARENA's `ra-lm.js` is integrated:
   - Commit a new protocol (`OC_PROTOCOL_2`) with fresh held-out seeds the coordinator names. It declares `ra-lm` (and the round's other challengers) against the current incumbent per gym scenario.
   - Then run it once. `ocClaw` refuses spent seeds, so a new claw instance must start from the new protocol's seeds only.
   - Check: `check_claw` gains a protocol-2 section: the ancestry check, N comparisons run once, the verdicts re-derive, and refusals still 3 of 3.
   - Check: report the small model's success against the clone as measured, whatever it is.
2. **People beside robots with a real opted-in learner.** Drive the parishes page with a DATAWORKS opt-in adult profile (the `dx-data.js` signals) and a few drills recorded through `drRecord`.
   - Check: the panel's practice block shows those drills, with `data-learner="local"`.
   - Check: with the same profile in `?demo` or K-12, it shows nothing.
   - Check: 0 requests leave the page.
3. **The world in the scene.** Add a small status light per robot site, driven by `ocWorld.stats().sites` (busy or idle), within the desktop high tier's stated budget. Phone and headset stay unchanged.
   - Check: meshes, triangles, draw calls and texture bytes per tier, before and after, measured in the built page.
4. **Trim the record.** Keep the full chain in `docs/evals/claw.json`, but give the page module the head hash and line count only (about −55 KB). The page then verifies against the hash.
   - Check: `check_claw` 4 still re-walks the full chain from the JSON. The page shows the head hash.
