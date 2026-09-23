import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat, seatedFigure, standingPerson,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Public Meeting Chair VR — Civic Leadership and Emotional
// Intelligence, station one.
//
// The learner chairs a regular meeting of a local legislative body: a
// five-seat dais, a speaker's podium, a clerk, a gallery of residents and a
// broadcast. The law it runs under is the Ralph M. Brown Act — the posted
// agenda, the public's right to speak, action only on what was noticed, no
// serial meetings of a majority — and the procedure is Robert's Rules of
// Order, which is a practice the body adopts in its own rules, not a law.
//
// The principles it practises — listen first, bring people in rather than
// shut them out, count the votes before the vote without counting them in
// private — are principles commonly taught in civic-leadership programmes;
// the foundation whose principles the module draws on is not sourced in this
// repository, and nothing here quotes or speaks for it or for any person.
// Sited generically: no real city, council or member.

const PMC_ACCENT = 0xc9a34a;
const PMC_CSS = "#c9a34a";

export const SIM_PUBLIC_MEETING_CHAIR = {
  id: "public-meeting-chair",
  index: "217",
  domain: "Civic",
  trade: "Presiding officer — council or commission chair",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "overcast",
  certification: "The Ralph M. Brown Act (California Government Code section 54950 and following) for the posted agenda, public comment and the bar on serial meetings; Robert's Rules of Order as the parliamentary authority the body adopts in its own rules — a practice, not a law; Title II of the ADA for interpreters, captions and an accessible room; the Political Reform Act and the city ethics code for a gift from anyone with business before the body; SAMHSA's trauma-informed care principles for residents who testify about harm; SEIU and AFSCME for the clerks and staff who run the room. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
  name: "Public Meeting Chair",
  title: simTitle("Public Meeting Chair"),
  tagline: "Chair a public meeting people trust: notice checked, the room live, every speaker heard to the bell, a late item sent to the next agenda, order kept without a heavy gavel — and every vote stated out loud",
  accent: PMC_ACCENT,
  accentCss: PMC_CSS,
  parSeconds: 330,
  footprint: 2.4,
  badge: { id: "gavel-held-lightly", name: "Gavel Held Lightly", note: "A whole meeting chaired in the open: every speaker heard, nothing acted on that was not noticed, and each vote announced" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your employee assistance program, or the colleague who has chaired a hard meeting before and will pick up the phone",

  game: system({
    name: "Open Chamber",
    currency: "TRUST",
    ranks: ["Member", "Vice Chair", "Chair", "Presiding Officer", "Mentor Chair"],
    badges: [
      { id: "noticed-right", name: "Noticed Right", note: "Every notice condition confirmed before the gavel came down", test: AWARD.stepClean("read-the-notice") },
      { id: "never-cut-off", name: "Never Cut Off", note: "No unsafe action anywhere in the meeting", test: AWARD.safe },
      { id: "steady-chair", name: "Steady Chair", note: "The speaker's time and the room's order both carried their full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-minutes", name: "Clean Minutes", note: "No corrections anywhere in the meeting", test: AWARD.clean },
      { id: "even-clock", name: "Even Clock", note: "Speaker time set inside the band", test: AWARD.precise(0.7) },
      { id: "nine-straight", name: "Nine Straight", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "cut-off-speaker": "You cut in on a resident mid-sentence to correct her figures. The time was hers, the facts can be answered by staff afterwards, and a chair who talks over the public teaches the whole gallery that the podium is a formality — the next resident edits herself before she even starts.",
    "promise-from-dais": "You promised from the dais that the road would be fixed next month. That item is not on tonight's agenda, the money is not yours alone to move, and a promise the body has not voted on is a promise it can break — the resident will remember who made it.",
    "sidebar-huddle": "You stepped off the dais to talk the item over with two colleagues. Three of five is a majority of this body, and a majority deliberating out of the public's hearing is exactly what the open-meeting law forbids, recess or no recess.",
    "applicant-gift": "You took the gift bag from the applicant whose permit is on tonight's agenda. A gift from somebody with business before the body is reportable at best and disqualifying at worst, and the gallery watched it change hands.",
  },

  lateNotes: {
    "late-item-card": "The late item gets handled when it is raised, not before — first hear the speaker who is at the podium now.",
    "minutes-log-board": "The minutes close once the vote is announced and the correspondence has been checked; there is nothing to record yet.",
  },

  steps: [
    {
      id: "read-the-notice", kind: "find", noHint: true,
      targets: ["notice-agenda-posted", "notice-interpreter", "notice-comment-cards"],
      itemNames: {
        "notice-agenda-posted": "the agenda, posted in public three days out",
        "notice-interpreter": "the interpreter and captions somebody asked for",
        "notice-comment-cards": "speaker cards at the door",
      },
      itemNotes: {
        "notice-agenda-posted": "Posted where anyone can read it, seventy-two hours before a regular meeting. Everything the body acts on tonight has to be on that sheet.",
        "notice-interpreter": "A resident asked in advance for an interpreter and live captions. The meeting is not open to her unless they are both here and working.",
        "notice-comment-cards": "Cards at the door let people ask to speak without having to catch the chair's eye — and nobody is required to give a name to be heard.",
      },
      decoyNotes: {
        "notice-parking-sign": "Validated parking is a courtesy. It is not part of whether this meeting was properly noticed or whether the public can take part in it.",
      },
      title: "Confirm the meeting is properly open before you sit down",
      cue: "Look around the chamber. Three things decide whether this meeting is open to the public at all.",
      why: "A meeting that was not noticed properly, that a resident who asked for an interpreter cannot follow, or that gives people no way to ask to speak is not an open meeting whatever the minutes later say. Every action taken at it is exposed to challenge, and more to the point, the residents who were shut out know it. The chair checks before the gavel, not after a complaint.",
    },
    {
      id: "go-live", kind: "turn", target: "broadcast-knob",
      title: "Bring the room mics and the broadcast live",
      cue: "Turn the chamber console up — the room, the captions and the stream all run off it.",
      turn: { turns: 0.6, axis: "y", label: "ROOM + STREAM" },
      why: "The public who could not get off work tonight are watching the stream, and the captioner is working from the same feed. A chair who starts talking before the mics are live has opened the meeting to the people in the room and nobody else — and the first thing the stream records is somebody asking whether it has started.",
    },
    {
      id: "call-to-order", kind: "select", target: "roll-call-card",
      title: "Call to order, take the roll, confirm a quorum",
      cue: "Gavel once, call the roll aloud, and say that a quorum is present.",
      why: "Nothing the body does counts without a quorum, and the roll called out loud is how the room and the record both know who is here to vote. It is also the first time the public hears each member's name tonight, which matters: a resident who wants to follow up needs to know who was in the seat when the vote was taken.",
    },
    {
      id: "run-the-item", kind: "sequence",
      targets: ["item-staff-report", "item-public-comment", "item-motion-second", "item-debate-vote"],
      itemNames: {
        "item-staff-report": "staff report — what is being decided",
        "item-public-comment": "public comment on the item",
        "item-motion-second": "a motion and a second",
        "item-debate-vote": "debate, then the vote",
      },
      title: "Take the item in the order the rules set",
      cue: "Staff first, then the public, then a motion and a second, then debate and the vote.",
      why: "The order is the fairness. Staff explains what is actually on the table so the public comment is about the real proposal; the public speaks before a motion exists, while minds can still change; a motion and a second prove at least two members want to act; debate happens on something specific. Robert's Rules is only the body's adopted practice, but a chair who skips around in it tells the room the outcome was settled somewhere else.",
      outOfOrderNote: "Staff report, public comment, motion and second, then debate and the vote. Taking a motion before the public has spoken tells every speaker that they are addressing a decision already made.",
    },
    {
      id: "set-speaker-time", kind: "gauge", target: "comment-timer",
      title: "Set one speaker time and apply it to everyone",
      cue: "Set the podium timer inside the band the body's rules allow — then it is the same for every speaker.",
      gauge: {
        label: "SPEAKER TIME", speed: 0.6, green: [0.27, 0.46],
        readout: (t) => `${(0.5 + t * 5.5).toFixed(1)} min`,
        missNote: "Outside the band. Too short and a resident cannot finish a thought; too long with a full gallery and the last speakers go home unheard. Set it inside the rules and hold it for everyone.",
      },
      why: "A reasonable time limit is allowed; an uneven one is not. The same clock for the neighbour you agree with and the one who has come to shout at you is what makes the limit defensible, and it is what lets the last speaker on a long night believe she is being treated like the first. The chair sets it once, says it out loud, and does not bend it for friends.",
    },
    {
      id: "hear-the-speaker", kind: "hold", target: "listen-point", seconds: 8,
      title: "Hear the speaker to the bell",
      cue: "Hold your attention on the podium. Do not respond, do not correct, do not look at your phone.",
      why: "Listening first is the whole job at this moment. The resident has waited two hours and has two and a half minutes; the respect in the room is set by whether the chair is visibly hearing her. Corrections and answers come from staff afterwards, on the record, where they can be checked — not from the dais in the middle of her time, where they read as an argument she is not allowed to win.",
      holdBreakNote: "You looked away from the podium mid-sentence. She saw it, and so did the gallery. Bring your attention back and give her the rest of her time.",
    },
    {
      id: "refer-late-item", kind: "drag", target: "late-item-card",
      title: "Send the late request to a future agenda",
      cue: "A member wants to act tonight on something that was not posted. Move it to the future-agenda tray.",
      drag: {
        to: "future-agenda-tray", radius: 0.6,
        missNote: "Not in the tray. An item that was not on the posted agenda can be raised, briefly answered by staff and scheduled — it cannot be deliberated or acted on tonight.",
      },
      why: "The public read the posted agenda to decide whether to come. Acting tonight on something that was not on it takes a decision in front of people who were told it was not happening — and the neighbours who stayed home because it was not listed are the ones it affects. Referring it to a noticed future meeting is how the body keeps faith with the agenda it published.",
    },
    {
      id: "thank-the-critic", kind: "select", target: "critic-reply-card",
      title: "Thank a critical speaker and route the question",
      cue: "A speaker has just criticised the council by name. Thank her, ask staff to follow up, and move on.",
      why: "The open-meeting law protects criticism of the body and its policies, and the chair's job is to make that protection real in the room. Thanking the critic, asking staff to answer the factual question in writing and moving on shows the gallery that the podium is safe for the people who disagree with you — which is the only way a chair ever hears the thing they most need to hear.",
    },
    {
      id: "keep-order", kind: "track", target: "order-meter", seconds: 8,
      title: "Keep the room in order through a heated item",
      cue: "Hold the room inside the band: firm enough that speakers can be heard, light enough that nobody is gavelled for clapping.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.48, fall: 0.4, drift: 0.16, label: "ORDER",
        readout: (v) => (v < 0.3 ? "too loose" : v > 0.7 ? "heavy-handed" : "order held"),
      },
      why: "Order is a band, not a switch. Let it slip and the loudest people in the gallery decide who gets heard; clamp down too hard and the chair is gavelling residents for applause, which the room remembers longer than the item. The skill is continuous and quiet — a look, a reminder of the rules, the same tone for everyone — so that the gavel is almost never needed.",
      holdBreakNote: "The room got away from you, one way or the other. Bring it back to the band with the same tone for everyone — not louder, and not by pretending it is not happening.",
    },
    {
      id: "announce-the-vote", kind: "sequence", anyOrder: true,
      targets: ["vote-ayes", "vote-noes", "vote-abstain"],
      itemNames: {
        "vote-ayes": "who voted aye, by name",
        "vote-noes": "who voted no, by name",
        "vote-abstain": "who abstained or stepped out, and why",
      },
      title: "State the vote of every member aloud",
      cue: "Announce the result so the room and the stream both hear how each member voted.",
      why: "The public is entitled to know how each member voted, and the only place that becomes real is the chair's voice at the moment of the vote. \"Motion carries\" tells the gallery nothing about who to thank or who to call; names in the record do. An abstention or a recusal is announced with its reason, so nobody has to guess whether a member simply did not want to be counted.",
    },
    {
      id: "spot-the-serial-meeting", kind: "find", noHint: true,
      targets: ["serial-reply-all", "serial-hub-spoke", "serial-dinner-three"],
      itemNames: {
        "serial-reply-all": "a reply-all thread among three members",
        "serial-hub-spoke": "staff carrying each member's position to the others",
        "serial-dinner-three": "three members at dinner discussing the item",
      },
      itemNotes: {
        "serial-reply-all": "Three of five members replying to each other about how to vote is a majority deliberating by email — a meeting nobody noticed.",
        "serial-hub-spoke": "A staffer who polls each member and reports the count back to the others is the hub of a serial meeting, even if no two members ever speak.",
        "serial-dinner-three": "A dinner is fine. A majority of the body discussing tomorrow's item over it is not.",
      },
      decoyNotes: {
        "serial-posted-memo": "A staff memo sent to every member and posted with the agenda packet is exactly how information is supposed to reach a body — in the open, for the public too.",
      },
      title: "Check the correspondence file for anything that was a meeting in disguise",
      cue: "Read the file the clerk hands you. Mark every contact that became a meeting of a majority outside the room.",
      why: "Counting the votes before the vote is a leadership skill, and done in public it is simply listening to colleagues on the record. Done by polling a majority privately — by email chain, by a staffer carrying positions between offices, over dinner — it is a serial meeting, and it hollows out everything the public just watched. The chair is the person who has to notice and say so.",
    },
    {
      id: "close-the-minutes", kind: "select", target: "minutes-log-board",
      title: "Close the meeting and log the action minutes",
      cue: "Adjourn, then give the clerk the actions, the votes by name and the items referred to future agendas.",
      why: "The minutes are what the meeting was, for everybody who was not in the room and for whoever reads them in three years. Actions, each member's vote, the late item referred rather than acted on, and a fair note of who spoke are the record a resident can hold the body to. A chair who leaves them for the clerk to reconstruct has left the most important part of the meeting to memory.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the clerk before you leave",
      cue: "Two minutes at the clerk's table: how did that meeting land on both of you?",
      why: "A heated meeting lands on the staff who ran it as much as on the chair, and the clerk sat through every word of the outburst too. Asking how it landed, and naming the employee assistance line if it stays with either of you, is the difference between a support programme that exists on paper and one that people actually use after a night like this.",
    },
  ],

  interrupts: [
    {
      id: "side-conversation-on-dais",
      kind: "Private conversation on the dais",
      after: "hear-the-speaker", delay: 3, seconds: 12,
      alert: "While the resident is speaking, the member beside you has turned to her neighbour and passed a folded note about how to vote on the item.",
      cue: "Bring it onto the record: ask the members to hold their discussion for deliberation, in public.",
      target: "side-talk-gavel",
      why: "A private exchange on the dais about the item is deliberation the public cannot hear, happening while a resident is addressing the body — both a discourtesy to her and a small version of the serial meeting the law forbids. Naming it lightly and asking members to save it for deliberation keeps the conversation in the room where it belongs.",
      missNote: "The note went back and forth for the rest of her time. She finished speaking to two members who were not listening, the gallery saw a decision being made in whispers, and nothing about it will ever be in the minutes.",
      wrongNote: "Not the podium — the speaker is doing nothing wrong. The side conversation is on the dais; address the members, lightly, and give the resident her time back.",
    },
    {
      id: "gallery-outburst",
      kind: "Disruption in the gallery",
      after: "keep-order", delay: 3, seconds: 12,
      alert: "A man in the gallery has stood up and is shouting over the speaker at the podium, pointing at the dais.",
      cue: "Warn once from the chair, in the rules' words, and offer a short recess — do not trade shouts.",
      target: "warning-recess-card",
      why: "The body may act against a disruption that actually prevents the meeting from going on, and the fair way to do it is graduated: one clear warning in the words of the adopted rules, a short recess if it continues, and removal only as the last step. Answering shout for shout makes the chair a participant, and it teaches the gallery that volume is how you get the floor.",
      missNote: "The shouting ran on over the resident at the podium until she gave up and sat down. The meeting did not stop; it just stopped being a meeting anybody could take part in, and the chair was the only person with the standing to say so.",
      wrongNote: "Turning the order meter is not a response to one person shouting. Use the warning in the rules — then the recess if it continues.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, PMC_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? PMC_ACCENT, { emissive: o.color ?? PMC_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? PMC_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1d1709", accent: o.accent ?? PMC_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? PMC_CSS, w: o.w ?? 0.48 });
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
      box(c, 0.46, 0.06, 0.44, 0, 0.46, 0, color, { rough: 0.7 });
      box(c, 0.46, 0.5, 0.05, 0, 0.74, -0.2, color, { rough: 0.7 });
      cyl(c, 0.03, 0.05, 0.44, 0, 0.22, 0, 0x2a2d31, { rough: 0.5, metal: 0.6, seg: 8 });
      return c;
    };
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(22,17,8,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? PMC_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbf3df";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#e2d6b8";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    // A board is a printed face on a backing plate: two meshes, repaintable
    // through userData.face like a holoPanel.
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? PMC_ACCENT, { rough: 0.5, emissive: o.accent ?? PMC_ACCENT, ei: 0.25 });
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

    // ------------------------------------------------------------ the chamber floor
    const carpetTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 10, base: "#3b2f2a", base2: "#33282a", seam: "rgba(20,12,10,0.35)",
    }), { repeat: 3, px: 384 });
    const carpet = box(g, 8.4, 0.02, 6.6, 0, 0.008, -0.5, 0x3b2f2a, { rough: 0.95, cast: false });
    carpet.material = texturedMat(carpetTex, { rough: 0.95, metal: 0.02, color: 0x3b2f2a });

    // ------------------------------------------------------------ the dais
    const woodTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#6b4a2e", base2: "#5d4028", seam: "rgba(30,18,8,0.5)",
    }), { repeat: 2, px: 320 });
    box(g, 6.0, 0.24, 1.7, 0, 0.12, -2.75, 0x4a3a2c, { rough: 0.8 });                 // platform
    const daisFront = box(g, 5.4, 0.92, 0.08, 0, 0.7, -2.0, 0x6b4a2e, { rough: 0.7 });
    daisFront.material = texturedMat(woodTex, { rough: 0.7, metal: 0.03, color: 0x8a6440 });
    box(g, 5.5, 0.05, 0.62, 0, 1.18, -2.28, 0x7a5638, { rough: 0.55 });              // desk top
    box(g, 6.0, 1.3, 0.06, 0, 0.9, -3.62, 0x2d3440, { rough: 0.8 });                 // back panel
    const seal = decal(g, 0.9, 0.9, 0, 1.95, -3.58, (cx, w, h) => {
      cx.fillStyle = "#1a2230"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = PMC_CSS; cx.lineWidth = w * 0.04;
      cx.beginPath?.(); cx.arc?.(w / 2, h / 2, w * 0.4, 0, Math.PI * 2); cx.stroke?.();
      cx.fillStyle = "#e9dcb8"; cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CITY OF", w / 2, h * 0.42); cx.fillText("THE COMMONS", w / 2, h * 0.56);
    }, { px: 256, glow: true, ei: 0.4 });
    void seal;

    // Members at the dais: four seated, the chair's seat empty for the learner.
    const members = [];
    for (const [mx, cloth] of [[-2.0, 0x3c4a5c], [-1.0, 0x5c3c48], [1.0, 0x3f5a4a], [2.0, 0x4d4a3c]]) {
      box(g, 0.5, 0.8, 0.06, mx, 0.95, -3.02, 0x2f3540, { rough: 0.7 });           // chair back
      const m = seatedFigure(g, mx, 0.7, -2.72, { ry: 0, cloth });
      members.push(m);
      decal(g, 0.36, 0.09, mx, 1.0, -1.955, signFace("MEMBER", { bg: "#221a0e", accent: PMC_CSS, scale: 0.55 }), { px: 128 });
    }
    box(g, 0.5, 0.9, 0.06, 0, 1.0, -3.02, 0x4a3a22, { rough: 0.7 });
    decal(g, 0.36, 0.09, 0, 1.0, -1.955, signFace("CHAIR", { bg: "#221a0e", accent: PMC_CSS, scale: 0.55 }), { px: 128 });
    // The gavel and its block, on the chair's place.
    box(g, 0.14, 0.03, 0.14, 0.3, 1.22, -2.2, 0x4a3020, { rough: 0.5 });
    const gavelHead = cyl(g, 0.03, 0.03, 0.12, 0.42, 1.25, -2.2, 0x5a3a24, { rough: 0.45, seg: 10 });
    gavelHead.rotation.z = Math.PI / 2;

    // The broadcast console at the chair's left.
    const consoleGrp = group(g, -0.5, 1.2, -2.2);
    box(consoleGrp, 0.22, 0.05, 0.16, 0, 0.02, 0, 0x22262c, { rough: 0.5 });
    const knob = cyl(consoleGrp, 0.035, 0.035, 0.035, 0, 0.06, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 12 });
    holoTag(consoleGrp, "Room mics + stream", 0, 0.2, 0, { css: PMC_CSS, w: 0.4 });
    reg(hits, knob, "broadcast-knob");
    const liveLamp = ball(consoleGrp, 0.018, 0.08, 0.05, 0.05, 0x5a2020, { rough: 0.4, seg: 10 });

    // Roll call and the side-talk control on the dais.
    card(0.9, 1.45, -2.1, "roll-call-card", "Call to order · roll · quorum", "ROLL CALL", { w: 0.56 });
    bead(-1.5, 1.5, -2.05, "side-talk-gavel", "Hold it for deliberation", { color: 0xf2c14b, css: "#f2c14b", w: 0.52 });

    // The applicant's gift bag, on the dais where it was left.
    const gift = group(g, 1.55, 1.2, -2.2);
    box(gift, 0.2, 0.22, 0.1, 0, 0.11, 0, 0xb0453a, { rough: 0.6 });
    holoTag(gift, "Gift from the applicant?", 0, 0.34, 0, { css: "#f0645b", w: 0.5 });
    // The folded note that crosses the dais during the first alarm.
    const passedNote = box(g, 0.12, 0.012, 0.08, 1.5, 1.215, -2.05, 0xf2efe6, { rough: 0.8 });
    passedNote.visible = false;
    reg(hits, gift.children[0], "applicant-gift");

    // The late request, lying on the dais desk, to be moved to the clerk's tray.
    const lateGrp = group(g, -2.3, 1.22, -2.15);
    const lateCard = decal(lateGrp, 0.28, 0.18, 0, 0, 0, paperFace("LATE REQUEST", ["Not on posted agenda", "Member asks: act tonight"], { band: "#6a4a1a" }), { px: 192 });
    lateCard.rotation.x = -Math.PI / 2.4;
    holoTag(lateGrp, "Late item — not noticed", 0, 0.18, 0, { css: PMC_CSS, w: 0.5 });
    reg(hits, lateCard, "late-item-card");

    // ------------------------------------------------------------ the speaker's podium
    const podium = group(g, 0, 0, -0.35, Math.PI);
    box(podium, 0.6, 1.05, 0.45, 0, 0.525, 0, 0x5d4028, { rough: 0.65 });
    box(podium, 0.66, 0.05, 0.5, 0, 1.08, 0.02, 0x7a5638, { rough: 0.55 });
    cyl(podium, 0.008, 0.008, 0.34, 0.16, 1.26, 0.1, 0x1b1d20, { rough: 0.5, metal: 0.6, seg: 6 });
    const speaker = standingPerson(g, 0, 0.05, { ry: Math.PI, cloth: 0x5a4a6a, hiVis: false });
    holoTag(speaker.torso, "Resident at the podium", 0, 1.9, 0, { css: PMC_CSS, w: 0.5 }).rotation.y = Math.PI;
    bead(0.55, 1.45, -0.6, "listen-point", "Hear her to the bell", { w: 0.46 });
    bead(-0.6, 1.25, -0.75, "cut-off-speaker", "Correct her now?", { color: 0xf0645b, css: "#f0645b", w: 0.42 });

    const timerStand = stand(1.1, -0.1, -0.3);
    const timer = instrument(timerStand, 0, 1.02, 0, { idle: "TIMER", color: PMC_ACCENT, w: 0.2, d: 0.26 });
    holoTag(timerStand, "Speaker timer", 0, 1.22, 0, { css: PMC_CSS, w: 0.36 });
    reg(hits, timer, "comment-timer");

    // The item ladder: the order the rules set.
    const ladder = group(g, 2.35, 0, -0.9, -0.5);
    cyl(ladder, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["item-staff-report", "1 · Staff report", 0.75], ["item-public-comment", "2 · Public comment", 1.05],
      ["item-motion-second", "3 · Motion + second", 1.35], ["item-debate-vote", "4 · Debate, then vote", 1.65],
    ]) {
      const b = ball(ladder, 0.026, 0, y, 0, PMC_ACCENT, { emissive: PMC_ACCENT, ei: 1.5, seg: 12 });
      holoTag(ladder, label, 0.2, y, 0, { css: PMC_CSS, w: 0.44 });
      reg(hits, b, lid);
    }

    // The order meter, and the warning card that answers a disruption.
    const orderStand = stand(-1.35, 0.15, 0.4);
    const orderGauge = instrument(orderStand, 0, 1.02, 0, { idle: "ORDER", color: PMC_ACCENT, w: 0.2, d: 0.26 });
    holoTag(orderStand, "Room order", 0, 1.22, 0, { css: PMC_CSS, w: 0.32 });
    reg(hits, orderGauge, "order-meter");
    card(-2.1, 1.3, 0.55, "warning-recess-card", "Warn once · then recess", "WARNING\nTHEN RECESS", { w: 0.5, ry: 0.5, accent: "#f2c14b", css: "#f2c14b" });

    card(1.75, 1.3, 0.35, "critic-reply-card", "Thank her · staff to follow up", "THANK YOU", { w: 0.56, ry: -0.5 });
    card(2.6, 1.25, 0.9, "promise-from-dais", "Promise the fix tonight?", "WE'LL FIX IT\nNEXT MONTH", {
      w: 0.5, ry: -0.7, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    bead(-2.9, 1.0, -1.7, "sidebar-huddle", "Huddle with two colleagues?", { color: 0xf0645b, css: "#f0645b", w: 0.54 });

    // ------------------------------------------------------------ the gallery
    const gallery = [];
    for (const [gx, gz, cloth] of [[-3.3, 1.0, 0x6a5a3a], [-3.3, 1.9, 0x3a5a6a], [3.3, 1.9, 0x5a3a3a]]) {
      chair(gx, gz, gx < 0 ? Math.PI / 2 : -Math.PI / 2, 0x3a3f46);
      gallery.push(seatedFigure(g, gx, 0.49, gz, { ry: gx < 0 ? Math.PI / 2 : -Math.PI / 2, cloth }));
    }
    // The man at the back of the gallery who comes forward to shout.
    const shouter = standingPerson(g, 4.1, 1.2, { ry: -Math.PI / 2, cloth: 0x6a4a2a, hiVis: false });
    const disruptLamp = ball(g, 0.05, 3.3, 2.1, -0.2, 0x3a2020, { rough: 0.4, seg: 12 });

    // ------------------------------------------------------------ the clerk's table
    const clerkTable = group(g, -3.2, 0, -0.9);
    box(clerkTable, 1.2, 0.05, 0.6, 0, 0.76, 0, 0x5d4028, { rough: 0.6 });
    for (const sx of [-1, 1]) box(clerkTable, 0.05, 0.74, 0.5, sx * 0.55, 0.37, 0, 0x4a3320, { rough: 0.7 });
    const tray = box(clerkTable, 0.38, 0.04, 0.28, 0.3, 0.8, 0, 0x2a2d31, { rough: 0.6 });
    holoTag(clerkTable, "Future agenda tray", 0.3, 1.0, 0, { css: "#59c97b", w: 0.44 });
    reg(hits, tray, "future-agenda-tray");
    const cards = box(clerkTable, 0.2, 0.05, 0.14, -0.35, 0.8, 0.1, 0xe8e0c8, { rough: 0.8 });
    holoTag(clerkTable, "Speaker cards", -0.35, 1.0, 0.1, { css: PMC_CSS, w: 0.34 });
    reg(hits, cards, "notice-comment-cards");

    // The correspondence file: four contacts, three of them meetings in disguise.
    const file = board(0.7, 0.5, -3.55, 1.55, 0.4, (cx, w, h) => lines(cx, w, h, "CORRESPONDENCE FILE", ["Tap every contact that was a meeting"]), { ry: 0.9, accent: PMC_ACCENT });
    void file;
    const fileRows = group(g, -3.3, 0, 0.75, 0.9);
    for (const [fid, label, y, c] of [
      ["serial-reply-all", "Reply-all · 3 members", 1.32, PMC_ACCENT], ["serial-hub-spoke", "Staff polls each office", 1.12, PMC_ACCENT],
      ["serial-dinner-three", "Dinner · 3 members", 0.92, PMC_ACCENT], ["serial-posted-memo", "Memo in the posted packet", 0.72, 0x7fc4d8],
    ]) {
      const b = ball(fileRows, 0.024, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(fileRows, label, 0.26, y, 0, { css: PMC_CSS, w: 0.48 });
      reg(hits, b, fid);
    }

    // ------------------------------------------------------------ the notice wall
    const agenda = board(0.7, 0.55, 3.6, 1.6, -1.2, (cx, w, h) => lines(cx, w, h, "AGENDA — POSTED", [
      "Regular meeting · posted 72 hours ahead", "1 Roll call  2 Public comment", "3 Permit appeal  4 Street repair report",
    ]), { ry: -1.0, accent: PMC_ACCENT });
    reg(hits, agenda, "notice-agenda-posted");
    const captions = board(0.8, 0.45, -3.7, 1.9, -1.8, (cx, w, h) => lines(cx, w, h, "LIVE CAPTIONS", [
      "Interpreter requested · confirmed", "Captions on the stream and in the room",
    ]), { ry: 1.0, accent: 0x7fc4d8 });
    reg(hits, captions, "notice-interpreter");
    const parking = decal(g, 0.36, 0.22, 3.75, 1.2, 0.2, signFace("PARKING\nVALIDATED", { bg: "#16202a", accent: "#7fc4d8", scale: 0.36 }), { px: 192 });
    parking.rotation.y = -1.3;
    reg(hits, parking, "notice-parking-sign");

    // The vote board, and the two closing boards.
    const votes = group(g, 3.2, 0, -0.1, -1.0);
    cyl(votes, 0.022, 0.022, 1.6, 0, 0.8, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [vid, label, y] of [["vote-ayes", "Ayes, by name", 0.9], ["vote-noes", "Noes, by name", 1.18], ["vote-abstain", "Abstain / recused", 1.46]]) {
      const b = ball(votes, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(votes, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.4 });
      reg(hits, b, vid);
    }
    const minutes = board(0.56, 0.4, 2.2, 1.9, 1.6, (cx, w, h) => lines(cx, w, h, "ACTION MINUTES", [
      "Actions · votes by name", "Items referred to future agendas", "Who spoke, fairly noted",
    ]), { ry: -0.7, accent: PMC_ACCENT });
    reg(hits, minutes, "minutes-log-board");
    const checkin = board(0.5, 0.36, -2.2, 1.9, 1.7, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", [
      "How did that meeting land?", "Employee assistance line", "Nobody runs a hard room alone",
    ], { accent: "#7fc4d8" }), { ry: 0.7, accent: 0x7fc4d8 });
    reg(hits, checkin, "crew-checkin-board");

    // The guide's board: what the station's own feedback sounds like when it
    // is about a person rather than a procedure (shared/ei-guide.js).
    const guide = board(0.62, 0.34, 0, 2.55, -1.6, (cx, w, h) => lines(cx, w, h, "LISTEN FIRST", [
      "The podium is hers until the bell.",
    ], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.13);
    });

    // ------------------------------------------------------------ the clerk
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const clerk = standingFigure(g, -2.5, -0.2, { ry: 1.0, cloth: 0x2f3946, trousers: 0x262d36 });
    holoTag(clerk, "City clerk", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.3 }).rotation.y = -1.0;

    let live = false;
    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.2, -2.2),

      onStepComplete(step) {
        if (step.id === "go-live") {
          live = true;
          liveLamp.material = mat(0xe04040, { emissive: 0xe04040, ei: 1.4, rough: 0.4 });
          knob.material = mat(0x59c97b, { rough: 0.3, metal: 0.6, emissive: 0x59c97b, ei: 0.5 });
        }
        if (step.id === "refer-late-item") {
          lateGrp.position.set(-3.2 + 0.3, 0.84, -0.9);
          lateCard.rotation.x = -Math.PI / 2;
          tray.material = mat(0x59c97b, { rough: 0.6, emissive: 0x59c97b, ei: 0.4 });
        }
        if (step.id === "announce-the-vote") {
          repaint(minutes.userData.face, (cx, w, h) => lines(cx, w, h, "VOTE STATED", ["Ayes 3 · Noes 1 · Recused 1", "Each member named aloud"], { accent: "#59c97b" }));
        }
        if (step.id === "close-the-minutes") {
          repaint(minutes.userData.face, (cx, w, h) => lines(cx, w, h, "ADJOURNED — LOGGED", ["Minutes to the clerk", "Late item on next agenda"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      // A dismissive move at the podium is the station's emotional moment: the
      // resident turns away from the dais, and the guide's board says what the
      // guide says, rather than a procedural line.
      onHazard(id, s) {
        if (id === "cut-off-speaker" || id === "promise-from-dais") {
          speaker.root.rotation.y = Math.PI - 0.9;
          speaker.head.rotation.y = -0.4;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. The podium is hers until the bell.");
        }
      },

      onInterrupt(it) {
        if (it.id === "side-conversation-on-dais") {
          members[2].root.rotation.y = 1.1;
          members[3].root.rotation.y = -1.0;
          passedNote.visible = true;
          members[2].arms[1].shoulder.rotation.x = -0.9;
        }
        if (it.id === "gallery-outburst") {
          shouter.root.position.set(3.0, 0, 0.8);
          shouter.root.rotation.y = -Math.PI / 2 - 0.5;
          shouter.arms[1].shoulder.rotation.x = -1.6;
          disruptLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6, rough: 0.4 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "side-conversation-on-dais") {
          members[2].root.rotation.y = 0;
          members[3].root.rotation.y = 0;
          members[2].arms[1].shoulder.rotation.x = 0;
          passedNote.visible = false;
        }
        if (it.id === "gallery-outburst") {
          shouter.root.position.set(4.1, 0, 1.2);
          shouter.root.rotation.y = -Math.PI / 2;
          shouter.arms[1].shoulder.rotation.x = 0;
          disruptLamp.material = mat(0x3a2020, { rough: 0.4 });
        }
      },

      animate(t, dt, session) {
        if (live) liveLamp.material.emissiveIntensity = 1.0 + Math.sin(t * 3) * 0.4;
        speaker.head.rotation.x = Math.sin(t * 0.8) * 0.05;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "set-speaker-time") {
          const ok = gg.t >= 0.27 && gg.t <= 0.46;
          repaint(timer.userData.screen, signFace(`${(0.5 + gg.t * 5.5).toFixed(1)} MIN`, {
            bg: "#1a1408", accent: ok ? "#59c97b" : "#f0645b", fg: "#f5ead0", scale: 0.52,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "keep-order" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(orderGauge.userData.screen, signFace(ok ? "IN ORDER" : tr.v < 0.3 ? "TOO LOOSE" : "TOO HEAVY", {
            bg: "#1a1408", accent: ok ? "#59c97b" : "#f0645b", fg: "#f5ead0", scale: 0.5,
          }));
        }
      },
    };
  },
};
