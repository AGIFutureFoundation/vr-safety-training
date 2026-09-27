import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, decal, repaint, signFace, paperFace, mat, seatedFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, surfaceTexture, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Flight Deck Crew Resource Management Briefing VR — Airline
// Cabin and Flight Crew, station seven. The pilot half of this pack: a
// two-pilot flight deck, generic down to the seats, where the discipline
// this station teaches is entirely procedural — the pre-flight briefing
// that puts threats and roles on the table before the engines ever start,
// the sterile flight-deck phase held without exception, challenge-and-
// response checklist discipline where nothing gets skipped silently, and
// closed-loop communication where a callout is worth nothing until it's
// actually acknowledged. No altitude, airspeed or clearance this platform
// is not certain of appears anywhere here — every threshold runs "per the
// checklist" or "per the airline's own sterile-flight-deck procedure."

const CACR_ACCENT = 0x5a8fd8;

export const SIM_CA_FLIGHT_DECK_CREW_RESOURCE_MANAGEMENT = {
  id: "ca-flight-deck-crew-resource-management",
  index: "ca-7",
  domain: "Aviation",
  trade: "Airline pilot — ALPA flight crew",
  category: "Mobility & Transit",
  certification: "ALPA member professional-standards and safety training; the airline's own crew resource management and sterile-flight-deck procedure under 14 CFR 121 — no altitude, airspeed or clearance value is stated here, every threshold runs per the checklist",
  name: "Flight Deck Crew Resource Management Briefing",
  title: simTitle("Flight Deck Crew Resource Management Briefing"),
  tagline: "Threats and roles briefed before the engines start, the sterile flight deck held without exception, challenge-and-response checklist discipline where nothing is skipped silently, and a callout that isn't worth anything until it's actually acknowledged",
  accent: CACR_ACCENT,
  accentCss: "#5a8fd8",
  parSeconds: 340,
  footprint: 2.4,
  badge: { id: "deck-disciplined", name: "Deck Disciplined", note: "The briefing given, the sterile phase held, the checklist run challenge-and-response, and every callout closed the loop before the flight deck moved on" },

  supportLine: "your ALPA local's member assistance resources, or the airline's own employee assistance line — flight deck discipline is a habit worth talking through when it slips, not just when it holds",

  game: system({
    name: "Deck Disciplined",
    currency: "CRM",
    ranks: ["New First Officer", "Line Qualified", "Line Captain", "Check Airman", "Deck Disciplined Certified"],
    badges: [
      { id: "briefing-complete", name: "Briefing Complete", note: "Threats and roles briefed before a single engine started", test: AWARD.stepClean("crm-briefing") },
      { id: "sterile-held", name: "Sterile Held", note: "Declined the non-essential conversation during the sterile phase, first try", test: AWARD.stepClean("decline-conversation") },
      { id: "loop-closed", name: "Loop Closed", note: "Every callout actually acknowledged, not just made", test: AWARD.stepClean("acknowledge-callout") },
    ],
    challenges: [
      { id: "clean-briefing", name: "Clean Briefing", note: "No corrections anywhere in the briefing", test: AWARD.clean },
      { id: "steady-crosscheck", name: "Steady Crosscheck", note: "Held the instrument crosscheck the full count, first try", test: AWARD.unbroken },
      { id: "fast-briefing", name: "Fast Briefing", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "phone-out-hazard": "That personal phone is out on the console during the sterile phase. Nothing that isn't essential to actually flying the aircraft belongs anywhere in reach during this phase, and a phone sitting there is exactly the kind of distraction the sterile rule exists to remove.",
    "unbriefed-threat-hazard": "That weather card was never actually read out during the briefing. A threat that's sitting on the console unbriefed is a threat only one pilot may know about — the whole point of briefing it out loud is making sure it's in both pilots' heads before it ever matters.",
    "checklist-item-skipped-hazard": "That checklist item was never actually challenged out loud. A silently-skipped item is not the same as a completed one, whatever position the switch happens to be in — challenge-and-response exists specifically so nothing gets assumed done.",
    "unacknowledged-callout-hazard": "That callout was made and nobody actually answered it. A callout that lands on silence has not actually closed the loop — the other pilot needs to hear it, understand it and say something back, or this crew has no way to know it registered at all.",
  },

  lateNotes: {
    "confirm-sterile-phase": "Not yet — the pre-flight briefing comes first. Sterile phase starts on the checklist's own cue, not before the crew has actually briefed the flight.",
    "acknowledge-callout": "Hold that. A callout has to actually be made before there's anything here to acknowledge.",
  },

  steps: [
    {
      id: "crm-briefing", kind: "sequence", anyOrder: false,
      targets: ["brief-threats", "assign-roles"],
      itemNames: { "brief-threats": "brief the known threats out loud", "assign-roles": "confirm who does what" },
      title: "Brief threats, then confirm roles",
      cue: "Read the known threats out loud, then confirm who is flying and who is monitoring.",
      why: "A threat named out loud is a threat both pilots now actually know about, and confirming roles right after is what makes sure everyone in this flight deck knows exactly whose job is flying and whose is watching, before either one is needed.",
      outOfOrderNote: "Threats first, then roles — assigning who does what means less if neither pilot has actually heard what they're watching for yet.",
    },
    {
      id: "scan-deck", kind: "find", noHint: true,
      targets: ["phone-on-console", "unbriefed-weather-card"],
      itemNames: { "phone-on-console": "a personal phone left out on the console", "unbriefed-weather-card": "a weather card that was never briefed out loud" },
      itemNotes: {
        "phone-on-console": "This gets put away before the sterile phase starts — nothing personal stays within reach once this flight deck goes sterile.",
        "unbriefed-weather-card": "This gets read out loud and folded into the briefing now — a threat sitting on the console unbriefed helps nobody who hasn't happened to notice it themselves.",
      },
      title: "Scan the flight deck before pushback",
      cue: "Two things on this flight deck aren't right yet. Find them before the sterile phase begins.",
      why: "Everything this scan catches is easy to fix right now and a real gap in this crew's shared picture the moment the sterile phase actually starts and conversation narrows to just what's essential.",
    },
    {
      id: "confirm-sterile-phase", kind: "select", target: "sterile-phase-panel",
      title: "Confirm the sterile flight deck phase",
      cue: "Confirm with the other pilot that the flight deck is now sterile, per the checklist's own cue.",
      why: "Sterile phase only means something once both pilots have actually agreed it started — confirming it out loud is what turns a rule written in the manual into something this specific flight deck is actually observing right now.",
    },
    {
      id: "checklist-callout", kind: "sequence", anyOrder: false,
      targets: ["challenge-item", "response-item"],
      itemNames: { "challenge-item": "call out the checklist item", "response-item": "confirm the response" },
      title: "Run the checklist, challenge and response",
      cue: "Call out each checklist item, then confirm the other pilot's response before moving to the next one.",
      why: "Challenge-and-response is what makes a checklist a shared, verified fact instead of one pilot's own private assumption — nothing on this list counts as done until it's been called out and answered, every single item.",
      outOfOrderNote: "Challenge first, then confirm the response — a response confirmed before the item was ever actually challenged isn't checking anything.",
    },
    {
      id: "decline-conversation", kind: "select", target: "non-essential-topic-card",
      title: "Decline the non-essential conversation",
      cue: "Decline the non-essential topic and redirect back to the flight, per the sterile-phase rule.",
      why: "A conversation about anything that isn't essential to flying this aircraft doesn't belong anywhere in the sterile phase, however harmless it sounds — declining it, every time, is the entire rule, not a judgment call about how distracting this particular topic actually is.",
    },
    {
      id: "set-altimeter", kind: "turn", target: "altimeter-setting-knob",
      title: "Set the altimeter",
      cue: "Turn the altimeter setting knob to the current setting given, per the checklist.",
      turn: { turns: 0.3, axis: "y", label: "ALTIMETER" },
      why: "Setting the altimeter to the value actually given is a mechanical step this checklist spells out precisely so both pilots' instruments read the same reference — it is never a value this crew estimates or carries over from the last leg.",
    },
    {
      id: "crosscheck-altimeters", kind: "gauge", target: "altimeter-crosscheck",
      title: "Cross-check both altimeters",
      cue: "Compare both pilots' altimeter readings and confirm they actually match.",
      gauge: { label: "CROSSCHECK", speed: 0.6, green: [0.45, 0.6], readout: (t) => (t < 0.45 || t > 0.6 ? "mismatch — recheck" : "matched"), missNote: "Moved on without the two altimeters actually confirmed matched. Two instruments reading two different things is exactly the disagreement this crosscheck exists to catch." },
      why: "Two pilots trusting two altimeters that don't actually agree is a disagreement neither one may notice alone — cross-checking them against each other is what catches that gap before it ever becomes the reason either pilot is wrong about where this aircraft actually is.",
    },
    {
      id: "hold-radio-transmit", kind: "hold", target: "radio-transmit-button", seconds: 5,
      title: "Hold the transmit button for the full readback",
      cue: "Hold the transmit button through the entire readback — releasing early cuts it off mid-word.",
      why: "A readback cut off early is a readback the other party never actually heard in full, and holding the button down for the whole transmission is the only way this crew's own words reliably reach whoever needs them.",
      holdBreakNote: "Released the transmit button before the readback actually finished. A cut-off transmission is functionally the same as one that was never sent.",
    },
    {
      id: "monitor-approach-band", kind: "track", target: "approach-indicator", seconds: 6,
      title: "Hold the approach indicator on target",
      cue: "Keep the approach indicator centred in the band the whole time you're watching it.",
      track: { start: 0.35, green: [0.42, 0.62], rise: 0.32, fall: 0.3, drift: 0.13, label: "ON TARGET", readout: (v) => (v < 0.42 ? "low" : v > 0.62 ? "high" : "on target") },
      holdBreakNote: "The indicator drifted out of the band without a callout. Monitoring means actually watching the trend, not glancing at it once and assuming it holds.",
      why: "The pilot monitoring is the second set of eyes this flight deck depends on precisely because the pilot flying is busy flying — holding this indicator on target the whole time is what that monitoring role actually means in practice, not just in title.",
    },
    {
      id: "callout-deviation", kind: "select", target: "callout-deviation",
      title: "Call out the deviation",
      cue: "Speak up immediately the moment you notice anything drifting from what's expected.",
      why: "A deviation noticed and not spoken up about might as well not have been noticed at all — CRM only works if the pilot monitoring actually says something the instant something looks wrong, rather than assuming the pilot flying has already seen it too.",
    },
    {
      id: "acknowledge-callout", kind: "select", target: "callout-acknowledgment",
      title: "Acknowledge the callout",
      cue: "Acknowledge the callout back, out loud, so the loop actually closes.",
      why: "A callout answered with silence has not actually been heard, as far as anyone in this flight deck can tell — acknowledging it back, specifically, is what turns \"I said something\" into \"we both know it now,\" which is the entire point of saying it in the first place.",
    },
    {
      id: "end-sterile-phase", kind: "select", target: "sterile-phase-panel",
      title: "Confirm the end of the sterile phase",
      cue: "Confirm, per the checklist's own cue, that the sterile flight-deck phase has ended.",
      why: "The sterile phase ends on the same kind of explicit, mutual confirmation it started with — assuming it's over because the workload feels lighter is exactly the kind of guess this procedure was built to replace with an actual agreed fact.",
    },
    {
      id: "log-crm-debrief", kind: "select", target: "crm-debrief-log",
      title: "Log the CRM debrief",
      cue: "Record what went well and what to improve before signing off the leg.",
      why: "A debrief that never gets written down is a lesson this crew learned once and the next crew never gets to benefit from — logging it is what turns today's flight into something the whole operation can actually learn from.",
    },
  ],

  interrupts: [
    {
      id: "urgent-frequency-change",
      kind: "ATC issues an urgent frequency change",
      after: "checklist-callout", delay: 3, seconds: 12,
      alert: "Air traffic control breaks in with an urgent frequency change mid-checklist.",
      cue: "That gets handled on the radio panel — the checklist waits.",
      target: "radio-transmit-button",
      why: "An urgent ATC instruction takes priority over a checklist that isn't going anywhere — acknowledging it on the radio now, then returning to exactly where the checklist left off, is what keeps both the instruction and the checklist itself from getting lost.",
      missNote: "The urgent frequency change sat unanswered while the checklist continued. An ATC instruction that goes unacknowledged is a instruction this crew cannot assume was ever actually received.",
      wrongNote: "Answer the radio first — an urgent ATC call doesn't wait for a checklist item to finish.",
    },
    {
      id: "unexpected-deviation-noticed",
      kind: "A deviation shows up that nobody has called out yet",
      after: "monitor-approach-band", delay: 3, seconds: 12,
      alert: "The approach indicator drifts noticeably off target while attention is elsewhere.",
      cue: "That gets called out immediately, not assumed already seen.",
      target: "callout-deviation",
      why: "A drift nobody has actually spoken up about is a drift this flight deck is trusting on hope alone — calling it out the instant it's noticed is the one habit that turns CRM from a phrase in training into something this crew actually does under pressure.",
      missNote: "The deviation kept drifting, unspoken, while the crew assumed someone else had already caught it. That assumption is exactly what CRM training exists to break.",
      wrongNote: "Call it out now — a deviation nobody has actually spoken up about is a deviation this crew is trusting on hope alone.",
    },
  ],

  build(root) {
    const hits = {};
    const g = root;
    stationPad(g, 2.4, CACR_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#2b2f34"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#22262b";
      for (let i = 0; i < 6; i++) cx.fillRect((i * w) / 6, 0, 2, h);
    }, { repeat: 4, px: 256 });
    const floorMat = texturedMat(floorTex, { rough: 0.6, metal: 0.1, color: 0x3a4048 });
    const floor = box(g, 3.2, 0.06, 3.2, 0, -0.03, 0.1, 0xffffff, { rough: 0.6, cast: false });
    floor.material = floorMat;

    // ---------------------------------------------------------- seats + pilots
    const captainSeat = box(g, 0.5, 0.5, 0.5, -0.4, 0.42, -0.6, 0x2b3138, { rough: 0.6 });
    void captainSeat;
    const foSeat = box(g, 0.5, 0.5, 0.5, 0.4, 0.42, -0.6, 0x2b3138, { rough: 0.6 });
    void foSeat;
    const captain = seatedFigure(g, -0.4, 0.65, -0.55, { ry: 0, cloth: 0x1c3a5c, skin: 0xb98a63 });
    const fo = seatedFigure(g, 0.4, 0.65, -0.55, { ry: 0, cloth: 0x1c3a5c, skin: 0xd9a985 });
    void captain; void fo;

    // ---------------------------------------------------------- instrument panel + glareshield
    const panel = box(g, 2.0, 0.6, 0.2, 0, 1.0, 0.35, 0x22262b, { rough: 0.5, metal: 0.2 });
    void panel;
    const windshield = box(g, 2.0, 0.7, 0.03, 0, 1.55, 0.46, 0x161d24, { rough: 0.2, metal: 0.3, opacity: 0.85, transparent: true });
    void windshield;

    const captainAlt = instrument(g, -0.5, 1.05, 0.42, { idle: "-- ft", color: CACR_ACCENT, w: 0.14, d: 0.1, ry: 0 });
    holoTag(captainAlt, "captain's altimeter", 0, 0.16, 0, { css: "#5a8fd8", w: 0.42 });
    const foAlt = instrument(g, 0.5, 1.05, 0.42, { idle: "-- ft", color: CACR_ACCENT, w: 0.14, d: 0.1, ry: 0 });
    holoTag(foAlt, "FO's altimeter", 0, 0.16, 0, { css: "#5a8fd8", w: 0.34 });
    reg(hits, captainAlt, "altimeter-crosscheck");
    const altKnob = cyl(g, 0.03, 0.03, 0.04, -0.5, 0.98, 0.42, 0x8b98a5, { rough: 0.4, metal: 0.5, seg: 12 });
    reg(hits, altKnob, "altimeter-setting-knob");

    const approachDial = instrument(g, 0, 1.1, 0.42, { idle: "-- APP", color: CACR_ACCENT, w: 0.16, d: 0.1, ry: 0 });
    holoTag(approachDial, "approach indicator", 0, 0.16, 0, { css: "#5a8fd8", w: 0.4 });
    reg(hits, approachDial, "approach-indicator");
    const deviationMark = box(approachDial, 0.06, 0.06, 0.02, 0, -0.08, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, deviationMark, "callout-deviation");
    const ackMark = box(approachDial, 0.06, 0.06, 0.02, 0.1, -0.08, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, ackMark, "callout-acknowledgment");
    reg(hits, ackMark, "unacknowledged-callout-hazard");

    // ---------------------------------------------------------- overhead + console
    const overhead = box(g, 1.6, 0.3, 0.5, 0, 2.05, -0.1, 0x2b3138, { rough: 0.5, metal: 0.3 });
    holoTag(overhead, "overhead panel", 0, 0.2, 0, { css: "#5a8fd8", w: 0.36 });
    const sterilePanel = instrument(overhead, 0, -0.2, 0.2, { idle: "STERILE?", color: CACR_ACCENT, w: 0.2, d: 0.14, ry: 0 });
    reg(hits, sterilePanel, "sterile-phase-panel");

    const console_ = box(g, 0.4, 0.4, 0.9, 0, 0.42, -0.2, 0x2b2f34, { rough: 0.5, metal: 0.2 });
    void console_;
    for (const sx of [-1, 1]) box(g, 0.05, 0.14, 0.06, sx * 0.08, 0.68, -0.1, 0x1c1e21, { rough: 0.5, metal: 0.3 });

    const radioPanel = instrument(g, 0, 0.68, -0.45, { idle: "-- MHz", color: CACR_ACCENT, w: 0.16, d: 0.1, ry: 0 });
    holoTag(radioPanel, "radio panel", 0, 0.14, 0, { css: "#5a8fd8", w: 0.32 });
    const transmitBtn = ball(radioPanel, 0.02, 0, 0.06, 0, 0xf2c14b, { rough: 0.4, emissive: 0xf2c14b, ei: 0.5, seg: 10 });
    reg(hits, transmitBtn, "radio-transmit-button");

    // ---------------------------------------------------------- briefing card, threats, checklist
    const briefingCard = decal(g, 0.3, 0.4, -1.3, 1.2, -0.9,
      paperFace("CRM BRIEFING", ["Threats · Roles", "Sterile phase · Checklist"], { bg: "#fbf3df", band: "#1c3a5c" }), { px: 220 });
    void briefingCard;
    const threatsMark = box(g, 0.3, 0.2, 0.02, -1.3, 1.1, -0.9, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, threatsMark, "brief-threats");
    const rolesMark = box(g, 0.3, 0.2, 0.02, -1.3, 0.9, -0.9, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, rolesMark, "assign-roles");

    const phone = box(g, 0.06, 0.01, 0.12, -1.1, 0.68, -0.35, 0x1c1e21, { rough: 0.4, metal: 0.4 });
    holoTag(phone, "personal phone", 0, 0.06, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, phone, "phone-on-console");
    reg(hits, phone, "phone-out-hazard");

    const weatherCard = decal(g, 0.16, 0.12, 1.1, 0.68, -0.35,
      paperFace("", ["WX ADVISORY"], { bg: "#fbe0df", band: "#c9302b" }), { px: 140 });
    weatherCard.rotation.x = -Math.PI / 2;
    reg(hits, weatherCard, "unbriefed-weather-card");
    reg(hits, weatherCard, "unbriefed-threat-hazard");

    const checklistPanel = holoPanel(g, 0.5, 0.34, 1.3, 1.4, -0.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,14,26,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5a8fd8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dfeaf9";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CHECKLIST", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Item: pending", w * 0.06, h * 0.6);
    }, { accent: CACR_ACCENT, ry: -0.6 });
    const challengeMark = box(checklistPanel, 0.1, 0.1, 0.02, -0.1, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, challengeMark, "challenge-item");
    const responseMark = box(checklistPanel, 0.1, 0.1, 0.02, 0.1, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, responseMark, "response-item");
    const skippedItemFlag = box(checklistPanel, 0.06, 0.04, 0.02, 0, 0.12, 0.01, 0xf0645b, { rough: 0.6 });
    reg(hits, skippedItemFlag, "checklist-item-skipped-hazard");

    const topicCard = decal(g, 0.18, 0.12, -1.1, 0.68, -0.05,
      paperFace("", ["WEEKEND PLANS?"], { bg: "#f4f6f8" }), { px: 140 });
    topicCard.rotation.x = -Math.PI / 2;
    reg(hits, topicCard, "non-essential-topic-card");

    const debriefLog = holoPanel(g, 0.5, 0.34, 1.3, 1.0, 0.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,14,26,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5a8fd8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dfeaf9";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CRM DEBRIEF", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: open", w * 0.06, h * 0.6);
    }, { accent: CACR_ACCENT, ry: -0.7 });
    reg(hits, debriefLog, "crm-debrief-log");

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.1, -1.0),

      onStepComplete(step) {
        if (step.id === "scan-deck") { phone.material = mat(0x59c97b, { rough: 0.4, metal: 0.4 }); weatherCard.visible = false; }
        if (step.id === "confirm-sterile-phase") repaint(sterilePanel.userData.screen, signFace("STERILE", { bg: "#0d1c24", accent: "#59c97b", fg: "#dfeaf9", scale: 0.4 }));
        if (step.id === "checklist-callout") {
          skippedItemFlag.visible = false;
          repaint(checklistPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,14,26,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#5a8fd8"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dfeaf9";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("CHECKLIST", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Item: complete", w * 0.06, h * 0.6);
          });
        }
        if (step.id === "decline-conversation") topicCard.visible = false;
        if (step.id === "acknowledge-callout") ackMark.material = mat(0x59c97b, { opacity: 0.6, transparent: true });
        if (step.id === "end-sterile-phase") repaint(sterilePanel.userData.screen, signFace("NORMAL", { bg: "#0d1c24", accent: "#5a8fd8", fg: "#dfeaf9", scale: 0.4 }));
        if (step.id === "log-crm-debrief") {
          repaint(debriefLog.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,14,26,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#5a8fd8"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dfeaf9";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("CRM DEBRIEF", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: logged", w * 0.06, h * 0.6);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "urgent-frequency-change") transmitBtn.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6, seg: 10 });
        if (it.id === "unexpected-deviation-noticed") deviationMark.material = mat(0xf0645b, { opacity: 0.6, transparent: true });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "urgent-frequency-change") transmitBtn.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 0.5, seg: 10 });
        if (it.id === "unexpected-deviation-noticed") deviationMark.material = mat(0x59c97b, { opacity: 0.001, transparent: true });
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge, tk = session?.track;
        if (gg && !gg.committed && session.step?.id === "crosscheck-altimeters") {
          const ok = gg.t >= 0.45 && gg.t <= 0.6;
          repaint(captainAlt.userData.screen, signFace(`${Math.round(gg.t * 1000)} ft`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#dfeaf9", scale: 0.45 }));
          repaint(foAlt.userData.screen, signFace(`${Math.round(gg.t * 1000)} ft`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#dfeaf9", scale: 0.45 }));
        }
        if (tk && session.step?.id === "monitor-approach-band") {
          repaint(approachDial.userData.screen, signFace(tk.readout ?? "--", {
            bg: "#0d1c24", accent: tk.inBand ? "#59c97b" : "#f0645b", fg: "#dfeaf9", scale: 0.4,
          }));
        }
        void t;
      },
    };
  },
};
