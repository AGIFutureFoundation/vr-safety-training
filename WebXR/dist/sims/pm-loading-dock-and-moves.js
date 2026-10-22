import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Loading Dock & Moves VR — Building Systems & Facilities,
// property management zone seventeen.
//
// The building's two-bay loading dock and the garage behind it on a move-in
// Saturday: a moving company's truck at bay one, a freight elevator put on
// independent service and padded, the dock plate lowered and pinned, the
// garage air read for the exhaust every idling engine adds, the mover's
// powered pallet jack spotted across the plate, and the path from dock to
// apartment walked for what the move broke or propped. Generic building —
// only the codes, standards and unions are named.

const PMLD_ACCENT = 0xe0b03a;
const PMLD_CSS = "#e0b03a";
const PMLD_WARN = "#f0645b";

export const SIM_PM_LOADING_DOCK_AND_MOVES = {
  id: "pm-loading-dock-and-moves",
  index: "233",
  domain: "Building Systems & Facilities",
  trade: "Building porter and dock attendant — SEIU building staff, with IUOE Local 39 engineers for the garage ventilation and the apartment association's CAM-credentialed manager scheduling the move",
  category: "Building Systems & Facilities",
  indoor: "garage",
  certification: "OSHA 29 CFR 1910.178 and ANSI B56.1 for the mover's powered pallet jack; 29 CFR 1910.22 and 29 CFR 1910.28 for the dock edge and walking surfaces; 29 CFR 1910.1000 and the ACGIH TLV for carbon monoxide in the garage, with NIOSH guidance on engine exhaust in enclosed spaces; ASME A17.1 for the freight elevator's independent service; NFPA 101 for the stair doors a move must never prop; SEIU building staff, IUOE Local 39 engineers for the garage ventilation and the apartment association's CAM credential; the building's move rules under the local housing code",
  name: "Loading Dock & Moves",
  title: simTitle("Loading Dock & Moves"),
  tagline: "Move-in Saturday: the freight elevator keyed and padded, the truck chocked and the dock plate pinned, the garage air read, the pallet jack spotted across the plate, and the move path walked",
  accent: PMLD_ACCENT,
  accentCss: PMLD_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "pinned-plate", name: "Pinned Plate", note: "Truck chocked, plate pinned, garage air clean, and every resident kept out of the jack's path" },

  supportLine: "your union steward or member-assistance contact, or your employer's employee assistance program",

  game: system({
    name: "Loading Dock",
    currency: "PALLETS",
    ranks: ["Porter", "Dock Attendant", "Dock Lead", "Building Super", "Loading Dock Certified"],
    badges: [
      { id: "pinned-first", name: "Pinned First", note: "Chock, plate and pin in order before anything rolled", test: AWARD.stepClean("secure-truck") },
      { id: "clear-dock", name: "Clear Dock", note: "No unsafe act anywhere on the dock", test: AWARD.safe },
      { id: "straight-across", name: "Straight Across", note: "Spotted the jack across the plate without breaking the band", test: AWARD.stepClean("spot-pallet-jack") },
    ],
    challenges: [
      { id: "clean-move", name: "Clean Move", note: "No corrections across the whole move", test: AWARD.clean },
      { id: "steady-spot", name: "Steady Spot", note: "Held the spot without breaking the band", test: AWARD.unbroken },
      { id: "elevator-back", name: "Elevator Back Early", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unpinned-plate-roll": "You waved the pallet jack onto the dock plate before its pin was in. An unpinned plate can walk off the truck bed as the load rolls across it, and a plate that drops out from under a loaded jack takes the jack, the load and the operator into the gap between the truck and the dock.",
    "idling-truck": "You told the mover's second truck it could sit idling inside the garage while it loads. A running engine in an enclosed garage fills it with carbon monoxide faster than the fans can clear it, and the people breathing it are the residents walking to their cars and the crew carrying boxes — engines off inside, every time.",
    "dock-edge-jump": "You went to jump down from the dock edge to the truck apron. It is a four-foot drop onto concrete with a truck's bumper beside it, and falls from dock edges are a well-known cause of serious injury — use the stair at the end of the dock.",
    "ride-pallet-jack": "You stepped onto the pallet jack's forks to ride it across the dock. A powered pallet jack is not built to carry a person, and a rider's feet are exactly where the load wheels and the dock plate's edge are — 1910.178 limits riding to trucks designed for it.",
  },

  lateNotes: {
    "pallet-jack-path": "Not yet — the jack crosses only after the truck is chocked and the plate is pinned and the garage air has been read.",
    "elevator-key-return": "The elevator goes back to automatic only after the move path is walked and the mover has signed off.",
  },

  steps: [
    {
      id: "read-move-sheet", kind: "select", target: "move-sheet",
      title: "Read the move sheet and the mover's paperwork",
      cue: "Check the reserved window, the elevator booking and the mover's certificate of insurance.",
      why: "A move is a four-hour disruption of the building's dock, elevator and corridors, and the move sheet is how it stays inside the window the residents were promised. The mover's certificate of insurance is what the building relies on when a wall gets gouged or a resident is hurt, so it is read before the truck is let in, not after something breaks.",
    },
    {
      id: "key-elevator", kind: "turn", target: "elevator-key",
      title: "Put the freight elevator on independent service",
      cue: "Turn the key in the car's operating panel to independent service for the move.",
      why: "Independent service takes the freight car out of the building's call system so it goes only where the move crew sends it, and its doors stay open while furniture is loaded instead of closing on a sofa. ASME A17.1 sets how that mode must behave, and using it is what keeps the car from answering a hall call halfway through loading a dresser.",
      turn: { turns: 0.35, axis: "z", label: "INDEPENDENT SERVICE" },
    },
    {
      id: "hang-pads", kind: "drag", target: "elevator-pads",
      title: "Hang the elevator's protective pads",
      cue: "Carry the pads from the rack and hang them on the car's pad hooks.",
      why: "A freight car's walls and doors take every dolly corner and chair leg of the day, and the pads are what stop a move from turning into an elevator repair bill and a car out of service for the next move. Hung before the first load rather than after the first scrape, they protect the car on every trip of the day.",
      drag: { to: "cab-pad-hooks", radius: 0.55, missNote: "Not on the hooks — pads leaned against the car wall fall at the first dolly and cover nothing." },
    },
    {
      id: "walk-dock", kind: "find", noHint: true,
      targets: ["torn-dock-bumper", "oil-slick"],
      itemNames: { "torn-dock-bumper": "torn dock bumper at bay one", "oil-slick": "oil slick across the dock floor" },
      itemNotes: {
        "torn-dock-bumper": "Bay one's rubber bumper has been torn off its bolts. Without it, a reversing truck hits the dock edge itself, shifting the plate and cracking the concrete where people stand.",
        "oil-slick": "A patch of engine oil across the dock where the jack will run. A loaded jack's wheels skid on it, and so do boots carrying boxes.",
      },
      title: "Walk the dock before the truck backs in",
      cue: "Find what will make the dock edge or the floor fail under the move.",
      why: "The dock is where a moving truck, a powered pallet jack, a crew carrying heavy furniture and residents coming in from the garage all share a few square metres beside a four-foot drop. Walked before the truck arrives, a missing bumper and an oil slick are two quick fixes; walked after, they are the causes on an injury report.",
    },
    {
      id: "secure-truck", kind: "sequence",
      targets: ["wheel-chock", "plate-lower", "plate-pin"],
      itemNames: { "wheel-chock": "wheel chock set at the truck's rear wheel", "plate-lower": "dock plate lowered onto the truck bed", "plate-pin": "dock plate pinned" },
      title: "Chock the truck, lower the plate and pin it",
      cue: "Chock the truck's rear wheel, lower the dock plate onto the bed, then drop its locking pin.",
      why: "A truck that creeps forward from the dock drops the plate and anything on it into the gap, and a plate lying on a bed without its pin can slide as a load rolls across it. The order is the whole point: chock first so the truck cannot move, plate down onto a stationary bed, pin in so the plate cannot walk — then, and only then, does anything cross.",
      outOfOrderNote: "Chock, plate, pin — lowering the plate onto a truck that can still roll away is the accident this sequence exists to prevent.",
    },
    {
      id: "read-co", kind: "gauge", target: "co-monitor",
      title: "Read the garage's carbon monoxide monitor",
      cue: "Watch the CO monitor settle and commit when it reads inside the clean band.",
      why: "Every truck that backs in and every car that starts in the garage adds carbon monoxide to air the residents and the crew are breathing, and CO has no smell, no colour and early symptoms that look like a headache. The ACGIH limit is lower than OSHA's for a reason, and the monitor is the only way anyone on the dock knows which side of either the garage is on.",
      gauge: { label: "GARAGE CO", speed: 0.55, green: [0.03, 0.2], readout: (t) => `${Math.round(t * 100)} ppm`, missNote: "Outside the clean band — above it the fans need to run and the engines need to stop. Read it again." },
    },
    {
      id: "run-exhaust", kind: "hold", target: "exhaust-fan-button", seconds: 5,
      title: "Hold the garage exhaust override on",
      cue: "Press and hold the exhaust fan override until the fans come up to speed.",
      why: "The garage exhaust normally runs on its CO sensors, which respond after the air has already got worse. Bringing the fans up on override at the start of a move clears the garage ahead of the trucks rather than behind them, and holding it until they reach speed proves the override actually starts them — IUOE engineers set that system, and a move is when it earns its keep.",
      holdBreakNote: "You let go before the fans came up. An override that has not been seen to start the fans is a switch you are hoping works — hold it until they spin up.",
    },
    {
      id: "spot-pallet-jack", kind: "track", target: "pallet-jack-path", seconds: 7,
      title: "Spot the pallet jack across the dock plate",
      cue: "Guide the mover's powered pallet jack straight across the plate, keeping it centred.",
      why: "A dock plate is only as wide as it has to be, and a loaded jack that drifts toward one edge can drop a wheel off it into the gap. A spotter standing clear, calling the line, is how the operator — who cannot see the plate's edges past the load — keeps the jack centred all the way across.",
      track: { start: 0.25, green: [0.38, 0.62], rise: 0.44, fall: 0.38, drift: 0.12, label: "JACK LINE", readout: (v) => (v < 0.38 ? "drifting to the edge" : v > 0.62 ? "drifting to the edge" : "centred on the plate") },
      holdBreakNote: "The jack drifted toward the plate's edge. A wheel off the plate drops into the gap — call it back to centre.",
    },
    {
      id: "walk-move-path", kind: "find", noHint: true,
      targets: ["gouged-wall-corner", "propped-stair-door"],
      itemNames: { "gouged-wall-corner": "wall corner gouged by a dolly", "propped-stair-door": "stair door propped open with a moving blanket" },
      itemNotes: {
        "gouged-wall-corner": "A dolly has taken a chunk out of the corner by the elevator. It goes on the move sheet with a photo before the mover leaves — found tomorrow, nobody can say whose it was.",
        "propped-stair-door": "The crew has jammed a moving blanket in the stair door so they can go up and down. That door is part of the stair's fire separation, and propped it lets smoke into the only way out.",
      },
      title: "Walk the move path",
      cue: "Find what the move has damaged or defeated between the dock and the elevator.",
      why: "The move path is where a crew under time pressure does the two things that cost the building most: dings the walls on the corners and props the fire doors to save a trip. The Life Safety Code is plain that a stair door works only closed, and a gouge photographed while the mover is still here is a repair the mover pays for.",
    },
    {
      id: "mover-signoff", kind: "select", target: "mover-foreman",
      title: "Walk the damage sheet with the mover's foreman",
      cue: "Show the foreman the gouge and the door, and get the damage sheet signed.",
      why: "The mover's foreman is the person who can accept the damage on the company's behalf, and a signature on the damage sheet with a photo attached turns a dispute next week into a claim against the certificate of insurance today. It is also where the propped door is said out loud to the person who can stop the crew doing it on the next floor.",
    },
    {
      id: "return-elevator", kind: "turn", target: "elevator-key-return",
      title: "Return the freight elevator to automatic",
      cue: "Take the pads down and turn the car back to automatic service.",
      why: "A freight car left on independent service is a car the rest of the building cannot call — the resident with groceries, the porter with the trash, the paramedics with a stretcher. Returning it the moment the move is done, pads down, is what gives the elevator back to everyone else.",
      turn: { turns: 0.35, axis: "z", label: "AUTOMATIC" },
    },
    {
      id: "crew-checkin", kind: "select", target: "porter-checkin",
      title: "Check in with the porter",
      cue: "Hand over the bumper, the oil and the damage sheet, and ask how the porter is holding up.",
      why: "The porter who clears the dock after the truck leaves will deal with the oil, report the bumper and meet the next mover, so a handover in person is what makes the findings stick. A move-in Saturday is physical, rushed work beside moving vehicles — asking how a coworker is doing at the end of it is part of doing it safely.",
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Enter the move in the building log",
      cue: "Log the window, the elevator times, the CO readings, the damage sheet and the dock findings.",
      why: "The building log is where the elevator's out-of-service time, the garage's CO readings and the damage sheet all come together, and where the next move's booking is checked against how this one went. When a resident asks why the freight car was unavailable, or a mover disputes a claim, the log is the record the building stands on.",
    },
  ],

  interrupts: [
    {
      id: "wrong-dock-driver",
      kind: "Delivery driver at the wrong dock",
      after: "run-exhaust", delay: 3, seconds: 12,
      alert: "While you hold the fan override, a delivery box truck starts backing into bay one — the move bay, where the dock plate is down and the crew is working.",
      cue: "Switch bay one's dock light to red and wave him to bay two. Keep your hand on the override.",
      target: "wrong-dock-light",
      why: "A truck reversing into an occupied bay backs into a dock plate, a pallet jack and people who are not expecting it, and the driver cannot see any of them past the box. The dock light is the signal every driver is taught to obey, and red on the occupied bay with a clear wave to the free one is faster and safer than chasing the truck.",
      missNote: "He kept backing into the occupied bay the whole window. Nobody set the light or waved him off, and the crew on the plate had no warning.",
      wrongNote: "That doesn't stop him. Bay one's dock light switch sets the signal a reversing driver is watching for.",
    },
    {
      id: "stroller-behind-jack",
      kind: "Resident with a stroller in the jack's path",
      after: "spot-pallet-jack", delay: 3, seconds: 12,
      alert: "A resident pushing a stroller cuts across the dock from the garage, straight behind the pallet jack as it reverses off the plate.",
      cue: "Sound the dock horn and hold her behind the yellow line. The jack stops on the horn.",
      target: "dock-horn",
      why: "A powered pallet jack reversing with a load has almost no view behind it, and a stroller is low enough to be invisible from the handle. The horn is the dock's agreed stop signal — the operator stops, the resident stops — and the yellow line is where pedestrians wait until the dock is clear.",
      missNote: "She crossed behind the reversing jack the whole window with nobody stopping either of them. That is how a stroller ends up under a load wheel.",
      wrongNote: "That doesn't stop the jack. The dock horn is the stop signal the operator and the resident both answer to.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root, 0, 0, -0.3);
    stationPad(g, 2.6, PMLD_ACCENT);

    // ------------------------------------------------------------ dock floor and garage floor
    const dockTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#5a5f64", base2: "#4e5358", step: 22 }), { repeat: 3, px: 256 });
    const dockFloor = box(g, 6.4, 0.03, 2.6, 0, 0.015, -0.4, 0x5a5f64, { rough: 0.8 });
    dockFloor.material = texturedMat(dockTex, { rough: 0.8, metal: 0.2, color: 0x7a8086 });
    const garageTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#6a6e72", base2: "#606468", seam: "rgba(20,20,20,0.3)" }), { repeat: 4, px: 256 });
    const garageFloor = box(g, 6.4, 0.02, 2.2, 0, 0.011, 1.9, 0x6a6e72, { rough: 0.85 });
    garageFloor.material = texturedMat(garageTex, { rough: 0.85, metal: 0.02, color: 0x7a7e82 });
    // Yellow pedestrian line and dock edge stripes.
    box(g, 6.2, 0.005, 0.08, 0, 0.032, 0.85, 0xf2c14b, { rough: 0.6, cast: false });
    for (let i = 0; i < 12; i++) box(g, 0.25, 0.006, 0.12, -2.9 + i * 0.52, 0.033, -1.62, i % 2 ? 0x1b1e22 : 0xf2c14b, { rough: 0.6, cast: false });

    // ------------------------------------------------------------ bay one: mover's truck, plate, chock, bumper, light
    const bay1 = group(g, -1.3, 0, -1.7);
    const truck = group(bay1, 0, 0, -1.3);
    box(truck, 2.2, 2.3, 2.4, 0, 1.15, 0, 0xf4f4f0, { rough: 0.6 });
    box(truck, 2.2, 0.08, 0.1, 0, 0.02, 1.2, 0x2b3138, { rough: 0.5 });
    decal(truck, 1.2, 0.35, 0, 1.9, 1.21, signFace("MOVING CO.", { bg: "#f4f4f0", accent: "#e0b03a", fg: "#2b3138", scale: 0.5 }), { px: 256 });
    box(truck, 2.0, 2.0, 0.02, 0, 1.1, 1.21, 0x3a3f45, { rough: 0.8 });
    const wheelChock = group(bay1, 1.2, 0.02, -0.3);
    box(wheelChock, 0.2, 0.14, 0.26, 0, 0.07, 0, 0xf2c14b, { rough: 0.6 });
    reg(hits, wheelChock, "wheel-chock");
    holoTag(wheelChock, "wheel chock", 0, 0.3, 0, { css: PMLD_CSS, w: 0.22 });
    const plate = group(bay1, 0, 0.03, 0.05);
    const plateLeaf = box(plate, 1.6, 0.04, 0.6, 0, 0.02, 0, 0x8b929a, { rough: 0.4, metal: 0.8 });
    plateLeaf.rotation.x = -0.9;
    plateLeaf.position.set(0, 0.26, 0.2);
    reg(hits, plate, "plate-lower");
    holoTag(plate, "dock plate", 0, 0.62, 0.3, { css: PMLD_CSS, w: 0.22 });
    const pin = group(bay1, 0.9, 0.06, 0.25);
    cyl(pin, 0.02, 0.02, 0.2, 0, 0.1, 0, 0xd8232a, { rough: 0.4, seg: 8 });
    reg(hits, pin, "plate-pin");
    const pinSeated = cyl(bay1, 0.02, 0.02, 0.1, 0.72, 0.05, 0.25, 0x59c97b, { rough: 0.4, seg: 8 });
    pinSeated.visible = false;
    const rollNow = box(plate, 1.6, 0.1, 0.6, 0, 0.1, -0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bay1, "roll across now?", -0.5, 0.4, 0.0, { css: PMLD_WARN, w: 0.3 });
    reg(hits, rollNow, "unpinned-plate-roll");
    const bumper = group(bay1, -0.95, 0.35, 0.02);
    box(bumper, 0.2, 0.3, 0.1, 0, 0, 0, 0x1b1e22, { rough: 0.9 });
    box(bumper, 0.2, 0.12, 0.1, 0.05, -0.3, 0.08, 0x1b1e22, { rough: 0.9 }).rotation.z = 0.6;
    reg(hits, bumper, "torn-dock-bumper");
    const light1 = group(bay1, 1.3, 1.5, 0.1);
    box(light1, 0.2, 0.36, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const lampGreen = ball(light1, 0.05, 0, 0.08, 0.06, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4, seg: 10 });
    const lampRed = ball(light1, 0.05, 0, -0.08, 0.06, 0x3a2020, { rough: 0.4, seg: 10 });
    const redOn = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8, rough: 0.3 });
    const greenOff = mat(0x203a28, { rough: 0.4 });
    const lightSwitch = group(g, -0.1, 1.2, -1.5);
    box(lightSwitch, 0.14, 0.2, 0.06, 0, 0, 0, 0x3a4450, { rough: 0.5 });
    const lsToggle = box(lightSwitch, 0.03, 0.08, 0.03, 0, 0.02, 0.04, 0xf2c14b, { rough: 0.5 });
    reg(hits, lightSwitch, "wrong-dock-light");
    holoTag(lightSwitch, "bay 1 dock light", 0, 0.18, 0.04, { css: PMLD_CSS, w: 0.28 });
    const edgeJump = box(g, 0.6, 0.1, 0.3, 1.0, 0.05, -1.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "jump down here?", 1.0, 0.3, -1.5, { css: PMLD_WARN, w: 0.28 });
    reg(hits, edgeJump, "dock-edge-jump");

    // ------------------------------------------------------------ bay two (free) and the delivery truck that backs in
    const bay2 = group(g, 1.6, 0, -1.7);
    box(bay2, 1.8, 0.04, 0.5, 0, 0.02, 0.1, 0x8b929a, { rough: 0.4, metal: 0.8 });
    box(bay2, 0.2, 0.3, 0.1, -0.95, 0.35, 0.02, 0x1b1e22, { rough: 0.9 });
    box(bay2, 0.2, 0.3, 0.1, 0.95, 0.35, 0.02, 0x1b1e22, { rough: 0.9 });
    decal(bay2, 0.5, 0.2, 0, 1.5, 0.0, signFace("BAY 2 · DELIVERIES", { bg: "#1b1e22", accent: PMLD_CSS, scale: 0.4 }), { px: 256 });
    const deliveryTruck = group(g, -1.3, 0, -4.6);
    box(deliveryTruck, 1.9, 2.0, 2.2, 0, 1.0, 0, 0xd8d8d0, { rough: 0.6 });
    decal(deliveryTruck, 0.9, 0.3, 0, 1.6, 1.11, signFace("PARCEL", { bg: "#d8d8d0", accent: "#2f6fb0", fg: "#2f6fb0", scale: 0.55 }), { px: 192 });
    deliveryTruck.visible = false;

    // ------------------------------------------------------------ freight elevator
    const elev = group(g, -2.95, 0, -0.3, Math.PI / 2);
    box(elev, 1.8, 2.6, 0.1, 0, 1.3, -0.05, 0x8b929a, { rough: 0.4, metal: 0.6 });
    box(elev, 1.4, 2.2, 0.04, 0, 1.1, 0.02, 0x3a3f45, { rough: 0.6 });
    const padHooks = group(elev, 0, 2.05, 0.06);
    for (let i = 0; i < 4; i++) box(padHooks, 0.03, 0.06, 0.04, -0.5 + i * 0.33, 0, 0, 0xc7cdd2, { rough: 0.3, metal: 0.9 });
    const hookSlot = box(padHooks, 1.4, 0.3, 0.06, 0, -0.1, 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["cab-pad-hooks"] = hookSlot;
    const hungPads = box(elev, 1.3, 1.8, 0.03, 0, 1.05, 0.06, 0x2f4a7a, { rough: 0.95 });
    hungPads.visible = false;
    const carPanel = group(elev, 0.85, 1.2, 0.08);
    box(carPanel, 0.18, 0.4, 0.04, 0, 0, 0, 0xc7cdd2, { rough: 0.3, metal: 0.8 });
    const keySwitch = group(carPanel, 0, 0.1, 0.03);
    cyl(keySwitch, 0.025, 0.025, 0.02, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const keyBit = box(keySwitch, 0.008, 0.04, 0.02, 0, 0, 0.015, 0xf2c14b, { rough: 0.3, metal: 0.8 });
    reg(hits, keySwitch, "elevator-key");
    const keyReturn = group(carPanel, 0, -0.08, 0.03);
    box(keyReturn, 0.06, 0.06, 0.02, 0, 0, 0, 0x59c97b, { rough: 0.4 });
    reg(hits, keyReturn, "elevator-key-return");
    holoTag(elev, "freight car · key", 0.85, 1.55, 0.08, { css: PMLD_CSS, w: 0.3 });
    decal(elev, 0.5, 0.18, 0, 2.45, 0.02, signFace("FREIGHT · 4000 LB", { bg: "#1b1e22", accent: PMLD_CSS, scale: 0.4 }), { px: 256 });
    const padRack = group(g, -2.5, 0, 1.1);
    box(padRack, 0.8, 0.05, 0.4, 0, 0.9, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    for (const sx of [-1, 1]) box(padRack, 0.04, 0.9, 0.4, sx * 0.38, 0.45, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const pads = group(padRack, 0, 0.93, 0);
    for (let i = 0; i < 3; i++) box(pads, 0.7, 0.05, 0.35, 0, 0.03 + i * 0.05, 0, 0x2f4a7a, { rough: 0.95 });
    reg(hits, pads, "elevator-pads");
    holoTag(padRack, "elevator pads", 0, 1.25, 0, { css: PMLD_CSS, w: 0.26 });
    const corner = group(g, -2.9, 0, 0.9);
    box(corner, 0.12, 2.4, 0.12, 0, 1.2, 0, 0xd7d0c4, { rough: 0.8 });
    const gouge = box(corner, 0.04, 0.2, 0.08, 0.05, 0.9, 0.05, 0x8a7a6a, { rough: 0.9 });
    reg(hits, gouge, "gouged-wall-corner");
    const stairDoor = group(g, -1.6, 0, 2.95, Math.PI);
    const sdLeaf = group(stairDoor, -0.45, 0, 0);
    box(sdLeaf, 0.9, 2.1, 0.06, 0.45, 1.05, 0, 0x8a4a3a, { rough: 0.6 });
    sdLeaf.rotation.y = 0.6;
    const blanket = group(stairDoor, -0.45, 0, 0.1);
    box(blanket, 0.1, 1.2, 0.2, 0, 0.6, 0, 0x2f4a7a, { rough: 0.95 });
    reg(hits, blanket, "propped-stair-door");
    decal(stairDoor, 0.34, 0.12, 0, 2.3, 0.04, signFace("STAIR B", { bg: "#1b1e22", accent: "#59c97b", scale: 0.5 }), { px: 128 });

    // ------------------------------------------------------------ pallet jack, oil, horn, fan button, CO monitor
    const jack = group(g, 0.1, 0, -0.7, Math.PI);
    box(jack, 0.55, 0.08, 1.1, 0, 0.06, 0.3, 0xe0b03a, { rough: 0.5, metal: 0.3 });
    box(jack, 0.6, 0.5, 0.35, 0, 0.3, -0.4, 0xe0b03a, { rough: 0.5, metal: 0.3 });
    cyl(jack, 0.02, 0.02, 0.9, 0, 0.9, -0.55, 0x2b3138, { rough: 0.5, seg: 8 }).rotation.x = -0.4;
    box(jack, 0.3, 0.06, 0.06, 0, 1.3, -0.75, 0x2b3138, { rough: 0.5 });
    const load = group(jack, 0, 0.1, 0.35);
    box(load, 0.9, 0.12, 0.9, 0, 0.06, 0, 0x8a6a4a, { rough: 0.9 });
    for (let i = 0; i < 4; i++) box(load, 0.4, 0.35, 0.4, (i % 2 - 0.5) * 0.42, 0.3 + Math.floor(i / 2) * 0.36, (i < 2 ? -0.2 : 0.2), 0xb8905a, { rough: 0.9 });
    const jackPath = box(g, 0.8, 0.02, 1.6, 0.1, 0.04, -0.9, 0x59c97b, { rough: 0.6, opacity: 0.25, transparent: true, cast: false });
    reg(hits, jackPath, "pallet-jack-path");
    holoTag(g, "jack line across the plate", 0.1, 1.9, -0.9, { css: PMLD_CSS, w: 0.42 });
    const forkRide = box(jack, 0.55, 0.1, 0.3, 0, 0.12, 0.85, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(jack, "ride the forks?", 0, 0.34, 0.9, { css: PMLD_WARN, w: 0.28 });
    reg(hits, forkRide, "ride-pallet-jack");
    const oil = cyl(g, 0.4, 0.4, 0.004, 0.9, 0.034, -0.2, 0x1a1612, { rough: 0.05, metal: 0.4, opacity: 0.8, transparent: true, seg: 16 });
    oil.scale.set(1.3, 1, 0.7);
    reg(hits, oil, "oil-slick");
    const hornPost = group(g, 2.6, 0, 0.6);
    cyl(hornPost, 0.04, 0.04, 1.5, 0, 0.75, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    const horn = group(hornPost, 0, 1.5, 0.05);
    cyl(horn, 0.06, 0.1, 0.16, 0, 0, 0, 0xd8232a, { rough: 0.4, seg: 12 }).rotation.x = Math.PI / 2;
    reg(hits, horn, "dock-horn");
    holoTag(hornPost, "dock horn", 0, 1.74, 0.05, { css: PMLD_CSS, w: 0.2 });
    const fanPanel = group(g, 2.9, 1.3, -0.6, -Math.PI / 2);
    box(fanPanel, 0.3, 0.36, 0.08, 0, 0, 0, 0x5d6771, { rough: 0.5, metal: 0.4 });
    const fanBtn = cyl(fanPanel, 0.05, 0.05, 0.04, 0, 0.04, 0.05, 0x59c97b, { rough: 0.4, seg: 14 });
    fanBtn.rotation.x = Math.PI / 2;
    reg(hits, fanBtn, "exhaust-fan-button");
    holoTag(fanPanel, "exhaust override", 0, 0.26, 0.05, { css: PMLD_CSS, w: 0.3 });
    const coMon = group(g, 2.9, 1.8, -0.1, -Math.PI / 2);
    box(coMon, 0.24, 0.2, 0.06, 0, 0, 0, 0xf0f2f4, { rough: 0.4 });
    const coFace = decal(coMon, 0.2, 0.1, 0, 0.0, 0.035, signFace("CO -- ppm", { bg: "#0d1c24", accent: PMLD_CSS, fg: "#fff4d6", scale: 0.4 }), { glow: true, ei: 0.8, px: 192 });
    reg(hits, coMon, "co-monitor");
    holoTag(coMon, "garage CO", 0, 0.16, 0.04, { css: PMLD_CSS, w: 0.2 });
    const fans = group(g, 1.5, 3.0, 1.6);
    const fanBlades = group(fans, 0, 0, 0);
    for (let i = 0; i < 4; i++) box(fanBlades, 0.5, 0.02, 0.1, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.6 }).rotation.y = (i * Math.PI) / 4;
    cyl(fans, 0.4, 0.4, 0.1, 0, 0.08, 0, 0x5d6771, { rough: 0.5, seg: 18, open: true });

    // ------------------------------------------------------------ mover's second truck idling in the garage
    const cab = group(g, 2.55, 0, 1.95, 0.25);
    box(cab, 1.4, 1.3, 1.1, 0, 0.9, 0, 0xf4f4f0, { rough: 0.6 });
    box(cab, 1.0, 0.5, 1.0, 0.1, 1.7, 0, 0xcfe0ea, { rough: 0.1, opacity: 0.6, transparent: true });
    for (const sz of [-0.5, 0.5]) cyl(cab, 0.25, 0.25, 0.16, -0.3, 0.25, sz, 0x1b1e22, { rough: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    const exhaust = particles(cab, 22, 0x6a6e72, { size: 0.06, life: 0.8, additive: false, opacity: 0.35 });
    const idleSpot = box(cab, 0.4, 0.3, 0.3, 0.75, 0.3, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cab, "let it idle?", 0.7, 0.6, 0.56, { css: PMLD_WARN, w: 0.22 });
    reg(hits, idleSpot, "idling-truck");

    // ------------------------------------------------------------ move sheet, log
    const clip = group(g, 2.2, 0, -0.3);
    box(clip, 0.6, 0.05, 0.4, 0, 1.0, 0, 0x7a6048, { rough: 0.7 });
    cyl(clip, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x53606b, { rough: 0.5, metal: 0.4, seg: 8 });
    const moveSheet = decal(clip, 0.26, 0.34, 0, 1.03, 0, paperFace("MOVE-IN · 9C", ["Sat 9:00 – 13:00", "Freight car booked", "COI on file ✓", "Deposit · damage sheet"], { bg: "#f4efe0", band: "#7a5a1a" }), { px: 256 });
    moveSheet.rotation.x = -Math.PI / 2;
    reg(hits, moveSheet, "move-sheet");
    const logBoard = holoPanel(g, 0.56, 0.38, -1.8, 1.9, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(22,18,6,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = PMLD_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbf4de";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("BUILDING LOG · DOCK", w / 2, h * 0.22);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#ece0bc";
      ["move window · car times", "garage CO readings", "damage sheet signed", "bumper · oil · door"].forEach((l, i) => ctx.fillText(l, w / 2, h * (0.42 + i * 0.14)));
    }, { ry: 0.3, accent: PMLD_ACCENT });
    reg(hits, logBoard, "building-log");

    // ------------------------------------------------------------ crew
    const foreman = standingFigure(g, 1.55, 0.4, { ry: -2.6, cloth: 0x2f4a7a, trousers: 0x2b3138, vest: 0xe0b03a });
    reg(hits, foreman, "mover-foreman");
    const porter = standingFigure(g, -1.5, 1.15, { ry: 2.6, cloth: 0x3f5b6e, trousers: 0x2b3138, cap: 0x2f5a7a });
    reg(hits, porter, "porter-checkin");
    const resident = standingPerson(g, 0.9, 0.3, { ry: -Math.PI / 2, cloth: 0xb86a8a, hiVis: false });
    const stroller = group(resident.root, 0, 0, 0.55);
    box(stroller, 0.4, 0.3, 0.6, 0, 0.55, 0, 0x2b3138, { rough: 0.6 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(stroller, 0.08, 0.08, 0.03, sx * 0.2, 0.08, sz * 0.25, 0x1b1e22, { rough: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    resident.root.visible = false;

    let reversing = false;
    let fansOn = false;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.3, 1.0, -1.4),

      onStepComplete(step) {
        if (step.id === "key-elevator") keyBit.rotation.z = 1.0;
        if (step.id === "hang-pads") { pads.visible = false; hungPads.visible = true; }
        if (step.id === "walk-dock") { oil.visible = false; bumper.rotation.z = 0; }
        if (step.id === "secure-truck") { plateLeaf.rotation.x = 0; plateLeaf.position.set(0, 0.02, -0.25); pin.visible = false; pinSeated.visible = true; wheelChock.position.set(0.9, 0.02, -1.0); }
        if (step.id === "read-co") repaint(coFace, signFace("CO 8 ppm ✓", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.4 }));
        if (step.id === "run-exhaust") fansOn = true;
        if (step.id === "spot-pallet-jack") jack.position.set(0.1, 0, -2.3);
        if (step.id === "walk-move-path") blanket.visible = false;
        if (step.id === "return-elevator") { keyBit.rotation.z = 0; hungPads.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "wrong-dock-driver") { deliveryTruck.visible = true; reversing = true; }
        if (it.id === "stroller-behind-jack") resident.root.visible = true;
      },
      onInterruptEnd(it) {
        if (it.id === "wrong-dock-driver") {
          reversing = false;
          if (it.resolved === "answered") { lampRed.material = redOn; lampGreen.material = greenOff; lsToggle.rotation.z = 0.8; deliveryTruck.position.set(1.6, 0, -4.2); }
          else deliveryTruck.visible = false;
        }
        if (it.id === "stroller-behind-jack") {
          if (it.resolved === "answered") resident.root.position.set(0.9, 0, 1.3);
          else resident.root.visible = false;
        }
      },

      animate(t, dt, session) {
        exhaust.visible = true;
        exhaust.userData?.step?.(dt, new THREE.Vector3(0.75, 0.25, 0.45), 0.08, 0.3, 0.2);
        if (fansOn) fanBlades.rotation.y += dt * 8;
        if (reversing) deliveryTruck.position.z = Math.min(-3.4, deliveryTruck.position.z + dt * 0.25);
        porter.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "read-co") {
          repaint(coFace, signFace(`CO ${Math.round(gg.t * 100)} ppm`, { bg: "#0d1c24", accent: gg.t >= 0.03 && gg.t <= 0.2 ? "#59c97b" : "#f0645b", fg: "#fff4d6", scale: 0.4 }));
        }
        if (session?.track && session.step?.id === "spot-pallet-jack") jack.position.x = 0.1 + (session.track.v - 0.5) * 0.6;
      },
    };
  },
};
