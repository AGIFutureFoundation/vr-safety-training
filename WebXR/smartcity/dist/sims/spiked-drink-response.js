import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, mat, counter, seatedFigure, standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Spiked Drink Response VR — Bartending, station three.
// Drink tampering is a patron-safety problem the whole floor watches for
// together: the rail nobody leaves unattended, the safe-word scheme posted
// where a guest can ask for it without saying it out loud, and — when it has
// already happened — a response that treats it as what it is: a possible
// crime scene with a patient in it. Nothing here is about proving what
// happened; it is about not letting the two things that make it worse
// happen next, a second dose and a stranger walking the patient out the door.

const SDR_ACCENT = 0x2fb8a3;

export const SIM_SPIKED_DRINK_RESPONSE = {
  id: "spiked-drink-response",
  index: "135",
  domain: "Culinary & Hospitality",
  trade: "Bartender — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "The California ABC Responsible Beverage Service (RBS) Training Program Act's guidance on patron safety; the county Environmental Health department's food-contact standards for glassware a suspect drink is decanted into (NSF-certified, sealed, and never poured out); OSHA 29 CFR 1910.1030 bloodborne pathogens for any contact with an unconscious or vomiting patron; the local police non-emergency line and UNITE HERE Local 2's own guidance on staff never escorting a patron alone",
  name: "Spiked Drink Response",
  title: simTitle("Spiked Drink Response"),
  tagline: "Watching the rail, the safe-word scheme, and the response once a drink is actually suspect — remove it, retain it, stay with her, call it in",
  accent: SDR_ACCENT,
  accentCss: "#2fb8a3",
  parSeconds: 280,
  footprint: 2.8,
  badge: { id: "never-alone", name: "Never Alone", note: "The drink retained, the patron never left with a stranger, and the report written before the shift ended" },

  game: system({
    name: "Patron Safety",
    currency: "WATCH",
    ranks: ["Barback", "Service Bartender", "Shift Lead", "Bar Manager", "RBS Certified Trainer"],
    badges: [
      { id: "rail-clean", name: "Rail Clean", note: "Every unattended drink on the rail caught in one pass", test: AWARD.stepClean("rail-sweep") },
      { id: "stayed-with-her", name: "Stayed With Her", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "held-the-watch", name: "Held the Watch", note: "Both watch periods held the full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "fast-and-calm", name: "Fast and Calm", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-corrections", name: "No Corrections", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "pour-out-suspect": "That is the sink, and the suspect glass is in your hand next to it. Pouring out a drink that might be spiked destroys the one piece of physical evidence anybody will ever have — it gets capped and kept, never rinsed away because the bar was busy.",
    "unattended-bag-open": "Her bag has been sitting open on the rail with nobody's hand on it since this started. An unattended bag next to an unattended patron is the second half of the same problem — anything in reach of the rail is in reach of anybody standing at it.",
    "let-stranger-carry": "You let somebody you don't know pick her up and start walking. \"I've got her, I'll get her home\" from a stranger is the single most dangerous sentence said around a spiked drink, and it is refused before it is questioned.",
    "smoke-break-alone": "You sent her outside for air on her own. A patron who may have been dosed does not get better with fresh air, and alone in a parking lot is the last place anybody watching for her wants her to be.",
  },

  steps: [
    {
      id: "rail-sweep", kind: "find", noHint: true,
      targets: ["unattended-drink-1", "unattended-drink-2", "unattended-drink-3"],
      itemNames: {
        "unattended-drink-1": "unattended drink, no coaster",
        "unattended-drink-2": "unattended drink, owner across the room",
        "unattended-drink-3": "unattended drink, left mid-conversation",
      },
      itemNotes: {
        "unattended-drink-1": "No coaster, no hand on the glass, and nobody within arm's reach of it — thirty seconds is all tampering ever needs.",
        "unattended-drink-2": "Its owner is at the far end of the bar with her back turned. The glass has been alone longer than she has been away.",
        "unattended-drink-3": "Left mid-sentence to say hello to somebody two tables over — a drink does not need to be forgotten to be unattended, just unwatched.",
      },
      decoyNotes: {
        "covered-drink": "That one has a coaster over the top and a hand resting on the stool beside it. Covered and watched is exactly the habit this whole station is teaching — leave it alone.",
      },
      title: "Sweep the rail for drinks nobody is watching",
      cue: "Walk the rail once. Three drinks are sitting with nobody's eyes or hand on them.",
      why: "The rail is the easiest place in the bar to tamper with a drink, because it is the one surface where a glass regularly sits further from its owner than an arm can reach — watching it is not paranoia, it is the same habit as watching a till.",
    },
    {
      id: "angela-poster", kind: "select", target: "angela-poster",
      title: "Confirm the safe-word scheme is posted where it works",
      cue: "Check the restroom-hallway poster: how a guest can ask for help without saying it to the room.",
      why: "An \"Ask for Angela\"-style scheme only works if a guest already knows the phrase and where to say it before she needs it — posted in the one place she can read it alone, away from whoever she might be asking for help about.",
    },
    {
      id: "patron-report", kind: "select", target: "patron-flag",
      title: "Take the report seriously the first time it is said",
      cue: "She says her drink tastes wrong, or her friend is far more impaired than her count explains. Either one starts this.",
      why: "\"It tastes wrong\" and \"she's had three, not eight\" are both the same report in different words — a taste, a smell or a level of impairment that does not match what was actually served, and neither one waits for a second opinion before it is acted on.",
    },
    {
      id: "remove-drink", kind: "drag", target: "suspect-glass",
      title: "Remove the drink and retain it",
      cue: "Take the glass off the bar and move it to the evidence tray — do not tip it out.",
      drag: { to: "evidence-tray", radius: 0.45, missNote: "Not on the tray. A suspect drink set down anywhere else in a working bar gets picked up, rinsed or poured out inside a minute." },
      why: "The glass is the only physical evidence this ever produces. Removed from where anybody could touch it again and kept exactly as poured, it is worth something to a lab; rinsed at the end of a busy shift, it is worth nothing to anybody.",
    },
    {
      id: "seal-evidence", kind: "turn", target: "evidence-seal",
      title: "Seal the tray with a tamper-evident cap",
      cue: "Turn the cap until it locks — nobody adds to it or pours it out from here.",
      turn: { turns: 1, axis: "y", label: "SEAL" },
      why: "A sealed tray is a chain of custody with one link in it: you. An unsealed glass sitting behind the bar is just a drink again the moment anybody else has a reason to move it.",
    },
    {
      id: "assess-symptoms", kind: "gauge", target: "responsiveness-check",
      title: "Check how she is actually responding",
      cue: "Ask her a simple question and read how clearly she answers it.",
      gauge: { label: "RESP", speed: 0.7, green: [0.55, 1.0], readout: (t) => (t < 0.55 ? "slow, confused" : "answering clearly"), missNote: "That is a slow, confused answer to a simple question. This has stopped being 'had too much' and started being a medical situation — treat it that way now." },
      why: "The count on her tab and the way she is actually responding either match or they do not, and when they do not, the mismatch itself is the finding — it is what tells you this is bigger than overservice.",
    },
    {
      id: "stay-with-patron", kind: "hold", target: "stay-close-point", seconds: 6,
      title: "Stay with her — do not step away to make calls",
      cue: "Stay at arm's length while the rest of what needs to happen gets handed to somebody else.",
      why: "The one job that cannot be delegated is staying with her. Everything else — the call, the door, the CCTV — can be somebody else's hands; leaving her alone even to dial a phone is the gap this exact scheme exists to close.",
      holdBreakNote: "You stepped away from her to handle something else. The whole point of the response is that somebody stays within reach of her the entire time — that job does not get to sit empty even for a phone call.",
    },
    {
      id: "verify-escort", kind: "select", target: "known-contact",
      title: "Hand her off only to somebody you can actually verify",
      cue: "Check ID or a name she already gave you before anybody besides EMS takes her anywhere.",
      why: "\"I'll get her home\" is not a credential. A verified name, a phone already in her contacts, or a friend who has been at the table the whole night is the only kind of escort that is ever good enough to release her to.",
    },
    {
      id: "call-for-help", kind: "sequence",
      targets: ["call-medical", "call-police"],
      itemNames: { "call-medical": "call medical (911)", "call-police": "call police" },
      title: "Call for medical help, then the police",
      cue: "Medical first — she is the priority — then police for the drink itself.",
      why: "Her condition is the emergency; the drink is the investigation. Medical goes first because nothing about proving what happened matters if she is not being watched by somebody trained to catch it getting worse.",
      outOfOrderNote: "Medical first, then police — a suspected tampering is worth reporting, but not ahead of the patient it happened to.",
    },
    {
      id: "brief-door-staff", kind: "select", target: "door-radio",
      title: "Brief the door on who not to let leave with her",
      cue: "Describe the stranger to whoever is working the door before they reach it.",
      why: "The door is the only chokepoint in the whole building. A description called ahead of them is the difference between the door stopping the one person you actually need stopped and just watching two more people walk out.",
    },
    {
      id: "preserve-cctv", kind: "select", target: "cctv-lock",
      title: "Lock the camera footage covering this window",
      cue: "Flag and save the CCTV segment before it cycles out of storage.",
      why: "Most systems overwrite themselves in days, sometimes hours. Locking the segment tonight is the only reason there is anything left to hand to police by the time anybody asks for it.",
    },
    {
      id: "continue-watch", kind: "track", target: "rail-scan-dial", seconds: 7,
      title: "Keep sweeping the rail while the rest of this plays out",
      cue: "Keep your attention moving across the rail — this is not the only drink on it tonight.",
      track: {
        start: 0.5, green: [0.3, 0.75], rise: 0.5, fall: 0.4, drift: 0.14, label: "RAIL SCAN",
        readout: (v) => (v < 0.3 ? "fixed on one spot" : v > 0.75 ? "lost the rail" : "sweeping"),
      },
      why: "One tampered drink does not mean the rail is safe again for the rest of the night — it means somebody in the room has already shown they will do it, and a steady sweep is the only thing standing between this incident and the next one.",
      holdBreakNote: "Your attention locked onto one spot or drifted off the rail entirely. One incident does not mean the rail stops needing watched — if anything it means it needs it more.",
    },
    {
      id: "write-report", kind: "select", target: "incident-log-board",
      title: "Write the report before the shift ends",
      cue: "Time, what she reported, what was retained, who responded, and the outcome.",
      why: "This report is what a lab, a detective or her own family asks for later, and every one of those requests comes after the CCTV has cycled and everybody's memory of tonight has already started to blur.",
    },
  ],

  interrupts: [
    {
      id: "stranger-offers-to-walk-out",
      kind: "Unknown patron intervening",
      after: "stay-with-patron", delay: 3, seconds: 12,
      alert: "A man you don't recognise has picked her bag up off the rail and is saying he'll walk her out to get some air.",
      cue: "Nobody you know just picked up her bag.",
      target: "patron-bag",
      why: "\"I've got her\" from somebody who was not at her table thirty seconds ago is not help, it is the exact scenario this whole response exists to stop — the bag comes back to her hand and he does not leave with either of them.",
      missNote: "He walked off with her bag in his hand and her a step behind him. Everything retained, sealed and called in up to this point protected the investigation; it did nothing for her the moment a stranger got her out the door.",
      wrongNote: "It is the bag in the stranger's hand. Whatever else is happening, that does not leave with somebody nobody at this bar knows.",
    },
    {
      id: "unattended-drink-leaned-over",
      kind: "Second drink at risk",
      after: "continue-watch", delay: 3, seconds: 12,
      alert: "Two stools down, a fresh drink is sitting alone on the rail while somebody leans in close over it, hand near the glass.",
      cue: "That is exactly what you just swept the rail for.",
      target: "abandoned-rail-drink",
      why: "One incident tonight does not make the rail safer for the rest of the shift — a drink left alone with a hand hovering over it is the same risk you already caught once, and it gets the same response: move it or stay on it, immediately.",
      missNote: "The glass sat there through the lean and past it. The habit this station teaches is watching the rail continuously, not until the first save of the night feels like enough.",
      wrongNote: "It is the drink on the rail with a hand over it. That is the pattern repeating in front of you.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, SDR_ACCENT);

    // -------------------------------------------------------------- bar top
    const barTop = counter(g, 6.4, 0.66, 0, -3.25, 0x3d2a1e, { height: 1.05, metal: 0.1, rough: 0.4, undershelf: false });
    box(barTop, 6.6, 0.05, 0.1, 0, 1.08, 0.33, 0xb8862b, { rough: 0.4, metal: 0.5, finish: "brushed" });

    // ------------------------------------------------------------ the rail
    // Six drinks along the customer edge of the counter: three unattended
    // (the sweep), one covered and watched (the decoy), one suspect glass,
    // and one that becomes the second incident.
    const railY = 1.11, railZ = -2.95;
    const RAIL = [
      { x: -2.6, id: "unattended-drink-1", color: 0xf2c14b },
      { x: -1.7, id: "unattended-drink-2", color: 0xdfa23b },
      { x: -0.2, id: "covered-drink", color: 0x8fb3c4, covered: true },
      { x: 0.9, id: "unattended-drink-3", color: 0xf0645b },
      { x: 2.6, id: "abandoned-rail-drink", color: 0x59c97b },
    ];
    for (const d of RAIL) {
      const glass = cyl(g, 0.035, 0.03, 0.12, d.x, railY, railZ, d.color, { rough: 0.15, metal: 0, opacity: 0.75, transparent: true, seg: 12 });
      if (d.covered) {
        cyl(g, 0.04, 0.04, 0.01, d.x, railY + 0.07, railZ, 0xdfe4e8, { rough: 0.5, seg: 12 }); // coaster on top
        holoTag(g, "Covered · watched", d.x, railY + 0.24, railZ, { css: "#59c97b", w: 0.36 });
      } else {
        holoTag(g, "Unwatched", d.x, railY + 0.2, railZ, { css: "#f0645b", w: 0.28 });
      }
      reg(hits, glass, d.id);
    }

    // The suspect glass, set slightly apart at the patron's own seat.
    const suspectGlass = cyl(g, 0.038, 0.032, 0.13, 1.9, railY, -2.55, 0xf2a23b, { rough: 0.15, metal: 0, opacity: 0.8, transparent: true, seg: 12 });
    holoTag(g, "Tastes wrong", 1.9, railY + 0.24, -2.55, { css: "#f2a23b", w: 0.32 });
    reg(hits, suspectGlass, "suspect-glass");

    // Evidence tray and its tamper seal, on the staff side.
    const tray = box(g, 0.3, 0.05, 0.22, -2.4, 1.08, -3.55, 0xdfe4e8, { rough: 0.3, metal: 0.4 });
    holoTag(g, "Evidence tray", -2.4, 1.22, -3.55, { css: "#2fb8a3", w: 0.32 });
    reg(hits, tray, "evidence-tray");
    const sealCap = cyl(g, 0.05, 0.05, 0.03, -2.4, 1.16, -3.55, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 14 });
    reg(hits, sealCap, "evidence-seal");

    // Sink — the wrong place for the suspect glass.
    const sink = box(g, 0.5, 0.14, 0.34, -3.3, 0.98, -3.5, 0xc7d0d6, { rough: 0.3, metal: 0.4 });
    holoTag(g, "Rinse sink", -3.3, 1.12, -3.5, { css: "#f0645b", w: 0.28 });
    reg(hits, sink, "pour-out-suspect");

    // Responsiveness check instrument.
    const respCheck = instrument(g, 0.4, 1.12, -3.42, { ry: 0.3, idle: "ASK HER", color: SDR_ACCENT });
    reg(hits, respCheck, "responsiveness-check");

    // Watch points for the two timed steps.
    const stayClose = group(g, 1.9, 0, -2.0);
    ball(stayClose, 0.02, 0, 1.2, 0, SDR_ACCENT, { emissive: SDR_ACCENT, ei: 1.3 });
    reg(hits, stayClose, "stay-close-point");
    const railScan = instrument(g, -0.5, 1.5, -3.9, { ry: 0.1, idle: "SCAN", color: SDR_ACCENT, w: 0.16, d: 0.24 });
    reg(hits, railScan, "rail-scan-dial");

    // Known-contact check, door radio, CCTV lock, incident log.
    const knownContact = decal(g, 0.22, 0.3, -1.2, 1.08, -3.5,
      signFace("ID", { bg: "#0d1c24", accent: "#2fb8a3", scale: 0.55 }), { px: 128 });
    knownContact.rotation.x = -Math.PI / 2;
    holoTag(g, "Verify escort", -1.2, 1.24, -3.5, { css: "#2fb8a3", w: 0.32 });
    reg(hits, knownContact, "known-contact");

    const doorRadio = group(g, -3.3, 0, -3.8);
    box(doorRadio, 0.09, 0.16, 0.05, 0, 1.1, 0, 0x2b3138, { rough: 0.5 });
    holoTag(doorRadio, "Brief the door", 0, 1.24, 0, { css: "#2fb8a3", w: 0.34 });
    reg(hits, doorRadio, "door-radio");

    const phone = group(g, -3.0, 0, -3.5);
    box(phone, 0.09, 0.15, 0.035, 0, 1.05, 0, 0x2b3138, { rough: 0.5 });
    holoTag(phone, "Call 911", 0, 1.17, 0, { css: "#f0645b", w: 0.26 });
    reg(hits, phone, "call-medical");
    const radio2 = group(g, -2.7, 0, -3.6);
    box(radio2, 0.08, 0.14, 0.04, 0, 1.05, 0, 0x2b3138, { rough: 0.5 });
    holoTag(radio2, "Call police", 0, 1.16, 0, { css: "#4fd1ff", w: 0.28 });
    reg(hits, radio2, "call-police");

    const cctv = group(g, 3.3, 0, -3.9, 0.3);
    box(cctv, 0.14, 0.1, 0.1, 0, 0, 0, 0x1b1e22, { rough: 0.4, metal: 0.4 });
    const cctvLens = cyl(cctv, 0.03, 0.035, 0.06, 0, 0, 0.08, 0x22262b, { rough: 0.3, metal: 0.5, seg: 12 });
    cctvLens.rotation.x = Math.PI / 2;
    holoTag(cctv, "Lock footage", 0, 2.6, 0.1, { css: "#2fb8a3", w: 0.32 });
    reg(hits, cctv, "cctv-lock");

    const logBoard = holoPanel(g, 0.56, 0.4, -3.6, 2.05, -4.15, (cx, w, h) => {
      cx.fillStyle = "rgba(6,20,18,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#2fb8a3"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#dff7f2";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("PATRON SAFETY LOG", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      cx.fillText("Time · report · retained · responder", w / 2, h * 0.62);
      cx.fillText("Sign once EMS or police has it", w / 2, h * 0.8);
    }, { ry: 0.4, accent: SDR_ACCENT });
    reg(hits, logBoard, "incident-log-board");

    // Restroom-hallway "Ask for Angela" poster, on a side alcove wall.
    const hallway = group(g, 3.6, 0, 1.4, -0.6);
    box(hallway, 0.1, 2.2, 1.4, 0, 1.1, 0, 0x3a2f28, { rough: 0.8 });
    const angela = decal(hallway, 0.5, 0.7, 0.06, 1.3, 0,
      signFace("ASK FOR ANGELA", { bg: "#0d1c24", accent: "#2fb8a3", fg: "#dff7f2", scale: 0.4 }), { px: 256 });
    holoTag(hallway, "Restroom hallway", 0.06, 1.9, 0, { css: "#2fb8a3", w: 0.36 });
    reg(hits, angela, "angela-poster");

    // ------------------------------------------------------------- customers
    function stool(x, z) {
      const st = group(g, x, 0, z);
      cyl(st, 0.16, 0.18, 0.045, 0, 0.73, 0, 0x2b211c, { rough: 0.6, seg: 16 });
      cyl(st, 0.025, 0.025, 0.72, 0, 0.37, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 10 });
      cyl(st, 0.2, 0.2, 0.03, 0, 0.02, 0, 0x1b1512, { rough: 0.6, seg: 16 });
      return st;
    }
    stool(1.9, -2.0); stool(-2.6, -2.0); stool(-0.2, -2.0);

    const patron = seatedFigure(g, 1.9, 0.75, -2.0, { ry: Math.PI - 0.1, cloth: 0x6b4a5a, skin: 0xd9a985 });
    holoTag(patron.torso, "Patron", 0, 0.85, 0, { css: "#2fb8a3", w: 0.24 });
    reg(hits, patron.torso, "patron-flag");

    const friend = seatedFigure(g, -0.2, 0.75, -2.0, { ry: Math.PI + 0.1, cloth: 0x3d4b55, skin: 0xc99878 });
    const regular = seatedFigure(g, -2.6, 0.75, -2.0, { ry: Math.PI, cloth: 0x445566, skin: 0xc99878 });
    void friend; void regular;

    // The patron's bag, sitting on the rail beside her. A second, non-raycast
    // marker sits right beside it for the "open and unattended" hazard — the
    // bag itself is the interrupt's own target, and sharing one hitId-bearing
    // object between a hazard and an interrupt lets the second reg() silently
    // overwrite the first (markInteractive only carries one id per object).
    const bag = box(g, 0.16, 0.12, 0.08, 1.55, 1.1, -2.85, 0x4a3a30, { rough: 0.7 });
    holoTag(g, "Her bag", 1.55, 1.22, -2.85, { css: "#2fb8a3", w: 0.2 });
    reg(hits, bag, "patron-bag");
    const bagOpenMarker = group(g, 1.55, 0, -2.85);
    hits["unattended-bag-open"] = bagOpenMarker;

    // A stranger, standing back near the end of the bar until the interrupt.
    const stranger = standingPerson(g, 3.6, -1.0, { ry: -2.4, cloth: 0x545a5f, hiVis: false });
    holoTag(stranger.torso, "Unknown patron", 0, 1.7, 0, { css: "#f0645b", w: 0.4 });

    // A second figure who leans over the abandoned drink for the second interrupt.
    const leaner = standingPerson(g, 2.4, -1.6, { ry: 2.0, cloth: 0x4a5a4a, hiVis: false });

    // "Let a stranger carry her" and "smoke break alone" — two more traps.
    const carryPoint = group(g, 3.0, 0, -1.4);
    ball(carryPoint, 0.02, 0, 1.3, 0, 0xf0645b, { emissive: 0xf0645b, ei: 1.2 });
    holoTag(carryPoint, "Let him carry her?", 0, 1.45, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, carryPoint, "let-stranger-carry");
    const smokeDoor = group(g, -3.6, 0, 1.0, 0.5);
    box(smokeDoor, 0.1, 2.0, 0.9, 0, 1.0, 0, 0x2a2b31, { rough: 0.7 });
    holoTag(smokeDoor, "Send her out alone?", 0, 2.15, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, smokeDoor, "smoke-break-alone");

    return {
      hits,
      footprint: 2.8,

      onStepComplete(step) {
        if (step.id === "remove-drink") { suspectGlass.position.set(-2.4, 1.14, -3.55); }
        if (step.id === "seal-evidence") { sealCap.material = mat(0x59c97b, { rough: 0.3, metal: 0.6, emissive: 0x59c97b, ei: 0.5 }); }
        if (step.id === "preserve-cctv") { cctvLens.material = mat(0x59c97b, { rough: 0.3, metal: 0.5, emissive: 0x59c97b, ei: 1.0 }); }
        if (step.id === "write-report") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(6,20,18,0.9)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafbf1";
            cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("LOGGED", w / 2, h * 0.4);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            cx.fillStyle = "#b7e6c8";
            cx.fillText("Retained · sealed · reported", w / 2, h * 0.68);
          });
        }
      },

      // The stranger really takes the bag and moves toward the door, and the
      // leaner really closes in over the second drink — both real changes.
      onInterrupt(it) {
        if (it.id === "stranger-offers-to-walk-out") {
          bag.position.set(3.5, 1.05, -1.15);
          stranger.root.position.set(2.9, 0, -1.2);
          stranger.root.rotation.y = -1.9;
        }
        if (it.id === "unattended-drink-leaned-over") {
          leaner.root.position.set(2.55, 0, -2.3);
          leaner.torso.rotation.x = 0.35;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "stranger-offers-to-walk-out") {
          bag.position.set(1.55, 1.1, -2.85);
          stranger.root.position.set(3.6, 0, -1.0);
          stranger.root.rotation.y = -2.4;
        }
        if (it.id === "unattended-drink-leaned-over") {
          leaner.root.position.set(2.4, 0, -1.6);
          leaner.torso.rotation.x = 0;
        }
      },

      animate(t, dt, session) {
        patron.head.rotation.y = Math.sin(t * 0.35) * 0.1;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "assess-symptoms") {
          repaint(respCheck.userData.screen, signFace(gg.t < 0.55 ? "SLOW" : "CLEAR", {
            bg: "#0d1c24", accent: gg.t < 0.55 ? "#f0645b" : "#59c97b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "continue-watch" && tr) {
          repaint(railScan.userData.screen, signFace(tr.v < 0.3 ? "FIXED" : tr.v > 0.75 ? "LOST" : "SCAN", {
            bg: "#0d1c24", accent: tr.v >= 0.3 && tr.v <= 0.75 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
