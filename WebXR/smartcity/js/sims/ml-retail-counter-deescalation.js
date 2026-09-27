import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument,
  surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { palette, tileFace, woodGrainFace, brickFace } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Retail Counter De-escalation VR — Postal & Mail Processing.
// A post office's retail counter mid-morning, and one customer whose
// frustration over a missing parcel is climbing. The retail clerk's own
// route off the counter known before the doors open, loose items cleared
// from the counter, the early cues noticed, distance kept, a calm script
// tried first with the clerk's own voice held low, the supervisor brought
// in, the facility's alarm used per its workplace-violence plan the moment
// the script stops working, the counter gate locked, other customers moved
// clear, and the incident logged with a debrief requested for the clerk.
//
// No threat, weapon or physical confrontation is staged. The facility's
// own written workplace-violence plan is the authority; no time, distance
// or procedure number is invented here.

const RCD_PAL = palette("postal");
const RCD_ACCENT = RCD_PAL.accent;
const RCD_CSS = "#2f6fb0";

function rcdBoard(ctx, w, h, title, lines, band = RCD_CSS) {
  ctx.fillStyle = "rgba(8,16,28,0.92)"; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = band; ctx.fillRect(0, 0, w, 5);
  ctx.fillStyle = "#e3eefa";
  ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(title, w * 0.06, h * 0.2);
  ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
  lines.forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.44 + i * 0.16)));
}

export const SIM_ML_RETAIL_COUNTER_DEESCALATION = {
  id: "ml-retail-counter-deescalation",
  index: "ml-8",
  domain: "Postal & Mail Processing",
  trade: "Retail counter clerk — an escalating customer at the window, APWU",
  category: "Mobility & Transit",
  indoor: "service",
  certification: "Cal/OSHA's workplace violence prevention standard, 8 CCR 3342, as the model for the facility's own written workplace-violence plan — the alarm, the reporting route and an honest incident log; the Injury and Illness Prevention Program, 8 CCR 3203; OSHA 29 CFR 1910.38 emergency action plans for moving people clear; Labor Code §6310 protection against retaliation for reporting; APWU training for retail counter clerks, as the training body",
  name: "Retail Counter De-escalation",
  title: simTitle("Retail Counter De-escalation"),
  tagline: "The clerk's own way off the counter known before the doors open, loose items cleared, the cues noticed early, distance kept, a calm script tried first, the supervisor and the facility's plan brought in the moment it stops working, and a debrief requested afterward",
  accent: RCD_ACCENT,
  accentCss: RCD_CSS,
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "window-steady", name: "Window Steady", note: "An escalating customer met with distance and a calm script, the supervisor and the plan brought in on time, and the incident logged with a debrief requested" },

  supportLine: "your employer's employee assistance program, or APWU's member resources — standing at a counter during an incident like this deserves its own debrief, not just a form",

  game: system({
    name: "Retail Window Standard",
    currency: "WINDOW",
    ranks: ["New Clerk", "Window Certified", "Lead Clerk", "Retail Supervisor", "De-escalation Certified"],
    badges: [
      { id: "counter-clear", name: "Counter Clear", note: "Loose items off the counter before they were within reach", test: AWARD.stepClean("clear-counter") },
      { id: "voice-held", name: "Voice Held", note: "Your own voice held low through the script", test: AWARD.stepClean("voice-level") },
      { id: "debrief-asked", name: "Debrief Asked", note: "The incident logged and a debrief actually requested", test: AWARD.stepClean("close-out") },
    ],
    challenges: [
      { id: "clean-window", name: "Clean Window", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-alarm", name: "Steady Alarm", note: "Held the alarm the full count, first try", test: AWARD.unbroken },
      { id: "prompt-window", name: "Prompt Window", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "grab-back-decoy": "A note on the counter: \"take the parcel back off them.\" Reaching across the counter to take something out of an angry customer's hands turns a verbal situation into a physical one in a single move. Whatever they're holding, it isn't worth the clerk's safety.",
    "follow-outside-decoy": "A card by the lobby door: \"follow them out for the plate number.\" Following an agitated customer out of the building takes the clerk away from the counter, the alarm and the supervisor, into a car park where the plan protects nobody. Descriptions are given from inside, afterward.",
    "block-doorway-decoy": "That floor marker puts the clerk in the lobby doorway, between the customer and the way out. Someone who feels cornered escalates; the customer's route out stays open, and the clerk's distance comes from the counter, not from blocking the exit.",
    "open-drawer-decoy": "The cash drawer is standing open at the window. An open drawer in front of an escalating customer adds a target to an argument that was about a parcel — it gets closed, quietly, as part of clearing the counter.",
  },

  lateNotes: {
    "duress-alarm": "Not yet — the calm script comes first. The alarm is for when that stops working, per the facility's plan.",
    "debrief-request": "Hold that — log the incident first, then ask for the debrief.",
  },

  steps: [
    {
      id: "exit-route", kind: "select", target: "counter-exit-path",
      title: "Know your own way off the counter",
      cue: "Before the doors open, confirm the path from your window to the back-room door is clear.",
      why: "A clerk behind a counter has one route away from the window, and it is only useful if it is clear before anything happens. Checking it at opening, when the lobby is empty, costs a glance; discovering a cage of parcels across it during an incident costs the one option the counter gives you.",
    },
    {
      id: "window-scan", kind: "find", noHint: true,
      targets: ["loose-scissors", "blocked-back-door"],
      itemNames: { "loose-scissors": "scissors left on the customer side of the counter", "blocked-back-door": "a parcel cage parked across the back-room door" },
      itemNotes: {
        "loose-scissors": "Anything loose on the customer's side of the counter is within reach of whoever is standing there. Scissors, tape guns and letter openers belong on the clerk's side, out of sight, before the first customer walks in.",
        "blocked-back-door": "The back-room door is the clerk's retreat and the supervisor's way in. A parcel cage across it turns both into a scramble; it gets moved now.",
      },
      title: "Scan the window before opening",
      cue: "Two things at this window would matter if a customer escalated. Find them.",
      why: "The written workplace-violence plan starts with the room: what is within reach, what blocks a retreat, what the clerk can see. Finding those at opening means the plan works as written on the day it is needed, rather than the day someone notices the counter no longer matches it.",
    },
    {
      id: "notice-cues", kind: "select", target: "customer-cues",
      title: "Notice the early cues",
      cue: "Notice the customer's rising voice, the pacing and the repeated demand — behaviour, not a diagnosis.",
      why: "Raised voices and pacing are signs that frustration is climbing, and noticing them early is what buys time to change the clerk's position and tone before the conversation becomes a confrontation. The clerk isn't judging the customer; they are reading the situation while there is still room to steer it.",
    },
    {
      id: "clear-counter", kind: "drag", target: "loose-items",
      title: "Clear the counter",
      cue: "Slide the loose items and the parcel scale tray into the under-counter bin, closing the drawer as you go.",
      why: "Clearing the counter quietly removes things that could be thrown or grabbed and gives the customer nothing extra to argue over. Doing it calmly, as part of ordinary tidying, avoids signalling alarm to a customer who is already on edge.",
      drag: { to: "under-counter-bin", radius: 0.4, missNote: "The items are still on the counter — anything within the customer's reach is still part of the situation." },
    },
    {
      id: "keep-distance", kind: "track", target: "counter-distance", seconds: 5,
      title: "Keep your distance from the counter edge",
      cue: "Stay back from the counter edge — out of arm's reach, still facing the customer, not turning away.",
      why: "Distance is the one protection the clerk controls completely. Standing back from the counter edge keeps the clerk out of reach without looking like a retreat, and staying square to the customer keeps the conversation going; turning away can read as dismissal and leaves the clerk unable to see what happens next.",
      track: { start: 0.5, green: [0.4, 0.6], rise: 0.5, fall: 0.5, drift: 0.12, label: "DISTANCE", readout: (v) => (v < 0.4 ? "within reach" : v > 0.6 ? "turning away" : "held") },
      holdBreakNote: "You drifted within reach of the counter edge or turned away — ease back to arm's length while still facing the customer.",
    },
    {
      id: "calm-script", kind: "sequence", anyOrder: false,
      targets: ["listen-card", "acknowledge-card", "option-card"],
      itemNames: { "listen-card": "listen without interrupting", "acknowledge-card": "acknowledge the problem out loud", "option-card": "offer a concrete next step" },
      title: "Try the calm script: listen, acknowledge, offer",
      cue: "Let the customer finish, acknowledge the missing parcel out loud, then offer a concrete next step such as a trace request.",
      why: "People escalate when they feel unheard. Letting the customer finish, then saying back what the problem is, shows the clerk understood before anything is offered; a concrete next step like a trace request gives the frustration somewhere to go that isn't the clerk.",
      outOfOrderNote: "Listen first, then acknowledge, then offer — an option offered before the customer feels heard sounds like being brushed off.",
    },
    {
      id: "voice-level", kind: "gauge", target: "voice-meter",
      title: "Hold your own voice low and slow",
      cue: "Watch your own voice level and commit when it's in the calm band — lower and slower than the customer's.",
      why: "The clerk's own tone is the one part of the exchange the clerk fully controls, and a lower, slower voice tends to pull the other person's pace down with it. Matching a raised voice, even to be heard, pushes the exchange up instead.",
      gauge: { label: "YOUR VOICE", speed: 0.6, green: [0.15, 0.45], readout: (t) => (t > 0.45 ? "matching their volume" : t < 0.15 ? "too quiet to hear" : "calm and clear"), missNote: "Committed with your voice matched to the customer's. Raising your own volume pushed the exchange up, not down." },
    },
    {
      id: "call-supervisor", kind: "select", target: "supervisor-phone",
      title: "Bring in the supervisor",
      cue: "Use the agreed call to bring the supervisor to the window.",
      why: "A supervisor at the window changes the conversation: a new face, more authority to resolve the parcel problem and a second person watching. Calling early, while the script is still being tried, is what the plan expects — it is not an admission that the clerk has failed.",
    },
    {
      id: "duress-alarm", kind: "hold", target: "duress-alarm", seconds: 4,
      title: "Use the alarm per the facility's plan",
      cue: "The script isn't working and the customer is getting louder — press and hold the counter alarm as the plan directs.",
      why: "The facility's workplace-violence plan decides when the alarm is used and who responds. Holding it the full count completes the signal; using it once the calm approach has stopped working, rather than hesitating for fear of overreacting, is exactly what it is there for.",
      holdBreakNote: "You let go before the alarm completed. A signal that didn't finish sending brings nobody.",
    },
    {
      id: "lock-gate", kind: "turn", target: "counter-gate-lock",
      title: "Lock the counter gate",
      cue: "Turn the counter gate's lock so the clerk side stays closed.",
      turn: { turns: 0.35, axis: "y", label: "COUNTER GATE" },
      why: "The counter is only a barrier if its gate is shut. Locking it keeps the clerk's side of the counter the clerk's, without any confrontation, and leaves the customer's route out through the lobby wide open.",
    },
    {
      id: "clear-lobby", kind: "select", target: "lobby-far-side",
      title: "Move other customers clear",
      cue: "Direct the waiting customers to the far side of the lobby or to the next window.",
      why: "Everyone else in the lobby is a bystander, and a crowd near an escalating customer tends to either inflame or get caught up. Moving them clear calmly shrinks the situation back to the people who have to deal with it.",
    },
    {
      id: "close-out", kind: "sequence", anyOrder: false,
      targets: ["incident-log", "debrief-request"],
      itemNames: { "incident-log": "log the incident honestly", "debrief-request": "request a debrief" },
      title: "Log it honestly, then ask for a debrief",
      cue: "Complete the incident log, then request a debrief for yourself.",
      why: "The incident log is how the facility's plan learns — what happened, what worked and what needs fixing at the window. It says nothing about how the clerk is doing afterward; requesting a debrief puts that on the record too, as its own line rather than an afterthought.",
      outOfOrderNote: "Log first, then the debrief — the debrief is about the person, not a replacement for the record.",
    },
  ],

  interrupts: [
    {
      id: "queue-joins-in",
      kind: "Another customer joins in",
      after: "keep-distance", delay: 2, seconds: 12,
      alert: "A customer further back in the line starts shouting at the upset customer to hurry up.",
      cue: "Redirect the line — don't take on a second argument.",
      target: "queue-redirect",
      why: "A second person joining in turns one frustrated customer into two, arguing with each other in front of the clerk. Redirecting the line to the next window calmly takes the audience away without the clerk arguing with anyone.",
      missNote: "The two customers were left shouting at each other across the lobby. The situation doubled while the clerk watched.",
      wrongNote: "Send the line to the next window — engaging the second customer only adds another argument.",
    },
    {
      id: "customer-at-gate",
      kind: "Customer moves toward the gate",
      after: "duress-alarm", delay: 2, seconds: 12,
      alert: "The customer walks toward the counter gate at the end of the window.",
      cue: "Step back toward the back-room door — keep the counter between you.",
      target: "retreat-marker",
      why: "Keeping the counter between the clerk and the customer matters more than holding a position at the window. Stepping back toward the back-room door keeps the distance and the retreat both open while help is on the way.",
      missNote: "The clerk stayed at the window while the customer reached the gate. The counter stopped being between them.",
      wrongNote: "Step back toward the back-room door — distance first, everything else after.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, RCD_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => tileFace(cx, w, h, {}), { repeat: 5, px: 256 });
    const floor = box(g, 7.2, 0.01, 6.6, 0, 0.002, 0, 0xcfd3d6, { cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.5, metal: 0.03, color: 0xdfe3e6 });
    const lobbyTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#8a8f94", base2: "#80858a", seam: "rgba(0,0,0,0.15)" }), { repeat: 3, px: 256 });
    const lobbyMat = box(g, 3.0, 0.004, 2.4, 0.6, 0.008, 1.6, 0x8a8f94, { cast: false });
    lobbyMat.material = texturedMat(lobbyTex, { rough: 0.8, color: 0x9a9fa4 });
    const brickTex = surfaceTexture((cx, w, h) => brickFace(cx, w, h, {}), { repeat: 3, px: 256 });
    const backWall = box(g, 7.2, 3.2, 0.12, 0, 1.6, -3.3, 0x9a5a48, { rough: 0.8 });
    backWall.material = texturedMat(brickTex, { rough: 0.85, color: 0xb8705a });

    // ---------------------------------------------------------------- the counter
    const counter = group(g, 0, 0, -0.9);
    const woodTex = surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h, {}), { repeat: 2, px: 256 });
    const counterBody = box(counter, 3.6, 1.0, 0.6, 0, 0.5, 0, 0x6b5138, { rough: 0.7 });
    counterBody.material = texturedMat(woodTex, { rough: 0.7, color: 0x8b6a4a });
    slab(counter, 3.7, 0.05, 0.7, 0, 1.02, 0, 0xd7dce1, { radius: 0.01 });
    for (let i = 0; i < 3; i++) {
      box(counter, 0.02, 0.6, 0.6, -1.2 + i * 1.2, 1.35, 0, 0xdfe8ee, { opacity: 0.25, transparent: true });
      decal(counter, 0.3, 0.12, -0.6 + i * 1.2 - 0.6, 1.72, 0.31, signFace(`WINDOW ${i + 1}`, { bg: "#0d1c24", accent: RCD_CSS, fg: "#e3eefa", scale: 0.5 }), { px: 160 });
    }
    const scale = box(counter, 0.3, 0.06, 0.3, 0.4, 1.08, 0.05, 0xc9ced3, { metal: 0.6 });
    void scale;
    const looseItems = group(counter, -0.2, 1.05, 0.15);
    box(looseItems, 0.18, 0.04, 0.12, 0, 0.02, 0, 0x2f6fb0, { rough: 0.6 });
    box(looseItems, 0.1, 0.06, 0.06, 0.14, 0.03, 0, 0xd8232a, { rough: 0.5 });
    reg(hits, looseItems, "loose-items");
    const scissors = box(counter, 0.14, 0.01, 0.05, 0.9, 1.05, 0.28, 0xc9ced3, { metal: 0.7 });
    holoTag(scissors, "On the customer side", 0, 0.06, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, scissors, "loose-scissors");
    const bin = box(counter, 0.4, 0.3, 0.3, -0.6, 0.6, -0.4, 0x4a5560, { opacity: 0.6, transparent: true });
    hits["under-counter-bin"] = bin;
    const drawer = box(counter, 0.4, 0.1, 0.36, 0.0, 0.9, -0.42, 0x8b929a, { metal: 0.5 });
    holoTag(drawer, "Drawer open", 0, 0.12, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, drawer, "open-drawer-decoy");
    const grabNote = decal(counter, 0.14, 0.1, -0.9, 1.05, 0.1, paperFace("", ["TAKE IT BACK", "OFF THEM"], { bg: "#fbe0df", band: "#c9302b" }), { px: 140 });
    grabNote.rotation.x = -Math.PI / 2;
    reg(hits, grabNote, "grab-back-decoy");
    const supPhone = group(counter, 1.4, 1.05, -0.2);
    box(supPhone, 0.18, 0.06, 0.22, 0, 0.03, 0, 0x22272c, { rough: 0.5 });
    box(supPhone, 0.05, 0.05, 0.2, -0.06, 0.08, 0, 0x111418, {});
    holoTag(supPhone, "Supervisor line", 0, 0.16, 0, { css: RCD_ACCENT, w: 0.36 });
    reg(hits, supPhone, "supervisor-phone");
    const alarmBtn = cyl(counter, 0.035, 0.035, 0.02, 1.0, 1.06, -0.25, 0x8a1a1a, { emissive: 0x8a1a1a, ei: 0.3, seg: 16 });
    holoTag(alarmBtn, "Counter alarm", 0, 0.08, 0, { css: RCD_ACCENT, w: 0.34 });
    reg(hits, alarmBtn, "duress-alarm");
    const voiceMeter = instrument(counter, -1.4, 1.05, -0.15, { idle: "VOICE --", color: RCD_ACCENT, w: 0.14, d: 0.2 });
    reg(hits, voiceMeter, "voice-meter");

    // Counter gate at the end.
    const gate = group(g, 1.95, 0, -0.9);
    const gateLeaf = box(gate, 0.05, 1.0, 0.6, 0, 0.5, 0, 0x6b5138, { rough: 0.7 });
    gateLeaf.material = texturedMat(woodTex, { rough: 0.7, color: 0x8b6a4a });
    const gateLock = box(gate, 0.06, 0.08, 0.06, 0.04, 0.9, 0.2, 0xd8b43a, { metal: 0.7 });
    reg(hits, gateLock, "counter-gate-lock");

    // Script cards on a panel behind the counter.
    const scriptPanel = holoPanel(g, 0.6, 0.38, -1.0, 1.7, -1.6, (ctx, w, h) => rcdBoard(ctx, w, h, "CALM SCRIPT", ["Listen · Acknowledge · Offer", "Trace request is a real next step"]), { accent: RCD_ACCENT });
    [["listen-card", -0.18], ["acknowledge-card", 0], ["option-card", 0.18]].forEach(([id, x]) => {
      const m = box(scriptPanel, 0.1, 0.06, 0.02, x, -0.12, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
      reg(hits, m, id);
    });

    // Clerk side: exit path, back door, cage decoy.
    const exitPath = box(g, 0.6, 0.01, 1.0, -2.2, 0.006, -2.2, 0x59c97b, { opacity: 0.3, transparent: true, cast: false });
    reg(hits, exitPath, "counter-exit-path");
    const backDoor = group(g, -2.2, 0, -3.2);
    box(backDoor, 1.0, 2.2, 0.06, 0, 1.1, 0, 0x2f3338, { metal: 0.5 });
    decal(backDoor, 0.4, 0.14, 0, 1.7, 0.035, signFace("STAFF ONLY", { bg: "#0d1c24", accent: RCD_CSS, fg: "#e3eefa", scale: 0.5 }), { px: 160 });
    const cage = group(g, -2.2, 0, -2.6);
    box(cage, 0.8, 1.2, 0.6, 0, 0.62, 0, 0x8b929a, { metal: 0.6, opacity: 0.55, transparent: true });
    for (let i = 0; i < 3; i++) box(cage, 0.3, 0.2, 0.25, -0.2 + i * 0.2, 0.3 + (i % 2) * 0.25, 0, 0xc9a86b, { rough: 0.85 });
    for (const sx of [-0.35, 0.35]) cyl(cage, 0.04, 0.04, 0.04, sx, 0.03, 0.25, 0x111111, { seg: 8 });
    reg(hits, cage, "blocked-back-door");
    const retreat = box(g, 0.5, 0.01, 0.5, -1.6, 0.006, -2.0, 0x2f6fb0, { opacity: 0.35, transparent: true, cast: false });
    reg(hits, retreat, "retreat-marker");
    const distanceMark = box(g, 0.8, 0.01, 0.3, 0.0, 0.006, -1.7, 0xf2c14b, { opacity: 0.35, transparent: true, cast: false });
    reg(hits, distanceMark, "counter-distance");

    // Lobby: customer, queue, stanchions, far side, doorway decoy.
    const customer = standingFigure(g, 0.2, 0.2, { ry: Math.PI, cloth: 0x7a4a3a, skin: 0xd9a985 });
    reg(hits, customer.userData.torso, "customer-cues");
    const waiting = [];
    for (let i = 0; i < 2; i++) waiting.push(standingFigure(g, 1.2 + i * 0.7, 1.6 + i * 0.4, { ry: Math.PI + 0.3, cloth: i ? 0x3a5a3a : 0x4a4a6a, skin: i ? 0xb98a63 : 0xe0b894 }));
    for (let i = 0; i < 5; i++) {
      const post = group(g, -0.6 + i * 0.6, 0, 0.9);
      cyl(post, 0.12, 0.14, 0.03, 0, 0.015, 0, 0x2b3138, { seg: 12 });
      cyl(post, 0.025, 0.025, 0.9, 0, 0.45, 0, 0xc9ced3, { metal: 0.7, seg: 8 });
      if (i < 4) box(post, 0.6, 0.05, 0.01, 0.3, 0.85, 0, 0x2f6fb0, {});
    }
    const queueSign = holoPanel(g, 0.44, 0.26, 2.4, 1.5, 0.9, (ctx, w, h) => rcdBoard(ctx, w, h, "NEXT WINDOW", ["Please use window 3"]), { accent: RCD_ACCENT, ry: -0.6 });
    reg(hits, queueSign, "queue-redirect");
    const farSide = box(g, 0.8, 0.01, 0.8, 2.6, 0.01, 2.6, 0x9fd6c0, { opacity: 0.3, transparent: true, cast: false });
    holoTag(farSide, "Far side of lobby", 0, 0.12, 0, { css: RCD_ACCENT, w: 0.44 });
    reg(hits, farSide, "lobby-far-side");
    const doorwayMark = box(g, 0.6, 0.01, 0.4, -1.4, 0.01, 3.0, 0xf0645b, { opacity: 0.4, transparent: true, cast: false });
    holoTag(doorwayMark, "Stand in the doorway?", 0, 0.12, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, doorwayMark, "block-doorway-decoy");
    const lobbyDoor = group(g, -1.4, 0, 3.3);
    box(lobbyDoor, 1.2, 2.2, 0.05, 0, 1.1, 0, 0xdfe8ee, { opacity: 0.35, transparent: true });
    box(lobbyDoor, 1.3, 0.08, 0.08, 0, 2.24, 0, 0x4a5560, { metal: 0.5 });
    const followCard = decal(lobbyDoor, 0.2, 0.14, 0.4, 1.3, -0.04, paperFace("", ["FOLLOW THEM OUT", "FOR THE PLATE"], { bg: "#fbe0df", band: "#c9302b" }), { px: 150 });
    followCard.rotation.y = Math.PI;
    reg(hits, followCard, "follow-outside-decoy");

    // PO boxes wall and a writing table for depth.
    const poWall = group(g, -3.5, 0, 1.0, Math.PI / 2);
    box(poWall, 2.4, 2.0, 0.3, 0, 1.0, 0, 0x8b6a4a, { rough: 0.7 });
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) box(poWall, 0.3, 0.26, 0.02, -0.95 + c * 0.38, 0.4 + r * 0.34, 0.16, 0xb8a060, { metal: 0.7, rough: 0.35 });
    const writing = group(g, 2.9, 0, 1.8);
    slab(writing, 1.0, 0.04, 0.5, 0, 1.0, 0, 0xd7dce1, { radius: 0.01 });
    cyl(writing, 0.05, 0.05, 1.0, 0, 0.5, 0, 0x4a5560, { metal: 0.5, seg: 10 });

    // Incident log panel.
    const logPanel = holoPanel(g, 0.56, 0.36, 3.0, 1.5, -1.8, (ctx, w, h) => rcdBoard(ctx, w, h, "INCIDENT LOG", ["Status: open"]), { accent: RCD_ACCENT, ry: -0.8 });
    const logMark = box(logPanel, 0.12, 0.08, 0.02, -0.12, -0.08, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, logMark, "incident-log");
    const debMark = box(logPanel, 0.12, 0.08, 0.02, 0.12, -0.08, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, debMark, "debrief-request");

    const clerk = standingFigure(g, -0.5, -2.2, { ry: 0, cloth: 0x2f4f7a, skin: 0xa87a5a });
    void clerk;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.2, -0.9),

      onStepComplete(step) {
        if (step.id === "window-scan") { scissors.visible = false; cage.position.x = -3.0; }
        if (step.id === "clear-counter") {
          looseItems.parent.remove(looseItems); counter.add(looseItems);
          looseItems.position.set(-0.6, 0.6, -0.4);
          drawer.position.z = -0.2;
        }
        if (step.id === "duress-alarm") alarmBtn.material = mat(0xe0302a, { emissive: 0xe0302a, ei: 1.6 });
        if (step.id === "lock-gate") gateLock.material = mat(0x59c97b, { metal: 0.5, emissive: 0x59c97b, ei: 0.6 });
        if (step.id === "clear-lobby") waiting.forEach((w, i) => w.position.set(2.4 + i * 0.4, 0, 2.6));
        if (step.id === "close-out") repaint(logPanel.userData.face, (ctx, w, h) => rcdBoard(ctx, w, h, "INCIDENT LOG", ["Closed · debrief requested"], "#59c97b"));
      },

      onInterrupt(it) {
        if (it.id === "queue-joins-in") waiting[0].position.set(0.9, 0, 0.6);
        if (it.id === "customer-at-gate") customer.position.set(1.6, 0, 0.0);
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "queue-joins-in") waiting[0].position.set(2.6, 0, 1.6);
        if (it.id === "customer-at-gate") { customer.position.set(0.8, 0, 0.6); retreat.material = mat(0x59c97b, { opacity: 0.4, transparent: true }); }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt; void t;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "voice-level") {
          const ok = gg.t >= 0.15 && gg.t <= 0.45;
          repaint(voiceMeter.userData.screen, signFace(`VOICE ${Math.round(gg.t * 100)}`, {
            bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#e3eefa", scale: 0.5,
          }));
        }
      },
    };
  },
};
