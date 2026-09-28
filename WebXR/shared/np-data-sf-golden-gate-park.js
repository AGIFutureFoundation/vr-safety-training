// Golden Gate Park, the Richmond & the Sunset — a San Francisco district on the parish schema (console GOLDEN-A,
// docs/consoles/GOLDEN-A.md, docs/parishes.md). A stylised 4096 m map, not a
// survey: real places appear only by their public names as places; every
// coordinate is approximate (three decimals, `approximate: true`) and exists
// only to place the map. One north-up uniform scale (about 2.2 real metres per
// map metre, x east, +z south); the bay and ocean shores are one shared
// coastline clipped to this field, so the San Francisco districts agree on the
// shore. `hills` are gentle procedural mounds carrying public names only; a
// hill's `height` is a map number, not a measurement. Pure data, no imports.
export const NP_SF_GOLDEN_GATE_PARK = {
  id: "sf-golden-gate-park",
  name: "Golden Gate Park, the Richmond & the Sunset",
  region: "san-francisco",
  size: 4096,
  blurb: "The long park running to the ocean, with the Richmond to the north and the Sunset to the south: park crews among the trees and meadows, Stow Lake and Spreckels Lake, the windmills at the western edge, Ocean Beach and its lifeguards, a hospital on Parnassus and a university on Lone Mountain.",
  start: "golden-gate-park-crew-yard",
  anchors: [
    {"xz":[-1240,-352],"lonlat":[-122.509,37.77],"approximate":true,"name":"the Dutch Windmill"},
    {"xz":[-1200,0],"lonlat":[-122.508,37.763],"approximate":true,"name":"the Murphy Windmill"},
    {"xz":[720,-452],"lonlat":[-122.46,37.772],"approximate":true,"name":"the Conservatory of Flowers"},
    {"xz":[120,-302],"lonlat":[-122.475,37.769],"approximate":true,"name":"Stow Lake"},
    {"xz":[1000,402],"lonlat":[-122.453,37.755],"approximate":true,"name":"Sutro Tower"},
    {"xz":[-1080,-1206],"lonlat":[-122.505,37.787],"approximate":true,"name":"Lands End"},
    {"xz":[-640,1809],"lonlat":[-122.494,37.727],"approximate":true,"name":"Lake Merced"},
    {"xz":[-320,402],"lonlat":[-122.486,37.755],"approximate":true,"name":"Sunset Reservoir"},
  ],
  hills: [
    {"id":"twin-peaks","name":"Twin Peaks","center":[1220,528],"radius":523,"height":58},
  ],
  water: [
    {"id":"pacific-ocean","name":"the Pacific Ocean","kind":"ocean","poly":[[-72,-2048],[-2048,-2048],[-2048,2048],[-984,2048],[-1000,1910],[-1080,1407],[-1160,905],[-1220,402],[-1260,-101],[-1300,-603],[-1360,-905],[-1120,-1257],[-880,-1307],[-560,-1307],[-360,-1407],[-240,-1709],[-80,-2010]]},
    {"id":"stow-lake","name":"Stow Lake","kind":"lake","poly":[[183,-317],[176,-333],[155,-347],[125,-354],[91,-354],[61,-347],[40,-333],[33,-317],[40,-300],[61,-286],[91,-279],[125,-279],[155,-286],[176,-300]]},
    {"id":"spreckels-lake","name":"Spreckels Lake","kind":"lake","poly":[[-589,-367],[-597,-379],[-617,-389],[-644,-392],[-671,-389],[-691,-379],[-699,-367],[-691,-354],[-671,-345],[-644,-342],[-617,-345],[-597,-354]]},
    {"id":"lake-merced","name":"Lake Merced","kind":"lake","poly":[[-780,1558],[-520,1533],[-340,1709],[-355,2048],[-805,2048],[-820,2010]]},
  ],
  levees: [
    {"id":"ocean-beach-seawall","name":"the Ocean Beach seawall","height":3,"pts":[[-1272,-578],[-1232,-101],[-1192,402]]},
    {"id":"ocean-beach-dunes","name":"the Ocean Beach dunes","height":2.5,"pts":[[-1192,427],[-1132,905],[-1052,1407],[-972,1860]]},
  ],
  roads: [
    {"id":"great-highway","name":"the Great Highway","kind":"avenue","pts":[[-1220,-653],[-1180,-101],[-1140,402],[-1088,905],[-1008,1407],[-928,1910]]},
    {"id":"fulton-street","name":"Fulton Street","kind":"avenue","pts":[[-1180,-442],[-80,-503],[720,-578],[1240,-643],[1920,-729]]},
    {"id":"lincoln-way","name":"Lincoln Way","kind":"avenue","pts":[[-1152,-50],[-80,-111],[720,-161],[1000,-151]]},
    {"id":"kennedy-drive","name":"John F. Kennedy Drive","kind":"street","pts":[[-1152,-281],[-680,-292],[-280,-352],[80,-432],[720,-462],[960,-432]]},
    {"id":"park-presidio-boulevard","name":"Park Presidio Boulevard","kind":"avenue","pts":[[240,-1307],[232,-854],[232,-513]]},
    {"id":"sunset-boulevard","name":"Sunset Boulevard","kind":"avenue","pts":[[-660,-101],[-640,402],[-620,905],[-600,1357]]},
    {"id":"judah-street","name":"Judah Street","kind":"street","pts":[[-1112,126],[-80,50],[520,25],[720,10]]},
    {"id":"sloat-boulevard","name":"Sloat Boulevard","kind":"street","pts":[[-980,1397],[-280,1427],[120,1448]]},
    {"id":"geary-boulevard","name":"Geary Boulevard","kind":"avenue","pts":[[2048,-1092],[1720,-1045],[1280,-955],[520,-880],[-280,-854],[-1060,-854]]},
    {"id":"oak-street","name":"Oak Street","kind":"street","pts":[[2048,-585],[1840,-553],[1240,-462],[880,-412]]},
    {"id":"california-street","name":"California Street","kind":"street","pts":[[2048,-1351],[1920,-1332],[920,-1181]]},
  ],
  districts: [
    {"id":"golden-gate-park","name":"Golden Gate Park","character":"park","poly":[[-1180,-412],[1000,-543],[1000,-171],[-1152,-75]]},
    {"id":"the-panhandle","name":"the Panhandle","character":"park","poly":[[1000,-578],[1520,-663],[1520,-553],[1000,-483]]},
    {"id":"inner-richmond","name":"the Inner Richmond","character":"suburb","poly":[[-80,-1257],[1280,-1166],[1280,-694],[-80,-533]]},
    {"id":"outer-richmond","name":"the Outer Richmond","character":"suburb","poly":[[-1120,-1055],[-80,-1206],[-80,-533],[-1160,-462]]},
    {"id":"the-sunset","name":"the Sunset","character":"suburb","poly":[[-1080,-10],[720,-101],[640,1332],[-960,1332]]},
    {"id":"lands-end-lincoln-park","name":"Lands End and Lincoln Park","character":"park","poly":[[-1220,-1166],[-680,-1267],[-600,-1081],[-1120,-1066]]},
    {"id":"lone-mountain","name":"Lone Mountain","character":"campus","poly":[[880,-905],[1280,-905],[1280,-663],[880,-628]]},
    {"id":"parnassus-heights","name":"Parnassus Heights","character":"campus","poly":[[560,-101],[1040,-111],[1040,151],[560,151]]},
    {"id":"lake-merced-shore","name":"the Lake Merced shore","character":"park","poly":[[-920,1432],[-240,1458],[-240,1960],[-880,1960]]},
  ],
  sites: [
    {"id":"golden-gate-park-crew-yard","name":"Golden Gate Park Grounds Crew Yard","kind":"park","position":[560,-327],"trades":["afscme","liuna","seiu"],"programmes":["grounds-and-landscaping"],"stations":["gk-ride-on-mower-pre-start-and-slope-work","gk-tree-work-pole-saw-and-drop-zone","gk-chainsaw-start-and-limbing-on-the-ground","gk-irrigation-controller-valve-box-and-backflow-check","gk-string-trimmer-and-blower-ppe-and-bystander-zone"],"blurb":"The park crews' yard among the eucalyptus and cypress: mowers on the meadows, the tree crew's drop zone, and the irrigation valves."},
    {"id":"park-nursery","name":"Golden Gate Park Nursery","kind":"nursery","position":[-400,-211],"trades":["afscme","liuna"],"programmes":["grounds-and-landscaping"],"stations":["gk-greenhouse-nursery-chemical-storage-and-eyewash","gk-pesticide-and-fertilizer-application-per-the-label","gk-hardscape-paver-base-and-compaction","gk-storm-cleanup-chipper-and-traffic-control"],"blurb":"The greenhouses and potting yard where the park's plants are raised: the chemical store and eyewash, the label, and the chipper after a storm."},
    {"id":"ocean-beach-lifeguard-station","name":"Ocean Beach Lifeguard Station","kind":"lifeguard","position":[-1088,292],"trades":["iaff","afscme"],"programmes":["first-responders","yacht-and-charter-crew","bay-restoration-maritime-underwater"],"stations":["br-cold-water-immersion-and-mob-recovery","yc-man-overboard-recovery-drill","cardiac-arrest-pit-crew","ambulance-scene-safety"],"blurb":"The lifeguard station on Ocean Beach: the rescue board and the cold-water drill, and the team that meets the ambulance at the sand."},
    {"id":"parnassus-hospital-campus","name":"Parnassus Hospital Campus","kind":"hospital","position":[800,10],"trades":["nnu","seiu","afscme","ua","ibew"],"programmes":["healthcare-support","first-responders"],"stations":["hc-patient-transport-and-safe-handling","hc-code-response-support-and-crash-cart-check","hc-dietary-tray-line-and-allergy-flags","hc-hazardous-drug-spill-kit-response","triage-point"],"blurb":"A teaching hospital on the slope of Parnassus Heights: the code team's crash cart, the tray line and its allergy flags, and the spill kit."},
    {"id":"lone-mountain-university-campus","name":"University of San Francisco Campus","kind":"campus","position":[1080,-744],"trades":["aaup","afscme","seiu","ibew"],"programmes":["stationary-engineer","education-support-staff","property-management"],"stations":["chiller-plant","boiler-room","ed-science-lab-chemical-storage-and-eyewash","pm-fire-alarm-panel-room","pm-electrical-room"],"blurb":"The university on Lone Mountain: stationary engineers in the chiller plant and boiler room, the science labs, and the fire alarm panel."},
    {"id":"ocean-beach-streetcar-terminal","name":"Ocean Beach Streetcar Terminal","kind":"streetcar","position":[-1040,90],"trades":["atu","twu","ibew"],"programmes":["transit-ramp","railroad-crafts"],"stations":["track-access","signal-cabinet","ra-hand-brake-and-securement-on-a-grade","tr-wheelchair-lift-and-securement-on-a-bus"],"blurb":"The end of the line by the beach: the loop where the streetcars turn, the track crew, the signal cabinet, and the ramp for every rider."},
    {"id":"sunset-reservoir-pump-house","name":"Sunset Reservoir Pump House","kind":"pump","position":[-352,392],"trades":["uwua","iuoe","ibew","afscme"],"programmes":["water-and-gas-utility-crews","confined-space"],"stations":["valve-vault","lift-station","ut-water-treatment-chemical-delivery-unloading","cs-permit-entry-and-attendant-duties","motor-control-center"],"blurb":"The pump house beside the Sunset Reservoir: the valve vaults, the chemical delivery, and the crew on a permit entry."},
    {"id":"sunset-school-campus","name":"Sunset District School Campus","kind":"school","position":[-280,955],"trades":["aft","seiu","afscme"],"programmes":["education-support-staff"],"stations":["ed-crossing-guard-intersection-control","ed-bus-pretrip-and-loading-zone","ed-paraeducator-safe-lift-and-transfer","ed-boiler-room-filter-change-lockout"],"blurb":"A school in the Sunset's avenues: the crossing guard, the bus zone, paraeducators, and the custodian's boiler room."},
    {"id":"richmond-fire-station","name":"Richmond Fire Station","kind":"fire","position":[-200,-694],"trades":["iaff","naemt"],"programmes":["first-responders","fall-protection"],"stations":["structure-fire-sizeup","firefighter-rehab-sector","ambulance-scene-safety","aerial-ladder"],"blurb":"A firehouse in the Richmond: the size-up, the aerial ladder, the rehab sector after a long call, and the ambulance crew."},
  ],
  landmarks: [
    {"id":"dutch-windmill","name":"the Dutch Windmill","position":[-1152,-377],"kind":"windmill"},
    {"id":"murphy-windmill","name":"the Murphy Windmill","position":[-1120,0],"kind":"windmill"},
    {"id":"stow-lake-boathouse","name":"the Stow Lake boathouse","position":[140,-412],"kind":"boathouse"},
    {"id":"conservatory-of-flowers","name":"the Conservatory of Flowers","position":[712,-493],"kind":"place"},
    {"id":"japanese-tea-garden","name":"the Japanese Tea Garden","position":[300,-362],"kind":"garden"},
    {"id":"ocean-beach","name":"Ocean Beach","position":[-1160,653],"kind":"shore"},
    {"id":"sutro-heights","name":"Sutro Heights","position":[-1272,-779],"kind":"park"},
    {"id":"lands-end","name":"Lands End","position":[-1000,-1131],"kind":"park"},
    {"id":"the-panhandle","name":"the Panhandle","position":[1320,-518],"kind":"park"},
    {"id":"kezar-stadium","name":"Kezar Stadium","position":[900,-211],"kind":"stadium"},
  ],
  connectors: [
    {"id":"sf-park-presidio","kind":"road","name":"Park Presidio Boulevard north to the Presidio","from":{"parish":"sf-golden-gate-park","position":[240,-955]},"to":{"parish":"sf-marina","position":null,"lonlat":[-122.472,37.782]},"lonlat":[-122.472,37.782],"approximate":true},
    {"id":"sf-gp-geary-boulevard","kind":"road","name":"Geary Boulevard east downtown","from":{"parish":"sf-golden-gate-park","position":[1280,-955]},"to":{"parish":"sf-downtown","position":[-1679,402],"lonlat":[-122.446,37.782]},"lonlat":[-122.446,37.782],"approximate":true},
    {"id":"sf-gp-oak-street","kind":"road","name":"Oak Street east from the Panhandle","from":{"parish":"sf-golden-gate-park","position":[1240,-452]},"to":{"parish":"sf-mission","position":[-1560,-452],"lonlat":[-122.447,37.772]},"lonlat":[-122.447,37.772],"approximate":true},
  ],
  fieldLessons: [
    {"id":"sf-golden-gate-park-fl-windmill-energy","title":"What a Windmill Does with the Wind","site":"park-nursery","landmark":"dutch-windmill","k12":"k12-energy-transfer-at-the-wind-farm","trade":"Park crews","tradeLine":"A park crew keeps people clear of moving sails and locks them still before anyone climbs to work on them.","minutes":3,"steps":["Look up at the windmill's sails and feel which way the wind blows.","The wind pushes the sails round, and the turning can pump water or grind grain.","Before a crew works on the sails, they lock them so nothing turns."],"check":{"q":"Where does a windmill's turning come from?","options":["The wind pushing on the sails","A motor hidden in the ground","The sea below it"],"answer":0,"why":"Moving air pushes the sails, and that movement is passed along to do work."}},
    {"id":"sf-golden-gate-park-fl-lifeguard-call","title":"Calling for Help at the Beach","site":"ocean-beach-lifeguard-station","landmark":"ocean-beach","k12":"k12-first-aid-awareness-call-for-help","trade":"Ocean lifeguards","tradeLine":"A lifeguard keeps watch from the station and calls the team in when someone needs help in the water.","minutes":2,"steps":["Find the lifeguard station and the flag that shows where to swim.","If someone needs help, tell a lifeguard or an adult straight away.","The lifeguards and the ambulance crew work as one team."],"check":{"q":"You see someone who needs help in the water. What do you do first?","options":["Tell a lifeguard or an adult straight away","Swim out alone","Wait and watch"],"answer":0,"why":"Trained lifeguards go in; your job is to get help fast."}},
    {"id":"sf-golden-gate-park-fl-lake-water-cycle","title":"Where the Lake's Water Comes From","site":"golden-gate-park-crew-yard","landmark":"stow-lake-boathouse","k12":"k12-water-cycle-and-filtration","trade":"Park irrigation crews","tradeLine":"An irrigation crew sets the sprinklers to water the meadows without wasting a drop into the paths.","minutes":3,"steps":["Stand by the lake and look at the water, the trees and the sky.","Water rises from the lake as vapour, forms clouds, and falls again as rain or fog drip.","The crew waters the meadows only as much as the plants need."],"check":{"q":"What happens to lake water on a warm day?","options":["Some of it rises as vapour","It turns into sand","Nothing ever changes"],"answer":0,"why":"Warmth turns some water to vapour, which later falls as rain or drips from fog."}},
  ],
  gated: [
    {"id":"sf-golden-gate-park-gated-storm-cleanup","kind":"side-quest","title":"Storm Cleanup on the Meadows","world":"parishes","parish":"sf-golden-gate-park","site":"golden-gate-park-crew-yard","siteName":"Golden Gate Park Grounds Crew Yard","summary":"Clear fallen limbs with the park crew after a windy night.","gate":{"stations":["gk-chainsaw-start-and-limbing-on-the-ground","gk-tree-work-pole-saw-and-drop-zone"],"note":"Walk the chainsaw and tree work stations before the storm cleanup"}},
    {"id":"sf-golden-gate-park-gated-beach-rescue-drill","kind":"side-quest","title":"The Morning Rescue Drill","world":"parishes","parish":"sf-golden-gate-park","site":"ocean-beach-lifeguard-station","siteName":"Ocean Beach Lifeguard Station","summary":"Practise a board rescue with the lifeguards at Ocean Beach.","gate":{"stations":["br-cold-water-immersion-and-mob-recovery"],"note":"Finish the cold water recovery station before the rescue drill"}},
  ],
};
