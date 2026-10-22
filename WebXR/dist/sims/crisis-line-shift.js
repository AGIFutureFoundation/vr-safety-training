import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace,
  seatedFigure, mat, ceilingPanel,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Crisis Line Shift VR — Emergency Services, First Responder
// series: one call, taken properly, on a crisis line.
//
// The whole station is words. The headset and the desk are set first because a
// counsellor who is uncomfortable for four hours is a counsellor who starts
// rushing people; the call is answered with the line's own opening and then
// the script is put down; the risk questions are asked directly, in order,
// because a question asked sideways gets a sideways answer; the listening is
// reflected back rather than solved; the safety plan is built with the caller
// instead of read to them; means safety is asked about and then the silence
// after it is held; the decision to send help is made against a threshold and
// then said out loud to the caller before it happens; the call is documented;
// and the shift does not end until somebody senior has heard about the hard
// one.
//
// Sited generically in a crisis-line call room. No real line, service, centre
// or caller is named or implied, and the caller is a person here: named by
// role, never quoted for effect.

const CLS_ACCENT = 0x8f9ae8;
const CLS_CSS = "#8f9ae8";
const CLS_DESK = 0x555f6b;
const CLS_PANEL = 0x3c4450;

export const SIM_CRISIS_LINE_SHIFT = {
  id: "crisis-line-shift",
  index: "207",
  domain: "Emergency response",
  trade: "Crisis counsellor",
  category: "Emergency Services",
  indoor: "service",
  weather: "clear",
  certification: "CIT International's crisis intervention team model for the collaboration between a crisis line and responding officers; SAMHSA's principles of a trauma-informed approach and its national guidelines for behavioral health crisis care; Psychological First Aid as published by the National Child Traumatic Stress Network and the World Health Organization; the 988 Suicide and Crisis Lifeline's own standards for risk assessment, collaborative safety planning, means safety and imminent-risk intervention; the CDC's technical package for suicide prevention, which is where means safety as a population measure comes from; the NASW Code of Ethics; the HIPAA Privacy Rule and, where substance use is part of the call, 42 CFR Part 2; Cal/OSHA's Injury and Illness Prevention Program, 8 CCR §3203, under which the centre's own fatigue and debrief rules sit; SEIU 1021 crisis-worker practice standards",
  name: "Crisis Line Shift",
  title: simTitle("Crisis Line Shift"),
  tagline: "One call on a crisis line: the opening then off the script, the risk questions asked directly, reflective listening, a safety plan built with the caller, means safety and the silence after it, the dispatch decision said out loud before it happens, the record, and the consult afterwards",
  accent: CLS_ACCENT,
  accentCss: CLS_CSS,
  parSeconds: 330,
  footprint: 2.3,
  badge: { id: "stayed-on-the-line", name: "Stayed On The Line", note: "A hard call worked all the way through — asked directly, planned together, said out loud, written down, and taken to a supervisor afterwards" },

  game: system({
    name: "Line Watch",
    currency: "CALLS",
    ranks: ["Line Trainee", "Crisis Counsellor", "Senior Counsellor", "Shift Lead", "Crisis Line Certified"],
    badges: [
      { id: "asked-directly", name: "Asked Directly", note: "The risk questions asked in order, in plain words, with nothing softened into uselessness", test: AWARD.stepClean("risk-assessment") },
      { id: "nothing-hidden", name: "Nothing Hidden", note: "No promise that could not be kept and nothing done to the caller without telling them", test: AWARD.safe },
      { id: "threshold-read", name: "Threshold Read", note: "The dispatch decision made against the threshold rather than on instinct", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-call", name: "Clean Call", note: "No corrections anywhere in the call", test: AWARD.clean },
      { id: "held-the-silence", name: "Held The Silence", note: "The pacing and the silence after the means question both held without a break", test: AWARD.unbroken },
      { id: "no-clock-watching", name: "No Clock-Watching", note: "Complete inside 80% of par without hurrying the caller", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wrap-it-up": "You hit the wrap-up prompt to bring the call in under the average handle time. Average handle time is a staffing number, not a clinical one, and a caller who is being steered toward hanging up can hear it — the one thing a crisis line has that nothing else in the system has is that it will stay on the phone, and a counsellor who trades that for a queue statistic has given away the whole service.",
    "promise-no-dispatch": "You promised the caller that you would never send anyone, whatever they told you. It buys thirty seconds of trust and then destroys it permanently: this line does dispatch for imminent risk, and a caller who was promised otherwise and then hears sirens has been lied to at the worst moment of their life — and will tell everyone they know not to call.",
    "silent-dispatch": "You started an emergency dispatch without telling the caller it was happening. Police or paramedics arriving unannounced at the door of somebody in crisis is how a call intended to help becomes the most frightening thing that happened that week, and it is avoidable: the caller is told who is coming, why, and what to expect, before it happens, every time it can be.",
    "give-advice": "You reached for the advice card. \"Have you tried going for a walk\" is what a counsellor says when the silence is uncomfortable, and to a caller it lands as proof that the person on the other end has not understood a word: advice offered before somebody feels heard is heard as dismissal, and it costs the rest of the call. The listening is the intervention here; the plan comes later and the caller builds it.",
    "skip-means-question": "You toggled the means question off because it felt too intrusive to ask. Means safety — putting time and distance between a person and the method they have in mind — is one of the few interventions with population-level evidence behind it, and it is the CDC's technical package rather than anybody's hunch. A question not asked is not a kindness; it is the one part of this call that most changes what happens next.",
  },

  lateNotes: {
    "dispatch-gauge": "There is nothing to weigh yet. The dispatch decision is made against what the risk questions and the safety plan actually produced, not against the first minute of a call.",
    "call-record": "Nothing to write up yet — the record of a call is written after it, from what happened, not alongside it from what you expect to happen.",
    "supervisor-console": "The consult comes after the call and after the record. A supervisor pulled in mid-call is a different escalation with a different reason.",
    "peer-support-card": "That one is for the end of the shift. The check-in on yourself is the last thing, once the call is closed and the consult has happened.",
  },

  steps: [
    {
      id: "headset-fit", kind: "drag", target: "headset",
      title: "Fit the headset before the first call",
      cue: "Lift the headset off the hook and settle it on, boom mic to the corner of your mouth.",
      drag: { to: "headset-on-head", radius: 0.45, missNote: "Not seated yet — the headset has to actually be on, with the boom where your voice is, before the first call lands." },
      why: "A headset worn wrong for a four-hour shift is a headache by the second hour and a short answer by the third, and callers hear short answers as impatience. A boom mic in the wrong place makes a counsellor repeat themselves, which on a crisis line costs the one thing there is not much of: the caller's willingness to keep talking to somebody who does not seem to be hearing them.",
    },
    {
      id: "station-ready", kind: "find", noHint: true,
      targets: ["risk-card", "resource-list", "own-supplies"],
      itemNames: {
        "risk-card": "the risk-assessment prompt card, where you can read it without hunting",
        "resource-list": "today's list of mobile crisis teams and warm lines that are actually open",
        "own-supplies": "your own water and your break time on the board",
      },
      itemNotes: {
        "risk-card": "The prompt card is not a crutch. It is there so that on the hardest call of the shift the order of the questions is not something you have to remember while also listening.",
        "resource-list": "A resource list is only as good as this morning: teams have hours, warm lines close, and a referral to something shut is worse than no referral because the caller tries it and gets nothing.",
        "own-supplies": "Water and a break already on the board is not comfort, it is capacity. A counsellor who works straight through is the counsellor who takes the eleventh call badly, and the eleventh caller does not know why.",
      },
      decoyNotes: {
        "queue-board": "The queue board tells you how many people are waiting, which is real and is not yours to solve on this call. Watching it is how a counsellor starts hurrying the person actually on the line.",
      },
      title: "Set the desk up for a whole shift",
      cue: "Three things have to be in reach before you take a call. Find all three.",
      why: "Everything a crisis counsellor needs mid-call has to be in reach before the call, because there is no pausing to go and find it: the prompt card, an open-today resource list, and the counsellor's own water and break. Setting up deliberately is the difference between a hard call that is worked and a hard call that is survived, and the second kind is what burns a line's staff out inside a year.",
    },
    {
      id: "answer-opening", kind: "select", target: "call-answer",
      title: "Answer with the line's own opening",
      cue: "Take the call and give the opening as written — the line's name, your first name, and that you are listening.",
      why: "The opening is written and is said as written because it is the only part of the call the caller may already know, and hearing the expected words tells a frightened person they have reached the right number. It also does three jobs in one breath: it confirms where they are, it gives them a human name to talk to, and it states that listening — not assessing — is what is about to happen.",
    },
    {
      id: "off-script", kind: "select", target: "off-script-card",
      title: "Put the script down",
      cue: "After the opening, drop the script and use the caller's own words back to them.",
      why: "Past the opening, a script is a liability: it produces a call that sounds like a form being filled in, and a caller in crisis is exquisitely sensitive to being processed. Working from the caller's own words — their phrase for what is happening, their name for the person who left — is what makes the next twenty minutes a conversation, and a conversation is the only thing here that gets an honest answer to a risk question.",
    },
    {
      id: "risk-assessment", kind: "sequence",
      targets: ["ask-thoughts", "ask-plan", "ask-timeframe"],
      itemNames: {
        "ask-thoughts": "are you thinking about killing yourself — asked in those words",
        "ask-plan": "have you thought about how",
        "ask-timeframe": "is that something you are thinking about today",
      },
      title: "Ask the risk questions directly, in order",
      cue: "Ask about the thoughts, then about a method, then about the timeframe — plainly, without softening any of them into something else.",
      why: "Asked directly, in plain words, these questions do not plant an idea and do not make anything worse — that much is settled, and the fear that they do is the main reason they get asked sideways. Order matters because each answer sets what the next question means: a method without a timeframe is a different call from a method for tonight, and a counsellor who never asked cannot tell the two apart.",
      outOfOrderNote: "Thoughts, then method, then timeframe. Asking about tonight before you know what they are actually thinking about is a question with no anchor, and the answer will not mean what you think it means.",
    },
    {
      id: "reflective-pace", kind: "track", target: "reflect-pace", seconds: 6,
      title: "Reflect it back at the caller's pace",
      cue: "Say back what you heard, in their words, and keep the pace with them — not solving, not filling.",
      track: {
        start: 0.2, green: [0.34, 0.66], rise: 0.52, fall: 0.44, drift: 0.14, label: "CALL PACE",
        readout: (v) => (v < 0.34 ? "gone quiet on them — you are absent, not listening" : v > 0.66 ? "talking over them / solving" : "with them"),
      },
      why: "Reflective listening is the working part of this call: hearing their own sentence come back accurately is what tells a caller they have been understood, and being understood is what lowers the temperature enough for anything else to happen. Both failure modes are active ones — running ahead into solutions, or going so quiet that the caller is alone on the line — so the skill is holding the middle for minutes at a time.",
      holdBreakNote: "The pace came apart — either you got out ahead of the caller with a solution, or you went quiet long enough that they were talking into nothing. Come back to their last sentence and say it back to them.",
    },
    {
      id: "safety-plan", kind: "sequence",
      targets: ["plan-warning-signs", "plan-own-steps", "plan-one-person"],
      itemNames: {
        "plan-warning-signs": "what it looks like when it starts, in their words",
        "plan-own-steps": "what has helped them before, not what should help",
        "plan-one-person": "one person they will actually call",
      },
      title: "Build the safety plan with the caller",
      cue: "Their warning signs first, then what has actually worked for them, then one real person — written as they say it.",
      why: "A safety plan the counsellor wrote is a document; a safety plan the caller built is something they might use at three in the morning. The order runs from what they already know about themselves outward to other people, because starting with \"who could you call\" asks somebody at their lowest to produce a name, and starting with their own warning signs asks them for something they are expert in.",
      outOfOrderNote: "Warning signs, then their own steps, then the one person. Naming somebody to call before they have named what the bad night even looks like is a plan with no trigger attached to it.",
    },
    {
      id: "means-silence", kind: "hold", target: "silence-hold", seconds: 6,
      title: "Ask about means, then hold the silence",
      cue: "Ask what they have access to and whether it can be moved — then stop talking and let the pause run.",
      why: "The means conversation is the highest-value minute on this call: time and distance between a person and a specific method changes outcomes, which is why it is in the CDC's own suicide-prevention package rather than in anybody's personal technique. And the pause after the question is part of the intervention — it is where the caller does the thinking, and a counsellor who fills it has answered their own question instead of hearing theirs.",
      holdBreakNote: "You filled the silence. The pause after a means question is where the caller works out what they are willing to do — ask it again and let the quiet sit until they break it.",
    },
    {
      id: "dispatch-decision", kind: "gauge", target: "dispatch-gauge",
      title: "Weigh the dispatch decision against the threshold",
      cue: "Read the risk indicators against the line's imminent-risk threshold and commit only inside the band.",
      gauge: {
        label: "IMMINENT RISK", speed: 0.6, green: [0.3, 0.52],
        readout: (t) => (t < 0.3 ? "below threshold — keep working the plan" : t <= 0.52 ? "at the threshold — decide" : "past it — this is a dispatch"),
        missNote: "Committed off the threshold. This decision is made against the line's stated criteria, not against how frightening the call felt — read it again and commit inside the band.",
      },
      why: "Both errors here are serious and they are not symmetrical in the way people assume. Dispatching a caller who was working a plan with you can cost them their housing, their job or their trust in the only number they were willing to ring; not dispatching somebody at imminent risk can cost their life. The line publishes a threshold precisely so this is a judgement against criteria rather than against whoever is most frightened in the room.",
    },
    {
      id: "tell-the-caller", kind: "select", target: "dispatch-script-card",
      title: "Tell the caller what is about to happen",
      cue: "Say it plainly: who is coming, why you decided that, and what they will see when it arrives.",
      why: "Somebody arriving at the door unannounced turns a call for help into the most frightening thing that happened that month, and it is almost always avoidable. Saying who is coming, why, and what it will look like keeps the caller a participant in their own emergency rather than its subject — and it is the single thing that decides whether they ever call this number again.",
    },
    {
      id: "stay-connected", kind: "turn", target: "line-hold-dial",
      title: "Stay on the line until help is there",
      cue: "Set the line status to stay connected, and keep talking until somebody is actually with them.",
      turn: { turns: 0.5, axis: "y", label: "LINE STATUS" },
      why: "The gap between a dispatch and an arrival is the most dangerous stretch of the whole call, and it is also the easiest one to hand off — the decision is made, the queue is full, the next call is waiting. Staying on is what the caller was promised implicitly the moment they were told help was coming, and a released line during that gap is a person left alone at exactly the wrong minute.",
    },
    {
      id: "call-record", kind: "select", target: "call-record",
      title: "Write the call up",
      cue: "Record what was asked, what the caller said, the plan you built, the decision and the reason for it.",
      why: "The record is what the next counsellor sees if this caller rings back tonight, and it is what any review of a dispatch decision runs on. The reason matters as much as the decision: \"dispatched\" tells a reviewer nothing, while the threshold the call was measured against and the answers it was measured on can be argued with, learned from, and defended.",
    },
    {
      id: "supervisor-consult", kind: "select", target: "supervisor-console",
      title: "Take the hard one to a supervisor",
      cue: "Flag it for consult and actually talk it through — the decision, the doubt, and what you would do again.",
      why: "A consult after a hard call is not a performance review, it is how a line keeps one counsellor's judgement from drifting alone: the decision gets a second reader, the doubt gets said out loud instead of carried home, and anything the line needs to change gets noticed while somebody still remembers the call. Skipping it is how a small wrong habit becomes a year of them.",
    },
    {
      id: "own-checkin", kind: "select", target: "peer-support-card",
      title: "Check in on yourself before the next call",
      cue: "Take the break that is on the board, and use peer support or the employee assistance line if this one is staying with you.",
      why: "Exposure to other people's crises accumulates, and on a crisis line it accumulates every shift — which is why the centre's own critical-incident rules and SEIU 1021's language treat the break and the peer-support call as part of the work rather than as a reward for finishing it. The counsellor who takes the next call straight off this one is the reason the next caller gets a worse version of this service.",
    },
  ],

  interrupts: [
    {
      id: "second-line-rings",
      kind: "Second line ringing",
      after: "means-silence", delay: 3, seconds: 14,
      alert: "The second line starts ringing on the console, right in the middle of the pause after the means question — and the queue light goes amber beside it.",
      cue: "Roll it to the backup counsellor. Do not take it and do not put this caller on hold.",
      target: "backup-rollover",
      why: "This is the moment on the whole call with the most riding on it, and a caller who is put on hold in the middle of deciding whether to hand over the pills does not always come back to the same answer. The line staffs a backup position for exactly this: the ringing phone is somebody else's job for the next ninety seconds, and treating it as yours abandons the person you already have.",
      missNote: "The second line rang out while this caller sat in a silence that had just become about the phone rather than about them. The moment closed, the means conversation had to start over from a worse place, and there was a backup counsellor sitting one desk away the whole time.",
      wrongNote: "Not by picking it up and not by putting this caller on hold. Roll the second line to the backup position — that is what the backup position is for.",
    },
    {
      id: "caller-goes-silent",
      kind: "Caller has gone silent",
      after: "reflective-pace", delay: 3, seconds: 14,
      alert: "The caller stops mid-sentence. No hang-up tone, no breathing you can read — just an open line and nothing coming down it.",
      cue: "Stay in it. Say you are still here, and let the silence be theirs.",
      target: "stay-on-line",
      why: "An open line with nothing on it is not an ended call, and the reflex — filling it, asking if they are still there four times, moving to the next question — turns the caller's pause into the counsellor's anxiety. Saying \"I'm still here, take your time\" once and then waiting is what keeps the line open for somebody who is crying quietly, or holding something, or working up to the sentence that matters.",
      missNote: "The silence got filled or the call got treated as over. Either way the caller's own pause was taken away from them, and whatever they were working up to saying in it did not get said — a silence on a crisis line is usually the most important thing happening on the call.",
      wrongNote: "That is not it, and the line is still open. Stay on it: say you are still there once, then wait, and let the silence belong to the caller.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, CLS_ACCENT);

    // ------------------------------------------------------------------ shell
    // A night call room: sound-deadening carpet tile underfoot and acoustic
    // panel above the desks, both textured so the room reads as somewhere
    // people sit for four hours rather than as a grey plane.
    const floorTex = surfaceTexture(
      (cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a3f4a", base2: "#31363f", step: 18 }),
      { repeat: 6, px: 384 });
    const floor = box(g, 5.4, 0.1, 5.0, 0, 0.05, 0, 0x3a3f4a, { rough: 0.95, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.95, metal: 0.02, color: 0x3a3f4a });

    const acousticTex = surfaceTexture(
      (cx, w, h) => deckPlateFace(cx, w, h, { base: "#414a58", base2: "#39414d", step: 26 }),
      { repeat: 4, px: 320 });
    const backWall = box(g, 5.4, 2.8, 0.12, 0, 1.4, -2.56, CLS_PANEL, { rough: 0.96, cast: false });
    backWall.material = texturedMat(acousticTex, { rough: 0.95, metal: 0.02, color: CLS_PANEL });
    const leftWall = box(g, 0.12, 2.8, 5.0, -2.7, 1.4, 0, CLS_PANEL, { rough: 0.96, cast: false });
    leftWall.material = texturedMat(acousticTex, { rough: 0.95, metal: 0.02, color: CLS_PANEL });
    const rightWall = box(g, 0.12, 2.8, 5.0, 2.7, 1.4, 0, CLS_PANEL, { rough: 0.96, cast: false });
    rightWall.material = texturedMat(acousticTex, { rough: 0.95, metal: 0.02, color: CLS_PANEL });
    ceilingPanel(g, -1.0, -0.9, { y: 2.74, color: 0xe6ecff, ei: 0.9, lamp: 0.85, range: 8 });
    ceilingPanel(g, 1.0, 0.9, { y: 2.74, color: 0xe6ecff, ei: 0.9, lamp: 0.85, range: 8 });

    // ------------------------------------------------------------- the desk
    const desk = group(g, 0, 0, -1.25);
    box(desk, 2.0, 0.72, 0.72, 0, 0.36, 0, CLS_DESK, { rough: 0.6, metal: 0.2 });
    box(desk, 2.1, 0.05, 0.8, 0, 0.75, 0, 0x6b7481, { radius: 0.02, rough: 0.5, metal: 0.25 });
    box(desk, 2.1, 0.4, 0.04, 0, 1.0, -0.4, 0x4a5360, { rough: 0.9, cast: false });
    holoTag(desk, "counsellor's desk", 0, 1.3, -0.4, { css: CLS_CSS, w: 0.4 });

    // Two monitors: the call console on the left, the record on the right.
    const consoleMon = group(desk, -0.6, 0.78, -0.2, 0.25);
    box(consoleMon, 0.46, 0.3, 0.02, 0, 0.2, 0, 0x1e232a, { rough: 0.5, metal: 0.3 });
    const consoleFace = decal(consoleMon, 0.42, 0.26, 0, 0.2, 0.013, (cx, w, h) => {
      cx.fillStyle = "#0b1020"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = CLS_CSS; cx.fillRect(0, 0, w, 4);
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillStyle = "#dfe3ff"; cx.fillText("LINE 1 — RINGING", w * 0.06, h * 0.18);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#b9c0f0";
      ["Line 2 — idle", "Backup position — staffed", "Status: available"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.18)));
    }, { glow: true, ei: 0.8, px: 320 });
    cyl(consoleMon, 0.06, 0.08, 0.03, 0, 0.04, 0, 0x2b3138, { rough: 0.5, seg: 12 });

    const answerBtn = cyl(desk, 0.045, 0.045, 0.02, -0.72, 0.785, 0.16, 0x59c97b,
      { rough: 0.4, metal: 0.2, seg: 16, emissive: 0x59c97b, ei: 0.7 });
    holoTag(desk, "answer — the line's opening", -0.72, 0.92, 0.16, { css: CLS_CSS, w: 0.52 });
    reg(hits, answerBtn, "call-answer");

    const rolloverBtn = cyl(desk, 0.04, 0.04, 0.02, -0.48, 0.785, 0.26, 0xf2ae14,
      { rough: 0.4, metal: 0.2, seg: 16, emissive: 0xf2ae14, ei: 0.5 });
    holoTag(desk, "roll line 2 to backup", -0.48, 0.9, 0.26, { css: CLS_CSS, w: 0.46 });
    reg(hits, rolloverBtn, "backup-rollover");

    const wrapBtn = cyl(desk, 0.035, 0.035, 0.02, -0.26, 0.785, 0.3, 0xf0645b,
      { rough: 0.4, metal: 0.2, seg: 16, emissive: 0xf0645b, ei: 0.5 });
    holoTag(desk, "wrap it up — handle time?", -0.26, 0.9, 0.3, { css: "#f0645b", w: 0.5 });
    reg(hits, wrapBtn, "wrap-it-up");

    // The line-status selector, turned to "stay connected".
    const holdDial = group(desk, 0.9, 0.78, 0.2, -0.3);
    const holdKnob = cyl(holdDial, 0.055, 0.055, 0.03, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.65, seg: 18 });
    box(holdDial, 0.012, 0.035, 0.05, 0, 0.02, 0.028, CLS_ACCENT,
      { rough: 0.4, emissive: CLS_ACCENT, ei: 0.9 });
    const holdLabel = decal(holdDial, 0.2, 0.06, 0, 0.001, -0.11,
      signFace("RELEASE ON END", { bg: "#111726", accent: CLS_CSS, fg: "#dfe3ff", scale: 0.5 }), { glow: true, ei: 0.5, px: 220 });
    holdLabel.rotation.x = -Math.PI / 2;
    holoTag(desk, "line status", 0.9, 0.94, 0.2, { css: CLS_CSS, w: 0.3 });
    reg(hits, holdKnob, "line-hold-dial");

    // The silence indicator — the line open, nothing on it.
    const silenceBox = instrument(desk, 0.35, 0.78, -0.12, { ry: -0.1, idle: "LINE OPEN", color: CLS_ACCENT, w: 0.17, d: 0.22 });
    holoTag(desk, "hold the silence", 0.35, 0.96, -0.12, { css: CLS_CSS, w: 0.38 });
    reg(hits, silenceBox, "silence-hold");

    // The pacing meter — how the reflecting is actually going.
    const paceMeter = group(desk, 0.05, 0.78, -0.24, 0.1);
    box(paceMeter, 0.26, 0.02, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const paceFace = decal(paceMeter, 0.22, 0.1, 0, 0.012, 0,
      signFace("PACE", { bg: "#101728", accent: CLS_CSS, fg: "#dfe3ff", scale: 0.5 }), { glow: true, ei: 0.7, px: 240 });
    paceFace.rotation.x = -Math.PI / 2;
    holoTag(desk, "call pace", 0.05, 0.96, -0.24, { css: CLS_CSS, w: 0.28 });
    reg(hits, paceMeter, "reflect-pace");

    // ---------------------------------------------------------- the headset
    const headsetHook = group(g, -1.2, 0, -2.42);
    cyl(headsetHook, 0.02, 0.02, 0.9, 0, 0.9, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    box(headsetHook, 0.06, 0.04, 0.12, 0, 1.34, 0.04, 0x2b3138, { rough: 0.5 });
    const headset = group(headsetHook, 0, 1.24, 0.06);
    torus(headset, 0.085, 0.012, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 6, seg2: 20 });
    for (const sx of [-1, 1]) box(headset, 0.05, 0.06, 0.03, sx * 0.085, -0.02, 0, 0x2b3138, { rough: 0.55 });
    cyl(headset, 0.006, 0.006, 0.1, 0.07, -0.06, 0.03, 0x22262b, { rough: 0.5, seg: 8 });
    holoTag(headsetHook, "headset", 0, 1.44, 0.06, { css: CLS_CSS, w: 0.24 });
    reg(hits, headset, "headset");

    // The counsellor, seated at the desk, with the head socket the headset goes to.
    const counsellor = seatedFigure(g, 0, 0.46, -0.45, { skin: 0xbf8a5f, cloth: 0x4c5a74, ry: Math.PI });
    holoTag(g, "you, on the line", 0, 2.08, -0.45, { css: CLS_CSS, w: 0.42 });
    const headSocket = group(counsellor.head, 0, 0.1, 0);
    ball(headSocket, 0.006, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["headset-on-head"] = headSocket;

    // ------------------------------------------------------ prompt card wall
    const cardWall = group(g, 0, 0, -2.5);
    const riskCard = decal(cardWall, 0.56, 0.4, -1.95, 1.52, 0.08,
      paperFace("RISK — ASK IN THESE WORDS", [
        "1  Are you thinking about killing yourself?",
        "2  Have you thought about how?",
        "3  Is that for today?",
      ], { bg: "#eceef8", band: "#4a53a8", scale: 0.9 }), { px: 320 });
    holoTag(cardWall, "risk prompt card", -1.95, 1.78, 0.08, { css: CLS_CSS, w: 0.42 });
    reg(hits, riskCard, "risk-card");

    const RISK_ROWS = [["ask-thoughts", "THOUGHTS", -2.14], ["ask-plan", "METHOD", -1.95], ["ask-timeframe", "TODAY?", -1.76]];
    for (const [id, label, dx] of RISK_ROWS) {
      const chip = decal(cardWall, 0.17, 0.1, dx, 1.2, 0.08,
        signFace(label, { bg: "#131a2c", accent: CLS_CSS, fg: "#dfe3ff", scale: 0.42 }), { px: 180, glow: true, ei: 0.6 });
      reg(hits, chip, id);
    }

    const resourceList = decal(cardWall, 0.56, 0.4, -1.1, 1.52, 0.08,
      paperFace("OPEN TODAY", [
        "Mobile crisis team — 24h",
        "Peer warm line — until 23:00",
        "Youth line — closed Sundays",
      ], { bg: "#eceef8", band: "#4a53a8", scale: 0.9 }), { px: 320 });
    holoTag(cardWall, "today's resource list", -1.1, 1.78, 0.08, { css: CLS_CSS, w: 0.48 });
    reg(hits, resourceList, "resource-list");

    const offScriptCard = decal(cardWall, 0.4, 0.24, -0.3, 1.5, 0.08,
      paperFace("PUT THE SCRIPT DOWN", ["After the opening: their words", "not the next line on the page"],
        { bg: "#e6f0ec", band: "#2f7f66" }), { px: 260 });
    holoTag(cardWall, "off the script", -0.3, 1.68, 0.08, { css: CLS_CSS, w: 0.36 });
    reg(hits, offScriptCard, "off-script-card");

    const adviceCard = decal(cardWall, 0.34, 0.2, -0.3, 1.14, 0.08,
      paperFace("HAVE YOU TRIED", ["\"…going for a walk?\""], { bg: "#f6e6e2", band: "#b8402f" }), { px: 240 });
    holoTag(cardWall, "offer advice instead?", -0.3, 1.3, 0.08, { css: "#f0645b", w: 0.48 });
    reg(hits, adviceCard, "give-advice");

    const stayOnCard = decal(cardWall, 0.4, 0.24, 0.25, 1.5, 0.08,
      paperFace("STAY IN THE SILENCE", ["\"I'm still here. Take your time.\"", "Once — then wait."],
        { bg: "#e6f0ec", band: "#2f7f66" }), { px: 260 });
    holoTag(cardWall, "stay on the line", 0.25, 1.68, 0.08, { css: CLS_CSS, w: 0.4 });
    reg(hits, stayOnCard, "stay-on-line");

    const dispatchCard = decal(cardWall, 0.44, 0.28, 0.85, 1.5, 0.08,
      paperFace("SAY IT BEFORE IT HAPPENS", [
        "Who is coming, and why",
        "What they will see at the door",
        "That you are staying on the line",
      ], { bg: "#eceef8", band: "#4a53a8", scale: 0.92 }), { px: 300 });
    holoTag(cardWall, "telling the caller", 0.85, 1.7, 0.08, { css: CLS_CSS, w: 0.42 });
    reg(hits, dispatchCard, "dispatch-script-card");

    const noDispatchCard = decal(cardWall, 0.36, 0.2, 0.85, 1.12, 0.08,
      paperFace("I'LL NEVER SEND ANYONE", ["\"Whatever you tell me.\""], { bg: "#f6e6e2", band: "#b8402f" }), { px: 240 });
    holoTag(cardWall, "promise no dispatch?", 0.85, 1.28, 0.08, { css: "#f0645b", w: 0.48 });
    reg(hits, noDispatchCard, "promise-no-dispatch");

    // ------------------------------------------------------- safety plan pad
    const planPad = group(g, 1.55, 0, -1.6, -0.55);
    box(planPad, 0.74, 0.74, 0.5, 0, 0.37, 0, CLS_DESK, { rough: 0.6, metal: 0.2 });
    const planSheet = decal(planPad, 0.42, 0.5, 0, 0.765, 0,
      paperFace("SAFETY PLAN — THEIR WORDS", [
        "When it starts, I notice: ____",
        "What has helped before: ____",
        "One person I'll call: ____",
      ], { bg: "#f4f4ec", band: "#4a53a8", scale: 0.82 }), { px: 300 });
    planSheet.rotation.x = -Math.PI / 2;
    holoTag(planPad, "safety plan", 0, 0.94, 0, { css: CLS_CSS, w: 0.32 });
    const PLAN_ROWS = [["plan-warning-signs", -0.14], ["plan-own-steps", 0.0], ["plan-one-person", 0.14]];
    for (const [id, dz] of PLAN_ROWS) {
      const row = box(planPad, 0.34, 0.008, 0.08, 0, 0.768, dz, 0xdde0ec, { rough: 0.7 });
      reg(hits, row, id);
    }
    const skipMeansToggle = box(planPad, 0.1, 0.03, 0.05, 0.26, 0.79, -0.16, 0xf0645b,
      { rough: 0.5, emissive: 0xf0645b, ei: 0.45 });
    holoTag(planPad, "skip the means question?", 0.26, 0.94, -0.16, { css: "#f0645b", w: 0.52 });
    reg(hits, skipMeansToggle, "skip-means-question");

    // ------------------------------------------------------- dispatch console
    const dispatchPost = group(g, 2.5, 0, -0.7, -Math.PI / 2);
    box(dispatchPost, 0.5, 1.1, 0.24, 0, 0.55, 0, 0x4a5360, { rough: 0.6, metal: 0.25 });
    const dispatchGauge = instrument(dispatchPost, 0, 1.16, 0, { idle: "-- risk", color: CLS_ACCENT, w: 0.2, d: 0.26 });
    holoTag(dispatchPost, "imminent-risk threshold", 0, 1.4, 0, { css: CLS_CSS, w: 0.52 });
    reg(hits, dispatchGauge, "dispatch-gauge");
    const quietDispatch = box(dispatchPost, 0.1, 0.04, 0.06, 0.18, 1.14, 0.08, 0xf0645b,
      { rough: 0.5, emissive: 0xf0645b, ei: 0.45 });
    holoTag(dispatchPost, "dispatch without saying?", 0.18, 1.28, 0.08, { css: "#f0645b", w: 0.5 });
    reg(hits, quietDispatch, "silent-dispatch");

    // ---------------------------------------------------------- the record
    const recordMon = group(g, 1.0, 0, -2.3, -0.3);
    cyl(recordMon, 0.04, 0.05, 0.75, 0, 0.38, 0, CITY.darkSteel, { rough: 0.45, metal: 0.55, seg: 12 });
    box(recordMon, 0.5, 0.32, 0.03, 0, 0.94, 0, 0x1e232a, { rough: 0.5, metal: 0.3 });
    const recordFace = decal(recordMon, 0.46, 0.28, 0, 0.94, 0.02, (cx, w, h) => {
      cx.fillStyle = "#0b1020"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = CLS_CSS; cx.fillRect(0, 0, w, 4);
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillStyle = "#dfe3ff"; cx.fillText("CALL RECORD", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#b9c0f0";
      ["Asked · said · planned", "Decision, and the reason for it", "Open"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.18)));
    }, { glow: true, ei: 0.8, px: 320 });
    holoTag(recordMon, "call record", 0, 1.16, 0, { css: CLS_CSS, w: 0.3 });
    reg(hits, recordFace, "call-record");

    // ------------------------------------------------- supervisor / own break
    const supPost = group(g, -2.5, 0, 0.35, Math.PI / 2);
    box(supPost, 0.44, 1.05, 0.22, 0, 0.53, 0, 0x4a5360, { rough: 0.6, metal: 0.25 });
    const supPanel = holoPanel(supPost, 0.6, 0.38, 0, 1.4, 0.02, (cx, w, h) => {
      cx.fillStyle = "rgba(11,16,32,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = CLS_CSS; cx.fillRect(0, 0, w, 5);
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillStyle = "#dfe3ff"; cx.fillText("SUPERVISOR CONSULT", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#b9c0f0";
      cx.fillText("The decision, the doubt, the next time", w * 0.06, h * 0.58);
    }, { accent: CLS_ACCENT });
    reg(hits, supPanel, "supervisor-console");

    const breakBoard = group(g, -2.46, 0, 1.6, Math.PI / 2);
    box(breakBoard, 0.8, 0.5, 0.03, 0, 1.5, 0, 0x33394a, { rough: 0.8 });
    const supplies = decal(breakBoard, 0.34, 0.2, -0.18, 1.5, 0.025,
      paperFace("YOUR BREAK", ["Water at the desk", "Break at 21:40 — on the board"],
        { bg: "#e6f0ec", band: "#2f7f66" }), { px: 260 });
    holoTag(breakBoard, "your own supplies", -0.18, 1.68, 0.03, { css: CLS_CSS, w: 0.42 });
    reg(hits, supplies, "own-supplies");
    const peerCard = decal(breakBoard, 0.34, 0.22, 0.2, 1.5, 0.025,
      paperFace("PEER SUPPORT", [
        "Peer support after a hard call",
        "Employee assistance line",
        "Cumulative exposure is a work hazard",
      ], { bg: "#e6f0ec", band: "#2f7f66", scale: 0.9 }), { px: 280 });
    holoTag(breakBoard, "check in on yourself", 0.2, 1.7, 0.03, { css: CLS_CSS, w: 0.46 });
    reg(hits, peerCard, "peer-support-card");

    // The queue board — real, and not this call's problem.
    const queueBoard = group(g, 1.1, 0, 2.15, -0.62);
    box(queueBoard, 0.7, 0.34, 0.05, 0, 1.6, 0, 0x22262b, { rough: 0.6 });
    const queueFace = decal(queueBoard, 0.64, 0.28, 0, 1.6, 0.035,
      signFace("QUEUE 6\navg 7:20", { bg: "#1a1208", accent: "#f2ae14", fg: "#ffe3b0", scale: 0.3 }), { glow: true, ei: 0.8, px: 300 });
    holoTag(queueBoard, "queue board", 0, 1.82, 0.05, { css: "#f2ae14", w: 0.3 });
    reg(hits, queueFace, "queue-board");

    // The backup counsellor, one desk away, clear of every control.
    const backupDesk = group(g, -1.9, 0, 1.0, 0.5);
    box(backupDesk, 1.0, 0.72, 0.6, 0, 0.36, 0, CLS_DESK, { rough: 0.6, metal: 0.2 });
    box(backupDesk, 1.06, 0.05, 0.66, 0, 0.75, 0, 0x6b7481, { radius: 0.02, rough: 0.5, metal: 0.25 });
    box(backupDesk, 0.34, 0.22, 0.02, -0.2, 0.9, -0.2, 0x1e232a, { rough: 0.5, metal: 0.3 });
    holoTag(backupDesk, "backup position — staffed", 0, 1.16, 0, { css: CLS_CSS, w: 0.52 });
    const backup = standingFigure(g, -1.8, 2.05, { ry: -1.1, cloth: 0x46526a, skin: 0xd0a074 });
    holoTag(g, "backup counsellor", -1.8, 2.12, 2.05, { css: CLS_CSS, w: 0.42 });

    // ------------------------------------------------- the rest of the call room
    // A call room is quiet furniture: chairs, a partition between positions so
    // two counsellors are not talking into each other's headsets, keyboards,
    // a clock somebody keeps looking at, and the shift board by the door.
    const chairFor = (x, z, ry, cloth) => {
      const c = group(g, x, 0, z, ry);
      cyl(c, 0.24, 0.24, 0.05, 0, 0.44, 0, cloth, { rough: 0.7, seg: 16 });
      cyl(c, 0.04, 0.04, 0.4, 0, 0.22, 0, CITY.darkSteel, { rough: 0.45, metal: 0.55, seg: 10 });
      box(c, 0.42, 0.5, 0.06, 0, 0.72, -0.2, cloth, { radius: 0.03, rough: 0.7 });
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        cyl(c, 0.018, 0.018, 0.22, Math.sin(a) * 0.11, 0.05, Math.cos(a) * 0.11, 0x2b3138,
          { rough: 0.6, seg: 6 }).rotation.x = Math.PI / 2;
      }
      return c;
    };
    chairFor(-2.05, 1.35, -0.6, 0x46526a);

    const partition = group(g, -1.05, 0, -0.1, 0.35);
    box(partition, 0.06, 1.35, 1.5, 0, 0.9, 0, 0x4e5769, { rough: 0.96, cast: false });
    box(partition, 0.09, 0.06, 1.56, 0, 1.6, 0, 0x6b7481, { rough: 0.6, metal: 0.3, cast: false });
    for (const pz of [-0.5, 0.5]) cyl(partition, 0.02, 0.02, 0.24, 0, 0.12, pz, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    holoTag(partition, "position divider", 0, 1.74, 0, { css: CLS_CSS, w: 0.4 });

    // Keyboard, mouse, mug and bottle at the counsellor's position.
    const kb = group(desk, -0.1, 0.78, 0.18, 0.05);
    box(kb, 0.4, 0.02, 0.14, 0, 0, 0, 0x22282e, { radius: 0.01, rough: 0.6 });
    box(kb, 0.36, 0.006, 0.1, 0, 0.014, 0, 0x2f363e, { rough: 0.7 });
    box(kb, 0.07, 0.02, 0.1, 0.27, 0, 0.0, 0x22282e, { radius: 0.01, rough: 0.6 });
    cyl(desk, 0.045, 0.04, 0.1, 0.72, 0.83, -0.1, 0xd9dde6, { rough: 0.5, seg: 14 });
    cyl(desk, 0.035, 0.035, 0.22, 0.84, 0.89, 0.1, 0x9fd8ee,
      { rough: 0.25, opacity: 0.55, transparent: true, seg: 14 });
    cyl(desk, 0.032, 0.032, 0.03, 0.84, 1.01, 0.1, 0x3f7f7a, { rough: 0.5, seg: 12 });

    // Under-desk cable tray, because a room reads by its unglamorous parts.
    box(desk, 1.9, 0.05, 0.12, 0, 0.18, -0.3, 0x3b424c, { rough: 0.8, cast: false });
    for (const cz of [-0.6, 0, 0.6]) cyl(desk, 0.012, 0.012, 0.36, cz, 0.36, -0.3, 0x1b1e22, { rough: 0.8, seg: 6 });

    // The backup position's own screen and keyboard.
    box(backupDesk, 0.3, 0.02, 0.12, 0.1, 0.78, 0.1, 0x22282e, { radius: 0.01, rough: 0.6 });
    box(backupDesk, 0.02, 0.2, 0.18, 0.24, 0.86, -0.18, 0x1e232a, { rough: 0.5, metal: 0.3 });
    cyl(backupDesk, 0.04, 0.035, 0.1, -0.38, 0.8, 0.14, 0xd9dde6, { rough: 0.5, seg: 12 });

    // The clock, and the shift board by the door.
    const clock = group(g, -0.9, 0, -2.5);
    cyl(clock, 0.16, 0.16, 0.04, 0, 2.05, 0, 0x22282e, { rough: 0.6, seg: 20 }).rotation.x = Math.PI / 2;
    const clockFace = decal(clock, 0.26, 0.26, 0, 2.05, 0.03,
      signFace("21:14", { bg: "#0f1422", accent: CLS_CSS, fg: "#dfe3ff", scale: 0.38 }), { px: 200, glow: true, ei: 0.7 });
    void clockFace;

    const shiftBoard = group(g, 2.1, 0, 2.1, -0.92);
    box(shiftBoard, 1.0, 0.7, 0.04, 0, 1.5, 0, 0x33394a, { rough: 0.85, cast: false });
    box(shiftBoard, 1.06, 0.05, 0.08, 0, 1.88, 0, 0x6b7481, { rough: 0.6, metal: 0.3, cast: false });
    for (let i = 0; i < 4; i++) {
      decal(shiftBoard, 0.2, 0.14, -0.33 + (i % 2) * 0.45, 1.62 - Math.floor(i / 2) * 0.24, 0.025,
        paperFace(["SHIFT", "BREAKS", "ESCALATE", "DEBRIEF"][i], [], { bg: "#eceef8", band: "#4a53a8" }), { px: 140 });
    }
    holoTag(shiftBoard, "shift board", 0, 1.98, 0.04, { css: CLS_CSS, w: 0.32 });

    let headsetOn = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "headset-fit") {
          headsetOn = true;
          headset.parent.remove(headset);
          headSocket.add(headset);
          headset.position.set(0, 0.02, 0);
          headset.rotation.set(0, 0, 0);
        }
        if (step.id === "answer-opening") {
          repaint(consoleFace, (cx, w, h) => {
            cx.fillStyle = "#0b1020"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 4);
            cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.fillStyle = "#dfe3ff"; cx.fillText("LINE 1 — CONNECTED", w * 0.06, h * 0.18);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#b9c0f0";
            ["Line 2 — idle", "Backup position — staffed", "Status: on a call"]
              .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.18)));
          });
        }
        if (step.id === "dispatch-decision") {
          repaint(dispatchGauge.userData.screen,
            signFace("AT THRESHOLD", { bg: "#1a1208", accent: "#f2ae14", fg: "#ffe3b0", scale: 0.42 }));
        }
        if (step.id === "stay-connected") {
          repaint(holdLabel, signFace("STAY CONNECTED", { bg: "#0d2418", accent: "#59c97b", fg: "#bff7d4", scale: 0.46 }));
        }
        if (step.id === "call-record") {
          repaint(recordFace, (cx, w, h) => {
            cx.fillStyle = "#0b1a14"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 4);
            cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.fillStyle = "#bff7d4"; cx.fillText("CALL RECORD — WRITTEN", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#9fe0bd";
            ["Asked in their own words", "Plan built with the caller", "Decision + the threshold it met"]
              .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.18)));
          });
        }
      },

      onHazard(hitId) {
        if (hitId === "wrap-it-up") wrapBtn.material = mat(0xffd2ce, { emissive: 0xf0645b, ei: 1.6, rough: 0.4 });
      },

      onInterrupt(it) {
        if (it.id === "second-line-rings") {
          rolloverBtn.material = mat(0xffe3b0, { emissive: 0xf2ae14, ei: 2.0, rough: 0.4 });
          queueFace.material.emissiveIntensity = 1.8;
          rolloverBtn.position.y = 0.8;
        }
        if (it.id === "caller-goes-silent") {
          repaint(silenceBox.userData.screen,
            signFace("OPEN — SILENT", { bg: "#111726", accent: "#f2ae14", fg: "#ffe3b0", scale: 0.42 }));
          stayOnCard.material.emissiveIntensity = 1.7;
          paceFace.material.emissiveIntensity = 0.2;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "second-line-rings") {
          rolloverBtn.material = mat(0xf2ae14, { emissive: 0xf2ae14, ei: 0.5, rough: 0.4 });
          queueFace.material.emissiveIntensity = 0.8;
          rolloverBtn.position.y = 0.785;
        }
        if (it.id === "caller-goes-silent") {
          repaint(silenceBox.userData.screen,
            signFace("LINE OPEN", { bg: "#111726", accent: CLS_CSS, fg: "#dfe3ff", scale: 0.42 }));
          stayOnCard.material.emissiveIntensity = 1.0;
          paceFace.material.emissiveIntensity = 0.7;
        }
      },

      animate(t, dt, session) {
        void dt;
        if (session?.turn && session.step?.id === "stay-connected") {
          holdKnob.rotation.y = session.turn.amount * Math.PI * 2;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "dispatch-decision") {
          repaint(dispatchGauge.userData.screen, signFace(
            gg.t < 0.3 ? "below" : gg.t <= 0.52 ? "AT THRESHOLD" : "past it",
            { bg: "#101728", accent: gg.t >= 0.3 && gg.t <= 0.52 ? "#59c97b" : "#f2ae14", fg: "#dfe3ff", scale: 0.42 }));
        }
        counsellor.head.rotation.y = Math.sin(t * 0.35) * 0.05;
        void headsetOn;
      },
    };
  },
};
