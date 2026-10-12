import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument,
  surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { batteryChargingStation } from "../../../shared/equipment.js";
import { forkliftCounterbalance } from "../../../shared/fleet.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Battery Change & Charging Bay Safety VR — Manufacturing &
// Automation, Teamsters warehouse and logistics automation.
//
// A lift-truck battery is heavy, wired at real voltage, and charging it
// gives off a gas that only needs a spark and a blocked vent to become a
// problem — none of which announces itself the way a leak or a loud noise
// would. This station walks the charging bay's own sequence: the eyewash
// and the ventilation confirmed clear before anything is unplugged, the
// truck powered down and the spent battery extracted onto its own cart,
// the spent battery placed on charge and proven inside its safe amperage
// band, and the replacement battery installed and reconnected before the
// truck goes back to work. No battery's voltage, amperage or charge time
// is a fact this platform is certain of — those live on the battery's own
// data plate and the charger's own manual.

const TW5_PAL = palette("warehouse");
const TWBC_ACCENT = 0xd2312b;

export const SIM_TW_BATTERY_CHANGE_AND_CHARGING_BAY_SAFETY = {
  id: "tw-battery-change-and-charging-bay-safety",
  index: "tw-5",
  domain: "Warehousing & Logistics",
  trade: "Teamsters warehouse associate — lift-truck battery change",
  category: "Manufacturing & Automation",
  indoor: "service",
  certification: "Teamsters (IBT) warehouse and logistics automation training; OSHA 29 CFR 1910.178 powered industrial trucks including battery charging, 29 CFR 1910.1200 hazard communication for battery electrolyte, and 29 CFR 1910.132 personal protective equipment for the face shield and apron; NIOSH findings on hydrogen off-gassing incidents in poorly ventilated charging bays",
  name: "Battery Change & Charging Bay Safety",
  title: simTitle("Battery Change & Charging Bay Safety"),
  tagline: "Changing a lift-truck battery the way the charging bay's own sequence requires it: the eyewash and ventilation confirmed clear first, the truck powered down before the spent battery is extracted, the spent battery proven inside its safe charging band, and the replacement installed and reconnected before the truck goes back to work",
  accent: TWBC_ACCENT,
  accentCss: "#d2312b",
  parSeconds: 275,
  footprint: 2.7,
  badge: { id: "battery-bay-certified", name: "Battery Bay Certified", note: "Confirmed the eyewash and ventilation before starting, powered the truck down before touching the battery, and proved the charge before trusting it" },

  game: system({
    name: "Charging Bay Discipline",
    currency: "AMPERE",
    ranks: ["Bay Visitor", "Bay Aware", "Battery Handler", "Charging Bay Authority", "Battery Bay Certified"],
    badges: [
      { id: "power-down-first", name: "Power Down First", note: "Confirmed the key off before touching the battery, first try", test: AWARD.stepClean("key-off") },
      { id: "never-block-the-eyewash", name: "Never Block the Eyewash", note: "Never missed a hazard on the bay read", test: AWARD.stepClean("bay-hazard-read") },
      { id: "steady-charge", name: "Steady Charge", note: "Held the charging amperage near band centre", test: AWARD.precise(0.72) },
      { id: "clean-extraction", name: "Clean Extraction", note: "Extracted the battery onto the cart, first try", test: AWARD.stepClean("extract-battery") },
    ],
    challenges: [
      { id: "quick-change", name: "Quick Change", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ampere-streak", name: "Ampere Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your Teamsters local's member assistance programme, or the site's employee assistance line if a close call in the charging bay is what stayed with you",

  hazards: {
    "blocked-eyewash-hazard": "That eyewash station has cases stacked in front of it. An eyewash that takes ten extra seconds to reach because someone has to move boxes first is ten seconds an electrolyte splash spends in someone's eyes before it gets flushed.",
    "blocked-vent-hazard": "That ventilation intake is covered with a tarp. A battery on charge gives off hydrogen as a normal part of charging, and a bay that cannot actually vent it is a bay where that gas has nowhere to go but up and out toward the first spark that finds it.",
    "corroded-terminal-hazard": "That battery terminal is visibly corroded, with white crust built up around the connector. A corroded terminal runs hotter under load than a clean one, and reaching in to disconnect it without expecting resistance is how a hand ends up closer to an arc than planned.",
    "tool-across-terminals-hazard": "That wrench is resting across two open terminals. A battery this size does not need a request to short across a bridge like that — metal touching both terminals at once is exactly the spark source the ventilation and the no-flame rule both exist to keep away from this bay.",
  },

  lateNotes: {
    "eyewash-station": "The eyewash gets confirmed clear before anything is unplugged, not located for the first time after a splash already happened.",
    "key-off-switch": "The truck gets powered down and the key removed before a hand goes near the battery connector, not checked by assumption afterward.",
  },

  interrupts: [
    {
      id: "vent-fan-fault",
      kind: "Ventilation fan stops",
      after: "charge-start-hold", delay: 4, seconds: 12,
      alert: "The bay's ventilation fan has stopped turning while the battery is on charge.",
      cue: "Stop the charge and report the fan to facilities rather than letting the battery keep charging with no ventilation.",
      target: "facilities-radio",
      why: "A charging battery keeps giving off hydrogen whether or not the fan is moving it out of the bay, and continuing to charge into a bay that has stopped venting is choosing to let that gas accumulate — reporting it is what gets the fan fixed before the next battery goes on charge, not just this one.",
      missNote: "The charge continued with the fan stopped. Hydrogen does not wait for someone to notice the fan is off before it starts building up.",
      wrongNote: "Not that — a stopped fan gets reported to facilities before this charge continues.",
    },
    {
      id: "acid-spill-fault",
      kind: "Electrolyte spill",
      after: "extract-battery", delay: 3, seconds: 12,
      alert: "A small electrolyte spill has appeared at the base of the extracted battery on the cart.",
      cue: "Report the spill and contain it per the spill kit rather than just wiping it up and continuing.",
      target: "spill-report",
      why: "Battery electrolyte is corrosive on skin and on the floor finish alike, and wiping a spill without reporting it skips the neutralising step a real spill kit is built to provide — reporting it is what turns a splash into a contained clean-up instead of a slip hazard someone else finds barefoot later.",
      missNote: "The spill was wiped up without being reported. A splash that never gets logged is a splash the next associate through this bay has no reason to expect.",
      wrongNote: "Not that — the spill gets reported and contained per the spill kit, not just wiped up.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["face-shield", "rubber-apron"],
      itemNames: { "face-shield": "face shield", "rubber-apron": "rubber apron and gloves" },
      title: "Suit up before touching the battery",
      cue: "Face shield and rubber apron and gloves before approaching the battery compartment.",
      why: "Battery electrolyte splashes outward, not down, the instant a connector comes free under any resistance at all — the face shield and the apron are what keeps that splash off skin and out of eyes instead of finding out the hard way which way it went.",
    },
    {
      id: "permit-read", kind: "select", target: "permit-board",
      title: "Read the battery-change permit",
      cue: "Confirm today's battery-change permit and the safety data sheet reference before starting.",
      why: "The permit is what confirms this is the truck and the battery actually scheduled for a change today — starting on the wrong unit because it happened to be parked closest wastes a charged battery on a truck that did not need one yet.",
    },
    {
      id: "bay-hazard-read", kind: "find", noHint: true,
      targets: ["blocked-eyewash-hazard", "blocked-vent-hazard", "corroded-terminal-hazard"],
      itemNames: {
        "blocked-eyewash-hazard": "eyewash blocked by stacked cases",
        "blocked-vent-hazard": "ventilation intake covered",
        "corroded-terminal-hazard": "corroded battery terminal",
      },
      itemNotes: {
        "blocked-eyewash-hazard": "The cases come off the eyewash before anything else in this bay starts — it has to be reachable in seconds, not minutes.",
        "blocked-vent-hazard": "The tarp comes off the intake before any battery goes on charge in this bay again.",
        "corroded-terminal-hazard": "A corroded terminal gets flagged for the electrician, not disconnected as if it were a clean one.",
      },
      decoyNotes: {
        "intact-charger-cable": "That charger cable is intact, with no visible wear. Nothing to flag there.",
      },
      title: "Read the bay for what is already wrong with it",
      cue: "Look the bay over before starting. Three things are already wrong with it — find them.",
      why: "A bay that looks routine from the door is not the same thing as one an associate has actually checked — a blocked eyewash, a covered vent or a corroded terminal each quietly removes a control this bay depends on, and finding them now costs a work order instead of costing someone the moment a splash or a spark actually happens.",
    },
    {
      id: "eyewash-confirm", kind: "select", target: "eyewash-station",
      title: "Confirm the eyewash station",
      cue: "Confirm the eyewash station is clear and reachable before starting the change.",
      why: "An eyewash that takes ten extra seconds to reach because it was never actually confirmed clear is ten seconds an electrolyte splash spends untreated — confirming it now, deliberately, is what makes it a control instead of a fixture on the wall.",
    },
    {
      id: "key-off", kind: "select", target: "key-off-switch",
      title: "Power down the truck",
      cue: "Confirm the truck's key is off and removed before touching the battery.",
      why: "A truck that is still keyed on can still draw from the battery the instant a connector makes contact — powering it down first is what keeps the disconnect from happening under load, arcing at the terminal instead of separating cleanly.",
    },
    {
      id: "hood-open", kind: "turn", target: "compartment-hood",
      title: "Open the battery compartment",
      cue: "Turn the hood latch to open the battery compartment.",
      why: "Opening the hood is the point of no return for this procedure — doing it only after the truck is confirmed off is what keeps this step from ever being the one where the compartment turns out to still be live and a hand is already reaching into it.",
      turn: { turns: 0.4, axis: "x", label: "COMPARTMENT HOOD" },
    },
    {
      id: "disconnect-battery", kind: "select", target: "battery-connector",
      title: "Disconnect the spent battery",
      cue: "Disconnect the battery connector before attempting to move the battery.",
      why: "A battery connector still attached fights back the instant the battery starts to slide — disconnecting it fully first is what keeps the extraction from becoming a cable caught halfway out of the compartment, pulling the connector apart under load instead of by hand.",
    },
    {
      id: "extract-battery", kind: "drag", target: "spent-battery",
      title: "Extract the spent battery",
      cue: "Slide the spent battery out of the compartment and onto the transfer cart.",
      why: "A lift-truck battery this size moves on a rail and a cart for a reason — sliding it out under control, rather than lifting or forcing it, is what keeps its own weight from becoming the hazard the moment it clears the compartment and nothing else is holding it up.",
      drag: { to: "cart-socket", radius: 0.45, missNote: "Not onto the cart — the battery only leaves the compartment under control when it lands on the cart, not beside it." },
    },
    {
      id: "connect-charger", kind: "select", target: "charger-connector",
      title: "Connect the spent battery to the charger",
      cue: "Connect the spent battery's connector to the charger before starting the charge.",
      why: "A battery on the cart but not actually connected to the charger is a battery that is not charging no matter how long it sits there — confirming the connection is what makes the next shift's charged battery real instead of assumed.",
    },
    {
      id: "charge-start-hold", kind: "hold", target: "charger-start", seconds: 6,
      title: "Start the charge",
      cue: "Hold the charger's start control until charging initialises.",
      why: "Holding the start control until the charger actually confirms it has begun is what catches a connection that looked seated but was not — a charge that never really started is a battery that shows up dead on the next shift with no warning at all.",
      holdBreakNote: "Released the start control before charging initialised. A charger that never confirmed a start is not a charger to walk away from.",
    },
    {
      id: "charge-gauge-check", kind: "gauge", target: "charger-ammeter",
      title: "Confirm the charging amperage",
      cue: "Read the charger's ammeter and commit only inside the safe charging band.",
      why: "A charger pulling outside its normal amperage band is telling you something about the battery or the connection before either one fails outright — the ammeter is the only honest read of that, not how normal the charger sounds from across the bay.",
      gauge: {
        label: "CHARGING AMPERAGE", speed: 0.55, green: [0.4, 0.66],
        readout: (t) => (t < 0.4 ? "under-drawing — check the connection" : t > 0.66 ? "over-drawing — stop and inspect" : "within safe charging band"),
        missNote: "Committed outside the safe charging band. Stop and inspect the connection before leaving this battery on charge.",
      },
    },
    {
      id: "select-charged", kind: "select", target: "charged-battery",
      title: "Select the charged replacement",
      cue: "Select the fully charged battery from the rack for this truck.",
      why: "Taking the battery that is actually marked fully charged, rather than the one that has simply been sitting the longest, is what keeps a truck from going back to work on a battery that only looks ready and stalls out an hour into the shift.",
    },
    {
      id: "install-battery", kind: "drag", target: "charged-battery",
      title: "Install the charged battery",
      cue: "Slide the charged battery into the truck's compartment.",
      why: "Sliding the replacement in under control, the same way the spent one came out, is what keeps this step as controlled as the extraction — a battery dropped the last few centimetres into place can crack a case seam that will not show a problem until it leaks days later.",
      drag: { to: "compartment-socket", radius: 0.45, missNote: "Not seated in the compartment — the battery has to land fully in its cradle, not balanced on the edge of it." },
    },
    {
      id: "reconnect-battery", kind: "select", target: "battery-connector",
      title: "Reconnect the battery",
      cue: "Reconnect the battery connector before closing the compartment.",
      why: "A truck closed up on a battery that was never actually reconnected looks ready from the outside and simply will not start — confirming the connection now is cheaper than a service call after the operator has already climbed in expecting to drive it away.",
    },
    {
      id: "hood-close", kind: "turn", target: "compartment-hood",
      title: "Close the battery compartment",
      cue: "Turn the hood latch closed and confirm it seats.",
      why: "A hood that is not actually latched can pop open under the first hard bump this truck takes back out on the floor — confirming the latch now is what keeps that from being someone else's surprise an aisle away, with a battery still wired live underneath it.",
      turn: { turns: 0.4, axis: "x", label: "COMPARTMENT HOOD" },
    },
    {
      id: "closing-log", kind: "select", target: "closing-log",
      title: "Sign the battery-change log",
      cue: "Sign the battery-change log before releasing the truck back to service.",
      why: "The signed log is the record of which battery went into which truck and when — a change that is never logged is a fleet team guessing at run times instead of tracking them, and a warranty claim nobody can actually document.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, TWBC_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.6, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.85 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7b8288", base2: "#6e747a", seam: "rgba(0,0,0,0.35)" }), { repeat: 6, px: 512 }),
      { rough: 0.85, metal: 0.06, color: TW5_PAL.ground },
    );

    // ------------------------------------------------------------------ charger + truck
    const charger = batteryChargingStation(g, -1.7, 0.14, -2.1, { ry: 0.5 });
    holoTag(charger, "charger 3", 0, 1.9, 0, { css: "#d2312b", w: 0.28 });
    const { beacon, cable } = charger.userData.parts;
    void cable;
    const chargerConnector = group(charger, 0.28, 0.6, 0.3);
    ball(chargerConnector, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 10, seg2: 8 });
    reg(hits, chargerConnector, "charger-connector");
    const chargerStart = group(charger, -0.2, 1.2, 0.161);
    box(chargerStart, 0.06, 0.04, 0.02, 0, 0, 0, 0x59c97b, { rough: 0.5 });
    reg(hits, chargerStart, "charger-start");
    const chargerAmmeter = group(charger, 0.05, 1.5, 0.161);
    box(chargerAmmeter, 0.1, 0.08, 0.02, 0, 0, 0, 0x0d1c24, { rough: 0.5 });
    reg(hits, chargerAmmeter, "charger-ammeter");

    const forklift = forkliftCounterbalance(g, 1.6, 0.14, -0.3, { ry: -1.6, livery: { colour: TWBC_ACCENT, fleetName: "DOCK FLEET", unitNumber: "FL-9" } });
    holoTag(forklift, "forklift FL-9", 0, 2.4, 0, { css: "#d2312b", w: 0.3 });
    const compartmentHood = group(forklift, 0, 1.1, 0.4);
    box(compartmentHood, 0.5, 0.05, 0.6, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    reg(hits, compartmentHood, "compartment-hood");
    const spentBattery = group(forklift, 0, 0.9, 0.4);
    box(spentBattery, 0.4, 0.3, 0.5, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    reg(hits, spentBattery, "spent-battery");
    const batteryConnector = group(forklift, 0.15, 0.95, 0.65);
    ball(batteryConnector, 0.025, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 10, seg2: 8 });
    reg(hits, batteryConnector, "battery-connector");
    const keyOffSwitch = group(forklift, -0.2, 1.3, 0.5);
    cyl(keyOffSwitch, 0.02, 0.02, 0.04, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 10 });
    reg(hits, keyOffSwitch, "key-off-switch");

    const cartSocket = group(g, 0.4, 0.14, -1.6);
    hits["cart-socket"] = cartSocket;
    const cart = group(g, 0.4, 0, -2.3);
    box(cart, 0.5, 0.08, 0.6, 0, 0.35, 0, 0x8b929a, { rough: 0.6, metal: 0.3 });
    for (const sx of [-0.2, 0.2]) for (const sz of [-0.25, 0.25]) cyl(cart, 0.05, 0.05, 0.08, sx, 0.04, sz, 0x1c1e21, { rough: 0.85, finish: "rubber", seg: 12 });
    holoTag(cart, "transfer cart", 0, 0.6, 0, { css: "#d2312b", w: 0.32 });

    // Spill hazard, staged hidden until the interrupt fires.
    const spillPuddle = box(g, 0.35, 0.006, 0.3, 0.4, 0.145, -2.0, 0x9ac26a, { rough: 0.3, opacity: 0.6, transparent: true, cast: false });
    spillPuddle.visible = false;

    // ------------------------------------------------------------------ hazards
    const corrodedTerminal = group(forklift, -0.15, 0.95, 0.65);
    ball(corrodedTerminal, 0.02, 0, 0, 0, 0xd8c98a, { rough: 0.8, seg: 10, seg2: 8 });
    reg(hits, corrodedTerminal, "corroded-terminal-hazard");

    const toolOnTerminals = group(g, -1.4, 0.3, -2.6);
    box(toolOnTerminals, 0.24, 0.02, 0.04, 0, 0, 0, 0xc0c6cc, { rough: 0.35, metal: 0.7 });
    reg(hits, toolOnTerminals, "tool-across-terminals-hazard");

    const chargedBattery = group(g, -1.9, 0.14, -3.3);
    box(chargedBattery, 0.4, 0.3, 0.5, 0, 0.15, 0, 0x59c97b, { rough: 0.5 });
    holoTag(chargedBattery, "charged battery", 0, 0.4, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, chargedBattery, "charged-battery");
    const compartmentSocket = group(forklift, 0, 0.9, 0.4);
    hits["compartment-socket"] = compartmentSocket;

    const eyewash = group(g, 2.4, 0, -2.3, -0.4);
    cyl(eyewash, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x8b929a, { rough: 0.5, metal: 0.4, seg: 10 });
    ball(eyewash, 0.06, 0, 0.92, 0, 0xdfe6ec, { rough: 0.4, metal: 0.3, seg: 12, seg2: 10 });
    holoTag(eyewash, "eyewash station", 0, 1.1, 0, { css: "#d2312b", w: 0.34 });
    reg(hits, eyewash, "eyewash-station");
    const eyewashBlockCase = group(g, 2.4, 0, -2.0);
    box(eyewashBlockCase, 0.4, 0.5, 0.4, 0, 0.25, 0, 0xc9a86b, { rough: 0.8, finish: "brushed" });
    reg(hits, eyewashBlockCase, "blocked-eyewash-hazard");

    const ventFan = group(g, 2.5, 0, -0.2, -0.3);
    cyl(ventFan, 0.3, 0.3, 0.1, 0, 2.0, 0, 0x8b929a, { rough: 0.5, metal: 0.4, seg: 16 });
    holoTag(ventFan, "ventilation fan", 0, 2.3, 0, { css: "#d2312b", w: 0.34 });
    const ventTarp = box(ventFan, 0.5, 0.5, 0.02, 0, 2.0, 0.06, 0x37505f, { rough: 0.8, opacity: 0.85, transparent: true });
    reg(hits, ventFan, "blocked-vent-hazard");
    void ventTarp;

    const intactCable = group(charger, -0.3, 0.8, 0.15);
    cyl(intactCable, 0.012, 0.012, 0.3, 0, 0, 0, 0x1c1e21, { rough: 0.7, finish: "rubber", seg: 8 });
    reg(hits, intactCable, "intact-charger-cable");

    // ------------------------------------------------------------------ PPE
    const ppeRack = group(g, -2.8, 0, 2.0, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const faceShieldProp = group(ppeRack, -0.1, 0.62, 0);
    box(faceShieldProp, 0.18, 0.14, 0.02, 0, 0, 0, 0xdfe6ec, { rough: 0.3, opacity: 0.7, transparent: true });
    holoTag(faceShieldProp, "face shield", 0, 0.16, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, faceShieldProp, "face-shield");
    const apronProp = box(ppeRack, 0.22, 0.3, 0.02, 0.2, 0.55, 0, 0x2b2f34, { rough: 0.75, finish: "rubber" });
    holoTag(apronProp, "rubber apron", 0, 0.22, 0, { css: "#d2312b", w: 0.34 });
    reg(hits, apronProp, "rubber-apron");

    // ------------------------------------------------------------------ crew, boards
    const associate = standingFigure(g, -2.7, -0.5, { ry: 0.9, cloth: 0x2b3138, vest: TW5_PAL.accent, helmet: 0xf2f2f2 });
    holoTag(associate, "warehouse associate", 0, 1.95, 0.15, { css: "#d2312b", w: 0.36 });
    const facilitiesRadio = group(g, -2.4, 0, -1.2, 0.3);
    box(facilitiesRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(facilitiesRadio, "facilities radio", 0, 1.35, 0, { css: "#d2312b", w: 0.34 });
    reg(hits, facilitiesRadio, "facilities-radio");

    const lead = standingFigure(g, 2.05, 1.9, { ry: -2.2, cloth: 0x37505f, vest: TW5_PAL.accent, helmet: 0xf2c14b });
    holoTag(lead, "shift lead", 0, 1.95, 0.15, { css: "#d2312b", w: 0.26 });
    const spillReport = group(g, 2.3, 0, 1.3, -0.4);
    box(spillReport, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(spillReport, "spill report", 0, 1.35, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, spillReport, "spill-report");

    const permitBoard = holoPanel(g, 0.58, 0.4, -2.7, 1.5, 1.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d2312b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e0a9a4";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("BATTERY-CHANGE PERMIT", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SDS ON FILE — BAY 3", w * 0.06, h * 0.36);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#c6a9a6";
      ["Eyewash + vent: confirm before start", "PPE: face shield + apron"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.58 + i * 0.15)));
    }, { ry: 0.5, accent: TWBC_ACCENT });
    reg(hits, permitBoard, "permit-board");

    const closingLog = group(g, 2.7, 0, -0.5, 0.5);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("BATTERY LOG\nOPEN", { bg: "#11181f", accent: "#d2312b", scale: 0.26 }), { px: 320 });
    holoTag(closingLog, "battery log", 0, 1.32, 0, { css: "#d2312b", w: 0.28 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ dressing
    const spareCharger = batteryChargingStation(g, 2.9, 0.14, -3.0, { ry: -0.6, colour: 0x8b929a });
    holoTag(spareCharger, "charger 4", 0, 1.9, 0, { css: "#d2312b", w: 0.28 });
    const parkedForklift = forkliftCounterbalance(g, -0.4, 0.14, 2.6, { ry: 2.8, livery: { colour: 0x8b929a, fleetName: "DOCK FLEET", unitNumber: "FL-11" } });
    holoTag(parkedForklift, "forklift FL-11", 0, 2.4, 0, { css: "#d2312b", w: 0.3 });

    return {
      hits,
      footprint: 2.7,

      onInterrupt(it) {
        if (it.id === "vent-fan-fault") { beacon.material = mat(0xd2312b, { emissive: 0xc01810, ei: 1.4, rough: 0.4 }); }
        if (it.id === "acid-spill-fault") { spillPuddle.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "vent-fan-fault") { beacon.material = mat(0x59c97b, { emissive: 0x2f7d4a, ei: 1.1, rough: 0.4 }); }
        if (it.id === "acid-spill-fault") { spillPuddle.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "bay-hazard-read") {
          eyewashBlockCase.visible = false;
          ventTarp.visible = false;
          corrodedTerminal.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "hood-open") { compartmentHood.rotation.x = -0.7; }
        if (step.id === "extract-battery") { spentBattery.visible = false; }
        if (step.id === "install-battery") { chargedBattery.visible = false; spentBattery.visible = true; spentBattery.children[0].material = mat(0x59c97b, { rough: 0.6 }); }
        if (step.id === "hood-close") { compartmentHood.rotation.x = 0; }
        if (step.id === "closing-log") {
          repaint(closingLogFace, signFace("BATTERY LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
        }
      },

      animate(t, dt, session) {
        associate.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        lead.userData.head.rotation.y = Math.sin(t * 0.6 + 1) * 0.4;
        if (session?.step?.id !== "vent-fan-fault") ventFan.rotation.y = t * 3;
        void dt;
      },
    };
  },
};
