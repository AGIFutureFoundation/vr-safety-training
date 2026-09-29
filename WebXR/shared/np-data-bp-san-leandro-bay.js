// San Leandro Bay & San Leandro Creek — a Bay Program project area on the parish schema (console TIDELANDS, docs/consoles/TIDELANDS.md, docs/parishes.md). A stylised
// 4096 m map, not a survey: real places appear only by their public names as places; every coordinate is approximate
// (three decimals, `approximate: true`) and exists only to place the map. One north-up uniform scale (about 2.2 real
// metres per map metre, x east, +z south). The shoreline's shape, the channels, berms, drains and every site are
// PROCEDURAL — laid out from the place's general orientation and land use, never measured. The project here is the City of San Leandro's, as the facts file states it (two large trash capture devices in stormwater drains).
// Site names and crews are procedural training places. Pure data, no imports.
export const NP_BP_SAN_LEANDRO_BAY = {
  id: "bp-san-leandro-bay",
  name: "San Leandro Bay & San Leandro Creek",
  region: "bay-program",
  size: 4096,
  blurb: "San Leandro Creek's mouth and San Leandro Bay's shore: the creek running down from the hills to the bay, the storm drains that feed it, the two trash capture device sites, the shoreline park and marsh, and the industrial frontage along the freeway.",
  start: "slb-trash-capture-device-north",
  anchors: [
    {"xz":[-600,-405],"lonlat":[-122.215,37.753],"approximate":true,"name":"San Leandro Bay"},
    {"xz":[80,101],"lonlat":[-122.198,37.743],"approximate":true,"name":"the mouth of San Leandro Creek"},
    {"xz":[-320,-152],"lonlat":[-122.208,37.748],"approximate":true,"name":"Arrowhead Marsh"},
    {"xz":[-200,-253],"lonlat":[-122.205,37.75],"approximate":true,"name":"Martin Luther King Jr. Regional Shoreline"},
    {"xz":[-1000,1265],"lonlat":[-122.225,37.72],"approximate":true,"name":"the Oakland airport shore"},
    {"xz":[1720,1012],"lonlat":[-122.157,37.725],"approximate":true,"name":"downtown San Leandro"},
    {"xz":[1801,-1265],"lonlat":[-122.155,37.77],"approximate":true,"name":"the San Leandro hills"},
  ],
  hills: [
    {"id":"san-leandro-hills","name":"the San Leandro hills","center":[1801,-1366],"radius":330,"height":30},
  ],
  water: [
    {"id":"san-leandro-bay","name":"San Leandro Bay","kind":"bay","poly":[[-1700,-500],[-900,-600],[-300,-420],[-60,-150],[-120,80],[-500,150],[-1000,120],[-1500,60],[-1800,-150]]},
    {"id":"san-francisco-bay","name":"San Francisco Bay","kind":"bay","poly":[[-2048,400],[-1700,600],[-1500,1400],[-1200,2048],[-2048,2048]]},
    {"id":"arrowhead-marsh","name":"Arrowhead Marsh","kind":"wetland","poly":[[-500,-260],[-250,-300],[-150,-120],[-380,-30]]},
    {"id":"san-leandro-creek","name":"San Leandro Creek","kind":"canal","width":22,"poly":[[1900,1100],[1400,900],[1000,700],[600,480],[250,250],[0,60],[-100,0]]},
    {"id":"storm-drain-channel","name":"the industrial storm drain channel (procedural)","kind":"canal","width":10,"poly":[[700,-300],[400,-200],[150,-150],[-80,-180]]},
  ],
  levees: [
    {"id":"san-leandro-bay-shore","name":"the San Leandro Bay shoreline","height":2.6,"pts":[[-1600,-700],[-900,-780],[-200,-620],[120,-300]]},
    {"id":"san-leandro-creek-flood-wall","name":"the San Leandro Creek flood wall","height":3.2,"pts":[[1400,830],[1000,630],[600,410],[300,190]]},
    {"id":"airport-dike","name":"the airport shore dike","height":3,"pts":[[-1640,700],[-1440,1400],[-1150,2000]]},
  ],
  roads: [
    {"id":"nimitz-freeway","name":"the Nimitz Freeway","kind":"interstate","pts":[[200,-253],[600,-120],[1100,250],[1600,700],[2048,1100]]},
    {"id":"doolittle-drive","name":"Doolittle Drive","kind":"avenue","pts":[[-1400,300],[-900,350],[-400,420],[100,500],[700,900],[1100,1500],[1300,2048]]},
    {"id":"hegenberger-road","name":"Hegenberger Road","kind":"avenue","pts":[[900,-700],[600,-100],[300,350],[0,900],[-300,1500]]},
    {"id":"international-boulevard","name":"International Boulevard","kind":"avenue","pts":[[720,-304],[1300,0],[1600,400],[2048,800]]},
    {"id":"san-leandro-boulevard","name":"San Leandro Boulevard","kind":"avenue","pts":[[1000,-700],[1500,200],[1800,1100],[2048,1700]]},
    {"id":"bay-trail","name":"the Bay Trail","kind":"street","pts":[[-1500,-760],[-900,-840],[-200,-680],[80,-420]]},
  ],
  districts: [
    {"id":"shoreline-park","name":"the shoreline park","character":"park","poly":[[-1600,-1000],[100,-1000],[150,-400],[-200,-620],[-900,-760],[-1600,-680]]},
    {"id":"east-oakland","name":"East Oakland","character":"suburb","poly":[[150,-2048],[1500,-2048],[1500,-800],[150,-800]]},
    {"id":"industrial-frontage","name":"the industrial frontage along the freeway","character":"industrial","poly":[[100,-600],[1000,-600],[1400,500],[300,500]]},
    {"id":"san-leandro","name":"San Leandro","character":"suburb","poly":[[1100,700],[2048,500],[2048,2048],[1400,2048]]},
    {"id":"airport-edge","name":"the airport edge","character":"industrial","poly":[[-1400,450],[300,600],[800,1300],[900,2048],[-1000,2048]]},
    {"id":"creek-mouth","name":"the creek mouth and marsh","character":"wetland","poly":[[-500,-300],[100,-300],[150,200],[-400,200]]},
  ],
  sites: [
    {"id":"slb-trash-capture-device-north","name":"Trash Capture Device Site, North","kind":"trash-capture","position":[700,160],"trades":["uwua","afscme","liuna"],"programmes":["bay-restoration-maritime-underwater","confined-space","water-and-gas-utility-crews"],"stations":["br-trash-capture-device-service","manhole-entry-and-atmospheric-monitoring","cs-permit-entry-and-attendant-duties","ut-hydrant-flow-test-and-flushing-with-traffic-control"],"blurb":"One of the two large trash capture devices in the storm drains above the creek: the traffic control, the air test before entry and the cleanout."},
    {"id":"slb-trash-capture-device-south","name":"Trash Capture Device Site, South","kind":"trash-capture","position":[1200,1000],"trades":["uwua","afscme","liuna"],"programmes":["bay-restoration-maritime-underwater","confined-space","hazmat-environmental"],"stations":["br-trash-capture-device-service","cs-ventilation-and-air-monitoring-plan","cs-non-entry-retrieval-and-tripod","stormwater-outfall"],"blurb":"The second large trash capture device, in a storm drain on the San Leandro side: ventilation, the tripod for non-entry rescue and the debris load-out."},
    {"id":"slb-storm-drain-crew","name":"Storm Drain Crew Yard","kind":"utility","position":[1500,0],"trades":["uwua","afscme"],"programmes":["confined-space","water-and-gas-utility-crews"],"stations":["manhole-entry-and-atmospheric-monitoring","valve-vault","ut-night-storm-response-crew-and-portable-generator","confined-rescue"],"blurb":"The storm drain crew's yard: the gas meter checked before every manhole, the vault crew and the night storm response."},
    {"id":"slb-creek-mouth-restoration","name":"Creek Mouth Restoration Site","kind":"wetland","position":[-250,150],"trades":["liuna","iuoe"],"programmes":["hunters-point-bay-restoration","bay-restoration-maritime-underwater"],"stations":["living-shoreline","br-native-planting-and-erosion-mats","br-turbidity-curtain-deployment","br-culvert-retrofit-for-fish-passage"],"blurb":"Where San Leandro Creek meets the bay: the living shoreline, native planting, the turbidity curtain and a culvert opened for fish."},
    {"id":"slb-shoreline-park-crew","name":"Shoreline Park Crew","kind":"park","position":[-800,-900],"trades":["afscme","liuna"],"programmes":["bay-restoration-maritime-underwater","grounds-and-landscaping","hunters-point-bay-restoration"],"stations":["br-shoreline-cleanup-sharps-and-hazardous-debris","gk-string-trimmer-and-blower-ppe-and-bystander-zone","br-volunteer-cleanup-day-safety-lead","marsh-transect-survey"],"blurb":"The shoreline park's crew: the tide-line clean-up with sharps tongs, the trimmer's bystander zone and the volunteer day briefing."},
    {"id":"slb-industrial-frontage-yard","name":"Industrial Frontage Yard","kind":"industrial","position":[800,-400],"trades":["teamsters","iam"],"programmes":["transit-ramp","hazmat-environmental"],"stations":["forklift-dock","drum-sampling-and-overpack","hz-drum-staging-and-compatibility-segregation","stormwater-outfall"],"blurb":"A yard on the frontage road: forklifts at the dock, drums staged and sampled, and the yard drain kept clean so nothing reaches the creek."},
    {"id":"slb-outfall-monitoring","name":"Creek Outfall Monitoring Point","kind":"monitoring","position":[300,600],"trades":["afscme","ifpte"],"programmes":["hazmat-environmental","bay-restoration-maritime-underwater","marine-ecology-and-restoration"],"stations":["stormwater-outfall","br-water-quality-sonde-calibration-and-deploy","me-shoreline-debris-and-microplastics-survey"],"blurb":"Where the storm drains reach the creek: the outfall inspection, the sonde and the debris count on the bank."},
    {"id":"slb-shoreline-cleanup-point","name":"Tide Line Clean-Up Point","kind":"shore","position":[-1300,-800],"trades":["liuna","afscme"],"programmes":["bay-restoration-maritime-underwater","marine-ecology-and-restoration"],"stations":["br-shoreline-cleanup-sharps-and-hazardous-debris","me-shoreline-debris-and-microplastics-survey","br-volunteer-cleanup-day-safety-lead"],"blurb":"A beach on the bay shore where the tide leaves its trash: gloves, tongs, the sharps box and the count."},
    {"id":"slb-levee-inspection","name":"Shoreline Levee Inspection","kind":"levee","position":[-600,-850],"trades":["liuna","afscme"],"programmes":["bay-restoration-maritime-underwater","hunters-point-bay-restoration"],"stations":["br-levee-inspection-and-seepage","tide-gate","br-cold-water-immersion-and-mob-recovery"],"blurb":"The shoreline levee walk: seepage on the land side, the tide gate's lockout and a throw line near the water."},
    {"id":"slb-corporation-yard","name":"Public Works Corporation Yard","kind":"yard","position":[1700,600],"trades":["afscme","teamsters","iuoe"],"programmes":["heavy-equipment-operators","grounds-and-landscaping"],"stations":["op-equipment-daily-walkaround-and-fluids","op-loader-truck-loading-and-blind-spots","gk-storm-cleanup-chipper-and-traffic-control"],"blurb":"The public works yard: the vacuum and loader trucks walked around each morning and the storm clean-up crews loading out."},
  ],
  landmarks: [
    {"id":"san-leandro-bay-shore-place","name":"the San Leandro Bay shore","position":[-900,-700],"kind":"shore"},
    {"id":"san-leandro-creek-mouth","name":"the mouth of San Leandro Creek","position":[-60,40],"kind":"canal"},
    {"id":"arrowhead-marsh-place","name":"Arrowhead Marsh","position":[-330,-150],"kind":"point"},
    {"id":"mlk-shoreline","name":"Martin Luther King Jr. Regional Shoreline","position":[-200,-354],"kind":"shore"},
    {"id":"san-leandro-creek-bank","name":"the San Leandro Creek bank","position":[1100,700],"kind":"canal"},
    {"id":"oakland-airport-shore","name":"the Oakland airport shore","position":[-1450,800],"kind":"shore"},
    {"id":"downtown-san-leandro","name":"downtown San Leandro","position":[1720,1012],"kind":"neighbourhood"},
  ],
  connectors: [
    {"id":"bp-sl-nimitz-fruitvale","kind":"road","name":"The Nimitz Freeway north-west to Fruitvale","from":{"parish":"bp-san-leandro-bay","position":[200,-253]},"to":{"parish":"oak-fruitvale-estuary","position":null,"lonlat":[-122.195,37.75]},"lonlat":[-122.195,37.75],"approximate":true},
    {"id":"bp-sl-international-fruitvale","kind":"road","name":"International Boulevard north-west to Fruitvale","from":{"parish":"bp-san-leandro-bay","position":[720,-304]},"to":{"parish":"oak-fruitvale-estuary","position":null,"lonlat":[-122.182,37.751]},"lonlat":[-122.182,37.751],"approximate":true},
  ],
  fieldLessons: [
    {"id":"bp-slb-fl-where-the-drain-goes","title":"Where the Storm Drain Goes","site":"slb-outfall-monitoring","landmark":"san-leandro-creek-bank","k12":"k12-by-what-a-pump-station-does-in-the-rain","station":"stormwater-outfall","trade":"Storm drain crews","tradeLine":"A storm drain crew keeps the drains clear, because whatever goes down a street drain comes out in the creek.","minutes":3,"steps":["Find a storm drain grate at the curb near the creek.","Rain carries whatever is on the street down the drain and out into the creek.","The crew checks the outfall where the pipe meets the creek and clears what collects there."],"check":{"q":"Where does water from a street drain go?","options":["Into the creek and on to the bay","To a treatment plant every time","Nowhere, it stays in the pipe"],"answer":0,"why":"Storm drains carry rain straight to the creek, so trash on the street ends up in the water."}},
    {"id":"bp-slb-fl-trash-catcher","title":"A Trash Catcher Under the Street","site":"slb-trash-capture-device-north","k12":"k12-water-cycle-and-filtration","station":"br-trash-capture-device-service","trade":"Utility workers","tradeLine":"A crew opens a trash capture device only after testing the air and setting cones, then lifts the trash out from above.","minutes":3,"steps":["Under some streets a big screened box sits inside the storm drain.","Water flows through the screen and the trash stays behind.","The crew tests the air, sets cones and cleans the box out from the street."],"check":{"q":"What does the screen in the device keep?","options":["The trash","The water","The fish"],"answer":0,"why":"Water passes through the screen, and the trash is held until the crew removes it."}},
    {"id":"bp-slb-fl-shore-speed-bump","title":"The Shoreline as a Speed Bump","site":"slb-creek-mouth-restoration","landmark":"arrowhead-marsh-place","k12":"k12-by-wetlands-as-a-storms-speed-bump","station":"living-shoreline","trade":"Shoreline restoration crews","tradeLine":"A restoration crew plants the marsh at the creek mouth, because grass and mud slow the waves before they reach the path.","minutes":3,"steps":["Look at the marsh where the creek meets the bay.","A wave loses its push as it rolls through the plants and the shallows.","The crew plants native grasses so the living shore keeps doing that job."],"check":{"q":"Why plant grasses at the creek mouth?","options":["They slow the waves","They block the creek","They are for decoration only"],"answer":0,"why":"Plants and shallow mud take the push out of a wave."}},
  ],
  gated: [
    {"id":"bp-slb-gated-first-cleanout","kind":"side-quest","title":"The First Cleanout of the Season","world":"parishes","parish":"bp-san-leandro-bay","site":"slb-trash-capture-device-north","siteName":"Trash Capture Device Site, North","summary":"Clean out a trash capture device with the storm drain crew before the rains.","gate":{"stations":["br-trash-capture-device-service","manhole-entry-and-atmospheric-monitoring"],"note":"Finish the trash capture device service and manhole entry stations before the cleanout"}},
    {"id":"bp-slb-gated-creek-mouth-day","kind":"side-quest","title":"Planting Day at the Creek Mouth","world":"parishes","parish":"bp-san-leandro-bay","site":"slb-creek-mouth-restoration","siteName":"Creek Mouth Restoration Site","summary":"Plant the marsh edge where the creek meets the bay.","gate":{"stations":["living-shoreline"],"note":"Finish the living shoreline station before planting day"}},
  ],
};
