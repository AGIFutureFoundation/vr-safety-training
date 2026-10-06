import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, cone, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ RCL Switching VR — Mobility & Transit, the remote control yard job.
//
// Switching cars with a remote control locomotive. Every other job in the yard
// has somebody else's hand on the throttle; here the operator is on the ground,
// in the gauge, walking with the movement and driving it from a box strapped to
// their chest. That is the whole difficulty of it: the person who has to see the
// leading end is the same person deciding how fast it goes, and those two jobs
// compete for one pair of eyes. So the procedure is built round point protection
// — see the leading end, be able to stop short of whatever is in front of it,
// and when you cannot see it, the movement stops — and round the protections
// that exist because a cut of cars does not care who is standing between it:
// the blue signal, three-step, and securement proved by pulling against it.
//
// The tilt and vigilance features in the control box are a backstop for the
// operator who goes down. They are not the plan, and nothing in here treats
// them as one.

const RCL_ACCENT = 0x4a90e2;

export const SIM_RCL_SWITCHING = {
  id: "rcl-switching",
  index: "63",
  domain: "Rail",
  trade: "Remote control locomotive operator / switchman",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "SMART Transportation Division and BLET — the carrier's remote control locomotive operator certification, over conductor and engineer certification under FRA 49 CFR 242 and 240; 49 CFR 218 Subpart B blue signal protection of workers; 49 CFR 232 brake system standards, including the securement of unattended equipment",
  name: "RCL Switching",
  title: simTitle("RCL Switching"),
  tagline: "A remote control shove worked from the ground: point protection on every movement, a blue signal put up and taken down by the one hand it protects, three-step before anybody fouls the equipment, and securement proved by pulling against it",
  accent: RCL_ACCENT,
  accentCss: "#4a90e2",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "point-protected", name: "Point Protected", note: "A cut shoved, coupled, secured and left in the clear with the leading end never once out of sight" },

  game: system({
    name: "Yard Authority",
    currency: "CARS",
    ranks: ["Switchman", "RCL Operator", "Yard Foreman", "Yardmaster", "Yard Authority Certified"],
    badges: [
      { id: "eyes-on-the-point", name: "Eyes On The Point", note: "Never let the movement run past what could be seen", test: AWARD.safe },
      { id: "blue-is-yours", name: "Blue Is Yours", note: "The blue signal went up before anyone went between, and came down by the same hand", test: AWARD.stepClean("blue-signal") },
      { id: "speed-true", name: "Speed True", note: "Shove speed, coupling speed and the pull test all read inside their bands", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-list", name: "Clean List", note: "Worked the list with no corrections", test: AWARD.clean },
      { id: "protection-held", name: "Protection Held", note: "Held three-step for the full count, first time", test: AWARD.unbroken },
      { id: "yard-time", name: "Yard Time", note: "Cut tied down inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "lost-sight": "You kept shoving with the leading end behind the standing cut on the next track. Point protection is not a speed limit, it is a promise that the movement can be stopped short of whatever is in front of it — and that is not a promise anybody can make about track they cannot see. When the leading end goes out of sight, the movement stops until it is back in sight or somebody else has the point.",
    "ride-the-shove": "You stepped onto the side ladder of a car that is moving. Getting on and off moving equipment is how switchmen lose feet, and on a remote control job it is worse than that: the operator riding the car is the operator who has stopped watching the leading end, and the only brake that cut has is the box on your chest.",
    "between-cars": "You went in between equipment that is neither separated nor protected. A cut with a locomotive coupled to it can move, and it does not need anybody to make a mistake first — slack running in will close a gap you are standing in faster than you can get out of it. Nothing goes between until the equipment is separated, protected, and protected by you.",
    "over-the-coupler": "You climbed over the drawbar to get to the other side. Crossing over couplers and drawbars puts your whole body in the one place on a car that closes under slack, and it is the crossing people make without thinking because the alternative is a long walk round the end. Go round the end, far enough out that nothing can reach you.",
  },

  lateNotes: {
    "blue-signal": "The blue signal goes up when you are about to work on, under or between the equipment — after the movement is made and the protection is set, not before.",
    "handbrake-wheel": "Hand brakes go on when the cut is being left standing. At this point it is still coupled to a locomotive that answers your box.",
  },

  steps: [
    {
      id: "brief", kind: "select", target: "job-briefing",
      title: "Take the job briefing and the switch list",
      cue: "Read which cars are moving, which track they go into, and which end you are shoving from.",
      why: "A remote control job is worked from the ground by one person with the whole movement in their hands, so the plan is settled before the wheels turn. The briefing is also where the crew agrees who holds the point and who is being protected, and that is the one thing nobody can work out later by looking.",
    },
    {
      id: "link-up", kind: "sequence",
      targets: ["ocu-vest", "ocu-link", "ocu-tilt"],
      itemNames: { "ocu-vest": "operator control unit and harness", "ocu-link": "link the box to the locomotive", "ocu-tilt": "prove the tilt and vigilance features" },
      title: "Belt the box on, link it, prove its safeties",
      cue: "OCU on the harness, linked to the unit, tilt and vigilance proved before anything moves.",
      why: "The box on your chest is the cab now, and it is the only cab. Linking it is what hands a locomotive to somebody standing on the ballast, and the features that stop the movement when the operator goes down get proved at the start, while proving them costs nothing but a minute.",
    },
    {
      id: "brake-check", kind: "gauge", target: "brake-gauge",
      title: "Prove the brakes answer the box",
      cue: "Call for a brake application from the OCU and commit on the brake pipe reduction.",
      why: "Everything after this depends on the movement stopping when a hand that is not in the cab tells it to. The reduction is read off a gauge rather than assumed from a button, because a link that talks to a locomotive is not the same thing as a link that brakes it.",
      gauge: {
        label: "BRAKE PIPE", speed: 0.7, green: [0.56, 0.78],
        readout: (t) => `${Math.round(t * 110)} psi`,
        missNote: "That is not the reduction the application should be making. Nothing moves on a brake you have not proved.",
      },
    },
    {
      id: "point", kind: "select", target: "point-position",
      title: "Take the point before anything moves",
      cue: "Get yourself where you can see the leading end of the movement and the track ahead of it.",
      why: "This is the rule the whole job hangs on: the movement goes no further than the operator can see it stop. On a shove that means being ahead of the leading end, on the side the track is visible from, and it means taking that position first rather than catching up with it afterwards.",
    },
    {
      id: "shove", kind: "track", target: "ocu-throttle", seconds: 6,
      title: "Shove at a speed you can stop within half of what you can see",
      cue: "Hold the speed inside the band and keep the leading end in sight the whole way.",
      why: "Half the range of vision, short of anything fouling the track, is point protection written as a number. It is not a fixed speed — it is the speed at which this much clear track is enough, so it comes down when the sight line shortens and it comes down to zero when the sight line closes.",
      track: { label: "SHOVE", green: [0.16, 0.36], rise: 0.46, fall: 0.38, drift: 0.12, readout: (v) => `${(v * 12).toFixed(1)} mph` },
    },
    {
      id: "line-switch", kind: "turn", target: "switch-stand",
      title: "Line the hand switch and look at the points",
      cue: "Throw the switch stand right over for the track you are shoving into, then look at where the points actually went.",
      why: "The target on a switch stand tells you what the handle did, not what the points did. A point that has not seated leaves a gap for a wheel to pick, and the only way that gets found before a derailment is somebody walking up and looking at the rail.",
      turn: { turns: 0.5, axis: "y", label: "HAND SWITCH" },
    },
    {
      id: "couple", kind: "gauge", target: "speed-display",
      title: "Couple at coupling speed",
      cue: "Bring the movement down to a coupling speed and commit when the display reads it.",
      why: "Cars are coupled slowly because the impact carries on through the lading, the draft gear and whatever is standing at the far end of the track. A hard joint is also how a cut somebody thought was secured ends up shoved out the other end.",
      gauge: {
        label: "COUPLING", speed: 0.72, green: [0.08, 0.34],
        readout: (t) => `${(t * 10).toFixed(1)} mph`,
        missNote: "Too fast for a joint. Back it off and bring it in at a speed the far end of that track can absorb.",
      },
    },
    {
      id: "protection", kind: "hold", target: "three-step-button", seconds: 5,
      title: "Set three-step protection and hold for the acknowledgement",
      cue: "Call for three-step from the box and hold until the locomotive acknowledges it.",
      why: "Three-step is the machine's undertaking that it cannot move: brakes applied, reverser centred, power off. On a remote control job the same person asks for it and then relies on it, which is exactly why it is held until the acknowledgement comes back rather than assumed from a button press.",
      holdBreakNote: "You let go before the acknowledgement came back. Protection you did not see confirmed is protection you do not have.",
    },
    {
      id: "blue-signal", kind: "select", target: "blue-signal",
      title: "Display your own blue signal",
      cue: "Put the blue signal up yourself, before you go on, under or between the equipment.",
      why: "A blue signal is personal. The worker it protects is the one who displays it and the only one who may remove it, and while it is up the equipment is not coupled to and is not moved by anybody. That is what makes it worth more than an arrangement with whoever happens to be on duty.",
    },
    {
      id: "knuckle", kind: "drag", target: "knuckle",
      title: "Change the broken knuckle",
      cue: "Carry the spare knuckle in and seat it in the coupler, now that the equipment is separated and protected.",
      why: "This is the work all that protection was set for, and the reason it has to be personal: the person whose arms are inside the coupler is the person who asked for three-step and put the blue signal up. Knuckles are also heavy and awkward, which is its own argument for not doing this twice.",
      drag: { to: "coupler-seat", radius: 0.5, missNote: "Not seated in the coupler — a knuckle lying on the drawbar will not make a joint." },
    },
    {
      id: "handbrake", kind: "turn", target: "handbrake-wheel",
      title: "Wind the hand brake down on the cut",
      cue: "Take the hand brake up on the car you are leaving, and take it up hard.",
      why: "A cut left standing is held by hand brakes, not by air, because air leaks off and nobody will be here when it does. How many brakes and how hard is a judgement about the grade, the tonnage and the wind — and it is a judgement that gets tested in the next step rather than trusted.",
      turn: { turns: 2, axis: "x", label: "HAND BRAKE" },
    },
    {
      id: "tug-test", kind: "gauge", target: "effort-gauge",
      title: "Prove the securement by pulling against it",
      cue: "Pull against the applied hand brakes and commit when the load holds and the cut has not moved.",
      why: "Securement is verified by attempting to move the equipment, not by counting turns on a wheel. A wheel that span freely because the chain was slack feels exactly like a wheel that took up — right up until the cut is found somewhere nobody left it.",
      gauge: {
        label: "TRACTIVE EFFORT", speed: 0.68, green: [0.44, 0.66],
        readout: (t) => `${Math.round(t * 40)} k lb`,
        missNote: "Either that was not enough pull to prove anything, or the cut moved under it. Tie down more brakes and test it again.",
      },
    },
    {
      id: "clear-point", kind: "select", target: "clearance-point",
      title: "Check the cut is standing in the clear",
      cue: "Walk to the clearance point and sight along the adjacent track before you give the track up.",
      why: "Equipment left fouling the next track is the cause of the side-swipe nobody saw coming, and it is always a car end sticking out by a couple of feet at a spot the operator never walked to. The clearance point is marked so that it can be looked at instead of estimated from down the yard.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["dragging-hose", "loose-handhold"],
      itemNames: { "dragging-hose": "dragging air hose", "loose-handhold": "loose handhold" },
      itemNotes: {
        "dragging-hose": "The trainline hose on the far end is hanging down against the rail. Dragging equipment takes out a switch point the next time this car rolls, and it is the crew who left it who gets asked about it.",
        "loose-handhold": "The handhold on the corner has pulled away at its top mount. That is the grab iron somebody puts their whole weight on in the dark, and the car does not go anywhere until it is carded for repair.",
      },
      title: "Walk the cut before you leave it",
      cue: "Go down the length of the cut and click whatever needs a bad order card.",
      why: "Nobody else is walking this cut tonight. Defects on yard equipment get found by the last person who worked it, walking it with their eyes open, and the list of what gets missed is the same list every time: hoses, handholds, sill steps and brake rigging.",
    },
    {
      id: "blue-clear", kind: "select", target: "blue-signal",
      title: "Take your own blue signal down, last",
      cue: "Work finished, everybody out from between — now take down the signal you put up.",
      why: "It comes down by the same hand that put it up, and it comes down last, after the work is done and the people are clear. A blue signal taken down by somebody else, or taken down early because the track is wanted, is the precise failure the rule was written for.",
    },
  ],

  interrupts: [
    {
      id: "point-fouled",
      kind: "Somebody in the gauge",
      after: "shove", delay: 3, seconds: 11,
      alert: "A carman has come out from between the standing cars on the next track and is walking in the gauge ahead of your leading end.",
      cue: "There is a person where your movement is going.",
      target: "stop-button",
      why: "Point protection is the promise that this movement can be stopped short of whatever is in front of it, and the moment a person is in front of it that promise is the only thing that matters. The stop goes in first and the conversation happens afterwards: on a remote control job the box in your hand is the only brake that cut has, and it is already in your hand.",
      missNote: "You kept shoving. He heard it and stepped out, which is how almost all of these end and is exactly why people stop expecting them to matter. The cut you were pushing weighs well over a hundred tons a car, it makes very little noise at the leading end because the locomotive is four cars behind it, and nothing about it was going to stop for him.",
      wrongNote: "It is the stop on the box. Nothing else within reach takes the movement away from him before he is out of it.",
    },
    {
      id: "blue-lifted",
      kind: "Your protection removed",
      after: "knuckle", delay: 3, seconds: 12,
      alert: "The blue signal you set is lying flat beside the rail. Somebody has lifted it so the track can be used, and your hands are still in the coupler.",
      cue: "Your protection is on the ground.",
      target: "blue-signal",
      why: "A blue signal is applied by the worker it protects and removed only by that same worker, and that is not a formality about who is allowed to touch a flag: it is the whole reason the protection means anything while you are inside equipment you cannot see out of. The moment it is down, that equipment may be coupled to and moved, and nobody moving it knows you are in there.",
      missNote: "You finished the knuckle with your protection lying in the ballast. Nothing came into the track, which is luck rather than protection — for as long as your arms were inside that coupler the equipment was, as far as every other crew in this yard could tell, available to be coupled to and moved.",
      wrongNote: "It is the blue signal. Nothing else you can reach from in here puts your own protection back up.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, RCL_ACCENT);

    // --------------------------------------------------------------- the track
    // Two tracks. The working track carries the job; the cut standing on the
    // next one is what takes the sight line off the leading end.
    function railRoad(parent, z, length, ties) {
      const t = group(parent, 0, 0, z);
      box(t, length, 0.16, 1.7, 0, 0.08, 0, 0x463f38, { rough: 0.98, finish: "concrete", tile: [8, 2] });
      for (const sz of [-1, 1]) box(t, length, 0.11, 0.07, 0, 0.22, sz * 0.45, 0x9aa1a8, { rough: 0.3, metal: 0.75 });
      const span = length - 0.7;
      for (let i = 0; i < ties; i++) {
        box(t, 0.19, 0.08, 1.2, -span / 2 + (i * span) / (ties - 1), 0.12, 0, 0x2f2b26, { rough: 0.96 });
      }
      return t;
    }
    railRoad(g, -1.5, 9.6, 15);
    railRoad(g, -4.2, 8.4, 10);

    // ------------------------------------------------------------ rolling stock
    // Detailed enough that the side of a car is not a grey plate across the
    // line of sight: ribs, a door, reporting marks, trucks and corner grabs.
    function freightCar(parent, x, z, color, marks) {
      const c = group(parent, x, 0, z);
      box(c, 2.0, 0.2, 1.5, 0, 0.62, 0, 0x3a4048, { rough: 0.85, metal: 0.3 });
      box(c, 2.0, 1.5, 1.44, 0, 1.5, 0, color, { rough: 0.78, metal: 0.25, finish: "painted", tile: [4, 3] });
      box(c, 2.08, 0.1, 1.52, 0, 2.3, 0, 0x5d646b, { rough: 0.7, metal: 0.4 });
      for (let i = 0; i < 4; i++) {
        for (const sz of [-1, 1]) {
          box(c, 0.05, 1.42, 0.03, -0.72 + i * 0.48, 1.5, sz * 0.735, 0x1f242a, { rough: 0.8, cast: false });
        }
      }
      box(c, 0.66, 1.22, 0.05, 0, 1.46, 0.745, 0x1f242a, { rough: 0.8 });
      decal(c, 0.78, 0.18, -0.52, 2.02, 0.736, (cx, w, h) => {
        cx.clearRect(0, 0, w, h);
        cx.fillStyle = "#e7ecf0";
        cx.font = `600 ${Math.round(h * 0.8)}px 'Barlow Condensed', Arial, sans-serif`;
        cx.textAlign = "left"; cx.textBaseline = "middle";
        cx.fillText(marks, 0, h * 0.56);
      }, { px: 256, transparent: true, rough: 0.9 });
      for (const sx of [-1, 1]) {
        box(c, 0.72, 0.28, 1.1, sx * 0.66, 0.36, 0, 0x22272d, { rough: 0.9 });
        for (const sz of [-1, 1]) {
          cyl(c, 0.24, 0.24, 0.08, sx * 0.66, 0.3, sz * 0.5, 0x4c5259, { rough: 0.5, metal: 0.7, seg: 14 })
            .rotation.x = Math.PI / 2;
        }
        box(c, 0.36, 0.17, 0.2, sx * 1.12, 0.6, 0, 0x50575e, { rough: 0.55, metal: 0.6 });
      }
      return c;
    }

    // The consist the box controls: a locomotive and one car, shoving east into
    // the track toward the car already standing in it.
    const consist = group(g);
    freightCar(consist, -0.5, -1.5, 0x2f6f4a, "SCX 214408");
    const loco = group(consist, -2.85, 0, -1.5);
    box(loco, 2.6, 0.24, 1.56, 0, 0.58, 0, 0x2b3138, { rough: 0.7, metal: 0.45 });
    box(loco, 2.62, 0.07, 1.74, 0, 0.73, 0, 0x5b636b, { rough: 0.8, metal: 0.3 });
    // The striped end platforms every switcher carries, so the locomotive is
    // not one dark mass at the end of the cut.
    for (const sx of [-1, 1]) {
      decal(loco, 0.34, 1.7, sx * 1.29, 0.78, 0, (cx, w, h) => {
        cx.fillStyle = "#1b1e22"; cx.fillRect(0, 0, w, h);
        cx.fillStyle = "#f2c14b";
        for (let i = -6; i < 14; i++) {
          cx.save(); cx.beginPath();
          cx.moveTo(i * (w / 6), 0); cx.lineTo(i * (w / 6) + w / 12, 0);
          cx.lineTo(i * (w / 6) + w / 12 - h, h); cx.lineTo(i * (w / 6) - h, h);
          cx.closePath(); cx.fill(); cx.restore();
        }
      }, { px: 256, rough: 0.8 }).rotation.x = -Math.PI / 2;
    }
    box(loco, 1.5, 0.98, 1.14, -0.42, 1.26, 0, 0x2f3841, { rough: 0.6, metal: 0.4, finish: "painted", tile: [3, 2] });
    box(loco, 0.78, 1.18, 1.3, 0.62, 1.36, 0, 0x2f3841, { rough: 0.6, metal: 0.4, finish: "painted", tile: [2, 2] });
    box(loco, 0.52, 0.66, 1.1, 1.2, 1.1, 0, 0x2f3841, { rough: 0.6, metal: 0.4 });
    for (const sz of [-1, 1]) {
      decal(loco, 0.52, 0.3, 0.62, 1.62, sz * 0.655, signFace("2YRC", { bg: "#101820", accent: "#4a90e2", fg: "#cfe6ff", scale: 0.6 }), { px: 192, glow: true, ei: 0.6 });
      cyl(loco, 0.02, 0.02, 2.5, 0, 1.0, sz * 0.84, 0xd8dce0, { rough: 0.45, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
      box(loco, 0.72, 0.3, 1.18, sz * 0.86, 0.36, 0, 0x22272d, { rough: 0.9 });
      for (const sx of [-1, 1]) {
        cyl(loco, 0.26, 0.26, 0.09, sz * 0.86, 0.32, sx * 0.52, 0x4c5259, { rough: 0.5, metal: 0.7, seg: 14 })
          .rotation.x = Math.PI / 2;
      }
    }
    decal(loco, 1.24, 0.17, -0.42, 0.96, 0.58, signFace("REMOTE CONTROL LOCOMOTIVE", {
      bg: "#14202c", accent: "#4a90e2", fg: "#cfe6ff", scale: 0.62,
    }), { px: 384, glow: true, ei: 0.6 });
    // The flashing blue light that says a locomotive is under remote control.
    const rcLight = ownMaterial(ball(loco, 0.075, 0.62, 2.06, 0, 0x4a90e2, { emissive: 0x4a90e2, ei: 2.4, rough: 0.3 }));
    cyl(loco, 0.05, 0.06, 0.12, 0.62, 1.99, 0, 0x22272d, { rough: 0.7, seg: 10 });
    holoTag(loco, "RCL unit — under your control", 0, 2.55, 0, { css: "#4a90e2", w: 0.5 });

    const linkBox = group(loco, -0.22, 0.92, 0.8);
    box(linkBox, 0.26, 0.2, 0.14, 0, 0, 0, 0x50575e, { rough: 0.5, metal: 0.5, finish: "painted", tile: [1, 1] });
    cyl(linkBox, 0.008, 0.008, 0.36, 0.09, 0.26, 0, 0xc0c6cc, { rough: 0.4, metal: 0.8, seg: 6 });
    const linkLamp = ball(linkBox, 0.018, -0.07, 0.03, 0.08, 0xf0645b, { emissive: 0xf0645b, ei: 2.4 });
    holoTag(loco, "Link the box", -0.22, 1.3, 0.8, { css: "#4a90e2", w: 0.26 });
    reg(hits, linkBox, "ocu-link");

    const brakeGauge = instrument(loco, -1.1, 0.88, 0.76, { ry: -0.5, idle: "-- psi", color: 0x4a90e2 });
    holoTag(brakeGauge, "Brake pipe", 0, 0.17, 0, { css: "#4a90e2", w: 0.26 });
    reg(hits, brakeGauge, "brake-gauge");

    // The drawbar between the locomotive and the car — the short cut across.
    const drawbar = box(consist, 0.36, 0.2, 0.26, -1.52, 0.6, -1.5, 0x5b6269, { rough: 0.6, metal: 0.5 });
    holoTag(consist, "Climb over the drawbar?", -1.52, 1.1, -1.5, { css: "#f0645b", w: 0.44 });
    reg(hits, drawbar, "over-the-coupler");

    // The side ladder on the moving car.
    const sideLadder = group(consist, -1.32, 0, -0.78);
    for (const dy of [0.55, 0.9, 1.25, 1.6]) box(sideLadder, 0.3, 0.03, 0.03, 0, dy, 0, 0xc0c6cc, { rough: 0.5, metal: 0.7 });
    for (const sx of [-1, 1]) cyl(sideLadder, 0.016, 0.016, 1.2, sx * 0.15, 1.08, 0, 0xc0c6cc, { rough: 0.5, metal: 0.7, seg: 6 });
    holoTag(consist, "Ride it down the track?", -1.32, 2.0, -0.78, { css: "#f0645b", w: 0.42 });
    reg(hits, sideLadder, "ride-the-shove");

    // The car already standing in the track: what the shove is going to couple
    // to, and what gets tied down and left.
    freightCar(g, 2.5, -1.5, 0x8c4a3a, "SCX 771260");
    const coupleSeat = box(g, 0.34, 0.3, 0.32, 1.5, 0.6, -1.5, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    hits["coupler-seat"] = coupleSeat;
    const betweenTrap = box(g, 0.66, 1.5, 1.0, 0.95, 0.85, -1.5, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Step in between?", 0.95, 2.62, -1.5, { css: "#f0645b", w: 0.34 });
    reg(hits, betweenTrap, "between-cars");

    // Hand brake on the far end of the standing car.
    const handbrake = group(g, 3.64, 1.46, -1.06);
    const hbWheel = torus(handbrake, 0.19, 0.022, 0, 0, 0, 0xd8dce0, { rough: 0.5, metal: 0.7, seg: 6, seg2: 20 });
    hbWheel.rotation.y = Math.PI / 2;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const spoke = box(handbrake, 0.02, 0.36, 0.02, 0, 0, 0, 0xd8dce0, { rough: 0.5, metal: 0.7, cast: false });
      spoke.rotation.x = a;
    }
    cyl(handbrake, 0.02, 0.02, 0.26, -0.13, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(g, "Hand brake", 3.64, 1.86, -1.06, { css: "#4a90e2", w: 0.26 });
    reg(hits, handbrake, "handbrake-wheel");
    const brakeChain = box(g, 0.03, 0.62, 0.03, 3.58, 1.0, -1.06, 0x6b7279, { rough: 0.8, metal: 0.5 });

    // Walk-round finds.
    const hose = group(g, 3.58, 0, -1.24);
    const hoseArm = cyl(hose, 0.032, 0.032, 0.62, 0, 0.36, 0, 0x22262b, { rough: 0.9, seg: 8 });
    hoseArm.rotation.z = 0.7;
    cyl(hose, 0.042, 0.042, 0.08, -0.2, 0.1, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(g, "Trainline hose", 3.58, 0.82, -1.24, { css: "#bfeaf7", w: 0.3 });
    reg(hits, hose, "dragging-hose");
    const grab = box(g, 0.04, 0.04, 0.42, 1.62, 1.26, -0.78, 0xb0b7bd, { rough: 0.55, metal: 0.6 });
    grab.rotation.x = 0.28;
    holoTag(g, "Corner handhold", 1.62, 1.58, -0.78, { css: "#bfeaf7", w: 0.32 });
    reg(hits, grab, "loose-handhold");

    // The cut standing on the adjacent track, and the blind spot behind it.
    function parkedCar(x, z, color) {
      const c = group(g, x, 0, z);
      box(c, 2.0, 0.2, 1.5, 0, 0.62, 0, 0x3a4048, { rough: 0.85, metal: 0.3 });
      box(c, 2.0, 1.5, 1.44, 0, 1.5, 0, color, { rough: 0.8, metal: 0.2, finish: "painted", tile: [4, 3] });
      box(c, 2.08, 0.1, 1.52, 0, 2.3, 0, 0x5d646b, { rough: 0.7, metal: 0.4 });
      for (const sx of [-1, 1]) box(c, 0.72, 0.3, 1.1, sx * 0.66, 0.36, 0, 0x22272d, { rough: 0.9 });
      return c;
    }
    parkedCar(-1.1, -4.2, 0x5a5f66);
    parkedCar(1.5, -4.2, 0x7a5232);
    const blindTrap = box(g, 1.5, 1.8, 0.9, 0.2, 1.0, -3.1, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Shove on without seeing it?", 0.2, 2.3, -3.1, { css: "#f0645b", w: 0.48 });
    reg(hits, blindTrap, "lost-sight");

    // ------------------------------------------------------------- the ground
    // The point: where the operator stands so the leading end stays in sight.
    const pointPick = box(g, 0.8, 1.7, 0.8, 1.25, 0.85, 0.05, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    for (let i = 0; i < 3; i++) {
      box(g, 0.22, 0.008, 0.06, 1.05 + i * 0.2, 0.01, 0.05, RCL_ACCENT,
        { emissive: RCL_ACCENT, ei: 1.6, cast: false });
    }
    holoTag(g, "The point — leading end in sight", 1.25, 1.94, 0.05, { css: "#4a90e2", w: 0.54 });
    reg(hits, pointPick, "point-position");

    // The blue signal. It starts stowed in its bracket and goes up by hand.
    const blueSignal = group(g, 2.35, 0, -0.5);
    cyl(blueSignal, 0.024, 0.03, 1.1, 0, 0.55, 0, 0xb0b7bd, { rough: 0.5, metal: 0.6, seg: 8 });
    box(blueSignal, 0.3, 0.22, 0.02, 0.17, 0.98, 0, 0x2f6fd8, { rough: 0.6, finish: "painted", tile: [1, 1] });
    const blueLamp = ball(blueSignal, 0.05, 0, 1.16, 0, 0x2f6fd8, { emissive: 0x2f6fd8, ei: 2.6, rough: 0.3 });
    blueSignal.rotation.z = 1.42;
    holoTag(g, "Blue signal — yours", 2.35, 1.42, -0.5, { css: "#4a90e2", w: 0.36 });
    reg(hits, blueSignal, "blue-signal");

    // The spare knuckle, lying where the carman dropped it off.
    const knuckle = group(g, 3.0, 0, 0.15);
    box(knuckle, 0.3, 0.2, 0.19, 0, 0.1, 0, 0x6b7279, { rough: 0.7, metal: 0.5, finish: "rust" });
    box(knuckle, 0.14, 0.14, 0.12, 0.2, 0.13, 0.03, 0x6b7279, { rough: 0.7, metal: 0.5 });
    holoTag(g, "Spare knuckle", 3.0, 0.42, 0.15, { css: "#4a90e2", w: 0.28 });
    reg(hits, knuckle, "knuckle");

    // Hand switch at the east end, and the clearance point between the tracks.
    const switchBase = group(g, 4.1, 0, -2.45);
    box(switchBase, 0.42, 0.1, 0.34, 0, 0.05, 0, 0x3a4048, { rough: 0.9, metal: 0.3 });
    cyl(switchBase, 0.045, 0.055, 0.78, 0, 0.44, 0, 0x6b7279, { rough: 0.6, metal: 0.5, seg: 10 });
    const switchLever = group(switchBase, 0, 0.84, 0);
    box(switchLever, 0.12, 0.09, 0.42, 0, 0, 0.19, 0xf2a23b, { rough: 0.55, finish: "painted", tile: [1, 1] });
    const switchTarget = decal(switchLever, 0.24, 0.2, 0, 0.2, 0,
      signFace("NORMAL", { bg: "#1b2026", accent: "#f2a23b", fg: "#ffd9a8", scale: 0.4 }), { px: 192, glow: true, ei: 0.6 });
    holoTag(switchBase, "Hand switch", 0, 1.22, 0, { css: "#f2a23b", w: 0.28 });
    reg(hits, switchLever, "switch-stand");
    const pointRail = box(g, 1.3, 0.1, 0.06, 3.5, 0.22, -2.05, 0x9aa1a8, { rough: 0.3, metal: 0.75 });

    const clearMark = group(g, 3.4, 0, -2.9);
    cyl(clearMark, 0.03, 0.035, 0.5, 0, 0.25, 0, 0xb0b7bd, { rough: 0.5, metal: 0.6, seg: 8 });
    const clearPlate = decal(clearMark, 0.28, 0.18, 0, 0.55, 0.02,
      signFace("CLEARANCE\nPOINT", { bg: "#f2f2f2", accent: "#2f6fd8", fg: "#1b1e22", scale: 0.28 }), { px: 192 });
    for (let i = 0; i < 4; i++) box(clearMark, 0.2, 0.01, 0.2, 0, 0.005, -0.25 - i * 0.22, 0xf2f2f2, { cast: false });
    holoTag(clearMark, "Clearance point", 0, 0.82, 0, { css: "#4a90e2", w: 0.32 });
    reg(hits, clearMark, "clearance-point");

    // ------------------------------------------------------------- the box
    // The operator control unit on its charging stand, with the controls the
    // whole job is worked through.
    const ocu = group(g, -1.0, 0, 1.15, -0.4);
    box(ocu, 0.4, 0.06, 0.4, 0, 0.03, 0, 0x3a4048, { rough: 0.85, metal: 0.3 });
    cyl(ocu, 0.045, 0.055, 1.0, 0, 0.5, 0, 0x6b7279, { rough: 0.6, metal: 0.5, seg: 10 });
    slab(ocu, 0.38, 0.2, 0.16, 0, 1.06, 0, 0x22272d, { radius: 0.02, rough: 0.6 });
    const ocuVest = box(ocu, 0.34, 0.26, 0.11, 0, 1.52, -0.02, 0xf2a23b, { rough: 0.8, finish: "rubber", tile: [1, 1] });
    box(ocu, 0.06, 0.3, 0.05, 0, 1.52, 0.05, 0x2b3138, { rough: 0.85 });
    holoTag(ocu, "OCU and harness", 0, 1.76, 0, { css: "#f2a23b", w: 0.34 });
    reg(hits, ocuVest, "ocu-vest");

    const throttle = cyl(ocu, 0.058, 0.058, 0.05, 0.11, 1.18, 0.03, 0x4a90e2,
      { rough: 0.5, emissive: 0x4a90e2, ei: 0.7, seg: 12 });
    holoTag(ocu, "Speed selector", 0.18, 1.34, 0.08, { css: "#4a90e2", w: 0.32 });
    reg(hits, throttle, "ocu-throttle");
    const stopBtn = cyl(ocu, 0.052, 0.058, 0.045, -0.12, 1.18, 0.03, 0xf0645b,
      { rough: 0.4, emissive: 0xf0645b, ei: 1.4, seg: 12 });
    holoTag(ocu, "Stop", -0.2, 1.34, 0.08, { css: "#f0645b", w: 0.16 });
    reg(hits, stopBtn, "stop-button");
    const threeStep = box(ocu, 0.08, 0.035, 0.05, 0, 1.19, 0.05, 0x2f6fd8,
      { rough: 0.5, emissive: 0x2f6fd8, ei: 0.8 });
    holoTag(ocu, "Three-step", 0.0, 0.9, 0.12, { css: "#2f6fd8", w: 0.28 });
    reg(hits, threeStep, "three-step-button");
    const tiltUnit = box(ocu, 0.09, 0.06, 0.05, -0.14, 1.04, -0.07, 0x59636d, { rough: 0.6, metal: 0.4 });
    const tiltLamp = ball(ocu, 0.014, -0.14, 1.09, -0.07, 0xf2c14b, { emissive: 0xf2c14b, ei: 2.0 });
    holoTag(ocu, "Tilt and vigilance", -0.2, 0.74, -0.04, { css: "#f2c14b", w: 0.36 });
    reg(hits, tiltUnit, "ocu-tilt");

    const speedDisplay = instrument(ocu, 0.11, 1.26, -0.18, { ry: 0, idle: "-- mph", color: 0x4a90e2 });
    holoTag(ocu, "Speed", 0.11, 1.42, -0.18, { css: "#4a90e2", w: 0.18 });
    reg(hits, speedDisplay, "speed-display");
    const effortGauge = instrument(ocu, -0.13, 1.26, -0.18, { ry: 0, idle: "-- k lb", color: 0x59c97b });
    holoTag(ocu, "Load meter", -0.13, 1.42, -0.18, { css: "#59c97b", w: 0.26 });
    reg(hits, effortGauge, "effort-gauge");

    // ------------------------------------------------------- paperwork and crew
    const briefing = holoPanel(g, 0.64, 0.46, -3.4, 1.62, 1.0, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4a90e2"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SWITCH LIST · JOB 2Y · RCL ZONE", w * 0.06, h * 0.13);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.125)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("SHOVE TWO EAST INTO TRACK 7", w * 0.06, h * 0.3);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Operator on the ground — point protection",
       "Shove speed: half the range of vision",
       "Couple at coupling speed, no harder",
       "Blue signal: yours up, yours down",
       "Three-step before anyone fouls equipment",
       "Secure with hand brakes, then pull against them",
       "Leave the cut in the clear of Track 8"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.44 + i * h * 0.078));
    }, { ry: 0.6, accent: RCL_ACCENT });
    reg(hits, briefing, "job-briefing");

    const crewMate = standingFigure(g, -4.7, 0.1, { ry: 1.6, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(g, "Foreman", -4.7, 2.14, 0.1, { css: "#f2c14b", w: 0.2 });
    const yardHand = standingFigure(g, 4.2, -3.9, { ry: 2.4, cloth: 0x2b3138, vest: 0xf2894b, helmet: 0xf2f2f2 });

    cone(g, -2.3, 2.0, { color: 0xf2a23b });
    cone(g, 2.5, 2.0, { color: 0xf2a23b });

    const exhaust = particles(loco, 20, 0x9aa4ad, { size: 0.045, life: 0.9, additive: false, opacity: 0.28 });
    exhaust.position.set(-0.42, 1.8, 0);

    let fouled = 0, moving = false, secured = false;

    return {
      hits,
      footprint: 2.4,

      onStepComplete(step) {
        if (step.id === "link-up") {
          ocuVest.visible = false;
          linkLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.4 });
          tiltLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0 });
        }
        if (step.id === "brake-check") {
          repaint(brakeGauge.userData.screen, signFace("SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#bff7d4", scale: 0.6 }));
        }
        if (step.id === "shove") { moving = false; consist.position.x += 0.55; }
        if (step.id === "line-switch") {
          pointRail.position.z = -1.95;
          repaint(switchTarget, signFace("REVERSE", { bg: "#1b2026", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
        }
        if (step.id === "couple") {
          consist.position.x += 0.42;
          repaint(speedDisplay.userData.screen, signFace("JOINT", { bg: "#0d1c24", accent: "#59c97b", fg: "#bff7d4", scale: 0.6 }));
        }
        if (step.id === "protection") {
          threeStep.material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 1.6 });
        }
        if (step.id === "blue-signal") { blueSignal.rotation.z = 0; }
        if (step.id === "knuckle") {
          knuckle.position.set(1.5, 0.52, -1.5);
          knuckle.rotation.y = 1.57;
        }
        if (step.id === "handbrake") { brakeChain.scale.y = 0.55; brakeChain.position.y = 0.86; }
        if (step.id === "tug-test") {
          secured = true;
          repaint(effortGauge.userData.screen, signFace("HELD", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.6 }));
        }
        if (step.id === "clear-point") {
          repaint(clearPlate, signFace("IN THE\nCLEAR", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.28 }));
        }
        if (step.id === "walk") { hoseArm.material = mat(0x59c97b, { rough: 0.8 }); }
        if (step.id === "blue-clear") {
          blueSignal.rotation.z = 1.42;
          blueLamp.material = mat(0x59636d, { rough: 0.5 });
          repaint(briefing.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eaf6fb";
            cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("TRACK 7 — CUT SECURED", w / 2, h * 0.38);
            cx.fillStyle = "#bcd6e2";
            cx.font = `${Math.round(h * 0.095)}px Arial, sans-serif`;
            cx.fillText("Hand brakes on and tested · in the clear · blue signal down", w / 2, h * 0.66);
          });
        }
      },

      // The carman really walks into the gauge, and the blue signal really ends
      // up on the ballast.
      onInterrupt(it) {
        if (it.id === "point-fouled") {
          fouled = 1;
          yardHand.position.set(1.05, 0, -1.5);
          yardHand.rotation.y = 1.2;
          rcLight.material.emissive.set(0xf0645b);
        }
        if (it.id === "blue-lifted") {
          blueSignal.rotation.z = 1.5;
          blueSignal.position.set(2.5, 0.04, -0.62);
          blueLamp.material = mat(0x59636d, { rough: 0.5 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "point-fouled") {
          fouled = 0;
          yardHand.position.set(4.2, 0, -3.9);
          yardHand.rotation.y = 2.4;
          rcLight.material.emissive.set(0x4a90e2);
        }
        if (it.id === "blue-lifted") {
          blueSignal.rotation.z = 0;
          blueSignal.position.set(2.35, 0, -0.5);
          blueLamp.material = mat(0x2f6fd8, { emissive: 0x2f6fd8, ei: 2.6 });
        }
      },

      onHazard(hitId) {
        if (hitId === "lost-sight" || hitId === "ride-the-shove") fouled = Math.max(fouled, 0.6);
      },

      animate(t, dt, session) {
        // The blue light on the cab is the yard's warning that this locomotive
        // answers a box on somebody's chest rather than a hand in the cab.
        rcLight.material.emissiveIntensity = 1.4 + Math.max(0, Math.sin(t * 3.4)) * (1.4 + fouled * 2.2);
        exhaust.visible = true;
        exhaust.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.08, 0.35, 0.25);
        crewMate.userData.head.rotation.y = Math.sin(t * 0.5) * 0.4;
        yardHand.userData.head.rotation.y = Math.sin(t * 0.7 + 1.1) * 0.5;

        moving = session?.step?.id === "shove";
        const tr = session?.track;
        if (moving && tr) {
          repaint(speedDisplay.userData.screen, signFace(`${(tr.v * 12).toFixed(1)}`, {
            bg: "#0d1c24", accent: tr.v >= 0.16 && tr.v <= 0.36 ? "#59c97b" : "#f0645b", fg: "#cfe6ff", scale: 0.58,
          }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "brake-check") {
          repaint(brakeGauge.userData.screen, signFace(`${Math.round(gg.t * 110)}`, {
            bg: "#0d1c24", accent: gg.t > 0.54 && gg.t < 0.8 ? "#59c97b" : "#f0645b", fg: "#cfe6ff", scale: 0.58,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "couple") {
          repaint(speedDisplay.userData.screen, signFace(`${(gg.t * 10).toFixed(1)}`, {
            bg: "#0d1c24", accent: gg.t < 0.36 ? "#59c97b" : "#f0645b", fg: "#cfe6ff", scale: 0.58,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "tug-test") {
          repaint(effortGauge.userData.screen, signFace(`${Math.round(gg.t * 40)}`, {
            bg: "#0d1c14", accent: gg.t > 0.42 && gg.t < 0.68 ? "#59c97b" : "#f2c14b", fg: "#bff7d4", scale: 0.58,
          }));
        }
        void secured;
      },
    };
  },
};
