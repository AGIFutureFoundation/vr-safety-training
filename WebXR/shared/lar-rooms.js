// LA-ROOMS — walk-in interiors for the Louisiana site kinds (console `lar`, docs/consoles/LA-ROOMS.md).
// SmartCiti.X Powered by AGI Corp.
//
// Six rooms on INTERIORS' shell (ix-interiors.js: styles lar-hangar, lar-fab-shop, lar-data-hall, lar-control-room,
// lar-compressor, lar-craft-hall; the sites that open them are IX_KIND_STYLE's hangar / compressor / wellpad and
// IX_SITE_STYLE's single sites). This module furnishes them the CLASSROOMS way (cr-classrooms.js): one dresser per style,
// and every object the learner can use launches ONE real thing — a catalog station or a Louisiana programme simulation
// (lp-programme-data.js LP_SIMS, registered with PROJECTSIM by lpRegisterSims). The rooms are GENERIC BY KIND: the shell's
// sign says "a generic room for this kind of site — not a model of the real building", no project figure is quoted, and the
// craft hall's union names are trade references (tools/unions.json) under the programme's no-partnership line.
//
// SEAMS (every top-level name is lar/LAR_-prefixed: the bundler shares one scope; three.js comes from the caller):
//   LAR_STYLES                         the six style ids and what each room is
//   LAR_SHAPES                         plain data: object shapes as unit-box parts [w, h, d, dx, y, dz, colour] (front = +z)
//   larRoomsFor(parish)                -> [{ id, style, parish, site, name, note, fixtures: [{ id, shape, label, at: [x, z],
//                                          face: "s"|"n"|"e"|"w"|"up", launch: { type: "station"|"sim", id } }],
//                                          deco: [{ shape, at, face, phone }] }] — plain data, room-local metres
//   larSpot(fixture)                   -> [x, z]: where the learner stands to use it (in front of its face)
//   larDress({ THREE, group, room, r, tier, launch })  furnish one ix room: ONE InstancedMesh ("lar-dress", per-instance
//                                          colour) for every part, tall parts as colliders, one room.addAction per fixture
//                                          (a station as kind "station" so the mount's onLaunch takes it; a simulation as
//                                          kind "lar-sim" running `launch`). The phone tier ("low") drops decoration only.
//   larRegisterDressers(ix, { parish, launch })  -> the styles registered; ix = { ixRegisterDresser } (guarded: null = none)
//   `launch(l, r)` is the world's handler: the parishes app passes crLaunch (a station link, psWorld.open for a simulation).

import { ixStyleFor } from "./ix-interiors.js";
import { LP_PATHWAYS, LP_NO_PARTNERSHIP } from "./lp-programme-data.js";

export const LAR_STYLES = {
  "lar-hangar": "an aircraft hangar (aircraft paint, maintenance and conversion; a vehicle-processing variant at the launch site)",
  "lar-fab-shop": "a shipyard fabrication shop (plate cutting, hull-block hot work, marine electrical, blast and paint)",
  "lar-data-hall": "a data hall and its electrical room (busway, raised floor, cooling, switchgear, UPS)",
  "lar-control-room": "a process control room (alarms, fire and gas, permits and lockout)",
  "lar-compressor": "a gas storage compressor building (compressor lockout, gas detection, pressure test, hot tap)",
  "lar-craft-hall": "a training hall for the Louisiana programme's crafts (a bay per role pathway)",
};

/** Object shapes: unit-box parts [w, h, d, dx, y, dz, colourKey | hex], the object's front facing +z before rotation. */
export const LAR_SHAPES = {
  jack: [[0.9, 2.6, 0.9, 0, 1.3, 0, "accent"], [0.3, 0.4, 0.3, 0, 2.8, 0, "metal"]],
  stand: [[2.2, 2.4, 1.6, 0, 1.2, 0, "accent"], [2.2, 1.0, 0.06, 0, 2.9, 0.78, "metal"]],
  cart: [[1.4, 1.0, 0.9, 0, 0.5, 0, "accent"], [0.3, 0.3, 0.3, 0.4, 1.15, 0, "dark"]],
  board: [[2.2, 1.3, 0.08, 0, 1.7, 0, "pale"], [2.3, 0.1, 0.1, 0, 2.4, 0, "trim"]],
  panel: [[1.6, 2.0, 0.5, 0, 1.0, 0, "metal"], [1.2, 0.5, 0.05, 0, 1.5, 0.26, "accent"]],
  bench: [[2.0, 0.9, 0.8, 0, 0.45, 0, "wood"], [1.8, 0.6, 0.05, 0, 1.5, -0.38, "metal"]],
  tug: [[1.8, 1.2, 3.0, 0, 0.6, 0, "accent"], [0.2, 0.2, 1.4, 0, 0.35, 2.2, "metal"]],
  rack: [[1.2, 1.8, 0.4, 0, 0.9, 0, "trim"]],
  booth: [[3.5, 3.0, 0.4, 0, 1.5, 0, "pale"], [3.0, 0.5, 0.6, 0, 3.3, 0, "metal"]],
  sprayer: [[0.8, 1.2, 0.8, 0, 0.6, 0, "accent"], [0.1, 1.4, 0.1, 0.3, 1.3, 0, "metal"]],
  table: [[3.0, 0.9, 1.8, 0, 0.45, 0, "metal"], [3.0, 0.3, 0.2, 0, 1.3, -0.8, "accent"]],
  hullblock: [[6, 3.5, 4.5, 0, 1.75, 0, "metal"], [1.0, 1.4, 0.05, 0, 1.0, 2.26, "dark"]],
  post: [[0.5, 1.4, 0.5, 0, 0.7, 0, "accent"], [0.3, 0.6, 0.3, 0, 1.7, 0, "accent"]],
  manway: [[0.9, 0.9, 0.1, 0, 1.2, 0, "dark"]],
  weldbooth: [[2.5, 2.2, 2.0, 0, 1.1, 0, "trim"], [2.3, 1.8, 0.05, 0, 1.1, 1.01, "accent"]],
  pendant: [[0.25, 0.5, 0.25, 0, 1.4, 0, "accent"], [0.04, 6, 0.04, 0, 4.65, 0, "dark"], [0.8, 0.8, 0.8, 0, 8.0, 0, "accent"]],
  pedestal: [[0.6, 1.3, 0.5, 0, 0.65, 0, "metal"], [0.5, 0.3, 0.1, 0, 1.1, 0.26, "accent"]],
  gangway: [[1.3, 1.0, 4.0, 0, 0.5, 0, "metal"], [0.05, 1.0, 4, -0.6, 1.5, 0, "accent"], [0.05, 1.0, 4, 0.6, 1.5, 0, "accent"]],
  busway: [[0.6, 0.5, 0.4, 0, 2.9, 0, "accent"], [0.3, 0.2, 6, 0, 3.5, 0, "metal"]],
  kiosk: [[0.8, 1.3, 0.6, 0, 0.65, 0, "dark"], [0.7, 0.5, 0.05, 0, 1.5, 0.2, "accent"]],
  lifter: [[0.6, 0.6, 0.6, 0, 0.3, 0, "metal"], [1.3, 1.0, 0.05, 0, 0.5, -0.7, "accent"]],
  crah: [[2.4, 2.1, 0.9, 0, 1.05, 0, "pale"], [2.0, 0.3, 0.05, 0, 1.7, 0.46, "accent"]],
  switchgear: [[4.0, 2.2, 0.8, 0, 1.1, 0, "metal"], [0.4, 0.3, 0.05, -1, 1.6, 0.41, "accent"], [0.4, 0.3, 0.05, 1, 1.6, 0.41, "accent"]],
  ups: [[3.0, 2.0, 0.8, 0, 1.0, 0, "dark"], [2.8, 0.2, 0.05, 0, 1.7, 0.41, "accent"]],
  valves: [[2.0, 1.4, 0.8, 0, 0.7, 0, "metal"], [0.35, 1.8, 0.35, -0.7, 0.9, 0, "accent"], [0.35, 1.8, 0.35, 0.7, 0.9, 0, "accent"]],
  riser: [[0.5, 2.2, 0.5, 0, 1.1, 0, "accent"], [0.4, 0.4, 0.2, 0, 1.2, 0.3, "accent"]],
  console: [[4.5, 0.8, 1.2, 0, 0.4, 0, "dark"], [4.2, 0.6, 0.08, 0, 1.2, -0.5, "dark"]],
  cabinet: [[1.2, 2.0, 0.6, 0, 1.0, 0, "metal"]],
  skid: [[6, 2.0, 2.5, 0, 1.0, 0, "metal"], [1.8, 1.2, 1.2, -1.8, 2.6, 0, "accent"], [0.6, 0.6, 2.4, 1.8, 2.3, 0, "metal"]],
  manifold: [[3.0, 1.2, 0.8, 0, 0.6, 0, "metal"], [0.25, 1.6, 0.25, -1, 0.8, 0.2, "accent"], [0.25, 1.6, 0.25, 1, 0.8, 0.2, "accent"]],
  hottap: [[1.0, 1.6, 1.0, 0, 0.8, 0, "accent"], [2.4, 0.4, 0.4, 0, 1.0, -0.3, "metal"]],
  meter: [[2.5, 1.0, 0.8, 0, 0.5, 0, "metal"], [0.4, 0.4, 0.4, 0, 1.2, 0, "accent"]],
  hatch: [[1.2, 0.1, 1.2, 0, 0.05, 0, "accent"]],
  rope: [[3, 0.05, 0.05, 0, 1, 0, "accent"], [0.08, 1.0, 0.08, -1.5, 0.5, 0, "accent"], [0.08, 1.0, 0.08, 1.5, 0.5, 0, "accent"]],
  bay: [[2.4, 0.9, 0.9, 0, 0.45, 0, "wood"], [2.4, 0.8, 0.05, 0, 2.4, -0.45, "accent"]],
  // Decoration (never interactive): a generic airframe, a vehicle stage on cradles, plate stacks, a bottle rack, rack rows, a partition.
  aircraft: [[3.2, 3.2, 14, 0, 3.6, 0, "pale"], [22, 0.35, 3.5, 0, 3.4, 2, "pale"], [1.6, 1.6, 2.8, -5, 2.6, 1.5, "metal"], [1.6, 1.6, 2.8, 5, 2.6, 1.5, "metal"],
    [0.3, 3, 2.5, 0, 6.6, -6.2, "trim"], [7, 0.25, 2, 0, 5.4, -6.2, "pale"], [0.4, 2.0, 0.4, 0, 1.0, 5, "dark"], [0.6, 2.0, 0.6, -2, 1.0, 1, "dark"], [0.6, 2.0, 0.6, 2, 1.0, 1, "dark"]],
  stage: [[4, 4, 16, 0, 3.8, 0, "pale"], [4.4, 1.8, 1.2, 0, 0.9, -5, "accent"], [4.4, 1.8, 1.2, 0, 0.9, 5, "accent"]],
  plates: [[2.4, 0.6, 1.2, 0, 0.3, 0, "metal"]],
  bottles: [[1.2, 1.5, 0.5, 0, 0.75, 0, "accent"]],
  racks: Array.from({ length: 8 }, (_, i) => [0.6, 2.1, 1.1, -2.17 + i * 0.62, 1.05, 0, i % 2 ? "dark" : 0x2a3440]),
  partition: [[0.2, 3.0, 6.5, 0, 1.5, 0, "wall"]],
};

const larF = (id, shape, label, at, face, type, launchId) => ({ id, shape, label, at, face, launch: { type, id: launchId } });
const larD = (shape, at, face = "s", phone = true) => ({ shape, at, face, phone });

/** Each style's objects (room-local metres; the shell's door, board and station pads keep the door-side strip clear). */
const LAR_LAYOUT = {
  "lar-hangar": {
    deco: [larD("aircraft", [0, -3])],
    fixtures: [
      larF("jacks", "jack", "Aircraft jacks at the wing point: jacking and stands", [8.5, -4], "s", "station", "av-hangar-jacking-and-stands"),
      larF("stand", "stand", "Work stand beside the fuselage: the freighter-conversion jacking simulation", [-3.8, 1], "w", "sim", "lp-sim-freighter-conversion-jacking"),
      larF("gpu", "cart", "Ground power cart: ground power and static bonding before fuel", [4.5, 3], "s", "station", "av-ground-power-and-static-bonding-before-fuel"),
      larF("toolcrib", "panel", "Tool crib shadow board: borescope and tool control inventory", [12.4, -8], "w", "station", "av-borescope-and-tool-control-inventory"),
      larF("fod", "cart", "Foreign-object bin: tool control and the FOD walk", [12.2, -1], "w", "station", "ad-depot-tool-control-and-fod-walk"),
      larF("booth", "booth", "Paint booth filter wall: the paint hangar ventilation and PPE simulation", [-12.6, -8], "e", "sim", "lp-sim-paint-hangar-ventilation-ppe"),
      larF("sprayer", "sprayer", "Paint sprayer: spray equipment set-up", [-9.5, -0.5], "s", "station", "paint-sprayer"),
      larF("respirator", "bench", "Respirator bench: fit test and seal check", [-9.5, 4.5], "s", "station", "ib-spray-foam-and-respirator-fit"),
      larF("tug", "tug", "Pushback tug: tug and towbar connection", [9.5, 2.5], "s", "station", "av-pushback-tug-and-towbar-connection"),
      larF("wands", "rack", "Marshalling wands: marshalling and wingwalker signals", [12.6, 5], "w", "station", "av-marshalling-and-wingwalker-signals"),
      larF("wing", "board", "Lesson board: how a wing lifts an aircraft", [-6, -11.5], "s", "station", "k12-lk-how-a-wing-lifts-an-aircraft"),
    ],
  },
  // The launch site's vehicle-processing hangar: the same shell, the launch-support work (awareness only for propellant).
  "lar-hangar/vehicle": {
    deco: [larD("stage", [0, -3])],
    fixtures: [
      larF("hook", "pendant", "Crane pendant: a payload lift with a lift plan", [5.5, 1], "s", "station", "ad-payload-crane-lift-with-a-lift-plan"),
      larF("liftplan", "board", "Lift plan board: critical lift plan and signalperson", [-6, -11.5], "s", "station", "rl-critical-lift-plan-and-signalperson"),
      larF("fod", "cart", "Foreign-object bin: tool control and the FOD walk", [12.2, -1], "w", "station", "ad-depot-tool-control-and-fod-walk"),
      larF("fluids", "cart", "Servicing cart: hazardous fluid servicing with a buddy", [8.5, 4], "s", "station", "ad-hazardous-fluid-servicing-with-a-buddy"),
      larF("rope", "rope", "Exclusion rope: exclusion zones and holds", [-6, 3], "s", "station", "ad-test-stand-exclusion-zone-and-holds"),
      larF("cryo", "board", "Awareness board: cryogenic propellant awareness", [-12.6, -6], "e", "station", "lp-cryogenic-propellant-awareness"),
    ],
  },
  "lar-fab-shop": {
    deco: [larD("plates", [-9.5, -9.2]), larD("plates", [-9.5, -3.2], "s", false), larD("bottles", [8.3, -4.6])],
    fixtures: [
      larF("plasma", "table", "Plasma table: cutting and fume extraction", [-7, -6.5], "s", "station", "sm-plasma-table-and-fume"),
      larF("hull", "hullblock", "Hull block: shipyard hot work", [2, -5.5], "s", "station", "shipyard-hotwork"),
      larF("manway", "manway", "Hull block manway: confined entry and hot work", [5.05, -5.5], "e", "station", "ib-pressure-vessel-confined-entry-and-hot-work"),
      larF("firewatch", "post", "Fire watch post: the hull block weld and fire watch simulation", [-1.8, -1.8], "s", "sim", "lp-sim-hull-block-weld-fire-watch"),
      larF("weld", "weldbooth", "Welding booth: welding", [10.8, -7], "w", "station", "welding"),
      larF("hoist", "pendant", "Hoist pendant: chain hoist", [-3.5, 2], "s", "station", "chain-hoist"),
      larF("liftplan", "board", "Lift plan board: critical lift plan and signalperson", [-3, -9.5], "s", "station", "rl-critical-lift-plan-and-signalperson"),
      larF("marine", "bench", "Marine electrical bench: vessel electrical safety", [-11.2, 0], "e", "station", "lp-marine-vessel-electrical-safety"),
      larF("shore", "pedestal", "Shore power pedestal: shore power hook-up", [-11.4, 3.5], "e", "station", "shore-power-hookup"),
      larF("blast", "booth", "Blast booth: abrasive blasting", [6, -9.6], "s", "station", "bridge-blast"),
      larF("coat", "sprayer", "Coating station: tank lining", [9.5, -2.5], "s", "station", "tank-lining"),
      larF("vent", "kiosk", "Booth ventilation panel: the ventilation and PPE simulation", [11.4, 1.5], "w", "sim", "lp-sim-paint-hangar-ventilation-ppe"),
      larF("gangway", "gangway", "Gangway: vessel gangway and hatch cover safety", [6, 2], "s", "station", "vessel-gangway-and-hatch-cover-safety"),
    ],
  },
  "lar-data-hall": {
    deco: [larD("racks", [-4, -5.4]), larD("racks", [-4, -1.9], "s", false), larD("partition", [3.2, -4.75])],
    fixtures: [
      larF("busway", "busway", "Busway tap-off in the hot aisle: busway install and torque sign-off", [-4, -3.65], "up", "station", "ws-data-hall-busway-install-and-torque-signoff"),
      larF("permit", "board", "Permit board: the energised electrical work permit", [-9.9, -3.65], "e", "station", "data-hall"),
      larF("eewp", "kiosk", "Permit kiosk: the data hall energised-work simulation", [-8.5, 1], "s", "sim", "lp-sim-data-hall-energised-work"),
      larF("tile", "lifter", "Floor tile lifter: raised floor tiles and cable trays", [-4, 0.5], "s", "station", "ws-raised-floor-tile-lift-and-cable-tray-safety"),
      larF("crah", "crah", "Cooling unit: an alarm in a live hall", [-8.8, -7.4], "s", "station", "ws-crah-alarm-response-in-a-live-hall"),
      larF("mcc", "switchgear", "Switchgear and motor control centre", [9.5, -4.5], "w", "station", "motor-control-center"),
      larF("arc", "board", "Arc-flash labels: reading the label study", [3.4, -4.5], "e", "station", "arc-flash-label-study"),
      larF("ups", "ups", "UPS and battery cabinets: the electrical room", [6.5, -7.5], "s", "station", "pm-electrical-room"),
      larF("chw", "valves", "Chilled-water valves: the chiller plant", [7, 1], "s", "station", "chiller-plant"),
      larF("riser", "riser", "Fire protection riser: the fire pump", [9.6, -0.5], "w", "station", "fire-pump"),
      larF("power", "board", "Lesson board: where a data center gets its power", [-3, -7.5], "s", "station", "k12-lk-where-a-data-center-gets-its-power"),
    ],
  },
  "lar-control-room": {
    deco: [],
    fixtures: [
      larF("console", "console", "Operator consoles: alarm triage", [0, -2.5], "s", "station", "se-building-automation-alarm-triage"),
      larF("firegas", "panel", "Fire and gas panel", [-6.7, -3], "e", "station", "pm-fire-alarm-panel-room"),
      larF("gas", "cabinet", "Gas detection cabinet: the gas leak survey", [-6.6, 0], "e", "station", "gas-leak-survey"),
      larF("lockout", "board", "Lockout board: the compressor lockout simulation", [6.9, -3], "w", "sim", "lp-sim-wellpad-lockout"),
      larF("mcc", "panel", "Motor control centre panel", [6.7, 0], "w", "station", "motor-control-center"),
      larF("arc", "board", "Arc-flash labels: reading the label study", [-5.5, -5.6], "s", "station", "arc-flash-label-study"),
      larF("permits", "board", "Permit rack: confined entry and hot work", [5.5, -5.6], "s", "station", "ib-pressure-vessel-confined-entry-and-hot-work"),
      larF("muster", "post", "Emergency station: site orientation and muster", [-3.5, 0.2], "s", "station", "hazwoper-site-orientation"),
      larF("process", "kiosk", "Process board: hydrostatic test and inspector witness", [3.5, 0.2], "s", "station", "ib-hydrostatic-test-and-inspector-witness"),
    ],
  },
  "lar-compressor": {
    deco: [],
    fixtures: [
      larF("skid", "skid", "Compressor skid: the compressor lockout simulation", [-2, -3], "s", "sim", "lp-sim-wellpad-lockout"),
      larF("mcc", "switchgear", "Motor control centre", [9.5, -3.5], "w", "station", "motor-control-center"),
      larF("arc", "board", "Arc-flash labels: reading the label study", [9.9, 0.8], "w", "station", "arc-flash-label-study"),
      larF("detector", "kiosk", "Gas detector stand: zero it and survey", [-9.5, 0.5], "e", "station", "gas-leak-survey"),
      larF("manifold", "manifold", "Valve manifold: pressure test and leak check", [5, -6], "s", "station", "pl-natural-gas-pressure-test-and-leak-check"),
      larF("hottap", "hottap", "Header fitting: hot tapping", [-7, -6], "s", "station", "hot-tap"),
      larF("meter", "meter", "Meter run: meter set and regulator vent", [4.5, 0], "s", "station", "ut-gas-meter-set-and-regulator-vent"),
      larF("well", "board", "Awareness board: gas storage wellpad awareness", [-9.9, -3.5], "e", "station", "lp-gas-storage-wellpad-awareness"),
      larF("hydro", "cart", "Test cart: hydrostatic test and inspector witness", [1, 1], "s", "station", "ib-hydrostatic-test-and-inspector-witness"),
      larF("vault", "hatch", "Valve vault hatch: vault entry", [-6, 1], "up", "station", "valve-vault"),
    ],
  },
};

/** A process board per Louisiana map, where the programme teaches a different line (taught generically; no process described). */
const LAR_CONTROL_BOARD = {
  "la-shintech-plaquemine": ["Process board: chemical handling in the chlorine room", "chlorine-room"],
  "la-black-bayou-cameron": ["Process board: gas storage wellpad awareness", "lp-gas-storage-wellpad-awareness"],
};

/** Trade references for the programme's crafts (tools/unions.json abbreviations; check_la_rooms compares them). */
export const LAR_CRAFT_NAMES = { ibew: "IBEW", ua: "UA", ironworkers: "IW", iuoe: "IUOE", carpenters: "UBC", liuna: "LIUNA", cwa: "CWA", usw: "USW", insulators: "IAHFIAW", ibb: "IBB", iam: "IAM", iupat: "IUPAT", smart: "SMART", teamsters: "IBT", ila: "ILA" };

/** The craft hall: a lobby, an apprenticeship board, a K-12 corner and a bay per LP_PATHWAYS role pathway (bench + simulation kiosk). */
function larCraftLayout() {
  const crafts = [...new Set(LP_PATHWAYS.flatMap((p) => p.crafts.map((c) => c.union)))];
  const fixtures = [
    larF("lobby", "board", `Lobby board: the programme's crafts — ${crafts.map((c) => LAR_CRAFT_NAMES[c] ?? c).join(", ")} (trade references)`, [-11.9, 2.5], "e", "station", "union-hall-and-dispatch"),
    larF("apprentice", "board", "Apprenticeship board: reading apprenticeship standards", [-11.9, -3.5], "e", "station", "apprenticeship-standards-reading"),
    larF("k12", "board", "Awareness corner: the crews behind a big build", [11.9, 2.5], "w", "station", "k12-lk-the-crews-behind-a-big-build"),
  ];
  LP_PATHWAYS.forEach((p, i) => {
    const x = [-8, 0, 8][i % 3], z = i < 3 ? -6.5 : -1;
    const st = p.stations[0], sim = p.sims[0];
    fixtures.push(larF(`bay-${p.id}`, "bay", `${p.title} bay: ${st.replace(/-/g, " ")}`, [x - 1, z], "s", "station", st));
    if (sim) fixtures.push(larF(`sim-${p.id}`, "kiosk", `${p.title} bay: a programme simulation`, [x + 1.6, z], "s", "sim", sim));
  });
  return { deco: [], fixtures };
}

const larRound = (n) => Math.round(n * 100) / 100;
const LAR_DIR = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0], up: [0, 0] };

/** Rotate a part for the object's face: "e"/"w" turn the front to ±x, "n" to −z. Returns [w, d, dx, dz]. */
function larTurn([w, , d, dx, , dz], face) {
  if (face === "e") return [d, w, dz, -dx];
  if (face === "w") return [d, w, -dz, dx];
  if (face === "n") return [w, d, -dx, -dz];
  return [w, d, dx, dz];
}

/** Where the learner stands to use a fixture: 0.6 m in front of its footprint (on it, for an overhead or floor object). */
export function larSpot(f) {
  const dir = LAR_DIR[f.face] ?? LAR_DIR.s;
  if (!dir[0] && !dir[1]) return [f.at[0], f.at[1]];
  const [w, d] = larTurn(LAR_SHAPES[f.shape][0], f.face);
  const half = dir[0] ? w / 2 : d / 2;
  return [larRound(f.at[0] + dir[0] * (half + 0.6)), larRound(f.at[1] + dir[1] * (half + 0.6))];
}

/** Every Louisiana room on one map (see SEAMS). Deterministic; no three.js. */
export function larRoomsFor(parish) {
  const out = [];
  for (const site of parish?.sites ?? []) {
    const style = ixStyleFor(site.kind, site.id);
    if (!LAR_STYLES[style]) continue;
    let lay = style === "lar-craft-hall" ? larCraftLayout() : LAR_LAYOUT[style];
    if (style === "lar-hangar" && /vehicle/.test(site.id)) lay = LAR_LAYOUT["lar-hangar/vehicle"];
    let fixtures = lay.fixtures.map((f) => ({ ...f, launch: { ...f.launch } }));
    if (style === "lar-control-room" && LAR_CONTROL_BOARD[parish.id]) {
      const [label, id] = LAR_CONTROL_BOARD[parish.id];
      fixtures = fixtures.map((f) => (f.id === "process" ? { ...f, label, launch: { type: "station", id } } : f));
    }
    out.push({ id: `lar-${site.id}`, style, parish: parish.id, site: site.id, name: `${site.name} — ${LAR_STYLES[style].split(" (")[0]}`,
      note: style === "lar-craft-hall" ? LP_NO_PARTNERSHIP : "A generic room for this kind of site — not a model of the real building.", fixtures, deco: lay.deco });
  }
  return out;
}

/** Furnish one INTERIORS room with a Louisiana room's objects (see SEAMS). Returns the parts drawn. */
export function larDress({ THREE, group, room, r, tier = "high", launch = () => false }) {
  const low = tier === "low";
  const objs = [...r.fixtures.map((f) => ({ ...f, live: true })), ...r.deco.filter((d) => !low || d.phone)];
  const parts = [];
  for (const o of objs) for (const p of LAR_SHAPES[o.shape] ?? []) {
    const [w, d, dx, dz] = larTurn(p, o.face);
    parts.push({ w, h: p[1], d, x: o.at[0] + dx, y: p[4], z: o.at[1] + dz, c: p[6] });
  }
  if (parts.length) {
    const pal = { wood: 0x8a6a48, metal: 0x8b959c, trim: room.style.trim, accent: room.style.accent, pale: 0xe6ecef, dark: 0x2a2f36, wall: room.style.wall };
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.2 }), parts.length);
    im.name = "lar-dress";
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    parts.forEach((p, i) => {
      m4.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(p.w, p.h, p.d)); im.setMatrixAt(i, m4);
      im.setColorAt?.(i, col.setHex(typeof p.c === "number" ? p.c : pal[p.c] ?? 0x888888));
      // A part that stands in the walk (below head height, above a step) is a collider.
      if (p.y - p.h / 2 < 1.9 && p.y + p.h / 2 > 0.5) room.colliders.push({ min: [p.x - p.w / 2, 0, p.z - p.d / 2], max: [p.x + p.w / 2, p.y + p.h / 2, p.z + p.d / 2], kind: "lar-prop" });
    });
    group.add(im);
  }
  for (const f of r.fixtures) {
    const [x, z] = larSpot(f);
    const run = () => launch(f.launch, r) !== false;
    if (f.launch.type === "station") room.addAction({ id: `lar-${f.id}`, kind: "station", station: f.launch.id, x, z, r: 1.2, label: f.label, run, launch: f.launch });
    else room.addAction({ id: `lar-${f.id}`, kind: `lar-${f.launch.type}`, x, z, r: 1.2, label: f.label, run, launch: f.launch });
  }
  return parts.length;
}

/** Register one dresser per Louisiana style this map opens (guarded; see SEAMS). */
export function larRegisterDressers(ix, { parish, launch = () => false } = {}) {
  if (!ix || typeof ix.ixRegisterDresser !== "function") return [];
  const rooms = larRoomsFor(parish), bySite = new Map(rooms.map((r) => [r.site, r]));
  const styles = [...new Set(rooms.map((r) => r.style))];
  const dresser = ({ three: THREE, group, room, site, tier }) => { const r = site && bySite.get(site.id); if (r && r.style === room.id) larDress({ THREE, group, room, r, tier, launch }); };
  for (const st of styles) ix.ixRegisterDresser(st, dresser);
  return styles;
}
