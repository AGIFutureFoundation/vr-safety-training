import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat, seatedFigure, standingPerson,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Community Listening Session VR — Civic Leadership and Emotional
// Intelligence, station seven.
//
// A community hall on a weeknight: chairs in a circle rather than rows, a
// childcare corner, interpretation headsets, sticky notes on the wall, and a
// neighbourhood that has been promised things before. The city is proposing a
// waste transfer facility on the industrial edge of the district. The learner
// facilitates a session whose only job is to hear — not to present, defend or
// decide — and to leave with a record residents would recognise as theirs.
//
// The principles it practises — listen first, bring people in rather than
// shut them out, keep your word about what happens next — are principles
// commonly taught in civic-leadership programmes; the foundation whose
// principles the module draws on is not sourced in this repository. The
// proposal, the hall and every person in it are invented.

const LSN_ACCENT = 0x6fbf73;
const LSN_CSS = "#6fbf73";

export const SIM_COMMUNITY_LISTENING_SESSION = {
  id: "community-listening-session",
  index: "223",
  domain: "Civic",
  trade: "Community engagement facilitator",
  category: "Community Environmental Justice",
  indoor: "hotel",
  weather: "rain",
  certification: "SAMHSA's six principles of a trauma-informed approach — safety, trustworthiness and transparency, peer support, collaboration and mutuality, empowerment, voice and choice, and cultural, historical and gender issues — for a neighbourhood with a long memory of broken promises; Psychological First Aid (NCTSN) for a resident overwhelmed in the room; Title II of the ADA for interpretation, an accessible hall and assistive listening; the Ralph M. Brown Act's rule that a majority of a legislative body attending a community meeting must not discuss the body's business among themselves there; SEIU and AFSCME for the city staff who facilitate and record. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
  name: "Community Listening Session",
  title: simTitle("Community Listening Session"),
  tagline: "A circle, not a stage: access set up before the doors open, what the session is for said plainly, every voice reflected back, the quiet tables reached, a resident in distress cared for — and a date when people will hear what was done with what they said",
  accent: LSN_ACCENT,
  accentCss: LSN_CSS,
  parSeconds: 330,
  footprint: 2.5,
  badge: { id: "heard-back", name: "Heard Back", note: "A whole session run as listening: nothing defended, nobody left out, and a record the room would sign" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your employee assistance program, or the peer supporter who worked the session with you — a room full of hard stories stays with the people who held it",

  game: system({
    name: "Open Circle",
    currency: "VOICES",
    ranks: ["Note Taker", "Co-Facilitator", "Facilitator", "Engagement Lead", "Facilitation Mentor"],
    badges: [
      { id: "doors-open", name: "Doors Open", note: "Every access need met before anybody arrived", test: AWARD.stepClean("set-up-for-access") },
      { id: "nothing-defended", name: "Nothing Defended", note: "No unsafe action anywhere in the session", test: AWARD.safe },
      { id: "quiet-voices", name: "Quiet Voices", note: "Every table that had not yet spoken found first time", test: AWARD.stepClean("reach-the-quiet-tables") },
    ],
    challenges: [
      { id: "clean-circle", name: "Clean Circle", note: "No corrections anywhere in the session", test: AWARD.clean },
      { id: "fair-floor", name: "Fair Floor", note: "The floor shared inside the band", test: AWARD.precise(0.7) },
      { id: "space-held", name: "Space Held", note: "The listening and the room both carried their full count", test: AWARD.unbroken },
    ],
  }),

  hazards: {
    "defend-the-project": "You answered her concern with the project's benefits. This session exists to hear, not to persuade; a facilitator who rebuts every comment turns a listening session into a sales pitch, and the neighbourhood stops telling you the things you most need to know.",
    "promise-it-wont-be-built": "You promised the facility will not be built here. You do not decide that, the council does, after a process that is not finished — and a neighbourhood that has been promised things before will remember this one exactly.",
    "members-huddle": "You gathered the council members at the back — three of the five are here tonight — to compare notes on the proposal. Members may attend a community meeting, but a majority of the body discussing its own business among themselves there is exactly what the open-meeting law does not allow — in a room full of residents watching.",
    "operator-catering": "You accepted the facility operator's offer to cater the session. Food paid for by the company that wants the permit sits on the table at a meeting about whether it should get one; residents will ask who paid, and they will be right to.",
  },

  lateNotes: {
    "facilitator-chair": "The circle gets set before anybody arrives — but first check the access set-up the whole room depends on.",
    "session-log-board": "The session record closes once people know what happens next and when — not before.",
  },

  steps: [
    {
      id: "set-up-for-access", kind: "find", noHint: true,
      targets: ["access-interpreter-headsets", "access-childcare-corner", "access-ramp-door"],
      itemNames: {
        "access-interpreter-headsets": "interpretation headsets, charged and on the right channel",
        "access-childcare-corner": "a staffed childcare corner",
        "access-ramp-door": "the ramp door, unlocked and propped",
      },
      itemNotes: {
        "access-interpreter-headsets": "Half the block speaks another language at home. Headsets that work are the difference between attending and taking part.",
        "access-childcare-corner": "Parents of small children are the residents most affected by truck traffic and least able to come to an evening meeting. Childcare is how they get here.",
        "access-ramp-door": "The accessible entrance is the side door. Locked, it means a wheelchair user waits in the rain while everybody else walks in.",
      },
      decoyNotes: {
        "access-stage-podium": "The stage and podium are not an access feature — a raised platform puts the city above the residents it came to hear. Leave it empty tonight.",
      },
      title: "Set up the hall so everybody can take part",
      cue: "Before the doors open, check the three things that decide who can actually come and speak.",
      why: "Bringing people in rather than shutting them out is decided before the first resident arrives. Headsets that do not work, no childcare and a locked ramp door each quietly remove a group from the session — the non-English speakers, the parents, the disabled residents — and they are often the people a waste facility would affect most. The facilitator checks access first, because a record built without those voices is a record of somebody else's neighbourhood.",
    },
    {
      id: "arrange-the-circle", kind: "drag", target: "facilitator-chair",
      title: "Bring the facilitator's chair down into the circle",
      cue: "Carry your chair off the stage and set it in the gap in the circle.",
      drag: {
        to: "circle-gap", radius: 0.6,
        missNote: "Not in the circle. A facilitator who sits above or outside the residents is presenting to them, not listening to them — put the chair in the gap.",
      },
      why: "Where the city sits is a message before anybody speaks. A stage and a podium say the city has come to tell; a chair in the circle, at the same height as everybody else, says it has come to hear. It costs nothing to move, and in a neighbourhood that has sat through years of presentations it is the first sign that tonight might actually be different.",
    },
    {
      id: "open-with-purpose", kind: "select", target: "purpose-card",
      title: "Say plainly what the session is for, and what it is not",
      cue: "\"Tonight is for listening. Nothing is decided here. Everything you say goes into a report the council reads before it votes.\"",
      why: "Trustworthiness and transparency start with saying honestly what the evening can and cannot do. Residents who think a decision is being made tonight will either fight or leave; residents told it is only a formality will not bother to speak. Saying that nothing is decided here, that everything said goes into a report, and who reads it and when, gives people a true reason to spend their evening talking.",
    },
    {
      id: "tune-the-headsets", kind: "turn", target: "interpretation-dial",
      title: "Set the interpretation transmitter to the right channel",
      cue: "Turn the transmitter to the channel on the headset cards — check with the interpreter that it is live.",
      turn: { turns: 0.5, axis: "y", label: "CHANNEL" },
      why: "An interpreter speaking into a transmitter on the wrong channel produces headsets full of static and a room where a third of the residents are politely nodding at nothing. Setting the channel and confirming with the interpreter that the first sentence came through is the small technical act that makes the session genuinely multilingual rather than multilingual on paper.",
    },
    {
      id: "listen-to-the-first-voice", kind: "hold", target: "listen-point", seconds: 8,
      title: "Hear the first speaker without responding",
      cue: "Hold your attention on her. No nodding along to your own talking points, no answers.",
      why: "The first person to speak sets the temperature for everybody else. If the facilitator listens completely — no rebuttal, no reassurance, no glance at the clock — the room learns that it is safe to say the real thing. If the facilitator answers the first comment, every speaker after her prepares an argument instead of a story, and the session becomes a debate the city was never going to win.",
      holdBreakNote: "You started to answer before she finished. Stop, let her complete the thought, and say it back afterwards.",
    },
    {
      id: "reflect-back", kind: "sequence",
      targets: ["reflect-restate", "reflect-feeling", "reflect-check", "reflect-record"],
      itemNames: {
        "reflect-restate": "restate what she said, in her words",
        "reflect-feeling": "name the feeling under it",
        "reflect-check": "check you got it right",
        "reflect-record": "write it on the wall as she said it",
      },
      title: "Reflect what you heard back to her",
      cue: "Restate it in her words, name the feeling, check you have it right, then write it on the wall.",
      why: "Reflecting back is how a speaker knows she was heard, and how the record ends up saying what she meant rather than what the city heard. Restating in her own words, naming the feeling underneath, checking — \"did I get that right?\" — and only then writing it on the wall puts her in charge of her own words. Writing first and checking later turns her into material for somebody else's summary.",
      outOfOrderNote: "Restate, name the feeling, check, then write. Writing it up before checking with her means the record says what you heard, not what she said.",
    },
    {
      id: "share-the-floor", kind: "gauge", target: "floor-meter",
      title: "Share the floor fairly between the voices in the room",
      cue: "Commit when the floor time reads balanced — not the three regulars taking it all, not the quiet tables pushed.",
      gauge: {
        label: "FLOOR SHARE", speed: 0.6, green: [0.42, 0.6],
        readout: (t) => (t < 0.42 ? "regulars dominating" : t <= 0.6 ? "shared" : "quiet tables pushed"),
        missNote: "Not balanced. Either the same three regulars have the floor, or you are pressing the quiet tables to speak before they are ready. Find the balance and commit.",
      },
      why: "Every neighbourhood meeting has its regulars — experienced, articulate, often right — and every one also has residents who have never spoken in public. A fair floor is not equal minutes; it is the regulars heard without dominating and the quieter residents invited without being put on the spot. The facilitator reads it continuously and adjusts, because the loudest record is not the truest one.",
    },
    {
      id: "name-the-history", kind: "select", target: "history-card",
      title: "Acknowledge the neighbourhood's history out loud",
      cue: "\"This neighbourhood has been promised things by the city before, and some of those promises were not kept. That is part of why tonight is hard.\"",
      why: "The history of the place is in the room whether the city names it or not. Acknowledging it — plainly, without excuses and without promising that this time will be different — is the trauma-informed principle of historical and cultural context in practice. It tells residents the city knows why they are wary, and it is often the moment a room that came to fight starts to talk.",
    },
    {
      id: "hold-the-space", kind: "track", target: "room-meter", seconds: 8,
      title: "Hold the room steady as the anger rises",
      cue: "Residents are angry about the trucks. Keep the room inside the band — let the anger be said, keep it safe to stay.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.5, fall: 0.42, drift: 0.16, label: "ROOM",
        readout: (v) => (v < 0.3 ? "shut down" : v > 0.7 ? "unsafe" : "held"),
      },
      why: "Anger is legitimate information in a listening session, and shutting it down tells residents their real feelings are not welcome. Letting it tip into personal attacks makes the room unsafe for the people who came to speak quietly. Holding the space means staying steady and present through the anger — acknowledging it, keeping the ground rules, protecting the quiet speakers — continuously, for as long as it takes.",
      holdBreakNote: "The room slipped — shut down, or tipping into attacks. Come back to steady: acknowledge the anger and keep it safe for everybody to stay.",
    },
    {
      id: "reach-the-quiet-tables", kind: "find", noHint: true,
      targets: ["voice-youth-table", "voice-spanish-table", "voice-back-row"],
      itemNames: {
        "voice-youth-table": "the young people's table",
        "voice-spanish-table": "the Spanish-speaking table",
        "voice-back-row": "the older residents in the back row",
      },
      itemNotes: {
        "voice-youth-table": "The teenagers who walk past the site to school have not said a word. Go to their table rather than asking them to stand up.",
        "voice-spanish-table": "The Spanish-speaking table has been listening through headsets all evening. Ask the interpreter to invite them first.",
        "voice-back-row": "The older residents at the back have lived here longest. A roving mic and a direct invitation is often all it takes.",
      },
      decoyNotes: {
        "voice-spoke-twice": "The neighbourhood association chair has already spoken twice, well. Thank her; the voices missing tonight are elsewhere.",
      },
      title: "Find the voices that have not been heard yet",
      cue: "Look around the circle. Mark every group that has not spoken yet.",
      why: "The residents who have not spoken are usually not the ones with nothing to say. Young people, residents speaking through interpretation and older neighbours in the back row are exactly the voices a record is thinnest on and a decision most often overlooks. Finding them, and going to them rather than making them come to the microphone, is how listening first becomes listening to everybody.",
    },
    {
      id: "close-the-loop", kind: "sequence", anyOrder: true,
      targets: ["loop-report-back", "loop-date-back", "loop-who-decides"],
      itemNames: {
        "loop-report-back": "a written report of what was heard, in residents' words",
        "loop-date-back": "the date it comes back to this room",
        "loop-who-decides": "who decides, and when",
      },
      title: "Tell people exactly what happens next",
      cue: "What was heard goes into a report, the date it comes back here, and who makes the decision and when.",
      why: "Keeping your word begins with making a promise small enough to keep. A written report in residents' own words, a date when it comes back to this room, and a plain statement of who decides and when are three commitments the city can actually honour — and honouring them is what makes the next listening session possible. A session that ends with \"we'll be in touch\" teaches the neighbourhood not to come again.",
    },
    {
      id: "log-the-session", kind: "select", target: "session-log-board",
      title: "Record the session in residents' own words",
      cue: "Log the wall notes, the quiet tables reached, the history acknowledged and the date promised.",
      why: "The session record is what the council will actually read, and whatever is not in it did not happen as far as the decision is concerned. Recording what was said in residents' own words, which groups spoke, the history acknowledged and the date promised keeps faith with everybody who spent their evening here — and gives the neighbourhood something concrete to hold the city to.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the peer supporter and the interpreter",
      cue: "Two minutes after the hall empties: how did that land on each of you?",
      why: "A listening session asks the people running it to absorb a great deal of other people's pain without answering it, and the interpreter voiced every word of it twice. Checking in afterwards — how did it land, does anybody need support, the employee assistance line if it stays — is peer support in practice, and it is what keeps facilitators able to hold the next room as well as this one.",
    },
  ],

  interrupts: [
    {
      id: "headset-silent",
      kind: "Resident cut out of the room",
      after: "listen-to-the-first-voice", delay: 3, seconds: 12,
      alert: "An older resident in the back row has raised her hand and is tapping her headset: it has gone silent, and she has missed the last two minutes.",
      cue: "Pause the speaker gently and bring a working headset to her yourself.",
      target: "spare-headset",
      why: "A resident who cannot follow the conversation is not in the session, however many chairs are filled. Pausing the speaker for a moment, bringing a working headset over in person and offering to recap is what bringing people in looks like in practice — and the whole room sees that the evening will stop for the person at the back, not only for the person at the microphone.",
      missNote: "She sat through the rest of the session in silence, then left early. The record has nothing from the resident who has lived on the block longest, and she has told her neighbours the city's meeting was not meant for people like her.",
      wrongNote: "Not by holding your attention on the speaker — the resident at the back has lost the room entirely. Take her a working headset.",
    },
    {
      id: "resident-in-distress",
      kind: "Resident overwhelmed",
      after: "hold-the-space", delay: 3, seconds: 12,
      alert: "A woman describing her son's asthma attacks has started to cry and cannot go on. The room has gone quiet around her.",
      cue: "Pause the room and send the peer supporter to her with water and a quiet seat — do not push her to finish.",
      target: "quiet-corner",
      why: "Psychological First Aid starts with safety and comfort: a pause, water, a quiet seat and a companion if she wants one, with no pressure to finish her story. Sending the peer supporter to her, and telling the room plainly that her words are already on the wall, keeps her dignity intact — and shows every resident that the session will care for the people who bring it their hardest things.",
      missNote: "The session moved on to the next speaker while she was still crying. Nobody went to her, and the room learned in that moment what the city's listening is actually worth.",
      wrongNote: "The room meter is everybody. She needs somebody beside her now — send the peer supporter with water and a quiet seat.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, LSN_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? LSN_ACCENT, { emissive: o.color ?? LSN_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? LSN_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0e1d10", accent: o.accent ?? LSN_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? LSN_CSS, w: o.w ?? 0.48 });
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
      box(c, 0.44, 0.05, 0.42, 0, 0.46, 0, color, { rough: 0.7 });
      box(c, 0.44, 0.44, 0.04, 0, 0.7, -0.19, color, { rough: 0.7 });
      return c;
    };
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(10,24,12,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? LSN_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#edfbee";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#c4e6c6";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? LSN_ACCENT, { rough: 0.5, emissive: o.accent ?? LSN_ACCENT, ei: 0.25 });
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

    // ------------------------------------------------------------ the hall
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 10, base: "#7a5e44", base2: "#6d533c", seam: "rgba(36,24,14,0.4)",
    }), { repeat: 3, px: 384 });
    const floor = box(g, 8.4, 0.02, 7.0, 0, 0.012, -0.4, 0x7a5e44, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.85, metal: 0.03, color: 0x8a6c50 });

    // The empty stage and podium at the back — the decoy, and where the chair starts.
    const stageTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#4a3a2c", base2: "#3f3126", seam: "rgba(20,12,6,0.45)",
    }), { repeat: 2, px: 320 });
    const stage = box(g, 4.0, 0.5, 1.4, 0, 0.25, -3.6, 0x4a3a2c, { rough: 0.7 });
    stage.material = texturedMat(stageTex, { rough: 0.7, metal: 0.03, color: 0x5a4838 });
    const podium = box(g, 0.55, 1.0, 0.4, 0.9, 1.0, -3.7, 0x2a2e33, { rough: 0.6 });
    holoTag(g, "Stage and podium — not tonight", 0.9, 1.65, -3.5, { css: "#7fc4d8", w: 0.56 });
    reg(hits, podium, "access-stage-podium");
    const fcGrp = group(g, -0.9, 0.5, -3.5);
    box(fcGrp, 0.44, 0.05, 0.42, 0, 0.46, 0, 0x6fbf73, { rough: 0.7 });
    const fcBack = box(fcGrp, 0.44, 0.44, 0.04, 0, 0.7, -0.19, 0x6fbf73, { rough: 0.7 });
    holoTag(fcGrp, "Facilitator's chair", 0, 1.1, 0, { css: LSN_CSS, w: 0.36 });
    reg(hits, fcBack, "facilitator-chair");

    // The circle: seated residents, with one gap for the facilitator.
    const residents = [];
    const ring = [
      [240, 0x3a5a6a, "youth"], [280, 0x5a6a3a, "youth"], [320, 0x7a5a3a, "spanish"],
      [0, 0x4a3a6a, "spanish"], [40, 0x6a3a3a, "mother"], [80, 0x3a4a3a, "elder"], [120, 0x5a5a6a, "elder"],
    ];
    for (const [deg, cloth, who] of ring) {
      const a = (deg * Math.PI) / 180;
      const sx = Math.sin(a) * 1.8, sz = -0.9 + Math.cos(a) * 1.8;
      chair(sx, sz, a + Math.PI, 0x5a4a3a);
      const r = seatedFigure(g, sx, 0.49, sz, { ry: a + Math.PI, cloth });
      r.who = who;
      residents.push(r);
    }
    const gapA = (160 * Math.PI) / 180;
    const gapX = Math.sin(gapA) * 1.8, gapZ = -0.9 + Math.cos(gapA) * 1.8;
    const gapMark = box(g, 0.5, 0.012, 0.5, gapX, 0.03, gapZ, 0x59c97b, { rough: 0.8, emissive: 0x59c97b, ei: 0.35, cast: false });
    holoTag(g, "Gap in the circle", gapX, 0.3, gapZ, { css: "#59c97b", w: 0.34 });
    reg(hits, gapMark, "circle-gap");
    const mother = residents[4];
    const elderBack = residents[5];

    // Markers on the quiet groups.
    bead(Math.sin((260 * Math.PI) / 180) * 2.3, 1.35, -0.9 + Math.cos((260 * Math.PI) / 180) * 2.3, "voice-youth-table", "Youth table — not heard yet", { w: 0.54 });
    bead(Math.sin((340 * Math.PI) / 180) * 2.3, 1.35, -0.9 + Math.cos((340 * Math.PI) / 180) * 2.3, "voice-spanish-table", "Spanish-speaking table", { w: 0.46 });
    bead(Math.sin((100 * Math.PI) / 180) * 2.3, 1.35, -0.9 + Math.cos((100 * Math.PI) / 180) * 2.3, "voice-back-row", "Older residents, back row", { w: 0.5 });
    bead(Math.sin((200 * Math.PI) / 180) * 2.3, 1.35, -0.9 + Math.cos((200 * Math.PI) / 180) * 2.3, "voice-spoke-twice", "Association chair — spoke twice", { color: 0x7fc4d8, css: "#7fc4d8", w: 0.58 });
    bead(0.45, 1.45, -0.6, "listen-point", "Hear her — no answers", { w: 0.44 });

    // The interpretation transmitter and the spare headset.
    const tx = group(g, -2.9, 0, -2.2, 0.9);
    box(tx, 0.5, 0.8, 0.4, 0, 0.4, 0, 0x2a2e33, { rough: 0.6 });
    const txKnob = cyl(tx, 0.035, 0.035, 0.035, 0, 0.84, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 12 });
    holoTag(tx, "Interpretation transmitter", 0, 1.05, 0, { css: LSN_CSS, w: 0.5 });
    reg(hits, txKnob, "interpretation-dial");
    const headsets = box(tx, 0.34, 0.08, 0.2, 0, 0.86, 0.12, 0x3a3f46, { rough: 0.5 });
    holoTag(tx, "Headsets — charged", 0, 1.2, 0.12, { css: LSN_CSS, w: 0.36 });
    reg(hits, headsets, "access-interpreter-headsets");
    bead(-2.4, 1.2, -1.55, "spare-headset", "Take her a working headset", { color: 0xf2c14b, css: "#f2c14b", w: 0.52 });

    // Childcare corner and the ramp door.
    const cc = group(g, 3.1, 0, 1.4, -1.0);
    box(cc, 1.2, 0.02, 1.0, 0, 0.02, 0, 0x7fc4d8, { rough: 0.9, cast: false });
    const toyBox = box(cc, 0.4, 0.3, 0.3, 0.2, 0.15, 0.1, 0xf2c14b, { rough: 0.6 });
    ball(cc, 0.08, -0.3, 0.08, 0.2, 0xf0645b, { rough: 0.6, seg: 12 });
    holoTag(cc, "Childcare — staffed", 0, 0.6, 0, { css: LSN_CSS, w: 0.36 });
    reg(hits, toyBox, "access-childcare-corner");
    const door = group(g, 3.6, 0, -1.6, -Math.PI / 2);
    box(door, 1.0, 2.1, 0.06, 0, 1.05, 0, 0x5a4a3a, { rough: 0.6 });
    const ramp = box(door, 1.0, 0.06, 0.9, 0, 0.03, 0.5, 0x8a8f96, { rough: 0.8 });
    const doorSign = decal(door, 0.4, 0.14, 0, 1.6, 0.04, signFace("RAMP ENTRANCE", { bg: "#16202a", accent: LSN_CSS, scale: 0.44 }), { px: 192 });
    void ramp;
    reg(hits, doorSign, "access-ramp-door");

    // The reflection ladder.
    const ladder = group(g, 2.4, 0, -2.4, -0.5);
    cyl(ladder, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["reflect-restate", "1 · Restate, her words", 0.75], ["reflect-feeling", "2 · Name the feeling", 1.05],
      ["reflect-check", "3 · Did I get that right?", 1.35], ["reflect-record", "4 · Write it on the wall", 1.65],
    ]) {
      const b = ball(ladder, 0.026, 0, y, 0, LSN_ACCENT, { emissive: LSN_ACCENT, ei: 1.5, seg: 12 });
      holoTag(ladder, label, 0.2, y, 0, { css: LSN_CSS, w: 0.44 });
      reg(hits, b, lid);
    }

    // The sticky-note wall.
    const wall = board(1.4, 0.8, -1.9, 1.7, -4.0, (cx, w, h) => {
      cx.fillStyle = "#e8e0cc"; cx.fillRect(0, 0, w, h);
      const cols = ["#f2e27a", "#f2b07a", "#9fe0b0", "#9fd0f0"];
      for (let i = 0; i < 18; i++) {
        cx.fillStyle = cols[i % 4];
        cx.fillRect(w * (0.04 + (i % 6) * 0.16), h * (0.1 + Math.floor(i / 6) * 0.3), w * 0.13, h * 0.22);
      }
    }, { accent: 0xb09070 });
    void wall;

    // Floor-share and room meters.
    const floorStand = stand(-1.2, 1.3, 0.4);
    const floorGauge = instrument(floorStand, 0, 1.02, 0, { idle: "FLOOR", color: LSN_ACCENT, w: 0.2, d: 0.26 });
    holoTag(floorStand, "Floor share", 0, 1.22, 0, { css: LSN_CSS, w: 0.28 });
    reg(hits, floorGauge, "floor-meter");
    const roomStand = stand(1.2, 1.35, -0.4);
    const roomGauge = instrument(roomStand, 0, 1.02, 0, { idle: "ROOM", color: LSN_ACCENT, w: 0.2, d: 0.26 });
    holoTag(roomStand, "The room", 0, 1.22, 0, { css: LSN_CSS, w: 0.24 });
    reg(hits, roomGauge, "room-meter");

    card(-0.5, 1.45, -0.55, "purpose-card", "What tonight is for", "LISTENING ONLY\nNOTHING DECIDED", { w: 0.4, ry: 0.2 });
    card(-2.7, 1.35, 0.3, "history-card", "Name the history", "PROMISES\nNOT KEPT", { w: 0.36, ry: 0.9 });
    // The quiet corner the peer supporter takes her to.
    chair(2.9, -0.4, -1.1, 0x7fc4d8);
    const quiet = group(g, 2.9, 0, -0.4, -1.1);
    const tissue = box(quiet, 0.16, 0.08, 0.1, 0.35, 0.5, 0, 0xf2f2f2, { rough: 0.8 });
    tissue.visible = false;
    card(2.6, 1.3, 0.2, "quiet-corner", "Peer supporter · water · a quiet seat", "QUIET CORNER", { w: 0.64, ry: -1.0, accent: "#f2c14b", css: "#f2c14b" });

    // Closing the loop.
    const loop = group(g, -2.9, 0, 1.3, 1.0);
    cyl(loop, 0.022, 0.022, 1.6, 0, 0.8, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [["loop-report-back", "Report, in your words", 0.9], ["loop-date-back", "Back here on the 14th", 1.18], ["loop-who-decides", "Council decides, and when", 1.46]]) {
      const b = ball(loop, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(loop, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.48 });
      reg(hits, b, lid);
    }

    // ------------------------------------------------------------ the wrong moves
    card(1.7, 1.3, 0.8, "defend-the-project", "Answer with the benefits?", "BUT THE FACILITY\nBRINGS JOBS", {
      w: 0.48, ry: -0.6, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    card(0.5, 1.3, 1.25, "promise-it-wont-be-built", "Promise it won't be built?", "IT WON'T BE\nBUILT HERE", {
      w: 0.48, ry: -0.2, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    const members = [];
    for (const [mx, mz] of [[-3.5, -3.0], [-3.9, -2.6]]) members.push(standingPerson(g, mx, mz, { ry: 0.8, cloth: 0x2a3440, hiVis: false }));
    bead(-3.3, 1.9, -2.7, "members-huddle", "Huddle with the three members?", { color: 0xf0645b, css: "#f0645b", w: 0.56 });
    const cater = group(g, 1.6, 0, -2.9);
    box(cater, 1.0, 0.05, 0.5, 0, 0.76, 0, 0xe8e0d0, { rough: 0.7 });
    for (const sx of [-1, 1]) box(cater, 0.04, 0.74, 0.4, sx * 0.46, 0.37, 0, 0x8a8f96, { rough: 0.5 });
    const trays = box(cater, 0.7, 0.08, 0.3, 0, 0.83, 0, 0xc0c4c8, { rough: 0.3, metal: 0.6 });
    holoTag(cater, "Catering from the operator?", 0, 1.1, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, trays, "operator-catering");

    // Closing boards.
    const logBoard = board(0.56, 0.38, 1.4, 1.9, 2.3, (cx, w, h) => lines(cx, w, h, "SESSION RECORD", ["In residents' own words", "Date promised: the 14th"]), { ry: -0.4 });
    reg(hits, logBoard.userData.face, "session-log-board");
    const checkin = board(0.5, 0.34, -1.4, 1.9, 2.3, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", ["How did that land?", "Peer supporter · interpreter"], { accent: "#7fc4d8" }), { ry: 0.4, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // The guide's board (shared/ei-guide.js).
    const guide = board(0.62, 0.3, 1.0, 2.4, -3.95, (cx, w, h) => lines(cx, w, h, "LISTEN FIRST", ["Hear it all before anything else."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.14);
    });

    // ------------------------------------------------------------ the peer supporter
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const peer = standingFigure(g, -2.0, 1.95, { ry: 2.53, cloth: 0x3a5a4a, trousers: 0x262d36 });
    holoTag(peer, "Peer supporter", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.32 }).rotation.y = -2.53;
    const motherFacing = mother.root.rotation.y;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.0, -1.4),

      onStepComplete(step) {
        if (step.id === "arrange-the-circle") {
          fcGrp.position.set(gapX, 0, gapZ);
          fcGrp.rotation.y = gapA + Math.PI;
        }
        if (step.id === "tune-the-headsets") {
          txKnob.material = mat(0x59c97b, { rough: 0.3, metal: 0.6, emissive: 0x59c97b, ei: 0.5 });
        }
        if (step.id === "log-the-session") {
          repaint(logBoard.userData.face, (cx, w, h) => lines(cx, w, h, "RECORDED", ["Their words, their wall", "Back here on the 14th"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      onHazard(id, s) {
        if (id === "defend-the-project" || id === "promise-it-wont-be-built") {
          mother.root.rotation.y = motherFacing + 1.0;
          mother.head.rotation.y = 0.5;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. Tonight is for hearing, not answering.");
        }
      },

      onInterrupt(it) {
        if (it.id === "headset-silent") elderBack.arms[1].shoulder.rotation.x = -2.6;
        if (it.id === "resident-in-distress") {
          mother.torso.rotation.x = 0.35;
          mother.head.rotation.x = 0.4;
          tissue.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "headset-silent") elderBack.arms[1].shoulder.rotation.x = 0;
        if (it.id === "resident-in-distress") {
          mother.torso.rotation.x = 0;
          mother.head.rotation.x = 0;
          peer.position.set(2.2, 0, 0.1);
          peer.rotation.y = 2.0;
        }
      },

      animate(t, dt, session) {
        for (let i = 0; i < residents.length; i++) if (residents[i] !== mother) residents[i].head.rotation.x = Math.sin(t * 0.6 + i) * 0.05;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "share-the-floor") {
          const ok = gg.t >= 0.42 && gg.t <= 0.6;
          repaint(floorGauge.userData.screen, signFace(ok ? "SHARED" : gg.t < 0.42 ? "REGULARS" : "PUSHING", {
            bg: "#0e1d10", accent: ok ? "#59c97b" : "#f0645b", fg: "#e3f6e4", scale: 0.52,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "hold-the-space" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(roomGauge.userData.screen, signFace(ok ? "HELD" : tr.v < 0.3 ? "SHUT DOWN" : "UNSAFE", {
            bg: "#0e1d10", accent: ok ? "#59c97b" : "#f0645b", fg: "#e3f6e4", scale: 0.5,
          }));
        }
      },
    };
  },
};
