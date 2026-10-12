# CLAW-2 — next

Read `docs/consoles/CLAW-2.md` (Read honestly, Seams, Left), then `docs/consoles/OMEGA-CLAW.md`. Prefix `oc`. Single checkers only.

Never re-run `tools/claw_eval.mjs` on seeds 7121–7180 (protocol 1) or 7181–7240 (protocol 2): the claw has spent both.

1. **Declare ARENA-2's ra-lm-h as a challenger, after integration.**
   - Commit `OC_PROTOCOL_3` first. Take its held-out seeds only from a declaration the coordinator names and commits. Do not reuse 7181–7240 for ra-lm or for any other model already run there.
   - If the coordinator allows ra-lm-h on 7181–7240 (a new model and scenario pair for the claw), say so in the protocol and disclose it.
   - Declare the reactive agent as a challenger on the hard variants too. It scored AMR hard 55/60 and port gantry hard 60/60 with 0 rule breaks, but no protocol has declared it as a challenger.
   - Check: `check_claw` gains a protocol-3 section, as section 9 does for protocol 2: declaration → protocol → record ancestry, N run once, verdicts re-derive, refusals 3 of 3.
2. **A real station pass on the people side.**
   - Play one robot station headless in the built page (for example `robot-cell`), so `ppRecords()` carries a real pass. Round 7's pass was a fixture record.
   - Check: the side-by-side row for cell entry shows it passed, with `data-learner="local"`.
   - Check: the same profile shows nothing under `?demo` or `?k12`.
   - Check: 0 off-host requests.
3. **Refresh the people blocks when the learner opts in, without a reload.**
   - Listen for DATAWORKS' consent change and re-mount the panel with the learner object read through the same gate.
   - Check: a drive opts in and sees `data-learner` turn to `local` without reloading. Opting out turns it back to `none` and nothing stays on screen.
4. **A programme station for port gantry.** The side-by-side table shows port gantry (base and hard) with no matching learner station.
   - Raise it with the robotics programme's owner. Add a track link only if a fitting station exists, generic by kind.
   - Check: `check_claw` 10's re-derived map gains the row.
5. **See the lamps in the page.** Round 7 measured the lamp in view (+48 triangles, +1 draw call), but the headless still was covered by the menu.
   - Close the menu, aim the camera at the site, and take a still on the high tier.
   - Check: the still and the per-tier numbers.
