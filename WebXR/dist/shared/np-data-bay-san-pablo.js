// San Pablo & Richmond's Shore — a North East Bay district on the parish schema (console EASTBAY,
// docs/consoles/EASTBAY.md, docs/parishes.md). A stylised 4096 m map, not a survey: real places appear
// only by their public names as places; every coordinate is approximate (three decimals,
// `approximate: true`) and exists only to place the map. One north-up uniform scale (about two real
// metres per map metre, x east, +z south); the shore and the creeks are clipped to this field from one
// shared outline, so neighbouring maps agree on the shore. `hills` are gentle procedural mounds placed at
// their approximate public lon/lat and carrying public names only; a hill's `height` is a map number,
// not a measurement. Site names and crews are procedural training places. Pure data, no imports.
export const NP_BAY_SAN_PABLO = {
  id: "bay-san-pablo",
  name: "San Pablo & Richmond's Shore",
  region: "north-east-bay",
  size: 4096,
  blurb: "Richmond's shore and the city of San Pablo: the Marina Bay harbour, the shipyard and harbour terminals on the inner harbour, the refinery's turnaround yard under the Point Richmond hills, the civic centre and transit station on Macdonald Avenue, and San Pablo's stormwater crew by Wildcat and San Pablo creeks.",
  start: "richmond-transit-station",
  anchors: [
    {"xz":[-351,-111],"lonlat":[-122.353,37.937],"approximate":true,"name":"Richmond Station"},
    {"xz":[-1756,553],"lonlat":[-122.385,37.925],"approximate":true,"name":"Point Richmond"},
    {"xz":[-219,1216],"lonlat":[-122.35,37.913],"approximate":true,"name":"Marina Bay"},
    {"xz":[-44,-1493],"lonlat":[-122.346,37.962],"approximate":true,"name":"San Pablo"},
    {"xz":[44,-111],"lonlat":[-122.344,37.937],"approximate":true,"name":"the Richmond Civic Center"},
    {"xz":[878,1935],"lonlat":[-122.325,37.9],"approximate":true,"name":"Point Isabel"},
    {"xz":[1756,995],"lonlat":[-122.305,37.917],"approximate":true,"name":"El Cerrito"},
  ],
  hills: [
    {"id":"point-richmond-hills","name":"the Point Richmond hills","center":[-1536,802],"radius":240,"height":30},
    {"id":"el-cerrito-hills","name":"the El Cerrito hills","center":[1997,691],"radius":200,"height":26},
  ],
  water: [
    {"id":"san-francisco-bay","name":"San Francisco Bay","kind":"bay","poly":[[-2048,-2048],[-2048,2048],[968,2048],[922,1990],[571,1659],[0,1437],[-571,1548],[-1097,1659],[-1624,1382],[-1975,995],[-2048,751],[-2048,-1192],[-1536,-1493],[-1010,-2046],[-1009,-2048]]},
    {"id":"wildcat-creek","name":"Wildcat Creek","kind":"canal","width":12,"poly":[[483,-1078],[-219,-1299],[-922,-1659]]},
    {"id":"san-pablo-creek","name":"San Pablo Creek","kind":"canal","width":12,"poly":[[834,-829],[219,-1493],[-483,-1963]]},
  ],
  levees: [
    {"id":"point-isabel-shore-wall","name":"the Point Isabel shore wall","height":3,"pts":[[988,1869],[702,1620]]},
    {"id":"marina-bay-seawall","name":"the Marina Bay seawall","height":3,"pts":[[219,1327],[-219,1299],[-571,1382]]},
  ],
  roads: [
    {"id":"eastshore-freeway","name":"the Eastshore Freeway","kind":"interstate","pts":[[1526,2048],[1449,1659],[1273,1106],[1010,553],[746,0],[571,-553],[439,-1382],[333,-2048]]},
    {"id":"san-pablo-avenue","name":"San Pablo Avenue","kind":"avenue","pts":[[1980,2048],[1888,1659],[1624,1106],[1229,553],[878,0],[527,-553],[219,-1106],[0,-1659],[-154,-2048]]},
    {"id":"richmond-san-rafael-approach","name":"the Richmond–San Rafael Bridge approach","kind":"interstate","pts":[[-2048,61],[-1536,276],[-658,691],[219,995],[878,1327],[1361,1603]]},
    {"id":"macdonald-avenue","name":"Macdonald Avenue","kind":"avenue","pts":[[-1756,0],[-1097,-55],[-439,-111],[219,-166],[1097,-249],[1756,-276]]},
    {"id":"cutting-boulevard","name":"Cutting Boulevard","kind":"avenue","pts":[[-1097,470],[-219,442],[658,415],[1536,387]]},
    {"id":"harbour-way","name":"Harbour Way","kind":"street","pts":[[-351,1272],[-351,553],[-351,-553]]},
    {"id":"twenty-third-street","name":"Twenty-Third Street","kind":"street","pts":[[-88,553],[-66,-553],[-22,-1272]]},
  ],
  districts: [
    {"id":"marina-bay","name":"Marina Bay","character":"quarter","poly":[[-878,719],[439,719],[439,1659],[-878,1659]]},
    {"id":"inner-harbour","name":"the Richmond inner harbour","character":"port","poly":[[-1536,719],[-878,719],[-878,1659],[-1536,1659]]},
    {"id":"point-richmond","name":"Point Richmond","character":"garden","poly":[[-2048,276],[-1536,276],[-1536,1272],[-2048,1272]]},
    {"id":"refinery","name":"the refinery lands","character":"refinery","poly":[[-2048,-1106],[-1097,-1106],[-1097,276],[-2048,276]]},
    {"id":"downtown-richmond","name":"Downtown Richmond","character":"downtown","poly":[[-1097,-553],[439,-553],[439,719],[-1097,719]]},
    {"id":"san-pablo","name":"San Pablo","character":"suburb","poly":[[-1097,-2046],[2048,-2046],[2048,-553],[-1097,-553]]},
    {"id":"richmond-annex","name":"the Richmond Annex and El Cerrito's flats","character":"suburb","poly":[[439,-553],[2048,-553],[2048,1659],[439,1659]]},
  ],
  sites: [
    {"id":"richmond-transit-station","name":"Richmond Transit Station","kind":"transit","position":[-373,-83],"trades":["atu","ibew","iam"],"programmes":["transit-ramp","railroad-crafts"],"stations":["track-access","signal-cabinet","tr-wheelchair-lift-and-securement-on-a-bus","ra-roadway-worker-protection-and-job-briefing"],"blurb":"The rail and bus station off Macdonald Avenue: the track access briefing, the signal cabinet and the ramp for every rider."},
    {"id":"richmond-civic-centre","name":"Richmond Civic Centre","kind":"civic","position":[88,-138],"trades":["afscme","seiu-1021","ifpte-local21"],"programmes":["civic-leadership-and-ei"],"stations":["public-meeting-chair","cv-open-meeting-law-and-agenda-notice","constituent-service-desk","public-comment-prep"],"blurb":"The civic centre on its plaza: the council's agenda notice, the service desk and the public comment line."},
    {"id":"marina-bay-harbour","name":"Marina Bay Harbour","kind":"marina","position":[-219,1189],"trades":["ibu","sup","ilwu"],"programmes":["yacht-and-charter-crew","ports-maritime-ecology"],"stations":["yc-line-handling-and-docking-in-crosswind","yc-fuel-dock-transfer-and-spill-kit","yc-shore-power-connection-and-in-water-electrical-safety","yc-pre-departure-safety-briefing-and-guest-count"],"blurb":"The marina's docks on Marina Bay: docking in a crosswind, the fuel dock and the shore power pedestals."},
    {"id":"richmond-shipyard-crew","name":"Richmond Shipyard Crew","kind":"shipyard","position":[-746,1272],"trades":["ibb","ironworkers","ua","iupat"],"programmes":["insulators-and-boilermakers","commercial-diving-and-scientific-scuba"],"stations":["shipyard-hotwork","ib-pressure-vessel-confined-entry-and-hot-work","tank-lining","cd-pier-piling-inspection-and-wrap-repair"],"blurb":"A procedural ship repair yard on the inner harbour: hot work under a permit, a confined tank entry and the pier piling wrap."},
    {"id":"richmond-harbour-terminal","name":"Richmond Harbour Terminal","kind":"port","position":[-1185,1189],"trades":["ilwu","iuoe","teamsters"],"programmes":["port-operations","ports-maritime-ecology"],"stations":["reefer-yard-monitoring","straddle-carrier-ops","shore-power-hookup","hazmat-container-inspection","mooring-line"],"blurb":"The harbour's berths and yard: mooring lines, the reefer rows, shore power and the hazmat container check."},
    {"id":"refinery-turnaround-yard","name":"Refinery Turnaround Yard","kind":"refinery","position":[-1756,-387],"trades":["usw","ibb","ua","insulators"],"programmes":["insulators-and-boilermakers","plumbers-and-pipefitters","confined-space"],"stations":["ib-pressure-vessel-confined-entry-and-hot-work","ib-refractory-and-castable-installation","tank-lining","cs-permit-entry-and-attendant-duties"],"blurb":"A procedural turnaround yard in the refinery lands: a vessel entry under permit, refractory repair and tank lining."},
    {"id":"san-pablo-stormwater-crew","name":"San Pablo Stormwater Crew","kind":"utility","position":[-44,-1437],"trades":["liuna","iuoe","uwua","afscme"],"programmes":["water-and-gas-utility-crews","hunters-point-bay-restoration"],"stations":["bioswale-build","stormwater-outfall","manhole-entry-and-atmospheric-monitoring","br-water-quality-sonde-calibration-and-deploy"],"blurb":"A procedural city crew yard for green stormwater work: building a planted swale, checking the outfall and sampling the runoff. The City of San Pablo's green stormwater infrastructure, designed to capture and treat stormwater runoff, is one of the projects named in the EPA's San Francisco Bay Program awards."},
    {"id":"richmond-school-campus","name":"Richmond School Campus","kind":"school","position":[878,-276],"trades":["aft","csea","seiu"],"programmes":["education-support-staff","k12-literacy-and-life-skills"],"stations":["ed-custodial-chemical-dilution-and-floor-machine","ed-playground-equipment-inspection","ed-crossing-guard-intersection-control","k12-reading-instructions-and-safety-labels"],"blurb":"A neighbourhood school campus: the crossing guard at the corner, the playground inspection and the custodians' chemical room."},
    {"id":"san-pablo-hospital-campus","name":"San Pablo Hospital Campus","kind":"hospital","position":[1185,-829],"trades":["nnu","seiu","afscme","ua","ibew"],"programmes":["first-responders","situational-awareness","plumbers-and-pipefitters"],"stations":["hc-patient-transport-and-safe-handling","hc-code-response-support-and-crash-cart-check","hc-environmental-services-isolation-room-turnover","pl-medical-gas-brazing-and-purge","triage-point"],"blurb":"A hospital campus on the San Pablo side: safe patient handling, the crash cart check and the triage point."},
    {"id":"downtown-richmond-fire-station","name":"Downtown Richmond Fire Station","kind":"fire-station","position":[-658,276],"trades":["iaff","naemt"],"programmes":["first-responders","fall-protection"],"stations":["ambulance-scene-safety","aerial-ladder","cardiac-arrest-pit-crew","traffic-incident-management"],"blurb":"A downtown fire station: the aerial ladder check, the ambulance scene and the crews who clear a freeway lane safely."},
    {"id":"richmond-rail-yard","name":"Richmond Rail Yard","kind":"rail","position":[-1097,221],"trades":["smart-td","blet","bmwed","brs"],"programmes":["railroad-crafts"],"stations":["ra-blue-flag-protection-in-the-yard","ra-switch-inspection-and-lubrication","ra-air-brake-test-and-train-inspection","track-access"],"blurb":"The freight yard behind the harbour: carmen under blue flags, switch maintainers and the air brake test."},
    {"id":"annex-substation","name":"Richmond Annex Substation","kind":"substation","position":[658,553],"trades":["ibew"],"programmes":["energy-transition","electrical-first-period"],"stations":["substation-switching","transformer-vault","arc-flash-label-study","battery-yard"],"blurb":"A substation and battery yard in the Annex: switching under a permit, the transformer vault and the arc flash labels."},
    {"id":"point-isabel-shoreline-crew","name":"Point Isabel Shoreline Crew","kind":"wetland","position":[922,1603],"trades":["liuna","iuoe","afscme"],"programmes":["marine-ecology-and-restoration","bay-restoration-maritime-underwater"],"stations":["br-native-planting-and-erosion-mats","living-shoreline","me-tidal-marsh-channel-restoration-day","br-water-quality-sonde-calibration-and-deploy"],"blurb":"A shoreline restoration crew by Point Isabel: native planting and erosion mats, a living shoreline and the water quality sonde."},
  ],
  landmarks: [
    {"id":"rosie-the-riveter-memorial","name":"the Rosie the Riveter Memorial","position":[-417,1355],"kind":"place"},
    {"id":"point-richmond","name":"Point Richmond","position":[-1756,525],"kind":"place"},
    {"id":"richmond-station","name":"Richmond Station","position":[-351,-138],"kind":"station"},
    {"id":"marina-bay-shore","name":"the Marina Bay shore","position":[0,1355],"kind":"shore"},
    {"id":"wildcat-creek-marsh","name":"Wildcat Creek's marsh","position":[-834,-1714],"kind":"shore"},
    {"id":"the-harbour-cranes","name":"the harbour's cranes","position":[-1317,1437],"kind":"port","lm":"container-cranes"},
  ],
  connectors: [
    {"id":"eb-sp-san-pablo-avenue-south","kind":"road","name":"San Pablo Avenue south to Albany and Berkeley","from":{"parish":"bay-san-pablo","position":[1975,1990]},"to":{"parish":"oak-emeryville-berkeley","position":[-439,-1824],"lonlat":[-122.3,37.899]},"lonlat":[-122.3,37.899],"approximate":true},
    {"id":"eb-sp-eastshore-south","kind":"road","name":"The Eastshore Freeway south to Berkeley","from":{"parish":"bay-san-pablo","position":[1493,1990]},"to":{"parish":"oak-emeryville-berkeley","position":[-923,-1824],"lonlat":[-122.311,37.899]},"lonlat":[-122.311,37.899],"approximate":true},
  ],
  fieldLessons: [
    {"id":"eb-fl-a-creek-on-its-way-to-the-bay","title":"A Creek on Its Way to the Bay","site":"san-pablo-stormwater-crew","landmark":"wildcat-creek-marsh","k12":"k12-by-wetlands-as-a-storms-speed-bump","station":"bioswale-build","trade":"Stormwater crews","tradeLine":"A crew keeps the creek's banks planted and the drains clear, so storm water reaches the bay slowly and cleaner.","minutes":3,"steps":["Creeks carry rain from the streets and hills down to the bay.","Plants on the banks and in the marsh slow the water like a speed bump.","Crews work from the bank, never in fast water, and wear gloves near runoff."],"check":{"q":"What slows storm water on its way to the bay?","options":["Plants on the banks and in the marsh","A smooth concrete slide","Nothing at all"],"answer":0,"why":"Plants slow the water, so it arrives gently and cleaner."}},
    {"id":"eb-fl-sorting-cargo-at-the-harbour","title":"Sorting Cargo at the Harbour","site":"richmond-harbour-terminal","landmark":"the-harbour-cranes","k12":"k12-simple-machines-at-a-crane","station":"mooring-line","trade":"Line handlers","tradeLine":"A line handler keeps clear of the snap-back zone while the lines come tight, so a ship comes alongside safely.","minutes":3,"steps":["A crane lifts cargo with pulleys and a long arm, a lever.","The ship is held at the berth by strong mooring lines.","Line handlers stand clear of a line that is coming tight."],"check":{"q":"Where should a line handler stand when a line comes tight?","options":["Clear of the snap-back zone","Right beside the line","On top of the bollard"],"answer":0,"why":"Standing clear keeps the handler safe if a tight line ever parts."}},
    {"id":"eb-fl-speaking-at-the-civic-centre","title":"Speaking at the Civic Centre","site":"richmond-civic-centre","k12":"k12-how-a-local-council-meeting-works","station":"public-meeting-chair","trade":"Civic staff","tradeLine":"The chair calls each speaker in turn and keeps time, so every voice is heard before the vote.","minutes":3,"steps":["The agenda is posted before the meeting, so everyone knows what will be decided.","Speakers make one clear point and give the reason.","The council listens and votes in the open."],"check":{"q":"What makes a turn at the microphone work best?","options":["One clear point and a reason","Talking as long as possible","Shouting over the chair"],"answer":0,"why":"A clear point with a reason is easy to follow and keeps the meeting fair."}},
  ],
  gated: [
    {"id":"bay-san-pablo-gated-shipyard-night-weld","kind":"side-quest","title":"A Night Weld on the Inner Harbour","site":"richmond-shipyard-crew","summary":"Stand fire watch for a night weld on a workboat's hull.","gate":{"stations":["shipyard-hotwork"],"note":"Finish the shipyard hot work station before the night weld"},"world":"parishes","parish":"bay-san-pablo","siteName":"Richmond Shipyard Crew"},
    {"id":"bay-san-pablo-gated-turnaround-entry","kind":"side-quest","title":"Attendant for a Vessel Entry","site":"refinery-turnaround-yard","summary":"Stand attendant at the manway while the entry crew works inside the vessel.","gate":{"stations":["cs-permit-entry-and-attendant-duties"],"note":"Finish the permit entry and attendant station before the turnaround"},"world":"parishes","parish":"bay-san-pablo","siteName":"Refinery Turnaround Yard"},
  ],
};
