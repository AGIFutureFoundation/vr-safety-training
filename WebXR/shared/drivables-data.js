// The Motor Pool registry — every vehicle and watercraft a learner can drive
// or helm on the platform (console MOTORPOOL, the Crescent brief). Pure: no
// imports, no three.js, no DOM, so tools/check_drivables.mjs and
// tools/check_gates.mjs import it directly and every world's bundle can carry
// it without pulling in a kit.
//
// One entry per drivable:
//   id, name, kind ("road" | "site" | "rail" | "water"), class (a plain word
//   for the board's filter), kit { module: "fleet" | "equipment" | "drivables",
//   build, opts? } (what shared/drivables.js's dvBuild() renders), profile
//   (the handling the drive or helm engine below reads — game values in the
//   same shape and range as Bay World's BW_VEHICLES and the Regatta's
//   RG_YACHT, never a manufacturer's figure), trades (union ids from
//   tools/unions.json; empty with a tradeNote where a craft is owner-operated
//   or recreational), gate (the gate contract: the pre-trip / pre-departure
//   stations that qualify a learner, with a one-line note), pretrip (the
//   checklist step the board walks before the first drive).
//
// Facts rule: no brand, model or maker anywhere; no capacity, horsepower,
// speed or year; limits read "per the plan / manual / placard".
// Every top-level name is prefixed dv/DV_ (tools/bundle_webxr.py concatenates
// modules into one scope).

// -------------------------------------------------------------- profiles
//
// Road and site handling, the shape bayworld/js/sim.js's BW_VEHICLES use:
// `top` m/s (capped by the city's own BW_SPEED_CAP when driven there),
// `accel` m/s², `turn` rad/s at a walking pace, `dims` [w, h, l] from the
// builder's footprint. Water handling, the shape regatta/js/race.js's
// RG_YACHT uses: `max` m/s, `accel`, `drag`, `turn`, `reverse`, `draft` m.
const DV_ROAD = {
  light: { top: 18, accel: 8, turn: 2.4 },
  van: { top: 17, accel: 7, turn: 2.0 },
  medium: { top: 16, accel: 6, turn: 1.6 },
  heavy: { top: 15, accel: 5, turn: 1.1 },
  bus: { top: 15, accel: 5, turn: 1.3 },
  yard: { top: 8, accel: 4, turn: 2.2 },
  lift: { top: 4, accel: 2.5, turn: 2.6 },
  plant: { top: 6, accel: 3, turn: 1.8 },
  tracked: { top: 3, accel: 2, turn: 1.5 },
  rail: { top: 9, accel: 1.5, turn: 0 },
  streetcar: { top: 11, accel: 1.8, turn: 0.35 },
  small: { top: 9, accel: 5, turn: 3.0 },
};
const DV_WATER = {
  fast: { max: 12, accel: 2.0, drag: 0.10, turn: 0.55, reverse: 2.0, draft: 0.9 },
  planing: { max: 14, accel: 2.6, drag: 0.12, turn: 0.7, reverse: 1.6, draft: 0.4 },
  work: { max: 6, accel: 1.2, drag: 0.10, turn: 0.4, reverse: 2.0, draft: 1.4 },
  tow: { max: 5, accel: 0.9, drag: 0.12, turn: 0.35, reverse: 2.2, draft: 2.2 },
  push: { max: 3.5, accel: 0.5, drag: 0.14, turn: 0.18, reverse: 1.6, draft: 2.0 },
  ferry: { max: 6, accel: 0.8, drag: 0.10, turn: 0.25, reverse: 2.0, draft: 1.8 },
  fishing: { max: 5, accel: 0.9, drag: 0.11, turn: 0.4, reverse: 1.8, draft: 1.5 },
  paddle: { max: 2.2, accel: 1.4, drag: 0.35, turn: 1.1, reverse: 1.0, draft: 0.15 },
  sail: { max: 3.0, accel: 0.6, drag: 0.18, turn: 0.9, reverse: 0.6, draft: 0.5, sail: true },
  slow: { max: 4, accel: 0.8, drag: 0.15, turn: 0.5, reverse: 1.5, draft: 0.5 },
  barge: { max: 2.0, accel: 0.3, drag: 0.2, turn: 0.12, reverse: 1.0, draft: 1.2 },
  airboat: { max: 13, accel: 2.4, drag: 0.08, turn: 0.9, reverse: 0, draft: 0.2, noReverse: true },
};

// ------------------------------------------------------------- checklists
const DV_PRETRIP = {
  road: ["Walk around: tyres, wheel nuts, leaks under the vehicle, anything loose", "Cab: seat, mirrors and belt set; horn, wipers and lights working", "Brakes: pedal firm, parking brake holds on the test roll", "Load and doors secured; route and weather checked before rolling"],
  cdl: ["Engine compartment: belts, hoses, fluids, no leaks", "Air brake check as the pre-trip station taught it: build-up, leak, low-air warning, spring brake", "Coupling: fifth wheel locked, glad hands seated, landing gear up, lights and reflectors", "Tyres, rims and hubs on every axle; mirrors and belt; emergency kit aboard"],
  plant: ["Walk around: tracks or tyres, pins and hydraulics, no leaks, guards in place", "Cab: ROPS and belt, mirrors and camera, horn and backup alarm working", "Controls: neutral, brake set, attachments cycled slowly, alarms tested", "Ground crew briefed: blind spots, exclusion zone, the spotter's signals"],
  lift: ["Walk around: forks or platform, mast or boom, chains and hoses, guards", "Tyres and brakes; horn, lights and alarm; seat belt or harness anchor", "Capacity plate readable; load charted per the plate before lifting", "Travel route clear of pedestrians and overhead lines"],
  bus: ["Exterior: tyres, lights, mirrors, emergency exits, wheelchair lift or ramp cycled", "Interior: belt, mirrors set, kneeling and door controls, fire extinguisher and first aid", "Brakes: pedal and parking brake, then the interlock on the door", "Passenger area clean and secured; run sheet and radio check"],
  emergency: ["Apparatus check: fluids, tyres, lights and warning lights, siren tested briefly", "Equipment inventory against the compartment list; nothing missing or loose", "Pump or aerial cycled per the daily check; outriggers and interlocks tested", "Crew seated and belted before the wheels turn"],
  rail: ["Job briefing: movement plan, limits, who is protected and where", "Cab: alerter, horn, bell, headlight and brakes tested from a stop", "Walk the consist: couplers, air hoses, handbrakes released as planned", "Radio check with the ground crew; blue flags cleared before moving"],
  water: ["Hull and bilge: drain plugs in, no water aboard, pumps working", "Fuel and vent, battery, engine cut-off lanyard attached to the helm", "Lifejackets for every person, throwable, sound signal, navigation lights", "Radio check, float plan left ashore, weather and tide read before leaving"],
  paddle: ["Hull, hatches and paddle checked; lifejacket on and zipped", "Weather, wind and current read; stay inside the marked area", "A partner and a plan ashore; whistle attached", "Wet exit and re-entry practised before leaving the shallows"],
  sail: ["Hull, rudder and daggerboard; rigging and lines free of chafe", "Lifejacket on; safety boat on the water before launching", "Wind and weather read; capsize drill agreed with the coach", "Sail set for the wind; the leeward side kept clear of the boom"],
};

// ----------------------------------------------------------- the registry
//
// `kit.module` "fleet" and "equipment" name a builder in shared/fleet.js's
// FLEET_BUILDERS or shared/equipment.js's EQUIPMENT_BUILDERS; "drivables"
// names one of shared/drivables.js's own DV_BUILDERS.
const dvR = (id, name, cls, kit, profile, trades, gate, pretrip, extra = {}) =>
  ({ id, name, kind: "road", class: cls, kit, profile, trades, gate, pretrip: { title: "Pre-trip", items: DV_PRETRIP[pretrip] }, ...extra });
const dvW = (id, name, cls, kit, profile, trades, gate, pretrip = "water", extra = {}) =>
  ({ id, name, kind: "water", class: cls, kit, profile, trades, gate, pretrip: { title: "Pre-departure", items: DV_PRETRIP[pretrip] }, ...extra });
const dvFleet = (build, opts) => ({ module: "fleet", build, ...(opts ? { opts } : {}) });
const dvEquip = (build, opts) => ({ module: "equipment", build, ...(opts ? { opts } : {}) });
const dvOwn = (build, opts) => ({ module: "drivables", build, ...(opts ? { opts } : {}) });
const dvGate = (stations, note, more = {}) => ({ stations, note, ...more });

export const DV_DRIVABLES = [
  // ---- light vehicles and vans
  dvR("crew-pickup", "Crew Pickup", "light", dvFleet("pickup", { livery: { colour: 0xf2b21b, fleetName: "SMARTCITI BUILD", unitNumber: "C-04" } }), DV_ROAD.light, ["liuna", "teamsters"],
    dvGate(["drive-light-vehicle-fleet-and-forklift-course"], "Pass the light-vehicle fleet course before you take the crew truck out."), "road"),
  dvR("pool-sedan", "Pool Sedan", "light", dvFleet("sedan"), DV_ROAD.light, ["afscme"],
    dvGate(["drive-light-vehicle-fleet-and-forklift-course"], "The fleet course is the pool car's key."), "road"),
  dvR("utility-van", "Utility Van", "van", dvFleet("cargoVan", { livery: { colour: 0xf2f2ee, accent: 0xf07a1f, fleetName: "SMARTCITI UTILITIES", unitNumber: "U-12" } }), DV_ROAD.van, ["ibew", "uwua"],
    dvGate(["drive-light-vehicle-fleet-and-forklift-course"], "Van handling starts on the fleet course."), "road"),
  dvR("delivery-van", "Delivery Van", "van", dvFleet("deliveryVan"), DV_ROAD.van, ["nalc", "teamsters"],
    dvGate(["ml-delivery-van-pretrip-and-route-loading"], "Pre-trip the delivery van and load the route first."), "road"),
  dvR("paratransit-shuttle", "Paratransit Shuttle", "van", dvFleet("cargoVan", { livery: { colour: 0x1c8f6f, accent: 0xf1f2ee, fleetName: "SMARTCITI TRANSIT", unitNumber: "T-21" } }), DV_ROAD.van, ["atu"],
    dvGate(["tr-wheelchair-lift-and-securement-on-a-bus"], "Lift and securement are checked before a shuttle carries anyone."), "bus"),
  // ---- straight trucks
  dvR("box-truck", "Box Truck", "truck", dvFleet("boxTruck"), DV_ROAD.medium, ["teamsters"],
    dvGate(["tdl-pretrip-inspection"], "A full pre-trip inspection opens every straight truck."), "road"),
  dvR("flatbed-truck", "Flatbed Truck", "truck", dvOwn("dvFlatbedTruck"), DV_ROAD.medium, ["teamsters"],
    dvGate(["tdl-pretrip-inspection", "tdl-trailer-loading-and-dock-plate"], "Pre-trip, then load securement, before the flatbed rolls."), "road"),
  dvR("water-truck", "Water Truck", "truck", dvOwn("dvWaterTruck"), DV_ROAD.medium, ["iuoe", "teamsters"],
    dvGate(["tdl-pretrip-inspection"], "Pre-trip the tank truck before dust control starts."), "road"),
  dvR("mixer-truck", "Concrete Mixer", "truck", dvOwn("dvMixerTruck"), DV_ROAD.medium, ["teamsters", "opcmia"],
    dvGate(["tdl-pretrip-inspection", "concrete-pour"], "Pre-trip and the pour station come before the drum turns."), "road"),
  dvR("dump-truck", "Dump Truck", "truck", dvEquip("dumpTruck"), DV_ROAD.medium, ["teamsters", "iuoe"],
    dvGate(["tdl-pretrip-inspection", "op-loader-truck-loading-and-blind-spots"], "Pre-trip the truck and learn the loader's blind spots first."), "road"),
  dvR("sweeper", "Street Sweeper", "truck", dvOwn("dvSweeper"), DV_ROAD.yard, ["afscme"],
    dvGate(["drive-city-route-and-turns"], "City turns are the sweeper's whole day."), "road"),
  dvR("wrecker", "Wrecker", "truck", dvOwn("dvWrecker"), DV_ROAD.medium, ["teamsters"],
    dvGate(["tdl-pretrip-inspection", "drive-night-fog-and-rail-crossing"], "Pre-trip and night driving before a tow at the roadside."), "road"),
  // ---- tractors and trailers
  dvR("day-cab-bobtail", "Day Cab Tractor", "tractor", dvFleet("semiTractor"), DV_ROAD.heavy, ["teamsters"],
    dvGate(["tdl-pretrip-inspection"], "Pre-trip inspection is the tractor's key."), "cdl"),
  dvR("sleeper-tractor", "Sleeper Tractor", "tractor", dvFleet("semiTractor", { cab: "sleeper" }), DV_ROAD.heavy, ["teamsters"],
    dvGate(["tdl-pretrip-inspection", "drive-freeway-merge-and-following-distance"], "Pre-trip and the freeway merge before a long haul."), "cdl"),
  dvR("tractor-dry-van", "Tractor and Dry Van", "tractor", dvFleet("tractorTrailer"), DV_ROAD.heavy, ["teamsters"],
    dvGate(["tdl-pretrip-inspection", "drive-backing-serpentine-and-alley-dock"], "Pre-trip and the backing course before a trailer is hooked."), "cdl", { articulated: true }),
  dvR("tractor-flatbed", "Tractor and Flatbed", "tractor", dvFleet("tractorTrailer", { trailer: "flatbed" }), DV_ROAD.heavy, ["teamsters"],
    dvGate(["tdl-pretrip-inspection", "tdl-trailer-loading-and-dock-plate"], "Pre-trip and securement before a flatbed load moves."), "cdl", { articulated: true }),
  dvR("tractor-tanker", "Tractor and Tanker", "tractor", dvFleet("tractorTrailer", { trailer: "tanker" }), DV_ROAD.heavy, ["teamsters"],
    dvGate(["tdl-pretrip-inspection", "tdl-hazmat-labeling-and-segregation"], "Pre-trip and hazmat labelling before a tanker leaves the yard."), "cdl", { articulated: true }),
  dvR("fuel-truck", "Ramp Fuel Truck", "truck", dvEquip("fuelTruck"), DV_ROAD.yard, ["teamsters", "iam"],
    dvGate(["tdl-hazmat-labeling-and-segregation"], "Hazmat labelling before the fuel truck moves on the ramp."), "road"),
  // ---- utility and emergency
  dvR("bucket-truck", "Bucket Truck", "utility", dvFleet("bucketTruck"), DV_ROAD.medium, ["ibew", "uwua"],
    dvGate(["line-truck"], "The line truck station opens the aerial device."), "road"),
  dvR("digger-derrick", "Digger Derrick", "utility", dvOwn("dvDiggerDerrick"), DV_ROAD.medium, ["ibew", "uwua"],
    dvGate(["line-truck"], "The line truck station comes before the derrick sets a pole."), "road"),
  dvR("ambulance", "Ambulance", "emergency", dvFleet("ambulance"), DV_ROAD.medium, ["naemt", "iaff"],
    dvGate(["ambulance-scene-safety"], "Scene safety before the ambulance responds."), "emergency"),
  dvR("fire-engine", "Fire Engine", "emergency", dvFleet("fireEngine"), DV_ROAD.heavy, ["iaff"],
    dvGate(["fire-pump"], "The pump station qualifies the engine's operator."), "emergency"),
  dvR("ladder-truck", "Ladder Truck", "emergency", dvOwn("dvLadderTruck"), DV_ROAD.heavy, ["iaff"],
    dvGate(["aerial-ladder"], "The aerial ladder station before the truck leaves the bay."), "emergency"),
  // ---- transit and rail
  dvR("transit-bus", "Transit Bus", "transit", dvFleet("busTransit"), DV_ROAD.bus, ["atu", "twu"],
    dvGate(["bus-yard-fuelling-and-brake-check"], "The yard brake check opens the bus."), "bus"),
  dvR("school-bus", "School Bus", "transit", dvFleet("schoolBus"), DV_ROAD.bus, ["csea", "atu"],
    dvGate(["ed-bus-pretrip-and-loading-zone"], "Pre-trip and the loading zone before pupils board."), "bus"),
  dvR("streetcar", "Streetcar", "transit", dvOwn("dvStreetcar"), DV_ROAD.streetcar, ["atu"],
    dvGate(["drive-city-route-and-turns"], "City running before the streetcar leaves the barn."), "bus", { kind: "rail", onRails: true }),
  dvR("rail-switcher", "Rail Switcher", "rail", dvOwn("dvRailSwitcher"), DV_ROAD.rail, ["blet", "smart-td"],
    dvGate(["ra-locomotive-cab-startup-and-alerter", "ra-blue-flag-protection-in-the-yard"], "Cab start-up and blue-flag protection before a yard move."), "rail", { kind: "rail", onRails: true }),
  // ---- yard and lift
  dvR("forklift", "Counterbalance Forklift", "lift", dvFleet("forkliftCounterbalance"), DV_ROAD.lift, ["ilwu", "teamsters"],
    dvGate(["forklift-dock"], "The dock forklift station opens every lift truck."), "lift"),
  dvR("reach-truck", "Reach Truck", "lift", dvOwn("dvReachTruck"), DV_ROAD.lift, ["ufcw", "teamsters"],
    dvGate(["forklift-dock"], "Forklift training before the narrow aisle."), "lift"),
  dvR("telehandler", "Telehandler", "lift", dvOwn("dvTelehandler"), DV_ROAD.plant, ["iuoe", "carpenters"],
    dvGate(["forklift-dock", "rl-critical-lift-plan-and-signalperson"], "Forklift training and the lift plan before the boom extends."), "lift"),
  dvR("yard-hostler", "Yard Hostler", "yard", dvFleet("yardHustler"), DV_ROAD.yard, ["ilwu", "ila"],
    dvGate(["po-yard-hostler-and-pedestrian-separation"], "Pedestrian separation before a hostler moves a chassis."), "road"),
  // ---- zero-emission port equipment (CLEANPORTS): electric and hydrogen variants of the terminal's
  // machines, each gated on its pre-use / pre-trip station. Generic shapes; no maker, model or figure.
  dvR("cp-electric-yard-tractor", "Battery-Electric Yard Tractor", "yard", dvFleet("yardHustler", { livery: { colour: 0x2f6f9f, fleetName: "ZERO EMISSION", unitNumber: "EY-1" } }), DV_ROAD.yard, ["ilwu", "iam"],
    dvGate(["cp-zero-emission-terminal-equipment-pre-use"], "The zero-emission pre-use inspection — charge cable hung, charge read, dash warnings read — before the tractor moves."), "road", { zeroEmission: "battery-electric" }),
  dvR("cp-hydrogen-yard-tractor", "Hydrogen Fuel Cell Yard Tractor", "yard", dvFleet("yardHustler", { livery: { colour: 0x3f7f4a, fleetName: "HYDROGEN FUEL CELL", unitNumber: "HY-2" } }), DV_ROAD.yard, ["ilwu", "iam"],
    dvGate(["cp-zero-emission-terminal-equipment-pre-use", "cp-hydrogen-fuel-cell-equipment-and-fuelling"], "The pre-use inspection and the hydrogen fuelling station before a fuel cell tractor moves."), "road", { zeroEmission: "hydrogen fuel cell" }),
  dvR("cp-electric-top-pick", "Battery-Electric Top Pick", "lift", dvFleet("forkliftCounterbalance", { livery: { colour: 0xf0b323, fleetName: "ZERO EMISSION", unitNumber: "TP-3" } }), DV_ROAD.lift, ["ilwu"],
    dvGate(["cp-zero-emission-terminal-equipment-pre-use"], "Twistlocks cycled and the hydraulic lines looked at on the pre-use inspection before the top pick lifts."), "lift", { zeroEmission: "battery-electric" }),
  dvR("cp-electric-straddle-carrier", "Battery-Electric Straddle Carrier", "yard", dvOwn("dvStraddleCarrier"), DV_ROAD.yard, ["ilwu"],
    dvGate(["cp-zero-emission-terminal-equipment-pre-use"], "Legs, tyres, mirrors and cameras walked on the pre-use inspection before the carrier travels."), "plant", { zeroEmission: "battery-electric" }),
  dvR("cp-electric-drayage-tractor", "Battery-Electric Drayage Tractor", "tractor", dvFleet("semiTractor", { livery: { colour: 0xdfe4e8, fleetName: "ZERO EMISSION DRAYAGE", unitNumber: "ED-5" } }), DV_ROAD.heavy, ["teamsters"],
    dvGate(["cp-zero-emission-drayage-truck-pre-trip"], "The zero-emission drayage pre-trip — report read, charge matched to the turns, air built, chassis locked — before the first port turn."), "cdl", { zeroEmission: "battery-electric" }),
  dvR("pushback-tug", "Pushback Tug", "yard", dvEquip("pushbackTug"), DV_ROAD.yard, ["iam", "twu"],
    dvGate(["av-pushback-tug-and-towbar-connection"], "The towbar connection before a pushback."), "road"),
  dvR("belt-loader", "Belt Loader", "yard", dvEquip("cargoBeltLoader"), DV_ROAD.yard, ["iam", "twu"],
    dvGate(["av-baggage-belt-loader-and-hold-loading"], "Hold loading before the belt loader approaches an aircraft."), "road"),
  dvR("deicing-truck", "De-icing Truck", "yard", dvEquip("deicingTruck"), DV_ROAD.yard, ["iam"],
    dvGate(["av-deicing-truck-boom-operations"], "Boom operations before the de-icing truck rolls."), "road"),
  dvR("potable-water-truck", "Potable Water Truck", "yard", dvEquip("serviceCart", { kind: "potable" }), DV_ROAD.yard, ["iam", "twu"],
    dvGate(["av-lavatory-and-potable-water-separation"], "Potable and lavatory separation before a service run."), "road"),
  // ---- plant
  dvR("skid-steer", "Skid Steer", "plant", dvEquip("skidSteer"), DV_ROAD.plant, ["liuna", "iuoe"],
    dvGate(["op-loader-truck-loading-and-blind-spots"], "Loader blind spots before the skid steer works a pad."), "plant"),
  dvR("wheel-loader", "Wheel Loader", "plant", dvEquip("wheelLoader"), DV_ROAD.plant, ["iuoe"],
    dvGate(["op-loader-truck-loading-and-blind-spots"], "Truck loading and blind spots qualify the loader."), "plant"),
  dvR("backhoe", "Backhoe Loader", "plant", dvEquip("backhoe"), DV_ROAD.plant, ["iuoe"],
    dvGate(["op-excavator-trench-and-utility-locate"], "Utility locate before the backhoe digs."), "plant"),
  dvR("excavator", "Excavator", "plant", dvEquip("excavator"), DV_ROAD.tracked, ["iuoe"],
    dvGate(["op-excavator-trench-and-utility-locate"], "Trench and utility locate before the excavator digs."), "plant", { kind: "site" }),
  dvR("amphibious-excavator", "Amphibious Excavator", "plant", dvEquip("amphibiousExcavator"), DV_ROAD.tracked, ["iuoe"],
    dvGate(["br-tidal-marsh-grading-amphibious-excavator"], "Marsh grading before the pontoons enter the wetland."), "plant", { kind: "site" }),
  dvR("dozer", "Crawler Dozer", "plant", dvEquip("dozer"), DV_ROAD.tracked, ["iuoe"],
    dvGate(["op-dozer-slope-work-and-rollover-protection"], "Slope work and rollover protection before the dozer moves."), "plant", { kind: "site" }),
  dvR("grader", "Motor Grader", "plant", dvEquip("grader"), DV_ROAD.plant, ["iuoe"],
    dvGate(["op-grader-fine-grade-and-crown"], "Fine grade and crown before the blade drops."), "plant"),
  dvR("compactor", "Soil Compactor", "plant", dvEquip("compactor"), DV_ROAD.plant, ["iuoe"],
    dvGate(["op-compactor-lift-thickness-and-edge"], "Lift thickness and edge work before the drum rolls."), "plant"),
  dvR("mobile-crane", "Mobile Crane", "plant", dvEquip("mobileCrane"), DV_ROAD.plant, ["iuoe"],
    dvGate(["crane-yard"], "The crane yard station before a rough-terrain crane travels."), "plant"),
  dvR("crawler-crane", "Crawler Crane", "plant", dvEquip("crawlerCrane"), DV_ROAD.tracked, ["iuoe"],
    dvGate(["op-crawler-crane-assembly-and-load-chart"], "Assembly and the load chart before the crawler walks."), "plant", { kind: "site" }),
  dvR("haul-truck", "Haul Truck", "plant", dvOwn("dvHaulTruck"), DV_ROAD.plant, ["umwa", "iuoe"],
    dvGate(["mm-haul-truck-berm"], "Berm and dump point before the haul truck runs the pit road."), "plant"),
  dvR("boom-lift", "Boom Lift", "lift", dvEquip("aerialBoomLift"), DV_ROAD.lift, ["ibew", "iupat"],
    dvGate(["fp-anchor-selection-and-rescue-plan"], "Harness anchor and rescue plan before the platform lifts."), "lift"),
  dvR("scissor-lift", "Scissor Lift", "lift", dvEquip("scissorLift"), DV_ROAD.lift, ["ibew", "carpenters"],
    dvGate(["fp-anchor-selection-and-rescue-plan"], "Fall protection before the scissor lift rises."), "lift"),
  // ---- grounds and small vehicles
  dvR("ride-on-mower", "Ride-On Mower", "grounds", dvOwn("dvMower"), DV_ROAD.small, ["afscme", "seiu"],
    dvGate(["gk-ride-on-mower-pre-start-and-slope-work"], "Pre-start and slope work before the mower leaves the shed."), "plant"),
  dvR("utv", "Utility Terrain Vehicle", "grounds", dvOwn("dvUtv"), DV_ROAD.small, ["afscme", "liuna"],
    dvGate(["drive-light-vehicle-fleet-and-forklift-course"], "The fleet course before the trail vehicle."), "road"),

  // ================================================================ water
  dvW("pilot-boat", "Pilot Boat", "harbour", dvOwn("dvPilotBoat"), DV_WATER.fast, ["mmp"],
    dvGate(["pilot-transfer"], "Pilot transfer before the pilot boat runs to the ship.")),
  dvW("harbour-tug", "Harbour Tug", "harbour", dvOwn("dvTug"), DV_WATER.tow, ["ibu", "mmp", "meba"],
    dvGate(["mw-workboat-towing-and-line-handling"], "Towing and line handling qualify the tug's crew.")),
  dvW("push-boat", "Push Boat and Barges", "river", dvOwn("dvPushBoat"), DV_WATER.push, ["ibu", "siu"],
    dvGate(["mooring-line", "br-barge-loading-of-contaminated-sediment"], "Mooring lines and barge loading before a tow is faced up."), "water", { composite: true }),
  dvW("crew-boat", "Crew Boat", "offshore", dvOwn("dvCrewBoat"), DV_WATER.fast, ["siu", "meba"],
    dvGate(["vessel-gangway-and-hatch-cover-safety"], "Gangway and hatch safety before the crew boat carries a crew.")),
  dvW("skiff", "Work Skiff", "small", dvFleet("skiff"), DV_WATER.planing, ["ibu"],
    dvGate(["me-water-column-sampling-from-a-small-boat"], "Small-boat sampling before the skiff leaves the pier.")),
  dvW("airboat", "Airboat", "marsh", dvOwn("dvAirboat"), DV_WATER.airboat, ["afscme", "liuna"],
    dvGate(["br-vhf-and-navigation-in-a-work-zone"], "Radio and navigation before an airboat crosses the marsh.")),
  dvW("dredge-tender", "Dredge Tender", "harbour", dvFleet("workboat", { livery: { colour: 0xf2c14b, accent: 0x1b1e22, fleetName: "SMARTCITI SURVEY", unitNumber: "S-06" } }), DV_WATER.work, ["iuoe", "ibu"],
    dvGate(["dredge-barge"], "The dredge barge station before the tender works the spread.")),
  dvW("fireboat", "Fireboat", "emergency", dvOwn("dvFireboat"), DV_WATER.work, ["iaff"],
    dvGate(["fire-pump", "yc-man-overboard-recovery-drill"], "Pump work and the overboard drill before the fireboat answers a call.")),
  dvW("patrol-boat", "Harbour Patrol Boat", "harbour", dvOwn("dvPatrolBoat"), DV_WATER.planing, ["afscme"],
    dvGate(["br-vhf-and-navigation-in-a-work-zone"], "Radio and navigation before a harbour patrol.")),
  dvW("ferry", "Passenger Ferry", "transit", dvOwn("dvFerry"), DV_WATER.ferry, ["ibu", "mmp"],
    dvGate(["mw-ferry-deckhand-and-passenger-safety"], "Deckhand and passenger safety before the ferry sails.")),
  dvW("shrimp-trawler", "Shrimp Trawler", "fishing", dvOwn("dvTrawler"), DV_WATER.fishing, [],
    dvGate(["br-cold-water-immersion-and-mob-recovery", "mooring-line"], "Immersion and overboard recovery before the nets go out."), "water",
    { tradeNote: "Owner-operated fishery; deck practice as the workboat stations teach it." }),
  dvW("oyster-lugger", "Oyster Lugger", "fishing", dvOwn("dvLugger"), DV_WATER.fishing, [],
    dvGate(["me-oyster-reef-monitoring-and-settlement-tiles"], "Reef monitoring before the lugger works a bed."), "water",
    { tradeNote: "Owner-operated fishery; reef stewardship as the monitoring station teaches it." }),
  dvW("bay-shrimper", "Bay Shrimper", "fishing", dvOwn("dvBayShrimper"), DV_WATER.fishing, [],
    dvGate(["br-cold-water-immersion-and-mob-recovery"], "Overboard recovery before the skimmer frames swing out."), "water",
    { tradeNote: "Owner-operated fishery; small-boat safety as the workboat stations teach it." }),
  dvW("sailing-dinghy", "Sailing Dinghy", "recreation", dvOwn("dvDinghy"), DV_WATER.sail, [],
    dvGate(["yc-man-overboard-recovery-drill"], "The overboard drill before a dinghy sails.", { k12: ["k12-buoyancy-and-pressure-in-the-deep"] }), "sail",
    { tradeNote: "Community sailing and the K-12 programme, with a coach in the safety boat." }),
  dvW("pontoon-boat", "Pontoon Boat", "recreation", dvOwn("dvPontoon"), DV_WATER.slow, [],
    dvGate(["yc-line-handling-and-docking-in-crosswind"], "Line handling and docking before a pontoon leaves the slip."), "water",
    { tradeNote: "Recreational hire; the marina staff who run it practise the yacht-club stations." }),
  dvW("kayak", "Sea Kayak", "recreation", dvOwn("dvKayak"), DV_WATER.paddle, ["afscme"],
    dvGate(["br-cold-water-immersion-and-mob-recovery"], "Cold-water immersion before a kayak leaves the beach.", { k12: ["k12-reading-a-map-scale-in-bay-world"] }), "paddle"),
  dvW("research-vessel", "Research Vessel", "science", dvOwn("dvResearchVessel"), DV_WATER.work, ["meba", "upte-cwa"],
    dvGate(["me-water-column-sampling-from-a-small-boat", "ballast-water-sampling"], "Sampling stations before the research vessel deploys gear.")),
  dvW("buoy-tender", "Buoy Tender", "harbour", dvOwn("dvBuoyTender"), DV_WATER.work, ["ibu", "siu"],
    dvGate(["mooring-line", "br-workboat-crane-lift-from-water"], "Mooring lines and a crane lift from the water before a buoy is tended.")),
  dvW("work-barge", "Spud Work Barge", "river", dvFleet("spudBarge"), DV_WATER.barge, ["iuoe", "ibu"],
    dvGate(["dredge-barge", "mooring-line"], "Barge work and mooring lines before the spuds lift."), "water", { pushed: true }),
  dvW("lift-boat", "Lift Boat", "offshore", dvOwn("dvLiftBoat"), DV_WATER.slow, ["iuoe", "siu"],
    dvGate(["op-pile-driving-rig-and-lead-setup", "vessel-gangway-and-hatch-cover-safety"], "Rig set-up and gangway safety before the legs jack down.")),
];

export const DV_ROAD_COUNT = DV_DRIVABLES.filter((d) => d.kind !== "water").length;
export const DV_WATER_COUNT = DV_DRIVABLES.filter((d) => d.kind === "water").length;
const DV_BY_ID = new Map(DV_DRIVABLES.map((d) => [d.id, d]));
export function dvById(id) { return DV_BY_ID.get(id) ?? null; }

/**
 * The gate contract items (tools/briefs/frontier-brief.md): one per drivable,
 * discovered by tools/check_gates.mjs and tools/gen_gate_names.mjs from this
 * `…GATED…` export. A drivable is *available* on the Motor Pool board once
 * its gate is open; locked rows show the note and a link to each station.
 */
export const DV_GATED = DV_DRIVABLES.map((d) => ({
  id: `dv-${d.id}`, kind: "drivable", drivable: d.id, title: d.name, world: "bayworld",
  site: "motor-pool", siteName: "Motor Pool", summary: `${d.kind === "water" ? "Helm" : "Drive"} the ${d.name.toLowerCase()} once its ${d.pretrip.title.toLowerCase()} station is done.`,
  gate: d.gate,
}));

// ------------------------------------------------------------ drive engine
//
// Bay World's own bwStepVehicle (bayworld/js/sim.js) generalised over a
// profile: a hard cap, grip that falls with speed, no drift, a refused move
// when `env.blocked(x, z)` says so. `state`: { x, z, heading, speed };
// `input`: { throttle, steer, brake } (shared/input.js's driveInputFrom).
// `env`: { cap?, bounds?: { minX, maxX, minZ, maxZ }, blocked?(x, z) → bool,
// rails?: [[x, z]…] (a rail vehicle follows the polyline, steer ignored) }.
const dvClamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

export function dvStepDrive(state, input, dt, profile, env = {}) {
  const top = Math.min(profile.top, env.cap ?? Infinity);
  const throttle = dvClamp(input.throttle ?? 0, -1, 1);
  let speed = state.speed ?? 0;
  const target = throttle >= 0 ? throttle * top : throttle * top * 0.5;
  if (speed < target) speed = Math.min(target, speed + profile.accel * dt);
  else speed = Math.max(target, speed - profile.accel * 1.6 * dt);
  if (input.brake) speed = speed > 0 ? Math.max(0, speed - profile.accel * 2.4 * dt) : Math.min(0, speed + profile.accel * 2.4 * dt);
  let heading = state.heading;
  let x, z;
  if (env.rails?.length > 1) {
    // On rails: arc-length along the polyline; the heading is the track's.
    const s = dvClamp((state.s ?? 0) + speed * dt, 0, dvPolyLength(env.rails));
    const p = dvPolyAt(env.rails, s);
    if (s <= 0 || s >= dvPolyLength(env.rails)) speed = 0;   // the end of the track is a stop
    return { ...state, x: p.x, z: p.z, s, heading: p.heading, speed, collided: false };
  }
  const steer = dvClamp(input.steer ?? 0, -1, 1);
  const grip = 1 - 0.55 * Math.min(1, Math.abs(speed) / (top || 1));
  heading = state.heading + steer * profile.turn * grip * Math.sign(speed || 1) * dt;
  x = state.x + Math.sin(heading) * speed * dt; z = state.z + Math.cos(heading) * speed * dt;
  let collided = false;
  if (env.blocked && env.blocked(x, z)) { collided = true; x = state.x; z = state.z; speed *= -0.15; }
  if (env.bounds) { x = dvClamp(x, env.bounds.minX + 1, env.bounds.maxX - 1); z = dvClamp(z, env.bounds.minZ + 1, env.bounds.maxZ - 1); }
  return { ...state, x, z, heading, speed, collided };
}

export function dvPolyLength(pts) {
  let len = 0;
  for (let i = 0; i < pts.length - 1; i++) len += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
  return len;
}
export function dvPolyAt(pts, s) {
  let d = Math.max(0, s);
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const seg = Math.hypot(bx - ax, bz - az) || 1e-6;
    if (d <= seg || i === pts.length - 2) {
      const t = dvClamp(d / seg, 0, 1);
      return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, heading: Math.atan2(bx - ax, bz - az) };
    }
    d -= seg;
  }
  return { x: pts[0][0], z: pts[0][1], heading: 0 };
}

// ------------------------------------------------------------- helm engine
//
// The Regatta's rgAdvanceBoat (regatta/js/race.js) generalised over a
// profile: throttle toward a target speed, hull drag, rudder authority that
// grows with way on, wind leeway, the shore stopping a hull. `state`:
// { x, z, heading, speed }; `input`: { throttle, rudder }; `env`:
// { onWater?(x, z) → bool, wind?: { speed, dir }, bounds? }. A profile with
// `noReverse` (an airboat) treats negative throttle as idle; a `sail`
// profile makes way only off the wind (a run or a reach), the way a
// beginner's dinghy does.
const dvWrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export function dvStepHelm(state, input, dt, profile, env = {}) {
  let throttle = dvClamp(input.throttle ?? 0, -1, 1), rudder = dvClamp(input.rudder ?? 0, -1, 1);
  if (profile.noReverse && throttle < 0) throttle = 0;
  let speed = state.speed ?? 0, heading = state.heading;
  const wind = env.wind ?? { speed: 3, dir: 0.9 };
  let max = profile.max;
  if (profile.sail) {
    // Off-wind sailing only: the sail draws when the wind is aft of the beam.
    const rel = Math.cos(dvWrap(wind.dir - heading));
    max = profile.max * dvClamp(rel * 0.8 + 0.3, 0, 1) * dvClamp(wind.speed / 5, 0.2, 1.2);
  }
  const target = throttle >= 0 ? throttle * max : throttle * profile.reverse;
  speed += (target - speed) * Math.min(1, profile.accel * dt / Math.max(1, Math.abs(target - speed) * 0.35 + 1));
  speed -= speed * profile.drag * dt;
  if (Math.abs(speed) < 0.01 && throttle === 0) speed = 0;
  const steer = rudder * profile.turn * Math.min(1, Math.abs(speed) / 3 + 0.15) * dt;
  heading = dvWrap(heading + steer * (speed >= 0 ? 1 : -1));
  const leeway = wind.speed * 0.04 * (profile.draft < 0.5 ? 1.5 : 1);
  heading = dvWrap(heading + Math.sin(wind.dir - heading) * 0.004 * wind.speed * dt);
  let nx = state.x + (Math.sin(heading) * speed + Math.sin(wind.dir) * leeway) * dt;
  let nz = state.z + (Math.cos(heading) * speed + Math.cos(wind.dir) * leeway) * dt;
  let aground = false;
  if (env.onWater && !env.onWater(nx, nz)) { aground = true; nx = state.x; nz = state.z; speed *= 0.2; }
  if (env.bounds) { nx = dvClamp(nx, env.bounds.minX + 1, env.bounds.maxX - 1); nz = dvClamp(nz, env.bounds.minZ + 1, env.bounds.maxZ - 1); }
  return { ...state, x: nx, z: nz, heading, speed, aground };
}

/**
 * The scripted run tools/check_drivables.mjs drives every entry through:
 * twenty seconds at a fixed step — throttle up, a steady turn, a straight,
 * then brake (or reverse thrust) to a stop. Returns the trace and the
 * verdict: moved, stayed inside the bounds, never collided or grounded in
 * open water, and came to rest at the end.
 */
export function dvScriptedRun(entry, { dt = 0.05, seconds = 20, env = null } = {}) {
  const water = entry.kind === "water";
  const bounds = { minX: -400, maxX: 400, minZ: -400, maxZ: 400 };
  const e = env ?? (water ? { onWater: () => true, wind: { speed: 3, dir: 0.9 }, bounds } : { bounds, blocked: () => false });
  let s = { x: 0, z: 0, heading: 0, speed: 0, s: 0 };
  const trace = [];
  let maxSpeed = 0, collisions = 0;
  const steps = Math.round(seconds / dt);
  for (let i = 0; i < steps; i++) {
    const t = i * dt;
    let input;
    // The last phase is how a helm actually stops: astern thrust while there
    // is way on, then neutral and let the hull drag settle.
    if (water) input = t < 8 ? { throttle: 1, rudder: 0 } : t < 12 ? { throttle: 0.8, rudder: 0.6 } : t < 15 ? { throttle: 0.6, rudder: 0 } : { throttle: !entry.profile.noReverse && s.speed > 0.4 ? -0.4 : 0, rudder: 0 };
    else input = t < 8 ? { throttle: 1, steer: 0 } : t < 12 ? { throttle: 0.8, steer: 0.5 } : t < 15 ? { throttle: 0.6, steer: 0 } : { throttle: 0, steer: 0, brake: true };
    s = water ? dvStepHelm(s, input, dt, entry.profile, e) : dvStepDrive(s, input, dt, entry.profile, e);
    maxSpeed = Math.max(maxSpeed, Math.abs(s.speed));
    if (s.collided || s.aground) collisions += 1;
    if (i % 20 === 0) trace.push({ t: +t.toFixed(2), x: +s.x.toFixed(2), z: +s.z.toFixed(2), speed: +s.speed.toFixed(2) });
  }
  const dist = Math.hypot(s.x, s.z);
  const inBounds = s.x > bounds.minX && s.x < bounds.maxX && s.z > bounds.minZ && s.z < bounds.maxZ;
  const stopped = Math.abs(s.speed) < (water ? 0.6 : 0.05);
  return { ok: dist > 5 && inBounds && collisions === 0 && stopped && maxSpeed <= (water ? entry.profile.max : entry.profile.top) + 1e-6, dist, maxSpeed, collisions, stopped, inBounds, final: s, trace };
}

/** A BW_VEHICLES-shaped record for a road entry, what bayworld/js/sim.js's
 *  bwRegisterVehicles takes so bwStepVehicle can drive it in the city. */
export function dvRoadParams(entry, dims = [2.4, 2.0, 6.0]) {
  return { id: `dv-${entry.id}`, name: entry.name, builder: entry.kit.build, top: entry.profile.top, accel: entry.profile.accel, turn: entry.profile.turn, dims, reputation: 0, drivable: entry.id };
}
