// Plaquemines Parish — a parish data module on the shared parish schema (crescent brief, console DELTA).
// Pure data: no three.js, no DOM, no imports. Real places are named only by their public names as places;
// every coordinate is approximate (three decimals, `approximate: true`) and exists only to place a map.
// Positions are scene metres on a 4096 m square (x east, +z south), one map metre = 20 m on the ground;
// the anchors fit np-geo.js's affine. Water with a `width` is a ribbon along its points, without one a polygon.
// Validated by tools/check_parish_data.mjs. Field lessons follow RW_FIELD_LESSONS; gated items the gate contract.
export const NP_PLAQUEMINES = {
 "id": "plaquemines",
 "name": "Plaquemines Parish",
 "size": 4096,
 "anchors": [
  {
   "xz": [
    -1515,
    -1576
   ],
   "lonlat": [
    -89.993,
    29.855
   ],
   "approximate": true,
   "name": "Belle Chasse"
  },
  {
   "xz": [
    -1539,
    -1648
   ],
   "lonlat": [
    -89.998,
    29.868
   ],
   "approximate": true,
   "name": "the Belle Chasse tunnel and bridge"
  },
  {
   "xz": [
    -1210,
    -1520
   ],
   "lonlat": [
    -89.93,
    29.845
   ],
   "approximate": true,
   "name": "Scarsdale and Braithwaite"
  },
  {
   "xz": [
    -1307,
    -387
   ],
   "lonlat": [
    -89.95,
    29.64
   ],
   "approximate": true,
   "name": "Myrtle Grove"
  },
  {
   "xz": [
    -557,
    -17
   ],
   "lonlat": [
    -89.795,
    29.573
   ],
   "approximate": true,
   "name": "Pointe à la Hache"
  },
  {
   "xz": [
    -48,
    498
   ],
   "lonlat": [
    -89.69,
    29.48
   ],
   "approximate": true,
   "name": "Port Sulphur"
  },
  {
   "xz": [
    387,
    1023
   ],
   "lonlat": [
    -89.6,
    29.385
   ],
   "approximate": true,
   "name": "Empire"
  },
  {
   "xz": [
    726,
    1216
   ],
   "lonlat": [
    -89.53,
    29.35
   ],
   "approximate": true,
   "name": "Buras"
  },
  {
   "xz": [
    1089,
    1178
   ],
   "lonlat": [
    -89.455,
    29.357
   ],
   "approximate": true,
   "name": "Fort Jackson"
  },
  {
   "xz": [
    1573,
    1620
   ],
   "lonlat": [
    -89.355,
    29.277
   ],
   "approximate": true,
   "name": "Venice"
  }
 ],
 "water": [
  {
   "id": "mississippi-river",
   "kind": "river",
   "poly": [
    [
     -1549,
     -1769
    ],
    [
     -1428,
     -1714
    ],
    [
     -1307,
     -1659
    ],
    [
     -1210,
     -1548
    ],
    [
     -1234,
     -1382
    ],
    [
     -1355,
     -1161
    ],
    [
     -1355,
     -940
    ],
    [
     -1210,
     -719
    ],
    [
     -1065,
     -442
    ],
    [
     -823,
     -166
    ],
    [
     -581,
     0
    ],
    [
     -290,
     221
    ],
    [
     -48,
     498
    ],
    [
     194,
     774
    ],
    [
     387,
     995
    ],
    [
     629,
     1161
    ],
    [
     968,
     1272
    ],
    [
     1355,
     1493
    ],
    [
     1598,
     1659
    ],
    [
     1840,
     1935
    ],
    [
     2033,
     2048
    ]
   ],
   "width": 40
  },
  {
   "id": "intracoastal-waterway",
   "kind": "canal",
   "poly": [
    [
     -2033,
     -1714
    ],
    [
     -1743,
     -1670
    ],
    [
     -1539,
     -1648
    ],
    [
     -1355,
     -1670
    ]
   ],
   "width": 8
  },
  {
   "id": "west-marsh",
   "kind": "wetland",
   "poly": [
    [
     -2033,
     -1603
    ],
    [
     -1598,
     -1603
    ],
    [
     -1380,
     -1050
    ],
    [
     -1259,
     -498
    ],
    [
     -968,
     -55
    ],
    [
     -581,
     332
    ],
    [
     -194,
     774
    ],
    [
     97,
     1161
    ],
    [
     339,
     1382
    ],
    [
     -97,
     1050
    ],
    [
     -1065,
     276
    ],
    [
     -2033,
     -276
    ]
   ]
  },
  {
   "id": "barataria-bay",
   "kind": "gulf",
   "poly": [
    [
     -2033,
     -276
    ],
    [
     -1065,
     276
    ],
    [
     -97,
     1050
    ],
    [
     339,
     1382
    ],
    [
     581,
     1769
    ],
    [
     581,
     2046
    ],
    [
     -2033,
     2046
    ]
   ]
  },
  {
   "id": "east-marsh",
   "kind": "wetland",
   "poly": [
    [
     -1089,
     -1548
    ],
    [
     -1113,
     -1272
    ],
    [
     -1162,
     -829
    ],
    [
     -968,
     -387
    ],
    [
     -726,
     -111
    ],
    [
     -436,
     111
    ],
    [
     -194,
     332
    ],
    [
     48,
     608
    ],
    [
     290,
     885
    ],
    [
     484,
     1106
    ],
    [
     775,
     1244
    ],
    [
     1113,
     1382
    ],
    [
     1452,
     1603
    ],
    [
     1694,
     1161
    ],
    [
     1113,
     719
    ],
    [
     629,
     276
    ],
    [
     145,
     -276
    ],
    [
     -194,
     -719
    ],
    [
     -484,
     -1272
    ],
    [
     -823,
     -1603
    ]
   ]
  },
  {
   "id": "breton-sound",
   "kind": "gulf",
   "poly": [
    [
     -387,
     -2046
    ],
    [
     2048,
     -2046
    ],
    [
     2048,
     2046
    ],
    [
     1840,
     2046
    ],
    [
     1743,
     1769
    ],
    [
     1646,
     1493
    ],
    [
     1694,
     1161
    ],
    [
     1113,
     719
    ],
    [
     629,
     276
    ],
    [
     145,
     -276
    ],
    [
     -194,
     -719
    ],
    [
     -387,
     -1272
    ]
   ]
  },
  {
   "id": "empire-waterway",
   "kind": "canal",
   "poly": [
    [
     363,
     968
    ],
    [
     329,
     1106
    ],
    [
     290,
     1272
    ]
   ],
   "width": 5
  },
  {
   "id": "the-passes",
   "kind": "wetland",
   "poly": [
    [
     1355,
     1327
    ],
    [
     2048,
     1327
    ],
    [
     2048,
     2046
    ],
    [
     1355,
     2046
    ]
   ]
  }
 ],
 "levees": [
  {
   "id": "west-bank-river-levee",
   "pts": [
    [
     -1568,
     -1728
    ],
    [
     -1447,
     -1673
    ],
    [
     -1335,
     -1622
    ],
    [
     -1259,
     -1535
    ],
    [
     -1277,
     -1398
    ],
    [
     -1400,
     -1173
    ],
    [
     -1400,
     -925
    ],
    [
     -1249,
     -696
    ],
    [
     -1102,
     -416
    ],
    [
     -854,
     -133
    ],
    [
     -607,
     36
    ],
    [
     -321,
     254
    ],
    [
     -82,
     528
    ],
    [
     160,
     804
    ],
    [
     357,
     1029
    ],
    [
     609,
     1202
    ],
    [
     949,
     1313
    ],
    [
     1331,
     1531
    ]
   ],
   "height": 6
  },
  {
   "id": "east-bank-river-levee",
   "pts": [
    [
     -1279,
     -1696
    ],
    [
     -1161,
     -1561
    ],
    [
     -1191,
     -1366
    ],
    [
     -1310,
     -1149
    ],
    [
     -1310,
     -955
    ],
    [
     -1171,
     -742
    ],
    [
     -1028,
     -468
    ],
    [
     -792,
     -199
    ],
    [
     -555,
     -36
    ],
    [
     -259,
     188
    ],
    [
     -14,
     468
    ],
    [
     228,
     744
    ],
    [
     417,
     961
    ],
    [
     649,
     1120
    ],
    [
     987,
     1231
    ]
   ],
   "height": 6
  },
  {
   "id": "west-back-levee",
   "pts": [
    [
     -1598,
     -1603
    ],
    [
     -1380,
     -1050
    ],
    [
     -1259,
     -498
    ],
    [
     -968,
     -55
    ],
    [
     -581,
     332
    ],
    [
     -194,
     774
    ],
    [
     97,
     1161
    ],
    [
     339,
     1382
    ]
   ],
   "height": 5
  }
 ],
 "roads": [
  {
   "id": "the-last-road",
   "kind": "riverroad",
   "pts": [
    [
     -1581,
     -1698
    ],
    [
     -1460,
     -1643
    ],
    [
     -1355,
     -1595
    ],
    [
     -1294,
     -1526
    ],
    [
     -1309,
     -1410
    ],
    [
     -1432,
     -1182
    ],
    [
     -1433,
     -914
    ],
    [
     -1278,
     -680
    ],
    [
     -1129,
     -397
    ],
    [
     -876,
     -108
    ],
    [
     -627,
     63
    ],
    [
     -344,
     278
    ],
    [
     -107,
     549
    ],
    [
     135,
     825
    ],
    [
     335,
     1054
    ],
    [
     595,
     1232
    ],
    [
     935,
     1343
    ],
    [
     1314,
     1559
    ],
    [
     1549,
     1686
    ]
   ]
  },
  {
   "id": "east-bank-river-road",
   "kind": "riverroad",
   "pts": [
    [
     -1126,
     -1570
    ],
    [
     -1159,
     -1354
    ],
    [
     -1278,
     -1140
    ],
    [
     -1277,
     -966
    ],
    [
     -1142,
     -758
    ],
    [
     -1001,
     -487
    ],
    [
     -770,
     -224
    ],
    [
     -535,
     -63
    ],
    [
     -236,
     164
    ],
    [
     11,
     447
    ]
   ]
  },
  {
   "id": "belle-chasse-tunnel-bridge",
   "kind": "bridge",
   "pts": [
    [
     -1539,
     -1714
    ],
    [
     -1539,
     -1648
    ],
    [
     -1530,
     -1581
    ]
   ]
  },
  {
   "id": "belle-chasse-ferry",
   "kind": "ferry",
   "pts": [
    [
     -1297,
     -1559
    ],
    [
     -1123,
     -1537
    ]
   ]
  },
  {
   "id": "pointe-a-la-hache-ferry",
   "kind": "ferry",
   "pts": [
    [
     -627,
     63
    ],
    [
     -535,
     -63
    ]
   ]
  },
  {
   "id": "woodland-highway",
   "kind": "avenue",
   "pts": [
    [
     -1477,
     -1592
    ],
    [
     -1560,
     -1655
    ],
    [
     -1650,
     -1690
    ]
   ]
  },
  {
   "id": "venice-marina-road",
   "kind": "street",
   "pts": [
    [
     1549,
     1686
    ],
    [
     1539,
     1725
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "belle-chasse",
   "name": "Belle Chasse",
   "poly": [
    [
     -1646,
     -1714
    ],
    [
     -1355,
     -1714
    ],
    [
     -1331,
     -1437
    ],
    [
     -1598,
     -1437
    ]
   ],
   "character": "suburb"
  },
  {
   "id": "scarsdale-braithwaite",
   "name": "Scarsdale and Braithwaite",
   "poly": [
    [
     -1234,
     -1603
    ],
    [
     -1065,
     -1603
    ],
    [
     -1089,
     -1382
    ],
    [
     -1210,
     -1382
    ]
   ],
   "character": "suburb"
  },
  {
   "id": "refinery-bend",
   "name": "The refinery bend",
   "poly": [
    [
     -1501,
     -829
    ],
    [
     -1331,
     -829
    ],
    [
     -1307,
     -608
    ],
    [
     -1477,
     -608
    ]
   ],
   "character": "refinery"
  },
  {
   "id": "myrtle-grove",
   "name": "Myrtle Grove",
   "poly": [
    [
     -1452,
     -608
    ],
    [
     -1162,
     -608
    ],
    [
     -1065,
     -166
    ],
    [
     -1355,
     -166
    ]
   ],
   "character": "wetland"
  },
  {
   "id": "port-sulphur",
   "name": "Port Sulphur",
   "poly": [
    [
     -194,
     387
    ],
    [
     0,
     387
    ],
    [
     48,
     581
    ],
    [
     -145,
     581
    ]
   ],
   "character": "port"
  },
  {
   "id": "empire-buras",
   "name": "Empire and Buras",
   "poly": [
    [
     290,
     940
    ],
    [
     775,
     1106
    ],
    [
     775,
     1299
    ],
    [
     290,
     1133
    ]
   ],
   "character": "suburb"
  },
  {
   "id": "venice",
   "name": "Venice",
   "poly": [
    [
     1452,
     1493
    ],
    [
     1694,
     1493
    ],
    [
     1694,
     1742
    ],
    [
     1452,
     1742
    ]
   ],
   "character": "port"
  },
  {
   "id": "the-birdfoot",
   "name": "The birdfoot delta",
   "poly": [
    [
     1355,
     1327
    ],
    [
     2048,
     1327
    ],
    [
     2048,
     2046
    ],
    [
     1355,
     2046
    ]
   ],
   "character": "wetland"
  },
  {
   "id": "west-bank-marsh",
   "name": "the West Bank marsh",
   "poly": [
    [
     -2033,
     -1603
    ],
    [
     -1598,
     -1603
    ],
    [
     -1380,
     -1050
    ],
    [
     -1259,
     -498
    ],
    [
     -968,
     -55
    ],
    [
     -581,
     332
    ],
    [
     -194,
     774
    ],
    [
     97,
     1161
    ],
    [
     339,
     1382
    ],
    [
     -97,
     1050
    ],
    [
     -1065,
     276
    ],
    [
     -2033,
     -276
    ]
   ],
   "character": "wetland"
  },
  {
   "id": "east-bank-marsh",
   "name": "the East Bank marsh",
   "poly": [
    [
     -1089,
     -1548
    ],
    [
     -1113,
     -1272
    ],
    [
     -1162,
     -829
    ],
    [
     -968,
     -387
    ],
    [
     -726,
     -111
    ],
    [
     -436,
     111
    ],
    [
     -194,
     332
    ],
    [
     48,
     608
    ],
    [
     290,
     885
    ],
    [
     484,
     1106
    ],
    [
     775,
     1244
    ],
    [
     1113,
     1382
    ],
    [
     1452,
     1603
    ],
    [
     1694,
     1161
    ],
    [
     1113,
     719
    ],
    [
     629,
     276
    ],
    [
     145,
     -276
    ],
    [
     -194,
     -719
    ],
    [
     -484,
     -1272
    ],
    [
     -823,
     -1603
    ]
   ],
   "character": "wetland"
  }
 ],
 "sites": [
  {
   "id": "pq-intracoastal-lock",
   "name": "Intracoastal Lock & Tunnel Crew",
   "kind": "lock",
   "position": [
    -1450,
    -1640
   ],
   "trades": [
    "iuoe",
    "ibew",
    "liuna"
   ],
   "programmes": [
    "heavy-equipment-operators",
    "confined-space"
   ],
   "stations": [
    "mooring-line",
    "mw-workboat-towing-and-line-handling",
    "motor-control-center",
    "cs-ventilation-and-air-monitoring-plan"
   ]
  },
  {
   "id": "pq-belle-chasse-ferry",
   "name": "Belle Chasse Ferry Landing",
   "kind": "ferry",
   "position": [
    -1307,
    -1559
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
    "mooring-line",
    "br-vhf-and-navigation-in-a-work-zone"
   ]
  },
  {
   "id": "pq-river-road-levee",
   "name": "River Road Levee District Crew",
   "kind": "levee",
   "position": [
    -1283,
    -995
   ],
   "trades": [
    "liuna",
    "iuoe",
    "uwua"
   ],
   "programmes": [
    "heavy-equipment-operators",
    "water-and-gas-utility-crews"
   ],
   "stations": [
    "br-levee-inspection-and-seepage",
    "op-dozer-slope-work-and-rollover-protection",
    "op-grader-fine-grade-and-crown",
    "ut-night-storm-response-crew-and-portable-generator"
   ]
  },
  {
   "id": "pq-myrtle-grove-diversion",
   "name": "Sediment Diversion & Marsh Creation",
   "kind": "wetland",
   "position": [
    -1307,
    -387
   ],
   "trades": [
    "iuoe",
    "liuna",
    "carpenters"
   ],
   "programmes": [
    "marine-ecology-and-restoration",
    "hunters-point-bay-restoration"
   ],
   "stations": [
    "br-tidal-marsh-grading-amphibious-excavator",
    "dredge-barge",
    "br-dredge-material-screening-and-disposal-decision",
    "marsh-transect-survey",
    "br-marine-mammal-observer-during-pile-driving"
   ]
  },
  {
   "id": "pq-pointe-a-la-hache-ferry",
   "name": "Pointe à la Hache Ferry",
   "kind": "ferry",
   "position": [
    -534,
    -65
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
    "br-cold-water-immersion-and-mob-recovery"
   ]
  },
  {
   "id": "pq-port-sulphur-terminal",
   "name": "River Terminal at Port Sulphur",
   "kind": "port",
   "position": [
    -107,
    498
   ],
   "trades": [
    "ila",
    "iuoe",
    "meba"
   ],
   "programmes": [
    "port-operations"
   ],
   "stations": [
    "mooring-line",
    "bunkering-watch",
    "mw-oil-transfer-watch-and-boom",
    "hazmat-container-inspection",
    "pt-dock-fender-and-bollard-inspection"
   ]
  },
  {
   "id": "pq-empire-harbour",
   "name": "Empire Shrimp & Oyster Harbour",
   "kind": "harbour",
   "position": [
    358,
    1050
   ],
   "trades": [
    "ibu",
    "siu"
   ],
   "programmes": [
    "marine-ecology-and-restoration",
    "yacht-and-charter-crew"
   ],
   "stations": [
    "me-oyster-reef-monitoring-and-settlement-tiles",
    "oyster-reef-monitoring",
    "yc-fuel-dock-transfer-and-spill-kit",
    "spill-boom-deploy",
    "br-derelict-vessel-salvage-rigging"
   ]
  },
  {
   "id": "pq-buras-substation",
   "name": "Buras Substation & Line Crew",
   "kind": "substation",
   "position": [
    716,
    1238
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
    "transformer-vault",
    "ut-night-storm-response-crew-and-portable-generator"
   ]
  },
  {
   "id": "pq-fort-jackson",
   "name": "Fort Jackson Historic Site",
   "kind": "park",
   "position": [
    1089,
    1178
   ],
   "trades": [
    "afscme"
   ],
   "programmes": [
    "k12-history-and-civics"
   ],
   "stations": [
    "k12-primary-and-secondary-sources",
    "k12-map-literacy-across-eras",
    "k12-building-a-timeline-from-documents",
    "gk-string-trimmer-and-blower-ppe-and-bystander-zone"
   ]
  },
  {
   "id": "pq-venice-marina",
   "name": "Venice Marina at the End of the Road",
   "kind": "marina",
   "position": [
    1549,
    1686
   ],
   "trades": [
    "ibu",
    "siu",
    "meba",
    "mmp"
   ],
   "programmes": [
    "yacht-and-charter-crew",
    "commercial-diving-and-scientific-scuba"
   ],
   "stations": [
    "yc-pre-departure-safety-briefing-and-guest-count",
    "yc-man-overboard-recovery-drill",
    "yc-line-handling-and-docking-in-crosswind",
    "cd-rov-launch-recovery-and-tether-management",
    "me-water-column-sampling-from-a-small-boat"
   ]
  },
  {
   "id": "pq-pipeline-yard",
   "name": "Pipeline & Marine Fabrication Yard",
   "kind": "shipyard",
   "position": [
    121,
    785
   ],
   "trades": [
    "ibb",
    "ua",
    "ironworkers",
    "iupat"
   ],
   "programmes": [
    "insulators-and-boilermakers",
    "plumbers-and-pipefitters"
   ],
   "stations": [
    "shipyard-hotwork",
    "uw-pipeline-crossing-inspection-dive",
    "pl-natural-gas-pressure-test-and-leak-check",
    "tank-lining",
    "ut-cathodic-protection-test-station-reading"
   ]
  },
  {
   "id": "pq-belle-chasse-fire",
   "name": "Belle Chasse Fire & EMS",
   "kind": "fire-station",
   "position": [
    -1501,
    -1520
   ],
   "trades": [
    "iaff",
    "nage"
   ],
   "programmes": [
    "first-responders"
   ],
   "stations": [
    "structure-fire-sizeup",
    "ambulance-scene-safety",
    "ev-extrication",
    "shelter-intake-operations"
   ]
  }
 ],
 "landmarks": [
  {
   "id": "belle-chasse-tunnel",
   "name": "Belle Chasse tunnel and bridge",
   "position": [
    -1539,
    -1600
   ],
   "kind": "bridge"
  },
  {
   "id": "english-turn",
   "name": "English Turn bend",
   "position": [
    -1234,
    -1714
   ],
   "kind": "river"
  },
  {
   "id": "myrtle-grove-marina",
   "name": "Myrtle Grove marina",
   "position": [
    -1317,
    -376
   ],
   "kind": "marina"
  },
  {
   "id": "pointe-a-la-hache-landing",
   "name": "Pointe à la Hache ferry landing",
   "position": [
    -516,
    -79
   ],
   "kind": "ferry"
  },
  {
   "id": "fort-jackson",
   "name": "Fort Jackson",
   "position": [
    1089,
    1178
   ],
   "kind": "fort"
  },
  {
   "id": "venice-road-end",
   "name": "The end of the road at Venice",
   "position": [
    1539,
    1725
   ],
   "kind": "road"
  },
  {
   "id": "empire-waterway",
   "name": "Empire waterway to the gulf",
   "position": [
    329,
    1106
   ],
   "kind": "canal"
  },
  {
   "id": "breton-sound-shore",
   "name": "Breton Sound shore",
   "position": [
    387,
    -166
   ],
   "kind": "shore"
  },
  {
   "id": "barataria-bay-shore",
   "name": "Barataria Bay shore",
   "position": [
    -823,
    940
   ],
   "kind": "shore"
  }
 ],
 "connectors": [
  {
   "id": "pq-belle-chasse-highway",
   "kind": "road",
   "from": {
    "parish": "plaquemines",
    "position": [
     -1646,
     -1742
    ]
   },
   "to": {
    "parish": "jefferson",
    "position": [
     1446,
     2004
    ]
   },
   "name": "Belle Chasse Highway at the Jefferson line",
   "lonlat": [
    -90.02,
    29.885
   ],
   "approximate": true
  },
  {
   "id": "pq-river-road-st-bernard",
   "kind": "road",
   "from": {
    "parish": "plaquemines",
    "position": [
     -1089,
     -1576
    ]
   },
   "to": {
    "parish": "st-bernard",
    "position": [
     -724,
     898
    ]
   },
   "name": "The east bank river road at Caernarvon",
   "lonlat": [
    -89.905,
    29.855
   ],
   "approximate": true
  },
  {
   "id": "pq-pointe-a-la-hache-crossing",
   "kind": "ferry",
   "from": {
    "parish": "plaquemines",
    "position": [
     -557,
     -17
    ]
   },
   "to": {
    "parish": "plaquemines",
    "position": [
     -1057,
     -517
    ]
   },
   "name": "Pointe à la Hache ferry across the river",
   "lonlat": [
    -89.847,
    29.618
   ],
   "approximate": true
  }
 ],
 "fieldLessons": [
  {
   "id": "pq-fl-chart-scale-at-the-end-of-the-road",
   "title": "A chart's scale bar at the end of the road",
   "site": "pq-venice-marina",
   "landmark": "venice-road-end",
   "k12": "k12-reading-a-map-scale-in-bay-world",
   "trade": "Crew boat captains and deckhands",
   "tradeLine": "A crew boat's mate reads the run to a platform off the chart's scale bar before quoting a departure time.",
   "minutes": 3,
   "steps": [
    "The road down the river ends here; from here everything moves by water.",
    "On the chart, a scale bar turns a finger's width into a real distance across the bay.",
    "Measure the run from the marina to the marker buoy and say it in bar lengths."
   ],
   "check": {
    "q": "What does a chart's scale bar do?",
    "options": [
     "Turns a map distance into a real one",
     "Shows the depth of the water",
     "Lists the boat's fuel"
    ],
    "answer": 0,
    "why": "A scale bar is the ruler that links the paper to the water."
   }
  },
  {
   "id": "pq-fl-where-a-river-drops-its-soil",
   "title": "Where a river drops its soil",
   "site": "pq-myrtle-grove-diversion",
   "landmark": "myrtle-grove-marina",
   "k12": "k12-water-cycle-and-filtration",
   "trade": "Marsh restoration operators",
   "tradeLine": "An amphibious excavator operator builds marsh from the mud the river carries, the way the delta itself was built.",
   "minutes": 3,
   "steps": [
    "A river carries fine soil in its water and drops it where the water slows.",
    "Where levees keep the river in, that soil goes to the gulf instead of the marsh.",
    "A diversion lets river water spread and drop its soil; look for the new marsh edge."
   ],
   "check": {
    "q": "Where does a river drop the soil it carries?",
    "options": [
     "Where its water slows and spreads",
     "Where it flows fastest",
     "It never drops any"
    ],
    "answer": 0,
    "why": "Slower water cannot hold the soil, so it settles out and builds land."
   }
  },
  {
   "id": "pq-fl-a-timeline-with-gaps",
   "title": "A timeline shows its gaps",
   "site": "pq-fort-jackson",
   "landmark": "fort-jackson",
   "k12": "k12-building-a-timeline-from-documents",
   "trade": "Historic-site interpreters",
   "tradeLine": "A site interpreter builds the fort's story as a timeline from dated documents and says where the gaps are.",
   "minutes": 2,
   "steps": [
    "A timeline puts events in the order they happened, spaced by the time between them.",
    "Each event needs a source that gives it a date.",
    "Where there is no dated source, the timeline shows a gap, not a guess."
   ],
   "check": {
    "q": "What goes in a timeline where no dated source exists?",
    "options": [
     "A gap",
     "A best guess",
     "The most exciting story"
    ],
    "answer": 0,
    "why": "A timeline only carries what a source can date."
   }
  }
 ],
 "gated": [
  {
   "id": "pq-gate-transfer-watch",
   "kind": "quest",
   "world": "parishes",
   "title": "Oil Transfer Watch at the River Terminal",
   "site": "pq-port-sulphur-terminal",
   "siteName": "River Terminal at Port Sulphur",
   "gate": {
    "stations": [
     "bunkering-watch",
     "mw-oil-transfer-watch-and-boom"
    ],
    "note": "The bunkering watch and the transfer watch before you take the person-in-charge role."
   },
   "summary": "Stand the person-in-charge watch for a transfer at the river terminal.",
   "parish": "plaquemines"
  },
  {
   "id": "pq-gate-storm-line-restoration",
   "kind": "quest",
   "world": "parishes",
   "title": "Storm Line Restoration Down the Road",
   "site": "pq-buras-substation",
   "siteName": "Buras Substation & Line Crew",
   "gate": {
    "stations": [
     "line-truck",
     "substation-switching"
    ],
    "programmes": [
     {
      "id": "electrical-first-period",
      "minStars": 1
     }
    ],
    "note": "The line truck and substation switching before a storm restoration run."
   },
   "summary": "Restore the line down the last road after a storm with the crew.",
   "parish": "plaquemines"
  }
 ],
 "scale": 20,
 "blurb": "The long parish along the river to the Gulf: the lock and the ferry at Belle Chasse, the river road on both banks, the diversion at Myrtle Grove, the ferry at Pointe à la Hache, the terminal at Port Sulphur, the harbour at Empire, the substation at Buras, the fort park and the marina at Venice."
};
