// Strip Marsh East — a Bay Program project area on the parish schema (console TIDELANDS, docs/consoles/TIDELANDS.md, docs/parishes.md). A stylised
// 4096 m map, not a survey: real places appear only by their public names as places; every coordinate is approximate
// (three decimals, `approximate: true`) and exists only to place the map. One north-up uniform scale (about 2.2 real
// metres per map metre, x east, +z south). The shoreline's shape, the channels, berms, drains and every site are
// PROCEDURAL — laid out from the place's general orientation and land use, never measured. The project here is ABAG's, as the facts file states it (tidal channels, berm lowering, sediment reuse).
// Site names and crews are procedural training places. Pure data, no imports.
export const NP_BP_STRIP_MARSH_EAST = {
  id: "bp-strip-marsh-east",
  name: "Strip Marsh East",
  region: "bay-program",
  size: 4096,
  blurb: "San Pablo Bay's northern shore along Highway Thirty-Seven: the strip of tidal marsh between the highway and the bay, its sloughs and new tidal channels, the bay-front berm being lowered, the sediment placed back on the marsh, a monitoring station and the staging yard.",
  start: "sme-staging-yard",
  anchors: [
    {"xz":[-1871,-658],"lonlat":[-122.392,38.148],"approximate":true,"name":"Highway Thirty-Seven at Sonoma Creek"},
    {"xz":[0,253],"lonlat":[-122.345,38.13],"approximate":true,"name":"Strip Marsh East"},
    {"xz":[1791,506],"lonlat":[-122.3,38.125],"approximate":true,"name":"Cullinan Ranch"},
    {"xz":[1393,-253],"lonlat":[-122.31,38.14],"approximate":true,"name":"Dutchman Slough"},
    {"xz":[-199,-1265],"lonlat":[-122.35,38.16],"approximate":true,"name":"the Napa-Sonoma Marshes"},
    {"xz":[0,1265],"lonlat":[-122.345,38.11],"approximate":true,"name":"San Pablo Bay off the strip marsh"},
  ],
  hills: [],
  water: [
    {"id":"san-pablo-bay","name":"San Pablo Bay","kind":"bay","poly":[[-2048,620],[-1300,560],[-600,640],[0,600],[600,680],[1300,620],[2048,560],[2048,2048],[-2048,2048]]},
    {"id":"strip-marsh","name":"the strip marsh","kind":"wetland","poly":[[-1790,-560],[0,-360],[1950,-150],[1950,530],[1300,590],[600,650],[0,570],[-600,610],[-1300,530],[-1790,560]]},
    {"id":"napa-sonoma-marshes","name":"the Napa-Sonoma Marshes","kind":"wetland","poly":[[-1700,-1950],[-300,-1950],[-300,-1100],[-1700,-1000]]},
    {"id":"sonoma-creek","name":"Sonoma Creek","kind":"canal","width":40,"poly":[[-1880,-2048],[-1860,-1200],[-1880,-600],[-1840,0],[-1860,500],[-1880,700]]},
    {"id":"dutchman-slough","name":"Dutchman Slough","kind":"canal","width":26,"poly":[[1650,-2048],[1600,-900],[1640,-200],[1580,300],[1600,620]]},
    {"id":"new-tidal-channel-west","name":"a new tidal channel (procedural)","kind":"canal","width":14,"poly":[[-1100,-250],[-1000,0],[-1060,300],[-980,600]]},
    {"id":"new-tidal-channel-east","name":"a second new tidal channel (procedural)","kind":"canal","width":14,"poly":[[450,-250],[520,50],[460,350],[540,640]]},
  ],
  levees: [
    {"id":"highway-37-levee","name":"the Highway Thirty-Seven levee","height":3.6,"pts":[[-1780,-610],[-1000,-500],[0,-410],[1000,-300],[1900,-210]]},
    {"id":"bay-front-berm","name":"the bay-front berm, being lowered","height":2.2,"pts":[[-1600,380],[-700,420],[0,380],[700,440],[1400,400]]},
    {"id":"sonoma-creek-levee","name":"the Sonoma Creek levee","height":2.5,"pts":[[-1790,-1100],[-1780,-700]]},
  ],
  roads: [
    {"id":"highway-37","name":"Highway Thirty-Seven","kind":"interstate","pts":[[-2048,-700],[-1000,-570],[0,-480],[1000,-370],[2048,-270]]},
    {"id":"levee-road","name":"the levee road on the berm","kind":"riverroad","pts":[[-1600,360],[-700,400],[0,360],[700,420],[1400,380]]},
    {"id":"marsh-access-road","name":"the marsh access road","kind":"street","pts":[[-400,-460],[-380,-100],[-300,350]]},
    {"id":"staging-yard-road","name":"the staging yard road","kind":"street","pts":[[800,-380],[820,-60],[900,400]]},
    {"id":"ranch-road-north","name":"the ranch road north","kind":"street","pts":[[600,-400],[640,-1200],[700,-2048]]},
  ],
  districts: [
    {"id":"strip-marsh-west","name":"the strip marsh, west","character":"wetland","poly":[[-1790,-560],[-300,-400],[-300,600],[-1790,560]]},
    {"id":"strip-marsh-east","name":"the strip marsh, east","character":"wetland","poly":[[-300,-400],[1950,-150],[1950,530],[-300,600]]},
    {"id":"napa-sonoma-marshes","name":"the Napa-Sonoma Marshes","character":"wetland","poly":[[-1700,-1950],[-300,-1950],[-300,-1100],[-1700,-1000]]},
    {"id":"north-farmland","name":"the farmland north of the highway","character":"garden","poly":[[-300,-2048],[2048,-2048],[2048,-420],[-300,-620]]},
    {"id":"sonoma-creek-bank","name":"the Sonoma Creek bank","character":"garden","poly":[[-2048,-1000],[-1700,-1000],[-1780,-620],[-2048,-700]]},
    {"id":"staging-yard","name":"the staging yard","character":"industrial","poly":[[680,-300],[1150,-250],[1150,120],[680,120]]},
  ],
  sites: [
    {"id":"sme-staging-yard","name":"Strip Marsh Staging Yard","kind":"staging","position":[950,-120],"trades":["iuoe","teamsters"],"programmes":["heavy-equipment-operators","ports-maritime-ecology","bay-restoration-maritime-underwater"],"stations":["op-equipment-daily-walkaround-and-fluids","op-loader-truck-loading-and-blind-spots","spill-boom-deploy","br-workboat-crane-lift-from-water"],"blurb":"The yard beside the highway where the marsh crew's machines start the day: the walkaround, the loading lane and the spill kit by the fuel tank."},
    {"id":"sme-tidal-channel-excavation","name":"Tidal Channel Excavation Site","kind":"wetland","position":[-900,150],"trades":["iuoe","liuna"],"programmes":["bay-restoration-maritime-underwater","marine-ecology-and-restoration","heavy-equipment-operators"],"stations":["br-tidal-marsh-grading-amphibious-excavator","me-tidal-marsh-channel-restoration-day","op-excavator-trench-and-utility-locate","br-turbidity-curtain-deployment"],"blurb":"Where a new tidal channel is dug into the marsh: the excavator on mats, the tide window and the curtain that holds the mud in place."},
    {"id":"sme-berm-lowering","name":"Berm Lowering Site","kind":"levee","position":[-1150,330],"trades":["iuoe","liuna","teamsters"],"programmes":["heavy-equipment-operators","bay-restoration-maritime-underwater"],"stations":["op-dozer-slope-work-and-rollover-protection","br-levee-inspection-and-seepage","op-loader-truck-loading-and-blind-spots","br-bird-nesting-buffer-and-work-window"],"blurb":"The bay-front berm coming down so the tide can reach the marsh: the dozer on the slope, the seepage check and the bird buffer."},
    {"id":"sme-sediment-reuse-placement","name":"Sediment Reuse Placement Area","kind":"wetland","position":[300,200],"trades":["iuoe","liuna"],"programmes":["bay-restoration-maritime-underwater","heavy-equipment-operators"],"stations":["br-dredge-material-screening-and-disposal-decision","br-dredge-spoils-dewatering-pad","op-compactor-lift-thickness-and-edge","br-native-planting-and-erosion-mats"],"blurb":"Where the dug-out mud goes back on the marsh: screening the material, the dewatering pad, thin lifts and the erosion mats on top."},
    {"id":"sme-monitoring-station","name":"Strip Marsh Monitoring Station","kind":"monitoring","position":[1200,250],"trades":["afscme","ifpte"],"programmes":["bay-restoration-maritime-underwater","hunters-point-bay-restoration"],"stations":["br-water-quality-sonde-calibration-and-deploy","marsh-transect-survey","br-drone-shoreline-survey","br-restoration-data-qa-and-public-reporting"],"blurb":"The monitoring post on the marsh: the sonde in the water, the transect line, the drone flight and the data checked before it is shared."},
    {"id":"sme-levee-road-patrol","name":"Highway Levee Patrol Point","kind":"levee","position":[-1400,-250],"trades":["liuna","afscme"],"programmes":["bay-restoration-maritime-underwater"],"stations":["br-levee-inspection-and-seepage","br-cold-water-immersion-and-mob-recovery","br-vhf-and-navigation-in-a-work-zone"],"blurb":"A pull-out on the highway levee where the patrol walks the crest, watches for seepage and keeps a throw line ready near the water."},
    {"id":"sme-slough-culvert-crew","name":"Slough Culvert Crew","kind":"utility","position":[1450,-60],"trades":["liuna","iuoe"],"programmes":["bay-restoration-maritime-underwater","hunters-point-bay-restoration"],"stations":["br-culvert-retrofit-for-fish-passage","tide-gate","br-fish-screen-maintenance"],"blurb":"The crew at the slough's culvert and tide gate: fish passage, the gate's lockout and the screen cleaned by hand."},
    {"id":"sme-native-planting-crew","name":"Marsh Edge Planting Crew","kind":"wetland","position":[-500,470],"trades":["liuna","afscme"],"programmes":["bay-restoration-maritime-underwater","hunters-point-bay-restoration"],"stations":["br-native-planting-and-erosion-mats","spartina-removal","br-intertidal-invasive-removal-by-hand-crew","living-shoreline"],"blurb":"The planting crew at the marsh edge: native plugs, erosion mats, and invasive cordgrass pulled out by hand."},
    {"id":"sme-bird-window-watch","name":"Nesting Season Watch Post","kind":"wetland","position":[-1500,100],"trades":["afscme","ifpte"],"programmes":["bay-restoration-maritime-underwater","marine-ecology-and-restoration"],"stations":["br-bird-nesting-buffer-and-work-window","me-invasive-species-identification-and-reporting","br-beach-seine-fish-survey-and-handling"],"blurb":"The biologists' post that sets the work window: nesting buffers flagged, species logged and the seine survey in the slough."},
    {"id":"sme-sediment-sampling-station","name":"Sediment Sampling Station","kind":"monitoring","position":[700,500],"trades":["ifpte","afscme"],"programmes":["bay-restoration-maritime-underwater"],"stations":["br-underwater-sediment-core-sampling","br-sediment-chain-of-custody-and-lab-prep","br-benthic-grab-and-invertebrate-sorting","br-legacy-mercury-and-pcb-hotspot-handling"],"blurb":"Where cores of marsh and bay mud are taken, labelled and sealed: the chain of custody before the sample leaves the site."},
  ],
  landmarks: [
    {"id":"sonoma-creek-mouth","name":"the mouth of Sonoma Creek","position":[-1860,640],"kind":"shore"},
    {"id":"sonoma-creek-bridge","name":"the Highway Thirty-Seven bridge over Sonoma Creek","position":[-1790,-680],"kind":"bridge"},
    {"id":"strip-marsh-east-place","name":"Strip Marsh East","position":[0,150],"kind":"marsh"},
    {"id":"san-pablo-bay-shore","name":"the San Pablo Bay shore","position":[0,590],"kind":"shore"},
    {"id":"napa-sonoma-marshes-place","name":"the Napa-Sonoma Marshes","position":[-1000,-1500],"kind":"marsh"},
    {"id":"dutchman-slough-bank","name":"the Dutchman Slough bank","position":[1540,-600],"kind":"canal"},
    {"id":"cullinan-ranch","name":"Cullinan Ranch","position":[1791,506],"kind":"marsh"},
  ],
  connectors: [
    {"id":"bp-sm-highway-37-west","kind":"road","name":"Highway Thirty-Seven west toward Sears Point","from":{"parish":"bp-strip-marsh-east","position":[-2040,-699]},"to":{"parish":"north-bay-sears-point","position":null,"lonlat":[-122.397,38.149]},"lonlat":[-122.397,38.149],"approximate":true},
    {"id":"bp-sm-highway-37-east","kind":"road","name":"Highway Thirty-Seven east toward Vallejo","from":{"parish":"bp-strip-marsh-east","position":[2040,-271]},"to":{"parish":"north-bay-vallejo","position":null,"lonlat":[-122.294,38.14]},"lonlat":[-122.294,38.14],"approximate":true},
  ],
  fieldLessons: [
    {"id":"bp-sme-fl-marsh-speed-bump","title":"A Marsh Slows the Water","site":"sme-native-planting-crew","landmark":"san-pablo-bay-shore","k12":"k12-by-wetlands-as-a-storms-speed-bump","station":"living-shoreline","trade":"Shoreline restoration crews","tradeLine":"A restoration crew plants the marsh edge, because grass and mud slow the waves before they reach the levee.","minutes":3,"steps":["Look out from the berm: grass, mud and shallow water between you and the bay.","A wave loses its push as it rolls through the plants and the shallows.","The crew plants native grasses so the marsh keeps doing that job."],"check":{"q":"What slows a wave before it reaches the levee?","options":["The marsh grass and the shallow mud","The highway","Nothing slows it"],"answer":0,"why":"Plants and shallow water take the push out of a wave."}},
    {"id":"bp-sme-fl-tide-window","title":"Working to the Tide","site":"sme-tidal-channel-excavation","landmark":"strip-marsh-east-place","k12":"k12-graphing-tide-readings-at-the-pier","station":"br-tidal-marsh-grading-amphibious-excavator","trade":"Operating engineers","tradeLine":"An operator plans the dig around the tide, so the machine is never on soft ground when the water comes back in.","minutes":3,"steps":["Watch the water in the channel rise and fall through the day.","Mark the level each hour and the marks make a wave-shaped graph.","The crew digs while the tide is out and moves the machine to its mats before it returns."],"check":{"q":"When does the excavator crew stop and move to the mats?","options":["Before the tide comes back in","Only when the machine is stuck","At lunch every day"],"answer":0,"why":"Soft marsh ground gets softer under water, so the crew plans ahead of the tide."}},
    {"id":"bp-sme-fl-levee-holds","title":"How a Levee Holds Water Back","site":"sme-levee-road-patrol","k12":"k12-by-how-a-levee-holds-water-back","station":"br-levee-inspection-and-seepage","trade":"Levee patrol crews","tradeLine":"A patrol walks the crest and looks for wet spots on the land side, because seepage is the first sign a levee needs help.","minutes":3,"steps":["Stand on the levee and look at the water on one side and the dry land on the other.","The packed earth keeps the water out, but water can slowly push through.","The patrol looks for wet or bubbling ground on the dry side and reports it at once."],"check":{"q":"What does the patrol look for on the dry side?","options":["Wet or bubbling ground","Birds","Parked cars"],"answer":0,"why":"Water seeping through shows up as wet ground on the land side."}},
  ],
  gated: [
    {"id":"bp-sme-gated-first-channel","kind":"side-quest","title":"Opening the First Channel","world":"parishes","parish":"bp-strip-marsh-east","site":"sme-tidal-channel-excavation","siteName":"Tidal Channel Excavation Site","summary":"Help the crew open a new tidal channel on a low tide.","gate":{"stations":["br-tidal-marsh-grading-amphibious-excavator","br-turbidity-curtain-deployment"],"note":"Finish the amphibious excavator and turbidity curtain stations before the dig"}},
    {"id":"bp-sme-gated-berm-down","kind":"side-quest","title":"The Berm Comes Down","world":"parishes","parish":"bp-strip-marsh-east","site":"sme-berm-lowering","siteName":"Berm Lowering Site","summary":"Lower a stretch of the bay-front berm with the dozer crew.","gate":{"stations":["op-dozer-slope-work-and-rollover-protection","br-bird-nesting-buffer-and-work-window"],"note":"Walk dozer slope work and the nesting buffer before the berm work"}},
  ],
};
