// Delta Forge campus near Boyce — a Louisiana development site on the parish schema (console SITES-NORTH, docs/consoles/SITES-NORTH.md,
// docs/parishes.md). A stylised 4096 m map, not a survey: Boyce, the Red River, the interstate and the state highway appear only by
// their public names as places; every coordinate is approximate (three decimals, `approximate: true`) and exists only to place the map.
// One north-up uniform scale (three real metres per map metre, x east, +z south). The levees' lines, Bayou Rapides's
// course, the lake's outline, the pine hills' rise and every building and site are PROCEDURAL; the project layout is ILLUSTRATIVE (no
// site plan is published): the project layout is illustrative; the parish, waterways and towns are real.
// Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).
// The project, as the facts file states it: Applied Digital's Delta Forge 1 AI factory campus, Rapides Parish (near Boyce, Central
// Louisiana), $3.6 billion, ~300 acres and 300 MW; 200 direct full-time jobs, 218 indirect (418 total); 1,000+ construction jobs at peak;
// operations mid-2027 — sources: opportunitylouisiana.gov news; applieddigital.com. A trade reference only: the platform has no
// partnership with the company; the sites teach the trades' practice from the catalog's sourced stations. Pure data, no imports.
export const NP_LA_DELTA_FORGE_RAPIDES = {
  id: "la-delta-forge-rapides",
  name: "Delta Forge Campus near Boyce",
  region: "louisiana-sites",
  size: 4096,
  scale: 3,
  blurb: "Rapides Parish in Central Louisiana, near Boyce on the Red River, where an AI factory campus is being built south of the interstate: site grading, steel erection, the electrical room, network cabling and the cooling plant. The project layout is illustrative; the parish, waterways and towns are real.",
  start: "ldf-workforce-centre",
  anchors: [
    {"xz":[-253,-186],"lonlat":[-92.668,31.39],"approximate":true,"name":"Boyce"},
    {"xz":[-253,-445],"lonlat":[-92.668,31.397],"approximate":true,"name":"the Red River north of Boyce"},
    {"xz":[1109,334],"lonlat":[-92.625,31.376],"approximate":true,"name":"the Red River east of Boyce"},
    {"xz":[1267,557],"lonlat":[-92.62,31.37],"approximate":true,"name":"the interstate south-east of Boyce"},
    {"xz":[-1267,-482],"lonlat":[-92.7,31.398],"approximate":true,"name":"the interstate north-west of Boyce"},
    {"xz":[-1109,-1447],"lonlat":[-92.695,31.424],"approximate":true,"name":"the Red River upstream of Boyce"},
  ],
  hills: [
    {"id":"pine-hills-south-west","name":"the pine hills rising to the south-west (procedural)","center":[-1600,1600],"radius":700,"height":20},
  ],
  water: [
    {"id":"red-river","name":"the Red River","kind":"river","width":80,"poly":[[-1178,-2048],[-1101,-1434],[-870,-1024],[-512,-717],[-256,-358],[0,-154],[307,-92],[614,-41],[870,154],[1126,358],[1536,420],[2048,358]]},
    {"id":"red-river-oxbow","name":"an old bend of the Red River (oxbow lake)","kind":"lake","poly":[[614,-358],[819,-435],[1075,-410],[1178,-282],[1101,-128],[973,-205],[819,-256],[666,-205]]},
    {"id":"bayou-rapides","name":"Bayou Rapides (course procedural)","kind":"bayou","width":16,"poly":[[-358,205],[-435,614],[-205,973],[307,1229],[819,1536],[1229,2048]]},
    {"id":"lake-west-of-boyce","name":"a lake west of Boyce (procedural outline)","kind":"lake","poly":[[-2048,-358],[-1741,-307],[-1638,0],[-1741,256],[-2048,307]]},
    {"id":"site-stormwater-pond","name":"the site stormwater pond (illustrative)","kind":"lake","poly":[[1450,1480],[1750,1480],[1750,1700],[1450,1700]]},
  ],
  levees: [
    {"id":"red-river-south-levee","name":"the Red River levee, south-west bank","height":4,"pts":[[-1297,-2033],[-1216,-1399],[-963,-948],[-600,-636],[-345,-277],[-51,-46],[285,26],[566,69],[796,249],[1081,469],[1536,540],[2048,477]]},
    {"id":"red-river-north-levee","name":"the Red River levee, north-east bank","height":4,"pts":[[-1059,-2048],[-986,-1469],[-777,-1100],[-424,-798],[-167,-439],[51,-262],[329,-210],[1536,300],[2034,239]]},
    {"id":"pond-berm","name":"the stormwater pond berm (illustrative)","height":2,"pts":[[1440,1470],[1760,1470],[1760,1710]]},
  ],
  roads: [
    {"id":"interstate-forty-nine","name":"Interstate Forty-Nine","kind":"interstate","pts":[[-2048,-1101],[-1024,-282],[154,164],[1126,512],[2048,768]]},
    {"id":"louisiana-highway-one","name":"Louisiana Highway One","kind":"avenue","pts":[[-2048,-1250],[-1100,-500],[-400,-230],[200,-20],[640,330]]},
    {"id":"levee-road","name":"the levee road (procedural)","kind":"riverroad","pts":[[-1347,-2027],[-1264,-1385],[-1001,-916],[-637,-602],[-382,-244],[-73,0],[276,75]]},
    {"id":"campus-access-road","name":"the campus access road (illustrative)","kind":"avenue","pts":[[250,200],[300,480],[800,800],[1450,1250]]},
    {"id":"campus-cross-road","name":"the campus cross road (illustrative)","kind":"street","pts":[[450,400],[1650,1000]]},
    {"id":"boyce-main-street","name":"Boyce's main street (procedural grid)","kind":"street","pts":[[-560,-250],[-120,-40]]},
  ],
  districts: [
    {"id":"boyce","name":"Boyce","character":"suburb","poly":[[-700,-450],[0,-450],[0,60],[-700,60]]},
    {"id":"delta-forge-campus","name":"the AI factory campus (illustrative)","character":"industrial","poly":[[200,350],[1700,780],[1700,1500],[900,1400],[300,1100],[200,600]]},
    {"id":"river-side-fields","name":"the fields along the river (procedural)","character":"garden","poly":[[-1600,-900],[-700,-600],[-700,-450],[-1600,-700]]},
    {"id":"far-bank-fields","name":"the Red River's far bank (procedural fields and woods)","character":"garden","poly":[[-1000,-2048],[2048,-2048],[2048,200],[600,-500],[-600,-900],[-1000,-1300]]},
    {"id":"fields-south","name":"the fields south of the interstate (procedural)","character":"garden","poly":[[-1400,200],[200,700],[300,1150],[900,1450],[900,2048],[-1400,2048]]},
    {"id":"pine-hills-edge","name":"the pine hills' edge (procedural)","character":"park","poly":[[-2048,900],[-1400,900],[-1400,2048],[-2048,2048]]},
  ],
  sites: [
    {"id":"ldf-workforce-centre","name":"Boyce Workforce Centre","kind":"campus","position":[-300,-100],"trades":["ibew","liuna","ironworkers"],"programmes":["job-readiness-edition","builders-trades"],"stations":["jobsite-orientation-and-osha-10","apprenticeship-application-and-test","union-hall-and-dispatch","first-period-evaluation"],"blurb":"The workforce centre in Boyce where new hands start: site orientation, the apprenticeship test and the dispatch board before the bus to the campus."},
    {"id":"ldf-security-gate","name":"Campus Security Gate","kind":"office","position":[300,380],"trades":["spfpa","teamsters"],"programmes":["situational-awareness","warehouse-and-logistics-automation"],"stations":["tdl-backing-and-docking","tdl-pretrip-inspection","traffic-incident-management"],"blurb":"The gate off the campus access road: badges, the delivery queue and a clear walking lane beside the truck lane."},
    {"id":"ldf-site-grading","name":"Campus Site Grading","kind":"excavation","position":[1100,1300],"trades":["iuoe","liuna","teamsters"],"programmes":["heavy-equipment-operators"],"stations":["op-dozer-slope-work-and-rollover-protection","op-grader-fine-grade-and-crown","op-compactor-lift-thickness-and-edge","op-equipment-daily-walkaround-and-fluids"],"blurb":"The pads cut and filled in the fields south of the interstate: the walkaround first, then the dozer, the grader and the compactor in thin lifts."},
    {"id":"ldf-steel-erection","name":"Steel Erection","kind":"construction","position":[700,600],"trades":["ironworkers","iuoe"],"programmes":["bridge-and-structural","fall-protection","rigging-lifting"],"stations":["steel-erector","bs-structural-bolting-and-torque","leading-edge-and-horizontal-lifeline","rl-critical-lift-plan-and-signalperson"],"blurb":"The frame of a campus building going up: columns and beams set on a lift plan, bolts torqued, and every ironworker tied off at the edge."},
    {"id":"ldf-electrical-room","name":"Electrical Room","kind":"substation","position":[900,750],"trades":["ibew"],"programmes":["electrical-first-period","wind-and-data-infrastructure"],"stations":["motor-control-center","arc-flash-label-study","temporary-site-power","ws-data-hall-busway-install-and-torque-signoff"],"blurb":"The switchgear room between the halls: gear set and torqued, arc-flash labels on every door, and temporary power kept apart from the permanent gear."},
    {"id":"ldf-network-cabling","name":"Network Cabling Crew","kind":"utility","position":[900,1050],"trades":["cwa","ibew"],"programmes":["wind-and-data-infrastructure"],"stations":["ws-raised-floor-tile-lift-and-cable-tray-safety","ws-crah-alarm-response-in-a-live-hall","tower-climb"],"blurb":"The crew pulling network cable through the halls: floor tiles lifted one at a time, trays loaded evenly, and ladders footed on the raised floor."},
    {"id":"ldf-cooling-plant","name":"Cooling Plant Build","kind":"plant","position":[1150,900],"trades":["ua","smart","insulators"],"programmes":["stationary-engineer","plumbers-and-pipefitters","insulators-and-boilermakers"],"stations":["chiller-plant","cooling-tower","ib-hydrostatic-test-and-inspector-witness","sm-duct-hanging-and-seismic-bracing"],"blurb":"The cooling plant for the campus: chilled-water pipe set and hydrotested with an inspector watching, ducts hung and braced, towers built."},
    {"id":"ldf-substation-build","name":"Campus Substation Build","kind":"substation","position":[1550,850],"trades":["ibew","ironworkers","iuoe"],"programmes":["electrical-first-period","energy-transition"],"stations":["substation-switching","ws-substation-switching-under-a-permit","rl-critical-lift-plan-and-signalperson","arc-flash-label-study"],"blurb":"The substation at the campus edge: transformers set on a planned lift, switching done under a permit, and the boundary taped before any door opens."},
    {"id":"ldf-laydown-yard","name":"Laydown Yard","kind":"staging","position":[600,1200],"trades":["teamsters","iuoe"],"programmes":["warehouse-and-logistics-automation","rigging-lifting"],"stations":["forklift-dock","tdl-cargo-securement-and-hours","crane-yard","tdl-lifting-and-ergonomics"],"blurb":"The yard where steel and gear wait for the crane: forklift lanes painted, loads strapped, and heavy boxes lifted with the legs, not the back."},
    {"id":"ldf-crane-pad","name":"Crane Pad","kind":"construction","position":[400,700],"trades":["iuoe","ironworkers"],"programmes":["rigging-lifting","heavy-equipment-operators"],"stations":["op-crawler-crane-assembly-and-load-chart","rigging-loft","chain-hoist"],"blurb":"The crawler crane's pad: the crane assembled on firm ground, the load chart read for every pick, and rigging inspected before it goes on the hook."},
    {"id":"ldf-duct-bank-crew","name":"Duct Bank Crew","kind":"utility","position":[1000,580],"trades":["ibew","liuna","iuoe"],"programmes":["electrical-first-period","heavy-equipment-operators","confined-space"],"stations":["op-excavator-trench-and-utility-locate","trench-box","concrete-pour","cs-permit-entry-and-attendant-duties"],"blurb":"The duct bank trench from the substation to the halls: the locate, the trench box, the pour, and a permit for every vault entry."},
    {"id":"ldf-concrete-pour","name":"Foundation Pour","kind":"construction","position":[650,900],"trades":["opcmia","carpenters","liuna"],"programmes":["cement-masons-and-plasterers","builders-trades"],"stations":["concrete-pour","formwork-shoring","bt-rebar-tying-and-impalement-protection","cm-slab-screed-bull-float-and-trowel"],"blurb":"A building's slab and footings: forms braced, rebar capped, the pump truck's boom clear of the lines, and the slab screeded and troweled."},
    {"id":"ldf-generator-yard","name":"Backup Generator Yard","kind":"energy-storage","position":[1350,1100],"trades":["ibew","iam","iuoe"],"programmes":["energy-transition","stationary-engineer"],"stations":["battery-storage-container-commissioning","battery-yard","ut-night-storm-response-crew-and-portable-generator"],"blurb":"Standby generators and battery rooms: commissioning checklists, lockout before any panel opens, and the fuel tanks' spill kits in reach."},
    {"id":"ldf-fire-protection-crew","name":"Fire Protection Crew","kind":"fire","position":[1250,720],"trades":["ua","iaff"],"programmes":["plumbers-and-pipefitters","stationary-engineer"],"stations":["pl-fire-sprinkler-riser-and-flow-test","fire-pump","pm-sprinkler-riser-room"],"blurb":"The sprinkler fitters and the fire pump house: risers flow-tested, valves tagged and the pump run with the fire service's eyes on it."},
    {"id":"ldf-stormwater-pond","name":"Site Stormwater Pond","kind":"stormwater","position":[1600,1380],"trades":["liuna","iuoe"],"programmes":["hazmat-environmental","heavy-equipment-operators"],"stations":["stormwater-outfall","op-excavator-trench-and-utility-locate","bk-bioretention-rain-garden-excavation"],"blurb":"The pond at the campus's low corner: the banks shaped, the outfall kept clear, and mud kept out of the ditches after rain."},
    {"id":"ldf-red-river-levee-patrol","name":"Red River Levee Patrol","kind":"levee","position":[-623,-588],"trades":["liuna","afscme"],"programmes":["hazmat-environmental","bay-restoration-maritime-underwater"],"stations":["br-levee-inspection-and-seepage","br-cold-water-immersion-and-mob-recovery","stormwater-outfall"],"blurb":"The patrol on the Red River levee's land side: the crest walked, wet spots on the land side flagged, and a throw line kept ready near the water."},
    {"id":"ldf-commissioning-office","name":"Commissioning Office","kind":"office","position":[500,500],"trades":["ibew","ua","ifpte"],"programmes":["stationary-engineer","wind-and-data-infrastructure"],"stations":["se-building-automation-alarm-triage","ws-crah-alarm-response-in-a-live-hall","arc-flash-label-study"],"blurb":"The office that proves each system before it carries load: alarm triage on the automation screens, a live-hall drill and the labels walked."},
  ],
  landmarks: [
    {"id":"illustrative-layout-sign","name":"a sign: the project layout is illustrative; the parish, waterways and towns are real","position":[250,460],"kind":"point"},
    {"id":"boyce-place","name":"Boyce","position":[-420,-180],"kind":"place"},
    {"id":"red-river-bank","name":"the Red River bank at Boyce","position":[-305,-323],"kind":"river"},
    {"id":"red-river-levee-crest","name":"the Red River levee crest","position":[-590,-630],"kind":"point"},
    {"id":"interstate-overpass","name":"the interstate overpass by the campus","position":[154,164],"kind":"bridge"},
    {"id":"bayou-rapides-bank","name":"the Bayou Rapides bank (course procedural)","position":[-470,620],"kind":"canal"},
    {"id":"red-river-oxbow-shore","name":"the shore of the Red River's old bend","position":[900,-150],"kind":"shore"},
    {"id":"pine-hills","name":"the pine hills (procedural)","position":[-1600,1600],"kind":"hill"},
  ],
  connectors: [
    {"id":"la-df-interstate-north-west","kind":"road","name":"Interstate Forty-Nine north-west toward Natchitoches","from":{"parish":"la-delta-forge-rapides","position":[-2040,-1095]},"to":{"parish":"central-louisiana-north","position":null,"lonlat":[-92.724,31.415]},"lonlat":[-92.724,31.415],"approximate":true},
    {"id":"la-df-interstate-alexandria","kind":"road","name":"Interstate Forty-Nine south-east toward Alexandria","from":{"parish":"la-delta-forge-rapides","position":[2040,766]},"to":{"parish":"central-louisiana-alexandria","position":null,"lonlat":[-92.596,31.364]},"lonlat":[-92.596,31.364],"approximate":true},
  ],
  fieldLessons: [
    {"id":"la-ldf-fl-river-and-levee","title":"The River and Its Levee","site":"ldf-red-river-levee-patrol","landmark":"red-river-levee-crest","k12":"k12-by-how-a-levee-holds-water-back","station":"br-levee-inspection-and-seepage","trade":"Levee patrol crews","tradeLine":"A patrol walks the levee and looks for wet ground on the dry side, because seepage is the first sign of trouble.","minutes":3,"steps":["Stand on the levee's land side and look up at the grassy crest.","On the far side the Red River runs high after rain; the packed earth holds it back.","The patrol looks for wet or bubbling ground on the dry side and reports it at once."],"check":{"q":"What does the levee patrol look for?","options":["Wet or bubbling ground on the dry side","Fish in the river","Cars on the highway"],"answer":0,"why":"Water pushing through a levee shows up as wet ground on the land side before anything else."}},
    {"id":"la-ldf-fl-steel-frame","title":"How a Steel Frame Stands Up","site":"ldf-steel-erection","k12":"k12-simple-machines-at-a-crane","station":"steel-erector","trade":"Ironworkers","tradeLine":"An ironworker ties off before stepping to the edge, because a frame going up has open sides and no floor yet.","minutes":3,"steps":["Look up at the columns standing in rows and the beams bolted between them.","The crane lifts each beam; ironworkers guide it with tag lines and bolt it in place.","Every worker at the edge wears a harness clipped to a line before they move."],"check":{"q":"What does an ironworker do before working at an open edge?","options":["Clip a harness to a line","Hold on with one hand","Wait for the wind to stop"],"answer":0,"why":"A harness clipped to a strong line stops a fall before it happens to the ground."}},
    {"id":"la-ldf-fl-keeping-it-cool","title":"Keeping the Computers Cool","site":"ldf-cooling-plant","k12":"k12-water-cycle-and-filtration","station":"chiller-plant","trade":"Pipefitters","tradeLine":"A pipefitter tests every pipe with water pressure before the plant runs, because a leak near electrical gear is dangerous.","minutes":3,"steps":["Find the big pipes running from the cooling towers to the halls.","Cool water flows in, picks up the heat from the computers, and flows back out to the towers.","Before it runs, the fitters fill the pipes and hold the pressure to prove there are no leaks."],"check":{"q":"Why are the cooling pipes tested before the plant runs?","options":["To find leaks before water reaches electrical gear","To make the pipes shiny","To use up extra water"],"answer":0,"why":"Water and electricity must stay apart, so every joint is proven tight first."}},
  ],
  gated: [
    {"id":"la-ldf-gated-topping-out","kind":"side-quest","title":"Topping Out the Frame","world":"parishes","parish":"la-delta-forge-rapides","site":"ldf-steel-erection","siteName":"Steel Erection","summary":"Set the last beam on a campus building with the ironworkers.","gate":{"stations":["steel-erector","rl-critical-lift-plan-and-signalperson"],"note":"Finish the steel erector and critical lift stations before the last beam"}},
    {"id":"la-ldf-gated-energise-gear","kind":"side-quest","title":"Energising the Switchgear","world":"parishes","parish":"la-delta-forge-rapides","site":"ldf-electrical-room","siteName":"Electrical Room","summary":"Help the electricians prove the gear and energise the room.","gate":{"stations":["arc-flash-label-study","motor-control-center"],"note":"Walk the arc flash label and motor control centre stations before the gear is energised"}},
  ],
};
