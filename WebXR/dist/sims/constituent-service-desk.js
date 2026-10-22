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

// SmartCiti.X~ Constituent Service Desk VR — Civic Leadership and Emotional
// Intelligence, station two.
//
// A district office on a weekday afternoon. The learner is the caseworker at
// the desk; across it sits a tenant who has called twice about no heat and
// black mould and never heard back. Behind her, a queue. On the desk, a phone
// that will ring with somebody important on the other end, a sticky note that
// should not exist, and an envelope from the landlord's property manager.
//
// The principle it practises is keep your word — say only what the office can
// do, give a date the office can meet, and meet it — together with listen
// first. These are principles commonly taught in civic-leadership programmes;
// the foundation whose principles the module draws on is not sourced in this
// repository. No real office, landlord or person is depicted.

const CSD_ACCENT = 0x5fb3a1;
const CSD_CSS = "#5fb3a1";

export const SIM_CONSTITUENT_SERVICE_DESK = {
  id: "constituent-service-desk",
  index: "218",
  domain: "Civic",
  trade: "District office caseworker",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "clear",
  certification: "Title II of the ADA for an accessible counter and effective communication, including a language or sign interpreter on request; SAMHSA's trauma-informed care principles and Psychological First Aid (NCTSN) for a resident who arrives exhausted and angry; the Political Reform Act and the city ethics code for a gift from a party to a complaint and for favouring a donor's case; SEIU and AFSCME for the public-service staff who work the desk. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
  name: "Constituent Service Desk",
  title: simTitle("Constituent Service Desk"),
  tagline: "A tenant with no heat, two unreturned calls and a queue behind her: hear it all, route it right, promise only a date you can keep, own the office's miss — and send her away with a name, a number and a day",
  accent: CSD_ACCENT,
  accentCss: CSD_CSS,
  parSeconds: 330,
  footprint: 2.4,
  badge: { id: "word-kept", name: "Word Kept", note: "Every commitment made at the desk was one the office could keep, and the resident left with it in writing" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your employee assistance program, or the supervisor who has sat through a hard counter shift and will hear you out",

  game: system({
    name: "Casework",
    currency: "FOLLOW-THROUGH",
    ranks: ["Intake Aide", "Caseworker", "Senior Caseworker", "District Director", "Casework Mentor"],
    badges: [
      { id: "door-open", name: "Door Open", note: "Every barrier in the lobby noticed before the resident sat down", test: AWARD.stepClean("read-the-lobby") },
      { id: "nothing-overpromised", name: "Nothing Overpromised", note: "No unsafe action anywhere at the desk", test: AWARD.safe },
      { id: "heard-to-the-end", name: "Heard to the End", note: "The listening and the steady voice both carried their full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-case", name: "Clean Case", note: "No corrections anywhere in the visit", test: AWARD.clean },
      { id: "honest-date", name: "Honest Date", note: "The follow-up date set inside the band", test: AWARD.precise(0.7) },
      { id: "eight-straight", name: "Eight Straight", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "not-our-department": "You told her it is not this office's department. It may be true, and it is still the sentence that sends a tenant back out into the cold with nothing — she came here because every other door already said it. Take the case, route it yourself, and tell her where it went.",
    "inspector-tomorrow": "You promised an inspector at her door tomorrow. Code enforcement schedules its own inspections and this office cannot order one; the promise feels kind for exactly as long as it takes tomorrow to arrive without anybody knocking.",
    "donor-first-note": "You worked the sticky note that says to put a donor's parking complaint first. Using a public office's time to favour a supporter over the resident in front of you is misuse of position under the city ethics code, and the queue can see whose case jumped it.",
    "manager-envelope": "You took the envelope from the landlord's property manager. A gift from a party to an open complaint is the plainest conflict there is — reportable at best, disqualifying at worst — and it will be the first thing anyone asks about if her case goes wrong.",
  },

  lateNotes: {
    "case-card": "The case gets routed once you have the whole story and her consent to share it — take the intake first.",
    "commitment-log-board": "The log closes on commitments you have actually made. Give her the case number, your line and the date first.",
  },

  steps: [
    {
      id: "read-the-lobby", kind: "find", noHint: true,
      targets: ["lobby-language-line", "lobby-low-counter", "lobby-queue-display"],
      itemNames: {
        "lobby-language-line": "the language line phone for interpretation",
        "lobby-low-counter": "the lowered counter section",
        "lobby-queue-display": "the queue display — forty minutes and climbing",
      },
      itemNotes: {
        "lobby-language-line": "The interpreter line is how a resident who is more comfortable in another language gets the same visit as everybody else. Know where it is before you need it.",
        "lobby-low-counter": "The lowered section is where a wheelchair user or a resident who cannot stand for long is served — not a spare shelf for brochures.",
        "lobby-queue-display": "Forty minutes is a long time to wait for help with no heat. Everybody in that line has already decided something about this office.",
      },
      decoyNotes: {
        "lobby-brochure-rack": "The brochure rack is fine as it is. It is information, not a barrier to anybody getting served.",
      },
      title: "Read the lobby before you call the next number",
      cue: "Three things in this room decide whether everybody in it can actually be served.",
      why: "A service desk is open to the people who can reach it, understand it and wait for it. An interpreter line nobody knows about, a counter only standing people can use and a queue nobody has spoken to for forty minutes all close the door quietly, and the residents they close it on are the ones with the fewest other places to go. The caseworker checks the room before the first case, not after a complaint.",
    },
    {
      id: "greet-by-name", kind: "select", target: "greeting-card",
      title: "Greet her by name and offer a seat",
      cue: "Call her name from the ticket, introduce yourself, and offer the chair at the lowered counter.",
      why: "She has waited forty minutes and been passed between offices for weeks. Her own name said correctly, your name offered in return and a chair pulled out tells her in five seconds that this visit is going to be different — which is the only thing that makes her willing to tell the whole story rather than the short, angry version she has rehearsed in the queue.",
    },
    {
      id: "listen-uninterrupted", kind: "hold", target: "listen-marker", seconds: 8,
      title: "Listen to the whole story without interrupting",
      cue: "Hold your attention on her. No typing, no questions yet, no glancing at the phone.",
      why: "Listening first is how a caseworker finds out what the case actually is. The heat is the complaint; the mould in her child's room, the two unreturned calls and the landlord's threat to raise the rent if she complains again are the case. Interrupt to fill in a form field and she will answer the field and never mention the part that matters.",
      holdBreakNote: "You looked away to type. She stopped mid-sentence and started again more briefly. Put the keyboard down and let her finish.",
    },
    {
      id: "take-the-case", kind: "sequence",
      targets: ["case-what-happened", "case-what-she-wants", "case-what-she-tried", "case-consent-to-share"],
      itemNames: {
        "case-what-happened": "what happened, in her words",
        "case-what-she-wants": "what she wants to happen",
        "case-what-she-tried": "what she has already tried",
        "case-consent-to-share": "her consent to share it with the department",
      },
      title: "Take the case in order",
      cue: "The facts in her words, then the outcome she wants, then what she has already tried, then her consent to share.",
      why: "The order protects her. Her own account comes first so nothing is filtered through your categories; what she wants comes next, because the interest behind \"fix my heat\" might be \"keep my lease\"; what she has already tried stops you sending her back to the office that already failed her; and consent comes before anything leaves this desk, because a retaliation-wary tenant decides for herself whether her name reaches the landlord.",
      outOfOrderNote: "Facts, then what she wants, then what she tried, then consent. Sharing before consent can put a tenant's name in front of the landlord she is afraid of.",
    },
    {
      id: "route-to-department", kind: "drag", target: "case-card",
      title: "Route the case to the department that can act",
      cue: "Carry the case card to the code enforcement tray yourself — she does not go back out to find it.",
      drag: {
        to: "code-enforcement-tray", radius: 0.5,
        missNote: "Not in the code enforcement tray. Heat and mould in a rental are a housing code case; filed anywhere else it waits in the wrong queue while she waits in the cold.",
      },
      why: "Routing is the part of casework the resident never sees and always feels. Put in the right department's queue, with her words and her consent attached, the case starts moving today; handed back to her as a phone number, it becomes her third attempt to explain the same problem to a stranger. The office does the walking so that she does not have to.",
    },
    {
      id: "set-a-real-date", kind: "gauge", target: "follow-up-dial",
      title: "Set a follow-up date the office can actually meet",
      cue: "Commit to a callback date inside the band — not tomorrow to please her, not a month out to be safe.",
      gauge: {
        label: "CALL BACK IN", speed: 0.62, green: [0.3, 0.52],
        readout: (t) => `${Math.max(1, Math.round(1 + t * 20))} working days`,
        missNote: "Outside the band. Too soon is a promise you already know you will miss; too far is the same as not calling. Pick the date the department's own queue can support and say it out loud.",
      },
      why: "Keep your word starts with choosing a word you can keep. A date too close to be real feels generous at the desk and becomes the office's third broken promise to her by Friday; a date too far away tells her the case does not matter. The honest date is the one the department's actual queue supports, said plainly, written down, and met.",
    },
    {
      id: "say-what-you-cannot-do", kind: "select", target: "limits-card",
      title: "Tell her plainly what the office can and cannot do",
      cue: "\"I can't order an inspection. I can put your case in front of the people who do, today, and chase it.\"",
      why: "Residents are almost never angry about limits honestly stated; they are angry about limits discovered later. Saying out loud that the office cannot order an inspector, cannot stop a rent increase, but can escalate, track and chase gives her a true picture to plan around — and it is the ground every later promise stands on.",
    },
    {
      id: "open-the-tracker", kind: "turn", target: "tracker-dial",
      title: "Open the case in the tracker",
      cue: "Turn the tracker from NEW to OPEN so the case, the date and your name are on the record.",
      turn: { turns: 0.5, axis: "y", label: "CASE STATUS" },
      why: "A commitment that only lives in a caseworker's memory ends when the caseworker is out sick. Opening the case in the tracker, with her consent, the department it went to and the callback date, turns a kind conversation into an obligation the whole office can see — which is exactly why her first two calls, logged nowhere, went nowhere.",
    },
    {
      id: "steady-voice", kind: "track", target: "tone-meter", seconds: 8,
      title: "Keep your voice steady while she vents",
      cue: "She is angry at the office, not at you. Hold your tone in the band — not cold, not placating.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.5, fall: 0.42, drift: 0.16, label: "TONE",
        readout: (v) => (v < 0.3 ? "cold" : v > 0.7 ? "placating" : "steady"),
      },
      why: "Her anger is information: it tells you how long this has gone on and how many times she has been dismissed. A cold, procedural voice confirms that she is a file; a placating one starts making promises to make the anger stop. Steady — warm, level, taking it without defending the office — is what lets the anger run its course and the conversation come back.",
      holdBreakNote: "Your tone slipped — colder, or softer than the facts. Come back to level: you do not have to defend the office or rescue the moment, only stay with her.",
    },
    {
      id: "check-the-history", kind: "find", noHint: true,
      targets: ["history-two-calls-unreturned", "history-no-inspection-logged", "history-wrong-unit"],
      itemNames: {
        "history-two-calls-unreturned": "two earlier calls, never returned",
        "history-no-inspection-logged": "an inspection request never logged",
        "history-wrong-unit": "the wrong unit number on the old record",
      },
      itemNotes: {
        "history-two-calls-unreturned": "She called twice. Somebody wrote it down and nobody called back. That is this office's miss, not hers.",
        "history-no-inspection-logged": "The request she was told was sent never reached code enforcement. Say so.",
        "history-wrong-unit": "An inspector sent to the wrong door finds nothing wrong. Correct it now or the whole case fails again.",
      },
      decoyNotes: {
        "history-closed-duplicate": "A duplicate entry closed as a duplicate is ordinary housekeeping; it is not the reason her case stalled.",
      },
      title: "Check the case history for what the office got wrong",
      cue: "Open her old record. Mark every place the office dropped it.",
      why: "Before you can own a miss you have to find it. The history shows two calls taken and never returned, a request that was never actually sent, and a unit number that would have sent an inspector to a neighbour's door. Reading it honestly, with her in the chair, is the difference between repeating the office's failure and correcting it.",
    },
    {
      id: "own-the-miss", kind: "select", target: "own-it-card",
      title: "Own the office's miss, without excuses",
      cue: "\"You called twice and nobody called you back. That was us, and I'm sorry. Here is what I'm doing differently.\"",
      why: "An apology that names the actual failure, takes it for the office and moves straight to what changes is the fastest way back to trust. Explaining the staffing shortage, the new system or the colleague who left turns the apology into a defence, and she has heard enough of those. Owning it costs one sentence; not owning it costs her belief in everything you say next.",
    },
    {
      id: "leave-with-three-things", kind: "sequence", anyOrder: true,
      targets: ["give-case-number", "give-direct-line", "give-callback-day"],
      itemNames: {
        "give-case-number": "the case number",
        "give-direct-line": "your name and direct line",
        "give-callback-day": "the day you will call her",
      },
      title: "Send her away with three things in writing",
      cue: "Case number, your name and direct line, and the day you will call — on one card she can keep.",
      why: "The card is the promise in a form she can hold the office to. A case number means she never has to tell the story from the beginning again; a direct line means her next call reaches a person who knows her; the day written down means everybody, including you, knows exactly when your word falls due.",
    },
    {
      id: "log-commitments", kind: "select", target: "commitment-log-board",
      title: "Log every commitment you made",
      cue: "Record the routing, the corrected unit number, the apology and the callback date against her case.",
      why: "The log is what makes the callback happen when this afternoon is a blur. Every commitment made at the desk goes against the case — where it went, what was corrected, when you will call — so that your supervisor can see it, a colleague can cover it and the resident's third call, if it comes, lands on a record instead of a blank.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with your supervisor before the next number",
      cue: "Two minutes: how did that one land, and is there anything you need before the next case?",
      why: "A shift at a service counter is a shift of other people's worst weeks, and the case that ends well still leaves something behind. A two-minute check with the supervisor — how did it land, is the queue manageable, the employee assistance line if it stays with you — is what keeps a good caseworker in the job long enough to get very good at it.",
    },
  ],

  interrupts: [
    {
      id: "member-office-calls",
      kind: "Pressure from above",
      after: "listen-uninterrupted", delay: 3, seconds: 12,
      alert: "The desk phone lights up: the council member's office, wanting you to drop what you are doing and handle a supporter's parking complaint right now.",
      cue: "Take the callback slip: tell them you will call back when this resident's visit is done.",
      target: "callback-slip",
      why: "The resident in the chair came first and waited forty minutes. Telling the member's office, politely, that you will call back when this visit is done keeps the queue honest and keeps the office's time from being spent on whoever has the closest connection — which is the fairness the whole district office exists to provide.",
      missNote: "The phone rang on through her story and then you picked it up mid-sentence. She watched a supporter's parking complaint jump her no-heat case, and she will tell every neighbour in the queue exactly what that looked like.",
      wrongNote: "Not by abandoning her — the case in front of you comes first. The slip is how you answer the phone without leaving the conversation.",
    },
    {
      id: "queue-filming",
      kind: "Frustration in the queue",
      after: "steady-voice", delay: 3, seconds: 12,
      alert: "A man in the queue has stepped forward holding up his phone, filming, and saying loudly that this office never helps anybody.",
      cue: "Update the queue: say the wait time and that everybody will be seen today.",
      target: "queue-update-board",
      why: "The man filming is the queue's frustration made visible, and the answer is information, not a confrontation. Telling the whole line the real wait, that everybody will be seen, and that urgent cases can say so now brings them into the process instead of shutting them out of it — and it lets the resident in front of you finish her visit.",
      missNote: "The queue got louder, two people left without being seen, and the video that goes up tonight shows a caseworker who looked straight past a room full of people who had been waiting an hour.",
      wrongNote: "The tone meter is for the resident in front of you. The queue needs information: the wait, the plan, and that they will be seen.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, CSD_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? CSD_ACCENT, { emissive: o.color ?? CSD_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? CSD_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0b1d19", accent: o.accent ?? CSD_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? CSD_CSS, w: o.w ?? 0.48 });
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
      cx.fillStyle = o.bg ?? "rgba(8,22,19,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? CSD_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e8faf5";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#bfe3da";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? CSD_ACCENT, { rough: 0.5, emissive: o.accent ?? CSD_ACCENT, ei: 0.25 });
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

    // ------------------------------------------------------------ the office floor
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#5d676c", base2: "#535c61", seam: "rgba(20,26,28,0.4)",
    }), { repeat: 3, px: 384 });
    const floor = box(g, 8.2, 0.02, 6.6, 0, 0.008, -0.5, 0x5d676c, { rough: 0.9, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.02, color: 0x6a7479 });

    // The long public counter along the back, with its lowered section.
    const counterTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#3f5a55", base2: "#36504b", seam: "rgba(10,20,18,0.45)",
    }), { repeat: 2, px: 320 });
    const counterFront = box(g, 5.2, 1.05, 0.1, 0.4, 0.525, -3.0, 0x3f5a55, { rough: 0.7 });
    counterFront.material = texturedMat(counterTex, { rough: 0.7, metal: 0.03, color: 0x4f6b66 });
    box(g, 5.3, 0.05, 0.55, 0.4, 1.07, -3.2, 0xb8c2c0, { rough: 0.4 });
    const low = group(g, -2.7, 0, -3.0);
    box(low, 1.2, 0.76, 0.1, 0, 0.38, 0, 0x4f6b66, { rough: 0.7 });
    const lowTop = box(low, 1.25, 0.05, 0.55, 0, 0.78, -0.2, 0xd2dbd8, { rough: 0.4 });
    holoTag(low, "Lowered counter", 0, 1.0, 0.05, { css: CSD_CSS, w: 0.36 });
    reg(hits, lowTop, "lobby-low-counter");
    // Staff behind the counter.
    standingPerson(g, 1.4, -3.55, { cloth: 0x3a4a5a, hiVis: false });

    // ------------------------------------------------------------ the caseworker's desk
    const desk = group(g, 0, 0, -1.1);
    box(desk, 1.8, 0.05, 0.85, 0, 0.76, 0, 0x6b5a48, { rough: 0.55 });
    for (const sx of [-1, 1]) box(desk, 0.05, 0.74, 0.75, sx * 0.85, 0.37, 0, 0x55463a, { rough: 0.7 });
    box(desk, 1.7, 0.5, 0.03, 0, 0.5, -0.38, 0x55463a, { rough: 0.7 });
    // Monitor, with the sticky note that should not be there.
    box(desk, 0.55, 0.34, 0.03, -0.35, 1.08, 0.2, 0x1b1f24, { rough: 0.4 });
    decal(desk, 0.5, 0.29, -0.35, 1.08, 0.218, (cx, w, h) => {
      cx.fillStyle = "#12302a"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#9fe0cf"; cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      ["CASE TRACKER", "Queue: 7 waiting", "Oldest: 41 min"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.1 + i * 0.2)));
    }, { px: 256, glow: true, ei: 0.7 });
    cyl(desk, 0.03, 0.08, 0.1, -0.35, 0.86, 0.2, 0x2a2e33, { rough: 0.5, seg: 10 });
    const sticky = decal(g, 0.12, 0.12, -0.07, 1.2, -0.88, signFace("DONOR —\nDO FIRST", { bg: "#f2d64b", fg: "#3a2a00", accent: "#c0392b", scale: 0.26 }), { px: 128 });
    holoTag(g, "Donor's case first?", -0.07, 1.36, -0.88, { css: "#f0645b", w: 0.4 });
    reg(hits, sticky, "donor-first-note");
    // Phone and its callback slip.
    const phone = group(desk, 0.55, 0.79, 0.15);
    box(phone, 0.2, 0.05, 0.16, 0, 0, 0, 0x22262c, { rough: 0.5 });
    const handset = box(phone, 0.22, 0.04, 0.06, 0, 0.045, -0.04, 0x2e333a, { rough: 0.5 });
    const phoneLamp = ball(phone, 0.014, 0.07, 0.04, 0.06, 0x2a3a2a, { rough: 0.4, seg: 8 });
    bead(0.95, 1.1, -1.0, "callback-slip", "Callback slip — after this visit", { color: 0xf2c14b, css: "#f2c14b", w: 0.56 });
    // The case tracker dial and the case card.
    const trackerGrp = group(g, -0.75, 0.79, -0.85);
    box(trackerGrp, 0.18, 0.04, 0.14, 0, 0.02, 0, 0x22262c, { rough: 0.5 });
    const trackerKnob = cyl(trackerGrp, 0.035, 0.035, 0.035, 0, 0.055, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 12 });
    holoTag(trackerGrp, "Case status", 0, 0.2, 0, { css: CSD_CSS, w: 0.3 });
    reg(hits, trackerKnob, "tracker-dial");
    const caseGrp = group(g, 0.25, 0.8, -0.85);
    const caseCard = decal(caseGrp, 0.26, 0.18, 0, 0, 0, paperFace("CASE — NO HEAT", ["Heat off 3 weeks · mould", "Consent to share: yes"], { band: "#2f6a5e" }), { px: 192 });
    caseCard.rotation.x = -Math.PI / 2.3;
    holoTag(caseGrp, "Her case", 0, 0.16, 0, { css: CSD_CSS, w: 0.24 });
    reg(hits, caseCard, "case-card");
    // The envelope from the property manager.
    const env = decal(g, 0.2, 0.12, 0.62, 0.815, -0.7, signFace("THANK YOU", { bg: "#f0ead8", fg: "#5a3a1a", accent: "#b0453a", scale: 0.36 }), { px: 128 });
    env.rotation.x = -Math.PI / 2;
    holoTag(g, "Envelope from the property manager?", 0.62, 0.98, -0.7, { css: "#f0645b", w: 0.62 });
    reg(hits, env, "manager-envelope");

    // The resident, seated across the desk, facing the learner's side.
    chair(0, -1.85, 0, 0x3a4a52);
    const resident = seatedFigure(g, 0, 0.49, -1.8, { ry: 0, cloth: 0x7a4a5a });
    holoTag(resident.torso, "Tenant — no heat", 0, 1.4, 0.1, { css: CSD_CSS, w: 0.4 });
    chair(0.2, -0.3, Math.PI, 0x3a4a52);
    bead(-0.4, 1.45, -0.55, "listen-marker", "Listen — all of it", { w: 0.4 });
    bead(0.5, 1.45, -0.45, "not-our-department", "\"Not our department\"", { color: 0xf0645b, css: "#f0645b", w: 0.48 });

    // ------------------------------------------------------------ the intake ladder
    const ladder = group(g, 1.75, 0, -0.4, -0.5);
    cyl(ladder, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["case-what-happened", "1 · What happened", 0.75], ["case-what-she-wants", "2 · What she wants", 1.05],
      ["case-what-she-tried", "3 · What she tried", 1.35], ["case-consent-to-share", "4 · Consent to share", 1.65],
    ]) {
      const b = ball(ladder, 0.026, 0, y, 0, CSD_ACCENT, { emissive: CSD_ACCENT, ei: 1.5, seg: 12 });
      holoTag(ladder, label, 0.2, y, 0, { css: CSD_CSS, w: 0.42 });
      reg(hits, b, lid);
    }

    // The follow-up dial and the tone meter on their stands.
    const dateStand = stand(-1.55, -0.2, 0.4);
    const dateGauge = instrument(dateStand, 0, 1.02, 0, { idle: "DAYS", color: CSD_ACCENT, w: 0.2, d: 0.26 });
    holoTag(dateStand, "Call back in", 0, 1.22, 0, { css: CSD_CSS, w: 0.32 });
    reg(hits, dateGauge, "follow-up-dial");
    const toneStand = stand(1.3, 0.55, -0.4);
    const toneGauge = instrument(toneStand, 0, 1.02, 0, { idle: "TONE", color: CSD_ACCENT, w: 0.2, d: 0.26 });
    holoTag(toneStand, "Your tone", 0, 1.22, 0, { css: CSD_CSS, w: 0.28 });
    reg(hits, toneGauge, "tone-meter");

    card(-1.2, 1.3, 0.35, "greeting-card", "Her name · your name · a seat", "WELCOME —\nTICKET 41", { w: 0.56, ry: 0.4 });
    card(-2.0, 1.3, 0.9, "limits-card", "What we can and can't do", "I CAN'T ORDER IT.\nI CAN CHASE IT.", { w: 0.52, ry: 0.6 });
    card(0.7, 1.35, 0.4, "own-it-card", "Own the miss", "THAT WAS US.\nI'M SORRY.", { w: 0.36, ry: -0.2 });
    card(2.3, 1.3, 0.7, "inspector-tomorrow", "Inspector tomorrow — promise it?", "INSPECTOR\nTOMORROW!", {
      w: 0.6, ry: -0.7, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });

    // The card she leaves with: three things on it.
    const leave = group(g, -2.3, 0, -0.5, 0.9);
    cyl(leave, 0.022, 0.022, 1.6, 0, 0.8, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [["give-case-number", "Case number", 0.9], ["give-direct-line", "Your name + direct line", 1.18], ["give-callback-day", "The day you'll call", 1.46]]) {
      const b = ball(leave, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(leave, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.46 });
      reg(hits, b, lid);
    }

    // ------------------------------------------------------------ the routing trays
    const trays = group(g, 2.9, 0, -1.6, -0.9);
    box(trays, 0.9, 1.1, 0.35, 0, 0.55, 0, 0x4a5358, { rough: 0.6 });
    const ceTray = box(trays, 0.8, 0.04, 0.3, 0, 1.12, 0.02, 0x2a2d31, { rough: 0.6 });
    holoTag(trays, "Code enforcement", 0, 1.32, 0.05, { css: "#59c97b", w: 0.4 });
    reg(hits, ceTray, "code-enforcement-tray");
    for (const [ty, label] of [[0.8, "Public works"], [0.5, "Parks"]]) {
      box(trays, 0.8, 0.03, 0.3, 0, ty, 0.03, 0x2a2d31, { rough: 0.6 });
      decal(trays, 0.4, 0.06, 0, ty + 0.06, 0.19, signFace(label.toUpperCase(), { bg: "#16202a", accent: "#7fc4d8", scale: 0.6 }), { px: 128 });
    }

    // ------------------------------------------------------------ the lobby side
    const phoneSign = board(0.46, 0.32, -3.4, 1.6, -1.6, (cx, w, h) => lines(cx, w, h, "LANGUAGE LINE", ["Interpreter by phone", "Ask at the desk"], { accent: "#7fc4d8" }), { ry: 1.0, accent: 0x7fc4d8 });
    reg(hits, phoneSign.userData.face, "lobby-language-line");
    const queueBoard = board(0.6, 0.4, 3.3, 2.0, 0.2, (cx, w, h) => lines(cx, w, h, "NOW SERVING 41", ["Waiting: 7", "Oldest wait: 41 min"]), { ry: -1.1 });
    reg(hits, queueBoard.userData.face, "lobby-queue-display");
    const updateBoard = board(0.44, 0.28, 3.05, 1.35, 0.95, (cx, w, h) => lines(cx, w, h, "QUEUE UPDATE", ["Wait time · who's next", "Urgent? Tell us now"], { accent: "#f2c14b" }), { ry: -1.0, accent: 0xf2c14b });
    reg(hits, updateBoard.userData.face, "queue-update-board");
    const rack = group(g, -3.4, 0, 0.6, 1.2);
    box(rack, 0.5, 1.2, 0.2, 0, 0.6, 0, 0x5a6a70, { rough: 0.6 });
    const brochures = box(rack, 0.44, 0.3, 0.06, 0, 0.95, 0.12, 0xd8e0e0, { rough: 0.8 });
    reg(hits, brochures, "lobby-brochure-rack");

    // The queue: two residents waiting, one of whom steps forward to film.
    standingPerson(g, 3.5, 1.9, { ry: -2.4, cloth: 0x4a4a6a, hiVis: false });
    const filmer = standingPerson(g, 3.8, 1.2, { ry: -2.0, cloth: 0x6a5a3a, hiVis: false });
    const filmPhone = box(g, 0.07, 0.13, 0.01, 3.2, 1.45, 0.9, 0x1b1f24, { rough: 0.4 });
    filmPhone.visible = false;

    // History panel and the closing boards.
    const history = board(0.66, 0.46, -1.0, 1.9, -2.3, (cx, w, h) => lines(cx, w, h, "HER CASE HISTORY", ["Tap every place the office dropped it"]), { ry: 0.25 });
    void history;
    const histRows = group(g, -1.3, 0, -2.1, 0.25);
    for (const [hid, label, y, c] of [
      ["history-two-calls-unreturned", "Called twice · no callback", 1.62, CSD_ACCENT], ["history-no-inspection-logged", "Inspection 'sent' · not logged", 1.42, CSD_ACCENT],
      ["history-wrong-unit", "Unit 4B recorded as 48", 1.22, CSD_ACCENT], ["history-closed-duplicate", "Duplicate entry closed", 1.02, 0x7fc4d8],
    ]) {
      const b = ball(histRows, 0.024, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(histRows, label, 0.3, y, 0, { css: CSD_CSS, w: 0.52 });
      reg(hits, b, hid);
    }
    const logBoard = board(0.56, 0.38, 1.9, 1.9, 1.5, (cx, w, h) => lines(cx, w, h, "COMMITMENT LOG", ["Routed · corrected · apologised", "Callback date on the record"]), { ry: -0.7 });
    reg(hits, logBoard.userData.face, "commitment-log-board");
    const checkBoard = board(0.5, 0.34, -1.9, 1.9, 1.6, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", ["How did that one land?", "Employee assistance line"], { accent: "#7fc4d8" }), { ry: 0.7, accent: 0x7fc4d8 });
    reg(hits, checkBoard.userData.face, "crew-checkin-board");

    // The guide's board (shared/ei-guide.js): where the station's feedback is
    // about a person, the guide's voice says it.
    const guide = board(0.62, 0.3, 0.9, 2.45, -2.4, (cx, w, h) => lines(cx, w, h, "KEEP YOUR WORD", ["Only promise the date you can meet."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.14);
    });

    // ------------------------------------------------------------ the supervisor
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const supervisor = standingFigure(g, -2.4, -1.4, { ry: 0.9, cloth: 0x2f3946, trousers: 0x262d36 });
    holoTag(supervisor, "Supervisor", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.3 }).rotation.y = -0.9;

    let ringing = false;
    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.0, -1.8),

      onStepComplete(step) {
        if (step.id === "route-to-department") {
          caseGrp.position.set(2.9 - 0.05, 1.16, -1.6);
          caseCard.rotation.x = -Math.PI / 2;
          ceTray.material = mat(0x59c97b, { rough: 0.6, emissive: 0x59c97b, ei: 0.4 });
        }
        if (step.id === "open-the-tracker") {
          trackerKnob.material = mat(0x59c97b, { rough: 0.3, metal: 0.6, emissive: 0x59c97b, ei: 0.5 });
        }
        if (step.id === "log-commitments") {
          repaint(logBoard.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Callback due in 6 working days", "Owner: you"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      onHazard(id, s) {
        if (id === "not-our-department" || id === "inspector-tomorrow") {
          resident.root.rotation.y = 0.8;
          resident.head.rotation.y = 0.5;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. She came here because every other door already said no.");
        }
      },

      onInterrupt(it) {
        if (it.id === "member-office-calls") {
          ringing = true;
          handset.position.y = 0.12;
          handset.rotation.z = 0.4;
          phoneLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6, rough: 0.4 });
        }
        if (it.id === "queue-filming") {
          filmer.root.position.set(3.0, 0, 0.7);
          filmer.arms[1].shoulder.rotation.x = -1.4;
          filmPhone.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "member-office-calls") {
          ringing = false;
          handset.position.y = 0.045;
          handset.rotation.z = 0;
          phoneLamp.material = mat(0x2a3a2a, { rough: 0.4 });
        }
        if (it.id === "queue-filming") {
          filmer.root.position.set(3.8, 0, 1.2);
          filmer.arms[1].shoulder.rotation.x = 0;
          filmPhone.visible = false;
        }
      },

      animate(t, dt, session) {
        if (ringing) phoneLamp.material.emissiveIntensity = Math.sin(t * 12) > 0 ? 2.0 : 0.3;
        resident.head.rotation.x = Math.sin(t * 0.6) * 0.05;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "set-a-real-date") {
          const ok = gg.t >= 0.3 && gg.t <= 0.52;
          repaint(dateGauge.userData.screen, signFace(`${Math.max(1, Math.round(1 + gg.t * 20))} DAYS`, {
            bg: "#0b1d19", accent: ok ? "#59c97b" : "#f0645b", fg: "#dff5ef", scale: 0.52,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "steady-voice" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(toneGauge.userData.screen, signFace(ok ? "STEADY" : tr.v < 0.3 ? "COLD" : "PLACATING", {
            bg: "#0b1d19", accent: ok ? "#59c97b" : "#f0645b", fg: "#dff5ef", scale: 0.5,
          }));
        }
      },
    };
  },
};
