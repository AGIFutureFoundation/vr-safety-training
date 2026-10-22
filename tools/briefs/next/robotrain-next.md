# ROBOTRAIN — next

1. Browser-drive the four `rt-*` stations on port 9042 with a working copy of `tools/briefs/drive_one.mjs` (every interruption
   fired and answered) and take spawn screenshots; `check_smartcity` drives them headlessly today.
2. A WebXR controller pose source for `rtMountTeleop`: `XRInputSource` grip pose → `pose.p` (bench frame), trigger → `pose.trigger`,
   squeeze → `pose.squeeze`, a button → `pose.estop`; then let the cobot rig at `rb-site-san-jose-robotics-lab` follow the pose.
3. Extend `rtCompare` to a second task (the cell entry, where the "human" walks) and report both in `docs/evals/`.
4. Surface `rtCompare()`'s table on the programme page's AI-training level next to the loop (guarded like `rpRecorder`).
5. TQ-ROBOTICS / VBRIDGE: read `rpGapCoverage()` and `rtCompare()` into the shared export's robotics section.
