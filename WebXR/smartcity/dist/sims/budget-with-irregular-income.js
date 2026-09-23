import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Budget With Irregular Income VR — Job Readiness Edition,
// financial coaching block.
//
// Construction pay does not arrive evenly: rain days, the weeks between
// dispatches, a big overtime month, a side job paid on a 1099. This station
// builds the budget that survives that — on the lean month rather than the
// good one, essentials first, the good months feeding a buffer, the tax on
// self-employment income set aside the way the IRS describes, and the bills
// lined up with the paydays — and then runs it through a slow month while a
// car repair and a checkout offer both test it. The CFPB's budgeting guidance
// is the authority; every figure on the chart and the sheets is an example.

const BII_ACCENT = 0x9ac46a;
const BII_CSS = "#9ac46a";
const BII_WOOD = 0x9a7a58;

export const SIM_BUDGET_WITH_IRREGULAR_INCOME = {
  id: "budget-with-irregular-income",
  index: "254",
  domain: "Financial coaching",
  trade: "Financial coaching — budgeting on irregular construction income",
  category: "Community Environmental Justice",
  indoor: "hotel",
  weather: "clear",
  certification: "The Consumer Financial Protection Bureau (CFPB) budgeting guidance — tracking income and spending, putting housing, utilities, food and getting to work first when money is tight — and its warnings on payday loans, car title loans and buy-now-pay-later plans; the Truth in Lending Act as the CFPB describes it, under which a lender discloses the APR and finance charge before you sign; IRS guidance that self-employment income, including side work paid on a 1099, may require estimated tax payments during the year; the apprenticeship standard's wage schedule, which sets the rate but not the number of hours a season brings; SAMHSA's National Helpline and 988 for the stress an uneven income carries",
  name: "Budget With Irregular Income",
  title: simTitle("Budget With Irregular Income"),
  tagline: "A year of uneven construction pay turned into a budget that holds: built on the lean month, essentials first, the good months feeding a buffer, tax set aside, bills lined up with paydays — and tested by a car repair",
  accent: BII_ACCENT,
  accentCss: BII_CSS,
  parSeconds: 290,
  footprint: 2.2,
  supportLine: "a money coach you trust, 988 if a lean stretch has turned into a crisis, or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if drinking or using has become part of getting through it",
  badge: { id: "lean-month-ready", name: "Lean Month Ready", note: "A budget built on the lean month that paid a car repair from its own buffer without a payday loan" },

  game: system({
    name: "Season Budget",
    currency: "BUFFER",
    ranks: ["Paycheck To Paycheck", "Income Tracker", "Budget Builder", "Buffer Keeper", "Season Budget Certified"],
    badges: [
      { id: "read-the-year", name: "Read The Year", note: "The income pattern and the leaks both found clean", test: AWARD.all(AWARD.stepClean("income-pattern"), AWARD.stepClean("find-leaks")) },
      { id: "no-quick-cash", name: "No Quick Cash", note: "No unsafe action anywhere in the budget", test: AWARD.safe },
      { id: "lean-baseline", name: "Lean Baseline", note: "The baseline committed near the middle of the lean-month band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-budget", name: "Clean Budget", note: "No corrections anywhere", test: AWARD.clean },
      { id: "held-the-lean-month", name: "Held The Lean Month", note: "Every timed passage carried without a break", test: AWARD.unbroken },
      { id: "quick-sheet", name: "Quick Sheet", note: "Finish inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bii-payday-flyer": "That flyer offers a payday loan for a car repair — cash today, due in full on your next payday. The CFPB describes payday loans as short-term, high-cost loans, and gives its own worked example: a fee of fifteen dollars per hundred borrowed for two weeks works out to an APR of almost 400 percent. When the whole amount is due in two weeks on an uneven income, the loan usually gets renewed, and the fee is paid again and again.",
    "bii-title-loan": "That card offers a loan against your car title. The CFPB warns that title loans are high-cost, short-term loans secured by the vehicle, and that borrowers who cannot repay can lose the car — the same car you need to get to the jobsite. For a construction worker, losing the truck can mean losing the next dispatch too.",
    "bii-best-month": "That sheet is a budget built on the best month of the year — the overtime month. A budget set at the best month is short every other month, and the difference ends up on a card or a payday loan. The CFPB's budgeting guidance starts from what actually comes in, and on uneven pay the only safe baseline is the lean month.",
    "bii-rent-to-own": "You reached to sign the rent-to-own agreement for a TV without reading it. The weekly payment looks small, but the total over the term is usually far more than the price at a store, and missing a week can mean losing the item and everything paid so far. A contract is read — term, total cost, what happens if a payment is missed — before it is signed, however friendly the salesperson.",
  },

  lateNotes: {
    "bii-budget-log": "The budget log is written once the plan has been through a slow month, with what really happened — not before the plan exists.",
    "bii-surplus-cash": "Not yet. Surplus only exists once the baseline is set and the essentials are covered — move money into the buffer after the budget says what is left.",
  },

  steps: [
    {
      id: "gather-income", kind: "select", target: "bii-bank-folder",
      title: "Pull a full year of deposits",
      cue: "Open the folder of bank statements and lay out twelve months of what actually came in.",
      why: "An uneven income cannot be budgeted from one paycheck or from memory, because memory keeps the overtime months and forgets the rain weeks. The CFPB's budgeting guidance starts with tracking what really comes in, and a full year of deposits is the only record that shows a construction season honestly — the lean winter, the stretch between dispatches, and the months that were only good because of overtime.",
    },
    {
      id: "income-pattern", kind: "find", noHint: true,
      targets: ["bii-low-month", "bii-gap-months", "bii-windfall"],
      itemNames: { "bii-low-month": "the lean month", "bii-gap-months": "the weeks between dispatches", "bii-windfall": "a one-time windfall" },
      itemNotes: {
        "bii-low-month": "The lowest ordinary month is the baseline. It is the month the budget has to work in without help.",
        "bii-gap-months": "The dip between two jobs is the pattern a buffer exists for. It will come again next year, at about the same time.",
        "bii-windfall": "The tax refund or a big overtime month is not income to plan spending around — it is what fills the buffer.",
      },
      title: "Read the year: lean month, gap and windfall",
      cue: "On the example income chart, find the lean month, the gap between dispatches and the one-time windfall.",
      why: "Every uneven income has the same three shapes in it: a lean month that is the true floor, gaps that come back every year, and one-off windfalls that feel like a raise and are not. The apprenticeship standard — a LIUNA laborer's, or any other trade's — sets the rate for each period but not how many hours a season brings, so reading the year's shape is what tells you what the budget has to survive — rather than hoping next year is steadier.",
    },
    {
      id: "set-baseline", kind: "gauge", target: "bii-budget-gauge",
      title: "Set the budget on the lean month",
      cue: "Commit the monthly baseline at the level of the lean month — not the average, and not the best.",
      gauge: {
        label: "MONTHLY BASELINE (EXAMPLE)", speed: 0.6, green: [0.22, 0.4],
        readout: (t) => `$${Math.round(2200 + t * 2600)} a month — ${t < 0.22 ? "below what essentials need" : t > 0.4 ? "above the lean month" : "the lean month"} (example)`,
        missNote: "That baseline will not hold. Set above the lean month, the budget is short every slow month; set below what the essentials cost, it is not a budget anyone can live on.",
      },
      why: "A budget on uneven pay is set at the lean month, because that is the month it has to work without borrowing. Anything above it becomes a card balance in winter; the good months are not ignored, they are where the buffer and the savings come from. The CFPB's budgeting guidance works from real income, and the figures on the gauge are an example — your own lean month is on your own chart.",
    },
    {
      id: "essentials-first", kind: "sequence",
      targets: ["bii-pri-essentials", "bii-pri-work", "bii-pri-minimums", "bii-pri-buffer"],
      itemNames: { "bii-pri-essentials": "housing, utilities and food", "bii-pri-work": "getting to work", "bii-pri-minimums": "minimum debt payments", "bii-pri-buffer": "the buffer" },
      outOfOrderNote: "Out of order. The essentials come first — a roof, the lights and food — then what gets you to the job, then the minimums, and whatever is left goes to the buffer.",
      title: "Order the budget: essentials first",
      cue: "On the budget sheet: housing, utilities and food; then getting to work; then the minimums; then the buffer.",
      why: "When money is tight the order is the plan. The CFPB's guidance on paying bills puts the essentials — housing, utilities, food and getting to work — ahead of everything else, because falling behind on those costs the most and fastest. Minimum payments come next to keep accounts current, and the buffer takes what is left. Written in order, it tells you what to pay first on a thin paycheck without a fresh decision every time.",
    },
    {
      id: "fill-buffer", kind: "drag", target: "bii-surplus-cash",
      title: "Move the good month's surplus into the buffer",
      cue: "Carry the overtime month's surplus into the slow-month buffer jar before it turns into spending.",
      why: "On uneven pay, the good months have one job: fill the buffer that carries the lean ones. Money left in checking after an overtime month gets spent within weeks, which is why moving it on purpose — into a separate account, or here a jar — is the step that makes the whole budget work. The buffer is what pays for the gap between dispatches instead of a card or a loan.",
      drag: { to: "bii-buffer-jar", radius: 0.4, missNote: "Not in the buffer. Surplus left where it can be spent is spent; carry it all the way into the jar." },
    },
    {
      id: "estimated-tax", kind: "hold", target: "bii-irs-page", seconds: 6,
      title: "Read the IRS page on self-employment income",
      cue: "Hold the page open and read what the IRS says about side work paid on a 1099 and estimated tax.",
      why: "Side jobs paid on a 1099 come with no withholding, and the IRS explains that people with self-employment income may need to make estimated tax payments during the year rather than settling it all in April. Reading the IRS's own page, not a coworker's summary, is the whole point here: this station gives no tax advice of its own, only the fact that the tax on that income has to be planned for.",
      holdBreakNote: "You put the page down before the part about when payments are due. That date is the part people miss — read it to the end.",
    },
    {
      id: "bill-calendar", kind: "turn", target: "bii-bill-calendar",
      title: "Line the bill dates up with the paydays",
      cue: "Turn the bill calendar so each big bill falls just after the paycheck that pays it.",
      turn: { turns: 1.0, axis: "y", label: "DUE DATES" },
      why: "On an uneven income, when a bill is due matters almost as much as how much it is. Many companies will move a due date if you ask, and lining the big bills up just after the paydays that cover them is what stops a late fee on a month that had the money, just not on the right day. The calendar makes the timing visible before it costs anything.",
    },
    {
      id: "find-leaks", kind: "find", noHint: true,
      targets: ["bii-leak-subscription", "bii-leak-overdraft", "bii-leak-latefee"],
      itemNames: { "bii-leak-subscription": "a subscription nobody uses", "bii-leak-overdraft": "an overdraft fee", "bii-leak-latefee": "a late fee" },
      itemNotes: {
        "bii-leak-subscription": "A subscription that renews every month and nobody uses is money leaving the lean month for nothing. Cancel it where it was started.",
        "bii-leak-overdraft": "An overdraft fee on a small purchase is one of the most expensive ways to borrow. Lining up the bills and keeping a buffer is what stops it.",
        "bii-leak-latefee": "A late fee on a bill that had the money in the account a few days later is a timing problem — exactly what the calendar step fixes.",
      },
      title: "Find the three leaks in the statements",
      cue: "On the example bank statement, find the unused subscription, the overdraft fee and the late fee.",
      why: "Leaks are small, automatic and easy to miss, and on uneven pay they land hardest in the lean month. The CFPB's budgeting guidance is to track spending for exactly this reason. An unused subscription, an overdraft fee and a late fee together can be a real share of a thin month, and all three are fixed by things this budget already does — cancelling, a buffer and bill dates that match paydays.",
    },
    {
      id: "tax-envelope", kind: "select", target: "bii-tax-jar",
      title: "Set the tax share aside as it comes in",
      cue: "Put a share of the side-job pay into its own tax envelope the day it arrives.",
      why: "The simplest way to be ready for the tax on 1099 income is to move a share of every side-job payment into its own place the day it comes in, so it is never mistaken for spending money. How much, and when to pay it, is the IRS's guidance — the page you just read — not this station's; the habit of setting it aside is what makes following that guidance possible.",
    },
    {
      id: "slow-month", kind: "track", target: "bii-month-track", seconds: 7,
      title: "Run the budget through a slow month",
      cue: "Hold the month track in the band: essentials paid, the buffer drawn down only for the gap, nothing new on credit.",
      track: {
        start: 0.16, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.13, label: "SLOW MONTH",
        readout: (v) => (v < 0.4 ? "short — an essential at risk" : v > 0.62 ? "spending like a good month" : "on budget"),
      },
      holdBreakNote: "The month slipped out of band. Back to the order on the sheet: essentials, getting to work, minimums — then see what the buffer has to cover.",
      why: "A budget built for uneven pay proves itself in the slow month, not the good one. Holding the track means the essentials are paid, the buffer is used for the gap it was built for, and nothing new goes on credit. It is also the month when quick-cash offers look most reasonable, which is exactly why the plan decides in advance what the buffer is for.",
    },
    {
      id: "coach-checkin", kind: "select", target: "bii-coach",
      title: "Check in with the coach",
      cue: "Go over the baseline, the buffer and the slow month with the coach, and say how the uneven pay is actually sitting with you.",
      why: "Uneven income is tiring in a way that a steady paycheck is not: every lean month brings the same worry back. The check-in covers the numbers and the worry together, because a plan made in private under stress is easier to abandon. If a lean stretch has turned into a crisis, 988 — or SAMHSA's National Helpline if drinking or using has become part of getting through it — is the right next call.",
    },
    {
      id: "budget-log", kind: "select", target: "bii-budget-log",
      title: "Close out the budget log",
      cue: "Log the lean-month baseline, the buffer balance, the tax envelope, the new bill dates and what the slow month taught you.",
      why: "The log carries the budget from one season to the next: the baseline, what the buffer held and what it paid for, the tax set aside, the bill dates you moved, and what the slow month showed. Next winter starts from this page rather than from scratch, and a coach can see in a minute whether the buffer is growing or being quietly borrowed from.",
    },
  ],

  interrupts: [
    {
      id: "bii-car-repair",
      kind: "Car repair quote",
      after: "estimated-tax", delay: 3, seconds: 12,
      alert: "Your phone buzzes: the mechanic says the truck needs a repair before it is safe to drive — six hundred dollars (example) — and you need it to get to the jobsite on Monday.",
      cue: "Pay it the way the budget was built to — not with the flyer on the fridge.",
      target: "bii-buffer-jar",
      why: "This is what the buffer is for: a real, necessary, one-time cost that would otherwise go to a payday loan. The CFPB describes payday loans as high-cost loans due in full on the next payday, which on uneven income usually means renewing and paying the fee again. Paying the repair from the buffer costs the repair; paying it with a payday loan costs the repair and then some, for months.",
      missNote: "The quote sat unanswered and, in the version where the flyer won, the repair went on a payday loan due in two weeks — on a stretch with no overtime. By the time it is paid off, the fees can cost more than the repair did.",
      wrongNote: "Not that. The repair comes out of the buffer you built for exactly this — not a payday loan, and not a title loan on the truck you need.",
    },
    {
      id: "bii-checkout-offer",
      kind: "Buy-now-pay-later offer",
      after: "slow-month", delay: 3, seconds: 12,
      alert: "At checkout for new work boots, the screen offers: 'Split it into 4 payments — no interest! Approved in seconds.' You already have two of these running.",
      cue: "Check the offer against the budget sheet before you tap.",
      target: "bii-budget-sheet",
      why: "The CFPB has warned that buy-now-pay-later plans are easy to stack, can bring late fees, and can pull payments from your account on a schedule that does not match an uneven paycheck. Boots are a real work need, and the question is whether another automatic payment fits the lean month on the budget sheet. The sheet answers that; the checkout screen is designed not to ask.",
      missNote: "The offer went through with a tap and a third plan joined the other two, each pulling a payment on its own schedule. In the lean month they all land in the same week, and one of them hits an account that is short.",
      wrongNote: "Not that. The answer is the budget sheet — whether another automatic payment fits the lean month — not the checkout screen's 'approved in seconds'.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, BII_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#8c7a62", base2: "#826f58", seam: "rgba(0,0,0,0.16)",
    }), { repeat: 5, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.05, rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.85, metal: 0.02, color: 0xa89a86 });

    // ------------------------------------------------------------ the back wall
    box(g, 5.6, 2.7, 0.1, 0, 1.35, -2.35, 0xe6dccb, { rough: 0.9 });
    box(g, 5.6, 0.1, 0.14, 0, 0.05, -2.28, 0x6a5440, { rough: 0.7 });

    // The year's income chart: twelve bars, example figures.
    const chart = holoPanel(g, 1.8, 0.95, -0.6, 1.6, -2.26, (cx, w, h) => {
      cx.fillStyle = "rgba(14,20,10,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = BII_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e6f2d8"; cx.font = `600 ${Math.round(h * 0.07)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("TWELVE MONTHS OF DEPOSITS — EXAMPLE FIGURES", w * 0.03, h * 0.08);
      const vals = [0.35, 0.3, 0.55, 0.7, 0.75, 0.95, 0.72, 0.4, 0.38, 0.7, 0.6, 0.42];
      const labels = "JFMAMJJASOND";
      vals.forEach((v, i) => {
        const x = w * (0.05 + i * 0.077), bw = w * 0.055, bh = h * 0.7 * v;
        cx.fillStyle = i === 1 ? "#f0b86e" : i === 7 || i === 8 ? "#8fb8e8" : i === 5 ? "#c8a6e0" : "#6f9a4f";
        cx.fillRect(x, h * 0.88 - bh, bw, bh);
        cx.fillStyle = "#e6f2d8"; cx.font = `${Math.round(h * 0.055)}px Arial, sans-serif`;
        cx.fillText(labels[i], x + bw * 0.25, h * 0.94);
      });
    }, { accent: BII_ACCENT });
    // Markers over the lean month (Feb), the dispatch gap (Aug–Sep), the windfall (Jun).
    const barX = (i) => -0.9 + 1.8 * (0.05 + i * 0.077) + 0.05;
    reg(hits, box(chart, 0.14, 0.6, 0.03, barX(1), -0.12, 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "bii-low-month");
    reg(hits, box(chart, 0.28, 0.6, 0.03, (barX(7) + barX(8)) / 2, -0.12, 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "bii-gap-months");
    reg(hits, box(chart, 0.14, 0.6, 0.03, barX(5), -0.12, 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "bii-windfall");
    const chartTicks = [];
    for (const x of [barX(1), (barX(7) + barX(8)) / 2, barX(5)]) {
      const tk = box(chart, 0.04, 0.04, 0.01, x, 0.36, 0.02, CITY.good, { emissive: CITY.good, ei: 1.0, cast: false });
      tk.visible = false;
      chartTicks.push(tk);
    }

    // The bill calendar with its dial, to the right of the chart.
    const cal = group(g, 1.25, 1.55, -2.27);
    slab(cal, 0.66, 0.78, 0.03, 0, -0.39, 0, 0xf6f0e2, { radius: 0.02, rough: 0.8 });
    const calFace = decal(cal, 0.6, 0.4, 0, 0.15, 0.02, paperFace("BILLS vs PAYDAYS", ["Rent due: 1st", "Payday: 5th + 20th", "Phone due: 3rd", "(example dates)"], { bg: "#fbf8ee", band: "#6f9a4f" }), { px: 256 });
    const calDial = group(cal, 0, -0.22, 0.04);
    cyl(calDial, 0.11, 0.11, 0.03, 0, 0, 0, 0x3a4048, { rough: 0.4, metal: 0.5, seg: 20 }).rotation.x = Math.PI / 2;
    box(calDial, 0.02, 0.09, 0.02, 0, 0.05, 0.02, BII_ACCENT, { emissive: BII_ACCENT, ei: 0.6, rough: 0.4 });
    holoTag(cal, "bill calendar", 0, 0.48, 0.02, { css: BII_CSS, w: 0.3 });
    reg(hits, calDial, "bii-bill-calendar");

    // The month track, a strip of four weeks under the calendar... on the side wall.
    const trackStrip = group(g, 2.1, 1.05, -1.9, -0.7);
    slab(trackStrip, 0.62, 0.2, 0.03, 0, -0.1, 0, 0x26301e, { radius: 0.02, rough: 0.6 });
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const wk = box(trackStrip, 0.12, 0.12, 0.02, -0.21 + i * 0.14, 0, 0.02, 0x4a5440, { rough: 0.5, cast: false });
      ownMaterial(wk);
      weeks.push(wk);
    }
    holoTag(trackStrip, "slow month — 4 weeks", 0, 0.17, 0.02, { css: BII_CSS, w: 0.42 });
    reg(hits, trackStrip, "bii-month-track");

    // ---------------------------------------------------------- the table
    const table = group(g, 0, 0, -0.6);
    const top = slab(table, 1.9, 0.05, 1.0, 0, 0.74, 0, BII_WOOD, { radius: 0.04, rough: 0.55 });
    void top;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(table, 0.04, 0.035, 0.72, sx * 0.82, 0.36, sz * 0.42, 0x5a4636, { rough: 0.6, seg: 10 });
    }

    // Bank folder.
    const folder = group(table, -0.68, 0.77, 0.25, 0.15);
    box(folder, 0.34, 0.03, 0.25, 0, 0.015, 0, 0x4a6a3a, { rough: 0.7 });
    const fFace = decal(folder, 0.3, 0.2, 0, 0.032, 0, paperFace("BANK STATEMENTS", ["12 months", "Every deposit"], { bg: "#f2f0e2", band: "#4a6a3a" }), { px: 224 });
    fFace.rotation.x = -Math.PI / 2;
    holoTag(folder, "a year of statements", 0, 0.14, 0, { css: BII_CSS, w: 0.42 });
    reg(hits, folder, "bii-bank-folder");

    // The budget gauge.
    const gauge = instrument(table, -0.2, 0.8, 0.28, { idle: "$----", color: BII_ACCENT, ry: 0.1 });
    holoTag(gauge, "monthly baseline", 0, 0.16, 0, { css: BII_CSS, w: 0.34 });
    reg(hits, gauge, "bii-budget-gauge");

    // The budget sheet, standing on a clipboard easel so its rows can be picked.
    const sheetStand = group(g, -1.35, 0, -1.2, 0.4);
    for (const sx of [-1, 1]) cyl(sheetStand, 0.015, 0.015, 1.3, sx * 0.24, 0.65, 0, 0x5a4636, { rough: 0.6, seg: 8 });
    const sheet = group(sheetStand, 0, 1.22, 0.04);
    slab(sheet, 0.62, 0.72, 0.02, 0, -0.36, 0, 0xfdfaf0, { radius: 0.01, rough: 0.8 });
    decal(sheet, 0.58, 0.68, 0, 0, 0.016, paperFace("BUDGET — LEAN MONTH (EXAMPLE)", [
      "1. Rent · utilities · food",
      "2. Gas · insurance · child care",
      "3. Minimum payments",
      "4. Buffer + tax envelope",
      "Baseline: the lean month",
    ], { bg: "#fdfaf0", band: "#4a6a3a" }), { px: 384 });
    holoTag(sheet, "budget sheet", 0, 0.42, 0.02, { css: BII_CSS, w: 0.3 });
    const srow = (i) => 0.34 - (0.26 + 0.1 * i) * 0.68;
    reg(hits, box(sheet, 0.54, 0.06, 0.03, 0, srow(0), 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "bii-pri-essentials");
    reg(hits, box(sheet, 0.54, 0.06, 0.03, 0, srow(1), 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "bii-pri-work");
    reg(hits, box(sheet, 0.54, 0.06, 0.03, 0, srow(2), 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "bii-pri-minimums");
    reg(hits, box(sheet, 0.54, 0.06, 0.03, 0, srow(3), 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "bii-pri-buffer");
    reg(hits, box(sheet, 0.54, 0.08, 0.03, 0, srow(4), 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "bii-budget-sheet");
    const sheetGlow = box(sheet, 0.64, 0.74, 0.005, 0, 0, -0.012, BII_ACCENT, { emissive: BII_ACCENT, ei: 0.0, rough: 0.5, cast: false });
    ownMaterial(sheetGlow);

    // The overtime surplus (drag) and the buffer jar (socket).
    const surplus = group(table, 0.2, 0.77, 0.3, 0.2);
    for (let i = 0; i < 3; i++) box(surplus, 0.15, 0.012, 0.07, 0, i * 0.013, 0, 0x5f8a4a, { rough: 0.7 });
    holoTag(surplus, "overtime surplus", 0, 0.1, 0, { css: BII_CSS, w: 0.34 });
    reg(hits, surplus, "bii-surplus-cash");
    const jar = group(table, 0.62, 0.77, 0.25);
    cyl(jar, 0.1, 0.09, 0.24, 0, 0.12, 0, 0xdfe9ea, { rough: 0.15, opacity: 0.4, transparent: true, seg: 16 });
    const jarFill = cyl(jar, 0.085, 0.08, 0.06, 0, 0.04, 0, 0x5f8a4a, { rough: 0.7, seg: 14 });
    ownMaterial(jarFill);
    decal(jar, 0.14, 0.05, 0, 0.14, 0.101, signFace("BUFFER", { bg: "#1d2a16", accent: BII_CSS, scale: 0.6 }), { px: 128 });
    holoTag(jar, "slow-month buffer", 0, 0.34, 0, { css: BII_CSS, w: 0.36 });
    reg(hits, jar, "bii-buffer-jar");

    // The tax envelope.
    const taxJar = group(table, 0.75, 0.77, -0.15, -0.2);
    slab(taxJar, 0.22, 0.012, 0.12, 0, 0, 0, 0xe8dcc0, { radius: 0.004, rough: 0.8 });
    const tFace = decal(taxJar, 0.2, 0.1, 0, 0.008, 0, signFace("TAX — 1099 WORK", { bg: "#e8dcc0", accent: "#2f5f8a", fg: "#2a3036", scale: 0.34 }), { px: 192 });
    tFace.rotation.x = -Math.PI / 2;
    holoTag(taxJar, "tax envelope", 0, 0.1, 0, { css: BII_CSS, w: 0.28 });
    reg(hits, taxJar, "bii-tax-jar");

    // The IRS page on a tablet.
    const irs = group(table, 0.1, 0.77, -0.25, -0.1);
    slab(irs, 0.28, 0.012, 0.2, 0, 0, 0, 0x22282d, { radius: 0.01, rough: 0.35, metal: 0.3 });
    const irsFace = decal(irs, 0.24, 0.16, 0, 0.008, 0, paperFace("IRS: SELF-EMPLOYED?", ["1099 income", "Estimated tax may", "be due in the year"], { bg: "#f4f6fa", band: "#2f5f8a" }), { px: 224 });
    irsFace.rotation.x = -Math.PI / 2;
    holoTag(irs, "IRS page — estimated tax", 0, 0.12, 0, { css: BII_CSS, w: 0.46 });
    reg(hits, irs, "bii-irs-page");

    // The example bank statement with the three leaks.
    const stmt = group(table, -0.35, 0.77, -0.2, 0.1);
    slab(stmt, 0.3, 0.006, 0.36, 0, 0, 0, 0xfdfbf4, { radius: 0.004, rough: 0.85 });
    const stFace = decal(stmt, 0.28, 0.34, 0, 0.005, 0, paperFace("CHECKING — EXAMPLE", ["StreamPlus renewal", "Overdraft fee", "Late fee — phone", "Groceries"], { bg: "#fdfbf4", band: "#4a6a3a" }), { px: 224 });
    stFace.rotation.x = -Math.PI / 2;
    holoTag(stmt, "checking statement", 0, 0.1, 0, { css: BII_CSS, w: 0.38 });
    const lrow = (i) => -0.17 + (0.26 + 0.1 * i) * 0.34;
    reg(hits, box(stmt, 0.26, 0.02, 0.03, 0, 0.012, lrow(0), 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "bii-leak-subscription");
    reg(hits, box(stmt, 0.26, 0.02, 0.03, 0, 0.012, lrow(1), 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "bii-leak-overdraft");
    reg(hits, box(stmt, 0.26, 0.02, 0.03, 0, 0.012, lrow(2), 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "bii-leak-latefee");

    // The 'best month' budget sheet (hazard) and the rent-to-own contract.
    const best = group(table, -0.75, 0.77, -0.25, -0.15);
    slab(best, 0.2, 0.004, 0.26, 0, 0, 0, 0xffe9d8, { radius: 0.004, rough: 0.8 });
    const bFace = decal(best, 0.18, 0.24, 0, 0.004, 0, paperFace("BUDGET (JUNE)", ["Based on the", "overtime month"], { bg: "#ffe9d8", band: "#c0392b" }), { px: 160 });
    bFace.rotation.x = -Math.PI / 2;
    holoTag(best, "best-month budget", 0, 0.1, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, best, "bii-best-month");

    const rto = group(table, 0.45, 0.77, -0.3, 0.25);
    slab(rto, 0.2, 0.004, 0.26, 0, 0, 0, 0xfbf7ee, { radius: 0.004, rough: 0.85 });
    const rFace = decal(rto, 0.18, 0.24, 0, 0.004, 0, paperFace("RENT-TO-OWN", ["$29 a week", "Sign here: ____"], { bg: "#fbf7ee", band: "#7a2f2f" }), { px: 160 });
    rFace.rotation.x = -Math.PI / 2;
    holoTag(rto, "rent-to-own — sign?", 0, 0.1, 0, { css: "#f0645b", w: 0.38 });
    reg(hits, rto, "bii-rent-to-own");

    // The budget log.
    const logBook = group(table, 0.78, 0.77, 0.3, -0.1);
    box(logBook, 0.2, 0.02, 0.16, 0, 0.01, 0, 0x4a6a3a, { rough: 0.6 });
    const logFace = decal(logBook, 0.17, 0.13, 0, 0.021, 0, paperFace("BUDGET LOG", ["Baseline: ____", "Buffer: ____", "Tax set aside: ____"], { bg: "#f6f3ea", band: "#4a6a3a" }), { px: 192 });
    logFace.rotation.x = -Math.PI / 2;
    holoTag(logBook, "budget log", 0, 0.12, 0, { css: BII_CSS, w: 0.24 });
    reg(hits, logBook, "bii-budget-log");

    // ------------------------------------------------ the kitchen corner, left
    const fridge = group(g, -2.3, 0, 0.35, Math.PI / 2);
    box(fridge, 0.75, 1.8, 0.7, 0, 0.9, 0, 0xe8eaea, { rough: 0.35, metal: 0.3 });
    box(fridge, 0.03, 0.5, 0.03, 0.3, 1.3, 0.36, 0x9aa0a4, { rough: 0.3, metal: 0.8 });
    box(fridge, 0.72, 0.01, 0.01, 0, 1.0, 0.355, 0xb9bfc2, { rough: 0.4 });
    // The flyers on the fridge: the payday loan and the title loan (hazards).
    const payday = group(fridge, -0.15, 1.45, 0.36);
    slab(payday, 0.26, 0.32, 0.005, 0, -0.16, 0, 0xffe0d4, { radius: 0.005, rough: 0.7 });
    decal(payday, 0.24, 0.3, 0, 0, 0.004, paperFace("CAR TROUBLE?", ["$500 TODAY", "due next payday", "no credit check"], { bg: "#ffe0d4", band: "#c0392b" }), { px: 192 });
    holoTag(payday, "payday loan flyer", 0, 0.21, 0.01, { css: "#f0645b", w: 0.36 });
    reg(hits, payday, "bii-payday-flyer");
    const title = group(fridge, 0.15, 1.05, 0.36);
    slab(title, 0.24, 0.16, 0.005, 0, -0.08, 0, 0xfff0d0, { radius: 0.005, rough: 0.7 });
    decal(title, 0.22, 0.14, 0, 0, 0.004, paperFace("CASH FOR YOUR TITLE", ["Keep driving!"], { bg: "#fff0d0", band: "#b8602f" }), { px: 160 });
    holoTag(title, "title loan", 0, 0.13, 0.01, { css: "#f0645b", w: 0.24 });
    reg(hits, title, "bii-title-loan");

    const counterRun = group(g, -2.3, 0, -1.3, Math.PI / 2);
    box(counterRun, 1.3, 0.88, 0.6, 0, 0.44, 0, 0x6a7a5a, { rough: 0.6 });
    slab(counterRun, 1.34, 0.04, 0.64, 0, 0.9, 0, 0xd8d2c4, { radius: 0.01, rough: 0.4 });
    cyl(counterRun, 0.14, 0.12, 0.16, -0.3, 1.0, 0, 0x8a5a3c, { rough: 0.6, seg: 14 });
    for (let i = 0; i < 3; i++) ball(counterRun, 0.045, -0.35 + i * 0.05, 1.1, (i - 1) * 0.04, [0xc0392b, 0xe0a85a, 0x9ac46a][i], { rough: 0.6, seg: 10, seg2: 8 });
    box(counterRun, 0.3, 0.3, 0.3, 0.35, 1.07, -0.1, 0x2a3036, { rough: 0.4, metal: 0.4 });

    // Chairs.
    for (const [cx, cz, ry] of [[-0.45, 0.35, Math.PI - 0.2], [0.55, 0.35, Math.PI + 0.2], [1.25, -0.6, -Math.PI / 2]]) {
      const chair = group(g, cx, 0, cz, ry);
      slab(chair, 0.42, 0.05, 0.4, 0, 0.45, 0, 0x7a5a3a, { radius: 0.03, rough: 0.7 });
      slab(chair, 0.4, 0.2, 0.05, 0, 0.6, -0.18, 0x7a5a3a, { radius: 0.03, rough: 0.7 });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        cyl(chair, 0.018, 0.018, 0.44, sx * 0.17, 0.22, sz * 0.16, 0x4a3a2a, { rough: 0.6, seg: 8 });
      }
    }

    // A window with blinds on the right wall, and a shelf of jars under it.
    const win = group(g, 2.4, 0, -0.3, -Math.PI / 2);
    box(win, 1.2, 1.0, 0.04, 0, 1.55, 0, 0xbfd8e8, { rough: 0.2, opacity: 0.7, transparent: true });
    for (let i = 0; i < 8; i++) box(win, 1.22, 0.02, 0.05, 0, 1.12 + i * 0.12, 0.03, 0xe8e2d4, { rough: 0.6, cast: false });
    box(win, 1.3, 0.06, 0.14, 0, 1.02, 0.05, 0xd8d0c0, { rough: 0.6 });
    for (let i = 0; i < 4; i++) cyl(win, 0.05, 0.05, 0.12, -0.36 + i * 0.24, 1.11, 0.06, [0xc0392b, 0x9ac46a, 0xe0a85a, 0x8fb8e8][i], { rough: 0.3, opacity: 0.8, transparent: true, seg: 12 });

    // A pendant lamp over the table.
    cyl(g, 0.005, 0.005, 0.8, 0, 2.3, -0.6, 0x2a3036, { rough: 0.5, seg: 6 });
    const shade = cyl(g, 0.08, 0.26, 0.2, 0, 1.85, -0.6, 0x3a4a2a, { rough: 0.5, seg: 18, open: true });
    void shade;
    ball(g, 0.05, 0, 1.8, -0.6, 0xfff2d8, { emissive: 0xfff2d8, ei: 1.2, rough: 0.4, seg: 10, seg2: 8 });

    // ------------------------------------------------------------- the coach
    const coach = standingFigure(g, 1.7, 0.55, { ry: -1.3, cloth: 0x4a6a3a, skin: 0x9a6a48 });
    holoTag(coach, "financial coach", 0, 1.84, 0, { css: BII_CSS, w: 0.36 });
    reg(hits, box(coach, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "bii-coach");

    // The interruptions made visible: a repair quote, a checkout screen.
    const quote = holoPanel(g, 0.56, 0.34, 0.75, 1.5, -0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(40,20,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0a35b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffe6c8"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("REPAIR QUOTE", w / 2, h * 0.32);
      cx.font = `${Math.round(h * 0.13)}px Arial, sans-serif`;
      cx.fillText("$600 — example", w / 2, h * 0.66);
    }, { accent: 0xf0a35b, ry: -0.3 });
    quote.visible = false;
    const checkout = holoPanel(g, 0.5, 0.32, -0.75, 1.5, -0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(10,14,30,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8fb8e8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#dce8f8"; cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("SPLIT INTO 4!", w / 2, h * 0.34);
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      cx.fillText("approved in seconds", w / 2, h * 0.68);
    }, { accent: 0x8fb8e8, ry: 0.3 });
    checkout.visible = false;

    let quoteOn = false, offerOn = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(-0.2, 1.3, -2.0),

      onStepComplete(step) {
        if (step.id === "income-pattern") for (const tk of chartTicks) tk.visible = true;
        if (step.id === "set-baseline") repaint(gauge.userData.screen, signFace("LEAN MONTH", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.46 }));
        if (step.id === "fill-buffer") { surplus.visible = false; jarFill.scale.y = 3; jarFill.position.y = 0.1; }
        if (step.id === "bill-calendar") repaint(calFace, paperFace("BILLS vs PAYDAYS", ["Rent: after the 20th pay", "Phone: moved to the 7th", "Due dates matched", "(example dates)"], { bg: "#fbf8ee", band: "#59c97b" }));
        if (step.id === "tax-envelope") taxJar.position.y = 0.8;
        if (step.id === "slow-month") for (const wk of weeks) wk.material.color.set(CITY.good);
        if (step.id === "coach-checkin") coach.rotation.y = -1.9;
        if (step.id === "budget-log") repaint(logFace, paperFace("BUDGET LOG", ["Baseline: lean month", "Buffer: paid repair", "Tax set aside: yes"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "bii-car-repair") { quoteOn = true; quote.visible = true; }
        if (it.id === "bii-checkout-offer") { offerOn = true; checkout.visible = true; sheetGlow.material.emissiveIntensity = 0.6; }
      },
      onInterruptEnd(it) {
        if (it.id === "bii-car-repair") {
          quoteOn = false;
          quote.visible = false;
          if (it.resolved === "answered") { jarFill.scale.y = 1.6; jarFill.position.y = 0.06; }
        }
        if (it.id === "bii-checkout-offer") {
          offerOn = false;
          checkout.visible = false;
          sheetGlow.material = it.resolved === "answered"
            ? mat(CITY.good, { emissive: CITY.good, ei: 0.35, rough: 0.5 })
            : mat(BII_ACCENT, { emissive: BII_ACCENT, ei: 0.0, rough: 0.5 });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (quoteOn) quote.position.y = 1.5 + Math.sin(t * 5) * 0.02;
        if (offerOn) sheetGlow.material.emissiveIntensity = 0.4 + Math.sin(t * 7) * 0.3;
        if (session?.turn && session.step?.id === "bill-calendar") calDial.rotation.z = -session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "set-baseline") {
          const ok = gg.t >= 0.22 && gg.t <= 0.4;
          repaint(gauge.userData.screen, signFace(`$${Math.round(2200 + gg.t * 2600)}`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.56 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "slow-month") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          const lit = Math.min(4, Math.floor((tr.inBand ?? 0) / 7 * 4));
          weeks.forEach((wk, i) => { wk.material.color.set(i < lit ? CITY.good : ok ? 0x4a5440 : 0x7a3a36); });
        }
      },
    };
  },
};
