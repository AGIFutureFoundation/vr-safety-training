// Haight, Castro & Twin Peaks — one 4096 m streamed San Francisco district on the shared parish schema
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

export const NP_SF_HAIGHT_CASTRO = {
 "id": "sf-haight-castro",
 "name": "Haight, Castro & Twin Peaks",
 "region": "san-francisco",
 "size": 4096,
 "scale": 1,
 "blurb": "The hills at the city's middle on foot: Twin Peaks and Mount Sutro, Corona Heights and Buena Vista over rows of Victorian houses in the Haight and the Castro, the Market Street corridor and the park's east end.",
 "start": "castro-station-transit",
 "anchors": [
  {
   "xz": [
    792,
    -1447
   ],
   "lonlat": [
    -122.434,
    37.776
   ],
   "approximate": true,
   "name": "Alamo Square"
  },
  {
   "xz": [
    704,
    111
   ],
   "lonlat": [
    -122.435,
    37.762
   ],
   "approximate": true,
   "name": "the Castro Theatre"
  },
  {
   "xz": [
    176,
    -557
   ],
   "lonlat": [
    -122.441,
    37.768
   ],
   "approximate": true,
   "name": "Buena Vista Park"
  },
  {
   "xz": [
    880,
    -668
   ],
   "lonlat": [
    -122.433,
    37.769
   ],
   "approximate": true,
   "name": "Duboce Park"
  },
  {
   "xz": [
    -352,
    -779
   ],
   "lonlat": [
    -122.447,
    37.77
   ],
   "approximate": true,
   "name": "the corner of Haight and Ashbury"
  },
  {
   "xz": [
    -1056,
    -445
   ],
   "lonlat": [
    -122.455,
    37.767
   ],
   "approximate": true,
   "name": "Kezar Stadium"
  },
  {
   "xz": [
    1320,
    334
   ],
   "lonlat": [
    -122.428,
    37.76
   ],
   "approximate": true,
   "name": "Mission Dolores Park"
  },
  {
   "xz": [
    -880,
    891
   ],
   "lonlat": [
    -122.453,
    37.755
   ],
   "approximate": true,
   "name": "Sutro Tower"
  },
  {
   "xz": [
    -440,
    1113
   ],
   "lonlat": [
    -122.448,
    37.753
   ],
   "approximate": true,
   "name": "Twin Peaks"
  },
  {
   "xz": [
    440,
    -223
   ],
   "lonlat": [
    -122.438,
    37.765
   ],
   "approximate": true,
   "name": "Corona Heights"
  }
 ],
 "hills": [
  {
   "id": "twin-peaks",
   "name": "Twin Peaks",
   "center": [
    -396,
    1169
   ],
   "radius": 450,
   "height": 70
  },
  {
   "id": "mount-sutro",
   "name": "Mount Sutro",
   "center": [
    -1276,
    501
   ],
   "radius": 350,
   "height": 55
  },
  {
   "id": "corona-heights",
   "name": "Corona Heights",
   "center": [
    440,
    -223
   ],
   "radius": 150,
   "height": 22
  },
  {
   "id": "buena-vista",
   "name": "Buena Vista",
   "center": [
    176,
    -612
   ],
   "radius": 200,
   "height": 30
  },
  {
   "id": "tank-hill",
   "name": "Tank Hill",
   "center": [
    -396,
    278
   ],
   "radius": 110,
   "height": 14
  },
  {
   "id": "alamo-square",
   "name": "Alamo Square",
   "center": [
    748,
    -1503
   ],
   "radius": 160,
   "height": 14
  }
 ],
 "water": [
  {
   "id": "laguna-honda-reservoir",
   "name": "Laguna Honda Reservoir",
   "kind": "lake",
   "poly": [
    [
     -1593,
     1180
    ],
    [
     -1320,
     1180
    ],
    [
     -1302,
     1369
    ],
    [
     -1584,
     1391
    ]
   ]
  },
  {
   "id": "alvord-lake",
   "name": "Alvord Lake",
   "kind": "lake",
   "poly": [
    [
     -1109,
     -646
    ],
    [
     -1038,
     -646
    ],
    [
     -1030,
     -590
    ],
    [
     -1109,
     -579
    ]
   ]
  },
  {
   "id": "lily-pond",
   "name": "the Lily Pond in Golden Gate Park",
   "kind": "lake",
   "poly": [
    [
     -1364,
     -980
    ],
    [
     -1214,
     -991
    ],
    [
     -1197,
     -913
    ],
    [
     -1355,
     -902
    ]
   ]
  }
 ],
 "levees": [
  {
   "id": "laguna-honda-east-embankment",
   "name": "the east embankment of Laguna Honda Reservoir",
   "height": 3,
   "pts": [
    [
     -1276,
     1147
    ],
    [
     -1267,
     1414
    ]
   ]
  },
  {
   "id": "laguna-honda-south-embankment",
   "name": "the south embankment of Laguna Honda Reservoir",
   "height": 3,
   "pts": [
    [
     -1610,
     1436
    ],
    [
     -1294,
     1447
    ]
   ]
  }
 ],
 "roads": [
  {
   "id": "market-street",
   "name": "Market Street",
   "kind": "avenue",
   "pts": [
    [
     2024,
     -1202
    ],
    [
     1276,
     -557
    ],
    [
     704,
     22
    ],
    [
     88,
     779
    ],
    [
     -792,
     1781
    ]
   ]
  },
  {
   "id": "haight-street",
   "name": "Haight Street",
   "kind": "street",
   "pts": [
    [
     1584,
     -1069
    ],
    [
     440,
     -891
    ],
    [
     -836,
     -712
    ]
   ]
  },
  {
   "id": "castro-street",
   "name": "Castro Street",
   "kind": "street",
   "pts": [
    [
     598,
     -724
    ],
    [
     686,
     334
    ],
    [
     748,
     1781
    ]
   ]
  },
  {
   "id": "divisadero-street",
   "name": "Divisadero Street",
   "kind": "street",
   "pts": [
    [
     352,
     -2004
    ],
    [
     440,
     -946
    ]
   ]
  },
  {
   "id": "the-panhandle-streets",
   "name": "Fell and Oak Streets along the Panhandle",
   "kind": "avenue",
   "pts": [
    [
     1584,
     -1392
    ],
    [
     264,
     -1169
    ],
    [
     -880,
     -980
    ]
   ]
  },
  {
   "id": "twin-peaks-boulevard",
   "name": "Twin Peaks Boulevard",
   "kind": "street",
   "pts": [
    [
     88,
     167
    ],
    [
     -220,
     779
    ],
    [
     -352,
     946
    ]
   ]
  },
  {
   "id": "seventeenth-street",
   "name": "Seventeenth Street",
   "kind": "street",
   "pts": [
    [
     1980,
     -22
    ],
    [
     880,
     45
    ],
    [
     0,
     111
    ]
   ]
  },
  {
   "id": "stanyan-street",
   "name": "Stanyan Street",
   "kind": "street",
   "pts": [
    [
     -924,
     -1558
    ],
    [
     -924,
     -223
    ]
   ]
  },
  {
   "id": "church-street",
   "name": "Church Street and its streetcar line",
   "kind": "street",
   "pts": [
    [
     1232,
     -1002
    ],
    [
     1294,
     334
    ],
    [
     1364,
     1781
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "haight-ashbury",
   "name": "Haight-Ashbury",
   "character": "quarter",
   "poly": [
    [
     -924,
     -1225
    ],
    [
     88,
     -1225
    ],
    [
     88,
     -334
    ],
    [
     -924,
     -334
    ]
   ]
  },
  {
   "id": "the-castro",
   "name": "the Castro",
   "character": "quarter",
   "poly": [
    [
     264,
     -334
    ],
    [
     1232,
     -334
    ],
    [
     1232,
     779
    ],
    [
     264,
     779
    ]
   ]
  },
  {
   "id": "twin-peaks-slopes",
   "name": "Twin Peaks",
   "character": "park",
   "poly": [
    [
     -968,
     557
    ],
    [
     88,
     557
    ],
    [
     88,
     1781
    ],
    [
     -968,
     1781
    ]
   ]
  },
  {
   "id": "cole-valley",
   "name": "Cole Valley",
   "character": "garden",
   "poly": [
    [
     -968,
     -334
    ],
    [
     -264,
     -334
    ],
    [
     -264,
     557
    ],
    [
     -968,
     557
    ]
   ]
  },
  {
   "id": "duboce-triangle",
   "name": "Duboce Triangle and the Lower Haight",
   "character": "garden",
   "poly": [
    [
     264,
     -1225
    ],
    [
     1584,
     -1225
    ],
    [
     1584,
     -334
    ],
    [
     264,
     -334
    ]
   ]
  },
  {
   "id": "golden-gate-park-east",
   "name": "Golden Gate Park's east end",
   "character": "park",
   "poly": [
    [
     -2048,
     -1113
    ],
    [
     -968,
     -1113
    ],
    [
     -968,
     -334
    ],
    [
     -2048,
     -334
    ]
   ]
  },
  {
   "id": "alamo-square-rows",
   "name": "the rows around Alamo Square",
   "character": "garden",
   "poly": [
    [
     88,
     -2048
    ],
    [
     1584,
     -2048
    ],
    [
     1584,
     -1225
    ],
    [
     88,
     -1225
    ]
   ]
  },
  {
   "id": "laguna-honda-slopes",
   "name": "Forest Hill and the Laguna Honda slopes",
   "character": "suburb",
   "poly": [
    [
     -2048,
     557
    ],
    [
     -968,
     557
    ],
    [
     -968,
     2048
    ],
    [
     -2048,
     2048
    ]
   ]
  }
 ],
 "sites": [
  {
   "id": "alamo-square-victorian-row",
   "name": "an Alamo Square Victorian Row Restoration",
   "kind": "construction",
   "position": [
    986,
    -1358
   ],
   "trades": [
    "carpenters",
    "iupat",
    "opcmia"
   ],
   "programmes": [
    "builders-trades",
    "cement-masons-and-plasterers",
    "roofers-and-waterproofers"
   ],
   "stations": [
    "paint-sprayer",
    "scaffold-erection",
    "masonry-silica-scaffold",
    "cm-exterior-plaster-scratch-brown-and-finish-coats",
    "rf-roof-tear-off-and-debris-chute"
   ],
   "blurb": "A row of Victorian houses under restoration: scaffold up, the old paint stripped with care, a new roof and fresh plaster."
  },
  {
   "id": "haight-victorian-renovation",
   "name": "a Haight Victorian House Renovation",
   "kind": "construction",
   "position": [
    -282,
    -913
   ],
   "trades": [
    "carpenters",
    "ua",
    "insulators",
    "ibew"
   ],
   "programmes": [
    "plumbers-and-pipefitters",
    "insulators-and-boilermakers",
    "roofers-and-waterproofers"
   ],
   "stations": [
    "ib-asbestos-glovebag-removal-on-a-pipe",
    "pl-water-heater-and-tpr-valve-replacement",
    "rf-skylight-and-hatch-guarding",
    "pl-natural-gas-pressure-test-and-leak-check"
   ],
   "blurb": "An old house being made sound inside: lagged pipe removed by the book, a new water heater, the gas line tested."
  },
  {
   "id": "castro-victorian-repaint",
   "name": "a Castro Victorian Repaint",
   "kind": "construction",
   "position": [
    458,
    423
   ],
   "trades": [
    "iupat",
    "carpenters"
   ],
   "programmes": [
    "builders-trades",
    "fall-protection"
   ],
   "stations": [
    "paint-sprayer",
    "scaffold-erection",
    "masonry-silica-scaffold",
    "leading-edge-and-horizontal-lifeline"
   ],
   "blurb": "A tall wooden front being repainted: the scaffold, the sprayer, dust control and a lifeline at the roof edge."
  },
  {
   "id": "duboce-hospital-campus",
   "name": "the Hospital Campus by Duboce Park",
   "kind": "hospital",
   "position": [
    598,
    -601
   ],
   "trades": [
    "nnu",
    "seiu",
    "afscme",
    "ua"
   ],
   "programmes": [
    "healthcare-support",
    "first-responders",
    "plumbers-and-pipefitters"
   ],
   "stations": [
    "hc-patient-transport-and-safe-handling",
    "hc-code-response-support-and-crash-cart-check",
    "hc-sterile-processing-decontamination-and-assembly",
    "pl-medical-gas-brazing-and-purge",
    "triage-point"
   ],
   "blurb": "A hospital campus on the hill's shoulder: patient moves, code carts, sterile processing and the medical gas lines."
  },
  {
   "id": "castro-station-transit",
   "name": "the Castro Street Station Crew",
   "kind": "transit",
   "position": [
    704,
    -22
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
    "ra-roadway-worker-protection-and-job-briefing",
    "tr-wheelchair-lift-and-securement-on-a-bus"
   ],
   "blurb": "The station under Market Street and the corridor above it: track access, the signal cabinet and the lift."
  },
  {
   "id": "church-street-line-crew",
   "name": "the Church Street Line Crew",
   "kind": "streetcar",
   "position": [
    1338,
    -468
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
   "blurb": "The streetcar line along Church Street: the switch, the crossing signals and the track slot on the hill."
  },
  {
   "id": "castro-theatre-stage-crew",
   "name": "the Castro's Theatre Stage Crew",
   "kind": "theatre",
   "position": [
    810,
    245
   ],
   "trades": [
    "iatse"
   ],
   "programmes": [
    "live-events",
    "screen-and-media-crafts"
   ],
   "stations": [
    "stage-power",
    "fly-system",
    "rigging-loft",
    "le-followspot-and-truss-access-at-height",
    "md-theatre-fly-floor-and-quick-change-lane"
   ],
   "blurb": "The crew behind the marquee: stage power, the fly system, the loft and the follow spot high on the truss."
  },
  {
   "id": "golden-gate-park-east-crew",
   "name": "the Golden Gate Park East End Crew",
   "kind": "park",
   "position": [
    -1496,
    -724
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
   "blurb": "The park crew yard at the east end of the park: pole saws, trimmers and the irrigation boxes."
  },
  {
   "id": "buena-vista-grounds",
   "name": "the Buena Vista Grounds Crew",
   "kind": "park",
   "position": [
    396,
    -980
   ],
   "trades": [
    "afscme",
    "liuna"
   ],
   "programmes": [
    "grounds-and-landscaping",
    "first-responders"
   ],
   "stations": [
    "gk-tree-work-pole-saw-and-drop-zone",
    "gk-chainsaw-start-and-limbing-on-the-ground",
    "gk-storm-cleanup-chipper-and-traffic-control",
    "wildland-urban-interface"
   ],
   "blurb": "The crew on the wooded hill: tree work, the chipper on a steep road and a watch on dry brush."
  },
  {
   "id": "haight-school-campus",
   "name": "a Haight School Campus",
   "kind": "school",
   "position": [
    -598,
    -390
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
   "blurb": "A school in the Haight: the playground check, the crossing guard's corner and the kitchen's safety labels."
  },
  {
   "id": "castro-restaurant-kitchens",
   "name": "the Castro's Restaurant Kitchens",
   "kind": "hospitality",
   "position": [
    986,
    -45
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
   "blurb": "A row of kitchens and bars near the theatre: the line, the hood, the bar well and the grease trap."
  },
  {
   "id": "cole-valley-fire-station",
   "name": "a Cole Valley Fire Station",
   "kind": "fire-station",
   "position": [
    -660,
    -111
   ],
   "trades": [
    "iaff",
    "naemt"
   ],
   "programmes": [
    "first-responders"
   ],
   "stations": [
    "wildland-urban-interface",
    "structure-fire-sizeup",
    "cardiac-arrest-pit-crew",
    "ambulance-scene-safety"
   ],
   "blurb": "A firehouse under the forested hills: the wildland edge, size-up on steep streets and cardiac response."
  },
  {
   "id": "mount-sutro-forest-crew",
   "name": "the Mount Sutro Forest Crew",
   "kind": "forestry",
   "position": [
    -1742,
    -111
   ],
   "trades": [
    "afscme",
    "liuna"
   ],
   "programmes": [
    "grounds-and-landscaping",
    "first-responders"
   ],
   "stations": [
    "gk-tree-work-pole-saw-and-drop-zone",
    "gk-chainsaw-start-and-limbing-on-the-ground",
    "gk-storm-cleanup-chipper-and-traffic-control",
    "wildland-urban-interface"
   ],
   "blurb": "The forest crew at the foot of Mount Sutro: pole saws, chainsaws, storm clean-up and the wildland edge."
  },
  {
   "id": "laguna-honda-valve-house",
   "name": "the Laguna Honda Reservoir Valve House",
   "kind": "pump",
   "position": [
    -1056,
    1225
   ],
   "trades": [
    "uwua",
    "iuoe",
    "afscme"
   ],
   "programmes": [
    "water-and-gas-utility-crews",
    "confined-space"
   ],
   "stations": [
    "valve-vault",
    "cs-permit-entry-and-attendant-duties",
    "ut-water-treatment-chemical-delivery-unloading",
    "lift-station"
   ],
   "blurb": "The valve house by the reservoir: the vault, a permit entry, the chemical delivery and the lift station."
  }
 ],
 "landmarks": [
  {
   "id": "painted-ladies",
   "name": "the Painted Ladies",
   "position": [
    880,
    -1469
   ],
   "kind": "place",
   "lm": "painted-ladies"
  },
  {
   "id": "castro-theatre-marquee",
   "name": "the Castro's theatre marquee",
   "position": [
    722,
    111
   ],
   "kind": "theatre-marquee"
  },
  {
   "id": "twin-peaks-summit",
   "name": "the top of Twin Peaks",
   "position": [
    -396,
    1169
   ],
   "kind": "hill"
  },
  {
   "id": "sutro-tower",
   "name": "Sutro Tower",
   "position": [
    -862,
    868
   ],
   "kind": "mast"
  },
  {
   "id": "haight-ashbury-corner",
   "name": "the corner of Haight and Ashbury",
   "position": [
    -334,
    -779
   ],
   "kind": "place"
  },
  {
   "id": "corona-heights-outcrop",
   "name": "the rock at Corona Heights",
   "position": [
    440,
    -223
   ],
   "kind": "hill"
  },
  {
   "id": "harvey-milk-plaza-flag",
   "name": "the flag at Harvey Milk Plaza",
   "position": [
    686,
    56
   ],
   "kind": "flag"
  },
  {
   "id": "kezar-stadium",
   "name": "Kezar Stadium",
   "position": [
    -1118,
    -423
   ],
   "kind": "place"
  },
  {
   "id": "haight-victorian-house",
   "name": "a Victorian house in the Haight",
   "position": [
    -176,
    -868
   ],
   "kind": "place",
   "lm": "victorian-house"
  },
  {
   "id": "castro-victorian-house",
   "name": "a Victorian house in the Castro",
   "position": [
    546,
    278
   ],
   "kind": "place",
   "lm": "victorian-house"
  }
 ],
 "connectors": [
  {
   "id": "sf-hc-fell-street-west",
   "kind": "road",
   "name": "Fell Street west into Golden Gate Park",
   "from": {
    "parish": "sf-haight-castro",
    "position": [
     -968,
     -1002
    ]
   },
   "to": {
    "parish": "sf-golden-gate-park",
    "position": [
     960,
     -452
    ],
    "lonlat": [
     -122.454,
     37.772
    ]
   },
   "lonlat": [
    -122.454,
    37.772
   ],
   "approximate": true
  },
  {
   "id": "sf-hc-market-street-east",
   "kind": "road",
   "name": "Market Street east toward Church Street and the Mission",
   "from": {
    "parish": "sf-haight-castro",
    "position": [
     1848,
     -1002
    ]
   },
   "to": {
    "parish": "sf-mission",
    "position": [
     -560,
     -452
    ],
    "lonlat": [
     -122.422,
     37.772
    ]
   },
   "lonlat": [
    -122.422,
    37.772
   ],
   "approximate": true
  },
  {
   "id": "sf-hc-seventeenth-street-east",
   "kind": "road",
   "name": "Seventeenth Street east to the Mission",
   "from": {
    "parish": "sf-haight-castro",
    "position": [
     1936,
     0
    ]
   },
   "to": {
    "parish": "sf-mission",
    "position": [
     -520,
     0
    ],
    "lonlat": [
     -122.421,
     37.763
    ]
   },
   "lonlat": [
    -122.421,
    37.763
   ],
   "approximate": true
  },
  {
   "id": "sf-hc-divisadero-north",
   "kind": "road",
   "name": "Divisadero Street north to Geary and the Western Addition",
   "from": {
    "parish": "sf-haight-castro",
    "position": [
     352,
     -2004
    ]
   },
   "to": {
    "parish": "sf-downtown",
    "position": [
     -1400,
     453
    ],
    "lonlat": [
     -122.439,
     37.781
    ]
   },
   "lonlat": [
    -122.439,
    37.781
   ],
   "approximate": true
  }
 ],
 "fieldLessons": [
  {
   "id": "sn-fl-victorian-scaffold",
   "title": "Why a Painter Builds a Scaffold",
   "site": "castro-victorian-repaint",
   "landmark": "haight-victorian-house",
   "k12": "k12-slope-and-angles-on-a-ramp",
   "station": "scaffold-erection",
   "trade": "Painters",
   "tradeLine": "A painter builds a level scaffold with rails before working high on a tall wooden house front.",
   "minutes": 3,
   "steps": [
    "Look up at the tall wooden front of the house.",
    "The painter builds a level scaffold with rails to stand on.",
    "A level base and full rails keep the painter from slipping or falling."
   ],
   "check": {
    "q": "Why does the scaffold need rails and a level base?",
    "options": [
     "So the painter cannot slip or fall",
     "So the paint dries faster",
     "So the house looks taller"
    ],
    "answer": 0,
    "why": "Rails and a level base keep a worker steady and safe up high."
   }
  },
  {
   "id": "sn-fl-streetcar-signal",
   "title": "Signals on the Streetcar Line",
   "site": "church-street-line-crew",
   "k12": "k12-by-a-streetcar-timetable",
   "station": "ra-crossing-signal-maintenance-and-flagging",
   "trade": "Streetcar signal crew",
   "tradeLine": "A streetcar signal crew keeps the lights at crossings working and flags traffic while they fix them.",
   "minutes": 3,
   "steps": [
    "Find the lights where the streetcar crosses a street.",
    "They tell cars and people when a streetcar is coming.",
    "When the crew fixes a light, a flagger guides traffic by hand."
   ],
   "check": {
    "q": "What does a flagger do while the signal is being fixed?",
    "options": [
     "Guides traffic safely by hand",
     "Drives the streetcar",
     "Sells tickets"
    ],
    "answer": 0,
    "why": "Someone must still tell people when it is safe to cross while the light is off."
   }
  },
  {
   "id": "sn-fl-reservoir-to-tap",
   "title": "From the Reservoir to the Tap",
   "site": "laguna-honda-valve-house",
   "k12": "k12-by-the-water-cycle-from-lake-to-tap",
   "station": "valve-vault",
   "trade": "Water system operators",
   "tradeLine": "A water operator opens and closes the big valves that send stored water down the hill to homes.",
   "minutes": 3,
   "steps": [
    "Look at the reservoir holding water on the hillside.",
    "Pipes carry the water downhill to homes and schools.",
    "Operators turn big valves in a vault to send it where it is needed."
   ],
   "check": {
    "q": "Why is a reservoir often up on a hill?",
    "options": [
     "Water can flow downhill to homes",
     "It is easier to swim in",
     "Hills are always wet"
    ],
    "answer": 0,
    "why": "Water stored high flows down through the pipes to the taps below."
   }
  }
 ],
 "gated": [
  {
   "id": "sn-hc-gated-marquee",
   "kind": "side-quest",
   "title": "Light the Marquee With the Stage Crew",
   "site": "castro-theatre-stage-crew",
   "siteName": "the Castro's Theatre Stage Crew",
   "gate": {
    "stations": [
     "stage-power"
    ],
    "note": "Learn how the stage crew handles show power before you help light the marquee"
   },
   "world": "parishes",
   "parish": "sf-haight-castro",
   "summary": "Light the Marquee With the Stage Crew"
  },
  {
   "id": "sn-hc-gated-painted-row",
   "kind": "side-quest",
   "title": "Colour a Painted Row",
   "site": "alamo-square-victorian-row",
   "siteName": "an Alamo Square Victorian Row Restoration",
   "gate": {
    "stations": [
     "scaffold-erection"
    ],
    "note": "Learn to build a safe scaffold before you help colour a Victorian row"
   },
   "world": "parishes",
   "parish": "sf-haight-castro",
   "summary": "Colour a Painted Row"
  }
 ]
};
