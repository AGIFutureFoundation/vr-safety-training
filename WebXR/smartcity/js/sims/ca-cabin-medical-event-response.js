import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, decal, repaint, signFace, paperFace, mat, standingFigure, seatedFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, reg,
} from "../citykit.js";
import { cabinInterior } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cabin Medical Event Response VR — Airline Cabin and Flight
// Crew, station three. Not a clinical procedure — nothing here trains a
// flight attendant to diagnose or to decide what medication a passenger
// should take. It is the support role around a medical event a flight
// attendant is actually responsible for: calling for help the way the
// airline's own procedure spells out, clearing space and calming the row,
// getting the kit and the equipment to whoever is actually qualified to use
// it, relaying information to the ground-based medical support the airline
// contracts for, and keeping the flight deck informed the whole time —
// every clinical call left to the professional actually trained to make it.

const CAME_ACCENT = 0xd8564a;

export const SIM_CA_CABIN_MEDICAL_EVENT_RESPONSE = {
  id: "ca-cabin-medical-event-response",
  index: "ca-3",
  domain: "Aviation",
  trade: "Flight attendant — AFA-CWA cabin crew",
  category: "Mobility & Transit",
  certification: "AFA-CWA cabin-safety training; the airline's own in-flight medical event procedure under 14 CFR 121; OSHA 29 CFR 1910.151 medical services and first aid and 29 CFR 1910.1030 bloodborne pathogens for the kit and the exposure precautions this station covers — no clinical or diagnostic decision is taught here",
  name: "Cabin Medical Event Response",
  title: simTitle("Cabin Medical Event Response"),
  tagline: "Help called for the way the airline's own procedure spells out, the row cleared and calmed, the kit and equipment delivered to whoever is actually qualified to use them, and the ground-based medical support and the flight deck kept informed the whole time — every clinical call left to the professional trained to make it",
  accent: CAME_ACCENT,
  accentCss: "#d8564a",
  parSeconds: 340,
  footprint: 2.6,
  badge: { id: "response-supported", name: "Response Supported", note: "Help called for correctly, the row cleared, the kit delivered, and the ground-based medical support and the flight deck kept informed — without a single clinical guess along the way" },

  supportLine: "your AFA-CWA local's member assistance resources, or the airline's own employee assistance line — supporting a medical event is its own weight to carry even when you never touch the clinical side of it",

  game: system({
    name: "Response Supported",
    currency: "AID",
    ranks: ["New Flight Attendant", "Line Qualified", "Lead Flight Attendant", "Purser", "Response Supported Certified"],
    badges: [
      { id: "help-called", name: "Help Called Correctly", note: "Called for medical help the way the airline's own procedure spells out, first try", test: AWARD.stepClean("call-for-medical-help") },
      { id: "row-cleared", name: "Row Cleared", note: "The space around the passenger cleared before the kit ever arrived", test: AWARD.stepClean("clear-space") },
      { id: "comms-held", name: "Comms Held", note: "Held the relay to ground medical support open the full count, first try", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-response", name: "Clean Response", note: "No corrections anywhere in the response", test: AWARD.clean },
      { id: "fast-response", name: "Fast Response", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "aid-streak", name: "Steady Support", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "aisle-obstruction-hazard": "That cart is still parked square across the aisle to this row. Nothing gets in the way of reaching a passenger who needs help — the path stays clear the entire time this response is running, not just once someone remembers to check.",
    "spilled-drink-hazard": "That spilled drink is sitting right where the responder is about to kneel. A slip right next to the person already being helped turns one problem into two, and it gets wiped up before anyone's foot finds it, not after.",
    "self-medicating-decoy-hazard": "That is someone offering the passenger their own personal medication. A flight attendant never hands over anyone's personal medication or guesses at what this passenger needs — that call belongs to the responding medical professional or to the ground-based medical support on the line, never to whoever happens to be standing closest with a pill bottle.",
    "aed-pads-expired-hazard": "That AED's pad-expiry indicator reads past due. An AED with expired pads is exactly the piece of equipment this crew needs to already know about before the moment it's actually needed, not discover mid-response.",
  },

  lateNotes: {
    "medical-kit": "Not yet — help has to actually be called for first. The kit follows the call, not the other way round.",
    "ground-support-panel": "Hold that. The row has to actually be cleared before there's anything useful to relay to ground medical support.",
  },

  steps: [
    {
      id: "assess-and-call", kind: "select", target: "medical-procedure-card",
      title: "Pull the medical event procedure",
      cue: "Open the airline's own in-flight medical event procedure before doing anything else.",
      why: "This procedure is what the airline has actually trained for this exact situation — working from it instead of instinct is what keeps every step that follows in the order the airline itself decided works, rather than whatever feels most urgent in the moment.",
    },
    {
      id: "call-for-medical-help", kind: "select", target: "pa-handset",
      title: "Call for medical help",
      cue: "Make the PA call for a medical professional onboard, per the airline's procedure.",
      why: "A doctor, nurse or paramedic already on this flight is qualified help that is faster than anything that can be arranged from the ground, and the call goes out immediately, before anything else, because every minute it waits is a minute that qualified help wasn't looking for the row.",
    },
    {
      id: "notify-and-time", kind: "sequence", anyOrder: false,
      targets: ["notify-captain", "start-event-timer"],
      itemNames: { "notify-captain": "notify the captain", "start-event-timer": "start the event timer" },
      title: "Notify the captain, then start the timer",
      cue: "Notify the flight deck a medical event is underway, then start timing it.",
      why: "The captain's own decision about whether this flight diverts rests on being told early, not caught up later, and starting the timer right after is what turns \"it felt like a while\" into an actual number the responding professional and the ground-based support can both use.",
      outOfOrderNote: "Captain first, then the timer — the flight deck needs to know this is happening before anything else about it gets logged.",
    },
    {
      id: "scan-area", kind: "find", noHint: true,
      targets: ["aisle-obstruction", "spilled-drink"],
      itemNames: { "aisle-obstruction": "a cart blocking the aisle to this row", "spilled-drink": "a spilled drink on the floor near the seat" },
      itemNotes: {
        "aisle-obstruction": "This gets moved immediately — a responder or the equipment reaching this row cannot be slowed down by something that only needed pushing aside.",
        "spilled-drink": "This gets wiped up now, before the responder kneels down right next to it, not after somebody's foot finds it mid-response.",
      },
      title: "Clear the path to the row",
      cue: "Two things near this row are in the way of a fast response. Find them.",
      why: "A response is only as fast as the slowest thing standing between the kit and the passenger, and this scan is what catches the obstacles worth thirty seconds each before they cost more than that.",
    },
    {
      id: "bring-medical-kit", kind: "drag", target: "medical-kit",
      title: "Bring the medical kit to the row",
      cue: "Carry the medical kit to the passenger's row so it's ready the moment a responder needs it.",
      why: "The kit staged at the row is the kit that's actually there the instant the responder asks for it — a kit still sitting in the galley is a kit that costs precious seconds the moment it's actually needed.",
      drag: { to: "row-spot", radius: 0.45, missNote: "Not at the row — a kit that never arrives isn't ready for anything." },
    },
    {
      id: "clear-space", kind: "sequence", anyOrder: true,
      targets: ["raise-armrest", "recline-seatback"],
      itemNames: { "raise-armrest": "raise the armrest", "recline-seatback": "lay the seatback flat" },
      title: "Clear space around the passenger",
      cue: "Raise the armrest and lay the seatback flat so a responder actually has room to work.",
      why: "A responder kneeling in a normal economy row has almost no room to begin with, and clearing what little space this seat can give up is the difference between them actually being able to help and being boxed in by furniture the whole time.",
    },
    {
      id: "confirm-aed-standby", kind: "select", target: "aed-cabinet",
      title: "Confirm the AED is standing by",
      cue: "Locate the AED and bring it near, standing by for the responder — never opened or used without one.",
      why: "The AED goes to the row and stays ready in a responder's hands, not this crew's own — bringing it near and confirming it's actually functional is the job here, and using it is a decision that belongs entirely to whoever is qualified to make it.",
    },
    {
      id: "open-o2-valve", kind: "turn", target: "o2-bottle-valve-med",
      title: "Open the portable oxygen bottle",
      cue: "Turn the valve to open per the bottle's own placard, and hand it to the responder.",
      turn: { turns: 0.3, axis: "y", label: "O2 VALVE" },
      why: "Opening this bottle is a mechanical step this checklist actually spells out, not a decision about whether or how much oxygen this passenger needs — that call, like every clinical one, belongs to whoever is qualified to make it.",
    },
    {
      id: "read-o2-pressure", kind: "gauge", target: "o2-pressure-gauge-med",
      title: "Read the oxygen bottle's pressure",
      cue: "Check the pressure gauge before handing the bottle off, and report the reading.",
      gauge: { label: "O2 PRESSURE", speed: 0.55, green: [0.5, 1.0], readout: (t) => (t < 0.5 ? "low — swap bottle" : "adequate"), missNote: "Handed off a bottle nobody confirmed had pressure. A responder finding out mid-use that the bottle is low is exactly what this check exists to prevent." },
      why: "A responder trusting this bottle has enough oxygen to work with needs that confirmed before it's in their hands, not discovered partway through — reading the gauge and reporting the number is the whole of this crew's job here.",
    },
    {
      id: "relay-ground-support", kind: "hold", target: "ground-support-panel", seconds: 6,
      title: "Hold the line open to ground medical support",
      cue: "Hold the relay open and pass along exactly what the responder reports — nothing added, nothing guessed.",
      why: "Ground-based medical support is trained to work from exactly what's actually reported, not from this crew's own read on how serious it looks — holding the line open and relaying only what the responder actually says is what keeps that advice grounded in real information.",
      holdBreakNote: "The line dropped before the relay was actually complete. Ground support working from half a report is ground support working from a guess.",
    },
    {
      id: "keep-bystanders-back", kind: "select", target: "privacy-curtain",
      title: "Keep the area clear and private",
      cue: "Draw the privacy curtain and keep other passengers back from the row.",
      why: "A crowd of bystanders costs the responder both room and air, and it costs the passenger whatever dignity is left them in the middle of this — keeping the area clear and private is a real part of the job here, not a courtesy on top of it.",
    },
    {
      id: "log-event-timeline", kind: "select", target: "event-log",
      title: "Log the event timeline",
      cue: "Record what was done and when, exactly as it happened — no clinical interpretation.",
      why: "This log is a timeline of actions and times, not a diagnosis — it's what the responding professional, the ground-based support and, if it comes to it, the airline and any following care all read afterward, and it only holds up if it says exactly what happened rather than what this crew guessed was going on.",
    },
    {
      id: "diversion-brief", kind: "select", target: "pa-handset",
      title: "Brief the flight deck for a possible diversion",
      cue: "Report the current status to the captain so the diversion decision — if there is one — is theirs to make with real information.",
      why: "Whether this flight diverts is entirely the captain's call, resting on the flight deck's own read of fuel, weather and the airport options available — this crew's job is making sure that call is made with an accurate, current report, not making the call itself.",
    },
  ],

  interrupts: [
    {
      id: "second-passenger-anxious",
      kind: "A second passenger becomes anxious nearby",
      after: "clear-space", delay: 3, seconds: 12,
      alert: "A passenger two rows back stands up, visibly anxious, and starts asking loudly what's happening.",
      cue: "That gets redirected and kept back, not explained to at length mid-response.",
      target: "privacy-curtain",
      why: "Answering a bystander's questions in detail right now pulls attention straight off the passenger actually being helped — redirecting them calmly and keeping the area clear is what this crew can actually do for them without it costing the response anything.",
      missNote: "The anxious passenger kept crowding the aisle, unaddressed, while the response tried to work around them. A second person now needs managing on top of the first.",
      wrongNote: "Redirect and keep them back — a detailed explanation mid-response helps nobody and costs the row its space.",
    },
    {
      id: "responder-asks-for-medication",
      kind: "The responder asks about the passenger's own medication",
      after: "relay-ground-support", delay: 3, seconds: 12,
      alert: "The responding professional asks this crew whether the passenger should take something from their own bag of medication.",
      cue: "That question goes to ground medical support, not to a guess from this crew.",
      target: "medication-referral-flag",
      why: "Whether an unfamiliar medication is safe to give is a clinical judgment this crew has no training to make, whatever the responder's question sounds like — relaying it straight to ground-based medical support is the only honest answer available here.",
      missNote: "The question about medication went unanswered while the response moved on. An unrelayed clinical question is a decision nobody qualified ever actually got to make.",
      wrongNote: "Relay it to ground support — a guess about medication is exactly the clinical call this crew is not trained to make.",
    },
  ],

  build(root) {
    const hits = {};
    const g = root;
    stationPad(g, 2.6, CAME_ACCENT);

    const cabin = cabinInterior(g, 0, 0, 0, { livery: { colour: 0x8a4a42 } });
    const { galley, door } = cabin.userData.parts;
    void door;
    holoTag(cabin, "cabin section", 0, 2.5, 0.4, { css: "#d8564a", w: 0.4 });

    const procedureCard = decal(g, 0.3, 0.4, -1.3, 1.3, -1.2,
      paperFace("MEDICAL EVENT", ["Call · Clear · Support", "No diagnosis by crew"], { bg: "#fbf3df", band: "#8a2a20" }), { px: 220 });
    reg(hits, procedureCard, "medical-procedure-card");

    const paHandset = box(g, 0.08, 0.16, 0.06, 1.4, 1.1, -1.6, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(paHandset, "PA handset", 0, 0.14, 0, { css: "#d8564a", w: 0.32 });
    reg(hits, paHandset, "pa-handset");

    const captainCall = instrument(g, 1.4, 1.4, -1.9, { idle: "CALL?", color: CAME_ACCENT, w: 0.14, d: 0.18, ry: -0.6 });
    holoTag(captainCall, "flight deck", 0, 0.2, 0, { css: "#d8564a", w: 0.36 });
    reg(hits, captainCall, "notify-captain");
    const eventTimer = instrument(g, 1.7, 1.1, -1.6, { idle: "00:00", color: CAME_ACCENT, w: 0.13, d: 0.17, ry: -0.6 });
    reg(hits, eventTimer, "start-event-timer");

    // ------------------------------------------------------------- the row
    const passenger = seatedFigure(g, -0.455, 0.46, -0.09, { ry: 0, cloth: 0x4a5a6a, skin: 0xd9a985 });
    void passenger;
    const armrestMark = box(g, 0.05, 0.22, 0.4, -0.26, 0.62, -0.09, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, armrestMark, "raise-armrest");
    const seatbackMark = box(g, 0.4, 0.58, 0.09, -0.455, 0.75, -0.3, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, seatbackMark, "recline-seatback");
    const rowSpot = box(g, 0.5, 0.02, 0.5, 0, 0.001, -0.09, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["row-spot"] = rowSpot;

    const cartBlocking = box(g, 0.42, 0.7, 0.4, 0, 0.35, 1.3, 0x8b929a, { rough: 0.5, metal: 0.3 });
    holoTag(cartBlocking, "blocking the aisle", 0, 0.78, 0, { css: "#f0645b", w: 0.48 });
    reg(hits, cartBlocking, "aisle-obstruction");
    reg(hits, cartBlocking, "aisle-obstruction-hazard");
    const spillMark = ball(g, 0.14, 0, 0.101, 0.55, 0x8a5a2a, { rough: 0.3, opacity: 0.7, transparent: true, seg: 10, cast: false });
    spillMark.scale.y = 0.05;
    holoTag(spillMark, "spilled drink", 0, 0.06, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, spillMark, "spilled-drink");
    reg(hits, spillMark, "spilled-drink-hazard");

    const medKit = box(galley, 0.36, 0.18, 0.26, 0, 1.2, 0.15, 0xeaf1f5, { rough: 0.5 });
    holoTag(medKit, "medical kit", 0, 0.2, 0, { css: "#d8564a", w: 0.34 });
    reg(hits, medKit, "medical-kit");

    const selfMedPasser = standingFigure(g, 0.6, -1.55, { ry: 1.0, cloth: 0x6b4a3f, skin: 0xb98a63 });
    const pillBottle = box(selfMedPasser, 0.05, 0.08, 0.05, 0.15, 0.9, 0.1, 0xdfa23b, { rough: 0.6 });
    holoTag(pillBottle, "offering own medication", 0, 0.1, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, pillBottle, "self-medicating-decoy-hazard");
    void selfMedPasser;

    const aedCabinet = box(g, 0.28, 0.32, 0.14, -1.4, 1.2, -1.9, 0xd8342a, { rough: 0.5 });
    decal(g, 0.24, 0.1, -1.4, 1.34, -1.83, signFace("AED", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.5 }), { px: 120 });
    reg(hits, aedCabinet, "aed-cabinet");
    const aedTag = decal(g, 0.14, 0.06, -1.4, 1.02, -1.83, paperFace("", ["PADS EXPIRED"], { bg: "#fbe0df", band: "#c9302b" }), { px: 120 });
    reg(hits, aedTag, "aed-pads-expired-hazard");

    const o2Bottle = cyl(g, 0.08, 0.08, 0.5, 1.4, 0.3, -1.3, 0x59c9a0, { rough: 0.4, metal: 0.3, seg: 14 });
    holoTag(o2Bottle, "portable O2 bottle", 0, 0.3, 0, { css: "#d8564a", w: 0.4 });
    const o2Valve = ball(o2Bottle, 0.03, 0, 0.28, 0, 0x8b98a5, { rough: 0.4, metal: 0.5, seg: 10 });
    reg(hits, o2Valve, "o2-bottle-valve-med");
    const o2Gauge = instrument(g, 1.4, 0.57, -1.3, { idle: "-- %", color: CAME_ACCENT, w: 0.1, d: 0.14, ry: -0.6 });
    reg(hits, o2Gauge, "o2-pressure-gauge-med");

    const groundSupportPanel = holoPanel(g, 0.5, 0.34, 1.4, 1.6, -0.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(30,6,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8564a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffe1dd";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("GROUND MEDICAL", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Link: standing by", w * 0.06, h * 0.6);
    }, { accent: CAME_ACCENT, ry: -0.7 });
    reg(hits, groundSupportPanel, "ground-support-panel");
    const referralFlag = ball(groundSupportPanel, 0.03, 0.2, -0.12, 0.02, 0x8b98a5, { rough: 0.4, metal: 0.4, seg: 10 });
    holoTag(referralFlag, "refer to ground support", 0, 0.1, 0, { css: "#d8564a", w: 0.4 });
    reg(hits, referralFlag, "medication-referral-flag");

    const curtain = box(g, 0.04, 1.6, 1.1, 1.9, 0.8, 0.1, 0x3a4a5c, { rough: 0.7, opacity: 0.001, transparent: true });
    holoTag(curtain, "privacy curtain", 0, 1.0, 0, { css: "#d8564a", w: 0.36 });
    reg(hits, curtain, "privacy-curtain");

    const eventLog = holoPanel(g, 0.5, 0.34, -1.4, 1.6, 0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(30,6,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8564a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffe1dd";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("EVENT LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: open", w * 0.06, h * 0.6);
    }, { accent: CAME_ACCENT, ry: 0.6 });
    reg(hits, eventLog, "event-log");

    const attendant = standingFigure(g, -0.9, 1.35, { ry: 1.2, cloth: 0x1c3a5c, skin: 0xb98a63 });
    void attendant;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.4, 1.2, -0.8),

      onStepComplete(step) {
        if (step.id === "notify-and-time") repaint(captainCall.userData.screen, signFace("NOTIFIED", { bg: "#0d1c24", accent: "#59c97b", fg: "#ffe1dd", scale: 0.42 }));
        if (step.id === "scan-area") { cartBlocking.material = mat(0x59c97b, { rough: 0.5, metal: 0.3 }); spillMark.visible = false; }
        if (step.id === "confirm-aed-standby") aedCabinet.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "keep-bystanders-back") curtain.material = mat(0x3a4a5c, { rough: 0.7, opacity: 0.85, transparent: true });
        if (step.id === "log-event-timeline") {
          repaint(eventLog.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(30,6,4,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#d8564a"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#ffe1dd";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("EVENT LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: logged", w * 0.06, h * 0.6);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "second-passenger-anxious") curtain.material = mat(0x3a4a5c, { rough: 0.7, opacity: 0.35, transparent: true });
        if (it.id === "responder-asks-for-medication") referralFlag.material = mat(0xf0645b, { rough: 0.4, metal: 0.4, emissive: 0xf0645b, ei: 1.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "second-passenger-anxious") curtain.material = mat(0x3a4a5c, { rough: 0.7, opacity: 0.001, transparent: true });
        if (it.id === "responder-asks-for-medication") referralFlag.material = mat(0x59c97b, { rough: 0.4, metal: 0.4, emissive: 0x59c97b, ei: 1.0 });
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "read-o2-pressure") {
          repaint(o2Gauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, {
            bg: "#0d1c24", accent: gg.t >= 0.5 ? "#59c97b" : "#f0645b", fg: "#ffe1dd", scale: 0.55,
          }));
        }
        void t;
      },
    };
  },
};
