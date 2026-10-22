import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, lockTag, pipeRun, equipmentCabinet, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ammonia Plant VR — Building Systems & Facilities, station six.
// A detection alarm on the ice plant of an arena, and a compressor shaft seal
// that has to come apart to fix it. The thing that makes an ammonia machinery
// room its own discipline is that almost every control is outside the room:
// the ventilation switch, the emergency stop, the detector readout and the
// decision to go in at all are all made at a panel on the outside wall, by
// somebody who is not yet breathing what is in there.
//
// Two pieces of physics the room turns on. Ammonia vapour is lighter than air
// — 17 against 29 — so a small warm release rises. A big cold release does
// not: liquid flashing off at minus thirty carries enough entrained droplets
// and chilled air to make a dense white fog that runs along the floor, and
// that fog is where the concentration is. And ammonia is enormously soluble
// in water, which is why a hose looks like the answer and is not: water
// played straight onto liquid ammonia feeds it the heat it needs to boil, and
// turns a pool into a cloud and a contained spill into contaminated runoff.

const NH3_ACCENT = 0x38bdf8;

export const SIM_AMMONIA_PLANT = {
  id: "ammonia-plant",
  index: "60",
  domain: "Facilities",
  trade: "Industrial refrigeration operator / refrigeration fitter",
  category: "Building Systems & Facilities",
  weather: "overcast",
  certification: "RETA CARO / CIRO industrial refrigeration operator; UA refrigeration service technicians and IUOE stationary engineers; IIAR 6 inspection, testing and maintenance and IIAR 2 machinery-room provisions; ASHRAE 15 refrigeration machinery rooms; OSHA 29 CFR 1910.119 process safety management where the charge is 10,000 lb or more; 1910.147 lockout/tagout; 1910.134 respiratory protection",
  name: "Ammonia Plant",
  title: simTitle("Ammonia Plant"),
  tagline: "Detection alarm on an arena ice plant: everything decided at the outside panel first, entry on air, circuit pumped down and locked, seal changed, discharge open before suction on the way back",
  accent: NH3_ACCENT,
  accentCss: "#38bdf8",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "room-held", name: "Room Held", note: "An ammonia alarm worked from the outside in: ventilation first, entry on air, circuit pumped down and returned in the right order" },

  game: system({
    name: "Refrigeration Authority",
    currency: "PSIG",
    ranks: ["Plant Attendant", "Refrigeration Operator", "Lead Operator", "Chief Engineer", "Refrigeration Authority Certified"],
    badges: [
      { id: "outside-first", name: "Outside First", note: "Ventilation started and the room read from the emergency control station before the door was touched", test: AWARD.stepClean("vent") },
      { id: "no-water", name: "No Water On It", note: "Never played a hose onto liquid ammonia, never propped the door, never entered an alarmed room without air", test: AWARD.safe },
      { id: "stopped-short", name: "Stopped Short Of Vacuum", note: "Pumped the low side down and stopped above atmospheric", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-plant", name: "Clean Plant", note: "No corrections through the whole callout", test: AWARD.clean },
      { id: "held-the-rate", name: "Held The Rate", note: "Held the pump-down rate steady the whole way", test: AWARD.unbroken },
      { id: "ice-back", name: "Ice Back On", note: "Plant back on line inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "water-hose": "You pulled the hose to wash the leak down. Ammonia dissolves in water almost without limit, which is exactly the trap: water played onto liquid ammonia hands it the heat it needs to boil, so the pool you were trying to knock down leaves as vapour instead, and what is left is a large volume of contaminated water that is now somebody else's problem downstream. Water goes on people, or into a fog curtain a trained crew sets up. It does not go on the liquid.",
    "prop-door": "You wedged the machinery room door open. That door is self-closing and tight-fitting because the room is designed to hold what is in it and vent it to one known place. Propped, the room's ventilation pulls from the corridor instead, and the corridor is where everybody leaves by.",
    "no-scba": "You went into an alarmed machinery room without air. Ammonia gives you plenty of warning — you will smell it far below the level that hurts you, which is the one mercy of the stuff — but a release big enough to put the detector into high alarm is far past warning, and at that concentration one breath closes your airway.",
    "vacuum-pull": "You kept pumping after the gauge reached atmospheric. Below that, the low side draws air and moisture in through every fitting that was only ever sealed against pressure from the inside. The water makes the system corrosive and the air is a non-condensable that never leaves until somebody purges it — and in a room full of ammonia, air in the system is the other half of a flammable mixture.",
  },

  lateNotes: {
    "machine-room-door": "The door opens after the ventilation has been running and after you are on air, not before.",
    "shaft-seal": "The seal comes apart after the compressor is valved in, pumped down and locked out — not on a circuit that is still holding charge.",
    "king-valve": "The king valve closes after the room has been entered and the source found, so you know which circuit you are pumping down.",
  },

  // Interruptions: see shared/game.js. Both are things that happen behind the
  // operator while their attention is on a gauge, which is when they happen
  // in a real plant room too.
  interrupts: [
    {
      id: "head-pressure",
      kind: "Condenser tripped",
      after: "pumpdown", delay: 4, seconds: 13,
      alert: "The discharge pressure is climbing fast and the condenser fans have gone quiet. The high-pressure cut-out is about to take the machine out from under you.",
      cue: "Something upstairs has stopped. The compressor cannot push into a condenser that is not rejecting heat.",
      target: "condenser-switch",
      why: "A pump-down is the compressor moving the whole low-side charge into the high side, so the condenser is doing more work than usual, not less. Lose the fans and head pressure runs away in under a minute — the relief lifts, and a relief lifting vents your charge to the roof instead of into the receiver where you were putting it.",
      missNote: "The high-pressure cut-out tripped the machine mid-pump-down, which leaves the circuit half evacuated and the liquid line still holding, and now the job restarts from a system in a state nobody planned for.",
      wrongNote: "That is not what stopped. The fans are on the condenser switch, and head pressure is not waiting.",
    },
    {
      id: "door-propped",
      kind: "Containment broken",
      after: "locate", delay: 4, seconds: 12,
      alert: "Somebody has wedged the machinery room door open behind you to run a cable in from the corridor.",
      cue: "The room is not holding what is in it any more.",
      target: "machine-room-door",
      why: "The room's emergency ventilation is drawn from a known path to a known discharge. Propped open, the room draws its make-up air from the corridor and pushes what it has back out the same way — so the one place in the building that was designed to contain an ammonia release is now venting into the route everybody else evacuates along.",
      missNote: "The door stayed wedged while you worked. The corridor detector went into alarm too, which is how the rest of the building found out they were sharing your release.",
      wrongNote: "It is the door. Everything else in this room depends on it being shut.",
    },
  ],

  steps: [
    {
      id: "alarm", kind: "select", target: "ecs-panel",
      title: "Read the alarm at the emergency control station",
      cue: "Take the alarm at the panel on the outside wall: which detector, which level, how long.",
      why: "The emergency control station is outside the machinery room on purpose, so every decision about the room is made by somebody who is not yet breathing what is in it. Which head and which set point is the difference between a seal weeping and a line letting go.",
    },
    {
      id: "vent", kind: "turn", target: "vent-switch",
      title: "Start emergency ventilation from outside",
      cue: "Turn the emergency ventilation switch at the panel to RUN before anything else happens.",
      why: "The ventilation runs before the door opens, not after, so the room is already moving air to its own discharge by the time there is a gap in the wall. Started from outside because the switch you would have to walk in to reach is a switch you would have to walk into the release to reach.",
      turn: { turns: 0.25, axis: "z", label: "EMERGENCY VENTILATION" },
    },
    {
      id: "barrier", kind: "drag", target: "entry-barrier",
      title: "Close the approach off",
      cue: "Carry the barrier across the corridor approach so nobody walks up behind you.",
      why: "A machinery room with a live alarm has one person going towards it and everybody else going away. The barrier is what stops the third party — the caterer, the ice crew, the contractor with a cable — from arriving at the open door while you are inside it.",
      drag: { to: "corridor-socket", radius: 0.45, missNote: "Not across the approach — a barrier off to one side is a barrier people walk past." },
    },
    {
      id: "muster", kind: "select", target: "muster-board",
      title: "Account for everybody",
      cue: "Check the board: who is signed into the plant and who is out.",
      why: "The room is the only place in the building the release can be, so the only question that matters is whether anyone is in it. That is answered off the board before entry, because the answer changes the job from a repair into a rescue.",
    },
    {
      id: "detect", kind: "gauge", target: "detector-readout",
      title: "Read the room concentration",
      cue: "Take the reading off the detection panel and commit on it.",
      why: "The number decides the protection. Ammonia announces itself long before it hurts you, so a reading in the low hundreds is a leak to be worked; a reading in the thousands is a room nobody enters to do maintenance, on air or otherwise, until the ventilation has pulled it down.",
      gauge: {
        label: "ROOM NH3", speed: 0.7, green: [0.12, 0.34],
        readout: (t) => `${Math.round(t * 2400)} ppm`,
        missNote: "That is not a room you go into to change a seal. Let the ventilation run it down and read it again.",
      },
    },
    {
      id: "ppe", kind: "sequence",
      targets: ["scba-set", "ammonia-suit", "nh3-gloves"],
      itemNames: { "scba-set": "SCBA on air", "ammonia-suit": "ammonia-rated suit", "nh3-gloves": "gauntlets and face shield" },
      title: "Dress for the room",
      cue: "Air first, suit over it, gauntlets and shield last.",
      why: "Air first because the pack is what you are protecting; the suit goes over it so nothing can snag the harness. The gauntlets are for liquid, not vapour — anhydrous ammonia takes the water out of skin on contact, and the burn it leaves is a cold burn that keeps going.",
    },
    {
      id: "entry", kind: "select", target: "machine-room-door",
      title: "Enter with the ventilation running",
      cue: "Open the door, go in, and let it close itself behind you.",
      why: "It closes behind you because it is meant to. Nothing about the entry defeats the room's containment, and the way back out is a door handle, not a wedge.",
    },
    {
      id: "locate", kind: "find", noHint: true,
      targets: ["seal-leak", "frost-line", "oil-pool"],
      itemNames: { "seal-leak": "the weeping shaft seal", "frost-line": "the frosted suction line", "oil-pool": "oil under the compressor" },
      itemNotes: {
        "seal-leak": "The shaft seal on number two is weeping — a thin white plume at the coupling end, right where the shaft leaves the housing.",
        "frost-line": "The suction line is frosted well past where the insulation ends, which says the machine is pulling liquid back rather than vapour.",
        "oil-pool": "There is oil under the compressor. Ammonia carries oil around with it, so oil on the floor is refrigerant that has been leaving for a while.",
      },
      title: "Find the leak and what it is telling you",
      cue: "Walk the machine and click what the room is showing you, without touching any of it.",
      why: "The seal is the leak, but the frost line and the oil are the reason the seal went: a machine flooding back has been running wet, and a wet machine washes the oil film off the seal faces. Fix the seal only and you change it again next month.",
    },
    {
      id: "king-valve", kind: "turn", target: "king-valve",
      title: "Close the king valve",
      cue: "Close the liquid outlet at the receiver, all the way over.",
      why: "The king valve is the top of the circuit you are about to empty: shut it and the receiver stops feeding the low side, so everything the compressor pulls out has somewhere to go and nothing comes back. A valve left part-closed is a valve still feeding it.",
      turn: { turns: 0.5, axis: "y", label: "KING VALVE" },
    },
    {
      id: "pumpdown", kind: "track", target: "suction-control", seconds: 7,
      title: "Pump the low side down",
      cue: "Run the machine down and hold the pull-down rate steady in the band.",
      why: "Steady, because a pump-down that is rushed drags liquid and oil back through a machine that is already damaged, and one that is too slow leaves the room breathing the leak for longer than it has to. The rate is the one thing the operator controls here.",
      track: {
        start: 0.08, green: [0.36, 0.56], rise: 0.55, fall: 0.5, drift: 0.12, label: "PULL-DOWN RATE",
        readout: (v) => (v < 0.36 ? "barely moving" : v > 0.56 ? "dragging liquid back" : "steady pull-down"),
      },
      holdBreakNote: "Pull-down rate out of band — too slow and the room keeps breathing it, too fast and you are pulling liquid through a sick machine. Bring it back and hold.",
    },
    {
      id: "pressure", kind: "gauge", target: "suction-gauge",
      title: "Stop above atmospheric",
      cue: "Watch the suction gauge and commit at the pressure you stop the machine.",
      why: "Slightly positive, never into vacuum. A system left above atmospheric leaks outward if it leaks at all; one pulled into vacuum draws air and moisture in through every joint, and neither of those comes back out without a purge.",
      gauge: {
        label: "SUCTION", speed: 0.7, green: [0.52, 0.68],
        readout: (t) => `${(t * 10 - 3).toFixed(1)} psig`,
        missNote: "Stopped too late or too early — below zero psig you are drawing air in, and well above it you have left a low side still full of charge to open.",
      },
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["suction-stop", "discharge-stop", "compressor-disconnect"],
      itemNames: { "suction-stop": "suction stop valve", "discharge-stop": "discharge stop valve", "compressor-disconnect": "motor disconnect" },
      title: "Valve the machine in, then kill the power",
      cue: "Suction stop closed, discharge stop closed, then open the motor disconnect.",
      why: "The valves come first so the machine is a sealed box before it is a dead box: close the electrics first and you are working the valves on a machine that a control call could still try to start. Suction before discharge, so what little charge is left is pushed forward rather than trapped behind you.",
      outOfOrderNote: "Wrong order — suction stop, then discharge stop, then the disconnect. The machine is valved in before it is electrically isolated.",
    },
    {
      id: "lock", kind: "select", target: "lockout-hasp",
      title: "Lock the disconnect",
      cue: "Your padlock and your tag on the motor disconnect.",
      why: "Your lock, your name. An ice plant runs on automatic controls and a building management system that has no idea your hands are inside a compressor — the lock is the only thing in the room that outranks a call for cooling.",
    },
    {
      id: "seal", kind: "select", target: "shaft-seal",
      title: "Change the shaft seal",
      cue: "Pull the seal, check the shaft and the faces, and fit the new one.",
      why: "The faces come out together and go back together: a new seal on a scored shaft sleeve is a new leak on a slower timer. What the shaft looks like under the old seal is the evidence for whether the flooding back has been going on longer than this callout.",
    },
    {
      id: "restore", kind: "sequence",
      targets: ["lockout-hasp", "discharge-stop", "suction-stop", "king-valve"],
      itemNames: {
        "lockout-hasp": "your lock off the disconnect", "discharge-stop": "discharge stop open",
        "suction-stop": "suction stop open", "king-valve": "king valve open",
      },
      title: "Return it in the right order",
      cue: "Your lock off, discharge open, then suction, then the king valve.",
      why: "Discharge before suction, always: a compressor started against a closed discharge stop has nowhere to put what it is moving, and it finds out in about a second. The lock comes off first because nothing gets opened while your lock is still on it, and the king valve last because that is what puts liquid back into a circuit you want proven tight first.",
      outOfOrderNote: "Wrong order — lock off, discharge, suction, king valve. The discharge is never the one still shut when the machine turns.",
    },
    {
      id: "walk", kind: "find",
      targets: ["relief-vent", "detector-head", "eyewash"],
      itemNames: { "relief-vent": "relief vent line", "detector-head": "detector head", "eyewash": "eyewash and drench shower" },
      itemNotes: {
        "relief-vent": "The relief vent line discharges to the roof and its outlet is clear. If it were not, the room's last line of defence would be a relief valve venting into the room it is protecting.",
        "detector-head": "The detector head is where the vapour goes, up near the ceiling over the machines. A head in the wrong place is a room with no detection and a green light saying otherwise.",
        "eyewash": "The drench shower outside the door still runs. Fifteen minutes of water is the only first aid there is for an ammonia splash, and it has to be water that is already there.",
      },
      title: "Walk the room before you sign it off",
      cue: "Click the three things you check on the way out.",
      why: "The three things that will not be there when they are needed unless somebody looked today: somewhere for the relief to go, something to notice the next leak, and water for the person who is standing in it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, NH3_ACCENT);

    // ------------------------------------------------- the machinery room shell
    // Back wall of the plant room with the door in it, and the emergency
    // control station on the OUTSIDE of that wall, which is the whole point of
    // the first four steps.
    const wall = group(g, 0, 0, -2.5);
    box(wall, 5.2, 2.9, 0.16, 0, 1.45, 0, 0x7c848c, { rough: 0.9, finish: "painted", tile: [5, 3] });
    box(wall, 5.2, 0.18, 0.3, 0, 2.98, 0, 0x5d656d, { rough: 0.85, finish: "concrete" });
    const doorPivot = group(wall, -1.05, 0, 0.1);
    const door = box(doorPivot, 1.0, 2.1, 0.07, 0.5, 1.05, 0, 0x3f4a54, { rough: 0.6, metal: 0.35, finish: "painted" });
    cyl(doorPivot, 0.02, 0.02, 0.16, 0.92, 1.05, 0.06, CITY.steel, { rough: 0.35, metal: 0.9, seg: 10 })
      .rotation.z = Math.PI / 2;
    decal(doorPivot, 0.42, 0.3, 0.5, 1.6, 0.04,
      signFace("MACHINERY ROOM\nAMMONIA", { bg: "#0b2a38", accent: "#38bdf8", fg: "#d6f2ff", scale: 0.26 }));
    holoTag(wall, "Machinery room — self-closing door", -0.55, 2.42, 0.2, { css: "#38bdf8", w: 0.58 });
    reg(hits, door, "machine-room-door");

    // Emergency control station: detection readout, ventilation switch, stop.
    const ecs = equipmentCabinet(g, 0.62, 1.2, 0.26, 1.35, -2.28, { ry: 0, color: 0xf2a23b, metal: 0.4 });
    const ecsPanel = holoPanel(ecs, 0.5, 0.34, 0, 1.42, 0.15, (cx, w, h) => {
      cx.fillStyle = "#1a1206"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2a23b"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#ffd9a0";
      cx.fillText("EMERGENCY CONTROL STATION", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#ffe8c8";
      ["HEAD 2 — OVER COMPRESSORS", "HIGH ALARM 14:06", "VENTILATION — STOPPED", "REMOTE STOP — ARMED"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.16)));
    }, { accent: NH3_ACCENT });
    reg(hits, ecsPanel, "ecs-panel");
    const ventPivot = group(ecs, -0.16, 0.96, 0.15);
    box(ventPivot, 0.05, 0.17, 0.045, 0, 0.07, 0, CITY.hiVis, { rough: 0.5 });
    holoTag(ecs, "emergency ventilation", -0.16, 0.76, 0.2, { css: "#8fa9c4", w: 0.4 });
    reg(hits, ventPivot, "vent-switch");
    const detPanel = instrument(ecs, 0.17, 0.98, 0.16, { idle: "---- ppm", color: 0x2b3138, w: 0.2, d: 0.14 });
    holoTag(ecs, "detection readout", 0.17, 0.78, 0.2, { css: "#8fa9c4", w: 0.34 });
    reg(hits, detPanel, "detector-readout");

    // The trap: a hose reel right beside the door, exactly where somebody
    // reaching for the obvious thing would find it.
    const reel = group(g, 2.25, 0, -1.95, -0.4);
    torus(reel, 0.24, 0.05, 0, 0.9, 0, 0xd8232a, { rough: 0.6, seg: 10, seg2: 24 }).rotation.y = Math.PI / 2;
    cyl(reel, 0.03, 0.03, 0.9, 0, 0.45, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    box(reel, 0.06, 0.16, 0.06, 0, 0.9, 0.24, 0x1f2429, { rough: 0.7 });
    holoTag(g, "wash it down with the hose?", 2.25, 1.42, -1.95, { css: "#d2312b", w: 0.5 });
    reg(hits, reel, "water-hose");
    const wedge = box(g, 0.18, 0.1, 0.24, -0.35, 0.05, -2.05, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "wedge the door open?", -0.35, 0.5, -2.05, { css: "#d2312b", w: 0.42 });
    reg(hits, wedge, "prop-door");
    const dustMask = box(g, 0.16, 0.1, 0.07, -1.7, 0.92, 1.72, 0xdfe4e8, { rough: 0.85 });
    holoTag(g, "go in on a cartridge mask?", -1.7, 1.18, 1.72, { css: "#d2312b", w: 0.52 });
    reg(hits, dustMask, "no-scba");

    // ------------------------------------------------------------ the machines
    // Two reciprocating compressor packages on a housekeeping pad; number two
    // is the one with the seal.
    const pad = box(g, 3.0, 0.12, 1.3, -0.5, 0.06, -0.75, 0x6a737c, { rough: 0.95, finish: "concrete", tile: [3, 2] });
    void pad;
    const packs = [];
    for (let i = 0; i < 2; i++) {
      const p = group(g, -1.35 + i * 1.7, 0.12, -0.75);
      box(p, 1.25, 0.16, 0.9, 0, 0.08, 0, 0x2f3740, { rough: 0.7, metal: 0.4 });
      // Motor and compressor on a common base, coupled at the middle.
      cyl(p, 0.24, 0.24, 0.62, -0.32, 0.42, 0, i === 1 ? 0x2b6f8f : 0x37707c, { rough: 0.55, metal: 0.45, seg: 20, finish: "painted" })
        .rotation.z = Math.PI / 2;
      box(p, 0.46, 0.46, 0.66, 0.3, 0.42, 0, 0x37707c, { rough: 0.5, metal: 0.4, finish: "painted" });
      for (let c = 0; c < 3; c++) cyl(p, 0.07, 0.07, 0.16, 0.16 + c * 0.14, 0.72, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 12 });
      decal(p, 0.3, 0.1, 0.3, 0.42, 0.34, signFace(`COMP ${i + 1}`, { accent: "#38bdf8", scale: 0.55 }));
      packs.push(p);
    }
    holoTag(g, "Compressor 2 — shaft seal", 0.35, 1.12, -0.75, { css: "#38bdf8", w: 0.46 });

    // The weeping seal itself, at the coupling end of number two.
    const sealRing = torus(packs[1], 0.075, 0.018, 0.02, 0.42, 0, 0xc0c6cc, { rough: 0.3, metal: 0.85, seg: 10, seg2: 22 });
    sealRing.rotation.y = Math.PI / 2;
    reg(hits, sealRing, "seal-leak");
    reg(hits, sealRing, "shaft-seal");
    const plume = particles(g, 26, 0xe6f4ff, { size: 0.035, life: 1.0, additive: false, opacity: 0.3 });
    plume.position.set(0.37, 0.56, -0.75);

    // Frosted suction line running back past where the insulation stops, and
    // the oil that has been leaving with the refrigerant.
    pipeRun(g, [[-1.9, 0.72, -0.2], [0.9, 0.72, -0.2], [0.9, 0.72, -0.62]], 0.05, 0x4a5560,
      { rough: 0.6, metal: 0.5 });
    const frost = cyl(g, 0.058, 0.058, 1.1, -0.85, 0.72, -0.2, 0xdfeaf2, { rough: 0.85, seg: 14 });
    frost.rotation.z = Math.PI / 2;
    holoTag(g, "frosted past the lagging", -0.85, 1.0, -0.2, { css: "#8fa9c4", w: 0.44 });
    reg(hits, frost, "frost-line");
    const oil = box(g, 0.5, 0.008, 0.36, 0.35, 0.128, -0.3, 0x2b230f,
      { rough: 0.25, opacity: 0.8, transparent: true, cast: false });
    reg(hits, oil, "oil-pool");

    // ------------------------------------------------------------ the receiver
    const receiver = group(g, -2.25, 0, -0.9, 0.2);
    cyl(receiver, 0.3, 0.3, 1.9, 0, 0.62, 0, 0xc8ccd0, { rough: 0.45, metal: 0.55, seg: 22, finish: "painted" })
      .rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) box(receiver, 0.14, 0.62, 0.42, sx * 0.7, 0.31, 0, 0x4a5560, { rough: 0.7, metal: 0.4 });
    decal(receiver, 0.5, 0.14, 0, 0.92, 0.3, signFace("HP RECEIVER — NH3", { bg: "#0b2a38", accent: "#38bdf8", scale: 0.5 }));
    const kingValve = valveWheel(receiver, 0.5, 0.86, 0.22, { color: 0xd8232a, body: 0x2f6f4a, r: 0.14 });
    holoTag(receiver, "King valve", 0.5, 1.3, 0.22, { css: "#f0645b", w: 0.26 });
    reg(hits, kingValve.userData.wheel, "king-valve");
    const reliefVent = cyl(receiver, 0.035, 0.035, 2.6, -0.45, 2.0, 0, 0x9aa4ad, { rough: 0.5, metal: 0.7, seg: 12 });
    holoTag(receiver, "Relief vent to roof", -0.45, 3.4, 0, { css: "#8fa9c4", w: 0.38 });
    reg(hits, reliefVent, "relief-vent");

    // ------------------------------------------------- suction control + gauges
    const skid = group(g, 0.95, 0, 0.35, -0.5);
    box(skid, 0.56, 1.05, 0.3, 0, 0.53, 0, 0x3c454e, { rough: 0.6, metal: 0.4 });
    const suctionLever = group(skid, 0, 0.92, 0.16);
    box(suctionLever, 0.05, 0.2, 0.045, 0, 0.09, 0, CITY.hiVis, { rough: 0.5 });
    holoTag(skid, "suction / pull-down", 0, 0.7, 0.2, { css: "#8fa9c4", w: 0.38 });
    reg(hits, suctionLever, "suction-control");
    const suctionGauge = instrument(skid, 0, 1.12, 0.02, { idle: "-- psig", color: 0x2b3138, w: 0.18, d: 0.16 });
    holoTag(skid, "suction gauge", 0, 1.3, 0.02, { css: "#8fa9c4", w: 0.3 });
    reg(hits, suctionGauge, "suction-gauge");
    const deepPull = box(skid, 0.22, 0.22, 0.22, 0.34, 0.9, 0.16, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(skid, "keep pulling into vacuum?", 0.34, 0.66, 0.2, { css: "#d2312b", w: 0.48 });
    reg(hits, deepPull, "vacuum-pull");

    // Stop valves on the machine, and the motor disconnect beside it.
    const suctionStop = valveWheel(g, -0.25, 0.58, -0.28, { color: 0x1f7ae0, body: 0x2f3740, r: 0.1 });
    holoTag(g, "Suction stop", -0.25, 0.98, -0.28, { css: "#8fa9c4", w: 0.26 });
    reg(hits, suctionStop.userData.wheel, "suction-stop");
    const dischargeStop = valveWheel(g, 0.95, 0.58, -0.28, { color: 0xd8232a, body: 0x2f3740, r: 0.1 });
    holoTag(g, "Discharge stop", 0.95, 0.98, -0.28, { css: "#8fa9c4", w: 0.3 });
    reg(hits, dischargeStop.userData.wheel, "discharge-stop");
    const discBox = group(g, 1.75, 0, -0.95, -0.5);
    box(discBox, 0.34, 0.46, 0.2, 0, 1.25, 0, 0x545e67, { rough: 0.5, metal: 0.5 });
    cyl(discBox, 0.03, 0.035, 1.05, 0, 0.52, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    const discHandle = group(discBox, 0.13, 1.25, 0.11);
    box(discHandle, 0.04, 0.15, 0.035, 0, 0.06, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(discBox, "Motor disconnect", 0, 1.58, 0.14, { css: "#8fa9c4", w: 0.34 });
    reg(hits, discHandle, "compressor-disconnect");
    const hasp = lockTag(discBox, -0.11, 1.18, 0.12, {});
    reg(hits, hasp, "lockout-hasp");

    // ------------------------------------------- roof slab and the condenser on it
    // The condenser sits on the machinery-room roof, which is also what the
    // relief vent line discharges above and what the detector head hangs from.
    // Without the slab it read as a white box floating over the yard.
    const roof = group(g, 0, 2.98, -2.0);
    box(roof, 5.2, 0.14, 1.25, 0, 0.07, 0, 0x6a737c, { rough: 0.95, finish: "concrete", tile: [5, 1] });
    box(roof, 5.2, 0.22, 0.1, 0, 0.24, 0.62, 0x5d656d, { rough: 0.9, finish: "concrete" });
    for (const sx of [-1, 1]) {
      cyl(roof, 0.05, 0.05, 2.98, sx * 2.35, -1.49, 0.55, CITY.darkSteel, { rough: 0.6, metal: 0.55, seg: 10 });
    }

    const condenser = group(g, -1.5, 0, -2.3, 0.1);
    box(condenser, 1.5, 0.5, 0.8, 0, 3.4, 0, 0x5a646d, { rough: 0.7, metal: 0.45, finish: "galvanised", tile: [2, 1] });
    const fans = [];
    for (const sx of [-1, 1]) {
      const fan = group(condenser, sx * 0.36, 3.68, 0);
      torus(fan, 0.2, 0.025, 0, 0, 0, 0x3c454e, { rough: 0.6, seg: 8, seg2: 20 }).rotation.x = Math.PI / 2;
      for (let b = 0; b < 4; b++) {
        box(fan, 0.34, 0.012, 0.09, 0, 0, 0, 0x8f9aa4, { rough: 0.6 }).rotation.y = (b * Math.PI) / 4;
      }
      fans.push(fan);
    }
    holoTag(condenser, "Evaporative condenser", 0, 4.0, 0, { css: "#8fa9c4", w: 0.44 });
    const condSwitch = group(condenser, 1.15, 1.55, 0.62);
    box(condSwitch, 0.24, 0.32, 0.16, 0, 0, 0, 0x545e67, { rough: 0.5, metal: 0.5 });
    const condLamp = ball(condSwitch, 0.026, 0, 0.12, 0.09, 0x59c97b, { emissive: 0x59c97b, ei: 2.0 });
    cyl(condenser, 0.03, 0.035, 1.55, 1.15, 0.78, 0.62, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    holoTag(condSwitch, "Condenser control", 0, -0.3, 0.12, { css: "#8fa9c4", w: 0.34 });
    reg(hits, condSwitch, "condenser-switch");

    // ---------------------------------------------------------- outside the door
    // Muster board, barrier to carry across the approach, drench shower, PPE.
    const board = group(g, 2.5, 0, 0.5, -1.1);
    holoPanel(board, 0.72, 0.5, 0, 1.3, 0, (cx, w, h) => {
      cx.fillStyle = "#101c22"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#bff7d4";
      cx.fillText("PLANT SIGN-IN / MUSTER", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ec";
      ["OPERATOR — IN", "ICE CREW ×3 — OUT", "CONTRACTOR — OUT", "PLANT ROOM OCCUPANCY: 0"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { accent: 0x59c97b });
    cyl(board, 0.03, 0.035, 1.05, 0, 0.52, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    reg(hits, board, "muster-board");

    const barrier = barrierPanel(g, 2.35, 1.6, { color: 0xe4622a });
    holoTag(g, "Barrier — carry it across", 2.35, 1.2, 1.6, { css: "#f2894b", w: 0.46 });
    reg(hits, barrier, "entry-barrier");
    const corridorSocket = group(g, 0.55, 0, 1.85);
    for (let i = -2; i <= 2; i++) {
      box(corridorSocket, 0.26, 0.012, 0.06, i * 0.42, 0.008, 0, 0xe4622a, { emissive: 0xe4622a, ei: 0.5, cast: false });
    }
    holoTag(corridorSocket, "corridor approach", 0, 0.5, 0, { css: "#f2894b", w: 0.36 });
    hits["corridor-socket"] = corridorSocket;

    const shower = group(g, -2.45, 0, 1.15, 0.6);
    cyl(shower, 0.035, 0.04, 2.2, 0, 1.1, 0, 0x2f9e5c, { rough: 0.5, metal: 0.5, seg: 12 });
    cyl(shower, 0.24, 0.24, 0.05, 0, 2.16, 0.16, 0x2f9e5c, { rough: 0.5, seg: 18 });
    box(shower, 0.22, 0.14, 0.18, 0.14, 1.0, 0, 0x2f9e5c, { rough: 0.55 });
    holoTag(shower, "Drench shower + eyewash", 0, 2.45, 0, { css: "#59c97b", w: 0.48 });
    reg(hits, shower, "eyewash");

    const ppeRack = group(g, -1.95, 0, 1.75, 1.0);
    box(ppeRack, 0.62, 1.7, 0.28, 0, 0.85, 0, 0x2b2f34, { rough: 0.6 });
    const scba = box(ppeRack, 0.3, 0.44, 0.16, -0.14, 1.12, 0.18, 0x22272c, { rough: 0.6, metal: 0.4 });
    holoTag(ppeRack, "SCBA", -0.14, 0.82, 0.22, { css: "#8fa9c4", w: 0.18 });
    reg(hits, scba, "scba-set");
    const suit = box(ppeRack, 0.34, 0.8, 0.1, 0.16, 1.0, 0.18, 0x2f7d4a, { rough: 0.8 });
    holoTag(ppeRack, "ammonia suit", 0.16, 0.54, 0.22, { css: "#8fa9c4", w: 0.3 });
    reg(hits, suit, "ammonia-suit");
    const gloves = box(ppeRack, 0.22, 0.14, 0.1, 0, 0.36, 0.18, 0xf2c14b, { rough: 0.75 });
    holoTag(ppeRack, "gauntlets + shield", 0, 0.2, 0.22, { css: "#8fa9c4", w: 0.36 });
    reg(hits, gloves, "nh3-gloves");

    // Detector head up under the ceiling over the machines, which is where
    // ammonia vapour goes when it is warm enough to rise.
    const detHead = group(g, -0.5, 0, -1.9);
    cyl(detHead, 0.05, 0.05, 0.14, 0, 2.55, 0, 0xdfe4e8, { rough: 0.4, metal: 0.4, seg: 14 });
    ball(detHead, 0.035, 0, 2.45, 0, 0x38bdf8, { emissive: 0x38bdf8, ei: 1.6 });
    cyl(detHead, 0.012, 0.012, 0.35, 0, 2.8, 0, 0x9aa4ad, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(detHead, "Detector head", 0, 2.26, 0, { css: "#38bdf8", w: 0.3 });
    reg(hits, detHead, "detector-head");

    toolChest(g, -0.05, 1.7);

    // The operator who took the call, standing well back at the panel end.
    standingFigure(g, 1.95, 1.05, { ry: -2.2, cloth: 0x2b6f8f, helmet: 0xf2c14b });

    // -------------------------------------------------------------- live state
    let leaking = true, venting = false, fansOn = true, pumping = false;
    let doorOpen = false, propped = false;
    const cable = box(g, 0.05, 0.04, 1.6, -0.55, 0.06, -1.7, 0xf2c14b, { rough: 0.7, cast: false });
    cable.visible = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.4, -1.7),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "vent") {
          venting = true;
          repaint(ecsPanel.userData.face, signFace("VENTILATION RUNNING", {
            bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3,
          }));
        }
        if (step.id === "barrier") corridorSocket.children.forEach((c) => { c.material = mat(0xe4622a, { emissive: 0xe4622a, ei: 1.4, cast: false }); });
        if (step.id === "entry") { doorOpen = true; doorPivot.rotation.y = -1.1; }
        if (step.id === "king-valve") kingValve.userData.wheel.rotation.y += Math.PI;
        if (step.id === "pumpdown") pumping = false;
        if (step.id === "isolate") {
          suctionStop.userData.wheel.rotation.y += 1.6;
          dischargeStop.userData.wheel.rotation.y += 1.6;
          discHandle.rotation.z = -Math.PI / 2.2;
        }
        if (step.id === "seal") { leaking = false; plume.visible = false; }
        if (step.id === "restore") {
          discHandle.rotation.z = 0;
          suctionStop.userData.wheel.rotation.y -= 1.6;
          dischargeStop.userData.wheel.rotation.y -= 1.6;
          kingValve.userData.wheel.rotation.y -= Math.PI;
        }
      },

      // Both interruptions really happen in the room: the condenser fans stop
      // and their lamp goes red, and the door really swings open with a cable
      // through it. See tools/interrupt_react.mjs.
      onInterrupt(it) {
        if (it.id === "head-pressure") {
          fansOn = false;
          condLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.6, rough: 0.4 });
        }
        if (it.id === "door-propped") {
          propped = true; doorPivot.rotation.y = -1.25; cable.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "head-pressure") {
          fansOn = true;
          condLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0, rough: 0.4 });
        }
        if (it.id === "door-propped") {
          propped = false; cable.visible = false;
          doorPivot.rotation.y = doorOpen ? -1.1 : 0;
        }
      },

      onHazard(hitId) {
        // Playing water on it makes it worse, visibly: the pool boils off.
        if (hitId === "water-hose") leaking = true;
        if (hitId === "prop-door") { doorPivot.rotation.y = -1.25; }
      },

      animate(t, dt, session) {
        const step = session?.step;

        // The seal goes on weeping until it is changed, and the plume climbs
        // faster once the ventilation is moving air across the room.
        plume.visible = leaking;
        if (leaking) plume.userData.step(dt, new THREE.Vector3(venting ? 0.5 : 0.08, 0.55, 0.1), 0.05, 0.9, 0.45);

        for (const f of fans) if (fansOn) f.rotation.y += dt * 6;

        // The disconnect handle and the ventilation switch are turned live by
        // the player's drag — app.js drives their rotation from session.turn
        // while each turn step is active.

        pumping = step?.id === "pumpdown";
        if (pumping && session.track) {
          const p = Math.min(1, (session.holdFor ?? 0) / (step.seconds ?? 7));
          repaint(suctionGauge.userData.screen, signFace(`${(10 - p * 12).toFixed(1)}`, {
            bg: "#0d1c24", accent: session.track.v > 0.36 && session.track.v < 0.56 ? "#59c97b" : "#f0645b",
            fg: "#bfeaf7", scale: 0.55,
          }));
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "detect") {
          repaint(detPanel.userData.screen, signFace(`${Math.round(gg.t * 2400)}`, {
            bg: "#1c1408", accent: gg.t > 0.1 && gg.t < 0.36 ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && step?.id === "pressure") {
          repaint(suctionGauge.userData.screen, signFace(`${(gg.t * 10 - 3).toFixed(1)}`, {
            bg: "#0d1c24", accent: gg.t > 0.5 && gg.t < 0.7 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }

        // The door closes itself unless something is holding it.
        if (!propped && !doorOpen && doorPivot.rotation.y < 0) {
          doorPivot.rotation.y = Math.min(0, doorPivot.rotation.y + dt * 1.2);
        }
      },
    };
  },
};
