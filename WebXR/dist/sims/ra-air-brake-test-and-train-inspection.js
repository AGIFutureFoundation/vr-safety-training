import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, mat, particles,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, cone, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Air Brake Test & Train Inspection VR — Mobility & Transit.
//
// A cut of cars charged, tested and walked end to end before it goes
// anywhere: the reservoirs brought up to charge, a set called for and
// confirmed at every car by eye, the rigging and the wheels inspected car by
// car, a defect tagged the moment it is found, and the release confirmed the
// same way the set was. Generic freight territory; no railroad, milepost or
// timetable named.

const RA_ABT_ACCENT = 0xc0453f;
const RA_ABT_CSS = "#c0453f";

export const SIM_RA_AIR_BRAKE_TEST_AND_TRAIN_INSPECTION = {
  id: "ra-air-brake-test-and-train-inspection",
  index: "425",
  domain: "Track",
  trade: "Freight car inspector / carman",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "Carman qualification under FRA 49 CFR Part 232 brake system safety standards, working a cut protected by its own blue signal under FRA 49 CFR Part 214 before anyone goes between the cars, with the engineer's brake application called and confirmed over the radio the way a BLET-qualified engineer and a SMART-TD conductor both expect a car inspector to work a terminal test",
  name: "Air Brake Test & Train Inspection",
  title: simTitle("Air Brake Test & Train Inspection"),
  tagline: "The cut charged, a set called and confirmed car by car, the rigging and wheels walked end to end, a defect tagged the moment it is found, and the release confirmed the same way the set was — never a hand between the cars until the blue signal says so",
  accent: RA_ABT_ACCENT,
  accentCss: RA_ABT_CSS,
  parSeconds: 320,
  footprint: 2.4,
  supportLine: "your car foreman or your BMWED local if a close call between the cars is still sitting with you after shift",
  badge: { id: "test-sheet-clean", name: "Clean Test Sheet", note: "Every car set, confirmed, inspected and released with the blue signal up the whole time" },

  game: system({
    name: "Car Inspection Authority",
    currency: "BRAKE",
    ranks: ["Car Inspector Trainee", "Qualified Carman", "Lead Inspector", "Car Foreman", "Brake Test Certified"],
    badges: [
      { id: "never-between", name: "Never Between", note: "Never once between the cars without the blue signal up", test: AWARD.safe },
      { id: "gauge-true", name: "Gauge True", note: "Every gauge reading near band centre", test: AWARD.precise(0.72) },
      { id: "test-clean", name: "Clean Test", note: "Set and release steps worked with no correction", test: AWARD.all(AWARD.stepClean("call-set"), AWARD.stepClean("call-release")) },
    ],
    challenges: [
      { id: "yard-time", name: "Yard Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "first-test", name: "First Test", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ten-clear", name: "Ten Clear", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "between-cars-unprotected": "You went between the cars to check a hose before confirming the blue signal was up. A blue signal is the one thing that keeps this cut from being coupled to or moved while you are inside it, and going in ahead of it is trusting that nobody else is about to move equipment you have not actually protected yet.",
    "dragging-rigging": "You reached up under the car at a piece of brake rigging that is hanging loose. A rod or a lever that has dropped off its hanger is still connected to a system that can move the instant air is applied, and a hand near it when that happens is exactly the injury this inspection exists to prevent somewhere else on the railroad.",
    "hot-flat-wheel": "You touched the wheel with the flat spot. A wheel that has been sliding against the rail carries that heat in the tread long after the car has stopped, and a flat spot itself is a wheel that is going to hammer the rail everywhere it rolls until it is set out.",
    "fouling-adjacent-lead": "You stepped onto the adjacent track to get a look at the far side of a car. Your blue signal protects this cut, not the track next to it — that lead is still open to a movement running under its own authority.",
  },

  lateNotes: {
    "bad-order-tag": "The tag goes on once the defect is actually found and confirmed, not before.",
    "left-tool": "Nothing gets logged clear until the walk is actually done.",
  },

  interrupts: [
    {
      id: "unexpected-air",
      kind: "Air moving in the train line with a hand between the cars",
      after: "hose-check", delay: 4, seconds: 12,
      alert: "You hear the train line charge and the couplers take up slack. Somebody has put air to this cut while your hand is still on the hose between two cars.",
      cue: "That sound means air is moving, and your hand is exactly where a coupling shifts.",
      target: "blue-signal",
      why: "A blue signal is the one thing that is supposed to make this exact moment impossible, and the sound of air moving in a line you did not charge means somewhere that protection has failed — the first thing to check, with your hand still clear, is whether your own signal is still displayed and whoever put air to this cut simply did not see it, or whether it came down.",
      missNote: "You kept working with air already moving in the line. A train line charging shifts slack through every coupler in the cut at once, and a hand between two cars when that happens does not get a second chance to move first.",
      wrongNote: "That does not answer what just happened between the cars. Check your own blue signal first.",
    },
    {
      id: "coupling-attempt",
      kind: "Another crew moves to couple onto the cut",
      after: "rigging-walk", delay: 4, seconds: 11,
      alert: "A switch crew you have not talked to is backing a cut of cars toward this string to couple on.",
      cue: "Somebody is about to couple onto cars you are still inspecting.",
      target: "radio-handset",
      why: "This cut is out of service for the length of the test, but a crew working the yard has no way to know that unless the blue signal has actually been logged with whoever is dispatching moves in this yard — the radio is the fastest way to reach that crew directly and stop the move before it reaches the string you are standing beside.",
      missNote: "You kept inspecting while the other cut kept coming. A coupling impact runs down the whole string it lands on, through every car and every hand still on one of them, and nothing about the approaching crew's job told them anyone was there.",
      wrongNote: "That will not reach the crew that is moving. The radio is what stops a move commanded from somewhere else.",
    },
  ],

  steps: [
    {
      id: "briefing", kind: "select", target: "test-sheet-board",
      title: "Read the test sheet",
      cue: "Check the consist, the class of test required, and which cars are new to this cut.",
      why: "A brake test is scoped by how the consist changed since the last one — cars added since the last terminal test need a full test, and treating them like the rest of an already-tested cut skips exactly the inspection that would catch a car nobody has looked at yet.",
    },
    {
      id: "blue-check", kind: "select", target: "blue-signal",
      title: "Confirm the blue signal is up",
      cue: "Check that your own blue signal is displayed at the cut before you go anywhere near it.",
      why: "The blue signal is what keeps this cut from being coupled to or moved while the test is underway, and it has to be up and confirmed before the first hand goes between any two cars — checking it after starting the inspection is checking a fact that needed to be true first.",
    },
    {
      id: "charge", kind: "gauge", target: "brake-stand",
      title: "Charge the train line",
      cue: "Bring the train line up to charge and commit once the gauge reads full.",
      why: "Every test that follows depends on the reservoirs actually being at charge first — a piston travel or a release check run on a train line that never fully charged tells you nothing about how the brakes behave when they are.",
      gauge: {
        label: "TRAIN LINE", speed: 0.66, green: [0.82, 1.0],
        readout: (t) => `${Math.round(t * 90)} psi`,
        missNote: "Not fully charged. Give the line more time before calling for a set.",
      },
    },
    {
      id: "call-set", kind: "select", target: "radio-handset",
      title: "Call the engineer for a set",
      cue: "Radio the engineer and request a service application to test the brakes.",
      why: "The set is called over the radio, not assumed from a schedule, because the inspector walking the train and the engineer at the valve have to agree on the exact moment the application happens — otherwise a car that applied late looks the same as a car that applied on time.",
    },
    {
      id: "car-walk", kind: "sequence", anyOrder: true,
      targets: ["car-1-brake", "car-2-brake", "car-3-brake"],
      itemNames: { "car-1-brake": "car 1 — brake shoe applied", "car-2-brake": "car 2 — brake shoe applied", "car-3-brake": "car 3 — brake shoe applied" },
      title: "Walk the cut and confirm the set",
      cue: "Check each car's brake shoe is actually against the wheel after the set.",
      why: "A car with air in the system and a car with a brake shoe actually against the wheel are not always the same car — a stuck slack adjuster or a bent lever can leave a shoe hanging clear of the tread with a perfectly normal gauge reading in the cab.",
    },
    {
      id: "piston-gauge", kind: "gauge", target: "piston-gauge",
      title: "Check piston travel",
      cue: "Measure the brake cylinder piston travel and commit inside tolerance.",
      why: "Too little travel and the shoes never fully release; too much and there is not enough stroke left for the brake to develop full force by the time the piston bottoms out — either one is a car that behaves differently than the rest of the train expects it to.",
      gauge: {
        label: "PISTON TRAVEL", speed: 0.68, green: [0.32, 0.56],
        readout: (t) => `${Math.round(t * 300)} mm`,
        missNote: "Outside tolerance. Log the car for adjustment before it moves.",
      },
    },
    {
      id: "angle-cock", kind: "turn", target: "angle-cock",
      title: "Check the angle cock is fully open",
      cue: "Turn the angle cock handle and confirm it seats fully open in line with the hose.",
      why: "An angle cock left even slightly closed restricts brake pipe flow through that joint, and on a long train that restriction is exactly what turns a normal service application into an uneven one, with some cars braking hard before others have felt anything yet.",
      turn: { turns: 0.25, axis: "z", label: "ANGLE COCK" },
    },
    {
      id: "hose-check", kind: "select", target: "brake-hose",
      title: "Inspect the brake hose and coupling",
      cue: "Check the hose for cracking and the glad hand for a worn gasket.",
      why: "A brake hose that cracks or a glad hand that leaks under pressure loses train line air exactly where the crew cannot see it happening, and on a long train a slow leak at one joint can mask itself as a normal brake pipe gradient until the whole train starts running short of air.",
    },
    {
      id: "rigging-walk", kind: "find", noHint: true,
      targets: ["loose-rigging", "worn-shoe"],
      itemNames: { "loose-rigging": "brake rod hanging off its hanger", "worn-shoe": "brake shoe worn to the backing plate" },
      itemNotes: {
        "loose-rigging": "A rod off its hanger can swing into the wheel or drag on the ballast the first time this car rolls.",
        "worn-shoe": "A shoe worn to the plate is metal on metal — it stops the wheel far less than the gauge reading in the cab would suggest.",
      },
      title: "Walk the rigging under each car",
      cue: "Scan the brake rigging under the cut for anything loose, worn or hanging low.",
      why: "The rigging under a car does its job unseen for thousands of miles between inspections, and a hanger that has worked loose or a shoe worn past its wear line does not announce itself on any gauge in the cab — it only shows up to somebody who actually looks underneath.",
    },
    {
      id: "tag-defect", kind: "drag", target: "bad-order-tag",
      title: "Tag the defective car",
      cue: "Carry the bad-order tag to the car with the worn shoe and hang it where the next crew will see it.",
      why: "A defect found and not tagged is a defect the next crew has no way to know about — the tag is what turns what you just found into something the car is actually held for, rather than a fact that dies with today's inspection.",
      drag: { to: "defective-car", radius: 0.32, missNote: "Not hung on the car — carry the tag the rest of the way to where the crew will see it." },
    },
    {
      id: "wheel-check", kind: "select", target: "flat-wheel",
      title: "Check the wheel for a flat spot",
      cue: "Look at the wheel tread for a flat, without putting a hand on it.",
      why: "A flat spot is checked by eye first because the wheel that made it is often still carrying the heat of the slide — and a flat wheel found now is a car set out now, before that flat hammers the rail hard enough to start a defect somewhere else in the track.",
    },
    {
      id: "release-clear", kind: "track", target: "clearance-dial", seconds: 6,
      title: "Stay clear while the release is called",
      cue: "Hold the clearance reading in the green band while the engineer releases the brakes.",
      why: "A release moves every piston in the train back at once, and standing clear of the rigging while it happens is what keeps a release test of the brakes from becoming a test of anyone still reaching underneath one.",
      track: { label: "CLEARANCE", green: [0.4, 0.66], rise: 0.48, fall: 0.4, drift: 0.12, readout: (v) => `${Math.round(v * 100)}%` },
      holdBreakNote: "Clearance dropped out of band during the release. A hand still under a car when the piston moves back is exactly what this step exists to prevent.",
    },
    {
      id: "call-release", kind: "select", target: "radio-handset",
      title: "Confirm the release",
      cue: "Radio the engineer to release, then confirm every shoe actually comes off the wheel.",
      why: "The release is confirmed the same way the set was — by walking it and looking, not by trusting the gauge in the cab — because a shoe that stays dragging after a release is a wheel that heats up and wears flat over the very next mile of running.",
    },
    {
      id: "walk-tools", kind: "find", noHint: true,
      targets: ["left-tool"],
      itemNames: { "left-tool": "gauge left on the running rail" },
      itemNotes: { "left-tool": "Caught before the tally closed — a tool on the rail is a foreign object under the first wheel that reaches it." },
      title: "Walk the string for anything left behind",
      cue: "Scan the string and clear anything that didn't make it back into the kit.",
      why: "A full brake test puts a lot of tools and tags in play along the length of a cut, and the only check that catches what got left behind is somebody actually walking the string before the blue signal comes down.",
    },
    {
      id: "close-log", kind: "select", target: "test-sheet-board",
      title: "Sign the test sheet",
      cue: "Log the piston travel readings, the tagged car and the class of test performed.",
      why: "The signed test sheet is what the crew's dispatcher and the next terminal both rely on to know this cut does not need testing again before it moves — an unsigned test is, on paper, a test that never happened.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, RA_ABT_ACCENT);

    // ------------------------------------------------------------- textures
    const ballastTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#57534b"); grad.addColorStop(1, "#3b3831");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const x = (i * 59.3) % w, y = (i * 87.9) % h, r = 1.4 + ((i * 19) % 5) * 0.5;
        cx.fillStyle = i % 4 === 0 ? "rgba(150,140,122,0.55)" : "rgba(30,26,20,0.45)";
        cx.beginPath(); cx.ellipse(x, y, r, r * 0.7, (i % 6) * 0.5, 0, 7); cx.fill();
      }
    }, { repeat: 6 });
    const ballastMat = texturedMat(ballastTex, { rough: 0.96, color: 0x8d8577 });

    const railTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#c7ccd1"); grad.addColorStop(0.5, "#8a9096"); grad.addColorStop(1, "#5b6167");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "rgba(120,70,40,0.18)";
      for (let i = 0; i < 30; i++) cx.fillRect((i * 37) % w, 0, 2, h);
    }, { repeat: 3 });
    const railMat = texturedMat(railTex, { rough: 0.32, metal: 0.75, color: 0xaab0b6 });

    const tieTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#3a2c20"); grad.addColorStop(0.5, "#2c2117"); grad.addColorStop(1, "#382a1e");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "rgba(0,0,0,0.35)"; cx.lineWidth = 2;
      for (let i = 0; i < 10; i++) { cx.beginPath(); cx.moveTo(0, (i / 10) * h + 4); cx.bezierCurveTo(w * 0.3, (i / 10) * h - 3, w * 0.7, (i / 10) * h + 6, w, (i / 10) * h); cx.stroke(); }
    }, { repeat: 1 });
    const tieMat = texturedMat(tieTex, { rough: 0.9, color: 0x8a7a68 });

    const platformTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#4f4038", base2: "#40332c", seam: "rgba(0,0,0,0.5)",
    }), { repeat: 3 });
    const platformMat = texturedMat(platformTex, { rough: 0.9, color: 0xc9b39c });

    const steelTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#3d3230"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 14; i++) {
        cx.fillStyle = i % 2 ? "rgba(0,0,0,0.24)" : "rgba(255,255,255,0.08)";
        cx.fillRect((i / 14) * w, 0, w / 28, h);
      }
    }, { repeat: 2 });
    const carSteelMat = texturedMat(steelTex, { rough: 0.7, metal: 0.35, color: 0x6b3a35 });

    // ------------------------------------------------------------- track
    const ballast = box(g, 6.0, 0.16, 1.6, 0, 0.08, 0, 0x8d8577, { rough: 0.98 });
    ballast.material = ballastMat;
    for (const sx of [-1, 1]) {
      const rail = box(g, 6.0, 0.1, 0.06, 0, 0.21, sx * 0.36, 0xaab0b6, { rough: 0.32, metal: 0.75 });
      rail.material = railMat;
    }
    for (let i = -11; i <= 11; i++) {
      const tie = box(g, 0.16, 0.06, 0.9, i * 0.26, 0.11, 0, 0x8a7a68, { rough: 0.9 });
      tie.material = tieMat;
    }
    // Adjacent lead.
    const adjTrack = group(g, 0, 0, -1.7);
    box(adjTrack, 6.0, 0.14, 1.2, 0, 0.07, 0, 0x716c62, { rough: 0.95 });
    for (const sx of [-1, 1]) box(adjTrack, 6.0, 0.09, 0.06, 0, 0.19, sx * 0.36, 0x9aa1a8, { rough: 0.35, metal: 0.7 });
    reg(hits, box(adjTrack, 6.0, 1.6, 1.2, 0, 0.8, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "fouling-adjacent-lead");

    // ------------------------------------------------------------- freight cars
    function freightCar(parent, x, colour, marks) {
      const c = group(parent, x, 0, 0);
      const body = box(c, 1.9, 1.4, 1.4, 0, 1.4, 0, colour, { rough: 0.75, metal: 0.25, finish: "painted", tile: [3, 2] });
      body.material = carSteelMat;
      box(c, 1.96, 0.18, 1.46, 0, 2.14, 0, 0x4a4048, { rough: 0.7, metal: 0.4 });
      box(c, 1.9, 0.2, 1.36, 0, 0.6, 0, 0x3a3036, { rough: 0.85, metal: 0.3 });
      decal(c, 0.7, 0.16, -0.4, 1.9, 0.71, (cx, w, h) => {
        cx.clearRect(0, 0, w, h);
        cx.fillStyle = "#d8ccc0";
        cx.font = `600 ${Math.round(h * 0.8)}px 'Barlow Condensed', Arial, sans-serif`;
        cx.textAlign = "left"; cx.textBaseline = "middle";
        cx.fillText(marks, 0, h * 0.56);
      }, { px: 220, transparent: true, rough: 0.9 });
      for (const sx of [-1, 1]) {
        box(c, 0.68, 0.28, 1.0, sx * 0.62, 0.36, 0, 0x22201e, { rough: 0.9 });
        for (const sz of [-1, 1]) {
          cyl(c, 0.24, 0.24, 0.08, sx * 0.62, 0.3, sz * 0.46, 0x4c4340, { rough: 0.5, metal: 0.7, seg: 14 }).rotation.x = Math.PI / 2;
        }
      }
      return c;
    }
    const carA = freightCar(g, -1.9, 0x7a3a35, "SCX 40217");
    const carB = freightCar(g, 0.1, 0x5a4a3a, "SCX 40218");
    const carC = freightCar(g, 2.1, 0x6a5245, "SCX 40219");

    // Couplers and brake hoses between A-B and B-C.
    function coupling(parent, xa, xb, id) {
      const cp = group(parent, (xa + xb) / 2, 0, 0);
      box(cp, Math.abs(xb - xa) - 1.7, 0.16, 0.16, 0, 0.6, 0, 0x50403c, { rough: 0.6, metal: 0.5 });
      const hose = cyl(cp, 0.02, 0.02, 0.3, 0, 0.4, 0.5, 0x1b1e22, { rough: 0.8, seg: 8 });
      hose.rotation.x = 0.6;
      const glad = cyl(cp, 0.035, 0.035, 0.05, 0, 0.28, 0.6, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 10 });
      reg(hits, glad, id);
      return cp;
    }
    coupling(g, -1.9, 0.1, "brake-hose");
    const betweenTrap = box(g, 0.4, 1.6, 1.2, -0.9, 0.8, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, betweenTrap, "between-cars-unprotected");
    coupling(g, 0.1, 2.1, "angle-cock-coupling");

    // Angle cock.
    const angleCock = group(g, 1.0, 0.5, -0.5, -0.6);
    cyl(angleCock, 0.03, 0.03, 0.14, 0, 0, 0, 0x6b7279, { rough: 0.5, metal: 0.6, seg: 10 });
    const cockHandle = box(angleCock, 0.16, 0.03, 0.03, 0, 0.09, 0, RA_ABT_ACCENT, { rough: 0.5, metal: 0.4 });
    holoTag(angleCock, "Angle cock", 0, 0.2, 0, { css: RA_ABT_CSS, w: 0.28 });
    reg(hits, cockHandle, "angle-cock");

    // Brake stand on car A.
    const brakeStand = group(carA, 0.7, 1.0, -0.65, -0.5);
    slab(brakeStand, 0.14, 0.2, 0.1, 0, 0, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const brakeGauge = instrument(brakeStand, 0, 0.18, 0.07, { ry: 0, idle: "-- psi", color: RA_ABT_ACCENT });
    holoTag(brakeStand, "Brake stand", 0, 0.38, 0, { css: RA_ABT_CSS, w: 0.3 });
    reg(hits, brakeGauge, "brake-stand");

    // Piston gauge tool.
    const pistonGaugeTool = group(g, -0.3, 0, -0.75, -0.3);
    box(pistonGaugeTool, 0.2, 0.03, 0.02, 0, 0.4, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    holoTag(pistonGaugeTool, "Piston gauge", 0, 0.5, 0, { css: RA_ABT_CSS, w: 0.28 });
    reg(hits, pistonGaugeTool, "piston-gauge");

    // Brake shoes registered per car for the sequence step.
    function brakeShoe(parent, x, id) {
      const shoe = box(g, 0.14, 0.1, 0.08, x, 0.28, -0.4, 0x3a3a3a, { rough: 0.75, metal: 0.4 });
      reg(hits, shoe, id);
      return shoe;
    }
    const shoeA = brakeShoe(g, -1.9, "car-1-brake");
    const shoeB = brakeShoe(g, 0.1, "car-2-brake");
    const shoeC = brakeShoe(g, 2.1, "car-3-brake");

    // Loose rigging and worn shoe finds.
    const looseRigging = group(g, -1.9, 0.24, 0.4, 0.4);
    box(looseRigging, 0.4, 0.03, 0.03, 0, 0, 0, 0x50403c, { rough: 0.7, metal: 0.4 });
    reg(hits, looseRigging, "loose-rigging");
    const wornShoe = group(g, 2.1, 0.24, 0.42);
    box(wornShoe, 0.14, 0.06, 0.08, 0, 0, 0, 0x2a2a2a, { rough: 0.85, metal: 0.3 });
    reg(hits, wornShoe, "worn-shoe");

    // Flat wheel.
    const flatWheel = cyl(carC, 0.24, 0.24, 0.08, 0.62, 0.3, 0.46, 0x4c4340, { rough: 0.5, metal: 0.7, seg: 14 });
    flatWheel.rotation.x = Math.PI / 2;
    reg(hits, flatWheel, "flat-wheel");
    const flatWheelTouchZone = box(carC, 0.3, 0.3, 0.3, 0.62, 0.3, 0.46, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, flatWheelTouchZone, "hot-flat-wheel");

    // Dragging rigging hazard, under car B.
    reg(hits, box(g, 0.3, 0.3, 0.3, 0.1, 0.15, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "dragging-rigging");

    // Blue signal.
    const blueSignal = group(g, -2.9, 0, 0.9);
    cyl(blueSignal, 0.024, 0.03, 1.1, 0, 0.55, 0, 0xb0b7bd, { rough: 0.5, metal: 0.6, seg: 8 });
    box(blueSignal, 0.3, 0.22, 0.02, 0.17, 0.98, 0, 0x2f6fd8, { rough: 0.6, finish: "painted" });
    const blueLamp = ball(blueSignal, 0.05, 0, 1.16, 0, 0x2f6fd8, { emissive: 0x2f6fd8, ei: 2.6, rough: 0.3 });
    holoTag(blueSignal, "Blue signal", 0, 1.42, 0, { css: "#4a90e2", w: 0.32 });
    reg(hits, blueSignal, "blue-signal");

    // Clearance dial for the release step.
    const clearanceDial = instrument(g, -0.4, 0.86, 0.9, { ry: -0.5, idle: "CLEAR", color: RA_ABT_ACCENT });
    holoTag(clearanceDial, "Rigging clearance", 0, 0.15, 0, { css: RA_ABT_CSS, w: 0.32 });
    reg(hits, clearanceDial, "clearance-dial");

    // Bad-order tag and defective car.
    const tagCart = group(g, -2.6, 0, 1.6, 0.3);
    box(tagCart, 0.3, 0.4, 0.3, 0, 0.2, 0, 0x3a4048, { rough: 0.7, metal: 0.3 });
    const badOrderTag = box(tagCart, 0.08, 0.1, 0.005, 0, 0.45, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(tagCart, "Bad-order tag", 0, 0.55, 0, { css: RA_ABT_CSS, w: 0.28 });
    reg(hits, badOrderTag, "bad-order-tag");
    hits["defective-car"] = wornShoe;

    // Left tool.
    const leftTool = group(g, 3.0, 0.13, -0.3, 0.4);
    box(leftTool, 0.16, 0.018, 0.03, 0, 0, 0, 0x53585e, { rough: 0.45, metal: 0.6 });
    reg(hits, leftTool, "left-tool");

    // Test sheet board, radio, crew.
    const testSheetBoard = holoPanel(g, 0.6, 0.42, -3.0, 1.55, 1.6, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = RA_ABT_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#d9b3ac";
      cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("TEST SHEET · 3-CAR CUT", w * 0.06, h * 0.14);
      cx.fillStyle = "#f6ede9";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("INITIAL TERMINAL TEST", w * 0.06, h * 0.32);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = "#d3aca4";
      ["Charge, set, walk, release — per the rulebook", "Piston travel tolerance: per the standard", "Blue signal up before anyone goes between"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.5 + i * 0.12)));
    }, { ry: 0.6, accent: RA_ABT_ACCENT });
    reg(hits, testSheetBoard, "test-sheet-board");

    const radio = group(g, -2.9, 0, 1.9, -0.3);
    slab(radio, 0.5, 0.16, 0.16, 0, 0.85, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const radioScreen = decal(radio, 0.4, 0.1, 0, 0.87, 0.09,
      signFace("STANDBY", { bg: "#0d1c24", accent: RA_ABT_CSS, fg: "#ffd6d0", scale: 0.5 }), { glow: true, ei: 0.85, px: 256 });
    holoTag(radio, "Engineer line", 0, 1.05, 0.08, { css: RA_ABT_CSS, w: 0.32 });
    reg(hits, radio, "radio-handset");

    const inspector = standingFigure(g, 3.4, -1.6, { ry: 2.3, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });

    // Crew platform.
    const platform = box(g, 1.4, 0.1, 1.0, -2.6, 0.05, 1.3, 0xc9b39c, { rough: 0.9 });
    platform.material = platformMat;

    cone(g, -3.1, 1.0, { color: RA_ABT_ACCENT });
    cone(g, 3.1, 1.0, { color: RA_ABT_ACCENT });

    const smoke = particles(carB, 8, 0x9aa4ad, { size: 0.03, life: 0.6, additive: false, opacity: 0.2 });
    smoke.position.set(0, 0.3, -0.4);
    smoke.visible = false;

    // The approaching switch cut, hidden until the interrupt drives it into view.
    const approachingCut = group(g, 5.4, 0, -1.7);
    box(approachingCut, 1.6, 1.2, 1.2, 0, 1.0, 0, 0x5a4a3a, { rough: 0.75, metal: 0.25 });
    approachingCut.visible = false;

    return {
      hits,
      footprint: 2.4,

      onInterrupt(it) {
        if (it.id === "unexpected-air") {
          repaint(radioScreen, signFace("AIR\nMOVING", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.3 }));
          [carA, carB, carC].forEach((c) => { c.position.x += 0.02; });
        }
        if (it.id === "coupling-attempt") {
          approachingCut.visible = true;
          repaint(radioScreen, signFace("CUT\nAPPROACHING", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.3 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "unexpected-air") {
          repaint(radioScreen, signFace("HOLDING", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
          [carA, carB, carC].forEach((c) => { c.position.x -= 0.02; });
        }
        if (it.id === "coupling-attempt") {
          approachingCut.visible = false;
          repaint(radioScreen, signFace("MOVE\nSTOPPED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },

      onStepComplete(step) {
        if (step.id === "blue-check") blueLamp.material = mat(0x2f6fd8, { emissive: 0x2f6fd8, ei: 2.6 });
        if (step.id === "charge") repaint(brakeGauge.userData.screen, signFace("90 psi", { bg: "#0d1c24", accent: "#59c97b", scale: 0.6 }));
        if (step.id === "call-set") { [shoeA, shoeB, shoeC].forEach((s) => { s.position.z = -0.33; }); smoke.visible = true; }
        if (step.id === "car-walk") { /* confirmed visually by shoe position already set */ }
        if (step.id === "angle-cock") cockHandle.rotation.z = Math.PI / 2;
        if (step.id === "hose-check") { /* inspected */ }
        if (step.id === "tag-defect") { badOrderTag.position.set(0, 0, 0); wornShoe.add(badOrderTag); }
        if (step.id === "call-release") { [shoeA, shoeB, shoeC].forEach((s) => { s.position.z = -0.4; }); smoke.visible = false; }
        if (step.id === "walk-tools") leftTool.visible = false;
        if (step.id === "close-log") repaint(testSheetBoard.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
          cx.fillStyle = "#f6ede9";
          cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle";
          cx.fillText("TEST SHEET SIGNED", w / 2, h * 0.5);
        });
      },

      animate(t, dt, session) {
        inspector.userData.head.rotation.y = Math.sin(t * 0.55) * 0.5;
        if (smoke.visible) smoke.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.05, 0.2, 0.15);
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "charge") {
            repaint(brakeGauge.userData.screen, signFace(`${Math.round(gg.t * 90)}`, {
              bg: "#0d1c24", accent: gg.t > 0.82 ? "#59c97b" : "#f2c14b", scale: 0.6,
            }));
          }
        }
        const tr = session?.track;
        if (tr && session.step?.id === "release-clear") clearanceDial.userData.show?.(`${Math.round(tr.v * 100)}%`);
      },
    };
  },
};
