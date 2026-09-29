// Hammond — Downtown & the Interstates (console CAPITAL, docs/consoles/CAPITAL.md, docs/parishes.md). A stylised 4096 m
// map at district scale (about 2 real metres per map metre), not a survey: every coordinate is approximate (three
// decimals for anchors, `approximate: true`). Hammond is named as a place only, with no growth or other figures. The interstates, the
// highways, the rail line, the university district and the airport are real as places; creeks, canals and every site
// layout are procedural.
// Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).
// (SURVEYOR-2, a scene chosen by its cover of this box: Interstate Twelve runs straight east-west south of town, Interstate
// Fifty-Five crosses it at the west edge and leaves the box to the north-west, Highway Fifty-One runs north-south west of
// downtown, the rail line runs a little east of south through downtown, and no river crosses the box; the creek and canal
// stay procedural.) Written once by tools/gen_cap_capital.py; this module is the source afterwards. Pure data, no imports.
export const NP_HAMMOND_DOWNTOWN = {
  id: "hammond-downtown",
  name: "Hammond — Downtown & the Interstates",
  region: "louisiana-cities",
  size: 4096,
  scale: 2.0,
  blurb: "Hammond in Tangipahoa Parish at street scale: where Interstate Fifty-Five and Interstate Twelve cross, the downtown along the rail line, the university district to the north and the regional airport to the east. Trades sites for interchange work, rail crossings, downtown restoration, the airport apron and hangar, utilities and public buildings. Hammond is named as a place only. The site layouts are illustrative (procedural); the river, streets and places are real.",
  start: "ham-workforce-centre",
  anchors: [
    {"xz":[-336,-278],"lonlat":[-90.462,30.505],"approximate":true,"name":"downtown Hammond"},
    {"xz":[-1624,1160],"lonlat":[-90.489,30.479],"approximate":true,"name":"the Interstate Fifty-Five and Twelve interchange"},
    {"xz":[1726,-1169],"lonlat":[-90.419,30.521],"approximate":true,"name":"Hammond Northshore Regional Airport"},
    {"xz":[-575,-891],"lonlat":[-90.467,30.516],"approximate":true,"name":"the university district"},
    {"xz":[-2048,452],"lonlat":[-90.498,30.492],"approximate":true,"name":"Interstate Fifty-Five north, at the west edge"},
    {"xz":[1199,1160],"lonlat":[-90.43,30.479],"approximate":true,"name":"Interstate Twelve east"},
    {"xz":[160,1670],"lonlat":[-90.452,30.47],"approximate":true,"name":"the rail line south of town"},
  ],
  water: [
    {"id":"west-creek","name":"a creek west of town (procedural)","kind":"canal","width":12,"poly":[[-1966,-2004],[-1774,-557],[-1679,835],[-1822,2004]]},
    {"id":"east-drainage-canal","name":"a drainage canal east of town (procedural)","kind":"canal","width":10,"poly":[[719,-2004],[623,-557],[480,557],[575,2004]]},
    {"id":"stormwater-pond","name":"a stormwater pond (procedural)","kind":"lake","poly":[[815,1336],[1007,1336],[1007,1503],[815,1503]]},
  ],
  levees: [
    {"id":"west-creek-bank","name":"the creek's raised bank (procedural)","height":3.2,"pts":[[-1870,-2004],[-1679,-557],[-1583,835],[-1726,2004]]},
    {"id":"east-canal-bank","name":"the canal's raised bank (procedural)","height":3.2,"pts":[[815,-2004],[719,-557],[575,557],[671,2004]]},
  ],
  roads: [
    {"id":"interstate-fifty-five","name":"Interstate Fifty-Five","kind":"interstate","pts":[[-1088,2048],[-1624,1160],[-2048,452]]},
    {"id":"interstate-twelve","name":"Interstate Twelve","kind":"interstate","pts":[[-2048,1160],[-1624,1160],[-1316,1160],[2048,1160]]},
    {"id":"us-fifty-one","name":"Highway Fifty-One (Morrison Boulevard)","kind":"avenue","pts":[[-1328,2048],[-1316,1160],[-1316,-2048]]},
    {"id":"thomas-street","name":"Thomas Street (Highway One-Ninety)","kind":"avenue","pts":[[-2048,-320],[-1316,-320],[-290,-300],[352,-448],[1000,-560],[1512,-648],[2048,-668]]},
    {"id":"rail-line","name":"the rail line through downtown","kind":"street","pts":[[272,2048],[32,1152],[-88,512],[-288,-368],[-760,-2048]]},
    {"id":"railroad-avenue","name":"Railroad Avenue","kind":"street","pts":[[-124,223],[-311,-557]]},
    {"id":"airport-road","name":"the airport road","kind":"street","pts":[[1512,-648],[1512,-850],[1560,-1002]]},
    {"id":"university-avenue","name":"University Avenue","kind":"street","pts":[[-1199,-835],[-552,-835],[240,-835]]},
  ],
  districts: [
    {"id":"downtown-hammond","name":"Downtown Hammond","character":"downtown","poly":[[-528,-557],[-96,-557],[-96,111],[-528,111]]},
    {"id":"historic-blocks","name":"the historic blocks by the rail line","character":"quarter","poly":[[-96,-557],[240,-557],[240,111],[-96,111]]},
    {"id":"university-district","name":"the university district","character":"campus","poly":[[-1007,-1391],[-240,-1391],[-240,-612],[-1007,-612]]},
    {"id":"airport-district","name":"the airport","character":"industrial","poly":[[1199,-1670],[2048,-1670],[2048,-668],[1199,-668]]},
    {"id":"interchange-commerce","name":"the interchange's commercial strip","character":"industrial","poly":[[-1966,557],[-719,557],[-719,1670],[-1966,1670]]},
    {"id":"north-neighbourhoods","name":"the neighbourhoods north of downtown","character":"suburb","poly":[[-240,-2048],[1151,-2048],[1151,-557],[-240,-557]]},
    {"id":"south-neighbourhoods","name":"the neighbourhoods south of downtown","character":"garden","poly":[[-671,111],[719,111],[719,1113],[-671,1113]]},
    {"id":"west-neighbourhoods","name":"the neighbourhoods west of Highway Fifty-One","character":"suburb","poly":[[-2048,-2048],[-1380,-2048],[-1380,300],[-2048,300]]},
    {"id":"south-woods","name":"the pine woods south of the interstate","character":"park","poly":[[-2048,1725],[2048,1725],[2048,2048],[-2048,2048]]},
  ],
  sites: [
    {"id":"ham-workforce-centre","name":"Hammond Workforce Centre","kind":"union-hall","position":[-192,-362],"trades":["ibew","carpenters","liuna","ua"],"programmes":["builders-trades","job-readiness-edition"],"stations":["jobsite-orientation-and-osha-10","apprenticeship-application-and-test","union-hall-and-dispatch"],"blurb":"A procedural workforce centre downtown where a new hand starts: orientation, the apprenticeship application and the dispatch board. Trade reference only; Hammond is named as a place, with no figures about it. The site layouts are illustrative (procedural); the river, streets and places are real."},
    {"id":"ham-interchange-work","name":"Interchange Work Zone","kind":"bridge","position":[-1180,1380],"trades":["iuoe","liuna","ironworkers"],"programmes":["heavy-equipment-operators","bridge-and-structural"],"stations":["traffic-incident-management","deck-joint-replacement","op-compactor-lift-thickness-and-edge"],"blurb":"A procedural ramp rebuild by the interstate interchange: the work zone set up behind a buffer, deck joints replaced and the fill compacted in lifts."},
    {"id":"ham-rail-crossing","name":"Rail Crossing Crew","kind":"rail","position":[-130,668],"trades":["bmwed","brs"],"programmes":["railroad-crafts"],"stations":["ra-crossing-signal-maintenance-and-flagging","ra-roadway-worker-protection-and-job-briefing","track-access"],"blurb":"A grade crossing rebuilt on the rail line: the signal maintained, the road flagged and nobody on the track without protection."},
    {"id":"ham-downtown-facade","name":"Downtown Facade Restoration","kind":"construction","position":[48,-167],"trades":["bac","carpenters","iupat"],"programmes":["builders-trades","fall-protection"],"stations":["scaffold-erection","leading-edge-and-horizontal-lifeline","gl-swing-stage-glazing-and-sealant"],"blurb":"An older storefront restored: scaffold tagged before use, lifelines on the upper floors and the sidewalk protected below."},
    {"id":"ham-airport-apron","name":"Airport Apron Work","kind":"airport","position":[1679,-891],"trades":["iuoe","liuna","iam"],"programmes":["aviation-maintenance-and-ground","heavy-equipment-operators"],"stations":["av-marshalling-and-wingwalker-signals","op-equipment-daily-walkaround-and-fluids","traffic-incident-management"],"blurb":"Apron paving beside the ramp: marshalling signals for every aircraft move, the work zone kept outside the taxi lines and equipment checked each morning."},
    {"id":"ham-hangar-build","name":"Hangar Build","kind":"construction","position":[1439,-1391],"trades":["ironworkers","iuoe","ibew"],"programmes":["bridge-and-structural","rigging-lifting"],"stations":["steel-erector","op-crawler-crane-assembly-and-load-chart","temporary-site-power"],"blurb":"A procedural hangar going up in steel: connectors tied off, the crane's load chart read and temporary power set up safely."},
    {"id":"ham-water-tower","name":"Water Tower Repaint","kind":"utility","position":[144,-1113],"trades":["iupat","uwua"],"programmes":["water-and-gas-utility-crews","fall-protection"],"stations":["leading-edge-and-horizontal-lifeline","bridge-lead-containment","cs-permit-entry-and-attendant-duties"],"blurb":"A water tower repainted: climbers tied off all the way, old coatings contained and the tank entered only on a permit."},
    {"id":"ham-university-mep-fitout","name":"University MEP Fit-Out","kind":"campus","position":[-719,-1058],"trades":["ibew","ua","smart"],"programmes":["electrical-first-period","plumbers-and-pipefitters"],"stations":["pm-electrical-room","pl-copper-press-and-solder-rough-in","ib-firestop-and-fire-wrap-installation"],"blurb":"A procedural campus building being fitted out: the electrical room locked out, copper pressed or soldered with a fire watch, and every penetration firestopped."},
    {"id":"ham-hospital-expansion","name":"Hospital Expansion","kind":"hospital","position":[336,-1391],"trades":["ibew","ua","carpenters"],"programmes":["healthcare-support","plumbers-and-pipefitters"],"stations":["pl-medical-gas-brazing-and-purge","infection-control-audit","pm-fire-alarm-panel-room"],"blurb":"A procedural hospital wing: medical gas brazed with a purge, dust kept away from patients and the fire alarm panel tested before handover."},
    {"id":"ham-warehouse-steel","name":"Warehouse Steel","kind":"warehouse","position":[-1450,1000],"trades":["ironworkers","iuoe"],"programmes":["bridge-and-structural","warehouse-and-logistics-automation"],"stations":["steel-erector","bs-structural-bolting-and-torque","tw-dock-leveler-and-trailer-restraint-check"],"blurb":"A procedural distribution warehouse by the interchange: steel bolted and torqued, then the docks' levellers and trailer restraints checked."},
    {"id":"ham-streetscape-crew","name":"Thomas Street Streetscape Crew","kind":"construction","position":[-719,-139],"trades":["liuna","opcmia"],"programmes":["cement-masons-and-plasterers","builders-trades"],"stations":["concrete-pour","traffic-incident-management","gk-hardscape-paver-base-and-compaction"],"blurb":"New sidewalks on Thomas Street: the lane closed and signed, the pour placed and finished and pedestrians guided round it."},
    {"id":"ham-substation","name":"Hammond Substation","kind":"substation","position":[48,668],"trades":["ibew"],"programmes":["electrical-first-period","energy-transition"],"stations":["substation-switching","arc-flash-label-study","line-truck"],"blurb":"A procedural substation: switching orders read back, arc flash boundaries marked and the line truck set up inside its zone."},
    {"id":"ham-fire-station","name":"Downtown Fire Station","kind":"fire-station","position":[-432,-668],"trades":["iaff"],"programmes":["first-responders"],"stations":["structure-fire-sizeup","aerial-ladder","ambulance-scene-safety"],"blurb":"A procedural engine house: the size-up, the aerial set on firm ground and scene safety on the interstate."},
    {"id":"ham-school-renovation","name":"School Renovation","kind":"school","position":[336,557],"trades":["carpenters","ibew","afscme"],"programmes":["education-support-staff","builders-trades"],"stations":["ed-boiler-room-filter-change-lockout","ed-playground-equipment-inspection","ed-crossing-guard-intersection-control"],"blurb":"A procedural school renovated over the summer: the boiler room locked out, the playground inspected and the crossing staffed when classes return."},
    {"id":"ham-drainage-canal","name":"Drainage Canal Crew","kind":"stormwater","position":[384,0],"trades":["liuna","iuoe"],"programmes":["water-and-gas-utility-crews","heavy-equipment-operators"],"stations":["op-excavator-trench-and-utility-locate","stormwater-outfall","br-cold-water-immersion-and-mob-recovery"],"blurb":"Reshaping the drainage canal east of town: the excavator kept back from the soft edge, the outfall cleared and a throw line near the water."},
    {"id":"ham-truck-yard","name":"Interstate Truck Yard","kind":"trucking","position":[-1583,779],"trades":["teamsters"],"programmes":["warehouse-and-logistics-automation"],"stations":["tdl-pretrip-inspection","tdl-air-brake-test","po-yard-hostler-and-pedestrian-separation"],"blurb":"A procedural truck yard by the interchange: the pre-trip walkaround, the air brakes tested and people on foot kept to their own path."},
  ],
  landmarks: [
    {"id":"downtown-hammond-place","name":"downtown Hammond","position":[-240,-223],"kind":"neighbourhood"},
    {"id":"interstate-interchange","name":"the interchange of Interstate Fifty-Five and Interstate Twelve","position":[-1560,1060],"kind":"point"},
    {"id":"regional-airport","name":"Hammond Northshore Regional Airport","position":[1679,-1225],"kind":"point"},
    {"id":"university-place","name":"the university district","position":[-623,-1280],"kind":"neighbourhood"},
    {"id":"rail-line-place","name":"the rail line through downtown","position":[-150,0],"kind":"point"},
    {"id":"illustrative-sign","name":"a sign: the site layouts are illustrative; the streets and places are real","position":[-144,-167],"kind":"point"},
  ],
  connectors: [
    {"id":"cap-ha-interstate-twelve-west","kind":"road","name":"Interstate Twelve west towards Baton Rouge","from":{"parish":"hammond-downtown","position":[-2024,1160]},"to":{"parish":"livingston-interstate-twelve","position":null,"lonlat":[-90.498,30.479]},"lonlat":[-90.498,30.479],"approximate":true},
    {"id":"cap-ha-interstate-fifty-five-south","kind":"road","name":"Interstate Fifty-Five south towards Ponchatoula and New Orleans","from":{"parish":"hammond-downtown","position":[-1105,2020]},"to":{"parish":"tangipahoa-south","position":null,"lonlat":[-90.479,30.463]},"lonlat":[-90.479,30.463],"approximate":true},
  ],
  fieldLessons: [
    {"id":"cap-ha-fl-where-roads-cross","title":"Where Two Highways Cross","site":"ham-interchange-work","landmark":"interstate-interchange","k12":"k12-reading-a-map-scale-in-bay-world","station":"traffic-incident-management","trade":"Highway crews","tradeLine":"A highway crew sets up a buffer and signs well before the work so drivers slow down in time.","minutes":3,"steps":["Find the place on the map where the two interstates cross.","Ramps let drivers move from one highway to the other without stopping.","Crews working here set signs and a buffer far ahead so traffic slows before it reaches them."],"check":{"q":"Why do highway crews put signs far ahead of the work?","options":["So drivers have time to slow down","To advertise the job","Because the signs are heavy"],"answer":0,"why":"Drivers need distance to see the warning and slow before they reach the workers."}},
    {"id":"cap-ha-fl-crossing-signals","title":"Why the Crossing Gates Come Down","site":"ham-rail-crossing","landmark":"rail-line-place","k12":"k12-reading-instructions-and-safety-labels","station":"ra-crossing-signal-maintenance-and-flagging","trade":"Signal maintainers","tradeLine":"A signal maintainer tests the lights, bells and gates, and flags the road while the crossing is being worked on.","minutes":3,"steps":["Look at the crossing on the rail line through downtown.","Lights, bells and gates warn drivers and walkers that a train is coming.","Maintainers test them and flag traffic by hand while they work."],"check":{"q":"What should you do when the crossing lights flash?","options":["Stop and wait behind the gate","Hurry across","Walk around the gate"],"answer":0,"why":"A train cannot stop quickly, so everyone waits until the gates rise."}},
    {"id":"cap-ha-fl-who-works-at-the-airport","title":"Who Works at the Airport?","site":"ham-airport-apron","landmark":"regional-airport","k12":"k12-es-who-does-this-work","station":"av-marshalling-and-wingwalker-signals","trade":"Ramp crews","tradeLine":"A ramp worker uses clear hand signals to guide an aircraft, and a wing walker watches the wingtips.","minutes":3,"steps":["Look across the airport apron.","Mechanics, fuelers, paving crews and ramp workers all work near moving aircraft.","They use hand signals and walk beside the wings so nothing is hit."],"check":{"q":"Why does a wing walker walk beside a moving aircraft?","options":["To make sure the wingtips clear everything","To race the plane","To wave at the passengers"],"answer":0,"why":"The pilot cannot see the wingtips well, so a wing walker watches them."}},
  ],
  gated: [
    {"id":"cap-ha-gated-interchange-zone","kind":"side-quest","title":"Set Up the Interchange Work Zone","world":"parishes","parish":"hammond-downtown","site":"ham-interchange-work","siteName":"Interchange Work Zone","summary":"Set up a ramp work zone by the interchange with its buffer and signs.","gate":{"stations":["traffic-incident-management","deck-joint-replacement"],"note":"Finish the traffic incident management and deck joint stations first"}},
    {"id":"cap-ha-gated-hangar-steel","kind":"side-quest","title":"Raise the Hangar Steel","world":"parishes","parish":"hammond-downtown","site":"ham-hangar-build","siteName":"Hangar Build","summary":"Raise the hangar frame with the crane's load chart and tie-off at every step.","gate":{"stations":["steel-erector","op-crawler-crane-assembly-and-load-chart"],"note":"Finish the steel erector and crawler crane stations first"}},
  ],
};
