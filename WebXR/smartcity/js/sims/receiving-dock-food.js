import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, particles, mat, counter,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Receiving Dock Food VR — Culinary & Hospitality, station two.
// A delivery received at the kitchen dock: the invoice checked against the
// order, the truck's own reefer read before the door opens, every cold and
// frozen item probed with a sanitised thermometer and refused outside the
// Food Code's own limits, packaging and dates checked, refusals marked and
// logged, and the accepted goods moved to cold storage inside the code's
// window with the receiving log signed to close it out.

const RDF_ACCENT = 0xf2b13b;

export const SIM_RECEIVING_DOCK_FOOD = {
  id: "receiving-dock-food",
  index: "108",
  domain: "Culinary & Hospitality",
  trade: "Receiving clerk / kitchen worker — food deliveries",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  certification: "California Retail Food Code / FDA Food Code §3-202.11 receiving temperatures and §3-202.15 package integrity; California Food Handler card and ServSafe Food Protection Manager; HACCP, which treats receiving as its own critical control point; OSHA 29 CFR 1910.22 walking-working surfaces for the dock apron; NSF/ANSI 2 food equipment; UNITE HERE Local 2 and the Teamsters drivers on the other side of the dock plate",
  name: "Receiving Dock Food",
  title: simTitle("Receiving Dock Food"),
  tagline: "A delivery at the kitchen dock: invoice against the order, the truck's reefer read before the door opens, every cold and frozen item probed and refused outside the limit, packaging and dates checked, refusals logged, goods moved to cold storage in the window, and the log signed",
  accent: RDF_ACCENT,
  accentCss: "#f2b13b",
  parSeconds: 265,
  footprint: 2.7,
  badge: { id: "clean-receipt", name: "Clean Receipt", note: "A delivery received with every temperature checked, nothing refused going to storage and the log signed clean — first time" },

  game: system({
    name: "Receiving Line",
    currency: "DOCK",
    ranks: ["Porter", "Receiving Clerk", "Lead Receiver", "Kitchen Supervisor", "Receiving Certified"],
    badges: [
      { id: "probe-first", name: "Probe First", note: "Thermometer sanitised before it ever touched food, first time", test: AWARD.stepClean("sanitize-probe") },
      { id: "nothing-slipped", name: "Nothing Slipped", note: "Never a warm load accepted, never an unsanitised probe, never damage stocked", test: AWARD.safe },
      { id: "on-the-limit", name: "On the Limit", note: "Every probed reading and the reefer check both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-delivery", name: "Clean Delivery", note: "No corrections anywhere on the receipt", test: AWARD.clean },
      { id: "steady-truck", name: "Steady Through", note: "Hand truck held a steady pace to cold storage", test: AWARD.unbroken },
      { id: "receive-fast", name: "Received In Time", note: "Delivery closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "accept-warm-load": "You waved the truck off without reading the reefer display. A box that has been running warm on the road has already started the delivery in the danger zone, and every minute after that is spent losing ground you cannot get back at the dock.",
    "unsanitized-probe": "You went straight from one case to the next with a probe you never wiped down. A thermometer that just touched raw poultry and then goes into a tub of dairy carries whatever was on that poultry with it — the reading you get back is clean and the food is not.",
    "damage-ignored": "You put a torn, leaking bag onto the accepted pallet instead of setting it aside. A broken seal is an open invitation to pests and contamination for every hour it sits in storage, and by the time somebody notices it has already touched the cases next to it.",
    "wet-apron-crossing": "You wheeled a loaded hand truck straight across the wet, icy apron instead of matting or clearing it first. A dock apron gets wet from every reefer that runs and every case that drips, and OSHA's walking-working-surfaces rule exists because that surface takes people down with a full load in their hands.",
  },

  lateNotes: {
    "damaged-case": "The reject zone is where this case goes the moment you decide it fails — not the accepted pallet, not the walk-in, and not the truck it came off of.",
    "hand-truck": "Cold storage is the last stop, not a stop along the way — nothing gets set down between the dock and the walk-in door once it has passed inspection.",
  },

  steps: [
    {
      id: "invoice", kind: "select", target: "invoice-board",
      title: "Check the invoice against the order",
      cue: "Compare the delivery invoice to today's purchase order before the truck is unloaded.",
      why: "The invoice is the only record of what was supposed to arrive, at what count and at what price. Catching a shortage or a substitution here is a phone call; catching it after the truck has left is a credit dispute nobody can prove.",
    },
    {
      id: "reefer-check", kind: "gauge", target: "reefer-display",
      title: "Read the truck's reefer display",
      cue: "Read the truck's own reefer temperature through the window and commit once it shows the box has held cold.",
      why: "The reefer display is the truck's own record of the whole trip, not just the last five minutes at your dock. A box that shows warm before the door is even open has already failed the delivery, whatever the first case you probe happens to read.",
      gauge: { label: "REEFER BOX TEMP", speed: 0.65, green: [0.06, 0.3], readout: (t) => `${Math.round(50 - t * 22)} °F`, missNote: "Reefer is reading warm — do not break the seal on this load yet; get it re-checked before anything comes off the truck." },
    },
    {
      id: "open-dock", kind: "sequence",
      targets: ["truck-doors", "dock-leveler"],
      itemNames: { "truck-doors": "truck doors", "dock-leveler": "dock leveler" },
      title: "Open the truck and bridge the dock",
      cue: "Open the truck doors, then bridge the gap with the dock leveler — in that order.",
      why: "The doors open onto a load that has been sealed and refrigerated for hours; the leveler bridges the gap only once you can see what you are bridging it onto. Dropping the leveler onto closed doors tells you nothing about the load behind them.",
      outOfOrderNote: "Wrong order — the doors open first so you can see the load, then the leveler bridges the gap you can now see.",
    },
    {
      id: "sanitize-probe", kind: "hold", target: "sani-wipe", seconds: 4,
      title: "Sanitise the probe",
      cue: "Wipe the thermometer probe down and hold it through its contact time before it touches any food.",
      why: "The probe goes into a dozen different cases in the next few minutes, and a sanitiser only earns its claim over its full contact time. A probe wiped and immediately used is a probe that was never actually sanitised.",
      holdBreakNote: "You pulled the wipe away early. Hold it the full contact time — a fast wipe moves the soil around instead of killing what is on the tip.",
    },
    {
      id: "probe-dairy", kind: "gauge", target: "dairy-case",
      title: "Probe the dairy case",
      cue: "Probe between two cartons in the dairy case and commit once the reading is at or below the limit.",
      why: "41 °F or below is the Food Code's own line for a cold time/temperature-control-for-safety delivery. Between two cartons is where the load is warmest, not the outside of the case where the truck's air has been blowing on it the whole trip.",
      gauge: { label: "DAIRY — INTERNAL TEMP", speed: 0.65, green: [0.08, 0.32], readout: (t) => `${Math.round(50 - t * 20)} °F`, missNote: "Above 41 °F — this case is refused, not re-tested until it happens to pass." },
    },
    {
      id: "packaging-check", kind: "find", noHint: true,
      targets: ["torn-bag", "pest-sign"],
      itemNames: { "torn-bag": "the torn flour sack", "pest-sign": "gnaw marks on the carton" },
      itemNotes: {
        "torn-bag": "A torn seal on a dry-goods sack. Once that seal is broken the contents are exposed for the rest of this delivery's trip through your kitchen, not just for the ride here.",
        "pest-sign": "Gnaw marks at the corner of this carton. That is evidence of a pest getting into product before it ever reached your dock, and the carton — not just the item it touched — gets refused.",
      },
      decoyNotes: { "clean-case": "This case is intact: sealed, dry, no marks. Leave it." },
      title: "Walk the pallet for damage and pests",
      cue: "Two things on this pallet are not sound. Find them before anything is accepted.",
      why: "Packaging is checked with your hands and your eyes on every case, not sampled on a few. A pest sign on one carton is a reason to look harder at the rest of the load, not a reason to set that one carton aside and move on.",
    },
    {
      id: "probe-frozen", kind: "gauge", target: "frozen-case",
      title: "Probe the frozen case",
      cue: "Probe the frozen case and commit once the reading confirms it is frozen solid.",
      why: "Frozen product is accepted frozen solid, not merely cold — any sign of thawing and refreezing means ice crystals have already reformed larger, which is what a thaw-and-refreeze cycle does to texture and to the pathogen load both.",
      gauge: { label: "FROZEN — INTERNAL TEMP", speed: 0.6, green: [0.72, 0.94], readout: (t) => `${Math.round(34 - t * 50)} °F`, missNote: "Not frozen solid — soft spots mean it thawed in transit. Refuse it rather than guess how far it got." },
    },
    {
      id: "date-check", kind: "select", target: "date-check-case",
      title: "Check the use-by date",
      cue: "Check the use-by date on the case closest to its limit.",
      why: "A delivery arriving within a day or two of its own use-by date leaves your kitchen almost no shelf life to work with. That is a supplier problem to flag today, not a surprise your line cooks find on their own next week.",
    },
    {
      id: "probe-hot", kind: "gauge", target: "hot-soup-case",
      title: "Probe the hot delivery",
      cue: "Probe the hot soup delivery and commit once the reading holds at or above the limit.",
      why: "Hot-held product arrives hot, full stop. 135 °F is the floor the Food Code sets for holding, not a target to be somewhere near — anything colder has already spent time sliding through the danger zone on the way to your dock.",
      gauge: { label: "HOT DELIVERY — TEMP", speed: 0.65, green: [0.68, 0.92], readout: (t) => `${Math.round(110 + t * 40)} °F`, missNote: "Below 135 °F — refuse it. Reheating a receiving failure at the stove does not undo the time it already spent cooling." },
    },
    {
      id: "refuse-item", kind: "drag", target: "damaged-case",
      title: "Refuse the failed case",
      cue: "Pull the case that failed and move it to the reject zone.",
      why: "A refused case leaves the delivery physically, right away — set beside the accepted pallet, it is one distracted moment away from going to storage with everything else.",
      drag: { to: "reject-zone", radius: 0.45, missNote: "Not in the reject zone — a failed case anywhere else on the dock is one more thing somebody has to remember not to stock." },
    },
    {
      id: "refusal-log", kind: "select", target: "refusal-clipboard",
      title: "Log the refusal",
      cue: "Write the item, the reason and the quantity refused on the refusal log.",
      why: "The refusal log is what gets you a credit from the supplier and what tells the next shift why a case that was on the invoice never made it to the shelf. Without it, a refusal is just missing inventory nobody can explain.",
    },
    {
      id: "secure-load", kind: "turn", target: "ratchet-strap",
      title: "Strap the hand truck's load",
      cue: "Ratchet the strap down over the stacked accepted cases before you move them.",
      why: "A stack that shifts on a hand truck comes down on whoever is pushing it, not on the floor first. The strap is what turns a stack of separate cases into one load that moves the way you point it.",
      turn: { turns: 1, axis: "z", label: "LOAD STRAP" },
    },
    {
      id: "move-cold", kind: "track", target: "hand-truck", seconds: 6,
      title: "Move the load to cold storage",
      cue: "Hold a steady pace across the dock and straight into cold storage — no stops along the way.",
      why: "The Food Code's own receiving window assumes accepted cold product goes straight to refrigeration, not onto a prep table 'for a minute' on the way. Every stop between the dock and the walk-in door spends time that window does not have to give.",
      track: { start: 0.1, green: [0.4, 0.62], rise: 0.55, fall: 0.5, drift: 0.12, label: "HAND TRUCK SPEED", readout: (v) => (v < 0.4 ? "too slow — clock is running" : v > 0.62 ? "too fast — losing the load" : "steady") },
      holdBreakNote: "Speed out of band — settle the hand truck and hold a steady pace the rest of the way.",
    },
    {
      id: "sign-log", kind: "select", target: "receiving-log-sign",
      title: "Sign the receiving log",
      cue: "Sign the receiving log to close out the delivery.",
      why: "A signature is the clerk taking responsibility for every reading on this delivery — what was accepted, what was refused and why. It is the line an inspector or a manager reads when something about this delivery is questioned weeks later.",
    },
  ],

  // Two things that happen while your hands and your attention are already
  // spent on the delivery. See shared/game.js.
  interrupts: [
    {
      id: "driver-pressing",
      kind: "Driver pressing to leave",
      after: "sanitize-probe", delay: 4, seconds: 12,
      alert: "The driver has climbed back into the cab and is revving the engine — he has two more stops and wants the paperwork signed now, before a single temperature is taken.",
      cue: "The truck does not leave until the temperatures are in.",
      target: "reefer-display",
      why: "A driver's schedule is not a food safety control, and signing before the readings are taken turns the receiving log into a guess with a signature on it. The reefer display is still readable from here — check it before anything else happens.",
      missNote: "You let the truck go before a single reading was taken. Once that trailer pulls off the dock there is no way to prove what temperature this load actually arrived at, and the receiving log for it is now fiction with your name on it.",
      wrongNote: "It is the reefer display. Whatever the driver's schedule is, the temperature gets read before the truck does.",
    },
    {
      id: "helper-wheeling-reject",
      kind: "Wrong case moving",
      after: "move-cold", delay: 4, seconds: 12,
      alert: "A kitchen helper has grabbed the refused case off the dock by mistake and is wheeling it toward the walk-in with everything else.",
      cue: "Stop that case before it reaches the walk-in — it does not belong with the accepted load.",
      target: "reject-zone",
      why: "A refused case that reaches the walk-in stops being a refusal and starts being inventory: the next cook who opens that door has no way to know it already failed inspection. Catching it here, on the dock, is the last easy chance.",
      missNote: "The refused case went into cold storage with everything else. It now reads, to every cook who opens that door, exactly like every other case on the shelf — the only thing that told anyone it had failed was the refusal log sitting back on the dock.",
      wrongNote: "It is the reject zone. Redirect that case back to it before the helper reaches the walk-in door.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, RDF_ACCENT);

    // Dock floor: textured concrete apron.
    const floorTex = surfaceTexture(
      (cx, cw, ch) => pavingFace(cx, cw, ch, { tiles: 4, base: "#6a7176", base2: "#5d6469", seam: "rgba(20,26,30,0.35)" }),
      { repeat: 6, px: 512 });
    const floor = box(g, 6.4, 0.1, 5.6, 0, 0.05, 0, 0x646b70, { rough: 0.85, metal: 0.08 });
    floor.material = texturedMat(floorTex, { rough: 0.82, metal: 0.08, color: 0x646b70 });

    // Dock face and bumper at -z, the truck backed up beyond it.
    box(g, 6.2, 0.7, 0.3, 0, -0.15, -2.1, 0x3a4048, { rough: 0.8 });
    const bumper = (x) => box(g, 0.3, 0.3, 0.12, x, 0.05, -2.3, 0x1b1e23, { rough: 0.9 });
    bumper(-1.1); bumper(1.1);
    const truck = group(g, 0, -0.35, -3.8);
    box(truck, 2.6, 0.1, 3.8, 0, 0.5, 0, 0x8a8f96, { rough: 0.85 });
    for (const sx of [-1, 1]) box(truck, 0.06, 2.1, 3.8, sx * 1.3, 1.55, 0, 0xd9dde2, { rough: 0.7 });
    box(truck, 2.6, 0.06, 3.8, 0, 2.6, 0, 0xd9dde2, { rough: 0.7 });
    const doorsGroup = group(truck, 0, 0, 1.9);
    for (const sx of [-1, 1]) box(doorsGroup, 1.3, 2.1, 0.05, sx * 0.65, 1.55, 0, 0xc7ced1, { rough: 0.6, metal: 0.3 });
    holoTag(doorsGroup, "truck doors", 0, 2.7, 0, { css: "#f2b13b", w: 0.3 });
    reg(hits, doorsGroup, "truck-doors");
    // Reefer unit on the truck front, visible through a window before the
    // doors ever open.
    const reeferUnit = group(truck, 0, 2.0, -2.0);
    box(reeferUnit, 2.2, 0.9, 0.3, 0, 0, 0, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    const reeferPanel = instrument(reeferUnit, 0, -0.1, 0.16, { idle: "-- °F", color: 0xf2b13b, w: 0.16, d: 0.1, ry: 0 });
    holoTag(reeferUnit, "reefer display", 0, 0.55, 0.16, { css: "#f2b13b", w: 0.32 });
    reg(hits, reeferPanel, "reefer-display");
    const acceptWarm = box(reeferUnit, 0.4, 0.3, 0.1, 0.9, -0.1, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(reeferUnit, "wave it through?", 0.9, 0.2, 0.2, { css: "#f0645b", w: 0.4 });
    reg(hits, acceptWarm, "accept-warm-load");
    const driverCab = group(truck, 0, 0.2, -2.35);
    box(driverCab, 1.9, 1.3, 0.9, 0, 1.1, 0, 0x3a4a56, { rough: 0.5, metal: 0.4 });
    const driver = standingFigure(g, 0, -6.1, { ry: 0, cloth: 0x37505f, atStation: true });
    void driverCab; void driver;

    // Dock leveler / plate, stored up, dragged onto the trailer lip.
    const leveler = group(g, -0.3, 0.1, -1.7);
    box(leveler, 1.6, 0.06, 1.0, 0, 0.03, 0, 0x59636d, { rough: 0.5, metal: 0.6 });
    for (let i = -3; i <= 3; i++) box(leveler, 0.02, 0.008, 0.9, i * 0.22, 0.065, 0, 0xf2c14b, { rough: 0.6, cast: false });
    holoTag(leveler, "dock leveler", 0, 0.4, 0, { css: "#f2b13b", w: 0.28 });
    reg(hits, leveler, "dock-leveler");

    // Wet, icy patch on the apron near the leveler.
    const wetApron = slab(g, 1.0, 0.01, 0.7, 0.4, 0.011, -1.1, 0xbfe4f2, { radius: 0.1, rough: 0.15, opacity: 0.5, transparent: true, cast: false });
    holoTag(g, "cross it loaded?", 0.4, 0.2, -1.1, { css: "#f0645b", w: 0.36 });
    reg(hits, wetApron, "wet-apron-crossing");

    // Pallet of delivered goods between the leveler and the receiving table.
    const pallet = group(g, 1.4, 0.1, -0.9);
    box(pallet, 1.2, 0.12, 1.2, 0, 0.06, 0, 0x8a6f5a, { rough: 0.9 });
    // Dairy case.
    const dairy = group(pallet, -0.3, 0.12, -0.3);
    box(dairy, 0.4, 0.36, 0.4, 0, 0.18, 0, 0xe8eef0, { rough: 0.7 });
    decal(dairy, 0.3, 0.09, 0, 0.36, 0.201, signFace("DAIRY", { bg: "#0d3a4a", accent: "#6fd6c9", scale: 0.55 }));
    holoTag(dairy, "dairy case", 0, 0.44, 0, { css: "#f2b13b", w: 0.28 });
    reg(hits, dairy, "dairy-case");
    // Frozen case.
    const frozen = group(pallet, 0.3, 0.12, -0.3);
    box(frozen, 0.38, 0.32, 0.38, 0, 0.16, 0, 0xdfe9f2, { rough: 0.4 });
    decal(frozen, 0.3, 0.08, 0, 0.32, 0.191, signFace("FROZEN", { bg: "#0d1c3a", accent: "#6fd6c9", scale: 0.55 }));
    holoTag(frozen, "frozen case", 0, 0.4, 0, { css: "#f2b13b", w: 0.3 });
    reg(hits, frozen, "frozen-case");
    // Torn dry-goods sack — packaging-check target.
    const tornBag = group(pallet, -0.3, 0.12, 0.35);
    box(tornBag, 0.4, 0.24, 0.3, 0, 0.12, 0, 0xe4e0c8, { rough: 0.85 });
    box(tornBag, 0.16, 0.03, 0.05, 0.05, 0.2, 0.15, 0x2b2f34, { rough: 0.9 }).rotation.z = 0.4;
    holoTag(tornBag, "torn seal", 0, 0.32, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, tornBag, "torn-bag");
    // Carton with pest-sign gnaw marks.
    const pestCarton = group(pallet, 0.3, 0.12, 0.35);
    box(pestCarton, 0.4, 0.3, 0.32, 0, 0.15, 0, 0xc9a86a, { rough: 0.85 });
    box(pestCarton, 0.08, 0.05, 0.04, 0.18, 0.03, 0.14, 0x1b1e23, { rough: 0.9 });
    holoTag(pestCarton, "gnaw marks", 0, 0.36, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, pestCarton, "pest-sign");
    // A clean, intact case — the find step's decoy.
    const cleanCase = group(pallet, 0, 0.12, 0.35);
    box(cleanCase, 0.36, 0.26, 0.3, 0, 0.13, 0, 0xe8eef0, { rough: 0.6 });
    reg(hits, cleanCase, "clean-case");
    // Case with a use-by date close to its limit.
    const dateCase = group(pallet, -0.35, 0.12, -0.05);
    box(dateCase, 0.3, 0.24, 0.26, 0, 0.12, 0, 0x9fd88a, { rough: 0.7 });
    decal(dateCase, 0.24, 0.07, 0, 0.26, 0.131, signFace("USE 3/1", { bg: "#1b3a2a", accent: "#f2c14b", scale: 0.55 }));
    holoTag(dateCase, "use-by date", 0, 0.3, 0, { css: "#f2b13b", w: 0.26 });
    reg(hits, dateCase, "date-check-case");

    // Damaged case that fails temperature — the refuse-item drag source.
    const damaged = group(pallet, 0.4, 0.12, 0.0);
    box(damaged, 0.34, 0.26, 0.3, 0, 0.13, 0, 0xd98a6a, { rough: 0.75 });
    decal(damaged, 0.26, 0.07, 0, 0.28, 0.151, signFace("48 °F", { bg: "#5a1a12", accent: "#f0645b", scale: 0.55 }));
    holoTag(damaged, "failed case", 0, 0.34, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, damaged, "damaged-case");
    // A case shoved onto the accepted side despite the tear — the hazard.
    const damageIgnored = group(g, -1.6, 0.1, -0.3);
    box(damageIgnored, 0.34, 0.22, 0.28, 0, 0.11, 0, 0xe4e0c8, { rough: 0.85 });
    box(damageIgnored, 0.14, 0.03, 0.04, 0.03, 0.16, 0.12, 0x2b2f34, { rough: 0.9 }).rotation.z = 0.4;
    holoTag(damageIgnored, "stock it anyway?", 0, 0.3, 0, { css: "#f0645b", w: 0.38 });
    reg(hits, damageIgnored, "damage-ignored");

    // Hot delivery case, on its own insulated carrier near the table.
    const hotCase = group(g, -0.6, 0.1, -0.5);
    box(hotCase, 0.4, 0.34, 0.36, 0, 0.17, 0, 0xb0473a, { rough: 0.6 });
    decal(hotCase, 0.3, 0.08, 0, 0.34, 0.181, signFace("HOT SOUP", { bg: "#3a1108", accent: "#f2ae14", scale: 0.5 }));
    holoTag(hotCase, "hot delivery", 0, 0.42, 0, { css: "#f2b13b", w: 0.3 });
    reg(hits, hotCase, "hot-soup-case");
    const soupSteam = particles(hotCase, 30, 0xe4ecf2, { size: 0.03, life: 0.8, additive: false, opacity: 0.25 });

    // Receiving table: invoice board, sanitising wipe, probe, refusal
    // clipboard, receiving log, reject zone.
    const table = counter(g, 2.4, 0.7, -1.9, 1.6, 0x9aa4ad, { height: 0.9, metal: 0.75, rough: 0.3, ry: -Math.PI / 2 });
    const invoiceBoard = group(table, 0, 0.94, -0.55);
    holoPanel(invoiceBoard, 0.5, 0.36, 0, 0.3, 0, (ctx, w, h) => {
      ctx.fillStyle = "#241a08"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#f2b13b"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffe9c2"; ctx.fillText("INVOICE #4471", w * 0.08, h * 0.18);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; ctx.fillStyle = "#fff3e0";
      ["Dairy ×6", "Frozen ×4", "Dry goods ×10", "Hot soup ×2"].forEach((l, i) => ctx.fillText(l, w * 0.08, h * (0.36 + i * 0.15)));
    }, { accent: RDF_ACCENT });
    reg(hits, invoiceBoard, "invoice-board");
    const wipe = box(table, 0.1, 0.02, 0.06, -0.7, 0.93, 0.1, 0xf2f6fa, { rough: 0.5 });
    holoTag(table, "sanitising wipe", -0.7, 1.02, 0.1, { css: "#f2b13b", w: 0.28 });
    reg(hits, wipe, "sani-wipe");
    const probe = instrument(table, -0.35, 0.94, 0.15, { idle: "--", color: 0xf2b13b, w: 0.14, d: 0.22 });
    holoTag(probe, "thermometer", 0, 0.16, 0, { css: "#f2b13b", w: 0.28 });
    // A second probe left dirty from the last delivery — the hazard if
    // reached for instead of the one that was just sanitised.
    const dirtyProbe = instrument(table, -0.35, 0.94, 0.42, { idle: "--", color: 0xb0473a, w: 0.13, d: 0.2 });
    holoTag(dirtyProbe, "still dirty — use it anyway?", 0, 0.16, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, dirtyProbe, "unsanitized-probe");
    const refusalClip = group(table, 0.5, 0.94, 0.15);
    slab(refusalClip, 0.24, 0.02, 0.32, 0, 0.01, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(refusalClip, 0.2, 0.26, 0, 0.02, 0.161, signFace("REFUSAL LOG", { bg: "#f4ecda", fg: "#241a08", accent: "#b8402f", scale: 0.5 })).rotation.x = -Math.PI / 2;
    holoTag(refusalClip, "refusal log", 0, 0.2, 0, { css: "#f2b13b", w: 0.3 });
    reg(hits, refusalClip, "refusal-clipboard");
    const receivingLog = group(table, 0.9, 0.94, -0.15);
    slab(receivingLog, 0.24, 0.02, 0.32, 0, 0.01, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(receivingLog, 0.2, 0.26, 0, 0.02, 0.161, signFace("RECEIVING LOG", { bg: "#f4ecda", fg: "#241a08", accent: "#2f6f8c", scale: 0.46 })).rotation.x = -Math.PI / 2;
    holoTag(receivingLog, "receiving log", 0, 0.2, 0, { css: "#f2b13b", w: 0.34 });
    reg(hits, receivingLog, "receiving-log-sign");

    // Reject zone marked on the floor beside the table.
    const rejectZone = slab(g, 1.0, 0.01, 0.8, -2.2, 0.011, 0.6, 0xf0645b, { radius: 0.05, rough: 0.7, opacity: 0.4, transparent: true, cast: false });
    holoTag(g, "reject zone", -2.2, 0.2, 0.6, { css: "#f0645b", w: 0.28 });
    reg(hits, rejectZone, "reject-zone");

    // Hand truck loaded with accepted cases, ratchet strap, path to storage.
    const handTruck = group(g, 0.6, 0, 1.7);
    box(handTruck, 0.5, 0.04, 0.16, 0, 0.32, -0.24, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    box(handTruck, 0.06, 1.1, 0.08, -0.22, 0.75, -0.3, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    box(handTruck, 0.06, 1.1, 0.08, 0.22, 0.75, -0.3, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    box(handTruck, 0.5, 0.06, 0.06, 0, 1.28, -0.3, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    for (const [cx, cz] of [[-0.16, -0.28], [0.16, -0.28]]) { const w = cyl(handTruck, 0.07, 0.07, 0.05, cx, 0.07, cz, 0x1a1e23, { rough: 0.85, seg: 12 }); w.rotation.z = Math.PI / 2; }
    holoTag(handTruck, "hand truck", 0, 1.5, -0.3, { css: "#f2b13b", w: 0.24 });
    reg(hits, handTruck, "hand-truck");
    const stackedCases = group(handTruck, 0, 0.34, 0.02);
    for (let i = 0; i < 3; i++) box(stackedCases, 0.42, 0.26, 0.4, 0, 0.13 + i * 0.27, 0, [0xe8eef0, 0xdfe9f2, 0x9fd88a][i], { rough: 0.7 });
    const strap = box(stackedCases, 0.46, 0.03, 0.44, 0, 0.72, 0, 0x2b2f34, { rough: 0.7 });
    holoTag(stackedCases, "load strap", 0, 0.95, 0, { css: "#f2b13b", w: 0.26 });
    reg(hits, strap, "ratchet-strap");
    // Cold storage door the hand truck travels to.
    const coldDoor = group(g, 0.6, 0, -0.4);
    box(coldDoor, 1.2, 2.0, 0.1, 0, 1.0, -1.0, 0xeef2f3, { rough: 0.5, metal: 0.15 });
    holoTag(coldDoor, "cold storage", 0, 2.15, -1.0, { css: "#6fd6c9", w: 0.34 });

    const clerk = standingFigure(g, -1.0, 0.2, { ry: 2.4, cloth: 0x37505f });
    holoTag(clerk, "receiving clerk", 0, 1.9, 0, { css: "#f2b13b", w: 0.32 });

    let travelled = 0, strapped = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 1.0, -0.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "open-dock") { doorsGroup.rotation.y = 0; }
        if (step.id === "refuse-item") { damaged.parent.remove(damaged); g.add(damaged); damaged.position.set(-2.2, 0.12, 0.6); }
        if (step.id === "secure-load") { strapped = true; strap.material = mat(0x2b2f34, { rough: 0.5, metal: 0.3 }); }
        if (step.id === "packaging-check") { tornBag.children[1].material = mat(0xf2b13b, { rough: 0.6 }); pestCarton.children[1].material = mat(0xf2b13b, { rough: 0.6 }); }
      },
      onInterrupt(it) {
        if (it.id === "driver-pressing") { driverCab.position.z -= 0.08; }
        if (it.id === "helper-wheeling-reject") { damaged.position.z = 0.6 - 0.4; damaged.position.x = -1.2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "driver-pressing") { driverCab.position.z += 0.08; }
        if (it.id === "helper-wheeling-reject") { damaged.position.set(-2.2, 0.12, 0.6); }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "reefer-check") repaint(reeferPanel.userData.screen, signFace(`${Math.round(50 - gg.t * 22)} °F`, { bg: "#1c1408", accent: gg.t >= 0.06 && gg.t <= 0.3 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.55 }));
        if (gg && !gg.committed && step?.id === "probe-dairy") repaint(probe.userData.screen, signFace(`${Math.round(50 - gg.t * 20)} °F`, { bg: "#1c1408", accent: gg.t >= 0.08 && gg.t <= 0.32 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.6 }));
        if (gg && !gg.committed && step?.id === "probe-frozen") repaint(probe.userData.screen, signFace(`${Math.round(34 - gg.t * 50)} °F`, { bg: "#1c1408", accent: gg.t >= 0.72 && gg.t <= 0.94 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.6 }));
        if (gg && !gg.committed && step?.id === "probe-hot") repaint(probe.userData.screen, signFace(`${Math.round(110 + gg.t * 40)} °F`, { bg: "#1c1408", accent: gg.t >= 0.68 && gg.t <= 0.92 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.6 }));
        if (session?.turn && step?.id === "secure-load") strap.position.y = 0.72 - session.turn.amount * 0.04;
        if (step?.id === "move-cold" && session.holding) travelled = Math.min(1, travelled + dt / 6);
        handTruck.position.x = 0.6 - travelled * 1.2;
        handTruck.position.z = 1.7 - travelled * 2.4;
        void strapped;
      },
    };
  },
};
