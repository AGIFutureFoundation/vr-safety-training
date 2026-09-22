import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat, cabinet, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Results Return Visit VR — Community Environmental Justice,
// Hunters Point Edition, station three of four in the biomonitoring line.
//
// Returning a biomonitoring result to the participant it belongs to: the
// identity confirmed against the participant ID before the file is even
// opened, the report explained against its own reference ranges, what a
// level means and does not mean said plainly, a flagged result referred to
// a clinician, the participant's own questions answered without alarm or
// dismissal, and the visit itself recorded. 45 CFR 46 gave this participant
// the right to their own results back — this station is that promise kept
// carefully, one file at a time.
//
// Sited generically in a community programme's return-visit room; no real
// laboratory, clinician or participant is named or implied.

const RRV_ACCENT = 0x7fb0e0;

export const SIM_RESULTS_RETURN_VISIT = {
  id: "results-return-visit",
  index: "153",
  domain: "Environmental",
  trade: "Biomonitoring field coordinator",
  category: "Community Environmental Justice",
  indoor: "clinic",
  certification: "45 CFR 46 informed consent, including the participant's own right to their results; HIPAA protections for a participant's health information; CDC biomonitoring reference-range and interpretation guidance; SEIU community health worker practice standards",
  name: "Results Return Visit",
  title: simTitle("Results Return Visit"),
  tagline: "Identity confirmed before the file opens, the report explained against reference ranges, a flagged result referred to a clinician, questions answered without alarm or dismissal, and the visit recorded",
  accent: RRV_ACCENT,
  accentCss: "#7fb0e0",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "right-file-right-words", name: "Right File, Right Words", note: "The right participant's own result, explained without alarm or dismissal, and referred where it needed to be" },

  game: system({
    name: "Results Return",
    currency: "RETURN",
    ranks: ["Return Trainee", "Intake Coordinator", "Field Coordinator", "Lead Coordinator", "Return Certified"],
    badges: [
      { id: "id-checked-first", name: "ID Checked First", note: "Identity confirmed against two sources before the file ever opened", test: AWARD.stepClean("verify-id") },
      { id: "never-mismatched", name: "Never Mismatched", note: "No file opened, shared or handed over that belonged to someone else", test: AWARD.safe },
      { id: "calibrated-explanation", name: "Calibrated Explanation", note: "The level explained without alarm and without dismissal", test: AWARD.all(AWARD.stepClean("meaning-panel"), AWARD.stepClean("referral")) },
    ],
    challenges: [
      { id: "clean-return", name: "Clean Return", note: "No corrections across the whole visit", test: AWARD.clean },
      { id: "steady-conversation", name: "Steady Conversation", note: "The header review and the question time both held without a break", test: AWARD.unbroken },
      { id: "on-time-return", name: "On-Time Return", note: "The visit complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "explain-without-context": "You told the participant their number \"causes cancer\" instead of explaining what it actually means against the reference range. A biomarker level is not a diagnosis, and a coordinator who reaches for the scariest plausible sentence instead of the calibrated one has traded an honest explanation for a frightened participant who now trusts this programme less, not more.",
    "dismiss-flagged": "You told the participant a flagged result was \"probably nothing\" and skipped the referral. A level above the reference range is exactly what the referral pathway exists for — waving it off because the number alone doesn't look dramatic is a decision that belongs to a clinician, not to whoever is sitting across the table with the report.",
    "hand-neighbour-file": "You reached for a folder from the stack of other participants' results instead of staying inside the one this visit is actually about. Handing over, or even opening, a result that belongs to somebody else is exactly the confidentiality failure 45 CFR 46 and HIPAA both exist to prevent — it does not matter that the neighbour asked nicely.",
    "skip-id-check": "You opened the top file on the stack without checking it against this participant's own ID. A biomonitoring report opened on the strength of \"probably the right one\" is exactly how one participant ends up hearing another person's result read back to them as their own.",
  },

  lateNotes: {
    "report-copy": "There's nothing settled to hand over yet — the level, its meaning and the referral all have to be explained first.",
    "visit-log": "Nothing to record yet — the closing checklist has to confirm the participant actually understood before there's a finished visit to log.",
  },

  steps: [
    {
      id: "verify-id", kind: "find", noHint: true,
      targets: ["match-report-id", "match-intake-id"],
      itemNames: { "match-report-id": "the ID printed on the report", "match-intake-id": "the ID on the intake record" },
      itemNotes: {
        "match-report-id": "The report's own header carries the participant ID it was generated for — read before assuming the file on top of the stack is the right one.",
        "match-intake-id": "The intake record is the independent second source; it exists precisely so the report's own header is never the only thing being trusted.",
      },
      title: "Confirm identity against two ID sources",
      cue: "Cross-check the report's own ID against the intake record before opening anything for this participant.",
      why: "A report and a participant are only as connected as the last person who checked, and checking two independent sources — the report's own header and the intake record — is what catches a folder that was filed one slot off before it ever reaches the table this participant is sitting at.",
    },
    {
      id: "open-report", kind: "select", target: "report-panel",
      title: "Open the confirmed report",
      cue: "Pull up the report now that the ID has been confirmed against two sources.",
      why: "Opening only happens after the ID check, not before it — a report opened first and checked afterward has already been half-explained by the time anyone notices it belongs to somebody else.",
    },
    {
      id: "confirm-details", kind: "track", target: "header-review", seconds: 5,
      title: "Scan the report header",
      cue: "Read down the header — name field blank, ID matches, collection date matches — before saying a single number out loud.",
      track: { start: 0.2, green: [0.35, 0.65], rise: 0.5, fall: 0.42, drift: 0.13, label: "HEADER SCAN", readout: (v) => (v < 0.35 ? "too fast — slow the scan" : v > 0.65 ? "overshooting the header" : "checking") },
      why: "The header is where a mismatch actually shows itself — an ID that is close but not exact, a collection date from a different visit — and scanning it deliberately, rather than skimming past it toward the numbers, is the last chance to catch a file that slipped past the first check.",
      holdBreakNote: "The scan broke off before the header was actually read through — a header only half-checked can still be hiding the wrong participant's ID underneath a right-looking result.",
    },
    {
      id: "read-level", kind: "gauge", target: "level-gauge",
      title: "Read the level against the reference range",
      cue: "Read where the result falls on the reference-range gauge before saying anything about it.",
      gauge: { label: "BIOMARKER LEVEL", speed: 0.65, green: [0.0, 0.5], readout: (t) => (t <= 0.5 ? "within reference range" : "above reference range — flagged"), missNote: "Committed before actually reading where the marker landed — the explanation that follows has to match the number on the gauge, not a guess at it." },
      why: "Reading the gauge first, and only then speaking, is what keeps the explanation anchored to the actual number instead of to whatever the coordinator remembers from skimming the report a minute earlier.",
    },
    {
      id: "explain-ranges", kind: "select", target: "range-panel",
      title: "Explain the reference ranges",
      cue: "Walk the participant through what the reference range represents and where their result sits on it.",
      why: "A number means nothing on its own — the reference range is the context that turns \"14 micrograms\" into \"within what's typically seen\" or \"above it,\" and that context belongs to the participant as much as the number does.",
    },
    {
      id: "meaning-panel", kind: "select", target: "meaning-board",
      title: "Explain what a level means and does not mean",
      cue: "Say plainly what this result does and does not tell the participant about their health.",
      why: "A biomarker level is evidence of exposure, not a diagnosis, a prognosis or a verdict on a specific source — saying both halves of that, together, is what keeps a participant from either dismissing a real flag or carrying home a fear the number never actually supported.",
    },
    {
      id: "referral", kind: "select", target: "referral-desk",
      title: "Refer a flagged result to a clinician",
      cue: "Schedule the clinical referral for any result above the reference range.",
      why: "A referral is not an accusation, it is the next competent step — this programme's coordinators are trained to explain a level, not to diagnose from one, and a flagged result belongs in front of a clinician who can actually evaluate it in the context of this participant's own health.",
    },
    {
      id: "answer-questions", kind: "hold", target: "question-chair", seconds: 5,
      title: "Hold space for questions",
      cue: "Sit with the participant and hold the floor open for whatever they want to ask.",
      why: "A visit that ends the moment the report is explained treats the participant as a recipient of information rather than a person making sense of something new about their own body — holding the space open, rather than moving straight to wrap-up, is what actually answers the questions instead of just permitting them.",
      holdBreakNote: "The question time was cut short — a participant who was still working up to their real question does not always ask it in the first few seconds.",
    },
    {
      id: "give-copy", kind: "drag", target: "report-copy",
      title: "Hand the participant their own copy",
      cue: "Give the participant a printed copy of their own report before they leave.",
      drag: { to: "participant-hands", radius: 0.45, missNote: "Not into the participant's own hands. A copy left on the table is not a copy they were actually given to keep." },
      why: "The right to their own results does not end when the explanation does — a participant who leaves with nothing in hand has no way to show this result to the clinician they were just referred to, or to anyone else they choose to share it with.",
    },
    {
      id: "confidential-storage", kind: "turn", target: "file-lock",
      title: "Lock the file cabinet",
      cue: "Turn the lock closed on the file drawer now that this participant's file is put away.",
      turn: { turns: 0.5, axis: "y", label: "FILE LOCK" },
      why: "Every other participant's report lives in that same drawer, and a cabinet left unlocked between visits is a confidentiality failure waiting for whoever walks past next — locking it is the last physical act that keeps this room's files as protected as the conversation that just happened in it.",
    },
    {
      id: "closing-sequence", kind: "sequence",
      targets: ["confirm-understanding", "schedule-followup"],
      itemNames: { "confirm-understanding": "confirmed the participant understood", "schedule-followup": "follow-up scheduled" },
      title: "Close the visit",
      cue: "Confirm the participant understood what was explained, then schedule any follow-up before they leave.",
      why: "Confirming understanding comes before scheduling anything, because a follow-up booked for a participant who is still confused about what today's visit even told them is a follow-up built on a misunderstanding nobody caught in time to fix it cheaply.",
      outOfOrderNote: "Confirm understanding first, then schedule the follow-up — scheduling before checking understanding assumes the explanation landed when nobody has actually asked.",
    },
    {
      id: "record-visit", kind: "select", target: "visit-log",
      title: "Record the visit",
      cue: "Log today's return visit — the result explained, the referral if any, and the participant's understanding confirmed.",
      why: "The record of this visit is what lets the next coordinator, or a clinician the participant sees later, know this result was already explained once, carefully, rather than starting the conversation over from a blank file.",
    },
    {
      id: "final-privacy-check", kind: "find", noHint: true,
      targets: ["other-file-open", "file-drawer-ajar"],
      itemNames: { "other-file-open": "another participant's file left open on screen", "file-drawer-ajar": "the file drawer left ajar" },
      itemNotes: {
        "other-file-open": "A different participant's report is still sitting open on the second monitor from an earlier visit — left up, it is readable by the next person who sits at this desk.",
        "file-drawer-ajar": "The file drawer didn't latch all the way when it was locked — ajar, it is exactly as open as if the lock had never been turned.",
      },
      title: "Check the room before the next participant sits down",
      cue: "Look at the desk and the file cabinet, and click anything still exposed from an earlier visit.",
      why: "This room turns over from one participant to the next all day, and whatever is left showing from the visit before this one is the first thing the next participant sees when they sit down — the walk-round is what keeps one visit's privacy from leaking into the next.",
    },
  ],

  interrupts: [
    {
      id: "wrong-id-on-page",
      kind: "Mismatched result",
      after: "confirm-details", delay: 2, seconds: 12,
      alert: "Partway down the header, a second result printed on the back page carries a different participant ID than the one on the front.",
      cue: "That page belongs to someone else's file. Pull it before saying anything from it.",
      target: "pull-wrong-page",
      why: "A misprinted or misfiled page inside an otherwise correct report is easy to miss if the header check stops at the front page — catching it here, before a single number from that page is read aloud, is what keeps one participant's result from being explained to a completely different person sitting across the table.",
      missNote: "A number from the mismatched page got read out before anyone noticed whose ID it actually carried. Once a result has been said aloud to the wrong participant, there is no way to un-say it — the harm is in the telling, not just in the file.",
      wrongNote: "Pull the mismatched page. Nothing else on this desk fixes whose result that page actually is.",
    },
    {
      id: "neighbour-wants-results",
      kind: "Third-party request",
      after: "answer-questions", delay: 2, seconds: 12,
      alert: "The participant asks, mid-conversation, whether you can also just tell them what their neighbour's results were — \"she asked me to ask, she doesn't like coming in.\"",
      cue: "Explain why that result stays with the neighbour, without shutting the question down harshly.",
      target: "confidentiality-explainer",
      why: "The participant asking is not doing anything wrong — a curious, well-meaning question deserves a clear, unembarrassed answer about why one person's result cannot be relayed through another, delivered in a way that does not make either the participant or the absent neighbour feel accused of something.",
      missNote: "The conversation moved on without ever actually answering why the neighbour's result can't be shared this way. A question left unanswered here just gets asked again at the next visit, by someone who still doesn't understand why the answer is no.",
      wrongNote: "It's the confidentiality explainer. That is what actually tells this participant why the answer is no, and why it isn't personal.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, RRV_ACCENT);

    // ------------------------------------------------------------- desk
    const desk = group(g, 0, 0, -1.7, 0);
    box(desk, 1.5, 0.72, 0.7, 0, 0.36, 0, 0x4a5561, { rough: 0.65, metal: 0.2 });
    holoTag(desk, "return-visit desk", 0, 0.9, 0, { css: "#7fb0e0", w: 0.44 });

    // Report panel and the two ID cross-check markers.
    const reportPanel = holoPanel(desk, 0.9, 0.6, -0.3, 1.15, -0.1, (cx, w, h) => {
      cx.fillStyle = "#0a1826"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#7fb0e0"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#dcecf9";
      cx.fillText("BIOMONITORING REPORT", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#eaf3fb";
      ["Participant ID: 0417-B", "Name field: intentionally blank", "Collected: this visit's date"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.15)));
    }, { accent: RRV_ACCENT });
    reg(hits, reportPanel, "report-panel");

    const idCardA = decal(desk, 0.22, 0.1, 0.35, 0.76, 0, signFace("RPT ID 0417-B", { bg: "#0d1c24", accent: "#7fb0e0", fg: "#dff1f8", scale: 0.5 }));
    idCardA.rotation.x = -Math.PI / 2;
    reg(hits, idCardA, "match-report-id");
    const idCardB = decal(desk, 0.22, 0.1, 0.6, 0.76, 0, signFace("INTAKE ID 0417-B", { bg: "#0d1c24", accent: "#7fb0e0", fg: "#dff1f8", scale: 0.5 }));
    idCardB.rotation.x = -Math.PI / 2;
    reg(hits, idCardB, "match-intake-id");

    const headerReview = instrument(desk, -0.3, 0.9, -0.28, { idle: "HEADER --", color: RRV_ACCENT, w: 0.16, d: 0.22 });
    reg(hits, headerReview, "header-review");

    // Stack of other participants' folders, with the wrong-disclosure shortcut.
    const otherFolders = group(desk, 0.55, 0.72, -0.15);
    for (let i = 0; i < 4; i++) box(otherFolders, 0.26, 0.02, 0.34, 0, i * 0.022, 0, 0xd6c99a, { rough: 0.75 });
    holoTag(otherFolders, "hand neighbour's file over?", 0, 0.16, 0, { css: "#f0645b", w: 0.56 });
    reg(hits, otherFolders, "hand-neighbour-file");

    // Skip-ID-check shortcut, a tempting top-of-stack folder.
    const skipIdFolder = box(desk, 0.3, 0.02, 0.4, 0.4, 0.75, 0.15, 0xd6c99a, { rough: 0.75 });
    holoTag(desk, "just open the top file?", 0.4, 0.88, 0.15, { css: "#f0645b", w: 0.5 });
    reg(hits, skipIdFolder, "skip-id-check");

    // ------------------------------------------------------------- gauge / ranges
    const levelGauge = instrument(g, 1.6, 0.9, -1.4, { ry: -0.4, idle: "-- ug/L", color: RRV_ACCENT, w: 0.17, d: 0.22 });
    holoTag(g, "biomarker level", 1.6, 1.12, -1.4, { css: "#7fb0e0", w: 0.4 });
    reg(hits, levelGauge, "level-gauge");

    const rangePanel = holoPanel(g, 0.8, 0.5, 2.2, 1.5, -0.7, (cx, w, h) => {
      cx.fillStyle = "#0a1826"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#7fb0e0"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#dcecf9";
      cx.fillText("REFERENCE RANGE", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#eaf3fb";
      ["Typically seen in this population", "This result plotted against it"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.16)));
    }, { ry: -0.6, accent: RRV_ACCENT });
    reg(hits, rangePanel, "range-panel");

    const meaningBoard = holoPanel(g, 0.8, 0.5, 2.3, 1.5, 0.4, (cx, w, h) => {
      cx.fillStyle = "#0a1826"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#7fb0e0"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#dcecf9";
      cx.fillText("WHAT THIS DOES / DOES NOT MEAN", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#eaf3fb";
      ["Evidence of exposure, not a diagnosis", "Not a verdict on any one source"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.16)));
    }, { ry: -0.7, accent: RRV_ACCENT });
    reg(hits, meaningBoard, "meaning-board");

    // Hazard shortcuts, apart from the honest panels.
    const alarmBtn = box(g, 0.16, 0.05, 0.08, 1.9, 0.95, -0.9, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(g, "tell them it causes cancer?", 1.9, 1.08, -0.9, { css: "#f0645b", w: 0.56 });
    reg(hits, alarmBtn, "explain-without-context");

    const dismissBtn = box(g, 0.16, 0.05, 0.08, 1.9, 0.95, 0.6, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(g, "probably fine, skip referral?", 1.9, 1.08, 0.6, { css: "#f0645b", w: 0.56 });
    reg(hits, dismissBtn, "dismiss-flagged");

    // ------------------------------------------------------------- referral
    const referralDesk = group(g, -1.9, 0, -1.2, 0.4);
    box(referralDesk, 0.6, 0.7, 0.4, 0, 0.35, 0, 0x4a5561, { rough: 0.65, metal: 0.2 });
    const referralDecal = decal(referralDesk, 0.3, 0.4, 0, 0.71, 0, paperFace("CLINICAL REFERRAL", ["Flagged result", "Referred to: clinician", "Date: ______"], { scale: 0.85 }));
    referralDecal.rotation.x = -Math.PI / 2;
    holoTag(referralDesk, "referral", 0, 0.9, 0, { css: "#7fb0e0", w: 0.28 });
    reg(hits, referralDecal, "referral-desk");

    // ------------------------------------------------------------- seating
    const participant = seatedFigure(g, 0, 0, 0.2, { skin: 0xc99878, cloth: 0x5c7a8f, ry: 3.0 });
    holoTag(participant.root, "participant", 0, 1.7, 0, { css: "#7fb0e0", w: 0.3 });
    const participantHands = group(participant.torso, 0, 0.55, 0.28);
    hits["participant-hands"] = participantHands;

    const questionChair = group(g, -0.7, 0, 0.5, 0.6);
    box(questionChair, 0.42, 0.05, 0.42, 0, 0.44, 0, 0x3c5a66, { radius: 0.03, rough: 0.6 });
    box(questionChair, 0.42, 0.5, 0.05, 0, 0.68, -0.19, 0x3c5a66, { radius: 0.03, rough: 0.6 });
    for (const [sx, sz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
      cyl(questionChair, 0.02, 0.02, 0.42, sx, 0.21, sz, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 8 });
    }
    reg(hits, questionChair, "question-chair");

    const reportCopy = decal(desk, 0.24, 0.16, -0.2, 0.75, 0.22, paperFace("YOUR COPY", ["biomonitoring report"], { bg: "#fbf3df", band: "#3c8f6f" }), { px: 200 });
    reg(hits, reportCopy, "report-copy");

    const confidExplainer = decal(g, 0.32, 0.18, -0.7, 1.05, 0.5, paperFace("WHY NOT", ["Each result is only shared", "with the participant it belongs to"], { bg: "#fbf3df", band: "#3c8f6f" }), { px: 220 });
    reg(hits, confidExplainer, "confidentiality-explainer");

    // ------------------------------------------------------------- file cabinet
    const fileCab = cabinet(g, 0.9, 1.1, 0.5, -2.4, 0.55, 1.3, 0xd7dce1, { doorColor: 0xc7ccd1 });
    const lockKnob = group(fileCab, 0.3, -0.1, 0.26);
    cyl(lockKnob, 0.02, 0.02, 0.04, 0, 0, 0, 0xb8402f, { rough: 0.4, metal: 0.6, seg: 12 });
    holoTag(fileCab, "file lock", 0.3, 0.15, 0.26, { css: "#7fb0e0", w: 0.28 });
    reg(hits, lockKnob, "file-lock");
    const drawerAjar = box(fileCab, 0.85, 0.34, 0.06, 0, -0.05, 0.28, 0xc7ccd1, { rough: 0.5 });
    drawerAjar.rotation.y = 0.0;
    reg(hits, drawerAjar, "file-drawer-ajar");

    // Second monitor with an earlier visit's report still up — privacy trap.
    const otherMonitor = instrument(g, 1.0, 0.9, -2.1, { ry: 0.3, idle: "ID 0288-A OPEN", color: 0xf0645b, w: 0.18, d: 0.24 });
    reg(hits, otherMonitor, "other-file-open");

    // ------------------------------------------------------------- closing
    const closingBoard = holoPanel(g, 0.7, 0.44, -1.9, 1.5, 0.9, (cx, w, h) => {
      cx.fillStyle = "#0a1826"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#7fb0e0"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#dcecf9";
      cx.fillText("CLOSE THE VISIT", w * 0.06, h * 0.18);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#eaf3fb";
      ["Understanding confirmed", "Follow-up scheduled"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.16)));
    }, { ry: 0.6, accent: RRV_ACCENT });
    const CLOSE_ROWS = [["confirm-understanding", -0.1], ["schedule-followup", 0.1]];
    for (const [id, dy] of CLOSE_ROWS) {
      const marker = box(closingBoard, 0.5, 0.01, 0.05, 0, dy, 0.05, RRV_ACCENT, { rough: 0.6, emissive: RRV_ACCENT, ei: 0.3 });
      reg(hits, marker, id);
    }

    const visitLog = holoPanel(g, 0.6, 0.4, -0.6, 1.5, 1.9, (cx, w, h) => {
      cx.fillStyle = "#0a1826"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#7fb0e0"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillStyle = "#dcecf9";
      cx.fillText("VISIT LOG", w / 2, h * 0.35);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#eaf3fb";
      cx.fillText("Result · referral · understanding", w / 2, h * 0.68);
    }, { accent: RRV_ACCENT });
    reg(hits, visitLog, "visit-log");

    // Wrong-page interrupt target: a second page on the desk with a mismatched ID.
    const wrongPage = decal(desk, 0.24, 0.16, -0.55, 0.75, -0.22, paperFace("BACK PAGE", ["ID 0288-A"], { bg: "#fbf3df", band: "#b81410" }), { px: 200 });
    wrongPage.visible = false;
    reg(hits, wrongPage, "pull-wrong-page");

    // Neighbour figure, seated apart, associated with the confidentiality question.
    const neighbourHome = { x: 1.6, z: 1.7, ry: -2.5 };
    const neighbour = standingFigure(g, neighbourHome.x, neighbourHome.z, { ry: neighbourHome.ry, cloth: 0x6b7f6a, skin: 0xb98a63 });
    holoTag(neighbour, "neighbour, waiting outside", 0, 1.9, 0, { css: "#8fa2af", w: 0.5 });

    // Coordinator standing clear of the desk and file cabinet.
    const coordinator = standingFigure(g, 0.05, -0.9, { ry: 2.9, cloth: 0x3c5a66, vest: RRV_ACCENT });
    holoTag(coordinator, "field coordinator", 0, 1.95, 0, { css: "#7fb0e0", w: 0.4 });

    let idVerified = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -0.9),

      onStepComplete(step) {
        if (step.id === "verify-id") {
          idVerified = true;
          repaint(headerReview.userData.screen, signFace("MATCHED", { bg: "#0d1c24", accent: "#59c97b", fg: "#dff1f8", scale: 0.55 }));
        }
        if (step.id === "read-level") {
          repaint(levelGauge.userData.screen, signFace("14.2 ug/L", { bg: "#0d1c24", accent: "#f2ae14", fg: "#dff1f8", scale: 0.55 }));
        }
        if (step.id === "give-copy") { reportCopy.visible = false; }
        if (step.id === "confidential-storage") { drawerAjar.position.z = 0.24; }
        if (step.id === "final-privacy-check") {
          repaint(otherMonitor.userData.screen, signFace("locked", { bg: "#0d1c24", accent: "#59c97b", fg: "#dff1f8", scale: 0.55 }));
          drawerAjar.position.z = 0.2;
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "wrong-id-on-page") { wrongPage.visible = true; }
        if (it.id === "neighbour-wants-results") {
          neighbour.position.set(1.0, 0, 1.2);
          neighbour.rotation.y = -2.0;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wrong-id-on-page") { wrongPage.visible = false; }
        if (it.id === "neighbour-wants-results") {
          neighbour.position.set(neighbourHome.x, 0, neighbourHome.z);
          neighbour.rotation.y = neighbourHome.ry;
        }
      },
      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "read-level") {
          repaint(levelGauge.userData.screen, signFace(`${(6 + gg.t * 18).toFixed(1)} ug/L`, {
            bg: "#0d1c24", accent: gg.t <= 0.5 ? "#59c97b" : "#f2ae14", fg: "#dff1f8", scale: 0.55,
          }));
        }
        if (session?.track && session.step?.id === "confirm-details") {
          repaint(headerReview.userData.screen, signFace(session.track.v >= 0.35 && session.track.v <= 0.65 ? "checking..." : "re-check", {
            bg: "#0d1c24", accent: session.track.v >= 0.35 && session.track.v <= 0.65 ? "#59c97b" : "#f2ae14", fg: "#dff1f8", scale: 0.5,
          }));
        }
        if (session?.turn && session.step?.id === "confidential-storage") { lockKnob.rotation.z = session.turn.amount * Math.PI; }
        participant.head.rotation.y = Math.sin(t * 0.45) * 0.05;
        void idVerified;
      },
    };
  },
};
