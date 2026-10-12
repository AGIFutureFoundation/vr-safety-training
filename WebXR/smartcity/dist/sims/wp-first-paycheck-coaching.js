import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, paperFace, seatedFigure, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ First-Paycheck Coaching VR — Pathway Edition, wojrc.org.
//
// The wellness resource centre's financial coaching desk the week a new
// hire's first paycheck actually arrives: the orientation packet read, the
// benefits enrollment items found on the packet, direct deposit set up in
// the order that keeps a check from being misdirected, a budget built for
// the actual number on the stub, the enrollment deadline read correctly,
// part of the first check moved into an emergency fund, and a benefits
// question asked before the enrollment window closes. Sited generically: no
// real employer, benefits plan or clause number the registry is not sure of.

const FPC_ACCENT = 0x7fc4a0;
const FPC_CSS = "#7fc4a0";

export const SIM_WP_FIRST_PAYCHECK_COACHING = {
  id: "wp-first-paycheck-coaching",
  index: "714",
  domain: "Financial coaching",
  trade: "Pathway Edition — first-paycheck coaching at the wellness resource centre: budget, direct deposit, benefits enrollment",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "clear",
  certification: "The Consumer Financial Protection Bureau's (CFPB) consumer guidance on budgeting and building an emergency fund, which this session's budget and savings envelope are built from; the IRS's guidance for workers on Form W-4 and the Tax Withholding Estimator, read against the first stub at this same desk; HIPAA's Privacy Rule, for what a health-plan election on the benefits packet does and does not share outside the plan itself; 29 CFR 1910.22 for the walking-working surfaces the wellness centre shares with every other office; SAMHSA's guidance on help-seeking, for the coach's own check-in; Teamsters (IBT) benefit funds, named on the enrollment packet as one of the plans this pathway can lead to",
  name: "First-Paycheck Coaching",
  title: simTitle("First-Paycheck Coaching"),
  tagline: "Read the orientation packet, find the benefits items that need an election, set up direct deposit in order, build a budget for the real number, read the enrollment deadline correctly, move part of the check to savings, and ask a real benefits question",
  accent: FPC_ACCENT,
  accentCss: FPC_CSS,
  parSeconds: 330,
  footprint: 2.4,
  supportLine: "the wellness resource centre's financial coach, and 988 or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if a first paycheck brings up more money stress than the room can hold",
  badge: { id: "first-check-set", name: "First Check Set", note: "The packet read, the benefits items found, direct deposit set up in order, a budget built for the real number, savings moved and a benefits question actually asked" },

  game: system({
    name: "Wellness Resource Centre",
    currency: "STUB",
    ranks: ["First Check", "Deposit Set", "Budget Built", "Benefits Elected", "First-Paycheck Certified"],
    badges: [
      { id: "packet-read", name: "Packet Read", note: "The orientation packet held through and the benefits items found clean", test: AWARD.all(AWARD.stepClean("read-packet"), AWARD.stepClean("find-benefits-items")) },
      { id: "nothing-to-a-caller", name: "Nothing To A Caller", note: "No unsafe action anywhere in the session", test: AWARD.safe },
      { id: "held-the-budget", name: "Held The Budget", note: "The budget track carried without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-first-check", name: "Clean First Check", note: "No corrections anywhere", test: AWARD.clean },
      { id: "honest-confidence", name: "Honest Confidence", note: "The confidence gauge committed near the middle of the band", test: AWARD.precise(0.7) },
      { id: "one-sitting-set", name: "One-Sitting Set", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wp-fp-cord-trip": "You were about to step over the space heater's cord where it crosses the middle of the coaching room floor. A cord across the floor of a room people cross all morning is a trip waiting for the busiest hour of the week — it gets run along the wall and taped down, not left where the next client's feet land.",
    "wp-fp-worksheet-hunch": "You were about to fill out the whole budget worksheet hunched over a clipboard on your knee instead of at the desk. A budget worth building carefully takes real time, and doing it hunched over that long strains a back for no reason — sit at the desk and use the surface it has.",
    "wp-fp-stuffy-centre": "The wellness centre's front room has gone warm with the door closed all morning. A hot, airless room dulls the concentration a budget built for real numbers actually needs — crack the door for a breeze and get water before you start, not partway through.",
    "wp-fp-panic-client": "The client at the next desk has started breathing fast and gripping the edge of the table over a notice in her hand. A panic response to bad financial news is common and treatable in the moment — get the coach, help her slow her breathing, and do not just keep working next to it as if nothing is happening.",
  },

  lateNotes: {
    "wp-fp-savings-cash": "Not yet. Money goes into the envelope once the budget is actually built — a transfer with no plan behind it just becomes next week's overdraft.",
    "wp-fp-firstcheck-log": "The log closes out the session last, with what the coach actually said about the benefits question.",
  },

  steps: [
    {
      id: "sign-in", kind: "select", target: "wp-fp-signin-desk",
      title: "Sign in at the coaching desk",
      cue: "Sign the sheet at the wellness centre desk with your name and the appointment time.",
      why: "The wellness centre's financial coach runs appointments back to back on paycheck week, and signing in confirms you are here for the slot booked — the same habit as every other appointment this pathway has run on since intake.",
    },
    {
      id: "read-packet", kind: "hold", target: "wp-fp-orientation-packet", seconds: 6,
      title: "Read the first-paycheck orientation packet",
      cue: "Hold the packet open and read what it actually says about pay, direct deposit and the benefits enrollment window.",
      why: "A first-paycheck packet answers questions that are expensive to get wrong later — when the enrollment window actually closes, what direct deposit needs to be set up correctly, what the first check will and will not include. Reading it fully now, with the coach in the room to answer a question, is worth more than guessing later from memory.",
      holdBreakNote: "You closed the packet before the enrollment deadline line. That is the one date the rest of today runs against — read it through.",
    },
    {
      id: "find-benefits-items", kind: "find", noHint: true,
      targets: ["wp-fp-benefits-health", "wp-fp-benefits-retirement", "wp-fp-benefits-beneficiary"],
      itemNames: { "wp-fp-benefits-health": "the health plan election", "wp-fp-benefits-retirement": "the retirement plan election", "wp-fp-benefits-beneficiary": "the beneficiary designation" },
      itemNotes: {
        "wp-fp-benefits-health": "A health plan election left blank past the enrollment window usually means no coverage until the next one opens, often a full year away.",
        "wp-fp-benefits-retirement": "A retirement plan election decided now, even a small one, is a habit that compounds for the whole rest of a career — leaving it blank is itself a choice, just the default one.",
        "wp-fp-benefits-beneficiary": "A beneficiary designation with nobody named on it means a benefit's payout follows a default order of relatives that may not match what you actually want.",
      },
      title: "Find the three benefits items that need an election",
      cue: "Three lines on the benefits packet still need an election from you. Find all three.",
      why: "A benefits packet handed over on day one is easy to set aside unread, and each of these three elections has a real deadline attached to it — finding them now, with the coach still in the room, is what keeps a missed election from becoming a full year's wait for the next enrollment window.",
    },
    {
      id: "direct-deposit-order", kind: "sequence",
      targets: ["wp-fp-dd-numbers", "wp-fp-dd-voided-check", "wp-fp-dd-submit"],
      itemNames: { "wp-fp-dd-numbers": "verify the routing and account numbers", "wp-fp-dd-voided-check": "attach a voided check or bank letter", "wp-fp-dd-submit": "submit the form" },
      outOfOrderNote: "Numbers verified first, since a transposed digit sends a check to the wrong account entirely; the voided check or bank letter next, as the proof that backs the numbers up; and the form submitted last, once both actually match.",
      title: "Set up direct deposit in the order that keeps it accurate",
      cue: "Verify the routing and account numbers, attach the voided check or bank letter, then submit the form — in that order.",
      why: "A single transposed digit in a routing or account number sends a paycheck to somebody else's account, and getting it back can take weeks even when the bank is cooperative. Verifying the numbers against a real document before submitting anything is the one habit that keeps the very first check from being the one that goes missing.",
    },
    {
      id: "confidence-gauge", kind: "gauge", target: "wp-fp-confidence-dial",
      title: "Rate your budget confidence honestly",
      cue: "The dial runs one to ten. Commit it where you actually are with the budget, not where you want to be.",
      gauge: {
        label: "CONFIDENCE", speed: 0.6, green: [0.4, 0.7],
        readout: (t) => `${Math.round(1 + t * 9)} / 10`,
        missNote: "That number does not match somebody who has never budgeted an hourly paycheck before. Rate it honestly — the coach spends the budget session differently for a shaky five than for a confident ten.",
      },
      why: "This number tells the coach how much to slow down and explain versus how much to let you drive the budget yourself, and an inflated number gets less help exactly where a first hourly paycheck usually needs more of it — deductions, the gap before the second check, and the first bill that lands before payday.",
    },
    {
      id: "budget-track", kind: "track", target: "wp-fp-budget-slider", seconds: 7,
      title: "Hold the budget split in the healthy band",
      cue: "Hold the slider in the band: needs covered first, savings held steady, without starving either one.",
      track: {
        start: 0.5, green: [0.36, 0.66], rise: 0.5, fall: 0.44, drift: 0.14, label: "BUDGET",
        readout: (v) => (v < 0.36 ? "needs underfunded" : v > 0.66 ? "nothing left for savings" : "needs covered, savings held"),
      },
      holdBreakNote: "The split drifted out of band — needs went short, or savings dropped to nothing. Bring it back to covering both.",
      why: "A budget built around one real number — the actual first check, not the offer letter's yearly figure divided by twelve — has to cover needs first without leaving savings at zero, because zero savings is what turns the next unexpected bill into a payday loan. Holding both at once, even on a small first check, is the whole skill this session is teaching.",
    },
    {
      id: "read-deadline", kind: "select", target: "wp-fp-deadline-correct",
      title: "Read the enrollment deadline correctly",
      cue: "Among the deadline cards, choose the one that matches what the packet actually says — not the rumor from a coworker.",
      why: "Benefits enrollment deadlines are specific to each employer's plan, and a wrong assumption borrowed from a coworker's old job is exactly how somebody misses their own window. The packet's own printed date is the only one that matters here, and reading it correctly is what makes an election possible instead of a missed year.",
    },
    {
      id: "savings-envelope", kind: "drag", target: "wp-fp-savings-cash",
      title: "Move part of the first check into savings",
      cue: "Carry the savings portion into the emergency fund envelope.",
      why: "Money moved into an envelope the day the check arrives gets saved; money left in a checking account to be dealt with later usually gets spent on something that felt urgent at the time. Doing it now, at the desk, with the budget still on the table, is what makes the emergency fund an actual fund instead of an intention.",
      drag: { to: "wp-fp-savings-envelope", radius: 0.4, missNote: "Not in the envelope. Cash left on the desk gets folded back into the wallet before the day is out." },
    },
    {
      id: "book-deadline-reminder", kind: "turn", target: "wp-fp-reminder-dial",
      title: "Set a reminder for the enrollment deadline",
      cue: "Turn the reminder dial to a date before the enrollment window actually closes.",
      turn: { turns: 0.6, axis: "y", label: "ENROLLMENT REMINDER" },
      why: "A deadline read correctly today is still a deadline that can be forgotten in three weeks of a new schedule — a reminder set now, for a date before the window closes rather than on it, is what leaves room to fix a mistake on the election instead of finding out it is too late.",
    },
    {
      id: "ask-benefits-question", kind: "select", target: "wp-fp-coach",
      title: "Ask a real benefits question",
      cue: "Ask the coach something specific about the plan — not something the packet has already answered.",
      why: "A packet answers the general questions; the coach is there for the specific one — what happens to the health plan if hours drop below the threshold, whether the retirement match is immediate or vests over time. Asking it now, while an election can still be changed, is worth more than asking it after the window closes.",
    },
    {
      id: "submit-forms", kind: "select", target: "wp-fp-forms-tray",
      title: "Submit the direct deposit and benefits forms",
      cue: "Place the completed forms in the coach's submission tray.",
      why: "A form completed but left in a bag is a form that has not actually enrolled anything — submitting it here, today, at the desk, is what turns a completed worksheet into an active direct deposit and a real benefits election.",
    },
    {
      id: "coach-checkin", kind: "select", target: "wp-fp-checkin-board",
      title: "Check in with the coach",
      cue: "Answer the coach's question about how the first-paycheck week is actually going.",
      why: "A first paycheck often lands in the middle of a stretch that is still financially tight from the weeks of training before it, and the coach's check-in is where that gets said honestly rather than papered over with a budget that looks fine on paper. It is also where 988 or SAMHSA's National Helpline gets named, for the week that number is the one that is needed.",
    },
    {
      id: "close-log", kind: "select", target: "wp-fp-firstcheck-log",
      title: "Close out the first-paycheck log",
      cue: "Log the benefits elections, the direct deposit status and the savings amount, then sign it.",
      why: "The log is what the coach reads before the next check-in instead of asking you to remember every election from scratch — a benefits choice and a savings amount written down today are what makes next month's follow-up actually useful.",
    },
  ],

  interrupts: [
    {
      id: "wp-fp-payroll-scam-call",
      kind: "Caller posing as payroll",
      after: "budget-track", delay: 3, seconds: 12,
      alert: "The desk phone rings: a caller says she is from 'new-hire payroll processing' and needs your Social Security number and full bank account number read to her now to 'finish setting up direct deposit'.",
      cue: "Do not read anything out. Verify it at the HR window in person.",
      target: "wp-fp-hr-window",
      why: "Direct deposit is set up on the form you already filled out at this desk, never by reading numbers to an unexpected caller, and a request for a Social Security number and a full account number together is exactly what the CFPB's guidance warns is used to drain a new hire's very first check. The HR window, in person, is how you check whether any such call was ever real.",
      missNote: "The call sat unanswered while you kept working, and in the version where you read the numbers out, the caller had a routing number, an account number and a Social Security number before your first check even cleared.",
      wrongNote: "Not the budget slider. The HR window is where a real payroll question gets checked — go there, not to the caller.",
    },
    {
      id: "wp-fp-loan-request",
      kind: "Coworker asks to borrow against your check",
      after: "savings-envelope", delay: 3, seconds: 12,
      alert: "A coworker who caught up with you outside the office asks to borrow forty dollars against your first check, 'just until Friday'.",
      cue: "Decline for now, and point them to the case manager if it is a real emergency.",
      target: "wp-fp-referral-card",
      why: "A loan between coworkers has no paperwork and no plan for what happens if Friday's check does not cover both of you, and it can quietly cost a friendship on top of the money — the case manager's referral card exists for a real emergency, with an actual process behind it, which a handshake on the sidewalk does not have.",
      missNote: "You handed over the cash on the spot, and in the version where Friday came and went with nothing paid back, both the money and the friendship were harder to get back than the forty dollars ever was.",
      wrongNote: "Not the envelope you just filled. The referral card is the real answer for an actual emergency — point them there.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.4, FPC_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 7, base: "#6b7570", base2: "#616b66", seam: "rgba(28,36,32,0.4)",
    }), { repeat: 5, px: 320 });
    const floor = box(g, 5.8, 0.018, 5.2, 0, 0.01, -0.3, 0x6b7570, { rough: 0.95, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.95, metal: 0.02, color: 0x6b7570 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#b9c2b8", base2: "#adb6ac", seam: "rgba(60,72,64,0.3)",
    }), { repeat: 3, px: 320 });
    const backWall = box(g, 6.0, 2.9, 0.12, 0, 1.45, -2.9, 0xb9c2b8, { rough: 0.9 });
    backWall.material = texturedMat(wallTex, { rough: 0.9, metal: 0.02, color: 0xb9c2b8 });
    decal(g, 2.2, 0.2, 0, 2.65, -2.83, signFace("WELLNESS RESOURCE CENTRE — FINANCIAL COACHING", { bg: "#0c1a24", accent: FPC_CSS, scale: 0.3 }), { px: 512 });

    // Sign-in desk.
    const desk0 = group(g, -1.6, 0, -1.0);
    slab(desk0, 1.0, 0.05, 0.5, 0, 0.72, 0, 0x6b5a48, { radius: 0.02, rough: 0.6 });
    decal(desk0, 0.5, 0.2, 0, 0.75, 0.05, paperFace("COACHING SIGN-IN", ["Name · time", "1. ______"], { bg: "#f6f3ea", band: "#3f7a66" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(desk0, "sign-in", 0, 0.94, 0.05, { css: FPC_CSS, w: 0.26 });
    reg2(desk0, "wp-fp-signin-desk");

    // Coaching desk: orientation packet, direct deposit form, confidence dial.
    const desk = group(g, 0.4, 0, -1.4);
    slab(desk, 1.6, 0.05, 0.7, 0, 0.74, 0, 0x7a6048, { radius: 0.02, rough: 0.6 });
    for (const sx of [-1, 1]) box(desk, 0.06, 0.72, 0.5, sx * 0.75, 0.37, 0, 0x4a3a2a, { rough: 0.6 });
    const packet = decal(desk, 0.5, 0.6, -0.4, 0.775, 0.05, paperFace("FIRST-PAYCHECK PACKET", [
      "Direct deposit form enclosed", "Benefits enrollment: 30 days", "Health · Retirement · Beneficiary",
    ], { bg: "#f6f3ea", band: "#3f7a66" }), { px: 320 });
    packet.rotation.x = -Math.PI / 2;
    reg2(packet, "wp-fp-orientation-packet");
    const confidenceDial = instrument(desk, 0.65, 0.02, 0.1, { idle: "-/10", color: FPC_ACCENT, ry: -0.2 });
    holoTag(confidenceDial, "confidence", 0, 0.18, 0, { css: FPC_CSS, w: 0.26 });
    reg2(confidenceDial, "wp-fp-confidence-dial");
    const hunchMark = box(desk, 0.3, 0.02, 0.2, -0.1, 0.775, 0.25, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(desk, "clipboard on your knee?", -0.1, 0.86, 0.25, { css: "#f0645b", w: 0.4 });
    reg2(hunchMark, "wp-fp-worksheet-hunch");

    // Direct deposit sequence, on a stand.
    const ddStand = group(g, -1.6, 0, -0.3);
    cyl(ddStand, 0.02, 0.02, 1.1, 0, 0.55, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
    const DD = [["wp-fp-dd-numbers", "1 — verify numbers", 0.36], ["wp-fp-dd-voided-check", "2 — voided check", 0.62], ["wp-fp-dd-submit", "3 — submit", 0.88]];
    for (const [id, label, y] of DD) {
      const bead = box(ddStand, 0.05, 0.05, 0.05, 0, y, 0, FPC_ACCENT, { emissive: FPC_ACCENT, ei: 1.2, rough: 0.4 });
      holoTag(ddStand, label, 0.2, y, 0, { css: FPC_CSS, w: 0.34 });
      reg2(bead, id);
    }

    // Benefits packet board with the three items.
    const benefits = group(g, -1.8, 1.5, -2.6, 0.4);
    slab(benefits, 1.0, 0.9, 0.03, 0, -0.45, 0, 0x2a3036, { radius: 0.02, rough: 0.6 });
    const BEN = [["wp-fp-benefits-health", -0.3, "HEALTH PLAN — no election"], ["wp-fp-benefits-retirement", 0, "RETIREMENT PLAN — no election"], ["wp-fp-benefits-beneficiary", 0.3, "BENEFICIARY — not named"]];
    for (const [id, y, label] of BEN) {
      const p = decal(benefits, 0.9, 0.22, 0, y, 0.02, paperFace(label, [""], { bg: "#f6f3ea", band: "#c0322b" }), { px: 256 });
      reg2(p, id);
    }
    holoTag(benefits, "benefits packet", 0, 0.5, 0.02, { css: FPC_CSS, w: 0.3 });

    // Deadline cards: one correct, two wrong.
    const deadline = group(g, 1.6, 0.9, -1.2, -0.4);
    const deadlineCard = (id, y, label, css) => {
      const c = decal(deadline, 0.6, 0.16, 0, y, 0, signFace(label, { bg: "#0c1a24", accent: css, scale: 0.26 }), { px: 256, glow: true, ei: 0.6, transparent: true });
      reg2(c, id);
    };
    deadlineCard("wp-fp-deadline-correct", 0.16, "30 DAYS FROM HIRE — PER THE PACKET", FPC_CSS);
    deadlineCard("wp-fp-deadline-wrong-1", -0.02, "ANY TIME — NO DEADLINE", "#f0645b");
    deadlineCard("wp-fp-deadline-wrong-2", -0.2, "90 DAYS — LIKE MY LAST JOB", "#f0645b");
    holoTag(deadline, "when does enrollment close?", 0, 0.34, 0, { css: FPC_CSS, w: 0.5 });

    // Budget slider, savings cash and envelope, reminder dial.
    const budgetSlider = instrument(g, 0.9, 0.9, 0.3, { idle: "BUDGET", color: FPC_ACCENT, w: 0.2, d: 0.24, ry: -0.3 });
    holoTag(budgetSlider, "needs · savings", 0, 0.2, 0, { css: FPC_CSS, w: 0.36 });
    reg2(budgetSlider, "wp-fp-budget-slider");
    const savingsCash = group(g, 0.4, 0.75, 0.6, 0.2);
    box(savingsCash, 0.14, 0.02, 0.08, 0, 0, 0, 0x3f7a45, { rough: 0.6 });
    holoTag(savingsCash, "savings portion", 0, 0.12, 0, { css: FPC_CSS, w: 0.3 });
    reg2(savingsCash, "wp-fp-savings-cash");
    const envelope = box(g, 0.3, 0.2, 0.05, 1.0, 0.85, 0.6, 0xe8dcc0, { rough: 0.7 });
    holoTag(g, "emergency fund envelope", 1.0, 1.0, 0.6, { css: FPC_CSS, w: 0.36 });
    reg2(box(g, 0.3, 0.2, 0.15, 1.0, 0.85, 0.6, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-fp-savings-envelope");
    void envelope;
    const reminderDial = group(g, 1.6, 0.9, 0.3, -0.5);
    cyl(reminderDial, 0.06, 0.06, 0.03, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(reminderDial, "reminder dial", 0, 0.14, 0, { css: FPC_CSS, w: 0.28 });
    reg2(reminderDial, "wp-fp-reminder-dial");

    // Forms tray, HR window, referral card, log, check-in board.
    const formsTray = box(g, 0.3, 0.04, 0.24, 1.3, 0.76, -1.2, 0x3f6f7a, { rough: 0.6 });
    holoTag(g, "submission tray", 1.3, 0.9, -1.2, { css: FPC_CSS, w: 0.3 });
    reg2(formsTray, "wp-fp-forms-tray");
    const hrWindow = group(g, 2.4, 0, -1.6);
    box(hrWindow, 0.9, 0.55, 0.02, 0, 1.45, 0, 0x7f9aa8, { rough: 0.2, opacity: 0.55, transparent: true });
    decal(hrWindow, 0.7, 0.12, 0, 1.86, 0.02, signFace("HR WINDOW", { bg: "#1f2a36", accent: FPC_CSS, scale: 0.5 }), { px: 224 });
    reg2(box(hrWindow, 0.9, 0.55, 0.1, 0, 1.4, 0.06, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-fp-hr-window");
    const referralCard = decal(g, 0.4, 0.24, 2.0, 0.78, 0.6, paperFace("CASE MANAGER — real emergencies", [""], { bg: "#f6f3ea", band: "#3f7a66" }), { px: 224 });
    referralCard.rotation.x = -Math.PI / 2;
    holoTag(g, "case manager referral", 2.0, 0.92, 0.6, { css: FPC_CSS, w: 0.34 });
    reg2(referralCard, "wp-fp-referral-card");
    const checkinBoard = holoPanel(g, 0.46, 0.3, -0.4, 1.75, 2.0, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fd1ff"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#dceff7"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("HOW IS THE WEEK GOING?", w / 2, h * 0.5);
    }, { ry: 0.3, accent: 0x4fd1ff });
    reg2(checkinBoard, "wp-fp-checkin-board");
    const logBoard = decal(g, 0.4, 0.2, -0.9, 0.78, -0.3, paperFace("FIRST-PAYCHECK LOG", ["Benefits: ____", "Savings: ____"], { bg: "#f6f3ea", band: "#3f7a66" }), { px: 224 });
    logBoard.rotation.x = -Math.PI / 2;
    holoTag(g, "first-paycheck log", -0.9, 0.92, -0.3, { css: FPC_CSS, w: 0.3 });
    reg2(logBoard, "wp-fp-firstcheck-log");

    // Space heater cord, stuffy vent, panicking client, coach.
    const cord = cyl(g, 0.015, 0.015, 1.6, -0.4, 0.01, 0.2, 0x1c1f23, { rough: 0.6, seg: 8 });
    cord.rotation.z = Math.PI / 2;
    holoTag(g, "heater cord across the floor?", -0.4, 0.15, 0.2, { css: "#f0645b", w: 0.4 });
    reg2(cord, "wp-fp-cord-trip");
    const vent = box(g, 0.4, 0.25, 0.15, 0, 2.5, -2.8, 0xc9ced2, { rough: 0.6, metal: 0.3 });
    holoTag(g, "front room warm — open the door?", 0, 2.75, -2.8, { css: "#f0645b", w: 0.42 });
    reg2(vent, "wp-fp-stuffy-centre");
    const panicker = seatedFigure(g, 1.9, 0.46, -0.2, { ry: 1.0, cloth: 0x5a6a3a });
    holoTag(panicker.torso, "breathing fast — get the coach?", 0, 1.0, 0.12, { css: "#f0645b", w: 0.46 });
    reg2(box(g, 0.5, 1.1, 0.5, 1.9, 0.9, -0.2, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-fp-panic-client");
    const coach = seatedFigure(g, 0.4, 0.46, -1.85, { ry: 3.0, cloth: 0x3f6b7a, skin: 0x6b4a33 });
    holoTag(coach.torso, "financial coach", 0, 1.3, 0.12, { css: FPC_CSS, w: 0.3 });
    reg2(box(g, 0.5, 1.2, 0.5, 0.4, 1.0, -1.85, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-fp-coach");

    const hrLamp = ownMaterial(box(hrWindow, 0.08, 0.08, 0.04, 0.36, 1.86, 0.02, 0x3a4048, { rough: 0.4 }));
    const referralLamp = ownMaterial(box(referralCard.parent ?? g, 0.02, 0.02, 0.02, 2.0, 0.95, 0.6, 0xf2c14b, { rough: 0.5, emissive: 0xf2c14b, ei: 0 }));

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.2, 1.2, -1.0),

      onStepComplete(step) {
        if (step.id === "savings-envelope") savingsCash.position.set(1.0, 0.9, 0.6);
        if (step.id === "book-deadline-reminder") reminderDial.rotation.y += Math.PI;
        if (step.id === "close-log") repaint(logBoard, paperFace("FIRST-PAYCHECK LOG", ["Benefits: elected", "Savings: moved"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "wp-fp-payroll-scam-call") hrLamp.material.emissiveIntensity = 1.4;
        if (it.id === "wp-fp-loan-request") referralLamp.material.emissiveIntensity = 1.4;
      },
      onInterruptEnd(it) {
        if (it.id === "wp-fp-payroll-scam-call") hrLamp.material.emissiveIntensity = 0;
        if (it.id === "wp-fp-loan-request") referralLamp.material.emissiveIntensity = 0;
      },

      onHazard() {},

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "confidence-gauge") {
          const ok = gg.t >= 0.4 && gg.t <= 0.7;
          repaint(confidenceDial.userData.screen, signFace(`${Math.round(1 + gg.t * 9)}/10`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "budget-track") {
          const ok = tr.v >= 0.36 && tr.v <= 0.66;
          repaint(budgetSlider.userData.screen, signFace(ok ? "BALANCED" : tr.v < 0.36 ? "NEEDS SHORT" : "NO SAVINGS", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.3 }));
        }
        void t; void dt;
      },
    };
  },
};
