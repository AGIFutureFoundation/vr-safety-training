// Downtown San Jose — a South Bay district on the parish schema (console EASTBAY,
// docs/consoles/EASTBAY.md, docs/parishes.md). A stylised 4096 m map, not a survey: real places appear
// only by their public names as places; every coordinate is approximate (three decimals,
// `approximate: true`) and exists only to place the map. One north-up uniform scale (about two real
// metres per map metre, x east, +z south); the shore and the creeks are clipped to this field from one
// shared outline, so neighbouring maps agree on the shore. `hills` are gentle procedural mounds placed at
// their approximate public lon/lat and carrying public names only; a hill's `height` is a map number,
// not a measurement. Site names and crews are procedural training places. Pure data, no imports.
export const NP_BAY_SAN_JOSE = {
  id: "bay-san-jose",
  name: "Downtown San Jose",
  region: "south-bay",
  size: 4096,
  blurb: "The heart of San Jose along the Guadalupe River: Diridon Station's transit hub, the civic centre and the university campus, the river park's grounds crew, a convention centre stage, a hospital campus, the airport's ramp at the north edge and the city's stormwater crews.",
  start: "diridon-transit-hub",
  anchors: [
    {"xz":[-575,276],"lonlat":[-121.903,37.33],"approximate":true,"name":"Diridon Station"},
    {"xz":[221,-166],"lonlat":[-121.885,37.338],"approximate":true,"name":"San José City Hall"},
    {"xz":[398,0],"lonlat":[-121.881,37.335],"approximate":true,"name":"San José State University"},
    {"xz":[0,166],"lonlat":[-121.89,37.332],"approximate":true,"name":"Plaza de César Chávez"},
    {"xz":[-44,-221],"lonlat":[-121.891,37.339],"approximate":true,"name":"St. James Park"},
    {"xz":[-221,-719],"lonlat":[-121.895,37.348],"approximate":true,"name":"Japantown"},
    {"xz":[-221,1659],"lonlat":[-121.895,37.305],"approximate":true,"name":"Willow Glen"},
  ],
  hills: [
  ],
  water: [
    {"id":"guadalupe-river","name":"the Guadalupe River","kind":"canal","width":30,"poly":[[354,2046],[133,1493],[-89,940],[-310,498],[-420,111],[-531,-276],[-752,-719],[-1018,-1161],[-1328,-1603],[-1593,-2046]]},
    {"id":"los-gatos-creek","name":"Los Gatos Creek","kind":"canal","width":14,"poly":[[-1770,2046],[-1239,1382],[-797,829],[-575,498],[-420,194]]},
    {"id":"coyote-creek","name":"Coyote Creek","kind":"canal","width":20,"poly":[[1505,2046],[1151,1106],[885,276],[620,-553],[221,-1382],[-221,-2046]]},
  ],
  levees: [
    {"id":"guadalupe-east-flood-wall","name":"the Guadalupe River's east flood wall","height":3.4,"pts":[[465,1880],[243,1382],[22,885],[-199,442],[-301,138]]},
    {"id":"guadalupe-west-flood-wall","name":"the Guadalupe River's west flood wall","height":3.4,"pts":[[-664,-249],[-885,-663],[-1151,-1106],[-1460,-1548]]},
  ],
  roads: [
    {"id":"sinclair-freeway","name":"the Sinclair Freeway","kind":"interstate","pts":[[-2036,885],[-1106,774],[-354,608],[221,442],[885,111],[1549,-276],[2036,-553]]},
    {"id":"guadalupe-parkway","name":"the Guadalupe Parkway","kind":"interstate","pts":[[0,2046],[-177,1382],[-398,829],[-575,276],[-708,-166],[-929,-553],[-1239,-1050],[-1726,-1714]]},
    {"id":"bayshore-freeway","name":"the Bayshore Freeway","kind":"interstate","pts":[[-2036,-2018],[-885,-1742],[0,-1493],[885,-1106],[2036,-498]]},
    {"id":"santa-clara-street","name":"Santa Clara Street and the Alameda","kind":"avenue","pts":[[-1770,-387],[-974,-28],[-443,28],[0,-83],[443,-249],[885,-498],[1549,-885]]},
    {"id":"first-street","name":"First Street","kind":"avenue","pts":[[266,1935],[177,1106],[89,387],[0,-55],[-221,-553],[-664,-1382],[-1018,-1935]]},
    {"id":"san-carlos-street","name":"San Carlos Street","kind":"street","pts":[[-1106,636],[-443,359],[221,166],[664,28]]},
    {"id":"taylor-street","name":"Taylor Street","kind":"street","pts":[[-1106,-829],[-443,-829],[221,-857],[885,-940]]},
    {"id":"tenth-street","name":"Tenth Street","kind":"street","pts":[[885,1382],[708,553],[531,-276],[354,-719]]},
  ],
  districts: [
    {"id":"downtown-core","name":"Downtown San Jose","character":"downtown","poly":[[-354,-387],[531,-387],[531,498],[-354,498]]},
    {"id":"diridon","name":"the Diridon area","character":"quarter","poly":[[-1106,-276],[-354,-276],[-354,719],[-1106,719]]},
    {"id":"university","name":"the university campus","character":"campus","poly":[[266,-166],[620,-166],[620,221],[266,221]]},
    {"id":"japantown","name":"Japantown","character":"garden","poly":[[-664,-1272],[221,-1272],[221,-387],[-664,-387]]},
    {"id":"guadalupe-river-park","name":"Guadalupe River Park","character":"park","poly":[[-974,-940],[-664,-940],[-487,-276],[-708,-276]]},
    {"id":"willow-glen","name":"Willow Glen","character":"suburb","poly":[[-2036,719],[266,719],[266,2046],[-2036,2046]]},
    {"id":"north-first","name":"the North First Street blocks","character":"industrial","poly":[[-2036,-2046],[266,-2046],[266,-1272],[-2036,-1272]]},
    {"id":"east-side","name":"the East Side","character":"suburb","poly":[[620,-1272],[2036,-1272],[2036,2046],[620,2046]]},
    {"id":"the-alameda","name":"the Alameda","character":"suburb","poly":[[-2036,-1272],[-1106,-1272],[-1106,719],[-2036,719]]},
  ],
  sites: [
    {"id":"diridon-transit-hub","name":"Diridon Transit Hub","kind":"transit","position":[-597,304],"trades":["atu","ibew","iam"],"programmes":["transit-ramp","railroad-crafts"],"stations":["track-access","signal-cabinet","tr-wheelchair-lift-and-securement-on-a-bus","ra-roadway-worker-protection-and-job-briefing","bus-yard-fuelling-and-brake-check"],"blurb":"The regional rail and bus hub by the river: the track access briefing, the signal cabinet, the bus bays and the ramp for every rider."},
    {"id":"university-campus-plant-sj","name":"University Campus Plant and Labs","kind":"campus","position":[398,-28],"trades":["aaup","afscme","seiu","ibew","ua"],"programmes":["stationary-engineer","property-management","education-support-staff"],"stations":["chiller-plant","pm-fire-alarm-panel-room","ed-science-lab-chemical-storage-and-eyewash","pm-electrical-room"],"blurb":"The downtown university's plant rooms and teaching labs: the chiller plant, the fire alarm panel and the lab's chemical cupboard."},
    {"id":"san-jose-civic-centre","name":"San Jose Civic Centre","kind":"civic","position":[221,-194],"trades":["afscme","seiu-1021","ifpte-local21"],"programmes":["civic-leadership-and-ei"],"stations":["public-meeting-chair","cv-open-meeting-law-and-agenda-notice","constituent-service-desk","public-comment-prep"],"blurb":"The civic centre and its council chamber: the agenda notice, the service desk and the public comment line."},
    {"id":"downtown-stormwater-crew-yard","name":"Downtown Stormwater Crew Yard","kind":"utility","position":[221,1106],"trades":["liuna","iuoe","uwua","afscme"],"programmes":["water-and-gas-utility-crews","hunters-point-bay-restoration"],"stations":["bioswale-build","stormwater-outfall","manhole-entry-and-atmospheric-monitoring","br-water-quality-sonde-calibration-and-deploy"],"blurb":"A procedural city yard for the green stormwater trade: a planted swale, the outfall check and a runoff sample before it reaches the Guadalupe River. The City of San Jose's project to develop a green stormwater infrastructure implementation plan is one of those named in the EPA's San Francisco Bay Program awards."},
    {"id":"guadalupe-river-park-grounds","name":"Guadalupe River Park Grounds Yard","kind":"park","position":[-797,-442],"trades":["afscme","liuna","seiu"],"programmes":["grounds-and-landscaping"],"stations":["gk-tree-work-pole-saw-and-drop-zone","gk-irrigation-controller-valve-box-and-backflow-check","gk-string-trimmer-and-blower-ppe-and-bystander-zone","gk-hardscape-paver-base-and-compaction"],"blurb":"The river park's grounds crew: tree work with a drop zone, the irrigation valve boxes and the path crew."},
    {"id":"san-jose-high-rise-site","name":"Downtown High-Rise Site","kind":"construction","position":[-89,-138],"trades":["carpenters","liuna","ironworkers"],"programmes":["builders-trades","bridge-and-structural"],"stations":["jobsite-orientation-and-osha-10","formwork-shoring","concrete-pour","bs-structural-bolting-and-torque"],"blurb":"A procedural tower going up in the downtown core: the site orientation, the formwork and the pour, and the ironworkers bolting the frame."},
    {"id":"convention-centre-stage-crew","name":"Convention Centre Stage Crew","kind":"events","position":[44,332],"trades":["iatse","teamsters"],"programmes":["live-events"],"stations":["stage-load-in-and-truss-rigging","stage-power","arena-rigging","pm-community-room-and-events"],"blurb":"The stage crew behind the convention halls: the load-in and truss rigging, stage power and the community room set-up."},
    {"id":"valley-medical-campus","name":"Valley Medical Campus","kind":"hospital","position":[-1814,1161],"trades":["nnu","seiu","afscme","ua","ibew"],"programmes":["first-responders","situational-awareness","plumbers-and-pipefitters"],"stations":["hc-patient-transport-and-safe-handling","hc-code-response-support-and-crash-cart-check","hc-environmental-services-isolation-room-turnover","pl-medical-gas-brazing-and-purge","triage-point"],"blurb":"A hospital campus on the west side: safe patient handling, the crash cart check and the triage point."},
    {"id":"airport-ramp-crew","name":"Airport Ramp Crew","kind":"airport","position":[-1682,-1576],"trades":["iam","twu","teamsters"],"programmes":["aviation-maintenance-and-ground"],"stations":["airport-ramp","av-pushback-tug-and-towbar-connection","av-marshalling-and-wingwalker-signals","av-hangar-jacking-and-stands"],"blurb":"The airport's ramp at the north edge of the map: marshalling and wingwalkers, the pushback tug and the hangar jacks."},
    {"id":"north-first-rail-barn","name":"North First Street Rail Barn","kind":"transit-barn","position":[-89,-995],"trades":["atu","ibew","iam"],"programmes":["transit-ramp"],"stations":["bus-depot-lift","bus-yard-fuelling-and-brake-check","tr-wheelchair-lift-and-securement-on-a-bus","signal-cabinet"],"blurb":"The light rail and bus barn north of downtown: the depot lift, fuelling and the brake check, and the signal cabinet."},
    {"id":"east-side-fire-station","name":"East Side Fire Station","kind":"fire-station","position":[664,553],"trades":["iaff","naemt"],"programmes":["first-responders","fall-protection"],"stations":["ambulance-scene-safety","aerial-ladder","cardiac-arrest-pit-crew","traffic-incident-management"],"blurb":"A downtown fire station: the aerial ladder check, the ambulance scene and the crews who clear a freeway lane safely."},
    {"id":"willow-glen-school-campus","name":"Willow Glen School Campus","kind":"school","position":[664,1659],"trades":["aft","csea","seiu"],"programmes":["education-support-staff","k12-literacy-and-life-skills"],"stations":["ed-custodial-chemical-dilution-and-floor-machine","ed-playground-equipment-inspection","ed-crossing-guard-intersection-control","k12-reading-instructions-and-safety-labels"],"blurb":"A neighbourhood school campus: the crossing guard at the corner, the playground inspection and the custodians' chemical room."},
    {"id":"japantown-union-hall","name":"Japantown Union Hall","kind":"union-hall","position":[-133,-774],"trades":["carpenters","ibew","liuna","unite-here"],"programmes":["job-readiness-edition","civic-leadership-and-ei"],"stations":["union-hall-and-dispatch","jobsite-orientation-and-osha-10","apprenticeship-application-and-test","public-meeting-chair"],"blurb":"A union hall near Japantown: the dispatch board, the apprenticeship table and the meeting room where the crews speak and vote."},
  ],
  landmarks: [
    {"id":"diridon-station", "lm": "transit-station","name":"Diridon Station","position":[-575,249],"kind":"station"},
    {"id":"san-jose-city-hall", "lm": "civic-tower","name":"San José City Hall","position":[221,-138],"kind":"tower"},
    {"id":"plaza-de-cesar-chavez","name":"Plaza de César Chávez","position":[0,166],"kind":"park"},
    {"id":"cathedral-basilica","name":"the Cathedral Basilica of St. Joseph","position":[22,55],"kind":"place"},
    {"id":"st-james-park","name":"St. James Park","position":[-44,-221],"kind":"park"},
    {"id":"guadalupe-river-park","name":"Guadalupe River Park","position":[-642,-498],"kind":"shore"},
    {"id":"tower-hall","name":"Tower Hall","position":[310,-28],"kind":"tower"},
  ],
  connectors: [
    {"id":"eb-sj-alameda-north","kind":"road","name":"The Alameda north-west toward Santa Clara (no map yet)","from":{"parish":"bay-san-jose","position":[-1770,-387]},"to":{"parish":"bay-santa-clara","position":null,"lonlat":[-121.93,37.342]},"lonlat":[-121.93,37.342],"approximate":true},
    {"id":"eb-sj-bayshore-north","kind":"road","name":"The Bayshore Freeway north toward the Peninsula (no map yet)","from":{"parish":"bay-san-jose","position":[-1903,-1990]},"to":{"parish":"bay-peninsula","position":null,"lonlat":[-121.933,37.371]},"lonlat":[-121.933,37.371],"approximate":true},
  ],
  fieldLessons: [
    {"id":"eb-fl-where-the-river-goes-in-a-storm","title":"Where the River Goes in a Storm","site":"downtown-stormwater-crew-yard","landmark":"guadalupe-river-park","k12":"k12-by-what-a-pump-station-does-in-the-rain","station":"bioswale-build","trade":"Stormwater crews","tradeLine":"A stormwater crew plants swales and keeps the drains clear, so a storm's runoff slows down before it reaches the river.","minutes":3,"steps":["Rain on streets and roofs flows to drains that lead to the river.","Planted ground and swales hold some water back and let it soak in.","Crews check drains before a storm and stay out of fast water."],"check":{"q":"Why do crews plant swales along a street?","options":["To slow the runoff and let it soak in","To make the river rise faster","To hide the drains"],"answer":0,"why":"Slower runoff soaks in and gets cleaner, and the river rises more gently."}},
    {"id":"eb-fl-reading-the-hub-timetable","title":"Reading the Hub Timetable","site":"diridon-transit-hub","landmark":"diridon-station","k12":"k12-by-a-streetcar-timetable","station":"track-access","trade":"Rail maintainers","tradeLine":"A maintainer reads the timetable and gets a track access briefing, so work on the line happens between trains, never in front of one.","minutes":3,"steps":["Find the hub down the side of the timetable and the trips across the top.","Count the gap between two trains: that is the time a crew can plan around.","A crew only steps near the track after the briefing and with a lookout."],"check":{"q":"When may a crew step near the track?","options":["After the briefing, with a lookout","Whenever the platform is empty","Only at night"],"answer":0,"why":"The briefing and the lookout keep the crew clear of every train."}},
    {"id":"eb-fl-a-map-of-downtown","title":"Reading a Map of Downtown","site":"san-jose-civic-centre","landmark":"san-jose-city-hall","k12":"k12-reading-a-map-scale-in-bay-world","station":"public-meeting-chair","trade":"Civic planners","tradeLine":"A planner reads the map's scale and legend before a meeting, so everyone talks about the same street.","minutes":3,"steps":["Find the scale bar and the north arrow first.","Use the legend to tell a river from a road and a park from a block.","Measure with the scale bar, then say the route in plain words."],"check":{"q":"What should you find first on a map?","options":["The scale bar and the north arrow","The prettiest colour","The biggest word"],"answer":0,"why":"The scale and the north arrow tell you how far and which way."}},
  ],
  gated: [
    {"id":"bay-san-jose-gated-storm-night","kind":"side-quest","title":"Before the Storm on the Guadalupe","site":"downtown-stormwater-crew-yard","summary":"Walk the storm drain route with the crew before a winter storm and clear the inlets.","gate":{"stations":["stormwater-outfall"],"note":"Finish the stormwater outfall station before the storm walk"},"world":"parishes","parish":"bay-san-jose","siteName":"Downtown Stormwater Crew Yard"},
    {"id":"bay-san-jose-gated-night-ramp","kind":"side-quest","title":"A Night Shift on the Ramp","site":"airport-ramp-crew","summary":"Wingwalk a late arrival onto its stand under the ramp lights.","gate":{"stations":["av-marshalling-and-wingwalker-signals"],"note":"Finish the marshalling and wingwalker station before the night shift"},"world":"parishes","parish":"bay-san-jose","siteName":"Airport Ramp Crew"},
  ],
};
