import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, seatedFigure, ownMaterial, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Public Health Dentistry & Fluoridation Advocacy VR — Dental &
// Oral Health.
//
// A public-health dental hygienist at the water board's evening meeting, the
// night community water fluoridation is on the agenda. The station is public
// health as a career: the school screening data stripped of anything that
// identifies a child before it goes on a slide, the case built in order, the
// plant's own monitoring read, the team's own slides checked for claims that
// go further than the evidence, the meeting made accessible, the speaker card
// filled in honestly, a worried resident heard, three minutes of testimony,
// a council member's question answered with exactly the confidence the
// evidence has, and every question logged for a written reply.
//
// Sited generically: no real city, board or ballot measure. The evidence is
// described as the CDC and HHS publish it, including that questions about
// exposures above those used in community water are being studied — the
// station teaches honest advocacy, not a script. The Unspoken Smiles
// programme is named only as the programme this platform is built for.

const PHD_ACCENT = 0x5fb8d6;
const PHD_CSS = "#5fb8d6";
const PHD_ALERT = "#f0645b";

export const SIM_DN_PUBLIC_HEALTH_DENTISTRY_AND_FLUORIDATION_ADVOCACY = {
  id: "dn-public-health-dentistry-and-fluoridation-advocacy",
  index: "323",
  domain: "Dental",
  trade: "Public-health dental hygienist — community oral health and advocacy (RDH with the state's public-health permit where it has one), AFSCME public-health staff, SEIU and UFCW clinic staff",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "The CDC's community water fluoridation guidance and its dental infection-control guidelines for the outreach table; the recommendation on fluoride in community water published by HHS; the ADA's policy supporting community water fluoridation and the ADA's CDT code set under which the programme's preventive services are reported; the ADHA's standards on the hygienist's role in community health; the state dental board's rules for hygienists practising in public-health settings; HIPAA's de-identification standard for screening data; Title II of the ADA for an accessible public meeting; OSHA 29 CFR 1910.1030 for outreach staff; AFSCME, SEIU and UFCW public-health and clinic staff; Unspoken Smiles, the programme this platform is built for",
  name: "Public Health Dentistry & Fluoridation Advocacy",
  title: simTitle("Public Health Dentistry & Fluoridation Advocacy"),
  tagline: "Community water fluoridation at a public meeting, argued honestly: data with no child in it, your own slides checked for overclaims, a worried resident heard, three minutes at the podium and every question answered in writing",
  accent: PHD_ACCENT,
  accentCss: PHD_CSS,
  parSeconds: 320,
  footprint: 2.3,
  badge: { id: "honest-case", name: "Honest Case", note: "A public-health case made with de-identified data, sourced claims and the evidence stated at its real strength" },
  supportLine: "your department's employee assistance line, or the programme colleague you debrief with — a hostile public meeting is hard on the people who stand up at it",

  game: system({
    name: "Community Case",
    currency: "CASE",
    ranks: ["Outreach Volunteer", "Community Hygienist", "Public-Health Hygienist", "Programme Lead", "Community Case Certified"],
    badges: [
      { id: "no-child-in-it", name: "No Child In It", note: "Both identifiers found in the data before it went on a slide", test: AWARD.stepClean("phd-deidentify") },
      { id: "straight-dealer", name: "Straight Dealer", note: "No unsafe action anywhere at the meeting", test: AWARD.safe },
      { id: "held-the-floor", name: "Held The Floor", note: "The listening and the testimony carried without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-meeting", name: "Clean Meeting", note: "No corrections anywhere at the meeting", test: AWARD.clean },
      { id: "right-confidence", name: "Right Confidence", note: "Both dials set near the middle of their bands", test: AWARD.precise(0.72) },
      { id: "under-the-bell", name: "Under The Bell", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "phd-email-raw-file": "That is the raw school-screening spreadsheet, about to be emailed to the council member who asked for 'the numbers'. It has children's names, schools and treatment needs in it. Public-health data leave the department only in aggregate and de-identified to HIPAA's standard, and a board member's request does not change that — what they get is the summary table, not the file.",
    "phd-box-cutter": "That is an open box cutter lying on the fact-sheet carton at the outreach table, blade out, where a child reaching for a sticker will find it first. A community table is a workplace with the public walking through it; blades are retracted and put away the moment the box is open, because a cut hand at a health event is an injury the event caused.",
    "phd-latex-balloons": "That is a bunch of latex balloons for the children's corner. Latex allergy can be severe, a public meeting has no way of knowing who in the room has it, and a burst balloon puts the protein in the air — which is why health events and many clinics have gone latex-free. Stickers and non-latex balloons do the same job.",
    "phd-campaign-button": "That is a campaign button for the fluoridation ballot measure, offered to you to wear while you testify on work time. A public employee speaking in an official capacity gives the public the evidence, not a campaign; employers' rules on political activity at work exist precisely so the public can trust that what the department says is information. Wear it, if you choose, on your own time.",
  },

  lateNotes: {
    "phd-question-log": "Not yet. The questions are logged once they have been asked — after the testimony and the council's questions, not before.",
    "phd-team-checkin": "The debrief comes once the meeting is over and the fact sheet is on the record.",
    "phd-advocacy-log": "The meeting is not over. The advocacy log records what was actually presented and asked, at the end.",
  },

  steps: [
    {
      id: "phd-deidentify", kind: "find", noHint: true, noRobot: false,
      targets: ["phd-name-column", "phd-small-cell"],
      itemNames: { "phd-name-column": "a column of children's names", "phd-small-cell": "a school with only three children screened" },
      itemNotes: {
        "phd-name-column": "The export still carries the children's names. They come out entirely — the slide needs rates, not people.",
        "phd-small-cell": "One school had only three children screened. A rate from three children at a named school identifies them as surely as a name would; small cells are combined or suppressed.",
      },
      title: "Find the two things in the data table that would identify a child",
      cue: "The screening table is going on a slide. Two things in it would point to a specific child — find both.",
      why: "School screening data are the strongest evidence a local programme has, and they are about children. Before anything goes on a slide, names come out and small numbers are suppressed or combined, because a rate from three children at a named school identifies them as surely as their names would. HIPAA's de-identification standard and ordinary ethics agree. Handling population data responsibly is the core technical skill of a public-health career, from programme hygienist to epidemiologist.",
    },
    {
      id: "phd-case-order", kind: "sequence", noRobot: false,
      targets: ["phd-slide-local", "phd-slide-evidence", "phd-slide-ask"],
      itemNames: {
        "phd-slide-local": "the local problem, in our own data",
        "phd-slide-evidence": "what the evidence says, and its limits",
        "phd-slide-ask": "the cost and the specific ask",
      },
      outOfOrderNote: "Out of order. Start with this community's own children, then the evidence, then the ask — a board asked for money before it has seen the problem hears only the cost.",
      title: "Build the case in order: our problem, the evidence, the ask",
      cue: "Local data first, then the evidence and its limits, then the cost and the specific decision you are asking for.",
      why: "Decision-makers remember the first thing they hear. Opening with this community's own children — decay rates by neighbourhood, the gap between the richest and poorest schools — makes the problem theirs; the evidence, stated honestly with its limits, comes next; the cost and a specific ask come last, when the board is ready to hear them. Structuring a case for a public body is a skill that carries from public-health dentistry into policy, grant writing and programme management.",
    },
    {
      id: "phd-plant-reading", kind: "gauge", target: "phd-plant-chart", noRobot: false,
      title: "Read the water plant's own fluoride monitoring before you speak about it",
      cue: "Read the plant's monitoring chart for the past quarter and commit where the level has actually been held.",
      gauge: {
        label: "PLANT MONITORING", speed: 0.58, green: [0.4, 0.6],
        readout: (t) => (t < 0.4 ? "reading it as below the recommended level" : t > 0.6 ? "reading it as above the recommended level" : "held at the recommended level"),
        missNote: "Outside the band. The chart shows the level held steady at the recommended value — misread it in public and the first question from the floor will be about your credibility, not the children.",
      },
      why: "The water utility, not the dental programme, adds and monitors fluoride, and its own records show the level it has actually held against the recommendation HHS publishes. Reading the plant's chart yourself before speaking means you describe the system as it really runs, and you can answer the first question from the floor with the utility's own numbers. Working across agencies — water, health, education — on shared facts is what public-health leadership looks like day to day.",
    },
    {
      id: "phd-overclaim", kind: "find", noHint: true, noRobot: false,
      targets: ["phd-claim-no-risk", "phd-claim-unsourced"],
      itemNames: { "phd-claim-no-risk": "'fluoride carries no risk at all'", "phd-claim-unsourced": "a cost-savings figure with no source" },
      itemNotes: {
        "phd-claim-no-risk": "Overstated. Dental fluorosis — usually faint white marks — is a known effect of too much fluoride while teeth are forming, and reviews of exposures higher than community water are still being studied. Say what the evidence says, including its limits.",
        "phd-claim-unsourced": "A savings figure with no source is the first thing an opponent will challenge and the easiest to lose on. Either cite where it comes from or take it off the slide.",
      },
      title: "Find the two claims on your own slides that go further than the evidence",
      cue: "Check the team's draft slides. Two claims overstate the case — find them before anybody else does.",
      why: "The most damaging claims at a public meeting are usually your own. 'No risk at all' is not what the evidence says — dental fluorosis is a known effect of excess exposure while teeth form, and higher exposures than community water are still being studied — and an unsourced savings figure invites the one challenge you cannot answer. The CDC's own materials state benefits and limits together. Checking your own side's claims hardest is what makes a public-health professional credible for a whole career.",
    },
    {
      id: "phd-access-plan", kind: "select", target: "phd-access-kit", noRobot: false,
      title: "Make the meeting accessible before it starts",
      cue: "Confirm the interpreter headsets, the translated fact sheets and the step-free route to the podium are in place.",
      why: "A public meeting about everybody's drinking water has to be usable by everybody: interpretation for residents who do not speak English, translated fact sheets, large print, and a step-free route to the microphone. Title II of the ADA sets the floor for accessibility at a public body's meetings; good public-health practice goes further, because the communities with the most tooth decay are often the ones least heard at these meetings. Planning for inclusion is a mark of the advocates who go on to lead programmes.",
    },
    {
      id: "phd-speaker-card", kind: "select", target: "phd-speaker-card", noRobot: false,
      title: "Fill in the speaker card honestly: who you speak for",
      cue: "Write your name and state that you are speaking for the health department's dental programme, in your official role.",
      why: "The public is entitled to know who is speaking and for whom. A speaker card that says you are there for the health department's dental programme, in your official capacity, lets the board weigh your testimony for what it is — information from the agency — and keeps you inside your employer's rules on advocacy at work. If you also hold personal views, they belong on a separate card on your own time. Transparency like this is what keeps public-health professionals trusted across election cycles.",
    },
    {
      id: "phd-listen-resident", kind: "hold", target: "phd-listen-point", seconds: 7,
      noRobot: true,
      robotNote: "Hearing a worried resident out is a conversation whose whole content is a person; it stays with the hygienist.",
      title: "Hear a worried resident out before the meeting starts",
      cue: "A mother has come to your table worried about her baby's formula. Listen to the whole of it without interrupting.",
      holdBreakNote: "You started answering before she had finished. Let her get to the end — her real question was about mixing formula, and she had not asked it yet.",
      why: "Most people with doubts about fluoridation are not opponents; they are parents with a specific worry, often one they have read about and not been able to ask anyone. Letting her finish means you hear the real question — whether to mix her baby's formula with tap water — and can answer it with the guidance the CDC gives rather than a speech. Listening first is the skill that turns a public meeting into public health, and it is at the centre of every community-facing career.",
    },
    {
      id: "phd-mic-set", kind: "turn", target: "phd-mic-gooseneck", noRobot: false,
      turn: { turns: 0.75, axis: "x", label: "MICROPHONE" },
      title: "Set the podium microphone to your height",
      cue: "Bend the microphone gooseneck up to your mouth height before you start the clock.",
      why: "Three minutes is not long, and half a minute lost to a microphone pointing at your chest is testimony nobody at the back or on the livestream hears — including the residents using the interpretation headsets, which take their feed from this microphone. Setting it before the clock starts is small, practical stagecraft. People who speak for public programmes learn it quickly, and it is part of what makes them effective in front of boards, councils and legislatures.",
    },
    {
      id: "phd-testimony", kind: "track", target: "phd-podium-timer", seconds: 9,
      noRobot: true,
      robotNote: "Testimony is a person speaking to their own community; the robot can run the slides and the timer, not the voice.",
      title: "Give three minutes of testimony at a pace the room can follow",
      cue: "Keep your delivery in the band — the local data, the evidence and the ask — and finish before the bell.",
      track: {
        start: 0.2, green: [0.38, 0.62], rise: 0.5, fall: 0.42, drift: 0.12, label: "DELIVERY",
        readout: (v) => (v < 0.38 ? "dragging — the bell will cut the ask" : v > 0.62 ? "rushing — the interpreter cannot keep up" : "clear, paced, on the clock"),
      },
      holdBreakNote: "Your pace slipped. Slow to where the interpreter can follow, and make sure the ask comes before the bell.",
      why: "Public comment has a hard clock, and the ask has to land before the bell. Too fast and the interpreter, the livestream and half the room lose you; too slow and the bell cuts off the one sentence the board needed to hear. Clear, paced delivery of the local data, the evidence and the specific decision you are asking for is a skill that carries from a water-board meeting to a legislature, and it is how public-health careers grow beyond the clinic.",
    },
    {
      id: "phd-certainty", kind: "gauge", target: "phd-certainty-dial", noRobot: false,
      title: "Answer the council member's question with the confidence the evidence has",
      cue: "She asks whether fluoridation is 'proven safe'. Set your answer's confidence — not hedged into nothing, not overstated.",
      gauge: {
        label: "STATED CONFIDENCE", speed: 0.6, green: [0.4, 0.6],
        readout: (t) => (t < 0.4 ? "hedged — 'nobody really knows'" : t > 0.6 ? "overstated — 'zero risk, settled forever'" : "strong evidence at this level, limits named"),
        missNote: "Outside the band. Hedge it away and you undersell decades of evidence; overstate it and you hand the next speaker an easy rebuttal. Say what is known, at what level, and what is still being studied.",
      },
      why: "The honest answer to 'is it proven safe?' is neither 'yes, zero risk' nor 'nobody knows': decades of evidence support community water fluoridation at the recommended level, the known effect of excess exposure is dental fluorosis, and higher exposures than community water are being studied. Stating evidence at its real strength is harder than overselling it and it is the only approach that survives the next meeting. It is the defining professional skill of public-health communication.",
    },
    {
      id: "phd-question-log", kind: "select", target: "phd-question-log", noRobot: false,
      title: "Log every question from the floor for a written reply",
      cue: "Write down each question asked, who asked it and how to reach them, so the department answers in writing.",
      why: "The questions residents ask at a public meeting are the programme's best guide to what the community actually needs to know — about formula, about fluorosis, about cost, about who decided. Logging each one and replying in writing, with sources, turns a single evening into ongoing trust, and it gives the next fact sheet its content. Following through on public questions is the unglamorous heart of community engagement, and programme managers are judged on it.",
    },
    {
      id: "phd-factsheet", kind: "drag", target: "phd-factsheet", noRobot: false,
      drag: { to: "phd-clerk-tray", radius: 0.4, missNote: "That is not the clerk's tray. The sourced fact sheet goes to the clerk so it becomes part of the meeting's public record." },
      title: "Put the sourced fact sheet into the public record",
      cue: "Carry the plain-language fact sheet, with its sources listed, to the clerk's tray.",
      why: "Testimony is heard once; a document in the clerk's tray becomes part of the meeting's public record, available to every board member, journalist and resident afterwards. A plain-language fact sheet with its sources listed — the CDC's guidance, the HHS recommendation, the local screening data — means the case outlives the three minutes and can be checked by anyone. Producing clear, sourced public documents is a skill every public-health employer values.",
    },
    {
      id: "phd-team-checkin", kind: "select", target: "phd-team-checkin", noRobot: false,
      title: "Debrief with the programme team",
      cue: "Go over what landed, what the questions were, and how everyone is after a heated room.",
      why: "Public meetings on fluoridation can be hostile, and the people who stand up at them take that home. A short debrief with the team — what landed, which questions need a written answer, how everybody is — keeps the programme learning and keeps its people steady for the next meeting. Teams that talk about the hard evenings last longer in public health, and the hygienist who starts that conversation is on the way to leading the programme.",
    },
    {
      id: "phd-advocacy-log", kind: "select", target: "phd-advocacy-log", noRobot: false,
      title: "Write the advocacy log",
      cue: "Record what was presented, the sources, the questions logged, the emergency and the next steps.",
      why: "The advocacy log is the programme's memory: what was presented and on what sources, which questions came from the floor, what happened when the attendee collapsed, and what the department promised to follow up. It lets the next hygienist pick up where you left off and shows the department's work was accurate and accountable. Clear records of public engagement are the foundation of grant reporting and programme evaluation, which is where public-health careers advance.",
    },
  ],

  interrupts: [
    {
      id: "phd-projector-names",
      kind: "Privacy breach",
      after: "phd-listen-resident", delay: 3, seconds: 11,
      alert: "A colleague's laptop has started projecting the raw screening spreadsheet onto the room screen — children's names and schools, in front of the public.",
      cue: "Blank the projector with its mute button now — the resident will understand the pause.",
      target: "phd-projector-mute",
      why: "Children's names and treatment needs on a projector in a public room are a disclosure happening in front of everyone. Blanking the projector ends it in a second; the file is closed and the de-identified slides go back up afterwards, and the incident is reported to the programme's privacy lead.",
      missNote: "The spreadsheet stayed on the screen while the room filled. Parents and strangers could read which children at which schools needed treatment — a disclosure the programme's whole data practice exists to prevent.",
      wrongNote: "It is the projector's mute button. The names are on the screen, so the screen is what goes dark.",
    },
    {
      id: "phd-attendee-collapse",
      kind: "Medical emergency",
      after: "phd-testimony", delay: 3, seconds: 12,
      alert: "An older man in the second row has slumped sideways in his seat and is not responding — the room has gone quiet.",
      cue: "Stop, open the AED cabinet and call for help — the testimony can wait.",
      target: "phd-aed-cabinet",
      why: "An unresponsive adult needs emergency help and a defibrillator immediately, and the person at the podium can see the whole room. Opening the AED cabinet sounds its alarm and brings the device; calling for help starts the emergency response. The board can recess; the testimony will still be there.",
      missNote: "You kept speaking while he stayed slumped in his seat. Every minute without a defibrillator lowers the chance of surviving a cardiac arrest — the AED cabinet was on the wall by the door.",
      wrongNote: "It is the AED cabinet. Get the defibrillator and call for help before anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, PHD_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#b9aa92", base2: "#ad9f88", seam: "rgba(0,0,0,0.1)",
    }), { repeat: 4, px: 256 });
    const woodTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#6a4f36", base2: "#5f4630", seam: "rgba(0,0,0,0.1)",
    }), { repeat: 2, px: 256 });
    const floor = slab(g, 5.6, 0.008, 5.6, 0, 0.002, 0, 0xb9aa92, { radius: 0.05, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.03, color: 0xc2b39b });

    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.frame ?? 0x243442, { rough: 0.5 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 384 });
      return b;
    };
    const lines = (title, rows, accent = PHD_CSS) => (cx, w, h) => {
      cx.fillStyle = "#0e1820"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = accent; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#e8f4fa"; cx.font = `600 ${Math.round(h * 0.14)}px Arial, sans-serif`;
      cx.fillText(title, w * 0.05, h * 0.26);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      rows.forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.5 + i * 0.2)));
    };

    // ------------------------------------------------------------ the dais
    const dais = group(g, 0, 0, -2.0);
    box(dais, 3.0, 0.2, 0.9, 0, 0.1, 0, 0x5f4630, { rough: 0.6 });
    const daisTop = slab(dais, 2.8, 0.05, 0.6, 0, 0.98, 0.05, 0x6a4f36, { radius: 0.01, rough: 0.5 });
    daisTop.material = texturedMat(woodTex, { rough: 0.5, metal: 0.03, color: 0xffffff });
    box(dais, 2.8, 0.76, 0.04, 0, 0.58, 0.33, 0x5f4630, { rough: 0.6 });
    decal(dais, 1.2, 0.14, 0, 0.72, 0.36, signFace("WATER BOARD — REGULAR MEETING", { bg: "#2a1f16", accent: "#d9b85a", fg: "#f6ecd8", scale: 0.4 }), { px: 384 });
    for (let i = -1; i <= 1; i++) {
      box(dais, 0.07, 0.2, 0.07, i * 0.9, 1.1, 0.1, 0x2b3138, { rough: 0.5 });
      cyl(dais, 0.008, 0.008, 0.2, i * 0.9, 1.2, 0.2, 0x1b1f24, { rough: 0.5, seg: 6 }).rotation.x = 0.6;
    }

    // Projector screen behind the dais, with the slides and the markers.
    const screenG = group(g, -0.2, 1.95, -2.5);
    box(screenG, 1.5, 0.9, 0.02, 0, 0, 0, 0xf4f4f0, { rough: 0.9 });
    const slides = decal(screenG, 1.4, 0.8, 0, 0, 0.012, lines("DRAFT SLIDES", ["Our children · the evidence · the ask", "'No risk at all'", "Saves $___ per person"]), { px: 512 });
    const namesProj = decal(screenG, 1.4, 0.8, 0, 0, 0.016, (cx, w, h) => {
      cx.fillStyle = "#fbfbf6"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1b1f24"; cx.font = `${Math.round(h * 0.06)}px Arial, sans-serif`;
      for (let i = 0; i < 9; i++) cx.fillText(`Name ${String.fromCharCode(65 + i)}.   School ${1 + (i % 3)}   Needs treatment`, w * 0.05, h * (0.12 + i * 0.09));
      cx.fillStyle = PHD_ALERT; cx.fillRect(0, 0, w, 8);
    }, { px: 512 });
    namesProj.visible = false;
    const SLIDE = [["phd-slide-local", -0.45, "1 OUR CHILDREN"], ["phd-slide-evidence", 0.0, "2 THE EVIDENCE"], ["phd-slide-ask", 0.45, "3 THE ASK"]];
    for (const [id, x, label] of SLIDE) {
      const s = group(screenG, x, -0.52, 0.02);
      box(s, 0.4, 0.1, 0.01, 0, 0, 0, 0x1b2a36, { rough: 0.5 });
      decal(s, 0.38, 0.09, 0, 0, 0.006, signFace(label, { bg: "#1b2a36", accent: PHD_CSS, fg: "#e8f4fa", scale: 0.42 }), { px: 192 });
      reg(hits, s, id);
    }
    const noRisk = group(screenG, 0.25, 0.02, 0.03);
    torus(noRisk, 0.05, 0.007, 0, 0, 0, PHD_ALERT, { emissive: PHD_ALERT, ei: 0.8, seg: 6, seg2: 18, cast: false });
    reg(hits, noRisk, "phd-claim-no-risk");
    const unsourced = group(screenG, 0.35, -0.14, 0.03);
    torus(unsourced, 0.05, 0.007, 0, 0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.8, seg: 6, seg2: 18, cast: false });
    reg(hits, unsourced, "phd-claim-unsourced");

    // ----------------------------------------------------------- the podium
    const podium = group(g, 0.5, 0, -0.6, Math.PI);
    box(podium, 0.6, 1.05, 0.45, 0, 0.525, 0, 0x6a4f36, { rough: 0.55 });
    slab(podium, 0.66, 0.04, 0.5, 0, 1.07, 0.02, 0x5f4630, { radius: 0.01, rough: 0.5 }).rotation.x = -0.15;
    decal(podium, 0.36, 0.12, 0, 0.7, -0.23, signFace("PUBLIC COMMENT", { bg: "#2a1f16", accent: PHD_CSS, fg: "#f6ecd8", scale: 0.42 }), { px: 192 }).rotation.y = Math.PI;
    const gooseneck = group(podium, 0.15, 1.1, -0.1);
    cyl(gooseneck, 0.006, 0.006, 0.26, 0, 0.13, 0, 0x1b1f24, { rough: 0.4, seg: 8 });
    ball(gooseneck, 0.018, 0, 0.27, 0, 0x1b1f24, { rough: 0.5, seg: 10 });
    holoTag(gooseneck, "microphone", 0, 0.36, 0, { css: PHD_CSS, w: 0.26 }).rotation.y = Math.PI;
    reg(hits, gooseneck, "phd-mic-gooseneck");
    const timer = group(podium, -0.18, 1.12, -0.12);
    box(timer, 0.14, 0.08, 0.03, 0, 0, 0, 0x15181b, { rough: 0.4 });
    const timerFace = decal(timer, 0.12, 0.06, 0, 0, -0.017, signFace("3:00", { bg: "#0e1820", accent: "#59c97b", fg: "#e8f4fa", scale: 0.6 }), { px: 128, glow: true, ei: 0.9 });
    timerFace.rotation.y = Math.PI;
    holoTag(timer, "podium timer", 0, 0.1, 0, { css: PHD_CSS, w: 0.26 }).rotation.y = Math.PI;
    reg(hits, timer, "phd-podium-timer");
    const dialG = group(podium, 0.0, 1.1, -0.18);
    cyl(dialG, 0.035, 0.035, 0.02, 0, 0, 0, PHD_ACCENT, { rough: 0.5, seg: 14 });
    holoTag(dialG, "stated confidence", 0, 0.07, 0, { css: PHD_CSS, w: 0.32 }).rotation.y = Math.PI;
    reg(hits, dialG, "phd-certainty-dial");

    // ------------------------------------------------ audience and attendee
    const rows = group(g, -1.1, 0, 0.55);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) {
      const c = group(rows, i * 0.55, 0, r * 0.7);
      slab(c, 0.44, 0.05, 0.42, 0, 0.45, 0, 0x2f4a5a, { radius: 0.02, rough: 0.7 });
      slab(c, 0.44, 0.42, 0.05, 0, 0.7, 0.19, 0x2f4a5a, { radius: 0.02, rough: 0.7 });
      for (const sx of [-1, 1]) box(c, 0.02, 0.44, 0.02, sx * 0.19, 0.22, 0, 0x3a3f46, { rough: 0.4, metal: 0.6 });
    }
    const attendee = seatedFigure(rows, 0.55, 0.45, 0.7, { ry: Math.PI, cloth: 0x6a5a4a, legs: 0x3a3f46 });
    const attendeeTilt = attendee.root.rotation.z;
    const resident = seatedFigure(rows, 1.1, 0.45, 0.0, { ry: Math.PI, cloth: 0x8a4a6a, legs: 0x2a2f3a });
    void resident;
    const listen = group(g, 0.35, 1.1, 0.3);
    const listenRing = cyl(listen, 0.06, 0.06, 0.006, 0, 0, 0, PHD_ACCENT, { emissive: PHD_ACCENT, ei: 0.6, rough: 0.4, seg: 20 });
    ownMaterial(listenRing);
    listenRing.rotation.x = Math.PI / 2;
    holoTag(listen, "listen — her worry", 0, 0.11, 0, { css: PHD_CSS, w: 0.32 });
    reg(hits, listen, "phd-listen-point");

    // ------------------------------------------------------ outreach table
    const table = group(g, 1.75, 0, 0.35, -Math.PI / 2);
    slab(table, 1.4, 0.04, 0.6, 0, 0.74, 0, 0xe8eef2, { radius: 0.01, rough: 0.6 });
    box(table, 1.4, 0.7, 0.02, 0, 0.37, 0.3, 0x3f7f96, { rough: 0.7 });
    for (const sx of [-1, 1]) box(table, 0.03, 0.72, 0.56, sx * 0.66, 0.36, 0, 0x6a7078, { rough: 0.4, metal: 0.5 });
    const laptop = group(table, -0.45, 0.76, -0.05);
    box(laptop, 0.3, 0.015, 0.2, 0, 0, 0, 0x2b3138, { rough: 0.4 });
    const lid = group(laptop, 0, 0.0, -0.1);
    box(lid, 0.3, 0.2, 0.012, 0, 0.1, 0, 0x2b3138, { rough: 0.4 });
    decal(lid, 0.27, 0.17, 0, 0.1, 0.007, lines("SCREENING EXPORT", ["Name · School · Needs", "School C: n = 3"]), { px: 256, glow: true, ei: 0.8 });
    const nameCol = group(lid, -0.08, 0.12, 0.012);
    torus(nameCol, 0.03, 0.005, 0, 0, 0, PHD_ALERT, { emissive: PHD_ALERT, ei: 0.8, seg: 6, seg2: 16, cast: false });
    reg(hits, nameCol, "phd-name-column");
    const smallCell = group(lid, 0.06, 0.06, 0.012);
    torus(smallCell, 0.03, 0.005, 0, 0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.8, seg: 6, seg2: 16, cast: false });
    reg(hits, smallCell, "phd-small-cell");
    const sendBtn = group(laptop, 0.1, 0.012, 0.05);
    box(sendBtn, 0.08, 0.008, 0.04, 0, 0, 0, PHD_ALERT, { rough: 0.5 });
    holoTag(sendBtn, "email raw file?", 0, 0.05, 0, { css: PHD_ALERT, w: 0.3 });
    reg(hits, sendBtn, "phd-email-raw-file");
    const carton = group(table, 0.0, 0.76, 0.0);
    box(carton, 0.3, 0.16, 0.22, 0, 0.08, 0, 0xb08a5a, { rough: 0.9 });
    const factsheet = group(carton, 0, 0.17, 0);
    box(factsheet, 0.2, 0.012, 0.28, 0, 0, 0, 0xfafafa, { rough: 0.9 });
    decal(factsheet, 0.18, 0.1, 0, 0.008, 0, signFace("FACT SHEET + SOURCES", { bg: "#fafafa", accent: PHD_CSS, fg: "#1b2a36", scale: 0.36 }), { px: 128 }).rotation.x = -Math.PI / 2;
    holoTag(factsheet, "sourced fact sheet", 0, 0.07, 0, { css: PHD_CSS, w: 0.32 });
    reg(hits, factsheet, "phd-factsheet");
    const cutter = group(carton, 0.1, 0.165, 0.08, 0.5);
    box(cutter, 0.1, 0.012, 0.025, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    box(cutter, 0.03, 0.004, 0.015, 0.06, 0, 0, CITY.steel, { rough: 0.2, metal: 0.9 });
    holoTag(cutter, "open box cutter", 0, 0.05, 0, { css: PHD_ALERT, w: 0.3 });
    reg(hits, cutter, "phd-box-cutter");
    const balloons = group(table, 0.5, 0.76, 0.1);
    cyl(balloons, 0.004, 0.004, 0.5, 0, 0.25, 0, 0xdfe4e8, { rough: 0.6, seg: 6 });
    for (let i = 0; i < 3; i++) ball(balloons, 0.08, -0.07 + i * 0.07, 0.56 + (i % 2) * 0.08, 0, [0xd8342a, 0x5aa0d8, 0xf2c14b][i], { rough: 0.3, seg: 12 });
    holoTag(balloons, "latex balloons", 0, 0.78, 0, { css: PHD_ALERT, w: 0.28 });
    reg(hits, balloons, "phd-latex-balloons");
    const button = group(table, 0.25, 0.765, -0.18);
    cyl(button, 0.03, 0.03, 0.008, 0, 0, 0, 0xd8342a, { rough: 0.5, seg: 14 });
    holoTag(button, "campaign button", 0, 0.05, 0, { css: PHD_ALERT, w: 0.3 });
    reg(hits, button, "phd-campaign-button");
    const access = group(table, -0.1, 0.76, -0.2);
    box(access, 0.2, 0.08, 0.14, 0, 0.04, 0, 0x2f6f5a, { rough: 0.6 });
    torus(access, 0.04, 0.008, 0, 0.12, 0, 0x1b1f24, { rough: 0.5, seg: 6, seg2: 14 });
    holoTag(access, "interpretation · large print", 0, 0.2, 0, { css: PHD_CSS, w: 0.44 });
    reg(hits, access, "phd-access-kit");
    const projector = group(table, -0.2, 0.76, 0.2);
    box(projector, 0.2, 0.08, 0.16, 0, 0.04, 0, 0xdedbd2, { rough: 0.5 });
    cyl(projector, 0.03, 0.03, 0.03, 0, 0.04, -0.09, 0x1b1f24, { rough: 0.3, seg: 12 }).rotation.x = Math.PI / 2;
    const muteBtn = box(projector, 0.04, 0.012, 0.03, 0.06, 0.085, 0.03, 0x59c97b, { emissive: 0x59c97b, ei: 0.4, rough: 0.5 });
    ownMaterial(muteBtn);
    holoTag(projector, "projector — mute", 0, 0.16, 0, { css: PHD_CSS, w: 0.32 });
    reg(hits, projector, "phd-projector-mute");

    // ---------------------- plant chart, clerk's tray, speaker cards, AED
    const plant = board(0.56, 0.38, -2.25, 1.6, -0.9, (cx, w, h) => {
      cx.fillStyle = "#0e1820"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = PHD_CSS; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#e8f4fa"; cx.font = `600 ${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.fillText("WATER PLANT — FLUORIDE, LAST QUARTER", w * 0.04, h * 0.18);
      cx.strokeStyle = "#59c97b"; cx.setLineDash([6, 6]); cx.beginPath(); cx.moveTo(w * 0.05, h * 0.55); cx.lineTo(w * 0.95, h * 0.55); cx.stroke();
      cx.setLineDash([]); cx.strokeStyle = PHD_CSS; cx.lineWidth = 3; cx.beginPath();
      for (let i = 0; i <= 20; i++) { const x = w * (0.05 + i * 0.045); const y = h * (0.55 + Math.sin(i * 1.3) * 0.04); if (i) cx.lineTo(x, y); else cx.moveTo(x, y); }
      cx.stroke();
      cx.fillStyle = "#bfe0ee"; cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      cx.fillText("dashed: the recommended level", w * 0.05, h * 0.85);
    }, { ry: Math.PI / 2 });
    reg(hits, plant.userData.face, "phd-plant-chart");
    const clerk = group(g, 1.2, 1.03, -1.85);
    box(clerk, 0.3, 0.05, 0.36, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    decal(clerk, 0.24, 0.05, 0, 0.04, 0.19, signFace("CLERK — PUBLIC RECORD", { bg: "#1b1f24", accent: PHD_CSS, scale: 0.4 }), { px: 128 });
    holoTag(clerk, "clerk's tray", 0, 0.14, 0, { css: PHD_CSS, w: 0.26 });
    hits["phd-clerk-tray"] = clerk;
    const cards = group(g, -0.55, 1.03, -1.85);
    box(cards, 0.24, 0.04, 0.16, 0, 0, 0, 0x6a4f36, { rough: 0.6 });
    box(cards, 0.1, 0.004, 0.14, 0, 0.025, 0, 0xf6ecd8, { rough: 0.9 });
    holoTag(cards, "speaker card", 0, 0.12, 0, { css: PHD_CSS, w: 0.26 });
    reg(hits, cards, "phd-speaker-card");
    const aed = group(g, -2.25, 1.25, 0.7, Math.PI / 2);
    box(aed, 0.34, 0.38, 0.14, 0, 0, 0, 0xeef2f4, { rough: 0.5 });
    const aedDoor = box(aed, 0.3, 0.34, 0.01, 0, 0, 0.075, 0x2f8f5a, { opacity: 0.8, transparent: true, rough: 0.3 });
    ownMaterial(aedDoor);
    const aedUnit = group(aed, 0, -0.02, 0.02);
    box(aedUnit, 0.2, 0.22, 0.08, 0, 0, 0, 0x2f8f5a, { rough: 0.5 });
    decal(aed, 0.2, 0.07, 0, 0.14, 0.082, signFace("AED", { bg: "#2f8f5a", accent: "#ffffff", fg: "#ffffff", scale: 0.6 }), { px: 128 });
    holoTag(aed, "AED cabinet", 0, 0.26, 0, { css: PHD_CSS, w: 0.26 });
    reg(hits, aed, "phd-aed-cabinet");

    // ------------------------------------------------- question log, boards
    const qlog = board(0.36, 0.26, 2.25, 1.6, -1.0, paperFace("QUESTIONS FROM THE FLOOR", ["Who · what · how to reach"], { band: PHD_CSS }), { ry: -Math.PI / 2 });
    reg(hits, qlog.userData.face, "phd-question-log");
    const checkin = board(0.44, 0.28, 2.25, 1.6, -1.55, lines("TEAM DEBRIEF", ["What landed · questions", "How is everyone?"], "#7fc4d8"), { ry: -Math.PI / 2, frame: 0x22323a });
    reg(hits, checkin.userData.face, "phd-team-checkin");
    const log = board(0.4, 0.3, -2.25, 1.6, -1.55, paperFace("ADVOCACY LOG", ["Presented · sources", "Questions · emergency", "Next steps"], { band: PHD_CSS }), { ry: Math.PI / 2 });
    reg(hits, log.userData.face, "phd-advocacy-log");

    // ---------------------------------------------------------------- crew
    const lead = standingFigure(g, 2.0, 1.6, { ry: -2.5, cloth: 0x2f5f70 });
    holoTag(lead, "programme lead", 0, 1.86, 0, { css: PHD_CSS, w: 0.32 }).rotation.y = 2.5;
    const clerkFig = standingFigure(g, 1.6, -1.1, { ry: -0.6, cloth: 0x4a4a5a });
    holoTag(clerkFig, "the clerk", 0, 1.86, 0, { css: PHD_CSS, w: 0.24 }).rotation.y = 0.6;

    const panel = holoPanel(g, 0.8, 0.5, 1.3, 2.35, -2.45, (cx, w, h) => {
      cx.fillStyle = "rgba(8,18,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = PHD_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#c8e8f4"; cx.font = `600 ${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.fillText("HONEST ADVOCACY", w * 0.06, h * 0.16);
      cx.fillStyle = "#eef8fc"; cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["No child in the data", "Check your own claims first", "Hear the worry, then answer it", "Evidence at its real strength"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { accent: PHD_ACCENT });
    void panel;

    for (let i = -1; i <= 1; i += 2) {
      box(g, 1.2, 0.06, 0.34, i * 1.1, 2.9, -0.6, 0xe8e2d4, { rough: 0.4, cast: false });
      box(g, 1.08, 0.02, 0.26, i * 1.1, 2.865, -0.6, 0xfff6e6, { emissive: 0xfff6e6, ei: 0.55, rough: 0.4, cast: false });
    }
    const key = new THREE.DirectionalLight(0xfff4e8, 0.85);
    key.position.set(-2.4, 4.6, 2.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xf6f2ea, 0x5d5448, 0.9));

    const tickMat = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.5, rough: 0.5 });
    const cutterHome = cutter.position.clone();

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "phd-deidentify") { nameCol.visible = false; smallCell.visible = false; }
        if (step.id === "phd-case-order") for (const c of screenG.children) if (c.children?.[0]) c.children[0].material = tickMat;
        if (step.id === "phd-overclaim") {
          noRisk.visible = false; unsourced.visible = false;
          repaint(slides, lines("OUR CASE", ["Our children · the evidence · the ask", "Fluorosis named · studies ongoing", "Savings: sourced"], "#59c97b"));
        }
        if (step.id === "phd-mic-set") gooseneck.rotation.x = -0.5;
        if (step.id === "phd-factsheet") { factsheet.parent.remove(factsheet); clerk.add(factsheet); factsheet.position.set(0, 0.035, 0); }
        if (step.id === "phd-advocacy-log") repaint(log.userData.face, paperFace("ADVOCACY LOG", ["Presented · sourced", "Questions logged", "Follow-up by letter"], { band: "#59c97b" }));
        void cutterHome;
      },

      onInterrupt(it) {
        if (it.id === "phd-projector-names") { namesProj.visible = true; muteBtn.material.emissive.set(0xd8342a); }
        if (it.id === "phd-attendee-collapse") { attendee.root.rotation.z = attendeeTilt + 0.7; attendee.head.rotation.x = 0.5; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "phd-projector-names") { namesProj.visible = false; muteBtn.material.emissive.set(0x59c97b); }
        if (it.id === "phd-attendee-collapse") {
          aedDoor.visible = false;
          aedUnit.parent.remove(aedUnit);
          rows.add(aedUnit);
          aedUnit.position.set(0.9, 0.12, 0.95);
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        listenRing.material.emissiveIntensity = session?.step?.id === "phd-listen-resident" ? 0.5 + Math.abs(Math.sin(t * 1.4)) * 0.8 : 0.3;
      },
    };
  },
};
