import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace,
  seatedFigure, cabinet, ceilingPanel,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Trauma-Informed Intake VR — Emergency Services, First
// Responder series: the social worker's first hour with somebody who has
// never been in this building before.
//
// Nothing here is a clinical interview. It is the six things SAMHSA's
// trauma-informed approach asks a first contact to establish — safety,
// trustworthiness and transparency, peer support, collaboration, choice, and
// cultural humility — done as procedure: the room arranged so the person can
// see the way out, the introduction and the shape of the hour said out loud,
// permission asked before the questions start, the screening paced at the
// client's pace rather than the form's, the reaction noticed and the break
// offered, the limits of confidentiality named plainly before a disclosure
// makes them urgent, a safety plan written in the client's own words, a warm
// handoff rather than a referral slip, and the worker's own grounding before
// the next person comes in.
//
// Sited generically in a community clinic intake room. No real clinic,
// programme or client is named or implied, and the client is a person in this
// scene rather than a case: named by role, never described in graphic detail.

const TII_ACCENT = 0x6fbfa0;
const TII_CSS = "#6fbfa0";
const TII_WALL = 0x5d6a6a;
const TII_WOOD = 0x8a6f52;

export const SIM_TRAUMA_INFORMED_INTAKE = {
  id: "trauma-informed-intake",
  index: "206",
  domain: "Emergency response",
  trade: "Social worker — NASW / SEIU 1021",
  category: "Emergency Services",
  indoor: "clinic",
  weather: "clear",
  certification: "The NASW Code of Ethics on self-determination, informed consent and confidentiality; SAMHSA's six principles of a trauma-informed approach — safety, trustworthiness and transparency, peer support, collaboration and mutuality, empowerment and choice, and cultural, historical and gender issues; Psychological First Aid as published by the National Child Traumatic Stress Network and the World Health Organization; the HIPAA Privacy Rule, and the federal confidentiality rule for substance use disorder records at 42 CFR Part 2; California's mandated-reporter duties under the Child Abuse and Neglect Reporting Act and the Elder and Dependent Adult Civil Protection Act; Cal/OSHA's workplace violence prevention in health care standard, 8 CCR §3342; SEIU 1021 social services practice standards and the local's own critical-incident and peer-support language",
  name: "Trauma-Informed Intake",
  title: simTitle("Trauma-Informed Intake"),
  tagline: "A first intake done as procedure: the room set so the client can see the door, permission asked before the questions, the screening paced at their pace, the reporting limits said plainly, a safety plan in their own words, a warm handoff, and the worker's own grounding after",
  accent: TII_ACCENT,
  accentCss: TII_CSS,
  parSeconds: 330,
  footprint: 2.4,
  badge: { id: "first-hour-held", name: "First Hour Held", note: "A first intake where the room, the words and the pace all belonged to the client, and the worker checked in on themselves before the next one" },

  game: system({
    name: "First Contact",
    currency: "TRUST",
    ranks: ["Intake Trainee", "Case Aide", "Social Worker", "Lead Clinician Partner", "Trauma-Informed Certified"],
    badges: [
      { id: "door-in-view", name: "Door In View", note: "The room was arranged before the client walked into it, not after", test: AWARD.stepClean("room-set") },
      { id: "nothing-forced", name: "Nothing Forced", note: "No detail pressed for, no promise made that could not be kept", test: AWARD.safe },
      { id: "their-own-words", name: "Their Own Words", note: "The safety plan came out of the client's sentences, not the worker's", test: AWARD.stepClean("safety-plan") },
    ],
    challenges: [
      { id: "clean-first-hour", name: "Clean First Hour", note: "No corrections anywhere in the intake", test: AWARD.clean },
      { id: "steady-pace", name: "Steady Pace", note: "The screening and the safety plan both held without a break", test: AWARD.unbroken },
      { id: "unhurried", name: "Unhurried", note: "Complete inside 80% of par without rushing a single answer", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "press-for-detail": "You pressed for the story. \"What exactly happened, start at the beginning\" is the sentence a trauma-informed intake is built to avoid: the detail is not what this hour needs, the client has usually told it to strangers before, and being pushed through it again by somebody who only needs three boxes filled in is the moment a person decides this building is one more place that takes something from them.",
    "worker-blocks-door": "You took the chair between the client and the door. A person who cannot see or reach the way out is a person whose body is doing threat arithmetic instead of listening to you, and no amount of calm voice fixes a seating plan — the client gets the chair with the sightline, every time, and the worker sits where leaving the room would not mean getting past anybody.",
    "prop-door-open": "You propped the door open to the waiting room. Everything said in here is now audible to whoever is sitting out there, and a client who realises that mid-sentence stops mid-sentence — the HIPAA Privacy Rule is the floor under this, but the practical point is that privacy is a precondition of anybody telling you anything true.",
    "promise-total-secrecy": "You promised that nothing said in this room ever leaves it. It is a kind sentence and it is not true: this worker is a mandated reporter under California's child abuse and elder and dependent adult reporting laws, and a promise made now is a betrayal discovered later, at the worst possible moment, by somebody who had already decided to trust you.",
    "eyes-on-screen": "You worked the form on the screen through the client's answer without once looking up. A trauma-informed intake is a conversation that produces a record, not a record that happens to involve a conversation — typing through a disclosure tells the person that the form is the thing in the room that matters, and it is the single most common way a good worker accidentally reads as indifferent.",
  },

  lateNotes: {
    "safety-plan-board": "There is nothing to plan with yet — the screening, the pause and the limits of confidentiality all come before a safety plan the client has any reason to help write.",
    "handoff-desk": "Nobody to hand off to yet. The warm handoff carries the safety plan and what the client agreed to, and neither of those exists until this conversation has got there.",
    "intake-log": "Nothing to log yet — the record of this hour is written after the handoff, not alongside the conversation it is supposed to be a record of.",
    "checkin-card": "That one is for afterwards. The worker's own check-in is the last thing in this room, once the client has somewhere to be and the record is closed.",
  },

  steps: [
    {
      id: "room-set", kind: "drag", target: "client-chair",
      title: "Set the client's chair so they can see the door",
      cue: "Move the client's chair to the spot with a clear line to the door, before anybody is sitting in it.",
      drag: { to: "chair-door-spot", radius: 0.5, missNote: "Not on the marked spot yet. The chair has to end up where a seated person can see the door and get to it without going round anyone." },
      why: "Safety in the trauma-informed sense is not reassurance, it is geometry: a person who can see the exit and reach it unobstructed can spend their attention on the conversation instead of on the room. This is done before the client arrives because rearranging furniture around somebody who has already sat down announces that they were sitting somewhere wrong.",
    },
    {
      id: "privacy-card", kind: "turn", target: "door-privacy-dial",
      title: "Turn the door card to \"session in progress\"",
      cue: "Set the door card and the sound mask before the conversation starts.",
      turn: { turns: 0.5, axis: "y", label: "DOOR PRIVACY" },
      why: "A card on the door and a sound mask in the corridor are what make the next hour private in fact rather than in intention, and they have to be set first — the alternative is discovering at the worst moment that the conversation carried into the waiting room. Privacy is the precondition for everything the HIPAA Privacy Rule protects and for anything true being said at all.",
    },
    {
      id: "room-ready", kind: "find", noHint: true,
      targets: ["exit-path", "chair-angle", "comfort-tray"],
      itemNames: {
        "exit-path": "a clear, unblocked path from the client's chair to the door",
        "chair-angle": "the chairs set at an angle rather than square-on",
        "comfort-tray": "water and tissues already within the client's reach",
      },
      itemNotes: {
        "exit-path": "The path counts as much as the sightline. A door you can see but have to squeeze past a table and a worker to reach is not an exit, it is a picture of one.",
        "chair-angle": "Chairs at an angle let a person look away without it being a refusal to look at you — square-on seating turns every pause into a stare-down, which is exactly the pressure this hour is built not to apply.",
        "comfort-tray": "Water and tissues put out in advance mean nobody has to ask for them mid-sentence, and nobody has to be handed something the instant they start crying, which reads as a signal to stop.",
      },
      decoyNotes: {
        "wall-print": "The framed print is pleasant and it is not a control. Nothing about it changes whether this room is safe to sit down in, and a room passes this check on its exits, its seating and what is within reach.",
      },
      title: "Check the room the way a client will read it",
      cue: "Three things in here decide whether this room feels safe to sit down in. Find all three.",
      why: "A client reads a room in about four seconds — where the door is, whether they are cornered, whether anybody expected them. Every one of those judgements is made before a single word of the introduction, which is why the room is checked deliberately rather than assumed, and why the same three things are checked every time rather than whichever one happens to catch the worker's eye.",
    },
    {
      id: "introduce", kind: "select", target: "intro-panel",
      title: "Introduce yourself, your role and how long this takes",
      cue: "Say your name, what your job actually is, and how long you will be asking for — out loud, before anything else.",
      why: "Trustworthiness in a trauma-informed approach is built out of small kept promises, and the first one available is an accurate answer to \"who are you and how long is this\". A client who knows the worker's role, and that the hour ends when it was said it would end, has one less unknown to manage; a client who does not is guessing, and people guess badly about institutions that have not treated them well before.",
    },
    {
      id: "explain-roadmap", kind: "hold", target: "roadmap-board", seconds: 5,
      title: "Explain what will happen in this hour",
      cue: "Hold the roadmap up and walk through the whole hour — the questions, the plan, the handoff, and what happens to what they tell you.",
      why: "Transparency means the client knows the shape of the hour before it happens to them: which questions are coming, who reads the notes, what the handoff at the end is for. Held for the full explanation rather than summarised in a sentence, because an hour described in five seconds has not been described — and surprise, in a first intake, is indistinguishable from a trap.",
      holdBreakNote: "The explanation broke off partway. A client who heard about the questions but not about the handoff, or about the notes but not who reads them, is still walking into most of this hour blind — take it from the top and go through to the end.",
    },
    {
      id: "consent-to-ask", kind: "select", target: "consent-card",
      title: "Ask permission before the questions start",
      cue: "Ask, in plain words, whether it is all right to start asking — and wait for the answer.",
      why: "Choice is the principle that separates an intake from an interrogation, and the cheapest place to establish it is the threshold: asking to begin, and waiting, hands the client the one piece of control that costs the worker nothing and changes everything about what follows. It also establishes that \"no\" and \"not yet\" are real answers in this room, which is the thing the client will need to be true later.",
    },
    {
      id: "screening-order", kind: "sequence",
      targets: ["screen-safety-now", "screen-basic-needs", "screen-supports"],
      itemNames: {
        "screen-safety-now": "is anyone unsafe right now",
        "screen-basic-needs": "housing, food and money this week",
        "screen-supports": "who is already in their corner",
      },
      title: "Work the screening in order",
      cue: "Immediate safety first, then this week's basic needs, then the people already in their corner.",
      why: "The order is the whole design. Immediate safety comes first because it is the only answer that can change what the rest of the hour is for; basic needs next because housing, food and money are what most people actually came in about and asking early says you know that; supports last because it is the question that leaves the client naming something they have rather than something they lack, which is where a first conversation should end up.",
      outOfOrderNote: "Immediate safety, then basic needs, then supports. Starting with who is in their corner before you know whether anyone is unsafe tonight is a pleasant conversation about the wrong hour.",
    },
    {
      id: "screening-pace", kind: "track", target: "screening-form", seconds: 6,
      title: "Ask the screening at the client's pace",
      cue: "Keep the questions moving at the client's pace — not stalled, not running ahead of their answers.",
      track: {
        start: 0.2, green: [0.34, 0.66], rise: 0.52, fall: 0.44, drift: 0.13, label: "QUESTION PACE",
        readout: (v) => (v < 0.34 ? "stalled — the silence is now yours, not theirs" : v > 0.66 ? "running ahead of their answers" : "at their pace"),
      },
      why: "Pace is the part of a screening that no form can carry. Push and the client is answering to get out of the room; stall and they are left holding a silence they did not choose, which for somebody who has been interviewed before feels like a technique. Holding the middle — a question, the whole answer, then the next question — is what makes the difference between a completed form and information anyone can act on.",
      holdBreakNote: "The pace came apart. Either the questions got ahead of the answers or the conversation stalled out — settle back into one question, the whole answer, then the next one.",
    },
    {
      id: "detail-is-theirs", kind: "select", target: "detail-choice-card",
      title: "Say out loud that the detail is theirs to give",
      cue: "Tell the client they can answer with as much or as little as they want, and that skipping a question is a real option.",
      why: "The difference between a screening and an interrogation is whether the person answering knows they can stop. Saying it explicitly — as much or as little as you want, you can skip any of this — is what makes the choice usable, because a client who has been through an institutional process before will assume the opposite unless told otherwise, and what this hour needs is not the narrative anyway.",
    },
    {
      id: "offer-pause", kind: "select", target: "pause-offer",
      title: "Notice the reaction and offer the break",
      cue: "Name what you noticed, gently, and offer a break — water, a minute, the window — without making it a diagnosis.",
      why: "Noticing out loud does two things at once: it tells the client their reaction was seen and was not a problem, and it puts the decision about what happens next in their hands. The offer has to be concrete — water, a few minutes, come back to it — because \"are you okay?\" in a room like this is a question most people answer yes to automatically, and a vague offer of care is one the client has to do the work of accepting.",
    },
    {
      id: "reporting-limits", kind: "select", target: "limits-card",
      title: "State the limits of confidentiality plainly",
      cue: "Say exactly what you are required to pass on and to whom — in plain words, before it matters.",
      why: "This worker is a mandated reporter under California's child abuse and elder and dependent adult reporting laws, and those duties do not wait to be convenient. Said plainly now, before a disclosure makes them urgent, the limits are information the client can use in deciding what to tell you; discovered afterwards, the same facts are a betrayal, and they are the reason people stop coming back to buildings like this one.",
    },
    {
      id: "safety-plan", kind: "hold", target: "safety-plan-board", seconds: 6,
      title: "Start the safety plan in the client's own words",
      cue: "Write the plan down as the client says it — their warning signs, their steps, their people — and read it back.",
      why: "A safety plan written in professional language is a document the client will not recognise at two in the morning, which is the only hour it exists for. Taking their sentences down verbatim, and reading them back so they can correct you, is both the collaborative principle made concrete and the practical thing that makes a plan usable — held for the full writing because a plan finished by the worker is the worker's plan.",
      holdBreakNote: "The plan stopped partway through. Half a safety plan is a list of warning signs with nothing after it — go back and finish it in the client's words, then read the whole thing back.",
    },
    {
      id: "warm-handoff", kind: "select", target: "handoff-desk",
      title: "Make the warm handoff to the clinician",
      cue: "Walk the client over and introduce them to the clinician by name, with what they agreed you would say.",
      why: "A warm handoff is a referral that cannot be lost. The clinician hears the safety plan and the agreed summary from the worker while the client is standing there able to correct it, which means the client does not have to tell the whole thing again to a stranger and does not have to wonder what was said about them. A slip of paper with a phone number on it is the version of this step that fails quietly, weeks later.",
    },
    {
      id: "intake-log", kind: "select", target: "intake-log",
      title: "Write the record of the hour",
      cue: "Log what was screened, what was agreed, the safety plan and the handoff — and only what the client knows is in there.",
      why: "The record is what the clinician, the next worker and any review afterwards actually run on, and it is written after the conversation rather than during it so that the hour belonged to the client. Keeping it to what the client was told would be in it is not a technicality: transparency that stops at the office door is not transparency, and a note the client would be surprised by is a note that will eventually surprise them.",
    },
    {
      id: "own-checkin", kind: "select", target: "checkin-card",
      title: "Check in on yourself before the next one",
      cue: "Take the ninety seconds: name what stayed with you, and use the peer-support or employee assistance line if it needs more than that.",
      why: "Vicarious trauma is cumulative and it is an occupational hazard of this job, not a personal failing — which is why SEIU 1021's own critical-incident language and every employee assistance programme treat the check-in after a hard intake as part of the work. A worker who runs six of these back to back without stopping is the worker who is short with the seventh client, and that client will read it as being about them.",
    },
  ],

  interrupts: [
    {
      id: "client-dissociates",
      kind: "Client dissociating mid-question",
      after: "screening-pace", delay: 3, seconds: 14,
      alert: "Halfway through the basic-needs questions the client's answers go flat and slow, their eyes settle on a point past your shoulder, and the last thing you asked does not seem to have arrived.",
      cue: "Stop the questions. Ground and offer the pause — do not carry on to the next line of the form.",
      target: "grounding-card",
      why: "Somebody who has left the room in this way cannot consent to, answer or remember the next question, so continuing collects nothing and costs a great deal: the client learns that this worker will keep going regardless. Grounding first — name where you both are, offer feet on the floor, water, the window, and let the form wait — is what brings the conversation back to somebody who is actually in it.",
      missNote: "The questions kept going while the client was not there for them. The form has answers in it that nobody in the room could stand behind, and the client has learned that going quiet in here does not stop anything — which is precisely the lesson that makes the next disclosure impossible.",
      wrongNote: "Not the form and not the next question. Ground first: the grounding card is what brings the conversation back to somebody who can actually be in it.",
    },
    {
      id: "colleague-opens-door",
      kind: "Interruption at the door",
      after: "safety-plan", delay: 3, seconds: 12,
      alert: "A knock, and a colleague opens the door mid-sentence to ask whether you have seen the shared caseload folder — the corridor and the waiting room are now inside the conversation.",
      cue: "Step to the door, close it, and ask for the minute. Do not answer them across the room.",
      target: "door-step-out",
      why: "Answering across an open door finishes the interruption but finishes the privacy with it: the client's safety plan, half read aloud, has just been shared with a corridor, and the client now knows that the door on this room does not mean very much. Stepping over, closing it and asking for a minute costs eight seconds and keeps the two promises this hour is standing on — privacy in fact, and that the client's time is not interruptible.",
      missNote: "The conversation carried on with the door open and a colleague in it. The client stopped volunteering anything after that, and they were right to: whatever was said next was said to a room that had just been shown to have other people in it.",
      wrongNote: "That does not close the door. Step over to it yourself, shut it, and ask your colleague for a minute — nothing else in this room makes it private again.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, TII_ACCENT);

    // ------------------------------------------------------------------ shell
    // A real intake room, textured rather than flat: a soft vinyl-plank floor
    // and a painted block wall, both carrying their own grain so the space
    // reads as a room somebody works in rather than a stage.
    const floorTex = surfaceTexture(
      (cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#8c7860", base2: "#7d6a54", seam: "rgba(40,28,16,0.45)" }),
      { repeat: 5, px: 384 });
    const floor = box(g, 5.6, 0.1, 5.2, 0, 0.05, 0, 0x8c7860, { rough: 0.9, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.88, metal: 0.03, color: 0x8c7860 });

    const wallTex = surfaceTexture(
      (cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#5d6a6a", base2: "#526060", seam: "rgba(0,0,0,0.18)" }),
      { repeat: 3, px: 320 });
    const backWall = box(g, 5.6, 2.9, 0.12, 0, 1.45, -2.66, TII_WALL, { rough: 0.94, cast: false });
    backWall.material = texturedMat(wallTex, { rough: 0.93, metal: 0, color: TII_WALL });
    const leftWall = box(g, 0.12, 2.9, 5.2, -2.8, 1.45, 0, TII_WALL, { rough: 0.94, cast: false });
    leftWall.material = texturedMat(wallTex, { rough: 0.93, metal: 0, color: TII_WALL });
    const rightWall = box(g, 0.12, 2.9, 5.2, 2.8, 1.45, 0, TII_WALL, { rough: 0.94, cast: false });
    rightWall.material = texturedMat(wallTex, { rough: 0.93, metal: 0, color: TII_WALL });
    box(g, 5.6, 0.1, 0.16, 0, 2.2, -2.58, TII_WOOD, { rough: 0.8, cast: false });
    ceilingPanel(g, -1.1, -0.8, { y: 2.84, color: 0xfff1dc, ei: 1.5, lamp: 2.2, range: 9 });
    ceilingPanel(g, 1.1, 0.8, { y: 2.84, color: 0xfff1dc, ei: 1.5, lamp: 2.2, range: 9 });

    // ------------------------------------------------------------------- door
    // The thing the whole seating plan is about. It swings when a colleague
    // opens it, and its card turns to "session in progress".
    const doorPost = group(g, 1.85, 0, -2.6);
    box(doorPost, 0.1, 2.18, 0.2, -0.53, 1.09, 0, TII_WOOD, { rough: 0.75 });
    box(doorPost, 0.1, 2.18, 0.2, 0.53, 1.09, 0, TII_WOOD, { rough: 0.75 });
    box(doorPost, 1.16, 0.1, 0.2, 0, 2.23, 0, TII_WOOD, { rough: 0.75 });
    const doorHinge = group(doorPost, -0.48, 0, 0.1);
    const doorLeaf = box(doorHinge, 0.92, 2.1, 0.05, 0.46, 1.05, 0, 0x9a7f60, { rough: 0.7 });
    cyl(doorHinge, 0.022, 0.022, 0.1, 0.86, 1.02, 0.06, CITY.steel, { rough: 0.35, metal: 0.85, seg: 10 })
      .rotation.x = Math.PI / 2;
    holoTag(doorPost, "the door", 0, 2.36, 0.02, { css: TII_CSS, w: 0.26 });

    const privacyPost = group(g, 2.62, 0, -2.0, -Math.PI / 2);
    const privacyDial = cyl(privacyPost, 0.06, 0.06, 0.03, 0, 1.36, 0, 0x8b929a,
      { rough: 0.4, metal: 0.6, seg: 16 });
    privacyDial.rotation.x = Math.PI / 2;
    const privacyCard = decal(privacyPost, 0.3, 0.14, 0, 1.58, 0,
      paperFace("DOOR", ["available"], { bg: "#efe6d4", band: "#8b929a" }), { px: 200 });
    holoTag(privacyPost, "door card + sound mask", 0, 1.74, 0, { css: TII_CSS, w: 0.5 });
    reg(hits, privacyDial, "door-privacy-dial");
    // The propped-open shortcut, on the same frame and deliberately easy.
    const propWedge = box(g, 0.14, 0.05, 0.1, 1.2, 0.12, -2.34, 0xc9642f,
      { rough: 0.7, emissive: 0xc9642f, ei: 0.35 });
    holoTag(g, "prop the door open?", 1.2, 0.3, -2.3, { css: "#f0645b", w: 0.44 });
    reg(hits, propWedge, "prop-door-open");
    // Stepping over to close it: its own marker, so the dial keeps its hit id.
    const stepOutMark = group(g, 1.2, 0, -2.0);
    ball(stepOutMark, 0.02, 0, 1.15, 0, TII_ACCENT, { emissive: TII_ACCENT, ei: 1.2, seg: 10 });
    box(stepOutMark, 0.3, 0.006, 0.3, 0, 0.11, 0, TII_ACCENT,
      { emissive: TII_ACCENT, ei: 0.7, rough: 0.5, cast: false });
    holoTag(stepOutMark, "step over, close it, ask for a minute", 0, 1.3, 0, { css: TII_CSS, w: 0.66 });
    reg(hits, stepOutMark, "door-step-out");

    // ----------------------------------------------------- the client's chair
    // Starts square-on with its back to the door; the first step moves it.
    const CHAIR_HOME = { x: 0.35, z: -0.25 };
    const CHAIR_SPOT = { x: -0.85, z: -1.05 };
    const clientChair = group(g, CHAIR_HOME.x, 0, CHAIR_HOME.z, 0.5);
    box(clientChair, 0.5, 0.06, 0.48, 0, 0.44, 0, 0x4d6f66, { radius: 0.03, rough: 0.7 });
    box(clientChair, 0.5, 0.56, 0.06, 0, 0.72, -0.21, 0x4d6f66, { radius: 0.03, rough: 0.7 });
    for (const [sx, sz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) {
      cyl(clientChair, 0.02, 0.02, 0.42, sx, 0.21, sz, TII_WOOD, { rough: 0.6, seg: 8 });
    }
    holoTag(clientChair, "client's chair", 0, 1.06, 0, { css: TII_CSS, w: 0.36 });
    reg(hits, clientChair, "client-chair");

    const chairSpot = group(g, CHAIR_SPOT.x, 0, CHAIR_SPOT.z);
    const spotRing = decal(chairSpot, 0.62, 0.62, 0, 0.105, 0, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = TII_CSS; cx.lineWidth = Math.max(3, w * 0.04);
      cx.strokeRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84);
      cx.fillStyle = "rgba(111,191,160,0.14)";
      cx.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84);
    }, { px: 192, transparent: true, glow: true, ei: 0.8 });
    spotRing.rotation.x = -Math.PI / 2;
    holoTag(chairSpot, "door in view from here", 0, 0.22, 0, { css: TII_CSS, w: 0.48 });
    hits["chair-door-spot"] = chairSpot;

    // The client, seated, looking toward the door once the chair is placed.
    // The client arrives once the room is set — the chair is moved before
    // anybody is sitting in it, which is the point of the first step.
    const client = seatedFigure(g, CHAIR_SPOT.x, 0.46, CHAIR_SPOT.z - 0.02, {
      skin: 0xc08d63, cloth: 0x4a5d7a, ry: 2.15,
    });
    holoTag(g, "the client", CHAIR_SPOT.x, 2.08, CHAIR_SPOT.z - 0.02, { css: TII_CSS, w: 0.3 });
    client.root.visible = false;

    // ------------------------------------------------- the worker's own chair
    const workerChair = group(g, 0.5, 0, 0.35, -1.9);
    box(workerChair, 0.46, 0.06, 0.44, 0, 0.44, 0, 0x55606b, { radius: 0.03, rough: 0.7 });
    box(workerChair, 0.46, 0.5, 0.06, 0, 0.7, -0.19, 0x55606b, { radius: 0.03, rough: 0.7 });
    for (const [sx, sz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
      cyl(workerChair, 0.018, 0.018, 0.42, sx, 0.21, sz, CITY.darkSteel, { rough: 0.45, metal: 0.5, seg: 8 });
    }
    holoTag(workerChair, "worker's chair — angled, not square-on", 0, 1.0, 0, { css: TII_CSS, w: 0.62 });
    const chairAngleMark = decal(g, 0.5, 0.5, 0.5, 0.104, 0.35, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = TII_CSS; cx.lineWidth = Math.max(2, w * 0.03);
      cx.beginPath(); cx.moveTo(w * 0.12, h * 0.88); cx.lineTo(w * 0.88, h * 0.42); cx.stroke();
      cx.beginPath(); cx.moveTo(w * 0.12, h * 0.88); cx.lineTo(w * 0.12, h * 0.12); cx.stroke();
    }, { px: 160, transparent: true, glow: true, ei: 0.7 });
    chairAngleMark.rotation.x = -Math.PI / 2;
    reg(hits, chairAngleMark, "chair-angle");

    // The seat behind the client, between them and the door — the trap.
    const blockSeat = group(g, -0.2, 0, -2.05, 0.2);
    box(blockSeat, 0.44, 0.06, 0.42, 0, 0.44, 0, 0x6b5a4a, { radius: 0.03, rough: 0.7 });
    box(blockSeat, 0.44, 0.46, 0.06, 0, 0.68, -0.18, 0x6b5a4a, { radius: 0.03, rough: 0.7 });
    holoTag(blockSeat, "sit here, between them and the door?", 0, 0.96, 0, { css: "#f0645b", w: 0.66 });
    reg(hits, blockSeat, "worker-blocks-door");

    // ------------------------------------------------------------ exit path
    const exitPath = decal(g, 0.66, 1.9, 0.4, 0.103, -1.55, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.fillStyle = "rgba(111,191,160,0.12)"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = TII_CSS; cx.lineWidth = Math.max(2, w * 0.035);
      cx.setLineDash?.([w * 0.1, w * 0.08]);
      cx.beginPath(); cx.moveTo(w / 2, h * 0.94); cx.lineTo(w / 2, h * 0.06); cx.stroke();
    }, { px: 192, transparent: true, glow: true, ei: 0.7 });
    exitPath.rotation.x = -Math.PI / 2;
    holoTag(g, "path to the door", 0.4, 0.2, -0.75, { css: TII_CSS, w: 0.4 });
    reg(hits, exitPath, "exit-path");

    // ------------------------------------------------------------ comfort tray
    const trayStand = group(g, -1.85, 0, -1.5, 0.4);
    cyl(trayStand, 0.16, 0.2, 0.52, 0, 0.36, 0, TII_WOOD, { rough: 0.7, seg: 14 });
    const tray = box(trayStand, 0.44, 0.03, 0.34, 0, 0.64, 0, 0xd9d2c4, { radius: 0.01, rough: 0.6 });
    cyl(trayStand, 0.035, 0.03, 0.11, -0.12, 0.71, 0, 0xdfeaf2,
      { rough: 0.25, opacity: 0.65, transparent: true, seg: 12 });
    cyl(trayStand, 0.035, 0.03, 0.11, 0.0, 0.71, 0.06, 0xdfeaf2,
      { rough: 0.25, opacity: 0.65, transparent: true, seg: 12 });
    box(trayStand, 0.13, 0.11, 0.11, 0.14, 0.71, -0.02, 0xece4d2, { rough: 0.8 });
    holoTag(trayStand, "water and tissues, already within reach", 0, 0.88, 0, { css: TII_CSS, w: 0.66 });
    reg(hits, tray, "comfort-tray");

    // The pleasant, irrelevant decoy.
    const wallPrint = decal(g, 0.46, 0.34, -1.2, 1.62, -2.58, (cx, w, h) => {
      cx.fillStyle = "#cfd8cf"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8fa89a"; cx.fillRect(w * 0.08, h * 0.12, w * 0.84, h * 0.56);
      cx.fillStyle = "#e2cf9f"; cx.fillRect(w * 0.08, h * 0.68, w * 0.84, h * 0.2);
    }, { px: 192 });
    holoTag(g, "framed print", -1.2, 1.86, -2.56, { css: "#8fa2af", w: 0.3 });
    reg(hits, wallPrint, "wall-print");

    // ------------------------------------------------ introduction / roadmap
    const introPanel = holoPanel(g, 0.78, 0.5, -2.62, 1.52, -1.2, (cx, w, h) => {
      cx.fillStyle = "rgba(8,22,20,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = TII_CSS; cx.fillRect(0, 0, w, 5);
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillStyle = "#d8f4ea"; cx.fillText("WHO I AM, WHAT THIS IS", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#bfe4d8";
      ["Name and role, said plainly", "About an hour, and it ends on time",
        "You can stop or step out at any point"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.38 + i * 0.17)));
    }, { ry: Math.PI / 2, accent: TII_ACCENT });
    reg(hits, introPanel, "intro-panel");

    const roadmapPanel = holoPanel(g, 0.88, 0.58, -2.62, 1.5, 0.3, (cx, w, h) => {
      cx.fillStyle = "rgba(8,22,20,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = TII_CSS; cx.fillRect(0, 0, w, 6);
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillStyle = "#d8f4ea"; cx.fillText("WHAT HAPPENS IN THIS HOUR", w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#bfe4d8";
      ["1 — some questions, as much as you want to answer", "2 — a plan, in your words, that you keep a copy of",
        "3 — an introduction to the clinician, with you there", "4 — a note I write, saying what we agreed",
        "Who reads it: the clinician and your file. Nobody else."]
        .forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.3 + i * 0.14)));
    }, { ry: Math.PI / 2, accent: TII_ACCENT });
    reg(hits, roadmapPanel, "roadmap-board");

    // ------------------------------------------------ consent / choice cards
    const cardRail = group(g, -2.68, 0, 1.55, Math.PI / 2);
    box(cardRail, 0.9, 0.04, 0.05, 0, 1.28, 0, TII_WOOD, { rough: 0.7 });
    const consentCard = decal(cardRail, 0.32, 0.2, -0.28, 1.46, 0.01,
      paperFace("MAY I START?", ["\"Is it all right if", "I ask you some questions?\""],
        { bg: "#eef6f1", band: "#3f8f74" }), { px: 240 });
    holoTag(cardRail, "ask to begin", -0.28, 1.62, 0.01, { css: TII_CSS, w: 0.32 });
    reg(hits, consentCard, "consent-card");
    const detailCard = decal(cardRail, 0.32, 0.2, 0.06, 1.46, 0.01,
      paperFace("AS MUCH OR AS LITTLE", ["\"You can skip any of these.\"", "\"I don't need the whole story.\""],
        { bg: "#eef6f1", band: "#3f8f74" }), { px: 240 });
    holoTag(cardRail, "the detail is theirs", 0.06, 1.62, 0.01, { css: TII_CSS, w: 0.42 });
    reg(hits, detailCard, "detail-choice-card");
    const pressCard = decal(cardRail, 0.3, 0.18, 0.38, 1.46, 0.01,
      paperFace("START AT THE BEGINNING", ["\"What exactly happened?\""], { bg: "#f6e6e2", band: "#b8402f" }), { px: 240 });
    holoTag(cardRail, "press for the detail?", 0.38, 1.6, 0.01, { css: "#f0645b", w: 0.46 });
    reg(hits, pressCard, "press-for-detail");

    // ------------------------------------------------------ screening station
    const deskTable = group(g, -1.55, 0, 0.95, 0.5);
    box(deskTable, 1.0, 0.72, 0.52, 0, 0.36, 0, 0x6c6157, { rough: 0.7 });
    box(deskTable, 1.06, 0.04, 0.58, 0, 0.74, 0, 0x7d7166, { radius: 0.02, rough: 0.55 });
    holoTag(deskTable, "side desk — beside them, never between", 0, 1.06, 0, { css: TII_CSS, w: 0.7 });

    const screenForm = decal(deskTable, 0.34, 0.44, -0.24, 0.765, 0.02,
      paperFace("INTAKE SCREENING", ["Safety now", "Housing · food · money", "Who's in your corner"],
        { bg: "#f4f1e6", band: "#3f8f74", scale: 0.85 }), { px: 260 });
    screenForm.rotation.x = -Math.PI / 2;
    holoTag(deskTable, "screening form", -0.24, 0.9, 0.02, { css: TII_CSS, w: 0.36 });
    reg(hits, screenForm, "screening-form");

    const SCREEN_ROWS = [["screen-safety-now", "SAFETY NOW", 0.06], ["screen-basic-needs", "THIS WEEK", 0.22], ["screen-supports", "YOUR CORNER", 0.38]];
    for (const [id, label, dx] of SCREEN_ROWS) {
      const row = decal(deskTable, 0.14, 0.11, dx, 0.766, 0.0,
        paperFace(label, [], { bg: "#eef6f1", band: "#3f8f74" }), { px: 160 });
      row.rotation.x = -Math.PI / 2;
      reg(hits, row, id);
    }

    // The screen that is easier to look at than a person.
    const monitor = group(deskTable, 0.34, 0.76, -0.16, -0.5);
    box(monitor, 0.34, 0.22, 0.02, 0, 0.14, 0, 0x22282e, { rough: 0.5, metal: 0.3 });
    const monitorFace = decal(monitor, 0.3, 0.18, 0, 0.14, 0.013,
      signFace("INTAKE FORM\n page 1 of 4", { bg: "#0d1c18", accent: TII_CSS, fg: "#cdeee2", scale: 0.28 }),
      { glow: true, ei: 0.6, px: 260 });
    cyl(monitor, 0.05, 0.06, 0.02, 0, 0.02, 0, 0x2b3138, { rough: 0.5, seg: 12 });
    holoTag(monitor, "work the form, eyes down?", 0, 0.32, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, monitorFace, "eyes-on-screen");

    // ------------------------------------------------------ pause / grounding
    const pausePost = group(g, -2.66, 0, -0.6, Math.PI / 2);
    cyl(pausePost, 0.02, 0.022, 1.1, 0, 0.55, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const pauseCard = decal(pausePost, 0.34, 0.22, 0, 1.24, 0.02,
      paperFace("OFFER THE BREAK", ["\"We can stop for a minute.\"", "Water · the window · come back to it"],
        { bg: "#eef6f1", band: "#3f8f74" }), { px: 260 });
    holoTag(pausePost, "notice it, offer the pause", 0, 1.42, 0.02, { css: TII_CSS, w: 0.5 });
    reg(hits, pauseCard, "pause-offer");

    const groundCard = decal(pausePost, 0.34, 0.22, 0, 0.9, 0.02,
      paperFace("GROUNDING FIRST", ["Name the room · feet on the floor", "Water · slow breath · the form waits"],
        { bg: "#eaf4ef", band: "#2f7f66" }), { px: 260 });
    holoTag(pausePost, "grounding", 0, 1.06, 0.02, { css: TII_CSS, w: 0.26 });
    reg(hits, groundCard, "grounding-card");

    // ------------------------------------------ limits of confidentiality
    const limitsBoard = group(g, 2.66, 0, -0.9, -Math.PI / 2);
    box(limitsBoard, 0.9, 0.62, 0.03, 0, 1.5, 0, 0x33403c, { rough: 0.8 });
    const limitsCard = decal(limitsBoard, 0.78, 0.5, 0, 1.5, 0.025,
      paperFace("WHAT I HAVE TO PASS ON", [
        "A child at risk of harm",
        "An elder or dependent adult at risk",
        "Immediate danger to you or someone else",
        "Said now, so you can decide what to tell me",
      ], { bg: "#f4f1e6", band: "#3f8f74", scale: 0.9 }), { px: 320 });
    holoTag(limitsBoard, "limits of confidentiality", 0, 1.86, 0.03, { css: TII_CSS, w: 0.52 });
    reg(hits, limitsCard, "limits-card");
    const secrecyCard = decal(limitsBoard, 0.36, 0.2, 0.0, 1.06, 0.03,
      paperFace("STAYS IN THIS ROOM", ["\"Nothing you say leaves here.\""], { bg: "#f6e6e2", band: "#b8402f" }), { px: 240 });
    holoTag(limitsBoard, "promise total secrecy?", 0, 1.22, 0.03, { css: "#f0645b", w: 0.48 });
    reg(hits, secrecyCard, "promise-total-secrecy");

    // ----------------------------------------------------------- safety plan
    const planBoard = holoPanel(g, 0.92, 0.6, -1.0, 1.5, -2.58, (cx, w, h) => {
      cx.fillStyle = "rgba(8,22,20,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = TII_CSS; cx.fillRect(0, 0, w, 6);
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillStyle = "#d8f4ea"; cx.fillText("SAFETY PLAN — IN YOUR WORDS", w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#bfe4d8";
      ["When I notice: ______", "What I do first: ______", "Who I call: ______", "Read back, corrected, copy kept"]
        .forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.32 + i * 0.16)));
    }, { accent: TII_ACCENT });
    reg(hits, planBoard, "safety-plan-board");

    // ------------------------------------------------------------- handoff
    const handoffDesk = group(g, 0.9, 0, -2.2, -0.3);
    box(handoffDesk, 0.9, 0.74, 0.44, 0, 0.37, 0, 0x6c6157, { rough: 0.7 });
    box(handoffDesk, 0.96, 0.04, 0.5, 0, 0.76, 0, 0x7d7166, { radius: 0.02, rough: 0.55 });
    const handoffCard = decal(handoffDesk, 0.34, 0.2, 0, 0.785, 0.04,
      paperFace("WARM HANDOFF", ["Introduce by name, client present", "The plan and the agreed summary"],
        { bg: "#f4f1e6", band: "#3f8f74" }), { px: 240 });
    handoffCard.rotation.x = -Math.PI / 2;
    holoTag(handoffDesk, "clinician handoff", 0, 1.0, 0, { css: TII_CSS, w: 0.4 });
    reg(hits, handoffDesk, "handoff-desk");

    // The clinician, waiting at the handoff desk and clear of every control.
    const clinician = standingFigure(g, 1.95, -0.95, { ry: -2.5, cloth: 0x3f6f74, skin: 0xb98a63 });
    holoTag(g, "the clinician", 1.95, 2.12, -0.95, { css: TII_CSS, w: 0.32 });

    // The colleague who opens the door, parked outside until they do.
    const colleagueHome = { x: 1.85, z: -3.3 };
    const colleague = standingFigure(g, colleagueHome.x, colleagueHome.z,
      { ry: 0, cloth: 0x4a5560, skin: 0xd0a074, atStation: true });
    colleague.visible = false;

    // ------------------------------------------------------- record + check-in
    const logPanel = holoPanel(g, 0.8, 0.48, 2.62, 1.48, 0.7, (cx, w, h) => {
      cx.fillStyle = "rgba(8,22,20,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = TII_CSS; cx.fillRect(0, 0, w, 5);
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillStyle = "#d8f4ea"; cx.fillText("INTAKE RECORD", w * 0.06, h * 0.17);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfe4d8";
      ["Screened · planned · handed off", "Only what the client knows is in it"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.48 + i * 0.2)));
    }, { ry: -Math.PI / 2, accent: TII_ACCENT });
    reg(hits, logPanel, "intake-log");

    const checkinPost = group(g, 2.66, 0, 1.9, -Math.PI / 2);
    cyl(checkinPost, 0.02, 0.022, 1.2, 0, 0.6, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const checkinCard = decal(checkinPost, 0.4, 0.26, 0, 1.36, 0.02,
      paperFace("YOUR OWN CHECK-IN", [
        "Ninety seconds: what stayed with you",
        "Peer support · employee assistance line",
        "A hard intake is a work exposure, not a weakness",
      ], { bg: "#eaf4ef", band: "#2f7f66", scale: 0.92 }), { px: 300 });
    holoTag(checkinPost, "worker check-in", 0, 1.56, 0.02, { css: TII_CSS, w: 0.4 });
    reg(hits, checkinCard, "checkin-card");

    // Waiting-room chairs beyond the door, so the propped-door hazard reads.
    for (let i = 0; i < 3; i++) {
      const wc = group(g, 0.95 + i * 0.6, 0, -3.35, Math.PI);
      box(wc, 0.4, 0.05, 0.4, 0, 0.42, 0, 0x4a5560, { radius: 0.03, rough: 0.7, cast: false });
      box(wc, 0.4, 0.44, 0.05, 0, 0.64, -0.17, 0x4a5560, { radius: 0.03, rough: 0.7, cast: false });
    }
    cabinet(g, 0.9, 1.0, 0.36, -2.4, 0.5, 2.1, 0xd2cdc2, { doorColor: 0xc4beb2 });

    let planWritten = false;
    let clientAway = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.6, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "room-set") {
          clientChair.position.set(CHAIR_SPOT.x, 0, CHAIR_SPOT.z);
          clientChair.rotation.y = 2.15;
          spotRing.material.emissiveIntensity = 0.25;
          client.root.visible = true;
        }
        if (step.id === "privacy-card") {
          repaint(privacyCard, paperFace("DOOR", ["session in progress"], { bg: "#eaf4ef", band: "#2f7f66" }));
        }
        if (step.id === "safety-plan") {
          planWritten = true;
          repaint(planBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(8,26,22,0.94)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.fillStyle = "#d8f4ea"; cx.fillText("SAFETY PLAN — READ BACK, CORRECTED", w * 0.05, h * 0.13);
            cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#bfe4d8";
            ["\"When my chest goes tight\"", "\"I go outside and I stand there\"", "\"My sister. She picks up.\""]
              .forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.36 + i * 0.18)));
          });
        }
        if (step.id === "intake-log") {
          repaint(monitorFace, signFace("RECORD\n closed", { bg: "#0d2418", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },

      onHazard(hitId) {
        if (hitId === "prop-door-open") doorHinge.rotation.y = -1.0;
      },

      onInterrupt(it) {
        if (it.id === "client-dissociates") {
          client.head.rotation.x = -0.26;
          client.head.rotation.y = 0.5;
          client.arms[0].shoulder.rotation.z = 0.12;
          groundCard.material.emissiveIntensity = 1.7;
          clientAway = true;
        }
        if (it.id === "colleague-opens-door") {
          doorHinge.rotation.y = -1.15;
          colleague.visible = true;
          colleague.position.set(1.7, 0, -2.45);
          stepOutMark.position.set(1.2, 0.02, -2.0);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "client-dissociates") {
          client.head.rotation.x = 0;
          client.head.rotation.y = 0;
          client.arms[0].shoulder.rotation.z = 0;
          groundCard.material.emissiveIntensity = 0.9;
          clientAway = false;
        }
        if (it.id === "colleague-opens-door") {
          doorHinge.rotation.y = 0;
          colleague.visible = false;
          colleague.position.set(colleagueHome.x, 0, colleagueHome.z);
          stepOutMark.position.set(1.2, 0, -2.0);
        }
      },

      animate(t, dt, session) {
        void dt;
        if (session?.turn && session.step?.id === "privacy-card") {
          privacyDial.rotation.z = session.turn.amount * Math.PI * 2;
        }
        if (!clientAway) client.head.rotation.y = Math.sin(t * 0.4) * 0.04;
        void planWritten; void doorLeaf;
      },
    };
  },
};
