import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, valveWheel, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace,
} from "../citykit.js";
import { woodGrainFace, corrugatedFace } from "../../../shared/textures.js";
import { siteOffice } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dive Records & Incident Review — commercial diving and
// scientific scuba pack, DIVE1.
//
// The end of a dive day on the pier apron: the site office (the props kit's
// siteOffice) with a canopy table outside it, the tender's slate and the
// supervisor's dive record, the daily log and the equipment log in their
// binders, the retention file box, the safe practices manual, a timeline
// board and an action board, and the chairs of a debrief with the diver, the
// supervisor, the standby and a client representative. The learner is the
// diver-tender who keeps the paper: the record completed from the slate, the
// logs in order, the record filed, a debrief held without blame, a timeline
// built, a cause found in the conditions and a corrective action written and
// posted. No time, depth or clause figure is written; the record's fields
// come from the safe practices manual and the times from the slate.

const CDDR_ACCENT = 0xb8a0e0;
const CDDR_CSS = "#b8a0e0";

export const SIM_CD_DIVE_RECORDS_AND_INCIDENT_REVIEW = {
  id: "cd-dive-records-and-incident-review",
  index: "723",
  domain: "Maritime & Ports",
  trade: "Pile Drivers of the Carpenters diver-tender completing the dive record and the daily log and running an incident debrief with the dive supervisor, the diver, the standby diver and a client representative",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "clear",
  certification: "Pile Drivers apprenticeship under the Carpenters (UBC) International Training Fund; OSHA 29 CFR 1910 Subpart T — 29 CFR 1910.440 recordkeeping (the record of each dive, the decompression procedure assessment where a diver showed symptoms, and the retention of both), 29 CFR 1910.420 the safe practices manual the record's fields come from, 29 CFR 1910.423 post-dive procedures and 29 CFR 1910.421 the planning the next dive inherits; ADCI consensus standards for dive logs and incident reporting; USCG 46 CFR 197 Subpart B for the vessel's own record where the dive was from a vessel; every time and depth on the record comes from the slate and the tables, never from memory",
  name: "Dive Records & Incident Review",
  title: simTitle("Dive Records & Incident Review"),
  tagline: "The dive on paper: the record's fields read from the manual, the blank times and the missing signature found, the dive record then the daily log then the equipment log in order, the slate copied line by line while a client asks for a copy without the incident, the record filed for retention, the diver's account heard without interruption until a voice is raised, the timeline built, the cause found in the conditions, the manual turned to the procedure it amends, the action written with an owner, the assessment recorded, the action posted and the crew checked in",
  accent: CDDR_ACCENT,
  accentCss: CDDR_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "written-as-it-was", name: "Written As It Was", note: "Every time from the slate, nothing backdated, nothing left out for anyone, and a cause that named a condition rather than a person" },

  supportLine: "your union hall's member assistance programme — the Pile Drivers of the Carpenters — with the employer's employee assistance line behind it",

  game: system({
    name: "Paper Trail",
    currency: "SIGNED LINES",
    ranks: ["Tender", "Record Keeper", "Log Keeper", "Debrief Lead", "Records Certified"],
    badges: [
      { id: "gaps-found", name: "Gaps Found", note: "The blank times and the missing signature found before filing", test: AWARD.stepClean("record-gaps") },
      { id: "in-sequence", name: "In Sequence", note: "The timeline committed in the right order first time", test: AWARD.precise(0.7) },
      { id: "no-blame", name: "No Blame", note: "No hazard reached for from the brief to the check-in", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-paper", name: "Clean Paper", note: "No corrections from the brief to the check-in", test: AWARD.clean },
      { id: "slate-to-record", name: "Slate To Record", note: "The times copied in band the whole way", test: AWARD.unbroken },
      { id: "posted-quick", name: "Posted Quick", note: "Action posted inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "backdate-time": "You went to fill in the record's blank 'left bottom' time from memory so the form would look complete. A time written from memory is a guess dressed as a fact, and the record is what a physician, an investigator and the next supervisor read as fact; a blank with a note saying why is honest, and a time invented to fill it is the one entry that makes the whole record untrustworthy. The slate has the time or it does not.",
    "edit-for-client": "You started making the client's copy of the record with the diver's symptom and the chamber treatment left off, as they asked. The record is one document with one content, and a copy that says less than the original is a false record with the company's name on it; the client gets the record or gets told to ask the supervisor, and the incident stays on every copy of the page it happened on.",
    "name-the-diver": "You wrote the diver's name in the cause box — 'diver ascended too quickly'. A cause that names a person ends the review where it should begin: the next diver in the same conditions will do the same thing, because the conditions are what made it happen. The cause box takes the condition — the current, the plan, the signal that was missed — and the corrective action changes that, not the diver.",
    "bin-the-slate": "You went to throw the tender's slate in the bin once the record was written up from it. The slate is the original: the times were written on it as they happened and the record is a copy. If anyone ever asks where a time came from, the slate is the answer, and a slate photographed and filed with the record is the difference between a record and a story. Originals are kept; nothing is binned.",
  },

  lateNotes: {
    "copy-times": "The times are copied once the record's gaps are known and the logs are in order.",
    "debrief-chair": "The debrief begins once the record is complete and filed.",
    "action-board": "The action is posted once it is written with an owner.",
  },

  steps: [
    {
      id: "record-brief", kind: "select", target: "manual-fields",
      title: "Read the record's fields from the safe practices manual",
      cue: "At the canopy table with the supervisor: the safe practices manual's page on the dive record — every field it wants, where each comes from, who signs it and how long it is kept.",
      why: "29 CFR 1910.440 has a record kept of each dive and 29 CFR 1910.420 has the safe practices manual say what the employer's procedures are, so the record's fields come from the manual and not from whatever the last tender remembered to write. Reading them first is how the tender knows what a complete record looks like before deciding whether today's is one.",
    },
    {
      id: "record-gaps", kind: "find", noHint: true,
      targets: ["blank-times", "no-signature"],
      itemNames: { "blank-times": "'left bottom' and 'reached surface' left blank on the record", "no-signature": "supervisor's signature missing from the second dive" },
      itemNotes: {
        "blank-times": "The record's 'left bottom' and 'reached surface' fields are empty for the second dive. The tender's slate has them; the record does not yet.",
        "no-signature": "The second dive's record is unsigned by the supervisor. An unsigned record is a draft, and a draft is not a record anyone can rely on.",
      },
      title: "Find what the day's record is missing",
      cue: "Go down the record for each dive against the manual's fields: every time filled, every name, the gas and the tables the supervisor used, the symptoms box answered and the signature on each.",
      why: "A record is checked against the manual's fields the way a diver is checked against the plan: a blank is found while the slate that fills it still exists and the supervisor who signs it is still on the pier. Tomorrow the slate is wiped and the supervisor is on another job, and a blank found then is a blank forever — or, worse, a blank someone fills from memory.",
    },
    {
      id: "logs-in-order", kind: "sequence",
      targets: ["dive-record-binder", "daily-log-binder", "equipment-log-binder"],
      itemNames: { "dive-record-binder": "the dive record completed for each dive", "daily-log-binder": "the daily log written from the records", "equipment-log-binder": "the equipment log written from the tags" },
      title: "Complete the dive record, then the daily log, then the equipment log",
      cue: "The dive record for each dive first, from the slate; the daily log second, summarising the records and the day's events; the equipment log last, from the tags on the gear that came off the deck.",
      why: "The three documents feed each other in one direction: the record is written from the slate, the daily log summarises the records, and the equipment log takes its entries from the tags the tenders hung on the gear. Written in that order each is a copy of something that exists; written in another order the daily log invents what the record will say, and the two disagree by the time an investigator reads them.",
      outOfOrderNote: "Out of order — the dive record first from the slate, then the daily log from the records, then the equipment log from the tags.",
    },
    {
      id: "copy-times", kind: "track", target: "copy-times", seconds: 6,
      title: "Copy the times from the slate to the record, line by line",
      cue: "Slate in one hand, record in the other: copy each time across, say it aloud to the supervisor, and check the line before the next — steady, not racing the slate, not stalling on a line.",
      why: "The times are the record's spine: the tables are read against them, a symptom is timed against them, and a physician's decision may rest on one of them. They are copied one line at a time with each read aloud so the supervisor hears the number the slate holds and the number the pen writes, because a transposed digit read silently is a record that is wrong in the one place it matters.",
      track: { start: 0.14, green: [0.42, 0.62], rise: 0.56, fall: 0.46, drift: 0.12, label: "SLATE → RECORD", readout: (v) => (v < 0.42 ? "stalled on a line" : v > 0.62 ? "racing — lines unchecked" : "line by line, read aloud") },
      holdBreakNote: "The copying went out of band — stalled or racing. One line, read aloud, checked, then the next.",
    },
    {
      id: "file-record", kind: "drag", target: "signed-record",
      title: "File the signed record for retention",
      cue: "With every field filled from the slate and the supervisor's signature on each dive, put the record and the photographed slate in the retention file box.",
      why: "29 CFR 1910.440 has the record kept for the period it names, and a record kept is a record somebody can find: in the file box with the slate's photograph behind it, not in a truck cab or a tender's bag. Filing is done today because a record that goes home with someone is a record the company does not have when the question comes, and the question always comes later than anyone expects.",
      drag: { to: "records-file", radius: 0.5, missNote: "Not in the file — the signed record and the slate's photograph go into the retention file box today." },
    },
    {
      id: "debrief-listen", kind: "hold", target: "debrief-chair", seconds: 5,
      title: "Hold the floor for the diver's account without interruption",
      cue: "At the debrief, the diver describes the dive in their own words from the ladder to the chamber. Hold the floor for them — no questions, no corrections, no 'but' — until they have finished.",
      why: "A debrief that interrupts the diver hears the interrupter's version, and the point of the debrief is to hear the diver's: what they saw, what they felt, what they decided and why, in the order it happened to them. The tender running the debrief holds the floor for the whole account because the detail that explains the incident is usually the one the diver mentions last, almost as an afterthought, and only if nobody has stopped them.",
      holdBreakNote: "You cut across the diver's account — the floor is theirs until they finish. Let them go on.",
    },
    {
      id: "build-timeline", kind: "gauge", target: "timeline-board",
      title: "Build the timeline of the incident from the accounts and the record",
      cue: "Set the events on the board in order — the plan, the descent, the signal, the ascent, the symptom, the chamber — from the record's times and the accounts, and commit when the sequence reads as everyone heard it.",
      why: "The timeline is where the record's times and the people's accounts meet: an event that the record times and nobody remembers, or that everyone remembers and the record does not time, is where the review has to look. It is built on the board with everyone watching so the order is agreed in the room, because a timeline written up alone afterward is one person's memory with the record's authority.",
      gauge: { label: "TIMELINE — IN ORDER", speed: 0.66, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "events out of order" : t <= 0.62 ? "reads as the room heard it" : "past the sequence — check again"), missNote: "Outside the band — set the events in the order the record and the accounts agree on before you commit." },
    },
    {
      id: "find-cause", kind: "select", target: "cause-card",
      title: "Name the cause as a condition, not a person",
      cue: "On the cause card: the condition that made the incident possible — the current running against the plan, the signal not covered in the brief, the tender's line of sight — written so that it would be true of any diver on that dive.",
      why: "The corrective action can only change a condition, so the cause has to be one: a current, a gap in the brief, a hand signal two people understood differently, a rail that blocked the tender's view. A cause that is a person's name produces an action that is a warning to that person, and the next crew inherits the condition intact. The card is written so it would read the same whoever had been on the umbilical.",
    },
    {
      id: "turn-to-procedure", kind: "turn", target: "manual-binder",
      title: "Turn the safe practices manual to the procedure the action will amend",
      cue: "Open the manual's binder and turn to the page — the briefing procedure or the signals table — that the cause points at, and mark it for the amendment.",
      why: "29 CFR 1910.420 has the employer's procedures written in the safe practices manual, and a corrective action that does not end in a change to that manual is a conversation that will be forgotten by the next job. The page is turned to in the room so the action names the procedure it amends, and the amendment goes to whoever owns the manual with the incident's record behind it.",
      turn: { turns: 1.2, label: "MANUAL", readout: (t) => (t < 0.35 ? "cover" : t < 0.85 ? "turning — procedures" : "at the briefing procedure") },
    },
    {
      id: "write-action", kind: "select", target: "action-card",
      title: "Write the corrective action with an owner and a date",
      cue: "On the action card: what changes in the procedure, who owns making the change, by when per the plan, and how the crew will know it is done.",
      why: "An action without an owner is everyone's and therefore nobody's, and one without a date is a good intention; the card carries both and a way to see it is done — the amended page in the manual, the new line in the brief. It is written in the room, read back to the supervisor and the diver, and the diver hears that the outcome of their account is a change to the procedure and not a note in their file.",
    },
    {
      id: "assessment-record", kind: "select", target: "assessment-form",
      title: "Record the decompression procedure assessment",
      cue: "With the supervisor: the assessment record for the dive where the diver showed symptoms — the tables used, the decompression as run, the symptoms and their timing, the treatment and the assessment's conclusion — attached to the dive record.",
      why: "29 CFR 1910.440 has the decompression procedure assessed when a diver shows symptoms of decompression sickness and the assessment kept with the record, because a table that produced a symptom is a table the employer has to look at. The assessment is the supervisor's and the tender records it as given, with the times from the record and nothing rounded, so the physician and the next plan read what was done.",
    },
    {
      id: "post-action", kind: "select", target: "action-board",
      title: "Post the corrective action on the crew's board",
      cue: "Pin the action card on the crew's action board beside the team board, where every tender and diver on tomorrow's shift will read it before the brief.",
      why: "A corrective action that lives in a file changes nothing on the deck; one posted where the crew reads the brief is in front of the people the condition will meet next. The board carries the action, the owner and the date in plain sight, and it stays there until the manual's page is amended and the brief says so, because a crew that sees the action done trusts the next debrief.",
    },
    {
      id: "crew-checkin", kind: "select", target: "team-board",
      title: "Check in with the crew",
      cue: "At the team board: the record filed, the action posted and owned, the client's request and how it was answered, the raised voice and the ground rules, and how everyone is after the day.",
      why: "The day that ends with a debrief is a day someone was hurt or nearly was, and the check-in is where the crew say how they are and hear that the paper was done honestly — filed, signed, nothing left out for the client and nobody named as the cause. The Pile Drivers member assistance line is there for what the debrief does not settle, and the supervisor says so out loud.",
    },
  ],

  interrupts: [
    {
      id: "client-copy",
      kind: "Client asks for a copy without the incident",
      after: "copy-times", delay: 2, seconds: 14,
      alert: "The client's representative has come to the table asking for a copy of today's record for their file — 'just the work, you can leave the medical business off, it's not our concern.'",
      cue: "Refer the request to the dive supervisor — the record is theirs to release and it is released whole or not at all.",
      target: "supervisor-desk",
      why: "The client is entitled to ask and the dive supervisor is the one who answers, because the record is the employer's document and the supervisor signed it. The tender does not edit it for anyone and does not argue about it at the table; the representative is walked to the supervisor, who releases the record whole or explains why not. A copy with a page's contents thinned is a false record, whoever asked for it.",
      missNote: "The client's representative stood at the table repeating the request while the tender kept copying; they left with the impression the copy would follow, and the supervisor heard about it from the client.",
      wrongNote: "The supervisor's desk — the record is theirs to release, whole. Walk the representative over.",
    },
    {
      id: "raised-voice",
      kind: "Debrief turning to blame",
      after: "debrief-listen", delay: 2, seconds: 14,
      alert: "The standby diver has cut in over the diver's account, voice raised — 'you were told twice about that current, this is on you.'",
      cue: "Stop the debrief, point to the ground rules card and read it aloud — accounts without interruption, causes without names — then give the floor back to the diver.",
      target: "ground-rules-card",
      why: "A debrief that turns to blame stops producing information: the diver stops talking, the standby stops listening, and the cause becomes a person. The tender running it stops it the moment a voice is raised, not after, and does it with the card everyone agreed to at the start so it is the rule speaking and not one person against another. Then the diver has the floor again, and the standby's turn comes after.",
      missNote: "The exchange ran on; the diver went quiet and gave the rest of the account in one line, and the review's cause card was written from the standby's version.",
      wrongNote: "The ground rules card — stop it now, read the rules aloud, and give the diver back the floor.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CDDR_ACCENT);

    // ------------------------------------------------------- apron, water, office
    const water = box(g, 9.0, 0.02, 5.0, 0, 0.012, -4.4, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0f3038", mid: "#164650" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x8ab6c0 });
    const apron = box(g, 7.6, 0.14, 5.6, 0, 0.4, 0.4, 0xffffff, { rough: 0.8 });
    apron.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#4a5055", base2: "#3d4348", step: 21 }), { repeat: 4, px: 512 }), { rough: 0.8, metal: 0.35, color: 0xc6ccd2 });
    box(g, 7.6, 0.4, 5.6, 0, 0.16, 0.4, 0x8a8f93, { rough: 0.7, cast: false });
    for (const x of [-3.4, -1.7, 0, 1.7, 3.4]) cyl(g, 0.022, 0.022, 1.0, x, 0.97, -2.35, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8 });
    box(g, 7.4, 0.04, 0.04, 0, 1.45, -2.35, 0xc8ced4, { rough: 0.35, metal: 0.5 });
    const office = siteOffice(g, -2.4, 0.47, 2.4, { ry: Math.PI / 2 });
    void office;
    holoTag(g, "site office", -2.4, 4.0, 2.4, { css: CDDR_CSS, w: 0.22 });
    // Canopy over the table.
    const canopy = box(g, 3.6, 0.04, 2.4, 1.0, 2.9, 1.2, 0xffffff, { rough: 0.7 });
    canopy.material = texturedMat(surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h), { repeat: 3, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xd9dde0 });
    for (const [x, z] of [[-0.7, 0.1], [2.7, 0.1], [-0.7, 2.3], [2.7, 2.3]]) cyl(g, 0.03, 0.03, 2.4, x, 1.67, z, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 8 });
    const woodMat = texturedMat(surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h), { px: 256 }), { rough: 0.8, color: 0xc7a47a });
    const table = group(g, 1.0, 0.47, 1.2);
    const top = box(table, 2.2, 0.06, 0.9, 0, 0.78, 0, 0xffffff, { rough: 0.8 });
    top.material = woodMat;
    for (const [lx, lz] of [[-1.0, -0.4], [1.0, -0.4], [-1.0, 0.4], [1.0, 0.4]]) cyl(table, 0.03, 0.03, 0.76, lx, 0.38, lz, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 8 });
    holoTag(table, "canopy table — the paper", 0, 1.5, 0, { css: CDDR_CSS, w: 0.46 });

    // ------------------------------------------------------- the paper on the table
    const manual = group(table, -0.85, 0.83, -0.2);
    const manualCover = box(manual, 0.3, 0.05, 0.4, 0, 0, 0, 0x2f4f6f, { rough: 0.6 });
    void manualCover;
    const manualPage = decal(manual, 0.26, 0.34, 0, 0.03, 0, paperFace("SAFE PRACTICES MANUAL", ["Dive record — fields", "Times · gas · tables · names", "Symptoms · signature · kept"], { bg: "#f3efe4", band: "#2f4f6f" }), { px: 160 });
    manualPage.rotation.x = -Math.PI / 2;
    holoTag(manual, "manual — the record's fields", 0, 0.3, 0, { css: CDDR_CSS, w: 0.5 });
    reg(hits, manualPage, "manual-fields");
    const manualBinder = group(table, -0.85, 0.83, 0.28);
    const binderWheel = valveWheel(manualBinder, 0, 0.02, 0, { r: 0.05, color: 0x2f4f6f, body: 0x3a4148 });
    binderWheel.scale.set(0.6, 0.6, 0.6);
    holoTag(manualBinder, "manual binder — turn to the page", 0, 0.28, 0, { css: CDDR_CSS, w: 0.56 });
    reg(hits, manualBinder, "manual-binder");
    const record = decal(table, 0.3, 0.4, -0.3, 0.82, 0, paperFace("DIVE RECORD", ["Dive 1: ____ signed", "Dive 2: left btm ____", "surface ____ · sign ____"], { bg: "#f3efe4", band: CDDR_CSS }), { px: 192 });
    record.rotation.x = -Math.PI / 2;
    holoTag(table, "dive record", -0.3, 1.1, 0, { css: CDDR_CSS, w: 0.24 });
    reg(hits, record, "dive-record-binder");
    const blankTimes = box(table, 0.14, 0.012, 0.05, -0.3, 0.83, 0.05, 0xf2c14b, { rough: 0.7, emissive: 0x3a2a0a, ei: 0.4 });
    reg(hits, blankTimes, "blank-times");
    const noSig = box(table, 0.1, 0.012, 0.04, -0.22, 0.83, 0.15, 0xd2312b, { rough: 0.7, emissive: 0x3a0808, ei: 0.4 });
    reg(hits, noSig, "no-signature");
    const slate = decal(table, 0.22, 0.16, 0.1, 0.82, -0.28, paperFace("TENDER'S SLATE", ["Left surface ✓", "On bottom ✓ · left btm ✓", "Surface ✓"], { bg: "#e8eef2", band: "#2b7a98" }), { px: 128 });
    slate.rotation.x = -Math.PI / 2;
    holoTag(table, "tender's slate — the original", 0.1, 1.05, -0.3, { css: CDDR_CSS, w: 0.5 });
    const copyRing = group(table, -0.1, 0.9, -0.1);
    torus(copyRing, 0.12, 0.008, 0, 0, 0, CDDR_ACCENT, { emissive: CDDR_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 18 }).rotation.x = Math.PI / 2;
    holoTag(copyRing, "slate → record, line by line", 0, 0.16, 0, { css: CDDR_CSS, w: 0.5 });
    reg(hits, copyRing, "copy-times");
    const backdateHit = box(table, 0.2, 0.2, 0.2, -0.5, 0.95, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(table, "fill the time in from memory?", -0.5, 1.2, 0.3, { css: "#d2312b", w: 0.5 });
    reg(hits, backdateHit, "backdate-time");
    const daily = decal(table, 0.3, 0.4, 0.3, 0.82, 0.05, paperFace("DAILY LOG", ["Dives: from the records", "Events: bight · foul · chamber", "Crew · weather · vessel"], { bg: "#f3efe4", band: "#2b7a98" }), { px: 192 });
    daily.rotation.x = -Math.PI / 2;
    holoTag(table, "daily log", 0.3, 1.1, 0.05, { css: CDDR_CSS, w: 0.2 });
    reg(hits, daily, "daily-log-binder");
    const equip = decal(table, 0.3, 0.4, 0.75, 0.82, 0.05, paperFace("EQUIPMENT LOG", ["From the tags:", "Umbilical — chafe", "Coupling — weep"], { bg: "#f3efe4", band: "#c9401a" }), { px: 192 });
    equip.rotation.x = -Math.PI / 2;
    holoTag(table, "equipment log", 0.75, 1.1, 0.05, { css: CDDR_CSS, w: 0.28 });
    reg(hits, equip, "equipment-log-binder");
    for (let i = 0; i < 4; i++) box(table, 0.05, 0.12, 0.1, 0.95 - i * 0.02, 0.9, -0.3 + i * 0.03, i % 2 ? 0xf2c14b : 0xd2312b, { rough: 0.7 });
    const signedRecord = group(table, -0.3, 0.9, -0.42);
    box(signedRecord, 0.22, 0.012, 0.3, 0, 0, 0, 0xf4f8fb, { rough: 0.8 });
    holoTag(signedRecord, "signed record · slate photo", 0, 0.16, 0, { css: CDDR_CSS, w: 0.5 });
    reg(hits, signedRecord, "signed-record");
    signedRecord.visible = false;
    const cause = decal(table, 0.26, 0.2, 0.55, 0.82, -0.3, paperFace("CAUSE", ["Condition: ____", "Not a name"], { bg: "#fdf3e6", band: "#c9401a" }), { px: 128 });
    cause.rotation.x = -Math.PI / 2;
    holoTag(table, "cause card", 0.55, 1.05, -0.3, { css: CDDR_CSS, w: 0.22 });
    reg(hits, cause, "cause-card");
    const nameHit = box(table, 0.2, 0.2, 0.2, 0.85, 0.95, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(table, "write the diver's name as the cause?", 0.85, 1.2, -0.3, { css: "#d2312b", w: 0.6 });
    reg(hits, nameHit, "name-the-diver");
    const action = decal(table, 0.26, 0.2, 0.95, 0.82, 0.3, paperFace("ACTION", ["What · who · by when", "Done when: ____"], { bg: "#e6f6ea", band: "#2f8f5a" }), { px: 128 });
    action.rotation.x = -Math.PI / 2;
    holoTag(table, "action card", 0.95, 1.05, 0.3, { css: CDDR_CSS, w: 0.24 });
    reg(hits, action, "action-card");
    const assessment = decal(table, 0.26, 0.2, -0.75, 0.82, 0.3, paperFace("DECO ASSESSMENT", ["Tables · as run", "Symptoms · time · treatment"], { bg: "#eef6f8", band: "#6fb3e0" }), { px: 128 });
    assessment.rotation.x = -Math.PI / 2;
    holoTag(table, "assessment form", -0.75, 1.05, 0.3, { css: CDDR_CSS, w: 0.3 });
    reg(hits, assessment, "assessment-form");

    // ------------------------------------------------------- file box, bin, boards, desk
    const fileBox = group(g, 3.4, 0.47, 1.0);
    box(fileBox, 0.5, 0.4, 0.4, 0, 0.7, 0, 0x8a8f93, { rough: 0.5, metal: 0.4 });
    box(fileBox, 0.46, 0.04, 0.36, 0, 0.92, 0, 0x5b6771, { rough: 0.5, metal: 0.4 });
    box(fileBox, 0.5, 0.5, 0.4, 0, 0.25, 0, 0x5b6771, { rough: 0.5, metal: 0.4 });
    torus(fileBox, 0.28, 0.01, 0, 0.98, 0, CDDR_ACCENT, { emissive: CDDR_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 22 }).rotation.x = Math.PI / 2;
    holoTag(fileBox, "retention file", 0, 1.3, 0, { css: CDDR_CSS, w: 0.3 });
    reg(hits, fileBox, "records-file");
    const bin = group(g, 3.4, 0.47, -0.4);
    cyl(bin, 0.2, 0.18, 0.5, 0, 0.25, 0, 0x2b3138, { rough: 0.6, seg: 14 });
    const binHit = box(bin, 0.4, 0.4, 0.4, 0, 0.6, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bin, "bin the slate?", 0, 0.9, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, binHit, "bin-the-slate");
    const timeline = decal(g, 1.2, 0.5, 1.0, 1.7, 2.75, (cx, w, h) => {
      cx.fillStyle = "#f4f8fb"; cx.fillRect(0, 0, w, h); cx.fillStyle = CDDR_CSS; cx.fillRect(0, 0, w, 8);
      cx.strokeStyle = "#2b3138"; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(w * 0.08, h * 0.6); cx.lineTo(w * 0.92, h * 0.6); cx.stroke();
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.fillStyle = "#2b3138"; cx.textAlign = "left"; cx.fillText("TIMELINE", w * 0.05, h * 0.25);
      for (let i = 0; i < 6; i++) { cx.fillStyle = "#c9401a"; cx.beginPath(); cx.arc(w * (0.12 + i * 0.16), h * 0.6, 8, 0, Math.PI * 2); cx.fill(); }
    }, { px: 256, glow: false });
    timeline.rotation.y = Math.PI;
    box(g, 1.26, 0.56, 0.04, 1.0, 1.7, 2.78, 0x2b3138, { rough: 0.6 });
    holoTag(g, "timeline board", 1.0, 2.1, 2.7, { css: CDDR_CSS, w: 0.28 });
    reg(hits, timeline, "timeline-board");
    const actionBoard = decal(g, 0.6, 0.5, 2.4, 1.7, 2.75, (cx, w, h) => {
      cx.fillStyle = "#f4f8fb"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#2f8f5a"; cx.fillRect(0, 0, w, 8);
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`; cx.fillStyle = "#2b3138"; cx.textAlign = "left"; cx.fillText("ACTIONS", w * 0.06, h * 0.25);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillText("(none posted)", w * 0.06, h * 0.55);
    }, { px: 256, glow: false });
    actionBoard.rotation.y = Math.PI;
    box(g, 0.66, 0.56, 0.04, 2.4, 1.7, 2.78, 0x2b3138, { rough: 0.6 });
    holoTag(g, "crew action board", 2.4, 2.1, 2.7, { css: CDDR_CSS, w: 0.32 });
    reg(hits, actionBoard, "action-board");
    const team = decal(g, 0.6, 0.4, 3.3, 1.35, 2.75, (cx, w, h) => {
      cx.fillStyle = "#101c27"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("DIVE TEAM — DAY CLOSE", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Supervisor · Diver", "Tender · Standby", "Record: filed · whole"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { px: 256, glow: true, ei: 0.6 });
    team.rotation.y = Math.PI;
    box(g, 0.66, 0.46, 0.04, 3.3, 1.35, 2.78, 0x2b3138, { rough: 0.6 });
    reg(hits, team, "team-board");
    const rules = decal(g, 0.4, 0.3, -0.2, 1.5, 2.75, paperFace("GROUND RULES", ["Accounts without interruption", "Causes without names", "Actions with owners"], { bg: "#fdf3e6", band: "#c9401a" }), { px: 160 });
    rules.rotation.y = Math.PI;
    box(g, 0.46, 0.36, 0.04, -0.2, 1.5, 2.78, 0x2b3138, { rough: 0.6 });
    holoTag(g, "ground rules card", -0.2, 1.8, 2.7, { css: CDDR_CSS, w: 0.32 });
    reg(hits, rules, "ground-rules-card");
    const desk = group(g, -1.0, 0.47, 0.0);
    const deskTop = box(desk, 0.9, 0.05, 0.6, 0, 0.76, 0, 0xffffff, { rough: 0.8 });
    deskTop.material = woodMat;
    for (const [lx, lz] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]]) cyl(desk, 0.025, 0.025, 0.74, lx, 0.37, lz, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 8 });
    torus(desk, 0.3, 0.01, 0, 0.82, 0, CDDR_ACCENT, { emissive: CDDR_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 22 }).rotation.x = Math.PI / 2;
    holoTag(desk, "supervisor's desk — refer here", 0, 1.2, 0, { css: CDDR_CSS, w: 0.56 });
    reg(hits, desk, "supervisor-desk");
    const editHit = box(g, 0.3, 0.3, 0.3, 1.9, 1.2, 0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "copy without the incident?", 1.9, 1.5, 0.5, { css: "#d2312b", w: 0.5 });
    reg(hits, editHit, "edit-for-client");

    // ------------------------------------------------------- chairs and crew
    const chairAt = (x, z, ry) => {
      const c = group(g, x, 0.47, z, ry);
      box(c, 0.44, 0.04, 0.44, 0, 0.45, 0, 0x3a4148, { rough: 0.6, metal: 0.3 });
      box(c, 0.44, 0.44, 0.04, 0, 0.68, -0.2, 0x3a4148, { rough: 0.6, metal: 0.3 });
      for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) cyl(c, 0.015, 0.015, 0.44, lx, 0.22, lz, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
      return c;
    };
    const debriefChair = chairAt(1.0, -1.0, Math.PI);
    torus(debriefChair, 0.34, 0.01, 0, 0.5, 0, CDDR_ACCENT, { emissive: CDDR_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 22 }).rotation.x = Math.PI / 2;
    holoTag(debriefChair, "the diver's chair — hold the floor", 0, 1.0, 0, { css: CDDR_CSS, w: 0.6 });
    reg(hits, debriefChair, "debrief-chair");
    chairAt(2.0, -1.0, Math.PI);
    chairAt(0.0, -1.0, Math.PI);
    const diver = standingFigure(g, 1.0, -1.7, { ry: 0, cloth: 0x1b1e22, trousers: 0x1b1e22, vest: 0xf06a2b });
    diver.position.y = 0.47;
    holoTag(diver, "the diver", 0, 1.95, 0, { css: CDDR_CSS, w: 0.2 });
    const standby = standingFigure(g, 2.2, -1.7, { ry: 0.3, cloth: 0x1b1e22, trousers: 0x1b1e22, vest: 0xf06a2b, gloves: 0x2b2b2b });
    standby.position.y = 0.47;
    holoTag(standby, "standby diver", 0, 2.05, 0, { css: CDDR_CSS, w: 0.28 });
    const supervisor = standingFigure(g, -1.0, -0.9, { ry: 0.4, cloth: 0x2b3138, vest: 0xf06a2b, cap: 0x1f3a52 });
    supervisor.position.y = 0.47;
    holoTag(supervisor, "supervisor", 0, 1.95, 0, { css: CDDR_CSS, w: 0.22 });
    const client = standingFigure(g, 3.2, 2.0, { ry: -2.4, cloth: 0x3a4148, vest: 0xf4f8fb, cap: 0xf4f8fb });
    client.position.y = 0.47;
    holoTag(client, "client representative", 0, 1.95, 0, { css: CDDR_CSS, w: 0.4 });
    const clientHome = client.position.clone();
    const raised = ball(standby, 0.06, 0, 1.9, 0.1, 0xd2312b, { emissive: 0xd2312b, ei: 1.0, rough: 0.4, seg: 8, seg2: 6 });
    raised.visible = false;
    for (const x of [-3.5, 3.5]) { cyl(g, 0.1, 0.12, 0.45, x, 0.7, -2.0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 12 }); ball(g, 0.12, x, 0.95, -2.0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10, seg2: 8 }); }
    for (const x of [-3.0, 0.0, 3.0]) cyl(g, 0.12, 0.12, 0.5, x, 0.7, -2.52, 0x1f5fb8, { seg: 10, rough: 0.6 });
    for (let i = 0; i < 4; i++) box(g, 0.34, 0.06, 0.5, 2.8 + i * 0.14, 0.5, -1.4, 0x8a6a2a, { rough: 0.9 });
    const helmetRack = group(g, -3.2, 0.47, -0.8);
    box(helmetRack, 0.9, 0.06, 0.4, 0, 0.9, 0, 0x5b4a3a, { rough: 0.8 });
    for (const x of [-0.3, 0.3]) ball(helmetRack, 0.18, x, 1.1, 0, x < 0 ? 0xf2c14b : 0xd8dde2, { rough: 0.35, metal: 0.4, seg: 14, seg2: 10 });
    for (const [lx, lz] of [[-0.4, -0.15], [0.4, -0.15], [-0.4, 0.15], [0.4, 0.15]]) cyl(helmetRack, 0.022, 0.022, 0.9, lx, 0.45, lz, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 6 });
    holoTag(helmetRack, "helmets — tagged", 0, 1.5, 0, { css: CDDR_CSS, w: 0.32 });

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.8, 1.0, 1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "record-gaps") { blankTimes.material = mat(0x59c97b, { rough: 0.7 }); noSig.material = mat(0x59c97b, { rough: 0.7 }); }
        if (step.id === "logs-in-order") repaint(daily, paperFace("DAILY LOG", ["Dives: written from records", "Events: bight · foul · chamber", "Crew · weather · vessel: in"], { bg: "#e6f6ea", band: "#59c97b" }));
        if (step.id === "copy-times") { repaint(record, paperFace("DIVE RECORD", ["Dive 1: complete · signed", "Dive 2: times from slate", "signed — supervisor"], { bg: "#e6f6ea", band: "#59c97b" })); signedRecord.visible = true; }
        if (step.id === "file-record") { signedRecord.position.set(3.4, 0.5, 1.0); signedRecord.visible = false; fileBox.children[1].position.y = 1.02; }
        if (step.id === "build-timeline") repaint(timeline, (cx, w, h) => { cx.fillStyle = "#f4f8fb"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 8); cx.strokeStyle = "#2b3138"; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(w * 0.08, h * 0.6); cx.lineTo(w * 0.92, h * 0.6); cx.stroke(); cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.fillStyle = "#2b3138"; cx.textAlign = "left"; cx.fillText("TIMELINE — agreed", w * 0.05, h * 0.25); for (let i = 0; i < 6; i++) { cx.fillStyle = "#2f8f5a"; cx.beginPath(); cx.arc(w * (0.12 + i * 0.16), h * 0.6, 8, 0, Math.PI * 2); cx.fill(); } });
        if (step.id === "find-cause") repaint(cause, paperFace("CAUSE", ["Condition: current vs plan", "signal not in brief"], { bg: "#e6f6ea", band: "#59c97b" }));
        if (step.id === "write-action") repaint(action, paperFace("ACTION", ["Amend briefing procedure", "Owner · date · done when"], { bg: "#e6f6ea", band: "#59c97b" }));
        if (step.id === "assessment-record") repaint(assessment, paperFace("DECO ASSESSMENT", ["Tables · as run: recorded", "Symptoms · time · treatment"], { bg: "#e6f6ea", band: "#59c97b" }));
        if (step.id === "post-action") repaint(actionBoard, (cx, w, h) => { cx.fillStyle = "#f4f8fb"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#2f8f5a"; cx.fillRect(0, 0, w, 8); cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`; cx.fillStyle = "#2b3138"; cx.textAlign = "left"; cx.fillText("ACTIONS", w * 0.06, h * 0.25); cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillText("Amend briefing procedure — owner · date", w * 0.06, h * 0.55); cx.fillText("Signals table — brief covers current", w * 0.06, h * 0.75); });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "client-copy") client.position.set(2.2, 0.47, 0.3);
        if (it.id === "raised-voice") { raised.visible = true; standby.position.set(1.7, 0.47, -1.4); }
      },
      onInterruptEnd(it) {
        if (it.id === "client-copy" && it.resolved === "answered") client.position.set(-1.6, 0.47, -0.4);
        if (it.id === "client-copy" && it.resolved !== "answered") client.position.copy(clientHome);
        if (it.id === "raised-voice") { raised.visible = false; if (it.resolved === "answered") standby.position.set(2.2, 0.47, -1.7); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "turn-to-procedure") binderWheel.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        if (raised.visible) raised.scale.setScalar(1 + Math.sin(t * 6) * 0.25);
        void dt;
      },
    };
  },
};
