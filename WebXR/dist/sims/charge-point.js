import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace,
  particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, equipmentCabinet, toolChest, cone, lockTag,
  instrument, barrierPanel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Charge Point VR — its own gamified system: Grid Certification.
// DC fast charger fault isolation, where the hazard is not the 400 V AC feed but
// the DC link that stays lethal after the supply is opened.

export const SIM_CHARGE_POINT = {
  id: "charge-point",
  index: "01",
  domain: "Energy",
  trade: "EV service technician",
  category: "Energy & Power",
  weather: "overcast",
  certification: "IBEW — NFPA 70E arc-flash qualified, EVITP-certified EV infrastructure technician",
  name: "Charge Point",
  title: simTitle("Charge Point"),
  tagline: "DC fast-charger fault isolation, capacitor discharge and busbar torque",
  accent: 0x59c97b,
  accentCss: "#59c97b",
  parSeconds: 205,
  badge: { id: "dc-clear", name: "DC Clear", note: "Full isolation with the DC link proven dead" },

  game: system({
    name: "Grid Certification",
    currency: "GRID",
    ranks: ["Bay Apprentice", "Bay Technician", "Commissioning Tech", "Fault Lead", "Grid Certified"],
    badges: [
      { id: "dc-clear", name: "DC Clear", note: "Prove the link dead before the guard comes off", test: AWARD.stepClean("verify") },
      { id: "hands-off", name: "Hands Off", note: "Finish without one unsafe contact", test: AWARD.safe },
      { id: "torque-spec", name: "Torque to Spec", note: "Hold every graded value near centre band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "full-wait", name: "Full Wait", note: "Never break the discharge hold", test: AWARD.unbroken },
      { id: "first-time", name: "First Time Right", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "bay-turnaround", name: "Bay Turnaround", note: "Restore service inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dc-busbar": "That is the DC link busbar. The supply being open means nothing here — the capacitors hold hundreds of volts for minutes after shutdown, and they will not let go once you are across them.",
    "damaged-cable": "That cable has a cut through to the screen. A damaged DC lead on a 350 kW charger is not a cosmetic fault; bin it and tag the unit out of service.",
    "interlock-bypass": "That jumper defeats the door interlock. Every bypass ever fitted 'just for testing' is still fitted. The interlock is the last thing standing between the next technician and the DC link.",
    "live-connector": "The vehicle is still in a charging session. Pulling a CCS connector under load draws a DC arc that will not self-extinguish — stop the session at the vehicle or the charger first.",
  },

  lateNotes: {
    "power-module": "The module comes out after the link is proven dead, not before.",
    "torque-wrench": "Nothing gets torqued while there is stored energy behind the panel.",
  },

  steps: [
    {
      id: "workorder", kind: "select", target: "work-order",
      title: "Read the work order and fault code",
      cue: "Open the job on the tablet: fault code, unit history, isolation plan.",
      why: "The fault code identifies which power module tripped and which feeder point supplies it — a dual-head 350 kW unit has two isolation points on one pad. Walk up and start opening doors without reading it first and you isolate the healthy bay while the faulted one, busbar included, stays live behind the next panel you touch.",
    },
    {
      id: "stopsession", kind: "select", target: "vehicle-hmi",
      title: "End the charging session",
      cue: "Stop the session at the vehicle side before touching anything.",
      why: "A controlled stop ramps the charging current down to zero over several seconds and releases the connector latch; every step after this assumes the cable is carrying no load. Pull the plug at the vehicle before the session ends and you snap a live DC connection apart under full current instead of an open one.",
    },
    {
      id: "barrier", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "barrier-rail"],
      itemNames: { "cone-a": "cone at the bay entry", "cone-b": "cone at the kerb side", "barrier-rail": "barrier across the bay" },
      title: "Establish the work zone",
      cue: "Close the bay: two cones and the barrier.",
      why: "A charging bay sits in a live traffic lane on a forecourt that never closes for your job. The cones and barrier tell a driver pulling in for the next bay that this one is occupied by a person, not an idle charger, while your head and hands are inside an open cabinet door.",
    },
    {
      id: "ppe", kind: "select", target: "ppe-case",
      title: "Don class 0 gloves and face shield",
      cue: "Take the insulating gloves and shield from the case.",
      why: "Class 0 rubber gloves rated to 1,000 V, worn under leather protectors, plus a face shield, go on before the door opens, not after the meter reads clear. The DC link behind that guard does not care that the upstream AC supply is off — it stays a stored-energy hazard until it is proven dead, and the glove class is chosen for that voltage.",
    },
    {
      id: "isolate", kind: "turn", target: "ac-disconnect",
      title: "Open the upstream AC disconnect",
      cue: "Swing the feeder disconnect handle on the supply pillar all the way down to OFF.",
      why: "Isolate at the source feeder, not at the charger's own contactor — a control-level stop is software, not an isolation, and OSHA's 29 CFR 1910.333 electrical safe-work-practice rule requires the equipment be placed in an electrically safe condition before anyone works on it. The handle has to swing fully over; a disconnect blade left partway across the gap is still close enough to strike an arc if it is bumped.",
      turn: { turns: 0.25, axis: "z", reverse: true, label: "FEEDER DISCONNECT" },
    },
    {
      id: "lock", kind: "select", target: "lock-station",
      title: "Lock and tag the disconnect",
      cue: "Apply your padlock and tag to the disconnect handle.",
      why: "Your lock, your key, your tag with your name on it — the disconnect stays open only as long as nobody else has a reason to believe it's clear to close. A charger that comes back to life while your hands are inside the module bay is a charger someone else re-energised because there was nothing on that handle telling them not to.",
    },
    {
      id: "discharge", kind: "hold", target: "discharge-timer", seconds: 12,
      title: "Wait out the DC link discharge",
      cue: "Hold at the discharge timer for the full manufacturer wait.",
      why: "The bleed resistors need the manufacturer's full stated time to pull the link capacitors down from hundreds of volts to a safe residual; the discharge curve is not linear, and the last dangerous fraction of it lingers after most of the voltage looks gone. Counting to ten and cracking the panel early is how a technician learns, once, exactly what a charged DC link feels like across two fingers.",
      holdBreakNote: "You broke the wait. The capacitors are still holding charge — start the full discharge period again.",
    },
    {
      id: "verify", kind: "gauge", target: "dc-meter",
      title: "Prove the DC link is dead",
      cue: "Meter across the DC link and commit when the reading is safe.",
      why: "Absence of voltage is measured with a CAT IV meter, never assumed from a timer running out — a bleed resistor can fail open and leave the link fully charged with no outward sign of it. The reading has to sit below the manufacturer's safe threshold before the guard comes off; anything higher means the discharge circuit didn't finish its job.",
      gauge: {
        label: "DC LINK — TERMINAL VOLTAGE", speed: 0.65, green: [0.0, 0.1],
        readout: (t) => `${Math.round(t * 820)} V DC`,
        missNote: "Still holding charge. Leave the leads on and let it bleed down — do not open the guard at that voltage.",
      },
    },
    {
      id: "swap", kind: "drag", target: "power-module",
      title: "Withdraw the faulty power module",
      cue: "Slide the failed module out of the stack and set it on the module cart.",
      why: "Modules are hot-swap rated in service, not in fault. With the link proven dead you can handle it without the arc risk. It goes straight onto the cart, because a module left on the ground gets stepped on and one left in the van gets fitted to the next job.",
      drag: { to: "module-cart", radius: 0.45, missNote: "Not on the cart — a failed module put down anywhere else is a module that ends up back in a charger." },
    },
    {
      id: "torque", kind: "gauge", target: "torque-wrench",
      title: "Torque the busbar connection",
      cue: "Set the wrench and torque the busbar bolt to specification.",
      why: "Under-torqued busbar bolts leave a high-resistance joint that runs hot under load, loosens further and eventually arcs or welds itself together; over-torqued ones crack the lug or strip the thread and fail from the other direction. The number on the manufacturer's label is the number — not a starting point to feel for by hand.",
      gauge: {
        label: "BUSBAR TORQUE", speed: 0.8, green: [0.46, 0.6],
        readout: (t) => `${(8 + t * 34).toFixed(1)} N·m`,
        missNote: "Off specification. A joint outside the torque window is a future thermal fault — reset and take it again.",
      },
    },
    {
      id: "restore", kind: "select", target: "commission-tablet",
      title: "Restore and test-charge",
      cue: "Remove the lock, re-energise and run a commissioning session.",
      why: "The job is not finished at the bolted joint. A test session under real load is what actually proves the fix — a module can look seated and torqued correctly and still fault the instant current flows through it, and the only way to find that out is on your shift, not the next customer's.",
    },
  ],

  interrupts: [
    {
      id: "bay-encroached",
      kind: "Bay incursion",
      after: "discharge", delay: 3, seconds: 14,
      alert: "A car has come round the cones and nosed into the bay behind you. The driver is out, the barrier is shoved over against the kerb and he is looking for the other gun.",
      cue: "You are stood still at a timer for ten minutes. That is the whole window.",
      target: "barrier-rail",
      why: "A charge point is not a plant room; it is a parking space on a forecourt with a queue behind it, and the people in that queue have no idea what a technician standing still for ten minutes is doing. The discharge wait is the longest stretch of this job where nothing appears to be happening, which makes it the stretch in which the work zone gets taken apart by strangers. The zone goes back up before anything else, because what comes next is a cabinet open onto an eight-hundred-volt link at about the height of a child.",
      missNote: "The bay stayed open with a car and a member of the public inside it. The service door is swung wide onto the module stack, the DC link sits behind a guard anybody can lift, and the only thing keeping a stranger out of it was luck.",
      wrongNote: "It is the barrier. The work zone is what makes the rest of this procedure safe, and somebody has just taken it apart.",
    },
    {
      id: "handle-moved",
      kind: "Isolation disturbed",
      after: "swap", delay: 3, seconds: 12,
      alert: "Over at the supply pillar your padlock is lying on the top cap and the feeder handle has been swung part of the way back. The site's duty electrician is stood at it chasing a trip on the next bay.",
      cue: "You have a module in your hands and somebody else has your isolation.",
      target: "ac-disconnect",
      why: "A lock is a claim on a piece of equipment, and it only works if the person who finds it can read whose it is and get hold of them. Feeder pillars on retail sites are shared between the chargers, the lighting and the wash, and a tag gone soft in the rain is a tag nobody will honour at seven in the evening with a queue building. Get the handle back over to OFF first: the argument about the lock can wait, because the handle is the part that decides whether the busbar in front of you is live.",
      missNote: "The handle went the rest of the way over with the guard off and a module out of the stack. Four hundred volts came back into a cabinet that had a person inside it, and the first anybody knew about it was the unit booting.",
      wrongNote: "The handle is the thing that has moved. Put the isolation back where you left it before you deal with anything else on that pillar.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 1.95, 0x59c97b);

    // ------------------------------------------------------------- the charger
    const charger = group(g, -0.55, 0, -0.85, 0.28);
    slab(charger, 0.82, 1.95, 0.52, 0, 0.98, 0, 0x27313a, { radius: 0.05, rough: 0.42, metal: 0.45 });
    box(charger, 0.88, 0.06, 0.58, 0, 1.99, 0, 0x1c242b, { rough: 0.5, metal: 0.4 });
    box(charger, 0.9, 0.1, 0.6, 0, 0.05, 0, 0x171d23, { rough: 0.8 });
    // Branding band and status light bar.
    box(charger, 0.84, 0.05, 0.53, 0, 1.72, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 });
    const statusBar = box(charger, 0.06, 1.2, 0.02, 0.42, 1.05, 0.255, 0x59c97b,
      { emissive: 0x59c97b, ei: 1.9, rough: 0.4 });
    const hmi = decal(charger, 0.46, 0.34, 0, 1.34, 0.262,
      signFace("CHARGING\n62 kW", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }),
      { glow: true, ei: 0.9, px: 448 });
    reg(hits, hmi, "vehicle-hmi");
    holoTag(charger, "Bay 04 · 350 kW", 0, 2.16, 0.1, { css: "#59c97b" });

    // Service door, swung open to the module stack and the DC link behind a guard.
    const door = group(charger, -0.41, 1.0, 0.26);
    box(door, 0.8, 1.5, 0.03, 0.4, 0, 0, 0x2f3a44, { rough: 0.42, metal: 0.5 });
    box(door, 0.03, 0.12, 0.03, 0.74, 0, 0.03, CITY.steel, { rough: 0.3, metal: 0.9 });
    door.rotation.y = 1.05;
    decal(door, 0.3, 0.2, 0.4, 0.4, 0.017,
      signFace("DANGER\n1000 V DC", { bg: "#b81410", accent: "#f2ae14", fg: "#ffffff", scale: 0.3 }));

    const bay = group(charger, 0, 1.0, 0.14);
    box(bay, 0.72, 1.44, 0.05, 0, 0, -0.12, 0x11161b, { rough: 0.9 });
    const modules = [];
    for (let i = 0; i < 4; i++) {
      const m = group(bay, 0, 0.5 - i * 0.32, 0);
      box(m, 0.66, 0.27, 0.3, 0, 0, -0.02, i === 1 ? 0x4a2b2b : 0x232b32, { rough: 0.5, metal: 0.4 });
      for (let v = 0; v < 5; v++) box(m, 0.02, 0.19, 0.01, -0.24 + v * 0.06, 0, 0.13, 0x11161b, { rough: 0.7 });
      ball(m, 0.011, 0.26, 0.09, 0.14, i === 1 ? CITY.alert : CITY.good,
        { emissive: i === 1 ? CITY.alert : CITY.good, ei: 2.4 });
      decal(m, 0.16, 0.05, 0.02, -0.09, 0.14, signFace(`PM-${i + 1}`, { scale: 0.6, accent: "#59c97b" }));
      modules.push(m);
    }
    reg(hits, modules[1], "power-module");

    // DC link busbar behind a clear guard — reachable, which is the point.
    const link = group(bay, 0, -0.62, 0.02);
    for (const sx of [-1, 1]) {
      box(link, 0.05, 0.2, 0.014, sx * 0.14, 0, -0.04, 0xb87333, { rough: 0.3, metal: 0.95 });
      box(link, 0.08, 0.05, 0.03, sx * 0.14, -0.08, -0.02, 0x6d757d, { rough: 0.4, metal: 0.85 });
    }
    box(link, 0.4, 0.03, 0.02, 0, 0.08, -0.04, 0xb87333, { rough: 0.3, metal: 0.95 });
    const guard = box(link, 0.46, 0.26, 0.01, 0, 0, 0.06, 0xbfe4f2,
      { rough: 0.1, opacity: 0.28, metal: 0.1 });
    decal(link, 0.2, 0.05, 0, 0.16, 0.062, signFace("DC LINK", { bg: "#2a1416", accent: "#f0645b", scale: 0.6 }));
    reg(hits, link, "dc-busbar");
    const dcSpark = particles(link, 60, 0xbfe4ff, { size: 0.014, life: 0.3 });

    // Interlock jumper hanging on the door frame — the shortcut.
    const jumper = group(charger, 0.3, 1.55, 0.3);
    hose(jumper, [[0, 0, 0], [0.05, -0.08, 0.03], [0.02, -0.16, 0]], 0.006, 0xf2c14b, { steps: 10 });
    for (const y of [0, -0.16]) box(jumper, 0.02, 0.014, 0.014, y === 0 ? 0 : 0.02, y, 0, 0xb8402f, { rough: 0.5 });
    reg(hits, jumper, "interlock-bypass");

    // ---------------------------------------------------------- the vehicle side
    const vehicle = group(g, 1.35, 0, -0.5, -0.3);
    slab(vehicle, 1.1, 0.5, 2.0, 0, 0.62, 0, 0x33424f, { radius: 0.14, rough: 0.35, metal: 0.5 });
    slab(vehicle, 0.95, 0.34, 1.15, 0, 0.98, -0.1, 0x1b232b, { radius: 0.12, rough: 0.2, metal: 0.3, opacity: 0.85 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const wheel = cyl(vehicle, 0.28, 0.28, 0.17, sx * 0.52, 0.28, sz * 0.66, 0x14171a, { rough: 0.9, seg: 18 });
      wheel.rotation.z = Math.PI / 2;
      const rim = cyl(vehicle, 0.16, 0.16, 0.18, sx * 0.52, 0.28, sz * 0.66, 0x99a3ab, { rough: 0.35, metal: 0.8, seg: 14 });
      rim.rotation.z = Math.PI / 2;
    }
    const inlet = group(vehicle, -0.56, 0.72, 0.5);
    cyl(inlet, 0.07, 0.07, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.5, seg: 16 }).rotation.z = Math.PI / 2;
    const connector = group(inlet, -0.1, 0, 0);
    slab(connector, 0.16, 0.13, 0.13, 0, 0, 0, 0x22272c, { radius: 0.03, rough: 0.5 });
    cyl(connector, 0.055, 0.055, 0.06, 0.08, 0, 0, 0x2b3138, { rough: 0.5, seg: 14 }).rotation.z = Math.PI / 2;
    const cable = hose(g, [[0.78, 0.72, -0.05], [0.4, 0.45, 0.35], [0.05, 0.3, 0.4], [-0.25, 1.1, -0.35]],
      0.026, 0x14171a, { steps: 26, rough: 0.85 });
    reg(hits, connector, "live-connector");

    // A cut spare lead coiled on the ground — the trap.
    const spare = group(g, 0.35, 0, 0.95);
    torus(spare, 0.24, 0.024, 0, 0.026, 0, 0x14171a, { rough: 0.85, seg: 8, seg2: 26 })
      .rotation.x = Math.PI / 2;
    torus(spare, 0.19, 0.024, 0, 0.07, 0.01, 0x14171a, { rough: 0.85, seg: 8, seg2: 26 })
      .rotation.x = Math.PI / 2;
    box(spare, 0.05, 0.02, 0.03, 0.19, 0.08, 0.02, 0xb87333, { rough: 0.35, metal: 0.9 });   // exposed screen
    holoTag(spare, "Spare lead", 0, 0.3, 0, { css: "#f0645b", w: 0.24 });
    reg(hits, spare, "damaged-cable");

    // Somewhere for the failed module to go. A module out of the stack has to
    // be put down on something, and where it is put down is the difference
    // between it being scrapped and it being fitted to the next charger.
    const cart = group(g, -2.05, 0, 0.6, 0.5);
    box(cart, 0.8, 0.05, 0.5, 0, 0.62, 0, 0x3a4550, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(cart, 0.022, 0.022, 0.6, sx * 0.34, 0.31, sz * 0.19, CITY.darkSteel, { rough: 0.5, metal: 0.7, seg: 8 });
      cyl(cart, 0.05, 0.05, 0.03, sx * 0.34, 0.04, sz * 0.19, 0x15191d, { rough: 0.85, seg: 10 }).rotation.z = Math.PI / 2;
    }
    box(cart, 0.04, 0.34, 0.04, -0.38, 0.81, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    box(cart, 0.04, 0.04, 0.46, -0.38, 0.98, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    decal(cart, 0.5, 0.1, 0.06, 0.651, -0.16, signFace("FAULTY MODULE", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.5 }));
    holoTag(cart, "Module cart", 0, 1.16, 0, { css: "#8fa9c4", w: 0.28 });
    hits["module-cart"] = cart;

    // ------------------------------------------------------ supply pillar + LOTO
    const pillar = equipmentCabinet(g, 0.5, 1.15, 0.32, -1.55, 0.35,
      { ry: 0.9, color: 0x5c666f, metal: 0.55 });
    decal(pillar, 0.3, 0.09, 0, 1.32, 0.17, signFace("FEEDER 12", { accent: "#59c97b", scale: 0.55 }));
    const discBody = group(pillar, 0.16, 0.85, 0.17);
    box(discBody, 0.16, 0.2, 0.05, 0, 0, 0, 0x22272c, { rough: 0.45, metal: 0.6 });
    const handlePivot = group(discBody, 0, 0, 0.04);
    box(handlePivot, 0.045, 0.14, 0.04, 0, 0.06, 0, CITY.hiVis, { rough: 0.5 });
    const hasp = torus(discBody, 0.022, 0.006, -0.07, -0.07, 0.04, CITY.steel, { rough: 0.3, metal: 0.9 });
    hasp.rotation.y = Math.PI / 2;
    reg(hits, handlePivot, "ac-disconnect");
    const appliedLock = lockTag(discBody, -0.07, -0.07, 0.06);
    appliedLock.visible = false;

    const lockBoard = group(g, -1.75, 0, -0.55, 1.1);
    box(lockBoard, 0.42, 0.34, 0.04, 0, 1.15, 0, 0xd8232a, { rough: 0.6 });
    decal(lockBoard, 0.38, 0.07, 0, 1.28, 0.025, signFace("LOCKOUT", { bg: "#7d1512", accent: "#f2ae14", scale: 0.6 }));
    for (let i = 0; i < 4; i++) lockTag(lockBoard, -0.14 + i * 0.09, 1.1, 0.03, { color: [0xd8232a, 0x1f7ae0, 0x28a745, 0xf2c14b][i] });
    cyl(lockBoard, 0.03, 0.035, 1.0, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    reg(hits, lockBoard, "lock-station");

    // ------------------------------------------------------------- technician kit
    const chest = toolChest(g, 1.45, 1.15, { ry: -0.6 });
    const ppe = group(chest, 0, 0.76, 0);
    slab(ppe, 0.4, 0.1, 0.28, 0, 0.05, 0, 0x1f2830, { radius: 0.02, rough: 0.5 });
    for (const sx of [-1, 1]) {
      cyl(ppe, 0.045, 0.05, 0.16, sx * 0.09, 0.16, 0, 0xd4622b, { rough: 0.85, seg: 12 });
      box(ppe, 0.08, 0.09, 0.04, sx * 0.09, 0.26, 0, 0xd4622b, { rough: 0.85 });
    }
    const shield = ball(ppe, 0.09, 0, 0.14, -0.12, 0xffb26b, { rough: 0.12, opacity: 0.5, side: 2 });
    shield.scale.set(1, 0.8, 0.55);
    holoTag(ppe, "Class 0 kit", 0, 0.4, 0, { css: "#59c97b", w: 0.26 });
    reg(hits, ppe, "ppe-case");

    const meter = instrument(chest, -0.1, 0.79, 0.06, { ry: 0.4, idle: "0.0 V" });
    holoTag(meter, "CAT IV meter", 0, 0.16, 0, { css: "#59c97b", w: 0.26 });
    reg(hits, meter, "dc-meter");

    const wrench = group(chest, 0.16, 0.79, -0.06, -0.5);
    box(wrench, 0.035, 0.03, 0.34, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    box(wrench, 0.05, 0.035, 0.07, 0, 0, -0.18, CITY.steel, { rough: 0.3, metal: 0.9 });
    const wrenchScale = decal(wrench, 0.03, 0.12, 0.019, 0.005, 0.06,
      signFace("22", { bg: "#1b2026", accent: "#59c97b", scale: 0.7 }), { px: 128 });
    wrenchScale.rotation.y = Math.PI / 2;
    holoTag(wrench, "Torque wrench", 0, 0.14, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, wrench, "torque-wrench");

    // --------------------------------------------------------- work zone hardware
    const coneA = cone(g, -0.2, 1.5);
    reg(hits, coneA, "cone-a");
    reg(hits, cone(g, 1.9, 0.45), "cone-b");
    const barrier = barrierPanel(g, 0.7, 1.75, { ry: 0.1 });
    reg(hits, barrier, "barrier-rail");
    const barrierHome = { x: barrier.position.x, z: barrier.position.z, ry: barrier.rotation.y };

    // ------------------------------------------------------------- holo paperwork
    const order = holoPanel(g, 0.56, 0.4, -1.6, 1.5, -1.35, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK ORDER  WO-4471", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("FAULT 0x2E — PM-2 OVERTEMP", w * 0.06, h * 0.32);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Unit: Bay 04 · 350 kW dual CCS", "Isolation: feeder 12 disconnect",
       "DC link bleed: 10 min stated", "Busbar torque: 22 N·m",
       "Return to service: 1 test session"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.48 + i * 0.11));
      });
    }, { ry: 0.65, accent: 0x59c97b });
    reg(hits, order, "work-order");

    const commission = holoPanel(g, 0.44, 0.3, 1.75, 1.35, -1.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("COMMISSIONING", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ctx.fillText("Restore · test session · release", w / 2, h * 0.58);
      ctx.fillText("unit to service", w / 2, h * 0.76);
    }, { ry: -0.6, accent: 0x59c97b });
    reg(hits, commission, "commission-tablet");

    // Discharge timer post — the thing you actually stand and wait at.
    const timer = group(g, -1.15, 0, 0.95, 0.6);
    cyl(timer, 0.03, 0.04, 1.05, 0, 0.52, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    box(timer, 0.28, 0.2, 0.05, 0, 1.14, 0, 0x1b232b, { rough: 0.5, metal: 0.3 });
    const timerFace = decal(timer, 0.24, 0.15, 0, 1.14, 0.028,
      signFace("WAIT\n10:00", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.34 }),
      { glow: true, ei: 0.9, px: 320 });
    holoTag(timer, "Discharge timer", 0, 1.34, 0.03, { css: "#f2c14b", w: 0.32 });
    reg(hits, timer, "discharge-timer");

    let energised = true;
    let dcVolts = 780;
    let arcTimer = 0;

    return {
      hits,
      footprint: 1.95,

      onStepComplete(step) {
        if (step.id === "stopsession") {
          repaint(hmi, signFace("SESSION\nENDED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
        if (step.id === "isolate") {
          energised = false;
          handlePivot.rotation.z = -Math.PI / 2;
          statusBar.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.2, rough: 0.4 });
          repaint(hmi, signFace("ISOLATED", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.36 }));
        }
        if (step.id === "lock") appliedLock.visible = true;
        if (step.id === "discharge") dcVolts = 6;
        if (step.id === "verify") {
          guard.visible = false;
          repaint(timerFace, signFace("SAFE\n0 V", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.34 }));
        }
        if (step.id === "swap") modules[1].position.x = 0.55;
        if (step.id === "restore") {
          statusBar.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.9, rough: 0.4 });
          repaint(hmi, signFace("READY\n350 kW", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },

      onHazard(hitId) { if (hitId === "dc-busbar" && dcVolts > 60) arcTimer = 0.5; },

      // The bay really gets opened up, and the isolation really moves.
      onInterrupt(it) {
        if (it.id === "bay-encroached") {
          barrier.position.x = barrierHome.x + 0.62;
          barrier.position.z = barrierHome.z - 0.3;
          barrier.rotation.y = barrierHome.ry + 0.7;
          coneA.rotation.z = 1.35;
        }
        if (it.id === "handle-moved") {
          appliedLock.visible = false;
          handlePivot.rotation.z = -0.5;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bay-encroached") {
          barrier.position.x = barrierHome.x;
          barrier.position.z = barrierHome.z;
          barrier.rotation.y = barrierHome.ry;
          coneA.rotation.z = 0;
        }
        if (it.id === "handle-moved") {
          appliedLock.visible = true;
          handlePivot.rotation.z = -Math.PI / 2;
        }
      },

      animate(t, dt, session) {
        statusBar.material.emissiveIntensity = 1.5 + Math.sin(t * 2.2) * 0.5;

        // The discharge timer counts down while the learner actually stands there.
        const step = session?.step;
        if (step?.id === "discharge") {
          const left = Math.max(0, step.seconds - (session.holdFor ?? 0));
          const mm = Math.floor((left / step.seconds) * 10);
          const ss = Math.floor(((left / step.seconds) * 600) % 60);
          repaint(timerFace, signFace(`WAIT\n${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`, {
            bg: session.holding ? "#0d1c14" : "#2a1a0d",
            accent: session.holding ? "#59c97b" : "#f2c14b",
            fg: session.holding ? "#bff7d4" : "#ffe3ac", scale: 0.34,
          }));
          dcVolts = 780 * (1 - (session.holdFor ?? 0) / step.seconds);
        }

        if (arcTimer > 0) {
          arcTimer -= dt;
          dcSpark.visible = true;
          dcSpark.userData.step(dt, new THREE.Vector3(0, 0, 0.04), 0.16, 1.8, -3.5);
        } else if (dcSpark.visible) dcSpark.visible = false;

        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "verify") {
          const v = Math.round(gg.t * 820);
          repaint(meter.userData.screen, signFace(`${v} V`, {
            bg: "#0d1c24", accent: v < 60 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.62,
          }));
        }
        if (gg && !gg.committed && step?.id === "torque") {
          repaint(wrenchScale, signFace(`${Math.round(8 + gg.t * 34)}`, {
            bg: "#1b2026", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f2c14b", scale: 0.7,
          }));
        }
      },
    };
  },
};
