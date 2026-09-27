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
    "site": "Pier Dive Station",
    "kind": "main",
    "tier": 1,
    "requires": null,
    "steps": [
      {
        "type": "goto",
        "target": "Pier Dive Station",
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
    "site": "Shelf Training Ground",
    "kind": "main",
    "tier": 2,
    "requires": "dv-main-00-pilings",
    "steps": [
      {
        "type": "goto",
        "target": "Shelf Training Ground",
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
        "target": "The Tide-Gauge Post",
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
    "site": "Meadow Transplant Grid",
    "kind": "main",
    "tier": 3,
    "requires": "dv-main-01-shelf",
    "steps": [
      {
        "type": "goto",
        "target": "Meadow Transplant Grid",
        "text": "Grass blades bend with the tide over a planting grid of numbered stakes."
      },
      {
        "type": "talk",
        "target": "transplant-lead",
        "text": "\"The grid is the survey. Every shoot has a stake, every stake has a number, and the supervisor never gets in the water.\""
      },
      {
        "type": "station",
        "target": "eelgrass-transplant",
        "text": "The habitat the fill once displaced, replanted underwater: a donor bed cut to its share, shoots bundled inside the clock, and a diver directed to the grid by a supervisor who never gets in the water."
      },
      {
        "type": "find",
        "target": "The Quadrat Grid",
        "text": "Find the quadrat grid's corner stake and note its tag."
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
    "title": "Cores and Reef Balls",
    "giver": "the sampling lead",
    "site": "Reef Core Station",
    "kind": "main",
    "tier": 4,
    "requires": "dv-main-02-meadow",
    "steps": [
      {
        "type": "goto",
        "target": "Reef Core Station",
        "text": "Reef balls on a grid, a core rack on the seabed, the sampling lead pointing at the station marker."
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
    "site": "Pinnacle Survey",
    "kind": "main",
    "tier": 6,
    "requires": "dv-main-04-wreck",
    "steps": [
      {
        "type": "goto",
        "target": "Pinnacle Survey",
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
        "target": "The Pinnacle",
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
    "site": "Pier Piling Survey",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "bay-area-union-edition",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Piling Survey",
        "text": "The dive lead meets you at Pier Piling Survey and walks you to the first bench."
      },
      {
        "type": "station",
        "target": "mooring-line",
        "text": "The shared opener for the water: the line under load teaches the snap-back zone before anything else."
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
    "site": "Pier Piling Survey",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-bay-area-union-edition-opener",
    "programmeId": "bay-area-union-edition",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Piling Survey",
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
    "id": "dv-side-bay-restoration-maritime-underwater-opener",
    "title": "SF Bay Restoration & Cleanup — Maritime and Underwater — First Dive",
    "giver": "the programme's dive lead",
    "site": "Pier Dive Station",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "bay-restoration-maritime-underwater",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Dive Station",
        "text": "The dive lead meets you at Pier Dive Station and walks you to the first bench."
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
    "site": "Pier Dive Station",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-bay-restoration-maritime-underwater-opener",
    "programmeId": "bay-restoration-maritime-underwater",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Pier Dive Station",
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
    "site": "Gauge Station",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "hunters-point-bay-restoration",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Gauge Station",
        "text": "The dive lead meets you at Gauge Station and walks you to the first bench."
      },
      {
        "type": "station",
        "target": "air-monitor",
        "text": "Fence-line monitoring for the people on the other side of the fence: placement, calibration, and an exceedance response that happens now."
      },
      {
        "type": "station",
        "target": "stormwater-outfall",
        "text": "The wet-weather grab at the outfall, on the permit clock, because the bay is where the site drains."
      },
      {
        "type": "station",
        "target": "dredge-barge",
        "text": "Contaminated sediment out of the bay inside a turbidity curtain, with the scow never over its freeboard line and decant water tested before it goes anywhere."
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
    "site": "Gauge Station",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-hunters-point-bay-restoration-opener",
    "programmeId": "hunters-point-bay-restoration",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Gauge Station",
        "text": "The certifying evaluator is waiting at the last bench, sign-off sheet in hand."
      },
      {
        "type": "station",
        "target": "tide-gate",
        "text": "The tide let back into a diked marsh: a self-regulating gate hung at low water, the cofferdam pulled in the order that keeps the levee."
      },
      {
        "type": "station",
        "target": "living-shoreline",
        "text": "The water's edge rebuilt as habitat — coir, oyster shell, cordgrass at the design elevation — inside the tide window and the fish window."
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
    "id": "dv-side-hazmat-environmental-opener",
    "title": "Hazmat and Environmental Response — First Dive",
    "giver": "the programme's dive lead",
    "site": "Outfall Sampling Point",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "hazmat-environmental",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Outfall Sampling Point",
        "text": "The dive lead meets you at Outfall Sampling Point and walks you to the first bench."
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
    "site": "Outfall Sampling Point",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-hazmat-environmental-opener",
    "programmeId": "hazmat-environmental",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Outfall Sampling Point",
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
    "id": "dv-side-ports-maritime-ecology-opener",
    "title": "Ports, Maritime and Bay Ecology — First Dive",
    "giver": "the programme's dive lead",
    "site": "Ballast Check Berth",
    "kind": "side",
    "tier": 1,
    "requires": null,
    "programmeId": "ports-maritime-ecology",
    "role": "opener",
    "steps": [
      {
        "type": "goto",
        "target": "Ballast Check Berth",
        "text": "The dive lead meets you at Ballast Check Berth and walks you to the first bench."
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
    "site": "Ballast Check Berth",
    "kind": "side",
    "tier": 2,
    "requires": "dv-side-ports-maritime-ecology-opener",
    "programmeId": "ports-maritime-ecology",
    "role": "capstone",
    "steps": [
      {
        "type": "goto",
        "target": "Ballast Check Berth",
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
  }
];

export const DV_EGG_DIVES = [
  {
    "id": "dv-egg-knot-lead",
    "title": "Lantern — The Knotted Piling",
    "giver": "found, not given",
    "site": "The Knotted Piling",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Knotted Piling",
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
        "target": "The Knotted Piling",
        "text": "Swim to The Knotted Piling and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-knot-lead",
        "text": "Clipped beside the lantern at The Knotted Piling, a field note reads: \"Every time the diver moves, the umbilical saws back and forth over whatever it crosses at the side, and a sharp rail corner or ladder edge cuts through its jacket in a morning.\""
      }
    ]
  },
  {
    "id": "dv-egg-pile-zones",
    "title": "Lantern — The Piling Forest",
    "giver": "found, not given",
    "site": "The Piling Forest",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Piling Forest",
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
        "target": "The Piling Forest",
        "text": "Swim to The Piling Forest and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-pile-zones",
        "text": "Clipped beside the lantern at The Piling Forest, a field note reads: \"A pier pile is inspected where it fails: in the splash and tidal zone where the cover spalls and the steel starts to rust, and at the mudline where scour and abrasion take the section away.\""
      }
    ]
  },
  {
    "id": "dv-egg-gauge-riddle",
    "title": "Lantern — The Tide-Gauge Post",
    "giver": "found, not given",
    "site": "The Tide-Gauge Post",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Tide-Gauge Post",
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
    "title": "Lantern — The Shell Hash Bank",
    "giver": "found, not given",
    "site": "The Shell Hash Bank",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Shell Hash Bank",
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
        "target": "The Shell Hash Bank",
        "text": "Swim to The Shell Hash Bank and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-quadrat-stake",
        "text": "Clipped beside the lantern at The Shell Hash Bank, a field note reads: \"A permanent quadrat is permanent so the exact same square metre of reef gets measured every single quarter, and that only works if the crew finds the tagged stake the last crew left rather than a spot that merely looks about right — a density count from the wrong metre of reef is not comparable to last quarter's and cannot join the trend the whole monitoring program depends on.\""
      }
    ]
  },
  {
    "id": "dv-egg-slack-water",
    "title": "Lantern — The Meadow Edge",
    "giver": "found, not given",
    "site": "The Meadow Edge",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Meadow Edge",
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
    "title": "Lantern — The Quadrat Grid",
    "giver": "found, not given",
    "site": "The Quadrat Grid",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Quadrat Grid",
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
        "target": "The Quadrat Grid",
        "text": "Swim to The Quadrat Grid and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-hull-overhead",
        "text": "Clipped beside the lantern at The Quadrat Grid, a field note reads: \"A diver working a grid a few feet down cannot see or hear a hull approaching from the surface, and a vessel inside the exclusion zone with a diver still under it is the single most common way a commercial dive turns into a fatality.\""
      }
    ]
  },
  {
    "id": "dv-egg-upcurrent-anchor",
    "title": "Lantern — The Marsh Mouth Bar",
    "giver": "found, not given",
    "site": "The Marsh Mouth Bar",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Marsh Mouth Bar",
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
        "target": "The Marsh Mouth Bar",
        "text": "Swim to The Marsh Mouth Bar and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-upcurrent-anchor",
        "text": "Clipped beside the lantern at The Marsh Mouth Bar, a field note reads: \"The curtain is laid from its upcurrent end so the current streams it down along its alignment instead of peeling it off; the upcurrent anchor goes down first and holds everything that follows.\""
      }
    ]
  },
  {
    "id": "dv-egg-turbidity-proof",
    "title": "Lantern — The Channel Stakes",
    "giver": "found, not given",
    "site": "The Channel Stakes",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Channel Stakes",
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
    "title": "Lantern — The Outfall Diffuser",
    "giver": "found, not given",
    "site": "The Outfall Diffuser",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Outfall Diffuser",
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
        "target": "The Outfall Diffuser",
        "text": "Swim to The Outfall Diffuser and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-bank-buddy",
        "text": "Clipped beside the lantern at The Outfall Diffuser, a field note reads: \"A stormwater grab is worked at the edge of moving water in the rain that caused the discharge in the first place, and the second person on the bank is the entire emergency plan if the footing gives way.\""
      }
    ]
  },
  {
    "id": "dv-egg-slow-baseline",
    "title": "Lantern — The Kelp Cathedral",
    "giver": "found, not given",
    "site": "The Kelp Cathedral",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Kelp Cathedral",
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
        "target": "The Kelp Cathedral",
        "text": "Swim to The Kelp Cathedral and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-slow-baseline",
        "text": "Clipped beside the lantern at The Kelp Cathedral, a field note reads: \"The first pass along the baseline is what finds the debris, and it is swum slowly and level so the fins do not lift the silt into a cloud that hides everything behind you.\""
      }
    ]
  },
  {
    "id": "dv-egg-holdfast-upcurrent",
    "title": "Lantern — The Holdfast Rock",
    "giver": "found, not given",
    "site": "The Holdfast Rock",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Holdfast Rock",
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
        "target": "The Holdfast Rock",
        "text": "Swim to The Holdfast Rock and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-holdfast-upcurrent",
        "text": "Clipped beside the lantern at The Holdfast Rock, a field note reads: \"Up-current of a net, the water carries the netting away from you; down-current, it carries it onto you.\""
      }
    ]
  },
  {
    "id": "dv-egg-follow-line",
    "title": "Lantern — The Rock Arch",
    "giver": "found, not given",
    "site": "The Rock Arch",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Rock Arch",
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
    "title": "Lantern — The Reef Ball Rows",
    "giver": "found, not given",
    "site": "The Reef Ball Rows",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Reef Ball Rows",
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
        "target": "The Reef Ball Rows",
        "text": "Swim to The Reef Ball Rows and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-straight-core",
        "text": "Clipped beside the lantern at The Reef Ball Rows, a field note reads: \"A push core is a record of the sediment layer by layer, and it only stays a record if the tube goes in steadily and straight: twisting smears the layers into each other, bouncing compacts them and a tube pushed at an angle takes a longer, distorted core.\""
      }
    ]
  },
  {
    "id": "dv-egg-cap-first",
    "title": "Lantern — The Settlement Tile Rack",
    "giver": "found, not given",
    "site": "The Settlement Tile Rack",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Settlement Tile Rack",
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
    "title": "Lantern — The Marker Chain",
    "giver": "found, not given",
    "site": "The Marker Chain",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Marker Chain",
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
        "target": "The Marker Chain",
        "text": "Swim to The Marker Chain and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-screw-locked",
        "text": "Clipped beside the lantern at The Marker Chain, a field note reads: \"A turning propeller near a diver's umbilical is one of the ways commercial divers die, and the dive boat's own screw is the one the team controls completely: its controls are locked and tagged before anyone is in the water.\""
      }
    ]
  },
  {
    "id": "dv-egg-steady-pace",
    "title": "Lantern — The Cable Crossing",
    "giver": "found, not given",
    "site": "The Cable Crossing",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Cable Crossing",
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
        "target": "The Cable Crossing",
        "text": "Swim to The Cable Crossing and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-steady-pace",
        "text": "Clipped beside the lantern at The Cable Crossing, a field note reads: \"The whole crossing has to be swum at one steady pace for the survey to mean anything, because a diver who speeds up past the boring stretches and slows down only at defects has decided in advance what counts as worth seeing.\""
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
    "title": "Lantern — The Anchor Block",
    "giver": "found, not given",
    "site": "The Anchor Block",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Anchor Block",
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
        "target": "The Anchor Block",
        "text": "Swim to The Anchor Block and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-bight",
        "text": "Clipped beside the lantern at The Anchor Block, a field note reads: \"A bight on the deck closes at drum speed the moment the slack comes out of it, and it closes on whatever is inside.\""
      }
    ]
  },
  {
    "id": "dv-egg-chamber-plan",
    "title": "Lantern — The Trench Lip",
    "giver": "found, not given",
    "site": "The Trench Lip",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Trench Lip",
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
    "title": "Lantern — The Pinnacle",
    "giver": "found, not given",
    "site": "The Pinnacle",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Pinnacle",
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
        "target": "The Pinnacle",
        "text": "Swim to The Pinnacle and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-benchmark",
        "text": "Clipped beside the lantern at The Pinnacle, a field note reads: \"Nothing you read today means anything by itself — a scour depth only matters next to the number someone wrote down at this same pier a year ago, and the benchmark plate is the single elevation that ties this dive to that one.\""
      }
    ]
  },
  {
    "id": "dv-egg-pfd-gasp",
    "title": "Lantern — The Mooring Chain",
    "giver": "found, not given",
    "site": "The Mooring Chain",
    "kind": "egg",
    "tier": 0,
    "requires": null,
    "landmark": "The Mooring Chain",
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
        "target": "The Mooring Chain",
        "text": "Swim to The Mooring Chain and look for the lantern."
      },
      {
        "type": "find",
        "target": "dv-egg-pfd-gasp",
        "text": "Clipped beside the lantern at The Mooring Chain, a field note reads: \"The first moments in cold water bring a gasp and a loss of breath control that a person cannot choose to stop, and a PFD is what keeps the mouth clear of the water through it.\""
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
    "site": "Arch Survey",
    "description": "Collect the marked debris around the arch before the timer runs out — and flag, never lift, the items marked hazardous, which wait for the work plan.",
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
    "line": "marsh-channel-line",
    "site": "Marsh Drift Line",
    "description": "Ride the ebb out of the marsh channel and hold the corridor between the stakes for the whole run.",
    "scoring": {
      "seconds": 90,
      "corridorHalfWidth": 8,
      "heldFraction": true
    }
  }
];

export const DV_LANDMARK_NOTES = {
  "The Piling Forest": "Rows of timber and concrete piles under the pier deck, wrapped in growth.",
  "The Knotted Piling": "One piling with an old mooring rope still knotted around it.",
  "The Tide-Gauge Post": "A staff gauge on a post, its marks read from the surface.",
  "The Shell Hash Bank": "A low bank of broken shell the current sorts and re-sorts.",
  "The Meadow Edge": "The line where the grass thins to bare sand, pinned with transect stakes.",
  "The Quadrat Grid": "A planting grid of numbered stakes for a transplant survey.",
  "The Marsh Mouth Bar": "A sand bar across the channel mouth that the ebb pours over.",
  "The Channel Stakes": "Stakes marking the marsh channel's line out into the bay.",
  "The Outfall Diffuser": "A capped diffuser pipe on a stone apron, sampled under the permit.",
  "The Kelp Cathedral": "The tallest stand in the forest, light falling in shafts between the stipes.",
  "The Holdfast Rock": "A boulder with holdfasts gripping every face of it.",
  "The Rock Arch": "A low arch of rock a diver swims beside, never through.",
  "The Reef Ball Rows": "Reef balls set on a grid, each one numbered on a tag.",
  "The Settlement Tile Rack": "A rack of settlement tiles for a monitoring survey.",
  "The Marker Chain": "A chain of channel markers along the dredged edge.",
  "The Cable Crossing": "A marker over a buried cable crossing the channel bed.",
  "The Wreck's Bow": "A small derelict hull, its bow to the current, surveyed by photograph.",
  "The Wreck's Stern": "The stern of the same hull, settled deeper in the scour.",
  "The Anchor Block": "A concrete mooring block on open sand, an anchor line rising from it.",
  "The Trench Lip": "Where the sand plain drops away into the trench.",
  "The Pinnacle": "The top of the seamount, the highest point in the deep water.",
  "The Mooring Chain": "Chain and mooring blocks under the anchorage."
};
