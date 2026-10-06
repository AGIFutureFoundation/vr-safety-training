import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat, counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Surveillance and Case Definition VR — Emergency Services,
// outbreak response, station one. A district surveillance desk on the day an
// alert comes in: the case definition read before anything is counted, the
// signal verified before it is believed, a report filed at the tier the
// evidence supports and no higher, a line list audited for the duplicate and
// the blank, a specimen triple-packaged for the lab, zero reports chased, and
// the next level notified. The pathogen is never named: everything here is
// the generic procedure, and the case definition on the wall is the one the
// national programme issues for "the outbreak pathogen". Sited generically.

const WSC_ACCENT = 0x4fb0a0;
const WSC_ALERT = 0xf0645b;

function wscBoard(parent, w, h, x, y, z, title, lines, o = {}) {
  return holoPanel(parent, w, h, x, y, z, (cx, cw, ch) => {
    cx.fillStyle = "rgba(6,20,22,0.92)"; cx.fillRect(0, 0, cw, ch);
    cx.fillStyle = o.css ?? "#4fb0a0"; cx.fillRect(0, 0, cw, 6);
    cx.fillStyle = "#e2f6f2"; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.font = `600 ${Math.round(ch * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
    cx.fillText(title, cw * 0.05, ch * 0.13);
    cx.font = `${Math.round(ch * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#bfe3dc";
    lines.forEach((l, i) => cx.fillText(l, cw * 0.05, ch * (0.3 + i * 0.105)));
  }, { ry: o.ry ?? 0, accent: o.accent ?? WSC_ACCENT });
}

export const SIM_WHO_SURVEILLANCE_AND_CASE_DEFINITION = {
  id: "who-surveillance-and-case-definition",
  index: "217",
  domain: "Emergency Services",
  trade: "Surveillance officer — SEIU and AFSCME public-health staff, NNU/CNA nurses, and the humanitarian workforce deployed under IASC clusters",
  category: "Emergency Services",
  indoor: "service",
  weather: "overcast",
  certification: "WHO surveillance practice as the national programme adopts it — a written case definition with suspected, probable and confirmed tiers, a line list, zero reporting and notification up the chain; WHO infection prevention and control guidance and CDC isolation precautions for the specimen and anyone who handles it; OSHA 29 CFR 1910.1030 for the blood specimen and 29 CFR 1910.134 for the respirator a field collection needs; WHO outbreak communication guidance for what leaves this desk and what does not; the Sphere Handbook's health standards and IASC cluster coordination for the Health Cluster partners the line list is shared with; worked by SEIU and AFSCME public-health staff alongside NNU/CNA nurses",
  name: "Surveillance and Case Definition",
  title: simTitle("Surveillance and Case Definition"),
  tagline: "District surveillance desk: the case definition read first, a signal verified, a report filed at the tier the evidence supports, a clean line list, a triple-packaged specimen, zero reports chased and the next level told",
  accent: WSC_ACCENT,
  accentCss: "#4fb0a0",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "signal-verified", name: "Signal Verified", note: "Every report tiered on the evidence, the line list clean, the specimen packed right and the silent site chased before anyone assumed zero" },

  supportLine: "your agency's staff welfare or staff counsellor service, or the peer-support contact named at your deployment briefing",

  game: system({
    name: "Signal Desk",
    currency: "SIGNAL",
    ranks: ["Data Clerk", "Surveillance Assistant", "Surveillance Officer", "District Epidemiologist", "Signal Desk Certified"],
    badges: [
      { id: "tier-true", name: "Tier True", note: "The report filed at the tier the evidence supports, first time", test: AWARD.stepClean("classify-case") },
      { id: "nothing-leaked", name: "Nothing Leaked", note: "No name on a public board, no rumour forwarded, no stamp without a lab", test: AWARD.safe },
      { id: "returns-read", name: "Returns Read", note: "Reporting completeness committed inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-desk", name: "Clean Desk", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "eyes-on-feed", name: "Eyes on the Feed", note: "Held the feed watch without a dropout", test: AWARD.unbroken },
      { id: "desk-on-time", name: "Desk on Time", note: "Finished inside 85% of par", test: AWARD.fast(0.85) },
    ],
  }),

  hazards: {
    "wsc-confirm-stamp": "You stamped the report CONFIRMED with no laboratory result behind it. A confirmed tier is a lab finding, not a strong hunch; stamping it early inflates the count the whole response is sized from, and when the result comes back negative every figure that was built on it has to be walked back in public.",
    "wsc-public-board": "You wrote the patient's name on the board the whole office walks past. Surveillance runs on case numbers, not names, because a name on a wall reaches the neighbourhood by lunchtime — and a family that is identified and shunned is the reason the next family hides a sick relative instead of calling it in.",
    "wsc-picnic-cooler": "You dropped the specimen tube loose into a picnic cooler. A specimen from a suspected case travels triple-packaged — a sealed primary tube, a leak-proof secondary container with absorbent, and a rigid outer box — because the courier, the driver and the lab reception clerk are all handling it without knowing what is inside.",
    "wsc-group-chat": "You forwarded the unverified rumour to the district staff group to 'warn people'. An alert that has not been verified is a rumour with an official's name on it once it leaves this desk; it gets screenshotted, repeated to the community as fact, and costs the response the trust it needs when the real message goes out.",
  },

  lateNotes: {
    "wsc-cooler-latch": "The box is sealed after the specimen is triple-packaged inside it, not before — a closed empty box proves nothing.",
    "wsc-notify-form": "Notification goes up once the signal is verified and tiered; a form sent on an unchecked alert is the rumour in writing.",
  },

  steps: [
    {
      id: "case-definition", kind: "select", target: "wsc-case-board",
      title: "Read the current case definition",
      cue: "Read today's version of the case definition — the suspected, probable and confirmed tiers — before you count anything.",
      why: "Every number this desk produces is a count of people who meet a written definition, and the definition is revised as the outbreak is understood. Counting against last week's version, or against what the team remembers it says, means today's figures and yesterday's are measuring different things, and nobody reading the chart upstream can tell.",
    },
    {
      id: "signal-verify", kind: "sequence",
      targets: ["wsc-sig-source", "wsc-sig-onset", "wsc-sig-criteria"],
      itemNames: { "wsc-sig-source": "who reported it", "wsc-sig-onset": "date of onset", "wsc-sig-criteria": "does it meet the definition" },
      title: "Verify the community alert",
      cue: "Check who reported it, then when the illness started, then whether what is described meets the definition.",
      why: "A signal is only an alert once somebody has checked it: the source says whether this is a health worker's observation or third-hand talk, the onset date says whether it belongs to this week's picture at all, and only then is the description held against the definition. Checked in that order, a rumour is caught at the first question instead of being tiered and counted.",
      outOfOrderNote: "Source, then onset, then the criteria — you cannot judge a description against the definition before you know who gave it and when it started.",
    },
    {
      id: "classify-case", kind: "drag", target: "wsc-case-card",
      title: "File the report as a suspected case",
      cue: "Carry the verified report to the SUSPECTED tray — no lab result exists yet.",
      why: "The tiers exist so the count can be honest about how sure it is. A report that meets the clinical definition with no laboratory result is a suspected case, and filing it there keeps the response acting on it — isolation, tracing, a specimen — without claiming a certainty the evidence does not have yet. It moves up a tier when the lab says so.",
      drag: { to: "wsc-tray-suspected", radius: 0.4, missNote: "Not the suspected tray. Without a lab result the evidence supports suspected, and nothing higher." },
    },
    {
      id: "map-case", kind: "select", target: "wsc-map-pin",
      title: "Plot the case by place of residence",
      cue: "Pin the new case on the district map by where the person lives, not where they were seen.",
      why: "Clusters show up on a map before they show up in a table, but only if every pin means the same thing. A case plotted at the clinic that saw it piles every patient onto the health facility and hides the village the transmission is actually in, which is the one place the tracing team most needs to be sent tomorrow.",
    },
    {
      id: "line-list-audit", kind: "find", noHint: true,
      targets: ["wsc-row-duplicate", "wsc-row-no-onset"],
      itemNames: { "wsc-row-duplicate": "duplicate entry", "wsc-row-no-onset": "row with no onset date" },
      itemNotes: {
        "wsc-row-duplicate": "The same person entered twice — once by the clinic, once by the community worker, under two spellings.",
        "wsc-row-no-onset": "A row with the onset date left blank; it cannot be placed on the epidemic curve at all.",
      },
      title: "Audit the line list",
      cue: "Find the duplicate and the incomplete row before the list goes anywhere.",
      why: "A duplicate doubles a person on the curve and sends two tracing teams to one house; a missing onset date drops a real case off the epidemic curve entirely. Neither is visible in a total, so the list is read row by row before it is shared, because once partners have pulled it into their own planning a correction reaches half of them.",
    },
    {
      id: "specimen-pack", kind: "sequence",
      targets: ["wsc-pack-primary", "wsc-pack-secondary", "wsc-pack-outer"],
      itemNames: { "wsc-pack-primary": "sealed primary tube", "wsc-pack-secondary": "leak-proof secondary with absorbent", "wsc-pack-outer": "rigid outer box" },
      title: "Triple-package the specimen",
      cue: "Primary tube sealed, into the leak-proof secondary with absorbent, into the rigid outer box — inside out.",
      why: "Triple packaging is what WHO guidance on moving infectious substances rests on: the primary receptacle holds the specimen, the secondary contains it if the primary breaks and the absorbent takes the whole volume, and the outer box takes the knocks of a road. Packed in any other order, one of the layers is protecting nothing.",
      outOfOrderNote: "Inside out — primary, secondary with absorbent, then the outer box. Each layer exists to contain a failure of the one inside it.",
    },
    {
      id: "seal-cooler", kind: "turn", target: "wsc-cooler-latch",
      title: "Seal the transport box",
      cue: "Turn the latch until the transport box is locked shut for the courier.",
      why: "The box leaves this desk with a courier who will not open it and a lab clerk who will, so the seal is the last thing this office controls. A latch closed hard with the paperwork outside, not inside, is what lets the lab log the specimen without handling it before it reaches a biosafety cabinet.",
      turn: { turns: 0.75, axis: "y", label: "LATCH" },
    },
    {
      id: "lab-callback", kind: "hold", target: "wsc-lab-phone", seconds: 5,
      title: "Hold the lab line until the specimen ID is read back",
      cue: "Stay on the line until the lab reads the specimen number and patient code back to you.",
      why: "A specimen is only useful if its result can be matched to a row on the line list, and a code misheard over a bad line produces a result for nobody — or for the wrong person. Holding until the lab reads it back turns a one-way message into a checked one, and costs thirty seconds against a week of confusion.",
      holdBreakNote: "You hung up before the code was read back. An unconfirmed specimen code is how a result ends up attached to the wrong patient — call back and hold.",
    },
    {
      id: "completeness", kind: "gauge", target: "wsc-completeness-dial",
      title: "Commit this week's reporting completeness",
      cue: "Sweep the dial and commit when it matches the site returns on the desk: 31 of 40 sites reported.",
      why: "A quiet week and a week where nobody reported look identical on a case chart. Completeness — how many sites actually sent a return, including the ones that sent zero — is what tells the district epidemiologist whether a falling curve is good news or silence, and it is committed from the returns in hand, not rounded up to look healthier.",
      gauge: { label: "SITES", speed: 0.6, green: [0.74, 0.8], readout: (t) => `${Math.round(t * 40)} of 40`, missNote: "That is not what the returns say. Commit the number of sites that actually reported — 31 of 40." },
    },
    {
      id: "watch-feed", kind: "track", target: "wsc-feed-screen", seconds: 7,
      title: "Watch the daily report feed",
      cue: "Keep your attention on the feed as the day's reports come in, and stay in the band.",
      why: "Reports arrive through the day from clinics, community workers and hospitals, and a rise that is obvious at the end of a week is a handful of rows spread across an afternoon. Watching the feed as it lands, rather than batching it for the evening, is what gives a cluster a same-day response instead of a next-week one.",
      track: { start: 0.2, green: [0.38, 0.64], rise: 0.55, fall: 0.45, drift: 0.12, label: "FEED WATCH", readout: (v) => (v < 0.38 ? "falling behind" : v > 0.64 ? "chasing noise" : "on the feed") },
      holdBreakNote: "The feed got ahead of you. A row read an hour late is an hour the tracing team did not have — bring it back into the band.",
    },
    {
      id: "notify-up", kind: "select", target: "wsc-notify-form",
      title: "Notify the next level",
      cue: "Send the verified, tiered notification up to the national focal point and copy the Health Cluster coordinator.",
      why: "Surveillance that stops at the district is a local spreadsheet. The notification carries the verified count upward to the level that decides on laboratory capacity, supplies and whether the response needs outside help, and the Health Cluster copy is what lets every partner under IASC coordination plan from the same figure rather than their own.",
    },
    {
      id: "crew-checkin", kind: "select", target: "wsc-crew-board",
      title: "Check in with the surveillance team",
      cue: "Before you close the desk, check in with the team on how the day sat with them, and point anyone who needs it to staff care.",
      why: "The desk reads every death as a row before anyone else hears it, and a surveillance team working an outbreak for weeks carries that count home. Checking in with each other before the shift ends — and naming the staff welfare contact out loud — is what keeps the people behind the numbers able to keep producing them.",
    },
    {
      id: "closing-log", kind: "hold", target: "wsc-shift-log", seconds: 4,
      title: "Close the desk log",
      cue: "Hold the log open and read back the day's count, open specimens and silent sites before you sign it.",
      why: "The next shift was not here for the phone calls, and the desk log is the only thing that tells them which specimens are still at the lab and which sites have not answered. Read back before it is signed, it is a handover; signed without reading, it is a guess with a date on it.",
      holdBreakNote: "You signed the log without reading the counts back. Open it again and read the open specimens and silent sites out before signing.",
    },
  ],

  interrupts: [
    {
      id: "cluster-report-prints",
      kind: "Cluster report",
      after: "lab-callback", delay: 2, seconds: 13,
      alert: "While you hold for the lab, the alert printer across the desk starts feeding a report from a health post: three people from one household, all unwell this week.",
      cue: "Pull the report off the printer — a household cluster does not wait for the phone call to end.",
      target: "wsc-alert-printer",
      why: "Several cases in one household or one gathering is the pattern surveillance exists to catch early, because it is where transmission is most likely and tracing is most effective. The phone line can be held with one hand; a cluster report left curling on a printer tray is the kind of signal that gets found at the end of the day under the next one.",
      missNote: "The cluster report sat on the printer while the call finished and the desk moved on. It was found that evening — by which time the household's contacts had spent another day at the market and the water point without anyone knowing to look for them.",
      wrongNote: "Not that. The report is on the alert printer — take it off the tray while you finish the call.",
    },
    {
      id: "silent-site",
      kind: "Silent site",
      after: "watch-feed", delay: 3, seconds: 14,
      alert: "The map pin for a remote health post has turned red: it has missed today's report, not even a zero.",
      cue: "Raise the silent site on the radio — a missing report is not a zero.",
      target: "wsc-site-radio",
      why: "Zero reporting exists precisely so that 'no cases' and 'no report' can be told apart. A site that goes silent in an outbreak might have no cases, or might have a nurse who is sick, a broken phone or a waiting room full of patients, and the only way to know which is to call it the same day rather than let the gap read as good news.",
      missNote: "The silent site was counted as quiet. It turned out the post had lost its phone and its nurse was caring for several suspected cases alone — a week of cases that reached the line list all at once, too late to trace.",
      wrongNote: "That will not reach them. Use the site radio to raise the health post that missed its report.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root, 0, 0, -1.9);
    stationPad(g, 2.4, WSC_ACCENT);

    // ---------------------------------------------------------- office floor
    const floor = box(g, 5.8, 0.04, 4.6, 0, 0.02, 0, 0xffffff, { rough: 0.8 });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 8, base: "#6f7c80", base2: "#66747a", seam: "rgba(20,30,34,0.45)" }), { repeat: 4, px: 512 }),
      { rough: 0.8, metal: 0.02, color: 0xc9d4d6 },
    );
    box(g, 5.8, 2.6, 0.12, 0, 1.3, -2.3, 0xd9dfdc, { rough: 0.9 });
    box(g, 5.8, 0.12, 0.18, 0, 0.06, -2.22, 0x7c8a8e, { rough: 0.7 });
    // Window strip on the back wall.
    for (let i = 0; i < 3; i++) box(g, 0.9, 0.7, 0.02, -1.6 + i * 1.6, 1.95, -2.23, 0x9fc6d6, { rough: 0.1, metal: 0.3, opacity: 0.55, transparent: true, cast: false });

    // ---------------------------------------------------------- the wall boards
    const caseBoard = wscBoard(g, 1.0, 0.66, -1.35, 1.55, -2.15, "CASE DEFINITION — v.today", [
      "SUSPECTED: meets clinical criteria", "PROBABLE: suspected + epi link", "CONFIRMED: laboratory result only",
      "Count by tier. Never by hunch.", "Revised versions replace this sheet",
    ]);
    reg(hits, caseBoard, "wsc-case-board");
    const lineList = wscBoard(g, 1.1, 0.66, 0.05, 1.55, -2.15, "LINE LIST — DISTRICT", [
      "#031  F 34  onset d-3  village A", "#032  M 51  onset d-2  village C", "#033  M 51  onset d-2  vilage C",
      "#034  F 12  onset ——   village A", "#035  F 60  onset d-1  village B",
    ]);
    reg(hits, lineList, "wsc-line-list");
    // Invisible-ish row markers over the two faulty rows.
    const dupRow = box(g, 0.98, 0.06, 0.02, 0.05, 1.55 + 0.33 - 0.66 * 0.51, -2.13, WSC_ALERT, { opacity: 0.18, transparent: true, cast: false });
    reg(hits, dupRow, "wsc-row-duplicate");
    const blankRow = box(g, 0.98, 0.06, 0.02, 0.05, 1.55 + 0.33 - 0.66 * 0.615, -2.13, 0xf2c14b, { opacity: 0.18, transparent: true, cast: false });
    reg(hits, blankRow, "wsc-row-no-onset");
    // Public whiteboard — the name trap.
    const publicBoard = group(g, 1.55, 0, -2.15);
    box(publicBoard, 0.9, 0.6, 0.03, 0, 1.55, 0, 0xf4f6f5, { rough: 0.3 });
    decal(publicBoard, 0.8, 0.5, 0, 1.55, 0.02, paperFace("OFFICE NOTICES", ["Staff meeting 16:00", "Vehicle roster", "Write the new case name here?"], { bg: "#f4f6f5", band: "#8a4040" }), { px: 256 });
    holoTag(publicBoard, "Public board", 0, 1.94, 0.03, { css: "#f0645b", w: 0.3 });
    reg(hits, box(publicBoard, 0.9, 0.6, 0.02, 0, 1.55, 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wsc-public-board");

    // District map on the left wall with pins.
    const mapWall = group(g, -2.75, 0, -0.6, Math.PI / 2);
    box(mapWall, 1.4, 0.95, 0.03, 0, 1.45, 0, 0xe8e1c8, { rough: 0.7 });
    decal(mapWall, 1.3, 0.85, 0, 1.45, 0.02, (cx, w, h) => {
      cx.fillStyle = "#e9e2c6"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#7a9a6a"; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(0, h * 0.7); cx.bezierCurveTo(w * 0.3, h * 0.5, w * 0.6, h * 0.9, w, h * 0.6); cx.stroke();
      cx.strokeStyle = "#6fa0c8"; cx.lineWidth = 10; cx.beginPath(); cx.moveTo(w * 0.2, 0); cx.bezierCurveTo(w * 0.35, h * 0.4, w * 0.25, h * 0.7, w * 0.4, h); cx.stroke();
      cx.fillStyle = "#3a4a3a"; cx.font = `600 ${Math.round(h * 0.06)}px Arial`; cx.fillText("DISTRICT — villages A · B · C", w * 0.04, h * 0.08);
    }, { px: 512 });
    const pins = [];
    for (const [px, py] of [[-0.4, 1.6], [-0.3, 1.52], [0.25, 1.3], [0.45, 1.7]]) pins.push(ball(mapWall, 0.025, px, py, 0.04, 0x2f7d4a, { rough: 0.4 }));
    const newPin = ball(mapWall, 0.035, -0.1, 1.42, 0.05, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.6, rough: 0.4 });
    reg(hits, newPin, "wsc-map-pin");
    const silentPin = ball(mapWall, 0.03, 0.55, 1.15, 0.04, 0x2f7d4a, { rough: 0.4 });
    const silentRing = box(mapWall, 0.1, 0.1, 0.01, 0.55, 1.15, 0.035, WSC_ALERT, { emissive: WSC_ALERT, ei: 1.6, opacity: 0.8, transparent: true, cast: false });
    silentRing.visible = false;
    holoTag(mapWall, "District map", 0, 2.02, 0.03, { css: "#4fb0a0", w: 0.3 });

    // ---------------------------------------------------------- main desk
    const desk = counter(g, 1.8, 0.7, -0.2, -0.9, 0x8a7a64, { ry: 0 });
    void desk;
    // Signal-verification cards on the desk.
    for (const [id, label, x] of [["wsc-sig-source", "SOURCE", -0.85], ["wsc-sig-onset", "ONSET", -0.55], ["wsc-sig-criteria", "CRITERIA", -0.25]]) {
      const card = decal(g, 0.24, 0.14, x, 0.79, -1.0, signFace(label, { bg: "#0d1c1c", accent: "#4fb0a0", scale: 0.5 }), { px: 128 });
      card.rotation.x = -Math.PI / 2;
      reg(hits, card, id);
    }
    // The report card and the tier trays.
    const caseCard = group(g, 0.1, 0.79, -0.75);
    box(caseCard, 0.2, 0.01, 0.14, 0, 0, 0, 0xf2efe6, { rough: 0.8 });
    holoTag(caseCard, "New report", 0, 0.1, 0, { css: "#4fb0a0", w: 0.24 });
    reg(hits, caseCard, "wsc-case-card");
    const trays = {};
    for (const [id, label, x, css] of [["wsc-tray-suspected", "SUSPECTED", 0.3, "#f2c14b"], ["wsc-tray-probable", "PROBABLE", 0.52, "#e8903a"]]) {
      const t = group(g, x, 0.78, -1.1);
      box(t, 0.2, 0.04, 0.26, 0, 0.02, 0, 0x2b3236, { rough: 0.6 });
      decal(t, 0.18, 0.06, 0, 0.045, 0.1, signFace(label, { bg: "#141a1c", accent: css, scale: 0.42 }), { px: 128 }).rotation.x = -Math.PI / 2;
      trays[id] = t;
    }
    reg(hits, trays["wsc-tray-suspected"], "wsc-tray-suspected");
    // The stamp trap.
    const stamp = group(g, 0.62, 0.78, -0.72);
    cyl(stamp, 0.03, 0.035, 0.08, 0, 0.04, 0, 0x5a2a2a, { rough: 0.5, seg: 12 });
    box(stamp, 0.08, 0.02, 0.05, 0, 0.005, 0, 0x2a1a1a, { rough: 0.6 });
    holoTag(stamp, "CONFIRMED stamp", 0, 0.16, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, stamp, "wsc-confirm-stamp");
    // Lab phone and the group-chat handset.
    const phone = group(g, -0.9, 0.78, -0.72);
    box(phone, 0.16, 0.05, 0.2, 0, 0.025, 0, 0x22282c, { rough: 0.5 });
    box(phone, 0.05, 0.04, 0.22, 0.07, 0.07, 0, 0x2b3236, { rough: 0.5 });
    holoTag(phone, "Lab line", 0, 0.18, 0, { css: "#4fb0a0", w: 0.2 });
    reg(hits, phone, "wsc-lab-phone");
    const mobile = group(g, 0.85, 0.78, -1.0);
    box(mobile, 0.07, 0.01, 0.14, 0, 0.005, 0, 0x111418, { rough: 0.3 });
    decal(mobile, 0.06, 0.12, 0, 0.012, 0, signFace("FWD?", { bg: "#1a2a3a", accent: "#f0645b", scale: 0.4 }), { px: 64 }).rotation.x = -Math.PI / 2;
    holoTag(mobile, "Staff group chat", 0, 0.12, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, mobile, "wsc-group-chat");
    // Notify form.
    const notify = decal(g, 0.24, 0.3, -0.55, 0.791, -0.62, paperFace("NOTIFICATION", ["Tier: suspected", "Onset / place", "To: national focal point", "cc: Health Cluster"], { band: "#2f6f66" }), { px: 256 });
    notify.rotation.x = -Math.PI / 2;
    reg(hits, notify, "wsc-notify-form");
    // Completeness dial and the feed screen.
    const dial = instrument(g, -0.2, 0.8, -1.12, { idle: "-- of 40", color: WSC_ACCENT, w: 0.16, d: 0.22 });
    holoTag(dial, "Completeness", 0, 0.14, 0, { css: "#4fb0a0", w: 0.26 });
    reg(hits, dial, "wsc-completeness-dial");
    const returns = decal(g, 0.2, 0.26, 0.05, 0.791, -1.2, paperFace("SITE RETURNS", ["Returned: 31 of 40", "Zero reports incl.", "Silent: 9"], { band: "#3a4a52" }), { px: 256 });
    returns.rotation.x = -Math.PI / 2;
    const feed = group(g, -1.35, 0, -1.5);
    box(feed, 0.06, 0.8, 0.06, 0, 0.4, 0, CITY.darkSteel, { rough: 0.5 });
    const feedScreen = decal(feed, 0.6, 0.36, 0, 1.12, 0.04, signFace("FEED", { bg: "#0d1c24", accent: "#4fb0a0", fg: "#cfeee8", scale: 0.5 }), { px: 256, glow: true, ei: 0.8 });
    box(feed, 0.64, 0.4, 0.04, 0, 1.12, 0.01, 0x1b2226, { rough: 0.5 });
    holoTag(feed, "Report feed", 0, 1.38, 0.05, { css: "#4fb0a0", w: 0.26 });
    reg(hits, feedScreen, "wsc-feed-screen");

    // ---------------------------------------------------------- specimen bench
    const bench = counter(g, 1.1, 0.55, 1.65, -0.9, 0xd7dce1, { ry: 0 });
    void bench;
    const packs = [["wsc-pack-primary", 1.3, 0xe8eef2, 0.03, 0.1], ["wsc-pack-secondary", 1.55, 0xdfe8c8, 0.06, 0.14], ["wsc-pack-outer", 1.85, 0xc9a86a, 0.2, 0.16]];
    for (const [id, x, color, w, h] of packs) {
      const it = group(g, x, 0.78, -0.95);
      if (id === "wsc-pack-primary") cyl(it, 0.015, 0.015, h, 0, h / 2, 0, color, { rough: 0.3, seg: 10 });
      else box(it, w, h, w, 0, h / 2, 0, color, { rough: 0.6 });
      holoTag(it, id.replace("wsc-pack-", ""), 0, h + 0.08, 0, { css: "#4fb0a0", w: 0.2 });
      reg(hits, it, id);
    }
    const cooler = group(g, 1.75, 0, -0.35);
    box(cooler, 0.5, 0.4, 0.36, 0, 0.2, 0, 0x2f6f8c, { rough: 0.5 });
    box(cooler, 0.52, 0.06, 0.38, 0, 0.43, 0, 0x2a5f78, { rough: 0.5 });
    decal(cooler, 0.3, 0.1, 0, 0.3, 0.185, signFace("UN3373", { bg: "#f2efe6", accent: "#1d262e", fg: "#1d262e", scale: 0.5 }), { px: 128 });
    const latch = cyl(cooler, 0.04, 0.04, 0.03, 0, 0.3, -0.19, CITY.steel, { rough: 0.3, metal: 0.8, seg: 12 });
    latch.rotation.x = Math.PI / 2;
    holoTag(cooler, "Transport box", 0, 0.6, 0, { css: "#4fb0a0", w: 0.28 });
    reg(hits, latch, "wsc-cooler-latch");
    const picnic = group(g, 2.35, 0, 0.35);
    box(picnic, 0.4, 0.3, 0.28, 0, 0.15, 0, 0xe03a3a, { rough: 0.5 });
    box(picnic, 0.42, 0.05, 0.3, 0, 0.32, 0, 0xf2f2f2, { rough: 0.5 });
    holoTag(picnic, "Just use this?", 0, 0.48, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, picnic, "wsc-picnic-cooler");

    // ---------------------------------------------------------- alert printer, radio, boards
    const printer = group(g, 1.1, 0.78, -1.12);
    box(printer, 0.34, 0.14, 0.26, 0, 0.07, 0, 0xdadfe2, { rough: 0.5 });
    const printerLamp = ball(printer, 0.012, 0.14, 0.145, 0.1, WSC_ALERT, { emissive: WSC_ALERT, ei: 2.4, rough: 0.4 });
    printerLamp.visible = false;
    const printSheet = box(printer, 0.2, 0.004, 0.26, 0, 0.15, 0.18, 0xf7f5ee, { rough: 0.8 });
    printSheet.visible = false;
    holoTag(printer, "Alert printer", 0, 0.26, 0, { css: "#4fb0a0", w: 0.26 });
    reg(hits, printer, "wsc-alert-printer");
    const radio = group(g, -2.2, 0, 0.35);
    box(radio, 0.4, 0.75, 0.35, 0, 0.375, 0, 0x3a4148, { rough: 0.6 });
    box(radio, 0.24, 0.1, 0.14, 0, 0.8, 0, 0x22282c, { rough: 0.5 });
    cyl(radio, 0.005, 0.005, 0.5, 0.08, 1.1, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 6 });
    holoTag(radio, "Site radio", 0, 1.4, 0, { css: "#4fb0a0", w: 0.24 });
    reg(hits, radio, "wsc-site-radio");

    const crewBoard = wscBoard(g, 0.6, 0.4, -2.0, 1.45, 1.2, "TEAM CHECK-IN", ["How did today sit?", "Staff welfare contact posted", "Peer support on the rota"], { ry: Math.PI / 2.4, accent: 0x7fd1c9, css: "#7fd1c9" });
    reg(hits, crewBoard, "wsc-crew-board");
    const shiftLog = wscBoard(g, 0.55, 0.38, 2.1, 1.45, 1.1, "DESK LOG", ["Count by tier", "Open specimens", "Silent sites"], { ry: -Math.PI / 2.4 });
    reg(hits, shiftLog, "wsc-shift-log");

    // ---------------------------------------------------------- dressing
    cabinet(g, 0.5, 1.1, 0.4, -2.4, 0.55, -1.8, 0x8f969b, { doorColor: 0x7c8388 });
    cabinet(g, 0.5, 1.1, 0.4, -1.85, 0.55, -1.95, 0x8f969b, { doorColor: 0x7c8388 });
    for (const [x, z] of [[-0.6, -0.1], [0.3, -0.1]]) {
      const ch = group(g, x, 0, z);
      box(ch, 0.4, 0.05, 0.4, 0, 0.45, 0, 0x2b3236, { rough: 0.6 });
      box(ch, 0.4, 0.45, 0.05, 0, 0.7, 0.18, 0x2b3236, { rough: 0.6 });
      for (const [lx, lz] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) cyl(ch, 0.012, 0.012, 0.45, lx, 0.225, lz, CITY.steel, { rough: 0.4, metal: 0.7, seg: 6 });
    }
    const cooler2 = group(g, 2.45, 0, -1.8);
    cyl(cooler2, 0.14, 0.14, 0.9, 0, 0.45, 0, 0xe8eef2, { rough: 0.4, seg: 14 });
    cyl(cooler2, 0.1, 0.1, 0.3, 0, 1.05, 0, 0x7fb8d8, { rough: 0.1, opacity: 0.6, transparent: true, seg: 14 });
    for (let i = 0; i < 5; i++) box(g, 0.28, 0.04, 0.22, -2.55 + (i % 2) * 0.02, 0.02 + i * 0.045, -1.25, 0xf2efe6, { rough: 0.8 });
    const colleague = standingFigure(g, -1.3, 0.7, { ry: 2.6, cloth: 0x37505f, vest: WSC_ACCENT });
    void colleague;
    const courier = standingFigure(g, 1.4, 1.0, { ry: -2.6, cloth: 0x5a6b3a });
    void courier;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.2, -2.6),

      onStepComplete(step) {
        if (step.id === "classify-case") { caseCard.position.set(0.3, 0.83, -1.1); }
        if (step.id === "map-case") { newPin.material = mat(0xf2c14b, { rough: 0.4 }); }
        if (step.id === "line-list-audit") { dupRow.visible = false; blankRow.visible = false; }
        if (step.id === "seal-cooler") { latch.rotation.z = Math.PI / 2; }
        if (step.id === "notify-up") repaint(notify, paperFace("NOTIFICATION — SENT", ["Tier: suspected", "Onset / place", "To: national focal point", "cc: Health Cluster"], { band: "#2f7d4a" }));
        if (step.id === "closing-log") repaint(shiftLog.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(6,20,22,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("HANDED OVER", w / 2, h / 2);
        });
      },

      onInterrupt(it) {
        if (it.id === "cluster-report-prints") { printerLamp.visible = true; printSheet.visible = true; }
        if (it.id === "silent-site") { silentRing.visible = true; silentPin.material = mat(WSC_ALERT, { emissive: WSC_ALERT, ei: 1.2, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cluster-report-prints") { printerLamp.visible = false; printSheet.position.set(-0.8, -0.14, 0.1); }
        if (it.id === "silent-site") { silentRing.visible = false; silentPin.material = mat(0xf2c14b, { rough: 0.4 }); }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const step = session?.step;
        if (silentRing.visible && silentRing.material) silentRing.material.emissiveIntensity = 1.0 + Math.sin(t * 8) * 0.8;
        if (session?.turn && step?.id === "seal-cooler") latch.rotation.z = session.turn.amount * Math.PI * 2 * 0.75;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "completeness") {
          repaint(dial.userData.screen, signFace(`${Math.round(gg.t * 40)} of 40`, { bg: "#0d1c24", accent: gg.t >= 0.74 && gg.t <= 0.8 ? "#59c97b" : "#f2c14b", fg: "#eafcf9", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && step?.id === "watch-feed") {
          repaint(feedScreen, signFace(tr.v < 0.38 ? "BEHIND" : tr.v > 0.64 ? "NOISE" : "ON FEED", { bg: "#0d1c24", accent: tr.v >= 0.38 && tr.v <= 0.64 ? "#59c97b" : "#f0645b", fg: "#eafcf9", scale: 0.5 }));
        }
      },
    };
  },
};
