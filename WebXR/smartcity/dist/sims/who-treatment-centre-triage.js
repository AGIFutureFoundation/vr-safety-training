import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, valveWheel,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Treatment Centre Triage VR — Emergency Services, outbreak
// response. The screening point at the gate of a treatment centre: the
// screening questions and case definition posted where the screener can read
// them, a table that keeps distance between screener and arrival, a working
// hand-wash station, queue markers, a non-contact temperature scan, the
// questions asked in order, suspected cases picked out and sent by their own
// path rather than through the general waiting area, the red zone called
// ahead, and the register kept. "A suspected case" of "the outbreak pathogen"
// throughout; the clinical criteria are the case definition's, not this file's.

const WTT_ACCENT = 0xd9785a;
const WTT_ALERT = 0xf0645b;

function wttBoard(parent, w, h, x, y, z, title, lines, o = {}) {
  return holoPanel(parent, w, h, x, y, z, (cx, cw, ch) => {
    cx.fillStyle = "rgba(24,12,8,0.92)"; cx.fillRect(0, 0, cw, ch);
    cx.fillStyle = o.css ?? "#d9785a"; cx.fillRect(0, 0, cw, 6);
    cx.fillStyle = "#fbece4"; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.font = `600 ${Math.round(ch * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
    cx.fillText(title, cw * 0.05, ch * 0.13);
    cx.font = `${Math.round(ch * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#ecd2c6";
    lines.forEach((l, i) => cx.fillText(l, cw * 0.05, ch * (0.3 + i * 0.1)));
  }, { ry: o.ry ?? 0, accent: o.accent ?? WTT_ACCENT });
}

export const SIM_WHO_TREATMENT_CENTRE_TRIAGE = {
  id: "who-treatment-centre-triage",
  index: "221",
  domain: "Emergency Services",
  trade: "Screening and triage nurse — NNU/CNA nurses, SEIU and AFSCME public-health staff, and the humanitarian workforce deployed under IASC clusters",
  category: "Emergency Services",
  weather: "overcast",
  certification: "WHO infection prevention and control guidance for screening and triage at the entrance of a treatment centre — a posted case definition, distance at the screening point, hand hygiene for every arrival and a separate path for suspected cases; CDC isolation precautions for the screener's precautions and the separation of suspected patients; OSHA 29 CFR 1910.1030 and 29 CFR 1910.134 for the screener's gloves, gown and respirator; WHO outbreak communication guidance for what is said to a frightened family at the gate; the Sphere Handbook's health standards and IASC cluster coordination for the Health Cluster partners who run a centre's gate together; worked by NNU/CNA nurses with SEIU and AFSCME public-health staff",
  name: "Treatment Centre Triage",
  title: simTitle("Treatment Centre Triage"),
  tagline: "The screening point at a treatment centre's gate: the case definition posted, a table at distance, hand washing for every arrival, a touch-free scan, questions in order, suspected cases sent by their own path, the red zone called ahead",
  accent: WTT_ACCENT,
  accentCss: "#d9785a",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "gate-held", name: "Gate Held", note: "Every arrival screened at distance, every suspected case sent by its own path, and nobody walked through the waiting area who should not have been" },

  supportLine: "your agency's staff welfare or staff counsellor service, or the peer-support contact named at your deployment briefing",

  game: system({
    name: "Gate Screening",
    currency: "SCREEN",
    ranks: ["Gate Volunteer", "Screener", "Triage Nurse", "Gate Lead", "Gate Screening Certified"],
    badges: [
      { id: "right-path", name: "Right Path", note: "Every suspected case picked out and routed first time", test: AWARD.stepClean("identify-suspected") },
      { id: "hands-off", name: "Hands Off", note: "No bare-hand forehead, no shared pen, no shortcut through the waiting area, no neat concentrate", test: AWARD.safe },
      { id: "queue-set", name: "Queue Set", note: "Queue spacing committed inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-gate", name: "Clean Gate", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-scan", name: "Steady Scan", note: "Held the temperature scan without a dropout", test: AWARD.unbroken },
      { id: "gate-fast", name: "Gate Fast", note: "Finished inside 85% of par", test: AWARD.fast(0.85) },
    ],
  }),

  hazards: {
    "wtt-hand-forehead": "You reached across the table to feel the arrival's forehead with your hand. The screening point exists so that the first contact with every arrival is touch-free: a hand on a forehead is contact with a possible case before anyone knows which ones are, repeated for everyone in the queue.",
    "wtt-shared-pen": "You passed the same pen from arrival to arrival to sign the register. A shared pen at a screening point is a surface every arrival touches in turn, including the ones about to be identified as suspected cases; the screener writes, or each arrival gets a pen that is not handed back.",
    "wtt-general-waiting": "You started walking the suspected case through the general waiting area because it was quicker. A suspected case goes by the separate path to the suspected-case area, so that people who came in with something else entirely do not spend the next hour sitting beside them.",
    "wtt-concentrate-topup": "You topped up the hand-wash bucket straight from the chlorine concentrate. The concentrate is diluted to the strength on the mixing chart before it goes anywhere near hands — neat or guessed, it burns the skin of everyone who washes, and people with burnt hands stop washing.",
  },

  lateNotes: {
    "wtt-radio": "Call the red zone once a suspected case has been identified and routed — there is nothing to hand over before that.",
    "wtt-handwash-tap": "Check the hand-wash station once the table is set; arrivals wash before they reach the screener.",
  },

  steps: [
    {
      id: "screening-board", kind: "select", target: "wtt-screening-board",
      title: "Read the screening questions and case definition",
      cue: "Read today's screening questions and the case definition posted at the gate before the first arrival.",
      why: "Every decision at the gate is a comparison between what an arrival says and a written definition. Reading today's version first means the screener asks the questions the definition turns on and sorts people by it, rather than by how sick someone looks from across a table — which is the wrong test for the people who most need picking out early.",
    },
    {
      id: "set-barrier", kind: "drag", target: "wtt-barrier-table",
      title: "Set the screening table at distance",
      cue: "Move the screening table onto its marks so the table itself holds the distance between you and each arrival.",
      why: "Distance at a screening point is held by furniture, not by willpower: after a hundred arrivals, people lean in to hear. A table placed on the marks keeps the screener at the distance the infection prevention and control plan sets for the whole shift, whoever is standing on the other side and however quietly they speak.",
      drag: { to: "wtt-barrier-socket", radius: 0.5, missNote: "Not on the marks. The table has to hold the distance on its own, all shift." },
    },
    {
      id: "handwash-tap", kind: "turn", target: "wtt-handwash-tap",
      title: "Check the hand-wash station runs",
      cue: "Turn the tap on the gate's hand-wash station and check it runs clean into the basin.",
      why: "Every arrival washes before reaching the screener, which only happens if the station at the gate actually runs. A tap that sticks or a bucket that is empty turns the first control point into a queue that skips it, and nobody at the table notices until the end of the day.",
      turn: { turns: 0.5, axis: "z", label: "TAP" },
    },
    {
      id: "queue-spacing", kind: "gauge", target: "wtt-queue-marker",
      title: "Set the queue markers",
      cue: "Sweep the marker spacing and commit when it matches the spacing on the gate plan.",
      why: "People queueing at a treatment centre gate are frightened and often unwell, and they close up on each other. Markers on the ground at the plan's spacing give everyone a place to stand that keeps them apart without a volunteer having to police the line — and keeps a suspected case from spending twenty minutes shoulder to shoulder with the rest.",
      gauge: { label: "QUEUE GAP", speed: 0.6, green: [0.48, 0.6], readout: (t) => (t < 0.48 ? "tighter than plan" : t > 0.6 ? "past the fence" : "on plan"), missNote: "Not the plan's spacing. Sweep again and commit where the markers sit on plan." },
    },
    {
      id: "temp-scan", kind: "track", target: "wtt-ir-thermometer", seconds: 6,
      title: "Scan temperature without touching",
      cue: "Hold the non-contact thermometer steady on the arrival's forehead from across the table.",
      why: "A temperature is one of the things a case definition may ask about, and the scan is the only part of screening done to the arrival rather than asked of them. It reads true only held steady at the right range; a scan swept past someone on the move is a number with no meaning written in the register.",
      track: { start: 0.2, green: [0.4, 0.62], rise: 0.6, fall: 0.5, drift: 0.13, label: "SCAN", readout: (v) => (v < 0.4 ? "off target" : v > 0.62 ? "too close" : "steady") },
      holdBreakNote: "The scan drifted off. Bring it back to the forehead and hold steady from your side of the table.",
    },
    {
      id: "screening-questions", kind: "sequence",
      targets: ["wtt-q-symptoms", "wtt-q-contact", "wtt-q-onset"],
      itemNames: { "wtt-q-symptoms": "symptoms now", "wtt-q-contact": "contact with a sick person or a funeral", "wtt-q-onset": "when it started" },
      title: "Ask the screening questions in order",
      cue: "Symptoms now, then any contact with a sick person or a funeral, then when it started.",
      why: "The order mirrors the case definition's logic: what the person has now, whether there is a link to a known case, and whether the timing fits. Asked in that order, each answer tells the screener whether the next question matters, and the arrival is not interrogated about funerals before anyone has asked how they are.",
      outOfOrderNote: "Symptoms, then contact, then onset — how they are first, then the link, then the timing.",
    },
    {
      id: "identify-suspected", kind: "find", noHint: true,
      targets: ["wtt-arrival-a", "wtt-arrival-b"],
      itemNames: { "wtt-arrival-a": "the man with the cloth", "wtt-arrival-b": "the woman leaning on the post" },
      itemNotes: {
        "wtt-arrival-a": "His answers meet the definition: symptoms now, and he nursed a relative who died last week.",
        "wtt-arrival-b": "Her answers meet it too: symptoms since yesterday and a neighbour's funeral she helped at.",
      },
      title: "Pick out the suspected cases",
      cue: "From the screened arrivals, pick out every one whose answers meet the suspected-case definition.",
      why: "The whole gate exists for this sort: people whose answers meet the definition go one way, and everyone else goes another. Missing one sends a possible case into the general waiting area; picking out someone who does not meet it sends a frightened person into the suspected area for nothing. The definition decides, not the queue's impatience.",
    },
    {
      id: "route-suspected", kind: "select", target: "wtt-suspected-entrance",
      title: "Send them by the suspected-case path",
      cue: "Direct each suspected case to the separate path marked for the suspected-case area.",
      why: "A separate path from the gate to the suspected-case area is the design that keeps people who came in for a broken arm or a pregnancy check out of contact with possible cases. Using it every time, even when the general route is shorter, is what the path is for.",
    },
    {
      id: "call-red-zone", kind: "hold", target: "wtt-radio", seconds: 5,
      title: "Call the suspected-case area ahead",
      cue: "Hold the radio and hand over each suspected case to the team inside until they read it back.",
      why: "The team inside needs to be gowned and ready at the door when a suspected case arrives, not searching for PPE while the patient waits in the open. A handover read back over the radio puts a gowned nurse at the right door and a bed ready for them, and it tells the centre how many are on the way.",
      holdBreakNote: "You let go before the handover was read back. The team inside may not be ready at the door — key up and finish it.",
    },
    {
      id: "wipe-table", kind: "select", target: "wtt-wipe-bottle",
      title: "Wipe the table between arrivals",
      cue: "Wipe the table edge and the register tray with the disinfectant before the next arrival steps up.",
      why: "Every arrival leans on the same table edge and pushes papers across the same tray. Wiping them between arrivals is a few seconds against a surface shared by everybody the gate sees in a day, including the suspected cases just routed away.",
    },
    {
      id: "register", kind: "sequence", anyOrder: true,
      targets: ["wtt-reg-time", "wtt-reg-result", "wtt-reg-route"],
      itemNames: { "wtt-reg-time": "arrival time", "wtt-reg-result": "screening result", "wtt-reg-route": "where they were sent" },
      title: "Complete the screening register",
      cue: "Write the arrival time, the screening result and where each person was sent — the screener writes, any order.",
      why: "The register is what lets surveillance count how many people were screened and how many met the definition, and what lets tracing find everyone who was at the gate at the same time as a case later confirmed. The screener fills it in so nobody else has to touch the pen or the page.",
    },
    {
      id: "crew-checkin", kind: "select", target: "wtt-crew-board",
      title: "Check in with the gate team",
      cue: "At the rotation, check in with the gate team on how the shift is going and point anyone who needs it to staff care.",
      why: "The gate is where staff meet every frightened family and turn some of them away from the entrance they wanted. It wears people down. Checking in at the rotation, and reminding each other that staff care exists and is meant to be used, is part of keeping a steady screener at the table tomorrow.",
    },
    {
      id: "closing-log", kind: "hold", target: "wtt-gate-log", seconds: 4,
      title: "Close the gate log",
      cue: "Hold the gate log open and read back the numbers screened, suspected, routed and any incident before you sign.",
      why: "The gate log hands the next screener the state of the gate: what was seen, what was routed, what went wrong. Read back before signing, a number that does not add up is caught while the people who can explain it are still here; signed unread, it becomes a question nobody can answer next week.",
      holdBreakNote: "You signed without reading the numbers back. Open it again and read them out before signing.",
    },
  ],

  interrupts: [
    {
      id: "ambulance-at-gate",
      kind: "Ambulance arrival",
      after: "temp-scan", delay: 2, seconds: 13,
      alert: "An ambulance pulls up at the gate with a collapsed patient on the stretcher, and the crew is heading for the general entrance.",
      cue: "Direct the crew to the suspected-case ambulance bay — not the general entrance.",
      target: "wtt-ambulance-bay",
      why: "A patient arriving by ambulance is screened by the same logic, and a collapsed patient cannot answer the questions. Until someone has shown otherwise they go to the suspected-case bay, where staff in PPE receive them, rather than being wheeled through the general entrance by a crew nobody has briefed.",
      missNote: "The crew wheeled the patient through the general entrance and down the corridor past the waiting area. The patient met the definition, and everyone in that corridor became a contact to be traced.",
      wrongNote: "Not that. Wave the crew to the suspected-case ambulance bay.",
    },
    {
      id: "family-follows",
      kind: "Family at the path",
      after: "call-red-zone", delay: 2, seconds: 13,
      alert: "The suspected case's wife has followed him to the start of the suspected-case path and is refusing to let go of his arm.",
      cue: "Take her gently to the family waiting area, where she can see the path and be told what happens next.",
      target: "wtt-family-area",
      why: "Families are the people who will be traced, informed and supported later, and they are also the people who will stop bringing their relatives if the gate treats them roughly. Walking her to the family area — with a seat, a view of the path and someone to explain what happens — keeps her safe and keeps the family's trust.",
      missNote: "Nobody took her aside. She followed him down the path and into the suspected-case area without PPE, and the centre spent the evening finding her a place in follow-up instead of supporting her.",
      wrongNote: "Not that. The family waiting area is by the fence — take her there.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, WTT_ACCENT);

    // ---------------------------------------------------------- ground and fence
    const ground = box(g, 6.2, 0.06, 5.6, 0, 0.03, 0, 0xffffff, { rough: 0.9 });
    ground.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#8a8474", base2: "#7c7768", seam: "rgba(40,36,28,0.4)" }), { repeat: 3, px: 512 }),
      { rough: 0.9, metal: 0, color: 0xd8d2c0 },
    );
    for (let i = 0; i < 9; i++) cyl(g, 0.04, 0.04, 1.8, -3.0 + i * 0.75, 0.9, -2.6, 0x8a8f94, { rough: 0.5, metal: 0.5, seg: 6 });
    box(g, 6.0, 1.4, 0.02, 0, 0.9, -2.6, 0xd8dcd6, { rough: 0.8, opacity: 0.55, transparent: true });

    // Tent over the screening area.
    const tent = group(g, -0.2, 0, -0.9);
    for (const [px, pz] of [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]]) cyl(tent, 0.03, 0.03, 2.2, px, 1.1, pz, 0x8a8f94, { rough: 0.5, metal: 0.5, seg: 6 });
    const r1 = box(tent, 2.8, 0.03, 1.0, 0, 2.35, -0.45, 0xf4f6f5, { rough: 0.8 });
    r1.rotation.x = 0.35;
    const r2 = box(tent, 2.8, 0.03, 1.0, 0, 2.35, 0.45, 0xf4f6f5, { rough: 0.8 });
    r2.rotation.x = -0.35;
    decal(tent, 0.9, 0.2, 0, 2.05, 0.82, signFace("SCREENING POINT", { bg: "#2a140e", accent: "#d9785a", scale: 0.45 }), { px: 256 });

    // Screening board.
    const board = wttBoard(g, 0.9, 0.6, -2.2, 1.5, -1.6, "SCREENING — TODAY", [
      "1 Symptoms now?", "2 Contact with a sick person or funeral?", "3 When did it start?",
      "Meets the definition → suspected path", "Case definition sheet: v.today",
    ], { ry: Math.PI / 4 });
    reg(hits, board, "wtt-screening-board");

    // ---------------------------------------------------------- screening table
    const table = group(g, -0.9, 0, 0.1);
    box(table, 1.2, 0.05, 0.6, 0, 0.74, 0, 0xdadfe2, { rough: 0.5 });
    for (const [lx, lz] of [[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]]) cyl(table, 0.015, 0.015, 0.74, lx, 0.37, lz, CITY.darkSteel, { rough: 0.5, seg: 6 });
    holoTag(table, "Screening table", 0, 1.0, 0, { css: "#d9785a", w: 0.3 });
    reg(hits, table, "wtt-barrier-table");
    const marks = group(g, -0.2, 0.065, -0.6);
    for (const [mx, mz] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) box(marks, 0.12, 0.004, 0.12, mx, 0, mz, 0xd9785a, { emissive: 0xd9785a, ei: 0.3, rough: 0.5, cast: false });
    const socket = box(marks, 1.2, 0.02, 0.6, 0, 0.01, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["wtt-barrier-socket"] = socket;
    // Question cards, register columns, thermometer, radio, wipes — on a side cart.
    const cart = group(g, -1.9, 0, -0.5);
    box(cart, 0.7, 0.05, 0.5, 0, 0.8, 0, 0xc9d0d4, { rough: 0.5 });
    box(cart, 0.7, 0.05, 0.5, 0, 0.35, 0, 0xc9d0d4, { rough: 0.5 });
    for (const [lx, lz] of [[-0.32, -0.22], [0.32, -0.22], [-0.32, 0.22], [0.32, 0.22]]) cyl(cart, 0.012, 0.012, 0.8, lx, 0.4, lz, CITY.steel, { rough: 0.4, metal: 0.7, seg: 6 });
    for (const [id, label, x] of [["wtt-q-symptoms", "1 SYMPTOMS", -0.22], ["wtt-q-contact", "2 CONTACT", 0], ["wtt-q-onset", "3 ONSET", 0.22]]) {
      const c = decal(cart, 0.2, 0.12, x, 0.83, -0.1, signFace(label, { bg: "#1c0e0a", accent: "#d9785a", scale: 0.42 }), { px: 128 });
      c.rotation.x = -Math.PI / 2;
      reg(hits, c, id);
    }
    for (const [id, label, x] of [["wtt-reg-time", "TIME", -0.22], ["wtt-reg-result", "RESULT", 0], ["wtt-reg-route", "ROUTE", 0.22]]) {
      const c = decal(cart, 0.2, 0.1, x, 0.83, 0.12, signFace(label, { bg: "#f2efe6", accent: "#8a3a1a", fg: "#1d262e", scale: 0.42 }), { px: 128 });
      c.rotation.x = -Math.PI / 2;
      reg(hits, c, id);
    }
    const thermo = instrument(table, 0.25, 0.78, 0.05, { idle: "-- °C", color: WTT_ACCENT, w: 0.12, d: 0.18 });
    holoTag(thermo, "Non-contact thermometer", 0, 0.14, 0, { css: "#d9785a", w: 0.36 });
    reg(hits, thermo, "wtt-ir-thermometer");
    const radio = group(table, -0.4, 0.77, 0.1);
    box(radio, 0.07, 0.16, 0.04, 0, 0.08, 0, 0x22282c, { rough: 0.5 });
    holoTag(radio, "Radio to inside", 0, 0.24, 0, { css: "#d9785a", w: 0.26 });
    reg(hits, radio, "wtt-radio");
    const wipes = group(table, -0.15, 0.77, 0.2);
    cyl(wipes, 0.04, 0.04, 0.16, 0, 0.08, 0, 0xe8eef2, { rough: 0.4, seg: 10 });
    holoTag(wipes, "Disinfectant wipes", 0, 0.24, 0, { css: "#d9785a", w: 0.3 });
    reg(hits, wipes, "wtt-wipe-bottle");
    const pen = group(table, 0.5, 0.77, 0.2);
    cyl(pen, 0.006, 0.006, 0.14, 0, 0.01, 0, 0x2a4a9a, { rough: 0.4, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(pen, "Pass the pen along?", 0, 0.12, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, pen, "wtt-shared-pen");
    const screener = standingFigure(g, -0.2, -1.3, { ry: 0, cloth: 0x7fb8d8, vest: 0x7fb8d8, atStation: true });
    void screener;
    const handTrap = box(g, 0.2, 0.2, 0.2, 0.3, 1.45, -0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Feel the forehead?", 0.3, 1.7, -0.1, { css: "#f0645b", w: 0.32 });
    reg(hits, handTrap, "wtt-hand-forehead");

    // ---------------------------------------------------------- hand-wash station
    const hw = group(g, 1.8, 0, 1.6);
    box(hw, 0.5, 0.8, 0.5, 0, 0.4, 0, 0x6a7a8a, { rough: 0.6 });
    cyl(hw, 0.2, 0.18, 0.45, 0, 1.03, 0, 0x3a7ab8, { rough: 0.5, seg: 14 });
    cyl(hw, 0.18, 0.12, 0.08, 0, 0.84, 0.35, 0xe8eef2, { rough: 0.4, seg: 14 });
    const tap = valveWheel(hw, 0, 0.9, 0.22, { color: 0xd9785a, body: 0x5a3a2a, r: 0.05 });
    holoTag(hw, "Hand-wash station", 0, 1.45, 0, { css: "#d9785a", w: 0.3 });
    reg(hits, tap, "wtt-handwash-tap");
    const flow = box(hw, 0.02, 0.1, 0.02, 0, 0.84, 0.28, 0x7fb8d8, { rough: 0.1, opacity: 0.7, transparent: true, cast: false });
    flow.visible = false;
    const conc = group(g, 2.35, 0, 1.1);
    box(conc, 0.22, 0.36, 0.16, 0, 0.18, 0, 0xf2f2ee, { rough: 0.5 });
    decal(conc, 0.18, 0.1, 0, 0.25, 0.085, signFace("CONCENTRATE", { bg: "#f2c14b", accent: "#1a1a1a", fg: "#1a1a1a", scale: 0.35 }), { px: 128 });
    holoTag(conc, "Top up straight from this?", 0, 0.52, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, conc, "wtt-concentrate-topup");

    // ---------------------------------------------------------- queue and arrivals
    const queueMarker = group(g, 0.9, 0.065, 1.4);
    const qMarks = [];
    for (let i = 0; i < 4; i++) qMarks.push(box(queueMarker, 0.3, 0.004, 0.08, 0, 0, i * 0.4, 0xf2f2ee, { rough: 0.5, cast: false }));
    const qFlag = box(queueMarker, 0.12, 0.3, 0.02, 0.25, 0.15, 0, 0xd9785a, { rough: 0.6 });
    holoTag(queueMarker, "Queue markers", 0.25, 0.45, 0, { css: "#d9785a", w: 0.26 });
    reg(hits, qFlag, "wtt-queue-marker");
    const arrivalA = standingFigure(g, 0.2, 1.0, { ry: Math.PI + 0.3, cloth: 0x6a5a3a, atStation: true });
    box(arrivalA, 0.2, 0.12, 0.02, 0.18, 1.1, 0.15, 0xe8e0c8, { rough: 0.8 });
    reg(hits, arrivalA, "wtt-arrival-a");
    const arrivalB = standingFigure(g, 0.6, 2.35, { ry: Math.PI, cloth: 0x8a4a6a, atStation: true });
    cyl(g, 0.05, 0.05, 1.6, 0.9, 0.8, 2.3, 0x8a6a4a, { rough: 0.8, seg: 8 });
    reg(hits, arrivalB, "wtt-arrival-b");
    standingFigure(g, 1.45, 2.4, { ry: Math.PI, cloth: 0x3a6a8a, atStation: true });

    // ---------------------------------------------------------- the two paths
    const suspPath = group(g, 1.9, 0, -1.3);
    box(suspPath, 0.8, 0.01, 1.6, 0, 0.065, 0, 0xf0645b, { rough: 0.6, opacity: 0.45, transparent: true, cast: false });
    const suspSign = decal(suspPath, 0.5, 0.2, 0, 1.5, -0.8, signFace("SUSPECTED CASES →", { bg: "#2a1416", accent: "#f0645b", scale: 0.36 }), { px: 256 });
    cyl(suspPath, 0.03, 0.03, 1.5, 0, 0.75, -0.82, 0x8a8f94, { rough: 0.5, seg: 6 });
    reg(hits, suspSign, "wtt-suspected-entrance");
    const genPath = group(g, -2.4, 0, 1.4);
    box(genPath, 0.8, 0.01, 1.2, 0, 0.065, 0, 0x59c97b, { rough: 0.6, opacity: 0.4, transparent: true, cast: false });
    decal(genPath, 0.5, 0.2, 0, 1.5, 0.6, signFace("GENERAL WAITING", { bg: "#0d2418", accent: "#59c97b", scale: 0.36 }), { px: 256 }).rotation.y = Math.PI;
    cyl(genPath, 0.03, 0.03, 1.5, 0, 0.75, 0.62, 0x8a8f94, { rough: 0.5, seg: 6 });
    const shortcut = box(genPath, 0.8, 0.3, 0.3, 0, 0.2, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(genPath, "Quicker through here?", 0, 0.5, -0.2, { css: "#f0645b", w: 0.34 });
    reg(hits, shortcut, "wtt-general-waiting");

    // Ambulance bay and the hidden ambulance; the family area.
    const bay = group(g, 2.6, 0, 0.2);
    box(bay, 0.9, 0.01, 1.4, 0, 0.065, 0, 0xf2c14b, { rough: 0.6, opacity: 0.4, transparent: true, cast: false });
    const baySign = decal(bay, 0.4, 0.16, 0, 1.2, -0.7, signFace("AMBULANCE — SUSPECTED", { bg: "#2a1416", accent: "#f2c14b", scale: 0.3 }), { px: 256 });
    cyl(bay, 0.03, 0.03, 1.2, 0.3, 0.6, -0.72, 0x8a8f94, { rough: 0.5, seg: 6 });
    reg(hits, baySign, "wtt-ambulance-bay");
    const ambulance = group(g, 3.4, 0, 2.2, -0.2);
    box(ambulance, 1.8, 1.2, 0.95, 0, 0.8, 0, 0xf4f6f5, { rough: 0.4, metal: 0.3 });
    box(ambulance, 1.8, 0.12, 0.96, 0, 0.9, 0, 0xd8232a, { rough: 0.5 });
    const beacon = ball(ambulance, 0.08, 0.6, 1.5, 0, 0x3a7ae8, { emissive: 0x3a7ae8, ei: 2.2, rough: 0.4 });
    void beacon;
    ambulance.visible = false;
    const family = group(g, -2.6, 0, -0.4);
    box(family, 0.9, 0.06, 0.35, 0, 0.42, 0, 0x7a5a3a, { rough: 0.8 });
    for (const lx of [-0.4, 0.4]) box(family, 0.06, 0.42, 0.3, lx, 0.21, 0, 0x6a4a2a, { rough: 0.8 });
    const famSign = decal(family, 0.4, 0.14, 0, 1.2, -0.2, signFace("FAMILY WAITING", { bg: "#0d1c24", accent: "#d9785a", scale: 0.36 }), { px: 256 });
    cyl(family, 0.03, 0.03, 1.2, 0, 0.6, -0.22, 0x8a8f94, { rough: 0.5, seg: 6 });
    reg(hits, famSign, "wtt-family-area");
    const wife = standingFigure(g, 1.2, 0.9, { ry: Math.PI - 0.6, cloth: 0xa84a3a, atStation: true });
    wife.visible = false;

    // Boards.
    const crewBoard = wttBoard(g, 0.6, 0.4, 2.3, 1.5, -2.1, "GATE TEAM CHECK-IN", ["How is the shift going?", "Staff care is there to use", "Rotate, drink, shade"], { ry: -Math.PI / 5, accent: 0x7fd1c9, css: "#7fd1c9" });
    reg(hits, crewBoard, "wtt-crew-board");
    const gateLog = wttBoard(g, 0.55, 0.4, -1.1, 1.5, -2.5, "GATE LOG", ["Screened", "Suspected / routed", "Incidents"]);
    reg(hits, gateLog, "wtt-gate-log");

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.4, 1.1, -0.6),

      onStepComplete(step) {
        if (step.id === "set-barrier") { table.position.set(-0.2, 0, -0.6); }
        if (step.id === "handwash-tap") { flow.visible = true; }
        if (step.id === "route-suspected") { arrivalA.position.set(1.9, 0, -1.4); arrivalB.position.set(2.0, 0, -0.8); }
        if (step.id === "closing-log") repaint(gateLog.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(24,12,8,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("GATE HANDED OVER", w / 2, h / 2);
        });
      },

      onInterrupt(it) {
        if (it.id === "ambulance-at-gate") { ambulance.visible = true; }
        if (it.id === "family-follows") { wife.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "ambulance-at-gate") { ambulance.position.set(2.8, 0, 0.1); ambulance.rotation.y = Math.PI / 2; }
        if (it.id === "family-follows") { wife.position.set(-2.6, 0, 0.05); wife.rotation.y = Math.PI; }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt; void t;
        const step = session?.step;
        if (session?.turn && step?.id === "handwash-tap") tap.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "queue-spacing") qMarks.forEach((m, i) => { m.position.z = i * (0.2 + gg.t * 0.5); });
        const tr = session?.track;
        if (tr && step?.id === "temp-scan") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          repaint(thermo.userData.screen, signFace(ok ? "READING" : "AIM", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f2c14b", fg: "#eafcf9", scale: 0.55 }));
        }
      },
    };
  },
};
