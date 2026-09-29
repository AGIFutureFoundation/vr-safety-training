// Saronic's Franklin Shipyard, St. Mary Parish — a Louisiana development site area on the parish schema (console SITES-COAST, docs/consoles/SITES-COAST.md,
// docs/parishes.md). A stylised 4096 m map, not a survey: real places appear only by their public names as places; every
// coordinate is approximate (three decimals, `approximate: true`) and exists only to place the map. One north-up uniform
// scale (x east, +z south). About one and a half real metres per map metre: Franklin on Bayou Teche (the bayou's course through town approximate), the
// town's historic streets along the bayou, the US Highway Ninety corridor to the north and cane fields around.
// THE PROJECT LAYOUT IS ILLUSTRATIVE; THE PARISH, WATERWAYS AND TOWNS ARE REAL. No site plan is published: every pad, yard,
// building and crew here is the platform's PROCEDURAL illustration. Project facts are only those of the facts file, in its
// words. The platform has no partnership with the company named; crafts are trade references, never an employer's programme.
// Written once by tools/gen_lc_sites.mjs; this module is the source afterwards. Pure data, no imports.

export const NP_LA_SARONIC_FRANKLIN = {
  id: "la-saronic-franklin",
  name: "Franklin Shipyard — Franklin on Bayou Teche",
  region: "louisiana-sites",
  size: 4096,
  scale: 1.5,
  blurb: "Franklin in St. Mary Parish on Bayou Teche, where Saronic Technologies' Franklin Shipyard is planned ($300 million; autonomous marine vessels; 300,000+ sq ft, three new slips, a large-vessel line; operations 2027, per the sources in the facts file): the bayou, the town's streets and the cane fields, with slips, a hull shop and a paint hall on the bank. The project layout is illustrative; the parish, waterways and towns are real.",
  project: {"name":"Saronic Technologies Franklin Shipyard","company":"Saronic Technologies","facts":"Franklin, St. Mary Parish (Bayou Region); $300 million; 1,500 direct new jobs; 1,770 indirect (3,270 total including indirect); autonomous marine vessels; 300,000+ sq ft, three new slips, large-vessel line; operations 2027","sources":["opportunitylouisiana.gov news","breakingdefense.com 2025-12"],"illustrative":true},
  start: "lsf-workforce-centre",
  anchors: [
    {"xz":[193,-443],"lonlat":[-91.502,29.796],"approximate":true,"name":"Franklin, the town centre"},
    {"xz":[-1868,-1330],"lonlat":[-91.534,29.808],"approximate":true,"name":"Bayou Teche upstream of Franklin"},
    {"xz":[1868,1256],"lonlat":[-91.476,29.773],"approximate":true,"name":"Bayou Teche downstream of Franklin"},
    {"xz":[322,-1774],"lonlat":[-91.5,29.814],"approximate":true,"name":"US Highway Ninety north of Franklin"},
    {"xz":[-966,1478],"lonlat":[-91.52,29.77],"approximate":true,"name":"cane fields south of the bayou"},
    {"xz":[1610,-739],"lonlat":[-91.48,29.8],"approximate":true,"name":"the east side of Franklin"},
  ],
  hills: [],
  water: [
    {"id":"bayou-teche","name":"Bayou Teche","kind":"bayou","width":34,"poly":[[-2048,-1000],[-1500,-900],[-1000,-650],[-600,-500],[-200,-300],[200,-150],[600,50],[1000,300],[1400,600],[1800,1100],[2048,1250]]},
    {"id":"drainage-canal","name":"a drainage canal (procedural)","kind":"canal","width":10,"poly":[[-1600,2048],[-1500,1200],[-1300,400],[-1150,-700]]},
    {"id":"slip-basin","name":"the new slips' basin (procedural)","kind":"canal","width":40,"poly":[[760,150],[700,520]]},
    {"id":"cane-ditch-east","name":"a cane field ditch (procedural)","kind":"canal","width":6,"poly":[[1300,2048],[1250,1300],[1300,800]]},
  ],
  levees: [
    {"id":"teche-bank-north","name":"the bayou's north bank (procedural)","height":1.5,"pts":[[-1500,-960],[-1000,-710],[-600,-560],[-200,-360]]},
    {"id":"shipyard-bank","name":"the shipyard's bayou bank (procedural)","height":1.8,"pts":[[-150,-200],[300,-40],[650,110]]},
  ],
  roads: [
    {"id":"us-highway-90","name":"US Highway Ninety","kind":"interstate","pts":[[-2048,-1500],[-1000,-1400],[0,-1760],[1000,-1650],[2048,-1250]]},
    {"id":"main-street","name":"Main Street","kind":"avenue","pts":[[-2048,-1150],[-1500,-1060],[-1000,-800],[-600,-650],[-200,-450],[200,-300],[600,-110],[1000,150],[1400,420],[2048,1000]]},
    {"id":"town-cross-street","name":"a cross street to the highway (procedural)","kind":"street","pts":[[-400,-560],[-420,-1100],[-400,-1720]]},
    {"id":"east-cross-street","name":"an east side street (procedural)","kind":"street","pts":[[400,-210],[450,-900],[500,-1700]]},
    {"id":"shipyard-road","name":"the shipyard road (procedural)","kind":"avenue","pts":[[-300,700],[300,750],[900,800],[1500,900]]},
    {"id":"bayou-bridge","name":"the shipyard's bayou bridge (procedural)","kind":"bridge","pts":[[-320,-440],[-300,-120]]},
    {"id":"shipyard-spine","name":"the shipyard spine road (procedural)","kind":"street","pts":[[-300,-120],[-300,700]]},
    {"id":"cane-road","name":"a cane field road (procedural)","kind":"street","pts":[[-300,700],[-800,1300],[-1000,2048]]},
  ],
  districts: [
    {"id":"franklin-historic","name":"Franklin's historic streets","character":"quarter","poly":[[-1500,-1400],[300,-1400],[300,-550],[-200,-420],[-1000,-760],[-1500,-1000]]},
    {"id":"franklin-east","name":"Franklin's east side","character":"suburb","poly":[[300,-1500],[2048,-1150],[2048,950],[1400,380],[300,-250]]},
    {"id":"franklin-north","name":"the highway corridor","character":"suburb","poly":[[-2048,-2048],[2048,-2048],[2048,-1400],[-2048,-1350]]},
    {"id":"shipyard","name":"the shipyard (illustrative)","character":"port","poly":[[-600,-200],[1350,560],[1500,1150],[-600,1150]]},
    {"id":"cane-west","name":"cane fields west of the bayou","character":"garden","poly":[[-2048,-950],[-1200,-700],[-700,0],[-700,2048],[-2048,2048]]},
    {"id":"cane-south","name":"cane fields south of the shipyard","character":"garden","poly":[[-600,1200],[2048,1200],[2048,2048],[-600,2048]]},
  ],
  sites: [
    {"id":"lsf-workforce-centre","name":"Franklin Shipyard Workforce Centre","kind":"school","position":[-700,-1000],"trades":["ibb","ironworkers","iupat"],"programmes":["job-readiness-edition","insulators-and-boilermakers","port-operations"],"stations":["jobsite-orientation-and-osha-10","wp-apprenticeship-enrollment-day","apprenticeship-standards-reading","apprenticeship-application-and-test"],"blurb":"A training room in town for the kinds of shipyard work the project names: orientation, the trades' apprenticeship standards and a first look at the yard's hazards. A trade reference, not an employer's hiring office."},
    {"id":"lsf-new-slip-build","name":"New Slip Build","kind":"slip","position":[900,450],"trades":["iuoe","liuna","carpenters"],"programmes":["heavy-equipment-operators","builders-trades","bridge-and-structural"],"stations":["op-pile-driving-rig-and-lead-setup","concrete-pour","trench-box","br-turbidity-curtain-deployment"],"blurb":"One of the three new slips the facts file names, being built on the bank: piles driven from the lead, forms poured and the curtain around the in-water work."},
    {"id":"lsf-hull-fabrication","name":"Hull Fabrication Hall","kind":"shipyard","position":[250,350],"trades":["ibb","ironworkers","usw"],"programmes":["insulators-and-boilermakers","bridge-and-structural"],"stations":["shipyard-hotwork","welding","ib-pressure-vessel-confined-entry-and-hot-work","rl-critical-lift-plan-and-signalperson"],"blurb":"Hull blocks welded under a hot-work permit: the fire watch posted, fumes pulled away, and nobody inside a tank until the air is tested."},
    {"id":"lsf-marine-electrical","name":"Marine Electrical Shop","kind":"workshop","position":[0,850],"trades":["ibew","iuec"],"programmes":["electrical-first-period","yacht-and-charter-crew"],"stations":["electrical","yc-shore-power-connection-and-in-water-electrical-safety","arc-flash-label-study"],"blurb":"Wiring vessels for autonomous operation (the facts file names autonomous marine vessels): circuits dead before touch, shore power connected safely, the arc-flash label read."},
    {"id":"lsf-launch-and-test","name":"Launch and Test Berth","kind":"port","position":[1250,700],"trades":["ibu","ila","iuoe"],"programmes":["port-operations","yacht-and-charter-crew"],"stations":["mw-workboat-towing-and-line-handling","yc-man-overboard-recovery-drill","br-vhf-and-navigation-in-a-work-zone","br-cold-water-immersion-and-mob-recovery"],"blurb":"Where a finished vessel goes into Bayou Teche for testing: lines handled, a float coat on anyone at the edge and the radio used for traffic on the bayou."},
    {"id":"lsf-blast-and-paint","name":"Blast and Paint Hall","kind":"paint-shop","position":[-350,1000],"trades":["iupat","liuna"],"programmes":["hazmat-environmental","bridge-and-structural"],"stations":["bridge-blast","paint-sprayer","tank-lining","ib-spray-foam-and-respirator-fit"],"blurb":"Hulls blasted and coated inside an enclosed hall: supplied-air hoods, the respirator fit test and the containment that keeps grit and overspray in."},
    {"id":"lsf-large-vessel-line","name":"Large-Vessel Line","kind":"shipyard","position":[600,950],"trades":["ibb","ironworkers","iuoe"],"programmes":["insulators-and-boilermakers","rigging-lifting"],"stations":["op-crawler-crane-assembly-and-load-chart","bs-tandem-lift-girder-set","shipyard-hotwork","leading-edge-and-horizontal-lifeline"],"blurb":"The large-vessel line the facts file names: blocks lifted in tandem to the load chart, and a lifeline for anyone working at a hull's edge."},
    {"id":"lsf-steel-receiving-yard","name":"Steel Receiving Yard","kind":"staging","position":[-100,200],"trades":["teamsters","iuoe","ironworkers"],"programmes":["warehouse-and-logistics-automation","rigging-lifting"],"stations":["forklift-dock","crane-yard","tdl-lifting-and-ergonomics"],"blurb":"Plate and shapes arrive by truck: the forklift lanes, the crane's set-up and the tag lines on every lift."},
    {"id":"lsf-plate-cutting-shop","name":"Plate Cutting Shop","kind":"workshop","position":[150,-80],"trades":["ibb","smart"],"programmes":["insulators-and-boilermakers"],"stations":["sm-plasma-table-and-fume","sm-shop-layout-and-shear","welding"],"blurb":"The plasma table cutting hull plate: fume extraction on, guards in place and layout checked before the shear."},
    {"id":"lsf-outfitting-pier","name":"Outfitting Pier","kind":"landing","position":[1550,1000],"trades":["ua","ibew","ibb"],"programmes":["plumbers-and-pipefitters","electrical-first-period"],"stations":["vessel-gangway-and-hatch-cover-safety","confined-rescue","electrical"],"blurb":"Vessels alongside for outfitting: the gangway rigged, a rescue plan for every tank entry and the power cables kept off the walkway."},
    {"id":"lsf-crane-rail","name":"Yard Crane Rail","kind":"construction","position":[450,650],"trades":["ironworkers","iuoe"],"programmes":["bridge-and-structural","rigging-lifting"],"stations":["steel-erector","dock-crane","rl-critical-lift-plan-and-signalperson"],"blurb":"The rail for the yard's gantry crane being set: steel erected, the rail aligned and one signalperson on every lift."},
    {"id":"lsf-bulkhead-piling","name":"Bulkhead Piling","kind":"shoreline","position":[-200,-40],"trades":["iuoe","carpenters","liuna"],"programmes":["heavy-equipment-operators","bridge-and-structural"],"stations":["op-pile-driving-rig-and-lead-setup","gg-pile-driver-fender-repair","br-cold-water-immersion-and-mob-recovery"],"blurb":"Sheet pile going in along the bayou bank: the lead set plumb, the hammer's zone kept clear and a throw ring at the edge."},
    {"id":"lsf-tool-crib","name":"Tool Crib","kind":"warehouse","position":[-500,450],"trades":["iam","ibb"],"programmes":["aerospace-defense-and-robotics","insulators-and-boilermakers"],"stations":["av-borescope-and-tool-control-inventory","ad-depot-tool-control-and-fod-walk"],"blurb":"Tools signed out and back: shadow boards, the inventory at shift end and nothing left inside a hull."},
    {"id":"lsf-first-aid-station","name":"Shipyard First Aid Station","kind":"clinic","position":[-550,150],"trades":["naemt","iaff"],"programmes":["first-responders"],"stations":["psychological-first-aid","confined-rescue","md-location-shoot-traffic-control-and-heat-hydration"],"blurb":"The yard's medic: heat and hydration in the halls, the confined-space rescue team's kit and the first calm conversation after an incident."},
    {"id":"lsf-machine-shop","name":"Machine Shop","kind":"workshop","position":[-200,600],"trades":["iam","usw"],"programmes":["aerospace-defense-and-robotics"],"stations":["ad-robot-cell-lockout-and-safe-reentry","ad-cobot-risk-assessment-and-speed-separation","sm-shop-layout-and-shear"],"blurb":"The shop turning shafts and fittings: machine guards on, lockout before reaching in, and the robot cell's gate respected."},
    {"id":"lsf-site-utilities","name":"Site Utilities Crew","kind":"utility","position":[1100,1150],"trades":["liuna","ua","ibew"],"programmes":["water-and-gas-utility-crews","plumbers-and-pipefitters"],"stations":["op-excavator-trench-and-utility-locate","trench-box","ut-pe-pipe-fusion-and-squeeze-off"],"blurb":"Water, power and drainage run to the new halls: locates first, the trench shored and pipe fused on the bank."},
    {"id":"lsf-security-gate","name":"Shipyard Gate","kind":"civic","position":[-800,700],"trades":["seiu","teamsters"],"programmes":["situational-awareness","warehouse-and-logistics-automation"],"stations":["haul-route-observation","traffic-incident-management","forklift-dock"],"blurb":"The gate where trucks and people come in: separate lanes, the visitors' briefing and eyes on the haul route."},
  ],
  landmarks: [
    {"id":"lsf-project-sign","name":"a sign: the project layout is illustrative; the parish, waterways and towns are real","position":[-450,-300],"kind":"sign"},
    {"id":"franklin-town","name":"Franklin","position":[193,-743],"kind":"town"},
    {"id":"bayou-teche-bank","name":"Bayou Teche","position":[-600,-420],"kind":"canal"},
    {"id":"main-street-place","name":"Main Street, Franklin","position":[-900,-900],"kind":"street"},
    {"id":"cane-fields","name":"the cane fields","position":[-1500,600],"kind":"field"},
    {"id":"highway-90-corridor","name":"US Highway Ninety","position":[500,-1850],"kind":"road"},
  ],
  connectors: [
    {"id":"lc-sf-highway-90-west","kind":"road","name":"US Highway Ninety west toward Baldwin","from":{"parish":"la-saronic-franklin","position":[-2040,-1500]},"to":{"parish":"st-mary-baldwin","position":null,"lonlat":[-91.537,29.81]},"lonlat":[-91.537,29.81],"approximate":true},
    {"id":"lc-sf-highway-90-east","kind":"road","name":"US Highway Ninety east toward Centerville","from":{"parish":"la-saronic-franklin","position":[2040,-1250]},"to":{"parish":"st-mary-centerville","position":null,"lonlat":[-91.473,29.807]},"lonlat":[-91.473,29.807],"approximate":true},
  ],
  fieldLessons: [
    {"id":"lsf-fl-simple-machines","title":"Lifting a Hull Block","site":"lsf-large-vessel-line","k12":"k12-simple-machines-at-a-crane","station":"rl-critical-lift-plan-and-signalperson","trade":"Riggers and crane operators","tradeLine":"A rigging crew plans every big lift, because pulleys and a long boom trade distance for force.","minutes":3,"steps":["Watch the crane lift a steel block onto the line.","The rope runs over pulleys, so the drum pulls a long way to lift a heavy load a short way.","One signalperson guides the operator so everyone knows who is in charge of the lift."],"check":{"q":"Why does one signalperson guide a big crane lift?","options":["So the operator gets one clear set of signals","Because signals are fun","So the crane goes faster"],"answer":0,"why":"One signalperson means no mixed signals, so the operator always knows what to do."}},
    {"id":"lsf-fl-circuits","title":"Wiring a Boat","site":"lsf-marine-electrical","k12":"k12-circuits-at-the-electrical-bench","station":"electrical","trade":"Marine electricians","tradeLine":"A marine electrician switches a circuit off and tests it before touching, because water and electricity do not mix.","minutes":3,"steps":["Look at the panel: each switch feeds one circuit on the boat.","Electricity flows in a loop, and opening the switch breaks the loop.","The electrician switches off, locks it and tests it dead before working."],"check":{"q":"What does an electrician do before touching a circuit?","options":["Switch it off, lock it and test it dead","Touch it quickly","Ask the boat's owner"],"answer":0,"why":"Opening, locking and testing the circuit proves it is safe before anyone touches it."}},
    {"id":"lsf-fl-levee-bank","title":"Holding the Bayou Bank","site":"lsf-bulkhead-piling","landmark":"bayou-teche-bank","k12":"k12-by-how-a-levee-holds-water-back","station":"op-pile-driving-rig-and-lead-setup","trade":"Pile drivers","tradeLine":"A pile crew drives sheet pile along the bank, because a wall of steel holds the soil back from the water.","minutes":3,"steps":["Stand on the bank and look at the water on one side and the yard on the other.","Soil wants to slide toward the water, and water can push through loose soil.","The crew drives interlocking steel sheets so the bank stays put."],"check":{"q":"Why does a crew drive sheet pile along a bayou bank?","options":["To hold the soil back from the water","To make the bayou deeper","To keep fish out"],"answer":0,"why":"A sheet pile wall holds the bank in place so the yard does not slide into the water."}},
  ],
  gated: [
    {"id":"lsf-gated-first-launch","kind":"side-quest","title":"The First Launch","world":"parishes","parish":"la-saronic-franklin","site":"lsf-launch-and-test","siteName":"Launch and Test Berth","summary":"Help the berth crew put a finished vessel into the bayou.","gate":{"stations":["mw-workboat-towing-and-line-handling","br-cold-water-immersion-and-mob-recovery"],"note":"Walk line handling and cold-water recovery before the launch"}},
    {"id":"lsf-gated-hull-block","kind":"side-quest","title":"The Hull Block Weld","world":"parishes","parish":"la-saronic-franklin","site":"lsf-hull-fabrication","siteName":"Hull Fabrication Hall","summary":"Stand fire watch while the crew welds a hull block.","gate":{"stations":["shipyard-hotwork","welding"],"note":"Finish shipyard hot work and welding before the block weld"}},
  ],
};
