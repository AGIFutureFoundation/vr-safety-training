import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Workplace Violence De-escalation at the Desk VR — Healthcare
// Support, station seven. A front registration desk rather than a clinical
// room: the exit path and the duress button proven before the first visitor
// of the day, the early cues of an escalating visitor noticed while there's
// still room to act, distance kept and a calm, scripted approach tried
// first, the duress button used the moment it isn't working, the desk
// secured and other visitors moved clear, and the incident logged honestly
// afterward — with a debrief requested for the person who was standing at
// that desk, not just a form filed about the visitor who wasn't.

const WVD_ACCENT = 0xd67a3f;

export const SIM_HC_WORKPLACE_VIOLENCE_DEESCALATION_AT_THE_DESK = {
  id: "hc-workplace-violence-deescalation-at-the-desk",
  index: "358",
  domain: "Healthcare Support",
  trade: "Patient registration clerk",
  category: "Healthcare Support",
  indoor: "clinic",
  certification: "Cal/OSHA's workplace violence prevention standard, 8 CCR 3342 (SB 553) — the written plan, a proven duress alarm, hazard correction and an honest violent-incident log; the Injury and Illness Prevention Program, 8 CCR 3203; Labor Code §6310 protection against retaliation for reporting a hazard; SEIU-UHW and NUHW as the training bodies for front-desk and registration staff",
  name: "Workplace Violence De-escalation at the Desk",
  title: simTitle("Workplace Violence De-escalation at the Desk"),
  tagline: "The exit path and duress button proven before the first visitor, escalation noticed early, distance kept, a calm approach tried first, the button used the moment it isn't working, and the incident logged honestly with a debrief requested for the person who stood at that desk",
  accent: WVD_ACCENT,
  accentCss: "#d67a3f",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "desk-secured", name: "Desk Secured", note: "An escalating visitor met with distance and a calm approach, the duress alarm used the moment it stopped working, and the incident logged honestly" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "your employer's employee assistance program, or SEIU-UHW's member resources — standing at that desk during an incident like this deserves its own debrief, not just an incident form",

  game: system({
    name: "Front Desk Standard",
    currency: "SHIFT",
    ranks: ["New Clerk", "Desk Certified", "Lead Clerk", "Front Desk Supervisor", "De-escalation Certified"],
    badges: [
      { id: "button-proven", name: "Button Proven", note: "The duress alarm actually tested before the shift, not just assumed", test: AWARD.stepClean("panic-button-test") },
      { id: "distance-kept", name: "Distance Kept", note: "Escalation noticed early and distance kept before anything else", test: AWARD.stepClean("notice-and-distance") },
      { id: "honest-log", name: "Honest Log", note: "The incident logged completely, with a debrief actually requested", test: AWARD.stepClean("close-out") },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the shift", test: AWARD.clean },
      { id: "steady-alarm", name: "Steady Alarm", note: "Held the duress button the full count, first try", test: AWARD.unbroken },
      { id: "fast-response", name: "Fast Response", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "improper-restraint-decoy": "Those zip ties are sitting on the desk like a tool for this job. Physically restraining a visitor is never this desk's role, whatever's happening — that's what security and, if it comes to it, law enforcement are for, not a clerk reaching for something to hold someone with.",
    "argue-back-decoy": "That card says \"you need to calm down right now.\" Telling an already escalating person to calm down is an order, not de-escalation, and an order is exactly the kind of thing that pushes a tense visitor further rather than defusing anything.",
    "propped-security-door-decoy": "That's the door to the secure back office, propped open with a wedge. Every lockdown control this desk has depends on that door actually closing when it needs to — propped open, it's not a secure room, it's just a room.",
    "blank-test-log-decoy": "This duress-button test log hasn't been signed in days. An untested button that everyone assumes still works is worse than no button at all, because nobody finds out it's dead until the moment they actually need it.",
  },

  lateNotes: {
    "duress-button": "Not yet — try the calm approach first. The button is for when that stops working, not instead of it.",
    "debrief-request": "Hold that. Security has to actually be notified and the incident logged before a debrief is what this step is asking for.",
  },

  steps: [
    {
      id: "clear-exit-path", kind: "select", target: "clear-exit-path",
      title: "Confirm the exit path before the shift",
      cue: "Check that the desk's own path to the exit is clear before the first visitor arrives.",
      why: "A clear path costs nothing to check at the start of a quiet shift and everything to discover blocked in the middle of a tense one — this gets confirmed before the desk opens, not rediscovered when it's already needed.",
    },
    {
      id: "radio-check", kind: "gauge", target: "radio-battery-check",
      title: "Check the duress radio's battery",
      cue: "Read the radio's battery level before clipping it on for the shift.",
      why: "A duress radio that dies partway through a shift is a silent alarm with nobody listening — checking the charge now is what keeps that radio actually able to reach security the one time it matters.",
      gauge: { label: "RADIO BATTERY", speed: 0.6, green: [0.4, 1.0], readout: (t) => (t < 0.4 ? "swap the radio" : "good for the shift"), missNote: "Committed on a radio you never confirmed had charge for the shift. A dead radio at the desk is the same as no radio at all." },
    },
    {
      id: "panic-button-test", kind: "select", target: "panic-button-test",
      title: "Test the duress button",
      cue: "Press the daily test sequence on the desk's duress button and confirm it registers.",
      why: "8 CCR 3342 treats a proven alarm as part of the written plan, not an assumption — a button tested daily is a button this desk can actually trust in the one moment it's ever pressed for real.",
    },
    {
      id: "lobby-scan", kind: "find", noHint: true,
      targets: ["blocked-desk-exit", "broken-camera"],
      itemNames: { "blocked-desk-exit": "a cart blocking the desk's own exit", "broken-camera": "a security camera that isn't recording" },
      itemNotes: {
        "blocked-desk-exit": "A cart parked across this desk's own way out turns a controlled retreat into a scramble the moment it's actually needed — it gets moved before the shift starts, not during an incident.",
        "broken-camera": "A camera with no light on is a camera that isn't recording anything, which means this desk has no independent record of whatever happens here today — it gets reported to facilities now, not noticed for the first time on a request to pull footage later.",
      },
      title: "Scan the lobby before opening the desk",
      cue: "Two things in this lobby aren't right for the start of a shift. Find them.",
      why: "The hazard walk 8 CCR 3342 calls for is exactly this: a look around before anything happens, catching what's wrong with the room while there's still time to fix it rather than during the one moment the room's condition actually matters.",
    },
    {
      id: "review-visitor-log", kind: "select", target: "review-visitor-log",
      title: "Confirm the visitor sign-in system",
      cue: "Check that the visitor log and badge system are actually working before the lobby fills up.",
      why: "A sign-in system that's down is a lobby with no record of who's actually in the building — confirming it works now is what keeps that record honest for the whole shift instead of just for whoever happened to sign in after someone noticed the problem.",
    },
    {
      id: "notice-and-distance", kind: "sequence", anyOrder: false,
      targets: ["notice-cues", "maintain-distance"],
      itemNames: { "notice-cues": "notice the early cues", "maintain-distance": "put the counter between you and the visitor" },
      title: "Notice the cues, then put distance between you",
      cue: "Notice the raised voice and pacing, then reposition behind the counter before saying anything else.",
      why: "A raised voice and pacing are behaviors, not a diagnosis this desk is ever making — noticing them early is what buys the time to reposition behind the counter before things escalate further, rather than reacting to a problem that's already right in front of you.",
      outOfOrderNote: "Notice it first, then move — repositioning without having actually clocked what's happening is just standing somewhere else, not responding to anything.",
    },
    {
      id: "calm-script", kind: "sequence",
      targets: ["calm-tone", "acknowledge-concern", "offer-choice"],
      itemNames: { "calm-tone": "lower your own tone and pace", "acknowledge-concern": "acknowledge what they're upset about", "offer-choice": "offer a concrete choice" },
      title: "Try the calm approach first",
      cue: "Lower your own tone, acknowledge the concern out loud, then offer a concrete choice.",
      why: "A slower, lower voice is the one thing in this exchange this desk actually controls, and it tends to pull the other person's pace down with it — acknowledging the concern before offering a choice is what makes the choice sound like an option instead of a dismissal.",
      outOfOrderNote: "Tone first, then acknowledge, then the choice — a choice offered before anyone's been heard just sounds like being managed.",
    },
    {
      id: "duress-alarm", kind: "hold", target: "duress-button", seconds: 5,
      title: "Use the duress button",
      cue: "Press and hold the button once the calm approach isn't working.",
      why: "The duress button alerts security silently, without announcing anything to the visitor at all — holding it the full count is what actually completes the alert rather than a half-press that registers as nothing on the other end.",
      holdBreakNote: "You let go before the alert actually completed. A duress signal that didn't finish sending is the same as one that was never pressed.",
    },
    {
      id: "close-window", kind: "drag", target: "closed-sign",
      title: "Slide the closed sign into the window",
      cue: "Move the temporarily-closed sign into the desk window while security is on the way.",
      why: "Redirecting the next arrivals away from an active incident, quietly, is what keeps this from turning into a room full of people walking straight into it — the sign does that without announcing anything to the visitor still at the counter.",
      drag: { to: "window-slot", radius: 0.4, missNote: "Not in the window — a sign that isn't actually visible from the lobby redirects nobody." },
    },
    {
      id: "lock-door", kind: "turn", target: "lock-door",
      title: "Secure the back office door",
      cue: "Turn the lock and confirm the back office is sealed.",
      turn: { turns: 0.4, axis: "y", label: "DOOR LOCK" },
      why: "The back office is where this desk actually retreats to if the situation gets worse — a door that isn't locked and confirmed isn't a secure room, it's just a room that happens to have a door.",
    },
    {
      id: "protect-other-visitors", kind: "select", target: "protect-other-visitors",
      title: "Move other visitors clear",
      cue: "Direct waiting visitors away from the desk and toward the far side of the lobby.",
      why: "Everyone else in this lobby is a bystander to whatever's happening at the desk, not part of it — moving them clear is what keeps a two-person situation from turning into a crowd around it.",
    },
    {
      id: "security-notify", kind: "select", target: "security-notify",
      title: "Confirm security is responding",
      cue: "Follow up on the duress alert to confirm security actually heard it and is on the way.",
      why: "A duress signal sent is not the same as a duress signal received — confirming security is actually responding is what turns \"I pressed the button\" into \"help is coming,\" which is the only version of this that actually matters.",
    },
    {
      id: "close-out", kind: "sequence",
      targets: ["post-incident-log", "debrief-request"],
      itemNames: { "post-incident-log": "log the incident", "debrief-request": "request a debrief" },
      title: "Log the incident and ask for a debrief",
      cue: "Complete the violent-incident log, then request a debrief for yourself.",
      why: "The incident log is what 8 CCR 3342 turns into the next hazard correction, but it says nothing about the person who was actually standing at that desk — requesting a debrief is what puts that on the record too, not as an afterthought but as its own line.",
      outOfOrderNote: "Log the incident first, then request the debrief — the debrief is about the person, not a substitute for the record the log actually keeps.",
    },
  ],

  interrupts: [
    {
      id: "bystander-inflames",
      kind: "Bystander escalates it further",
      after: "notice-and-distance", delay: 3, seconds: 12,
      alert: "A second person nearby starts filming and shouting encouragement at the visitor instead of stepping back.",
      cue: "That bystander needs moving too, not engaging with.",
      target: "protect-other-visitors",
      why: "Arguing with a bystander who's making things worse just adds a second confrontation to the one already in progress — moving them clear, the same as any other visitor, is what keeps the situation from growing past the one person it started with.",
      missNote: "The bystander kept filming and shouting the whole time, unaddressed. What started as one tense visitor now has an audience actively encouraging it.",
      wrongNote: "Move the bystander back with everyone else — engaging with them directly only adds a second front to this.",
    },
    {
      id: "unverified-knock",
      kind: "Unverified access request",
      after: "lock-door", delay: 3, seconds: 11,
      alert: "Someone pounds on the locked back office door claiming to be an off-duty nurse who needs in right now.",
      cue: "A claim through a locked door doesn't verify itself.",
      target: "security-notify",
      why: "Anyone can claim to be staff through a door they can't be identified behind, and unlocking on the strength of an urgent-sounding claim is exactly how a secured room stops being secure — that verification goes through security, not through opening the door to find out.",
      missNote: "The door got answered on a claim nobody actually verified. Whatever the room was locked to keep out just walked back in because it sounded urgent enough.",
      wrongNote: "Route it through security — a locked door doesn't open on an unverified claim, however urgent it sounds.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, WVD_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#d9d2c4", base2: "#cec7b9", seam: "rgba(0,0,0,0.12)",
    }), { repeat: 4, px: 256 });
    const floorMat = () => texturedMat(floorTex, { rough: 0.6, metal: 0.03, color: 0xe2dbcd });
    const floorPatch = slab(g, 3.6, 0.006, 3.4, 0, 0.001, 0, 0xe2dbcd, { radius: 0.05, cast: false });
    floorPatch.material = floorMat();

    // ------------------------------------------------------------------- the desk
    const desk = group(g, 0, 0, -1.8);
    box(desk, 1.6, 0.9, 0.6, 0, 0.45, 0, 0xd7dce1, { rough: 0.55, metal: 0.1 });
    const deskTop = slab(desk, 1.7, 0.04, 0.65, 0, 0.92, 0, 0xc7cdd2, { radius: 0.01 });
    void deskTop;
    const exitMarker = box(g, 0.6, 0.02, 0.6, -1.6, 0.001, -2.6, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, exitMarker, "clear-exit-path");
    holoTag(desk, "Registration desk", 0, 1.15, 0, { css: WVD_ACCENT, w: 0.5 });

    const radioClip = box(desk, 0.1, 0.16, 0.05, -0.7, 1.0, -0.2, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const radioPanel = instrument(desk, -0.7, 1.1, -0.2, { idle: "-- %", color: WVD_ACCENT, w: 0.1, d: 0.14, ry: 0 });
    void radioClip;
    reg(hits, radioPanel, "radio-battery-check");

    const duressBtn = cyl(desk, 0.04, 0.04, 0.02, 0.7, 0.94, 0.15, 0xd8342a, { rough: 0.4, emissive: 0xd8342a, ei: 0.4, seg: 16 });
    holoTag(duressBtn, "Duress button", 0, 0.06, 0, { css: WVD_ACCENT, w: 0.36 });
    reg(hits, duressBtn, "panic-button-test");
    const duressBtn2 = duressBtn; // same physical button also serves the hold step
    reg(hits, duressBtn2, "duress-button");

    // Improper restraint decoy on the desk.
    const zipTies = box(desk, 0.1, 0.02, 0.04, 0.4, 0.95, -0.15, 0xdfe4e5, { rough: 0.6 });
    holoTag(zipTies, "Restraints?", 0, 0.05, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, zipTies, "improper-restraint-decoy");

    // Argue-back script card decoy.
    const scriptCard = decal(desk, 0.16, 0.1, -0.4, 0.95, -0.1,
      paperFace("", ["\"CALM DOWN", "RIGHT NOW\""], { bg: "#fbe0df", band: "#c9302b" }), { px: 160 });
    scriptCard.rotation.x = -Math.PI / 2;
    reg(hits, scriptCard, "argue-back-decoy");

    // Visitor log / sign-in system.
    const signInPad = box(desk, 0.2, 0.02, 0.14, 0.1, 0.95, 0.2, 0xf4f8fa, { rough: 0.5 });
    reg(hits, signInPad, "review-visitor-log");

    // -------------------------------------------------------------- lobby chairs
    const chairs = group(g, 1.6, 0, 0.6);
    for (let i = 0; i < 3; i++) {
      box(chairs, 0.4, 0.05, 0.4, i * 0.5, 0.4, 0, 0x8b6a4a, { rough: 0.7 });
      box(chairs, 0.4, 0.4, 0.06, i * 0.5, 0.6, -0.17, 0x8b6a4a, { rough: 0.7 });
      for (const sx of [-1, 1]) box(chairs, 0.04, 0.4, 0.36, i * 0.5 + sx * 0.18, 0.2, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    }

    // Blocked exit cart and broken camera decoys.
    const exitCart = group(g, -1.6, 0, -2.6);
    box(exitCart, 0.5, 0.7, 0.4, 0, 0.35, 0, 0x8b929a, { rough: 0.5, metal: 0.3 });
    holoTag(exitCart, "Blocking the exit", 0, 0.78, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, exitCart, "blocked-desk-exit");
    const camera = group(g, 2.4, 0, -3.2, 0.6);
    box(camera, 0.14, 0.1, 0.1, 0, 2.3, 0, 0x2b3138, { rough: 0.4, metal: 0.5 });
    const camLamp = ball(camera, 0.008, 0, 2.34, 0.06, 0x3a4048, { emissive: 0x3a4048, ei: 0.001, cast: false, seg: 8, seg2: 6 });
    void camLamp;
    holoTag(camera, "Camera not recording", 0, 2.45, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, camera, "broken-camera");

    // ------------------------------------------------------------------ visitor
    const visitor = standingFigure(g, 0.3, -0.8, { ry: -2.6, cloth: 0x6b4a3f, skin: 0xd9a985 });
    reg(hits, visitor.userData.torso, "notice-cues");
    const clerkSpot = box(g, 0.5, 0.02, 0.4, 0, 0.001, -1.4, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, clerkSpot, "maintain-distance");

    const scriptPanel = holoPanel(g, 0.5, 0.36, -0.9, 1.5, -0.8, (ctx, w, h) => {
      ctx.fillStyle = "rgba(26,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d67a3f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbe6d2";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CALM APPROACH", w * 0.06, h * 0.22);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillText("Tone · Acknowledge · Choice", w * 0.06, h * 0.55);
    }, { accent: WVD_ACCENT, ry: 0.5 });
    const toneMark = box(scriptPanel, 0.06, 0.06, 0.02, -0.18, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, toneMark, "calm-tone");
    const ackMark = box(scriptPanel, 0.06, 0.06, 0.02, 0, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, ackMark, "acknowledge-concern");
    const choiceMark = box(scriptPanel, 0.06, 0.06, 0.02, 0.18, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, choiceMark, "offer-choice");

    // ---------------------------------------------------------------- window sign
    const windowFrame = group(g, -0.7, 0, -2.9);
    box(windowFrame, 0.5, 0.02, 0.02, 0, 1.3, 0, 0x53585e, { rough: 0.5, metal: 0.4 });
    const windowSlot = box(windowFrame, 0.4, 0.3, 0.02, 0, 1.15, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["window-slot"] = windowSlot;
    const closedSign = decal(g, 0.3, 0.2, 1.4, 1.0, -2.8,
      paperFace("TEMPORARILY", ["CLOSED"], { bg: "#fbf3df", band: "#c99a2b" }), { px: 200 });
    reg(hits, closedSign, "closed-sign");

    // ------------------------------------------------------------- back office
    const office = group(g, -2.6, 0, -0.6, 0.5);
    box(office, 0.06, 2.0, 1.4, 0, 1.0, 0, 0x8b929a, { rough: 0.4, metal: 0.4 });
    const officeDoor = box(office, 0.5, 1.9, 0.05, 0, 0.95, 0.72, 0xb9c4c9, { rough: 0.4, metal: 0.5 });
    void officeDoor;
    const doorLatch = box(office, 0.04, 0.08, 0.02, 0.2, 1.0, 0.74, 0x2b3138, { rough: 0.5, metal: 0.4 });
    reg(hits, doorLatch, "lock-door");
    const propWedge = box(office, 0.06, 0.04, 0.04, -0.15, 0.02, 0.74, 0xdfa23b, { rough: 0.7 });
    holoTag(propWedge, "Door propped", 0, 0.08, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, propWedge, "propped-security-door-decoy");

    // Blank test log decoy near the panic button.
    const blankLog = decal(desk, 0.16, 0.12, 0.55, 0.95, 0.0,
      paperFace("BUTTON TEST LOG", ["— no entries —"], { bg: "#f4f6f8" }), { px: 160 });
    blankLog.rotation.x = -Math.PI / 2;
    reg(hits, blankLog, "blank-test-log-decoy");

    // ------------------------------------------------------------ waiting area
    const waitingArea = group(g, 2.0, 0, 1.8);
    box(waitingArea, 0.6, 0.02, 0.6, 0, 0.001, 0, 0x9fd6c0, { rough: 0.6, opacity: 0.3, transparent: true, cast: false });
    holoTag(waitingArea, "Far lobby", 0, 0.1, 0, { css: WVD_ACCENT, w: 0.4 });
    reg(hits, waitingArea, "protect-other-visitors");

    const securityPanel = holoPanel(g, 0.5, 0.34, 2.8, 1.5, -0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(26,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d67a3f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbe6d2";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SECURITY", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: not notified", w * 0.06, h * 0.6);
    }, { accent: WVD_ACCENT, ry: -0.6 });
    reg(hits, securityPanel, "security-notify");

    const logPanel = holoPanel(g, 0.5, 0.34, 2.8, 1.1, 0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(26,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d67a3f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbe6d2";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("INCIDENT LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: open", w * 0.06, h * 0.6);
    }, { accent: WVD_ACCENT, ry: -0.9 });
    const logMark = box(logPanel, 0.1, 0.1, 0.02, 0, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, logMark, "post-incident-log");
    const debriefMark = box(logPanel, 0.1, 0.1, 0.02, 0.15, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, debriefMark, "debrief-request");

    const clerk = standingFigure(g, -0.2, -2.5, { ry: 3.1, cloth: 0x8a5a3f, skin: 0xb98a63 });
    void clerk;

    // Supply/forms shelving for depth.
    const shelf = group(g, -3.7, 0, 1.6);
    box(shelf, 0.06, 1.4, 0.6, -0.38, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelf, 0.06, 1.4, 0.6, 0.38, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const SHELF_STOCK = [
      [0.3, "FORMS", 0xf4f8fa], [0.7, "BADGES", 0xdfa23b], [1.1, "INCIDENT KITS", 0xf2c14b],
    ];
    for (const [y, label, c] of SHELF_STOCK) {
      box(shelf, 0.74, 0.02, 0.58, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = -1; i <= 1; i++) {
        box(shelf, 0.2, 0.14, 0.18, i * 0.24, y + 0.08, 0, c, { rough: 0.7 });
        decal(shelf, 0.16, 0.05, i * 0.24, y + 0.08, 0.091, (cx, w, h) => {
          cx.fillStyle = "#22272c"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#fbe6d2"; cx.font = `600 ${Math.round(h * 0.5)}px Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(label, w / 2, h / 2);
        }, { px: 96 });
      }
    }
    holoTag(shelf, "Front desk stock", 0, 1.45, 0, { css: WVD_ACCENT, w: 0.44 });

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.1, -1.4),

      onStepComplete(step) {
        if (step.id === "panic-button-test") duressBtn.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0 });
        if (step.id === "lobby-scan") { exitCart.visible = false; camLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (step.id === "duress-alarm") duressBtn.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.8 });
        if (step.id === "close-window") {
          closedSign.parent.remove(closedSign);
          windowFrame.add(closedSign);
          closedSign.position.set(0, 1.15, 0.02);
          closedSign.rotation.set(0, 0, 0);
        }
        if (step.id === "protect-other-visitors") visitor.position.x -= 0.6;
        if (step.id === "security-notify") {
          repaint(securityPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(26,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#d67a3f"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#fbe6d2";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("SECURITY", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: responding", w * 0.06, h * 0.6);
          });
        }
        if (step.id === "close-out") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(26,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#d67a3f"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#fbe6d2";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("INCIDENT LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: closed · debrief requested", w * 0.06, h * 0.6);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "bystander-inflames") waitingArea.material = mat(0xf0645b, { opacity: 0.4, transparent: true });
        if (it.id === "unverified-knock") propWedge.material = mat(0xf0645b, { rough: 0.7 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bystander-inflames") waitingArea.material = mat(0x9fd6c0, { opacity: 0.3, transparent: true });
        if (it.id === "unverified-knock") propWedge.material = mat(0xdfa23b, { rough: 0.7 });
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "radio-check") {
          repaint(radioPanel.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, {
            bg: "#0d1c24", accent: gg.t >= 0.4 ? "#59c97b" : "#f0645b", fg: "#fbe6d2", scale: 0.55,
          }));
        }
        void t;
      },
    };
  },
};
