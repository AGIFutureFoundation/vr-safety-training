import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, hose, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, equipmentCabinet, lockTag, pipeRun,
  standingFigure, surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Air Balancing and Testing VR — Manufacturing & Automation,
// SMART sheet metal pack. Testing, adjusting and balancing a supply system
// in a mechanical room and the corridor it feeds: the design airflows on the
// TAB report, instruments proven, a flow hood on the diffuser, static read on
// the manometer, a branch damper trimmed and locked, the fan held at speed
// through a pitot traverse, the duct walked for the leaks that explain the
// numbers. The instruments tell the truth only when the system is the one
// on the drawing: a damper that drove shut mid-reading or a belt guard
// pulled off a running fan changes the numbers and the risk in the same
// second.

const SMAB_ACCENT = 0x6fc6b8;

export const SIM_SM_AIR_BALANCING_AND_TESTING = {
  id: "sm-air-balancing-and-testing",
  index: "223",
  domain: "Manufacturing & Automation",
  trade: "Testing, adjusting and balancing technician — SMART, International Training Institute TAB curriculum",
  category: "Manufacturing & Automation",
  indoor: "plant",
  certification: "SMART and its International Training Institute testing, adjusting and balancing curriculum; ASHRAE 111 measurement, testing, adjusting and balancing of building HVAC systems and the NEBB procedural standard for TAB, with NEBB technician certification; SMACNA HVAC Duct Construction Standards and duct leakage test procedures; OSHA 29 CFR 1910.212 machine guarding on belt-driven fans, 29 CFR 1910.147 lockout/tagout at the fan disconnect, 29 CFR 1910.23 ladders and 29 CFR 1910.28 fall protection above a ceiling",
  name: "Air Balancing and Testing",
  title: simTitle("Air Balancing and Testing"),
  tagline: "Design airflows off the TAB report, instruments proven, hood on the diffuser, static on the manometer, the branch damper trimmed and locked, the fan held at speed through a traverse, the duct walked for the leaks that explain the numbers",
  accent: SMAB_ACCENT,
  accentCss: "#6fc6b8",
  parSeconds: 285,
  footprint: 2.2,
  badge: { id: "numbers-that-agree", name: "Numbers That Agree", note: "A branch balanced to design with every reading taken off a proven instrument on a system nobody was inside" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your SMART local's training coordinator or the TAB firm's lead technician, or your employer's employee assistance program if the fan behind you with its guard off is what stayed with you",

  game: system({
    name: "Balance Crew",
    currency: "CFM",
    ranks: ["Pre-apprentice", "Instrument Hand", "TAB Technician", "Balance Lead", "Balance Crew Certified"],
    badges: [
      { id: "instruments-proven", name: "Instruments Proven", note: "Hood calibration and manometer zero checked before the first reading", test: AWARD.stepClean("instrument-cal") },
      { id: "feet-on-the-floor", name: "Feet On The Floor", note: "Never on the top step, never on the grid, never near an unguarded belt", test: AWARD.safe },
      { id: "static-on-band", name: "Static On Band", note: "Static pressure read inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-branch", name: "Clean Branch", note: "The branch balanced without a correction", test: AWARD.clean },
      { id: "speed-held", name: "Speed Held", note: "Fan speed held in band through the whole traverse", test: AWARD.unbroken },
      { id: "branch-in-time", name: "Branch In Time", note: "Balanced, walked and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "top-step": "You stood on the top of the stepladder to reach the diffuser. The top cap and the step below it are not steps — 29 CFR 1910.23 says so and so does the label — and a hood held overhead from up there puts your weight where the ladder has nothing to balance it with. A taller ladder, or the diffuser waits.",
    "grid-step": "You stepped off the ladder onto the ceiling grid to reach the damper. A suspended ceiling holds tiles and nothing else; the grid is wire-hung tee bar that folds under a boot, and the fall is through the ceiling onto whatever is below. Above a ceiling, the load goes on the structure or on a platform — never on the grid.",
    "belt-guard-off": "You reached behind the fan with its belt guard off and the fan running. The guard is what 29 CFR 1910.212 puts between a hand and a belt doing a few thousand feet a minute over a sheave that takes fingers in; a fan is not stopped for a belt check by pulling the guard, it is locked out at the disconnect first. Guard off means fan off.",
    "vfd-door-open": "You went to change the fan speed at the drive with its door open and the bus live. A variable frequency drive's door is a cover over terminals that stay charged for minutes after the power goes off, and the keypad works with the door shut; a hand inside a live drive to save opening the keypad menu is an arc flash in a mechanical room. Door shut, keypad, or locked out and tested dead.",
  },

  lateNotes: {
    "branch-damper": "The damper is trimmed after the design flow and the static are known — a damper moved before the readings is a system balanced to a number nobody wrote down.",
    "damper-lock": "The quadrant is locked after the reading agrees with the design, not before. A damper locked at a guess is a guess the next technician cannot see past.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "tab-board",
      title: "Check in with the mechanical crew",
      cue: "Sign onto the TAB board, note who is working on the fan today and whether the drive and the fire dampers are in service.",
      why: "A balance is measured on a system other trades are still working on: the mechanic who has the fan's belts, the controls technician who has the damper actuators, the electrician with the drive. The board names them and their state of play, which is how you know the fan may be stopped under you or a damper driven while you read; SMART TAB crews sign the board first because a reading taken on a system somebody else is changing is a number that means nothing.",
    },
    {
      id: "design-read", kind: "select", target: "tab-report",
      title: "Read the design airflows off the TAB report",
      cue: "Design flow at each diffuser on the branch, the total, the fan's design static and speed, and the tolerance the specification allows.",
      why: "The report carries the engineer's design flow for every outlet and the fan, and the tolerance the specification allows around each; the ASHRAE 111 and NEBB procedures balance to those numbers, not to what feels like enough air in a room. A branch balanced to the wrong sheet — last week's revision, the other floor — is a branch that reads perfectly and delivers the wrong air to every room on it.",
    },
    {
      id: "instrument-cal", kind: "sequence", anyOrder: true,
      targets: ["hood-cal-tag", "manometer-zero"],
      itemNames: { "hood-cal-tag": "the flow hood's calibration tag", "manometer-zero": "the manometer zeroed" },
      title: "Prove the instruments before the first reading",
      cue: "The hood's calibration tag in date, and the manometer zeroed with both ports open to the room.",
      why: "The NEBB procedure and ASHRAE 111 both start with instruments proven: a flow hood out of calibration reads high or low by a fixed error on every diffuser, and a manometer that was not zeroed adds the same offset to every static reading in the report. Neither error is visible in the numbers, which is why a report from an unproven instrument is a report from no instrument at all.",
    },
    {
      id: "hood-drag", kind: "drag", target: "flow-hood",
      title: "Seat the hood on the diffuser",
      cue: "Lift the hood onto the diffuser so the skirt seals to the ceiling all the way round, from the ladder's proper step.",
      why: "A capture hood reads the air that comes through it, and air that leaks round a skirt that does not seal to the ceiling is air the hood never sees; the hood is seated square with the skirt pressed to the tile all round before the reading is trusted. It is seated from a ladder step with both feet on it and the hood's weight over the ladder, because a hood held out at arm's length from the top cap is the fall this trade has more of than any other.",
      drag: { to: "diffuser-face", radius: 0.45, missNote: "The skirt is not sealed round the diffuser — the hood reads only the air that goes through it." },
    },
    {
      id: "static-read", kind: "gauge", target: "manometer",
      title: "Read the fan's static on the manometer",
      cue: "Probes in the test ports either side of the fan, read the total static and commit inside the band on the report.",
      why: "The fan's static pressure against the report is the first number that says whether the system is the one on the drawing: too low and a duct has come apart or an access door is open somewhere between here and the outlets, too high and a damper is shut that should be open. Reading it before the branch is trimmed saves an afternoon balancing outlets against a fault that will undo every setting when it is found.",
      gauge: { label: "STATIC", speed: 0.72, green: [0.44, 0.6], readout: (t) => `${(t * 4).toFixed(2)} in. w.g.`, missNote: "The static is off the report's band — something between the fan and the outlets is not as drawn. Find it before trimming." },
    },
    {
      id: "damper-turn", kind: "turn", target: "branch-damper",
      title: "Trim the branch damper",
      cue: "Turn the quadrant to bring the branch toward its design proportion — small moves, reading after each, from the ladder's proper step.",
      why: "The proportional method balances outlets to one another before the fan is set, and the branch damper is how a whole branch is brought into proportion with the others; it moves in small steps because a damper's effect on flow is anything but linear near closed, and one turn too far starves every outlet downstream at once. It is turned from a proper step on the ladder, not from the grid, because the quadrant is above the ceiling and the grid is not a floor.",
      turn: { turns: 0.5, axis: "z", label: "QUADRANT" },
    },
    {
      id: "fan-speed", kind: "track", target: "vfd-dial", seconds: 5,
      title: "Hold the fan at the design speed",
      cue: "At the drive's keypad, door shut, bring the fan to the report's speed and hold it steady there while the readings are taken.",
      why: "Every reading in a balance assumes the fan was at one speed while it was taken, and a drive that hunts by a few percent moves every flow in the building by the same few percent under the instrument. The speed is set and held through the readings from the keypad with the door closed, because the door is the cover over a live bus and the keypad does everything a technician needs without opening it.",
      track: { label: "FAN Hz", green: [0.42, 0.62], rise: 0.56, fall: 0.44, drift: 0.12, readout: (v) => `${(v * 60).toFixed(1)} Hz` },
      holdBreakNote: "The fan speed wandered out of band — every reading taken while it did is a reading at a speed nobody wrote down. Settle it and hold it.",
    },
    {
      id: "pitot-hold", kind: "hold", target: "pitot-tube", seconds: 4,
      title: "Take a traverse point",
      cue: "Pitot tube into the duct at the marked point, held square to the airflow and steady while the velocity pressure settles.",
      why: "A pitot traverse is the reference the hood and the fan curve are checked against, and each point is held steady until the reading stops moving because velocity pressure in a duct fluctuates and a reading snatched off a swinging gauge is a guess with decimals. The tube is square to the flow because a pitot a few degrees off reads low, and the same few degrees at every point is a whole traverse that is wrong the same way.",
      holdBreakNote: "You pulled the pitot before the reading settled — that point is a swing of the needle, not a velocity. Hold it square and steady.",
    },
    {
      id: "lock-mark", kind: "select", target: "damper-lock",
      title: "Lock the quadrant and mark it",
      cue: "With the branch reading inside the tolerance, lock the quadrant and mark the blade position on the duct.",
      why: "A damper that is balanced and not locked is a damper the next person to brush past it has unbalanced, and the mark on the duct beside the quadrant is how anyone afterwards can see whether it has moved. The lock and the mark are what make the reading on the report a setting on the system rather than a moment that passed, and they go on only when the number agrees with the design — a locked guess is worse than an open one.",
    },
    {
      id: "leak-walk", kind: "find", noHint: true,
      targets: ["open-access-door", "flex-disconnect"],
      itemNames: { "open-access-door": "an access door left open", "flex-disconnect": "a flex run pulled off its collar" },
      itemNotes: {
        "open-access-door": "The access door upstream of the branch has been left open by whoever cleaned the coil — the fan's low static was going out through it.",
        "flex-disconnect": "The flex to the corner diffuser has pulled off its collar above the ceiling; that outlet's low reading is air going into the plenum.",
      },
      title: "Walk the duct for the faults behind the numbers",
      cue: "The readings say air is going somewhere it should not — look along the duct and click the two places it is escaping.",
      why: "A balance is a set of numbers, and the numbers are only as true as the duct they were measured on: an open access door and a flex off its collar explain a low static and a starved outlet better than any damper setting can, and a branch balanced around them is a branch that goes wrong the day somebody closes the door. The technician who reads the numbers is the one who walks the duct, because the numbers said where to look.",
    },
    {
      id: "readings", kind: "sequence",
      targets: ["supply-reading", "return-reading", "oa-reading"],
      itemNames: { "supply-reading": "total supply air", "return-reading": "return air", "oa-reading": "outside air" },
      title: "Record the system readings in order",
      cue: "Supply first, then return, then outside air — each read and written before the next, at the fan speed you held.",
      why: "Supply, return and outside air are the three numbers that have to agree with each other as well as with the design: supply less return is the outside air, and an outside air reading taken before the supply is settled is a reading that the arithmetic will not close on. The order is the NEBB procedure's order, and each is written at the time it is read, because a number carried in the head to the clipboard is a number rounded on the way.",
      outOfOrderNote: "Supply, then return, then outside air — the outside air is the difference of the first two, and it is read last.",
    },
    {
      id: "filter-check", kind: "select", target: "filter-bank",
      title: "Read the filter bank's pressure drop",
      cue: "Check the differential across the filter bank against the clean and dirty values on the report.",
      why: "A filter bank half loaded with dust is a fixed resistance the whole balance was taken against, and the day the filters are changed every reading in the report moves; the pressure drop across the bank is recorded so the report says what the filters were doing while the numbers were taken. It is also the reading that says a bank is blinded, which is a fan working against a wall and a building short of the air it was designed for.",
    },
    {
      id: "room-walk", kind: "find", noHint: true,
      targets: ["unsealed-takeoff", "crushed-flex"],
      itemNames: { "unsealed-takeoff": "an unsealed takeoff", "crushed-flex": "a crushed flex run" },
      itemNotes: {
        "unsealed-takeoff": "The takeoff to the corridor diffuser was never sealed — the SMACNA seal class on the drawing says it should have been, and the leakage test would have caught it.",
        "crushed-flex": "The flex run over the light fitting is crushed to half its diameter by a cable tray somebody rested on it. That outlet will never make design through that.",
      },
      title: "Look above the ceiling before the report is signed",
      cue: "Head and light above the tile from a proper step: click the two installation faults the balance cannot fix.",
      why: "Some numbers cannot be balanced into agreement, and the reason is above the ceiling: a takeoff nobody sealed, a flex crushed under a cable tray. Finding them is the difference between a TAB report that says the branch cannot make design and one that says it did, and only the first is worth the paper. The look is taken from a ladder step with both feet on it, because the grid is the next hazard after the numbers.",
    },
    {
      id: "tab-log", kind: "select", target: "tab-log",
      title: "Sign the TAB report for the branch",
      cue: "Instruments and calibration, fan speed and static, each outlet against design, the faults found and who has them, and sign it.",
      why: "The TAB report is the document the engineer, the commissioning agent and the owner accept the system on, and it records not only the numbers but the instruments they were taken with, the fan speed they were taken at and the faults that stop them being met. Under the NEBB procedure it is signed by the technician who took the readings, because the signature is the claim that these numbers describe this system on this day.",
    },
  ],

  interrupts: [
    {
      id: "damper-closes",
      kind: "Damper closed mid-reading",
      after: "fan-speed", delay: 3, seconds: 12,
      alert: "The fire/smoke damper upstream has just driven closed. Its actuator lost signal and the branch readings have collapsed under the hood.",
      cue: "The system you are measuring is no longer the system on the drawing.",
      target: "damper-actuator",
      why: "A fire/smoke damper that drives shut mid-balance changes every flow downstream of it in a second, and the readings taken from that second on describe a closed duct. The fan speed can be held again later; the actuator is reset first so the damper is proven open, because a damper that closed once on a lost signal will close again, and the controls technician on the board needs to know it did.",
      missNote: "You held the fan speed and kept reading with the damper shut. Every number you wrote in that minute describes a closed branch, and the report you would have signed said the outlets were starved by a damper that was doing exactly what it was built to do.",
      wrongNote: "It is the damper actuator. Reset it and prove the blade open — nothing downstream means anything until it is.",
    },
    {
      id: "guard-off-fan",
      kind: "Guard off a running fan",
      after: "pitot-hold", delay: 3, seconds: 12,
      alert: "The mechanic has pulled the belt guard off the fan behind you to look at the belts, and the fan is still running.",
      cue: "There is an exposed belt drive a metre from your back.",
      target: "fan-disconnect",
      why: "A belt guard comes off a fan that has been locked out at its disconnect, never one that is running; the mechanic's habit is what 29 CFR 1910.147 and 1910.212 exist to stop, and the traverse point can be taken again when the fan comes back. The disconnect is thrown by whoever sees the exposed belt first — a hand reaching for a belt on a running sheave does not give anyone time to find the mechanic and explain.",
      missNote: "You held the pitot and finished the point with an exposed belt drive running behind you. Nobody touched it that time. A belt on a sheave at fan speed takes a hand to the shoulder before the person feels it, and the guard is the only thing that has ever stopped that.",
      wrongNote: "It is the fan disconnect. Kill the fan first — the belts can be looked at on a machine that is locked out.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SMAB_ACCENT);

    const floor = box(g, 6.6, 0.06, 6.4, 0, 0.03, -0.3, 0x3a4048, { rough: 0.9, cast: false });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#2a3236", base2: "#22292d", step: 26 }), { repeat: 6, px: 512 }),
      { rough: 0.9, metal: 0.25 });

    // ------------------------------------------------------- the fan unit
    // A belt-driven supply fan on the mechanical room side: housing, motor,
    // sheaves and the guard the mechanic pulls; the disconnect beside it; the
    // filter bank and the drive on the wall.
    const fan = group(g, -1.8, 0.06, -2.2, 0.3);
    box(fan, 1.6, 1.4, 1.2, 0, 0.7, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    cyl(fan, 0.5, 0.5, 0.2, 0, 0.8, 0.62, 0x2b2f34, { rough: 0.6, metal: 0.5, seg: 24 }).rotation.x = Math.PI / 2;
    const motor = cyl(fan, 0.2, 0.2, 0.5, 0.95, 0.5, 0, 0x3a4048, { rough: 0.5, metal: 0.5, seg: 16 });
    motor.rotation.z = Math.PI / 2;
    const sheaveA = cyl(fan, 0.18, 0.18, 0.05, 0.85, 1.2, 0.5, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 20 });
    sheaveA.rotation.x = Math.PI / 2;
    const sheaveB = cyl(fan, 0.1, 0.1, 0.05, 0.85, 0.5, 0.5, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 16 });
    sheaveB.rotation.x = Math.PI / 2;
    const belt = box(fan, 0.04, 0.72, 0.02, 0.85, 0.85, 0.52, 0x1b1e22, { rough: 0.8 });
    const beltGuard = box(fan, 0.5, 0.95, 0.1, 0.85, 0.85, 0.56, 0xe8b02e, { rough: 0.6, opacity: 0.85, transparent: true });
    reg(hits, beltGuard, "belt-guard-off");
    holoTag(fan, "belt guard", 0.85, 1.5, 0.56, { css: "#6fc6b8", w: 0.24 });
    const disconnect = group(fan, 1.25, 1.4, 0.2, -0.3);
    box(disconnect, 0.22, 0.32, 0.12, 0, 0, 0, 0x22262b, { rough: 0.6 });
    const discHandle = box(disconnect, 0.03, 0.14, 0.03, 0.06, 0.02, 0.07, 0xd2312b, { rough: 0.5 });
    decal(disconnect, 0.2, 0.05, 0, 0.19, 0.061, signFace("SF-1 DISCONNECT", { bg: "#22262b", accent: "#6fc6b8", scale: 0.45 }));
    reg(hits, disconnect, "fan-disconnect");
    holoTag(fan, "fan disconnect", 1.25, 1.7, 0.2, { css: "#6fc6b8", w: 0.3 });
    const lock = lockTag(disconnect, 0.06, -0.12, 0.07, { color: 0x6fc6b8 });
    lock.visible = false;
    // Test ports either side of the fan, the manometer on its stand.
    for (const sz of [-0.62, 0.62]) cyl(fan, 0.02, 0.02, 0.06, -0.5, 1.2, sz, 0xb8402f, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    const manometer = instrument(g, -0.9, 1.1, -1.1, { ry: 0.4, idle: "-- in.", color: 0x6fc6b8, w: 0.14, d: 0.2 });
    cyl(g, 0.02, 0.02, 1.05, -0.9, 0.55, -1.1, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    reg(hits, manometer, "manometer");
    holoTag(g, "manometer", -0.9, 1.32, -1.1, { css: "#6fc6b8", w: 0.24 });
    const zeroBtn = group(manometer, -0.05, 0.03, 0.06);
    cyl(zeroBtn, 0.012, 0.012, 0.01, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 8 });
    reg(hits, zeroBtn, "manometer-zero");
    hose(g, [[-0.85, 1.1, -1.15], [-1.2, 1.3, -1.6], [-1.6, 1.26, -1.9]], 0.006, 0xdfe9ee, { steps: 10 });
    // Filter bank on the fan's inlet side, with its differential gauge.
    const filters = group(g, -2.9, 0.06, -0.6, 0.5);
    box(filters, 0.3, 1.4, 1.2, 0, 0.7, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 4; i++) box(filters, 0.05, 0.55, 0.5, 0.16, 0.4 + Math.floor(i / 2) * 0.6, -0.3 + (i % 2) * 0.6, 0xe8e2d0, { rough: 0.95 });
    const filterGauge = instrument(filters, 0.2, 1.5, 0, { ry: Math.PI / 2, idle: "-- in.", color: 0x6fc6b8, w: 0.1, d: 0.14 });
    reg(hits, filterGauge, "filter-bank");
    holoTag(filters, "filter bank ΔP", 0.2, 1.7, 0, { css: "#6fc6b8", w: 0.28 });
    // The drive on the wall: door, keypad, the dial as the track target.
    const vfd = equipmentCabinet(g, 0.5, 0.8, 0.3, -2.9, -2.4, { ry: 0.6 });
    vfd.position.y = 0.9;
    holoTag(vfd, "SF-1 drive", 0, 1.0, 0.2, { css: "#6fc6b8", w: 0.22 });
    const vfdDoor = box(vfd, 0.44, 0.7, 0.02, 0.4, 0.4, 0.3, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    vfdDoor.rotation.y = -1.3;
    reg(hits, vfdDoor, "vfd-door-open");
    const vfdFace = decal(vfd, 0.3, 0.12, 0, 0.55, 0.16, signFace("--.- Hz", { bg: "#0d1c24", accent: "#6fc6b8", fg: "#dff7f2", scale: 0.6 }), { glow: true, ei: 0.7 });
    const vfdDial = group(vfd, 0, 0.3, 0.16);
    const vfdKnob = cyl(vfdDial, 0.04, 0.04, 0.03, 0, 0, 0, 0xb8402f, { rough: 0.5, seg: 14 });
    vfdKnob.rotation.x = Math.PI / 2;
    box(vfdKnob, 0.06, 0.015, 0.015, 0, 0.02, 0, 0xfff3d6, { rough: 0.5 });
    for (let i = 0; i < 6; i++) box(vfd, 0.04, 0.03, 0.01, -0.12 + (i % 3) * 0.12, 0.12 + Math.floor(i / 3) * 0.06, 0.16, 0x22262b, { rough: 0.6 });
    reg(hits, vfdDial, "vfd-dial");
    holoTag(vfd, "drive keypad — door shut", 0, -0.05, 0.2, { css: "#d2312b", w: 0.4 });

    // ------------------------------------------------- the duct and ceiling
    // A main duct along the room at 2.4 m with a branch off it, the fire/smoke
    // damper and its actuator, the branch damper quadrant, the access door,
    // the flex runs to two diffusers in a ceiling grid over the corridor end.
    const main = group(g, 0, 0.06, -1.6);
    box(main, 6.2, 0.5, 0.6, 0, 2.5, 0, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    for (const sx of [-2.4, -1.2, 0, 1.2, 2.4]) box(main, 0.04, 0.56, 0.66, sx, 2.5, 0, 0xaeb5bb, { rough: 0.35, metal: 0.7 });
    // Access door, left open — the leak find.
    const accessDoor = box(main, 0.4, 0.3, 0.02, -1.8, 2.5, 0.32, 0x9aa3a8, { rough: 0.4, metal: 0.7 });
    accessDoor.rotation.y = 1.1; accessDoor.position.x = -1.6;
    reg(hits, accessDoor, "open-access-door");
    holoTag(main, "access door", -1.8, 2.9, 0.4, { css: "#6fc6b8", w: 0.24 });
    // Fire/smoke damper with its actuator.
    const fsd = group(main, -0.6, 2.5, 0);
    box(fsd, 0.3, 0.56, 0.66, 0, 0, 0, 0xd2312b, { rough: 0.5, metal: 0.5 });
    const blade = box(fsd, 0.02, 0.44, 0.5, 0, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.7 });
    blade.rotation.y = Math.PI / 2;                                                    // open (edge to the flow)
    const actuator = group(fsd, 0, 0.36, 0.2);
    box(actuator, 0.16, 0.12, 0.12, 0, 0, 0, 0x22262b, { rough: 0.6 });
    const actLamp = ball(actuator, 0.015, 0.05, 0.07, 0.04, 0x59c97b, { emissive: 0x59c97b, ei: 1.6 });
    reg(hits, actuator, "damper-actuator");
    holoTag(main, "fire/smoke damper · actuator", -0.6, 3.05, 0.4, { css: "#6fc6b8", w: 0.48 });
    // Pitot test point on the main, marked.
    const pitotPort = group(main, 1.2, 2.2, 0.1);
    cyl(pitotPort, 0.02, 0.02, 0.06, 0, 0, 0, 0xb8402f, { rough: 0.5, seg: 10 });
    decal(pitotPort, 0.16, 0.05, 0, -0.06, 0.2, signFace("TRAVERSE 3", { bg: "#22262b", accent: "#6fc6b8", scale: 0.45 }));
    const pitot = group(g, 1.4, 0.06, -0.5, -0.4);
    cyl(pitot, 0.006, 0.006, 0.9, 0, 1.3, 0, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 6 });
    cyl(pitot, 0.006, 0.006, 0.08, 0, 1.76, 0.04, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 6 }).rotation.x = Math.PI / 2;
    box(pitot, 0.12, 0.1, 0.04, 0, 0.85, 0, 0xf2c14b, { rough: 0.6 });
    cyl(pitot, 0.02, 0.02, 1.1, 0.25, 0.55, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    reg(hits, pitot, "pitot-tube");
    holoTag(pitot, "pitot tube", 0, 2.0, 0, { css: "#6fc6b8", w: 0.22 });
    // The branch: a smaller duct off the main toward the corridor end, with the quadrant and the mark.
    const branch = group(g, 1.4, 0.06, -1.6);
    box(branch, 0.35, 0.3, 2.6, 0, 2.5, 1.5, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    const takeoff = box(branch, 0.4, 0.36, 0.1, 0, 2.5, 0.35, 0xaeb5bb, { rough: 0.35, metal: 0.7 });
    const takeoffGap = box(branch, 0.42, 0.38, 0.02, 0, 2.5, 0.41, 0xd2312b, { rough: 0.5, opacity: 0.35, transparent: true, cast: false });
    reg(hits, takeoffGap, "unsealed-takeoff");
    const quadrant = group(branch, 0.2, 2.5, 1.0);
    cyl(quadrant, 0.05, 0.05, 0.02, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 14 }).rotation.z = Math.PI / 2;
    const quadHandle = box(quadrant, 0.02, 0.02, 0.16, 0.02, 0, 0.06, 0xb8402f, { rough: 0.5 });
    reg(hits, quadrant, "branch-damper");
    holoTag(branch, "branch damper quadrant", 0.2, 2.85, 1.0, { css: "#6fc6b8", w: 0.42 });
    const lockNut = group(branch, 0.2, 2.5, 1.0);
    box(lockNut, 0.03, 0.03, 0.03, 0.06, 0, -0.06, 0x8a8f94, { rough: 0.4, metal: 0.7 });
    reg(hits, lockNut, "damper-lock");
    const markLine = box(branch, 0.005, 0.02, 0.12, 0.19, 2.66, 1.0, 0xfff3d6, { rough: 0.5 });
    markLine.visible = false;
    // Flex runs to two diffusers in the corridor ceiling grid.
    const ceiling = group(g, 1.4, 0.06, 1.2);
    for (let i = 0; i < 3; i++) box(ceiling, 2.4, 0.03, 0.03, 0, 2.3, -0.6 + i * 0.6, 0xdfe3e6, { rough: 0.6, cast: false });
    for (let i = 0; i < 5; i++) box(ceiling, 0.03, 0.03, 1.2, -1.2 + i * 0.6, 2.3, 0, 0xdfe3e6, { rough: 0.6, cast: false });
    for (let i = 0; i < 4; i++) box(ceiling, 0.56, 0.02, 0.56, -0.9 + (i % 2) * 0.6 + Math.floor(i / 2) * 0.6, 2.31, -0.3 + (i % 2) * 0.6, 0xeef1f3, { rough: 0.9, cast: false });
    const grid = box(ceiling, 2.4, 0.02, 1.2, 0, 2.29, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, grid, "grid-step");
    const diffuser = group(ceiling, -0.3, 2.28, 0.3);
    box(diffuser, 0.5, 0.03, 0.5, 0, 0, 0, 0xf4f6f7, { rough: 0.5 });
    for (let i = 0; i < 3; i++) box(diffuser, 0.36 - i * 0.1, 0.01, 0.36 - i * 0.1, 0, -0.01 - i * 0.008, 0, 0xdfe3e6, { rough: 0.5 });
    const diffuserFace = box(diffuser, 0.5, 0.1, 0.5, 0, -0.1, 0, 0xffffff, { rough: 0.5 });
    diffuserFace.visible = false; hits["diffuser-face"] = diffuserFace;
    holoTag(ceiling, "diffuser — 250 cfm design", -0.3, 2.1, 0.3, { css: "#6fc6b8", w: 0.42 });
    const flex1 = hose(g, [[1.4, 2.5, 0.0], [1.3, 2.55, 0.8], [1.1, 2.45, 1.5]], 0.1, 0x8a8f94, { steps: 12, rough: 0.8 });
    const flex2 = hose(g, [[1.4, 2.5, 0.2], [2.0, 2.6, 0.9], [2.3, 2.45, 1.6]], 0.1, 0x8a8f94, { steps: 12, rough: 0.8 });
    const flexOff = cyl(g, 0.1, 0.1, 0.16, 2.3, 2.4, 1.75, 0x8a8f94, { rough: 0.8, seg: 12 });
    flexOff.rotation.x = 0.6;
    reg(hits, flexOff, "flex-disconnect");
    holoTag(g, "corner diffuser flex", 2.3, 2.7, 1.75, { css: "#6fc6b8", w: 0.36 });
    const crushed = cyl(g, 0.1, 0.1, 0.3, 1.2, 2.5, 1.15, 0x6a6f74, { rough: 0.8, seg: 12 });
    crushed.scale.set(1, 1, 0.45); crushed.rotation.x = Math.PI / 2;
    reg(hits, crushed, "crushed-flex");
    const cableTray = box(g, 1.2, 0.06, 0.2, 1.2, 2.62, 1.15, 0x3a4550, { rough: 0.55, metal: 0.5, cast: false });
    // Return and outside air readings: points on the return duct and the intake louvre.
    const ret = box(g, 0.6, 0.5, 2.0, -0.6, 2.5, 1.2, 0xb9bec4, { rough: 0.3, metal: 0.7 });
    holoTag(g, "return", -0.6, 2.9, 1.2, { css: "#6fc6b8", w: 0.2 });
    const retPort = cyl(g, 0.02, 0.02, 0.06, -0.6, 2.2, 0.8, 0xb8402f, { rough: 0.5, seg: 10 });
    reg(hits, retPort, "return-reading");
    const supPort = cyl(main, 0.02, 0.02, 0.06, 2.2, 2.2, 0.1, 0xb8402f, { rough: 0.5, seg: 10 });
    reg(hits, supPort, "supply-reading");
    const louvre = group(g, 2.9, 0.06, -1.0, -1.2);
    box(louvre, 0.6, 0.6, 0.06, 0, 1.9, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 6; i++) box(louvre, 0.54, 0.02, 0.1, 0, 1.66 + i * 0.09, 0.02, 0x8a8f94, { rough: 0.5, metal: 0.6 }).rotation.x = 0.6;
    reg(hits, louvre, "oa-reading");
    holoTag(louvre, "outside air", 0, 2.3, 0, { css: "#6fc6b8", w: 0.24 });

    // ------------------------------------------------ the ladder and hood
    const ladder = group(g, 0.7, 0.06, 0.9, 0.3);
    for (const sx of [-0.22, 0.22]) { box(ladder, 0.04, 1.8, 0.04, sx, 0.9, 0.1, 0xf2c14b, { rough: 0.6 }).rotation.x = -0.18; box(ladder, 0.04, 1.8, 0.04, sx, 0.9, -0.3, 0x8a8f94, { rough: 0.5, metal: 0.6 }).rotation.x = 0.18; }
    for (let i = 0; i < 5; i++) box(ladder, 0.44, 0.03, 0.08, 0, 0.3 + i * 0.32, 0.13 - i * 0.055, 0xf2c14b, { rough: 0.6 });
    const topCap = box(ladder, 0.5, 0.04, 0.2, 0, 1.82, -0.1, 0xf2c14b, { rough: 0.6 });
    reg(hits, topCap, "top-step");
    decal(ladder, 0.3, 0.06, 0, 1.6, -0.02, signFace("NOT A STEP", { bg: "#d2312b", accent: "#fff", fg: "#fff", scale: 0.5 }));
    holoTag(ladder, "stepladder", 0, 2.05, 0, { css: "#6fc6b8", w: 0.24 });
    const hood = group(g, -0.6, 0.06, 0.8, 0.2);
    box(hood, 0.5, 0.06, 0.5, 0, 0.7, 0, 0x2b2f34, { rough: 0.6 });
    const skirt = box(hood, 0.56, 0.5, 0.56, 0, 1.0, 0, 0x2f6f8c, { rough: 0.8, opacity: 0.85, transparent: true });
    const hoodFace = decal(hood, 0.3, 0.1, 0, 0.6, 0.26, signFace("---- cfm", { bg: "#0d1c24", accent: "#6fc6b8", fg: "#dff7f2", scale: 0.6 }), { glow: true, ei: 0.7 });
    reg(hits, hood, "flow-hood");
    holoTag(hood, "flow hood", 0, 1.35, 0, { css: "#6fc6b8", w: 0.22 });
    const calTag = decal(hood, 0.1, 0.06, 0.2, 0.72, 0.29, paperFace("CAL", ["in date"], { bg: "#f4efe4", band: "#6fc6b8" }), { px: 96 });
    reg(hits, calTag, "hood-cal-tag");

    // -------------------------------------------------- board, report, log
    const board = group(g, -2.6, 0.06, 1.9, 0.9);
    box(board, 0.9, 0.7, 0.04, 0, 1.45, 0, 0x1b2026, { rough: 0.6 });
    const boardFace = decal(board, 0.84, 0.64, 0, 1.45, 0.025, paperFace("MECH ROOM — TODAY", ["TAB: apprentice (you) + lead", "Mechanic: SF-1 belts, p.m.", "Controls: FSD actuators — testing", "Electrician: drive door open?", "Fan SF-1: in service"], { bg: "#eef1f3", band: "#6fc6b8" }), { px: 384 });
    reg(hits, boardFace, "tab-board");
    for (const sx of [-0.4, 0.4]) cyl(board, 0.02, 0.02, 1.8, sx, 0.9, -0.02, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    holoPanel(g, 0.72, 0.5, 2.4, 1.7, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "#0a1614"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6fc6b8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#dff7f2";
      ctx.fillText("TAB REPORT — SF-1, BRANCH 3", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Fan: 4,800 cfm · 2.1 in. w.g. · 48 Hz", "Diffusers: 4 x 250 cfm ± 10%", "Return: 4,000 cfm · OA: 800 cfm", "Filters: 0.35 clean / 0.9 dirty", "Method: proportional, NEBB / ASHRAE 111"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: SMAB_ACCENT, ry: -1.0 });
    const reportHit = box(g, 0.72, 0.5, 0.04, 2.4, 1.7, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reportHit.rotation.y = -1.0;
    reg(hits, reportHit, "tab-report");
    const logBoard = group(g, 2.85, 0.06, 0.3, -1.2);
    box(logBoard, 0.06, 1.0, 0.06, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const logFace = decal(logBoard, 0.34, 0.44, 0, 1.2, 0.02, paperFace("TAB — BRANCH 3", ["Instruments: ____", "Fan Hz / static: ____", "Outlets: ____", "Faults: ____", "Signed: ____"], { bg: "#f4efe4", band: "#6fc6b8" }), { px: 256 });
    reg(hits, logFace, "tab-log");
    holoTag(logBoard, "TAB report sheet", 0, 1.5, 0, { css: "#6fc6b8", w: 0.32 });

    // ------------------------------------------------------------ the crew
    const mechanic = standingFigure(g, -2.0, 0.1, { ry: 1.2, cloth: 0x7a5a3a, trousers: 0x22262b, cap: 0x3a4048, gloves: true });
    const lead = standingFigure(g, 1.9, 2.5, { ry: -2.6, cloth: 0x3a5a7a, trousers: 0x2b2f34, helmet: 0x6fc6b8 });

    // ---------------------------------------------------------- dressing
    for (const sx of [-1.6, 0.4, 2.2]) {
      box(g, 0.6, 0.06, 0.2, sx, 2.9, -0.4, 0x2b2f34, { rough: 0.6, cast: false });
      box(g, 0.56, 0.02, 0.16, sx, 2.87, -0.4, 0xfff7e0, { emissive: 0xfff7e0, ei: 1.2, rough: 0.5, cast: false });
    }
    pipeRun(g, [[-3.3, 2.0, -2.9], [3.3, 2.0, -2.9]], 0.05, 0x2f6f8c, { seg: 10 });
    pipeRun(g, [[-3.3, 1.8, -2.9], [3.3, 1.8, -2.9]], 0.05, 0xb8402f, { seg: 10 });
    for (const [x, z] of [[-1.4, 2.6], [2.6, -2.6]]) cone(g, x, z);
    const toolBag = group(g, 0.1, 0.06, 2.0, 0.4);
    box(toolBag, 0.5, 0.3, 0.3, 0, 0.15, 0, 0x2b2f34, { rough: 0.85 });
    cyl(toolBag, 0.02, 0.02, 0.4, -0.1, 0.35, 0, 0xf2c14b, { rough: 0.6, seg: 8 }).rotation.z = 0.3;
    box(toolBag, 0.14, 0.04, 0.2, 0.1, 0.32, 0, 0x6fc6b8, { rough: 0.5 });
    holoTag(toolBag, "TAB kit — anemometer · thermometer", 0, 0.55, 0, { css: "#6fc6b8", w: 0.56 });
    const ext = group(g, 2.9, 0.06, -2.0, -0.8);
    cyl(ext, 0.06, 0.07, 0.42, 0, 0.35, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.025, 0.025, 0.08, 0, 0.6, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "extinguisher", 0, 0.72, 0, { css: "#d2312b", w: 0.3 });
    const signBoard = group(g, -0.8, 0.06, 2.85, 3.1);
    box(signBoard, 0.5, 0.4, 0.03, 0, 1.4, 0, 0x1b2026, { rough: 0.6 });
    decal(signBoard, 0.44, 0.34, 0, 1.4, 0.018, signFace("GUARD OFF\nMEANS\nFAN OFF", { bg: "#0a1614", accent: "#6fc6b8", fg: "#dff7f2", scale: 0.28 }));
    cyl(signBoard, 0.02, 0.02, 1.2, 0, 0.6, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    const drainPan = box(g, 1.2, 0.04, 0.6, -1.8, 0.08, -1.2, 0x8a8f94, { rough: 0.4, metal: 0.7 });
    const condensate = hose(g, [[-1.3, 0.1, -1.2], [-0.4, 0.1, -0.6], [0.4, 0.1, -0.3]], 0.015, 0xdfe9ee, { steps: 10 });

    let fanOn = true;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 2.2, -1.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "instrument-cal") { calTag.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.6, rough: 0.6 }); }
        if (step.id === "hood-drag") { hood.parent.remove(hood); ceiling.add(hood); hood.position.set(-0.3, 1.5, 0.3); hood.rotation.set(0, 0, 0); repaint(hoodFace, signFace("241 cfm", { bg: "#0d1c24", accent: "#59c97b", fg: "#dff7f2", scale: 0.6 })); }
        if (step.id === "lock-mark") { markLine.visible = true; lockNut.scale.set(1.5, 1.5, 1.5); }
        if (step.id === "leak-walk") { accessDoor.rotation.y = 0; accessDoor.position.x = -1.8; flexOff.rotation.x = 0; flexOff.position.set(2.3, 2.45, 1.6); }
        if (step.id === "room-walk") { takeoffGap.visible = false; cableTray.position.y = 2.75; crushed.scale.set(1, 1, 1); }
        if (step.id === "tab-log") repaint(logFace, paperFace("TAB — BRANCH 3", ["Hood cal in date, mano zeroed", "48.0 Hz / 2.08 in. w.g.", "4 outlets in tol. after faults", "Door, flex, takeoff, crush — noted", "Signed: apprentice / lead"], { bg: "#f4efe4", band: "#6fc6b8" }));
      },
      onHazard() {},
      // The damper really closes; the guard really comes off a running fan.
      onInterrupt(it) {
        if (it.id === "damper-closes") { blade.rotation.y = 0; actLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8 }); }
        if (it.id === "guard-off-fan") { beltGuard.visible = false; mechanic.position.set(-1.0, 0, -2.9); mechanic.rotation.y = 0.4; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "damper-closes") { blade.rotation.y = Math.PI / 2; actLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); }
        if (it.id === "guard-off-fan") { fanOn = false; discHandle.rotation.z = Math.PI / 2; lock.visible = true; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        if (fanOn) { sheaveA.rotation.z += dt * 6; sheaveB.rotation.z += dt * 10; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "static-read") {
          repaint(manometer.userData.screen, signFace(`${(gg.t * 4).toFixed(2)} in.`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff7f2", scale: 0.6 }));
        }
        const tn = session?.turn;
        if (tn && step?.id === "damper-turn") quadHandle.rotation.x = tn.amount * Math.PI;
        const tr = session?.track;
        if (tr && step?.id === "fan-speed") {
          vfdKnob.rotation.z = tr.v * Math.PI * 1.6;
          repaint(vfdFace, signFace(`${(tr.v * 60).toFixed(1)} Hz`, { bg: "#0d1c24", accent: tr.v >= 0.42 && tr.v <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#dff7f2", scale: 0.6 }));
        }
        if (step?.id === "pitot-hold" && session.holding) pitot.position.y = 0.06 + Math.min(0.5, session.holdFor * 0.15);
      },
    };
  },
};
