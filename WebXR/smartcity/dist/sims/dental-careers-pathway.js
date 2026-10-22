import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dental Careers Pathway VR — Dental & Oral Health.
//
// The briefing station that opens the Dental Careers block: a careers evening
// in the clinic's own staff room, built as a wall of cards rather than a
// procedure, in the spirit of the flat briefing stations elsewhere in this
// catalogue — read the board, pick the card that is actually true, and leave
// with a plan you could act on this month.
//
// What the ladder is: dental assistant, expanded-function assistant where the
// state allows it, dental hygienist, dentist and then the recognised
// specialties. What each rung actually requires: a programme accredited by the
// Commission on Dental Accreditation (CODA) where one is required, DANB's
// Certified Dental Assistant components (Radiation Health and Safety,
// Infection Control, General Chairside), the state dental practice act's
// allowable-duties list and any separate state permit, the National Board
// Dental Hygiene Examination plus a state or regional clinical examination and
// state licensure for hygiene, and the Dental Admission Test, a CODA-accredited
// dental school, the Integrated National Board Dental Examination and a state
// or regional clinical examination for the DDS or DMD.
//
// Pay and hours: this station quotes no figure. The sources board sends the
// learner to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook
// for the current year and to the programme's own published outcomes, and the
// recruiting flyer on the wall is there to be caught for doing the opposite.
// Every card names the body behind it; no clause number is stated anywhere.

const DCP_ACCENT = 0xf0b86e;
const DCP_CARD = 0xf6efe2;
const DCP_BOARD = 0x243038;
const DCP_RUNG = [0x6fc9a0, 0x58b7e0, 0xc8a6e0, 0xf0b86e];

export const SIM_DENTAL_CAREERS_PATHWAY = {
  id: "dental-careers-pathway",
  index: "212",
  domain: "Dental",
  trade: "Dental careers — assistant to hygienist to dentist",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "The state dental practice act and its allowable-duties list for assistants and hygienists; DANB's Certified Dental Assistant components — Radiation Health and Safety, Infection Control and General Chairside — and the separate state radiography permit; programmes accredited by the Commission on Dental Accreditation (CODA); the National Board Dental Hygiene Examination and a state or regional clinical examination for hygiene licensure; the Dental Admission Test, a CODA-accredited dental school and the Integrated National Board Dental Examination for the DDS or DMD; the American Dental Assistants Association (ADAA) and the American Dental Hygienists' Association (ADHA) as the professions' bodies; the ADA on the dental team; the U.S. Bureau of Labor Statistics Occupational Outlook Handbook for current pay and hours; SEIU, UFCW and AFSCME clinic and public-health staff agreements; HIPAA for anything a student sees on a shadowing day",
  name: "Dental Careers Pathway",
  title: simTitle("Dental Careers Pathway"),
  tagline: "A careers evening in the staff room: the ladder from assistant to hygienist to dentist, the credential behind each rung, where the pay-and-hours facts actually come from, and how to apply this month",
  accent: DCP_ACCENT,
  accentCss: "#f0b86e",
  parSeconds: 330,
  footprint: 2.2,
  badge: { id: "plan-in-hand", name: "Plan In Hand", note: "The ladder read off the board, the credentials matched to their rungs, and a signed plan with a real next step on it" },

  game: system({
    name: "Career Ladder",
    currency: "RUNG",
    ranks: ["Visitor", "Applicant", "Dental Assisting Student", "Credentialled Assistant", "Career Ladder Certified"],
    badges: [
      { id: "ladder-read-right", name: "Ladder Read Right", note: "The entry rung and the accreditation cards both answered clean", test: AWARD.all(AWARD.stepClean("entry-rung"), AWARD.stepClean("programme-check")) },
      { id: "nothing-taken-on-trust", name: "Nothing Taken On Trust", note: "No unsafe conclusion anywhere in the evening", test: AWARD.safe },
      { id: "planned-by-measure", name: "Planned By Measure", note: "The study plan committed inside a workable band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-evening", name: "Clean Evening", note: "No corrections anywhere in the briefing", test: AWARD.clean },
      { id: "sat-the-section", name: "Sat The Section", note: "Both timed passages carried without a break", test: AWARD.unbroken },
      { id: "read-the-board", name: "Read The Board", note: "Finish inside 80% of par — you read the board rather than the cards", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dcp-pay-guarantee-placard": "That placard promises a starting wage and a guaranteed job. Nobody can guarantee either, and no programme that is honest about its outcomes tries: the only defensible numbers are the ones the Bureau of Labor Statistics publishes for the occupation in your own state, and the completion and employment figures a programme is required to publish about itself. A number with no source behind it is advertising.",
    "dcp-delegate-anything-card": "That card says an assistant may do anything the dentist delegates. No state practice act reads that way — each one lists what an assistant may do, what needs additional training or a separate permit, and what only a licensed hygienist or dentist may ever do. A dentist's willingness to delegate does not expand that list, and working outside it puts the dentist's licence and the assistant's future credential at risk together.",
    "dcp-unapproved-school-flyer": "That flyer sells a certificate over two weekends with no accreditation named. If the credential you need requires a CODA-accredited programme, a course that is not accredited buys nothing you can sit an exam with — and the money is gone. The accreditation is checkable in a public directory before a deposit is paid, which is exactly why it is worth checking first.",
    "dcp-unpermitted-exposure-card": "That card says to start taking radiographs while the permit application is still in the post. Exposing a patient to radiation is a permitted act in every state that licenses it, and doing it before the permit exists is practising outside the act — it is the single fastest way for a new assistant to end a career that had not properly started, and the office that asked for it carries the liability too.",
  },

  lateNotes: {
    "dcp-career-plan-log": "Not yet. The plan is written at the end of the evening from what you have actually checked, not filled in from the brochure at the start.",
    "dcp-application-fee": "Hold that. The fee goes last, after the programme's accreditation, the transcript and the immunisation record are all in order — a deposit paid first is the one part of an application you cannot take back.",
    "dcp-practice-exam-tablet": "Too early. A practice section is worth sitting once you know which component you are actually preparing for, and that comes off the board first.",
  },

  steps: [
    {
      id: "entry-rung", kind: "select", target: "dcp-rung-assistant",
      title: "Find where this ladder actually starts",
      cue: "Pick the rung on the pathway board that someone with a high-school diploma can reach first.",
      why: "The ladder starts at dental assisting, and that matters because it is the only rung most people can step onto without first spending years and money: depending on the state it is entered through on-the-job training or a CODA-accredited assisting programme, and DANB's Certified Dental Assistant credential is built on top of it. Every rung above this one is reached from a job, not from a standing start.",
    },
    {
      id: "programme-check", kind: "sequence", anyOrder: true,
      targets: ["dcp-coda-card", "dcp-board-approved-card", "dcp-clinical-hours-card"],
      itemNames: {
        "dcp-coda-card": "accredited by CODA", "dcp-board-approved-card": "recognised by the state dental board",
        "dcp-clinical-hours-card": "supervised clinical hours",
      },
      itemNotes: {
        "dcp-coda-card": "The Commission on Dental Accreditation publishes a searchable list of the programmes it accredits. If the credential needs one, this is the first thing to check and it is free to check.",
        "dcp-board-approved-card": "A programme also has to be recognised by the board that will licence or permit you, which is a separate question from accreditation and is answered on the board's own website.",
        "dcp-clinical-hours-card": "Supervised clinical hours on real patients are what an employer is actually buying, and a programme that cannot say how many it provides is telling you something.",
      },
      title: "Check what makes a programme worth enrolling in",
      cue: "Select the three things that decide whether a programme counts — order doesn't matter.",
      why: "The difference between a programme that leads somewhere and one that takes a deposit is checkable before you enrol: accreditation by CODA where the credential requires it, recognition by the state board that will issue your licence or permit, and a stated number of supervised clinical hours. All three are published, none of them depends on what a recruiter says, and checking them takes an evening.",
    },
    {
      id: "read-the-act", kind: "hold", target: "dcp-practice-act-binder", seconds: 6,
      title: "Read your own state's allowable-duties list",
      cue: "Open the practice act at the duties section and read the assistant's list properly.",
      why: "The single most useful document in this room is the state's own dental practice act, because it is the thing that decides what you may actually be paid to do at each rung and what needs a further permit. It is public, it is written in plain enough language, and reading it once is what turns a vague sense of scope into a list you can hold an employer to.",
      holdBreakNote: "You put it down before the duties section. The list is the part that answers the question — skimming the front of the act tells you who the board is and nothing about what you may do.",
    },
    {
      id: "scope-card", kind: "select", target: "dcp-allowable-duties-card",
      title: "Pick the statement that matches how scope actually works",
      cue: "Choose the card that describes what sets an assistant's duties.",
      why: "Scope is set by the state's act, not by the dentist's confidence in you and not by what the office next door does. Each act lists basic duties, duties that need additional training or a separate permit, and acts reserved to a licensed hygienist or dentist — and knowing which list a task is on is what protects your own future credential when someone asks you to do something you have not been trained for.",
    },
    {
      id: "radiography-credential", kind: "find", noHint: true,
      targets: ["dcp-rhs-card", "dcp-state-permit-card"],
      itemNames: { "dcp-rhs-card": "DANB's Radiation Health and Safety component", "dcp-state-permit-card": "the state's own radiography permit" },
      itemNotes: {
        "dcp-rhs-card": "One of the three components of DANB's Certified Dental Assistant credential, and the one most states point at when they decide who may expose a radiograph.",
        "dcp-state-permit-card": "A separate thing again: the permit or certificate the state itself issues. Passing the national component does not by itself make you permitted — the state has to have issued something with your name on it.",
      },
      title: "Find the two credentials behind taking a radiograph",
      cue: "Two cards on this rail have to be in your name before you expose anyone. Find them.",
      why: "Radiography is the clearest example of how two layers of credential work in this field: a national examination component that shows you know the material, and a state permit that grants you the legal right to do it. Students routinely assume the first implies the second, start exposing images on the strength of a certificate, and only find out otherwise when an inspector or a complaint arrives.",
    },
    {
      id: "step-the-ladder", kind: "turn", target: "dcp-ladder-dial",
      title: "Step the board up a rung",
      cue: "Turn the board's selector to bring the next rung's requirements up.",
      turn: { turns: 1.0, axis: "y", label: "PATHWAY BOARD" },
      why: "The board is built as a ladder because that is how the field really moves: an expanded-function assistant is an assistant who took further coursework and, in states that have the category, a further state examination or permit. Turning the selector is the point of the whole evening — seeing that the next rung is a defined list of requirements rather than a vague matter of experience.",
    },
    {
      id: "place-cda", kind: "drag", target: "dcp-cda-card",
      title: "Place the CDA credential on its own rung",
      cue: "Carry the Certified Dental Assistant card to the rung it actually belongs on.",
      why: "DANB's Certified Dental Assistant credential sits on the assisting rung, built from three components — Radiation Health and Safety, Infection Control and General Chairside Assisting — with an eligibility route through a CODA-accredited programme or through work experience. Putting it on the hygiene rung is the commonest misunderstanding in the field, and it costs people years: it is not a step toward a hygiene licence, it is a credential in its own trade.",
      drag: { to: "dcp-rung-slot-assistant", radius: 0.4, missNote: "Not that rung. The CDA is the assisting credential; hygiene is a separate licence with its own programme and its own national examination, not an upgrade to this card." },
    },
    {
      id: "hygiene-route", kind: "select", target: "dcp-nbdhe-card",
      title: "Pick what a hygiene licence actually requires",
      cue: "Choose the card that names the national examination on the hygiene route.",
      why: "Dental hygiene is a licensed profession reached through a CODA-accredited dental hygiene programme, the National Board Dental Hygiene Examination, and a state or regional clinical examination, after which the state issues the licence. The ADHA is the profession's body. None of those steps can be substituted by years spent assisting, which is worth knowing before someone spends five of them expecting it to count.",
    },
    {
      id: "study-plan", kind: "gauge", target: "dcp-study-planner",
      title: "Set a study plan you can actually keep",
      cue: "Dial the weekly hours against the programme's published schedule and commit inside the band.",
      gauge: {
        label: "STUDY HOURS / WEEK", speed: 0.6, green: [0.38, 0.6],
        readout: (t) => `${Math.round(4 + t * 22)} h — ${t < 0.38 ? "under the programme's own guidance" : t > 0.6 ? "not survivable beside a job" : "workable"}`,
        missNote: "That plan will not hold. Too few hours and the clinical components arrive faster than the theory behind them; too many, beside a full-time job, and it collapses in week five — which is when most people who leave a programme leave it.",
      },
      why: "The commonest reason people fall off this ladder is not ability, it is arithmetic: a programme's own published contact and study hours set against the shifts someone is already working. Planning that honestly at the start, against the schedule the programme publishes rather than a guess, is what makes the difference between finishing and withdrawing in the second term.",
    },
    {
      id: "dentist-route", kind: "select", target: "dcp-dat-card",
      title: "Pick the first gate on the route to dentist",
      cue: "Choose the card that names the admission test for dental school.",
      why: "The dentist's route runs through pre-dental coursework, the Dental Admission Test, four years at a CODA-accredited dental school for a DDS or DMD, the Integrated National Board Dental Examination and a state or regional clinical examination, with a residency on top for any of the recognised specialties. It is long, and it is also reachable from the chair: assistants and hygienists go this way, and the clinical years are easier for having done it.",
    },
    {
      id: "practice-section", kind: "track", target: "dcp-practice-exam-tablet", seconds: 7,
      title: "Sit a timed practice section",
      cue: "Work the practice section and keep your pace inside the band for the whole run.",
      why: "A timed component is a pacing skill as much as a knowledge one, and pacing is trainable. Too fast is guessing — the questions that look obvious in a component blueprint are the ones written to be — and too slow means arriving at the last block with the clock gone. Learning where the band is on a practice section costs nothing; learning it in the examination hall costs the fee and the wait.",
      track: {
        start: 0.16, green: [0.38, 0.6], rise: 0.5, fall: 0.44, drift: 0.13, label: "PACE",
        readout: (v) => (v < 0.38 ? "falling behind the clock" : v > 0.6 ? "rushing — you are guessing" : "on pace"),
      },
      holdBreakNote: "The pace broke. Settle back into the band — a component is finished at a steady rate, not in bursts with a panic at the end.",
    },
    {
      id: "claims-audit", kind: "find", noHint: true,
      targets: ["dcp-flyer-pay-claim", "dcp-flyer-seat-claim"],
      itemNames: { "dcp-flyer-pay-claim": "the wage claim", "dcp-flyer-seat-claim": "the guaranteed-placement claim" },
      itemNotes: {
        "dcp-flyer-pay-claim": "A wage with no source. The checkable version is the Bureau of Labor Statistics Occupational Outlook Handbook entry for dental assistants or hygienists in your own state, read for the current year — which is a range, not a promise, and differs enormously between states.",
        "dcp-flyer-seat-claim": "A guaranteed job. No programme can promise that; what an honest one publishes is its own completion and employment rates, and you are entitled to ask for them before you pay anything.",
      },
      title: "Find the two claims on this flyer that nothing backs",
      cue: "Two lines on the recruiting flyer cannot be sourced to anybody. Find them.",
      why: "The money in this field is real and so is the demand, but the numbers on a recruiting flyer are marketing until somebody names where they came from. Wages come from the Bureau of Labor Statistics for your own state and year; outcomes come from the programme's own published completion and employment figures. Learning to ask which of the two a number is, is the most transferable skill in this whole station.",
    },
    {
      id: "application-order", kind: "sequence",
      targets: ["dcp-transcript-folder", "dcp-immunisation-record", "dcp-application-fee"],
      itemNames: { "dcp-transcript-folder": "transcripts requested", "dcp-immunisation-record": "immunisation record", "dcp-application-fee": "fee and deadline" },
      outOfOrderNote: "Out of order. Transcripts take weeks to arrive and the immunisation record takes a clinic appointment; the fee and the deadline come last, once the parts that depend on other people are already moving. Reset and take them in that order.",
      title: "Put the application together in the order that works",
      cue: "Request the transcripts, get the immunisation record, then pay the fee against the deadline.",
      why: "Applications fail on logistics far more often than on grades. Transcripts have to be requested from an institution that will take its own time; an immunisation and tuberculosis record needs a clinic appointment, and every clinical programme requires one before placement. The fee is last because it is the only irreversible step, and paying it before the slow parts are moving is how people lose a cycle.",
    },
    {
      id: "shadow-checkin", kind: "select", target: "dcp-lead-assistant",
      title: "Check in with the clinic's lead assistant about shadowing days",
      cue: "Ask the lead assistant for shadowing days, and agree what you may and may not see.",
      why: "A shadowing day is the cheapest way to find out whether you want this work, and it is arranged with the person who runs the chairside team rather than through a form. It also comes with a condition worth hearing out loud: everything you see about a patient is protected under HIPAA, and a student in the room is bound by that exactly as the staff are — which is itself the first lesson of the job.",
    },
    {
      id: "career-plan", kind: "select", target: "dcp-career-plan-log",
      title: "Sign the career-pathway card and take it with you",
      cue: "Fill in the rung you are aiming at, the credential it needs, the programme you checked, and the date of your next step.",
      why: "The card is the whole point of the evening: one rung named, the credential that rung actually requires, the accredited programme you verified yourself, where you will read the current pay and hours, and a dated next action — a transcript request, a clinic appointment, a shadowing day. A plan with a date on it is the difference between a careers talk and a career, and the clinic keeps a copy so somebody asks you about it.",
    },
  ],

  interrupts: [
    {
      id: "dcp-wrong-scope-advice",
      kind: "Scope question",
      after: "read-the-act", delay: 3, seconds: 12,
      alert: "An assistant across the room says her dentist showed her how to place and finish a filling, so she is allowed to do it.",
      cue: "Do not settle this from the room — settle it from the board that issues the credential.",
      target: "dcp-board-enquiry-phone",
      why: "Whether a duty is allowable is a question for the state dental board, and every board runs a line or an enquiry form for exactly this. Being shown how to do something is training, not authorisation: if the duty is not on the assistant's list, or needs a permit she does not hold, then both she and the dentist are exposed — and the only source that settles it is the board itself.",
      missNote: "The advice went unchallenged and the room took it as fact. Half the people here will repeat it in their first job, and the one who acts on it risks a complaint that follows her through every licence application she ever makes — over a duty she could have checked with one call.",
      wrongNote: "It is the board's enquiry line. A duty is allowable because the act says so and the board confirms it, not because somebody was shown how.",
    },
    {
      id: "dcp-unaccredited-pitch",
      kind: "Recruiting pitch",
      after: "practice-section", delay: 3, seconds: 12,
      alert: "A recruiter at the next table is telling a student she can skip the accredited programme because the office will train her on the job.",
      cue: "Look the programme up in the accreditation directory before anyone signs anything.",
      target: "dcp-coda-directory-kiosk",
      why: "Some states do allow on-the-job entry to assisting, and some credentials and every hygiene licence require a CODA-accredited programme — so the answer is not an opinion, it is a lookup. The directory is public and searchable, and checking it in front of the student is worth more than any argument about what a recruiter meant.",
      missNote: "The student signed up and paid a deposit for a course with no accreditation behind it. She will discover what it is worth when she applies to sit the examination it was supposed to prepare her for, by which time the money is gone and a year with it.",
      wrongNote: "It is the accreditation directory. Whether a programme counts is a matter of public record, and it takes a minute to look up.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, DCP_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#c9cbc4", base2: "#bfc2bb", seam: "rgba(0,0,0,0.10)",
    }), { repeat: 4, px: 256 });
    const tableTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#f0eadd", base2: "#e6dfd0", seam: "rgba(0,0,0,0.06)",
    }), { repeat: 3, px: 256 });

    const floorPlate = slab(g, 5.4, 0.008, 5.4, 0, 0.002, 0, 0xc9cbc4, { radius: 0.05, cast: false });
    floorPlate.material = texturedMat(floorTex, { rough: 0.74, metal: 0.04, color: 0xd2d4cd });

    // ------------------------------------------------------- the pathway board
    // Four rungs up a wall board, each a card of its own with the credential
    // it requires printed on it.
    const board = group(g, 0, 0, -2.45);
    slab(board, 3.0, 2.1, 0.09, 0, 1.3, 0, DCP_BOARD, { radius: 0.03, rough: 0.6 });
    decal(board, 1.5, 0.16, 0, 2.2, 0.05, signFace("THE LADDER — WHAT EACH RUNG NEEDS", { bg: "#16202a", accent: "#f0b86e", scale: 0.34 }), { px: 512 });
    // The ladder's own stringers and treads, so the board reads as a ladder.
    for (const sx of [-1, 1]) box(board, 0.05, 1.7, 0.03, sx * 1.28, 1.25, 0.055, DCP_ACCENT, { emissive: DCP_ACCENT, ei: 0.35, rough: 0.5, cast: false });

    const RUNGS = [
      ["dcp-rung-assistant", 0.55, "1 · DENTAL ASSISTANT", ["On-the-job or CODA programme", "DANB CDA: RHS · ICE · GC"], DCP_RUNG[0]],
      ["dcp-rung-efda", 1.03, "2 · EXPANDED FUNCTION", ["Further coursework", "State exam or permit"], DCP_RUNG[1]],
      ["dcp-rung-hygienist", 1.51, "3 · DENTAL HYGIENIST", ["CODA hygiene programme", "NBDHE + clinical exam + licence"], DCP_RUNG[2]],
      ["dcp-rung-dentist", 1.99, "4 · DENTIST / SPECIALIST", ["DAT · CODA dental school", "INBDE + clinical exam + residency"], DCP_RUNG[3]],
    ];
    const rungCards = {};
    for (const [id, y, label, rows, colour] of RUNGS) {
      const rung = group(board, 0, y, 0.06);
      const plate = slab(rung, 2.3, 0.4, 0.03, 0, 0, 0, DCP_CARD, { radius: 0.02, rough: 0.55 });
      ownMaterial(plate);
      // Two faces rather than one: the rung's name in large sign type, so it
      // is readable from where the learner arrives, and the requirements
      // underneath it in printed rows for when they walk up to the board.
      const face = decal(rung, 2.16, 0.17, 0, 0.1, 0.022,
        signFace(label, { bg: "#f6efe2", fg: "#1d262e", accent: `#${colour.toString(16).padStart(6, "0")}`, scale: 0.72 }), { px: 512 });
      decal(rung, 2.16, 0.16, 0, -0.1, 0.022, paperFace("", rows, { band: `#${colour.toString(16).padStart(6, "0")}` }), { px: 512 });
      box(rung, 0.06, 0.34, 0.02, -1.13, 0, 0.026, colour, { emissive: colour, ei: 0.5, rough: 0.5, cast: false });
      rungCards[id] = { rung, plate, face };
      reg(hits, plate, id);
    }
    holoTag(board, "pathway board", -1.0, 0.36, 0.08, { css: "#f0b86e", w: 0.42 });

    // An invisible socket on the assisting rung, so the drag has its own id.
    const rungSlot = box(rungCards["dcp-rung-assistant"].rung, 2.2, 0.3, 0.12, 0, 0, 0.09, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["dcp-rung-slot-assistant"] = rungSlot;

    // The board's own selector, which steps it up a rung.
    const dial = group(board, 1.55, 1.1, 0.06);
    cyl(dial, 0.07, 0.07, 0.04, 0, 0, 0, CITY.hiVis, { rough: 0.5, metal: 0.3, seg: 20 }).rotation.x = Math.PI / 2;
    const dialPointer = box(dial, 0.014, 0.014, 0.12, 0, 0.03, 0.03, 0x2b3138, { rough: 0.6 });
    for (let i = 0; i < 4; i++) {
      const a = -0.9 + (i / 3) * 1.8;
      box(dial, 0.008, 0.024, 0.008, Math.sin(a) * 0.095, Math.cos(a) * 0.095, 0.03, DCP_CARD, { rough: 0.5, cast: false });
    }
    holoTag(dial, "step the board", 0, 0.18, 0, { css: "#f0b86e", w: 0.4 });
    reg(hits, dial, "dcp-ladder-dial");
    void dialPointer;

    // ------------------------------------------------------- the credential rail
    // A rail of cards along the side wall, each naming a real credential.
    const rail = group(g, -2.45, 0, -0.4, 0.5);
    slab(rail, 2.6, 1.6, 0.08, 0, 1.25, 0, 0x2f3b44, { radius: 0.03, rough: 0.6 });
    decal(rail, 1.3, 0.14, 0, 2.0, 0.045, signFace("CREDENTIALS — NAMED BODIES", { bg: "#1b242b", accent: "#f0b86e", scale: 0.32 }), { px: 448 });
    cyl(rail, 0.018, 0.018, 2.5, 0, 1.95, 0.07, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2;

    const CARDS = [
      ["dcp-coda-card", -1.0, 1.55, "CODA", ["Commission on Dental", "Accreditation — public directory"], 0x6fc9a0],
      ["dcp-board-approved-card", 0.0, 1.55, "STATE BOARD", ["Recognises the programme", "Issues the licence or permit"], 0x58b7e0],
      ["dcp-clinical-hours-card", 1.0, 1.55, "CLINICAL HOURS", ["Supervised, on real patients", "Published by the programme"], 0xc8a6e0],
      ["dcp-rhs-card", -1.0, 1.0, "DANB RHS", ["Radiation Health + Safety", "One CDA component"], 0xf0b86e],
      ["dcp-state-permit-card", 0.0, 1.0, "STATE PERMIT", ["Radiography permit", "Issued in your name"], 0xf0b86e],
      ["dcp-nbdhe-card", 1.0, 1.0, "NBDHE", ["National Board Dental", "Hygiene Examination"], 0xc8a6e0],
      ["dcp-cda-card", -1.0, 0.45, "DANB CDA", ["RHS · ICE · General Chairside", "The assisting credential"], 0x6fc9a0],
      ["dcp-dat-card", 0.0, 0.45, "DAT", ["Dental Admission Test", "First gate to dental school"], 0xe8a13c],
      ["dcp-allowable-duties-card", 1.0, 0.45, "ALLOWABLE DUTIES", ["Set by the state act", "Not by delegation"], 0x58b7e0],
    ];
    const cardObjs = {};
    for (const [id, x, y, label, rows, colour] of CARDS) {
      const card = group(rail, x, y, 0.06);
      const plate = slab(card, 0.82, 0.42, 0.02, 0, 0, 0, DCP_CARD, { radius: 0.02, rough: 0.55 });
      ownMaterial(plate);
      decal(card, 0.76, 0.36, 0, 0, 0.016, paperFace(label, rows, { band: `#${colour.toString(16).padStart(6, "0")}` }), { px: 320 });
      box(card, 0.03, 0.36, 0.014, -0.4, 0, 0.018, colour, { emissive: colour, ei: 0.45, rough: 0.5, cast: false });
      cardObjs[id] = card;
      reg(hits, plate, id);
    }

    // The two decoy cards, on the same rail so they read as part of the set.
    const delegateCard = group(rail, -0.55, -0.1, 0.06);
    slab(delegateCard, 0.82, 0.36, 0.02, 0, 0, 0, 0xf2dcd6, { radius: 0.02, rough: 0.55 });
    decal(delegateCard, 0.76, 0.3, 0, 0, 0.016, paperFace("ANYTHING DELEGATED", ["\"If the dentist shows you,", "you may do it\""], { band: "#c0392b" }), { px: 320 });
    holoTag(delegateCard, "not how scope works", 0, 0.26, 0.02, { css: "#f0645b", w: 0.5 });
    reg(hits, delegateCard, "dcp-delegate-anything-card");

    const permitCard = group(rail, 0.55, -0.1, 0.06);
    slab(permitCard, 0.82, 0.36, 0.02, 0, 0, 0, 0xf2dcd6, { radius: 0.02, rough: 0.55 });
    decal(permitCard, 0.76, 0.3, 0, 0, 0.016, paperFace("START NOW", ["\"Expose while the permit", "application is in the post\""], { band: "#c0392b" }), { px: 320 });
    holoTag(permitCard, "practising outside the act", 0, 0.26, 0.02, { css: "#f0645b", w: 0.58 });
    reg(hits, permitCard, "dcp-unpermitted-exposure-card");

    // ------------------------------------------------------------- the sources board
    const sources = holoPanel(g, 0.9, 0.62, 2.4, 1.6, -1.35, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,18,24,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f0b86e"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffe0b4";
      ctx.font = `600 ${Math.round(h * 0.095)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SOURCES — CHECK THEM YOURSELF", w * 0.05, h * 0.11);
      ctx.fillStyle = "#f7efe2";
      ctx.font = `${Math.round(h * 0.068)}px Arial, sans-serif`;
      [
        "CODA — accredited programme directory",
        "DANB — CDA components: RHS, ICE, General Chairside",
        "Your state dental board — practice act + permits",
        "ADHA (hygiene) · ADAA (assisting) · ADA (the team)",
        "NBDHE, DAT and INBDE — the examination bodies",
        "BLS Occupational Outlook Handbook — pay + hours, current year",
        "SEIU / UFCW / AFSCME — clinic and public-health staff",
      ].forEach((line, i) => ctx.fillText(line, w * 0.05, h * (0.25 + i * 0.105)));
    }, { accent: DCP_ACCENT });
    void sources;

    // The pay-and-hours board: no number on it, on purpose.
    const payBoard = group(g, 2.45, 0, 0.1, -1.0);
    slab(payBoard, 1.1, 0.7, 0.06, 0, 1.4, 0, 0x2f3b44, { radius: 0.02, rough: 0.6 });
    decal(payBoard, 1.0, 0.6, 0, 1.4, 0.035,
      paperFace("PAY + HOURS", ["This board quotes no figure.", "Read the BLS Occupational Outlook", "Handbook for your own state,", "current year. Ask a programme for", "its published completion and", "employment rates."], { band: "#f0b86e" }), { px: 448 });
    holoTag(payBoard, "sourced, or not stated", 0, 1.82, 0, { css: "#f0b86e", w: 0.52 });

    // The recruiting flyer, with the two unsourced claims as separate cards.
    const flyer = group(g, 2.45, 0, 1.15, -1.3);
    slab(flyer, 0.8, 1.0, 0.04, 0, 1.3, 0, 0xf6f0e2, { radius: 0.02, rough: 0.7 });
    decal(flyer, 0.72, 0.24, 0, 1.68, 0.025, signFace("DENTAL CAREERS NOW!", { bg: "#f6f0e2", accent: "#c0392b", scale: 0.34 }), { px: 320 });
    const payClaim = group(flyer, 0, 1.36, 0.03);
    slab(payClaim, 0.66, 0.2, 0.02, 0, 0, 0, 0xffe9d8, { radius: 0.01, rough: 0.6 });
    decal(payClaim, 0.62, 0.16, 0, 0, 0.014, signFace("\"TOP WAGES FROM DAY ONE\"", { bg: "#ffe9d8", accent: "#a33", scale: 0.26 }), { px: 320 });
    holoTag(payClaim, "no source", 0, 0.18, 0.02, { css: "#f0645b", w: 0.28 });
    reg(hits, payClaim, "dcp-flyer-pay-claim");

    const seatClaim = group(flyer, 0, 1.08, 0.03);
    slab(seatClaim, 0.66, 0.2, 0.02, 0, 0, 0, 0xffe9d8, { radius: 0.01, rough: 0.6 });
    decal(seatClaim, 0.62, 0.16, 0, 0, 0.014, signFace("\"A JOB GUARANTEED\"", { bg: "#ffe9d8", accent: "#a33", scale: 0.28 }), { px: 320 });
    holoTag(seatClaim, "nobody can promise this", 0, 0.18, 0.02, { css: "#f0645b", w: 0.54 });
    reg(hits, seatClaim, "dcp-flyer-seat-claim");

    // The guarantee placard and the unaccredited-course flyer — the other hazards.
    const placard = group(g, 1.75, 0, 2.15, -0.5);
    cyl(placard, 0.16, 0.18, 0.04, 0, 0.02, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 16 });
    cyl(placard, 0.022, 0.022, 1.2, 0, 0.6, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    slab(placard, 0.5, 0.36, 0.03, 0, 1.36, 0, 0xf8dcd2, { radius: 0.02, rough: 0.6 });
    decal(placard, 0.46, 0.3, 0, 1.36, 0.02, paperFace("GUARANTEED", ["Starting wage promised", "Placement promised"], { band: "#c0392b" }), { px: 288 });
    holoTag(placard, "guaranteed nothing", 0, 1.62, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, placard, "dcp-pay-guarantee-placard");

    const schoolFlyer = group(g, -2.6, 0, 1.6, 0.9);
    slab(schoolFlyer, 0.6, 0.8, 0.03, 0, 1.3, 0, 0xf6e4d8, { radius: 0.02, rough: 0.65 });
    decal(schoolFlyer, 0.54, 0.7, 0, 1.3, 0.02,
      paperFace("CERTIFIED IN 2 WEEKENDS", ["No accreditation named", "Deposit today", "\"Employers love us\""], { band: "#c0392b" }), { px: 320 });
    for (const sx of [-1, 1]) cyl(schoolFlyer, 0.02, 0.02, 0.9, sx * 0.24, 0.45, 0, 0x6f7a83, { rough: 0.5, metal: 0.4, seg: 8 });
    holoTag(schoolFlyer, "no accreditation named", 0, 1.78, 0, { css: "#f0645b", w: 0.56 });
    reg(hits, schoolFlyer, "dcp-unapproved-school-flyer");

    // ---------------------------------------------------------------- the table
    const table = group(g, 0.1, 0, 0.55, 0.15);
    const tableTop = slab(table, 1.7, 0.05, 0.9, 0, 0.75, 0, 0xf0eadd, { radius: 0.02, rough: 0.5 });
    tableTop.material = texturedMat(tableTex, { rough: 0.5, metal: 0.04, color: 0xf2ece0 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(table, 0.03, 0.03, 0.73, sx * 0.76, 0.365, sz * 0.38, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    }
    slab(table, 1.5, 0.03, 0.7, 0, 0.24, 0, 0xd8d2c4, { radius: 0.01, rough: 0.6 });

    // The practice act binder, open on the table.
    const binder = group(table, -0.55, 0.78, 0.02, 0.2);
    box(binder, 0.34, 0.05, 0.26, 0, 0.025, 0, 0x3a5f6f, { rough: 0.6 });
    const binderLeft = decal(binder, 0.16, 0.22, -0.09, 0.052, 0,
      paperFace("PRACTICE ACT", ["Definitions", "The board"], { band: "#3a5f6f" }), { px: 224 });
    binderLeft.rotation.x = -Math.PI / 2;
    const binderRight = decal(binder, 0.16, 0.22, 0.09, 0.052, 0,
      paperFace("ALLOWABLE DUTIES", ["Basic duties", "Needs permit", "Reserved acts"], { band: "#f0b86e" }), { px: 224 });
    binderRight.rotation.x = -Math.PI / 2;
    holoTag(binder, "practice act — duties", 0, 0.2, 0, { css: "#f0b86e", w: 0.52 });
    reg(hits, binder, "dcp-practice-act-binder");

    // The study planner and the practice-exam tablet.
    const planner = group(table, -0.1, 0.78, -0.22, -0.15);
    box(planner, 0.2, 0.03, 0.14, 0, 0.015, 0, 0x3a4048, { rough: 0.5, metal: 0.25 });
    const plannerDial = cyl(planner, 0.05, 0.05, 0.02, 0, 0.04, 0, CITY.hiVis, { rough: 0.5, metal: 0.3, seg: 18 });
    const plannerFace = decal(planner, 0.16, 0.05, 0, 0.032, 0.05, signFace("-- h / WEEK", { bg: "#141c22", accent: "#ffe0b4", scale: 0.4 }), { px: 224 });
    plannerFace.rotation.x = -Math.PI / 2;
    holoTag(planner, "study planner", 0, 0.14, 0, { css: "#f0b86e", w: 0.38 });
    reg(hits, planner, "dcp-study-planner");
    void plannerDial;

    const tablet = group(table, 0.3, 0.78, -0.12, 0.25);
    slab(tablet, 0.26, 0.015, 0.19, 0, 0, 0, 0x22282d, { radius: 0.012, rough: 0.35, metal: 0.3 });
    const tabletFace = decal(tablet, 0.22, 0.16, 0, 0.01, 0, signFace("PRACTICE SECTION", { bg: "#0f161b", accent: "#9fd8f7", scale: 0.3 }), { px: 288 });
    tabletFace.rotation.x = -Math.PI / 2;
    const tabletBezel = box(tablet, 0.28, 0.008, 0.21, 0, -0.006, 0, 0x3a4048, { rough: 0.5, metal: 0.4 });
    holoTag(tablet, "timed practice section", 0, 0.14, 0, { css: "#f0b86e", w: 0.52 });
    reg(hits, tablet, "dcp-practice-exam-tablet");
    void tabletBezel;

    // The application papers, in the order they have to be done.
    const APPS = [
      ["dcp-transcript-folder", 0.62, 0.3, "TRANSCRIPTS", ["Request early", "Weeks to arrive"], 0x6fc9a0],
      ["dcp-immunisation-record", 0.62, 0.05, "IMMUNISATION", ["Clinic appointment", "Required for placement"], 0x58b7e0],
      ["dcp-application-fee", 0.62, -0.2, "FEE + DEADLINE", ["Last step", "The only one you cannot undo"], 0xe8a13c],
    ];
    for (const [id, x, z, label, rows, colour] of APPS) {
      const paper = group(table, x, 0.78, z, -0.1);
      slab(paper, 0.2, 0.004, 0.15, 0, 0, 0, 0xfdf9ef, { radius: 0.004, rough: 0.8 });
      const face = decal(paper, 0.18, 0.13, 0, 0.005, 0, paperFace(label, rows, { band: `#${colour.toString(16).padStart(6, "0")}` }), { px: 224 });
      face.rotation.x = -Math.PI / 2;
      holoTag(paper, label, 0, 0.1, 0, { css: "#f0b86e", w: 0.34 });
      reg(hits, paper, id);
    }

    // The career-pathway card the evening ends on.
    const planCard = group(table, 0.1, 0.78, 0.34, 0.05);
    slab(planCard, 0.32, 0.006, 0.22, 0, 0, 0, 0xfff6e4, { radius: 0.006, rough: 0.75 });
    const planFace = decal(planCard, 0.3, 0.2, 0, 0.007, 0,
      paperFace("CAREER PATHWAY CARD", ["Rung: ______", "Credential: ______", "Programme checked: ______", "Next step + date: ______"], { band: "#f0b86e" }), { px: 384 });
    planFace.rotation.x = -Math.PI / 2;
    cyl(planCard, 0.006, 0.006, 0.13, 0.13, 0.012, 0.04, 0x2b3138, { rough: 0.5, seg: 8 }).rotation.z = 1.0;
    holoTag(planCard, "career pathway card", 0, 0.14, 0, { css: "#f0b86e", w: 0.5 });
    reg(hits, planCard, "dcp-career-plan-log");

    // Chairs round the table, so the room reads as a careers evening.
    for (const [cx, cz, ry] of [[-0.9, 0.9, 0.5], [1.1, 0.95, -0.6], [-0.7, -0.15, 1.4]]) {
      const chair = group(g, cx, 0, cz, ry);
      slab(chair, 0.4, 0.05, 0.38, 0, 0.44, 0, 0x3f5a63, { radius: 0.03, rough: 0.7 });
      slab(chair, 0.38, 0.4, 0.05, 0, 0.66, -0.17, 0x3f5a63, { radius: 0.03, rough: 0.7 });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        cyl(chair, 0.016, 0.016, 0.42, sx * 0.16, 0.21, sz * 0.15, CITY.darkSteel, { rough: 0.4, metal: 0.65, seg: 8 });
      }
    }

    // ------------------------------------------------- the board's enquiry line
    const phone = group(g, -2.35, 0, 1.35, 0.8);
    box(phone, 0.14, 0.24, 0.05, 0, 1.3, 0, 0xe4e0d4, { rough: 0.6 });
    const handset = box(phone, 0.05, 0.16, 0.05, 0.0, 1.36, 0.05, 0x2b3138, { rough: 0.5 });
    ownMaterial(handset);
    const phoneLamp = box(phone, 0.05, 0.02, 0.02, 0, 1.19, 0.03, CITY.good, { emissive: CITY.good, ei: 0.3, rough: 0.4, cast: false });
    ownMaterial(phoneLamp);
    decal(phone, 0.12, 0.05, 0, 1.13, 0.03, signFace("BOARD ENQUIRIES", { bg: "#3a352a", accent: "#ffe0b4", scale: 0.26 }), { px: 192 });
    holoTag(phone, "state board enquiry line", 0, 1.5, 0, { css: "#f0b86e", w: 0.56 });
    reg(hits, phone, "dcp-board-enquiry-phone");

    // --------------------------------------------------- the accreditation kiosk
    const kiosk = group(g, 1.55, 0, -1.55, -0.45);
    box(kiosk, 0.44, 1.0, 0.34, 0, 0.5, 0, 0x37424a, { rough: 0.55, metal: 0.2 });
    box(kiosk, 0.48, 0.06, 0.38, 0, 1.03, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const kioskScreen = group(kiosk, 0, 1.3, 0.02);
    box(kioskScreen, 0.44, 0.34, 0.04, 0, 0, 0, 0x1b242b, { rough: 0.4, metal: 0.3 });
    const kioskFace = decal(kioskScreen, 0.4, 0.3, 0, 0, 0.025,
      paperFace("ACCREDITATION LOOKUP", ["CODA directory", "Search by programme", "Public record"], { bg: "#0d151a", band: "#6fc9a0" }), { px: 320 });
    kioskScreen.rotation.x = -0.25;
    for (let i = 0; i < 12; i++) {
      box(kiosk, 0.03, 0.012, 0.025, -0.15 + (i % 6) * 0.06, 1.06, -0.05 + Math.floor(i / 6) * 0.05, 0x59616a, { rough: 0.6, cast: false });
    }
    holoTag(kiosk, "accreditation directory", 0, 1.6, 0, { css: "#6fc9a0", w: 0.56 });
    reg(hits, kiosk, "dcp-coda-directory-kiosk");

    // ------------------------------------------------------------- the people
    const leadAssistant = standingFigure(g, -1.75, 1.5, { ry: 2.2, cloth: 0x2f6f63, vest: DCP_ACCENT, skin: 0xbd8860 });
    holoTag(leadAssistant, "lead dental assistant", 0, 1.8, 0, { css: "#f0b86e", w: 0.52 });
    const leadMark = box(leadAssistant, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, leadMark, "dcp-lead-assistant");

    const hygienist = standingFigure(g, -2.3, 2.5, { ry: 2.5, cloth: 0x5a4a7c, skin: 0x855637 });
    holoTag(hygienist, "hygienist — rung three", 0, 1.78, 0, { css: "#c8a6e0", w: 0.52 });

    const recruiter = standingFigure(g, 2.6, 2.0, { ry: -2.2, cloth: 0x7a4a3c, skin: 0xe3bd9b });
    holoTag(recruiter, "the recruiter", 0, 1.78, 0, { css: "#f0645b", w: 0.38 });

    // Ceiling fittings.
    for (let i = -1; i <= 1; i += 2) {
      box(g, 1.2, 0.06, 0.34, i * 1.15, 2.62, 0.2, 0xe8edf0, { rough: 0.4, cast: false });
      box(g, 1.08, 0.02, 0.26, i * 1.15, 2.585, 0.2, 0xfff6e6, { emissive: 0xfff6e6, ei: 0.5, rough: 0.4, cast: false });
    }

    const key = new THREE.DirectionalLight(0xfff2de, 0.85);
    key.position.set(-2.2, 4.6, 2.8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xfff8ec, 0x60625a, 0.9));

    const sparkle = particles(g, 18, 0xffe0b4, { size: 0.012, life: 0.7, additive: false, opacity: 0.4 });
    sparkle.visible = false;
    let sitting = false, lit = 0;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.3, -2.2),

      onStep(step) { sitting = step.id === "practice-section"; },

      onStepComplete(step) {
        if (step.id === "entry-rung") {
          rungCards["dcp-rung-assistant"].plate.material.emissive.set(DCP_RUNG[0]);
          rungCards["dcp-rung-assistant"].plate.material.emissiveIntensity = 0.6;
        }
        if (step.id === "scope-card") delegateCard.visible = false;
        if (step.id === "radiography-credential") permitCard.visible = false;
        if (step.id === "step-the-ladder") {
          lit = 1;
          rungCards["dcp-rung-efda"].plate.material.emissive.set(DCP_RUNG[1]);
          rungCards["dcp-rung-efda"].plate.material.emissiveIntensity = 0.6;
        }
        if (step.id === "place-cda") {
          const card = cardObjs["dcp-cda-card"];
          card.parent.remove(card);
          rungCards["dcp-rung-assistant"].rung.add(card);
          card.position.set(0.7, 0, 0.06);
          card.rotation.set(0, 0, 0);
        }
        if (step.id === "hygiene-route") {
          rungCards["dcp-rung-hygienist"].plate.material.emissive.set(DCP_RUNG[2]);
          rungCards["dcp-rung-hygienist"].plate.material.emissiveIntensity = 0.6;
        }
        if (step.id === "dentist-route") {
          rungCards["dcp-rung-dentist"].plate.material.emissive.set(DCP_RUNG[3]);
          rungCards["dcp-rung-dentist"].plate.material.emissiveIntensity = 0.6;
        }
        if (step.id === "claims-audit") { payClaim.visible = false; seatClaim.visible = false; }
        if (step.id === "shadow-checkin") leadAssistant.rotation.y = 1.4;
        if (step.id === "career-plan") {
          repaint(planFace, paperFace("CAREER PATHWAY CARD", ["Rung: dental assistant", "Credential: DANB CDA (RHS/ICE/GC)", "Programme: CODA-listed, verified", "Next step: transcripts + shadow day"], { band: "#6fc9a0" }));
          sparkle.visible = true;
        }
      },

      onInterrupt(it) {
        if (it.id === "dcp-wrong-scope-advice") {
          delegateCard.visible = true;
          delegateCard.position.set(-0.55, 0.16, 0.12);
          handset.material.emissive.set(CITY.alert);
          handset.material.emissiveIntensity = 1.2;
          phoneLamp.material.emissiveIntensity = 1.4;
        }
        if (it.id === "dcp-unaccredited-pitch") {
          schoolFlyer.visible = true;
          schoolFlyer.position.set(-1.9, 0, 1.6);
          kioskFace.material.emissiveIntensity = 1.5;
          recruiter.rotation.y = -1.6;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "dcp-wrong-scope-advice") {
          // The card stays on the rail — it is still the decoy the scope step
          // has to be answered against. It just stops being lit up.
          delegateCard.position.set(-0.55, -0.1, 0.06);
          handset.material.emissiveIntensity = 0.0;
          phoneLamp.material.emissiveIntensity = 0.3;
        }
        if (it.id === "dcp-unaccredited-pitch") {
          schoolFlyer.position.set(-2.6, 0, 1.6);
          repaint(kioskFace, paperFace("ACCREDITATION LOOKUP", ["NOT IN THE DIRECTORY", "No CODA accreditation", "Do not pay a deposit"], { bg: "#1b0d0d", band: "#c0392b" }));
          recruiter.rotation.y = -2.4;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        for (const [i, [id]] of RUNGS.entries()) {
          const card = rungCards[id];
          if (i === lit) card.plate.material.emissiveIntensity = 0.45 + Math.sin(t * 2.2) * 0.2;
        }
        if (sparkle.visible) sparkle.userData.step(dt, new THREE.Vector3(0.2, 0.85, 0.89), 0.14, 0.3, 0.5);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "study-plan") {
          const ok = gg.t >= 0.38 && gg.t <= 0.6;
          repaint(plannerFace, signFace(`${Math.round(4 + gg.t * 22)} h / WEEK`, {
            bg: "#141c22", accent: ok ? "#9fe8c0" : "#f0645b", scale: 0.36,
          }));
        }
        const tr = session?.track;
        if (sitting && tr) {
          const ok = tr.v >= 0.38 && tr.v <= 0.6;
          repaint(tabletFace, signFace(ok ? "ON PACE" : tr.v < 0.38 ? "BEHIND" : "RUSHING", {
            bg: "#0f161b", accent: ok ? "#9fd8f7" : "#f0645b", scale: 0.34,
          }));
        }
      },
    };
  },
};
