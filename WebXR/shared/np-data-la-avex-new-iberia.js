// AVEX at Acadiana Regional Airport, New Iberia — a Louisiana development site area on the parish schema (console SITES-COAST, docs/consoles/SITES-COAST.md,
// docs/parishes.md). A stylised 4096 m map, not a survey: real places appear only by their public names as places; every
// coordinate is approximate (three decimals, `approximate: true`) and exists only to place the map. One north-up uniform
// scale (x east, +z south). About 1.2 real metres per map metre: Acadiana Regional Airport on the north-west side of New Iberia, Iberia Parish, its
// main runway running a little west of north, the aprons and buildings east of it, open water to the north-east (not named
// here) and the cane fields around it.
// THE PROJECT LAYOUT IS ILLUSTRATIVE; THE PARISH, WATERWAYS AND TOWNS ARE REAL. No site plan is published: every pad, yard,
// building and crew here is the platform's PROCEDURAL illustration. Project facts are only those of the facts file, in its
// words. The platform has no partnership with the company named; crafts are trade references, never an employer's programme.
// Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).
// Written once by tools/gen_lc_sites.mjs; this module is the source afterwards. Pure data, no imports.

export const NP_LA_AVEX_NEW_IBERIA = {
  id: "la-avex-new-iberia",
  name: "AVEX Hangars — Acadiana Regional Airport, New Iberia",
  region: "louisiana-sites",
  size: 4096,
  scale: 1.2,
  blurb: "Acadiana Regional Airport in New Iberia, Iberia Parish, where Aviation Exteriors Louisiana (AVEX) is building ($74 million+ hangar and site development with a $10 million FastSites investment; aircraft paint, maintenance and passenger-to-freighter conversion; construction complete Q4 2027, per the sources in the facts file): the runway, the aprons, hangar steel going up and the cane fields around. The project layout is illustrative; the parish, waterways and towns are real.",
  project: {"name":"Aviation Exteriors Louisiana (AVEX)","company":"AVEX","facts":"Acadiana Regional Airport, New Iberia (Iberia Parish); $74 million+ hangar and site development (with a $10 million FastSites investment); 249 direct new jobs; 183 retained; 596 indirect (845 total including indirect); aircraft paint, maintenance and passenger-to-freighter conversion; construction complete Q4 2027","sources":["opportunitylouisiana.gov news","bizneworleans.com"],"illustrative":true},
  start: "lav-workforce-centre",
  anchors: [
    {"xz":[0,0],"lonlat":[-91.884,30.038],"approximate":true,"name":"Acadiana Regional Airport"},
    {"xz":[-241,-924],"lonlat":[-91.887,30.048],"approximate":true,"name":"the runway's north end (approximate)"},
    {"xz":[241,1016],"lonlat":[-91.881,30.027],"approximate":true,"name":"the runway's south end (approximate)"},
    {"xz":[1767,1663],"lonlat":[-91.862,30.02],"approximate":true,"name":"New Iberia, toward the town (approximate)"},
    {"xz":[-1686,-185],"lonlat":[-91.905,30.04],"approximate":true,"name":"cane fields west of the airfield"},
    {"xz":[-883,-1848],"lonlat":[-91.895,30.058],"approximate":true,"name":"cane fields north of the airfield"},
  ],
  hills: [],
  water: [
    {"id":"coulee-west","name":"a drainage coulee (procedural)","kind":"canal","width":10,"poly":[[-1500,-2048],[-1450,-900],[-1550,200],[-1400,1200],[-1500,2048]]},
    {"id":"stormwater-pond","name":"the runway stormwater pond (procedural)","kind":"lake","poly":[[700,1350],[1050,1350],[1050,1600],[700,1600]]},
    {"id":"open-water-north-east","name":"open water north-east of the runway (not named here)","kind":"lake","poly":[[600,-2048],[2048,-2048],[2048,-500],[1750,-560],[1200,-1150],[800,-1750]]},
    {"id":"coulee-east","name":"a field ditch east of the airfield (procedural)","kind":"canal","width":8,"poly":[[1700,-2048],[1650,-600],[1750,800],[1700,2048]]},
  ],
  levees: [
    {"id":"pond-berm","name":"the stormwater pond's berm (procedural)","height":3.8,"pts":[[660,1252],[1100,1252],[1100,1640]]},
    {"id":"coulee-spoil-bank","name":"the coulee's spoil bank (procedural)","height":1.2,"pts":[[-1430,-1600],[-1400,-900],[-1480,0]]},
  ],
  roads: [
    {"id":"main-runway","name":"the main runway","kind":"interstate","pts":[[-220,-1050],[250,1030]]},
    {"id":"parallel-taxiway","name":"the parallel taxiway","kind":"avenue","pts":[[60,-1000],[400,980]]},
    {"id":"airport-road","name":"the airport road toward New Iberia (procedural course)","kind":"avenue","pts":[[2048,1300],[1550,1000],[1000,480],[600,480]]},
    {"id":"hangar-row","name":"the hangar row (procedural)","kind":"street","pts":[[1000,480],[1000,-600]]},
    {"id":"shore-road","name":"the road along the open water (procedural course)","kind":"street","pts":[[360,-2048],[1050,-1150],[1650,-480],[2048,-330]]},
    {"id":"cane-road-north","name":"a cane field road (procedural)","kind":"street","pts":[[-1000,-2048],[-900,-1500],[-600,-1500]]},
    {"id":"fuel-farm-road","name":"the tank road (procedural)","kind":"street","pts":[[1000,700],[1300,600],[1600,400]]},
  ],
  districts: [
    {"id":"airfield","name":"the runway and taxiways","character":"park","poly":[[-700,-1500],[700,-1500],[700,1500],[-700,1500]]},
    {"id":"hangar-campus","name":"the AVEX hangar campus (illustrative)","character":"industrial","poly":[[700,-1400],[1600,-1400],[1600,300],[700,300]]},
    {"id":"airport-business","name":"the airport business park","character":"industrial","poly":[[700,300],[1600,300],[1600,1150],[700,1150]]},
    {"id":"cane-west","name":"cane fields west of the runway","character":"garden","poly":[[-2048,-2048],[-700,-2048],[-700,2048],[-2048,2048]]},
    {"id":"cane-north","name":"cane fields north of the runway","character":"garden","poly":[[-700,-2048],[2048,-2048],[2048,-1500],[-700,-1500]]},
    {"id":"new-iberia-edge","name":"the edge of New Iberia","character":"suburb","poly":[[1600,-1500],[2048,-1500],[2048,2048],[1600,2048]]},
    {"id":"cane-south","name":"cane fields south of the runway","character":"garden","poly":[[-700,1500],[1600,1500],[1600,2048],[-700,2048]]},
  ],
  sites: [
    {"id":"lav-workforce-centre","name":"Airport Workforce Centre","kind":"school","position":[1700,700],"trades":["iam","ironworkers","iupat"],"programmes":["job-readiness-edition","aviation-maintenance-and-ground","aerospace-defense-and-robotics"],"stations":["jobsite-orientation-and-osha-10","wp-apprenticeship-enrollment-day","apprenticeship-standards-reading"],"blurb":"A training room for the kinds of work the project names — aircraft paint, maintenance and freighter conversion — and the hangar build. A trade reference, not an employer's hiring office."},
    {"id":"lav-hangar-steel","name":"Hangar Steel Erection","kind":"hangar","position":[900,-300],"trades":["ironworkers","iuoe"],"programmes":["bridge-and-structural","rigging-lifting"],"stations":["steel-erector","leading-edge-and-horizontal-lifeline","bs-structural-bolting-and-torque","op-crawler-crane-assembly-and-load-chart"],"blurb":"Long-span hangar steel going up: connectors tied off, bolts torqued to the mark, the crane's load chart read before every pick."},
    {"id":"lav-paint-hangar","name":"Paint Hangar","kind":"paint-shop","position":[870,30],"trades":["iupat","iam"],"programmes":["aviation-maintenance-and-ground","hazmat-environmental"],"stations":["paint-sprayer","ib-spray-foam-and-respirator-fit","cm-epoxy-floor-coating-and-ventilation","av-hangar-jacking-and-stands"],"blurb":"Aircraft paint (the facts file names it): the booth's ventilation running, the respirator fit tested, and stands and fall protection around the fuselage."},
    {"id":"lav-freighter-conversion-bay","name":"Freighter Conversion Bay","kind":"hangar","position":[1150,0],"trades":["iam","smart","ibew"],"programmes":["aviation-maintenance-and-ground","aerospace-defense-and-robotics"],"stations":["av-hangar-jacking-and-stands","ad-depot-tool-control-and-fod-walk","av-borescope-and-tool-control-inventory","ad-hazardous-fluid-servicing-with-a-buddy"],"blurb":"Passenger-to-freighter conversion (the facts file names it): the aircraft on jacks, tools counted in and out, and fluids serviced with a buddy."},
    {"id":"lav-apron-work","name":"Apron Work","kind":"airport","position":[500,200],"trades":["iam","twu","liuna"],"programmes":["aviation-maintenance-and-ground","transit-ramp"],"stations":["airport-ramp","av-marshalling-and-wingwalker-signals","av-pushback-tug-and-towbar-connection","ad-depot-tool-control-and-fod-walk"],"blurb":"The apron in front of the hangars: marshalling signals, wingwalkers on every tow, and the foreign-object walk before aircraft move."},
    {"id":"lav-fuel-farm","name":"Fuel Farm","kind":"fuel-farm","position":[1650,300],"trades":["teamsters","ua","iam"],"programmes":["aviation-maintenance-and-ground","hazmat-environmental"],"stations":["av-ground-power-and-static-bonding-before-fuel","yc-fuel-dock-transfer-and-spill-kit","spill-boom-deploy"],"blurb":"The airfield's fuel farm: bonding before every transfer, the spill kit at hand and no ignition source inside the fence."},
    {"id":"lav-hangar-foundation","name":"Hangar Foundation","kind":"construction","position":[650,-450],"trades":["opcmia","liuna","carpenters"],"programmes":["cement-masons-and-plasterers","builders-trades"],"stations":["concrete-pour","cm-slab-screed-bull-float-and-trowel","cm-power-trowel-operation-and-guarding"],"blurb":"The hangar's slab and footings: the pump's swing zone, rebar caps, and finishers on a very large floor."},
    {"id":"lav-hangar-doors","name":"Hangar Door Install","kind":"construction","position":[1150,-300],"trades":["ironworkers","iuec","ibew"],"programmes":["bridge-and-structural","elevator-constructors"],"stations":["rl-critical-lift-plan-and-signalperson","ew-machine-room-lockout-and-brake-test","leading-edge-and-horizontal-lifeline"],"blurb":"The big hangar doors hung and wired: a critical lift plan, the drive locked out during adjustment, and fall protection at the header."},
    {"id":"lav-sheet-metal-shop","name":"Sheet Metal Shop","kind":"workshop","position":[1400,-150],"trades":["smart","iam"],"programmes":["aerospace-defense-and-robotics","aviation-maintenance-and-ground"],"stations":["sm-shop-layout-and-shear","sm-tig-and-spot-welding","ad-depot-tool-control-and-fod-walk"],"blurb":"Structural repairs and new parts for the conversions: the shear's guard, the welding screen and the tool count."},
    {"id":"lav-composite-shop","name":"Composite Shop","kind":"workshop","position":[1400,150],"trades":["iam","iupat"],"programmes":["aerospace-defense-and-robotics"],"stations":["ad-cleanroom-gowning-and-esd-discipline","ib-spray-foam-and-respirator-fit","ad-hazardous-fluid-servicing-with-a-buddy"],"blurb":"Composite repair: resins handled with gloves and ventilation, dust kept down, and the clean area's gowning rules."},
    {"id":"lav-avionics-wiring","name":"Avionics and Wiring Bench","kind":"workshop","position":[1150,300],"trades":["ibew","iam"],"programmes":["electrical-first-period","aviation-maintenance-and-ground"],"stations":["electrical","ad-cleanroom-gowning-and-esd-discipline","av-ground-power-and-static-bonding-before-fuel"],"blurb":"Aircraft wiring for maintenance and conversion: power off before work, static control on the bench, ground power connected safely."},
    {"id":"lav-site-utilities","name":"Site Utilities Crew","kind":"utility","position":[800,650],"trades":["liuna","ua","iuoe"],"programmes":["water-and-gas-utility-crews","heavy-equipment-operators"],"stations":["op-excavator-trench-and-utility-locate","trench-box","ut-water-main-break-emergency-shutdown-and-excavation"],"blurb":"Roads, water and drainage for the new hangars, the kinds of site work FastSites funds: locates first and every trench shored."},
    {"id":"lav-taxiway-connector","name":"Taxiway Connector","kind":"airport","position":[450,-600],"trades":["iuoe","liuna","opcmia"],"programmes":["heavy-equipment-operators","cement-masons-and-plasterers"],"stations":["op-grader-fine-grade-and-crown","op-compactor-lift-thickness-and-edge","cm-concrete-saw-cutting-with-water-and-silica-control"],"blurb":"Pavement tying the new hangars to the taxiway: grade and compaction, saw-cut joints under water for silica, and a runway escort for every crossing."},
    {"id":"lav-paint-mix-room","name":"Paint Mix Room","kind":"chemical","position":[650,-150],"trades":["iupat","teamsters"],"programmes":["hazmat-environmental"],"stations":["tdl-hazmat-labeling-and-segregation","hazmat-container-inspection","paint-sprayer"],"blurb":"Coatings mixed and stored: labels and segregation, containers inspected, and ventilation on before a lid comes off."},
    {"id":"lav-ground-support-yard","name":"Ground Support Equipment Yard","kind":"yard","position":[1450,450],"trades":["iam","teamsters"],"programmes":["aviation-maintenance-and-ground","transit-ramp"],"stations":["av-pushback-tug-and-towbar-connection","av-deicing-truck-boom-operations","op-equipment-daily-walkaround-and-fluids"],"blurb":"Tugs, lifts and ground power units maintained and checked: the walkaround before use and the tow bar connected by the book."},
    {"id":"lav-airport-fire-station","name":"Airport Fire Station","kind":"fire-station","position":[-350,1300],"trades":["iaff","naemt"],"programmes":["first-responders"],"stations":["aerial-ladder","shelter-in-place-drill","traffic-incident-management"],"blurb":"The airfield's rescue and firefighting crew: equipment checks, the response drill, and scene safety on the apron."},
    {"id":"lav-stormwater-pond","name":"Stormwater Pond Crew","kind":"stormwater","position":[900,1700],"trades":["liuna","iuoe"],"programmes":["water-and-gas-utility-crews","heavy-equipment-operators"],"stations":["stormwater-outfall","op-dozer-slope-work-and-rollover-protection","br-cold-water-immersion-and-mob-recovery"],"blurb":"The crew shaping the airfield's procedural stormwater pond: the dozer off the soft edge and a throw ring by the water."},
    {"id":"lav-laydown-yard","name":"Hangar Laydown Yard","kind":"staging","position":[1250,850],"trades":["teamsters","iuoe","ironworkers"],"programmes":["rigging-lifting","warehouse-and-logistics-automation"],"stations":["forklift-dock","crane-yard","tdl-lifting-and-ergonomics"],"blurb":"Steel, panels and doors waiting to go up: forklift lanes, dunnage under every bundle and the crane set up on firm ground."},
  ],
  landmarks: [
    {"id":"lav-project-sign","name":"a sign: the project layout is illustrative; the parish, waterways and towns are real","position":[1580,800],"kind":"sign"},
    {"id":"acadiana-regional-airport","name":"Acadiana Regional Airport","position":[850,500],"kind":"airport"},
    {"id":"main-runway-end","name":"the main runway's north end","position":[-220,-1100],"kind":"airport"},
    {"id":"new-iberia-toward","name":"toward New Iberia","position":[1900,1300],"kind":"town"},
    {"id":"cane-fields-west","name":"the cane fields","position":[-1200,0],"kind":"field"},
    {"id":"parallel-taxiway-place","name":"the parallel taxiway","position":[400,1000],"kind":"airport"},
  ],
  connectors: [
    {"id":"lc-av-airport-road-east","kind":"road","name":"The airport road toward New Iberia","from":{"parish":"la-avex-new-iberia","position":[2040,1300]},"to":{"parish":"iberia-new-iberia","position":null,"lonlat":[-91.859,30.024]},"lonlat":[-91.859,30.024],"approximate":true},
    {"id":"lc-av-cane-road-north","kind":"road","name":"A cane field road north","from":{"parish":"la-avex-new-iberia","position":[-1000,-2040]},"to":{"parish":"iberia-north","position":null,"lonlat":[-91.896,30.06]},"lonlat":[-91.896,30.06],"approximate":true},
  ],
  fieldLessons: [
    {"id":"lav-fl-slope-ramp","title":"Why Hangar Floors Slope","site":"lav-hangar-foundation","k12":"k12-slope-and-angles-on-a-ramp","station":"concrete-pour","trade":"Cement masons","tradeLine":"A finisher gives a big floor a gentle slope, so water runs to the drains instead of pooling under an aircraft.","minutes":3,"steps":["Look along the new hangar floor toward the drain line.","The floor drops a tiny amount over a long distance, a gentle slope.","Water on a slope runs downhill to the drain, so the floor stays dry and safe."],"check":{"q":"Why does a hangar floor slope gently toward drains?","options":["So water runs off instead of pooling","To make aircraft roll away","Because concrete cannot be flat"],"answer":0,"why":"A gentle slope carries water to the drains, which keeps the floor safe to walk and work on."}},
    {"id":"lav-fl-circuits","title":"Static and Fuel","site":"lav-fuel-farm","k12":"k12-circuits-at-the-electrical-bench","station":"av-ground-power-and-static-bonding-before-fuel","trade":"Aircraft fuellers","tradeLine":"A fueller clips a bonding wire on before fuel flows, because a spark from static can light fuel vapour.","minutes":3,"steps":["Watch the fueller clip a wire from the truck to the aircraft.","The wire lets static electricity flow away safely instead of jumping as a spark.","Only then does the fuel start to flow."],"check":{"q":"Why is a bonding wire clipped on before fuelling?","options":["It lets static flow away so no spark jumps","It holds the hose in place","It measures the fuel"],"answer":0,"why":"Bonding joins the two so static cannot build up and spark near fuel vapour."}},
    {"id":"lav-fl-storm-drain","title":"Where the Airfield's Rain Goes","site":"lav-stormwater-pond","k12":"k12-es-where-the-storm-drain-goes","station":"stormwater-outfall","trade":"Stormwater crews","tradeLine":"A stormwater crew keeps the pond and ditches clear, because rain off a big paved airfield has to go somewhere.","minutes":3,"steps":["Look at the paved apron and the grass ditches beside it.","Rain runs off pavement fast and flows down the ditches to the pond.","The pond holds the water and lets it out slowly, so the fields do not flood."],"check":{"q":"Why does an airfield have a stormwater pond?","options":["To hold rain from the pavement and let it out slowly","For aircraft to land on","To store fuel"],"answer":0,"why":"Pavement sheds rain fast; the pond slows it down so it does not flood the land downstream."}},
  ],
  gated: [
    {"id":"lav-gated-top-out","kind":"side-quest","title":"Topping Out the Hangar","world":"parishes","parish":"la-avex-new-iberia","site":"lav-hangar-steel","siteName":"Hangar Steel Erection","summary":"Help the ironworkers set the last roof truss on the hangar.","gate":{"stations":["steel-erector","leading-edge-and-horizontal-lifeline"],"note":"Finish steel erection and the leading-edge lifeline before the top-out"}},
    {"id":"lav-gated-paint-booth","kind":"side-quest","title":"Paint Hangar Ventilation Check","world":"parishes","parish":"la-avex-new-iberia","site":"lav-paint-hangar","siteName":"Paint Hangar","summary":"Check the paint hangar's ventilation and PPE with the painters before a shift.","gate":{"stations":["paint-sprayer","ib-spray-foam-and-respirator-fit"],"note":"Finish the paint sprayer and respirator fit stations before the shift"}},
  ],
};
