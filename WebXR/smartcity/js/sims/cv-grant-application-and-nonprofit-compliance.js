import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat, seatedFigure, standingPerson,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Grant Application and Nonprofit Compliance VR — Civic
// Leadership and Emotional Intelligence, deepening the programme.
//
// A small neighbourhood nonprofit's back office, three days before a city
// community-grant deadline. The learner is the programme and grants manager.
// Budget Tradeoff Hearing teaches spending public money in the open from the
// council's side of the table; this station is the other side — asking for
// that money honestly and then being accountable for it: eligibility papers
// in order, a budget narrative whose numbers mean something, an indirect rate
// that is inside the notice's cap and backed by real costs, a board member's
// conflict disclosed and recused, a report that claims only what it can
// prove, clients' records kept private, and the organisation's 501(c)(3)
// status protected from a well-meaning volunteer's campaign request.
//
// The rules are named as bodies and stated as principles: the IRS rules for
// 501(c)(3) organisations (Form 990 and its governance questions, the bar on
// campaign activity), 2 CFR 200 where a grant carries federal money, the
// California Attorney General's Registry of Charitable Trusts, and the
// Political Reform Act and municipal ethics code on the city's side. The
// city, the notice's 12 per cent cap and every person are invented; the
// leadership principles are those commonly taught in civic-leadership
// programmes, and the foundation whose principles the programme draws on is
// not sourced in this repository.

const GNC_ACCENT = 0x5fb0b8;
const GNC_CSS = "#5fb0b8";

export const SIM_CV_GRANT_APPLICATION_AND_NONPROFIT_COMPLIANCE = {
  id: "cv-grant-application-and-nonprofit-compliance",
  index: "322",
  domain: "Civic",
  trade: "Programme and grants manager — community nonprofit",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "overcast",
  certification: "The IRS rules for 501(c)(3) organisations, named as a body: the determination letter from the Form 1023 application, annual Form 990 reporting and its governance questions on a written conflict-of-interest policy, and the absolute bar on campaign activity for or against a candidate; 2 CFR 200, OMB's Uniform Guidance, where a city grant passes through federal money — allowable costs, indirect rates, documentation and no charging one cost twice; the California Attorney General's Registry of Charitable Trusts, as a body, for the charity's state registration and annual reports; the Political Reform Act and the municipal ethics code for the city officials who review and award the grant; SEIU and AFSCME for the city grants staff on the other side of the application. The city, its notice and its cap are invented. The leadership principles practised here are those commonly taught in civic-leadership programmes; the foundation whose principles the programme draws on is not sourced in this repository",
  name: "Grant Application and Nonprofit Compliance",
  title: simTitle("Grant Application and Nonprofit Compliance"),
  tagline: "Ask for public money honestly and account for every dollar: papers in order, a budget narrative that means something, an indirect rate inside the cap, a board member's conflict disclosed and recused, a report that claims only what it can prove — and the charity's status kept out of a campaign",
  accent: GNC_ACCENT,
  accentCss: GNC_CSS,
  parSeconds: 340,
  footprint: 2.3,
  badge: { id: "every-dollar-open", name: "Every Dollar Open", note: "A grant asked for and reported honestly: no conflict hidden, no cost charged twice, no claim you could not prove" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your executive director, the board treasurer, or the grants manager at a sister organisation who has survived a deadline week and will pick up the phone",

  game: system({
    name: "Open Books",
    currency: "TRUST",
    ranks: ["Programme Assistant", "Grants Writer", "Grants Manager", "Director of Programmes", "Mentor Director"],
    badges: [
      { id: "papers-in-order", name: "Papers in Order", note: "Every eligibility document found first time", test: AWARD.stepClean("gather-the-eligibility-papers") },
      { id: "nothing-hidden", name: "Nothing Hidden", note: "No unsafe action anywhere in the grant cycle", test: AWARD.safe },
      { id: "claims-proven", name: "Claims Proven", note: "Every unsupported claim found first time", test: AWARD.stepClean("prove-every-claim") },
    ],
    challenges: [
      { id: "clean-books", name: "Clean Books", note: "No corrections anywhere in the grant cycle", test: AWARD.clean },
      { id: "honest-rate", name: "Honest Rate", note: "The indirect rate set inside the band", test: AWARD.precise(0.7) },
      { id: "steady-spend", name: "Steady Spend", note: "The listening and the spend-down both carried their full count", test: AWARD.unbroken },
    ],
  }),

  hazards: {
    "double-charge-salary": "You charged the youth coordinator's full salary to this grant and to the foundation grant that already pays half of it. Charging one cost to two funders is the plainest breach of grant rules there is, and under federal pass-through money it is exactly what 2 CFR 200 exists to prevent; one audit finds it, both funders ask for the money back, and neither funds the organisation again.",
    "client-files-home": "You copied the client files onto a USB stick to work on at home. Those files hold names, addresses, immigration and health details of families who trusted the organisation; a stick lost on a bus is a breach you have to tell every one of them about, and a funder's data rules almost certainly forbid it outright.",
    "reply-all-angry": "You replied to all, in anger, when the programme officer said the budget would be cut by a fifth. The officer, her manager and two other applicants copied on the thread now know how the organisation behaves under pressure; the cut is still there, and the relationship you needed to argue it back has just got harder.",
    "all-nighter-alone": "You told the director you would finish the application alone overnight. Deadline all-nighters are when a figure is copied from the wrong spreadsheet and nobody checks it; a grant manager who works that way every cycle burns out by the third one, and the organisation loses the one person who knew where everything was.",
  },

  lateNotes: {
    "cousin-quote-card": "The catering quote is dealt with once the budget narrative and the indirect rate are set — the budget is not built yet.",
    "grant-log-board": "The grant file closes once the report package is assembled and signed. There is nothing to record yet.",
  },

  steps: [
    {
      id: "gather-the-eligibility-papers", kind: "find", noHint: true,
      targets: ["doc-determination-letter", "doc-latest-990", "doc-state-registration", "doc-board-budget"],
      itemNames: {
        "doc-determination-letter": "the IRS determination letter",
        "doc-latest-990": "the latest Form 990, filed on time",
        "doc-state-registration": "the state charity registration, current",
        "doc-board-budget": "the board-approved organisational budget",
      },
      itemNotes: {
        "doc-determination-letter": "The letter the IRS issued on the Form 1023 application, confirming 501(c)(3) status. Without it the city cannot fund the organisation as a charity.",
        "doc-latest-990": "The most recent annual return, filed and public. Funders read it for the organisation's finances and its governance answers.",
        "doc-state-registration": "Registration with the Attorney General's Registry of Charitable Trusts, with the annual report up to date. A lapsed registration is a common reason an application is set aside.",
        "doc-board-budget": "The whole organisation's budget, approved by the board, so the funder can see where this grant fits.",
      },
      decoyNotes: {
        "doc-gala-album": "The gala photos are good for the newsletter. They prove nothing about whether the organisation is eligible or well governed.",
      },
      title: "Gather the eligibility papers before you write a word",
      cue: "Find every document that proves the organisation can receive this grant.",
      why: "A community grant is public money, and the first thing the city checks is whether the applicant is who it says it is and in good standing: exempt under 501(c)(3), its annual return filed, its state charity registration current, its board actually governing a budget. Finding out on deadline day that the registration lapsed or the 990 was never filed sinks an application that took weeks to write, and it is entirely avoidable.",
    },
    {
      id: "read-the-allowable-costs", kind: "select", target: "rfp-card",
      title: "Read the notice's allowable and unallowable costs",
      cue: "Before building the budget, read what this notice will and will not pay for.",
      why: "Every notice says what the money may buy. This one pays for staff, supplies and a share of overhead; it does not pay for food at events, fundraising or anything political. Building the budget from the notice rather than from what the programme would like saves a rejected line later, and if the city's money is passed through from a federal award, the federal cost rules under 2 CFR 200 come with it, whether or not anyone says so on the first page.",
    },
    {
      id: "write-the-budget-narrative", kind: "sequence",
      targets: ["bud-personnel", "bud-fringe", "bud-direct-costs", "bud-indirect"],
      itemNames: {
        "bud-personnel": "personnel: who, what share of their time, why",
        "bud-fringe": "fringe: the benefits that follow those salaries",
        "bud-direct-costs": "direct programme costs, each tied to an activity",
        "bud-indirect": "indirect costs, last, at the allowed rate",
      },
      title: "Build the budget narrative in order",
      cue: "Personnel, then fringe, then direct programme costs, then indirect — each line explained.",
      why: "A budget narrative is where numbers become promises. Personnel first, as a share of real people's time, because that is most of any community programme; fringe next, because it follows those salaries; direct costs each tied to an activity the proposal describes; and indirect last, because it is calculated on the others. A reviewer who can trace every figure to an activity believes the rest of the application; one who cannot starts looking for padding.",
      outOfOrderNote: "Personnel, fringe, direct costs, then indirect. Indirect is calculated on the lines above it — writing it first is guessing.",
    },
    {
      id: "set-the-indirect-rate", kind: "gauge", target: "indirect-meter",
      title: "Set the indirect rate inside the cap and backed by real costs",
      cue: "The notice caps indirect costs at 12 per cent. Commit a rate inside the band your actual overhead supports.",
      gauge: {
        label: "INDIRECT RATE", speed: 0.6, green: [0.36, 0.48],
        readout: (t) => `${(t * 25).toFixed(1)}%`,
        missNote: "Outside the band. Over the notice's cap is simply unallowable; far under your real overhead means the programme quietly subsidises the grant from somewhere else. Set it inside the cap, at what your costs support.",
      },
      why: "Indirect costs — rent, the bookkeeper, insurance, the audit — are real, and a programme that never recovers them starves the organisation that runs it. They also have rules: this notice caps them at 12 per cent, and where federal money is involved the rate has to be one the Uniform Guidance allows and the organisation can document. Asking for more than the cap is unallowable; asking for far less than your costs is a slow way to go broke doing good work.",
    },
    {
      id: "disclose-the-conflict", kind: "drag", target: "cousin-quote-card",
      title: "Send the board treasurer's cousin's catering quote to the conflict process",
      cue: "The cheapest catering quote for the programme's events comes from the treasurer's cousin. Carry it to the conflict-of-interest tray.",
      drag: {
        to: "coi-tray", radius: 0.55,
        missNote: "Not in the conflict tray. A transaction with a board member's family goes through the written conflict-of-interest policy — disclosed, and decided by board members with no interest in it.",
      },
      why: "A good price from a board member's relative may be the best deal available, and it is still a conflict of interest. The written policy — the one Form 990 asks whether the organisation has and follows — exists for exactly this: the interested board member discloses, steps out, and the disinterested members decide on the record whether the deal is fair. Handled that way, the quote can be accepted; hidden, it looks like self-dealing even if it saved money.",
    },
    {
      id: "record-the-recusal", kind: "select", target: "recusal-minutes",
      title: "Record the treasurer's disclosure and recusal in the minutes",
      cue: "The minutes show the treasurer disclosed, left the room, and the remaining members compared quotes and voted.",
      why: "A conflict handled properly but not recorded is, a year later, indistinguishable from one that was hidden. Minutes that show the disclosure, the recusal, the comparison of quotes and the vote of the disinterested members are the organisation's proof, to the funder, the auditor and the public reading its 990, that the policy is followed and not merely adopted. It takes three lines, and those three lines protect the treasurer as much as the organisation.",
    },
    {
      id: "hear-the-programme-officer", kind: "hold", target: "listen-officer", seconds: 8,
      title: "Hear the programme officer's feedback without defending",
      cue: "On the call, the officer explains why the draft budget will be cut. Hold your attention on her — no rebuttal yet.",
      why: "The programme officer is the one person at the city whose job is to help the application succeed, and her feedback is the most valuable thing in the process. Hearing all of it before answering — why the evaluation line looks thin, why the city cannot fund food, where the cut would land — tells the organisation exactly what to fix. Defending each point as she makes it teaches her to stop explaining, which is the opposite of what an applicant needs.",
      holdBreakNote: "You started answering before she had finished. She stopped explaining. Come back to listening until she is done.",
    },
    {
      id: "lock-the-client-records", kind: "turn", target: "cabinet-lock",
      title: "Lock the client records cabinet",
      cue: "The intake files are out for the numbers. Put them back and turn the cabinet key.",
      turn: { turns: 0.4, axis: "z", label: "LOCKED" },
      why: "A grant report needs counts and outcomes, not the files of the families behind them. Intake records hold names, addresses, immigration status and health details; they belong in a locked cabinet or a restricted system, and nowhere else, whatever deadline is looming. A cabinet left open in an office that volunteers walk through is how a family's private details end up somewhere they never agreed to, and the organisation's promise to them is broken without anyone meaning it.",
    },
    {
      id: "prove-every-claim", kind: "find", noHint: true,
      targets: ["claim-no-source", "claim-minor-photo", "claim-other-grant-figure"],
      itemNames: {
        "claim-no-source": "\"92 per cent of youth improved\" — with no data behind it",
        "claim-minor-photo": "a photo of a named child, with no signed consent",
        "claim-other-grant-figure": "a participant figure copied from another funder's report",
      },
      itemNotes: {
        "claim-no-source": "An outcome figure with no survey, no sign-in data and no method behind it is a guess dressed as a result. Cut it or source it.",
        "claim-minor-photo": "A child's photo and name in a public report need a parent's signed consent. Without it, the picture comes out.",
        "claim-other-grant-figure": "A figure from a different programme's report describes different work. Reporting it here claims the same results twice.",
      },
      decoyNotes: {
        "claim-sign-in-count": "The attendance figure backed by dated sign-in sheets is exactly what a report should contain. Leave it.",
      },
      title: "Read the draft report and mark every claim you cannot prove",
      cue: "Before it goes to the city, mark every claim in the draft report that is unsupported or unconsented.",
      why: "A grant report is a public record of what public money bought, and the organisation will be judged on it long after this grant ends. An outcome with no data, a child's photo without consent and a figure borrowed from another funder's report each read well and each can unravel the organisation's credibility when anyone checks. Reporting only what the sign-in sheets and surveys support is slower to write and much faster to defend.",
    },
    {
      id: "keep-spend-on-pace", kind: "track", target: "burn-meter", seconds: 8,
      title: "Keep spending on pace with the budget",
      cue: "Hold the spend-down inside the band: not racing ahead of the programme, not sitting on money the families need.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.48, fall: 0.4, drift: 0.16, label: "SPEND-DOWN",
        readout: (v) => (v < 0.3 ? "underspending" : v > 0.7 ? "overspending" : "on pace"),
      },
      why: "Grant money that is spent too fast runs out before the programme year ends; money spent too slowly is returned, and next year's application looks like an organisation that could not use what it had. Watching the spend-down against the budget every month — and telling the programme officer early if a line needs to move — keeps the programme running to the last week and keeps the funder's trust, which is worth more than any single award.",
      holdBreakNote: "The spending slipped off pace — racing ahead or stalling. Bring it back to the budget, and tell the programme officer if a line needs to move.",
    },
    {
      id: "collect-annual-disclosures", kind: "select", target: "annual-disclosure-card",
      title: "Collect this year's conflict-of-interest statements from the board",
      cue: "Every board member signs an annual disclosure statement. Chase the two still missing before the report goes in.",
      why: "A conflict-of-interest policy only works if people are reminded every year to say what has changed: a new job, a relative's business, a seat on another board. Form 990 asks whether the organisation monitors compliance with its policy, and the honest answer depends on these signed annual statements. Two missing signatures are a small thing to chase now and an awkward thing to explain when a funder or auditor asks for them.",
    },
    {
      id: "assemble-the-report", kind: "sequence", anyOrder: true,
      targets: ["rpt-financial", "rpt-narrative", "rpt-documentation", "rpt-sign-off"],
      itemNames: {
        "rpt-financial": "the financial report against the budget",
        "rpt-narrative": "the outcomes narrative, every figure sourced",
        "rpt-documentation": "receipts and time records for every charge",
        "rpt-sign-off": "the director's signature and the treasurer's review",
      },
      title: "Assemble the report package",
      cue: "The financial report against budget, the sourced narrative, the documentation, and the sign-off.",
      why: "The report package is the organisation's account of the public money it was trusted with. A financial report set against the approved budget, a narrative whose every number has a source, receipts and time records behind every charge, and a signature from someone who is accountable for it together make a report that survives an audit. Missing any one of them turns a good year's work into a correspondence file of follow-up questions.",
    },
    {
      id: "close-the-grant-log", kind: "select", target: "grant-log-board",
      title: "Close the grant file",
      cue: "Log the submission, the budget version, the conflict recusal, the report date and where every record lives — no client names.",
      why: "Grant files outlive the people who wrote them. A log of what was submitted when, which budget version was approved, how the treasurer's conflict was handled, when the report went in and where the supporting records are kept lets the next grants manager — or the auditor — reconstruct the grant in an afternoon. Keeping client names out of it keeps the file safe to share with the people who will need it.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the director before the deadline week ends",
      cue: "Ten minutes: how did the week land on each of you, what should change before the next deadline?",
      why: "Deadline weeks in small nonprofits run on the same two or three people, and the cost shows up months later as a resignation. A short check-in with the director — how did it land, what was too much, what gets a calendar reminder or a second pair of hands next time — is how the organisation keeps its grants manager, and with her the knowledge of where every record is. Naming who to call when it is too much is part of that.",
    },
  ],

  interrupts: [
    {
      id: "client-list-to-funder",
      kind: "Client data about to leave",
      after: "hear-the-programme-officer", delay: 3, seconds: 12,
      alert: "On the other screen, a colleague is about to email the funder the full client spreadsheet — names, birth dates and addresses — \"so they can verify our numbers\".",
      cue: "Stop the send. The funder gets de-identified counts, not the families' details.",
      target: "stop-send-card",
      why: "Funders are entitled to verify results, and there are proper ways to do it: de-identified counts, an on-site review of files under supervision, whatever the grant agreement says. Emailing the whole client list is not one of them — it moves families' private details out of the organisation's control to people they never agreed to share them with. Stopping it, kindly and immediately, and offering the counts instead protects the families and the grant.",
      missNote: "The spreadsheet went. The funder's inbox now holds two hundred families' names, birth dates and addresses, the organisation has a breach to disclose to every one of them, and the programme officer has to report it to her own manager.",
      wrongNote: "Listening harder to the officer does not stop the email. Turn to your colleague's screen and stop the send.",
    },
    {
      id: "campaign-phone-bank-request",
      kind: "Campaign activity request",
      after: "keep-spend-on-pace", delay: 3, seconds: 12,
      alert: "A long-time volunteer asks to borrow the grant-bought laptops and the meeting room tonight to phone-bank for a council candidate who \"supports our work\".",
      cue: "Say no, warmly and plainly: a 501(c)(3) cannot lend its resources to any candidate's campaign.",
      target: "no-campaign-card",
      why: "A 501(c)(3) organisation is absolutely barred from campaign activity for or against any candidate, and lending the organisation's equipment or rooms to a campaign is campaign activity whatever the candidate's views. The volunteer is free to campaign on her own time with her own phone. Saying no warmly and explaining why protects the organisation's exemption and the grant it funds, and keeps a good volunteer without making her feel accused.",
      missNote: "The phone bank ran from the meeting room on the grant's laptops. A photo of it with the organisation's banner in the background is now on the candidate's page, and the organisation has a question from its funder, and possibly the IRS, that it cannot answer well.",
      wrongNote: "The spend-down meter is for the budget. The volunteer needs a warm, plain no — the organisation cannot lend anything to a campaign.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, GNC_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? GNC_ACCENT, { emissive: o.color ?? GNC_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? GNC_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0c1a1c", accent: o.accent ?? GNC_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? GNC_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const stand = (x, z, ry = 0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.19, 0.21, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.026, 0.026, 1.0, 0, 0.5, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const chair = (x, z, ry, color) => {
      const c = group(g, x, 0, z, ry);
      box(c, 0.46, 0.06, 0.44, 0, 0.46, 0, color, { rough: 0.7 });
      box(c, 0.46, 0.5, 0.05, 0, 0.74, -0.2, color, { rough: 0.7 });
      cyl(c, 0.03, 0.05, 0.44, 0, 0.22, 0, 0x2a2d31, { rough: 0.5, metal: 0.6, seg: 8 });
      return c;
    };
    const desk = (x, z, ry = 0) => {
      const d = group(g, x, 0, z, ry);
      box(d, 1.3, 0.05, 0.65, 0, 0.75, 0, 0x8a7258, { rough: 0.6 });
      for (const sx of [-0.6, 0.6]) box(d, 0.05, 0.73, 0.58, sx, 0.365, 0, 0x5a4a3a, { rough: 0.7 });
      return d;
    };
    const screenFace = (title, rows, accent = GNC_CSS) => (cx, w, h) => {
      cx.fillStyle = "#0e1a22"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = accent; cx.fillRect(0, 0, w, h * 0.12);
      cx.fillStyle = "#eaf6f8"; cx.font = `600 ${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      cx.fillText(title, w * 0.05, h * 0.2);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      rows.forEach((r, i) => cx.fillText(r, w * 0.05, h * (0.42 + i * 0.14)));
    };
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(8,20,22,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? GNC_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eef8fa";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#c4e2e6";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? GNC_ACCENT, { rough: 0.5, emissive: o.accent ?? GNC_ACCENT, ei: 0.25 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const wrap = (cx, text, x, y, maxW, lh) => {
      let line = "", yy = y;
      for (const word of String(text).split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(test)?.width ?? test.length * lh * 0.45) > maxW && line) { cx.fillText(line, x, yy); line = word; yy += lh; }
        else line = test;
      }
      if (line) cx.fillText(line, x, yy);
    };

    // ------------------------------------------------------------ the office
    const carpetTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#4a5a5e", base2: "#425256", seam: "rgba(16,22,24,0.35)",
    }), { repeat: 3, px: 384 });
    const carpet = box(g, 8.0, 0.02, 6.6, 0, 0.01, -0.5, 0x4a5a5e, { rough: 0.95, cast: false });
    carpet.material = texturedMat(carpetTex, { rough: 0.95, metal: 0.02, color: 0x56666a });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#d8d2c6", base2: "#d0cabe", seam: "rgba(60,56,50,0.18)",
    }), { repeat: 2, px: 256 });
    const backWall = box(g, 8.0, 2.8, 0.1, 0, 1.4, -3.8, 0xd8d2c6, { rough: 0.85 });
    backWall.material = texturedMat(wallTex, { rough: 0.85, metal: 0.02, color: 0xe0dace });
    // Mission poster and a window on the back wall.
    decal(g, 0.9, 0.6, -2.2, 1.8, -3.74, signFace("YOUTH · FAMILIES\nNEIGHBOURS", { bg: "#1f4a4e", accent: "#f2d08a", scale: 0.32 }), { px: 256, glow: true, ei: 0.4 });
    decal(g, 1.2, 0.8, 2.3, 1.7, -3.74, signFace("", { bg: "#8ab0c8", accent: "#f0f0f0", scale: 0.3 }), { px: 64 });
    // A bookshelf of past grant files against the left of the back wall.
    const shelf = group(g, -3.4, 0, -3.5);
    box(shelf, 0.9, 1.8, 0.32, 0, 0.9, 0, 0x6a5a48, { rough: 0.7 });
    for (const [bx, by, c] of [[-0.28, 0.5, 0x1f4a4e], [-0.1, 0.5, 0x8a3a3a], [0.12, 0.5, 0x3a5a8a], [-0.2, 1.1, 0x8a7a3a], [0.1, 1.1, 0x3a6a4a], [0.28, 1.1, 0x5a3a6a]]) {
      box(shelf, 0.14, 0.34, 0.26, bx, by, 0.04, c, { rough: 0.7 });
    }

    // ------------------------------------------------------------ the learner's desk
    const myDesk = desk(0, -1.9);
    const laptop = group(myDesk, 0.2, 0.78, 0);
    box(laptop, 0.36, 0.015, 0.25, 0, 0, 0, 0x2a2d31, { rough: 0.4, metal: 0.5 });
    const callScreen = decal(laptop, 0.34, 0.21, 0, 0.13, -0.12, screenFace("VIDEO CALL · CITY GRANTS", ["Programme officer", "Draft budget feedback"]), { px: 256, glow: true, ei: 0.7 });
    callScreen.rotation.x = -0.25;
    chair(0, -1.2, Math.PI, 0x3a4a50);
    bead(0.55, 1.4, -1.55, "listen-officer", "Hear her out — no rebuttal yet", { w: 0.54 });
    card(-0.45, 1.35, -1.55, "rfp-card", "The notice — allowable costs", "NOTICE\nALLOWABLE COSTS", { w: 0.54, ry: 0.2 });

    // The document tray with the eligibility papers.
    const tray = group(g, -1.9, 0, -1.9, 0.3);
    box(tray, 0.9, 0.05, 0.5, 0, 0.74, 0, 0x8a7258, { rough: 0.6 });
    for (const sx of [-0.4, 0.4]) box(tray, 0.05, 0.72, 0.44, sx, 0.36, 0, 0x5a4a3a, { rough: 0.7 });
    const docs = [
      ["doc-determination-letter", "IRS LETTER", ["Exempt under 501(c)(3)"], -0.3, 0.1],
      ["doc-latest-990", "FORM 990", ["Filed · public"], 0.0, 0.1],
      ["doc-state-registration", "STATE REGISTRY", ["Charitable trusts · current"], 0.3, 0.1],
      ["doc-board-budget", "ORG BUDGET", ["Board approved"], -0.15, -0.12],
    ];
    for (const [id, t, rows, dx, dz] of docs) {
      const d = decal(tray, 0.22, 0.28, dx, 0.77, dz, paperFace(t, rows, { band: "#1f4a4e" }), { px: 160 });
      d.rotation.x = -Math.PI / 2;
      reg(hits, d, id);
    }
    const album = box(tray, 0.2, 0.04, 0.2, 0.2, 0.79, -0.12, 0x8a3a5a, { rough: 0.6 });
    reg(hits, album, "doc-gala-album");
    holoTag(tray, "Eligibility papers", 0, 1.05, 0, { css: GNC_CSS, w: 0.36 });

    // The budget narrative ladder, the indirect meter.
    const bud = group(g, -2.9, 0, -0.6, 0.9);
    cyl(bud, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [bid, label, y] of [
      ["bud-personnel", "1 · Personnel", 0.75], ["bud-fringe", "2 · Fringe", 1.05],
      ["bud-direct-costs", "3 · Direct programme costs", 1.35], ["bud-indirect", "4 · Indirect, at the rate", 1.65],
    ]) {
      const b = ball(bud, 0.026, 0, y, 0, GNC_ACCENT, { emissive: GNC_ACCENT, ei: 1.5, seg: 12 });
      holoTag(bud, label, 0.2, y, 0, { css: GNC_CSS, w: 0.48 });
      reg(hits, b, bid);
    }
    const indStand = stand(-1.2, -0.4, 0.3);
    const indGauge = instrument(indStand, 0, 1.02, 0, { idle: "RATE", color: GNC_ACCENT, w: 0.2, d: 0.26 });
    holoTag(indStand, "Indirect rate · cap 12%", 0, 1.22, 0, { css: GNC_CSS, w: 0.44 });
    reg(hits, indGauge, "indirect-meter");

    // The catering quote and the conflict tray; the board binder.
    const quoteGrp = group(g, 0.55, 0.79, -2.0);
    const quote = decal(quoteGrp, 0.22, 0.28, 0, 0, 0, paperFace("CATERING QUOTE", ["Lowest of three", "Treasurer's cousin"], { band: "#8a6a2a" }), { px: 160 });
    quote.rotation.x = -Math.PI / 2.3;
    holoTag(quoteGrp, "Quote — treasurer's cousin", 0, 0.2, 0, { css: "#f2c14b", w: 0.48 });
    reg(hits, quote, "cousin-quote-card");
    const boardTable = group(g, 2.0, 0, -1.0, -0.5);
    box(boardTable, 1.0, 0.05, 0.6, 0, 0.74, 0, 0x6a5a48, { rough: 0.6 });
    cyl(boardTable, 0.05, 0.12, 0.72, 0, 0.36, 0, 0x3a3f46, { rough: 0.5, metal: 0.4, seg: 10 });
    const coiTray = box(boardTable, 0.34, 0.04, 0.26, -0.25, 0.78, 0, 0x2a2d31, { rough: 0.6 });
    holoTag(boardTable, "Conflict-of-interest tray", -0.25, 1.0, 0, { css: "#59c97b", w: 0.46 });
    reg(hits, coiTray, "coi-tray");
    const binder = box(boardTable, 0.26, 0.06, 0.32, 0.25, 0.79, 0, 0x1f4a4e, { rough: 0.6 });
    void binder;
    chair(2.6, -1.5, -2.1, 0x3a4a50);
    card(1.3, 1.4, -0.3, "recusal-minutes", "Minutes — disclosed, recused, voted", "MINUTES\nRECUSAL", { w: 0.64, ry: -0.3 });
    card(2.95, 1.35, -0.3, "annual-disclosure-card", "Annual disclosure statements", "2 OF 9\nMISSING", { w: 0.5, ry: -0.9 });

    // The records cabinet and its lock.
    const cabinet = group(g, 3.2, 0, -2.6, -0.7);
    box(cabinet, 0.5, 1.3, 0.6, 0, 0.65, 0, 0x6a7478, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 3; i++) box(cabinet, 0.4, 0.02, 0.01, 0, 0.3 + i * 0.4, 0.305, 0x2a2d31, { rough: 0.5 });
    const lockCyl = cyl(cabinet, 0.025, 0.025, 0.03, 0, 1.2, 0.31, 0xd8c060, { rough: 0.3, metal: 0.8, seg: 10 });
    lockCyl.rotation.x = Math.PI / 2;
    holoTag(cabinet, "Client records — lock it", 0, 1.55, 0, { css: GNC_CSS, w: 0.4 });
    reg(hits, lockCyl, "cabinet-lock");
    const files = box(g, 0.24, 0.08, 0.3, 2.7, 0.79, -1.2, 0xe8e2cc, { rough: 0.8 });
    void files;

    // The draft report on the wall, with claims to check.
    board(0.7, 0.44, 0.9, 2.0, -3.7, (cx, w, h) => lines(cx, w, h, "DRAFT REPORT", ["Tap every claim you cannot prove"]));
    const claims = group(g, 0.55, 0, -3.55);
    for (const [cid, label, y, c] of [
      ["claim-no-source", "\"92% of youth improved\"", 1.62, GNC_ACCENT], ["claim-minor-photo", "Photo: named child", 1.42, GNC_ACCENT],
      ["claim-other-grant-figure", "Figure from another report", 1.22, GNC_ACCENT], ["claim-sign-in-count", "Attendance · sign-in sheets", 1.02, 0x7fc4d8],
    ]) {
      const b = ball(claims, 0.024, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(claims, label, 0.36, y, 0, { css: GNC_CSS, w: 0.56 });
      reg(hits, b, cid);
    }
    const burnStand = stand(1.3, 0.5, -0.3);
    const burnGauge = instrument(burnStand, 0, 1.02, 0, { idle: "PACE", color: GNC_ACCENT, w: 0.2, d: 0.26 });
    holoTag(burnStand, "Spend-down vs budget", 0, 1.22, 0, { css: GNC_CSS, w: 0.4 });
    reg(hits, burnGauge, "burn-meter");

    // The report package ladder.
    const pkg = group(g, 3.3, 0, 0.6, -1.1);
    cyl(pkg, 0.022, 0.022, 1.7, 0, 0.85, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [pid, label, y] of [
      ["rpt-financial", "Financial vs budget", 0.8], ["rpt-narrative", "Sourced narrative", 1.05],
      ["rpt-documentation", "Receipts + time records", 1.3], ["rpt-sign-off", "Signed + reviewed", 1.55],
    ]) {
      const b = ball(pkg, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(pkg, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.42 });
      reg(hits, b, pid);
    }

    // ------------------------------------------------------------ the colleague and the volunteer
    const colDesk = desk(-2.0, 0.6, 0.4);
    void colDesk;
    chair(-2.2, 1.15, Math.PI + 0.4, 0x3a4a50);
    const colleague = seatedFigure(g, -2.2, 0.49, 1.15, { ry: Math.PI + 0.4, cloth: 0x5a4a6a });
    holoTag(colleague.torso, "Colleague", 0, 1.36, 0.1, { css: GNC_CSS, w: 0.24 }).rotation.y = -(Math.PI + 0.4);
    const colScreenGrp = group(g, -2.05, 0.78, 0.55, 0.4);
    box(colScreenGrp, 0.36, 0.015, 0.25, 0, 0, 0, 0x2a2d31, { rough: 0.4, metal: 0.5 });
    const colScreen = decal(colScreenGrp, 0.34, 0.21, 0, 0.13, 0.12, screenFace("DRAFT EMAIL", ["To: city grants", "(no attachment)"]), { px: 256, glow: true, ei: 0.7 });
    colScreen.rotation.y = Math.PI; colScreen.rotation.x = 0.25;
    const colIdle = colScreen.material;
    const sendingFace = decal(colScreenGrp, 0.34, 0.21, 0, 0.13, 0.121, screenFace("SENDING…", ["Attached: client_list_full.xlsx", "Names · birth dates · addresses"], "#f0645b"), { px: 256, glow: true, ei: 0.9 });
    sendingFace.rotation.y = Math.PI; sendingFace.rotation.x = 0.25;
    sendingFace.visible = false;
    void colIdle;
    card(-1.2, 1.35, 0.9, "stop-send-card", "Stop the send — counts only", "STOP\nDE-IDENTIFY", { w: 0.52, ry: 0.4, accent: "#f2c14b", css: "#f2c14b" });
    const volunteer = standingPerson(g, 0.6, 1.5, { ry: Math.PI, cloth: 0x7a5a3a, hiVis: false });
    volunteer.root.visible = false;
    const campaignSign = decal(volunteer.torso, 0.4, 0.26, 0.3, 1.2, 0.2, signFace("PHONE BANK\nTONIGHT", { bg: "#b0453a", accent: "#fff", scale: 0.36 }), { px: 128 });
    void campaignSign;
    card(-0.3, 1.35, 1.5, "no-campaign-card", "\"We can't lend anything to a campaign\"", "NO CAMPAIGN\nACTIVITY", { w: 0.64, ry: 0.1, accent: "#f2c14b", css: "#f2c14b" });

    // ------------------------------------------------------------ the wrong moves
    card(-0.9, 1.2, -2.75, "double-charge-salary", "Charge her salary to both grants?", "SALARY x2", {
      w: 0.6, ry: 0, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    const usb = box(g, 0.06, 0.02, 0.025, 2.55, 0.8, -1.35, 0x1a4aa0, { rough: 0.4, metal: 0.4 });
    holoTag(g, "Copy the client files to a USB stick?", 2.55, 1.05, -1.35, { css: "#f0645b", w: 0.62 });
    reg(hits, usb, "client-files-home");
    bead(-0.6, 1.2, -0.9, "reply-all-angry", "Reply-all in anger?", { color: 0xf0645b, css: "#f0645b", w: 0.4 });
    card(1.6, 1.2, 1.3, "all-nighter-alone", "Finish it alone overnight?", "ALL-NIGHTER", {
      w: 0.5, ry: -0.3, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });

    // ------------------------------------------------------------ closing boards
    const log = board(0.56, 0.4, 2.3, 1.95, 1.9, (cx, w, h) => lines(cx, w, h, "GRANT FILE", [
      "Submitted · budget version", "Recusal · report date · records",
    ]), { ry: -0.6 });
    reg(hits, log.userData.face, "grant-log-board");
    const checkin = board(0.5, 0.36, -2.6, 1.95, 2.0, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", [
      "How did the week land?", "What changes next deadline?",
    ], { accent: "#7fc4d8" }), { ry: 0.6, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const guide = board(0.62, 0.32, -0.6, 2.6, -3.7, (cx, w, h) => lines(cx, w, h, "OPEN BOOKS", [
      "Claim only what you can prove.",
    ], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.13);
    });

    // ------------------------------------------------------------ the director
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const director = standingFigure(g, -1.5, 2.3, { ry: 2.8, cloth: 0x2f4650, trousers: 0x262d36 });
    holoTag(director, "Executive director", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.36 }).rotation.y = -2.8;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.1, -1.9),

      onStepComplete(step) {
        if (step.id === "disclose-the-conflict") {
          quoteGrp.position.set(2.0 - 0.22, 0.8, -1.0 - 0.12);
          quote.rotation.x = -Math.PI / 2;
          coiTray.material = mat(0x59c97b, { rough: 0.6, emissive: 0x59c97b, ei: 0.4 });
        }
        if (step.id === "lock-the-client-records") {
          lockCyl.rotation.z = Math.PI / 2;
          lockCyl.material = mat(0x59c97b, { rough: 0.3, metal: 0.6, emissive: 0x59c97b, ei: 0.5 });
          files.visible = false;
        }
        if (step.id === "close-the-grant-log") {
          repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "GRANT FILED", ["Report signed and sent", "No client names in the file"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      onHazard(id, s) {
        if (id === "double-charge-salary" || id === "client-files-home" || id === "reply-all-angry") {
          director.rotation.y = 1.2;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. Public money is only kept in the open.");
        }
      },

      onInterrupt(it) {
        if (it.id === "client-list-to-funder") sendingFace.visible = true;
        if (it.id === "campaign-phone-bank-request") {
          volunteer.root.visible = true;
          volunteer.arms[1].shoulder.rotation.x = -0.8;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "client-list-to-funder") sendingFace.visible = false;
        if (it.id === "campaign-phone-bank-request") {
          volunteer.arms[1].shoulder.rotation.x = 0;
          volunteer.root.visible = false;
        }
      },

      animate(t, dt, session) {
        colleague.head.rotation.y = Math.sin(t * 0.5) * 0.06;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "set-the-indirect-rate") {
          const ok = gg.t >= 0.36 && gg.t <= 0.48;
          repaint(indGauge.userData.screen, signFace(`${(gg.t * 25).toFixed(1)}%`, {
            bg: "#0c1a1c", accent: ok ? "#59c97b" : "#f0645b", fg: "#eef8fa", scale: 0.52,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "keep-spend-on-pace" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(burnGauge.userData.screen, signFace(ok ? "ON PACE" : tr.v < 0.3 ? "UNDER" : "OVER", {
            bg: "#0c1a1c", accent: ok ? "#59c97b" : "#f0645b", fg: "#eef8fa", scale: 0.5,
          }));
        }
      },
    };
  },
};
