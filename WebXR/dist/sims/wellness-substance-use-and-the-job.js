import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat,
  counter, cabinet, seatedFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Wellness — Substance Use and the Job. The third walkable
// station of the Job Readiness Edition's Wellness Resource Center block.
//
// The break room beside the training warehouse's dock at four in the
// morning. The learner is the trainee crew lead for the shift. A crew-mate
// has taken a stimulant to make the shift — a pill from somebody's bottle,
// not a coffee — and is jaw-clenched, fast-talking and about to take the
// forklift key off the hook. The station scores the sequence SAMHSA's
// workplace guidance and every reasonable-suspicion programme actually
// train: read the signs, take the key, lock the cabinet, hydrate him, say
// what you saw and what happens next, keep the conversation level, check
// your own stress before the supervisor arrives, stay with him, know whose
// decision the test is, name the doors he can take without losing the job,
// know that reporting is protected, hand the note to the supervisor, and
// take the check-in.
//
// Four things in the room are why the station exists: the bottle he offers
// you, the forklift key, the crew group chat, and his locker. A supervisor's
// reasonable-suspicion determination and the federal testing programme for
// commercial drivers are the employer's process, not the peer's; this
// station stops exactly where they start.
// Sited generically. No real programme, employer or person is named.

const WSU_ACCENT = 0xd8a447;
const WSU_CSS = "#d8a447";

export const SIM_WELLNESS_SUBSTANCE_USE_AND_THE_JOB = {
  id: "wellness-substance-use-and-the-job",
  index: "230",
  domain: "Workforce readiness",
  trade: "Warehouse pre-apprentice — trainee crew lead, Teamsters-bound",
  category: "Community Environmental Justice",
  indoor: "garage",
  weather: "clear",
  certification: "SAMHSA's guidance on substance use in the workplace and its national helpline, and its trauma-informed care principles for how the conversation is had; OSHA's anti-retaliation rule in 29 CFR 1904, which protects a worker who reports an injury or a hazard from a drug test used as punishment for reporting; the federal drug and alcohol testing programme for commercial drivers that FMCSA administers, taught in the Class A block and named here as the employer's process; the Americans with Disabilities Act, which protects a person in recovery and does not protect current illegal use; the federal confidentiality rule for substance use disorder treatment records, and HIPAA for the employee assistance programme's own file; NIOSH's guidance on shift work and stimulant use; the Teamsters' training programmes and the contract language that puts a steward beside a member in a reasonable-suspicion meeting",
  name: "Wellness — Substance Use and the Job",
  title: simTitle("Wellness — Substance Use and the Job"),
  tagline: "Four in the morning on the dock: the signs read, the forklift key taken before the conversation, what you saw said plainly, the conversation kept level, whose decision the test is, the doors he can take without losing the job, and the pill you did not take",
  accent: WSU_ACCENT,
  accentCss: WSU_CSS,
  parSeconds: 335,
  footprint: 2.5,
  supportLine: "the programme's peer-support team or the employee assistance programme (EAP) line your employer or union carries, and SAMHSA's national helpline for treatment referral",
  badge: { id: "key-first", name: "Key First", note: "The forklift key taken before a word was said, the conversation kept level, and nothing taken to make the shift" },

  game: system({
    name: "Wellness Resource Center",
    currency: "SHIFT",
    ranks: ["Trainee", "Crew Lead", "Reasonable-Suspicion Aware", "Shift Steward", "Job Ready"],
    badges: [
      { id: "read-him-right", name: "Read Him Right", note: "Every sign found before the key was taken", test: AWARD.stepClean("read-the-signs") },
      { id: "clean-hands", name: "Clean Hands", note: "No unsafe action anywhere in the run — the bottle, the key and the chat left alone", test: AWARD.safe },
      { id: "stayed-with-him", name: "Stayed With Him", note: "The wait and the conversation both carried their full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "no-corrections", name: "No Corrections", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "own-number", name: "Own Number", note: "Your own stress check committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "six-straight", name: "Six Straight", note: "Six correct actions in a row", test: AWARD.streak(6) },
    ],
  }),

  hazards: {
    "pill-to-make-shift": "You took the pill he offered — \"you look worse than I do.\" A stimulant taken to make a shift is the most common way a sleep problem on a rotating roster becomes a substance problem, and on a dock it is a forklift operator whose reaction time is wrong in a direction he cannot feel. SAMHSA's workplace guidance and NIOSH's shift-work guidance say the same thing from two directions: the fix for a missed sleep window is sleep, and the thing that makes a shift possible tonight makes the next one impossible.",
    "cover-the-impairment": "You handed him the forklift key — \"just take it easy.\" Covering for a crew-mate who is impaired feels like loyalty and is the opposite: it puts him on a five-thousand-pound machine among people on foot, and if anything happens the record will show a crew lead who saw the signs and gave him the key anyway. The loyal act is the key in your pocket and the conversation that follows.",
    "call-out-on-the-floor": "You said it in front of the crew — \"what are you on?\" A reasonable-suspicion conversation held on the dock in front of six people is an accusation, not a conversation, and it decides the outcome before the supervisor is involved: he denies it in front of everyone, the crew takes sides, and the door to treatment closes in the time it took to say it. It happens in the break room, with the door shut, and it starts with what you saw.",
    "search-the-locker": "You opened his locker to find the bottle. Whatever is in there, a peer searching a crew-mate's locker is a peer who has appointed himself investigator, and the employer's process — the trained supervisor's determination, the testing programme, the contract's rule about a steward being present — exists precisely so that no individual does that. You would also have destroyed the one thing the process depends on: that he trusts the person who sat with him.",
  },

  lateNotes: {
    "process-card": "The process card comes after the conversation is level and the supervisor has been called — reading it to him first turns a peer into an investigator.",
    "incident-note": "The note goes to the supervisor after the doors are named. A handoff without the doors is a referral to discipline alone.",
  },

  steps: [
    {
      id: "read-the-signs", kind: "find", noHint: true,
      targets: ["sign-jaw-clench", "sign-fast-talk", "sign-pupils"],
      itemNames: {
        "sign-jaw-clench": "the jaw working",
        "sign-fast-talk": "talking fast, three subjects at once",
        "sign-pupils": "pupils wide under the break-room lights",
      },
      itemNotes: {
        "sign-jaw-clench": "The jaw is working and the hands will not stay still. A stimulant shows in the muscles before it shows anywhere else.",
        "sign-fast-talk": "Three topics in one breath, none finished. Pressured speech is the sign crew-mates notice and put down to a good mood.",
        "sign-pupils": "Pupils wide under bright fluorescent light. That is not tiredness; tiredness goes the other way.",
      },
      decoyNotes: {
        "sign-coffee-cup": "The coffee is the coffee. Everyone on this shift has one, and it is not the finding.",
        "sign-tired-eyes": "Tired eyes at four in the morning are four in the morning. The signs that matter are the ones that point the other way.",
      },
      title: "Read him before you say anything",
      cue: "Three things on him do not fit four in the morning. Find them; leave the things that do.",
      why: "A reasonable-suspicion conversation has to start from specific, observable signs, both because the supervisor's determination will be made on them and because \"you seem off\" is an accusation while \"your jaw's going and you've been on three subjects at once\" is an observation. The signs of a stimulant point the opposite way to the signs of a night shift — wide pupils, fast speech, a jaw that will not stop — and reading them right is what separates a crew lead who is concerned from one who is guessing.",
    },
    {
      id: "take-the-key", kind: "select", target: "key-hook-pull",
      title: "Take the forklift key off the hook",
      cue: "The key comes off the hook and into your pocket before the conversation starts. Not the one beside it.",
      why: "The machine is the emergency; the conversation is not. A forklift is five thousand pounds moving among people on foot, and OSHA's powered industrial truck rules already say an operator has to be capable of running it safely — a crew lead who has read the signs and leaves the key on the hook has decided the conversation matters more than the dock. Taking the key first also changes the conversation: it is no longer about whether he is fine, it is about the fact that he is not driving this shift, and that is settled.",
    },
    {
      id: "lock-the-cabinet", kind: "turn", target: "cabinet-lock",
      title: "Lock the key cabinet",
      cue: "Turn the cam lock a full turn. The spare key is in there too.",
      turn: { turns: 1, axis: "y", label: "KEY CABINET" },
      why: "A key in your pocket and a spare on a hook is a key on a hook. Locking the cabinet closes the second route to the machine, and it does it without a word being said to him about it — which matters, because the conversation about to happen should not be about who is guarding what. It is the same discipline as isolating a machine before working on it: the energy source is controlled first, and then the work begins.",
    },
    {
      id: "water-for-him", kind: "drag", target: "water-bottle",
      title: "Put water in front of him",
      cue: "Carry the water bottle to his place at the table. Not the coffee, not the energy drink.",
      drag: {
        to: "his-place", radius: 0.5,
        missNote: "Not in front of him. Water beside the coffee machine is water for the room; water in front of a person is an offer.",
      },
      why: "A stimulant dehydrates and a crash is coming, and water in front of him is the first thing in this room that is for him rather than about him. It is also the physical version of the register the whole conversation needs — you are not his supervisor and not his investigator; you are the person who noticed and sat down. Psychological First Aid puts practical needs first for the same reason: a person who has been handed something cannot be being handed a charge.",
    },
    {
      id: "say-it", kind: "sequence",
      targets: ["say-what-you-saw", "say-not-driving", "say-supervisor-with-you"],
      itemNames: {
        "say-what-you-saw": "what you saw — the jaw, the speech, the eyes",
        "say-not-driving": "that he is not on the truck this shift",
        "say-supervisor-with-you": "that the supervisor is being called, and you will stay with him",
      },
      title: "Say it plainly, in order",
      cue: "What you saw, then that he is off the truck, then that the supervisor is coming and you are staying.",
      why: "The order is the message. Leading with what you saw gives him something concrete and undeniable that is not an accusation about what he took; the truck decision second tells him it is already made and not up for argument; the supervisor and your staying last tells him what happens next and that he will not face it alone. Reverse it and it is a threat, a verdict and an afterthought.",
      outOfOrderNote: "What you saw, then the truck, then the supervisor and you. Opening with the supervisor is a threat; opening with the truck is a verdict without a reason.",
    },
    {
      id: "keep-it-level", kind: "track", target: "level-point", seconds: 7,
      title: "Keep the conversation level",
      cue: "Not accusing, not excusing. Hold it in the band while he pushes back.",
      track: {
        start: 0.5, green: [0.36, 0.68], rise: 0.5, fall: 0.42, drift: 0.15, label: "LEVEL",
        readout: (v) => (v < 0.36 ? "accusing" : v > 0.68 ? "excusing" : "level"),
      },
      why: "He will push back — \"I'm fine, I've done this shift a hundred times\" — and the two easy responses are to argue and to fold. Arguing makes it an interrogation and he denies everything; folding makes it nothing and he drives. Level means repeating what you saw, repeating the decision about the truck, and not defending either, because neither needs a defence. SAMHSA's trauma-informed principles call it collaboration without collusion: the door to help is open, the door to the forklift is shut, and your tone is the same for both.",
      holdBreakNote: "The conversation tipped — into an argument or into letting it go. Come back to what you saw and what has been decided, in the same voice.",
    },
    {
      id: "own-stress-check", kind: "gauge", target: "stress-dial",
      title: "Check your own stress before the supervisor arrives",
      cue: "The dial is yours this time. Commit it where you actually are.",
      gauge: {
        label: "YOUR NUMBER", speed: 0.6, green: [0.55, 0.8],
        readout: (t) => `${Math.round(1 + t * 9)} / 10`,
        missNote: "That is not where you are. Four in the morning, a crew-mate impaired and a supervisor on the way is not a three, and a crew lead who says it is will handle the next ten minutes as if it were.",
      },
      why: "The guide's stress check is here for the crew lead, not the crew-mate, because the person about to brief a supervisor at four in the morning about a friend is under real load and will make the handoff worse if he pretends otherwise. Naming your own number — a six or a seven, honestly — is what lets you say what you saw in the same flat voice you used a minute ago, and it is the practice the peer-support station asks you to offer other people. It is scored only for honesty against the room.",
    },
    {
      id: "stay-with-him", kind: "hold", target: "stay-point", seconds: 8,
      title: "Stay with him until the supervisor arrives",
      cue: "Sit. Do not leave him alone with the door, the dock or his phone.",
      why: "The minutes between the call and the supervisor's arrival are when a crew-mate walks — to the dock, to the lot, to his car — and every one of those is worse than the meeting he is avoiding. Staying is not guarding; it is the promise from the third thing you said, kept. It is also the window in which he is most likely to say something true about what he took and why, and a crew lead who is in the room hears it.",
      holdBreakNote: "You got up. He was alone with the door and the dock for the minutes that matter most — sit back down and stay until the supervisor is in the room.",
    },
    {
      id: "whose-decision", kind: "select", target: "process-card",
      title: "Know whose decision the test is",
      cue: "Read the process card: the trained supervisor determines reasonable suspicion, the employer's programme tests, the steward sits in. Your part ended at the handoff.",
      why: "A peer who says \"they'll test you\" has made a promise about a process he does not own, and a peer who says \"I won't let them\" has made a worse one. Reasonable suspicion is a determination a trained supervisor makes on documented observations; testing is the employer's programme — the federal one FMCSA administers for anyone who holds a commercial licence — and the contract puts a steward in the room. Knowing that is what lets you tell him the truth: you saw what you saw, you called who you had to call, and the rest is a process with rules he has rights inside.",
    },
    {
      id: "name-the-doors", kind: "sequence", anyOrder: true,
      targets: ["eap-card", "helpline-card", "treatment-card"],
      itemNames: {
        "eap-card": "the employee assistance programme — confidential, records with the clinician",
        "helpline-card": "SAMHSA's national helpline — treatment referral, any hour",
        "treatment-card": "treatment, with the job protected — the confidentiality rule for treatment records and the Americans with Disabilities Act for a person in recovery",
      },
      title: "Name the doors he can take without losing the job",
      cue: "Three real doors, with what each one protects. Not \"get help\".",
      why: "The thing a crew-mate believes at four in the morning is that admitting anything ends the job, and the doors on this board are the reasons that is not the whole truth. The employee assistance programme keeps its own file under HIPAA; the confidentiality rule for treatment records keeps a treatment programme's records out of an employer's hands without his consent; the Americans with Disabilities Act protects a person in recovery, though not current use. SAMHSA's helpline is on the board because it answers at four in the morning. A peer who can name those, specifically, has given him a reason to walk into the meeting instead of out of the building.",
    },
    {
      id: "reporting-protected", kind: "select", target: "report-card",
      title: "Know that reporting is protected",
      cue: "Read the report card: a crew lead who reports a hazard cannot be drug-tested for reporting it.",
      why: "The other fear in this room is yours — that a crew lead who raises this becomes the next one tested, or the one written up for making trouble. OSHA's anti-retaliation rule in 29 CFR 1904 says an employer may not use a drug test, or anything else, to punish a worker for reporting an injury or a hazard, and a crew-mate impaired on a forklift is a hazard by any reading. Knowing the rule is what lets you make the call without bargaining with yourself about it, and it is what you tell the next crew lead who is deciding whether to.",
    },
    {
      id: "hand-the-note", kind: "drag", target: "incident-note",
      title: "Hand the note to the supervisor",
      cue: "Carry the note to the supervisor's tray — what you saw, when, and that the key was taken. Nothing about what he took.",
      drag: {
        to: "super-tray", radius: 0.5,
        missNote: "Not in the tray. The note is the supervisor's starting point and it goes to the supervisor, not to the table and not to the chat.",
      },
      why: "The supervisor's determination is made on documented observations, and the note is where those come from: time, the three signs, the key taken, the water given, the call made. What is not in it is what you think he took, because you do not know and the process does not need you to. A note in the tray is also the end of your part — the reasonable-suspicion process starts where the peer's stops, and the paper is where the line is.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Take the check-in",
      cue: "The supervisor has him. Answer the guide's question about yourself — it is never scored.",
      why: "The crew lead who did this right has just reported a friend at four in the morning, and the department that runs a reasonable-suspicion process without a check-in for the person who raised it is teaching its crew leads not to raise the next one. The guide asks how you are; the answer stays in your own browser; and the peer-support team and the EAP line are on the card for the run where the honest answer is \"need a minute\". Take it before the next truck backs in.",
    },
  ],

  interrupts: [
    {
      id: "chat-photo",
      kind: "Crew group chat — photo posted",
      after: "stay-with-him", delay: 3, seconds: 12,
      alert: "Your phone buzzes on the table: somebody on the crew has posted a photo of him in the chat with a laughing emoji.",
      cue: "Reply once — take it down — and put the phone away. Nothing else goes in that thread.",
      target: "phone-takedown",
      why: "A photo in the crew chat turns a reasonable-suspicion process into a public event before the supervisor is even in the room, and it is the kind of thing an employer's own policy and the contract both have something to say about. One reply, asking for it down, from the crew lead who is sitting with him, is what stops it; a thread about it is worse than the photo. Whatever he is going through now becomes the thing the crew remembers about him, unless somebody says stop.",
      missNote: "The photo stayed up and the thread grew. By the time the supervisor arrived, six people had an opinion about a process none of them was part of, and he found out on his own phone while you sat beside him.",
      wrongNote: "Not the stay point, and not the phone's screen. The thing that has to happen is the one reply that says take it down — anything else is joining the thread.",
    },
    {
      id: "he-heads-for-the-dock",
      kind: "He gets up for the dock",
      after: "keep-it-level", delay: 3, seconds: 13,
      alert: "He stands — \"I'm fine, I've got a trailer to unload\" — and heads for the dock door.",
      cue: "Radio the supervisor now. Do not block the door, do not argue.",
      target: "radio-supervisor",
      why: "A crew-mate walking toward the dock is the moment the conversation stops being enough. Standing in the door starts a confrontation you will lose; arguing restarts the thing you have just kept level; the radio to the supervisor is what actually changes the dock, because the supervisor can stop a forklift being run and you cannot. The key in your pocket is why he cannot drive; the radio is why he does not get to try.",
      missNote: "He walked out onto the dock and stood at a forklift with no key while the crew watched. Nothing was called, nobody came, and the conversation you had kept level for ten minutes ended as a scene on the floor.",
      wrongNote: "Not the level point, and not the door. The right response is the radio to the supervisor — the person who can actually stop a truck being run.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, WSU_ACCENT);

    // ------------------------------------------------------------------ floor
    // Sealed concrete in the break room, deck plate visible at the dock door.
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#565c62", base2: "#4c5258", seam: "rgba(20,24,28,0.45)",
    }), { repeat: 4, px: 384 });
    const floor = box(g, 5.8, 0.018, 5.2, 0, 0.01, -0.5, 0x565c62, { rough: 0.95, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.95, metal: 0.05, color: 0x565c62 });
    const plateTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, {}), { repeat: 2, px: 256 });
    const dockSill = box(g, 1.6, 0.02, 0.6, 2.4, 0.012, 2.4, 0x6b7076, { rough: 0.6, metal: 0.5, cast: false });
    dockSill.material = texturedMat(plateTex, { rough: 0.6, metal: 0.5, color: 0x6b7076 });

    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#9aa0a6", base2: "#8f959b", seam: "rgba(50,56,62,0.35)",
    }), { repeat: 3, px: 320 });
    const backWall = box(g, 6.4, 2.9, 0.12, 0, 1.45, -3.1, 0x9aa0a6, { rough: 0.9 });
    backWall.material = texturedMat(wallTex, { rough: 0.9, metal: 0.02, color: 0x9aa0a6 });
    box(g, 6.6, 0.1, 0.2, 0, 2.95, -3.1, 0x6f767d, { rough: 0.8 });
    box(g, 6.4, 0.5, 0.02, 0, 0.25, -3.03, 0xd8a447, { rough: 0.8, cast: false });   // safety-yellow dado

    // ------------------------------------------------------------ the dock door
    // A roll-up door on the right wall with the forklift's mast visible beyond
    // it; the crew-mate heads for it when the interruption fires.
    const dock = group(g, 2.95, 0, 1.6, -Math.PI / 2);
    box(dock, 0.16, 2.6, 0.16, -0.9, 1.3, 0, 0x4e565f, { rough: 0.7 });
    box(dock, 0.16, 2.6, 0.16, 0.9, 1.3, 0, 0x4e565f, { rough: 0.7 });
    box(dock, 2.0, 0.2, 0.2, 0, 2.7, 0, 0x4e565f, { rough: 0.7 });
    for (let i = 0; i < 5; i++) box(dock, 1.64, 0.22, 0.04, 0, 1.55 + i * 0.24, 0.06, 0x8a929a, { rough: 0.5, metal: 0.5 });
    const dockLight = ball(dock, 0.05, 0, 2.5, 0.12, 0x59c97b, { emissive: 0x59c97b, ei: 1.6, seg: 10 });
    holoTag(dock, "Dock door", 0, 2.9, 0.1, { css: WSU_CSS, w: 0.3 });
    // The forklift beyond the door, seen through the gap: mast and counterweight.
    const truck = group(g, 4.6, 0, 1.6, 0.3);
    box(truck, 1.1, 0.5, 1.7, 0, 0.5, 0, 0xd8a447, { rough: 0.6, metal: 0.2 });
    box(truck, 0.9, 0.8, 0.8, 0, 1.15, 0.2, 0x2b3138, { rough: 0.6 });
    for (const sx of [-1, 1]) cyl(truck, 0.03, 0.03, 2.2, sx * 0.3, 1.5, -0.95, 0x3a4149, { rough: 0.4, metal: 0.7, seg: 10 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const wh = cyl(truck, 0.22, 0.22, 0.18, sx * 0.55, 0.22, sz * 0.6, 0x1a1e23, { rough: 0.9, seg: 12 }); wh.rotation.z = Math.PI / 2; }

    // ---------------------------------------------------------- the key board
    const keyBoard = group(g, 1.1, 1.45, -3.02);
    box(keyBoard, 0.7, 0.5, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.7 });
    holoTag(keyBoard, "Forklift keys", 0, 0.32, 0.04, { css: WSU_CSS, w: 0.32 });
    const KEYS = [
      ["key-hook-pull", "Truck 2 — his key", -0.18, 0.05, "#59c97b"],
      ["cover-the-impairment", "Hand him the key?", 0.18, 0.05, "#f0645b"],
    ];
    for (const [kid, label, x, y, css] of KEYS) {
      cyl(keyBoard, 0.006, 0.006, 0.05, x, y + 0.06, 0.04, 0xb0b8c0, { rough: 0.3, metal: 0.8, seg: 8 });
      const k = group(keyBoard, x, y, 0.045);
      box(k, 0.03, 0.06, 0.012, 0, 0, 0, 0x22262b, { rough: 0.5 });
      cyl(k, 0.018, 0.018, 0.005, 0, -0.05, 0, 0xb0b8c0, { rough: 0.35, metal: 0.85, seg: 12 });
      holoTag(keyBoard, label, x, y - 0.14, 0.04, { css, w: 0.42 });
      reg(hits, k, kid);
    }
    const hisKey = hits["key-hook-pull"];
    // The key cabinet with the spare, and its cam lock.
    const keyCab = group(g, 1.95, 1.3, -3.0);
    box(keyCab, 0.4, 0.5, 0.14, 0, 0, 0, 0x8a929a, { rough: 0.5, metal: 0.4 });
    box(keyCab, 0.36, 0.46, 0.02, 0, 0, 0.075, 0x9aa2aa, { rough: 0.45, metal: 0.4 });
    const camLock = group(keyCab, 0.12, 0, 0.09);
    cyl(camLock, 0.025, 0.025, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 12 }).rotation.x = Math.PI / 2;
    box(camLock, 0.006, 0.03, 0.015, 0, 0, 0.012, 0x22262b, { rough: 0.4 });
    holoTag(keyCab, "Key cabinet — lock it", 0, 0.34, 0.06, { css: WSU_CSS, w: 0.46 });
    reg(hits, camLock, "cabinet-lock");

    // ------------------------------------------------------------- the table
    const table = counter(g, 1.6, 0.8, -0.2, -1.6, 0x6b5a48, { ry: 0, height: 0.76, undershelf: false, rough: 0.6, metal: 0.05 });
    void table;
    function breakChair(parent, x, z, ry) {
      const c = group(parent, x, 0, z, ry);
      box(c, 0.42, 0.05, 0.42, 0, 0.45, 0, 0x3a4149, { rough: 0.6, metal: 0.3 });
      box(c, 0.42, 0.42, 0.05, 0, 0.7, -0.18, 0x3a4149, { rough: 0.6, metal: 0.3 });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(c, 0.016, 0.016, 0.45, sx * 0.17, 0.22, sz * 0.17, 0x5b636b, { rough: 0.4, metal: 0.6, seg: 8 });
      return c;
    }
    breakChair(g, -0.7, -2.25, 0.15);
    breakChair(g, 0.35, -0.95, Math.PI);
    breakChair(g, -1.05, -1.0, 2.6);

    // The crew-mate at the table, and the standing version of him for the
    // walk to the dock.
    const mate = seatedFigure(g, -0.7, 0.47, -2.2, { ry: 0.15, cloth: 0x2f3946, skin: 0xa8734f, vis: 0xd8a447 });
    holoTag(mate.torso, "Your crew-mate", 0, 1.32, 0.12, { css: WSU_CSS, w: 0.4 });
    const signJaw = ball(mate.torso, 0.024, 0.06, 1.12, 0.14, WSU_ACCENT, { emissive: WSU_ACCENT, ei: 1.4, seg: 12 });
    holoTag(mate.torso, "Jaw working", 0.06, 1.24, 0.14, { css: WSU_CSS, w: 0.32 });
    reg(hits, signJaw, "sign-jaw-clench");
    const signTalk = ball(mate.torso, 0.024, -0.1, 1.0, 0.16, WSU_ACCENT, { emissive: WSU_ACCENT, ei: 1.4, seg: 12 });
    holoTag(mate.torso, "Fast talk — three subjects", -0.14, 0.9, 0.2, { css: WSU_CSS, w: 0.5 });
    reg(hits, signTalk, "sign-fast-talk");
    const signPupils = ball(mate.torso, 0.024, 0.0, 1.2, 0.2, WSU_ACCENT, { emissive: WSU_ACCENT, ei: 1.4, seg: 12 });
    holoTag(mate.torso, "Pupils wide", 0.14, 1.36, 0.14, { css: WSU_CSS, w: 0.32 });
    reg(hits, signPupils, "sign-pupils");
    const coffeeCup = cyl(g, 0.04, 0.035, 0.1, -0.5, 0.81, -1.75, 0xe6eaee, { rough: 0.5, seg: 14 });
    holoTag(g, "Coffee cup", -0.5, 0.98, -1.75, { css: "#8a929a", w: 0.3 });
    reg(hits, coffeeCup, "sign-coffee-cup");
    const signTired = ball(mate.torso, 0.02, 0.24, 1.14, 0.1, 0x8a929a, { emissive: 0x8a929a, ei: 0.9, seg: 12 });
    holoTag(mate.torso, "Tired eyes — it is 4 a.m.", 0.34, 1.06, 0.1, { css: "#8a929a", w: 0.5 });
    reg(hits, signTired, "sign-tired-eyes");
    const mateUp = standingFigure(g, 2.0, 1.0, { ry: -1.4, cloth: 0x2f3946, trousers: 0x2a3138, skin: 0xa8734f, vest: 0xd8a447 });
    mateUp.visible = false;

    // The pill bottle he offers, and his place at the table.
    const bottle = group(g, -0.35, 0.78, -1.4);
    cyl(bottle, 0.022, 0.022, 0.07, 0, 0.035, 0, 0xe8a04a, { rough: 0.3, metal: 0.05, opacity: 0.8, transparent: true, seg: 12 });
    cyl(bottle, 0.024, 0.024, 0.015, 0, 0.077, 0, 0xe6eaee, { rough: 0.5, seg: 12 });
    holoTag(bottle, "\"You look worse than me\" — take one?", 0, 0.2, 0, { css: "#f0645b", w: 0.72 });
    reg(hits, bottle, "pill-to-make-shift");
    const hisPlace = box(g, 0.3, 0.008, 0.3, -0.7, 0.766, -1.72, 0x59c97b, { rough: 0.8, emissive: 0x59c97b, ei: 0.3, cast: false });
    holoTag(g, "His place", -0.7, 0.9, -1.55, { css: "#59c97b", w: 0.28 });
    reg(hits, hisPlace, "his-place");

    // Water, on the kitchenette counter with the coffee machine and an energy
    // drink beside it.
    const kitchen = counter(g, 1.5, 0.5, -2.1, -2.6, 0x5b636b, { ry: 0, height: 0.9, undershelf: true });
    cabinet(g, 1.4, 0.5, 0.32, -2.1, 1.85, -2.9, 0x6f767d, { doorColor: 0x656c73 });
    const coffee = group(kitchen, -0.45, 0.92, -0.05);
    box(coffee, 0.26, 0.34, 0.28, 0, 0.17, 0, 0x22262b, { rough: 0.5, metal: 0.3 });
    cyl(coffee, 0.05, 0.05, 0.1, 0, 0.09, 0.09, 0xe6eaee, { rough: 0.5, seg: 12 });
    const waterBottle = cyl(kitchen, 0.035, 0.035, 0.22, 0.15, 1.03, 0.0, 0x9fd3f0, { rough: 0.25, metal: 0.05, opacity: 0.7, transparent: true, seg: 12 });
    cyl(kitchen, 0.02, 0.02, 0.03, 0.15, 1.155, 0.0, 0x4fd1ff, { rough: 0.4, seg: 10 });
    holoTag(kitchen, "Water", 0.15, 1.24, 0.0, { css: WSU_CSS, w: 0.24 });
    reg(hits, waterBottle, "water-bottle");
    cyl(kitchen, 0.035, 0.035, 0.14, 0.5, 0.99, 0.05, 0xe8542f, { rough: 0.4, metal: 0.4, seg: 12 });
    holoTag(kitchen, "Energy drink", 0.5, 1.14, 0.05, { css: "#8a929a", w: 0.3 });

    // ------------------------------------------------------------- his locker
    const lockers = group(g, -2.85, 0, -1.0, Math.PI / 2);
    for (let i = 0; i < 4; i++) cabinet(lockers, 0.42, 1.7, 0.42, -0.66 + i * 0.44, 0.88, 0, 0x4f5860, { doorColor: 0x475059 });
    box(lockers, 1.8, 0.06, 0.46, 0, 0.03, 0, 0x3a4149, { rough: 0.7 });
    const hisLockerDoor = box(lockers, 0.38, 1.6, 0.02, -0.22, 0.9, 0.24, 0x5a6470, { rough: 0.45, metal: 0.15 });
    holoTag(lockers, "His locker — search it?", -0.22, 1.9, 0.26, { css: "#f0645b", w: 0.5 });
    reg(hits, hisLockerDoor, "search-the-locker");

    // -------------------------------------------------------- graded controls
    const levelMount = group(g, 0.45, 0.8, -1.9, -0.5);
    const levelGauge = instrument(levelMount, 0, 0, 0, { idle: "LEVEL", color: WSU_ACCENT, w: 0.2, d: 0.24 });
    holoTag(levelMount, "Keep it level", 0, 0.2, 0, { css: WSU_CSS, w: 0.34 });
    reg(hits, levelGauge, "level-point");
    const stressMount = group(g, 0.5, 0.8, -1.25, 0.2);
    const stressDial = instrument(stressMount, 0, 0, 0, { idle: "1–10", color: WSU_ACCENT, w: 0.2, d: 0.24 });
    holoTag(stressMount, "Your own stress check", 0, 0.2, 0, { css: WSU_CSS, w: 0.46 });
    reg(hits, stressDial, "stress-dial");

    // ------------------------------------------------------- markers and cards
    const marker = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const bead = ball(m, o.r ?? 0.026, 0, y, 0, o.color ?? WSU_ACCENT,
        { emissive: o.color ?? WSU_ACCENT, ei: o.ei ?? 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? WSU_CSS, w: o.w ?? 0.4 });
      reg(hits, bead, id);
      return bead;
    };
    marker(-0.25, 1.28, -0.6, "stay-point", "Stay with him", { w: 0.36 });
    marker(1.5, 1.2, 0.8, "call-out-on-the-floor", "\"What are you on?\" — on the floor", { w: 0.7, color: 0xf0645b, css: "#f0645b" });

    // The say-it sequence on a stand by the table.
    const sayStand = group(g, 1.05, 0, -2.2, -0.5);
    cyl(sayStand, 0.022, 0.022, 1.7, 0, 0.85, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
    const SAY = [
      ["say-what-you-saw", "1 — what I saw", 0.9],
      ["say-not-driving", "2 — you're off the truck tonight", 1.22],
      ["say-supervisor-with-you", "3 — supervisor's coming; I'm staying", 1.54],
    ];
    for (const [sid, label, y] of SAY) {
      const bead = ball(sayStand, 0.024, 0, y, 0, WSU_ACCENT, { emissive: WSU_ACCENT, ei: 1.5, seg: 12 });
      holoTag(sayStand, label, 0.18, y, 0, { css: WSU_CSS, w: 0.66 });
      reg(hits, bead, sid);
    }

    // The radio on your belt hook, and your phone with the chat.
    const radio = group(g, 2.75, 0, -0.6, -Math.PI / 2);
    box(radio, 0.08, 0.16, 0.05, 0, 1.15, 0, 0x2b3138, { rough: 0.5 });
    cyl(radio, 0.006, 0.006, 0.1, 0.025, 1.28, 0, 0x1b1e22, { rough: 0.5, seg: 6 });
    const radioLamp = ball(radio, 0.012, -0.02, 1.2, 0.03, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8 });
    holoTag(radio, "Radio — supervisor", 0, 1.34, 0.03, { css: "#59c97b", w: 0.42 });
    reg(hits, radio, "radio-supervisor");
    const phone = group(g, 0.1, 0.78, -1.15, -0.4);
    box(phone, 0.075, 0.012, 0.15, 0, 0, 0, 0x1b1e22, { rough: 0.35, metal: 0.4 });
    const phoneScreen = decal(phone, 0.065, 0.13, 0, 0.007, 0,
      signFace("04:12", { bg: "#0c1a24", accent: WSU_CSS, fg: "#cfeaf7", scale: 0.3 }), { px: 128, glow: true, ei: 0.6 });
    phoneScreen.rotation.x = -Math.PI / 2;
    holoTag(phone, "Your phone", 0, 0.16, 0, { css: WSU_CSS, w: 0.3 });
    const chatBubble = decal(phone, 0.36, 0.14, 0, 0.32, 0,
      signFace("CREW CHAT: PHOTO OF HIM POSTED", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd9d9", scale: 0.3 }), { px: 256, glow: true, ei: 1.0, transparent: true });
    chatBubble.visible = false;
    const takedown = decal(g, 0.3, 0.16, 0.65, 0.78, -0.75,
      signFace("REPLY: TAKE IT DOWN", { bg: "#0c1a24", accent: "#59c97b", scale: 0.36 }), { px: 192, glow: true, ei: 0.8, transparent: true });
    takedown.rotation.x = -Math.PI / 2;
    holoTag(g, "One reply — take it down", 0.65, 0.92, -0.75, { css: "#59c97b", w: 0.5 });
    reg(hits, takedown, "phone-takedown");

    // ------------------------------------------------------- the doors board
    const doors = group(g, -1.0, 1.5, -2.96, 0.0);
    box(doors, 1.3, 0.9, 0.05, 0, 0, 0, 0x8a7862, { rough: 0.85 });
    const DOORS = [
      ["eap-card", "EAP — confidential, clinician's file", -0.42, 0.22, WSU_CSS],
      ["helpline-card", "SAMHSA helpline — any hour", 0.42, 0.22, WSU_CSS],
      ["treatment-card", "Treatment — job protected in recovery", 0.0, -0.24, "#7fc4d8"],
    ];
    for (const [did, label, x, y, css] of DOORS) {
      const sheet = decal(doors, 0.38, 0.28, x, y, 0.03,
        paperFace(label.split(" — ")[0], [label.split(" — ")[1] ?? ""], { scale: 0.5 }), { px: 256 });
      holoTag(doors, label, x, y - 0.2, 0.04, { css, w: 0.64 });
      reg(hits, sheet, did);
    }
    holoTag(doors, "Doors that keep the job", 0, 0.55, 0.04, { css: WSU_CSS, w: 0.5 });

    // Process and report cards on the wall by the supervisor's office.
    const office = group(g, -2.9, 0, 1.3, Math.PI / 2);
    box(office, 1.3, 2.3, 0.1, 0, 1.15, 0, 0x4e565f, { rough: 0.7 });
    box(office, 0.9, 0.9, 0.02, 0, 1.5, 0.06, 0x9fd3f0, { rough: 0.2, metal: 0.1, opacity: 0.5, transparent: true });
    holoTag(office, "Supervisor's office", 0, 2.45, 0.08, { css: WSU_CSS, w: 0.44 });
    const processCard = decal(office, 0.34, 0.26, -0.7, 1.6, 0.08,
      paperFace("REASONABLE SUSPICION", ["Trained supervisor decides", "Employer's programme tests", "Steward in the room"], { scale: 0.5 }), { px: 256 });
    holoTag(office, "Whose decision the test is", -0.7, 1.8, 0.08, { css: WSU_CSS, w: 0.52 });
    reg(hits, processCard, "process-card");
    const reportCard = decal(office, 0.34, 0.26, -0.7, 1.15, 0.08,
      paperFace("REPORTING IS PROTECTED", ["29 CFR 1904 anti-retaliation", "No test as punishment", "For reporting a hazard"], { scale: 0.5 }), { px: 256 });
    holoTag(office, "Reporting is protected", -0.7, 0.96, 0.08, { css: WSU_CSS, w: 0.46 });
    reg(hits, reportCard, "report-card");
    // The supervisor's tray outside the office, and the incident note.
    const trayStand = group(g, -2.55, 0, 2.1);
    box(trayStand, 0.4, 0.9, 0.3, 0, 0.45, 0, 0x4f5860, { rough: 0.6, metal: 0.2 });
    const superTray = box(trayStand, 0.34, 0.03, 0.26, 0, 0.92, 0, 0x8a929a, { rough: 0.5, metal: 0.5 });
    box(trayStand, 0.34, 0.06, 0.02, 0, 0.96, -0.12, 0x8a929a, { rough: 0.5, metal: 0.5 });
    holoTag(trayStand, "Supervisor's tray", 0, 1.1, 0, { css: WSU_CSS, w: 0.4 });
    reg(hits, superTray, "super-tray");
    const note = decal(g, 0.2, 0.28, -0.05, 0.775, -1.95,
      paperFace("NOTE — 04:12", ["Jaw · speech · pupils", "Key taken · water given", "Supervisor called"], { scale: 0.45 }), { px: 224 });
    note.rotation.x = -Math.PI / 2; note.rotation.z = 0.2;
    holoTag(g, "Incident note — what you saw", -0.05, 0.95, -1.95, { css: WSU_CSS, w: 0.56 });
    reg(hits, note, "incident-note");

    // The check-in board.
    const checkBoard = holoPanel(g, 0.5, 0.34, 2.35, 1.95, -1.6, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,28,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fd1ff"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e2f6ff";
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW LEAD CHECK-IN", w / 2, h * 0.32);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillStyle = "#cfeaf7";
      ["You reported a friend at 4 a.m.", "Peer team · EAP · helpline", "Answer it — never scored"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.54 + i * 0.15)));
    }, { ry: -0.6, accent: 0x4fd1ff });
    reg(hits, checkBoard, "crew-checkin-board");

    // The night supervisor, still in the office until called.
    const supervisor = standingFigure(g, -4.2, 1.3, { ry: Math.PI / 2, cloth: 0x3a2f2f, trousers: 0x2a3138, vest: 0xf2c14b, helmet: 0xf2c14b });
    supervisor.visible = false;
    // A second crew member on the far side of the room, clear of the furniture.
    const crew = standingFigure(g, 1.5, -0.2, { ry: 2.4, cloth: 0x2f3946, trousers: 0x2a3138, vest: 0xd8a447, helmet: 0xf2c14b });
    holoTag(crew, "Crew", 0, 1.95, 0, { css: WSU_CSS, w: 0.2 });

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(-0.3, 1.15, -1.9),

      onStepComplete(step) {
        if (step.id === "take-the-key") hisKey.visible = false;
        if (step.id === "lock-the-cabinet") camLock.rotation.y = Math.PI / 2;
        if (step.id === "water-for-him") {
          waterBottle.position.set(-0.7 + 2.1, 0.0, -1.72 + 2.6);   // counter-local: his place
          waterBottle.position.y = 0.87;
        }
        if (step.id === "say-it") {
          for (const [sid] of SAY) hits[sid].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.4 });
        }
        if (step.id === "stay-with-him") {
          supervisor.visible = true;
          supervisor.position.set(-2.2, 0, 1.6);
        }
        if (step.id === "hand-the-note") {
          note.position.set(-2.55, 0.95, 2.1);
          note.rotation.z = 0;
        }
        if (step.id === "crew-check-in") {
          repaint(checkBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(8,26,20,0.9)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafbf1";
            cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("HANDED OVER", w / 2, h * 0.36);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            cx.fillStyle = "#b7e6c8";
            cx.fillText("Now the check-in — never scored", w / 2, h * 0.66);
          });
        }
      },

      // Both interruptions change the room: a message over the phone, and the
      // crew-mate on his feet at the dock door with the door light gone red.
      onInterrupt(it) {
        if (it.id === "chat-photo") {
          chatBubble.visible = true;
          repaint(phoneScreen, signFace("CREW CHAT", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd9d9", scale: 0.3 }));
        }
        if (it.id === "he-heads-for-the-dock") {
          mate.root.visible = false;
          mateUp.visible = true;
          dockLight.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
          radioLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "chat-photo") {
          chatBubble.visible = false;
          repaint(phoneScreen, signFace("SENT", { bg: "#0c1a24", accent: "#59c97b", fg: "#cfeaf7", scale: 0.3 }));
        }
        if (it.id === "he-heads-for-the-dock") {
          mateUp.visible = false;
          mate.root.visible = true;
          dockLight.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.4 });
          radioLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 });
        }
      },

      animate(t, dt, session) {
        mate.head.rotation.y = Math.sin(t * 2.2) * 0.18;
        mate.head.rotation.x = 0.05 + Math.sin(t * 3.1) * 0.04;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "own-stress-check") {
          const ok = gg.t >= 0.55 && gg.t <= 0.8;
          repaint(stressDial.userData.screen, signFace(`${Math.round(1 + gg.t * 9)} / 10`, {
            bg: "#0c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.55,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "keep-it-level" && tr) {
          const ok = tr.v >= 0.36 && tr.v <= 0.68;
          repaint(levelGauge.userData.screen, signFace(ok ? "LEVEL" : tr.v < 0.36 ? "ACCUSING" : "EXCUSING", {
            bg: "#0c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.48,
          }));
        }
      },
    };
  },
};
