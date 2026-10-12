# A day in the Holodeck: three personas

Three walkthroughs, each a real path through existing stations: an apprentice laborer, a robot technician, an AI-training specialist. Composites, not measured people.

## Real paths through the stations, one person at a time

These walkthroughs are each a real path through stations that exist in the repository, with each station's content score from the platform's own evaluation. The people are composites written to show the paths; no learner has been measured on them. Time figures are each station's par time, the target the scoring uses, and not a measured duration.

### (Persona A)An apprentice laborer, new to a site with a drilling robot

A composite, not a measured person. She starts at the awareness level, learns what silica dust does to a drilling crew and then sets up the ceiling-drilling robot that will work above her. Dust control follows OSHA 29 CFR 1926.1153 Table 1.

**3 ** stations **39 ** scored steps **970 ** seconds of par time in all

1.

#### How a Robot Knows to Stop `k12-rp-how-a-robot-knows-to-stop`

Awareness level: module score 60 within 14 days; collects no data

A lesson written for school classes and open to community members at the same level. She finds the robot's sensors, stands on the visitor line, holds still in the warning zone and says who may start the robot again.

**The site interrupts:** a visitor steps too close and the robot stops, and the technician asks how it knew to slow down.

Content score 95 · 13 steps · 4 hazards · 2 interruptions · par 330 seconds

2.

#### Concrete Drilling and Silica Dust Cues `sil-concrete-drilling-and-silica-dust-cues`

Builders-trades programme, not the robotics programme

She reads the written exposure control plan, walks the drill, the collector and the cleanup kit, does a seal check on her mask, sets the collector's airflow, drills with the shroud flush, vacuums the holes instead of blowing them out and cores the pipe penetration wet.

**The site interrupts:** the collector hose pops off mid-hole, which she must raise herself, and another crew's dust drifts onto her work area.

Content score 97 · 14 steps · 4 hazards · 2 interruptions · par 320 seconds

3.

#### Ceiling-Drilling Robot Set-Up `rp-construction-drilling-robot-setup`

Robot operator level in construction robotics: module score 75 within 21 days

She reads the work plan and the deck scan, barricades the robot's reach, connects the dust collection, finds the hole she must not drill, holds the enable while the robot drives to the first hole and changes the bit only with the battery isolated.

**The site interrupts:** an electrician ducks under the barricade tape toward the mast, so she presses the remote e-stop first; and the vacuum's flow alarm sounds, so she stops the drill.

Content score 98 · 12 steps · 4 hazards · 2 interruptions · par 320 seconds

#### What the robot side gets from this day

This is the day with a robot-side result. A policy cloned from clean synthetic demonstrations (17 of 40 kept) sets up the drilling cell in the scenario's order with a success rate of 1.00 on 60 held-out seeds, against 0.00 for random and 1.00 for the scripted expert, and the scenario holds the robot whenever a person is inside the barricade, the moment this day teaches her to press the e-stop (`docs/evals/colearn.json`, `tools/check_roboscenarios.mjs`). The task is small and discrete and every demonstration is synthetic, so no robot has learned from her. The awareness lesson and the silica station collect no robot training data.

### (Persona B)A robot technician, on a shift that touches several kinds of cell

A composite, not a measured person. The path covers teaching, measuring, recovering, configuring and locking out, in one working day. One station on it, the speed-and-separation set-up, is an integrator-level station in the programme; a technician steps up to it.

**5 ** stations **66 ** scored steps **1680 ** seconds of par time in all

1.

#### Teaching a Robot from the Pendant `rt-teach-pendant-safe-jogging`

Robot technician level, industrial robot cells: module score 80 within 35 days

She reads the teach plan, selects manual reduced speed and reads it back, proves the pendant e-stop, tests the enabling device's positions, stations a second person at the outside e-stop, finds what blocks the escape route and jogs to the new point with the enabling device held in the middle.

**The site interrupts:** a coworker opens the gate to steady the part, and the arm moves faster than the reduced speed on the readout.

Content score 96 · 13 steps · 4 hazards · 2 interruptions · par 340 seconds

2.

#### Measuring a Cobot's Contact Forces `rt-cobot-power-force-limit-check`

Robot technician level, collaborative robots (ISO/TS 15066 named, no clause quoted)

She checks the measuring device's calibration, sets it for the body region, seats it where contact happens, measures transient and quasi-static contact separately, judges each against the card's band, finds a sharp edge and covers it.

**The site interrupts:** a coworker reaches in to steady the device as the arm comes down, and the quasi-static reading goes over the band.

Content score 98 · 13 steps · 4 hazards · 2 interruptions · par 330 seconds

3.

#### Bringing a Robot Back After an E-stop `rt-robot-estop-recovery-and-restart`

Robot technician level, robot maintenance and lockout

She reads the stop log before touching anything, accounts for everyone who was near the cell, finds the cause, locks out to enter, verifies zero energy, clears the part, removes her own lock last, resets from outside and watches the first cycle at reduced speed with a hand on the stop.

**The site interrupts:** a coworker outside reaches for the e-stop reset, and on the first cycle the arm swings toward the gate.

Content score 96 · 13 steps · 4 hazards · 2 interruptions · par 350 seconds

4.

#### Setting Up Speed-and-Separation Monitoring `rt-speed-separation-monitoring-setup`

Integrator level, collaborative robots: module score 85

She reads the stopping distance and approach speed, marks the arm's reach, sets the protective field and the warning field outside it, confirms muting is off, finds the scanner's blind spot, measures where the arm stops and commits the configuration under its checksum.

**The site interrupts:** a coworker pushing a cart walks into the scanner's shadow, and the stop-distance readout goes red because the arm came to rest inside the mark.

Content score 98 · 13 steps · 4 hazards · 2 interruptions · par 340 seconds

5.

#### Robot Cell Lockout and Safe Re-entry `ad-robot-cell-lockout-and-safe-reentry`

Robot technician level, industrial robot cells

She brings the cell to a normal stop, isolates and locks out with her own lock, tries the start, verifies zero energy, blocks the raised axis, jogs in reduced speed, bleeds the trapped air and removes her lock and logs it.

**The site interrupts:** the arm starts creeping on its own with the pendant in her hand, and the incoming shift's operator reaches for the disconnect to restart the cell.

Content score 93 · 14 steps · 4 hazards · 2 interruptions · par 320 seconds

#### What the robot side gets from this day

Cell entry is the one task on this path with a robot-side result: a policy cloned from clean passes has a success rate of 1.00 on 60 held-out seeds against 0.00 for random and 1.00 for the scripted expert, and the safety-zone set-up task scores 1.00 against 1.00 for the expert (`docs/evals/colearn.json`). The teach pendant, the contact-force check and the e-stop recovery have no gym scenario of their own, so no robot-side result yet. Everything on this path is simulated.

### (Persona C)An AI-training specialist, supervising robots she helped teach

A composite, not a measured person. An adult who has opted in, working at the AI-training level: module score 85 within 28 days, with 24 robot-station places on offer.

**3 ** stations **39 ** scored steps **1000 ** seconds of par time in all

1.

#### Collecting a Robot Demonstration Safely `rp-teleop-demonstration-collection`

AI-training specialist level

She reads the consent screen, reads the bench's risk assessment, selects reduced speed, tests the e-stop, proves the scanner's warning zone, finds what must not be recorded, drives the pick inside the force band, labels the failed take as failed, checks where the data lives and finds the revoke control.

**The site interrupts:** a visitor steps over the floor tape into the warning zone to watch, and the grip force readout flashes red.

Content score 97 · 13 steps · 4 hazards · 2 interruptions · par 330 seconds

2.

#### Reviewing a Robot Policy's Evaluation `rp-robot-policy-evaluation-review`

AI-training specialist level

She reads the dataset card, traces the lineage, finds the policy built on revoked data, sets the release threshold from the criteria, reads the results between the random floor and the scripted expert, counts violations, watches a failing episode as a ghost replay and runs a supervised trial on the enabling device.

**The site interrupts:** a technician walks onto the protective-zone tape to fetch a part, and the explanation panel says the zone was clear when it was not.

Content score 98 · 13 steps · 4 hazards · 2 interruptions · par 330 seconds

3.

#### Supervising Robots Dispatched by Software Agents `vb-supervising-agent-dispatched-robots`

AI-training specialist level, in every track

She reads a job a software agent sent, checks who asked, finds the job that is not on the allowlist, reads the policy's eval card, sets the speed limit from the risk assessment, confirms the physical path is locked off, approves the job for the simulator under her name and watches the run from outside the zone.

**The site interrupts:** the simulated arm turns off its planned path toward a teammate's keep-out zone, and the client agent re-sends the same job asking for full speed with a person inside the work area.

Content score 98 · 13 steps · 4 hazards · 2 interruptions · par 340 seconds

#### What the robot side gets from this day

This is the path where the robot learns from the person. Recorded pose-driven takes from a scripted stand-in for a human, 18 of 40 kept, reach 0.967 on Teleop Pick-and-Place, equal to 0.967 from synthetic demonstrations; on Robot Cell Entry the recorded takes reach 1.0 (`docs/consoles/ROBOTRAIN.md`, `docs/consoles/ROBOTRAIN-2.md`). On the supervision station, the governor blocked 200 of 200 seeded unsafe jobs and wrongly blocked 0 of 200 safe ones, and a COLEARN-trained provider completed 28 of 30 safe jobs with the governor's verdict on 413 of 413 steps (`docs/consoles/VBRIDGE.md`). In the app, once an adult has opted in, the agent-jobs provider trains on the learner's own takes and the card names the source; in a Node run 12 takes did so, and revoking returned it to synthetic demonstrations (`docs/consoles/ROBOTRAIN-3.md`). No real person has been measured.

Consent: nothing is recorded unless an adult, signed-in learner has opted in; K-12, demo and signed-out sessions never collect; the data stay on the device and revoking deletes them.

Every station named is in `docs/investor/stations.csv`, and its steps and interruptions come from its station file under `exports/unity/SmartCitiX/Content/stations/`. Levels and module scores come from `docs/robotics-programme.md`. Robots are simulated throughout.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `be2f2b68`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
