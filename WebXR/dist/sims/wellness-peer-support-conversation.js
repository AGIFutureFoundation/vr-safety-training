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

// SmartCiti.X~ Wellness — Peer Support Conversation. The second walkable
// station of the Job Readiness Edition's Wellness Resource Center block.
//
// The side room of a training programme's wellness centre at the end of a
// class day. The learner is a trainee who has done the programme's peer-
// support training; the person in the other chair is a cohort-mate who has
// been late three times, short with everyone and eating alone, and who has
// just said "I don't know if I can keep doing this." The station scores what
// Psychological First Aid and SAMHSA's peer-support guidance actually ask of
// a peer: notice before you speak, make the room private, put your own phone
// away, open with what you saw, say the confidentiality rule with its real
// limits, follow their pace, ask the direct question when the words call for
// it, hold the silence, name three real doors, walk with them to one, book
// the follow-up, log that it happened and not what was said, and get your
// own check-in.
//
// Four things in the room are why the station exists: a card that waves the
// disclosure off, a card that promises total secrecy, a card that tells them
// what to do, and the crew group chat. Each is a thing peers reach for
// because it feels kind, and each ends the conversation.
// Sited generically. No real programme, person or service is named; the
// cohort-mate is a person here, never quoted for effect.

const WPS_ACCENT = 0x9fb0e0;
const WPS_CSS = "#9fb0e0";

export const SIM_WELLNESS_PEER_SUPPORT_CONVERSATION = {
  id: "wellness-peer-support-conversation",
  index: "229",
  domain: "Workforce readiness",
  trade: "Pre-apprentice trained as a programme peer supporter",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "overcast",
  certification: "Psychological First Aid as the NCTSN field guide and the Red Cross's psychological first aid course teach it — look, listen, link — applied by a peer rather than a clinician; SAMHSA's trauma-informed care principles and its guidance on peer support, including asking the direct question about suicide and the warm handoff to the 988 Suicide and Crisis Lifeline; the Sphere Handbook's minimum standard on mental health and psychosocial support, which this station's non-clinical scope is drawn from; HIPAA, for why the employee assistance programme's records stay with its clinician; NIOSH's work-organisation and stress guidance for the signs read at the start; the programme's own peer-support team and the EAP line its employer partners and the Teamsters and SEIU locals carry",
  name: "Wellness — Peer Support Conversation",
  title: simTitle("Wellness — Peer Support Conversation"),
  tagline: "A cohort-mate says he cannot keep doing this: the signs noticed first, the room made private, the rule said with its limits, their pace followed, the direct question asked when the words call for it, three real doors named, and the peer's own check-in after",
  accent: WPS_ACCENT,
  accentCss: WPS_CSS,
  parSeconds: 340,
  footprint: 2.4,
  supportLine: "the programme's peer-support team or the employee assistance programme (EAP) line your employer or union carries — and, in a crisis, the 988 Suicide and Crisis Lifeline",
  badge: { id: "asked-directly", name: "Asked Directly", note: "A peer conversation run as one — nothing waved off, nothing promised that could not be kept, the direct question asked, and a follow-up on the calendar" },

  game: system({
    name: "Wellness Resource Center",
    currency: "TRUST",
    ranks: ["Trainee", "Peer Trained", "Peer Supporter", "Cohort Lead", "Peer Team Coordinator"],
    badges: [
      { id: "noticed-first", name: "Noticed First", note: "Every sign found before a word was said", test: AWARD.stepClean("notice-the-signs") },
      { id: "nothing-waved-off", name: "Nothing Waved Off", note: "No unsafe action anywhere in the conversation", test: AWARD.safe },
      { id: "silence-held", name: "Silence Held", note: "Their pace and the pause both carried their full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "no-corrections", name: "No Corrections", note: "No corrections anywhere in the conversation", test: AWARD.clean },
      { id: "their-number", name: "Their Number", note: "The stress check committed where they put it, first time", test: AWARD.precise(0.7) },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "dismiss-disclosure": "You waved it off — \"you'll be fine, everybody's tired in week six.\" A disclosure is the hardest sentence a person will say all year, and a peer who answers it with reassurance has told them it was too much for the room. They will not say it again, to you or to anybody else in the cohort, and the next person who hears about it will be whoever finds them.",
    "secrecy-promise": "You swore that whatever he says stays sealed forever. It is the vow a peer most wants to give and the one SAMHSA's peer-support guidance warns hardest against, because a peer's confidentiality has edges — a danger to him, a danger to another person — and when one of those edges arrives you must either break your word or sit on something that harms him. The honest version, with its two exceptions and the promise to warn him first, costs nothing and is what he will remember.",
    "fix-it-advice": "You told them what to do — quit the drinking, see a doctor, talk to the instructor. A peer is not a clinician and not a case manager, and Psychological First Aid is built on the difference: listen, reflect, link. Advice given in the first ten minutes tells a person the conversation is about your plan for them, and people do not come back to conversations about somebody else's plan.",
    "broadcast-to-crew": "You put it in the cohort group chat so people would look out for them. Whatever the intention, a disclosure made to one person and read by twenty is a betrayal, and the person who made it finds out on their phone. Look-out is arranged with their consent and by name, or not at all.",
  },

  lateNotes: {
    "warm-handoff-card": "The handoff comes after the doors are named, not before — walking somebody to a phone they do not yet know the purpose of is moving them, not linking them.",
    "peer-log-board": "Nothing to log yet. The contact is logged when it is over — that it happened, when, and what was offered.",
  },

  steps: [
    {
      id: "notice-the-signs", kind: "find", noHint: true,
      targets: ["sign-late-three-times", "sign-short-fuse", "sign-eating-alone"],
      itemNames: {
        "sign-late-three-times": "late three times this week",
        "sign-short-fuse": "short with everyone",
        "sign-eating-alone": "eating alone at the far table",
      },
      itemNotes: {
        "sign-late-three-times": "Three late arrivals in a week from somebody who was never late. A change in pattern is the sign; the lateness itself is not.",
        "sign-short-fuse": "Snapped at the instructor and at a cohort-mate over nothing. Irritability is the stress reaction people notice in others and never in themselves.",
        "sign-eating-alone": "He has moved to the far table at lunch. Withdrawal from the group is the quietest sign and the one most often read as a preference.",
      },
      decoyNotes: {
        "sign-new-boots": "New boots are new boots. Reading meaning into everything is how peer support turns into surveillance.",
        "sign-quiet-in-class": "He was always quiet in class. Quiet is only a sign when it is a change.",
      },
      title: "Notice the signs before you say anything",
      cue: "Three things changed this week. Find them — and leave the things that did not.",
      why: "Peer support starts with observation because the person will not open with any of it, and because the opening line has to be about something you actually saw. A change in pattern — late from somebody never late, short from somebody easy-going, alone from somebody who sat with the group — is what NIOSH's work-stress guidance describes as the visible signature of a stress reaction, and naming a concrete change is the only opening that does not ask a person to admit anything first.",
    },
    {
      id: "in-use-sign", kind: "turn", target: "door-sign",
      title: "Turn the door sign to In Use",
      cue: "Turn the sign. This conversation does not happen with the door being tried every two minutes.",
      turn: { turns: 0.5, axis: "y", label: "DOOR SIGN" },
      why: "Nobody says a true thing in a room that might fill up. The sign is small and it is the first evidence your cohort-mate gets that this is being treated as his, not as a chat at the coffee machine — and it removes the crowd he would otherwise be playing to, because the account a trainee gives with classmates in earshot is the brave, brief, useless one. Turning it is thirty seconds of setup that decides whether the next thirty minutes happen at all.",
    },
    {
      id: "phone-away", kind: "drag", target: "my-phone",
      title: "Put your own phone in the drawer",
      cue: "Carry your phone to the drawer and leave it there. Face down on the table is not away.",
      drag: {
        to: "drawer-slot", radius: 0.5,
        missNote: "Still on the table. A phone in view is a phone that might buzz, and the person watching it decides what they say around that.",
      },
      why: "A phone on the table says the conversation has a competitor, and a person deciding whether to say something hard reads that before they read your face. Putting it in the drawer is a physical act they can see, and it is also the thing that keeps you from the group chat when the temptation to tell somebody comes — which it will, about twenty minutes from now. The listening starts when the phone is gone.",
    },
    {
      id: "open-with-what-you-saw", kind: "select", target: "open-card",
      title: "Open with what you saw",
      cue: "\"You've been late three times and you've been eating on your own. How are you doing — really?\"",
      why: "The opening has to be about something observable, said without judgement, followed by a question that cannot be answered with \"fine\". \"How are you\" gets \"fine\"; \"I noticed this, and I wanted to ask\" gets a pause and then an answer. It also puts the truth in the room without demanding they agree with it — they can correct you, and either way the conversation has started with you having paid attention.",
    },
    {
      id: "the-rule-with-limits", kind: "sequence",
      targets: ["rule-stays", "rule-limits", "rule-tell-first"],
      itemNames: {
        "rule-stays": "\"what you tell me stays with me\"",
        "rule-limits": "\"except if you're in danger, or somebody else is\"",
        "rule-tell-first": "\"and I'd tell you before I told anyone\"",
      },
      title: "Say the confidentiality rule, limits included",
      cue: "The rule, then the exceptions, then the promise about the exceptions — in that order.",
      why: "Confidentiality is only worth offering with its edges showing. Told where the boundary sits, a person can choose what to put inside it; sworn to total secrecy, he has been given a vow that will fail on the worst possible day. Sequence is the message — protection first, so he hears what he is getting; the two exceptions second, so he hears you being straight with him; and \"I'd warn you first\" last, because that clause is the cheapest thing you will say tonight and the one he will carry out of the room.",
      outOfOrderNote: "Protection, then the two exceptions, then the warning clause. Open with the exceptions and it sounds like a caution; open with the warning clause and it sounds like a trick.",
    },
    {
      id: "their-pace", kind: "track", target: "pace-point", seconds: 7,
      title: "Follow their pace",
      cue: "Keep it in the band — not filling every gap, not leaving them alone in one.",
      track: {
        start: 0.5, green: [0.36, 0.7], rise: 0.5, fall: 0.42, drift: 0.15, label: "PACE",
        readout: (v) => (v < 0.36 ? "pushing" : v > 0.7 ? "left them in it" : "with them"),
      },
      why: "Tempo is set by the person talking, and a peer's whole discipline is to notice when it has stopped being theirs. Hurry him and the replies shrink to single words; leave him too long and the quiet turns from breathing space into being left alone with it. Neither drift feels like a mistake from your chair, which is why the band is on a dial: the habit of small corrections, listening for his rhythm and matching it, is what carries a person to the sentence he came in unable to say.",
      holdBreakNote: "You lost his rhythm — hurried him, or left him too long in the quiet. Find his tempo again and match it.",
    },
    {
      id: "their-stress-check", kind: "gauge", target: "stress-dial",
      title: "Offer the stress check — and commit it where they put it",
      cue: "Hand them the dial. Commit the reading they give, not the one you would give for them.",
      gauge: {
        label: "THEIR NUMBER", speed: 0.6, green: [0.66, 0.9],
        readout: (t) => `${Math.round(1 + t * 9)} / 10`,
        missNote: "That is not where they put it. The check is theirs — a peer who rounds it down to make the room feel better has just told them their number was wrong.",
      },
      why: "The guide's stress check is a card any station can offer, and in a peer conversation it does something the words cannot: it gives a person a way to say \"eight\" who could not say \"I am not coping\". The peer's job is to take the number they give and not argue with it — rounding it down is reassurance in disguise, rounding it up is diagnosis, and either one takes the number away from the person it belongs to. SAMHSA's peer-support principles put it plainly: their experience, their words, their number.",
    },
    {
      id: "hold-the-silence", kind: "hold", target: "silence-point", seconds: 9,
      title: "Sit in the quiet after the worst of it",
      cue: "He has told you the part he was afraid to. Say nothing. Let the quiet be his.",
      why: "Every instinct after a confession is to shrink it — a kind word, an explanation, a joke, a subject change — and each one teaches the person that what they said was more than the listener could bear. Staying quiet teaches the reverse: that it fit in the room. It also leaves a gap, and the thing people say into that gap is usually the reason they started talking. Nine seconds feels like a minute from your chair; from his, it is the first time anybody has waited.",
      holdBreakNote: "You broke the quiet with something kind. Kindness was not what the gap was for — it was where his next sentence lived, and you have filled it.",
    },
    {
      id: "name-the-doors", kind: "sequence", anyOrder: true,
      targets: ["eap-card", "peer-roster-card", "case-manager-card"],
      itemNames: {
        "eap-card": "the employee assistance programme — by name and number, records with the clinician",
        "peer-roster-card": "the peer-support roster — who else in the programme has done this",
        "case-manager-card": "the programme's case manager — the schedule, the rent, the ride",
      },
      title: "Name three real doors",
      cue: "Three specific options, each with a name and a number. Not \"there's help if you need it\".",
      why: "Vague help is no help: \"there's stuff you can access\" gets a nod and no call. A door is a person's name, a phone number, and a one-line account of what happens when you use it — that the employee assistance clinician keeps his own file under HIPAA and the programme never reads it; that the peer roster is trainees who have sat where he is sitting; that the case manager is who moves a schedule, chases a rent problem and fixes a ride. Half of what a cohort-mate carries is logistics, and a peer who can point at the right desk for the logistics has lifted something real.",
    },
    {
      id: "warm-handoff", kind: "select", target: "warm-handoff-card",
      title: "Make the warm handoff",
      cue: "\"Do you want to call now? I'll sit here while you do.\" Walk them to the phone; do not send them.",
      why: "A referral said out loud is a suggestion; a referral where you stay in the room while the call is made is a handoff. Psychological First Aid calls it linking for a reason — the link has to be made while the person is still with you, because the version of them that leaves this room alone with a phone number does not call it. Offering to sit there while they dial is the difference between the two, and it asks their permission first.",
    },
    {
      id: "book-the-follow-up", kind: "drag", target: "followup-card",
      title: "Put the follow-up on the calendar",
      cue: "Set the follow-up at forty-eight hours, in writing, before either of you leaves.",
      drag: {
        to: "cal-48h", radius: 0.5,
        missNote: "Not on the calendar. A follow-up that lives as \"I'll check in\" gets remembered on the fourth day, which is after the one that matters.",
      },
      why: "A first disclosure becomes something that actually changes only in the second meeting, and the second meeting has to be fixed in ink because the days after a hard talk are precisely when both of you would prefer to act as if it never happened. Two days out is close enough that the opening is still there and far enough that a phone call has had time to be made and answered. On paper it outlives a roster change, a bad night and a Friday.",
    },
    {
      id: "log-the-contact", kind: "select", target: "peer-log-board",
      title: "Write down that it happened — never what was said",
      cue: "Date, time, doors offered, follow-up date. Nothing he told you goes on paper.",
      why: "A peer programme has to show its funders and its wellness staff that trainees are being reached, and it has to do that without a single sentence of anybody's story on file — the whole design lives in that gap. Date, time, which doors were offered, when the follow-up is: enough to count contacts and spot a cohort that is struggling, nothing a trainee would dread being read. Put his words on the sheet and the sheet becomes a rumour with a signature, and the programme ends the first time somebody opens the folder.",
    },
    {
      id: "supporter-check-in", kind: "select", target: "supporter-checkin-board",
      title: "Get your own check-in before you leave",
      cue: "You just carried somebody else's worst week. Book your own contact with the peer team, then answer the guide's check-in.",
      why: "Whatever he handed you in that chair, you are now holding, and the peer programmes that last are the ones whose rule for the listener is written down and kept: the person who ran the conversation gets one of their own. Saying it aloud while he is still in the room does something else too — a trainee who sees a peer book their own contact learns, faster than any poster could teach, that using the programme is not a confession. The guide's question on the results card is the same habit in small, and nothing about it is scored.",
    },
  ],

  interrupts: [
    {
      id: "instructor-at-the-door",
      kind: "Instructor at the door",
      after: "hold-the-silence", delay: 3, seconds: 12,
      alert: "The door opens a hand's width — the instructor: \"I need you both back on the floor in five, we're doing the forklift eval.\"",
      cue: "Ask for ten. The evaluation waits; this does not.",
      target: "ask-for-ten",
      why: "The instructor means no harm — the class is short-handed and the evaluation is on the timetable — but a cohort-mate who has just said the thing he was most afraid of will not pick it back up after twenty minutes on a forklift. Asking for ten, flatly and without a reason, is the peer's job and only the peer's: if your cohort-mate has to ask, he has to explain, in front of the instructor, what this is.",
      missNote: "Nobody spoke and the instructor waited, so the two of you got up. The sentence that was coming next never came, and the next place your cohort-mate hears his own worry said aloud will be the floor, from somebody else.",
      wrongNote: "Neither the quiet you were holding nor the door handle does it. What has to happen is the plain sentence to the instructor — ten minutes — and nothing else counts as having asked.",
    },
    {
      id: "the-hard-sentence",
      kind: "The sentence that changes the conversation",
      after: "their-pace", delay: 3, seconds: 14,
      alert: "\"Some days I think everybody'd be better off without me.\" He says it to the table, not to you.",
      cue: "Ask the direct question, in those words: \"Are you thinking about killing yourself?\"",
      target: "ask-directly",
      why: "A sentence like that is not a figure of speech and it is not a test; it is the door opening, and SAMHSA's guidance and every crisis line's training say the same thing about what to do next — ask directly, in plain words, without softening it. Asking does not plant the idea; it tells the person you heard them and that the word can be said in this room. A yes goes straight to the warm handoff and the 988 Suicide and Crisis Lifeline; a no, asked directly, is a no you can believe.",
      missNote: "The sentence went past. He said the most dangerous thing a person can say and the room treated it as a turn of phrase, so the next place he says it — if he does — will be somewhere he is not sitting across from anybody.",
      wrongNote: "Not the pace point, and not reassurance. The right response is the direct question, in the plain words on the card — anything softer tells him the word cannot be said here.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, WPS_ACCENT);

    // ------------------------------------------------------------------ floor
    const rugTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#6a6f7c", base2: "#616672", seam: "rgba(30,34,44,0.4)",
    }), { repeat: 4, px: 384 });
    const rug = box(g, 5.4, 0.018, 4.8, 0, 0.01, -0.5, 0x6a6f7c, { rough: 0.95, cast: false });
    rug.material = texturedMat(rugTex, { rough: 0.95, metal: 0.02, color: 0x6a6f7c });

    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#b6b0a6", base2: "#aaa49a", seam: "rgba(70,64,56,0.3)",
    }), { repeat: 3, px: 320 });
    const backWall = box(g, 6.4, 2.9, 0.12, 0, 1.45, -3.1, 0xb6b0a6, { rough: 0.9 });
    backWall.material = texturedMat(wallTex, { rough: 0.9, metal: 0.02, color: 0xb6b0a6 });
    box(g, 6.6, 0.1, 0.2, 0, 2.95, -3.1, 0x7f7972, { rough: 0.8 });
    const leftWall = box(g, 0.12, 2.9, 5.0, -3.1, 1.45, -0.6, 0xb6b0a6, { rough: 0.9 });
    leftWall.material = texturedMat(wallTex, { rough: 0.9, metal: 0.02, color: 0xb6b0a6 });

    // ------------------------------------------------------------ the doorway
    // On the right wall; the door sign is what turns, the leaf is what opens
    // when the instructor comes.
    const doorway = group(g, 2.95, 0, 1.4, -Math.PI / 2);
    box(doorway, 0.14, 2.3, 0.16, -0.62, 1.15, 0, 0x4e565f, { rough: 0.7 });
    box(doorway, 0.14, 2.3, 0.16, 0.62, 1.15, 0, 0x4e565f, { rough: 0.7 });
    box(doorway, 1.4, 0.14, 0.16, 0, 2.37, 0, 0x4e565f, { rough: 0.7 });
    const doorLeaf = box(doorway, 1.06, 2.14, 0.06, 0.0, 1.08, 0.08, 0x7a685a, { rough: 0.65 });
    cyl(doorway, 0.02, 0.02, 0.12, 0.42, 1.05, 0.14, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 10 }).rotation.x = Math.PI / 2;
    const signMount = group(doorway, -0.9, 1.5, 0.12);
    cyl(signMount, 0.015, 0.015, 0.06, 0, 0, 0, 0xb0b8c0, { rough: 0.3, metal: 0.8, seg: 8 }).rotation.x = Math.PI / 2;
    const doorSign = group(signMount, 0, 0, 0.04);
    const signPlate = decal(doorSign, 0.22, 0.1, 0, 0, 0,
      signFace("FREE", { bg: "#0c1a24", accent: "#59c97b", scale: 0.5 }), { px: 160, glow: true, ei: 0.7 });
    void signPlate;
    holoTag(signMount, "Door sign — turn to In Use", 0, 0.14, 0.04, { css: WPS_CSS, w: 0.56 });
    reg(hits, doorSign, "door-sign");

    // -------------------------------------------------------------- the table
    const tableTop = cyl(g, 0.58, 0.58, 0.05, 0.2, 0.72, -1.5, 0x6b5a48, { rough: 0.5, seg: 24 });
    cyl(g, 0.07, 0.09, 0.7, 0.2, 0.35, -1.5, 0x3a4149, { rough: 0.5, metal: 0.4, seg: 14 });
    cyl(g, 0.3, 0.3, 0.03, 0.2, 0.015, -1.5, 0x3a4149, { rough: 0.5, metal: 0.4, seg: 18 });
    void tableTop;
    cyl(g, 0.07, 0.08, 0.2, 0.55, 0.85, -1.62, 0xcfe0e8, { rough: 0.25, metal: 0.1, opacity: 0.7, transparent: true, seg: 14 });
    const cupA = cyl(g, 0.04, 0.035, 0.09, -0.08, 0.79, -1.22, 0xe6eaee, { rough: 0.5, seg: 14 });
    cyl(g, 0.04, 0.035, 0.09, 0.45, 0.79, -1.2, 0xe6eaee, { rough: 0.5, seg: 14 });
    box(g, 0.14, 0.08, 0.1, 0.5, 0.79, -1.9, 0xe8edf1, { rough: 0.8 });   // tissues
    const lampStem = cyl(g, 0.02, 0.03, 0.34, 0.45, 0.92, -1.9, 0x3a4149, { rough: 0.5, metal: 0.4, seg: 10 });
    void lampStem;
    ball(g, 0.075, 0.45, 1.13, -1.9, 0xffe6b0, { emissive: 0xffe6b0, ei: 0.9, rough: 0.5, seg: 12 });

    // Your own phone, and the drawer it goes in.
    const myPhone = group(g, -0.15, 0.755, -1.62, 0.4);
    const myPhoneBody = box(myPhone, 0.075, 0.012, 0.15, 0, 0, 0, 0x1b1e22, { rough: 0.35, metal: 0.4 });
    const myPhoneScreen = decal(myPhone, 0.065, 0.13, 0, 0.007, 0,
      signFace("3 NEW", { bg: "#0c1a24", accent: WPS_CSS, fg: "#cfeaf7", scale: 0.3 }), { px: 128, glow: true, ei: 0.6 });
    myPhoneScreen.rotation.x = -Math.PI / 2;
    holoTag(myPhone, "Your phone", 0, 0.16, 0, { css: WPS_CSS, w: 0.3 });
    reg(hits, myPhoneBody, "my-phone");
    const sideUnit = group(g, -1.55, 0, -2.75);
    box(sideUnit, 0.6, 0.72, 0.4, 0, 0.36, 0, 0x5b636b, { rough: 0.6, metal: 0.2 });
    const drawer = box(sideUnit, 0.5, 0.12, 0.36, 0, 0.6, 0.06, 0x4f5860, { rough: 0.55, metal: 0.2 });
    box(sideUnit, 0.12, 0.02, 0.02, 0, 0.6, 0.25, 0x8d959d, { rough: 0.3, metal: 0.9 });
    holoTag(sideUnit, "Drawer — phone goes here", 0, 0.9, 0.1, { css: WPS_CSS, w: 0.5 });
    reg(hits, drawer, "drawer-slot");

    // ------------------------------------------------------------- the chairs
    function roomChair(parent, x, z, ry, cloth) {
      const c = group(parent, x, 0, z, ry);
      box(c, 0.44, 0.06, 0.44, 0, 0.44, 0, cloth, { rough: 0.8 });
      box(c, 0.44, 0.5, 0.06, 0, 0.72, -0.19, cloth, { rough: 0.8 });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        cyl(c, 0.018, 0.018, 0.44, sx * 0.18, 0.22, sz * 0.18, 0x5b636b, { rough: 0.4, metal: 0.6, seg: 8 });
      }
      return c;
    }
    roomChair(g, -0.9, -2.2, 0.5, 0x4a535c);
    roomChair(g, -1.05, -1.25, 0.9, 0x4a535c);

    // ---------------------------------------------------------- the cohort-mate
    const mate = seatedFigure(g, -0.9, 0.46, -2.14, { ry: 0.55, cloth: 0x3b4a3f, skin: 0x8d5a3b });
    mate.head.rotation.x = 0.28;
    holoTag(mate.torso, "Your cohort-mate", 0, 1.3, 0.12, { css: WPS_CSS, w: 0.4 });
    const signLate = ball(mate.torso, 0.024, 0.22, 0.62, 0.22, WPS_ACCENT, { emissive: WPS_ACCENT, ei: 1.4, seg: 12 });
    holoTag(mate.torso, "Late three times", 0.22, 0.76, 0.22, { css: WPS_CSS, w: 0.4 });
    reg(hits, signLate, "sign-late-three-times");
    const signFuse = ball(mate.torso, 0.024, -0.02, 1.26, 0.1, WPS_ACCENT, { emissive: WPS_ACCENT, ei: 1.4, seg: 12 });
    holoTag(mate.torso, "Short with everyone", -0.02, 1.4, 0.1, { css: WPS_CSS, w: 0.44 });
    reg(hits, signFuse, "sign-short-fuse");
    const signAlone = ball(mate.torso, 0.024, -0.24, 0.84, 0.18, WPS_ACCENT, { emissive: WPS_ACCENT, ei: 1.4, seg: 12 });
    holoTag(mate.torso, "Eating alone", -0.28, 0.98, 0.18, { css: WPS_CSS, w: 0.34 });
    reg(hits, signAlone, "sign-eating-alone");
    const signBoots = ball(mate.torso, 0.02, 0.1, 0.06, 0.34, 0x8a929a, { emissive: 0x8a929a, ei: 0.9, seg: 12 });
    holoTag(mate.torso, "New boots", 0.1, 0.18, 0.34, { css: "#8a929a", w: 0.28 });
    reg(hits, signBoots, "sign-new-boots");
    const signQuiet = ball(mate.torso, 0.02, 0.3, 1.12, 0.0, 0x8a929a, { emissive: 0x8a929a, ei: 0.9, seg: 12 });
    holoTag(mate.torso, "Quiet in class — always was", 0.3, 1.24, 0.0, { css: "#8a929a", w: 0.52 });
    reg(hits, signQuiet, "sign-quiet-in-class");

    // -------------------------------------------------------- graded controls
    const paceMount = group(g, 0.85, 0.78, -1.75, -0.4);
    const paceGauge = instrument(paceMount, 0, 0, 0, { ry: 0, idle: "PACE", color: WPS_ACCENT, w: 0.2, d: 0.24 });
    holoTag(paceMount, "Their pace", 0, 0.2, 0, { css: WPS_CSS, w: 0.32 });
    reg(hits, paceGauge, "pace-point");
    const stressMount = group(g, -0.35, 0.78, -1.1, 0.5);
    const stressDial = instrument(stressMount, 0, 0, 0, { idle: "1–10", color: WPS_ACCENT, w: 0.2, d: 0.24 });
    holoTag(stressMount, "Their stress check", 0, 0.2, 0, { css: WPS_CSS, w: 0.42 });
    reg(hits, stressDial, "stress-dial");

    // ------------------------------------------------------- markers and cards
    const marker = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const bead = ball(m, o.r ?? 0.026, 0, y, 0, o.color ?? WPS_ACCENT,
        { emissive: o.color ?? WPS_ACCENT, ei: o.ei ?? 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? WPS_CSS, w: o.w ?? 0.4 });
      reg(hits, bead, id);
      return bead;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.3, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0c1a24", accent: o.accent ?? WPS_CSS, scale: 0.4 }),
        { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? WPS_CSS, w: o.w ?? 0.46 });
      reg(hits, plate, id);
      return plate;
    };

    marker(-0.3, 1.3, -0.75, "silence-point", "Let it land", { w: 0.36 });
    marker(1.35, 1.28, 0.9, "ask-for-ten", "\"Give us ten\"", { w: 0.4, color: 0xf2c14b, css: "#f2c14b" });
    card(-1.6, 1.25, -2.55, "open-card", "Open with what you saw", "I NOTICED — HOW ARE YOU, REALLY?", { w: 0.56, ry: 0.5 });
    const askCard = card(0.75, 1.3, -2.55, "ask-directly", "Ask the direct question", "ARE YOU THINKING ABOUT KILLING YOURSELF?", {
      w: 0.56, ry: -0.2, cw: 0.34, ch: 0.22, bg: "#0c1a24", accent: "#f2c14b", css: "#f2c14b",
    });

    // The rule, on a small stand beside the table.
    const rule = group(g, 1.2, 0, -2.05, -0.6);
    cyl(rule, 0.022, 0.022, 1.7, 0, 0.85, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
    const RULE = [
      ["rule-stays", "1 — stays with me", 0.9],
      ["rule-limits", "2 — except danger to you or others", 1.22],
      ["rule-tell-first", "3 — I'd tell you first", 1.54],
    ];
    for (const [rid, label, y] of RULE) {
      const bead = ball(rule, 0.024, 0, y, 0, WPS_ACCENT, { emissive: WPS_ACCENT, ei: 1.5, seg: 12 });
      holoTag(rule, label, 0.18, y, 0, { css: WPS_CSS, w: 0.62 });
      reg(hits, bead, rid);
    }

    // ------------------------------------------------------ the doors board
    const doors = group(g, 1.95, 1.45, -2.95, -0.18);
    box(doors, 1.3, 0.9, 0.05, 0, 0, 0, 0x8a7862, { rough: 0.85 });
    const DOORS = [
      ["eap-card", "EAP — 24 h, records stay with the clinician", -0.42, 0.22, WPS_CSS],
      ["peer-roster-card", "Peer roster — who has done this", 0.42, 0.22, WPS_CSS],
      ["case-manager-card", "Case manager — schedule, rent, ride", 0.0, -0.24, "#7fc4d8"],
    ];
    for (const [did, label, x, y, css] of DOORS) {
      const sheet = decal(doors, 0.38, 0.28, x, y, 0.03,
        paperFace(label.split(" — ")[0], [label.split(" — ")[1] ?? ""], { scale: 0.5 }), { px: 256 });
      holoTag(doors, label, x, y - 0.2, 0.04, { css, w: 0.62 });
      reg(hits, sheet, did);
    }
    holoTag(doors, "Three doors — named and numbered", 0, 0.55, 0.04, { css: WPS_CSS, w: 0.66 });

    // The 988 card and the warm-handoff phone, lit when the hard sentence comes.
    const lifeline = group(g, 2.85, 1.5, -1.6, -Math.PI / 2);
    const lifelineCard = decal(lifeline, 0.34, 0.22, 0, 0, 0,
      signFace("988 — SUICIDE & CRISIS LIFELINE", { bg: "#0c1a24", accent: "#8a929a", fg: "#9fb0c0", scale: 0.3 }), { px: 256, glow: true, ei: 0.5, transparent: true });
    holoTag(lifeline, "988 — call or text", 0, 0.18, 0.002, { css: WPS_CSS, w: 0.4 });
    const handoffPhone = group(lifeline, 0, -0.32, 0.06);
    box(handoffPhone, 0.16, 0.06, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    box(handoffPhone, 0.05, 0.03, 0.14, -0.04, 0.045, 0, 0x1b1e22, { rough: 0.5 });
    const handoffCard = decal(lifeline, 0.3, 0.16, 0, -0.55, 0,
      signFace("\"I'LL SIT HERE WHILE YOU CALL\"", { bg: "#0c1a24", accent: "#59c97b", scale: 0.3 }), { px: 224, glow: true, ei: 0.8, transparent: true });
    holoTag(lifeline, "Warm handoff", 0, -0.7, 0.002, { css: "#59c97b", w: 0.32 });
    reg(hits, handoffCard, "warm-handoff-card");
    const handoffTag = holoTag(lifeline, "Warm handoff open", 0, -0.18, 0.002, { css: "#f2c14b", w: 0.44 });
    handoffTag.visible = false;

    // ------------------------------------------------------------- the traps
    card(-0.85, 1.24, 0.75, "dismiss-disclosure", "Wave it off?", "YOU'LL BE FINE — WEEK SIX", {
      w: 0.4, ry: 0.2, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    card(0.4, 1.22, 0.95, "secrecy-promise", "Promise nothing ever leaves?", "NOBODY WILL EVER KNOW", {
      w: 0.6, ry: -0.1, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    card(-2.0, 1.26, -0.15, "fix-it-advice", "Tell them what to do?", "HERE'S WHAT YOU DO", {
      w: 0.5, ry: 0.9, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    const chatBoard = group(g, 2.6, 1.5, 0.35, -0.85);
    box(chatBoard, 0.7, 0.52, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.7 });
    const chatPost = decal(chatBoard, 0.4, 0.2, 0, -0.1, 0.03,
      signFace("COHORT CHAT — \"keep an eye on him\"", { bg: "#2a1416", accent: "#f0645b", scale: 0.3 }), { px: 224 });
    holoTag(chatBoard, "Cohort group chat — post it?", 0, 0.33, 0.04, { css: "#f0645b", w: 0.62 });
    reg(hits, chatPost, "broadcast-to-crew");

    // ------------------------------------------------- calendar and follow-up
    const calendar = group(g, -2.4, 1.35, -1.6, 0.8);
    box(calendar, 0.62, 0.46, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.7 });
    const cal48 = decal(calendar, 0.2, 0.16, 0.16, -0.06, 0.03,
      signFace("+48 h", { bg: "#0c1a24", accent: "#59c97b", scale: 0.5 }), { px: 160 });
    holoTag(calendar, "Follow-up — 48 hours", 0, 0.3, 0.04, { css: "#59c97b", w: 0.54 });
    reg(hits, cal48, "cal-48h");
    const followCard = group(g, -1.75, 0.8, -0.3, 0.4);
    box(followCard, 0.16, 0.012, 0.11, 0, 0, 0, 0xe8edf1, { rough: 0.7 });
    cyl(followCard, 0.02, 0.02, 0.7, 0, -0.35, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 8 });
    holoTag(followCard, "Follow-up card", 0, 0.14, 0, { css: "#59c97b", w: 0.4 });
    reg(hits, followCard, "followup-card");

    // ------------------------------------------------------------- the boards
    const logBoard = holoPanel(g, 0.52, 0.36, -2.55, 1.95, 0.9, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,28,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = WPS_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("PEER CONTACT LOG", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      cx.fillStyle = "#b9d8e6";
      ["Contact · time · doors named", "Follow-up booked", "No content — none, ever"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.52 + i * 0.15)));
    }, { ry: 0.7, accent: WPS_ACCENT });
    reg(hits, logBoard, "peer-log-board");

    const checkBoard = holoPanel(g, 0.5, 0.34, 2.35, 1.95, 1.35, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,28,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("YOUR OWN CHECK-IN", w / 2, h * 0.32);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillStyle = "#b9d8e6";
      ["Whoever runs the conversation gets one", "Peer team · EAP · 988", "Book it before you go home"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.54 + i * 0.15)));
    }, { ry: -0.75, accent: 0x7fc4d8 });
    reg(hits, checkBoard, "supporter-checkin-board");

    // ---------------------------------------------------------------- lockers
    const lockers = group(g, -2.85, 0, -2.2, 0.35);
    for (let i = 0; i < 3; i++) {
      cabinet(lockers, 0.44, 1.7, 0.42, -0.46 + i * 0.46, 0.88, 0, 0x4f5860, { doorColor: 0x475059 });
    }
    box(lockers, 1.42, 0.06, 0.46, 0, 0.03, 0, 0x3a4149, { rough: 0.7 });
    const shelfUnit = counter(g, 1.1, 0.4, 0.6, 2.5, 0x5b636b, { ry: 0.0, height: 0.86, undershelf: true });
    void shelfUnit;

    // The instructor, waiting out in the corridor until the door opens.
    const instructor = standingFigure(g, 4.5, 1.4, { ry: -Math.PI / 2, cloth: 0x3f6b7a, trousers: 0x2a3138, vest: 0xf2c14b });
    instructor.visible = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.6, 1.15, -2.0),

      onStepComplete(step) {
        if (step.id === "in-use-sign") {
          doorSign.rotation.y = Math.PI;
          repaint(signPlate, signFace("IN USE", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd9d9", scale: 0.45 }));
        }
        if (step.id === "phone-away") {
          myPhone.position.set(-1.55, 0.67, -2.69);
          myPhone.rotation.y = 0;
          myPhone.visible = false;
        }
        if (step.id === "the-rule-with-limits") {
          for (const [rid] of RULE) hits[rid].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.4 });
        }
        if (step.id === "book-the-follow-up") {
          followCard.visible = false;
          repaint(cal48, signFace("BOOKED", { bg: "#0c1a24", accent: "#59c97b", scale: 0.5 }));
        }
        if (step.id === "log-the-contact") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(8,26,20,0.9)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafbf1";
            cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("CONTACT LOGGED", w / 2, h * 0.36);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            cx.fillStyle = "#b7e6c8";
            cx.fillText("Doors named · follow-up at 48 h", w / 2, h * 0.66);
          });
        }
      },

      // Both interruptions change the room: a door open with an instructor in
      // it, and a lifeline card that lights with a phone under it.
      onInterrupt(it) {
        if (it.id === "instructor-at-the-door") {
          instructor.visible = true;
          instructor.position.set(3.2, 0, 1.4);
          doorLeaf.position.set(0.95, 1.08, 0.42);
          doorLeaf.rotation.y = -1.1;
        }
        if (it.id === "the-hard-sentence") {
          repaint(lifelineCard, signFace("988 — SUICIDE & CRISIS LIFELINE", { bg: "#0c1a24", accent: "#f2c14b", fg: "#ffe9b0", scale: 0.3 }));
          handoffPhone.position.set(0, -0.32, 0.26);
          askCard.material.emissiveIntensity = 1.6;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "instructor-at-the-door") {
          instructor.visible = false;
          instructor.position.set(4.5, 0, 1.4);
          doorLeaf.position.set(0, 1.08, 0.08);
          doorLeaf.rotation.y = 0;
        }
        if (it.id === "the-hard-sentence") {
          handoffTag.visible = true;
          askCard.material.emissiveIntensity = 0.8;
          repaint(askCard, signFace("ASKED — HEARD", { bg: "#0c1a24", accent: "#59c97b", scale: 0.4 }));
        }
      },

      animate(t, dt, session) {
        mate.head.rotation.y = 0.15 + Math.sin(t * 0.3) * 0.1;
        cupA.position.y = 0.79 + Math.sin(t * 6.5) * 0.002;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "their-stress-check") {
          const ok = gg.t >= 0.66 && gg.t <= 0.9;
          repaint(stressDial.userData.screen, signFace(`${Math.round(1 + gg.t * 9)} / 10`, {
            bg: "#0c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.55,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "their-pace" && tr) {
          const ok = tr.v >= 0.36 && tr.v <= 0.7;
          repaint(paceGauge.userData.screen, signFace(ok ? "WITH THEM" : tr.v < 0.36 ? "PUSHING" : "TOO QUIET", {
            bg: "#0c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.48,
          }));
        }
      },
    };
  },
};
