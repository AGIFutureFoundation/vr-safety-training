// Marina & Presidio — one 4096 m streamed San Francisco district on the shared parish
// schema (docs/parishes.md, docs/consoles/GOLDEN-B.md), region "san-francisco".
//
// Facts rule: real places appear only by their public names, as places (a
// district, a neighbourhood, a park, a bridge, a creek, a shipyard, a port);
// no history, dates, statistics, addresses, business or venue-sponsor names.
// Coordinates are approximate (three decimals, `approximate: true`) and exist
// only to place a map: the district is drawn at a stylised scale (about one
// world metre to two real metres) so the harbour, the Presidio, Crissy Field and the bridge's south end fit one field. Nothing here is
// survey data and no real building is modelled. `hills` are gentle
// procedural mounds, named only (no height is quoted).
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

export const NP_SF_MARINA = {
 "id": "sf-marina",
 "name": "Marina & Presidio",
 "region": "san-francisco",
 "size": 4096,
 "blurb": "San Francisco's north shore at the Golden Gate: the yacht harbour and the green along the Marina, the Presidio's forest and parade ground, the marsh and the rescue station at Crissy Field, and the bridge north.",
 "start": "marina-harbour",
 "anchors": [
  {
   "xz": [
    386,
    -432
   ],
   "lonlat": [
    -122.441,
    37.806
   ],
   "approximate": true,
   "name": "the Marina yacht harbour"
  },
  {
   "xz": [
    86,
    -270
   ],
   "lonlat": [
    -122.448,
    37.803
   ],
   "approximate": true,
   "name": "the Palace of Fine Arts"
  },
  {
   "xz": [
    -1159,
    -647
   ],
   "lonlat": [
    -122.477,
    37.81
   ],
   "approximate": true,
   "name": "Fort Point"
  },
  {
   "xz": [
    -386,
    -54
   ],
   "lonlat": [
    -122.459,
    37.799
   ],
   "approximate": true,
   "name": "the Presidio's Main Post"
  },
  {
   "xz": [
    815,
    -432
   ],
   "lonlat": [
    -122.431,
    37.806
   ],
   "approximate": true,
   "name": "Fort Mason"
  },
  {
   "xz": [
    -1416,
    216
   ],
   "lonlat": [
    -122.483,
    37.794
   ],
   "approximate": true,
   "name": "Baker Beach"
  },
  {
   "xz": [
    944,
    378
   ],
   "lonlat": [
    -122.428,
    37.791
   ],
   "approximate": true,
   "name": "Lafayette Park"
  },
  {
   "xz": [
    -815,
    539
   ],
   "lonlat": [
    -122.469,
    37.788
   ],
   "approximate": true,
   "name": "Mountain Lake"
  }
 ],
 "hills": [
  {
   "id": "pacific-heights",
   "name": "Pacific Heights",
   "center": [
    558,
    297
   ],
   "radius": 240,
   "height": 26
  },
  {
   "id": "russian-hill",
   "name": "Russian Hill",
   "center": [
    1395,
    -135
   ],
   "radius": 200,
   "height": 30
  },
  {
   "id": "presidio-heights",
   "name": "Presidio Heights",
   "center": [
    -193,
    620
   ],
   "radius": 260,
   "height": 22
  }
 ],
 "water": [
  {
   "id": "san-francisco-bay",
   "name": "San Francisco Bay and the Golden Gate",
   "kind": "gulf",
   "poly": [
    [
     -2048,
     620
    ],
    [
     -1695,
     566
    ],
    [
     -1545,
     432
    ],
    [
     -1480,
     162
    ],
    [
     -1437,
     -108
    ],
    [
     -1266,
     -512
    ],
    [
     -1137,
     -690
    ],
    [
     -880,
     -475
    ],
    [
     -429,
     -421
    ],
    [
     0,
     -464
    ],
    [
     236,
     -496
    ],
    [
     279,
     -388
    ],
    [
     536,
     -388
    ],
    [
     579,
     -529
    ],
    [
     751,
     -566
    ],
    [
     944,
     -620
    ],
    [
     1201,
     -566
    ],
    [
     1502,
     -593
    ],
    [
     1695,
     -620
    ],
    [
     2048,
     -647
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
   "id": "mountain-lake",
   "name": "Mountain Lake",
   "kind": "lake",
   "poly": [
    [
     -880,
     496
    ],
    [
     -794,
     475
    ],
    [
     -751,
     550
    ],
    [
     -837,
     593
    ],
    [
     -910,
     561
    ]
   ]
  },
  {
   "id": "crissy-field-marsh",
   "name": "the Crissy Field marsh",
   "kind": "wetland",
   "poly": [
    [
     -451,
     -388
    ],
    [
     -236,
     -399
    ],
    [
     -193,
     -313
    ],
    [
     -408,
     -297
    ]
   ]
  },
  {
   "id": "palace-lagoon",
   "name": "the lagoon at the Palace of Fine Arts",
   "kind": "lake",
   "poly": [
    [
     21,
     -302
    ],
    [
     94,
     -313
    ],
    [
     112,
     -259
    ],
    [
     34,
     -248
    ]
   ]
  }
 ],
 "levees": [
  {
   "id": "marina-seawall",
   "name": "the Marina seawall",
   "height": 4,
   "pts": [
    [
     -107,
     -405
    ],
    [
     64,
     -464
    ],
    [
     172,
     -421
    ],
    [
     236,
     -442
    ]
   ]
  },
  {
   "id": "aquatic-park-seawall",
   "name": "the seawall along Aquatic Park",
   "height": 3.5,
   "pts": [
    [
     1030,
     -529
    ],
    [
     1120,
     -464
    ],
    [
     1330,
     -512
    ]
   ]
  }
 ],
 "roads": [
  {
   "id": "golden-gate-bridge",
   "name": "the Golden Gate Bridge",
   "kind": "bridge",
   "pts": [
    [
     -1150,
     -351
    ],
    [
     -1180,
     -566
    ],
    [
     -1210,
     -1187
    ],
    [
     -1227,
     -2048
    ]
   ]
  },
  {
   "id": "presidio-parkway",
   "name": "the Presidio Parkway",
   "kind": "interstate",
   "pts": [
    [
     -1150,
     -351
    ],
    [
     -858,
     -243
    ],
    [
     -429,
     -162
    ],
    [
     0,
     -135
    ],
    [
     279,
     -135
    ]
   ]
  },
  {
   "id": "lombard-street",
   "name": "Lombard Street",
   "kind": "avenue",
   "pts": [
    [
     279,
     -135
    ],
    [
     601,
     -81
    ],
    [
     944,
     -27
    ],
    [
     1116,
     0
    ]
   ]
  },
  {
   "id": "van-ness-avenue",
   "name": "Van Ness Avenue",
   "kind": "avenue",
   "pts": [
    [
     1116,
     189
    ],
    [
     1116,
     0
    ],
    [
     1137,
     -270
    ],
    [
     1180,
     -432
    ]
   ]
  },
  {
   "id": "marina-boulevard",
   "name": "Marina Boulevard",
   "kind": "avenue",
   "pts": [
    [
     -107,
     -351
    ],
    [
     172,
     -378
    ],
    [
     493,
     -351
    ],
    [
     687,
     -405
    ],
    [
     837,
     -388
    ]
   ]
  },
  {
   "id": "bay-street",
   "name": "Bay Street",
   "kind": "street",
   "pts": [
    [
     837,
     -388
    ],
    [
     1116,
     -367
    ],
    [
     1352,
     -405
    ],
    [
     1523,
     -432
    ]
   ]
  },
  {
   "id": "chestnut-street",
   "name": "Chestnut Street",
   "kind": "street",
   "pts": [
    [
     172,
     -189
    ],
    [
     515,
     -173
    ],
    [
     837,
     -243
    ],
    [
     1116,
     -270
    ]
   ]
  },
  {
   "id": "park-presidio-boulevard",
   "name": "Park Presidio Boulevard",
   "kind": "avenue",
   "pts": [
    [
     -944,
     852
    ],
    [
     -965,
     432
    ],
    [
     -1008,
     54
    ],
    [
     -1150,
     -351
    ]
   ]
  },
  {
   "id": "lincoln-boulevard",
   "name": "Lincoln Boulevard",
   "kind": "street",
   "pts": [
    [
     -1008,
     54
    ],
    [
     -1223,
     81
    ],
    [
     -1352,
     297
    ],
    [
     -1395,
     539
    ]
   ]
  },
  {
   "id": "presidio-main-road",
   "name": "the road through the Main Post",
   "kind": "street",
   "pts": [
    [
     -1008,
     54
    ],
    [
     -687,
     0
    ],
    [
     -386,
     0
    ],
    [
     -86,
     -27
    ],
    [
     193,
     -27
    ]
   ]
  },
  {
   "id": "crissy-field-road",
   "name": "the Crissy Field road",
   "kind": "street",
   "pts": [
    [
     -1051,
     -367
    ],
    [
     -687,
     -334
    ],
    [
     -451,
     -270
    ],
    [
     -107,
     -351
    ]
   ]
  },
  {
   "id": "divisadero-street",
   "name": "Divisadero Street",
   "kind": "street",
   "pts": [
    [
     365,
     566
    ],
    [
     322,
     162
    ],
    [
     279,
     -135
    ]
   ]
  },
  {
   "id": "california-street",
   "name": "California Street",
   "kind": "street",
   "pts": [
    [
     -2048,
     809
    ],
    [
     -858,
     728
    ],
    [
     0,
     620
    ],
    [
     858,
     485
    ],
    [
     2048,
     351
    ]
   ]
  }
 ],
 "districts": [
  {
   "id": "presidio-forest",
   "name": "the Presidio forest",
   "character": "garden",
   "poly": [
    [
     -1437,
     647
    ],
    [
     -1437,
     -108
    ],
    [
     -1137,
     -313
    ],
    [
     -515,
     -216
    ],
    [
     107,
     -108
    ],
    [
     107,
     566
    ],
    [
     -858,
     647
    ]
   ]
  },
  {
   "id": "marina-district",
   "name": "the Marina",
   "character": "suburb",
   "poly": [
    [
     107,
     -108
    ],
    [
     107,
     -351
    ],
    [
     751,
     -367
    ],
    [
     751,
     -27
    ]
   ]
  },
  {
   "id": "cow-hollow",
   "name": "Cow Hollow",
   "character": "quarter",
   "poly": [
    [
     107,
     108
    ],
    [
     107,
     -108
    ],
    [
     751,
     -27
    ],
    [
     1051,
     27
    ],
    [
     1051,
     189
    ]
   ]
  },
  {
   "id": "pacific-heights",
   "name": "Pacific Heights",
   "character": "garden",
   "poly": [
    [
     107,
     566
    ],
    [
     107,
     108
    ],
    [
     1051,
     189
    ],
    [
     1051,
     539
    ]
   ]
  },
  {
   "id": "fort-mason",
   "name": "Fort Mason",
   "character": "port",
   "poly": [
    [
     665,
     -367
    ],
    [
     665,
     -512
    ],
    [
     965,
     -550
    ],
    [
     965,
     -351
    ]
   ]
  },
  {
   "id": "russian-hill",
   "name": "Russian Hill",
   "character": "quarter",
   "poly": [
    [
     1051,
     189
    ],
    [
     1051,
     -351
    ],
    [
     2048,
     -432
    ],
    [
     2048,
     189
    ]
   ]
  },
  {
   "id": "inner-richmond",
   "name": "the Inner Richmond",
   "character": "suburb",
   "poly": [
    [
     -2048,
     2048
    ],
    [
     -2048,
     674
    ],
    [
     107,
     566
    ],
    [
     107,
     2048
    ]
   ]
  },
  {
   "id": "western-addition",
   "name": "the Western Addition",
   "character": "quarter",
   "poly": [
    [
     107,
     2048
    ],
    [
     107,
     566
    ],
    [
     1051,
     539
    ],
    [
     1051,
     189
    ],
    [
     2048,
     189
    ],
    [
     2048,
     2048
    ]
   ]
  }
 ],
 "sites": [
  {
   "id": "marina-harbour",
   "name": "Marina Yacht Harbour",
   "kind": "marina",
   "position": [
    408,
    -313
   ],
   "trades": [
    "ibu",
    "sup",
    "ilwu"
   ],
   "programmes": [
    "yacht-and-charter-crew",
    "ports-maritime-ecology"
   ],
   "stations": [
    "yc-line-handling-and-docking-in-crosswind",
    "yc-fuel-dock-transfer-and-spill-kit",
    "yc-shore-power-connection-and-in-water-electrical-safety",
    "yc-engine-room-pre-start-and-bilge-check",
    "yc-pre-departure-safety-briefing-and-guest-count"
   ],
   "blurb": "The small-craft harbour behind the breakwater: the fuel dock, the shore power posts and the crews who bring boats in on a crosswind."
  },
  {
   "id": "crissy-rescue-station",
   "name": "Crissy Field Rescue Station",
   "kind": "rescue-station",
   "position": [
    -665,
    -302
   ],
   "trades": [
    "ibu",
    "mmp",
    "iaff"
   ],
   "programmes": [
    "yacht-and-charter-crew",
    "first-responders"
   ],
   "stations": [
    "yc-man-overboard-recovery-drill",
    "mw-workboat-towing-and-line-handling",
    "br-workboat-crane-lift-from-water",
    "yc-tender-launch-and-guest-transfer"
   ],
   "blurb": "A rescue station on the Crissy Field shore, run the coast guard way: boat crews on watch, towing and recovery drills, and the launch ready at the slip."
  },
  {
   "id": "bridge-yard",
   "name": "Golden Gate Bridge Maintenance Yard",
   "kind": "bridge",
   "position": [
    -1051,
    -216
   ],
   "trades": [
    "ironworkers",
    "iupat",
    "iuoe"
   ],
   "programmes": [
    "bridge-and-structural"
   ],
   "stations": [
    "gg-tower-climb-and-tie-off",
    "gg-main-cable-band-inspection",
    "gg-suspender-rope-replacement",
    "gg-international-orange-recoat",
    "gg-paint-containment-on-the-deck",
    "gg-deck-lane-closure-and-traveller",
    "gg-fog-and-wind-work-stop"
   ],
   "blurb": "The ironworkers' and painters' yard at the south end of the bridge: tower climbs, cable band checks, the recoat and the call to stop work in fog and wind."
  },
  {
   "id": "presidio-crew-yard",
   "name": "Presidio Park Crew Yard",
   "kind": "park",
   "position": [
    -536,
    -81
   ],
   "trades": [
    "afscme",
    "liuna",
    "iuoe"
   ],
   "programmes": [
    "grounds-and-landscaping"
   ],
   "stations": [
    "gk-ride-on-mower-pre-start-and-slope-work",
    "gk-string-trimmer-and-blower-ppe-and-bystander-zone",
    "gk-irrigation-controller-valve-box-and-backflow-check",
    "gk-pesticide-and-fertilizer-application-per-the-label",
    "gk-hardscape-paver-base-and-compaction"
   ],
   "blurb": "The park crews' yard by the parade ground: mowers, trimmers, the irrigation valves and the paths kept for everyone who walks the park."
  },
  {
   "id": "presidio-forestry",
   "name": "Presidio Forestry Crew",
   "kind": "forestry",
   "position": [
    -1180,
    351
   ],
   "trades": [
    "afscme",
    "liuna"
   ],
   "programmes": [
    "grounds-and-landscaping"
   ],
   "stations": [
    "gk-tree-work-pole-saw-and-drop-zone",
    "gk-chainsaw-start-and-limbing-on-the-ground",
    "gk-storm-cleanup-chipper-and-traffic-control",
    "gk-greenhouse-nursery-chemical-storage-and-eyewash"
   ],
   "blurb": "The forest crew among the Presidio's tall trees: drop zones, limbing on the ground, the chipper after a windy night and the nursery beds."
  },
  {
   "id": "crissy-marsh-crew",
   "name": "Crissy Field Marsh Crew",
   "kind": "wetland",
   "position": [
    -322,
    -280
   ],
   "trades": [
    "liuna",
    "afscme"
   ],
   "programmes": [
    "marine-ecology-and-restoration",
    "hunters-point-bay-restoration"
   ],
   "stations": [
    "marsh-transect-survey",
    "spartina-removal",
    "living-shoreline",
    "br-shoreline-cleanup-sharps-and-hazardous-debris"
   ],
   "blurb": "The restoration crew at the Crissy Field marsh: transects walked on a falling tide, invasive cordgrass pulled and the shoreline kept clean."
  },
  {
   "id": "fort-mason-piers",
   "name": "Fort Mason Piers",
   "kind": "events",
   "position": [
    815,
    -432
   ],
   "trades": [
    "iatse",
    "iatse-local16",
    "teamsters"
   ],
   "programmes": [
    "live-events"
   ],
   "stations": [
    "stage-load-in-and-truss-rigging",
    "stage-power",
    "arena-rigging",
    "pm-community-room-and-events"
   ],
   "blurb": "The piers and pier sheds at Fort Mason: stagehands loading in a show, the truss flown and the power laid before the doors open."
  },
  {
   "id": "marina-seawall-crew",
   "name": "Marina Seawall and Storm Drain Crew",
   "kind": "seawall",
   "position": [
    -21,
    -313
   ],
   "trades": [
    "liuna",
    "uwua",
    "ua"
   ],
   "programmes": [
    "water-and-gas-utility-crews"
   ],
   "stations": [
    "stormwater-outfall",
    "pl-underground-sewer-lateral-and-trench-shoring",
    "manhole-entry-and-atmospheric-monitoring",
    "ut-night-storm-response-crew-and-portable-generator"
   ],
   "blurb": "The crew on the seawall and the storm drains behind the Marina Green: outfalls checked, manholes entered with the air tested first."
  },
  {
   "id": "chestnut-construction",
   "name": "Chestnut Street Construction Site",
   "kind": "construction",
   "position": [
    579,
    -189
   ],
   "trades": [
    "carpenters",
    "liuna",
    "iuoe",
    "bac"
   ],
   "programmes": [
    "builders-trades"
   ],
   "stations": [
    "scaffold-erection",
    "masonry-silica-scaffold",
    "op-excavator-trench-and-utility-locate",
    "op-loader-truck-loading-and-blind-spots"
   ],
   "blurb": "A neighbourhood building site off Chestnut Street: scaffold up to the plan, silica kept down, the trench located before the bucket."
  },
  {
   "id": "cow-hollow-bus-yard",
   "name": "Cow Hollow Bus Yard",
   "kind": "transit-barn",
   "position": [
    858,
    108
   ],
   "trades": [
    "twu-local250a",
    "atu",
    "ibew"
   ],
   "programmes": [
    "transit-ramp"
   ],
   "stations": [
    "bus-depot-lift",
    "bus-yard-fuelling-and-brake-check",
    "tr-wheelchair-lift-and-securement-on-a-bus",
    "signal-cabinet"
   ],
   "blurb": "A trolley bus yard below Pacific Heights: the lift pit, the fuelling lane, the wheelchair lift checked and the signal cabinet at the gate."
  },
  // sw:begin — tools/gen_sw_sites.mjs (console SITEWORKS): procedural sites; re-run the tool, do not hand-edit
  {"id":"ma-sw-western-addition-restaurant-kitchen","name":"Western Addition Restaurant Kitchen","kind":"hospitality","position":[1780,1780],"trades":["unite-here"],"programmes":["culinary-kitchen","bartending-course"],"stations":["kitchen","knife-skills","fryer-oil-change","walk-in-cooler"],"blurb":"A procedural restaurant kitchen in the Western Addition: the line cooks, the dish pit, the walk-in and the bar well."},
  {"id":"ma-sw-inner-richmond-school-campus","name":"Inner Richmond School Campus","kind":"school","position":[-40,1780],"trades":["aft","csea","seiu"],"programmes":["education-support-staff","k12-literacy-and-life-skills"],"stations":["ed-playground-equipment-inspection","ed-crossing-guard-intersection-control","k12-reading-instructions-and-safety-labels","ed-kitchen-receiving-and-warewash-sanitizing"],"blurb":"A procedural school campus in the Inner Richmond: custodians, the crossing guard, the kitchen crew and a classroom lesson."},
  {"id":"ma-sw-western-addition-school-campus","name":"Western Addition School Campus","kind":"school","position":[1780,680],"trades":["aft","csea","seiu"],"programmes":["education-support-staff","k12-literacy-and-life-skills"],"stations":["k12-reading-instructions-and-safety-labels","ed-kitchen-receiving-and-warewash-sanitizing","ed-bus-pretrip-and-loading-zone","k12-first-aid-awareness-call-for-help"],"blurb":"A procedural school campus in the Western Addition: custodians, the crossing guard, the kitchen crew and a classroom lesson."},
  {"id":"ma-sw-inner-richmond-fire-station","name":"Inner Richmond Fire Station","kind":"fire-station","position":[-1760,1780],"trades":["iaff","naemt"],"programmes":["first-responders","fall-protection"],"stations":["cardiac-arrest-pit-crew","overdose-response-naloxone","traffic-incident-management","ev-extrication"],"blurb":"A procedural fire station in the Inner Richmond: the engine company's size-up, the aerial ladder, the ambulance crew and rehab."},
  {"id":"ma-sw-russian-hill-restaurant-kitchen","name":"Russian Hill Restaurant Kitchen","kind":"hospitality","position":[1780,-300],"trades":["unite-here"],"programmes":["culinary-kitchen","bartending-course"],"stations":["dish-pit","allergen-control","bar-well-setup","grease-trap"],"blurb":"A procedural restaurant kitchen in Russian Hill: the line cooks, the dish pit, the walk-in and the bar well."},
  {"id":"ma-sw-western-addition-renovation-site","name":"Western Addition Renovation Site","kind":"construction","position":[840,1180],"trades":["carpenters","ua","insulators","ibew"],"programmes":["plumbers-and-pipefitters","insulators-and-boilermakers","roofers-and-waterproofers"],"stations":["rf-skylight-and-hatch-guarding","pl-copper-press-and-solder-rough-in","ib-asbestos-glovebag-removal-on-a-pipe","rf-roof-tear-off-and-debris-chute"],"blurb":"A procedural renovation site in the Western Addition: plumbers on the rough-in, insulation abatement and the roofers on the tear-off."},
  {"id":"ma-sw-inner-richmond-park-grounds-yard","name":"Inner Richmond Park Grounds Yard","kind":"park","position":[-900,1300],"trades":["afscme","liuna","seiu"],"programmes":["grounds-and-landscaping"],"stations":["gk-ride-on-mower-pre-start-and-slope-work","gk-string-trimmer-and-blower-ppe-and-bystander-zone","gk-tree-work-pole-saw-and-drop-zone","gk-irrigation-controller-valve-box-and-backflow-check"],"blurb":"A procedural park grounds yard in the Inner Richmond: mowers, trimmers, tree work and the irrigation boxes."},
  {"id":"ma-sw-pacific-heights-school-campus","name":"Pacific Heights School Campus","kind":"school","position":[120,540],"trades":["aft","csea","seiu"],"programmes":["education-support-staff","k12-literacy-and-life-skills"],"stations":["ed-paraeducator-safe-lift-and-transfer","ed-boiler-room-filter-change-lockout","k12-teamwork-and-feedback","ed-custodial-chemical-dilution-and-floor-machine"],"blurb":"A procedural school campus in Pacific Heights: custodians, the crossing guard, the kitchen crew and a classroom lesson."},
  {"id":"ma-sw-western-addition-community-clinic","name":"Western Addition Community Clinic","kind":"hospital","position":[1120,1780],"trades":["nnu","seiu","afscme"],"programmes":["healthcare-support","first-responders"],"stations":["triage-point","hc-workplace-violence-deescalation-at-the-desk","hc-hazardous-drug-spill-kit-response","hc-dietary-tray-line-and-allergy-flags"],"blurb":"A procedural community clinic in the Western Addition: patient transport, room turnover, regulated waste and the front desk."},
  {"id":"ma-sw-inner-richmond-community-clinic","name":"Inner Richmond Community Clinic","kind":"hospital","position":[-1780,940],"trades":["nnu","seiu","afscme"],"programmes":["healthcare-support","first-responders"],"stations":["hc-workplace-violence-deescalation-at-the-desk","hc-hazardous-drug-spill-kit-response","hc-dietary-tray-line-and-allergy-flags","hc-code-response-support-and-crash-cart-check"],"blurb":"A procedural community clinic in the Inner Richmond: patient transport, room turnover, regulated waste and the front desk."},
  {"id":"ma-sw-western-addition-hotel-service-floor","name":"Western Addition Hotel Service Floor","kind":"hospitality","position":[200,1180],"trades":["unite-here","seiu"],"programmes":["hotel-workers","culinary-kitchen"],"stations":["housekeeping-room-turn","hw-housekeeping-cart-and-chemical-safety","hw-banquet-room-flip-and-staging","hw-flatwork-ironer-and-folder-guarding"],"blurb":"A procedural hotel service floor in the Western Addition: housekeepers on the room turn, the laundry plant and the banquet crew."},
  {"id":"ma-sw-inner-richmond-recreation-centre","name":"Inner Richmond Recreation Centre","kind":"recreation","position":[-560,660],"trades":["afscme","seiu-1021"],"programmes":["basketball-fundamentals","property-management"],"stations":["bb-scrimmage-and-sportsmanship-debrief","pm-pool-and-spa-chemistry","pm-community-room-and-events","ed-playground-equipment-inspection"],"blurb":"A procedural recreation centre in the Inner Richmond: the gym floor, the pool chemistry, the community room and the playground."},
  {"id":"ma-sw-russian-hill-school-campus","name":"Russian Hill School Campus","kind":"school","position":[1460,180],"trades":["aft","csea","seiu"],"programmes":["education-support-staff","k12-literacy-and-life-skills"],"stations":["k12-reading-instructions-and-safety-labels","ed-kitchen-receiving-and-warewash-sanitizing","ed-bus-pretrip-and-loading-zone","k12-first-aid-awareness-call-for-help"],"blurb":"A procedural school campus in Russian Hill: custodians, the crossing guard, the kitchen crew and a classroom lesson."},
  {"id":"ma-sw-western-addition-garment-workshop","name":"Western Addition Garment Workshop","kind":"workshop","position":[1460,1240],"trades":["workers-united"],"programmes":["sewing-garment-trades"],"stations":["industrial-press-steam","garment-inspection-finish","sewing-ergonomics-shift","machine-threading-needle"],"blurb":"A procedural garment workshop in the Western Addition: the lockstitch and serger lines, the cutting table and the steam press."},
  {"id":"ma-sw-inner-richmond-substation","name":"Inner Richmond Substation","kind":"substation","position":[-1200,1780],"trades":["ibew"],"programmes":["energy-transition","electrical-first-period"],"stations":["or-transmission-line-right-of-way-patrol","temporary-site-power","substation-switching","line-truck"],"blurb":"A procedural substation in the Inner Richmond: switching under a permit, the line truck, the transformer vault and arc-flash labels."},
  {"id":"ma-sw-presidio-fire-station","name":"Presidio Fire Station","kind":"fire-station","position":[-120,140],"trades":["iaff","naemt"],"programmes":["first-responders","fall-protection"],"stations":["ev-extrication","structure-fire-sizeup","firefighter-rehab-sector","ambulance-scene-safety"],"blurb":"A procedural fire station in the Presidio forest: the engine company's size-up, the aerial ladder, the ambulance crew and rehab."},
  {"id":"ma-sw-western-addition-fire-station","name":"Western Addition Fire Station","kind":"fire-station","position":[1120,660],"trades":["iaff","naemt"],"programmes":["first-responders","fall-protection"],"stations":["traffic-incident-management","ev-extrication","structure-fire-sizeup","firefighter-rehab-sector"],"blurb":"A procedural fire station in the Western Addition: the engine company's size-up, the aerial ladder, the ambulance crew and rehab."},
  // sw:end
 ],
 "landmarks": [
  {
   "id": "golden-gate-bridge",
   "name": "the Golden Gate Bridge",
   "position": [
    -1159,
    -432
   ],
   "kind": "bridge",
   "lm": "golden-gate-bridge"
  },
  {
   "id": "fort-point",
   "name": "Fort Point",
   "position": [
    -1150,
    -636
   ],
   "kind": "point"
  },
  {
   "id": "palace-of-fine-arts",
   "name": "the Palace of Fine Arts",
   "position": [
    64,
    -216
   ],
   "kind": "landmark"
  },
  {
   "id": "crissy-field",
   "name": "Crissy Field",
   "position": [
    -644,
    -378
   ],
   "kind": "shore"
  },
  {
   "id": "marina-green",
   "name": "the Marina Green",
   "position": [
    644,
    -453
   ],
   "kind": "park"
  },
  {
   "id": "harbour-breakwater",
   "name": "the harbour breakwater",
   "position": [
    429,
    -512
   ],
   "kind": "point"
  },
  {
   "id": "fort-mason",
   "name": "Fort Mason",
   "position": [
    880,
    -351
   ],
   "kind": "fort"
  },
  {
   "id": "presidio-main-post",
   "name": "the Presidio's Main Post",
   "position": [
    -365,
    -27
   ],
   "kind": "park"
  },
  {
   "id": "baker-beach",
   "name": "Baker Beach",
   "position": [
    -1425,
    189
   ],
   "kind": "shore"
  },
  {
   "id": "mountain-lake",
   "name": "Mountain Lake",
   "position": [
    -837,
    620
   ],
   "kind": "lake-shore"
  },
  {
   "id": "lafayette-park",
   "name": "Lafayette Park",
   "position": [
    965,
    351
   ],
   "kind": "park"
  },
  {
   "id": "aquatic-park",
   "name": "Aquatic Park",
   "position": [
    1180,
    -485
   ],
   "kind": "shore"
  }
 ],
 "connectors": [
  {
   "id": "sf-ma-van-ness-north",
   "kind": "road",
   "name": "Van Ness Avenue south to Downtown",
   "from": {
    "parish": "sf-marina",
    "position": [
     1116,
     162
    ]
   },
   "to": {
    "parish": "sf-downtown",
    "position": [-800, -251],
    "lonlat": [
     -122.424,
     37.795
    ]
   },
   "lonlat": [
    -122.424,
    37.795
   ],
   "approximate": true
  },
  {
   "id": "sf-ma-embarcadero-north",
   "kind": "road",
   "name": "Bay Street east to the Embarcadero",
   "from": {
    "parish": "sf-marina",
    "position": [
     1502,
     -432
    ]
   },
   "to": {
    "parish": "sf-downtown",
    "position": [-440, -804],
    "lonlat": [
     -122.415,
     37.806
    ]
   },
   "lonlat": [
    -122.415,
    37.806
   ],
   "approximate": true
  },
  {
   "id": "sf-ma-park-presidio",
   "kind": "road",
   "name": "Park Presidio Boulevard south to Golden Gate Park",
   "from": {
    "parish": "sf-marina",
    "position": [
     -944,
     863
    ]
   },
   "to": {
    "parish": "sf-golden-gate-park",
    "position": [240, -955],
    "lonlat": [
     -122.472,
     37.782
    ]
   },
   "lonlat": [
    -122.472,
    37.782
   ],
   "approximate": true
  },
  {
   "id": "sf-golden-gate-bridge",
   "kind": "bridge",
   "name": "The Golden Gate Bridge north to the Marin Headlands",
   "from": {
    "parish": "sf-marina",
    "position": [
     -1150,
     -367
    ]
   },
   "to": {
    "parish": "marin-headlands",
    "position": null,
    "lonlat": [
     -122.478,
     37.829
    ]
   },
   "lonlat": [
    -122.478,
    37.829
   ],
   "approximate": true
  }
 ],
 "fieldLessons": [
  {
   "id": "sg-fl-bridge-cable-machine",
   "title": "How a Bridge Hangs From Its Cables",
   "site": "bridge-yard",
   "landmark": "golden-gate-bridge",
   "k12": "k12-simple-machines-at-a-crane",
   "station": "gg-suspender-rope-replacement",
   "trade": "Bridge ironworkers",
   "tradeLine": "A bridge ironworker swaps a hanging rope one at a time, so the cable above always shares the load.",
   "minutes": 3,
   "steps": [
    "Look up at the big cable that swings from tower to tower.",
    "Thin ropes hang down from it and hold up the road.",
    "Each rope carries a share, so the crew changes only one at a time."
   ],
   "check": {
    "q": "Why does the crew change only one hanging rope at a time?",
    "options": [
     "The other ropes keep sharing the load",
     "It is faster to do them all",
     "The ropes are all the same colour"
    ],
    "answer": 0,
    "why": "The ropes share the weight, so the rest hold the road while one is swapped."
   }
  },
  {
   "id": "sg-fl-fog-weather-call",
   "title": "Reading Fog and Wind Before a Climb",
   "site": "bridge-yard",
   "k12": "k12-weather-and-the-sky",
   "station": "gg-fog-and-wind-work-stop",
   "trade": "Bridge painters",
   "tradeLine": "A bridge painter watches the fog and the wind before a climb, and the crew stops together when the sky says so.",
   "minutes": 3,
   "steps": [
    "Fog rolls in from the ocean and through the gate.",
    "Wind pushes harder high up than down on the ground.",
    "The crew checks the sky first, and they all stop when it turns."
   ],
   "check": {
    "q": "What does the crew do when the fog and wind pick up?",
    "options": [
     "They stop work together",
     "They climb faster",
     "They each decide alone"
    ],
    "answer": 0,
    "why": "Weather is a shared call, so the whole crew stops together."
   }
  },
  {
   "id": "sg-fl-tide-graph-harbour",
   "title": "The Tide Is a Line on a Graph",
   "site": "marina-harbour",
   "landmark": "harbour-breakwater",
   "k12": "k12-graphing-tide-readings-at-the-pier",
   "station": "yc-line-handling-and-docking-in-crosswind",
   "trade": "Harbour boat crews",
   "tradeLine": "A harbour crew reads the tide on a graph, because the water under the dock rises and falls all day.",
   "minutes": 3,
   "steps": [
    "The water in the harbour rises and falls through the day.",
    "If you mark its height each hour, the dots make a wave.",
    "Boat crews read that wave to know when the slip is deep enough."
   ],
   "check": {
    "q": "What shape do the tide marks make on a graph?",
    "options": [
     "A wave that goes up and down",
     "A flat straight line",
     "A circle"
    ],
    "answer": 0,
    "why": "The tide rises and falls, so its marks make a wave."
   }
  },
  {
   "id": "sg-fl-rescue-call-for-help",
   "title": "Calling for Help at the Shore",
   "site": "crissy-rescue-station",
   "landmark": "crissy-field",
   "k12": "k12-first-aid-awareness-call-for-help",
   "station": "yc-man-overboard-recovery-drill",
   "trade": "Rescue boat crews",
   "tradeLine": "A rescue crew is ready because someone on shore called and said clearly where to look.",
   "minutes": 2,
   "steps": [
    "If someone needs help in the water, tell a grown-up right away.",
    "Say where you are and point to the person.",
    "Keep your eyes on them so the rescue crew knows where to go."
   ],
   "check": {
    "q": "Someone needs help in the water. What do you do first?",
    "options": [
     "Tell a grown-up and point",
     "Swim out alone",
     "Walk away"
    ],
    "answer": 0,
    "why": "Getting a grown-up and pointing brings the trained crew fast."
   }
  },
  {
   "id": "sg-fl-forest-map-scale",
   "title": "The Map's Scale Tells How Far",
   "site": "presidio-forestry",
   "k12": "k12-reading-a-map-scale-in-bay-world",
   "station": "gk-tree-work-pole-saw-and-drop-zone",
   "trade": "Park forestry crews",
   "tradeLine": "A forestry crew marks a drop zone on the park map, and the map's scale tells them how big to make it.",
   "minutes": 3,
   "steps": [
    "A map shows a big place drawn small.",
    "The scale bar says how far one small step on the map goes.",
    "The crew uses it to mark how much room a falling branch needs."
   ],
   "check": {
    "q": "What does the scale bar on a map tell you?",
    "options": [
     "How far the real ground is",
     "What colour the trees are",
     "Who drew the map"
    ],
    "answer": 0,
    "why": "The scale turns a short map distance into a real one."
   }
  }
 ],
 "gated": [
  {
   "id": "sg-sf-marina-gated-tower-dawn",
   "kind": "side-quest",
   "title": "Tower Climb at First Light",
   "world": "parishes",
   "parish": "sf-marina",
   "site": "bridge-yard",
   "siteName": "Golden Gate Bridge Maintenance Yard",
   "gate": {
    "stations": [
     "gg-fog-and-wind-work-stop"
    ],
    "note": "Learn when the crew stops for fog and wind before you climb the tower at first light"
   }
  },
  {
   "id": "sg-sf-marina-gated-harbour-night-watch",
   "kind": "side-quest",
   "title": "Harbour Night Watch",
   "world": "parishes",
   "parish": "sf-marina",
   "site": "crissy-rescue-station",
   "siteName": "Crissy Field Rescue Station",
   "gate": {
    "stations": [
     "yc-man-overboard-recovery-drill"
    ],
    "note": "Run the recovery drill before you stand the night watch with the rescue crew"
   }
  }
 ]
};
