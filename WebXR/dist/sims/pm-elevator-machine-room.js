import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Elevator Machine Room VR — Building Systems & Facilities,
// property management programme, zone seven of twenty.
//
// The traction machine room over the hoistway, checked the way an IUOE
// Local 39 building engineer checks it on a monthly round: the maintenance
// control program and access log read, the room entered and the door proven
// to close and latch behind, the temperature read, the room walked for oil,
// guards and an overdue extinguisher, somebody's storage carried out, the
// defects handed to the elevator contractor's mechanic, the emergency
// communication tested, the ventilation held against the afternoon load,
// the thermostat set, the room left as found and the round written into the
// building log. The engineer never opens the controller or touches the
// mainline — that is the licensed mechanic's work under the state elevator
// code. A generic building; no real contractor or manufacturer is named.

const PMEM_ACCENT = 0x8a7fd6;

export const SIM_PM_ELEVATOR_MACHINE_ROOM = {
  id: "pm-elevator-machine-room",
  index: "307",
  domain: "Property Management",
  trade: "Building engineer — IUOE Local 39 stationary engineers, alongside the elevator contractor's licensed mechanic",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "ASME A17.1 (Safety Code for Elevators and Escalators) and the state elevator code for a machine room kept locked, self-closing, clear of storage, within the equipment's temperature range and holding the maintenance control program and its records, with two-way emergency communication in every car; OSHA 29 CFR 1910.147 for the mainline disconnect that only the mechanic locks out, 29 CFR 1910.212 for guards over sheaves and ropes, and 29 CFR 1910.157 for the machine room's portable extinguisher; NFPA 72 for the smoke detection that recalls the cars in a fire; IUOE Local 39 building engineers working alongside the elevator contractor's licensed mechanics.",
  supportLine: "IUOE Local 39's member services or your employer's EAP — talking a frightened resident through an entrapment is harder than it sounds",
  name: "Elevator Machine Room",
  title: simTitle("Elevator Machine Room"),
  tagline: "A monthly machine room round: the maintenance program read, the door proven, temperature read, oil, guards and extinguisher checked, storage carried out, defects handed to the mechanic, the car phone tested, the room ventilated and left as found",
  accent: PMEM_ACCENT,
  accentCss: "#8a7fd6",
  parSeconds: 260,
  footprint: 2.4,
  badge: { id: "room-as-found", name: "Room as Found", note: "A machine room checked, cleared and left locked with the controller and the mainline left to the mechanic" },

  game: system({
    name: "Machine Room",
    currency: "ROUNDS",
    ranks: ["Engineer Trainee", "Building Engineer", "Senior Engineer", "Chief Engineer", "Machine Room Certified"],
    badges: [
      { id: "hands-off-controller", name: "Hands Off", note: "No unsafe action anywhere in the round", test: AWARD.safe },
      { id: "door-proven", name: "Door Proven", note: "Entered and proved the door in order on the first try", test: AWARD.stepClean("entry-check") },
      { id: "range-true", name: "Range True", note: "Room temperature committed near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-round", name: "Clean Round", note: "No corrections anywhere", test: AWARD.clean },
      { id: "quick-round", name: "Quick Round", note: "Inside 80% of par", test: AWARD.fast(0.8) },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "controller-cabinet": "You are opening the controller cabinet. Inside are exposed live terminals at motor voltage and the safety circuits that stop a car — and the state elevator code reserves that work to a licensed elevator mechanic. A building engineer who jumps a safety circuit to 'get a car running' has turned off the one thing standing between a door and a moving car.",
    "mainline-reset": "You are about to switch the mainline disconnect off and on to 'reset' a stuck car. With a passenger inside, a reset can move the car unexpectedly or strand it worse, and it hides the fault from the mechanic who has to find it. 29 CFR 1910.147 lockout on the mainline is the mechanic's; the engineer calls, reassures and waits.",
    "sheave-reach": "You are reaching over the hoist machine towards the drive sheave to wipe the oil. The ropes and sheave can move at any moment a car is called, and they pull a hand into the groove faster than you can let go. 29 CFR 1910.212 wants that nip point guarded — and the guard is missing, which is why nobody reaches there.",
    "door-prop": "You are propping the machine room door open to let the heat out. ASME A17.1 wants that door self-closing and locked so that only authorised people ever reach the machine — a propped door lets in anyone, including children exploring a building. The fix for heat is the ventilation, not the door.",
  },

  lateNotes: {
    "mr-thermostat": "The setpoint is adjusted once you have seen how the room holds under the fan — not guessed before you have read it.",
    "building-log": "The round goes into the log at the end, with the defects and the entrapment in it.",
    "mr-light-switch": "The light goes off on the way out, once the round is done.",
  },

  steps: [
    {
      id: "mcp-binder", kind: "select", target: "mcp-binder",
      title: "Read the maintenance control program and access log",
      cue: "Open the machine room's maintenance control program binder and the access log: last service, open defects, who has been in.",
      why: "ASME A17.1 expects each elevator to have a maintenance control program on site, with the records of what was done and when. It tells you what the mechanic last touched and what is still open; the access log tells you who has been in the room since you last were — which matters in a room nobody should enter casually.",
    },
    {
      id: "entry-check", kind: "sequence", anyOrder: false,
      targets: ["mr-key-box", "mr-door-latch"],
      itemNames: { "mr-key-box": "machine room key signed out", "mr-door-latch": "door closes and latches behind you" },
      title: "Enter and prove the door",
      cue: "Sign the machine room key out of the key box, go in, and watch the door close and latch behind you.",
      why: "The machine room is restricted because what is in it can kill: moving ropes, open sheaves, live controllers. A key that is signed for and a door that shuts and locks on its own are what keep it restricted. Proving the closer on the way in catches the door that has been quietly sitting unlatched since the last visit.",
      outOfOrderNote: "Key first, then the door. Walking in through a door that was already unlatched is the finding — note it before you do anything else.",
    },
    {
      id: "room-temp", kind: "gauge", target: "mr-thermometer",
      title: "Read the machine room temperature",
      cue: "Read the room thermometer and commit when it sits inside the equipment's rated range.",
      why: "Modern elevator drives and controllers are electronics, and they fault out, derate or fail early when the room overheats — usually on the hottest afternoon, with the building full. A17.1 ties the room's conditions to what the equipment is rated for, and the monthly reading is the trend that shows a failing fan before the cars start stopping.",
      gauge: {
        label: "MACHINE ROOM TEMPERATURE", speed: 0.5, green: [0.36, 0.56],
        readout: (t) => `${Math.round(45 + t * 70)}°F`,
        missNote: "Outside the rated range. A room that hot trips drives and a room that cold condenses on the controller. Read it again and commit only inside the band.",
      },
    },
    {
      id: "room-walk", kind: "find", noHint: true,
      targets: ["oil-on-floor", "sheave-guard-missing", "extinguisher-overdue"],
      itemNames: { "oil-on-floor": "oil pooling under the hoist machine", "sheave-guard-missing": "sheave guard missing", "extinguisher-overdue": "extinguisher tag overdue" },
      itemNotes: {
        "oil-on-floor": "Oil is pooling under the hoist machine. It is a slip hazard on a floor with open rope holes, and it is also a machine telling the mechanic that a seal is going.",
        "sheave-guard-missing": "The guard over the drive sheave's nip point is off and not back on. Report it; do not reach anywhere near that groove.",
        "extinguisher-overdue": "The extinguisher's inspection tag has not been initialled in months. 29 CFR 1910.157 wants a monthly visual check — an overdue tag is an extinguisher nobody has looked at.",
      },
      title: "Walk the machine room",
      cue: "Three things in this room need reporting today. Find them — without reaching past any guard.",
      why: "The building engineer does not repair elevators, but is the person in the room most often, and most elevator defects are visible long before they stop a car: oil where it should not be, a guard left off after service, a fire extinguisher nobody has checked. The walk is how they reach the mechanic's ticket instead of an accident report.",
    },
    {
      id: "clear-storage", kind: "drag", target: "stored-boxes",
      title: "Carry the stored boxes out",
      cue: "Somebody has stacked boxes in the machine room. Carry them out to the corridor.",
      why: "ASME A17.1 does not allow machine rooms to be used for storage: boxes block the path to the disconnect, feed a fire in a room full of electrical equipment and hide the rope holes in the floor. Machine rooms fill up because they are locked and empty; carrying it out and finding out whose it is keeps it from coming back.",
      drag: { to: "corridor-socket", radius: 0.55, missNote: "Not out of the room yet. Carry the boxes all the way to the corridor by the door." },
    },
    {
      id: "report-defects", kind: "select", target: "mechanic-ticket",
      title: "Hand the defects to the mechanic",
      cue: "Give the elevator contractor's mechanic the oil leak and the missing guard, and see them go on the contractor's ticket.",
      why: "Oil and guards are elevator work, and under the state elevator code only a licensed mechanic does elevator work. The engineer's job is to see that the defect is on the contractor's ticket, with a date, and to follow it up — a defect mentioned in passing to a busy mechanic is a defect nobody owns.",
    },
    {
      id: "phone-check", kind: "hold", target: "car-phone-panel", seconds: 5,
      title: "Test the cars' emergency communication",
      cue: "Press and hold the emergency phone test on the communication panel until the monitoring service answers for each car.",
      why: "A17.1 requires every car to have two-way emergency communication, because someone trapped between floors has nothing else. A phone line can die quietly when a carrier changes service, and the test is the only proof that the button in the car actually reaches a person who can send help.",
      holdBreakNote: "You let go before the monitoring service answered. Hold it until a person confirms the call for every car.",
    },
    {
      id: "vent-hold", kind: "track", target: "mr-fan-control", seconds: 6,
      title: "Hold the ventilation against the afternoon load",
      cue: "Run the exhaust fan and keep the room in its band as the cars work the afternoon rush.",
      why: "Machine room heat comes from the drives, and it climbs fastest exactly when the building is busiest. Too little air and the drives fault; too much in winter and the controllers sweat. Holding the room in band under load is what shows whether the ventilation actually keeps up, and a room that cannot be held is a work order for the HVAC side.",
      track: {
        start: 0.2, green: [0.4, 0.6], rise: 0.45, fall: 0.4, drift: 0.1,
        label: "MACHINE ROOM — FAN VS LOAD",
        readout: (v) => (v < 0.4 ? "heat building — drives near trip" : v > 0.6 ? "over-ventilated — cold air on controllers" : "holding in band"),
      },
      holdBreakNote: "The room drifted out of band. Bring the fan back to where the temperature holds and keep it there through the load.",
    },
    {
      id: "set-thermostat", kind: "turn", target: "mr-thermostat",
      title: "Set the machine room thermostat",
      cue: "Turn the thermostat to the setpoint that held the room in band under load.",
      why: "A setpoint chosen from what the room actually did under the afternoon load, rather than left wherever it was, keeps the drives inside their rated range on the days nobody is watching. It is a small adjustment that prevents a class of breakdowns that otherwise look random.",
      turn: { turns: 0.5, axis: "z", label: "THERMOSTAT", readout: (t) => `${Math.round(60 + t * 30)}°F setpoint` },
    },
    {
      id: "exit-check", kind: "sequence", anyOrder: true,
      targets: ["mr-light-switch", "mr-door-latch"],
      itemNames: { "mr-light-switch": "light off", "mr-door-latch": "door closed and latched behind you" },
      title: "Leave the room as found",
      cue: "Switch the light off and pull the door closed until it latches.",
      why: "The machine room door is the control that keeps everyone else out, and it only works if it latches every time somebody leaves. Checking it on the way out, as deliberately as on the way in, is what stops the room from becoming the unlocked space in the building.",
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Write the round into the building log",
      cue: "Log the temperature, the defects handed to the mechanic, the storage removed, the entrapment and the installer turned away.",
      why: "The building log is where the owner's side of the elevator record lives: what the engineer found, what was reported and when, and what happened during the entrapment. When an inspector or an insurer asks what the building knew about that oil leak, the answer is this entry.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with the mechanic",
      cue: "Ask the mechanic how the entrapment call went on their side, and name the member services line before you go.",
      why: "Talking a frightened person through an entrapment, staying calm on the phone while you cannot see them, is draining, and so is being the mechanic everyone is waiting on. A short check-in afterwards, with the support line named, lets both of them put that call down instead of carrying it into the next one.",
    },
  ],

  interrupts: [
    {
      id: "entrapment",
      kind: "Alarm — passenger trapped",
      after: "phone-check", delay: 2, seconds: 13,
      alert: "The car status display flashes red: CAR 2 STOPPED BETWEEN FLOORS 6 AND 7 — EMERGENCY CALL. A resident is on the car phone, frightened.",
      cue: "Pick up the passenger intercom: tell them who you are, that help is coming, and to stay put.",
      target: "passenger-intercom",
      why: "Most entrapments end safely if the passenger stays inside and calm while a mechanic comes. The building engineer's part is exactly that: talk to them, tell them they are safe and help is on the way, and keep them from forcing the doors. Anything more — resets, cranking, prying doors — belongs to the mechanic or the fire department.",
      missNote: "The passenger's call went unanswered for the whole window. Someone alone in a stopped car with no voice answering is exactly when people try to force the doors and climb out into the hoistway.",
      wrongNote: "Not that. Answer the passenger on the intercom first — reassure them, tell them help is coming, and keep them in the car.",
    },
    {
      id: "installer-no-permit",
      kind: "Contractor without a permit",
      after: "vent-hold", delay: 3, seconds: 12,
      alert: "A cable installer lets himself in with a borrowed key and says he needs to run a line up through the machine room to the roof.",
      cue: "Stop him and check the access sign-in: he is not an authorised person for this room.",
      target: "access-signin",
      why: "ASME A17.1 keeps machine rooms for elevator equipment and authorised people only; nothing unrelated to the elevator is to be run through them. Checking the sign-in, which lists who is authorised, is the polite and firm way to turn him around — and it is also how the borrowed key gets found and taken back.",
      missNote: "The installer carried on into the room and started pulling cable past the controller. There is now an unauthorised person and unrelated wiring in the one room the code keeps for the elevator alone.",
      wrongNote: "That does not stop him. Check the access sign-in — he is not on it, so he is not staying.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, PMEM_ACCENT);

    // ------------------------------------------------------------ floor with rope holes
    const plateTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7b7f86", base2: "#70747b", seam: "rgba(20,22,26,0.35)" }), { repeat: 3, px: 384 });
    const floor = box(g, 6.0, 0.01, 5.6, 0, 0.005, -0.3, 0x7b7f86, { rough: 0.8, cast: false });
    floor.material = texturedMat(plateTex, { rough: 0.75, metal: 0.1, color: 0xc4c8ce });
    floor.receiveShadow = true;
    decal(g, 2.8, 0.52, 0, 2.62, -5.36, signFace("ELEVATOR MACHINE ROOM", { bg: "#14122a", accent: "#8a7fd6", fg: "#ecebfa", scale: 0.44 }), { px: 512 });
    for (const [x, z] of [[-0.95, -1.35], [-0.55, -1.35]]) box(g, 0.24, 0.012, 0.16, x, 0.012, z, 0x0a0b0d, { rough: 1.0, cast: false });

    // ------------------------------------------------------------ traction machine
    const mach = group(g, -0.8, 0, -1.8);
    box(mach, 1.5, 0.22, 0.9, 0, 0.11, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    const motor = cyl(mach, 0.32, 0.32, 0.8, -0.3, 0.6, 0, 0x5a4fa0, { rough: 0.5, metal: 0.4, seg: 20 });
    motor.rotation.z = Math.PI / 2;
    cyl(mach, 0.2, 0.2, 0.2, -0.8, 0.6, 0, 0x3a4148, { rough: 0.5, metal: 0.5, seg: 16 }).rotation.z = Math.PI / 2;
    const sheave = cyl(mach, 0.38, 0.38, 0.2, 0.35, 0.6, 0, 0x6d7379, { rough: 0.4, metal: 0.7, seg: 24 });
    sheave.rotation.z = Math.PI / 2;
    for (let i = 0; i < 5; i++) torus(mach, 0.385, 0.006, 0.28 + i * 0.035, 0.6, 0, 0x2b2b2b, { rough: 0.6, seg: 4, seg2: 28 }).rotation.y = Math.PI / 2;
    for (let i = 0; i < 5; i++) cyl(mach, 0.006, 0.006, 0.6, 0.28 + i * 0.035, 0.2, 0.38, 0x2b2b2b, { rough: 0.6, seg: 4, cast: false });
    const brake = box(mach, 0.3, 0.3, 0.3, 0.0, 0.6, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    void brake;
    decal(mach, 0.4, 0.1, -0.3, 0.98, 0.0, signFace("CAR 2 MACHINE", { bg: "#14122a", accent: "#8a7fd6", scale: 0.5 }), { px: 192 }).rotation.x = -Math.PI / 2;
    const reachZone = box(mach, 0.2, 0.3, 0.3, 0.55, 0.9, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mach, "Reach over to wipe the sheave?", 0.55, 1.2, 0, { css: "#f0645b", w: 0.52 });
    reg(hits, reachZone, "sheave-reach");
    const guardGap = box(mach, 0.24, 0.3, 0.06, 0.35, 0.9, 0.22, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.35, opacity: 0.6, transparent: true });
    holoTag(mach, "Sheave guard", 0.35, 1.1, 0.26, { css: "#8a7fd6", w: 0.26 });
    reg(hits, guardGap, "sheave-guard-missing");
    const oil = slab(g, 0.6, 0.006, 0.4, -0.3, 0.013, -1.2, 0x1a1408, { radius: 0.15, rough: 0.05, metal: 0.4, cast: false });
    const oilMark = box(g, 0.4, 0.04, 0.3, -0.3, 0.03, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Oil", -0.3, 0.18, -1.2, { css: "#8a7fd6", w: 0.14 });
    reg(hits, oilMark, "oil-on-floor");
    // Governor.
    const gov = group(g, 0.35, 0, -2.3);
    box(gov, 0.2, 0.5, 0.2, 0, 0.25, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    const govSheave = cyl(gov, 0.16, 0.16, 0.05, 0, 0.65, 0, 0x6d7379, { rough: 0.4, metal: 0.7, seg: 18 });
    govSheave.rotation.x = Math.PI / 2;
    decal(gov, 0.2, 0.06, 0, 0.32, 0.102, signFace("GOVERNOR", { bg: "#14122a", accent: "#8a7fd6", scale: 0.5 }), { px: 128 });

    // ------------------------------------------------------------ controllers and mainline
    const ctrl = group(g, 1.3, 0, -2.3);
    for (const x of [-0.35, 0.35]) {
      box(ctrl, 0.62, 1.9, 0.45, x, 0.95, 0, 0x8b949d, { rough: 0.45, metal: 0.5 });
      box(ctrl, 0.02, 1.7, 0.01, x, 0.95, 0.23, 0x5a626a, { rough: 0.5 });
      for (let i = 0; i < 4; i++) box(ctrl, 0.4, 0.02, 0.01, x, 0.4 + i * 0.35, 0.23, 0x6d7379, { rough: 0.5, cast: false });
    }
    const ctrlHandle = box(ctrl, 0.04, 0.16, 0.04, 0.6, 1.1, 0.25, 0xc8201a, { rough: 0.5 });
    holoTag(ctrl, "Open the controller?", 0.35, 2.05, 0.23, { css: "#f0645b", w: 0.38 });
    reg(hits, ctrlHandle, "controller-cabinet");
    const status = decal(ctrl, 0.5, 0.2, -0.35, 1.6, 0.232, signFace("CAR 1 · F4  ▲\nCAR 2 · F7  ▼", { bg: "#0d0c1c", accent: "#8a7fd6", fg: "#d6d2fa", scale: 0.3 }), { glow: true, ei: 0.85, px: 320 });
    const alarmLamp = ball(ctrl, 0.03, -0.1, 1.82, 0.24, 0x3a1a18, { rough: 0.4, seg: 10 });
    const mainline = group(g, 2.5, 0, -1.2, -Math.PI / 2);
    box(mainline, 0.5, 0.7, 0.2, 0, 1.4, 0, 0x5a626a, { rough: 0.45, metal: 0.55 });
    const mlHandle = box(mainline, 0.06, 0.24, 0.06, 0.28, 1.4, 0.05, 0xc8201a, { rough: 0.5 });
    decal(mainline, 0.36, 0.1, 0, 1.62, 0.102, signFace("MAINLINE — CAR 2", { bg: "#1b1e22", accent: "#8a7fd6", scale: 0.5 }), { px: 192 });
    holoTag(mainline, "Cycle the mainline?", 0, 1.88, 0.1, { css: "#f0645b", w: 0.36 });
    reg(hits, mlHandle, "mainline-reset");

    // ------------------------------------------------------------ communication panel, intercom, ticket
    const comm = group(g, -2.55, 0, -1.3, Math.PI / 2);
    box(comm, 0.4, 0.5, 0.1, 0, 1.45, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const commFace = decal(comm, 0.34, 0.16, 0, 1.55, 0.052, signFace("EMERGENCY COMM\nCARS 1–2", { bg: "#0d0c1c", accent: "#8a7fd6", fg: "#d6d2fa", scale: 0.28 }), { glow: true, ei: 0.8, px: 256 });
    void commFace;
    const testBtn = group(comm, -0.08, 1.33, 0.055);
    cyl(testBtn, 0.03, 0.03, 0.02, 0, 0, 0, 0x2f7d4a, { rough: 0.4, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(testBtn, "Phone test", 0, -0.08, 0.01, { css: "#8a7fd6", w: 0.22 });
    reg(hits, testBtn, "car-phone-panel");
    const intercom = group(comm, 0.1, 1.33, 0.06);
    box(intercom, 0.08, 0.12, 0.04, 0, 0, 0, 0x1b1e22, { rough: 0.5 });
    const intercomLamp = ball(intercom, 0.012, 0, 0.07, 0.02, 0x3a1a18, { rough: 0.4, seg: 8 });
    holoTag(intercom, "Passenger intercom", 0, 0.14, 0.02, { css: "#8a7fd6", w: 0.34 });
    reg(hits, intercom, "passenger-intercom");
    const ticket = group(g, 0.55, 0.95, 0.35, -0.4);
    box(ticket, 0.2, 0.02, 0.28, 0, 0, 0, 0x1b1e22, { rough: 0.4 });
    decal(ticket, 0.18, 0.24, 0, 0.012, 0, signFace("CONTRACTOR\nTICKET", { bg: "#0d0c1c", accent: "#8a7fd6", fg: "#d6d2fa", scale: 0.2 }), { glow: true, ei: 0.7, px: 128 }).rotation.x = -Math.PI / 2;
    holoTag(ticket, "Mechanic's ticket", 0, 0.12, 0, { css: "#8a7fd6", w: 0.32 });
    reg(hits, ticket, "mechanic-ticket");
    box(g, 0.5, 0.94, 0.4, 0.55, 0.47, 0.35, 0x5a626a, { rough: 0.5, metal: 0.4 });

    // ------------------------------------------------------------ climate: thermometer, fan, thermostat
    const therm = group(g, -2.55, 1.5, 0.2, Math.PI / 2);
    box(therm, 0.12, 0.2, 0.03, 0, 0, 0, 0xf4f6f8, { rough: 0.5 });
    const thermFace = decal(therm, 0.1, 0.12, 0, 0.01, 0.017, signFace("--°F", { bg: "#0d0c1c", accent: "#8a7fd6", fg: "#d6d2fa", scale: 0.4 }), { glow: true, ei: 0.8, px: 96 });
    holoTag(therm, "Room thermometer", 0, 0.16, 0.02, { css: "#8a7fd6", w: 0.32 });
    reg(hits, thermFace, "mr-thermometer");
    const louvre = group(g, -2.62, 3.0, 1.2, Math.PI / 2);
    box(louvre, 0.9, 0.9, 0.08, 0, 0, 0, 0x6d7379, { rough: 0.5, metal: 0.5 });
    const blades = group(louvre, 0, 0, 0.05);
    for (let i = 0; i < 4; i++) box(blades, 0.8, 0.02, 0.12, 0, -0.3 + i * 0.2, 0, 0x3a4148, { rough: 0.5, metal: 0.5 });
    const fanCtl = group(g, -2.55, 1.4, 1.2, Math.PI / 2);
    box(fanCtl, 0.14, 0.2, 0.04, 0, 0, 0, 0xdfe4e8, { rough: 0.5 });
    cyl(fanCtl, 0.04, 0.04, 0.02, 0, 0, 0.03, 0x2b3138, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(fanCtl, "Exhaust fan", 0, 0.16, 0.02, { css: "#8a7fd6", w: 0.24 });
    reg(hits, fanCtl, "mr-fan-control");
    const tstat = group(g, -2.55, 1.4, 0.7, Math.PI / 2);
    box(tstat, 0.12, 0.14, 0.03, 0, 0, 0, 0xf4f0e6, { rough: 0.5 });
    const tDial = group(tstat, 0, 0, 0.02);
    cyl(tDial, 0.04, 0.04, 0.015, 0, 0, 0, 0xdfe4e8, { rough: 0.4, seg: 14 }).rotation.x = Math.PI / 2;
    box(tDial, 0.006, 0.03, 0.006, 0, 0.018, 0.01, 0x8a7fd6, { rough: 0.4, emissive: 0x8a7fd6, ei: 0.8 });
    tstat.userData.wheel = tDial;
    holoTag(tstat, "Thermostat", 0, 0.14, 0.02, { css: "#8a7fd6", w: 0.22 });
    reg(hits, tstat, "mr-thermostat");

    // ------------------------------------------------------------ door, key box, light, extinguisher, storage
    const door = group(g, 2.6, 0, 1.0, -Math.PI / 2);
    for (const sx of [-0.5, 0.5]) box(door, 0.08, 2.2, 0.14, sx, 1.1, 0, 0x5a626a, { rough: 0.5, metal: 0.4 });
    box(door, 1.08, 0.1, 0.14, 0, 2.2, 0, 0x5a626a, { rough: 0.5, metal: 0.4 });
    box(door, 0.92, 2.1, 0.05, 0, 1.05, 0.02, 0x4a4f7a, { rough: 0.5, metal: 0.3 });
    box(door, 0.3, 0.05, 0.06, 0.25, 2.05, -0.05, 0x3c444c, { rough: 0.4, metal: 0.6 });
    decal(door, 0.4, 0.24, 0, 1.6, -0.01, signFace("ELEVATOR EQUIPMENT\nAUTHORISED ONLY", { bg: "#f4efe4", accent: "#b81410", fg: "#1b1e22", scale: 0.22 }), { px: 256 }).rotation.y = Math.PI;
    const latch = box(door, 0.06, 0.14, 0.05, -0.38, 1.02, -0.04, CITY.steel, { rough: 0.3, metal: 0.85 });
    holoTag(door, "Door latch", -0.38, 1.2, -0.06, { css: "#8a7fd6", w: 0.22 });
    reg(hits, latch, "mr-door-latch");
    const prop = box(door, 0.12, 0.04, 0.16, 0.35, 0.02, -0.25, 0x8b6a48, { rough: 0.7 });
    holoTag(door, "Prop it open?", 0.35, 0.16, -0.3, { css: "#f0645b", w: 0.26 });
    reg(hits, prop, "door-prop");
    const keyBox = group(g, 2.55, 1.4, 2.0, -Math.PI / 2);
    box(keyBox, 0.24, 0.3, 0.08, 0, 0, 0, 0x8b949d, { rough: 0.4, metal: 0.6 });
    box(keyBox, 0.04, 0.06, 0.01, 0, -0.02, 0.045, 0xd8b23a, { rough: 0.4, metal: 0.7 });
    holoTag(keyBox, "Key box", 0, 0.22, 0.04, { css: "#8a7fd6", w: 0.18 });
    reg(hits, keyBox, "mr-key-box");
    const lightSw = group(g, 2.55, 1.3, 0.25, -Math.PI / 2);
    box(lightSw, 0.08, 0.12, 0.02, 0, 0, 0, 0xf4f0e6, { rough: 0.5 });
    box(lightSw, 0.02, 0.04, 0.02, 0, 0.01, 0.012, 0xdfe4e8, { rough: 0.5 });
    holoTag(lightSw, "Light", 0, 0.12, 0.02, { css: "#8a7fd6", w: 0.14 });
    reg(hits, lightSw, "mr-light-switch");
    const ext = group(g, 2.35, 0, 1.75);
    cyl(ext, 0.07, 0.07, 0.42, 0, 0.55, 0, 0xc8201a, { rough: 0.45, metal: 0.3, seg: 14 });
    cyl(ext, 0.03, 0.03, 0.08, 0, 0.8, 0, 0x2b3138, { rough: 0.4, metal: 0.6, seg: 8 });
    const extTag = decal(ext, 0.06, 0.09, 0, 0.55, 0.072, paperFace("INSP", ["JAN ✓", "FEB", "MAR"], { band: "#8a2a2a" }), { px: 96 });
    reg(hits, extTag, "extinguisher-overdue");
    const boxes = group(g, -1.9, 0, 0.6);
    box(boxes, 0.5, 0.4, 0.4, 0, 0.2, 0, 0xb08a5a, { rough: 0.85 });
    box(boxes, 0.44, 0.34, 0.36, 0.03, 0.57, 0, 0xa27c4e, { rough: 0.85 });
    decal(boxes, 0.3, 0.1, 0, 0.3, 0.202, signFace("4D — XMAS", { bg: "#b08a5a", accent: "#5a3a1a", fg: "#3a2a1a", scale: 0.5 }), { px: 128 });
    holoTag(boxes, "Somebody's storage", 0, 0.9, 0, { css: "#8a7fd6", w: 0.32 });
    reg(hits, boxes, "stored-boxes");
    const corridor = box(g, 0.4, 0.1, 0.4, 1.9, 0.3, 1.6, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["corridor-socket"] = corridor;
    // Smoke detector for the recall, on the ceiling.
    cyl(g, 0.08, 0.08, 0.04, 0.3, 4.95, -0.8, 0xf4f0e6, { rough: 0.5, seg: 14, cast: false });

    // ------------------------------------------------------------ boards
    const mcp = holoPanel(g, 0.54, 0.38, -2.1, 1.75, -0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(14,12,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8a7fd6"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ecebfa"; cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("MAINTENANCE CONTROL PROGRAM", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#c9c4f0";
      ["Last service: brake adjust, car 2", "Open: sheave guard to refit", "Access log: 3 entries", "Monthly FEO test: logged"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { ry: 1.2, accent: PMEM_ACCENT });
    reg(hits, mcp, "mcp-binder");
    const signin = holoPanel(g, 0.44, 0.3, 1.9, 1.75, 2.35, (cx, w, h) => {
      cx.fillStyle = "rgba(14,12,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8a7fd6"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ecebfa"; cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("ACCESS SIGN-IN", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#c9c4f0";
      cx.fillText("Authorised: engineers,", w / 2, h * 0.56);
      cx.fillText("elevator contractor", w / 2, h * 0.74);
    }, { ry: -2.4, accent: PMEM_ACCENT });
    reg(hits, signin, "access-signin");
    const logBoard = holoPanel(g, 0.52, 0.36, -2.3, 1.75, 1.95, (cx, w, h) => {
      cx.fillStyle = "rgba(14,12,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8a7fd6"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ecebfa"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("BUILDING LOG", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#c9c4f0";
      ["Temp · defects to contractor", "Storage out · entrapment", "Installer turned away"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.5 + i * 0.15)));
    }, { ry: 1.3, accent: PMEM_ACCENT });
    reg(hits, logBoard, "building-log");
    const crewBoard = holoPanel(g, 0.5, 0.34, 2.3, 1.75, -0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,18,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Engineer · mechanic", w / 2, h * 0.56);
      cx.fillText("IUOE Local 39 member services", w / 2, h * 0.74);
    }, { ry: -1.2, accent: 0x7fd1c9 });
    reg(hits, crewBoard, "crew-checkin-board");

    // ------------------------------------------------------------ people
    const mechanic = standingFigure(g, 0.0, 0.45, { ry: -0.9, cloth: 0x2b3a5a, trousers: 0x1b2230, toolBelt: true, glasses: true });
    const installer = standingFigure(g, 1.45, 1.3, { ry: -2.2, cloth: 0x4a5a6a, trousers: 0x2b3138, cap: 0xd8a63a, atStation: true });
    installer.visible = false;
    const cableCoil = torus(g, 0.16, 0.03, 1.25, 0.05, 1.7, 0x1b1e22, { rough: 0.6, seg: 6, seg2: 16 });
    cableCoil.rotation.x = Math.PI / 2;
    cableCoil.visible = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.2, 1.1, -1.8),

      onStepComplete(step) {
        if (step.id === "room-temp") repaint(thermFace, signFace("78°F", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.4 }));
        if (step.id === "clear-storage") boxes.position.set(1.9, 0, 1.6);
        if (step.id === "report-defects") guardGap.material = mat(0xf2c14b, { rough: 0.5, emissive: 0xf2c14b, ei: 0.3, opacity: 0.6 });
        if (step.id === "vent-hold") blades.rotation.x = 0;
        if (step.id === "exit-check") { oil.visible = false; }
      },

      onStep(step) {
        if (step.id === "vent-hold") blades.rotation.x = 0.6;
      },

      onInterrupt(it) {
        if (it.id === "entrapment") {
          alarmLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2 });
          intercomLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0 });
          repaint(status, signFace("CAR 2 STOPPED\nF6–F7 · EMERGENCY CALL", { bg: "#2a0e0c", accent: "#f0645b", fg: "#ffd2ce", scale: 0.26 }));
        }
        if (it.id === "installer-no-permit") { installer.visible = true; cableCoil.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.id === "entrapment" && it.resolved === "answered") {
          intercomLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 });
          repaint(status, signFace("CAR 2 STOPPED\nMECHANIC EN ROUTE", { bg: "#2a2010", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.28 }));
        }
        if (it.id === "installer-no-permit" && it.resolved === "answered") { installer.visible = false; cableCoil.visible = false; }
      },

      animate(t, dt, session) {
        mechanic.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        sheave.rotation.x = t * 0.8;
        govSheave.rotation.z = t * 1.2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "room-temp") {
          repaint(thermFace, signFace(`${Math.round(45 + gg.t * 70)}°F`, { bg: "#0d0c1c", accent: gg.t > 0.36 && gg.t < 0.56 ? "#59c97b" : "#f0645b", fg: "#d6d2fa", scale: 0.4 }));
        }
      },
    };
  },
};
