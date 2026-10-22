// San Mateo County Bayside (representative) — a Bay Program project area on the parish schema (console PROJECTLANDS,
// docs/consoles/PROJECTLANDS.md, docs/parishes.md). A stylised 4096 m map, not a survey: every coordinate is approximate
// (three decimals, `approximate: true`) and exists only to place the map. One north-up uniform scale (about 2.2 real
// metres per map metre, x east, +z south). The project here is C/CAG's, as the facts file states it: the City/County
// Association of Governments of San Mateo County, to monitor and control PCB sources. The project's sites are NOT named in
// our sources, so this map is a REPRESENTATIVE bayside industrial area on the county's bay shore chosen by the platform:
// the shoreline's general orientation (the bay to the north-east), San Francisco Bay and the Bayshore Freeway are the only
// real features; the slough, the channel, the levees, every street, yard and site are PROCEDURAL. No real plant, property
// or facility here is part of the project. Site names and crews are procedural training places. Pure data, no imports.
export const NP_BP_SAN_MATEO_SHORELINE = {
  id: "bp-san-mateo-shoreline",
  name: "San Mateo County Bayside (representative)",
  region: "bay-program",
  representative: true,
  size: 4096,
  blurb: "A representative bayside industrial area on San Mateo County's shore of San Francisco Bay, chosen by the platform for C/CAG's project to monitor and control PCB sources: sampling crews in protective gear, a decontamination line, storm drain sediment sampling, regulated soil loaded and hauled, and the marsh edge watched. The project's own sites are not named, so no place here is one of them.",
  start: "smc-pcb-soil-sampling",
  anchors: [
    {"xz":[1003,-1518],"lonlat":[-122.22,37.55],"approximate":true,"name":"San Francisco Bay"},
    {"xz":[0,-253],"lonlat":[-122.245,37.525],"approximate":true,"name":"the bay shore (representative)"},
    {"xz":[-401,506],"lonlat":[-122.255,37.51],"approximate":true,"name":"the bayside industrial area (representative)"},
    {"xz":[-1003,759],"lonlat":[-122.27,37.505],"approximate":true,"name":"the Bayshore Freeway (representative stretch)"},
    {"xz":[803,-506],"lonlat":[-122.225,37.53],"approximate":true,"name":"a point on the bay (representative)"},
    {"xz":[1605,759],"lonlat":[-122.205,37.505],"approximate":true,"name":"the shore to the south-east (representative)"},
    {"xz":[-1605,-1518],"lonlat":[-122.285,37.55],"approximate":true,"name":"the shore to the north-west (representative)"},
  ],
  hills: [
    {"id":"peninsula-hills-edge","name":"the Peninsula hills (the field's south-west corner)","center":[-1850,1800],"radius":380,"height":26},
  ],
  water: [
    {"id":"san-francisco-bay","name":"San Francisco Bay","kind":"bay","poly":[[-2048,-2048],[2048,-2048],[2048,1050],[1605,759],[1000,380],[500,40],[0,-253],[-600,-700],[-1100,-1100],[-1605,-1518],[-2048,-1900]]},
    {"id":"bayside-marsh","name":"the tidal marsh edge (procedural)","kind":"wetland","poly":[[-2048,-1900],[-1605,-1518],[-1100,-1100],[-600,-700],[0,-253],[500,40],[1000,380],[1605,759],[2048,1050],[2048,1300],[1605,1010],[1000,630],[500,290],[0,0],[-600,-450],[-1100,-850],[-1605,-1268],[-2048,-1650]]},
    {"id":"tidal-slough","name":"a tidal slough (procedural)","kind":"canal","width":30,"poly":[[-900,700],[-760,250],[-560,-150],[-420,-420],[-330,-560]]},
    {"id":"flood-control-channel","name":"a flood control channel (procedural)","kind":"canal","width":16,"poly":[[1250,2048],[1060,1400],[860,900],[740,480],[660,120]]},
  ],
  levees: [
    {"id":"bayfront-levee","name":"the bayfront levee (procedural)","height":3,"pts":[[-2048,-1600],[-1605,-1220],[-1100,-800],[-600,-400],[0,50],[500,340],[1000,680],[1605,1060],[2048,1350]]},
    {"id":"slough-levee","name":"the slough levee (procedural)","height":2.4,"pts":[[-820,720],[-690,280],[-500,-110]]},
  ],
  roads: [
    {"id":"bayshore-freeway","name":"the Bayshore Freeway","kind":"interstate","pts":[[-2048,-400],[-1300,150],[-600,650],[200,1150],[1000,1650],[1500,2048]]},
    {"id":"bayfront-road","name":"the bayfront road (procedural)","kind":"avenue","pts":[[-2048,-1250],[-1400,-750],[-800,-260],[-200,200],[400,560],[1000,900],[1700,1340],[2048,1560]]},
    {"id":"industrial-way-west","name":"an industrial way (procedural)","kind":"street","pts":[[-1700,-930],[-1500,-300],[-1350,300],[-1250,900]]},
    {"id":"industrial-way-east","name":"a second industrial way (procedural)","kind":"street","pts":[[150,320],[0,800],[-150,1300],[-250,1900]]},
    {"id":"rail-spur","name":"a rail spur (procedural)","kind":"street","pts":[[-2048,400],[-1000,1000],[0,1600],[600,2048]]},
    {"id":"shoreline-trail","name":"the shoreline trail (procedural)","kind":"street","pts":[[-1605,-1280],[-1100,-860],[-600,-460],[-100,-60],[500,300],[1000,640]]},
  ],
  districts: [
    {"id":"marsh-edge","name":"the tidal marsh edge (procedural)","character":"wetland","poly":[[-2048,-1900],[-1605,-1518],[0,-253],[1605,759],[2048,1050],[2048,1300],[1605,1010],[0,0],[-1605,-1268],[-2048,-1650]]},
    {"id":"bayside-industrial-north","name":"the bayside industrial area, north (representative)","character":"industrial","poly":[[-2048,-1600],[-1605,-1200],[-600,-380],[0,80],[500,360],[500,1000],[-600,650],[-1300,150],[-2048,-400]]},
    {"id":"bayside-industrial-south","name":"the bayside industrial area, south (representative)","character":"industrial","poly":[[500,360],[1605,1080],[2048,1380],[2048,2048],[1500,2048],[1000,1650],[500,1000]]},
    {"id":"business-park","name":"the business park beyond the freeway (procedural)","character":"quarter","poly":[[-2048,-400],[-1300,150],[-600,650],[200,1150],[-300,1500],[-2048,1000]]},
    {"id":"neighbourhoods","name":"the neighbourhoods beyond the freeway (procedural)","character":"suburb","poly":[[-2048,1000],[-300,1500],[200,1150],[1000,1650],[1500,2048],[-2048,2048]]},
  ],
  sites: [
    {"id":"smc-pcb-soil-sampling","name":"Soil Sampling Grid (representative)","kind":"sampling","position":[-1100,-250],"trades":["liuna","ifpte"],"programmes":["bay-program-projects","hazmat-environmental"],"stations":["br-legacy-mercury-and-pcb-hotspot-handling","br-sediment-chain-of-custody-and-lab-prep","decon-line","sample-kit-shipping"],"blurb":"C/CAG's project under the EPA's San Francisco Bay Program is to monitor and control PCB sources in San Mateo County. Here a sampling crew works a procedural grid in protective gear, bags each sample, labels it and starts the chain of custody before anything leaves the site."},
    {"id":"smc-decon-line","name":"Decontamination Line","kind":"decon","position":[-1300,-20],"trades":["liuna"],"programmes":["hazmat-environmental"],"stations":["decon-line","hz-level-b-entry-and-scba-change-out","decon-support-laborer","air-monitor"],"blurb":"The line every sampler walks back through: boots, gloves and suits off in order, tools washed and the rinse water contained."},
    {"id":"smc-storm-drain-sediment-sampling","name":"Storm Drain Sediment Sampling","kind":"monitoring","position":[300,700],"trades":["afscme","liuna"],"programmes":["water-and-gas-utility-crews","hazmat-environmental"],"stations":["stormwater-outfall","manhole-entry-and-atmospheric-monitoring","br-sediment-chain-of-custody-and-lab-prep","sampling-well"],"blurb":"Sediment in a storm drain tells a monitoring crew what the street is carrying toward the bay: the air is tested before the lid comes off and the sample is taken from above."},
    {"id":"smc-regulated-soil-loadout","name":"Regulated Soil Load-Out","kind":"haul","position":[-500,300],"trades":["teamsters","iuoe-local3"],"programmes":["heavy-equipment-operators","hazmat-environmental"],"stations":["soil-loadout","op-loader-truck-loading-and-blind-spots","tdl-pretrip-inspection","community-soil-split"],"blurb":"Soil that must be handled as regulated waste is loaded, tarped and manifested here, with the loader's blind spots kept clear and the truck walked around before it leaves."},
    {"id":"smc-pcb-equipment-removal","name":"Old Electrical Equipment Removal","kind":"remediation","position":[-200,650],"trades":["ibew","liuna"],"programmes":["hazmat-environmental","electrical-first-period"],"stations":["pcb-equipment-removal","abatement-chamber","drum-sampling-and-overpack"],"blurb":"A procedural building where old electrical equipment is taken out the way a PCB source is controlled: de-energised, contained, drained into drums and labelled."},
    {"id":"smc-drum-staging-yard","name":"Drum Staging Yard","kind":"hazmat","position":[900,1250],"trades":["teamsters","liuna"],"programmes":["hazmat-environmental","warehouse-and-logistics-automation"],"stations":["hz-drum-staging-and-compatibility-segregation","drum-sampling-and-overpack","forklift-dock"],"blurb":"Drums wait here for pickup, segregated by what is in them, each one labelled, and the forklift lane kept apart from people on foot."},
    {"id":"smc-outfall-monitoring","name":"Channel Mouth Monitoring Point","kind":"monitoring","position":[560,190],"trades":["afscme","ifpte"],"programmes":["bay-restoration-maritime-underwater","marine-ecology-and-restoration"],"stations":["stormwater-outfall","br-water-quality-sonde-calibration-and-deploy","me-water-column-sampling-from-a-small-boat"],"blurb":"Where the procedural flood control channel meets the bay: the outfall inspection, the calibrated sonde and a water sample taken from a small boat."},
    {"id":"smc-marsh-sediment-coring","name":"Marsh Edge Sediment Survey","kind":"wetland","position":[-1000,-900],"trades":["liuna","ifpte"],"programmes":["bay-restoration-maritime-underwater","marine-ecology-and-restoration"],"stations":["br-benthic-grab-and-invertebrate-sorting","marsh-transect-survey","br-sediment-chain-of-custody-and-lab-prep"],"blurb":"The marsh edge below the levee, walked on a transect: mud grabbed, sorted and sealed for the lab, with the tide and the soft ground watched."},
    {"id":"smc-drain-cleanout-crew","name":"Street Drain Clean-Out Crew","kind":"utility","position":[-1600,300],"trades":["afscme","teamsters"],"programmes":["bay-program-projects","grounds-and-landscaping"],"stations":["bk-street-drain-trash-capture-cleanout","gk-storm-cleanup-chipper-and-traffic-control","manhole-entry-and-atmospheric-monitoring"],"blurb":"Keeping sediment out of the drains keeps what rides on it out of the bay: cones set, the grate lifted, the inlet cleaned from the street."},
    {"id":"smc-lab-intake","name":"Sample Intake Desk","kind":"lab","position":[-800,1300],"trades":["ifpte","afscme"],"programmes":["bay-restoration-maritime-underwater","hazmat-environmental"],"stations":["sample-kit-shipping","br-sediment-chain-of-custody-and-lab-prep","br-restoration-data-qa-and-public-reporting"],"blurb":"Where coolers arrive and the chain of custody is signed over: temperatures checked, labels matched to the form, and the data checked before anyone reports it."},
    {"id":"smc-levee-patrol","name":"Bayfront Levee Patrol","kind":"levee","position":[-420,-40],"trades":["liuna","afscme"],"programmes":["bay-restoration-maritime-underwater"],"stations":["br-levee-inspection-and-seepage","tide-gate","br-cold-water-immersion-and-mob-recovery"],"blurb":"The levee walk between the yards and the marsh: seepage on the land side, the tide gate locked out before anyone touches it, and a throw line near the water."},
    {"id":"smc-air-monitoring","name":"Perimeter Air Monitoring","kind":"monitoring","position":[1300,1520],"trades":["afscme","ifpte"],"programmes":["air-quality-monitoring","hazmat-environmental"],"stations":["air-monitor","mobile-air-lab","opacity-reading"],"blurb":"Dust from soil work is watched at the fence line: the monitor set upwind and downwind, and the work stopped when the reading says so."},
    {"id":"smc-excavation-cell","name":"Excavation Cell","kind":"excavation","position":[-1500,-620],"trades":["iuoe-local3","liuna"],"programmes":["heavy-equipment-operators","plumbers-and-pipefitters"],"stations":["trench-box","op-excavator-trench-and-utility-locate","ut-service-line-locate-and-hand-dig-near-gas-main"],"blurb":"Before any soil is dug the utilities are located and the last of it is dug by hand; the trench is shored and the spoil kept back from the edge."},
  ],
  landmarks: [
    {"id":"san-francisco-bay-shore","name":"the San Francisco Bay shore","position":[0,-270],"kind":"shore"},
    {"id":"tidal-slough-mouth","name":"the tidal slough's mouth (procedural)","position":[-340,-560],"kind":"canal"},
    {"id":"channel-mouth","name":"the flood control channel's mouth (procedural)","position":[665,110],"kind":"canal"},
    {"id":"marsh-edge-point","name":"the marsh edge (procedural)","position":[-1200,-1000],"kind":"point"},
    {"id":"bayshore-freeway-place","name":"the Bayshore Freeway","position":[-600,700],"kind":"neighbourhood"},
    {"id":"peninsula-hills-place","name":"the Peninsula hills","position":[-1700,1650],"kind":"neighbourhood"},
    {"id":"representative-sign","name":"a sign: a representative area, not a project site","position":[-1150,-140],"kind":"point"},
  ],
  connectors: [
    {"id":"bp-smc-bayshore-north-west","kind":"road","name":"The Bayshore Freeway north-west up the Peninsula","from":{"parish":"bp-san-mateo-shoreline","position":[-2000,-365]},"to":{"parish":"bay-peninsula","position":null,"lonlat":[-122.295,37.527]},"lonlat":[-122.295,37.527],"approximate":true},
    {"id":"bp-smc-bayshore-south-east","kind":"road","name":"The Bayshore Freeway south-east down the Peninsula","from":{"parish":"bp-san-mateo-shoreline","position":[1427,1990]},"to":{"parish":"bay-peninsula-south","position":null,"lonlat":[-122.209,37.481]},"lonlat":[-122.209,37.481],"approximate":true},
  ],
  fieldLessons: [
    {"id":"pj-smc-fl-where-the-drain-goes","title":"What Rides the Storm Drain","site":"smc-storm-drain-sediment-sampling","k12":"k12-es-where-the-storm-drain-goes","station":"stormwater-outfall","trade":"Monitoring crews","tradeLine":"A monitoring crew samples the sediment in a storm drain, because what the rain washes off the street ends up in the bay.","minutes":3,"steps":["Find a storm drain grate near the yards.","Rain washes dust and grit off the street and down the drain toward the bay.","A crew samples the sediment in the drain to learn what the street is carrying."],"check":{"q":"Why does a crew sample the sediment in a storm drain?","options":["To learn what the street is carrying toward the bay","To make the drain deeper","To find lost keys"],"answer":0,"why":"Storm drains carry street runoff to the bay, so their sediment shows what is being carried there."}},
    {"id":"pj-smc-fl-mud-on-the-move","title":"Mud on the Move","site":"smc-marsh-sediment-coring","landmark":"marsh-edge-point","k12":"k12-es-mud-on-the-move","station":"br-sediment-chain-of-custody-and-lab-prep","trade":"Sampling technicians","tradeLine":"A sampling technician labels and seals every jar of mud, because a sample with no record cannot be trusted.","minutes":3,"steps":["Look at the mud at the marsh edge below the levee.","Mud moves with the water, and some things stick to it and travel with it.","Samplers seal and label each jar and sign the form that follows it to the lab."],"check":{"q":"Why is every sample jar labelled and signed for?","options":["So the lab result can be trusted","To make the jar heavier","Because the mud is valuable"],"answer":0,"why":"The chain of custody shows who handled a sample and when, so the result can be trusted."}},
    {"id":"pj-smc-fl-clean-line","title":"The Clean Line","site":"smc-decon-line","k12":"k12-a-controlled-experiment","station":"decon-line","trade":"Environmental laborers","tradeLine":"An environmental laborer takes off protective gear in a set order, so nothing on the suit reaches skin or the street.","minutes":3,"steps":["Walk to the decontamination line beside the sampling grid.","Each station on the line removes one layer, from the dirtiest to the cleanest.","The rinse water is caught and kept, not poured down a drain."],"check":{"q":"Why is protective gear taken off in a set order?","options":["So what is on the outside never reaches skin","To save time","Because the suit is new"],"answer":0,"why":"Working from the dirtiest layer to the cleanest keeps contamination off the worker and the street."}},
  ],
  gated: [
    {"id":"bp-smc-gated-first-sampling-day","kind":"side-quest","title":"First Day on the Sampling Grid","world":"parishes","parish":"bp-san-mateo-shoreline","site":"smc-pcb-soil-sampling","siteName":"Soil Sampling Grid (representative)","summary":"Work a sampling grid with the crew and walk back through the decontamination line.","gate":{"stations":["br-legacy-mercury-and-pcb-hotspot-handling","decon-line"],"note":"Finish the PCB hotspot handling and decontamination line stations first"}},
    {"id":"bp-smc-gated-load-out","kind":"side-quest","title":"Load, Tarp and Manifest","world":"parishes","parish":"bp-san-mateo-shoreline","site":"smc-regulated-soil-loadout","siteName":"Regulated Soil Load-Out","summary":"Load a truck of regulated soil and send it off with the paperwork right.","gate":{"stations":["soil-loadout","tdl-pretrip-inspection"],"note":"Finish the soil load-out and pre-trip inspection stations first"}},
  ],
};
