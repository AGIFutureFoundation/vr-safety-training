// St. Tammany Parish — a parish data module on the shared parish schema (crescent brief, console DELTA).
// Pure data: no three.js, no DOM, no imports. Real places are named only by their public names as places;
// every coordinate is approximate (three decimals, `approximate: true`) and exists only to place a map.
// Positions are scene metres on a 4096 m square (x east, +z south), one map metre = 10 m on the ground;
// the anchors fit np-geo.js's affine. Water with a `width` is a ribbon along its points, without one a polygon.
// Validated by tools/check_parish_data.mjs. Field lessons follow RW_FIELD_LESSONS; gated items the gate contract.
export const NP_ST_TAMMANY = {
 "id": "st-tammany",
 "name": "St. Tammany Parish",
 "size": 4096,
 "anchors": [
  {
   "xz": [
    1672,
    608
   ],
   "lonlat": [
    -89.781,
    30.275
   ],
   "approximate": true,
   "name": "Slidell"
  },
  {
   "xz": [
    -1057,
    -310
   ],
   "lonlat": [
    -90.065,
    30.358
   ],
   "approximate": true,
   "name": "Mandeville lakefront"
  },
  {
   "xz": [
    -1393,
    -1603
   ],
   "lonlat": [
    -90.1,
    30.475
   ],
   "approximate": true,
   "name": "Covington"
  },
  {
   "xz": [
    -1681,
    -387
   ],
   "lonlat": [
    -90.13,
    30.365
   ],
   "approximate": true,
   "name": "the Causeway north toll plaza"
  },
  {
   "xz": [
    -1970,
    -829
   ],
   "lonlat": [
    -90.16,
    30.405
   ],
   "approximate": true,
   "name": "Madisonville"
  },
  {
   "xz": [
    -721,
    -111
   ],
   "lonlat": [
    -90.03,
    30.34
   ],
   "approximate": true,
   "name": "Fontainebleau State Park"
  },
  {
   "xz": [
    115,
    188
   ],
   "lonlat": [
    -89.943,
    30.313
   ],
   "approximate": true,
   "name": "Lacombe"
  },
  {
   "xz": [
    96,
    -1636
   ],
   "lonlat": [
    -89.945,
    30.478
   ],
   "approximate": true,
   "name": "Abita Springs"
  },
  {
   "xz": [
    1297,
    1714
   ],
   "lonlat": [
    -89.82,
    30.175
   ],
   "approximate": true,
   "name": "the twin spans over the lake"
  },
  {
   "xz": [
    -1662,
    1769
   ],
   "lonlat": [
    -90.128,
    30.17
   ],
   "approximate": true,
   "name": "the Causeway over the lake"
  }
 ],
 "water": [
  {
   "id": "lake-pontchartrain",
   "kind": "lake",
   "poly": [
    [
     -2048,
     -442
    ],
    [
     -1681,
     -332
    ],
    [
     -1057,
     -276
    ],
    [
     -721,
     -55
    ],
    [
     -240,
     332
    ],
    [
     240,
     663
    ],
    [
     817,
     940
    ],
    [
     1489,
     1161
    ],
    [
     2048,
     1548
    ],
    [
     2048,
     2048
    ],
    [
     -2048,
     2048
    ]
   ]
  },
  {
   "id": "tchefuncte-river",
   "kind": "river",
   "poly": [
    [
     -1874,
     -2048
    ],
    [
     -1778,
     -1548
    ],
    [
     -1874,
     -1106
    ],
    [
     -1970,
     -829
    ],
    [
     -1874,
     -553
    ],
    [
     -1826,
     -387
    ]
   ],
   "width": 8
  },
  {
   "id": "bogue-falaya",
   "kind": "river",
   "poly": [
    [
     -1201,
     -2048
    ],
    [
     -1345,
     -1659
    ],
    [
     -1585,
     -1216
    ],
    [
     -1778,
     -995
    ]
   ],
   "width": 6
  },
  {
   "id": "bayou-lacombe",
   "kind": "bayou",
   "poly": [
    [
     48,
     -995
    ],
    [
     96,
     -221
    ],
    [
     144,
     188
    ],
    [
     -48,
     442
    ]
   ],
   "width": 6
  },
  {
   "id": "bayou-bonfouca",
   "kind": "bayou",
   "poly": [
    [
     1874,
     221
    ],
    [
     1633,
     553
    ],
    [
     1489,
     829
    ],
    [
     1393,
     1050
    ]
   ],
   "width": 6
  },
  {
   "id": "big-branch-marsh",
   "kind": "wetland",
   "poly": [
    [
     -240,
     332
    ],
    [
     817,
     940
    ],
    [
     1297,
     995
    ],
    [
     1009,
     442
    ],
    [
     240,
     221
    ]
   ]
  },
  {
   "id": "pearl-river-swamp",
   "kind": "wetland",
   "poly": [
    [
     1730,
     -995
    ],
    [
     2047,
     -1106
    ],
    [
     2047,
     1327
    ],
    [
     1778,
     1106
    ],
    [
     1874,
     111
    ]
   ]
  }
 ],
 "levees": [
  {
   "id": "slidell-marsh-levee",
   "pts": [
    [
     1201,
     940
    ],
    [
     1585,
     995
    ],
    [
     1874,
     885
    ]
   ],
   "height": 4
  },
  {
   "id": "mandeville-seawall",
   "pts": [
    [
     -1249,
     -299
    ],
    [
     -1057,
     -287
    ],
    [
     -865,
     -221
    ]
   ],
   "height": 2
  }
 ],
 "roads": [
  {
   "id": "interstate-twelve",
   "kind": "interstate",
   "pts": [
    [
     -2048,
     -1216
    ],
    [
     -1393,
     -1106
    ],
    [
     -721,
     -885
    ],
    [
     48,
     -719
    ],
    [
     817,
     -332
    ],
    [
     1489,
     221
    ],
    [
     1874,
     332
    ]
   ]
  },
  {
   "id": "interstate-ten",
   "kind": "interstate",
   "pts": [
    [
     1874,
     332
    ],
    [
     1672,
     752
    ],
    [
     1489,
     1150
    ]
   ]
  },
  {
   "id": "the-twin-spans",
   "kind": "bridge",
   "pts": [
    [
     1489,
     1150
    ],
    [
     1297,
     1714
    ],
    [
     1201,
     2048
    ]
   ]
  },
  {
   "id": "the-causeway",
   "kind": "causeway",
   "pts": [
    [
     -1681,
     -387
    ],
    [
     -1662,
     1769
    ],
    [
     -1662,
     2048
    ]
   ]
  },
  {
   "id": "highway-one-ninety",
   "kind": "avenue",
   "pts": [
    [
     -1681,
     -387
    ],
    [
     -1393,
     -553
    ],
    [
     -1393,
     -1480
    ],
    [
     -1330,
     -1603
    ],
    [
     -1009,
     -1659
    ],
    [
     96,
     -1636
    ],
    [
     721,
     -1216
    ],
    [
     1489,
     0
    ],
    [
     1672,
     608
    ]
   ]
  },
  {
   "id": "highway-twenty-two",
   "kind": "avenue",
   "pts": [
    [
     -1940,
     -829
    ],
    [
     -1681,
     -553
    ],
    [
     -1297,
     -442
    ],
    [
     -1057,
     -310
    ]
   ]
  },
  {
   "id": "lakeshore-drive",
   "kind": "street",
   "pts": [
    [
     -1249,
     -325
    ],
    [
     -1057,
     -312
    ],
    [
     -865,
     -247
    ]
   ]
  },
  {
   "id": "tammany-trace",
   "kind": "street",
   "pts": [
    [
     -1350,
     -1606
    ],
    [
     96,
     -1636
    ],
    [
     48,
     -995
    ],
    [
     96,
     -221
    ],
    [
     528,
     111
    ],
    [
     1009,
     332
    ],
    [
     1489,
     553
    ],
    [
     1672,
     608
    ]
   ]
  },
  {
   "id": "fontainebleau-park-road",
   "kind": "street",
   "pts": [
    [
     -721,
     -221
    ],
    [
     -721,
     -66
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "slidell",
   "name": "Slidell",
   "poly": [
    [
     1201,
     111
    ],
    [
     1970,
     111
    ],
    [
     1970,
     885
    ],
    [
     1201,
     885
    ]
   ],
   "character": "suburb"
  },
  {
   "id": "slidell-industrial",
   "name": "Slidell's industrial side",
   "poly": [
    [
     1489,
     332
    ],
    [
     1874,
     332
    ],
    [
     1874,
     553
    ],
    [
     1489,
     553
    ]
   ],
   "character": "industrial"
  },
  {
   "id": "old-mandeville",
   "name": "Old Mandeville",
   "poly": [
    [
     -1393,
     -553
    ],
    [
     -817,
     -553
    ],
    [
     -817,
     -243
    ],
    [
     -1393,
     -276
    ]
   ],
   "character": "garden"
  },
  {
   "id": "covington-old-town",
   "name": "Covington's old town",
   "poly": [
    [
     -1537,
     -1769
    ],
    [
     -1249,
     -1769
    ],
    [
     -1249,
     -1437
    ],
    [
     -1537,
     -1437
    ]
   ],
   "character": "quarter"
  },
  {
   "id": "abita-springs",
   "name": "Abita Springs",
   "poly": [
    [
     -48,
     -1769
    ],
    [
     240,
     -1769
    ],
    [
     240,
     -1493
    ],
    [
     -48,
     -1493
    ]
   ],
   "character": "suburb"
  },
  {
   "id": "piney-woods-west",
   "name": "The piney woods, west",
   "poly": [
    [
     -2048,
     -2046
    ],
    [
     -1585,
     -2046
    ],
    [
     -1585,
     -1216
    ],
    [
     -2048,
     -1216
    ]
   ],
   "character": "garden"
  },
  {
   "id": "piney-woods-east",
   "name": "The piney woods, east",
   "poly": [
    [
     336,
     -2046
    ],
    [
     2047,
     -2046
    ],
    [
     2047,
     -1216
    ],
    [
     336,
     -1216
    ]
   ],
   "character": "garden"
  },
  {
   "id": "lacombe",
   "name": "Lacombe",
   "poly": [
    [
     -144,
     0
    ],
    [
     336,
     0
    ],
    [
     336,
     332
    ],
    [
     -144,
     332
    ]
   ],
   "character": "suburb"
  },
  {
   "id": "big-branch",
   "name": "Big Branch Marsh",
   "poly": [
    [
     -240,
     332
    ],
    [
     817,
     940
    ],
    [
     1297,
     995
    ],
    [
     1009,
     442
    ],
    [
     240,
     221
    ]
   ],
   "character": "wetland"
  },
  {
   "id": "madisonville-waterfront",
   "name": "Madisonville waterfront",
   "poly": [
    [
     -2048,
     -940
    ],
    [
     -1826,
     -940
    ],
    [
     -1826,
     -719
    ],
    [
     -2048,
     -719
    ]
   ],
   "character": "port"
  },
  {
   "id": "covington-campus",
   "name": "The Covington campus",
   "poly": [
    [
     -1585,
     -1437
    ],
    [
     -1249,
     -1437
    ],
    [
     -1249,
     -1216
    ],
    [
     -1585,
     -1216
    ]
   ],
   "character": "campus"
  }
 ],
 "sites": [
  {
   "id": "st-causeway-north",
   "name": "Causeway North Shore Maintenance Yard",
   "kind": "bridge-yard",
   "position": [
    -1681,
    -420
   ],
   "trades": [
    "ironworkers",
    "iuoe",
    "liuna"
   ],
   "programmes": [
    "bridge-and-structural"
   ],
   "stations": [
    "deck-joint-replacement",
    "bs-bearing-replacement-and-jacking",
    "traffic-incident-management",
    "uw-bridge-pier-scour-survey",
    "gg-fog-and-wind-work-stop"
   ]
  },
  {
   "id": "st-slidell-staging",
   "name": "Slidell Storm Staging Area",
   "kind": "staging",
   "position": [
    1672,
    608
   ],
   "trades": [
    "ibew",
    "liuna",
    "teamsters",
    "afscme"
   ],
   "programmes": [
    "first-responders",
    "water-and-gas-utility-crews"
   ],
   "stations": [
    "ut-night-storm-response-crew-and-portable-generator",
    "line-truck",
    "gk-storm-cleanup-chipper-and-traffic-control",
    "shelter-intake-operations",
    "damage-assessment-team",
    "tdl-cargo-securement-and-hours"
   ]
  },
  {
   "id": "st-hospital",
   "name": "North Shore Hospital District",
   "kind": "hospital",
   "position": [
    -1345,
    -1415
   ],
   "trades": [
    "nnu",
    "seiu"
   ],
   "programmes": [
    "healthcare-support"
   ],
   "stations": [
    "cath-lab",
    "pl-medical-gas-brazing-and-purge",
    "who-vaccination-line",
    "fire-pump"
   ]
  },
  {
   "id": "st-mandeville-harbour",
   "name": "Mandeville Lakefront & Harbour",
   "kind": "harbour",
   "position": [
    -1057,
    -332
   ],
   "trades": [
    "ibu",
    "siu"
   ],
   "programmes": [
    "yacht-and-charter-crew"
   ],
   "stations": [
    "yc-line-handling-and-docking-in-crosswind",
    "yc-shore-power-connection-and-in-water-electrical-safety",
    "yc-pre-departure-safety-briefing-and-guest-count",
    "br-cold-water-immersion-and-mob-recovery"
   ]
  },
  {
   "id": "st-fontainebleau",
   "name": "Fontainebleau State Park Crew",
   "kind": "park",
   "position": [
    -721,
    -133
   ],
   "trades": [
    "afscme",
    "liuna"
   ],
   "programmes": [
    "grounds-and-landscaping"
   ],
   "stations": [
    "gk-chainsaw-start-and-limbing-on-the-ground",
    "gk-tree-work-pole-saw-and-drop-zone",
    "gk-ride-on-mower-pre-start-and-slope-work",
    "k12-weather-and-the-sky"
   ]
  },
  {
   "id": "st-big-branch",
   "name": "Big Branch Marsh Field Station",
   "kind": "wetland",
   "position": [
    336,
    520
   ],
   "trades": [
    "afge",
    "liuna"
   ],
   "programmes": [
    "marine-ecology-and-restoration"
   ],
   "stations": [
    "marsh-transect-survey",
    "me-shoreline-debris-and-microplastics-survey",
    "br-water-quality-sonde-calibration-and-deploy",
    "k12-a-controlled-experiment"
   ]
  },
  {
   "id": "st-covington-campus",
   "name": "Covington College Campus",
   "kind": "campus",
   "position": [
    -1412,
    -1327
   ],
   "trades": [
    "aft",
    "seiu",
    "iuoe"
   ],
   "programmes": [
    "education-support-staff",
    "k12-literacy-and-life-skills"
   ],
   "stations": [
    "ed-science-lab-chemical-storage-and-eyewash",
    "ed-boiler-room-filter-change-lockout",
    "k12-digital-citizenship-and-online-safety",
    "k12-public-speaking-at-the-hall"
   ]
  },
  {
   "id": "st-timber-yard",
   "name": "Piney Woods Timber Yard",
   "kind": "timber-yard",
   "position": [
    528,
    -1880
   ],
   "trades": [
    "carpenters",
    "teamsters",
    "iam"
   ],
   "programmes": [
    "warehouse-and-logistics-automation",
    "heavy-equipment-operators"
   ],
   "stations": [
    "gk-chainsaw-start-and-limbing-on-the-ground",
    "op-loader-truck-loading-and-blind-spots",
    "tdl-cargo-securement-and-hours",
    "forklift-dock"
   ]
  },
  {
   "id": "st-lacombe-substation",
   "name": "Lacombe Substation & Line Yard",
   "kind": "substation",
   "position": [
    60,
    150
   ],
   "trades": [
    "ibew"
   ],
   "programmes": [
    "energy-transition",
    "electrical-first-period"
   ],
   "stations": [
    "substation-switching",
    "line-truck",
    "or-transmission-line-right-of-way-patrol",
    "arc-flash-label-study"
   ]
  },
  {
   "id": "st-madisonville-boatyard",
   "name": "Tchefuncte River Boatyard",
   "kind": "shipyard",
   "position": [
    -1900,
    -790
   ],
   "trades": [
    "ibb",
    "carpenters",
    "ibu"
   ],
   "programmes": [
    "insulators-and-boilermakers",
    "commercial-diving-and-scientific-scuba"
   ],
   "stations": [
    "shipyard-hotwork",
    "mw-hull-inspection-and-cleaning-dive",
    "yc-engine-room-pre-start-and-bilge-check"
   ]
  },
  {
   "id": "st-slidell-rail",
   "name": "Slidell Rail Yard",
   "kind": "rail",
   "position": [
    1797,
    487
   ],
   "trades": [
    "bmwed",
    "blet",
    "smart-td"
   ],
   "programmes": [
    "railroad-crafts"
   ],
   "stations": [
    "ra-locomotive-cab-startup-and-alerter",
    "ra-roadway-worker-protection-and-job-briefing",
    "ra-tie-and-rail-replacement-with-track-machines"
   ]
  },
  {
   "id": "st-tammany-trace",
   "name": "Tammany Trace Trailhead",
   "kind": "trail",
   "position": [
    96,
    -1659
   ],
   "trades": [
    "afscme"
   ],
   "programmes": [
    "k12-practical-math",
    "grounds-and-landscaping"
   ],
   "stations": [
    "k12-reading-a-map-scale-in-bay-world",
    "gk-hardscape-paver-base-and-compaction",
    "ed-crossing-guard-intersection-control"
   ]
  }
 ],
 "landmarks": [
  {
   "id": "mandeville-lakefront",
   "name": "Mandeville lakefront",
   "position": [
    -1057,
    -287
   ],
   "kind": "shore"
  },
  {
   "id": "causeway-north-toll",
   "name": "Causeway north toll plaza",
   "position": [
    -1681,
    -398
   ],
   "kind": "plaza"
  },
  {
   "id": "fontainebleau-beach",
   "name": "Fontainebleau State Park beach",
   "position": [
    -721,
    -77
   ],
   "kind": "park"
  },
  {
   "id": "tchefuncte-lighthouse",
   "name": "Tchefuncte River lighthouse",
   "position": [
    -1970,
    -531
   ],
   "kind": "lighthouse"
  },
  {
   "id": "abita-trailhead",
   "name": "Abita Springs trailhead",
   "position": [
    96,
    -1636
   ],
   "kind": "park"
  },
  {
   "id": "bayou-lacombe",
   "name": "Bayou Lacombe",
   "position": [
    115,
    111
   ],
   "kind": "bayou"
  },
  {
   "id": "twin-spans",
   "name": "The twin spans over the lake",
   "position": [
    1470,
    1120
   ],
   "kind": "bridge"
  },
  {
   "id": "honey-island-edge",
   "name": "Honey Island Swamp edge",
   "position": [
    1970,
    111
   ],
   "kind": "swamp"
  },
  {
   "id": "covington-riverfront",
   "name": "Bogue Falaya riverfront, Covington",
   "position": [
    -1393,
    -1548
   ],
   "kind": "river"
  }
 ],
 "connectors": [
  {
   "id": "st-causeway",
   "kind": "causeway",
   "from": {
    "parish": "st-tammany",
    "position": [
     -1662,
     1769
    ]
   },
   "to": {
    "parish": "jefferson",
    "position": [
     145,
     -1935
    ]
   },
   "name": "Lake Pontchartrain Causeway",
   "lonlat": [
    -90.128,
    30.17
   ],
   "approximate": true
  },
  {
   "id": "st-twin-spans-orleans",
   "kind": "bridge",
   "from": {
    "parish": "st-tammany",
    "position": [
     1297,
     1714
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     2040,
     -2040
    ]
   },
   "name": "The interstate twin spans over the lake",
   "lonlat": [
    -89.82,
    30.175
   ],
   "approximate": true
  }
 ],
 "fieldLessons": [
  {
   "id": "st-fl-questions-at-the-briefing",
   "title": "Questions belong at the briefing",
   "site": "st-slidell-staging",
   "k12": "k12-teamwork-and-feedback",
   "trade": "Storm response crews",
   "tradeLine": "A staging area works because every crew knows its role before the trucks roll: the briefing is the teamwork.",
   "minutes": 2,
   "steps": [
    "Before a storm, crews gather where the roads stay open and wait for the call.",
    "Each crew has one job and one lead; the plan says who goes first.",
    "Watch a briefing: questions are asked here, not on the road."
   ],
   "check": {
    "q": "When do storm crews ask their questions?",
    "options": [
     "At the briefing, before rolling",
     "On the way to the job",
     "After the job is done"
    ],
    "answer": 0,
    "why": "A briefing exists so that every question is settled before anyone leaves."
   }
  },
  {
   "id": "st-fl-one-change-in-the-marsh",
   "title": "Change one thing in the marsh",
   "site": "st-big-branch",
   "landmark": "bayou-lacombe",
   "k12": "k12-a-controlled-experiment",
   "trade": "Refuge biologists and field crews",
   "tradeLine": "A refuge crew compares a planted plot with an unplanted one, changing only that one thing.",
   "minutes": 3,
   "steps": [
    "A fair test changes one thing and keeps everything else the same.",
    "Here one marsh plot is planted and its neighbour is left alone.",
    "Measure the same way in both plots, then compare."
   ],
   "check": {
    "q": "In a fair test, how many things do you change?",
    "options": [
     "One",
     "Everything",
     "None"
    ],
    "answer": 0,
    "why": "Changing only one thing means any difference can be traced to it."
   }
  },
  {
   "id": "st-fl-clouds-over-the-lake",
   "title": "Reading the clouds over the lake",
   "site": "st-fontainebleau",
   "landmark": "fontainebleau-beach",
   "k12": "k12-weather-and-the-sky",
   "trade": "Park rangers and grounds crews",
   "tradeLine": "A grounds crew reads the sky over the lake to decide when a chainsaw day stops.",
   "minutes": 2,
   "steps": [
    "Clouds build over the lake on a warm afternoon.",
    "Tall dark clouds mean the crew moves the work indoors or stops.",
    "Look south over the water and say what the sky will do next."
   ],
   "check": {
    "q": "What tells a crew to stop outdoor tree work?",
    "options": [
     "Tall dark clouds building",
     "A light breeze",
     "A clear sky"
    ],
    "answer": 0,
    "why": "Building storm clouds bring lightning and wind; the crew stops before they arrive."
   }
  }
 ],
 "gated": [
  {
   "id": "st-gate-causeway-fog-stop",
   "kind": "quest",
   "world": "parishes",
   "title": "Fog Work Stop on the Causeway",
   "site": "st-causeway-north",
   "siteName": "Causeway North Shore Maintenance Yard",
   "gate": {
    "stations": [
     "gg-fog-and-wind-work-stop",
     "traffic-incident-management"
    ],
    "note": "The fog and wind work stop and traffic control before a foggy morning on the causeway."
   },
   "summary": "Call a fog work stop for every crew on the causeway.",
   "parish": "st-tammany"
  },
  {
   "id": "st-gate-staging-night",
   "kind": "quest",
   "world": "parishes",
   "title": "North Shore Staging Night",
   "site": "st-slidell-staging",
   "siteName": "Slidell Storm Staging Area",
   "gate": {
    "stations": [
     "ut-night-storm-response-crew-and-portable-generator",
     "line-truck"
    ],
    "note": "The night storm response and the line truck before you run the staging yard."
   },
   "summary": "Run the storm staging yard through the night before landfall.",
   "parish": "st-tammany"
  }
 ],
 "scale": 10,
 "blurb": "The parish on the lake's north shore: the causeway's north end at Mandeville and the lakefront harbour, the state park at Fontainebleau, the campus and hospital at Covington, the boatyard at Madisonville, the trail through Abita Springs and Lacombe, the marsh at Big Branch, and the rail yard and staging at Slidell by the twin spans."
};
