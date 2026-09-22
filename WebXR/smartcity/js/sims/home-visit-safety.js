import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace,
  seatedFigure, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, mudflatFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Home Visit Safety VR — Emergency Services, First Responder
// series: a social worker going out alone to a family with a safety concern.
//
// A home visit is the only part of this job with no colleagues in the room,
// and almost everything that keeps it safe happens before the door opens: the
// address logged with the office, the check-in times agreed, and one plain
// word that means "send help" without saying so in front of anybody. After
// that it is manners as method — knocking, asking to come in, speaking to the
// child at their own height, looking at the home the way a guest does rather
// than the way an inspector does, meeting a parent's anger with a calm voice,
// distance, one speaker and two real choices — and then leaving when the plan
// says to leave rather than when it stops feeling rude, and closing the
// check-in loop from the car.
//
// Sited generically at a single-family house on a residential street. No real
// address, family, agency or child is named or implied; the family here are
// people with a difficult afternoon, not a case study.

const HVS_ACCENT = 0xe0a86a;
const HVS_CSS = "#e0a86a";
const HVS_SIDING = 0x8d8574;
const HVS_TRIM = 0x5f5a50;

export const SIM_HOME_VISIT_SAFETY = {
  id: "home-visit-safety",
  index: "208",
  domain: "Emergency response",
  trade: "Social worker — NASW / SEIU 1021",
  category: "Emergency Services",
  weather: "overcast",
  certification: "The NASW Code of Ethics on self-determination, informed consent and the worker's duty to their own safety; NASW's own guidance on safety in the field for social workers making unaccompanied visits; SAMHSA's trauma-informed principles applied to a family's own home, where the worker is the visitor; Psychological First Aid as published by the National Child Traumatic Stress Network and the World Health Organization; California's mandated-reporter duties under the Child Abuse and Neglect Reporting Act; the HIPAA Privacy Rule, which is what governs how much of a family's information may be said out loud in front of a neighbour, a landlord or a second adult who walks in, and the federal confidentiality rule for substance use disorder records at 42 CFR Part 2 where that is part of the file; Cal/OSHA's Injury and Illness Prevention Program, 8 CCR §3203, under which a county's lone-worker and check-in procedure sits, together with the workplace violence prevention duties added by SB 553; CIT International's crisis intervention model for the point where a visit becomes a call for help; SEIU 1021 social services practice standards, including the local's field-safety and check-in language",
  name: "Home Visit Safety",
  title: simTitle("Home Visit Safety"),
  tagline: "One unaccompanied home visit: the address, the check-in times and the word for send help agreed first, the dog and the way out read on the approach, asked in rather than walked in, the child at eye level, the home observed not inspected, anger met with calm and choices, out when the plan says, and the loop closed from the car",
  accent: HVS_ACCENT,
  accentCss: HVS_CSS,
  parSeconds: 340,
  footprint: 2.6,
  badge: { id: "loop-closed", name: "Loop Closed", note: "A visit somebody else always knew the shape of: planned, checked in, ended on the plan's terms, and closed out from the car" },

  game: system({
    name: "Field Visit",
    currency: "FIELD",
    ranks: ["Field Trainee", "Case Aide", "Social Worker", "Field Supervisor", "Home Visit Certified"],
    badges: [
      { id: "somebody-knew", name: "Somebody Knew", note: "Address, times and the code word all agreed with the office before the car moved", test: AWARD.stepClean("plan-with-office") },
      { id: "guest-not-inspector", name: "Guest, Not Inspector", note: "Asked in, spoken to at the child's height, and nothing opened that was not offered", test: AWARD.safe },
      { id: "left-on-the-plan", name: "Left On The Plan", note: "The exit was taken when the plan said, read off the clock rather than off the atmosphere", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-visit", name: "Clean Visit", note: "No corrections anywhere in the visit", test: AWARD.clean },
      { id: "steady-voice", name: "Steady Voice", note: "The time with the child and the calm through the anger both held without a break", test: AWARD.unbroken },
      { id: "on-the-hour", name: "On The Hour", note: "Complete inside 80% of par with every check-in still made", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "enter-without-asking": "You walked in through the open door. It is their home, and crossing that threshold uninvited is the moment a visit stops being something the family is part of — it also puts a stranger inside a room where nobody has agreed to anything, which is exactly the situation that turns into a shouting match about who let you in. You knock, you say who you are, and you wait to be asked.",
    "back-seat-blocked": "You took the seat at the back of the room with the couch and the table between you and the door. Every piece of field-safety guidance for lone visitors says the same thing about seating, for the same reason: the only way out of a house you do not know is the one you came in by, and a worker who has to climb over furniture to reach it has given up the ability to leave at the one moment leaving matters.",
    "open-the-fridge": "You opened the fridge. Whatever the concern is, a worker who starts opening cupboards and appliances has become an inspector in somebody's kitchen, and the family will remember that and nothing else about this visit — if the concern genuinely requires that kind of look, it is asked for out loud, explained, and declined or agreed to, not taken.",
    "raise-voice-back": "You raised your voice to match theirs. Two people shouting in a small room is not a conversation and cannot become one; the calm voice is not politeness, it is the only thing in the room that gives the volume somewhere to come down to. Matching it guarantees escalation, in front of a child, in a house you cannot control.",
    "reach-for-dog": "You put a hand over the fence to the dog. It may well be friendly and this is still the most common injury on a home visit: a dog in its own yard, with its family agitated inside, and a stranger reaching into its space. The dog gets asked about at the door and put behind a closed door by its owner — never negotiated with directly.",
  },

  lateNotes: {
    "visit-clock": "Nothing to read against yet. The clock matters at the end of the visit, measured against the window that was agreed with the office before it started.",
    "checkin-call": "Not yet. The closing check-in is made from the car once you are out, and it is the end of the visit rather than part of it.",
    "visit-note": "The note gets written after the visit and after the check-in — written in the car, from what happened, not drafted on the way in from what you expect.",
    "debrief-card": "That one is for afterwards. The worker's own check-in comes last, once the office knows you are out and the note is filed.",
  },

  steps: [
    {
      id: "plan-with-office", kind: "sequence",
      targets: ["log-address", "set-checkin-times", "agree-code-word"],
      itemNames: {
        "log-address": "the address and who is expected to be there, on the board",
        "set-checkin-times": "the check-in times, agreed both ways",
        "agree-code-word": "one ordinary word that means send help",
      },
      title: "Plan the visit with the office",
      cue: "Log the address and who should be home, agree the check-in times, and settle the word that means send help.",
      why: "Everything that makes an unaccompanied visit survivable is agreed before the car moves. The address on the board is how anybody knows where to come; the check-in times turn silence into an alarm rather than into an assumption; and one ordinary word — a colleague's name, a file number that does not exist — is how a worker asks for help on the phone while somebody is standing next to them. Agreed in that order because a code word means nothing if nobody knows which house it is coming from.",
      outOfOrderNote: "Address first, then the check-in times, then the code word. A word that means send help is useless to an office that does not yet know where you are or when you were due to call.",
    },
    {
      id: "bag-on-shoulder", kind: "drag", target: "go-bag",
      title: "Take the bag with the phone in the outside pocket",
      cue: "Bag over your shoulder, phone in the outside pocket where one hand can reach it.",
      drag: { to: "shoulder-strap", radius: 0.45, missNote: "Not on the shoulder yet — the bag has to be on you, with the phone in the outside pocket rather than buried, before you walk up." },
      why: "A phone in the bottom of a zipped bag is a phone that does not exist during the ninety seconds it would have mattered, and getting it out is a visible, two-handed act in front of somebody who is already agitated. In the outside pocket it is one hand, in a pocket, while you keep talking — which is the whole difference between making a check-in call and explaining to a room why you are rummaging.",
    },
    {
      id: "park-for-exit", kind: "select", target: "kerb-spot",
      title: "Park where you can leave",
      cue: "Pull up at the kerb facing out — not nosed into the driveway behind somebody else's car.",
      why: "A car in the driveway can be parked in by anybody who comes home, and a car nosed into a kerb has to be reversed out. Facing out at the kerb costs nothing on arrival and is the difference between leaving and negotiating your way out. It is also the least noticeable of all the safety habits, which is why it is the first one people drop.",
    },
    {
      id: "approach-scan", kind: "find", noHint: true,
      targets: ["dog-in-yard", "side-gate", "way-back-out"],
      itemNames: {
        "dog-in-yard": "a dog loose in the side yard",
        "side-gate": "the side gate standing open onto the walk",
        "way-back-out": "the one clear route back to the car",
      },
      itemNotes: {
        "dog-in-yard": "The dog is not a hazard because it is aggressive; it is a hazard because nobody has told it who you are, and because whatever is happening inside the house is already making it bark. It gets asked about at the door.",
        "side-gate": "An open side gate is how the dog gets onto the walk behind you, and it is also a second way into the yard for somebody arriving while you are at the door — noticing it now is what makes closing it a decision rather than an afterthought.",
        "way-back-out": "You came in one way and that is the way you leave. Fixing it now, from outside, is a great deal easier than working it out from the far end of an unfamiliar front room.",
      },
      decoyNotes: {
        "porch-clutter": "The porch is full of stuff and it tells you nothing about whether this visit is safe. Reading a cluttered porch as a finding is how a visit starts with a judgement already made about the family inside it.",
      },
      title: "Read the approach before you knock",
      cue: "Three things on this approach change how you walk in. Find all three before you reach the porch.",
      why: "The walk from the kerb to the door is the last moment with no one watching, and it is where every decision about this visit is cheapest to make. What is loose in the yard, what is open behind you, and which way you leave — those three, deliberately, every time, rather than a general impression of the street formed while thinking about the case notes.",
    },
    {
      id: "gate-latch", kind: "turn", target: "gate-latch",
      title: "Close the side gate behind you",
      cue: "Turn the latch closed so the gate is shut and the dog stays where it is.",
      turn: { turns: 0.5, axis: "y", label: "SIDE GATE LATCH" },
      why: "Closing the gate keeps the dog contained without anybody having to handle it, keeps the walk behind you clear, and keeps one of the two ways into this yard accounted for. It also takes four seconds and is the cheapest correction available on the whole visit — a hazard found on the approach and then left exactly as it was is a hazard you have merely written down.",
    },
    {
      id: "knock-and-introduce", kind: "select", target: "door-intro",
      title: "Knock, and say who you are at the door",
      cue: "Knock, stand back a step, and give your name, your agency and why you are here — before the door is all the way open.",
      why: "Standing back a step from a door you have just knocked on is both courteous and practical: the person opening it is not confronted by somebody in the frame, and you can see the whole doorway rather than a slice of it. Saying who you are and why, plainly, up front, is what stops the first minute being spent on the question everyone in the house is already asking.",
    },
    {
      id: "ask-to-come-in", kind: "select", target: "invite-card",
      title: "Ask to come in",
      cue: "Ask whether you may come in, and wait for the answer — even with the door standing open.",
      why: "The single most useful sentence on a home visit is a question about entering somebody's home, because the answer is the family's first piece of real control over the next hour and they will remember whether it was asked. It is also what keeps the worker on defensible ground: invited in is a completely different position from found inside, both in how the visit goes and in how it reads afterwards — and it is the point at which to ask who else is in the house, since the HIPAA Privacy Rule governs how much of this family's file can be said out loud in front of whoever is sitting in the next room.",
    },
    {
      id: "child-eye-level", kind: "hold", target: "child-eye-level", seconds: 5,
      title: "Speak to the child at their eye level",
      cue: "Get down to the child's height, say your name and what you are doing here, and talk to them rather than about them.",
      why: "A stranger looming over a child in their own front room is frightening, and a stranger discussing that child in the third person over their head while they sit on the floor is worse — it teaches them that adults decide things about them in rooms they are sitting in. Down at their height, with a name and a plain reason, the child is a person in the conversation, which is both the trauma-informed answer and the one that gets anything useful said.",
      holdBreakNote: "You stood back up before that was finished. A crouch and half a sentence is a gesture rather than a conversation — go back down, give the child your name and what you are doing here, and let them answer.",
    },
    {
      id: "observe-not-inspect", kind: "track", target: "observe-pace", seconds: 6,
      title: "Observe the home without inspecting it",
      cue: "Look at the room the way a guest does — steady, no rummaging, no staring at one thing.",
      track: {
        start: 0.2, green: [0.34, 0.66], rise: 0.52, fall: 0.44, drift: 0.14, label: "HOW YOU LOOK",
        readout: (v) => (v < 0.34 ? "not looking at all — you will report nothing" : v > 0.66 ? "inspecting — they can feel it" : "looking like a guest"),
      },
      why: "Almost everything a visit needs to see is visible from where a guest sits: whether there is food, whether the child is at ease, who else is in the house, what the room smells of. Both failure modes cost the visit — a worker who never looks up files a report with nothing in it, and a worker who sweeps the room and fixes on things turns the family into subjects and closes the door on the next visit.",
      holdBreakNote: "That slipped out of looking like a guest — either into inspecting the room or into not seeing it at all. Come back to a steady, ordinary look from where you are sitting.",
    },
    {
      id: "calm-one-speaker", kind: "hold", target: "calm-stance", seconds: 6,
      title: "Meet the anger with a calm voice and one speaker",
      cue: "Drop your volume below theirs, keep your distance and your hands visible, and let one person speak at a time.",
      why: "Volume, distance and turn-taking are the three things a worker can still control once somebody in the room is shouting, and each of them works mechanically rather than psychologically: a quieter voice gives the room somewhere to come down to, distance removes the physical trigger, and one speaker at a time stops the argument recruiting everybody in the house. Held rather than tapped because de-escalation is a couple of minutes of consistency, and thirty seconds of calm followed by a sharp sentence is worse than none.",
      holdBreakNote: "The calm broke — the voice came up, or the distance closed. Reset it: quieter than them, a step further back, hands where they can be seen, and one person talking.",
    },
    {
      id: "two-choices", kind: "select", target: "choice-card",
      title: "Offer two real choices",
      cue: "Name two things that are actually available — sit at the table now, or I come back tomorrow — and mean both of them.",
      why: "A choice is only de-escalating if both options are real, because an adult who is angry will test it immediately and a false option proves that nothing here is negotiable. Two genuine choices hand back the one thing the anger is usually about — having no say in a stranger's visit — and they are also the point at which a worker finds out whether this visit can continue today at all.",
    },
    {
      id: "time-to-go", kind: "gauge", target: "visit-clock",
      title: "Read the clock against the plan's window",
      cue: "Check the time against the window agreed with the office and commit to leaving inside it.",
      gauge: {
        label: "VISIT WINDOW", speed: 0.6, green: [0.34, 0.56],
        readout: (t) => (t < 0.34 ? "early — the visit is not done" : t <= 0.56 ? "inside the window — go now" : "past the window — you are overdue"),
        missNote: "Committed outside the agreed window. The exit is taken against the clock and the plan, not against how the room feels — read it again and leave inside the window.",
      },
      why: "The decision to leave is made in the car park beforehand and read off a clock afterwards, precisely because in the moment it will feel rude, or unfinished, or as if five more minutes would settle it. A visit that runs past its window turns the office's check-in into a false alarm or, worse, teaches them to wait longer next time — and the five minutes almost never settle it.",
    },
    {
      id: "checkin-call", kind: "select", target: "checkin-call",
      title: "Close the check-in loop from the car",
      cue: "From the car, doors shut, call the office: you are out, you are clear, and the visit ended on the plan.",
      why: "A check-in loop that is opened and never closed is worse than one that never existed, because the office learns that the worker's silence does not mean anything. Making the call from the car with the doors shut also means it is made before the drive, and before anything else claims the twenty minutes in which somebody would otherwise still have been waiting to hear.",
    },
    {
      id: "visit-note", kind: "select", target: "visit-note",
      title: "Write the visit up the same day",
      cue: "Note what you saw, what was said, the choices offered and how the visit ended — before the next one starts.",
      why: "A contact note written the same day is the only version that still contains what was actually said, and on a visit with a safety concern in it the record is what the next worker, a supervisor or a court reads instead of asking you to remember — which is also why it is written to the same confidentiality rules as the rest of the file, the HIPAA Privacy Rule and, where substance use is in it, 42 CFR Part 2. Written before the next visit rather than at the end of the week, because by then two family's afternoons have started to blend into one account of neither.",
    },
    {
      id: "own-debrief", kind: "select", target: "debrief-card",
      title: "Check in on yourself before the next visit",
      cue: "Say out loud, to a supervisor or a colleague, what that one was like — and use peer support or the employee assistance line if it needs more.",
      why: "Being shouted at in somebody's home is an occupational exposure, not a bad day you were supposed to handle better, and the county's own critical-incident procedure and SEIU 1021's field-safety language both treat the debrief as part of the visit. A worker who drives straight to the next address is carrying this front room into it, and that family will get a shorter, warier version of the same service.",
    },
  ],

  interrupts: [
    {
      id: "second-adult-arrives",
      kind: "Second adult arriving angry",
      after: "calm-one-speaker", delay: 3, seconds: 14,
      alert: "A car door slams at the kerb and a second adult comes in fast through the front door behind you, already talking over the parent about who called whom.",
      cue: "Move to the door side, hands visible, and ask for one person at a time — do not stay boxed in.",
      target: "exit-side-step",
      why: "A second agitated adult changes the arithmetic of the room completely: there are now two people to de-escalate, a conversation happening across you, and somebody standing between you and the way out. Repositioning to the door side is what keeps the exit available and, said out loud — I'm going to stand over here, and I'd like one person at a time — it is also a de-escalation in itself, because it announces that you are not squaring up to anybody.",
      missNote: "The visit carried on with two adults arguing across you and one of them between you and the door. The room got louder with a child in it, nothing that was said could be relied on afterwards, and the one move that was still available — step to the door side and ask for one speaker — stopped being available about twenty seconds in.",
      wrongNote: "Not from where you are standing. Move to the door side first, hands visible, and then ask for one person at a time — position is what makes the sentence work.",
    },
    {
      id: "checkin-time-passed",
      kind: "Missed check-in",
      after: "observe-not-inspect", delay: 3, seconds: 14,
      alert: "The agreed check-in time goes by while you are sitting in the front room, and the phone is in the outside pocket of a bag on the floor beside your chair.",
      cue: "Take the phone out and make the check-in now — a short, ordinary call, out loud if it has to be.",
      target: "phone-out",
      why: "A missed check-in is not a paperwork lapse: it is the office's only signal, and if it is allowed to slide once then the next silence — the one that matters — will be read as the worker running late again. Making the call out loud in front of the family is not a problem either; it is honest about how this job works, and it quietly tells the room that somebody knows where you are.",
      missNote: "The check-in time passed and then passed again, with the phone an arm's length away the whole time. The office now has a worker whose silence means nothing in particular, which is precisely the state the check-in procedure exists to prevent — and the family never knew anybody was expecting to hear from you.",
      wrongNote: "That is not the check-in. Get the phone out of the outside pocket and make the call — nothing else in this room tells the office you are still fine.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, HVS_ACCENT);

    // ------------------------------------------------------------ the ground
    // A dry front yard and a cast path up to the porch, both textured so the
    // approach reads as a street somebody lives on.
    const yardTex = surfaceTexture(
      (cx, w, h) => mudflatFace(cx, w, h, { base: "#5c5741", base2: "#4a4635", cracks: 44, pools: 2 }),
      { repeat: 4, px: 384 });
    const yard = slab(g, 7.0, 0.08, 6.6, 0, 0.04, 0.2, 0x5c5741, { rough: 0.95, cast: false, radius: 0.05 });
    yard.material = texturedMat(yardTex, { rough: 0.95, metal: 0, color: 0x5c5741 });

    const pathTex = surfaceTexture(
      (cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#7d7466", base2: "#6f675a", seam: "rgba(0,0,0,0.45)" }),
      { repeat: 5, px: 384 });
    const path = slab(g, 1.1, 0.06, 4.0, 0.9, 0.09, 0.5, 0x7d7466, { rough: 0.9, cast: false, radius: 0.03 });
    path.material = texturedMat(pathTex, { rough: 0.9, metal: 0, color: 0x7d7466 });

    const kerbStrip = slab(g, 5.0, 0.1, 0.5, 0.4, 0.06, 2.9, 0x8c8578, { rough: 0.92, cast: false });
    kerbStrip.material = texturedMat(pathTex, { rough: 0.92, metal: 0, color: 0x8c8578 });

    // ---------------------------------------------------------- the car, kerbside
    const car = group(g, 3.15, 0, 2.35, Math.PI / 2);
    box(car, 3.5, 0.5, 1.5, 0, 0.55, 0, 0x4c5a68, { radius: 0.12, rough: 0.5, metal: 0.4 });
    box(car, 2.0, 0.52, 1.36, -0.1, 1.04, 0, 0x3f4c58, { radius: 0.1, rough: 0.45, metal: 0.35 });
    box(car, 1.7, 0.36, 1.38, -0.1, 1.06, 0, 0x22303c, { rough: 0.2, metal: 0.2, opacity: 0.55, transparent: true });
    for (const [wx, wz] of [[-1.15, -0.72], [1.15, -0.72], [-1.15, 0.72], [1.15, 0.72]]) {
      const wheel = cyl(car, 0.32, 0.32, 0.2, wx, 0.32, wz, 0x1b1e22, { rough: 0.85, seg: 16 });
      wheel.rotation.x = Math.PI / 2;
    }
    holoTag(g, "your car — facing out", 3.15, 1.6, 2.35, { css: HVS_CSS, w: 0.48 });

    const kerbSpot = group(g, 2.05, 0, 2.3);
    const kerbMark = decal(kerbSpot, 0.7, 1.4, 0, 0.115, 0, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.fillStyle = "rgba(224,168,106,0.16)"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = HVS_CSS; cx.lineWidth = Math.max(3, w * 0.05);
      cx.strokeRect(w * 0.08, h * 0.06, w * 0.84, h * 0.88);
      cx.beginPath(); cx.moveTo(w * 0.5, h * 0.82); cx.lineTo(w * 0.5, h * 0.18);
      cx.lineTo(w * 0.34, h * 0.34); cx.moveTo(w * 0.5, h * 0.18); cx.lineTo(w * 0.66, h * 0.34); cx.stroke();
    }, { px: 192, transparent: true, glow: true, ei: 0.8 });
    kerbMark.rotation.x = -Math.PI / 2;
    holoTag(kerbSpot, "kerb, facing out — not the driveway", 0, 0.28, 0, { css: HVS_CSS, w: 0.64 });
    reg(hits, kerbMark, "kerb-spot");

    // The go-bag, on the passenger seat until it is on a shoulder. The bag body
    // and the phone are siblings inside one rig, so the phone keeps its own hit
    // id rather than being swallowed by the bag's.
    const bagRig = group(g, 2.6, 0.75, 1.95, 0.4);
    const goBag = group(bagRig, 0, 0, 0);
    box(goBag, 0.3, 0.24, 0.14, 0, 0, 0, 0x3a4048, { radius: 0.03, rough: 0.8 });
    box(goBag, 0.16, 0.1, 0.05, 0, -0.02, 0.09, 0x2d323a, { radius: 0.02, rough: 0.8 });
    holoTag(goBag, "go-bag", 0, 0.3, 0, { css: HVS_CSS, w: 0.26 });
    reg(hits, goBag, "go-bag");
    const phoneOut = box(bagRig, 0.08, 0.14, 0.02, 0, 0.04, 0.11, 0x141a20,
      { rough: 0.35, emissive: 0x3c6f8a, ei: 0.5 });
    holoTag(bagRig, "phone — outside pocket", 0.02, 0.18, 0.11, { css: HVS_CSS, w: 0.46 });
    reg(hits, phoneOut, "phone-out");

    // Where the bag ends up: on your shoulder, beside the car, before you walk up.
    const shoulderStrap = group(g, 2.0, 0, 1.6);
    const shoulderMark = decal(shoulderStrap, 0.42, 0.42, 0, 0.115, 0, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = HVS_CSS; cx.lineWidth = Math.max(3, w * 0.06);
      cx.beginPath(); cx.arc(w / 2, h / 2, w * 0.36, 0, Math.PI * 2); cx.stroke();
    }, { px: 160, transparent: true, glow: true, ei: 0.8 });
    shoulderMark.rotation.x = -Math.PI / 2;
    holoTag(shoulderStrap, "on your shoulder", 0, 0.24, 0, { css: HVS_CSS, w: 0.4 });
    hits["shoulder-strap"] = shoulderStrap;

    // ------------------------------------------------------ office plan board
    const planBoard = holoPanel(g, 1.0, 0.62, 2.55, 1.55, 0.9, (cx, w, h) => {
      cx.fillStyle = "rgba(24,16,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = HVS_CSS; cx.fillRect(0, 0, w, 6);
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillStyle = "#f7e4c8"; cx.fillText("FIELD VISIT PLAN — WITH THE OFFICE", w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#e6cfae";
      ["Address + who is expected home: ______", "Check-in at arrival, at 30 min, on leaving",
        "Code word for send help: ______", "Who answers if you miss one: ______"]
        .forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.32 + i * 0.16)));
    }, { ry: -0.7, accent: HVS_ACCENT });
    const PLAN_CHIPS = [["log-address", "ADDRESS", -0.3], ["set-checkin-times", "TIMES", 0.0], ["agree-code-word", "CODE WORD", 0.3]];
    for (const [id, label, dx] of PLAN_CHIPS) {
      const chip = decal(planBoard, 0.26, 0.1, dx, -0.4, 0.01,
        signFace(label, { bg: "#1d1408", accent: HVS_CSS, fg: "#f7e4c8", scale: 0.44 }), { px: 200, glow: true, ei: 0.7 });
      reg(hits, chip, id);
    }

    // --------------------------------------------------------------- the house
    const house = group(g, 0, 0, -2.45);
    const sidingTex = surfaceTexture(
      (cx, w, h) => pavingFace(cx, w, h, { tiles: 8, base: "#8d8574", base2: "#7f7767", seam: "rgba(40,32,20,0.4)" }),
      { repeat: 4, px: 384 });
    // The wall returns either side of the opening, and the header over it. The
    // front of the house is cut away the way a training mock-up is, so the
    // front room the visit actually happens in is visible from outside it.
    const wallLeft = box(house, 1.7, 2.9, 0.16, -2.25, 1.45, 0, HVS_SIDING, { rough: 0.9, cast: false });
    wallLeft.material = texturedMat(sidingTex, { rough: 0.9, metal: 0, color: HVS_SIDING });
    const wallRight = box(house, 1.1, 2.9, 0.16, 2.55, 1.45, 0, HVS_SIDING, { rough: 0.9, cast: false });
    wallRight.material = texturedMat(sidingTex, { rough: 0.9, metal: 0, color: HVS_SIDING });
    const header = box(house, 6.2, 0.5, 0.16, 0, 2.65, 0, HVS_SIDING, { rough: 0.9, cast: false });
    header.material = texturedMat(sidingTex, { rough: 0.9, metal: 0, color: HVS_SIDING });
    box(house, 6.6, 0.22, 0.6, 0, 3.0, 0.18, HVS_TRIM, { rough: 0.85, cast: false });
    // A window in each return.
    for (const [wx, ww] of [[-2.25, 0.8], [2.55, 0.6]]) {
      box(house, ww, 1.0, 0.06, wx, 1.5, 0.1, 0x2c3a44, { rough: 0.25, metal: 0.15 });
      box(house, ww + 0.1, 0.08, 0.1, wx, 2.04, 0.12, HVS_TRIM, { rough: 0.85 });
    }
    // The front door, hinged at the right-hand return and standing wide open
    // against the outside wall — which is how you found it.
    const doorFrame = group(house, 2.0, 0, 0.1);
    box(doorFrame, 0.12, 2.4, 0.22, 0, 1.2, 0, HVS_TRIM, { rough: 0.8 });
    box(doorFrame, 0.12, 2.4, 0.22, -3.4, 1.2, 0, HVS_TRIM, { rough: 0.8 });
    const doorHinge = group(doorFrame, 0.02, 0, 0.1);
    const frontDoor = box(doorHinge, 0.9, 2.1, 0.05, 0.45, 1.05, 0, 0x7a4e33, { rough: 0.75 });
    box(doorHinge, 0.04, 0.12, 0.04, 0.82, 1.0, 0.04, 0x9aa2aa, { rough: 0.35, metal: 0.8 });
    doorHinge.rotation.y = 1.5;

    // The porch and its steps.
    const porch = group(g, 0.35, 0, -1.85);
    slab(porch, 3.0, 0.14, 1.2, 0, 0.14, 0, 0x6f6252, { rough: 0.9, cast: false, radius: 0.03 });
    slab(porch, 1.3, 0.1, 0.34, 0.2, 0.05, 0.72, 0x6f6252, { rough: 0.9, cast: false });
    for (const px of [-1.35, 1.35]) box(porch, 0.1, 0.5, 0.1, px, 0.45, 0.45, HVS_TRIM, { rough: 0.85 });
    box(porch, 2.9, 0.06, 0.06, 0, 0.72, 0.45, HVS_TRIM, { rough: 0.85, cast: false });
    // Porch clutter — the decoy.
    const clutter = group(porch, -1.05, 0.21, 0.1, 0.3);
    box(clutter, 0.4, 0.3, 0.32, 0, 0.15, 0, 0x6b5e4a, { rough: 0.85 });
    box(clutter, 0.32, 0.22, 0.26, 0.04, 0.4, 0.02, 0x7b6c55, { rough: 0.85 });
    cyl(clutter, 0.1, 0.13, 0.26, 0.34, 0.13, 0.1, 0x4f6a4a, { rough: 0.9, seg: 12 });
    holoTag(clutter, "porch clutter", 0, 0.7, 0, { css: "#8fa2af", w: 0.32 });
    reg(hits, clutter, "porch-clutter");

    // The knock-and-introduce spot, a step back from the frame.
    const introSpot = group(g, 0.1, 0, -1.2);
    const introMark = decal(introSpot, 0.6, 0.6, 0, 0.3, 0, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = HVS_CSS; cx.lineWidth = Math.max(3, w * 0.05);
      cx.beginPath(); cx.arc(w / 2, h / 2, w * 0.4, 0, Math.PI * 2); cx.stroke();
      cx.fillStyle = "rgba(224,168,106,0.14)";
      cx.beginPath(); cx.arc(w / 2, h / 2, w * 0.4, 0, Math.PI * 2); cx.fill();
    }, { px: 192, transparent: true, glow: true, ei: 0.8 });
    introMark.rotation.x = -Math.PI / 2;
    const introCard = decal(introSpot, 0.42, 0.24, 0, 1.3, 0,
      paperFace("AT THE DOOR", ["Knock · stand back a step", "Name · agency · why you're here"],
        { bg: "#f6ecda", band: "#9a6b34" }), { px: 260 });
    holoTag(introSpot, "knock and introduce", 0, 1.48, 0, { css: HVS_CSS, w: 0.44 });
    reg(hits, introCard, "door-intro");

    const inviteCard = decal(introSpot, 0.42, 0.22, 0.62, 1.3, 0,
      paperFace("MAY I COME IN?", ["Asked out loud, and waited for", "even with the door open"],
        { bg: "#eef4ea", band: "#3f7f4a" }), { px: 260 });
    holoTag(introSpot, "ask to come in", 0.62, 1.46, 0, { css: HVS_CSS, w: 0.38 });
    reg(hits, inviteCard, "invite-card");

    const walkInMark = decal(introSpot, 0.34, 0.2, -0.62, 1.28, 0,
      paperFace("DOOR'S OPEN", ["\"I'll just come through.\""], { bg: "#f6e6e2", band: "#b8402f" }), { px: 240 });
    holoTag(introSpot, "walk straight in?", -0.62, 1.44, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, walkInMark, "enter-without-asking");

    // ------------------------------------------------------- the side yard + dog
    const sideYard = group(g, -2.35, 0, -0.5);
    box(sideYard, 0.1, 1.5, 2.6, 0, 0.75, 0, 0x6b5f4c, { rough: 0.9 });
    for (let i = 0; i < 5; i++) box(sideYard, 0.06, 1.4, 0.14, 0.02, 0.7, -1.1 + i * 0.55, 0x7a6d58, { rough: 0.9 });
    const gateGroup = group(sideYard, 0, 0, 1.55);
    const gateLeaf = box(gateGroup, 0.06, 1.35, 0.95, 0, 0.7, -0.48, 0x7a6d58, { rough: 0.9 });
    gateGroup.rotation.y = -0.7;
    const gateLatch = cyl(sideYard, 0.035, 0.035, 0.1, 0.06, 0.95, 1.6, 0x9aa2aa, { rough: 0.4, metal: 0.75, seg: 12 });
    gateLatch.rotation.z = Math.PI / 2;
    holoTag(sideYard, "side gate latch", 0.1, 1.2, 1.6, { css: HVS_CSS, w: 0.38 });
    reg(hits, gateLatch, "gate-latch");
    const gateOpenMark = box(sideYard, 0.2, 0.3, 0.3, 0.1, 0.5, 1.15, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(sideYard, "gate standing open", 0.1, 0.78, 1.15, { css: "#f0645b", w: 0.42 });
    reg(hits, gateOpenMark, "side-gate");

    const dog = group(g, -3.0, 0, -0.9, 0.7);
    box(dog, 0.52, 0.26, 0.22, 0, 0.44, 0, 0x6d5a45, { radius: 0.06, rough: 0.9 });
    ball(dog, 0.12, 0.3, 0.52, 0, 0x6d5a45, { rough: 0.9, seg: 12 });
    box(dog, 0.14, 0.09, 0.09, 0.4, 0.5, 0, 0x5c4b39, { rough: 0.9 });
    for (const [dx, dz] of [[-0.18, -0.08], [0.18, -0.08], [-0.18, 0.08], [0.18, 0.08]]) {
      cyl(dog, 0.035, 0.03, 0.32, dx, 0.16, dz, 0x5c4b39, { rough: 0.9, seg: 8 });
    }
    cyl(dog, 0.025, 0.015, 0.22, -0.3, 0.52, 0, 0x5c4b39, { rough: 0.9, seg: 8 }).rotation.z = -0.9;
    holoTag(dog, "dog in the side yard", 0, 0.82, 0, { css: HVS_CSS, w: 0.46 });
    reg(hits, dog, "dog-in-yard");
    const dogReach = box(g, 0.24, 0.24, 0.24, -2.6, 1.0, -0.9, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reach over and say hello?", -2.6, 1.22, -0.9, { css: "#f0645b", w: 0.52 });
    reg(hits, dogReach, "reach-for-dog");

    // -------------------------------------------------------- the way back out
    const wayOutMark = decal(g, 0.9, 1.6, 1.7, 0.12, 1.55, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.fillStyle = "rgba(224,168,106,0.12)"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = HVS_CSS; cx.lineWidth = Math.max(2, w * 0.04);
      cx.setLineDash?.([w * 0.12, w * 0.1]);
      cx.beginPath(); cx.moveTo(w / 2, h * 0.94); cx.lineTo(w / 2, h * 0.06); cx.stroke();
    }, { px: 192, transparent: true, glow: true, ei: 0.7 });
    wayOutMark.rotation.x = -Math.PI / 2;
    holoTag(g, "the one way back to the car", 1.7, 0.3, 1.55, { css: HVS_CSS, w: 0.56 });
    reg(hits, wayOutMark, "way-back-out");

    // ------------------------------------------------------------ front room
    // Behind the open door: a front room the visit actually happens in.
    const room = group(g, 0.3, 0, -3.3);
    slab(room, 3.9, 0.1, 2.1, 0, 0.05, 0, 0x6a5b48, { rough: 0.92, cast: false });
    box(room, 3.9, 2.6, 0.12, 0, 1.3, -1.05, 0x7d7566, { rough: 0.94, cast: false });
    for (const sx of [-1, 1]) box(room, 0.12, 2.6, 2.1, sx * 1.95, 1.3, 0, 0x726a5c, { rough: 0.94, cast: false });
    // Couch along the back, with the two seats that matter.
    const couch = group(room, -0.85, 0, -0.62);
    box(couch, 1.6, 0.42, 0.7, 0, 0.3, 0, 0x5a6a62, { radius: 0.06, rough: 0.9 });
    box(couch, 1.6, 0.5, 0.18, 0, 0.66, -0.3, 0x5a6a62, { radius: 0.06, rough: 0.9 });
    for (const sx of [-1, 1]) box(couch, 0.16, 0.4, 0.7, sx * 0.72, 0.5, 0, 0x50605a, { radius: 0.05, rough: 0.9 });
    holoTag(couch, "the couch — back of the room", 0, 1.0, 0, { css: "#8fa2af", w: 0.56 });
    const backSeat = box(couch, 0.5, 0.06, 0.5, -0.4, 0.54, 0, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(couch, "sit here, furniture between you and the door?", -0.4, 0.78, 0, { css: "#f0645b", w: 0.74 });
    reg(hits, backSeat, "back-seat-blocked");

    // The chair on the door side, where the worker actually sits.
    const doorSideChair = group(room, 1.05, 0, 0.35, -0.4);
    box(doorSideChair, 0.46, 0.06, 0.44, 0, 0.44, 0, 0x6b5a4a, { radius: 0.03, rough: 0.8 });
    box(doorSideChair, 0.46, 0.5, 0.06, 0, 0.7, -0.19, 0x6b5a4a, { radius: 0.03, rough: 0.8 });
    for (const [sx, sz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
      cyl(doorSideChair, 0.018, 0.018, 0.42, sx, 0.21, sz, 0x59493a, { rough: 0.8, seg: 8 });
    }
    holoTag(doorSideChair, "door-side chair", 0, 1.0, 0, { css: HVS_CSS, w: 0.36 });
    const exitSide = group(room, 1.5, 0, 0.72);
    const exitMark = decal(exitSide, 0.55, 0.55, 0, 0.11, 0, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = HVS_CSS; cx.lineWidth = Math.max(3, w * 0.05);
      cx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);
      cx.fillStyle = "rgba(224,168,106,0.16)"; cx.fillRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);
    }, { px: 176, transparent: true, glow: true, ei: 0.85 });
    exitMark.rotation.x = -Math.PI / 2;
    const exitCard = decal(exitSide, 0.42, 0.24, 0, 1.3, 0,
      paperFace("MOVE TO THE DOOR SIDE", ["\"I'm going to stand over here.\"", "\"One person at a time, please.\""],
        { bg: "#eef4ea", band: "#3f7f4a" }), { px: 260 });
    holoTag(exitSide, "step to the door side", 0, 1.48, 0, { css: HVS_CSS, w: 0.5 });
    reg(hits, exitCard, "exit-side-step");

    // The child, on a floor mat, and the eye-level marker.
    const mat0 = decal(room, 0.9, 0.7, -0.2, 0.105, 0.5, (cx, w, h) => {
      cx.fillStyle = "#8a6f8a"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#c9a8c9"; cx.fillRect(w * 0.06, h * 0.08, w * 0.88, h * 0.84);
      cx.fillStyle = "#8a6f8a";
      for (let i = 0; i < 4; i++) cx.fillRect(w * (0.14 + i * 0.2), h * 0.2, w * 0.08, h * 0.6);
    }, { px: 192 });
    mat0.rotation.x = -Math.PI / 2;
    const child = seatedFigure(room, -0.2, 0.12, 0.5, { skin: 0xc79a70, cloth: 0xc4694f, ry: 0.4 });
    child.root.scale.setScalar(0.62);
    holoTag(room, "the child", -0.2, 1.18, 0.5, { css: HVS_CSS, w: 0.28 });
    const eyeLevel = group(room, 0.35, 0, 0.75);
    ball(eyeLevel, 0.022, 0, 0.78, 0, HVS_ACCENT, { emissive: HVS_ACCENT, ei: 1.3, seg: 10 });
    box(eyeLevel, 0.4, 0.008, 0.4, 0, 0.12, 0, HVS_ACCENT,
      { emissive: HVS_ACCENT, ei: 0.7, rough: 0.5, cast: false });
    holoTag(eyeLevel, "down to their height, by name", 0, 0.94, 0, { css: HVS_CSS, w: 0.58 });
    reg(hits, eyeLevel, "child-eye-level");

    // The parent, standing, and the calm-stance marker across from them.
    const parent = standingFigure(room, -1.3, 0.2, { ry: 1.2, cloth: 0x4a5a6e, skin: 0xb98a63 });
    holoTag(room, "the parent", -1.3, 2.16, 0.2, { css: HVS_CSS, w: 0.3 });

    const calmSpot = group(room, 0.55, 0, -0.1);
    const calmMark = decal(calmSpot, 0.6, 0.6, 0, 0.11, 0, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = "#7fd1c9"; cx.lineWidth = Math.max(3, w * 0.05);
      cx.beginPath(); cx.arc(w / 2, h / 2, w * 0.4, 0, Math.PI * 2); cx.stroke();
      cx.fillStyle = "rgba(127,209,201,0.14)";
      cx.beginPath(); cx.arc(w / 2, h / 2, w * 0.4, 0, Math.PI * 2); cx.fill();
    }, { px: 192, transparent: true, glow: true, ei: 0.85 });
    calmMark.rotation.x = -Math.PI / 2;
    const calmCard = decal(calmSpot, 0.44, 0.26, 0, 1.32, 0,
      paperFace("QUIETER THAN THEM", [
        "Volume under theirs · hands visible",
        "A step further back, not closer",
        "One person talking at a time",
      ], { bg: "#e6f2f0", band: "#2f7f78", scale: 0.9 }), { px: 280 });
    holoTag(calmSpot, "calm voice, distance, one speaker", 0, 1.52, 0, { css: "#7fd1c9", w: 0.66 });
    reg(hits, calmCard, "calm-stance");

    const shoutCard = decal(calmSpot, 0.34, 0.2, 0.0, 0.92, 0.01,
      paperFace("MATCH THEIR VOLUME", ["\"Don't talk to me like that.\""], { bg: "#f6e6e2", band: "#b8402f" }), { px: 240 });
    holoTag(calmSpot, "raise your voice back?", 0, 1.08, 0.01, { css: "#f0645b", w: 0.5 });
    reg(hits, shoutCard, "raise-voice-back");

    const choiceCard = decal(calmSpot, 0.44, 0.24, 0.72, 1.3, 0,
      paperFace("TWO REAL CHOICES", ["\"We sit at the table now…\"", "\"…or I come back tomorrow.\""],
        { bg: "#eef4ea", band: "#3f7f4a" }), { px: 260 });
    holoTag(calmSpot, "offer two choices", 0.72, 1.46, 0, { css: HVS_CSS, w: 0.42 });
    reg(hits, choiceCard, "choice-card");

    // The observation pacing readout, sitting on the low table.
    const lowTable = group(room, 0.0, 0, -0.05, 0.2);
    box(lowTable, 0.8, 0.36, 0.5, 0, 0.28, 0, 0x6b5a4a, { rough: 0.85 });
    box(lowTable, 0.86, 0.04, 0.56, 0, 0.48, 0, 0x7b6a58, { radius: 0.02, rough: 0.8 });
    const observePad = instrument(lowTable, -0.2, 0.5, 0.06, { ry: 0.1, idle: "HOW YOU LOOK", color: HVS_ACCENT, w: 0.18, d: 0.22 });
    holoTag(lowTable, "guest, not inspector", -0.2, 0.68, 0.06, { css: HVS_CSS, w: 0.44 });
    reg(hits, observePad, "observe-pace");

    // The kitchen corner, and the fridge nobody asked you to open.
    const kitchen = group(room, 1.45, 0, -0.72, -0.3);
    box(kitchen, 0.7, 0.9, 0.6, 0, 0.45, 0, 0x8d8e88, { rough: 0.7, metal: 0.15 });
    box(kitchen, 0.72, 0.05, 0.62, 0, 0.92, 0, 0x6f7069, { radius: 0.02, rough: 0.6 });
    const fridge = box(kitchen, 0.6, 1.5, 0.6, 0.75, 0.75, 0, 0xc6cbc9, { rough: 0.45, metal: 0.25 });
    const fridgeDoor = box(kitchen, 0.04, 1.4, 0.56, 1.06, 0.75, 0.01, 0xd6dbd9, { rough: 0.4, metal: 0.2 });
    box(kitchen, 0.03, 0.3, 0.03, 1.09, 0.95, -0.2, 0x8d959d, { rough: 0.35, metal: 0.8 });
    holoTag(kitchen, "open the fridge and look?", 0.75, 1.66, 0, { css: "#f0645b", w: 0.52 });
    reg(hits, fridgeDoor, "open-the-fridge");

    // The second adult, arriving through the front door when they arrive.
    const secondHome = { x: 1.1, z: 2.0 };
    const secondAdult = standingFigure(g, secondHome.x, secondHome.z,
      { ry: Math.PI, cloth: 0x5d4c56, skin: 0xd0a074, atStation: true });
    secondAdult.visible = false;

    // ------------------------------------------- clock, check-in, note, debrief
    const clockPost = group(g, 2.55, 0, -1.2, -0.9);
    cyl(clockPost, 0.025, 0.03, 1.3, 0, 0.65, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const visitClock = instrument(clockPost, 0, 1.34, 0, { idle: "--:-- in", color: HVS_ACCENT, w: 0.2, d: 0.24 });
    holoTag(clockPost, "visit window", 0, 1.56, 0, { css: HVS_CSS, w: 0.32 });
    reg(hits, visitClock, "visit-clock");

    const carDeskPanel = holoPanel(g, 0.86, 0.52, 2.6, 1.5, 1.95, (cx, w, h) => {
      cx.fillStyle = "rgba(24,16,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = HVS_CSS; cx.fillRect(0, 0, w, 5);
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillStyle = "#f7e4c8"; cx.fillText("CLOSING CHECK-IN", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#e6cfae";
      ["From the car, doors shut", "\"I'm out, I'm clear, ended on the plan\""]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.2)));
    }, { ry: -1.0, accent: HVS_ACCENT });
    reg(hits, carDeskPanel, "checkin-call");

    const noteBoard = group(g, -2.3, 0, 1.85, 0.8);
    box(noteBoard, 0.8, 0.56, 0.05, 0, 1.4, 0, 0x4a4238, { rough: 0.85 });
    const noteSheet = decal(noteBoard, 0.7, 0.46, 0, 1.4, 0.035,
      paperFace("CONTACT NOTE — TODAY", [
        "Who was home, what was said",
        "Choices offered, how it ended",
        "Check-ins made, and when",
      ], { bg: "#f6ecda", band: "#9a6b34", scale: 0.9 }), { px: 300 });
    holoTag(noteBoard, "same-day contact note", 0, 1.72, 0.05, { css: HVS_CSS, w: 0.5 });
    reg(hits, noteSheet, "visit-note");

    const debriefCard = decal(noteBoard, 0.36, 0.24, 0, 0.92, 0.035,
      paperFace("YOUR OWN CHECK-IN", [
        "Say what that one was like",
        "Peer support · employee assistance",
        "Being shouted at is an exposure",
      ], { bg: "#e6f2f0", band: "#2f7f78", scale: 0.88 }), { px: 280 });
    holoTag(noteBoard, "worker check-in", 0, 1.1, 0.05, { css: HVS_CSS, w: 0.4 });
    reg(hits, debriefCard, "debrief-card");

    // A neighbouring house and a street tree, so the street reads as a street.
    const neighbour = group(g, -4.6, 0, -3.6, 0.3);
    box(neighbour, 3.2, 2.6, 2.2, 0, 1.3, 0, 0x6e6a60, { rough: 0.92, cast: false });
    box(neighbour, 3.5, 0.3, 2.5, 0, 2.7, 0, 0x55514a, { rough: 0.9, cast: false });
    box(neighbour, 0.8, 0.9, 0.06, 0.9, 1.5, 1.14, 0x2c3a44, { rough: 0.3, metal: 0.15 });
    const tree = group(g, -3.5, 0, 2.7);
    cyl(tree, 0.14, 0.18, 2.1, 0, 1.05, 0, 0x4e4034, { rough: 0.95, seg: 10 });
    ball(tree, 0.85, 0, 2.5, 0, 0x4a5c3c, { rough: 0.95, seg: 12 });
    ball(tree, 0.6, 0.55, 2.2, 0.3, 0x445536, { rough: 0.95, seg: 10 });

    let checkedIn = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.2, -1.8),

      onStepComplete(step) {
        if (step.id === "bag-on-shoulder") {
          // Carried in: the bag ends the walk on the floor beside the door-side
          // chair, which is where the missed check-in finds it.
          bagRig.position.set(1.75, 0.12, -3.1);
          bagRig.rotation.y = 0.3;
          shoulderMark.material.emissiveIntensity = 0.25;
        }
        if (step.id === "gate-latch") {
          gateGroup.rotation.y = 0;
          gateLatch.position.x = 0.02;
        }
        if (step.id === "checkin-call") {
          checkedIn = true;
          repaint(visitClock.userData.screen,
            signFace("OUT · CLEAR", { bg: "#0d2418", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
        }
      },

      onHazard(hitId) {
        if (hitId === "open-the-fridge") fridgeDoor.rotation.y = -1.1;
        if (hitId === "reach-for-dog") dog.rotation.y = 1.6;
      },

      onInterrupt(it) {
        if (it.id === "second-adult-arrives") {
          secondAdult.visible = true;
          secondAdult.position.set(0.6, 0, -2.45);
          exitMark.material.emissiveIntensity = 1.8;
          doorHinge.rotation.y = 2.25;
        }
        if (it.id === "checkin-time-passed") {
          repaint(visitClock.userData.screen,
            signFace("CHECK-IN DUE", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.38 }));
          phoneOut.material = mat(0x9fd8ee, { emissive: 0x4fbfe8, ei: 2.0, rough: 0.35 });
          phoneOut.position.y = 0.22;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "second-adult-arrives") {
          secondAdult.visible = false;
          secondAdult.position.set(secondHome.x, 0, secondHome.z);
          exitMark.material.emissiveIntensity = 0.85;
          doorHinge.rotation.y = 1.5;
        }
        if (it.id === "checkin-time-passed") {
          repaint(visitClock.userData.screen,
            signFace("CHECKED IN", { bg: "#0d2418", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
          phoneOut.material = mat(0x141a20, { emissive: 0x3c6f8a, ei: 0.5, rough: 0.35 });
          phoneOut.position.y = 0.16;
        }
      },

      animate(t, dt, session) {
        void dt;
        if (session?.turn && session.step?.id === "gate-latch") {
          gateLatch.rotation.x = session.turn.amount * Math.PI * 2;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "time-to-go") {
          repaint(visitClock.userData.screen, signFace(
            gg.t < 0.34 ? "early" : gg.t <= 0.56 ? "GO NOW" : "overdue",
            { bg: "#1d1408", accent: gg.t >= 0.34 && gg.t <= 0.56 ? "#59c97b" : "#f2ae14", fg: "#f7e4c8", scale: 0.4 }));
        }
        parent.userData.head.rotation.y = Math.sin(t * 0.5) * 0.08;
        void checkedIn; void frontDoor; void fridge; void gateLeaf;
      },
    };
  },
};
