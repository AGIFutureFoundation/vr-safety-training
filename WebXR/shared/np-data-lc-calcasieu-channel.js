// the Calcasieu Ship Channel (Woodside Louisiana LNG's site area; the project layout is illustrative) — console SOUTHWEST (docs/consoles/SOUTHWEST.md, docs/parishes.md). A stylised 4096 m map, not a survey:
// real places appear only by their public names as places; every coordinate is approximate (three decimals, `approximate: true`)
// and exists only to place the map. One north-up uniform scale (x east, +z south). No imagery was used: the lake, the river, the
// ship channel, the bayous, the interstates and the towns follow their general position; every other feature, every site and
// every project layout is PROCEDURAL — the project layout is illustrative; the parish, waterways and towns are real. Project
// facts only from the Louisiana facts file; no partnership with any company, agency or union is claimed. Written once by
// tools/gen_sw_districts.mjs; this module is the source afterwards. Pure data, no imports.
export const NP_LC_CALCASIEU_CHANNEL = {
  id: "lc-calcasieu-channel",
  name: "the Calcasieu Ship Channel",
  region: "louisiana-sites",
  size: 4096,
  blurb: "The Calcasieu Ship Channel's industrial reach south of Lake Charles, in Calcasieu Parish, with marsh on both banks: a project site area for Woodside Louisiana LNG ($17.5 billion final investment decision, per the facts file) — module sets, the marine offload berth, the pipe rack, tank foundations, piling, hydrotest and the heavy-haul road. The project layout is illustrative; the parish, waterways and towns are real. A trade reference only: no partnership with any company is claimed.",
  start: "lcc-workforce-parking",
  anchors: [
    {"xz":[1663,-1898],"lonlat":[-93.262,30.17],"approximate":true,"name":"the Calcasieu Ship Channel below Prien Lake"},
    {"xz":[744,-380],"lonlat":[-93.283,30.14],"approximate":true,"name":"the Calcasieu Ship Channel"},
    {"xz":[-438,1139],"lonlat":[-93.31,30.11],"approximate":true,"name":"the ship channel's lower reach"},
    {"xz":[-1313,-1391],"lonlat":[-93.33,30.16],"approximate":true,"name":"the west bank marsh"},
    {"xz":[1750,1139],"lonlat":[-93.26,30.11],"approximate":true,"name":"the east bank marsh"},
    {"xz":[1926,-1391],"lonlat":[-93.256,30.16],"approximate":true,"name":"Big Lake Road on the east bank"},
  ],
  hills: [],
  water: [
    {"id":"calcasieu-ship-channel","name":"the Calcasieu Ship Channel","kind":"canal","width":110,"poly":[[1663,-2048],[1400,-1391],[963,-784],[525,-127],[44,531],[-350,1240],[-613,2048]]},
    {"id":"old-river-bend","name":"an old river bend beside the channel (procedural)","kind":"river","width":45,"poly":[[1313,-1189],[1750,-885],[1838,-380],[1488,-25],[875,-228]]},
    {"id":"west-bank-marsh","name":"the west bank marsh","kind":"wetland","poly":[[-2048,-2048],[0,-2048],[0,-1189],[-2048,-1189]]},
    {"id":"east-bank-marsh","name":"the east bank marsh","kind":"wetland","poly":[[438,886],[2048,886],[2048,2048],[88,2048]]},
    {"id":"south-west-marsh","name":"the marsh south of the site (procedural)","kind":"wetland","poly":[[-2048,1644],[-788,1644],[-613,2048],[-2048,2048]]},
    {"id":"site-drainage-canal","name":"a site drainage canal (procedural)","kind":"canal","width":14,"poly":[[-1838,-278],[-875,-253],[-44,127]]},
  ],
  levees: [
    {"id":"west-bank-levee","name":"the west bank levee (procedural)","height":3.5,"pts":[[963,-1391],[569,-784],[175,-177],[-263,481]]},
    {"id":"site-storm-berm","name":"the site's storm berm (procedural)","height":3,"pts":[[-1750,481],[-875,886],[-525,1240]]},
  ],
  roads: [
    {"id":"big-lake-road","name":"Big Lake Road","kind":"avenue","pts":[[1926,-2039],[1947,-1391],[1969,-632],[1926,380],[1750,734]]},
    {"id":"plant-access-road","name":"the site access road (procedural)","kind":"avenue","pts":[[-2048,-784],[-1094,-734],[-219,-582],[175,-430]]},
    {"id":"heavy-haul-road","name":"the heavy-haul road from the berth (procedural)","kind":"street","pts":[[-44,329],[-656,329],[-1313,278]]},
    {"id":"west-bank-service-road","name":"the west bank service road (procedural)","kind":"riverroad","pts":[[525,-1290],[131,-734],[-306,-76],[-656,481]]},
    {"id":"north-farm-road","name":"a farm road north of the site (procedural)","kind":"street","pts":[[-1094,-734],[-1138,-1139]]},
    {"id":"site-ring-road","name":"the site ring road (procedural)","kind":"street","pts":[[-1663,-481],[-1663,329],[-875,734]]},
  ],
  districts: [
    {"id":"lng-site-area","name":"the project site area (illustrative)","character":"refinery","poly":[[-1838,-683],[-263,-683],[-263,734],[-1838,734]]},
    {"id":"berth-frontage","name":"the channel berth frontage","character":"port","poly":[[-350,-481],[263,-481],[263,734],[-350,734]]},
    {"id":"west-bank-marsh","name":"the west bank marsh","character":"wetland","poly":[[-2048,-2048],[0,-2048],[0,-1189],[-2048,-1189]]},
    {"id":"east-bank","name":"the east bank along Big Lake Road","character":"garden","poly":[[1313,-2048],[2048,-2048],[2048,886],[875,886]]},
    {"id":"east-bank-marsh","name":"the east bank marsh","character":"wetland","poly":[[438,886],[2048,886],[2048,2048],[88,2048]]},
    {"id":"west-fields","name":"the pasture west of the channel","character":"garden","poly":[[-2048,-1189],[875,-1189],[0,-683],[-2048,-683]]},
    {"id":"south-marsh","name":"the marsh south of the site","character":"wetland","poly":[[-2048,734],[-656,734],[-613,2048],[-2048,2048]]},
  ],
  sites: [
    {"id":"lcc-lng-module-set","name":"Module Set Area","kind":"construction","position":[-1094,-25],"trades":["ironworkers","iuoe","ua","ibb"],"programmes":["rigging-lifting","heavy-equipment-operators","plumbers-and-pipefitters"],"stations":["rl-critical-lift-plan-and-signalperson","op-crawler-crane-assembly-and-load-chart","crane-yard","steel-erector"],"blurb":"Where a pre-built process module is set on its foundation (illustrative): the critical-lift plan, the signalperson, the crawler crane's load chart and the ironworkers' connections.","precinct":true},
    {"id":"lcc-marine-offload","name":"Marine Offload Berth","kind":"port","position":[0,127],"trades":["ila","iuoe","ironworkers"],"programmes":["port-operations","rigging-lifting"],"stations":["mooring-line","dock-crane","rl-critical-lift-plan-and-signalperson","pt-dock-fender-and-bollard-inspection"],"blurb":"The berth on the channel where heavy cargo comes ashore (illustrative): mooring lines, the dock crane, the lift plan and the fenders checked before the barge ties up.","precinct":true},
    {"id":"lcc-pipe-rack","name":"Pipe Rack Crew","kind":"construction","position":[-788,-329],"trades":["ua","ironworkers","insulators"],"programmes":["plumbers-and-pipefitters","insulators-and-boilermakers","fall-protection"],"stations":["steel-erector","welding","scaffold-erection","leading-edge-and-horizontal-lifeline"],"blurb":"A pipe rack going up (illustrative): steel erection, welding, the scaffold tagged before use and tie-off at the edge.","precinct":true},
    {"id":"lcc-heavy-haul-road","name":"Heavy-Haul Road Crew","kind":"construction","position":[-656,430],"trades":["iuoe","teamsters","liuna"],"programmes":["heavy-equipment-operators"],"stations":["op-equipment-daily-walkaround-and-fluids","op-loader-truck-loading-and-blind-spots","op-compactor-lift-thickness-and-edge","traffic-incident-management"],"blurb":"The road from the berth that carries the heavy loads (illustrative): the walkaround, loading blind spots, compacted lifts and traffic control.","precinct":true},
    {"id":"lcc-tank-foundation","name":"Tank Foundation Pour","kind":"construction","position":[-1532,-25],"trades":["opcmia","carpenters","ironworkers","liuna"],"programmes":["builders-trades","cement-masons-and-plasterers"],"stations":["concrete-pour","formwork-shoring","bt-rebar-tying-and-impalement-protection","cm-concrete-saw-cutting-with-water-and-silica-control"],"blurb":"A large foundation pour (illustrative): the forms and shoring, rebar caps, the pour sequence and wet cutting for silica.","precinct":true},
    {"id":"lcc-pile-driving","name":"Foundation Piling Crew","kind":"construction","position":[-1225,-481],"trades":["iuoe","carpenters","liuna"],"programmes":["heavy-equipment-operators","rigging-lifting"],"stations":["op-pile-driving-rig-and-lead-setup","gg-pile-driver-fender-repair","br-marine-mammal-observer-during-pile-driving","rl-critical-lift-plan-and-signalperson"],"blurb":"The piling crew on soft ground (illustrative): the pile rig and its leads, the lift plan, and the observer's watch when piles go in near the water.","precinct":true},
    {"id":"lcc-laydown-yard","name":"Laydown Yard","kind":"staging","position":[-1663,-632],"trades":["teamsters","iuoe","liuna"],"programmes":["heavy-equipment-operators","warehouse-and-logistics-automation"],"stations":["forklift-dock","op-loader-truck-loading-and-blind-spots","tdl-trailer-loading-and-dock-plate","op-equipment-daily-walkaround-and-fluids"],"blurb":"Where the steel, pipe and equipment wait (illustrative): forklifts, loading lanes, the trailer and the daily walkaround.","precinct":true},
    {"id":"lcc-crane-pad","name":"Heavy Crane Pad","kind":"construction","position":[-569,76],"trades":["iuoe","ironworkers","liuna"],"programmes":["rigging-lifting","heavy-equipment-operators"],"stations":["op-crawler-crane-assembly-and-load-chart","crane-yard","rl-critical-lift-plan-and-signalperson","op-compactor-lift-thickness-and-edge"],"blurb":"The crane pad built up and compacted before the big crane is assembled (illustrative): the load chart and the lift plan.","precinct":true},
    {"id":"lcc-workforce-parking","name":"Workforce Parking and Orientation","kind":"office","position":[-1750,-987],"trades":["ibew","ua","ironworkers","liuna"],"programmes":["job-readiness-edition","builders-trades"],"stations":["jobsite-orientation-and-osha-10","wp-permit-study-and-knowledge-test","hazwoper-site-orientation","leading-edge-and-horizontal-lifeline"],"blurb":"Where the shift starts (illustrative): the site orientation, the permit study, the hazard orientation and the fall-protection brief. A training place, not any employer's programme.","precinct":true},
    {"id":"lcc-hydrotest","name":"Hydrotest Station","kind":"construction","position":[-875,278],"trades":["ua","insulators","ibb"],"programmes":["plumbers-and-pipefitters","insulators-and-boilermakers"],"stations":["ib-hydrostatic-test-and-inspector-witness","pl-hydronic-boiler-piping-and-hydrotest","hot-tap","welding"],"blurb":"Piping tested with water before it goes into service (illustrative): the inspector's witness, the test boundary and the hot-tap and weld checks.","precinct":true},
    {"id":"lcc-insulation-crew","name":"Insulation Crew","kind":"workshop","position":[-1313,380],"trades":["insulators","ua","carpenters"],"programmes":["insulators-and-boilermakers","fall-protection"],"stations":["ib-mechanical-insulation-pipe-and-jacketing","scaffold-erection","leading-edge-and-horizontal-lifeline"],"blurb":"The insulators' shop and scaffold (illustrative): pipe insulation and jacketing, the scaffold tag and tie-off.","precinct":true},
    {"id":"lcc-substation-build","name":"Site Substation Build","kind":"substation","position":[-1444,-430],"trades":["ibew","iuoe","liuna"],"programmes":["electrical-first-period","energy-transition"],"stations":["substation-switching","ws-substation-switching-under-a-permit","arc-flash-label-study","trench-box"],"blurb":"The site's substation going in (illustrative): switching under a permit, the arc-flash label and the duct trench.","precinct":true},
    {"id":"lcc-control-building","name":"Control Building Fit-Out","kind":"construction","position":[-1663,481],"trades":["ibew","carpenters","smart"],"programmes":["electrical-first-period","builders-trades"],"stations":["electrical","arc-flash-label-study","pm-electrical-room","pm-fire-alarm-panel-room"],"blurb":"The control building's electrical fit-out (illustrative): the panels, the arc-flash label, the electrical room and the fire alarm panel.","precinct":true},
    {"id":"lcc-flare-area-build","name":"Flare Area Build","kind":"construction","position":[-1225,683],"trades":["ibb","ironworkers","ua"],"programmes":["insulators-and-boilermakers","rigging-lifting"],"stations":["ib-pressure-vessel-confined-entry-and-hot-work","rl-critical-lift-plan-and-signalperson","steel-erector","welding"],"blurb":"A tall steel structure raised in sections (illustrative): the lift plan, hot work with a fire watch, and confined entry into vessels only under a permit.","precinct":true},
    {"id":"lcc-berth-dredge","name":"Berth Dredge Crew","kind":"landing","position":[88,582],"trades":["iuoe","ibu","liuna"],"programmes":["bay-restoration-maritime-underwater","heavy-equipment-operators"],"stations":["dredge-barge","br-dredge-spoils-dewatering-pad","br-turbidity-curtain-deployment","br-vhf-and-navigation-in-a-work-zone"],"blurb":"The dredge crew deepening the berth pocket (illustrative): the dredge barge, the dewatering pad, the turbidity curtain and the radio on the channel.","precinct":true},
    {"id":"lcc-marsh-mat-access","name":"Marsh Mat Access Road","kind":"mat-crossing","position":[-875,-1391],"trades":["iuoe","liuna","teamsters"],"programmes":["heavy-equipment-operators","bay-restoration-maritime-underwater"],"stations":["br-tidal-marsh-grading-amphibious-excavator","op-equipment-daily-walkaround-and-fluids","op-excavator-trench-and-utility-locate","spill-boom-deploy"],"blurb":"Where machines reach the site across the marsh on mats (illustrative): the walkaround, the mats laid ahead and the spill kit on board.","precinct":true},
    {"id":"lcc-security-gate","name":"Site Security Gate","kind":"trucking","position":[-1926,-734],"trades":["spfpa","teamsters"],"programmes":["situational-awareness","first-responders"],"stations":["tdl-backing-and-docking","traffic-incident-management","jobsite-orientation-and-osha-10"],"blurb":"The gate on the access road (illustrative): trucks backed with a spotter, the traffic plan and every visitor oriented.","precinct":true},
    {"id":"lcc-fire-water-station","name":"Fire Water Station","kind":"pump","position":[-438,632],"trades":["iaff","ua","iuoe"],"programmes":["first-responders","plumbers-and-pipefitters"],"stations":["structure-fire-sizeup","ut-hydrant-flow-test-and-flushing-with-traffic-control","confined-rescue"],"blurb":"The site's fire water pumps and hydrants (illustrative): the hydrant flow test, size-up drills and confined-space rescue.","precinct":true},
    {"id":"lcc-east-bank-landing","name":"East Bank Crew Landing","kind":"landing","position":[1707,-632],"trades":["ibu","sup","afscme"],"programmes":["ports-maritime-ecology","yacht-and-charter-crew"],"stations":["mooring-line","yc-line-handling-and-docking-in-crosswind","yc-fuel-dock-transfer-and-spill-kit","br-cold-water-immersion-and-mob-recovery"],"blurb":"A small landing on the east bank off Big Lake Road: lines, fuel with the spill kit and the throw line ready."},
  ],
  landmarks: [
    {"id":"calcasieu-ship-channel-bank","name":"the Calcasieu Ship Channel","position":[306,-25],"kind":"canal"},
    {"id":"west-bank-marsh-place","name":"the west bank marsh","position":[-1094,-1644],"kind":"marsh"},
    {"id":"east-bank-marsh-place","name":"the east bank marsh","position":[1094,1493],"kind":"marsh"},
    {"id":"big-lake-road-place","name":"Big Lake Road","position":[2013,-885],"kind":"road"},
    {"id":"lcc-sign","name":"a sign: the project layout is illustrative; the parish, waterways and towns are real","position":[-1926,-885],"kind":"sign"},
  ],
  connectors: [
    {"id":"sw-cc-big-lake-road-north","kind":"road","name":"Big Lake Road north to Lake Charles","from":{"parish":"lc-calcasieu-channel","position":[1926,-2024]},"to":{"parish":"lc-lakefront-downtown","position":[-1355,2014],"lonlat":[-93.256,30.175]},"lonlat":[-93.256,30.175],"approximate":true},
    {"id":"sw-cc-access-road-west","kind":"road","name":"the site access road west toward Carlyss","from":{"parish":"lc-calcasieu-channel","position":[-2035,-784]},"to":{"parish":"lc-carlyss","position":null,"lonlat":[-93.347,30.148]},"lonlat":[-93.347,30.148],"approximate":true},
  ],
  fieldLessons: [],
  gated: [],
};
