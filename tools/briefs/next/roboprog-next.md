# ROBOPROG — next

1. After COLEARN (`col-learn.js`) merges: `node tools/gen_robotics_programme.mjs`, then `node tools/check_robotics_programme.mjs`
   (it also runs `colEvalScenario` on the cobot scenario when the module is present); the page should show the loop 5/5 live.
2. Mount `colMountCoLearn` (watch the robot demonstrate, then try it) from the AI-training level of the programme page.
3. Browser-drive the four new stations on a fresh port with a working copy of `tools/briefs/drive_one.mjs` and take spawn
   screenshots (needs a rebuilt `smartcity/dist`).
4. Deep-link each track's stations from the ROBOTICS in-world rig panels (`rb-world.js`, `RB_SITES`).
5. Gaps still open that the brief named: teach-pendant safe use, a cobot power-and-force-limiting check and recovering a robot
   after an e-stop as their own stations (today they are taught inside the cobot and cell stations).
