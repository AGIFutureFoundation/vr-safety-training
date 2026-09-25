import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat, seatedFigure, standingPerson,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine, CHECKIN_OPTIONS, checkInPrompt } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Difficult Conversation Across Difference VR — Civic
// Leadership and Emotional Intelligence, deepening the programme.
//
// At last week's community meeting the learner — a city neighbourhood-
// services liaison — cut off an older resident mid-testimony and called what
// she was saying "off topic". She speaks English as a second language, she
// is a generation older and she has lived on the block for forty years; she
// heard it as the city telling her community it does not belong in the room.
// She has asked to meet. This time the learner is not the neutral party: the
// conversation is about something the learner did.
//
// Conflict Mediation Room teaches a mediator standing between two people.
// This station is the harder seat, and it runs on the programme's emotional
// intelligence guide (shared/ei-guide.js): the guide's check-in before the
// conversation, a breath to come down from defensive, the listening, a
// de-escalation when her son arrives angry, the repair — what I did, its
// impact, sorry without "if", what I will change — the silence afterwards,
// and the guide's check-in again at the end. Language access is stated as
// Title VI and Title II principles: a qualified interpreter, never a child.
// Every person is invented; the leadership principles are those commonly
// taught in civic-leadership programmes, and the foundation whose principles
// the programme draws on is not sourced in this repository.

const DCV_ACCENT = 0xd98a7a;
const DCV_CSS = "#d98a7a";

export const SIM_CV_DIFFICULT_CONVERSATION_ACROSS_DIFFERENCE = {
  id: "cv-difficult-conversation-across-difference",
  index: "323",
  domain: "Civic",
  trade: "Neighbourhood services liaison — repair conversation",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "overcast",
  certification: "Title VI of the Civil Rights Act of 1964 for meaningful language access in a federally funded city programme — a qualified interpreter, not a family member and never a child; Title II of the ADA for the same access for a resident with a disability; SAMHSA's trauma-informed principles of safety, trustworthiness and transparency, and cultural, historical and gender responsiveness for a resident who has felt dismissed by institutions before; Psychological First Aid (NCTSN and the National Center for PTSD) for calm, practical presence with someone upset; 8 CCR 3203, the employer's Injury and Illness Prevention Program, for how a threat to staff is reported and followed up; SEIU and AFSCME for the city staff who hold these conversations. The emotional-intelligence steps follow the programme's own guide. The leadership principles practised here are those commonly taught in civic-leadership programmes; the foundation whose principles the programme draws on is not sourced in this repository",
  name: "Difficult Conversation Across Difference",
  title: simTitle("Difficult Conversation Across Difference"),
  tagline: "You cut her off last week, and she has asked to meet: your own state named first, a qualified interpreter on the line, her account heard whole, her son's anger met without a counter-attack, an apology with no \"if\" in it — and a change she can hold you to",
  accent: DCV_ACCENT,
  accentCss: DCV_CSS,
  parSeconds: 330,
  footprint: 2.3,
  badge: { id: "owned-it", name: "Owned It", note: "A whole repair conversation held: nothing defended, nobody talked over, and a change promised that can be checked" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your supervisor, your employee assistance line, or the colleague who has had to apologise in public before and will pick up the phone",

  game: system({
    name: "Repair",
    currency: "TRUST",
    ranks: ["Liaison", "Senior Liaison", "Community Lead", "Neighbourhood Manager", "Mentor"],
    badges: [
      { id: "arrived-honest", name: "Arrived Honest", note: "Your own state named before the conversation began", test: AWARD.stepClean("guide-check-in-before") },
      { id: "no-defence", name: "No Defence", note: "No unsafe action anywhere in the conversation", test: AWARD.safe },
      { id: "room-ready", name: "Room Ready", note: "Every part of the room set up for her first time", test: AWARD.stepClean("set-the-room-for-her") },
    ],
    challenges: [
      { id: "clean-repair", name: "Clean Repair", note: "No corrections anywhere in the conversation", test: AWARD.clean },
      { id: "slow-breath", name: "Slow Breath", note: "Your breathing brought inside the band", test: AWARD.precise(0.7) },
      { id: "stayed-present", name: "Stayed Present", note: "Both holds and the de-escalation carried their full count", test: AWARD.unbroken },
    ],
  }),

  hazards: {
    "grandson-interprets": "You let her twelve-year-old grandson interpret. A child cannot be expected to carry his grandmother's anger at the city accurately, it puts adult conflict on a child, and for a programme that takes federal money, language-access guidance under Title VI is clear that a qualified interpreter is provided — not a family member, and never a minor.",
    "open-her-case-file": "You opened her code-enforcement case file and started reading dates aloud with her son in the room. She did not come to discuss that file, it is her private record, and reading it out turns an apology into an ambush — whatever you meant, she now believes you came armed.",
    "defend-yourself": "You told her you were only following the agenda. It may be true, and it is the one sentence that tells her you are here to be right rather than to repair anything. The conversation is now about the agenda rules, and what you did to her — in front of her neighbours — has gone back under the table.",
    "give-personal-cell": "You gave her your personal mobile number and told her to call any time. It feels generous; it makes you the city's only door for her, it will ring at night, and when you are on leave or burnt out it will go unanswered — the next broken promise, this time made by you.",
  },

  lateNotes: {
    "commitment-card": "The commitment goes on the follow-up board once you have apologised and agreed a date — not before you have heard her.",
    "conversation-log-board": "The log closes once the commitment is on the board. There is nothing to record yet.",
  },

  steps: [
    {
      id: "guide-check-in-before", kind: "select", target: "guide-checkin-before",
      title: "Check in with yourself before she arrives",
      cue: "The guide asks how you are arriving. Be honest: name it on the check-in board — defensive, a bit shaken.",
      why: "Most repair conversations go wrong in the first minute, because the person who needs to apologise walks in defended. Naming your own state first — defensive, embarrassed, a little shaken that someone was hurt by you — does not make it go away, but it moves it from driving you to being something you can see. The guide's check-in is not scored; it is there because a liaison who does not notice her own defensiveness will hear every sentence as an attack.",
    },
    {
      id: "slow-your-breath", kind: "gauge", target: "breath-meter",
      title: "Bring your breathing down before you open the door",
      cue: "Commit your breathing inside the band: slow and low, not held and not racing.",
      gauge: {
        label: "BREATHING", speed: 0.6, green: [0.3, 0.5],
        readout: (t) => `${Math.round(4 + t * 16)} breaths/min`,
        missNote: "Outside the band. Racing breath keeps you in fight mode; holding it keeps you tight. Slow, low breaths are what let you listen instead of prepare your defence.",
      },
      why: "A body braced for conflict breathes fast and shallow, and a person breathing that way hears criticism as threat. Slowing the breath for a minute before a hard conversation is one of the few things that reliably brings the body down from fight-or-flight into a state where listening is possible. It is not a ritual; it is the physical half of the emotional check-in, and it shows in the voice she hears when the door opens.",
    },
    {
      id: "set-the-room-for-her", kind: "find", noHint: true,
      targets: ["room-interpreter-line", "room-angled-chairs", "room-water", "room-clear-exit"],
      itemNames: {
        "room-interpreter-line": "a qualified interpreter confirmed on the line",
        "room-angled-chairs": "two chairs at an angle, no desk between you",
        "room-water": "water and tissues within her reach",
        "room-clear-exit": "a clear path to the door for both of you",
      },
      itemNotes: {
        "room-interpreter-line": "She asked to speak in her first language. A qualified interpreter, booked and tested, means she can say exactly what she means — and hear exactly what you say.",
        "room-angled-chairs": "Across a desk is a hearing. Two chairs at an angle say you are here to talk with her, not to process her.",
        "room-water": "It may be hard for her to say, and hard for you to hear. Water and tissues in reach mean nobody has to ask.",
        "room-clear-exit": "Neither of you should feel trapped. A clear path to the door for both is part of her feeling safe — and of yours.",
      },
      decoyNotes: {
        "room-commendation": "Your framed commendation is not preparation. If anything it is a reminder of rank; it will not help her feel heard.",
      },
      title: "Set the room up for her, not for you",
      cue: "Before she comes in, find everything that makes this room work for her.",
      why: "A resident who felt dismissed by the city will read the room for signs it is happening again: whether she will be understood, whether she will sit across a desk like an applicant, whether she can leave. A qualified interpreter tested before she arrives, chairs at an angle with no desk between, water in reach and a clear path to the door answer those questions before either of you speaks — and they cost nothing but five minutes of attention.",
    },
    {
      id: "open-the-conversation", kind: "sequence",
      targets: ["open-thank-her", "open-how-addressed", "open-purpose", "open-how-to-pause"],
      itemNames: {
        "open-thank-her": "thank her for asking to meet",
        "open-how-addressed": "ask how she would like to be addressed",
        "open-purpose": "say why you are here: to hear her, and put right what you did",
        "open-how-to-pause": "agree that either of you can ask to pause",
      },
      title: "Open the conversation in order",
      cue: "Thank her, ask how she would like to be addressed, say why you are here, and agree how to pause.",
      why: "The first minute sets whether this is a repair or a defence. Thanking her for asking to meet recognises that she took the first step; asking how she would like to be addressed, rather than assuming, is a small act of respect across age and culture; naming the purpose plainly — to hear her and put right what you did — tells her you are not here to relitigate; and agreeing how to pause gives both of you a safe way out of a hard moment.",
      outOfOrderNote: "Thank her, ask how to address her, say why you are here, then agree how to pause. Launching into the purpose before you have asked her name tells her the meeting is about your agenda again.",
    },
    {
      id: "hear-her-account", kind: "hold", target: "listen-point", seconds: 8,
      title: "Hear her account of last week, whole",
      cue: "She tells you what it was like to be cut off in front of her neighbours. Hold your attention on her — no explaining, no correcting.",
      why: "She has been carrying this for a week and probably for much longer: being cut off at the meeting landed on top of every other time an institution treated her as a problem to be managed. Listening to all of it through the interpreter — without explaining the agenda, correcting her memory of what you said, or glancing at the clock — is the only way the thing she most needs you to understand will reach you. The explanation, if it matters at all, can come later.",
      holdBreakNote: "You started to explain before she had finished. She stopped. Come back to listening until she is done.",
    },
    {
      id: "reflect-the-impact", kind: "select", target: "reflect-impact-card",
      title: "Reflect back the impact, in her terms",
      cue: "\"What I'm hearing is that when I cut you off, it felt like the city telling you your community doesn't belong in that room.\"",
      why: "A reflection is proof that her words landed, and it has to name the impact she described rather than the intention you had. \"It felt like the city telling your community it does not belong\" is what she said; \"I didn't mean it that way\" is about you. Getting her terms right, and checking with her that you have, is what lets her believe the apology that follows is about what actually happened to her.",
    },
    {
      id: "silence-your-phone", kind: "turn", target: "phone-face",
      title: "Turn your phone face down and silence it",
      cue: "Your phone has lit up twice. Turn it face down on the table.",
      turn: { turns: 0.5, axis: "x", label: "FACE DOWN" },
      why: "Every glance at a phone in a hard conversation says there is something more important than the person in front of you. For a resident who has come to talk about being dismissed, a lit screen on the table is the same message again. Turning it face down, visibly, is a small physical promise that for the next half hour she has all of your attention — and it removes the temptation before it turns into a glance she notices.",
    },
    {
      id: "meet-the-anger", kind: "track", target: "tone-meter", seconds: 8,
      title: "Keep your voice level as the anger rises",
      cue: "Hold your tone inside the band as she gets angrier: low and slow, not rising to match her, not going cold.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.48, fall: 0.4, drift: 0.16, label: "YOUR TONE",
        readout: (v) => (v < 0.3 ? "going cold" : v > 0.7 ? "rising to match" : "low and level"),
      },
      why: "Anger in a repair conversation is information: it tells you how much this mattered. De-escalation is mostly what you do not do — raise your voice to match, talk faster, or retreat into a cold, formal register that sounds like a letter from the city. A low, slow, steady voice, open posture and short sentences keep the conversation going through the anger rather than ending it, and they are much easier to hold if you breathed first.",
      holdBreakNote: "Your tone slipped — rising to meet her, or going cold and formal. Bring it back: low, slow, short sentences.",
    },
    {
      id: "make-the-repair", kind: "sequence",
      targets: ["repair-what-i-did", "repair-its-impact", "repair-sorry-no-if", "repair-what-changes"],
      itemNames: {
        "repair-what-i-did": "name what I did: I cut you off and called it off topic",
        "repair-its-impact": "name its impact: in front of your neighbours, it told you that you did not belong",
        "repair-sorry-no-if": "I am sorry — no \"if\", no \"but\"",
        "repair-what-changes": "what I will change, starting at the next meeting",
      },
      title: "Make the apology in order",
      cue: "What I did, its impact, sorry with no \"if\" or \"but\", and what I will change.",
      why: "An apology that works has a shape. It names what you did without softening it, names the impact in her words, says sorry without \"if you were offended\" or \"but the agenda\", and ends with a change she can watch for — every speaker heard to the bell, community concerns given their own agenda slot. Out of order, it collapses: sorry before naming what you did sounds vague, and the change before the sorry sounds like a policy announcement.",
      outOfOrderNote: "What I did, its impact, sorry with no \"if\", then what changes. Saying sorry before naming what you did leaves her wondering what you are sorry for.",
    },
    {
      id: "hold-the-silence", kind: "hold", target: "silence-point", seconds: 6,
      title: "Let the silence sit after the apology",
      cue: "She does not answer straight away. The guide's mid-conversation check-in: notice the urge to fill it, and hold the silence.",
      why: "After an apology there is usually a silence, and it is the other person deciding what to do with it. Filling it — with more explanation, a second apology, a change of subject — takes that decision away from her. The guide's check-in here is simply to notice the urge to speak and let it pass. Holding six seconds of silence is uncomfortable, and it is often the most respectful thing that happens in the whole conversation.",
      holdBreakNote: "You filled the silence. Whatever she was about to say, she did not. Stop, and give her the quiet back.",
    },
    {
      id: "agree-the-follow-up", kind: "find", noHint: true,
      targets: ["fu-a-date", "fu-her-channel", "fu-named-second"],
      itemNames: {
        "fu-a-date": "a date: \"I'll call you on the fourteenth\"",
        "fu-her-channel": "the way that works for her: through the interpreter line",
        "fu-named-second": "a named second person if you do not call",
      },
      itemNotes: {
        "fu-a-date": "A date she can write on her calendar. \"Soon\" is not a follow-up; the fourteenth is.",
        "fu-her-channel": "A call through the interpreter line, at the time she chose — not an English-only letter from the office.",
        "fu-named-second": "Your supervisor's name, in case you fail. It makes the commitment the office's, not only yours.",
      },
      decoyNotes: {
        "fu-well-see": "\"We'll see how the next meeting goes\" promises nothing she can check. It is how a repair quietly becomes a nice conversation.",
      },
      title: "Agree a follow-up she can hold you to",
      cue: "Mark every part of a follow-up that she could check, and leave out the one that promises nothing.",
      why: "A repair without a follow-up is a nice conversation. A date, a way of reaching her that works for her, and a named second person if you fail to call turn the apology into something she can check. Naming your supervisor is not weakness: it tells her the commitment belongs to the office and not only to you, which matters to someone who has watched individual promises from the city come and go.",
    },
    {
      id: "post-the-commitment", kind: "drag", target: "commitment-card",
      title: "Put your commitment on the office's follow-up board",
      cue: "Carry the commitment card to the team's follow-up board, where your supervisor and colleagues can see it.",
      drag: {
        to: "follow-up-board", radius: 0.55,
        missNote: "Not on the follow-up board. A commitment only you know about disappears the week you are ill or on leave. Put it where the team can see it.",
      },
      why: "A promise that lives in one person's notebook fails the first week that person is ill, on leave or overwhelmed. Putting the commitment on the team's follow-up board — what was promised, to whom, by when — makes it the office's promise, visible to the supervisor and colleagues who can keep it if you cannot. It is also the most honest answer to the burnout trap of carrying every resident's trust alone.",
    },
    {
      id: "close-the-conversation-log", kind: "select", target: "conversation-log-board",
      title: "Log the conversation — the commitment, not her story",
      cue: "Record that the meeting happened, the interpreter used, the commitment and the follow-up date. Not what she told you about her life.",
      why: "The office needs a record that the meeting took place, that a qualified interpreter was used, and what was promised by when — so that the follow-up happens and the change at the next meeting can be checked. It does not need, and should not hold, what she told you about her history with the city. A short, factual log keeps the office accountable without turning her trust into a file.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with your supervisor, and with yourself",
      cue: "The guide's check-in after: how are you doing after that one? Then ten minutes with your supervisor.",
      why: "Apologising for real, in person, to someone you hurt is one of the hardest things a public servant does, and it leaves a mark even when it goes well. The guide's check-in afterwards is unscored and honest: steady, a bit shaken, or needing a minute. Ten minutes with a supervisor — what landed, what to change at the next meeting, whether anything is sticking — and knowing the employee assistance line is there, is how you stay able to have the next one.",
    },
  ],

  interrupts: [
    {
      id: "interpreter-line-drops",
      kind: "Interpreter line lost",
      after: "hear-her-account", delay: 3, seconds: 12,
      alert: "Mid-sentence, the interpreter's line drops. The speakerphone goes silent, and her grandson, sitting by the door, offers to translate instead.",
      cue: "Pause, thank the grandson kindly, and reconnect the qualified interpreter before she goes on.",
      target: "reconnect-interpreter",
      why: "Language access is not a nicety when the conversation is about someone feeling excluded: if she cannot say exactly what she means, the whole meeting repeats the harm. Pausing and reconnecting a qualified interpreter — and thanking the grandson warmly while declining — keeps her words accurate and keeps a child out of an adult conflict with the city, which language-access guidance under Title VI is clear about.",
      missNote: "You carried on through the grandson. He softened what she said about the city, left out the part about her neighbours, and she watched him struggle — the meeting about being unheard ended with her half-heard again.",
      wrongNote: "Listening harder does not bring the interpreter back. Pause, thank the grandson, and reconnect the qualified interpreter.",
    },
    {
      id: "son-arrives-angry",
      kind: "Escalation at the table",
      after: "meet-the-anger", delay: 3, seconds: 12,
      alert: "Her adult son has arrived late, and is standing over the table, raising his voice: \"You people always do this to her.\"",
      cue: "Stay seated, acknowledge him, invite him to sit, and offer a short pause — do not stand up to meet him.",
      target: "invite-to-sit-card",
      why: "A family member arriving angry is protecting someone he loves, and standing up to meet him turns protection into confrontation. Staying seated, acknowledging him by name, inviting him to sit and offering a short pause lowers the temperature for everyone; if it had become a threat, the office's Injury and Illness Prevention Program is how it would be reported and followed up. Here, it is a son who needed to be heard too.",
      missNote: "Nobody addressed him. He stayed standing over the table, his voice rose, his mother stopped speaking to calm him, and the conversation she asked for became a confrontation she had to manage.",
      wrongNote: "Your own tone is not the only thing in the room. He is standing over the table — acknowledge him and invite him to sit.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, DCV_ACCENT);
    // The guide's three check-in answers (shared/ei-guide.js), with the same
    // words as a fallback where the guide module is not loaded.
    const checkinLabels = (typeof CHECKIN_OPTIONS !== "undefined" && Array.isArray(CHECKIN_OPTIONS))
      ? CHECKIN_OPTIONS.map((o) => o.label) : ["Steady", "A bit shaken", "Need a minute"];

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? DCV_ACCENT, { emissive: o.color ?? DCV_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? DCV_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#20120f", accent: o.accent ?? DCV_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? DCV_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const stand = (x, z, ry = 0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.19, 0.21, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.026, 0.026, 1.0, 0, 0.5, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const chair = (x, z, ry, color) => {
      const c = group(g, x, 0, z, ry);
      box(c, 0.48, 0.06, 0.46, 0, 0.46, 0, color, { rough: 0.7 });
      box(c, 0.48, 0.52, 0.05, 0, 0.75, -0.21, color, { rough: 0.7 });
      cyl(c, 0.03, 0.05, 0.44, 0, 0.22, 0, 0x2a2d31, { rough: 0.5, metal: 0.6, seg: 8 });
      return c;
    };
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(28,16,14,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? DCV_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbf1ee";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#e8d0ca";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? DCV_ACCENT, { rough: 0.5, emissive: o.accent ?? DCV_ACCENT, ei: 0.25 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const wrap = (cx, text, x, y, maxW, lh) => {
      let line = "", yy = y;
      for (const word of String(text).split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(test)?.width ?? test.length * lh * 0.45) > maxW && line) { cx.fillText(line, x, yy); line = word; yy += lh; }
        else line = test;
      }
      if (line) cx.fillText(line, x, yy);
    };

    // ------------------------------------------------------------ the meeting room
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 9, base: "#8a7a6a", base2: "#806f60", seam: "rgba(40,30,22,0.3)",
    }), { repeat: 3, px: 384 });
    const floor = box(g, 7.8, 0.02, 6.4, 0, 0.01, -0.5, 0x8a7a6a, { rough: 0.8, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0x968676 });
    const rugTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#6a4a44", base2: "#62423c", seam: "rgba(30,16,14,0.3)",
    }), { repeat: 2, px: 256 });
    const rug = box(g, 2.6, 0.012, 2.0, 0, 0.022, -1.2, 0x6a4a44, { rough: 0.95, cast: false });
    rug.material = texturedMat(rugTex, { rough: 0.95, metal: 0.02, color: 0x7a5a54 });
    const wall = box(g, 7.8, 2.8, 0.1, 0, 1.4, -3.7, 0xe0d6c8, { rough: 0.85 });
    void wall;
    decal(g, 1.2, 0.8, 1.9, 1.7, -3.64, signFace("", { bg: "#9ab8cc", accent: "#f4f4f4", scale: 0.3 }), { px: 64 });
    for (const px of [1.35, 2.45]) box(g, 0.08, 1.9, 0.06, px, 1.5, -3.6, 0xa06a5a, { rough: 0.8 });

    // The desk you are NOT sitting behind, pushed to the side.
    const desk = group(g, -2.4, 0, -2.6, 0.3);
    box(desk, 1.3, 0.05, 0.65, 0, 0.75, 0, 0x7a6248, { rough: 0.6 });
    for (const sx of [-0.6, 0.6]) box(desk, 0.05, 0.73, 0.58, sx, 0.365, 0, 0x5a4a3a, { rough: 0.7 });
    chair(-2.4, -3.1, 0.3, 0x3a3f46);
    const commendation = decal(g, 0.36, 0.28, -2.4, 1.8, -3.64, signFace("COMMENDATION\nSERVICE AWARD", { bg: "#f0e8d8", fg: "#3a2a1a", accent: "#a08040", scale: 0.28 }), { px: 192 });
    reg(hits, commendation, "room-commendation");

    // The two chairs at an angle and the low table between them.
    const myChair = chair(-0.55, -0.7, Math.PI + 0.5, 0x6a5a5a);
    void myChair;
    const herChair = chair(0.55, -1.7, -0.5 + 0.0, 0x6a5a5a);
    holoTag(herChair, "Two chairs at an angle", 0, 1.15, 0, { css: DCV_CSS, w: 0.4 });
    reg(hits, herChair.children[0], "room-angled-chairs");
    const resident = seatedFigure(g, 0.55, 0.49, -1.7, { ry: -0.5, cloth: 0x5a6a8a });
    holoTag(resident.torso, "The resident — asked to meet", 0, 1.38, 0.1, { css: DCV_CSS, w: 0.52 }).rotation.y = 0.5;
    const lowTable = group(g, 0, 0, -1.2);
    cyl(lowTable, 0.4, 0.4, 0.04, 0, 0.45, 0, 0xc8b8a0, { rough: 0.5, seg: 24 });
    cyl(lowTable, 0.05, 0.14, 0.43, 0, 0.215, 0, 0x5a5a5a, { rough: 0.5, metal: 0.4, seg: 10 });
    const water = cyl(lowTable, 0.04, 0.04, 0.16, -0.15, 0.55, 0.12, 0x9fd0e8, { rough: 0.1, metal: 0.1, seg: 12, opacity: 0.6, transparent: true });
    reg(hits, water, "room-water");
    box(lowTable, 0.14, 0.07, 0.09, 0.2, 0.505, 0.15, 0xf2f2f2, { rough: 0.8 });
    // The speakerphone for the interpreter.
    const phoneUnit = group(lowTable, 0.05, 0.47, -0.18);
    cyl(phoneUnit, 0.1, 0.11, 0.035, 0, 0.018, 0, 0x2a2d31, { rough: 0.4, metal: 0.4, seg: 18 });
    const lineLamp = ball(phoneUnit, 0.02, 0, 0.045, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.4, seg: 10 });
    holoTag(phoneUnit, "Qualified interpreter — on the line", 0, 0.3, 0, { css: DCV_CSS, w: 0.6 });
    reg(hits, lineLamp, "room-interpreter-line");
    const lampOn = lineLamp.material;
    const lampOff = mat(0x5a1a1a, { emissive: 0xa02020, ei: 0.8, rough: 0.4 });
    // Your phone on the table.
    const phoneGrp = group(lowTable, -0.22, 0.48, -0.08);
    const myPhone = box(phoneGrp, 0.08, 0.012, 0.15, 0, 0, 0, 0x1b1f24, { rough: 0.4, emissive: 0x7fc4d8, ei: 0.7 });
    holoTag(phoneGrp, "Your phone — lit up", 0, 0.22, 0, { css: DCV_CSS, w: 0.34 });
    reg(hits, myPhone, "phone-face");

    // The door, with a clear path.
    const door = box(g, 0.95, 2.05, 0.06, -3.4, 1.03, -0.6, 0x6a5a4a, { rough: 0.6 });
    door.rotation.y = Math.PI / 2;
    const exitSign = decal(g, 0.3, 0.12, -3.36, 2.2, -0.6, signFace("EXIT", { bg: "#0c3a1c", accent: "#59c97b", scale: 0.6 }), { px: 128, glow: true, ei: 0.8 });
    exitSign.rotation.y = Math.PI / 2;
    holoTag(g, "Clear path to the door", -3.2, 2.45, -0.6, { css: DCV_CSS, w: 0.4 });
    reg(hits, exitSign, "room-clear-exit");
    // The grandson on a chair by the door.
    chair(-2.8, 0.5, Math.PI / 2 + 0.3, 0x5a5f66);
    const grandson = seatedFigure(g, -2.8, 0.42, 0.5, { ry: Math.PI / 2 + 0.3, cloth: 0x3a7a5a, scale: 0.85 });
    holoTag(grandson.torso, "Her grandson, 12", 0, 1.3, 0.1, { css: DCV_CSS, w: 0.32 }).rotation.y = -(Math.PI / 2 + 0.3);

    // ------------------------------------------------------------ the guide's check-in board
    const guide = board(0.9, 0.5, -0.9, 2.1, -3.62, (cx, w, h) => {
      lines(cx, w, h, "GUIDE CHECK-IN", [
        "How are you arriving?",
        checkinLabels.join("  ·  "),
      ], { accent: "#7fc4d8" });
    }, { accent: 0x7fc4d8 });
    reg(hits, guide.userData.face, "guide-checkin-before");
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.12);
    });

    // Breath and tone meters.
    const breathStand = stand(-1.5, 0.3, 0.4);
    const breathGauge = instrument(breathStand, 0, 1.02, 0, { idle: "BREATH", color: DCV_ACCENT, w: 0.2, d: 0.26 });
    holoTag(breathStand, "Your breathing", 0, 1.22, 0, { css: DCV_CSS, w: 0.32 });
    reg(hits, breathGauge, "breath-meter");
    const toneStand = stand(1.5, 0.3, -0.4);
    const toneGauge = instrument(toneStand, 0, 1.02, 0, { idle: "TONE", color: DCV_ACCENT, w: 0.2, d: 0.26 });
    holoTag(toneStand, "Your tone", 0, 1.22, 0, { css: DCV_CSS, w: 0.26 });
    reg(hits, toneGauge, "tone-meter");

    // Listening and silence points, the reflection and follow-up cards.
    bead(0.95, 1.5, -1.35, "listen-point", "Hear her whole", { w: 0.32 });
    bead(0.2, 1.7, -1.9, "silence-point", "Let the silence sit", { w: 0.36 });
    card(-0.9, 1.4, -0.3, "reflect-impact-card", "Reflect the impact, in her terms", "WHAT I'M\nHEARING...", { w: 0.6, ry: 0.3 });
    board(0.56, 0.36, 0.95, 1.95, -0.05, (cx, w, h) => lines(cx, w, h, "FOLLOW-UP", ["Tap what she can hold you to"]), { ry: -0.4 });
    const fu = group(g, 0.8, 0, 0.2, -0.4);
    for (const [fid, label, y, c] of [
      ["fu-a-date", "Call on the 14th", 1.56, DCV_ACCENT], ["fu-her-channel", "Through the interpreter line", 1.38, DCV_ACCENT],
      ["fu-named-second", "Supervisor named", 1.2, DCV_ACCENT], ["fu-well-see", "\"We'll see how it goes\"", 1.02, 0x7fc4d8],
    ]) {
      const b = ball(fu, 0.022, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(fu, label, 0.3, y, 0, { css: DCV_CSS, w: 0.5 });
      reg(hits, b, fid);
    }
    card(-2.0, 1.35, -0.6, "reconnect-interpreter", "Pause · reconnect the interpreter", "RECONNECT\nINTERPRETER", { w: 0.6, ry: 0.7, accent: "#f2c14b", css: "#f2c14b" });
    card(2.2, 1.35, -0.7, "invite-to-sit-card", "Stay seated · invite him to sit", "PLEASE,\nSIT WITH US", { w: 0.56, ry: -0.7, accent: "#f2c14b", css: "#f2c14b" });

    // The opening and repair ladders.
    const opening = group(g, -2.7, 0, -1.6, 0.8);
    cyl(opening, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [oid, label, y] of [
      ["open-thank-her", "1 · Thank her", 0.75], ["open-how-addressed", "2 · How to address her", 1.05],
      ["open-purpose", "3 · Why I'm here", 1.35], ["open-how-to-pause", "4 · How to pause", 1.65],
    ]) {
      const b = ball(opening, 0.026, 0, y, 0, DCV_ACCENT, { emissive: DCV_ACCENT, ei: 1.5, seg: 12 });
      holoTag(opening, label, 0.2, y, 0, { css: DCV_CSS, w: 0.44 });
      reg(hits, b, oid);
    }
    const repair = group(g, 2.7, 0, -1.6, -0.8);
    cyl(repair, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [rid, label, y] of [
      ["repair-what-i-did", "1 · What I did", 0.75], ["repair-its-impact", "2 · Its impact", 1.05],
      ["repair-sorry-no-if", "3 · Sorry — no \"if\"", 1.35], ["repair-what-changes", "4 · What changes", 1.65],
    ]) {
      const b = ball(repair, 0.026, 0, y, 0, DCV_ACCENT, { emissive: DCV_ACCENT, ei: 1.5, seg: 12 });
      holoTag(repair, label, 0.2, y, 0, { css: DCV_CSS, w: 0.4 });
      reg(hits, b, rid);
    }

    // The commitment card and the office's follow-up board.
    const side = group(g, 1.4, 0, 1.0);
    box(side, 0.5, 0.05, 0.4, 0, 0.7, 0, 0xd8d0c0, { rough: 0.5 });
    cyl(side, 0.03, 0.03, 0.68, 0, 0.34, 0, 0x5a5a5a, { rough: 0.5, metal: 0.4, seg: 8 });
    const commitGrp = group(g, 1.4, 0.76, 1.0);
    const commitment = decal(commitGrp, 0.28, 0.16, 0, 0, 0, signFace("EVERY SPEAKER\nTO THE BELL", { bg: "#f6ece8", fg: "#3a1a14", accent: DCV_CSS, scale: 0.32 }), { px: 192 });
    commitment.rotation.x = -Math.PI / 2.3;
    holoTag(commitGrp, "Your commitment", 0, 0.18, 0, { css: DCV_CSS, w: 0.32 });
    reg(hits, commitment, "commitment-card");
    const followBoard = board(0.62, 0.44, 3.2, 1.6, 0.6, (cx, w, h) => lines(cx, w, h, "TEAM FOLLOW-UP BOARD", ["What · to whom · by when"]), { ry: -1.2 });
    reg(hits, followBoard.userData.face, "follow-up-board");

    // ------------------------------------------------------------ the son
    const sonStanding = standingPerson(g, 1.1, -0.4, { ry: Math.PI + 0.9, cloth: 0x4a3a2a, hiVis: false });
    sonStanding.root.visible = false;
    chair(1.3, -2.3, -0.3, 0x5a5f66);
    const sonSeated = seatedFigure(g, 1.3, 0.49, -2.3, { ry: -0.3, cloth: 0x4a3a2a });
    sonSeated.root.visible = false;

    // ------------------------------------------------------------ the wrong moves
    card(-0.1, 1.2, 0.5, "grandson-interprets", "Let the grandson interpret?", "HE CAN\nTRANSLATE", {
      w: 0.5, ry: 0, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    const caseFile = box(g, 0.24, 0.05, 0.32, -2.2, 0.8, -2.5, 0xb89a5a, { rough: 0.8 });
    holoTag(g, "Open her case file?", -2.2, 1.05, -2.5, { css: "#f0645b", w: 0.38 });
    reg(hits, caseFile, "open-her-case-file");
    bead(-0.5, 1.25, -1.9, "defend-yourself", "\"I was just following the agenda\"", { color: 0xf0645b, css: "#f0645b", w: 0.6 });
    card(0.6, 1.2, 1.2, "give-personal-cell", "Give her your personal cell?", "CALL ME\nANY TIME", {
      w: 0.5, ry: -0.2, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });

    // ------------------------------------------------------------ closing boards
    const log = board(0.56, 0.4, 2.3, 1.95, 1.9, (cx, w, h) => lines(cx, w, h, "CONVERSATION LOG", [
      "Met · interpreter used", "Commitment · follow-up date",
    ]), { ry: -0.6 });
    reg(hits, log.userData.face, "conversation-log-board");
    const checkin = board(0.56, 0.4, -2.3, 1.95, 1.9, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", [
      "How are you after that one?", checkinLabels.join(" · "),
    ], { accent: "#7fc4d8" }), { ry: 0.6, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // ------------------------------------------------------------ the supervisor
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const supervisor = standingFigure(g, -0.9, 2.2, { ry: 2.8, cloth: 0x3a3a4a, trousers: 0x262d36 });
    holoTag(supervisor, "Your supervisor", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.32 }).rotation.y = -2.8;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0.3, 1.0, -1.6),

      onStepComplete(step) {
        if (step.id === "guide-check-in-before") {
          paintGuide("Named: a bit defensive, a bit shaken. That is allowed. Breathe, then open the door.");
        }
        if (step.id === "silence-your-phone") {
          phoneGrp.rotation.x = Math.PI;
          myPhone.material = mat(0x1b1f24, { rough: 0.4 });
        }
        if (step.id === "post-the-commitment") commitGrp.position.set(3.15, 1.55, 0.62);
        if (step.id === "close-the-conversation-log") {
          repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "CONVERSATION LOGGED", ["Follow-up on the 14th", "On the team board"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
          paintGuide(typeof checkInPrompt === "function" ? checkInPrompt({ rough: false }) : "How are you doing after that run?");
        }
      },

      onHazard(id, s) {
        if (id === "defend-yourself" || id === "open-her-case-file" || id === "grandson-interprets") {
          resident.root.rotation.y = -0.5 + 0.9;
          resident.head.rotation.x = 0.3;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. This is about what she lived, not what you meant.");
        }
      },

      onInterrupt(it) {
        if (it.id === "interpreter-line-drops") {
          lineLamp.material = lampOff;
          grandson.arms[1].shoulder.rotation.x = -1.2;
        }
        if (it.id === "son-arrives-angry") {
          sonStanding.root.visible = true;
          sonStanding.arms[0].shoulder.rotation.x = -1.3;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "interpreter-line-drops") {
          lineLamp.material = lampOn;
          grandson.arms[1].shoulder.rotation.x = 0;
        }
        if (it.id === "son-arrives-angry") {
          sonStanding.root.visible = false;
          sonSeated.root.visible = true;
        }
      },

      animate(t, dt, session) {
        resident.head.rotation.y = Math.sin(t * 0.4) * 0.06;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "slow-your-breath") {
          const ok = gg.t >= 0.3 && gg.t <= 0.5;
          repaint(breathGauge.userData.screen, signFace(`${Math.round(4 + gg.t * 16)} / MIN`, {
            bg: "#20120f", accent: ok ? "#59c97b" : "#f0645b", fg: "#fbf1ee", scale: 0.52,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "meet-the-anger" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(toneGauge.userData.screen, signFace(ok ? "LEVEL" : tr.v < 0.3 ? "COLD" : "RISING", {
            bg: "#20120f", accent: ok ? "#59c97b" : "#f0645b", fg: "#fbf1ee", scale: 0.5,
          }));
        }
      },
    };
  },
};
