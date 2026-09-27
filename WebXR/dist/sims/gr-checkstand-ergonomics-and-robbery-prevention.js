import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat, counter,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, tileFace, safetyStripeFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Checkstand Ergonomics & Robbery Prevention VR — Culinary &
// Hospitality, grocery pack (gr-), station five. A grocery front end where
// the job's real, everyday hazard is a thousand small twists and reaches
// across a shift, not a single dramatic event — so the station spends its
// steps on the stand set to the cashier's own height, a heavy case lifted
// with the legs instead of the back, and a second hand called for before a
// twist ever happens. The robbery-prevention half is exactly as detailed as
// the store's own posted plan and no further: comply, do not chase, and the
// alarm goes after they are gone. No clause invented; the union named only
// as a training body.

const GR5_ACCENT = 0x3fa9c9;

export const SIM_GR_CHECKSTAND_ERGONOMICS_AND_ROBBERY_PREVENTION = {
  id: "gr-checkstand-ergonomics-and-robbery-prevention",
  index: "gr-5",
  domain: "Grocery front end",
  trade: "Cashier / front-end clerk",
  category: "Culinary & Hospitality",
  indoor: "shop",
  certification: "UFCW member training for retail food work; the Revised NIOSH Lifting Equation; OSHA 29 CFR 1910.22 walking-working surfaces; Cal/OSHA's workplace violence prevention plan (8 CCR 3342)",
  name: "Checkstand Ergonomics & Robbery Prevention",
  title: simTitle("Checkstand Ergonomics & Robbery Prevention"),
  tagline: "The stand set to fit the cashier, a heavy case lifted with a second hand instead of a twist, and the store's own robbery plan known cold before it is ever needed",
  accent: GR5_ACCENT,
  accentCss: "#3fa9c9",
  parSeconds: 280,
  footprint: 2.5,
  badge: { id: "shift-set", name: "Shift Set", note: "A full shift set up right at the stand, every lift called for help instead of twisted, and the store's plan known before it was ever needed" },

  game: system({
    name: "Front End Authority",
    currency: "SCAN",
    ranks: ["Courtesy Clerk", "Cashier", "Lead Cashier", "Front End Supervisor", "Front End Authority Certified"],
    badges: [
      { id: "set-first", name: "Set First", note: "Set the stand to fit before the first item ever scanned", test: AWARD.stepClean("stool-height") },
      { id: "no-twist", name: "No Twist", note: "Never twisted at the waist to move a heavy case", test: AWARD.safe },
      { id: "steady-lift", name: "Steady Lift", note: "Every lift held a smooth, controlled pace", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections through the whole shift check-in", test: AWARD.clean },
      { id: "held-the-hold", name: "Held The Hold", note: "Never broke a timed posture check early", test: AWARD.unbroken },
      { id: "shift-fast", name: "Shift Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-under-counter-weapon": "You reached for what's kept under the counter. Nothing at this stand is worth a physical confrontation — the store's plan exists precisely to take that choice off the table before anyone is ever tempted to make it.",
    "chase-customer": "You came out from behind the stand to go after them. Once someone has what they came for, the incident is over — a cashier following a stranger into the parking lot alone turns one problem into a second one, voluntarily.",
    "twist-lift-case": "You twisted at the waist to swing that case off the belt instead of turning your whole body. A twisted lift loads the spine sideways in a way it was never built for — turning your feet first is the entire difference between a heavy case and a strained back.",
    "blocked-exit-cart": "That cart is parked squarely across the front end's marked emergency exit. However full the lane gets, that path stays clear — it is the one route out of this room that does not run past the doors everyone else is using.",
  },

  lateNotes: {
    "panic-button": "The alarm gets pressed after anyone involved has actually left, not while they're still at the counter — trip it too early and a resolved moment turns into something worse.",
  },

  steps: [
    {
      id: "shift-briefing", kind: "select", target: "shift-board",
      title: "Read the front-end shift board",
      cue: "Check your register assignment, your till start, and where the store's safety plan is posted.",
      why: "The board is what tells you which stand is yours before you touch a single control on it, and it is where the store keeps the plan you are about to be trained on — reading it first means neither is a guess later in the shift.",
    },
    {
      id: "stool-height", kind: "turn", target: "stool-adjust",
      title: "Set the stand to fit you",
      cue: "Turn the stool's height adjustment until the belt sits at a neutral working height.",
      why: "The Revised NIOSH Lifting Equation treats the height an object is lifted from as one of the biggest levers on injury risk, and a stand set too low or too high turns every single scan into a small reach that adds up across an eight-hour shift — set once, at the start, it protects every scan after it.",
      turn: { turns: 0.6, axis: "y", label: "STOOL HEIGHT" },
    },
    {
      id: "scan-posture", kind: "hold", target: "scanner", seconds: 6,
      title: "Hold a neutral scanning posture",
      cue: "Scan the practice items keeping your wrist straight and your elbow close, and hold it through the run.",
      why: "A bent wrist repeated a few hundred times a shift is exactly the motion behind a lot of cashiers' own repetitive strain — a straight wrist and an elbow kept in close is the posture that costs nothing per scan and saves a joint over a career.",
      holdBreakNote: "Wrist broke back into the bent position. Reset to a straight wrist and elbow in before the next scan.",
    },
    {
      id: "lift-technique", kind: "track", target: "heavy-case", seconds: 6,
      title: "Lift the case with your legs, at a steady pace",
      cue: "Bend at the knees, keep the case close, and lift at a smooth, controlled rate.",
      why: "A jerked lift asks your back to absorb a spike of force all at once; a smooth, controlled lift lets your legs — the muscles actually built for this — carry the load the whole way instead.",
      track: {
        start: 0.1, green: [0.35, 0.62], rise: 0.5, fall: 0.42, drift: 0.1, label: "LIFT RATE",
        readout: (v) => (v < 0.35 ? "too slow — losing control" : v > 0.62 ? "too fast — jerking the lift" : "smooth and controlled"),
      },
      holdBreakNote: "Out of the smooth band — slow the lift back down before your back takes the spike instead of your legs.",
    },
    {
      id: "call-for-assist", kind: "select", target: "assist-call",
      title: "Call for a second hand on an awkward case",
      cue: "Page for bagging help before this case is lifted alone.",
      why: "A case that is heavy and awkwardly shaped is exactly the load a second pair of hands turns from a twisted reach into a controlled two-person lift — calling for it costs a page, not calling for it can cost a shoulder.",
    },
    {
      id: "walk-frontend", kind: "find", noHint: true,
      targets: ["torn-mat", "cart-on-cord"],
      itemNames: { "torn-mat": "torn anti-fatigue mat", "cart-on-cord": "a cart parked over a floor cord" },
      itemNotes: {
        "torn-mat": "The anti-fatigue mat at this stand is torn and curling at the corner — a mat that catches a heel is one more thing standing between a cashier and a clean shift.",
        "cart-on-cord": "A cart is parked directly over a floor power cord, pinning it flat against the tile where the next person pushing a cart won't see it until they trip on it.",
      },
      decoyNotes: { "spare-till": "The spare till is stored flat and locked. Leave it." },
      title: "Walk the front end before the doors open",
      cue: "Two things at this stand are wrong. Find them by looking.",
      why: "Ergonomics is not only what happens at your own stand — a torn mat or a cord left where a cart can hide it is the same kind of injury waiting on somebody else's shift instead of yours.",
    },
    {
      id: "bag-heavy-light", kind: "sequence",
      targets: ["heavy-item", "light-item"],
      itemNames: { "heavy-item": "canned goods", "light-item": "bread" },
      title: "Bag heavy items first",
      cue: "Bag the canned goods first, then the bread on top — in that order.",
      why: "A bag packed heavy-on-top crushes whatever is underneath and throws its own balance off in a customer's hand — heavy low, light on top is the order that keeps the bag both intact and liftable.",
      outOfOrderNote: "Wrong order — heavy goods go in first, at the bottom, with anything that crushes easily on top.",
    },
    {
      id: "id-check-generic", kind: "select", target: "age-check-scanner",
      title: "Check ID on the age-restricted item",
      cue: "Scan the ID against the register's own prompt before this item rings through.",
      why: "The register's own prompt is what this check runs against, per the store's policy — a cashier who rings it through without checking is the store's own compliance record, not just one transaction.",
    },
    {
      id: "safety-plan-location", kind: "select", target: "panic-button",
      title: "Locate the panic button",
      cue: "Find where the panic button actually is at your stand, per the store's posted plan.",
      why: "Knowing exactly where this is before a shift ever needs it is the entire value of a store's safety plan — a cashier who has to search for it under pressure has already lost the seconds the plan was built to save.",
    },
    {
      id: "till-balance-drag", kind: "drag", target: "till-tray",
      title: "Pull the till for a scheduled balance",
      cue: "Pull the till tray and move it to the secure drop slot for the scheduled mid-shift balance.",
      why: "A scheduled balance keeps cash exposure at this stand capped through the shift instead of building toward one large count at close — the tray goes straight to the secure slot, not set down anywhere in between.",
      drag: { to: "drop-slot", radius: 0.3, missNote: "Not in the drop slot — the till tray goes straight there, not set down on the counter along the way." },
    },
    {
      id: "comply-no-chase", kind: "select", target: "safety-plan-poster",
      title: "Confirm the store's plan: comply, don't chase",
      cue: "Read the posted plan and confirm what it asks of you if a demand for the register happens.",
      why: "The store's own plan asks for exactly one thing in that moment: comply, and do not go after anyone once they have what they came for. Knowing that cold, before it is ever tested, is what keeps the moment from turning into a decision made on adrenaline instead of the plan.",
    },
    {
      id: "alarm-after-they-leave", kind: "select", target: "panic-button",
      title: "Confirm when the alarm gets used",
      cue: "Confirm, per the plan, that the alarm is pressed once anyone involved has actually left — not before.",
      why: "The store's plan times the alarm to after anyone involved is clear, because tripping it while they are still at the counter turns a resolved moment back into a live one, for you and for everyone else still in the store.",
    },
    {
      id: "fatigue-check", kind: "gauge", target: "fatigue-dial",
      title: "Run a mid-shift fatigue self-check",
      cue: "Rate your own posture and fatigue on the dial and commit once it's in the range that calls for a break.",
      why: "A fatigue check partway through a shift is what catches the posture drift that happens gradually — nobody starts a shift slouched or twisting, and the dial is what makes noticing that a deliberate check instead of something only a sore back tells you about tomorrow.",
      gauge: { label: "FATIGUE SELF-CHECK", speed: 0.6, green: [0.55, 0.85], readout: (t) => (t < 0.3 ? "fresh" : t < 0.55 ? "steady" : t < 0.85 ? "time for a break" : "overdue for rotation"), missNote: "Off the useful band — commit somewhere you can honestly read your own posture right now, not at either extreme." },
    },
    {
      id: "sign-closeout", kind: "select", target: "shift-log",
      title: "Sign the shift safety check-in",
      cue: "Sign the log to close out this shift's ergonomics and safety check-in.",
      why: "The signature is the cashier confirming the stand was set right, every heavy lift got called for help instead of twisted, and the plan was read — the record a supervisor checks if this stand's history is ever questioned.",
    },
  ],

  interrupts: [
    {
      id: "coworker-twist-lift",
      kind: "Bad lift about to happen",
      after: "lift-technique", delay: 4, seconds: 12,
      alert: "A coworker at the next stand is about to swing a heavy case off their own belt with a twist at the waist instead of turning their feet.",
      cue: "That's the exact motion this whole lifting technique exists to prevent — and it isn't your case.",
      target: "lift-cart",
      why: "Pointing a coworker at the lift cart instead of letting the twist happen is the same lesson this station just taught you, handed sideways — a strained back doesn't check whose stand it happened at, and neither should stopping one.",
      missNote: "The twist happened before anyone said anything. The technique you just practiced only protects the person who actually uses it, and a coworker one stand over needed the same reminder you just got.",
      wrongNote: "It's the lift cart — point them to it before that twist finishes.",
    },
    {
      id: "new-cashier-freezes",
      kind: "New cashier unsure of the plan",
      after: "id-check-generic", delay: 3, seconds: 12,
      alert: "A raised voice at the next lane over a price dispute has a brand-new cashier frozen, unsure what the store's plan even asks them to do.",
      cue: "They don't know where the plan starts — point them to it.",
      target: "panic-button",
      why: "A new cashier who does not know where the panic button is has not actually been trained on the plan yet, whatever the onboarding paperwork says — showing them now, on a loud price dispute, is a much cheaper lesson than the first time it matters for real.",
      missNote: "The moment passed and the new cashier still doesn't know where the panic button is. The plan only protects the people who know it before they need it, and nobody just gave them that.",
      wrongNote: "It's the panic button — show them where it is before this becomes the thing they learn it on for real.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, GR5_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 7, tile: 0xdfe4e8, grout: "#aab0b3" }), { repeat: 5, px: 512 });
    const floor = box(g, 6.2, 0.1, 5.4, 0, 0.05, 0, 0xdfe4e8, { rough: 0.5, metal: 0.06 });
    floor.material = texturedMat(floorTex, { rough: 0.5, metal: 0.06, color: 0xdfe4e8 });

    const stripeTex = surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 2, px: 256 });
    const bagStripe = slab(g, 0.9, 0.005, 0.6, 0.9, 0.006, 0.4, 0xf2c14b, { rough: 0.7, cast: false });
    bagStripe.material = texturedMat(stripeTex, { rough: 0.75, color: 0xf2c14b });

    // ------------------------------------------------------------ checkstand
    const stand = group(g, 0, 0, -0.3);
    box(stand, 1.6, 0.9, 0.6, -0.3, 0.45, 0, 0xc9d0d6, { rough: 0.4, metal: 0.5 });
    box(stand, 0.5, 0.9, 0.6, 0.65, 0.45, 0, 0xc9d0d6, { rough: 0.4, metal: 0.5 });
    const belt = box(stand, 1.0, 0.04, 0.4, 0.05, 0.92, 0, 0x2b2f34, { rough: 0.7, metal: 0.2 });
    void belt;
    const registerBody = box(stand, 0.3, 0.35, 0.3, 0.65, 1.1, -0.1, 0xdfe4e8, { rough: 0.4, metal: 0.4 });
    void registerBody;
    const scannerWindow = box(stand, 0.14, 0.02, 0.18, 0.1, 0.94, 0.05, 0x59c97b, { rough: 0.3, emissive: 0x59c97b, ei: 0.6 });
    holoTag(scannerWindow, "scanner", 0, 0.14, 0, { css: "#3fa9c9", w: 0.26 });
    reg(hits, scannerWindow, "scanner");
    // Register touchscreen used for the age-check prompt.
    const ageScreen = instrument(stand, 0.65, 1.35, -0.1, { idle: "AGE?", color: GR5_ACCENT, w: 0.16, d: 0.12 });
    holoTag(ageScreen, "age check", 0, 0.16, 0, { css: "#3fa9c9", w: 0.26 });
    reg(hits, ageScreen, "age-check-scanner");
    holoTag(stand, "Checkstand 4", 0.2, 1.7, 0, { css: "#3fa9c9", w: 0.32 });

    // Reach-under-counter hazard: a hidden compartment beneath the register.
    const underCounter = box(stand, 0.3, 0.1, 0.3, 0.65, 0.15, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, underCounter, "reach-under-counter-weapon");

    // Stool with a height-adjust knob.
    const stool = group(g, -0.6, 0, 0.5);
    cyl(stool, 0.02, 0.02, 0.5, 0, 0.25, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 10 });
    cyl(stool, 0.18, 0.18, 0.04, 0, 0.5, 0, 0x2b2f34, { rough: 0.6, seg: 16 });
    const adjustKnob = cyl(stool, 0.03, 0.03, 0.05, 0, 0.12, 0, GR5_ACCENT, { rough: 0.4, metal: 0.5, seg: 12 });
    reg(hits, adjustKnob, "stool-adjust");
    holoTag(stool, "stool height", 0, 0.6, 0, { css: "#3fa9c9", w: 0.28 });

    // Bagging area: heavy case, lift cart, heavy/light item order.
    const baggingArea = group(g, 1.1, 0, 0.4);
    const heavyCase = box(baggingArea, 0.4, 0.34, 0.32, 0, 0.17, 0, 0xc9a86a, { rough: 0.75 });
    decal(heavyCase, 0.3, 0.08, 0, 0.18, 0.161, signFace("WATER 24PK", { bg: "#0d2a3a", accent: "#6cc6f0", scale: 0.4 }));
    holoTag(heavyCase, "heavy case", 0, 0.4, 0, { css: "#3fa9c9", w: 0.3 });
    reg(hits, heavyCase, "heavy-case");
    const twistZone = box(baggingArea, 0.2, 0.2, 0.2, -0.3, 0.1, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, twistZone, "twist-lift-case");
    const heavyItem = box(baggingArea, 0.24, 0.14, 0.2, 0.4, 0.07, 0, 0xb0473a, { rough: 0.6 });
    reg(hits, heavyItem, "heavy-item");
    const lightItem = box(baggingArea, 0.22, 0.1, 0.14, 0.4, 0.07, 0.3, 0xe8dcc0, { rough: 0.7 });
    reg(hits, lightItem, "light-item");
    const liftCart = group(g, 1.7, 0, 0.9);
    box(liftCart, 0.4, 0.04, 0.3, 0, 0.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    for (const sx of [-0.14, 0.14]) cyl(liftCart, 0.05, 0.05, 0.04, sx, 0.05, 0, 0x1a1e23, { rough: 0.85, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(liftCart, "lift cart", 0, 0.3, 0, { css: "#59c97b", w: 0.26 });
    reg(hits, liftCart, "lift-cart");

    // Assist call button.
    const assistCall = group(g, 0.9, 0, -1.0);
    cyl(assistCall, 0.05, 0.05, 0.04, 0, 0.9, 0, 0xd8232a, { rough: 0.4, seg: 16 });
    holoTag(assistCall, "assist call", 0, 1.0, 0, { css: "#3fa9c9", w: 0.28 });
    reg(hits, assistCall, "assist-call");

    // Shift board and shift log.
    const shiftBoard = holoPanel(g, 0.5, 0.36, -2.3, 1.5, 0.3, (ctx, w, h) => {
      ctx.fillStyle = "#08222c"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#3fa9c9"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#cdeaf4"; ctx.fillText("FRONT END SHIFT BOARD", w * 0.06, h * 0.18);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#e9f7fb";
      ["Register 4 — you", "Till start logged", "Safety plan: back office"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { accent: GR5_ACCENT });
    reg(hits, shiftBoard, "shift-board");

    const shiftLog = group(g, 2.4, 0, -0.6);
    slab(shiftLog, 0.24, 0.02, 0.32, 0, 0.92, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(shiftLog, 0.2, 0.26, 0, 0.93, 0.161, signFace("SHIFT LOG", { bg: "#f4ecda", fg: "#241a08", accent: "#2f6f8c", scale: 0.46 })).rotation.x = -Math.PI / 2;
    holoTag(shiftLog, "shift log", 0, 1.1, 0, { css: "#3fa9c9", w: 0.3 });
    reg(hits, shiftLog, "shift-log");

    // Panic button and posted safety plan.
    const panicButton = group(g, 0.65, 0, -0.85);
    box(panicButton, 0.08, 0.05, 0.03, 0, 1.05, -0.1, 0xd8232a, { rough: 0.4 });
    holoTag(panicButton, "panic button", 0, 1.14, -0.1, { css: "#f0645b", w: 0.32 });
    reg(hits, panicButton, "panic-button");

    const planPoster = holoPanel(g, 0.5, 0.4, -2.3, 1.5, -0.5, (ctx, w, h) => {
      ctx.fillStyle = "#08222c"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#d8232a"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#f6d8d8"; ctx.fillText("STORE SAFETY PLAN", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#f2eaea";
      ["Comply — do not chase", "Alarm only after they leave", "Call it in, then log it"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { accent: 0xd8232a });
    reg(hits, planPoster, "safety-plan-poster");

    // Till tray and drop slot.
    const tillTray = box(g, 0.3, 0.06, 0.22, -0.2, 0.95, -0.3, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    holoTag(g, "till tray", -0.2, 1.06, -0.3, { css: "#3fa9c9", w: 0.26 });
    reg(hits, tillTray, "till-tray");
    const dropSlot = group(g, 2.4, 0, -1.0);
    box(dropSlot, 0.3, 0.5, 0.3, 0, 0.9, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    box(dropSlot, 0.2, 0.02, 0.05, 0, 1.1, 0.16, 0x1a1e23, { rough: 0.7 });
    holoTag(dropSlot, "drop slot", 0, 1.3, 0, { css: "#3fa9c9", w: 0.28 });
    reg(hits, dropSlot, "drop-slot");

    // Fatigue self-check dial.
    const fatigueDial = instrument(g, -0.9, 0.9, -1.0, { idle: "--", color: GR5_ACCENT, w: 0.15, d: 0.12 });
    holoTag(fatigueDial, "fatigue check", 0, 0.16, 0, { css: "#3fa9c9", w: 0.32 });
    reg(hits, fatigueDial, "fatigue-dial");

    // Torn mat, cart on cord, blocked exit, spare till decoy.
    const tornMat = slab(g, 0.5, 0.01, 0.35, -1.0, 0.011, 0.6, 0x22262b, { radius: 0.04, rough: 0.9, cast: false });
    reg(hits, tornMat, "torn-mat");
    const cordCart = group(g, -1.6, 0, 1.1);
    box(cordCart, 0.4, 0.4, 0.4, 0, 0.3, 0, 0x6b7278, { rough: 0.5, metal: 0.5 });
    cyl(cordCart, 0.14, 0.14, 0.006, 0, 0.006, 0.24, 0x2b2f34, { rough: 0.7, seg: 12 });
    reg(hits, cordCart, "cart-on-cord");
    const spareTill = box(g, 0.3, 0.08, 0.22, -2.3, 0.9, 0.7, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    reg(hits, spareTill, "spare-till");
    const exitPath = slab(g, 1.0, 0.005, 1.6, 2.6, 0.006, 1.0, 0x59c97b, { rough: 0.6, opacity: 0.3, transparent: true, cast: false });
    holoTag(g, "emergency exit path", 2.6, 0.2, 1.0, { css: "#59c97b", w: 0.4 });
    void exitPath;
    const chaseZone = box(g, 0.6, 0.5, 0.4, 1.9, 0.5, -1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, chaseZone, "chase-customer");
    const blockingCart = group(g, 2.6, 0, 1.0);
    box(blockingCart, 0.5, 0.4, 0.5, 0, 0.3, 0, 0x6b7278, { rough: 0.5, metal: 0.5 });
    for (const [cx2, cz2] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) cyl(blockingCart, 0.05, 0.05, 0.04, cx2, 0.05, cz2, 0x22262b, { rough: 0.8, seg: 10 });
    reg(hits, blockingCart, "blocked-exit-cart");

    // Second lane, coworker figures, and the customer-dispute bystander.
    const cashier = standingFigure(g, 0.2, 0.7, { ry: Math.PI, outfit: "kitchen" });
    void cashier;
    const coworker = group(g, -1.8, 0, -0.9);
    standingFigure(coworker, 0, 0, { ry: 0.4, outfit: "kitchen" });
    coworker.visible = false;
    const newCashier = group(g, 2.0, 0, 0.3);
    standingFigure(newCashier, 0, 0, { ry: -1.0, outfit: "kitchen" });
    newCashier.visible = false;

    const arcSpark = particles(g, 12, 0xbfe9ff, { size: 0.012, life: 0.25 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 1.1, -0.2),
      onStepComplete(step) {
        if (step.id === "till-balance-drag") { tillTray.parent.remove(tillTray); dropSlot.add(tillTray); tillTray.position.set(0, 0.2, 0); }
      },
      onInterrupt(it) {
        if (it.id === "coworker-twist-lift") coworker.visible = true;
        if (it.id === "new-cashier-freezes") newCashier.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "coworker-twist-lift") coworker.visible = false;
        if (it.id === "new-cashier-freezes") newCashier.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "fatigue-check") {
          const label = gg.t < 0.3 ? "fresh" : gg.t < 0.55 ? "steady" : gg.t < 0.85 ? "time for a break" : "overdue for rotation";
          repaint(fatigueDial.userData.screen, signFace(label, { bg: "#1c1408", accent: gg.t >= 0.55 && gg.t <= 0.85 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.4 }));
        }
        if (session?.turn && step?.id === "stool-height") stool.position.y = session.turn.amount * 0.15;
        void t; void dt; void arcSpark;
      },
    };
  },
};
