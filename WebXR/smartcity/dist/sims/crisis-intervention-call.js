import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
  seatedFigure, standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Crisis Intervention Call VR — First Responder series, the
// crisis intervention team station.
//
// A welfare call on a residential porch: a person in a mental-health crisis
// sitting on their own front step, a family member who made the call waiting
// at the side gate, a neighbour across the street with opinions, and two
// officers whose only real tools for the next twenty minutes are distance,
// time and the words they choose. The crisis intervention team model exists
// because the alternative — volume, commands and a pair of handcuffs — is
// what turns a welfare check into a use-of-force report and a jail booking
// for somebody whose actual problem is that they stopped sleeping a week ago.
//
// Everything a learner is scored on here is either a position or a sentence.
// Nothing is sited at a real address and nobody in it is a real person; the
// destination is named as what it is — a crisis stabilisation unit run by the
// county behavioural health authority — rather than as any particular one.

const CICL_ACCENT = 0x5aa9e6;

export const SIM_CRISIS_INTERVENTION_CALL = {
  id: "crisis-intervention-call",
  index: "203",
  domain: "Emergency Services",
  trade: "Police officer — crisis intervention team",
  category: "Emergency Services",
  district: "Emergency Services",
  weather: "overcast",
  certification: "CIT International's crisis intervention team model — the forty-hour curriculum, the co-responder clinician, and a crisis stabilisation unit as a destination that is not a jail; the Americans with Disabilities Act (ADA) title II duty to accommodate a person's disability, mental illness included, during a police contact; the state's emergency psychiatric hold as the county behavioural health authority that runs the stabilisation unit administers it — named as the body rather than as a section quoted from memory; SAMHSA's trauma-informed care principles and Psychological First Aid (NCTSN and WHO) for what is actually said on the step; NIMS/ICS through FEMA IS-100 for the unified command a police and clinician co-response works inside; OSHA 29 CFR 1910.1030 for the moment any contact breaks skin; the police officers' association and FOP contract language that puts peer support after a call like this one",
  name: "Crisis Intervention Call",
  title: simTitle("Crisis Intervention Call"),
  tagline: "A porch, a person in crisis and twenty minutes: the approach slowed, one voice, the gap held, time given, choices offered — and a stabilisation unit instead of a booking cell",
  accent: CICL_ACCENT,
  accentCss: "#5aa9e6",
  parSeconds: 360,
  footprint: 2.8,
  badge: { id: "one-voice-held", name: "One Voice", note: "The whole call run at walking pace and speaking volume, with a voluntary transport at the end of it" },

  game: system({
    name: "Slow Is Fast",
    currency: "RAPPORT",
    ranks: ["Patrol Officer", "CIT Trained", "Crisis Team Officer", "Co-Response Lead", "CIT Instructor"],
    badges: [
      { id: "read-before-moving", name: "Read Before Moving", note: "Every pre-contact cue picked up before a single step was taken", test: AWARD.stepClean("size-up-the-call") },
      { id: "nothing-forced", name: "Nothing Forced", note: "No unsafe action anywhere in the call", test: AWARD.safe },
      { id: "silence-kept", name: "Silence Kept", note: "Both timed periods — the gap and the silence — carried the full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "level-voice", name: "Level Voice", note: "No corrections anywhere in the call", test: AWARD.clean },
      { id: "measured-approach", name: "Measured Approach", note: "Approach pace and gap both read inside their bands", test: AWARD.precise(0.72) },
      { id: "eight-straight", name: "Eight Straight", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "crowd-the-porch": "You stepped up onto the porch, inside arm's reach of somebody who is already frightened. The gap is not politeness — it is the reaction time that lets this end in conversation, and a person in crisis reads a closing distance as the moment the thing they have been dreading starts.",
    "two-voices": "Both of you started talking. Two officers speaking is two sets of instructions to somebody whose thinking is already narrowed by fear, and it hands them a reason to stop listening to either of you. One speaker, one relationship — the second officer covers and stays quiet.",
    "command-and-threaten": "You gave an order and named a consequence. Commands work on people who are deciding whether to comply; they do nothing for somebody who cannot hear you over their own alarm, and a threat you then have to carry out is how a welfare check becomes a use-of-force report.",
    "cuffs-and-booking": "You reached for the handcuffs and the booking paperwork. Arresting a person for the symptoms of an illness moves them from a stabilisation unit that could treat them to a cell that cannot, and it is the outcome the crisis intervention team model was built specifically to avoid.",
  },

  lateNotes: {
    "weapon-question-card": "The weapon question gets asked plainly, but it gets asked inside a conversation that already exists — leading with it, before a name and an open question, tells the person the last twenty seconds were a search and not a talk.",
    "transport-offer": "The offer of a ride comes after the listening, not instead of it. Offered too early it is heard as a decision that has already been made about them, which is the fastest way to lose a voluntary transport.",
  },

  steps: [
    {
      id: "size-up-the-call", kind: "find", noHint: true,
      targets: ["cue-seated-still", "cue-hands-out-of-sight", "cue-caller-at-the-gate"],
      itemNames: {
        "cue-seated-still": "seated on the step, not advancing",
        "cue-hands-out-of-sight": "hands in a jacket pocket, out of sight",
        "cue-caller-at-the-gate": "the family member who made the call",
      },
      itemNotes: {
        "cue-seated-still": "They are sitting down and staying sat down. Nothing about that posture is closing on anybody, and it buys you the whole first minute if you do not spend it.",
        "cue-hands-out-of-sight": "You cannot see both hands. That is a reason to keep the gap and ask a plain question about it later — it is not a reason to close the distance now.",
        "cue-caller-at-the-gate": "Somebody in the family called this in, which means there is a history available to you and a person who is going to be here long after you leave.",
      },
      title: "Read the porch before you take a step",
      cue: "Stop at the gate and look. Three things about this scene decide how the next twenty minutes go.",
      why: "Nearly every bad outcome on a crisis call is decided in the ten seconds before contact, because that is when the approach speed, the distance and the number of people talking all get set. A seated person who is not advancing, a pair of hands you cannot see and a family member who called it in are three different pieces of information, and each one changes a different decision — pace, gap, and who you get the history from.",
    },
    {
      id: "slow-the-approach", kind: "gauge", target: "approach-pace",
      title: "Slow the approach to a walking pace",
      cue: "Come up the walk at a walk — commit the pace when the readout is in the band.",
      gauge: {
        label: "APPROACH", speed: 0.62, green: [0.06, 0.3],
        readout: (t) => (t < 0.06 ? "stalled" : t <= 0.3 ? "walking pace" : "closing fast"),
        missNote: "That is a closing pace, not an approach. Reset and commit inside the band — a fast approach is read as the start of a fight by somebody who is already braced for one.",
      },
      why: "Speed is the loudest thing an officer brings onto a porch. A person whose alarm system has been running for days reads a fast approach as the thing they have been waiting for, and once that switch flips there is no sentence that unflips it. Walking pace does two jobs at once: it says nothing is about to happen to you, and it leaves you the seconds you would otherwise have spent arriving.",
    },
    {
      id: "quiet-the-scene", kind: "turn", target: "lightbar-switch",
      title: "Kill the strobes and leave the scene quiet",
      cue: "Turn the bar off at the console — the lights did their job on the way here.",
      turn: { turns: 0.75, axis: "y", label: "LIGHT BAR" },
      why: "Overhead strobes are a warning device for traffic and they are stimulation for everybody else. On a residential street at conversational distance they add nothing to your safety, they pull the neighbours out onto their lawns, and for somebody already overwhelmed they are one more thing the nervous system has to process instead of your voice. Reducing stimulation is the first physical de-escalation move available and it costs a switch.",
    },
    {
      id: "one-voice-contact", kind: "select", target: "one-voice-marker",
      title: "One speaker — take contact and put your partner on cover",
      cue: "Say it out loud so everyone knows: you talk, your partner covers and stays quiet.",
      why: "The single most reliable predictor of whether a crisis contact stays verbal is whether one person owns the talking. Two voices split the person's attention, contradict each other within a minute, and leave nobody watching the scene. Naming contact and cover out loud also tells your partner what they are for, which is what stops them filling a silence they find uncomfortable.",
    },
    {
      id: "hold-the-gap", kind: "track", target: "gap-track-point", seconds: 7,
      title: "Hold the gap while they settle",
      cue: "Find your distance and keep it — not creeping in, not backing out of earshot.",
      track: {
        start: 0.5, green: [0.32, 0.72], rise: 0.5, fall: 0.42, drift: 0.16, label: "GAP",
        readout: (v) => (v < 0.32 ? "too close" : v > 0.72 ? "out of earshot" : "gap held"),
      },
      why: "The gap is a live thing, not a mark on the ground: they shift, you shift, and without attention the distance closes by half a metre a minute until somebody is inside somebody else's space. Held, it is reaction time for you and breathing room for them. Given away, it is the reason a conversation that was working suddenly is not, and neither person can say what changed.",
      holdBreakNote: "The distance got away from you. Come back to it and hold it — the gap is doing more of this work than anything you are going to say.",
    },
    {
      id: "introduce-by-name", kind: "select", target: "introduction-card",
      title: "Introduce yourself by name and say why you are here",
      cue: "\"My name's Alvarez. I'm not here to arrest anybody — your sister called because she's worried about you.\"",
      why: "A name turns a uniform into a person, and saying plainly why you are there removes the question the person is spending all their attention on. It also puts the honest reason on the table early, which matters later: if the first thing you said was true, the offer of a ride at the end has some credit behind it. Withholding why you came buys nothing and costs the whole conversation once they work it out.",
    },
    {
      id: "reflective-listening", kind: "sequence",
      targets: ["leaps-listen", "leaps-empathize", "leaps-ask", "leaps-paraphrase", "leaps-summarize"],
      itemNames: {
        "leaps-listen": "Listen — let them finish, all of it",
        "leaps-empathize": "Empathise — \"that sounds exhausting\"",
        "leaps-ask": "Ask — the open question: \"what's going on for you today?\"",
        "leaps-paraphrase": "Paraphrase — say it back in their words",
        "leaps-summarize": "Summarise — \"so the two things are the noise and the letter\"",
      },
      title: "Work the LEAPS sequence — listen, empathise, ask, paraphrase, summarise",
      cue: "Take it in order. Listening first, then the feeling named, then the open question, then it goes back to them in their own words.",
      why: "LEAPS is taught in order because each step earns the next one. Listening without interrupting is what produces something to empathise with; empathising is what makes an open question land as interest rather than interrogation; paraphrasing proves you actually heard it, and the summary is where the person hears their own problem in a shape small enough to do something about. Run out of order it becomes a questionnaire, and a questionnaire gets short answers.",
      outOfOrderNote: "Listen, empathise, ask, paraphrase, summarise. Leading with the question before you have listened makes it an interview, and an interview is the thing this person is most afraid you came to do.",
    },
    {
      id: "give-time", kind: "hold", target: "silence-hold-point", seconds: 9,
      title: "Give them time — stop talking",
      cue: "Hold the silence. Do not fill it, do not repeat the question, let them get there.",
      why: "Time is the only de-escalation tool that works on its own, and silence is how you spend it. A person whose thinking is slowed by fear or by medication needs several seconds longer than feels natural to assemble an answer, and every time an officer fills that gap the clock resets. There is nothing else you have to do in the next nine seconds, and standing there quietly is the whole skill.",
      holdBreakNote: "You filled the silence. Nothing was going wrong — the pause was them working out what to say, and it started again from the top when you spoke.",
    },
    {
      id: "offer-choices", kind: "sequence", anyOrder: true,
      targets: ["choice-sit-or-stand", "choice-water", "choice-who-we-call"],
      itemNames: {
        "choice-sit-or-stand": "sit on the step or stand — their call",
        "choice-water": "a glass of water, or not",
        "choice-who-we-call": "who gets called, and who does not",
      },
      title: "Offer real choices, in any order",
      cue: "Give them three things they get to decide. Small ones count.",
      why: "A crisis is, from the inside, the experience of having no control over anything. Every genuine choice handed back — where to sit, whether to drink something, who gets phoned — restores a piece of that, and a person who has made three small decisions is measurably more likely to make the large one voluntarily. The choices have to be real: offering an option you will then overrule costs more trust than never offering it.",
    },
    {
      id: "weapon-question", kind: "select", target: "weapon-question-card",
      title: "Ask the weapon question plainly",
      cue: "\"I have to ask, and I'm asking straight: is there anything on you or next to you that could hurt either of us?\"",
      why: "The question gets asked, and it gets asked as a question rather than as a search. Said plainly, with the reason attached, it is answered honestly far more often than it is dodged — and an honest answer is worth more than a pat-down that ends the rapport you just spent ten minutes building. Dressing it up, or skipping it because the conversation is going well, are both ways of pretending the hands you cannot see are not there.",
    },
    {
      id: "family-back", kind: "drag", target: "family-member",
      title: "Walk the family member back out of the line",
      cue: "Take her back to the driveway — out of the conversation, not out of the call.",
      drag: {
        to: "driveway-spot", radius: 0.6,
        missNote: "Not clear of the walkway. A family member standing inside the conversation is a second voice whether she speaks or not, and she is the one person here whose presence can flip this either way.",
      },
      why: "Family is the most powerful variable on a crisis call and it cuts both directions. The person who called is frightened, exhausted and often part of the argument that started this, and their presence inside the conversation invites the person in crisis to perform for them. Moving her back is not dismissing her — it is putting her somewhere she can be spoken to properly in a moment, and where nothing she says gets heard as a demand.",
    },
    {
      id: "family-account", kind: "select", target: "family-account-card",
      title: "Take the family member's account",
      cue: "Now hear her: what changed, what they are prescribed, what worked the last time.",
      why: "Nobody on this porch knows more than she does. What the person was like a week ago, what they take, which hospital or clinic already has a file, and what actually calmed things down last time are all facts you cannot get from the person in crisis and cannot get from dispatch. Taking that account properly is also the difference between a caller who rings next time and one who decides it is not worth it.",
    },
    {
      id: "voluntary-transport", kind: "sequence",
      targets: ["transport-offer", "csu-destination", "clinician-handoff"],
      itemNames: {
        "transport-offer": "offer the ride, as an offer",
        "csu-destination": "name where — the crisis stabilisation unit, not a cell",
        "clinician-handoff": "hand off to the co-responder clinician",
      },
      title: "Offer voluntary transport, name the destination, hand off",
      cue: "Offer it, say plainly where it goes, then introduce the clinician and give her what you have.",
      why: "Voluntary is the whole point. A person who agrees to go keeps their dignity, keeps their record clean and arrives somewhere that can actually treat them, and that only happens if the offer is an offer and the destination is named honestly. The handoff matters as much: the clinician needs what the family told you, what the person told you and what you agreed to, or the first ten minutes of the assessment are spent re-earning ground you already covered.",
      outOfOrderNote: "Offer, then name the destination, then hand off. Naming a facility before there is an offer on the table sounds like a decision that has already been made about them, and that is where a voluntary transport turns into a hold.",
    },
    {
      id: "cit-log", kind: "select", target: "cit-log-board",
      title: "File the crisis contact log",
      cue: "Write it up as a crisis contact: what was said, what was offered, where they went.",
      why: "The crisis intervention team model runs on this entry. It is what tells the next unit dispatched to this address that the last contact was verbal and voluntary, it is what lets the co-response programme show the diversion actually happened, and it is the only record that this was resolved without force. Logged as an ordinary welfare check, the whole call disappears from the one dataset that funds the programme.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with your partner before you clear",
      cue: "Two minutes in the car: how did that land on you, and the peer-support line if it did.",
      why: "Calls that end well still cost something, and a partner who stood covering a silence for twenty minutes has been carrying it too. The department's critical-incident stress rule names the peer-support team and the employee assistance line as available after any call involving a person in crisis, not only after a shooting, and the two-minute check before you clear is what makes the number real rather than a poster in the hallway.",
    },
  ],

  interrupts: [
    {
      id: "object-picked-up-partner-closes",
      kind: "Partner closing in",
      after: "hold-the-gap", delay: 3, seconds: 12,
      alert: "The person has picked a garden trowel off the step and is turning it over in their hands — and your partner has started up the walkway toward them.",
      cue: "Wave your partner back and re-set the gap. One speaker, one distance.",
      target: "partner-wave-back",
      why: "An object in somebody's hands is a reason to hold the gap, not to close it — and a second officer walking in turns a conversation into a surround, which is the geometry every crisis contact goes wrong from. The hand signal exists so the correction happens without a word being said out loud, because saying it out loud tells the person they are now the subject of a tactical discussion.",
      missNote: "Your partner closed to arm's reach with an object in the person's hands and nobody signalled anything. The trowel was never the problem — the geometry was, and by the time it was noticed there was no gap left to hold.",
      wrongNote: "It is the hand signal to your partner, not anything to do with the person or the object. Fix the geometry first, quietly, then carry on the conversation you were having.",
    },
    {
      id: "neighbour-shouting-advice",
      kind: "Bystander interfering",
      after: "give-time", delay: 3, seconds: 12,
      alert: "A neighbour has come out to the kerb across the street and is shouting advice over the top of everything — \"just go with them, you're being ridiculous!\"",
      cue: "Send your partner to walk the neighbour back. Do not answer them yourself.",
      target: "neighbour-redirect",
      why: "A bystander shouting is a third voice in a conversation you deliberately built for one, and the content is worse than the volume — being told they are being ridiculous, in front of their own house, hands the person in crisis a reason to prove otherwise. Your partner moving the neighbour back keeps the one relationship intact; you turning round to argue across the street ends it.",
      missNote: "The shouting carried on across the whole silence you were holding. The person stopped talking and started listening to the street instead, and the one voice you had spent ten minutes establishing was no longer the only one on the call.",
      wrongNote: "Not from where you are standing — turning round to answer the street means leaving the conversation. Send your partner to walk them back and keep your attention on the porch.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, CICL_ACCENT);

    // ------------------------------------------------------------- the ground
    // A front walk and driveway in cast concrete, and the street behind the
    // learner beyond the kerb — the two big surfaces the scene reads off, both
    // textured rather than flat-coloured. The learner arrives at the foot of
    // the drive, which is where the whole first step happens.
    const walkTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#39414a", base2: "#30383f", seam: "rgba(8,10,12,0.6)",
    }), { repeat: 4, px: 384 });
    const walk = box(g, 9.4, 0.02, 9.2, 0, 0.008, 0.9, 0x39414a, { rough: 0.9, cast: false });
    walk.material = texturedMat(walkTex, { rough: 0.9, metal: 0.03, color: 0x39414a });

    const streetTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#22262b", base2: "#1b1f23", seam: "rgba(0,0,0,0.35)",
    }), { repeat: 3, px: 384 });
    const street = box(g, 11.0, 0.02, 3.6, 0, 0.006, 7.2, 0x22262b, { rough: 0.95, cast: false });
    street.material = texturedMat(streetTex, { rough: 0.95, metal: 0.02, color: 0x22262b });
    box(g, 11.0, 0.14, 0.22, 0, 0.07, 5.4, 0x8b929a, { rough: 0.9 });          // kerb
    for (let i = 0; i < 5; i++) {
      box(g, 0.9, 0.006, 0.1, -4.0 + i * 2.0, 0.022, 7.7, 0xd8dde2, { rough: 0.8, cast: false });
    }

    // --------------------------------------------------------------- the house
    const houseTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#6e7883", base2: "#636d77", seam: "rgba(20,24,28,0.45)",
    }), { repeat: 3, px: 320 });
    const houseWall = box(g, 6.6, 3.3, 0.26, 0, 1.65, -2.9, 0x6e7883, { rough: 0.85 });
    houseWall.material = texturedMat(houseTex, { rough: 0.85, metal: 0.02, color: 0x6e7883 });
    box(g, 7.0, 0.22, 0.5, 0, 3.35, -2.9, 0x565e66, { rough: 0.8 });           // eaves
    const frontDoor = box(g, 0.98, 2.08, 0.07, -0.25, 1.46, -2.75, 0x6b4f3a, { rough: 0.7 });
    void frontDoor;
    cyl(g, 0.022, 0.022, 0.09, 0.12, 1.42, -2.69, 0xb9a06a, { rough: 0.35, metal: 0.8, seg: 10 });
    for (const wx of [-2.3, 2.0]) {
      box(g, 1.15, 1.0, 0.05, wx, 2.0, -2.75, 0x9fd0e0, { rough: 0.2, metal: 0.1, emissive: 0x2a3a42, ei: 0.5 });
      box(g, 1.28, 0.06, 0.09, wx, 2.54, -2.73, 0x2f343a, { rough: 0.8 });
    }
    ball(g, 0.055, 0.52, 2.62, -2.72, 0xffe6b0, { emissive: 0xffe6b0, ei: 1.1, rough: 0.4, seg: 12 });

    // ---------------------------------------------------------------- the porch
    const deck = box(g, 4.6, 0.42, 1.8, 0, 0.21, -1.9, 0x947f66, { rough: 0.85 });
    void deck;
    box(g, 3.1, 0.28, 0.34, 0, 0.14, -0.9, 0x8a755d, { rough: 0.85 });         // upper tread
    box(g, 3.1, 0.14, 0.34, 0, 0.07, -0.62, 0x8a755d, { rough: 0.85 });        // bottom tread
    for (const px of [-2.1, 2.1]) {
      box(g, 0.15, 2.5, 0.15, px, 1.67, -1.1, 0x7a6852, { rough: 0.8 });
      box(g, 0.1, 0.07, 1.7, px, 1.02, -1.9, 0x7a6852, { rough: 0.8 });        // hand rail
      for (let i = 0; i < 4; i++) box(g, 0.05, 0.56, 0.05, px, 0.72, -2.55 + i * 0.44, 0x7a6852, { rough: 0.8 });
    }
    box(g, 4.9, 0.12, 1.5, 0, 2.98, -2.2, 0x7d6c5c, { rough: 0.8 });           // porch roof, high and shallow so the step is not a cave
    for (const px of [-1.9, 1.9]) {
      box(g, 0.09, 0.07, 0.9, px, 1.02, -0.6, 0x7a6852, { rough: 0.8 });       // side rails at the steps
      for (let i = 0; i < 2; i++) box(g, 0.05, 0.56, 0.05, px, 0.72, -0.88 + i * 0.44, 0x7a6852, { rough: 0.8 });
    }
    // Planting either side of the step, so the porch reads as somebody's home.
    for (const [bx, bz, br] of [[-1.55, -0.35, 0.26], [1.6, -0.3, 0.3], [1.95, 0.05, 0.2]]) {
      const bush = ball(g, br, bx, br * 0.8, bz, 0x3b5240, { rough: 0.95, seg: 10 });
      bush.scale.y = 0.75;
    }

    // ------------------------------------------------------------- side fence
    const fence = group(g, -3.25, 0, 1.2);
    for (const y of [0.5, 1.0]) box(fence, 0.06, 0.05, 3.9, 0, y, 0, 0x5f6670, { rough: 0.85 });
    for (let i = 0; i < 9; i++) box(fence, 0.09, 1.2, 0.028, 0, 0.62, -1.8 + i * 0.45, 0x6a727c, { rough: 0.85 });
    for (const pz of [-1.95, 1.95]) box(fence, 0.12, 1.4, 0.12, 0, 0.7, pz, 0x545b64, { rough: 0.8 });
    const gateLatch = cyl(fence, 0.02, 0.02, 0.07, 0.07, 1.0, 1.7, 0xb0b8c0, { rough: 0.4, metal: 0.8, seg: 8 });
    void gateLatch;

    // --------------------------------------------------------- the patrol car
    const car = group(g, 3.7, 0, 4.5, -0.18);
    box(car, 1.86, 0.62, 4.3, 0, 0.66, 0, 0x2b313a, { rough: 0.35, metal: 0.4 });
    box(car, 1.72, 0.58, 2.1, 0, 1.18, -0.15, 0x22272e, { rough: 0.3, metal: 0.35 });
    box(car, 1.6, 0.42, 0.05, 0, 1.2, 0.92, 0x8fb8cc, { rough: 0.15, metal: 0.1, opacity: 0.55, transparent: true });
    for (const sx of [-1, 1]) for (const sz of [-1.45, 1.45]) {
      const wheel = cyl(car, 0.33, 0.33, 0.22, sx * 0.86, 0.33, sz, 0x15181c, { rough: 0.9, seg: 14 });
      wheel.rotation.z = Math.PI / 2;
    }
    const barGrp = group(car, 0, 1.52, -0.3);
    box(barGrp, 1.16, 0.12, 0.28, 0, 0, 0, 0x1b1f24, { rough: 0.5 });
    const barRed = box(barGrp, 0.44, 0.1, 0.24, -0.3, 0.02, 0, 0xd8322a, { emissive: 0xd8322a, ei: 1.8, rough: 0.4 });
    const barBlue = box(barGrp, 0.44, 0.1, 0.24, 0.3, 0.02, 0, 0x3c6cf0, { emissive: 0x3c6cf0, ei: 1.8, rough: 0.4 });
    box(car, 0.5, 0.06, 0.02, 0, 0.78, -2.1, 0xd8dde2, { rough: 0.6 });
    // Door-frame console: the light-bar switch, on the car, not in the scene.
    const carConsole = group(car, -0.97, 1.02, 0.35);
    box(carConsole, 0.13, 0.11, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const barKnob = cyl(carConsole, 0.028, 0.028, 0.03, 0, 0.055, 0.02, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 12 });
    holoTag(carConsole, "Light bar", 0, 0.16, 0, { css: "#5aa9e6", w: 0.3 });
    reg(hits, barKnob, "lightbar-switch");
    // The booking clipboard on the boot lid — the wrong ending, within reach.
    const booking = group(car, -0.4, 1.0, 1.1);
    box(booking, 0.26, 0.015, 0.34, 0, 0, 0, 0xe4e7ea, { rough: 0.7 });
    holoTag(booking, "Book her in?", 0, 0.14, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, booking, "cuffs-and-booking");

    // ------------------------------------------------- crisis stabilisation van
    const van = group(g, -4.25, 0, 5.1, 0.14);
    box(van, 1.9, 1.62, 4.1, 0, 1.15, 0, 0xdfe4e8, { rough: 0.45, metal: 0.2 });
    box(van, 1.76, 0.5, 1.2, 0, 1.6, 1.5, 0x9fb6c4, { rough: 0.2, metal: 0.1, opacity: 0.6, transparent: true });
    for (const sx of [-1, 1]) for (const sz of [-1.3, 1.3]) {
      const wheel = cyl(van, 0.33, 0.33, 0.22, sx * 0.88, 0.33, sz, 0x15181c, { rough: 0.9, seg: 14 });
      wheel.rotation.z = Math.PI / 2;
    }
    const vanPanel = box(van, 0.04, 0.74, 2.1, 0.97, 1.2, -0.5, 0x7fc4d8, { rough: 0.5, emissive: 0x2c5866, ei: 0.5 });
    holoTag(van, "Crisis stabilisation unit — voluntary", 0.99, 2.05, -0.5, { css: "#5aa9e6", w: 0.66 });
    reg(hits, vanPanel, "csu-destination");

    // ------------------------------------------------------------- small helpers
    const marker = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const bead = ball(m, o.r ?? 0.026, 0, y, 0, o.color ?? CICL_ACCENT,
        { emissive: o.color ?? CICL_ACCENT, ei: o.ei ?? 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? "#5aa9e6", w: o.w ?? 0.4 });
      reg(hits, bead, id);
      return bead;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.3, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0a1b25", accent: o.accent ?? "#5aa9e6", scale: 0.42 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? "#5aa9e6", w: o.w ?? 0.46 });
      reg(hits, plate, id);
      return plate;
    };
    const stand = (x, z, ry) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.2, 0.22, 0.03, 0, 0.015, 0, 0x2b3138, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.028, 0.028, 1.0, 0, 0.5, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };

    // ------------------------------------------------------- the pre-contact cues
    // The person in crisis, seated on the top step of their own porch.
    const person = seatedFigure(g, -1.1, 0.42, -1.45, { ry: 0.16, cloth: 0x4a5561, skin: 0xc49a76 });
    person.torso.rotation.y = -0.1;
    holoTag(person.torso, "Person in crisis", 0, 1.32, 0.1, { css: "#5aa9e6", w: 0.42 });
    reg(hits, person.torso, "cue-seated-still");
    const handsCue = ball(person.torso, 0.024, 0.02, 0.5, 0.2, CICL_ACCENT, { emissive: CICL_ACCENT, ei: 1.3, seg: 10 });
    holoTag(person.torso, "Hands out of sight", 0.02, 0.66, 0.2, { css: "#5aa9e6", w: 0.44 });
    reg(hits, handsCue, "cue-hands-out-of-sight");
    // The trowel on the step beside them — picked up when the first alarm fires.
    const trowel = group(g, -0.42, 0.43, -1.1, 0.5);
    const trowelBlade = box(trowel, 0.05, 0.012, 0.15, 0, 0.01, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6 });
    box(trowel, 0.022, 0.022, 0.1, 0, 0.012, 0.13, 0x6b4f3a, { rough: 0.7 });

    marker(-3.18, 1.25, 2.6, "cue-caller-at-the-gate", "The caller at the gate", { w: 0.52 });

    // --------------------------------------------------------- graded controls
    const paceStand = stand(1.6, 2.9, -0.5);
    const paceGauge = instrument(paceStand, 0, 1.02, 0, { ry: 0, idle: "APPROACH", color: CICL_ACCENT, w: 0.2, d: 0.26 });
    holoTag(paceStand, "Approach pace", 0, 1.22, 0, { css: "#5aa9e6", w: 0.4 });
    reg(hits, paceGauge, "approach-pace");

    const gapStand = stand(-0.6, 0.8, 0.35);
    const gapGauge = instrument(gapStand, 0, 1.02, 0, { ry: 0, idle: "GAP", color: CICL_ACCENT, w: 0.2, d: 0.26 });
    holoTag(gapStand, "Reactionary gap", 0, 1.22, 0, { css: "#5aa9e6", w: 0.44 });
    reg(hits, gapGauge, "gap-track-point");

    marker(1.3, 1.55, 1.5, "one-voice-marker", "One speaker — you", { w: 0.46 });
    marker(0.3, 1.45, 0.3, "silence-hold-point", "Let the silence run", { w: 0.5 });
    marker(1.5, 1.1, 2.3, "partner-wave-back", "Hand signal — hold back", { w: 0.56, css: "#f2c14b", color: 0xf2c14b });
    marker(1.9, 1.3, 5.0, "neighbour-redirect", "Walk the neighbour back", { w: 0.56, css: "#f2c14b", color: 0xf2c14b });

    card(-1.6, 1.22, 0.6, "introduction-card", "Name, and why you came", "MY NAME IS", { w: 0.5, ry: 0.35 });
    card(0.9, 1.22, 0.5, "weapon-question-card", "Ask it plainly", "ANYTHING ON YOU?", { w: 0.44, ry: -0.3 });
    card(-2.4, 1.2, 2.1, "family-account-card", "Hear the family out", "WHAT CHANGED?", { w: 0.5, ry: 0.5 });
    card(-1.6, 1.18, 3.2, "transport-offer", "Offer the ride", "WOULD YOU COME?", { w: 0.46, ry: 0.4 });

    // The LEAPS ladder, stood beside the walk in the order it is worked.
    const leaps = group(g, 2.3, 0, 0.9, -0.35);
    cyl(leaps, 0.024, 0.024, 2.0, 0, 1.0, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
    const LEAPS = [
      ["leaps-listen", "L — listen", 0.72],
      ["leaps-empathize", "E — empathise", 1.02],
      ["leaps-ask", "A — ask the open question", 1.32],
      ["leaps-paraphrase", "P — paraphrase", 1.62],
      ["leaps-summarize", "S — summarise", 1.92],
    ];
    for (const [lid, label, y] of LEAPS) {
      const bead = ball(leaps, 0.024, 0, y, 0, CICL_ACCENT, { emissive: CICL_ACCENT, ei: 1.5, seg: 12 });
      holoTag(leaps, label, 0.18, y, 0, { css: "#5aa9e6", w: 0.52 });
      reg(hits, bead, lid);
    }

    // The three choices offered, on their own small board.
    const choices = group(g, -2.2, 0, 1.1, 0.6);
    cyl(choices, 0.022, 0.022, 1.7, 0, 0.85, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
    const CHOICES = [
      ["choice-sit-or-stand", "Sit or stand — your call", 0.86],
      ["choice-water", "A glass of water?", 1.18],
      ["choice-who-we-call", "Who we call, and who we don't", 1.5],
    ];
    for (const [cid, label, y] of CHOICES) {
      const bead = ball(choices, 0.024, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(choices, label, 0.18, y, 0, { css: "#7fc4d8", w: 0.58 });
      reg(hits, bead, cid);
    }

    // The driveway spot the family member is walked back to.
    const drive = group(g, 2.5, 0, 3.0);
    const driveMark = box(drive, 0.62, 0.012, 0.62, 0, 0.018, 0, 0x59c97b, { rough: 0.8, emissive: 0x59c97b, ei: 0.35, cast: false });
    holoTag(drive, "Driveway — clear of the walk", 0, 0.16, 0, { css: "#59c97b", w: 0.6 });
    reg(hits, driveMark, "driveway-spot");

    // ------------------------------------------------------------ the wrong moves
    const porchStep = group(g, 0.55, 0, -0.68);
    const porchTrap = box(porchStep, 0.58, 0.02, 0.3, 0, 0.3, 0, 0xf0645b, { rough: 0.7, emissive: 0xf0645b, ei: 0.35, cast: false });
    holoTag(porchStep, "Step up onto the porch?", 0, 0.46, 0, { css: "#f0645b", w: 0.56 });
    reg(hits, porchTrap, "crowd-the-porch");
    marker(1.9, 1.72, 1.95, "two-voices", "Both of you talking?", { color: 0xf0645b, css: "#f0645b", w: 0.5 });
    card(1.5, 1.15, -0.1, "command-and-threaten", "Order and consequence?", "COME DOWN NOW", {
      w: 0.56, ry: -0.4, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });

    // ------------------------------------------------------------------ boards
    const dispatch = holoPanel(g, 0.56, 0.4, -2.75, 1.95, -0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5aa9e6"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#9fd4ef";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("DISPATCH — WELFARE CHECK", w * 0.06, h * 0.15);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("PERSON IN CRISIS · NO WEAPON SEEN", w * 0.06, h * 0.34);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      cx.fillStyle = "#b9d8e6";
      ["Caller: family member, on scene", "CIT officer requested · clinician en route",
       "History: prior voluntary transport", "No warrants · no prior force"].forEach((l, i) =>
        cx.fillText(l, w * 0.06, h * (0.52 + i * 0.12)));
    }, { ry: 0.6, accent: CICL_ACCENT });
    void dispatch;

    const logBoard = holoPanel(g, 0.54, 0.38, -2.7, 1.95, 2.0, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5aa9e6"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CRISIS CONTACT LOG", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      cx.fillStyle = "#b9d8e6";
      ["What was said · what was offered", "Destination: stabilisation unit",
       "Outcome: voluntary, no force used"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.52 + i * 0.15)));
    }, { ry: 0.6, accent: CICL_ACCENT });
    reg(hits, logBoard, "cit-log-board");

    const checkBoard = holoPanel(g, 0.5, 0.34, 2.8, 1.9, 2.3, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.32);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillStyle = "#b9d8e6";
      ["How did that land on you?", "Peer support team · EAP line",
       "Available after any crisis call"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.54 + i * 0.15)));
    }, { ry: -0.6, accent: 0x7fc4d8 });
    reg(hits, checkBoard, "crew-checkin-board");

    // ------------------------------------------------------------------ people
    // The partner: cover officer, standing back and quiet. Sited on a spot
    // tools/briefs/clear_spot.mjs reports clear of every control.
    const partner = standingFigure(g, 0.95, 2.35, { ry: -2.9, cloth: 0x2f3946, trousers: 0x262d36, skin: 0xb58a64 });
    holoTag(partner, "Partner — cover", 0, 1.92, 0.1, { css: "#5aa9e6", w: 0.4 });

    // The family member who called, inside the gate.
    const family = standingPerson(g, -2.5, 1.5, { ry: 1.45, cloth: 0x6b4a5a, hiVis: false, skin: 0xc9a17e });
    holoTag(family.torso, "Family member — the caller", 0, 1.78, 0.1, { css: "#5aa9e6", w: 0.6 });
    reg(hits, family.torso, "family-member");

    // The neighbour across the street, and the clinician at the van.
    const neighbour = standingPerson(g, 2.4, 7.6, { ry: -2.9, cloth: 0x4f5a52, hiVis: false, skin: 0xd0a482 });
    const clinician = standingPerson(g, -2.7, 3.0, { ry: -0.6, cloth: 0x37605a, hiVis: false, skin: 0xa8784f });
    holoTag(clinician.torso, "Co-responder clinician", 0, 1.78, 0.1, { css: "#7fc4d8", w: 0.54 });
    reg(hits, clinician.torso, "clinician-handoff");

    let barsLive = true;
    let familyMoved = false;

    return {
      hits,
      footprint: 2.8,
      spawnLook: new THREE.Vector3(-0.9, 1.1, -1.4),

      onStepComplete(step) {
        if (step.id === "quiet-the-scene") {
          barsLive = false;
          barRed.material = mat(0x4a2b2a, { rough: 0.5 });
          barBlue.material = mat(0x27324a, { rough: 0.5 });
          barKnob.material = mat(0x59c97b, { rough: 0.3, metal: 0.6, emissive: 0x59c97b, ei: 0.5 });
        }
        if (step.id === "introduce-by-name") {
          repaint(hits["introduction-card"], signFace("INTRODUCED", { bg: "#0a1b25", accent: "#59c97b", scale: 0.42 }));
        }
        if (step.id === "family-back") {
          familyMoved = true;
          family.root.position.set(2.5, 0, 3.0);
          family.root.rotation.y = -2.2;
          driveMark.material = mat(0x59c97b, { rough: 0.8, emissive: 0x59c97b, ei: 0.8 });
        }
        if (step.id === "voluntary-transport") {
          vanPanel.material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.6 });
        }
        if (step.id === "cit-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(6,22,16,0.9)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafbf1";
            cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("LOGGED — CRISIS CONTACT", w / 2, h * 0.36);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            cx.fillStyle = "#b7e6c8";
            cx.fillText("Voluntary transport · no force used", w / 2, h * 0.66);
          });
        }
      },

      // Both alarms move real bodies and real objects: the trowel comes up off
      // the step while the partner walks in, and the neighbour crosses to the
      // kerb. Answering puts each of them back where they were.
      onInterrupt(it) {
        if (it.id === "object-picked-up-partner-closes") {
          trowel.position.set(-0.86, 0.95, -1.15);
          trowel.rotation.z = 0.9;
          trowelBlade.material = mat(0xf2c14b, { rough: 0.5, metal: 0.5, emissive: 0xf2c14b, ei: 0.5 });
          partner.position.set(0.15, 0, 0.35);
          partner.rotation.y = -3.05;
        }
        if (it.id === "neighbour-shouting-advice") {
          neighbour.root.position.set(1.85, 0, 5.05);
          neighbour.root.rotation.y = -3.0;
          neighbour.arms[1].shoulder.rotation.x = -1.5;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "object-picked-up-partner-closes") {
          trowel.position.set(-0.42, 0.43, -1.1);
          trowel.rotation.z = 0;
          trowelBlade.material = mat(0xa8b0b8, { rough: 0.5, metal: 0.6 });
          partner.position.set(0.95, 0, 2.35);
          partner.rotation.y = -2.9;
        }
        if (it.id === "neighbour-shouting-advice") {
          neighbour.root.position.set(2.4, 0, 7.6);
          neighbour.root.rotation.y = -2.9;
          neighbour.arms[1].shoulder.rotation.x = 0;
        }
      },

      animate(t, dt, session) {
        if (barsLive) {
          const phase = Math.floor(t * 3) % 2;
          barRed.material.emissiveIntensity = phase ? 2.4 : 0.3;
          barBlue.material.emissiveIntensity = phase ? 0.3 : 2.4;
        }
        person.head.rotation.y = Math.sin(t * 0.35) * 0.16 - 0.1;
        if (!familyMoved) family.head.rotation.y = Math.sin(t * 0.5) * 0.25;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "slow-the-approach") {
          const ok = gg.t >= 0.06 && gg.t <= 0.3;
          repaint(paceGauge.userData.screen, signFace(ok ? "WALKING" : gg.t < 0.06 ? "STALLED" : "TOO FAST", {
            bg: "#0a1b25", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.52,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "hold-the-gap" && tr) {
          const ok = tr.v >= 0.32 && tr.v <= 0.72;
          repaint(gapGauge.userData.screen, signFace(ok ? "GAP HELD" : tr.v < 0.32 ? "TOO CLOSE" : "TOO FAR", {
            bg: "#0a1b25", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
