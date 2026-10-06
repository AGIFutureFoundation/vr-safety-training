import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, paperFace, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pay Stub & Withholding VR — Job Readiness Edition, financial
// coaching block.
//
// A first-period apprentice's first pay stub, read at the break-room table the
// way it should be read every payday: gross and net, the pay period, the rate
// held against the wage schedule in the apprenticeship standard, the hours
// held against your own log, every deduction named, and the W-4 read before it
// is signed. The withholding guidance is the IRS's own — the W-4, the Tax
// Withholding Estimator, free tax help, and how the IRS does and does not
// contact people — and nothing here goes beyond it: this station gives no tax
// advice of its own. Every rate, hour and dollar on the stub is an example.

const PYS_ACCENT = 0x8fb8e8;
const PYS_CSS = "#8fb8e8";

export const SIM_PAY_STUB_AND_WITHHOLDING = {
  id: "pay-stub-and-withholding",
  index: "253",
  domain: "Financial coaching",
  trade: "Financial coaching — reading a pay stub and checking withholding",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "clear",
  certification: "IRS guidance for workers — Form W-4 and when to review it, the IRS Tax Withholding Estimator, who may claim exemption from withholding, free tax help through the IRS's Volunteer Income Tax Assistance programme, the rule that all income including cash is reportable, and the IRS's own statement of how it contacts taxpayers; the progressive wage schedule in the apprenticeship standard the apprentice was indentured under, registered with the U.S. Department of Labor or a State Apprenticeship Agency; LIUNA's dues and benefit deductions as the local's agreement sets them; the CFPB's budgeting guidance, which starts from take-home pay; SAMHSA's National Helpline and 988 for the stress money problems carry",
  name: "Pay Stub & Withholding",
  title: simTitle("Pay Stub & Withholding"),
  tagline: "Read the first stub properly: rate against the wage schedule, hours against your own log, every deduction named, the W-4 read before signing and checked with the IRS's own estimator — past a caller using the IRS's name",
  accent: PYS_ACCENT,
  accentCss: PYS_CSS,
  parSeconds: 300,
  footprint: 2.2,
  supportLine: "your steward if the pay problem is wearing on you, 988 if it has become a crisis, or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if drinking or using has become part of how you cope",
  badge: { id: "stub-read-right", name: "Stub Read Right", note: "Rate, hours and deductions all checked, the error raised in writing, and nothing given to a caller using the IRS's name" },

  game: system({
    name: "Payday Check",
    currency: "STUB",
    ranks: ["New Hire", "Stub Reader", "Hours Keeper", "Withholding Checked", "Payday Certified"],
    badges: [
      { id: "caught-the-short-pay", name: "Caught The Short Pay", note: "The stub lines and the stub errors found clean", test: AWARD.all(AWARD.stepClean("stub-lines"), AWARD.stepClean("stub-errors")) },
      { id: "nothing-to-a-caller", name: "Nothing To A Caller", note: "No unsafe action anywhere at the table", test: AWARD.safe },
      { id: "rate-dead-on", name: "Rate Dead On", note: "The period rate committed near the middle of the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-payday", name: "Clean Payday", note: "No corrections anywhere", test: AWARD.clean },
      { id: "read-it-through", name: "Read It Through", note: "Every timed passage carried without a break", test: AWARD.unbroken },
      { id: "before-the-break-ends", name: "Before The Break Ends", note: "Finish inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "pys-exempt-box": "You went to tick EXEMPT on the W-4. The IRS says a worker may claim exemption from withholding only if they had no federal income tax liability last year and expect none this year; claiming it otherwise means nothing is withheld all year and the whole amount comes due at filing time, sometimes with a penalty on top. It is the one box on the form that feels like a raise and works like a loan.",
    "pys-blank-timecard": "You were about to sign a blank timecard for the foreman to 'fill in later'. A signature on a timecard says the hours on it are true, and a blank one lets anybody write any hours under your name — including fewer than you worked. You sign a timecard after you have read the hours on it, the same way you would sign anything else.",
    "pys-ssn-callback": "That message slip says 'payroll' called and wants a callback with your Social Security number to fix your W-2. Your employer already has your number from your hiring paperwork and asks for corrections in person or in writing; a callback to a number on a slip is exactly how W-2 and refund fraud starts, and the IRS warns that criminals pose as employers and tax officials to get it.",
    "pys-cash-flyer": "That flyer offers weekend cash work with no stub. The IRS is plain that all income, including cash, is reportable, and work with no stub also has no withholding, no record of the hours for Social Security, no proof of income for a lease or a loan and no workers' compensation if you are hurt. It costs far more than it pays, and it can put your standing in the apprenticeship at risk.",
  },

  lateNotes: {
    "pys-paycheck-log": "The paycheck log is filled in after the stub has been checked and any error raised — logging a stub you have not checked just records the mistake.",
    "pys-payroll-window": "Not yet. You take a correction to payroll once you know exactly what is wrong on the stub and have your own hours log to show them.",
  },

  steps: [
    {
      id: "open-stub", kind: "select", target: "pys-stub-envelope",
      title: "Open the stub, not just the deposit",
      cue: "Take your pay stub out of the envelope — the deposit amount alone tells you nothing about whether it is right.",
      why: "The deposit in the bank is the last number on the stub and the only one most people look at, which is why short pay goes unnoticed for months. The stub is the employer's written account of the hours, the rate and every deduction, and it is the document you correct against. The CFPB's budgeting guidance also starts from take-home pay, so knowing how the stub gets there is where a budget starts.",
    },
    {
      id: "stub-lines", kind: "find", noHint: true,
      targets: ["pys-gross-line", "pys-net-line", "pys-period-line"],
      itemNames: { "pys-gross-line": "gross pay", "pys-net-line": "net pay", "pys-period-line": "the pay period" },
      itemNotes: {
        "pys-gross-line": "Gross pay is hours times rate, before anything comes out. If gross is wrong, everything below it is wrong too.",
        "pys-net-line": "Net pay is what is left after every deduction — the number that actually reaches the bank and the one a budget is built on.",
        "pys-period-line": "The pay period says which days these hours were for. Checking hours against your own log only works if you are checking the same days.",
      },
      title: "Find gross, net and the pay period",
      cue: "On the example stub, find the gross pay, the net pay and the dates of the pay period.",
      why: "Gross is what you earned, net is what you received, and the pay period is which days it covers — three numbers that let everything else on the stub be checked. People who only read net have no way of knowing whether a smaller deposit is a deduction they agreed to, a tax change, or hours that were simply not paid, and each of those has a different fix.",
    },
    {
      id: "rate-check", kind: "gauge", target: "pys-rate-gauge",
      title: "Read your period rate off the wage schedule",
      cue: "Commit the first-period rate the apprenticeship standard's wage schedule sets for you — the example chart is on the wall.",
      gauge: {
        label: "PERIOD 1 RATE (EXAMPLE)", speed: 0.6, green: [0.42, 0.58],
        readout: (t) => `$${(16 + t * 8).toFixed(2)} an hour — example`,
        missNote: "That is not the first-period rate on the schedule. An apprentice's rate is set as a share of the journey-level rate for each period, and the apprenticeship standard prints it — read it there, not from memory.",
      },
      why: "A registered apprenticeship standard includes a progressive wage schedule: the apprentice's rate as a share of the journey-level rate, rising period by period as hours and instruction are completed. The first thing to check on any stub is that the rate matches the period you are in, and the example schedule on the wall is where that number comes from — not the foreman's recollection and not last year's rate sheet.",
    },
    {
      id: "hours-reconcile", kind: "drag", target: "pys-hours-card",
      title: "Lay your own hours log against the stub",
      cue: "Carry your pocket hours log onto the stub and compare the days and hours line by line.",
      why: "Your own record of the hours you worked, written the same day, is the only thing that can show a stub is short. Payroll works from timecards that pass through several hands; a missing overtime hour or a day left off is common and honest, and it only gets fixed when somebody holds their own log against the stub. Apprentices also need those hours logged for the apprenticeship itself.",
      drag: { to: "pys-stub-slot", radius: 0.4, missNote: "Not on the stub. The log has to sit beside the pay period it is checking, or you are comparing different weeks." },
    },
    {
      id: "deductions", kind: "sequence", anyOrder: true,
      targets: ["pys-ded-federal", "pys-ded-fica", "pys-ded-state", "pys-ded-dues"],
      itemNames: { "pys-ded-federal": "federal income tax withheld", "pys-ded-fica": "Social Security and Medicare", "pys-ded-state": "state taxes", "pys-ded-dues": "union dues you authorised" },
      itemNotes: {
        "pys-ded-federal": "Federal income tax withholding is set by the W-4 you filed. It is an estimate paid ahead, settled when you file.",
        "pys-ded-fica": "Social Security and Medicare are withheld from wages and are what builds your own record for those programmes later.",
        "pys-ded-state": "State income tax and any state disability insurance, where the state has them, come out as the state requires.",
        "pys-ded-dues": "Union dues come out because you authorised them. LIUNA's dues and any benefit contributions are set by the local's agreement, and you can ask the steward what each line is.",
      },
      title: "Name every deduction on the stub",
      cue: "Find federal withholding, Social Security and Medicare, state taxes and your dues — order does not matter.",
      why: "Every line between gross and net should be something you can name and explain: taxes the law requires to be withheld, and deductions you authorised, like dues. A line you cannot name is a question for payroll or the steward, not something to shrug at, because deductions are where both honest errors and quiet overcharges hide — and the IRS's guidance only covers the tax lines, not the rest.",
    },
    {
      id: "w4-read", kind: "hold", target: "pys-w4-form", seconds: 6,
      title: "Read the W-4 before you sign it",
      cue: "Hold the W-4 open and read each step through before anything is filled in or signed.",
      why: "The W-4 is how you tell your employer how much federal income tax to withhold, and the IRS's own instructions on the form explain each step — multiple jobs, dependents, other adjustments. Reading it through before signing is the difference between withholding set on purpose and a default that leaves you owing in April or waiting all year for money that was yours. This station gives no tax advice beyond the form's own instructions.",
      holdBreakNote: "You put the W-4 down partway through. The step you skipped is the one that decides whether this year's withholding is close — read it to the signature line.",
    },
    {
      id: "estimator", kind: "select", target: "pys-estimator-laptop",
      title: "Check the withholding with the IRS's own estimator",
      cue: "Open the IRS Tax Withholding Estimator on IRS.gov with the stub beside you.",
      why: "The IRS publishes a Tax Withholding Estimator on IRS.gov and recommends using it to check withholding, especially after a new job, a second job or a change at home. It uses the figures on the stub you have just read, which is why the stub comes first. The answer it gives is the IRS's, not a coach's, and it tells you whether to file a new W-4.",
    },
    {
      id: "checkup-date", kind: "turn", target: "pys-checkup-dial",
      title: "Set the next withholding check",
      cue: "Turn the calendar dial to the next point to re-check: a new job, a change at home, or the start of the year.",
      turn: { turns: 1.0, axis: "y", label: "NEXT CHECK" },
      why: "Withholding set once and forgotten drifts out of line as life changes. The IRS suggests checking it at the start of each year and whenever something changes — a second job, a marriage, a child, a big raise between apprenticeship periods. Putting the next check on the calendar now is what makes it happen, rather than finding out at filing time.",
    },
    {
      id: "stub-errors", kind: "find", noHint: true,
      targets: ["pys-err-overtime", "pys-err-rate", "pys-err-dues-twice"],
      itemNames: { "pys-err-overtime": "overtime hours missing", "pys-err-rate": "the wrong period rate", "pys-err-dues-twice": "dues taken twice" },
      itemNotes: {
        "pys-err-overtime": "Your log shows two overtime hours on Thursday; the stub shows none. That is money owed, and your log is the proof.",
        "pys-err-rate": "The stub's rate is below the first-period rate on the wage schedule. Every hour this period was paid short.",
        "pys-err-dues-twice": "The same dues line appears twice. One is yours; the other goes back.",
      },
      title: "Find the three things wrong with this stub",
      cue: "With the schedule and your hours log beside it, find the three errors on the example stub.",
      why: "The errors on a construction stub are almost always the same three: hours that did not make it from the timecard, a rate that was not moved when a period changed or was never set right, and a deduction entered twice. None of them is anybody's scheme most of the time, and all of them are money you worked for. They are found only by holding the stub against the schedule and your own log.",
    },
    {
      id: "payroll-fix", kind: "select", target: "pys-payroll-window",
      title: "Raise the errors with payroll in writing",
      cue: "Take the stub, your hours log and the schedule to the payroll window and ask for the correction in writing — copy the steward.",
      why: "A correction asked for in the hallway is easy to forget and hard to prove. Asking in writing, with the stub, your own hours log and the wage schedule attached, gives payroll everything it needs to fix it and gives you a record with a date on it. Copying the steward matters on a union job: pay problems are exactly what the steward is there for, and an apprentice should not have to chase it alone.",
    },
    {
      id: "ytd-track", kind: "track", target: "pys-ytd-track", seconds: 7,
      title: "Keep the year's withholding on track",
      cue: "Hold the year-to-date withholding inside the band the estimator gave you, payday after payday.",
      track: {
        start: 0.16, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.13, label: "YTD WITHHELD",
        readout: (v) => (v < 0.4 ? "under-withheld — you will owe" : v > 0.62 ? "over-withheld — waiting for your own money" : "on the estimator's line"),
      },
      holdBreakNote: "The year-to-date line drifted out of band. A raise between periods or a second job moves it — that is the moment to run the estimator again.",
      why: "Withholding is a pace over the whole year, not a single number, and the year-to-date line on each stub shows whether it is holding. Under-withheld means a bill at filing time; over-withheld means lending your own money interest-free until the refund. Keeping it near the estimator's line is what the IRS's guidance is for, and a period raise in an apprenticeship is exactly when it drifts.",
    },
    {
      id: "steward-checkin", kind: "select", target: "pys-steward",
      title: "Check in with the steward",
      cue: "Tell the steward what you found and what you sent to payroll, and how you are doing with money this month.",
      why: "The steward is who makes sure the correction actually happens, and the check-in is also a crew check-in in the plain sense: a short paycheck lands hardest on people just starting out, and saying so is not complaining. If the money pressure has become more than a pressure, 988 — or SAMHSA's National Helpline if drinking or using has become part of coping — is the right next call.",
    },
    {
      id: "paycheck-log", kind: "select", target: "pys-paycheck-log",
      title: "Close out the paycheck log",
      cue: "Log this stub: period, hours, rate, net, the errors found, the date the correction was asked for, and the next withholding check.",
      why: "A paycheck log turns every payday into a record you can check the next one against: hours and rate by period, the net that reached the bank, and any correction still owed. It is what you bring to payroll if the fix does not show up next time, what a coach uses to build a budget from real take-home pay, and what an apprentice needs when a period raise is due.",
    },
  ],

  interrupts: [
    {
      id: "pys-irs-caller",
      kind: "Caller using the IRS's name",
      after: "w4-read", delay: 3, seconds: 12,
      alert: "Your phone rings: a caller says he is from the IRS, that your W-4 is 'fraudulent', that police are on the way unless you pay today by gift card, and that you must confirm your Social Security number now.",
      cue: "Do not pay and do not confirm anything. Check how the IRS actually contacts people.",
      target: "pys-irs-notice",
      why: "The IRS publishes how it contacts taxpayers: it generally starts by mail, it does not demand immediate payment by gift card, prepaid card or wire, and it does not threaten to have people arrested. A call that does all three is not the IRS, whatever the caller ID says. The notice on the board says so in the IRS's own words, which is the whole answer.",
      missNote: "The call went on while you read the form, and in the version where you went along with it the gift cards are gone and a stranger has your Social Security number — the one thing somebody needs to file a false return in your name and take your refund.",
      wrongNote: "Not that. The IRS's own guidance on the board is the answer: it does not call to demand gift cards or threaten arrest, and you confirm nothing to a caller.",
    },
    {
      id: "pys-refund-pitch",
      kind: "Refund-advance pitch",
      after: "ytd-track", delay: 3, seconds: 12,
      alert: "A coworker hands you a storefront flyer: 'Your refund TODAY — no wait!' with a fee in small print, and says everyone uses it.",
      cue: "Point to the free help the IRS itself describes.",
      target: "pys-vita-flyer",
      why: "The IRS describes free tax help through its Volunteer Income Tax Assistance programme for people who qualify, and free electronic filing with direct deposit is the fastest way the IRS offers to get a refund. A storefront selling your own refund back to you early, for a fee, is paying to borrow your own money — the free option on the board is the one the IRS itself points to.",
      missNote: "The flyer went round the table unanswered, and in the version where everyone used it, a slice of every refund at the table went to a fee for money that was already theirs. The free help was on the board the whole time.",
      wrongNote: "Not that. The answer is the free tax help the IRS describes — on the board beside you — not a fee for getting your own refund a few days sooner.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, PYS_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#6a6f72", base2: "#61666a", seam: "rgba(0,0,0,0.18)",
    }), { repeat: 5, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.05, rough: 0.9, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.03, color: 0x9aa0a4 });

    // ----------------------------------------------------- the break-room wall
    box(g, 5.6, 2.7, 0.1, 0, 1.35, -2.35, 0xc9cfcc, { rough: 0.9 });
    box(g, 5.6, 0.1, 0.14, 0, 0.05, -2.28, 0x4a5256, { rough: 0.7 });

    // The wage schedule from the apprenticeship standard (example), with the
    // period-rate gauge hung beside it.
    const sched = group(g, -1.05, 1.55, -2.27);
    slab(sched, 1.3, 0.9, 0.03, 0, -0.45, 0, 0x2a3036, { radius: 0.02, rough: 0.6 });
    decal(sched, 1.22, 0.82, 0, 0, 0.02, paperFace("WAGE SCHEDULE — FROM THE STANDARD (EXAMPLE)", [
      "Journey-level rate ........ $40.00",
      "Period 1 .... 50% ........ $20.00",
      "Period 2 .... 55% ........ $22.00",
      "Period 3 .... 60% ........ $24.00",
      "Raise at each period: hours + school",
      "All rates on this chart are examples",
    ], { bg: "#f4f1e8", band: "#2f5f8a" }), { px: 448 });
    holoTag(sched, "wage schedule — example", 0, 0.52, 0.02, { css: PYS_CSS, w: 0.5 });
    const rateGauge = instrument(g, -0.2, 1.1, -2.1, { idle: "$--.--", color: PYS_ACCENT, ry: 0 });
    rateGauge.rotation.x = Math.PI / 2.4;
    holoTag(rateGauge, "period rate", 0, 0.16, 0, { css: PYS_CSS, w: 0.26 });
    reg(hits, rateGauge, "pys-rate-gauge");

    // The IRS notice board — how the IRS contacts people, and the free help.
    const notice = group(g, 0.85, 1.6, -2.27);
    slab(notice, 0.8, 0.9, 0.03, 0, -0.45, 0, 0x8a7050, { radius: 0.02, rough: 0.9 });
    const irs = group(notice, -0.18, 0.12, 0.02);
    slab(irs, 0.38, 0.5, 0.01, 0, -0.25, 0, 0xfbf8f0, { radius: 0.01, rough: 0.8 });
    decal(irs, 0.34, 0.46, 0, 0, 0.008, paperFace("HOW THE IRS CONTACTS YOU", ["Usually by mail first", "No gift-card demands", "No arrest threats", "(IRS guidance)"], { bg: "#fbf8f0", band: "#2f5f8a" }), { px: 224 });
    holoTag(irs, "IRS notice", 0, 0.3, 0.01, { css: PYS_CSS, w: 0.24 });
    reg(hits, irs, "pys-irs-notice");
    const vita = group(notice, 0.2, -0.15, 0.02);
    slab(vita, 0.34, 0.4, 0.01, 0, -0.2, 0, 0xeaf4ea, { radius: 0.01, rough: 0.8 });
    decal(vita, 0.3, 0.36, 0, 0, 0.008, paperFace("FREE TAX HELP", ["IRS volunteer (VITA)", "sites — if you qualify", "E-file + direct deposit"], { bg: "#eaf4ea", band: "#3f7a45" }), { px: 224 });
    holoTag(vita, "free tax help", 0, 0.25, 0.01, { css: "#7ac98a", w: 0.28 });
    reg(hits, vita, "pys-vita-flyer");
    const cash = group(notice, 0.2, 0.3, 0.02);
    slab(cash, 0.3, 0.18, 0.01, 0, -0.09, 0, 0xffe9d8, { radius: 0.01, rough: 0.7 });
    decal(cash, 0.28, 0.16, 0, 0, 0.008, paperFace("CASH WORK SAT", ["No stub · no forms"], { bg: "#ffe9d8", band: "#c0392b" }), { px: 160 });
    holoTag(cash, "cash side job?", 0, 0.14, 0.01, { css: "#f0645b", w: 0.3 });
    reg(hits, cash, "pys-cash-flyer");

    // The next-check calendar dial and the year-to-date track, right side.
    const cal = group(g, 2.0, 1.55, -2.1, -0.4);
    slab(cal, 0.56, 0.62, 0.03, 0, -0.31, 0, 0xf2eee6, { radius: 0.02, rough: 0.8 });
    const calFace = decal(cal, 0.5, 0.22, 0, 0.17, 0.02, paperFace("NEXT W-4 CHECK", ["New job / change / Jan"], { bg: "#fbf8f0", band: "#2f5f8a" }), { px: 224 });
    const calDial = group(cal, 0, -0.12, 0.04);
    cyl(calDial, 0.11, 0.11, 0.03, 0, 0, 0, 0x3a4048, { rough: 0.4, metal: 0.5, seg: 20 }).rotation.x = Math.PI / 2;
    box(calDial, 0.02, 0.09, 0.02, 0, 0.05, 0.02, PYS_ACCENT, { emissive: PYS_ACCENT, ei: 0.6, rough: 0.4 });
    holoTag(cal, "check-up dial", 0, 0.38, 0.02, { css: PYS_CSS, w: 0.3 });
    reg(hits, calDial, "pys-checkup-dial");

    const ytd = group(g, 2.0, 0.98, -2.1, -0.4);
    slab(ytd, 0.66, 0.2, 0.03, 0, -0.1, 0, 0x2a3036, { radius: 0.02, rough: 0.6 });
    const ytdFill = box(ytd, 0.02, 0.1, 0.02, -0.3, 0, 0.02, 0x4a5a6a, { rough: 0.5, cast: false });
    ownMaterial(ytdFill);
    box(ytd, 0.14, 0.12, 0.005, 0.03, 0, 0.015, 0x3f7a45, { opacity: 0.5, transparent: true, rough: 0.5, cast: false });
    holoTag(ytd, "YTD withholding", 0, -0.16, 0.02, { css: PYS_CSS, w: 0.32 });
    reg(hits, ytd, "pys-ytd-track");

    // ------------------------------------------------------------- the table
    const table = group(g, 0, 0, -0.55);
    slab(table, 1.9, 0.05, 0.9, 0, 0.74, 0, 0xb9b3a4, { radius: 0.03, rough: 0.6 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(table, 0.03, 0.03, 0.72, sx * 0.85, 0.36, sz * 0.38, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    }

    // The stub envelope.
    const envelope = group(table, -0.7, 0.77, 0.22, 0.1);
    slab(envelope, 0.26, 0.012, 0.14, 0, 0, 0, 0xf0e6cf, { radius: 0.004, rough: 0.8 });
    const envFace = decal(envelope, 0.24, 0.12, 0, 0.008, 0, signFace("PAYDAY", { bg: "#f0e6cf", accent: PYS_CSS, fg: "#2a3036", scale: 0.5 }), { px: 160 });
    envFace.rotation.x = -Math.PI / 2;
    holoTag(envelope, "stub envelope", 0, 0.1, 0, { css: PYS_CSS, w: 0.3 });
    reg(hits, envelope, "pys-stub-envelope");

    // The stub itself, propped on a stand so its lines can be found.
    const stand = group(g, -0.05, 0.79, -0.72);
    const stub = group(stand, 0, 0.3, 0);
    stub.rotation.x = -0.35;
    slab(stub, 0.7, 0.6, 0.015, 0, -0.3, 0, 0xfdfbf6, { radius: 0.008, rough: 0.8 });
    const stubFace = decal(stub, 0.66, 0.56, 0, 0, 0.012, paperFace("PAY STUB — EXAMPLE", [
      "Period: Mon 3 – Sun 9 .... Rate $18.50",
      "Hours 40.0 · OT 0.0 .... Gross $740.00",
      "Fed W/H $41 · SS+Med $57",
      "State $19 · Dues $30 · Dues $30",
      "NET PAY ............ $563.00",
      "All figures are examples",
    ], { bg: "#fdfbf6", band: "#2f5f8a" }), { px: 448 });
    box(stand, 0.05, 0.3, 0.05, 0, 0.15, -0.08, 0x3a4048, { rough: 0.5, metal: 0.4 });
    holoTag(stub, "pay stub — example", 0, 0.36, 0.02, { css: PYS_CSS, w: 0.36 });
    const row = (i) => 0.28 - (0.26 + 0.1 * i) * 0.56;
    const mk = (id, x, i, w) => reg(hits, box(stub, w, 0.05, 0.03, x, row(i), 0.025, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), id);
    mk("pys-period-line", -0.14, 0, 0.36);
    mk("pys-err-rate", 0.2, 0, 0.26);
    mk("pys-err-overtime", -0.14, 1, 0.34);
    mk("pys-gross-line", 0.2, 1, 0.26);
    mk("pys-ded-federal", -0.2, 2, 0.2);
    mk("pys-ded-fica", 0.05, 2, 0.24);
    mk("pys-ded-state", -0.24, 3, 0.14);
    mk("pys-ded-dues", -0.04, 3, 0.16);
    mk("pys-err-dues-twice", 0.16, 3, 0.16);
    mk("pys-net-line", 0, 4, 0.56);
    const slot = box(stub, 0.6, 0.5, 0.05, 0, 0, 0.05, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, slot, "pys-stub-slot");
    const flags = [];
    for (const [x, i] of [[0.33, 0], [-0.3, 1], [0.3, 3]]) {
      const f = box(stub, 0.035, 0.035, 0.01, x, row(i), 0.02, CITY.alert, { emissive: CITY.alert, ei: 1.1, cast: false });
      f.visible = false;
      flags.push(f);
    }

    // The pocket hours log (drag).
    const hoursCard = group(table, 0.62, 0.77, 0.25, -0.2);
    slab(hoursCard, 0.12, 0.012, 0.17, 0, 0, 0, 0x2f5f8a, { radius: 0.006, rough: 0.6 });
    const hcFace = decal(hoursCard, 0.1, 0.15, 0, 0.008, 0, paperFace("MY HOURS", ["Mon–Fri 8.0", "Thu OT 2.0"], { bg: "#fbf8f0", band: "#2f5f8a" }), { px: 128 });
    hcFace.rotation.x = -Math.PI / 2;
    holoTag(hoursCard, "my hours log", 0, 0.1, 0, { css: PYS_CSS, w: 0.28 });
    reg(hits, hoursCard, "pys-hours-card");

    // The W-4 on a clipboard, with its EXEMPT box as a separate hazard target.
    const w4 = group(table, -0.3, 0.77, 0.2, 0.05);
    box(w4, 0.24, 0.012, 0.32, 0, 0.006, 0, 0x7a5a3a, { rough: 0.6 });
    const w4Face = decal(w4, 0.21, 0.28, 0, 0.014, 0.01, paperFace("FORM W-4", ["Step 1: you", "Step 2: jobs", "Step 3: dependents", "Step 4: other", "Step 5: sign"], { bg: "#fbfbf6", band: "#2f5f8a" }), { px: 224 });
    w4Face.rotation.x = -Math.PI / 2;
    box(w4, 0.1, 0.02, 0.03, 0, 0.014, -0.15, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    holoTag(w4, "form W-4", 0, 0.12, 0, { css: PYS_CSS, w: 0.24 });
    reg(hits, w4, "pys-w4-form");
    const exempt = group(table, -0.05, 0.77, 0.3, 0.05);
    slab(exempt, 0.1, 0.004, 0.06, 0, 0, 0, 0xfff0d0, { radius: 0.004, rough: 0.8 });
    const exFace = decal(exempt, 0.09, 0.05, 0, 0.004, 0, signFace("EXEMPT", { bg: "#fff0d0", accent: "#c0392b", fg: "#7a2f2f", scale: 0.5 }), { px: 128 });
    exFace.rotation.x = -Math.PI / 2;
    holoTag(exempt, "tick exempt?", 0, 0.09, 0, { css: "#f0645b", w: 0.26 });
    reg(hits, exempt, "pys-exempt-box");

    // The laptop with the IRS estimator.
    const laptop = group(table, 0.32, 0.77, -0.2, -0.3);
    slab(laptop, 0.32, 0.015, 0.22, 0, 0, 0, 0x3a4048, { radius: 0.01, rough: 0.4, metal: 0.4 });
    const lid = group(laptop, 0, 0.01, -0.11);
    lid.rotation.x = -1.2;
    slab(lid, 0.32, 0.012, 0.22, 0, 0, 0.11, 0x3a4048, { radius: 0.01, rough: 0.4, metal: 0.4 });
    const lapFace = decal(lid, 0.28, 0.18, 0, 0.008, 0.11, signFace("IRS.gov\nWithholding Estimator", { bg: "#0f1a26", accent: PYS_CSS, scale: 0.24 }), { px: 256, glow: true, ei: 0.7 });
    lapFace.rotation.x = -Math.PI / 2;
    holoTag(laptop, "IRS estimator", 0, 0.3, 0, { css: PYS_CSS, w: 0.3 });
    reg(hits, laptop, "pys-estimator-laptop");

    // The blank timecard (hazard) and the paycheck log.
    const timecard = group(table, 0.72, 0.77, -0.25, 0.2);
    slab(timecard, 0.12, 0.004, 0.2, 0, 0, 0, 0xf6f0dc, { radius: 0.004, rough: 0.8 });
    const tcFace = decal(timecard, 0.1, 0.18, 0, 0.004, 0, paperFace("TIMECARD", ["(blank)", "Sign: ____"], { bg: "#f6f0dc", band: "#c0392b" }), { px: 128 });
    tcFace.rotation.x = -Math.PI / 2;
    holoTag(timecard, "blank timecard", 0, 0.1, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, timecard, "pys-blank-timecard");

    const logBook = group(table, -0.7, 0.77, -0.22, 0.1);
    box(logBook, 0.24, 0.02, 0.17, 0, 0.01, 0, 0x2f4f6f, { rough: 0.6 });
    const logFace = decal(logBook, 0.2, 0.14, 0, 0.021, 0, paperFace("PAYCHECK LOG", ["Period: ____", "Net: ____", "Fix asked: ____"], { bg: "#f6f3ea", band: "#2f4f6f" }), { px: 192 });
    logFace.rotation.x = -Math.PI / 2;
    holoTag(logBook, "paycheck log", 0, 0.12, 0, { css: PYS_CSS, w: 0.28 });
    reg(hits, logBook, "pys-paycheck-log");

    // --------------------------------------- the payroll window and the lockers
    const windowWall = group(g, -2.4, 0, -0.6, Math.PI / 2);
    box(windowWall, 1.6, 2.4, 0.1, 0, 1.2, 0, 0xb9c0bd, { rough: 0.85 });
    const hatch = box(windowWall, 0.8, 0.6, 0.02, 0, 1.3, 0.06, 0x7f9aa8, { rough: 0.2, metal: 0.1, opacity: 0.55, transparent: true });
    void hatch;
    slab(windowWall, 0.9, 0.04, 0.3, 0, 0.98, 0.15, 0x4a5256, { radius: 0.01, rough: 0.5 });
    decal(windowWall, 0.7, 0.14, 0, 1.72, 0.06, signFace("PAYROLL", { bg: "#1f2a33", accent: PYS_CSS, scale: 0.6 }), { px: 256 });
    const window = group(windowWall, 0, 1.1, 0.2);
    reg(hits, box(window, 0.8, 0.5, 0.1, 0, 0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "pys-payroll-window");
    holoTag(windowWall, "payroll window", 0, 1.9, 0.07, { css: PYS_CSS, w: 0.36 });

    const lockers = group(g, 2.35, 0, 0.2, -Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      box(lockers, 0.38, 1.8, 0.45, -0.6 + i * 0.4, 0.9, 0, [0x5a7088, 0x56697f, 0x5a7088, 0x56697f][i], { rough: 0.55, metal: 0.35 });
      for (let v = 0; v < 3; v++) box(lockers, 0.2, 0.012, 0.01, -0.6 + i * 0.4, 1.55 + v * 0.05, 0.23, 0x2a3036, { rough: 0.6 });
    }

    // The break-room phone and the callback slip (hazard).
    const phoneWall = group(g, -2.4, 0, 0.7, Math.PI / 2);
    box(phoneWall, 0.16, 0.26, 0.06, 0, 1.35, 0.08, 0xe4e0d4, { rough: 0.6 });
    const handset = box(phoneWall, 0.05, 0.18, 0.05, 0, 1.4, 0.13, 0x2b3138, { rough: 0.5 });
    void handset;
    const slip = group(phoneWall, 0.2, 1.25, 0.1);
    slab(slip, 0.16, 0.12, 0.004, 0, -0.06, 0, 0xf7e36b, { radius: 0.004, rough: 0.8 });
    decal(slip, 0.15, 0.11, 0, 0, 0.004, paperFace("PAYROLL CALLED", ["call back w/ SSN", "to fix your W-2"], { bg: "#f7e36b", band: "#c0392b" }), { px: 160 });
    holoTag(slip, "callback slip", 0, 0.1, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, slip, "pys-ssn-callback");

    // Chairs and a coffee counter.
    for (const [cx, cz, ry] of [[-0.5, 0.35, Math.PI - 0.2], [0.55, 0.35, Math.PI + 0.2]]) {
      const chair = group(g, cx, 0, cz, ry);
      slab(chair, 0.42, 0.05, 0.4, 0, 0.45, 0, 0x2f5f8a, { radius: 0.03, rough: 0.6 });
      slab(chair, 0.4, 0.18, 0.05, 0, 0.6, -0.18, 0x2f5f8a, { radius: 0.03, rough: 0.6 });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        cyl(chair, 0.015, 0.015, 0.44, sx * 0.17, 0.22, sz * 0.16, CITY.darkSteel, { rough: 0.4, metal: 0.65, seg: 8 });
      }
    }
    const coffee = group(g, 1.6, 0, 1.55, -0.6);
    box(coffee, 0.9, 0.9, 0.45, 0, 0.45, 0, 0x6a5a48, { rough: 0.7 });
    slab(coffee, 0.94, 0.04, 0.5, 0, 0.92, 0, 0x2f3438, { radius: 0.01, rough: 0.4 });
    box(coffee, 0.22, 0.34, 0.24, -0.2, 1.11, 0, 0x22262b, { rough: 0.5, metal: 0.3 });
    cyl(coffee, 0.04, 0.035, 0.1, 0.15, 0.99, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });

    // A vending machine and a water cooler by the door, and the required
    // postings every break room carries.
    const vend = group(g, -2.15, 0, -1.9, 0);
    box(vend, 0.8, 1.8, 0.7, 0, 0.9, 0, 0x8a2f2f, { rough: 0.45, metal: 0.3 });
    box(vend, 0.5, 1.2, 0.02, -0.08, 1.1, 0.36, 0x1b2226, { rough: 0.15, metal: 0.2, opacity: 0.8, transparent: true });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      box(vend, 0.08, 0.14, 0.08, -0.26 + c * 0.12, 0.65 + r * 0.26, 0.28, [0xd8a63a, 0x3f7a45, 0x2f5f8a, 0xc0392b][(r + c) % 4], { rough: 0.6, cast: false });
    }
    box(vend, 0.12, 0.3, 0.02, 0.28, 1.2, 0.36, 0x2a3036, { rough: 0.5 });
    const cooler = group(g, 2.3, 0, -1.05);
    box(cooler, 0.32, 0.95, 0.32, 0, 0.475, 0, 0xe8ecee, { rough: 0.5 });
    cyl(cooler, 0.13, 0.13, 0.4, 0, 1.15, 0, 0x7fb8e0, { rough: 0.15, opacity: 0.6, transparent: true, seg: 16 });
    const postings = group(g, -0.3, 1.9, -2.28);
    for (let i = 0; i < 3; i++) {
      decal(postings, 0.3, 0.22, -0.55 + i * 0.36, 0.28, 0.03, paperFace(["WAGE + HOUR", "SAFETY", "WORKERS' COMP"][i], ["Required posting", "Read it"], { bg: "#fbf8f0", band: ["#2f5f8a", "#c0392b", "#3f7a45"][i] }), { px: 160 });
    }
    const bin = group(g, 1.0, 0, 1.9);
    cyl(bin, 0.18, 0.15, 0.55, 0, 0.275, 0, 0x3a4048, { rough: 0.6, seg: 14 });
    cyl(bin, 0.19, 0.19, 0.03, 0, 0.56, 0, 0x2a3036, { rough: 0.5, seg: 14 });

    for (const sx of [-1, 1]) {
      box(g, 1.2, 0.05, 0.3, sx * 1.1, 2.62, -0.5, 0xe8edf0, { rough: 0.4, cast: false });
      box(g, 1.1, 0.02, 0.22, sx * 1.1, 2.59, -0.5, 0xf6fbff, { emissive: 0xf6fbff, ei: 0.5, rough: 0.4, cast: false });
    }

    // ------------------------------------------------------------ the steward
    const steward = standingFigure(g, 1.5, 0.6, { ry: -1.4, cloth: 0x3a4a5a, vest: 0xf2c14b, skin: 0xc9936a });
    holoTag(steward, "shop steward", 0, 1.84, 0, { css: PYS_CSS, w: 0.3 });
    reg(hits, box(steward, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "pys-steward");

    // The interruptions made visible: a caller on the phone, a flyer passed over.
    const mobile = group(table, 0.05, 0.77, 0.33, 0.1);
    slab(mobile, 0.08, 0.01, 0.15, 0, 0, 0, 0x1b1f24, { radius: 0.01, rough: 0.3, metal: 0.4 });
    const mobileFace = decal(mobile, 0.07, 0.13, 0, 0.007, 0, signFace("", { bg: "#0b0f12", accent: "#0b0f12", scale: 0.3 }), { px: 128, glow: true, ei: 0.8 });
    mobileFace.rotation.x = -Math.PI / 2;
    const irsGlow = box(notice, 0.42, 0.54, 0.005, -0.18, 0.12, 0.012, PYS_ACCENT, { emissive: PYS_ACCENT, ei: 0.0, rough: 0.5, cast: false });
    ownMaterial(irsGlow);
    irsGlow.visible = false;
    const pitch = group(table, 0.3, 0.77, 0.34, -0.4);
    slab(pitch, 0.16, 0.004, 0.22, 0, 0, 0, 0xffe9d8, { radius: 0.004, rough: 0.8 });
    const pitchFace = decal(pitch, 0.14, 0.2, 0, 0.004, 0, paperFace("REFUND TODAY!", ["no wait", "(fee applies)"], { bg: "#ffe9d8", band: "#c0392b" }), { px: 160 });
    pitchFace.rotation.x = -Math.PI / 2;
    pitch.visible = false;
    const vitaGlow = box(notice, 0.38, 0.44, 0.005, 0.2, -0.15, 0.012, 0x7ac98a, { emissive: 0x7ac98a, ei: 0.0, rough: 0.5, cast: false });
    ownMaterial(vitaGlow);
    vitaGlow.visible = false;

    let callOn = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(-0.1, 1.3, -2.0),

      onStepComplete(step) {
        if (step.id === "rate-check") repaint(rateGauge.userData.screen, signFace("$20.00", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.55 }));
        if (step.id === "hours-reconcile") hoursCard.position.set(-0.05, 0.93, -0.55);
        if (step.id === "checkup-date") repaint(calFace, paperFace("NEXT W-4 CHECK", ["Set: next period raise"], { bg: "#fbf8f0", band: "#59c97b" }));
        if (step.id === "stub-errors") for (const f of flags) f.visible = true;
        if (step.id === "ytd-track") { ytdFill.scale.x = 16; ytdFill.position.x = -0.15; ytdFill.material.color.set(CITY.good); }
        if (step.id === "steward-checkin") steward.rotation.y = -2.0;
        if (step.id === "paycheck-log") repaint(logFace, paperFace("PAYCHECK LOG", ["Period: wk 1", "Net: $563 (ex.)", "Fix asked: today"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "pys-irs-caller") {
          callOn = true;
          repaint(mobileFace, signFace("\"IRS\"\ncalling", { bg: "#3a0c10", accent: "#f0645b", scale: 0.24 }));
          mobile.position.y = 0.86;
          irsGlow.visible = true;
        }
        if (it.id === "pys-refund-pitch") {
          pitch.visible = true;
          vitaGlow.visible = true;
          vitaGlow.material.emissiveIntensity = 0.7;
        }
      },
      onInterruptEnd(it) {
        if (it.id === "pys-irs-caller") {
          callOn = false;
          repaint(mobileFace, signFace(it.resolved === "answered" ? "call\nended" : "", { bg: "#0b0f12", accent: "#0b0f12", scale: 0.24 }));
          mobile.position.y = 0.77;
          irsGlow.visible = it.resolved === "answered";
          irsGlow.material.emissiveIntensity = 0.5;
        }
        if (it.id === "pys-refund-pitch") {
          pitch.visible = false;
          vitaGlow.material = mat(0x7ac98a, { emissive: 0x7ac98a, ei: it.resolved === "answered" ? 0.8 : 0.1, rough: 0.5 });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (callOn) irsGlow.material.emissiveIntensity = 0.4 + Math.sin(t * 10) * 0.35;
        if (session?.turn && session.step?.id === "checkup-date") calDial.rotation.z = -session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "rate-check") {
          const ok = gg.t >= 0.42 && gg.t <= 0.58;
          repaint(rateGauge.userData.screen, signFace(`$${(16 + gg.t * 8).toFixed(2)}`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.56 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "ytd-track") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          ytdFill.scale.x = 1 + tr.v * 28;
          ytdFill.position.x = -0.3 + tr.v * 0.28;
          ytdFill.material.color.set(ok ? CITY.good : 0xc0392b);
        }
      },
    };
  },
};
