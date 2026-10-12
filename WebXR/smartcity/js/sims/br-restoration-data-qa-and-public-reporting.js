import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, repaint, mat, signFace } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument, reg,
  surfaceTexture, texturedMat, deckPlateFace,
} from "../citykit.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Restoration Data QA & Public Reporting VR — SF Bay
// Restoration & Cleanup, Pack E (ecology, monitoring and community
// science).
//
// A dockside field office, decked in anti-slip steel plate the way the
// rest of this pack's vessels are, where the learner is the data QA
// technician who turns a stack of field sheets into the shared restoration
// database and, once every record is cleared, the one line the public
// dashboard is allowed to say about what the data actually shows. Nothing
// on the dashboard ever claims more than the reviewed numbers behind it —
// a caption is edited to match the data, never the other way around — and
// every sample handed off between the field crew and this desk is logged
// under the same chain-of-custody discipline the sediment labs in this
// programme already use, built on EPA QA/G-5.

const BRDQ_ACCENT = 0x5a9ec8;
const BRDQ_CSS = "#5a9ec8";
const BRDQ_GREEN = 0x59c97b;
const BRDQ_AMBER = 0xe8b02e;
const BRDQ_RED = 0xd2312b;

export const SIM_BR_RESTORATION_DATA_QA_AND_PUBLIC_REPORTING = {
  id: "br-restoration-data-qa-and-public-reporting",
  index: "347",
  domain: "Environmental Monitoring",
  trade: "Restoration data QA technician, moving field sheets into the shared database and preparing the public dashboard summary for the restoration programme's agency scientists",
  category: "Environmental Monitoring",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "EPA QA/G-5 guidance for quality assurance project plans and the chain-of-custody practice built on it; EPA 40 CFR Part 136 test procedures for the analysis of pollutants; Regional Water Quality Control Board (RWQCB) monitoring conditions requiring a public accounting of the data; San Francisco Bay Conservation and Development Commission (BCDC) Bay Plan permit reporting conditions; NOAA tide predictions and species-detection timing behind several of the datasets this desk reviews",
  name: "Restoration Data QA & Public Reporting",
  title: simTitle("Restoration Data QA & Public Reporting"),
  tagline: "The desk between a field sheet and the public: every incoming sheet checked for a missing signature or a value out of range before it's scanned, every sample logged into custody the moment it's handed off, a suspect record held for review rather than typed straight in, a reporter's early call routed to the agency's own public information line instead of answered off the cuff, a sync conflict resolved rather than overwritten, and a dashboard caption that says only what the reviewed data actually shows",
  accent: BRDQ_ACCENT,
  accentCss: BRDQ_CSS,
  parSeconds: 300,
  footprint: 3.0,
  badge: { id: "clean-record-clean-caption", name: "Clean Record, Clean Caption", note: "Every field sheet was checked before scanning, the suspect value was flagged rather than typed straight in, the reporter's call was routed rather than answered off the cuff, and the dashboard caption said only what the data showed" },

  supportLine: "your agency's employee assistance programme, with the agency's own data-integrity office behind it",

  game: system({
    name: "Data QA Watch",
    currency: "RECORDS",
    ranks: ["Data Entry Aide", "QA Technician", "Senior QA Technician", "Lead QA Reviewer", "Data QA Certified"],
    badges: [
      { id: "true-check", name: "True Check", note: "Every field sheet checked for a missing signature or an out-of-range value before it was scanned", test: AWARD.stepClean("check-sheet") },
      { id: "clean-record", name: "Clean Record", note: "Never typed a suspect value straight in, never broke custody, never published an unreviewed record", test: AWARD.safe },
      { id: "held-the-commit", name: "Held The Commit", note: "The batch committed inside the correct validation window, first time", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-batch", name: "Clean Batch", note: "No corrections across the whole intake", test: AWARD.clean },
      { id: "steady-review", name: "Steady Review", note: "Held the QA scan in band through the whole validation pass", test: AWARD.unbroken },
      { id: "logged-fast", name: "Logged Fast", note: "Batch closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-out-of-range-check": "You typed the out-of-range value straight into the database instead of flagging it for review. A number outside the expected range is either a real finding or a transcription error, and the only way to tell the difference is a second look before it's in the record — entering it unflagged means the database can no longer tell a QA reviewer which one it was looking at.",
    "break-chain-of-custody": "You handed the sample dataset off to the lab without logging the transfer first. A chain of custody with a gap in it is a chain of custody that can't actually vouch for the data on the other end of the gap, and EPA QA/G-5 exists precisely so a result can be traced back through every hand it passed through — skipping one entry breaks that trace for every record in the batch, not just the one you didn't log.",
    "publish-unreviewed-record": "You published the dashboard with a record still sitting in the unreviewed queue. The public dashboard is supposed to show what the programme's data has actually confirmed, and a record nobody has QA-cleared yet is a number the programme hasn't actually stood behind — publishing it anyway turns the dashboard into a claim the agency can't back up if that record turns out to be wrong.",
    "editorialize-dashboard-caption": "You wrote a caption claiming a trend the reviewed data doesn't actually show. The dashboard's entire credibility rests on saying only what the numbers behind it say, and a caption that reaches past that — even to describe something that's probably true, or that would be good news for the programme — is exactly how a public reporting page stops being trusted the first time someone checks the caption against the chart underneath it.",
  },

  lateNotes: {
    "commit-gauge": "Nothing to read yet — the batch has to actually be validating before there's a commit window to watch.",
    "custody-log": "Nothing to log yet — nothing has been handed off or entered worth an entry.",
  },

  interrupts: [
    {
      id: "reporter-calls-early",
      kind: "A reporter calls asking for today's number before QA has cleared it",
      after: "hold-review", delay: 2, seconds: 14,
      alert: "A reporter is on the line asking for today's result before the batch has actually cleared QA.",
      cue: "Don't give out the unreviewed number — route the call to the agency's public information line instead.",
      target: "pio-transfer",
      why: "An unreviewed number handed to a reporter becomes a published number the moment they hang up, whatever caveats were said out loud, and the agency's public information line exists exactly so a reporter gets an answer that's actually been cleared instead of whatever's on the screen at this desk right now — the transfer is the whole safeguard, not a formality to get through before answering anyway.",
      missNote: "The call went unanswered while the unreviewed number sat right there on the screen — exactly what the transfer exists to keep out of a reporter's hands.",
      wrongNote: "The public information transfer — that's the one line that answers a reporter with something actually cleared.",
    },
    {
      id: "database-sync-conflict",
      kind: "The database flags a sync conflict on the record being entered",
      after: "data-entry", delay: 2, seconds: 14,
      alert: "The database flags a sync conflict: another technician's edit landed on this same record while you were entering yours.",
      cue: "Resolve the conflict at the terminal before continuing — do not just overwrite the other technician's entry.",
      target: "conflict-resolve-terminal",
      why: "Overwriting a conflicting edit silently erases whatever the other technician actually saw and typed, and there is no way to tell from this desk alone which entry is the mistake — resolving the conflict at the terminal is what keeps both versions visible long enough for someone to actually work out which one belongs in the record.",
      missNote: "The conflict sat unresolved while entry kept going, with no way left to tell which version of the record was correct.",
      wrongNote: "The conflict-resolution terminal — that's the one place both versions of the record are still visible.",
    },
  ],

  steps: [
    {
      id: "ppe-brief", kind: "sequence", anyOrder: true,
      targets: ["gloves-on", "badge-in", "workstation-on"],
      itemNames: { "gloves-on": "gloves on for the sample coolers", "badge-in": "badged into the office", "workstation-on": "workstation powered on" },
      title: "Set up the desk before the first sheet",
      cue: "Before opening a single field sheet: gloves on for handling the sample coolers, badged into the office, workstation powered on.",
      why: "The coolers that come off this morning's field run carry the same sediment and Bay water the divers and the shoreline crews were standing in, and the gloves that keep that off the desk are as much a part of this job as the keyboard is — none of it starts until the desk itself is actually ready to receive it.",
    },
    {
      id: "entry-standards-board", kind: "select", target: "entry-standards-board",
      title: "Read today's data entry standard",
      cue: "Read the entry standards board: required fields, unit format, and what counts as an out-of-range value for today's dataset.",
      why: "A value entered in the wrong unit or missing a required field is a value the database can't actually use no matter how correct the number itself is, and reading the standard before the first sheet is opened is what keeps today's batch consistent with every batch already in the database rather than its own private format.",
    },
    {
      id: "field-sheet-intake", kind: "select", target: "field-sheet-intake",
      title: "Read the incoming field sheet",
      cue: "Read the field sheet that came in with this morning's cooler: site, date, who collected it and what was measured.",
      why: "Everything that happens to this data for the rest of its life traces back to what's actually written on this sheet, and reading it in full before touching the database is what catches a field crew's shorthand or an abbreviation this desk doesn't use yet before it becomes an entry nobody downstream can interpret.",
    },
    {
      id: "check-sheet", kind: "find", noHint: true,
      targets: ["missing-signature", "out-of-range-value"],
      itemNames: { "missing-signature": "the field sheet, missing the collector's signature", "out-of-range-value": "a value on the sheet outside the expected range" },
      itemNotes: {
        "missing-signature": "No signature means no one has actually attested this sheet is what they collected — it goes back to the field crew before it goes anywhere near the database.",
        "out-of-range-value": "A number this far outside the expected range is either a real finding or a transcription slip, and the sheet alone can't say which — it gets flagged for review, not typed straight in.",
      },
      title: "Check the sheet before it's scanned",
      cue: "Go over the field sheet and find anything wrong with it before it goes anywhere near the scanner.",
      why: "A field sheet with a missing signature or an unexplained out-of-range value is exactly the kind of problem that's cheap to catch now, on paper, before it's in the database — the same problem found after entry means tracing a bad record back through the batch it's already mixed into.",
    },
    {
      id: "scan-sheet", kind: "drag", target: "field-sheet",
      title: "Scan the sheet into the record",
      cue: "Drag the field sheet to the scanner and digitize it before entering anything from it by hand.",
      why: "The scanned image is the permanent record of exactly what the field crew wrote, independent of whatever gets typed into the database afterward, and scanning it before entry is what lets a QA reviewer months from now check the actual sheet against the record instead of trusting that today's entry was typed correctly.",
      drag: { to: "scanner-socket", radius: 0.4, missNote: "Not on the scanner bed — the sheet has to actually sit on the glass to digitize." },
    },
    {
      id: "label-dial", kind: "turn", target: "label-dial",
      title: "Print today's chain-of-custody label",
      cue: "Turn the label printer's dial to today's batch number and print the chain-of-custody label for this sample.",
      turn: { turns: 0.6, label: "BATCH LABEL" },
      why: "A sample without its own custody label is a sample that can only be identified by whoever remembers which cooler it came out of, and printing the label to today's actual batch number — not yesterday's, not left on the dial from the last run — is what lets this sample be tracked the moment it leaves this desk.",
    },
    {
      id: "data-entry", kind: "sequence",
      targets: ["site-id-entered", "values-entered", "qa-flag-set"],
      itemNames: { "site-id-entered": "site ID entered", "values-entered": "measured values entered", "qa-flag-set": "QA flag set on the out-of-range value" },
      outOfOrderNote: "Enter the site ID before the values — a value with no site attached to it yet is a number the database can't place anywhere.",
      title: "Enter the record in order",
      cue: "Enter the site ID, then the measured values, then set the QA flag on the value the sheet check found out of range.",
      why: "A value entered before its site ID is a number floating with nothing to anchor it, and the QA flag entered last is what carries forward everything the sheet check already found — skipping it here is how a flag caught on paper at the start of this station quietly disappears by the time the record reaches the database.",
    },
    {
      id: "custody-log", kind: "select", target: "custody-log",
      title: "Log the chain-of-custody hand-off",
      cue: "Log the hand-off: sample received from the field crew, logged into this desk, and the batch label recorded.",
      why: "EPA QA/G-5's chain-of-custody practice only works if every hand-off is actually logged the moment it happens, and a sample that sits on this desk for an hour before the log entry catches up is an hour this record can't actually account for if anyone ever asks where the sample was.",
    },
    {
      id: "validation-scan", kind: "track", target: "qa-terminal", seconds: 6,
      title: "Scan the batch for validation flags",
      cue: "Hold a steady scan across the batch validation readout — don't rush past a flag or drift past the end of the list.",
      track: { start: 0.13, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.12, label: "BATCH SCAN", readout: (v) => (v < 0.4 ? "scanning too fast — a flag near the top missed" : v > 0.62 ? "scanning too slow — the list isn't finishing" : "batch scanned clean") },
      why: "The validation readout lists every record the software itself flagged as suspect, and a scan that rushes past the top of the list or never actually reaches the bottom of it is a review that only looks like it happened — the whole point of running this scan is to actually see every flag the software raised, not to have the terminal open while looking somewhere else.",
      holdBreakNote: "The scan lost the readout before it reached the end of the list — steady it and pick the pass back up.",
    },
    {
      id: "hold-review", kind: "hold", target: "qa-terminal", seconds: 5,
      title: "Hold while the automated validation runs",
      cue: "Hold the terminal's review screen open while the automated validation pass runs against today's batch.",
      why: "The automated pass checks every record against the entry standard's ranges and required fields in a way no person scanning by eye can match, and closing the screen before it finishes is how a batch gets committed on a validation that never actually completed — the hold is what makes sure the pass runs to the end before anything downstream trusts its result.",
      holdBreakNote: "The review screen closed before validation finished — reopen it and hold it through to the end of the pass.",
    },
    {
      id: "commit-gauge", kind: "gauge", target: "commit-gauge",
      title: "Commit the batch inside the validation window",
      cue: "Watch the commit gauge and commit the batch once validation reads complete — not before it, and not so late the session times out.",
      gauge: { label: "VALIDATION PROGRESS", speed: 0.55, green: [0.46, 0.64], readout: (t) => (t < 0.46 ? "too early — validation still running" : t <= 0.64 ? "validation complete — commit now" : "session ageing — commit before it times out"), missNote: "Off the band. The validation pass has to actually finish before the batch is committed, and the session won't wait forever after it does." },
      why: "Committing before validation finishes puts unchecked records straight into the shared database, and waiting too long after it finishes risks the whole session timing out and losing the batch entirely — the window on the gauge is the one span where the commit actually means what it's supposed to mean.",
    },
    {
      id: "flag-review", kind: "select", target: "qa-flag-terminal",
      title: "Review the flagged record",
      cue: "Open the QA-flagged record and confirm whether the out-of-range value is a real finding or a transcription error before it's cleared.",
      why: "A flag is only useful if someone actually looks at the record it's attached to and makes a call, and clearing a flag automatically the moment the batch commits is functionally the same as never flagging it at all — the review is the one step that turns 'this looked odd' into 'this was checked and here's what we found.'",
    },
    {
      id: "dashboard-checklist", kind: "sequence",
      targets: ["caption-matches-data", "unreviewed-removed", "publish-confirmed"],
      itemNames: { "caption-matches-data": "caption checked against the reviewed chart", "unreviewed-removed": "any unreviewed record removed from the draft", "publish-confirmed": "publish confirmed" },
      outOfOrderNote: "Check the caption and clear unreviewed records before confirming publish — there's nothing to confirm on a draft that hasn't actually been checked yet.",
      title: "Run the dashboard publish checklist in order",
      cue: "Check the caption against the reviewed chart, remove any record still unreviewed, then confirm publish.",
      why: "A dashboard published out of order — confirmed before the caption is actually checked, or before an unreviewed record is pulled — is a dashboard the public sees before anyone actually verified it says only what the data shows, which is the entire reason this checklist runs in this order and not some other one.",
    },
    {
      id: "crew-checkin", kind: "select", target: "office-radio",
      title: "Check in with the agency's data lead",
      cue: "On the working line: the batch is committed, the reporter's call and the sync conflict are both handled, and the dashboard is live with a caption that matches the chart.",
      why: "A batch with an early reporter call and a sync conflict both in it is a batch that needed more than the usual amount of judgement calls, and the check-in is where that gets acknowledged directly rather than assumed — it's also where a QA technician's own read on a tense intake gets a place to go besides staying with them at the desk.",
    },
    {
      id: "closing-log", kind: "select", target: "custody-log",
      title: "Close out the intake log",
      cue: "Close the log: every sheet accounted for, custody unbroken, the batch committed, and the dashboard published with a checked caption.",
      why: "The closing entry is what turns today's individual checks and holds into the record the agency's own data-integrity review is actually built from — a log closed out completely, in order, is the difference between a QA desk that can show exactly how a batch was handled and one that raises a question nobody here can answer months later.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRDQ_ACCENT);

    // ------------------------------------------------------------- the floor
    const floorTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#232b33", base2: "#1b222a" }), { repeat: 4, px: 256 });
    const floor = box(g, 20, 0.06, 16, 0, 0.03, -2, 0x232b33, { rough: 0.6, metal: 0.4 });
    floor.material = texturedMat(floorTex, { rough: 0.6, metal: 0.4, color: 0x9aa4ac });

    // ------------------------------------------------------------ the window
    const windowFrame = box(g, 2.6, 1.3, 0.06, -3.4, 1.7, -3.5, 0x2b3138, { rough: 0.5, metal: 0.5 });
    void windowFrame;
    const windowGlass = box(g, 2.3, 1.0, 0.02, -3.4, 1.7, -3.48, 0x9ecbe0, { rough: 0.1, metal: 0.1, opacity: 0.5, transparent: true });
    void windowGlass;
    holoTag(g, "dockside office window", -3.4, 2.4, -3.5, { css: BRDQ_CSS, w: 0.4 });

    // -------------------------------------------------------------- the desk
    const deskGrp = group(g, 0, 0, 0.6);
    box(deskGrp, 1.5, 0.05, 0.7, 0, 0.75, 0, 0x6a5a45, { rough: 0.5, metal: 0.15 });
    for (const dx of [-0.65, 0.65]) box(deskGrp, 0.06, 0.75, 0.06, dx, 0.375, 0.3, 0x4a3f30, { rough: 0.6 });

    // ---------------------------------------------------------- the monitors
    const monitorGrp = group(deskGrp, -0.3, 0.78, -0.1);
    cyl(monitorGrp, 0.03, 0.05, 0.24, 0, 0.12, 0, 0x1b1e23, { rough: 0.5, metal: 0.5, seg: 10 });
    box(monitorGrp, 0.5, 0.3, 0.02, 0, 0.4, 0, 0x1b1e23, { rough: 0.4, metal: 0.4 });
    const qaScreen = box(monitorGrp, 0.46, 0.26, 0.01, 0, 0.4, 0.011, 0x0d1c24, { rough: 0.35, emissive: BRDQ_CSS, ei: 0.4 });
    holoTag(monitorGrp, "QA terminal", 0, 0.6, 0, { css: BRDQ_CSS, w: 0.3 });
    reg(hits, qaScreen, "qa-terminal");

    const conflictMonitor = group(deskGrp, 0.4, 0.78, -0.1);
    cyl(conflictMonitor, 0.03, 0.05, 0.24, 0, 0.12, 0, 0x1b1e23, { rough: 0.5, metal: 0.5, seg: 10 });
    box(conflictMonitor, 0.46, 0.28, 0.02, 0, 0.38, 0, 0x1b1e23, { rough: 0.4, metal: 0.4 });
    const conflictScreen = box(conflictMonitor, 0.42, 0.24, 0.01, 0, 0.38, 0.011, 0x0d1c24, { rough: 0.35, emissive: BRDQ_GREEN, ei: 0.4 });
    holoTag(conflictMonitor, "database terminal", 0, 0.58, 0, { css: BRDQ_CSS, w: 0.34 });
    reg(hits, conflictScreen, "conflict-resolve-terminal");

    // ------------------------------------------------------------ field sheet
    const sheetGrp = group(deskGrp, 0.75, 0.78, 0.15, -0.3);
    const sheet = box(sheetGrp, 0.22, 0.006, 0.3, 0, 0, 0, 0xece4d0, { rough: 0.7, cast: false });
    holoTag(sheetGrp, "field sheet", 0, 0.05, 0, { css: BRDQ_CSS, w: 0.24 });
    reg(hits, sheet, "field-sheet");
    const sheetHome = sheet.getWorldPosition(new THREE.Vector3());
    const missingSig = box(sheetGrp, 0.16, 0.004, 0.03, 0, 0.004, 0.11, 0xd2312b, { rough: 0.6, cast: false });
    reg(hits, missingSig, "missing-signature");
    const outOfRange = box(sheetGrp, 0.1, 0.004, 0.02, -0.02, 0.004, -0.05, 0xe8b02e, { rough: 0.6, cast: false });
    reg(hits, outOfRange, "out-of-range-value");

    // -------------------------------------------------------------- scanner
    const scannerGrp = group(deskGrp, 0.75, 0.78, -0.2);
    box(scannerGrp, 0.32, 0.05, 0.24, 0, 0, 0, 0xd8dde0, { rough: 0.4, metal: 0.2 });
    box(scannerGrp, 0.28, 0.005, 0.2, 0, 0.028, 0, 0x2b3138, { rough: 0.2, metal: 0.3, opacity: 0.7, transparent: true });
    holoTag(scannerGrp, "scanner", 0, 0.14, 0, { css: BRDQ_CSS, w: 0.24 });
    const scannerSocket = group(scannerGrp, 0, 0.03, 0);
    hits["scanner-socket"] = scannerSocket;

    // -------------------------------------------------------- label printer
    const labelPrinter = instrument(g, -1.4, 0.86, 1.2, { color: 0x2b3138, idle: "BATCH", w: 0.14, d: 0.18 });
    const labelDial = cyl(labelPrinter, 0.025, 0.025, 0.03, 0, 0.03, 0.07, 0xc8ced4, { rough: 0.4, seg: 10 });
    labelDial.rotation.x = Math.PI / 2;
    holoTag(labelPrinter, "label printer", 0, 0.2, 0.05, { css: BRDQ_CSS, w: 0.28 });
    reg(hits, labelPrinter, "label-dial");

    // ---------------------------------------------------------- data entry markers
    const siteIdMarker = group(g, -0.5, 0.85, 0.6);
    box(siteIdMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, siteIdMarker, "site-id-entered");
    const valuesMarker = group(g, -0.3, 0.85, 0.6);
    box(valuesMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, valuesMarker, "values-entered");
    const qaFlagMarker = group(g, -0.1, 0.85, 0.6);
    box(qaFlagMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, qaFlagMarker, "qa-flag-set");

    const skipRangeHazard = box(g, 0.4, 0.4, 0.3, -0.3, 1.3, -0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "type it straight in?", -0.3, 1.6, -0.1, { css: "#e8622a", w: 0.4 });
    reg(hits, skipRangeHazard, "skip-out-of-range-check");

    // --------------------------------------------------------- sample rack
    const rackGrp = group(g, 1.8, 0, 0.4);
    box(rackGrp, 0.6, 0.5, 0.4, 0, 0.25, 0, 0x3a4048, { rough: 0.6, metal: 0.3 });
    for (const [cx2, cz2] of [[-0.15, -0.1], [0.15, -0.1], [-0.15, 0.1], [0.15, 0.1]]) {
      cyl(rackGrp, 0.06, 0.06, 0.3, cx2, 0.55, cz2, 0xdfe6ea, { rough: 0.35, seg: 12 });
    }
    holoTag(rackGrp, "sample coolers, from the field", 0, 0.78, 0, { css: BRDQ_CSS, w: 0.5 });
    const custodyLog = holoPanel(g, 0.68, 0.5, 1.8, 1.6, -0.4, (cx, w, h) => drawLog(cx, w, h, ["Sheet: —", "Custody: —", "Batch: —", "Dashboard: —"], false), { ry: -0.3, accent: BRDQ_ACCENT });
    function drawLog(cx, w, h, rows, done) {
      cx.fillStyle = "#0d1c24"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? BRDQ_GREEN : BRDQ_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaf6fb"; cx.fillText("CUSTODY LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#dcecf2";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }
    reg(hits, custodyLog, "custody-log");

    const breakCustodyHazard = box(g, 0.4, 0.4, 0.3, 1.8, 1.0, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "hand it off unlogged?", 1.8, 1.35, 0.7, { css: "#e8622a", w: 0.44 });
    reg(hits, breakCustodyHazard, "break-chain-of-custody");

    // --------------------------------------------------------------- boards
    const entryBoard = holoPanel(g, 0.94, 0.62, -1.9, 1.65, -0.85, (cx, w, h) => {
      cx.fillStyle = "#0d1c24"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRDQ_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.095)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaf6fb"; cx.fillText("DATA ENTRY STANDARD", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#dcecf2";
      ["Required fields: site, date, collector, values", "Units: as printed on the field sheet",
        "Out-of-range: flag, never overwrite", "Confirm before opening the first sheet"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.26 + i * 0.15)));
    }, { ry: 0.5, accent: BRDQ_ACCENT });
    reg(hits, entryBoard, "entry-standards-board");

    const intakeBoard = holoPanel(g, 0.7, 0.5, 0.75, 1.55, -0.35, (cx, w, h) => {
      cx.fillStyle = "#0d1c24"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRDQ_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaf6fb"; cx.fillText("FIELD SHEET INTAKE", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = "#dcecf2";
      ["Site, date, collector on record", "Read in full before entry", "Flag anything unclear"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.17)));
    }, { ry: -0.3, accent: BRDQ_ACCENT });
    reg(hits, intakeBoard, "field-sheet-intake");

    // ---------------------------------------------------------- QA flag terminal
    const qaFlagTerminal = group(g, -1.4, 0.86, -0.6);
    box(qaFlagTerminal, 0.14, 0.1, 0.02, 0, 0, 0, 0x0d1c24, { rough: 0.35, emissive: BRDQ_AMBER, ei: 0.5 });
    holoTag(qaFlagTerminal, "flagged record", 0, 0.16, 0, { css: BRDQ_CSS, w: 0.3 });
    reg(hits, qaFlagTerminal, "qa-flag-terminal");

    const commitGauge = instrument(g, 0.9, 0.86, -1.0, { color: 0x2b3138, idle: "0%", w: 0.1, d: 0.14 });
    holoTag(commitGauge, "validation progress", 0, 0.16, 0.05, { css: BRDQ_CSS, w: 0.34 });
    reg(hits, commitGauge, "commit-gauge");

    // --------------------------------------------------------------- phone / PIO
    const phoneGrp = group(g, -2.0, 0.86, 0.9);
    box(phoneGrp, 0.14, 0.04, 0.16, 0, 0, 0, 0x1b1e23, { rough: 0.5, metal: 0.3 });
    const phoneLight = ball(phoneGrp, 0.015, 0.05, 0.03, 0.06, BRDQ_GREEN, { emissive: BRDQ_GREEN, ei: 1.4, seg: 8 });
    holoTag(phoneGrp, "public information transfer", 0, 0.14, 0, { css: BRDQ_CSS, w: 0.46 });
    reg(hits, phoneGrp, "pio-transfer");

    const publishHazard = box(g, 0.4, 0.4, 0.3, 0.4, 1.5, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "publish before it's cleared?", 0.4, 1.85, -1.3, { css: "#e8622a", w: 0.5 });
    reg(hits, publishHazard, "publish-unreviewed-record");

    // ------------------------------------------------------------ dashboard wall
    const dashboard = holoPanel(g, 1.6, 1.0, 2.6, 1.9, -2.2, (cx, w, h) => drawDash(cx, w, h, "reviewed values only, per site", false), { ry: -0.6, accent: BRDQ_ACCENT });
    function drawDash(cx, w, h, caption, over) {
      cx.fillStyle = "#0d1c24"; cx.fillRect(0, 0, w, h); cx.fillStyle = over ? BRDQ_RED : BRDQ_CSS; cx.fillRect(0, 0, w, 8);
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaf6fb"; cx.fillText("PUBLIC DASHBOARD — DRAFT", w * 0.04, h * 0.1);
      cx.fillStyle = "#8fb8cc";
      for (let i = 0; i < 6; i++) cx.fillRect(w * (0.08 + i * 0.14), h * 0.75 - (10 + i * 14), w * 0.08, 10 + i * 14);
      cx.font = `${Math.round(h * 0.06)}px Arial, sans-serif`; cx.fillStyle = "#dcecf2";
      cx.fillText(`Caption: ${caption}`, w * 0.04, h * 0.9);
    }
    reg(hits, dashboard, "caption-matches-data");
    const editorializeHazard = box(g, 0.4, 0.4, 0.3, 2.6, 1.2, -1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "claim a trend the data doesn't show?", 2.6, 1.55, -1.9, { css: "#e8622a", w: 0.56 });
    reg(hits, editorializeHazard, "editorialize-dashboard-caption");

    const unreviewedMarker = group(g, 2.3, 1.4, -2.0);
    box(unreviewedMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, unreviewedMarker, "unreviewed-removed");
    const publishMarker = group(g, 2.9, 1.4, -2.0);
    box(publishMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, publishMarker, "publish-confirmed");

    // ------------------------------------------------------------- office furnishing
    const cabinetGrp = group(g, -3.3, 0, -1.4);
    box(cabinetGrp, 0.5, 1.3, 0.5, 0, 0.65, 0, 0x5a626a, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 4; i++) box(cabinetGrp, 0.44, 0.28, 0.02, 0, 0.16 + i * 0.3, 0.26, 0x4a525a, { rough: 0.4, metal: 0.5 });
    for (let i = 0; i < 4; i++) box(cabinetGrp, 0.06, 0.03, 0.01, 0, 0.16 + i * 0.3, 0.27, 0xc8ced4, { rough: 0.3, metal: 0.7 });
    holoTag(cabinetGrp, "field sheet archive", 0, 1.4, 0, { css: BRDQ_CSS, w: 0.36 });

    const chairGrp = group(g, 0, 0.1, 1.35, Math.PI);
    cyl(chairGrp, 0.02, 0.02, 0.45, 0, 0.22, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 8 });
    box(chairGrp, 0.4, 0.06, 0.4, 0, 0.46, 0, 0x3a4048, { rough: 0.6 });
    box(chairGrp, 0.4, 0.5, 0.06, 0, 0.72, -0.18, 0x3a4048, { rough: 0.6 });
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; ball(chairGrp, 0.02, Math.cos(a) * 0.2, 0.02, Math.sin(a) * 0.2, 0x1b1e23, { rough: 0.6, seg: 8 }); }

    for (const lx of [-2.5, 2.5]) {
      const lightGrp = group(g, lx, 2.6, -1.0);
      box(lightGrp, 0.6, 0.06, 0.2, 0, 0, 0, 0xe8eef2, { rough: 0.3, emissive: 0xdfe8ee, ei: 0.6 });
    }

    const clockGrp = group(g, -3.4, 2.1, 1.6, 0.5);
    cyl(clockGrp, 0.16, 0.16, 0.03, 0, 0, 0, 0xe8eef2, { rough: 0.4, seg: 20 });
    box(clockGrp, 0.01, 0.1, 0.005, 0, 0.05, 0.02, 0x1b1e23, { rough: 0.5, cast: false });
    holoTag(clockGrp, "office clock", 0, 0.22, 0, { css: BRDQ_CSS, w: 0.24 });

    const corkboardGrp = group(g, -3.45, 1.6, 0.3, 0.5);
    box(corkboardGrp, 0.02, 0.6, 0.8, 0, 0, 0, 0x9a8060, { rough: 0.9 });
    for (const [py, pz] of [[0.15, -0.2], [0.15, 0.2], [-0.1, -0.15], [-0.1, 0.2]]) {
      ball(corkboardGrp, 0.012, 0.012, py, pz, 0xd2312b, { rough: 0.5, seg: 8 });
    }
    holoTag(corkboardGrp, "corkboard", 0, 0.4, 0, { css: BRDQ_CSS, w: 0.24 });

    const lampGrp = group(deskGrp, -0.65, 0.78, 0.28);
    cyl(lampGrp, 0.05, 0.05, 0.02, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 10 });
    cyl(lampGrp, 0.01, 0.01, 0.3, 0, 0.15, 0, 0x8a949d, { rough: 0.4, metal: 0.6, seg: 8 });
    ball(lampGrp, 0.06, 0, 0.32, 0.05, 0xf1c14b, { emissive: 0xf1c14b, ei: 0.8, seg: 10 });

    const powerStrip = box(deskGrp, 0.18, 0.02, 0.05, 0.3, 0.78, 0.3, 0x1b1e23, { rough: 0.6, metal: 0.3 });
    void powerStrip;
    const trashBin = cyl(g, 0.12, 0.1, 0.28, 0.9, 0.14, 1.3, 0x3a4048, { rough: 0.6, metal: 0.3, seg: 12 });
    void trashBin;

    // --------------------------------------------------------------- crew
    const coworker = standingFigure(g, -2.4, -1.6, { ry: 0.9, cloth: 0x3f4a55, vest: false, atStation: true });
    holoTag(coworker, "agency data lead", 0, 1.95, 0, { css: BRDQ_CSS, w: 0.34 });
    const officeRadio = radio(g, -2.2, 0.86, 0.4, { ry: 0.5 });
    holoTag(g, "agency working line", -2.2, 1.1, 0.42, { css: BRDQ_CSS, w: 0.3 });
    reg(hits, officeRadio, "office-radio");

    // --------------------------------------------------------------- PPE / setup
    const glovesRack = group(g, 1.2, 0.7, 1.6);
    box(glovesRack, 0.1, 0.04, 0.16, 0, 0, 0, 0xd8a63a, { rough: 0.7 });
    holoTag(glovesRack, "gloves", 0, 0.1, 0, { css: BRDQ_CSS, w: 0.2 });
    reg(hits, glovesRack, "gloves-on");
    const badgeReader = group(g, -2.6, 1.1, -0.2);
    box(badgeReader, 0.08, 0.1, 0.02, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(badgeReader, "badge reader", 0, 0.14, 0, { css: BRDQ_CSS, w: 0.24 });
    reg(hits, badgeReader, "badge-in");
    const powerButton = group(deskGrp, -0.3, 0.78, 0.18);
    cyl(powerButton, 0.012, 0.012, 0.01, 0, 0, 0, BRDQ_GREEN, { rough: 0.4, seg: 10 });
    reg(hits, powerButton, "workstation-on");

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, 0.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "check-sheet") { missingSig.visible = false; outOfRange.visible = false; }
        if (step.id === "scan-sheet") { sheet.material = mat(0xd8e0e4, { rough: 0.5 }); }
        if (step.id === "custody-log") {
          repaint(custodyLog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Sheet: checked, signature confirmed", "Custody: sample received and logged", "Batch: entry in progress", "Dashboard: not yet published"], false));
        }
        if (step.id === "flag-review") { qaFlagTerminal.children[0].material = mat(BRDQ_GREEN, { emissive: BRDQ_GREEN, ei: 0.6 }); }
        if (step.id === "dashboard-checklist") {
          repaint(dashboard.userData.face, (cx, w, h) => drawDash(cx, w, h, "reviewed values only, per site — no trend claimed", false));
        }
        if (step.id === "crew-checkin") { officeRadio.userData.show?.("BATCH OK\nBOTH HANDLED"); }
        if (step.id === "closing-log") {
          repaint(custodyLog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Sheet: accounted for, filed", "Custody: unbroken end to end", "Batch: committed and cleared", "Dashboard: published, caption checked"], true));
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "reporter-calls-early") { phoneLight.material = mat(BRDQ_RED, { emissive: BRDQ_RED, ei: 2.2 }); }
        if (it.id === "database-sync-conflict") { conflictScreen.material = mat(0x0d1c24, { rough: 0.35, emissive: BRDQ_RED, ei: 0.8 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "reporter-calls-early") { phoneLight.material = mat(BRDQ_GREEN, { emissive: BRDQ_GREEN, ei: 1.4 }); }
        if (it.id === "database-sync-conflict") { conflictScreen.material = mat(0x0d1c24, { rough: 0.35, emissive: BRDQ_GREEN, ei: 0.4 }); }
      },
      animate(t, dt, session) {
        void t; void dt; void sheetHome;
        const step = session?.step;
        if (session?.turn && step?.id === "label-dial") labelDial.rotation.z = session.turn.amount * 4;
        if (session?.gauge && !session.gauge.committed && step?.id === "commit-gauge") {
          const gt = session.gauge.t ?? 0;
          repaint(commitGauge.userData.screen, signFace(`${Math.round(gt * 100)}%`, { bg: "#0d1c24", accent: gt >= 0.46 && gt <= 0.64 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
        void qaScreen;
      },
    };
  },
};
