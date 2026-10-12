import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, paperFace, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Mock Interview and Resume VR — Pathway Edition, wojrc.org.
//
// A coach's interview room the week before a union apprenticeship
// application closes: a resume built section by section from a draft with
// gaps in it, a mock interview sat under a coach's questions with posture and
// eye contact held rather than a phone or a fire drill winning the room, an
// honest answer chosen for the one question every applicant dreads, and a
// finished resume printed, signed and filed with the reference it needs.
// Sited generically: no real employer, apprenticeship coordinator or clause
// number the registry is not sure of.

const MIR_ACCENT = 0xd8a24a;
const MIR_CSS = "#d8a24a";

export const SIM_WP_MOCK_INTERVIEW_AND_RESUME = {
  id: "wp-mock-interview-and-resume",
  index: "709",
  domain: "Workforce readiness",
  trade: "Pathway Edition — a mock interview and a resume for a union apprenticeship application",
  category: "Community Environmental Justice",
  indoor: "clinic",
  weather: "clear",
  certification: "Registered apprenticeship standards as a category — the written apprenticeship standard the coordinator's notice on the wall is drawn from, since the resume and the interview both exist to get an application read against it; the OSHA Outreach Training Program's OSHA 10 card, one of the lines the resume has to carry; Teamsters (IBT) apprenticeship and driver training programmes, named on the posting board as one of the routes this resume could open; 29 CFR 1910.22 for the walking-working surfaces an interview room shares with every other office; 29 CFR 1910.151 for the first-aid posture a warm, crowded room can turn into a real need; SAMHSA's guidance on help-seeking, for the coach's own check-in at the end",
  name: "Mock Interview and Resume",
  title: simTitle("Mock Interview and Resume"),
  tagline: "Build the resume section by section, sit a mock interview with your posture and eye contact held, answer the hardest question honestly, and leave with a resume printed, signed and filed with its reference",
  accent: MIR_ACCENT,
  accentCss: MIR_CSS,
  parSeconds: 320,
  footprint: 2.2,
  supportLine: "the programme's own coaching staff, and 988 or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if the pressure of the application is more than the room can hold",
  badge: { id: "resume-ready", name: "Resume Ready", note: "The resume built in order, the mock interview held with posture and eye contact through every interruption, the hard question answered honestly, and the packet printed, signed and filed" },

  game: system({
    name: "Interview Room",
    currency: "PAGE",
    ranks: ["Draft", "Resume Built", "Interview Sat", "Packet Filed", "Interview Certified"],
    badges: [
      { id: "gaps-found", name: "Gaps Found", note: "Every gap in the draft resume found clean", test: AWARD.stepClean("find-gaps") },
      { id: "steady-room", name: "Steady Room", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "held-the-poise", name: "Held The Poise", note: "The poise track carried without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-packet", name: "Clean Packet", note: "No corrections anywhere", test: AWARD.clean },
      { id: "honest-answer", name: "Honest Answer", note: "The confidence gauge committed near the middle of the band", test: AWARD.precise(0.7) },
      { id: "one-sitting", name: "One Sitting", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wp-mi-trip-cord": "You were about to step over the printer's extension cord running loose across the middle of the room. A cord across the floor between the desk and the door is a trip in a room people cross in a hurry between interviews — it gets taped down along the wall, not left where the next applicant's feet land.",
    "wp-mi-chair-slump": "You were about to sit the whole mock interview hunched forward in a chair set too low for the desk. A chair that forces you to slump for thirty minutes strains the same low back and shoulders an eight-hour shift will later — raise the seat and square it to the desk before you sit down, not after your back tells you.",
    "wp-mi-stuffy-room": "The window unit in this room has been off for an hour and the air has gone stale and warm. A hot, airless room dulls concentration exactly when the mock interview needs it most, and it is a plain comfort and safety issue before it is anything else — open the door for a cross breeze and get water before you start, not partway through when the headache has already begun.",
    "wp-mi-no-show-visitor": "A walk-in who missed his own interview slot is at the front desk raising his voice, demanding to go in ahead of you. Space and a level answer come first: step back, let the front desk handle the schedule, and do not let the argument follow you into the interview room.",
  },

  lateNotes: {
    "wp-mi-resume-packet": "Not yet. The packet gets printed once the resume sections are actually built and the interview is behind you — not before either is done.",
    "wp-mi-interview-log": "The log closes out the session last, with the feedback and what the resume still needs before it goes out.",
  },

  steps: [
    {
      id: "sign-in", kind: "select", target: "wp-mi-signin-sheet",
      title: "Sign in for the interview slot",
      cue: "Sign the sheet at the door with your name and the time your slot starts.",
      why: "The coach runs slots back to back most afternoons, and the sheet is how the front desk knows who is next and how long the room has actually been running behind. Signing in yourself is also the first small rehearsal for an application everything else in the room is building toward: arrive, announce yourself, and be ready when your name is called.",
    },
    {
      id: "read-posting", kind: "hold", target: "wp-mi-posting-board", seconds: 6,
      title: "Read the apprenticeship notice all the way through",
      cue: "Hold at the board and read the notice: what it asks for, the deadline, and what the resume has to answer.",
      why: "A resume built without reading the actual notice guesses at what matters and usually guesses wrong — the notice says which tools, which certifications and which deadline the coordinator is reading applications against. Reading it in full before touching the resume is what keeps every line that follows aimed at something real instead of a generic template.",
      holdBreakNote: "You left the board before the deadline line. That is the one number the whole session runs against — read it through.",
    },
    {
      id: "find-gaps", kind: "find", noHint: true,
      targets: ["wp-mi-gap-dates", "wp-mi-gap-osha10", "wp-mi-gap-reference"],
      itemNames: { "wp-mi-gap-dates": "missing dates on a past job", "wp-mi-gap-osha10": "the OSHA 10 card left off entirely", "wp-mi-gap-reference": "no reference or contact listed" },
      itemNotes: {
        "wp-mi-gap-dates": "A job listed with no start or end date reads to a coordinator as a job somebody does not want dated — usually because it is not one, not because of anything worse. Fill in the real months.",
        "wp-mi-gap-osha10": "The OSHA 10 card is exactly the kind of line an applicant assumes is too small to matter and a coordinator is specifically scanning for. Leaving it off costs more than it would ever cost to add.",
        "wp-mi-gap-reference": "A resume with no name a coordinator can call is a resume that has to be taken entirely on its own word. One reference with a working number is worth more than another paragraph of description.",
      },
      title: "Find the three gaps in the draft",
      cue: "Three things are missing from the draft resume on the desk. Find all three.",
      why: "A coordinator reading forty applications in an afternoon does not chase down what a resume left out — a gap just reads as a weaker application than one with the same experience written completely. Finding these three before the resume is finalised is the difference between an application that gets a callback and one that gets set aside for looking unfinished.",
    },
    {
      id: "build-resume", kind: "sequence",
      targets: ["wp-mi-section-contact", "wp-mi-section-experience", "wp-mi-section-skills"],
      itemNames: { "wp-mi-section-contact": "contact information at the top", "wp-mi-section-experience": "work experience in the middle", "wp-mi-section-skills": "skills and certifications last" },
      outOfOrderNote: "Out of order. Contact information goes first so a coordinator can reach you without hunting, work experience next so it can be read against the apprenticeship notice, and skills and certifications last, where they are read once the coordinator already knows who you are.",
      title: "Build the resume in the order a coordinator reads it",
      cue: "Lay out the resume: contact information, then work experience, then skills and certifications — in that order.",
      why: "A coordinator's eye moves down a resume the same way most people's does, and putting each section where it is expected to be is what makes a page easy to read fast rather than hunted through. This is the same order the posting board's notice itself follows, which is not a coincidence — the notice was written by someone reading resumes the same way.",
    },
    {
      id: "confidence-gauge", kind: "gauge", target: "wp-mi-confidence-dial",
      title: "Rate your interview confidence honestly",
      cue: "The dial runs one to ten. Commit it where you actually are before the mock interview starts.",
      gauge: {
        label: "CONFIDENCE", speed: 0.6, green: [0.4, 0.7],
        readout: (t) => `${Math.round(1 + t * 9)} / 10`,
        missNote: "That number does not match somebody who has not sat an interview since high school. Rate it honestly — the coach spends the mock differently for a nervous ten out of ten than for an honest five.",
      },
      why: "The coach reads this number to decide which questions to slow down on, not to judge the applicant. An inflated number gets a mock interview that skips exactly the practice a nervous applicant needed, while an honest one gets extra time on eye contact and pacing before the real interview, when there is no coach in the room to notice the difference.",
    },
    {
      id: "mock-questions", kind: "track", target: "wp-mi-poise-track", seconds: 7,
      title: "Hold your posture and eye contact through the questions",
      cue: "Hold the poise track in the band: sitting up, eyes on the coach, not slumping and not staring past them.",
      track: {
        start: 0.5, green: [0.36, 0.66], rise: 0.5, fall: 0.44, drift: 0.14, label: "POISE",
        readout: (v) => (v < 0.36 ? "slumping" : v > 0.66 ? "staring past" : "holding steady"),
      },
      holdBreakNote: "Your poise slipped — into slumping or into staring past the coach. Sit up, find their eyes and settle back into it.",
      why: "A real interviewer reads posture and eye contact as much as any answer, often before a word is spoken, and both are habits a nervous body forgets under pressure unless they have been practised somewhere lower-stakes first. This room is exactly that somewhere — the mistake here costs a note from the coach, not the application.",
    },
    {
      id: "hard-question", kind: "select", target: "wp-mi-honest-answer",
      title: "Answer the hardest question honestly",
      cue: "The coach asks why you left your last job. Choose the honest, plain answer over the ones that dress it up or blame somebody else.",
      why: "A coordinator has heard every version of a dressed-up answer and every version of a blame-somebody-else answer, and both read as evasive in a way a plain, honest one does not — 'the schedule stopped working with my second job' answers the question and moves on. Practising the honest version here, out loud, is what keeps it from coming out garbled the one time it actually counts.",
    },
    {
      id: "star-answer", kind: "sequence",
      targets: ["wp-mi-star-situation", "wp-mi-star-task", "wp-mi-star-action", "wp-mi-star-result"],
      itemNames: { "wp-mi-star-situation": "the situation", "wp-mi-star-task": "the task", "wp-mi-star-action": "the action you took", "wp-mi-star-result": "the result" },
      outOfOrderNote: "Situation, task, action, result — in that order. A result with no action in front of it sounds like luck, and an action with no situation in front of it sounds like a habit rather than something you chose to do.",
      title: "Answer the experience question in order",
      cue: "Walk through one example using the situation, the task, the action you took and the result — in that order.",
      why: "A coordinator asking for an example of solving a problem is listening for a structure, whether or not they could name it: what was going on, what needed doing, what you actually did, and what happened because of it. Answering out of order buries the one part — what you actually did — that the question was asked to find out.",
    },
    {
      id: "review-recording", kind: "turn", target: "wp-mi-recorder-dial",
      title: "Review the recording with the coach",
      cue: "Turn the recorder dial back to hear how you actually sounded, not how you remember it.",
      turn: { turns: 0.6, axis: "y", label: "PLAYBACK" },
      why: "Almost everyone is a worse judge of their own filler words and pace than a recording is, and the gap between how you think you sounded and how you actually sounded is exactly what the coach wants you to hear while there is still time to fix it. Reviewing it together is uncomfortable for about thirty seconds and useful for the whole real interview.",
    },
    {
      id: "attach-reference", kind: "drag", target: "wp-mi-osha10-copy",
      title: "Attach the OSHA 10 copy to the resume packet",
      cue: "Carry the copy of your OSHA 10 card into the resume packet folder.",
      why: "A card mentioned on the resume and a copy actually in the packet are two different things to a coordinator moving fast through a stack — the copy answers the question before it is asked and saves you a second trip to prove something you already have. It goes in now, while it is in your hand, not as a promise to send it later.",
      drag: { to: "wp-mi-packet-folder", radius: 0.4, missNote: "Not in the packet. A copy set beside the folder is as good as a copy left at home." },
    },
    {
      id: "coach-feedback", kind: "select", target: "wp-mi-coach",
      title: "Go over the coach's feedback",
      cue: "Sit with the coach and go over what worked, what to fix, and how the pressure of the deadline is sitting with you.",
      why: "The coach saw things from across the desk that no recording catches — a hand that would not stop moving, an answer that improved the second time you gave it — and the feedback only helps if you hear it while the mock interview is still fresh. It is also where a coach asks the other question: whether the deadline pressure has become more than nerves.",
    },
    {
      id: "print-resume", kind: "select", target: "wp-mi-resume-packet",
      title: "Print and sign the final resume",
      cue: "Print the finished resume, read it once more, then sign the cover sheet.",
      why: "A resume printed and read one last time catches the typo that survives every earlier pass, and signing the cover sheet is what makes it the version you are standing behind rather than a draft still open to changes. This is the copy that leaves the room.",
    },
    {
      id: "close-log", kind: "select", target: "wp-mi-interview-log",
      title: "Close out the interview log",
      cue: "Log the feedback, the deadline and what the resume still needs, then sign it.",
      why: "The log is what the coach reads before your next session instead of trying to remember one interview out of a full afternoon of them. A deadline and a note written down get followed up on; feedback nobody logged has to be given all over again from nothing.",
    },
  ],

  interrupts: [
    {
      id: "wp-mi-phone-buzz",
      kind: "Phone buzzing mid-answer",
      after: "mock-questions", delay: 3, seconds: 12,
      alert: "Your phone lights up and buzzes loudly on the side table in the middle of the mock interview.",
      cue: "Do not check it. Reach over and flip the mute switch.",
      target: "wp-mi-phone-mute",
      why: "A phone that keeps buzzing through an interview reads as somebody who is not fully in the room, and glancing at it costs the eye contact the poise track is built around. The mute switch is the whole fix — silencing it now is a habit worth having before the real interview, where nobody will remind you.",
      missNote: "You kept glancing at the phone through the rest of the question, and in the version where you did, the coach's notes say exactly that: distracted, checked phone twice. That is not the note a coordinator wants to read either.",
      wrongNote: "Not the recorder, and not the track itself. The switch on the phone is what stops the buzzing — reach for that.",
    },
    {
      id: "wp-mi-fire-drill",
      kind: "Fire alarm test in the building",
      after: "star-answer", delay: 3, seconds: 12,
      alert: "A fire alarm test starts in the building — a light flashing over the hallway exit sign outside the open door.",
      cue: "Pause the interview and check the exit route sign before you decide it is only a test.",
      target: "wp-mi-exit-sign",
      why: "Every alarm is treated as real until the building says otherwise, whether it turns out to be a scheduled test or not — that is what the exit route sign and the posted evacuation plan are for, and checking it costs seconds an actual fire would make back many times over. It is also, plainly, more important than finishing the sentence you were on.",
      missNote: "You kept talking through the alarm, and in the version where it had been real, nobody in this room had looked at the exit sign or moved toward it.",
      wrongNote: "Not the recorder or the phone. The exit sign is what tells you the way out — check that first, alarm test or not.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.2, MIR_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#7a7368", base2: "#716a60", seam: "rgba(0,0,0,0.14)",
    }), { repeat: 5, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.05, rough: 0.9, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.03, color: 0xaaa294 });

    box(g, 5.6, 2.7, 0.1, 0, 1.35, -2.35, 0xe0d8c8, { rough: 0.9 });
    box(g, 5.6, 0.1, 0.14, 0, 0.05, -2.28, 0x3a4048, { rough: 0.7 });
    decal(g, 2.2, 0.18, 0, 2.4, -2.29, signFace("PATHWAY EDITION — INTERVIEW ROOM", { bg: "#1f2a36", accent: MIR_CSS, scale: 0.42 }), { px: 512 });

    // The apprenticeship posting board.
    const board = holoPanel(g, 1.3, 0.9, -1.6, 1.55, -2.25, (cx, w, h) => {
      cx.fillStyle = "rgba(10,18,28,0.93)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = MIR_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbeedd"; cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("APPRENTICESHIP NOTICE", w * 0.05, h * 0.1);
      cx.font = `${Math.round(h * 0.06)}px Arial, sans-serif`; cx.fillStyle = "#f3e6d2";
      ["Registered apprenticeship standard", "OSHA 10 required", "Teamsters training programme", "Deadline: two weeks from today"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.28 + i * 0.16)));
    }, { accent: MIR_ACCENT });
    reg2(board, "wp-mi-posting-board");

    // Sign-in stand.
    const stand = group(g, -1.3, 0, -1.1, 0.3);
    cyl(stand, 0.2, 0.24, 0.04, 0, 0.02, 0, 0x3a4048, { rough: 0.5, metal: 0.4, seg: 18 });
    cyl(stand, 0.03, 0.03, 1.0, 0, 0.52, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    const lectern = group(stand, 0, 1.05, 0);
    lectern.rotation.x = -0.35;
    slab(lectern, 0.5, 0.04, 0.36, 0, 0, 0, 0x5a4a3a, { radius: 0.01, rough: 0.6 });
    decal(lectern, 0.44, 0.3, 0, 0.022, 0, paperFace("INTERVIEW SIGN-IN", ["Name · slot time", "1. ______"], { bg: "#fbf8f0", band: "#7a5a20" }), { px: 256 }).rotation.x = -Math.PI / 2;
    holoTag(stand, "sign-in sheet", 0, 1.3, 0, { css: MIR_CSS, w: 0.34 });
    reg2(lectern, "wp-mi-signin-sheet");

    // Trip cord.
    const cord = cyl(g, 0.015, 0.015, 1.8, -0.4, 0.01, -0.7, 0x1c1f23, { rough: 0.6, seg: 8 });
    cord.rotation.z = Math.PI / 2;
    holoTag(g, "extension cord across the room?", -0.4, 0.15, -0.7, { css: "#f0645b", w: 0.42 });
    reg2(cord, "wp-mi-trip-cord");

    // The desk: draft resume with gaps, plus the interview chair.
    const desk = group(g, 0.3, 0, -1.5);
    slab(desk, 1.5, 0.05, 0.7, 0, 0.74, 0, 0x7a6048, { radius: 0.02, rough: 0.6 });
    for (const sx of [-1, 1]) box(desk, 0.06, 0.72, 0.5, sx * 0.7, 0.37, 0, 0x4a3a2a, { rough: 0.6 });
    const draft = decal(desk, 0.5, 0.6, -0.3, 0.77, 0.05, paperFace("DRAFT RESUME", [
      "J. Applicant", "Warehouse — 2021 to ____", "Forklift, pallet jack",
      "Certifications: ____", "References: ____",
    ], { bg: "#f6f3ea", band: "#7a5a20" }), { px: 320 });
    draft.rotation.x = -Math.PI / 2;
    const gapMark = (id, x, y) => reg2(box(desk, 0.4, 0.02, 0.03, x, 0.775, y, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), id);
    gapMark("wp-mi-gap-dates", -0.3, -0.18);
    gapMark("wp-mi-gap-osha10", -0.3, -0.02);
    gapMark("wp-mi-gap-reference", -0.3, 0.14);
    const confidenceDial = instrument(desk, 0.55, 0.02, 0.1, { idle: "-/10", color: MIR_ACCENT, ry: -0.2 });
    holoTag(confidenceDial, "confidence", 0, 0.18, 0, { css: MIR_CSS, w: 0.26 });
    reg2(confidenceDial, "wp-mi-confidence-dial");
    const phone = box(desk, 0.08, 0.015, 0.15, 0.6, 0.755, 0.22, 0x1b1e23, { rough: 0.3 });
    const phoneGlow = box(desk, 0.07, 0.01, 0.12, 0.6, 0.763, 0.22, 0x2f5f9e, { emissive: 0x2f5f9e, ei: 0, rough: 0.4 });
    holoTag(desk, "phone mute switch", 0.6, 0.85, 0.22, { css: "#f0645b", w: 0.3 });
    reg2(phone, "wp-mi-phone-mute");
    void phoneGlow;

    // Resume section slabs: contact, experience, skills.
    const sections = group(g, -1.6, 0, -0.6);
    slab(sections, 1.0, 0.03, 0.4, 0, 0.72, 0, 0x8a7862, { radius: 0.02, rough: 0.7 });
    const SECS = [["wp-mi-section-contact", -0.32, "CONTACT INFO"], ["wp-mi-section-experience", 0, "WORK EXPERIENCE"], ["wp-mi-section-skills", 0.32, "SKILLS + CERTS"]];
    for (const [id, x, label] of SECS) {
      const p = decal(sections, 0.26, 0.16, x, 0.735, 0, paperFace(label, ["draft"], { bg: "#f6f3ea", band: "#7a5a20" }), { px: 160 });
      p.rotation.x = -Math.PI / 2;
      reg2(p, id);
    }
    holoTag(sections, "resume sections", 0, 0.94, 0, { css: MIR_CSS, w: 0.36 });

    // The interview chairs facing the coach, and the poise track / hard-question cards.
    const chairA = group(g, 0.3, 0, 0.5, Math.PI);
    box(chairA, 0.44, 0.06, 0.44, 0, 0.42, 0, 0x4a535c, { rough: 0.8 });
    box(chairA, 0.44, 0.02, 0.06, 0, 0.34, 0.19, 0x4a535c, { rough: 0.8 });
    holoTag(chairA, "seat height — raise it first?", 0, 0.7, 0, { css: "#f0645b", w: 0.44 });
    reg2(chairA, "wp-mi-chair-slump");
    const poiseTrack = instrument(g, 1.0, 0.9, 0.55, { idle: "POISE", color: MIR_ACCENT, w: 0.2, d: 0.24 });
    holoTag(poiseTrack, "hold your poise", 0, 0.2, 0, { css: MIR_CSS, w: 0.36 });
    reg2(poiseTrack, "wp-mi-poise-track");
    const answers = group(g, 1.55, 0.9, 0.0, -0.4);
    const answerBox = (id, y, label, band, w2) => {
      const c = decal(answers, w2, 0.16, 0, y, 0, signFace(label, { bg: "#0c1a24", accent: band, scale: 0.32 }), { px: 224, glow: true, ei: 0.6, transparent: true });
      reg2(c, id);
    };
    answerBox("wp-mi-honest-answer", 0.14, "THE SCHEDULE STOPPED WORKING", MIR_CSS, 0.5);
    answerBox("wp-mi-blame-boss", -0.04, "MY OLD BOSS WAS THE PROBLEM", "#f0645b", 0.46);
    answerBox("wp-mi-vague-story", -0.22, "IT JUST DIDN'T WORK OUT", "#f0645b", 0.4);
    holoTag(answers, "why did you leave?", 0, 0.34, 0, { css: MIR_CSS, w: 0.4 });

    // STAR sequence, on a stand.
    const star = group(g, -0.4, 0, 1.1, -0.6);
    cyl(star, 0.02, 0.02, 1.5, 0, 0.75, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
    const STAR = [["wp-mi-star-situation", "S — situation", 0.5], ["wp-mi-star-task", "T — task", 0.78], ["wp-mi-star-action", "A — action", 1.06], ["wp-mi-star-result", "R — result", 1.34]];
    for (const [id, label, y] of STAR) {
      const bead = box(star, 0.05, 0.05, 0.05, 0, y, 0, MIR_ACCENT, { emissive: MIR_ACCENT, ei: 1.2, rough: 0.4 });
      holoTag(star, label, 0.2, y, 0, { css: MIR_CSS, w: 0.34 });
      reg2(bead, id);
    }

    // Recorder, packet folder, OSHA10 copy.
    const recorder = group(g, -1.2, 0.75, 0.6, 0.3);
    box(recorder, 0.18, 0.05, 0.1, 0, 0, 0, 0x2b2f34, { rough: 0.5 });
    const recDial = cyl(recorder, 0.03, 0.03, 0.02, 0.06, 0.03, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 12 });
    holoTag(recorder, "recorder", 0, 0.14, 0, { css: MIR_CSS, w: 0.24 });
    reg2(recDial, "wp-mi-recorder-dial");
    const packetFolder = box(g, 0.3, 0.02, 0.4, -1.9, 0.76, -1.4, 0x3f6f7a, { rough: 0.6 });
    packetFolder.visible = true;
    reg2(box(g, 0.3, 0.1, 0.4, -1.9, 0.8, -1.4, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-mi-packet-folder");
    holoTag(g, "resume packet", -1.9, 0.94, -1.4, { css: MIR_CSS, w: 0.3 });
    const osha10 = group(g, -1.9, 0.78, -0.9, 0.2);
    slab(osha10, 0.14, 0.004, 0.09, 0, 0, 0, 0xf6f4ee, { radius: 0.006, rough: 0.6 });
    decal(osha10, 0.13, 0.08, 0, 0.004, 0, paperFace("OSHA 10 COPY", ["current"], { bg: "#f6f4ee", band: "#7a5a20" }), { px: 128 }).rotation.x = -Math.PI / 2;
    reg2(osha10, "wp-mi-osha10-copy");
    const resumePacket = decal(g, 0.4, 0.22, -1.9, 0.77, -1.4, paperFace("RESUME PACKET", ["print · sign"], { bg: "#f6f3ea", band: "#7a5a20" }), { px: 224 });
    resumePacket.rotation.x = -Math.PI / 2;
    reg2(resumePacket, "wp-mi-resume-packet");
    const logBoard = decal(g, 0.36, 0.2, -1.5, 0.78, -1.4, paperFace("INTERVIEW LOG", ["Feedback: ____"], { bg: "#f6f3ea", band: "#3f6f7a" }), { px: 192 });
    logBoard.rotation.x = -Math.PI / 2;
    holoTag(g, "interview log", -1.5, 0.92, -1.4, { css: MIR_CSS, w: 0.28 });
    reg2(logBoard, "wp-mi-interview-log");

    // Exit sign for the fire-drill interrupt.
    const exitSign = box(g, 0.3, 0.14, 0.03, 1.6, 2.2, -2.32, 0x1c3a1c, { rough: 0.5 });
    const exitFace = decal(exitSign, 0.26, 0.1, 0, 0, 0.016, signFace("EXIT", { bg: "#0d2b0d", accent: "#59c97b", scale: 0.55 }), { px: 128, glow: true, ei: 0.6 });
    reg2(exitSign, "wp-mi-exit-sign");

    // The stuffy window unit and the aggressive no-show visitor.
    const windowUnit = box(g, 0.5, 0.35, 0.2, 2.4, 1.5, -2.25, 0xc9ced2, { rough: 0.6, metal: 0.3 });
    holoTag(g, "window unit off — open the door?", 2.4, 1.85, -2.25, { css: "#f0645b", w: 0.44 });
    reg2(windowUnit, "wp-mi-stuffy-room");
    const visitor = standingFigure(g, 1.9, -2.0, { ry: Math.PI, cloth: 0x7a4a2a, skin: 0x8a5a3a, atStation: true });
    holoTag(visitor, "demanding to go first?", 0, 1.9, 0, { css: "#f0645b", w: 0.4 });
    reg2(box(visitor, 0.6, 1.4, 0.6, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-mi-no-show-visitor");

    const coach = seatedFigure(g, -0.2, 0.46, 0.6, { ry: 0.2, cloth: 0x3f6b5a, skin: 0x6b4a33 });
    holoTag(coach.torso, "coach", 0, 1.3, 0.12, { css: MIR_CSS, w: 0.2 });
    reg2(box(g, 0.5, 1.2, 0.5, -0.2, 1.0, 0.6, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-mi-coach");

    let phoneOn = false, alarmOn = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.3, -1.6),

      onStepComplete(step) {
        if (step.id === "find-gaps") repaint(draft, paperFace("DRAFT RESUME", [
          "J. Applicant", "Warehouse — 2021 to present", "Forklift, pallet jack",
          "Certifications: OSHA 10", "References: on request",
        ], { bg: "#f6f3ea", band: "#59c97b" }));
        if (step.id === "confidence-gauge") repaint(confidenceDial.userData.screen, signFace("SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.5 }));
        if (step.id === "review-recording") recDial.rotation.z = Math.PI;
        if (step.id === "print-resume") repaint(resumePacket, paperFace("RESUME PACKET", ["printed · signed"], { bg: "#f6f3ea", band: "#59c97b" }));
        if (step.id === "close-log") repaint(logBoard, paperFace("INTERVIEW LOG", ["Feedback: logged"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "wp-mi-phone-buzz") { phoneOn = true; phoneGlow.material.emissiveIntensity = 1.2; }
        if (it.id === "wp-mi-fire-drill") { alarmOn = true; exitSign.material.emissive?.set?.(0xf0645b); exitSign.material.emissiveIntensity = 1.2; }
      },
      onInterruptEnd(it) {
        if (it.id === "wp-mi-phone-buzz") { phoneOn = false; phoneGlow.material.emissiveIntensity = 0; }
        if (it.id === "wp-mi-fire-drill") {
          alarmOn = false;
          exitSign.material.emissive?.set?.(0x1c3a1c);
          exitSign.material.emissiveIntensity = 0.5;
          if (it.resolved === "answered") repaint(exitFace, signFace("EXIT", { bg: "#0d2b0d", accent: "#59c97b", scale: 0.55 }));
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (phoneOn) phoneGlow.material.emissiveIntensity = 0.7 + Math.sin(t * 9) * 0.5;
        if (alarmOn) exitSign.material.emissiveIntensity = 0.5 + Math.sin(t * 7) * 0.4;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "confidence-gauge") {
          const ok = gg.t >= 0.4 && gg.t <= 0.7;
          repaint(confidenceDial.userData.screen, signFace(`${Math.round(1 + gg.t * 9)}/10`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "mock-questions") {
          const ok = tr.v >= 0.36 && tr.v <= 0.66;
          repaint(poiseTrack.userData.screen, signFace(ok ? "STEADY" : tr.v < 0.36 ? "SLUMPING" : "STARING", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.4 }));
        }
        void t; void dt;
      },
    };
  },
};
