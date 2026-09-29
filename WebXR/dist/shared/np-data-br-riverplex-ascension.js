// RiverPlex MegaPark — Ascension Parish West Bank (console CAPITAL, docs/consoles/CAPITAL.md, docs/parishes.md). A
// stylised 4096 m map (about 3.5 real metres per map metre), not a survey: every coordinate is approximate (three
// decimals for anchors, `approximate: true`). The facts are only the facts file's: a ~17,000-acre site with 10 miles of river frontage
// on the Mississippi's west bank in Ascension Parish (businessreport.com; ascensionedc.com). The project layout is
// illustrative; the parish, waterways and towns are real. No investor, plant or employer is part of any lesson.
// Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).
// Written once by tools/gen_cap_capital.py; this module is the source afterwards. Pure data, no imports.
export const NP_BR_RIVERPLEX_ASCENSION = {
  id: "br-riverplex-ascension",
  name: "RiverPlex MegaPark — Ascension Parish West Bank",
  region: "louisiana-sites",
  size: 4096,
  scale: 3.5,
  blurb: "The RiverPlex MegaPark site on the Mississippi's west bank in Ascension Parish, in the Baton Rouge metro: a site of about 17,000 acres with 10 miles of river frontage (businessreport.com; ascensionedc.com). The project layout is illustrative; the parish, waterways and towns are real. Walk the river bend, the west bank levee and River Road, cane fields, Donaldsonville and Bayou Lafourche, and the site-readiness work a megasite needs: clearing, a rail spur, a river dock, access roads, utilities and drainage.",
  start: "brr-workforce-trailer",
  anchors: [
    {"xz":[165,-779],"lonlat":[-91.014,30.155],"approximate":true,"name":"the RiverPlex site area on the west bank (illustrative)"},
    {"xz":[523,-1288],"lonlat":[-91.001,30.171],"approximate":true,"name":"the Mississippi River above the bend"},
    {"xz":[770,620],"lonlat":[-90.992,30.111],"approximate":true,"name":"the Mississippi River at Donaldsonville"},
    {"xz":[523,970],"lonlat":[-91.001,30.1],"approximate":true,"name":"Donaldsonville"},
    {"xz":[-193,1543],"lonlat":[-91.027,30.082],"approximate":true,"name":"Bayou Lafourche"},
    {"xz":[-1293,-16],"lonlat":[-91.067,30.131],"approximate":true,"name":"Highway One towards Donaldsonville"},
    {"xz":[1293,-525],"lonlat":[-90.973,30.147],"approximate":true,"name":"the east bank inside the bend"},
    {"xz":[-1293,-1543],"lonlat":[-91.067,30.179],"approximate":true,"name":"the cane fields north-west of the site"},
  ],
  water: [
    {"id":"mississippi-river","name":"Mississippi River","kind":"river","poly":[[-193,-2048],[0,-1543],[303,-1034],[358,-620],[110,-302],[-303,-16],[-468,270],[-358,493],[0,620],[523,716],[1018,779],[1540,843],[2048,906],[2048,-143],[1926,111],[1788,461],[1540,525],[1018,461],[523,398],[110,334],[-138,270],[-55,80],[330,-175],[578,-429],[688,-779],[633,-1193],[358,-1638],[165,-2048]]},
    {"id":"bayou-lafourche","name":"Bayou Lafourche","kind":"bayou","width":14,"poly":[[-138,906],[-193,1225],[-248,1638],[-165,2048]]},
    {"id":"site-drainage-canal","name":"a site drainage canal (procedural)","kind":"canal","width":10,"poly":[[-1871,-1129],[-1238,-875],[-633,-525],[-413,-111]]},
    {"id":"field-drainage-canal","name":"a field drainage canal (procedural)","kind":"canal","width":8,"poly":[[-1458,811],[-880,1034],[-358,1225]]},
  ],
  levees: [
    {"id":"west-bank-levee","name":"the west bank levee","height":4.5,"pts":[[-275,-2048],[-83,-1543],[220,-1034],[275,-620],[28,-366],[-385,-48],[-550,270],[-413,557],[-28,716],[523,811],[1018,875],[1540,906],[2048,1002]]},
    {"id":"east-bank-levee","name":"the east bank levee","height":4.5,"pts":[[248,-2048],[468,-1638],[743,-1193],[770,-779],[660,-398],[413,-143],[110,207],[523,302],[1018,398],[1540,461],[1733,398],[1843,48],[2008,-207]]},
  ],
  roads: [
    {"id":"west-bank-river-road","name":"River Road on the west bank","kind":"riverroad","pts":[[-358,-2048],[-165,-1543],[138,-1034],[193,-652],[-55,-429],[-468,-111],[-633,270],[-495,652],[-28,779],[523,875],[1018,938],[1540,970],[2048,1065]]},
    {"id":"highway-one","name":"Highway One","kind":"avenue","pts":[[-2048,-398],[-1293,-16],[-523,461],[110,970],[605,1225],[1128,1543],[1843,2048]]},
    {"id":"highway-seventy","name":"Highway Seventy towards the Sunshine Bridge","kind":"avenue","pts":[[605,1225],[1293,1129],[2048,1225]]},
    {"id":"east-bank-river-road","name":"River Road on the east bank","kind":"riverroad","pts":[[358,-2048],[550,-1638],[825,-1193],[853,-779],[770,-366],[523,-111],[248,143]]},
    {"id":"site-access-road","name":"the site access road (illustrative)","kind":"street","pts":[[-1293,-16],[-935,-525],[-523,-1034],[-220,-1447]]},
    {"id":"rail-spur","name":"the rail spur (illustrative)","kind":"street","pts":[[-1761,-207],[-1128,-652],[-578,-1193],[-165,-1733]]},
    {"id":"donaldsonville-street","name":"Railroad Avenue, Donaldsonville","kind":"street","pts":[[110,970],[413,906],[825,938],[1128,1034]]},
  ],
  districts: [
    {"id":"riverplex-site","name":"the RiverPlex site area (layout illustrative)","character":"industrial","poly":[[-1045,-2048],[-220,-2048],[110,-1065],[110,-620],[-523,-111],[-1045,-366]]},
    {"id":"west-cane-fields","name":"the cane fields west of the site","character":"park","poly":[[-2048,-2048],[-1045,-2048],[-1045,-366],[-2048,-461]]},
    {"id":"south-cane-fields","name":"the cane fields towards Donaldsonville","character":"park","poly":[[-2048,-461],[-578,111],[-523,811],[-2048,811]]},
    {"id":"donaldsonville","name":"Donaldsonville","character":"quarter","poly":[[0,811],[1238,938],[1238,1288],[0,1288]]},
    {"id":"bayou-lafourche-fields","name":"the fields along Bayou Lafourche","character":"suburb","poly":[[-2048,811],[0,811],[110,2048],[-2048,2048]]},
    {"id":"south-east-fields","name":"the fields south-east of town","character":"park","poly":[[110,1288],[2048,1288],[2048,2048],[110,2048]]},
    {"id":"east-bank-inside-the-bend","name":"the east bank inside the bend","character":"wetland","poly":[[825,-1447],[2048,-1447],[2048,-207],[1761,366],[303,270],[825,-525]]},
    {"id":"east-bank-industry","name":"river industry on the east bank (procedural)","character":"refinery","poly":[[413,-2048],[2048,-2048],[2048,-1447],[825,-1447]]},
  ],
  sites: [
    {"id":"brr-workforce-trailer","name":"RiverPlex Workforce Trailer","kind":"office","position":[-1183,-111],"trades":["iuoe","liuna","teamsters"],"programmes":["heavy-equipment-operators","job-readiness-edition"],"stations":["jobsite-orientation-and-osha-10","apprenticeship-application-and-test","union-hall-and-dispatch"],"blurb":"The trailer where site crews sign in: orientation, the day's job briefing and the dispatch board. RiverPlex MegaPark is a large river-frontage site in Ascension Parish; this is a trade reference, no employer's programme. The project layout is illustrative; the parish, waterways and towns are real."},
    {"id":"brr-site-clearing","name":"Site Clearing Crew","kind":"excavation","position":[-578,-1288],"trades":["iuoe","liuna"],"programmes":["heavy-equipment-operators","grounds-and-landscaping"],"stations":["op-dozer-slope-work-and-rollover-protection","gk-chainsaw-start-and-limbing-on-the-ground","op-equipment-daily-walkaround-and-fluids"],"blurb":"Clearing a field edge for site readiness: the dozer's rollover protection and seat belt, a drop zone for every felled tree and the walkaround before start-up."},
    {"id":"brr-rail-spur","name":"Rail Spur Build","kind":"rail","position":[-880,-906],"trades":["bmwed","iuoe","liuna"],"programmes":["railroad-crafts"],"stations":["ra-tie-and-rail-replacement-with-track-machines","ra-roadway-worker-protection-and-job-briefing","track-access"],"blurb":"An illustrative spur laid towards the river: track machines worked with a job briefing, roadway worker protection and nobody on the track without it."},
    {"id":"brr-river-dock","name":"River Dock Build","kind":"port","position":[-220,-1320],"trades":["ila","iuoe","carpenters"],"programmes":["port-operations","rigging-lifting"],"stations":["cd-pier-piling-inspection-and-wrap-repair","mooring-line","br-workboat-crane-lift-from-water"],"blurb":"An illustrative dock at the river's edge, reached across the levee: piling inspected, mooring lines handled out of the snap-back zone and crane lifts from the water planned."},
    {"id":"brr-site-access-road","name":"Site Access Road Crew","kind":"construction","position":[-770,-366],"trades":["iuoe","liuna","teamsters"],"programmes":["heavy-equipment-operators"],"stations":["op-compactor-lift-thickness-and-edge","op-loader-truck-loading-and-blind-spots","traffic-incident-management"],"blurb":"Building the access road from Highway One: lifts compacted to thickness, the loader's blind spots kept clear and the highway entrance flagged."},
    {"id":"brr-levee-crossing","name":"Levee Crossing Crew","kind":"levee","position":[-28,-779],"trades":["iuoe","liuna"],"programmes":["heavy-equipment-operators","bay-restoration-maritime-underwater"],"stations":["br-levee-inspection-and-seepage","op-excavator-trench-and-utility-locate","op-compactor-lift-thickness-and-edge"],"blurb":"Where a road or pipe must cross the levee: seepage looked for, utilities located and every lift compacted so the levee stays whole."},
    {"id":"brr-utility-corridor","name":"Utility Corridor Crew","kind":"utility","position":[-1403,-779],"trades":["ibew","liuna","ua"],"programmes":["water-and-gas-utility-crews","electrical-first-period"],"stations":["ut-service-line-locate-and-hand-dig-near-gas-main","trench-box","valve-vault"],"blurb":"Utilities brought into the site: lines located and hand-dug near existing pipe, the trench boxed and vaults entered with the air tested."},
    {"id":"brr-substation-build","name":"Substation Build","kind":"substation","position":[-1595,-1320],"trades":["ibew"],"programmes":["electrical-first-period","energy-transition"],"stations":["substation-switching","arc-flash-label-study","temporary-site-power"],"blurb":"An illustrative substation for the site: temporary power first, arc flash boundaries marked and switching orders read back."},
    {"id":"brr-laydown-yard","name":"Laydown Yard","kind":"staging","position":[-1238,-1733],"trades":["teamsters","iuoe"],"programmes":["warehouse-and-logistics-automation","rigging-lifting"],"stations":["forklift-dock","tdl-trailer-loading-and-dock-plate","tdl-pretrip-inspection"],"blurb":"Where materials arrive and are sorted: forklifts kept apart from people on foot, loads strapped and trucks walked around before they leave."},
    {"id":"brr-drainage-canal","name":"Drainage Canal Crew","kind":"stormwater","position":[-963,-557],"trades":["liuna","iuoe"],"programmes":["heavy-equipment-operators","water-and-gas-utility-crews"],"stations":["op-excavator-trench-and-utility-locate","br-culvert-retrofit-for-fish-passage","stormwater-outfall"],"blurb":"Cleaning and reshaping a drainage canal across the site: the excavator kept back from the soft edge, culverts set and the outfall kept clear."},
    {"id":"brr-environmental-survey","name":"Environmental Survey Crew","kind":"survey","position":[-1761,-1861],"trades":["liuna","ifpte"],"programmes":["marine-ecology-and-restoration","hazmat-environmental"],"stations":["marsh-transect-survey","br-bird-nesting-buffer-and-work-window","sampling-well"],"blurb":"Surveying the site before work begins: transects walked, nesting buffers respected and groundwater sampled by the book."},
    {"id":"brr-crane-pad","name":"Crane Pad","kind":"construction","position":[-303,-1733],"trades":["iuoe","ironworkers"],"programmes":["rigging-lifting","heavy-equipment-operators"],"stations":["op-crawler-crane-assembly-and-load-chart","gg-fog-and-wind-work-stop","steel-erector"],"blurb":"A crane pad built on firm, level ground: the crane assembled on mats, the load chart read and lifts stopped when the wind rises."},
    {"id":"brr-water-intake","name":"River Water Intake Crew","kind":"pump","position":[-28,-652],"trades":["ua","iuoe"],"programmes":["plumbers-and-pipefitters","stationary-engineer"],"stations":["fire-pump","lift-station","br-cold-water-immersion-and-mob-recovery"],"blurb":"An illustrative intake by the river: pumps locked out before service, and float coats and a throw line whenever anyone works over the water."},
    {"id":"brr-geotech-drilling","name":"Geotechnical Drilling Crew","kind":"assessment","position":[-1485,-398],"trades":["iuoe","liuna"],"programmes":["heavy-equipment-operators"],"stations":["op-equipment-daily-walkaround-and-fluids","ut-service-line-locate-and-hand-dig-near-gas-main","sampling-well"],"blurb":"A drill rig testing the ground: utilities located before the auger turns, the rig walked around each morning and the cores logged."},
    {"id":"brr-fire-water-station","name":"Fire Water Station","kind":"fire","position":[-1898,-779],"trades":["iaff","ua"],"programmes":["first-responders","plumbers-and-pipefitters"],"stations":["fire-pump","structure-fire-sizeup","ut-hydrant-flow-test-and-flushing-with-traffic-control"],"blurb":"An illustrative fire water station for the site: the fire pump tested, hydrants flowed and a size-up drill for the crews who respond."},
    {"id":"brr-donaldsonville-main-street","name":"Donaldsonville Main Street Crew","kind":"construction","position":[605,1065],"trades":["liuna","opcmia","carpenters"],"programmes":["builders-trades","cement-masons-and-plasterers"],"stations":["concrete-pour","traffic-incident-management","gk-hardscape-paver-base-and-compaction"],"blurb":"A procedural streetscape job in Donaldsonville's downtown: the work zone signed, the pour placed and finished and pedestrians guided round it."},
  ],
  landmarks: [
    {"id":"river-bend","name":"the Mississippi's bend at the site","position":[165,-366],"kind":"shore"},
    {"id":"donaldsonville-place","name":"Donaldsonville","position":[413,1065],"kind":"neighbourhood"},
    {"id":"bayou-lafourche-head","name":"the head of Bayou Lafourche","position":[-83,938],"kind":"canal"},
    {"id":"west-bank-levee-crown","name":"the west bank levee","position":[275,-938],"kind":"levee"},
    {"id":"cane-fields-place","name":"the cane fields","position":[-1650,-1034],"kind":"point"},
    {"id":"illustrative-sign","name":"a sign: the project layout is illustrative; the parish, waterways and towns are real","position":[-1073,-207],"kind":"point"},
  ],
  connectors: [
    {"id":"cap-br-highway-one-north-west","kind":"road","name":"Highway One north-west towards Plaquemine","from":{"parish":"br-riverplex-ascension","position":[-2036,-398]},"to":{"parish":"iberville-west-bank","position":null,"lonlat":[-91.095,30.143]},"lonlat":[-91.095,30.143],"approximate":true},
    {"id":"cap-br-highway-seventy-east","kind":"road","name":"Highway Seventy east towards the Sunshine Bridge","from":{"parish":"br-riverplex-ascension","position":[2008,1225]},"to":{"parish":"ascension-east-bank","position":null,"lonlat":[-90.945,30.092]},"lonlat":[-90.945,30.092],"approximate":true},
  ],
  fieldLessons: [
    {"id":"cap-br-fl-how-a-levee-holds","title":"Crossing a Levee Safely","site":"brr-levee-crossing","landmark":"west-bank-levee-crown","k12":"k12-by-how-a-levee-holds-water-back","station":"br-levee-inspection-and-seepage","trade":"Equipment operators","tradeLine":"An operator building a crossing compacts every lift so the levee stays strong against the river.","minutes":3,"steps":["Stand at the foot of the west bank levee.","The levee keeps high water in the river and away from the fields and the town.","Anything that crosses it must be built so the packed earth stays whole."],"check":{"q":"Why must a levee crossing be built so carefully?","options":["A weak spot could let high water through","So trucks can go faster","To make the levee taller for the view"],"answer":0,"why":"A levee protects the land behind it only if every part of it is strong."}},
    {"id":"cap-br-fl-reading-the-map","title":"Reading a Site Map","site":"brr-workforce-trailer","k12":"k12-map-literacy-across-eras","station":"jobsite-orientation-and-osha-10","trade":"Site crews","tradeLine":"Every new crew member finds the muster point, the first aid station and the exits on the site map at orientation.","minutes":3,"steps":["Find the site map on the trailer wall.","It shows the river, the levee, the roads and where each crew works.","At orientation every worker finds the muster point and the first aid station."],"check":{"q":"What should a new worker find first on a site map?","options":["The muster point and first aid station","The lunch menu","The fastest road home"],"answer":0,"why":"Knowing where to gather and where help is keeps everyone safe in an emergency."}},
    {"id":"cap-br-fl-simple-machines","title":"Levers and Pulleys at the Crane Pad","site":"brr-crane-pad","k12":"k12-simple-machines-at-a-crane","station":"op-crawler-crane-assembly-and-load-chart","trade":"Crane operators","tradeLine":"A crane operator reads the load chart for every lift and sets the crane on firm, level ground.","minutes":3,"steps":["Look at the crane standing on its pad.","Its boom works like a lever and its hook uses pulleys.","The pad must be firm and level or the crane could tip."],"check":{"q":"Why is a crane set up on a firm, level pad?","options":["Soft or sloping ground could let it tip","So it looks tidy","Because cranes are heavy to paint"],"answer":0,"why":"A crane's stability depends on solid, level ground under it."}},
  ],
  gated: [
    {"id":"cap-br-gated-clear-the-site","kind":"side-quest","title":"Clear the Field Edge","world":"parishes","parish":"br-riverplex-ascension","site":"brr-site-clearing","siteName":"Site Clearing Crew","summary":"Run a clearing crew safely: the dozer check, the drop zone and the walkaround.","gate":{"stations":["op-dozer-slope-work-and-rollover-protection","op-equipment-daily-walkaround-and-fluids"],"note":"Finish the dozer slope work and daily walkaround stations first"}},
    {"id":"cap-br-gated-lay-the-spur","kind":"side-quest","title":"Lay the Rail Spur","world":"parishes","parish":"br-riverplex-ascension","site":"brr-rail-spur","siteName":"Rail Spur Build","summary":"Lay an illustrative spur with track machines under roadway worker protection.","gate":{"stations":["ra-tie-and-rail-replacement-with-track-machines","ra-roadway-worker-protection-and-job-briefing"],"note":"Finish the track machine and roadway worker protection stations first"}},
  ],
};
