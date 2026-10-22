import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Emergency Savings & Predatory Lending VR — Job Readiness
// Edition, financial coaching block.
//
// A credit-union office with a storefront lender across the street, visible
// through the window. The station builds an emergency fund the way the CFPB
// describes — a separate account, an automatic transfer, a goal, the refund
// split into savings the way the IRS allows — and then reads a loan offer the
// way the Truth in Lending Act makes possible: the APR, the finance charge
// and the total in the disclosure box, and the CFPB's own worked example of
// what a payday fee really costs. The car repair arrives in the middle of the
// savings plan on purpose. Every dollar figure here is an example.

const ESP_ACCENT = 0xd88ab8;
const ESP_CSS = "#d88ab8";

export const SIM_EMERGENCY_SAVINGS_AND_PREDATORY_LENDING = {
  id: "emergency-savings-and-predatory-lending",
  index: "255",
  domain: "Financial coaching",
  trade: "Financial coaching — emergency savings and avoiding predatory loans",
  category: "Community Environmental Justice",
  indoor: "clinic",
  weather: "clear",
  certification: "The Consumer Financial Protection Bureau (CFPB) guidance on building an emergency fund, on payday and small-dollar loans — including its worked example that a fifteen-dollar fee per hundred borrowed for two weeks is an APR of almost 400 percent — and on overdraft coverage for debit purchases, which a bank needs your opt-in to provide; the Truth in Lending Act as the CFPB describes it, under which the APR, finance charge and total of payments are disclosed in writing before you sign; the Fair Credit Reporting Act (FCRA) as the CFPB states it, under which a loan sent to collection can stay on a report for years; IRS guidance that a refund can be split by direct deposit into more than one account; SAMHSA's National Helpline and 988 for the stress money emergencies carry",
  name: "Emergency Savings & Predatory Lending",
  title: simTitle("Emergency Savings & Predatory Lending"),
  tagline: "Build the fund that pays for the car repair — automatic, separate, fed by the refund — and read any loan offer by its APR, finance charge and total before signing, past a lender who wants your Social Security number now",
  accent: ESP_ACCENT,
  accentCss: ESP_CSS,
  parSeconds: 290,
  footprint: 2.2,
  supportLine: "a money coach you trust, 988 if an emergency has turned into a crisis, or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if drinking or using has become part of getting through it",
  badge: { id: "fund-before-loan", name: "Fund Before Loan", note: "The repair paid from savings, every loan read by its APR and total, and nothing signed or said on a lender's deadline" },

  game: system({
    name: "Rainy Day",
    currency: "SAVED",
    ranks: ["Paycheck Zero", "First Deposit", "Steady Saver", "Offer Reader", "Rainy Day Certified"],
    badges: [
      { id: "read-the-box", name: "Read The Box", note: "The disclosure box and the contract's red flags both read clean", test: AWARD.all(AWARD.stepClean("loan-disclosure"), AWARD.stepClean("contract-flags")) },
      { id: "no-payday", name: "No Payday", note: "No unsafe action anywhere in the session", test: AWARD.safe },
      { id: "steady-transfer", name: "Steady Transfer", note: "The automatic transfer committed near the middle of the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-save", name: "Clean Save", note: "No corrections anywhere", test: AWARD.clean },
      { id: "kept-saving", name: "Kept Saving", note: "Every timed passage carried without a break", test: AWARD.unbroken },
      { id: "quick-save", name: "Quick Save", note: "Finish inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "esp-payday-sign": "You headed for the storefront across the street: 'CAR REPAIR CASH TODAY'. That is a payday loan, and the CFPB's own worked example is that a fee of fifteen dollars per hundred borrowed for two weeks is an APR of almost 400 percent. When the whole amount is due on the next payday and the paycheck is already spoken for, the loan is renewed and the fee is paid again — which is how a car repair becomes months of fees.",
    "esp-contract-pen": "You picked up the pen on the loan contract's signature line before the contract was read. A signature is agreement to the rollover terms, the automatic bank debits and every fee inside, whether or not anyone explained them. Under the Truth in Lending Act, as the CFPB describes it, the cost is disclosed before you sign precisely so that you can read it first — signing unread throws that protection away.",
    "esp-ssn-message": "That message slip says a lender called to 'pre-approve' you and wants a callback with your Social Security number and online banking login. No legitimate lender needs your banking password, and a Social Security number read to a caller you cannot verify is how accounts get opened and emptied in your name. The CFPB's advice is not to give personal or financial information to anyone you cannot verify.",
    "esp-overdraft-optin": "That form opts you in to overdraft coverage on debit card purchases. The CFPB explains that a bank needs your opt-in before it can charge overdraft fees on ATM withdrawals and one-time debit purchases, and that without it the purchase is usually just declined. Opting in turns a declined coffee into a coffee plus an overdraft fee — the opposite of an emergency fund.",
  },

  lateNotes: {
    "esp-savings-log": "The savings log is written at the end, with the fund's real balance after the repair and the next goal on the dial.",
    "esp-refund-slice": "The refund goes into savings once the separate account exists and the transfer is set — there has to be somewhere for it to land.",
  },

  steps: [
    {
      id: "open-savings", kind: "select", target: "esp-savings-card",
      title: "Open a savings account that is not your checking account",
      cue: "Open the separate savings account at the credit-union desk — the emergency fund needs a place of its own.",
      why: "An emergency fund kept in checking gets spent on things that are not emergencies, a little at a time, without anyone deciding to. The CFPB's guidance on building savings starts with a separate place for the money, so that it is visible, harder to spend by accident, and there when the car will not start. A federally insured account at a credit union or bank keeps it safe while it grows.",
    },
    {
      id: "auto-transfer", kind: "gauge", target: "esp-transfer-gauge",
      title: "Set an automatic transfer you can keep",
      cue: "Commit a transfer on each payday that the budget can carry every time — small and steady beats big and skipped.",
      gauge: {
        label: "PER PAYDAY TO SAVINGS (EXAMPLE)", speed: 0.6, green: [0.25, 0.45],
        readout: (t) => `$${Math.round(10 + t * 190)} each payday — example`,
        missNote: "That transfer will not last. Too small and the fund never reaches a repair; too big and the first tight payday cancels it — and a transfer that gets cancelled once usually stays cancelled.",
      },
      why: "Saving works best when it happens before the money can be spent, which is why the CFPB suggests automatic transfers on payday. The amount matters less than the habit: a transfer the budget can carry every single payday builds a fund, and a larger one that gets cancelled in the second month builds nothing. The figure on this gauge is an example; yours comes from your own budget.",
    },
    {
      id: "savings-plan", kind: "track", target: "esp-savings-track", seconds: 7,
      title: "Keep the savings plan going for twelve weeks",
      cue: "Hold the savings track in the band: every payday transfer made, nothing pulled out for things that are not emergencies.",
      track: {
        start: 0.16, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.13, label: "SAVINGS",
        readout: (v) => (v < 0.4 ? "transfers being skipped" : v > 0.62 ? "saving so hard the bills slip" : "steady — fund growing"),
      },
      holdBreakNote: "The savings plan slipped out of band. One skipped transfer is fine — the fix is the next payday, not giving up on the fund.",
      why: "The first few months of an emergency fund are the hardest, because the balance is small and every week offers a reason to borrow from it. Holding the plan steady — every transfer made, withdrawals only for real emergencies — is the whole skill. The CFPB's guidance frames it the same way: a regular habit and a goal, rather than waiting for a month with money left over, which on most budgets never comes.",
    },
    {
      id: "refund-split", kind: "drag", target: "esp-refund-slice",
      title: "Send part of the tax refund straight to savings",
      cue: "Carry the savings share of the refund into the savings slot on the direct-deposit form.",
      why: "A tax refund is often the largest single deposit of the year, and the IRS lets you split a refund by direct deposit into more than one account. Sending part of it straight to savings, before it reaches checking, is the fastest way to give an emergency fund a real start — and because it happens on the form, it happens before any decision about spending it has to be made.",
      drag: { to: "esp-savings-slot", radius: 0.4, missNote: "Not in the savings slot. Money that lands in checking is money that gets spent — carry the share all the way to savings." },
    },
    {
      id: "loan-disclosure", kind: "find", noHint: true,
      targets: ["esp-apr-box", "esp-finance-box", "esp-total-box"],
      itemNames: { "esp-apr-box": "the APR", "esp-finance-box": "the finance charge", "esp-total-box": "the total of payments" },
      itemNotes: {
        "esp-apr-box": "The annual percentage rate puts the cost of any loan on the same yearly scale, so a two-week loan and a one-year loan can be compared.",
        "esp-finance-box": "The finance charge is the cost of the loan in dollars — every fee and all the interest together.",
        "esp-total-box": "The total of payments is what you will have paid when it is over. Hold it against the amount you are borrowing.",
      },
      title: "Read the disclosure box on the example loan offer",
      cue: "Find the APR, the finance charge and the total of payments in the box.",
      why: "Under the Truth in Lending Act, as the CFPB describes it, a lender has to show the cost of credit in writing before you sign: the APR, the finance charge in dollars and the total you will pay. Those three numbers are what let a payday loan, a credit-union loan and a card be compared honestly, and a lender that will not show them before asking for a signature is telling you something.",
    },
    {
      id: "cfpb-example", kind: "select", target: "esp-apr-calculator",
      title: "Work the CFPB's own payday example",
      cue: "On the calculator, run the CFPB's worked example: fifteen dollars per hundred for two weeks.",
      why: "The CFPB publishes a worked example of what a payday fee really costs: fifteen dollars per hundred borrowed for two weeks is an APR of almost 400 percent. Running it yourself makes the point in a way no warning does — the fee looks small because it is quoted for two weeks, and the APR is what it costs when the loan is renewed, which is what usually happens when the whole amount is due on one payday.",
    },
    {
      id: "read-contract", kind: "hold", target: "esp-loan-contract", seconds: 6,
      title: "Read the whole loan contract before anything is signed",
      cue: "Hold the contract open and read every page: renewals, bank debits, fees, what happens if a payment is missed.",
      why: "The disclosure box gives the headline; the contract gives the terms that decide what happens in a bad month: whether the loan renews automatically, whether the lender can pull money from your bank account, what each late or returned payment costs. Reading all of it before signing is the only point at which you can still say no, and it is the point every high-cost lender would rather you hurried through.",
      holdBreakNote: "You put the contract down before the page on renewals. That page is where a two-week loan becomes a four-month one — read it through.",
    },
    {
      id: "contract-flags", kind: "find", noHint: true,
      targets: ["esp-flag-rollover", "esp-flag-debit", "esp-flag-nocheck"],
      itemNames: { "esp-flag-rollover": "automatic renewal", "esp-flag-debit": "authority to debit your bank account", "esp-flag-nocheck": "no look at whether you can repay" },
      itemNotes: {
        "esp-flag-rollover": "Automatic renewal — the CFPB calls it rolling over — means paying the fee again to push the due date back, without reducing what you owe.",
        "esp-flag-debit": "Authority to pull payments from your bank account means repeated attempts when the account is short, and an overdraft or returned-payment fee each time.",
        "esp-flag-nocheck": "'No credit check' also means nobody asked whether you can repay it on this paycheck — which is the question that decides whether it renews.",
      },
      title: "Find the three red flags in the contract",
      cue: "Find the automatic renewal, the bank-debit authorisation and the missing check on whether you can repay.",
      why: "The CFPB's warnings about payday and similar loans come down to these three terms: renewals that pay the fee again without paying down the loan, authority to pull money from your bank account that can trigger fees each time it fails, and lending with no look at whether the payment fits your income. A loan that goes to collection can then stay on your report for years under the Fair Credit Reporting Act (FCRA), as the CFPB states it.",
    },
    {
      id: "emergency-order", kind: "sequence",
      targets: ["esp-ord-fund", "esp-ord-biller", "esp-ord-cu-loan"],
      itemNames: { "esp-ord-fund": "the emergency fund", "esp-ord-biller": "a payment plan with the biller", "esp-ord-cu-loan": "a small-dollar loan, compared by APR" },
      outOfOrderNote: "Out of order. The fund comes first, because it costs nothing; then ask the biller or the shop about a payment plan; and only then a small-dollar loan from a credit union or bank, compared by its APR.",
      title: "Write down the order for the next emergency",
      cue: "On the emergency card: the fund first, then a payment plan with the biller, then a compared small-dollar loan.",
      why: "Deciding the order before the emergency is what keeps the storefront across the street from being the first idea. The fund costs nothing to use; a payment plan with the biller or the repair shop often costs little; and a small-dollar loan from a credit union or bank, compared by its APR in the disclosure box, is the fallback. The CFPB describes these alternatives for the same reason: in the moment, the fastest option looks like the only one.",
    },
    {
      id: "savings-goal", kind: "turn", target: "esp-goal-dial",
      title: "Set the next savings goal",
      cue: "Turn the goal dial from the first milestone to the next — the example fund's first repair covered, then a month of essentials.",
      turn: { turns: 1.0, axis: "y", label: "SAVINGS GOAL" },
      why: "A goal turns a savings habit into something with an end, and the CFPB's guidance suggests setting one you can reach and then raising it. A first milestone that covers one ordinary repair is reachable in months on a small transfer; the next — a month of essentials — is what carries a household through a gap between jobs. The numbers on the dial are examples; the point is to always have a next one.",
    },
    {
      id: "coach-checkin", kind: "select", target: "esp-coach",
      title: "Check in with the coach",
      cue: "Go over the fund, the repair and the loan you did not take with the coach, and say how the emergency landed on you.",
      why: "A money emergency is stressful even when it goes right, and the check-in covers both the plan and the person. Saying out loud that the car scared you is part of making the next plan better, not a detour from it. If an emergency has turned into a crisis, 988 — or SAMHSA's National Helpline if drinking or using has become part of getting through it — is the right call to make next.",
    },
    {
      id: "savings-log", kind: "select", target: "esp-savings-log",
      title: "Close out the savings log",
      cue: "Log the account, the transfer, the refund share, what the fund paid for, the loan you read and declined, and the next goal.",
      why: "The log is the fund's history on one page: when it started, what goes in each payday, what the refund added, what it paid for and what the next goal is. Written down, the fund stops being an abstract idea and becomes a record of a car repair paid without a loan — which is the most persuasive thing there is the next time a storefront offers cash today.",
    },
  ],

  interrupts: [
    {
      id: "esp-car-wont-start",
      kind: "Car won't start",
      after: "savings-plan", delay: 3, seconds: 12,
      alert: "Your phone buzzes: the car will not start, the shop says a new starter is four hundred and eighty dollars (example), and the payday lender across the street has a sign in the window.",
      cue: "Pay it the way you are building the fund to — not across the street.",
      target: "esp-emergency-fund",
      why: "This is exactly what an emergency fund is for: a real, necessary, one-time cost. Paid from savings, the repair costs the repair. Paid with a payday loan, it costs the repair plus a fee the CFPB's own example puts at an APR of almost 400 percent, repeated every time the loan renews. Even a fund that covers only part of it means borrowing less, for less time.",
      missNote: "The call went unanswered while the plan ran, and in the version where the sign won, the starter went on a payday loan due in two weeks. The fund you were building stopped growing while the fee was paid again and again.",
      wrongNote: "Not that. The repair comes out of the emergency fund you are building for exactly this — not the storefront across the street.",
    },
    {
      id: "esp-sign-now-call",
      kind: "Lender pushing to sign now",
      after: "read-contract", delay: 3, seconds: 12,
      alert: "The lender's rep calls: the offer 'expires in ten minutes', you can sign by phone if you read out your Social Security number and your online banking login.",
      cue: "Do not read anything out. Walk the comparison over to the credit-union desk.",
      target: "esp-cu-desk",
      why: "A deadline measured in minutes and a request for your banking login are both signs of a lender, or a scammer, who does not want you to compare. The CFPB describes small-dollar loans from credit unions and banks as alternatives to payday loans, and the Truth in Lending disclosure is what lets you compare them. The credit-union desk is where that comparison happens — no legitimate lender needs your password.",
      missNote: "The call ran on while you read, and in the version where you answered it, a stranger has your Social Security number and your banking login. The loan was never the point, and the account the fund lives in is the first thing they empty.",
      wrongNote: "Not that. The answer is to take the comparison to the credit-union desk — nothing read out, nothing signed on somebody else's ten-minute clock.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, ESP_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#7a7480", base2: "#716b77", seam: "rgba(0,0,0,0.12)",
    }), { repeat: 6, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.06, rough: 0.9, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.02, color: 0x9a94a0 });

    // ----------------------------------------------- back wall with the window
    box(g, 1.6, 2.7, 0.1, -2.0, 1.35, -2.35, 0xe4dce4, { rough: 0.9 });
    box(g, 1.6, 2.7, 0.1, 2.0, 1.35, -2.35, 0xe4dce4, { rough: 0.9 });
    box(g, 2.4, 0.7, 0.1, 0, 0.35, -2.35, 0xe4dce4, { rough: 0.9 });
    box(g, 2.4, 0.5, 0.1, 0, 2.45, -2.35, 0xe4dce4, { rough: 0.9 });
    const glass = box(g, 2.4, 1.5, 0.03, 0, 1.45, -2.34, 0xbfd8e8, { rough: 0.1, opacity: 0.35, transparent: true });
    void glass;
    for (const x of [-1.2, 0, 1.2]) box(g, 0.05, 1.5, 0.08, x, 1.45, -2.33, 0x5a5460, { rough: 0.5, metal: 0.4 });
    // The storefront across the street, seen through the glass.
    const store = group(g, 0.4, 0, -4.2);
    box(store, 3.2, 3.0, 0.4, 0, 1.5, 0, 0x6a5a4a, { rough: 0.8 });
    box(store, 2.6, 1.3, 0.05, 0, 1.2, 0.22, 0x2a3036, { rough: 0.2, metal: 0.3 });
    const sign = group(store, 0, 2.3, 0.24);
    box(sign, 2.2, 0.5, 0.06, 0, 0, 0, 0x2a0f12, { rough: 0.5 });
    decal(sign, 2.1, 0.44, 0, 0, 0.035, signFace("CAR REPAIR CASH TODAY", { bg: "#2a0f12", accent: "#f0645b", fg: "#ffd8a8", scale: 0.4 }), { px: 512, glow: true, ei: 0.9 });
    reg(hits, sign, "esp-payday-sign");
    holoTag(g, "payday lender — across the street", 0.4, 2.2, -2.2, { css: "#f0645b", w: 0.6 });

    // ------------------------------------------------ the credit-union counter
    const counterG = group(g, 0, 0, -1.1);
    box(counterG, 2.6, 0.95, 0.5, 0, 0.475, 0, 0x5a4a6a, { rough: 0.6, finish: "painted", tile: 2 });
    slab(counterG, 2.7, 0.05, 0.62, 0, 0.98, 0.04, 0xe8e2ea, { radius: 0.015, rough: 0.4 });
    decal(counterG, 1.2, 0.14, 0, 0.72, 0.26, signFace("CREDIT UNION — MEMBER DESK", { bg: "#2a2236", accent: ESP_CSS, scale: 0.55 }), { px: 384 });

    // The savings account card.
    const savings = group(counterG, -1.0, 1.01, 0.1, 0.1);
    slab(savings, 0.22, 0.006, 0.14, 0, 0, 0, 0xf6eef6, { radius: 0.008, rough: 0.6 });
    const svFace = decal(savings, 0.2, 0.12, 0, 0.005, 0, paperFace("SAVINGS — OPEN", ["Separate account", "Federally insured"], { bg: "#f6eef6", band: "#8a4a7a" }), { px: 192 });
    svFace.rotation.x = -Math.PI / 2;
    holoTag(savings, "savings account", 0, 0.1, 0, { css: ESP_CSS, w: 0.32 });
    reg(hits, savings, "esp-savings-card");

    // The transfer gauge.
    const tGauge = instrument(counterG, -0.55, 1.03, 0.12, { idle: "$--", color: ESP_ACCENT, ry: 0.1 });
    holoTag(tGauge, "per-payday transfer", 0, 0.16, 0, { css: ESP_CSS, w: 0.38 });
    reg(hits, tGauge, "esp-transfer-gauge");

    // The refund direct-deposit form, with its savings slot (drag socket).
    const form = group(counterG, 0.0, 1.01, 0.12, -0.05);
    slab(form, 0.34, 0.006, 0.24, 0, 0, 0, 0xfbfbf6, { radius: 0.004, rough: 0.85 });
    const formFace = decal(form, 0.32, 0.22, 0, 0.005, 0, paperFace("REFUND — DIRECT DEPOSIT", ["Checking: ____", "Savings: ____", "(split, per IRS)"], { bg: "#fbfbf6", band: "#2f5f8a" }), { px: 256 });
    formFace.rotation.x = -Math.PI / 2;
    holoTag(form, "refund deposit form", 0, 0.12, 0, { css: ESP_CSS, w: 0.4 });
    const slotMark = box(form, 0.3, 0.04, 0.06, 0, 0.02, 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, slotMark, "esp-savings-slot");
    const slice = group(counterG, 0.35, 1.01, 0.2, 0.2);
    for (let i = 0; i < 2; i++) box(slice, 0.14, 0.012, 0.07, 0, i * 0.013, 0, 0x5f8a4a, { rough: 0.7 });
    holoTag(slice, "savings share of refund", 0, 0.1, 0, { css: ESP_CSS, w: 0.44 });
    reg(hits, slice, "esp-refund-slice");

    // The emergency fund passbook (first interruption's answer).
    const fund = group(counterG, 0.75, 1.01, 0.05, -0.1);
    box(fund, 0.16, 0.02, 0.22, 0, 0.01, 0, 0x8a4a7a, { rough: 0.6 });
    const fundFace = decal(fund, 0.13, 0.18, 0, 0.021, 0, paperFace("EMERGENCY FUND", ["Balance: building", "(example)"], { bg: "#f6eef6", band: "#8a4a7a" }), { px: 160 });
    fundFace.rotation.x = -Math.PI / 2;
    holoTag(fund, "emergency fund", 0, 0.12, 0, { css: ESP_CSS, w: 0.32 });
    reg(hits, fund, "esp-emergency-fund");

    // The overdraft opt-in form (hazard).
    const od = group(counterG, 1.1, 1.01, 0.18, 0.2);
    slab(od, 0.18, 0.004, 0.24, 0, 0, 0, 0xffe9d8, { radius: 0.004, rough: 0.8 });
    const odFace = decal(od, 0.16, 0.22, 0, 0.004, 0, paperFace("OVERDRAFT", ["'Coverage' on debit", "Opt in: ____"], { bg: "#ffe9d8", band: "#c0392b" }), { px: 160 });
    odFace.rotation.x = -Math.PI / 2;
    holoTag(od, "opt in to overdraft?", 0, 0.1, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, od, "esp-overdraft-optin");

    // The member-service desk sign-in (second interruption's answer).
    const cuDesk = group(counterG, -0.1, 1.01, -0.18);
    box(cuDesk, 0.4, 0.26, 0.04, 0, 0.13, 0, 0x2a2236, { rough: 0.5 });
    const cuFace = decal(cuDesk, 0.36, 0.2, 0, 0.14, 0.025, paperFace("SMALL-DOLLAR LOANS", ["Ask here first", "APR in writing", "Compare before signing"], { bg: "#f6eef6", band: "#8a4a7a" }), { px: 224 });
    void cuFace;
    holoTag(cuDesk, "credit-union loan desk", 0, 0.36, 0, { css: ESP_CSS, w: 0.44 });
    reg(hits, cuDesk, "esp-cu-desk");
    const cuLamp = ball(cuDesk, 0.03, 0.22, 0.28, 0, 0x4a4450, { rough: 0.4, seg: 12, seg2: 10 });
    ownMaterial(cuLamp);

    // ---------------------------------------------------- the offer table
    const table = group(g, 0, 0, 0.35);
    slab(table, 1.5, 0.05, 0.7, 0, 0.74, 0, 0xc9c0b0, { radius: 0.03, rough: 0.55 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(table, 0.03, 0.03, 0.72, sx * 0.66, 0.36, sz * 0.28, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    }

    // The loan offer with the disclosure box, on a stand so the boxes can be read.
    const offerStand = group(g, -1.2, 0, 0.05, 0.9);
    for (const sx of [-1, 1]) cyl(offerStand, 0.015, 0.015, 1.3, sx * 0.25, 0.65, 0, 0x4a4450, { rough: 0.6, seg: 8 });
    const offer = group(offerStand, 0, 1.22, 0.04);
    slab(offer, 0.66, 0.6, 0.02, 0, -0.3, 0, 0xfdfbf6, { radius: 0.01, rough: 0.8 });
    offer.rotation.x = -0.1;
    decal(offer, 0.62, 0.12, 0, 0.22, 0.016, signFace("LOAN OFFER — EXAMPLE", { bg: "#2a2236", accent: ESP_CSS, scale: 0.5 }), { px: 320 });
    const BOX = [["esp-apr-box", -0.21, "APR", "391%"], ["esp-finance-box", 0, "FINANCE CHARGE", "$75"], ["esp-total-box", 0.21, "TOTAL OF PAYMENTS", "$575"]];
    for (const [id, x, label, val] of BOX) {
      const b = group(offer, x, -0.02, 0.016);
      box(b, 0.19, 0.3, 0.006, 0, 0, 0, 0xffffff, { rough: 0.8 });
      decal(b, 0.18, 0.28, 0, 0, 0.005, paperFace(label, [val, "example"], { bg: "#ffffff", band: "#2a2236" }), { px: 160 });
      reg(hits, b, id);
    }
    holoTag(offer, "disclosure box", 0, 0.36, 0.02, { css: ESP_CSS, w: 0.3 });

    // The calculator (CFPB example).
    const calc = group(table, -0.45, 0.77, 0.05, 0.2);
    slab(calc, 0.14, 0.02, 0.2, 0, 0.01, 0, 0x2a3036, { radius: 0.01, rough: 0.5 });
    const calcFace = decal(calc, 0.11, 0.05, 0, 0.022, -0.06, signFace("$15 / $100", { bg: "#0f1a14", accent: ESP_CSS, fg: "#bfeac8", scale: 0.44 }), { px: 160, glow: true, ei: 0.7 });
    calcFace.rotation.x = -Math.PI / 2;
    for (let i = 0; i < 9; i++) box(calc, 0.025, 0.008, 0.025, -0.035 + (i % 3) * 0.035, 0.024, 0.0 + Math.floor(i / 3) * 0.035, 0x59616a, { rough: 0.6, cast: false });
    holoTag(calc, "CFPB example", 0, 0.12, 0, { css: ESP_CSS, w: 0.28 });
    reg(hits, calc, "esp-apr-calculator");

    // The contract, its three flags, and the pen on its signature line.
    const contract = group(table, 0.1, 0.77, 0.05, -0.1);
    slab(contract, 0.34, 0.006, 0.44, 0, 0, 0, 0xfbf7ee, { radius: 0.004, rough: 0.85 });
    const conFace = decal(contract, 0.32, 0.42, 0, 0.005, 0, paperFace("LOAN AGREEMENT", [
      "Renews automatically",
      "We may debit your bank",
      "No credit check needed",
      "Sign: ____________",
    ], { bg: "#fbf7ee", band: "#7a2f2f" }), { px: 256 });
    conFace.rotation.x = -Math.PI / 2;
    holoTag(contract, "loan contract", 0, 0.12, 0, { css: ESP_CSS, w: 0.3 });
    reg(hits, contract, "esp-loan-contract");
    const cz = (i) => -0.21 + (0.26 + 0.1 * i) * 0.42;
    reg(hits, box(contract, 0.3, 0.02, 0.035, 0, 0.012, cz(0), 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "esp-flag-rollover");
    reg(hits, box(contract, 0.3, 0.02, 0.035, 0, 0.012, cz(1), 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "esp-flag-debit");
    reg(hits, box(contract, 0.3, 0.02, 0.035, 0, 0.012, cz(2), 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "esp-flag-nocheck");
    const pen = group(contract, 0.05, 0.014, cz(3));
    cyl(pen, 0.006, 0.006, 0.14, 0, 0, 0, 0x1d2a44, { rough: 0.4, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(pen, "sign it now?", 0, 0.07, 0, { css: "#f0645b", w: 0.26 });
    reg(hits, pen, "esp-contract-pen");

    // The emergency-order card.
    const order = holoPanel(g, 0.66, 0.48, 1.3, 1.45, -0.05, (cx, w, h) => {
      cx.fillStyle = "rgba(26,14,24,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = ESP_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f6dcec"; cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("NEXT EMERGENCY — IN THIS ORDER", w * 0.05, h * 0.12);
      cx.fillStyle = "#fff2fa"; cx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      ["1. The emergency fund", "2. Payment plan with the biller", "3. Small-dollar loan, APR compared"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.22)));
    }, { ry: -0.7, accent: ESP_ACCENT });
    for (const [id, y] of [["esp-ord-fund", 0.07], ["esp-ord-biller", -0.04], ["esp-ord-cu-loan", -0.15]]) {
      reg(hits, box(order, 0.58, 0.08, 0.02, 0, y, 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), id);
    }
    const orderTicks = [];
    for (const y of [0.07, -0.04, -0.15]) {
      const tk = box(order, 0.03, 0.03, 0.01, 0.29, y, 0.02, CITY.good, { emissive: CITY.good, ei: 1.0, cast: false });
      tk.visible = false;
      orderTicks.push(tk);
    }

    // The savings track and the goal dial on the right wall.
    const trackG = group(g, 2.0, 1.95, -2.28);
    slab(trackG, 0.9, 0.24, 0.03, 0, -0.12, 0, 0x2a2236, { radius: 0.02, rough: 0.6 });
    const weeks = [];
    for (let i = 0; i < 12; i++) {
      const wk = box(trackG, 0.055, 0.14, 0.02, -0.39 + i * 0.071, -0.01, 0.02, 0x4a4450, { rough: 0.5, cast: false });
      ownMaterial(wk);
      weeks.push(wk);
    }
    holoTag(trackG, "12-week savings track", 0, 0.19, 0.02, { css: ESP_CSS, w: 0.44 });
    reg(hits, trackG, "esp-savings-track");
    const goal = group(g, 2.0, 1.3, -2.28);
    slab(goal, 0.6, 0.66, 0.03, 0, -0.33, 0, 0xf6eef6, { radius: 0.02, rough: 0.8 });
    const goalFace = decal(goal, 0.54, 0.22, 0, 0.18, 0.02, paperFace("SAVINGS GOAL", ["First: one repair (ex.)", "Next: ______"], { bg: "#fbf6fa", band: "#8a4a7a" }), { px: 224 });
    const goalDial = group(goal, 0, -0.12, 0.04);
    cyl(goalDial, 0.11, 0.11, 0.03, 0, 0, 0, 0x3a4048, { rough: 0.4, metal: 0.5, seg: 20 }).rotation.x = Math.PI / 2;
    box(goalDial, 0.02, 0.09, 0.02, 0, 0.05, 0.02, ESP_ACCENT, { emissive: ESP_ACCENT, ei: 0.6, rough: 0.4 });
    reg(hits, goalDial, "esp-goal-dial");

    // The phone and the lender's message slip (hazard), left wall.
    const phoneWall = group(g, -2.4, 0, -0.4, Math.PI / 2);
    box(phoneWall, 0.9, 0.9, 0.4, 0, 0.45, 0.1, 0x5a4a6a, { rough: 0.6 });
    slab(phoneWall, 0.94, 0.04, 0.44, 0, 0.92, 0.1, 0xe8e2ea, { radius: 0.01, rough: 0.4 });
    const phone = group(phoneWall, -0.2, 0.94, 0.1);
    box(phone, 0.18, 0.05, 0.2, 0, 0.025, 0, 0x2b3036, { rough: 0.5 });
    const handset = box(phone, 0.05, 0.04, 0.2, -0.05, 0.07, 0, 0x22262b, { rough: 0.5 });
    ownMaterial(handset);
    const slip = group(phoneWall, 0.2, 0.945, 0.12, 0.2);
    slab(slip, 0.16, 0.004, 0.12, 0, 0, 0, 0xf7e36b, { radius: 0.004, rough: 0.8 });
    const slipFace = decal(slip, 0.15, 0.11, 0, 0.004, 0, paperFace("LENDER CALLED", ["call back w/ SSN", "+ bank login"], { bg: "#f7e36b", band: "#c0392b" }), { px: 160 });
    slipFace.rotation.x = -Math.PI / 2;
    holoTag(slip, "lender callback slip", 0, 0.1, 0, { css: "#f0645b", w: 0.38 });
    reg(hits, slip, "esp-ssn-message");

    // The savings log, on the side cabinet.
    const logBook = group(phoneWall, 0.25, 0.94, -0.02, -0.2);
    box(logBook, 0.22, 0.02, 0.16, 0, 0.01, 0, 0x8a4a7a, { rough: 0.6 });
    const logFace = decal(logBook, 0.19, 0.13, 0, 0.021, 0, paperFace("SAVINGS LOG", ["Transfer: ____", "Paid for: ____", "Next goal: ____"], { bg: "#f6f3ea", band: "#8a4a7a" }), { px: 192 });
    logFace.rotation.x = -Math.PI / 2;
    holoTag(logBook, "savings log", 0, 0.12, 0, { css: ESP_CSS, w: 0.26 });
    reg(hits, logBook, "esp-savings-log");

    // Chairs and a plant.
    for (const [cx, cz, ry] of [[-0.45, 1.0, Math.PI - 0.2], [0.5, 1.0, Math.PI + 0.2]]) {
      const chair = group(g, cx, 0, cz, ry);
      slab(chair, 0.42, 0.05, 0.4, 0, 0.45, 0, 0x5a4a6a, { radius: 0.03, rough: 0.6 });
      slab(chair, 0.4, 0.2, 0.05, 0, 0.6, -0.18, 0x5a4a6a, { radius: 0.03, rough: 0.6 });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        cyl(chair, 0.015, 0.015, 0.44, sx * 0.17, 0.22, sz * 0.16, CITY.darkSteel, { rough: 0.4, metal: 0.65, seg: 8 });
      }
    }
    const pot = group(g, 2.3, 0, 1.2);
    cyl(pot, 0.16, 0.12, 0.3, 0, 0.15, 0, 0x6a4a5a, { rough: 0.8, seg: 14 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ball(pot, 0.12, Math.sin(a) * 0.08, 0.45 + (i % 2) * 0.12, Math.cos(a) * 0.08, 0x3f7a45, { rough: 0.8, seg: 10, seg2: 8 });
    }
    for (const sx of [-1, 1]) {
      box(g, 1.1, 0.05, 0.34, sx * 1.1, 2.62, -0.2, 0xe8edf0, { rough: 0.4, cast: false });
      box(g, 1.0, 0.02, 0.26, sx * 1.1, 2.59, -0.2, 0xfff6ee, { emissive: 0xfff6ee, ei: 0.5, rough: 0.4, cast: false });
    }

    // ------------------------------------------------------------- the coach
    const coach = standingFigure(g, 1.75, 0.9, { ry: -1.8, cloth: 0x8a4a7a, skin: 0x5a3a28 });
    holoTag(coach, "financial coach", 0, 1.84, 0, { css: ESP_CSS, w: 0.36 });
    reg(hits, box(coach, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "esp-coach");

    // The interruptions made visible: the repair quote, and the rep's call.
    const quote = holoPanel(g, 0.56, 0.34, 0.0, 1.62, -0.6, (cx, w, h) => {
      cx.fillStyle = "rgba(40,20,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0a35b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffe6c8"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("STARTER — $480", w / 2, h * 0.34);
      cx.font = `${Math.round(h * 0.13)}px Arial, sans-serif`;
      cx.fillText("example quote", w / 2, h * 0.68);
    }, { accent: 0xf0a35b });
    quote.visible = false;
    const repCall = holoPanel(g, 0.5, 0.3, -1.9, 1.6, -0.4, (cx, w, h) => {
      cx.fillStyle = "rgba(40,8,10,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0645b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffd8d4"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("\"10 MINUTES LEFT\"", w / 2, h * 0.34);
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      cx.fillText("SSN + bank login?", w / 2, h * 0.68);
    }, { accent: CITY.alert, ry: 0.9 });
    repCall.visible = false;

    let ringing = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.3, -2.0),

      onStepComplete(step) {
        if (step.id === "auto-transfer") repaint(tGauge.userData.screen, signFace("SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.55 }));
        if (step.id === "savings-plan") for (const wk of weeks) wk.material.color.set(CITY.good);
        if (step.id === "refund-split") slice.position.set(0.0, 0.02, 0.12);
        if (step.id === "contract-flags") repaint(conFace, paperFace("LOAN AGREEMENT", ["X renews automatically", "X debits your bank", "X no ability-to-repay", "NOT SIGNED"], { bg: "#fbf7ee", band: "#c0392b" }));
        if (step.id === "emergency-order") for (const tk of orderTicks) tk.visible = true;
        if (step.id === "savings-goal") repaint(goalFace, paperFace("SAVINGS GOAL", ["First: one repair (ex.)", "Next: a month of essentials"], { bg: "#fbf6fa", band: "#59c97b" }));
        if (step.id === "coach-checkin") coach.rotation.y = -2.4;
        if (step.id === "savings-log") repaint(logFace, paperFace("SAVINGS LOG", ["Transfer: each payday", "Paid for: starter", "Next goal: 1 month"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "esp-car-wont-start") quote.visible = true;
        if (it.id === "esp-sign-now-call") {
          ringing = true;
          repCall.visible = true;
          handset.position.y = 0.16;
          handset.material.emissive.set(CITY.alert);
          handset.material.emissiveIntensity = 0.9;
          cuLamp.material.emissive.set(ESP_ACCENT);
          cuLamp.material.emissiveIntensity = 0.6;
        }
      },
      onInterruptEnd(it) {
        if (it.id === "esp-car-wont-start") {
          quote.visible = false;
          if (it.resolved === "answered") repaint(fundFace, paperFace("EMERGENCY FUND", ["Paid: starter", "Balance: rebuilding"], { bg: "#f6eef6", band: "#59c97b" }));
        }
        if (it.id === "esp-sign-now-call") {
          ringing = false;
          repCall.visible = false;
          handset.position.y = 0.07;
          handset.material.emissiveIntensity = 0;
          cuLamp.material = it.resolved === "answered"
            ? mat(CITY.good, { emissive: CITY.good, ei: 0.9, rough: 0.4 })
            : mat(0x4a4450, { rough: 0.4 });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (ringing) cuLamp.material.emissiveIntensity = 0.5 + Math.sin(t * 9) * 0.4;
        if (session?.turn && session.step?.id === "savings-goal") goalDial.rotation.z = -session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "auto-transfer") {
          const ok = gg.t >= 0.25 && gg.t <= 0.45;
          repaint(tGauge.userData.screen, signFace(`$${Math.round(10 + gg.t * 190)}`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "savings-plan") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          const lit = Math.min(12, Math.floor((tr.inBand ?? 0) / 7 * 12));
          weeks.forEach((wk, i) => { wk.material.color.set(i < lit ? CITY.good : ok ? 0x4a4450 : 0x7a3a36); });
        }
      },
    };
  },
};
