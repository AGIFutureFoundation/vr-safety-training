import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, decal, repaint, signFace, paperFace, mat, standingFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, reg,
} from "../citykit.js";
import { cabinInterior } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Unruly Passenger De-escalation VR — Airline Cabin and Flight
// Crew, station four. A cabin, not a cockpit: nothing here trains a flight
// attendant to physically subdue anyone. It is distance kept, a calm and
// scripted approach tried first, the flight deck door reinforced and the
// captain notified the moment things start moving the wrong way, and any
// restraint kit staged and never opened without the captain's own explicit
// authorization — every decision about whether or how far this goes left to
// the flight deck, never assumed by the crew member closest to the seat.

const CAUP_ACCENT = 0xb85fa0;

export const SIM_CA_UNRULY_PASSENGER_DEESCALATION = {
  id: "ca-unruly-passenger-deescalation",
  index: "ca-4",
  domain: "Aviation",
  trade: "Flight attendant — AFA-CWA cabin crew",
  category: "Mobility & Transit",
  certification: "AFA-CWA cabin-safety training; the airline's own disruptive-passenger response procedure under 14 CFR 121; Cal/OSHA's workplace violence prevention standard, 8 CCR 3342, for the hazard scan and the honest incident record this station teaches — no physical restraint technique is taught here, only distance, notification and the captain's own authorization",
  name: "Unruly Passenger De-escalation",
  title: simTitle("Unruly Passenger De-escalation"),
  tagline: "Distance kept, a calm scripted approach tried first, the flight deck door reinforced and the captain notified the moment things move the wrong way, and any restraint kit staged and never opened without the captain's own explicit authorization",
  accent: CAUP_ACCENT,
  accentCss: "#b85fa0",
  parSeconds: 340,
  footprint: 2.7,
  badge: { id: "cabin-deescalated", name: "Cabin De-escalated", note: "Distance kept, the calm approach tried, the flight deck secured and the captain notified, and nothing about restraint decided by anyone but the captain" },

  supportLine: "your AFA-CWA local's member assistance resources, or the airline's own employee assistance line — an unruly passenger in a sealed metal tube is its own kind of pressure, whatever the outcome",

  game: system({
    name: "Cabin De-escalated",
    currency: "CALM",
    ranks: ["New Flight Attendant", "Line Qualified", "Lead Flight Attendant", "Purser", "Cabin De-escalated Certified"],
    badges: [
      { id: "distance-kept", name: "Distance Kept", note: "Noticed the cues and kept distance before anything else", test: AWARD.stepClean("notice-and-distance") },
      { id: "deck-secured", name: "Flight Deck Secured", note: "The flight deck door reinforced the moment it mattered", test: AWARD.stepClean("secure-flight-deck-door") },
      { id: "captain-authorized", name: "Captain Authorized", note: "Nothing about restraint happened without the captain's own explicit word", test: AWARD.stepClean("captain-authorizes") },
    ],
    challenges: [
      { id: "clean-response", name: "Clean Response", note: "No corrections anywhere in the response", test: AWARD.clean },
      { id: "steady-hold", name: "Steady Hold", note: "Held position at the aisle the full count, first try", test: AWARD.unbroken },
      { id: "fast-response", name: "Fast Response", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "improvised-weapon-hazard": "That broken bottle is sitting well within the passenger's own reach. Anything that can be picked up and used to hurt someone gets moved out of reach the moment it's spotted — this is not a detail that waits for the situation to calm down on its own.",
    "blocked-deck-path-hazard": "That cart is parked square in the path to the flight deck door. Nothing sits between this crew and the ability to reach and reinforce that door the instant it's needed — a blocked path here is a blocked path to the one door this entire response is built around protecting.",
    "premature-restraint-decoy": "That restraint kit is sitting open on a seat back, in plain view, before anyone has decided anything. A restraint kit gets staged out of sight and stays closed until the captain gives an explicit answer — laid out like this, it escalates the exact situation this crew is trying to calm.",
    "argue-back-decoy": "That card reads \"you need to calm down right now.\" Barking an order at someone already keyed up doesn't settle a single thing — it hands them one more reason to push back harder instead of easing off.",
  },

  lateNotes: {
    "restraint-kit": "Not yet — the captain's authorization comes first. A restraint kit staged before that answer is a decision this crew hasn't actually been given yet.",
    "flight-deck-door-lever": "Hold that. The captain has to actually be notified before there's any reason to reinforce the door beyond its normal state.",
  },

  steps: [
    {
      id: "pull-procedure", kind: "select", target: "disruptive-passenger-card",
      title: "Pull the disruptive-passenger procedure",
      cue: "Open the airline's own procedure before approaching the passenger.",
      why: "This procedure is what the airline actually trained for exactly this situation — working from it is what keeps every step that follows in the order the airline decided works, not whatever this crew member's own instinct says to try first.",
    },
    {
      id: "notice-and-distance", kind: "sequence", anyOrder: false,
      targets: ["notice-cues", "keep-distance"],
      itemNames: { "notice-cues": "read the raised volume and the fast movements", "keep-distance": "put a row of seats between yourself and them" },
      title: "Read the situation, then open up space",
      cue: "Watch for the raised volume and the sharp movements first, then put real space between yourself and them before saying a word.",
      why: "A loud voice and quick, sharp movement are simply what this looks like right now — reading them for what they are, without guessing at a cause, is what earns the seconds this crew needs to open up real space before anything gets closer to a confrontation.",
      outOfOrderNote: "Read it first, then open the space — moving without having actually taken stock of what's unfolding is just relocating, not responding to it.",
    },
    {
      id: "scan-area", kind: "find", noHint: true,
      targets: ["improvised-weapon", "blocked-deck-path"],
      itemNames: { "improvised-weapon": "a broken bottle within the passenger's reach", "blocked-deck-path": "a cart blocking the path to the flight deck door" },
      itemNotes: {
        "improvised-weapon": "This gets moved out of reach the instant it's spotted — anything that can be picked up and used to hurt someone doesn't wait for a calmer moment to be dealt with.",
        "blocked-deck-path": "This gets cleared now — the path to the flight deck door is not something this crew can afford to discover blocked at the moment it's actually needed.",
      },
      title: "Scan the area around the seat",
      cue: "Two things near this seat aren't right. Find them before this goes any further.",
      why: "Anything within reach that can be turned into a weapon, and anything blocking the path to the one door this whole response protects, both get caught and fixed now, while there's still time to fix them without a confrontation over it.",
    },
    {
      id: "alert-crew", kind: "select", target: "crew-alert-code",
      title: "Alert the other crew members",
      cue: "Use the discreet crew alert code to bring other flight attendants aware, without announcing anything to the cabin.",
      why: "Every other crew member on this aircraft needs to know this is happening without the passenger or the surrounding rows hearing it announced — the discreet code is what makes the whole crew aware without turning one seat's problem into the entire cabin's spectacle.",
    },
    {
      id: "calm-script", kind: "sequence",
      targets: ["calm-tone", "acknowledge-concern", "offer-choice"],
      itemNames: { "calm-tone": "slow your own voice down", "acknowledge-concern": "name what set them off, out loud", "offer-choice": "hand them one real option" },
      title: "Talk them down before anything else",
      cue: "Slow your own voice down, say out loud what set them off, then hand them one real option to take.",
      why: "Slowing your own pace is the single lever this crew actually has over how fast this keeps escalating, and it tends to drag the other person's pace down along with it — naming what set them off before handing over an option is what keeps that option from landing as being talked down to.",
      outOfOrderNote: "Slow down first, then name it, then hand over the option — an option offered before anyone felt heard reads as being managed, not helped.",
    },
    {
      id: "notify-captain", kind: "select", target: "interphone-captain",
      title: "Notify the captain",
      cue: "Call the flight deck and report the situation, in plain factual terms.",
      why: "The captain's own decisions from here — whether the flight deck door gets reinforced, whether this flight diverts, whether restraint is ever authorized — all rest on hearing an accurate report now, not being caught up on it after the fact.",
    },
    {
      id: "secure-flight-deck-door", kind: "turn", target: "flight-deck-door-lever",
      title: "Reinforce the flight deck door",
      cue: "Turn the reinforcement lever on the flight deck door per the airline's procedure.",
      turn: { turns: 0.3, axis: "y", label: "DECK DOOR" },
      why: "The flight deck door is what this entire response ultimately protects, and reinforcing it the moment a disturbance is confirmed is what keeps that protection ahead of the situation instead of reacting to it only if things get worse.",
    },
    {
      id: "confirm-alert-sent", kind: "gauge", target: "crew-alert-panel",
      title: "Confirm the crew alert actually sent",
      cue: "Read the alert panel and confirm every crew station acknowledged.",
      gauge: { label: "CREW ALERT", speed: 0.6, green: [0.7, 1.0], readout: (t) => (t < 0.7 ? "not all stations acked" : "all stations acked"), missNote: "Moved on before every crew station acknowledged. An alert that some of the crew never actually got is an alert that failed exactly where it counted." },
      why: "An alert sent and an alert received by every crew station are two different facts, and confirming the second one is what makes sure this crew is actually acting together rather than one person assuming everyone else already knows.",
    },
    {
      id: "protect-nearby-passengers", kind: "select", target: "nearby-passengers",
      title: "Move nearby passengers back",
      cue: "Direct the passengers in the surrounding rows away from the seat, calmly.",
      why: "Everyone else near this seat is a bystander to whatever's happening, not part of it — moving them back is what keeps a one-passenger situation from turning into a crowd standing around it.",
    },
    {
      id: "stage-restraint-kit", kind: "drag", target: "restraint-kit",
      title: "Stage the restraint kit out of sight",
      cue: "Move the restraint kit to a staging spot out of the passenger's line of sight — do not open it.",
      why: "Staging the kit out of sight is what keeps this crew ready without escalating anything by letting the passenger see it — it stays closed and stays staged until the captain gives an actual answer, not before.",
      drag: { to: "staging-spot", radius: 0.45, missNote: "Not at the staging spot — a kit left in view is a kit that can make this situation worse before anyone has decided anything." },
    },
    {
      id: "captain-authorizes", kind: "select", target: "captain-authorization-panel",
      title: "Confirm the captain's authorization",
      cue: "Confirm the captain's explicit authorization before anything about restraint moves forward.",
      why: "Whether restraint is ever used is the captain's decision alone, made with the full picture from the flight deck — this crew's job is confirming that explicit word was actually given, never assuming it or acting ahead of it.",
    },
    {
      id: "log-incident", kind: "select", target: "incident-log",
      title: "Log the incident factually",
      cue: "Record exactly what happened and when — observed facts only, no interpretation.",
      why: "This log is what the airline, and potentially law enforcement at the next stop, reads afterward — it holds up only if it says exactly what was observed and when, not what this crew guessed the passenger was thinking.",
    },
    {
      id: "request-debrief", kind: "select", target: "debrief-request",
      title: "Request a debrief for yourself",
      cue: "Request a debrief for the crew who handled this, not just an incident form about the passenger.",
      why: "An incident report is a record about what the passenger did — a debrief is about what this crew just went through standing at that seat, and it deserves its own line, not an afterthought bolted onto the report.",
    },
  ],

  interrupts: [
    {
      id: "bystander-films-and-encourages",
      kind: "Someone starts recording and egging it on",
      after: "notice-and-distance", delay: 3, seconds: 12,
      alert: "A passenger two rows back is on their feet, recording video and calling out encouragement at the disruptive passenger.",
      cue: "Get them back with the rest of the row, not into a conversation about the footage.",
      target: "nearby-passengers",
      why: "Trading words with someone actively cheering this on just opens a second front on top of the one already running — folding them back into the general instruction to clear the area is what keeps this contained to the one seat it started at instead of turning into a performance.",
      missNote: "The recording and the cheering kept going the whole time, unaddressed. One disruptive seat now has an audience actively feeding it.",
      wrongNote: "Fold them back with everyone else being cleared — talking to them directly about the camera only adds a second thing to manage.",
    },
    {
      id: "passenger-moves-toward-deck",
      kind: "The passenger moves toward the flight deck door",
      after: "notify-captain", delay: 3, seconds: 12,
      alert: "The passenger stands and starts moving up the aisle toward the flight deck door.",
      cue: "That door gets reinforced right now, not after they arrive at it.",
      target: "flight-deck-door-lever",
      why: "The instant anyone moves toward that door with the situation already tense, the reinforcement lever stops being a step for later and becomes the one thing that matters most right now — waiting for them to actually reach the door is waiting too long.",
      missNote: "The passenger kept moving toward the flight deck door while it sat unreinforced. That is exactly the outcome this entire procedure exists to prevent.",
      wrongNote: "Reinforce the door now — nothing else in this cabin matters more the moment someone is moving toward it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = root;
    stationPad(g, 2.7, CAUP_ACCENT);

    const cabin = cabinInterior(g, 0, 0, 0, { livery: { colour: 0x5a3a52 } });
    const { door, galley } = cabin.userData.parts;
    holoTag(cabin, "cabin section", 0, 2.5, 0.5, { css: "#b85fa0", w: 0.4 });

    const procedureCard = decal(g, 0.3, 0.4, -1.3, 1.3, -1.2,
      paperFace("DISRUPTIVE PASSENGER", ["Distance · Calm · Notify", "Captain decides restraint"], { bg: "#fbf3df", band: "#6a2a5a" }), { px: 220 });
    reg(hits, procedureCard, "disruptive-passenger-card");

    const passenger = standingFigure(g, 0.65, 1.35, { ry: -2.4, cloth: 0x6b4a3f, skin: 0xc99878 });
    reg(hits, passenger, "notice-cues");
    const distanceSpot = box(g, 0.4, 0.02, 0.4, -0.9, 0.001, -0.09, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, distanceSpot, "keep-distance");

    const brokenBottle = box(g, 0.05, 0.16, 0.05, 0.55, 0.9, 0.55, 0x59925a, { rough: 0.3, metal: 0.1, opacity: 0.85, transparent: true });
    holoTag(brokenBottle, "within reach", 0, 0.14, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, brokenBottle, "improvised-weapon");
    reg(hits, brokenBottle, "improvised-weapon-hazard");
    const blockingCart = box(g, 0.42, 0.7, 0.4, 0, 0.35, 1.3, 0x8b929a, { rough: 0.5, metal: 0.3 });
    holoTag(blockingCart, "blocking the flight deck path", 0, 0.78, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, blockingCart, "blocked-deck-path");
    reg(hits, blockingCart, "blocked-deck-path-hazard");

    const crewAlertPanel = instrument(g, 1.4, 1.4, -1.6, { idle: "ALERT?", color: CAUP_ACCENT, w: 0.16, d: 0.2, ry: -0.6 });
    holoTag(crewAlertPanel, "crew alert", 0, 0.2, 0, { css: "#b85fa0", w: 0.36 });
    reg(hits, crewAlertPanel, "crew-alert-code");
    reg(hits, crewAlertPanel, "crew-alert-panel");

    const scriptPanel = holoPanel(g, 0.5, 0.36, -0.9, 1.5, 0.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,10,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b85fa0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f6e2ef";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CALM APPROACH", w * 0.06, h * 0.22);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillText("Tone · Acknowledge · Choice", w * 0.06, h * 0.55);
    }, { accent: CAUP_ACCENT, ry: 0.5 });
    const toneMark = box(scriptPanel, 0.06, 0.06, 0.02, -0.18, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, toneMark, "calm-tone");
    const ackMark = box(scriptPanel, 0.06, 0.06, 0.02, 0, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, ackMark, "acknowledge-concern");
    const choiceMark = box(scriptPanel, 0.06, 0.06, 0.02, 0.18, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, choiceMark, "offer-choice");

    const argueBackCard = decal(g, 0.24, 0.14, 0.9, 0.9, 0.4,
      paperFace("", ["\"CALM DOWN", "RIGHT NOW\""], { bg: "#fbe0df", band: "#c9302b" }), { px: 160 });
    reg(hits, argueBackCard, "argue-back-decoy");

    const interphoneCaptain = box(galley, 0.08, 0.16, 0.06, 0, 1.1, -0.2, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(interphoneCaptain, "call flight deck", 0, 0.14, 0, { css: "#b85fa0", w: 0.36 });
    reg(hits, interphoneCaptain, "interphone-captain");

    reg(hits, door, "flight-deck-door-lever");
    const doorLever = box(door, 0.05, 0.14, 0.03, -0.06, 0.9, 0.1, 0xf2c14b, { rough: 0.5, metal: 0.2 });
    void doorLever;

    const nearbyRows = box(g, 0.9, 0.02, 0.9, 1.1, 0.001, 0.9, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, nearbyRows, "nearby-passengers");

    const restraintKit = box(g, 0.28, 0.14, 0.2, 0.6, 0.85, 0.6, 0xf2c14b, { rough: 0.6 });
    holoTag(restraintKit, "restraint kit", 0, 0.14, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, restraintKit, "restraint-kit");
    reg(hits, restraintKit, "premature-restraint-decoy");
    const stagingSpot = box(galley, 0.4, 0.15, 0.2, 0, 1.2, -0.15, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["staging-spot"] = stagingSpot;

    const captainAuthPanel = holoPanel(g, 0.5, 0.34, 1.4, 1.6, -0.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,10,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b85fa0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f6e2ef";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CAPTAIN'S WORD", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Restraint: not authorized", w * 0.06, h * 0.6);
    }, { accent: CAUP_ACCENT, ry: -0.7 });
    reg(hits, captainAuthPanel, "captain-authorization-panel");

    const incidentLog = holoPanel(g, 0.5, 0.34, -1.4, 1.6, 0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,10,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b85fa0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f6e2ef";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("INCIDENT LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: open", w * 0.06, h * 0.6);
    }, { accent: CAUP_ACCENT, ry: 0.7 });
    reg(hits, incidentLog, "incident-log");
    const debriefMark = box(incidentLog, 0.1, 0.1, 0.02, 0.15, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, debriefMark, "debrief-request");

    const attendant = standingFigure(g, -0.9, 1.35, { ry: 1.6, cloth: 0x1c3a5c, skin: 0xb98a63 });
    void attendant;

    return {
      hits,
      footprint: 2.7,
      spawnLook: new THREE.Vector3(-0.3, 1.2, -0.6),

      onStepComplete(step) {
        if (step.id === "scan-area") { brokenBottle.material = mat(0x59c97b, { rough: 0.3 }); blockingCart.material = mat(0x59c97b, { rough: 0.5, metal: 0.3 }); }
        if (step.id === "alert-crew") repaint(crewAlertPanel.userData.screen, signFace("SENT", { bg: "#0d1c24", accent: "#f2c14b", fg: "#f6e2ef", scale: 0.5 }));
        if (step.id === "secure-flight-deck-door") { /* door lever colour handled below */ }
        if (step.id === "captain-authorizes") {
          repaint(captainAuthPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(24,10,20,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#b85fa0"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#f6e2ef";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("CAPTAIN'S WORD", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Confirmed on record", w * 0.06, h * 0.6);
          });
        }
        if (step.id === "log-incident") {
          repaint(incidentLog.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(24,10,20,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#b85fa0"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#f6e2ef";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("INCIDENT LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: logged", w * 0.06, h * 0.6);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "bystander-films-and-encourages") nearbyRows.material = mat(0xf0645b, { opacity: 0.35, transparent: true });
        if (it.id === "passenger-moves-toward-deck") passenger.position.z += 0.3;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bystander-films-and-encourages") nearbyRows.material = mat(0xffffff, { opacity: 0.001, transparent: true });
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "confirm-alert-sent") {
          repaint(crewAlertPanel.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, {
            bg: "#0d1c24", accent: gg.t >= 0.7 ? "#59c97b" : "#f0645b", fg: "#f6e2ef", scale: 0.55,
          }));
        }
        void t;
      },
    };
  },
};
