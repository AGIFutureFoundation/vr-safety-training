// Orleans Parish — one 4096 m streamed parish world on the shared parish
// schema (docs/consoles/PARISH.md, the Crescent brief's data contract).
//
// Facts rule: real places appear only by their public names, as places (a
// parish, a neighbourhood, a bridge, a park, a canal, a port, a university,
// a stadium district); no history, dates, statistics, addresses, business or
// venue-sponsor names. Coordinates are approximate (three decimals,
// `approximate: true`) and exist only to place a map: the parish is drawn at
// a stylised scale (about one world metre to three and a half real metres)
// so its whole shape — the river's bend, the lake shore, the outfall canals,
// the Industrial Canal and the wetland triangle — fits one field. Nothing
// here is survey data and no real building is modelled.
//
// Conventions (docs/consoles/PARISH.md): x east, z south, the field
// [-2048, 2048]²; a water `poly` with a `width` is a centreline, without one
// a closed polygon; a connector's far end may be written as the crossing's
// approximate `lonlat` (`position: null`) and np-parishes.js resolves it
// through the other parish's fit once that module exists.
//
// Written from approximate lon/lat by a scratch script; edit the numbers
// here directly. Pure: no three.js, no DOM. Every top-level name is prefixed
// np/NP_ (the bundler concatenates all modules into one scope).

export const NP_ORLEANS = {
 "id": "orleans",
 "name": "Orleans Parish",
 "size": 4096,
 "blurb": "The crescent city between the river and the lake: the Quarter's low blocks and galleries, the Garden District's houses under live oaks, the wharves and the Industrial Canal, the pumping stations on the outfall canals, and the wetland triangle in the east.",
 "start": "hospitality-row",
 "anchors": [
  {
   "xz": [
    -353,
    552
   ],
   "lonlat": [
    -90.065,
    29.958
   ],
   "approximate": true,
   "name": "French Quarter"
  },
  {
   "xz": [
    -805,
    779
   ],
   "lonlat": [
    -90.081,
    29.951
   ],
   "approximate": true,
   "name": "the stadium district"
  },
  {
   "xz": [
    14,
    682
   ],
   "lonlat": [
    -90.052,
    29.954
   ],
   "approximate": true,
   "name": "Algiers Point"
  },
  {
   "xz": [
    -1201,
    -649
   ],
   "lonlat": [
    -90.095,
    29.995
   ],
   "approximate": true,
   "name": "City Park"
  },
  {
   "xz": [
    -494,
    -1720
   ],
   "lonlat": [
    -90.07,
    30.028
   ],
   "approximate": true,
   "name": "the lakefront"
  },
  {
   "xz": [
    -2020,
    -552
   ],
   "lonlat": [
    -90.124,
    29.992
   ],
   "approximate": true,
   "name": "the Seventeenth Street Canal at the parish line"
  },
  {
   "xz": [
    692,
    422
   ],
   "lonlat": [
    -90.028,
    29.962
   ],
   "approximate": true,
   "name": "the Industrial Canal lock"
  },
  {
   "xz": [
    -2048,
    1363
   ],
   "lonlat": [
    -90.125,
    29.933
   ],
   "approximate": true,
   "name": "Audubon Park and the university campuses"
  },
  {
   "xz": [
    1709,
    -389
   ],
   "lonlat": [
    -89.992,
    29.987
   ],
   "approximate": true,
   "name": "the Bayou Bienvenue wetland"
  },
  {
   "xz": [
    -212,
    1039
   ],
   "lonlat": [
    -90.06,
    29.943
   ],
   "approximate": true,
   "name": "the Crescent City Connection"
  }
 ],
 "water": [
  {
   "id": "mississippi-river",
   "kind": "river",
   "name": "Mississippi River",
   "poly": [
    [
     -2048,
     2048
    ],
    [
     -1624,
     2045
    ],
    [
     -1201,
     1753
    ],
    [
     -777,
     1461
    ],
    [
     -494,
     1136
    ],
    [
     -268,
     909
    ],
    [
     -71,
     714
    ],
    [
     155,
     584
    ],
    [
     410,
     552
    ],
    [
     692,
     617
    ],
    [
     1059,
     747
    ],
    [
     1483,
     844
    ],
    [
     2048,
     974
    ]
   ],
   "width": 200
  },
  {
   "id": "lake-pontchartrain",
   "kind": "lake",
   "name": "Lake Pontchartrain",
   "poly": [
    [
     -2048,
     -1461
    ],
    [
     -1624,
     -1590
    ],
    [
     -1201,
     -1655
    ],
    [
     -636,
     -1753
    ],
    [
     -212,
     -1785
    ],
    [
     212,
     -1818
    ],
    [
     636,
     -1818
    ],
    [
     1059,
     -1980
    ],
    [
     1624,
     -2048
    ],
    [
     2048,
     -2048
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
   "id": "seventeenth-street-canal",
   "kind": "canal",
   "name": "Seventeenth Street Canal",
   "poly": [
    [
     -1991,
     -1493
    ],
    [
     -1991,
     -974
    ],
    [
     -2020,
     -552
    ]
   ],
   "width": 36
  },
  {
   "id": "orleans-avenue-canal",
   "kind": "canal",
   "name": "Orleans Avenue Canal",
   "poly": [
    [
     -1201,
     -1655
    ],
    [
     -1172,
     -974
    ],
    [
     -1172,
     -487
    ]
   ],
   "width": 30
  },
  {
   "id": "london-avenue-canal",
   "kind": "canal",
   "name": "London Avenue Canal",
   "poly": [
    [
     -212,
     -1785
    ],
    [
     -184,
     -1136
    ],
    [
     -240,
     -584
    ]
   ],
   "width": 30
  },
  {
   "id": "industrial-canal",
   "kind": "canal",
   "name": "Industrial Canal",
   "poly": [
    [
     692,
     649
    ],
    [
     692,
     0
    ],
    [
     664,
     -811
    ],
    [
     607,
     -1818
    ]
   ],
   "width": 60
  },
  {
   "id": "intracoastal-waterway",
   "kind": "canal",
   "name": "the Intracoastal Waterway",
   "poly": [
    [
     664,
     -487
    ],
    [
     1201,
     -519
    ],
    [
     2048,
     -552
    ]
   ],
   "width": 60
  },
  {
   "id": "bayou-st-john",
   "kind": "bayou",
   "name": "Bayou St. John",
   "poly": [
    [
     -777,
     -1655
    ],
    [
     -833,
     -1136
    ],
    [
     -946,
     -649
    ],
    [
     -1059,
     -260
    ],
    [
     -1144,
     32
    ]
   ],
   "width": 26
  },
  {
   "id": "bayou-bienvenue-wetland",
   "kind": "wetland",
   "name": "Bayou Bienvenue wetland",
   "poly": [
    [
     918,
     -97
    ],
    [
     2048,
     -97
    ],
    [
     2048,
     -422
    ],
    [
     1342,
     -422
    ],
    [
     918,
     -292
    ]
   ]
  },
  {
   "id": "lakefront-marsh",
   "kind": "wetland",
   "name": "the eastern lakefront marsh",
   "poly": [
    [
     918,
     -974
    ],
    [
     2048,
     -941
    ],
    [
     2048,
     -2045
    ],
    [
     1624,
     -1980
    ],
    [
     1059,
     -1785
    ],
    [
     805,
     -1396
    ]
   ]
  }
 ],
 "levees": [
  {
   "id": "river-levee-east-bank",
   "name": "the east-bank river levee",
   "height": 6,
   "pts": [
    [
     -1557,
     2048
    ],
    [
     -1134,
     1850
    ],
    [
     -699,
     1550
    ],
    [
     -407,
     1216
    ],
    [
     -185,
     993
    ],
    [
     1,
     808
    ],
    [
     193,
     696
    ],
    [
     403,
     670
    ],
    [
     665,
     732
    ]
   ]
  },
  {
   "id": "river-levee-east-bank-lower",
   "name": "the Holy Cross river levee",
   "height": 6,
   "pts": [
    [
     653,
     728
    ],
    [
     1026,
     860
    ],
    [
     1457,
     959
    ],
    [
     2022,
     1089
    ]
   ]
  },
  {
   "id": "river-levee-west-bank",
   "name": "the Algiers river levee",
   "height": 6,
   "pts": [
    [
     -1268,
     1656
    ],
    [
     -855,
     1372
    ],
    [
     -581,
     1056
    ],
    [
     -351,
     825
    ],
    [
     -143,
     620
    ],
    [
     117,
     472
    ],
    [
     417,
     434
    ],
    [
     726,
     504
    ],
    [
     1092,
     634
    ],
    [
     1509,
     729
    ],
    [
     2048,
     859
    ]
   ]
  },
  {
   "id": "lakefront-levee",
   "name": "the lakefront levee and seawall",
   "height": 5,
   "pts": [
    [
     -2048,
     -1331
    ],
    [
     -1624,
     -1461
    ],
    [
     -1201,
     -1525
    ],
    [
     -636,
     -1623
    ],
    [
     -212,
     -1655
    ],
    [
     212,
     -1688
    ],
    [
     636,
     -1688
    ],
    [
     1059,
     -1850
    ],
    [
     1624,
     -2012
    ],
    [
     2048,
     -2048
    ]
   ]
  },
  {
   "id": "seventeenth-street-floodwall-east",
   "name": "the Seventeenth Street Canal floodwall",
   "height": 4,
   "pts": [
    [
     -1949,
     -1396
    ],
    [
     -1949,
     -974
    ],
    [
     -1977,
     -552
    ]
   ]
  },
  {
   "id": "orleans-avenue-floodwalls",
   "name": "the Orleans Avenue Canal floodwalls",
   "height": 4,
   "pts": [
    [
     -1158,
     -1525
    ],
    [
     -1130,
     -974
    ],
    [
     -1130,
     -487
    ]
   ]
  },
  {
   "id": "london-avenue-floodwalls",
   "name": "the London Avenue Canal floodwalls",
   "height": 4,
   "pts": [
    [
     -169,
     -1655
    ],
    [
     -141,
     -1136
    ],
    [
     -198,
     -584
    ]
   ]
  },
  {
   "id": "industrial-canal-floodwall-west",
   "name": "the Industrial Canal west floodwall",
   "height": 5,
   "pts": [
    [
     621,
     487
    ],
    [
     621,
     0
    ],
    [
     593,
     -811
    ],
    [
     537,
     -1688
    ]
   ]
  },
  {
   "id": "industrial-canal-floodwall-east",
   "name": "the Industrial Canal east floodwall",
   "height": 5,
   "pts": [
    [
     763,
     487
    ],
    [
     763,
     0
    ],
    [
     734,
     -811
    ],
    [
     678,
     -1688
    ]
   ]
  }
 ],
 "roads": [
  {
   "id": "interstate-10",
   "name": "Interstate 10",
   "kind": "interstate",
   "pts": [
    [
     -2048,
     -649
    ],
    [
     -1483,
     -487
    ],
    [
     -1059,
     -32
    ],
    [
     -777,
     292
    ],
    [
     -494,
     519
    ],
    [
     -212,
     227
    ],
    [
     212,
     -97
    ],
    [
     494,
     -292
    ]
   ]
  },
  {
   "id": "interstate-10-high-rise",
   "name": "Interstate 10 High Rise",
   "kind": "bridge",
   "pts": [
    [
     494,
     -292
    ],
    [
     692,
     -357
    ],
    [
     918,
     -389
    ]
   ]
  },
  {
   "id": "interstate-10-east",
   "name": "Interstate 10 east",
   "kind": "interstate",
   "pts": [
    [
     918,
     -389
    ],
    [
     1483,
     -487
    ],
    [
     2048,
     -519
    ]
   ]
  },
  {
   "id": "interstate-610",
   "name": "Interstate 610",
   "kind": "interstate",
   "pts": [
    [
     -1794,
     -779
    ],
    [
     -1059,
     -844
    ],
    [
     -212,
     -811
    ],
    [
     212,
     -552
    ],
    [
     353,
     -195
    ]
   ]
  },
  {
   "id": "pontchartrain-expressway",
   "name": "Pontchartrain Expressway",
   "kind": "interstate",
   "pts": [
    [
     -1059,
     -32
    ],
    [
     -833,
     487
    ],
    [
     -607,
     779
    ],
    [
     -438,
     876
    ]
   ]
  },
  {
   "id": "crescent-city-connection",
   "name": "Crescent City Connection",
   "kind": "bridge",
   "pts": [
    [
     -438,
     876
    ],
    [
     -212,
     1039
    ],
    [
     14,
     1201
    ]
   ]
  },
  {
   "id": "west-bank-expressway",
   "name": "West Bank Expressway",
   "kind": "interstate",
   "pts": [
    [
     14,
     1201
    ],
    [
     127,
     1525
    ],
    [
     268,
     2045
    ]
   ]
  },
  {
   "id": "canal-street",
   "name": "Canal Street",
   "kind": "avenue",
   "pts": [
    [
     -311,
     763
    ],
    [
     -636,
     552
    ],
    [
     -1059,
     325
    ],
    [
     -1483,
     65
    ],
    [
     -1907,
     -162
    ]
   ]
  },
  {
   "id": "st-charles-avenue",
   "name": "St. Charles Avenue",
   "kind": "avenue",
   "pts": [
    [
     -551,
     844
    ],
    [
     -918,
     1201
    ],
    [
     -1342,
     1428
    ],
    [
     -1765,
     1493
    ],
    [
     -2048,
     1428
    ]
   ]
  },
  {
   "id": "esplanade-avenue",
   "name": "Esplanade Avenue",
   "kind": "avenue",
   "pts": [
    [
     -155,
     454
    ],
    [
     -494,
     227
    ],
    [
     -777,
     0
    ],
    [
     -1059,
     -227
    ]
   ]
  },
  {
   "id": "elysian-fields-avenue",
   "name": "Elysian Fields Avenue",
   "kind": "avenue",
   "pts": [
    [
     -99,
     422
    ],
    [
     -155,
     -162
    ],
    [
     -212,
     -811
    ],
    [
     -268,
     -1623
    ]
   ]
  },
  {
   "id": "carrollton-avenue",
   "name": "Carrollton Avenue",
   "kind": "avenue",
   "pts": [
    [
     -1822,
     1266
    ],
    [
     -1568,
     649
    ],
    [
     -1427,
     97
    ],
    [
     -1342,
     -487
    ],
    [
     -1285,
     -1396
    ]
   ]
  },
  {
   "id": "claiborne-avenue",
   "name": "Claiborne Avenue",
   "kind": "avenue",
   "pts": [
    [
     -1624,
     1136
    ],
    [
     -1201,
     779
    ],
    [
     -777,
     487
    ],
    [
     -353,
     325
    ],
    [
     71,
     227
    ],
    [
     523,
     162
    ]
   ]
  },
  {
   "id": "claiborne-avenue-bridge",
   "name": "Claiborne Avenue Bridge",
   "kind": "bridge",
   "pts": [
    [
     523,
     162
    ],
    [
     692,
     162
    ],
    [
     862,
     162
    ]
   ]
  },
  {
   "id": "claiborne-avenue-east",
   "name": "Claiborne Avenue east",
   "kind": "avenue",
   "pts": [
    [
     862,
     162
    ],
    [
     1483,
     162
    ],
    [
     2048,
     195
    ]
   ]
  },
  {
   "id": "st-claude-avenue",
   "name": "St. Claude Avenue",
   "kind": "avenue",
   "pts": [
    [
     -212,
     389
    ],
    [
     127,
     357
    ],
    [
     523,
     325
    ]
   ]
  },
  {
   "id": "st-claude-avenue-bridge",
   "name": "St. Claude Avenue Bridge",
   "kind": "bridge",
   "pts": [
    [
     523,
     325
    ],
    [
     692,
     325
    ],
    [
     862,
     325
    ]
   ]
  },
  {
   "id": "st-claude-avenue-east",
   "name": "St. Claude Avenue east",
   "kind": "avenue",
   "pts": [
    [
     862,
     325
    ],
    [
     1483,
     325
    ],
    [
     2048,
     325
    ]
   ]
  },
  {
   "id": "broad-street",
   "name": "Broad Street",
   "kind": "avenue",
   "pts": [
    [
     -1483,
     811
    ],
    [
     -1201,
     422
    ],
    [
     -918,
     0
    ],
    [
     -636,
     -389
    ]
   ]
  },
  {
   "id": "tulane-avenue",
   "name": "Tulane Avenue",
   "kind": "avenue",
   "pts": [
    [
     -523,
     714
    ],
    [
     -1059,
     389
    ],
    [
     -1483,
     162
    ],
    [
     -1907,
     -32
    ]
   ]
  },
  {
   "id": "poydras-street",
   "name": "Poydras Street",
   "kind": "street",
   "pts": [
    [
     -339,
     779
    ],
    [
     -579,
     682
    ],
    [
     -833,
     584
    ]
   ]
  },
  {
   "id": "magazine-street",
   "name": "Magazine Street",
   "kind": "street",
   "pts": [
    [
     -381,
     860
    ],
    [
     -777,
     1168
    ],
    [
     -1201,
     1461
    ],
    [
     -1568,
     1672
    ],
    [
     -2048,
     1753
    ]
   ]
  },
  {
   "id": "decatur-street",
   "name": "Decatur Street",
   "kind": "street",
   "pts": [
    [
     -339,
     714
    ],
    [
     -212,
     584
    ],
    [
     -99,
     438
    ]
   ]
  },
  {
   "id": "rampart-street",
   "name": "Rampart Street",
   "kind": "street",
   "pts": [
    [
     -508,
     600
    ],
    [
     -395,
     471
    ],
    [
     -297,
     325
    ]
   ]
  },
  {
   "id": "st-bernard-avenue",
   "name": "St. Bernard Avenue",
   "kind": "avenue",
   "pts": [
    [
     -325,
     292
    ],
    [
     -155,
     -227
    ],
    [
     14,
     -811
    ],
    [
     127,
     -1623
    ]
   ]
  },
  {
   "id": "gentilly-boulevard",
   "name": "Gentilly Boulevard",
   "kind": "avenue",
   "pts": [
    [
     -1201,
     -487
    ],
    [
     -636,
     -682
    ],
    [
     -71,
     -811
    ],
    [
     523,
     -974
    ]
   ]
  },
  {
   "id": "chef-menteur-bridge",
   "name": "the Chef Menteur Highway canal bridge",
   "kind": "bridge",
   "pts": [
    [
     523,
     -974
    ],
    [
     636,
     -990
    ],
    [
     749,
     -974
    ]
   ]
  },
  {
   "id": "chef-menteur-highway",
   "name": "Chef Menteur Highway",
   "kind": "avenue",
   "pts": [
    [
     749,
     -974
    ],
    [
     1483,
     -909
    ],
    [
     2048,
     -811
    ]
   ]
  },
  {
   "id": "lakeshore-drive",
   "name": "Lakeshore Drive",
   "kind": "avenue",
   "pts": [
    [
     -2020,
     -1363
    ],
    [
     -1624,
     -1493
    ],
    [
     -1201,
     -1558
    ],
    [
     -636,
     -1655
    ],
    [
     -212,
     -1688
    ],
    [
     212,
     -1720
    ],
    [
     523,
     -1688
    ]
   ]
  },
  {
   "id": "general-de-gaulle-drive",
   "name": "General de Gaulle Drive",
   "kind": "avenue",
   "pts": [
    [
     71,
     1266
    ],
    [
     494,
     1396
    ],
    [
     918,
     1525
    ]
   ]
  },
  {
   "id": "patterson-drive",
   "name": "Patterson Drive",
   "kind": "riverroad",
   "pts": [
    [
     -99,
     1006
    ],
    [
     99,
     844
    ],
    [
     353,
     747
    ],
    [
     636,
     811
    ],
    [
     918,
     941
    ]
   ]
  },
  {
   "id": "river-road-holy-cross",
   "name": "the Holy Cross river road",
   "kind": "riverroad",
   "pts": [
    [
     805,
     503
    ],
    [
     1144,
     600
    ],
    [
     1483,
     665
    ],
    [
     2048,
     795
    ]
   ]
  },
  {
   "id": "riverfront-wharf-road",
   "name": "the riverfront wharf road",
   "kind": "riverroad",
   "pts": [
    [
     -1342,
     1542
    ],
    [
     -946,
     1282
    ],
    [
     -636,
     1022
    ],
    [
     -438,
     828
    ]
   ]
  },
  {
   "id": "canal-street-ferry",
   "name": "Canal Street Ferry",
   "kind": "ferry",
   "pts": [
    [
     -339,
     844
    ],
    [
     -155,
     811
    ],
    [
     0,
     795
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "french-quarter",
   "name": "French Quarter",
   "character": "quarter",
   "poly": [
    [
     -508,
     600
    ],
    [
     -297,
     308
    ],
    [
     -99,
     438
    ],
    [
     -339,
     730
    ]
   ]
  },
  {
   "id": "treme",
   "name": "Tremé",
   "character": "quarter",
   "poly": [
    [
     -720,
     422
    ],
    [
     -508,
     600
    ],
    [
     -297,
     308
    ],
    [
     -551,
     97
    ]
   ]
  },
  {
   "id": "marigny-bywater",
   "name": "Marigny and Bywater",
   "character": "quarter",
   "poly": [
    [
     -99,
     438
    ],
    [
     -297,
     308
    ],
    [
     71,
     130
    ],
    [
     579,
     243
    ],
    [
     579,
     454
    ],
    [
     184,
     487
    ]
   ]
  },
  {
   "id": "central-business-district",
   "name": "Central Business District",
   "character": "downtown",
   "poly": [
    [
     -508,
     600
    ],
    [
     -339,
     730
    ],
    [
     -494,
     957
    ],
    [
     -777,
     844
    ],
    [
     -890,
     682
    ]
   ]
  },
  {
   "id": "garden-district-uptown",
   "name": "Garden District and Uptown",
   "character": "garden",
   "poly": [
    [
     -890,
     682
    ],
    [
     -777,
     844
    ],
    [
     -494,
     957
    ],
    [
     -720,
     1136
    ],
    [
     -1144,
     1428
    ],
    [
     -1624,
     1623
    ],
    [
     -1737,
     1396
    ],
    [
     -1342,
     974
    ]
   ]
  },
  {
   "id": "university-district",
   "name": "the university campuses and Audubon Park",
   "character": "campus",
   "poly": [
    [
     -1737,
     1396
    ],
    [
     -1624,
     1623
    ],
    [
     -1850,
     1753
    ],
    [
     -2048,
     1558
    ],
    [
     -2048,
     1201
    ]
   ]
  },
  {
   "id": "medical-district",
   "name": "the medical district",
   "character": "campus",
   "poly": [
    [
     -890,
     682
    ],
    [
     -720,
     422
    ],
    [
     -551,
     536
    ],
    [
     -621,
     714
    ]
   ]
  },
  {
   "id": "mid-city",
   "name": "Mid-City",
   "character": "suburb",
   "poly": [
    [
     -1737,
     1396
    ],
    [
     -1342,
     974
    ],
    [
     -890,
     682
    ],
    [
     -720,
     422
    ],
    [
     -551,
     97
    ],
    [
     -1059,
     -357
    ],
    [
     -1568,
     -292
    ],
    [
     -1850,
     162
    ]
   ]
  },
  {
   "id": "lakeview-gentilly",
   "name": "Lakeview, Gentilly and the lakefront",
   "character": "suburb",
   "poly": [
    [
     -2020,
     -487
    ],
    [
     -1568,
     -292
    ],
    [
     -1059,
     -357
    ],
    [
     -551,
     97
    ],
    [
     71,
     130
    ],
    [
     466,
     -97
    ],
    [
     466,
     -1525
    ],
    [
     -212,
     -1590
    ],
    [
     -1059,
     -1493
    ],
    [
     -2020,
     -1298
    ]
   ]
  },
  {
   "id": "riverfront-wharves",
   "name": "the riverfront wharves",
   "character": "port",
   "poly": [
    [
     -1342,
     1590
    ],
    [
     -720,
     1136
    ],
    [
     -494,
     957
    ],
    [
     -325,
     730
    ],
    [
     -198,
     763
    ],
    [
     -381,
     1055
    ],
    [
     -650,
     1233
    ],
    [
     -1257,
     1704
    ]
   ]
  },
  {
   "id": "inner-harbor",
   "name": "the Inner Harbor along the Industrial Canal",
   "character": "port",
   "poly": [
    [
     466,
     568
    ],
    [
     918,
     536
    ],
    [
     975,
     -292
    ],
    [
     466,
     -227
    ]
   ]
  },
  {
   "id": "industrial-almonaster",
   "name": "the rail and industrial corridor",
   "character": "industrial",
   "poly": [
    [
     71,
     130
    ],
    [
     466,
     243
    ],
    [
     466,
     -227
    ],
    [
     14,
     -422
    ],
    [
     -155,
     -162
    ]
   ]
  },
  {
   "id": "algiers",
   "name": "Algiers",
   "character": "suburb",
   "poly": [
    [
     -268,
     1201
    ],
    [
     71,
     909
    ],
    [
     353,
     844
    ],
    [
     749,
     941
    ],
    [
     918,
     1298
    ],
    [
     636,
     1623
    ],
    [
     71,
     1818
    ],
    [
     -155,
     1623
    ]
   ]
  },
  {
   "id": "lower-ninth-ward",
   "name": "Lower Ninth Ward and Holy Cross",
   "character": "suburb",
   "poly": [
    [
     918,
     747
    ],
    [
     2048,
     876
    ],
    [
     2048,
     -32
    ],
    [
     918,
     -32
    ]
   ]
  },
  {
   "id": "bayou-bienvenue-triangle",
   "name": "the Bayou Bienvenue wetland triangle",
   "character": "wetland",
   "poly": [
    [
     918,
     -65
    ],
    [
     2048,
     -65
    ],
    [
     2048,
     -487
    ],
    [
     1342,
     -487
    ],
    [
     918,
     -325
    ]
   ]
  },
  {
   "id": "eastern-lakefront-marsh",
   "name": "the eastern lakefront marsh",
   "character": "wetland",
   "poly": [
    [
     862,
     -909
    ],
    [
     2048,
     -876
    ],
    [
     2048,
     -2048
    ],
    [
     1624,
     -2045
    ],
    [
     1059,
     -1850
    ],
    [
     777,
     -1396
    ]
   ]
  }
 ],
 "sites": [
  {
   "id": "port-terminal",
   "name": "Riverfront Wharves Terminal",
   "kind": "port",
   "position": [
    -932,
    1315
   ],
   "trades": [
    "ila",
    "iuoe",
    "teamsters",
    "ilwu"
   ],
   "programmes": [
    "rigging-lifting",
    "port-operations",
    "bay-area-union-edition"
   ],
   "stations": [
    "dock-crane",
    "container-lashing",
    "mooring-line",
    "po-yard-hostler-and-pedestrian-separation",
    "po-lashing-gear-inspection-and-tagging",
    "vessel-gangway-and-hatch-cover-safety"
   ],
   "blurb": "The wharves on the river's east bank: gantry cranes, lashing gangs, the mooring lines and the yard's hostlers."
  },
  {
   "id": "levee-floodwall",
   "name": "River Levee and Floodwall Crew",
   "kind": "levee",
   "position": [
    325,
    406
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
    "op-grader-fine-grade-and-crown",
    "formwork-shoring",
    "concrete-pour"
   ],
   "blurb": "The crew that walks the river levee and maintains the floodwall on its crown: inspection, seepage, the slope work and the wall's formwork."
  },
  {
   "id": "pumping-station",
   "name": "Drainage Pumping Station",
   "kind": "pump",
   "position": [
    -1893,
    -503
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
   "blurb": "The pumping station at the head of the outfall canal that lifts the city's rainwater over the levee into the lake."
  },
  {
   "id": "streetcar-barn",
   "name": "Streetcar Barn and Shops",
   "kind": "streetcar",
   "position": [
    -1455,
    16
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
    "tr-wheelchair-lift-and-securement-on-a-bus",
    "track-access",
    "ra-hand-brake-and-securement-on-a-grade"
   ],
   "blurb": "The barn where the streetcars are serviced overnight: the lifts, the track access permits and the signal cabinets along the line."
  },
  {
   "id": "rail-yard",
   "name": "Rail Yard and Passenger Terminal",
   "kind": "rail",
   "position": [
    -918,
    957
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
    "ra-roadway-worker-protection-and-job-briefing",
    "ra-air-brake-test-and-train-inspection"
   ],
   "blurb": "The passenger terminal and the yard behind it: blue-flag protection, switching, switch inspection and the job briefing before any roadway work."
  },
  {
   "id": "hospital-district",
   "name": "Medical District Hospital Campus",
   "kind": "hospital",
   "position": [
    -720,
    568
   ],
   "trades": [
    "nnu",
    "seiu",
    "afscme",
    "ua",
    "ibew"
   ],
   "programmes": [
    "first-responders",
    "situational-awareness",
    "plumbers-and-pipefitters"
   ],
   "stations": [
    "hc-patient-transport-and-safe-handling",
    "hc-code-response-support-and-crash-cart-check",
    "hc-environmental-services-isolation-room-turnover",
    "hc-sterile-processing-decontamination-and-assembly",
    "pl-medical-gas-brazing-and-purge",
    "triage-point"
   ],
   "blurb": "The hospital campus of the medical district: transport, code response support, isolation room turnover, sterile processing and the medical gas lines."
  },
  {
   "id": "university-campus",
   "name": "Uptown University Campus",
   "kind": "campus",
   "position": [
    -1893,
    1444
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
    "k12-public-speaking-at-the-hall",
    "pm-electrical-room"
   ],
   "blurb": "The university campuses beside the park: the central plant, the fire alarm panel room, a science lab's chemical store and the lecture hall."
  },
  {
   "id": "stadium-district",
   "name": "Stadium and Arena District",
   "kind": "stadium",
   "position": [
    -819,
    779
   ],
   "trades": [
    "iatse",
    "seiu",
    "unite-here",
    "ibew",
    "spfpa"
   ],
   "programmes": [
    "rigging-lifting",
    "live-events"
   ],
   "stations": [
    "arena-rigging",
    "le-crowd-barricade-and-show-stop-call",
    "le-followspot-and-truss-access-at-height",
    "stage-power",
    "chain-hoist",
    "broadcast-truck"
   ],
   "blurb": "The stadium district: arena rigging, crowd barricades and the show-stop call, followspots at height, stage power and the broadcast truck."
  },
  {
   "id": "hospitality-row",
   "name": "Canal Street Hospitality Row",
   "kind": "hospitality",
   "position": [
    -452,
    682
   ],
   "trades": [
    "unite-here",
    "seiu"
   ],
   "programmes": [
    "culinary-kitchen",
    "bartending-course",
    "hotel-workers"
   ],
   "stations": [
    "housekeeping-room-turn",
    "hw-banquet-room-flip-and-staging",
    "hw-housekeeping-cart-and-chemical-safety",
    "banquet-setup-lift",
    "allergen-control",
    "kitchen"
   ],
   "blurb": "The hotels along Canal Street: housekeeping, banquet rooms, the carts and chemicals, the kitchens."
  },
  {
   "id": "wetland-restoration",
   "name": "Bayou Wetland Restoration Site",
   "kind": "wetland",
   "position": [
    1370,
    -16
   ],
   "trades": [
    "liuna",
    "iuoe",
    "afscme"
   ],
   "programmes": [
    "hunters-point-bay-restoration",
    "bay-restoration-maritime-underwater",
    "marine-ecology-and-restoration"
   ],
   "stations": [
    "br-native-planting-and-erosion-mats",
    "br-tidal-marsh-grading-amphibious-excavator",
    "me-tidal-marsh-channel-restoration-day",
    "living-shoreline",
    "br-water-quality-sonde-calibration-and-deploy"
   ],
   "blurb": "The restoration site at the wetland triangle: native planting, marsh grading from an amphibious excavator, a channel day and the water quality sonde."
  },
  {
   "id": "canal-lock",
   "name": "Industrial Canal Lock and Inner Harbor",
   "kind": "lock",
   "position": [
    565,
    471
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
    "dredge-barge",
    "mooring-line",
    "pt-dock-fender-and-bollard-inspection"
   ],
   "blurb": "The lock where the canal meets the river and the harbor behind it: workboats, towing, the radio in a work zone, the dredge and the fenders."
  },
  {
   "id": "lakefront-levee",
   "name": "Lakefront Levee and Seawall",
   "kind": "levee",
   "position": [
    -1003,
    -1493
   ],
   "trades": [
    "iuoe",
    "liuna",
    "afscme"
   ],
   "programmes": [
    "hunters-point-bay-restoration",
    "bay-restoration-maritime-underwater",
    "grounds-and-landscaping"
   ],
   "stations": [
    "br-levee-inspection-and-seepage",
    "tide-gate",
    "br-shoreline-cleanup-sharps-and-hazardous-debris",
    "gk-ride-on-mower-pre-start-and-slope-work"
   ],
   "blurb": "The lakefront levee and its seawall: inspection, the tide gate, shoreline clean-up and the mower on the slope."
  },
  {
   "id": "ferry-landing",
   "name": "Canal Street Ferry Landing",
   "kind": "ferry",
   "position": [
    -395,
    844
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
   "blurb": "The ferry landing at the foot of Canal Street: the deckhand's passenger safety, the gangway and the overboard drill."
  },
  {
   "id": "bridge-crew",
   "name": "River Bridge Maintenance Crew",
   "kind": "bridge",
   "position": [
    -565,
    828
   ],
   "trades": [
    "ironworkers",
    "iupat",
    "iuoe"
   ],
   "programmes": [
    "bay-area-union-edition",
    "bridge-and-structural"
   ],
   "stations": [
    "bridge-cable-inspection",
    "deck-joint-replacement",
    "bridge-lead-containment",
    "gg-deck-lane-closure-and-traveller",
    "gg-fog-and-wind-work-stop"
   ],
   "blurb": "The crew yard under the river bridge's approach: cable inspection, deck joints, lead containment, the lane closure and the fog-and-wind work stop."
  },
  // sw:begin — tools/gen_sw_sites.mjs (console SITEWORKS): procedural sites; re-run the tool, do not hand-edit
  {"id":"no-sw-algiers-school-campus","name":"Algiers School Campus","kind":"school","position":[460,1680],"trades":["aft","csea","seiu"],"programmes":["education-support-staff","k12-literacy-and-life-skills"],"stations":["ed-custodial-chemical-dilution-and-floor-machine","ed-playground-equipment-inspection","ed-crossing-guard-intersection-control","k12-reading-instructions-and-safety-labels"],"blurb":"A procedural school campus in Algiers: custodians, the crossing guard, the kitchen crew and a classroom lesson."},
  {"id":"no-sw-lakeview-and-gentilly-park-grounds-yard","name":"Lakeview and Gentilly Park Grounds Yard","kind":"park","position":[460,-1200],"trades":["afscme","liuna","seiu"],"programmes":["grounds-and-landscaping"],"stations":["gk-string-trimmer-and-blower-ppe-and-bystander-zone","gk-tree-work-pole-saw-and-drop-zone","gk-irrigation-controller-valve-box-and-backflow-check","gk-chainsaw-start-and-limbing-on-the-ground"],"blurb":"A procedural park grounds yard in Lakeview, Gentilly and the lakefront: mowers, trimmers, tree work and the irrigation boxes."},
  {"id":"no-sw-mid-city-fire-station","name":"Mid-City Fire Station","kind":"fire-station","position":[-1780,700],"trades":["iaff","naemt"],"programmes":["first-responders","fall-protection"],"stations":["ambulance-scene-safety","aerial-ladder","cardiac-arrest-pit-crew","overdose-response-naloxone"],"blurb":"A procedural fire station in Mid-City: the engine company's size-up, the aerial ladder, the ambulance crew and rehab."},
  {"id":"no-sw-lakeview-and-gentilly-community-clinic","name":"Lakeview and Gentilly Community Clinic","kind":"hospital","position":[-440,-520],"trades":["nnu","seiu","afscme"],"programmes":["healthcare-support","first-responders"],"stations":["hc-workplace-violence-deescalation-at-the-desk","hc-hazardous-drug-spill-kit-response","hc-dietary-tray-line-and-allergy-flags","hc-code-response-support-and-crash-cart-check"],"blurb":"A procedural community clinic in Lakeview, Gentilly and the lakefront: patient transport, room turnover, regulated waste and the front desk."},
  {"id":"no-sw-lower-ninth-ward-fire-station","name":"Lower Ninth Ward Fire Station","kind":"fire-station","position":[1740,580],"trades":["iaff","naemt"],"programmes":["first-responders","fall-protection"],"stations":["cardiac-arrest-pit-crew","overdose-response-naloxone","traffic-incident-management","ev-extrication"],"blurb":"A procedural fire station in Lower Ninth Ward and Holy Cross: the engine company's size-up, the aerial ladder, the ambulance crew and rehab."},
  {"id":"no-sw-almonaster-corridor-distribution-warehouse","name":"Almonaster Corridor Distribution Warehouse","kind":"warehouse","position":[460,-80],"trades":["teamsters"],"programmes":["warehouse-and-logistics-automation","job-readiness-edition"],"stations":["tw-high-bay-order-picker-fall-protection","tdl-trailer-loading-and-dock-plate","tw-amr-traffic-zone-entry-and-lockout","forklift-dock"],"blurb":"A procedural distribution warehouse in the rail and industrial corridor: the dock, the conveyors, the charging bay and the order pickers."},
  {"id":"no-sw-algiers-fire-station","name":"Algiers Fire Station","kind":"fire-station","position":[820,1100],"trades":["iaff","naemt"],"programmes":["first-responders","fall-protection"],"stations":["ev-extrication","structure-fire-sizeup","firefighter-rehab-sector","ambulance-scene-safety"],"blurb":"A procedural fire station in Algiers: the engine company's size-up, the aerial ladder, the ambulance crew and rehab."},
  {"id":"no-sw-lakeview-and-gentilly-recreation-centre","name":"Lakeview and Gentilly Recreation Centre","kind":"recreation","position":[-1780,-1300],"trades":["afscme","seiu"],"programmes":["basketball-fundamentals","property-management"],"stations":["pm-pool-and-spa-chemistry","pm-community-room-and-events","ed-playground-equipment-inspection","bb-passing-and-catching"],"blurb":"A procedural recreation centre in Lakeview, Gentilly and the lakefront: the gym floor, the pool chemistry, the community room and the playground."},
  {"id":"no-sw-eastern-lakefront-marsh-restoration-camp","name":"Eastern Lakefront Marsh Restoration Camp","kind":"wetland","position":[1780,-920],"trades":["liuna","iuoe","afscme"],"programmes":["marine-ecology-and-restoration","bay-restoration-maritime-underwater"],"stations":["marsh-transect-survey","me-tidal-marsh-channel-restoration-day","br-native-planting-and-erosion-mats","br-water-quality-sonde-calibration-and-deploy"],"blurb":"A procedural marsh restoration camp in the eastern lakefront marsh: the marsh transect, channel restoration, native planting and the water-quality sonde."},
  {"id":"no-sw-mid-city-park-grounds-yard","name":"Mid-City Park Grounds Yard","kind":"park","position":[-860,-20],"trades":["afscme","liuna","seiu"],"programmes":["grounds-and-landscaping"],"stations":["gk-tree-work-pole-saw-and-drop-zone","gk-irrigation-controller-valve-box-and-backflow-check","gk-chainsaw-start-and-limbing-on-the-ground","gk-hardscape-paver-base-and-compaction"],"blurb":"A procedural park grounds yard in Mid-City: mowers, trimmers, tree work and the irrigation boxes."},
  {"id":"no-sw-lakeview-and-gentilly-substation","name":"Lakeview and Gentilly Substation","kind":"substation","position":[-280,-1300],"trades":["ibew"],"programmes":["energy-transition","electrical-first-period"],"stations":["temporary-site-power","substation-switching","line-truck","transformer-vault"],"blurb":"A procedural substation in Lakeview, Gentilly and the lakefront: switching under a permit, the line truck, the transformer vault and arc-flash labels."},
  {"id":"no-sw-uptown-park-grounds-yard","name":"Uptown Park Grounds Yard","kind":"park","position":[-1440,1120],"trades":["afscme","liuna","seiu"],"programmes":["grounds-and-landscaping"],"stations":["gk-irrigation-controller-valve-box-and-backflow-check","gk-chainsaw-start-and-limbing-on-the-ground","gk-hardscape-paver-base-and-compaction","gk-storm-cleanup-chipper-and-traffic-control"],"blurb":"A procedural park grounds yard in Garden District and Uptown: mowers, trimmers, tree work and the irrigation boxes."},
  {"id":"no-sw-lower-ninth-ward-park-grounds-yard","name":"Lower Ninth Ward Park Grounds Yard","kind":"park","position":[1120,440],"trades":["afscme","liuna","seiu"],"programmes":["grounds-and-landscaping"],"stations":["gk-hardscape-paver-base-and-compaction","gk-storm-cleanup-chipper-and-traffic-control","ed-playground-equipment-inspection","gk-ride-on-mower-pre-start-and-slope-work"],"blurb":"A procedural park grounds yard in Lower Ninth Ward and Holy Cross: mowers, trimmers, tree work and the irrigation boxes."},
  {"id":"no-sw-lakeview-and-gentilly-grocery-distribution-centre","name":"Lakeview and Gentilly Grocery Distribution Centre","kind":"warehouse","position":[-1260,-760],"trades":["ufcw","teamsters"],"programmes":["grocery-and-meatpacking"],"stations":["gr-checkstand-ergonomics-and-robbery-prevention","gr-produce-receiving-cold-chain-and-pallet-jack","gr-night-stocking-baler-and-compactor-lockout","gr-meat-dept-band-saw-and-grinder-lockout"],"blurb":"A procedural grocery distribution centre in Lakeview, Gentilly and the lakefront: cold-chain receiving, the baler, the meat room and the cold plant alarm."},
  {"id":"no-sw-mid-city-community-clinic","name":"Mid-City Community Clinic","kind":"hospital","position":[-1300,500],"trades":["nnu","seiu","afscme"],"programmes":["healthcare-support","first-responders"],"stations":["hc-patient-transport-and-safe-handling","hc-environmental-services-isolation-room-turnover","hc-linen-and-regulated-waste-handling","triage-point"],"blurb":"A procedural community clinic in Mid-City: patient transport, room turnover, regulated waste and the front desk."},
  {"id":"no-sw-algiers-park-grounds-yard","name":"Algiers Park Grounds Yard","kind":"park","position":[-140,1440],"trades":["afscme","liuna","seiu"],"programmes":["grounds-and-landscaping"],"stations":["gk-string-trimmer-and-blower-ppe-and-bystander-zone","gk-tree-work-pole-saw-and-drop-zone","gk-irrigation-controller-valve-box-and-backflow-check","gk-chainsaw-start-and-limbing-on-the-ground"],"blurb":"A procedural park grounds yard in Algiers: mowers, trimmers, tree work and the irrigation boxes."},
  {"id":"no-sw-treme-restaurant-kitchen","name":"Tremé Restaurant Kitchen","kind":"hospitality","position":[-440,200],"trades":["unite-here"],"programmes":["culinary-kitchen","bartending-course"],"stations":["grease-trap","hood-suppression","kitchen","knife-skills"],"blurb":"A procedural restaurant kitchen in Tremé: the line cooks, the dish pit, the walk-in and the bar well."},
  {"id":"no-sw-lakeview-and-gentilly-pumping-station","name":"Lakeview and Gentilly Pumping Station","kind":"pump","position":[180,-640],"trades":["iuoe","ibew","uwua","afscme"],"programmes":["water-and-gas-utility-crews","confined-space","electrical-first-period"],"stations":["valve-vault","cs-permit-entry-and-attendant-duties","motor-control-center","ut-night-storm-response-crew-and-portable-generator"],"blurb":"A procedural pumping station in Lakeview, Gentilly and the lakefront: the lift station, the valve vault under a permit, the motor controls and the storm generator."},
  {"id":"no-sw-industrial-canal-boat-repair-yard","name":"Industrial Canal Boat Repair Yard","kind":"shipyard","position":[900,40],"trades":["ibb","ironworkers","ua","iupat"],"programmes":["insulators-and-boilermakers","commercial-diving-and-scientific-scuba"],"stations":["shipyard-hotwork","ib-pressure-vessel-confined-entry-and-hot-work","tank-lining","cd-pier-piling-inspection-and-wrap-repair"],"blurb":"A procedural boat repair yard in the Inner Harbor along the Industrial Canal: hot work on the hull, tank lining, the piling divers and the boilermakers."},
  {"id":"no-sw-lower-ninth-ward-community-clinic","name":"Lower Ninth Ward Community Clinic","kind":"hospital","position":[1780,140],"trades":["nnu","seiu","afscme"],"programmes":["healthcare-support","first-responders"],"stations":["hc-hazardous-drug-spill-kit-response","hc-dietary-tray-line-and-allergy-flags","hc-code-response-support-and-crash-cart-check","hc-patient-transport-and-safe-handling"],"blurb":"A procedural community clinic in Lower Ninth Ward and Holy Cross: patient transport, room turnover, regulated waste and the front desk."},
  {"id":"no-sw-mid-city-recreation-centre","name":"Mid-City Recreation Centre","kind":"recreation","position":[-1180,-320],"trades":["afscme","seiu"],"programmes":["basketball-fundamentals","property-management"],"stations":["pm-pool-and-spa-chemistry","pm-community-room-and-events","ed-playground-equipment-inspection","bb-passing-and-catching"],"blurb":"A procedural recreation centre in Mid-City: the gym floor, the pool chemistry, the community room and the playground."},
  // sw:end
 ],
 "landmarks": [
  {
   "id": "jackson-square", "lm": "church-towers",
   "name": "Jackson Square",
   "position": [
    -297,
    568
   ],
   "kind": "square"
  },
  {
   "id": "french-quarter-riverfront",
   "name": "the French Quarter riverfront",
   "position": [
    -254,
    649
   ],
   "kind": "riverfront"
  },
  {
   "id": "algiers-point",
   "name": "Algiers Point",
   "position": [
    14,
    795
   ],
   "kind": "point"
  },
  {
   "id": "crescent-city-connection", "lm": "truss-bridge",
   "name": "Crescent City Connection",
   "position": [
    -212,
    1039
   ],
   "kind": "bridge"
  },
  {
   "id": "city-park",
   "name": "City Park",
   "position": [
    -1201,
    -649
   ],
   "kind": "park"
  },
  {
   "id": "audubon-park",
   "name": "Audubon Park",
   "position": [
    -2048,
    1525
   ],
   "kind": "park"
  },
  {
   "id": "louis-armstrong-park",
   "name": "Louis Armstrong Park",
   "position": [
    -466,
    422
   ],
   "kind": "park"
  },
  {
   "id": "bayou-st-john-mouth",
   "name": "the mouth of Bayou St. John",
   "position": [
    -777,
    -1590
   ],
   "kind": "bayou"
  },
  {
   "id": "lakefront",
   "name": "the lakefront",
   "position": [
    -494,
    -1688
   ],
   "kind": "shore"
  },
  {
   "id": "seventeenth-street-canal", "lm": "levee-pump-station",
   "name": "the Seventeenth Street Canal",
   "position": [
    -1977,
    -974
   ],
   "kind": "canal"
  },
  {
   "id": "london-avenue-canal", "lm": "levee-pump-station",
   "name": "the London Avenue Canal",
   "position": [
    -198,
    -1136
   ],
   "kind": "canal"
  },
  {
   "id": "industrial-canal-lock", "lm": "canal-lock",
   "name": "the Industrial Canal lock",
   "position": [
    692,
    552
   ],
   "kind": "lock"
  },
  {
   "id": "holy-cross-levee",
   "name": "the Holy Cross levee",
   "position": [
    1342,
    633
   ],
   "kind": "levee"
  },
  {
   "id": "bayou-bienvenue-platform", "lm": "marsh-boardwalk",
   "name": "the Bayou Bienvenue viewing platform",
   "position": [
    1144,
    -260
   ],
   "kind": "wetland"
  },
  {
   "id": "garden-district",
   "name": "the Garden District",
   "position": [
    -862,
    1217
   ],
   "kind": "neighbourhood"
  },
  {
   "id": "bywater", "lm": "shotgun-row",
   "name": "Bywater",
   "position": [
    466,
    406
   ],
   "kind": "neighbourhood"
  },
  {
   "id": "gentilly",
   "name": "Gentilly",
   "position": [
    -381,
    -714
   ],
   "kind": "neighbourhood"
  },
  {
   "id": "lakeview",
   "name": "Lakeview",
   "position": [
    -1624,
    -974
   ],
   "kind": "neighbourhood"
  }
 ],
 "connectors": [
  {
   "id": "conn-i10-17th-street-canal",
   "kind": "bridge",
   "name": "The interstate at the Seventeenth Street Canal",
   "from": {
    "parish": "orleans",
    "position": [
     -2048,
     -649
    ]
   },
   "to": {
    "parish": "jefferson",
    "position": [
     265,
     415
    ]
   },
   "lonlat": [
    -90.118,
    30
   ],
   "approximate": true
  },
  {
   "id": "conn-lakefront-17th-street-canal",
   "kind": "road",
   "name": "The lakefront road at the canal mouth",
   "from": {
    "parish": "orleans",
    "position": [
     -2020,
     -1363
    ]
   },
   "to": {
    "parish": "jefferson",
    "position": [
     193,
     180
    ]
   },
   "lonlat": [
    -90.124,
    30.017
   ],
   "approximate": true
  },
  {
   "id": "conn-westbank-expressway",
   "kind": "road",
   "name": "Westbank Expressway at the Orleans line",
   "from": {
    "parish": "orleans",
    "position": [
     268,
     2045
    ]
   },
   "to": {
    "parish": "jefferson",
    "position": [
     1144,
     1451
    ]
   },
   "lonlat": [
    -90.045,
    29.925
   ],
   "approximate": true
  },
  {
   "id": "conn-st-claude-avenue-east",
   "kind": "road",
   "name": "St. Claude Avenue at the Orleans line",
   "from": {
    "parish": "orleans",
    "position": [
     2048,
     325
    ]
   },
   "to": {
    "parish": "st-bernard",
    "position": [
     -1833,
     -581
    ]
   },
   "lonlat": [
    -89.997,
    29.962
   ],
   "approximate": true
  },
  {
   "id": "conn-chalmette-ferry",
   "kind": "ferry",
   "name": "Chalmette ferry across the river",
   "from": {
    "parish": "orleans",
    "position": [
     2048,
     795
    ]
   },
   "to": {
    "parish": "st-bernard",
    "position": [
     -1604,
     -415
    ]
   },
   "lonlat": [
    -89.978,
    29.95
   ],
   "approximate": true
  },
  {
   "id": "conn-twin-spans-east",
   "kind": "bridge",
   "name": "The interstate twin spans over the lake",
   "from": {
    "parish": "orleans",
    "position": [
     2040,
     -2040
    ]
   },
   "to": {
    "parish": "st-tammany",
    "position": [
     1297,
     1714
    ]
   },
   "lonlat": [
    -89.82,
    30.175
   ],
   "approximate": true
  },
  {
   "id": "conn-nd-french-quarter-canal",
   "kind": "road",
   "name": "Canal Street into the French Quarter and the CBD (zoom in)",
   "from": {
    "parish": "orleans",
    "position": [
     -664,
     558
    ]
   },
   "to": {
    "parish": "nola-french-quarter-cbd",
    "position": [
     -1150,
     -492
    ],
    "lonlat": [
     -90.076,
     29.9578
    ]
   },
   "lonlat": [
    -90.076,
    29.9578
   ],
   "approximate": true
  },
  {
   "id": "conn-nd-french-quarter-esplanade",
   "kind": "road",
   "name": "Esplanade Avenue into the French Quarter (zoom in)",
   "from": {
    "parish": "orleans",
    "position": [
     -268,
     364
    ]
   },
   "to": {
    "parish": "nola-french-quarter-cbd",
    "position": [
     1447,
     -1777
    ],
    "lonlat": [
     -90.062,
     29.9638
    ]
   },
   "lonlat": [
    -90.062,
    29.9638
   ],
   "approximate": true
  },
  {
   "id": "conn-nd-uptown-st-charles",
   "kind": "road",
   "name": "St. Charles Avenue into the Garden District and Uptown (zoom in)",
   "from": {
    "parish": "orleans",
    "position": [
     -1624,
     1509
    ]
   },
   "to": {
    "parish": "nola-uptown-garden",
    "position": [
     -1126,
     37
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
   "id": "conn-nd-uptown-claiborne",
   "kind": "road",
   "name": "South Claiborne Avenue into Uptown (zoom in)",
   "from": {
    "parish": "orleans",
    "position": [
     -1059,
     1071
    ]
   },
   "to": {
    "parish": "nola-uptown-garden",
    "position": [
     1018,
     -1633
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
  },
  {
   "id": "conn-nd-mid-city-carrollton",
   "kind": "road",
   "name": "North Carrollton Avenue into Mid-City and City Park (zoom in)",
   "from": {
    "parish": "orleans",
    "position": [
     -1271,
     -146
    ]
   },
   "to": {
    "parish": "nola-mid-city-gentilly",
    "position": [
     -450,
     1039
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
   "id": "conn-nd-mid-city-gentilly",
   "kind": "road",
   "name": "Gentilly Boulevard into Gentilly (zoom in)",
   "from": {
    "parish": "orleans",
    "position": [
     -438,
     -688
    ]
   },
   "to": {
    "parish": "nola-mid-city-gentilly",
    "position": [
     1446,
     -200
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
   "id": "conn-nd-bywater-st-claude",
   "kind": "road",
   "name": "St. Claude Avenue into the Bywater (zoom in)",
   "from": {
    "parish": "orleans",
    "position": [
     551,
     279
    ]
   },
   "to": {
    "parish": "nola-bywater-lower-ninth",
    "position": [
     -88,
     -303
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
   "id": "conn-nd-lower-ninth-claiborne",
   "kind": "road",
   "name": "North Claiborne Avenue into the Lower Ninth Ward (zoom in)",
   "from": {
    "parish": "orleans",
    "position": [
     1059,
     195
    ]
   },
   "to": {
    "parish": "nola-bywater-lower-ninth",
    "position": [
     1301,
     -534
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
   "id": "np-orleans-fl-levee-cross-section",
   "title": "Why a Levee Is Wide at the Bottom",
   "site": "levee-floodwall",
   "landmark": "bywater",
   "k12": "k12-slope-and-angles-on-a-ramp",
   "trade": "Levee and floodwall crews",
   "tradeLine": "A levee crew grades the batter to the plan so the slope stays gentle enough to mow, walk and hold.",
   "minutes": 3,
   "steps": [
    "Stand at the foot of the levee and look up the slope to the crown.",
    "The slope is how far up for each step along; a gentle slope needs a wide base.",
    "The crew keeps the slope to the plan because a steep bank slumps when it is wet."
   ],
   "check": {
    "q": "Why is the levee so much wider at its base than at its crown?",
    "options": [
     "A gentle slope needs a wide base",
     "Wide bases look tidier",
     "Trucks need room to turn"
    ],
    "answer": 0,
    "why": "Rise over run: to keep the climb gentle, the base has to be wide."
   }
  },
  {
   "id": "np-orleans-fl-pump-lifts-water",
   "title": "A Pump Lifts Rain Over the Wall",
   "site": "pumping-station",
   "landmark": "seventeenth-street-canal",
   "k12": "k12-water-cycle-and-filtration",
   "trade": "Pumping station operators",
   "tradeLine": "The station operator watches the canal level and starts pumps in the order the plan sets, so the water goes up and out.",
   "minutes": 3,
   "steps": [
    "Rain that falls on the streets runs into the drains and then into this canal.",
    "The city sits low, so the water cannot flow to the lake on its own.",
    "The pumps lift it over the floodwall; the operator follows the plan for which pump starts first."
   ],
   "check": {
    "q": "Why does the rain need a pump to reach the lake?",
    "options": [
     "The lake is too far away",
     "The city sits lower than the lake",
     "Pumps clean the water"
    ],
    "answer": 1,
    "why": "Water flows downhill; here the streets are below the lake, so a pump has to lift it."
   }
  },
  {
   "id": "np-orleans-fl-map-of-the-crescent",
   "title": "Reading the Bend on a Map",
   "site": "ferry-landing",
   "landmark": "algiers-point",
   "k12": "k12-reading-a-map-scale-in-bay-world",
   "trade": "Ferry deck crews",
   "tradeLine": "A deckhand reads the river's bend on the chart to know where the current sets the boat on the crossing.",
   "minutes": 2,
   "steps": [
    "Open the map and find the river's big bend around the city.",
    "The scale bar tells you how far the ferry really crosses.",
    "Compare the crossing with the walk from the landing to the square."
   ],
   "check": {
    "q": "What does the scale bar on the map let you work out?",
    "options": [
     "The colour of the water",
     "The real distance of the crossing",
     "The time of day"
    ],
    "answer": 1,
    "why": "A scale bar turns a length on the map into a distance on the ground."
   }
  },
  {
   "id": "np-orleans-fl-crane-lever",
   "title": "The Wharf Crane Is a Lever",
   "site": "port-terminal",
   "landmark": "garden-district",
   "k12": "k12-simple-machines-at-a-crane",
   "trade": "Longshore crane operators",
   "tradeLine": "The crane operator reads the load chart before every lift, because a load further out turns the crane harder.",
   "minutes": 3,
   "steps": [
    "Look at the gantry cranes along the wharf.",
    "A load hanging further out has a bigger turning effect on the crane.",
    "So the chart allows less weight at long reach, and the operator checks it first."
   ],
   "check": {
    "q": "A container hangs further out on the boom. What does the chart allow?",
    "options": [
     "More weight",
     "Less weight",
     "The same weight"
    ],
    "answer": 1,
    "why": "Further out means a bigger turning effect, so the chart allows less."
   }
  },
  {
   "id": "np-orleans-fl-wetland-buffer",
   "title": "A Marsh Slows the Water",
   "site": "wetland-restoration",
   "landmark": "bayou-bienvenue-platform",
   "k12": "k12-ecosystems-at-the-kelp-transect",
   "trade": "Wetland restoration crews",
   "tradeLine": "A restoration crew plants the marsh grasses in rows the plan sets, because rooted plants hold the mud and slow a surge.",
   "minutes": 3,
   "steps": [
    "Look out from the platform over the open water and the planted marsh.",
    "Rooted grasses hold the mud and slow moving water.",
    "The crew plants and counts them so the marsh grows back where it was lost."
   ],
   "check": {
    "q": "How does a planted marsh protect the neighbourhood behind it?",
    "options": [
     "Its roots hold the mud and slow the water",
     "It makes the water deeper",
     "It keeps boats away"
    ],
    "answer": 0,
    "why": "Rooted plants hold sediment and take energy out of moving water."
   }
  },
  {
   "id": "np-orleans-fl-weather-on-the-lake",
   "title": "Watching the Sky Over the Lake",
   "site": "lakefront-levee",
   "landmark": "lakefront",
   "k12": "k12-weather-and-the-sky",
   "trade": "Levee and seawall crews",
   "tradeLine": "A seawall crew stops work when the plan's wind and lightning limits are reached, and reads the sky before the radio says so.",
   "minutes": 2,
   "steps": [
    "Look north over the lake at the clouds and the wind on the water.",
    "Tall dark clouds and a sudden gust mean a storm is building.",
    "The crew's plan says when to leave the wall; they watch the sky to be ready."
   ],
   "check": {
    "q": "What sign on the lake tells a crew a storm is near?",
    "options": [
     "Flat calm water all day",
     "Tall dark clouds and a sudden gust",
     "A lighter blue sky"
    ],
    "answer": 1,
    "why": "Building clouds and gusts are the sky's warning before the rain arrives."
   }
  }
 ],
 "gated": [
  {
   "id": "np-orleans-gated-floodwall-walk",
   "kind": "side-quest",
   "title": "Floodwall Walk at Dawn",
   "world": "parishes",
   "parish": "orleans",
   "site": "levee-floodwall",
   "siteName": "River Levee and Floodwall Crew",
   "gate": {
    "stations": [
     "br-levee-inspection-and-seepage"
    ],
    "note": "Walk the levee inspection before you join the floodwall crew at dawn"
   }
  },
  {
   "id": "np-orleans-gated-storm-pump-start",
   "kind": "side-quest",
   "title": "Storm Night Pump Start",
   "world": "parishes",
   "parish": "orleans",
   "site": "pumping-station",
   "siteName": "Drainage Pumping Station",
   "gate": {
    "stations": [
     "lift-station",
     "ut-night-storm-response-crew-and-portable-generator"
    ],
    "note": "The lift station and the storm response crew come before a night pump start"
   }
  }
 ]
};
