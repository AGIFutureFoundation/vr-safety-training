// Mission & SoMa — a San Francisco district on the parish schema (console GOLDEN-A,
// docs/consoles/GOLDEN-A.md, docs/parishes.md). A stylised 4096 m map, not a
// survey: real places appear only by their public names as places; every
// coordinate is approximate (three decimals, `approximate: true`) and exists
// only to place the map. One north-up uniform scale (about 2.2 real metres per
// map metre, x east, +z south); the bay and ocean shores are one shared
// coastline clipped to this field, so the San Francisco districts agree on the
// shore. `hills` are gentle procedural mounds carrying public names only; a
// hill's `height` is a map number, not a measurement. Pure data, no imports.
export const NP_SF_MISSION = {
  id: "sf-mission",
  name: "Mission & SoMa",
  region: "san-francisco",
  size: 4096,
  blurb: "South of Market and the Mission: the rail yard at King Street, the new blocks of Mission Bay going up beside Mission Creek, the stadium district at China Basin, the Mission's schools and murals, Potrero Hill and Bernal Heights, and the shipyard on the Dogpatch waterfront.",
  start: "mission-bay-construction-site",
  anchors: [
    {"xz":[-760,-50],"lonlat":[-122.427,37.764],"approximate":true,"name":"Mission Dolores"},
    {"xz":[-800,151],"lonlat":[-122.428,37.76],"approximate":true,"name":"Dolores Park"},
    {"xz":[240,-1106],"lonlat":[-122.402,37.785],"approximate":true,"name":"Yerba Buena Gardens"},
    {"xz":[760,-754],"lonlat":[-122.389,37.778],"approximate":true,"name":"the ballpark at China Basin"},
    {"xz":[-240,1005],"lonlat":[-122.414,37.743],"approximate":true,"name":"Bernal Heights Park"},
    {"xz":[800,251],"lonlat":[-122.388,37.758],"approximate":true,"name":"Dogpatch"},
    {"xz":[-400,-804],"lonlat":[-122.418,37.779],"approximate":true,"name":"Civic Center"},
    {"xz":[-1000,1458],"lonlat":[-122.433,37.734],"approximate":true,"name":"Glen Park"},
  ],
  hills: [
    {"id":"potrero-hill","name":"Potrero Hill","center":[300,201],"radius":273,"height":20},
    {"id":"bernal-heights","name":"Bernal Heights","center":[-280,1005],"radius":295,"height":32},
    {"id":"twin-peaks","name":"Twin Peaks","center":[-1580,528],"radius":523,"height":58},
  ],
  water: [
    {"id":"san-francisco-bay","name":"San Francisco Bay","kind":"bay","poly":[[347,-2048],[360,-2036],[520,-1860],[620,-1684],[720,-1533],[900,-1483],[900,-1181],[800,-1030],[820,-804],[860,-679],[880,-402],[900,-101],[1040,126],[1040,452],[960,704],[980,1005],[1200,1257],[1520,1508],[1920,1759],[1690,2048],[2048,2048],[2048,-2048]]},
    {"id":"mission-creek","name":"Mission Creek","kind":"canal","width":26,"poly":[[880,-694],[660,-528],[480,-402],[380,-327]]},
    {"id":"islais-creek","name":"Islais Creek","kind":"canal","width":24,"poly":[[1020,1005],[720,1030],[440,1055]]},
  ],
  levees: [
    {"id":"rincon-seawall","name":"the Rincon and South Beach seawall","height":2.5,"pts":[[876,-1432],[876,-1181],[776,-1030],[796,-804]]},
    {"id":"mission-bay-seawall","name":"the Mission Bay seawall","height":2.5,"pts":[[836,-628],[856,-402],[876,-101],[1016,126]]},
    {"id":"dogpatch-bulkhead","name":"the Dogpatch waterfront bulkhead","height":2.2,"pts":[[1016,176],[1016,452],[936,704],[956,930]]},
  ],
  roads: [
    {"id":"market-street","name":"Market Street","kind":"avenue","pts":[[520,-1598],[320,-1382],[80,-1156],[-180,-880],[-440,-603],[-760,-327],[-1080,-50],[-1360,201]]},
    {"id":"the-embarcadero","name":"the Embarcadero","kind":"avenue","pts":[[198,-2048],[280,-1960],[420,-1809],[528,-1633],[620,-1483],[700,-1332],[700,-1156],[720,-1030],[740,-829],[700,-729]]},
    {"id":"mission-street","name":"Mission Street","kind":"avenue","pts":[[520,-1407],[-80,-804],[-440,-352],[-460,151],[-480,653],[-580,1156],[-720,1659]]},
    {"id":"third-street","name":"Third Street","kind":"avenue","pts":[[280,-1156],[620,-804],[752,-452],[768,151],[760,402],[720,905],[660,1407]]},
    {"id":"bayshore-freeway","name":"the Bayshore Freeway","kind":"interstate","pts":[[-400,-352],[40,-251],[160,402],[168,905],[160,1407],[120,1910]]},
    {"id":"cesar-chavez-street","name":"Cesar Chavez Street","kind":"avenue","pts":[[-760,754],[-280,729],[0,704],[680,653]]},
    {"id":"king-street","name":"King Street","kind":"street","pts":[[700,-754],[580,-663],[420,-543],[280,-442]]},
    {"id":"valencia-street","name":"Valencia Street","kind":"street","pts":[[-568,-452],[-528,151],[-500,754]]},
    {"id":"oak-street","name":"Oak Street","kind":"street","pts":[[-480,-628],[-960,-553],[-1560,-462],[-1920,-412]]},
    {"id":"van-ness-avenue","name":"Van Ness Avenue","kind":"avenue","pts":[[-575,-2048],[-540,-1608],[-480,-1106],[-448,-603],[-380,-101],[-340,402]]},
    {"id":"bay-bridge-approach","name":"the Bay Bridge approach","kind":"interstate","pts":[[120,-503],[360,-804],[560,-1106],[740,-1282]]},
    {"id":"bay-bridge","name":"the Bay Bridge","kind":"bridge","pts":[[740,-1282],[1200,-1759],[1478,-2048]]},
    {"id":"geary-boulevard","name":"Geary Boulevard","kind":"avenue","pts":[[140,-1231],[-480,-1131],[-1080,-1045],[-1520,-955],[-2048,-903]]},
  ],
  districts: [
    {"id":"south-of-market","name":"South of Market","character":"industrial","poly":[[-280,-854],[160,-1257],[600,-854],[360,-503],[-280,-352]]},
    {"id":"mission-bay","name":"Mission Bay","character":"campus","poly":[[360,-427],[800,-653],[820,-50],[360,-50]]},
    {"id":"mission-district","name":"the Mission","character":"quarter","poly":[[-760,-302],[-80,-302],[0,653],[-760,653]]},
    {"id":"potrero-hill","name":"Potrero Hill","character":"garden","poly":[[0,-151],[640,-151],[640,553],[0,553]]},
    {"id":"dogpatch-waterfront","name":"the Dogpatch waterfront","character":"port","poly":[[700,0],[952,0],[940,854],[700,854]]},
    {"id":"bernal-heights","name":"Bernal Heights","character":"suburb","poly":[[-720,704],[80,704],[80,1357],[-720,1357]]},
    {"id":"noe-and-castro","name":"Noe Valley and the Castro","character":"suburb","poly":[[-1360,-101],[-800,-251],[-800,955],[-1280,955]]},
    {"id":"islais-industrial","name":"the Islais Creek industrial flats","character":"industrial","poly":[[200,905],[880,905],[880,1659],[200,1659]]},
    {"id":"downtown-edge","name":"the edge of downtown","character":"downtown","poly":[[40,-1458],[480,-1458],[600,-1206],[160,-1206]]},
  ],
  sites: [
    {"id":"king-street-rail-yard","name":"King Street Rail Yard","kind":"rail","position":[500,-663],"trades":["smart-td","blet","bmwed","tcu","brs"],"programmes":["railroad-crafts"],"stations":["ra-blue-flag-protection-in-the-yard","rcl-switching","ra-switch-inspection-and-lubrication","ra-air-brake-test-and-train-inspection","ra-locomotive-cab-startup-and-alerter"],"blurb":"The commuter rail yard at King Street: blue flags on the tracks under repair, the switch crew, and the air brake test before a train leaves."},
    {"id":"mission-bay-construction-site","name":"Mission Bay Construction Site","kind":"construction","position":[648,-292],"trades":["carpenters","ironworkers","liuna","opcmia","iuoe"],"programmes":["builders-trades","fall-protection","heavy-equipment-operators"],"stations":["concrete-pour","formwork-shoring","bt-rebar-tying-and-impalement-protection","scaffold-erection","op-crawler-crane-assembly-and-load-chart","trench-box"],"blurb":"A new block going up in Mission Bay: the crane on its load chart, rebar and forms for the next pour, and the scaffold climbing the frame."},
    {"id":"mission-school-campus","name":"Mission District School Campus","kind":"school","position":[-632,90],"trades":["aft","seiu","afscme"],"programmes":["education-support-staff"],"stations":["ed-custodial-chemical-dilution-and-floor-machine","ed-playground-equipment-inspection","ed-crossing-guard-intersection-control","ed-kitchen-receiving-and-warewash-sanitizing","ed-bus-pretrip-and-loading-zone"],"blurb":"A school campus by Dolores Park: custodians, the crossing guard at the corner, the kitchen crew and the bus loading zone."},
    {"id":"china-basin-stadium-district","name":"China Basin Stadium District","kind":"stadium","position":[632,-864],"trades":["iatse","seiu","unite-here","ibew","spfpa"],"programmes":["live-events","rigging-lifting"],"stations":["arena-rigging","le-crowd-barricade-and-show-stop-call","stage-power","chain-hoist","broadcast-truck"],"blurb":"The ballpark and the arena by the water: riggers overhead, stagehands on power, the barricade crew and the broadcast trucks."},
    {"id":"soma-maker-workshop","name":"South of Market Maker Workshop","kind":"workshop","position":[112,-593],"trades":["iam","smart","ibew","carpenters"],"programmes":["aerospace-defense-and-robotics","sewing-garment-trades","situational-awareness"],"stations":["cnc-cell","welding","sm-plasma-table-and-fume","sm-shop-layout-and-shear","ad-cobot-risk-assessment-and-speed-separation","serger-overlock"],"blurb":"A shared shop in a South of Market warehouse: the CNC cell, the welding bay, the plasma table, a cobot bench and the sewing machines."},
    {"id":"potrero-hospital-campus","name":"Potrero Avenue Hospital Campus","kind":"hospital","position":[-8,372],"trades":["nnu","seiu","afscme","ua"],"programmes":["healthcare-support","first-responders"],"stations":["hc-patient-transport-and-safe-handling","hc-sterile-processing-decontamination-and-assembly","hc-linen-and-regulated-waste-handling","ambulance-scene-safety","triage-point"],"blurb":"The public hospital on Potrero Avenue: the ambulance bay and triage, sterile processing, and the crews moving patients and linen."},
    {"id":"potrero-bus-yard","name":"Potrero Bus Yard","kind":"transit","position":[-128,-40],"trades":["atu","twu","iam"],"programmes":["transit-ramp","energy-transition"],"stations":["bus-depot-lift","bus-yard-fuelling-and-brake-check","tr-wheelchair-lift-and-securement-on-a-bus","et-ev-fleet-depot-charging-and-arc-flash"],"blurb":"A city bus yard under Potrero Hill: the lifts, the brake check, the ramp and securement, and the chargers for the electric fleet."},
    {"id":"dogpatch-shipyard","name":"Dogpatch Waterfront Shipyard","kind":"shipyard","position":[888,251],"trades":["ironworkers","iam","ibb","usw"],"programmes":["insulators-and-boilermakers","port-operations"],"stations":["welding","ib-pressure-vessel-confined-entry-and-hot-work","dock-crane","pt-dock-fender-and-bollard-inspection"],"blurb":"The old shipyard on the Dogpatch waterfront: the dry-dock crane, boilermakers at hot work, and the fender and bollard inspection."},
    {"id":"islais-creek-pump-station","name":"Islais Creek Pump Station","kind":"pump","position":[580,905],"trades":["iuoe","ibew","uwua","afscme"],"programmes":["water-and-gas-utility-crews","confined-space"],"stations":["lift-station","digester-gas","cs-permit-entry-and-attendant-duties","valve-vault","stormwater-outfall"],"blurb":"The pump and treatment station by Islais Creek: the lift pumps, the digester gas watch, and the permit-entry crew at the valve vaults."},
  ],
  landmarks: [
    {"id":"mission-dolores","name":"Mission Dolores","position":[-760,-65],"kind":"place"},
    {"id":"dolores-park","name":"Dolores Park","position":[-780,171],"kind":"park"},
    {"id":"china-basin-ballpark","name":"the ballpark at China Basin","position":[740,-784],"kind":"stadium"},
    {"id":"mission-creek-bank","name":"the Mission Creek bank","position":[560,-538],"kind":"canal"},
    {"id":"bernal-heights-park","name":"Bernal Heights Park","position":[-260,995],"kind":"park"},
    {"id":"yerba-buena-gardens","name":"Yerba Buena Gardens","position":[240,-1106],"kind":"park"},
    {"id":"balmy-alley","name":"Balmy Alley","position":[-168,543],"kind":"alley"},
    {"id":"dogpatch","name":"Dogpatch","position":[792,101],"kind":"neighbourhood"},
    {"id":"islais-creek-bank","name":"the Islais Creek bank","position":[800,955],"kind":"canal"},
  ],
  connectors: [
    {"id":"sf-third-street-south","kind":"road","name":"Third Street south to Bayview","from":{"parish":"sf-mission","position":[760,402]},"to":{"parish":"sf-bayview","position":null,"lonlat":[-122.389,37.755]},"lonlat":[-122.389,37.755],"approximate":true},
    {"id":"sf-bayshore-south","kind":"road","name":"The Bayshore Freeway south to Bayview","from":{"parish":"sf-mission","position":[160,1407]},"to":{"parish":"sf-bayview","position":null,"lonlat":[-122.404,37.735]},"lonlat":[-122.404,37.735],"approximate":true},
    {"id":"sf-mi-market-street","kind":"road","name":"Market Street north-east downtown","from":{"parish":"sf-mission","position":[-440,-603]},"to":{"parish":"sf-downtown","position":[-600,754],"lonlat":[-122.419,37.775]},"lonlat":[-122.419,37.775],"approximate":true},
    {"id":"sf-mi-king-street","kind":"road","name":"King Street to the Embarcadero","from":{"parish":"sf-mission","position":[680,-704]},"to":{"parish":"sf-downtown","position":[520,653],"lonlat":[-122.391,37.777]},"lonlat":[-122.391,37.777],"approximate":true},
    {"id":"sf-mi-oak-street","kind":"road","name":"Oak Street west along the Panhandle","from":{"parish":"sf-mission","position":[-1560,-452]},"to":{"parish":"sf-golden-gate-park","position":[1240,-452],"lonlat":[-122.447,37.772]},"lonlat":[-122.447,37.772],"approximate":true},
  ],
  fieldLessons: [
    {"id":"sf-mission-fl-blue-flag","title":"What a Blue Flag Means","site":"king-street-rail-yard","k12":"k12-reading-instructions-and-safety-labels","trade":"Rail carmen","tradeLine":"A carman hangs a blue flag before working on a train, and only the person who hung it may take it down.","minutes":3,"steps":["Look along the track for a blue flag or a blue light by the rails.","It means people are working on or under that train right now.","Nobody moves the train until the worker who hung the flag removes it."],"check":{"q":"Who may take down a blue flag?","options":["Only the worker who hung it","Any driver in a hurry","Whoever sees it first"],"answer":0,"why":"The flag protects the person under the train, so only that person removes it."}},
    {"id":"sf-mission-fl-crane-pulleys","title":"Pulleys at the Crane","site":"mission-bay-construction-site","k12":"k12-simple-machines-at-a-crane","trade":"Crane operators and riggers","tradeLine":"An operator reads the load chart before every lift, because the boom's reach changes what the crane can hold.","minutes":3,"steps":["Find the hook block hanging from the crane and count the ropes into it.","More rope parts share the weight, so each one pulls less.","The operator checks the load chart so the lift stays inside what the crane can hold."],"check":{"q":"Why does a hook block have several parts of rope?","options":["The ropes share the weight","It looks stronger","It lifts faster"],"answer":0,"why":"Each part of rope carries a share, so the load on each is smaller."}},
    {"id":"sf-mission-fl-crossing-guard","title":"The Crossing Guard's Corner","site":"mission-school-campus","landmark":"dolores-park","k12":"k12-teamwork-and-feedback","trade":"School crossing guards","tradeLine":"A crossing guard waits for the traffic to stop, steps out first, and walks the children across together.","minutes":2,"steps":["Stand at the corner and watch the guard look both ways.","The guard steps into the street with the sign before anyone crosses.","Children cross as a group while the guard holds the traffic."],"check":{"q":"When do the children start to cross?","options":["After the guard has stopped the traffic","As soon as they reach the corner","When a friend waves"],"answer":0,"why":"The guard stops the traffic first, then the group crosses together."}},
  ],
  gated: [
    {"id":"sf-mission-gated-first-pour","kind":"side-quest","title":"The First Pour on the New Block","world":"parishes","parish":"sf-mission","site":"mission-bay-construction-site","siteName":"Mission Bay Construction Site","summary":"Join the crew for the deck pour on a Mission Bay block.","gate":{"stations":["formwork-shoring","concrete-pour"],"note":"Finish the formwork and concrete pour stations before the first pour"}},
    {"id":"sf-mission-gated-yard-night-switch","kind":"side-quest","title":"Night Switching at King Street","world":"parishes","parish":"sf-mission","site":"king-street-rail-yard","siteName":"King Street Rail Yard","summary":"Line the switches for the evening trains with the yard crew.","gate":{"stations":["ra-blue-flag-protection-in-the-yard","rcl-switching"],"note":"Walk blue flag protection and switching before the night move"}},
  ],
};
