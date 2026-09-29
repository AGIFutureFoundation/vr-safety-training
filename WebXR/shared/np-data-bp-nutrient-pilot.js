// A Nutrient Pilot Plant on San Pablo Bay (procedural, representative) — a Bay Program project area on the parish schema
// (console PROJECTLANDS, docs/consoles/PROJECTLANDS.md, docs/parishes.md). A stylised 4096 m map, not a survey: every
// coordinate is approximate (three decimals, `approximate: true`) and exists only to place the map on a stretch of San
// Pablo Bay's southern shore that no other map covers. One north-up uniform scale (about 2.2 real metres per map metre,
// x east, +z south). The project here is BACWA's, as the facts file states it: the Bay Area Clean Water Agencies, five
// pilot projects aimed at reducing nutrient inputs to San Francisco Bay, bay-wide. Where the pilots run is NOT stated in
// our sources, so this map is a PROCEDURAL, REPRESENTATIVE wastewater treatment plant invented by the platform: only the
// water body (San Pablo Bay) is named; the plant, its basins, the shore, the hills, every road and site are procedural.
// It is not any real plant, and no real plant, property or facility is implied to be part of the project.
// Site names and crews are procedural training places. Pure data, no imports.
export const NP_BP_NUTRIENT_PILOT = {
  id: "bp-nutrient-pilot",
  name: "A Nutrient Pilot Plant on San Pablo Bay (procedural, representative)",
  region: "bay-program",
  representative: true,
  size: 4096,
  blurb: "A procedural wastewater treatment plant on San Pablo Bay's shore, invented by the platform to teach the work behind BACWA's pilot projects aimed at reducing nutrient inputs to San Francisco Bay: operator rounds, chemical feed, the aeration basins, lockout on process equipment, the lab, the outfall and the marsh beyond the levee. It is not any real plant.",
  start: "npp-operator-rounds",
  anchors: [
    {"xz":[0,-1265],"lonlat":[-122.27,38.055],"approximate":true,"name":"San Pablo Bay"},
    {"xz":[0,-354],"lonlat":[-122.27,38.037],"approximate":true,"name":"the shore (procedural)"},
    {"xz":[319,0],"lonlat":[-122.262,38.03],"approximate":true,"name":"the treatment plant (procedural)"},
    {"xz":[-399,1265],"lonlat":[-122.28,38.005],"approximate":true,"name":"the hills behind the shore (procedural)"},
    {"xz":[-1594,-506],"lonlat":[-122.31,38.04],"approximate":true,"name":"the shore to the west (procedural)"},
    {"xz":[1594,-304],"lonlat":[-122.23,38.036],"approximate":true,"name":"the shore to the east (procedural)"},
    {"xz":[598,-759],"lonlat":[-122.255,38.045],"approximate":true,"name":"the outfall point (procedural)"},
  ],
  hills: [
    {"id":"hills-behind-the-shore","name":"the hills behind the shore (procedural)","center":[-399,1265],"radius":480,"height":30},
    {"id":"eastern-ridge","name":"the ridge to the east (procedural)","center":[1550,1550],"radius":420,"height":24},
  ],
  water: [
    {"id":"san-pablo-bay","name":"San Pablo Bay","kind":"bay","poly":[[-2048,-2048],[2048,-2048],[2048,-280],[1594,-304],[900,-380],[300,-330],[0,-354],[-600,-420],[-1100,-470],[-1594,-506],[-2048,-540]]},
    {"id":"shore-marsh","name":"a tidal marsh (procedural)","kind":"wetland","poly":[[700,-372],[1594,-304],[2048,-280],[2048,-110],[1594,-130],[700,-190]]},
    {"id":"hillside-creek","name":"a creek down from the hills (procedural)","kind":"canal","width":18,"poly":[[-900,2048],[-820,1300],[-720,600],[-660,0],[-630,-445]]},
    {"id":"storage-basin","name":"the plant's storage basin (procedural)","kind":"lake","poly":[[700,300],[950,300],[950,450],[700,450]]},
  ],
  levees: [
    {"id":"shoreline-levee","name":"the shoreline levee (procedural)","height":3.2,"pts":[[-2048,-470],[-1100,-400],[-600,-360],[0,-290],[700,-130],[1400,-70],[2048,-40]]},
    {"id":"basin-berm","name":"the storage basin berm (procedural)","height":2.4,"pts":[[675,275],[975,275],[975,475],[675,475],[675,275]]},
  ],
  roads: [
    {"id":"shoreline-road","name":"the shoreline road (procedural)","kind":"avenue","pts":[[-2048,-250],[-1000,-190],[0,-110],[1000,40],[2048,140]]},
    {"id":"plant-access-road","name":"the plant access road (procedural)","kind":"street","pts":[[0,-110],[150,150],[300,500],[350,900]]},
    {"id":"freeway-behind-the-shore","name":"the freeway behind the shore (procedural)","kind":"interstate","pts":[[-2048,700],[-1000,560],[0,640],[1000,800],[2048,860]]},
    {"id":"neighbourhood-street","name":"a neighbourhood street (procedural)","kind":"street","pts":[[-1500,-200],[-1500,500],[-1450,1500]]},
    {"id":"east-access-road","name":"the east access road (procedural)","kind":"street","pts":[[1000,40],[1200,600],[1250,1000]]},
    {"id":"levee-trail","name":"the levee trail (procedural)","kind":"street","pts":[[-1800,-420],[-600,-330],[0,-260]]},
  ],
  districts: [
    {"id":"treatment-plant","name":"the treatment plant (procedural)","character":"industrial","poly":[[100,-60],[1100,30],[1100,720],[100,720]]},
    {"id":"light-industrial-strip","name":"the light industrial strip (procedural)","character":"industrial","poly":[[1100,30],[2048,120],[2048,720],[1100,720]]},
    {"id":"shore-marsh-district","name":"the tidal marsh (procedural)","character":"wetland","poly":[[700,-372],[2048,-280],[2048,-110],[700,-190]]},
    {"id":"shoreline-park","name":"the shoreline park (procedural)","character":"park","poly":[[-2048,-470],[0,-290],[0,-130],[-2048,-270]]},
    {"id":"neighbourhoods","name":"the neighbourhoods behind the shore (procedural)","character":"suburb","poly":[[-2048,-250],[100,-100],[100,760],[-2048,760]]},
    {"id":"hillside-open-space","name":"the hillside open space (procedural)","character":"park","poly":[[-2048,760],[2048,760],[2048,2048],[-2048,2048]]},
  ],
  sites: [
    {"id":"npp-operator-rounds","name":"Operator Rounds Station","kind":"plant","position":[500,100],"trades":["iuoe","afscme","uwua"],"programmes":["bay-program-projects","stationary-engineer"],"stations":["bk-wastewater-nutrient-chemical-feed","lift-station","chlorine-room","digester-gas"],"blurb":"BACWA's project under the EPA's San Francisco Bay Program is five pilot projects aimed at reducing nutrient inputs to San Francisco Bay; where they run is not stated. On this procedural plant an operator walks the rounds: pumps, chemical rooms and gas readings, logged every shift."},
    {"id":"npp-chemical-feed-building","name":"Chemical Feed Building","kind":"chemical","position":[820,100],"trades":["iuoe","afscme"],"programmes":["bay-program-projects","water-and-gas-utility-crews"],"stations":["bk-wastewater-nutrient-chemical-feed","chlorine-room","ut-water-treatment-chemical-delivery-unloading"],"blurb":"Where treatment chemicals are stored and dosed: the eyewash checked, the pump locked out before a line is opened, and the feed rate set to the operator's order."},
    {"id":"npp-aeration-basin-deck","name":"Aeration Basin Deck","kind":"aeration","position":[450,400],"trades":["iuoe","liuna"],"programmes":["confined-space","stationary-engineer"],"stations":["cs-ventilation-and-air-monitoring-plan","confined-rescue","br-cold-water-immersion-and-mob-recovery","motor-control-center"],"blurb":"The walkway over the aeration basins, where air feeds the microbes that take nutrients out of the water: guardrails, a throw ring, air tested before anyone goes below the deck."},
    {"id":"npp-pilot-process-skid","name":"Pilot Process Skid","kind":"pilot","position":[560,620],"trades":["ibew","iuoe"],"programmes":["electrical-first-period","bay-program-projects"],"stations":["motor-control-center","arc-flash-label-study","bk-wastewater-nutrient-chemical-feed","temporary-site-power"],"blurb":"A procedural pilot skid bolted beside the basins to try a nutrient-reduction process: its temporary power, its motor starters locked out before service, and the arc flash label read first."},
    {"id":"npp-digester-complex","name":"Digester Complex","kind":"digester","position":[1050,600],"trades":["iuoe","ua"],"programmes":["stationary-engineer","confined-space"],"stations":["digester-gas","tank-lining","cs-permit-entry-and-attendant-duties"],"blurb":"The digesters and their gas: the meter on before the hatch, the permit before any entry and the attendant who never goes in."},
    {"id":"npp-plant-lab","name":"Plant Laboratory","kind":"lab","position":[80,450],"trades":["afscme","ifpte"],"programmes":["bay-restoration-maritime-underwater","hazmat-environmental"],"stations":["br-water-quality-sonde-calibration-and-deploy","sample-kit-shipping","br-restoration-data-qa-and-public-reporting","ed-science-lab-chemical-storage-and-eyewash"],"blurb":"The lab where a pilot's results are measured: samples logged, instruments calibrated, chemicals stored by compatibility and the data checked before anyone reports it."},
    {"id":"npp-outfall-monitoring","name":"Outfall Monitoring Landing","kind":"monitoring","position":[600,-240],"trades":["ibu","afscme"],"programmes":["marine-ecology-and-restoration","bay-restoration-maritime-underwater"],"stations":["me-water-column-sampling-from-a-small-boat","br-water-quality-sonde-calibration-and-deploy","br-vhf-and-navigation-in-a-work-zone"],"blurb":"A landing below the levee where a small-boat crew heads out to sample the water off the plant's procedural outfall: float coats on, the radio checked, the weather read."},
    {"id":"npp-chemical-delivery-dock","name":"Chemical Delivery Dock","kind":"delivery","position":[1300,300],"trades":["teamsters"],"programmes":["water-and-gas-utility-crews","hazmat-environmental"],"stations":["ut-water-treatment-chemical-delivery-unloading","tdl-pretrip-inspection","hz-drum-staging-and-compatibility-segregation"],"blurb":"Where a tanker unloads treatment chemical: the right hose to the right fill, the driver and the operator both at the valve, and the spill kit open."},
    {"id":"npp-electrical-substation","name":"Plant Substation","kind":"substation","position":[200,650],"trades":["ibew"],"programmes":["electrical-first-period","energy-transition"],"stations":["substation-switching","motor-control-center","arc-flash-label-study"],"blurb":"The plant's power: switching orders read back, arc flash boundaries marked and the blowers' motor control centre kept locked."},
    {"id":"npp-maintenance-shop","name":"Pump and Blower Maintenance Shop","kind":"workshop","position":[1450,520],"trades":["iam","ua"],"programmes":["plumbers-and-pipefitters","stationary-engineer"],"stations":["fire-pump","lift-station","op-equipment-daily-walkaround-and-fluids","pl-steam-trap-and-condensate-line-repair"],"blurb":"The shop that keeps pumps, blowers and piping running, with every job started by locking out and trying the machine."},
    {"id":"npp-shoreline-marsh-crew","name":"Shoreline Marsh Crew","kind":"wetland","position":[1300,-230],"trades":["liuna"],"programmes":["bay-restoration-maritime-underwater","marine-ecology-and-restoration"],"stations":["living-shoreline","br-native-planting-and-erosion-mats","marsh-transect-survey"],"blurb":"The procedural marsh beyond the levee, planted and walked on a transect so the crew can see how the shore is doing."},
    {"id":"npp-solids-loadout","name":"Solids Load-Out","kind":"haul","position":[1750,350],"trades":["teamsters","iuoe-local3"],"programmes":["heavy-equipment-operators","warehouse-and-logistics-automation"],"stations":["soil-loadout","op-loader-truck-loading-and-blind-spots","tdl-pretrip-inspection"],"blurb":"Where treated solids are loaded out: the loader's blind spots kept clear, the load covered and the truck walked around before it leaves."},
  ],
  landmarks: [
    {"id":"san-pablo-bay-shore","name":"the San Pablo Bay shore","position":[0,-370],"kind":"shore"},
    {"id":"outfall-point","name":"the plant's outfall point (procedural)","position":[598,-759],"kind":"point"},
    {"id":"creek-mouth","name":"the creek's mouth (procedural)","position":[-630,-440],"kind":"canal"},
    {"id":"storage-basin-place","name":"the storage basin (procedural)","position":[825,375],"kind":"point"},
    {"id":"hills-place","name":"the hills behind the shore (procedural)","position":[-399,1265],"kind":"neighbourhood"},
    {"id":"marsh-place","name":"the tidal marsh (procedural)","position":[1600,-220],"kind":"point"},
    {"id":"not-a-real-plant-sign","name":"a sign: a procedural plant, not any real facility","position":[300,40],"kind":"point"},
  ],
  connectors: [
    {"id":"bp-npp-shoreline-west","kind":"road","name":"The shoreline road west along the bay","from":{"parish":"bp-nutrient-pilot","position":[-2000,-247]},"to":{"parish":"bay-north-shore-west","position":null,"lonlat":[-122.32,38.035]},"lonlat":[-122.32,38.035],"approximate":true},
    {"id":"bp-npp-shoreline-east","kind":"road","name":"The shoreline road east along the bay","from":{"parish":"bp-nutrient-pilot","position":[2000,135]},"to":{"parish":"bay-north-shore-east","position":null,"lonlat":[-122.22,38.027]},"lonlat":[-122.22,38.027],"approximate":true},
  ],
  fieldLessons: [
    {"id":"pj-npp-fl-too-much-of-a-good-thing","title":"Too Much of a Good Thing","site":"npp-aeration-basin-deck","k12":"k12-es-too-much-of-a-good-thing","station":"bk-wastewater-nutrient-chemical-feed","trade":"Plant operators","tradeLine":"A plant operator runs the basins so microbes take nutrients out of the water before it reaches the bay.","minutes":3,"steps":["Look over the rail at the bubbling aeration basin.","Nutrients feed plants, but too many in the bay can feed algae that use up the water's oxygen.","Operators feed air to microbes that eat the nutrients before the water leaves the plant."],"check":{"q":"Why do operators work to take nutrients out of the water?","options":["Too many nutrients can feed algae that use up oxygen in the bay","Nutrients make the water too cold","Nutrients are worth selling"],"answer":0,"why":"Too many nutrients can feed algae blooms that use up oxygen fish need."}},
    {"id":"pj-npp-fl-a-fair-test","title":"A Pilot Is a Fair Test","site":"npp-pilot-process-skid","k12":"k12-a-controlled-experiment","station":"motor-control-center","trade":"Plant electricians","tradeLine":"An electrician locks out the pilot skid's motor starter before anyone works on it, then tries the start button to prove it is dead.","minutes":3,"steps":["Find the small pilot skid beside the big basins.","A pilot tries a new idea on a small stream of water and keeps everything else the same.","Before anyone works on it, the power is locked out and tested."],"check":{"q":"What makes a pilot test fair?","options":["Changing one thing and keeping everything else the same","Changing everything at once","Running it only once"],"answer":0,"why":"A fair test changes one thing at a time so the result can be traced to it."}},
    {"id":"pj-npp-fl-where-the-water-goes","title":"Where the Water Goes Next","site":"npp-outfall-monitoring","landmark":"outfall-point","k12":"k12-water-cycle-and-filtration","station":"me-water-column-sampling-from-a-small-boat","trade":"Small-boat crews","tradeLine":"A small-boat crew samples the bay off the outfall so the plant knows how clean its water is when it arrives.","minutes":3,"steps":["Look out from the landing toward the bay.","Treated water leaves the plant and mixes into the bay.","A crew in float coats samples the water from a small boat and brings it to the lab."],"check":{"q":"Why does a crew sample the bay near the outfall?","options":["To check the treated water once it reaches the bay","To catch fish for lunch","To measure the tide's height"],"answer":0,"why":"Sampling off the outfall shows how the plant's water behaves once it reaches the bay."}},
  ],
  gated: [
    {"id":"bp-npp-gated-first-rounds","kind":"side-quest","title":"Your First Operator Rounds","world":"parishes","parish":"bp-nutrient-pilot","site":"npp-operator-rounds","siteName":"Operator Rounds Station","summary":"Walk the plant's rounds with an operator and log every reading.","gate":{"stations":["bk-wastewater-nutrient-chemical-feed","chlorine-room"],"note":"Finish the nutrient chemical feed and chlorine room stations first"}},
    {"id":"bp-npp-gated-skid-lockout","kind":"side-quest","title":"Lock Out the Pilot Skid","world":"parishes","parish":"bp-nutrient-pilot","site":"npp-pilot-process-skid","siteName":"Pilot Process Skid","summary":"Lock out the pilot skid's power and prove it dead before service.","gate":{"stations":["motor-control-center","arc-flash-label-study"],"note":"Finish the motor control centre and arc flash label stations first"}},
  ],
};
