// the Sunset & Ocean Beach South — one 4096 m streamed San Francisco district on the shared parish schema
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

export const NP_SF_SUNSET_SOUTH = {
 "id": "sf-sunset-south",
 "name": "the Sunset & Ocean Beach South",
 "region": "san-francisco",
 "size": 4096,
 "scale": 1.2,
 "blurb": "The city's south-west corner on foot: Ocean Beach below the Sunset, the dunes and bluffs at Fort Funston, Lake Merced and its greens, Pine Lake and Stern Grove, the university campus, Stonestown and Merced Heights.",
 "start": "sf-state-campus-plant",
 "anchors": [
  {
   "xz": [
    -484,
    -510
   ],
   "lonlat": [
    -122.491,
    37.727
   ],
   "approximate": true,
   "name": "Lake Merced"
  },
  {
   "xz": [
    -1291,
    696
   ],
   "lonlat": [
    -122.502,
    37.714
   ],
   "approximate": true,
   "name": "Fort Funston"
  },
  {
   "xz": [
    396,
    -139
   ],
   "lonlat": [
    -122.479,
    37.723
   ],
   "approximate": true,
   "name": "the university campus"
  },
  {
   "xz": [
    616,
    -603
   ],
   "lonlat": [
    -122.476,
    37.728
   ],
   "approximate": true,
   "name": "Stonestown"
  },
  {
   "xz": [
    176,
    510
   ],
   "lonlat": [
    -122.482,
    37.716
   ],
   "approximate": true,
   "name": "Parkmerced"
  },
  {
   "xz": [
    -264,
    -1438
   ],
   "lonlat": [
    -122.488,
    37.737
   ],
   "approximate": true,
   "name": "Pine Lake"
  },
  {
   "xz": [
    -1365,
    -1067
   ],
   "lonlat": [
    -122.503,
    37.733
   ],
   "approximate": true,
   "name": "the zoo"
  },
  {
   "xz": [
    1057,
    325
   ],
   "lonlat": [
    -122.47,
    37.718
   ],
   "approximate": true,
   "name": "Merced Heights"
  },
  {
   "xz": [
    -1585,
    -1252
   ],
   "lonlat": [
    -122.506,
    37.735
   ],
   "approximate": true,
   "name": "Ocean Beach at Sloat Boulevard"
  }
 ],
 "hills": [
  {
   "id": "merced-heights",
   "name": "Merced Heights",
   "center": [
    1057,
    371
   ],
   "radius": 250,
   "height": 30
  }
 ],
 "water": [
  {
   "id": "pacific-ocean",
   "name": "the Pacific Ocean off Ocean Beach",
   "kind": "ocean",
   "poly": [
    [
     -2048,
     -2048
    ],
    [
     -1695,
     -2048
    ],
    [
     -1695,
     -2048
    ],
    [
     -1658,
     -1299
    ],
    [
     -1548,
     -417
    ],
    [
     -1438,
     325
    ],
    [
     -1365,
     1067
    ],
    [
     -1218,
     1716
    ],
    [
     -1108,
     2048
    ],
    [
     -2048,
     2048
    ]
   ]
  },
  {
   "id": "lake-merced",
   "name": "Lake Merced",
   "kind": "lake",
   "poly": [
    [
     -851,
     -974
    ],
    [
     -374,
     -1113
    ],
    [
     -44,
     -881
    ],
    [
     -7,
     -464
    ],
    [
     -264,
     -325
    ],
    [
     -631,
     -371
    ],
    [
     -925,
     -649
    ]
   ]
  },
  {
   "id": "lake-merced-south",
   "name": "Lake Merced's south arm",
   "kind": "lake",
   "poly": [
    [
     -851,
     -65
    ],
    [
     -448,
     28
    ],
    [
     -264,
     278
    ],
    [
     -338,
     696
    ],
    [
     -704,
     789
    ],
    [
     -925,
     464
    ]
   ]
  },
  {
   "id": "pine-lake",
   "name": "Pine Lake",
   "kind": "lake",
   "poly": [
    [
     -374,
     -1456
    ],
    [
     -81,
     -1438
    ],
    [
     -66,
     -1354
    ],
    [
     -360,
     -1345
    ]
   ]
  }
 ],
 "levees": [
  {
   "id": "great-highway-seawall",
   "name": "the seawall along the Great Highway",
   "height": 3.5,
   "pts": [
    [
     -1629,
     -1994
    ],
    [
     -1592,
     -1160
    ]
   ]
  },
  {
   "id": "lake-merced-embankment",
   "name": "the embankment along Lake Merced's east shore",
   "height": 2.5,
   "pts": [
    [
     44,
     -974
    ],
    [
     73,
     -371
    ]
   ]
  }
 ],
 "roads": [
  {
   "id": "great-highway",
   "name": "the Great Highway",
   "kind": "avenue",
   "pts": [
    [
     -1526,
     -2048
    ],
    [
     -1438,
     -1067
    ]
   ]
  },
  {
   "id": "skyline-boulevard",
   "name": "Skyline Boulevard",
   "kind": "avenue",
   "pts": [
    [
     -1438,
     -1067
    ],
    [
     -1291,
     -139
    ],
    [
     -1189,
     789
    ],
    [
     -1035,
     1531
    ],
    [
     -925,
     2041
    ]
   ]
  },
  {
   "id": "sloat-boulevard",
   "name": "Sloat Boulevard",
   "kind": "avenue",
   "pts": [
    [
     -1438,
     -1308
    ],
    [
     -411,
     -1308
    ],
    [
     690,
     -1308
    ]
   ]
  },
  {
   "id": "nineteenth-avenue",
   "name": "Nineteenth Avenue",
   "kind": "avenue",
   "pts": [
    [
     675,
     -2048
    ],
    [
     675,
     -139
    ],
    [
     895,
     1067
    ]
   ]
  },
  {
   "id": "ocean-avenue",
   "name": "Ocean Avenue",
   "kind": "street",
   "pts": [
    [
     323,
     -380
    ],
    [
     1424,
     -250
    ],
    [
     2011,
     -158
    ]
   ]
  },
  {
   "id": "lake-merced-boulevard",
   "name": "Lake Merced Boulevard",
   "kind": "street",
   "pts": [
    [
     132,
     -1206
    ],
    [
     161,
     139
    ],
    [
     -7,
     1067
    ]
   ]
  },
  {
   "id": "john-muir-drive",
   "name": "John Muir Drive",
   "kind": "street",
   "pts": [
    [
     -1145,
     1141
    ],
    [
     -264,
     1141
    ],
    [
     15,
     900
    ]
   ]
  },
  {
   "id": "brotherhood-way",
   "name": "Brotherhood Way",
   "kind": "street",
   "pts": [
    [
     616,
     789
    ],
    [
     1790,
     584
    ]
   ]
  },
  {
   "id": "junipero-serra-boulevard",
   "name": "Junipero Serra Boulevard",
   "kind": "avenue",
   "pts": [
    [
     969,
     -2048
    ],
    [
     1130,
     -789
    ],
    [
     925,
     1531
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "ocean-beach-south",
   "name": "Ocean Beach south and the zoo",
   "character": "park",
   "poly": [
    [
     -1695,
     -2048
    ],
    [
     -1071,
     -2048
    ],
    [
     -1071,
     -603
    ],
    [
     -1695,
     -603
    ]
   ]
  },
  {
   "id": "fort-funston",
   "name": "Fort Funston",
   "character": "park",
   "poly": [
    [
     -1438,
     139
    ],
    [
     -998,
     139
    ],
    [
     -998,
     1994
    ],
    [
     -1438,
     1994
    ]
   ]
  },
  {
   "id": "lake-merced-shores",
   "name": "Lake Merced and its greens",
   "character": "park",
   "poly": [
    [
     -1071,
     -1160
    ],
    [
     29,
     -1160
    ],
    [
     29,
     974
    ],
    [
     -1071,
     974
    ]
   ]
  },
  {
   "id": "the-parkside",
   "name": "the Parkside",
   "character": "suburb",
   "poly": [
    [
     -1071,
     -2048
    ],
    [
     616,
     -2048
    ],
    [
     616,
     -1308
    ],
    [
     -1071,
     -1308
    ]
   ]
  },
  {
   "id": "stonestown-and-the-campus",
   "name": "Stonestown and the university campus",
   "character": "campus",
   "poly": [
    [
     103,
     -1252
    ],
    [
     1057,
     -1252
    ],
    [
     1057,
     139
    ],
    [
     103,
     139
    ]
   ]
  },
  {
   "id": "parkmerced",
   "name": "Parkmerced",
   "character": "suburb",
   "poly": [
    [
     29,
     139
    ],
    [
     763,
     139
    ],
    [
     763,
     1160
    ],
    [
     29,
     1160
    ]
   ]
  },
  {
   "id": "merced-heights-and-ingleside",
   "name": "Merced Heights and Ingleside Terraces",
   "character": "garden",
   "poly": [
    [
     1057,
     -1160
    ],
    [
     2011,
     -1160
    ],
    [
     2011,
     1067
    ],
    [
     1057,
     1067
    ]
   ]
  },
  {
   "id": "westlake-edge",
   "name": "Westlake, over the county line",
   "character": "suburb",
   "poly": [
    [
     -998,
     1252
    ],
    [
     1790,
     1252
    ],
    [
     1790,
     2041
    ],
    [
     -998,
     2041
    ]
   ]
  }
 ],
 "sites": [
  {
   "id": "ocean-beach-south-lifeguards",
   "name": "the Ocean Beach South Lifeguard Crew",
   "kind": "lifeguard",
   "position": [
    -1365,
    -1716
   ],
   "trades": [
    "iaff",
    "afscme"
   ],
   "programmes": [
    "first-responders",
    "bay-restoration-maritime-underwater"
   ],
   "stations": [
    "br-cold-water-immersion-and-mob-recovery",
    "yc-man-overboard-recovery-drill",
    "cardiac-arrest-pit-crew",
    "ambulance-scene-safety"
   ],
   "blurb": "The beach crew below the Sunset: cold water, rip currents, a person in the water and a call for help."
  },
  {
   "id": "fort-funston-dune-crew",
   "name": "the Fort Funston Dune and Bluff Crew",
   "kind": "park",
   "position": [
    -1328,
    603
   ],
   "trades": [
    "afscme",
    "liuna"
   ],
   "programmes": [
    "marine-ecology-and-restoration",
    "grounds-and-landscaping"
   ],
   "stations": [
    "me-shoreline-debris-and-microplastics-survey",
    "me-invasive-species-identification-and-reporting",
    "gk-string-trimmer-and-blower-ppe-and-bystander-zone",
    "gk-storm-cleanup-chipper-and-traffic-control"
   ],
   "blurb": "The crew on the dunes above the beach: litter and plastics surveys, invasive plants, trimmers and storm clean-up."
  },
  {
   "id": "zoo-grounds-yard",
   "name": "the Zoo Grounds Crew Yard",
   "kind": "park",
   "position": [
    -1203,
    -955
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
   "blurb": "The grounds crew yard by the zoo: pole saws, trimmers and the irrigation boxes."
  },
  {
   "id": "sf-state-campus-plant",
   "name": "the University Campus Plant Room",
   "kind": "campus",
   "position": [
    382,
    -121
   ],
   "trades": [
    "aaup",
    "afscme",
    "seiu",
    "ibew"
   ],
   "programmes": [
    "stationary-engineer",
    "education-support-staff",
    "property-management"
   ],
   "stations": [
    "chiller-plant",
    "boiler-room",
    "ed-science-lab-chemical-storage-and-eyewash",
    "pm-fire-alarm-panel-room"
   ],
   "blurb": "The plant room under the campus: the chiller, the boiler, the lab's chemical store and the fire alarm panel."
  },
  {
   "id": "stonestown-housing-site",
   "name": "a Stonestown Housing Construction Site",
   "kind": "construction",
   "position": [
    506,
    -714
   ],
   "trades": [
    "carpenters",
    "liuna",
    "ironworkers",
    "opcmia"
   ],
   "programmes": [
    "builders-trades"
   ],
   "stations": [
    "concrete-pour",
    "formwork-shoring",
    "bt-rebar-tying-and-impalement-protection",
    "mass-timber-panel-set"
   ],
   "blurb": "A new housing block going up: the concrete pour, the forms and shores, capped rebar and timber panels."
  },
  {
   "id": "stonestown-grocery-dock",
   "name": "the Stonestown Grocery Receiving Dock",
   "kind": "warehouse",
   "position": [
    396,
    -1067
   ],
   "trades": [
    "ufcw",
    "teamsters"
   ],
   "programmes": [
    "grocery-and-meatpacking"
   ],
   "stations": [
    "gr-produce-receiving-cold-chain-and-pallet-jack",
    "gr-night-stocking-baler-and-compactor-lockout",
    "gr-deli-slicer-sanitation-and-allergen-line",
    "gr-checkstand-ergonomics-and-robbery-prevention"
   ],
   "blurb": "A grocery's back dock: the cold chain, the baler and compactor, the deli slicer and the checkstand."
  },
  {
   "id": "parkmerced-grounds",
   "name": "the Parkmerced Grounds Crew",
   "kind": "park",
   "position": [
    323,
    510
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
   "blurb": "The crew that keeps the lawns and trees between the towers: pole saws, trimmers and the irrigation boxes."
  },
  {
   "id": "ingleside-school-campus",
   "name": "an Ingleside Terraces School Campus",
   "kind": "school",
   "position": [
    1482,
    -436
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
   "blurb": "A school on the hill's shoulder: the playground check, the crossing guard's corner and the kitchen's labels."
  },
  {
   "id": "nineteenth-avenue-fire-station",
   "name": "a Nineteenth Avenue Fire Station",
   "kind": "fire-station",
   "position": [
    851,
    -1735
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
   "blurb": "A firehouse on the avenue: size-up, the aerial ladder, rehab and a scene kept safe for the ambulance."
  },
  {
   "id": "stern-grove-crew",
   "name": "the Stern Grove and Pine Lake Crew",
   "kind": "forestry",
   "position": [
    103,
    -1605
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
   "blurb": "The crew in the grove's tall trees: pole saws, chainsaws, the chipper and a watch on dry brush."
  },
  {
   "id": "stern-grove-stage-crew",
   "name": "the Stern Grove Stage Crew",
   "kind": "theatre",
   "position": [
    338,
    -1456
   ],
   "trades": [
    "iatse"
   ],
   "programmes": [
    "live-events"
   ],
   "stations": [
    "stage-power",
    "rigging-loft",
    "stage-load-in-and-truss-rigging",
    "le-crowd-barricade-and-show-stop-call"
   ],
   "blurb": "The outdoor stage in the grove: show power, the loft, the truss load-in and the crowd barricade."
  },
  {
   "id": "lake-merced-greens-crew",
   "name": "the Lake Merced Greens Crew",
   "kind": "park",
   "position": [
    -668,
    -232
   ],
   "trades": [
    "afscme",
    "liuna",
    "iuoe"
   ],
   "programmes": [
    "grounds-and-landscaping"
   ],
   "stations": [
    "gk-greens-mowing-and-hole-changing",
    "gk-bunker-renovation-and-drainage",
    "gk-pesticide-and-fertilizer-application-per-the-label",
    "gk-irrigation-controller-valve-box-and-backflow-check"
   ],
   "blurb": "The greens crew between the lake's arms: mowing and hole changes, bunkers, fertiliser by the label and irrigation."
  },
  {
   "id": "lake-merced-pump-crew",
   "name": "the Lake Merced Pump Station Crew",
   "kind": "pump",
   "position": [
    -1035,
    -371
   ],
   "trades": [
    "iuoe",
    "uwua",
    "afscme"
   ],
   "programmes": [
    "water-and-gas-utility-crews",
    "confined-space"
   ],
   "stations": [
    "lift-station",
    "stormwater-outfall",
    "valve-vault",
    "cs-permit-entry-and-attendant-duties"
   ],
   "blurb": "The pump crew at the lake's edge: the lift station, the storm outfall, the valve vault and a permit entry."
  },
  {
   "id": "nineteenth-avenue-line-crew",
   "name": "the Nineteenth Avenue Streetcar Crew",
   "kind": "streetcar",
   "position": [
    851,
    -28
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
   "blurb": "The streetcar line down the avenue past the campus: the switch, the crossing signals and the track slot."
  }
 ],
 "landmarks": [
  {
   "id": "lake-merced-shore",
   "name": "Lake Merced",
   "position": [
    66,
    -696
   ],
   "kind": "shore"
  },
  {
   "id": "fort-funston-bluffs",
   "name": "the bluffs at Fort Funston",
   "position": [
    -1402,
    789
   ],
   "kind": "point"
  },
  {
   "id": "ocean-beach",
   "name": "Ocean Beach",
   "position": [
    -1585,
    -1623
   ],
   "kind": "shore"
  },
  {
   "id": "the-zoo",
   "name": "the zoo",
   "position": [
    -1328,
    -1113
   ],
   "kind": "place"
  },
  {
   "id": "pine-lake-shore",
   "name": "Pine Lake",
   "position": [
    -44,
    -1401
   ],
   "kind": "shore"
  },
  {
   "id": "stern-grove",
   "name": "Stern Grove",
   "position": [
    249,
    -1512
   ],
   "kind": "place"
  },
  {
   "id": "university-campus",
   "name": "the university campus",
   "position": [
    323,
    -232
   ],
   "kind": "campus"
  },
  {
   "id": "merced-heights",
   "name": "Merced Heights",
   "position": [
    1057,
    371
   ],
   "kind": "hill"
  }
 ],
 "connectors": [
  {
   "id": "sf-ss-great-highway-north",
   "kind": "road",
   "name": "The Great Highway north along Ocean Beach",
   "from": {
    "parish": "sf-sunset-south",
    "position": [
     -1512,
     -1994
    ]
   },
   "to": {
    "parish": "sf-golden-gate-park",
    "position": [
     -1080,
     1005
    ],
    "lonlat": [
     -122.505,
     37.743
    ]
   },
   "lonlat": [
    -122.505,
    37.743
   ],
   "approximate": true
  },
  {
   "id": "sf-ss-nineteenth-avenue-north",
   "kind": "road",
   "name": "Nineteenth Avenue north through the Sunset",
   "from": {
    "parish": "sf-sunset-south",
    "position": [
     690,
     -1994
    ]
   },
   "to": {
    "parish": "sf-golden-gate-park",
    "position": [
     120,
     1005
    ],
    "lonlat": [
     -122.475,
     37.743
    ]
   },
   "lonlat": [
    -122.475,
    37.743
   ],
   "approximate": true
  },
  {
   "id": "sf-ss-ocean-avenue-east",
   "kind": "road",
   "name": "Ocean Avenue east to the Outer Mission",
   "from": {
    "parish": "sf-sunset-south",
    "position": [
     1937,
     46
    ]
   },
   "to": {
    "parish": "sf-outer-mission",
    "position": null,
    "lonlat": [
     -122.458,
     37.721
    ]
   },
   "lonlat": [
    -122.458,
    37.721
   ],
   "approximate": true
  }
 ],
 "fieldLessons": [
  {
   "id": "sn-fl-rip-current",
   "title": "Reading the Water at Ocean Beach",
   "site": "ocean-beach-south-lifeguards",
   "landmark": "ocean-beach",
   "k12": "k12-first-aid-awareness-call-for-help",
   "station": "br-cold-water-immersion-and-mob-recovery",
   "trade": "Ocean lifeguards",
   "tradeLine": "An ocean lifeguard reads the waves for rip currents and calls for help before anyone else goes in.",
   "minutes": 3,
   "steps": [
    "Look at the waves rolling in along the beach.",
    "A calm-looking gap can be a rip current pulling out to sea.",
    "If someone is in trouble, call a lifeguard instead of swimming out."
   ],
   "check": {
    "q": "What should you do if you see someone in trouble in the water?",
    "options": [
     "Call a lifeguard for help",
     "Swim out alone",
     "Walk away"
    ],
    "answer": 0,
    "why": "Lifeguards are trained and equipped for cold water; calling them keeps more people safe."
   }
  },
  {
   "id": "sn-fl-dune-plants",
   "title": "Plants That Hold the Dunes",
   "site": "fort-funston-dune-crew",
   "landmark": "fort-funston-bluffs",
   "k12": "k12-ecosystems-at-the-kelp-transect",
   "station": "me-invasive-species-identification-and-reporting",
   "trade": "Dune restoration crew",
   "tradeLine": "A dune crew learns which plants belong on the dunes and reports the ones that crowd them out.",
   "minutes": 3,
   "steps": [
    "Look at the low plants growing on the sand.",
    "Their roots hold the sand when the wind blows.",
    "The crew reports plants that do not belong so native ones can grow."
   ],
   "check": {
    "q": "Why do dune plants matter?",
    "options": [
     "Their roots hold the sand in place",
     "They make the beach louder",
     "They keep the water warm"
    ],
    "answer": 0,
    "why": "Roots bind the sand so the wind and waves do not carry the dunes away."
   }
  },
  {
   "id": "sn-fl-lake-pump",
   "title": "What a Pump Station Does in the Rain",
   "site": "lake-merced-pump-crew",
   "landmark": "lake-merced-shore",
   "k12": "k12-by-what-a-pump-station-does-in-the-rain",
   "station": "lift-station",
   "trade": "Pump station operators",
   "tradeLine": "A pump station operator checks the pumps and alarms so rain water keeps moving when storms come.",
   "minutes": 3,
   "steps": [
    "Find the small building by the lake's edge.",
    "Inside, pumps lift water so it can flow where it should.",
    "The crew checks the pumps and alarms before a storm arrives."
   ],
   "check": {
    "q": "Why does the crew check the pumps before a storm?",
    "options": [
     "So water keeps moving when rain falls",
     "So the lake gets bigger",
     "So the building stays warm"
    ],
    "answer": 0,
    "why": "Working pumps move storm water away before streets and homes flood."
   }
  }
 ],
 "gated": [
  {
   "id": "sn-ss-gated-beach-patrol",
   "kind": "side-quest",
   "title": "Beach Patrol at Low Tide",
   "site": "ocean-beach-south-lifeguards",
   "siteName": "the Ocean Beach South Lifeguard Crew",
   "gate": {
    "stations": [
     "br-cold-water-immersion-and-mob-recovery"
    ],
    "note": "Learn cold water safety before you walk the beach patrol with the lifeguards"
   },
   "world": "parishes",
   "parish": "sf-sunset-south",
   "summary": "Beach Patrol at Low Tide"
  },
  {
   "id": "sn-ss-gated-grove-show",
   "kind": "side-quest",
   "title": "Set Up the Grove Stage",
   "site": "stern-grove-stage-crew",
   "siteName": "the Stern Grove Stage Crew",
   "gate": {
    "stations": [
     "stage-load-in-and-truss-rigging"
    ],
    "note": "Learn the load-in and truss rigging before you help set up the stage in the grove"
   },
   "world": "parishes",
   "parish": "sf-sunset-south",
   "summary": "Set Up the Grove Stage"
  }
 ]
};
