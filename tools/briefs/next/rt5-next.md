# ROBOTRAIN-5 → next

- Put `tools/drive_robotrain_page.mjs` in the gate once the coordinator has measured it on an idle machine (about 60 s). It
  needs an entry in `tools/check_all.mjs` and in `docs/perf/checkers-baseline.json`.
- The AMR hard clone completes 0.050 of runs against the expert's 1.000. Try features that see the second crossing's timing ahead
  and a route around the blocked cell, or more demonstrations. Measure through `tools/col_eval.mjs` and report the gap as
  measured, whatever it is.
- AGENTGYM baselines for the three hard variants.
- On the hard port lane the scripted stand-in's pose path passes 8 of 20 seeds (its lag reaches the stop zone late). A lower-lag
  stand-in, or a hold-to-confirm on the joystick, could be measured as an interface change.
- A real headset session for the recorder (the XR seam is proven with stubbed sessions only).
