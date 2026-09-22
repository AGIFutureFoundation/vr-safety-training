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

// SmartCiti.X~ Critical Incident Debrief VR — First Responder series, the
// peer-support station.
//
// Four hours after a critical incident, in the quiet room off the station
// corridor. The learner is the peer-support team member: not a clinician, not
// an investigator, not the supervisor. The whole station is one conversation,
// and the things it is scored on are the things that actually decide whether
// an officer takes the help — the door closed, the chair moved to the same
// side of the table, the confidentiality rule said out loud with its real
// limits, three questions in the order the defusing model puts them, and a
// silence long enough for an answer.
//
// The fitness-for-duty question is deliberately a separate step in a separate
// place. Mixing an employer's medical inquiry into a peer conversation is how
// departments teach their own people that peer support is a screening in
// disguise, and once a shift believes that, nobody uses it again.

const CIDB_ACCENT = 0x8fb8d8;

export const SIM_CRITICAL_INCIDENT_DEBRIEF = {
  id: "critical-incident-debrief",
  index: "204",
  domain: "Emergency Services",
  trade: "Police officer — crisis intervention team",
  category: "Emergency Services",
  indoor: "service",
  weather: "overcast",
  certification: "NFPA 1500's member assistance and behavioural-health programme requirement, applied the way a police or fire department applies it to critical-incident stress; the critical incident stress management model published by the International Critical Incident Stress Foundation — peer support as the first contact, a defusing inside the first hours, a formal debriefing a day to three days out; SAMHSA's trauma-informed care principles and Psychological First Aid (NCTSN and WHO); the Americans with Disabilities Act (ADA) rule that keeps an employer's fitness-for-duty medical inquiry separate from, and confidential from, an employee's support conversation; HIPAA for the records the employee assistance programme's clinician keeps, which the department does not get to read; OSHA's General Duty Clause as the only federal hook a department has on a psychological hazard; NIMS/ICS through FEMA IS-100 for the incident this shift has just come off; the officers' association and FOP contract language establishing the peer-support team and the chaplaincy",
  name: "Critical Incident Debrief",
  title: simTitle("Critical Incident Debrief"),
  tagline: "The quiet room four hours after: the signs named, the door closed, the rule said out loud, three questions in order — and the fitness-for-duty question kept out of it",
  accent: CIDB_ACCENT,
  accentCss: "#8fb8d8",
  parSeconds: 345,
  footprint: 2.4,
  badge: { id: "same-side-of-the-table", name: "Same Side of the Table", note: "A defusing run as a defusing — confidentiality stated, nothing promised that could not be kept, and a follow-up on the calendar" },

  game: system({
    name: "Peer Contact",
    currency: "TRUST",
    ranks: ["Officer", "Peer Support Trained", "Peer Team Member", "Team Coordinator", "CISM Instructor"],
    badges: [
      { id: "saw-it-first", name: "Saw It First", note: "Every stress sign named before the conversation started", test: AWARD.stepClean("read-the-signs") },
      { id: "nothing-pushed", name: "Nothing Pushed", note: "No unsafe action anywhere in the contact", test: AWARD.safe },
      { id: "silence-held", name: "Silence Held", note: "The pace and the pause both carried their full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "no-corrections", name: "No Corrections", note: "No corrections anywhere in the contact", test: AWARD.clean },
      { id: "right-window", name: "Right Window", note: "The defusing window read inside the band", test: AWARD.precise(0.7) },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "report-first": "You pushed the report across the table before anything else. Paperwork first tells the officer what this conversation is actually for, and it is the single fastest way to turn a peer contact into an administrative process they will decline next time and advise everyone else to decline too.",
    "investigate-the-decisions": "You started asking why they did what they did. Peer support is not the investigation and cannot be allowed to look like it — the moment your questions turn tactical, everything said in this room becomes something the officer has to assume will be repeated, and the conversation is over whether they stay in the chair or not.",
    "promise-total-secrecy": "You promised that nothing said here ever leaves this room. It is the promise people most want to make and the one that breaks trust hardest, because there are limits — a threat to somebody's life, a disclosure of a crime, a fitness concern — and the officer will find out about them at the worst possible moment.",
    "straight-back-on-patrol": "You put them straight back on the duty board for the rest of the shift. Returning an officer to the street inside hours of a critical incident, with their sleep and concentration where they are right now, is the department deciding a staffing problem matters more than the reason its own behavioural-health programme exists.",
  },

  lateNotes: {
    "fit-for-duty-form": "The fitness-for-duty question belongs after this conversation is closed, and it belongs to the supervisor's authority rather than to yours — asked from inside a peer contact it contaminates both.",
    "make-the-call": "Nobody at home gets called before the officer has said who to call and what to say. The call made first is the one that arrives as news from a stranger.",
  },

  steps: [
    {
      id: "read-the-signs", kind: "find", noHint: true,
      targets: ["sign-hands-unsteady", "sign-replaying-it", "sign-still-in-gear"],
      itemNames: {
        "sign-hands-unsteady": "hands still unsteady on the cup",
        "sign-replaying-it": "replaying it — mid-sentence, then gone",
        "sign-still-in-gear": "still in full gear four hours on",
      },
      itemNotes: {
        "sign-hands-unsteady": "Adrenaline outlasts the incident by hours. Unsteady hands this long afterward are physiology, not weakness, and saying so is half of what the next twenty minutes is for.",
        "sign-replaying-it": "They start a sentence about something else and stop. Intrusive replay is the most common stress reaction there is and the one officers are least likely to mention unprompted.",
        "sign-still-in-gear": "Nobody has taken the vest off or sat down properly. Staying in gear is staying on the call, and it is a reliable sign the shift has not actually ended for them yet.",
      },
      title: "Read the officer before you say anything",
      cue: "Look at them for a moment. Three things say this shift has not ended for them yet.",
      why: "Peer support starts with observation because the officer will not open with any of it. The physical signs — unsteady hands, an interrupted train of thought, gear still on hours later — are what let you name something concrete instead of asking a question they can answer with \"fine\". Naming what you can actually see is also the only opening that does not require them to admit anything first.",
    },
    {
      id: "defusing-window", kind: "gauge", target: "incident-clock",
      title: "Check the clock — is this a defusing or a debriefing?",
      cue: "Read the hours since the incident and commit when it lands in the defusing window.",
      gauge: {
        label: "SINCE INCIDENT", speed: 0.6, green: [0.05, 0.62],
        readout: (t) => `${(t * 12).toFixed(1)} h since`,
        missNote: "That is outside the defusing window. Past it, the right intervention is a formal debriefing a day to three days out with the team assembled — committing to the wrong one is not a scheduling error, it is the wrong conversation.",
      },
      why: "The critical incident stress management model is a sequence of different interventions on a clock, not one conversation available whenever somebody gets round to it. A defusing is a short peer contact in the first hours, while the shift is still in the building. A formal debriefing is a structured group session a day to three days later, with a mental-health professional present. Running one in the other's slot does measurable harm: too early a group session pushes people to disclose before they have processed anything, too late a defusing leaves hours of rumination unaddressed.",
    },
    {
      id: "close-the-door", kind: "turn", target: "door-latch",
      title: "Close the door",
      cue: "Turn the latch. This conversation does not happen in the corridor.",
      turn: { turns: 1, axis: "y", label: "DOOR LATCH" },
      why: "A confidential conversation held with the door open is not one, and everybody in the building knows it. The closed door is the first physical proof that the rule you are about to state is real, and it removes the audience the officer would otherwise be performing for — which matters, because the version of this an officer gives in front of colleagues is always the shorter, tougher, less useful one.",
    },
    {
      id: "sit-beside", kind: "drag", target: "peer-chair",
      title: "Move your chair to the same side of the table",
      cue: "Bring the chair round beside them — no desk between you.",
      drag: {
        to: "beside-spot", radius: 0.55,
        missNote: "Still across the table. A table between two people is an interview layout, and the officer has already sat through one of those today — bring the chair round to the same side.",
      },
      why: "Furniture sets the register of a conversation before a word is said. Facing somebody across a table is the geometry of an interview, a performance review and an interrogation, all of which this officer is braced for. Sitting beside them at an angle, at the same height, is the geometry of two colleagues talking, and it also removes the eye contact that makes the hardest parts harder to say.",
    },
    {
      id: "confidentiality-rule", kind: "select", target: "confidentiality-card",
      title: "State the confidentiality rule, limits included",
      cue: "\"This stays between us. The exceptions are a threat to your life or somebody else's, and a crime — I'd tell you first.\"",
      why: "Stating the rule with its limits is what makes it worth anything. An officer who has been told the truth about the boundaries can decide what to say inside them; an officer promised total secrecy has been handed a promise that will be broken, and the day it breaks they stop trusting the programme and tell everybody else to as well. Saying \"I'd tell you first\" is the part that costs nothing and is remembered longest.",
    },
    {
      id: "defusing-questions", kind: "sequence",
      targets: ["ask-what-happened", "ask-worst-part", "ask-what-you-need"],
      itemNames: {
        "ask-what-happened": "\"Walk me through what happened.\"",
        "ask-worst-part": "\"What was the worst part of it for you?\"",
        "ask-what-you-need": "\"What do you need tonight?\"",
      },
      title: "Work the three questions in order",
      cue: "Facts first, then the reaction, then what they need. Do not jump ahead.",
      why: "The three-phase order is the whole method. Starting with the facts gives somebody a version of events they can tell without exposing anything, which settles them enough to answer the second question honestly. \"What was the worst part\" is where the real content lives, and it only lands after the narrative exists. Asking what they need last means the answer is informed by what they have just said rather than being the reflexive \"nothing\" they would have given you at the start.",
      outOfOrderNote: "Facts, then the worst part, then what they need. Opening with what they need gets \"nothing\"; opening with the worst part asks somebody to lead with the thing they are least ready to say.",
    },
    {
      id: "hold-the-pace", kind: "track", target: "pace-point", seconds: 7,
      title: "Hold the conversation at their pace",
      cue: "Keep it in the band — not filling every gap, not leaving them alone in it.",
      track: {
        start: 0.5, green: [0.34, 0.7], rise: 0.5, fall: 0.42, drift: 0.15, label: "PACE",
        readout: (v) => (v < 0.34 ? "pushing" : v > 0.7 ? "left them alone in it" : "with them"),
      },
      why: "Pace is a live thing and it drifts both ways. Push and the officer gives shorter answers until there is nothing left to work with; go too quiet for too long and the silence stops being room and starts being abandonment. Staying in the band means following their tempo rather than the one your own discomfort would set, and that is the difference between a conversation somebody comes back to and one they close down.",
      holdBreakNote: "The pace got away from you — either you filled the gaps or you left them sitting in one. Come back to their tempo and hold it.",
    },
    {
      id: "let-it-land", kind: "hold", target: "let-it-land-point", seconds: 9,
      title: "Let the hard answer land",
      cue: "They have just said the worst part. Hold the silence and do not tidy it up.",
      why: "The reflex after somebody says something difficult is to make it smaller — to reassure, to explain, to move on. All of that tells them the thing they just said was too much for the room. Holding the silence says the opposite, and it leaves space for the sentence that usually follows, which is the one that actually matters. There is nothing you need to do in these nine seconds except stay in the chair.",
      holdBreakNote: "You reached for something reassuring. Nothing had gone wrong — the pause was where the next sentence was coming from, and it does not come now.",
    },
    {
      id: "normalise-the-reaction", kind: "select", target: "normalise-card",
      title: "Name the reactions as normal reactions",
      cue: "\"Not sleeping, replaying it, snapping at people — that's what this does to everybody. It's not a problem with you.\"",
      why: "Most of what frightens an officer in the days after a critical incident is not the incident, it is the suspicion that their own reaction to it means something is wrong with them. Naming intrusive replay, broken sleep and irritability as the ordinary physiology of an extraordinary event removes that second problem entirely, and it is the single most useful sentence in a defusing. It is also true, which is why it works.",
    },
    {
      id: "name-the-supports", kind: "sequence", anyOrder: true,
      targets: ["eap-card", "chaplain-card", "peer-roster"],
      itemNames: {
        "eap-card": "the employee assistance programme — by name and number",
        "chaplain-card": "the chaplain — available, and not only to the religious",
        "peer-roster": "the peer-support roster — who else has done this",
      },
      title: "Name the supports, specifically",
      cue: "Three real options, each with a name and a number. Not \"there's stuff available\".",
      why: "\"There's support available if you need it\" is a sentence that has never produced a phone call. What produces one is a specific name, a specific number and a specific description of what happens when you use it — including that the employee assistance clinician's records are the clinician's and not the department's. Naming the chaplain matters for the same reason: officers who would not call a counsellor will talk to a chaplain, and the chaplain does not keep a file.",
    },
    {
      id: "fit-for-duty-separated", kind: "select", target: "fit-for-duty-form",
      title: "Take the fitness-for-duty question out of this room",
      cue: "Close the peer conversation first, then hand the duty question to the supervisor where it belongs.",
      why: "Whether an officer works tomorrow is an employer's decision made on an employer's process, with its own confidentiality rules and its own paperwork. Asked from inside a peer contact it turns the whole conversation into a screening, and everything the officer said becomes evidence they did not know they were giving. Keeping the two apart — different person, different room, different record — is what lets both of them function.",
    },
    {
      id: "family-with-consent", kind: "sequence",
      targets: ["ask-consent", "agree-what-to-say", "make-the-call"],
      itemNames: {
        "ask-consent": "ask first — \"do you want anyone called?\"",
        "agree-what-to-say": "agree what gets said, and what does not",
        "make-the-call": "make the call",
      },
      title: "Notify the family, with consent and in their words",
      cue: "Ask whether to call, agree what they want said, then make the call.",
      why: "A partner at home who hears about a critical incident from a stranger, or from the news, spends the evening imagining the worst version of it — and the officer comes home to a household already in crisis. Doing it with consent, and with the wording agreed in advance, gives the officer control over one of the very few things still in their control today. Doing it without asking takes that away in the name of helping.",
      outOfOrderNote: "Consent, then the wording, then the call. A call placed before the officer has agreed what gets said is a decision made about their family without them.",
    },
    {
      id: "follow-up-scheduled", kind: "drag", target: "follow-up-card",
      title: "Put the follow-up on the calendar",
      cue: "Set the follow-up contact at the seventy-two-hour mark, in writing, before anybody leaves.",
      drag: {
        to: "calendar-72h", radius: 0.5,
        missNote: "Not on the calendar. A follow-up that exists only as \"I'll check in on you\" is one that gets remembered on the fourth day, which is a day after the one that matters most.",
      },
      why: "The reactions that need attention usually arrive after the adrenaline clears, two or three days out, which is exactly when everybody has moved on to the next shift. A scheduled contact at that point is the difference between catching that and hearing about it six months later from somebody else. Written down, it also survives the peer supporter being off, on a call, or on leave.",
    },
    {
      id: "peer-contact-log", kind: "select", target: "peer-log-board",
      title: "Log the contact — that it happened, not what was said",
      cue: "Record the contact, the time and the referrals. No content.",
      why: "The peer team's log has to prove the programme is working without recording a word of what anybody said, and that tension is the whole design. Contact made, time, interventions offered, follow-up booked: enough for the coordinator to see whether officers are actually being reached and enough for the department to fund it, with nothing in it that an officer would be afraid of. A log with content in it is a log that ends the programme.",
    },
    {
      id: "supporter-check-in", kind: "select", target: "supporter-checkin-board",
      title: "Arrange your own check-in before you go home",
      cue: "You just carried somebody else's worst shift. Book your own contact with the coordinator.",
      why: "Peer supporters absorb the material they are handed, and the team's own rule — the one every critical incident stress programme writes down and most people skip — is that whoever runs a defusing gets one too. Booking it now, out loud, is also the modelling that matters most: an officer who watches the peer supporter use the programme on themselves learns more about whether it is safe to use than any poster in the corridor could tell them.",
    },
  ],

  interrupts: [
    {
      id: "supervisor-wants-the-report",
      kind: "Supervisor interrupting",
      after: "hold-the-pace", delay: 3, seconds: 12,
      alert: "A supervisor has opened the door and put a report folder on the table — \"I need the statement before end of shift, it'll only take ten minutes.\"",
      cue: "The report waits. Say so, and keep the conversation you are in.",
      target: "defer-the-report",
      why: "A statement taken mid-defusing is bad on both counts: the account is given by somebody whose recall is still reorganising itself, and the peer contact it interrupted does not resume. Deferring it is not obstruction — memory for a critical incident is measurably better after a sleep cycle, and every department's own policy says so — but somebody in the room has to say it out loud, and the officer cannot be the one who does.",
      missNote: "The folder sat on the table for the rest of the conversation and the officer's answers shortened to nothing. Whatever was said after that was said to the room the report was in, not to you.",
      wrongNote: "Not the folder itself. The thing that has to happen is telling the supervisor the statement waits — picking it up is agreeing to the interruption.",
    },
    {
      id: "reaching-for-the-keys",
      kind: "Officer disengaging",
      after: "let-it-land", delay: 3, seconds: 12,
      alert: "\"I'm fine, honestly.\" They have picked their keys up off the table and are half out of the chair.",
      cue: "Name what you see. Do not argue, do not block the door.",
      target: "name-what-you-see",
      why: "\"I'm fine\" plus a set of keys is not a decision, it is the point where the conversation got close to something. Pushing back on it starts an argument the officer will win by leaving; letting it go ends the contact with nothing. Naming what you can actually observe — the hands, the sentence that stopped, four hours in the same gear — puts the truth in the room without demanding they agree with it, and leaves them the choice to sit back down.",
      missNote: "They left. Nothing was named, so the last thing said in that room was \"I'm fine\" — and the next person who offers is going to be told the same thing, faster.",
      wrongNote: "Not that. You do not talk them out of leaving and you do not stand in the way — you say plainly what you have been watching for the last twenty minutes, and then you let them decide.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, CIDB_ACCENT);

    // ------------------------------------------------------------------ floor
    // Carpet tile over the station's own vinyl — the quiet room is the one
    // room in the building somebody bothered to soften.
    const rugTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#68727f", base2: "#5f6874", seam: "rgba(30,36,44,0.4)",
    }), { repeat: 4, px: 384 });
    const rug = box(g, 5.4, 0.018, 4.8, 0, 0.01, -0.5, 0x68727f, { rough: 0.95, cast: false });
    rug.material = texturedMat(rugTex, { rough: 0.95, metal: 0.02, color: 0x68727f });

    // A painted-block wall panel behind the seating, textured rather than flat.
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#a8b2ba", base2: "#9ca6ae", seam: "rgba(60,68,76,0.35)",
    }), { repeat: 3, px: 320 });
    const backWall = box(g, 6.4, 2.9, 0.12, 0, 1.45, -3.1, 0xa8b2ba, { rough: 0.9 });
    backWall.material = texturedMat(wallTex, { rough: 0.9, metal: 0.02, color: 0xa8b2ba });
    box(g, 6.6, 0.1, 0.2, 0, 2.95, -3.1, 0x7f8992, { rough: 0.8 });

    // ------------------------------------------------------------ the doorway
    // On the side wall, not across the spawn: the learner arrives looking into
    // the room, and a door leaf in their face is the first thing they would see.
    const doorway = group(g, 2.95, 0, 1.4, -Math.PI / 2);
    box(doorway, 0.14, 2.3, 0.16, -0.62, 1.15, 0, 0x4e565f, { rough: 0.7 });
    box(doorway, 0.14, 2.3, 0.16, 0.62, 1.15, 0, 0x4e565f, { rough: 0.7 });
    box(doorway, 1.4, 0.14, 0.16, 0, 2.37, 0, 0x4e565f, { rough: 0.7 });
    const doorLeaf = box(doorway, 1.06, 2.14, 0.06, 0.0, 1.08, 0.08, 0x7a685a, { rough: 0.65 });
    const latchPlate = group(doorway, 0.44, 1.05, 0.14);
    box(latchPlate, 0.06, 0.14, 0.02, 0, 0, 0, 0xb0b8c0, { rough: 0.35, metal: 0.8 });
    const latchKnob = cyl(latchPlate, 0.026, 0.026, 0.06, 0, 0, 0.04, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 12 });
    latchKnob.rotation.x = Math.PI / 2;
    holoTag(latchPlate, "Door latch", 0, 0.2, 0, { css: "#8fb8d8", w: 0.32 });
    reg(hits, latchKnob, "door-latch");

    // -------------------------------------------------------------- the table
    const tableTop = cyl(g, 0.62, 0.62, 0.05, 0.3, 0.72, -1.5, 0x6b5a48, { rough: 0.5, seg: 24 });
    cyl(g, 0.07, 0.09, 0.7, 0.3, 0.35, -1.5, 0x3a4149, { rough: 0.5, metal: 0.4, seg: 14 });
    cyl(g, 0.3, 0.3, 0.03, 0.3, 0.015, -1.5, 0x3a4149, { rough: 0.5, metal: 0.4, seg: 18 });
    void tableTop;
    // Water jug, two cups, a lamp — the things this room is actually stocked with.
    cyl(g, 0.07, 0.08, 0.2, 0.62, 0.85, -1.58, 0xcfe0e8, { rough: 0.25, metal: 0.1, opacity: 0.7, transparent: true, seg: 14 });
    const cupA = cyl(g, 0.04, 0.035, 0.09, 0.05, 0.79, -1.22, 0xe6eaee, { rough: 0.5, seg: 14 });
    cyl(g, 0.04, 0.035, 0.09, 0.5, 0.79, -1.16, 0xe6eaee, { rough: 0.5, seg: 14 });
    const lampStem = cyl(g, 0.02, 0.03, 0.34, 0.52, 0.92, -1.86, 0x3a4149, { rough: 0.5, metal: 0.4, seg: 10 });
    void lampStem;
    ball(g, 0.075, 0.52, 1.13, -1.86, 0xffe6b0, { emissive: 0xffe6b0, ei: 0.9, rough: 0.5, seg: 12 });

    // The officer's gear on the table, and the keys beside it.
    const gearPile = group(g, 0.08, 0.76, -1.78);
    box(gearPile, 0.22, 0.07, 0.15, 0, 0, 0, 0x22272d, { rough: 0.75 });
    box(gearPile, 0.1, 0.05, 0.11, 0.07, 0.05, 0.02, 0x2c3238, { rough: 0.7 });
    const keys = group(g, 0.44, 0.77, -1.36);
    box(keys, 0.05, 0.012, 0.028, 0, 0, 0, 0x8d959d, { rough: 0.4, metal: 0.8 });
    cyl(keys, 0.022, 0.022, 0.006, 0.04, 0, 0, 0xb0b8c0, { rough: 0.35, metal: 0.85, seg: 12 });

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
    const officerChair = roomChair(g, -0.85, -2.2, 0.5, 0x4a535c);
    void officerChair;
    const peerChair = roomChair(g, 1.65, -0.85, -1.9, 0x4a535c);
    holoTag(peerChair, "Your chair", 0, 1.1, 0, { css: "#8fb8d8", w: 0.32 });
    reg(hits, peerChair, "peer-chair");

    const besideSpot = group(g, -1.15, 0, -1.3);
    const besideMark = box(besideSpot, 0.56, 0.012, 0.56, 0, 0.02, 0, 0x59c97b, { rough: 0.8, emissive: 0x59c97b, ei: 0.3, cast: false });
    holoTag(besideSpot, "Same side of the table", 0, 0.16, 0, { css: "#59c97b", w: 0.56 });
    reg(hits, besideMark, "beside-spot");

    // ------------------------------------------------------------ the officer
    const officer = seatedFigure(g, -0.85, 0.46, -2.14, { ry: 0.55, cloth: 0x2f3946, skin: 0xbc8f68 });
    box(officer.torso, 0.42, 0.34, 0.28, 0, 0.78, 0, 0x262d36, { rough: 0.85 });  // vest, still on
    holoTag(officer.torso, "The officer", 0, 1.3, 0.12, { css: "#8fb8d8", w: 0.34 });

    const signHands = ball(officer.torso, 0.024, 0.2, 0.6, 0.24, CIDB_ACCENT, { emissive: CIDB_ACCENT, ei: 1.4, seg: 12 });
    holoTag(officer.torso, "Hands unsteady", 0.2, 0.74, 0.24, { css: "#8fb8d8", w: 0.42 });
    reg(hits, signHands, "sign-hands-unsteady");
    const signReplay = ball(officer.torso, 0.024, -0.02, 1.26, 0.1, CIDB_ACCENT, { emissive: CIDB_ACCENT, ei: 1.4, seg: 12 });
    holoTag(officer.torso, "Replaying it", -0.02, 1.4, 0.1, { css: "#8fb8d8", w: 0.38 });
    reg(hits, signReplay, "sign-replaying-it");
    const signGear = ball(officer.torso, 0.024, -0.24, 0.82, 0.18, CIDB_ACCENT, { emissive: CIDB_ACCENT, ei: 1.4, seg: 12 });
    holoTag(officer.torso, "Still in gear", -0.28, 0.96, 0.18, { css: "#8fb8d8", w: 0.38 });
    reg(hits, signGear, "sign-still-in-gear");

    // -------------------------------------------------------- graded controls
    const clockMount = group(g, -1.9, 1.7, -3.0, 0.0);
    const incidentClock = instrument(clockMount, 0, 0, 0, { ry: 0, idle: "SINCE", color: CIDB_ACCENT, w: 0.22, d: 0.28 });
    incidentClock.rotation.x = Math.PI / 2.4;
    holoTag(clockMount, "Hours since the incident", 0, 0.28, 0.06, { css: "#8fb8d8", w: 0.6 });
    reg(hits, incidentClock, "incident-clock");

    const paceMount = group(g, 1.0, 0.78, -1.82, -0.4);
    const paceGauge = instrument(paceMount, 0, 0, 0, { ry: 0, idle: "PACE", color: CIDB_ACCENT, w: 0.2, d: 0.24 });
    holoTag(paceMount, "Their pace", 0, 0.2, 0, { css: "#8fb8d8", w: 0.32 });
    reg(hits, paceGauge, "pace-point");

    // ------------------------------------------------------- markers and cards
    const marker = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const bead = ball(m, o.r ?? 0.026, 0, y, 0, o.color ?? CIDB_ACCENT,
        { emissive: o.color ?? CIDB_ACCENT, ei: o.ei ?? 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? "#8fb8d8", w: o.w ?? 0.4 });
      reg(hits, bead, id);
      return bead;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.3, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0c1a24", accent: o.accent ?? "#8fb8d8", scale: 0.4 }),
        { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? "#8fb8d8", w: o.w ?? 0.46 });
      reg(hits, plate, id);
      return plate;
    };

    marker(-0.15, 1.3, -1.0, "let-it-land-point", "Let it land", { w: 0.36 });
    marker(-1.6, 1.24, -0.6, "name-what-you-see", "Name what you see", { w: 0.5, color: 0xf2c14b, css: "#f2c14b" });
    marker(1.15, 1.28, 0.75, "defer-the-report", "The report waits", { w: 0.46, color: 0xf2c14b, css: "#f2c14b" });

    card(-1.45, 1.22, -2.5, "confidentiality-card", "The rule, limits and all", "STAYS BETWEEN US", { w: 0.54, ry: 0.5 });
    card(0.35, 1.26, -2.55, "normalise-card", "Normal reactions", "NOT A PROBLEM WITH YOU", { w: 0.52, ry: 0.1 });

    // The three defusing questions, on a small stand beside the table.
    const questions = group(g, 1.35, 0, -2.0, -0.6);
    cyl(questions, 0.022, 0.022, 1.7, 0, 0.85, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
    const QUESTIONS = [
      ["ask-what-happened", "1 — walk me through it", 0.9],
      ["ask-worst-part", "2 — the worst part for you", 1.22],
      ["ask-what-you-need", "3 — what do you need tonight", 1.54],
    ];
    for (const [qid, label, y] of QUESTIONS) {
      const bead = ball(questions, 0.024, 0, y, 0, CIDB_ACCENT, { emissive: CIDB_ACCENT, ei: 1.5, seg: 12 });
      holoTag(questions, label, 0.18, y, 0, { css: "#8fb8d8", w: 0.58 });
      reg(hits, bead, qid);
    }

    // The family-notification sequence, on its own stand.
    const consent = group(g, -1.95, 0, 0.55, 0.7);
    cyl(consent, 0.022, 0.022, 1.7, 0, 0.85, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
    const CONSENT = [
      ["ask-consent", "Do you want anyone called?", 0.9],
      ["agree-what-to-say", "Agree what gets said", 1.22],
      ["make-the-call", "Make the call", 1.54],
    ];
    for (const [cid, label, y] of CONSENT) {
      const bead = ball(consent, 0.024, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(consent, label, 0.18, y, 0, { css: "#7fc4d8", w: 0.58 });
      reg(hits, bead, cid);
    }

    // ------------------------------------------------------ the support board
    const noticeboard = group(g, 1.95, 1.45, -2.95, -0.18);
    box(noticeboard, 1.3, 0.9, 0.05, 0, 0, 0, 0x8a7862, { rough: 0.85 });
    const SUPPORTS = [
      ["eap-card", "EAP — 24 h, records stay with the clinician", -0.42, 0.22, "#8fb8d8"],
      ["chaplain-card", "Chaplain — no file, no referral needed", 0.42, 0.22, "#8fb8d8"],
      ["peer-roster", "Peer team roster — who else has done this", 0.0, -0.24, "#7fc4d8"],
    ];
    for (const [sid, label, x, y, css] of SUPPORTS) {
      const sheet = decal(noticeboard, 0.38, 0.28, x, y, 0.03,
        paperFace(label.split(" — ")[0], [label.split(" — ")[1] ?? ""], { scale: 0.5 }), { px: 256 });
      holoTag(noticeboard, label, x, y - 0.2, 0.04, { css, w: 0.62 });
      reg(hits, sheet, sid);
    }
    holoTag(noticeboard, "Support — named and numbered", 0, 0.55, 0.04, { css: "#8fb8d8", w: 0.62 });

    // -------------------------------------------- the duty side of the room
    const deskRun = counter(g, 1.5, 0.5, 2.5, -1.9, 0x5b636b, { ry: -0.5, height: 0.86, undershelf: true });
    const fitForDuty = decal(deskRun, 0.26, 0.34, -0.1, 0.9, 0.02,
      paperFace("FIT FOR DUTY", ["Supervisor's process", "Separate record", "Not this conversation"], { scale: 0.45 }), { px: 256 });
    fitForDuty.rotation.x = -Math.PI / 2;
    holoTag(deskRun, "Fitness for duty — the supervisor's", -0.1, 1.06, 0, { css: "#f2c14b", w: 0.66 });
    reg(hits, fitForDuty, "fit-for-duty-form");

    // The statement folder, sitting on the duty desk where it belongs until
    // somebody carries it into the middle of a defusing.
    const reportFolder = group(g, 2.15, 0.92, -1.35, 0.3);
    box(reportFolder, 0.24, 0.02, 0.32, 0, 0, 0, 0xc9a06a, { rough: 0.8 });
    holoTag(reportFolder, "Statement — before end of shift?", 0, 0.16, 0, { css: "#f0645b", w: 0.68 });
    reg(hits, reportFolder, "report-first");

    // The calendar the follow-up is written onto, and the follow-up card.
    const calendar = group(g, -2.4, 1.35, -1.6, 0.8);
    box(calendar, 0.62, 0.46, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.7 });
    const cal72 = decal(calendar, 0.2, 0.16, 0.16, -0.06, 0.03,
      signFace("+72 h", { bg: "#0c1a24", accent: "#59c97b", scale: 0.5 }), { px: 160 });
    holoTag(calendar, "Follow-up — 72 hours", 0, 0.3, 0.04, { css: "#59c97b", w: 0.54 });
    reg(hits, cal72, "calendar-72h");
    const followCard = group(g, -1.8, 0.8, -0.35, 0.4);
    box(followCard, 0.16, 0.012, 0.11, 0, 0, 0, 0xe8edf1, { rough: 0.7 });
    cyl(followCard, 0.02, 0.02, 0.7, 0, -0.35, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 8 });
    holoTag(followCard, "Follow-up contact card", 0, 0.14, 0, { css: "#59c97b", w: 0.54 });
    reg(hits, followCard, "follow-up-card");

    // ------------------------------------------------------------- the traps
    marker(1.7, 1.5, -1.35, "investigate-the-decisions", "Ask why they did it?", { color: 0xf0645b, css: "#f0645b", w: 0.52 });
    card(-0.7, 1.24, 0.9, "promise-total-secrecy", "Promise nothing ever leaves?", "NOBODY WILL EVER KNOW", {
      w: 0.64, ry: 0.2, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    const dutyBoard = group(g, 2.6, 1.5, 0.35, -0.85);
    box(dutyBoard, 0.7, 0.52, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.7 });
    const backOnPatrol = decal(dutyBoard, 0.4, 0.2, 0, -0.1, 0.03,
      signFace("BACK ON PATROL — TONIGHT", { bg: "#2a1416", accent: "#f0645b", scale: 0.34 }), { px: 224 });
    holoTag(dutyBoard, "Duty board — put them back out?", 0, 0.33, 0.04, { css: "#f0645b", w: 0.68 });
    reg(hits, backOnPatrol, "straight-back-on-patrol");

    // ------------------------------------------------------------- the boards
    const logBoard = holoPanel(g, 0.52, 0.36, -2.55, 1.95, 0.9, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,28,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8fb8d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("PEER CONTACT LOG", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      cx.fillStyle = "#b9d8e6";
      ["Contact made · time · referrals", "Follow-up booked",
       "No content — none, ever"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.52 + i * 0.15)));
    }, { ry: 0.7, accent: CIDB_ACCENT });
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
      ["Whoever runs a defusing gets one", "Coordinator · EAP · chaplain",
       "Book it before you go home"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.54 + i * 0.15)));
    }, { ry: -0.75, accent: 0x7fc4d8 });
    reg(hits, checkBoard, "supporter-checkin-board");

    // ---------------------------------------------------------------- lockers
    const lockers = group(g, -2.85, 0, -2.2, 0.35);
    for (let i = 0; i < 3; i++) {
      cabinet(lockers, 0.44, 1.7, 0.42, -0.46 + i * 0.46, 0.88, 0, 0x4f5860, { doorColor: 0x475059 });
    }
    box(lockers, 1.42, 0.06, 0.46, 0, 0.03, 0, 0x3a4149, { rough: 0.7 });

    // The supervisor, waiting out in the corridor until the door opens.
    const supervisor = standingFigure(g, 4.5, 1.4, { ry: -Math.PI / 2, cloth: 0x333b45, trousers: 0x2a3138, skin: 0xd0a482 });
    supervisor.visible = false;

    let doorShut = false;
    let leaving = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.8, 1.15, -2.0),

      onStepComplete(step) {
        if (step.id === "close-the-door") {
          doorShut = true;
          doorLeaf.rotation.y = 0;
          doorLeaf.position.set(0, 1.08, 0.08);
          latchKnob.material = mat(0x59c97b, { rough: 0.3, metal: 0.7, emissive: 0x59c97b, ei: 0.5 });
        }
        if (step.id === "sit-beside") {
          peerChair.position.set(-1.15, 0, -1.3);
          peerChair.rotation.y = 0.35;
          besideMark.material = mat(0x59c97b, { rough: 0.8, emissive: 0x59c97b, ei: 0.8 });
        }
        if (step.id === "confidentiality-rule") {
          repaint(hits["confidentiality-card"], signFace("RULE STATED", { bg: "#0c1a24", accent: "#59c97b", scale: 0.4 }));
        }
        if (step.id === "follow-up-scheduled") {
          followCard.visible = false;
          repaint(cal72, signFace("BOOKED", { bg: "#0c1a24", accent: "#59c97b", scale: 0.5 }));
        }
        if (step.id === "peer-contact-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(8,26,20,0.9)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafbf1";
            cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("CONTACT LOGGED", w / 2, h * 0.36);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            cx.fillStyle = "#b7e6c8";
            cx.fillText("Referrals made · follow-up at 72 h", w / 2, h * 0.66);
          });
        }
      },

      // Both alarms put something physical in the room: a supervisor and a
      // folder on the table, and a set of keys in somebody's hand.
      onInterrupt(it) {
        if (it.id === "supervisor-wants-the-report") {
          supervisor.visible = true;
          supervisor.position.set(3.2, 0, 1.4);
          doorLeaf.position.set(0.95, 1.08, 0.42);
          doorLeaf.rotation.y = -1.1;
          reportFolder.position.set(0.62, 0.78, -1.02);
        }
        if (it.id === "reaching-for-the-keys") {
          leaving = true;
          keys.position.set(0.1, 1.24, -1.72);
          officer.arms[0].shoulder.rotation.x = -0.9;
          officer.arms[0].fore.rotation.x = -0.6;
          officer.torso.rotation.z = -0.12;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "supervisor-wants-the-report") {
          supervisor.visible = false;
          supervisor.position.set(4.5, 0, 1.4);
          reportFolder.position.set(2.15, 0.92, -1.35);
          if (doorShut) { doorLeaf.position.set(0, 1.08, 0.08); doorLeaf.rotation.y = 0; }
        }
        if (it.id === "reaching-for-the-keys") {
          leaving = false;
          keys.position.set(0.44, 0.77, -1.36);
          officer.arms[0].shoulder.rotation.x = 0;
          officer.arms[0].fore.rotation.x = 0;
          officer.torso.rotation.z = 0;
        }
      },

      animate(t, dt, session) {
        officer.head.rotation.y = 0.2 + Math.sin(t * 0.3) * 0.12;
        if (!leaving) cupA.position.y = 0.79 + Math.sin(t * 6.5) * 0.002;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "defusing-window") {
          const ok = gg.t >= 0.05 && gg.t <= 0.62;
          repaint(incidentClock.userData.screen, signFace(`${(gg.t * 12).toFixed(1)} H`, {
            bg: "#0c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.55,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "hold-the-pace" && tr) {
          const ok = tr.v >= 0.34 && tr.v <= 0.7;
          repaint(paceGauge.userData.screen, signFace(ok ? "WITH THEM" : tr.v < 0.34 ? "PUSHING" : "TOO QUIET", {
            bg: "#0c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.48,
          }));
        }
      },
    };
  },
};
