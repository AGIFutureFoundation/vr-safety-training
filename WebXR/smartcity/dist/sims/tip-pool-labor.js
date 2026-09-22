import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, group, decal, repaint, signFace, paperFace,
  seatedFigure, standingPerson, mat, counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Tip Pool & Labor VR — Culinary & Hospitality, bartending series.
// Closing paperwork at a union bar: the jar counted in the open, the card
// tips pulled off the POS, a lawful pool split between the people who
// actually work the rail, the breaks and the split shift entered honestly,
// and the steward and the grievance step standing behind all of it the
// moment a manager's hand goes where it does not belong. Nothing here is
// about pouring a drink — it is about the paycheck the drink pays for.

const TPL_ACCENT = 0xf2c14b;

export const SIM_TIP_POOL_LABOR = {
  id: "tip-pool-labor",
  index: "143",
  domain: "Hospitality",
  trade: "Bartender — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "California Labor Code §351 (tips are the property of the employee, no employer credit against wages, card tips paid no later than the next regular payday) and §2810.5 wage notice; IWC Wage Order 5 on meal periods, rest periods and the split-shift premium; the UNITE HERE Local 2 contract's tip-pooling and grievance language; the California Labor Commissioner's (DLSE) tip-pooling guidance",
  name: "Tip Pool & Labor",
  title: simTitle("Tip Pool & Labor"),
  tagline: "Closing paperwork behind the bar: the jar counted open, a lawful pool split, breaks and split shift entered straight, and the steward standing behind the sheet",
  accent: TPL_ACCENT,
  accentCss: "#f2c14b",
  parSeconds: 300,
  footprint: 2.2,
  badge: { id: "sheet-signed", name: "Sheet Signed", note: "A full night's tip-out, breaks and split shift closed out clean, with the steward's sign-off on it" },

  game: system({
    name: "House Ledger",
    currency: "TIPS",
    ranks: ["Rail Hand", "Tip-Out Trusted", "Sheet Keeper", "Shop Steward's Right Hand", "Ledger Certified"],
    badges: [
      { id: "open-count", name: "Open Count", note: "The jar counted in the open, clean", test: AWARD.stepClean("jar-count") },
      { id: "no-skim", name: "No Skim", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "dead-centre-split", name: "Dead Centre Split", note: "Tip-out percentage set exactly to the contract figure", test: AWARD.precise(0.75) },
    ],
    challenges: [
      { id: "clean-sheet", name: "Clean Sheet", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "fast-close", name: "Fast Close", note: "Closed out inside 80% of par", test: AWARD.fast(0.8) },
      { id: "six-straight", name: "Six Straight", note: "Six correct actions in a row", test: AWARD.streak(6) },
    ],
  }),

  hazards: {
    "role-manager": "You put the shift manager in the tip pool. Labor Code §351 bars anyone with the authority to hire, fire, discipline or direct the work from taking any share of the tips their staff earned, no matter how busy the floor was or whether they poured a single drink themselves.",
    "cash-skim": "A folded bill was tucked out of the count before anyone saw the jar. The whole reason the count happens on the bar top in front of whoever is around is that a tip counted where it cannot be seen is a tip somebody can argue never existed — skimming it defeats the one thing that protects the count.",
    "late-card-tips": "That note holds the card tip total over to a later pay period. Labor Code §351 requires card tips to be paid no later than the next regular payday after the card transaction — sitting on them because payroll is easier next month is exactly the delay the statute was written to stop.",
    "break-waiver-blank": "That meal-break waiver is pre-signed and blank, ready to attach to any shift. A waiver is only lawful for a shift of six hours or less, and only when the employee actually agrees to skip that specific break — a standing blank one signs away a right nobody was asked about that day.",
  },

  lateNotes: {
    "tip-scale": "The percentage gets set after the roles are named, not before — you cannot split a pool you have not yet said who is in it.",
    "cash-share-bartenders": "The envelopes come after the percentage is set and committed — dragging cash before the split is decided just moves an unknown number.",
    "cash-share-barback": "The bartenders' share goes into its envelope first — the barback's follows once that split is on the table.",
    "post-board": "The steward reviews the sheet before it goes on the board — posting first and correcting after is the wrong order for the one check meant to catch the mistake before anyone sees it.",
  },

  steps: [
    {
      id: "jar-count", kind: "hold", target: "tip-jar", seconds: 5,
      title: "Count the cash tip jar in the open",
      cue: "Dump the jar on the bar top and hold the count until it is done, where anyone can see it.",
      why: "California Labor Code §351 makes every tip the property of the employees who earned it, never the house's — counting the jar openly on the bar top, not in a back room by yourself, is what keeps that ownership from turning into a dispute nobody can settle afterward.",
      holdBreakNote: "You stopped mid-count. A jar counted halfway and set down is a number nobody else can vouch for — start the count again and carry it through.",
    },
    {
      id: "card-tips", kind: "hold", target: "pos-terminal", seconds: 4,
      title: "Print the card tip report",
      cue: "Hold the report key until the shift's card tip total prints.",
      why: "Card tips run through the point of sale, and §351 requires the employer to pay them out no later than the next regular payday — the printed total is the only record anyone can hold the house to that deadline with, so it comes off the machine before the sheet is built around a guess.",
      holdBreakNote: "The report cut off before the total printed. A partial slip proves nothing — hold it through to the printed figure.",
    },
    {
      id: "tip-out-sheet", kind: "select", target: "tip-out-sheet",
      title: "Open tonight's tip-out sheet at the desk",
      cue: "Carry the counted totals to the back office and open the sheet.",
      why: "A tip-out sheet is a written record of who got what and why, made the same night the money moved — it is what turns 'I think that's right' into something the Labor Commissioner, the steward or a skeptical barback can actually check.",
    },
    {
      id: "eligible-roles", kind: "sequence", anyOrder: true,
      targets: ["role-bartender", "role-barback", "role-busser"],
      itemNames: { "role-bartender": "bartenders", "role-barback": "barbacks", "role-busser": "bussers" },
      title: "Name who lawfully shares the pool",
      cue: "Tag every role that actually works the service chain — nobody with authority over the floor belongs on this board.",
      why: "A lawful pool is limited to people in the chain of service who do not direct or discipline anyone else's work — bartenders, barbacks and bussers all touch the same tables the tip came from. The moment someone with hiring or firing authority is added, the whole pool is unlawful, not just their share of it.",
    },
    {
      id: "tip-out-percent", kind: "gauge", target: "tip-scale",
      title: "Set the barback tip-out to the contract percentage",
      cue: "Watch the dial and commit the moment it lands on the figure the contract sets.",
      why: "The percentage a bartender tips out to the barback is written into the Local 2 contract, not decided at the bar on a busy night — setting it anywhere off that figure shorts one of them and is exactly the kind of thing a steward's review exists to catch before it becomes a pattern.",
      gauge: { label: "TIP-OUT %", speed: 0.7, green: [0.28, 0.36], readout: (t) => `${Math.round(t * 40)}%`, missNote: "Off the contract figure. Set it again and commit only when the dial reads the percentage the contract actually calls for." },
    },
    {
      id: "split-bartenders", kind: "drag", target: "cash-share-bartenders",
      title: "Drag the bartenders' share into their envelope",
      cue: "Carry the counted stack to the envelope marked for the bartenders.",
      why: "Each share goes into its own envelope the same night it is counted, labelled for the people it belongs to — a sheet that says who got what is only honest if the cash it describes actually moved that way.",
      drag: { to: "envelope-bartenders", radius: 0.4, missNote: "Not lined up with the bartenders' envelope — carry it fully into the slot before letting go." },
    },
    {
      id: "split-barback", kind: "drag", target: "cash-share-barback",
      title: "Drag the barback's share into their envelope",
      cue: "Carry the barback's cut, set by the gauge, into their envelope.",
      why: "The barback's envelope gets exactly the percentage the contract sets, no more and no less — the same open handling that protects the bartenders' share is the only thing that protects theirs, since they are rarely the one holding the jar.",
      drag: { to: "envelope-barback", radius: 0.4, missNote: "Not lined up with the barback's envelope — bring it fully into the slot before letting go." },
    },
    {
      id: "sched-review", kind: "find", noHint: true,
      targets: ["sched-split-shift", "sched-rest-break"],
      itemNames: { "sched-split-shift": "an unpaid split shift with no premium noted", "sched-rest-break": "a rest break never logged" },
      itemNotes: {
        "sched-split-shift": "A shift broken by more than an hour of unpaid time between the lunch rush and the dinner rush is a split shift under Wage Order 5, and it earns a premium the schedule has to show, not assume.",
        "sched-rest-break": "A ten-minute paid rest break for every four hours worked is required whether or not the floor was slow enough to notice it was skipped — an unlogged one is not proof it happened.",
      },
      title: "Read tonight's schedule before you sign off on it",
      cue: "Two problems are sitting in the schedule sheet. Find them before the paperwork goes up.",
      why: "The sheet is only as honest as the schedule it is built from — a split shift with no premium and a rest break nobody logged are both wage claims waiting to happen, and they are far cheaper to fix tonight than after a pay period has already gone out wrong.",
    },
    {
      id: "meal-break", kind: "select", target: "time-clock-meal",
      title: "Confirm the meal break actually punched",
      cue: "Check the time clock shows a real thirty-minute meal punch before the fifth hour.",
      why: "Labor Code §512 and Wage Order 5 require an unpaid thirty-minute meal period starting before the end of the fifth hour worked — a shift that ran through it owes a full hour of premium pay, and the only proof either way is the actual punch on the clock, not what anyone remembers.",
    },
    {
      id: "split-shift-premium", kind: "select", target: "split-shift-line",
      title: "Enter the split-shift premium on the timesheet",
      cue: "Add the extra hour the schedule check found.",
      why: "Wage Order 5 owes one additional hour at minimum wage for a shift split by an unpaid break of more than an hour — leaving it off the timesheet does not make the shift not a split shift, it just means the paycheck is short until somebody catches it.",
    },
    {
      id: "lock-safe", kind: "turn", target: "safe-dial",
      title: "Lock tonight's proceeds in the safe",
      cue: "Spin the dial through a full turn to set the lock once every envelope is filled.",
      why: "Once the split is bagged, the night's cash goes into the safe under dual control rather than sitting in an unlocked desk drawer between now and the morning drop — the count you just made is only as good as where it spends the rest of the night.",
      turn: { turns: 1, axis: "y", label: "SAFE DIAL" },
    },
    {
      id: "steward-notify", kind: "select", target: "steward-phone",
      title: "Call the shop steward before the sheet is posted",
      cue: "Call the steward to review the split before anyone else sees it.",
      why: "The Local 2 contract puts a steward's review between the counting and the posting for exactly this reason — a mistake caught on a phone call costs nobody anything, and one caught after the sheet is already on the wall is a grievance instead.",
    },
    {
      id: "grievance-form", kind: "select", target: "grievance-log",
      title: "Log the grievance step for the manager's hand in the jar",
      cue: "Open the grievance log and record tonight's interruption by name, time and what was taken.",
      why: "A manager's hand in the tip jar is a contract violation the grievance procedure exists to answer, on top of whatever §351 already says — a written entry tonight, while everyone remembers it the same way, is what a shop steward actually has to work with at Step One.",
    },
    {
      id: "post-sheet", kind: "select", target: "post-board",
      title: "Post the signed tip-out sheet",
      cue: "Pin the finished, steward-reviewed sheet where the whole shift can check it.",
      why: "A tip-out sheet nobody but the closer ever sees is a ledger the crew has to take on faith. Posted where everyone can check their own math, it is the difference between a night that was split fairly and a night everyone was simply told was split fairly.",
    },
  ],

  interrupts: [
    {
      id: "manager-reach",
      kind: "Manager taking from the pool",
      after: "jar-count", delay: 3, seconds: 12,
      alert: "The shift manager's hand is in the tip jar behind you — he says he's only grabbing quarters to make change for the register.",
      cue: "Ring him off. Do not go back to the jar yourself.",
      target: "call-out-manager",
      why: "Whatever the reason given, a manager's hand in the pool is the exact thing §351 and the contract both forbid — the response is calling him off in the moment, in front of whoever is around, not quietly finishing the count around him and sorting it out later.",
      missNote: "The hand stayed in the jar the whole time and nobody said a word. A skim that goes unchallenged in the moment is a skim that happened, whatever gets sorted out on paper afterward.",
      wrongNote: "That is not the response. Call him off — reaching into the jar yourself to check what he took only puts a second hand where one already should not have been.",
    },
    {
      id: "grat-dispute",
      kind: "Customer disputing a charge",
      after: "card-tips", delay: 3, seconds: 12,
      alert: "The table of six from the corner is at the bar, insisting the 20% gratuity on their bill is a mistake they never agreed to.",
      cue: "Pull up the printed disclosure, not the register override.",
      target: "check-copy",
      why: "An auto-gratuity on a party this size is disclosed on the menu the table already ordered from, and showing them the printed line is the whole answer — it is a service charge policy applied correctly, not a bartender's mistake to apologise the cost of away.",
      missNote: "The dispute went unanswered while the count kept running. A party left believing they were overcharged, with nothing shown to them that says otherwise, is a chargeback and a bad review nobody had to earn.",
      wrongNote: "Not the register. Pulling up the printed disclosure proves the charge was policy, not a keystroke — voiding it without showing them that trains every future table that arguing works.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, TPL_ACCENT);

    // -------------------------------------------------------------- the bar
    // The room's own back bar sits at z≈-4.45 with the bar top counter at
    // z≈-2.05..-1.7 (see interiors.js backBar) — this station dresses that
    // counter and the staff alley behind it rather than rebuilding either.
    const jarGroup = group(g, -3.4, 1.12, -2.05);
    cyl(jarGroup, 0.11, 0.1, 0.22, 0, 0.11, 0, 0xdfe9ea, { rough: 0.15, metal: 0.05, opacity: 0.35, transparent: true });
    for (let i = 0; i < 6; i++) {
      box(jarGroup, 0.07, 0.012, 0.03, (Math.random() - 0.5) * 0.1, 0.05 + i * 0.018, (Math.random() - 0.5) * 0.1,
        i % 2 ? 0x2f7d4f : 0x3c6e46, { rough: 0.7, cast: false }).rotation.y = Math.random() * 3;
    }
    holoTag(jarGroup, "Tip jar", 0, 0.34, 0, { css: "#f2c14b", w: 0.24 });
    reg(hits, jarGroup, "tip-jar");
    const skim = box(g, 0.06, 0.008, 0.03, -3.1, 1.09, -1.98, 0x2f7d4f, { rough: 0.7 });
    skim.rotation.set(0.1, 0.4, 0);
    reg(hits, skim, "cash-skim");

    const posGroup = group(g, -2.6, 1.12, -2.05);
    box(posGroup, 0.2, 0.16, 0.14, 0, 0.08, 0, 0x2b3138, { rough: 0.5, metal: 0.2 });
    const posScreen = decal(posGroup, 0.16, 0.1, 0, 0.2, 0.071, signFace("REPORT", { bg: "#0d1c24", accent: "#f2c14b", scale: 0.55 }), { glow: true, ei: 0.7 });
    reg(hits, posGroup, "pos-terminal");
    const lateNote = decal(g, 0.22, 0.14, -2.35, 1.22, -2.02,
      paperFace("HOLD", ["Card tips —", "next month's run"], { bg: "#f4e9d8", band: "#b81410" }), { px: 128 });
    lateNote.rotation.x = -0.3;
    reg(hits, lateNote, "late-card-tips");

    // Speed rail and back-bar dressing for the well — atmosphere, not controls.
    const RAIL_TONES = [0x7a3a2c, 0x2c5a3a, 0x5a4a7a, 0x9a8a5a];
    for (let i = 0; i < 10; i++) {
      lathe(g, [[0.001, 0], [0.045, 0.01], [0.045, 0.22], [0.03, 0.27], [0.018, 0.34], [0.018, 0.37], [0.001, 0.375]],
        -4.6 + i * 0.32, 0, -3.55, RAIL_TONES[i % RAIL_TONES.length], { rough: 0.25, metal: 0.05, seg: 10 });
    }

    // The manager, working the well, with an arm rigged to reach.
    const manager = standingPerson(g, -3.4, -3.35, { cloth: 0x2b3a55, legs: 0x1c2536, hiVis: false, skin: 0xcaa07c });
    manager.root.rotation.y = 0;
    const mgrArm = manager.arms[1];
    const bell = group(g, -1.9, 0, -2.35);
    cyl(bell, 0.06, 0.07, 0.05, 0, 1.15, 0, 0xdfae4a, { rough: 0.3, metal: 0.85, seg: 16 });
    ball(bell, 0.012, 0, 1.19, 0, 0xdfe4e8, { rough: 0.3, metal: 0.9 });
    holoTag(bell, "Call-out bell", 0, 1.3, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, bell, "call-out-manager");

    // Bar stools and two ambient customers at the rail.
    for (const x of [-0.4, 0.5, 1.5]) {
      const stool = group(g, x, 0, -1.15);
      cyl(stool, 0.16, 0.16, 0.05, 0, 0.62, 0, 0x3c2c22, { rough: 0.6, seg: 14 });
      cyl(stool, 0.03, 0.03, 0.6, 0, 0.31, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
      cyl(stool, 0.17, 0.17, 0.03, 0, 0.02, 0, 0x2b3138, { rough: 0.5, seg: 14 });
    }
    seatedFigure(g, -0.4, 0.66, -1.05, { cloth: 0x4a5f6b, ry: Math.PI });
    seatedFigure(g, 1.5, 0.66, -1.05, { cloth: 0x6b4a4a, ry: Math.PI });

    // The disputing party of six at their table, and the printed check.
    const party = group(g, 1.5, 0, 0.9);
    cyl(party, 0.58, 0.58, 0.06, 0, 0.74, 0, 0x3d2a1e, { rough: 0.4, metal: 0.1, seg: 20 });
    cyl(party, 0.06, 0.06, 0.72, 0, 0.37, 0, 0x2b211c, { rough: 0.6, seg: 12 });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      seatedFigure(party, Math.sin(a) * 0.72, 0.5, Math.cos(a) * 0.72, {
        cloth: [0x4a6b5f, 0x6b5a4a, 0x5a4a6b][i], ry: a + Math.PI,
      });
    }
    const checkCopy = decal(g, 0.26, 0.34, -2.1, 1.28, -2.1,
      paperFace("GUEST CHECK", ["Party of 6", "Auto-grat 20% — per menu", "See posted policy"], { bg: "#f2efe6", band: "#22303c" }), { px: 160 });
    checkCopy.rotation.x = -0.2;
    checkCopy.visible = false;
    reg(hits, checkCopy, "check-copy");
    const policyPlacard = decal(g, 0.3, 0.16, -1.75, 1.55, -2.15,
      signFace("GRATUITY DISCLOSED — MENU", { bg: "#22303c", accent: "#f2c14b", scale: 0.4 }), { px: 220 });
    policyPlacard.visible = false;

    // ------------------------------------------------------------ back office
    const desk = counter(g, 1.3, 0.7, 3.1, 2.3, 0x3a2f28, { height: 0.82, ry: -0.5 });
    void desk;
    cabinet(g, 0.9, 1.1, 0.4, 4.0, 0.55, 1.55, 0x352a22, { doorColor: 0x2b211c, ry: -0.5 });

    const sheetPanel = holoPanel(g, 0.56, 0.4, 2.65, 1.65, 2.55, (cx, w, h) => {
      cx.fillStyle = "rgba(20,14,4,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fde9c9";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("TIP-OUT SHEET — TONIGHT", w * 0.06, h * 0.16);
      cx.fillStyle = "#d8c39a";
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Jar + card total, counted open", "Bartenders / Barback split", "Steward reviewed before posting"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.38 + i * h * 0.16));
    }, { ry: -0.5 });
    reg(hits, sheetPanel, "tip-out-sheet");

    // Eligible-roles corkboard.
    const board = group(g, 3.6, 1.55, 2.9, -0.5);
    box(board, 0.7, 0.5, 0.03, 0, 0, 0, 0x6b5238, { rough: 0.85, finish: "concrete", tile: [2, 2] });
    const ROLE_TAGS = [
      ["role-bartender", "Bartender", -0.22, 0.14, 0x59c97b],
      ["role-barback", "Barback", 0.22, 0.14, 0x59c97b],
      ["role-busser", "Busser", -0.22, -0.14, 0x59c97b],
      ["role-manager", "Manager", 0.22, -0.14, 0xf0645b],
    ];
    for (const [id, label, x, y, tone] of ROLE_TAGS) {
      const tag = decal(board, 0.28, 0.18, x, y, 0.02, signFace(label, { bg: "#1b140c", accent: `#${tone.toString(16)}`, scale: 0.5 }), { px: 160 });
      reg(hits, tag, id);
    }

    // Tip-out percentage gauge.
    const scale = instrument(g, 3.6, 0.9, 2.55, { idle: "-- %", color: TPL_ACCENT, ry: -0.5 });
    holoTag(scale, "Tip-out %", 0, 0.17, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, scale, "tip-scale");

    // Envelope pigeonholes for the split — Bartenders / Barback / Manager.
    const pigeon = group(g, 2.35, 0.86, 3.15, -0.5);
    box(pigeon, 0.7, 0.32, 0.16, 0, 0, 0, 0x2b211c, { rough: 0.6 });
    const ENV = [
      ["envelope-bartenders", -0.22, 0x59c97b], ["envelope-barback", 0, 0x59c97b], ["envelope-manager", 0.22, 0xf0645b],
    ];
    for (const [id, x, tone] of ENV) {
      const slot = box(pigeon, 0.18, 0.22, 0.02, x, 0.02, 0.09, 0xece3d0, { rough: 0.6 });
      decal(pigeon, 0.16, 0.05, x, -0.1, 0.101, signFace(id.replace("envelope-", "").toUpperCase(), { bg: "#1b140c", accent: `#${tone.toString(16)}`, scale: 0.6 }), { px: 96 });
      reg(hits, slot, id);
    }
    if (!hits["role-manager"]) reg(hits, pigeon, "role-manager");

    // Cash shares waiting to be dragged into the right envelope.
    const cashBar = group(g, 2.9, 0.86, 2.55);
    box(cashBar, 0.14, 0.03, 0.09, 0, 0, 0, 0x2f7d4f, { rough: 0.7 });
    reg(hits, cashBar, "cash-share-bartenders");
    const cashBack = group(g, 2.9, 0.86, 2.7);
    box(cashBack, 0.09, 0.02, 0.07, 0, 0, 0, 0x2f7d4f, { rough: 0.7 });
    reg(hits, cashBack, "cash-share-barback");

    // Schedule sheet with the two flagged problems.
    const schedule = decal(g, 0.44, 0.34, 4.35, 1.35, 2.95,
      paperFace("SCHEDULE", ["Tue: 11-3 / 5-11 — no premium noted", "Rest breaks: —"], { bg: "#f2efe6", band: "#22303c" }), { px: 220, ry: -0.5 });
    schedule.rotation.y = -0.5;
    const splitFlag = box(g, 0.03, 0.03, 0.01, 4.55, 1.44, 3.0, 0xf0645b, { emissive: 0xf0645b, ei: 1.3, cast: false });
    reg(hits, splitFlag, "sched-split-shift");
    const restFlag = box(g, 0.03, 0.03, 0.01, 4.2, 1.28, 2.85, 0xf0645b, { emissive: 0xf0645b, ei: 1.3, cast: false });
    reg(hits, restFlag, "sched-rest-break");

    // Time clock and the pre-signed waiver hazard beside it.
    const clock = group(g, 1.6, 1.3, 3.55, -0.5);
    box(clock, 0.22, 0.28, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const clockFace = decal(clock, 0.16, 0.12, 0, 0.05, 0.051, signFace("11:52", { bg: "#0d1c24", accent: "#59c97b", scale: 0.5 }), { glow: true, ei: 0.7 });
    void clockFace;
    reg(hits, clock, "time-clock-meal");
    const waiver = decal(g, 0.2, 0.14, 1.85, 1.05, 3.5,
      paperFace("MEAL WAIVER", ["(blank) ______", "Pre-signed"], { bg: "#f4e9d8", band: "#b81410" }), { px: 128, ry: -0.5 });
    waiver.rotation.y = -0.5;
    reg(hits, waiver, "break-waiver-blank");

    // Split-shift premium line on the timesheet ledger.
    const ledger = decal(g, 0.34, 0.22, 3.15, 0.95, 3.35,
      paperFace("TIMESHEET", ["Reg hours ......... 8.0", "Split-shift premium — ADD"], { bg: "#f2efe6", band: "#22303c" }), { px: 200, ry: -0.5 });
    ledger.rotation.y = -0.5;
    reg(hits, ledger, "split-shift-line");

    // The safe.
    const safe = group(g, 4.3, 0, 2.35, 0.3);
    box(safe, 0.5, 0.6, 0.5, 0, 0.3, 0, 0x2a2e33, { rough: 0.5, metal: 0.5 });
    const dial = cyl(safe, 0.07, 0.07, 0.03, 0, 0.35, 0.26, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 16 });
    dial.rotation.x = Math.PI / 2;
    holoTag(safe, "Safe", 0, 0.68, 0, { css: "#f2c14b", w: 0.2 });
    reg(hits, dial, "safe-dial");

    // Steward's phone and the grievance log.
    const phone = group(g, 3.9, 0, 3.3, -0.5);
    box(phone, 0.1, 0.16, 0.04, 0, 0.85, 0, 0x2b3138, { rough: 0.5 });
    holoTag(phone, "Call the steward", 0, 0.97, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, phone, "steward-phone");
    const grievanceBox = group(g, 4.35, 0, 3.6, -0.5);
    box(grievanceBox, 0.3, 0.06, 0.22, 0, 0.86, 0, 0x8b402f, { rough: 0.6 });
    holoTag(grievanceBox, "Grievance log", 0, 0.93, 0, { css: "#f0a35b", w: 0.32 });
    reg(hits, grievanceBox, "grievance-log");

    // Post board out front where the whole shift walks past it.
    const postBoard = group(g, -1.0, 1.5, 3.0);
    box(postBoard, 0.6, 0.42, 0.03, 0, 0, 0, 0x6b5238, { rough: 0.85, finish: "concrete", tile: [2, 2] });
    const postFace = decal(postBoard, 0.5, 0.32, 0, 0, 0.02, paperFace("POSTED", ["Tonight's tip-out —", "signed"], { bg: "#f2efe6", band: "#22303c" }), { px: 200 });
    void postFace;
    reg(hits, postBoard, "post-board");

    standingFigure(g, -4.8, 3.2, { ry: 0.6, cloth: 0x37505f, vest: TPL_ACCENT });

    let mgrReaching = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.3, -1.0),

      onStepComplete(step) {
        if (step.id === "eligible-roles") { /* board stays lit */ }
        if (step.id === "tip-out-percent") repaint(scale.userData.screen, signFace("SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.55 }));
        if (step.id === "split-bartenders") { cashBar.position.set(2.35 - 0.22, 0.02, 3.15 + 0.09); }
        if (step.id === "split-barback") { cashBack.position.set(2.35, 0.02, 3.15 + 0.09); }
        if (step.id === "lock-safe") { dial.rotation.y = Math.PI * 2; }
      },

      onInterrupt(it) {
        if (it.id === "manager-reach") {
          mgrReaching = true;
          mgrArm.shoulder.rotation.x = -1.5;
          mgrArm.shoulder.rotation.z = -0.3;
          mgrArm.fore.rotation.x = -0.4;
        }
        if (it.id === "grat-dispute") {
          checkCopy.visible = true;
          policyPlacard.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "manager-reach") {
          mgrReaching = false;
          mgrArm.shoulder.rotation.x = 0;
          mgrArm.shoulder.rotation.z = 0;
          mgrArm.fore.rotation.x = 0;
        }
        if (it.id === "grat-dispute") {
          repaint(checkCopy, paperFace("GUEST CHECK", ["Party of 6", "Auto-grat 20% — per menu", "Shown to guest — resolved"], { bg: "#f2efe6", band: "#22303c" }));
        }
      },

      onHazard(hitId) {
        if (hitId === "role-manager") pigeon.children[2]?.material && (pigeon.children[2].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2, rough: 0.5 }));
      },

      animate(t) {
        if (mgrReaching) manager.arms[1].fore.position.y = -0.3 + Math.sin(t * 4) * 0.01;
        void t;
      },
    };
  },
};
