// The Marigny, Bywater, the Lower Ninth Ward & Holy Cross — one 4096 m streamed New Orleans neighbourhood district on the shared parish schema
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

export const NP_NOLA_BYWATER_LOWER_NINTH = {
 "id": "nola-bywater-lower-ninth",
 "name": "The Marigny, Bywater, the Lower Ninth Ward & Holy Cross",
 "region": "new-orleans-districts",
 "parent": "orleans",
 "size": 4096,
 "scale": 1.25,
 "blurb": "Downriver from the Quarter on foot: the Marigny and Bywater's shotgun rows, the riverfront park and wharves, the rail line, the Industrial Canal and its lock, and across it the Lower Ninth Ward and Holy Cross on the levee, with Bayou Bienvenue's marsh behind. The site layouts are illustrative; the streets, the river, the canal and the neighbourhoods are real.",
 "start": "nbw-st-claude-streetcar-track",
 "anchors": [
  {
   "xz": [
    -1940,
    -178
   ],
   "lonlat": [
    -90.057,
    29.965
   ],
   "approximate": true,
   "name": "Washington Square in the Marigny"
  },
  {
   "xz": [
    452,
    178
   ],
   "lonlat": [
    -90.026,
    29.961
   ],
   "approximate": true,
   "name": "the Industrial Canal lock"
  },
  {
   "xz": [
    1301,
    712
   ],
   "lonlat": [
    -90.015,
    29.955
   ],
   "approximate": true,
   "name": "the Holy Cross levee"
  },
  {
   "xz": [
    -1631,
    891
   ],
   "lonlat": [
    -90.053,
    29.953
   ],
   "approximate": true,
   "name": "Algiers Point"
  },
  {
   "xz": [
    -11,
    -178
   ],
   "lonlat": [
    -90.032,
    29.965
   ],
   "approximate": true,
   "name": "the corner of St. Claude and Poland"
  },
  {
   "xz": [
    1301,
    -1603
   ],
   "lonlat": [
    -90.015,
    29.981
   ],
   "approximate": true,
   "name": "the Bayou Bienvenue wetland"
  },
  {
   "xz": [
    1069,
    -445
   ],
   "lonlat": [
    -90.018,
    29.968
   ],
   "approximate": true,
   "name": "the corner of Claiborne and Tennessee"
  },
  {
   "xz": [
    -1940,
    -980
   ],
   "lonlat": [
    -90.057,
    29.974
   ],
   "approximate": true,
   "name": "the corner of Elysian Fields and Claiborne"
  }
 ],
 "water": [
  {
   "id": "mississippi-river",
   "name": "the Mississippi River",
   "kind": "river",
   "width": 496,
   "poly": [
    [
     -2036,
     1017
    ],
    [
     -1990,
     868
    ],
    [
     -1929,
     729
    ],
    [
     -1825,
     615
    ],
    [
     -1722,
     502
    ],
    [
     -1599,
     423
    ],
    [
     -1457,
     379
    ],
    [
     -1316,
     334
    ],
    [
     -1168,
     309
    ],
    [
     -1013,
     303
    ],
    [
     -859,
     297
    ],
    [
     -707,
     311
    ],
    [
     -557,
     344
    ],
    [
     -406,
     377
    ],
    [
     -256,
     410
    ],
    [
     -111,
     457
    ],
    [
     30,
     516
    ],
    [
     171,
     576
    ],
    [
     311,
     635
    ],
    [
     452,
     695
    ],
    [
     589,
     774
    ],
    [
     726,
     853
    ],
    [
     863,
     932
    ],
    [
     1000,
     1011
    ],
    [
     1142,
     1079
    ],
    [
     1287,
     1136
    ],
    [
     1433,
     1192
    ],
    [
     1578,
     1249
    ],
    [
     1724,
     1302
    ],
    [
     1871,
     1344
    ],
    [
     2017,
     1387
    ]
   ]
  },
  {
   "id": "industrial-canal",
   "name": "the Industrial Canal",
   "kind": "canal",
   "width": 120,
   "poly": [
    [
     468,
     668
    ],
    [
     464,
     514
    ],
    [
     459,
     359
    ],
    [
     455,
     205
    ],
    [
     451,
     49
    ],
    [
     448,
     -109
    ],
    [
     445,
     -267
    ],
    [
     441,
     -425
    ],
    [
     438,
     -583
    ],
    [
     434,
     -738
    ],
    [
     429,
     -890
    ],
    [
     425,
     -1043
    ],
    [
     421,
     -1196
    ],
    [
     416,
     -1349
    ],
    [
     409,
     -1503
    ],
    [
     399,
     -1659
    ],
    [
     390,
     -1814
    ],
    [
     380,
     -1970
    ],
    [
     377,
     -2009
    ]
   ]
  },
  {
   "id": "bayou-bienvenue",
   "name": "the Bayou Bienvenue wetland",
   "kind": "wetland",
   "poly": [
    [
     915,
     -1336
    ],
    [
     1532,
     -1202
    ],
    [
     1957,
     -1113
    ],
    [
     1957,
     -2004
    ],
    [
     915,
     -2004
    ]
   ]
  }
 ],
 "levees": [
  {
   "id": "bywater-river-levee",
   "name": "the river levee along the Bywater and Holy Cross",
   "height": 5,
   "pts": [
    [
     -2036,
     925
    ],
    [
     -2036,
     759
    ],
    [
     -2036,
     559
    ],
    [
     -2036,
     405
    ],
    [
     -1924,
     264
    ],
    [
     -1730,
     140
    ],
    [
     -1551,
     81
    ],
    [
     -1389,
     31
    ],
    [
     -1200,
     -1
    ],
    [
     -1025,
     -9
    ],
    [
     -851,
     -15
    ],
    [
     -659,
     3
    ],
    [
     -490,
     39
    ],
    [
     -339,
     72
    ],
    [
     -174,
     109
    ],
    [
     -3,
     164
    ],
    [
     151,
     229
    ],
    [
     293,
     289
    ],
    [
     433,
     348
    ],
    [
     592,
     416
    ],
    [
     745,
     504
    ],
    [
     882,
     583
    ],
    [
     1019,
     662
    ],
    [
     1145,
     735
    ],
    [
     1267,
     793
    ],
    [
     1400,
     845
    ],
    [
     1546,
     901
    ],
    [
     1688,
     957
    ],
    [
     1820,
     1005
    ],
    [
     1958,
     1044
    ],
    [
     2036,
     1088
    ]
   ]
  },
  {
   "id": "algiers-point-levee",
   "name": "the Algiers Point levee",
   "height": 5,
   "pts": [
    [
     -1738,
     1109
    ],
    [
     -1698,
     977
    ],
    [
     -1668,
     899
    ],
    [
     -1594,
     825
    ],
    [
     -1520,
     740
    ],
    [
     -1468,
     706
    ],
    [
     -1363,
     677
    ],
    [
     -1243,
     637
    ],
    [
     -1136,
     619
    ],
    [
     -1001,
     615
    ],
    [
     -867,
     609
    ],
    [
     -755,
     619
    ],
    [
     -624,
     649
    ],
    [
     -473,
     682
    ],
    [
     -338,
     711
    ],
    [
     -219,
     750
    ],
    [
     -91,
     803
    ],
    [
     49,
     863
    ],
    [
     189,
     922
    ],
    [
     312,
     974
    ],
    [
     433,
     1044
    ],
    [
     570,
     1123
    ],
    [
     707,
     1202
    ],
    [
     855,
     1287
    ],
    [
     1017,
     1365
    ],
    [
     1174,
     1427
    ],
    [
     1320,
     1483
    ],
    [
     1468,
     1541
    ],
    [
     1628,
     1599
    ],
    [
     1784,
     1644
    ],
    [
     1929,
     1686
    ]
   ]
  },
  {
   "id": "industrial-canal-floodwall-east",
   "name": "the Industrial Canal floodwall, Lower Ninth side",
   "height": 5,
   "pts": [
    [
     568,
     267
    ],
    [
     565,
     112
    ],
    [
     562,
     -43
    ],
    [
     560,
     -197
    ],
    [
     557,
     -352
    ],
    [
     554,
     -507
    ],
    [
     551,
     -661
    ],
    [
     547,
     -814
    ],
    [
     542,
     -967
    ],
    [
     538,
     -1119
    ],
    [
     533,
     -1272
    ],
    [
     529,
     -1425
    ]
   ]
  },
  {
   "id": "industrial-canal-floodwall-west",
   "name": "the Industrial Canal floodwall, Bywater side",
   "height": 5,
   "pts": [
    [
     352,
     267
    ],
    [
     348,
     112
    ],
    [
     344,
     -43
    ],
    [
     340,
     -197
    ],
    [
     336,
     -352
    ],
    [
     332,
     -507
    ],
    [
     328,
     -661
    ],
    [
     322,
     -814
    ],
    [
     316,
     -967
    ],
    [
     310,
     -1119
    ],
    [
     304,
     -1272
    ],
    [
     298,
     -1425
    ]
   ]
  }
 ],
 "roads": [
  {
   "id": "st-claude-avenue",
   "name": "St. Claude Avenue",
   "kind": "avenue",
   "pts": [
    [
     -2010,
     -230
    ],
    [
     -1857,
     -257
    ],
    [
     -1705,
     -284
    ],
    [
     -1552,
     -311
    ],
    [
     -1400,
     -338
    ],
    [
     -1245,
     -347
    ],
    [
     -1091,
     -356
    ],
    [
     -936,
     -365
    ],
    [
     -782,
     -374
    ],
    [
     -628,
     -352
    ],
    [
     -473,
     -329
    ],
    [
     -319,
     -307
    ],
    [
     -165,
     -285
    ],
    [
     -23,
     -229
    ],
    [
     118,
     -172
    ],
    [
     260,
     -116
    ],
    [
     402,
     -59
    ],
    [
     549,
     -2
    ],
    [
     697,
     54
    ],
    [
     846,
     111
    ],
    [
     995,
     168
    ],
    [
     1143,
     221
    ],
    [
     1291,
     270
    ],
    [
     1439,
     319
    ],
    [
     1587,
     368
    ],
    [
     1735,
     417
    ],
    [
     1883,
     466
    ],
    [
     1957,
     490
    ]
   ]
  },
  {
   "id": "north-claiborne-avenue",
   "name": "North Claiborne Avenue",
   "kind": "avenue",
   "pts": [
    [
     -2010,
     -1028
    ],
    [
     -1857,
     -1042
    ],
    [
     -1703,
     -1056
    ],
    [
     -1550,
     -1070
    ],
    [
     -1397,
     -1085
    ],
    [
     -1244,
     -1099
    ],
    [
     -1091,
     -1113
    ],
    [
     -937,
     -1091
    ],
    [
     -782,
     -1069
    ],
    [
     -628,
     -1046
    ],
    [
     -474,
     -1024
    ],
    [
     -319,
     -1002
    ],
    [
     -165,
     -980
    ],
    [
     -23,
     -928
    ],
    [
     118,
     -875
    ],
    [
     260,
     -823
    ],
    [
     402,
     -770
    ],
    [
     550,
     -722
    ],
    [
     700,
     -676
    ],
    [
     850,
     -629
    ],
    [
     1000,
     -583
    ],
    [
     1151,
     -536
    ],
    [
     1301,
     -490
    ],
    [
     1455,
     -448
    ],
    [
     1610,
     -406
    ],
    [
     1764,
     -364
    ],
    [
     1918,
     -322
    ],
    [
     1957,
     -312
    ]
   ]
  },
  {
   "id": "dauphine-street",
   "name": "Dauphine Street",
   "kind": "street",
   "pts": [
    [
     -2010,
     -89
    ],
    [
     -1857,
     -89
    ],
    [
     -1704,
     -89
    ],
    [
     -1551,
     -89
    ],
    [
     -1398,
     -89
    ],
    [
     -1245,
     -89
    ],
    [
     -1091,
     -67
    ],
    [
     -936,
     -44
    ],
    [
     -782,
     -22
    ],
    [
     -628,
     0
    ],
    [
     -474,
     39
    ],
    [
     -319,
     78
    ],
    [
     -165,
     118
    ],
    [
     -10,
     157
    ],
    [
     144,
     196
    ]
   ]
  },
  {
   "id": "elysian-fields-avenue",
   "name": "Elysian Fields Avenue",
   "kind": "avenue",
   "pts": [
    [
     -1862,
     0
    ],
    [
     -1877,
     -153
    ],
    [
     -1892,
     -306
    ],
    [
     -1907,
     -458
    ],
    [
     -1921,
     -611
    ],
    [
     -1936,
     -764
    ],
    [
     -1947,
     -918
    ],
    [
     -1957,
     -1073
    ],
    [
     -1967,
     -1229
    ],
    [
     -1977,
     -1384
    ],
    [
     -1987,
     -1539
    ],
    [
     -1997,
     -1694
    ],
    [
     -2007,
     -1849
    ],
    [
     -2017,
     -2004
    ]
   ]
  },
  {
   "id": "poland-avenue",
   "name": "Poland Avenue",
   "kind": "street",
   "pts": [
    [
     5,
     160
    ],
    [
     -6,
     3
    ],
    [
     -17,
     -153
    ],
    [
     -27,
     -310
    ],
    [
     -38,
     -466
    ],
    [
     -49,
     -623
    ],
    [
     -58,
     -781
    ],
    [
     -66,
     -940
    ],
    [
     -75,
     -1098
    ],
    [
     -84,
     -1257
    ],
    [
     -88,
     -1336
    ]
   ]
  },
  {
   "id": "florida-avenue",
   "name": "Florida Avenue",
   "kind": "street",
   "pts": [
    [
     -937,
     -1870
    ],
    [
     -783,
     -1838
    ],
    [
     -628,
     -1805
    ],
    [
     -474,
     -1773
    ],
    [
     -320,
     -1741
    ],
    [
     -165,
     -1708
    ],
    [
     -13,
     -1667
    ],
    [
     137,
     -1616
    ],
    [
     287,
     -1565
    ],
    [
     437,
     -1514
    ],
    [
     581,
     -1455
    ],
    [
     725,
     -1395
    ],
    [
     869,
     -1336
    ],
    [
     1013,
     -1277
    ],
    [
     1157,
     -1217
    ],
    [
     1301,
     -1158
    ],
    [
     1455,
     -1126
    ],
    [
     1610,
     -1095
    ],
    [
     1764,
     -1063
    ],
    [
     1918,
     -1032
    ],
    [
     1957,
     -1024
    ]
   ]
  },
  {
   "id": "tennessee-street",
   "name": "Tennessee Street",
   "kind": "street",
   "pts": [
    [
     1185,
     401
    ],
    [
     1164,
     247
    ],
    [
     1143,
     93
    ],
    [
     1122,
     -60
    ],
    [
     1101,
     -214
    ],
    [
     1080,
     -368
    ],
    [
     1058,
     -521
    ],
    [
     1035,
     -672
    ],
    [
     1012,
     -823
    ],
    [
     989,
     -975
    ],
    [
     966,
     -1126
    ],
    [
     954,
     -1202
    ]
   ]
  },
  {
   "id": "the-interstate-east",
   "name": "the interstate toward New Orleans East",
   "kind": "interstate",
   "pts": [
    [
     -2013,
     -1486
    ],
    [
     -1873,
     -1556
    ],
    [
     -1734,
     -1626
    ],
    [
     -1594,
     -1696
    ],
    [
     -1454,
     -1765
    ],
    [
     -1315,
     -1835
    ],
    [
     -1168,
     -1886
    ],
    [
     -1014,
     -1918
    ],
    [
     -859,
     -1950
    ],
    [
     -705,
     -1982
    ],
    [
     -551,
     -2014
    ],
    [
     -474,
     -2030
    ]
   ]
  },
  {
   "id": "algiers-point-streets",
   "name": "the streets of Algiers Point",
   "kind": "street",
   "pts": [
    [
     -2017,
     1870
    ],
    [
     -1935,
     1739
    ],
    [
     -1852,
     1609
    ],
    [
     -1770,
     1478
    ],
    [
     -1684,
     1349
    ],
    [
     -1590,
     1226
    ],
    [
     -1495,
     1103
    ],
    [
     -1400,
     980
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "marigny",
   "name": "the Faubourg Marigny",
   "character": "quarter",
   "poly": [
    [
     -2048,
     -802
    ],
    [
     -1245,
     -802
    ],
    [
     -1245,
     89
    ],
    [
     -2048,
     89
    ]
   ]
  },
  {
   "id": "bywater",
   "name": "the Bywater",
   "character": "suburb",
   "poly": [
    [
     -1245,
     -1158
    ],
    [
     336,
     -1158
    ],
    [
     336,
     178
    ],
    [
     -1245,
     178
    ]
   ]
  },
  {
   "id": "lower-ninth-ward",
   "name": "the Lower Ninth Ward",
   "character": "suburb",
   "poly": [
    [
     568,
     -1158
    ],
    [
     1995,
     -1158
    ],
    [
     1995,
     -89
    ],
    [
     568,
     -89
    ]
   ]
  },
  {
   "id": "holy-cross",
   "name": "Holy Cross",
   "character": "garden",
   "poly": [
    [
     568,
     -89
    ],
    [
     1995,
     -89
    ],
    [
     1995,
     802
    ],
    [
     568,
     802
    ]
   ]
  },
  {
   "id": "riverfront-wharves",
   "name": "the riverfront wharves and rail line",
   "character": "industrial",
   "poly": [
    [
     -1091,
     45
    ],
    [
     221,
     45
    ],
    [
     221,
     267
    ],
    [
     -1091,
     267
    ]
   ]
  },
  {
   "id": "bienvenue-marsh",
   "name": "the Bayou Bienvenue marsh",
   "character": "wetland",
   "poly": [
    [
     915,
     -2004
    ],
    [
     1995,
     -2004
    ],
    [
     1995,
     -1202
    ],
    [
     915,
     -1202
    ]
   ]
  },
  {
   "id": "algiers-point",
   "name": "Algiers Point",
   "character": "garden",
   "poly": [
    [
     -2048,
     891
    ],
    [
     -1245,
     891
    ],
    [
     -1245,
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
   "id": "nbw-creole-cottage-restoration",
   "name": "a Marigny Creole Cottage Restoration",
   "kind": "construction",
   "position": [
    -1708,
    -312
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
   "blurb": "A Creole cottage on a Marigny street: scaffold on the banquette, silica control on old brick, lime plaster and a new roof."
  },
  {
   "id": "nbw-st-claude-streetcar-track",
   "name": "the St. Claude Streetcar Track Crew",
   "kind": "streetcar",
   "position": [
    -1014,
    -427
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
   "blurb": "Track work on the St. Claude line: roadway worker protection, the switch and the crossing signals."
  },
  {
   "id": "nbw-industrial-canal-floodwall",
   "name": "the Industrial Canal Floodwall Crew",
   "kind": "floodwall",
   "position": [
    722,
    -802
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
   "blurb": "The crew on the canal's floodwall on the Lower Ninth side: the seepage walk, the dozer on the slope and a floodwall pour."
  },
  {
   "id": "nbw-river-levee-crew",
   "name": "the Holy Cross River Levee Crew",
   "kind": "levee",
   "position": [
    1532,
    534
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
   "blurb": "The crew on the river levee at Holy Cross: seepage walks, the dozer on the slope and a floodwall pour."
  },
  {
   "id": "nbw-pumping-station",
   "name": "a Bywater Drainage Pumping Station",
   "kind": "pump",
   "position": [
    -474,
    -1425
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
   "blurb": "A pumping station that lifts the rain out of the Bywater: the motor control centre, permit entry and the storm generator."
  },
  {
   "id": "nbw-home-rebuild",
   "name": "a Lower Ninth Ward Home Rebuild",
   "kind": "construction",
   "position": [
    1301,
    -712
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
   "blurb": "A raised house going up on new piers: the pour, the shoring and rebar caps, with the crew's safety briefing first."
  },
  {
   "id": "nbw-bienvenue-wetland",
   "name": "the Bayou Bienvenue Wetland Crew",
   "kind": "wetland",
   "position": [
    1378,
    -1024
   ],
   "trades": [
    "liuna",
    "iuoe",
    "afscme"
   ],
   "programmes": [
    "marine-ecology-and-restoration",
    "bay-restoration-maritime-underwater"
   ],
   "stations": [
    "marsh-transect-survey",
    "me-tidal-marsh-channel-restoration-day",
    "br-native-planting-and-erosion-mats",
    "br-water-quality-sonde-calibration-and-deploy"
   ],
   "blurb": "The crew at the marsh behind the Lower Ninth: the transect, native planting, erosion mats and the water quality probe."
  },
  {
   "id": "nbw-wharf-crew",
   "name": "a Bywater Riverfront Wharf Crew",
   "kind": "port",
   "position": [
    -474,
    45
   ],
   "trades": [
    "ila",
    "iuoe",
    "teamsters",
    "ilwu"
   ],
   "programmes": [
    "rigging-lifting",
    "port-operations"
   ],
   "stations": [
    "dock-crane",
    "container-lashing",
    "mooring-line",
    "po-yard-hostler-and-pedestrian-separation",
    "vessel-gangway-and-hatch-cover-safety"
   ],
   "blurb": "A working wharf on the river: the crane, the lashing gear, the lines and the gangway."
  },
  {
   "id": "nbw-rail-yard",
   "name": "the Bywater Rail Line Crew",
   "kind": "rail",
   "position": [
    -898,
    -1158
   ],
   "trades": [
    "smart-td",
    "blet",
    "bmwed",
    "tcu",
    "brs"
   ],
   "programmes": [
    "railroad-crafts"
   ],
   "stations": [
    "ra-blue-flag-protection-in-the-yard",
    "rcl-switching",
    "ra-switch-inspection-and-lubrication",
    "ra-roadway-worker-protection-and-job-briefing"
   ],
   "blurb": "The rail line through the Bywater: blue-flag protection, switching and the roadway worker briefing."
  },
  {
   "id": "nbw-marigny-kitchen",
   "name": "a Frenchmen Street Restaurant Kitchen",
   "kind": "hospitality",
   "position": [
    -1901,
    -178
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
   "blurb": "A kitchen near the music clubs: the line, the hood, the bar well and the grease trap."
  },
  {
   "id": "nbw-music-venue-rigging",
   "name": "a Marigny Music Venue Stage Crew",
   "kind": "theatre",
   "position": [
    -1592,
    -89
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
   "blurb": "A club stage's crew: stage power, the rigging loft, truss load-in and the barricade and show stop."
  },
  {
   "id": "nbw-school-campus",
   "name": "a Lower Ninth Ward School Campus",
   "kind": "school",
   "position": [
    1609,
    -534
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
   "blurb": "A school in the Lower Ninth: the playground check, the crossing guard's corner and the safety labels in the kitchen."
  },
  {
   "id": "nbw-fire-station",
   "name": "a Bywater Fire Station",
   "kind": "fire-station",
   "position": [
    -242,
    -623
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
   "blurb": "A firehouse in the Bywater: size-up among wooden houses, the aerial ladder and rehab after a long call."
  },
  {
   "id": "nbw-drainage-crew",
   "name": "a Lower Ninth Drainage Crew",
   "kind": "stormwater",
   "position": [
    915,
    -267
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
   "blurb": "Drain lines renewed under the Lower Ninth's streets: the trench box, the manhole's air check and the storm call-out."
  },
  {
   "id": "nbw-solar-roof",
   "name": "a Holy Cross Solar Roof Install",
   "kind": "construction",
   "position": [
    1147,
    267
   ],
   "trades": [
    "ibew",
    "carpenters"
   ],
   "programmes": [
    "energy-transition",
    "electrical-first-period"
   ],
   "stations": [
    "temporary-site-power",
    "leading-edge-and-horizontal-lifeline",
    "rf-skylight-and-hatch-guarding",
    "line-truck"
   ],
   "blurb": "Solar panels on a raised house's roof: temporary power, the lifeline, a guarded hatch and the line truck."
  },
  {
   "id": "nbw-riverfront-park-crew",
   "name": "the Riverfront Park Grounds Crew",
   "kind": "park",
   "position": [
    -1245,
    -18
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
   "blurb": "The crew that keeps the riverfront park along the Bywater: the pole saw, the trimmer's bystander zone and the irrigation box."
  },
  {
   "id": "nbw-algiers-ferry-landing",
   "name": "the Algiers Point Ferry Landing Crew",
   "kind": "ferry",
   "position": [
    -1693,
    1265
   ],
   "trades": [
    "ibu",
    "siu",
    "mmp"
   ],
   "programmes": [
    "port-operations",
    "bay-area-union-edition",
    "yacht-and-charter-crew"
   ],
   "stations": [
    "mw-ferry-deckhand-and-passenger-safety",
    "yc-man-overboard-recovery-drill",
    "vessel-gangway-and-hatch-cover-safety"
   ],
   "blurb": "The Algiers Point landing for the ferry across to the Quarter: the gangway, passengers and a man-overboard drill."
  },
  {
   "id": "nbw-canal-lock-crew",
   "name": "the Industrial Canal Lock Crew",
   "kind": "lock",
   "position": [
    182,
    -45
   ],
   "trades": [
    "iuoe",
    "ibu",
    "meba",
    "mmp",
    "siu"
   ],
   "programmes": [
    "port-operations",
    "hunters-point-bay-restoration",
    "bay-area-union-edition"
   ],
   "stations": [
    "mw-workboat-towing-and-line-handling",
    "br-vhf-and-navigation-in-a-work-zone",
    "mooring-line",
    "pt-dock-fender-and-bollard-inspection"
   ],
   "blurb": "The crew that works vessels through the lock between the river and the canal: towing lines, the radio, mooring and fenders."
  }
 ],
 "landmarks": [
  {
   "id": "industrial-canal-lock",
   "name": "the Industrial Canal lock",
   "position": [
    437,
    196
   ],
   "kind": "lock",
   "lm": "canal-lock"
  },
  {
   "id": "holy-cross-levee",
   "name": "the Holy Cross levee",
   "position": [
    1378,
    623
   ],
   "kind": "levee"
  },
  {
   "id": "bienvenue-boardwalk",
   "name": "a boardwalk over the Bayou Bienvenue marsh",
   "position": [
    1147,
    -1514
   ],
   "kind": "wetland",
   "lm": "marsh-boardwalk"
  },
  {
   "id": "bywater-shotgun-row",
   "name": "a row of Bywater shotgun houses",
   "position": [
    -628,
    -267
   ],
   "kind": "neighbourhood",
   "lm": "shotgun-row"
  },
  {
   "id": "st-claude-bridge",
   "name": "the St. Claude Avenue bridge over the canal",
   "position": [
    437,
    -53
   ],
   "kind": "canal",
   "lm": "truss-bridge"
  },
  {
   "id": "marigny-streetcar",
   "name": "a streetcar on St. Claude Avenue",
   "position": [
    -1400,
    -356
   ],
   "kind": "place",
   "lm": "streetcar"
  },
  {
   "id": "algiers-point-landing",
   "name": "the landing at Algiers Point",
   "position": [
    -1708,
    1202
   ],
   "kind": "point"
  },
  {
   "id": "nbw-sign",
   "name": "a sign: the site layouts are illustrative; the streets, the river, the canal and the neighbourhoods are real",
   "position": [
    -782,
    -534
   ],
   "kind": "sign"
  }
 ],
 "connectors": [
  {
   "id": "nd-bw-fq-esplanade",
   "kind": "road",
   "name": "Across Esplanade Avenue into the French Quarter",
   "from": {
    "parish": "nola-bywater-lower-ninth",
    "position": [
     -1940,
     -89
    ]
   },
   "to": {
    "parish": "nola-french-quarter-cbd",
    "position": [
     1781,
     -1434
    ],
    "lonlat": [
     -90.0585,
     29.963
    ]
   },
   "lonlat": [
    -90.0585,
    29.963
   ],
   "approximate": true
  },
  {
   "id": "nd-bw-mc-elysian",
   "kind": "road",
   "name": "Elysian Fields Avenue up to Gentilly",
   "from": {
    "parish": "nola-bywater-lower-ninth",
    "position": [
     -1940,
     -802
    ]
   },
   "to": {
    "parish": "nola-mid-city-gentilly",
    "position": [
     1980,
     853
    ],
    "lonlat": [
     -90.0586,
     29.976
    ]
   },
   "lonlat": [
    -90.0586,
    29.976
   ],
   "approximate": true
  },
  {
   "id": "nd-bw-orleans-st-claude",
   "kind": "road",
   "name": "St. Claude Avenue out to the whole of New Orleans",
   "from": {
    "parish": "nola-bywater-lower-ninth",
    "position": [
     -88,
     -303
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     551,
     279
    ],
    "lonlat": [
     -90.033,
     29.9664
    ]
   },
   "lonlat": [
    -90.033,
    29.9664
   ],
   "approximate": true
  },
  {
   "id": "nd-bw-orleans-lower-ninth",
   "kind": "road",
   "name": "North Claiborne Avenue out to the whole of New Orleans",
   "from": {
    "parish": "nola-bywater-lower-ninth",
    "position": [
     1301,
     -534
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     1059,
     195
    ],
    "lonlat": [
     -90.015,
     29.969
    ]
   },
   "lonlat": [
    -90.015,
    29.969
   ],
   "approximate": true
  }
 ],
 "fieldLessons": [
  {
   "id": "nd-fl-canal-lock",
   "title": "How a Lock Lifts a Boat",
   "site": "nbw-canal-lock-crew",
   "landmark": "industrial-canal-lock",
   "k12": "k12-simple-machines-at-a-crane",
   "station": "mw-workboat-towing-and-line-handling",
   "trade": "Lock and towboat crews",
   "tradeLine": "A lock crew fills or empties the chamber slowly while the deckhands keep their lines tended and stand clear of the bight.",
   "minutes": 3,
   "steps": [
    "Find the long chamber with gates at each end.",
    "A boat goes in, the gates close, and water fills or drains to match the other side.",
    "Deckhands tend their lines and never stand where a line could snap back."
   ],
   "check": {
    "q": "Where should a deckhand never stand?",
    "options": [
     "Where a tight line could snap back",
     "On the deck",
     "Next to the crew"
    ],
    "answer": 0,
    "why": "A line under strain can snap back hard, so crews stand clear of it."
   }
  },
  {
   "id": "nd-fl-marsh-transect",
   "title": "Counting Plants Along a Line",
   "site": "nbw-bienvenue-wetland",
   "landmark": "bienvenue-boardwalk",
   "k12": "k12-reading-instructions-and-safety-labels",
   "station": "marsh-transect-survey",
   "trade": "Wetland scientists and crews",
   "tradeLine": "A wetland crew stretches a line across the marsh and records what grows along it, the same way each time, to see how it changes.",
   "minutes": 3,
   "steps": [
    "Look out from the boardwalk at the marsh.",
    "The crew stretches a line and notes the plants along it.",
    "Doing it the same way each time shows whether the marsh is growing back."
   ],
   "check": {
    "q": "Why does the crew do the count the same way each time?",
    "options": [
     "So they can see how the marsh changes",
     "So it is faster to finish",
     "So the birds stay away"
    ],
    "answer": 0,
    "why": "The same method each time makes changes in the marsh easy to see."
   }
  },
  {
   "id": "nd-fl-raised-house",
   "title": "Why New Houses Stand Up High",
   "site": "nbw-home-rebuild",
   "k12": "k12-reading-instructions-and-safety-labels",
   "station": "bt-rebar-tying-and-impalement-protection",
   "trade": "Carpenters and concrete crews",
   "tradeLine": "A building crew caps every sticking-up bar on the piers so nobody can fall onto one while the house goes up.",
   "minutes": 2,
   "steps": [
    "Find the new piers the house will stand on.",
    "Houses here are raised so water can pass under them in a flood.",
    "Every steel bar sticking up gets a bright cap so nobody can fall onto it."
   ],
   "check": {
    "q": "Why do the steel bars get caps?",
    "options": [
     "So nobody can be hurt falling onto them",
     "To make them look nice",
     "To keep them warm"
    ],
    "answer": 0,
    "why": "Caps cover sharp ends, so a trip or fall onto a bar does not cause an injury."
   }
  }
 ],
 "gated": [
  {
   "id": "nd-bw-gated-lock-through",
   "kind": "side-quest",
   "title": "Take a Towboat Through the Lock",
   "site": "nbw-canal-lock-crew",
   "siteName": "the Industrial Canal Lock Crew",
   "gate": {
    "stations": [
     "mw-workboat-towing-and-line-handling"
    ],
    "note": "Learn towing and line handling before you work a boat through the lock"
   },
   "world": "parishes",
   "parish": "nola-bywater-lower-ninth",
   "summary": "Take a Towboat Through the Lock"
  },
  {
   "id": "nd-bw-gated-marsh-plant",
   "kind": "side-quest",
   "title": "Plant the Marsh Edge",
   "site": "nbw-bienvenue-wetland",
   "siteName": "the Bayou Bienvenue Wetland Crew",
   "gate": {
    "stations": [
     "br-native-planting-and-erosion-mats"
    ],
    "note": "Learn native planting and erosion mats before you help plant the marsh edge"
   },
   "world": "parishes",
   "parish": "nola-bywater-lower-ninth",
   "summary": "Plant the Marsh Edge"
  }
 ]
};
