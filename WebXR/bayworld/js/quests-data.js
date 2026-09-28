/**
 * GENERATED FILE — do not hand-edit. Run `node tools/gen_bay_quests.mjs`
 * after changing anything in that script, or after a programme in
 * WebXR/smartcity/js/curricula.js changes, to regenerate this file.
 *
 * The Bay World quest layer's data: the Job Readiness Edition's main story
 * arc, one opener and one capstone side quest per every other programme,
 * the easter-egg field notes at generic public landmarks, the Field Guide's
 * wildlife-sighting eggs, and the scored side activities. See
 * docs/bayworld-quests.md.
 *
 * Quest shape (BAY2's WebXR/bayworld/ quest engine):
 *   { id, title, giver, site, kind: "main"|"side"|"egg",
 *     steps: [{ type: "goto"|"station"|"find"|"drive"|"talk", target, text }],
 *     reward }
 * This file adds `tier` (a positive integer reward tier) and `requires`
 * (the id of the quest that must be completed first, or null) to express
 * the quest graph and its monotone reward curve; see quests.js's
 * rewardForTier(). Egg quests additionally carry `landmark`, `method`
 * ("goto" or "radio"), `cites` (the station step the lesson is quoted
 * from) and `lesson`.
 */

export const MAIN_QUESTS = [
  {
    "id": "bw-main-00-heritage",
    "title": "Where the Trades Began",
    "giver": "the hall's history keeper",
    "site": "Trades Heritage Walk",
    "kind": "main",
    "tier": 1,
    "requires": null,
    "steps": [
      {
        "type": "goto",
        "target": "Trades Heritage Walk",
        "text": "A quiet corner of the hall, photographs on the wall, a doorway to the floor beyond it."
      },
      {
        "type": "talk",
        "target": "trades-heritage-keeper",
        "text": "\"Before any of it — the forklift, the rig, the ledger — there's this. People built something enormous with their hands, and the trade you're about to learn is part of that same line.\""
      },
      {
        "type": "station",
        "target": "trades-lineage-briefing",
        "text": "The heritage opener: the trades as a lineage, a bridge that opened in 1937, an article listed as reading rather than retold, and a plain line around what this edition does and does not know."
      },
      {
        "type": "talk",
        "target": "trades-heritage-keeper",
        "text": "\"There's an article listed as further reading in the briefing, if you want the fuller story — we're not going to retell it here, only point you to it. Ready for the floor?\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Heritage Walk"
    }
  },
  {
    "id": "bw-main-01-warehouse",
    "title": "First Day on the Floor",
    "giver": "the warehouse floor supervisor",
    "site": "Bay Intermodal Warehouse",
    "kind": "main",
    "tier": 2,
    "requires": "bw-main-00-heritage",
    "steps": [
      {
        "type": "goto",
        "target": "Bay Intermodal Warehouse",
        "text": "The supervisor waves you over from the dock door, clipboard already out."
      },
      {
        "type": "talk",
        "target": "warehouse-floor-supervisor",
        "text": "\"Everybody starts at the same place: the truck and the jack. Slow is fine today. Sloppy isn't.\""
      },
      {
        "type": "station",
        "target": "forklift-dock",
        "text": "The shared opener: the forklift and the dock are where warehouse training starts and where the first credential is earned."
      },
      {
        "type": "station",
        "target": "tdl-pallet-jack-and-racking",
        "text": "The walkie pallet jack and the rack it feeds: a pre-use inspection that takes a truck out of service, a pallet checked against the truck's rating and the rack plaque, the horn at every aisle end, and a rack walk that finds the damage before a bay comes down."
      },
      {
        "type": "station",
        "target": "tdl-pick-pack-and-scan",
        "text": "One pick wave from scanner to shipping label, with the forklift lane respected at the aisle end and a jammed conveyor stopped, disconnected and locked before any hand goes near it."
      },
      {
        "type": "station",
        "target": "tdl-trailer-loading-and-dock-plate",
        "text": "A dropped trailer loaded through a plate door: walked for a soft floor, chocked and jacked at the nose, the restraint held until it grips, a plate rated for truck and load together, and a release that never leaves a plate on a trailer that can move."
      },
      {
        "type": "station",
        "target": "tdl-hazmat-labeling-and-segregation",
        "text": "The hazmat cage at an outbound door, where the shipping paper, the labels, the segregation of acid from oxidizer and the placards on every side are all checked by the person whose signature goes on the shipper's certification."
      },
      {
        "type": "station",
        "target": "tdl-lifting-and-ergonomics",
        "text": "The manual handling under every warehouse job, scored the way the Revised NIOSH Lifting Equation scores it, with the station changed to fit the worker, the team lift called on a count, and discomfort reported while it is still only discomfort."
      },
      {
        "type": "talk",
        "target": "warehouse-floor-supervisor",
        "text": "\"That's the floor. Every one of those checks is one less trip to redo a load — good first day.\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Warehouse Floor"
    }
  },
  {
    "id": "bw-main-02-yard",
    "title": "Yard Qualified",
    "giver": "the yard trainer",
    "site": "Class A Training Yard",
    "kind": "main",
    "tier": 3,
    "requires": "bw-main-01-warehouse",
    "steps": [
      {
        "type": "goto",
        "target": "Class A Training Yard",
        "text": "A day cab and a pup trailer sit parked under the yard lights, the trainer already walking the tires."
      },
      {
        "type": "talk",
        "target": "yard-trainer",
        "text": "\"Before you drive a foot, you're going to know this rig cold — every light, every gauge, every strap.\""
      },
      {
        "type": "station",
        "target": "tdl-pretrip-inspection",
        "text": "The Class A pre-trip that entry-level driver training starts from: the last report read, the engine bay walked cold, tread measured, lights and brake lights walked, and every defect written in the driver vehicle inspection report before the truck moves."
      },
      {
        "type": "station",
        "target": "tdl-air-brake-test",
        "text": "The in-cab air brake check a skills examiner watches, with the build rate, governor cut-out, static and applied leak rates, low-air warning and pop-out read against the manual's figures and written down."
      },
      {
        "type": "station",
        "target": "tdl-coupling-and-uncoupling",
        "text": "Hooking and dropping a trailer the manual's way — fifth wheel inspected, height checked, lines on and trailer brakes set before backing under, the tug test and the get-out-and-look — so a high hook never leaves the yard."
      },
      {
        "type": "station",
        "target": "tdl-backing-and-docking",
        "text": "The alley dock that range training drills, taken from the sight side with two get-out-and-look walks, a spotter who stops the truck the moment they leave the mirror, and a trailer chocked and handed over at the door."
      },
      {
        "type": "station",
        "target": "tdl-cargo-securement-and-hours",
        "text": "A flatbed load secured by count and by working load limit under 49 CFR 393, re-checked after the first miles, protected on the shoulder, and driven inside an eleven-hour, fourteen-hour day the electronic log can certify."
      },
      {
        "type": "talk",
        "target": "yard-trainer",
        "text": "\"You know the rig now. Tomorrow you drive it.\""
      }
    ],
    "reward": {
      "xp": 400,
      "badge": "Yard Qualified"
    }
  },
  {
    "id": "bw-main-03-road",
    "title": "On the Road",
    "giver": "the driving instructor",
    "site": "Class A Training Yard",
    "kind": "main",
    "tier": 4,
    "requires": "bw-main-02-yard",
    "steps": [
      {
        "type": "goto",
        "target": "Class A Training Yard",
        "text": "The instructor takes the jump seat this time. \"Yard's behind you. Let's go find some road.\""
      },
      {
        "type": "station",
        "target": "drive-city-route-and-turns",
        "text": "The first time the learner drives the rig themselves: a block of right turns with the trailer behind, signalled early, swung late, kept tight to the curb and watched in the right mirror where the tandem cuts in."
      },
      {
        "type": "station",
        "target": "drive-freeway-merge-and-following-distance",
        "text": "Up the ramp and into traffic at the wheel, with the handbook's seconds-per-ten-feet space cushion counted, a lane change for the next merge, a car cutting in and an exit queue warned with the flashers."
      },
      {
        "type": "station",
        "target": "drive-mountain-grade-and-engine-brake",
        "text": "A long downgrade driven on the engine: brakes checked at the pull-out, the low gear chosen before the crest, snub braking instead of riding the pedal, and a brake-fade warning answered with the engine brake."
      },
      {
        "type": "station",
        "target": "drive-night-fog-and-rail-crossing",
        "text": "A placarded tank at night in fog: low beams, a speed inside the sight distance, the window down, the crossing stop 49 CFR 392 requires, and across both tracks in one gear without shifting."
      },
      {
        "type": "station",
        "target": "drive-backing-serpentine-and-alley-dock",
        "text": "The backing the yard station reads, driven: signals agreed with the spotter, a serpentine through the cones, a sight-side alley dock, and the truck stopped the moment the spotter leaves the mirror."
      },
      {
        "type": "station",
        "target": "drive-light-vehicle-fleet-and-forklift-course",
        "text": "The two check-rides a terminal gives before the keys: a pool car walked round, stopped fully and backed into its space, and a forklift driven load-low with the horn at every aisle end and in reverse behind a tall load."
      },
      {
        "type": "talk",
        "target": "driving-instructor",
        "text": "\"That's every check-ride the terminal runs before it hands over keys. You drove all of them clean.\""
      }
    ],
    "reward": {
      "xp": 550,
      "badge": "On the Road"
    }
  },
  {
    "id": "bw-main-04-apprenticeship",
    "title": "Sign the Book",
    "giver": "the apprenticeship coordinator",
    "site": "Apprenticeship Hall",
    "kind": "main",
    "tier": 5,
    "requires": "bw-main-03-road",
    "steps": [
      {
        "type": "goto",
        "target": "Apprenticeship Hall",
        "text": "A noticeboard, a sign-in sheet and a coordinator who has clearly done this orientation before."
      },
      {
        "type": "talk",
        "target": "apprenticeship-coordinator",
        "text": "\"A registered apprenticeship is a ladder with rules. Learn the rules first, and the rest of it stops being a mystery.\""
      },
      {
        "type": "station",
        "target": "apprenticeship-standards-reading",
        "text": "The briefing that opens the apprenticeship steps: how to read a registered standard, the ladder from pre-apprentice to journey level, the aptitude test, the tool list and where OSHA 10 fits, sourced and flat."
      },
      {
        "type": "station",
        "target": "apprenticeship-application-and-test",
        "text": "The way in: a recruitment notice read for what it asks, the documents gathered, an application read before it is signed and handed in on time, and an aptitude test sat at a steady pace."
      },
      {
        "type": "station",
        "target": "jobsite-orientation-and-osha-10",
        "text": "The first morning on site: the OSHA 10 card understood as awareness, the site orientation 29 CFR 1926.21 owes every new hand, a ladder set, a harness on and tied off, and water on the saw before the cut."
      },
      {
        "type": "station",
        "target": "union-hall-and-dispatch",
        "text": "The hall between jobs: the book signed in your own name, a dispatch slip read at the window, the morning planned back from the report time, and a job outside the apprenticeship taken to the coordinator."
      },
      {
        "type": "station",
        "target": "first-period-evaluation",
        "text": "The end of the first period: a logbook with no gaps, a guarded skills demonstration, an evaluation read before it is signed, and the next rate read off the standard's wage schedule."
      },
      {
        "type": "talk",
        "target": "apprenticeship-coordinator",
        "text": "\"First period, signed off. That's a real rung, not a participation trophy.\""
      }
    ],
    "reward": {
      "xp": 700,
      "badge": "Sign the Book"
    }
  },
  {
    "id": "bw-main-05-financial",
    "title": "Balance the Books",
    "giver": "the financial coach",
    "site": "Financial Coaching Center",
    "kind": "main",
    "tier": 6,
    "requires": "bw-main-04-apprenticeship",
    "steps": [
      {
        "type": "goto",
        "target": "Financial Coaching Center",
        "text": "A small office, a folder already labelled with your name, a coach who starts with the paperwork, not a lecture."
      },
      {
        "type": "talk",
        "target": "financial-coach",
        "text": "\"A trade pays the bills. Whether it builds something is a different skill, and that's what we're here for.\""
      },
      {
        "type": "station",
        "target": "credit-report-reading",
        "text": "The free report pulled from the right place, every line read, the errors disputed with both the credit reporting company and the furnisher, and a date set for the answer."
      },
      {
        "type": "station",
        "target": "debt-reduction-plan",
        "text": "Every debt on the table with its APR and minimum, sorted highest rate first, a monthly amount that holds, and a finish date that a threatening collector and a settlement contract do not get to change."
      },
      {
        "type": "station",
        "target": "pay-stub-and-withholding",
        "text": "The first stub read properly: the rate held against the wage schedule, the hours against your own log, every deduction named, and the W-4 checked with the IRS's own estimator."
      },
      {
        "type": "station",
        "target": "budget-with-irregular-income",
        "text": "Construction pay budgeted on the lean month: essentials first, the good months feeding a buffer, the tax on side work set aside, and a car repair paid without a payday loan."
      },
      {
        "type": "station",
        "target": "emergency-savings-and-predatory-lending",
        "text": "An emergency fund built automatically and fed by the refund, and every loan offer read by its APR, finance charge and total before anything is signed on somebody else's deadline."
      },
      {
        "type": "talk",
        "target": "financial-coach",
        "text": "\"Same time next month. Bring the statements, not just the worry.\""
      }
    ],
    "reward": {
      "xp": 850,
      "badge": "Balance the Books"
    }
  },
  {
    "id": "bw-main-06-wellness",
    "title": "Ask for the Door",
    "giver": "the wellness guide",
    "site": "Wellness Resource Center",
    "kind": "main",
    "tier": 7,
    "requires": "bw-main-05-financial",
    "steps": [
      {
        "type": "goto",
        "target": "Wellness Resource Center",
        "text": "A comfortable room, no clipboard in sight, a guide who asks how the week actually went before anything else."
      },
      {
        "type": "talk",
        "target": "wellness-guide",
        "text": "\"Everything else in this programme assumes you're still standing. This is the part that's actually about that.\""
      },
      {
        "type": "station",
        "target": "wellness-shift-work-sleep-and-stress",
        "text": "The week the roster flips to nights: the traps read off the roster, a stress check rated honestly, one block of anchor sleep held against the extra shift, and the drive home decided by a check instead of by pride."
      },
      {
        "type": "station",
        "target": "wellness-peer-support-conversation",
        "text": "A cohort-mate says he cannot keep doing this: the signs noticed first, the rule said with its limits, their pace followed, the direct question asked when the words call for it, and three real doors named."
      },
      {
        "type": "station",
        "target": "wellness-substance-use-and-the-job",
        "text": "Four in the morning on the dock: the forklift key taken before the conversation, what you saw said plainly, whose decision the test is, and the doors a crew-mate can take without losing the job."
      },
      {
        "type": "station",
        "target": "wellness-asking-for-help-and-resources",
        "text": "The week your own life goes sideways: the plate sorted, each problem matched to its door, one call made and stayed on, the crisis line told apart from the case manager, and the follow-up booked."
      },
      {
        "type": "talk",
        "target": "wellness-guide",
        "text": "\"You've walked the whole pathway now — the floor, the rig, the hall, the ledger, and this room. Come back to any of them whenever you need to.\""
      }
    ],
    "reward": {
      "xp": 1000,
      "badge": "Ask for the Door"
    }
  }
];

export const SIDE_QUESTS = [
  {
    "id": "bw-side-electrical-first-period-opener",
    "title": "Inside Wireman — First Period — First Shift",
    "giver": "the programme's training lead",
    "site": "Inside Wireman — First Period",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "electrical-first-period",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Inside Wireman — First Period",
        "text": "The training lead meets you at Inside Wireman — First Period and points you to the first bench."
      },
      {
        "type": "station",
        "target": "electrical",
        "text": "The bench case: lockout, tagout and live-dead-live on a 480 V panel, with nothing else going on."
      },
      {
        "type": "station",
        "target": "charge-point",
        "text": "The same habit under a live utility service, where the load is a vehicle and the public is a metre away."
      },
      {
        "type": "station",
        "target": "substation-switching",
        "text": "Isolation as a written switching order with a read-back, which is how it is done once the circuit leaves the building."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"The isolation habit, built four ways: a panel, a substation feeder, an overhead circuit and a live-load charger. Every station in this block ends with something proven dead before it is touched.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Inside Wireman — First Period — Opener"
    }
  },
  {
    "id": "bw-side-electrical-first-period-capstone",
    "title": "Inside Wireman — First Period — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Inside Wireman — First Period",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-electrical-first-period-opener",
    "programmeId": "electrical-first-period",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Inside Wireman — First Period",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "motor-control-center",
        "text": "Isolation inside the building again, but now the disconnect is not the whole story — the bucket still has to be racked off a bus that stays live for everyone else on the section."
      },
      {
        "type": "station",
        "target": "arc-flash-label-study",
        "text": "Where the label the first four stations all trusted actually comes from — the study, not a guess, behind every incident-energy number this block has been working to."
      },
      {
        "type": "station",
        "target": "temporary-site-power",
        "text": "The isolation habit turned around: building a service worth trusting in the first place, grounded and GFCI-protected before anyone plugs a tool into it."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: NFPA 70E work practices and OSHA 1910.147 control of hazardous energy, as taught in an IBEW/NECA JATC first-period block\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Inside Wireman — First Period — Capstone"
    }
  },
  {
    "id": "bw-side-confined-space-opener",
    "title": "Confined Space — Entry and Rescue — First Shift",
    "giver": "the programme's training lead",
    "site": "Confined Space — Entry and Rescue",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "confined-space",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Confined Space — Entry and Rescue",
        "text": "The training lead meets you at Confined Space — Entry and Rescue and points you to the first bench."
      },
      {
        "type": "station",
        "target": "valve-vault",
        "text": "The permit itself: testing in order, a guarded opening and an attendant who never leaves."
      },
      {
        "type": "station",
        "target": "lift-station",
        "text": "A wet well, where the atmosphere changes while you are in it and the pumps are the second hazard."
      },
      {
        "type": "station",
        "target": "chlorine-room",
        "text": "A space you do not enter blind: the monitor and the air pack are read and staged from outside the door."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Four spaces and the rescue. The first three build the permit, the atmosphere and the attendant; the last one is what happens when all of that failed for somebody else.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Confined Space — Entry and Rescue — Opener"
    }
  },
  {
    "id": "bw-side-confined-space-capstone",
    "title": "Confined Space — Entry and Rescue — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Confined Space — Entry and Rescue",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-confined-space-opener",
    "programmeId": "confined-space",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Confined Space — Entry and Rescue",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "cs-permit-entry-and-attendant-duties",
        "text": "The permit as a document and the attendant as a job: every blank caught before anyone signs, the count kept on a tag board, and the post held when a foreman wants an errand run."
      },
      {
        "type": "station",
        "target": "cs-ventilation-and-air-monitoring-plan",
        "text": "Ventilation as a plan rather than a fan: the dead corners found, the duct run to sweep them, the purge run for the permit's time, and the entrant recalled the moment the blower stops."
      },
      {
        "type": "station",
        "target": "cs-non-entry-retrieval-and-tripod",
        "text": "The rescue that needs no rescuer: a tripod set square, a winch proven under a test weight, the line on the back D-ring before entry, and a drill haul cranked from outside the hole."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: OSHA 29 CFR 1910.146 permit-required confined spaces, with NFPA 1006 rescue technician for the last station\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Confined Space — Entry and Rescue — Capstone"
    }
  },
  {
    "id": "bw-side-fall-protection-opener",
    "title": "Working at Height — Fall Protection — First Shift",
    "giver": "the programme's training lead",
    "site": "Working at Height — Fall Protection",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "fall-protection",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Working at Height — Fall Protection",
        "text": "The training lead meets you at Working at Height — Fall Protection and points you to the first bench."
      },
      {
        "type": "station",
        "target": "scaffold-erection",
        "text": "Building the platform: the order in which a scaffold becomes safe to stand on, and the green tag that says so."
      },
      {
        "type": "station",
        "target": "steel-erector",
        "text": "Connecting steel, where the anchor moves with the work and the decking is not yet there."
      },
      {
        "type": "station",
        "target": "tower-climb",
        "text": "A climb with a hundred metres under it: the transitions are where people fall."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Anchor, connect, and the thing you are standing on. Four heights, four different reasons the system has to be right before the first step off the deck.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Working at Height — Fall Protection — Opener"
    }
  },
  {
    "id": "bw-side-fall-protection-capstone",
    "title": "Working at Height — Fall Protection — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Working at Height — Fall Protection",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-fall-protection-opener",
    "programmeId": "fall-protection",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Working at Height — Fall Protection",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "aerial-ladder",
        "text": "An aerial device, where the platform is the thing that has to be set level before anyone is on it."
      },
      {
        "type": "station",
        "target": "leading-edge-and-horizontal-lifeline",
        "text": "The leading edge, where there is no platform yet and the anchor is a lifeline the crew rigs, tensions and checks for clearance to a qualified person's design before anyone clips on."
      },
      {
        "type": "station",
        "target": "fp-anchor-selection-and-rescue-plan",
        "text": "The step before any of the other five: choosing an anchor that is actually rated, over the handrail beside it, and writing the rescue plan a suspended worker's own clock depends on."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: OSHA 29 CFR 1926 Subpart M fall protection, Subpart L scaffolds, and ANSI Z359 personal fall-arrest systems\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Working at Height — Fall Protection — Capstone"
    }
  },
  {
    "id": "bw-side-hazmat-environmental-opener",
    "title": "Hazmat and Environmental Response — First Shift",
    "giver": "the programme's training lead",
    "site": "Hazmat and Environmental Response",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "hazmat-environmental",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Hazmat and Environmental Response",
        "text": "The training lead meets you at Hazmat and Environmental Response and points you to the first bench."
      },
      {
        "type": "station",
        "target": "hunters-point",
        "text": "A sourced briefing on a real Superfund shipyard cleanup and the community monitoring around it, before any simulated work."
      },
      {
        "type": "station",
        "target": "abatement-chamber",
        "text": "Containment done properly: negative pressure, a clean room, and a decon order that keeps the fibre inside."
      },
      {
        "type": "station",
        "target": "decon-line",
        "text": "The corridor: zones set by the wind, pools in order, and runoff that stays in the berm."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Containment, decontamination and the numbers a neighbourhood relies on. This block runs from the release to the sample bottle, and opens with the real history of one site.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Hazmat and Environmental Response — Opener"
    }
  },
  {
    "id": "bw-side-hazmat-environmental-capstone",
    "title": "Hazmat and Environmental Response — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Hazmat and Environmental Response",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-hazmat-environmental-opener",
    "programmeId": "hazmat-environmental",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Hazmat and Environmental Response",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "hz-level-b-entry-and-scba-change-out",
        "text": "The entry itself, stripped down to the habit that makes every other hazmat station survivable: a hot line crossed only on backup's word, and a cylinder swapped at the line before the reserve that gets you back out is gone."
      },
      {
        "type": "station",
        "target": "hz-drum-staging-and-compatibility-segregation",
        "text": "The apron before any entry happens at all: every drum read, forked into its own class's cell and dated, so the chart that keeps incompatible loads apart is a habit before it is ever tested by a leak."
      },
      {
        "type": "station",
        "target": "hz-decon-corridor-for-a-mass-casualty-drill",
        "text": "The corridor run for people instead of equipment: gross and rinse pools built in order, a non-ambulatory patient found in the queue, and a second wave met without ever losing the line."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: OSHA 29 CFR 1910.120 HAZWOPER, NFPA 470 hazardous materials response, and Clean Water Act / Clean Air Act monitoring practice\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Hazmat and Environmental Response — Capstone"
    }
  },
  {
    "id": "bw-side-rigging-lifting-opener",
    "title": "Rigging and Lifting — First Shift",
    "giver": "the programme's training lead",
    "site": "Rigging and Lifting",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "rigging-lifting",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Rigging and Lifting",
        "text": "The training lead meets you at Rigging and Lifting and points you to the first bench."
      },
      {
        "type": "station",
        "target": "crane-yard",
        "text": "The load chart and the pick plan, plus programming the anti-collision zone the yard actually needs."
      },
      {
        "type": "station",
        "target": "dock-crane",
        "text": "Container work at height and speed, where the wind limit is a hard stop."
      },
      {
        "type": "station",
        "target": "chain-hoist",
        "text": "Manual lifting hardware: inspection, capacity and the load path through a structure that was not designed for it."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Load, radius, chart, and what is under the load. Five lifts in five industries that all fail the same way.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Rigging and Lifting — Opener"
    }
  },
  {
    "id": "bw-side-rigging-lifting-capstone",
    "title": "Rigging and Lifting — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Rigging and Lifting",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-rigging-lifting-opener",
    "programmeId": "rigging-lifting",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Rigging and Lifting",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "rigging-loft",
        "text": "Overhead rigging above people, with automation cues that have to be proven before the house opens."
      },
      {
        "type": "station",
        "target": "fly-system",
        "text": "Counterweight: the one rigging system where the operator is holding the other half of the load in their hands."
      },
      {
        "type": "station",
        "target": "rl-critical-lift-plan-and-signalperson",
        "text": "The lift where the plan and the signalperson are the load path: a chart read against its own limit, one voice running the pick, and the exclusion zone that keeps everyone else out from under it."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: ASME B30 rigging and crane practice, NCCCO operator knowledge, and ETCP entertainment rigging for the theatre station\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Rigging and Lifting — Capstone"
    }
  },
  {
    "id": "bw-side-stationary-engineer-opener",
    "title": "Stationary Engineer — Building Plant — First Shift",
    "giver": "the programme's training lead",
    "site": "Stationary Engineer — Building Plant",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "stationary-engineer",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Stationary Engineer — Building Plant",
        "text": "The training lead meets you at Stationary Engineer — Building Plant and points you to the first bench."
      },
      {
        "type": "station",
        "target": "boiler-room",
        "text": "Start-up and purge: the sequence that stops a furnace explosion."
      },
      {
        "type": "station",
        "target": "chiller-plant",
        "text": "Refrigerant, isolation and the machine that is the building's whole cooling capacity."
      },
      {
        "type": "station",
        "target": "cooling-tower",
        "text": "The Legionella task: the tower is the one plant that can make the neighbourhood sick."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"The four plants a building engineer is responsible for at two in the morning, and the tests that prove each one will work when it is needed.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Stationary Engineer — Building Plant — Opener"
    }
  },
  {
    "id": "bw-side-stationary-engineer-capstone",
    "title": "Stationary Engineer — Building Plant — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Stationary Engineer — Building Plant",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-stationary-engineer-opener",
    "programmeId": "stationary-engineer",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Stationary Engineer — Building Plant",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "elevator-pit",
        "text": "The pit: a confined space with a moving car above it, entered by the person who maintains it."
      },
      {
        "type": "station",
        "target": "se-steam-trap-survey-and-condensate-return",
        "text": "The annual survey down the steam main, where a blow-through is read from the trap itself and the swap is made only once the line is actually locked out."
      },
      {
        "type": "station",
        "target": "se-building-automation-alarm-triage",
        "text": "The queue at shift start, where the panel's own arc-flash label and a lockout come before a breaker reset, and a buried freeze-stat alarm never gets scrolled past."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: State stationary engineer licence, ASME boiler practice, ASHRAE 188 water management and NFPA 25 fire-pump testing\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Stationary Engineer — Building Plant — Capstone"
    }
  },
  {
    "id": "bw-side-port-operations-opener",
    "title": "Port and Terminal Operations — First Shift",
    "giver": "the programme's training lead",
    "site": "Port and Terminal Operations",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "port-operations",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Port and Terminal Operations",
        "text": "The training lead meets you at Port and Terminal Operations and points you to the first bench."
      },
      {
        "type": "station",
        "target": "mooring-line",
        "text": "Taking the lines: snap-back zones and the bight nobody stands in."
      },
      {
        "type": "station",
        "target": "bunkering-watch",
        "text": "Fuel transfer as person in charge, with the deck contained before the hose comes aboard."
      },
      {
        "type": "station",
        "target": "container-lashing",
        "text": "Deck stow: every twist-lock proven and the rods to the pattern the manual calls for."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"A ship comes alongside, is secured, is fuelled, is worked and leaves. Four stations that follow that order, each with a different way to put oil or steel where it should not be.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Port and Terminal Operations — Opener"
    }
  },
  {
    "id": "bw-side-port-operations-capstone",
    "title": "Port and Terminal Operations — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Port and Terminal Operations",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-port-operations-opener",
    "programmeId": "port-operations",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Port and Terminal Operations",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "vessel-gangway-and-hatch-cover-safety",
        "text": "Going aboard to work her: the gangway and its net, the hatch cover opened with nobody in its fold, and the hold's air read before anyone climbs down."
      },
      {
        "type": "station",
        "target": "po-lashing-gear-inspection-and-tagging",
        "text": "The gear before it ever carries a load: a cracked rod caught in the rack, the pattern checked against the plan, and the gang held clear while the spreader swings overhead."
      },
      {
        "type": "station",
        "target": "po-yard-hostler-and-pedestrian-separation",
        "text": "The yard tractor's own lane, where the horn comes before the back and the marked crossing is the one place a driver and a longshoreman are both expected to be."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: USCG 33 CFR 155/156 oil transfer, IMO Cargo Securing Manual practice, and OSHA 1917 marine terminals\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Port and Terminal Operations — Capstone"
    }
  },
  {
    "id": "bw-side-transit-ramp-opener",
    "title": "Transit and Ramp Operations — First Shift",
    "giver": "the programme's training lead",
    "site": "Transit and Ramp Operations",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "transit-ramp",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Transit and Ramp Operations",
        "text": "The training lead meets you at Transit and Ramp Operations and points you to the first bench."
      },
      {
        "type": "station",
        "target": "track-access",
        "text": "Roadway-worker protection: the authority, the watchman and the clear time before the rail is occupied."
      },
      {
        "type": "station",
        "target": "signal-cabinet",
        "text": "Working inside the system that keeps trains apart, without taking the protection down with you."
      },
      {
        "type": "station",
        "target": "bus-depot-lift",
        "text": "A vehicle raised over a person, and the supports that go in before anyone is underneath."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Four places where a vehicle that weighs tonnes moves near people on foot, and the protection that has to exist before anyone steps out.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Transit and Ramp Operations — Opener"
    }
  },
  {
    "id": "bw-side-transit-ramp-capstone",
    "title": "Transit and Ramp Operations — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Transit and Ramp Operations",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-transit-ramp-opener",
    "programmeId": "transit-ramp",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Transit and Ramp Operations",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "forklift-dock",
        "text": "The dock: a trailer that creeps and a load that tips, on the most common powered truck in the country."
      },
      {
        "type": "station",
        "target": "bus-yard-fuelling-and-brake-check",
        "text": "The yard at the end of the day, where a coach is fuelled with the engine off and a hand on the nozzle, its air brakes checked by the numbers, and a defect kept off tomorrow's road."
      },
      {
        "type": "station",
        "target": "tr-wheelchair-lift-and-securement-on-a-bus",
        "text": "The stop that makes the route accessible: the boarding pad checked clear, all four securement points locked and tensioned, and the lift watched clean back into its stow before the bus moves."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: FRA roadway-worker protection, FTA rail transit safety practice, FAA 14 CFR 139 airfield operations and OSHA 1910.178 for powered equipment\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Transit and Ramp Operations — Capstone"
    }
  },
  {
    "id": "bw-side-energy-transition-opener",
    "title": "Energy Transition Systems — First Shift",
    "giver": "the programme's training lead",
    "site": "Energy Transition Systems",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "energy-transition",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Energy Transition Systems",
        "text": "The training lead meets you at Energy Transition Systems and points you to the first bench."
      },
      {
        "type": "station",
        "target": "solar-deck",
        "text": "A photovoltaic array that is energised whenever the sun is up and cannot be switched off at the panel."
      },
      {
        "type": "station",
        "target": "battery-yard",
        "text": "Grid storage: AC before DC, the bleed-down and the thermal event you are trying not to start."
      },
      {
        "type": "station",
        "target": "charge-point",
        "text": "The load end: high-current DC in a public place."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"The plant a utility is building now: solar, storage, charging and the substation that ties them together. Direct current behaves differently, and every station here is about that difference.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Energy Transition Systems — Opener"
    }
  },
  {
    "id": "bw-side-energy-transition-capstone",
    "title": "Energy Transition Systems — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Energy Transition Systems",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-energy-transition-opener",
    "programmeId": "energy-transition",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Energy Transition Systems",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "et-ev-fleet-depot-charging-and-arc-flash",
        "text": "The depot row at the panel a whole fleet plugs into: zero energy proven before the lockout, a cut cable and a live ground fault both caught before the vans ever see them."
      },
      {
        "type": "station",
        "target": "or-transmission-line-right-of-way-patrol",
        "text": "The corridor these stations feed and draw from, walked and driven on open range, where a downed conductor is treated as energised from the first look at it, not judged safe by what it looks like lying in the grass."
      },
      {
        "type": "station",
        "target": "or-solar-farm-tracker-row-maintenance",
        "text": "The array itself serviced under a real combiner lockout, with the manual override never turning a row until the meter, not the switch position, says the DC is actually dead."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: NFPA 70E, NFPA 855 energy storage, NEC Article 690 photovoltaic systems and utility interconnection practice\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Energy Transition Systems — Capstone"
    }
  },
  {
    "id": "bw-side-live-events-opener",
    "title": "Live Events Production — First Shift",
    "giver": "the programme's training lead",
    "site": "Live Events Production",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "live-events",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Live Events Production",
        "text": "The training lead meets you at Live Events Production and points you to the first bench."
      },
      {
        "type": "station",
        "target": "stage-power",
        "text": "The company switch tie-in: cam-locks ground first, and the phase check before anything is energised."
      },
      {
        "type": "station",
        "target": "fly-system",
        "text": "Loading a lineset, where an unbalanced arbor is a runaway with a person on the rope."
      },
      {
        "type": "station",
        "target": "rigging-loft",
        "text": "Points overhead, with automation cues proven before the house is let in."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"A load-in from the truck to the house lights, in the order a call actually runs, with the two things that kill on a stage: what is overhead and what is energised.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Live Events Production — Opener"
    }
  },
  {
    "id": "bw-side-live-events-capstone",
    "title": "Live Events Production — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Live Events Production",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-live-events-opener",
    "programmeId": "live-events",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Live Events Production",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "stage-load-in-and-truss-rigging",
        "text": "The arena load-in from the deck: truss inspected and spliced, flown level on its motors with nobody under it, and every point dead-hung on its steel."
      },
      {
        "type": "station",
        "target": "le-followspot-and-truss-access-at-height",
        "text": "A spot tower before doors: the lift ridden held, the tower anchor clipped before the gate opens, a cracked coupler caught, and the lamp struck from its own switch clear of the housing."
      },
      {
        "type": "station",
        "target": "le-crowd-barricade-and-show-stop-call",
        "text": "The front-of-house rail before doors: a bent pin caught, the line built and gauged to the plan, and the show-stop chain briefed and used when the load gauge spikes."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: ETCP Certified Rigger and Certified Entertainment Electrician, ANSI E1.4-1 counterweight rigging and NFPA 70E for the power tie-in\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Live Events Production — Capstone"
    }
  },
  {
    "id": "bw-side-hunters-point-bay-restoration-opener",
    "title": "Hunters Point Clean-up and Bay Restoration — First Shift",
    "giver": "the programme's training lead",
    "site": "Hunters Point Clean-up and Bay Restoration",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "hunters-point-bay-restoration",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Hunters Point Clean-up and Bay Restoration",
        "text": "The training lead meets you at Hunters Point Clean-up and Bay Restoration and points you to the first bench."
      },
      {
        "type": "station",
        "target": "hunters-point",
        "text": "The record: what the site is, who oversees it, what the contractor data case established, and where the neighbourhood's own air data comes from — before any simulated work."
      },
      {
        "type": "station",
        "target": "rad-survey",
        "text": "The gamma walkover done so its numbers can be trusted: source-check, background, grid speed, a static count over the investigation level, a split sample under chain of custody."
      },
      {
        "type": "station",
        "target": "building-rad-scan",
        "text": "The same discipline turned indoors, on a derelict building ahead of demolition: floor and walls scanned to the plan's coverage, drains scanned as collection points, and a swipe bagged under chain of custody before a roll-up door opens on ground that isn't released yet."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"A Superfund shoreline and the bay beside it, worked in the order a cleanup actually runs: the record first, then survey, then excavation and haul, then the groundwater that stays behind, then the water's edge given back — sediment out, tide back in, marsh planted. The first station is a sourced briefing on the real site and the data-integrity case at the centre of it; every station after it is a union trade doing its part of the work, and the discipline that made the case is taught as procedure: an instrument source-checked before and after, a sample that is the place it came from, and a split for a lab that does not work for you.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Hunters Point Clean-up and Bay Restoration — Opener"
    }
  },
  {
    "id": "bw-side-hunters-point-bay-restoration-capstone",
    "title": "Hunters Point Clean-up and Bay Restoration — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Hunters Point Clean-up and Bay Restoration",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-hunters-point-bay-restoration-opener",
    "programmeId": "hunters-point-bay-restoration",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Hunters Point Clean-up and Bay Restoration",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "living-shoreline",
        "text": "The water's edge rebuilt as habitat — coir, oyster shell, cordgrass at the design elevation — inside the tide window and the fish window."
      },
      {
        "type": "station",
        "target": "spartina-removal",
        "text": "The planted marsh defended from the cordgrass that would take it over: the treatment map read instead of the eye, a buffer held around a nesting endangered rail no label rate excuses crossing, and the herbicide mixed off the marsh and applied under the wind limit."
      },
      {
        "type": "station",
        "target": "eelgrass-transplant",
        "text": "The habitat the fill once displaced, replanted underwater: a donor bed cut to its share, shoots bundled inside the clock, and a diver directed to the grid by a supervisor who never gets in the water."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: OSHA 29 CFR 1910.120 HAZWOPER as the floor for everyone inside the fence; MARSSIM radiological survey practice and NRC 10 CFR 20 for the survey crew; EPA RCRA 40 CFR 262 manifests for the haul; U.S. Army Corps of Engineers Section 404, BCDC and Regional Water Board 401 permit conditions for every hour of in-water work\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Hunters Point Clean-up and Bay Restoration — Capstone"
    }
  },
  {
    "id": "bw-side-culinary-kitchen-opener",
    "title": "Culinary — The Working Kitchen — First Shift",
    "giver": "the programme's training lead",
    "site": "Culinary — The Working Kitchen",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "culinary-kitchen",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Culinary — The Working Kitchen",
        "text": "The training lead meets you at Culinary — The Working Kitchen and points you to the first bench."
      },
      {
        "type": "station",
        "target": "kitchen",
        "text": "The bench case: the line as a first-period cook meets it, before any one hazard is taken apart on its own."
      },
      {
        "type": "station",
        "target": "knife-skills",
        "text": "The board anchored, the edge honed, and the claw grip that keeps a prep cook's own knuckles between the blade and the cut — plus the mandoline nobody runs bare-handed."
      },
      {
        "type": "station",
        "target": "slicer-lockout",
        "text": "The deli slicer taken apart for a changeover the way a machine shop would: the cord locked out before the guard comes off, and the interlock proven before power goes back in."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Fifteen stations in one kitchen, from the receiving dock to the dish pit. The hazards are the ones a cook actually meets — heat, blades, chemicals, cold, gas and the clock — and the standard behind every step is the one an inspector or a union steward would cite.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Culinary — The Working Kitchen — Opener"
    }
  },
  {
    "id": "bw-side-culinary-kitchen-capstone",
    "title": "Culinary — The Working Kitchen — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Culinary — The Working Kitchen",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-culinary-kitchen-opener",
    "programmeId": "culinary-kitchen",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Culinary — The Working Kitchen",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "banquet-hot-hold",
        "text": "The banquet line: hot boxes probed before they're loaded, chafers lit lid-open, the buffet walked before doors, and a pull-down cooled or discarded to the rule."
      },
      {
        "type": "station",
        "target": "cafeteria-serving",
        "text": "The school lunch line under the National School Lunch Program: the meal pattern's five components, offer versus serve, the wells probed and the count reconciled for the reimbursement claim."
      },
      {
        "type": "station",
        "target": "grill-line-burns",
        "text": "The grill and sauté station's own hazard, worked as a drill: handles in, a dry pan, a flambé cleared of the filters, and cool water run the full twenty minutes."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: The FDA Food Code as adopted in the California Retail Food Code, the California Food Handler card and ServSafe manager certification, NFPA 96 for the hood and suppression system, Cal/OSHA's kitchen safety orders, and OSHA 1910.147 for every machine that gets cleaned\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Culinary — The Working Kitchen — Capstone"
    }
  },
  {
    "id": "bw-side-dental-hygiene-unspoken-smiles-opener",
    "title": "Dental Hygiene — Unspoken Smiles — First Shift",
    "giver": "the programme's training lead",
    "site": "Dental Hygiene — Unspoken Smiles",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "dental-hygiene-unspoken-smiles",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Dental Hygiene — Unspoken Smiles",
        "text": "The training lead meets you at Dental Hygiene — Unspoken Smiles and points you to the first bench."
      },
      {
        "type": "station",
        "target": "phlebotomy",
        "text": "The bench case every clinical trade shares: sharps, bloodborne pathogens and the exposure control plan, before a single dental instrument is picked up."
      },
      {
        "type": "station",
        "target": "operatory-turnover",
        "text": "The turnover between patients: sharps and instruments contained at the point of use, the disinfectant held to its own label's contact time, barriers changed and nothing left on the tray for the next patient to find."
      },
      {
        "type": "station",
        "target": "instrument-reprocessing",
        "text": "The sterilisation centre behind that turnover: mechanical cleaning instead of a hand scrub, a chemical indicator in every pack, and the weekly spore test that is the only proof any cycle actually worked."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eighteen stations that make a hygienist's clinical day — the operatory, the sterilisation centre, the chairside procedures, the emergencies and the outreach van — into scored procedures a training programme can run and record. Every step names the guideline it stands on.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Dental Hygiene — Unspoken Smiles — Opener"
    }
  },
  {
    "id": "bw-side-dental-hygiene-unspoken-smiles-capstone",
    "title": "Dental Hygiene — Unspoken Smiles — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Dental Hygiene — Unspoken Smiles",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-dental-hygiene-unspoken-smiles-opener",
    "programmeId": "dental-hygiene-unspoken-smiles",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Dental Hygiene — Unspoken Smiles",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "dn-medical-history-and-medication-review",
        "text": "The review behind every safe appointment: the bag of bottles checked against the form, a blood thinner and a bone medicine flagged, the allergies read with their reactions, and the consult decision recorded as the dentist's."
      },
      {
        "type": "station",
        "target": "dn-oral-hygiene-instruction-and-motivational-interviewing",
        "text": "The flossing talk that finally changes something: permission before advice, the patient's own reasons heard and drawn out, technique shown on a model, and one small goal he chose written in his words."
      },
      {
        "type": "station",
        "target": "dn-public-health-dentistry-and-fluoridation-advocacy",
        "text": "The hygienist's work carried out to the whole community: screening data with no child left in it, the team's own claims checked first, and three honest minutes at the water board's podium."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: The CDC's Guidelines for Infection Control in Dental Health-Care Settings, OSHA 29 CFR 1910.1030 bloodborne pathogens and 1910.1200 hazard communication, the state dental board's practice act, the EPA amalgam rule (40 CFR 441), and the ADA's radiographic guidance\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Dental Hygiene — Unspoken Smiles — Capstone"
    }
  },
  {
    "id": "bw-side-dental-careers-unspoken-smiles-opener",
    "title": "Dental Careers — Unspoken Smiles — First Shift",
    "giver": "the programme's training lead",
    "site": "Dental Careers — Unspoken Smiles",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "dental-careers-unspoken-smiles",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Dental Careers — Unspoken Smiles",
        "text": "The training lead meets you at Dental Careers — Unspoken Smiles and points you to the first bench."
      },
      {
        "type": "station",
        "target": "patient-intake-screening",
        "text": "The shared first ten minutes: every dental career starts by reading the history and taking the vitals the same way."
      },
      {
        "type": "station",
        "target": "dental-careers-pathway",
        "text": "The ladder itself, before any of it: assistant to expanded-function assistant to hygienist to dentist, what each rung actually requires, where the pay-and-hours facts come from, and a signed plan with a date on it."
      },
      {
        "type": "station",
        "target": "four-handed-dentistry",
        "text": "The assistant's own trade at the chair: clock zones, stool heights, a tray in order of use, and every instrument transferred below the patient's chin rather than across their face."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"The careers a student can step into from the Unspoken Smiles clinic: dental assisting at the chair, sterilisation and instrument processing, radiography, the laboratory bench, orthodontic and surgical assisting, the front office and treatment coordination, and community outreach — with the ladder from assistant to hygienist to dentist laid out as a station of its own.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Dental Careers — Unspoken Smiles — Opener"
    }
  },
  {
    "id": "bw-side-dental-careers-unspoken-smiles-capstone",
    "title": "Dental Careers — Unspoken Smiles — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Dental Careers — Unspoken Smiles",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-dental-careers-unspoken-smiles-opener",
    "programmeId": "dental-careers-unspoken-smiles",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Dental Careers — Unspoken Smiles",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "dn-digital-intraoral-scanning-and-cad-cam",
        "text": "The digital chairside career: a reprocessed tip and a calibrated scanner, one steady scan path, the margin checked on screen before anybody designs to it, and a block milled behind a latched door."
      },
      {
        "type": "station",
        "target": "dn-dental-trauma-and-avulsed-tooth-response",
        "text": "The emergency every assistant should be ready for: a knocked-out front tooth handled by its crown, stored wet in the right medium, and handed to the dentist inside the hour the root cells have."
      },
      {
        "type": "station",
        "target": "dn-dental-coding-billing-and-preauthorisation",
        "text": "The billing office behind the front desk as a career of its own: eligibility before codes, a gap in the note sent back to the dentist, this year's CDT, and an appeal won on the record."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: The state dental practice act and its allowable duties for assistants and hygienists, DANB's CDA components (radiation health and safety, infection control, general chairside), CODA-accredited programme standards, the CDC's dental infection-control guidelines, OSHA 29 CFR 1910.1030 and 1910.1200, HIPAA's privacy and security rules, and the ADA's radiographic guidance\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Dental Careers — Unspoken Smiles — Capstone"
    }
  },
  {
    "id": "bw-side-civic-leadership-and-ei-opener",
    "title": "Civic Leadership and Emotional Intelligence — First Shift",
    "giver": "the programme's training lead",
    "site": "Civic Leadership and Emotional Intelligence",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "civic-leadership-and-ei",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Civic Leadership and Emotional Intelligence",
        "text": "The training lead meets you at Civic Leadership and Emotional Intelligence and points you to the first bench."
      },
      {
        "type": "station",
        "target": "public-comment-prep",
        "text": "The shared opener: standing up in public with a case that is sourced, timed and respectful is the first civic skill every station here builds on."
      },
      {
        "type": "station",
        "target": "civic-principles-briefing",
        "text": "The briefing before the stations: the eight principles stated honestly, the decision framework they hang on, and the open-meeting, disclosure and access law every station after it assumes."
      },
      {
        "type": "station",
        "target": "public-meeting-chair",
        "text": "Chairing the meeting is where listening first becomes a procedure: every speaker heard to the bell, nothing acted on that was not noticed, and each vote stated aloud."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Ten stations that teach the decisions a leader makes in public: listening before speaking, naming the interest behind a position, running a meeting people trust, spending a budget in the open, taking a hard call and owning it, and the emotional intelligence that makes each of those possible.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Civic Leadership and Emotional Intelligence — Opener"
    }
  },
  {
    "id": "bw-side-civic-leadership-and-ei-capstone",
    "title": "Civic Leadership and Emotional Intelligence — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Civic Leadership and Emotional Intelligence",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-civic-leadership-and-ei-opener",
    "programmeId": "civic-leadership-and-ei",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Civic Leadership and Emotional Intelligence",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "ei-conflict-on-the-crew",
        "text": "Two crew members clash beside live traffic, and the lead notices it, names it, slows it down behind the barrier and gets both of them to a fix they will actually work under."
      },
      {
        "type": "station",
        "target": "ei-giving-and-taking-feedback",
        "text": "Feedback that names the behaviour rather than the person is only half the skill; the other half is hearing, in the same conversation, that your own instruction was the gap and taking it without defending."
      },
      {
        "type": "station",
        "target": "ei-leading-under-pressure",
        "text": "When the schedule slips and the crew is tired, a lead keeps them steady with a calm voice, one clear next step and no safety step traded for time, then hands the credit to the crew by name."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: The Brown Act and public-meeting law, the Political Reform Act's conflict-of-interest rules, the city charter's ethics provisions, and the principles of civic leadership the module states; the foundation whose principles the module draws on is not sourced in this repository and is named only as an attribution to verify\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Civic Leadership and Emotional Intelligence — Capstone"
    }
  },
  {
    "id": "bw-side-property-management-opener",
    "title": "Property Management — Twenty Zones — First Shift",
    "giver": "the programme's training lead",
    "site": "Property Management — Twenty Zones",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "property-management",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Property Management — Twenty Zones",
        "text": "The training lead meets you at Property Management — Twenty Zones and points you to the first bench."
      },
      {
        "type": "station",
        "target": "boiler-room",
        "text": "The shared opener: the building's heating plant, where a manager first learns that every zone has a system, a log and a person responsible for it."
      },
      {
        "type": "station",
        "target": "pm-lobby-and-front-desk",
        "text": "The front desk, where the building is watched: the annunciator read, the exits kept clear, a lockout checked against the roster and every resident answered the same way."
      },
      {
        "type": "station",
        "target": "pm-leasing-office-fair-housing",
        "text": "The leasing office, where the Fair Housing Act is practised: one written standard for every applicant, an ad cleaned of steering words, an accommodation routed and the lead disclosure in every pre-1978 lease."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"A working building as twenty zones, each its own station: lobby to roof, boiler room to trash room, leasing office to fire panel, with the tenant, the inspector and the contractor in the scene.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Property Management — Twenty Zones — Opener"
    }
  },
  {
    "id": "bw-side-property-management-capstone",
    "title": "Property Management — Twenty Zones — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Property Management — Twenty Zones",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-property-management-opener",
    "programmeId": "property-management",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Property Management — Twenty Zones",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "pm-landscaping-and-irrigation",
        "text": "Zone eighteen, the front lawn: the irrigation controller adjusted rather than reset, the vacuum breaker walked, the mower serviced under lockout and a sheared head shut off at its zone valve."
      },
      {
        "type": "station",
        "target": "pm-playground-and-courtyard",
        "text": "Zone nineteen, the courtyard round: swings, bolts and mulch inspected to the playground handbook, a needle picked out with tongs, old paint left for testing and a rule against children refused."
      },
      {
        "type": "station",
        "target": "pm-storage-and-bike-room",
        "text": "Zone twenty, the basement: fuel pulled out of the storage cages, boxes brought below the sprinklers, the flow alarm proven with the monitoring company told and the old pipe lagging left for the licensed crew."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: OSHA 29 CFR 1910 general industry, NFPA 72 and 25 for fire alarm and sprinkler systems, the state elevator code, the Fair Housing Act, the state landlord-tenant statute, the local housing code, and EPA lead and asbestos rules for pre-1978 buildings\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Property Management — Twenty Zones — Capstone"
    }
  },
  {
    "id": "bw-side-outbreak-response-who-opener",
    "title": "Outbreak and Disease Response — WHO and UN Practice — First Shift",
    "giver": "the programme's training lead",
    "site": "Outbreak and Disease Response — WHO and UN Practice",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "outbreak-response-who",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Outbreak and Disease Response — WHO and UN Practice",
        "text": "The training lead meets you at Outbreak and Disease Response — WHO and UN Practice and points you to the first bench."
      },
      {
        "type": "station",
        "target": "decon-line",
        "text": "The shared opener: a decontamination line run in order is the same discipline an isolation ward and a treatment centre are built on."
      },
      {
        "type": "station",
        "target": "who-surveillance-and-case-definition",
        "text": "The first alert: a written case definition read before anything is counted, a signal verified before it is believed, a report filed at the tier the evidence supports, and a silent site chased rather than counted as zero."
      },
      {
        "type": "station",
        "target": "who-ppe-donning-and-doffing",
        "text": "The anteroom every clinical station after this one depends on: kit inspected, the donning order, a seal check every time, a buddy at the door, and the doffing order that keeps the respirator on until last."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Ten stations from the first alert to the last discharge: surveillance and case definition, PPE, an isolation ward, contact tracing, a treatment centre, water and sanitation, a vaccination line, risk communication, safe and dignified burial, and the after-action review.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Outbreak and Disease Response — WHO and UN Practice — Opener"
    }
  },
  {
    "id": "bw-side-outbreak-response-who-capstone",
    "title": "Outbreak and Disease Response — WHO and UN Practice — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Outbreak and Disease Response — WHO and UN Practice",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-outbreak-response-who-opener",
    "programmeId": "outbreak-response-who",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Outbreak and Disease Response — WHO and UN Practice",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "who-risk-communication-and-community-engagement",
        "text": "The community meeting WHO outbreak communication guidance describes: what is known and what is not, trusted voices at the front, rumours logged rather than repeated, and last week's questions answered in public."
      },
      {
        "type": "station",
        "target": "who-safe-and-dignified-burial",
        "text": "A burial team's visit taught as one procedure for safety and dignity: the family heard first with their community representative, the body carried by the whole team, the grave marked, and a supervised doff."
      },
      {
        "type": "station",
        "target": "who-after-action-review",
        "text": "The last station: a no-blame review once the outbreak is over, the frontline heard first, planned set against actual, and every lesson turned into an action with an owner and a date."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: WHO infection prevention and control guidance, WHO outbreak communication guidance, CDC isolation precautions, OSHA 29 CFR 1910.1030 and 1910.134, the Sphere Handbook's minimum standards, and IASC cluster coordination practice\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Outbreak and Disease Response — WHO and UN Practice — Capstone"
    }
  },
  {
    "id": "bw-side-bay-area-union-edition-opener",
    "title": "Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine — First Shift",
    "giver": "the programme's training lead",
    "site": "Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "bay-area-union-edition",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine",
        "text": "The training lead meets you at Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine and points you to the first bench."
      },
      {
        "type": "station",
        "target": "press-brake",
        "text": "The shared opener for the shop: a brake, a guard and a hand position are the first sheet metal lesson."
      },
      {
        "type": "station",
        "target": "sm-shop-layout-and-shear",
        "text": "The shop's first machine: a cut list laid out square and sheared with the guards walked, hands behind the finger guard and the drops hooked, never grabbed."
      },
      {
        "type": "station",
        "target": "sm-duct-fabrication-and-seams",
        "text": "The fitting itself: pressure and seal class off the drawing, a Pittsburgh lock rolled and closed, the flange cornered and the seams sealed to class before the section is stencilled."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"One Bay Area tool for four union families: the sheet metal shop and the duct run, the Golden Gate Bridge tower, cable and paint programme, the terminal's cranes, fenders and reefer power, and the water itself: ferries, mooring, oil transfer, and the dive stage down to the piles and the hull.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine — Opener"
    }
  },
  {
    "id": "bw-side-bay-area-union-edition-capstone",
    "title": "Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-bay-area-union-edition-opener",
    "programmeId": "bay-area-union-edition",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "uw-intake-screen-cleaning-with-lockout",
        "text": "The plant's own lockout worked above water first — breaker racked, locked and tagged, the isolation valve shut — before the diver ever proves the no-flow gauge again with their own hands and clears the screen."
      },
      {
        "type": "station",
        "target": "uw-bridge-pier-scour-survey",
        "text": "A pier's footing read against last year's survey: the benchmark found and the probe zeroed to it before any depth counts, the whole perimeter circled evenly, and the deepest point marked, flagged and logged rather than guessed at."
      },
      {
        "type": "station",
        "target": "uw-lift-bag-rigging-and-object-recovery",
        "text": "A dropped skid too heavy for one bag: both shackle pins moused before either bag goes on, the load brought level on the turnbuckle, and the whole rise escorted by eye rather than by a hand ever laid on the load itself."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: SMART's International Training Institute curriculum, Ironworkers IMPACT and OSHA 29 CFR 1926 Subpart R and Subpart M, IUPAT FTI and SSPC practice for bridge coatings, ILWU-PMA training and OSHA 29 CFR 1917 marine terminals, USCG Subchapter M and 33 CFR 156 for the marine side, and OSHA 29 CFR 1910 Subpart T with ADCI consensus standards for commercial diving\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine — Capstone"
    }
  },
  {
    "id": "bw-side-bartending-course-opener",
    "title": "Bartending — Behind the Bar — First Shift",
    "giver": "the programme's training lead",
    "site": "Bartending — Behind the Bar",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "bartending-course",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Bartending — Behind the Bar",
        "text": "The training lead meets you at Bartending — Behind the Bar and points you to the first bench."
      },
      {
        "type": "station",
        "target": "kitchen",
        "text": "The kitchen the bar shares a wall with: the Food Code for ice, glassware and the sanitiser bucket, before a single drink is poured."
      },
      {
        "type": "station",
        "target": "bar-well-setup",
        "text": "Opening the bar itself: sanitiser tested to strength, the ice well burned out and refilled with a scoop that never touches a glass, garnish gloved and dated, and the licence and RBS certificates posted before the first guest is let in."
      },
      {
        "type": "station",
        "target": "id-check-underage",
        "text": "The door: F.L.A.G. worked in order, a UV check against the security features, the birth-date math done against the calendar, and a refusal that is polite, documented and handed off to the rest of the bar."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Fifteen stations from opening the well to closing the till, and the customers in between: the one who is twenty, the one who has had enough, the one who will not take no, and the one whose drink was touched while she looked away. Every step names the law or the standard a bartender is held to.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Bartending — Behind the Bar — Opener"
    }
  },
  {
    "id": "bw-side-bartending-course-capstone",
    "title": "Bartending — Behind the Bar — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Bartending — Behind the Bar",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-bartending-course-opener",
    "programmeId": "bartending-course",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Bartending — Behind the Bar",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "tip-pool-labor",
        "text": "The paycheck the drinks pay for: the jar counted in the open, a lawful pool with no manager's hand in it, the breaks and the split shift entered honest, and the steward standing behind the sheet."
      },
      {
        "type": "station",
        "target": "wvpp-panic-button",
        "text": "The workplace violence prevention plan proven rather than filed: the panic button tested to dispatch, the hazard walk run before the smoking area goes dark, and the log kept honest enough for the safety committee to trust."
      },
      {
        "type": "station",
        "target": "rbs-service-capstone",
        "text": "The whole course, down one rail in real time: an ID checked, a fourth round cut off, a carry-out refused, a round poured to spec, and a drink nobody should ever hand back."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: California ABC Responsible Beverage Service certification (mandatory for anyone serving alcohol since 2022), TIPS or ServSafe Alcohol, the California Retail Food Code for ice and glassware, Cal/OSHA's workplace violence prevention plan requirement, and California Labor Code 351 on tips\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Bartending — Behind the Bar — Capstone"
    }
  },
  {
    "id": "bw-side-hunters-point-can-we-live-opener",
    "title": "Hunters Point Edition — Can We Live? — First Shift",
    "giver": "the programme's training lead",
    "site": "Hunters Point Edition — Can We Live?",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "hunters-point-can-we-live",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Hunters Point Edition — Can We Live?",
        "text": "The training lead meets you at Hunters Point Edition — Can We Live? and points you to the first bench."
      },
      {
        "type": "station",
        "target": "can-we-live-story",
        "text": "The story first: the foundation, the woman it is named for, and the record the neighbourhood works against — sourced, flat, and honest about what this edition is not."
      },
      {
        "type": "station",
        "target": "air-sensor-install",
        "text": "The network starts on a resident's own wall: siting by the rules, a weatherproof mount, and a first reading proven against a handheld before it ever reports for the block."
      },
      {
        "type": "station",
        "target": "sensor-colocation-check",
        "text": "A week beside the Air District's own reference monitor is what earns the correction factor every sensor this network installs actually relies on."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"A flagship built to be offered to the foundation and its partners: the sourced story of Marie Harrison and the foundation that carries her name, then twenty-five stations in the skills a community science programme actually uses — air sensors, pollution patrol, biomonitoring with consent, fence-line dust and haul-route observation, split samples, radiological literacy, the HAZWOPER gate into cleanup work, and turning data into testimony. Every station is sited generically; the edition does not speak for the foundation.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Hunters Point Edition — Can We Live? — Opener"
    }
  },
  {
    "id": "bw-side-hunters-point-can-we-live-capstone",
    "title": "Hunters Point Edition — Can We Live? — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Hunters Point Edition — Can We Live?",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-hunters-point-can-we-live-opener",
    "programmeId": "hunters-point-can-we-live",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Hunters Point Edition — Can We Live?",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "public-comment-prep",
        "text": "A month of patrol logs and monitor data turned into testimony a regulator's hearing can actually use: every claim tied to a dated record, the chart pulled from the network's own numbers, a three-minute statement timed to the clock, a written comment filed with its exhibits, a speaker card at registration, and nothing said that the record cannot back up."
      },
      {
        "type": "station",
        "target": "youth-patrol-training",
        "text": "A youth patrol team's first shift on the public sidewalk beside a fenced parcel: roles assigned, the route and the fence line's boundary walked, the buddy rule kept, sun and smoke gear staged, a real observation logged, the calm answer at the fence, and a debrief that closes the shift out loud."
      },
      {
        "type": "station",
        "target": "shelter-in-place-drill",
        "text": "A community centre's own drill for a dust or fire event next door: the alert taken seriously, every door and window closed, the HVAC to recirculate, the air cleaner on high, a real headcount, the hotline and the Air District both called, residents with respiratory needs checked by name, and the all-clear recorded rather than assumed."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: EPA QA/QC and chain-of-custody guidance for community samples, BAAQMD complaint and Community Advisory Council process, 45 CFR 46 informed consent for biomonitoring, OSHA 29 CFR 1910.120 HAZWOPER and 1910.134 respirators for anyone inside a cleanup fence, Cal/OSHA's wildfire smoke rule\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Hunters Point Edition — Can We Live? — Capstone"
    }
  },
  {
    "id": "bw-side-sewing-garment-trades-opener",
    "title": "Sewing and Garment Trades — First Shift",
    "giver": "the programme's training lead",
    "site": "Sewing and Garment Trades",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "sewing-garment-trades",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Sewing and Garment Trades",
        "text": "The training lead meets you at Sewing and Garment Trades and points you to the first bench."
      },
      {
        "type": "station",
        "target": "salon",
        "text": "The shared bench case every close-work trade opens on: sharps, chemicals, posture and the client — the same discipline a cutting table asks for."
      },
      {
        "type": "station",
        "target": "machine-threading-needle",
        "text": "The lockstitch head from a cold start: the needle changed with the scarf right, threaded in its one path, the bobbin wound and cased, tension proven on scrap, and the guard down before the first seam."
      },
      {
        "type": "station",
        "target": "lockstitch-seam-guard",
        "text": "The same head at production speed: a straight seam and a curve run behind the guard, bundle chained to bundle, and a needle break accounted for down to the broken tip."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"A separate trade series that teaches sewing as a trade: threading and needle changes, straight and zigzag seams behind the guard, the serger, the cutting table and rotary cutter, pattern marking, hems and buttonholes, the industrial press, ergonomics, alterations and repair, and inspection and finishing.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Sewing and Garment Trades — Opener"
    }
  },
  {
    "id": "bw-side-sewing-garment-trades-capstone",
    "title": "Sewing and Garment Trades — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Sewing and Garment Trades",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-sewing-garment-trades-opener",
    "programmeId": "sewing-garment-trades",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Sewing and Garment Trades",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "sewing-ergonomics-shift",
        "text": "The bench set up to the operator before the first seam: chair, table, pedal and light, the bundle in reach, and a symptom logged early instead of shrugged off."
      },
      {
        "type": "station",
        "target": "alteration-repair-ticket",
        "text": "The alterations tailor's own ticket, worked to the customer's pinned fit rather than a guess — the ripper, the hem, and the zipper closed out with a price and a time."
      },
      {
        "type": "station",
        "target": "garment-inspection-finish",
        "text": "The last bench a piece crosses: the light box and the spec sheet catch what a bare eye and a tape alone would miss before it ever reaches the box."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: OSHA 29 CFR 1910.212 machine guarding and 1910.147 lockout for industrial sewing, cutting and pressing equipment, 1910.1200 hazard communication for solvents and spot cleaners, NIOSH ergonomics guidance for seated repetitive work, the state apprenticeship standards for industrial sewing machine operators\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Sewing and Garment Trades — Capstone"
    }
  },
  {
    "id": "bw-side-bridge-and-structural-opener",
    "title": "Bridge and Structural Trades — First Shift",
    "giver": "the programme's training lead",
    "site": "Bridge and Structural Trades",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "bridge-and-structural",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Bridge and Structural Trades",
        "text": "The training lead meets you at Bridge and Structural Trades and points you to the first bench."
      },
      {
        "type": "station",
        "target": "steel-erector",
        "text": "The connecting the whole series builds on: the load landed and the bolts made up before anyone lets go."
      },
      {
        "type": "station",
        "target": "bridge-cable-inspection",
        "text": "The inspection that finds what connecting never checks: two lanyards live on the traveller, the rope read by eye and by flux head, and the wire count carried against the rejection criterion."
      },
      {
        "type": "station",
        "target": "bridge-lead-containment",
        "text": "The coatings work the same bridge eventually needs: a truss bay contained and held negative over open water so the lead that comes off it never reaches the water below."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"The bridge as a workplace: cable and hanger inspection at height, lead-paint containment on a truss, deck joint replacement under traffic control, and the erection work the structural programme already teaches.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Bridge and Structural Trades — Opener"
    }
  },
  {
    "id": "bw-side-bridge-and-structural-capstone",
    "title": "Bridge and Structural Trades — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Bridge and Structural Trades",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-bridge-and-structural-opener",
    "programmeId": "bridge-and-structural",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Bridge and Structural Trades",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "bs-structural-bolting-and-torque",
        "text": "The bolt-up the connecting leaves behind: a girder field splice verified in the calibrator, snugged from the middle out, turned from its match marks, and the one bolt that spun found before the inspector reads the rest."
      },
      {
        "type": "station",
        "target": "bs-tandem-lift-girder-set",
        "text": "The pick that bolting follows: one girder on two IUOE-flown cranes under a multiple-crane lift plan, kept level on the hoist, stopped for the wind, and braced to its neighbour before either hook lets go."
      },
      {
        "type": "station",
        "target": "bs-bearing-replacement-and-jacking",
        "text": "The maintenance the bearings eventually need: the lane under the span closed, a girder jacked on the engineer's plan with cribbing tight beside the jack, and the girder let down onto its new bearing without ever hanging on oil alone."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: OSHA 29 CFR 1926 Subparts M (fall protection), R (steel erection) and CC (cranes); 1926.62 lead in construction for bridge coatings; ANSI Z359; AWS D1.5 bridge welding; the owner's lane-closure and MUTCD traffic control plan\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Bridge and Structural Trades — Capstone"
    }
  },
  {
    "id": "bw-side-hotel-workers-opener",
    "title": "Hotel Workers — Back of House — First Shift",
    "giver": "the programme's training lead",
    "site": "Hotel Workers — Back of House",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "hotel-workers",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Hotel Workers — Back of House",
        "text": "The training lead meets you at Hotel Workers — Back of House and points you to the first bench."
      },
      {
        "type": "station",
        "target": "banquet-hot-hold",
        "text": "The banquet floor the series shares with the kitchen: hot boxes, chafers and the room set that has to be right before the doors open."
      },
      {
        "type": "station",
        "target": "housekeeping-room-turn",
        "text": "The room itself, turned under the state's own hotel ergonomics rule: the cart staged outside, the belt panic device proven, and the bed walked around rather than reached across."
      },
      {
        "type": "station",
        "target": "laundry-plant-chemicals",
        "text": "The plant behind every room on the floor: dosing lines checked against the SDS, the washer loaded to the scale, and the ironer's guard proven before a hand ever gets near the rollers."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"The hotel jobs that carry the injuries: turning a room with a housekeeping cart under the state's own hotel ergonomics rule and a panic button on the belt, the laundry plant's chemicals and folder, and a banquet changeover lifted right.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Hotel Workers — Back of House — Opener"
    }
  },
  {
    "id": "bw-side-hotel-workers-capstone",
    "title": "Hotel Workers — Back of House — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Hotel Workers — Back of House",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-hotel-workers-opener",
    "programmeId": "hotel-workers",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Hotel Workers — Back of House",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "hw-housekeeping-cart-and-chemical-safety",
        "text": "The stockroom before the first room: the new product looked up on its SDS, every bottle filled at the dispenser and labelled, the cart loaded heavy-low to its plate, and nothing ever mixed."
      },
      {
        "type": "station",
        "target": "hw-banquet-room-flip-and-staging",
        "text": "The banquet floor against the clock: rounds rolled onto the truck, stage decks lifted by a called team, cables ramped and the exits walked, with the doors held rather than a corner cut."
      },
      {
        "type": "station",
        "target": "hw-flatwork-ironer-and-folder-guarding",
        "text": "The laundry's most dangerous machine on a bad day: a wrapped sheet cleared under the operator's own lock at the disconnect and the steam valve, the heat waited out, and the guards back before the restart."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: Cal/OSHA's hotel housekeeping musculoskeletal injury prevention standard (8 CCR 3345), the workplace violence prevention plan (8 CCR 3342), 1910.1200 hazard communication for room and laundry chemicals, OSHA 1910.1030 bloodborne pathogens for sharps found in rooms, NFPA 96 where the laundry and kitchen share a plant\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Hotel Workers — Back of House — Capstone"
    }
  },
  {
    "id": "bw-side-builders-trades-opener",
    "title": "Builders — Carpenters, Laborers and Masons — First Shift",
    "giver": "the programme's training lead",
    "site": "Builders — Carpenters, Laborers and Masons",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "builders-trades",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Builders — Carpenters, Laborers and Masons",
        "text": "The training lead meets you at Builders — Carpenters, Laborers and Masons and points you to the first bench."
      },
      {
        "type": "station",
        "target": "concrete-pour",
        "text": "The pour the formwork exists for, with the pump remote and the crane over the deck as the interruptions that make it real."
      },
      {
        "type": "station",
        "target": "formwork-shoring",
        "text": "The shoring that carries the pour above it — mudsills, plumbed and pinned post shores, and a sign-off the truck outside does not get to skip."
      },
      {
        "type": "station",
        "target": "mass-timber-panel-set",
        "text": "The carpenters' own crane pick, flown by the IUOE operator this programme already names, with the deck kept clear and the panel braced before the hook lets go."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"The building trades' own stations: formwork and shoring to the engineer's drawings, a mass-timber panel picked and set, and masonry on a scaffold under the silica rule — beside the concrete pour and scaffold erection the construction programme already teaches.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Builders — Carpenters, Laborers and Masons — Opener"
    }
  },
  {
    "id": "bw-side-builders-trades-capstone",
    "title": "Builders — Carpenters, Laborers and Masons — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Builders — Carpenters, Laborers and Masons",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-builders-trades-opener",
    "programmeId": "builders-trades",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Builders — Carpenters, Laborers and Masons",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "bt-rebar-tying-and-impalement-protection",
        "text": "The steel the pour buries: a slab mat placed off walk boards and tied to the drawing, beside a row of dowels guarded by rated impalement caps rather than the mushrooms that only stop a scratch."
      },
      {
        "type": "station",
        "target": "bt-masonry-wall-layout-and-mortar",
        "text": "Where a bricklayer's wall begins: laid out square off the gridlines, dry-bonded, batched to the specification's proportions with the dust kept wet, and braced per the bracing plan inside its limited access zone."
      },
      {
        "type": "station",
        "target": "or-ranch-road-grading-and-culvert",
        "text": "The operating engineer's own station, off the slab entirely: a crown cut to the plan on open range, a culvert set in a trench respected as an excavation, and a school bus on the same road escorted through on the flagger's call."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: OSHA 29 CFR 1926 Subparts Q (concrete and formwork), L (scaffolds), CC (cranes) and 1926.1153 respirable crystalline silica; ANSI A10.9 concrete and masonry; the engineer's shoring and reshoring drawings\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Builders — Carpenters, Laborers and Masons — Capstone"
    }
  },
  {
    "id": "bw-side-first-responders-opener",
    "title": "First Responders — Fire, EMS, Police, Crisis and Relief — First Shift",
    "giver": "the programme's training lead",
    "site": "First Responders — Fire, EMS, Police, Crisis and Relief",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "first-responders",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "First Responders — Fire, EMS, Police, Crisis and Relief",
        "text": "The training lead meets you at First Responders — Fire, EMS, Police, Crisis and Relief and points you to the first bench."
      },
      {
        "type": "station",
        "target": "triage-point",
        "text": "The case every responder shares: a casualty tagged and re-tagged as they change, with the crowd and the structure moving around you."
      },
      {
        "type": "station",
        "target": "structure-fire-sizeup",
        "text": "The first ten minutes of a residential fire: the 360, the report that puts a picture in every radio on the channel, the mode called out loud, and the accountability check that proves everyone who went in is still there."
      },
      {
        "type": "station",
        "target": "firefighter-rehab-sector",
        "text": "The sector behind the fire where the crew itself is the patient: vitals read against a real release criterion, and a member held back for re-evaluation no matter who is asking for him back on the line."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Fifteen stations for the people who run toward the call, with the human side scored as procedure: size-up and rehab on the fireground, cardiac arrest as a pit crew, an overdose reversed, a crisis call de-escalated, a critical incident debriefed, trauma-informed intake and a home visit, a shelter opened and a damage-assessment team sent out, and psychological first aid. Every station closes with the crew's own check-in and the peer-support line the department uses.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "First Responders — Fire, EMS, Police, Crisis and Relief — Opener"
    }
  },
  {
    "id": "bw-side-first-responders-capstone",
    "title": "First Responders — Fire, EMS, Police, Crisis and Relief — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "First Responders — Fire, EMS, Police, Crisis and Relief",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-first-responders-opener",
    "programmeId": "first-responders",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "First Responders — Fire, EMS, Police, Crisis and Relief",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "damage-assessment-team",
        "text": "The block swept from the street, buddied and clear of every downed line and gas smell, with a structure classified honestly and never entered to prove it."
      },
      {
        "type": "station",
        "target": "psychological-first-aid",
        "text": "Look, listen, link at the family assistance centre: practical needs met first, a person's own words reflected, and a reporter turned away from a family that never agreed to be quoted."
      },
      {
        "type": "station",
        "target": "or-wildland-fireline-construction-and-lookout",
        "text": "The wildland edge from the crew's own side of it: LCES named before a tool moves, and a wind shift or a spot fire across the line answered by the radio instead of by someone deciding alone to keep cutting."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: NFPA 1500, 1584 and 1710 for fire and rehab, the NHTSA National EMS Scope of Practice, CIT International's crisis intervention model, the NASW Code of Ethics and SAMHSA's trauma-informed care principles, Psychological First Aid, NIMS/ICS through FEMA IS-100 and IS-700, and OSHA 29 CFR 1910.134, 1910.156 and 1910.1030\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "First Responders — Fire, EMS, Police, Crisis and Relief — Capstone"
    }
  },
  {
    "id": "bw-side-situational-awareness-opener",
    "title": "Situational Awareness — Interruption Drill — First Shift",
    "giver": "the programme's training lead",
    "site": "Situational Awareness — Interruption Drill",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "situational-awareness",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Situational Awareness — Interruption Drill",
        "text": "The training lead meets you at Situational Awareness — Interruption Drill and points you to the first bench."
      },
      {
        "type": "station",
        "target": "electrical",
        "text": "Your lock comes off the hasp while your eyes are on the meter. The isolation was correct once, and nobody looked at it again."
      },
      {
        "type": "station",
        "target": "welding",
        "text": "Two: the extraction trips while you set the machine, and the blanket slips off the conduit run while you lay the bead."
      },
      {
        "type": "station",
        "target": "trench-box",
        "text": "Spoil creeping back toward the lip above an entrant, and the spotter walking off while you programme a machine path."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Twenty-two procedures that interrupt you while you work. Every station in this block is one you may already know the order of — the block is not testing the order. It is testing whether you notice the alarm, the person in the wrong place or the thing that moved while your hands and eyes were somewhere else. Miss one and it scores as an unsafe action, because that is what it is.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Situational Awareness — Interruption Drill — Opener"
    }
  },
  {
    "id": "bw-side-situational-awareness-capstone",
    "title": "Situational Awareness — Interruption Drill — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Situational Awareness — Interruption Drill",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-situational-awareness-opener",
    "programmeId": "situational-awareness",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Situational Awareness — Interruption Drill",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "triage-point",
        "text": "A casualty you tagged green sitting down and going quiet, and the beam over the collapse starting to move."
      },
      {
        "type": "station",
        "target": "dock-crane",
        "text": "A lashing hand cutting through the red zone under a suspended box, and a gust front putting the load on the sail."
      },
      {
        "type": "station",
        "target": "press-brake",
        "text": "The light curtain left on bypass from the previous shift, and a colleague reaching into the die space to help."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: OSHA 1926.20(b)(2) competent-person hazard recognition and the human-factors component every one of these standards assumes: NFPA 70E, 1910.146 permit spaces, 1926.651 excavations, 1926.1400 cranes, NFPA 25 impairment control\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Situational Awareness — Interruption Drill — Capstone"
    }
  },
  {
    "id": "bw-side-ports-maritime-ecology-opener",
    "title": "Ports, Maritime and Bay Ecology — First Shift",
    "giver": "the programme's training lead",
    "site": "Ports, Maritime and Bay Ecology",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "ports-maritime-ecology",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Ports, Maritime and Bay Ecology",
        "text": "The training lead meets you at Ports, Maritime and Bay Ecology and points you to the first bench."
      },
      {
        "type": "station",
        "target": "dock-crane",
        "text": "The crane over all of it, with the wind limit and the lashing gang's positions as the hard constraints on every lift."
      },
      {
        "type": "station",
        "target": "container-lashing",
        "text": "Deck stow: every twist-lock proven and the rods to the pattern the ship's own manual calls for, crane held off the bay until the gang is clear."
      },
      {
        "type": "station",
        "target": "shore-power-hookup",
        "text": "Cold ironing a berthed ship: ground landed first, the breaker closed only on the port's order, and the auxiliaries shut down clean — the reason the At-Berth Regulation exists."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"A working port and the bay it sits on, worked by the trades that share the same quay: cargo secured and moved, a ship cold-ironed instead of idling, fuel and lines handled without a drop or a hand in the wrong place, and a spill contained before it ever reaches open water.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Ports, Maritime and Bay Ecology — Opener"
    }
  },
  {
    "id": "bw-side-ports-maritime-ecology-capstone",
    "title": "Ports, Maritime and Bay Ecology — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Ports, Maritime and Bay Ecology",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-ports-maritime-ecology-opener",
    "programmeId": "ports-maritime-ecology",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Ports, Maritime and Bay Ecology",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "reefer-yard-monitoring",
        "text": "The rack these boxes sit on between the crane and the gate: ground proven before the plug goes in, set point and return air read against the manifest, and a leak isolated before anyone else gets near it."
      },
      {
        "type": "station",
        "target": "straddle-carrier-ops",
        "text": "The machine that moves a box between the stack and the quay: twist-locks proven before the lift, the load carried low down the row, and the wind read the same way the crane reads it."
      },
      {
        "type": "station",
        "target": "hazmat-container-inspection",
        "text": "The dangerous-goods box on the apron before it ever reaches the crane: placards checked against the declaration, a leak found through the door seam from a safe standoff, and the Coast Guard notified."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: OSHA 29 CFR 1918 marine terminal safety, the California Air Resources Board At-Berth Regulation, OSHA HAZWOPER 1910.120 and the U.S. Army Corps of Engineers' Section 404 permit conditions for work at the water's edge\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Ports, Maritime and Bay Ecology — Capstone"
    }
  },
  {
    "id": "bw-side-air-quality-monitoring-opener",
    "title": "Air Quality — Monitoring and Control — First Shift",
    "giver": "the programme's training lead",
    "site": "Air Quality — Monitoring and Control",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "air-quality-monitoring",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Air Quality — Monitoring and Control",
        "text": "The training lead meets you at Air Quality — Monitoring and Control and points you to the first bench."
      },
      {
        "type": "station",
        "target": "air-monitor",
        "text": "The fence line itself: monitors sited by the wind, proven at zero and flow, with an exceedance answered by the plan rather than muted."
      },
      {
        "type": "station",
        "target": "mobile-air-lab",
        "text": "The same discipline out of a van: sited fresh on the day's wind, every channel zeroed and spanned, and a reference sample running for the neighbourhood's own check."
      },
      {
        "type": "station",
        "target": "opacity-reading",
        "text": "What a certified eye adds to what the instruments read: a stack's plume by EPA Method 9, with the geometry proven before the six-minute clock starts."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"The air a neighbourhood breathes is measured by a short chain of people and instruments, from a fence-line monitor to a stack test to a certified eye reading a plume, each one held to a different standard for a different reason. This block runs that chain end to end, from where the readings are taken to where the emissions actually come from.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Air Quality — Monitoring and Control — Opener"
    }
  },
  {
    "id": "bw-side-air-quality-monitoring-capstone",
    "title": "Air Quality — Monitoring and Control — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Air Quality — Monitoring and Control",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-air-quality-monitoring-opener",
    "programmeId": "air-quality-monitoring",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Air Quality — Monitoring and Control",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "stack-test",
        "text": "The number that goes in the permit file: an isokinetic source test, bracketed by leak checks that both have to pass or the run does not count."
      },
      {
        "type": "station",
        "target": "landfill-gas",
        "text": "Gas held underground instead of vented from a stack, tuned by what the well is actually giving up rather than by how far the valve is opened."
      },
      {
        "type": "station",
        "target": "soil-loadout",
        "text": "Where the dust a monitor reads can start: an excavation zoned by the wind, wetted at the face, and stopped the moment its own alarm says so."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: EPA Method 9 visible emissions (40 CFR 60 Appendix A), EPA 40 CFR Part 58 ambient air quality monitoring, the Bay Area Air Quality Management District's own regulations, and a site's Air Monitoring Plan under a cleanup order\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Air Quality — Monitoring and Control — Capstone"
    }
  },
  {
    "id": "bw-side-basketball-fundamentals-opener",
    "title": "Basketball Fundamentals — First Shift",
    "giver": "the programme's training lead",
    "site": "Basketball Fundamentals",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "basketball-fundamentals",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Basketball Fundamentals",
        "text": "The training lead meets you at Basketball Fundamentals and points you to the first bench."
      },
      {
        "type": "station",
        "target": "bb-warmup-injury-prevention-and-hydration",
        "text": "The first fifteen minutes that decide the rest: the floor walked dry, the emergency plan read, a dynamic warm-up in order and water called by the clock."
      },
      {
        "type": "station",
        "target": "bb-stance-and-ball-handling",
        "text": "The ball in the hands for the first time: balls checked, lanes spaced wide, the triple-threat stance built from the feet up and the eyes kept off the ball."
      },
      {
        "type": "station",
        "target": "bb-footwork-pivots-and-jump-stops",
        "text": "The lower body every later skill stands on: soft, balanced landings with knees over toes, a legal pivot on the ball of the foot and a jump count that is kept."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Ten stations on an indoor court that teach players the fundamentals and teach coaches to run a session nobody gets hurt in: the floor walked before anyone runs on it, contact introduced by size and stage, every knock to the head taken out of play, water and rest on the clock, and every heated moment, alarm and parent at the door handled calmly and in view.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Basketball Fundamentals — Opener"
    }
  },
  {
    "id": "bw-side-basketball-fundamentals-capstone",
    "title": "Basketball Fundamentals — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Basketball Fundamentals",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-basketball-fundamentals-opener",
    "programmeId": "basketball-fundamentals",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Basketball Fundamentals",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "bb-transition-spacing-and-roles",
        "text": "A fast break is five players with five jobs, so the lanes are filled wide, the roles are held, the extra pass beats the hero shot and the finish stops inside a clear run-off."
      },
      {
        "type": "station",
        "target": "bb-timeout-huddle-and-adjustment",
        "text": "A captain gets thirty seconds of a timeout while the team is losing, and one fact, one change and one encouragement, with water in hand and nobody blamed, is all that fits."
      },
      {
        "type": "station",
        "target": "bb-losing-well-and-film-review",
        "text": "The morning after a loss is where a team learns what to do with one: each player owns a part, names one fix and thanks the teammate who covered for them, and nobody is put on trial."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: USA Basketball youth development guidelines for age-appropriate play, practice and rest; NFHS basketball rules and sports medicine guidance; CDC Heads Up concussion training; U.S. Center for SafeSport abuse-prevention policies; the American Red Cross first aid, CPR and AED course\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Basketball Fundamentals — Capstone"
    }
  },
  {
    "id": "bw-side-bay-restoration-maritime-underwater-opener",
    "title": "SF Bay Restoration & Cleanup — Maritime and Underwater — First Shift",
    "giver": "the programme's training lead",
    "site": "SF Bay Restoration & Cleanup — Maritime and Underwater",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "bay-restoration-maritime-underwater",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "SF Bay Restoration & Cleanup — Maritime and Underwater",
        "text": "The training lead meets you at SF Bay Restoration & Cleanup — Maritime and Underwater and points you to the first bench."
      },
      {
        "type": "station",
        "target": "br-dive-site-hazard-assessment-and-jsa",
        "text": "Every restoration dive starts on deck with the supervisor's job safety analysis, where the intake, the neighbouring pile hammer, the current and the contaminated water are found and controlled before anyone dresses."
      },
      {
        "type": "station",
        "target": "br-surface-supplied-dive-station-setup",
        "text": "The station the diver breathes from is built by the dive team itself, so the compressor intake, the condensate, both supplies, the bailout and the helmet's non-return valve are proven before the first dive of the day."
      },
      {
        "type": "station",
        "target": "br-underwater-debris-survey-and-mapping",
        "text": "No debris comes off the Bay floor until a diver has mapped it on a baseline, found the drums, batteries, rebar and hulls, and left the hazardous items for the work plan."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Thirty-five more jobs the deep restoration and clean-up of San Francisco Bay will need, weighted to the water: the dive crew and its tender, the workboats, barges and skimmers, the shoreline and wetland crews, the sediment and water-quality work, and the monitoring and community science around it. Built in five packs of seven; every dive station keeps a standby diver, a tender and a supervisor on deck, and no depth, gas or decompression number is ever stated — those live in the dive plan.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "SF Bay Restoration & Cleanup — Maritime and Underwater — Opener"
    }
  },
  {
    "id": "bw-side-bay-restoration-maritime-underwater-capstone",
    "title": "SF Bay Restoration & Cleanup — Maritime and Underwater — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "SF Bay Restoration & Cleanup — Maritime and Underwater",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-bay-restoration-maritime-underwater-opener",
    "programmeId": "bay-restoration-maritime-underwater",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "SF Bay Restoration & Cleanup — Maritime and Underwater",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "br-restoration-data-qa-and-public-reporting",
        "text": "Every field sheet is checked before it's scanned and every suspect value is flagged rather than typed straight in, so the one line the public dashboard is allowed to say about the Bay is a line the reviewed data actually backs up."
      },
      {
        "type": "station",
        "target": "br-beach-seine-fish-survey-and-handling",
        "text": "The net is set from the skiff and hauled as one crew, every fish is named and counted at the generic level the reference calls for, and none of them spends longer out of the water than the permit's handling window allows."
      },
      {
        "type": "station",
        "target": "br-benthic-grab-and-invertebrate-sorting",
        "text": "The grab comes up from the workboat's rail with hands clear of its live jaws, the sample is sieved and sorted into generic taxonomic groups, and every jar is in custody before the organisms inside it have any chance to degrade."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: Programme completion record; the dive, vessel and hazmat credentials it rehearses are issued only by their own bodies — OSHA 29 CFR 1910 Subpart T and the ADCI consensus standard for the dive crew, USCG 33 and 46 CFR for the vessels, OSHA 1910.120 HAZWOPER inside any sediment exclusion zone, and the Section 404/401 permit conditions for every hour of in-water work\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "SF Bay Restoration & Cleanup — Maritime and Underwater — Capstone"
    }
  },
  {
    "id": "bw-side-railroad-crafts-opener",
    "title": "Railroad Crafts — Track, Car and Cab — First Shift",
    "giver": "the programme's training lead",
    "site": "Railroad Crafts — Track, Car and Cab",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "railroad-crafts",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Railroad Crafts — Track, Car and Cab",
        "text": "The training lead meets you at Railroad Crafts — Track, Car and Cab and points you to the first bench."
      },
      {
        "type": "station",
        "target": "ra-roadway-worker-protection-and-job-briefing",
        "text": "Every job on the railroad starts with the same habit: a briefing everyone actually signs onto, working limits requested and read back, and a watchman posted at a sighting distance worked back from the timetable speed rather than chosen for convenience."
      },
      {
        "type": "station",
        "target": "ra-tie-and-rail-replacement-with-track-machines",
        "text": "The machines that do the actual lifting on a tie and rail change-out — a crane, a saw, a tamper — each carry their own hazard zone, and the gang's protection is proving the crew stayed outside every one of them, not just that the track measures right afterward."
      },
      {
        "type": "station",
        "target": "ra-switch-inspection-and-lubrication",
        "text": "A hand-thrown switch gets locked and tagged before a hand goes near the points, and the heater that keeps it free of ice gets proven dead by a hold, not assumed safe from a breaker position."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight of the jobs a freight railroad runs on every day: the roadway gang's own protection and briefing, a tie and rail change-out with the machines that do the lifting, a switch locked out and proven by gauge, a full air brake test walked car by car, a cut secured on a grade and proven by test, a grade crossing taken down and proven against a shunt, a locomotive proven ready before it moves, and the blue flag that lets two crews share one cut of equipment without either one trusting the other's protection instead of their own.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Railroad Crafts — Track, Car and Cab — Opener"
    }
  },
  {
    "id": "bw-side-railroad-crafts-capstone",
    "title": "Railroad Crafts — Track, Car and Cab — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Railroad Crafts — Track, Car and Cab",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-railroad-crafts-opener",
    "programmeId": "railroad-crafts",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Railroad Crafts — Track, Car and Cab",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "ra-crossing-signal-maintenance-and-flagging",
        "text": "Taking a grade crossing's automatic protection down for a test means the road gets protected by hand for as long as the gates and lights cannot be trusted, and the crossing is proven with a real shunt before it goes back to drivers who never knew it was down."
      },
      {
        "type": "station",
        "target": "ra-locomotive-cab-startup-and-alerter",
        "text": "A locomotive gets a walk-around before it gets a cab, both brakes tested before the first mile, and the alerter answered on its own schedule for the whole trip because it is the one device built to notice an engineer who has stopped noticing anything else."
      },
      {
        "type": "station",
        "target": "ra-blue-flag-protection-in-the-yard",
        "text": "Two crews sharing one cut of equipment both need their own blue flag at every point it could be moved from, because a flag protects the worker who displayed it — never the next person who assumes it also covers them."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: FRA 49 CFR Part 213 track safety standards, Part 214 roadway worker protection, Part 218 blue signal protection of workers and Part 232 brake system safety standards, worked the way BLET, SMART-TD and BMWED train their own crafts to work them\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Railroad Crafts — Track, Car and Cab — Capstone"
    }
  },
  {
    "id": "bw-side-heavy-equipment-operators-opener",
    "title": "Heavy Equipment Operators — IUOE Local 3 — First Shift",
    "giver": "the programme's training lead",
    "site": "Heavy Equipment Operators — IUOE Local 3",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "heavy-equipment-operators",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Heavy Equipment Operators — IUOE Local 3",
        "text": "The training lead meets you at Heavy Equipment Operators — IUOE Local 3 and points you to the first bench."
      },
      {
        "type": "station",
        "target": "op-excavator-trench-and-utility-locate",
        "text": "The excavator only earns the cut once the locate ticket is checked against the paint, the swing radius is barricaded, the coupler is locked, and the last foot over the marked line is exposed by hand."
      },
      {
        "type": "station",
        "target": "op-dozer-slope-work-and-rollover-protection",
        "text": "A dozer cutting a bench into a slope lives or dies on the ROPS and the seatbelt actually being used, so this station walks the slope for an undercut before the blade ever gets there."
      },
      {
        "type": "station",
        "target": "op-loader-truck-loading-and-blind-spots",
        "text": "A wheel loader's blind zones are fixed facts of the machine, not something attention can compensate for, so this station maps them before the first bucket ever swings toward the truck."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight machines, eight IUOE jobs: an excavator trenching over a located utility, a dozer cutting a bench with its ROPS and seatbelt proven, a wheel loader working around its own blind zones, a grader cutting a road's crown to a stringline, a compactor rolling a fill lift by lift at the edge, a crawler crane's assembly closed out against its own load chart, a pile rig plumbed in two planes before the first blow, and the daily walkaround that keeps every one of them honest. Every station ends with a spotter, a checker or a tender who is doing a job the seat itself cannot do alone.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Heavy Equipment Operators — IUOE Local 3 — Opener"
    }
  },
  {
    "id": "bw-side-heavy-equipment-operators-capstone",
    "title": "Heavy Equipment Operators — IUOE Local 3 — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Heavy Equipment Operators — IUOE Local 3",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-heavy-equipment-operators-opener",
    "programmeId": "heavy-equipment-operators",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Heavy Equipment Operators — IUOE Local 3",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "op-crawler-crane-assembly-and-load-chart",
        "text": "An assembly that looks finished from the ground is not the same as one inspected pin by pin, so this station proves it with a barricaded swing, a chart reading and a held test lift before the first real pick."
      },
      {
        "type": "station",
        "target": "op-pile-driving-rig-and-lead-setup",
        "text": "A pile that starts out of plumb never corrects itself, so this station plumbs the leads in two planes and starts the first blows on low energy where a lean can still be caught."
      },
      {
        "type": "station",
        "target": "op-equipment-daily-walkaround-and-fluids",
        "text": "Every machine in this pack starts its day the same way: walked for a defect, its fluids read against their own gauges, chocked before anyone works near it, and its brakes and hydraulics proved before the first real load."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: IUOE Local 3 operating engineer training; OSHA 29 CFR 1926 Subparts O, P, CC and W (motor vehicles and mechanized equipment, excavations, cranes and derricks, and rollover protective structures) and material-handling and pile-driving sections 1926.601 through .603; 29 CFR 1926.21 safety training; NIOSH fatality-investigation findings on struck-by, rollover and crane-assembly incidents; ASME B30.5 for the crawler crane\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Heavy Equipment Operators — IUOE Local 3 — Capstone"
    }
  },
  {
    "id": "bw-side-plumbers-and-pipefitters-opener",
    "title": "Plumbers and Pipefitters — Journeyman Rough-In and Test Block — First Shift",
    "giver": "the programme's training lead",
    "site": "Plumbers and Pipefitters — Journeyman Rough-In and Test Block",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "plumbers-and-pipefitters",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Plumbers and Pipefitters — Journeyman Rough-In and Test Block",
        "text": "The training lead meets you at Plumbers and Pipefitters — Journeyman Rough-In and Test Block and points you to the first bench."
      },
      {
        "type": "station",
        "target": "pl-medical-gas-brazing-and-purge",
        "text": "The zone valve is locked and tagged before any pipe opens, the nitrogen purge runs before the torch ever lights, and every outlet is cross-tested against its own gas before the zone goes back to the floor."
      },
      {
        "type": "station",
        "target": "pl-hydronic-boiler-piping-and-hydrotest",
        "text": "A new heating loop off a locked-out boiler is assembled in a proven bolt pattern and then walked joint by joint under a hydrostatic test before a single section goes behind insulation."
      },
      {
        "type": "station",
        "target": "pl-underground-sewer-lateral-and-trench-shoring",
        "text": "The protective system goes into the excavation before anyone works below grade, the lateral is laid to a fall checked against a laser at every joint, and the shield comes out a lift at a time as the backfill takes over holding the wall."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight jobs a UA plumber or pipefitter actually rotates through: medical gas brazed under a nitrogen purge, a hydronic loop off a locked-out boiler hydrotested before cover-up, a sewer lateral trenched and shored to a proven fall, a sprinkler riser's annual flow test, a rough-in run both pressed and soldered, a failed steam trap replaced on a vented line, a water heater strapped and relief-valved to its own rating, and a new gas line air-tested and purged before anything is lit. Every station ends on a proof — a gauge, a witness mark, a signed report — rather than on how the joint looked going together.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Plumbers and Pipefitters — Journeyman Rough-In and Test Block — Opener"
    }
  },
  {
    "id": "bw-side-plumbers-and-pipefitters-capstone",
    "title": "Plumbers and Pipefitters — Journeyman Rough-In and Test Block — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Plumbers and Pipefitters — Journeyman Rough-In and Test Block",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-plumbers-and-pipefitters-opener",
    "programmeId": "plumbers-and-pipefitters",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Plumbers and Pipefitters — Journeyman Rough-In and Test Block",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "pl-steam-trap-and-condensate-line-repair",
        "text": "The failed trap's line is vented and proven at zero before the body ever opens, the replacement is matched to the application, and the line is warmed back up slowly enough that trapped condensate boils off instead of hammering through the pipe."
      },
      {
        "type": "station",
        "target": "pl-water-heater-and-tpr-valve-replacement",
        "text": "The new tank is strapped against a seismic event before it is ever filled, the relief valve is matched to the tank's own rating rather than its thread size, and the gas connection is tested before the pilot lights."
      },
      {
        "type": "station",
        "target": "pl-natural-gas-pressure-test-and-leak-check",
        "text": "The new run is pressure-tested with air rather than fuel, every joint is soap-checked rather than trusted to the gauge alone, and the line is purged outdoors before any appliance ever sees live gas."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: UA plumbers and pipefitters apprenticeship standards, tested against NFPA 99, NFPA 13, NFPA 25, NFPA 54, ASME B31.9, the ASME Boiler and Pressure Vessel Code and the Uniform Plumbing Code (UPC) across eight distinct union jobs\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Plumbers and Pipefitters — Journeyman Rough-In and Test Block — Capstone"
    }
  },
  {
    "id": "bw-side-glaziers-and-architectural-metal-opener",
    "title": "Glaziers and Architectural Metal — First Shift",
    "giver": "the programme's training lead",
    "site": "Glaziers and Architectural Metal",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "glaziers-and-architectural-metal",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Glaziers and Architectural Metal",
        "text": "The training lead meets you at Glaziers and Architectural Metal and points you to the first bench."
      },
      {
        "type": "station",
        "target": "gl-curtain-wall-unit-setting-from-the-floor",
        "text": "A pre-glazed unit is walked off the floor stack on a davit and anchored into a bay that is a straight fall to the street for as long as it stays open, so the barrier, the harness and the wind reading all come before the unit does."
      },
      {
        "type": "station",
        "target": "gl-storefront-frame-and-glass-set-with-cups",
        "text": "Ground level reads as low-risk right up until a tempered lite meets a gust at a propped entrance door with the sidewalk a metre away, so the cups are proven on scrap and the door prop is checked before the lite ever clears the A-frame."
      },
      {
        "type": "station",
        "target": "gl-glass-handling-cart-and-crane-vacuum-lifter",
        "text": "Every lite in the yard changes hands twice before it is cut, and both the crane's vacuum beam and the hand cups fail the same way — a reading trusted without being read — so both get proven empty before either carries a real lite."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"A glass and metal crew across a whole building: a unit walked off the floor, a storefront glazed with cups, a yard that hands lites from a trailer to a rack, a swing stage over the plaza, a skylight opened only under a screen, a shattered lite cleared and covered, a shop that bends and squares the panel before it ever ships, and the field measure an order is actually cut against.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Glaziers and Architectural Metal — Opener"
    }
  },
  {
    "id": "bw-side-glaziers-and-architectural-metal-capstone",
    "title": "Glaziers and Architectural Metal — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Glaziers and Architectural Metal",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-glaziers-and-architectural-metal-opener",
    "programmeId": "glaziers-and-architectural-metal",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Glaziers and Architectural Metal",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "gl-tempered-glass-breakage-and-cleanup",
        "text": "A tempered lite that lets go on its own still leaves a fringe of glass held in the frame by nothing but its own jagged edges and a bay with no glass in it five storeys up, so the fringe is freed under control and the cover goes up before the sweep even starts."
      },
      {
        "type": "station",
        "target": "gl-aluminium-panel-fabrication-and-brake",
        "text": "A press brake closes on tonnes at a pace slow enough to look harmless and fast enough to give a hand no time back, so the two-hand control is proven empty and held through every cycle rather than trusted to a single foot pedal."
      },
      {
        "type": "station",
        "target": "gl-shop-drawing-takeoff-and-field-measure",
        "text": "A lite ordered to the drawing instead of the actual opening arrives and does not fit, so the field measurement — width, height and both diagonals, taken from a scaffold that is locked before it is climbed — is what the shop cuts glass against."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: IUPAT District Council 16 glaziers apprenticeship and training in architectural glass and metal, the IUPAT Finishing Trades Institute glazier curriculum, ANSI/ASSP Z97.1 safety glazing materials, and OSHA 29 CFR 1926 Subparts L and M for scaffolds and fall protection\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Glaziers and Architectural Metal — Capstone"
    }
  },
  {
    "id": "bw-side-elevator-constructors-opener",
    "title": "Elevator Constructor — IUEC Core Skills — First Shift",
    "giver": "the programme's training lead",
    "site": "Elevator Constructor — IUEC Core Skills",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "elevator-constructors",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Elevator Constructor — IUEC Core Skills",
        "text": "The training lead meets you at Elevator Constructor — IUEC Core Skills and points you to the first bench."
      },
      {
        "type": "station",
        "target": "ew-hoistway-false-car-and-rail-setting",
        "text": "Setting the first guide rail in a new hoistway from a false car, with the platform's own stop switch confirmed and a tag line never out of a hand while the hoist is running."
      },
      {
        "type": "station",
        "target": "ew-machine-room-lockout-and-brake-test",
        "text": "Proving the traction machine's brake against its own wear limits, with the hand-release lever physically guarded so nobody can pull it while the reading is being taken."
      },
      {
        "type": "station",
        "target": "ew-pit-work-and-buffer-inspection",
        "text": "A full pit service — refuge space, ladder, sump pump, and both the spring and oil buffers proven against their own ratings before anyone climbs back out."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight jobs across new installation, machine room, pit, car top, door, escalator, rope and a coordinated rescue — the isolation habit proven fresh each time against a different machine and a different way of getting hurt.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Elevator Constructor — IUEC Core Skills — Opener"
    }
  },
  {
    "id": "bw-side-elevator-constructors-capstone",
    "title": "Elevator Constructor — IUEC Core Skills — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Elevator Constructor — IUEC Core Skills",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-elevator-constructors-opener",
    "programmeId": "elevator-constructors",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Elevator Constructor — IUEC Core Skills",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "ew-escalator-step-chain-and-comb-plate",
        "text": "Isolating an escalator to gauge its step chain tension and skirt clearance, then proving the comb, skirt and handrail safety switches with an actual test, not a look."
      },
      {
        "type": "station",
        "target": "ew-rope-inspection-and-sheave-wear",
        "text": "Walking a hoist rope set by gloved hand for broken wire and dry sections, then gauging tension, diameter and the sheave groove against the limits each one is retired at."
      },
      {
        "type": "station",
        "target": "ew-elevator-entrapment-and-rescue-with-fire-service",
        "text": "A coordinated rescue with a responding fire company — the car's true position confirmed before a hand crank ever lowers it, and the sill bridged before a passenger ever steps toward the gap."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: IUEC elevator constructors; NEIEP apprenticeship curriculum; ASME A17.1 the safety code for elevators and escalators; OSHA 29 CFR 1910.147 control of hazardous energy for every disconnect this block isolates\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Elevator Constructor — IUEC Core Skills — Capstone"
    }
  },
  {
    "id": "bw-side-insulators-and-boilermakers-opener",
    "title": "Insulators and Boilermakers — Building Systems — First Shift",
    "giver": "the programme's training lead",
    "site": "Insulators and Boilermakers — Building Systems",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "insulators-and-boilermakers",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Insulators and Boilermakers — Building Systems",
        "text": "The training lead meets you at Insulators and Boilermakers — Building Systems and points you to the first bench."
      },
      {
        "type": "station",
        "target": "ib-mechanical-insulation-pipe-and-jacketing",
        "text": "A hot process pipe only gets insulated and jacketed once the bare metal's surface temperature is proven safe to touch, because the burn hazard under an unfinished run is invisible to anyone judging it by eye alone."
      },
      {
        "type": "station",
        "target": "ib-firestop-and-fire-wrap-installation",
        "text": "A wall or floor opened for someone else's pipes and cables only goes back to being a rated assembly when it is closed to the exact listed system the annular space and the penetrant mix were tested against, not to whichever detail looks close enough."
      },
      {
        "type": "station",
        "target": "ib-asbestos-glovebag-removal-on-a-pipe",
        "text": "Stripping asbestos pipe insulation inside a sealed glovebag while the header stays in service means the seal is proven before a single strip, because a contained job and a fibre release inside that same bag are separated only by whether the bag actually holds."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight stations across the two trades that keep a plant's pipes, walls and pressure equipment doing what they are rated for: pipe insulation and jacketing, a firestopped penetration, an asbestos glovebag removal, a boiler tube rolled and welded back in, a pressure vessel entered and hot-worked, a furnace wall relined in castable, a repair proven on a hydrostatic test, and a mechanical room sprayed in foam behind a respirator that was actually fit-tested first.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Insulators and Boilermakers — Building Systems — Opener"
    }
  },
  {
    "id": "bw-side-insulators-and-boilermakers-capstone",
    "title": "Insulators and Boilermakers — Building Systems — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Insulators and Boilermakers — Building Systems",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-insulators-and-boilermakers-opener",
    "programmeId": "insulators-and-boilermakers",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Insulators and Boilermakers — Building Systems",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "ib-refractory-and-castable-installation",
        "text": "A furnace wall relined in castable is only as sound as the anchors it was poured over and the dryout ramp that follows, because rushing either one bakes a weak spot into a lining nobody can see the inside of once it cures."
      },
      {
        "type": "station",
        "target": "ib-hydrostatic-test-and-inspector-witness",
        "text": "A repaired vessel is proven safe by a hydrostatic test only when the trapped air is vented before the fill, the walk for weeps happens from beside every joint rather than in front of it, and an inspector actually witnesses the hold."
      },
      {
        "type": "station",
        "target": "ib-spray-foam-and-respirator-fit",
        "text": "Spraying closed-cell foam next to an open isocyanate drum only starts once the respirator has been quantitatively fit-tested on the person wearing it, because a mask nobody has proven seals is a hope, not a control."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: Insulators Local 16 and Boilermakers Local 549 apprenticeship and training, OSHA 29 CFR 1926.1101 asbestos in construction, 29 CFR 1910.146 permit-required confined spaces, ASME Section I and Section IX, and the National Board Inspection Code (NBIC), as taught across mechanical insulation, firestop, abatement, boiler and pressure-vessel repair work\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Insulators and Boilermakers — Building Systems — Capstone"
    }
  },
  {
    "id": "bw-side-cement-masons-and-plasterers-opener",
    "title": "Cement Masons and Plasterers — First Shift",
    "giver": "the programme's training lead",
    "site": "Cement Masons and Plasterers",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "cement-masons-and-plasterers",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Cement Masons and Plasterers",
        "text": "The training lead meets you at Cement Masons and Plasterers and points you to the first bench."
      },
      {
        "type": "station",
        "target": "cm-slab-screed-bull-float-and-trowel",
        "text": "A slab on grade closed the way OPCMIA teaches it: struck off across checked rails, floated once, hand-troweled after the bleed water leaves, and cured before the crew signs off."
      },
      {
        "type": "station",
        "target": "cm-power-trowel-operation-and-guarding",
        "text": "The same floor finished by machine: a walk-behind trowel walked, guarded and pitched to the manufacturer's bands with nobody's hand ever near a turning blade."
      },
      {
        "type": "station",
        "target": "cm-curb-and-gutter-forms-and-finish",
        "text": "Cement mason's work beside a live lane: a curb and gutter run set to the grade sheet's line, struck to the form's face and broomed, with the crew never in the machine's path or the travel lane."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight ways a slab, a curb, a wall or a floor gets closed right: struck off and troweled, power-finished under guard, formed and finished at the curb, built in three plaster coats, shot from a nozzle, cut wet, coated and ventilated, and protected through a freeze — cement burns, silica, guarding and fumes named on every one.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Cement Masons and Plasterers — Opener"
    }
  },
  {
    "id": "bw-side-cement-masons-and-plasterers-capstone",
    "title": "Cement Masons and Plasterers — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Cement Masons and Plasterers",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-cement-masons-and-plasterers-opener",
    "programmeId": "cement-masons-and-plasterers",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Cement Masons and Plasterers",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "cm-concrete-saw-cutting-with-water-and-silica-control",
        "text": "The cured slab's control joints cut wet in an enclosed stairwell, with the blade guarded, the water on before the first pass and the air watched for the gas saw's own exhaust."
      },
      {
        "type": "station",
        "target": "cm-epoxy-floor-coating-and-ventilation",
        "text": "A warehouse floor coated with a two-part epoxy under mechanical ventilation, batched to the can's ratio and posted for its full re-entry time before anyone goes back in unprotected."
      },
      {
        "type": "station",
        "target": "cm-cold-weather-curing-and-blankets",
        "text": "The programme's closer: a slab talked through a hard freeze under blankets and a vented heater, with the protection held until the cold weather plan's own strength is actually confirmed."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: OPCMIA Local 300 cement mason and plasterer apprenticeship as a training body; ACI concrete field testing and cold weather concreting guidance; OSHA 29 CFR 1926 Subpart Q concrete and masonry construction and 29 CFR 1926.1153 respirable crystalline silica\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Cement Masons and Plasterers — Capstone"
    }
  },
  {
    "id": "bw-side-healthcare-support-opener",
    "title": "Healthcare Support — First Shift",
    "giver": "the programme's training lead",
    "site": "Healthcare Support",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "healthcare-support",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Healthcare Support",
        "text": "The training lead meets you at Healthcare Support and points you to the first bench."
      },
      {
        "type": "station",
        "target": "hc-environmental-services-isolation-room-turnover",
        "text": "The room an EVS tech inherits the moment a precautions patient leaves: PPE donned to the posted barrier, linen bagged rather than shaken, regulated waste kept out of general trash, and the room logged clean and released."
      },
      {
        "type": "station",
        "target": "hc-sterile-processing-decontamination-and-assembly",
        "text": "A hospital-wide case cart rather than a single tray: decontaminated and pre-treated by hand before the washer ever runs, counted back against its own count sheet on the clean side, and sterilized with the biological indicator that proves it."
      },
      {
        "type": "station",
        "target": "hc-patient-transport-and-safe-handling",
        "text": "The ID band checked against the ticket, the brakes locked before every transfer, a gait belt used instead of a solo lift, and a real verbal handoff at the other end instead of a dropped chart."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"The hospital support jobs that never touch a clinical decision but hold the whole building's safety together: an isolation room turned over with the barrier never broken, a surgical tray decontaminated and counted back against its own sheet, a patient moved with a gait belt instead of a solo lift, a tray line that sorts a real allergy flag from a routine one, three waste streams kept apart from the linen chute to the loading dock, a crash cart proven ready every day and a real code supported without ever touching the patient, a front desk that meets an escalating visitor with distance and a calm voice, and a hazardous-drug spill met with the kit built for exactly that.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Healthcare Support — Opener"
    }
  },
  {
    "id": "bw-side-healthcare-support-capstone",
    "title": "Healthcare Support — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Healthcare Support",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-healthcare-support-opener",
    "programmeId": "healthcare-support",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Healthcare Support",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "hc-code-response-support-and-crash-cart-check",
        "text": "A crash cart proven ready every single day by seal and self-test, and the logistics of a real code handled by someone who never touches the patient — the hallway held, family redirected, a backup cart delivered."
      },
      {
        "type": "station",
        "target": "hc-workplace-violence-deescalation-at-the-desk",
        "text": "The duress button proven before the first visitor of the day, an escalating visitor met with distance and a calm scripted approach, and the incident logged honestly with a debrief requested for the clerk."
      },
      {
        "type": "station",
        "target": "hc-hazardous-drug-spill-kit-response",
        "text": "A hazardous-drug spill outside the pharmacy met with the kit built for exactly this: the area restricted first, PPE donned in order, every trace of secondary contamination found, and the waste sealed into its own stream."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: OSHA 29 CFR 1910.1030 bloodborne pathogens and 1910.1200 hazard communication; OSHA 29 CFR 1910.134 respiratory protection; the CDC's general infection-prevention guidance; ANSI/AAMI ST79 for steam sterilization; USP General Chapter <800> for hazardous drugs; HIPAA's privacy rule; the FDA Food Code and ServSafe food-handler training; NFPA 101 Life Safety Code; Cal/OSHA's workplace violence prevention standard (8 CCR 3342) and Injury and Illness Prevention Program (8 CCR 3203); Labor Code §6310; and lifting principles drawn from the Revised NIOSH Lifting Equation\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Healthcare Support — Capstone"
    }
  },
  {
    "id": "bw-side-roofers-and-waterproofers-opener",
    "title": "Roofers and Waterproofers — First Shift",
    "giver": "the programme's training lead",
    "site": "Roofers and Waterproofers",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "roofers-and-waterproofers",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Roofers and Waterproofers",
        "text": "The training lead meets you at Roofers and Waterproofers and points you to the first bench."
      },
      {
        "type": "station",
        "target": "rf-torch-applied-membrane-and-fire-watch",
        "text": "A modified-bitumen cap sheet torched on with a dedicated fire watch, where the permit and the extinguisher matter as much as the flame."
      },
      {
        "type": "station",
        "target": "rf-single-ply-tpo-heat-welding-and-seam-probe",
        "text": "A single-ply roof welded to its wind-uplift pattern, where every seam is probed clean before it is trusted."
      },
      {
        "type": "station",
        "target": "rf-hot-asphalt-kettle-and-mop",
        "text": "The kettle and the mop behind a built-up roof, where a damp block or a foaming brew is the whole hazard."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight ways a roof gets covered, guarded and closed out — the flame, the kettle, the panel, the trench, the tear-off, the opening and the growing medium — and the fall protection, hot-work and dust controls that run under every one of them.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Roofers and Waterproofers — Opener"
    }
  },
  {
    "id": "bw-side-roofers-and-waterproofers-capstone",
    "title": "Roofers and Waterproofers — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Roofers and Waterproofers",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-roofers-and-waterproofers-opener",
    "programmeId": "roofers-and-waterproofers",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Roofers and Waterproofers",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "rf-roof-tear-off-and-debris-chute",
        "text": "An old roof opened up strip by strip, scanned for what decades of cover hid, and sent down the chute instead of piled on the deck."
      },
      {
        "type": "station",
        "target": "rf-skylight-and-hatch-guarding",
        "text": "Every opening on the roof matched to what actually guards it, proof-tested rather than assumed."
      },
      {
        "type": "station",
        "target": "rf-green-roof-and-overburden-placement",
        "text": "The roof that ends as a garden, where the load, the depth and the irrigation all have to check out before anything green goes down."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: NRCA roofing and waterproofing practice, and the fall-protection, hot-work and silica standards behind every station in the block\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Roofers and Waterproofers — Capstone"
    }
  },
  {
    "id": "bw-side-water-and-gas-utility-crews-opener",
    "title": "Water and Gas Utility Crews — Distribution Authority — First Shift",
    "giver": "the programme's training lead",
    "site": "Water and Gas Utility Crews — Distribution Authority",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "water-and-gas-utility-crews",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Water and Gas Utility Crews — Distribution Authority",
        "text": "The training lead meets you at Water and Gas Utility Crews — Distribution Authority and points you to the first bench."
      },
      {
        "type": "station",
        "target": "ut-water-main-break-emergency-shutdown-and-excavation",
        "text": "The valve book decides which two valves make the section and the order they close in, the locate ticket is read before the pit is opened, and the clamp does not go on until the gauge — not a guess — says the main is actually at zero."
      },
      {
        "type": "station",
        "target": "ut-hydrant-flow-test-and-flushing-with-traffic-control",
        "text": "One hydrant is cracked open slowly and read on a pitot gauge, a second hydrant's residual is watched the whole time it flows, and none of it happens in the open street before the cones and the sign are ahead of the taper."
      },
      {
        "type": "station",
        "target": "ut-service-line-locate-and-hand-dig-near-gas-main",
        "text": "Everything inside the tolerance zone is worked by hand or by vacuum, the marked main is proven by exposing it rather than assumed from the paint, and the depth actually found is logged for the next crew that digs here."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight jobs a water or gas utility crew actually rotates through: a water main break shut down on the valve book's own two valves and excavated to a proven repair, a hydrant flow-tested behind a cone taper with the residual watched the whole time it flows, a gas main hand-exposed inside its own staked tolerance zone, a meter set on a proven riser and torqued straight, a steel main's cathodic protection read at a rectifier locked out before its cabinet opens, a PE main squeezed off and fused on clean faces, a treatment plant's chemical delivery proven against its own label before a hose ever connects, and a storm-darkened lift station brought back up on a generator whose cable never touches the transfer switch until the utility feed is proven dead. Every station ends on a proof — a gauge, a logged reading, a bead inspected — rather than on how safe the job looked going in.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Water and Gas Utility Crews — Distribution Authority — Opener"
    }
  },
  {
    "id": "bw-side-water-and-gas-utility-crews-capstone",
    "title": "Water and Gas Utility Crews — Distribution Authority — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Water and Gas Utility Crews — Distribution Authority",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-water-and-gas-utility-crews-opener",
    "programmeId": "water-and-gas-utility-crews",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Water and Gas Utility Crews — Distribution Authority",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "ut-pe-pipe-fusion-and-squeeze-off",
        "text": "A squeeze-off bar stands in for a valve that does not exist, a butt-fusion joint is made from two faces scraped clean and heat-soaked evenly, and the bead is inspected and the bore released slowly before either one is trusted."
      },
      {
        "type": "station",
        "target": "ut-water-treatment-chemical-delivery-unloading",
        "text": "The shipping papers, the safety data sheet and the tank's own label all have to agree before a single hose connects, and the transfer is watched at the coupling and stopped well short of a tank already checked for room."
      },
      {
        "type": "station",
        "target": "ut-night-storm-response-crew-and-portable-generator",
        "text": "A flooded access road is driven slowly and deliberately at night, and the lift station's utility feed is locked out and proven dead before the generator's cable ever touches the transfer switch."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: UWUA and IBEW gas-utility distribution crew training, tested against 49 CFR Part 192 (PHMSA), AWWA C651, OSHA 29 CFR 1926 Subpart P, OSHA 29 CFR 1910.147, and the operator's own valve book, locate-ticket and dechlorination procedures across eight distinct water and gas utility jobs\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Water and Gas Utility Crews — Distribution Authority — Capstone"
    }
  },
  {
    "id": "bw-side-aviation-maintenance-and-ground-opener",
    "title": "Aviation Maintenance and Ground — IAM/TWU Ramp and Line — First Shift",
    "giver": "the programme's training lead",
    "site": "Aviation Maintenance and Ground — IAM/TWU Ramp and Line",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "aviation-maintenance-and-ground",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Aviation Maintenance and Ground — IAM/TWU Ramp and Line",
        "text": "The training lead meets you at Aviation Maintenance and Ground — IAM/TWU Ramp and Line and points you to the first bench."
      },
      {
        "type": "station",
        "target": "av-marshalling-and-wingwalker-signals",
        "text": "Two wing-walkers and one marshaller share a single stop signal that beats every other instruction the moment it is raised, because neither wingtip is ever visible from the same set of eyes at the same time in a bay this tight."
      },
      {
        "type": "station",
        "target": "av-pushback-tug-and-towbar-connection",
        "text": "The steering bypass pin goes in before the tug ever takes a load, and the parking brake comes off and goes back on only on the flight deck's own word over the headset — never assumed, never guessed at from the tug's own seat."
      },
      {
        "type": "station",
        "target": "av-ground-power-and-static-bonding-before-fuel",
        "text": "The bonding cable is clamped to the aircraft before the nozzle ever touches it, because a fuel connection with no equalised path between the aircraft and the truck is a spark waiting on a vapour that only needs one."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight jobs an IAM or TWU ramp and line crew actually rotates through: an aircraft marshalled into a tight hangar bay on two wing-walkers and one shared stop signal, a pushback tug and towbar connected with the steering bypass pin seated before any load, ground power and static bonding proven before a drop of fuel moves, a hold built to the load plan with the hazmat bag segregated on its own, a de-icing pass run top-down and checked clean before the holdover clock starts, a jet raised on three jacks brought up together and locked, a borescope inspection tool-controlled end to end against a shadow board, and a lavatory and potable water service worked on two carts that never share a hose. Every station ends on a proof — a gauge, a confirmed count, a signed log — rather than on how the job looked going together.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Aviation Maintenance and Ground — IAM/TWU Ramp and Line — Opener"
    }
  },
  {
    "id": "bw-side-aviation-maintenance-and-ground-capstone",
    "title": "Aviation Maintenance and Ground — IAM/TWU Ramp and Line — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Aviation Maintenance and Ground — IAM/TWU Ramp and Line",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-aviation-maintenance-and-ground-opener",
    "programmeId": "aviation-maintenance-and-ground",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Aviation Maintenance and Ground — IAM/TWU Ramp and Line",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "av-hangar-jacking-and-stands",
        "text": "Three jacks come up together, never one ahead of the others, and the downlock pins go in the moment the gear is unloaded — not sometime after this crew is already working underneath a jet held up on hydraulics alone."
      },
      {
        "type": "station",
        "target": "av-borescope-and-tool-control-inventory",
        "text": "Every tool is counted against its own shadow-board outline before the engine is touched, and counted again before the job is signed off, because the only question tool control actually answers is whether everything that went out came back."
      },
      {
        "type": "station",
        "target": "av-lavatory-and-potable-water-separation",
        "text": "Two services, two completely separate carts, and the one rule that governs the whole job is that nothing from one system ever touches the other — not the hose, not the nozzle, not a hand that has not been re-gloved in between."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: IAM and TWU ramp and maintenance training; FAA 14 CFR Part 139 movement-area operations, Part 43 maintenance, Part 121 air carrier operations and Part 145 repair stations; NFPA 407 aircraft fuel servicing and NFPA 77 static electricity; OSHA 29 CFR 1910.132, 1910.147, 1910.178, 1910.1200 and 1910.23; ANSI/ISEA 107 high-visibility apparel across eight distinct ramp and line jobs\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Aviation Maintenance and Ground — IAM/TWU Ramp and Line — Capstone"
    }
  },
  {
    "id": "bw-side-warehouse-and-logistics-automation-opener",
    "title": "Warehouse and Logistics Automation — Teamsters Distribution Floor — First Shift",
    "giver": "the programme's training lead",
    "site": "Warehouse and Logistics Automation — Teamsters Distribution Floor",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "warehouse-and-logistics-automation",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Warehouse and Logistics Automation — Teamsters Distribution Floor",
        "text": "The training lead meets you at Warehouse and Logistics Automation — Teamsters Distribution Floor and points you to the first bench."
      },
      {
        "type": "station",
        "target": "tw-amr-traffic-zone-entry-and-lockout",
        "text": "Crossing into a live autonomous-mobile-robot floor means the map is read for what is already wrong with it, access is requested at the gate instead of stepped past, and the charging dock's power is isolated and locked before anyone touches it."
      },
      {
        "type": "station",
        "target": "tw-conveyor-jam-clearing-and-loto",
        "text": "A jammed carton only gets pulled free once the pull-cord is tried, the drive is isolated and locked at its own disconnect, and the residual motion is actually checked rather than assumed stopped."
      },
      {
        "type": "station",
        "target": "tw-high-bay-order-picker-fall-protection",
        "text": "The platform's own gate closes and the harness clips to the platform's own anchor before the platform ever leaves the ground, and the unclip waits until it is back down."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight jobs on a modern automated distribution floor: an AMR traffic zone entered and locked out the way the fleet's own controller expects it, a conveyor jam cleared behind a proven isolation, a high-bay order picker ridden with a harness clipped to its own anchor, a trailer proven restrained before a forklift ever crosses the leveler, a lift-truck battery changed in a bay whose eyewash and ventilation were actually confirmed, a robotic palletizer cell entered on a permit and proven at zero energy, a cold room worked with a buddy actually checked in, and a pick-to-light module run at a pace and a posture that hold up for a whole shift. Every station ends on a proof — a gauge, a locked-and-tagged isolation, a signed log — rather than on how routine the task felt going in.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Warehouse and Logistics Automation — Teamsters Distribution Floor — Opener"
    }
  },
  {
    "id": "bw-side-warehouse-and-logistics-automation-capstone",
    "title": "Warehouse and Logistics Automation — Teamsters Distribution Floor — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Warehouse and Logistics Automation — Teamsters Distribution Floor",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-warehouse-and-logistics-automation-opener",
    "programmeId": "warehouse-and-logistics-automation",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Warehouse and Logistics Automation — Teamsters Distribution Floor",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "tw-palletizer-cell-fenced-access-permit",
        "text": "Entering a robotic palletizer cell means the light curtain and gate interlock are confirmed honest, the arm's power is isolated and locked, and the residual energy is proven at zero before anyone is inside the fence."
      },
      {
        "type": "station",
        "target": "tw-cold-storage-ppe-and-rotation",
        "text": "A cold room gets entered with a buddy actually checked in, the ice and the propped door and the torn seal caught before they become a fall or a temperature excursion, and the rotation-marked pallet pulled by date rather than convenience."
      },
      {
        "type": "station",
        "target": "tw-pick-to-light-ergonomics-and-rotation",
        "text": "A pick-to-light module is worked with the display confirmed over the light alone, a heavy case brought to waist height on the lift-assist table, and the scheduled rotation actually taken instead of skipped for one more cycle."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: Teamsters (IBT) warehouse and logistics automation training, tested against OSHA 29 CFR 1910.147, 1910.178, 1910.212, 1910.132, 1910.1200, 1910.28 and 1910.36, 29 CFR 1926.602, ASME B20.1, ANSI R15.06 and ISO 10218 for robots, ASHRAE 15 and ANSI/IIAR 2 and 6 for refrigeration, and the Revised NIOSH Lifting Equation across eight distinct union jobs\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Warehouse and Logistics Automation — Teamsters Distribution Floor — Capstone"
    }
  },
  {
    "id": "bw-side-education-support-staff-opener",
    "title": "Education Support Staff — Custodial, Grounds, Transport and Classroom — First Shift",
    "giver": "the programme's training lead",
    "site": "Education Support Staff — Custodial, Grounds, Transport and Classroom",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "education-support-staff",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Education Support Staff — Custodial, Grounds, Transport and Classroom",
        "text": "The training lead meets you at Education Support Staff — Custodial, Grounds, Transport and Classroom and points you to the first bench."
      },
      {
        "type": "station",
        "target": "ed-custodial-chemical-dilution-and-floor-machine",
        "text": "A hallway chemical metered through the wall dispenser instead of eyeballed, a floor machine walked for defects before it's plugged in, and a pad never changed until the cord is out of the wall."
      },
      {
        "type": "station",
        "target": "ed-playground-equipment-inspection",
        "text": "The fence, the fall-zone surfacing and the climbing structure all checked close up before the gate opens, with a sprung S-hook closed by the tool rather than a thumb."
      },
      {
        "type": "station",
        "target": "ed-bus-pretrip-and-loading-zone",
        "text": "The pre-trip walkaround before the engine starts, the stop arm and crossing gate out together at the curb, and the mirrors checked again before the bus ever rolls away."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight jobs a school's classified staff actually rotate through: a custodial chemical metered through the wall dispenser instead of eyeballed and a floor machine walked for defects before it's plugged in, a playground walked and its climbing structure checked close up before the gate opens, a school bus pre-tripped and driven to a curb stop where the stop arm and crossing gate come out together, a crossing guard judging a real gap in traffic rather than guessing one, a paraeducator's two-person transfer run to the student's own plan, a science lab's chemical storage checked against its compatibility chart with the eyewash and drench shower proven together, a kitchen's delivery probed and its sanitizer tested to the strip rather than by eye, and a boiler room's air handler locked, tagged and proven dead before its filter panel ever comes off. Every station ends on a proof — a gauge, a test strip, a signed log — rather than on how routine the job looked going in.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Education Support Staff — Custodial, Grounds, Transport and Classroom — Opener"
    }
  },
  {
    "id": "bw-side-education-support-staff-capstone",
    "title": "Education Support Staff — Custodial, Grounds, Transport and Classroom — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Education Support Staff — Custodial, Grounds, Transport and Classroom",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-education-support-staff-opener",
    "programmeId": "education-support-staff",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Education Support Staff — Custodial, Grounds, Transport and Classroom",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "ed-science-lab-chemical-storage-and-eyewash",
        "text": "A storage cabinet checked against the compatibility chart, a corrosive decanted with the bottle carrier, and the eyewash and drench shower proven together."
      },
      {
        "type": "station",
        "target": "ed-kitchen-receiving-and-warewash-sanitizing",
        "text": "A delivery probed and inspected at the dock before it's accepted, the sanitizer tested to the strip rather than by eye, and dishes timed through their full contact time."
      },
      {
        "type": "station",
        "target": "ed-boiler-room-filter-change-lockout",
        "text": "The air handler locked, tagged and proven dead before the filter panel ever comes off, and a short observed restart watched steady before the ticket closes."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: AFT and CSEA training for classified school employees, tested against OSHA's hazard communication, PPE, control-of-hazardous-energy and bloodborne-pathogens standards, ANSI/ISEA Z358.1, FMCSA's school-bus inspection and driving rules, the MUTCD, the California Retail Food Code and NFPA 85 across eight distinct classified-staff jobs\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Education Support Staff — Custodial, Grounds, Transport and Classroom — Capstone"
    }
  },
  {
    "id": "bw-side-grounds-and-landscaping-opener",
    "title": "Grounds & Landscaping Crew — First Shift",
    "giver": "the programme's training lead",
    "site": "Grounds & Landscaping Crew",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "grounds-and-landscaping",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Grounds & Landscaping Crew",
        "text": "The training lead meets you at Grounds & Landscaping Crew and points you to the first bench."
      },
      {
        "type": "station",
        "target": "gk-ride-on-mower-pre-start-and-slope-work",
        "text": "The walk-around and the interlocks are confirmed before the seat is ever sat in, the bench is walked for the drop-off and the wet patch a wheel cannot see coming, and the slope is cut the way the machine's own operator's manual sets out."
      },
      {
        "type": "station",
        "target": "gk-string-trimmer-and-blower-ppe-and-bystander-zone",
        "text": "The guard and the trigger interlock are confirmed rather than assumed, the bystander zone is posted and barricaded before the engine starts, and the blower's discharge is kept off people, pets and the storm drain the whole time it runs."
      },
      {
        "type": "station",
        "target": "gk-irrigation-controller-valve-box-and-backflow-check",
        "text": "The panel is locked out before it is opened, a flooded valve box is walked rather than reached into, and the backflow assembly is tested hose to hose in the test procedure's own order rather than eyeballed."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Twelve jobs a grounds crew actually rotates through: a ride-on mower's own pre-start and slope work, a string trimmer and blower run inside a posted bystander zone, an irrigation controller and backflow assembly serviced and tested, a labelled pesticide mixed and applied per the label, a pole saw's drop zone controlled under a spotter's signal, a chainsaw started and limbed on the ground with the chain brake proven first, a bunker rebuilt around a graded drain line, a green mowed and its hole changed, a sports field striped and its goals anchored to the manufacturer's own spec, a storm-damaged shoulder cleared with a chipper behind a traffic taper, a paver patio built on a compacted, checked base, and a nursery's chemical storage kept segregated with its eyewash actually flow-tested. Every station ends on a proof — a gauge, a logged reading, a checked interlock — rather than on how safe the job looked going in.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Grounds & Landscaping Crew — Opener"
    }
  },
  {
    "id": "bw-side-grounds-and-landscaping-capstone",
    "title": "Grounds & Landscaping Crew — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Grounds & Landscaping Crew",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-grounds-and-landscaping-opener",
    "programmeId": "grounds-and-landscaping",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Grounds & Landscaping Crew",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "gk-storm-cleanup-chipper-and-traffic-control",
        "text": "The taper and the signs go up to the traffic-control plan before the shoulder is worked, and every branch is fed from behind the marked line with the chipper locked out before any jam is ever cleared by hand."
      },
      {
        "type": "station",
        "target": "gk-hardscape-paver-base-and-compaction",
        "text": "The utility locate is confirmed before the excavation starts, and the base is compacted to a density the gauge actually proves before a single paver goes down on top of it."
      },
      {
        "type": "station",
        "target": "gk-greenhouse-nursery-chemical-storage-and-eyewash",
        "text": "Incompatible chemicals are segregated rather than shelved together, the path to the eyewash stays clear, and the eyewash station itself is activated and flow-tested rather than assumed ready."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: LIUNA, SEIU and AFSCME grounds and landscaping crew training, tested against OSHA 29 CFR 1910 general industry standards, ANSI B71 and B175 outdoor power equipment and chainsaw specifications, ANSI Z133 arboricultural safety, the Federal Insecticide, Fungicide, and Rodenticide Act (FIFRA) pesticide label, the Manual on Uniform Traffic Control Devices (MUTCD) and CPSC movable soccer goal guidance across twelve distinct grounds, turf and landscaping jobs\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Grounds & Landscaping Crew — Capstone"
    }
  },
  {
    "id": "bw-side-wojrc-pathway-edition-opener",
    "title": "Pathway Edition — wojrc.org — First Shift",
    "giver": "the programme's training lead",
    "site": "Pathway Edition — wojrc.org",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "wojrc-pathway-edition",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Pathway Edition — wojrc.org",
        "text": "The training lead meets you at Pathway Edition — wojrc.org and points you to the first bench."
      },
      {
        "type": "station",
        "target": "wp-intake-and-pathway-planning",
        "text": "The pathway's first appointment: a coach helps an applicant choose warehouse or Commercial Class A from an honest self-assessment rather than a coin flip."
      },
      {
        "type": "station",
        "target": "wp-mock-interview-and-resume",
        "text": "Before any application goes in, a resume is built section by section and a mock interview is sat until the posture, the eye contact and the hardest question all hold steady."
      },
      {
        "type": "station",
        "target": "wp-employer-meet-and-greet",
        "text": "The job fair floor where the resume and the rehearsed pitch meet an actual employer table and the apprenticeship coordinator in person."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"The participant's own journey through the programmes wojrc.org describes, station by station: a coach helps you choose warehouse or Commercial Class A at intake, a resume and a mock interview get you ready to apply, a job fair puts you in front of the employers and the apprenticeship coordinator, a ride-along day and a permit study day try each track for real, an enrolment day signs the paperwork the programme's own requirements call for, a first paycheck is coached at the wellness resource centre, and a graduation day matches you with an alumni mentor. Those eight stations are followed by the job-readiness edition's own procedures, grouped here by the service they belong to — warehouse, Class A, apprenticeship, financial coaching and wellness — so the whole pathway reads as one line from a coach's first question to a signed mentor commitment. Only the sponsor's own words describe the organisation; everything else here is a procedure with its standard.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Pathway Edition — wojrc.org — Opener"
    }
  },
  {
    "id": "bw-side-wojrc-pathway-edition-capstone",
    "title": "Pathway Edition — wojrc.org — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Pathway Edition — wojrc.org",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-wojrc-pathway-edition-opener",
    "programmeId": "wojrc-pathway-edition",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Pathway Edition — wojrc.org",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "wellness-peer-support-conversation",
        "text": "Wellness: a cohort-mate who cannot keep doing this, met with the signs noticed first and a direct question asked plainly."
      },
      {
        "type": "station",
        "target": "wellness-substance-use-and-the-job",
        "text": "Wellness: four in the morning on the dock, the forklift key taken before the conversation and the doors named that do not cost the job."
      },
      {
        "type": "station",
        "target": "wellness-asking-for-help-and-resources",
        "text": "Wellness: the week your own life goes sideways, each problem matched to its door and the crisis line told apart from the case manager."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: Registered apprenticeship standards as a category, the OSHA Outreach Training Program's OSHA 10 course, FMCSA 49 CFR 380 Subpart F entry-level driver training with 49 CFR 383, 393 and 395, OSHA 29 CFR 1910.178 powered industrial trucks and ANSI/ITSDF B56.1, the Revised NIOSH Lifting Equation, HIPAA's Privacy Rule, CFPB and IRS consumer guidance, and SAMHSA's guidance on help-seeking — every credential and requirement stated only as the cited body publishes it, or as \"per the programme's requirements\" where this edition does not have a source for the organisation's own paperwork\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Pathway Edition — wojrc.org — Capstone"
    }
  },
  {
    "id": "bw-side-grocery-and-meatpacking-opener",
    "title": "Grocery and Meatpacking — UFCW Store and Plant Floor — First Shift",
    "giver": "the programme's training lead",
    "site": "Grocery and Meatpacking — UFCW Store and Plant Floor",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "grocery-and-meatpacking",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Grocery and Meatpacking — UFCW Store and Plant Floor",
        "text": "The training lead meets you at Grocery and Meatpacking — UFCW Store and Plant Floor and points you to the first bench."
      },
      {
        "type": "station",
        "target": "gr-meat-dept-band-saw-and-grinder-lockout",
        "text": "The band saw's own disconnect is proven dead with a tester before the guard ever comes off, and the grinder gets the same promise on its own cord before a hand goes anywhere near its hopper."
      },
      {
        "type": "station",
        "target": "gr-deli-slicer-sanitation-and-allergen-line",
        "text": "A declared-allergen changeover is proven with a swab reading, not a look, before the line's own placard is ever flipped back for the next order."
      },
      {
        "type": "station",
        "target": "gr-produce-receiving-cold-chain-and-pallet-jack",
        "text": "A produce delivery is culled and segregated at the dock before the accepted pallet is driven on the pallet jack to the walk-in without a single stop along the way."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight jobs a grocery and meatpacking crew actually rotates through: a meat department's band saw and grinder both locked out and guarded on their own between-use clean, a deli slicer's allergen changeover proven by an ATP swab rather than a look, a produce delivery culled and segregated at the dock before it is driven to the walk-in on a pallet jack, a night stocking shift's jammed baler and loaded compactor both locked out before a hand goes near either chamber, a front-end checkstand set to fit the cashier with the store's own robbery plan known cold, a meatpacking line's knife work run on a honed edge, ordered PPE and a rotation actually taken on schedule, an ammonia alarm at the cold plant answered by evacuating and mustering upwind rather than investigating, and a pharmacy and floral chemical handled against its own safety data sheet before it is stored, mixed or cleaned up. Every station ends on a proof — a swab, a gauge, a signed log — rather than on how routine the job looked going in.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Grocery and Meatpacking — UFCW Store and Plant Floor — Opener"
    }
  },
  {
    "id": "bw-side-grocery-and-meatpacking-capstone",
    "title": "Grocery and Meatpacking — UFCW Store and Plant Floor — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Grocery and Meatpacking — UFCW Store and Plant Floor",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-grocery-and-meatpacking-opener",
    "programmeId": "grocery-and-meatpacking",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Grocery and Meatpacking — UFCW Store and Plant Floor",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "gr-meatpacking-line-knife-work-and-ppe-rotation",
        "text": "The knife is honed and the cut-resistant PPE donned in order before the first cut, and the line's own rotation is taken on schedule instead of skipped for one more cycle."
      },
      {
        "type": "station",
        "target": "gr-ammonia-leak-alarm-response-cold-plant",
        "text": "The alarm sends everyone out and mustered upwind, with nobody going back into the machine room until the plant's own plan gives the all-clear."
      },
      {
        "type": "station",
        "target": "gr-pharmacy-floral-chemical-handling-and-sds",
        "text": "A chemical is checked against its own safety data sheet before it is stored, mixed to the label or cleaned up, with the eyewash proven clear the whole time."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: UFCW member training for retail food and meatpacking work, tested against OSHA 29 CFR 1910.147, 1910.212, 1910.138, 1910.132, 1910.133, 1910.1200, 1910.22, 1910.178, 1910.119 and 1910.38, ANSI/ISEA 105, ANSI/ITSDF B56.1, ANSI B11, ANSI/ISEA Z358.1, ASHRAE 15, ANSI/IIAR 2 and 6, the Revised NIOSH Lifting Equation, Cal/OSHA's workplace violence prevention plan (8 CCR 3342), the FDA Food Code, FDA 21 CFR 101, the California Retail Food Code, ServSafe, NFPA 101 and USDA's own inspection marks across eight distinct grocery and meatpacking jobs\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Grocery and Meatpacking — UFCW Store and Plant Floor — Capstone"
    }
  },
  {
    "id": "bw-side-airline-cabin-and-flight-crew-opener",
    "title": "Airline Cabin and Flight Crew — AFA-CWA and ALPA — First Shift",
    "giver": "the programme's training lead",
    "site": "Airline Cabin and Flight Crew — AFA-CWA and ALPA",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "airline-cabin-and-flight-crew",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Airline Cabin and Flight Crew — AFA-CWA and ALPA",
        "text": "The training lead meets you at Airline Cabin and Flight Crew — AFA-CWA and ALPA and points you to the first bench."
      },
      {
        "type": "station",
        "target": "ca-cabin-preflight-safety-check",
        "text": "Nothing about this door gets armed until the exits and the aisle are actually proven clear, and even then it only counts once the crew member across the aisle has cross-checked it — one person's own confirmation is never the whole story."
      },
      {
        "type": "station",
        "target": "ca-galley-and-cart-safety",
        "text": "A cart that isn't braked and latched between every push is a cart that moves on its own the instant the aircraft does, and the whole galley gets secured for descent the moment the sign says so, not whenever there's a free minute."
      },
      {
        "type": "station",
        "target": "ca-cabin-medical-event-response",
        "text": "Every clinical decision here belongs to the responding professional or to ground-based medical support, never to the crew member closest to the seat — the job is calling for help correctly, clearing space, and relaying exactly what's reported, nothing guessed at."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight jobs an AFA-CWA flight attendant or an ALPA pilot actually rotates through: a cabin pre-flight safety check with the doors armed and cross-checked, the galley and its cart secured against turbulence, a cabin medical event supported without a single clinical guess, an unruly passenger de-escalated with distance and the captain's own word on anything further, a decompression drill run mask-on-first, a door evacuation held on commands and a blocked frame, a flight-deck crew resource management briefing built on sterile discipline and closed-loop callouts, and an honest fatigue self-check before ever signing in. Every station ends on a proof — a cross-check confirmed, a gauge read, a callout actually acknowledged — rather than on how routine the job felt going in.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Airline Cabin and Flight Crew — AFA-CWA and ALPA — Opener"
    }
  },
  {
    "id": "bw-side-airline-cabin-and-flight-crew-capstone",
    "title": "Airline Cabin and Flight Crew — AFA-CWA and ALPA — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Airline Cabin and Flight Crew — AFA-CWA and ALPA",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-airline-cabin-and-flight-crew-opener",
    "programmeId": "airline-cabin-and-flight-crew",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Airline Cabin and Flight Crew — AFA-CWA and ALPA",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "ca-door-evacuation-drill",
        "text": "The slide gets confirmed before anyone is sent onto it, the same three commands never stop, and the door frame stays physically blocked so the flow through it never breaks for a dropped bag or a passenger frozen at the sill."
      },
      {
        "type": "station",
        "target": "ca-flight-deck-crew-resource-management",
        "text": "A callout that lands on silence hasn't actually been heard — the sterile phase, the challenge-and-response checklist and the closed-loop acknowledgment all exist so nothing in this flight deck is ever just one pilot's own assumption."
      },
      {
        "type": "station",
        "target": "ca-fatigue-and-duty-time-self-check",
        "text": "The no-fault fatigue line only works if it's actually used the moment the honest self-assessment calls for it — no schedule pressure, and no hour or duty limit this platform states, gets to override that honest answer."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: AFA-CWA cabin-safety training and ALPA member professional-standards training; FAA 14 CFR Part 121 air carrier operations; OSHA 29 CFR 1910.151 medical services and first aid and 29 CFR 1910.1030 bloodborne pathogens; Cal/OSHA's workplace violence prevention standard, 8 CCR 3342, across eight distinct flight attendant and pilot jobs\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Airline Cabin and Flight Crew — AFA-CWA and ALPA — Capstone"
    }
  },
  {
    "id": "bw-side-mill-and-mine-opener",
    "title": "Mill and Mine — First Shift",
    "giver": "the programme's training lead",
    "site": "Mill and Mine",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "mill-and-mine",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Mill and Mine",
        "text": "The training lead meets you at Mill and Mine and points you to the first bench."
      },
      {
        "type": "station",
        "target": "mm-hot-strip-mill-stand",
        "text": "The mill's opener: a roll change locked out on the drive and the screwdown both, zero speed proven, and the crane's own path called clear before the old rolls ever come out."
      },
      {
        "type": "station",
        "target": "mm-ladle-pour",
        "text": "PPE on before the ladle is ever approached, the splash barrier closed before the tilt starts, and every addition going in dry and through the chute, never by hand."
      },
      {
        "type": "station",
        "target": "mm-coke-oven-heat-rotation",
        "text": "A battery topside worked to the plan's own heat-stress rotation, with the buddy system kept and every cooldown taken in full rather than cut short to get back to work."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Four mill stations and four mine stations under one steelworkers-and-miners pack: a hot-strip stand's roll change, a ladle tilted to pour, a coke battery's heat rotation, a paper machine's felt change; then a continuous miner's cut-and-bolt cycle, an escapeway and self-rescuer drill, a haul truck's berm and dump point, and a belt entry's fire and gas exam.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Mill and Mine — Opener"
    }
  },
  {
    "id": "bw-side-mill-and-mine-capstone",
    "title": "Mill and Mine — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Mill and Mine",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-mill-and-mine-opener",
    "programmeId": "mill-and-mine",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Mill and Mine",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "mm-mine-escapeway-drill",
        "text": "The self-rescuer donned complete before a step is taken, the alternate escapeway taken the moment the primary is found blocked, and the lifeline's own cones read by feel rather than guessed at."
      },
      {
        "type": "station",
        "target": "mm-haul-truck-berm",
        "text": "The berm read against the truck's own axle before backing toward it, the spotter's signal taken before the edge, and the highwall above the dump point given the respect an unstable rock face is owed."
      },
      {
        "type": "station",
        "target": "mm-conveyor-fire-and-gas-monitoring",
        "text": "A belt entry's own exam: a stuck roller freed under lockout before it grinds a fire into the dust beside it, and the CO and methane monitors read and trusted rather than covered or guessed at."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: USW Tony Mazzocchi Center health and safety training; UMWA health and safety training; OSHA 29 CFR 1910.147 control of hazardous energy for the mill stations; the mine safety regulations, named generically, and each mine's own roof-control, ventilation and emergency plans for the mine stations\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Mill and Mine — Capstone"
    }
  },
  {
    "id": "bw-side-screen-and-media-crafts-opener",
    "title": "Screen & Media Crafts — First Shift",
    "giver": "the programme's training lead",
    "site": "Screen & Media Crafts",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "screen-and-media-crafts",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Screen & Media Crafts",
        "text": "The training lead meets you at Screen & Media Crafts and points you to the first bench."
      },
      {
        "type": "station",
        "target": "md-set-safety-meeting-and-stunt-go-no-go",
        "text": "The go/no-go board is walked and the regulator proven before the rig is ever armed, the fall zone is swept for a frayed line and a soft pad, and a late walk-on into the zone is held off the AD's channel rather than the button already in hand."
      },
      {
        "type": "station",
        "target": "md-camera-dolly-and-crane-track",
        "text": "The track is swept for an unpinned joint before it carries a shot, the jib arm is balanced on its sled before the swivel ever locks, and a crossing cart is answered off the radio rather than the clamp already being held."
      },
      {
        "type": "station",
        "target": "md-location-shoot-traffic-control-and-heat-hydration",
        "text": "The block is swept for a car nobody moved and a blocked curb ramp, the cooler is proven full before any heat break is called, and a resident's car is turned back on the paddle a driver can actually read."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight jobs a screen and media production actually rotates through: a film set safety meeting and the stunt and SFX go/no-go before a rigged effect, a grip crew's dolly track and counterweighted jib crane, a location shoot's traffic control and the crew's heat and hydration break, a sound stage's electrical distribution and cable crossings, a recording studio's hearing conservation and a piano's load-in, a theatre's fly floor and quick-change lane run from the same calling desk, a news crew's live truck mast raised at a flooded storm scene, and a closed-set briefing run beside the intimacy coordinator. Every station ends on a proof — a gauge proven, a checklist cleared, a radio call answered — rather than on how routine the call sheet made the day look.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Screen & Media Crafts — Opener"
    }
  },
  {
    "id": "bw-side-screen-and-media-crafts-capstone",
    "title": "Screen & Media Crafts — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Screen & Media Crafts",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-screen-and-media-crafts-opener",
    "programmeId": "screen-and-media-crafts",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Screen & Media Crafts",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "md-theatre-fly-floor-and-quick-change-lane",
        "text": "The quick-rig costume is dressed in the order its own snaps demand, the fly system's brake tension is proven before a batten flies over a live crossover, and a wrong-batten start is called off on the headset rather than let run."
      },
      {
        "type": "station",
        "target": "md-newsroom-storm-scene-and-live-truck-mast",
        "text": "The ground rod is driven before a single mast control is touched, the mast's clearance from the power line is watched the whole way up rather than assumed, and a gust closing that clearance is answered on the emergency stow switch."
      },
      {
        "type": "station",
        "target": "md-intimacy-and-conduct-coordination-briefing",
        "text": "The scene is flagged and the set closed to its list before anyone rolls, consent is confirmed in writing and in private before the coordinator calls ready, and a stop signal from a performer holds the whole set at once."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: SAG-AFTRA, AFM, Actors' Equity Association and NewsGuild-CWA member safety guidance; IATSE grip, electrical, fly and stagehand practice; OSHA 29 CFR 1910.95 hearing conservation, 29 CFR 1910.132 general PPE, 29 CFR 1910.147 lockout/tagout and 29 CFR 1926.501 fall protection; NFPA 101 Life Safety Code; FCC RF exposure limits for a live truck's mast; ANSI/ASSP Z359 and ANSI E1.4 rigging standards; ANSI/ISEA 107 high-visibility apparel, and the production's own conduct policy for a closed set, across eight distinct screen and media crafts jobs\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Screen & Media Crafts — Capstone"
    }
  },
  {
    "id": "bw-side-postal-and-mail-processing-opener",
    "title": "Postal & Mail Processing Crew — First Shift",
    "giver": "the programme's training lead",
    "site": "Postal & Mail Processing Crew",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "postal-and-mail-processing",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Postal & Mail Processing Crew",
        "text": "The training lead meets you at Postal & Mail Processing Crew and points you to the first bench."
      },
      {
        "type": "station",
        "target": "ml-delivery-van-pretrip-and-route-loading",
        "text": "A right-hand-drive delivery van pre-tripped and loaded in route order, with the load bay read for a blocked door and an unsecured tray before either becomes a problem on the first hard turn."
      },
      {
        "type": "station",
        "target": "ml-dog-and-hazard-awareness-on-route",
        "text": "A loose dog and a propped gate read from the sidewalk rather than discovered at the fence line, and the non-threatening retreat worked stop-turn-back with the satchel as a barrier."
      },
      {
        "type": "station",
        "target": "ml-heat-and-cold-stress-on-route",
        "text": "One shift's cold start and heat stretch both worked to the plan — a frozen mail slot worked open rather than forced, and a mandatory shade break actually held rather than cut short."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight jobs across a route, a processing plant and a retail counter: a right-hand-drive delivery van pre-tripped and loaded in route order, a residential block walked with a loose dog and a heaved sidewalk read before either becomes a problem, one shift's cold start and heat stretch both worked to the plan, a flat sorter's interlocked guard and sweep arm isolated and locked before a jam is ever cleared, a mail handler's forklift inspected and a container dock read for a pedestrian and an unchocked trailer, and a parcel sorter's divert gate cleared with a defeated light curtain and a coworker's own wrap-point risk caught first, and a suspicious parcel on the culling belt left untouched while the floor is cleared on the facility's plan, and an escalating customer at the retail window met with distance and a calm script. Every station ends on a proof — a gauge, a logged reading, a proven interlock — rather than on how routine the job looked going in.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Postal & Mail Processing Crew — Opener"
    }
  },
  {
    "id": "bw-side-postal-and-mail-processing-capstone",
    "title": "Postal & Mail Processing Crew — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Postal & Mail Processing Crew",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-postal-and-mail-processing-opener",
    "programmeId": "postal-and-mail-processing",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Postal & Mail Processing Crew",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "ml-parcel-sorter-conveyor-jam-and-loto",
        "text": "A defeated light curtain, a cardboard guard patch and a coworker's own loose drawstring all caught before any of them becomes the reason a hand meets a moving belt."
      },
      {
        "type": "station",
        "target": "ml-suspicious-package-protocol",
        "text": "A parcel that doesn't look right left exactly where it lies, the belt stopped and the floor cleared at a walking pace, and the zone held on the facility's plan until responders give the all clear, whatever the dispatch clock says."
      },
      {
        "type": "station",
        "target": "ml-retail-counter-deescalation",
        "text": "The clerk's own way off the counter cleared before opening, an escalating customer met with distance and a low, calm script, and the supervisor and the facility's workplace-violence plan brought in the moment the script stops working."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: NALC, APWU and NPMHU training for letter carriers, postal workers and mail handlers, tested against OSHA 29 CFR 1910.147 the control of hazardous energy, 29 CFR 1910.212 machine guarding, 29 CFR 1910.178 powered industrial trucks and 29 CFR 1910.132 personal protective equipment; ASME B20.1 for conveyors and related equipment; the Revised NIOSH Lifting Equation and NIOSH's own guidance on animal, heat and cold stress hazards for workers on foot; FMCSA 49 CFR 392 and 396 for the route's own delivery vehicle; and Cal/OSHA's Injury and Illness Prevention Program, 8 CCR 3203, as the model for a written plant safety programme, and OSHA 29 CFR 1910.38 emergency action plans for a suspicious parcel on the belt, and 8 CCR 3342 as the model for a written workplace-violence plan at the retail counter, across eight distinct jobs a letter carrier, a mail handler, a plant clerk and a retail clerk actually rotate through\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Postal & Mail Processing Crew — Capstone"
    }
  },
  {
    "id": "bw-side-yacht-and-charter-crew-opener",
    "title": "Yacht & Charter Crew — First Shift",
    "giver": "the programme's training lead",
    "site": "Yacht & Charter Crew",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "yacht-and-charter-crew",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Yacht & Charter Crew",
        "text": "The training lead meets you at Yacht & Charter Crew and points you to the first bench."
      },
      {
        "type": "station",
        "target": "yc-pre-departure-safety-briefing-and-guest-count",
        "text": "Every head counted against the manifest with the gangway chained through a late arrival, the life jacket shown on a person from the locker the guests will use, and the standing orders read back to the captain before a line moves."
      },
      {
        "type": "station",
        "target": "yc-line-handling-and-docking-in-crosswind",
        "text": "Coming alongside with the wind on the beam: the spring passed first from outside the bight, the stern line hitched and tended through a wake, and the gap called steadily to a captain who cannot see it."
      },
      {
        "type": "station",
        "target": "yc-fuel-dock-transfer-and-spill-kit",
        "text": "The declaration signed and the boom staged down-current before the nozzle moves, the vent watched with a hand on the trigger, and the pump killed at its stop the moment the vent spits."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight jobs on a mid-size motor yacht at her marina berth and under way on the estuary: the charter briefing with every head counted against the manifest, coming alongside on the spring in a crosswind, the fuel transfer declared and boomed before the nozzle moves, the engine room sniffed and blown before the key, the person-overboard drill with the ring thrown first and the propellers stopped before the platform, the galley fire with the fuel off before the blanket, the tender lowered steady and every guest across with two hands free, and shore power connected boat end first with a tingle in the water treated as an emergency. No fuel quantity, wind speed, weight or voltage is ever stated — those live in the vessel's plans, the captain's standing orders and the tender's plate.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Yacht & Charter Crew — Opener"
    }
  },
  {
    "id": "bw-side-yacht-and-charter-crew-capstone",
    "title": "Yacht & Charter Crew — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Yacht & Charter Crew",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-yacht-and-charter-crew-opener",
    "programmeId": "yacht-and-charter-crew",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Yacht & Charter Crew",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "yc-galley-fire-and-fixed-system",
        "text": "The galley fuel shut before the blanket, the extinguisher swept at the base, the fixed system pulled with the door shut, and the hatch cracked to the plan rather than thrown wide on a pan that may reflash."
      },
      {
        "type": "station",
        "target": "yc-tender-launch-and-guest-transfer",
        "text": "The tender walked for the missing plug in her chocks, lowered steady on the davit with a tag line for the swing, loaded to the plate and no further, and every guest across with bags passed first and two hands free."
      },
      {
        "type": "station",
        "target": "yc-shore-power-connection-and-in-water-electrical-safety",
        "text": "Breaker off before the cord moves, boat end locked before the dock end goes in, the polarity and leakage watched at the panel, nobody in the water at the berth, and a reported tingle treated as the emergency it is."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: IBU and SIU deck training and MEBA engineering practice for charter yacht crew, tested against USCG 33 CFR 83 Inland Navigation Rules, 33 CFR 155 and 33 CFR 156.150 for the fuel transfer, 46 CFR 25 and 46 CFR 199 for lifesaving and fire-fighting equipment as the vessel's certificate applies them, NFPA 306 for gas hazards below decks, NFPA 70E for the shore-power connection, OSHA 29 CFR 1910.147 the control of hazardous energy, 29 CFR 1910.95 occupational noise exposure, 29 CFR 1910.157 portable fire extinguishers and 29 CFR 1910.132 personal protective equipment, and IMO STCW basic safety training, across eight jobs a deckhand, mate, engineer and steward actually rotate through on a mid-size motor yacht\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Yacht & Charter Crew — Capstone"
    }
  },
  {
    "id": "bw-side-marine-ecology-and-restoration-opener",
    "title": "Marine Ecology & Restoration — Survey and Restoration Crews — First Shift",
    "giver": "the programme's training lead",
    "site": "Marine Ecology & Restoration — Survey and Restoration Crews",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "marine-ecology-and-restoration",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Marine Ecology & Restoration — Survey and Restoration Crews",
        "text": "The training lead meets you at Marine Ecology & Restoration — Survey and Restoration Crews and points you to the first bench."
      },
      {
        "type": "station",
        "target": "me-kelp-transect-survey-and-photo-quadrats",
        "text": "The fixed transect as the unit of monitoring: the same pins, bearing, frame and camera settings every season, swum at a pace that does not tear the canopy it counts."
      },
      {
        "type": "station",
        "target": "me-oyster-reef-monitoring-and-settlement-tiles",
        "text": "A tile's identity and wetness kept from the rack to the lab, and the fresh rack set back on the same footing at the same mark before the flood."
      },
      {
        "type": "station",
        "target": "me-eelgrass-seed-collection-and-nursery",
        "text": "Collecting to a permit's share and keeping what was cut alive: shoots cut above the sheath, bags wet and cool, hung by their labels in a tank that never stops flowing."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight field methods a marine ecology and restoration crew runs on any survey or planting day: a kelp transect and its photo quadrats, a settlement-tile swap on a shellfish reef, seed collection and a flow-through nursery, water column sampling from a small boat, a hand-crew day opening a marsh channel, a fish visual census, a shoreline debris and microplastics survey, and the reporting method for a sighting that does not match the card. Every station teaches how a measurement is made repeatable and how a crew stays safe making it; none asserts a fact about any bay, species, count or date.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Marine Ecology & Restoration — Survey and Restoration Crews — Opener"
    }
  },
  {
    "id": "bw-side-marine-ecology-and-restoration-capstone",
    "title": "Marine Ecology & Restoration — Survey and Restoration Crews — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Marine Ecology & Restoration — Survey and Restoration Crews",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-marine-ecology-and-restoration-opener",
    "programmeId": "marine-ecology-and-restoration",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Marine Ecology & Restoration — Survey and Restoration Crews",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "me-fish-visual-census-and-data-sheet",
        "text": "A count that means the same thing every season: one corridor, one pace, classes against a bar, counting only what crosses ahead, and the sheet written on the bottom."
      },
      {
        "type": "station",
        "target": "me-shoreline-debris-and-microplastics-survey",
        "text": "A beach tallied before it is changed and a sand sample kept honest in the wind, with sharps to the kit by tongs and unknowns flagged for the call."
      },
      {
        "type": "station",
        "target": "me-invasive-species-identification-and-reporting",
        "text": "How a sighting becomes a record: photographed to protocol, positioned, sampled only as permitted and reported to the named body before anything is touched or said."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: Programme completion record; the field methods it rehearses answer to the permit and consultation conditions their own bodies set — BCDC, the Regional Water Quality Control Board's Section 401 certification, the Section 404 permit, USFWS and NOAA Fisheries consultation, CDFW oversight of collecting and handling — and, for the two diving stations, OSHA 29 CFR 1910.424 practice under the programme's own diving safety manual. No depth, gas or current limit is stated anywhere in the pack; those live in the dive plan\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Marine Ecology & Restoration — Survey and Restoration Crews — Capstone"
    }
  },
  {
    "id": "bw-side-commercial-diving-and-scientific-scuba-opener",
    "title": "Commercial Diving & Scientific Scuba — First Shift",
    "giver": "the programme's training lead",
    "site": "Commercial Diving & Scientific Scuba",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "commercial-diving-and-scientific-scuba",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Commercial Diving & Scientific Scuba",
        "text": "The training lead meets you at Commercial Diving & Scientific Scuba and points you to the first bench."
      },
      {
        "type": "station",
        "target": "cd-underwater-wet-welding-and-cutting",
        "text": "The switch that makes the diver's rod live is on deck, so the tender learns to close it on the spoken call and nothing else, with the ground on the work and the leads walked before anyone breathes through a helmet."
      },
      {
        "type": "station",
        "target": "cd-pier-piling-inspection-and-wrap-repair",
        "text": "A pile is read by hand before the camera and the gauge, its findings said to the surface log as they are found, and a wrap fitted to the owner's form rather than to how it looks in green water."
      },
      {
        "type": "station",
        "target": "cd-rov-launch-recovery-and-tether-management",
        "text": "A vehicle on a dive site is tended like a diver — the tether flaked, paid out in step and braked on a snag — and it never crosses to the diver's side of the boat without the supervisor's word."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight jobs of the commercial dive crew and the scientific scuba pair, weighted to the surface side that keeps the diver alive: the welding tender at the knife switch, the diver reading a pile by hand and fitting its wrap, the ROV tender's tether, the chamber attendant and the post-dive watch, the scientific pair's buddy check and lost-buddy drill, a night search on a guideline, an intake locked out before a hydraulic tool goes down, and the paper that closes the day honestly. No depth, gas, decompression or time figure is ever stated; those live in the dive plan and the tables the supervisor holds.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Commercial Diving & Scientific Scuba — Opener"
    }
  },
  {
    "id": "bw-side-commercial-diving-and-scientific-scuba-capstone",
    "title": "Commercial Diving & Scientific Scuba — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Commercial Diving & Scientific Scuba",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-commercial-diving-and-scientific-scuba-opener",
    "programmeId": "commercial-diving-and-scientific-scuba",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Commercial Diving & Scientific Scuba",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "cd-low-visibility-and-night-dive-line-work",
        "text": "In black water the guideline is the way home and the light is the voice, so tie-offs go on in order, a hand stays on the line through a silt-out, and a failed primary light is the abort the plan already wrote."
      },
      {
        "type": "station",
        "target": "cd-hydraulic-tools-and-suction-hazards-underwater",
        "text": "Nothing goes near an intake grate until the pump is locked, tried and proven slack by a streamer, and the lock stays on against the plant until the supervisor has counted every diver out of the water."
      },
      {
        "type": "station",
        "target": "cd-dive-records-and-incident-review",
        "text": "The record is written from the slate and never from memory, released whole or not at all, and the debrief names a condition as the cause so the corrective action changes the procedure and not the diver."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: Programme completion record; the dive credentials it rehearses are issued only by their own bodies — OSHA 29 CFR 1910 Subpart T commercial diving operations (29 CFR 1910.421 through 1910.425, 1910.430 and 1910.440), the ADCI consensus standards, AWS D3.6 for the wet weld, USCG 46 CFR 197 Subpart B from a vessel, 29 CFR 1910.424 and the programme's diving safety manual for the scientific scuba; every depth, gas, decompression, current and time limit lives in the dive plan and the tables the supervisor holds\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Commercial Diving & Scientific Scuba — Capstone"
    }
  },
  {
    "id": "bw-side-aerospace-defense-and-robotics-opener",
    "title": "Aerospace Depot and Robotics — IAM and UAW Skilled Trades — First Shift",
    "giver": "the programme's training lead",
    "site": "Aerospace Depot and Robotics — IAM and UAW Skilled Trades",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "aerospace-defense-and-robotics",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Aerospace Depot and Robotics — IAM and UAW Skilled Trades",
        "text": "The training lead meets you at Aerospace Depot and Robotics — IAM and UAW Skilled Trades and points you to the first bench."
      },
      {
        "type": "station",
        "target": "ad-cleanroom-gowning-and-esd-discipline",
        "text": "A cleanroom entry only reaches the bench once the gowning order is followed and the wrist strap and heel straps pass at the tester, and the part never leaves its shielding except over the grounded mat."
      },
      {
        "type": "station",
        "target": "ad-payload-crane-lift-with-a-lift-plan",
        "text": "A sensitive payload only leaves its stand after the lift plan is briefed, the rigging inspected, one signal person named and a trial lift made a hand's width off the support."
      },
      {
        "type": "station",
        "target": "ad-hazardous-fluid-servicing-with-a-buddy",
        "text": "A servicing transfer only starts once the safety data sheet is read, the PPE it names is buddy-checked and the eyewash is proven, and a weeping fitting is answered at the shut-off."
      },
      {
        "type": "talk",
        "target": "training-lead",
        "text": "\"Eight civilian-style workplace-safety jobs in a generic aerospace depot and a robotics factory and training centre: a cleanroom entered in the posted gowning order with the strap test proven, a payload moved by overhead crane on a briefed lift plan, a hazardous fluid serviced from its safety data sheet with a buddy in place, a depot bay released only on a complete tool count and a FOD walk, a test stand's exclusion zone swept and held, a robot cell locked out and re-entered with a personal lock, an AMR floor worked on its traffic plan with an e-stop drill, and a cobot bench released only when every control on its risk assessment was tested with a body. Every station also runs with a declared fault (`?fault=`) that changes one step's right answer. Civilian-style workplace safety only; no real site, programme or vehicle is named.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Aerospace Depot and Robotics — IAM and UAW Skilled Trades — Opener"
    }
  },
  {
    "id": "bw-side-aerospace-defense-and-robotics-capstone",
    "title": "Aerospace Depot and Robotics — IAM and UAW Skilled Trades — Capstone",
    "giver": "the programme's certifying evaluator",
    "site": "Aerospace Depot and Robotics — IAM and UAW Skilled Trades",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-aerospace-defense-and-robotics-opener",
    "programmeId": "aerospace-defense-and-robotics",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Aerospace Depot and Robotics — IAM and UAW Skilled Trades",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "ad-robot-cell-lockout-and-safe-reentry",
        "text": "A robot cell is only entered once it is stopped, isolated under a personal lock, tried and proven at zero energy, with any jog made in reduced speed."
      },
      {
        "type": "station",
        "target": "ad-amr-fleet-traffic-and-estop-drill",
        "text": "An AMR floor is crossed only at the marked points, the e-stop drill proves every unit stops, and a faulted robot is taken out of the fleet before anyone touches it."
      },
      {
        "type": "station",
        "target": "ad-cobot-risk-assessment-and-speed-separation",
        "text": "A cobot bench is only released once its risk assessment is walked against the bench as built and the scanner zones are proven by a person walking into them."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: IAM aerospace and depot maintenance training and UAW skilled-trades training as bodies, tested against OSHA 29 CFR 1910.147, 1910.212, 1910.132, 1910.1200 and 1910.95, FAA 14 CFR 43 and 145 as the civil maintenance frame, ASME B30.2 and B30.16 for overhead cranes, NFPA 77 for static electricity, ANSI Z358.1 for eyewash, and ANSI R15.06 and ISO 10218 for industrial and collaborative robots, across eight civilian-style workplace-safety jobs\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Aerospace Depot and Robotics — IAM and UAW Skilled Trades — Capstone"
    }
  },
  {
    "id": "bw-side-teamwork-opener",
    "title": "Teamwork — Talk Before You Move",
    "giver": "the college's team captain",
    "site": "Fruitvale Community College",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "track": "teamwork",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Fruitvale Community College",
        "text": "The captain meets you on the college gym floor, a ball under one arm, and says the first drill has no shooting in it at all."
      },
      {
        "type": "station",
        "target": "bb-pick-and-roll-communication",
        "text": "Two defenders meet one screen, and whether they switch, stay or collide comes down to a word said early enough to be heard, answered, and only then acted on."
      },
      {
        "type": "station",
        "target": "bb-help-defense-rotations",
        "text": "Everybody gets beaten sometimes, so the helper steps in and says so, the next teammate rotates to the helper's man and the beaten defender trusts it and recovers to whoever is left."
      },
      {
        "type": "station",
        "target": "bb-transition-spacing-and-roles",
        "text": "A fast break is five players with five jobs, so the lanes are filled wide, the roles are held, the extra pass beats the hero shot and the finish stops inside a clear run-off."
      },
      {
        "type": "talk",
        "target": "team-captain",
        "text": "\"Every one of those was about a word said early. That is the whole of teamwork, most days.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Teamwork — Opener"
    }
  },
  {
    "id": "bw-side-teamwork-capstone",
    "title": "Teamwork — Steady the Crew",
    "giver": "the college's workforce instructor",
    "site": "Fruitvale Community College",
    "kind": "side",
    "tier": 2,
    "requires": "bw-side-teamwork-opener",
    "track": "teamwork",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Fruitvale Community College",
        "text": "Across the quad from the gym, the workforce instructor has a crew scenario waiting: the same habits, off the court and on the job."
      },
      {
        "type": "station",
        "target": "bb-timeout-huddle-and-adjustment",
        "text": "A captain gets thirty seconds of a timeout while the team is losing, and one fact, one change and one encouragement, with water in hand and nobody blamed, is all that fits."
      },
      {
        "type": "station",
        "target": "ei-conflict-on-the-crew",
        "text": "Two crew members clash beside live traffic, and the lead notices it, names it, slows it down behind the barrier and gets both of them to a fix they will actually work under."
      },
      {
        "type": "station",
        "target": "ei-giving-and-taking-feedback",
        "text": "Feedback that names the behaviour rather than the person is only half the skill; the other half is hearing, in the same conversation, that your own instruction was the gap and taking it without defending."
      },
      {
        "type": "station",
        "target": "ei-leading-under-pressure",
        "text": "When the schedule slips and the crew is tired, a lead keeps them steady with a calm voice, one clear next step and no safety step traded for time, then hands the credit to the crew by name."
      },
      {
        "type": "talk",
        "target": "workforce-instructor",
        "text": "\"One fact, one change, one encouragement. It works in a huddle and it works beside a trench.\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Teamwork — Capstone"
    }
  }
];

export const EGG_QUESTS = [
  {
    "id": "bw-egg-pretrip-report",
    "title": "Field Note — Port of Oakland",
    "giver": "found, not given",
    "site": "Port of Oakland",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Port of Oakland",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "tdl-pretrip-inspection",
      "stepId": "last-dvir"
    },
    "lesson": "Under 49 CFR 396 the last driver's report is the first thing a driver reads, because it says what somebody else found wrong with this truck.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Port of Oakland",
        "text": "Walk to Port of Oakland and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-pretrip-report",
        "text": "Tucked near the sign at Port of Oakland, a field note reads: \"Under 49 CFR 396 the last driver's report is the first thing a driver reads, because it says what somebody else found wrong with this truck.\""
      }
    ]
  },
  {
    "id": "bw-egg-airbrake-chock",
    "title": "Field Note — Middle Harbor Shoreline Park",
    "giver": "found, not given",
    "site": "Middle Harbor Shoreline Park",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Middle Harbor Shoreline Park",
    "method": "radio",
    "cites": {
      "app": "smartcity",
      "stationId": "tdl-air-brake-test",
      "stepId": "chock"
    },
    "lesson": "The chock is what lets the brakes be released safely, and it goes in before any valve is touched.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "talk",
        "target": "maintenance-radio",
        "text": "A yard voice comes over the channel: \"Before you crack a single valve on that trailer — what goes under the wheel first, and why?\""
      },
      {
        "type": "find",
        "target": "bw-egg-airbrake-chock",
        "text": "The radio crackles once more and gives up the note: \"The chock is what lets the brakes be released safely, and it goes in before any valve is touched.\""
      }
    ]
  },
  {
    "id": "bw-egg-hazmat-bung",
    "title": "Field Note — Brooklyn Basin",
    "giver": "found, not given",
    "site": "Brooklyn Basin",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Brooklyn Basin",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "tdl-hazmat-labeling-and-segregation",
      "stepId": "bung"
    },
    "lesson": "A drum that is closed hand-tight at the filler loosens with vibration and temperature, and a corrosive that weeps from a bung on a moving trailer eats through pallets, straps and the next package.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Brooklyn Basin",
        "text": "Walk to Brooklyn Basin and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-hazmat-bung",
        "text": "Tucked near the sign at Brooklyn Basin, a field note reads: \"A drum that is closed hand-tight at the filler loosens with vibration and temperature, and a corrosive that weeps from a bung on a moving trailer eats through pallets, straps and the next package.\""
      }
    ]
  },
  {
    "id": "bw-egg-cargo-winch",
    "title": "Field Note — Union Point Park",
    "giver": "found, not given",
    "site": "Union Point Park",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Union Point Park",
    "method": "radio",
    "cites": {
      "app": "smartcity",
      "stationId": "tdl-cargo-securement-and-hours",
      "stepId": "winch"
    },
    "lesson": "A strap does its job only when it is tight enough that the crate cannot move under it, and the winch is how that tension is set and held.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "talk",
        "target": "maintenance-radio",
        "text": "Dispatch breaks in: \"Load's chocked, straps are on — so why isn't it secured yet?\""
      },
      {
        "type": "find",
        "target": "bw-egg-cargo-winch",
        "text": "The radio crackles once more and gives up the note: \"A strap does its job only when it is tight enough that the crate cannot move under it, and the winch is how that tension is set and held.\""
      }
    ]
  },
  {
    "id": "bw-egg-forklift-belt",
    "title": "Field Note — Jack London Square",
    "giver": "found, not given",
    "site": "Jack London Square",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Jack London Square",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "forklift-dock",
      "stepId": "belt"
    },
    "lesson": "In a tip-over the overhead guard protects a belted operator. An unbelted one jumps, and the guard lands on them — the single biggest killer of forklift operators.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Jack London Square",
        "text": "Walk to Jack London Square and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-forklift-belt",
        "text": "Tucked near the sign at Jack London Square, a field note reads: \"In a tip-over the overhead guard protects a belted operator. An unbelted one jumps, and the guard lands on them — the single biggest killer of forklift operators.\""
      }
    ]
  },
  {
    "id": "bw-egg-grade-snub",
    "title": "Field Note — Skyline Lookout",
    "giver": "found, not given",
    "site": "Skyline Lookout",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Skyline Lookout",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "drive-mountain-grade-and-engine-brake",
      "stepId": "drm-snub"
    },
    "lesson": "The state CDL handbook's snub braking is firm, short applications: once the rig reaches its safe speed, brake hard enough to feel a definite slowdown until it is about five mph below that speed, then release and let it build again.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Skyline Lookout",
        "text": "Walk to Skyline Lookout and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-grade-snub",
        "text": "Tucked near the sign at Skyline Lookout, a field note reads: \"The state CDL handbook's snub braking is firm, short applications: once the rig reaches its safe speed, brake hard enough to feel a definite slowdown until it is about five mph below that speed, then release and let it build again.\""
      }
    ]
  },
  {
    "id": "bw-egg-orientation-tieoff",
    "title": "Field Note — Fruitvale Village",
    "giver": "found, not given",
    "site": "Fruitvale Village",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Fruitvale Village",
    "method": "radio",
    "cites": {
      "app": "smartcity",
      "stationId": "jobsite-orientation-and-osha-10",
      "stepId": "tie-off"
    },
    "lesson": "Fall protection from six feet up, under 29 CFR 1926.501, means being tied off before you are exposed, not after you reach the work.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "talk",
        "target": "maintenance-radio",
        "text": "A site radio crackles: \"You're at the top of the ladder with the deck right there — when does the lanyard actually clip on?\""
      },
      {
        "type": "find",
        "target": "bw-egg-orientation-tieoff",
        "text": "The radio crackles once more and gives up the note: \"Fall protection from six feet up, under 29 CFR 1926.501, means being tied off before you are exposed, not after you reach the work.\""
      }
    ]
  },
  {
    "id": "bw-egg-hall-signbook",
    "title": "Field Note — MacArthur BART Station",
    "giver": "found, not given",
    "site": "MacArthur BART Station",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "MacArthur BART Station",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "union-hall-and-dispatch",
      "stepId": "sign-books"
    },
    "lesson": "Referral from the hall generally works from the order people signed in and the rules the local posts, and your own signature on the book is what puts you on it.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "MacArthur BART Station",
        "text": "Walk to MacArthur BART Station and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-hall-signbook",
        "text": "Tucked near the sign at MacArthur BART Station, a field note reads: \"Referral from the hall generally works from the order people signed in and the rules the local posts, and your own signature on the book is what puts you on it.\""
      }
    ]
  },
  {
    "id": "bw-egg-credit-freereports",
    "title": "Field Note — San Antonio Park",
    "giver": "found, not given",
    "site": "San Antonio Park",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "San Antonio Park",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "credit-report-reading",
      "stepId": "request-reports"
    },
    "lesson": "Under the Fair Credit Reporting Act, as the CFPB states it, you are entitled to free reports from each of the nationwide credit reporting companies, and AnnualCreditReport.com is the one site set up for it.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "San Antonio Park",
        "text": "Walk to San Antonio Park and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-credit-freereports",
        "text": "Tucked near the sign at San Antonio Park, a field note reads: \"Under the Fair Credit Reporting Act, as the CFPB states it, you are entitled to free reports from each of the nationwide credit reporting companies, and AnnualCreditReport.com is the one site set up for it.\""
      }
    ]
  },
  {
    "id": "bw-egg-debt-sortbyrate",
    "title": "Field Note — Mosswood Park",
    "giver": "found, not given",
    "site": "Mosswood Park",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Mosswood Park",
    "method": "radio",
    "cites": {
      "app": "smartcity",
      "stationId": "debt-reduction-plan",
      "stepId": "sort-by-rate"
    },
    "lesson": "Paying extra on the highest-rate debt first while keeping every minimum current is the order that costs the least interest, which is why the plan sorts by APR rather than by balance or by whichever creditor calls most.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "talk",
        "target": "maintenance-radio",
        "text": "A calm voice on the coaching line asks: \"Three cards, three rates — which one gets the extra dollar this month?\""
      },
      {
        "type": "find",
        "target": "bw-egg-debt-sortbyrate",
        "text": "The radio crackles once more and gives up the note: \"Paying extra on the highest-rate debt first while keeping every minimum current is the order that costs the least interest, which is why the plan sorts by APR rather than by balance or by whichever creditor calls most.\""
      }
    ]
  },
  {
    "id": "bw-egg-sleep-naptimer",
    "title": "Field Note — Lakeside Park",
    "giver": "found, not given",
    "site": "Lakeside Park",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Lakeside Park",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "wellness-shift-work-sleep-and-stress",
      "stepId": "nap-timer"
    },
    "lesson": "A twenty-minute nap before a night shift clears a measurable amount of the sleepiness without going deep enough to leave you groggy on waking; a ninety-minute one runs into deep sleep and you wake worse than you lay down, which is the sleep inertia that makes people swear naps do not work.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Lakeside Park",
        "text": "Walk to Lakeside Park and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-sleep-naptimer",
        "text": "Tucked near the sign at Lakeside Park, a field note reads: \"A twenty-minute nap before a night shift clears a measurable amount of the sleepiness without going deep enough to leave you groggy on waking; a ninety-minute one runs into deep sleep and you wake worse than you lay down, which is the sleep inertia that makes people swear naps do not work.\""
      }
    ]
  },
  {
    "id": "bw-egg-substance-staywith",
    "title": "Field Note — Snow Park",
    "giver": "found, not given",
    "site": "Snow Park",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Snow Park",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "wellness-substance-use-and-the-job",
      "stepId": "stay-with-him"
    },
    "lesson": "The minutes between the call and the supervisor's arrival are when a crew-mate walks — to the dock, to the lot, to his car — and every one of those is worse than the meeting he is avoiding.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Snow Park",
        "text": "Walk to Snow Park and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-substance-staywith",
        "text": "Tucked near the sign at Snow Park, a field note reads: \"The minutes between the call and the supervisor's arrival are when a crew-mate walks — to the dock, to the lot, to his car — and every one of those is worse than the meeting he is avoiding.\""
      }
    ]
  },
  {
    "id": "bw-egg-decon-berm",
    "title": "Field Note — Estuary Park",
    "giver": "found, not given",
    "site": "Estuary Park",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Estuary Park",
    "method": "radio",
    "cites": {
      "app": "smartcity",
      "stationId": "decon-line",
      "stepId": "berm"
    },
    "lesson": "Runoff from a decon line is not water with a little product in it; it is the product, carried in water, headed for whatever the drain connects to.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "talk",
        "target": "maintenance-radio",
        "text": "A hazmat channel crackles: \"Before the first litre of wash water goes down — what's supposed to be over that storm drain?\""
      },
      {
        "type": "find",
        "target": "bw-egg-decon-berm",
        "text": "The radio crackles once more and gives up the note: \"Runoff from a decon line is not water with a little product in it; it is the product, carried in water, headed for whatever the drain connects to.\""
      }
    ]
  },
  {
    "id": "bw-egg-stormwater-ice",
    "title": "Field Note — Alameda Point",
    "giver": "found, not given",
    "site": "Alameda Point",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Alameda Point",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "stormwater-outfall",
      "stepId": "ice"
    },
    "lesson": "Four degrees Celsius is written into the method itself, not a suggestion for the ride back.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Alameda Point",
        "text": "Walk to Alameda Point and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-stormwater-ice",
        "text": "Tucked near the sign at Alameda Point, a field note reads: \"Four degrees Celsius is written into the method itself, not a suggestion for the ride back.\""
      }
    ]
  },
  {
    "id": "bw-egg-dredge-curtain",
    "title": "Field Note — Alameda Marina",
    "giver": "found, not given",
    "site": "Alameda Marina",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Alameda Marina",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "dredge-barge",
      "stepId": "curtain-deploy"
    },
    "lesson": "The curtain is what keeps the plume the bucket raises inside a boundary the permit actually drew, rather than free to drift with the tide across the whole reach.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Alameda Marina",
        "text": "Walk to Alameda Marina and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-dredge-curtain",
        "text": "Tucked near the sign at Alameda Marina, a field note reads: \"The curtain is what keeps the plume the bucket raises inside a boundary the permit actually drew, rather than free to drift with the tide across the whole reach.\""
      }
    ]
  },
  {
    "id": "bw-egg-oyster-quadrat",
    "title": "Field Note — Berkeley Marina",
    "giver": "found, not given",
    "site": "Berkeley Marina",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Berkeley Marina",
    "method": "radio",
    "cites": {
      "app": "smartcity",
      "stationId": "oyster-reef-monitoring",
      "stepId": "quadrat-count"
    },
    "lesson": "The count is only valid for the footprint the frame actually covers, and a frame that lifts or shifts mid-tally either double-counts a shell at the edge or misses one — holding it flat and steady for the full count is what makes this quarter's density number mean the same thing as last quarter's, taken the same way over the same square metre.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "talk",
        "target": "maintenance-radio",
        "text": "A field radio check-in asks: \"Frame's down on the tag — what happens to the count if it shifts before you finish the tally?\""
      },
      {
        "type": "find",
        "target": "bw-egg-oyster-quadrat",
        "text": "The radio crackles once more and gives up the note: \"The count is only valid for the footprint the frame actually covers, and a frame that lifts or shifts mid-tally either double-counts a shell at the edge or misses one — holding it flat and steady for the full count is what makes this quarter's density number mean the same thing as last quarter's, taken the same way over the same square metre.\""
      }
    ]
  },
  {
    "id": "bw-egg-tidegate-float",
    "title": "Field Note — Berkeley Pier",
    "giver": "found, not given",
    "site": "Berkeley Pier",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Berkeley Pier",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "tide-gate",
      "stepId": "hang-new-gate"
    },
    "lesson": "A self-regulating tide gate opens on the outgoing flow and swings shut against the incoming tide on its own float, with no operator — which means it only works at all if it is hung square on the flange it was designed for.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Berkeley Pier",
        "text": "Walk to Berkeley Pier and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-tidegate-float",
        "text": "Tucked near the sign at Berkeley Pier, a field note reads: \"A self-regulating tide gate opens on the outgoing flow and swings shut against the incoming tide on its own float, with no operator — which means it only works at all if it is hung square on the flange it was designed for.\""
      }
    ]
  },
  {
    "id": "bw-egg-mooring-eye",
    "title": "Field Note — Emeryville Marina",
    "giver": "found, not given",
    "site": "Emeryville Marina",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Emeryville Marina",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "mooring-line",
      "stepId": "eye"
    },
    "lesson": "The eye goes over the post from the outside, so your hands are never between the rope and the steel.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Emeryville Marina",
        "text": "Walk to Emeryville Marina and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-mooring-eye",
        "text": "Tucked near the sign at Emeryville Marina, a field note reads: \"The eye goes over the post from the outside, so your hands are never between the rope and the steel.\""
      }
    ]
  },
  {
    "id": "bw-egg-dockcrane-wind",
    "title": "Field Note — Bay Trail — Oakland Segment",
    "giver": "found, not given",
    "site": "Bay Trail — Oakland Segment",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Bay Trail — Oakland Segment",
    "method": "radio",
    "cites": {
      "app": "smartcity",
      "stationId": "dock-crane",
      "stepId": "wind-check"
    },
    "lesson": "A container is a sail the moment it clears the stack — forty feet of flat steel with nothing to break the wind's grip on it.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "talk",
        "target": "maintenance-radio",
        "text": "The crane channel breaks in: \"Box is off the chassis and swinging — what should have been read before it ever left the stack?\""
      },
      {
        "type": "find",
        "target": "bw-egg-dockcrane-wind",
        "text": "The radio crackles once more and gives up the note: \"A container is a sail the moment it clears the stack — forty feet of flat steel with nothing to break the wind's grip on it.\""
      }
    ]
  },
  {
    "id": "bw-egg-craneyard-level",
    "title": "Field Note — Coliseum Station",
    "giver": "found, not given",
    "site": "Coliseum Station",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Coliseum Station",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "crane-yard",
      "stepId": "level-check"
    },
    "lesson": "A crane that is off level derates in the direction of the lean without saying so.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Coliseum Station",
        "text": "Walk to Coliseum Station and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-craneyard-level",
        "text": "Tucked near the sign at Coliseum Station, a field note reads: \"A crane that is off level derates in the direction of the lean without saying so.\""
      }
    ]
  },
  {
    "id": "bw-egg-scaffold-tie",
    "title": "Field Note — Redwood Regional Park",
    "giver": "found, not given",
    "site": "Redwood Regional Park",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Redwood Regional Park",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "scaffold-erection",
      "stepId": "tie"
    },
    "lesson": "The tie is what makes this a structure fastened to the building instead of a free-standing tower carrying its own wind load — NIOSH fatality investigations into scaffold collapses keep finding the same missing element, a tie pattern that was never installed or was installed after the fact.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Redwood Regional Park",
        "text": "Walk to Redwood Regional Park and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-scaffold-tie",
        "text": "Tucked near the sign at Redwood Regional Park, a field note reads: \"The tie is what makes this a structure fastened to the building instead of a free-standing tower carrying its own wind load — NIOSH fatality investigations into scaffold collapses keep finding the same missing element, a tie pattern that was never installed or was installed after the fact.\""
      }
    ]
  },
  {
    "id": "bw-egg-rescue-refuse",
    "title": "Field Note — Joaquin Miller Park",
    "giver": "found, not given",
    "site": "Joaquin Miller Park",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Joaquin Miller Park",
    "method": "radio",
    "cites": {
      "app": "smartcity",
      "stationId": "confined-rescue",
      "stepId": "refuse"
    },
    "lesson": "More than half of confined-space fatalities are the would-be rescuers, per OSHA's own accident data behind 29 CFR 1910.146(k), and the instinct to go straight in after a downed coworker is exactly what produces that number.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "talk",
        "target": "maintenance-radio",
        "text": "An emergency channel breaks squelch: \"Your partner just went down in the hole — what's the very first thing you do, and what do you not do?\""
      },
      {
        "type": "find",
        "target": "bw-egg-rescue-refuse",
        "text": "The radio crackles once more and gives up the note: \"More than half of confined-space fatalities are the would-be rescuers, per OSHA's own accident data behind 29 CFR 1910.146(k), and the instinct to go straight in after a downed coworker is exactly what produces that number.\""
      }
    ]
  },
  {
    "id": "bw-egg-boiler-lockall",
    "title": "Field Note — Dimond Canyon Park",
    "giver": "found, not given",
    "site": "Dimond Canyon Park",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Dimond Canyon Park",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "boiler-room",
      "stepId": "lock-all"
    },
    "lesson": "OSHA's control-of-hazardous-energy rule at 29 CFR 1910.147 is built on one idea: the only person who can restore an isolation is the person who locked it.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Dimond Canyon Park",
        "text": "Walk to Dimond Canyon Park and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-boiler-lockall",
        "text": "Tucked near the sign at Dimond Canyon Park, a field note reads: \"OSHA's control-of-hazardous-energy rule at 29 CFR 1910.147 is built on one idea: the only person who can restore an isolation is the person who locked it.\""
      }
    ]
  },
  {
    "id": "bw-egg-hood-pathclear",
    "title": "Field Note — Lake Merritt",
    "giver": "found, not given",
    "site": "Lake Merritt",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Lake Merritt",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "hood-suppression",
      "stepId": "path-clear"
    },
    "lesson": "A pull station three seconds away by sightline and ten seconds away around a stack of totes is a pull station that costs a kitchen the difference between a scorched hood and a working fire — NFPA 96 calls for it visible and reachable for exactly that reason, and reachable is something you confirm standing there, not something you assume from memory.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Lake Merritt",
        "text": "Walk to Lake Merritt and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-hood-pathclear",
        "text": "Tucked near the sign at Lake Merritt, a field note reads: \"A pull station three seconds away by sightline and ten seconds away around a stack of totes is a pull station that costs a kitchen the difference between a scorched hood and a working fire — NFPA 96 calls for it visible and reachable for exactly that reason, and reachable is something you confirm standing there, not something you assume from memory.\""
      }
    ]
  },
  {
    "id": "bw-egg-cleat-hitch",
    "title": "Field Note — Estuary Marina",
    "giver": "found, not given",
    "site": "Estuary Marina",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Estuary Marina",
    "method": "goto",
    "cites": {
      "app": "smartcity",
      "stationId": "yc-line-handling-and-docking-in-crosswind",
      "stepId": "stern-hitch"
    },
    "lesson": "A cleat hitch holds because the load goes round the base of the cleat first and the figure-eights take the strain off the hitch; a line dropped straight into a hitch with no turn under it slips under load or jams so hard it cannot be cast off in a hurry.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Estuary Marina",
        "text": "Walk to Estuary Marina and look for the marker."
      },
      {
        "type": "find",
        "target": "bw-egg-cleat-hitch",
        "text": "Tucked near the sign at Estuary Marina, a field note reads: \"A cleat hitch holds because the load goes round the base of the cleat first and the figure-eights take the strain off the hitch; a line dropped straight into a hitch with no turn under it slips under load or jams so hard it cannot be cast off in a hurry.\""
      }
    ]
  },
  {
    "id": "bw-egg-tender-light",
    "title": "Field Note — Estuary Marina",
    "giver": "found, not given",
    "site": "Estuary Marina",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Estuary Marina",
    "method": "radio",
    "cites": {
      "app": "smartcity",
      "stationId": "yc-tender-launch-and-guest-transfer",
      "stepId": "nav-light-check"
    },
    "lesson": "A tender running back to the yacht at dusk without a light is invisible to every other vessel in the anchorage and outside the navigation rules that let those vessels avoid her; the light is checked in daylight because a dead lamp is discovered alongside a platform, not in the channel.",
    "reward": {
      "xp": 25,
      "badge": "Field Note"
    },
    "steps": [
      {
        "type": "talk",
        "target": "maintenance-radio",
        "text": "The marina's maintenance radio hums: 'Dusk run tonight — tell me what the tender crew check before slipping the painter.'"
      },
      {
        "type": "find",
        "target": "bw-egg-tender-light",
        "text": "The radio crackles once more and gives up the note: \"A tender running back to the yacht at dusk without a light is invisible to every other vessel in the anchorage and outside the navigation rules that let those vessels avoid her; the light is checked in daylight because a dead lamp is discovered alongside a platform, not in the channel.\""
      }
    ]
  }
];

export const FIELD_GUIDE_EGGS = [
  {
    "id": "bw-egg-fg-gulls-port",
    "title": "Field Guide — Harbor Gantry Cranes",
    "giver": "found, not given",
    "site": "Harbor Gantry Cranes",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Harbor Gantry Cranes",
    "method": "sight",
    "wildlife": "gulls",
    "note": "Gulls work the tide line and the wake of anything that stirs the water; the sound of one over a dock usually means the others are close behind.",
    "steps": [
      {
        "type": "goto",
        "target": "Harbor Gantry Cranes",
        "text": "Walk to Harbor Gantry Cranes and watch the water and the shore for a while."
      },
      {
        "type": "find",
        "target": "bw-egg-fg-gulls-port",
        "text": "A Field Guide page fills in: \"Gulls work the tide line and the wake of anything that stirs the water; the sound of one over a dock usually means the others are close behind.\""
      }
    ],
    "reward": {
      "xp": 25,
      "badge": "Field Guide"
    }
  },
  {
    "id": "bw-egg-fg-gulls-pier",
    "title": "Field Guide — North Pier",
    "giver": "found, not given",
    "site": "North Pier",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "North Pier",
    "method": "sight",
    "wildlife": "gulls",
    "note": "Gulls on a pier rail are watching the anglers, not the water; bait left on the deck goes first, and a hooked bird is a real hazard.",
    "steps": [
      {
        "type": "goto",
        "target": "North Pier",
        "text": "Walk to North Pier and watch the water and the shore for a while."
      },
      {
        "type": "find",
        "target": "bw-egg-fg-gulls-pier",
        "text": "A Field Guide page fills in: \"Gulls on a pier rail are watching the anglers, not the water; bait left on the deck goes first, and a hooked bird is a real hazard.\""
      }
    ],
    "reward": {
      "xp": 25,
      "badge": "Field Guide"
    }
  },
  {
    "id": "bw-egg-fg-pelicans-channel",
    "title": "Field Guide — Channel Marker",
    "giver": "found, not given",
    "site": "Channel Marker",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Channel Marker",
    "method": "sight",
    "wildlife": "pelicans",
    "note": "Pelicans fly low in a line with slow, deep wingbeats and fold into a plunge when they spot a fish beneath the surface.",
    "steps": [
      {
        "type": "goto",
        "target": "Channel Marker",
        "text": "Walk to Channel Marker and watch the water and the shore for a while."
      },
      {
        "type": "find",
        "target": "bw-egg-fg-pelicans-channel",
        "text": "A Field Guide page fills in: \"Pelicans fly low in a line with slow, deep wingbeats and fold into a plunge when they spot a fish beneath the surface.\""
      }
    ],
    "reward": {
      "xp": 25,
      "badge": "Field Guide"
    }
  },
  {
    "id": "bw-egg-fg-shorebirds-beach",
    "title": "Field Guide — Island Beach Esplanade",
    "giver": "found, not given",
    "site": "Island Beach Esplanade",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Island Beach Esplanade",
    "method": "sight",
    "wildlife": "shorebirds",
    "note": "Shorebirds run in short dashes along the wet sand where each wave pulls back, probing for what the water uncovered.",
    "steps": [
      {
        "type": "goto",
        "target": "Island Beach Esplanade",
        "text": "Walk to Island Beach Esplanade and watch the water and the shore for a while."
      },
      {
        "type": "find",
        "target": "bw-egg-fg-shorebirds-beach",
        "text": "A Field Guide page fills in: \"Shorebirds run in short dashes along the wet sand where each wave pulls back, probing for what the water uncovered.\""
      }
    ],
    "reward": {
      "xp": 25,
      "badge": "Field Guide"
    }
  },
  {
    "id": "bw-egg-fg-seals-float",
    "title": "Field Guide — North Pier",
    "giver": "found, not given",
    "site": "North Pier",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "North Pier",
    "method": "sight",
    "wildlife": "seals",
    "note": "Seals haul out on floats and low rocks to rest and warm up between dives, and slip back in quietly when something comes too close.",
    "steps": [
      {
        "type": "goto",
        "target": "North Pier",
        "text": "Walk to North Pier and watch the water and the shore for a while."
      },
      {
        "type": "find",
        "target": "bw-egg-fg-seals-float",
        "text": "A Field Guide page fills in: \"Seals haul out on floats and low rocks to rest and warm up between dives, and slip back in quietly when something comes too close.\""
      }
    ],
    "reward": {
      "xp": 25,
      "badge": "Field Guide"
    }
  },
  {
    "id": "bw-egg-fg-fish-school",
    "title": "Field Guide — Channel Marker",
    "giver": "found, not given",
    "site": "Channel Marker",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Channel Marker",
    "method": "sight",
    "wildlife": "fish",
    "note": "A fish school moves as one body, turning and tightening together so that no single fish is easy to single out.",
    "steps": [
      {
        "type": "goto",
        "target": "Channel Marker",
        "text": "Walk to Channel Marker and watch the water and the shore for a while."
      },
      {
        "type": "find",
        "target": "bw-egg-fg-fish-school",
        "text": "A Field Guide page fills in: \"A fish school moves as one body, turning and tightening together so that no single fish is easy to single out.\""
      }
    ],
    "reward": {
      "xp": 25,
      "badge": "Field Guide"
    }
  },
  {
    "id": "bw-egg-fg-ray-channel",
    "title": "Field Guide — Channel Marker",
    "giver": "found, not given",
    "site": "Channel Marker",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Channel Marker",
    "method": "sight",
    "wildlife": "ray",
    "note": "A ray glides just above the bottom on its wing-like fins and settles into the sand when it stops, showing only its eyes and tail.",
    "steps": [
      {
        "type": "goto",
        "target": "Channel Marker",
        "text": "Walk to Channel Marker and watch the water and the shore for a while."
      },
      {
        "type": "find",
        "target": "bw-egg-fg-ray-channel",
        "text": "A Field Guide page fills in: \"A ray glides just above the bottom on its wing-like fins and settles into the sand when it stops, showing only its eyes and tail.\""
      }
    ],
    "reward": {
      "xp": 25,
      "badge": "Field Guide"
    }
  },
  {
    "id": "bw-egg-fg-crab-breakwater",
    "title": "Field Guide — North Pier",
    "giver": "found, not given",
    "site": "North Pier",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "North Pier",
    "method": "sight",
    "wildlife": "crab",
    "note": "A kelp crab clings to weed and rock with hooked legs and sidesteps into cover rather than swimming from anything that startles it.",
    "steps": [
      {
        "type": "goto",
        "target": "North Pier",
        "text": "Walk to North Pier and watch the water and the shore for a while."
      },
      {
        "type": "find",
        "target": "bw-egg-fg-crab-breakwater",
        "text": "A Field Guide page fills in: \"A kelp crab clings to weed and rock with hooked legs and sidesteps into cover rather than swimming from anything that startles it.\""
      }
    ],
    "reward": {
      "xp": 25,
      "badge": "Field Guide"
    }
  }
];

export const SIDE_ACTIVITIES = [
  {
    "id": "bw-activity-delivery-run",
    "title": "Delivery Run",
    "kind": "delivery",
    "vehicle": "box truck",
    "route": {
      "from": "Bay Intermodal Warehouse",
      "to": "Financial Coaching Center"
    },
    "description": "Drive a box truck between two sites under the same driving checks the platform's Class A driving stations already score.",
    "scoring": {
      "time": true,
      "criteria": [
        "following distance held in the safe band",
        "turn signal used before every lane change and turn",
        "speed held within the posted limit",
        "smooth starts and stops, no harsh braking"
      ]
    }
  },
  {
    "id": "bw-activity-lake-loop",
    "title": "Lake Merritt Loop Time Trial",
    "kind": "time-trial",
    "mode": "on foot",
    "site": "Lake Merritt",
    "description": "A timed lap of the lake on foot, checkpoint to checkpoint.",
    "scoring": {
      "time": true,
      "checkpoints": 4
    }
  },
  {
    "id": "bw-activity-port-spotting",
    "title": "Port Yard Spotting",
    "kind": "spotting",
    "site": "Port of Oakland",
    "description": "Spot marked equipment faults and hazard flags placed around the yard before the timer runs out.",
    "scoring": {
      "time": true,
      "correctSpotPoints": 10,
      "falseCallPenalty": 5
    }
  },
  {
    "id": "bw-activity-harbor-cruise",
    "title": "Harbor Cruise",
    "kind": "cruise",
    "vessel": "motor yacht",
    "site": "Estuary Marina",
    "route": {
      "from": "Estuary Marina",
      "to": "Estuary Marina"
    },
    "description": "Take the charter yacht off her berth, out along the estuary and back to the same berth, scored on the same crew habits the yacht and charter crew stations teach.",
    "scoring": {
      "time": false,
      "criteria": [
        "guest count read back to the captain before a line moves",
        "lines and fenders stowed before leaving the marina",
        "no-wake speed held inside the marina",
        "wake watch kept on the estuary for other vessels and the shoreline",
        "a clean return to the berth: spring first, engines confirmed stopped before the gangway"
      ]
    }
  },
  {
    "id": "bw-activity-pier-fishing",
    "title": "North Pier Catch and Release",
    "kind": "fishing",
    "site": "North Pier",
    "description": "Catch-and-release fishing from the north pier's rail: rig, cast, land and release, scored on the habits that keep the pier safe for the people and the fish.",
    "rules": [
      "rig check before the first cast: knots pulled tight, hook point sharp, no frayed line",
      "look and call behind before every cast, and cast only with the deck clear behind you",
      "handle the hook with pliers, never with the line wrapped round a hand",
      "wet hands before touching a fish, keep it over the water and release it quickly",
      "carry the licence the state's rules ask for, and follow those rules for anything kept"
    ],
    "scoring": {
      "time": false,
      "criteria": [
        "rig checked before the first cast",
        "area behind the cast confirmed clear every time",
        "hook handled with pliers",
        "every fish released with wet hands"
      ]
    }
  },
  {
    "id": "bw-activity-hills-photo",
    "title": "Skyline Lookout Photo Mode",
    "kind": "photo",
    "site": "Skyline Lookout",
    "description": "A non-competitive photo mode: frame a set of marked viewpoints along the ridge.",
    "scoring": {
      "competitive": false,
      "viewpointsToFrame": 6
    }
  }
];

export const LANDMARK_NOTES = {
  "Lake Merritt": "A tidal lake that rings the heart of the city.",
  "Lakeside Park": "A park along the lake's northern shore.",
  "Snow Park": "A small park where the lake meets the downtown streets.",
  "Jack London Square": "A waterfront square of shops and piers by the estuary.",
  "Union Point Park": "A park where a creek meets the tidal estuary.",
  "Estuary Park": "A small waterfront green space on the estuary channel.",
  "Middle Harbor Shoreline Park": "A shoreline park on reclaimed port land.",
  "Port of Oakland": "The working seaport along the estuary.",
  "Brooklyn Basin": "A waterfront neighborhood along the estuary channel.",
  "Fruitvale Village": "A plaza around a transit station.",
  "San Antonio Park": "A neighborhood park in the flatlands.",
  "Mosswood Park": "A green square near a freeway interchange.",
  "MacArthur BART Station": "A transit interchange serving the surrounding neighborhoods.",
  "Coliseum Station": "A transit station near the bay shoreline.",
  "Alameda Point": "A former base site at the tip of the island's shoreline.",
  "Alameda Marina": "A small-craft marina on the estuary side of the island.",
  "Emeryville Marina": "A small-craft marina on the bay shoreline.",
  "Estuary Marina": "A small-craft marina with floating docks along the estuary.",
  "Berkeley Marina": "A marina along the bay shoreline to the north.",
  "Berkeley Pier": "A long fishing pier reaching out over the bay.",
  "Redwood Regional Park": "A regional park of forested hillside trails.",
  "Joaquin Miller Park": "A hillside park of wooded trails above the flatlands.",
  "Dimond Canyon Park": "A wooded canyon park along a creek.",
  "Skyline Lookout": "A hillside lookout point along the ridge road.",
  "Bay Trail — Oakland Segment": "A shoreline path along the bay's edge."
};
