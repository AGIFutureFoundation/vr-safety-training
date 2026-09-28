// SECONDLINE — play across the five New Orleans parishes (docs/consoles/SECONDLINE.md,
// docs/parish-play.md). One data module, keyed by parish id and site id exactly as
// the Crescent brief's shared parish schema names them, that PARISH's engine, GRIOT's
// characters, the treasure layer and the checkers all read:
//
//   SL_PARISHES        the five parishes, each with its sites (existing catalog stations by trade)
//   SL_CONNECTORS      the crossings the main arc uses (resolved by kind and the two parishes)
//   SL_MAIN_QUESTS     the storm-season readiness arc, seven chained quests over the connectors
//   SL_SIDE_GAMES      skill-gated side games in the shared side-game contract (SL_GATED for check_gates)
//   SL_FIELD_LESSONS   K-12 field lessons on the Redwood shape, tied to a classroom station and a trade
//   SL_HANDOFFS        NPC hand-offs a GRIOT character can make (station, lesson, game, treasure hint)
//   slPathBoard()      the "choose your path" board at every parish gate: trade, classroom, or just play
//
// Facts rule for New Orleans: real places appear only by public name, as places. Nothing here
// states a date, a statistic, a population, an address or a business, and nothing here carries
// a coordinate — positions live in PARISH's and DELTA's np-data-<parish>.js. A site is bound by
// id first and, failing that, by `match` against the data module's id, name and kind, so the
// parallel consoles' ids merge additively. Every top-level name is prefixed `sl`/`SL_`
// (tools/bundle_webxr.py concatenates modules into one scope). No three.js in this module.

import { lkStationLink } from "./links.js";
import { qmSnapshot, qmIsOpen, qmMissing } from "./skill-gates.js";

export const SL_WORLD = "parishes";
export const SL_PAGE = "parishes.html";

// ------------------------------------------------------------------ the parishes and their sites

const slSite = (id, name, kind, match, trades, stations, giver) => ({ id, name, kind, match, trades, stations, giver });

export const SL_PARISHES = [
  { id: "orleans", name: "Orleans Parish", short: "Orleans", sites: [
    slSite("port-terminal", "Port Terminal", "port", "port|terminal|wharf", ["ila", "ilwu", "iuoe"],
      ["dock-crane", "container-lashing", "mooring-line", "pt-stormwater-at-the-terminal", "vessel-gangway-and-hatch-cover-safety"], "the terminal superintendent"),
    slSite("levee-crew", "Levee and Floodwall Crew", "levee", "levee|floodwall", ["liuna", "iuoe"],
      ["br-levee-inspection-and-seepage", "op-dozer-slope-work-and-rollover-protection", "op-compactor-lift-thickness-and-edge", "op-excavator-trench-and-utility-locate"], "the levee inspector"),
    slSite("pumping-station", "Pumping Station", "pump-station", "pump", ["iuoe", "uwua", "liuna"],
      ["cs-ventilation-and-air-monitoring-plan", "ut-night-storm-response-crew-and-portable-generator", "pump-and-treat", "manhole-entry-and-atmospheric-monitoring"], "the pump station operator"),
    slSite("streetcar-barn", "Streetcar Barn", "transit-barn", "streetcar|barn|transit", ["atu", "ibew"],
      ["bus-depot-lift", "signal-cabinet", "tr-wheelchair-lift-and-securement-on-a-bus", "bus-yard-fuelling-and-brake-check"], "the barn foreman"),
    slSite("rail-yard", "Rail Yard", "rail-yard", "rail", ["smart-td", "blet", "bmwed"],
      ["ra-blue-flag-protection-in-the-yard", "ra-hand-brake-and-securement-on-a-grade", "track-access"], "the yardmaster"),
    slSite("hospital-district", "Hospital District", "hospital", "hospital|medical", ["seiu", "nnu", "afscme"],
      ["hc-code-response-support-and-crash-cart-check", "hc-patient-transport-and-safe-handling", "hc-environmental-services-isolation-room-turnover", "triage-point"], "the charge nurse"),
    slSite("university-campus", "University Campus", "campus", "universit|campus|college", ["aft", "seiu", "afscme"],
      ["br-restoration-data-qa-and-public-reporting", "who-risk-communication-and-community-engagement", "cafeteria-serving"], "the lab technician"),
    slSite("stadium-district", "Stadium District", "stadium", "stadium|arena|dome", ["iatse", "unite-here", "seiu"],
      ["rigging-loft", "stage-load-in-and-truss-rigging", "le-crowd-barricade-and-show-stop-call", "stage-power", "le-followspot-and-truss-access-at-height"], "the head rigger"),
    slSite("hospitality-row", "Hospitality Row", "hospitality", "hospitality|hotel|kitchen|restaurant", ["unite-here"],
      ["housekeeping-room-turn", "banquet-setup-lift", "knife-skills", "allergen-control", "kitchen-gas-shutoff", "hw-housekeeping-cart-and-chemical-safety"], "the kitchen shift lead"),
    slSite("wetlands-restoration", "Wetlands Restoration Site", "wetland", "wetland|marsh|bayou|restoration", ["liuna", "iuoe"],
      ["marsh-transect-survey", "br-native-planting-and-erosion-mats", "tide-gate", "br-tidal-marsh-grading-amphibious-excavator"], "the restoration crew lead"),
  ] },
  { id: "jefferson", name: "Jefferson Parish", short: "Jefferson", sites: [
    slSite("airport-ground-ops", "Airport Ground Operations", "airport", "airport|ramp|apron", ["iam", "twu"],
      ["airport-ramp", "av-marshalling-and-wingwalker-signals", "av-pushback-tug-and-towbar-connection", "av-ground-power-and-static-bonding-before-fuel", "av-baggage-belt-loader-and-hold-loading"], "the ramp lead"),
    slSite("drainage-canal-pumps", "Drainage Canal Pump Station", "pump-station", "pump|drainage|canal", ["iuoe", "uwua"],
      ["stormwater-outfall", "cs-non-entry-retrieval-and-tripod", "ut-water-main-break-emergency-shutdown-and-excavation", "bioswale-build"], "the drainage operator"),
    slSite("river-bridge-crew", "River Bridge Maintenance Crew", "bridge", "bridge", ["ironworkers", "iupat", "liuna"],
      ["bridge-cable-inspection", "deck-joint-replacement", "gg-fog-and-wind-work-stop", "bs-bearing-replacement-and-jacking"], "the bridge deck foreman"),
    slSite("westbank-shipyard", "West Bank Shipyard", "shipyard", "shipyard|west ?bank|dry ?dock", ["ibb", "usw", "carpenters"],
      ["ib-pressure-vessel-confined-entry-and-hot-work", "gg-pile-driver-fender-repair", "mw-hull-inspection-and-cleaning-dive", "creosote-pile-removal"], "the shipyard fire watch"),
    slSite("suburban-transit-depot", "Transit Depot", "transit-depot", "transit|bus|depot", ["atu", "iam"],
      ["bus-yard-fuelling-and-brake-check", "bus-depot-lift", "tr-wheelchair-lift-and-securement-on-a-bus"], "the depot road supervisor"),
    slSite("wholesale-warehouse", "Wholesale Warehouse", "warehouse", "warehouse|distribution|logistics", ["teamsters", "ufcw"],
      ["tdl-pallet-jack-and-racking", "tdl-trailer-loading-and-dock-plate", "tdl-pick-pack-and-scan", "tdl-lifting-and-ergonomics"], "the dock supervisor"),
    slSite("hospital-campus", "Hospital Campus", "hospital", "hospital|medical", ["seiu", "nnu"],
      ["hc-workplace-violence-deescalation-at-the-desk", "hc-dietary-tray-line-and-allergy-flags", "hc-linen-and-regulated-waste-handling", "hc-sterile-processing-decontamination-and-assembly"], "the unit clerk"),
    slSite("lakefront-levee", "Lakefront Levee Reach", "levee", "levee|lakefront|lake ?shore", ["liuna", "iuoe"],
      ["br-levee-inspection-and-seepage", "op-grader-fine-grade-and-crown", "op-loader-truck-loading-and-blind-spots"], "the levee patrol lead"),
  ] },
  { id: "st-bernard", name: "St. Bernard Parish", short: "St. Bernard", sites: [
    slSite("river-road-terminal", "River Road Bulk Terminal", "port", "terminal|port|wharf|dock", ["ila", "ilwu", "iuoe"],
      ["mooring-line", "bunkering-watch", "mw-oil-transfer-watch-and-boom", "pt-dock-fender-and-bollard-inspection"], "the person in charge of the transfer"),
    slSite("refinery-corridor", "Refinery Corridor", "refinery", "refin|process|chemical", ["usw", "ua", "ibb"],
      ["spill-boom-deploy", "shelter-in-place-drill", "decon-support-laborer", "ut-pe-pipe-fusion-and-squeeze-off"], "the process operator"),
    slSite("battlefield-park", "Battlefield Park", "park", "battlefield|park", ["afscme", "nage"],
      ["gk-chainsaw-start-and-limbing-on-the-ground", "pm-playground-and-courtyard", "br-drone-shoreline-survey"], "the park ranger"),
    slSite("wetlands-crew", "Wetlands Crew Landing", "wetland", "wetland|marsh|bayou", ["liuna", "iuoe", "ibu"],
      ["me-tidal-marsh-channel-restoration-day", "br-turbidity-curtain-deployment", "dredge-barge", "sediment-cap"], "the dredge deck lead"),
    slSite("floodgate-station", "Floodgate and Structure Crew", "floodgate", "flood ?gate|structure|gate", ["iuoe", "liuna"],
      ["tide-gate", "br-fish-screen-maintenance", "br-culvert-retrofit-for-fish-passage", "valve-vault"], "the gate operator"),
    slSite("fire-station", "Parish Fire Station", "fire-station", "fire", ["iaff", "naemt"],
      ["ambulance-scene-safety", "triage-point", "traffic-incident-management", "shelter-intake-operations"], "the station captain"),
    slSite("fishing-harbour", "Fishing Harbour", "harbour", "harbou?r|marina|fish|oyster|shrimp", ["ibu", "siu"],
      ["oyster-reef-monitoring", "br-beach-seine-fish-survey-and-handling", "yc-fuel-dock-transfer-and-spill-kit", "br-cold-water-immersion-and-mob-recovery"], "the harbour master"),
    slSite("school-campus", "School Campus", "campus", "school|campus", ["aft", "seiu"],
      ["cafeteria-serving", "who-risk-communication-and-community-engagement", "school-screening-outreach"], "the school nurse"),
  ] },
  { id: "plaquemines", name: "Plaquemines Parish", short: "Plaquemines", sites: [
    slSite("river-road-south", "River Road South Depot", "depot", "river ?road|depot|truck", ["teamsters"],
      ["tdl-pretrip-inspection", "tdl-cargo-securement-and-hours", "tdl-air-brake-test", "drive-night-fog-and-rail-crossing"], "the dispatcher"),
    slSite("marine-terminal", "Marine Terminal", "port", "marine|terminal|port", ["ila", "iuoe", "ibu"],
      ["br-workboat-crane-lift-from-water", "container-lashing", "mw-workboat-towing-and-line-handling", "straddle-carrier-ops"], "the crane barge master"),
    slSite("ferry-landing", "Ferry Landing", "ferry", "ferry", ["ibu", "meba", "siu"],
      ["mw-ferry-deckhand-and-passenger-safety", "yc-pre-departure-safety-briefing-and-guest-count", "mooring-line"], "the ferry mate"),
    slSite("pilot-station", "Pilot Station", "pilot", "pilot", ["mmp", "amo", "meba"],
      ["pilot-transfer", "br-vhf-and-navigation-in-a-work-zone", "yc-engine-room-pre-start-and-bilge-check"], "the pilot boat operator"),
    slSite("coastal-restoration", "Coastal Restoration Site", "wetland", "coast|restoration|marsh|delta", ["liuna", "iuoe"],
      ["br-tidal-marsh-grading-amphibious-excavator", "br-bird-nesting-buffer-and-work-window", "br-native-planting-and-erosion-mats", "br-dredge-material-screening-and-disposal-decision"], "the wildlife compliance biologist"),
    slSite("delta-boat-launch", "Delta Boat Launch", "harbour", "launch|harbou?r|marina|boat", ["ibu", "siu"],
      ["yc-tender-launch-and-guest-transfer", "br-boom-towing-between-two-vessels", "yc-man-overboard-recovery-drill"], "the launch skipper"),
    slSite("oil-and-gas-dock", "Oil and Gas Service Dock", "dock", "oil|gas|service dock|supply", ["usw", "ibb", "ua"],
      ["bunkering-watch", "mw-oil-transfer-watch-and-boom", "ballast-water-sampling", "ib-pressure-vessel-confined-entry-and-hot-work"], "the dock tankerman"),
    slSite("last-road-end", "End of the Road Ranger Post", "ranger", "end of the road|last road|ranger|road.?s end", ["afscme", "nage"],
      ["br-shoreline-cleanup-sharps-and-hazardous-debris", "me-shoreline-debris-and-microplastics-survey", "br-volunteer-cleanup-day-safety-lead"], "the ranger"),
  ] },
  { id: "st-tammany", name: "St. Tammany Parish", short: "St. Tammany", sites: [
    slSite("causeway-north-landing", "Causeway North Landing", "causeway", "causeway", ["ironworkers", "iupat", "liuna"],
      ["gg-fog-and-wind-work-stop", "gg-deck-lane-closure-and-traveller", "bridge-cable-inspection", "bs-structural-bolting-and-torque"], "the causeway crew foreman"),
    slSite("north-shore-rail-yard", "North Shore Rail Yard", "rail-yard", "rail|slidell", ["smart-td", "blet", "bmwed"],
      ["ra-switch-inspection-and-lubrication", "ra-roadway-worker-protection-and-job-briefing", "track-access"], "the switch foreman"),
    slSite("lakefront-promenade", "Lakefront Promenade", "lakefront", "lakefront|mandeville|promenade|shore", ["afscme", "liuna"],
      ["me-shoreline-debris-and-microplastics-survey", "br-volunteer-cleanup-day-safety-lead", "gk-chainsaw-start-and-limbing-on-the-ground"], "the grounds crew lead"),
    slSite("trades-campus", "Trades Training Campus", "campus", "trades|training|campus|covington", ["nabtu", "carpenters", "ibew"],
      ["union-hall-and-dispatch", "leading-edge-and-horizontal-lifeline", "fp-anchor-selection-and-rescue-plan", "mass-timber-panel-set"], "the apprenticeship coordinator"),
    slSite("piney-woods-fire-station", "Piney Woods Fire Station", "fire-station", "fire|piney|woods", ["iaff"],
      ["or-wildland-fireline-construction-and-lookout", "wildland-urban-interface", "firefighter-rehab-sector"], "the wildland crew boss"),
    slSite("north-shore-hospital", "North Shore Hospital", "hospital", "hospital|medical", ["seiu", "nnu"],
      ["hc-patient-transport-and-safe-handling", "hc-code-response-support-and-crash-cart-check", "hc-hazardous-drug-spill-kit-response"], "the transport team lead"),
    slSite("staging-yard", "Storm Staging Yard", "staging", "staging|yard|laydown", ["teamsters", "ibew", "liuna", "uwua"],
      ["line-truck", "ut-night-storm-response-crew-and-portable-generator", "tdl-trailer-loading-and-dock-plate", "shelter-intake-operations", "battery-storage-container-commissioning"], "the staging yard boss"),
    slSite("interstate-work-zone", "Interstate Work Zone", "work-zone", "interstate|work ?zone|highway", ["liuna", "iuoe", "opcmia"],
      ["traffic-incident-management", "cm-concrete-saw-cutting-with-water-and-silica-control", "op-compactor-lift-thickness-and-edge", "deck-joint-replacement"], "the traffic control supervisor"),
  ] },
];

/** The crossings the arc uses. Bound to a parish data module's `connectors` by kind and the two parishes (either direction). */
export const SL_CONNECTORS = [
  { id: "river-bridge-orleans-jefferson", kind: "bridge", from: "orleans", to: "jefferson", name: "the river bridge" },
  { id: "road-orleans-st-bernard", kind: "road", from: "orleans", to: "st-bernard", name: "the river road" },
  { id: "river-road-st-bernard-plaquemines", kind: "road", from: "st-bernard", to: "plaquemines", name: "the river road south" },
  { id: "ferry-plaquemines-river", kind: "ferry", from: "plaquemines", to: "plaquemines", name: "the river ferry" },
  { id: "causeway-jefferson-st-tammany", kind: "causeway", from: "jefferson", to: "st-tammany", name: "the causeway" },
  { id: "interstate-orleans-st-tammany", kind: "bridge", from: "orleans", to: "st-tammany", name: "the lake bridge" },
];

// ------------------------------------------------------------------ lookups

export function slParish(id) { return SL_PARISHES.find((p) => p.id === id) ?? null; }
export function slSiteDef(parishId, siteId) { return slParish(parishId)?.sites.find((s) => s.id === siteId) ?? null; }
export function slSiteName(parishId, siteId) { return slSiteDef(parishId, siteId)?.name ?? String(siteId ?? "").replace(/-/g, " "); }
export const SL_PARISH_IDS = SL_PARISHES.map((p) => p.id);

/**
 * Bind an SL site to a parish data module's site (np-data-<parish>.js `sites`):
 * the same id first, else the first data site whose id, name or kind matches
 * the SL site's `match` pattern. Returns the data site or null.
 */
export function slResolveSite(parishData, siteId) {
  const sites = parishData?.sites ?? [];
  const exact = sites.find((s) => s.id === siteId);
  if (exact) return exact;
  const def = slSiteDef(parishData?.id, siteId) ?? SL_PARISHES.flatMap((p) => p.sites).find((s) => s.id === siteId);
  if (!def) return null;
  const re = new RegExp(def.match, "i");
  return sites.find((s) => re.test(`${s.id} ${s.name ?? ""} ${s.kind ?? ""}`)) ?? null;
}

/** Bind an SL connector to a data module's connector: same id, else same kind joining the same two parishes (either way round). */
export function slResolveConnector(connectors, id) {
  const def = SL_CONNECTORS.find((c) => c.id === id);
  const list = connectors ?? [];
  return list.find((c) => c.id === id) ?? (def ? list.find((c) => c.kind === def.kind &&
    ((c.from?.parish === def.from && c.to?.parish === def.to) || (c.from?.parish === def.to && c.to?.parish === def.from))) ?? null : null);
}

/**
 * The treasure layer's position resolver for a parish (docs/treasures.md): a
 * parish treasure's trigger is `{ world: "parishes", parish, site, dx, dz, r }`
 * and its position is the bound site's position plus the offset. Hand it to
 * `tzWatchWorld("parishes", { …, at: slTreasureAt(parishData) })`. Returns null
 * for a trigger in another parish or at an unbound site (no marker is planted).
 */
export function slTreasureAt(parishData) {
  return (trigger) => {
    if (!trigger || trigger.parish !== parishData?.id) return null;
    const site = slResolveSite(parishData, trigger.site);
    if (!site || !Array.isArray(site.position)) return null;
    return [site.position[0] + (trigger.dx ?? 0), site.position[1] + (trigger.dz ?? 0)];
  };
}

// ------------------------------------------------------------------ field lessons (Redwood shape + parish + station)
//
// Every lesson teaches one classroom idea at a parish site, says which trade uses it and
// opens both the K-12 station (`k12`) and the trade station (`station`). Short sentences,
// no digit, no fact about the place — the idea is the lesson.

const slFl = (id, parish, site, k12, station, trade, tradeLine, title, minutes, steps, q, options, answer, why) =>
  ({ id: `sl-fl-${id}`, parish, site, k12, station, trade, tradeLine, title, minutes, steps, check: { q, options, answer, why } });

export const SL_FIELD_LESSONS = [
  // Orleans
  slFl("levee-ramp", "orleans", "levee-crew", "k12-slope-and-angles-on-a-ramp", "br-levee-inspection-and-seepage", "Levee inspection crew",
    "A levee inspector reads the slope of the bank the way a maths class reads a ramp: rise over run.", "A Levee Is a Long Ramp", 3,
    ["A levee is a long, low hill made to hold water back.", "Its side is a slope: it rises a little for every step you walk in.", "The crew checks that slope on every walk, because a slope that changes may be a slope that is moving."],
    "What does the levee crew look at on a walk?", ["Whether the slope has changed", "How green the grass is"], 0, "A change in the slope can mean the bank is moving."),
  slFl("pump-water-cycle", "orleans", "pumping-station", "k12-water-cycle-and-filtration", "cs-ventilation-and-air-monitoring-plan", "Pump station crew",
    "The pump station crew moves the rain that fell on the streets up and over the levee, back into the water cycle.", "Where the Rain Goes", 3,
    ["Rain falls on roofs and streets and runs into drains.", "In low ground the water cannot run downhill to the river by itself.", "Pumps lift it up and over the levee, so the water cycle keeps turning."],
    "Why does this water need a pump?", ["The ground is lower than the river", "The rain is too cold"], 0, "Water only runs downhill; low ground needs a lift."),
  slFl("wharf-pulleys", "orleans", "port-terminal", "k12-simple-machines-at-a-crane", "dock-crane", "Container crane operator",
    "A crane operator trusts the pulleys and the load chart, never a guess about what the crane can lift.", "Pulleys on the Wharf", 3,
    ["A pulley changes the direction of a pull and can share a load across several ropes.", "A crane stacks pulleys so a small motor can lift a heavy box.", "The operator still reads the load chart, because a pulley shares weight but does not remove it."],
    "What does a pulley do for the crane?", ["Shares the load across ropes", "Makes the box weigh nothing"], 0, "Pulleys spread a load; they do not make it disappear."),
  slFl("barn-circuit", "orleans", "streetcar-barn", "k12-circuits-at-the-electrical-bench", "bus-depot-lift", "Transit technician",
    "A transit technician treats every wire in the barn as live until the circuit is open, locked and tested.", "A Circuit Under the Wire", 3,
    ["A circuit is a loop: power goes out along one path and comes back along another.", "Break the loop anywhere and the power stops flowing.", "The technician opens the loop, locks it open and tests it before touching anything."],
    "How do you make a circuit safe to touch?", ["Open the loop, lock it and test it", "Wear thick gloves and hurry"], 0, "Only an open, locked and tested loop is safe."),
  slFl("yard-report", "orleans", "rail-yard", "k12-writing-a-clear-incident-report", "ra-blue-flag-protection-in-the-yard", "Yard switch crew",
    "A switch crew writes what moved, where and when, so the next shift can read the yard without guessing.", "Say What Moved", 2,
    ["A clear report says what happened, where and when, in plain words.", "It leaves out guesses about why.", "The next crew reads it and knows exactly where each car stands."],
    "What belongs in a clear report?", ["What, where and when", "Who you think was to blame"], 0, "Facts first; guesses do not help the next shift."),
  slFl("hospital-call", "orleans", "hospital-district", "k12-first-aid-awareness-call-for-help", "hc-code-response-support-and-crash-cart-check", "Clinical support technician",
    "Support staff in a hospital know that the first job in an emergency is the call, not the fix.", "Who to Call First", 2,
    ["When someone is hurt, the first job is to get help coming.", "Say where you are and what you see.", "Then stay, keep them safe and let the trained team take over."],
    "What is the first job when someone is hurt?", ["Call for help and say where you are", "Try every fix you can think of"], 0, "Help coming early matters more than anything you try alone."),
  slFl("campus-experiment", "orleans", "university-campus", "k12-a-controlled-experiment", "br-restoration-data-qa-and-public-reporting", "Lab technician",
    "A lab technician changes one thing at a time so the result can only mean one thing.", "Change One Thing", 3,
    ["A fair test changes one thing and keeps everything else the same.", "If two things change, you cannot tell which one made the difference.", "The technician writes down the one thing changed and what happened."],
    "Why change only one thing in a test?", ["So the result has one cause", "So the test is faster"], 0, "One change, one cause; that is a fair test."),
  slFl("stadium-team", "orleans", "stadium-district", "k12-teamwork-and-feedback", "stage-load-in-and-truss-rigging", "Stagehand rigging crew",
    "A load-in crew works to one head rigger's calls, and every hand repeats the call back before a motor moves.", "One Call, One Crew", 2,
    ["A big job is many small jobs done in order by many people.", "Each person repeats the call back so everyone hears the same thing.", "Feedback is given calmly and right away, before the next lift."],
    "Why repeat the call back?", ["So everyone hears the same plan", "To sound busy"], 0, "A read-back catches a misheard call before it moves anything."),
  slFl("kitchen-fractions", "orleans", "hospitality-row", "k12-fractions-in-the-kitchen", "knife-skills", "Prep cook",
    "A prep cook halves and doubles a recipe with fractions before the first knife comes out.", "Half the Recipe", 2,
    ["A recipe is a set of fractions of a whole batch.", "Halve every amount and the dish tastes the same, just smaller.", "The cook writes the new amounts down before starting to cut."],
    "What happens when you halve every amount?", ["The dish is the same, only smaller", "The dish tastes different"], 0, "Scaling every part alike keeps the balance."),
  slFl("marsh-ecosystem", "orleans", "wetlands-restoration", "k12-ecosystems-at-the-kelp-transect", "marsh-transect-survey", "Restoration survey crew",
    "A survey crew walks a fixed line through the marsh and counts what lives along it, season after season.", "Counting the Marsh", 3,
    ["A marsh is a web: grasses hold the mud, the mud feeds small animals, the small animals feed birds and fish.", "Pull one strand and the others feel it.", "The crew counts along the same line each time, so a change shows up as a change."],
    "Why walk the same line each time?", ["So a change is really a change", "To save shoe leather"], 0, "Counting the same place makes the numbers comparable."),
  // Jefferson
  slFl("windsock", "jefferson", "airport-ground-ops", "k12-weather-and-the-sky", "av-marshalling-and-wingwalker-signals", "Aircraft marshaller",
    "A marshaller reads the wind sock and the sky before the first signal, because wind moves everything on the ramp.", "Reading the Wind Sock", 2,
    ["Wind has a direction and a strength, and both can change fast.", "A wind sock shows both at a glance.", "The ramp crew checks it before moving anything light or high."],
    "What does the wind sock show?", ["Wind direction and strength", "The time of day"], 0, "Direction and strength together tell the crew what the wind will do."),
  slFl("canal-graph", "jefferson", "drainage-canal-pumps", "k12-graphing-tide-readings-at-the-pier", "stormwater-outfall", "Stormwater technician",
    "A stormwater technician plots the canal level through a storm and reads the graph before the pumps do.", "The Canal on a Graph", 3,
    ["A reading is one dot: the level at one time.", "Many dots in a row make a line you can read.", "A line that climbs fast tells the crew the pumps must start now."],
    "What does a fast-climbing line mean?", ["The water is rising quickly", "The pen is running out"], 0, "The slope of the line is the speed of the rise."),
  slFl("bridge-span", "jefferson", "river-bridge-crew", "k12-measuring-and-scaling-the-court", "bridge-cable-inspection", "Bridge inspection ironworker",
    "A bridge inspector measures the same points every visit, so a small change stands out against the last visit.", "Measuring a Span", 3,
    ["To measure something big, mark it into equal parts and count the parts.", "Measure from the same mark each time.", "Write the number beside the last one, and the difference tells the story."],
    "Why measure from the same mark each time?", ["So the numbers can be compared", "So the tape stays clean"], 0, "A fixed starting mark makes every measurement comparable."),
  slFl("pallet-count", "jefferson", "wholesale-warehouse", "k12-household-budget-and-first-paycheck", "tdl-pick-pack-and-scan", "Order picker",
    "An order picker counts what leaves the shelf against what the sheet says, the way a budget counts what leaves the account.", "Count the Pallet", 2,
    ["A budget is a count of what comes in and what goes out.", "A pick sheet is the same count for a shelf.", "The picker checks every line, because one missed line is one wrong delivery."],
    "What is a pick sheet like?", ["A budget for a shelf", "A menu"], 0, "Both count what goes out against what should."),
  slFl("depot-labels", "jefferson", "suburban-transit-depot", "k12-reading-instructions-and-safety-labels", "bus-yard-fuelling-and-brake-check", "Coach yard service worker",
    "A yard service worker reads the label on every drum and the card on every coach before a hose is lifted.", "Read the Label First", 2,
    ["A label tells you what is inside and what it can do to you.", "The card on the coach tells you what has been checked and what has not.", "Read both before you start, not after."],
    "When do you read the label?", ["Before you start", "After the job, to tidy up"], 0, "A label read afterwards cannot protect you."),
  slFl("hot-work-permit", "jefferson", "westbank-shipyard", "k12-reading-instructions-and-safety-labels", "ib-pressure-vessel-confined-entry-and-hot-work", "Shipyard fire watch",
    "A fire watch reads the hot work permit like a label: what is allowed, where, and until when.", "The Hot Work Permit", 2,
    ["A permit is a set of instructions for one job in one place.", "It says what may be done, what must be ready and when it ends.", "The fire watch reads it before the torch lights and stays after it goes out."],
    "When does the fire watch read the permit?", ["Before the torch lights", "After the job is done"], 0, "A permit read afterwards protects no one."),
  slFl("lake-graph", "jefferson", "lakefront-levee", "k12-graphing-tide-readings-at-the-pier", "br-levee-inspection-and-seepage", "Levee patrol",
    "A levee patrol plots the lake level through a storm and walks the reach more often as the line climbs.", "The Lake on a Graph", 2,
    ["Each reading of the lake is one dot at one time.", "Join the dots and the line shows the water rising or falling.", "The patrol walks the reach more often as the line climbs."],
    "What tells the patrol to walk more often?", ["A rising line", "A flat line"], 0, "The slope of the line is the speed of the rise."),
  slFl("desk-privacy", "jefferson", "hospital-campus", "k12-digital-citizenship-and-online-safety", "hc-workplace-violence-deescalation-at-the-desk", "Patient registration clerk",
    "A registration clerk protects a patient's details at the desk and on the screen the same way: shown only to those who need them.", "Whose Information Is It", 2,
    ["Personal details belong to the person, not to whoever sees them.", "Turn the screen, lower your voice and share only what the job needs.", "The same rule holds online: think who can see it before you post it."],
    "Who should see a patient's details?", ["Only those who need them for the job", "Anyone in the room"], 0, "Details are shared on need, not on curiosity."),
  // St. Bernard
  slFl("oil-floats", "st-bernard", "refinery-corridor", "k12-buoyancy-and-pressure-in-the-deep", "spill-boom-deploy", "Marine environmental responder",
    "A spill responder lays boom on the surface because oil floats, and floats where the wind and current push it.", "Why Oil Floats", 3,
    ["Oil is lighter than the same amount of water, so it rides on top.", "A floating boom fences the top of the water where the oil is.", "Wind and current push both, so the responder reads them before laying the boom."],
    "Why does boom work on the surface?", ["Oil floats on the water", "Oil sinks to the bottom"], 0, "A fence only works where the oil is: on top."),
  slFl("transfer-checklist", "st-bernard", "river-road-terminal", "k12-reading-instructions-and-safety-labels", "bunkering-watch", "Person in charge of the transfer",
    "The person in charge of a transfer works a checklist line by line and signs each line before the next.", "The Transfer Checklist", 2,
    ["A checklist is a set of instructions in the order they matter.", "Each line is done and signed before the next one starts.", "If a line cannot be signed, the transfer waits."],
    "What happens when a line cannot be signed?", ["The transfer waits", "Skip to the next line"], 0, "A checklist only protects when every line is done in order."),
  slFl("curtain-mud", "st-bernard", "wetlands-crew", "k12-water-cycle-and-filtration", "br-turbidity-curtain-deployment", "Turbidity curtain crew",
    "A curtain crew fences the cloudy water so the mud it carries settles where the work is, not out in the bayou.", "Keeping the Mud in Place", 3,
    ["Digging stirs mud into the water and makes it cloudy.", "Still water lets the mud settle back down.", "A floating curtain keeps the cloudy water inside the work area until it clears."],
    "What does the curtain keep in?", ["The cloudy water", "The fish"], 0, "Fenced water stays still and drops its mud."),
  slFl("park-timeline", "st-bernard", "battlefield-park", "k12-map-literacy-across-eras", "br-drone-shoreline-survey", "Survey drone pilot",
    "A survey pilot flies the same shoreline line each season and lays the maps side by side to see what moved.", "Maps Side by Side", 3,
    ["A map is a picture of a place at one time.", "Two maps of the same place from different times show what changed.", "The pilot flies the same line so the two pictures line up."],
    "What do two maps of one place show?", ["What changed between them", "Which map is prettier"], 0, "Comparing eras is how a map tells time."),
  slFl("gate-lever", "st-bernard", "floodgate-station", "k12-simple-machines-at-a-crane", "tide-gate", "Gate operator",
    "A gate operator moves a heavy gate with gears and levers, and follows the written order for every step.", "The Gate and the Lever", 2,
    ["A lever lets a small push move a big load a short way.", "Gears do the same with turning.", "The gate is heavy, so the machine does the work and the operator does the checking."],
    "What does a lever trade for a smaller push?", ["A shorter move of the load", "A louder sound"], 0, "Less force, less distance; the work is the same."),
  slFl("scene-first-aid", "st-bernard", "fire-station", "k12-first-aid-awareness-call-for-help", "ambulance-scene-safety", "Emergency medical technician",
    "An emergency crew makes the scene safe before anyone kneels down, because a second hurt person helps no one.", "Safe Scene First", 2,
    ["Before helping, look: is the place safe for you too?", "Traffic, water, wires and smoke can hurt the helper.", "Make the scene safe or wait for those who can, then help."],
    "What comes before kneeling down to help?", ["Checking the scene is safe", "Taking a photo"], 0, "A safe helper is the only helper who can help."),
  slFl("reef-web", "st-bernard", "fishing-harbour", "k12-ecosystems-at-the-kelp-transect", "oyster-reef-monitoring", "Restoration monitoring crew",
    "A monitoring crew counts what lives on the reef, because a reef full of life is a reef that is working.", "Life on the Reef", 3,
    ["A reef is a home for many small animals.", "Those small animals feed larger ones, and so on up the web.", "Counting them tells the crew whether the reef is healthy."],
    "Why count the small animals on a reef?", ["They show if the reef is healthy", "They are easy to catch"], 0, "The small life is the base of the web."),
  slFl("school-listen", "st-bernard", "school-campus", "k12-oral-history-interview-skills", "who-risk-communication-and-community-engagement", "Community engagement officer",
    "A community engagement officer listens first and asks open questions, the way a good interviewer does.", "Ask, Then Listen", 2,
    ["An open question invites a story; a closed one invites yes or no.", "Listen without interrupting and note what you hear.", "Read it back to check you heard it right."],
    "What does an open question invite?", ["A story", "A yes or a no"], 0, "Open questions bring out what people know."),
  // Plaquemines
  slFl("river-road-scale", "plaquemines", "river-road-south", "k12-reading-a-map-scale-in-bay-world", "tdl-cargo-securement-and-hours", "Class A driver",
    "A driver plans the run from the map's scale bar so the hours in the plan match the distance on the road.", "The Road on a Scale Bar", 3,
    ["A map shrinks the land by the same amount everywhere.", "The scale bar shows how far one bar is on the ground.", "Lay the bar along the route to plan the time before you roll."],
    "What does the scale bar tell you?", ["How far a map length is on the ground", "How fast to drive"], 0, "Scale turns a map length into a real distance."),
  slFl("workboat-crane", "plaquemines", "marine-terminal", "k12-simple-machines-at-a-crane", "br-workboat-crane-lift-from-water", "Workboat deckhand",
    "A deckhand on a workboat crane keeps a tag line on the load, because a load on a pulley swings as the boat moves.", "A Crane on a Moving Deck", 2,
    ["A crane's pulley lets a small motor lift a heavy load.", "On a boat the deck moves, so the load swings.", "A tag line held from a safe spot steadies it."],
    "Why does a load swing on a workboat?", ["The deck moves under the crane", "The rope is too long"], 0, "A moving base means a moving load."),
  slFl("ferry-floats", "plaquemines", "ferry-landing", "k12-buoyancy-and-pressure-in-the-deep", "mw-ferry-deckhand-and-passenger-safety", "Ferry deckhand",
    "A ferry deckhand counts passengers and cars against the plan, because a ferry floats only as long as it is not overloaded.", "Why the Ferry Floats", 2,
    ["A boat floats because it pushes aside water that weighs as much as the boat.", "Add weight and the boat sits lower.", "The deckhand counts the load so the boat never sits too low."],
    "What happens when weight is added to a boat?", ["It sits lower in the water", "It goes faster"], 0, "More load, more water pushed aside, lower boat."),
  slFl("pilot-weather", "plaquemines", "pilot-station", "k12-weather-and-the-sky", "pilot-transfer", "Pilot transfer party",
    "A pilot transfer party reads the sky and the sea state before anyone steps onto the ladder.", "Sky, Sea and the Ladder", 2,
    ["Weather shows itself in the sky before it arrives.", "Wind builds waves, and waves move the ladder.", "The party watches both and waits when either says wait."],
    "What do waves do to the transfer?", ["They move the ladder", "They make it warmer"], 0, "Sea state is the weather you feel underfoot."),
  slFl("delta-water", "plaquemines", "coastal-restoration", "k12-water-cycle-and-filtration", "br-tidal-marsh-grading-amphibious-excavator", "Amphibious excavator operator",
    "An excavator operator grades a marsh so water flows slowly through the plants that filter it.", "Slow Water, Clean Water", 3,
    ["Fast water carries mud with it; slow water drops the mud.", "Marsh plants slow the water down.", "The operator shapes the ground so water takes the slow way through."],
    "What does slow water do with the mud it carries?", ["Drops it", "Carries it further"], 0, "Slowing water is how a marsh cleans it."),
  slFl("launch-chance", "plaquemines", "delta-boat-launch", "k12-probability-with-a-fair-spinner", "br-vhf-and-navigation-in-a-work-zone", "Deckhand on radio watch",
    "A deckhand treats the forecast as a chance, not a promise, and keeps the radio watch either way.", "A Forecast Is a Chance", 2,
    ["A chance says how likely something is, not whether it will happen.", "A small chance of a storm is still a chance.", "The crew plans for the chance and listens to the radio."],
    "What does a small chance of a storm mean?", ["It still might happen", "It cannot happen"], 0, "Small is not zero."),
  slFl("sample-by-the-book", "plaquemines", "oil-and-gas-dock", "k12-reading-instructions-and-safety-labels", "ballast-water-sampling", "Ship's engineer",
    "A ship's engineer takes a ballast sample the way the instructions say, in the same order every time.", "Sampling by the Book", 2,
    ["Instructions tell you the order and the tools.", "A sample taken out of order tells you the wrong thing.", "The engineer labels each bottle before the next is drawn."],
    "Why label each bottle right away?", ["So each sample is known", "So the bottles look neat"], 0, "A sample without a label is a guess."),
  slFl("morning-briefing", "plaquemines", "last-road-end", "k12-public-speaking-at-the-hall", "br-volunteer-cleanup-day-safety-lead", "Cleanup day safety lead",
    "A safety lead briefs a cleanup crew in plain words, loud enough for the back row, and asks for questions.", "The Morning Briefing", 2,
    ["A briefing says what we do, where the dangers are and how to call for help.", "Speak slowly, face the crew and say the important thing twice.", "Ask if anyone has a question before anyone picks up a bag."],
    "What comes at the end of a briefing?", ["Asking for questions", "Handing out the bags"], 0, "Questions catch what the briefing missed."),
  // St. Tammany
  slFl("causeway-measure", "st-tammany", "causeway-north-landing", "k12-measuring-and-scaling-the-court", "gg-deck-lane-closure-and-traveller", "Bridge traveller crew",
    "A traveller crew sets its lane closure by measured spacing, the same distance between every cone.", "Cones the Same Distance Apart", 2,
    ["Equal spacing means every gap is the same length.", "Measure one gap and repeat it, do not guess the rest.", "Drivers read even spacing as a clear line to follow."],
    "How do you keep the cones evenly spaced?", ["Measure one gap and repeat it", "Guess by eye and hurry"], 0, "One measured gap, repeated, is a straight message to traffic."),
  slFl("yard-clear-report", "st-tammany", "north-shore-rail-yard", "k12-writing-a-clear-incident-report", "track-access", "Track worker",
    "A track worker reports a near miss in plain words so the next crew changes what it does.", "Report the Near Miss", 2,
    ["A near miss is a warning nobody paid for.", "Write what happened, where and when, in plain words.", "Leave out blame; keep in what the next crew needs to know."],
    "Why report a near miss?", ["So the next crew can avoid it", "To get someone in trouble"], 0, "A near miss reported is an accident prevented."),
  slFl("shore-debris", "st-tammany", "lakefront-promenade", "k12-ecosystems-at-the-kelp-transect", "me-shoreline-debris-and-microplastics-survey", "Shoreline survey lead",
    "A shoreline survey lead counts debris along a fixed line, because what washes up tells the story of the water.", "What the Shore Collects", 3,
    ["A shore gathers what the water carries.", "Counting it along one line, season by season, shows a change.", "The crew flags what it cannot safely lift and leaves it for a plan."],
    "Why count along the same line each season?", ["To see a change over time", "To finish sooner"], 0, "The same line makes the counts comparable."),
  slFl("hall-guilds", "st-tammany", "trades-campus", "k12-guilds-and-the-history-of-work", "union-hall-and-dispatch", "Construction apprentice",
    "An apprentice learns that a trade is passed on: people who know the work teach the people who will do it next.", "Passing the Trade On", 2,
    ["Long ago, guilds taught a trade from one worker to the next.", "Today an apprenticeship does the same, with a hall and a dispatch.", "The work changes; the passing on does not."],
    "What does an apprenticeship do?", ["Passes a trade from one worker to the next", "Replaces the need to learn"], 0, "Learning from those who know is how a trade has always been passed on."),
  slFl("fire-fair-test", "st-tammany", "piney-woods-fire-station", "k12-a-controlled-experiment", "or-wildland-fireline-construction-and-lookout", "Wildland firefighter",
    "A wildland crew boss watches one thing change, the wind, and calls the crew back when it does.", "Watch the One Thing", 2,
    ["A fair test watches one thing change.", "On a fireline, the one thing is the wind.", "When the wind changes, the plan changes, and the crew moves to the safety zone."],
    "What is the crew watching for?", ["A change in the wind", "The time for lunch"], 0, "One variable, watched closely, keeps the crew safe."),
  slFl("transport-team", "st-tammany", "north-shore-hospital", "k12-teamwork-and-feedback", "hc-patient-transport-and-safe-handling", "Patient transport technician",
    "A transport team moves a patient on one count, and anyone on the team can call a stop.", "Move on the Count", 2,
    ["A team move works when everyone moves at the same moment.", "One person counts; the others move on the count.", "Anyone who sees a problem says stop, and the team stops."],
    "Who can call a stop on a team move?", ["Anyone on the team", "Only the leader"], 0, "Feedback from anyone keeps the patient safe."),
  slFl("staging-count", "st-tammany", "staging-yard", "k12-household-budget-and-first-paycheck", "tdl-trailer-loading-and-dock-plate", "Dock loader",
    "A dock loader counts what goes on the trailer against the sheet, so a crew at the far end gets what it planned for.", "Count What Goes on the Truck", 2,
    ["A load sheet is a budget for a trailer.", "Count each item on as it goes on.", "What is not counted on cannot be counted on at the far end."],
    "What is a load sheet like?", ["A budget for a trailer", "A weather report"], 0, "Both are counts you check against."),
  slFl("zone-angle", "st-tammany", "interstate-work-zone", "k12-slope-and-angles-on-a-ramp", "traffic-incident-management", "Traffic control crew",
    "A traffic control crew lays the taper at a gentle angle so drivers can move over in time.", "The Angle of the Taper", 2,
    ["A taper is a line of cones that leans across the lane.", "A gentle angle gives drivers a long run to move over.", "A steep angle surprises them; the plan sets the angle."],
    "Why is the taper laid at a gentle angle?", ["So drivers have time to move over", "So it uses fewer cones"], 0, "The angle is a message to drivers about time."),
];

export function slLessonsFor(parishId, siteId = null) { return SL_FIELD_LESSONS.filter((l) => l.parish === parishId && (!siteId || l.site === siteId)); }
export function slLesson(id) { return SL_FIELD_LESSONS.find((l) => l.id === id) ?? null; }

// ------------------------------------------------------------------ side games (the shared side-game contract)

const slGame = (id, parish, site, title, task, mechanic, gate, practices, cosmetic, summary) => ({
  id: `sl-${parish}-${id}`, world: SL_WORLD, kind: "side-game", parish, site, siteName: slSiteName(parish, site), title, task, mechanic, gate, practices, reward: { cosmetic }, summary,
});

export const SL_SIDE_GAMES = [
  // Orleans
  slGame("levee-seepage-walk", "orleans", "levee-crew", "Levee Seepage Walk", "seepage walk", "survey-transect",
    { stations: ["br-levee-inspection-and-seepage"], note: "Levee inspection and seepage first — you flag a wet spot, you never dig at it." },
    ["plan", "stopwork", "comms"], "levee walker's hat band", "Walk the levee toe with the inspector and flag every wet spot from the line."),
  slGame("pump-house-lockout", "orleans", "pumping-station", "Pump House Lockout", "pump clearing", "lockout-steps",
    { stations: ["cs-ventilation-and-air-monitoring-plan", "manhole-entry-and-atmospheric-monitoring"], note: "The pump station's confined-space and air-monitoring stations before you clear a pump." },
    ["lockout", "ppe", "comms"], "pump house key fob", "Clear a jammed screen at the pump house: notify, isolate, lock, verify, then reach in."),
  slGame("wharf-lift-sequence", "orleans", "port-terminal", "Wharf Lift Sequence", "wharf lift", "lift-sequencer",
    { stations: ["dock-crane", "container-lashing"], note: "Dock crane and container lashing before you sequence the wharf lifts." },
    ["lift", "zone", "comms"], "wharf crane pin", "Order the storm-season picks on the wharf so no load passes over the lashing gang."),
  slGame("barn-power-switching", "orleans", "streetcar-barn", "Barn Power Switching", "barn switching", "switching-order",
    { stations: ["bus-depot-lift", "signal-cabinet"], note: "The depot lift and signal cabinet stations before you work the barn's switching order." },
    ["lockout", "comms", "plan"], "barn electrician's patch", "Work the switching order to make the barn's overhead dead before the storm tie-down."),
  slGame("yard-switch-move", "orleans", "rail-yard", "Yard Switch Move", "switch move", "delivery-run",
    { stations: ["ra-blue-flag-protection-in-the-yard", "track-access"], note: "Blue flag protection and track access before you move cars in the yard." },
    ["plan", "comms", "zone"], "switch lamp charm", "Move the tank cars to high ground on the yardmaster's plan, one call at a time."),
  slGame("ward-turnover", "orleans", "hospital-district", "Ward Turnover", "room turnover", "inspection-grid",
    { stations: ["hc-environmental-services-isolation-room-turnover", "hc-patient-transport-and-safe-handling"], note: "Isolation room turnover and safe patient handling before you turn a ward." },
    ["ppe", "plan", "spill"], "ward badge reel", "Turn the ward's rooms for arrivals before the storm, checking every piece of kit on the cart."),
  slGame("banquet-kitchen-rush", "orleans", "hospitality-row", "Banquet Kitchen Rush", "banquet service", "kitchen-rush",
    { stations: ["knife-skills", "allergen-control", "kitchen-gas-shutoff"], note: "Knife skills, allergen control and the gas shutoff before you run the banquet rush." },
    ["allergen", "ppe", "spill"], "line cook's bandana", "Clear the ticket rail for the crews staying over, without one unsafe plate."),
  slGame("stadium-load-in", "orleans", "stadium-district", "Stadium Load-In", "load-in", "lift-sequencer",
    { stations: ["rigging-loft", "stage-load-in-and-truss-rigging"], note: "The rigging loft and the truss load-in before you sequence the stadium picks." },
    ["lift", "zone", "comms"], "rigger's carabiner tag", "Sequence the motors so no truss passes over the deck crew."),
  slGame("marsh-count", "orleans", "wetlands-restoration", "Marsh Count", "transect count", "survey-transect",
    { stations: ["marsh-transect-survey"], note: "The marsh transect survey before you run the count." },
    ["plan", "weather", "stopwork"], "marsh surveyor's quadrat pin", "Walk the fixed line and log every quadrat before the weather turns."),
  slGame("campus-experiment-log", "orleans", "university-campus", "Campus Experiment Log", "data check", "survey-transect",
    { k12: ["k12-a-controlled-experiment"], stations: ["br-restoration-data-qa-and-public-reporting"], note: "The K-12 controlled-experiment lesson and the data QA station before you keep the campus log." },
    ["plan", "comms", "stopwork"], "lab notebook sticker", "Log the field sheets into the shared record, one point at a time, flagging what does not fit."),
  // Jefferson
  slGame("ramp-marshal", "jefferson", "airport-ground-ops", "Ramp Marshal", "ramp move", "traffic-zone",
    { stations: ["airport-ramp", "av-marshalling-and-wingwalker-signals"], note: "Airport ramp and marshalling signals before you run the ramp move." },
    ["plan", "comms", "weather"], "wing walker's wands charm", "Set the cones and the wing walker before the tug moves, in the plan's order."),
  slGame("canal-pump-storm-night", "jefferson", "drainage-canal-pumps", "Canal Pump Storm Night", "storm night", "lockout-steps",
    { stations: ["stormwater-outfall", "ut-night-storm-response-crew-and-portable-generator"], note: "The stormwater outfall and the night storm-response crew stations before a storm night at the pumps." },
    ["lockout", "weather", "fatigue"], "storm crew's headlamp band", "Bring the standby generator on and clear the screen, locked out, on a wet night."),
  slGame("bridge-fog-stop", "jefferson", "river-bridge-crew", "Bridge Fog Work Stop", "fog watch", "lookout-watch",
    { stations: ["gg-fog-and-wind-work-stop", "bridge-cable-inspection"], note: "The fog-and-wind work stop and cable inspection before you keep the bridge watch." },
    ["weather", "stopwork", "comms"], "bridge painter's respirator sticker", "Keep the deck watch as fog rolls up the river and call the stop by the plan."),
  slGame("dock-plate-delivery", "jefferson", "wholesale-warehouse", "Dock Plate Delivery", "delivery", "delivery-run",
    { stations: ["tdl-trailer-loading-and-dock-plate", "tdl-pallet-jack-and-racking"], note: "Trailer loading and the pallet jack before you run the storm supply delivery." },
    ["plan", "inspect", "zone"], "dock loader's gloves", "Load and run the storm supplies to the shelter on the route the plan sets."),
  slGame("shipyard-hotwork-watch", "jefferson", "westbank-shipyard", "Shipyard Hot Work Watch", "fire watch", "lookout-watch",
    { stations: ["ib-pressure-vessel-confined-entry-and-hot-work"], note: "Pressure vessel entry and hot work before you stand the fire watch." },
    ["ppe", "plan", "stopwork"], "fire watch armband", "Stand the fire watch on a hull repair and keep it after the torch goes out."),
  slGame("tray-line-allergy", "jefferson", "hospital-campus", "Tray Line Allergy Flags", "tray line", "kitchen-rush",
    { stations: ["hc-dietary-tray-line-and-allergy-flags"], note: "The dietary tray line and allergy flags before you run the line." },
    ["allergen", "ppe", "comms"], "dietary aide's pin", "Run the tray line for a full house and stop on every flagged tray."),
  // St. Bernard
  slGame("boom-deploy", "st-bernard", "river-road-terminal", "Boom Deploy on the River", "boom deploy", "spill-response",
    { stations: ["spill-boom-deploy", "mw-oil-transfer-watch-and-boom"], note: "Boom deployment and the transfer watch before you lay boom on the river." },
    ["spill", "plan", "radio"], "boom crew's float key", "Stop the flow, lay the boom and report it, with the workboat on the radio."),
  slGame("shelter-in-place-call", "st-bernard", "refinery-corridor", "Shelter-in-Place Call", "shelter call", "lookout-watch",
    { stations: ["shelter-in-place-drill", "decon-support-laborer"], note: "The shelter-in-place drill and decon support before you keep the corridor watch." },
    ["stopwork", "comms", "ppe"], "corridor radio clip", "Keep the corridor watch and make the shelter-in-place call by the form."),
  slGame("floodgate-close", "st-bernard", "floodgate-station", "Close the Floodgate", "gate closing", "switching-order",
    { stations: ["tide-gate", "valve-vault"], note: "The tide gate and valve vault stations before you close the floodgate." },
    ["comms", "plan", "lockout"], "gate operator's key ring", "Close the structure on the written order, reading each step back."),
  slGame("park-limbing", "st-bernard", "battlefield-park", "Park Limbing After the Storm", "limbing", "inspection-grid",
    { stations: ["gk-chainsaw-start-and-limbing-on-the-ground"], note: "Chainsaw start and limbing before you clear the park's downed limbs." },
    ["inspect", "ppe", "zone"], "park crew's saw chaps patch", "Check the saw kit piece by piece and clear the downed limbs from the path."),
  slGame("harbour-recovery", "st-bernard", "fishing-harbour", "Harbour Recovery Drill", "recovery drill", "overboard-drill",
    { stations: ["br-cold-water-immersion-and-mob-recovery", "yc-man-overboard-recovery-drill"], note: "Cold-water immersion and the overboard recovery drill before the harbour drill." },
    ["overboard", "comms", "ppe"], "harbour drill whistle", "Run the overboard drill at the harbour: alarm, spotter, approach, recovery."),
  slGame("curtain-tow", "st-bernard", "wetlands-crew", "Turbidity Curtain Tow", "curtain tow", "line-follow",
    { stations: ["br-turbidity-curtain-deployment"], note: "Turbidity curtain deployment before you tow the curtain into the bayou." },
    ["plan", "radio", "weather"], "curtain crew's float", "Walk the curtain out anchor by anchor with a buddy check at each."),
  // Plaquemines
  slGame("pretrip-river-road", "plaquemines", "river-road-south", "Pre-Trip on the River Road", "supply run", "delivery-run",
    { stations: ["tdl-pretrip-inspection", "tdl-air-brake-test"], note: "The pre-trip inspection and the air brake test before you run the river road." },
    ["inspect", "plan", "fatigue"], "river road route card", "Walk around, test the brakes and run the river road on the plan's route."),
  slGame("ferry-deck-count", "plaquemines", "ferry-landing", "Ferry Deck Count", "crossing", "delivery-run",
    { stations: ["mw-ferry-deckhand-and-passenger-safety"], note: "The ferry deckhand station before you work a crossing." },
    ["plan", "comms", "weather"], "ferry deckhand's whistle lanyard", "Count the deck, brief the passengers and make the crossing the plan allows."),
  slGame("pilot-transfer-watch", "plaquemines", "pilot-station", "Pilot Transfer Watch", "transfer", "overboard-drill",
    { stations: ["pilot-transfer", "br-vhf-and-navigation-in-a-work-zone"], note: "Pilot transfer and radio watch before you stand the transfer party." },
    ["overboard", "radio", "weather"], "pilot boat pennant", "Stand the transfer party with the recovery drill ready and the radio watch kept."),
  slGame("nesting-window-survey", "plaquemines", "coastal-restoration", "Nesting Window Survey", "buffer survey", "survey-transect",
    { stations: ["br-bird-nesting-buffer-and-work-window"], note: "The nesting buffer and work window station before you clear the bench." },
    ["plan", "stopwork", "zone"], "biologist's field flag", "Walk the bench line, flag every nest from the line and hold the crew outside the buffer."),
  slGame("workboat-lift", "plaquemines", "marine-terminal", "Workboat Lift from the Water", "water lift", "lift-sequencer",
    { stations: ["br-workboat-crane-lift-from-water"], note: "The workboat crane lift before you sequence the picks from the water." },
    ["lift", "comms", "plan"], "workboat crane tag line bead", "Order the picks from the water so nothing swings over the deck crew."),
  slGame("shoreline-sharps-sweep", "plaquemines", "last-road-end", "Shoreline Sharps Sweep", "shoreline sweep", "inspection-grid",
    { stations: ["br-shoreline-cleanup-sharps-and-hazardous-debris"], note: "Shoreline cleanup with sharps awareness before you sweep the end of the road." },
    ["ppe", "inspect", "spill"], "ranger post patch", "Sweep the shoreline after the storm, tagging what the crew must not lift."),
  // St. Tammany
  slGame("causeway-lane-closure", "st-tammany", "causeway-north-landing", "Causeway Lane Closure", "lane closure", "traffic-zone",
    { stations: ["gg-deck-lane-closure-and-traveller", "gg-fog-and-wind-work-stop"], note: "The deck lane closure and the fog-and-wind stop before you close a causeway lane." },
    ["traffic", "weather", "comms"], "causeway flagger's paddle pin", "Set the closure on the causeway in the plan's order before the first tool comes out."),
  slGame("staging-yard-roll-out", "st-tammany", "staging-yard", "Staging Yard Roll-Out", "roll-out", "delivery-run",
    { stations: ["line-truck", "tdl-trailer-loading-and-dock-plate"], note: "The line truck and trailer loading stations before the storm roll-out." },
    ["inspect", "plan", "traffic"], "storm roll-out route card", "Check the trucks and roll the crews out on the routes the plan sets."),
  slGame("piney-woods-lookout", "st-tammany", "piney-woods-fire-station", "Piney Woods Lookout", "lookout", "lookout-watch",
    { stations: ["or-wildland-fireline-construction-and-lookout"], note: "Fireline construction and the lookout before you keep the piney woods watch." },
    ["weather", "comms", "stopwork"], "piney woods lookout badge", "Keep the watch through a dry, windy afternoon and report by the form."),
  slGame("transport-team-handoff", "st-tammany", "north-shore-hospital", "Transport Team Hand-Off", "transport", "delivery-run",
    { stations: ["hc-patient-transport-and-safe-handling"], note: "Patient transport and safe handling before you run the transport hand-off." },
    ["plan", "comms", "fatigue"], "transport team badge reel", "Move arrivals from the ambulance bay on the count, on the route the plan sets."),
  slGame("lakefront-debris-transect", "st-tammany", "lakefront-promenade", "Lakefront Debris Transect", "debris transect", "survey-transect",
    { stations: ["me-shoreline-debris-and-microplastics-survey"], note: "The shoreline debris survey before you run the lakefront transect." },
    ["ppe", "plan", "spill"], "shoreline survey clipboard clip", "Log every point along the promenade's shore line; flag, never pull."),
  slGame("anchor-rescue-plan", "st-tammany", "trades-campus", "Anchor and Rescue Plan", "anchor check", "inspection-grid",
    { stations: ["fp-anchor-selection-and-rescue-plan", "leading-edge-and-horizontal-lifeline"], note: "Anchor selection with a rescue plan and the horizontal lifeline before you check the campus rack." },
    ["inspect", "plan", "comms"], "campus harness tag", "Check every harness and anchor on the training rack and tag out what fails."),
  slGame("work-zone-saw-cut", "st-tammany", "interstate-work-zone", "Work Zone Saw Cut", "saw cut", "traffic-zone",
    { stations: ["traffic-incident-management", "cm-concrete-saw-cutting-with-water-and-silica-control"], note: "Traffic incident management and wet saw cutting before you cut in the work zone." },
    ["traffic", "ppe", "zone"], "work zone vest patch", "Set the zone up in the plan's order, then make the cut wet and behind the taper."),
];

/** Every gated item this console declares, in the shape tools/check_gates.mjs and the lock UI read. */
export const SL_GATED = SL_SIDE_GAMES;
export function slGamesFor(parishId, siteId = null) { return SL_SIDE_GAMES.filter((g) => g.parish === parishId && (!siteId || g.site === siteId)); }
export function slGameById(id) { return SL_SIDE_GAMES.find((g) => g.id === id) ?? null; }

// ------------------------------------------------------------------ the main arc: storm-season readiness

const slGoto = (parish, site, text) => ({ type: "goto", parish, site, text });
const slTalk = (giver, text) => ({ type: "talk", giver, text });
const slStation = (station, text) => ({ type: "station", station, text });
const slLessonStep = (lesson) => ({ type: "lesson", lesson });
const slCross = (connector, parish, site, text) => ({ type: "cross", connector, to: { parish, site }, text });
const slGameStep = (game) => ({ type: "game", game });
export const slRewardForTier = (tier) => 100 + (tier - 1) * 150;

export const SL_MAIN_QUESTS = [
  { id: "sl-main-01-walk-the-levee", title: "Walk the Levee", kind: "main", tier: 1, parish: "orleans", site: "levee-crew", requires: null,
    giver: "the levee inspector",
    steps: [
      slGoto("orleans", "levee-crew", "Storm season is coming. Meet the levee inspector at the crew yard."),
      slTalk("the levee inspector", "Before the season we walk every reach. Learn to read the slope, then read it with me."),
      slLessonStep("sl-fl-levee-ramp"),
      slStation("br-levee-inspection-and-seepage", "Do the levee inspection and seepage station."),
      slTalk("the levee inspector", "Now you flag wet spots the way we do. Next stop: the people who move the water."),
    ], reward: { xp: slRewardForTier(1), badge: "Levee Walker" } },
  { id: "sl-main-02-keep-the-pumps-turning", title: "Keep the Pumps Turning", kind: "main", tier: 2, parish: "orleans", site: "pumping-station", requires: "sl-main-01-walk-the-levee",
    giver: "the pump station operator",
    steps: [
      slGoto("orleans", "pumping-station", "Walk to the pumping station and find the operator."),
      slTalk("the pump station operator", "Rain that falls here has to be lifted out. Learn where it goes, then learn how we clear a pump without hurting anyone."),
      slLessonStep("sl-fl-pump-water-cycle"),
      slStation("cs-ventilation-and-air-monitoring-plan", "Do the confined-space ventilation and air-monitoring station."),
      slStation("ut-night-storm-response-crew-and-portable-generator", "Do the night storm-response crew and portable generator station."),
      slTalk("the pump station operator", "The port ties down next. Go and see the terminal superintendent."),
    ], reward: { xp: slRewardForTier(2), badge: "Pump Watch" } },
  { id: "sl-main-03-tie-down-the-port", title: "Tie Down the Port", kind: "main", tier: 3, parish: "orleans", site: "port-terminal", requires: "sl-main-02-keep-the-pumps-turning",
    giver: "the terminal superintendent",
    steps: [
      slGoto("orleans", "port-terminal", "Go to the port terminal's wharf."),
      slTalk("the terminal superintendent", "Everything on this wharf gets lashed, moored or moved before the wind. Learn the crane, then lash the stacks."),
      slLessonStep("sl-fl-wharf-pulleys"),
      slStation("container-lashing", "Do the container lashing station."),
      slStation("mooring-line", "Do the mooring line station."),
      slTalk("the terminal superintendent", "The hospital district asked for hands. Go there next."),
    ], reward: { xp: slRewardForTier(3), badge: "Wharf Hand" } },
  { id: "sl-main-04-the-hospital-stays-open", title: "The Hospital Stays Open", kind: "main", tier: 4, parish: "orleans", site: "hospital-district", requires: "sl-main-03-tie-down-the-port",
    giver: "the charge nurse",
    steps: [
      slGoto("orleans", "hospital-district", "Walk to the hospital district's ambulance bay."),
      slTalk("the charge nurse", "In a storm the hospital never closes. Learn who to call first, then learn how we keep the rooms turning and the carts checked."),
      slLessonStep("sl-fl-hospital-call"),
      slStation("hc-code-response-support-and-crash-cart-check", "Do the code response support and crash cart check station."),
      slStation("hc-patient-transport-and-safe-handling", "Do the patient transport and safe handling station."),
      slTalk("the charge nurse", "Downriver they are closing the gates. Take the river road."),
    ], reward: { xp: slRewardForTier(4), badge: "Hospital Support" } },
  { id: "sl-main-05-down-the-river-road", title: "Down the River Road", kind: "main", tier: 5, parish: "st-bernard", site: "floodgate-station", requires: "sl-main-04-the-hospital-stays-open",
    giver: "the gate operator",
    steps: [
      slCross("road-orleans-st-bernard", "st-bernard", "floodgate-station", "Take the river road into St. Bernard Parish and find the floodgate crew."),
      slTalk("the gate operator", "We close the structure on a written order, one step read back at a time. Learn the machine, then walk the corridor's drill."),
      slLessonStep("sl-fl-gate-lever"),
      slStation("tide-gate", "Do the tide gate station."),
      slGoto("st-bernard", "refinery-corridor", "Go to the refinery corridor."),
      slStation("shelter-in-place-drill", "Do the shelter-in-place drill."),
      slCross("river-road-st-bernard-plaquemines", "plaquemines", "ferry-landing", "Follow the river road south into Plaquemines Parish, to the ferry landing."),
      slLessonStep("sl-fl-ferry-floats"),
      slCross("ferry-plaquemines-river", "plaquemines", "pilot-station", "Cross on the river ferry to the pilot station."),
      slStation("pilot-transfer", "Do the pilot transfer station."),
      slTalk("the pilot boat operator", "The west bank pumps and the airport are staging. Head back up and cross the river bridge."),
    ], reward: { xp: slRewardForTier(5), badge: "River Road" } },
  { id: "sl-main-06-across-the-river", title: "Across the River", kind: "main", tier: 6, parish: "jefferson", site: "drainage-canal-pumps", requires: "sl-main-05-down-the-river-road",
    giver: "the drainage operator",
    steps: [
      slCross("river-bridge-orleans-jefferson", "jefferson", "drainage-canal-pumps", "Cross the river bridge into Jefferson Parish and find the drainage canal pump station."),
      slTalk("the drainage operator", "We plot the canal through the storm and start the pumps before the line climbs. Learn to read the graph, then stand a storm night with us."),
      slLessonStep("sl-fl-canal-graph"),
      slStation("stormwater-outfall", "Do the stormwater outfall station."),
      slGoto("jefferson", "airport-ground-ops", "Go to airport ground operations."),
      slLessonStep("sl-fl-windsock"),
      slStation("av-marshalling-and-wingwalker-signals", "Do the marshalling and wing walker signals station."),
      slTalk("the ramp lead", "The staging yard on the north shore is filling up. Take the causeway."),
    ], reward: { xp: slRewardForTier(6), badge: "West Bank Crew" } },
  { id: "sl-main-07-north-shore-staging", title: "North Shore Staging", kind: "main", tier: 7, parish: "st-tammany", site: "staging-yard", requires: "sl-main-06-across-the-river",
    giver: "the staging yard boss",
    steps: [
      slCross("causeway-jefferson-st-tammany", "st-tammany", "staging-yard", "Cross the causeway into St. Tammany Parish and report to the storm staging yard."),
      slTalk("the staging yard boss", "Every crew that rolls south rolls from here. Count what goes on the trucks, check the line trucks and set up the intake."),
      slLessonStep("sl-fl-staging-count"),
      slStation("line-truck", "Do the line truck station."),
      slStation("shelter-intake-operations", "Do the shelter intake operations station."),
      slGameStep("sl-st-tammany-staging-yard-roll-out"),
      slTalk("the staging yard boss", "Levee, pumps, port, hospital, river road, west bank, north shore. You are storm-season ready."),
    ], reward: { xp: slRewardForTier(7), badge: "Storm Season Ready" } },
];

export function slMainQuest(id) { return SL_MAIN_QUESTS.find((q) => q.id === id) ?? null; }
/** The `requires` chain has no cycle (a plain DFS); returns the first cycle or null. */
export function slFindCycle(list = SL_MAIN_QUESTS) {
  const by = new Map(list.map((q) => [q.id, q]));
  const state = new Map();
  const walk = (id, path) => {
    if (state.get(id) === 1) return [...path, id];
    if (state.get(id) === 2) return null;
    state.set(id, 1);
    const q = by.get(id);
    for (const r of q?.requires ? [].concat(q.requires) : []) { const c = walk(r, [...path, id]); if (c) return c; }
    state.set(id, 2);
    return null;
  };
  for (const q of list) { const c = walk(q.id, []); if (c) return c; }
  return null;
}

// ------------------------------------------------------------------ NPC hand-offs (for GRIOT's characters)
//
// One hand-off per site per kind. The giver is a job title. The line is the target's own
// title, re-read verbatim from this module (`source`), so a character hands off in the
// target's own words and invents nothing.

export const SL_HANDOFF_KINDS = ["station", "lesson", "game", "treasure"];
export const SL_TREASURE_HINT = "Crews tuck a storm kit cache near every site. Walk the sites.";

export const SL_HANDOFFS = SL_PARISHES.flatMap((p) => p.sites.flatMap((s) => {
  const out = [];
  const base = `sl-ho-${p.id}-${s.id}`;
  const src = (field, id) => ({ file: "WebXR/shared/sl-parish-play.js", field, id });
  if (s.stations[0]) out.push({ id: `${base}-station`, parish: p.id, site: s.id, giver: s.giver, kind: "station", target: s.stations[0], line: s.stations[0], source: src("SL_PARISHES.sites.stations", s.stations[0]) });
  const l = SL_FIELD_LESSONS.find((x) => x.parish === p.id && x.site === s.id);
  if (l) out.push({ id: `${base}-lesson`, parish: p.id, site: s.id, giver: s.giver, kind: "lesson", target: l.id, line: l.title, source: src("SL_FIELD_LESSONS.title", l.id) });
  const g = SL_SIDE_GAMES.find((x) => x.parish === p.id && x.site === s.id);
  if (g) out.push({ id: `${base}-game`, parish: p.id, site: s.id, giver: s.giver, kind: "game", target: g.id, line: g.title, source: src("SL_SIDE_GAMES.title", g.id) });
  out.push({ id: `${base}-treasure`, parish: p.id, site: s.id, giver: s.giver, kind: "treasure", target: `tz-parish-${p.id}-${s.id}`, line: SL_TREASURE_HINT, source: src("SL_TREASURE_HINT", null) });
  return out;
}));

/** The hand-offs a character standing at a site can make (GRIOT's hook). */
export function slHandoffsFor({ parish, site = null, kind = null } = {}) {
  return SL_HANDOFFS.filter((h) => h.parish === parish && (!site || h.site === site) && (!kind || h.kind === kind));
}

/**
 * Where a hand-off leads: `{ kind, id, title, href, gate?, open? }`. `href` is relative to
 * the parishes page (a station link through links.js, `#lesson=`/`#game=` on the page for
 * a lesson or game, nothing for a treasure hint — a treasure stays hidden).
 */
export function slHandoffTarget(h, { page = SL_PAGE, snap = null } = {}) {
  if (!h) return null;
  if (h.kind === "station") return { kind: "station", id: h.target, title: h.target.replace(/-/g, " "), href: lkStationLink(h.target, { from: SL_WORLD, page, siteId: h.site }) };
  if (h.kind === "lesson") { const l = slLesson(h.target); return l ? { kind: "lesson", id: l.id, title: l.title, href: `${page}?parish=${encodeURIComponent(h.parish)}#lesson=${encodeURIComponent(l.id)}`, k12: l.k12, station: l.station } : null; }
  if (h.kind === "game") {
    const g = slGameById(h.target);
    if (!g) return null;
    const s = snap ?? qmSnapshot();
    return { kind: "game", id: g.id, title: g.title, href: `${page}?parish=${encodeURIComponent(h.parish)}#game=${encodeURIComponent(g.id)}`, gate: g.gate, open: qmIsOpen(g.gate, s), missing: qmMissing(g.gate, s) };
  }
  if (h.kind === "treasure") return { kind: "treasure", id: null, title: "A hidden treasure", href: null };
  return null;
}
export function slHandoffIds() { return SL_HANDOFFS.map((h) => h.id); }

// ------------------------------------------------------------------ "choose your path" at every parish gate

export const SL_PATHS = [
  { id: "trade", title: "Work a trade", blurb: "Open a station from a site's job board and earn stars toward the passport." },
  { id: "classroom", title: "Take the classroom", blurb: "Short field lessons at the sites, each tied to a classroom station and the trade that uses the idea." },
  { id: "play", title: "Just play", blurb: "Side games behind union skills, the storm-season arc and hidden treasures to find." },
];

/**
 * The board's model for one parish (pure): three paths with rows. `snap` is a gate snapshot
 * (qmSnapshot()); `treasures` is how many parish treasures the caller knows of (the treasure
 * layer's count for this parish, never a place); `page` is the parishes page for hrefs.
 */
export function slPathBoard(parishId, { snap = null, page = SL_PAGE, treasures = null } = {}) {
  const p = slParish(parishId);
  if (!p) return null;
  const s = snap ?? qmSnapshot();
  const trade = p.sites.map((site) => ({ site: site.id, label: site.name, kind: site.kind, trades: site.trades,
    stations: site.stations.map((id) => ({ id, label: id.replace(/-/g, " "), href: lkStationLink(id, { from: SL_WORLD, page, siteId: site.id }) })) }));
  const classroom = slLessonsFor(parishId).map((l) => ({ id: l.id, label: l.title, site: l.site, siteName: slSiteName(parishId, l.site), minutes: l.minutes, k12: l.k12,
    href: `${page}?parish=${encodeURIComponent(parishId)}#lesson=${encodeURIComponent(l.id)}`, stationHref: lkStationLink(l.k12, { from: SL_WORLD, page, siteId: l.site }) }));
  const games = slGamesFor(parishId).map((g) => ({ id: g.id, label: g.title, site: g.site, siteName: g.siteName, open: qmIsOpen(g.gate, s), missing: qmMissing(g.gate, s), note: g.gate.note,
    href: `${page}?parish=${encodeURIComponent(parishId)}#game=${encodeURIComponent(g.id)}` }));
  const arc = SL_MAIN_QUESTS.filter((q) => q.parish === parishId || q.steps.some((st) => st.parish === parishId || st.to?.parish === parishId)).map((q) => ({ id: q.id, label: q.title, tier: q.tier }));
  return { parish: p.id, name: p.name, paths: [
    { ...SL_PATHS[0], rows: trade },
    { ...SL_PATHS[1], rows: classroom },
    { ...SL_PATHS[2], rows: games, arc, treasures: treasures ?? null },
  ] };
}

const slEsc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/**
 * Render the board into `el` (DOM only, no three.js). Returns the model. `onPick(pathId)`
 * fires when a path heading is chosen; rows link to their targets. A locked game shows its
 * note and a link to each required station, never hidden (docs/skill-gates.md).
 */
export function slMountPathBoard(el, parishId, opts = {}) {
  const model = slPathBoard(parishId, opts);
  if (!el || !model) return model;
  const page = opts.page ?? SL_PAGE;
  const stationHref = (id, site) => lkStationLink(id, { from: SL_WORLD, page, siteId: site });
  const rowsHtml = (path) => {
    if (path.id === "trade") return path.rows.map((r) => `<li><strong>${slEsc(r.label)}</strong> — ${r.stations.map((st) => `<a href="${slEsc(st.href)}">${slEsc(st.label)}</a>`).join(", ")}</li>`).join("");
    if (path.id === "classroom") return path.rows.map((r) => `<li><a href="${slEsc(r.href)}">${slEsc(r.label)}</a> <span class="sl-small">at ${slEsc(r.siteName)}</span></li>`).join("");
    const games = path.rows.map((r) => r.open
      ? `<li><a href="${slEsc(r.href)}">${slEsc(r.label)}</a> <span class="sl-small">at ${slEsc(r.siteName)}</span></li>`
      : `<li><span class="sl-locked">Locked:</span> ${slEsc(r.label)} <span class="sl-small">at ${slEsc(r.siteName)} — ${slEsc(r.note)}</span> ${r.missing.map((m) => (m.kind === "station" || m.kind === "k12") ? `<a href="${slEsc(stationHref(m.id, r.site))}">${slEsc(m.label)}</a>` : `<span>${slEsc(m.label)}</span>`).join(", ")}</li>`).join("");
    const arc = path.arc.length ? `<li><strong>Storm season arc:</strong> ${path.arc.map((q) => slEsc(q.label)).join(" → ")}</li>` : "";
    const tz = path.treasures != null ? `<li><strong>Treasures hidden in this parish:</strong> ${Number(path.treasures)}</li>` : "";
    return `${arc}${games}${tz}`;
  };
  el.innerHTML = `<div class="sl-board" role="group" aria-label="Choose your path in ${slEsc(model.name)}"><h2>Choose your path</h2>${model.paths.map((p) =>
    `<section class="sl-path" data-sl-path="${slEsc(p.id)}"><h3><button type="button" data-sl-pick="${slEsc(p.id)}">${slEsc(p.title)}</button></h3><p class="sl-small">${slEsc(p.blurb)}</p><ul>${rowsHtml(p)}</ul></section>`).join("")}</div>`;
  if (typeof opts.onPick === "function") for (const b of el.querySelectorAll("[data-sl-pick]")) b.addEventListener("click", () => opts.onPick(b.getAttribute("data-sl-pick")));
  return model;
}

// ------------------------------------------------------------------ the whole play set, keyed by parish and site

/** Everything this console places at one site: its lessons, games, hand-offs and main-arc steps. */
export function slSitePlay(parishId, siteId) {
  return {
    site: slSiteDef(parishId, siteId),
    lessons: slLessonsFor(parishId, siteId),
    games: slGamesFor(parishId, siteId),
    handoffs: slHandoffsFor({ parish: parishId, site: siteId }),
    arc: SL_MAIN_QUESTS.filter((q) => (q.parish === parishId && q.site === siteId) || q.steps.some((s) => (s.parish === parishId && s.site === siteId) || (s.to?.parish === parishId && s.to?.site === siteId))).map((q) => q.id),
  };
}

/** Counts for a hand-back or a console log. */
export function slCounts() {
  return { parishes: SL_PARISHES.length, sites: SL_PARISHES.reduce((n, p) => n + p.sites.length, 0), mainQuests: SL_MAIN_QUESTS.length,
    sideGames: SL_SIDE_GAMES.length, fieldLessons: SL_FIELD_LESSONS.length, handoffs: SL_HANDOFFS.length, connectors: SL_CONNECTORS.length };
}
