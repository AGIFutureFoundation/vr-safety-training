# What a robotics pilot needs, and what exists

A cohort pilot at a union hall, school or employer, mapped to what the repository already holds and what it does not. The pilot is an offer, not a claim.

## What a robotics pilot needs, and what exists

A cohort pilot is a union hall, a school or an employer running the robotics programme with one class. The table maps what such a pilot needs to what the repository already holds, then lists what it does not. The pilot is an offer, not a claim: no organisation has agreed to one and none is named.

| A pilot needs | What the repository holds | Source file | State |
|---|---|---|---|
| **Run the class** | | | |
| A cohort, with a code the class types in | An organisation and a cohort with seats; the cohort's invite code is the class code. Seats are a count, and no payment path is live. | `docs/robotics-programme.md` | **Built** |
| A lesson plan for each level | 30 cohort templates, one for each of 6 tracks at 5 levels, each with a due date (from 14 days at the awareness level to 35 days for technicians), a required module score (60 to 85) and an instructor guide. | `docs/robotics-programme.md` | **Built** |
| Assign it, lock it, see who has done it | Versions and modules in the instructor console: choose which packs and worlds are on, lock the choice, build a module of lessons with a due date and a required score, assign it to the class code, export or import it as a file, and read a progress grid per learner. Its checker passes 531 checks. | `docs/consoles/DEAN.md`, `docs/modules.md` | **Built** |
| A screen at the front of the room | The instructor console has 3 views (live class, roster, session log) and 10 commands, of which the Holodeck answers 6: note, hold, open a station, fire an interruption and send a flow. Each command a learner's app honours is written onto that learner's attempt record. The session log exports as CSV. A relay lets an instructor on another machine reach the class; it has no authentication, so it belongs on the room's own network. | `docs/instructor-console.md` | **Built** |
| **Teach** | | | |
| Robot stations at every level | 30 of 30 track levels have a robot station of their own, with 12 to 24 robot-station places a level. A technician's path of 5 stations has a par time of 28 minutes in all; par is the target the scoring uses, not a measured duration. | `docs/robotics-programme.md`, `exports/unity/SmartCitiX/Content/stations/` | **Built** |
| The people-teach-robots loop | For the AI-training level: consent, demonstrate, train, evaluate on held-out seeds, and the robot demonstrates back. 5 of 5 steps are live in the app. Every robot is simulated. | `docs/consoles/ROBOTRAIN-3.md` | **Built** |
| **Consent and data** | | | |
| A consent flow a learner controls | Recording is off by default and opens only for an adult (18 or older) who is signed in, never in a K-12, demo or signed-out session. Data stays on the learner's device, with no upload endpoint, and one tap revokes consent and deletes it. The consent checker passes 59 checks. | `docs/learner-data-terms.md`, `docs/consoles/DATAWORKS.md` | **Built** |
| Terms to hand a learner | A plain-language terms document, linked from the consent panel and summarised in the data-terms cell. It is a draft for counsel. | `docs/learner-data-terms.md` | **Built** |
| **Show what the cohort produced** | | | |
| A policy report | A static report card for each of 6 cloned policies, and 6 exported synthetic datasets (240 episodes, licence CC0-1.0), each with a dataset card and an eval card that says what it is not. All of it is labelled synthetic. | `docs/perf/robot-policies.html`, `exports/robotics/index.json` | **Built** |
| Records a learner can carry | Attempt records export from the learner's own Training Records panel as CSV, xAPI or Open Badges. The console cannot write to them. | `docs/instructor-console.md` | **Built** |
| **Check it against a robot** | | | |
| A bench protocol | A method for scoring the 6 gym tasks on a physical set-up and publishing the gap whatever it is, with 8 safety preconditions and 4 kinds of approver, and mannequins, never people, in any keep-out. It is a method. Hardware runs reported: 0. | `docs/bench-protocol.md` | **Built** |
| **See it first** | | | |
| A walkthrough to show the class or a hiring manager | 11 chapters of a recorded walkthrough, 91.7 minutes in all, were produced in the previous build loop; chapter 9, the learning loop in the app, was not recorded. The recording is kept outside the repository. Persona walkthroughs on real stations are in the wiki. | `docs/consoles/COORDINATOR.md`, `docs/wiki/Personas.md` | **Built** |

### Does not exist: Named adults

Nobody has been measured. The tutor's figures come from 300 simulated learners, and every demonstration so far is synthetic or a labelled scripted stand-in. A pilot's opted-in adults would be the first real learners; that is what the cohort would add, and nothing here says it has happened.

### Does not exist: A site

The cells are generic and procedural, not a site's own layout, and the repository holds no site survey. No union hall, school or employer has run a cohort through it, and none is named as having agreed to.

### Does not exist: Hardware

There is no robot, bench or sensor in the repository's evidence. Hardware runs reported: 0. The physical path in the software is disabled and frozen, and the bench protocol is a method, not a result.

### Does not exist: A legal review

The learner-data terms are a draft for counsel and have not been reviewed by a lawyer. The relay has no authentication, and billing adapters ship off. A pilot's own counsel and safety officer would need to review these before learners are enrolled.

**What the organisation brings.** Named adult learners and an instructor, a room and a network, its own cell layouts and rules, a decision on whether learners may opt in to local data, and its own counsel and safety officer for the terms and for any bench run. None of this is supplied by the repository.

 **Pilot contact** [To be set by the founders.] Nothing on this page states a price, a fee or a return.

Every figure here is read from the file named beside it. Standards are named, never quoted, and nothing here claims compliance. Virtuals Protocol, the agent technology the project plans to use, plays no part in a classroom pilot.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `709cd68e`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
