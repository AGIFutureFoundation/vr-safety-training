import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Credit Report Reading VR — Job Readiness Edition, financial
// coaching block.
//
// A coaching desk and one person's credit report, read the way the Consumer
// Financial Protection Bureau tells people to read it: pulled free from the
// one site the law set up for it, checked line by line, the mistakes found,
// and the dispute actually sent — to the credit reporting company and to the
// company that furnished the line — with a date on the calendar for the
// answer. The Fair Credit Reporting Act is named only the way the CFPB states
// it; no clause number is given anywhere. Every name, balance and date on the
// report in this room is an example, and the station says so on the page.

const CRR_ACCENT = 0x6fc2b0;
const CRR_CSS = "#6fc2b0";
const CRR_WOOD = 0x8a6a4a;
const CRR_PAPER = "#f6f2e8";

export const SIM_CREDIT_REPORT_READING = {
  id: "credit-report-reading",
  index: "251",
  domain: "Financial coaching",
  trade: "Financial coaching — reading and correcting a credit report",
  category: "Community Environmental Justice",
  indoor: "clinic",
  weather: "clear",
  certification: "The Fair Credit Reporting Act (FCRA) as the Consumer Financial Protection Bureau (CFPB) states it — free credit reports from each nationwide credit reporting company through AnnualCreditReport.com, the right to dispute inaccurate or incomplete information with the company that reports it and the company that furnished it, and an investigation usually completed within 30 days; the CFPB's guidance on security freezes, fraud alerts and debt collection; the Truth in Lending Act's APR disclosure as the CFPB describes it, for the card accounts listed on the report; the IRS's published statement that it does not start contact by text or email to ask for personal or financial information; SAMHSA's National Helpline and 988 for the stress money problems carry",
  name: "Credit Report Reading",
  title: simTitle("Credit Report Reading"),
  tagline: "Pull the free report, read every line, find what is wrong, and send the dispute to both companies with a date for the answer — while a caller and a text both try to get your Social Security number",
  accent: CRR_ACCENT,
  accentCss: CRR_CSS,
  parSeconds: 290,
  footprint: 2.2,
  supportLine: "a money coach you trust, 988 if the worry has turned into a crisis, or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if drinking or using has become part of how you are coping",
  badge: { id: "report-read-right", name: "Report Read Right", note: "Every line read, every error disputed with both companies, and nothing given to a caller you could not verify" },

  game: system({
    name: "Credit File",
    currency: "LINE",
    ranks: ["First Look", "Line Reader", "Dispute Writer", "File Keeper", "Credit Report Certified"],
    badges: [
      { id: "found-them-all", name: "Found Them All", note: "The personal-information and account errors all found clean", test: AWARD.all(AWARD.stepClean("personal-info"), AWARD.stepClean("spot-errors")) },
      { id: "nothing-to-a-stranger", name: "Nothing To A Stranger", note: "No unsafe action anywhere in the session", test: AWARD.safe },
      { id: "under-the-line", name: "Under The Line", note: "The utilisation example committed near the middle of the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-file", name: "Clean File", note: "No corrections anywhere", test: AWARD.clean },
      { id: "steady-record", name: "Steady Record", note: "Every timed passage carried without a break", test: AWARD.unbroken },
      { id: "brisk-read", name: "Brisk Read", note: "Finish inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "crr-lookalike-site": "That tablet is a lookalike 'free score' site asking for a card number before it shows you anything. The CFPB sends people to AnnualCreditReport.com because it is the one place the law set up for free reports from the nationwide companies; a site that wants a card number for a 'free' report is usually selling a subscription, and sometimes collecting the number for worse.",
    "crr-ssn-callback": "That sticky note says a 'credit bureau' called and wants a callback with your Social Security number to 'verify your file'. You reach the credit reporting companies through the contact details on their own sites or on the report itself — not through a number somebody left. A Social Security number read to a stranger over the phone is how a clean file turns into an identity-theft file.",
    "crr-skip-dispute": "That card says to just pay the collection you do not recognise and skip the dispute. Paying a debt that is not yours does not remove it and can make it harder to challenge; the CFPB's guidance is to dispute information you believe is inaccurate, in writing, with the company reporting it and the company that furnished it. Skipping that step leaves the error on the file and your money gone.",
    "crr-repair-flyer": "That flyer promises to erase any negative item for a fee paid up front. The CFPB warns that nobody can legally remove accurate, current negative information from a credit report, and that you can dispute errors yourself for free. A company asking for payment before it has done anything is exactly the warning sign the CFPB tells people to walk away from.",
  },

  lateNotes: {
    "crr-bank-statement": "Not yet. The copy of the proof goes in the envelope once the letter says which line is wrong and why — an envelope of paper with no letter explaining it is a dispute nobody can act on.",
    "crr-calendar-dial": "The clock starts when the dispute is sent. Set the follow-up date after the letter and the proof are in the envelope, not before.",
    "crr-action-log": "The log is closed out last, with the dates that actually happened — request, dispute sent, answer due.",
  },

  steps: [
    {
      id: "request-reports", kind: "select", target: "crr-annual-kiosk",
      title: "Pull the free reports from the right place",
      cue: "Use the kiosk to request your reports from AnnualCreditReport.com — the site the CFPB points people to.",
      why: "Under the Fair Credit Reporting Act, as the CFPB states it, you are entitled to free reports from each of the nationwide credit reporting companies, and AnnualCreditReport.com is the one site set up for it. Starting there matters because each company keeps its own file: an error can sit on one report and not the others, and a lookalike 'free score' site shows you none of them and often signs you up for a subscription instead.",
    },
    {
      id: "personal-info", kind: "find", noHint: true,
      targets: ["crr-wrong-address", "crr-name-variant"],
      itemNames: { "crr-wrong-address": "an address you never lived at", "crr-name-variant": "a name spelling that is not yours" },
      itemNotes: {
        "crr-wrong-address": "An address you never lived at is the first sign that somebody else's information has been mixed into your file, or that somebody has used your details. It is worth disputing on its own and it tells you to read every account line twice.",
        "crr-name-variant": "Small spelling variants are common and not always a problem, but a name that is not a variant of yours — a different middle name, a different surname — belongs in the dispute alongside anything else that is not yours.",
      },
      title: "Check the personal information section first",
      cue: "Two lines in the name-and-address section on the wall are not you. Find them.",
      why: "The personal information section is where a mixed file shows itself first: an old address you never lived at, a name that is not a spelling of yours. Those lines do not change a score on their own, but they are how another person's accounts get attached to your report, so the CFPB tells people to check them and dispute what is wrong before reading anything else.",
    },
    {
      id: "read-accounts", kind: "hold", target: "crr-accounts-page", seconds: 6,
      title: "Read every account line, not just the summary",
      cue: "Hold the report open at the accounts section and read each line through: creditor, balance, status, payment history.",
      why: "The summary at the top of a report tells you almost nothing about whether it is right. The account lines do: who reported each one, the balance, the status and the month-by-month payment history. Reading every line in full is slow, and it is also the only way to find the late mark in a month you paid on time or the account that was never yours — which are the errors that actually cost people housing and jobs.",
      holdBreakNote: "You closed the report partway down the accounts section. The line you skipped is as likely as any other to be the one that is wrong — open it again and read to the end.",
    },
    {
      id: "spot-errors", kind: "find", noHint: true,
      targets: ["crr-not-mine-account", "crr-paid-late-mark", "crr-duplicate-collection"],
      itemNames: {
        "crr-not-mine-account": "an account that is not yours",
        "crr-paid-late-mark": "a late mark in a month you paid on time",
        "crr-duplicate-collection": "the same collection listed twice",
      },
      itemNotes: {
        "crr-not-mine-account": "An account you never opened is either a mixed file or identity theft. Either way it is disputed, and if it looks like theft the CFPB also points you to a fraud alert or a security freeze.",
        "crr-paid-late-mark": "A 30-day late mark in a month your bank statement shows the payment cleared on time is an inaccurate line, and the bank statement is your proof.",
        "crr-duplicate-collection": "One old debt appearing twice — once under the original creditor, once under a collector, both showing a balance — makes a single debt look like two. The duplicate is disputed as inaccurate.",
      },
      title: "Find the three lines that are wrong",
      cue: "Three account lines on the example report are inaccurate. Find all three.",
      why: "The Fair Credit Reporting Act, as the CFPB describes it, gives you the right to dispute information that is inaccurate or incomplete, and the credit reporting company has to investigate. The three most common errors are exactly these: an account that is not yours, a late payment reported in a month you paid, and one debt reported twice. Naming them precisely is what makes a dispute something the company can act on.",
    },
    {
      id: "utilisation", kind: "gauge", target: "crr-utilisation-meter",
      title: "Read the card balance against its limit",
      cue: "Commit a paydown that puts the example card's balance under the share of its limit the CFPB suggests keeping to.",
      gauge: {
        label: "USED OF LIMIT (EXAMPLE)", speed: 0.62, green: [0.1, 0.3],
        readout: (t) => `${Math.round(t * 100)}% of the limit used — example`,
        missNote: "That leaves the example card too close to its limit. The CFPB's guidance on scores is to keep the share of available credit you use low — it suggests under about 30 percent — because a card near its limit reads as risk however well it is paid.",
      },
      why: "How much of your available credit you are using is one of the things scoring models read, separately from whether you pay on time. The CFPB's guidance is to keep it low — it suggests under about 30 percent of a card's limit — and the numbers on this meter are an example, not your card. The point is to read the balance and the limit together, the way a lender reading the report will.",
    },
    {
      id: "dispute-letter", kind: "sequence",
      targets: ["crr-dl-item", "crr-dl-reason", "crr-dl-originals"],
      itemNames: { "crr-dl-item": "name the line and account", "crr-dl-reason": "explain why it is wrong", "crr-dl-originals": "enclose copies, keep originals" },
      outOfOrderNote: "Out of order. The letter first says which line it is about, then why that line is wrong, and only then lists the copies enclosed — a list of attachments with no claim in front of it tells the company nothing.",
      title: "Write the dispute letter in the order that works",
      cue: "On the letter template: identify the line, explain what is wrong, then note the copies you enclose — never the originals.",
      why: "The CFPB publishes sample dispute letters because a dispute is read by somebody who knows nothing about you. It has to say which line, which account, what is wrong with it and what you are sending to prove it — and you send copies, never originals, because the originals are your proof if the answer comes back wrong. A letter built in that order gets investigated; a vague complaint gets a form reply.",
    },
    {
      id: "enclose-proof", kind: "drag", target: "crr-bank-statement",
      title: "Put the copy of the proof in the envelope",
      cue: "Carry the copy of the bank statement showing the on-time payment into the dispute envelope.",
      why: "The late mark is disputed with the bank statement that shows the payment clearing on time, because a dispute backed by a document is one the company has to weigh rather than simply ask the furnisher to confirm. It is the copy that goes in the envelope: the original stays in your file, where it is still proof if the first answer does not fix the line.",
      drag: { to: "crr-dispute-envelope", radius: 0.4, missNote: "Not in the envelope. The copy has to travel with the letter, or the company is investigating your word against the furnisher's record." },
    },
    {
      id: "follow-up-date", kind: "turn", target: "crr-calendar-dial",
      title: "Set the date the answer is due",
      cue: "Turn the calendar dial forward to mark when the investigation should be finished.",
      turn: { turns: 1.0, axis: "y", label: "30-DAY WINDOW" },
      why: "The CFPB states that a credit reporting company generally has to finish its investigation of a dispute within 30 days and send you the result. Marking that date the day the letter goes out is what turns a dispute into something you follow up on: if nothing arrives, or the line is still wrong, the next letter goes out on a date rather than whenever you happen to remember.",
    },
    {
      id: "furnisher-copy", kind: "select", target: "crr-furnisher-letter",
      title: "Send the dispute to the company that furnished the line",
      cue: "Address the second copy to the creditor that reported the late mark, not only to the credit reporting company.",
      why: "The CFPB's guidance is to dispute with both the credit reporting company and the company that furnished the information, because the furnisher is where the record came from. Correcting only the report leaves the source wrong, and the same late mark can reappear on the next month's reporting or on one of the other companies' reports that you did not dispute.",
    },
    {
      id: "payment-history", kind: "track", target: "crr-payment-track", seconds: 7,
      title: "Keep the next six months on time",
      cue: "Hold the payment track inside the band: every minimum on time, extra only when rent and food are covered.",
      track: {
        start: 0.16, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.13, label: "PAYMENTS",
        readout: (v) => (v < 0.4 ? "a minimum slipping late" : v > 0.62 ? "overpaying — rent at risk" : "every minimum on time"),
      },
      holdBreakNote: "The track dropped out of band. A single late payment shows on the report for years; hold the minimums steady before anything extra.",
      why: "Payment history is the part of a report that fixes itself only with time, which is why the six months after a dispute matter as much as the dispute. Every minimum on time is the band; paying extra on a card while the rent goes short is not. The CFPB states that most negative information can stay on a report for seven years, so a new late mark costs far more than it saves.",
    },
    {
      id: "coach-checkin", kind: "select", target: "crr-coach",
      title: "Check in with the coach before you leave",
      cue: "Go over what you found with the coach, and say how you are actually doing with it.",
      why: "Reading a report with errors on it is stressful in a way people do not say out loud, and a coach can only help with what they hear. The check-in covers what was disputed and when the answers are due, and also the other question: whether money worry is keeping you up. That is when 988, or SAMHSA's National Helpline if drinking or using has become part of coping, is the right call rather than a sign of failure.",
    },
    {
      id: "action-log", kind: "select", target: "crr-action-log",
      title: "Close out the credit action log",
      cue: "Write down the dates: reports requested, disputes sent to both companies, answers due, and what to check next month.",
      why: "The log is what makes the next step happen: the date each report was pulled, the date each dispute went to the credit reporting company and to the furnisher, the date the answers are due, and what to look for when they arrive. A dispute nobody tracks is a dispute that quietly fails, and the log is also your record if a lender asks why a line changed.",
    },
  ],

  interrupts: [
    {
      id: "crr-screening-call",
      kind: "Caller claiming to screen your rental",
      after: "read-accounts", delay: 3, seconds: 12,
      alert: "The desk phone rings: a caller says she is from the tenant-screening company handling your apartment application and needs your full Social Security number and date of birth read to her now, or the unit goes to someone else.",
      cue: "Do not read anything out. Check who is actually screening you on the application itself.",
      target: "crr-rental-application",
      why: "A tenant-screening report is a consumer report, and the CFPB describes the same rights for it that apply to a credit report: you can find out which company produced it and dispute what is wrong. The application you signed names the screening company and how it contacts you, so that paper — not an urgent caller — is how you check, and you call back only on a number printed there.",
      missNote: "The call ran on while you kept reading, and in the version where you answered her, a stranger has your Social Security number and date of birth, and the apartment was never the point. The report you are cleaning up is the file that gets used next.",
      wrongNote: "Not that. Who is screening you is written on the rental application you signed — check it there and call back only on the number it prints.",
    },
    {
      id: "crr-phishing-text",
      kind: "Phishing text",
      after: "payment-history", delay: 3, seconds: 12,
      alert: "Your phone lights up: 'ALERT: your credit file has been LOCKED. Verify your Social Security number and card number at this link within one hour.'",
      cue: "Do not tap the link. Protect the file the way the CFPB says to.",
      target: "crr-freeze-panel",
      why: "The CFPB's guidance is that a security freeze is free and is placed directly with each nationwide credit reporting company, and that a fraud alert placed with one is passed to the others. Nobody legitimate locks your file by text and asks for your Social Security number to open it — the IRS publishes the same rule for its own name: it does not start contact by text or email to ask for personal or financial information.",
      missNote: "The text sat on the screen and, in the version where you tapped it, a page that looked like a credit bureau now holds your Social Security number and a card number. The report you just cleaned up is exactly the file that gets used next.",
      wrongNote: "Not by answering the text. The freeze and the fraud alert are placed directly with the credit reporting companies, from their own sites — never through a link somebody sent.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, CRR_ACCENT);

    const carpetTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#6f7a78", base2: "#66706e", seam: "rgba(0,0,0,0.10)",
    }), { repeat: 6, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.06, rough: 0.92, cast: false });
    floor.material = texturedMat(carpetTex, { rough: 0.92, metal: 0.02, color: 0x8a9290 });

    // ---------------------------------------------------------- the back wall
    const wall = box(g, 5.6, 2.7, 0.1, 0, 1.35, -2.35, 0xdcd6c8, { rough: 0.9 });
    void wall;
    box(g, 5.6, 0.12, 0.14, 0, 0.06, -2.28, 0x6a5a48, { rough: 0.7 });

    // The report itself, pinned up as two example pages: personal information
    // on the left, the accounts on the right. Invisible markers sit over the
    // lines that are wrong, so the find steps land on the line and not the page.
    const board = group(g, 0, 1.55, -2.27);
    slab(board, 2.9, 1.2, 0.03, 0, -0.6, 0, 0x7a6448, { radius: 0.02, rough: 0.85 });
    decal(board, 1.2, 1.0, -0.72, 0, 0.02, paperFace("PERSONAL INFORMATION — EXAMPLE", [
      "Name: J. Example Worker",
      "Also reported: J. Exampel Worker",
      "Also reported: Dana Q. Other",
      "Address: 1200 Example Ave (current)",
      "Address: 88 Nowhere Ct (never lived)",
      "Employer: example contractor",
      "Reports are free — AnnualCreditReport.com",
    ], { bg: CRR_PAPER, band: "#3f6f66" }), { px: 448 });
    decal(board, 1.4, 1.0, 0.72, 0, 0.02, paperFace("ACCOUNTS — EXAMPLE", [
      "Card A ...... $600 / $2,000 limit ... current",
      "Card B ...... 30 days late — MAR (paid on time)",
      "Auto loan ... current, 18 of 48 paid",
      "Store card .. opened 2019 — not mine",
      "Phone co. ... collection $212",
      "Collector X . collection $212 (same debt)",
      "All figures are examples",
    ], { bg: CRR_PAPER, band: "#3f6f66" }), { px: 448 });
    holoTag(board, "your credit report — example", 0, 0.68, 0.02, { css: CRR_CSS, w: 0.7 });
    const marker = (id, x, y, w) => {
      const m = box(board, w, 0.09, 0.03, x, y, 0.04, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
      reg(hits, m, id);
      return m;
    };
    // paperFace rows sit at 0.26 + 0.1·i of the page from the top.
    marker("crr-name-variant", -0.72, 0.04, 1.1);
    marker("crr-wrong-address", -0.72, -0.16, 1.1);
    marker("crr-paid-late-mark", 0.72, 0.14, 1.3);
    marker("crr-not-mine-account", 0.72, -0.06, 1.3);
    marker("crr-duplicate-collection", 0.72, -0.26, 1.3);
    // Red flags that appear on the lines once found.
    const flags = {};
    for (const [id, x, y] of [["crr-name-variant", -0.1, 0.04], ["crr-wrong-address", -0.1, -0.16], ["crr-paid-late-mark", 1.46, 0.14], ["crr-not-mine-account", 1.46, -0.06], ["crr-duplicate-collection", 1.46, -0.26]]) {
      const f = box(board, 0.05, 0.05, 0.02, x, y, 0.05, CITY.alert, { emissive: CITY.alert, ei: 1.1, rough: 0.5, cast: false });
      f.visible = false;
      flags[id] = f;
    }

    // The follow-up calendar with its dial, to the right of the report.
    const calendar = group(g, 1.95, 1.5, -2.27);
    slab(calendar, 0.62, 0.72, 0.03, 0, -0.36, 0, 0xf2eee4, { radius: 0.02, rough: 0.8 });
    const calFace = decal(calendar, 0.56, 0.44, 0, 0.1, 0.02, paperFace("FOLLOW-UP", ["Dispute sent: ______", "Answer due: ______", "(usually within 30 days)"], { bg: "#fbf8f0", band: "#b8602f" }), { px: 256 });
    const calDial = group(calendar, 0, -0.22, 0.04);
    cyl(calDial, 0.1, 0.1, 0.03, 0, 0, 0, 0x3a4048, { rough: 0.4, metal: 0.5, seg: 20 }).rotation.x = Math.PI / 2;
    box(calDial, 0.02, 0.08, 0.02, 0, 0.05, 0.02, CRR_ACCENT, { emissive: CRR_ACCENT, ei: 0.6, rough: 0.4 });
    holoTag(calendar, "calendar dial", 0, 0.46, 0.02, { css: CRR_CSS, w: 0.3 });
    reg(hits, calDial, "crr-calendar-dial");

    // The payment-history track: twelve month cells on a rail.
    const trackRail = group(g, -1.95, 1.62, -2.27);
    slab(trackRail, 0.8, 0.5, 0.03, 0, -0.25, 0, 0x26302f, { radius: 0.02, rough: 0.6 });
    const cells = [];
    for (let i = 0; i < 6; i++) {
      const c = box(trackRail, 0.1, 0.16, 0.02, -0.3 + i * 0.12, -0.05, 0.02, 0x4d5a58, { rough: 0.5, cast: false });
      ownMaterial(c);
      cells.push(c);
    }
    decal(trackRail, 0.7, 0.1, 0, 0.17, 0.02, signFace("NEXT 6 MONTHS", { bg: "#26302f", accent: CRR_CSS, scale: 0.6 }), { px: 256 });
    holoTag(trackRail, "payment track", 0, 0.33, 0.02, { css: CRR_CSS, w: 0.3 });
    reg(hits, trackRail, "crr-payment-track");

    // ------------------------------------------------------------- the desk
    const desk = group(g, 0, 0, -0.75);
    const deskTop = slab(desk, 1.9, 0.05, 0.85, 0, 0.74, 0, CRR_WOOD, { radius: 0.02, rough: 0.55 });
    void deskTop;
    for (const sx of [-1, 1]) {
      box(desk, 0.05, 0.72, 0.75, sx * 0.9, 0.36, 0, 0x5a4636, { rough: 0.7 });
    }
    box(desk, 1.75, 0.5, 0.03, 0, 0.45, -0.38, 0x5a4636, { rough: 0.7 });

    // The report binder, open at the accounts section (the hold target).
    const binder = group(desk, -0.45, 0.77, 0.05, 0.1);
    box(binder, 0.4, 0.03, 0.3, 0, 0.015, 0, 0x2f5f58, { rough: 0.6 });
    const binderPage = decal(binder, 0.36, 0.26, 0, 0.032, 0, paperFace("ACCOUNTS", ["Creditor / balance", "Status / history", "Read every line"], { bg: CRR_PAPER, band: "#3f6f66" }), { px: 256 });
    binderPage.rotation.x = -Math.PI / 2;
    holoTag(binder, "report — accounts section", 0, 0.16, 0, { css: CRR_CSS, w: 0.5 });
    reg(hits, binder, "crr-accounts-page");

    // The copy of the bank statement (drag) and the dispute envelope (socket).
    const statement = group(desk, 0.15, 0.77, 0.2, -0.15);
    slab(statement, 0.2, 0.006, 0.26, 0, 0, 0, 0xfdfbf4, { radius: 0.004, rough: 0.85 });
    const stFace = decal(statement, 0.18, 0.24, 0, 0.005, 0, paperFace("BANK STMT (COPY)", ["MAR payment", "cleared on time", "example"], { bg: "#fdfbf4", band: "#2f5f7c" }), { px: 192 });
    stFace.rotation.x = -Math.PI / 2;
    holoTag(statement, "statement copy", 0, 0.1, 0, { css: CRR_CSS, w: 0.32 });
    reg(hits, statement, "crr-bank-statement");

    const envelope = group(desk, 0.62, 0.77, 0.18, 0.1);
    slab(envelope, 0.3, 0.012, 0.18, 0, 0, 0, 0xe8dcc0, { radius: 0.004, rough: 0.8 });
    const envFlap = box(envelope, 0.3, 0.004, 0.06, 0, 0.01, -0.06, 0xd8caa8, { rough: 0.8 });
    void envFlap;
    holoTag(envelope, "dispute envelope", 0, 0.1, 0, { css: CRR_CSS, w: 0.36 });
    reg(hits, envelope, "crr-dispute-envelope");

    // The dispute letter template, with its three parts as markers.
    const letter = holoPanel(g, 0.7, 0.5, 1.25, 1.42, -1.35, (cx, w, h) => {
      cx.fillStyle = "rgba(10,22,20,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = CRR_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#d8f2ec";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("DISPUTE LETTER — TEMPLATE", w * 0.05, h * 0.12);
      cx.fillStyle = "#f2fbf8";
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ["1. The line + account number", "2. What is wrong, and why", "3. Copies enclosed — originals kept"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.22)));
    }, { accent: CRR_ACCENT, ry: -0.35 });
    const letterMark = (id, y) => {
      const m = box(letter, 0.6, 0.08, 0.02, 0, y, 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
      reg(hits, m, id);
    };
    letterMark("crr-dl-item", 0.07);
    letterMark("crr-dl-reason", -0.04);
    letterMark("crr-dl-originals", -0.15);

    // The second copy, addressed to the furnisher.
    const furnisher = group(desk, 0.62, 0.77, -0.15, -0.1);
    slab(furnisher, 0.22, 0.006, 0.16, 0, 0, 0, 0xfdfbf4, { radius: 0.004, rough: 0.85 });
    const furFace = decal(furnisher, 0.2, 0.14, 0, 0.005, 0, paperFace("TO: CARD B ISSUER", ["Dispute copy", "Same proof"], { bg: "#fdfbf4", band: "#b8602f" }), { px: 192 });
    furFace.rotation.x = -Math.PI / 2;
    holoTag(furnisher, "copy to the furnisher", 0, 0.1, 0, { css: CRR_CSS, w: 0.44 });
    reg(hits, furnisher, "crr-furnisher-letter");

    // The signed rental application (interruption answer): it names the
    // screening company and the number it calls from.
    const validation = group(desk, -0.05, 0.77, -0.25, 0.05);
    slab(validation, 0.2, 0.006, 0.15, 0, 0, 0, 0xf4efe2, { radius: 0.004, rough: 0.85 });
    const valFace = decal(validation, 0.18, 0.13, 0, 0.005, 0, paperFace("RENTAL APPLICATION", ["Screening co: named", "Its number: printed"], { bg: "#f4efe2", band: "#3f6f66" }), { px: 192 });
    valFace.rotation.x = -Math.PI / 2;
    holoTag(validation, "rental application", 0, 0.1, 0, { css: CRR_CSS, w: 0.38 });
    reg(hits, validation, "crr-rental-application");
    const outTray = group(desk, -0.8, 0.77, -0.25);
    box(outTray, 0.26, 0.04, 0.2, 0, 0.02, 0, 0x3a4048, { rough: 0.5, metal: 0.3 });
    decal(outTray, 0.2, 0.04, 0, 0.03, 0.101, signFace("OUT", { bg: "#1b2224", accent: CRR_CSS, scale: 0.6 }), { px: 96 });

    // The desk phone, with a lamp that the collector's call lights.
    const phone = group(desk, 0.35, 0.77, -0.25);
    box(phone, 0.18, 0.05, 0.2, 0, 0.025, 0, 0x2b3036, { rough: 0.5 });
    const handset = box(phone, 0.05, 0.04, 0.2, -0.05, 0.07, 0, 0x22262b, { rough: 0.5 });
    ownMaterial(handset);
    const phoneLamp = box(phone, 0.04, 0.012, 0.02, 0.05, 0.056, 0.07, CITY.good, { emissive: CITY.good, ei: 0.3, rough: 0.4, cast: false });
    ownMaterial(phoneLamp);
    // The sticky note on the phone — the Social Security callback hazard.
    const sticky = box(phone, 0.07, 0.004, 0.07, 0.05, 0.053, -0.04, 0xf7e36b, { rough: 0.8 });
    holoTag(phone, "callback note?", 0.05, 0.14, -0.04, { css: "#f0645b", w: 0.3 });
    reg(hits, sticky, "crr-ssn-callback");

    // The 'just pay it' card on the desk — the skip-the-dispute hazard.
    const payCard = group(desk, -0.8, 0.77, 0.25, 0.2);
    slab(payCard, 0.2, 0.004, 0.13, 0, 0, 0, 0xffe0d4, { radius: 0.004, rough: 0.8 });
    const payFace = decal(payCard, 0.18, 0.11, 0, 0.004, 0, paperFace("JUST PAY IT", ["Skip the dispute —", "it goes away"], { bg: "#ffe0d4", band: "#c0392b" }), { px: 192 });
    payFace.rotation.x = -Math.PI / 2;
    holoTag(payCard, "skip the dispute?", 0, 0.1, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, payCard, "crr-skip-dispute");

    // The action log (closing step).
    const logBook = group(desk, 0.2, 0.77, -0.05, 0.05);
    box(logBook, 0.24, 0.02, 0.17, 0, 0.01, 0, 0x7a2f2f, { rough: 0.6 });
    const logFace = decal(logBook, 0.2, 0.14, 0, 0.021, 0, paperFace("CREDIT ACTION LOG", ["Requested: ____", "Disputed: ____", "Due: ____"], { bg: "#fbf6ea", band: "#7a2f2f" }), { px: 192 });
    logFace.rotation.x = -Math.PI / 2;
    holoTag(logBook, "credit action log", 0, 0.12, 0, { css: CRR_CSS, w: 0.38 });
    reg(hits, logBook, "crr-action-log");

    // The utilisation meter on the desk's right wing.
    const meter = instrument(g, 1.25, 0.9, -0.55, { idle: "--%", color: CRR_ACCENT, ry: -0.3 });
    holoTag(meter, "used of limit — example", 0, 0.16, 0, { css: CRR_CSS, w: 0.48 });
    reg(hits, meter, "crr-utilisation-meter");
    const meterStand = group(g, 1.25, 0, -0.55);
    cyl(meterStand, 0.2, 0.22, 0.04, 0, 0.02, 0, 0x3a4048, { rough: 0.5, metal: 0.4, seg: 18 });
    cyl(meterStand, 0.03, 0.03, 0.84, 0, 0.44, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    slab(meterStand, 0.34, 0.03, 0.34, 0, 0.87, 0, 0x4a5256, { radius: 0.02, rough: 0.5 });

    // ------------------------------------------------------ the kiosk (left)
    const kiosk = group(g, -1.85, 0, -1.0, 0.5);
    box(kiosk, 0.46, 1.0, 0.36, 0, 0.5, 0, 0x33403e, { rough: 0.55, metal: 0.2 });
    box(kiosk, 0.5, 0.05, 0.4, 0, 1.02, 0, 0x26302f, { rough: 0.5, metal: 0.3 });
    const kioskScreen = group(kiosk, 0, 1.3, 0.02);
    kioskScreen.rotation.x = -0.25;
    box(kioskScreen, 0.44, 0.32, 0.04, 0, 0, 0, 0x1b2422, { rough: 0.4, metal: 0.3 });
    const kioskFace = decal(kioskScreen, 0.4, 0.28, 0, 0, 0.025, paperFace("FREE CREDIT REPORTS", ["AnnualCreditReport.com", "Each nationwide company", "No card number"], { bg: "#0f1a18", band: "#3f6f66" }), { px: 288 });
    for (let i = 0; i < 10; i++) {
      box(kiosk, 0.03, 0.012, 0.025, -0.15 + (i % 5) * 0.075, 1.055, -0.05 + Math.floor(i / 5) * 0.06, 0x59616a, { rough: 0.6, cast: false });
    }
    holoTag(kiosk, "free report kiosk", 0, 1.6, 0, { css: CRR_CSS, w: 0.4 });
    reg(hits, kiosk, "crr-annual-kiosk");

    // The security freeze panel (second interruption's answer).
    const freeze = holoPanel(g, 0.62, 0.44, -2.45, 1.5, 0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(10,22,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = CRR_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#d8f2ec"; cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("FREEZE OR FRAUD ALERT", w * 0.06, h * 0.15);
      cx.fillStyle = "#f2fbf8"; cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Free at each nationwide company", "Placed from their own sites", "Never through a link sent to you"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: Math.PI / 2, accent: CRR_ACCENT });
    reg(hits, freeze, "crr-freeze-panel");
    const shield = group(g, -2.45, 1.86, 0.2, Math.PI / 2);
    const shieldFace = cyl(shield, 0.07, 0.07, 0.02, 0, 0, 0.02, 0x4d5a58, { rough: 0.4, seg: 16 });
    shieldFace.rotation.x = Math.PI / 2;
    ownMaterial(shieldFace);

    // The side table with the lookalike 'free score' tablet (hazard).
    const side = group(g, -1.6, 0, 0.75, 0.3);
    slab(side, 0.6, 0.04, 0.45, 0, 0.62, 0, CRR_WOOD, { radius: 0.02, rough: 0.55 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(side, 0.02, 0.02, 0.6, sx * 0.25, 0.3, sz * 0.18, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 8 });
    const tablet = group(side, 0.05, 0.645, 0, 0.2);
    slab(tablet, 0.26, 0.012, 0.18, 0, 0, 0, 0x22282d, { radius: 0.01, rough: 0.35, metal: 0.3 });
    const tabFace = decal(tablet, 0.22, 0.15, 0, 0.008, 0, signFace("FREE SCORE!\nenter card #", { bg: "#2a0f12", accent: "#f0645b", scale: 0.26 }), { px: 256 });
    tabFace.rotation.x = -Math.PI / 2;
    holoTag(tablet, "lookalike site", 0, 0.14, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, tablet, "crr-lookalike-site");

    // The phone the phishing text lands on, beside the lookalike tablet.
    const mobile = group(side, -0.18, 0.645, 0.08, -0.3);
    slab(mobile, 0.08, 0.01, 0.15, 0, 0, 0, 0x1b1f24, { radius: 0.01, rough: 0.3, metal: 0.4 });
    const mobileFace = decal(mobile, 0.07, 0.13, 0, 0.007, 0, signFace("", { bg: "#0b0f12", accent: "#0b0f12", scale: 0.3 }), { px: 128, glow: true, ei: 0.8 });
    mobileFace.rotation.x = -Math.PI / 2;

    // The bulletin board with the credit repair flyer (hazard).
    const bulletin = group(g, 2.45, 1.45, 0.3, -Math.PI / 2);
    slab(bulletin, 0.9, 0.7, 0.03, 0, -0.35, 0, 0x8a6f4d, { radius: 0.02, rough: 0.9 });
    decal(bulletin, 0.34, 0.28, -0.22, 0.12, 0.02, paperFace("COACHING HOURS", ["Tue + Thu evenings", "Free, by appointment"], { bg: "#fbf8f0", band: "#3f6f66" }), { px: 192 });
    const repair = group(bulletin, 0.2, -0.05, 0.02);
    slab(repair, 0.34, 0.42, 0.01, 0, -0.21, 0, 0xffe9d8, { radius: 0.01, rough: 0.7 });
    decal(repair, 0.3, 0.38, 0, 0, 0.008, paperFace("ERASE ANY NEGATIVE!", ["Guaranteed", "$499 up front", "Call today"], { bg: "#ffe9d8", band: "#c0392b" }), { px: 224 });
    holoTag(repair, "credit repair offer", 0, 0.27, 0.01, { css: "#f0645b", w: 0.4 });
    reg(hits, repair, "crr-repair-flyer");

    // Chairs: the learner's, facing the desk, and a spare by the wall.
    for (const [cx, cz, ry] of [[-0.55, 0.25, Math.PI - 0.3], [0.6, 0.3, Math.PI + 0.3]]) {
      const chair = group(g, cx, 0, cz, ry);
      slab(chair, 0.42, 0.05, 0.4, 0, 0.45, 0, 0x3f5a58, { radius: 0.03, rough: 0.7 });
      slab(chair, 0.4, 0.2, 0.05, 0, 0.6, -0.18, 0x3f5a58, { radius: 0.03, rough: 0.7 });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        cyl(chair, 0.015, 0.015, 0.44, sx * 0.17, 0.22, sz * 0.16, CITY.darkSteel, { rough: 0.4, metal: 0.65, seg: 8 });
      }
    }

    // A plant and a filing cabinet, so the room reads as an office.
    const cabinet = group(g, 2.3, 0, -1.55, -0.4);
    box(cabinet, 0.48, 1.25, 0.6, 0, 0.625, 0, 0x6d7a78, { rough: 0.55, metal: 0.35 });
    for (let i = 0; i < 4; i++) box(cabinet, 0.16, 0.02, 0.02, 0, 0.25 + i * 0.3, 0.31, 0xc9d0ce, { rough: 0.3, metal: 0.8 });
    const pot = group(g, -2.3, 0, -1.8);
    cyl(pot, 0.16, 0.12, 0.3, 0, 0.15, 0, 0x8a5a3c, { rough: 0.8, seg: 14 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ball(pot, 0.12, Math.sin(a) * 0.08, 0.45 + (i % 2) * 0.12, Math.cos(a) * 0.08, 0x3f7a45, { rough: 0.8, seg: 10, seg2: 8 });
    }

    // Ceiling light boxes.
    for (const sx of [-1, 1]) {
      box(g, 1.1, 0.05, 0.34, sx * 1.1, 2.62, -0.6, 0xe8edf0, { rough: 0.4, cast: false });
      box(g, 1.0, 0.02, 0.26, sx * 1.1, 2.59, -0.6, 0xfff6e6, { emissive: 0xfff6e6, ei: 0.5, rough: 0.4, cast: false });
    }

    // ------------------------------------------------------------- the people
    const coach = standingFigure(g, 1.85, -0.2, { ry: -1.2, cloth: 0x3f6f66, skin: 0x8d5a3b });
    holoTag(coach, "financial coach", 0, 1.84, 0, { css: CRR_CSS, w: 0.36 });
    const coachMark = box(coach, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, coachMark, "crr-coach");

    // The caller, as a projection that appears only while the phone rings.
    const caller = holoPanel(g, 0.5, 0.3, 0.55, 1.35, -0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(40,8,10,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0645b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffd8d4"; cx.font = `600 ${Math.round(h * 0.17)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("\"SCREENING\" CALLER", w / 2, h * 0.32);
      cx.font = `${Math.round(h * 0.13)}px Arial, sans-serif`;
      cx.fillText("\"read me your SSN\"", w / 2, h * 0.66);
    }, { accent: CITY.alert });
    caller.visible = false;

    let callOn = false, textOn = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.3, -2.0),

      onStepComplete(step) {
        if (step.id === "personal-info") { flags["crr-name-variant"].visible = true; flags["crr-wrong-address"].visible = true; }
        if (step.id === "spot-errors") {
          for (const id of ["crr-not-mine-account", "crr-paid-late-mark", "crr-duplicate-collection"]) flags[id].visible = true;
        }
        if (step.id === "utilisation") repaint(meter.userData.screen, signFace("UNDER 30%", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.5 }));
        if (step.id === "enclose-proof") statement.position.set(0.62, 0.02, 0.18);
        if (step.id === "follow-up-date") repaint(calFace, paperFace("FOLLOW-UP", ["Dispute sent: today", "Answer due: +30 days", "(usually within 30 days)"], { bg: "#fbf8f0", band: "#59c97b" }));
        if (step.id === "furnisher-copy") furnisher.position.set(-0.8, 0.8, -0.25);
        if (step.id === "payment-history") for (const c of cells) { c.material.color.set(CITY.good); c.material.emissive?.set?.(CITY.good); c.material.emissiveIntensity = 0.4; }
        if (step.id === "coach-checkin") coach.rotation.y = -0.4;
        if (step.id === "action-log") repaint(logFace, paperFace("CREDIT ACTION LOG", ["Requested: today", "Disputed: both cos.", "Due: +30 days"], { bg: "#fbf6ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "crr-screening-call") {
          callOn = true;
          caller.visible = true;
          handset.position.y = 0.16;
          handset.material.emissive.set(CITY.alert);
          handset.material.emissiveIntensity = 0.9;
        }
        if (it.id === "crr-phishing-text") {
          textOn = true;
          repaint(mobileFace, signFace("FILE LOCKED!\nverify SSN", { bg: "#3a0c10", accent: "#f0645b", scale: 0.2 }));
          mobile.position.y = 0.7;
          shieldFace.material.emissive.set(CITY.alert);
          shieldFace.material.emissiveIntensity = 0.8;
        }
      },
      onInterruptEnd(it) {
        if (it.id === "crr-screening-call") {
          callOn = false;
          caller.visible = false;
          handset.position.y = 0.07;
          handset.material.emissiveIntensity = 0;
          phoneLamp.material.emissiveIntensity = 0.3;
          if (it.resolved === "answered") validation.position.set(-0.8, 0.82, -0.25);
        }
        if (it.id === "crr-phishing-text") {
          textOn = false;
          repaint(mobileFace, signFace("", { bg: "#0b0f12", accent: "#0b0f12", scale: 0.3 }));
          mobile.position.y = 0.645;
          if (it.resolved === "answered") {
            shieldFace.material = mat(CITY.good, { emissive: CITY.good, ei: 0.8, rough: 0.4 });
          } else {
            shieldFace.material.emissiveIntensity = 0;
          }
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (callOn) phoneLamp.material.emissiveIntensity = 0.6 + Math.sin(t * 12) * 0.6;
        if (textOn) shieldFace.material.emissiveIntensity = 0.5 + Math.sin(t * 8) * 0.4;
        if (session?.turn && session.step?.id === "follow-up-date") calDial.rotation.z = -session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "utilisation") {
          const ok = gg.t >= 0.1 && gg.t <= 0.3;
          repaint(meter.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "payment-history") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          const lit = Math.min(6, Math.floor((tr.inBand ?? 0) / 7 * 6));
          cells.forEach((c, i) => { c.material.color.set(i < lit ? CITY.good : ok ? 0x4d5a58 : 0x7a3a36); });
        }
      },
    };
  },
};
