// The French Quarter, the CBD & the Riverfront — one 4096 m streamed New Orleans neighbourhood district on the shared parish schema
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

export const NP_NOLA_FRENCH_QUARTER_CBD = {
 "id": "nola-french-quarter-cbd",
 "name": "The French Quarter, the CBD & the Riverfront",
 "region": "new-orleans-districts",
 "parent": "orleans",
 "size": 4096,
 "scale": 0.52,
 "blurb": "New Orleans's old heart on foot: the French Quarter's galleried streets between Canal Street and Esplanade, Jackson Square on the river, the CBD's towers and the edge of the Warehouse District, with the riverfront's wharves and floodwall. The site layouts are illustrative; the streets, the river and the squares are real.",
 "start": "nfq-workforce-centre",
 "anchors": [
  {
   "xz": [
    1261,
    -535
   ],
   "lonlat": [
    -90.063,
    29.958
   ],
   "approximate": true,
   "name": "Jackson Square"
  },
  {
   "xz": [
    -223,
    1391
   ],
   "lonlat": [
    -90.071,
    29.949
   ],
   "approximate": true,
   "name": "Lafayette Square"
  },
  {
   "xz": [
    334,
    -1391
   ],
   "lonlat": [
    -90.068,
    29.962
   ],
   "approximate": true,
   "name": "Louis Armstrong Park"
  },
  {
   "xz": [
    1076,
    963
   ],
   "lonlat": [
    -90.064,
    29.951
   ],
   "approximate": true,
   "name": "the foot of Canal Street"
  },
  {
   "xz": [
    1632,
    -1177
   ],
   "lonlat": [
    -90.061,
    29.961
   ],
   "approximate": true,
   "name": "the French Market"
  },
  {
   "xz": [
    -1335,
    535
   ],
   "lonlat": [
    -90.077,
    29.953
   ],
   "approximate": true,
   "name": "Duncan Plaza"
  },
  {
   "xz": [
    -408,
    107
   ],
   "lonlat": [
    -90.072,
    29.955
   ],
   "approximate": true,
   "name": "the corner of Canal and Rampart"
  }
 ],
 "water": [
  {
   "id": "mississippi-river",
   "name": "the Mississippi River",
   "kind": "river",
   "width": 1192,
   "poly": [
    [
     1827,
     2019
    ],
    [
     1864,
     1864
    ],
    [
     1901,
     1709
    ],
    [
     1938,
     1555
    ],
    [
     1975,
     1400
    ],
    [
     2015,
     1247
    ],
    [
     2026,
     1210
    ]
   ]
  },
  {
   "id": "armstrong-park-lagoon-north",
   "name": "the lagoon in Louis Armstrong Park, north arm",
   "kind": "lake",
   "poly": [
    [
     148,
     -1434
    ],
    [
     408,
     -1541
    ],
    [
     501,
     -1391
    ],
    [
     223,
     -1284
    ]
   ]
  },
  {
   "id": "armstrong-park-lagoon-south",
   "name": "the lagoon in Louis Armstrong Park, south arm",
   "kind": "lake",
   "poly": [
    [
     260,
     -1199
    ],
    [
     482,
     -1284
    ],
    [
     575,
     -1156
    ],
    [
     334,
     -1070
    ]
   ]
  }
 ],
 "levees": [
  {
   "id": "riverfront-floodwall",
   "name": "the riverfront floodwall",
   "height": 4,
   "pts": [
    [
     1696,
     1988
    ],
    [
     1733,
     1833
    ],
    [
     1770,
     1678
    ],
    [
     1807,
     1524
    ],
    [
     1844,
     1367
    ],
    [
     1885,
     1212
    ],
    [
     1897,
     1172
    ]
   ]
  },
  {
   "id": "french-market-floodwall",
   "name": "the floodwall behind the French Market",
   "height": 4,
   "pts": [
    [
     1595,
     -428
    ],
    [
     1659,
     -569
    ],
    [
     1722,
     -710
    ],
    [
     1786,
     -851
    ],
    [
     1851,
     -987
    ],
    [
     1917,
     -1120
    ],
    [
     1966,
     -1220
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
     983,
     921
    ],
    [
     849,
     842
    ],
    [
     716,
     763
    ],
    [
     582,
     684
    ],
    [
     449,
     605
    ],
    [
     315,
     527
    ],
    [
     181,
     448
    ],
    [
     52,
     362
    ],
    [
     -76,
     273
    ],
    [
     -204,
     184
    ],
    [
     -331,
     96
    ],
    [
     -459,
     7
    ],
    [
     -587,
     -81
    ],
    [
     -715,
     -170
    ],
    [
     -843,
     -258
    ],
    [
     -971,
     -347
    ],
    [
     -1099,
     -435
    ],
    [
     -1227,
     -524
    ],
    [
     -1354,
     -612
    ],
    [
     -1482,
     -701
    ],
    [
     -1610,
     -790
    ],
    [
     -1740,
     -875
    ],
    [
     -1875,
     -953
    ],
    [
     -2010,
     -1031
    ]
   ]
  },
  {
   "id": "decatur-street",
   "name": "Decatur Street",
   "kind": "street",
   "pts": [
    [
     853,
     535
    ],
    [
     931,
     400
    ],
    [
     1009,
     265
    ],
    [
     1087,
     130
    ],
    [
     1165,
     -6
    ],
    [
     1241,
     -143
    ],
    [
     1311,
     -285
    ],
    [
     1380,
     -428
    ],
    [
     1449,
     -571
    ],
    [
     1519,
     -710
    ],
    [
     1589,
     -845
    ],
    [
     1660,
     -980
    ],
    [
     1730,
     -1115
    ],
    [
     1800,
     -1250
    ],
    [
     1818,
     -1284
    ]
   ]
  },
  {
   "id": "bourbon-street",
   "name": "Bourbon Street",
   "kind": "street",
   "pts": [
    [
     148,
     214
    ],
    [
     230,
     86
    ],
    [
     311,
     -43
    ],
    [
     393,
     -171
    ],
    [
     474,
     -300
    ],
    [
     556,
     -428
    ],
    [
     641,
     -556
    ],
    [
     727,
     -685
    ],
    [
     812,
     -813
    ],
    [
     898,
     -942
    ],
    [
     983,
     -1070
    ],
    [
     1065,
     -1198
    ],
    [
     1148,
     -1327
    ],
    [
     1230,
     -1455
    ],
    [
     1313,
     -1584
    ],
    [
     1354,
     -1648
    ]
   ]
  },
  {
   "id": "north-rampart-street",
   "name": "North Rampart Street",
   "kind": "street",
   "pts": [
    [
     -408,
     -150
    ],
    [
     -326,
     -283
    ],
    [
     -245,
     -415
    ],
    [
     -163,
     -548
    ],
    [
     -82,
     -680
    ],
    [
     0,
     -813
    ],
    [
     81,
     -944
    ],
    [
     163,
     -1074
    ],
    [
     244,
     -1205
    ],
    [
     325,
     -1336
    ],
    [
     407,
     -1466
    ],
    [
     486,
     -1600
    ],
    [
     564,
     -1736
    ],
    [
     642,
     -1871
    ],
    [
     720,
     -2006
    ]
   ]
  },
  {
   "id": "poydras-street",
   "name": "Poydras Street",
   "kind": "avenue",
   "pts": [
    [
     927,
     1563
    ],
    [
     773,
     1542
    ],
    [
     619,
     1522
    ],
    [
     464,
     1501
    ],
    [
     310,
     1480
    ],
    [
     156,
     1460
    ],
    [
     2,
     1439
    ],
    [
     -152,
     1418
    ],
    [
     -306,
     1398
    ],
    [
     -459,
     1377
    ],
    [
     -613,
     1356
    ],
    [
     -766,
     1336
    ],
    [
     -920,
     1315
    ],
    [
     -1073,
     1294
    ],
    [
     -1226,
     1268
    ],
    [
     -1377,
     1236
    ],
    [
     -1528,
     1205
    ],
    [
     -1679,
     1173
    ],
    [
     -1830,
     1141
    ],
    [
     -1981,
     1110
    ],
    [
     -2019,
     1102
    ]
   ]
  },
  {
   "id": "st-charles-avenue",
   "name": "St. Charles Avenue and its streetcar",
   "kind": "street",
   "pts": [
    [
     56,
     150
    ],
    [
     27,
     307
    ],
    [
     -2,
     464
    ],
    [
     -31,
     621
    ],
    [
     -60,
     778
    ],
    [
     -89,
     931
    ],
    [
     -119,
     1081
    ],
    [
     -148,
     1231
    ],
    [
     -178,
     1381
    ],
    [
     -208,
     1531
    ],
    [
     -238,
     1681
    ],
    [
     -267,
     1831
    ],
    [
     -297,
     1981
    ],
    [
     -304,
     2018
    ]
   ]
  },
  {
   "id": "riverfront-streetcar",
   "name": "the riverfront streetcar line",
   "kind": "street",
   "pts": [
    [
     1547,
     1952
    ],
    [
     1584,
     1797
    ],
    [
     1621,
     1642
    ],
    [
     1658,
     1488
    ],
    [
     1696,
     1330
    ],
    [
     1737,
     1172
    ],
    [
     1750,
     1128
    ]
   ]
  },
  {
   "id": "claiborne-interstate",
   "name": "the interstate over Claiborne Avenue",
   "kind": "interstate",
   "pts": [
    [
     -2011,
     -395
    ],
    [
     -1894,
     -500
    ],
    [
     -1778,
     -605
    ],
    [
     -1661,
     -710
    ],
    [
     -1545,
     -816
    ],
    [
     -1428,
     -921
    ],
    [
     -1329,
     -1041
    ],
    [
     -1230,
     -1161
    ],
    [
     -1131,
     -1281
    ],
    [
     -1032,
     -1400
    ],
    [
     -933,
     -1520
    ],
    [
     -834,
     -1640
    ],
    [
     -735,
     -1760
    ],
    [
     -639,
     -1879
    ],
    [
     -544,
     -1998
    ],
    [
     -520,
     -2028
    ]
   ]
  },
  {
   "id": "esplanade-avenue",
   "name": "Esplanade Avenue",
   "kind": "avenue",
   "pts": [
    [
     2003,
     -1220
    ],
    [
     1897,
     -1330
    ],
    [
     1791,
     -1441
    ],
    [
     1685,
     -1551
    ],
    [
     1574,
     -1659
    ],
    [
     1458,
     -1766
    ],
    [
     1343,
     -1873
    ],
    [
     1227,
     -1980
    ],
    [
     1169,
     -2034
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "french-quarter",
   "name": "the French Quarter",
   "character": "quarter",
   "poly": [
    [
     -37,
     -2048
    ],
    [
     1966,
     -2048
    ],
    [
     1966,
     0
    ],
    [
     -37,
     0
    ]
   ]
  },
  {
   "id": "cbd",
   "name": "the Central Business District",
   "character": "downtown",
   "poly": [
    [
     -2040,
     -107
    ],
    [
     890,
     -107
    ],
    [
     890,
     1606
    ],
    [
     -2040,
     1606
    ]
   ]
  },
  {
   "id": "warehouse-district",
   "name": "the edge of the Warehouse District",
   "character": "industrial",
   "poly": [
    [
     -779,
     1563
    ],
    [
     798,
     1563
    ],
    [
     798,
     2048
    ],
    [
     -779,
     2048
    ]
   ]
  },
  {
   "id": "treme-edge",
   "name": "the edge of Tremé",
   "character": "garden",
   "poly": [
    [
     -2040,
     -2048
    ],
    [
     148,
     -2048
    ],
    [
     148,
     -642
    ],
    [
     -2040,
     -642
    ]
   ]
  },
  {
   "id": "riverfront",
   "name": "the riverfront",
   "character": "port",
   "poly": [
    [
     705,
     321
    ],
    [
     2040,
     321
    ],
    [
     2040,
     2048
    ],
    [
     705,
     2048
    ]
   ]
  },
  {
   "id": "superdome-edge",
   "name": "the Poydras corridor",
   "character": "downtown",
   "poly": [
    [
     -2040,
     1606
    ],
    [
     -779,
     1606
    ],
    [
     -779,
     2048
    ],
    [
     -2040,
     2048
    ]
   ]
  }
 ],
 "sites": [
  {
   "id": "nfq-workforce-centre",
   "name": "the French Quarter Trades Workforce Centre",
   "kind": "construction",
   "position": [
    -686,
    535
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
   "blurb": "A workforce centre off Canal Street where crews sign in, brief and are matched to the Quarter's restoration and the CBD's building work."
  },
  {
   "id": "nfq-balcony-restoration",
   "name": "a French Quarter Gallery and Balcony Restoration",
   "kind": "construction",
   "position": [
    798,
    -535
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
   "blurb": "A galleried building on a Quarter street under repair: scaffold on a narrow sidewalk, silica control on old brick, lime plaster and a roof tear-off."
  },
  {
   "id": "nfq-masonry-repointing",
   "name": "a Quarter Masonry Repointing Crew",
   "kind": "construction",
   "position": [
    1076,
    -1284
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
   "blurb": "Old soft brick repointed by hand: the scaffold, the dust control and the painter's lifeline."
  },
  {
   "id": "nfq-french-market-shed-repair",
   "name": "the French Market Shed Repair",
   "kind": "market",
   "position": [
    1595,
    -878
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
   "blurb": "The market's long sheds under roof repair above the stalls: the tear-off chute, guarded hatches and lifelines."
  },
  {
   "id": "nfq-canal-streetcar-track",
   "name": "the Canal Street Streetcar Track Crew",
   "kind": "streetcar",
   "position": [
    -260,
    257
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
   "blurb": "Track work on the Canal Street line between the traffic lanes: roadway worker protection, the switch and the crossing signals."
  },
  {
   "id": "nfq-riverfront-streetcar-track",
   "name": "the Riverfront Streetcar Track Crew",
   "kind": "streetcar",
   "position": [
    890,
    1177
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
   "blurb": "The riverfront line along the floodwall: flagging the crossings and keeping the switches clean."
  },
  {
   "id": "nfq-drainage-line-replacement",
   "name": "a Quarter Drainage Line Replacement",
   "kind": "stormwater",
   "position": [
    334,
    -963
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
   "blurb": "An old drain line replaced under a Quarter street: the trench box, the manhole's air check and the storm call-out."
  },
  {
   "id": "nfq-riverfront-floodwall-gate",
   "name": "the Riverfront Floodwall Gate Crew",
   "kind": "floodgate",
   "position": [
    1224,
    214
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
   "blurb": "A gate in the riverfront floodwall: the closing drill, the seepage walk and the batture's debris."
  },
  {
   "id": "nfq-hotel-kitchen",
   "name": "a Quarter Hotel Kitchen",
   "kind": "hospitality",
   "position": [
    556,
    0
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
   "blurb": "A hotel kitchen off Bourbon Street: the gas shut-off, the fryer oil change, the dish pit and the slicer lockout."
  },
  {
   "id": "nfq-hotel-facade",
   "name": "a CBD Hotel Service Floor",
   "kind": "hotel",
   "position": [
    -872,
    963
   ],
   "trades": [
    "unite-here",
    "seiu"
   ],
   "programmes": [
    "hotel-workers",
    "culinary-kitchen"
   ],
   "stations": [
    "housekeeping-room-turn",
    "hw-housekeeping-cart-and-chemical-safety",
    "hw-banquet-room-flip-and-staging",
    "laundry-plant-chemicals"
   ],
   "blurb": "A tall hotel's service floors: room turns, the housekeeping cart, banquet flips and the laundry chemicals."
  },
  {
   "id": "nfq-restaurant-row",
   "name": "a Restaurant Row on Decatur Street",
   "kind": "hospitality",
   "position": [
    1298,
    -749
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
   "blurb": "Kitchens and bars facing the river: the line, the hood, the bar well and the grease trap."
  },
  {
   "id": "nfq-river-wharf-crew",
   "name": "a Riverfront Wharf Crew",
   "kind": "port",
   "position": [
    1169,
    1713
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
   "blurb": "A working wharf below the CBD: the crane, the lashing gear, the lines and the gangway."
  },
  {
   "id": "nfq-ferry-landing",
   "name": "the Canal Street Ferry Landing Crew",
   "kind": "ferry",
   "position": [
    1076,
    856
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
   "blurb": "The landing at the foot of Canal Street for the ferry across to Algiers: the gangway, passengers and a man-overboard drill."
  },
  {
   "id": "nfq-high-rise-build",
   "name": "a CBD High-Rise Build",
   "kind": "construction",
   "position": [
    -1335,
    1606
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
   "blurb": "A tower going up off Poydras Street: the pour, the shoring and rebar caps on every bar."
  },
  {
   "id": "nfq-water-main",
   "name": "a CBD Water Main Crew",
   "kind": "utility",
   "position": [
    -1521,
    214
   ],
   "trades": [
    "uwua",
    "iuoe",
    "afscme"
   ],
   "programmes": [
    "water-and-gas-utility-crews",
    "confined-space"
   ],
   "stations": [
    "valve-vault",
    "cs-permit-entry-and-attendant-duties",
    "ut-water-treatment-chemical-delivery-unloading",
    "lift-station"
   ],
   "blurb": "A water main and its valve vault under a CBD street: the permit entry, the chemical delivery and the lift station."
  },
  {
   "id": "nfq-electrical-vault",
   "name": "a CBD Electrical Vault Crew",
   "kind": "substation",
   "position": [
    -408,
    1177
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
   "blurb": "An underground vault feeding the towers: switching, the transformer vault and the line truck."
  },
  {
   "id": "nfq-street-and-sidewalk-crew",
   "name": "a Quarter Street and Sidewalk Crew",
   "kind": "construction",
   "position": [
    148,
    -1606
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
   "blurb": "A street rebuilt block by block: the grade and crown, the compactor, the pour and traffic kept moving."
  },
  {
   "id": "nfq-fire-station",
   "name": "a French Quarter Fire Station",
   "kind": "fire-station",
   "position": [
    -37,
    -749
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
   "blurb": "A firehouse by the Quarter: size-up on narrow streets under galleries, the aerial ladder and rehab after a long call."
  },
  {
   "id": "nfq-arena-rigging",
   "name": "a CBD Arena Rigging Crew",
   "kind": "stadium",
   "position": [
    -1799,
    749
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
    "chain-hoist"
   ],
   "blurb": "The arena crew at the CBD's edge: the rigging points, the followspots, the barricade and show power."
  }
 ],
 "landmarks": [
  {
   "id": "jackson-square",
   "name": "Jackson Square",
   "position": [
    1261,
    -428
   ],
   "kind": "square",
   "lm": "church-towers"
  },
  {
   "id": "st-louis-cathedral",
   "name": "St. Louis Cathedral",
   "position": [
    1131,
    -535
   ],
   "kind": "church"
  },
  {
   "id": "canal-street-streetcar",
   "name": "a streetcar on Canal Street",
   "position": [
    -37,
    321
   ],
   "kind": "place",
   "lm": "streetcar"
  },
  {
   "id": "armstrong-park-arch",
   "name": "the arch at Louis Armstrong Park",
   "position": [
    278,
    -963
   ],
   "kind": "park",
   "lm": "gateway-arch"
  },
  {
   "id": "riverfront-floodwall-gate",
   "name": "a riverfront floodwall gate",
   "position": [
    1298,
    428
   ],
   "kind": "levee",
   "lm": "tide-gate"
  },
  {
   "id": "french-market",
   "name": "the French Market",
   "position": [
    1706,
    -1006
   ],
   "kind": "market"
  },
  {
   "id": "lafayette-square",
   "name": "Lafayette Square",
   "position": [
    -223,
    1391
   ],
   "kind": "park"
  },
  {
   "id": "nfq-sign",
   "name": "a sign: the site layouts are illustrative; the streets, the river and the squares are real",
   "position": [
    -501,
    642
   ],
   "kind": "sign"
  }
 ],
 "connectors": [
  {
   "id": "nd-fq-orleans-canal",
   "kind": "road",
   "name": "Canal Street out to the whole of New Orleans",
   "from": {
    "parish": "nola-french-quarter-cbd",
    "position": [
     -1150,
     -492
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     -664,
     558
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
   "id": "nd-fq-orleans-esplanade",
   "kind": "road",
   "name": "Esplanade Avenue out to the whole of New Orleans",
   "from": {
    "parish": "nola-french-quarter-cbd",
    "position": [
     1447,
     -1777
    ]
   },
   "to": {
    "parish": "orleans",
    "position": [
     -268,
     364
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
   "id": "nd-fq-uptown-st-charles",
   "kind": "road",
   "name": "St. Charles Avenue up to the Garden District and Uptown",
   "from": {
    "parish": "nola-french-quarter-cbd",
    "position": [
     -334,
     1862
    ]
   },
   "to": {
    "parish": "nola-uptown-garden",
    "position": [
     1983,
     -1138
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
   "id": "nd-fq-mid-city-canal",
   "kind": "road",
   "name": "Canal Street out to Mid-City",
   "from": {
    "parish": "nola-french-quarter-cbd",
    "position": [
     -1799,
     -921
    ]
   },
   "to": {
    "parish": "nola-mid-city-gentilly",
    "position": [
     161,
     1930
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
   "id": "nd-fq-bywater-esplanade",
   "kind": "road",
   "name": "Across Esplanade Avenue into the Marigny",
   "from": {
    "parish": "nola-french-quarter-cbd",
    "position": [
     1781,
     -1434
    ]
   },
   "to": {
    "parish": "nola-bywater-lower-ninth",
    "position": [
     -1940,
     -89
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
  }
 ],
 "fieldLessons": [
  {
   "id": "nd-fl-balcony-scaffold",
   "title": "Why a Scaffold Needs a Covered Walkway",
   "site": "nfq-balcony-restoration",
   "landmark": "jackson-square",
   "k12": "k12-reading-instructions-and-safety-labels",
   "station": "scaffold-erection",
   "trade": "Restoration carpenters",
   "tradeLine": "A restoration crew builds its scaffold with a covered walkway so people on the narrow sidewalk stay safe underneath.",
   "minutes": 3,
   "steps": [
    "Look up at the old gallery wrapped in scaffold.",
    "Under it there is a covered walkway for people passing by.",
    "Tools and bits of plaster cannot fall on anyone below."
   ],
   "check": {
    "q": "Why does the scaffold have a covered walkway?",
    "options": [
     "So falling things cannot hit people walking by",
     "So the painters can nap",
     "So the street looks newer"
    ],
    "answer": 0,
    "why": "Overhead protection keeps the public safe while the crew works above the sidewalk."
   }
  },
  {
   "id": "nd-fl-floodwall-gate",
   "title": "A Gate in the Floodwall",
   "site": "nfq-riverfront-floodwall-gate",
   "landmark": "riverfront-floodwall-gate",
   "k12": "k12-reading-instructions-and-safety-labels",
   "station": "br-levee-inspection-and-seepage",
   "trade": "Levee and floodwall crews",
   "tradeLine": "A floodwall crew practises closing the gates before high water and walks the wall looking for seeping water.",
   "minutes": 3,
   "steps": [
    "Find the wide gate in the wall by the river.",
    "When the river rises, the crew closes it so the wall has no gap.",
    "They walk the wall and look for water seeping through."
   ],
   "check": {
    "q": "When does the crew close the gate?",
    "options": [
     "When the river rises high",
     "Every lunchtime",
     "Only when it is sunny"
    ],
    "answer": 0,
    "why": "Closing the gate before high water keeps the river out of the streets."
   }
  },
  {
   "id": "nd-fl-streetcar-track",
   "title": "Working Beside a Streetcar Line",
   "site": "nfq-canal-streetcar-track",
   "landmark": "canal-street-streetcar",
   "k12": "k12-reading-instructions-and-safety-labels",
   "station": "ra-roadway-worker-protection-and-job-briefing",
   "trade": "Track crews",
   "tradeLine": "A track crew holds a short briefing and posts a lookout before anyone steps between the rails.",
   "minutes": 2,
   "steps": [
    "Watch the crew gather before they start.",
    "They agree who watches for streetcars and how to warn everyone.",
    "Only then does anyone step onto the track."
   ],
   "check": {
    "q": "What happens before the crew steps onto the track?",
    "options": [
     "A briefing and a lookout",
     "A race to the corner",
     "Nothing at all"
    ],
    "answer": 0,
    "why": "A briefing and a lookout mean everyone knows a streetcar is coming in time to clear."
   }
  }
 ],
 "gated": [
  {
   "id": "nd-fq-gated-gallery-rail",
   "kind": "side-quest",
   "title": "Rebuild a Gallery Railing",
   "site": "nfq-balcony-restoration",
   "siteName": "a French Quarter Gallery and Balcony Restoration",
   "gate": {
    "stations": [
     "scaffold-erection"
    ],
    "note": "Learn to build and inspect a scaffold before you work on the gallery above the street"
   },
   "world": "parishes",
   "parish": "nola-french-quarter-cbd",
   "summary": "Rebuild a Gallery Railing"
  },
  {
   "id": "nd-fq-gated-gate-drill",
   "kind": "side-quest",
   "title": "Close the Floodwall Gate",
   "site": "nfq-riverfront-floodwall-gate",
   "siteName": "the Riverfront Floodwall Gate Crew",
   "gate": {
    "stations": [
     "br-levee-inspection-and-seepage"
    ],
    "note": "Learn to inspect a levee and spot seepage before you join the gate closing drill"
   },
   "world": "parishes",
   "parish": "nola-french-quarter-cbd",
   "summary": "Close the Floodwall Gate"
  }
 ]
};
