// the Port of Vinton (a FastSites site area; the project layout is illustrative) — console SOUTHWEST (docs/consoles/SOUTHWEST.md, docs/parishes.md). A stylised 4096 m map, not a survey:
// real places appear only by their public names as places; every coordinate is approximate (three decimals, `approximate: true`)
// and exists only to place the map. One north-up uniform scale (x east, +z south). No imagery was used: the lake, the river, the
// ship channel, the bayous, the interstates and the towns follow their general position; every other feature, every site and
// every project layout is PROCEDURAL — the project layout is illustrative; the parish, waterways and towns are real. Project
// facts only from the Louisiana facts file; no partnership with any company, agency or union is claimed. Written once by
// tools/gen_sw_districts.mjs; this module is the source afterwards. Pure data, no imports.
// Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).
export const NP_LC_PORT_OF_VINTON = {
  id: "lc-port-of-vinton",
  name: "the Port of Vinton",
  region: "louisiana-sites",
  size: 4096,
  blurb: "Vinton and its port in western Calcasieu Parish, with rice fields and marsh to the south: a FastSites site area — $5.9 million at the Port of Vinton for a 600 ft × 50 ft barge berth, per the facts file — the berth build, site preparation, rail and road work, the sheet-pile wall, dredging and mooring dolphins. The project layout is illustrative; the parish, waterways and towns are real. A trade reference only: no partnership is claimed.",
  start: "lpv-port-office",
  anchors: [
    {"xz":[-48,-1030],"lonlat":[-93.581,30.191],"approximate":true,"name":"Vinton"},
    {"xz":[241,-1531],"lonlat":[-93.575,30.2],"approximate":true,"name":"Interstate Ten at Vinton"},
    {"xz":[-241,696],"lonlat":[-93.585,30.16],"approximate":true,"name":"the Port of Vinton (the port's area)"},
    {"xz":[1203,1531],"lonlat":[-93.555,30.145],"approximate":true,"name":"the marsh south of Vinton"},
    {"xz":[-1444,-417],"lonlat":[-93.61,30.18],"approximate":true,"name":"the fields west of Vinton"},
    {"xz":[1684,-417],"lonlat":[-93.545,30.18],"approximate":true,"name":"the rice fields east of Vinton"},
  ],
  hills: [],
  water: [
    {"id":"port-waterway","name":"the port's barge waterway (procedural)","kind":"canal","width":45,"poly":[[-962,696],[-241,863],[481,1141],[962,1586],[1347,2048]]},
    {"id":"turning-basin","name":"the port's turning basin (procedural)","kind":"lake","poly":[[-1251,473],[-914,417],[-866,751],[-1251,807]]},
    {"id":"south-marsh","name":"the marsh south of Vinton","kind":"wetland","poly":[[481,1419],[2048,1419],[2048,2048],[481,2048]]},
    {"id":"drainage-canal","name":"a field drainage canal (procedural)","kind":"canal","width":12,"poly":[[-2048,28],[-962,28],[-481,139],[-385,696]]},
    {"id":"rice-field-ditch","name":"a rice field ditch (procedural)","kind":"canal","width":8,"poly":[[1444,-417],[1540,417],[1203,1252]]},
  ],
  levees: [
    {"id":"berth-bulkhead","name":"the new barge berth's bulkhead (illustrative)","height":3.8,"pts":[[-626,629],[-337,696]]},
    {"id":"waterway-spoil-bank","name":"the waterway spoil bank (procedural)","height":3.6,"pts":[[96,1197],[722,1503],[1059,1865]]},
  ],
  roads: [
    {"id":"i10","name":"Interstate Ten","kind":"interstate","pts":[[-2048,-1642],[0,-1531],[2048,-1447]]},
    {"id":"us90","name":"US Highway Ninety through Vinton","kind":"avenue","pts":[[-2048,-1058],[0,-1002],[2048,-946]]},
    {"id":"port-road","name":"the port road (procedural)","kind":"avenue","pts":[[-192,-1002],[-241,-306],[-385,250],[-481,473]]},
    {"id":"horridge-street","name":"a Vinton street north to the interstate (procedural)","kind":"street","pts":[[192,-2048],[192,-1531],[192,-1002]]},
    {"id":"town-street","name":"a Vinton town street (procedural)","kind":"street","pts":[[-722,-751],[481,-751]]},
    {"id":"rail-spur-road","name":"the rail spur service road (procedural)","kind":"street","pts":[[-1684,-306],[-1203,195]]},
    {"id":"field-road-east","name":"a field road east of town (procedural)","kind":"street","pts":[[962,-946],[962,417]]},
  ],
  districts: [
    {"id":"vinton-town","name":"Vinton","character":"suburb","poly":[[-962,-1308],[722,-1308],[722,-584],[-962,-584]]},
    {"id":"vinton-main-street","name":"Vinton's main street","character":"downtown","poly":[[-385,-1141],[192,-1141],[192,-863],[-385,-863]]},
    {"id":"port","name":"the Port of Vinton","character":"port","poly":[[-1684,-195],[96,-195],[96,918],[-1684,918]]},
    {"id":"north-fields","name":"the fields north of the interstate","character":"garden","poly":[[-2048,-2048],[2048,-2048],[2048,-1586],[-2048,-1586]]},
    {"id":"rice-fields","name":"the rice fields east of town","character":"garden","poly":[[722,-863],[2048,-863],[2048,1364],[722,1364]]},
    {"id":"west-fields","name":"the fields west of town","character":"garden","poly":[[-2048,-1308],[-962,-1308],[-962,-195],[-2048,-195]]},
    {"id":"south-marsh","name":"the marsh south of Vinton","character":"wetland","poly":[[481,1419],[2048,1419],[2048,2048],[481,2048]]},
  ],
  sites: [
    {"id":"lpv-barge-berth-build","name":"Barge Berth Build","kind":"port","position":[-481,529],"trades":["iuoe","carpenters","liuna","ironworkers"],"programmes":["heavy-equipment-operators","port-operations","rigging-lifting"],"stations":["op-pile-driving-rig-and-lead-setup","concrete-pour","mooring-line","rl-critical-lift-plan-and-signalperson"],"blurb":"The new barge berth going in (illustrative; the facts file gives the berth as 600 ft by 50 ft): the pile rig, the deck pour, the lift plan and the first mooring lines.","precinct":true},
    {"id":"lpv-site-prep","name":"Port Site Preparation","kind":"construction","position":[-866,28],"trades":["iuoe","liuna","teamsters"],"programmes":["heavy-equipment-operators"],"stations":["op-dozer-slope-work-and-rollover-protection","op-excavator-trench-and-utility-locate","op-compactor-lift-thickness-and-edge","op-equipment-daily-walkaround-and-fluids"],"blurb":"Clearing and grading the port's upland (illustrative): the dozer on the slope, locates before the dig, compacted lifts and the walkaround.","precinct":true},
    {"id":"lpv-rail-and-road","name":"Rail and Road Crew","kind":"rail","position":[-1756,56],"trades":["bmwed","iuoe","liuna"],"programmes":["railroad-crafts","heavy-equipment-operators"],"stations":["ra-tie-and-rail-replacement-with-track-machines","ra-roadway-worker-protection-and-job-briefing","ra-crossing-signal-maintenance-and-flagging","op-compactor-lift-thickness-and-edge"],"blurb":"The rail spur and the port road (illustrative): ties and rail, roadway worker protection, the crossing signal and the compacted base.","precinct":true},
    {"id":"lpv-sheet-pile-wall","name":"Sheet-Pile Wall Crew","kind":"seawall","position":[-96,584],"trades":["carpenters","iuoe","ironworkers"],"programmes":["heavy-equipment-operators","rigging-lifting"],"stations":["op-pile-driving-rig-and-lead-setup","gg-pile-driver-fender-repair","welding","rl-critical-lift-plan-and-signalperson"],"blurb":"The sheet-pile wall along the berth (illustrative): the vibratory rig and its leads, the welded wale and the lift plan.","precinct":true},
    {"id":"lpv-berth-dredge","name":"Berth Dredge Crew","kind":"landing","position":[192,807],"trades":["iuoe","ibu","liuna"],"programmes":["bay-restoration-maritime-underwater","heavy-equipment-operators"],"stations":["dredge-barge","br-dredge-spoils-dewatering-pad","br-turbidity-curtain-deployment","br-vhf-and-navigation-in-a-work-zone"],"blurb":"The dredge crew deepening the berth (illustrative): the barge, the dewatering pad, the turbidity curtain and the radio.","precinct":true},
    {"id":"lpv-mooring-dolphins","name":"Mooring Dolphin Crew","kind":"landing","position":[-866,918],"trades":["carpenters","iuoe","ibu"],"programmes":["port-operations","commercial-diving-and-scientific-scuba"],"stations":["mw-pier-pile-inspection-dive","pt-dock-fender-and-bollard-inspection","op-pile-driving-rig-and-lead-setup","br-cold-water-immersion-and-mob-recovery"],"blurb":"Mooring dolphins set off the berth (illustrative): the pile inspection dive, fenders and bollards, the rig and the throw line.","precinct":true},
    {"id":"lpv-crane-and-rigging","name":"Crane and Rigging Pad","kind":"construction","position":[-626,195],"trades":["iuoe","ironworkers","liuna"],"programmes":["rigging-lifting","heavy-equipment-operators"],"stations":["op-crawler-crane-assembly-and-load-chart","crane-yard","rl-critical-lift-plan-and-signalperson","op-compactor-lift-thickness-and-edge"],"blurb":"The crane pad by the berth (illustrative): the crane assembled on compacted ground, its load chart and the lift plan.","precinct":true},
    {"id":"lpv-drainage-culvert","name":"Drainage Culvert Crew","kind":"utility","position":[-626,-195],"trades":["liuna","iuoe","uwua"],"programmes":["heavy-equipment-operators","water-and-gas-utility-crews"],"stations":["or-ranch-road-grading-and-culvert","trench-box","br-culvert-retrofit-for-fish-passage","stormwater-outfall"],"blurb":"Culverts under the port road where the field drainage runs (illustrative): the grade, the trench box, fish passage and the outfall.","precinct":true},
    {"id":"lpv-environmental-survey","name":"Environmental Survey Crew","kind":"monitoring","position":[866,1197],"trades":["ifpte","afscme"],"programmes":["bay-restoration-maritime-underwater","marine-ecology-and-restoration"],"stations":["marsh-transect-survey","br-water-quality-sonde-calibration-and-deploy","br-bird-nesting-buffer-and-work-window","br-drone-shoreline-survey"],"blurb":"The survey crew at the marsh edge (illustrative): the transect, the sonde, the nesting buffer and the drone survey.","precinct":true},
    {"id":"lpv-laydown-yard","name":"Port Laydown Yard","kind":"staging","position":[-1347,362],"trades":["teamsters","iuoe","liuna"],"programmes":["heavy-equipment-operators","warehouse-and-logistics-automation"],"stations":["forklift-dock","op-loader-truck-loading-and-blind-spots","tdl-trailer-loading-and-dock-plate","op-equipment-daily-walkaround-and-fluids"],"blurb":"Where the piles and rebar wait (illustrative): forklifts, loading lanes and the walkaround.","precinct":true},
    {"id":"lpv-utility-extension","name":"Utility Extension Crew","kind":"utility","position":[-144,-83],"trades":["ibew","uwua","liuna"],"programmes":["electrical-first-period","water-and-gas-utility-crews"],"stations":["ut-pe-pipe-fusion-and-squeeze-off","trench-box","or-transmission-line-right-of-way-patrol","ut-service-line-locate-and-hand-dig-near-gas-main"],"blurb":"Power and water brought down the port road (illustrative): fused poly pipe, the trench box, the line right-of-way and locates.","precinct":true},
    {"id":"lpv-port-office","name":"Port Office and Orientation","kind":"office","position":[0,-417],"trades":["ibew","ua","ironworkers","liuna"],"programmes":["job-readiness-edition","builders-trades"],"stations":["jobsite-orientation-and-osha-10","wp-permit-study-and-knowledge-test","hazwoper-site-orientation","leading-edge-and-horizontal-lifeline"],"blurb":"The port office where every crew signs in (illustrative): the site orientation, the permit study, the hazard orientation and the fall-protection brief. A training place, not any employer's programme.","precinct":true},
    {"id":"lpv-truck-gate","name":"Port Truck Gate","kind":"trucking","position":[-337,-584],"trades":["teamsters","ila"],"programmes":["port-operations","warehouse-and-logistics-automation"],"stations":["tdl-backing-and-docking","tdl-trailer-loading-and-dock-plate","traffic-incident-management"],"blurb":"The truck gate on the port road (illustrative): backing with a spotter, the dock plate and the traffic plan.","precinct":true},
    {"id":"lpv-warehouse-build","name":"Port Warehouse Build","kind":"warehouse","position":[-1540,557],"trades":["ironworkers","carpenters","opcmia"],"programmes":["builders-trades"],"stations":["steel-erector","concrete-pour","leading-edge-and-horizontal-lifeline","tw-dock-leveler-and-trailer-restraint-check"],"blurb":"A warehouse by the berth (illustrative): steel erection, the slab pour, tie-off at the edge and the dock leveller.","precinct":true},
    {"id":"lpv-vinton-main-street","name":"Vinton Main Street Utility Crew","kind":"utility","position":[-96,-835],"trades":["liuna","uwua","iuoe"],"programmes":["water-and-gas-utility-crews","heavy-equipment-operators"],"stations":["op-excavator-trench-and-utility-locate","trench-box","ut-service-line-locate-and-hand-dig-near-gas-main","cm-concrete-saw-cutting-with-water-and-silica-control"],"blurb":"A street and utility crew on Vinton's main street (procedural): locates, the trench box, hand-digging by the gas line and the wet saw."},
    {"id":"lpv-fire-station","name":"a Vinton Fire Station","kind":"fire-station","position":[433,-863],"trades":["iaff","naemt"],"programmes":["first-responders","fall-protection"],"stations":["structure-fire-sizeup","aerial-ladder","firefighter-rehab-sector","ambulance-scene-safety"],"blurb":"The town's fire station (procedural): size-up, the ladder, rehab and scene safety."},
    {"id":"lpv-school-campus","name":"a Vinton School Campus","kind":"school","position":[-577,-863],"trades":["aft","csea","seiu"],"programmes":["education-support-staff","k12-literacy-and-life-skills"],"stations":["ed-playground-equipment-inspection","ed-crossing-guard-intersection-control","k12-reading-instructions-and-safety-labels","ed-kitchen-receiving-and-warewash-sanitizing"],"blurb":"A school in Vinton (procedural): the playground check, the crossing guard, the safety labels and the kitchen."},
    {"id":"lpv-rice-field-crew","name":"Rice Field Drainage Crew","kind":"wetland","position":[1347,28],"trades":["liuna","iuoe","uwua"],"programmes":["heavy-equipment-operators","water-and-gas-utility-crews"],"stations":["or-ranch-road-grading-and-culvert","trench-box","br-culvert-retrofit-for-fish-passage","stormwater-outfall"],"blurb":"A drainage crew in the rice fields east of town (procedural): field culverts, the ditch, the trench box and the outfall."},
  ],
  landmarks: [
    {"id":"vinton-place","name":"Vinton","position":[-48,-1085],"kind":"town"},
    {"id":"port-of-vinton-place","name":"the Port of Vinton","position":[-770,250],"kind":"port"},
    {"id":"i10-vinton","name":"Interstate Ten at Vinton","position":[481,-1698],"kind":"road"},
    {"id":"south-marsh-place","name":"the marsh south of Vinton","position":[1444,1698],"kind":"marsh"},
    {"id":"rice-fields-place","name":"the rice fields east of town","position":[1684,-417],"kind":"field"},
    {"id":"lpv-sign","name":"a sign: the project layout is illustrative; the parish, waterways and towns are real","position":[-96,-306],"kind":"sign"},
  ],
  connectors: [
    {"id":"sw-pv-i10-west","kind":"road","name":"Interstate Ten west toward the Sabine River and Texas","from":{"parish":"lc-port-of-vinton","position":[-2035,-1642]},"to":{"parish":"sabine-texas-line","position":null,"lonlat":[-93.622,30.202]},"lonlat":[-93.622,30.202],"approximate":true},
    {"id":"sw-pv-i10-east","kind":"road","name":"Interstate Ten east toward Sulphur and Lake Charles","from":{"parish":"lc-port-of-vinton","position":[2035,-1447]},"to":{"parish":"lc-sulphur","position":null,"lonlat":[-93.538,30.199]},"lonlat":[-93.538,30.199],"approximate":true},
  ],
  fieldLessons: [],
  gated: [],
};
