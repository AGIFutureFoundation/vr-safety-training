import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Debt Reduction Plan VR — Job Readiness Edition, financial
// coaching block.
//
// A coaching table covered in statements, turned into a plan: every debt
// listed with its rate and its minimum, the monthly amount that can honestly
// go to them, the debts sorted by rate on a rail, the plan written in the
// order it runs, and the months it takes set on a dial. Around it, the things
// that wreck a plan: a collector who threatens and wants gift cards, a debt
// settlement contract with a signature line and a fee up front, a
// consolidation text that wants a Social Security number. The CFPB's own
// guidance is the authority for all of it; the Truth in Lending Act is named
// the way the CFPB describes it. Every balance and rate here is an example.

const DRP_ACCENT = 0xe0a85a;
const DRP_CSS = "#e0a85a";
const DRP_WOOD = 0x7d6248;

export const SIM_DEBT_REDUCTION_PLAN = {
  id: "debt-reduction-plan",
  index: "252",
  domain: "Financial coaching",
  trade: "Financial coaching — building a debt reduction plan",
  category: "Community Environmental Justice",
  indoor: "clinic",
  weather: "clear",
  certification: "The Consumer Financial Protection Bureau (CFPB) guidance on debt collection — asking a collector for validation information in writing, disputing a debt, and what a collector may not threaten — and its budgeting and debt tools; the Truth in Lending Act as the CFPB describes it, including the APR and the minimum-payment warning printed on every card statement; the Fair Credit Reporting Act (FCRA) as the CFPB states it, under which accurate negative information can stay on a report for years; IRS guidance that a canceled or forgiven debt may count as income and is reported on Form 1099-C; SAMHSA's National Helpline and 988 for the stress debt carries",
  name: "Debt Reduction Plan",
  title: simTitle("Debt Reduction Plan"),
  tagline: "Every debt on the table with its rate and minimum, sorted highest rate first, a monthly amount you can keep, and a plan with a finish date — past a threatening collector, a settlement contract and a consolidation text",
  accent: DRP_ACCENT,
  accentCss: DRP_CSS,
  parSeconds: 290,
  footprint: 2.2,
  supportLine: "a money coach you trust, 988 if the debt worry has turned into a crisis, or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if drinking or using has become part of how you are coping with it",
  badge: { id: "plan-with-a-date", name: "Plan With A Date", note: "Every debt listed, sorted by rate, and a plan with a finish date that nobody talked you out of" },

  game: system({
    name: "Payoff Ledger",
    currency: "PAYDOWN",
    ranks: ["Statement Pile", "Debt Lister", "Plan Builder", "Plan Keeper", "Debt Plan Certified"],
    badges: [
      { id: "read-the-fine-print", name: "Read The Fine Print", note: "The statement lines and the settlement contract both read clean", test: AWARD.all(AWARD.stepClean("statement-lines"), AWARD.stepClean("settlement-flags")) },
      { id: "nothing-signed-blind", name: "Nothing Signed Blind", note: "No unsafe action anywhere in the plan", test: AWARD.safe },
      { id: "honest-number", name: "Honest Number", note: "The monthly amount committed near the middle of what the budget supports", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-plan", name: "Clean Plan", note: "No corrections anywhere", test: AWARD.clean },
      { id: "held-the-plan", name: "Held The Plan", note: "Every timed passage carried without a break", test: AWARD.unbroken },
      { id: "quick-plan", name: "Quick Plan", note: "Finish inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "drp-settlement-signature": "You reached for the signature line on the debt settlement contract before reading it. That contract charges a fee and tells you to stop paying your creditors while it 'negotiates' — the CFPB warns that stopping payments brings late fees, collection calls and damage to your report, and that a company selling settlement by phone may not charge you before it has actually settled a debt. A signature on a page you have not read is agreement to all of it.",
    "drp-ssn-script": "That card is a script for 'confirming your identity' to a caller by reading out your Social Security number. The CFPB's advice is not to give personal or financial information to a caller you cannot verify; a real collector can send you validation information in writing, and a fake one only needs the number to open accounts in your name.",
    "drp-gift-cards": "Those are prepaid gift cards bought to pay a collector who asked for them. Legitimate debt collectors do not demand payment by gift card, and money sent that way is almost impossible to get back. The CFPB treats a demand for gift cards or wire transfers as a scam warning sign, whatever the caller says about the debt.",
    "drp-skip-minimums": "That note says to skip the minimums on the other debts this month to throw everything at one card. A missed minimum brings a late fee, can raise the rate, and puts a late mark on your report that the CFPB states can stay for years. Every plan that works keeps every minimum paid first and puts only the extra toward the target debt.",
  },

  lateNotes: {
    "drp-debt-log": "The debt log is closed out once the plan is set and the calls are made, with the real dates — not filled in from the first statement.",
    "drp-payoff-dial": "The finish date comes from the plan. Set the monthly amount and the order first, then the dial has something to count.",
  },

  steps: [
    {
      id: "gather-statements", kind: "select", target: "drp-statement-folder",
      title: "Put every debt on the table",
      cue: "Open the folder and lay out a current statement for every debt — cards, the car loan, the store card, the old collection.",
      why: "A plan built from memory leaves out the debt that is hardest to think about, and that is usually the one doing the most damage. The CFPB's debt tools start the same way: every debt listed from a current statement, with the balance, the rate and the minimum as the lender states them, because a plan can only be as honest as the list it is built on.",
    },
    {
      id: "statement-lines", kind: "find", noHint: true,
      targets: ["drp-apr-line", "drp-min-line", "drp-due-line"],
      itemNames: { "drp-apr-line": "the APR", "drp-min-line": "the minimum payment", "drp-due-line": "the due date" },
      itemNotes: {
        "drp-apr-line": "The annual percentage rate is the cost of carrying the balance for a year. It is the number the plan sorts by, and the Truth in Lending Act, as the CFPB describes it, is why it is printed on the statement at all.",
        "drp-min-line": "The minimum payment is the floor — the amount that keeps the account current. Every plan pays every minimum first.",
        "drp-due-line": "The due date decides when the minimum has to land. A payment a day late is a late payment, whatever the amount.",
      },
      title: "Read the three numbers off the example statement",
      cue: "Find the APR, the minimum payment and the due date on the card statement.",
      why: "Three numbers on every statement run the whole plan: the APR says what the debt costs, the minimum says what keeps it current, and the due date says when. The Truth in Lending Act, as the CFPB describes it, is why the rate is disclosed on the statement in a standard form, so the same numbers can be compared across every card and loan on the table.",
    },
    {
      id: "monthly-amount", kind: "gauge", target: "drp-surplus-meter",
      title: "Set the monthly amount you can actually keep",
      cue: "Commit the amount the budget supports every month for debt, above the minimums — not the most you could manage once.",
      gauge: {
        label: "EXTRA TO DEBT / MONTH (EXAMPLE)", speed: 0.6, green: [0.4, 0.6],
        readout: (t) => `$${Math.round(40 + t * 360)} extra a month — example`,
        missNote: "That amount will not hold. Too little and the plan never gets ahead of the interest; too much and the first slow month sends the rent onto a card, which is how plans turn into new debt.",
      },
      why: "The monthly amount is the engine of the plan, and the commonest mistake is setting it at the best month instead of the usual one. The CFPB's budgeting guidance works from what comes in and what has to go out; the figure here is an example. An amount you can keep through a slow month finishes the plan, and an amount you cannot is the first thing that breaks it.",
    },
    {
      id: "minimum-warning", kind: "hold", target: "drp-warning-box", seconds: 6,
      title: "Read the minimum-payment warning to the end",
      cue: "Hold the statement at the warning box and read how long paying only the minimum would take, and what it would cost.",
      why: "Every credit card statement carries a minimum-payment warning — the CFPB describes it as part of what the Truth in Lending rules require — showing how long the balance takes to clear on minimums alone and how much it costs in total. Reading it through is the moment most people decide to make a plan, because the number of years on an example balance is usually far longer than anyone guessed.",
      holdBreakNote: "You put the statement down before the total. The years are the headline; the total paid in interest underneath is the part that changes minds.",
    },
    {
      id: "sort-by-rate", kind: "drag", target: "drp-card-highest",
      title: "Move the highest-rate debt to the front of the line",
      cue: "Carry the highest-APR card from the rail into the 'extra goes here' slot.",
      why: "Paying extra on the highest-rate debt first while keeping every minimum current is the order that costs the least interest, which is why the plan sorts by APR rather than by balance or by whichever creditor calls most. The CFPB's debt tools also describe paying the smallest balance first for momentum; either works when it is kept up, and this plan uses the rate order because every dollar goes furthest there.",
      drag: { to: "drp-extra-slot", radius: 0.4, missNote: "Not in the 'extra' slot. The extra money has one target at a time, and it is the debt with the highest rate on the rail." },
    },
    {
      id: "plan-order", kind: "sequence",
      targets: ["drp-plan-minimums", "drp-plan-extra", "drp-plan-roll"],
      itemNames: { "drp-plan-minimums": "every minimum paid", "drp-plan-extra": "extra to the highest rate", "drp-plan-roll": "roll it forward when one is paid" },
      outOfOrderNote: "Out of order. Minimums come first, every month, on every debt; the extra goes to the target debt; and only when that one is paid does its payment roll forward onto the next.",
      title: "Write the plan in the order it runs every month",
      cue: "On the plan board: minimums first, then the extra to the highest rate, then roll the freed payment onto the next debt.",
      why: "The order is the plan. Minimums first keeps every account current and every late mark off the report; the extra goes to one target so it actually moves; and when that debt is gone its whole payment rolls onto the next, so the monthly amount never shrinks back into spending. Written in that order, the plan is a rule to follow on a tired payday rather than a decision to make again.",
    },
    {
      id: "payoff-date", kind: "turn", target: "drp-payoff-dial",
      title: "Set the finish date",
      cue: "Turn the payoff dial to the month the plan says the last example debt is paid.",
      turn: { turns: 1.0, axis: "y", label: "PAYOFF MONTHS" },
      why: "A plan with a finish date is one people keep, because every month moves the dial and the end is visible. The date comes from the plan itself — the list, the monthly amount and the order — and on the example balances here it is a real number of months rather than 'someday'. When something changes, the dial is reset honestly instead of the plan being quietly abandoned.",
    },
    {
      id: "hardship-call", kind: "select", target: "drp-issuer-phone",
      title: "Call the card issuer about a hardship plan",
      cue: "Use the number printed on the back of the card or on the statement — not one from a text or an ad — and ask what hardship options exist.",
      why: "Creditors often have hardship or payment programmes they do not advertise, and the CFPB suggests contacting them directly when you cannot make payments. Calling the number printed on the card or the statement matters as much as the question: the numbers in texts and ads promising to 'lower your rate' are where settlement pitches and scams come from, and the issuer's own line is where a real change gets written down.",
    },
    {
      id: "settlement-flags", kind: "find", noHint: true,
      targets: ["drp-flag-upfront", "drp-flag-stop-paying", "drp-flag-tax"],
      itemNames: { "drp-flag-upfront": "a fee charged before anything is settled", "drp-flag-stop-paying": "an instruction to stop paying creditors", "drp-flag-tax": "no mention that forgiven debt may be taxed" },
      itemNotes: {
        "drp-flag-upfront": "The CFPB warns that a company selling debt settlement by phone may not charge a fee before it has settled or reduced a debt. A fee up front is the first red flag.",
        "drp-flag-stop-paying": "Being told to stop paying creditors while the company 'negotiates' leads to late fees, collections and a damaged report — the CFPB names it as one of the main risks.",
        "drp-flag-tax": "The IRS says a canceled or forgiven debt may count as income and is reported on Form 1099-C. A contract that never mentions it leaves you to find out at tax time.",
      },
      title: "Find the three red flags in the settlement contract",
      cue: "Before anything is signed, read the example contract and find the three things the CFPB and the IRS warn about.",
      why: "Debt settlement is sold hardest to people who are already behind, and the contract is where the cost hides. The CFPB warns about fees charged before anything is settled and about being told to stop paying creditors; the IRS says forgiven debt may count as income. Finding all three before the signature line is the difference between a decision and a trap.",
    },
    {
      id: "keep-the-plan", kind: "track", target: "drp-plan-track", seconds: 7,
      title: "Keep the plan through the next six months",
      cue: "Hold the plan track in the band: minimums on time, the extra paid, nothing new on the cards.",
      track: {
        start: 0.16, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.13, label: "PLAN",
        readout: (v) => (v < 0.4 ? "falling behind — a minimum at risk" : v > 0.62 ? "over-stretched — rent at risk" : "on plan"),
      },
      holdBreakNote: "The plan slipped out of band. One missed month is recoverable; the fix is to get back to minimums first and the extra second, not to start a new plan.",
      why: "Plans rarely fail in the first week; they fail in month three, when a slow paycheck or a car repair makes the extra payment look optional. Keeping the track in the band — minimums on time, the extra paid, nothing new charged — is the whole skill. The Fair Credit Reporting Act, as the CFPB states it, lets accurate late marks stay on a report for years, which is why steady beats heroic here.",
    },
    {
      id: "coach-checkin", kind: "select", target: "drp-coach",
      title: "Check in with the coach",
      cue: "Walk the coach through the plan and the calls you made, and say honestly how the debt is sitting with you.",
      why: "A coach checks the arithmetic, and also the part arithmetic misses: debt is one of the heaviest things people carry quietly, and a plan made alone under stress is easier to abandon. Saying out loud how it is going is part of the plan, and if the worry has become a crisis, 988 — or SAMHSA's National Helpline if drinking or using has become part of coping — is a real next step, not a detour.",
    },
    {
      id: "debt-log", kind: "select", target: "drp-debt-log",
      title: "Close out the debt log",
      cue: "Record each debt, its rate and minimum, the monthly extra, the target debt, the finish date and the hardship call you made.",
      why: "The log is the plan on one page, dated, so next month starts from where this one ended rather than from the statement pile. It also records what was said on the hardship call and when, which matters if the issuer's answer later changes, and it is the first thing a coach will ask to see at the next session.",
    },
  ],

  interrupts: [
    {
      id: "drp-collector-threat",
      kind: "Collector threatening arrest",
      after: "minimum-warning", delay: 3, seconds: 12,
      alert: "The phone rings: a collector about the old store-card balance says you will be arrested this week unless you pay today with gift cards, and asks you to read out your Social Security number.",
      cue: "Do not pay and do not confirm anything. Answer in writing.",
      target: "drp-validation-request",
      why: "The CFPB's debt-collection guidance is that you can ask a collector for validation information and dispute the debt in writing, that a collector may not threaten you with arrest, and that you should not give personal information to a caller you cannot verify. A demand for gift cards today, backed by a threat, is the pattern of a scam — the written request answers a real collector and ends a fake one.",
      missNote: "The call ran while you kept reading, and in the version where you went along with it the gift cards are spent and the caller has your Social Security number. The old balance is exactly where it was, and now there is a second problem on top of it.",
      wrongNote: "Not that. The answer to a collector who threatens and wants gift cards is the written request for validation information — no payment and no personal details over the phone.",
    },
    {
      id: "drp-consolidation-text",
      kind: "Consolidation offer",
      after: "keep-the-plan", delay: 3, seconds: 12,
      alert: "A text arrives: 'PRE-APPROVED debt consolidation — 0% today! Sign in the next hour. Reply with your SSN to lock your rate.'",
      cue: "Do not reply. Read the real cost the way Truth in Lending says it has to be shown.",
      target: "drp-apr-compare",
      why: "Under the Truth in Lending Act, as the CFPB describes it, a lender has to disclose the APR and the finance charge in writing before you sign, so any real offer can be compared against the plan you already have. A text that wants your Social Security number and a signature within the hour, with a teaser rate and no disclosure, is not an offer you can compare — which is the point of it.",
      missNote: "The text sat unanswered on the screen while the plan ran, and in the version where you replied, somebody now has your Social Security number and a 'loan' whose real rate nobody has seen. The plan you built was cheaper than anything that text could have been.",
      wrongNote: "Not by replying. A consolidation offer is compared on its written APR and finance charge against your own plan — never accepted from a text.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, DRP_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#8a7f72", base2: "#81776a", seam: "rgba(0,0,0,0.12)",
    }), { repeat: 6, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.06, rough: 0.92, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.92, metal: 0.02, color: 0x9a9084 });

    // ------------------------------------------------------------ back wall
    box(g, 5.6, 2.7, 0.1, 0, 1.35, -2.35, 0xe2dccd, { rough: 0.9 });
    box(g, 5.6, 0.12, 0.14, 0, 0.06, -2.28, 0x5f4d3b, { rough: 0.7 });

    // The sorting rail: four debts as cards, and the 'extra goes here' slot.
    const rail = group(g, -0.2, 1.55, -2.27);
    slab(rail, 3.0, 0.9, 0.03, 0, -0.45, 0, 0x2b2f35, { radius: 0.02, rough: 0.6 });
    decal(rail, 2.8, 0.12, 0, 0.36, 0.02, signFace("DEBTS — SORT BY APR (ALL FIGURES ARE EXAMPLES)", { bg: "#2b2f35", accent: DRP_CSS, scale: 0.55 }), { px: 512 });
    box(rail, 2.9, 0.03, 0.06, 0, -0.26, 0.04, 0x5a6068, { rough: 0.4, metal: 0.6 });
    const DEBTS = [
      ["drp-card-highest", -0.95, "CARD C", "29.9% APR · $1,850", "#c0392b"],
      ["drp-card-store", -0.3, "STORE CARD", "26.0% APR · $640", "#b8602f"],
      ["drp-card-a", 0.35, "CARD A", "22.4% APR · $2,300", "#8a7a3a"],
      ["drp-auto-loan", 1.0, "AUTO LOAN", "7.9% APR · $6,900", "#3f6f66"],
    ];
    const debtCards = {};
    for (const [id, x, name, line, band] of DEBTS) {
      const card = group(rail, x, -0.05, 0.05);
      slab(card, 0.56, 0.36, 0.02, 0, -0.18, 0, 0xf6f0e2, { radius: 0.02, rough: 0.6 });
      decal(card, 0.52, 0.32, 0, 0, 0.016, paperFace(name, [line, "minimum on time"], { band }), { px: 256 });
      debtCards[id] = card;
      if (id === "drp-card-highest") reg(hits, card, id);
    }
    const slotGroup = group(rail, 0, 0, 0);
    const extraSlot = box(slotGroup, 0.62, 0.42, 0.02, 1.9, -0.05, 0.03, 0x3a4a3a, { rough: 0.6 });
    void extraSlot;
    const slotFace = decal(slotGroup, 0.56, 0.1, 1.9, 0.22, 0.045, signFace("EXTRA GOES HERE", { bg: "#1d2a1d", accent: "#59c97b", scale: 0.55 }), { px: 256 });
    void slotFace;
    const slotMark = box(slotGroup, 0.6, 0.4, 0.06, 1.9, -0.05, 0.06, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, slotMark, "drp-extra-slot");

    // The plan board, three rows, markers for the sequence.
    const plan = holoPanel(g, 0.72, 0.52, -1.95, 1.5, -1.6, (cx, w, h) => {
      cx.fillStyle = "rgba(24,18,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = DRP_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbe7c8"; cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("EVERY MONTH, IN THIS ORDER", w * 0.05, h * 0.12);
      cx.fillStyle = "#fff6e6"; cx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      ["1. Every minimum, on time", "2. Extra to the highest APR", "3. Paid off? Roll it forward"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.22)));
    }, { ry: 0.5, accent: DRP_ACCENT });
    for (const [id, y] of [["drp-plan-minimums", 0.07], ["drp-plan-extra", -0.04], ["drp-plan-roll", -0.15]]) {
      reg(hits, box(plan, 0.62, 0.08, 0.02, 0, y, 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), id);
    }
    const planTicks = [];
    for (const y of [0.07, -0.04, -0.15]) {
      const tk = box(plan, 0.03, 0.03, 0.01, 0.31, y, 0.02, CITY.good, { emissive: CITY.good, ei: 1.0, cast: false });
      tk.visible = false;
      planTicks.push(tk);
    }

    // The payoff dial on the right of the wall.
    const dialBoard = group(g, 1.95, 1.45, -2.0, -0.5);
    slab(dialBoard, 0.6, 0.7, 0.03, 0, -0.35, 0, 0xf2ece0, { radius: 0.02, rough: 0.8 });
    const dialFace = decal(dialBoard, 0.54, 0.24, 0, 0.2, 0.02, paperFace("PAYOFF DATE", ["Example plan: ___ months"], { bg: "#fbf7ee", band: "#b8602f" }), { px: 256 });
    const payoffDial = group(dialBoard, 0, -0.12, 0.04);
    cyl(payoffDial, 0.13, 0.13, 0.03, 0, 0, 0, 0x3a4048, { rough: 0.4, metal: 0.5, seg: 22 }).rotation.x = Math.PI / 2;
    box(payoffDial, 0.022, 0.1, 0.02, 0, 0.06, 0.02, DRP_ACCENT, { emissive: DRP_ACCENT, ei: 0.6, rough: 0.4 });
    holoTag(dialBoard, "payoff dial", 0, 0.42, 0.02, { css: DRP_CSS, w: 0.28 });
    reg(hits, payoffDial, "drp-payoff-dial");

    // The plan track: six month lamps below the dial.
    const trackBar = group(g, 1.95, 0.98, -2.0, -0.5);
    slab(trackBar, 0.7, 0.18, 0.03, 0, -0.09, 0, 0x2b2f35, { radius: 0.02, rough: 0.6 });
    const lamps = [];
    for (let i = 0; i < 6; i++) {
      const l = box(trackBar, 0.08, 0.1, 0.02, -0.26 + i * 0.104, 0, 0.02, 0x4a4f55, { rough: 0.5, cast: false });
      ownMaterial(l);
      lamps.push(l);
    }
    holoTag(trackBar, "plan track — 6 months", 0, -0.15, 0.02, { css: DRP_CSS, w: 0.44 });
    reg(hits, trackBar, "drp-plan-track");

    // ---------------------------------------------------------- the table
    const table = group(g, 0.1, 0, -0.55);
    slab(table, 1.8, 0.05, 0.95, 0, 0.74, 0, DRP_WOOD, { radius: 0.03, rough: 0.55 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(table, 0.035, 0.035, 0.72, sx * 0.8, 0.36, sz * 0.4, 0x3a3028, { rough: 0.6, seg: 10 });
    }

    // The statement folder.
    const folder = group(table, -0.62, 0.77, 0.2, 0.15);
    box(folder, 0.34, 0.03, 0.25, 0, 0.015, 0, 0xb8864a, { rough: 0.7 });
    const folderFace = decal(folder, 0.3, 0.2, 0, 0.032, 0, paperFace("STATEMENTS", ["Cards · loan · store", "Current month"], { bg: "#f7efdd", band: "#8a5a2c" }), { px: 224 });
    folderFace.rotation.x = -Math.PI / 2;
    holoTag(folder, "statement folder", 0, 0.14, 0, { css: DRP_CSS, w: 0.36 });
    reg(hits, folder, "drp-statement-folder");

    // The card statement, standing on an easel so its lines can be found.
    const easel = group(g, -0.95, 0, -1.25, 0.3);
    for (const sx of [-1, 1]) cyl(easel, 0.015, 0.015, 1.3, sx * 0.25, 0.65, 0, 0x5a4636, { rough: 0.6, seg: 8 });
    const stmt = group(easel, 0, 1.25, 0.04);
    slab(stmt, 0.66, 0.78, 0.02, 0, -0.39, 0, 0xfdfaf2, { radius: 0.01, rough: 0.8 });
    decal(stmt, 0.62, 0.74, 0, 0, 0.016, paperFace("CARD C — STATEMENT (EXAMPLE)", [
      "New balance ........ $1,850",
      "APR (purchases) .... 29.9%",
      "Minimum payment .... $56",
      "Payment due ........ the 21st",
      "MINIMUM PAYMENT WARNING:",
      "minimums only = years longer",
    ], { bg: "#fdfaf2", band: "#c0392b" }), { px: 384 });
    holoTag(stmt, "card statement — example", 0, 0.45, 0.02, { css: DRP_CSS, w: 0.48 });
    // paperFace rows at 0.26 + 0.1·i from the top of a 0.74 page.
    const rowY = (i) => 0.37 - (0.26 + 0.1 * i) * 0.74;
    reg(hits, box(stmt, 0.58, 0.06, 0.03, 0, rowY(1), 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "drp-apr-line");
    reg(hits, box(stmt, 0.58, 0.06, 0.03, 0, rowY(2), 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "drp-min-line");
    reg(hits, box(stmt, 0.58, 0.06, 0.03, 0, rowY(3), 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "drp-due-line");
    reg(hits, box(stmt, 0.58, 0.12, 0.03, 0, (rowY(4) + rowY(5)) / 2, 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "drp-warning-box");
    const warnGlow = box(stmt, 0.6, 0.14, 0.005, 0, (rowY(4) + rowY(5)) / 2, 0.012, DRP_ACCENT, { emissive: DRP_ACCENT, ei: 0.2, rough: 0.5, cast: false, opacity: 0.35, transparent: true });
    ownMaterial(warnGlow);

    // The monthly-amount meter.
    const meter = instrument(table, 0.05, 0.8, 0.22, { idle: "$--", color: DRP_ACCENT, ry: 0.1 });
    holoTag(meter, "extra / month — example", 0, 0.16, 0, { css: DRP_CSS, w: 0.46 });
    reg(hits, meter, "drp-surplus-meter");

    // The settlement contract, with its flags and its signature line.
    const contract = group(table, 0.55, 0.77, 0.12, -0.2);
    slab(contract, 0.34, 0.006, 0.44, 0, 0, 0, 0xfbf7ee, { radius: 0.004, rough: 0.85 });
    const conFace = decal(contract, 0.32, 0.42, 0, 0.005, 0, paperFace("DEBT RELIEF AGREEMENT", [
      "Program fee due now",
      "Stop paying creditors",
      "(nothing on taxes)",
      "Sign: ____________",
    ], { bg: "#fbf7ee", band: "#7a2f2f" }), { px: 256 });
    conFace.rotation.x = -Math.PI / 2;
    holoTag(contract, "settlement contract", 0, 0.12, 0, { css: "#f0a35b", w: 0.4 });
    // The page lies flat, so its rows run along z: row i at z = -0.21 + (0.26 + 0.1·i)·0.42.
    const rowZ = (i) => -0.21 + (0.26 + 0.1 * i) * 0.42;
    reg(hits, box(contract, 0.3, 0.02, 0.035, 0, 0.012, rowZ(0), 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "drp-flag-upfront");
    reg(hits, box(contract, 0.3, 0.02, 0.035, 0, 0.012, rowZ(1), 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "drp-flag-stop-paying");
    reg(hits, box(contract, 0.3, 0.02, 0.035, 0, 0.012, rowZ(2), 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "drp-flag-tax");
    const pen = group(contract, 0.05, 0.012, rowZ(3));
    cyl(pen, 0.006, 0.006, 0.14, 0, 0, 0, 0x1d2a44, { rough: 0.4, seg: 8 }).rotation.z = Math.PI / 2;
    reg(hits, pen, "drp-settlement-signature");

    // The validation request (first interruption's answer).
    const validation = group(table, -0.2, 0.77, 0.3, 0.1);
    slab(validation, 0.2, 0.006, 0.15, 0, 0, 0, 0xf2eee2, { radius: 0.004, rough: 0.85 });
    const valFace = decal(validation, 0.18, 0.13, 0, 0.005, 0, paperFace("VALIDATION REQUEST", ["Show me the debt", "in writing"], { bg: "#f2eee2", band: "#3f6f66" }), { px: 192 });
    valFace.rotation.x = -Math.PI / 2;
    holoTag(validation, "validation request", 0, 0.1, 0, { css: DRP_CSS, w: 0.38 });
    reg(hits, validation, "drp-validation-request");

    // The phone script card (Social Security hazard) and the gift cards.
    const script = group(table, -0.55, 0.77, -0.22, -0.2);
    slab(script, 0.18, 0.004, 0.12, 0, 0, 0, 0xffe0d4, { radius: 0.004, rough: 0.8 });
    const scrFace = decal(script, 0.16, 0.1, 0, 0.004, 0, paperFace("CALLER SCRIPT", ["'Read me your SSN", "to confirm'"], { bg: "#ffe0d4", band: "#c0392b" }), { px: 160 });
    scrFace.rotation.x = -Math.PI / 2;
    holoTag(script, "caller script", 0, 0.1, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, script, "drp-ssn-script");

    const gifts = group(table, -0.25, 0.77, -0.3, 0.3);
    for (let i = 0; i < 3; i++) {
      slab(gifts, 0.085, 0.004, 0.055, i * 0.02, i * 0.005, i * 0.012, [0x2f7ab8, 0xb83a8a, 0x3ab87a][i], { radius: 0.006, rough: 0.4 });
    }
    holoTag(gifts, "gift cards for the collector", 0.02, 0.1, 0, { css: "#f0645b", w: 0.5 });
    const giftHit = box(gifts, 0.14, 0.04, 0.09, 0.02, 0.01, 0.012, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, giftHit, "drp-gift-cards");

    // The 'skip the minimums' note, stuck to the table edge.
    const skip = group(table, 0.35, 0.77, -0.35, 0.1);
    slab(skip, 0.12, 0.004, 0.1, 0, 0, 0, 0xf7e36b, { radius: 0.004, rough: 0.8 });
    const skipFace = decal(skip, 0.11, 0.09, 0, 0.004, 0, paperFace("THIS MONTH", ["skip the other", "minimums"], { bg: "#f7e36b", band: "#c0392b" }), { px: 128 });
    skipFace.rotation.x = -Math.PI / 2;
    holoTag(skip, "skip the minimums?", 0, 0.1, 0, { css: "#f0645b", w: 0.38 });
    reg(hits, skip, "drp-skip-minimums");

    // The debt log.
    const logBook = group(table, 0.72, 0.77, -0.3, 0.1);
    box(logBook, 0.24, 0.02, 0.17, 0, 0.01, 0, 0x2f4f6f, { rough: 0.6 });
    const logFace = decal(logBook, 0.2, 0.14, 0, 0.021, 0, paperFace("DEBT LOG", ["Target: ____", "Extra: ____", "Finish: ____"], { bg: "#f6f3ea", band: "#2f4f6f" }), { px: 192 });
    logFace.rotation.x = -Math.PI / 2;
    holoTag(logBook, "debt log", 0, 0.12, 0, { css: DRP_CSS, w: 0.24 });
    reg(hits, logBook, "drp-debt-log");

    // The issuer phone on a side cabinet, and the caller projection.
    const side = group(g, 1.75, 0, -0.35, -0.4);
    box(side, 0.55, 0.8, 0.42, 0, 0.4, 0, 0x5a6068, { rough: 0.55, metal: 0.3 });
    for (let i = 0; i < 2; i++) box(side, 0.2, 0.02, 0.02, 0, 0.25 + i * 0.3, 0.22, 0xc9d0ce, { rough: 0.3, metal: 0.8 });
    const phone = group(side, 0, 0.8, 0);
    box(phone, 0.2, 0.06, 0.22, 0, 0.03, 0, 0x2b3036, { rough: 0.5 });
    const handset = box(phone, 0.055, 0.045, 0.22, -0.055, 0.08, 0, 0x22262b, { rough: 0.5 });
    ownMaterial(handset);
    const phoneLamp = box(phone, 0.04, 0.012, 0.02, 0.055, 0.066, 0.08, CITY.good, { emissive: CITY.good, ei: 0.3, rough: 0.4, cast: false });
    ownMaterial(phoneLamp);
    const cardBack = decal(side, 0.2, 0.12, 0.0, 0.82, 0.19, paperFace("CALL: number on", ["the back of the card"], { bg: "#f6f3ea", band: "#3f6f66" }), { px: 160 });
    cardBack.rotation.x = -0.5;
    holoTag(phone, "issuer's own number", 0, 0.2, 0, { css: DRP_CSS, w: 0.4 });
    reg(hits, phone, "drp-issuer-phone");

    const caller = holoPanel(g, 0.5, 0.3, 1.35, 1.55, -0.1, (cx, w, h) => {
      cx.fillStyle = "rgba(40,8,10,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0645b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffd8d4"; cx.font = `600 ${Math.round(h * 0.17)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("\"PAY TODAY OR ELSE\"", w / 2, h * 0.34);
      cx.font = `${Math.round(h * 0.13)}px Arial, sans-serif`;
      cx.fillText("gift cards · your SSN", w / 2, h * 0.68);
    }, { accent: CITY.alert, ry: -0.4 });
    caller.visible = false;

    // The APR comparison panel (second interruption's answer).
    const compare = holoPanel(g, 0.66, 0.46, -2.45, 1.45, 0.25, (cx, w, h) => {
      cx.fillStyle = "rgba(24,18,8,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = DRP_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbe7c8"; cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("COMPARE THE REAL COST", w * 0.06, h * 0.15);
      cx.fillStyle = "#fff6e6"; cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["APR, in writing, before signing", "Finance charge, in dollars", "Against your own plan"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: Math.PI / 2, accent: DRP_ACCENT });
    reg(hits, compare, "drp-apr-compare");
    const compareLamp = ball(g, 0.04, -2.45, 1.75, 0.25, 0x4a4f55, { rough: 0.4, seg: 12, seg2: 10 });
    ownMaterial(compareLamp);

    // A phone the text lands on, face up on the table.
    const mobile = group(table, 0.2, 0.77, 0.34, 0.2);
    slab(mobile, 0.08, 0.01, 0.15, 0, 0, 0, 0x1b1f24, { radius: 0.01, rough: 0.3, metal: 0.4 });
    const mobileFace = decal(mobile, 0.07, 0.13, 0, 0.007, 0, signFace("", { bg: "#0b0f12", accent: "#0b0f12", scale: 0.3 }), { px: 128, glow: true, ei: 0.8 });
    mobileFace.rotation.x = -Math.PI / 2;

    // Chairs, low-backed so they do not hide the table.
    for (const [cx, cz, ry] of [[-0.45, 0.35, Math.PI - 0.25], [0.65, 0.35, Math.PI + 0.25]]) {
      const chair = group(g, cx, 0, cz, ry);
      slab(chair, 0.42, 0.05, 0.4, 0, 0.45, 0, 0x6a4f3a, { radius: 0.03, rough: 0.7 });
      slab(chair, 0.4, 0.2, 0.05, 0, 0.6, -0.18, 0x6a4f3a, { radius: 0.03, rough: 0.7 });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        cyl(chair, 0.015, 0.015, 0.44, sx * 0.17, 0.22, sz * 0.16, CITY.darkSteel, { rough: 0.4, metal: 0.65, seg: 8 });
      }
    }

    // A bookcase and a wall clock, so the room reads as a coaching office.
    const shelf = group(g, 2.35, 0, -1.6, -0.5);
    box(shelf, 0.7, 1.6, 0.32, 0, 0.8, 0, 0x5f4d3b, { rough: 0.7 });
    for (let i = 0; i < 3; i++) {
      box(shelf, 0.64, 0.02, 0.28, 0, 0.45 + i * 0.4, 0.01, 0x4a3c2e, { rough: 0.7 });
      for (let b = 0; b < 5; b++) box(shelf, 0.07, 0.26, 0.2, -0.24 + b * 0.12, 0.59 + i * 0.4, 0.02, [0x3f6f66, 0xb8602f, 0x2f4f6f, 0x8a7a3a, 0x7a2f2f][b], { rough: 0.7 });
    }
    const clock = group(g, 0.2, 2.25, -2.28);
    cyl(clock, 0.16, 0.16, 0.03, 0, 0, 0, 0xf6f2e8, { rough: 0.5, seg: 20 }).rotation.x = Math.PI / 2;
    box(clock, 0.012, 0.1, 0.01, 0, 0.04, 0.02, 0x22262b, { rough: 0.5 });
    box(clock, 0.07, 0.012, 0.01, 0.03, 0, 0.02, 0x22262b, { rough: 0.5 });

    for (const sx of [-1, 1]) {
      box(g, 1.1, 0.05, 0.34, sx * 1.1, 2.62, -0.6, 0xe8edf0, { rough: 0.4, cast: false });
      box(g, 1.0, 0.02, 0.26, sx * 1.1, 2.59, -0.6, 0xfff6e6, { emissive: 0xfff6e6, ei: 0.5, rough: 0.4, cast: false });
    }

    // ------------------------------------------------------------- the coach
    const coach = standingFigure(g, -1.9, 0.55, { ry: 1.2, cloth: 0x8a5a2c, skin: 0x6f4a33 });
    holoTag(coach, "financial coach", 0, 1.84, 0, { css: DRP_CSS, w: 0.36 });
    reg(hits, box(coach, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "drp-coach");

    let ringing = false, texting = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(-0.2, 1.3, -2.0),

      onStepComplete(step) {
        if (step.id === "monthly-amount") repaint(meter.userData.screen, signFace("SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.55 }));
        if (step.id === "minimum-warning") warnGlow.material.emissiveIntensity = 0.9;
        if (step.id === "sort-by-rate") debtCards["drp-card-highest"].position.set(1.9, -0.05, 0.08);
        if (step.id === "plan-order") for (const tk of planTicks) tk.visible = true;
        if (step.id === "payoff-date") repaint(dialFace, paperFace("PAYOFF DATE", ["Example plan: 34 months"], { bg: "#fbf7ee", band: "#59c97b" }));
        if (step.id === "settlement-flags") repaint(conFace, paperFace("DEBT RELIEF AGREEMENT", ["X fee before settling", "X stop paying creditors", "X nothing on taxes", "NOT SIGNED"], { bg: "#fbf7ee", band: "#c0392b" }));
        if (step.id === "keep-the-plan") for (const l of lamps) l.material.color.set(CITY.good);
        if (step.id === "coach-checkin") coach.rotation.y = 0.6;
        if (step.id === "debt-log") repaint(logFace, paperFace("DEBT LOG", ["Target: Card C", "Extra: set", "Finish: 34 mo (ex.)"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "drp-collector-threat") {
          ringing = true;
          caller.visible = true;
          handset.position.y = 0.2;
          handset.material.emissive.set(CITY.alert);
          handset.material.emissiveIntensity = 0.9;
        }
        if (it.id === "drp-consolidation-text") {
          texting = true;
          repaint(mobileFace, signFace("0% TODAY!\nreply w/ SSN", { bg: "#3a0c10", accent: "#f0645b", scale: 0.2 }));
          mobile.position.y = 0.84;
          compareLamp.material.emissive.set(DRP_ACCENT);
          compareLamp.material.emissiveIntensity = 0.8;
        }
      },
      onInterruptEnd(it) {
        if (it.id === "drp-collector-threat") {
          ringing = false;
          caller.visible = false;
          handset.position.y = 0.08;
          handset.material.emissiveIntensity = 0;
          phoneLamp.material.emissiveIntensity = 0.3;
          if (it.resolved === "answered") validation.position.set(0.72, 0.8, -0.3);
        }
        if (it.id === "drp-consolidation-text") {
          texting = false;
          repaint(mobileFace, signFace("", { bg: "#0b0f12", accent: "#0b0f12", scale: 0.3 }));
          mobile.position.y = 0.77;
          compareLamp.material = it.resolved === "answered"
            ? mat(CITY.good, { emissive: CITY.good, ei: 0.9, rough: 0.4 })
            : mat(0x4a4f55, { rough: 0.4 });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (ringing) phoneLamp.material.emissiveIntensity = 0.6 + Math.sin(t * 12) * 0.6;
        if (texting) compareLamp.material.emissiveIntensity = 0.5 + Math.sin(t * 8) * 0.4;
        if (session?.turn && session.step?.id === "payoff-date") payoffDial.rotation.z = -session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "monthly-amount") {
          const ok = gg.t >= 0.4 && gg.t <= 0.6;
          repaint(meter.userData.screen, signFace(`$${Math.round(40 + gg.t * 360)}`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "keep-the-plan") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          const lit = Math.min(6, Math.floor((tr.inBand ?? 0) / 7 * 6));
          lamps.forEach((l, i) => { l.material.color.set(i < lit ? CITY.good : ok ? 0x4a4f55 : 0x7a3a36); });
        }
      },
    };
  },
};
