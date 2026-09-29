/**
 * GENERATED FILE — do not hand-edit. Run `node tools/gen_dive_quests.mjs`
 * after changing anything in that script, after a programme in
 * WebXR/smartcity/js/curricula.js changes, or after the seabed's sites or
 * landmarks change, to regenerate this file.
 *
 * The Deep's dive quest layer: a six-dive main arc (a survey career from the
 * pier pilings to the seamount), one opener and one capstone side dive per
 * programme the seabed's sites anchor, the lantern eggs at the seabed's
 * landmarks, and four scored activities.
 *
 * Dive shape (WebXR/underwater/js/dive-engine.js):
 *   { id, title, giver, site, kind: "main"|"side"|"egg",
 *     steps: [{ type: "goto"|"station"|"find"|"rov"|"talk", target, text }],
 *     reward }
 * plus `tier` and `requires` for the dive graph and its monotone reward
 * curve (dives.js's dvRewardForTier()). Egg dives carry `landmark`,
 * `method` ("lantern" or "comms"), `cites` and `lesson` (a verbatim
 * first sentence of the cited step's own why line).
 */

export const DV_MAIN_DIVES = [
  {
    "id": "dv-main-00-pilings",
    "title": "First Splash",
    "giver": "the dive supervisor",
    "site": "Pier Surface-Supplied Station",
    "kind": "main",
    "tier": 1,
    "requires": null,
    "steps": [
      {
        "type": "goto",
        "target": "Pier Surface-Supplied Station",
        "text": "The dive station is set up on the pier deck above the pilings, the supervisor at the panel."
      },
      {
        "type": "talk",
        "target": "dive-supervisor",
        "text": "\"Nobody gets wet until the deck is right. The plan, the hazards, the station — in that order. Then the pilings.\""
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
        "type": "talk",
        "target": "dive-supervisor",
        "text": "\"That's a station I'd breathe from. Welcome to the survey crew.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "First Splash"
    }
  },
  {
    "id": "dv-main-01-shelf",
    "title": "Shelf Hand",
    "giver": "the standby diver",
    "site": "Shelf Checkout Site",
    "kind": "main",
    "tier": 2,
    "requires": "dv-main-00-pilings",
    "steps": [
      {
        "type": "goto",
        "target": "Shelf Checkout Site",
        "text": "Sun-lit sand, a training grid and the standby diver waiting at the down line."
      },
      {
        "type": "talk",
        "target": "standby-diver",
        "text": "\"Before you survey anything, you learn how we come and get you. Then we read the gauge post together.\""
      },
      {
        "type": "station",
        "target": "mw-diver-emergency-and-recovery",
        "text": "The standby's dive: the fouled diver reached along his own umbilical, his gas first, the snag cut and never his umbilical, and brought up on the stage at the supervisor's call rather than flown up on a bag."
      },
      {
        "type": "goto",
        "target": "Tide Gauge Post",
        "text": "Swim to the tide-gauge post on the shelf and read the water from below."
      },
      {
        "type": "talk",
        "target": "standby-diver",
        "text": "\"Good. The shelf's yours now — and every ascent line on it.\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Shelf Hand"
    }
  },
  {
    "id": "dv-main-02-meadow",
    "title": "The Meadow Grid",
    "giver": "the transplant lead",
    "site": "Eelgrass Transplant Plots",
    "kind": "main",
    "tier": 3,
    "requires": "dv-main-01-shelf",
    "steps": [
      {
        "type": "goto",
        "target": "Eelgrass Transplant Plots",
        "text": "Grass blades bend with the tide over a planting grid of numbered stakes."
      },
      {
        "type": "talk",
        "target": "transplant-lead",
        "text": "\"The grid is the survey. Every planting has a stake, every stake has a number, and the supervisor never gets in the water.\""
      },
      {
        "type": "station",
        "target": "eelgrass-transplant",
        "text": "The habitat the fill once displaced, replanted underwater: a donor bed cut to its share, shoots bundled inside the clock, and a diver directed to the grid by a supervisor who never gets in the water."
      },
      {
        "type": "find",
        "target": "Eelgrass Nursery Plots",
        "text": "Find the nursery plots' corner stake and note its tag."
      },
      {
        "type": "talk",
        "target": "transplant-lead",
        "text": "\"Logged. The meadow's edge is the next line out — the reef field is past it.\""
      }
    ],
    "reward": {
      "xp": 400,
      "badge": "Meadow Grid"
    }
  },
  {
    "id": "dv-main-03-reef",
    "title": "Cores on the Flats",
    "giver": "the sampling lead",
    "site": "Flats Sediment Core Site",
    "kind": "main",
    "tier": 4,
    "requires": "dv-main-02-meadow",
    "steps": [
      {
        "type": "goto",
        "target": "Flats Sediment Core Site",
        "text": "A core rack on the flats beside the station marker, the sampling lead pointing at the sampling plan's number."
      },
      {
        "type": "talk",
        "target": "sampling-lead",
        "text": "\"A core is a record. It only stays one if it goes in straight, comes out sealed and travels under custody.\""
      },
      {
        "type": "station",
        "target": "br-underwater-sediment-core-sampling",
        "text": "Dredging and capping decisions rest on sediment cores a diver takes by hand, so the cable crossing, a steady push, a capped core and the chain of custody are rehearsed with a bailout and a recall along the way."
      },
      {
        "type": "station",
        "target": "br-sediment-chain-of-custody-and-lab-prep",
        "text": "Cores become laboratory samples at a dockside bench with custody signed at every hand-off, the volatiles taken before anything is mixed and anything unlabelled kept out of the batch, because a sediment result is only as defensible as its record."
      },
      {
        "type": "talk",
        "target": "sampling-lead",
        "text": "\"Custody signed. The channel's next — and the hollow past it.\""
      }
    ],
    "reward": {
      "xp": 550,
      "badge": "Core Sampler"
    }
  },
  {
    "id": "dv-main-04-wreck",
    "title": "The Hollow",
    "giver": "the survey lead",
    "site": "Wreck Photo Survey",
    "kind": "main",
    "tier": 5,
    "requires": "dv-main-03-reef",
    "steps": [
      {
        "type": "goto",
        "target": "Wreck Photo Survey",
        "text": "A scoured hollow, a small derelict hull settled in it bow to the current."
      },
      {
        "type": "talk",
        "target": "survey-lead",
        "text": "\"Nothing comes off this bottom until it's on the map. Baseline first, then the ROV runs the hull for us.\""
      },
      {
        "type": "station",
        "target": "br-underwater-debris-survey-and-mapping",
        "text": "No debris comes off the Bay floor until a diver has mapped it on a baseline, found the drums, batteries, rebar and hulls, and left the hazardous items for the work plan."
      },
      {
        "type": "rov",
        "target": "The Wreck's Bow",
        "text": "Pilot the ROV along the hull to its bow, tether tended, and hold there."
      },
      {
        "type": "talk",
        "target": "survey-lead",
        "text": "\"Mapped and photographed. One stop left on this career: the pinnacle.\""
      }
    ],
    "reward": {
      "xp": 700,
      "badge": "Wreck Surveyor"
    }
  },
  {
    "id": "dv-main-05-seamount",
    "title": "The Pinnacle",
    "giver": "the compliance biologist",
    "site": "Seamount Capstone Survey",
    "kind": "main",
    "tier": 6,
    "requires": "dv-main-04-wreck",
    "steps": [
      {
        "type": "goto",
        "target": "Seamount Capstone Survey",
        "text": "The seamount rises out of deep water; the survey boat lies over its pinnacle."
      },
      {
        "type": "talk",
        "target": "compliance-biologist",
        "text": "\"Out here the watch matters as much as the work, and the data only says what the reviewed sheets back up.\""
      },
      {
        "type": "station",
        "target": "br-marine-mammal-observer-during-pile-driving",
        "text": "A pile-driving crew can only work under NOAA Fisheries' own authorization when its observer scans the shutdown zone clean before every ramp-up and calls an immediate stop the moment a harbor seal or harbor porpoise is inside it."
      },
      {
        "type": "station",
        "target": "br-restoration-data-qa-and-public-reporting",
        "text": "Every field sheet is checked before it's scanned and every suspect value is flagged rather than typed straight in, so the one line the public dashboard is allowed to say about the Bay is a line the reviewed data actually backs up."
      },
      {
        "type": "goto",
        "target": "Seamount Pinnacle",
        "text": "Swim to the top of the pinnacle and look back over the whole field."
      },
      {
        "type": "talk",
        "target": "compliance-biologist",
        "text": "\"From the pilings to here — that's a survey career. Every line on this map is yours to dive again.\""
      }
    ],
    "reward": {
      "xp": 850,
      "badge": "Pinnacle"
    }
  }
];

export const DV_SIDE_DIVES = [
  {
    "id": "dv-side-bay-area-union-edition-opener",
    "title": "Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine — First Dive",
    "giver": "the programme's dive lead",
    "site": "Pier Piling Inspection Station",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "bay-area-union-edition",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Piling Inspection Station",
        "text": "The dive lead meets you at Pier Piling Inspection Station and walks you to the first bench."
      },
      {
        "type": "station",
        "target": "gg-pile-driver-fender-repair",
        "text": "The deck side of a pier fender repair: a new panel bolted up, test-lifted and lowered over the rail on the tag line to the barge, with the water below held clear."
      },
      {
        "type": "station",
        "target": "mw-workboat-towing-and-line-handling",
        "text": "Making up to a barge astern under Subchapter M: the hawser walked and the winch brake set, the eye passed from outside the bight, and the pay-out stopped the moment the wheelhouse goes silent."
      },
      {
        "type": "station",
        "target": "mw-oil-transfer-watch-and-boom",
        "text": "The person in charge of a transfer: the declaration signed before the pump, the boom streamed from upcurrent, the flange watched through the slow start, and a sheen stopped at the source rather than dispersed."
      },
      {
        "type": "talk",
        "target": "dive-lead",
        "text": "\"One Bay Area tool for four union families: the sheet metal shop and the duct run, the Golden Gate Bridge tower, cable and paint programme, the terminal's cranes, fenders and reefer power, and the water itself: ferries, mooring, oil transfer, and the dive stage down to the piles and the hull.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine — Opener"
    }
  },
  {
    "id": "dv-side-bay-area-union-edition-capstone",
    "title": "Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Pier Piling Inspection Station",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-bay-area-union-edition-opener",
    "programmeId": "bay-area-union-edition",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Piling Inspection Station",
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
    "id": "dv-side-commercial-diving-and-scientific-scuba-opener",
    "title": "Commercial Diving & Scientific Scuba — First Dive",
    "giver": "the programme's dive lead",
    "site": "Pier Piling Inspection Station",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "commercial-diving-and-scientific-scuba",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Piling Inspection Station",
        "text": "The dive lead meets you at Pier Piling Inspection Station and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"Eight jobs of the commercial dive crew and the scientific scuba pair, weighted to the surface side that keeps the diver alive: the welding tender at the knife switch, the diver reading a pile by hand and fitting its wrap, the ROV tender's tether, the chamber attendant and the post-dive watch, the scientific pair's buddy check and lost-buddy drill, a night search on a guideline, an intake locked out before a hydraulic tool goes down, and the paper that closes the day honestly. No depth, gas, decompression or time figure is ever stated; those live in the dive plan and the tables the supervisor holds.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Commercial Diving & Scientific Scuba — Opener"
    }
  },
  {
    "id": "dv-side-commercial-diving-and-scientific-scuba-capstone",
    "title": "Commercial Diving & Scientific Scuba — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Pier Piling Inspection Station",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-commercial-diving-and-scientific-scuba-opener",
    "programmeId": "commercial-diving-and-scientific-scuba",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Piling Inspection Station",
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
    "id": "dv-side-bay-restoration-maritime-underwater-opener",
    "title": "SF Bay Restoration & Cleanup — Maritime and Underwater — First Dive",
    "giver": "the programme's dive lead",
    "site": "Pier Surface-Supplied Station",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "bay-restoration-maritime-underwater",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Surface-Supplied Station",
        "text": "The dive lead meets you at Pier Surface-Supplied Station and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"Thirty-five more jobs the deep restoration and clean-up of San Francisco Bay will need, weighted to the water: the dive crew and its tender, the workboats, barges and skimmers, the shoreline and wetland crews, the sediment and water-quality work, and the monitoring and community science around it. Built in five packs of seven; every dive station keeps a standby diver, a tender and a supervisor on deck, and no depth, gas or decompression number is ever stated — those live in the dive plan.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "SF Bay Restoration & Cleanup — Maritime and Underwater — Opener"
    }
  },
  {
    "id": "dv-side-bay-restoration-maritime-underwater-capstone",
    "title": "SF Bay Restoration & Cleanup — Maritime and Underwater — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Pier Surface-Supplied Station",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-bay-restoration-maritime-underwater-opener",
    "programmeId": "bay-restoration-maritime-underwater",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Surface-Supplied Station",
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
    "id": "dv-side-hunters-point-bay-restoration-opener",
    "title": "Hunters Point Clean-up and Bay Restoration — First Dive",
    "giver": "the programme's dive lead",
    "site": "Pier Creosote Pile Site",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "hunters-point-bay-restoration",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Creosote Pile Site",
        "text": "The dive lead meets you at Pier Creosote Pile Site and walks you to the first bench."
      },
      {
        "type": "station",
        "target": "rad-survey",
        "text": "The gamma walkover done so its numbers can be trusted: source-check, background, grid speed, a static count over the investigation level, a split sample under chain of custody."
      },
      {
        "type": "station",
        "target": "dredge-barge",
        "text": "Contaminated sediment out of the bay inside a turbidity curtain, with the scow never over its freeboard line and decant water tested before it goes anywhere."
      },
      {
        "type": "station",
        "target": "oyster-reef-monitoring",
        "text": "The reef that shoreline built, checked on afterward: fixed quadrats found by tag and GPS, density logged before the frame moves, and the sonde read against the Water Board's own flag level before the flood takes the reef back."
      },
      {
        "type": "talk",
        "target": "dive-lead",
        "text": "\"A Superfund shoreline and the bay beside it, worked in the order a cleanup actually runs: the record first, then survey, then excavation and haul, then the groundwater that stays behind, then the water's edge given back — sediment out, tide back in, marsh planted. The first station is a sourced briefing on the real site and the data-integrity case at the centre of it; every station after it is a union trade doing its part of the work, and the discipline that made the case is taught as procedure: an instrument source-checked before and after, a sample that is the place it came from, and a split for a lab that does not work for you.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Hunters Point Clean-up and Bay Restoration — Opener"
    }
  },
  {
    "id": "dv-side-hunters-point-bay-restoration-capstone",
    "title": "Hunters Point Clean-up and Bay Restoration — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Pier Creosote Pile Site",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-hunters-point-bay-restoration-opener",
    "programmeId": "hunters-point-bay-restoration",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Creosote Pile Site",
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
    "id": "dv-side-heavy-equipment-operators-opener",
    "title": "Heavy Equipment Operators — IUOE Local 3 — First Dive",
    "giver": "the programme's dive lead",
    "site": "Pier Creosote Pile Site",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "heavy-equipment-operators",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Creosote Pile Site",
        "text": "The dive lead meets you at Pier Creosote Pile Site and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"Eight machines, eight IUOE jobs: an excavator trenching over a located utility, a dozer cutting a bench with its ROPS and seatbelt proven, a wheel loader working around its own blind zones, a grader cutting a road's crown to a stringline, a compactor rolling a fill lift by lift at the edge, a crawler crane's assembly closed out against its own load chart, a pile rig plumbed in two planes before the first blow, and the daily walkaround that keeps every one of them honest. Every station ends with a spotter, a checker or a tender who is doing a job the seat itself cannot do alone.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Heavy Equipment Operators — IUOE Local 3 — Opener"
    }
  },
  {
    "id": "dv-side-heavy-equipment-operators-capstone",
    "title": "Heavy Equipment Operators — IUOE Local 3 — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Pier Creosote Pile Site",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-heavy-equipment-operators-opener",
    "programmeId": "heavy-equipment-operators",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Creosote Pile Site",
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
    "id": "dv-side-situational-awareness-opener",
    "title": "Situational Awareness — Interruption Drill — First Dive",
    "giver": "the programme's dive lead",
    "site": "Shelf Checkout Site",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "situational-awareness",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Shelf Checkout Site",
        "text": "The dive lead meets you at Shelf Checkout Site and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"Twenty-two procedures that interrupt you while you work. Every station in this block is one you may already know the order of — the block is not testing the order. It is testing whether you notice the alarm, the person in the wrong place or the thing that moved while your hands and eyes were somewhere else. Miss one and it scores as an unsafe action, because that is what it is.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Situational Awareness — Interruption Drill — Opener"
    }
  },
  {
    "id": "dv-side-situational-awareness-capstone",
    "title": "Situational Awareness — Interruption Drill — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Shelf Checkout Site",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-situational-awareness-opener",
    "programmeId": "situational-awareness",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Shelf Checkout Site",
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
    "id": "dv-side-k12-science-opener",
    "title": "K-12 Science — First Dive",
    "giver": "the programme's dive lead",
    "site": "Shelf Checkout Site",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "k12-science",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Shelf Checkout Site",
        "text": "The dive lead meets you at Shelf Checkout Site and walks you to the first bench."
      },
      {
        "type": "station",
        "target": "k12-water-cycle-and-filtration",
        "text": "The cycle found in a real place and a layered filter tested against a control jar, with clearer never mistaken for safe to drink."
      },
      {
        "type": "station",
        "target": "k12-buoyancy-and-pressure-in-the-deep",
        "text": "Float or sink explained by the water's upward push, and pressure that grows with depth, tested fairly from the Deep's viewing platform with no depth figure stated."
      },
      {
        "type": "station",
        "target": "k12-circuits-at-the-electrical-bench",
        "text": "A complete loop, a switch, series and parallel on a checked low-voltage kit, with the mains named as the one thing a classroom circuit never touches."
      },
      {
        "type": "talk",
        "target": "dive-lead",
        "text": "\"Science by observation and fair test in the worlds: the water cycle and a filter at a treatment plant, buoyancy in the Deep, energy at the wind farm, low-voltage circuits, a kelp ecosystem, the sky, simple machines and a controlled experiment. Clearer is never mistaken for safe.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "K-12 Science — Opener"
    }
  },
  {
    "id": "dv-side-k12-science-capstone",
    "title": "K-12 Science — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Shelf Checkout Site",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-k12-science-opener",
    "programmeId": "k12-science",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Shelf Checkout Site",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "k12-lk-where-a-data-center-gets-its-power",
        "text": "Learners follow energy from a store to a generator, through a substation to computers and out as heat, general science for the power and cooling trades."
      },
      {
        "type": "station",
        "target": "k12-lk-how-a-wing-lifts-an-aircraft",
        "text": "Learners balance the four forces and find the wing tilt that gives lift, the science an aircraft mechanic checks on every walk-round."
      },
      {
        "type": "station",
        "target": "k12-lk-why-a-steel-boat-floats",
        "text": "Learners shape a hull that floats, load it to its mark and launch it down a slip, the science behind a bayou shipyard's work."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: No certificate: a completion record for the class. The lesson is aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance, to the INEE Minimum Standards for learning in low-resource and emergency settings and to the national curriculum framework the school itself follows; none of them certifies it, and no grade-level code is claimed\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "K-12 Science — Capstone"
    }
  },
  {
    "id": "dv-side-rigging-lifting-opener",
    "title": "Rigging and Lifting — First Dive",
    "giver": "the programme's dive lead",
    "site": "Shelf Lift Bag Site",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "rigging-lifting",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Shelf Lift Bag Site",
        "text": "The dive lead meets you at Shelf Lift Bag Site and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"Load, radius, chart, and what is under the load. Five lifts in five industries that all fail the same way.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Rigging and Lifting — Opener"
    }
  },
  {
    "id": "dv-side-rigging-lifting-capstone",
    "title": "Rigging and Lifting — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Shelf Lift Bag Site",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-rigging-lifting-opener",
    "programmeId": "rigging-lifting",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Shelf Lift Bag Site",
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
    "id": "dv-side-marine-ecology-and-restoration-opener",
    "title": "Marine Ecology & Restoration — Survey and Restoration Crews — First Dive",
    "giver": "the programme's dive lead",
    "site": "Eelgrass Transplant Plots",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "marine-ecology-and-restoration",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Eelgrass Transplant Plots",
        "text": "The dive lead meets you at Eelgrass Transplant Plots and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"Eight field methods a marine ecology and restoration crew runs on any survey or planting day: a kelp transect and its photo quadrats, a settlement-tile swap on a shellfish reef, seed collection and a flow-through nursery, water column sampling from a small boat, a hand-crew day opening a marsh channel, a fish visual census, a shoreline debris and microplastics survey, and the reporting method for a sighting that does not match the card. Every station teaches how a measurement is made repeatable and how a crew stays safe making it; none asserts a fact about any bay, species, count or date.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Marine Ecology & Restoration — Survey and Restoration Crews — Opener"
    }
  },
  {
    "id": "dv-side-marine-ecology-and-restoration-capstone",
    "title": "Marine Ecology & Restoration — Survey and Restoration Crews — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Eelgrass Transplant Plots",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-marine-ecology-and-restoration-opener",
    "programmeId": "marine-ecology-and-restoration",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Eelgrass Transplant Plots",
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
    "id": "dv-side-air-quality-monitoring-opener",
    "title": "Air Quality — Monitoring and Control — First Dive",
    "giver": "the programme's dive lead",
    "site": "Flats Sonde Station",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "air-quality-monitoring",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Flats Sonde Station",
        "text": "The dive lead meets you at Flats Sonde Station and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"The air a neighbourhood breathes is measured by a short chain of people and instruments, from a fence-line monitor to a stack test to a certified eye reading a plume, each one held to a different standard for a different reason. This block runs that chain end to end, from where the readings are taken to where the emissions actually come from.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Air Quality — Monitoring and Control — Opener"
    }
  },
  {
    "id": "dv-side-air-quality-monitoring-capstone",
    "title": "Air Quality — Monitoring and Control — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Flats Sonde Station",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-air-quality-monitoring-opener",
    "programmeId": "air-quality-monitoring",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Flats Sonde Station",
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
    "id": "dv-side-hunters-point-can-we-live-opener",
    "title": "Hunters Point Edition — Can We Live? — First Dive",
    "giver": "the programme's dive lead",
    "site": "Flats Sediment Core Site",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "hunters-point-can-we-live",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Flats Sediment Core Site",
        "text": "The dive lead meets you at Flats Sediment Core Site and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"A flagship built to be offered to the foundation and its partners: the sourced story of Marie Harrison and the foundation that carries her name, then stations in the skills a community science programme actually uses — air sensors, pollution patrol, biomonitoring with consent, fence-line dust and haul-route observation, split samples, radiological literacy, the HAZWOPER gate into cleanup work, and turning data into testimony. Every station is sited generically; the edition does not speak for the foundation.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Hunters Point Edition — Can We Live? — Opener"
    }
  },
  {
    "id": "dv-side-hunters-point-can-we-live-capstone",
    "title": "Hunters Point Edition — Can We Live? — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Flats Sediment Core Site",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-hunters-point-can-we-live-opener",
    "programmeId": "hunters-point-can-we-live",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Flats Sediment Core Site",
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
    "id": "dv-side-hazmat-environmental-opener",
    "title": "Hazmat and Environmental Response — First Dive",
    "giver": "the programme's dive lead",
    "site": "Outfall Diffuser Inspection",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "hazmat-environmental",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Outfall Diffuser Inspection",
        "text": "The dive lead meets you at Outfall Diffuser Inspection and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"Containment, decontamination and the numbers a neighbourhood relies on. This block runs from the release to the sample bottle, and opens with the real history of one site.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Hazmat and Environmental Response — Opener"
    }
  },
  {
    "id": "dv-side-hazmat-environmental-capstone",
    "title": "Hazmat and Environmental Response — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Outfall Diffuser Inspection",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-hazmat-environmental-opener",
    "programmeId": "hazmat-environmental",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Outfall Diffuser Inspection",
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
    "id": "dv-side-water-and-gas-utility-crews-opener",
    "title": "Water and Gas Utility Crews — Distribution Authority — First Dive",
    "giver": "the programme's dive lead",
    "site": "Outfall Diffuser Inspection",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "water-and-gas-utility-crews",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Outfall Diffuser Inspection",
        "text": "The dive lead meets you at Outfall Diffuser Inspection and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"Eight jobs a water or gas utility crew actually rotates through: a water main break shut down on the valve book's own two valves and excavated to a proven repair, a hydrant flow-tested behind a cone taper with the residual watched the whole time it flows, a gas main hand-exposed inside its own staked tolerance zone, a meter set on a proven riser and torqued straight, a steel main's cathodic protection read at a rectifier locked out before its cabinet opens, a PE main squeezed off and fused on clean faces, a treatment plant's chemical delivery proven against its own label before a hose ever connects, and a storm-darkened lift station brought back up on a generator whose cable never touches the transfer switch until the utility feed is proven dead. Every station ends on a proof — a gauge, a logged reading, a bead inspected — rather than on how safe the job looked going in.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Water and Gas Utility Crews — Distribution Authority — Opener"
    }
  },
  {
    "id": "dv-side-water-and-gas-utility-crews-capstone",
    "title": "Water and Gas Utility Crews — Distribution Authority — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Outfall Diffuser Inspection",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-water-and-gas-utility-crews-opener",
    "programmeId": "water-and-gas-utility-crews",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Outfall Diffuser Inspection",
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
    "id": "dv-side-confined-space-opener",
    "title": "Confined Space — Entry and Rescue — First Dive",
    "giver": "the programme's dive lead",
    "site": "Outfall Intake Lockout Site",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "confined-space",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Outfall Intake Lockout Site",
        "text": "The dive lead meets you at Outfall Intake Lockout Site and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"Four spaces and the rescue. The first three build the permit, the atmosphere and the attendant; the last one is what happens when all of that failed for somebody else.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Confined Space — Entry and Rescue — Opener"
    }
  },
  {
    "id": "dv-side-confined-space-capstone",
    "title": "Confined Space — Entry and Rescue — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Outfall Intake Lockout Site",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-confined-space-opener",
    "programmeId": "confined-space",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Outfall Intake Lockout Site",
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
    "id": "dv-side-port-operations-opener",
    "title": "Port and Terminal Operations — First Dive",
    "giver": "the programme's dive lead",
    "site": "Approach Buoy Tender Station",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "port-operations",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Approach Buoy Tender Station",
        "text": "The dive lead meets you at Approach Buoy Tender Station and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"A ship comes alongside, is secured, is fuelled, is worked and leaves. Its stations follow that order, each with a different way to put oil or steel where it should not be.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Port and Terminal Operations — Opener"
    }
  },
  {
    "id": "dv-side-port-operations-capstone",
    "title": "Port and Terminal Operations — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Approach Buoy Tender Station",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-port-operations-opener",
    "programmeId": "port-operations",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Approach Buoy Tender Station",
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
    "id": "dv-side-ports-maritime-ecology-opener",
    "title": "Ports, Maritime and Bay Ecology — First Dive",
    "giver": "the programme's dive lead",
    "site": "Approach Buoy Tender Station",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "ports-maritime-ecology",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Approach Buoy Tender Station",
        "text": "The dive lead meets you at Approach Buoy Tender Station and walks you to the first bench."
      },
      {
        "type": "station",
        "target": "ballast-water-sampling",
        "text": "The inspection that happens before that same ship ever reaches a working berth: record book and treatment certificate checked, a sample drawn under chain of custody, and the discharge held until the number comes back."
      },
      {
        "type": "station",
        "target": "spill-boom-deploy",
        "text": "The response when a transfer or a hookup goes wrong anyway: the source secured, a J-boom worked against the current, and the bay kept out of it."
      },
      {
        "type": "station",
        "target": "pilot-transfer",
        "text": "The harbour pilot brought aboard by ladder in open water, where the transfer itself is the highest-risk minute of the whole call."
      },
      {
        "type": "talk",
        "target": "dive-lead",
        "text": "\"A working port and the bay it sits on, worked by the trades that share the same quay: cargo secured and moved, a ship cold-ironed instead of idling, fuel and lines handled without a drop or a hand in the wrong place, and a spill contained before it ever reaches open water.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Ports, Maritime and Bay Ecology — Opener"
    }
  },
  {
    "id": "dv-side-ports-maritime-ecology-capstone",
    "title": "Ports, Maritime and Bay Ecology — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Approach Buoy Tender Station",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-ports-maritime-ecology-opener",
    "programmeId": "ports-maritime-ecology",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Approach Buoy Tender Station",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "spill-boom-deploy",
        "text": "The response when a transfer or a hookup goes wrong anyway: the source secured, a J-boom worked against the current, and the bay kept out of it."
      },
      {
        "type": "station",
        "target": "pilot-transfer",
        "text": "The harbour pilot brought aboard by ladder in open water, where the transfer itself is the highest-risk minute of the whole call."
      },
      {
        "type": "station",
        "target": "mooring-line",
        "text": "Taking the lines that hold the ship to all of this: snap-back zones and the bight nobody stands in."
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
    "id": "dv-side-bridge-and-structural-opener",
    "title": "Bridge and Structural Trades — First Dive",
    "giver": "the programme's dive lead",
    "site": "Channel Scour Survey",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "bridge-and-structural",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Channel Scour Survey",
        "text": "The dive lead meets you at Channel Scour Survey and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"The bridge as a workplace: cable and hanger inspection at height, lead-paint containment on a truss, deck joint replacement under traffic control, and the erection work the structural programme already teaches.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Bridge and Structural Trades — Opener"
    }
  },
  {
    "id": "dv-side-bridge-and-structural-capstone",
    "title": "Bridge and Structural Trades — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Channel Scour Survey",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-bridge-and-structural-opener",
    "programmeId": "bridge-and-structural",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Channel Scour Survey",
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
    "id": "dv-side-first-responders-opener",
    "title": "First Responders — Fire, EMS, Police, Crisis and Relief — First Dive",
    "giver": "the programme's dive lead",
    "site": "Seamount Capstone Survey",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "first-responders",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Seamount Capstone Survey",
        "text": "The dive lead meets you at Seamount Capstone Survey and walks you to the first bench."
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
        "target": "dive-lead",
        "text": "\"Stations for the people who run toward the call, with the human side scored as procedure: size-up and rehab on the fireground, cardiac arrest as a pit crew, an overdose reversed, a crisis call de-escalated, a critical incident debriefed, trauma-informed intake and a home visit, a shelter opened and a damage-assessment team sent out, and psychological first aid. Every station closes with the crew's own check-in and the peer-support line the department uses.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "First Responders — Fire, EMS, Police, Crisis and Relief — Opener"
    }
  },
  {
    "id": "dv-side-first-responders-capstone",
    "title": "First Responders — Fire, EMS, Police, Crisis and Relief — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Seamount Capstone Survey",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-first-responders-opener",
    "programmeId": "first-responders",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Seamount Capstone Survey",
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
    "id": "dv-side-wind-and-data-infrastructure-opener",
    "title": "Wind & Data Infrastructure — First Dive",
    "giver": "the programme's dive lead",
    "site": "Mud Plain Data Pod Skid",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "wind-and-data-infrastructure",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Mud Plain Data Pod Skid",
        "text": "The dive lead meets you at Mud Plain Data Pod Skid and walks you to the first bench."
      },
      {
        "type": "station",
        "target": "ws-turbine-climb-and-rescue-kit-check",
        "text": "The climb is decided on the ground: the wind read against the site's limit, the harness walked by hand, the rescue kit opened and a second climber confirmed before the runner goes on the rail."
      },
      {
        "type": "station",
        "target": "ws-nacelle-lockout-and-yaw-brake-fault",
        "text": "A stopped rotor is not a locked one, so the crew stops it locally, drives the rotor lock home, proves the yaw held and bleeds the stored energy before a start that must not happen."
      },
      {
        "type": "station",
        "target": "ws-blade-inspection-from-a-platform",
        "text": "The wind decides whether a suspended platform leaves the ground and keeps deciding while it is up, and every defect on the blade is photographed and reported rather than guessed at."
      },
      {
        "type": "talk",
        "target": "dive-lead",
        "text": "\"Eight jobs across a ridge wind farm, a data hall under construction and an ocean data pod: the climb proven on the ground, the nacelle locked and its yaw held, the blade platform's wind go/no-go, collector switching to a written order, a busway torqued and signed, one floor tile out and attended, a CRAH alarm answered in a live hall, and a sealed pod landed and isolated before its hatch opens. Each station runs with a declared ?fault= that changes the scene and one step's right answer, and no figure is ever stated — the manual, the order and the plans hold them.\""
      }
    ],
    "reward": {
      "xp": 100,
      "badge": "Wind & Data Infrastructure — Opener"
    }
  },
  {
    "id": "dv-side-wind-and-data-infrastructure-capstone",
    "title": "Wind & Data Infrastructure — Capstone Dive",
    "giver": "the programme's certifying evaluator",
    "site": "Mud Plain Data Pod Skid",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-wind-and-data-infrastructure-opener",
    "programmeId": "wind-and-data-infrastructure",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Mud Plain Data Pod Skid",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "ws-raised-floor-tile-lift-and-cable-tray-safety",
        "text": "One tile out in a live hall is an opening, an airflow change and a plenum of power and data, so it is barricaded first, attended throughout and reseated flush."
      },
      {
        "type": "station",
        "target": "ws-crah-alarm-response-in-a-live-hall",
        "text": "An air-handler alarm is answered as a sequence — read, report, walk down, standby on and the hall watched back — before the failed unit is isolated and proven dead."
      },
      {
        "type": "station",
        "target": "ws-ocean-pod-retrieval-and-hatch-opening",
        "text": "A sealed pod comes aboard to the lift plan with the diver out of the water, is fastened and its cable locked out, and its leak lamp is read before a single hatch bolt turns."
      },
      {
        "type": "talk",
        "target": "certifying-evaluator",
        "text": "\"Certified under: Programme completion record; the credentials it rehearses are issued only by their own bodies — 29 CFR 1910.269 and 29 CFR 1910.147 for the turbine, the substation and the hall, NFPA 70E for every absence-of-voltage test, ANSI Z359 for the tower and the platform, NFPA 70 (NEC) and BICSI practice for the busway and the pathway; every height, wind, voltage, torque, load, depth and limit lives in the manufacturer's manual, the switching order, the lift plan or the dive plan\""
      }
    ],
    "reward": {
      "xp": 250,
      "badge": "Wind & Data Infrastructure — Capstone"
    }
  }
];

export const DV_EGG_DIVES = [
  {
    "id": "dv-egg-ladder-lead",
    "title": "Lantern — Pier Ladder",
    "giver": "found, not given",
    "site": "Pier Ladder",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Pier Ladder",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "br-dive-tender-and-umbilical-management",
      "stepId": "lead-umbilical"
    },
    "lesson": "Every time the diver moves, the umbilical saws back and forth over whatever it crosses at the side, and a sharp rail corner or ladder edge cuts through its jacket in a morning.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Pier Ladder",
        "text": "Swim to Pier Ladder and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-ladder-lead",
        "text": "Clipped beside the lantern at Pier Ladder, a field note reads: \"Every time the diver moves, the umbilical saws back and forth over whatever it crosses at the side, and a sharp rail corner or ladder edge cuts through its jacket in a morning.\""
      }
    ]
  },
  {
    "id": "dv-egg-pile-zones",
    "title": "Lantern — Pier Piling Forest",
    "giver": "found, not given",
    "site": "Pier Piling Forest",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Pier Piling Forest",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "mw-pier-pile-inspection-dive",
      "stepId": "pile-one"
    },
    "lesson": "A pier pile is inspected where it fails: in the splash and tidal zone where the cover spalls and the steel starts to rust, and at the mudline where scour and abrasion take the section away.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Pier Piling Forest",
        "text": "Swim to Pier Piling Forest and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-pile-zones",
        "text": "Clipped beside the lantern at Pier Piling Forest, a field note reads: \"A pier pile is inspected where it fails: in the splash and tidal zone where the cover spalls and the steel starts to rust, and at the mudline where scour and abrasion take the section away.\""
      }
    ]
  },
  {
    "id": "dv-egg-gauge-riddle",
    "title": "Lantern — Tide Gauge Post",
    "giver": "found, not given",
    "site": "Tide Gauge Post",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Tide Gauge Post",
    "method": "comms",
    "cites": {
      "app": "smartcity",
      "stationId": "tide-gate",
      "stepId": "flood-early"
    },
    "lesson": "A tide table is a prediction built on an average year, and wind, barometric pressure and a wet season upstream can all push a real tide ahead of the printed time.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "talk",
        "target": "supervisor-comms",
        "text": "The supervisor's voice over the comms: \"The table said one time and the water says another — which one do you believe, and why?\""
      },
      {
        "type": "find",
        "target": "dv-egg-gauge-riddle",
        "text": "The comms clear and the note follows: \"A tide table is a prediction built on an average year, and wind, barometric pressure and a wet season upstream can all push a real tide ahead of the printed time.\""
      }
    ]
  },
  {
    "id": "dv-egg-quadrat-stake",
    "title": "Lantern — Shelf Boulder Garden",
    "giver": "found, not given",
    "site": "Shelf Boulder Garden",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Shelf Boulder Garden",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "oyster-reef-monitoring",
      "stepId": "quadrat-locate"
    },
    "lesson": "A permanent quadrat is permanent so the exact same square metre of reef gets measured every single quarter, and that only works if the crew finds the tagged stake the last crew left rather than a spot that merely looks about right — a density count from the wrong metre of reef is not comparable to last quarter's and cannot join the trend the whole monitoring program depends on.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Shelf Boulder Garden",
        "text": "Swim to Shelf Boulder Garden and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-quadrat-stake",
        "text": "Clipped beside the lantern at Shelf Boulder Garden, a field note reads: \"A permanent quadrat is permanent so the exact same square metre of reef gets measured every single quarter, and that only works if the crew finds the tagged stake the last crew left rather than a spot that merely looks about right — a density count from the wrong metre of reef is not comparable to last quarter's and cannot join the trend the whole monitoring program depends on.\""
      }
    ]
  },
  {
    "id": "dv-egg-slack-water",
    "title": "Lantern — Eelgrass Meadow Edge",
    "giver": "found, not given",
    "site": "Eelgrass Meadow Edge",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Eelgrass Meadow Edge",
    "method": "comms",
    "cites": {
      "app": "smartcity",
      "stationId": "eelgrass-transplant",
      "stepId": "tide-window"
    },
    "lesson": "A diver working against a running current burns air and energy fast and drifts off the grid on every breath; the plan's tide window exists because slack water is the only time a planting dive on a fixed grid is actually a controlled dive rather than a fight with the current.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "talk",
        "target": "supervisor-comms",
        "text": "The comms crackle: \"You're drifting off the grid on every breath — what did the plan say about the tide, and why?\""
      },
      {
        "type": "find",
        "target": "dv-egg-slack-water",
        "text": "The comms clear and the note follows: \"A diver working against a running current burns air and energy fast and drifts off the grid on every breath; the plan's tide window exists because slack water is the only time a planting dive on a fixed grid is actually a controlled dive rather than a fight with the current.\""
      }
    ]
  },
  {
    "id": "dv-egg-hull-overhead",
    "title": "Lantern — Eelgrass Nursery Plots",
    "giver": "found, not given",
    "site": "Eelgrass Nursery Plots",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Eelgrass Nursery Plots",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "eelgrass-transplant",
      "stepId": "vessel-incursion"
    },
    "lesson": "A diver working a grid a few feet down cannot see or hear a hull approaching from the surface, and a vessel inside the exclusion zone with a diver still under it is the single most common way a commercial dive turns into a fatality.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Eelgrass Nursery Plots",
        "text": "Swim to Eelgrass Nursery Plots and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-hull-overhead",
        "text": "Clipped beside the lantern at Eelgrass Nursery Plots, a field note reads: \"A diver working a grid a few feet down cannot see or hear a hull approaching from the surface, and a vessel inside the exclusion zone with a diver still under it is the single most common way a commercial dive turns into a fatality.\""
      }
    ]
  },
  {
    "id": "dv-egg-upcurrent-anchor",
    "title": "Lantern — Marsh Mouth Sandbar",
    "giver": "found, not given",
    "site": "Marsh Mouth Sandbar",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Marsh Mouth Sandbar",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "br-turbidity-curtain-deployment",
      "stepId": "lower-anchor"
    },
    "lesson": "The curtain is laid from its upcurrent end so the current streams it down along its alignment instead of peeling it off; the upcurrent anchor goes down first and holds everything that follows.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Marsh Mouth Sandbar",
        "text": "Swim to Marsh Mouth Sandbar and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-upcurrent-anchor",
        "text": "Clipped beside the lantern at Marsh Mouth Sandbar, a field note reads: \"The curtain is laid from its upcurrent end so the current streams it down along its alignment instead of peeling it off; the upcurrent anchor goes down first and holds everything that follows.\""
      }
    ]
  },
  {
    "id": "dv-egg-turbidity-proof",
    "title": "Lantern — Sonde Mooring",
    "giver": "found, not given",
    "site": "Sonde Mooring",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Sonde Mooring",
    "method": "comms",
    "cites": {
      "app": "smartcity",
      "stationId": "br-water-quality-sonde-calibration-and-deploy",
      "stepId": "turbidity-check"
    },
    "lesson": "Turbidity is the reading the dredge will be stopped on, so after it is calibrated it is proved against a check standard the calibration did not use.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "talk",
        "target": "supervisor-comms",
        "text": "The supervisor asks over the comms: \"The sonde's calibrated — so what else has to happen before the dredge is stopped on its word?\""
      },
      {
        "type": "find",
        "target": "dv-egg-turbidity-proof",
        "text": "The comms clear and the note follows: \"Turbidity is the reading the dredge will be stopped on, so after it is calibrated it is proved against a check standard the calibration did not use.\""
      }
    ]
  },
  {
    "id": "dv-egg-bank-buddy",
    "title": "Lantern — Outfall Diffuser",
    "giver": "found, not given",
    "site": "Outfall Diffuser",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Outfall Diffuser",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "stormwater-outfall",
      "stepId": "buddy-steps-away"
    },
    "lesson": "A stormwater grab is worked at the edge of moving water in the rain that caused the discharge in the first place, and the second person on the bank is the entire emergency plan if the footing gives way.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Outfall Diffuser",
        "text": "Swim to Outfall Diffuser and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-bank-buddy",
        "text": "Clipped beside the lantern at Outfall Diffuser, a field note reads: \"A stormwater grab is worked at the edge of moving water in the rain that caused the discharge in the first place, and the second person on the bank is the entire emergency plan if the footing gives way.\""
      }
    ]
  },
  {
    "id": "dv-egg-slow-baseline",
    "title": "Lantern — Kelp Cathedral",
    "giver": "found, not given",
    "site": "Kelp Cathedral",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Kelp Cathedral",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "br-underwater-debris-survey-and-mapping",
      "stepId": "swim-baseline"
    },
    "lesson": "The first pass along the baseline is what finds the debris, and it is swum slowly and level so the fins do not lift the silt into a cloud that hides everything behind you.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Kelp Cathedral",
        "text": "Swim to Kelp Cathedral and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-slow-baseline",
        "text": "Clipped beside the lantern at Kelp Cathedral, a field note reads: \"The first pass along the baseline is what finds the debris, and it is swum slowly and level so the fins do not lift the silt into a cloud that hides everything behind you.\""
      }
    ]
  },
  {
    "id": "dv-egg-holdfast-upcurrent",
    "title": "Lantern — Holdfast Ledge",
    "giver": "found, not given",
    "site": "Holdfast Ledge",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Holdfast Ledge",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "br-derelict-gear-recovery-dive",
      "stepId": "hold-upcurrent"
    },
    "lesson": "Up-current of a net, the water carries the netting away from you; down-current, it carries it onto you.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Holdfast Ledge",
        "text": "Swim to Holdfast Ledge and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-holdfast-upcurrent",
        "text": "Clipped beside the lantern at Holdfast Ledge, a field note reads: \"Up-current of a net, the water carries the netting away from you; down-current, it carries it onto you.\""
      }
    ]
  },
  {
    "id": "dv-egg-follow-line",
    "title": "Lantern — Marsh Drift Line",
    "giver": "found, not given",
    "site": "Marsh Drift Line",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Marsh Drift Line",
    "method": "comms",
    "cites": {
      "app": "smartcity",
      "stationId": "mw-diver-emergency-and-recovery",
      "stepId": "follow-umbilical"
    },
    "lesson": "In low visibility the working diver's umbilical is the only certain path to him: it goes exactly where he went, round whatever he went round.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "talk",
        "target": "supervisor-comms",
        "text": "The comms break in: \"Visibility's gone and your buddy's somewhere ahead — what's the one certain path to him?\""
      },
      {
        "type": "find",
        "target": "dv-egg-follow-line",
        "text": "The comms clear and the note follows: \"In low visibility the working diver's umbilical is the only certain path to him: it goes exactly where he went, round whatever he went round.\""
      }
    ]
  },
  {
    "id": "dv-egg-straight-core",
    "title": "Lantern — Reef Ball Rows",
    "giver": "found, not given",
    "site": "Reef Ball Rows",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Reef Ball Rows",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "br-underwater-sediment-core-sampling",
      "stepId": "push-core"
    },
    "lesson": "A push core is a record of the sediment layer by layer, and it only stays a record if the tube goes in steadily and straight: twisting smears the layers into each other, bouncing compacts them and a tube pushed at an angle takes a longer, distorted core.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Reef Ball Rows",
        "text": "Swim to Reef Ball Rows and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-straight-core",
        "text": "Clipped beside the lantern at Reef Ball Rows, a field note reads: \"A push core is a record of the sediment layer by layer, and it only stays a record if the tube goes in steadily and straight: twisting smears the layers into each other, bouncing compacts them and a tube pushed at an angle takes a longer, distorted core.\""
      }
    ]
  },
  {
    "id": "dv-egg-cap-first",
    "title": "Lantern — Settlement Tile Rack",
    "giver": "found, not given",
    "site": "Settlement Tile Rack",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Settlement Tile Rack",
    "method": "comms",
    "cites": {
      "app": "smartcity",
      "stationId": "br-underwater-sediment-core-sampling",
      "stepId": "cap-core"
    },
    "lesson": "The top cap goes on first because it seals the tube and the suction then holds the core in while the bottom is dug out; a tube lifted open at the top drops its core back onto the bottom on the way out.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "talk",
        "target": "supervisor-comms",
        "text": "The sampling lead over the comms: \"Core's in. Which cap goes on first, and what happens if you get it backwards?\""
      },
      {
        "type": "find",
        "target": "dv-egg-cap-first",
        "text": "The comms clear and the note follows: \"The top cap goes on first because it seals the tube and the suction then holds the core in while the bottom is dug out; a tube lifted open at the top drops its core back onto the bottom on the way out.\""
      }
    ]
  },
  {
    "id": "dv-egg-screw-locked",
    "title": "Lantern — Channel Marker Chain",
    "giver": "found, not given",
    "site": "Channel Marker Chain",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Channel Marker Chain",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "mw-dive-supervisor-and-dive-plan",
      "stepId": "lockout-and-flag"
    },
    "lesson": "A turning propeller near a diver's umbilical is one of the ways commercial divers die, and the dive boat's own screw is the one the team controls completely: its controls are locked and tagged before anyone is in the water.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Channel Marker Chain",
        "text": "Swim to Channel Marker Chain and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-screw-locked",
        "text": "Clipped beside the lantern at Channel Marker Chain, a field note reads: \"A turning propeller near a diver's umbilical is one of the ways commercial divers die, and the dive boat's own screw is the one the team controls completely: its controls are locked and tagged before anyone is in the water.\""
      }
    ]
  },
  {
    "id": "dv-egg-steady-pace",
    "title": "Lantern — Approach Buoy Chain",
    "giver": "found, not given",
    "site": "Approach Buoy Chain",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Approach Buoy Chain",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "uw-pipeline-crossing-inspection-dive",
      "stepId": "swim-crossing"
    },
    "lesson": "The whole crossing has to be swum at one steady pace for the survey to mean anything, because a diver who speeds up past the boring stretches and slows down only at defects has decided in advance what counts as worth seeing.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Approach Buoy Chain",
        "text": "Swim to Approach Buoy Chain and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-steady-pace",
        "text": "Clipped beside the lantern at Approach Buoy Chain, a field note reads: \"The whole crossing has to be swum at one steady pace for the survey to mean anything, because a diver who speeds up past the boring stretches and slows down only at defects has decided in advance what counts as worth seeing.\""
      }
    ]
  },
  {
    "id": "dv-egg-ground-first",
    "title": "Lantern — The Wreck's Bow",
    "giver": "found, not given",
    "site": "The Wreck's Bow",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Wreck's Bow",
    "method": "comms",
    "cites": {
      "app": "smartcity",
      "stationId": "mw-underwater-welding-and-cutting",
      "stepId": "ground-and-switch"
    },
    "lesson": "The order is the whole of the electrical safety: the ground goes on first, on clean steel close to the work and placed so the diver faces it across the arc, and only then is the switch called hot.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "talk",
        "target": "supervisor-comms",
        "text": "The comms: \"Before anyone calls 'make it hot' — what goes on first, and where?\""
      },
      {
        "type": "find",
        "target": "dv-egg-ground-first",
        "text": "The comms clear and the note follows: \"The order is the whole of the electrical safety: the ground goes on first, on clean steel close to the work and placed so the diver faces it across the arc, and only then is the switch called hot.\""
      }
    ]
  },
  {
    "id": "dv-egg-pin-then-wire",
    "title": "Lantern — The Wreck's Stern",
    "giver": "found, not given",
    "site": "The Wreck's Stern",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Wreck's Stern",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "uw-lift-bag-rigging-and-object-recovery",
      "stepId": "rig-bridle"
    },
    "lesson": "A pin has to actually be through the eye and screwed home before mousing it means anything, so the order is pin first, wire second — never the other way round.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "The Wreck's Stern",
        "text": "Swim to The Wreck's Stern and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-pin-then-wire",
        "text": "Clipped beside the lantern at The Wreck's Stern, a field note reads: \"A pin has to actually be through the eye and screwed home before mousing it means anything, so the order is pin first, wire second — never the other way round.\""
      }
    ]
  },
  {
    "id": "dv-egg-bight",
    "title": "Lantern — Mud Plain Mooring Block",
    "giver": "found, not given",
    "site": "Mud Plain Mooring Block",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Mud Plain Mooring Block",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "mooring-line",
      "stepId": "hand-in-the-bight"
    },
    "lesson": "A bight on the deck closes at drum speed the moment the slack comes out of it, and it closes on whatever is inside.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Mud Plain Mooring Block",
        "text": "Swim to Mud Plain Mooring Block and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-bight",
        "text": "Clipped beside the lantern at Mud Plain Mooring Block, a field note reads: \"A bight on the deck closes at drum speed the moment the slack comes out of it, and it closes on whatever is inside.\""
      }
    ]
  },
  {
    "id": "dv-egg-chamber-plan",
    "title": "Lantern — Trench Lip",
    "giver": "found, not given",
    "site": "Trench Lip",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Trench Lip",
    "method": "comms",
    "cites": {
      "app": "smartcity",
      "stationId": "br-hyperbaric-chamber-standby",
      "stepId": "standby-brief"
    },
    "lesson": "A chamber standing by a decompression dive is part of the dive plan, not an afterthought on the deck.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "talk",
        "target": "supervisor-comms",
        "text": "The supervisor over the comms: \"There's a chamber on the deck above you. Is it an afterthought, or part of something?\""
      },
      {
        "type": "find",
        "target": "dv-egg-chamber-plan",
        "text": "The comms clear and the note follows: \"A chamber standing by a decompression dive is part of the dive plan, not an afterthought on the deck.\""
      }
    ]
  },
  {
    "id": "dv-egg-benchmark",
    "title": "Lantern — Seamount Pinnacle",
    "giver": "found, not given",
    "site": "Seamount Pinnacle",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Seamount Pinnacle",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "uw-bridge-pier-scour-survey",
      "stepId": "find-benchmark"
    },
    "lesson": "Nothing you read today means anything by itself — a scour depth only matters next to the number someone wrote down at this same pier a year ago, and the benchmark plate is the single elevation that ties this dive to that one.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Seamount Pinnacle",
        "text": "Swim to Seamount Pinnacle and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-benchmark",
        "text": "Clipped beside the lantern at Seamount Pinnacle, a field note reads: \"Nothing you read today means anything by itself — a scour depth only matters next to the number someone wrote down at this same pier a year ago, and the benchmark plate is the single elevation that ties this dive to that one.\""
      }
    ]
  },
  {
    "id": "dv-egg-pfd-gasp",
    "title": "Lantern — The Old Anchor",
    "giver": "found, not given",
    "site": "The Old Anchor",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Old Anchor",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "br-cold-water-immersion-and-mob-recovery",
      "stepId": "pfd-on"
    },
    "lesson": "The first moments in cold water bring a gasp and a loss of breath control that a person cannot choose to stop, and a PFD is what keeps the mouth clear of the water through it.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "The Old Anchor",
        "text": "Swim to The Old Anchor and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-pfd-gasp",
        "text": "Clipped beside the lantern at The Old Anchor, a field note reads: \"The first moments in cold water bring a gasp and a loss of breath control that a person cannot choose to stop, and a PFD is what keeps the mouth clear of the water through it.\""
      }
    ]
  },
  {
    "id": "dv-egg-prove-zero",
    "title": "Lantern — Outfall Pipe Run",
    "giver": "found, not given",
    "site": "Outfall Pipe Run",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Outfall Pipe Run",
    "method": "comms",
    "cites": {
      "app": "smartcity",
      "stationId": "uw-intake-screen-cleaning-with-lockout",
      "stepId": "verify-zero-energy"
    },
    "lesson": "A lockout is not proven by looking at the breaker — it is proven by trying to start whatever it feeds and watching nothing happen.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "talk",
        "target": "supervisor-comms",
        "text": "The supervisor over the comms: \"The breaker's open and the lock is on. So is the intake locked out yet — how do you know?\""
      },
      {
        "type": "find",
        "target": "dv-egg-prove-zero",
        "text": "The comms clear and the note follows: \"A lockout is not proven by looking at the breaker — it is proven by trying to start whatever it feeds and watching nothing happen.\""
      }
    ]
  },
  {
    "id": "dv-egg-plan-is-the-dive",
    "title": "Lantern — Trench Floor Cairn",
    "giver": "found, not given",
    "site": "Trench Floor Cairn",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "Trench Floor Cairn",
    "method": "lantern",
    "cites": {
      "app": "smartcity",
      "stationId": "mw-dive-supervisor-and-dive-plan",
      "stepId": "dive-plan"
    },
    "lesson": "The dive plan is the dive: 29 CFR 1910 Subpart T has the employer's safe practices manual and the plan for each dive set out the task, the limits and the emergency procedures, and the brief is where every member of the team hears the same version of it.",
    "reward": {
      "xp": 25,
      "badge": "Lantern"
    },
    "steps": [
      {
        "type": "goto",
        "target": "Trench Floor Cairn",
        "text": "Swim to Trench Floor Cairn and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-plan-is-the-dive",
        "text": "Clipped beside the lantern at Trench Floor Cairn, a field note reads: \"The dive plan is the dive: 29 CFR 1910 Subpart T has the employer's safe practices manual and the plan for each dive set out the task, the limits and the emergency procedures, and the brief is where every member of the team hears the same version of it.\""
      }
    ]
  }
];

export const DV_ACTIVITIES = [
  {
    "id": "dv-activity-kelp-transect",
    "title": "Kelp Transect Time Trial",
    "kind": "time-trial",
    "line": "kelp-transect",
    "site": "Kelp Transect Start",
    "description": "Swim the kelp transect checkpoint to checkpoint against the clock, level and steady so the fins never lift the silt.",
    "scoring": {
      "time": true,
      "checkpoints": 5
    }
  },
  {
    "id": "dv-activity-wreck-photo",
    "title": "Wreck Photo Survey",
    "kind": "photo",
    "landmark": "The Wreck's Bow",
    "site": "Wreck Photo Survey",
    "description": "A non-competitive photo survey: frame the hull from every marked viewpoint around the bow.",
    "scoring": {
      "competitive": false,
      "viewpointsToFrame": 6
    }
  },
  {
    "id": "dv-activity-debris-sweep",
    "title": "Debris Sweep",
    "kind": "sweep",
    "site": "Shelf Debris Sweep",
    "description": "Collect the marked debris across the shelf before the timer runs out — and flag, never lift, the items marked hazardous, which wait for the work plan.",
    "scoring": {
      "time": true,
      "seconds": 180,
      "items": 8,
      "hazardousItems": 2,
      "collectedPoints": 1,
      "flaggedPoints": 2
    }
  },
  {
    "id": "dv-activity-marsh-drift",
    "title": "Marsh-Mouth Drift",
    "kind": "drift",
    "line": "marsh-drift-transect",
    "site": "Marsh Mouth Culvert",
    "description": "Ride the ebb out of the marsh channel and hold the corridor between the stakes for the whole run.",
    "scoring": {
      "seconds": 90,
      "corridorHalfWidth": 8,
      "heldFraction": true
    }
  }
];

export const DV_LANDMARK_NOTES = {
  "Pier Piling Forest": "Rows of piles under the pier deck, each one furred with growth and ringed by the shadows of the planks above.",
  "Pier Ladder": "A steel ladder bolted to the pier's landward face — the surface-supplied crews' way in and out.",
  "Shelf Boulder Garden": "A scatter of rounded boulders on bright sand, the first thing a new diver learns to navigate around.",
  "The Old Anchor": "A stock anchor half buried in the sand, a favourite turning mark for the shelf swim.",
  "Eelgrass Meadow Edge": "The line where the sand gives way to swaying grass, staked with the survey transect's end markers.",
  "Eelgrass Nursery Plots": "Gridded transplant plots pegged out in the meadow, each corner flagged for the monitoring divers.",
  "Marsh Mouth Sandbar": "A ridge of sand where the marsh channel drops its load, shifting a little with every big tide.",
  "Marsh Drift Line": "A buoyed line across the channel mouth that drift surveys follow with the ebb.",
  "Kelp Cathedral": "The grandest stand in the forest, where the stipes rise like columns and the canopy closes overhead.",
  "Holdfast Ledge": "A rock ledge at the forest's edge where the kelp holdfasts grip and the photo quadrats are laid.",
  "Tide Gauge Post": "A graduated post standing on the flats, its face read by every survey team on the way out.",
  "Sonde Mooring": "A weighted mooring with a water-quality sonde clipped to its riser, serviced on a schedule the crew holds.",
  "Outfall Diffuser": "The ported end of an outfall pipe on its rock apron, the discharge zone flagged on every dive plan.",
  "Outfall Pipe Run": "The buried-and-exposed run of pipe leading out to the diffuser, marked with stakes along its length.",
  "Approach Buoy Chain": "A line of buoy moorings whose chains drop from the surface at the channel's western approach.",
  "Channel Marker Chain": "The moorings of the channel markers, each chain rising out of sight to a lit buoy overhead.",
  "Reef Ball Rows": "Hollow concrete domes in tidy rows, set out on the bottom for the monitoring programme.",
  "Settlement Tile Rack": "A steel rack of tiles left on the bottom for whatever settles, photographed on a schedule the crew holds.",
  "Mud Plain Mooring Block": "A concrete mooring block sunk in the mud, its chain the only fixed thing on the plain.",
  "The Wreck's Bow": "The upright bow of an old workboat hull in the hollow, its rail still readable under the growth.",
  "The Wreck's Stern": "The hull's stern, settled deeper in the scour, where the survey photo line ends.",
  "Trench Lip": "The edge where the mud plain drops away into the dark — the turnaround point on most dive plans.",
  "Trench Floor Cairn": "A stacked-stone marker on the trench floor left by the ROV crews as a survey datum.",
  "Seamount Pinnacle": "The mount's top, in brighter water, ringed by the transect pins of the capstone survey.",
  "Seamount Saddle": "A dip between the pinnacle and a lower shoulder where the ascent line to the surface is set."
};
