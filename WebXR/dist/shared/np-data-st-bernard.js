// St. Bernard Parish — a parish data module on the shared parish schema (crescent brief, console DELTA).
// Pure data: no three.js, no DOM, no imports. Real places are named only by their public names as places;
// every coordinate is approximate (three decimals, `approximate: true`) and exists only to place a map.
// Positions are scene metres on a 4096 m square (x east, +z south), one map metre = 8 m on the ground;
// the anchors fit np-geo.js's affine. Water with a `width` is a ribbon along its points, without one a polygon.
// Validated by tools/check_parish_data.mjs. Field lessons follow RW_FIELD_LESSONS; gated items the gate contract.
export const NP_ST_BERNARD = {
 "id": "st-bernard",
 "name": "St. Bernard Parish",
 "size": 4096,
 "anchors": [
  {
   "xz": [
    -1809,
    -553
   ],
   "lonlat": [
    -89.995,
    29.96
   ],
   "approximate": true,
   "name": "Arabi"
  },
  {
   "xz": [
    -1447,
    -318
   ],
   "lonlat": [
    -89.965,
    29.943
   ],
   "approximate": true,
   "name": "Chalmette"
  },
  {
   "xz": [
    -1749,
    -276
   ],
   "lonlat": [
    -89.99,
    29.94
   ],
   "approximate": true,
   "name": "Chalmette Battlefield"
  },
  {
   "xz": [
    -1025,
    -138
   ],
   "lonlat": [
    -89.93,
    29.93
   ],
   "approximate": true,
   "name": "Meraux"
  },
  {
   "xz": [
    -639,
    276
   ],
   "lonlat": [
    -89.898,
    29.9
   ],
   "approximate": true,
   "name": "Violet"
  },
  {
   "xz": [
    -519,
    705
   ],
   "lonlat": [
    -89.888,
    29.869
   ],
   "approximate": true,
   "name": "Poydras"
  },
  {
   "xz": [
    -724,
    898
   ],
   "lonlat": [
    -89.905,
    29.855
   ],
   "approximate": true,
   "name": "Caernarvon"
  },
  {
   "xz": [
    2014,
    815
   ],
   "lonlat": [
    -89.678,
    29.861
   ],
   "approximate": true,
   "name": "Shell Beach"
  },
  {
   "xz": [
    -302,
    -898
   ],
   "lonlat": [
    -89.87,
    29.985
   ],
   "approximate": true,
   "name": "the outlet canal"
  },
  {
   "xz": [
    1387,
    968
   ],
   "lonlat": [
    -89.73,
    29.85
   ],
   "approximate": true,
   "name": "Yscloskey"
  }
 ],
 "water": [
  {
   "id": "mississippi-river",
   "kind": "river",
   "poly": [
    [
     -1990,
     -663
    ],
    [
     -1809,
     -581
    ],
    [
     -1568,
     -415
    ],
    [
     -1387,
     -207
    ],
    [
     -1146,
     69
    ],
    [
     -1025,
     276
    ],
    [
     -844,
     415
    ],
    [
     -724,
     622
    ],
    [
     -663,
     829
    ],
    [
     -724,
     1037
    ],
    [
     -905,
     1244
    ]
   ],
   "width": 90
  },
  {
   "id": "outlet-canal",
   "kind": "canal",
   "poly": [
    [
     -1749,
     -1106
    ],
    [
     -1025,
     -968
    ],
    [
     -302,
     -898
    ],
    [
     784,
     -138
    ],
    [
     1749,
     553
    ],
    [
     2048,
     968
    ]
   ],
   "width": 12
  },
  {
   "id": "bayou-bienvenue-wetland",
   "kind": "wetland",
   "poly": [
    [
     -1809,
     -1078
    ],
    [
     -1025,
     -1037
    ],
    [
     -1025,
     -622
    ],
    [
     -1809,
     -719
    ]
   ]
  },
  {
   "id": "central-wetlands",
   "kind": "wetland",
   "poly": [
    [
     -1146,
     -968
    ],
    [
     -302,
     -898
    ],
    [
     60,
     -553
    ],
    [
     -181,
     138
    ],
    [
     -663,
     -138
    ],
    [
     -1025,
     -484
    ]
   ]
  },
  {
   "id": "violet-canal",
   "kind": "canal",
   "poly": [
    [
     -639,
     207
    ],
    [
     -422,
     -207
    ],
    [
     -302,
     -553
    ]
   ],
   "width": 6
  },
  {
   "id": "lake-borgne",
   "kind": "lake",
   "poly": [
    [
     784,
     -2048
    ],
    [
     1990,
     -2048
    ],
    [
     2048,
     276
    ],
    [
     1025,
     -138
    ]
   ]
  },
  {
   "id": "eastern-marsh",
   "kind": "wetland",
   "poly": [
    [
     -663,
     829
    ],
    [
     543,
     968
    ],
    [
     1749,
     1382
    ],
    [
     1990,
     1935
    ],
    [
     -663,
     1935
    ]
   ]
  },
  {
   "id": "bayou-la-loutre",
   "kind": "bayou",
   "poly": [
    [
     784,
     691
    ],
    [
     1387,
     968
    ],
    [
     1869,
     1106
    ]
   ],
   "width": 6
  }
 ],
 "levees": [
  {
   "id": "river-levee",
   "pts": [
    [
     -1990,
     -760
    ],
    [
     -1809,
     -677
    ],
    [
     -1568,
     -511
    ],
    [
     -1387,
     -304
    ],
    [
     -1146,
     -28
    ],
    [
     -1025,
     180
    ],
    [
     -844,
     318
    ],
    [
     -724,
     525
    ],
    [
     -663,
     746
    ],
    [
     -724,
     940
    ]
   ],
   "height": 7
  },
  {
   "id": "back-levee",
   "pts": [
    [
     -1809,
     -719
    ],
    [
     -1146,
     -622
    ],
    [
     -663,
     -138
    ],
    [
     -302,
     207
    ],
    [
     -181,
     553
    ]
   ],
   "height": 5
  },
  {
   "id": "outlet-canal-floodwall",
   "pts": [
    [
     -663,
     -1078
    ],
    [
     -302,
     -898
    ],
    [
     -121,
     -719
    ]
   ],
   "height": 8
  }
 ],
 "roads": [
  {
   "id": "st-bernard-highway",
   "kind": "riverroad",
   "pts": [
    [
     -1738,
     -702
    ],
    [
     -1474,
     -521
    ],
    [
     -1281,
     -299
    ],
    [
     -1034,
     -15
    ],
    [
     -918,
     182
    ],
    [
     -736,
     321
    ],
    [
     -595,
     566
    ],
    [
     -517,
     829
    ],
    [
     -599,
     1110
    ]
   ]
  },
  {
   "id": "judge-perez-drive",
   "kind": "avenue",
   "pts": [
    [
     -1809,
     -636
    ],
    [
     -1387,
     -346
    ],
    [
     -1025,
     -111
    ],
    [
     -663,
     207
    ],
    [
     -519,
     622
    ],
    [
     -422,
     829
    ]
   ]
  },
  {
   "id": "road-to-shell-beach",
   "kind": "street",
   "pts": [
    [
     -519,
     705
    ],
    [
     -60,
     829
    ],
    [
     543,
     760
    ],
    [
     1387,
     968
    ],
    [
     2014,
     815
    ]
   ]
  },
  {
   "id": "paris-road-bridge",
   "kind": "bridge",
   "pts": [
    [
     -1206,
     -138
    ],
    [
     -1146,
     -622
    ],
    [
     -1085,
     -968
    ],
    [
     -1025,
     -1244
    ]
   ]
  },
  {
   "id": "chalmette-ferry",
   "kind": "ferry",
   "pts": [
    [
     -1568,
     -373
    ],
    [
     -1604,
     -415
    ],
    [
     -1652,
     -484
    ]
   ]
  },
  {
   "id": "st-claude-avenue",
   "kind": "avenue",
   "pts": [
    [
     -2044,
     -816
    ],
    [
     -1738,
     -702
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "arabi-chalmette",
   "name": "Arabi and Chalmette",
   "poly": [
    [
     -1845,
     -663
    ],
    [
     -1146,
     -553
    ],
    [
     -1146,
     -69
    ],
    [
     -1845,
     -346
    ]
   ],
   "character": "suburb"
  },
  {
   "id": "refinery-corridor",
   "name": "The refinery corridor",
   "poly": [
    [
     -1266,
     -346
    ],
    [
     -784,
     -207
    ],
    [
     -724,
     207
    ],
    [
     -1206,
     69
    ]
   ],
   "character": "refinery"
  },
  {
   "id": "battlefield-grounds",
   "name": "Chalmette Battlefield grounds",
   "poly": [
    [
     -1869,
     -387
    ],
    [
     -1652,
     -346
    ],
    [
     -1652,
     -180
    ],
    [
     -1869,
     -235
    ]
   ],
   "character": "garden"
  },
  {
   "id": "violet-poydras",
   "name": "Violet and Poydras",
   "poly": [
    [
     -784,
     69
    ],
    [
     -422,
     207
    ],
    [
     -362,
     829
    ],
    [
     -724,
     898
    ]
   ],
   "character": "suburb"
  },
  {
   "id": "central-wetlands",
   "name": "The central wetlands",
   "poly": [
    [
     -1146,
     -968
    ],
    [
     -302,
     -898
    ],
    [
     60,
     -553
    ],
    [
     -181,
     138
    ],
    [
     -663,
     -138
    ],
    [
     -1025,
     -484
    ]
   ],
   "character": "wetland"
  },
  {
   "id": "shell-beach",
   "name": "Shell Beach and Hopedale",
   "poly": [
    [
     1749,
     622
    ],
    [
     2048,
     622
    ],
    [
     2048,
     1037
    ],
    [
     1749,
     1037
    ]
   ],
   "character": "port"
  },
  {
   "id": "eastern-marsh",
   "name": "The eastern marsh",
   "poly": [
    [
     -663,
     829
    ],
    [
     543,
     968
    ],
    [
     1749,
     1382
    ],
    [
     1990,
     1935
    ],
    [
     -663,
     1935
    ]
   ],
   "character": "wetland"
  }
 ],
 "sites": [
  {
   "id": "sb-river-road",
   "name": "River Road Levee Crew",
   "kind": "levee",
   "position": [
    -1652,
    -581
   ],
   "trades": [
    "liuna",
    "iuoe"
   ],
   "programmes": [
    "heavy-equipment-operators"
   ],
   "stations": [
    "br-levee-inspection-and-seepage",
    "op-compactor-lift-thickness-and-edge",
    "op-excavator-trench-and-utility-locate"
   ]
  },
  {
   "id": "sb-refinery",
   "name": "Refinery Corridor Turnaround",
   "kind": "refinery",
   "position": [
    -1025,
    -69
   ],
   "trades": [
    "usw",
    "ibb",
    "ua",
    "insulators"
   ],
   "programmes": [
    "insulators-and-boilermakers",
    "plumbers-and-pipefitters",
    "confined-space"
   ],
   "stations": [
    "ib-pressure-vessel-confined-entry-and-hot-work",
    "ib-refractory-and-castable-installation",
    "ib-boiler-tube-replacement-and-rolling",
    "tank-lining",
    "cs-permit-entry-and-attendant-duties"
   ]
  },
  {
   "id": "sb-battlefield-park",
   "name": "Battlefield Park Ranger Station",
   "kind": "park",
   "position": [
    -1773,
    -290
   ],
   "trades": [
    "afge",
    "afscme"
   ],
   "programmes": [
    "k12-history-and-civics"
   ],
   "stations": [
    "k12-primary-and-secondary-sources",
    "k12-building-a-timeline-from-documents",
    "k12-map-literacy-across-eras",
    "gk-ride-on-mower-pre-start-and-slope-work"
   ]
  },
  {
   "id": "sb-central-wetlands",
   "name": "Central Wetlands Restoration",
   "kind": "wetland",
   "position": [
    -663,
    -553
   ],
   "trades": [
    "liuna",
    "iuoe"
   ],
   "programmes": [
    "marine-ecology-and-restoration",
    "hunters-point-bay-restoration"
   ],
   "stations": [
    "marsh-transect-survey",
    "br-tidal-marsh-grading-amphibious-excavator",
    "me-tidal-marsh-channel-restoration-day",
    "living-shoreline"
   ]
  },
  {
   "id": "sb-violet-floodgate",
   "name": "Violet Canal Floodgate & Launch",
   "kind": "floodgate",
   "position": [
    -579,
    180
   ],
   "trades": [
    "iuoe",
    "ibu"
   ],
   "programmes": [
    "bay-restoration-maritime-underwater"
   ],
   "stations": [
    "tide-gate",
    "mw-workboat-towing-and-line-handling",
    "br-vhf-and-navigation-in-a-work-zone"
   ]
  },
  {
   "id": "sb-shell-beach",
   "name": "Shell Beach Oyster & Shrimp Harbour",
   "kind": "harbour",
   "position": [
    1990,
    829
   ],
   "trades": [
    "ibu",
    "siu"
   ],
   "programmes": [
    "marine-ecology-and-restoration",
    "ports-maritime-ecology"
   ],
   "stations": [
    "oyster-reef-monitoring",
    "me-oyster-reef-monitoring-and-settlement-tiles",
    "br-cold-water-immersion-and-mob-recovery",
    "spill-boom-deploy"
   ]
  },
  {
   "id": "sb-chalmette-ferry",
   "name": "Chalmette Ferry Landing",
   "kind": "ferry",
   "position": [
    -1471,
    -428
   ],
   "trades": [
    "ibu",
    "meba"
   ],
   "programmes": [
    "port-operations"
   ],
   "stations": [
    "mw-ferry-deckhand-and-passenger-safety",
    "mooring-line"
   ]
  },
  {
   "id": "sb-hospital",
   "name": "Parish Hospital & EMS Station",
   "kind": "hospital",
   "position": [
    -1327,
    -332
   ],
   "trades": [
    "nnu",
    "seiu",
    "nage",
    "iaff"
   ],
   "programmes": [
    "first-responders",
    "healthcare-support"
   ],
   "stations": [
    "ambulance-scene-safety",
    "cardiac-arrest-pit-crew",
    "who-treatment-centre-triage",
    "triage-point"
   ]
  },
  {
   "id": "sb-fire-station",
   "name": "Parish Fire Station",
   "kind": "fire-station",
   "position": [
    -880,
    -194
   ],
   "trades": [
    "iaff"
   ],
   "programmes": [
    "first-responders"
   ],
   "stations": [
    "structure-fire-sizeup",
    "hz-decon-corridor-for-a-mass-casualty-drill",
    "decon-line",
    "k12-first-aid-awareness-call-for-help"
   ]
  },
  {
   "id": "sb-surge-barrier",
   "name": "Surge Barrier & Floodwall Crew",
   "kind": "floodwall",
   "position": [
    -277,
    -829
   ],
   "trades": [
    "iuoe",
    "carpenters",
    "liuna"
   ],
   "programmes": [
    "heavy-equipment-operators",
    "bridge-and-structural"
   ],
   "stations": [
    "tide-gate",
    "op-pile-driving-rig-and-lead-setup",
    "uw-bridge-pier-scour-survey",
    "concrete-pour"
   ]
  },
  {
   "id": "sb-school-campus",
   "name": "Parish School Campus",
   "kind": "campus",
   "position": [
    -494,
    663
   ],
   "trades": [
    "aft",
    "csea"
   ],
   "programmes": [
    "education-support-staff",
    "k12-literacy-and-life-skills"
   ],
   "stations": [
    "ed-bus-pretrip-and-loading-zone",
    "ed-kitchen-receiving-and-warewash-sanitizing",
    "k12-writing-a-clear-incident-report",
    "ed-playground-equipment-inspection"
   ]
  },
  // sw:begin — tools/gen_sw_sites.mjs (console SITEWORKS): procedural sites; re-run the tool, do not hand-edit
  {"id":"sb-sw-violet-and-poydras-park-grounds-yard","name":"Violet and Poydras Park Grounds Yard","kind":"park","position":[-420,400],"trades":["afscme","liuna","seiu"],"programmes":["grounds-and-landscaping"],"stations":["gk-ride-on-mower-pre-start-and-slope-work","gk-string-trimmer-and-blower-ppe-and-bystander-zone","gk-tree-work-pole-saw-and-drop-zone","gk-irrigation-controller-valve-box-and-backflow-check"],"blurb":"A procedural park grounds yard in Violet and Poydras: mowers, trimmers, tree work and the irrigation boxes."},
  {"id":"sb-sw-shell-beach-boat-repair-yard","name":"Shell Beach Boat Repair Yard","kind":"shipyard","position":[1760,1000],"trades":["ibb","ironworkers","ua","iupat"],"programmes":["insulators-and-boilermakers","commercial-diving-and-scientific-scuba"],"stations":["ib-pressure-vessel-confined-entry-and-hot-work","tank-lining","cd-pier-piling-inspection-and-wrap-repair","ib-refractory-and-castable-installation"],"blurb":"A procedural boat repair yard in Shell Beach and Hopedale: hot work on the hull, tank lining, the piling divers and the boilermakers."},
  {"id":"sb-sw-arabi-and-chalmette-community-clinic","name":"Arabi and Chalmette Community Clinic","kind":"hospital","position":[-1200,-520],"trades":["nnu","seiu","afscme"],"programmes":["healthcare-support","first-responders"],"stations":["hc-linen-and-regulated-waste-handling","triage-point","hc-workplace-violence-deescalation-at-the-desk","hc-hazardous-drug-spill-kit-response"],"blurb":"A procedural community clinic in Arabi and Chalmette: patient transport, room turnover, regulated waste and the front desk."},
  {"id":"sb-sw-violet-and-poydras-community-clinic","name":"Violet and Poydras Community Clinic","kind":"hospital","position":[-580,360],"trades":["nnu","seiu","afscme"],"programmes":["healthcare-support","first-responders"],"stations":["hc-workplace-violence-deescalation-at-the-desk","hc-hazardous-drug-spill-kit-response","hc-dietary-tray-line-and-allergy-flags","hc-code-response-support-and-crash-cart-check"],"blurb":"A procedural community clinic in Violet and Poydras: patient transport, room turnover, regulated waste and the front desk."},
  {"id":"sb-sw-refinery-corridor-substation","name":"Refinery Corridor Substation","kind":"substation","position":[-840,100],"trades":["ibew"],"programmes":["energy-transition","electrical-first-period"],"stations":["battery-yard","or-transmission-line-right-of-way-patrol","temporary-site-power","substation-switching"],"blurb":"A procedural substation in The refinery corridor: switching under a permit, the line truck, the transformer vault and arc-flash labels."},
  {"id":"sb-sw-arabi-and-chalmette-recreation-centre","name":"Arabi and Chalmette Recreation Centre","kind":"recreation","position":[-1340,-540],"trades":["afscme","seiu"],"programmes":["basketball-fundamentals","property-management"],"stations":["pm-fitness-room-and-gym","bb-warmup-injury-prevention-and-hydration","bb-scrimmage-and-sportsmanship-debrief","pm-pool-and-spa-chemistry"],"blurb":"A procedural recreation centre in Arabi and Chalmette: the gym floor, the pool chemistry, the community room and the playground."},
  {"id":"sb-sw-violet-and-poydras-recreation-centre","name":"Violet and Poydras Recreation Centre","kind":"recreation","position":[-380,780],"trades":["afscme","seiu"],"programmes":["basketball-fundamentals","property-management"],"stations":["bb-scrimmage-and-sportsmanship-debrief","pm-pool-and-spa-chemistry","pm-community-room-and-events","ed-playground-equipment-inspection"],"blurb":"A procedural recreation centre in Violet and Poydras: the gym floor, the pool chemistry, the community room and the playground."},
  {"id":"sb-sw-shell-beach-boat-harbour","name":"Shell Beach Boat Harbour","kind":"harbour","position":[1760,700],"trades":["ibu","siu"],"programmes":["yacht-and-charter-crew","marine-ecology-and-restoration"],"stations":["yc-fuel-dock-transfer-and-spill-kit","yc-pre-departure-safety-briefing-and-guest-count","me-water-column-sampling-from-a-small-boat","yc-shore-power-connection-and-in-water-electrical-safety"],"blurb":"A procedural boat harbour in Shell Beach and Hopedale: line handling, the fuel dock and its spill kit, the pre-departure briefing and water sampling."},
  {"id":"sb-sw-arabi-and-chalmette-substation","name":"Arabi and Chalmette Substation","kind":"substation","position":[-1560,-240],"trades":["ibew"],"programmes":["energy-transition","electrical-first-period"],"stations":["arc-flash-label-study","battery-yard","or-transmission-line-right-of-way-patrol","temporary-site-power"],"blurb":"A procedural substation in Arabi and Chalmette: switching under a permit, the line truck, the transformer vault and arc-flash labels."},
  {"id":"sb-sw-violet-and-poydras-substation","name":"Violet and Poydras Substation","kind":"substation","position":[-420,240],"trades":["ibew"],"programmes":["energy-transition","electrical-first-period"],"stations":["or-transmission-line-right-of-way-patrol","temporary-site-power","substation-switching","line-truck"],"blurb":"A procedural substation in Violet and Poydras: switching under a permit, the line truck, the transformer vault and arc-flash labels."},
  {"id":"sb-sw-refinery-corridor-fire-station","name":"Refinery Corridor Fire Station","kind":"fire-station","position":[-1100,-280],"trades":["iaff","naemt"],"programmes":["first-responders","fall-protection"],"stations":["aerial-ladder","cardiac-arrest-pit-crew","overdose-response-naloxone","traffic-incident-management"],"blurb":"A procedural fire station in The refinery corridor: the engine company's size-up, the aerial ladder, the ambulance crew and rehab."},
  {"id":"sb-sw-arabi-and-chalmette-grocery-distribution-centre","name":"Arabi and Chalmette Grocery Distribution Centre","kind":"warehouse","position":[-1180,-140],"trades":["ufcw","teamsters"],"programmes":["grocery-and-meatpacking"],"stations":["gr-meat-dept-band-saw-and-grinder-lockout","gr-ammonia-leak-alarm-response-cold-plant","gr-deli-slicer-sanitation-and-allergen-line","gr-checkstand-ergonomics-and-robbery-prevention"],"blurb":"A procedural grocery distribution centre in Arabi and Chalmette: cold-chain receiving, the baler, the meat room and the cold plant alarm."},
  {"id":"sb-sw-chalmette-park-grounds-yard","name":"Chalmette Park Grounds Yard","kind":"park","position":[-1680,-200],"trades":["afscme","liuna","seiu"],"programmes":["grounds-and-landscaping"],"stations":["gk-chainsaw-start-and-limbing-on-the-ground","gk-hardscape-paver-base-and-compaction","gk-storm-cleanup-chipper-and-traffic-control","ed-playground-equipment-inspection"],"blurb":"A procedural park grounds yard in Chalmette Battlefield grounds: mowers, trimmers, tree work and the irrigation boxes."},
  {"id":"sb-sw-shell-beach-workboat-landing","name":"Shell Beach Workboat Landing","kind":"landing","position":[1780,840],"trades":["ibu","meba","siu"],"programmes":["port-operations","bay-restoration-maritime-underwater"],"stations":["mooring-line","vessel-gangway-and-hatch-cover-safety","mw-ferry-deckhand-and-passenger-safety","mw-workboat-towing-and-line-handling"],"blurb":"A procedural workboat landing in Shell Beach and Hopedale: workboat towing, the radio in a work zone, cold-water recovery and the gangway."},
  {"id":"sb-sw-violet-and-poydras-grocery-distribution-centre","name":"Violet and Poydras Grocery Distribution Centre","kind":"warehouse","position":[-500,520],"trades":["ufcw","teamsters"],"programmes":["grocery-and-meatpacking"],"stations":["gr-produce-receiving-cold-chain-and-pallet-jack","gr-night-stocking-baler-and-compactor-lockout","gr-meat-dept-band-saw-and-grinder-lockout","gr-ammonia-leak-alarm-response-cold-plant"],"blurb":"A procedural grocery distribution centre in Violet and Poydras: cold-chain receiving, the baler, the meat room and the cold plant alarm."},
  // sw:end
 ],
 "landmarks": [
  {
   "id": "chalmette-battlefield",
   "name": "Chalmette Battlefield",
   "position": [
    -1749,
    -276
   ],
   "kind": "park"
  },
  {
   "id": "chalmette-ferry-landing",
   "name": "Chalmette ferry landing",
   "position": [
    -1495,
    -401
   ],
   "kind": "ferry"
  },
  {
   "id": "violet-canal",
   "name": "Violet Canal",
   "position": [
    -543,
    0
   ],
   "kind": "canal"
  },
  {
   "id": "shell-beach-shore",
   "name": "Shell Beach",
   "position": [
    2014,
    815
   ],
   "kind": "shore"
  },
  {
   "id": "bayou-bienvenue",
   "name": "Bayou Bienvenue",
   "position": [
    -1387,
    -898
   ],
   "kind": "bayou"
  },
  {
   "id": "caernarvon-bend",
   "name": "The river road bend at Caernarvon",
   "position": [
    -574,
    829
   ],
   "kind": "river"
  },
  {
   "id": "lake-borgne-shore",
   "name": "Lake Borgne shore",
   "position": [
    1749,
    276
   ],
   "kind": "shore"
  },
  {
   "id": "outlet-canal",
   "name": "The outlet canal",
   "position": [
    -302,
    -898
   ],
   "kind": "canal"
  }
 ],
 "connectors": [
  {
   "id": "sb-st-claude-orleans",
   "kind": "road",
   "from": {
    "parish": "st-bernard",
    "position": [
     -1833,
     -581
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     1568,
     422
    ]
   },
   "name": "St. Claude Avenue at the Orleans line",
   "lonlat": [
    -89.997,
    29.962
   ],
   "approximate": true
  },
  {
   "id": "sb-chalmette-ferry",
   "kind": "ferry",
   "from": {
    "parish": "st-bernard",
    "position": [
     -1604,
     -415
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     2040,
     812
    ]
   },
   "name": "Chalmette ferry across the river",
   "lonlat": [
    -89.978,
    29.95
   ],
   "approximate": true
  },
  {
   "id": "sb-river-road-plaquemines",
   "kind": "road",
   "from": {
    "parish": "st-bernard",
    "position": [
     -724,
     898
    ]
   },
   "to": {
    "parish": "plaquemines",
    "position": [
     -1089,
     -1576
    ]
   },
   "name": "The east bank river road at Caernarvon",
   "lonlat": [
    -89.905,
    29.855
   ],
   "approximate": true
  }
 ],
 "fieldLessons": [
  {
   "id": "sb-fl-battlefield-sources",
   "title": "A letter from the field is a primary source",
   "site": "sb-battlefield-park",
   "landmark": "chalmette-battlefield",
   "k12": "k12-primary-and-secondary-sources",
   "trade": "Park rangers and archivists",
   "tradeLine": "A ranger tells the battlefield's story from documents of the time and says which ones are copies of copies.",
   "minutes": 3,
   "steps": [
    "A primary source was made at the time by someone who was there: a letter, a map, a drawing.",
    "A secondary source was written later by someone who read those.",
    "At the park boards, look for which kind each quotation is."
   ],
   "check": {
    "q": "A soldier's letter written that week is which kind of source?",
    "options": [
     "Primary",
     "Secondary",
     "Neither"
    ],
    "answer": 0,
    "why": "It was made at the time by someone who was there."
   }
  },
  {
   "id": "sb-fl-high-river-seepage",
   "title": "A high river pushes through the ground",
   "site": "sb-river-road",
   "landmark": "caernarvon-bend",
   "k12": "k12-buoyancy-and-pressure-in-the-deep",
   "trade": "Levee inspection crews",
   "tradeLine": "A levee inspector reads a wet spot at the toe as the river's pressure pushing water through the ground.",
   "minutes": 3,
   "steps": [
    "The river's surface sits higher than the land behind the levee.",
    "Deeper water pushes harder, so at high river the push through the ground is greatest.",
    "Walk the landside toe: a soft, wet patch on a dry day is what the patrol reports."
   ],
   "check": {
    "q": "When does water push hardest through the ground under a levee?",
    "options": [
     "When the river is high",
     "When the river is low",
     "It never changes"
    ],
    "answer": 0,
    "why": "A higher river means more water pressing down and through."
   }
  },
  {
   "id": "sb-fl-tags-before-entry",
   "title": "Read every tag before the entry",
   "site": "sb-refinery",
   "k12": "k12-reading-instructions-and-safety-labels",
   "trade": "Boilermakers and pipefitters",
   "tradeLine": "Before a vessel entry the crew reads every tag on the isolation, and nobody enters until the permit says so.",
   "minutes": 2,
   "steps": [
    "A tag on a valve says who locked it and why.",
    "The permit lists what must be true before anyone enters.",
    "Find the tag, read the permit, then ask: does the scene match the paper?"
   ],
   "check": {
    "q": "What must be checked before entering a vessel?",
    "options": [
     "The permit and every isolation tag",
     "The weather",
     "The lunch schedule"
    ],
    "answer": 0,
    "why": "Entry waits until the permit's conditions are met and every isolation is tagged."
   }
  }
 ],
 "gated": [
  {
   "id": "sb-gate-turnaround-night",
   "kind": "quest",
   "world": "parishes",
   "title": "Turnaround Night Shift",
   "site": "sb-refinery",
   "siteName": "Refinery Corridor Turnaround",
   "gate": {
    "stations": [
     "ib-pressure-vessel-confined-entry-and-hot-work",
     "cs-permit-entry-and-attendant-duties"
    ],
    "note": "Vessel entry and the attendant's duties before a turnaround shift."
   },
   "summary": "Work a turnaround night shift on the refinery corridor with the crew.",
   "parish": "st-bernard"
  },
  {
   "id": "sb-gate-high-river-patrol",
   "kind": "quest",
   "world": "parishes",
   "title": "High River Patrol",
   "site": "sb-river-road",
   "siteName": "River Road Levee Crew",
   "gate": {
    "stations": [
     "br-levee-inspection-and-seepage"
    ],
    "k12": [
     "k12-buoyancy-and-pressure-in-the-deep"
    ],
    "note": "Levee inspection and the pressure lesson before the high river patrol."
   },
   "summary": "Walk the river levee at high water and report every seep.",
   "parish": "st-bernard"
  }
 ],
 "scale": 8,
 "blurb": "The parish down river from the city: the river road and the refinery at Chalmette, the ferry landing, the battlefield park, the floodgate on the Violet Canal, the surge barrier across the wetlands, and the road out through the marsh to the harbour at Shell Beach."
};
