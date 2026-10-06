import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat,
  counter, cabinet, seatedFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Wellness — Asking for Help and Resources. The last walkable
// station of the Job Readiness Edition's Wellness Resource Center block.
//
// The front room of a training programme's wellness centre, the week a
// trainee's own life is going sideways: two shifts of sleep missed, a
// notice on the apartment door, a court date that lands on a class day, and
// a temper that went at the instructor this morning. The learner is that
// trainee, and the exercise is the one nobody trains — asking. What is
// scored is the sequence a good case manager or peer would walk a person
// through: read your own week honestly, rate the stress, sort the plate,
// match each problem to the right door, put the ask on today's calendar,
// make the room private, make one call and stay on it, keep the intake
// honest, know which door is for a crisis and which is for a Tuesday, tell
// the instructor what you need without diagnosing yourself, know what the
// employee assistance programme keeps and what the employer gets, book the
// follow-up, and take the check-in.
//
// Four things in the room are why the station exists: the "just don't go
// in" card, the payday-advance app, the cohort chat, and the card that says
// deal with it when it is a crisis. Each is what people do instead of asking.
// Sited generically. No real programme, employer, landlord or person is named.

const WAH_ACCENT = 0x7fc4a0;
const WAH_CSS = "#7fc4a0";

export const SIM_WELLNESS_ASKING_FOR_HELP_AND_RESOURCES = {
  id: "wellness-asking-for-help-and-resources",
  index: "231",
  domain: "Workforce readiness",
  trade: "Pre-apprentice — the trainee whose week is going sideways",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "rain",
  certification: "SAMHSA's guidance on help-seeking and its national helpline, its trauma-informed care principles applied to the person asking, and the 988 Suicide and Crisis Lifeline for the door that is for a crisis; Psychological First Aid's look, listen, link, turned on yourself — practical needs first, then the link — as the Red Cross and NCTSN teach it; the Sphere Handbook's minimum standard on mental health and psychosocial support for the layered model of help this room is arranged by; OSHA's medical services and first aid rule in 29 CFR 1910.151, the floor under an employer's duty to have somebody a worker can go to; HIPAA, for what the employee assistance programme's clinician keeps and the employer never sees; NIOSH's work-organisation and stress guidance for the signs read at the start; the SEIU and AFSCME locals whose members staff wellness and benefits rooms like this one, and the Teamsters' training programmes on the warehouse side",
  name: "Wellness — Asking for Help and Resources",
  title: simTitle("Wellness — Asking for Help and Resources"),
  tagline: "The week your own life goes sideways: the signs read on yourself, the stress rated, the plate sorted, each problem matched to its door, one call made and stayed on, the crisis line told apart from the case manager, the instructor told what you need, and the follow-up booked",
  accent: WAH_ACCENT,
  accentCss: WAH_CSS,
  parSeconds: 330,
  footprint: 2.4,
  supportLine: "the programme's peer-support team or the employee assistance programme (EAP) line your employer or union carries — and, in a crisis, the 988 Suicide and Crisis Lifeline",
  badge: { id: "asked", name: "Asked", note: "Every problem matched to its door, one call made and stayed on, nothing posted, nothing borrowed at four hundred percent, and a follow-up on the calendar" },

  game: system({
    name: "Wellness Resource Center",
    currency: "REACH",
    ranks: ["Trainee", "Asked Once", "Knows the Doors", "Resource Navigator", "Job Ready"],
    badges: [
      { id: "read-yourself", name: "Read Yourself", note: "Every sign on your own week found before the dial was touched", test: AWARD.stepClean("read-your-week") },
      { id: "no-shortcuts", name: "No Shortcuts", note: "No unsafe action anywhere in the run — the app, the chat and the no-show left alone", test: AWARD.safe },
      { id: "stayed-on-the-line", name: "Stayed on the Line", note: "The call and the intake both carried their full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-ask", name: "Clean Ask", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "honest-number", name: "Honest Number", note: "The stress check committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "six-straight", name: "Six Straight", note: "Six correct actions in a row", test: AWARD.streak(6) },
    ],
  }),

  hazards: {
    "ghost-the-shift": "You decided not to go in tomorrow and not to call. A no-show is the one thing a training programme and an employer both read the same way, and it turns a week that could have been fixed with a schedule adjustment into a week that ended the placement. The call that asks for the day is ten seconds long; the silence costs the job.",
    "payday-advance-app": "You opened the payday-advance app to cover the rent notice. A loan against next week's pay at a few hundred percent a year is the fastest way to make a one-week rent problem a three-month one, and it is exactly what the consumer bodies the financial coaching block cites warn about first. The case manager's door is on the same wall, and the rent is what it is for.",
    "crew-chat-post": "You posted the whole situation in the cohort chat. Twenty people now know about the notice, the court date and the temper, none of them can do anything about any of it, and the one person who could — the case manager — heard it fourth-hand. Asking is done to a door, by name, not to a room.",
    "wait-for-crisis": "You put the card back — \"I'll deal with it when it's actually a crisis.\" Every door in this room is easier to walk through on a Tuesday than at two in the morning, and the crisis line exists for the people who waited. SAMHSA's guidance on help-seeking says the same thing the case manager would: the earlier the ask, the smaller the door has to be.",
  },

  lateNotes: {
    "tell-need": "Tell the instructor after the call, not before it — a schedule ask with a plan behind it is a request; one without is an excuse.",
    "followup-card": "The follow-up goes on the calendar after the call is made, or you are booking a check on a plan that does not exist yet.",
  },

  steps: [
    {
      id: "read-your-week", kind: "find", noHint: true,
      targets: ["sign-two-nights", "sign-rent-notice", "sign-snapped"],
      itemNames: {
        "sign-two-nights": "two nights of sleep missed",
        "sign-rent-notice": "the notice on the apartment door",
        "sign-snapped": "the temper at the instructor this morning",
      },
      itemNotes: {
        "sign-two-nights": "Two nights of no real sleep, from somebody who was sleeping fine in week two. It is a change, and it is the one that makes the other two worse.",
        "sign-rent-notice": "A pay-or-quit notice with a date on it. It has a deadline, which means it goes to the door that can move deadlines, today.",
        "sign-snapped": "You went at the instructor over a tool-count. That is the sign the people around you saw first, and it is a stress reaction, not a character flaw.",
      },
      decoyNotes: {
        "sign-late-bus": "The bus was late. That is a bus.",
        "sign-tired-friday": "Tired on a Friday after a week of dock work is Friday. The signs that matter are the changes.",
      },
      title: "Read your own week the way you would read a friend's",
      cue: "Three things on this board are signs. Two are just a week. Find the signs.",
      why: "The hardest person to read honestly is yourself, and the point of this step is to use the same eye on your own week that the peer-support station taught you to use on somebody else's: a change in sleep, a deadline with a date on it, a reaction the people around you noticed. NIOSH's guidance on work stress describes the pattern in the same terms, and a trainee who can name three concrete things is a trainee who can walk to a door and say them, which is the whole station.",
    },
    {
      id: "stress-check", kind: "gauge", target: "stress-dial",
      title: "Rate the stress honestly",
      cue: "The dial swings one to ten. Commit it where the week actually is.",
      gauge: {
        label: "STRESS", speed: 0.6, green: [0.62, 0.86],
        readout: (t) => `${Math.round(1 + t * 9)} / 10`,
        missNote: "That number does not match the board. A rent notice, two missed nights and a temper you did not recognise is not a four — and the doors you choose next depend on the number being true.",
      },
      why: "The stress check is the guide's own card, and here it has a job beyond honesty: the number decides which doors you go to first. A seven with a rent deadline goes to the case manager today; a nine with the words \"I can't do this\" behind it goes to the crisis line first and the case manager second. Rating it low to feel better is choosing the wrong door for the week you are actually having, and SAMHSA's guidance on help-seeking says the number is the person's own to give.",
    },
    {
      id: "sort-the-plate", kind: "sequence", anyOrder: true,
      targets: ["plate-rent", "plate-sleep", "plate-court"],
      itemNames: {
        "plate-rent": "the rent notice — a deadline",
        "plate-sleep": "the sleep — a pattern",
        "plate-court": "the court date on a class day — a schedule",
      },
      title: "Sort what is on your plate",
      cue: "Three problems onto the board — a deadline, a pattern and a schedule. Order does not matter yet.",
      why: "A week that feels like one problem is usually three, and they go to three different doors. Sorting them on a board — the rent is a deadline, the sleep is a pattern, the court date is a schedule clash — is what turns \"everything is falling apart\" into three asks, each of which somebody in this building can answer. It is the same move a case manager makes in the first five minutes, and doing it yourself is what lets you walk in with a list instead of a feeling.",
    },
    {
      id: "rent-to-case-manager", kind: "select", target: "case-manager-door",
      title: "Match the rent notice to its door",
      cue: "The deadline goes to the case manager — emergency rent help, a letter to the landlord, today. Not the app beside it.",
      why: "A pay-or-quit notice has a date on it, and the door that can do anything about a date is the programme's case manager: emergency assistance funds, a letter to the landlord, a payment plan, a referral to legal aid — all of which exist and none of which a payday-advance app is. The financial coaching block of this edition spends a whole station on why that app is the wrong door; this step is the moment the two blocks meet, at a wall with both doors on it.",
    },
    {
      id: "ask-on-today", kind: "drag", target: "ask-card",
      title: "Put the ask on today's calendar",
      cue: "Carry the ask card to today's slot. Not tomorrow, not \"this week\".",
      drag: {
        to: "cal-today", radius: 0.5,
        missNote: "Not on today. An ask booked for \"this week\" is an ask booked for the day after the rent deadline.",
      },
      why: "The distance between deciding to ask and asking is where most asks die, and the calendar is how you close it: a slot, today, with the door's name on it. It also makes the ask a thing that exists outside your head, which matters on a week when your head is the least reliable thing in the room. The case manager's hours are on the wall; the slot is yours to fill.",
    },
    {
      id: "privacy-sign", kind: "turn", target: "door-sign",
      title: "Turn the door sign before the call",
      cue: "Turn the sign to In Use. This call is not made in a corridor.",
      turn: { turns: 0.5, axis: "y", label: "DOOR SIGN" },
      why: "The call you are about to make will include the rent, the court date and how you are sleeping, and none of it belongs to whoever walks in for a coffee. The sign is the same one the peer-support station turns for somebody else; here you turn it for yourself, and the fact that it feels harder is the point. Privacy is a thing you are allowed to arrange for your own conversation, not only for other people's.",
    },
    {
      id: "make-the-call", kind: "hold", target: "desk-phone", seconds: 8,
      title: "Make the call and stay on it",
      cue: "Pick up the handset and hold through the hold music and the first questions. Do not hang up at the menu.",
      why: "The first call to a case manager or an employee assistance line has a menu, a wait and three questions before a person is on the line, and the trainee who hangs up at the menu has asked nobody for anything and will say afterwards that they tried. Holding through it is the whole skill — the wait is not a sign the door is closed, it is what every door sounds like at ten in the morning. Stay on until somebody says their name.",
      holdBreakNote: "You hung up at the menu. Nobody heard the ask — pick it up and hold through the wait; it is shorter than it feels.",
    },
    {
      id: "honest-intake", kind: "track", target: "intake-point", seconds: 7,
      title: "Keep the intake honest",
      cue: "Answer the intake questions in the band — not minimising, not spiralling.",
      track: {
        start: 0.5, green: [0.36, 0.68], rise: 0.5, fall: 0.42, drift: 0.15, label: "INTAKE",
        readout: (v) => (v < 0.36 ? "minimising" : v > 0.68 ? "spiralling" : "honest"),
      },
      why: "An intake conversation drifts two ways. Minimise — \"it's fine, just a rough week\" — and the person on the line closes the file with a leaflet; spiral, and the three problems become one undifferentiated flood nobody can act on. Honest sits between: the rent notice and its date, two nights of sleep, the court date on a class day, the number you gave the dial. It is the sorted plate, said out loud, and it is what gets the case manager to open the emergency fund instead of the pamphlet drawer.",
      holdBreakNote: "The intake got away from you — into \"it's fine\" or into everything at once. Come back to the three things on the board and the number on the dial.",
    },
    {
      id: "which-door-is-988", kind: "select", target: "lifeline-card",
      title: "Know which door is for a crisis",
      cue: "Read the 988 card: it is for the night you cannot keep yourself safe. The case manager is for the rent. Know the difference before you need it.",
      why: "The wall has doors for a Tuesday and one door for a night, and a trainee who knows the difference will use both correctly: the case manager for the rent, the employee assistance programme for the counselling, the peer team for the conversation, and the 988 Suicide and Crisis Lifeline for the hour when none of those is open and the thought in the room is about not being here. Reading the card on a Tuesday is what makes the number available at two in the morning; nobody learns it for the first time then.",
    },
    {
      id: "instructor-what", kind: "sequence",
      targets: ["tell-need", "tell-plan", "tell-when"],
      itemNames: {
        "tell-need": "what you need — the court date off, and a make-up session",
        "tell-plan": "what you are doing about the rest — the case manager, the call made",
        "tell-when": "by when — the follow-up date",
      },
      title: "Tell the instructor what you need — not what is wrong with you",
      cue: "The need, then the plan, then the date. No diagnosis, no apology tour.",
      why: "An instructor can move a class, arrange a make-up and note the absence as planned; an instructor cannot fix the rent or the sleep and does not need the story. The order — what you need, what you are doing about the rest, by when — gives them the three things they can act on and nothing they have to carry. It also keeps your medical and financial life where it belongs: with the case manager and the employee assistance clinician, whose records the programme does not read.",
      outOfOrderNote: "Need, then plan, then date. Leading with the plan is telling somebody your business before they know what you are asking; leading with the date is a demand.",
    },
    {
      id: "what-eap-keeps", kind: "select", target: "records-card",
      title: "Know what the employee assistance programme keeps",
      cue: "Read the records card: the clinician's file is the clinician's under HIPAA. The employer learns that you called, at most — never what you said.",
      why: "The fear that stops most asks is that asking becomes a record the employer reads, and the answer is on the card: the employee assistance programme's clinician keeps their own file under HIPAA, the employer may learn that the service was used and nothing more, and the programme's case manager keeps the rent conversation in a case file the instructor does not open. Knowing where each thing is written down is what lets a person say the true version of the week to the person who can act on it.",
    },
    {
      id: "book-the-follow-up", kind: "drag", target: "followup-card",
      title: "Book the follow-up",
      cue: "Carry the follow-up card to the one-week slot. The case manager will want to know the letter went and the rent moved.",
      drag: {
        to: "cal-week", radius: 0.5,
        missNote: "Not on the calendar. A follow-up that lives as \"I'll come back\" is one that comes back after the next notice.",
      },
      why: "One call is a start, not a plan; the follow-up is where the case manager finds out whether the landlord answered the letter and where you find out whether the sleep plan from the shift-work station held. A week is soon enough that a missed step can still be caught and late enough that something has had time to happen. Written on the same calendar as the ask, it turns a hard week into a sequence of appointments, which is what a hard week is supposed to become.",
    },
    {
      id: "check-in", kind: "select", target: "checkin-board",
      title: "Take the check-in",
      cue: "Answer the guide's question. It is never scored, and it is the same question the week was about.",
      why: "A trainee who has just asked for help four times in one room — the case manager, the phone, the instructor, the calendar — has done the thing the whole Wellness Resource Center block exists to make ordinary, and the guide's check-in is the last ask, aimed at yourself. The answer stays in your own browser; the peer-support team and the employee assistance line are on the card for the run where the honest answer is \"need a minute\"; and \"steady\" is allowed to be true.",
    },
  ],

  interrupts: [
    {
      id: "coworker-within-earshot",
      kind: "Somebody sits down within earshot",
      after: "make-the-call", delay: 3, seconds: 12,
      alert: "A cohort-mate has come in for a coffee and sat down at the next table, well inside earshot of the phone.",
      cue: "Ask for the room — plainly, without saying why. The call can hold for ten seconds.",
      target: "ask-for-the-room",
      why: "The sign on the door did its job until somebody did not read it, and the call is about to reach the rent and the court date. Asking a cohort-mate for the room — \"can I have five minutes in here?\" — is a sentence people find harder than the call itself, and it is the one that keeps the call honest; a person answering intake questions with somebody they know at the next table gives the minimised version. You are allowed to ask for privacy for your own conversation.",
      missNote: "He sat there through the call and you gave the intake the short version. The case manager got \"a rough week\" and a leaflet's worth of help, and the rent notice still has its date on it.",
      wrongNote: "Not the handset, and not the door sign. The thing that has to happen is asking the person in the room for it — the sign is not going to say it for you.",
    },
    {
      id: "landlord-on-the-other-line",
      kind: "Landlord calling on the other line",
      after: "honest-intake", delay: 3, seconds: 12,
      alert: "The second line lights up: the landlord, calling about the notice, while the intake worker is mid-question.",
      cue: "Let it ring. Finish the intake; call the landlord back with the case manager's letter in hand.",
      target: "let-it-ring",
      why: "The landlord's call feels like the urgent one and is the wrong one to take now: a tenant who answers with nothing arranged agrees to whatever is offered, and a tenant who calls back an hour later with a case manager's letter and a payment plan is a different conversation. Dropping the intake to take it also ends the ask halfway, which the intake worker reads as the trainee not being serious. Let it ring; the number is on the screen.",
      missNote: "You picked up the second line and the intake worker was left holding. The landlord got a promise you could not keep, the intake got closed as incomplete, and both calls have to be made again.",
      wrongNote: "Not the intake point, and not the handset you are already holding. The right answer is the card that says let it ring — the landlord is a call-back, with the letter in hand.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, WAH_ACCENT);

    // ------------------------------------------------------------------ floor
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#6b7570", base2: "#616b66", seam: "rgba(28,36,32,0.4)",
    }), { repeat: 4, px: 384 });
    const floor = box(g, 5.6, 0.018, 4.9, 0, 0.01, -0.5, 0x6b7570, { rough: 0.95, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.95, metal: 0.02, color: 0x6b7570 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#b9c2b8", base2: "#adb6ac", seam: "rgba(60,72,64,0.3)",
    }), { repeat: 3, px: 320 });
    const backWall = box(g, 6.4, 2.9, 0.12, 0, 1.45, -3.1, 0xb9c2b8, { rough: 0.9 });
    backWall.material = texturedMat(wallTex, { rough: 0.9, metal: 0.02, color: 0xb9c2b8 });
    box(g, 6.6, 0.1, 0.2, 0, 2.95, -3.1, 0x7f8a82, { rough: 0.8 });
    const leftWall = box(g, 0.12, 2.9, 5.0, -3.1, 1.45, -0.6, 0xb9c2b8, { rough: 0.9 });
    leftWall.material = texturedMat(wallTex, { rough: 0.9, metal: 0.02, color: 0xb9c2b8 });
    // Rain on the window in the left wall.
    box(g, 0.02, 1.0, 1.2, -3.02, 1.7, -2.2, 0x8fb0c8, { rough: 0.2, metal: 0.1, opacity: 0.6, transparent: true, cast: false });

    // ------------------------------------------------------------ the doorway
    const doorway = group(g, 2.95, 0, 1.4, -Math.PI / 2);
    box(doorway, 0.14, 2.3, 0.16, -0.62, 1.15, 0, 0x4e565f, { rough: 0.7 });
    box(doorway, 0.14, 2.3, 0.16, 0.62, 1.15, 0, 0x4e565f, { rough: 0.7 });
    box(doorway, 1.4, 0.14, 0.16, 0, 2.37, 0, 0x4e565f, { rough: 0.7 });
    box(doorway, 1.06, 2.14, 0.06, 0.0, 1.08, 0.08, 0x7a685a, { rough: 0.65 });
    cyl(doorway, 0.02, 0.02, 0.12, 0.42, 1.05, 0.14, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 10 }).rotation.x = Math.PI / 2;
    const signMount = group(doorway, -0.9, 1.5, 0.12);
    cyl(signMount, 0.015, 0.015, 0.06, 0, 0, 0, 0xb0b8c0, { rough: 0.3, metal: 0.8, seg: 8 }).rotation.x = Math.PI / 2;
    const doorSign = group(signMount, 0, 0, 0.04);
    const signPlate = decal(doorSign, 0.22, 0.1, 0, 0, 0,
      signFace("FREE", { bg: "#0c1a24", accent: "#59c97b", scale: 0.5 }), { px: 160, glow: true, ei: 0.7 });
    holoTag(signMount, "Door sign — turn to In Use", 0, 0.14, 0.04, { css: WAH_CSS, w: 0.56 });
    reg(hits, doorSign, "door-sign");

    // --------------------------------------------------------- the resource wall
    // Every door in the building, on one wall, each a card with a name and a
    // number: the case manager, the employee assistance programme, the peer
    // team, legal aid, food, childcare — and the crisis line, set apart.
    const wall = group(g, -0.2, 1.55, -3.0);
    box(wall, 2.6, 1.3, 0.05, 0, 0, 0, 0x8a7862, { rough: 0.85 });
    holoTag(wall, "Resource wall — every door, named and numbered", 0, 0.75, 0.04, { css: WAH_CSS, w: 0.84 });
    const DOORS = [
      ["case-manager-door", "Case manager — rent, letters, schedule", -0.95, 0.35, WAH_CSS, true],
      ["eap-door", "EAP — counselling, clinician's file", -0.32, 0.35, WAH_CSS, false],
      ["peer-door", "Peer team — the conversation", 0.32, 0.35, WAH_CSS, false],
      ["legal-door", "Legal aid — the notice, the court date", 0.95, 0.35, WAH_CSS, false],
      ["food-door", "Food pantry — Tue and Thu", -0.64, -0.2, "#9fb0c0", false],
      ["childcare-door", "Childcare referral", 0.0, -0.2, "#9fb0c0", false],
      ["steward-door", "Steward — your rights on the job", 0.64, -0.2, "#9fb0c0", false],
    ];
    for (const [did, label, x, y, css, live] of DOORS) {
      const sheet = decal(wall, 0.44, 0.3, x, y, 0.03,
        paperFace(label.split(" — ")[0], [label.split(" — ")[1] ?? ""], { scale: 0.5 }), { px: 256 });
      holoTag(wall, label, x, y - 0.21, 0.04, { css, w: 0.6 });
      if (live) reg(hits, sheet, did);
    }
    // The payday-advance app card, hung on the same wall as the case manager.
    const appCard = decal(wall, 0.36, 0.22, -1.6, 0.35, 0.03,
      signFace("GET PAID EARLY — TAP", { bg: "#2a1416", accent: "#f0645b", scale: 0.34 }), { px: 224, glow: true, ei: 0.8 });
    holoTag(wall, "Payday-advance app — cover the rent?", -1.6, 0.12, 0.04, { css: "#f0645b", w: 0.7 });
    reg(hits, appCard, "payday-advance-app");

    // The crisis line, set apart on the left wall with its own light.
    const lifeline = group(g, -2.98, 1.6, -0.4, Math.PI / 2);
    const lifelineCard = decal(lifeline, 0.42, 0.26, 0, 0, 0,
      signFace("988 — SUICIDE & CRISIS LIFELINE\nCALL OR TEXT · ANY HOUR", { bg: "#0c1a24", accent: "#f2c14b", fg: "#ffe9b0", scale: 0.22 }), { px: 320, glow: true, ei: 0.8, transparent: true });
    holoTag(lifeline, "The door for a night, not a Tuesday", 0, 0.2, 0.002, { css: "#f2c14b", w: 0.66 });
    reg(hits, lifelineCard, "lifeline-card");
    ball(lifeline, 0.03, 0.26, 0.18, 0.02, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.4, seg: 10 });
    const recordsCard = decal(lifeline, 0.4, 0.28, 0, -0.42, 0,
      paperFace("WHO KEEPS WHAT", ["EAP file — clinician, under HIPAA", "Employer — that you called, at most", "Case file — case manager only"], { scale: 0.5 }), { px: 256 });
    holoTag(lifeline, "What the EAP keeps", 0, -0.62, 0.002, { css: WAH_CSS, w: 0.42 });
    reg(hits, recordsCard, "records-card");

    // ------------------------------------------------------------- the desk
    const desk = counter(g, 1.6, 0.7, 0.3, -1.7, 0x6b5a48, { ry: 0, height: 0.76, undershelf: false, rough: 0.6, metal: 0.05 });
    void desk;
    function deskChair(parent, x, z, ry) {
      const c = group(parent, x, 0, z, ry);
      box(c, 0.44, 0.06, 0.44, 0, 0.44, 0, 0x4a535c, { rough: 0.8 });
      box(c, 0.44, 0.5, 0.06, 0, 0.72, -0.19, 0x4a535c, { rough: 0.8 });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(c, 0.018, 0.018, 0.44, sx * 0.18, 0.22, sz * 0.18, 0x5b636b, { rough: 0.4, metal: 0.6, seg: 8 });
      return c;
    }
    deskChair(g, 0.3, -1.05, Math.PI);
    deskChair(g, 1.7, -0.2, 2.4);
    // A second small table where the cohort-mate sits when he comes in.
    cyl(g, 0.4, 0.4, 0.04, 1.75, 0.72, -0.5, 0x6b5a48, { rough: 0.5, seg: 20 });
    cyl(g, 0.05, 0.07, 0.7, 1.75, 0.35, -0.5, 0x3a4149, { rough: 0.5, metal: 0.4, seg: 12 });

    // The desk phone with its two lines, and the intake point.
    const phoneBase = group(g, -0.2, 0.79, -1.85, 0.2);
    box(phoneBase, 0.22, 0.07, 0.16, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const handset = box(phoneBase, 0.06, 0.035, 0.2, -0.07, 0.05, 0, 0x1b1e22, { rough: 0.5 });
    for (let i = 0; i < 6; i++) box(phoneBase, 0.02, 0.008, 0.014, 0.03 + (i % 3) * 0.035, 0.038, -0.03 + Math.floor(i / 3) * 0.04, 0xe6eaee, { rough: 0.5 });
    const line1 = ball(phoneBase, 0.01, 0.02, 0.045, 0.06, 0x59c97b, { emissive: 0x59c97b, ei: 1.0, seg: 8 });
    const line2 = ball(phoneBase, 0.01, 0.06, 0.045, 0.06, 0x3a4149, { emissive: 0x000000, ei: 0, seg: 8 });
    void line1;
    holoTag(phoneBase, "Desk phone — make the call", 0, 0.2, 0, { css: WAH_CSS, w: 0.52 });
    reg(hits, handset, "desk-phone");
    const secondLine = decal(phoneBase, 0.34, 0.14, 0, 0.36, 0,
      signFace("LINE 2 — LANDLORD CALLING", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd9d9", scale: 0.3 }), { px: 256, glow: true, ei: 1.0, transparent: true });
    secondLine.visible = false;
    const letRing = decal(g, 0.3, 0.16, 0.45, 0.78, -1.5,
      signFace("LET IT RING — CALL BACK", { bg: "#0c1a24", accent: "#59c97b", scale: 0.34 }), { px: 192, glow: true, ei: 0.8, transparent: true });
    letRing.rotation.x = -Math.PI / 2;
    holoTag(g, "Let it ring", 0.45, 0.92, -1.5, { css: "#59c97b", w: 0.3 });
    reg(hits, letRing, "let-it-ring");
    const intakeMount = group(g, 0.9, 0.8, -1.95, -0.4);
    const intakeGauge = instrument(intakeMount, 0, 0, 0, { idle: "INTAKE", color: WAH_ACCENT, w: 0.2, d: 0.24 });
    holoTag(intakeMount, "Keep the intake honest", 0, 0.2, 0, { css: WAH_CSS, w: 0.46 });
    reg(hits, intakeGauge, "intake-point");
    const stressMount = group(g, -0.6, 0.8, -1.5, 0.4);
    const stressDial = instrument(stressMount, 0, 0, 0, { idle: "1–10", color: WAH_ACCENT, w: 0.2, d: 0.24 });
    holoTag(stressMount, "Stress check", 0, 0.2, 0, { css: WAH_CSS, w: 0.32 });
    reg(hits, stressDial, "stress-dial");

    // ------------------------------------------------------ your week, on a board
    const week = holoPanel(g, 1.0, 0.62, -2.05, 1.7, -2.5, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,28,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = WAH_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("YOUR WEEK", w * 0.04, h * 0.13);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      cx.fillStyle = "#b9d8e6";
      ["Mon — bus late", "Tue — slept 2 h", "Wed — notice on door", "Thu — slept 3 h · court letter", "Fri — snapped at instructor"].forEach((l, i) => cx.fillText(l, w * 0.04, h * (0.3 + i * 0.15)));
    }, { ry: 0.6, accent: WAH_ACCENT });
    const WEEK = [
      ["sign-two-nights", "Two nights missed", 0.36, 0.08, WAH_ACCENT, WAH_CSS],
      ["sign-rent-notice", "Notice on the door", 0.36, -0.08, WAH_ACCENT, WAH_CSS],
      ["sign-snapped", "Snapped at the instructor", 0.36, -0.24, WAH_ACCENT, WAH_CSS],
      ["sign-late-bus", "Bus late", 0.36, 0.22, 0x8a929a, "#8a929a"],
      ["sign-tired-friday", "Tired on Friday", -0.36, -0.24, 0x8a929a, "#8a929a"],
    ];
    for (const [sid, label, x, y, color, css] of WEEK) {
      const bead = ball(week, 0.022, x, y, 0.02, color, { emissive: color, ei: 1.3, seg: 12 });
      holoTag(week, label, x, y - 0.07, 0.02, { css, w: 0.4 });
      reg(hits, bead, sid);
    }

    // The plate board: three problems onto three shelves.
    const plate = group(g, 1.75, 1.5, -2.95, -0.15);
    box(plate, 1.0, 0.8, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.7 });
    holoTag(plate, "What is on your plate", 0, 0.48, 0.04, { css: WAH_CSS, w: 0.46 });
    const PLATE = [
      ["plate-rent", "Rent — a deadline", 0.24],
      ["plate-sleep", "Sleep — a pattern", 0.0],
      ["plate-court", "Court date — a schedule", -0.24],
    ];
    for (const [pid, label, y] of PLATE) {
      box(plate, 0.9, 0.02, 0.06, 0, y - 0.06, 0.04, 0x8a929a, { rough: 0.5, metal: 0.4 });
      const bead = ball(plate, 0.024, -0.36, y, 0.05, WAH_ACCENT, { emissive: WAH_ACCENT, ei: 1.4, seg: 12 });
      holoTag(plate, label, 0.06, y, 0.05, { css: WAH_CSS, w: 0.5 });
      reg(hits, bead, pid);
    }

    // The calendar with today's slot and the one-week slot, and the two cards.
    const calendar = group(g, -2.6, 1.4, 0.9, Math.PI / 2);
    box(calendar, 0.9, 0.6, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.7 });
    holoTag(calendar, "Calendar", 0, 0.38, 0.04, { css: WAH_CSS, w: 0.26 });
    const calToday = decal(calendar, 0.26, 0.2, -0.25, -0.02, 0.03,
      signFace("TODAY 14:00", { bg: "#0c1a24", accent: "#59c97b", scale: 0.4 }), { px: 192 });
    holoTag(calendar, "Today", -0.25, -0.18, 0.04, { css: "#59c97b", w: 0.22 });
    reg(hits, calToday, "cal-today");
    const calWeek = decal(calendar, 0.26, 0.2, 0.25, -0.02, 0.03,
      signFace("+1 WEEK", { bg: "#0c1a24", accent: "#59c97b", scale: 0.4 }), { px: 192 });
    holoTag(calendar, "One week", 0.25, -0.18, 0.04, { css: "#59c97b", w: 0.28 });
    reg(hits, calWeek, "cal-week");
    const askCard = group(g, -1.9, 0.8, 0.4, 0.5);
    box(askCard, 0.16, 0.012, 0.11, 0, 0, 0, 0xe8edf1, { rough: 0.7 });
    cyl(askCard, 0.02, 0.02, 0.7, 0, -0.35, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 8 });
    holoTag(askCard, "Ask card — case manager", 0, 0.14, 0, { css: "#59c97b", w: 0.5 });
    reg(hits, askCard, "ask-card");
    const followCard = group(g, -1.3, 0.8, 1.1, 0.3);
    box(followCard, 0.16, 0.012, 0.11, 0, 0, 0, 0xe8edf1, { rough: 0.7 });
    cyl(followCard, 0.02, 0.02, 0.7, 0, -0.35, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 8 });
    holoTag(followCard, "Follow-up card", 0, 0.14, 0, { css: "#59c97b", w: 0.4 });
    reg(hits, followCard, "followup-card");

    // The instructor sequence on a stand by the door.
    const tell = group(g, 2.2, 0, 0.2, -0.9);
    cyl(tell, 0.022, 0.022, 1.7, 0, 0.85, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
    const TELL = [
      ["tell-need", "1 — what I need", 0.9],
      ["tell-plan", "2 — what I'm doing about the rest", 1.22],
      ["tell-when", "3 — by when", 1.54],
    ];
    for (const [tid, label, y] of TELL) {
      const bead = ball(tell, 0.024, 0, y, 0, WAH_ACCENT, { emissive: WAH_ACCENT, ei: 1.5, seg: 12 });
      holoTag(tell, label, 0.18, y, 0, { css: WAH_CSS, w: 0.62 });
      reg(hits, bead, tid);
    }

    // ------------------------------------------------------- markers and cards
    const marker = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const bead = ball(m, o.r ?? 0.026, 0, y, 0, o.color ?? WAH_ACCENT,
        { emissive: o.color ?? WAH_ACCENT, ei: o.ei ?? 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? WAH_CSS, w: o.w ?? 0.4 });
      reg(hits, bead, id);
      return bead;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate2 = decal(c, o.cw ?? 0.3, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0c1a24", accent: o.accent ?? WAH_CSS, scale: 0.4 }),
        { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? WAH_CSS, w: o.w ?? 0.46 });
      reg(hits, plate2, id);
      return plate2;
    };
    marker(1.2, 1.28, -1.1, "ask-for-the-room", "\"Can I have five minutes in here?\"", { w: 0.7, color: 0xf2c14b, css: "#f2c14b" });
    card(-0.9, 1.24, 0.8, "ghost-the-shift", "Just don't go in?", "DON'T GO IN — DON'T CALL", {
      w: 0.44, ry: 0.2, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    card(0.45, 1.22, 1.0, "wait-for-crisis", "Wait until it's a crisis?", "DEAL WITH IT WHEN IT'S REAL", {
      w: 0.54, ry: -0.1, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    const chatBoard = group(g, 2.6, 1.5, -1.9, -1.1);
    box(chatBoard, 0.7, 0.52, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.7 });
    const chatPost = decal(chatBoard, 0.4, 0.2, 0, -0.1, 0.03,
      signFace("COHORT CHAT — \"so my week…\"", { bg: "#2a1416", accent: "#f0645b", scale: 0.3 }), { px: 224 });
    holoTag(chatBoard, "Cohort group chat — post it all?", 0, 0.33, 0.04, { css: "#f0645b", w: 0.64 });
    reg(hits, chatPost, "crew-chat-post");

    // ------------------------------------------------------------- the boards
    const checkBoard = holoPanel(g, 0.5, 0.34, -2.55, 1.95, 1.9, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,28,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CHECK-IN", w / 2, h * 0.32);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillStyle = "#b9d8e6";
      ["You asked four times today", "Peer team · EAP · 988", "Answer it — never scored"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.54 + i * 0.15)));
    }, { ry: 0.7, accent: 0x7fc4d8 });
    reg(hits, checkBoard, "checkin-board");

    // ---------------------------------------------------------------- lockers
    const lockers = group(g, -2.85, 0, -1.9, 0.35);
    for (let i = 0; i < 2; i++) cabinet(lockers, 0.44, 1.7, 0.42, -0.23 + i * 0.46, 0.88, 0, 0x4f5860, { doorColor: 0x475059 });
    box(lockers, 0.96, 0.06, 0.46, 0, 0.03, 0, 0x3a4149, { rough: 0.7 });
    const leaflets = counter(g, 1.0, 0.4, 0.9, 2.5, 0x5b636b, { ry: 0.0, height: 0.86, undershelf: true });
    for (let i = 0; i < 3; i++) box(leaflets, 0.14, 0.2, 0.02, -0.3 + i * 0.3, 1.0, -0.1, [0x7fc4a0, 0xf2c14b, 0x9fb0e0][i], { rough: 0.7 });

    // The case manager at the desk, and the cohort-mate who comes in.
    const caseManager = seatedFigure(g, 0.3, 0.46, -2.3, { ry: 0, cloth: 0x3f6b7a, skin: 0x6b4a33 });
    holoTag(caseManager.torso, "Case manager", 0, 1.3, 0.12, { css: WAH_CSS, w: 0.36 });
    const mate = seatedFigure(g, 1.75, 0.46, -0.05, { ry: Math.PI, cloth: 0x2f3946, skin: 0xbc8f68 });
    mate.root.visible = false;
    const staff = standingFigure(g, -1.3, 0.1, { ry: 1.2, cloth: 0x3f6b7a, trousers: 0x2a3138 });
    holoTag(staff, "Wellness staff", 0, 1.95, 0, { css: WAH_CSS, w: 0.34 });

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.3, 1.2, -1.9),

      onStepComplete(step) {
        if (step.id === "sort-the-plate") {
          for (const [pid] of PLATE) hits[pid].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.4 });
        }
        if (step.id === "ask-on-today") {
          askCard.visible = false;
          repaint(calToday, signFace("CASE MGR 14:00", { bg: "#0c1a24", accent: "#59c97b", scale: 0.36 }));
        }
        if (step.id === "privacy-sign") {
          doorSign.rotation.y = Math.PI;
          repaint(signPlate, signFace("IN USE", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd9d9", scale: 0.45 }));
        }
        if (step.id === "make-the-call") handset.position.set(-0.07, 0.12, 0.04);
        if (step.id === "instructor-what") {
          for (const [tid] of TELL) hits[tid].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.4 });
        }
        if (step.id === "book-the-follow-up") {
          followCard.visible = false;
          repaint(calWeek, signFace("BOOKED", { bg: "#0c1a24", accent: "#59c97b", scale: 0.5 }));
        }
        if (step.id === "check-in") {
          repaint(checkBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(8,26,20,0.9)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafbf1";
            cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("ASKED — FOUR TIMES", w / 2, h * 0.36);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            cx.fillStyle = "#b7e6c8";
            cx.fillText("Now the check-in — never scored", w / 2, h * 0.66);
          });
        }
      },

      // Both interruptions change the room: a person at the next table, and a
      // second line lit red on the phone.
      onInterrupt(it) {
        if (it.id === "coworker-within-earshot") mate.root.visible = true;
        if (it.id === "landlord-on-the-other-line") {
          secondLine.visible = true;
          line2.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "coworker-within-earshot") mate.root.visible = false;
        if (it.id === "landlord-on-the-other-line") {
          secondLine.visible = false;
          line2.material = mat(0x3a4149, { rough: 0.5 });
        }
      },

      animate(t, dt, session) {
        caseManager.head.rotation.y = Math.sin(t * 0.4) * 0.1;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "stress-check") {
          const ok = gg.t >= 0.62 && gg.t <= 0.86;
          repaint(stressDial.userData.screen, signFace(`${Math.round(1 + gg.t * 9)} / 10`, {
            bg: "#0c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.55,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "honest-intake" && tr) {
          const ok = tr.v >= 0.36 && tr.v <= 0.68;
          repaint(intakeGauge.userData.screen, signFace(ok ? "HONEST" : tr.v < 0.36 ? "MINIMISING" : "SPIRALLING", {
            bg: "#0c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.44,
          }));
        }
      },
    };
  },
};
