import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, blockFace, corrugatedFace, safetyStripeFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ammonia Leak Alarm Response, Cold Plant VR — Culinary &
// Hospitality, grocery pack (gr-), station seven. A grocery's central
// ammonia refrigeration plant, the machine room that keeps every walk-in
// and freezer in the building cold, and the one procedure this station
// teaches: when that alarm sounds, the plan is to evacuate, muster and wait
// for authorized responders — never to go back in and check for yourself.
// No concentration, exposure limit or clause number is stated as fact here;
// the plan is what a plant actually posts, cited only by name. The union is
// named only as a training body.

const GR7_ACCENT = 0xf2ae14;

export const SIM_GR_AMMONIA_LEAK_ALARM_RESPONSE_COLD_PLANT = {
  id: "gr-ammonia-leak-alarm-response-cold-plant",
  index: "gr-7",
  domain: "Grocery cold plant / ammonia refrigeration",
  trade: "Grocery engineering / refrigeration technician",
  category: "Culinary & Hospitality",
  indoor: "plant",
  certification: "UFCW member training for retail food and engineering work; ASHRAE 15 safety standard for refrigeration systems; IIAR 2 safe design of closed-circuit ammonia refrigeration systems; IIAR 6 inspection, testing and maintenance of closed-circuit ammonia refrigeration systems; OSHA 29 CFR 1910.119 process safety management of highly hazardous chemicals; OSHA 29 CFR 1910.38 emergency action plans; NFPA 101 Life Safety Code egress requirements",
  name: "Ammonia Leak Alarm Response, Cold Plant",
  title: simTitle("Ammonia Leak Alarm Response, Cold Plant"),
  tagline: "The alarm read, the machine room left and sealed behind you, the muster point reached on the marked route, and nobody going back in until the plan's own all-clear",
  accent: GR7_ACCENT,
  accentCss: "#f2ae14",
  parSeconds: 260,
  footprint: 2.8,
  badge: { id: "clean-evac", name: "Clean Evacuation", note: "Every zone out, mustered and accounted for with nobody going back in before the plan's own all-clear" },

  game: system({
    name: "Cold Plant Authority",
    currency: "MUSTER",
    ranks: ["Plant Trainee", "Plant Engineer", "Lead Engineer", "Plant Supervisor", "Cold Plant Authority Certified"],
    badges: [
      { id: "out-first", name: "Out First", note: "Left the machine room before anything else was attempted", test: AWARD.stepClean("close-door-behind") },
      { id: "no-reentry", name: "No Reentry", note: "Never went back in and never reached for the alarm panel", test: AWARD.safe },
      { id: "steady-muster", name: "Steady Muster", note: "Reached the muster point at a steady, controlled pace every time", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-response", name: "Clean Response", note: "No corrections through the whole evacuation", test: AWARD.clean },
      { id: "held-the-hold", name: "Held The Hold", note: "Never left the muster point early", test: AWARD.unbroken },
      { id: "muster-fast", name: "Mustered Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reenter-for-belongings": "You're heading back in for a phone left on the bench. Nothing left inside that machine room is worth a single step back through that door once the alarm has sounded — the plan does not have an exception for a quick grab.",
    "prop-door-open": "You wedged the machine room door open instead of letting it swing shut behind you. A door left open behind an ammonia leak is the leak's own path into the rest of the building, spreading past the one room built to contain it.",
    "wrong-way-approach": "You're walking back toward the machine room instead of continuing to muster. Every step back toward a room you just evacuated is a step the plan already told you not to take — the muster point is the only direction that matters right now.",
    "silence-alarm-panel": "You reached to silence the alarm panel yourself. That panel is exactly what tells an arriving responder which zone still needs attention — silencing it because it's loud and inconvenient erases the one piece of information they're arriving to use.",
  },

  lateNotes: {
    "machine-room-door": "This gets closed behind you on your way out, not opened again once you're clear of it.",
    "alarm-panel": "This gets read once, on your way out — it does not get touched again after that.",
  },

  steps: [
    {
      id: "alarm-panel", kind: "select", target: "alarm-panel",
      title: "Read the alarm annunciator",
      cue: "Check the annunciator panel to see which zone tripped the ammonia alarm.",
      why: "The panel is the first fact this whole response runs on — which zone tripped tells the plan's own muster and headcount who was actually in the affected area, and it's read once, on the way out, not investigated up close.",
    },
    {
      id: "evac-decision", kind: "select", target: "evac-signage",
      title: "Commit to evacuate, not investigate",
      cue: "Confirm the call: leave the machine room now, per the plant's own emergency plan.",
      why: "The plan does not ask an engineer to confirm the leak by smell, by sound or by looking for it — it asks for an immediate evacuation the moment the alarm sounds, because the alternative is one person's judgment standing in for a plan built by people who were not standing in the room when it went off.",
    },
    {
      id: "close-door-behind", kind: "drag", target: "machine-room-door",
      title: "Close the machine room door behind you",
      cue: "Pull the door shut behind you as you leave, rather than leaving it open.",
      why: "A door pulled shut behind you is the plant's own first layer of containment — it keeps whatever is in that room in that room for the minutes it takes a responder to actually arrive.",
      drag: { to: "door-frame", radius: 0.3, missNote: "Not fully shut — the door has to close behind you, not swing open again on its own." },
    },
    {
      id: "hazard-en-route", kind: "find", noHint: true,
      targets: ["unlatched-window", "dead-detector"],
      itemNames: { "unlatched-window": "an unlatched machine-room window", "dead-detector": "a portable gas detector with a dead battery" },
      itemNotes: {
        "unlatched-window": "This machine-room window is unlatched, swinging slightly. An unlatched opening on your way past is worth reporting to whoever handles the room after you — it's one more path out of a room the door alone was supposed to seal.",
        "dead-detector": "This portable gas detector's battery indicator is dead. A detector nobody can trust is a detector that isn't actually monitoring anything — it gets reported and swapped, not carried on believing it works.",
      },
      decoyNotes: { "working-detector": "This detector's battery indicator reads healthy and current. Leave it." },
      title: "Notice two things on your way out",
      cue: "Two things along your evacuation route are worth reporting. Find them without stopping.",
      why: "Evacuating is not the same as evacuating with your eyes closed — noticing what's wrong on the way out, without stopping to fix any of it, is what gives the responders arriving behind you a fuller picture than the alarm alone gives them.",
    },
    {
      id: "check-wind-sock", kind: "gauge", target: "wind-sock",
      title: "Check the wind indicator before mustering",
      cue: "Read the wind sock and commit once your route to muster is upwind of the plant.",
      why: "Ammonia is lighter than air and disperses with the wind, so the muster point the plan posted only does its job if you actually approach it from upwind — the sock is what confirms that before you commit to a route, not after you're already standing in the wrong spot.",
      gauge: { label: "WIND DIRECTION", speed: 0.55, green: [0.3, 0.7], readout: (t) => (t < 0.3 ? "muster route downwind" : t > 0.7 ? "muster route downwind" : "muster route upwind"), missNote: "That route reads downwind of the plant — hold for the sock to confirm an upwind path before you commit to it." },
    },
    {
      id: "move-to-muster", kind: "track", target: "evac-route", seconds: 6,
      title: "Move to the muster point on the marked route",
      cue: "Walk briskly on the marked route — not a run, not a stroll — the whole way to muster.",
      why: "A run risks a fall on a route other people are also using; a stroll leaves you and everyone behind you closer to the affected zone longer than the plan intends. A steady, brisk pace on the marked route is what the plan is actually asking for.",
      track: {
        start: 0.1, green: [0.4, 0.65], rise: 0.5, fall: 0.42, drift: 0.1, label: "EVACUATION PACE",
        readout: (v) => (v < 0.4 ? "too slow — closer to the zone longer" : v > 0.65 ? "too fast — risking a fall on the route" : "steady evacuation pace"),
      },
      holdBreakNote: "Out of the steady band — settle your pace before you either fall or spend longer than you need to near the affected zone.",
    },
    {
      id: "headcount-board", kind: "select", target: "headcount-board",
      title: "Check in at the muster roster",
      cue: "Mark yourself present on the muster point's roster board.",
      why: "A muster point only proves everyone is out once every name on the shift roster is actually accounted for — the board is what turns \"I think everyone made it\" into a fact somebody can act on.",
    },
    {
      id: "await-all-clear", kind: "hold", target: "muster-flagpole", seconds: 6,
      title: "Hold your position at muster",
      cue: "Stay at the muster point and hold until authorized personnel give the all-clear.",
      why: "The muster point does its job only if people actually stay there — drifting off to check on the building, your car or anything else is exactly the gap that turns a clean headcount back into an unaccounted-for name.",
      holdBreakNote: "You left the muster point before the all-clear. Return and hold — a headcount with somebody wandering off is a headcount nobody can actually trust.",
    },
    {
      id: "notify-dispatch", kind: "select", target: "muster-radio",
      title: "Notify the plant's emergency dispatch",
      cue: "Call the plant's posted emergency contact and report the zone and the headcount.",
      why: "Dispatch is the plan's own link to the responders who are actually equipped and trained to go back into that room — a call now with the zone and the headcount already in hand gets them moving with the facts, not guessing at them on arrival.",
    },
    {
      id: "raise-muster-flag", kind: "turn", target: "muster-flagpole",
      title: "Raise the zone-mustered flag",
      cue: "Turn the flagpole crank to raise the flag showing your zone has fully mustered.",
      why: "A raised flag is a fact a responder can see from across the lot without asking — it's the plan's own way of telling everyone arriving which zones are already accounted for and which still need a headcount taken.",
      turn: { turns: 0.6, axis: "y", label: "MUSTER FLAG" },
    },
    {
      id: "confirm-no-reentry", kind: "select", target: "emergency-plan-poster",
      title: "Confirm the plan: no reentry before the all-clear",
      cue: "Read the posted plan and confirm what it asks: nobody goes back in until authorized personnel say so.",
      why: "This is the one rule the entire response depends on — everything before this step only works if it's followed by nobody deciding, on their own judgment, that it's probably fine to go check.",
    },
    {
      id: "brief-responders", kind: "sequence",
      targets: ["point-entry", "hand-over-roster"],
      itemNames: { "point-entry": "point out the machine room entry", "hand-over-roster": "hand over the muster roster" },
      title: "Brief the responders on arrival",
      cue: "Point out the machine room entry first, then hand over the completed muster roster — in that order.",
      why: "A responder arriving needs to know where to go before they need the paperwork — pointing them to the entry first gets them moving toward the actual problem while the roster, handed over right behind it, tells them exactly who is already accounted for.",
      outOfOrderNote: "Wrong order — point them to the entry first, then hand over the roster once they're already moving toward it.",
    },
    {
      id: "sign-incident-log", kind: "select", target: "incident-log",
      title: "Sign the incident log",
      cue: "Sign the log once responders have things in hand, closing out your part of the response.",
      why: "The signature is your record of exactly what you did — read the panel, evacuated, mustered, notified — and it's the account a plant manager or an inspector reads afterward to understand how this response actually went.",
    },
  ],

  interrupts: [
    {
      id: "coworker-heads-back",
      kind: "Wrong direction",
      after: "close-door-behind", delay: 4, seconds: 12,
      alert: "A coworker just behind you has turned around and is jogging back toward the machine room door, saying they forgot to shut something off.",
      cue: "They're heading the wrong way — get them turned back toward muster.",
      target: "headcount-board",
      why: "Nothing behind that door is worth turning around for once the alarm has sounded, and a coworker who doesn't hear that from you in the moment is a coworker the muster roster is about to be missing a name for.",
      missNote: "They went back in before anyone stopped them. The muster roster now has a gap where their name should be, and the plan has no faster way to notice that gap than someone actually catching it before it happens.",
      wrongNote: "It's the muster roster — get them turned back toward it instead of the machine room door.",
    },
    {
      id: "bystander-reaches-panel",
      kind: "About to silence the alarm",
      after: "await-all-clear", delay: 3, seconds: 12,
      alert: "Someone unfamiliar with the plan has wandered up near the machine room and is reaching for the alarm panel to make the noise stop.",
      cue: "That panel is telling responders which zone still needs them — stop them before it goes quiet.",
      target: "emergency-plan-poster",
      why: "Pointing them at the posted plan instead of letting them touch that panel is what keeps the one piece of information responders are relying on intact — the alarm stops when authorized personnel clear the zone, not when somebody nearby finds it too loud.",
      missNote: "The panel went quiet before responders ever arrived. Whatever they find when they get there, the one signal that told them exactly where to go first is now gone.",
      wrongNote: "It's the posted plan — point them to it and get their hand off that panel.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GR7_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 6, cols: 10, block: 0x8b929a }), { repeat: 3, px: 512 });
    const floor = box(g, 6.8, 0.1, 6.0, 0, 0.05, 0, 0x8b929a, { rough: 0.75, metal: 0.1 });
    floor.material = texturedMat(floorTex, { rough: 0.75, metal: 0.1, color: 0x8b929a });

    const wallTex = surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, { colour: 0x9aa1a8, ribs: 14 }), { repeat: 3, px: 512 });
    const backWall = box(g, 6.8, 3.0, 0.14, 0, 1.5, -2.4, 0x9aa1a8, { rough: 0.5, metal: 0.5 });
    backWall.material = texturedMat(wallTex, { rough: 0.5, metal: 0.5, color: 0x9aa1a8 });

    const stripeTex = surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 3, px: 256 });
    const evacRoute = slab(g, 0.8, 0.005, 4.2, 1.4, 0.006, 0.4, 0xf2c14b, { rough: 0.7, cast: false });
    evacRoute.material = texturedMat(stripeTex, { rough: 0.75, color: 0xf2c14b });
    hits["evac-route"] = evacRoute;

    // ------------------------------------------------------------ machine room
    const machineRoom = group(g, -1.6, 0, -1.6);
    box(machineRoom, 2.4, 2.6, 1.8, 0, 1.3, 0, 0xb9bec4, { rough: 0.4, metal: 0.5 });
    // Ammonia compressor packages and vessels inside.
    cyl(machineRoom, 0.35, 0.35, 1.4, -0.6, 0.9, 0, 0xdfe4e8, { rough: 0.35, metal: 0.6, seg: 18 }).rotation.z = Math.PI / 2;
    cyl(machineRoom, 0.28, 0.28, 1.1, 0.4, 1.6, 0.3, 0xdfe4e8, { rough: 0.35, metal: 0.6, seg: 16 });
    box(machineRoom, 0.6, 0.5, 0.5, 0.5, 0.4, -0.4, 0x3c444c, { rough: 0.4, metal: 0.6 });
    holoTag(machineRoom, "ammonia machine room", 0, 2.5, 0, { css: "#f2ae14", w: 0.5 });

    const doorFrame = group(machineRoom, 1.0, 0, 0.9);
    box(doorFrame, 0.1, 2.1, 1.1, 0, 1.05, 0, 0x6d7379, { rough: 0.5, metal: 0.3 });
    hits["door-frame"] = doorFrame;
    const machineDoor = box(doorFrame, 0.06, 2.0, 0.9, 0, 1.0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    reg(hits, machineDoor, "machine-room-door");

    // Unlatched window and dead detector near the exit.
    const window = group(machineRoom, -0.8, 1.9, 0.91);
    box(window, 0.5, 0.4, 0.03, 0, 0, 0, 0x6cc6f0, { rough: 0.2, opacity: 0.6, transparent: true });
    reg(hits, window, "unlatched-window");
    const workingDetector = group(g, -0.6, 0, -0.3);
    box(workingDetector, 0.08, 0.14, 0.03, 0, 0.9, 0, 0x2b2f34, { rough: 0.5 });
    reg(hits, workingDetector, "working-detector");
    const deadDetector = group(g, -0.3, 0, -0.3);
    box(deadDetector, 0.08, 0.14, 0.03, 0, 0.9, 0, 0x2b2f34, { rough: 0.5 });
    decal(deadDetector, 0.06, 0.03, 0, 0.95, 0.02, signFace("LOW", { bg: "#2a1414", accent: "#f0645b", scale: 0.6 }));
    reg(hits, deadDetector, "dead-detector");

    // Alarm annunciator panel beside the door.
    const alarmPanel = group(g, -0.3, 0, -1.9);
    box(alarmPanel, 0.4, 0.5, 0.1, 0, 1.3, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const alarmLight = ball(alarmPanel, 0.05, 0, 1.5, 0.06, 0xf0645b, { rough: 0.4, emissive: 0xf0645b, ei: 1.8, seg: 14 });
    void alarmLight;
    decal(alarmPanel, 0.32, 0.1, 0, 1.15, 0.06, signFace("ZONE 2", { bg: "#1a1e22", accent: "#f0645b", scale: 0.5 }));
    reg(hits, alarmPanel, "alarm-panel");

    // Silence-panel hazard hotspot layered on the panel face.
    const silenceHotspot = box(alarmPanel, 0.1, 0.05, 0.02, 0, 1.05, 0.06, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, silenceHotspot, "silence-alarm-panel");

    // Reenter/prop-door/wrong-way hazard hotspots.
    const reenterZone = box(machineRoom, 0.4, 0.4, 0.3, -0.9, 1.0, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, reenterZone, "reenter-for-belongings");
    const doorWedge = box(doorFrame, 0.08, 0.04, 0.04, 0, 0.05, 0.45, 0xf2c14b, { rough: 0.6 });
    reg(hits, doorWedge, "prop-door-open");
    const wrongWayZone = box(g, 0.6, 0.5, 0.5, -0.6, 0.5, -0.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, wrongWayZone, "wrong-way-approach");

    // Evacuation signage.
    const evacSign = holoPanel(g, 0.5, 0.36, -1.0, 1.6, -0.6, (ctx, w, h) => {
      ctx.fillStyle = "#241a08"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#f2ae14"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffe9c2"; ctx.fillText("EVACUATE NOW", w * 0.08, h * 0.2);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#fff3e0";
      ["Do not investigate", "Close doors behind you", "Muster upwind"].forEach((l, i) => ctx.fillText(l, w * 0.08, h * (0.4 + i * 0.16)));
    }, { accent: GR7_ACCENT });
    reg(hits, evacSign, "evac-signage");

    // Wind sock on a pole near the route.
    const windPole = group(g, 0.9, 0, 0.6);
    cyl(windPole, 0.015, 0.015, 1.6, 0, 0.8, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    const windSock = cyl(windPole, 0.05, 0.02, 0.4, 0, 1.5, 0.2, 0xf2c14b, { rough: 0.6, seg: 12 });
    windSock.rotation.z = Math.PI / 2;
    reg(hits, windPole, "wind-sock");
    holoTag(windPole, "wind sock", 0, 1.75, 0, { css: "#f2ae14", w: 0.3 });

    // Muster point: flagpole, headcount board, radio, plan poster.
    const muster = group(g, 2.2, 0, 1.6);
    const flagpole = cyl(muster, 0.02, 0.02, 1.8, 0, 0.9, 0, 0x9aa1a8, { rough: 0.5, metal: 0.6, seg: 10 });
    const flag = box(muster, 0.3, 0.2, 0.01, 0.16, 1.6, 0, 0x59c97b, { rough: 0.6 });
    void flagpole;
    reg(hits, muster, "muster-flagpole");
    holoTag(muster, "muster point", 0, 2.0, 0, { css: "#59c97b", w: 0.34 });

    const headcountBoard = group(g, 2.6, 0, 1.1);
    slab(headcountBoard, 0.3, 0.02, 0.4, 0, 1.0, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(headcountBoard, 0.26, 0.34, 0, 1.011, 0.2, signFace("MUSTER ROLL", { bg: "#241408", accent: "#f2ae14", scale: 0.34 })).rotation.x = -Math.PI / 2;
    holoTag(headcountBoard, "headcount board", 0, 1.2, 0, { css: "#f2ae14", w: 0.36 });
    reg(hits, headcountBoard, "headcount-board");

    const musterRadio = instrument(g, 1.8, 0.9, 1.9, { idle: "CALL", color: GR7_ACCENT, w: 0.15, d: 0.1 });
    holoTag(musterRadio, "dispatch radio", 0, 0.16, 0, { css: "#f2ae14", w: 0.32 });
    reg(hits, musterRadio, "muster-radio");

    const planPoster = holoPanel(g, 0.5, 0.4, 2.6, 1.5, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "#081c24"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#f2ae14"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffe9c2"; ctx.fillText("EMERGENCY PLAN", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#fff3e0";
      ["Evacuate, don't investigate", "Muster, headcount, notify", "No reentry before all-clear"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.38 + i * 0.16)));
    }, { accent: GR7_ACCENT });
    reg(hits, planPoster, "emergency-plan-poster");

    const incidentLog = group(g, 3.0, 0, 0.8);
    slab(incidentLog, 0.24, 0.02, 0.32, 0, 0.92, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(incidentLog, 0.2, 0.26, 0, 0.93, 0.161, signFace("INCIDENT LOG", { bg: "#f4ecda", fg: "#241a08", accent: "#b8402f", scale: 0.4 })).rotation.x = -Math.PI / 2;
    holoTag(incidentLog, "incident log", 0, 1.1, 0, { css: "#f2ae14", w: 0.34 });
    reg(hits, incidentLog, "incident-log");

    const pointEntry = group(g, 3.2, 0, -0.6);
    cyl(pointEntry, 0.02, 0.02, 0.5, 0, 0.25, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    holoTag(pointEntry, "entry marker", 0, 0.5, 0, { css: "#f2ae14", w: 0.3 });
    reg(hits, pointEntry, "point-entry");
    const rosterHandoff = group(g, 3.2, 0, 1.2);
    box(rosterHandoff, 0.2, 0.02, 0.26, 0, 0.9, 0, 0xdfe4e8, { rough: 0.5 });
    reg(hits, rosterHandoff, "hand-over-roster");

    const engineer = standingFigure(g, 0.4, 0.6, { ry: 0.6, outfit: "kitchen" });
    void engineer;
    const coworker = group(g, -0.9, 0, 0.3);
    standingFigure(coworker, 0, 0, { ry: -2.2, outfit: "kitchen" });
    coworker.visible = false;
    const bystander = group(g, -0.6, 0, -1.5);
    standingFigure(bystander, 0, 0, { ry: 1.5, outfit: "kitchen" });
    bystander.visible = false;

    const responders = group(g, 3.6, 0, -0.1);
    standingFigure(responders, 0, 0, { ry: -1.2, outfit: "construction" });
    responders.visible = false;

    let raised = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.6, 1.1, -1.0),
      onStepComplete(step) {
        if (step.id === "close-door-behind") machineDoor.rotation.y = 0;
        if (step.id === "raise-muster-flag") raised = true;
        if (step.id === "brief-responders") responders.visible = true;
      },
      onInterrupt(it) {
        if (it.id === "coworker-heads-back") coworker.visible = true;
        if (it.id === "bystander-reaches-panel") bystander.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "coworker-heads-back") coworker.visible = false;
        if (it.id === "bystander-reaches-panel") bystander.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "check-wind-sock") {
          windSock.rotation.y = gg.t * Math.PI * 2;
        }
        if (session?.turn && step?.id === "raise-muster-flag") flag.position.y = 1.0 + session.turn.amount * 0.6;
        void raised; void t; void dt;
      },
    };
  },
};
