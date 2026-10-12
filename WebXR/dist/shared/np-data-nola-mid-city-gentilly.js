// Mid-City, City Park & Gentilly — one 4096 m streamed New Orleans neighbourhood district on the shared parish schema
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

export const NP_NOLA_MID_CITY_GENTILLY = {
 "id": "nola-mid-city-gentilly",
 "name": "Mid-City, City Park & Gentilly",
 "region": "new-orleans-districts",
 "parent": "orleans",
 "size": 4096,
 "scale": 1.5,
 "blurb": "The back of town between the river and the lake on foot: Mid-City's streets along Canal Street's streetcar, City Park's oaks and lagoons, Bayou St. John, the Fair Grounds, and Gentilly along the London Avenue Canal. The site layouts are illustrative; the streets, the canals, the bayou and the park are real.",
 "start": "nmc-canal-streetcar-track",
 "anchors": [
  {
   "xz": [
    -161,
    557
   ],
   "lonlat": [
    -90.093,
    29.986
   ],
   "approximate": true,
   "name": "the museum in City Park"
  },
  {
   "xz": [
    611,
    705
   ],
   "lonlat": [
    -90.081,
    29.984
   ],
   "approximate": true,
   "name": "the Fair Grounds"
  },
  {
   "xz": [
    225,
    928
   ],
   "lonlat": [
    -90.087,
    29.981
   ],
   "approximate": true,
   "name": "the Magnolia Bridge on Bayou St. John"
  },
  {
   "xz": [
    -675,
    1373
   ],
   "lonlat": [
    -90.101,
    29.975
   ],
   "approximate": true,
   "name": "the corner of Canal and Carrollton"
  },
  {
   "xz": [
    1382,
    -1225
   ],
   "lonlat": [
    -90.069,
    30.01
   ],
   "approximate": true,
   "name": "the London Avenue Canal at Mirabeau"
  },
  {
   "xz": [
    -482,
    -186
   ],
   "lonlat": [
    -90.098,
    29.996
   ],
   "approximate": true,
   "name": "the Orleans Avenue Canal at the interstate"
  },
  {
   "xz": [
    1896,
    -557
   ],
   "lonlat": [
    -90.061,
    30.001
   ],
   "approximate": true,
   "name": "the corner of Gentilly and Elysian Fields"
  },
  {
   "xz": [
    1639,
    111
   ],
   "lonlat": [
    -90.065,
    29.992
   ],
   "approximate": true,
   "name": "Dillard University"
  }
 ],
 "water": [
  {
   "id": "bayou-st-john",
   "name": "Bayou St. John",
   "kind": "bayou",
   "width": 37,
   "poly": [
    [
     344,
     -2036
    ],
    [
     348,
     -1882
    ],
    [
     352,
     -1727
    ],
    [
     357,
     -1573
    ],
    [
     361,
     -1418
    ],
    [
     365,
     -1264
    ],
    [
     370,
     -1114
    ],
    [
     376,
     -965
    ],
    [
     382,
     -816
    ],
    [
     382,
     -665
    ],
    [
     364,
     -507
    ],
    [
     347,
     -349
    ],
    [
     330,
     -190
    ],
    [
     309,
     -37
    ],
    [
     285,
     111
    ],
    [
     262,
     260
    ],
    [
     238,
     408
    ],
    [
     212,
     556
    ],
    [
     187,
     705
    ],
    [
     161,
     853
    ],
    [
     166,
     1002
    ],
    [
     171,
     1151
    ],
    [
     174,
     1225
    ]
   ]
  },
  {
   "id": "london-avenue-canal",
   "name": "the London Avenue Canal",
   "kind": "canal",
   "width": 27,
   "poly": [
    [
     1371,
     -2036
    ],
    [
     1373,
     -1882
    ],
    [
     1375,
     -1727
    ],
    [
     1377,
     -1573
    ],
    [
     1379,
     -1418
    ],
    [
     1381,
     -1264
    ],
    [
     1382,
     -1107
    ],
    [
     1382,
     -949
    ],
    [
     1382,
     -792
    ],
    [
     1382,
     -635
    ],
    [
     1382,
     -477
    ],
    [
     1382,
     -320
    ],
    [
     1382,
     -162
    ],
    [
     1382,
     -5
    ],
    [
     1382,
     74
    ]
   ]
  },
  {
   "id": "orleans-avenue-canal",
   "name": "the Orleans Avenue Canal",
   "kind": "canal",
   "width": 24,
   "poly": [
    [
     -513,
     -2036
    ],
    [
     -512,
     -1882
    ],
    [
     -511,
     -1727
    ],
    [
     -510,
     -1573
    ],
    [
     -509,
     -1418
    ],
    [
     -508,
     -1264
    ],
    [
     -507,
     -1105
    ],
    [
     -506,
     -945
    ],
    [
     -505,
     -785
    ],
    [
     -504,
     -626
    ],
    [
     -503,
     -466
    ],
    [
     -502,
     -306
    ],
    [
     -501,
     -186
    ]
   ]
  },
  {
   "id": "city-park-big-lake",
   "name": "City Park's Big Lake",
   "kind": "lake",
   "poly": [
    [
     -193,
     349
    ],
    [
     0,
     334
    ],
    [
     45,
     200
    ],
    [
     -161,
     186
    ]
   ]
  },
  {
   "id": "city-park-lagoon",
   "name": "a City Park lagoon",
   "kind": "lake",
   "poly": [
    [
     -289,
     -1336
    ],
    [
     -129,
     -1358
    ],
    [
     -64,
     -1558
    ],
    [
     -225,
     -1596
    ]
   ]
  }
 ],
 "levees": [
  {
   "id": "london-canal-floodwall-east",
   "name": "the London Avenue Canal floodwall, east side",
   "height": 4,
   "pts": [
    [
     1408,
     -2033
    ],
    [
     1409,
     -1873
    ],
    [
     1409,
     -1714
    ],
    [
     1410,
     -1555
    ],
    [
     1410,
     -1396
    ],
    [
     1411,
     -1237
    ],
    [
     1411,
     -1077
    ],
    [
     1411,
     -918
    ],
    [
     1412,
     -759
    ],
    [
     1412,
     -600
    ],
    [
     1413,
     -441
    ],
    [
     1413,
     -281
    ],
    [
     1414,
     -122
    ],
    [
     1414,
     37
    ]
   ]
  },
  {
   "id": "london-canal-floodwall-west",
   "name": "the London Avenue Canal floodwall, west side",
   "height": 4,
   "pts": [
    [
     1337,
     -2033
    ],
    [
     1338,
     -1873
    ],
    [
     1338,
     -1714
    ],
    [
     1339,
     -1555
    ],
    [
     1339,
     -1396
    ],
    [
     1340,
     -1237
    ],
    [
     1340,
     -1077
    ],
    [
     1340,
     -918
    ],
    [
     1341,
     -759
    ],
    [
     1341,
     -600
    ],
    [
     1342,
     -441
    ],
    [
     1342,
     -281
    ],
    [
     1343,
     -122
    ],
    [
     1343,
     37
    ]
   ]
  },
  {
   "id": "orleans-canal-floodwall",
   "name": "the Orleans Avenue Canal floodwall",
   "height": 4,
   "pts": [
    [
     -469,
     -2034
    ],
    [
     -468,
     -1876
    ],
    [
     -468,
     -1719
    ],
    [
     -467,
     -1561
    ],
    [
     -467,
     -1404
    ],
    [
     -466,
     -1247
    ],
    [
     -466,
     -1089
    ],
    [
     -465,
     -932
    ],
    [
     -465,
     -774
    ],
    [
     -464,
     -617
    ],
    [
     -464,
     -459
    ],
    [
     -463,
     -302
    ],
    [
     -463,
     -223
    ]
   ]
  }
 ],
 "roads": [
  {
   "id": "canal-street",
   "name": "Canal Street and its streetcar",
   "kind": "avenue",
   "pts": [
    [
     49,
     2013
    ],
    [
     -64,
     1911
    ],
    [
     -176,
     1809
    ],
    [
     -289,
     1707
    ],
    [
     -408,
     1604
    ],
    [
     -527,
     1501
    ],
    [
     -645,
     1399
    ],
    [
     -759,
     1291
    ],
    [
     -870,
     1183
    ],
    [
     -982,
     1074
    ],
    [
     -1093,
     965
    ]
   ]
  },
  {
   "id": "north-carrollton-avenue",
   "name": "North Carrollton Avenue and its streetcar",
   "kind": "avenue",
   "pts": [
    [
     -675,
     1373
    ],
    [
     -589,
     1249
    ],
    [
     -504,
     1126
    ],
    [
     -418,
     1002
    ],
    [
     -336,
     873
    ],
    [
     -254,
     743
    ],
    [
     -193,
     646
    ]
   ]
  },
  {
   "id": "esplanade-avenue",
   "name": "Esplanade Avenue",
   "kind": "avenue",
   "pts": [
    [
     1832,
     2004
    ],
    [
     1710,
     1912
    ],
    [
     1587,
     1820
    ],
    [
     1465,
     1728
    ],
    [
     1342,
     1636
    ],
    [
     1220,
     1544
    ],
    [
     1098,
     1442
    ],
    [
     977,
     1338
    ],
    [
     856,
     1233
    ],
    [
     735,
     1128
    ],
    [
     615,
     1027
    ],
    [
     495,
     928
    ],
    [
     375,
     829
    ],
    [
     255,
     730
    ],
    [
     225,
     705
    ]
   ]
  },
  {
   "id": "gentilly-boulevard",
   "name": "Gentilly Boulevard",
   "kind": "avenue",
   "pts": [
    [
     514,
     519
    ],
    [
     643,
     439
    ],
    [
     771,
     360
    ],
    [
     900,
     280
    ],
    [
     1018,
     186
    ],
    [
     1132,
     87
    ],
    [
     1246,
     -13
    ],
    [
     1360,
     -112
    ],
    [
     1473,
     -213
    ],
    [
     1581,
     -323
    ],
    [
     1689,
     -432
    ],
    [
     1798,
     -541
    ],
    [
     1906,
     -650
    ],
    [
     1960,
     -705
    ]
   ]
  },
  {
   "id": "elysian-fields-avenue",
   "name": "Elysian Fields Avenue",
   "kind": "avenue",
   "pts": [
    [
     2012,
     1002
    ],
    [
     2005,
     843
    ],
    [
     1997,
     684
    ],
    [
     1990,
     525
    ],
    [
     1982,
     366
    ],
    [
     1975,
     207
    ],
    [
     1967,
     48
    ],
    [
     1960,
     -111
    ],
    [
     1952,
     -269
    ],
    [
     1944,
     -426
    ],
    [
     1936,
     -584
    ],
    [
     1928,
     -742
    ],
    [
     1920,
     -900
    ],
    [
     1912,
     -1057
    ],
    [
     1904,
     -1215
    ],
    [
     1896,
     -1373
    ],
    [
     1889,
     -1529
    ],
    [
     1883,
     -1685
    ],
    [
     1876,
     -1842
    ],
    [
     1869,
     -1998
    ]
   ]
  },
  {
   "id": "interstate-six-ten",
   "name": "the interstate across the city's middle",
   "kind": "interstate",
   "pts": [
    [
     -2004,
     -222
    ],
    [
     -1845,
     -220
    ],
    [
     -1686,
     -217
    ],
    [
     -1527,
     -215
    ],
    [
     -1367,
     -212
    ],
    [
     -1208,
     -210
    ],
    [
     -1049,
     -207
    ],
    [
     -890,
     -204
    ],
    [
     -730,
     -202
    ],
    [
     -572,
     -196
    ],
    [
     -418,
     -182
    ],
    [
     -264,
     -168
    ],
    [
     -109,
     -154
    ],
    [
     45,
     -139
    ],
    [
     200,
     -125
    ],
    [
     354,
     -111
    ],
    [
     508,
     -78
    ],
    [
     662,
     -45
    ],
    [
     817,
     -12
    ],
    [
     971,
     21
    ],
    [
     1125,
     55
    ],
    [
     1279,
     88
    ],
    [
     1431,
     125
    ],
    [
     1582,
     164
    ],
    [
     1733,
     202
    ],
    [
     1884,
     241
    ],
    [
     1960,
     260
    ]
   ]
  },
  {
   "id": "north-broad-street",
   "name": "North Broad Street",
   "kind": "avenue",
   "pts": [
    [
     240,
     2006
    ],
    [
     300,
     1868
    ],
    [
     360,
     1729
    ],
    [
     420,
     1590
    ],
    [
     489,
     1452
    ],
    [
     566,
     1313
    ],
    [
     643,
     1175
    ],
    [
     720,
     1037
    ],
    [
     739,
     1002
    ]
   ]
  },
  {
   "id": "filmore-avenue",
   "name": "Filmore Avenue",
   "kind": "street",
   "pts": [
    [
     -1896,
     -928
    ],
    [
     -1740,
     -928
    ],
    [
     -1584,
     -928
    ],
    [
     -1429,
     -928
    ],
    [
     -1273,
     -928
    ],
    [
     -1117,
     -928
    ],
    [
     -961,
     -928
    ],
    [
     -806,
     -928
    ],
    [
     -650,
     -928
    ],
    [
     -495,
     -926
    ],
    [
     -341,
     -924
    ],
    [
     -186,
     -921
    ],
    [
     -32,
     -919
    ],
    [
     122,
     -917
    ],
    [
     277,
     -914
    ],
    [
     432,
     -912
    ],
    [
     589,
     -910
    ],
    [
     746,
     -908
    ],
    [
     902,
     -905
    ],
    [
     1059,
     -903
    ],
    [
     1216,
     -901
    ],
    [
     1372,
     -899
    ],
    [
     1529,
     -897
    ],
    [
     1686,
     -895
    ],
    [
     1842,
     -893
    ],
    [
     1960,
     -891
    ]
   ]
  },
  {
   "id": "mirabeau-avenue",
   "name": "Mirabeau Avenue",
   "kind": "street",
   "pts": [
    [
     386,
     -1262
    ],
    [
     541,
     -1256
    ],
    [
     697,
     -1250
    ],
    [
     852,
     -1243
    ],
    [
     1007,
     -1237
    ],
    [
     1163,
     -1231
    ],
    [
     1318,
     -1225
    ],
    [
     1469,
     -1216
    ],
    [
     1620,
     -1207
    ],
    [
     1771,
     -1198
    ],
    [
     1922,
     -1189
    ],
    [
     1960,
     -1187
    ]
   ]
  },
  {
   "id": "magnolia-bridge",
   "name": "the Magnolia Bridge over Bayou St. John",
   "kind": "bridge",
   "pts": [
    [
     77,
     913
    ],
    [
     221,
     913
    ],
    [
     257,
     913
    ]
   ]
  },
  {
   "id": "city-park-avenue",
   "name": "City Park Avenue",
   "kind": "street",
   "pts": [
    [
     -1093,
     965
    ],
    [
     -945,
     908
    ],
    [
     -796,
     851
    ],
    [
     -648,
     793
    ],
    [
     -497,
     743
    ],
    [
     -345,
     694
    ],
    [
     -193,
     646
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "mid-city",
   "name": "Mid-City",
   "character": "suburb",
   "poly": [
    [
     -1253,
     779
    ],
    [
     354,
     779
    ],
    [
     354,
     2048
    ],
    [
     -1253,
     2048
    ]
   ]
  },
  {
   "id": "city-park",
   "name": "City Park",
   "character": "park",
   "poly": [
    [
     -514,
     -2048
    ],
    [
     321,
     -2048
    ],
    [
     321,
     631
    ],
    [
     -514,
     631
    ]
   ]
  },
  {
   "id": "bayou-st-john",
   "name": "Bayou St. John",
   "character": "garden",
   "poly": [
    [
     161,
     557
    ],
    [
     675,
     557
    ],
    [
     675,
     1299
    ],
    [
     161,
     1299
    ]
   ]
  },
  {
   "id": "gentilly",
   "name": "Gentilly",
   "character": "suburb",
   "poly": [
    [
     418,
     -2048
    ],
    [
     2048,
     -2048
    ],
    [
     2048,
     260
    ],
    [
     418,
     260
    ]
   ]
  },
  {
   "id": "seventh-ward",
   "name": "the Seventh Ward",
   "character": "quarter",
   "poly": [
    [
     675,
     260
    ],
    [
     2048,
     260
    ],
    [
     2048,
     1744
    ],
    [
     675,
     1744
    ]
   ]
  },
  {
   "id": "lakeview-edge",
   "name": "the edge of Lakeview",
   "character": "suburb",
   "poly": [
    [
     -2044,
     -2048
    ],
    [
     -546,
     -2048
    ],
    [
     -546,
     -111
    ],
    [
     -2044,
     -111
    ]
   ]
  },
  {
   "id": "cemeteries",
   "name": "the cemeteries at the end of Canal Street",
   "character": "park",
   "poly": [
    [
     -2044,
     260
    ],
    [
     -1125,
     260
    ],
    [
     -1125,
     1150
    ],
    [
     -2044,
     1150
    ]
   ]
  }
 ],
 "sites": [
  {
   "id": "nmc-cottage-restoration",
   "name": "a Seventh Ward Creole Cottage Restoration",
   "kind": "construction",
   "position": [
    1318,
    1002
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
   "blurb": "A Creole cottage brought back: scaffold on the banquette, silica control on old brick, lime plaster and a new roof."
  },
  {
   "id": "nmc-canal-streetcar-track",
   "name": "the Canal Streetcar Line Track Crew",
   "kind": "streetcar",
   "position": [
    -321,
    1610
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
   "blurb": "Track work on the Canal Street line's neutral ground toward the cemeteries: roadway worker protection, the switch and the signals."
  },
  {
   "id": "nmc-carrollton-streetcar-wire",
   "name": "the Carrollton Streetcar Overhead Wire Crew",
   "kind": "streetcar",
   "position": [
    -514,
    1076
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
   "blurb": "The overhead wire where the line turns up Carrollton to the park: the line truck, the lookouts and the signal cabinet."
  },
  {
   "id": "nmc-london-canal-floodwall",
   "name": "the London Avenue Canal Floodwall Crew",
   "kind": "floodwall",
   "position": [
    1253,
    -928
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
   "blurb": "The crew on the canal's floodwall: the seepage walk, the dozer on the slope and a floodwall pour."
  },
  {
   "id": "nmc-bayou-st-john-bank",
   "name": "the Bayou St. John Bank Crew",
   "kind": "wetland",
   "position": [
    482,
    260
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
   "blurb": "The bayou's banks kept healthy: the transect, native planting, erosion mats and the water quality probe."
  },
  {
   "id": "nmc-city-park-grounds",
   "name": "the City Park Grounds Crew",
   "kind": "park",
   "position": [
    -354,
    -557
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
   "blurb": "The park's oaks and lawns: the pole saw, the drop zone, the chipper and the trimmer's bystander zone."
  },
  {
   "id": "nmc-museum-conservation",
   "name": "a City Park Museum Events Crew",
   "kind": "theatre",
   "position": [
    -64,
    497
   ],
   "trades": [
    "afscme",
    "iatse",
    "seiu"
   ],
   "programmes": [
    "property-management",
    "live-events"
   ],
   "stations": [
    "pm-fire-alarm-panel-room",
    "pm-community-room-and-events",
    "rigging-loft",
    "stage-power"
   ],
   "blurb": "The crew behind a museum's evenings: the fire alarm room, the events set-up and rigging for the show."
  },
  {
   "id": "nmc-school-campus",
   "name": "a Mid-City School Campus",
   "kind": "school",
   "position": [
    96,
    1484
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
   "blurb": "A school off Esplanade: the playground check, the crossing guard's corner and the safety labels in the kitchen."
  },
  {
   "id": "nmc-university-campus",
   "name": "a Gentilly University Facilities Crew",
   "kind": "campus",
   "position": [
    1703,
    0
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
   "blurb": "The crews that keep a campus in Gentilly running: the chiller plant, the fire alarm room and the lab's storage."
  },
  {
   "id": "nmc-fairgrounds-event-crew",
   "name": "the Fair Grounds Festival Stage Crew",
   "kind": "events",
   "position": [
    803,
    631
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
   "blurb": "The crew that builds the festival stages at the Fair Grounds: stage power, the rigging loft, truss load-in and the barricade."
  },
  {
   "id": "nmc-restaurant-kitchen",
   "name": "a Mid-City Restaurant Kitchen",
   "kind": "hospitality",
   "position": [
    -96,
    1781
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
   "blurb": "A kitchen on the streetcar line: the gas shut-off, the fryer oil change, the dish pit and the slicer lockout."
  },
  {
   "id": "nmc-drainage-culvert",
   "name": "a Gentilly Drainage Culvert Crew",
   "kind": "stormwater",
   "position": [
    932,
    -519
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
   "blurb": "A culvert that carries Gentilly's rain to the canal: the trench box, the manhole's air check and the storm call-out."
  },
  {
   "id": "nmc-street-reconstruction",
   "name": "a Mid-City Street Reconstruction",
   "kind": "construction",
   "position": [
    418,
    1299
   ],
   "trades": [
    "liuna",
    "iuoe",
    "opcmia",
    "teamsters"
   ],
   "programmes": [
    "builders-trades",
    "heavy-equipment-operators"
   ],
   "stations": [
    "op-grader-fine-grade-and-crown",
    "op-compactor-lift-thickness-and-edge",
    "concrete-pour",
    "traffic-incident-management"
   ],
   "blurb": "A street rebuilt with new drains under it: the grade and crown, the compactor, the pour and traffic kept moving."
  },
  {
   "id": "nmc-fire-station",
   "name": "a Gentilly Fire Station",
   "kind": "fire-station",
   "position": [
    1639,
    -1373
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
   "blurb": "A firehouse on a Gentilly avenue: size-up, the aerial ladder and rehab after a long call."
  },
  {
   "id": "nmc-roofing-crew",
   "name": "a Gentilly Roofing Crew",
   "kind": "construction",
   "position": [
    868,
    -1596
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
   "blurb": "A roof tear-off on a raised house: the debris chute, a guarded skylight and a lifeline."
  },
  {
   "id": "nmc-substation",
   "name": "a Mid-City Electrical Substation",
   "kind": "substation",
   "position": [
    -996,
    260
   ],
   "trades": [
    "ibew"
   ],
   "programmes": [
    "energy-transition",
    "electrical-first-period"
   ],
   "stations": [
    "temporary-site-power",
    "substation-switching",
    "line-truck",
    "transformer-vault"
   ],
   "blurb": "A neighbourhood substation: switching, the transformer vault and the line truck."
  },
  {
   "id": "nmc-hospital-campus",
   "name": "a Mid-City Hospital Campus",
   "kind": "hospital",
   "position": [
    450,
    1892
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
   "blurb": "A hospital campus near Canal Street: moving patients safely, the crash cart, sterile processing and medical gas."
  },
  {
   "id": "nmc-pumping-station",
   "name": "a Mid-City Drainage Pumping Station",
   "kind": "pump",
   "position": [
    -386,
    -186
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
   "blurb": "A pumping station that sends the rain toward the lake through the Orleans Avenue Canal: the motor control centre, permit entry and the storm generator."
  }
 ],
 "landmarks": [
  {
   "id": "city-park-oaks",
   "name": "City Park's live oaks",
   "position": [
    -257,
    37
   ],
   "kind": "park"
  },
  {
   "id": "magnolia-bridge",
   "name": "the Magnolia Bridge on Bayou St. John",
   "position": [
    109,
    913
   ],
   "kind": "bridge",
   "lm": "truss-bridge"
  },
  {
   "id": "fair-grounds",
   "name": "the Fair Grounds",
   "position": [
    623,
    720
   ],
   "kind": "place"
  },
  {
   "id": "london-canal-pump",
   "name": "a pumping station on the London Avenue Canal",
   "position": [
    1285,
    -1967
   ],
   "kind": "canal",
   "lm": "levee-pump-station"
  },
  {
   "id": "canal-streetcar-cemeteries",
   "name": "a streetcar at the end of Canal Street",
   "position": [
    -996,
    1039
   ],
   "kind": "place",
   "lm": "streetcar"
  },
  {
   "id": "city-park-boardwalk",
   "name": "a boardwalk by a City Park lagoon",
   "position": [
    -321,
    -1462
   ],
   "kind": "park",
   "lm": "marsh-boardwalk"
  },
  {
   "id": "museum-colonnade",
   "name": "the museum's columns in City Park",
   "position": [
    -174,
    542
   ],
   "kind": "place",
   "lm": "rotunda-colonnade"
  },
  {
   "id": "nmc-sign",
   "name": "a sign: the site layouts are illustrative; the streets, the canals, the bayou and the park are real",
   "position": [
    -96,
    1299
   ],
   "kind": "sign"
  }
 ],
 "connectors": [
  {
   "id": "nd-mc-fq-canal",
   "kind": "road",
   "name": "Canal Street in to the CBD and the French Quarter",
   "from": {
    "parish": "nola-mid-city-gentilly",
    "position": [
     161,
     1930
    ]
   },
   "to": {
    "parish": "nola-french-quarter-cbd",
    "position": [
     -1799,
     -921
    ],
    "lonlat": [
     -90.083,
     29.964
    ]
   },
   "lonlat": [
    -90.083,
    29.964
   ],
   "approximate": true
  },
  {
   "id": "nd-mc-orleans-carrollton",
   "kind": "road",
   "name": "North Carrollton Avenue out to the whole of New Orleans",
   "from": {
    "parish": "nola-mid-city-gentilly",
    "position": [
     -450,
     1039
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     -1271,
     -146
    ],
    "lonlat": [
     -90.0975,
     29.9795
    ]
   },
   "lonlat": [
    -90.0975,
    29.9795
   ],
   "approximate": true
  },
  {
   "id": "nd-mc-orleans-gentilly",
   "kind": "road",
   "name": "Gentilly Boulevard out to the whole of New Orleans",
   "from": {
    "parish": "nola-mid-city-gentilly",
    "position": [
     1446,
     -200
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     -438,
     -688
    ],
    "lonlat": [
     -90.068,
     29.9962
    ]
   },
   "lonlat": [
    -90.068,
    29.9962
   ],
   "approximate": true
  },
  {
   "id": "nd-mc-bywater-elysian",
   "kind": "road",
   "name": "Elysian Fields Avenue down to the Marigny",
   "from": {
    "parish": "nola-mid-city-gentilly",
    "position": [
     1980,
     853
    ]
   },
   "to": {
    "parish": "nola-bywater-lower-ninth",
    "position": [
     -1940,
     -802
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
  }
 ],
 "fieldLessons": [
  {
   "id": "nd-fl-canal-floodwall",
   "title": "A Wall Along the Canal",
   "site": "nmc-london-canal-floodwall",
   "landmark": "london-canal-pump",
   "k12": "k12-reading-instructions-and-safety-labels",
   "station": "br-levee-inspection-and-seepage",
   "trade": "Levee and floodwall crews",
   "tradeLine": "A floodwall crew walks the canal wall often, looking for wet ground or bubbling water on the dry side.",
   "minutes": 3,
   "steps": [
    "Find the long wall beside the canal.",
    "Rain water from the streets is pumped into the canal toward the lake.",
    "The crew walks the dry side looking for wet ground or bubbling water."
   ],
   "check": {
    "q": "What is the crew looking for on the dry side of the wall?",
    "options": [
     "Wet ground or bubbling water",
     "Lost footballs",
     "New paint"
    ],
    "answer": 0,
    "why": "Water showing up on the dry side can mean the wall needs repair before the next storm."
   }
  },
  {
   "id": "nd-fl-bayou-bank",
   "title": "Plants That Hold the Bank",
   "site": "nmc-bayou-st-john-bank",
   "landmark": "magnolia-bridge",
   "k12": "k12-reading-instructions-and-safety-labels",
   "station": "br-native-planting-and-erosion-mats",
   "trade": "Wetland restoration crews",
   "tradeLine": "A restoration crew plants native grasses and lays erosion mats so the bayou's bank holds together.",
   "minutes": 2,
   "steps": [
    "Look along the edge of the bayou.",
    "Roots of native plants hold the soil in place.",
    "Where the bank is bare, the crew lays mats and plants new grass."
   ],
   "check": {
    "q": "What holds the soil of the bank in place?",
    "options": [
     "Roots of native plants",
     "Painted rocks",
     "Fishing lines"
    ],
    "answer": 0,
    "why": "Roots bind the soil, so the water cannot wash the bank away."
   }
  },
  {
   "id": "nd-fl-festival-barricade",
   "title": "The Barricade in Front of the Stage",
   "site": "nmc-fairgrounds-event-crew",
   "landmark": "fair-grounds",
   "k12": "k12-reading-instructions-and-safety-labels",
   "station": "le-crowd-barricade-and-show-stop-call",
   "trade": "Stagehands",
   "tradeLine": "A stage crew sets a sturdy barricade and agrees who can call a show stop before any crowd arrives.",
   "minutes": 3,
   "steps": [
    "Find the metal barrier in front of the stage.",
    "It keeps a space clear between the crowd and the stage.",
    "The crew agrees who can stop the show if someone needs help."
   ],
   "check": {
    "q": "Why is there a clear space in front of the stage?",
    "options": [
     "So the crew can help anyone who needs it",
     "So the band can sit down",
     "So the grass can grow"
    ],
    "answer": 0,
    "why": "A clear space and a show stop call let the crew reach anyone quickly."
   }
  }
 ],
 "gated": [
  {
   "id": "nd-mc-gated-festival-stage",
   "kind": "side-quest",
   "title": "Build the Festival Stage",
   "site": "nmc-fairgrounds-event-crew",
   "siteName": "the Fair Grounds Festival Stage Crew",
   "gate": {
    "stations": [
     "stage-load-in-and-truss-rigging"
    ],
    "note": "Learn the load-in and truss rigging before you help build the festival stage"
   },
   "world": "parishes",
   "parish": "nola-mid-city-gentilly",
   "summary": "Build the Festival Stage"
  },
  {
   "id": "nd-mc-gated-canal-walk",
   "kind": "side-quest",
   "title": "Walk the Canal Wall Before a Storm",
   "site": "nmc-london-canal-floodwall",
   "siteName": "the London Avenue Canal Floodwall Crew",
   "gate": {
    "stations": [
     "br-levee-inspection-and-seepage"
    ],
    "note": "Learn to inspect a levee for seepage before you walk the canal wall with the crew"
   },
   "world": "parishes",
   "parish": "nola-mid-city-gentilly",
   "summary": "Walk the Canal Wall Before a Storm"
  }
 ]
};
