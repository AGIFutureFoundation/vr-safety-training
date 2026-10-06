import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace,
  cabinet, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Public Comment Prep VR — Community Environmental Justice,
// Hunters Point Edition. A month of patrol logs and monitor readings do not
// testify themselves: this station is the desk work of turning that record
// into three minutes a regulator's hearing will actually hear — every claim
// tied to a dated entry, the chart pulled from the network's own numbers (not
// a guess and not a reading the network's own QA has already flagged), a
// written comment filed with its exhibits attached, a speaker card at the
// registration table, and a statement that never says a word it cannot point
// to a record for. Sited generically: a community office, a hearing on a
// regulator's calendar, no borrowed facts about any one docket.

const PCP_ACCENT = 0xf2c14b;
const PCP_INK = "#2a2015";

export const SIM_PUBLIC_COMMENT_PREP = {
  id: "public-comment-prep",
  index: "169",
  domain: "Environmental",
  trade: "Community pollution patrol lead",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "overcast",
  certification: "The foundation's own patrol protocol for logging and reviewing observations; the Bay Area Air Quality Management District's (BAAQMD) complaint process and Community Advisory Council public-comment procedure; EPA quality-assurance project plan (QAPP) and chain-of-custody guidance for using monitor data as evidence; the U.S. EPA's Superfund Community Involvement Handbook on public participation in cleanup oversight",
  name: "Public Comment Prep",
  title: simTitle("Public Comment Prep"),
  tagline: "A month of patrol logs and monitor data turned into testimony: every claim tied to a dated record, the chart built from the network's own numbers, a three-minute statement timed and paced, a written comment filed with its exhibits, a speaker card submitted, and nothing said that cannot be sourced",
  accent: PCP_ACCENT,
  accentCss: "#f2c14b",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "record-backed", name: "Record Backed", note: "Every claim tied to a dated log or monitor record, the chart correct, the statement timed clean, and nothing said that the record does not back up" },

  game: system({
    name: "Testimony Desk",
    currency: "COMMENT",
    ranks: ["New Voice", "Prepared Speaker", "Testimony Lead", "Data Steward", "Certified Public Witness"],
    badges: [
      { id: "sourced-claims", name: "Sourced Claims", note: "Every claim matched to its dated record, no anecdote let through", test: AWARD.stepClean("claims") },
      { id: "no-overreach", name: "No Overreach", note: "Never chose a shortcut over an honest number or an honest source", test: AWARD.safe },
      { id: "clock-true", name: "Clock True", note: "The chart threshold and the statement's pace both read inside the working band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-testimony", name: "Clean Testimony", note: "No corrections anywhere in the prep", test: AWARD.clean },
      { id: "steady-read", name: "Steady Read", note: "Held the statement's pace in band without a dropout", test: AWARD.unbroken },
      { id: "ready-early", name: "Ready Early", note: "Comment filed and card submitted inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "oversell-claim": "You reached for the line that calls this a cancer cluster. The patrol's logs and the network's monitors can say what was smelled, seen and measured on which dates — they cannot diagnose anyone, and a claim the record does not support is the first thing a regulator's staff will use to set aside everything else you said that the record does back up.",
    "guess-numbers": "You rounded a chart value up from memory instead of pulling the network's actual reading. A regulator's staff can and will ask which monitor, which hour, which reading — a number you cannot walk back to the network's own export is a number that turns the whole chart from evidence into a guess, and one guess is enough to make them stop trusting the rest of it.",
    "backdate-entry": "You changed the date on a patrol log entry to line up with the claim you wanted to make. A log's date is what lets anyone — a regulator, a reporter, the patrol's own record-keeper — check your testimony against the record independently; a log edited to fit the conclusion first is exactly the kind of falsified record this edition's own briefing on the site's contractor-data case exists to warn against.",
    "no-source-statement": "You drafted the line 'as the foundation's official position.' A patrol lead speaks from the patrol's own logged observations and the network's own data — testifying as if you speak for the foundation's programmes, rather than for what your own patrol actually recorded, puts words in an organization's mouth that only it gets to choose for itself.",
  },

  lateNotes: {
    "podium-timer": "The pace practice comes after the chart is actually built — there is nothing worth timing a read-through of yet.",
    "statement-clock": "The timed run comes after the pace practice, once the statement is being read at a pace that could actually fit three minutes.",
    "final-statement-board": "The final wording gets locked in after the statement has been timed, not before — a line that reads fine in a rush might still be the one line the record cannot back up.",
    "comment-drop-box": "The written comment goes in the box once its exhibits are actually attached in order — a folder filed empty is a comment nobody downstream can act on.",
  },

  interrupts: [
    {
      id: "flagged-sensor-number",
      kind: "Data-quality flag",
      after: "pace-practice", delay: 4, seconds: 13,
      alert: "Reviewing the draft while you read, the network's data steward flags one number on your chart: it came from the monitor that is currently under a QA hold.",
      cue: "That reading is not clean. Correct the chart before you keep rehearsing.",
      target: "chart-correction",
      why: "A monitor under a QA hold has a known problem with its readings — that is exactly what the hold means — and a chart built on one of its numbers is a chart a regulator's own technical staff can throw out the moment they check which station it came from. The correction happens now, at the chart, not after the hearing when the record is already public.",
      missNote: "The chart went into the hearing with the flagged reading still on it. If anyone on the technical staff checks which monitor that number came from — and on a site with this record, someone will — the whole chart loses credibility over one number that was never clean in the first place.",
      wrongNote: "That does not touch the flagged reading. The correction is at the chart panel itself, not at whatever you were rehearsing.",
    },
    {
      id: "comment-period-moved",
      kind: "Schedule change",
      after: "statement-timing", delay: 4, seconds: 13,
      alert: "A message comes in mid-rehearsal: the regulator has moved the written comment period's deadline up by a week.",
      cue: "The clock you are working against just changed. Go back to the notice and re-check it.",
      target: "hearing-notice",
      why: "Every plan this station builds — when the written comment gets filed, when the speaker card gets submitted — is built against the deadline on the posted notice. A deadline that moves and goes unnoticed does not just cost you time; it can close the comment period before your written testimony, with its exhibits, ever reaches the docket.",
      missNote: "The old deadline stood uncorrected. A written comment aimed at a date that already passed is a comment that missed the docket — the three minutes at the microphone are not a substitute for the written record a regulator's staff actually cites later.",
      wrongNote: "That does not update the deadline. Go back to the posted hearing notice and read the change for yourself.",
    },
  ],

  steps: [
    {
      id: "notice", kind: "select", target: "hearing-notice",
      title: "Read the regulator's hearing notice",
      cue: "Check the docket number, the comment period's deadline, and how long each speaker gets at the microphone.",
      why: "Everything else in this session is built against what this notice says: how many minutes you get to speak, when the written comment period closes, and which docket your testimony has to reference. Public participation on a matter like this follows the shape EPA's own regulations at 40 CFR Part 25 set for public hearings — drafting anything before reading the notice is drafting against a guess instead of that published procedure.",
    },
    {
      id: "pull-logs", kind: "select", target: "patrol-log-binder",
      title: "Pull this month's patrol log binder",
      cue: "Take the current binder off the shelf before drafting a single claim.",
      why: "The patrol's own dated log entries are the only thing that turns 'residents have smelled solvent for weeks' into a claim with a when and a where behind it. Testimony written from memory, without the binder open on the desk, drifts from what was actually logged toward what you remember feeling that month — and memory is not what a regulator's record is built to weigh.",
    },
    {
      id: "pull-data", kind: "select", target: "monitor-data-terminal",
      title: "Pull the network's monitor data for the same month",
      cue: "Export the readings from the air monitor network for the period the testimony covers.",
      why: "The patrol's log says what a person noticed; the network's monitors say what was actually measured at a fixed point, on a schedule, independent of anyone's nose. A statement that only cites the log and never the network's own numbers is missing the half of the record a technical reviewer will ask for first.",
    },
    {
      id: "claims", kind: "sequence", anyOrder: true,
      targets: ["claim-odor-days", "claim-dust-events", "claim-exceedance-day", "claim-truck-idling"],
      itemNames: {
        "claim-odor-days": "the logged odor-complaint days", "claim-dust-events": "the logged dust events",
        "claim-exceedance-day": "the day the network read over the regulatory threshold", "claim-truck-idling": "the logged haul-truck idling counts",
      },
      decoyNotes: { "claim-neighbor-story": "That claim came from a conversation at the fence line, not from a dated entry in the binder or the network's export. It may be true — but until it is logged, it is not something this testimony can point a regulator to and say 'here is the record.'" },
      options: [
        { id: "claim-odor-days", label: "Logged odor-complaint days" }, { id: "claim-dust-events", label: "Logged dust events" },
        { id: "claim-exceedance-day", label: "Day the network read over threshold" }, { id: "claim-truck-idling", label: "Logged haul-truck idling counts" },
        { id: "claim-neighbor-story", label: "A neighbour's story from the fence line" },
      ],
      title: "Tie every claim in the draft to a dated record",
      cue: "Pin each claim you intend to make to the logged entry or monitor reading that backs it — pick every one that is actually sourced.",
      why: "A regulator's hearing record is built to be checked, and a claim with a date, a log entry and a monitor reading behind it survives that check; a claim that is really just a strong impression does not, and the moment one claim falls apart under questioning, every other claim in the same statement gets read with more suspicion than it earned. It is also the line that separates what this patrol does from what a HAZWOPER-trained crew working inside the fence under OSHA's 29 CFR 1910.120 does — the patrol documents from the public side; it never claims to have verified anything only an entry past the fence could confirm.",
    },
    {
      id: "exhibit-check", kind: "find", noHint: true,
      targets: ["exhibit-page-missing", "citation-missing"],
      itemNames: { "exhibit-page-missing": "an exhibit page left out of the packet", "citation-missing": "a citation missing its source line" },
      itemNotes: {
        "exhibit-page-missing": "This exhibit is short a page — the chart is here but the raw data table behind it never got copied into the packet. An exhibit a reviewer cannot trace back to its own data is an exhibit they can set aside.",
        "citation-missing": "This citation names a claim but not where it came from — no binder date, no monitor ID. A citation without a source line is a claim asking to be trusted on its own word.",
      },
      title: "Walk the exhibit stack before it goes in the folder",
      cue: "Look over the printed exhibits and click what is incomplete before anything gets filed.",
      why: "A written comment stands or falls on whether its exhibits can be checked independently of the person who wrote them. Finding a gap here, at the desk, costs a few minutes; finding it after the comment period has closed costs the exhibit its whole purpose.",
    },
    {
      id: "chart-threshold", kind: "gauge", target: "chart-threshold-dial",
      title: "Set the chart's reference line to the regulator's own number",
      cue: "Dial the threshold line to the actual regulatory limit and commit once it lands in the correct band.",
      why: "A chart that shows the network's readings without the regulator's own limit drawn on it is a chart that makes the reader do the comparison in their head — and a chart that draws that line in the wrong place is worse, because it looks precise while saying something false. The line has to be the regulator's own published number, not a rounded guess at it.",
      gauge: { label: "THRESHOLD", speed: 0.7, green: [0.46, 0.6], readout: (t) => `${(t * 50).toFixed(1)} µg/m³`, missNote: "Off the regulator's own published limit. Read the number again before committing the line." },
    },
    {
      id: "chart-build", kind: "drag", target: "data-plot-set",
      title: "Carry the finished data set into the chart panel",
      cue: "Lift the printed plot set from the review cart and set it into the chart panel's frame.",
      why: "The chart that goes in front of the regulator has to be built from the actual export sitting on the review cart, plotted point for point — not redrawn from a summary or eyeballed off the screen. Setting the real data set into the frame is what makes the chart on the wall the same chart anyone could reproduce from the network's own file.",
      drag: { to: "chart-panel-socket", radius: 0.4, missNote: "Not seated in the chart frame — line the plot set up with the panel before letting go." },
    },
    {
      id: "pace-practice", kind: "track", target: "podium-timer", seconds: 7,
      title: "Practice the statement at a three-minute pace",
      cue: "Read at the podium and hold the pace meter inside the band — not so fast it blurs, not so slow it runs over.",
      why: "Three minutes at a hearing is not three minutes to say everything the log and the chart could support — it is three minutes to say the strongest, best-sourced part of it clearly enough that the transcript reads back the way you meant it. A pace that is too fast loses the room; a pace that is too slow gets cut off by the timer before the point lands.",
      track: { start: 0.12, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.13, label: "READ PACE", readout: (v) => (v < 0.4 ? "too slow — will run over" : v > 0.62 ? "too fast — losing the room" : "on pace for three minutes") },
      holdBreakNote: "The pace dropped out of band mid-read. Bring it back and hold it steady for the full rehearsal, the way the actual three minutes will demand.",
    },
    {
      id: "statement-timing", kind: "hold", target: "statement-clock", seconds: 5,
      title: "Time the full statement against the clock",
      cue: "Read the whole statement while the clock runs, and hold through to the end without stopping early.",
      why: "A statement that sounds right at a comfortable pace can still run long once every pause and every breath is counted against a real three-minute clock. Timing the full read, start to finish, without stopping to fix anything mid-run, is the only way to know honestly whether the version in your hand actually fits the time the notice gave you.",
      holdBreakNote: "You stopped the clock before the read finished. A partial timing tells you nothing about whether the whole statement fits three minutes — start the clock again and read it straight through.",
    },
    {
      id: "final-statement", kind: "select", target: "final-statement-board",
      title: "Lock in the statement's final wording",
      cue: "Post the version of the statement that says only what the log and the network's data can back up.",
      why: "This is the last chance to catch a line that reads well but oversells the record — a diagnosis the data cannot make, a number nobody can trace, a claim spoken as if it were the foundation's own official word rather than the patrol's logged observation. What goes up on this board is what gets read at the microphone, so it is also the last honest edit.",
    },
    {
      id: "written-comment", kind: "sequence",
      targets: ["cover-letter", "log-excerpt-exhibit", "chart-exhibit", "citations-exhibit"],
      itemNames: {
        "cover-letter": "cover letter", "log-excerpt-exhibit": "patrol log excerpt",
        "chart-exhibit": "the finished chart", "citations-exhibit": "sourced citations page",
      },
      title: "Assemble the written comment in filing order",
      cue: "Place the cover letter, then the log excerpt, then the chart, then the citations page into the folder, in that order.",
      why: "A written comment a regulator's staff can actually use opens with what it is and who filed it, backs that up with the logged record, shows the chart the record produces, and closes with exactly where every number came from — in that order, so a reader moves from claim to evidence without having to hunt for it out of sequence.",
      outOfOrderNote: "Cover letter, then the log excerpt, then the chart, then the citations — filed out of order, a reviewer hits the evidence before they know what it is supposed to prove.",
    },
    {
      id: "speaker-card", kind: "select", target: "speaker-card-table",
      title: "Submit the speaker card at registration",
      cue: "Fill in the docket number and your name at the registration table before the item is called.",
      why: "A regulator's hearing calls speakers off the cards submitted at registration, not off who is standing closest to the microphone — a statement rehearsed to the minute is worth nothing if the card that would have called you up was never filed. The same table has to post how to request an ADA accommodation, because a public hearing that only works for a speaker who can stand at a fixed microphone for three minutes has not actually opened its comment period to everyone the notice was sent to.",
    },
    {
      id: "submit-comment", kind: "select", target: "comment-drop-box",
      title: "File the written comment before the deadline",
      cue: "Place the completed folder, exhibits attached, into the comment drop box.",
      why: "The spoken statement lives for three minutes in the room; the written comment, with its exhibits attached, is what stays in the regulator's docket for as long as the proceeding runs. Filed before the deadline the notice named, it is part of the record the regulator's staff and decision-makers are required to consider — filed after, it is a folder that never made it into anyone's file.",
    },
  ],

  build(root) {
    const hits = {};
    // The indoor "service" interior spawns the learner near its own front
    // wall looking in (see interiors.js/stage.js) — this station's own
    // content is authored around a local origin, so the whole room is set
    // back from that spawn point to leave a clean approach instead of
    // starting nose-to-nose with the nearest desk.
    const g = group(root, 0, 0, -1.8);
    stationPad(g, 2.3, PCP_ACCENT);

    // -------------------------------------------------------------- shell
    box(g, 5.6, 0.08, 4.6, 0, 0.04, -0.2, 0x8a8478, { rough: 0.86, finish: "concrete", tile: [5, 4] });
    box(g, 5.6, 2.9, 0.14, 0, 1.55, -2.1, 0xd8d2c2, { rough: 0.82 });
    box(g, 5.6, 0.16, 0.32, 0, 3.0, -2.1, 0xbfb9a8, { rough: 0.75 });
    box(g, 0.14, 2.9, 4.6, -2.8, 1.55, -0.2, 0xd0cabb, { rough: 0.82 });

    // ------------------------------------------------------ hearing notice
    const noticeBoard = holoPanel(g, 0.92, 0.6, -1.9, 1.55, -2.0, (cx, w, h) => {
      cx.fillStyle = "rgba(24,18,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f2e6c0";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("PUBLIC HEARING NOTICE", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#eaddb8";
      ["Docket: air quality complaint review", "Comment period closes — see posted date",
        "Each speaker: 3 minutes at the microphone", "Written comment accepted with exhibits"].forEach((l, i) =>
        cx.fillText(l, w * 0.06, h * (0.3 + i * 0.15)));
    }, { accent: PCP_ACCENT });
    reg(hits, noticeBoard, "hearing-notice");
    const urgentTag = box(g, 0.16, 0.08, 0.02, -1.5, 1.85, -1.98, 0xf0645b, { emissive: 0xf0645b, ei: 1.8, rough: 0.4, cast: false });
    urgentTag.visible = false;

    // ------------------------------------------------------------- desks
    const logDesk = group(g, -1.9, 0, -1.0);
    box(logDesk, 1.0, 0.75, 0.55, 0, 0.375, 0, 0x5a4a36, { rough: 0.6, finish: "painted", tile: 2 });
    for (const dx of [-0.42, 0.42]) box(logDesk, 0.06, 0.75, 0.06, dx, 0.375, -0.22, 0x3c3020, { rough: 0.65 });
    const binder = group(logDesk, 0, 0.79, 0.05);
    box(binder, 0.32, 0.06, 0.42, 0, 0, 0, 0x1e4f6b, { rough: 0.55, metal: 0.1 });
    decal(binder, 0.28, 0.34, 0, 0.031, 0.02, signFace("PATROL LOG", { bg: "#0d2333", accent: "#f2c14b", scale: 0.4 }))
      .rotation.x = -Math.PI / 2;
    holoTag(logDesk, "patrol log binder", 0, 1.0, 0.05, { css: "#f2c14b", w: 0.4 });
    reg(hits, binder, "patrol-log-binder");
    const backdateHazard = group(logDesk, 0.32, 0.83, 0.1);
    box(backdateHazard, 0.03, 0.01, 0.14, 0, 0, 0, 0x2b2b2b, { rough: 0.6, cast: false });
    ball(backdateHazard, 0.012, 0, 0.01, 0.06, 0xdfe4e8, { rough: 0.4, metal: 0.6 });
    holoTag(backdateHazard, "change this date?", 0, 0.14, 0, { css: "#e8622a", w: 0.42 });
    reg(hits, backdateHazard, "backdate-entry");

    const dataDesk = group(g, -0.9, 0, -1.0);
    box(dataDesk, 0.9, 0.75, 0.5, 0, 0.375, 0, 0x53606b, { rough: 0.6, metal: 0.2 });
    const dataTerm = instrument(dataDesk, 0, 0.79, 0, { idle: "-- µg/m³", color: PCP_ACCENT, w: 0.16, d: 0.22 });
    holoTag(dataDesk, "monitor data terminal", 0, 1.0, 0, { css: "#f2c14b", w: 0.44 });
    reg(hits, dataTerm, "monitor-data-terminal");

    // ------------------------------------------------------------ claims board
    const claimsBoard = group(g, 1.7, 0, -1.9, -0.4);
    box(claimsBoard, 0.9, 0.62, 0.03, 0, 1.3, 0, 0x3a2e1f, { rough: 0.85, finish: "concrete", tile: [2, 2] });
    const CLAIM_TILES = [
      ["claim-odor-days", "ODOR DAYS", -0.3, 1.5], ["claim-dust-events", "DUST EVENTS", 0.0, 1.5],
      ["claim-exceedance-day", "EXCEEDANCE DAY", -0.3, 1.15], ["claim-truck-idling", "TRUCK IDLING", 0.0, 1.15],
      ["claim-neighbor-story", "FENCE-LINE STORY", 0.3, 1.32],
    ];
    for (const [id, label, x, y] of CLAIM_TILES) {
      const tile = decal(claimsBoard, 0.26, 0.16, x, y, 0.02, signFace(label, { bg: "#1e1710", accent: "#f2c14b", scale: 0.42 }), { px: 160 });
      reg(hits, tile, id);
    }
    holoTag(claimsBoard, "claims corkboard", 0, 1.68, 0, { css: "#f2c14b", w: 0.4 });

    // ------------------------------------------------------------ exhibit stack
    const exhibitTable = group(g, 2.3, 0, -0.6, -0.3);
    box(exhibitTable, 0.9, 0.7, 0.55, 0, 0.35, 0, 0x5a4a36, { rough: 0.6 });
    for (let i = 0; i < 4; i++) {
      box(exhibitTable, 0.32, 0.012, 0.24, -0.1 + i * 0.02, 0.72 + i * 0.014, 0.05, 0xece3d0, { rough: 0.75 });
    }
    const missingPage = decal(exhibitTable, 0.3, 0.22, -0.08, 0.79, 0.06, paperFace("EXHIBIT B", ["Chart — page 1 of 2", "(data table page absent)"], { bg: "#f4e9d8", band: "#b81410" }), { px: 160 });
    holoTag(exhibitTable, "exhibit — page missing", -0.08, 0.95, 0.06, { css: "#e8622a", w: 0.5 });
    reg(hits, missingPage, "exhibit-page-missing");
    const missingCite = decal(exhibitTable, 0.3, 0.22, 0.22, 0.81, 0.05, paperFace("CITATION", ["Claim: exceedance day", "Source: ____________"], { bg: "#f4e9d8", band: "#b81410" }), { px: 160 });
    holoTag(exhibitTable, "citation — source missing", 0.22, 0.97, 0.05, { css: "#e8622a", w: 0.52 });
    reg(hits, missingCite, "citation-missing");

    // -------------------------------------------------------------- chart panel
    const chartPanel = holoPanel(g, 1.0, 0.66, 0.3, 1.5, -2.0, (cx, w, h) => {
      cx.fillStyle = "rgba(20,16,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f2e6c0";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("NETWORK DATA — MONTH", w * 0.06, h * 0.13);
      cx.strokeStyle = "#f2c14b"; cx.lineWidth = 2;
      cx.beginPath(); cx.moveTo(w * 0.08, h * 0.85); cx.lineTo(w * 0.92, h * 0.85); cx.stroke();
      cx.beginPath(); cx.moveTo(w * 0.08, h * 0.3); cx.lineTo(w * 0.08, h * 0.85); cx.stroke();
    }, { accent: PCP_ACCENT });
    const chartSocket = group(chartPanel, 0, -0.1, 0.02);
    hits["chart-panel-socket"] = chartSocket;
    const chartDial = instrument(g, 0.75, 1.05, -1.85, { idle: "-- µg/m³", color: PCP_ACCENT, w: 0.13, d: 0.19 });
    holoTag(chartDial, "threshold dial", 0, 0.17, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, chartDial, "chart-threshold-dial");
    const chartFlag = group(chartPanel, 0.42, -0.24, 0.03);
    box(chartFlag, 0.05, 0.03, 0.01, 0, 0, 0, 0xd2312b, { rough: 0.5, cast: false });
    holoTag(chartFlag, "QA flag on this number", 0, 0.08, 0, { css: "#e8622a", w: 0.42 });
    reg(hits, chartFlag, "chart-correction");
    const guessNote = decal(g, 0.22, 0.12, -0.4, 0.95, -1.9, paperFace("NOTE", ["just estimate it?"], { bg: "#f4e9d8", band: "#b81410" }), { px: 128 });
    holoTag(g, "guess the number?", -0.4, 1.08, -1.9, { css: "#e8622a", w: 0.4 });
    reg(hits, guessNote, "guess-numbers");

    const plotCart = group(g, -2.3, 0, 0.6, 0.4);
    box(plotCart, 0.5, 0.06, 0.4, 0, 0.5, 0, 0x53606b, { rough: 0.6, metal: 0.3 });
    for (const [sx, sz] of [[-0.2, -0.16], [0.2, -0.16], [-0.2, 0.16], [0.2, 0.16]]) {
      cyl(plotCart, 0.04, 0.04, 0.04, sx, 0.055, sz, 0x1a1e23, { rough: 0.9, seg: 10 }).rotation.z = Math.PI / 2;
      cyl(plotCart, 0.015, 0.015, 0.4, sx, 0.28, sz, 0x59636d, { rough: 0.6, metal: 0.4, seg: 8, cast: false });
    }
    const plotSet = group(plotCart, 0, 0.55, 0);
    for (let i = 0; i < 5; i++) box(plotSet, 0.34, 0.008, 0.26, 0, i * 0.01, 0, 0xece3d0, { rough: 0.75 });
    decal(plotSet, 0.3, 0.22, 0, 0.06, 0.1, signFace("PLOT SET", { bg: "#1c1408", accent: "#f2c14b", scale: 0.4 })).rotation.x = -Math.PI / 2;
    holoTag(plotCart, "data plot set", 0, 0.72, 0, { css: "#f2c14b", w: 0.34 });
    reg(hits, plotSet, "data-plot-set");

    // ----------------------------------------------------------------- podium
    const podium = group(g, 0.2, 0, 1.3);
    box(podium, 0.5, 1.05, 0.4, 0, 0.525, 0, 0x3c3020, { rough: 0.6 });
    box(podium, 0.55, 0.05, 0.44, 0, 1.05, 0, 0x2b2216, { rough: 0.55 });
    const micStand = cyl(podium, 0.012, 0.012, 0.35, 0, 1.22, 0.05, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 8 });
    void micStand;
    ball(podium, 0.03, 0, 1.4, 0.05, 0x2b2b2b, { rough: 0.5 });
    const timerInst = instrument(podium, -0.35, 1.05, 0, { idle: "-- WPM", color: PCP_ACCENT, w: 0.13, d: 0.19 });
    holoTag(podium, "pace meter", -0.35, 1.24, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, timerInst, "podium-timer");
    const clockGroup = group(podium, 0, 1.85, -0.1);
    torus(clockGroup, 0.14, 0.015, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.4, seg: 10, seg2: 24 });
    const clockFace = decal(clockGroup, 0.24, 0.24, 0, 0, 0.01, signFace("0:00", { bg: "#151515", accent: "#f2c14b", fg: "#f2e6c0", scale: 0.5 }), { glow: true, ei: 0.7 });
    holoTag(clockGroup, "statement clock", 0, 0.2, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, clockFace, "statement-clock");

    const statementBoard = holoPanel(g, 0.85, 0.55, 0.9, 1.35, 1.5, (cx, w, h) => {
      cx.fillStyle = "rgba(20,16,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f2e6c0";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("FINAL STATEMENT — DRAFT", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#eaddb8";
      ["Logged odor days and dust events", "Network reading vs. threshold — dated",
        "No diagnosis, no unsourced number"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: -0.3, accent: PCP_ACCENT });
    reg(hits, statementBoard, "final-statement-board");
    const oversellPage = decal(g, 0.24, 0.16, 1.5, 1.05, 1.75, paperFace("DRAFT LINE", ["\"...a confirmed cancer", "cluster in this block.\""], { bg: "#f4e9d8", band: "#b81410" }), { px: 160, ry: -0.5 });
    oversellPage.rotation.y = -0.5;
    holoTag(g, "keep this line?", 1.5, 1.28, 1.75, { css: "#e8622a", w: 0.4 });
    reg(hits, oversellPage, "oversell-claim");
    const noSourcePage = decal(g, 0.24, 0.16, -0.65, 1.05, 1.55, paperFace("DRAFT LINE", ["\"As the foundation's", "official position...\""], { bg: "#f4e9d8", band: "#b81410" }), { px: 160, ry: 0.5 });
    noSourcePage.rotation.y = 0.5;
    holoTag(g, "speak for the foundation?", -0.65, 1.28, 1.55, { css: "#e8622a", w: 0.5 });
    reg(hits, noSourcePage, "no-source-statement");

    // ---------------------------------------------------------- written comment
    const commentTable = group(g, -0.8, 0, 1.6, 0.2);
    box(commentTable, 1.0, 0.7, 0.55, 0, 0.35, 0, 0x5a4a36, { rough: 0.6 });
    const folder = group(commentTable, 0, 0.72, 0);
    box(folder, 0.34, 0.02, 0.26, 0, 0, 0, 0x2f6f4a, { rough: 0.6 });
    holoTag(commentTable, "written comment folder", 0, 0.9, 0, { css: "#f2c14b", w: 0.42 });
    const WC = [
      ["cover-letter", "COVER LETTER", -0.32, 0.73], ["log-excerpt-exhibit", "LOG EXCERPT", -0.1, 0.735],
      ["chart-exhibit", "CHART EXHIBIT", 0.12, 0.74], ["citations-exhibit", "CITATIONS", 0.34, 0.745],
    ];
    for (const [id, label, x, y] of WC) {
      const page = box(commentTable, 0.18, 0.01, 0.24, x, y, 0.18, 0xece3d0, { rough: 0.75 });
      decal(commentTable, 0.16, 0.2, x, y + 0.007, 0.18, signFace(label, { bg: "#1c1408", accent: "#f2c14b", scale: 0.3 })).rotation.x = -Math.PI / 2;
      reg(hits, page, id);
    }

    const cardTable = group(g, 2.0, 0, 1.7, -0.3);
    box(cardTable, 0.85, 0.7, 0.5, 0, 0.35, 0, 0x53606b, { rough: 0.6, metal: 0.2 });
    const speakerCard = box(cardTable, 0.24, 0.01, 0.16, 0, 0.71, 0, 0xf2efe0, { rough: 0.7 });
    decal(cardTable, 0.22, 0.14, 0, 0.716, 0, signFace("SPEAKER CARD", { bg: "#1c1408", accent: "#f2c14b", scale: 0.42 })).rotation.x = -Math.PI / 2;
    holoTag(cardTable, "registration table", 0, 0.92, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, speakerCard, "speaker-card-table");

    const dropBox = group(g, -2.3, 0, 1.9, 0.3);
    box(dropBox, 0.4, 0.5, 0.32, 0, 0.25, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    const slot = box(dropBox, 0.28, 0.03, 0.02, 0, 0.44, 0.16, 0x0d0d0d, { rough: 0.9, cast: false });
    void slot;
    decal(dropBox, 0.3, 0.1, 0, 0.55, 0.16, signFace("COMMENT DROP BOX", { bg: "#0d1c14", accent: "#59c97b", scale: 0.36 }));
    holoTag(dropBox, "comment drop box", 0, 0.66, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, dropBox, "comment-drop-box");

    // -------------------------------------------------------------- dressing
    cabinet(g, 0.7, 1.0, 0.35, -2.6, 0.5, -1.0, 0x9aa4ad, { doorColor: 0x7c848c });
    cabinet(g, 0.7, 1.0, 0.35, -2.6, 0.5, 0.0, 0x9aa4ad, { doorColor: 0x7c848c });
    const shelf = group(g, 2.6, 0, -1.7);
    for (let s = 0; s < 3; s++) {
      box(shelf, 0.55, 0.02, 0.24, 0, 0.5 + s * 0.34, 0, 0x4a3c28, { rough: 0.7 });
      for (let b = 0; b < 5; b++) box(shelf, 0.03, 0.22, 0.16, -0.22 + b * 0.11, 0.62 + s * 0.34, 0, [0x8b402f, 0x2f6f4a, 0x2f4d8a, 0x8a7a2f, 0x5a3c8a][b], { rough: 0.7 });
    }
    for (const [dx, dz] of [[-2.5, 1.4], [-2.9, 1.1], [2.9, 0.4], [2.7, 1.2]]) {
      const chair = group(g, dx, 0, dz, Math.random() * Math.PI * 2);
      box(chair, 0.36, 0.03, 0.36, 0, 0.42, 0, 0x2b3138, { rough: 0.6 });
      box(chair, 0.36, 0.4, 0.03, 0, 0.62, -0.16, 0x2b3138, { rough: 0.6 });
      for (const [lx, lz] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]]) {
        cyl(chair, 0.012, 0.012, 0.42, lx, 0.21, lz, 0x1a1e23, { rough: 0.6, metal: 0.4, seg: 8 });
      }
    }
    for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) {
      const chair = group(g, 1.0 + col * 0.45, 0, 2.4 + row * 0.5);
      box(chair, 0.34, 0.03, 0.34, 0, 0.4, 0, 0x3a4148, { rough: 0.65 });
      box(chair, 0.34, 0.38, 0.03, 0, 0.6, -0.15, 0x3a4148, { rough: 0.65 });
      for (const [lx, lz] of [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]]) {
        cyl(chair, 0.011, 0.011, 0.4, lx, 0.2, lz, 0x1a1e23, { rough: 0.6, metal: 0.4, seg: 8 });
      }
    }
    const plantPot = group(g, -2.6, 0, 2.1);
    cyl(plantPot, 0.14, 0.11, 0.24, 0, 0.12, 0, 0x8a6a4a, { rough: 0.8, seg: 12 });
    for (let i = 0; i < 6; i++) {
      const leaf = ball(plantPot, 0.09, Math.cos(i) * 0.1, 0.32 + (i % 3) * 0.08, Math.sin(i) * 0.1, 0x2f6f45, { rough: 0.7, seg: 8 });
      leaf.scale.set(0.5, 1.4, 0.5);
    }

    standingFigure(g, 2.6, -1.1, { ry: -2.4, cloth: 0x37505f, vest: PCP_ACCENT });
    standingFigure(g, -1.6, 2.2, { ry: 1.4, cloth: 0x445566 });

    let flaggedActive = false, scheduleActive = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -0.4),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "pull-logs") repaint(dataTerm.userData.screen, signFace("PULLED", { bg: "#0d1c14", accent: "#59c97b", fg: "#eaf6fb", scale: 0.55 }));
        if (step.id === "pull-data") repaint(dataTerm.userData.screen, signFace("EXPORTED", { bg: "#0d1c14", accent: "#59c97b", fg: "#eaf6fb", scale: 0.5 }));
        if (step.id === "exhibit-check") { missingPage.visible = false; missingCite.visible = false; }
        if (step.id === "chart-build") repaint(chartPanel.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(20,16,6,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, 5);
          cx.strokeStyle = "#f2c14b"; cx.lineWidth = 2;
          cx.beginPath(); cx.moveTo(w * 0.08, h * 0.85); cx.lineTo(w * 0.92, h * 0.85); cx.stroke();
          cx.beginPath(); cx.moveTo(w * 0.08, h * 0.3); cx.lineTo(w * 0.08, h * 0.85); cx.stroke();
          cx.strokeStyle = "#59c97b"; cx.beginPath();
          const pts = [[0.15, 0.7], [0.32, 0.55], [0.48, 0.62], [0.64, 0.4], [0.8, 0.5]];
          pts.forEach(([px, py], i) => { const X = w * px, Y = h * py; if (i === 0) cx.moveTo(X, Y); else cx.lineTo(X, Y); });
          cx.stroke();
        });
        if (step.id === "statement-timing") repaint(clockFace, signFace("3:00", { bg: "#151515", accent: "#59c97b", fg: "#f2e6c0", scale: 0.5 }));
        if (step.id === "final-statement") { oversellPage.visible = false; noSourcePage.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "flagged-sensor-number") { flaggedActive = true; chartFlag.children[0].material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.0, rough: 0.4 }); }
        if (it.id === "comment-period-moved") { scheduleActive = true; urgentTag.visible = true; repaint(noticeBoard.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(24,18,8,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#f0645b"; cx.fillRect(0, 0, w, 5);
          cx.fillStyle = "#ffd2ce"; cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillText("DEADLINE MOVED UP", w * 0.06, h * 0.13);
          cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#f4bcb6";
          cx.fillText("Comment period closes one week earlier", w * 0.06, h * 0.42);
        }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "flagged-sensor-number") { flaggedActive = false; chartFlag.children[0].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 }); }
        if (it.id === "comment-period-moved") { scheduleActive = false; urgentTag.visible = false; repaint(noticeBoard.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(24,18,8,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, 5);
          cx.fillStyle = "#f2e6c0"; cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillText("PUBLIC HEARING NOTICE", w * 0.06, h * 0.13);
          cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#eaddb8";
          ["Docket: air quality complaint review", "Comment period — deadline updated",
            "Each speaker: 3 minutes at the microphone", "Written comment accepted with exhibits"].forEach((l, i) =>
            cx.fillText(l, w * 0.06, h * (0.3 + i * 0.15)));
        }); }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (flaggedActive) chartFlag.children[0].material.emissiveIntensity = 1.6 + Math.sin(t * 8) * 1.0;
        void scheduleActive;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "chart-threshold") {
          repaint(chartDial.userData.screen, signFace(`${(gg.t * 50).toFixed(1)}`, { bg: "#1c1408", accent: gg.t >= 0.46 && gg.t <= 0.6 ? "#59c97b" : "#f0645b", fg: "#f2e6c0", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "pace-practice") {
          repaint(timerInst.userData.screen, signFace(`${Math.round(80 + tr.v * 80)} WPM`, { bg: "#1c1408", accent: tr.v >= 0.4 && tr.v <= 0.62 ? "#59c97b" : "#f0645b", fg: "#f2e6c0", scale: 0.5 }));
        }
      },
    };
  },
};
