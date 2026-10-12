import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, seatedFigure, ownMaterial, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { eiLine } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Oral Hygiene Instruction & Motivational Interviewing VR —
// Dental & Oral Health.
//
// A hygiene recall with a patient whose gums bleed, who works nights, who has
// type 2 diabetes and who has been told to floss by every clinician he has
// ever met. The station is the conversation that finally changes something:
// sat at eye level rather than over him, permission asked before advice, his
// own account heard to the end, one piece of information offered and his
// response asked for, his own reasons for change noticed, technique shown on
// a model rather than lectured at him, and one small goal he chose written on
// a card in his words.
//
// The guide's emotional-intelligence lines (shared/ei-guide.js) speak when
// the learner reaches for the lecture, the scare or the scaler as a pointer.
// Motivational interviewing is described here generically, as it is commonly
// taught in dental hygiene programmes; no author or course is named. The
// Unspoken Smiles programme is named only as the programme this platform is
// built for.

const OHI_ACCENT = 0x7fd1a0;
const OHI_CSS = "#7fd1a0";
const OHI_ALERT = "#f0645b";

export const SIM_DN_ORAL_HYGIENE_INSTRUCTION_AND_MOTIVATIONAL_INTERVIEWING = {
  id: "dn-oral-hygiene-instruction-and-motivational-interviewing",
  index: "321",
  domain: "Dental",
  trade: "Dental hygienist — patient education and motivational interviewing (RDH), SEIU and UFCW clinic and dental staff, AFSCME public-health hygienists",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "The ADHA's standards for clinical dental hygiene practice, which put patient education and a care plan the patient agrees to at the centre of hygiene care; the state dental board's practice act for the hygienist's scope; the ADA's guidance on home care and the ADA's CDT code set under which the dentist's office records oral hygiene instruction; the CDC's dental infection-control guidelines on keeping aerosol-generating procedures to those actually needed; OSHA 29 CFR 1910.1030 for a scaler, which is a sharp and never a pointer; HIPAA's privacy rule for intraoral photographs; SEIU, UFCW and AFSCME clinic and public-health dental staff; Unspoken Smiles, the programme this platform is built for",
  name: "Oral Hygiene Instruction & Motivational Interviewing",
  title: simTitle("Oral Hygiene Instruction & Motivational Interviewing"),
  tagline: "The flossing talk that finally works: at eye level, permission first, his story heard to the end, his own reasons noticed, technique shown on a model, and one small goal he chose — in his words",
  accent: OHI_ACCENT,
  accentCss: OHI_CSS,
  parSeconds: 320,
  footprint: 2.3,
  badge: { id: "his-goal", name: "His Goal", note: "A home-care goal the patient chose himself, written in his words, reached without a single lecture" },
  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your clinic's employee assistance line, or the hygiene colleague you debrief with — patients who have heard it all before are hard work, and so is staying patient with them",

  game: system({
    name: "Change Talk",
    currency: "TALK",
    ranks: ["Hygiene Student", "Hygiene Educator", "Motivational Clinician", "Hygiene Lead", "Change Talk Certified"],
    badges: [
      { id: "permission-first", name: "Permission First", note: "The opening worked in order: permission, an open question, an affirmation", test: AWARD.stepClean("ohi-opening") },
      { id: "no-lecture", name: "No Lecture", note: "No unsafe action anywhere in the visit", test: AWARD.safe },
      { id: "stayed-with-him", name: "Stayed With Him", note: "Both listening holds and the goal-setting carried without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-visit", name: "Clean Visit", note: "No corrections anywhere in the visit", test: AWARD.clean },
      { id: "one-small-piece", name: "One Small Piece", note: "The information dose set near the middle of its band", test: AWARD.precise(0.72) },
      { id: "on-schedule", name: "On Schedule", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "ohi-scare-script": "That is the scare script: 'if you don't floss you'll lose your teeth, and with your diabetes it'll be sooner.' He has heard it before, and people who feel lectured argue back or go quiet — then change nothing. Confrontation reliably produces resistance; the facts are shared only after asking, in small pieces, and his response decides what comes next.",
    "ohi-scaler-pointer": "That is the sickle scaler, picked up to point at the bleeding gum on the photograph and then at his mouth. A scaler is a sharp under 29 CFR 1910.1030, and waving one near a face during a conversation is how somebody gets a cut lip or a needlestick-type injury for no clinical reason — point with a finger at the screen, or a mirror at the model.",
    "ohi-air-polisher": "That is the air polisher, suggested 'to show him how clean it could be.' It is an aerosol-generating procedure, and the CDC's dental infection-control guidelines expect those kept to what is clinically needed, with the precautions that go with them. A demonstration is not a clinical need; the model and a soft brush show him everything an aerosol would, without filling the room with it.",
    "ohi-corridor-screen": "That is the second monitor that faces the corridor, and it would put his intraoral photographs, his name and his plaque score on show to everyone walking past. Photographs of a person's mouth are protected health information under HIPAA; they go on the chairside screen he and you are looking at, and nowhere else.",
  },

  lateNotes: {
    "ohi-goal-card": "The goal card is written once he has chosen a goal. There is nothing to write yet — his words come first.",
    "ohi-team-checkin": "The check-in comes at the end of the visit, once there is a goal and a plan to hand over.",
    "ohi-visit-log": "The visit is not over. The log records what he chose and what was shown, at the end.",
  },

  steps: [
    {
      id: "ohi-eye-level", kind: "turn", target: "ohi-stool-dial", noRobot: false,
      turn: { turns: 1.0, axis: "y", label: "STOOL HEIGHT" },
      title: "Sit him up and bring your stool down to his eye level",
      cue: "The chair is upright; wind your stool down until your eyes are level with his.",
      why: "A patient lying back with a clinician looming over him hears every word as an instruction, however kindly it is meant. Sitting him upright and bringing yourself down to eye level turns the same words into a conversation between adults, which is the whole premise of motivational interviewing. It is a small physical act with a large effect, and learning to set the room before saying anything is the first habit of the hygienists who go on to lead community and public-health education.",
    },
    {
      id: "ohi-opening", kind: "sequence", noRobot: false,
      targets: ["ohi-prompt-permission", "ohi-prompt-open", "ohi-prompt-affirm"],
      itemNames: {
        "ohi-prompt-permission": "'Would it be OK if we talked about your gums?'",
        "ohi-prompt-open": "'What have you noticed about them lately?'",
        "ohi-prompt-affirm": "'You've clearly been paying attention to this.'",
      },
      outOfOrderNote: "Out of order. Ask permission first — without it, even a good question sounds like the start of a lecture — then the open question, and affirm what he tells you.",
      title: "Open with permission, an open question and an affirmation",
      cue: "Ask permission to talk about his gums, ask an open question, then affirm what he has already noticed.",
      why: "Motivational interviewing starts by handing some control back. Asking permission tells him this is a conversation he can decline; an open question invites his experience instead of a yes or no; an affirmation recognises something real he is already doing. Together they lower the defences that years of being told to floss have built. These openings are skills, not scripts, and they carry into every patient-facing career from hygiene to public health.",
    },
    {
      id: "ohi-listen-story", kind: "hold", target: "ohi-listen-story", seconds: 8,
      noRobot: true,
      robotNote: "Listening to a patient tell his own story is an act whose whole content is a person; it is the clinician's, never the robot's.",
      title: "Listen to his account to the end, without correcting it",
      cue: "Let him tell you about the bleeding, the night shifts and what he has tried — do not interrupt.",
      holdBreakNote: "You jumped in with advice. He had not finished — the part about brushing in the car after shifts was coming. Go back and let him talk.",
      why: "What he says in the first few uninterrupted minutes tells you more than any chart: that he works nights, brushes in a rush in the car park, has tried floss and hated it, and worries about his father's dentures. Clinicians interrupt patients within seconds as a rule, and the story stops there. Staying quiet long enough to hear the whole of it is the single most useful clinical skill in this station, and it is what makes an educator effective anywhere.",
    },
    {
      id: "ohi-plaque-find", kind: "find", noHint: true, noRobot: false,
      targets: ["ohi-plaque-lingual", "ohi-plaque-molar"],
      itemNames: { "ohi-plaque-lingual": "heavy plaque behind the lower front teeth", "ohi-plaque-molar": "plaque along the upper back molars" },
      itemNotes: {
        "ohi-plaque-lingual": "The disclosing dye has stained a thick band on the tongue side of the lower front teeth — the spot a rushed brush in the car never reaches.",
        "ohi-plaque-molar": "A stained line along the cheek side of the upper back molars, right where the gum bleeds. It is his bleeding site, and he can see it for himself.",
      },
      title: "Find the two areas on the disclosed photograph that match his bleeding",
      cue: "Look at the chairside photo after disclosing. Two areas carry the plaque that explains the bleeding.",
      why: "Showing is more persuasive than telling, but only if what is shown is specific. The disclosing dye makes plaque visible, and the two sites here are exactly where his gums bleed — which lets him connect his own experience to something he can see and change. A photograph shown on the chairside screen, between the two of you, also keeps his information private. Using images well is a teaching skill that community and public-health hygienists rely on every day.",
    },
    {
      id: "ohi-info-dose", kind: "gauge", target: "ohi-info-dial", noRobot: false,
      title: "Offer one small piece of information, then ask what he makes of it",
      cue: "Give one clear fact about the plaque and the bleeding — not a lecture — and set it inside the band.",
      gauge: {
        label: "INFORMATION DOSE", speed: 0.6, green: [0.36, 0.56],
        readout: (t) => (t < 0.36 ? "too vague to be useful" : t > 0.56 ? "lecture — he has stopped listening" : "one clear fact, then his view"),
        missNote: "Outside the band. Too vague and he learns nothing; too much and it is the lecture he has heard before — one fact, then ask what he thinks.",
      },
      why: "Elicit, provide, elicit: find out what he already knows, offer one small piece of information he does not — that plaque at the gumline is what makes it bleed, and that bleeding gums and blood sugar affect each other — then ask what he makes of it. People absorb one fact they asked about far better than ten they did not. Judging how much to say is a clinical skill in its own right, and it is the difference between educating patients and talking at them.",
    },
    {
      id: "ohi-listen-reflect", kind: "hold", target: "ohi-listen-reflect", seconds: 7,
      noRobot: true,
      robotNote: "Reflecting a patient's own words back to him is a conversation whose whole content is a person; it stays with the clinician.",
      title: "Reflect back what he said, and let the silence work",
      cue: "Say back the heart of what he told you — then wait, and let him fill the silence.",
      holdBreakNote: "You filled the silence yourself. The pause was his to use — reflect again and wait longer this time.",
      why: "A good reflection — 'so the bleeding worries you more because of your dad' — shows him he has been heard, and a pause afterwards gives him room to go further. It is in that silence that people usually say what they actually want to change. Resisting the urge to fill it is hard and it is learnable, and it is the skill that makes a hygienist the person patients open up to, which matters in every care setting.",
    },
    {
      id: "ohi-change-talk", kind: "find", noHint: true, noRobot: false,
      targets: ["ohi-talk-grandkids", "ohi-talk-after-shift"],
      itemNames: { "ohi-talk-grandkids": "'I want to keep my own teeth for my grandkids'", "ohi-talk-after-shift": "'I could do it when I get home, before I sleep'" },
      itemNotes: {
        "ohi-talk-grandkids": "That is change talk — a reason for change in his own words, and a far stronger motive than anything you could supply.",
        "ohi-talk-after-shift": "That is change talk too — the first sign of a plan, and it came from him. It is the thread to pull on.",
      },
      title: "Notice the two things he said that are his own reasons to change",
      cue: "Four things he said are on the board. Two of them are change talk — find those.",
      why: "Motivational interviewing listens for change talk — the patient's own reasons, desires and ideas for change — and gently draws out more of it. Sustain talk, like 'I never have time', is not argued with; it is acknowledged. The reasons he gives himself, keeping his teeth for his grandchildren and a routine after his shift, will carry him further than any reason you could give. Hearing the difference is the skill that makes MI work, and it is valued far beyond the dental chair.",
    },
    {
      id: "ohi-chart-plaque", kind: "select", target: "ohi-plaque-chart", noRobot: false,
      title: "Record the plaque score and the bleeding sites",
      cue: "Enter today's plaque score and mark the two bleeding sites on the chart, so the next visit has something to compare against.",
      why: "The plaque score and the bleeding sites are the baseline that makes the next visit meaningful. If he comes back with less stain behind the lower front teeth, he can see his own progress, and nothing motivates like seeing something you did work. Accurate charting also supports the care plan under the ADHA's practice standards. Measuring outcomes, not just delivering advice, is what distinguishes clinical hygiene from well-meaning conversation.",
    },
    {
      id: "ohi-model-demo", kind: "drag", target: "ohi-interdental-brush", noRobot: false,
      drag: { to: "ohi-typodont", radius: 0.4, missNote: "That is not the model. Carry the interdental brush to the teaching model on the bracket table — technique is shown on the model, not demonstrated in his mouth." },
      title: "Show the interdental brush on the model, not in his mouth",
      cue: "Take the interdental brush to the teaching model and show the in-and-out movement between two teeth.",
      why: "Technique is easier to learn by watching it done on a model the right size and shape than by having it done inside your own mouth, where you cannot see anything. The interdental brush suits a man who hated floss, and showing it on the model lets him try it in his own hand straight away. Then he tries it on himself while you coach. Demonstration on a model is the teaching method school and community programmes are built around, and doing it well is a core public-health skill.",
    },
    {
      id: "ohi-goal-track", kind: "track", target: "ohi-goal-meter", seconds: 8, noRobot: false,
      title: "Help him set one goal — his size, not yours",
      cue: "Keep the goal in the band: specific and small enough that he believes he can do it this week.",
      track: {
        start: 0.2, green: [0.38, 0.62], rise: 0.5, fall: 0.42, drift: 0.12, label: "GOAL SIZE",
        readout: (v) => (v < 0.38 ? "vague — 'I'll try to do better'" : v > 0.62 ? "too big — every gap, twice a day" : "his goal: after shift, before sleep"),
      },
      holdBreakNote: "The goal drifted out of his size. Ask him again what feels doable this week, and let his answer set it.",
      why: "A goal he sets is a goal he owns, and the right size is small enough that he believes he can do it this week: the interdental brush between the lower front teeth, when he gets home, before he sleeps. 'I'll try harder' changes nothing, and 'every gap twice a day' collapses by Wednesday. Helping a patient size his own goal is the skill behind every successful behaviour-change programme, and it opens doors into health coaching and community work.",
    },
    {
      id: "ohi-goal-card", kind: "select", target: "ohi-goal-card", noRobot: false,
      title: "Write his goal on the take-home card, in his words",
      cue: "Write the goal exactly as he said it, and the date you will both look at it again.",
      why: "A goal in his own words — 'lower front gaps, when I get home, before sleep' — belongs to him in a way a printed instruction never will, and it goes home on the card to sit by his toothbrush. The review date means someone will ask. Writing it down closes the conversation with something concrete. Clear, patient-owned written plans are the backbone of chronic-condition care everywhere, and producing them is a skill any health team values.",
    },
    {
      id: "ohi-kit-pack", kind: "sequence", anyOrder: true, noRobot: false,
      targets: ["ohi-kit-soft-brush", "ohi-kit-interdental", "ohi-kit-card-sleeve"],
      itemNames: {
        "ohi-kit-soft-brush": "a soft toothbrush",
        "ohi-kit-interdental": "interdental brushes in his size",
        "ohi-kit-card-sleeve": "the goal card in its sleeve",
      },
      itemNotes: {
        "ohi-kit-soft-brush": "A soft brush, because the bleeding gums need cleaning without being scrubbed.",
        "ohi-kit-interdental": "The interdental brushes in the size you matched on the model, so there is no guessing at the shop.",
        "ohi-kit-card-sleeve": "The goal card, in a sleeve so it survives the bathroom shelf.",
      },
      title: "Pack the take-home kit",
      cue: "Put a soft brush, interdental brushes in his size and the goal card in the bag — any order.",
      why: "The easiest way to make a new habit happen is to remove the first obstacle, and for a man who works nights the obstacle is often just not having the right thing in the bathroom. A soft brush, interdental brushes already sized for him and the goal card go home in one bag. Small practical supports like this turn good intentions into routines, and designing them well is the essence of public-health dental practice.",
    },
    {
      id: "ohi-team-checkin", kind: "select", target: "ohi-team-checkin", noRobot: false,
      title: "Check in with the dentist and the team — and with yourself",
      cue: "Hand over his goal and the glucose episode to the dentist, and take a breath before the next patient.",
      why: "The dentist needs to know about the low blood sugar and the goal he chose, so the next visit builds on them. The check-in is also a moment for you: staying patient through a conversation with someone who has heard it all before is real emotional work, and noticing that you are tired is part of doing it well. Clinicians who look after their own steadiness last longer and lead better, which is why this habit is worth building early.",
    },
    {
      id: "ohi-visit-log", kind: "select", target: "ohi-visit-log", noRobot: false,
      title: "Write the visit log",
      cue: "Record the plaque score, what was shown on the model, his goal in his words, the review date and the glucose episode.",
      why: "The log records what was found, what was taught, what he chose and what happened: the plaque score, the interdental brush shown on the model, the goal in his words, the review date and the low blood sugar that interrupted the visit. It supports what the office records under the ADA's CDT code set for oral hygiene instruction and it lets the next clinician pick up where you left off. Continuity of care depends on records like this.",
    },
  ],

  interrupts: [
    {
      id: "ohi-hypoglycaemia",
      kind: "Medical emergency",
      after: "ohi-listen-story", delay: 3, seconds: 12,
      alert: "Mid-sentence he has gone pale and sweaty, his hands are shaking and he is losing his thread — he came straight from a night shift and has not eaten.",
      cue: "Fetch the glucose gel from the emergency kit — he is awake and can swallow — and tell the dentist.",
      target: "ohi-glucose-kit",
      why: "A person with diabetes who has skipped a meal can drop into a low blood sugar quickly, and while he is conscious and able to swallow, fast-acting sugar is the answer. The emergency kit's glucose gel works within minutes; the dentist is told and he is watched until he is steady. If he stops being able to swallow or becomes unresponsive, it becomes the office medical emergency response.",
      missNote: "You kept listening while his blood sugar kept falling. A low that is not treated while the patient can still swallow can progress to confusion and unconsciousness — the glucose gel was in the kit on the wall.",
      wrongNote: "It is the glucose gel in the emergency kit. He is conscious and can swallow, so sugar comes first.",
    },
    {
      id: "ohi-corridor-display",
      kind: "Privacy breach",
      after: "ohi-goal-track", delay: 3, seconds: 11,
      alert: "A colleague has mirrored your chairside screen onto the corridor display 'as a great teaching example' — his mouth photos and name are up for the waiting room.",
      cue: "Switch the corridor display off at its wall switch — the goal conversation can wait ten seconds.",
      target: "ohi-display-switch",
      why: "Intraoral photographs with a patient's name are protected health information, and a display in a corridor is a public disclosure however good the teaching intention. Switching it off ends the exposure at once; any teaching use needs the patient's permission and his identity removed, and that is a conversation for later.",
      missNote: "His photographs and name stayed on the corridor display for the rest of the visit. Everyone in the waiting room saw a disclosure he never agreed to, in the middle of a conversation built on his trust.",
      wrongNote: "It is the corridor display's wall switch. The exposure is on that screen, so that is what goes off.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, OHI_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#d2dcd6", base2: "#c6d1ca", seam: "rgba(0,0,0,0.08)",
    }), { repeat: 4, px: 256 });
    const topTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#f0f4f1", base2: "#e3e9e5", seam: "rgba(0,0,0,0.06)",
    }), { repeat: 3, px: 256 });
    const floor = slab(g, 5.6, 0.008, 5.6, 0, 0.002, 0, 0xd2dcd6, { radius: 0.05, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.76, metal: 0.04, color: 0xdbe4de });

    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.frame ?? 0x243a30, { rough: 0.5 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 384 });
      return b;
    };
    const lines = (title, rows, accent = OHI_CSS) => (cx, w, h) => {
      cx.fillStyle = "#0f1a15"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = accent; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#eaf6ef"; cx.font = `600 ${Math.round(h * 0.14)}px Arial, sans-serif`;
      cx.fillText(title, w * 0.05, h * 0.26);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      rows.forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.5 + i * 0.2)));
    };
    const wrap = (cx, text, x, y, maxW, lh) => {
      let line = "", yy = y;
      for (const word of String(text).split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if (cx.measureText(test).width > maxW && line) { cx.fillText(line, x, yy); line = word; yy += lh; } else line = test;
      }
      if (line) cx.fillText(line, x, yy);
    };

    // --------------------------------------------------- the chair, upright
    const chair = group(g, -0.95, 0, -1.0);
    cyl(chair, 0.22, 0.26, 0.12, 0, 0.06, 0.3, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 18 });
    cyl(chair, 0.07, 0.07, 0.42, 0, 0.3, 0.3, CITY.steel, { rough: 0.3, metal: 0.85, seg: 14 });
    slab(chair, 0.56, 0.13, 1.0, 0, 0.56, 0.1, 0x3f6f5a, { radius: 0.07, rough: 0.6 });
    const back = group(chair, 0, 0.62, -0.4);
    slab(back, 0.54, 0.86, 0.16, 0, 0.4, 0, 0x3f6f5a, { radius: 0.07, rough: 0.6 });
    back.rotation.x = -0.18;
    const patient = seatedFigure(chair, 0, 0.62, -0.2, { cloth: 0x4a5a7a, legs: 0x2a2f3a });
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    const sweat = ball(patient.head, 0.1, 0, 0.03, 0.02, 0xc8d4d0, { rough: 0.3, seg: 12, opacity: 0.5, transparent: true });
    sweat.visible = false;
    const juice = group(g, -0.62, 0.95, -0.6);
    const juiceTube = cyl(juice, 0.015, 0.015, 0.08, 0, 0, 0, 0xf2a83c, { rough: 0.5, seg: 10 });
    juiceTube.rotation.z = 0.5;
    juice.visible = false;

    // Two listening markers between you and him: the story, and the reflection.
    const listenA = group(g, -0.4, 1.12, -0.35);
    const ringA = cyl(listenA, 0.06, 0.06, 0.006, 0, 0, 0, OHI_ACCENT, { emissive: OHI_ACCENT, ei: 0.6, rough: 0.4, seg: 20 });
    ownMaterial(ringA);
    ringA.rotation.x = Math.PI / 2;
    holoTag(listenA, "listen — his story", 0, 0.11, 0, { css: OHI_CSS, w: 0.32 });
    reg(hits, listenA, "ohi-listen-story");
    const listenB = group(g, -0.2, 1.12, -0.25);
    const ringB = cyl(listenB, 0.05, 0.05, 0.006, 0, 0, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 0.6, rough: 0.4, seg: 20 });
    ownMaterial(ringB);
    ringB.rotation.x = Math.PI / 2;
    holoTag(listenB, "reflect — then wait", 0, 0.1, 0, { css: "#7fc4d8", w: 0.32 });
    reg(hits, listenB, "ohi-listen-reflect");

    // Your stool, with its height dial.
    const stool = group(g, 0.05, 0, -0.55);
    cyl(stool, 0.24, 0.26, 0.04, 0, 0.03, 0, CITY.darkSteel, { rough: 0.45, metal: 0.55, seg: 18 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      cyl(stool, 0.022, 0.022, 0.05, Math.cos(a) * 0.2, 0.025, Math.sin(a) * 0.2, 0x16191d, { rough: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    }
    cyl(stool, 0.035, 0.035, 0.5, 0, 0.29, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 12 });
    const stoolSeat = group(stool, 0, 0.58, 0);
    cyl(stoolSeat, 0.2, 0.2, 0.09, 0, 0, 0, 0x2f6f8c, { rough: 0.7, seg: 20 });
    const dial = group(stool, 0.2, 0.42, 0.05);
    cyl(dial, 0.05, 0.05, 0.03, 0, 0, 0, CITY.hiVis, { rough: 0.5, metal: 0.3, seg: 16 }).rotation.x = Math.PI / 2;
    holoTag(dial, "stool — to eye level", 0, 0.12, 0, { css: OHI_CSS, w: 0.36 });
    reg(hits, dial, "ohi-stool-dial");

    // ------------------------------------------ prompt cards and talk board
    const prompts = board(0.7, 0.44, -1.6, 1.55, 0.9, lines("OPENING", ["", "", ""]), { ry: 0.9 });
    const PROMPTS = [["ohi-prompt-permission", 0.08, "1 ASK PERMISSION"], ["ohi-prompt-open", -0.04, "2 OPEN QUESTION"], ["ohi-prompt-affirm", -0.16, "3 AFFIRM"]];
    for (const [id, y, label] of PROMPTS) {
      const p = group(prompts, 0, y, 0.015);
      box(p, 0.62, 0.09, 0.01, 0, 0, 0, 0x1c2e25, { rough: 0.5 });
      decal(p, 0.6, 0.08, 0, 0, 0.006, signFace(label, { bg: "#1c2e25", accent: OHI_CSS, fg: "#eaf6ef", scale: 0.42 }), { px: 256 });
      reg(hits, p, id);
    }
    const talk = board(0.8, 0.5, 2.25, 1.55, -0.4, lines("WHAT HE SAID", ["", "", "", ""]), { ry: -Math.PI / 2 });
    const TALK = [
      ["ohi-talk-grandkids", 0.1, "Keep my own teeth for my grandkids"],
      ["ohi-talk-no-time", 0.0, "I never have time after shifts"],
      ["ohi-talk-after-shift", -0.1, "I could do it when I get home, before sleep"],
      ["ohi-talk-always-bled", -0.2, "They've always bled a bit"],
    ];
    for (const [id, y, label] of TALK) {
      const t = group(talk, 0, y, 0.015);
      box(t, 0.74, 0.085, 0.01, 0, 0, 0, 0x1c2e25, { rough: 0.5 });
      decal(t, 0.72, 0.075, 0, 0, 0.006, signFace(label, { bg: "#1c2e25", accent: "#7fc4d8", fg: "#eaf6ef", scale: 0.34 }), { px: 320 });
      reg(hits, t, id);
    }

    // ------------------------------------------ chairside screen and bracket
    const screenArm = group(g, 0.35, 0, -1.55, -0.4);
    cyl(screenArm, 0.03, 0.03, 1.3, 0, 0.65, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    const screen = group(screenArm, 0, 1.35, 0.05);
    box(screen, 0.56, 0.36, 0.03, 0, 0, 0, 0x15181b, { rough: 0.4 });
    decal(screen, 0.52, 0.32, 0, 0, 0.017, (cx, w, h) => {
      cx.fillStyle = "#1a0f12"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f3e7d8";
      for (let i = 0; i < 6; i++) { cx.fillRect(w * (0.12 + i * 0.13), h * 0.22, w * 0.1, h * 0.22); cx.fillRect(w * (0.12 + i * 0.13), h * 0.56, w * 0.1, h * 0.22); }
      cx.fillStyle = "rgba(200,40,140,0.75)";
      cx.fillRect(w * 0.12, h * 0.4, w * 0.2, h * 0.05); cx.fillRect(w * 0.5, h * 0.56, w * 0.24, h * 0.05);
      cx.fillStyle = "#eaf6ef"; cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`;
      cx.fillText("DISCLOSED — CHAIRSIDE", w * 0.04, h * 0.1);
    }, { px: 384, glow: true, ei: 0.8 });
    const molar = group(screen, -0.14, 0.04, 0.03);
    torus(molar, 0.035, 0.006, 0, 0, 0, OHI_ALERT, { emissive: OHI_ALERT, ei: 0.8, seg: 6, seg2: 16, cast: false });
    reg(hits, molar, "ohi-plaque-molar");
    const lingual = group(screen, 0.07, -0.05, 0.03);
    torus(lingual, 0.035, 0.006, 0, 0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.8, seg: 6, seg2: 16, cast: false });
    reg(hits, lingual, "ohi-plaque-lingual");
    holoTag(screen, "chairside screen", 0, 0.24, 0, { css: OHI_CSS, w: 0.34 });

    const bracket = group(g, 0.35, 0, -0.95, -0.3);
    cyl(bracket, 0.03, 0.03, 0.82, 0, 0.41, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    slab(bracket, 0.52, 0.03, 0.36, 0, 0.84, 0, 0xc9d1d6, { radius: 0.01, rough: 0.4, metal: 0.4 });
    const typodont = group(bracket, -0.08, 0.87, 0.0);
    cyl(typodont, 0.09, 0.09, 0.03, 0, 0.015, -0.02, 0xe8a0a0, { rough: 0.6, seg: 20 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 5) * Math.PI;
      box(typodont, 0.018, 0.022, 0.016, Math.cos(a) * 0.07, 0.04, -Math.sin(a) * 0.07, 0xf6f1e4, { rough: 0.4 });
    }
    holoTag(typodont, "teaching model", 0, 0.1, 0, { css: OHI_CSS, w: 0.3 });
    reg(hits, typodont, "ohi-typodont");
    const idb = group(bracket, 0.12, 0.87, 0.08, 0.3);
    cyl(idb, 0.004, 0.004, 0.09, 0, 0, 0, 0x2f8f5a, { rough: 0.5, seg: 6 }).rotation.z = Math.PI / 2;
    cyl(idb, 0.006, 0.006, 0.015, 0.05, 0, 0, 0xdfe8ee, { rough: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(idb, "interdental brush", 0, 0.06, 0, { css: OHI_CSS, w: 0.32 });
    reg(hits, idb, "ohi-interdental-brush");
    const scaler = group(bracket, 0.16, 0.87, -0.1, -0.4);
    cyl(scaler, 0.005, 0.005, 0.15, 0, 0, 0, CITY.steel, { rough: 0.2, metal: 0.9, seg: 8 }).rotation.z = Math.PI / 2;
    cyl(scaler, 0.001, 0.004, 0.02, 0.085, 0.006, 0, CITY.steel, { rough: 0.15, metal: 0.95, seg: 6 }).rotation.z = 1.1;
    holoTag(scaler, "scaler as a pointer?", 0, 0.06, 0, { css: OHI_ALERT, w: 0.36 });
    reg(hits, scaler, "ohi-scaler-pointer");
    const infoDial = group(bracket, -0.2, 0.87, 0.12);
    cyl(infoDial, 0.04, 0.04, 0.02, 0, 0, 0, OHI_ACCENT, { rough: 0.5, seg: 16 });
    box(infoDial, 0.006, 0.008, 0.035, 0, 0.012, 0.01, 0x1b1f24, { rough: 0.5 });
    holoTag(infoDial, "information dose", 0, 0.07, 0, { css: OHI_CSS, w: 0.32 });
    reg(hits, infoDial, "ohi-info-dial");

    // -------------------------------------------- counter: kit, chart, polisher
    const counterRun = group(g, 1.35, 0, -1.4, -0.35);
    box(counterRun, 1.9, 0.86, 0.6, 0, 0.43, 0, 0xd2d9d5, { rough: 0.55 });
    const top = slab(counterRun, 1.96, 0.045, 0.64, 0, 0.88, 0, 0xffffff, { radius: 0.012, rough: 0.5 });
    top.material = texturedMat(topTex, { rough: 0.48, metal: 0.05, color: 0xffffff });
    for (let i = 0; i < 4; i++) box(counterRun, 0.44, 0.24, 0.02, -0.72 + i * 0.48, 0.6, 0.31, 0xc4ccc8, { rough: 0.5 });
    for (let i = 0; i < 3; i++) box(counterRun, 0.58, 0.6, 0.32, -0.6 + i * 0.6, 1.72, -0.16, 0xe6ece8, { rough: 0.55 });
    const KIT = [
      ["ohi-kit-soft-brush", -0.7, 0x5aa0d8, "soft brush"],
      ["ohi-kit-interdental", -0.45, 0x2f8f5a, "interdental — his size"],
      ["ohi-kit-card-sleeve", -0.2, 0xf2e3c9, "card sleeve"],
    ];
    for (const [id, x, colour, label] of KIT) {
      const k = group(counterRun, x, 0.92, 0.12);
      box(k, 0.14, 0.03, 0.08, 0, 0, 0, colour, { rough: 0.6 });
      holoTag(k, label, 0, 0.07, 0, { css: OHI_CSS, w: 0.34 });
      reg(hits, k, id);
    }
    const kitBag = group(counterRun, 0.05, 0.9, 0.1);
    box(kitBag, 0.2, 0.18, 0.1, 0, 0.09, 0, 0xf4f1e6, { rough: 0.9 });
    const chart = group(counterRun, 0.35, 0.905, 0.05);
    const chartFace = decal(chart, 0.26, 0.3, 0, 0, 0, paperFace("PLAQUE SCORE", ["Today: ___ %", "Bleeding: ___", "Next: ___"], { band: OHI_CSS }), { px: 256 });
    chartFace.rotation.x = -Math.PI / 2;
    holoTag(chart, "plaque chart", 0, 0.06, 0, { css: OHI_CSS, w: 0.28 });
    reg(hits, chart, "ohi-plaque-chart");
    const card = group(counterRun, 0.6, 0.905, 0.12);
    const cardFace = decal(card, 0.16, 0.1, 0, 0, 0, paperFace("MY GOAL", ["________"], { band: OHI_CSS }), { px: 160 });
    cardFace.rotation.x = -Math.PI / 2;
    holoTag(card, "goal card", 0, 0.06, 0, { css: OHI_CSS, w: 0.22 });
    reg(hits, card, "ohi-goal-card");
    const polisher = group(counterRun, 0.82, 0.9, -0.05);
    box(polisher, 0.2, 0.14, 0.16, 0, 0.07, 0, 0xdfe4e8, { rough: 0.4, metal: 0.2 });
    hose(polisher, [[0, 0.1, 0.08], [0.1, 0.2, 0.18], [0.05, 0.14, 0.3]], 0.008, 0x8b929a, { steps: 8, rough: 0.5 });
    holoTag(polisher, "air polisher — demo?", 0, 0.22, 0, { css: OHI_ALERT, w: 0.38 });
    reg(hits, polisher, "ohi-air-polisher");
    const scare = group(counterRun, -0.85, 1.45, -0.02);
    decal(scare, 0.24, 0.18, 0, 0, 0.17, paperFace("SCARE SCRIPT", ["'You'll lose your teeth'", "'Diabetes makes it worse'"], { band: OHI_ALERT }), { px: 192 });
    holoTag(scare, "the scare script", 0, 0.14, 0.17, { css: OHI_ALERT, w: 0.3 });
    reg(hits, scare, "ohi-scare-script");

    // ------------------------------- the goal meter, the corridor screen
    const meter = group(g, -0.1, 1.5, -2.25);
    box(meter, 0.36, 0.22, 0.04, 0, 0, 0, 0x1b2024, { rough: 0.5 });
    const meterFace = decal(meter, 0.32, 0.18, 0, 0, 0.022, signFace("GOAL SIZE", { bg: "#0f1a15", accent: OHI_CSS, fg: "#eaf6ef", scale: 0.44 }), { px: 256, glow: true, ei: 0.8 });
    holoTag(meter, "goal meter", 0, 0.16, 0, { css: OHI_CSS, w: 0.26 });
    reg(hits, meter, "ohi-goal-meter");
    const corridor = group(g, 2.1, 0, 1.25, -2.3);
    cyl(corridor, 0.03, 0.03, 1.5, 0, 0.75, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 10 });
    const corridorScreen = box(corridor, 0.7, 0.42, 0.04, 0, 1.6, 0, 0x15181b, { rough: 0.4 });
    ownMaterial(corridorScreen);
    holoTag(corridor, "corridor display", 0, 1.9, 0, { css: OHI_ALERT, w: 0.32 });
    reg(hits, corridor, "ohi-corridor-screen");
    const mirrored = decal(corridor, 0.66, 0.38, 0, 1.6, 0.022, signFace("PATIENT PHOTOS — LIVE", { bg: "#3a1414", accent: OHI_ALERT, fg: "#ffe8e8", scale: 0.36 }), { px: 256, glow: true, ei: 1.0 });
    mirrored.visible = false;
    const wallSwitch = group(g, 1.55, 1.2, 1.7, -2.3);
    box(wallSwitch, 0.1, 0.14, 0.03, 0, 0, 0, 0xeef2f4, { rough: 0.5 });
    const toggle = box(wallSwitch, 0.03, 0.05, 0.03, 0, 0.02, 0.02, 0x2b3138, { rough: 0.5 });
    holoTag(wallSwitch, "display switch", 0, 0.12, 0, { css: OHI_CSS, w: 0.28 });
    reg(hits, wallSwitch, "ohi-display-switch");

    // A hand sink and a sharps unit by the door, part of every operatory.
    const sink = group(g, -2.15, 0, 0.35, 0.9);
    box(sink, 0.6, 0.84, 0.44, 0, 0.42, 0, 0xd2d9d5, { rough: 0.55 });
    cyl(sink, 0.14, 0.12, 0.06, 0, 0.87, 0, 0xdfe4e8, { rough: 0.25, metal: 0.3, seg: 16, open: true, side: 2 });
    cyl(sink, 0.012, 0.012, 0.24, 0, 0.98, -0.14, CITY.steel, { rough: 0.3, metal: 0.85, seg: 8 });
    const sharps = group(g, -2.3, 1.35, 0.3, Math.PI / 2);
    box(sharps, 0.24, 0.3, 0.18, 0, 0, 0, 0xd8342a, { rough: 0.6 });
    decal(sharps, 0.2, 0.1, 0, 0, 0.092, signFace("SHARPS", { bg: "#a5261e", accent: "#f2ae14", fg: "#ffffff", scale: 0.4 }), { px: 128 });

    // --------------------------------------------------- emergency kit, wall
    const emKit = group(g, -2.3, 1.2, -0.9, Math.PI / 2);
    box(emKit, 0.36, 0.3, 0.14, 0, 0, 0, 0xd8342a, { rough: 0.5 });
    box(emKit, 0.12, 0.03, 0.005, 0, 0, 0.072, 0xffffff, { rough: 0.5 });
    box(emKit, 0.03, 0.12, 0.005, 0, 0, 0.072, 0xffffff, { rough: 0.5 });
    const gel = group(emKit, 0.12, -0.2, 0.06);
    box(gel, 0.1, 0.04, 0.05, 0, 0, 0, 0xf2a83c, { rough: 0.6 });
    holoTag(emKit, "emergency kit — glucose", 0, 0.22, 0, { css: OHI_CSS, w: 0.42 });
    reg(hits, emKit, "ohi-glucose-kit");

    // ------------------------------------------------- guide, check-in, log
    const guide = board(0.62, 0.3, -0.9, 2.2, -2.45, lines("THE GUIDE", ["His reasons beat yours."], "#7fc4d8"), { frame: 0x22323a });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.14);
    });
    const checkin = board(0.44, 0.28, 0.5, 1.72, -2.45, lines("TEAM CHECK-IN", ["His goal · the low sugar", "And how are you?"], "#7fc4d8"), { frame: 0x22323a });
    reg(hits, checkin.userData.face, "ohi-team-checkin");
    const log = board(0.4, 0.3, 1.05, 1.72, -2.45, paperFace("VISIT LOG", ["Plaque score · sites", "Model demo · his goal", "Review date · glucose"], { band: OHI_CSS }));
    reg(hits, log.userData.face, "ohi-visit-log");

    // ---------------------------------------------------------------- crew
    const dentist = standingFigure(g, -2.3, 1.7, { ry: 2.4, cloth: 0x2f5f70 });
    holoTag(dentist, "the dentist", 0, 1.86, 0, { css: OHI_CSS, w: 0.28 }).rotation.y = -2.4;
    const colleague = standingFigure(g, 2.05, 0.55, { ry: -1.9, cloth: 0x7a5a8a });
    holoTag(colleague, "hygiene colleague", 0, 1.86, 0, { css: OHI_CSS, w: 0.36 }).rotation.y = 1.9;

    const panel = holoPanel(g, 0.8, 0.5, 1.45, 2.15, -2.5, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,14,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = OHI_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#c8f0d8"; cx.font = `600 ${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.fillText("OPEN · AFFIRM · REFLECT · SUMMARISE", w * 0.05, h * 0.16);
      cx.fillStyle = "#effaf3"; cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Permission before advice", "One fact, then his view", "Listen for change talk", "His goal, his words"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { accent: OHI_ACCENT });
    void panel;

    for (let i = -1; i <= 1; i += 2) {
      box(g, 1.2, 0.06, 0.34, i * 1.1, 2.62, -0.9, 0xe6ece8, { rough: 0.4, cast: false });
      box(g, 1.08, 0.02, 0.26, i * 1.1, 2.585, -0.9, 0xfff6e6, { emissive: 0xfff6e6, ei: 0.55, rough: 0.4, cast: false });
    }
    const key = new THREE.DirectionalLight(0xfff4e8, 0.85);
    key.position.set(-2.4, 4.6, 2.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xf2fbf6, 0x5d6a72, 0.9));

    const tickMat = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.5, rough: 0.5 });
    let meterState = "";

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.1, -0.9),

      onStepComplete(step) {
        if (step.id === "ohi-eye-level") stoolSeat.position.y = 0.46;
        if (step.id === "ohi-plaque-find") { molar.visible = false; lingual.visible = false; }
        if (step.id === "ohi-chart-plaque") repaint(chartFace, paperFace("PLAQUE SCORE", ["Today: recorded", "Bleeding: 2 sites", "Review: 3 months"], { band: OHI_CSS }));
        if (step.id === "ohi-model-demo") { idb.parent.remove(idb); typodont.add(idb); idb.position.set(0.02, 0.05, -0.05); }
        if (step.id === "ohi-goal-card") repaint(cardFace, paperFace("MY GOAL", ["Lower front gaps,", "home, before sleep"], { band: "#59c97b" }));
        if (step.id === "ohi-kit-pack") box(kitBag, 0.16, 0.04, 0.08, 0, 0.2, 0, 0x5aa0d8, { rough: 0.6 });
        if (step.id === "ohi-change-talk") for (const c of talk.children) if (c.children?.[0]) c.children[0].material = tickMat;
        if (step.id === "ohi-visit-log") repaint(log.userData.face, paperFace("VISIT LOG", ["Score recorded", "Goal in his words", "Review booked"], { band: "#59c97b" }));
      },

      onHazard(id, s) {
        patient.head.rotation.y = 0.5;
        paintGuide(typeof eiLine === "function"
          ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
          : "Stop there. That is the move that makes people stop listening.");
      },

      onInterrupt(it) {
        if (it.id === "ohi-hypoglycaemia") {
          sweat.visible = true;
          patient.torso.rotation.x = 0.2;
          patient.head.rotation.x = 0.3;
        }
        if (it.id === "ohi-corridor-display") {
          mirrored.visible = true;
          corridorScreen.material.emissive.set(0xd8342a);
          corridorScreen.material.emissiveIntensity = 0.5;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "ohi-hypoglycaemia") {
          sweat.visible = false;
          juice.visible = true;
          gel.visible = false;
          patient.torso.rotation.x = 0;
          patient.head.rotation.x = 0;
        }
        if (it.id === "ohi-corridor-display") {
          mirrored.visible = false;
          corridorScreen.material.emissiveIntensity = 0;
          toggle.position.y = -0.02;
        }
      },

      animate(t, dt, session) {
        const id = session?.step?.id;
        ringA.material.emissiveIntensity = id === "ohi-listen-story" ? 0.5 + Math.abs(Math.sin(t * 1.4)) * 0.8 : 0.3;
        ringB.material.emissiveIntensity = id === "ohi-listen-reflect" ? 0.5 + Math.abs(Math.sin(t * 1.4)) * 0.8 : 0.3;
        const tr = session?.track;
        if (tr && id === "ohi-goal-track") {
          const state = tr.v < 0.38 ? "TOO VAGUE" : tr.v > 0.62 ? "TOO BIG" : "HIS SIZE";
          if (state !== meterState) {
            meterState = state;
            repaint(meterFace, signFace(state, { bg: "#0f1a15", accent: state === "HIS SIZE" ? "#59c97b" : OHI_ALERT, fg: "#eaf6ef", scale: 0.44 }));
          }
        }
      },
    };
  },
};
