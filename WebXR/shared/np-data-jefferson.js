// Jefferson Parish — a parish data module on the shared parish schema (crescent brief, console DELTA).
// Pure data: no three.js, no DOM, no imports. Real places are named only by their public names as places;
// every coordinate is approximate (three decimals, `approximate: true`) and exists only to place a map.
// Positions are scene metres on a 4096 m square (x east, +z south), one map metre = 8 m on the ground;
// the anchors fit np-geo.js's affine. Water with a `width` is a ribbon along its points, without one a polygon.
// Validated by tools/check_parish_data.mjs. Field lessons follow RW_FIELD_LESSONS; gated items the gate contract.
export const NP_JEFFERSON = {
 "id": "jefferson",
 "name": "Jefferson Parish",
 "size": 4096,
 "anchors": [
  {
   "xz": [
    -157,
    636
   ],
   "lonlat": [
    -90.153,
    29.984
   ],
   "approximate": true,
   "name": "Metairie"
  },
  {
   "xz": [
    -1422,
    511
   ],
   "lonlat": [
    -90.258,
    29.993
   ],
   "approximate": true,
   "name": "Louis Armstrong New Orleans International Airport"
  },
  {
   "xz": [
    -1229,
    276
   ],
   "lonlat": [
    -90.242,
    30.01
   ],
   "approximate": true,
   "name": "Kenner"
  },
  {
   "xz": [
    241,
    83
   ],
   "lonlat": [
    -90.12,
    30.024
   ],
   "approximate": true,
   "name": "the lakefront at Bucktown"
  },
  {
   "xz": [
    -145,
    97
   ],
   "lonlat": [
    -90.152,
    30.023
   ],
   "approximate": true,
   "name": "the Causeway south toll plaza"
  },
  {
   "xz": [
    -337,
    1202
   ],
   "lonlat": [
    -90.168,
    29.943
   ],
   "approximate": true,
   "name": "Huey P. Long Bridge"
  },
  {
   "xz": [
    1036,
    1576
   ],
   "lonlat": [
    -90.054,
    29.916
   ],
   "approximate": true,
   "name": "Gretna riverfront"
  },
  {
   "xz": [
    -24,
    1714
   ],
   "lonlat": [
    -90.142,
    29.906
   ],
   "approximate": true,
   "name": "Westwego"
  },
  {
   "xz": [
    -819,
    346
   ],
   "lonlat": [
    -90.208,
    30.005
   ],
   "approximate": true,
   "name": "Lafreniere Park"
  },
  {
   "xz": [
    145,
    -1935
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
     -622
    ],
    [
     -1325,
     -207
    ],
    [
     -602,
     0
    ],
    [
     -145,
     97
    ],
    [
     241,
     69
    ],
    [
     2048,
     0
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
   "id": "mississippi-river",
   "kind": "river",
   "poly": [
    [
     -1807,
     622
    ],
    [
     -1265,
     857
    ],
    [
     -723,
     995
    ],
    [
     -337,
     1202
    ],
    [
     120,
     1175
    ],
    [
     602,
     1037
    ],
    [
     964,
     1106
    ],
    [
     1084,
     1382
    ],
    [
     1325,
     1728
    ],
    [
     1687,
     2004
    ]
   ],
   "width": 90
  },
  {
   "id": "harvey-canal",
   "kind": "canal",
   "poly": [
    [
     747,
     1631
    ],
    [
     843,
     1935
    ],
    [
     904,
     2048
    ]
   ],
   "width": 8
  },
  {
   "id": "seventeenth-street-canal",
   "kind": "canal",
   "poly": [
    [
     241,
     69
    ],
    [
     217,
     415
    ],
    [
     181,
     622
    ]
   ],
   "width": 6
  },
  {
   "id": "bayou-segnette-wetland",
   "kind": "wetland",
   "poly": [
    [
     -723,
     1866
    ],
    [
     -120,
     1866
    ],
    [
     -120,
     2048
    ],
    [
     -723,
     2048
    ],
    [
     -843,
     2048
    ]
   ]
  },
  {
   "id": "bayou-segnette",
   "kind": "bayou",
   "poly": [
    [
     -241,
     1714
    ],
    [
     -361,
     2004
    ],
    [
     -542,
     2048
    ]
   ],
   "width": 5
  }
 ],
 "levees": [
  {
   "id": "lakefront-levee",
   "pts": [
    [
     -2048,
     -622
    ],
    [
     -1325,
     -207
    ],
    [
     -602,
     0
    ],
    [
     -145,
     97
    ],
    [
     241,
     69
    ]
   ],
   "height": 5
  },
  {
   "id": "east-bank-river-levee",
   "pts": [
    [
     -1807,
     525
    ],
    [
     -1265,
     760
    ],
    [
     -723,
     898
    ],
    [
     -337,
     1106
    ],
    [
     120,
     1078
    ],
    [
     602,
     940
    ],
    [
     964,
     995
    ]
   ],
   "height": 7
  },
  {
   "id": "west-bank-river-levee",
   "pts": [
    [
     -723,
     1133
    ],
    [
     -337,
     1299
    ],
    [
     120,
     1285
    ],
    [
     602,
     1175
    ],
    [
     964,
     1244
    ],
    [
     1144,
     1451
    ],
    [
     1385,
     1797
    ]
   ],
   "height": 7
  },
  {
   "id": "seventeenth-street-floodwall",
   "pts": [
    [
     265,
     69
    ],
    [
     241,
     415
    ],
    [
     205,
     622
    ]
   ],
   "height": 6
  }
 ],
 "roads": [
  {
   "id": "interstate-ten",
   "kind": "interstate",
   "pts": [
    [
     -2048,
     276
    ],
    [
     -1446,
     346
    ],
    [
     -723,
     373
    ],
    [
     -120,
     415
    ],
    [
     265,
     415
    ]
   ]
  },
  {
   "id": "veterans-boulevard",
   "kind": "avenue",
   "pts": [
    [
     -1566,
     207
    ],
    [
     -120,
     249
    ],
    [
     241,
     249
    ]
   ]
  },
  {
   "id": "the-causeway",
   "kind": "causeway",
   "pts": [
    [
     -145,
     97
    ],
    [
     145,
     -1935
    ],
    [
     169,
     -2048
    ]
   ]
  },
  {
   "id": "huey-p-long-bridge",
   "kind": "bridge",
   "pts": [
    [
     -361,
     995
    ],
    [
     -337,
     1202
    ],
    [
     -301,
     1410
    ]
   ]
  },
  {
   "id": "river-road",
   "kind": "riverroad",
   "pts": [
    [
     -1807,
     525
    ],
    [
     -1265,
     760
    ],
    [
     -723,
     898
    ],
    [
     -337,
     1106
    ],
    [
     120,
     1078
    ],
    [
     602,
     940
    ]
   ]
  },
  {
   "id": "westbank-expressway",
   "kind": "interstate",
   "pts": [
    [
     -723,
     1659
    ],
    [
     -24,
     1714
    ],
    [
     482,
     1659
    ],
    [
     1036,
     1520
    ]
   ]
  },
  {
   "id": "williams-boulevard",
   "kind": "avenue",
   "pts": [
    [
     -1229,
     -150
    ],
    [
     -1229,
     276
    ],
    [
     -1265,
     622
    ]
   ]
  },
  {
   "id": "belle-chasse-highway",
   "kind": "avenue",
   "pts": [
    [
     1036,
     1659
    ],
    [
     1265,
     1866
    ],
    [
     1446,
     2004
    ]
   ]
  },
  {
   "id": "lakeshore-drive",
   "kind": "street",
   "pts": [
    [
     -145,
     97
    ],
    [
     241,
     83
    ]
   ]
  },
  {
   "id": "jefferson-highway",
   "kind": "street",
   "pts": [
    [
     -1265,
     719
    ],
    [
     -723,
     829
    ],
    [
     -337,
     1037
    ],
    [
     120,
     995
    ]
   ]
  },
  {
   "id": "airline-drive",
   "kind": "avenue",
   "pts": [
    [
     -1928,
     415
    ],
    [
     -1422,
     456
    ],
    [
     -723,
     553
    ],
    [
     120,
     622
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "metairie",
   "name": "Metairie",
   "poly": [
    [
     -723,
     138
    ],
    [
     241,
     138
    ],
    [
     241,
     898
    ],
    [
     -723,
     898
    ]
   ],
   "character": "suburb"
  },
  {
   "id": "airport-side",
   "name": "The airport side of Kenner",
   "poly": [
    [
     -1807,
     0
    ],
    [
     -1084,
     0
    ],
    [
     -1084,
     760
    ],
    [
     -1807,
     622
    ]
   ],
   "character": "industrial"
  },
  {
   "id": "kenner",
   "name": "Kenner",
   "poly": [
    [
     -1807,
     -276
    ],
    [
     -723,
     -69
    ],
    [
     -723,
     138
    ],
    [
     -1084,
     138
    ],
    [
     -1084,
     0
    ],
    [
     -1807,
     0
    ]
   ],
   "character": "suburb"
  },
  {
   "id": "elmwood",
   "name": "Elmwood",
   "poly": [
    [
     -843,
     760
    ],
    [
     -361,
     760
    ],
    [
     -361,
     1106
    ],
    [
     -843,
     968
    ]
   ],
   "character": "industrial"
  },
  {
   "id": "bucktown",
   "name": "Bucktown lakefront",
   "poly": [
    [
     -120,
     97
    ],
    [
     265,
     69
    ],
    [
     265,
     346
    ],
    [
     -120,
     346
    ]
   ],
   "character": "garden"
  },
  {
   "id": "old-gretna",
   "name": "Old Gretna",
   "poly": [
    [
     843,
     1382
    ],
    [
     1144,
     1382
    ],
    [
     1144,
     1728
    ],
    [
     843,
     1728
    ]
   ],
   "character": "quarter"
  },
  {
   "id": "westbank-waterfront",
   "name": "The west bank waterfront",
   "poly": [
    [
     -843,
     1313
    ],
    [
     783,
     1313
    ],
    [
     783,
     1866
    ],
    [
     -843,
     1866
    ]
   ],
   "character": "port"
  },
  {
   "id": "bayou-segnette",
   "name": "Bayou Segnette",
   "poly": [
    [
     -723,
     1866
    ],
    [
     -120,
     1866
    ],
    [
     -120,
     2048
    ],
    [
     -723,
     2048
    ]
   ],
   "character": "wetland"
  }
 ],
 "sites": [
  {
   "id": "jf-airport-ramp",
   "name": "Airport Ramp Crew",
   "kind": "airport",
   "position": [
    -1422,
    511
   ],
   "trades": [
    "iam",
    "twu",
    "teamsters"
   ],
   "programmes": [
    "aviation-maintenance-and-ground"
   ],
   "stations": [
    "airport-ramp",
    "av-pushback-tug-and-towbar-connection",
    "av-marshalling-and-wingwalker-signals",
    "av-hangar-jacking-and-stands",
    "av-borescope-and-tool-control-inventory"
   ]
  },
  {
   "id": "jf-lakefront-levee",
   "name": "Lakefront Levee & Floodwall Crew",
   "kind": "levee",
   "position": [
    181,
    124
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
    "op-grader-fine-grade-and-crown"
   ]
  },
  {
   "id": "jf-pump-station",
   "name": "Drainage Pumping Station",
   "kind": "pumping-station",
   "position": [
    181,
    304
   ],
   "trades": [
    "iuoe",
    "ibew",
    "uwua"
   ],
   "programmes": [
    "water-and-gas-utility-crews",
    "stationary-engineer"
   ],
   "stations": [
    "lift-station",
    "ut-night-storm-response-crew-and-portable-generator",
    "motor-control-center",
    "cs-ventilation-and-air-monitoring-plan"
   ]
  },
  {
   "id": "jf-causeway-yard",
   "name": "Causeway Maintenance Yard",
   "kind": "bridge-yard",
   "position": [
    -145,
    152
   ],
   "trades": [
    "ironworkers",
    "iupat",
    "iuoe",
    "liuna"
   ],
   "programmes": [
    "bridge-and-structural"
   ],
   "stations": [
    "deck-joint-replacement",
    "bs-bearing-replacement-and-jacking",
    "bs-structural-bolting-and-torque",
    "gg-deck-lane-closure-and-traveller",
    "uw-bridge-pier-scour-survey",
    "traffic-incident-management"
   ]
  },
  {
   "id": "jf-river-bridge",
   "name": "River Bridge Ironworkers & Painters",
   "kind": "bridge",
   "position": [
    -386,
    1078
   ],
   "trades": [
    "ironworkers",
    "iupat"
   ],
   "programmes": [
    "bridge-and-structural"
   ],
   "stations": [
    "bridge-lead-containment",
    "bs-structural-bolting-and-torque",
    "gg-fog-and-wind-work-stop",
    "gg-tower-climb-and-tie-off"
   ]
  },
  {
   "id": "jf-elmwood-freight",
   "name": "Elmwood Freight & Warehouse Row",
   "kind": "warehouse",
   "position": [
    -602,
    940
   ],
   "trades": [
    "teamsters"
   ],
   "programmes": [
    "warehouse-and-logistics-automation",
    "job-readiness-edition"
   ],
   "stations": [
    "tdl-pretrip-inspection",
    "tdl-backing-and-docking",
    "tw-dock-leveler-and-trailer-restraint-check",
    "forklift-dock"
   ]
  },
  {
   "id": "jf-harvey-canal-yard",
   "name": "Harvey Canal Marine Yard",
   "kind": "shipyard",
   "position": [
    723,
    1755
   ],
   "trades": [
    "ibb",
    "ironworkers",
    "ibu",
    "meba"
   ],
   "programmes": [
    "insulators-and-boilermakers",
    "bay-restoration-maritime-underwater"
   ],
   "stations": [
    "shipyard-hotwork",
    "mw-workboat-towing-and-line-handling",
    "mooring-line",
    "ib-pressure-vessel-confined-entry-and-hot-work"
   ]
  },
  {
   "id": "jf-gretna-landing",
   "name": "Gretna Riverfront Landing",
   "kind": "landing",
   "position": [
    1036,
    1576
   ],
   "trades": [
    "ibu",
    "meba",
    "siu"
   ],
   "programmes": [
    "port-operations"
   ],
   "stations": [
    "mw-ferry-deckhand-and-passenger-safety",
    "br-vhf-and-navigation-in-a-work-zone",
    "br-cold-water-immersion-and-mob-recovery"
   ]
  },
  {
   "id": "jf-hospital",
   "name": "East Bank Hospital District",
   "kind": "hospital",
   "position": [
    -301,
    553
   ],
   "trades": [
    "nnu",
    "seiu",
    "iuoe"
   ],
   "programmes": [
    "healthcare-support"
   ],
   "stations": [
    "cath-lab",
    "pl-medical-gas-brazing-and-purge",
    "se-building-automation-alarm-triage",
    "who-ppe-donning-and-doffing"
   ]
  },
  {
   "id": "jf-lafreniere-park",
   "name": "Lafreniere Park Grounds Crew",
   "kind": "park",
   "position": [
    -819,
    346
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
    "gk-storm-cleanup-chipper-and-traffic-control",
    "gk-ride-on-mower-pre-start-and-slope-work",
    "gk-irrigation-controller-valve-box-and-backflow-check",
    "ed-playground-equipment-inspection"
   ]
  },
  {
   "id": "jf-transit-yard",
   "name": "West Bank Transit Yard",
   "kind": "transit",
   "position": [
    482,
    1700
   ],
   "trades": [
    "atu",
    "iam"
   ],
   "programmes": [
    "transit-ramp"
   ],
   "stations": [
    "bus-yard-fuelling-and-brake-check",
    "bus-depot-lift",
    "tr-wheelchair-lift-and-securement-on-a-bus"
   ]
  },
  {
   "id": "jf-kenner-rail",
   "name": "Kenner Rail Corridor",
   "kind": "rail",
   "position": [
    -1277,
    581
   ],
   "trades": [
    "bmwed",
    "blet",
    "smart-td",
    "brs"
   ],
   "programmes": [
    "railroad-crafts"
   ],
   "stations": [
    "ra-roadway-worker-protection-and-job-briefing",
    "ra-tie-and-rail-replacement-with-track-machines",
    "drive-night-fog-and-rail-crossing"
   ]
  },
  // sw:begin — tools/gen_sw_sites.mjs (console SITEWORKS): procedural sites; re-run the tool, do not hand-edit
  {"id":"jf-sw-kenner-school-campus","name":"Kenner School Campus","kind":"school","position":[-1780,-260],"trades":["aft","csea","seiu"],"programmes":["education-support-staff","k12-literacy-and-life-skills"],"stations":["ed-custodial-chemical-dilution-and-floor-machine","ed-playground-equipment-inspection","ed-crossing-guard-intersection-control","k12-reading-instructions-and-safety-labels"],"blurb":"A procedural school campus in Kenner: custodians, the crossing guard, the kitchen crew and a classroom lesson."},
  {"id":"jf-sw-west-bank-waterfront-boat-harbour","name":"West Bank Waterfront Boat Harbour","kind":"harbour","position":[-840,1780],"trades":["ibu","siu"],"programmes":["yacht-and-charter-crew","marine-ecology-and-restoration"],"stations":["yc-fuel-dock-transfer-and-spill-kit","yc-pre-departure-safety-briefing-and-guest-count","me-water-column-sampling-from-a-small-boat","yc-shore-power-connection-and-in-water-electrical-safety"],"blurb":"A procedural boat harbour in The west bank waterfront: line handling, the fuel dock and its spill kit, the pre-departure briefing and water sampling."},
  {"id":"jf-sw-kenner-airport-side-rail-siding","name":"Kenner Airport Side Rail Siding","kind":"rail","position":[-1300,0],"trades":["bmwed","blet","smart-td","brs"],"programmes":["railroad-crafts"],"stations":["ra-switch-inspection-and-lubrication","ra-hand-brake-and-securement-on-a-grade","ra-crossing-signal-maintenance-and-flagging","ra-air-brake-test-and-train-inspection"],"blurb":"A procedural rail siding in The airport side of Kenner: roadway worker protection, blue flags, the switches and the crossing signals."},
  {"id":"jf-sw-west-bank-waterfront-workboat-landing","name":"West Bank Waterfront Workboat Landing","kind":"landing","position":[-180,1760],"trades":["ibu","meba","siu"],"programmes":["port-operations","bay-restoration-maritime-underwater"],"stations":["vessel-gangway-and-hatch-cover-safety","mw-ferry-deckhand-and-passenger-safety","mw-workboat-towing-and-line-handling","br-vhf-and-navigation-in-a-work-zone"],"blurb":"A procedural workboat landing in The west bank waterfront: workboat towing, the radio in a work zone, cold-water recovery and the gangway."},
  {"id":"jf-sw-kenner-fire-station","name":"Kenner Fire Station","kind":"fire-station","position":[-940,0],"trades":["iaff","naemt"],"programmes":["first-responders","fall-protection"],"stations":["overdose-response-naloxone","traffic-incident-management","ev-extrication","structure-fire-sizeup"],"blurb":"A procedural fire station in Kenner: the engine company's size-up, the aerial ladder, the ambulance crew and rehab."},
  {"id":"jf-sw-metairie-community-clinic","name":"Metairie Community Clinic","kind":"hospital","position":[140,840],"trades":["nnu","seiu","afscme"],"programmes":["healthcare-support","first-responders"],"stations":["hc-hazardous-drug-spill-kit-response","hc-dietary-tray-line-and-allergy-flags","hc-code-response-support-and-crash-cart-check","hc-patient-transport-and-safe-handling"],"blurb":"A procedural community clinic in Metairie: patient transport, room turnover, regulated waste and the front desk."},
  {"id":"jf-sw-west-bank-waterfront-distribution-warehouse","name":"West Bank Waterfront Distribution Warehouse","kind":"warehouse","position":[120,1400],"trades":["teamsters"],"programmes":["warehouse-and-logistics-automation","job-readiness-edition"],"stations":["forklift-dock","tw-dock-leveler-and-trailer-restraint-check","tw-conveyor-jam-clearing-and-loto","tdl-pick-pack-and-scan"],"blurb":"A procedural distribution warehouse in The west bank waterfront: the dock, the conveyors, the charging bay and the order pickers."},
  {"id":"jf-sw-metairie-recreation-centre","name":"Metairie Recreation Centre","kind":"recreation","position":[-520,140],"trades":["afscme","seiu"],"programmes":["basketball-fundamentals","property-management"],"stations":["bb-scrimmage-and-sportsmanship-debrief","pm-pool-and-spa-chemistry","pm-community-room-and-events","ed-playground-equipment-inspection"],"blurb":"A procedural recreation centre in Metairie: the gym floor, the pool chemistry, the community room and the playground."},
  {"id":"jf-sw-kenner-airport-side-substation","name":"Kenner Airport Side Substation","kind":"substation","position":[-1780,220],"trades":["ibew"],"programmes":["energy-transition","electrical-first-period"],"stations":["transformer-vault","arc-flash-label-study","battery-yard","or-transmission-line-right-of-way-patrol"],"blurb":"A procedural substation in The airport side of Kenner: switching under a permit, the line truck, the transformer vault and arc-flash labels."},
  {"id":"jf-sw-west-bank-waterfront-cargo-terminal","name":"West Bank Waterfront Cargo Terminal","kind":"port","position":[-840,1320],"trades":["ila","iuoe","teamsters"],"programmes":["port-operations","ports-maritime-ecology"],"stations":["reefer-yard-monitoring","straddle-carrier-ops","shore-power-hookup","hazmat-container-inspection"],"blurb":"A procedural cargo terminal in The west bank waterfront: the dock crane, lashing gangs, the mooring lines and the reefer yard."},
  {"id":"jf-sw-kenner-park-grounds-yard","name":"Kenner Park Grounds Yard","kind":"park","position":[-1600,-20],"trades":["afscme","liuna","seiu"],"programmes":["grounds-and-landscaping"],"stations":["gk-chainsaw-start-and-limbing-on-the-ground","gk-hardscape-paver-base-and-compaction","gk-storm-cleanup-chipper-and-traffic-control","ed-playground-equipment-inspection"],"blurb":"A procedural park grounds yard in Kenner: mowers, trimmers, tree work and the irrigation boxes."},
  {"id":"jf-sw-metairie-substation","name":"Metairie Substation","kind":"substation","position":[-620,600],"trades":["ibew"],"programmes":["energy-transition","electrical-first-period"],"stations":["temporary-site-power","substation-switching","line-truck","transformer-vault"],"blurb":"A procedural substation in Metairie: switching under a permit, the line truck, the transformer vault and arc-flash labels."},
  {"id":"jf-sw-kenner-airport-side-mail-processing-plant","name":"Kenner Airport Side Mail Processing Plant","kind":"warehouse","position":[-1140,280],"trades":["apwu","npmhu","nalc"],"programmes":["postal-and-mail-processing"],"stations":["ml-mail-handler-forklift-and-container-dock","ml-delivery-van-pretrip-and-route-loading","ml-suspicious-package-protocol","ml-heat-and-cold-stress-on-route"],"blurb":"A procedural mail processing plant in The airport side of Kenner: the sorters, the container dock, the delivery vans and the package protocol."},
  {"id":"jf-sw-old-gretna-school-campus","name":"Old Gretna School Campus","kind":"school","position":[860,1440],"trades":["aft","csea","seiu"],"programmes":["education-support-staff","k12-literacy-and-life-skills"],"stations":["k12-reading-instructions-and-safety-labels","ed-kitchen-receiving-and-warewash-sanitizing","ed-bus-pretrip-and-loading-zone","k12-first-aid-awareness-call-for-help"],"blurb":"A procedural school campus in Old Gretna: custodians, the crossing guard, the kitchen crew and a classroom lesson."},
  {"id":"jf-sw-west-bank-waterfront-boat-repair-yard","name":"West Bank Waterfront Boat Repair Yard","kind":"shipyard","position":[-480,1500],"trades":["ibb","ironworkers","ua","iupat"],"programmes":["insulators-and-boilermakers","commercial-diving-and-scientific-scuba"],"stations":["shipyard-hotwork","ib-pressure-vessel-confined-entry-and-hot-work","tank-lining","cd-pier-piling-inspection-and-wrap-repair"],"blurb":"A procedural boat repair yard in The west bank waterfront: hot work on the hull, tank lining, the piling divers and the boilermakers."},
  {"id":"jf-sw-metairie-grocery-distribution-centre","name":"Metairie Grocery Distribution Centre","kind":"warehouse","position":[-220,840],"trades":["ufcw","teamsters"],"programmes":["grocery-and-meatpacking"],"stations":["gr-produce-receiving-cold-chain-and-pallet-jack","gr-night-stocking-baler-and-compactor-lockout","gr-meat-dept-band-saw-and-grinder-lockout","gr-ammonia-leak-alarm-response-cold-plant"],"blurb":"A procedural grocery distribution centre in Metairie: cold-chain receiving, the baler, the meat room and the cold plant alarm."},
  {"id":"jf-sw-kenner-airport-side-grocery-distribution-centre","name":"Kenner Airport Side Grocery Distribution Centre","kind":"warehouse","position":[-1500,240],"trades":["ufcw","teamsters"],"programmes":["grocery-and-meatpacking"],"stations":["gr-night-stocking-baler-and-compactor-lockout","gr-meat-dept-band-saw-and-grinder-lockout","gr-ammonia-leak-alarm-response-cold-plant","gr-deli-slicer-sanitation-and-allergen-line"],"blurb":"A procedural grocery distribution centre in The airport side of Kenner: cold-chain receiving, the baler, the meat room and the cold plant alarm."},
  // sw:end
 ],
 "landmarks": [
  {
   "id": "bucktown-shore",
   "name": "Lake Pontchartrain shoreline at Bucktown",
   "position": [
    181,
    83
   ],
   "kind": "shore"
  },
  {
   "id": "causeway-toll",
   "name": "Causeway south toll plaza",
   "position": [
    -145,
    111
   ],
   "kind": "plaza"
  },
  {
   "id": "huey-p-long",
   "name": "Huey P. Long Bridge",
   "position": [
    -310,
    1300
   ],
   "kind": "bridge"
  },
  {
   "id": "lafreniere-lagoon",
   "name": "Lafreniere Park lagoon",
   "position": [
    -795,
    373
   ],
   "kind": "park"
  },
  {
   "id": "rivertown",
   "name": "Rivertown, Kenner",
   "position": [
    -1241,
    622
   ],
   "kind": "quarter"
  },
  {
   "id": "harvey-lock",
   "name": "Harvey Canal lock",
   "position": [
    747,
    1631
   ],
   "kind": "lock"
  },
  {
   "id": "bayou-segnette-launch",
   "name": "Bayou Segnette boat launch",
   "position": [
    -265,
    1797
   ],
   "kind": "bayou"
  },
  {
   "id": "seventeenth-street-canal",
   "name": "Seventeenth Street Canal",
   "position": [
    229,
    276
   ],
   "kind": "canal"
  }
 ],
 "connectors": [
  {
   "id": "jf-causeway",
   "kind": "causeway",
   "from": {
    "parish": "jefferson",
    "position": [
     145,
     -1935
    ]
   },
   "to": {
    "parish": "st-tammany",
    "position": [
     -1662,
     1769
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
   "id": "jf-interstate-orleans",
   "kind": "bridge",
   "from": {
    "parish": "jefferson",
    "position": [
     265,
     415
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     -1850,
     -811
    ]
   },
   "name": "The interstate at the Seventeenth Street Canal",
   "lonlat": [
    -90.118,
    30
   ],
   "approximate": true
  },
  {
   "id": "jf-westbank-expressway-orleans",
   "kind": "road",
   "from": {
    "parish": "jefferson",
    "position": [
     1144,
     1451
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     212,
     1623
    ]
   },
   "name": "Westbank Expressway at the Orleans line",
   "lonlat": [
    -90.045,
    29.925
   ],
   "approximate": true
  },
  {
   "id": "jf-belle-chasse-highway",
   "kind": "road",
   "from": {
    "parish": "jefferson",
    "position": [
     1446,
     2004
    ]
   },
   "to": {
    "parish": "plaquemines",
    "position": [
     -1646,
     -1742
    ]
   },
   "name": "Belle Chasse Highway at the Plaquemines line",
   "lonlat": [
    -90.02,
    29.885
   ],
   "approximate": true
  },
  {
   "id": "jf-lakefront-orleans",
   "kind": "road",
   "from": {
    "parish": "jefferson",
    "position": [
     193,
     180
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     -2020,
     -1363
    ]
   },
   "name": "The lakefront road at the canal mouth",
   "lonlat": [
    -90.124,
    30.017
   ],
   "approximate": true
  }
 ],
 "fieldLessons": [
  {
   "id": "jf-fl-pumps-lift-the-rain",
   "title": "Pumps lift the rain over the levee",
   "site": "jf-pump-station",
   "landmark": "seventeenth-street-canal",
   "k12": "k12-water-cycle-and-filtration",
   "trade": "Pumping station operators",
   "tradeLine": "A pumping station operator lifts rainwater up into the outfall canal so gravity can carry it to the lake, the last step of the city's water cycle.",
   "minutes": 3,
   "steps": [
    "Rain that falls behind a levee cannot run off on its own; the ground here is lower than the water outside.",
    "The pumps lift that water up into the canal, and from there it flows to the lake.",
    "Look at the canal beside the station: after rain its level rises because the pumps are working."
   ],
   "check": {
    "q": "Why does this parish need pumps to move rain away?",
    "options": [
     "The ground sits lower than the water outside the levee",
     "Rain here is saltier than elsewhere",
     "Canals only flow uphill"
    ],
    "answer": 0,
    "why": "Behind a levee the land is low, so water must be lifted before it can flow away."
   }
  },
  {
   "id": "jf-fl-causeway-as-a-ruler",
   "title": "The causeway is a ruler for the map",
   "site": "jf-causeway-yard",
   "landmark": "causeway-toll",
   "k12": "k12-reading-a-map-scale-in-bay-world",
   "trade": "Bridge maintenance crews",
   "tradeLine": "A bridge crew plans a lane closure from the map's scale bar before the first cone is set.",
   "minutes": 2,
   "steps": [
    "The causeway runs straight across the lake, so it makes a good ruler for the map.",
    "Hold the scale bar against the causeway and count how many bar lengths reach the far shore.",
    "The crew uses that count to plan where a closure begins and how far traffic runs beside it."
   ],
   "check": {
    "q": "What does the scale bar tell you about the causeway?",
    "options": [
     "How long it really is",
     "How many cars use it",
     "What colour its railings are"
    ],
    "answer": 0,
    "why": "A scale bar turns a length on the map into a length on the ground."
   }
  },
  {
   "id": "jf-fl-ramp-hand-signals",
   "title": "Hand signals on a loud ramp",
   "site": "jf-airport-ramp",
   "k12": "k12-reading-instructions-and-safety-labels",
   "trade": "Ramp agents and marshallers",
   "tradeLine": "A marshaller's hand signals are a shared language that every crew member on the ramp reads the same way.",
   "minutes": 2,
   "steps": [
    "On the ramp the engines drown out voices, so the crew talks with signals and lights.",
    "Every signal has one meaning, agreed before the aircraft moves.",
    "Watch the marshaller: arms crossed overhead means stop, and everybody stops."
   ],
   "check": {
    "q": "Why do ramp crews use hand signals instead of shouting?",
    "options": [
     "Engines are too loud for voices",
     "Shouting is against the dress code",
     "Signals are quicker to learn"
    ],
    "answer": 0,
    "why": "Noise makes speech unreliable, so an agreed set of signals keeps everyone safe."
   }
  }
 ],
 "gated": [
  {
   "id": "jf-gate-night-pump-run",
   "kind": "quest",
   "world": "parishes",
   "title": "Night Storm Pump Run",
   "site": "jf-pump-station",
   "siteName": "Drainage Pumping Station",
   "gate": {
    "stations": [
     "lift-station",
     "ut-night-storm-response-crew-and-portable-generator"
    ],
    "note": "Lift station duties and the night storm response before a pump run in the dark."
   },
   "summary": "Run the drainage pumping station through a night storm with the crew.",
   "parish": "jefferson"
  },
  {
   "id": "jf-gate-causeway-closure",
   "kind": "quest",
   "world": "parishes",
   "title": "Causeway Lane Closure at Dawn",
   "site": "jf-causeway-yard",
   "siteName": "Causeway Maintenance Yard",
   "gate": {
    "stations": [
     "traffic-incident-management",
     "deck-joint-replacement"
    ],
    "note": "Traffic control and a deck joint replacement before you set a closure on the causeway."
   },
   "summary": "Set a lane closure on the causeway and replace a deck joint with the crew.",
   "parish": "jefferson"
  }
 ],
 "scale": 8,
 "blurb": "The parish around the city on both banks: the lakefront at Bucktown and the causeway yard, the airport ramp at Kenner, the pump stations on the drainage canals, the river bridge and the freight yards at Elmwood, and the West Bank's canal shipyards at Harvey and the landing at Gretna."
};
