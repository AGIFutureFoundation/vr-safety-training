import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, rackFrame, rackUnit,
  cone, barrierPanel, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Coke Oven Battery Heat Rotation VR — Manufacturing &
// Automation, mill and mine pack, station three.
//
// The topside of a coke oven battery, where a leaking door seal, a larry car
// on its own rail and radiant heat off every oven face are simply the
// working conditions. The whole shift is built around a work/rest rotation
// set to the plan rather than to how tough anyone feels: PPE on before the
// heat is ever approached, a buddy checked in with before going topside, a
// leaking seal luted rather than worked around, the larry car's path
// respected rather than crossed on a guess, and the cooldown taken for its
// full interval before going back up. Per the plan and the label throughout
// — no figure here is a fact this platform is claiming to know.

const MCO_ACCENT = 0xd9541c;

export const SIM_MM_COKE_OVEN_HEAT_ROTATION = {
  id: "mm-coke-oven-heat-rotation",
  index: "710",
  domain: "Manufacturing",
  trade: "Coke oven battery topside worker",
  category: "Manufacturing & Automation",
  indoor: "plant",
  certification: "USW Tony Mazzocchi Center health and safety training; ACGIH Threshold Limit Values heat stress guidance; NIOSH criteria documents on occupational heat exposure; OSHA 29 CFR 1910.132 personal protective equipment",
  name: "Coke Oven Heat Rotation",
  title: simTitle("Coke Oven Heat Rotation"),
  tagline: "A battery topside shift worked to the plan's heat-stress rotation: PPE on, a buddy checked in with, a leaking door seal luted, the larry car's path respected, cooldown taken in full",
  accent: MCO_ACCENT,
  accentCss: "#d9541c",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "rotation-held", name: "Rotation Held", note: "A topside shift worked to the plan's rotation, PPE on, the buddy system kept, and every cooldown taken in full" },

  game: system({
    name: "Battery Topside Authority",
    currency: "CHARGE",
    ranks: ["Larry Car Helper", "Topside Worker", "Battery Operator", "Battery Foreman", "Battery Topside Authority Certified"],
    badges: [
      { id: "ppe-and-buddy", name: "PPE And Buddy", note: "Full PPE on and the buddy checked in with before going topside, first time", test: AWARD.stepClean("ppe-donning") },
      { id: "off-the-rail", name: "Off The Rail", note: "Never touched a hot door face, stood in the larry car's path, reached into the hopper or reached for the wrong drink", test: AWARD.safe },
      { id: "strain-in-band", name: "Strain In Band", note: "Heat-strain monitor read inside its safe band the whole shift", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-rotation", name: "Clean Rotation", note: "No corrections through the whole rotation", test: AWARD.clean },
      { id: "charge-unbroken", name: "Charge Unbroken", note: "The larry car charge never broke its controlled rate", test: AWARD.unbroken },
      { id: "rotation-fast", name: "Rotation Fast", note: "Rotation completed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hot-door-face": "You put a bare hand on the oven door face. Every door on a working battery is radiating the heat of the oven behind it whether or not anyone is charging or pushing at that moment, and a door face gives no visible warning before it burns a hand that touches it.",
    "larry-car-path": "You stepped into the larry car's rail path while it was moving. The car travels the same track every time it charges an oven, on a schedule the operator is watching from the cab, not the deck — the path is respected as if the car could arrive any moment, because on a working battery it can.",
    "hopper-reach": "You reached into the hopper gate while it was discharging. Coal moving out of a hopper behaves like anything else that flows — it takes a hand in before the hand can be pulled back out, and the gate is watched and worked from the control lever, never from inside the chute.",
    "energy-drink-cooler": "You reached for the caffeinated energy drink instead of the water station. A rotation built around staying hydrated in the heat is undone by a drink that works against that — caffeine is exactly what the plan's hydration guidance asks a crew to avoid during a heat rotation, not a stimulant to reach for when the heat gets to you.",
  },

  lateNotes: {
    "larry-car-lever": "Not yet. The door latch is confirmed and the track is clear before the car moves.",
    "cooling-station": "The cooldown comes after the rotation's work interval is actually finished — not early, and not skipped.",
  },

  steps: [
    {
      id: "rotation-schedule", kind: "select", target: "rotation-board",
      title: "Read today's rotation schedule",
      cue: "Check the work/rest rotation and today's crew assignments on the board.",
      why: "The rotation board is what sets how long a crew works topside before the next cooldown, and it is set for the day's conditions rather than left the same as yesterday's. A shift that starts from habit instead of from the board is a shift betting that today's conditions match a day nobody actually measured against this one.",
    },
    {
      id: "ppe-donning", kind: "sequence", anyOrder: true,
      targets: ["reflective-suit", "heat-shield-visor", "insulated-gloves"],
      itemNames: { "reflective-suit": "reflective suit on", "heat-shield-visor": "heat-shield visor down", "insulated-gloves": "insulated gloves on" },
      title: "Put on the full topside PPE",
      cue: "Reflective suit on, heat-shield visor down, insulated gloves on — all three before going topside.",
      why: "Radiant heat off a working battery reaches exposed skin at a distance a person would not expect from looking at the ovens, and the suit, the visor and the gloves each cover a different part of that exposure. Skipping any one of them leaves exactly the part of the body it was covering exposed to a source that does not announce itself before it burns.",
    },
    {
      id: "buddy-checkin", kind: "select", target: "buddy-partner",
      title: "Check in with your rotation buddy",
      cue: "Confirm with your buddy that you are both going topside together and know each other's rotation time.",
      why: "The buddy system is what catches the early signs of heat illness in somebody who has stopped noticing them in themselves — confusion and poor judgement are two of the first symptoms, and they are exactly the symptoms that make a person unreliable at reporting their own condition. Checking in before going up is what makes sure two people are actually watching, not just one who assumes the other is fine.",
    },
    {
      id: "topside-walk", kind: "find", noHint: true,
      targets: ["door-seal-leak"],
      itemNames: { "door-seal-leak": "a leaking oven door seal" },
      itemNotes: { "door-seal-leak": "There is a visible leak along this oven door's seal — the luting that is supposed to keep the oven's contents from finding a way out along the door's edge has failed at this spot." },
      title: "Walk the topside before starting work",
      cue: "Check the oven doors for a leaking seal and click what you see.",
      why: "A door seal that has started to leak does not fix itself, and it is found on a walk of the topside before it is found by whoever has to work directly beside it for the rest of the shift. Luting a leak early is a short job; leaving it for the next crew to find is a longer one.",
    },
    {
      id: "lute-door-seal", kind: "drag", target: "luting-tool",
      title: "Lute the leaking door seal",
      cue: "Carry the luting tool to the leaking seal and reseal it.",
      why: "Luting compound worked into the seal by hand, with the tool rather than the glove, is what actually closes the gap the leak found — a leak left alone gets wider under the oven's own heat cycling, and a door resealed at the first sign of a leak stays a smaller job than the same door resealed after a full shift of it opening further.",
      drag: { to: "door-seal", radius: 0.4, missNote: "Not on the seal — work the luting compound into the leak itself, not the door face beside it." },
    },
    {
      id: "check-door-latch", kind: "turn", target: "door-latch-bar",
      title: "Confirm the door latch before the car moves",
      cue: "Turn the latch bar to confirm the door is fully seated and locked before the larry car approaches.",
      why: "A door that is not fully latched can work itself open under the oven's own pressure once the car is charging, and the moment to find that out is before the car is on its way, not after it has already committed to the charge with an unlatched door underneath it.",
      turn: { turns: 0.5, axis: "y", label: "LATCH" },
    },
    {
      id: "larry-charge", kind: "track", target: "larry-car-lever", seconds: 6,
      title: "Charge the oven at a controlled rate",
      cue: "Hold the larry car control steady and travel the charge at a controlled rate along the rail.",
      why: "A charge run too fast overshoots the oven mouth and spills coal along the topside deck; run too slow, it leaves the car sitting exposed over an open oven longer than the charge needs. The steady, controlled rate a topside crew holds is what gets the coal into the oven and the car clear of it without either.",
      track: { start: 0.1, green: [0.42, 0.6], rise: 0.5, fall: 0.42, drift: 0.12, label: "CAR SPEED", readout: (v) => (v < 0.42 ? "too slow" : v > 0.6 ? "too fast" : "controlled") },
      holdBreakNote: "Car speed out of band — bring it back before the charge overshoots the oven mouth.",
    },
    {
      id: "watch-hopper", kind: "hold", target: "hopper-gate", seconds: 5,
      title: "Watch the hopper clear",
      cue: "Hold the hopper release lever and watch the coal clear without reaching toward the gate.",
      why: "The hopper gate is worked from the lever the whole time it is discharging, because coal flowing out of a hopper does not stop for a hand that reaches in to clear a hang-up — the lever is released, the flow is watched, and anything that needs clearing is cleared with the flow stopped, not while it is running.",
      holdBreakNote: "You let go of the lever before the hopper finished clearing. A gate released mid-discharge is a gate that has to be started again from a coal face nobody has actually seen clear.",
    },
    {
      id: "heat-strain-check", kind: "gauge", target: "heat-strain-monitor",
      title: "Read your heat-strain monitor",
      cue: "Check the wearable heat-strain monitor and confirm the reading is inside the plan's safe band.",
      why: "A heat-strain monitor reads the body's own response to the heat, which is what actually matters, rather than the air temperature alone — two people doing the same job in the same heat can carry very different strain. Reading it against the plan's band, rather than against how a person feels, is what catches strain building before it becomes an illness.",
      gauge: { label: "STRAIN", speed: 0.72, green: [0.2, 0.55], readout: (t) => (t > 0.55 ? "elevated — rotate out" : t < 0.2 ? "reading low" : "in band"), missNote: "Reading is outside the safe band — that is the cue to rotate out now, not at the end of the interval." },
    },
    {
      id: "hydration-break", kind: "select", target: "water-station",
      title: "Take your hydration break",
      cue: "Drink from the water and electrolyte station at your scheduled break.",
      why: "The rotation's hydration guidance names water and electrolyte replacement specifically, on a schedule rather than only when a person feels thirsty — thirst lags well behind the body's actual fluid loss in this kind of heat, so the break is taken on the plan's schedule whether or not anyone feels like they need it yet.",
    },
    {
      id: "cooldown-rest", kind: "hold", target: "cooling-station", seconds: 5,
      title: "Take the cooldown in full",
      cue: "Hold your rest at the cooling station for the plan's full rest interval before returning topside.",
      why: "The rest interval is what lets the body actually shed the heat it picked up during the work interval, and cutting it short to get back to work sooner just carries that heat into the next work interval on top of whatever it adds. The interval is taken in full, on the rotation board's schedule, not until a person feels ready to go back.",
      holdBreakNote: "You got up before the interval finished. A cooldown cut short is heat strain carried straight into the next rotation.",
    },
    {
      id: "supervisor-clearance", kind: "select", target: "shift-lead",
      title: "Check in with the shift lead before going back up",
      cue: "Confirm with the shift lead that your rest interval is complete before returning topside.",
      why: "The shift lead is tracking every crew's rotation at once, not just yours, and checking in is what keeps the board's schedule matched to who is actually where — a crew that goes back up on their own clock rather than the shift lead's is a crew the rotation can no longer actually account for.",
    },
    {
      id: "final-scan", kind: "find", noHint: true,
      targets: ["hopper-guard-missing"],
      itemNames: { "hopper-guard-missing": "a missing guard panel on the hopper drive" },
      itemNotes: { "hopper-guard-missing": "The guard panel over the hopper's drive chain has been left off — a reach-in point next to a mechanism that does not stop for a hand any more than the coal it moves does." },
      title: "Walk the topside before you sign off",
      cue: "Check the hopper drive and click what needs a work order.",
      why: "The rotation covers the heat; it does not cover a guard that went missing during the shift and that the next crew would otherwise find the hard way. A walk before signing off is what catches it while it is still a work order and not an injury report.",
    },
  ],

  interrupts: [
    {
      id: "buddy-distress",
      kind: "Buddy showing signs",
      after: "heat-strain-check", delay: 3, seconds: 12,
      alert: "Your rotation buddy has stopped talking mid-sentence and is standing still, looking confused about which way to walk.",
      cue: "Your buddy is showing early signs of heat illness.",
      target: "heat-illness-alert",
      why: "Confusion and stopping mid-task are early heat-illness signs precisely because the person having them usually cannot recognise it in themselves — that is what the buddy system exists to catch. The alert calls it in and gets your buddy to the cooling station now, not at the end of the work interval.",
      missNote: "You kept working while your buddy stood there confused. Heat illness gets worse, not better, on its own, and the interval a buddy still has left on the rotation board means nothing once the early signs are already showing.",
      wrongNote: "It is the heat-illness alert. Nothing else gets your buddy relief this fast.",
    },
    {
      id: "larry-approaches",
      kind: "Car on the move",
      after: "check-door-latch", delay: 3, seconds: 11,
      alert: "The larry car has started moving toward this oven earlier than the schedule showed, and you are still close to the rail.",
      cue: "The car is moving and you are near the track.",
      target: "larry-horn",
      why: "A schedule tells you when a car is supposed to move; it does not stop the car from moving early if the operator's own sequence calls for it sooner. The horn is what warns the operator someone is still on the track it is about to travel, answered from beside the rail, not by guessing whether there is time to clear it on foot.",
      missNote: "The car kept coming while you were still near the rail. A larry car does not swerve for a person on its track, and a schedule that said it would arrive later is not a reason to stay on the rail once it is already moving.",
      wrongNote: "It is the larry car horn. Nothing else reaches the operator fast enough from where you are standing.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, MCO_ACCENT);
    box(g, 6.4, 0.12, 5.8, 0, 0.06, 0, 0x3a2e26, { rough: 0.9, finish: "concrete" });
    for (let i = -2; i <= 2; i++) box(g, 0.05, 0.13, 5.8, i * 1.1, 0.065, 0, 0xf0b323, { rough: 0.6, opacity: 0.5, transparent: true, cast: false });

    // ------------------------------------------------------------ oven wall
    const wall = group(g, 0, 0, -1.6);
    box(wall, 6.4, 2.6, 0.9, 0, 1.3, 0, 0x3a2a22, { rough: 0.9, finish: "concrete" });
    const doors = [];
    for (let i = -2; i <= 2; i++) {
      const d = group(wall, i * 1.15, 1.3, 0.46);
      const face = box(d, 0.9, 2.0, 0.12, 0, 0, 0, 0x2b1c14, { rough: 0.75, metal: 0.3 });
      doors.push({ group: d, face });
    }
    holoTag(wall, "battery topside — ovens 40–44", 0, 2.8, 0.46, { css: "#d9541c", w: 0.6 });
    // The leaking seal — oven at index 1 (second from left).
    const leakDoor = doors[1];
    const seal = box(leakDoor.group, 0.94, 0.04, 0.02, 0, 0.94, 0.07, 0xf2ae14, { emissive: 0xff8a00, ei: 1.1, rough: 0.4, cast: false });
    reg(hits, seal, "door-seal-leak");
    const sealFumes = particles(leakDoor.group, 16, 0xd8c79a, { size: 0.03, life: 0.6, additive: false, opacity: 0.35 });
    sealFumes.position.set(0, 0.94, 0.1);
    const sealSocket = box(leakDoor.group, 0.9, 0.06, 0.05, 0, 0.94, 0.08, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, sealSocket, "door-seal");
    // A hot door face elsewhere — hazard, not the leaking one.
    reg(hits, doors[3].face, "hot-door-face");
    // Latch bar on the oven about to be charged (index 2, centre).
    const latchDoor = doors[2];
    const latch = group(latchDoor.group, 0.5, -0.6, 0.08);
    cyl(latch, 0.03, 0.03, 0.4, 0, 0, 0, 0x8a929a, { rough: 0.5, metal: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    reg(hits, latch, "door-latch-bar");

    // ------------------------------------------------------------ larry car
    const rail = group(g, 0, 0, -0.3);
    for (const dx of [-0.35, 0.35]) cyl(rail, 0.05, 0.05, 6.4, dx, 1.3, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 10 }).rotation.z = Math.PI / 2;
    const larry = group(rail, 0.5, 1.3, 0);
    box(larry, 1.4, 0.6, 0.7, 0, 0.3, 0, 0xf0b323, { rough: 0.6, finish: "painted" });
    const hopperBody = box(larry, 1.1, 0.5, 0.6, 0, 0.85, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    void hopperBody;
    const hopperGateGeom = box(larry, 0.9, 0.08, 0.5, 0, 0.55, 0, 0x1b1e22, { rough: 0.6, metal: 0.4 });
    reg(hits, hopperGateGeom, "hopper-gate");
    const guardPanel = box(larry, 0.3, 0.24, 0.08, 0.5, 0.5, 0.32, 0xf0b323, { rough: 0.6, opacity: 0.65, transparent: true });
    reg(hits, guardPanel, "hopper-guard-missing");
    const lever = group(g, -2.2, 0, -0.9);
    box(lever, 0.14, 0.9, 0.14, 0, 0.45, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const leverArm = cyl(lever, 0.022, 0.022, 0.4, 0, 0.9, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 8 });
    reg(hits, lever, "larry-car-lever");
    const railPath = box(g, 6.4, 0.5, 0.9, 0, 0.25, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, railPath, "larry-car-path");
    // A wrong-hand reach zone into the hopper chute.
    const hopperReach = box(g, 0.6, 0.3, 0.4, 0.5, 1.0, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hopperReach, "hopper-reach");
    const larryHornPost = group(g, -2.8, 0, -0.4);
    box(larryHornPost, 0.14, 0.8, 0.14, 0, 0.4, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const hornBell = cyl(larryHornPost, 0.06, 0.08, 0.1, 0, 0.85, 0.06, 0xb9bec4, { rough: 0.4, metal: 0.6, seg: 12 });
    holoTag(larryHornPost, "larry car horn", 0, 1.05, 0, { css: "#d9541c", w: 0.34 });
    reg(hits, larryHornPost, "larry-horn");

    // ------------------------------------------------------------ PPE, buddy, board
    const ppeRack = group(g, -2.7, 0, 1.2);
    box(ppeRack, 0.9, 1.6, 0.1, 0, 0.8, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const suit = box(ppeRack, 0.34, 0.5, 0.05, -0.26, 1.1, 0.08, 0xd8dfe6, { rough: 0.45, finish: "brushed" });
    holoTag(ppeRack, "reflective suit", -0.26, 1.4, 0.08, { css: "#d9541c", w: 0.4 });
    reg(hits, suit, "reflective-suit");
    const visor = box(ppeRack, 0.2, 0.16, 0.03, 0, 1.1, 0.08, 0x2b2f34, { rough: 0.35, opacity: 0.55, transparent: true });
    holoTag(ppeRack, "heat-shield visor", 0, 1.32, 0.08, { css: "#d9541c", w: 0.4 });
    reg(hits, visor, "heat-shield-visor");
    const gloves = box(ppeRack, 0.24, 0.2, 0.05, 0.28, 1.05, 0.08, 0xb9793a, { rough: 0.8, finish: "rubber" });
    holoTag(ppeRack, "insulated gloves", 0.28, 1.3, 0.08, { css: "#d9541c", w: 0.36 });
    reg(hits, gloves, "insulated-gloves");

    const buddy = standingFigure(g, 1.5, 1.85, { ry: -2.4, cloth: 0x4a5b6b, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(g, "your rotation buddy", 1.5, 2.0, 1.85, { css: "#d9541c", w: 0.4 });
    reg(hits, buddy, "buddy-partner");
    const shiftLead = standingFigure(g, -1.7, 1.7, { ry: 2.4, cloth: 0x2f4a5b, vest: 0xf2a23b, helmet: 0xf2f2f2 });
    holoTag(g, "shift lead", -1.7, 2.05, 1.7, { css: "#d9541c", w: 0.32 });
    reg(hits, shiftLead, "shift-lead");
    const alertPost = group(g, 0.3, 0, 2.0);
    box(alertPost, 0.18, 0.9, 0.12, 0, 0.45, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const alertBtn = ball(alertPost, 0.06, 0, 0.82, 0.08, 0xd2312b, { emissive: 0x000000, ei: 0.4, rough: 0.4, seg: 12, seg2: 10 });
    holoTag(alertPost, "heat-illness alert", 0, 1.05, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, alertPost, "heat-illness-alert");

    const board = holoPanel(g, 0.62, 0.44, -2.7, 1.5, 1.6, (cx, w, h) => {
      cx.fillStyle = "#1a1006"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d9541c"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ROTATION BOARD — TODAY", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#f6ead6";
      ["Work interval: per the plan", "Rest interval: per the plan", "Crew: A shift topside", "Hydration: water + electrolyte"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { accent: MCO_ACCENT, ry: 0.4 });
    reg(hits, board, "rotation-board");

    // -------------------------------------------------------- hydration, cooldown
    const waterStation = group(g, 2.4, 0, -0.2);
    cyl(waterStation, 0.2, 0.24, 0.7, 0, 0.35, 0, 0x2f7d8c, { rough: 0.6, metal: 0.3, seg: 16 });
    holoTag(waterStation, "water + electrolytes", 0, 0.75, 0, { css: "#4fd1ff", w: 0.42 });
    reg(hits, waterStation, "water-station");
    const cooler = group(g, 2.4, 0, 0.5);
    box(cooler, 0.36, 0.4, 0.3, 0, 0.2, 0, 0xd2312b, { rough: 0.5, finish: "painted" });
    holoTag(cooler, "energy drinks", 0, 0.46, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, cooler, "energy-drink-cooler");
    const cooldown = group(g, 2.5, 0, 1.8);
    box(cooldown, 0.5, 0.45, 0.5, 0, 0.22, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    box(cooldown, 0.42, 0.1, 0.42, 0, 0.5, 0, 0x8a929a, { rough: 0.5, metal: 0.4 });
    holoTag(cooldown, "cooling station", 0, 0.72, 0, { css: "#4fd1ff", w: 0.36 });
    reg(hits, cooldown, "cooling-station");
    const fan = group(cooldown, 0, 0.9, -0.3);
    cyl(fan, 0.02, 0.02, 0.6, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.4, seg: 8 });
    torus(fan, 0.16, 0.02, 0, 0.32, 0, 0x8a929a, { rough: 0.5, metal: 0.4, seg: 8, seg2: 16 });

    // Heat-strain monitor on the wrist stand near the cooldown.
    const monitorStand = group(g, 1.9, 0, 1.3);
    cyl(monitorStand, 0.03, 0.035, 0.8, 0, 0.4, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const monitor = instrument(monitorStand, 0, 0.85, 0, { ry: 0.6, idle: "-- strain", color: MCO_ACCENT });
    reg(hits, monitor, "heat-strain-monitor");

    // Luting tool on a small rack near the seal.
    const luteRack = toolChest(g, -2.7, -1.8, { ry: 0.6, color: 0x8a4a26 });
    const luteTool = box(luteRack, 0.28, 0.06, 0.06, 0, 0.78, 0, 0x8a929a, { rough: 0.5, metal: 0.5 });
    holoTag(luteRack, "luting tool", 0, 0.9, 0, { css: "#d9541c", w: 0.3 });
    reg(hits, luteTool, "luting-tool");
    const spareRack = rackFrame(g, 2.7, -2.1, { ry: -0.6, h: 1.2 });
    for (let i = 0; i < 2; i++) rackUnit(spareRack, 0.3 + i * 0.34, ["LUTING MIX", "DOOR GASKET"][i], { css: "#d9541c" });
    for (const [x, z] of [[-2.9, 2.3], [2.9, -1.3]]) cone(g, x, z);
    barrierPanel(g, 0, 2.7, { ry: 1.57, color: 0xf0b323 });
    const heatShimmer = particles(g, 26, 0xffb066, { size: 0.05, life: 0.5, additive: true, opacity: 0.35 });
    heatShimmer.position.set(0, 1.6, -1.4);

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.4, -0.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "ppe-donning") {
          suit.material = mat(0xd9541c, { emissive: 0x2a1408, ei: 0.3, rough: 0.5 });
          visor.rotation.x = -0.9;
        }
        if (step.id === "lute-door-seal") { seal.material = mat(0x59c97b, { emissive: 0x2f7d4a, ei: 0.6, rough: 0.5 }); sealFumes.visible = false; }
        if (step.id === "check-door-latch") { latch.rotation.z = Math.PI; }
        if (step.id === "larry-charge") { larry.userData.charged = true; }
        if (step.id === "cooldown-rest") { /* rested */ }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "buddy-distress") { alertBtn.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.2, rough: 0.4 }); buddy.rotation.y += 0.4; }
        if (it.id === "larry-approaches") { larry.position.x -= 1.2; hornBell.material = mat(0xffb066, { emissive: 0xff8a00, ei: 1.5, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "buddy-distress") { alertBtn.material = mat(0xd2312b, { rough: 0.4 }); }
        if (it.id === "larry-approaches") { larry.position.x += 1.2; hornBell.material = mat(0xb9bec4, { rough: 0.4, metal: 0.6 }); }
      },
      animate(t, dt, session) {
        void dt;
        sealFumes.visible = sealFumes.material ? true : true;
        sealFumes.userData.step?.(0.016, new THREE.Vector3(0, 1.94, -1.5), 0.1, 0.2, 0.4);
        heatShimmer.userData.step?.(0.016, new THREE.Vector3(0, 1.6, -1.4), 0.3, 0.3, 0.6);
        const step = session?.step;
        if (step?.id === "larry-charge" && session.track) larry.position.x = 0.5 - session.track.v * 1.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "heat-strain-check") {
          repaint(monitor.userData.screen, signFace(gg.t > 0.55 ? "ELEVATED" : gg.t < 0.2 ? "LOW" : "IN BAND", { bg: "#1a1208", accent: gg.t > 0.55 ? "#f0645b" : "#59c97b", fg: "#f6ead6", scale: 0.45 }));
        }
        void leverArm; void t;
      },
    };
  },
};
