// North Beach, Chinatown & Fisherman's Wharf — one 4096 m streamed San Francisco district on the shared parish schema
// (docs/parishes.md, docs/consoles/NEIGHBORHOODS.md), region "san-francisco", drawn at a walkable scale
// (`scale`: real metres per map metre), so the field is the walk.
//
// Facts rule: real places appear only by their public names, as places (a neighbourhood, a hill, a park, a pier,
// a square, a street); no history, dates, statistics, addresses, business names or heights of real places. Coordinates are
// approximate (three decimals, `approximate: true`) and exist only to place a map. The crews and site names are
// procedural training places, not real businesses. `hills` are gentle procedural mounds centred at the named
// hill's approximate lon/lat, named only (a height is a map number, never a real height). A landmark's `lm` names a
// LANDMARKS kit kind (lmBuild); until the kit merges the engine draws its generic landmark.
//
// Written once by tools/gen_sn_districts.mjs from approximate lon/lat; edit the numbers here directly. Pure: no
// three.js, no DOM. Every top-level name is prefixed np/NP_ (the bundler concatenates all modules into one scope).

export const NP_SF_NORTH_BEACH = {
 "id": "sf-north-beach",
 "name": "North Beach, Chinatown & Fisherman's Wharf",
 "region": "san-francisco",
 "size": 4096,
 "scale": 1,
 "blurb": "San Francisco's north-east corner on foot: Telegraph Hill and Coit Tower over North Beach, Chinatown's lanes, the wharf's fishing fleet and piers, and the cable cars climbing Russian Hill and Nob Hill.",
 "start": "columbus-restaurant-row",
 "anchors": [
  {
   "xz": [
    352,
    0
   ],
   "lonlat": [
    -122.406,
    37.802
   ],
   "approximate": true,
   "name": "Coit Tower"
  },
  {
   "xz": [
    616,
    779
   ],
   "lonlat": [
    -122.403,
    37.795
   ],
   "approximate": true,
   "name": "the Transamerica Pyramid"
  },
  {
   "xz": [
    0,
    111
   ],
   "lonlat": [
    -122.41,
    37.801
   ],
   "approximate": true,
   "name": "Washington Square"
  },
  {
   "xz": [
    440,
    779
   ],
   "lonlat": [
    -122.405,
    37.795
   ],
   "approximate": true,
   "name": "Portsmouth Square"
  },
  {
   "xz": [
    0,
    -779
   ],
   "lonlat": [
    -122.41,
    37.809
   ],
   "approximate": true,
   "name": "Pier Thirty-Nine"
  },
  {
   "xz": [
    -1055,
    -557
   ],
   "lonlat": [
    -122.422,
    37.807
   ],
   "approximate": true,
   "name": "Aquatic Park"
  },
  {
   "xz": [
    -792,
    0
   ],
   "lonlat": [
    -122.419,
    37.802
   ],
   "approximate": true,
   "name": "Lombard Street's switchbacks"
  },
  {
   "xz": [
    1407,
    668
   ],
   "lonlat": [
    -122.394,
    37.796
   ],
   "approximate": true,
   "name": "the Ferry Building"
  },
  {
   "xz": [
    -1143,
    -445
   ],
   "lonlat": [
    -122.423,
    37.806
   ],
   "approximate": true,
   "name": "Ghirardelli Square"
  }
 ],
 "hills": [
  {
   "id": "telegraph-hill",
   "name": "Telegraph Hill",
   "center": [
    352,
    0
   ],
   "radius": 250,
   "height": 40
  },
  {
   "id": "russian-hill",
   "name": "Russian Hill",
   "center": [
    -704,
    111
   ],
   "radius": 300,
   "height": 45
  },
  {
   "id": "nob-hill",
   "name": "Nob Hill",
   "center": [
    -352,
    1113
   ],
   "radius": 320,
   "height": 45
  }
 ],
 "water": [
  {
   "id": "san-francisco-bay",
   "name": "San Francisco Bay",
   "kind": "bay",
   "poly": [
    [
     -2048,
     -612
    ],
    [
     -1363,
     -668
    ],
    [
     -968,
     -724
    ],
    [
     -616,
     -779
    ],
    [
     -264,
     -779
    ],
    [
     88,
     -891
    ],
    [
     440,
     -835
    ],
    [
     792,
     -501
    ],
    [
     1055,
     -111
    ],
    [
     1231,
     278
    ],
    [
     1451,
     557
    ],
    [
     1671,
     1002
    ],
    [
     1847,
     1447
    ],
    [
     2048,
     1781
    ],
    [
     2048,
     -2048
    ],
    [
     -2048,
     -2048
    ]
   ]
  },
  {
   "id": "aquatic-park-cove",
   "name": "the cove at Aquatic Park",
   "kind": "bay",
   "poly": [
    [
     -1275,
     -657
    ],
    [
     -1012,
     -623
    ],
    [
     -836,
     -690
    ],
    [
     -836,
     -835
    ],
    [
     -1275,
     -835
    ]
   ]
  },
  {
   "id": "wharf-lagoon",
   "name": "the fishing fleet's lagoon at the wharf",
   "kind": "bay",
   "poly": [
    [
     -686,
     -712
    ],
    [
     -440,
     -701
    ],
    [
     -352,
     -835
    ],
    [
     -704,
     -868
    ]
   ]
  }
 ],
 "levees": [
  {
   "id": "embarcadero-seawall",
   "name": "the Embarcadero seawall",
   "height": 3.5,
   "pts": [
    [
     484,
     -735
    ],
    [
     836,
     -423
    ],
    [
     1099,
     -33
    ],
    [
     1275,
     312
    ],
    [
     1495,
     646
    ],
    [
     1715,
     1058
    ],
    [
     1865,
     1447
    ]
   ]
  },
  {
   "id": "aquatic-park-seawall",
   "name": "the seawall along Aquatic Park",
   "height": 3,
   "pts": [
    [
     -1425,
     -579
    ],
    [
     -1231,
     -601
    ],
    [
     -1038,
     -568
    ]
   ]
  }
 ],
 "roads": [
  {
   "id": "the-embarcadero",
   "name": "the Embarcadero",
   "kind": "avenue",
   "pts": [
    [
     -308,
     -657
    ],
    [
     88,
     -701
    ],
    [
     440,
     -668
    ],
    [
     704,
     -367
    ],
    [
     968,
     0
    ],
    [
     1143,
     356
    ],
    [
     1337,
     668
    ],
    [
     1539,
     1091
    ],
    [
     1715,
     1536
    ],
    [
     1979,
     1837
    ]
   ]
  },
  {
   "id": "columbus-avenue",
   "name": "Columbus Avenue",
   "kind": "avenue",
   "pts": [
    [
     484,
     724
    ],
    [
     132,
     334
    ],
    [
     -308,
     -111
    ],
    [
     -660,
     -468
    ]
   ]
  },
  {
   "id": "grant-avenue",
   "name": "Grant Avenue",
   "kind": "street",
   "pts": [
    [
     369,
     1558
    ],
    [
     325,
     779
    ],
    [
     246,
     -111
    ]
   ]
  },
  {
   "id": "stockton-street",
   "name": "Stockton Street",
   "kind": "street",
   "pts": [
    [
     281,
     1892
    ],
    [
     158,
     668
    ],
    [
     -44,
     -278
    ]
   ]
  },
  {
   "id": "powell-street",
   "name": "Powell Street and its cable car line",
   "kind": "street",
   "pts": [
    [
     194,
     1892
    ],
    [
     0,
     668
    ],
    [
     -220,
     -334
    ]
   ]
  },
  {
   "id": "hyde-street",
   "name": "Hyde Street and its cable car line",
   "kind": "street",
   "pts": [
    [
     -572,
     1336
    ],
    [
     -748,
     223
    ],
    [
     -897,
     -468
    ]
   ]
  },
  {
   "id": "broadway",
   "name": "Broadway",
   "kind": "avenue",
   "pts": [
    [
     -2023,
     668
    ],
    [
     -440,
     523
    ],
    [
     440,
     468
    ],
    [
     924,
     390
    ]
   ]
  },
  {
   "id": "lombard-street",
   "name": "Lombard Street",
   "kind": "street",
   "pts": [
    [
     -2023,
     189
    ],
    [
     -880,
     0
    ],
    [
     0,
     -111
    ]
   ]
  },
  {
   "id": "jefferson-street",
   "name": "Jefferson Street along the wharf",
   "kind": "street",
   "pts": [
    [
     -1099,
     -534
    ],
    [
     -704,
     -579
    ],
    [
     -176,
     -623
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "north-beach",
   "name": "North Beach",
   "character": "quarter",
   "poly": [
    [
     -308,
     -278
    ],
    [
     484,
     -278
    ],
    [
     484,
     501
    ],
    [
     -308,
     501
    ]
   ]
  },
  {
   "id": "chinatown",
   "name": "Chinatown",
   "character": "quarter",
   "poly": [
    [
     -44,
     501
    ],
    [
     528,
     501
    ],
    [
     528,
     1336
    ],
    [
     -44,
     1336
    ]
   ]
  },
  {
   "id": "fishermans-wharf",
   "name": "Fisherman's Wharf",
   "character": "port",
   "poly": [
    [
     -1143,
     -724
    ],
    [
     264,
     -724
    ],
    [
     264,
     -278
    ],
    [
     -1143,
     -278
    ]
   ]
  },
  {
   "id": "telegraph-hill",
   "name": "Telegraph Hill",
   "character": "garden",
   "poly": [
    [
     176,
     -445
    ],
    [
     792,
     -445
    ],
    [
     792,
     390
    ],
    [
     176,
     390
    ]
   ]
  },
  {
   "id": "russian-hill",
   "name": "Russian Hill",
   "character": "garden",
   "poly": [
    [
     -1231,
     -278
    ],
    [
     -308,
     -278
    ],
    [
     -308,
     668
    ],
    [
     -1231,
     668
    ]
   ]
  },
  {
   "id": "jackson-square",
   "name": "Jackson Square and the Financial District's edge",
   "character": "downtown",
   "poly": [
    [
     484,
     390
    ],
    [
     1231,
     390
    ],
    [
     1231,
     1781
    ],
    [
     484,
     1781
    ]
   ]
  },
  {
   "id": "nob-hill",
   "name": "Nob Hill",
   "character": "garden",
   "poly": [
    [
     -880,
     668
    ],
    [
     -44,
     668
    ],
    [
     -44,
     1781
    ],
    [
     -880,
     1781
    ]
   ]
  },
  {
   "id": "the-embarcadero-waterfront",
   "name": "the Embarcadero waterfront",
   "character": "port",
   "poly": [
    [
     528,
     -557
    ],
    [
     1759,
     -557
    ],
    [
     1759,
     779
    ],
    [
     528,
     779
    ]
   ]
  }
 ],
 "sites": [
  {
   "id": "wharf-fishing-fleet",
   "name": "the Wharf Fishing Fleet Berths",
   "kind": "marina",
   "position": [
    -748,
    -623
   ],
   "trades": [
    "ibu",
    "sup",
    "ilwu"
   ],
   "programmes": [
    "ports-maritime-ecology",
    "yacht-and-charter-crew"
   ],
   "stations": [
    "mooring-line",
    "yc-line-handling-and-docking-in-crosswind",
    "yc-fuel-dock-transfer-and-spill-kit",
    "yc-engine-room-pre-start-and-bilge-check",
    "spill-boom-deploy"
   ],
   "blurb": "The fishing boats' berths behind the wharf: lines in a crosswind, the fuel dock, the bilge check before the boats go out."
  },
  {
   "id": "wharf-seafood-dock",
   "name": "the Wharf Seafood Receiving Dock",
   "kind": "market",
   "position": [
    -334,
    -512
   ],
   "trades": [
    "ufcw",
    "unite-here",
    "teamsters"
   ],
   "programmes": [
    "grocery-and-meatpacking",
    "culinary-kitchen"
   ],
   "stations": [
    "receiving-dock-food",
    "walk-in-cooler",
    "gr-produce-receiving-cold-chain-and-pallet-jack",
    "gr-ammonia-leak-alarm-response-cold-plant"
   ],
   "blurb": "Where the catch comes off the boats and into the cold room: pallet jacks, the cold chain and the alarm on the cooling plant."
  },
  {
   "id": "embarcadero-pier-shed",
   "name": "an Embarcadero Pier Shed",
   "kind": "port",
   "position": [
    633,
    -200
   ],
   "trades": [
    "ila",
    "ilwu",
    "iuoe"
   ],
   "programmes": [
    "port-operations",
    "rigging-lifting"
   ],
   "stations": [
    "mooring-line",
    "vessel-gangway-and-hatch-cover-safety",
    "pt-dock-fender-and-bollard-inspection",
    "forklift-dock"
   ],
   "blurb": "A working pier shed on the waterfront: lines, gangways, fenders and the forklift lane."
  },
  {
   "id": "hyde-street-cable-car-crew",
   "name": "the Hyde Street Cable Car Crew",
   "kind": "streetcar",
   "position": [
    -844,
    -356
   ],
   "trades": [
    "atu",
    "iam",
    "ibew"
   ],
   "programmes": [
    "transit-ramp",
    "railroad-crafts"
   ],
   "stations": [
    "track-access",
    "signal-cabinet",
    "ra-hand-brake-and-securement-on-a-grade",
    "ra-roadway-worker-protection-and-job-briefing"
   ],
   "blurb": "The crew at the top of the Hyde Street line: the grip, the track slot, and a car secured on a grade."
  },
  {
   "id": "powell-street-cable-car-crew",
   "name": "the Powell Street Cable Car Crew",
   "kind": "transit",
   "position": [
    211,
    1759
   ],
   "trades": [
    "atu",
    "twu",
    "ibew"
   ],
   "programmes": [
    "transit-ramp",
    "railroad-crafts"
   ],
   "stations": [
    "track-access",
    "signal-cabinet",
    "ra-crossing-signal-maintenance-and-flagging",
    "ra-switch-inspection-and-lubrication"
   ],
   "blurb": "The crew at the foot of Powell Street where the cars turn: the switch, the crossing signals and the track slot."
  },
  {
   "id": "washington-square-school",
   "name": "a North Beach School Campus",
   "kind": "school",
   "position": [
    -158,
    301
   ],
   "trades": [
    "aft",
    "csea",
    "seiu"
   ],
   "programmes": [
    "education-support-staff",
    "k12-literacy-and-life-skills"
   ],
   "stations": [
    "ed-playground-equipment-inspection",
    "ed-crossing-guard-intersection-control",
    "k12-reading-instructions-and-safety-labels",
    "ed-kitchen-receiving-and-warewash-sanitizing"
   ],
   "blurb": "A school by Washington Square: the playground check, the crossing guard's corner and the safety labels in the kitchen."
  },
  {
   "id": "columbus-restaurant-row",
   "name": "the Restaurant Row on Columbus Avenue",
   "kind": "hospitality",
   "position": [
    88,
    412
   ],
   "trades": [
    "unite-here"
   ],
   "programmes": [
    "culinary-kitchen",
    "bartending-course"
   ],
   "stations": [
    "kitchen",
    "knife-skills",
    "hood-suppression",
    "bar-well-setup",
    "grease-trap"
   ],
   "blurb": "North Beach's row of kitchens and bars: the line, the hood, the bar well and the grease trap."
  },
  {
   "id": "nb-chinatown-kitchens",
   "name": "a Chinatown Restaurant Kitchen",
   "kind": "hospitality",
   "position": [
    334,
    835
   ],
   "trades": [
    "unite-here"
   ],
   "programmes": [
    "culinary-kitchen"
   ],
   "stations": [
    "kitchen-gas-shutoff",
    "fryer-oil-change",
    "dish-pit",
    "prep-cooling",
    "slicer-lockout"
   ],
   "blurb": "A busy kitchen off Grant Avenue: the gas shut-off, the fryer oil change, the dish pit and the slicer lockout."
  },
  {
   "id": "wharf-hotel-service",
   "name": "a Wharf Hotel Service Floor",
   "kind": "hospitality",
   "position": [
    -572,
    -390
   ],
   "trades": [
    "unite-here",
    "seiu"
   ],
   "programmes": [
    "hotel-workers",
    "culinary-kitchen"
   ],
   "stations": [
    "housekeeping-room-turn",
    "hw-housekeeping-cart-and-chemical-safety",
    "hw-banquet-room-flip-and-staging",
    "laundry-plant-chemicals"
   ],
   "blurb": "A hotel floor above the wharf: room turns, the housekeeping cart, banquet flips and the laundry chemicals."
  },
  {
   "id": "chinatown-community-clinic",
   "name": "a Chinatown Community Clinic",
   "kind": "hospital",
   "position": [
    106,
    1069
   ],
   "trades": [
    "nnu",
    "seiu",
    "afscme"
   ],
   "programmes": [
    "healthcare-support",
    "first-responders"
   ],
   "stations": [
    "hc-patient-transport-and-safe-handling",
    "hc-environmental-services-isolation-room-turnover",
    "triage-point",
    "hc-workplace-violence-deescalation-at-the-desk"
   ],
   "blurb": "A neighbourhood clinic: moving patients safely, turning over a room, triage and calm at the front desk."
  },
  {
   "id": "north-beach-fire-station",
   "name": "a North Beach Fire Station",
   "kind": "fire-station",
   "position": [
    18,
    -134
   ],
   "trades": [
    "iaff",
    "naemt"
   ],
   "programmes": [
    "first-responders",
    "fall-protection"
   ],
   "stations": [
    "structure-fire-sizeup",
    "aerial-ladder",
    "firefighter-rehab-sector",
    "ambulance-scene-safety"
   ],
   "blurb": "A firehouse between the hills: size-up on narrow streets, the aerial ladder and rehab after a long call."
  },
  {
   "id": "telegraph-hill-grounds",
   "name": "the Telegraph Hill Grounds Crew",
   "kind": "park",
   "position": [
    633,
    245
   ],
   "trades": [
    "afscme",
    "liuna",
    "seiu"
   ],
   "programmes": [
    "grounds-and-landscaping"
   ],
   "stations": [
    "gk-tree-work-pole-saw-and-drop-zone",
    "gk-string-trimmer-and-blower-ppe-and-bystander-zone",
    "gk-irrigation-controller-valve-box-and-backflow-check",
    "gk-chainsaw-start-and-limbing-on-the-ground"
   ],
   "blurb": "The crew that keeps the hill's gardens and steps: pole saws, trimmers and the irrigation boxes."
  },
  {
   "id": "jackson-square-renovation",
   "name": "a Jackson Square Renovation Site",
   "kind": "construction",
   "position": [
    704,
    646
   ],
   "trades": [
    "carpenters",
    "ua",
    "opcmia"
   ],
   "programmes": [
    "roofers-and-waterproofers",
    "plumbers-and-pipefitters",
    "cement-masons-and-plasterers"
   ],
   "stations": [
    "rf-roof-tear-off-and-debris-chute",
    "pl-copper-press-and-solder-rough-in",
    "ib-asbestos-glovebag-removal-on-a-pipe",
    "cm-exterior-plaster-scratch-brown-and-finish-coats"
   ],
   "blurb": "An old brick building being brought up to date: roof tear-off, new copper, lagged pipe and fresh plaster."
  },
  {
   "id": "embarcadero-seawall-crew",
   "name": "the Embarcadero Seawall Crew",
   "kind": "seawall",
   "position": [
    897,
    134
   ],
   "trades": [
    "uwua",
    "liuna",
    "afscme"
   ],
   "programmes": [
    "water-and-gas-utility-crews",
    "confined-space"
   ],
   "stations": [
    "stormwater-outfall",
    "pl-underground-sewer-lateral-and-trench-shoring",
    "manhole-entry-and-atmospheric-monitoring",
    "ut-night-storm-response-crew-and-portable-generator"
   ],
   "blurb": "The crew behind the seawall: storm outfalls, sewer laterals, manholes and the night storm call-out."
  }
 ],
 "landmarks": [
  {
   "id": "coit-tower",
   "name": "Coit Tower",
   "position": [
    352,
    0
   ],
   "kind": "tower",
   "lm": "coit-tower"
  },
  {
   "id": "transamerica-pyramid",
   "name": "the Transamerica Pyramid",
   "position": [
    633,
    757
   ],
   "kind": "tower",
   "lm": "transamerica-pyramid"
  },
  {
   "id": "lombard-switchbacks",
   "name": "Lombard Street's switchbacks",
   "position": [
    -765,
    -11
   ],
   "kind": "switchbacks"
  },
  {
   "id": "hyde-street-turntable",
   "name": "the cable car turntable at Hyde Street",
   "position": [
    -932,
    -490
   ],
   "kind": "place",
   "lm": "cable-car-turntable"
  },
  {
   "id": "powell-street-turntable",
   "name": "the cable car turntable at Powell Street",
   "position": [
    185,
    1915
   ],
   "kind": "place",
   "lm": "cable-car-turntable"
  },
  {
   "id": "hyde-street-cable-car",
   "name": "a cable car on Hyde Street",
   "position": [
    -774,
    111
   ],
   "kind": "place",
   "lm": "cable-car"
  },
  {
   "id": "pier-thirty-nine",
   "name": "Pier Thirty-Nine",
   "position": [
    18,
    -712
   ],
   "kind": "place",
   "lm": "wharf-pier-shed"
  },
  {
   "id": "washington-square",
   "name": "Washington Square",
   "position": [
    -9,
    134
   ],
   "kind": "place"
  },
  {
   "id": "dragon-gate",
   "name": "the gate at Grant Avenue",
   "position": [
    369,
    1269
   ],
   "kind": "gate"
  },
  {
   "id": "ferry-building",
   "name": "the Ferry Building",
   "position": [
    1407,
    724
   ],
   "kind": "place",
   "lm": "ferry-building"
  },
  {
   "id": "fishermans-wharf",
   "name": "Fisherman's Wharf",
   "position": [
    -457,
    -646
   ],
   "kind": "place",
   "lm": "wharf-pier-shed"
  }
 ],
 "connectors": [
  {
   "id": "sf-nb-embarcadero-south",
   "kind": "road",
   "name": "The Embarcadero south to the Ferry Building and Downtown",
   "from": {
    "parish": "sf-north-beach",
    "position": [
     1671,
     1558
    ]
   },
   "to": {
    "parish": "sf-downtown",
    "position": [
     520,
     100
    ],
    "lonlat": [
     -122.391,
     37.788
    ]
   },
   "lonlat": [
    -122.391,
    37.788
   ],
   "approximate": true
  },
  {
   "id": "sf-nb-powell-south",
   "kind": "road",
   "name": "Powell Street south to Union Square and Downtown",
   "from": {
    "parish": "sf-north-beach",
    "position": [
     176,
     1892
    ]
   },
   "to": {
    "parish": "sf-downtown",
    "position": [
     -160,
     251
    ],
    "lonlat": [
     -122.408,
     37.785
    ]
   },
   "lonlat": [
    -122.408,
    37.785
   ],
   "approximate": true
  },
  {
   "id": "sf-nb-bay-street-west",
   "kind": "road",
   "name": "Bay Street west to Fort Mason and the Marina",
   "from": {
    "parish": "sf-north-beach",
    "position": [
     -1935,
     -334
    ]
   },
   "to": {
    "parish": "sf-marina",
    "position": [
     772,
     -378
    ],
    "lonlat": [
     -122.432,
     37.805
    ]
   },
   "lonlat": [
    -122.432,
    37.805
   ],
   "approximate": true
  }
 ],
 "fieldLessons": [
  {
   "id": "sn-fl-cable-car-grip",
   "title": "How a Cable Car Climbs a Hill",
   "site": "hyde-street-cable-car-crew",
   "landmark": "hyde-street-turntable",
   "k12": "k12-simple-machines-at-a-crane",
   "station": "ra-hand-brake-and-securement-on-a-grade",
   "trade": "Cable car crew",
   "tradeLine": "A cable car crew grips a moving cable under the street and sets the brakes firmly before anyone steps off on a hill.",
   "minutes": 3,
   "steps": [
    "Look down at the slot between the rails in the street.",
    "A cable runs under it all day, and the car grips it to climb.",
    "On a steep street the crew sets the brakes before people step off."
   ],
   "check": {
    "q": "Why does the crew set the brakes before people step off on a hill?",
    "options": [
     "So the car cannot roll while people move",
     "So the bell rings louder",
     "So the car goes faster later"
    ],
    "answer": 0,
    "why": "A car on a slope wants to roll; the brakes hold it still while people get on and off."
   }
  },
  {
   "id": "sn-fl-cold-chain-catch",
   "title": "Keeping the Catch Cold",
   "site": "wharf-seafood-dock",
   "k12": "k12-reading-instructions-and-safety-labels",
   "station": "gr-produce-receiving-cold-chain-and-pallet-jack",
   "trade": "Seafood dock crew",
   "tradeLine": "A seafood dock crew moves the catch from boat to cold room quickly and reads every label on the way.",
   "minutes": 3,
   "steps": [
    "Watch the crates come off the boat onto the dock.",
    "The crew moves them into the cold room without waiting in the sun.",
    "Every crate has a label that says what it is and when it came in."
   ],
   "check": {
    "q": "Why does the crew move the catch into the cold room quickly?",
    "options": [
     "Cold keeps food safe to eat",
     "The crates are too heavy to leave",
     "The boat needs the dock back"
    ],
    "answer": 0,
    "why": "Food stays safe when it stays cold from the boat to the kitchen."
   }
  },
  {
   "id": "sn-fl-kitchen-hood",
   "title": "The Hood Over the Stove",
   "site": "columbus-restaurant-row",
   "k12": "k12-fractions-in-the-kitchen",
   "station": "hood-suppression",
   "trade": "Line cooks",
   "tradeLine": "A line cook keeps the hood and its filters clean and knows where the fire system's pull station is.",
   "minutes": 2,
   "steps": [
    "Find the big metal hood above the stove.",
    "It pulls smoke and grease up and away from the cooks.",
    "A clean filter and a clear pull station keep the kitchen safe."
   ],
   "check": {
    "q": "What does the hood over the stove do?",
    "options": [
     "It pulls smoke and grease away",
     "It keeps the food warm",
     "It holds the pans"
    ],
    "answer": 0,
    "why": "The hood draws smoke and grease out so the kitchen stays clear and safer from fire."
   }
  }
 ],
 "gated": [
  {
   "id": "sn-nb-gated-fleet-dawn",
   "kind": "side-quest",
   "title": "Out With the Fleet at First Light",
   "site": "wharf-fishing-fleet",
   "siteName": "the Wharf Fishing Fleet Berths",
   "gate": {
    "stations": [
     "yc-line-handling-and-docking-in-crosswind"
    ],
    "note": "Learn to handle lines in a crosswind before you go out with the fleet"
   },
   "world": "parishes",
   "parish": "sf-north-beach",
   "summary": "Out With the Fleet at First Light"
  },
  {
   "id": "sn-nb-gated-turntable",
   "kind": "side-quest",
   "title": "Turn the Car at Hyde Street",
   "site": "hyde-street-cable-car-crew",
   "siteName": "the Hyde Street Cable Car Crew",
   "gate": {
    "stations": [
     "ra-hand-brake-and-securement-on-a-grade"
    ],
    "note": "Learn to secure a car on a grade before you help turn one on the table"
   },
   "world": "parishes",
   "parish": "sf-north-beach",
   "summary": "Turn the Car at Hyde Street"
  }
 ]
};
