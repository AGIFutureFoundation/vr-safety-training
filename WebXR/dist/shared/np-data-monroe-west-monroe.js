// Monroe and West Monroe on the Ouachita River — a Louisiana growth-city district on the parish schema (console ACADIANA,
// docs/consoles/ACADIANA.md, docs/parishes.md). A stylised 4096 m map, not a survey: real places appear only by their
// public names as places; every coordinate is approximate (three decimals, `approximate: true`) and exists only to place
// the map. One north-up uniform scale (x east, +z south). The rivers, bayous, interstates and named streets follow the
// general shape of the real ones; blocks, massing, pads and every site are PROCEDURAL training places, and every site
// layout is the platform's illustration (the city, its waterways and its roads are real). No growth figure is stated.
// Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).
// Monroe is named as a place only (the nearest city to the Richland Parish project, by geography); no employer or project is placed here.
// Generated from lon/lat by the ACADIANA layout script; pure data, no imports.
export const NP_MONROE_WEST_MONROE = {
  id: "monroe-west-monroe",
  name: "Monroe and West Monroe",
  region: "louisiana-cities",
  size: 4096,
  scale: 3,
  blurb: "Monroe and West Monroe facing each other across the Ouachita River in north Louisiana, the nearest city by geography to the Richland Parish project: a workforce centre, the river bridge and the floodwall, Bayou DeSiard, the interstate deck crews, a mill turnaround staging area, the airport apron and the rail yard. The site layouts are illustrative; the cities, the river and the roads are real.",
  start: "mon-workforce-centre",
  anchors: [
    {"xz":[-751,148],"lonlat":[-92.119,32.506],"approximate":true,"name":"Downtown Monroe"},
    {"xz":[-1627,-74],"lonlat":[-92.147,32.512],"approximate":true,"name":"West Monroe"},
    {"xz":[626,-668],"lonlat":[-92.075,32.528],"approximate":true,"name":"University of Louisiana at Monroe"},
    {"xz":[1784,-37],"lonlat":[-92.038,32.511],"approximate":true,"name":"Monroe Regional Airport"},
    {"xz":[-814,482],"lonlat":[-92.121,32.497],"approximate":true,"name":"The Ouachita River at the interstate"},
    {"xz":[1283,594],"lonlat":[-92.054,32.494],"approximate":true,"name":"The interstates' east side by the airport"},
  ],
  hills: [
  ],
  water: [
    {"id":"ouachita-river","name":"the Ouachita River","kind":"river","width":50,"poly":[[-1505,-2046],[-958,-1651],[-1042,-1269],[-1211,-931],[-1295,-635],[-1189,-212],[-958,126],[-745,338],[-620,594],[-535,931],[-704,1035],[-998,805],[-1189,846],[-1230,1098],[-1042,1228],[-745,1269],[-660,1521],[-704,2046]]},
    {"id":"bayou-desiard","name":"Bayou DeSiard","kind":"bayou","width":10,"poly":[[-767,-1651],[-407,-1481],[-69,-1733],[16,-1440],[269,-1143],[523,-1058],[817,-720],[1114,-846],[1367,-805],[1533,-594],[1621,-1058],[2046,-1098]]},
    {"id":"south-monroe-drainage-procedural","name":"a drainage canal in south Monroe (procedural)","kind":"canal","width":6,"poly":[[-156,1855],[0,1484],[156,1113]]},
  ],
  levees: [
    {"id":"monroe-floodwall","name":"the Monroe riverfront floodwall","height":3.2,"pts":[[-1095,-260],[-864,93],[-651,304],[-526,575]]},
    {"id":"west-monroe-levee","name":"the West Monroe levee","height":3.2,"pts":[[-1389,-635],[-1289,-186],[-1064,167],[-861,390]]},
  ],
  roads: [
    {"id":"interstate-twenty-west","name":"Interstate Twenty through West Monroe","kind":"interstate","pts":[[-2046,126],[-1252,464],[-892,479]]},
    {"id":"interstate-twenty-bridge","name":"the interstate bridge over the Ouachita","kind":"bridge","pts":[[-892,479],[-688,464],[-485,419]]},
    {"id":"interstate-twenty","name":"Interstate Twenty","kind":"interstate","pts":[[-485,419],[-238,330],[397,360],[1283,594],[2046,657]]},
    {"id":"us-highway-165","name":"the north-south US highway","kind":"interstate","pts":[[607,-2046],[460,-508],[397,338],[354,2046]]},
    {"id":"louisville-avenue","name":"Louisville Avenue","kind":"avenue","pts":[[-657,-468],[-313,-872],[16,-1269],[313,-1596]]},
    {"id":"desiard-street","name":"DeSiard Street","kind":"avenue","pts":[[-923,7],[-673,56],[-156,-111],[407,-297],[1095,-371],[1658,-297]]},
    {"id":"cypress-street","name":"Cypress Street","kind":"avenue","pts":[[-2034,-223],[-1565,-148],[-1189,-56]]},
    {"id":"trenton-street","name":"Trenton Street","kind":"street","pts":[[-1408,-445],[-1283,0],[-1158,371]]},
    {"id":"endom-bridge","name":"the Endom Bridge","kind":"bridge","pts":[[-1189,-56],[-1058,-22],[-923,7]]},
  ],
  districts: [
    {"id":"downtown-monroe","name":"Downtown Monroe","character":"downtown","poly":[[-782,-148],[-282,-148],[-282,297],[-782,297]]},
    {"id":"monroe-north","name":"north Monroe","character":"suburb","poly":[[-907,-1410],[313,-1410],[313,-148],[-907,-148]]},
    {"id":"ulm-campus","name":"the university campus on Bayou DeSiard","character":"campus","poly":[[313,-928],[907,-928],[907,-445],[313,-445]]},
    {"id":"west-monroe-town","name":"West Monroe and Antique Alley","character":"quarter","poly":[[-1721,-371],[-1346,-371],[-1346,186],[-1721,186]]},
    {"id":"west-monroe-suburbs","name":"the West Monroe neighbourhoods","character":"suburb","poly":[[-2034,-1113],[-1721,-1113],[-1721,742],[-2034,742]]},
    {"id":"south-monroe","name":"south Monroe","character":"suburb","poly":[[-469,371],[313,371],[313,1484],[-469,1484]]},
    {"id":"airport-industrial","name":"the airport and the east-side industrial blocks","character":"industrial","poly":[[907,-371],[2034,-371],[2034,519],[907,519]]},
    {"id":"west-monroe-mill","name":"the riverside industrial land south of West Monroe","character":"industrial","poly":[[-2034,816],[-1408,816],[-1408,2004],[-2034,2004]]},
    {"id":"east-monroe","name":"east Monroe","character":"suburb","poly":[[313,-445],[907,-445],[907,371],[313,371]]},
    {"id":"forsythe-park","name":"the riverside park north of downtown","character":"park","poly":[[-1127,-891],[-907,-891],[-907,-519],[-1127,-519]]},
  ],
  sites: [
    {"id":"mon-workforce-centre","name":"Monroe Workforce Centre","kind":"civic","position":[-469,130],"trades":["carpenters","ibew","liuna","ua"],"programmes":["job-readiness-edition","civic-leadership-and-ei"],"stations":["jobsite-orientation-and-osha-10","apprenticeship-application-and-test","union-hall-and-dispatch","constituent-service-desk"],"blurb":"Where learners start in Monroe: the site orientation, the apprenticeship application and the dispatch board of the trades north Louisiana's projects call for (a procedural centre). A trade reference only: no employer's or union's programme is delivered here."},
    {"id":"mon-river-bridge-work","name":"Ouachita River Bridge Crew","kind":"bridge","position":[-548,390],"trades":["ironworkers","iupat","iuoe"],"programmes":["bridge-and-structural"],"stations":["bridge-lead-containment","deck-joint-replacement","bs-bearing-replacement-and-jacking"],"blurb":"A procedural bridge job on the Monroe bank: old paint contained, a deck joint replaced and a bearing jacked."},
    {"id":"mon-levee-floodwall","name":"Riverfront Floodwall Crew","kind":"floodwall","position":[-735,93],"trades":["iuoe","carpenters","liuna"],"programmes":["heavy-equipment-operators","bridge-and-structural"],"stations":["br-levee-inspection-and-seepage","formwork-shoring","concrete-pour"],"blurb":"A procedural floodwall job behind downtown: the wall and levee walked for seepage, a panel formed and poured."},
    {"id":"mon-riverfront-streetscape","name":"Riverfront Streetscape Dig","kind":"excavation","position":[-579,167],"trades":["iuoe","liuna","ua"],"programmes":["heavy-equipment-operators","plumbers-and-pipefitters"],"stations":["trench-box","op-excavator-trench-and-utility-locate","ut-service-line-locate-and-hand-dig-near-gas-main"],"blurb":"A procedural streetscape dig downtown: the lines located and hand-dug, the excavator in the trench and the trench box."},
    {"id":"mon-hospital-expansion","name":"Hospital Expansion","kind":"hospital","position":[0,-705],"trades":["ua","ibew","nnu","seiu"],"programmes":["plumbers-and-pipefitters","first-responders"],"stations":["pl-medical-gas-brazing-and-purge","hc-patient-transport-and-safe-handling","pm-sprinkler-riser-room"],"blurb":"A procedural hospital wing in north Monroe: medical gas brazed and purged, safe patient handling and the sprinkler riser room."},
    {"id":"mon-mill-turnaround-staging","name":"Mill Turnaround Staging Area","kind":"refinery","position":[-1721,1410],"trades":["usw","ibb","ua","insulators"],"programmes":["insulators-and-boilermakers","confined-space"],"stations":["ib-pressure-vessel-confined-entry-and-hot-work","ib-boiler-tube-replacement-and-rolling","cs-permit-entry-and-attendant-duties"],"blurb":"A procedural turnaround staging area on the riverside industrial land: confined entry and hot work on a vessel, boiler tubes rolled and the entry attendant. No real plant is part of this lesson."},
    {"id":"mon-airport-apron","name":"Airport Apron Crew","kind":"airport","position":[1596,111],"trades":["iam","teamsters"],"programmes":["aviation-maintenance-and-ground"],"stations":["airport-ramp","av-marshalling-and-wingwalker-signals","av-pushback-tug-and-towbar-connection"],"blurb":"The regional airport's apron (a procedural site): marshalling and wingwalkers and the pushback tug."},
    {"id":"mon-i20-bridge-deck","name":"Interstate Deck Crew","kind":"bridge-yard","position":[782,408],"trades":["ironworkers","iuoe","liuna"],"programmes":["bridge-and-structural"],"stations":["deck-joint-replacement","bs-structural-bolting-and-torque","traffic-incident-management"],"blurb":"A procedural interstate overpass deck job east of the highway interchange: a joint replaced, bolts torqued and the lane closure kept safe."},
    {"id":"mon-water-plant","name":"Water Plant","kind":"pump","position":[-376,-1150],"trades":["iuoe","uwua","ibew"],"programmes":["water-and-gas-utility-crews","confined-space"],"stations":["lift-station","motor-control-center","cs-permit-entry-and-attendant-duties"],"blurb":"A procedural water plant by Bayou DeSiard: the pumps, the motor control centre and the permit for a tank entry."},
    {"id":"mon-substation-build","name":"Substation Build","kind":"substation","position":[1252,-111],"trades":["ibew"],"programmes":["energy-transition","electrical-first-period"],"stations":["substation-switching","temporary-site-power","transformer-vault"],"blurb":"A procedural substation going up on the east side: switching under a permit, temporary power and the transformer vault."},
    {"id":"mon-rail-yard","name":"South Monroe Rail Yard","kind":"rail","position":[-344,928],"trades":["smart-td","bmwed","blet"],"programmes":["railroad-crafts"],"stations":["ra-blue-flag-protection-in-the-yard","rcl-switching","ra-air-brake-test-and-train-inspection"],"blurb":"A procedural rail yard in south Monroe: blue flag protection, switching and the air brake test."},
    {"id":"mon-warehouse-steel","name":"Warehouse Steel Erection","kind":"construction","position":[1095,260],"trades":["ironworkers","carpenters","iuoe"],"programmes":["bridge-and-structural","rigging-lifting"],"stations":["bs-structural-bolting-and-torque","rl-critical-lift-plan-and-signalperson","jobsite-orientation-and-osha-10"],"blurb":"A procedural warehouse frame going up by the airport: the lift plan and signalperson and the ironworkers bolting."},
    {"id":"mon-school-renovation","name":"School Renovation","kind":"school","position":[-31,816],"trades":["aft","seiu","carpenters"],"programmes":["education-support-staff","k12-literacy-and-life-skills"],"stations":["ed-custodial-chemical-dilution-and-floor-machine","ed-playground-equipment-inspection","ed-crossing-guard-intersection-control"],"blurb":"A procedural school under renovation in south Monroe: the custodians' chemical room, the playground and the crossing guard."},
    {"id":"mon-transit-shelters","name":"Transit Shelters and Bus Yard","kind":"transit","position":[-250,-260],"trades":["atu","iam"],"programmes":["transit-ramp"],"stations":["bus-yard-fuelling-and-brake-check","bus-depot-lift","tr-wheelchair-lift-and-securement-on-a-bus"],"blurb":"A procedural bus yard and new shelters: fuelling and the brake check, the depot lift and the ramp for every rider."},
    {"id":"mon-downtown-facade","name":"Downtown Facade Restoration","kind":"construction","position":[-626,-74],"trades":["bac","opcmia","carpenters"],"programmes":["builders-trades"],"stations":["masonry-silica-scaffold","bt-masonry-wall-layout-and-mortar","scaffold-erection"],"blurb":"A procedural downtown storefront restored: the scaffold, silica dust controlled and the masonry relaid."},
    {"id":"mon-fire-station","name":"West Monroe Fire Station","kind":"fire-station","position":[-1596,371],"trades":["iaff","naemt"],"programmes":["first-responders"],"stations":["ambulance-scene-safety","traffic-incident-management","aerial-ladder"],"blurb":"A procedural fire station in West Monroe: the ambulance scene, a lane of the interstate cleared safely and the ladder check."},
    {"id":"mon-west-monroe-warehouse","name":"West Monroe Distribution Dock","kind":"warehouse","position":[-1909,37],"trades":["teamsters"],"programmes":["warehouse-and-logistics-automation"],"stations":["forklift-dock","tdl-trailer-loading-and-dock-plate","tw-high-bay-order-picker-fall-protection"],"blurb":"A procedural distribution dock in West Monroe: the forklift at the dock, the dock plate and the order picker's harness."},
    {"id":"mon-boat-launch-rebuild","name":"Boat Launch Rebuild","kind":"landing","position":[-1127,-482],"trades":["ibu","liuna","iuoe"],"programmes":["port-operations","heavy-equipment-operators"],"stations":["br-cold-water-immersion-and-mob-recovery","op-pile-driving-rig-and-lead-setup","mw-workboat-towing-and-line-handling"],"blurb":"A procedural boat launch being rebuilt on the Ouachita's bank: piles driven, the workboat's lines and the person-overboard drill."},
  ],
  landmarks: [
    {"id":"mon-sign","name":"a sign: the site layouts are illustrative; the cities, the river and the roads are real","position":[-391,241],"kind":"place"},
    {"id":"ouachita-bridge-lm","name":"the interstate bridge over the Ouachita","position":[-595,464],"kind":"bridge"},
    {"id":"bayou-desiard-lm","name":"Bayou DeSiard","position":[595,-965],"kind":"shore"},
    {"id":"antique-alley-lm","name":"Antique Alley","position":[-1471,111],"kind":"place"},
    {"id":"ulm-lm","name":"the university on Bayou DeSiard","position":[626,-705],"kind":"place"},
    {"id":"west-monroe-levee-lm","name":"the West Monroe levee","position":[-1486,-371],"kind":"place"},
  ],
  connectors: [
    {"id":"ac-mon-i20-east","kind":"road","name":"Interstate Twenty east toward Richland Parish (no map yet)","from":{"parish":"monroe-west-monroe","position":[2040,657]},"to":{"parish":"ouachita-east-i20","position":null,"lonlat":[-92.0298,32.4923]},"lonlat":[-92.0298,32.4923],"approximate":true},
    {"id":"ac-mon-i20-west","kind":"road","name":"Interstate Twenty west toward Ruston (no map yet)","from":{"parish":"monroe-west-monroe","position":[-2040,130]},"to":{"parish":"ouachita-west-i20","position":null,"lonlat":[-92.1602,32.5065]},"lonlat":[-92.1602,32.5065],"approximate":true},
  ],
  fieldLessons: [
    {"id":"ac-fl-the-ouachitas-current","title":"The Ouachita's Current","site":"mon-boat-launch-rebuild","landmark":"ouachita-bridge-lm","k12":"k12-by-the-rivers-current-and-a-pilots-job","station":"br-cold-water-immersion-and-mob-recovery","trade":"Deckhands","tradeLine":"A deckhand wears a life jacket and knows the overboard drill, because a river's current is stronger than it looks.","minutes":3,"steps":["A river flows downstream all the time, faster in the middle.","Boats slow down near a launch and near people in the water.","Everyone on the water wears a life jacket."],"check":{"q":"What does everyone wear on a workboat?","options":["A life jacket","Heavy boots only","Nothing special"],"answer":0,"why":"A life jacket keeps you afloat if the current takes you."}},
    {"id":"ac-fl-how-the-floodwall-works","title":"How the Floodwall Works","site":"mon-levee-floodwall","landmark":"mon-sign","k12":"k12-by-how-a-levee-holds-water-back","station":"br-levee-inspection-and-seepage","trade":"Levee crews","tradeLine":"A levee crew walks the wall and the ground behind it for seeps, so a small leak is fixed before high water.","minutes":3,"steps":["The river rises after long rain upstream.","The wall and the levee hold the river back from the streets.","Crews look for water seeping under the wall and report it at once."],"check":{"q":"What do crews look for behind a floodwall?","options":["Water seeping through","Lost coins","Birds' nests"],"answer":0,"why":"A seep is a warning sign a crew fixes before high water."}},
    {"id":"ac-fl-reading-the-yard-signals","title":"Reading the Yard Signals","site":"mon-rail-yard","landmark":"antique-alley-lm","k12":"k12-reading-instructions-and-safety-labels","station":"ra-blue-flag-protection-in-the-yard","trade":"Railroad carmen","tradeLine":"A blue flag on a track means people are working there, so no train moves onto it.","minutes":3,"steps":["A rail yard has many tracks and moving cars.","A blue flag or light means a crew is working on that track.","Nobody moves a car past a blue flag."],"check":{"q":"What does a blue flag on a track mean?","options":["People are working there: do not move cars","The track is closed for ever","It is a birthday"],"answer":0,"why":"The blue flag protects the crew working on that track."}},
  ],
  gated: [
    {"id":"monroe-west-monroe-gated-river-rise","kind":"side-quest","title":"The River Rises","site":"mon-levee-floodwall","summary":"Walk the floodwall with the crew as the Ouachita rises and flag each seep.","gate":{"stations":["br-levee-inspection-and-seepage"],"note":"Finish the levee inspection and seepage station before the river walk"},"world":"parishes","parish":"monroe-west-monroe","siteName":"Riverfront Floodwall Crew"},
    {"id":"monroe-west-monroe-gated-bridge-night","kind":"side-quest","title":"A Night Shift on the Bridge","site":"mon-river-bridge-work","summary":"Contain and clean a bridge section under lights with the lane closed.","gate":{"stations":["bridge-lead-containment"],"note":"Finish the bridge lead containment station before the night shift"},"world":"parishes","parish":"monroe-west-monroe","siteName":"Ouachita River Bridge Crew"},
  ],
};
