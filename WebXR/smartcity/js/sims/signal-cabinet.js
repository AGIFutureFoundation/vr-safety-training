import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, equipmentCabinet, toolChest, cone, barrierPanel,
  instrument, rackUnit, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Signal Cabinet VR — its own gamified system: Intersection Command.
// Traffic controller fault work: the intersection has to be made safe for the
// public before it can be made safe for the technician.

const CAB = 0x8a939b;

export const SIM_SIGNAL_CABINET = {
  id: "signal-cabinet",
  index: "02",
  domain: "Mobility",
  trade: "Traffic signal technician",
  category: "Mobility & Transit",
  weather: "rain",
  certification: "IBEW — IMSA Level II Traffic Signal Technician certified",
  name: "Signal Cabinet",
  title: simTitle("Signal Cabinet"),
  tagline: "Intersection work zone, controller fault diagnosis and conflict monitor integrity",
  accent: 0xf2c14b,
  accentCss: "#f2c14b",
  parSeconds: 215,
  badge: { id: "intersection-safe", name: "Intersection Safe", note: "Zone, flash, repair and restore with nothing defeated" },

  game: system({
    name: "Intersection Command",
    currency: "SIGNAL",
    ranks: ["Cabinet Trainee", "Signal Technician", "Intersection Tech", "Controller Lead", "Command Certified"],
    badges: [
      { id: "monitor-intact", name: "Monitor Intact", note: "Never touch the conflict monitor bypass", test: AWARD.safe },
      { id: "fault-finder", name: "Fault Finder", note: "Find all three cabinet faults with no misdiagnosis", test: AWARD.stepClean("diagnose") },
      { id: "timing-true", name: "Timing True", note: "Set clearance and conflict values near centre band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "zone-first", name: "Zone First", note: "Clean run with the work zone never skipped", test: AWARD.clean },
      { id: "peak-hour", name: "Peak Hour", note: "Back in service inside 80% of par", test: AWARD.fast(0.8) },
      { id: "ten-straight", name: "Ten Straight", note: "Ten correct actions without a correction", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "conflict-bypass": "That jumper defeats the conflict monitor. The monitor is the only thing that stops the controller showing green to crossing traffic at the same time. Defeating it is how intersections kill people.",
    "live-terminals": "You are across the 120 V field terminals with the cabinet live. Those feed the heads outside; the cabinet stays powered even in flash, which is exactly the kind of exposure NFPA 70E's electrical safe work practices are written to control.",
    "step-into-road": "You stepped into the running lane. Your work zone exists so you never have to — stay behind the cones and let traffic pass.",
    "ladder-unsecured": "That ladder is footed on a kerb, unsecured, beside a live lane. OSHA's ladder-use rules require it tied off or footed by a second person before anyone climbs it — signal heads get accessed from a properly set ladder or not at all.",
  },

  lateNotes: {
    "fault-loadswitch": "The rack comes apart after the intersection is in flash, not while it is running phases.",
    "cabinet-lock": "Nobody opens a controller cabinet before the traffic management centre knows and the zone is set.",
  },

  // Interruptions: see shared/game.js. A signal tech spends the whole job with
  // their head inside a cabinet and their back to a live lane, which is where
  // both of these arrive from.
  interrupts: [
    {
      id: "cone-down",
      kind: "Taper broken",
      after: "diagnose", delay: 4, seconds: 13,
      alert: "A truck came through the taper wide and put your lead cone down. The lane you closed is open again and your back is to it.",
      cue: "The zone is the only thing between you and the running lane.",
      target: "cone-a",
      why: "A taper is not decoration; it is the instruction that moves a driver out of the lane you are standing in, and it only works if it reads as a continuous line from far enough back to act on. Lose the cone at the head of it and approaching traffic meets the work zone as a surprise instead of a transition — and the first thing it meets is a technician with their head inside a cabinet. A work zone is not set once. It is watched and rebuilt the moment it changes, because the person it protects is the one person who cannot see it.",
      missNote: "The taper stayed broken for the rest of the fault-finding. Every vehicle on that approach came into the closed lane without ever being told to move over, and the only warning any of them got was the shape of a crew truck and a person standing in the road.",
      wrongNote: "That is not what a driver reads on the approach. The cone at the head of the taper is what moves them over, and it goes back up now.",
    },
    {
      id: "preempt-call",
      kind: "TMC on channel 4",
      after: "timing", delay: 4, seconds: 12,
      alert: "The centre is calling on channel 4. Dispatch is routing an ambulance through 5th and Canal in the next two minutes and they need to know where you are with this cabinet.",
      cue: "Their picture of this intersection is the one you gave them.",
      target: "radio",
      why: "An intersection in flash has no preemption to give. The centre can hold the ambulance, route it round, or let it come and warn the crew what it will find — but every one of those choices turns on a fact that exists nowhere except in the head of the technician standing in front of the rack. A call from the centre during a fault job is never left ringing, because not answering is itself a decision, made silently, on behalf of people who did not get a say in it.",
      missNote: "You let the call ring out while you finished setting the clearance interval. The centre made a routing decision for an emergency vehicle without knowing whether this intersection would be flashing or cycling when it arrived, and the thirty seconds it would have taken to tell them was time you had.",
      wrongNote: "That is not how you reach the centre. The radio is on the tailgate, and a call from the TMC during a fault job gets answered every time.",
    },
  ],

  steps: [
    {
      id: "notify", kind: "select", target: "radio",
      title: "Notify the traffic management centre",
      cue: "Call the TMC: intersection, fault, expected duration.",
      why: "The centre is watching this intersection remotely through the same detector loops you are about to work on. If they see it drop without warning, dispatch reads it as an outage rather than a scheduled repair and sends a second crew straight into the work zone you have not set up yet.",
    },
    {
      id: "zone", kind: "sequence", anyOrder: true,
      targets: ["sign-advance", "cone-a", "cone-b", "arrow-board"],
      itemNames: {
        "sign-advance": "advance warning sign", "cone-a": "taper cone",
        "cone-b": "buffer cone", "arrow-board": "arrow board",
      },
      title: "Set the work zone",
      cue: "Advance warning, taper cones and the arrow board — all four before you open anything.",
      why: "Traffic needs to be told what is happening far enough back to react to it, which is exactly what the temporary-traffic-control layouts in Part 6 of the MUTCD are built around. The advance sign gives a driver time to notice, the taper is what actually moves them over, and the buffer is what absorbs the one who does not.",
      outOfOrderNote: "The zone is incomplete — every device goes out before work starts.",
    },
    {
      id: "vest", kind: "select", target: "hi-vis",
      title: "High-visibility clothing",
      cue: "Put on the class 3 vest before you leave the vehicle.",
      why: "You are a pedestrian in a roadway with a controller cabinet between you and oncoming traffic. Conspicuity, the class-3 garment rated for this kind of exposure, is the only protection you have against a driver who is looking at their phone instead of the cones.",
    },
    {
      id: "open", kind: "select", target: "cabinet-lock",
      title: "Open the controller cabinet",
      cue: "Unlock and open the cabinet door.",
      why: "Now that the zone is up and the centre knows, the cabinet can come open — with the door swung out to put steel between you and the lane, not to make the rack easier to reach.",
    },
    {
      id: "flash", kind: "select", target: "flash-switch",
      title: "Put the intersection into flash",
      cue: "Throw the flash transfer switch before touching the rack.",
      why: "Flash puts the intersection into a known, fail-safe state every driver recognises on sight. Working a running controller means one wrong card pull changes a phase under a car that is already committed to the intersection at 50 km/h.",
    },
    {
      id: "diagnose", kind: "find", noHint: true,
      targets: ["fault-loadswitch", "fault-ground", "fault-detector"],
      itemNames: {
        "fault-loadswitch": "scorched load switch",
        "fault-ground": "corroded ground bond",
        "fault-detector": "loose detector loop terminal",
      },
      itemNotes: {
        "fault-loadswitch": "Contacts welded and the case discoloured — this is what dropped the phase.",
        "fault-ground": "A green-white bloom on the bond means the cabinet is not properly earthed; surge has nowhere to go.",
        "fault-detector": "A loop lead backed out of the terminal reads as no vehicle, so the phase never gets called.",
      },
      decoyNotes: {
        "healthy-switch": "That load switch is clean — no discolouration, no pitting. Leave serviceable parts in the rack.",
        "power-supply": "The supply is within tolerance and its indicator is steady. Swapping healthy parts is how you turn one fault into three.",
      },
      title: "Find the cabinet faults",
      cue: "Inspect the rack and terminals. Three things are wrong — the hints will not show you which.",
      why: "Fault-finding is looking, not swapping — an IBEW-trained signal tech reads the rack the way NECA apprenticeship training teaches it: scorching, corrosion and a backed-out conductor each tell you a different part of the story, and none of them is fixed by trading a healthy part for another healthy part.",
    },
    {
      id: "replace", kind: "select", target: "fault-loadswitch",
      title: "Replace the failed load switch",
      cue: "Pull the scorched switch and fit the replacement.",
      why: "A welded load switch can hold an output on regardless of what the controller commands it to do. Contacts that have arced together do not get reset back into service — they get replaced, because the next command they ignore could be the one that drops a conflicting phase.",
    },
    {
      id: "monitor", kind: "gauge", target: "monitor-unit",
      title: "Test the conflict monitor",
      cue: "Run the monitor self-test and confirm it trips at the right threshold.",
      why: "The malfunction monitoring unit watches for conflicting greens on the same intersection and forces the whole thing to flash the instant it sees one. Proving it trips inside its rated window, not just that it powers up, is the entire reason the intersection is allowed back in normal service today.",
      gauge: {
        label: "CONFLICT MONITOR — TRIP TEST", speed: 0.7, green: [0.5, 0.66],
        readout: (t) => `${(t * 1.2).toFixed(2)} s to trip`,
        missNote: "Outside the permitted trip window. A monitor that is slow to act is a monitor that lets a conflict reach the street.",
      },
    },
    {
      id: "timing", kind: "gauge", target: "controller-face",
      title: "Set the clearance interval",
      cue: "Set the yellow change interval for this approach speed.",
      why: "Clearance timing is calculated from this approach's posted speed and the intersection's width, not chosen by feel. Shave it to improve throughput and you build a dilemma zone: a band of distance where a driver can neither stop in time nor clear the box before opposing traffic gets its green.",
      gauge: {
        label: "YELLOW CHANGE INTERVAL", speed: 0.62, green: [0.42, 0.58],
        readout: (t) => `${(2 + t * 4).toFixed(1)} s`,
        missNote: "Off the calculated interval for this approach — too short traps drivers, too long invites red running.",
      },
    },
    {
      id: "restore", kind: "select", target: "flash-switch",
      title: "Return the intersection to normal",
      cue: "Take the intersection out of flash and watch a full cycle.",
      why: "You watch it cycle before you pack up, start to finish, phase by phase. A controller that comes back with the wrong phase order or a stuck call is your fault until you have personally seen it run a complete, correct cycle with your own eyes.",
    },
    {
      id: "clear", kind: "select", target: "arrow-board",
      title: "Recover the work zone",
      cue: "Pick the zone up in reverse order, arrow board last out of the lane.",
      why: "The zone comes down from the traffic side inward — arrow board last, not first — so at every point in the teardown you are never the first unprotected thing an approaching driver meets, the way you were on the way in.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.0, 0xf2c14b);

    // Kerb and a slice of roadway, so the station reads as street furniture.
    box(g, 4.4, 0.14, 1.3, 0.4, 0.07, 1.55, 0x3b4148, { rough: 0.95 });
    box(g, 4.4, 0.02, 0.12, 0.4, 0.15, 0.95, 0xd8dce0, { rough: 0.9, cast: false });
    for (let i = 0; i < 5; i++) {
      box(g, 0.5, 0.004, 0.1, -1.4 + i * 0.95, 0.145, 2.05, 0xe8dfae, { rough: 0.9, cast: false });
    }
    reg(hits, box(g, 4.2, 0.02, 0.7, 0.4, 0.16, 2.1, 0x2f3439, { rough: 0.95, cast: false }), "step-into-road");

    // ------------------------------------------------------- controller cabinet
    const cab = equipmentCabinet(g, 0.72, 1.5, 0.56, -0.75, -0.4, { ry: 0.18, color: CAB, metal: 0.55 });
    cab.userData.door.rotation.y = 1.35;
    decal(cab, 0.3, 0.08, 0, 1.66, 0.29, signFace("TS2 · INT 118", { accent: "#f2c14b", scale: 0.55 }));
    holoTag(cab, "Controller cabinet", 0, 1.86, 0.1, { css: "#f2c14b", w: 0.36 });
    const lockBody = box(cab, 0.05, 0.07, 0.04, 0.3, 0.9, 0.3, CITY.steel, { rough: 0.3, metal: 0.9 });
    reg(hits, lockBody, "cabinet-lock");

    // Rack inside the cabinet.
    const rack = group(cab, 0, 0.09, 0.06);
    box(rack, 0.62, 1.4, 0.04, 0, 0.75, -0.2, 0x191f24, { rough: 0.9 });
    const controllerFace = decal(rack, 0.5, 0.22, 0, 1.28, 0.03,
      signFace("PHASE 2 · GREEN\nCYCLE 96 s", { bg: "#101a12", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }),
      { glow: true, ei: 0.9, px: 448 });
    reg(hits, controllerFace, "controller-face");

    // Load switch bank — one scorched, one healthy, plus the monitor and supply.
    const bank = group(rack, 0, 0.92, 0.02);
    const scorched = group(bank, -0.17, 0, 0);
    box(scorched, 0.11, 0.2, 0.11, 0, 0, 0, 0x4a3a30, { rough: 0.75 });
    box(scorched, 0.09, 0.05, 0.02, 0, 0.06, 0.06, 0x2a1c14, { rough: 0.9 });
    ball(scorched, 0.009, 0, -0.06, 0.06, 0xf0645b, { emissive: 0xf0645b, ei: 2.2 });
    decal(scorched, 0.08, 0.03, 0, -0.11, 0.06, signFace("LS-2", { scale: 0.6, accent: "#f0645b" }));
    reg(hits, scorched, "fault-loadswitch");

    const healthy = group(bank, 0.0, 0, 0);
    box(healthy, 0.11, 0.2, 0.11, 0, 0, 0, 0x2b3138, { rough: 0.6 });
    ball(healthy, 0.009, 0, -0.06, 0.06, CITY.good, { emissive: CITY.good, ei: 2.2 });
    decal(healthy, 0.08, 0.03, 0, -0.11, 0.06, signFace("LS-4", { scale: 0.6, accent: "#59c97b" }));
    reg(hits, healthy, "healthy-switch");

    const replacement = group(bank, -0.17, 0, 0);
    box(replacement, 0.11, 0.2, 0.11, 0, 0, 0, 0x2b3138, { rough: 0.6 });
    ball(replacement, 0.009, 0, -0.06, 0.06, CITY.good, { emissive: CITY.good, ei: 2.2 });
    replacement.visible = false;

    const monitor = group(bank, 0.19, 0, 0);
    box(monitor, 0.13, 0.22, 0.11, 0, 0, 0, 0x22303c, { rough: 0.5 });
    const monitorFace = decal(monitor, 0.1, 0.07, 0, 0.05, 0.06,
      signFace("MMU", { bg: "#0d1c24", accent: "#4fd1ff", scale: 0.6 }), { glow: true, ei: 0.8 });
    for (let i = 0; i < 3; i++) {
      ball(monitor, 0.007, -0.03 + i * 0.03, -0.05, 0.06, [CITY.good, CITY.hiVis, CITY.alert][i],
        { emissive: [CITY.good, CITY.hiVis, CITY.alert][i], ei: 1.6 });
    }
    holoTag(monitor, "Conflict monitor", 0, 0.17, 0.06, { css: "#4fd1ff", w: 0.3 });
    reg(hits, monitor, "monitor-unit");

    const supply = group(bank, 0.36, 0, 0);
    box(supply, 0.09, 0.2, 0.11, 0, 0, 0, 0x2b3138, { rough: 0.6 });
    ball(supply, 0.008, 0, -0.06, 0.06, CITY.good, { emissive: CITY.good, ei: 2 });
    reg(hits, supply, "power-supply");

    // The monitor bypass jumper, hanging where a previous crew left it.
    const bypass = group(rack, 0.24, 0.66, 0.06);
    hose(bypass, [[0, 0, 0], [0.03, -0.07, 0.02], [0, -0.14, 0]], 0.005, 0xf0645b, { steps: 10 });
    for (const y of [0, -0.14]) box(bypass, 0.016, 0.012, 0.012, 0, y, 0, 0x22262b, { rough: 0.5 });
    holoTag(bypass, "Bypass jumper", 0.02, 0.08, 0.02, { css: "#f0645b", w: 0.26, h: 0.055 });
    reg(hits, bypass, "conflict-bypass");

    // Field terminal block — live even in flash.
    const terminals = group(rack, 0, 0.42, 0.03);
    box(terminals, 0.56, 0.1, 0.06, 0, 0, 0, 0x1b2026, { rough: 0.7 });
    for (let i = 0; i < 12; i++) {
      cyl(terminals, 0.008, 0.008, 0.03, -0.25 + i * 0.045, 0.02, 0.04, 0xb87333,
        { rough: 0.35, metal: 0.9, seg: 8 }).rotation.x = Math.PI / 2;
    }
    reg(hits, terminals, "live-terminals");

    // Corroded ground bond at the base of the cabinet.
    const bond = group(rack, -0.24, 0.14, 0.02);
    box(bond, 0.05, 0.05, 0.02, 0, 0, 0, 0x7f8b6a, { rough: 0.95 });
    hose(bond, [[0, 0, 0.01], [0.04, -0.07, 0.03], [0.02, -0.13, 0]], 0.008, 0x5f7a4a, { steps: 10, rough: 0.95 });
    reg(hits, bond, "fault-ground");

    // Detector loop terminals on the lower shelf, one backed out.
    const loops = group(rack, 0.14, 0.2, 0.02);
    box(loops, 0.22, 0.07, 0.06, 0, 0, 0, 0x1b2026, { rough: 0.7 });
    for (let i = 0; i < 4; i++) {
      const lead = cyl(loops, 0.005, 0.005, i === 2 ? 0.1 : 0.05, -0.075 + i * 0.05, 0.02, 0.04,
        i === 2 ? 0xf2c14b : 0x2b6f8c, { rough: 0.6, seg: 8 });
      lead.rotation.x = i === 2 ? Math.PI / 2.6 : Math.PI / 2;
    }
    reg(hits, loops, "fault-detector");

    // Flash transfer switch on the cabinet frame.
    const flash = group(cab, -0.26, 1.2, 0.3);
    box(flash, 0.1, 0.14, 0.04, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
    const flashLever = box(flash, 0.03, 0.08, 0.03, 0, -0.02, 0.03, 0xf0645b, { rough: 0.5 });
    decal(flash, 0.09, 0.03, 0, 0.055, 0.025, signFace("FLASH", { accent: "#f2c14b", scale: 0.6 }));
    reg(hits, flash, "flash-switch");

    // ------------------------------------------------------------ signal head
    const mast = group(g, 1.45, 0, -0.9);
    cyl(mast, 0.07, 0.09, 3.1, 0, 1.55, 0, 0x4d545b, { rough: 0.6, metal: 0.5, seg: 14 });
    cyl(mast, 0.2, 0.24, 0.12, 0, 0.06, 0, 0x3b4148, { rough: 0.7, seg: 16 });
    const arm = group(mast, 0, 3.0, 0);
    cyl(arm, 0.05, 0.05, 1.5, -0.75, 0, 0, 0x4d545b, { rough: 0.6, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    const headGroup = group(arm, -1.35, -0.32, 0);
    box(headGroup, 0.22, 0.62, 0.18, 0, 0, 0, 0x1f2429, { rough: 0.7 });
    const lamps = [];
    for (let i = 0; i < 3; i++) {
      const colour = [0xf0645b, 0xf2c14b, 0x59c97b][i];
      const lamp = ball(headGroup, 0.062, 0, 0.19 - i * 0.19, 0.09, colour,
        { emissive: colour, ei: i === 2 ? 2.4 : 0.15, rough: 0.4 });
      box(headGroup, 0.2, 0.03, 0.11, 0, 0.25 - i * 0.19, 0.12, 0x14171a, { rough: 0.8 });
      lamps.push(lamp);
    }
    holoTag(mast, "Approach 2", 0, 2.3, 0.1, { css: "#f2c14b", w: 0.26 });

    // Unsecured ladder leaning on the mast — the trap.
    const ladder = group(g, 1.9, 0, -0.2, -0.5);
    for (const sx of [-1, 1]) {
      const rail = cyl(ladder, 0.022, 0.022, 2.6, sx * 0.17, 1.25, 0, 0xc0c6cc, { rough: 0.4, metal: 0.7, seg: 8 });
      rail.rotation.x = 0.28;
    }
    for (let i = 0; i < 8; i++) {
      const rung = cyl(ladder, 0.014, 0.014, 0.34, 0, 0.25 + i * 0.3, -0.34 + i * 0.085, 0xc0c6cc,
        { rough: 0.4, metal: 0.7, seg: 8 });
      rung.rotation.z = Math.PI / 2;
    }
    reg(hits, ladder, "ladder-unsecured");

    // --------------------------------------------------------- work zone kit
    const coneA = cone(g, -1.55, 1.15);
    reg(hits, coneA, "cone-a");
    reg(hits, cone(g, -0.35, 1.7), "cone-b");

    const sign = group(g, -2.05, 0, 0.35, 0.7);
    cyl(sign, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x4d545b, { rough: 0.5, metal: 0.6, seg: 10 });
    const signFacePanel = decal(sign, 0.52, 0.52, 0, 1.35, 0.01, (ctx, w, h) => {
      ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "#f2a51e"; ctx.fillRect(-w * 0.33, -h * 0.33, w * 0.66, h * 0.66);
      ctx.strokeStyle = "#1b1e22"; ctx.lineWidth = 6;
      ctx.strokeRect(-w * 0.33, -h * 0.33, w * 0.66, h * 0.66);
      ctx.restore();
      ctx.fillStyle = "#1b1e22";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("SIGNAL", w / 2, h * 0.44);
      ctx.fillText("CREW", w / 2, h * 0.58);
    }, { px: 320, transparent: true });
    reg(hits, sign, "sign-advance");

    const arrowBoard = group(g, 0.9, 0, 1.75, 0.15);
    box(arrowBoard, 1.0, 0.55, 0.08, 0, 1.15, 0, 0x1b1e22, { rough: 0.6 });
    for (const sx of [-1, 1]) cyl(arrowBoard, 0.025, 0.03, 0.9, sx * 0.4, 0.45, 0, 0x4d545b, { rough: 0.5, metal: 0.6, seg: 10 });
    box(arrowBoard, 1.0, 0.06, 0.4, 0, 0.03, 0, 0x2b3138, { rough: 0.7 });
    const arrowLamps = [];
    for (let i = 0; i < 9; i++) {
      const lx = -0.36 + (i % 5) * 0.18;
      const ly = 1.15 + (i < 5 ? 0 : (i < 7 ? 0.14 : -0.14));
      const l = ball(arrowBoard, 0.026, lx, ly, 0.05, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.4, rough: 0.4 });
      arrowLamps.push(l);
    }
    holoTag(arrowBoard, "Arrow board", 0, 1.55, 0.05, { css: "#f2c14b", w: 0.3 });
    reg(hits, arrowBoard, "arrow-board");

    // Crew vehicle side: vest and radio on the tailgate.
    const chest = toolChest(g, -1.85, -1.2, { ry: 0.9, color: 0xf2a51e });
    const vest = group(chest, 0, 0.79, 0);
    box(vest, 0.3, 0.06, 0.22, 0, 0, 0, 0xf2c14b, { rough: 0.85 });
    for (const z of [-0.06, 0.06]) box(vest, 0.31, 0.02, 0.04, 0, 0.035, z, 0xdfe8ee, { rough: 0.5 });
    holoTag(vest, "Class 3 vest", 0, 0.2, 0, { css: "#f2c14b", w: 0.28 });
    reg(hits, vest, "hi-vis");

    const radio = group(chest, 0.18, 0.82, 0.1, -0.4);
    slab(radio, 0.07, 0.13, 0.04, 0, 0, 0, 0x22262b, { radius: 0.01, rough: 0.6 });
    cyl(radio, 0.005, 0.005, 0.14, 0.025, 0.12, 0, 0x14171a, { rough: 0.6, seg: 8 });
    const radioLamp = ball(radio, 0.007, -0.02, 0.06, 0.021, CITY.good, { emissive: CITY.good, ei: 2 });
    holoTag(radio, "TMC radio", 0, 0.2, 0, { css: "#f2c14b", w: 0.24 });
    reg(hits, radio, "radio");

    // Holographic intersection state board.
    const board = holoPanel(g, 0.6, 0.4, -1.9, 1.55, -1.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2c14b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("INTERSECTION 118 · 5TH & CANAL", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("PHASE 2 DROPPED — NO CALL", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Approach speed: 50 km/h", "Yellow change: 4.0 s calculated",
       "MMU trip window: 0.60 – 0.80 s", "Detector: loop 2B intermittent",
       "TMC contact: channel 4"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.8, accent: 0xf2c14b });

    let inFlash = false;
    let phase = 0;
    let phaseTimer = 0;

    return {
      hits,
      footprint: 2.0,

      // Both interruptions come from outside the cabinet, which is the point:
      // the cone goes over in the road behind them, and the radio lights up on
      // the tailgate. See the interrupts block above.
      onInterrupt(it) {
        if (it.id === "cone-down") { coneA.rotation.x = Math.PI / 2; coneA.position.set(-1.32, 0.14, 1.38); }
        if (it.id === "preempt-call") radioLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.8 });
      },

      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cone-down") { coneA.rotation.x = 0; coneA.position.set(-1.55, 0, 1.15); }
        if (it.id === "preempt-call") radioLamp.material = mat(CITY.good, { emissive: CITY.good, ei: 2 });
      },

      onStepComplete(step) {
        if (step.id === "zone") arrowLamps.forEach((l) => { l.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 2.4, rough: 0.4 }); });
        if (step.id === "open") cab.userData.door.rotation.y = 2.0;
        if (step.id === "flash" && !inFlash) {
          inFlash = true;
          flashLever.rotation.z = -0.9;
          repaint(controllerFace, signFace("FLASH MODE\nALL RED", {
            bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.26,
          }));
        } else if (step.id === "restore") {
          inFlash = false;
          flashLever.rotation.z = 0;
          repaint(controllerFace, signFace("NORMAL · CYCLE 96 s", {
            bg: "#101a12", accent: "#59c97b", fg: "#bff7d4", scale: 0.24,
          }));
        }
        if (step.id === "replace") { scorched.visible = false; replacement.visible = true; }
        if (step.id === "monitor") {
          repaint(monitorFace, signFace("PASS", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.6 }));
        }
        if (step.id === "clear") arrowLamps.forEach((l) => { l.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 0.3, rough: 0.4 }); });
      },

      animate(t, dt, session) {
        // The head actually runs: flashing red in flash, cycling otherwise.
        phaseTimer += dt;
        if (inFlash) {
          const on = Math.floor(t * 1.6) % 2 === 0;
          lamps[0].material.emissiveIntensity = on ? 2.6 : 0.1;
          lamps[1].material.emissiveIntensity = 0.1;
          lamps[2].material.emissiveIntensity = 0.1;
        } else {
          if (phaseTimer > 4) { phaseTimer = 0; phase = (phase + 1) % 3; }
          const order = [2, 1, 0];
          lamps.forEach((l, i) => { l.material.emissiveIntensity = i === order[phase] ? 2.4 : 0.12; });
        }
        arrowLamps.forEach((l, i) => {
          if (l.material.emissiveIntensity > 1) {
            l.material.emissiveIntensity = 1.6 + Math.sin(t * 6 - i * 0.5) * 1.0;
          }
        });

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "timing") {
          repaint(controllerFace, signFace(`YELLOW ${(2 + gg.t * 4).toFixed(1)} s`, {
            bg: "#101a12", accent: gg.t > 0.42 && gg.t < 0.58 ? "#59c97b" : "#f2c14b",
            fg: "#bff7d4", scale: 0.34,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "monitor") {
          repaint(monitorFace, signFace(`${(gg.t * 1.2).toFixed(2)}`, {
            bg: "#0d1c24", accent: gg.t > 0.5 && gg.t < 0.66 ? "#59c97b" : "#f2c14b", scale: 0.6,
          }));
        }
      },
    };
  },
};
