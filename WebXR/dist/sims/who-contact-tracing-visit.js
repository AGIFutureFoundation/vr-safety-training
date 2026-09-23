import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, mudflatFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Contact Tracing Visit VR — Emergency Services, outbreak
// response. A tracing team's daily follow-up visit to the household of a
// suspected case: the contact list and the follow-up period read before the
// car leaves, the community focal person met before the gate, the interview
// held outdoors at distance, consent asked and not assumed, every contact
// found including the ones missing from the list, temperatures taken without
// touching, a symptomatic contact referred rather than driven, and the day's
// follow-up logged. The pathogen and its follow-up period are whatever the
// case definition says; nothing clinical is stated here beyond that.

const WCT_ACCENT = 0xe0a84a;
const WCT_ALERT = 0xf0645b;

function wctBoard(parent, w, h, x, y, z, title, lines, o = {}) {
  return holoPanel(parent, w, h, x, y, z, (cx, cw, ch) => {
    cx.fillStyle = "rgba(24,18,8,0.92)"; cx.fillRect(0, 0, cw, ch);
    cx.fillStyle = o.css ?? "#e0a84a"; cx.fillRect(0, 0, cw, 6);
    cx.fillStyle = "#fbf0dc"; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.font = `600 ${Math.round(ch * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
    cx.fillText(title, cw * 0.05, ch * 0.13);
    cx.font = `${Math.round(ch * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#ecd9b4";
    lines.forEach((l, i) => cx.fillText(l, cw * 0.05, ch * (0.3 + i * 0.1)));
  }, { ry: o.ry ?? 0, accent: o.accent ?? WCT_ACCENT });
}

export const SIM_WHO_CONTACT_TRACING_VISIT = {
  id: "who-contact-tracing-visit",
  index: "220",
  domain: "Emergency Services",
  trade: "Contact tracer — SEIU and AFSCME public-health staff, NNU/CNA nurses, and the humanitarian workforce deployed under IASC clusters",
  category: "Emergency Services",
  weather: "clear",
  certification: "WHO contact-tracing practice as the national response adopts it — contacts listed, visited and followed up daily for the period the case definition sets; WHO infection prevention and control guidance and CDC isolation precautions for distance, hand hygiene and a non-contact temperature check; OSHA 29 CFR 1910.134 for the respirator the team carries and 29 CFR 1910.1030 for anything that could carry blood; WHO outbreak communication guidance for consent, confidentiality and rumours at the gate; the Sphere Handbook's protection principles and IASC cluster coordination for the Health Cluster partners the team reports to; worked by SEIU and AFSCME public-health staff with NNU/CNA nurses",
  name: "Contact Tracing Visit",
  title: simTitle("Contact Tracing Visit"),
  tagline: "A household follow-up visit: the list and the follow-up period read first, the focal person met at the gate, an outdoor interview at distance, consent asked, every contact found, a symptomatic contact referred and the day logged",
  accent: WCT_ACCENT,
  accentCss: "#e0a84a",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "every-contact", name: "Every Contact", note: "Every household contact found, checked without touching and logged, the case's name kept private and the sick contact referred, not driven" },

  supportLine: "your agency's staff welfare or staff counsellor service, or the peer-support contact named at your deployment briefing",

  game: system({
    name: "Trace Team",
    currency: "TRACE",
    ranks: ["Volunteer Tracer", "Contact Tracer", "Team Lead", "Tracing Supervisor", "Trace Team Certified"],
    badges: [
      { id: "none-missed", name: "None Missed", note: "Every contact found, including the ones not on the list", test: AWARD.stepClean("list-contacts") },
      { id: "trusted", name: "Trusted", note: "No name shared, no rumour repeated, nobody driven, nobody interviewed indoors", test: AWARD.safe },
      { id: "at-distance", name: "At Distance", note: "Interview distance set inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-visit", name: "Clean Visit", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-reading", name: "Steady Reading", note: "Temperature check held without a dropout", test: AWARD.unbroken },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "wct-enter-house": "You ducked into the dark front room to do the interview out of the sun. A follow-up visit is held outdoors, at distance, because a small closed room with a household of contacts is exactly the setting the team is trying to keep people out of — and the tracer who works indoors all day visits a dozen such rooms.",
    "wct-name-case": "You told the neighbour at the fence who the sick person is. Tracing depends on households telling the team the truth about who they saw, and they only do that if they trust their names and their relative's name will not be passed around; a case named at the fence is a family shunned by evening and a street that stops answering the door.",
    "wct-own-vehicle": "You started to put the unwell contact in the team's car to 'save time'. A symptomatic contact is referred through the response's own transport — a dedicated vehicle with a crew in PPE and a vehicle that is disinfected afterwards — not driven in the car the tracing team will use for every other household today.",
    "wct-repeat-rumour": "You repeated the neighbour's rumour to the household so you could 'correct' it. Saying a rumour aloud to people who had not heard it spreads it further; the team answers with what is known, plainly, and passes the rumour to the risk-communication team through the feedback log.",
  },

  lateNotes: {
    "wct-day-wheel": "Turn the follow-up wheel once today's visit is logged; moving it before the card is filed skips a day on paper that was never checked.",
    "wct-thermometer": "Temperatures come after consent and after every contact has been found — checking half a household leaves the other half unchecked.",
  },

  steps: [
    {
      id: "contact-sheet", kind: "select", target: "wct-contact-sheet",
      title: "Read the contact list and the follow-up day",
      cue: "Before you set off, read the household's listed contacts, today's follow-up day and what the case definition says to ask about.",
      why: "A follow-up visit is a check against a list: who was exposed, when, and which day of their follow-up period today is. A tracer who arrives without it checks the people who happen to be in the yard, and the grandmother who was at the funeral and the cousin who has gone back to his own village never get asked.",
    },
    {
      id: "kit-pack", kind: "sequence", anyOrder: true,
      targets: ["wct-kit-handrub", "wct-kit-thermometer", "wct-kit-forms"],
      itemNames: { "wct-kit-handrub": "hand rub", "wct-kit-thermometer": "non-contact thermometer", "wct-kit-forms": "follow-up forms" },
      title: "Pack the visit kit",
      cue: "Hand rub, the non-contact thermometer and the household's follow-up forms — any order, all three.",
      why: "Everything the team needs to do the visit without touching anyone or borrowing anything goes in the bag before the car leaves. A thermometer forgotten becomes a hand on a forehead; forms forgotten become notes on the back of a receipt that never reach the line list.",
    },
    {
      id: "focal-point", kind: "select", target: "wct-community-focal",
      title: "Meet the community focal person first",
      cue: "Greet the community focal person at the lane before you go to the household gate.",
      why: "In most communities a household visit from strangers in response vehicles is noticed by everyone on the street. Arriving with the community focal person — someone the neighbourhood already knows and trusts — changes that visit from an inspection into a check-in, and it is the focal person the household will call if a contact falls ill at night.",
    },
    {
      id: "distance", kind: "gauge", target: "wct-distance-marker",
      title: "Set the interview distance",
      cue: "Step back from the household bench and commit when the marker shows you at the distance your IPC briefing set, outdoors.",
      why: "The interview is held outside, in open air, at the distance the team's infection prevention and control briefing sets, because the tracer will repeat this conversation at every household on the list. Getting that distance right once, at the start, is easier than remembering to step back halfway through a hard conversation.",
      gauge: { label: "DISTANCE", speed: 0.6, green: [0.5, 0.64], readout: (t) => (t < 0.5 ? "too close" : t > 0.64 ? "too far to hear" : "at briefing distance"), missNote: "Not at the briefed distance. Step back or in and commit where the marker says you are at briefing distance." },
    },
    {
      id: "consent", kind: "hold", target: "wct-consent-card", seconds: 5,
      title: "Explain the visit and ask consent",
      cue: "Hold the consent card while you explain who you are, why you visit daily and what happens to their information — and wait for their answer.",
      why: "People who understand why the team comes every day, and who have been asked rather than told, are the people who will say honestly that a child has a fever. Explaining and waiting for a real answer takes a minute; a household that feels processed stops answering the door around day four.",
      holdBreakNote: "You moved on before they answered. Consent is their answer, not your explanation — hold and wait for it.",
    },
    {
      id: "list-contacts", kind: "find", noHint: true,
      targets: ["wct-contact-child", "wct-contact-elder", "wct-contact-visitor"],
      itemNames: { "wct-contact-child": "the youngest child", "wct-contact-elder": "the grandmother", "wct-contact-visitor": "the visiting cousin" },
      itemNotes: {
        "wct-contact-child": "Playing behind the water jars — not on the list, because the first interview only counted adults.",
        "wct-contact-elder": "Resting in the shade by the wall; she cared for the case before anyone knew what it was.",
        "wct-contact-visitor": "Visiting from another village and leaving tomorrow — the one most likely to be lost to follow-up.",
      },
      title: "Find every contact in the household",
      cue: "Look around the compound and find every person who should be on today's follow-up — not just the ones on the sheet.",
      why: "Contact lists are built from a first interview in a frightening moment, and they miss people: children, the person who did the caring, the visitor who is about to leave. Every missed contact is someone who could fall ill without anyone looking for them, so the tracer checks the household as it is, not as the sheet says it is.",
    },
    {
      id: "temp-check", kind: "track", target: "wct-thermometer", seconds: 6,
      title: "Take temperatures without touching",
      cue: "Aim the non-contact thermometer steadily at each forehead from your distance and keep the reading in the band.",
      why: "A non-contact thermometer keeps the tracer's hand off every forehead in every household of the day. It only reads true when it is held steady at the right range, and a reading taken on the move is a number written on a form that means nothing — or worse, a missed fever that reads as normal.",
      track: { start: 0.2, green: [0.4, 0.62], rise: 0.6, fall: 0.5, drift: 0.13, label: "AIM", readout: (v) => (v < 0.4 ? "off target" : v > 0.62 ? "too close" : "steady") },
      holdBreakNote: "The aim drifted. The reading will not be true — steady it back on the forehead from your distance.",
    },
    {
      id: "followup-card", kind: "drag", target: "wct-followup-card",
      title: "Log today's follow-up",
      cue: "Carry each contact's completed card to the household's follow-up sheet on the clipboard.",
      why: "The follow-up sheet is what turns a visit into a record the supervisor can count: who was seen, on which day, with what result. A card left in a pocket is a contact who was checked and still shows up as missed on tonight's line list — and gets visited again tomorrow while someone else does not.",
      drag: { to: "wct-sheet-socket", radius: 0.4, missNote: "Not on the sheet. The card belongs on this household's follow-up sheet, or today's visit never happened on paper." },
    },
    {
      id: "day-wheel", kind: "turn", target: "wct-day-wheel",
      title: "Advance the follow-up wheel",
      cue: "Turn the day wheel on the clipboard one click to the next visit day.",
      why: "The follow-up period ends on a date set by the last exposure, not by when the team got tired of visiting. Advancing the wheel after every logged visit keeps the count honest, so the day a household is released from follow-up is the day the case definition says, and not a day early.",
      turn: { turns: 0.5, axis: "z", label: "DAY WHEEL" },
    },
    {
      id: "hand-hygiene", kind: "select", target: "wct-handrub-after",
      title: "Hand hygiene at the gate",
      cue: "Rub your hands at the gate as you leave the compound — before you touch the car door.",
      why: "The car, the clipboard and the next household are all downstream of your hands at this gate. Hand hygiene on leaving each household is what keeps the tracing team from becoming the route between the houses on the list — a route that runs through every household visited today.",
    },
    {
      id: "report-supervisor", kind: "hold", target: "wct-supervisor-radio", seconds: 4,
      title: "Report to the tracing supervisor",
      cue: "Hold the radio and report: household seen, contacts checked, the new contact found and the referral made — until the supervisor reads it back.",
      holdBreakNote: "You let go before the supervisor read it back. A report nobody confirmed may not reach tomorrow's plan — key up and finish it.",
      why: "The supervisor is building the day's picture from every team, and a new contact or a referral changes tomorrow's plan for the whole area. Reporting from the gate, not at the end of the day, is what gets the new contact onto the list and the referral onto the ambulance crew's route while it still matters.",
    },
    {
      id: "crew-checkin", kind: "select", target: "wct-crew-board",
      title: "Check in with your tracing partner",
      cue: "Before the next household, ask your partner how that visit sat with them, and point to staff care if either of you needs it.",
      why: "Tracers hear frightened households, grief and anger at every gate, and they take it on the chin all day. A minute between households to check in with your partner — and to remind each other that staff care exists and is meant to be used — is what keeps a team kind at house twelve.",
    },
    {
      id: "closing-log", kind: "hold", target: "wct-tracing-log", seconds: 4,
      title: "Close the day's tracing log",
      cue: "Hold the log open and read back the households seen, contacts checked, any missed and any referred before you sign.",
      why: "The tracing log is how the supervisor knows which contacts were actually seen today and which were not reached. Read back before signing, a missed contact stands out on the page and gets tomorrow's first visit; signed without reading, it vanishes into a total.",
      holdBreakNote: "You signed without reading it back. Open the log and read out who was seen, missed and referred before you sign.",
    },
  ],

  interrupts: [
    {
      id: "neighbour-filming",
      kind: "Crowd at the gate",
      after: "consent", delay: 2, seconds: 13,
      alert: "A neighbour has come to the fence, phone up and filming, shouting that the team is bringing the disease to the street.",
      cue: "Bring the community focal person in to speak with him — do not argue from the household bench.",
      target: "wct-community-focal",
      why: "A tracer arguing with a neighbour on camera helps nobody, and the household ends up the subject of the video. The focal person is known on the street and can calm the moment and take the conversation away from the family; the tracer's job is to keep the household's privacy intact and carry on with them.",
      missNote: "The shouting went on and the video went round the neighbourhood by evening, with the household's gate in every frame. The next day the family refused the visit, and two contacts stopped answering the phone.",
      wrongNote: "Not that. Bring the community focal person to the fence to speak with the neighbour.",
    },
    {
      id: "contact-feels-unwell",
      kind: "Symptomatic contact",
      after: "temp-check", delay: 2, seconds: 13,
      alert: "The visiting cousin says quietly that he has felt unwell since last night, and sits down against the wall.",
      cue: "Call the referral line for the response's transport — keep him apart, and do not touch him.",
      target: "wct-referral-phone",
      why: "A contact who develops symptoms moves out of follow-up and into referral: the response's own transport takes him to be assessed, and the household's other contacts carry on being followed. Calling the referral line at once, while keeping him apart from the others and without touching him, is the whole reason the team visits daily.",
      missNote: "The referral was not called. The cousin caught a shared minibus home that afternoon, and the tracing team spent the next week trying to find everyone who had sat beside him.",
      wrongNote: "Not that. Use the referral phone to call the response's transport for him.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, WCT_ACCENT);

    // ---------------------------------------------------------- compound ground
    const ground = box(g, 6.2, 0.06, 5.6, 0, 0.03, 0, 0xffffff, { rough: 0.95 });
    ground.material = texturedMat(
      surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#9a7a54", base2: "#8a6c48", cracks: 40 }), { repeat: 3, px: 512 }),
      { rough: 0.95, metal: 0, color: 0xe2cfb0 },
    );
    // Compound wall and the house.
    for (const [w, x, z, ry] of [[5.6, 0, -2.6, 0], [2.2, -3.0, -1.5, Math.PI / 2], [2.2, 3.0, -1.5, Math.PI / 2]]) {
      const wall = box(g, w, 1.4, 0.18, x, 0.7, z, 0xc8a878, { rough: 0.95 });
      wall.rotation.y = ry;
    }
    const house = group(g, -1.4, 0, -2.0);
    box(house, 2.4, 2.1, 1.0, 0, 1.05, -0.2, 0xd8bc8c, { rough: 0.9 });
    const roof = box(house, 2.7, 0.08, 1.4, 0, 2.2, -0.1, 0x8a8f94, { rough: 0.5, metal: 0.5 });
    roof.rotation.x = -0.12;
    const doorway = box(house, 0.7, 1.6, 0.04, 0.4, 0.8, 0.31, 0x1a140e, { rough: 0.9 });
    holoTag(house, "Interview inside, out of the sun?", 0.4, 1.8, 0.35, { css: "#f0645b", w: 0.5 });
    reg(hits, doorway, "wct-enter-house");
    box(house, 0.5, 0.4, 0.04, -0.6, 1.3, 0.31, 0x3a5a6a, { rough: 0.3 });
    // Shade tree in the courtyard.
    const tree = group(g, 1.9, 0, -1.6);
    cyl(tree, 0.1, 0.14, 1.8, 0, 0.9, 0, 0x6a4a2a, { rough: 0.9, seg: 10 });
    ball(tree, 0.8, 0, 2.1, 0, 0x4a7a3a, { rough: 0.9 });
    ball(tree, 0.55, 0.5, 1.9, 0.2, 0x55853f, { rough: 0.9 });
    // Water jars and a bench.
    for (let i = 0; i < 3; i++) cyl(g, 0.16, 0.12, 0.5, -2.5 + i * 0.36, 0.25, -1.2, 0xa8643a, { rough: 0.8, seg: 12 });
    const bench = group(g, 0.3, 0, -1.3);
    box(bench, 1.4, 0.06, 0.35, 0, 0.42, 0, 0x7a5a3a, { rough: 0.8 });
    for (const lx of [-0.6, 0.6]) box(bench, 0.06, 0.42, 0.3, lx, 0.21, 0, 0x6a4a2a, { rough: 0.8 });

    // ---------------------------------------------------------- the household
    const caseParent = seatedFigure(g, 0.0, 0.46, -1.3, { cloth: 0x6b4a5a, ry: 0 });
    void caseParent;
    const child = standingFigure(g, -2.15, -0.75, { ry: 0.8, cloth: 0x6b8f6a, atStation: true });
    child.scale.set(0.6, 0.6, 0.6);
    reg(hits, child, "wct-contact-child");
    const elder = seatedFigure(g, 2.3, 0.4, -2.1, { cloth: 0x8a6a8a, ry: -0.3 });
    reg(hits, elder.torso, "wct-contact-elder");
    box(g, 0.6, 0.05, 0.4, 2.3, 0.4, -2.1, 0x7a5a3a, { rough: 0.8 });
    const visitor = standingFigure(g, 2.3, -0.4, { ry: -1.2, cloth: 0x3a5a8a, atStation: true });
    const visitorTag = holoTag(visitor, "Unwell", 0, 1.95, 0, { css: "#f0645b", w: 0.2 });
    visitorTag.visible = false;
    reg(hits, visitor, "wct-contact-visitor");
    const waitMat = box(g, 0.8, 0.02, 0.6, 2.4, 0.07, 0.9, 0x3a7a5a, { rough: 0.9 });
    void waitMat;

    // ---------------------------------------------------------- the team's things
    const table = group(g, -0.9, 0, 0.9);
    box(table, 1.1, 0.05, 0.6, 0, 0.72, 0, 0x8a8f94, { rough: 0.5, metal: 0.4 });
    for (const [lx, lz] of [[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]]) cyl(table, 0.015, 0.015, 0.72, lx, 0.36, lz, CITY.darkSteel, { rough: 0.5, seg: 6 });
    const sheet = wctBoard(g, 0.7, 0.5, -2.2, 1.3, 1.0, "CONTACT LIST — HH 14", [
      "Case: suspected (code only)", "Listed: 4 adults", "Follow-up: day 6 of the period", "Ask: symptoms per case definition",
    ], { ry: Math.PI / 3 });
    reg(hits, sheet, "wct-contact-sheet");
    const kits = [["wct-kit-handrub", -1.3, 0xe8eef2, "Hand rub"], ["wct-kit-thermometer", -0.9, 0x3a4148, "Thermometer"], ["wct-kit-forms", -0.5, 0xf2efe6, "Forms"]];
    for (const [id, x, color, label] of kits) {
      const k = group(g, x, 0.75, 0.8);
      box(k, 0.12, id === "wct-kit-forms" ? 0.02 : 0.14, 0.1, 0, id === "wct-kit-forms" ? 0.01 : 0.07, 0, color, { rough: 0.5 });
      holoTag(k, label, 0, 0.24, 0, { css: "#e0a84a", w: 0.22 });
      reg(hits, k, id);
    }
    const clip = group(g, -0.9, 0.75, 1.05);
    box(clip, 0.26, 0.015, 0.34, 0, 0, 0, 0x6a4a2a, { rough: 0.7 });
    decal(clip, 0.22, 0.28, 0, 0.009, 0, paperFace("FOLLOW-UP HH 14", ["Day 6", "Seen / temp / symptoms", "Referred?"], { band: "#8a5a1a" }), { px: 256 }).rotation.x = -Math.PI / 2;
    const sheetSocket = box(clip, 0.24, 0.02, 0.3, 0, 0.02, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["wct-sheet-socket"] = sheetSocket;
    const wheel = cyl(clip, 0.06, 0.06, 0.02, 0.18, 0.02, -0.1, WCT_ACCENT, { rough: 0.5, seg: 16 });
    holoTag(clip, "Day wheel", 0.18, 0.12, -0.1, { css: "#e0a84a", w: 0.2 });
    reg(hits, wheel, "wct-day-wheel");
    const card = group(g, 0.1, 0.46, -0.9);
    box(card, 0.14, 0.01, 0.1, 0, 0, 0, 0xf2efe6, { rough: 0.8 });
    holoTag(card, "Follow-up card", 0, 0.1, 0, { css: "#e0a84a", w: 0.26 });
    reg(hits, card, "wct-followup-card");
    const consent = group(g, 0.7, 0.46, -1.0);
    box(consent, 0.18, 0.01, 0.12, 0, 0, 0, 0xe8e0c8, { rough: 0.8 });
    holoTag(consent, "Consent card", 0, 0.1, 0, { css: "#e0a84a", w: 0.24 });
    reg(hits, consent, "wct-consent-card");
    const thermo = instrument(g, 0.6, 1.0, 0.2, { idle: "-- °C", color: WCT_ACCENT, w: 0.12, d: 0.18, ry: Math.PI });
    holoTag(thermo, "Non-contact thermometer", 0, 0.14, 0, { css: "#e0a84a", w: 0.36 });
    reg(hits, thermo, "wct-thermometer");
    // Distance marker: a staked line on the ground.
    const marker = group(g, 0.35, 0, -0.1);
    for (let i = 0; i < 4; i++) box(marker, 0.06, 0.005, 0.22, 0, 0.065, -i * 0.28, 0xf2f2ee, { rough: 0.5, cast: false });
    cyl(marker, 0.02, 0.02, 0.9, 0.2, 0.45, 0, 0xe0a84a, { rough: 0.5, seg: 6 });
    const markerFlag = box(marker, 0.16, 0.1, 0.01, 0.28, 0.85, 0, 0xe0a84a, { rough: 0.6 });
    holoTag(marker, "Distance marker", 0.2, 1.05, 0, { css: "#e0a84a", w: 0.28 });
    reg(hits, markerFlag, "wct-distance-marker");

    // Gate: hand rub, radio, referral phone, the team car.
    const gate = group(g, 1.2, 0, 2.1);
    for (const gx of [-0.7, 0.7]) box(gate, 0.2, 1.6, 0.2, gx, 0.8, 0, 0xb89868, { rough: 0.9 });
    const rubStand = group(gate, -0.4, 0, 0.3);
    cyl(rubStand, 0.02, 0.02, 1.0, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, seg: 6 });
    const rubBottle = box(rubStand, 0.1, 0.16, 0.08, 0, 1.08, 0, 0xe8eef2, { rough: 0.4 });
    holoTag(rubStand, "Hand rub", 0, 1.3, 0, { css: "#e0a84a", w: 0.2 });
    reg(hits, rubBottle, "wct-handrub-after");
    const radio = group(g, -0.2, 0.75, 0.75);
    box(radio, 0.07, 0.16, 0.04, 0, 0.08, 0, 0x22282c, { rough: 0.5 });
    holoTag(radio, "Supervisor radio", 0, 0.24, 0, { css: "#e0a84a", w: 0.28 });
    reg(hits, radio, "wct-supervisor-radio");
    const phone = group(g, -1.35, 0.75, 1.05);
    box(phone, 0.07, 0.01, 0.14, 0, 0.005, 0, 0x111418, { rough: 0.3 });
    const phoneLamp = ball(phone, 0.012, 0, 0.02, -0.05, WCT_ALERT, { emissive: WCT_ALERT, ei: 2.4, rough: 0.4 });
    phoneLamp.visible = false;
    holoTag(phone, "Referral line", 0, 0.12, 0, { css: "#e0a84a", w: 0.24 });
    reg(hits, phone, "wct-referral-phone");
    const car = group(g, 3.1, 0, 2.2, -0.3);
    box(car, 1.8, 0.7, 0.9, 0, 0.55, 0, 0xf4f6f5, { rough: 0.4, metal: 0.3 });
    box(car, 1.0, 0.5, 0.86, -0.1, 1.1, 0, 0xe8eef2, { rough: 0.3, metal: 0.3 });
    box(car, 0.9, 0.4, 0.88, -0.1, 1.12, 0, 0x6a8a9a, { rough: 0.1, opacity: 0.6, transparent: true });
    for (const [wx, wz] of [[-0.6, -0.46], [0.6, -0.46], [-0.6, 0.46], [0.6, 0.46]]) cyl(car, 0.2, 0.2, 0.12, wx, 0.2, wz, 0x1a1a1a, { rough: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    decal(car, 0.5, 0.16, 0, 0.6, 0.46, signFace("TRACING TEAM", { bg: "#f4f6f5", accent: "#e0a84a", fg: "#1d262e", scale: 0.4 }), { px: 160 });
    const carDoor = box(car, 0.5, 0.5, 0.02, 0.2, 0.6, -0.47, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(car, "Drive him ourselves?", 0.2, 1.5, -0.3, { css: "#f0645b", w: 0.36 });
    reg(hits, carDoor, "wct-own-vehicle");

    // People at the edges: focal person, the neighbour at the fence, partner.
    const focal = standingFigure(g, -0.6, 2.2, { ry: Math.PI, cloth: 0x2f6a5a, vest: WCT_ACCENT });
    holoTag(focal, "Community focal person", 0, 1.95, 0, { css: "#e0a84a", w: 0.4 });
    reg(hits, focal, "wct-community-focal");
    const neighbour = standingFigure(g, -2.6, 0.4, { ry: 1.2, cloth: 0x8a3a2a, atStation: true });
    const phoneUp = box(neighbour, 0.07, 0.13, 0.01, 0.15, 1.5, 0.2, 0x111418, { rough: 0.3 });
    phoneUp.visible = false;
    const rumourTag = holoTag(g, "\"Tell them it spreads by...\"", -2.6, 2.05, 0.4, { css: "#f0645b", w: 0.44 });
    reg(hits, rumourTag, "wct-repeat-rumour");
    const nameTag = box(g, 0.3, 0.3, 0.3, -2.3, 1.3, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "\"Who is sick in there?\"", -2.3, 1.75, 0.2, { css: "#f0645b", w: 0.4 });
    reg(hits, nameTag, "wct-name-case");
    const crewBoard = wctBoard(g, 0.6, 0.4, 2.2, 1.4, 1.6, "PARTNER CHECK-IN", ["How did that one sit?", "Staff care is there to use", "Water, shade, next house"], { ry: -Math.PI / 3, accent: 0x7fd1c9, css: "#7fd1c9" });
    reg(hits, crewBoard, "wct-crew-board");
    const tracingLog = wctBoard(g, 0.55, 0.4, 0.8, 1.4, 2.35, "TRACING LOG", ["Households seen", "Contacts: seen / missed", "Referred"], { ry: Math.PI });
    reg(hits, tracingLog, "wct-tracing-log");

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.0, -1.2),

      onStepComplete(step) {
        if (step.id === "kit-pack") for (const [id] of kits) hits[id].visible = false;
        if (step.id === "followup-card") { card.position.set(-0.9, 0.78, 1.05); }
        if (step.id === "day-wheel") repaint(tracingLog.userData.face, paperFace("TRACING LOG", ["HH 14: day 7 next", "Contacts: 5 seen, 0 missed", "Referred: 1"], { band: "#8a5a1a" }));
        if (step.id === "closing-log") repaint(tracingLog.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(24,18,8,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("LOG SIGNED", w / 2, h / 2);
        });
      },

      onInterrupt(it) {
        if (it.id === "neighbour-filming") { phoneUp.visible = true; neighbour.position.set(-2.0, 0, 0.9); }
        if (it.id === "contact-feels-unwell") { visitorTag.visible = true; visitor.position.set(2.4, 0, 0.9); phoneLamp.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "neighbour-filming") { phoneUp.visible = false; neighbour.position.set(-2.6, 0, 0.4); focal.position.set(-1.6, 0, 1.4); }
        if (it.id === "contact-feels-unwell") { phoneLamp.visible = false; }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const step = session?.step;
        if (phoneLamp.visible && phoneLamp.material) phoneLamp.material.emissiveIntensity = 1.6 + Math.sin(t * 10) * 1.2;
        if (session?.turn && step?.id === "day-wheel") wheel.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "distance") markerFlag.position.z = -gg.t * 0.8;
        const tr = session?.track;
        if (tr && step?.id === "temp-check") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          repaint(thermo.userData.screen, signFace(ok ? "READING" : "AIM", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f2c14b", fg: "#eafcf9", scale: 0.55 }));
        }
      },
    };
  },
};
