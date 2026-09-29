// The Garden District & Uptown — one 4096 m streamed New Orleans neighbourhood district on the shared parish schema
// (docs/parishes.md "Districts inside a parish", docs/consoles/NOLA-DISTRICTS.md), region "new-orleans-districts",
// `parent: "orleans"`: a near-true-scale child of the Orleans map (the "zoom in"), walked into from the parent at the
// matching place and back out; its field may overlap only its parent, never a sibling district.
//
// Facts rule: real places appear only by their public names, as places (a neighbourhood, a street, a square, a park, the
// river, a canal); no history, dates, statistics, addresses, business names or heights of real places. Coordinates are
// approximate (three decimals, `approximate: true`) and exist only to place a map. The project and site layouts are
// illustrative (PROCEDURAL): the crews and site names are training places, not real businesses; the parish, the
// waterways and the neighbourhoods are real.
// Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).
//
// Written once by tools/gen_nd_districts.mjs from approximate lon/lat; edit the numbers here directly. Pure: no
// three.js, no DOM. Every top-level name is prefixed np/NP_ (the bundler concatenates all modules into one scope).

export const NP_NOLA_UPTOWN_GARDEN = {
 "id": "nola-uptown-garden",
 "name": "The Garden District & Uptown",
 "region": "new-orleans-districts",
 "parent": "orleans",
 "size": 4096,
 "scale": 0.9,
 "blurb": "The river's crescent above the CBD on foot: the Garden District's houses and live oaks, the St. Charles Avenue streetcar, Magazine Street's shops, Uptown's shotgun rows and the wharves along the bend. The site layouts are illustrative; the streets, the river and the neighbourhoods are real.",
 "start": "nup-st-charles-streetcar-track",
 "anchors": [
  {
   "xz": [
    1554,
    -25
   ],
   "lonlat": [
    -90.085,
    29.929
   ],
   "approximate": true,
   "name": "Lafayette Cemetery"
  },
  {
   "xz": [
    -375,
    470
   ],
   "lonlat": [
    -90.103,
    29.925
   ],
   "approximate": true,
   "name": "the corner of St. Charles and Napoleon"
  },
  {
   "xz": [
    590,
    346
   ],
   "lonlat": [
    -90.094,
    29.926
   ],
   "approximate": true,
   "name": "the corner of St. Charles and Louisiana"
  },
  {
   "xz": [
    -1983,
    -891
   ],
   "lonlat": [
    -90.118,
    29.936
   ],
   "approximate": true,
   "name": "Loyola and Tulane on St. Charles"
  },
  {
   "xz": [
    1983,
    223
   ],
   "lonlat": [
    -90.081,
    29.927
   ],
   "approximate": true,
   "name": "the corner of Magazine and Jackson"
  },
  {
   "xz": [
    -482,
    1460
   ],
   "lonlat": [
    -90.104,
    29.917
   ],
   "approximate": true,
   "name": "the Napoleon Avenue wharf"
  },
  {
   "xz": [
    -161,
    -1138
   ],
   "lonlat": [
    -90.101,
    29.938
   ],
   "approximate": true,
   "name": "the corner of Claiborne and Napoleon"
  }
 ],
 "water": [
  {
   "id": "mississippi-river",
   "name": "the Mississippi River",
   "kind": "river",
   "width": 689,
   "poly": [
    [
     -53,
     2028
    ],
    [
     95,
     1982
    ],
    [
     244,
     1936
    ],
    [
     393,
     1890
    ],
    [
     540,
     1841
    ],
    [
     685,
     1787
    ],
    [
     830,
     1732
    ],
    [
     975,
     1678
    ],
    [
     1120,
     1623
    ],
    [
     1264,
     1569
    ],
    [
     1409,
     1514
    ],
    [
     1554,
     1460
    ],
    [
     1694,
     1395
    ],
    [
     1834,
     1331
    ],
    [
     1973,
     1266
    ],
    [
     2008,
     1250
    ]
   ]
  },
  {
   "id": "uptown-batture",
   "name": "the river's batture below the Uptown levee",
   "kind": "wetland",
   "poly": [
    [
     -162,
     1678
    ],
    [
     -14,
     1631
    ],
    [
     136,
     1585
    ],
    [
     281,
     1541
    ],
    [
     418,
     1495
    ],
    [
     556,
     1443
    ],
    [
     701,
     1388
    ],
    [
     846,
     1334
    ],
    [
     990,
     1280
    ],
    [
     1134,
     1226
    ],
    [
     1280,
     1170
    ],
    [
     1413,
     1121
    ],
    [
     1540,
     1062
    ],
    [
     1680,
     998
    ],
    [
     1818,
     933
    ],
    [
     1855,
     916
    ],
    [
     1833,
     866
    ],
    [
     1795,
     883
    ],
    [
     1657,
     948
    ],
    [
     1517,
     1012
    ],
    [
     1391,
     1071
    ],
    [
     1261,
     1119
    ],
    [
     1115,
     1174
    ],
    [
     971,
     1228
    ],
    [
     827,
     1283
    ],
    [
     682,
     1337
    ],
    [
     537,
     1392
    ],
    [
     400,
     1443
    ],
    [
     264,
     1488
    ],
    [
     120,
     1533
    ],
    [
     -30,
     1579
    ],
    [
     -178,
     1625
    ]
   ]
  },
  {
   "id": "bend-batture",
   "name": "the batture at the river bend by the wharves",
   "kind": "wetland",
   "poly": [
    [
     -2037,
     1707
    ],
    [
     -1340,
     1806
    ],
    [
     -1340,
     1707
    ],
    [
     -2037,
     1608
    ]
   ]
  }
 ],
 "levees": [
  {
   "id": "uptown-river-levee",
   "name": "the Uptown river levee",
   "height": 5,
   "pts": [
    [
     -185,
     1604
    ],
    [
     -36,
     1558
    ],
    [
     113,
     1512
    ],
    [
     257,
     1467
    ],
    [
     392,
     1422
    ],
    [
     529,
     1371
    ],
    [
     674,
     1316
    ],
    [
     819,
     1262
    ],
    [
     963,
     1208
    ],
    [
     1107,
     1154
    ],
    [
     1253,
     1098
    ],
    [
     1383,
     1050
    ],
    [
     1508,
     992
    ],
    [
     1648,
     928
    ],
    [
     1786,
     863
    ],
    [
     1823,
     846
    ]
   ]
  },
  {
   "id": "wharf-floodwall",
   "name": "the floodwall behind the wharves",
   "height": 4,
   "pts": [
    [
     -205,
     1540
    ],
    [
     -56,
     1494
    ],
    [
     93,
     1448
    ],
    [
     237,
     1403
    ],
    [
     370,
     1359
    ],
    [
     505,
     1309
    ],
    [
     650,
     1254
    ],
    [
     795,
     1200
    ],
    [
     940,
     1145
    ],
    [
     1084,
     1091
    ],
    [
     1229,
     1036
    ],
    [
     1357,
     988
    ],
    [
     1480,
     931
    ],
    [
     1620,
     867
    ],
    [
     1757,
     803
    ],
    [
     1796,
     785
    ]
   ]
  }
 ],
 "roads": [
  {
   "id": "st-charles-avenue",
   "name": "St. Charles Avenue and its streetcar",
   "kind": "avenue",
   "pts": [
    [
     2010,
     -380
    ],
    [
     1885,
     -287
    ],
    [
     1760,
     -195
    ],
    [
     1635,
     -102
    ],
    [
     1510,
     -9
    ],
    [
     1374,
     67
    ],
    [
     1228,
     128
    ],
    [
     1082,
     189
    ],
    [
     935,
     250
    ],
    [
     789,
     310
    ],
    [
     643,
     371
    ],
    [
     489,
     383
    ],
    [
     334,
     395
    ],
    [
     180,
     407
    ],
    [
     25,
     418
    ],
    [
     -129,
     430
    ],
    [
     -283,
     442
    ],
    [
     -427,
     390
    ],
    [
     -568,
     317
    ],
    [
     -708,
     243
    ],
    [
     -849,
     170
    ],
    [
     -989,
     96
    ],
    [
     -1129,
     23
    ],
    [
     -1270,
     -50
    ],
    [
     -1402,
     -136
    ],
    [
     -1525,
     -233
    ],
    [
     -1648,
     -331
    ],
    [
     -1772,
     -428
    ],
    [
     -1895,
     -526
    ],
    [
     -2019,
     -623
    ]
   ]
  },
  {
   "id": "magazine-street",
   "name": "Magazine Street",
   "kind": "street",
   "pts": [
    [
     2035,
     225
    ],
    [
     1914,
     319
    ],
    [
     1776,
     390
    ],
    [
     1638,
     461
    ],
    [
     1501,
     532
    ],
    [
     1363,
     602
    ],
    [
     1225,
     673
    ],
    [
     1087,
     744
    ],
    [
     941,
     793
    ],
    [
     786,
     820
    ],
    [
     631,
     848
    ],
    [
     476,
     875
    ],
    [
     322,
     903
    ],
    [
     167,
     931
    ],
    [
     12,
     958
    ],
    [
     -143,
     986
    ],
    [
     -298,
     1013
    ],
    [
     -451,
     1005
    ],
    [
     -602,
     962
    ],
    [
     -754,
     918
    ],
    [
     -905,
     874
    ],
    [
     -1056,
     831
    ],
    [
     -1208,
     787
    ],
    [
     -1359,
     743
    ],
    [
     -1511,
     700
    ],
    [
     -1662,
     656
    ],
    [
     -1799,
     577
    ],
    [
     -1936,
     498
    ],
    [
     -2005,
     458
    ]
   ]
  },
  {
   "id": "tchoupitoulas-street",
   "name": "Tchoupitoulas Street",
   "kind": "street",
   "pts": [
    [
     -225,
     1476
    ],
    [
     -76,
     1430
    ],
    [
     73,
     1384
    ],
    [
     216,
     1340
    ],
    [
     348,
     1296
    ],
    [
     482,
     1246
    ],
    [
     627,
     1191
    ],
    [
     772,
     1137
    ],
    [
     916,
     1082
    ],
    [
     1060,
     1028
    ],
    [
     1206,
     973
    ],
    [
     1331,
     927
    ],
    [
     1452,
     870
    ],
    [
     1591,
     806
    ],
    [
     1729,
     742
    ],
    [
     1768,
     724
    ]
   ]
  },
  {
   "id": "napoleon-avenue",
   "name": "Napoleon Avenue",
   "kind": "avenue",
   "pts": [
    [
     -482,
     1398
    ],
    [
     -464,
     1243
    ],
    [
     -446,
     1089
    ],
    [
     -428,
     934
    ],
    [
     -411,
     779
    ],
    [
     -393,
     625
    ],
    [
     -375,
     470
    ],
    [
     -354,
     313
    ],
    [
     -333,
     156
    ],
    [
     -312,
     -1
    ],
    [
     -291,
     -158
    ],
    [
     -271,
     -314
    ],
    [
     -250,
     -471
    ],
    [
     -229,
     -628
    ],
    [
     -208,
     -785
    ],
    [
     -187,
     -942
    ],
    [
     -166,
     -1099
    ],
    [
     -146,
     -1256
    ],
    [
     -127,
     -1414
    ],
    [
     -107,
     -1571
    ],
    [
     -88,
     -1728
    ],
    [
     -69,
     -1886
    ],
    [
     -54,
     -2004
    ]
   ]
  },
  {
   "id": "louisiana-avenue",
   "name": "Louisiana Avenue",
   "kind": "avenue",
   "pts": [
    [
     965,
     1150
    ],
    [
     906,
     1008
    ],
    [
     848,
     867
    ],
    [
     789,
     725
    ],
    [
     731,
     583
    ],
    [
     672,
     442
    ],
    [
     627,
     294
    ],
    [
     594,
     139
    ],
    [
     561,
     -16
    ],
    [
     528,
     -171
    ],
    [
     495,
     -325
    ],
    [
     462,
     -480
    ],
    [
     429,
     -635
    ],
    [
     396,
     -790
    ],
    [
     363,
     -945
    ],
    [
     330,
     -1099
    ],
    [
     322,
     -1138
    ]
   ]
  },
  {
   "id": "jackson-avenue",
   "name": "Jackson Avenue",
   "kind": "avenue",
   "pts": [
    [
     2029,
     -1374
    ],
    [
     1999,
     -1530
    ],
    [
     1968,
     -1686
    ],
    [
     1938,
     -1841
    ],
    [
     1930,
     -1880
    ]
   ]
  },
  {
   "id": "south-claiborne-avenue",
   "name": "South Claiborne Avenue",
   "kind": "avenue",
   "pts": [
    [
     1769,
     -1979
    ],
    [
     1626,
     -1916
    ],
    [
     1483,
     -1854
    ],
    [
     1340,
     -1791
    ],
    [
     1197,
     -1728
    ],
    [
     1054,
     -1666
    ],
    [
     911,
     -1603
    ],
    [
     768,
     -1540
    ],
    [
     626,
     -1478
    ],
    [
     483,
     -1416
    ],
    [
     340,
     -1354
    ],
    [
     196,
     -1293
    ],
    [
     54,
     -1231
    ],
    [
     -89,
     -1169
    ],
    [
     -237,
     -1162
    ],
    [
     -389,
     -1210
    ],
    [
     -541,
     -1258
    ],
    [
     -693,
     -1306
    ],
    [
     -846,
     -1353
    ],
    [
     -998,
     -1401
    ],
    [
     -1150,
     -1449
    ],
    [
     -1302,
     -1497
    ],
    [
     -1445,
     -1565
    ],
    [
     -1584,
     -1639
    ],
    [
     -1723,
     -1713
    ],
    [
     -1863,
     -1787
    ],
    [
     -2002,
     -1861
    ]
   ]
  },
  {
   "id": "prytania-street",
   "name": "Prytania Street",
   "kind": "street",
   "pts": [
    [
     2010,
     -159
    ],
    [
     1903,
     -45
    ],
    [
     1796,
     70
    ],
    [
     1666,
     152
    ],
    [
     1528,
     223
    ],
    [
     1390,
     293
    ],
    [
     1252,
     364
    ],
    [
     1114,
     435
    ],
    [
     976,
     506
    ],
    [
     838,
     576
    ],
    [
     686,
     609
    ],
    [
     529,
     629
    ],
    [
     372,
     648
    ],
    [
     215,
     668
    ],
    [
     57,
     688
    ],
    [
     -100,
     707
    ],
    [
     -257,
     727
    ],
    [
     -375,
     742
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "garden-district",
   "name": "the Garden District",
   "character": "garden",
   "poly": [
    [
     1018,
     -519
    ],
    [
     2037,
     -519
    ],
    [
     2037,
     594
    ],
    [
     1018,
     594
    ]
   ]
  },
  {
   "id": "irish-channel",
   "name": "the Irish Channel",
   "character": "suburb",
   "poly": [
    [
     1018,
     594
    ],
    [
     2037,
     594
    ],
    [
     2037,
     1274
    ],
    [
     1018,
     1274
    ]
   ]
  },
  {
   "id": "uptown",
   "name": "Uptown",
   "character": "garden",
   "poly": [
    [
     -1662,
     -1138
    ],
    [
     1018,
     -1138
    ],
    [
     1018,
     717
    ],
    [
     -1662,
     717
    ]
   ]
  },
  {
   "id": "freret-broadmoor",
   "name": "Freret and the edge of Broadmoor",
   "character": "suburb",
   "poly": [
    [
     -1662,
     -2041
    ],
    [
     1662,
     -2041
    ],
    [
     1662,
     -1138
    ],
    [
     -1662,
     -1138
    ]
   ]
  },
  {
   "id": "uptown-wharves",
   "name": "the Uptown wharves",
   "character": "port",
   "poly": [
    [
     -2047,
     1274
    ],
    [
     1233,
     1274
    ],
    [
     1233,
     2048
    ],
    [
     -2047,
     2048
    ]
   ]
  },
  {
   "id": "universities",
   "name": "the universities on St. Charles",
   "character": "campus",
   "poly": [
    [
     -2047,
     -1633
    ],
    [
     -1662,
     -1633
    ],
    [
     -1662,
     -272
    ],
    [
     -2047,
     -272
    ]
   ]
  }
 ],
 "sites": [
  {
   "id": "nup-shotgun-restoration",
   "name": "an Uptown Shotgun House Restoration",
   "kind": "construction",
   "position": [
    -911,
    -25
   ],
   "trades": [
    "carpenters",
    "iupat",
    "opcmia",
    "bac"
   ],
   "programmes": [
    "builders-trades",
    "cement-masons-and-plasterers",
    "roofers-and-waterproofers"
   ],
   "stations": [
    "scaffold-erection",
    "masonry-silica-scaffold",
    "cm-exterior-plaster-scratch-brown-and-finish-coats",
    "rf-roof-tear-off-and-debris-chute",
    "paint-sprayer"
   ],
   "blurb": "A shotgun house brought back room by room: scaffold on the side alley, old plaster, a lime finish and a new roof."
  },
  {
   "id": "nup-ironwork-restoration",
   "name": "a Garden District Ironwork and Paint Crew",
   "kind": "construction",
   "position": [
    1501,
    223
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
   "blurb": "Cast iron fences and galleries stripped and painted: the sprayer, dust control and the painter's lifeline."
  },
  {
   "id": "nup-streetcar-overhead-wire",
   "name": "the St. Charles Overhead Wire Crew",
   "kind": "streetcar",
   "position": [
    -1662,
    -421
   ],
   "trades": [
    "ibew",
    "atu",
    "twu"
   ],
   "programmes": [
    "transit-ramp",
    "electrical-first-period"
   ],
   "stations": [
    "line-truck",
    "track-access",
    "signal-cabinet",
    "ra-roadway-worker-protection-and-job-briefing"
   ],
   "blurb": "The wire above the streetcar line: the line truck, lookouts on the neutral ground and the signal cabinet."
  },
  {
   "id": "nup-drainage-culvert",
   "name": "a Napoleon Avenue Drainage Culvert Crew",
   "kind": "stormwater",
   "position": [
    -214,
    -396
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
   "blurb": "A big drainage culvert under the avenue's neutral ground: the trench, the manhole's air check and the storm call-out."
  },
  {
   "id": "nup-pumping-station",
   "name": "an Uptown Drainage Pumping Station",
   "kind": "pump",
   "position": [
    107,
    -1509
   ],
   "trades": [
    "iuoe",
    "ibew",
    "uwua",
    "afscme"
   ],
   "programmes": [
    "electrical-first-period",
    "confined-space",
    "water-and-gas-utility-crews"
   ],
   "stations": [
    "lift-station",
    "ut-night-storm-response-crew-and-portable-generator",
    "motor-control-center",
    "cs-permit-entry-and-attendant-duties",
    "valve-vault"
   ],
   "blurb": "A pumping station that lifts the rain out of Uptown's streets: the motor control centre, the permit entry and the storm generator."
  },
  {
   "id": "nup-river-levee-crew",
   "name": "the Uptown River Levee Crew",
   "kind": "levee",
   "position": [
    750,
    1274
   ],
   "trades": [
    "iuoe",
    "liuna",
    "afscme",
    "opcmia"
   ],
   "programmes": [
    "builders-trades",
    "bay-restoration-maritime-underwater",
    "heavy-equipment-operators"
   ],
   "stations": [
    "br-levee-inspection-and-seepage",
    "op-dozer-slope-work-and-rollover-protection",
    "op-compactor-lift-thickness-and-edge",
    "formwork-shoring",
    "concrete-pour"
   ],
   "blurb": "The crew on the river levee: seepage walks, the dozer on the slope and a floodwall pour."
  },
  {
   "id": "nup-magazine-street-kitchen",
   "name": "a Magazine Street Restaurant Kitchen",
   "kind": "hospitality",
   "position": [
    375,
    816
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
   "blurb": "A kitchen on Magazine Street: the line, the hood, the bar well and the grease trap."
  },
  {
   "id": "nup-hospital-campus",
   "name": "an Uptown Hospital Campus",
   "kind": "hospital",
   "position": [
    1018,
    -210
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
   "blurb": "A hospital campus off the avenue: moving patients safely, the crash cart, sterile processing and medical gas."
  },
  {
   "id": "nup-university-facilities",
   "name": "a University Facilities Crew on St. Charles",
   "kind": "campus",
   "position": [
    -1822,
    -1138
   ],
   "trades": [
    "aaup",
    "afscme",
    "seiu",
    "ibew",
    "ua"
   ],
   "programmes": [
    "stationary-engineer",
    "property-management",
    "education-support-staff"
   ],
   "stations": [
    "chiller-plant",
    "pm-fire-alarm-panel-room",
    "ed-science-lab-chemical-storage-and-eyewash",
    "pm-electrical-room"
   ],
   "blurb": "The crews that keep a campus running: the chiller plant, the fire alarm room and the science lab's storage."
  },
  {
   "id": "nup-river-wharf",
   "name": "an Uptown River Wharf Crew",
   "kind": "port",
   "position": [
    -804,
    1212
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
   "blurb": "A wharf on the river bend: lines, gangways, fenders and the forklift lane."
  },
  {
   "id": "nup-live-oak-crew",
   "name": "the St. Charles Live Oak Crew",
   "kind": "park",
   "position": [
    -697,
    322
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
    "gk-string-trimmer-and-blower-ppe-and-bystander-zone"
   ],
   "blurb": "The crew that cares for the avenue's live oaks: the pole saw, the drop zone and storm clean-up with traffic control."
  },
  {
   "id": "nup-school-campus",
   "name": "an Uptown School Campus",
   "kind": "school",
   "position": [
    -1340,
    -952
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
   "blurb": "A school off the avenue: the playground check, the crossing guard's corner and the safety labels in the kitchen."
  },
  {
   "id": "nup-lead-safe-painting",
   "name": "a Lower Garden District Repaint",
   "kind": "construction",
   "position": [
    1822,
    -1323
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
   "blurb": "An old house repainted lead-safe: containment, the sprayer, the scaffold and the lifeline."
  },
  {
   "id": "nup-gas-service",
   "name": "an Uptown House Renovation",
   "kind": "construction",
   "position": [
    697,
    -891
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
   "blurb": "An old house's pipes and water heater renewed: the glovebag on old lagging, the gas pressure test and a guarded hatch."
  },
  {
   "id": "nup-roofing-crew",
   "name": "an Irish Channel Roofing Crew",
   "kind": "construction",
   "position": [
    1447,
    903
   ],
   "trades": [
    "carpenters",
    "iupat",
    "ua"
   ],
   "programmes": [
    "roofers-and-waterproofers",
    "fall-protection"
   ],
   "stations": [
    "rf-roof-tear-off-and-debris-chute",
    "rf-skylight-and-hatch-guarding",
    "leading-edge-and-horizontal-lifeline",
    "scaffold-erection"
   ],
   "blurb": "A roof tear-off on a raised cottage: the debris chute, a guarded skylight and a lifeline."
  },
  {
   "id": "nup-fire-station",
   "name": "an Uptown Fire Station",
   "kind": "fire-station",
   "position": [
    -536,
    -643
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
   "blurb": "A firehouse on the avenue: size-up among old wooden houses, the aerial ladder and rehab after a long call."
  },
  {
   "id": "nup-streetcar-barn-yard",
   "name": "a Streetcar Maintenance Yard",
   "kind": "streetcar",
   "position": [
    -1930,
    -1695
   ],
   "trades": [
    "atu",
    "iam",
    "ibew",
    "twu"
   ],
   "programmes": [
    "transit-ramp",
    "railroad-crafts"
   ],
   "stations": [
    "bus-depot-lift",
    "signal-cabinet",
    "track-access",
    "ra-hand-brake-and-securement-on-a-grade"
   ],
   "blurb": "Where the avenue's cars are kept up: the lift, the signal cabinet and a car secured on the yard track."
  },
  {
   "id": "nup-st-charles-streetcar-track",
   "name": "the St. Charles Streetcar Track Crew",
   "kind": "streetcar",
   "position": [
    375,
    322
   ],
   "trades": [
    "atu",
    "bmwed",
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
    "ra-switch-inspection-and-lubrication",
    "ra-roadway-worker-protection-and-job-briefing"
   ],
   "blurb": "Track work on the neutral ground under the oaks: roadway worker protection, the switch and the crossing signals."
  }
 ],
 "landmarks": [
  {
   "id": "lafayette-cemetery",
   "name": "Lafayette Cemetery",
   "position": [
    1533,
    -12
   ],
   "kind": "place"
  },
  {
   "id": "st-charles-streetcar",
   "name": "a streetcar on St. Charles Avenue",
   "position": [
    54,
    408
   ],
   "kind": "place",
   "lm": "streetcar"
  },
  {
   "id": "garden-district-houses",
   "name": "the Garden District's houses",
   "position": [
    1340,
    408
   ],
   "kind": "neighbourhood",
   "lm": "victorian-house"
  },
  {
   "id": "uptown-shotgun-row",
   "name": "a row of Uptown shotgun houses",
   "position": [
    -697,
    -148
   ],
   "kind": "neighbourhood",
   "lm": "shotgun-row"
  },
  {
   "id": "napoleon-wharf",
   "name": "the wharves on the river bend",
   "position": [
    -536,
    1274
   ],
   "kind": "riverfront",
   "lm": "wharf-pier-shed"
  },
  {
   "id": "university-towers",
   "name": "the universities on St. Charles",
   "position": [
    -1876,
    -829
   ],
   "kind": "campus",
   "lm": "campanile"
  },
  {
   "id": "uptown-levee",
   "name": "the Uptown river levee",
   "position": [
    375,
    1336
   ],
   "kind": "levee"
  },
  {
   "id": "nup-sign",
   "name": "a sign: the site layouts are illustrative; the streets, the river and the neighbourhoods are real",
   "position": [
    214,
    161
   ],
   "kind": "sign"
  }
 ],
 "connectors": [
  {
   "id": "nd-up-fq-st-charles",
   "kind": "road",
   "name": "St. Charles Avenue down to the CBD and the French Quarter",
   "from": {
    "parish": "nola-uptown-garden",
    "position": [
     1983,
     -1138
    ]
   },
   "to": {
    "parish": "nola-french-quarter-cbd",
    "position": [
     -334,
     1862
    ],
    "lonlat": [
     -90.076,
     29.944
    ]
   },
   "lonlat": [
    -90.076,
    29.944
   ],
   "approximate": true
  },
  {
   "id": "nd-up-orleans-st-charles",
   "kind": "road",
   "name": "St. Charles Avenue out to the whole of New Orleans",
   "from": {
    "parish": "nola-uptown-garden",
    "position": [
     -1126,
     37
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     -1624,
     1509
    ],
    "lonlat": [
     -90.11,
     29.9285
    ]
   },
   "lonlat": [
    -90.11,
    29.9285
   ],
   "approximate": true
  },
  {
   "id": "nd-up-orleans-claiborne",
   "kind": "road",
   "name": "South Claiborne Avenue out to the whole of New Orleans",
   "from": {
    "parish": "nola-uptown-garden",
    "position": [
     1018,
     -1633
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     -1059,
     1071
    ],
    "lonlat": [
     -90.09,
     29.942
    ]
   },
   "lonlat": [
    -90.09,
    29.942
   ],
   "approximate": true
  }
 ],
 "fieldLessons": [
  {
   "id": "nd-fl-streetcar-wire",
   "title": "The Wire Over the Streetcar",
   "site": "nup-streetcar-overhead-wire",
   "landmark": "st-charles-streetcar",
   "k12": "k12-reading-instructions-and-safety-labels",
   "station": "line-truck",
   "trade": "Overhead line electricians",
   "tradeLine": "An overhead line crew treats the streetcar wire as live until it is proven dead and keeps ladders and poles well clear.",
   "minutes": 3,
   "steps": [
    "Look up at the thin wire above the tracks.",
    "It carries the power that moves the streetcar.",
    "The crew keeps poles and ladders away from it unless it is switched off and tested."
   ],
   "check": {
    "q": "Why do people keep poles and ladders away from the wire?",
    "options": [
     "It carries power and can hurt you",
     "It is freshly painted",
     "Birds sit on it"
    ],
    "answer": 0,
    "why": "Overhead wires carry electricity, so only trained crews work near them once the power is off."
   }
  },
  {
   "id": "nd-fl-live-oak-drop-zone",
   "title": "The Drop Zone Under a Live Oak",
   "site": "nup-live-oak-crew",
   "landmark": "garden-district-houses",
   "k12": "k12-reading-instructions-and-safety-labels",
   "station": "gk-tree-work-pole-saw-and-drop-zone",
   "trade": "Tree crews",
   "tradeLine": "A tree crew marks a drop zone with cones before a single branch is cut, and keeps everyone outside it.",
   "minutes": 2,
   "steps": [
    "Find the cones in a circle under the big oak.",
    "That circle is where cut branches can land.",
    "Everyone who is not cutting stays outside the cones."
   ],
   "check": {
    "q": "Who may stand inside the cones?",
    "options": [
     "Only the crew doing the cutting",
     "Anyone who wants to watch",
     "People waiting for the streetcar"
    ],
    "answer": 0,
    "why": "Keeping people outside the drop zone means a falling branch cannot hit anyone."
   }
  },
  {
   "id": "nd-fl-pump-in-the-rain",
   "title": "Why the City Pumps the Rain",
   "site": "nup-pumping-station",
   "k12": "k12-reading-instructions-and-safety-labels",
   "station": "lift-station",
   "trade": "Pump station operators",
   "tradeLine": "A pump station operator checks every pump and alarm before a storm, because the city's streets sit low and rain must be lifted out.",
   "minutes": 3,
   "steps": [
    "Find the big building by the drainage canal.",
    "Inside, pumps lift rainwater out of the low streets.",
    "Before a storm the crew checks every pump and alarm."
   ],
   "check": {
    "q": "Why does the crew check the pumps before a storm?",
    "options": [
     "So rain can be lifted out of the streets",
     "So the building stays cool",
     "So the canal gets deeper"
    ],
    "answer": 0,
    "why": "Working pumps move storm water away before streets and homes flood."
   }
  }
 ],
 "gated": [
  {
   "id": "nd-up-gated-wire-walk",
   "kind": "side-quest",
   "title": "Walk the Wire With the Line Crew",
   "site": "nup-streetcar-overhead-wire",
   "siteName": "the St. Charles Overhead Wire Crew",
   "gate": {
    "stations": [
     "ra-roadway-worker-protection-and-job-briefing"
    ],
    "note": "Learn roadway worker protection before you walk the line with the overhead wire crew"
   },
   "world": "parishes",
   "parish": "nola-uptown-garden",
   "summary": "Walk the Wire With the Line Crew"
  },
  {
   "id": "nd-up-gated-oak-storm",
   "kind": "side-quest",
   "title": "Clear the Avenue After a Storm",
   "site": "nup-live-oak-crew",
   "siteName": "the St. Charles Live Oak Crew",
   "gate": {
    "stations": [
     "gk-tree-work-pole-saw-and-drop-zone"
    ],
    "note": "Learn the pole saw and the drop zone before you help clear branches off the avenue"
   },
   "world": "parishes",
   "parish": "nola-uptown-garden",
   "summary": "Clear the Avenue After a Storm"
  }
 ]
};
