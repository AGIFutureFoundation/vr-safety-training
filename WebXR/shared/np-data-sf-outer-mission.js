// Outer Mission & Excelsior — a San Francisco district on the parish schema (console TIDELANDS, docs/consoles/TIDELANDS.md, docs/parishes.md). A stylised
// 4096 m map, not a survey: real places appear only by their public names as places; every coordinate is approximate
// (three decimals, `approximate: true`) and exists only to place the map. One north-up uniform scale (about 2.2 real
// metres per map metre, x east, +z south). The shoreline's shape, the channels, berms, drains and every site are
// PROCEDURAL — laid out from the place's general orientation and land use, never measured. The SFPUC green stormwater infrastructure project works here, as the facts file states it (planted sidewalk filtration systems, rain gardens and an underground infiltration system); every block and site placement is procedural.
// Site names and crews are procedural training places. Pure data, no imports.
export const NP_SF_OUTER_MISSION = {
  id: "sf-outer-mission",
  name: "Outer Mission & Excelsior",
  region: "san-francisco",
  size: 4096,
  blurb: "The Outer Mission at the city's southern edge: Mission Street's transit corridor, blocks where sidewalks gain planted filtration and rain gardens, the underground infiltration site, a school campus, Balboa Park's station, and the hills of Mount Davidson and McLaren Park above.",
  start: "om-rain-garden-block",
  anchors: [
    {"xz":[-280,-253],"lonlat":[-122.447,37.721],"approximate":true,"name":"Balboa Park Station"},
    {"xz":[-560,-1113],"lonlat":[-122.454,37.738],"approximate":true,"name":"Mount Davidson"},
    {"xz":[801,-101],"lonlat":[-122.42,37.718],"approximate":true,"name":"McLaren Park"},
    {"xz":[-1801,-202],"lonlat":[-122.485,37.72],"approximate":true,"name":"Lake Merced"},
    {"xz":[0,0],"lonlat":[-122.44,37.716],"approximate":true,"name":"Mission Street at Geneva Avenue"},
    {"xz":[280,-911],"lonlat":[-122.433,37.734],"approximate":true,"name":"Glen Park"},
    {"xz":[200,304],"lonlat":[-122.435,37.71],"approximate":true,"name":"the Crocker-Amazon playground"},
  ],
  hills: [
    {"id":"mount-davidson","name":"Mount Davidson","center":[-560,-1113],"radius":380,"height":50},
    {"id":"mclaren-park","name":"McLaren Park","center":[801,-101],"radius":420,"height":34},
    {"id":"san-bruno-mountain","name":"San Bruno Mountain","center":[320,1417],"radius":520,"height":60},
  ],
  water: [
    {"id":"lake-merced","name":"Lake Merced","kind":"lake","poly":[[-1950,-300],[-1700,-420],[-1500,-300],[-1520,0],[-1700,120],[-1920,60]]},
    {"id":"lake-merced-south","name":"Lake Merced's south lake","kind":"lake","poly":[[-1900,250],[-1650,220],[-1550,450],[-1700,620],[-1920,560]]},
    {"id":"planted-swale","name":"the planted sidewalk swale (procedural)","kind":"canal","width":6,"poly":[[-500,-150],[-300,-100],[-100,-60]]},
  ],
  levees: [
    {"id":"lake-merced-berm","name":"the Lake Merced shore path berm","height":1.6,"pts":[[-1450,-420],[-1400,-100],[-1450,300]]},
    {"id":"reservoir-embankment","name":"the University Mound reservoir embankment","height":3,"pts":[[1500,-950],[1800,-950],[1800,-700]]},
  ],
  roads: [
    {"id":"mission-street","name":"Mission Street","kind":"avenue","pts":[[560,-708],[-40,-380],[0,0],[-250,500],[-600,1100],[-900,2048]]},
    {"id":"geneva-avenue","name":"Geneva Avenue","kind":"avenue","pts":[[-560,-250],[0,0],[700,150],[1400,400],[2048,700]]},
    {"id":"ocean-avenue","name":"Ocean Avenue","kind":"avenue","pts":[[-1400,-600],[-800,-500],[-400,-300],[-150,-250]]},
    {"id":"southern-freeway","name":"the Southern Freeway","kind":"interstate","pts":[[400,-1300],[-100,-700],[-400,-300],[-900,400],[-1300,1200],[-1400,2048]]},
    {"id":"alemany-boulevard","name":"Alemany Boulevard","kind":"avenue","pts":[[1401,-455],[1100,-700],[400,-500],[-300,-350]]},
    {"id":"san-jose-avenue","name":"San Jose Avenue","kind":"street","pts":[[300,-1600],[0,-1000],[-300,-300],[-500,400]]},
  ],
  districts: [
    {"id":"outer-mission","name":"the Outer Mission","character":"suburb","poly":[[-800,-500],[100,-500],[200,700],[-800,700]]},
    {"id":"excelsior","name":"the Excelsior","character":"quarter","poly":[[100,-500],[1100,-300],[1100,700],[200,700]]},
    {"id":"ingleside","name":"Ingleside","character":"suburb","poly":[[-1400,-1000],[-400,-1000],[-800,-500],[-1400,-500]]},
    {"id":"crocker-amazon","name":"Crocker-Amazon","character":"suburb","poly":[[-800,700],[600,700],[600,1500],[-800,1500]]},
    {"id":"mclaren-park-grounds","name":"McLaren Park","character":"park","poly":[[1100,-500],[1900,-500],[1900,400],[1100,400]]},
    {"id":"balboa-park-station-area","name":"the Balboa Park station area","character":"downtown","poly":[[-500,-600],[-100,-600],[-100,-250],[-500,-250]]},
  ],
  sites: [
    {"id":"om-planted-sidewalk-filtration","name":"Planted Sidewalk Filtration Block","kind":"stormwater","position":[-450,100],"trades":["liuna","afscme","uwua"],"programmes":["hunters-point-bay-restoration","heavy-equipment-operators","situational-awareness","grounds-and-landscaping"],"stations":["bioswale-build","op-excavator-trench-and-utility-locate","trench-box","gk-irrigation-controller-valve-box-and-backflow-check"],"blurb":"A block where the sidewalk gains planted filtration: utility locates, the shallow excavation, the soil and the plants that catch the rain."},
    {"id":"om-rain-garden-block","name":"Rain Garden Block","kind":"stormwater","position":[300,250],"trades":["liuna","afscme"],"programmes":["hunters-point-bay-restoration","grounds-and-landscaping","bay-restoration-maritime-underwater","water-and-gas-utility-crews"],"stations":["bioswale-build","gk-hardscape-paver-base-and-compaction","br-native-planting-and-erosion-mats","ut-service-line-locate-and-hand-dig-near-gas-main"],"blurb":"A street corner turned into a rain garden: hand-digging near the gas line, the curb cut, the planted basin and the paver edge."},
    {"id":"om-underground-infiltration-site","name":"Underground Infiltration Site","kind":"stormwater","position":[650,-150],"trades":["liuna","iuoe","uwua"],"programmes":["situational-awareness","heavy-equipment-operators","confined-space"],"stations":["trench-box","op-excavator-trench-and-utility-locate","op-loader-truck-loading-and-blind-spots","cs-permit-entry-and-attendant-duties"],"blurb":"Where an underground infiltration system goes in under the street: shoring the trench, the excavator by the locate marks and the vault entry permit."},
    {"id":"om-school-campus","name":"Outer Mission School Campus","kind":"school","position":[-150,900],"trades":["seiu-1021","aft","afscme"],"programmes":["education-support-staff"],"stations":["ed-crossing-guard-intersection-control","ed-playground-equipment-inspection","ed-custodial-chemical-dilution-and-floor-machine","ed-kitchen-receiving-and-warewash-sanitizing"],"blurb":"A neighbourhood school: the crossing guard's corner, the playground check, the custodians and the kitchen crew."},
    {"id":"om-transit-corridor","name":"Mission Street Transit Corridor","kind":"transit","position":[-250,-400],"trades":["atu","twu","ibew"],"programmes":["transit-ramp"],"stations":["track-access","signal-cabinet","tr-wheelchair-lift-and-securement-on-a-bus"],"blurb":"The corridor by Balboa Park's station: track access, the signal cabinet and the bus ramp and securement."},
    {"id":"om-sewer-crew-yard","name":"Sewer and Storm Crew Yard","kind":"utility","position":[900,350],"trades":["uwua","afscme"],"programmes":["confined-space"],"stations":["manhole-entry-and-atmospheric-monitoring","valve-vault","lift-station","confined-rescue"],"blurb":"The combined sewer crew's yard: the air test before every manhole, the valve vaults and the rescue tripod on the truck."},
    {"id":"om-utility-locate-crew","name":"Utility Locate Crew","kind":"utility","position":[-700,400],"trades":["uwua","ibew"],"programmes":["water-and-gas-utility-crews","heavy-equipment-operators"],"stations":["ut-service-line-locate-and-hand-dig-near-gas-main","op-excavator-trench-and-utility-locate","ut-water-main-break-emergency-shutdown-and-excavation"],"blurb":"The locate crew marking the lines before anyone digs: paint on the pavement, hand-digging near the gas main and the water main shutoff."},
    {"id":"om-bioretention-soil-yard","name":"Bioretention Soil Yard","kind":"yard","position":[500,1100],"trades":["teamsters","iuoe","liuna"],"programmes":["heavy-equipment-operators"],"stations":["op-loader-truck-loading-and-blind-spots","op-compactor-lift-thickness-and-edge","op-equipment-daily-walkaround-and-fluids"],"blurb":"The yard where the engineered soil for the planters is loaded out: the loader's blind spots, the walkaround and the lift thickness rule."},
    {"id":"om-street-tree-crew","name":"Street Tree and Planting Crew","kind":"park","position":[-950,-100],"trades":["afscme","liuna"],"programmes":["grounds-and-landscaping","bay-restoration-maritime-underwater"],"stations":["gk-tree-work-pole-saw-and-drop-zone","gk-string-trimmer-and-blower-ppe-and-bystander-zone","br-native-planting-and-erosion-mats"],"blurb":"The planting crew for the new filtration strips and street trees: the drop zone under the pole saw and native plants in the planters."},
    {"id":"om-maintenance-crew","name":"Green Infrastructure Maintenance Crew","kind":"utility","position":[150,-250],"trades":["afscme","uwua"],"programmes":["grounds-and-landscaping","hazmat-environmental"],"stations":["gk-irrigation-controller-valve-box-and-backflow-check","stormwater-outfall","gk-storm-cleanup-chipper-and-traffic-control"],"blurb":"The crew that keeps the rain gardens working: the inlet cleared of leaves, the valve box and the cones before work at the curb."},
  ],
  landmarks: [
    {"id":"balboa-park-station","name":"Balboa Park Station","position":[-280,-253],"kind":"station"},
    {"id":"mount-davidson-place","name":"Mount Davidson","position":[-560,-1113],"kind":"park"},
    {"id":"mclaren-park-place","name":"McLaren Park","position":[801,-101],"kind":"park"},
    {"id":"lake-merced-shore","name":"the Lake Merced shore","position":[-1480,-150],"kind":"shore"},
    {"id":"crocker-amazon-playground","name":"the Crocker-Amazon playground","position":[200,304],"kind":"park"},
    {"id":"glen-park-place","name":"Glen Park","position":[280,-911],"kind":"neighbourhood"},
  ],
  connectors: [
    {"id":"sf-om-mission-street","kind":"road","name":"Mission Street north to the Mission","from":{"parish":"sf-outer-mission","position":[560,-708]},"to":{"parish":"sf-mission","position":[-720,1659],"lonlat":[-122.426,37.73]},"lonlat":[-122.426,37.73],"approximate":true},
    {"id":"sf-om-alemany","kind":"road","name":"Alemany Boulevard north-east to the Bayshore Freeway","from":{"parish":"sf-outer-mission","position":[1401,-455]},"to":{"parish":"sf-mission","position":[120,1910],"lonlat":[-122.405,37.725]},"lonlat":[-122.405,37.725],"approximate":true},
    {"id":"sf-om-ocean-avenue-west","kind":"road","name":"Ocean Avenue west to the Sunset","from":{"parish":"sf-outer-mission","position":[-720,-253]},"to":{"parish":"sf-sunset-south","position":[1937,46],"lonlat":[-122.458,37.721]},"lonlat":[-122.458,37.721],"approximate":true},
  ],
  fieldLessons: [
    {"id":"sf-om-fl-sponge-sidewalk","title":"A Sponge in the Sidewalk","site":"om-rain-garden-block","k12":"k12-water-cycle-and-filtration","station":"bioswale-build","trade":"Landscape and green infrastructure crews","tradeLine":"A crew builds a rain garden with loose soil and plants, so rain soaks in instead of racing down the gutter.","minutes":3,"steps":["Find the planted basin beside the curb and the gap that lets water in.","Rain runs off the street into the basin and soaks into the soil.","The plants' roots and the soil clean the water as it sinks into the ground."],"check":{"q":"Where does the rain go in a rain garden?","options":["It soaks into the soil","It stays on the sidewalk","It flows uphill"],"answer":0,"why":"Loose soil and roots let the water sink in and clean it on the way."}},
    {"id":"sf-om-fl-call-before-you-dig","title":"Paint on the Pavement","site":"om-utility-locate-crew","k12":"k12-reading-instructions-and-safety-labels","station":"ut-service-line-locate-and-hand-dig-near-gas-main","trade":"Utility locators","tradeLine":"A locator paints coloured marks over the buried lines, and the crew hand-digs near them before any machine comes close.","minutes":3,"steps":["Look for coloured paint lines and flags on the street and sidewalk.","Each colour stands for a kind of buried line, like gas, water or power.","Near the marks the crew digs by hand so nobody hits a pipe or cable."],"check":{"q":"What does the crew do close to the paint marks?","options":["Dig by hand","Dig faster with the machine","Ignore them"],"answer":0,"why":"Hand digging near a marked line keeps the crew from hitting it."}},
    {"id":"sf-om-fl-crossing-guard","title":"The Crossing Guard's Corner","site":"om-school-campus","landmark":"crocker-amazon-playground","k12":"k12-teamwork-and-feedback","trade":"School crossing guards","tradeLine":"A crossing guard waits for the traffic to stop, steps out first, and walks the children across together.","minutes":2,"steps":["Stand at the corner and watch the guard look both ways.","The guard steps into the street with the sign before anyone crosses.","Children cross as a group while the guard holds the traffic."],"check":{"q":"When do the children start to cross?","options":["After the guard has stopped the traffic","As soon as they reach the corner","When a friend waves"],"answer":0,"why":"The guard stops the traffic first, then the group crosses together."}},
  ],
  gated: [
    {"id":"sf-om-gated-rain-garden","kind":"side-quest","title":"Planting the Corner Rain Garden","world":"parishes","parish":"sf-outer-mission","site":"om-rain-garden-block","siteName":"Rain Garden Block","summary":"Build and plant a rain garden basin at a street corner.","gate":{"stations":["bioswale-build","ut-service-line-locate-and-hand-dig-near-gas-main"],"note":"Finish the bioswale build and the service line locate before the planting"}},
    {"id":"sf-om-gated-infiltration-vault","kind":"side-quest","title":"Setting the Infiltration Chambers","world":"parishes","parish":"sf-outer-mission","site":"om-underground-infiltration-site","siteName":"Underground Infiltration Site","summary":"Help set the underground infiltration chambers in a shored trench.","gate":{"stations":["trench-box","op-excavator-trench-and-utility-locate"],"note":"Walk the trench box and excavator locate stations before the chambers go in"}},
  ],
};
