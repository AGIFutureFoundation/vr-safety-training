// Black Bayou Energy Hub, Cameron Parish — a Louisiana development site area on the parish schema (console SITES-COAST, docs/consoles/SITES-COAST.md,
// docs/parishes.md). A stylised 4096 m map, not a survey: real places appear only by their public names as places; every
// coordinate is approximate (three decimals, `approximate: true`) and exists only to place the map. One north-up uniform
// scale (x east, +z south). About three real metres per map metre: Cameron Parish marsh around the Black Bayou salt dome, Black Bayou itself, the Gulf
// Intracoastal Waterway across the field (its course approximate) and the marsh either side.
// THE PROJECT LAYOUT IS ILLUSTRATIVE; THE PARISH, WATERWAYS AND TOWNS ARE REAL. No site plan is published: every pad, yard,
// building and crew here is the platform's PROCEDURAL illustration. Project facts are only those of the facts file, in its
// words. The platform has no partnership with the company named; crafts are trade references, never an employer's programme.
// Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).
// Written once by tools/gen_lc_sites.mjs; this module is the source afterwards. Pure data, no imports.

export const NP_LA_BLACK_BAYOU_CAMERON = {
  id: "la-black-bayou-cameron",
  name: "Black Bayou Energy Hub — Cameron Parish marsh",
  region: "louisiana-sites",
  size: 4096,
  scale: 3,
  blurb: "Cameron Parish marsh around the Black Bayou salt dome, where the Black Bayou Energy Hub is planned ($1.6 billion; natural gas storage, blending and transport; 1,000+ construction jobs at peak; operations late 2028, per the sources in the facts file): wellpads on board roads, a compressor station, a pipeline spread across the marsh, and the Gulf Intracoastal Waterway. The project layout is illustrative; the parish, waterways and towns are real.",
  project: {"name":"Black Bayou Energy Hub","facts":"Cameron Parish (Black Bayou salt dome) and a Lafayette headquarters; $1.6 billion; 58 new jobs; 1,000+ construction jobs at peak; natural gas storage, blending and transport; operations late 2028","sources":["opportunitylouisiana.gov news","americanpress.com 2026-09-11"],"illustrative":true},
  start: "lbb-workforce-trailer",
  anchors: [
    {"xz":[0,0],"lonlat":[-93.6,30.03],"approximate":true,"name":"the Black Bayou salt dome (approximate)"},
    {"xz":[-643,-370],"lonlat":[-93.62,30.04],"approximate":true,"name":"Black Bayou, upper reach"},
    {"xz":[-1606,1478],"lonlat":[-93.65,29.99],"approximate":true,"name":"Black Bayou, lower reach"},
    {"xz":[-1767,-1072],"lonlat":[-93.655,30.059],"approximate":true,"name":"the Gulf Intracoastal Waterway, west"},
    {"xz":[1767,-1072],"lonlat":[-93.545,30.059],"approximate":true,"name":"the Gulf Intracoastal Waterway, east"},
    {"xz":[321,1848],"lonlat":[-93.59,29.98],"approximate":true,"name":"Cameron Parish marsh, south"},
    {"xz":[1606,-1848],"lonlat":[-93.55,30.08],"approximate":true,"name":"Cameron Parish marsh, north-east"},
  ],
  hills: [],
  water: [
    {"id":"black-bayou","name":"Black Bayou","kind":"bayou","width":22,"poly":[[-560,-1060],[-600,-600],[-700,0],[-900,500],[-1200,1100],[-1500,1600],[-1900,2048]]},
    {"id":"gulf-intracoastal-waterway","name":"the Gulf Intracoastal Waterway","kind":"canal","width":40,"poly":[[-2048,-1085],[0,-1080],[2048,-1075]]},
    {"id":"marsh-north","name":"the marsh north of the waterway","kind":"wetland","poly":[[-2048,-2048],[2048,-2048],[2048,-1500],[-2048,-1500]]},
    {"id":"marsh-south-west","name":"the marsh south-west of the dome","kind":"wetland","poly":[[-2048,700],[-800,700],[-800,2048],[-2048,2048]]},
    {"id":"marsh-south-east","name":"the marsh south-east of the dome","kind":"wetland","poly":[[900,900],[2048,900],[2048,2048],[900,2048]]},
    {"id":"brine-pond","name":"the brine pond (procedural)","kind":"lake","poly":[[1150,-250],[1450,-250],[1450,0],[1150,0]]},
    {"id":"marsh-pond","name":"a marsh pond (procedural)","kind":"lake","poly":[[-1700,1300],[-1300,1250],[-1250,1600],[-1650,1650]]},
    {"id":"pipeline-canal","name":"an old pipeline canal (procedural)","kind":"canal","width":14,"poly":[[200,400],[900,600],[1600,800],[2048,900]]},
  ],
  levees: [
    {"id":"wellpad-ring-levee","name":"the wellpad ring levee (procedural)","height":4,"pts":[[-332,-332],[328,-332],[328,328],[-332,328],[-332,-332]]},
    {"id":"compressor-berm","name":"the compressor station berm (procedural)","height":2,"pts":[[500,-500],[1000,-500],[1000,-150]]},
  ],
  roads: [
    {"id":"parish-road-north","name":"the parish road north toward Vinton (procedural course)","kind":"avenue","pts":[[150,-2048],[160,-1200],[140,-800],[120,-350]]},
    {"id":"board-road-west","name":"the marsh board road west (procedural)","kind":"riverroad","pts":[[-300,0],[-900,50],[-1500,200],[-1900,400]]},
    {"id":"board-road-south","name":"the marsh board road south (procedural)","kind":"riverroad","pts":[[0,320],[100,900],[300,1500]]},
    {"id":"station-road","name":"the station road (procedural)","kind":"street","pts":[[140,-350],[700,-380],[1200,-400],[1700,-380]]},
    {"id":"pipeline-right-of-way","name":"the right-of-way (procedural)","kind":"riverroad","pts":[[-2048,-1210],[0,-1200],[2048,-1190]]},
    {"id":"dock-lane","name":"the dock lane (procedural)","kind":"street","pts":[[140,-880],[750,-930]]},
  ],
  districts: [
    {"id":"dome-pad","name":"the salt dome pads (illustrative)","character":"refinery","poly":[[-400,-500],[450,-500],[450,450],[-400,450]]},
    {"id":"station-yard","name":"the compressor and blending yard (illustrative)","character":"refinery","poly":[[450,-700],[1800,-700],[1800,200],[450,200]]},
    {"id":"north-bank","name":"the waterway's north bank","character":"industrial","poly":[[-800,-1450],[900,-1450],[900,-850],[-800,-850]]},
    {"id":"marsh-north","name":"the marsh north of the waterway","character":"wetland","poly":[[-2048,-2048],[2048,-2048],[2048,-1500],[-2048,-1500]]},
    {"id":"marsh-south-west","name":"the marsh south-west of the dome","character":"wetland","poly":[[-2048,700],[-900,700],[-900,2048],[-2048,2048]]},
    {"id":"marsh-south-east","name":"the marsh south-east of the dome","character":"wetland","poly":[[900,900],[2048,900],[2048,2048],[900,2048]]},
    {"id":"cheniere-pasture","name":"the pasture ridges (procedural)","character":"garden","poly":[[-2048,-700],[-800,-700],[-800,650],[-2048,650]]},
  ],
  sites: [
    {"id":"lbb-workforce-trailer","name":"Black Bayou Workforce Trailer","kind":"construction","position":[300,-1330],"trades":["liuna","ua","iuoe"],"programmes":["job-readiness-edition","plumbers-and-pipefitters","heavy-equipment-operators"],"stations":["jobsite-orientation-and-osha-10","hazwoper-site-orientation","wp-apprenticeship-enrollment-day"],"blurb":"The trailer where every crew starts: site orientation, the gas hazards named, the muster point and the wind sock. A trade reference for the kinds of work the project names, not an employer's hiring office."},
    {"id":"lbb-salt-dome-wellpad","name":"Salt Dome Wellpad","kind":"wellpad","position":[0,0],"trades":["iuoe","ua","usw"],"programmes":["water-and-gas-utility-crews","confined-space","hazmat-environmental"],"stations":["gas-leak-survey","pl-natural-gas-pressure-test-and-leak-check","valve-vault","manhole-entry-and-atmospheric-monitoring"],"blurb":"A wellpad over the salt dome for gas storage (the facts file names storage): the gas monitor on every belt, isolation before work, and nobody in a low space until the air is tested."},
    {"id":"lbb-compressor-station","name":"Compressor Station","kind":"compressor","position":[750,-300],"trades":["ua","ibew","iam"],"programmes":["plumbers-and-pipefitters","stationary-engineer","electrical-first-period"],"stations":["us-treatment-plant-process-pump-lockout","boiler-room","arc-flash-label-study","pl-natural-gas-pressure-test-and-leak-check"],"blurb":"The compressor building for moving gas in and out of storage: lockout on every machine, hearing protection, and the arc-flash label read before a panel is opened."},
    {"id":"lbb-pipeline-spread","name":"Pipeline Spread","kind":"pipeline","position":[-1200,-1300],"trades":["ua","iuoe","liuna","teamsters"],"programmes":["plumbers-and-pipefitters","heavy-equipment-operators","water-and-gas-utility-crews"],"stations":["welding","op-excavator-trench-and-utility-locate","trench-box","ut-cathodic-protection-test-station-reading"],"blurb":"A pipeline spread working along the right-of-way for gas transport (the facts file names it): welders under a hot-work permit, the ditch shored or sloped, and the locate marks honoured."},
    {"id":"lbb-marsh-board-road","name":"Marsh Board Road","kind":"mat-crossing","position":[-1300,250],"trades":["iuoe","liuna"],"programmes":["heavy-equipment-operators","bay-restoration-maritime-underwater"],"stations":["br-tidal-marsh-grading-amphibious-excavator","op-equipment-daily-walkaround-and-fluids","spill-boom-deploy"],"blurb":"The board road across the marsh to the western pads: boards laid ahead, one machine on a span at a time, and the spill boom staged at the edge."},
    {"id":"lbb-blending-skid","name":"Gas Blending Skid","kind":"industrial","position":[1300,-550],"trades":["ua","ibew","insulators"],"programmes":["plumbers-and-pipefitters","insulators-and-boilermakers"],"stations":["ib-hydrostatic-test-and-inspector-witness","ib-mechanical-insulation-pipe-and-jacketing","pl-natural-gas-pressure-test-and-leak-check"],"blurb":"The skid for gas blending (the facts file names it) being piped and tested: hydrotest with the inspector, insulation jacketed, and leak checks before gas is let in. No process is shown."},
    {"id":"lbb-metering-station","name":"Metering Station","kind":"utility","position":[1650,-150],"trades":["ua","uwua"],"programmes":["water-and-gas-utility-crews"],"stations":["ut-gas-meter-set-and-regulator-vent","gas-leak-survey","valve-vault"],"blurb":"A metering station where gas leaves for transport: meters set, regulators vented away from people, and the leak survey walked."},
    {"id":"lbb-hdd-crossing","name":"Directional Drill Crossing","kind":"pipeline","position":[-600,-1150],"trades":["iuoe","liuna","ua"],"programmes":["heavy-equipment-operators","water-and-gas-utility-crews"],"stations":["op-excavator-trench-and-utility-locate","ut-service-line-locate-and-hand-dig-near-gas-main","spill-boom-deploy"],"blurb":"The drill rig pulling pipe under the waterway: locates first, hand-digging near live lines, and a spill boom ready at the entry pit."},
    {"id":"lbb-brine-pond","name":"Brine Pond Crew","kind":"utility","position":[1300,150],"trades":["liuna","iuoe"],"programmes":["hazmat-environmental","heavy-equipment-operators"],"stations":["hazwoper-site-orientation","sampling-well","op-dozer-slope-work-and-rollover-protection"],"blurb":"The crew at the procedural brine pond: the liner's edge kept clear, sampling points logged and the dozer kept off the slope's soft lip."},
    {"id":"lbb-laydown-yard","name":"Pipe Laydown Yard","kind":"staging","position":[-400,-1320],"trades":["teamsters","iuoe"],"programmes":["heavy-equipment-operators","warehouse-and-logistics-automation"],"stations":["forklift-dock","crane-yard","op-loader-truck-loading-and-blind-spots"],"blurb":"Where pipe joints are racked and chocked: the side-boom and the forklift lanes kept apart from people on foot."},
    {"id":"lbb-control-building","name":"Control Building","kind":"plant","position":[650,100],"trades":["ibew","ua"],"programmes":["electrical-first-period","stationary-engineer"],"stations":["electrical","arc-flash-label-study","se-building-automation-alarm-triage"],"blurb":"The control building being wired and commissioned: panels energised in order, alarms tested, and every loop checked against the drawing."},
    {"id":"lbb-barge-landing","name":"Barge Landing","kind":"landing","position":[800,-1010],"trades":["ila","ibu","iuoe"],"programmes":["port-operations","ports-maritime-ecology"],"stations":["mw-workboat-towing-and-line-handling","vessel-gangway-and-hatch-cover-safety","dock-crane"],"blurb":"The landing on the waterway where heavy equipment arrives by barge: lines handled, the gangway rigged and the crane's swing kept clear."},
    {"id":"lbb-hydrotest-station","name":"Hydrotest Station","kind":"pipeline","position":[-1000,-300],"trades":["ua","ibb"],"programmes":["plumbers-and-pipefitters","insulators-and-boilermakers"],"stations":["ib-hydrostatic-test-and-inspector-witness","pl-hydronic-boiler-piping-and-hydrotest","pl-natural-gas-pressure-test-and-leak-check"],"blurb":"A test header on a finished pipeline section: the exclusion zone held while it is under pressure, and the inspector witnessing every step."},
    {"id":"lbb-substation-build","name":"Substation Build","kind":"substation","position":[1650,250],"trades":["ibew","iuoe"],"programmes":["electrical-first-period","energy-transition"],"stations":["substation-switching","ws-substation-switching-under-a-permit","line-truck"],"blurb":"A small substation to power the compressors: switching under a permit and the line truck set up clear of the overhead."},
    {"id":"lbb-marsh-restoration-crew","name":"Marsh Restoration Crew","kind":"wetland","position":[-1500,1000],"trades":["liuna","afscme"],"programmes":["bay-restoration-maritime-underwater","marine-ecology-and-restoration"],"stations":["br-native-planting-and-erosion-mats","marsh-transect-survey","br-bird-nesting-buffer-and-work-window"],"blurb":"A crew restoring marsh disturbed by construction: planting, the transect that shows it working and the nesting buffers honoured."},
    {"id":"lbb-fire-water-station","name":"Fire Water Station","kind":"fire","position":[400,600],"trades":["iaff","ua"],"programmes":["first-responders","plumbers-and-pipefitters"],"stations":["aerial-ladder","ut-hydrant-flow-test-and-flushing-with-traffic-control","shelter-in-place-drill"],"blurb":"The fire water pumps and hydrant loop for the site: flow tested, the response plan rehearsed and the shelter-in-place drill run with every crew."},
    {"id":"lbb-weather-shelter","name":"Storm and Heat Shelter","kind":"monitoring","position":[-150,950],"trades":["afscme","liuna"],"programmes":["situational-awareness","first-responders"],"stations":["ml-heat-and-cold-stress-on-route","shelter-in-place-drill","md-location-shoot-traffic-control-and-heat-hydration"],"blurb":"The hardened shelter where crews go when storms come in off the Gulf, with water, shade and the heat-stress plan on the wall."},
  ],
  landmarks: [
    {"id":"lbb-project-sign","name":"a sign: the project layout is illustrative; the parish, waterways and towns are real","position":[420,-1400],"kind":"sign"},
    {"id":"black-bayou-bank","name":"Black Bayou","position":[-780,250],"kind":"canal"},
    {"id":"salt-dome","name":"the Black Bayou salt dome (approximate)","position":[0,180],"kind":"marsh"},
    {"id":"intracoastal-bank","name":"the Gulf Intracoastal Waterway","position":[0,-1080],"kind":"canal"},
    {"id":"cameron-marsh","name":"the Cameron Parish marsh","position":[-1500,1500],"kind":"marsh"},
    {"id":"cameron-marsh-north","name":"the marsh north of the waterway","position":[800,-1800],"kind":"marsh"},
  ],
  connectors: [
    {"id":"lc-bb-parish-road-north","kind":"road","name":"The parish road north toward Vinton","from":{"parish":"la-black-bayou-cameron","position":[150,-2040]},"to":{"parish":"cameron-parish-north","position":null,"lonlat":[-93.595,30.085]},"lonlat":[-93.595,30.085],"approximate":true},
    {"id":"lc-bb-board-road-south","kind":"road","name":"The marsh board road south toward the coast","from":{"parish":"la-black-bayou-cameron","position":[300,1500]},"to":{"parish":"cameron-parish-coast","position":null,"lonlat":[-93.591,29.989]},"lonlat":[-93.591,29.989],"approximate":true},
  ],
  fieldLessons: [
    {"id":"lbb-fl-marsh-speed-bump","title":"Why the Marsh Matters Here","site":"lbb-marsh-restoration-crew","landmark":"cameron-marsh","k12":"k12-by-wetlands-as-a-storms-speed-bump","station":"br-native-planting-and-erosion-mats","trade":"Marsh restoration crews","tradeLine":"A restoration crew replants marsh a project disturbed, because the marsh protects the land behind it.","minutes":3,"steps":["Look across the marsh from the board road.","Storm water slows as it pushes through grass and shallow mud.","The crew replants what construction crossed, so the marsh keeps doing its job."],"check":{"q":"Why does a crew replant marsh after a pipeline crosses it?","options":["So the marsh keeps slowing storm water","To hide the pipeline","Because grass makes gas flow faster"],"answer":0,"why":"Marsh grass and mud act as a buffer that takes the push out of storm water."}},
    {"id":"lbb-fl-gas-monitor","title":"Air You Cannot See","site":"lbb-salt-dome-wellpad","k12":"k12-es-clean-air-at-the-port","station":"gas-leak-survey","trade":"Gas storage crews","tradeLine":"A crew wears a gas monitor, because some gases have no colour and a meter tells you before you can tell.","minutes":3,"steps":["Look at the wellpad: pipes and valves, nothing you can see in the air.","Some gases have no colour or smell, so people use a meter to check.","The crew clips a monitor on and leaves when it alarms."],"check":{"q":"Why does a wellpad crew wear gas monitors?","options":["Some gases cannot be seen or smelled, so a meter warns first","To measure the weather","To count the pipes"],"answer":0,"why":"A monitor warns the wearer about gas they cannot see, so they can leave early."}},
    {"id":"lbb-fl-simple-machines","title":"Lifting Pipe on the Marsh","site":"lbb-laydown-yard","k12":"k12-simple-machines-at-a-crane","station":"crane-yard","trade":"Crane operators and riggers","tradeLine":"A crane crew plans every lift, because a long boom and pulleys trade distance for force and the ground must hold it.","minutes":3,"steps":["Watch the crane lift a pipe joint off the rack.","The rope runs over pulleys, so a long pull lifts a heavy load a short way.","The crew sets the crane on mats and keeps everyone out from under the load."],"check":{"q":"Why does a crane crew keep people out from under a load?","options":["A load can swing or drop, so nobody stands beneath it","To make room for the pipe","Because the operator likes space"],"answer":0,"why":"Nobody stands under a suspended load: if it swings or slips, the space below must be empty."}},
  ],
  gated: [
    {"id":"lbb-gated-first-weld","kind":"side-quest","title":"The Tie-In Weld","world":"parishes","parish":"la-black-bayou-cameron","site":"lbb-pipeline-spread","siteName":"Pipeline Spread","summary":"Help the pipeline spread make a tie-in weld on the right-of-way.","gate":{"stations":["welding","trench-box"],"note":"Finish the welding and trench box stations before the tie-in"}},
    {"id":"lbb-gated-wellpad-lockout","kind":"side-quest","title":"Wellpad Lockout","world":"parishes","parish":"la-black-bayou-cameron","site":"lbb-salt-dome-wellpad","siteName":"Salt Dome Wellpad","summary":"Help the wellpad crew isolate a valve before maintenance.","gate":{"stations":["gas-leak-survey","valve-vault"],"note":"Walk the gas leak survey and valve vault stations first"}},
  ],
};
