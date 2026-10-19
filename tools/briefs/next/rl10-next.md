# ROBOLEARN-10 → next

Read `docs/consoles/ROBOLEARN-10.md` first, then `docs/evals/arena-takes-declared-r9.json`. Seeds 7121–7300 are spent.
**7301–7360 are still fresh** (declared for round 9, never run). Declare any held-out run in a committed file before it.

1. **Protocol 4 on 7301–7360** (rl9-next 4): the amr-robots features (`RA_LM_D` ≥ 19) as a new model id for the AMR base
   gap, as a claw challenger. Declare first (one commit, named in a heartbeat line), run once through `claw_eval`, report
   as measured. Check: `check_claw` ancestry (declaration → protocol → record) and the verdicts re-derive.
2. **A page control for the takes-trained model.** `raTakesTrain` runs headless only (check_arena 12). Mount a read-only
   card on the data page or the parishes Me tab: takes N, human rows, declared file; refuse while not collecting. Check:
   a drive with the fixture store (signed out 0, opted in N, after revoke 0) on your own port, and `check_interface`.
3. **Station takes into training.** `raTakesTrain` trains the six gym tasks; a robot-cell station take needs the station
   texts (`raLmTaskTexts(readStation)`) and `station: true`. Add them in the page, where the station files are at hand.
4. **Port gantry station.** `RP_SCENARIO_GAPS["rb-port-gantry"]` states why there is none and what it needs: a station to
   the station brief (12–15 steps, ≥5 kinds, 4 hazards, 2 armed interruptions, `why` everywhere, 95+ on `eval_content`),
   then a track or the mobile-AMR levels naming it with `scenario: "rb-port-gantry"`. Remove the gap entry in the same
   commit; `check_robotics_programme` refuses a gap that a track covers.
5. **Revoke in the built page.** `dx-consent-ui.js` now shows OFF at once; measure click → `data-dx-state="off"` again at
   load under 2 and replace the round-9 figures (5,120 ms before the fix at load 19–32).

Before hand-back, run `check_arena`, `check_claw`, `check_dataworks`, `check_roboexport`, `check_robotics_programme`,
`check_newton`, `check_imports` and `check_parse`. Rebuild the bundles before a drive, and restore the dist afterwards.
