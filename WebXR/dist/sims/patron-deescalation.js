import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, mat, counter, seatedFigure, standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Patron De-escalation VR — Bartending, station four.
// A customer harassing a bartender or another guest, worked the way the bar
// actually survives it: distance kept, the bar itself used as the barrier it
// already is, the behaviour named once instead of argued with, a second set
// of hands called before anybody is alone with it, and — if a hand crosses
// the bar — the alarm, not another word. Cal/OSHA's workplace violence
// prevention plan (8 CCR §3342, required under SB 553) exists because this
// scenario is common enough in the trade to need a written plan and a log,
// not just good instincts on the night.

const PDE_ACCENT = 0xe8542f;

export const SIM_PATRON_DEESCALATION = {
  id: "patron-deescalation",
  index: "136",
  domain: "Culinary & Hospitality",
  trade: "Bartender — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "Cal/OSHA's workplace violence prevention plan requirement, 8 CCR §3342 under SB 553, including the incident log every bar now has to keep; OSHA 29 CFR 1910.1030 bloodborne pathogens for the moment contact actually breaks skin; NFPA 101's life-safety requirement that the path to the door stays clear of exactly the kind of crowd this scenario draws; the local police non-emergency line as the standing call for a patron who will not leave; UNITE HERE Local 2's own language on never sending one bartender into a confrontation alone",
  name: "Patron De-escalation",
  title: simTitle("Patron De-escalation"),
  tagline: "Distance, the bar as a barrier, naming it once, backup, refusal — and the panic button the instant a hand crosses the bar",
  accent: PDE_ACCENT,
  accentCss: "#e8542f",
  parSeconds: 270,
  footprint: 2.8,
  badge: { id: "held-the-line", name: "Held the Line", note: "De-escalated without raising a voice, hit the alarm the instant it went physical, and got the guest clear of the crowd" },

  game: system({
    name: "Floor Command",
    currency: "CALM",
    ranks: ["Barback", "Service Bartender", "Shift Lead", "Bar Manager", "RBS Certified Trainer"],
    badges: [
      { id: "read-it-first", name: "Read It First", note: "Every harassment cue spotted before naming the behaviour", test: AWARD.stepClean("recognize-harassment") },
      { id: "never-alone", name: "Never Alone in It", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "held-position", name: "Held Position", note: "Both watch periods held the full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "calm-and-fast", name: "Calm and Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-corrections", name: "No Corrections", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "come-around-bar": "You stepped around the end of the bar into his space. The bar is the one barrier in the room that was already built and already worked — coming around it trades a structural advantage for nothing, right when the distance matters most.",
    "raise-voice-back": "You matched his volume instead of staying below it. Two raised voices read as a fight starting to everyone else in the room, including him — de-escalation only works from the one voice in the exchange that stays level.",
    "serve-through-it": "You kept pouring for the table while this was still happening. Serving through an active harassment tells him, the guest and everyone watching that the bar has not actually noticed — and it means his hands stay full of a glass instead of getting the attention they need.",
    "confront-alone": "You walked over to deal with this without calling anyone first. One bartender confronting an escalating patron alone is exactly the situation Cal/OSHA's workplace violence prevention plan was written to stop happening as a matter of routine.",
  },

  steps: [
    {
      id: "recognize-harassment", kind: "find", noHint: true,
      targets: ["sign-unwanted-contact", "sign-guest-distress", "sign-repeated-comments"],
      itemNames: {
        "sign-unwanted-contact": "leaning into her space", "sign-guest-distress": "guest pulling away, not laughing",
        "sign-repeated-comments": "the same comment, repeated",
      },
      itemNotes: {
        "sign-unwanted-contact": "He is closer to her than the seating allows for and closing the gap again every time she creates one.",
        "sign-guest-distress": "She has turned her body away and stopped answering — distress reads in the body a full beat before anybody says a word about it.",
        "sign-repeated-comments": "The same line, said a third time in a different tone, is not a joke that landed badly once — it is testing whether anybody is going to stop him.",
      },
      title: "Recognise it before it becomes a scene",
      cue: "Watch the two of them for a moment. Three signs say this stopped being friendly a while ago.",
      why: "Harassment at a bar rarely announces itself — it is a posture, a body pulling away, and the same line repeated past the point of being funny, and naming that pattern early is what lets you act while it is still small.",
    },
    {
      id: "keep-distance", kind: "hold", target: "bar-barrier-point", seconds: 5,
      title: "Approach and hold position behind the bar",
      cue: "Come over, but stay on your side — let the bar do the work of the distance.",
      why: "The bar top is a barrier that is already built, already between you, and already normal for you to be standing behind — stepping around it is the only way to lose that advantage, so the approach holds position instead.",
      holdBreakNote: "You closed the distance the bar was already giving you. Staying behind it is not hesitation, it is the one piece of the room already doing part of the job for you.",
    },
    {
      id: "reduce-stimulation", kind: "turn", target: "sound-dimmer",
      title: "Take some of the noise out of the room",
      cue: "Turn the music down and the house lights up a step — less to escalate against.",
      turn: { turns: 0.6, axis: "y", label: "HOUSE MIX" },
      why: "A loud room with low light is a room built for anonymity, and anonymity is exactly what a harasser is counting on — turning the mix down does not end the confrontation, it takes away some of the cover it was happening under.",
    },
    {
      id: "name-behavior", kind: "select", target: "name-it-card",
      title: "Name the behaviour once, calmly",
      cue: "State plainly what he is doing — not what you think of him for doing it.",
      why: "One flat, factual sentence about the behaviour — not an insult, not a question — removes his ability to claim he did not realise, and it does that without giving him anything to argue back against.",
    },
    {
      id: "offer-exit", kind: "select", target: "guest-exit-offer",
      title: "Give the guest a way out of the conversation",
      cue: "Offer her a seat somewhere else at the bar, on you.",
      why: "The fastest way to end a harassment in progress is often not confronting the harasser at all — it is giving the person on the other end of it an exit that does not require her to make a scene to take it.",
    },
    {
      id: "call-second-staff", kind: "select", target: "backup-radio",
      title: "Call a second set of hands before this goes further",
      cue: "Get a coworker over now — not after it escalates.",
      why: "A second staff member changes the shape of the whole interaction: it is no longer one bartender's word against a customer's, and it means somebody is free to watch the room while you talk.",
    },
    {
      id: "refuse-ask-leave", kind: "sequence",
      targets: ["state-refusal", "ask-to-leave", "give-warning"],
      itemNames: { "state-refusal": "state refusal of service", "ask-to-leave": "ask him to leave", "give-warning": "warn that police will be called" },
      title: "Refuse service and ask him to leave, in that order",
      cue: "Cut him off first, then ask him to go, then say what happens if he does not.",
      why: "Refusing service removes his reason to still be sitting there; asking him to leave gives him the chance to go on his own terms; the warning only means anything once both of those have already been said and he is still in the room.",
      outOfOrderNote: "Refuse service, then ask him to leave, then warn about police — leading with the threat before he has even been told to go reads as a dare, not a decision that is already made.",
    },
    {
      id: "assess-escalation", kind: "gauge", target: "tension-gauge",
      title: "Read whether this is actually cooling off",
      cue: "Watch him for a beat and gauge whether the room is settling or still hot.",
      gauge: { label: "TENSION", speed: 0.68, green: [0.05, 0.28], readout: (t) => (t < 0.28 ? "cooling" : "still hot"), missNote: "That reads as still hot, not cooling. A situation that has not actually settled gets security or police called now, not given another few minutes to sort itself out." },
      why: "De-escalation either works inside the first minute or it does not, and the only way to know which is watching for it rather than assuming the quiet after a warning means it is over.",
    },
    {
      id: "security-call", kind: "select", target: "security-phone",
      title: "Call security or the police non-emergency line",
      cue: "If it is still hot, make the call now — do not wait for it to get worse first.",
      why: "The police non-emergency line exists precisely for a patron who will not leave and is not yet an active emergency — using it here is not overreacting, it is the step between a refusal and a 911 call that this whole sequence is built to reach for in time.",
    },
    {
      id: "crowd-watch", kind: "track", target: "crowd-scan-point", seconds: 6,
      title: "Watch the room while this plays out",
      cue: "Keep your attention moving across the floor, not locked on the one table.",
      track: {
        start: 0.5, green: [0.3, 0.75], rise: 0.5, fall: 0.4, drift: 0.14, label: "ROOM SCAN",
        readout: (v) => (v < 0.3 ? "fixed on the table" : v > 0.75 ? "lost the room" : "scanning"),
      },
      why: "A confrontation like this one draws an audience faster than it draws a fight, and the audience is its own problem — a bartender watching only the table in front of them misses a crowd closing in from every other direction.",
      holdBreakNote: "Your attention locked onto the table or drifted off the floor. The confrontation is not the only thing moving in the room right now.",
    },
    {
      id: "move-guest", kind: "drag", target: "harassed-guest",
      title: "Get the guest clear — behind the bar or to the exit",
      cue: "Move her away from the table, either behind the bar with you or straight to the door.",
      drag: { to: "safe-exit", radius: 0.55, missNote: "Not clear of the table. Leaving her in the middle of a crowd that is already closing in undoes everything else that just happened." },
      why: "Once a crowd starts closing in, the harassed guest's safety stops being about the conversation and becomes about geography — getting her physically clear of the crowd is worth more than anything else said in this moment.",
    },
    {
      id: "wvpp-log", kind: "select", target: "wvpp-log-board",
      title: "Log it in the workplace violence prevention plan",
      cue: "Write the incident into the log Cal/OSHA's plan requires — what happened, who responded, how it ended.",
      why: "Cal/OSHA's workplace violence prevention plan under 8 CCR §3342 is not satisfied by handling an incident well once — it requires the log entry that turns tonight into a pattern the next safety committee meeting can actually see.",
    },
    {
      id: "debrief", kind: "select", target: "debrief-board",
      title: "Debrief with the team before the shift ends",
      cue: "Walk the coworkers who were there through what happened and what worked.",
      why: "A five-minute debrief while the details are still fresh is what turns one bartender's experience into the whole shift's habit — skipped, the same situation gets relearned from scratch by whoever is behind the bar next time.",
    },
  ],

  interrupts: [
    {
      id: "wrist-grab",
      kind: "Physical contact across the bar",
      after: "keep-distance", delay: 2, seconds: 10,
      alert: "He has reached across the bar top and grabbed your coworker's wrist.",
      cue: "A hand just crossed the bar. This is not a conversation anymore.",
      target: "panic-button",
      why: "The instant a hand crosses the bar, the response stops being verbal — the panic button under the till calls for help faster than shouting across the room does, and it does it without anyone having to get closer to be heard.",
      missNote: "The grab held for several seconds before anybody reached the alarm. Once contact happens, every second spent still trying to talk it down is a second the coworker is being held onto.",
      wrongNote: "It is the panic button, not whatever else is in reach. The register, the tap, the phone — none of them call the rest of the building the way that one does.",
    },
    {
      id: "crowd-films-and-closes-in",
      kind: "Bystanders crowding in",
      after: "crowd-watch", delay: 3, seconds: 12,
      alert: "Somebody nearby has their phone up filming, and the crowd around the table has closed in tighter.",
      cue: "The guest is now boxed in by people who are only there to watch.",
      target: "harassed-guest",
      why: "A crowd that closes in to watch is not helping and is not harmless either — it traps the person you are trying to protect inside a ring of bodies, and the only fix is getting her physically out of it, not asking the crowd to move.",
      missNote: "She stayed boxed in while the crowd got thicker and the filming kept going. Whatever gets said next, she is still standing inside a ring of strangers until somebody physically moves her out of it.",
      wrongNote: "It is the guest herself. Get her clear of the crowd before anything else about this moment gets resolved.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, PDE_ACCENT);

    // -------------------------------------------------------------- bar top
    const barTop = counter(g, 6.4, 0.66, 0, -3.25, 0x3d2a1e, { height: 1.05, metal: 0.1, rough: 0.4, undershelf: false });
    box(barTop, 6.6, 0.05, 0.1, 0, 1.08, 0.33, 0xb8862b, { rough: 0.4, metal: 0.5, finish: "brushed" });
    reg(hits, barTop, "bar-barrier-point");

    // Panic button, tucked under the till on the staff side — deliberately not
    // the same control as the till, the radio or the phone.
    const panicMount = group(g, -1.3, 0, -3.5);
    box(panicMount, 0.1, 0.1, 0.08, 0, 0.9, 0, 0x1b1e22, { rough: 0.5 });
    const panicButton = cyl(panicMount, 0.03, 0.03, 0.02, 0, 0.96, 0.03, 0xf0645b, { emissive: 0xf0645b, ei: 0.9, rough: 0.4, seg: 16 });
    holoTag(panicMount, "Panic button", 0, 1.06, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, panicButton, "panic-button");

    // POS / till, security phone and backup radio.
    const pos = instrument(g, -1.6, 1.12, -3.42, { ry: -0.4, idle: "TAB OPEN", color: 0x2b3138, w: 0.2, d: 0.26 });
    void pos;
    const securityPhone = group(g, -2.6, 0, -3.6);
    box(securityPhone, 0.09, 0.15, 0.035, 0, 1.05, 0, 0x2b3138, { rough: 0.5 });
    holoTag(securityPhone, "Non-emergency line", 0, 1.17, 0, { css: "#e8542f", w: 0.4 });
    reg(hits, securityPhone, "security-phone");
    const backupRadio = group(g, -3.2, 0, -3.85);
    box(backupRadio, 0.09, 0.16, 0.05, 0, 1.1, 0, 0x2b3138, { rough: 0.5 });
    holoTag(backupRadio, "Call backup", 0, 1.24, 0, { css: "#e8542f", w: 0.3 });
    reg(hits, backupRadio, "backup-radio");

    // Sound / lighting dimmer.
    const dimmer = group(g, -2.2, 0, -3.9);
    box(dimmer, 0.1, 0.14, 0.04, 0, 1.05, 0, 0x2b3138, { rough: 0.5 });
    const dimmerKnob = cyl(dimmer, 0.025, 0.025, 0.03, 0, 1.11, 0.03, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 12 });
    holoTag(dimmer, "House mix", 0, 1.24, 0, { css: "#e8542f", w: 0.28 });
    reg(hits, dimmerKnob, "sound-dimmer");

    // "Name it" card, refusal/leave/warning script, tension gauge.
    const nameCard = decal(g, 0.22, 0.3, -0.9, 1.08, -3.5,
      signFace("NAME IT", { bg: "#0d1c24", accent: "#e8542f", scale: 0.5 }), { px: 128 });
    nameCard.rotation.x = -Math.PI / 2;
    holoTag(g, "Name the behaviour", -0.9, 1.24, -3.5, { css: "#e8542f", w: 0.44 });
    reg(hits, nameCard, "name-it-card");

    const script = group(g, -1.9, 0, -1.85);
    const scriptSpec = [
      ["state-refusal", "Refuse service", 0.55], ["ask-to-leave", "Ask him to leave", 0.75], ["give-warning", "Warn: police next", 0.95],
    ];
    for (const [id, label, y] of scriptSpec) {
      const marker = ball(script, 0.022, 0, y, 0, PDE_ACCENT, { emissive: PDE_ACCENT, ei: 1.4 });
      holoTag(script, label, 0.16, y, 0, { css: "#e8542f", w: 0.42 });
      reg(hits, marker, id);
    }

    const tensionGauge = instrument(g, 0.5, 1.12, -3.42, { ry: 0.3, idle: "READ THE ROOM", color: PDE_ACCENT, w: 0.2 });
    reg(hits, tensionGauge, "tension-gauge");

    // Watch points and the guest's exit offer.
    const guestExit = group(g, -1.5, 0, -2.0);
    ball(guestExit, 0.02, 0, 1.2, 0, PDE_ACCENT, { emissive: PDE_ACCENT, ei: 1.3 });
    holoTag(guestExit, "Offer a seat here", 0, 1.35, 0, { css: "#e8542f", w: 0.4 });
    reg(hits, guestExit, "guest-exit-offer");
    const crowdScan = instrument(g, 1.6, 1.6, -1.0, { ry: 0.6, idle: "SCAN", color: PDE_ACCENT, w: 0.16, d: 0.22 });
    reg(hits, crowdScan, "crowd-scan-point");

    // Four wrong moves, each its own registered trap.
    const passThrough = group(g, 3.35, 0, -2.9);
    box(passThrough, 0.5, 0.02, 0.5, 0, 0.01, 0, 0xf0645b, { rough: 0.7, emissive: 0xf0645b, ei: 0.3 });
    holoTag(passThrough, "Come around the bar?", 0, 0.14, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, passThrough, "come-around-bar");
    const raiseVoice = group(g, -0.5, 0, -3.75);
    ball(raiseVoice, 0.03, 0, 1.5, 0, 0xf0645b, { emissive: 0xf0645b, ei: 1.3 });
    holoTag(raiseVoice, "Match his volume?", 0, 1.63, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, raiseVoice, "raise-voice-back");
    const serveThrough = group(g, -1.6, 0, -2.55);
    cyl(serveThrough, 0.035, 0.03, 0.12, 0, 1.11, 0, 0xf2c14b, { rough: 0.15, transparent: true, opacity: 0.75, seg: 12 });
    holoTag(serveThrough, "Keep pouring for him?", 0, 1.3, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, serveThrough, "serve-through-it");
    const confrontAlone = group(g, -0.9, 0, -1.6);
    ball(confrontAlone, 0.025, 0, 1.3, 0, 0xf0645b, { emissive: 0xf0645b, ei: 1.2 });
    holoTag(confrontAlone, "Go over alone?", 0, 1.44, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, confrontAlone, "confront-alone");

    // Safe exit / behind-the-bar socket for the drag step.
    const safeExit = group(g, -3.6, 0, -3.6);
    box(safeExit, 0.1, 2.0, 0.9, 0, 1.0, 0, 0x2a2b31, { rough: 0.7 });
    holoTag(safeExit, "Behind the bar", 0, 2.15, 0, { css: "#59c97b", w: 0.36 });
    reg(hits, safeExit, "safe-exit");

    // Log board and debrief board.
    const logBoard = holoPanel(g, 0.56, 0.4, -3.6, 2.05, -4.15, (cx, w, h) => {
      cx.fillStyle = "rgba(24,10,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e8542f"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fde3d8";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("WORKPLACE VIOLENCE LOG", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      cx.fillText("8 CCR §3342 · what happened · outcome", w / 2, h * 0.62);
      cx.fillText("File before the shift closes out", w / 2, h * 0.8);
    }, { ry: 0.4, accent: PDE_ACCENT });
    reg(hits, logBoard, "wvpp-log-board");

    const debriefBoard = holoPanel(g, 0.5, 0.34, 1.5, 2.0, -3.9, (cx, w, h) => {
      cx.fillStyle = "rgba(24,10,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e8542f"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fde3d8";
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("SHIFT DEBRIEF", w / 2, h * 0.36);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillStyle = "#f2c2b0";
      cx.fillText("Walk the whole shift through it", w / 2, h * 0.68);
    }, { ry: -0.4, accent: PDE_ACCENT });
    reg(hits, debriefBoard, "debrief-board");

    // ------------------------------------------------------------- customers
    function stool(x, z) {
      const st = group(g, x, 0, z);
      cyl(st, 0.16, 0.18, 0.045, 0, 0.73, 0, 0x2b211c, { rough: 0.6, seg: 16 });
      cyl(st, 0.025, 0.025, 0.72, 0, 0.37, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 10 });
      cyl(st, 0.2, 0.2, 0.03, 0, 0.02, 0, 0x1b1512, { rough: 0.6, seg: 16 });
      return st;
    }
    stool(-1.8, -2.0); stool(1.3, -2.0);

    // The harassed guest, seated and pulling away.
    const guest = seatedFigure(g, -1.8, 0.75, -2.0, { ry: Math.PI + 0.35, cloth: 0x6b4a5a, skin: 0xc99878 });
    guest.torso.rotation.y = 0.3;
    guest.head.rotation.y = 0.35;
    holoTag(guest.torso, "Harassed guest", 0, 0.85, 0, { css: "#e8542f", w: 0.36 });
    reg(hits, guest.torso, "harassed-guest");
    reg(hits, guest.head, "sign-guest-distress");

    // The harassing customer, standing and leaning across toward the coworker.
    const aggressor = standingPerson(g, -0.9, -2.55, { ry: Math.PI + 0.2, cloth: 0x4a3a3a, hiVis: false });
    aggressor.torso.rotation.x = 0.22;
    holoTag(aggressor.torso, "Harassing customer", 0, 1.7, 0, { css: "#e8542f", w: 0.4 });
    reg(hits, aggressor.torso, "sign-unwanted-contact");
    const commentTag = group(aggressor.torso, 0.2, 1.55, 0.1);
    ball(commentTag, 0.016, 0, 0, 0, PDE_ACCENT, { emissive: PDE_ACCENT, ei: 1.3 });
    reg(hits, commentTag, "sign-repeated-comments");

    // An ambient regular, uninvolved, seated further down.
    const regular = seatedFigure(g, 1.3, 0.75, -2.0, { ry: Math.PI, cloth: 0x3d4b55, skin: 0xd9a985 });
    void regular;

    // Coworker bartender on the staff side, near the register.
    const coworker = standingPerson(g, -0.9, -3.55, { ry: 0.0, cloth: 0x2f5a45, hiVis: false });

    // Bystanders who will close in around the guest on the second interrupt.
    const bystanderA = standingPerson(g, 2.6, -0.6, { ry: -2.0, cloth: 0x545a5f, hiVis: false });
    const bystanderB = standingPerson(g, 2.9, -1.6, { ry: -2.6, cloth: 0x4a5a4a, hiVis: false });

    return {
      hits,
      footprint: 2.8,

      onStepComplete(step) {
        if (step.id === "reduce-stimulation") { dimmerKnob.material = mat(0x59c97b, { rough: 0.3, metal: 0.6, emissive: 0x59c97b, ei: 0.5 }); }
        if (step.id === "name-behavior") { repaint(nameCard, signFace("NAMED", { bg: "#0d1c24", accent: "#59c97b", scale: 0.5 })); }
        if (step.id === "wvpp-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(24,10,6,0.9)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafbf1";
            cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("LOGGED", w / 2, h * 0.4);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            cx.fillStyle = "#b7e6c8";
            cx.fillText("8 CCR §3342 entry filed", w / 2, h * 0.68);
          });
        }
      },

      // The aggressor's arm really reaches across and closes on the
      // coworker's wrist — an arm-mesh rotation, not only a banner — and the
      // crowd really steps in around the guest on the second interrupt.
      onInterrupt(it) {
        if (it.id === "wrist-grab") {
          aggressor.arms[1].shoulder.rotation.x = -1.3;
          aggressor.arms[1].fore.rotation.x = -0.5;
          coworker.arms[0].shoulder.rotation.x = -0.9;
          coworker.arms[0].fore.rotation.x = -0.3;
          panicButton.material = mat(0xffb020, { emissive: 0xffb020, ei: 1.8, rough: 0.4 });
        }
        if (it.id === "crowd-films-and-closes-in") {
          bystanderA.root.position.set(-1.1, 0, -1.5);
          bystanderB.root.position.set(-2.5, 0, -1.6);
          guest.torso.rotation.z = 0.1;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wrist-grab") {
          aggressor.arms[1].shoulder.rotation.x = 0;
          aggressor.arms[1].fore.rotation.x = 0;
          coworker.arms[0].shoulder.rotation.x = 0;
          coworker.arms[0].fore.rotation.x = 0;
          panicButton.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 0.9, rough: 0.4 });
        }
        if (it.id === "crowd-films-and-closes-in") {
          bystanderA.root.position.set(2.6, 0, -0.6);
          bystanderB.root.position.set(2.9, 0, -1.6);
          guest.torso.rotation.z = 0;
        }
      },

      animate(t, dt, session) {
        aggressor.head.rotation.y = Math.sin(t * 0.4) * 0.12;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "assess-escalation") {
          repaint(tensionGauge.userData.screen, signFace(gg.t < 0.28 ? "COOLING" : "STILL HOT", {
            bg: "#0d1c24", accent: gg.t < 0.28 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "crowd-watch" && tr) {
          repaint(crowdScan.userData.screen, signFace(tr.v < 0.3 ? "TABLE" : tr.v > 0.75 ? "LOST" : "SCAN", {
            bg: "#0d1c24", accent: tr.v >= 0.3 && tr.v <= 0.75 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
