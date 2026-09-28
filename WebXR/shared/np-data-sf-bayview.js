// Bayview & Hunters Point — one 4096 m streamed San Francisco district on the shared parish
// schema (docs/parishes.md, docs/consoles/GOLDEN-B.md), region "san-francisco".
//
// Facts rule: real places appear only by their public names, as places (a
// district, a neighbourhood, a park, a bridge, a creek, a shipyard, a port);
// no history, dates, statistics, addresses, business or venue-sponsor names.
// Coordinates are approximate (three decimals, `approximate: true`) and exist
// only to place a map: the district is drawn at a stylised scale (about one
// world metre to two real metres) so the southern terminals, Islais Creek, the shipyard and the two wetlands fit one field. Nothing here is
// survey data and no real building is modelled. `hills` are gentle
// procedural mounds, named only (no elevation is quoted).
//
// Conventions (docs/parishes.md): x east, z south, the field [-2048, 2048]²;
// a water `poly` with a `width` is a centreline, without one a closed
// polygon; a connector's far end is the crossing's approximate `lonlat`
// (`position: null`) and np-parishes.js resolves it through the other
// district's fit once that module exists.
//
// Written from approximate lon/lat by a scratch script; edit the numbers here
// directly. Pure: no three.js, no DOM. Every top-level name is prefixed
// np/NP_ (the bundler concatenates all modules into one scope).

export const NP_SF_BAYVIEW = {
 "id": "sf-bayview",
 "name": "Bayview & Hunters Point",
 "region": "san-francisco",
 "size": 4096,
 "blurb": "San Francisco's south-east shore: the port's southern terminals and the rail yard at Islais Creek, the Third Street light rail, the shipyard at Hunters Point where the clean-up crews work, and the wetlands coming back at Heron's Head and Yosemite Slough.",
 "start": "port-southern-terminals",
 "anchors": [
  {
   "xz": [
    -258,
    -539
   ],
   "lonlat": [
    -122.388,
    37.743
   ],
   "approximate": true,
   "name": "Islais Creek"
  },
  {
   "xz": [
    301,
    -324
   ],
   "lonlat": [
    -122.375,
    37.739
   ],
   "approximate": true,
   "name": "Heron's Head Park"
  },
  {
   "xz": [
    129,
    -54
   ],
   "lonlat": [
    -122.379,
    37.734
   ],
   "approximate": true,
   "name": "India Basin"
  },
  {
   "xz": [
    687,
    432
   ],
   "lonlat": [
    -122.366,
    37.725
   ],
   "approximate": true,
   "name": "the Hunters Point shipyard"
  },
  {
   "xz": [
    -86,
    917
   ],
   "lonlat": [
    -122.384,
    37.716
   ],
   "approximate": true,
   "name": "Yosemite Slough"
  },
  {
   "xz": [
    43,
    1241
   ],
   "lonlat": [
    -122.381,
    37.71
   ],
   "approximate": true,
   "name": "Candlestick Point"
  },
  {
   "xz": [
    -515,
    1133
   ],
   "lonlat": [
    -122.394,
    37.712
   ],
   "approximate": true,
   "name": "Bayview Hill"
  },
  {
   "xz": [
    -301,
    -108
   ],
   "lonlat": [
    -122.389,
    37.735
   ],
   "approximate": true,
   "name": "the Third Street corridor"
  }
 ],
 "hills": [
  {
   "id": "bayview-hill",
   "name": "Bayview Hill",
   "center": [
    -580,
    1160
   ],
   "radius": 230,
   "height": 34
  },
  {
   "id": "hunters-point-hill",
   "name": "Hunters Point hill",
   "center": [
    193,
    324
   ],
   "radius": 110,
   "height": 20
  },
  {
   "id": "bernal-heights",
   "name": "Bernal Heights",
   "center": [
    -1310,
    -566
   ],
   "radius": 180,
   "height": 30
  }
 ],
 "water": [
  {
   "id": "san-francisco-bay",
   "name": "San Francisco Bay",
   "kind": "gulf",
   "poly": [
    [
     -64,
     -2048
    ],
    [
     -43,
     -1672
    ],
    [
     -21,
     -1375
    ],
    [
     21,
     -944
    ],
    [
     64,
     -809
    ],
    [
     451,
     -755
    ],
    [
     472,
     -550
    ],
    [
     129,
     -529
    ],
    [
     129,
     -442
    ],
    [
     451,
     -405
    ],
    [
     408,
     -280
    ],
    [
     107,
     -227
    ],
    [
     43,
     -81
    ],
    [
     322,
     65
    ],
    [
     666,
     97
    ],
    [
     1052,
     297
    ],
    [
     1095,
     485
    ],
    [
     966,
     674
    ],
    [
     601,
     728
    ],
    [
     301,
     890
    ],
    [
     129,
     998
    ],
    [
     193,
     1241
    ],
    [
     86,
     1375
    ],
    [
     -172,
     1375
    ],
    [
     -365,
     1564
    ],
    [
     -365,
     2048
    ],
    [
     2048,
     2048
    ],
    [
     2048,
     -2048
    ]
   ]
  },
  {
   "id": "islais-creek",
   "name": "Islais Creek",
   "kind": "canal",
   "width": 44,
   "poly": [
    [
     -709,
     -496
    ],
    [
     -429,
     -529
    ],
    [
     -129,
     -529
    ],
    [
     129,
     -485
    ]
   ]
  },
  {
   "id": "herons-head-marsh",
   "name": "the Heron's Head marsh",
   "kind": "wetland",
   "poly": [
    [
     193,
     -356
    ],
    [
     344,
     -378
    ],
    [
     387,
     -313
    ],
    [
     206,
     -291
    ]
   ]
  },
  {
   "id": "yosemite-slough",
   "name": "Yosemite Slough",
   "kind": "wetland",
   "poly": [
    [
     -322,
     782
    ],
    [
     -107,
     744
    ],
    [
     129,
     917
    ],
    [
     86,
     982
    ],
    [
     -258,
     890
    ]
   ]
  }
 ],
 "levees": [
  {
   "id": "pier-seawall",
   "name": "the terminal seawall",
   "height": 4,
   "pts": [
    [
     -64,
     -1241
    ],
    [
     -68,
     -1124
    ],
    [
     -43,
     -998
    ]
   ]
  },
  {
   "id": "shipyard-shoreline-berm",
   "name": "the shipyard shoreline berm",
   "height": 3.5,
   "pts": [
    [
     773,
     216
    ],
    [
     856,
     328
    ],
    [
     988,
     334
    ]
   ]
  }
 ],
 "roads": [
  {
   "id": "third-street",
   "name": "Third Street",
   "kind": "avenue",
   "pts": [
    [
     -279,
     -2048
    ],
    [
     -301,
     -1375
    ],
    [
     -301,
     -1187
    ],
    [
     -279,
     -809
    ],
    [
     -301,
     -485
    ],
    [
     -344,
     -108
    ],
    [
     -494,
     324
    ],
    [
     -666,
     701
    ],
    [
     -795,
     1160
    ],
    [
     -837,
     1397
    ]
   ]
  },
  {
   "id": "bayshore-boulevard",
   "name": "Bayshore Boulevard",
   "kind": "avenue",
   "pts": [
    [
     -1095,
     -1375
    ],
    [
     -1031,
     -809
    ],
    [
     -945,
     -108
    ],
    [
     -923,
     593
    ],
    [
     -966,
     1397
    ]
   ]
  },
  {
   "id": "us-101",
   "name": "the Bayshore Freeway",
   "kind": "interstate",
   "pts": [
    [
     -923,
     -1375
    ],
    [
     -816,
     -809
    ],
    [
     -752,
     -270
    ],
    [
     -666,
     297
    ],
    [
     -365,
     728
    ],
    [
     -429,
     1241
    ],
    [
     -601,
     1397
    ]
   ]
  },
  {
   "id": "cesar-chavez-street",
   "name": "Cesar Chavez Street",
   "kind": "street",
   "pts": [
    [
     -1400,
     -820
    ],
    [
     -1031,
     -820
    ],
    [
     -558,
     -836
    ],
    [
     -150,
     -852
    ]
   ]
  },
  {
   "id": "evans-avenue",
   "name": "Evans Avenue",
   "kind": "street",
   "pts": [
    [
     -558,
     -701
    ],
    [
     -301,
     -475
    ],
    [
     -86,
     -297
    ],
    [
     -52,
     -81
    ]
   ]
  },
  {
   "id": "innes-avenue",
   "name": "Innes Avenue",
   "kind": "street",
   "pts": [
    [
     -344,
     -108
    ],
    [
     -43,
     -27
    ],
    [
     258,
     135
    ],
    [
     558,
     270
    ]
   ]
  },
  {
   "id": "palou-avenue",
   "name": "Palou Avenue",
   "kind": "street",
   "pts": [
    [
     -923,
     0
    ],
    [
     -601,
     65
    ],
    [
     -344,
     81
    ],
    [
     -86,
     216
    ]
   ]
  },
  {
   "id": "shipyard-road",
   "name": "the shipyard road",
   "kind": "street",
   "pts": [
    [
     558,
     270
    ],
    [
     730,
     405
    ],
    [
     902,
     539
    ],
    [
     687,
     636
    ]
   ]
  },
  {
   "id": "gilman-avenue",
   "name": "Gilman Avenue",
   "kind": "street",
   "pts": [
    [
     -773,
     836
    ],
    [
     -429,
     782
    ],
    [
     -215,
     1052
    ],
    [
     -43,
     1187
    ]
   ]
  },
  {
   "id": "terminal-road",
   "name": "the terminal road",
   "kind": "street",
   "pts": [
    [
     -279,
     -1025
    ],
    [
     -129,
     -971
    ],
    [
     -129,
     -755
    ],
    [
     -86,
     -674
    ]
   ]
  },
  {
   "id": "cargo-way",
   "name": "Cargo Way",
   "kind": "street",
   "pts": [
    [
     -215,
     -658
    ],
    [
     86,
     -658
    ],
    [
     365,
     -658
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "port-south",
   "name": "the port's southern terminals",
   "character": "port",
   "poly": [
    [
     -258,
     -2048
    ],
    [
     -258,
     -674
    ],
    [
     43,
     -647
    ],
    [
     -21,
     -1375
    ],
    [
     -64,
     -2048
    ]
   ]
  },
  {
   "id": "pier-96-yard",
   "name": "the terminals by Islais Creek",
   "character": "port",
   "poly": [
    [
     64,
     -744
    ],
    [
     438,
     -734
    ],
    [
     451,
     -566
    ],
    [
     64,
     -577
    ]
   ]
  },
  {
   "id": "islais-industrial",
   "name": "the Islais Creek industrial flank",
   "character": "industrial",
   "poly": [
    [
     -902,
     -1025
    ],
    [
     -258,
     -1025
    ],
    [
     -258,
     -162
    ],
    [
     -773,
     -162
    ]
   ]
  },
  {
   "id": "mission-edge",
   "name": "the Mission's south-east edge",
   "character": "quarter",
   "poly": [
    [
     -2048,
     -2048
    ],
    [
     -258,
     -2048
    ],
    [
     -258,
     -1025
    ],
    [
     -902,
     -1025
    ],
    [
     -945,
     -162
    ],
    [
     -2048,
     -162
    ]
   ]
  },
  {
   "id": "bayview",
   "name": "Bayview",
   "character": "suburb",
   "poly": [
    [
     -902,
     -162
    ],
    [
     -258,
     -162
    ],
    [
     -43,
     432
    ],
    [
     -344,
     701
    ],
    [
     -902,
     647
    ]
   ]
  },
  {
   "id": "hunters-point",
   "name": "Hunters Point",
   "character": "suburb",
   "poly": [
    [
     -258,
     -108
    ],
    [
     43,
     0
    ],
    [
     472,
     243
    ],
    [
     258,
     432
    ],
    [
     -43,
     432
    ]
   ]
  },
  {
   "id": "shipyard",
   "name": "the Hunters Point shipyard",
   "character": "industrial",
   "poly": [
    [
     472,
     243
    ],
    [
     945,
     367
    ],
    [
     966,
     620
    ],
    [
     558,
     674
    ],
    [
     258,
     432
    ]
   ]
  },
  {
   "id": "candlestick",
   "name": "Candlestick Point",
   "character": "wetland",
   "poly": [
    [
     -344,
     1025
    ],
    [
     86,
     1025
    ],
    [
     129,
     1321
    ],
    [
     -301,
     1537
    ]
   ]
  },
  {
   "id": "visitacion",
   "name": "Visitacion Valley's edge",
   "character": "suburb",
   "poly": [
    [
     -2048,
     701
    ],
    [
     -773,
     701
    ],
    [
     -601,
     2048
    ],
    [
     -2048,
     2048
    ]
   ]
  },
  {
   "id": "bernal-portola",
   "name": "Portola and Silver Terrace",
   "character": "suburb",
   "poly": [
    [
     -2048,
     -162
    ],
    [
     -945,
     -162
    ],
    [
     -945,
     647
    ],
    [
     -2048,
     647
    ]
   ]
  }
 ],
 "sites": [
  {
   "id": "port-southern-terminals",
   "name": "Port Southern Terminals",
   "kind": "port",
   "position": [
    -172,
    -998
   ],
   "trades": [
    "ilwu",
    "iuoe",
    "teamsters"
   ],
   "programmes": [
    "port-operations",
    "rigging-lifting"
   ],
   "stations": [
    "dock-crane",
    "container-lashing",
    "mooring-line",
    "po-yard-hostler-and-pedestrian-separation",
    "po-lashing-gear-inspection-and-tagging",
    "pt-dock-fender-and-bollard-inspection"
   ],
   "blurb": "The port's southern terminals north of Islais Creek: cranes over the berths, lashing gangs, the mooring lines and the hostlers in the yard."
  },
  {
   "id": "islais-rail-yard",
   "name": "Islais Creek Rail Yard",
   "kind": "rail",
   "position": [
    -515,
    -674
   ],
   "trades": [
    "smart-td",
    "bmwed",
    "brs",
    "blet"
   ],
   "programmes": [
    "railroad-crafts"
   ],
   "stations": [
    "ra-blue-flag-protection-in-the-yard",
    "ra-switch-inspection-and-lubrication",
    "ra-air-brake-test-and-train-inspection",
    "ra-hand-brake-and-securement-on-a-grade",
    "ra-roadway-worker-protection-and-job-briefing"
   ],
   "blurb": "The rail yard beside Islais Creek that serves the terminals: blue flags up before anyone goes between cars, switches oiled, brakes tested."
  },
  {
   "id": "third-street-rail-barn",
   "name": "Third Street Light-Rail Barn",
   "kind": "transit-barn",
   "position": [
    -172,
    -1160
   ],
   "trades": [
    "twu-local250a",
    "ibew",
    "atu"
   ],
   "programmes": [
    "transit-ramp"
   ],
   "stations": [
    "bus-depot-lift",
    "signal-cabinet",
    "tr-wheelchair-lift-and-securement-on-a-bus",
    "substation-switching"
   ],
   "blurb": "The light-rail barn at the top of Third Street: cars on the pit lift, the signal cabinets and the traction power switched under a permit."
  },
  {
   "id": "hunters-point-shipyard",
   "name": "Hunters Point Shipyard",
   "kind": "shipyard",
   "position": [
    709,
    485
   ],
   "trades": [
    "liuna",
    "iuoe",
    "teamsters"
   ],
   "programmes": [
    "hunters-point-bay-restoration",
    "hazmat-environmental"
   ],
   "stations": [
    "hunters-point",
    "hazwoper-site-orientation",
    "rad-survey",
    "building-rad-scan",
    "air-monitor",
    "pcb-equipment-removal"
   ],
   "blurb": "The shipyard site where the clean-up programme starts: the record read first, then the survey walked, buildings scanned and the fence-line air watched."
  },
  {
   "id": "shipyard-soil-cell",
   "name": "Shipyard Soil Excavation Cell",
   "kind": "remediation",
   "position": [
    515,
    550
   ],
   "trades": [
    "liuna",
    "iuoe",
    "teamsters"
   ],
   "programmes": [
    "hunters-point-bay-restoration"
   ],
   "stations": [
    "soil-loadout",
    "haul-road-dust",
    "transite-pipe-removal",
    "ust-removal",
    "decon-line"
   ],
   "blurb": "The excavation cell on the shipyard's south side: soil loaded out under a manifest, the haul road kept wet and everyone leaving through the decon line."
  },
  {
   "id": "shipyard-groundwater-yard",
   "name": "Shipyard Groundwater Treatment Yard",
   "kind": "remediation",
   "position": [
    880,
    442
   ],
   "trades": [
    "ua",
    "liuna",
    "iuoe"
   ],
   "programmes": [
    "hunters-point-bay-restoration"
   ],
   "stations": [
    "sampling-well",
    "well-install",
    "pump-and-treat",
    "isco-injection",
    "vapor-mitigation"
   ],
   "blurb": "The groundwater yard: monitoring wells put in and sampled, the treatment system run, and the vapour under the slabs drawn off."
  },
  {
   "id": "shipyard-shoreline-crew",
   "name": "Shipyard Shoreline and Sediment Crew",
   "kind": "shoreline",
   "position": [
    752,
    620
   ],
   "trades": [
    "carpenters",
    "iuoe",
    "ibu"
   ],
   "programmes": [
    "hunters-point-bay-restoration",
    "bay-restoration-maritime-underwater"
   ],
   "stations": [
    "dredge-barge",
    "sediment-cap",
    "creosote-pile-removal",
    "tide-gate"
   ],
   "blurb": "The marine crew at the shipyard's edge: sediment dredged and capped, old creosote piles pulled and the tide gate kept working."
  },
  {
   "id": "herons-head-wetland",
   "name": "Heron's Head Wetland Restoration",
   "kind": "wetland",
   "position": [
    279,
    -334
   ],
   "trades": [
    "liuna",
    "afscme"
   ],
   "programmes": [
    "hunters-point-bay-restoration",
    "marine-ecology-and-restoration"
   ],
   "stations": [
    "marsh-transect-survey",
    "living-shoreline",
    "spartina-removal",
    "oyster-reef-monitoring"
   ],
   "blurb": "The restored marsh at Heron's Head Park: transects walked on a falling tide, a living shoreline built and the reef tiles counted."
  },
  {
   "id": "yosemite-slough-restoration",
   "name": "Yosemite Slough Restoration Site",
   "kind": "wetland",
   "position": [
    -129,
    852
   ],
   "trades": [
    "liuna",
    "iuoe",
    "afscme"
   ],
   "programmes": [
    "hunters-point-bay-restoration",
    "grounds-and-landscaping"
   ],
   "stations": [
    "stormwater-outfall",
    "bioswale-build",
    "eelgrass-transplant",
    "br-shoreline-cleanup-sharps-and-hazardous-debris"
   ],
   "blurb": "The slough being given back to the tide: the outfall sampled in the rain, a bioswale built to grade and eelgrass planted at the edge."
  },
  {
   "id": "bayview-rec-centre",
   "name": "Bayview Recreation Centre",
   "kind": "recreation",
   "position": [
    -494,
    162
   ],
   "trades": [
    "afscme",
    "seiu-1021"
   ],
   "programmes": [
    "basketball-fundamentals",
    "property-management"
   ],
   "stations": [
    "bb-warmup-injury-prevention-and-hydration",
    "bb-scrimmage-and-sportsmanship-debrief",
    "pm-pool-and-spa-chemistry",
    "pm-community-room-and-events",
    "ed-playground-equipment-inspection"
   ],
   "blurb": "The neighbourhood's recreation centre: the gym and the court, the pool's water tested, the playground walked and the community room set for the evening."
  },
  {
   "id": "india-basin-park-crew",
   "name": "India Basin Shoreline Park Crew",
   "kind": "park",
   "position": [
    64,
    43
   ],
   "trades": [
    "afscme",
    "liuna"
   ],
   "programmes": [
    "grounds-and-landscaping"
   ],
   "stations": [
    "gk-irrigation-controller-valve-box-and-backflow-check",
    "gk-ride-on-mower-pre-start-and-slope-work",
    "gk-hardscape-paver-base-and-compaction",
    "pm-landscaping-and-irrigation"
   ],
   "blurb": "The park crew on the India Basin shore: the lawns and paths, the irrigation valves and the new paving by the water."
  }
 ],
 "landmarks": [
  {
   "id": "islais-creek",
   "name": "Islais Creek",
   "position": [
    -301,
    -539
   ],
   "kind": "canal"
  },
  {
   "id": "herons-head-park",
   "name": "Heron's Head Park",
   "position": [
    365,
    -334
   ],
   "kind": "point"
  },
  {
   "id": "india-basin",
   "name": "India Basin",
   "position": [
    86,
    -108
   ],
   "kind": "shore"
  },
  {
   "id": "shipyard-dry-docks",
   "name": "the shipyard's dry docks",
   "position": [
    816,
    405
   ],
   "kind": "shipyard"
  },
  {
   "id": "shipyard-gantry-crane",
   "name": "the shipyard's gantry crane",
   "position": [
    953,
    512
   ],
   "kind": "point"
  },
  {
   "id": "yosemite-slough",
   "name": "Yosemite Slough",
   "position": [
    -43,
    890
   ],
   "kind": "shore"
  },
  {
   "id": "candlestick-point",
   "name": "Candlestick Point",
   "position": [
    21,
    1268
   ],
   "kind": "point"
  },
  {
   "id": "bayview-hill",
   "name": "Bayview Hill",
   "position": [
    -580,
    1160
   ],
   "kind": "hill"
  },
  {
   "id": "third-street-light-rail",
   "name": "the Third Street light rail",
   "position": [
    -322,
    -270
   ],
   "kind": "transit"
  },
  {
   "id": "bayview-opera-house",
   "name": "the Bayview Opera House",
   "position": [
    -344,
    43
   ],
   "kind": "hall"
  }
 ],
 "connectors": [
  {
   "id": "sf-third-street-south",
   "kind": "road",
   "name": "Third Street north to the Mission and SoMa",
   "from": {
    "parish": "sf-bayview",
    "position": [
     -301,
     -1187
    ]
   },
   "to": {
    "parish": "sf-mission",
    "position": null,
    "lonlat": [
     -122.389,
     37.755
    ]
   },
   "lonlat": [
    -122.389,
    37.755
   ],
   "approximate": true
  },
  {
   "id": "sf-bayshore-south",
   "kind": "road",
   "name": "Bayshore Boulevard north to the Mission",
   "from": {
    "parish": "sf-bayview",
    "position": [
     -945,
     -108
    ]
   },
   "to": {
    "parish": "sf-mission",
    "position": null,
    "lonlat": [
     -122.404,
     37.735
    ]
   },
   "lonlat": [
    -122.404,
    37.735
   ],
   "approximate": true
  }
 ],
 "fieldLessons": [
  {
   "id": "sg-fl-marsh-ecosystem",
   "title": "A Marsh Is a Home for Many Living Things",
   "site": "herons-head-wetland",
   "landmark": "herons-head-park",
   "k12": "k12-ecosystems-at-the-kelp-transect",
   "station": "marsh-transect-survey",
   "trade": "Marsh restoration crews",
   "tradeLine": "A marsh crew walks the same line each season and counts what grows, so they can see the marsh come back.",
   "minutes": 3,
   "steps": [
    "A marsh is where land and bay water meet.",
    "Grasses, crabs and birds all live and feed here together.",
    "The crew counts along one line each season to see it grow."
   ],
   "check": {
    "q": "Why does the crew count along the same line each time?",
    "options": [
     "To compare one season with the next",
     "Because it is the shortest walk",
     "To find lost tools"
    ],
    "answer": 0,
    "why": "Using the same line lets them see real change."
   }
  },
  {
   "id": "sg-fl-clean-up-experiment",
   "title": "Test One Thing at a Time",
   "site": "shipyard-groundwater-yard",
   "k12": "k12-a-controlled-experiment",
   "station": "sampling-well",
   "trade": "Groundwater sampling crews",
   "tradeLine": "A sampling crew takes each bottle the same way every time, so a change in the results means a change in the water.",
   "minutes": 3,
   "steps": [
    "A fair test changes only one thing.",
    "The crew takes water from the well the same way each time.",
    "Then a new result means the water changed, not the method."
   ],
   "check": {
    "q": "Why does the crew sample the same way every time?",
    "options": [
     "So only the water can change the result",
     "Because they like routines",
     "So it takes longer"
    ],
    "answer": 0,
    "why": "Keeping the method the same makes it a fair test."
   }
  },
  {
   "id": "sg-fl-safety-labels",
   "title": "Signs and Labels Keep Everyone Safe",
   "site": "shipyard-soil-cell",
   "k12": "k12-reading-instructions-and-safety-labels",
   "station": "decon-line",
   "trade": "Clean-up laborers",
   "tradeLine": "A clean-up laborer reads every sign and label at the fence before stepping into the work zone.",
   "minutes": 2,
   "steps": [
    "Work sites put up signs and labels for a reason.",
    "A label tells you what is inside and how to be careful.",
    "Crews read each one before they walk in."
   ],
   "check": {
    "q": "What should you do when you see a safety sign?",
    "options": [
     "Read it and follow it",
     "Ignore it",
     "Take it down"
    ],
    "answer": 0,
    "why": "Signs tell you how to stay safe, so read and follow them."
   }
  },
  {
   "id": "sg-fl-water-cycle-slough",
   "title": "Rain Takes a Trip Back to the Bay",
   "site": "yosemite-slough-restoration",
   "landmark": "yosemite-slough",
   "k12": "k12-water-cycle-and-filtration",
   "station": "bioswale-build",
   "trade": "Stormwater crews",
   "tradeLine": "A stormwater crew builds a bioswale so rain soaks through soil and plants before it reaches the bay.",
   "minutes": 3,
   "steps": [
    "Rain falls on streets and roofs in the neighbourhood.",
    "It runs into drains and flows toward the bay.",
    "A bioswale lets it soak through soil and plants to get cleaner."
   ],
   "check": {
    "q": "What does a bioswale do for rain water?",
    "options": [
     "Cleans it as it soaks through",
     "Makes it salty",
     "Turns it into ice"
    ],
    "answer": 0,
    "why": "Soil and plants filter the water before it reaches the bay."
   }
  },
  {
   "id": "sg-fl-court-measuring",
   "title": "Measuring the Court for a Fair Game",
   "site": "bayview-rec-centre",
   "k12": "k12-measuring-and-scaling-the-court",
   "station": "bb-warmup-injury-prevention-and-hydration",
   "trade": "Recreation centre staff",
   "tradeLine": "Recreation staff measure and mark the court so every game is played on fair lines.",
   "minutes": 2,
   "steps": [
    "A basketball court has lines in set places.",
    "Staff measure from the edges to paint each line.",
    "Fair lines mean every team plays the same game."
   ],
   "check": {
    "q": "Why do staff measure before painting court lines?",
    "options": [
     "So the game is fair for everyone",
     "To use up the paint",
     "Because the floor is new"
    ],
    "answer": 0,
    "why": "Measured lines make the court the same for every team."
   }
  }
 ],
 "gated": [
  {
   "id": "sg-sf-bayview-gated-survey-walk",
   "kind": "side-quest",
   "title": "The Survey Walk",
   "world": "parishes",
   "parish": "sf-bayview",
   "site": "hunters-point-shipyard",
   "siteName": "Hunters Point Shipyard",
   "gate": {
    "stations": [
     "hazwoper-site-orientation"
    ],
    "note": "Take the site orientation before you walk the survey grid with the crew"
   }
  },
  {
   "id": "sg-sf-bayview-gated-marsh-planting-day",
   "kind": "side-quest",
   "title": "Marsh Planting Day",
   "world": "parishes",
   "parish": "sf-bayview",
   "site": "herons-head-wetland",
   "siteName": "Heron's Head Wetland Restoration",
   "gate": {
    "stations": [
     "marsh-transect-survey"
    ],
    "note": "Walk a marsh transect before you plant the new marsh edge with the crew"
   }
  }
 ]
};
