// Baton Rouge — North River Industry Corridor (console CAPITAL, docs/consoles/CAPITAL.md, docs/parishes.md). A stylised
// 4096 m map at district scale (about 1.5 real metres per map metre), north of and sharing an edge with
// br-downtown-riverfront. Only public roads, the river and the levee are named; the terminals, shops, yards and every
// site layout are procedural, and no private plant is named or part of any lesson. Every coordinate is approximate.
// Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).
// Written once by tools/gen_cap_capital.py; this module is the source afterwards. Pure data, no imports.
export const NP_BR_NORTH_INDUSTRIAL = {
  id: "br-north-industrial",
  name: "Baton Rouge — North River Industry Corridor",
  region: "louisiana-cities",
  size: 4096,
  scale: 1.5,
  blurb: "The river industry corridor north of downtown Baton Rouge at street scale: the Mississippi and its east bank levee, River Road, Scenic Highway, Interstate One-Ten, a rail line and a procedural stretch of river terminals, fabrication shops and turnaround yards. No private plant is named or part of any lesson: the sites teach turnaround staging, pipe fabrication, scaffolding, insulation, rail and river work as trade references. The site layouts are illustrative (procedural); the river, streets and places are real.",
  start: "brn-workforce-trailer",
  anchors: [
    {"xz":[-1535,401],"lonlat":[-91.199,30.5],"approximate":true,"name":"the Mississippi River north of downtown"},
    {"xz":[-959,1885],"lonlat":[-91.19,30.48],"approximate":true,"name":"River Road north of downtown"},
    {"xz":[575,1885],"lonlat":[-91.166,30.48],"approximate":true,"name":"Interstate One-Ten north of downtown"},
    {"xz":[1471,-1084],"lonlat":[-91.152,30.52],"approximate":true,"name":"Interstate One-Ten to the north"},
    {"xz":[-128,772],"lonlat":[-91.177,30.495],"approximate":true,"name":"Scenic Highway"},
    {"xz":[1599,401],"lonlat":[-91.15,30.5],"approximate":true,"name":"the neighbourhoods east of the corridor"},
    {"xz":[-1151,-193],"lonlat":[-91.193,30.508],"approximate":true,"name":"the Huey P. Long Bridge's east landing"},
  ],
  water: [
    {"id":"mississippi-river","name":"Mississippi River","kind":"river","poly":[[-2046,-1900],[-1630,-1603],[-1375,-1269],[-1311,-712],[-1151,30],[-1119,1143],[-1119,2048],[-1650,2048],[-1675,1143],[-1707,30],[-1758,-712],[-2046,-972]]},
    {"id":"corridor-drainage-canal","name":"a drainage canal (procedural)","kind":"canal","width":10,"poly":[[2046,401],[1471,327],[959,178]]},
    {"id":"corridor-retention-pond","name":"a stormwater pond (procedural)","kind":"lake","poly":[[1215,-1380],[1407,-1380],[1407,-1232],[1215,-1232]]},
  ],
  levees: [
    {"id":"east-bank-levee","name":"the east bank levee","height":4.5,"pts":[[-2046,-2011],[-1567,-1751],[-1298,-1343],[-1234,-712],[-1074,30],[-1042,1143],[-1042,2048]]},
    {"id":"west-bank-levee","name":"the west bank levee","height":4.5,"pts":[[-1726,2048],[-1758,1143],[-1790,30],[-1835,-712],[-2046,-876]]},
  ],
  roads: [
    {"id":"river-road","name":"River Road","kind":"riverroad","pts":[[-959,2048],[-959,1143],[-991,30],[-1151,-712],[-1215,-1269],[-1503,-1714],[-1918,-2011]]},
    {"id":"scenic-highway","name":"Scenic Highway","kind":"avenue","pts":[[-128,2048],[-128,30],[-128,-2011]]},
    {"id":"interstate-one-ten","name":"Interstate One-Ten","kind":"interstate","pts":[[563,2048],[659,1046],[1068,-178],[1471,-1084],[1854,-2011]]},
    {"id":"highway-one-ninety-bridge","name":"Highway One-Ninety and the Huey P. Long Bridge","kind":"bridge","pts":[[-2046,-156],[-1151,-156],[-128,-119],[959,-82],[2046,-45]]},
    {"id":"corridor-rail-line","name":"the corridor rail line (procedural)","kind":"street","pts":[[-575,2048],[-639,30],[-703,-2011]]},
    {"id":"plank-road","name":"Plank Road","kind":"avenue","pts":[[703,2048],[1215,772],[1726,-712],[2046,-1529]]},
    {"id":"cross-street-south","name":"a cross street to the river (procedural)","kind":"street","pts":[[-863,957],[2046,957]]},
    {"id":"cross-street-north","name":"a second cross street to the river (procedural)","kind":"street","pts":[[-991,-712],[2046,-712]]},
  ],
  districts: [
    {"id":"river-terminals","name":"the river terminals (procedural)","character":"port","poly":[[-1183,-1084],[-895,-1084],[-831,2048],[-927,2048]]},
    {"id":"industry-corridor","name":"the river industry corridor (procedural)","character":"refinery","poly":[[-831,-1084],[-160,-1084],[-160,2048],[-831,2048]]},
    {"id":"fab-and-yards","name":"the fabrication shops and yards (procedural)","character":"industrial","poly":[[-96,-2011],[639,-2011],[575,2048],[-96,2048]]},
    {"id":"north-bend","name":"the neighbourhoods at the river's bend","character":"suburb","poly":[[-1503,-2011],[-160,-2011],[-160,-1158],[-1247,-1158]]},
    {"id":"east-neighbourhoods","name":"the neighbourhoods east of the corridor","character":"suburb","poly":[[703,-2011],[2046,-2011],[2046,2048],[639,2048]]},
  ],
  sites: [
    {"id":"brn-workforce-trailer","name":"Corridor Workforce Trailer","kind":"office","position":[384,1514],"trades":["liuna","ua","iuoe"],"programmes":["job-readiness-edition","builders-trades"],"stations":["jobsite-orientation-and-osha-10","apprenticeship-application-and-test","union-hall-and-dispatch"],"blurb":"A procedural trailer where crews for the corridor's shops and yards sign in: orientation, the day's job briefing and the dispatch board. Trade reference only. The site layouts are illustrative (procedural); the river, streets and places are real."},
    {"id":"brn-turnaround-staging","name":"Turnaround Staging Yard","kind":"staging","position":[-512,401],"trades":["ua","insulators","ibb"],"programmes":["insulators-and-boilermakers","plumbers-and-pipefitters"],"stations":["ib-pressure-vessel-confined-entry-and-hot-work","scaffold-erection","hz-drum-staging-and-compatibility-segregation"],"blurb":"A procedural staging yard for a planned shutdown: vessels opened only on a permit, scaffold tagged before use, drums segregated by what they hold. No private plant is part of this lesson."},
    {"id":"brn-pipe-fab-shop","name":"Pipe Fabrication Shop","kind":"workshop","position":[-128,698],"trades":["ua","iuoe"],"programmes":["plumbers-and-pipefitters","rigging-lifting"],"stations":["welding","pl-natural-gas-pressure-test-and-leak-check","forklift-dock"],"blurb":"A procedural shop where spools are cut, fitted and welded: fume extraction on, the test done behind a barricade, forklifts kept out of the walkway."},
    {"id":"brn-scaffold-yard","name":"Scaffold Yard","kind":"yard","position":[-160,-193],"trades":["carpenters","liuna"],"programmes":["fall-protection","builders-trades"],"stations":["scaffold-erection","leading-edge-and-horizontal-lifeline","tdl-trailer-loading-and-dock-plate"],"blurb":"Scaffold stock sorted, inspected and loaded out: damaged tube tagged, loads strapped and the builder tied off on the rising deck."},
    {"id":"brn-rail-yard","name":"Corridor Rail Yard","kind":"rail","position":[-607,-1084],"trades":["smart-td","bmwed","brs"],"programmes":["railroad-crafts"],"stations":["ra-blue-flag-protection-in-the-yard","ra-switch-inspection-and-lubrication","ra-roadway-worker-protection-and-job-briefing"],"blurb":"A procedural rail yard serving the corridor: blue flags before anyone goes between cars, switches inspected and a job briefing before the track."},
    {"id":"brn-river-terminal","name":"River Terminal Dock","kind":"port","position":[-927,-490],"trades":["ila","ibu","iuoe"],"programmes":["port-operations","ports-maritime-ecology"],"stations":["mooring-line","dock-crane","spill-boom-deploy"],"blurb":"A procedural river terminal on the east bank: lines handled out of the snap-back zone, the dock crane's load kept over the deck and a spill boom ready."},
    {"id":"brn-tank-farm-maintenance","name":"Tank Farm Maintenance Crew","kind":"chemical","position":[-575,1291],"trades":["usw","ua"],"programmes":["confined-space","hazmat-environmental"],"stations":["tank-lining","cs-ventilation-and-air-monitoring-plan","confined-rescue"],"blurb":"A procedural tank out of service for its lining: ventilation running, the air tested and a rescue plan in place before entry."},
    {"id":"brn-insulation-shop","name":"Insulation Shop","kind":"workshop","position":[96,-935],"trades":["insulators"],"programmes":["insulators-and-boilermakers"],"stations":["ib-asbestos-glovebag-removal-on-a-pipe","ib-firestop-and-fire-wrap-installation","ib-refractory-and-castable-installation"],"blurb":"Where insulators prepare jackets and fire wrap: old lagging treated as suspect until tested, and removed only in a glovebag."},
    {"id":"brn-crane-yard","name":"Crane Yard","kind":"yard","position":[-64,-1529],"trades":["iuoe"],"programmes":["heavy-equipment-operators","rigging-lifting"],"stations":["op-crawler-crane-assembly-and-load-chart","op-equipment-daily-walkaround-and-fluids","gg-fog-and-wind-work-stop"],"blurb":"A procedural crane yard: booms assembled on firm mats, the walkaround done every morning and the lift stopped when the wind rises."},
    {"id":"brn-substation","name":"Corridor Substation","kind":"substation","position":[192,475],"trades":["ibew"],"programmes":["electrical-first-period","energy-transition"],"stations":["substation-switching","arc-flash-label-study","motor-control-center"],"blurb":"A procedural substation feeding the yards: switching orders read back and the motor control centre locked out before service."},
    {"id":"brn-levee-patrol","name":"Levee Patrol Point","kind":"levee","position":[-914,698],"trades":["liuna","afscme"],"programmes":["bay-restoration-maritime-underwater"],"stations":["br-levee-inspection-and-seepage","br-cold-water-immersion-and-mob-recovery","tide-gate"],"blurb":"The east bank levee walked in high water: seepage and sand boils looked for on the land side, a throw line kept near the river."},
    {"id":"brn-truck-gate","name":"Truck Gate","kind":"trucking","position":[224,-341],"trades":["teamsters"],"programmes":["warehouse-and-logistics-automation"],"stations":["tdl-pretrip-inspection","po-yard-hostler-and-pedestrian-separation","tdl-air-brake-test"],"blurb":"A procedural truck gate: the pre-trip walkaround, the air brakes tested and pedestrians kept on their own marked path."},
    {"id":"brn-hydrotest-crew","name":"Hydrotest Crew","kind":"utility","position":[-384,-638],"trades":["ua","iuoe"],"programmes":["plumbers-and-pipefitters"],"stations":["pl-natural-gas-pressure-test-and-leak-check","valve-vault","hz-drum-staging-and-compatibility-segregation"],"blurb":"A new line filled and pressure tested: the test area barricaded, the gauge read from outside the line of fire and the water disposed of as the permit says."},
    {"id":"brn-welding-school","name":"Welding Training Bay","kind":"workshop","position":[703,401],"trades":["ua","ironworkers"],"programmes":["plumbers-and-pipefitters","bridge-and-structural"],"stations":["welding","sm-tig-and-spot-welding","shipyard-hotwork"],"blurb":"A procedural training bay where new welders learn: screens up, fume extraction on, and a fire watch that stays after the arc goes out."},
    {"id":"brn-fire-training-ground","name":"Fire Training Ground","kind":"fire","position":[959,-1306],"trades":["iaff"],"programmes":["first-responders","hazmat-environmental"],"stations":["structure-fire-sizeup","hazmat-container-inspection","firefighter-rehab-sector"],"blurb":"A procedural training ground for industrial fire and hazmat response: the size-up, reading a container's markings from upwind and rehab after the drill."},
    {"id":"brn-storm-drain-crew","name":"Storm Drain Crew","kind":"stormwater","position":[1215,1291],"trades":["liuna","afscme"],"programmes":["water-and-gas-utility-crews","confined-space"],"stations":["manhole-entry-and-atmospheric-monitoring","stormwater-outfall","cs-non-entry-retrieval-and-tripod"],"blurb":"Drains cleared in the neighbourhoods east of the corridor: air tested at the manhole and a tripod set before anyone goes down."},
  ],
  landmarks: [
    {"id":"river-north-of-downtown","name":"the Mississippi north of downtown","position":[-991,104],"kind":"shore"},
    {"id":"scenic-highway-place","name":"Scenic Highway","position":[-288,920],"kind":"neighbourhood"},
    {"id":"corridor-rail-place","name":"the corridor rail line (procedural)","position":[-652,-341],"kind":"point"},
    {"id":"east-neighbourhoods-place","name":"the neighbourhoods east of the corridor","position":[1279,-341],"kind":"neighbourhood"},
    {"id":"no-plant-named-sign","name":"a sign: the site layouts are illustrative and no private plant is named; the river and roads are real","position":[320,1885],"kind":"point"},
    {"id":"levee-crown","name":"the east bank levee","position":[-991,-1084],"kind":"levee"},
  ],
  connectors: [
    {"id":"cap-bn-interstate-one-ten-south","kind":"road","name":"Interstate One-Ten south to downtown","from":{"parish":"br-north-industrial","position":[563,1989]},"to":{"parish":"br-downtown-riverfront","position":[1203,-2004],"lonlat":[-91.1662,30.477]},"lonlat":[-91.1662,30.4777],"approximate":true},
    {"id":"cap-bn-river-road-south","kind":"road","name":"River Road south to the downtown riverfront","from":{"parish":"br-north-industrial","position":[-959,1989]},"to":{"parish":"br-downtown-riverfront","position":[-320,-2004],"lonlat":[-91.19,30.477]},"lonlat":[-91.19,30.4777],"approximate":true},
  ],
  fieldLessons: [
    {"id":"cap-bn-fl-the-rivers-current","title":"The River's Current and the Deck Crew","site":"brn-river-terminal","landmark":"river-north-of-downtown","k12":"k12-by-the-rivers-current-and-a-pilots-job","station":"mooring-line","trade":"Deckhands","tradeLine":"A deckhand handles mooring lines from outside the snap-back zone, because the river's current keeps a line under strain.","minutes":3,"steps":["Look out at the river from the terminal.","The current pushes every barge and boat downstream, so lines hold them against the dock.","Deckhands stand clear of the snap-back zone in case a line parts."],"check":{"q":"Why do deckhands stand out of the snap-back zone?","options":["A line under strain can whip back if it breaks","It is the warmest spot","To see the fish"],"answer":0,"why":"A parted line can snap back hard, so crews stand where it cannot reach."}},
    {"id":"cap-bn-fl-reading-the-labels","title":"Reading the Labels on the Drums","site":"brn-turnaround-staging","k12":"k12-reading-instructions-and-safety-labels","station":"hz-drum-staging-and-compatibility-segregation","trade":"Pipefitters","tradeLine":"A pipefitter reads a drum's label before moving it, and keeps drums that must not mix apart.","minutes":3,"steps":["Find the rows of drums in the staging yard.","Each label says what is inside and what it must be kept away from.","Crews read the label first and store drums that must not mix in separate rows."],"check":{"q":"What should a worker do before moving a drum?","options":["Read its label","Shake it","Guess from its colour"],"answer":0,"why":"The label says what is inside and how to handle and store it safely."}},
    {"id":"cap-bn-fl-who-does-this-work","title":"Who Does This Work?","site":"brn-welding-school","k12":"k12-es-who-does-this-work","station":"welding","trade":"Welders","tradeLine":"A welder joins steel with an arc behind a screen, with fresh air pulled past the helmet and a fire watch after the work.","minutes":3,"steps":["Look into the training bay where new welders learn.","Welders join metal pieces so pipes and frames hold together.","They work behind screens, wear helmets and keep a fire watch after the arc goes out."],"check":{"q":"Why does a fire watch stay after the welding stops?","options":["Hot sparks can start a fire after the arc goes out","To lock the door","To count the welds"],"answer":0,"why":"Sparks and hot metal can smoulder, so someone watches the area after the work."}},
  ],
  gated: [
    {"id":"cap-bn-gated-turnaround-permit","kind":"side-quest","title":"Open a Vessel on a Permit","world":"parishes","parish":"br-north-industrial","site":"brn-turnaround-staging","siteName":"Turnaround Staging Yard","summary":"Stage a procedural vessel entry for a planned shutdown: the permit, the air test and the hot work watch.","gate":{"stations":["ib-pressure-vessel-confined-entry-and-hot-work","cs-permit-entry-and-attendant-duties"],"note":"Finish the pressure vessel entry and permit entry stations first"}},
    {"id":"cap-bn-gated-blue-flag","kind":"side-quest","title":"Blue Flag the Yard Track","world":"parishes","parish":"br-north-industrial","site":"brn-rail-yard","siteName":"Corridor Rail Yard","summary":"Protect a crew working between cars with blue flags and a job briefing.","gate":{"stations":["ra-blue-flag-protection-in-the-yard","ra-roadway-worker-protection-and-job-briefing"],"note":"Finish the blue flag and roadway worker protection stations first"}},
  ],
};
