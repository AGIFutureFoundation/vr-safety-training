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

// SmartCiti.X~ Open Meeting Law and Agenda Notice VR — Civic Leadership and
// Emotional Intelligence, deepening the programme.
//
// The learner is the clerk of a five-member local board on the night it
// meets in open session and then goes into closed session. Public Meeting
// Chair already teaches the chair's side of the room — the speaker's clock,
// the late item, order in the gallery. This station is the part the chair
// relies on and rarely sees: whether the agenda was posted and described so
// the public could actually tell what was coming, whether a quorum is really
// present when one member joins by video, what may and may not be discussed
// behind the closed-session door, and what has to be said out loud when the
// board comes back.
//
// The law is the Ralph M. Brown Act, named as a body (California Government
// Code section 54950 and following) and stated as principles: agenda posted
// in advance where anyone can read it, each item briefly described, the
// public's right to comment, closed session only for the narrow subjects the
// Act allows, and a report out. Where this module is unsure of a clause it
// names the Act and not a section. Sited generically: no real board, city or
// member; the leadership principles are those commonly taught in civic-
// leadership programmes, and the foundation whose principles the programme
// draws on is not sourced in this repository.

const OML_ACCENT = 0x8fb7d9;
const OML_CSS = "#8fb7d9";

export const SIM_CV_OPEN_MEETING_LAW_AND_AGENDA_NOTICE = {
  id: "cv-open-meeting-law-and-agenda-notice",
  index: "318",
  domain: "Civic",
  trade: "Clerk of the board — open-meeting compliance",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "overcast",
  certification: "The Ralph M. Brown Act (California Government Code section 54950 and following), stated as a body and as principles: the agenda posted in advance in a place the public can reach, each item briefly described, the public's right to address the body, closed session only for the subjects the Act allows, and a public report of action taken there; the California Public Records Act for the agenda packet and any writing handed to a majority of the body; Robert's Rules of Order as the parliamentary practice the board adopts in its own rules, not a law; Title II of the ADA for a remote member's and the public's access to the meeting; the Political Reform Act for what a member discloses before voting; the municipal ethics code for confidential information; SEIU and AFSCME for the clerks and staff who run the room. The leadership principles practised here are those commonly taught in civic-leadership programmes; the foundation whose principles the programme draws on is not sourced in this repository",
  name: "Open Meeting Law and Agenda Notice",
  title: simTitle("Open Meeting Law and Agenda Notice"),
  tagline: "Clerk a board meeting that is lawful from the posting to the report out: the agenda up where anyone can read it, each item described so a neighbour could tell, a quorum counted honestly, closed session kept to what was noticed — and every action said aloud when the doors open again",
  accent: OML_ACCENT,
  accentCss: OML_CSS,
  parSeconds: 340,
  footprint: 2.4,
  badge: { id: "posted-and-proper", name: "Posted and Proper", note: "A whole meeting clerked in the open: noticed right, a real quorum, closed session kept narrow and every action reported out" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your employee assistance program, or the clerk from the next district over who has sat through a long closed session and will take the call",

  game: system({
    name: "Open Door",
    currency: "NOTICE",
    ranks: ["Deputy Clerk", "Clerk", "Board Secretary", "Clerk of the Board", "Mentor Clerk"],
    badges: [
      { id: "posted-right", name: "Posted Right", note: "Every posting condition found first time", test: AWARD.stepClean("check-the-posting") },
      { id: "nothing-leaked", name: "Nothing Leaked", note: "No unsafe action anywhere in the meeting", test: AWARD.safe },
      { id: "narrow-door", name: "Narrow Door", note: "Everything that did not belong in closed session found first time", test: AWARD.stepClean("stop-what-does-not-belong") },
    ],
    challenges: [
      { id: "clean-record", name: "Clean Record", note: "No corrections anywhere in the meeting", test: AWARD.clean },
      { id: "plain-words", name: "Plain Words", note: "The item description set inside the band", test: AWARD.precise(0.7) },
      { id: "held-the-line", name: "Held the Line", note: "The listening and the closed-session focus both carried their full count", test: AWARD.unbroken },
    ],
  }),

  hazards: {
    "secret-ballot-box": "You handed out slips for a secret ballot on the appointment. The open-meeting law does not let a body vote in a way the public cannot see, in open or closed session; a vote that cannot be attributed to a member is not a vote the public can hold anyone to, and the appointment made by it is exposed to challenge the next morning.",
    "forward-evaluation-memo": "You forwarded the general manager's closed-session evaluation memo to the reporter who asked for it. Confidential information from a lawful closed session is not the clerk's to release, the employee's personnel matter is now in the paper before she has even heard the board's view, and the board can no longer speak freely to its own counsel about anything.",
    "clear-the-gallery": "You asked the chair to clear the whole room because one man booed. Clearing a meeting is a last resort for a disruption that actually stops the meeting, after warnings; used on a single heckler it silences forty residents who did nothing, it looks like the board hiding, and the heckler now has the story he came for.",
    "rebuild-packet-overnight": "You told the chair you would rebuild the whole agenda packet alone overnight. A clerk who carries every late change single-handed at two in the morning is how a posting deadline gets missed and how a description ends up wrong; the fix is a cut-off for late items and a deputy, not a clerk who stops sleeping.",
  },

  lateNotes: {
    "late-memo-card": "The memo goes on the public table when it is handed to the members during the meeting — that has not happened yet. Stay with the step in front of you.",
    "clerk-log-board": "The log closes after the report out and the special meeting is posted. There is nothing to record yet.",
  },

  steps: [
    {
      id: "check-the-posting", kind: "find", noHint: true,
      targets: ["post-kiosk-agenda", "post-web-agenda", "post-item-lines", "post-comment-notice"],
      itemNames: {
        "post-kiosk-agenda": "the agenda in the outdoor kiosk, readable at any hour",
        "post-web-agenda": "the same agenda on the board's website",
        "post-item-lines": "a brief description under every item",
        "post-comment-notice": "the notice of the public's right to speak",
      },
      itemNotes: {
        "post-kiosk-agenda": "Posted ahead of a regular meeting in a place anyone can reach, even when the building is locked. A kiosk inside a locked lobby is not a posting.",
        "post-web-agenda": "The same agenda, not a draft of it, on the website the public is told to use. Two versions is how a resident reads the wrong one.",
        "post-item-lines": "Each item says in plain words what the board may decide. A heading like \"Personnel\" or \"Property\" alone tells a neighbour nothing.",
        "post-comment-notice": "The agenda tells people they may address the board on any item, and on other matters within its jurisdiction. Nobody has to know to ask.",
      },
      decoyNotes: {
        "post-catering-order": "The catering order for the members' dinner break is housekeeping. It has nothing to do with whether this meeting was properly noticed.",
      },
      title: "Confirm the agenda was posted so the public could find it",
      cue: "Walk the notice points before anyone arrives. Mark every one that decides whether tonight is a lawful meeting.",
      why: "The posted agenda is the promise the board made to the public about tonight. If it went up late, went up behind a locked door, differs from the website, or describes items so vaguely that nobody could tell what was coming, every action taken tonight is open to challenge, and the residents who stayed home because the agenda looked harmless are the ones who lose. The clerk checks before the gavel, because afterwards it cannot be fixed.",
    },
    {
      id: "describe-the-item", kind: "gauge", target: "desc-meter",
      title: "Write the closed-session item so a neighbour can tell what it is",
      cue: "Set the item description inside the band: long enough to say what the board may do, short enough that it is read.",
      gauge: {
        label: "ITEM DESCRIPTION", speed: 0.6, green: [0.25, 0.5],
        readout: (t) => `${Math.round(2 + t * 36)} words`,
        missNote: "Outside the band. A two-word heading hides the subject; a paragraph of legal boilerplate buries it. Say briefly, in plain words, what the board may discuss and decide.",
      },
      why: "The Act asks for a brief general description of each item, and the test is whether an ordinary member of the public reading it would know whether to come. \"Personnel\" fails that test; a page of recitals fails it the other way. \"Public employee performance evaluation: general manager\" and \"Conference with legal counsel — anticipated litigation: one case\" tell the public exactly what kind of discussion is happening, without saying what cannot yet be said.",
    },
    {
      id: "sort-the-litigation-item", kind: "drag", target: "litigation-card",
      title: "File the litigation conference under closed session",
      cue: "Carry the counsel conference card into the closed-session tray — it is one of the few subjects that belongs there.",
      drag: {
        to: "closed-tray", radius: 0.6,
        missNote: "Not in the tray. A conference with the board's own lawyer about litigation is one of the narrow subjects the Act lets a body take into closed session; it still has to be listed and described like any other item.",
      },
      why: "Closed session is an exception to open government, not a second agenda. The subjects that may go behind the door — a conference with counsel about litigation, real property negotiations, labour negotiations, certain personnel matters about an employee — are narrow for a reason, and each still appears on the posted agenda in its own words. Sorting items honestly before the meeting is how a clerk keeps the board from drifting into secrecy by habit.",
    },
    {
      id: "count-the-quorum", kind: "select", target: "quorum-roll",
      title: "Call the roll and confirm a real quorum",
      cue: "Call each name aloud, including the member on video, and confirm a majority is present before anything is taken up.",
      why: "Nothing the board does counts without a majority of its members present, and a member on video counts only if the rules for remote attendance are met — a location that was noticed and open to the public, or whichever conditions the board's own rules and the law allow, with the member visible and audible. Calling each name aloud tells the room and the record who is here to vote, and catches the member who assumed a phone call was enough.",
    },
    {
      id: "bring-the-recording-up", kind: "turn", target: "record-dial",
      title: "Bring the recording, the stream and the assistive listening up",
      cue: "Turn the console dial so the room, the stream and the hearing loop all go live together.",
      turn: { turns: 0.6, axis: "y", label: "RECORD + LOOP" },
      why: "A meeting that is open to the people who could fit in the room and nobody else is only partly open. The stream serves the residents who work nights; the hearing loop and captions serve the ones who came but cannot follow without them, which is what Title II of the ADA asks of a public body. Starting before they are live means the first minutes of the record are missing, and those are the minutes where the roll and the quorum were stated.",
    },
    {
      id: "hear-closed-session-comment", kind: "hold", target: "comment-listen", seconds: 8,
      title: "Hear public comment on the closed-session items before the board goes in",
      cue: "A resident wants to speak on tonight's closed-session items. Hold your attention on her until she is done.",
      why: "The public has the right to address the board on closed-session items before it goes behind the door, and it is often the only chance anyone outside the board has to be heard on them. Listening to the end — not shuffling the packet, not signalling the chair — shows the room that the door closing afterwards is a narrow legal exception and not a way of avoiding the people who came.",
      holdBreakNote: "You looked down at the packet while she was still speaking. She noticed, and so did the room. Come back to her and let her finish.",
    },
    {
      id: "memo-to-public-table", kind: "select", target: "late-memo-card",
      title: "Put the late memo on the public table as the members get it",
      cue: "Staff just handed the members a memo on an open item. A copy goes on the public table now, not tomorrow.",
      why: "A writing about an open item that is handed to a majority of the board is a public record, and the public should be able to read it at the same time the members do. Putting a copy on the public table the moment it is distributed stops a meeting from being conducted on papers the gallery cannot see, and saves the board a records request it would have to grant anyway.",
    },
    {
      id: "announce-the-closed-session", kind: "sequence",
      targets: ["announce-items", "announce-who-goes-in", "announce-recess", "announce-return"],
      itemNames: {
        "announce-items": "name each item, as it was noticed",
        "announce-who-goes-in": "who goes in: members, counsel, the negotiator",
        "announce-recess": "recess to closed session, in public",
        "announce-return": "when the board will come back and report",
      },
      title: "Announce the closed session in open session, in order",
      cue: "The items as noticed, who will be in the room, the recess, and when the board returns to report.",
      why: "Before the door closes, the public is entitled to hear what is being discussed in there, in the same words the agenda used, and who is going in with the members. Announcing the recess in open session and saying when the board will return turns a closed door into a scheduled pause the public can wait out. Doing it in order matters: naming who goes in before naming the items sounds like a meeting about people rather than a meeting about subjects.",
      outOfOrderNote: "Items, then who goes in, then the recess, then when you return. Recessing before naming the items leaves the gallery watching the door close on something nobody said out loud.",
    },
    {
      id: "stop-what-does-not-belong", kind: "find", noHint: true,
      targets: ["cs-budget-priorities", "cs-member-stipends", "cs-zoning-straw-vote"],
      itemNames: {
        "cs-budget-priorities": "a member's push to settle next year's budget priorities",
        "cs-member-stipends": "a raise for the board members' own stipends",
        "cs-zoning-straw-vote": "a straw poll on next week's zoning item",
      },
      itemNotes: {
        "cs-budget-priorities": "Budget priorities are general policy. They are exactly what the public is entitled to watch being argued over, in open session.",
        "cs-member-stipends": "The personnel exception covers the board's employees, not its own members. What members pay themselves is discussed and decided in public.",
        "cs-zoning-straw-vote": "An item not noticed for closed session, counted in private. It is a vote in all but name, and it hollows out next week's public hearing.",
      },
      decoyNotes: {
        "cs-counsel-briefing": "Counsel's briefing on the anticipated claim is the item that was noticed and belongs here. Stay on it.",
      },
      title: "Stop anything in closed session that was not noticed or does not qualify",
      cue: "Listen to the side table. Mark every topic that has no business behind this door.",
      why: "The drift happens once the door is shut and the room feels private: a member raises the budget, somebody mentions the stipends, the chair asks for a quick sense of next week's vote. None of it was noticed for closed session and none of it qualifies, and a clerk who says nothing has watched a lawful closed session become an unlawful meeting. Naming it on the spot, with counsel, is the clerk's job even when it is awkward.",
    },
    {
      id: "keep-closed-on-topic", kind: "track", target: "topic-meter", seconds: 8,
      title: "Keep the closed session on the noticed items",
      cue: "Hold the discussion inside the band: on the counsel briefing and the evaluation, not drifting and not so rigid counsel cannot advise.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.48, fall: 0.4, drift: 0.16, label: "ON ITEM",
        readout: (v) => (v < 0.3 ? "drifting" : v > 0.7 ? "choking advice" : "on the noticed items"),
      },
      why: "Staying on the noticed items is a continuous job, not a single ruling. Let it slide and the closed session quietly becomes the place where the real decisions are made; hold it so tight that counsel cannot answer a member's question and the board walks out without the advice it went in for. The clerk and counsel keep it in the band together, with a word rather than a lecture, so the minutes can say truthfully what was discussed.",
      holdBreakNote: "The discussion slipped off the noticed items, or got so clipped that counsel could not advise. Bring it back with a quiet word, not a speech.",
    },
    {
      id: "report-out", kind: "sequence", anyOrder: true,
      targets: ["report-action-and-vote", "report-nothing-reportable", "report-documents"],
      itemNames: {
        "report-action-and-vote": "the action taken, and each member's vote",
        "report-nothing-reportable": "the evaluation: no reportable action",
        "report-documents": "where any approved document can be read",
      },
      title: "Report out in open session when the board returns",
      cue: "Say what action was taken and how each member voted, what had nothing to report, and where any document is available.",
      why: "The report out is what makes closed session tolerable in a democracy. When the board approves a settlement or takes a reportable action behind the door, the public hears it at the next open moment, with each member's vote, and learns where any approved document can be read. Saying \"no reportable action\" on the evaluation is also a report: it tells the room the door did not hide a decision.",
    },
    {
      id: "notice-the-special-meeting", kind: "drag", target: "special-notice-card",
      title: "Post the special meeting the chair has just called",
      cue: "The chair wants a special meeting Friday. Written notice has gone to every member and the media who asked — now carry the agenda to the outdoor kiosk.",
      drag: {
        to: "kiosk-socket", radius: 0.6,
        missNote: "Not in the kiosk. A special meeting's agenda is posted where the public can read it, like any other — a notice e-mailed to the members alone is not notice to the public.",
      },
      why: "A special meeting is lawful on shorter notice than a regular one, but it is still noticed: written notice to every member and to the media who have asked for it, the agenda posted where the public can read it, and nothing taken up that was not on it. A special meeting called by phone to a few members, or with an agenda that says \"other business\", is how a board ends up acting on something the public never had a chance to see coming.",
    },
    {
      id: "close-the-clerk-log", kind: "select", target: "clerk-log-board",
      title: "Log the meeting without the closed-session content",
      cue: "Record the posting, the quorum, the recess, the report out and the special-meeting notice — not what was said behind the door.",
      why: "The clerk's log is the proof that the meeting was lawful: when and where the agenda was posted, who was present and how, when the board went in and came out, what was reported, and when the special meeting was noticed. It must not record the confidential content of closed session, which is not the clerk's to publish. A log that proves compliance and protects confidentiality is the whole of the clerk's job in one page.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the deputy clerk before you lock up",
      cue: "Two minutes: how did tonight land on both of you, and who is carrying the special-meeting posting tomorrow?",
      why: "A long meeting with a closed session and a tense gallery lands on the staff who ran it, and the deputy sat through every minute too. Asking how it landed, sharing out tomorrow's posting rather than taking it all yourself, and naming the employee assistance line if something stays with either of you is how a two-person clerk's office gets through budget season without one of them burning out.",
    },
  ],

  interrupts: [
    {
      id: "remote-member-drops",
      kind: "Quorum in doubt",
      after: "hear-closed-session-comment", delay: 3, seconds: 12,
      alert: "The remote member's video has frozen and gone dark in the middle of public comment. Without her, only two members are left at the table.",
      cue: "Pause the item and recount the quorum — the board cannot carry on as if she were still there.",
      target: "recount-quorum-card",
      why: "A member on video counts toward a quorum only while she can be seen and heard. If the feed drops and the remaining members are not a majority, the board has lost its quorum and cannot act, however close the vote was going to be. Pausing, stating it on the record and either restoring the connection or recessing is how the clerk keeps a lawful meeting from turning into two members acting alone.",
      missNote: "The comment ended and the chair moved straight on with two members in the room and a dark screen. Anything the board did in those minutes was done without a quorum, and the minutes will have to say so or say something untrue.",
      wrongNote: "Listening harder to the speaker does not fix the quorum. Pause the item and recount — the screen is the problem.",
    },
    {
      id: "closed-door-filmed",
      kind: "Closed session exposed",
      after: "keep-closed-on-topic", delay: 3, seconds: 12,
      alert: "The closed-session door has swung open behind you, and a resident in the hallway is holding up a phone, filming the room while the evaluation is being discussed.",
      cue: "Close the door and tell the resident, kindly, when the board will come back out to report.",
      target: "close-door-control",
      why: "Closed session is lawful only for the noticed subjects, and the employee being evaluated is entitled to have that discussion stay confidential. The resident has done nothing wrong by standing in a public hallway; the door being open is the board's problem. Closing it and telling her when the report out will happen protects the employee and treats the resident as the member of the public she is, not as an intruder.",
      missNote: "The door stayed open. The evaluation went out on a phone to a neighbourhood feed with the general manager's name on it, and the board spent the next month on a confidentiality problem it created by not closing a door.",
      wrongNote: "The topic meter is for the discussion. The problem is the open door — close it, and tell the resident when the board reports out.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, OML_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? OML_ACCENT, { emissive: o.color ?? OML_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? OML_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0f1a24", accent: o.accent ?? OML_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? OML_CSS, w: o.w ?? 0.48 });
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
      cx.fillStyle = o.bg ?? "rgba(10,18,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? OML_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eef4fa";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#c6d8e8";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? OML_ACCENT, { rough: 0.5, emissive: o.accent ?? OML_ACCENT, ei: 0.25 });
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

    // ------------------------------------------------------------ the boardroom floor
    const carpetTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 9, base: "#2f3a48", base2: "#2a3440", seam: "rgba(12,16,22,0.35)",
    }), { repeat: 3, px: 384 });
    const carpet = box(g, 8.4, 0.02, 6.6, 0, 0.008, -0.5, 0x2f3a48, { rough: 0.95, cast: false });
    carpet.material = texturedMat(carpetTex, { rough: 0.95, metal: 0.02, color: 0x3a4658 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#5a6470", base2: "#535d68", seam: "rgba(20,24,30,0.3)",
    }), { repeat: 2, px: 256 });
    const backWall = box(g, 8.4, 2.8, 0.08, 0, 1.4, -3.75, 0x5a6470, { rough: 0.85 });
    backWall.material = texturedMat(wallTex, { rough: 0.85, metal: 0.02, color: 0x66707c });

    // ------------------------------------------------------------ the horseshoe table
    const woodTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#6a4c32", base2: "#5e432c", seam: "rgba(30,18,8,0.45)",
    }), { repeat: 2, px: 320 });
    const tableTop = box(g, 3.4, 0.05, 0.7, 0, 0.76, -2.55, 0x6a4c32, { rough: 0.6 });
    tableTop.material = texturedMat(woodTex, { rough: 0.6, metal: 0.03, color: 0x7a5a3c });
    box(g, 3.3, 0.7, 0.05, 0, 0.4, -2.22, 0x4a3524, { rough: 0.7 });
    for (const sx of [-1, 1]) {
      box(g, 0.7, 0.05, 1.6, sx * 2.0, 0.76, -1.85, 0x6a4c32, { rough: 0.6 });
      box(g, 0.05, 0.7, 1.5, sx * 1.67, 0.4, -1.85, 0x4a3524, { rough: 0.7 });
    }
    const seal = decal(g, 0.8, 0.8, 0, 1.95, -3.7, (cx, w, h) => {
      cx.fillStyle = "#18222e"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = OML_CSS; cx.lineWidth = w * 0.04;
      cx.beginPath?.(); cx.arc?.(w / 2, h / 2, w * 0.4, 0, Math.PI * 2); cx.stroke?.();
      cx.fillStyle = "#e6eef6"; cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("COMMUNITY", w / 2, h * 0.42); cx.fillText("SERVICES BOARD", w / 2, h * 0.56);
    }, { px: 256, glow: true, ei: 0.4 });
    void seal;

    // Four members at the table; the fifth seat is a screen for the remote member.
    const members = [];
    for (const [mx, mz, ry, cloth] of [
      [-0.9, -2.95, 0, 0x3c4a5c], [0.9, -2.95, 0, 0x5c3c48], [-2.4, -1.85, Math.PI / 2, 0x3f5a4a], [2.4, -2.3, -Math.PI / 2, 0x4d4a3c],
    ]) {
      chair(mx, mz, ry, 0x2f3540);
      members.push(seatedFigure(g, mx, 0.49, mz, { ry, cloth }));
    }
    const screenGrp = group(g, 0, 0, -2.95);
    cyl(screenGrp, 0.12, 0.14, 0.02, 0, 0.79, 0, 0x22262c, { rough: 0.5, metal: 0.5, seg: 12 });
    cyl(screenGrp, 0.02, 0.02, 0.28, 0, 0.93, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    const remoteScreen = decal(screenGrp, 0.5, 0.3, 0, 1.22, 0.02, (cx, w, h) => {
      cx.fillStyle = "#1a2a3a"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#c9a37a"; cx.beginPath?.(); cx.arc?.(w / 2, h * 0.42, h * 0.18, 0, Math.PI * 2); cx.fill?.();
      cx.fillStyle = "#4a5a6a"; cx.fillRect(w * 0.3, h * 0.64, w * 0.4, h * 0.36);
      cx.fillStyle = "#eef4fa"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.textAlign = "left";
      cx.fillText("Remote member · noticed location", w * 0.04, h * 0.12);
    }, { px: 256, glow: true, ei: 0.7 });
    const remoteLive = remoteScreen.material;
    const remoteDark = mat(0x0a0c10, { rough: 0.6 });
    holoTag(screenGrp, "Remote member — on video", 0, 1.52, 0, { css: OML_CSS, w: 0.46 });

    // ------------------------------------------------------------ the clerk's desk
    const desk = group(g, -1.2, 0, -0.75);
    box(desk, 1.2, 0.05, 0.6, 0, 0.76, 0, 0x5d4430, { rough: 0.6 });
    for (const sx of [-1, 1]) box(desk, 0.05, 0.74, 0.5, sx * 0.55, 0.37, 0, 0x4a3524, { rough: 0.7 });
    const laptop = group(desk, 0.3, 0.79, 0);
    box(laptop, 0.34, 0.015, 0.24, 0, 0, 0, 0x2a2d31, { rough: 0.4, metal: 0.5 });
    const web = decal(laptop, 0.32, 0.2, 0, 0.12, -0.12, paperFace("AGENDA — WEBSITE", ["Same as the kiosk", "Posted, not a draft"], { band: "#3a5a7a" }), { px: 192 });
    web.rotation.x = -0.25;
    reg(hits, web, "post-web-agenda");
    // The console dial for recording, stream and hearing loop.
    const consoleGrp = group(desk, -0.35, 0.79, 0.1);
    box(consoleGrp, 0.22, 0.05, 0.16, 0, 0.02, 0, 0x22262c, { rough: 0.5 });
    const dial = cyl(consoleGrp, 0.035, 0.035, 0.035, 0, 0.06, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 12 });
    const liveLamp = ball(consoleGrp, 0.018, 0.08, 0.05, 0.05, 0x5a2020, { rough: 0.4, seg: 10 });
    holoTag(consoleGrp, "Record · stream · loop", 0, 0.2, 0, { css: OML_CSS, w: 0.4 });
    reg(hits, dial, "record-dial");
    card(-1.75, 1.3, -0.95, "quorum-roll", "Roll call · quorum", "ROLL CALL\n4 + 1 ON VIDEO", { w: 0.36, ry: 0.4 });
    card(-0.6, 1.35, -1.1, "recount-quorum-card", "Pause · recount the quorum", "RECOUNT\nQUORUM", { w: 0.5, ry: -0.2, accent: "#f2c14b", css: "#f2c14b" });

    // The litigation card waiting on the desk, and the description meter.
    const litGrp = group(g, -0.9, 0.8, -0.6);
    const litCard = decal(litGrp, 0.28, 0.18, 0, 0, 0, paperFace("CONFERENCE WITH", ["Legal counsel", "Anticipated litigation: 1 case"], { band: "#3a5a7a" }), { px: 192 });
    litCard.rotation.x = -Math.PI / 2.4;
    holoTag(litGrp, "Counsel conference — file it", 0, 0.2, 0, { css: OML_CSS, w: 0.5 });
    reg(hits, litCard, "litigation-card");
    const descStand = stand(0.2, -0.2, -0.2);
    const descGauge = instrument(descStand, 0, 1.02, 0, { idle: "WORDS", color: OML_ACCENT, w: 0.2, d: 0.26 });
    holoTag(descStand, "Item description", 0, 1.22, 0, { css: OML_CSS, w: 0.36 });
    reg(hits, descGauge, "desc-meter");

    // ------------------------------------------------------------ the public side
    const podium = group(g, 1.0, 0, 0.3, Math.PI);
    box(podium, 0.56, 1.05, 0.42, 0, 0.525, 0, 0x5d4430, { rough: 0.65 });
    box(podium, 0.62, 0.05, 0.48, 0, 1.08, 0.02, 0x7a5a3c, { rough: 0.55 });
    const speaker = standingPerson(g, 1.0, 0.72, { ry: Math.PI, cloth: 0x6a5a7a, hiVis: false });
    holoTag(speaker.torso, "Resident — closed-session comment", 0, 1.9, 0, { css: OML_CSS, w: 0.6 }).rotation.y = Math.PI;
    bead(1.55, 1.45, 0.1, "comment-listen", "Hear her to the end", { w: 0.42 });

    // Gallery chairs at the back.
    for (const [gx, gz, cloth] of [[-0.2, 1.7, null], [0.6, 1.7, 0x3a5a6a], [2.2, 1.7, null]]) {
      chair(gx, gz, Math.PI, 0x3a3f46);
      if (cloth) seatedFigure(g, gx, 0.49, gz, { ry: Math.PI, cloth });
    }

    // The public table by the entrance, with the packet and the late memo.
    const pubTable = group(g, 2.9, 0, 0.9, -0.6);
    box(pubTable, 0.9, 0.05, 0.5, 0, 0.74, 0, 0x5d4430, { rough: 0.6 });
    for (const sx of [-1, 1]) box(pubTable, 0.05, 0.72, 0.42, sx * 0.4, 0.36, 0, 0x4a3524, { rough: 0.7 });
    const packets = box(pubTable, 0.24, 0.06, 0.3, -0.2, 0.8, 0, 0xe8e2cc, { rough: 0.8 });
    void packets;
    holoTag(pubTable, "Public table — packet copies", 0, 1.05, 0, { css: "#59c97b", w: 0.5 });
    const memoCopy = box(pubTable, 0.2, 0.012, 0.28, 0.2, 0.775, 0, 0xf6f2e6, { rough: 0.8 });
    memoCopy.visible = false;
    card(2.5, 1.45, -1.3, "late-memo-card", "Late memo — a copy to the public", "STAFF MEMO\nITEM 4", { w: 0.54, ry: -0.6 });
    const specialGrp = group(g, 3.0, 0, -0.2, -0.9);
    const specialCard = decal(specialGrp, 0.32, 0.2, 0, 1.3, 0, signFace("SPECIAL\nMEETING FRI", { bg: "#0f1a24", accent: OML_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
    holoTag(specialGrp, "Special meeting agenda — post it", 0, 1.47, 0.002, { css: OML_CSS, w: 0.56 });
    reg(hits, specialCard, "special-notice-card");

    // ------------------------------------------------------------ the notice kiosk and wall
    const kiosk = group(g, 3.55, 0, -2.6, -0.8);
    cyl(kiosk, 0.04, 0.04, 1.2, 0, 0.6, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    box(kiosk, 0.72, 0.9, 0.1, 0, 1.6, 0, 0x2a3440, { rough: 0.5, metal: 0.3 });
    const kioskAgenda = decal(kiosk, 0.56, 0.4, 0, 1.75, 0.055, paperFace("AGENDA — REGULAR MEETING", ["Posted in advance", "Readable at any hour"], { band: "#3a5a7a" }), { px: 256 });
    reg(hits, kioskAgenda, "post-kiosk-agenda");
    const itemLines = decal(kiosk, 0.56, 0.24, 0, 1.3, 0.055, paperFace("ITEMS", ["1 Evaluation: general manager", "2 Counsel: anticipated litigation"], { band: "#5a7a9a" }), { px: 256 });
    reg(hits, itemLines, "post-item-lines");
    holoTag(kiosk, "Outdoor notice kiosk", 0, 2.2, 0, { css: OML_CSS, w: 0.4 });
    const kioskSocket = box(kiosk, 0.3, 0.2, 0.02, 0.2, 0.95, 0.06, 0x2a3a4a, { rough: 0.6, emissive: 0x59c97b, ei: 0.2 });
    reg(hits, kioskSocket, "kiosk-socket");
    const commentNotice = decal(g, 0.5, 0.3, 2.2, 1.7, -3.7, signFace("YOU MAY ADDRESS\nTHE BOARD", { bg: "#16202a", accent: OML_CSS, scale: 0.34 }), { px: 192, glow: true, ei: 0.6 });
    reg(hits, commentNotice, "post-comment-notice");
    const catering = decal(g, 0.28, 0.2, 1.4, 1.5, -3.7, paperFace("CATERING", ["Dinner break · 6 pm"], { band: "#7a6a3a" }), { px: 128 });
    reg(hits, catering, "post-catering-order");

    // ------------------------------------------------------------ the closed-session room
    // A partition on the left with its own table, the tray, the topic meter,
    // the side-table topics and the door to the hallway.
    box(g, 0.08, 2.2, 2.2, -2.95, 1.1, -1.9, 0x4a5460, { rough: 0.8 });
    const csTable = group(g, -3.55, 0, -2.4);
    box(csTable, 0.6, 0.05, 0.9, 0, 0.74, 0, 0x5d4430, { rough: 0.6 });
    cyl(csTable, 0.05, 0.1, 0.72, 0, 0.36, 0, 0x3a3f46, { rough: 0.5, metal: 0.4, seg: 10 });
    const tray = box(csTable, 0.34, 0.04, 0.26, 0, 0.78, 0.2, 0x2a2d31, { rough: 0.6 });
    holoTag(csTable, "Closed-session tray", 0, 1.0, 0.2, { css: "#59c97b", w: 0.4 });
    reg(hits, tray, "closed-tray");
    const csSign = decal(g, 0.44, 0.2, -3.3, 2.0, -3.7, signFace("CLOSED SESSION", { bg: "#2a1a1a", accent: "#f2c14b", scale: 0.4 }), { px: 192, glow: true, ei: 0.6 });
    void csSign;
    const topics = group(g, -3.6, 0, -1.3, 1.2);
    for (const [tid, label, y, c] of [
      ["cs-budget-priorities", "Next year's budget priorities", 1.62, OML_ACCENT], ["cs-member-stipends", "Raise the members' stipends", 1.42, OML_ACCENT],
      ["cs-zoning-straw-vote", "Straw poll: next week's zoning", 1.22, OML_ACCENT], ["cs-counsel-briefing", "Counsel's briefing on the claim", 1.02, 0x59c97b],
    ]) {
      const b = ball(topics, 0.024, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(topics, label, 0.3, y, 0, { css: OML_CSS, w: 0.56 });
      reg(hits, b, tid);
    }
    const topicStand = stand(-2.6, -0.3, 0.6);
    const topicGauge = instrument(topicStand, 0, 1.02, 0, { idle: "ON ITEM", color: OML_ACCENT, w: 0.2, d: 0.26 });
    holoTag(topicStand, "Closed-session focus", 0, 1.22, 0, { css: OML_CSS, w: 0.4 });
    reg(hits, topicGauge, "topic-meter");
    // The hallway door, hinged at its left edge.
    const doorHinge = group(g, -3.9, 0, -0.45, 0);
    const door = box(doorHinge, 0.9, 2.05, 0.05, 0.45, 1.03, 0, 0x6a5a4a, { rough: 0.6 });
    void door;
    box(g, 0.08, 2.2, 0.08, -2.95, 1.1, -0.45, 0x3a3f46, { rough: 0.6 });
    const hallResident = standingPerson(g, -3.5, 0.35, { ry: Math.PI, cloth: 0x7a4a3a, hiVis: false });
    hallResident.root.visible = false;
    const residentPhone = box(hallResident.torso, 0.07, 0.13, 0.01, 0.18, 1.35, -0.25, 0x1b1f24, { rough: 0.4, emissive: 0x7fc4d8, ei: 0.6 });
    void residentPhone;
    card(-2.4, 1.35, 0.45, "close-door-control", "Close the door · report-out time", "CLOSE DOOR\nREPORT AT 8", { w: 0.58, ry: 0.5, accent: "#f2c14b", css: "#f2c14b" });

    // ------------------------------------------------------------ the report out
    const report = group(g, 3.4, 0, 0.05, -1.2);
    cyl(report, 0.022, 0.022, 1.6, 0, 0.8, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [rid, label, y] of [
      ["report-action-and-vote", "Action + each vote", 0.9], ["report-nothing-reportable", "No reportable action", 1.18], ["report-documents", "Where to read it", 1.46],
    ]) {
      const b = ball(report, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(report, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.4 });
      reg(hits, b, rid);
    }
    const announce = group(g, -1.9, 0, 0.75, 0.6);
    cyl(announce, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [aid, label, y] of [
      ["announce-items", "1 · The items, as noticed", 0.75], ["announce-who-goes-in", "2 · Who goes in", 1.05],
      ["announce-recess", "3 · Recess, in public", 1.35], ["announce-return", "4 · When we report", 1.65],
    ]) {
      const b = ball(announce, 0.026, 0, y, 0, OML_ACCENT, { emissive: OML_ACCENT, ei: 1.5, seg: 12 });
      holoTag(announce, label, 0.2, y, 0, { css: OML_CSS, w: 0.46 });
      reg(hits, b, aid);
    }

    // ------------------------------------------------------------ the wrong moves
    const ballot = group(g, 1.6, 0.79, -2.55);
    box(ballot, 0.2, 0.18, 0.16, 0, 0.09, 0, 0x8a3a30, { rough: 0.6 });
    holoTag(ballot, "Secret ballot on the appointment?", 0, 0.34, 0, { css: "#f0645b", w: 0.6 });
    reg(hits, ballot.children[0], "secret-ballot-box");
    card(-0.1, 1.2, -1.3, "forward-evaluation-memo", "Forward the evaluation to the reporter?", "FWD: EVAL\nMEMO", {
      w: 0.64, ry: 0.1, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    bead(0.5, 1.2, 1.1, "clear-the-gallery", "Clear the whole room?", { color: 0xf0645b, css: "#f0645b", w: 0.44 });
    const binders = group(g, -2.3, 0.79, -0.95);
    const binderStack = box(binders, 0.26, 0.2, 0.32, 0, 0.1, 0, 0x3a5a7a, { rough: 0.7 });
    holoTag(binders, "Rebuild the packet alone overnight?", 0, 0.4, 0, { css: "#f0645b", w: 0.62 });
    reg(hits, binderStack, "rebuild-packet-overnight");

    // ------------------------------------------------------------ closing boards
    const log = board(0.56, 0.4, 2.2, 1.95, 1.75, (cx, w, h) => lines(cx, w, h, "CLERK'S LOG", [
      "Posting · quorum · recess", "Report out · special notice", "Nothing confidential",
    ]), { ry: -0.6 });
    reg(hits, log.userData.face, "clerk-log-board");
    const checkin = board(0.5, 0.36, -2.4, 1.95, 1.75, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", [
      "How did tonight land?", "Who posts Friday's notice?", "Employee assistance line",
    ], { accent: "#7fc4d8" }), { ry: 0.6, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const guide = board(0.62, 0.32, 0, 2.6, -3.68, (cx, w, h) => lines(cx, w, h, "THE DOOR IS NARROW", [
      "Only what was noticed goes behind it.",
    ], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.13);
    });

    // ------------------------------------------------------------ the deputy clerk
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const deputy = standingFigure(g, -0.9, 1.35, { ry: 2.6, cloth: 0x2f3946, trousers: 0x262d36 });
    holoTag(deputy, "Deputy clerk", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.3 }).rotation.y = -2.6;

    let live = false;
    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.1, -2.0),

      onStepComplete(step) {
        if (step.id === "bring-the-recording-up") {
          live = true;
          liveLamp.material = mat(0xe04040, { emissive: 0xe04040, ei: 1.4, rough: 0.4 });
          dial.material = mat(0x59c97b, { rough: 0.3, metal: 0.6, emissive: 0x59c97b, ei: 0.5 });
        }
        if (step.id === "sort-the-litigation-item") {
          litGrp.position.set(-3.55, 0.8, -2.2);
          litCard.rotation.x = -Math.PI / 2;
          tray.material = mat(0x59c97b, { rough: 0.6, emissive: 0x59c97b, ei: 0.4 });
        }
        if (step.id === "memo-to-public-table") memoCopy.visible = true;
        if (step.id === "notice-the-special-meeting") {
          specialGrp.position.set(3.55, 0, -2.6);
          specialGrp.rotation.y = -0.8;
          specialCard.position.set(0.2, 0.95, 0.075);
          kioskSocket.material = mat(0x59c97b, { rough: 0.6, emissive: 0x59c97b, ei: 0.4 });
        }
        if (step.id === "report-out") {
          repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "REPORTED OUT", ["Settlement approved 4–0", "Evaluation: nothing to report"], { accent: "#59c97b" }));
        }
        if (step.id === "close-the-clerk-log") {
          repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "MEETING LOGGED", ["Lawful from posting to report", "Friday noticed"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      onHazard(id, s) {
        if (id === "forward-evaluation-memo" || id === "clear-the-gallery" || id === "secret-ballot-box") {
          speaker.root.rotation.y = Math.PI - 0.8;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. The public's trust in this room is the whole job.");
        }
      },

      onInterrupt(it) {
        if (it.id === "remote-member-drops") remoteScreen.material = remoteDark;
        if (it.id === "closed-door-filmed") {
          doorHinge.rotation.y = 1.2;
          hallResident.root.visible = true;
          hallResident.arms[1].shoulder.rotation.x = -1.4;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "remote-member-drops") remoteScreen.material = remoteLive;
        if (it.id === "closed-door-filmed") {
          doorHinge.rotation.y = 0;
          hallResident.arms[1].shoulder.rotation.x = 0;
          hallResident.root.visible = false;
        }
      },

      animate(t, dt, session) {
        if (live) liveLamp.material.emissiveIntensity = 1.0 + Math.sin(t * 3) * 0.4;
        speaker.head.rotation.x = Math.sin(t * 0.8) * 0.05;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "describe-the-item") {
          const ok = gg.t >= 0.25 && gg.t <= 0.5;
          repaint(descGauge.userData.screen, signFace(`${Math.round(2 + gg.t * 36)} WORDS`, {
            bg: "#0f1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#eef4fa", scale: 0.52,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "keep-closed-on-topic" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(topicGauge.userData.screen, signFace(ok ? "ON ITEM" : tr.v < 0.3 ? "DRIFTING" : "TOO TIGHT", {
            bg: "#0f1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#eef4fa", scale: 0.5,
          }));
        }
      },
    };
  },
};
