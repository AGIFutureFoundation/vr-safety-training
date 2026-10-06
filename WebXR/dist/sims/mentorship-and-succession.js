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

// SmartCiti.X~ Mentorship and Succession VR — Civic Leadership and Emotional
// Intelligence, station nine.
//
// The learner is the outgoing chair of a neighbourhood commission, handing the
// seat to a younger resident newly appointed. One practice meeting, one
// binder, one gavel, one room full of the relationships a chair builds over
// years — and an old ally who would rather the real decisions stayed with the
// people who have always made them. The station is scored on making the next
// person able to lead without you, which is the only kind of succession that
// counts.
//
// The principles it practises — mentor the next person, bring people in
// rather than shut them out, keep your word — are principles commonly taught
// in civic-leadership programmes; the foundation whose principles the module
// draws on is not sourced in this repository. The commission and everybody on
// it are invented.

const MNS_ACCENT = 0xc98ab0;
const MNS_CSS = "#c98ab0";

export const SIM_MENTORSHIP_AND_SUCCESSION = {
  id: "mentorship-and-succession",
  index: "225",
  domain: "Civic",
  trade: "Outgoing commission chair — mentor",
  category: "Community Environmental Justice",
  indoor: "hotel",
  weather: "clear",
  certification: "The Ralph M. Brown Act (California Government Code section 54950 and following) as the first thing a new member must know; the Political Reform Act, administered by the FPPC, for the assuming-office Statement of Economic Interests (Form 700) and gift rules; the municipal ethics code and the state's required ethics training for local officials, named generically; Robert's Rules of Order as the commission's adopted practice for running a meeting; SAMHSA's trauma-informed principle of peer support, applied to mentoring; SEIU and AFSCME for the commission staff a new chair relies on. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
  name: "Mentorship and Succession",
  title: simTitle("Mentorship and Succession"),
  tagline: "Hand the seat on properly: the binder that matters, their goals before yours, a practice meeting you sit back from, the gavel passed, your relationships shared, a freeze coached quietly — and feedback honest enough to use",
  accent: MNS_ACCENT,
  accentCss: MNS_CSS,
  parSeconds: 330,
  footprint: 2.4,
  badge: { id: "seat-handed-on", name: "Seat Handed On", note: "A successor left able to lead without you: prepared, introduced, trusted with the gavel and told the truth" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your employee assistance program, or the mentor who once handed a seat to you — letting go of a role you built is its own kind of hard",

  game: system({
    name: "Pass It On",
    currency: "LEGACY",
    ranks: ["Member", "Chair", "Mentor", "Senior Mentor", "Leadership Elder"],
    badges: [
      { id: "binder-right", name: "Binder Right", note: "Every essential in the onboarding binder found first time", test: AWARD.stepClean("onboarding-binder") },
      { id: "hands-off", name: "Hands Off", note: "No unsafe action anywhere in the handover", test: AWARD.safe },
      { id: "true-feedback", name: "True Feedback", note: "Every piece of honest feedback found without the empty one", test: AWARD.stepClean("honest-feedback") },
    ],
    challenges: [
      { id: "clean-handover", name: "Clean Handover", note: "No corrections anywhere", test: AWARD.clean },
      { id: "right-pace", name: "Right Pace", note: "The handover paced inside the band", test: AWARD.precise(0.7) },
      { id: "sat-back", name: "Sat Back", note: "The practice meeting and the coaching both carried their full count", test: AWARD.unbroken },
    ],
  }),

  hazards: {
    "take-back-the-gavel": "You took the gavel back the moment she hesitated. She will remember that the first time the room got hard, the old chair decided she could not handle it — and so will everybody who watched, which is exactly the authority she needed to be building tonight.",
    "promise-the-seat": "You promised her the chair's seat will be hers for as long as she wants it. Appointments and elections are not yours to give, and a mentor who promises what they cannot deliver teaches the next leader that promises are how you keep people loyal.",
    "pre-decide-with-two": "You set up coffee with two members to settle next week's agenda before the meeting. Three of five is a majority; deciding items privately among them is the serial meeting the open-meeting law forbids — and it teaches your successor that this is how the commission really works.",
    "gift-basket-fine": "You told her the developer's gift basket is fine to keep. That developer has a project coming to the commission; a gift from somebody with business before the body is reportable at best and disqualifying at worst, and her first lesson in office should not be that it does not matter.",
  },

  lateNotes: {
    "gavel-item": "The gavel passes once she has run the practice item with you sitting back — let her chair first.",
    "handover-log-board": "The handover is logged once the feedback is given and the door left open — there is more to hand on yet.",
  },

  steps: [
    {
      id: "onboarding-binder", kind: "find", noHint: true,
      targets: ["binder-open-meeting-basics", "binder-form-700-deadline", "binder-ethics-training"],
      itemNames: {
        "binder-open-meeting-basics": "the open-meeting basics — agenda, public comment, no serial meetings",
        "binder-form-700-deadline": "the assuming-office disclosure deadline",
        "binder-ethics-training": "the required ethics training date",
      },
      itemNotes: {
        "binder-open-meeting-basics": "The rule most likely to trip a new member is the serial meeting — a reply-all or a coffee that becomes a majority. Start here.",
        "binder-form-700-deadline": "Her statement of economic interests is due shortly after she takes the seat. Put the date in her calendar, not just the binder.",
        "binder-ethics-training": "Local officials have a recurring ethics training requirement. Book her first session now so it is done before it is due.",
      },
      decoyNotes: {
        "binder-old-seating-chart": "The seating chart from six years ago is history, not onboarding. Take it out of the binder.",
      },
      title: "Find what actually matters in the onboarding binder",
      cue: "Go through the binder you are handing her. Mark the three things she must know in her first month.",
      why: "Onboarding binders grow for years until the essentials are buried under old seating charts and past agendas. Mentoring the next person starts with deciding what actually matters first: the open-meeting rules she could break by accident, the disclosure she has to file, and the ethics training she is required to take. Everything else she can learn by doing; those three she has to get right from day one.",
    },
    {
      id: "ask-their-goals", kind: "select", target: "goals-card",
      title: "Ask what she wants to do with the seat",
      cue: "\"Before I tell you how I did it — what do you want to get done in this role?\"",
      why: "A mentor who starts with how they did it produces a copy of themselves, and a copy is always weaker than the original. Asking first what the successor wants to achieve shapes everything after it around her goals rather than the mentor's legacy, and it signals the most important thing a handover can say: the seat is hers now, not on loan.",
    },
    {
      id: "walk-a-meeting", kind: "sequence",
      targets: ["walk-read-the-packet", "walk-brief-in-public", "walk-hear-the-public", "walk-debrief-after"],
      itemNames: {
        "walk-read-the-packet": "read the packet the weekend before",
        "walk-brief-in-public": "take staff briefings — and questions go on the record",
        "walk-hear-the-public": "hear the public before you decide",
        "walk-debrief-after": "debrief the meeting the next day",
      },
      title: "Walk her through a meeting cycle in order",
      cue: "Read the packet, brief with staff openly, hear the public, then debrief afterwards.",
      why: "Chairing is a cycle, not an evening. Reading the packet early is what lets her ask good questions; briefings with staff happen openly, with anything substantive raised again at the meeting; the public is heard before a decision; and the debrief the next day is where she learns more than in the meeting itself. Taught in order, the cycle becomes her habit rather than a list she was once shown.",
      outOfOrderNote: "Packet, briefing, public, debrief. Teaching the debrief before she has read a packet leaves her reviewing a meeting she was never prepared for.",
    },
    {
      id: "pace-the-handover", kind: "gauge", target: "handover-meter",
      title: "Pace the handover",
      cue: "Commit how much to hand over now — enough that she owns it, not so much that she sinks.",
      gauge: {
        label: "HANDOVER", speed: 0.6, green: [0.42, 0.6],
        readout: (t) => (t < 0.42 ? "holding on" : t <= 0.6 ? "hers, with support" : "thrown in"),
        missNote: "Not the right pace. Holding on keeps her a deputy in your seat; handing over everything at once leaves her alone with a crisis she has never seen. Commit inside the band.",
      },
      why: "The commonest failure of succession is timing. A mentor who hands over too slowly keeps the successor a deputy for years and quietly makes themselves indispensable; one who hands over everything on day one leaves a new chair alone with a room they have never read. The right pace gives her real authority now, with support close enough to reach and far enough to be her own.",
    },
    {
      id: "let-them-chair", kind: "hold", target: "sit-back-bead", seconds: 8,
      title: "Sit back while she chairs the practice item",
      cue: "Hold still in the member's seat. Do not prompt, do not nod her through it, do not reach for the gavel.",
      why: "The hardest part of mentoring is doing nothing while someone else does it differently. Sitting back while she chairs — even when she takes the item in an order you would not, even when there is a pause — is how she learns that the room responds to her, not to the person beside her. Every prompt from the old chair is a small announcement that she is not really in charge.",
      holdBreakNote: "You leaned in to prompt her. The room saw who they should look to. Sit back and let her find it.",
    },
    {
      id: "hand-over-the-gavel", kind: "drag", target: "gavel-item",
      title: "Hand the gavel to her place",
      cue: "Carry the gavel from your old place to hers at the centre of the table.",
      drag: {
        to: "successor-place", radius: 0.5,
        missNote: "Not at her place. The gavel is a small object and a large signal — it goes in front of the new chair, in full view of the room.",
      },
      why: "Authority in a room is partly symbolic, and the symbols are watched. Moving the gavel from the old chair's place to the new chair's, in front of the commission and the staff, is a public act of handing over that no memo can match. It tells everybody present, including the people who were loyal to the old chair, where the authority now sits.",
    },
    {
      id: "open-the-contacts", kind: "turn", target: "contacts-wheel",
      title: "Open your contacts to her",
      cue: "Turn the card wheel to share every relationship — the neighbourhood leaders, the staff, the critics too.",
      turn: { turns: 0.6, axis: "y", label: "CONTACTS" },
      why: "A chair's real capital is relationships built over years, and a mentor who keeps them is not handing over the job. Sharing them all — the association leaders, the department contacts, and especially the critics who will call her first — gives her the network the role actually runs on. Bringing people in includes bringing your successor into the relationships that made you effective.",
    },
    {
      id: "introduce-to-staff", kind: "select", target: "intro-card",
      title: "Introduce her to the commission staff by name",
      cue: "\"This is the clerk, this is the planner, this is the analyst — each of them knows more than I do about their part.\"",
      why: "Staff decide whether a new chair succeeds far more than the chair realises. Introducing her to each of them by name, with a sentence about what they know that she does not, tells the staff the new chair will respect their expertise — and tells her that leading a public body means relying on the people who keep it running, not only on the other members.",
    },
    {
      id: "coach-without-taking-over", kind: "track", target: "coaching-meter", seconds: 8,
      title: "Coach through the hard item without taking it over",
      cue: "The item is contentious. Keep your coaching inside the band — present, quiet, never in her place.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.48, fall: 0.4, drift: 0.16, label: "COACHING",
        readout: (v) => (v < 0.3 ? "absent" : v > 0.7 ? "taking over" : "supporting"),
      },
      why: "Coaching during a live meeting is a narrow band. Drift too far back and a new chair facing her first hostile item is alone; lean too far in and the room sees the old chair running the meeting from the side. The band is continuous — a glance she can find if she needs it, a note if she asks for one, and nothing that puts you back in the seat you have just left.",
      holdBreakNote: "You drifted out of the band — gone, or back in charge. Return to quiet presence: there if she looks, silent if she doesn't.",
    },
    {
      id: "honest-feedback", kind: "find", noHint: true,
      targets: ["feedback-specific-moment", "feedback-what-worked", "feedback-one-change"],
      itemNames: {
        "feedback-specific-moment": "a specific moment, not a general impression",
        "feedback-what-worked": "what worked, and why it worked",
        "feedback-one-change": "one thing to change next time",
      },
      itemNotes: {
        "feedback-specific-moment": "\"When the speaker ran over, you let her finish her sentence and then called time\" — something she can recognise and repeat.",
        "feedback-what-worked": "Name what worked and why, so she keeps doing it on purpose rather than by accident.",
        "feedback-one-change": "One change, not a list. She will act on one; she will be crushed by seven.",
      },
      decoyNotes: {
        "feedback-you-were-fine": "\"You were fine\" is kind and useless. She cannot improve on it and she will not believe it.",
      },
      title: "Give feedback honest enough to use",
      cue: "Pick every piece of feedback that is specific and usable. Leave the empty reassurance.",
      why: "Mentoring without honest feedback is flattery with extra steps. A specific moment she can recognise, what worked and why, and one clear change for next time give her something to act on and something to keep. \"You were fine\" feels generous to the mentor and gives the successor nothing — and if she ever finds out she was not fine, it costs the trust the whole handover rests on.",
    },
    {
      id: "leave-the-door-open", kind: "sequence", anyOrder: true,
      targets: ["door-standing-call", "door-own-mistake-story", "door-find-your-own-mentee"],
      itemNames: {
        "door-standing-call": "a standing call she can cancel, not one you can",
        "door-own-mistake-story": "the story of your own worst meeting",
        "door-find-your-own-mentee": "an ask: find the person you'll hand this to",
      },
      title: "Leave the door open — on her terms",
      cue: "Offer a standing call she controls, tell her about your own worst meeting, and ask her to start looking for her successor.",
      why: "A good handover ends with support on the successor's terms, not the mentor's. A standing call she can cancel keeps you available without hovering; the story of your own worst meeting tells her mistakes are survivable; and asking her to start looking for the person she will one day hand the seat to makes mentoring the next person part of the job from her first week.",
    },
    {
      id: "succession-log", kind: "select", target: "handover-log-board",
      title: "Record the handover",
      cue: "Log the binder essentials, the dates in her calendar, the introductions made and the standing call.",
      why: "A handover that lives only in two people's memories fades within a season. Recording what was handed on — the essentials, the dates booked, the introductions made, the standing call — gives the successor a checklist she owns and gives the commission a record that the transition was deliberate. It also keeps the mentor honest about what was actually handed over and what was merely talked about.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the clerk after the practice meeting",
      cue: "Two minutes with the clerk: how did that land, and how is she going to support the new chair?",
      why: "Transitions are unsettling for the staff who have to learn a new chair's habits, and for the outgoing chair letting go of a role that was part of who they were. A short check-in with the clerk — how did it land, what support the new chair needs, the employee assistance line if the change weighs on anyone — is part of handing over well, not an afterthought.",
    },
  ],

  interrupts: [
    {
      id: "shadow-chair-offer",
      kind: "Invitation to stay in charge",
      after: "let-them-chair", delay: 3, seconds: 12,
      alert: "While she is chairing, a long-time ally leans over to you and whispers: keep the real decisions between the old hands — she can run the meetings.",
      cue: "Decline, quietly and clearly: she is the chair now, and decisions happen in the meeting.",
      target: "no-shadow-card",
      why: "A shadow chair is the most common way succession fails: the title moves and the power does not. Declining the ally clearly, and without drama, protects the new chair's authority and keeps decisions where the open-meeting law puts them — in the meeting. It also tells the ally, who will repeat it, that the handover is real.",
      missNote: "You nodded and said you would talk later. The ally tells the others that the old chair is still the one to see, and the new chair spends her first year wondering why decisions keep arriving already made.",
      wrongNote: "Sitting still is right, but the whisper needs an answer. Decline it: she is the chair now, and decisions happen in the meeting.",
    },
    {
      id: "successor-freezes",
      kind: "Successor under pressure",
      after: "coach-without-taking-over", delay: 3, seconds: 12,
      alert: "A resident has stood up and is shouting at the new chair by name. She has frozen, gavel in hand, and is looking at you.",
      cue: "Pass her a quiet note — \"warn once, then recess\" — and leave the gavel where it is.",
      target: "pass-a-note-card",
      why: "The moment a new leader freezes is the moment a mentor is most tempted to take over and most needs not to. A quiet note with the next step — warn once, then recess — gives her what she needs to act while keeping the authority visibly hers. The room sees her handle it; she learns she can; and the resident learns who is chairing.",
      missNote: "Nothing reached her. She stood frozen until the resident sat down on his own, and she left the meeting convinced she cannot do the job — which is the opposite of what the evening was for.",
      wrongNote: "Coaching from the side is not enough in this moment. She needs the next step in her hand — pass her the note.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, MNS_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? MNS_ACCENT, { emissive: o.color ?? MNS_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? MNS_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#211220", accent: o.accent ?? MNS_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? MNS_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const stand = (x, z, ry = 0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.19, 0.21, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.026, 0.026, 1.0, 0, 0.5, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(26,12,24,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? MNS_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fcedf6";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#e6c6da";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? MNS_ACCENT, { rough: 0.5, emissive: o.accent ?? MNS_ACCENT, ei: 0.25 });
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

    // ------------------------------------------------------------ the commission room
    const carpetTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 9, base: "#5a3e4e", base2: "#4e3644", seam: "rgba(24,12,20,0.35)",
    }), { repeat: 3, px: 384 });
    const carpet = box(g, 8.0, 0.02, 6.6, 0, 0.012, -0.4, 0x5a3e4e, { rough: 0.95, cast: false });
    carpet.material = texturedMat(carpetTex, { rough: 0.95, metal: 0.02, color: 0x6a4a5c });

    // A shallow horseshoe of tables: the commission.
    const woodTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#6a4e38", base2: "#5d4430", seam: "rgba(30,18,10,0.4)",
    }), { repeat: 2, px: 320 });
    const front = box(g, 3.6, 0.72, 0.06, 0, 0.4, -1.95, 0x6a4e38, { rough: 0.7 });
    front.material = texturedMat(woodTex, { rough: 0.7, metal: 0.03, color: 0x7a5a42 });
    box(g, 3.7, 0.05, 0.7, 0, 0.78, -2.3, 0x7a5a42, { rough: 0.55 });
    for (const sx of [-1, 1]) {
      const wing = group(g, sx * 2.2, 0, -1.6, sx * -0.6);
      box(wing, 1.3, 0.05, 0.6, 0, 0.78, 0, 0x7a5a42, { rough: 0.55 });
      box(wing, 1.2, 0.72, 0.05, 0, 0.4, 0.28, 0x6a4e38, { rough: 0.7 });
    }
    // The successor at the centre, you to her right, members either side.
    for (const cx of [-1.2, 0, 0.9]) box(g, 0.48, 0.8, 0.06, cx, 0.82, -2.95, 0x3a2f3a, { rough: 0.7 });
    const successor = seatedFigure(g, 0, 0.49, -2.75, { ry: 0, cloth: 0x2f6a7a });
    holoTag(successor.torso, "New chair", 0, 1.4, 0.1, { css: MNS_CSS, w: 0.26 });
    const member1 = seatedFigure(g, -1.2, 0.49, -2.75, { ry: 0, cloth: 0x4a3a5a });
    void member1;
    const ally = standingPerson(g, -2.9, -2.4, { ry: 0.9, cloth: 0x5a4a3a, hiVis: false });
    holoTag(ally.torso, "Long-time ally", 0, 1.9, 0, { css: MNS_CSS, w: 0.32 }).rotation.y = -0.9;
    const successorPlace = box(g, 0.34, 0.012, 0.24, 0, 0.81, -2.1, 0x59c97b, { rough: 0.6, emissive: 0x59c97b, ei: 0.3 });
    holoTag(g, "Her place", 0, 1.0, -2.05, { css: "#59c97b", w: 0.22 });
    reg(hits, successorPlace, "successor-place");
    const freezeLamp = ball(g, 0.03, 0.25, 1.15, -2.2, 0x3a2a3a, { rough: 0.4, seg: 10 });

    // The gavel at your old place, to be carried to hers.
    const gavelGrp = group(g, 0.9, 0.82, -2.2);
    box(gavelGrp, 0.14, 0.03, 0.14, 0, 0, 0, 0x4a3020, { rough: 0.5 });
    const gavelHead = cyl(gavelGrp, 0.03, 0.03, 0.12, 0.08, 0.04, 0, 0x5a3a24, { rough: 0.45, seg: 10 });
    gavelHead.rotation.z = Math.PI / 2;
    holoTag(gavelGrp, "The gavel", 0, 0.2, 0, { css: MNS_CSS, w: 0.22 });
    reg(hits, gavelHead, "gavel-item");
    bead(0.9, 1.4, -1.9, "sit-back-bead", "Sit back — let her chair", { w: 0.46 });

    // The onboarding binder, as a board with its tabs.
    board(0.7, 0.36, -3.1, 2.0, -0.9, (cx, w, h) => lines(cx, w, h, "ONBOARDING BINDER", ["Tap what she must know first"]), { ry: 1.1 });
    const binder = group(g, -3.0, 0, -0.65, 1.1);
    for (const [bid, label, y, c] of [
      ["binder-open-meeting-basics", "Open-meeting basics", 1.65, MNS_ACCENT], ["binder-form-700-deadline", "Disclosure deadline", 1.45, MNS_ACCENT],
      ["binder-ethics-training", "Ethics training date", 1.25, MNS_ACCENT], ["binder-old-seating-chart", "Seating chart, six years old", 1.05, 0x7fc4d8],
    ]) {
      const b = ball(binder, 0.024, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(binder, label, 0.32, y, 0, { css: MNS_CSS, w: 0.52 });
      reg(hits, b, bid);
    }

    // The meeting-cycle ladder.
    const ladder = group(g, 2.5, 0, -0.5, -0.6);
    cyl(ladder, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["walk-read-the-packet", "1 · Read the packet early", 0.75], ["walk-brief-in-public", "2 · Brief — questions on the record", 1.05],
      ["walk-hear-the-public", "3 · Hear the public", 1.35], ["walk-debrief-after", "4 · Debrief next day", 1.65],
    ]) {
      const b = ball(ladder, 0.026, 0, y, 0, MNS_ACCENT, { emissive: MNS_ACCENT, ei: 1.5, seg: 12 });
      holoTag(ladder, label, 0.2, y, 0, { css: MNS_CSS, w: 0.56 });
      reg(hits, b, lid);
    }

    // The handover meter and the coaching meter.
    const hoStand = stand(-1.5, 0.3, 0.4);
    const hoGauge = instrument(hoStand, 0, 1.02, 0, { idle: "PACE", color: MNS_ACCENT, w: 0.2, d: 0.26 });
    holoTag(hoStand, "Handover pace", 0, 1.22, 0, { css: MNS_CSS, w: 0.32 });
    reg(hits, hoGauge, "handover-meter");
    const coStand = stand(1.55, 0.6, -0.4);
    const coGauge = instrument(coStand, 0, 1.02, 0, { idle: "COACH", color: MNS_ACCENT, w: 0.2, d: 0.26 });
    holoTag(coStand, "Coaching", 0, 1.22, 0, { css: MNS_CSS, w: 0.24 });
    reg(hits, coGauge, "coaching-meter");

    // The contacts wheel on a side table.
    const side = group(g, -2.2, 0, 0.6, 0.8);
    box(side, 0.6, 0.05, 0.45, 0, 0.74, 0, 0x7a5a42, { rough: 0.55 });
    cyl(side, 0.04, 0.04, 0.72, 0, 0.36, 0, 0x4a3a2c, { rough: 0.6, seg: 8 });
    const wheel = cyl(side, 0.12, 0.12, 0.16, 0, 0.88, 0, 0xd8c8b0, { rough: 0.6, seg: 18 });
    wheel.rotation.z = Math.PI / 2;
    holoTag(side, "Your contacts — all of them", 0, 1.12, 0, { css: MNS_CSS, w: 0.5 });
    reg(hits, wheel, "contacts-wheel");

    card(-0.7, 1.4, -0.9, "goals-card", "Her goals first", "WHAT DO YOU\nWANT TO DO?", { w: 0.3, ry: 0.2 });
    card(0.6, 1.35, -0.6, "intro-card", "Introduce the staff", "CLERK · PLANNER\nANALYST", { w: 0.36, ry: -0.2 });
    card(-1.55, 1.3, -1.1, "no-shadow-card", "\"She's the chair now\"", "SHE'S THE\nCHAIR NOW", { w: 0.42, ry: 0.5, accent: "#f2c14b", css: "#f2c14b" });
    card(1.2, 1.25, -1.2, "pass-a-note-card", "Pass her a note", "WARN ONCE,\nTHEN RECESS", { w: 0.32, ry: -0.4, accent: "#f2c14b", css: "#f2c14b" });

    // Feedback cards on a board.
    board(0.7, 0.36, 3.1, 2.0, -1.5, (cx, w, h) => lines(cx, w, h, "YOUR FEEDBACK", ["Tap every line she can use"]), { ry: -1.1 });
    const fb = group(g, 3.0, 0, -1.25, -1.1);
    for (const [fid, label, y, c] of [
      ["feedback-specific-moment", "A specific moment", 1.65, MNS_ACCENT], ["feedback-what-worked", "What worked, and why", 1.45, MNS_ACCENT],
      ["feedback-one-change", "One thing to change", 1.25, MNS_ACCENT], ["feedback-you-were-fine", "\"You were fine\"", 1.05, 0x7fc4d8],
    ]) {
      const b = ball(fb, 0.024, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(fb, label, 0.3, y, 0, { css: MNS_CSS, w: 0.44 });
      reg(hits, b, fid);
    }
    const door = group(g, 2.3, 0, 1.0, -0.9);
    cyl(door, 0.022, 0.022, 1.6, 0, 0.8, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [did, label, y] of [["door-standing-call", "A call she controls", 0.9], ["door-own-mistake-story", "Your worst meeting", 1.18], ["door-find-your-own-mentee", "Find your successor", 1.46]]) {
      const b = ball(door, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(door, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.4 });
      reg(hits, b, did);
    }

    // The resident who stands to shout during the second alarm.
    const resident = standingPerson(g, 2.9, 2.0, { ry: -2.6, cloth: 0x6a3a3a, hiVis: false });
    standingPerson(g, -3.1, 2.2, { ry: 2.6, cloth: 0x3a5a6a, hiVis: false });

    // ------------------------------------------------------------ the wrong moves
    bead(0.45, 1.25, -1.55, "take-back-the-gavel", "Take the gavel back?", { color: 0xf0645b, css: "#f0645b", w: 0.4 });
    card(-2.4, 1.3, 1.5, "promise-the-seat", "Promise her the seat?", "IT'S YOURS\nAS LONG AS YOU WANT", {
      w: 0.44, ry: 0.7, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    bead(-3.0, 1.1, -1.9, "pre-decide-with-two", "Coffee with two members first?", { color: 0xf0645b, css: "#f0645b", w: 0.56 });
    const basket = group(g, 1.9, 0, -1.0);
    box(basket, 0.3, 0.18, 0.2, 0, 0.9, 0, 0xb0803a, { rough: 0.8 });
    const basketTag = holoTag(basket, "Developer's gift basket — fine?", 0, 1.15, 0, { css: "#f0645b", w: 0.56 });
    void basketTag;
    cyl(basket, 0.03, 0.03, 0.8, 0, 0.4, 0, 0x4a3a2c, { rough: 0.6, seg: 8 });
    reg(hits, basket.children[0], "gift-basket-fine");

    // Closing boards.
    const logBoard = board(0.56, 0.38, 1.3, 1.9, 2.1, (cx, w, h) => lines(cx, w, h, "HANDOVER RECORD", ["Essentials · dates booked", "Introductions · standing call"]), { ry: -0.4 });
    reg(hits, logBoard.userData.face, "handover-log-board");
    const checkin = board(0.5, 0.34, -1.3, 1.9, 2.1, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", ["How did that land?", "What does the new chair need?"], { accent: "#7fc4d8" }), { ry: 0.4, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // The guide's board (shared/ei-guide.js).
    const guide = board(0.62, 0.3, 1.4, 2.4, -3.1, (cx, w, h) => lines(cx, w, h, "PASS IT ON", ["Her seat now, not yours."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.14);
    });

    // ------------------------------------------------------------ the clerk
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const clerk = standingFigure(g, -2.4, -0.2, { ry: 2.33, cloth: 0x2f3946, trousers: 0x262d36 });
    holoTag(clerk, "Commission clerk", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.36 }).rotation.y = -2.33;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.1, -2.4),

      onStepComplete(step) {
        if (step.id === "hand-over-the-gavel") {
          gavelGrp.position.set(0, 0.83, -2.1);
          successorPlace.material = mat(0x59c97b, { rough: 0.6, emissive: 0x59c97b, ei: 0.7 });
        }
        if (step.id === "open-the-contacts") wheel.material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.3 });
        if (step.id === "succession-log") {
          repaint(logBoard.userData.face, (cx, w, h) => lines(cx, w, h, "HANDED ON", ["Her calendar · her contacts", "Standing call — hers to cancel"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      onHazard(id, s) {
        if (id === "take-back-the-gavel" || id === "promise-the-seat") {
          successor.head.rotation.x = 0.35;
          successor.head.rotation.y = -0.4;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. The room needs to see that the seat is hers.");
        }
      },

      onInterrupt(it) {
        if (it.id === "shadow-chair-offer") {
          ally.root.position.set(1.35, 0, -2.5);
          ally.root.rotation.y = -1.2;
          ally.arms[0].shoulder.rotation.x = -0.8;
        }
        if (it.id === "successor-freezes") {
          resident.root.position.set(0.5, 0, 1.0);
          resident.arms[1].shoulder.rotation.x = -1.6;
          freezeLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6, rough: 0.4 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "shadow-chair-offer") {
          ally.root.position.set(-2.9, 0, -2.4);
          ally.root.rotation.y = 0.9;
          ally.arms[0].shoulder.rotation.x = 0;
        }
        if (it.id === "successor-freezes") {
          resident.root.position.set(2.9, 0, 2.0);
          resident.arms[1].shoulder.rotation.x = 0;
          freezeLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0, rough: 0.4 });
        }
      },

      animate(t, dt, session) {
        successor.head.rotation.z = Math.sin(t * 0.5) * 0.03;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "pace-the-handover") {
          const ok = gg.t >= 0.42 && gg.t <= 0.6;
          repaint(hoGauge.userData.screen, signFace(ok ? "HERS" : gg.t < 0.42 ? "HOLDING ON" : "THROWN IN", {
            bg: "#211220", accent: ok ? "#59c97b" : "#f0645b", fg: "#f8e6f0", scale: 0.5,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "coach-without-taking-over" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(coGauge.userData.screen, signFace(ok ? "SUPPORTING" : tr.v < 0.3 ? "ABSENT" : "TAKING OVER", {
            bg: "#211220", accent: ok ? "#59c97b" : "#f0645b", fg: "#f8e6f0", scale: 0.48,
          }));
        }
      },
    };
  },
};
