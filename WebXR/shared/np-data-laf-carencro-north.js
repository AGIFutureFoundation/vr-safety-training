// Carencro and north Lafayette along Interstate Forty-Nine — a Louisiana growth-city district on the parish schema (console ACADIANA,
// docs/consoles/ACADIANA.md, docs/parishes.md). A stylised 4096 m map, not a survey: real places appear only by their
// public names as places; every coordinate is approximate (three decimals, `approximate: true`) and exists only to place
// the map. One north-up uniform scale (x east, +z south). The rivers, bayous, interstates and named streets follow the
// general shape of the real ones; blocks, massing, pads and every site are PROCEDURAL training places, and every site
// layout is the platform's illustration (the city, its waterways and its roads are real). No growth figure is stated.
// Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).
// Bayou Carencro follows an approximate course; the canal, pond and pit are procedural; the cane and rice fields are open ground.
// Generated from lon/lat by the ACADIANA layout script; pure data, no imports.
export const NP_LAF_CARENCRO_NORTH = {
  id: "laf-carencro-north",
  name: "Carencro and North Lafayette",
  region: "louisiana-cities",
  size: 4096,
  scale: 2,
  farmland: true,
  blurb: "Carencro and north Lafayette along the interstate, in Cajun and Creole prairie country: an industrial park by the interchange, tilt-up warehouses, a pipe yard and a fabrication shop, a substation tie-in, a rail siding, cane haul roads and the crawfish and rice fields around Carencro. The site layouts are illustrative; the towns, the interstates and the roads are real.",
  start: "lafc-workforce-trailer",
  anchors: [
    {"xz":[-96,-1197],"lonlat":[-92.049,30.317],"approximate":true,"name":"Carencro"},
    {"xz":[1490,1920],"lonlat":[-92.016,30.261],"approximate":true,"name":"The interstates' interchange north of Lafayette"},
    {"xz":[577,1531],"lonlat":[-92.035,30.268],"approximate":true,"name":"North Lafayette"},
    {"xz":[481,-1920],"lonlat":[-92.037,30.33],"approximate":true,"name":"The interstate north of Carencro"},
    {"xz":[-1586,-529],"lonlat":[-92.08,30.305],"approximate":true,"name":"West of Carencro"},
    {"xz":[1201,1030],"lonlat":[-92.022,30.277],"approximate":true,"name":"Gloria Switch Road at the interstate"},
  ],
  hills: [
  ],
  water: [
    {"id":"bayou-carencro","name":"Bayou Carencro (approximate course)","kind":"bayou","width":10,"poly":[[-2018,-139],[-1298,28],[-625,223],[-48,529],[336,863],[865,1085],[1394,1308],[2018,1419]]},
    {"id":"field-pond-procedural","name":"a crawfish pond (procedural)","kind":"wetland","poly":[[1682,-1364],[1922,-1364],[1922,-1141],[1682,-1141]]},
    {"id":"rice-canal-procedural","name":"a rice field irrigation canal (procedural)","kind":"canal","width":6,"poly":[[-1826,-1531],[-1586,-807],[-1538,28]]},
    {"id":"borrow-pit-pond-procedural","name":"a borrow pit pond by the interstate (procedural)","kind":"lake","poly":[[1634,-640],[1874,-640],[1874,-417],[1634,-417]]},
  ],
  levees: [
    {"id":"coulee-spoil-bank-procedural","name":"Bayou Carencro's flood bank (procedural)","height":3.6,"pts":[[-1394,-67],[-1057,-67],[-721,-67]]},
    {"id":"crawfish-pond-levee-procedural","name":"the crawfish pond levees (procedural)","height":0.8,"pts":[[1634,-1430],[1970,-1430]]},
  ],
  roads: [
    {"id":"interstate-forty-nine","name":"Interstate Forty-Nine","kind":"interstate","pts":[[1562,2046],[1499,1920],[1355,1353],[1120,573],[769,-729],[476,-2032]]},
    {"id":"interstate-ten","name":"Interstate Ten","kind":"interstate","pts":[[865,2046],[1499,1920],[2046,1531]]},
    {"id":"university-avenue","name":"University Avenue","kind":"avenue","pts":[[591,2046],[96,1308],[-168,751],[-216,-250],[-240,-2032]]},
    {"id":"gloria-switch-road","name":"Gloria Switch Road","kind":"street","pts":[[-2018,1030],[-625,1030],[817,1030],[2018,1030]]},
    {"id":"carencro-main-street","name":"the Carencro main road","kind":"street","pts":[[-1826,-1197],[-721,-1197],[336,-1197],[2018,-1197]]},
    {"id":"pont-des-mouton-road","name":"Pont des Mouton Road","kind":"street","pts":[[-240,1753],[577,1698],[2018,1698]]},
  ],
  districts: [
    {"id":"carencro-town","name":"Carencro","character":"quarter","poly":[[-721,-1642],[336,-1642],[336,-751],[-721,-751]]},
    {"id":"carencro-west","name":"the neighbourhoods west of Carencro","character":"suburb","poly":[[-1490,-1809],[-721,-1809],[-721,-529],[-1490,-529]]},
    {"id":"interchange-industrial","name":"the industrial park by the interchange","character":"industrial","poly":[[336,-250],[1874,-250],[1874,1865],[336,1865]]},
    {"id":"north-lafayette","name":"north Lafayette","character":"suburb","poly":[[-1490,640],[336,640],[336,2032],[-1490,2032]]},
    {"id":"carencro-east","name":"the interstate frontage by Carencro","character":"industrial","poly":[[336,-1920],[1298,-1920],[1298,-529],[336,-529]]},
  ],
  sites: [
    {"id":"lafc-workforce-trailer","name":"Carencro Workforce Trailer","kind":"civic","position":[48,-974],"trades":["carpenters","ibew","liuna","iuoe"],"programmes":["job-readiness-edition","civic-leadership-and-ei"],"stations":["jobsite-orientation-and-osha-10","apprenticeship-application-and-test","union-hall-and-dispatch"],"blurb":"Where learners start in Carencro: the site orientation, the apprenticeship application and the dispatch board (a procedural trailer). A trade reference only: no employer's or union's programme is delivered here."},
    {"id":"lafc-industrial-park","name":"Interchange Industrial Park","kind":"industrial","position":[865,1475],"trades":["teamsters","iam","iuoe"],"programmes":["warehouse-and-logistics-automation","hazmat-environmental"],"stations":["forklift-dock","hz-drum-staging-and-compatibility-segregation","drum-sampling-and-overpack","stormwater-outfall"],"blurb":"A procedural industrial park by the interchange: forklifts at the docks, drums staged and segregated and the stormwater outfall checked."},
    {"id":"lafc-i49-interchange-work","name":"Interchange Bridge Crew","kind":"bridge-yard","position":[1225,1503],"trades":["ironworkers","iuoe","liuna","iupat"],"programmes":["bridge-and-structural"],"stations":["deck-joint-replacement","bs-bearing-replacement-and-jacking","bs-structural-bolting-and-torque","traffic-incident-management"],"blurb":"A procedural bridge job at the interstates' interchange: a deck joint replaced, a bearing jacked and the lane closure kept safe."},
    {"id":"lafc-warehouse-tilt-up","name":"Tilt-Up Warehouse Build","kind":"construction","position":[625,529],"trades":["carpenters","ironworkers","opcmia","iuoe"],"programmes":["builders-trades","rigging-lifting"],"stations":["formwork-shoring","concrete-pour","rl-critical-lift-plan-and-signalperson","jobsite-orientation-and-osha-10"],"blurb":"A procedural tilt-up warehouse: the panels formed and poured on the slab, then lifted on a critical lift plan with a signalperson."},
    {"id":"lafc-pipe-yard","name":"Pipe Yard","kind":"yard","position":[1538,974],"trades":["ua","teamsters","iuoe"],"programmes":["plumbers-and-pipefitters","heavy-equipment-operators"],"stations":["op-loader-truck-loading-and-blind-spots","op-equipment-daily-walkaround-and-fluids","tdl-cargo-securement-and-hours"],"blurb":"A procedural pipe yard off the interstate: the loader's blind spots, the daily walkaround and every load secured before it leaves."},
    {"id":"lafc-fabrication-shop","name":"Fabrication Shop","kind":"workshop","position":[961,195],"trades":["smart","iam","ironworkers"],"programmes":["insulators-and-boilermakers","situational-awareness"],"stations":["welding","sm-plasma-table-and-fume","sm-duct-fabrication-and-seams"],"blurb":"A procedural fabrication shop: welding with the fume drawn off, the plasma table and duct seams."},
    {"id":"lafc-substation-tie-in","name":"Substation Tie-In","kind":"substation","position":[1730,306],"trades":["ibew"],"programmes":["energy-transition","electrical-first-period"],"stations":["substation-switching","temporary-site-power","line-truck","transformer-vault"],"blurb":"A procedural substation tie-in for the industrial park: switching under a permit, the line truck and the transformer vault."},
    {"id":"lafc-rail-siding","name":"Rail Siding","kind":"rail","position":[-433,139],"trades":["smart-td","bmwed","iuoe"],"programmes":["railroad-crafts"],"stations":["ra-blue-flag-protection-in-the-yard","ra-switch-inspection-and-lubrication","ra-roadway-worker-protection-and-job-briefing"],"blurb":"A procedural siding by the main line near Carencro: blue flag protection, the switch inspected and the roadway worker briefing."},
    {"id":"lafc-cane-haul-road","name":"Cane Haul Road","kind":"trucking","position":[-1105,-1586],"trades":["teamsters"],"programmes":["job-readiness-edition","heavy-equipment-operators"],"stations":["tdl-pretrip-inspection","tdl-air-brake-test","tdl-cargo-securement-and-hours"],"blurb":"A procedural cane haul road west of Carencro in the harvest: the pre-trip, the air brake test and the load secured."},
    {"id":"lafc-drainage-coulee","name":"Coulee Drainage Crew","kind":"stormwater","position":[-721,473],"trades":["liuna","afscme","iuoe"],"programmes":["heavy-equipment-operators","grounds-and-landscaping"],"stations":["bioswale-build","op-excavator-trench-and-utility-locate","trench-box"],"blurb":"A procedural drainage crew on the coulee: the channel cleared, the culvert trench shored and a planted swale."},
    {"id":"lafc-water-tower","name":"Water Tower Repaint","kind":"utility","position":[-288,-696],"trades":["iupat","uwua"],"programmes":["water-and-gas-utility-crews","fall-protection"],"stations":["tower-climb","valve-vault","bridge-lead-containment"],"blurb":"A procedural water tower being repainted: the climb and tie-off, the old coating contained and the valve vault below."},
    {"id":"lafc-subdivision-framing","name":"Subdivision Framing Crew","kind":"construction","position":[-913,1419],"trades":["carpenters","ibew","ua"],"programmes":["builders-trades","roofers-and-waterproofers"],"stations":["scaffold-erection","rf-roof-tear-off-and-debris-chute","pl-natural-gas-pressure-test-and-leak-check"],"blurb":"A procedural new street of houses in north Lafayette: the scaffold up, the roof crew and the gas line pressure-tested."},
    {"id":"lafc-roadway-paving","name":"Roadway Paving Crew","kind":"yard","position":[240,1308],"trades":["iuoe","liuna","teamsters"],"programmes":["heavy-equipment-operators"],"stations":["op-grader-fine-grade-and-crown","op-compactor-lift-thickness-and-edge","op-equipment-daily-walkaround-and-fluids"],"blurb":"A procedural road job: the grader fine-grading the crown, the compactor on each lift and the walkaround before the shift."},
    {"id":"lafc-truck-yard","name":"Interstate Truck Yard","kind":"trucking","position":[961,-1085],"trades":["teamsters"],"programmes":["job-readiness-edition","port-operations"],"stations":["tdl-pretrip-inspection","tdl-coupling-and-uncoupling","tdl-air-brake-test"],"blurb":"A procedural truck yard on the interstate frontage: the pre-trip, coupling and uncoupling and the brake test."},
    {"id":"lafc-oilfield-service-yard","name":"Oilfield Service Yard","kind":"hazmat","position":[625,-195],"trades":["teamsters","liuna","usw"],"programmes":["hazmat-environmental","warehouse-and-logistics-automation"],"stations":["hz-drum-staging-and-compatibility-segregation","drum-sampling-and-overpack","forklift-dock"],"blurb":"A procedural service yard of the kind the region's energy work uses: drums staged by compatibility, a leaking drum overpacked and the forklift at the dock."},
    {"id":"lafc-crane-yard","name":"Crane Yard","kind":"yard","position":[1346,-139],"trades":["iuoe","ironworkers","teamsters"],"programmes":["rigging-lifting","heavy-equipment-operators"],"stations":["crane-yard","op-crawler-crane-assembly-and-load-chart","op-equipment-daily-walkaround-and-fluids"],"blurb":"A procedural crane yard: a crawler crane assembled and its load chart read, and the daily walkaround."},
    {"id":"lafc-school-campus","name":"Carencro School Campus","kind":"school","position":[-481,-1364],"trades":["aft","seiu"],"programmes":["education-support-staff","k12-literacy-and-life-skills"],"stations":["ed-crossing-guard-intersection-control","ed-playground-equipment-inspection","k12-reading-instructions-and-safety-labels"],"blurb":"A procedural school campus in Carencro: the crossing guard at the corner, the playground inspected and the safety labels read."},
    {"id":"lafc-fire-station","name":"Carencro Fire Station","kind":"fire-station","position":[144,-1364],"trades":["iaff","naemt"],"programmes":["first-responders"],"stations":["ambulance-scene-safety","traffic-incident-management","aerial-ladder"],"blurb":"A procedural fire station in Carencro: the ambulance scene, the interstate lane cleared safely and the ladder check."},
  ],
  landmarks: [
    {"id":"lafc-sign","name":"a sign: the site layouts are illustrative; the towns, the interstates and the roads are real","position":[144,-807],"kind":"place"},
    {"id":"carencro-town-lm","name":"Carencro","position":[-144,-1141],"kind":"place"},
    {"id":"interchange-lm","name":"the interstates' interchange","position":[1394,1865],"kind":"bridge"},
    {"id":"cane-fields-lm","name":"the cane and rice fields east of Carencro","position":[1682,-1642],"kind":"park"},
    {"id":"coulee-bridge-lm","name":"the interstate bridge over Bayou Carencro","position":[1274,1208],"kind":"bridge"},
    {"id":"rail-line-lm","name":"the main rail line through Carencro","position":[-360,-306],"kind":"place"},
  ],
  connectors: [
    {"id":"ac-lafc-i49-south","kind":"road","name":"The Evangeline Thruway south into downtown Lafayette","from":{"parish":"laf-carencro-north","position":[1562,2046]},"to":{"parish":"laf-downtown","position":[-216,-2046]},"lonlat":[-92.0145,30.2572],"approximate":true},
    {"id":"ac-lafc-i49-north","kind":"road","name":"The interstate north toward Opelousas (no map yet)","from":{"parish":"laf-carencro-north","position":[490,-2043]},"to":{"parish":"st-landry-opelousas","position":null,"lonlat":[-92.0368,30.3322]},"lonlat":[-92.0368,30.3322],"approximate":true},
  ],
  fieldLessons: [
    {"id":"ac-fl-crawfish-ponds-and-rice","title":"Crawfish Ponds and Rice Fields","site":"lafc-cane-haul-road","landmark":"cane-fields-lm","k12":"k12-es-count-it-a-fair-survey","station":"tdl-pretrip-inspection","trade":"Truck drivers","tradeLine":"A driver checks the truck before every haul on the farm roads, so the harvest gets to the mill safely.","minutes":3,"steps":["Farm roads around Carencro carry cane, rice and crawfish loads.","Before each trip the driver walks round the truck and tests the brakes.","Slow-moving farm trucks share the road: pass only when it is clear."],"check":{"q":"What does a driver do before every haul?","options":["A walk-round check and a brake test","Honk the horn and go","Nothing if the truck looks clean"],"answer":0,"why":"The pre-trip check finds problems before the truck is loaded and moving."}},
    {"id":"ac-fl-lifting-a-wall-panel","title":"Lifting a Wall Panel","site":"lafc-warehouse-tilt-up","landmark":"interchange-lm","k12":"k12-simple-machines-at-a-crane","station":"rl-critical-lift-plan-and-signalperson","trade":"Ironworkers","tradeLine":"Ironworkers brace each tall panel as the crane stands it up, so it never tips before it is tied in.","minutes":3,"steps":["Tilt-up walls are poured flat on the slab, then lifted upright.","A crane stands each panel up while a signalperson guides the lift.","Braces hold the panel until the roof ties it in."],"check":{"q":"What holds a new wall panel up before the roof is on?","options":["Braces","The wind","Nothing at all"],"answer":0,"why":"Braces keep the panel standing until the building ties it in."}},
    {"id":"ac-fl-who-works-at-the-interchange","title":"Who Works at the Interchange","site":"lafc-workforce-trailer","landmark":"carencro-town-lm","k12":"k12-es-who-does-this-work","station":"jobsite-orientation-and-osha-10","trade":"Construction trades","tradeLine":"Every trade starts with the site orientation, so everyone knows the rules, the hazards and the way out.","minutes":3,"steps":["Many trades work near the interstates: operators, ironworkers, electricians and drivers.","Each crew has its own job and its own safety rules.","Everyone starts with the same site orientation."],"check":{"q":"What does every new worker do first on a site?","options":["The site orientation","Climb the crane","Drive a truck"],"answer":0,"why":"The orientation teaches the rules and the hazards before any work starts."}},
  ],
  gated: [
    {"id":"laf-carencro-north-gated-harvest-haul","kind":"side-quest","title":"Harvest Haul at Dawn","site":"lafc-cane-haul-road","summary":"Run the first cane haul of the day on the farm roads, checked and secured.","gate":{"stations":["tdl-pretrip-inspection"],"note":"Finish the pre-trip inspection station before the harvest haul"},"world":"parishes","parish":"laf-carencro-north","siteName":"Cane Haul Road"},
    {"id":"laf-carencro-north-gated-switching","kind":"side-quest","title":"Switching at the Tie-In","site":"lafc-substation-tie-in","summary":"Switch the new feeder in under the permit with the crew.","gate":{"stations":["substation-switching"],"note":"Finish the substation switching station before the tie-in"},"world":"parishes","parish":"laf-carencro-north","siteName":"Substation Tie-In"},
  ],
};
