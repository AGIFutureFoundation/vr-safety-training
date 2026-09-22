import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, instrument, equipmentCabinet, rackFrame, rackUnit, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cell Site Battery VR — Connectivity & Telecom, station three.
// Replacing a failed string in a cell site's -48 V DC plant: the plant stays
// live because the site cannot go dark, so the work is done on an isolated
// string with insulated tools, the cabinet ventilated for hydrogen, the
// terminals covered, and the new string checked cell by cell before it goes
// back on the bus. A dropped wrench across a battery terminal is a weld.

const CB_ACCENT = 0xa78bfa;

export const SIM_CELL_SITE_BATTERY = {
  id: "cell-site-battery",
  index: "32",
  domain: "Telecom",
  trade: "Cell site / DC power technician",
  category: "Connectivity & Telecom",
  weather: "overcast",
  certification: "CWA — telecom DC power plant (−48 V) technician; OSHA 29 CFR 1910.305(j)(7) / IEEE 450 stationary battery maintenance; NFPA 70E for the electrical work",
  name: "Cell Site Battery",
  title: simTitle("Cell Site Battery"),
  tagline: "−48 V plant string replacement: ventilate for hydrogen, PPE, isolate the string, insulated tools, terminal covers, cell checks, return to bus",
  accent: CB_ACCENT,
  accentCss: "#a78bfa",
  parSeconds: 240,
  footprint: 2.2,
  badge: { id: "string-swapped-live", name: "String Swapped Live", note: "A battery string replaced on a live plant with the cabinet ventilated, tools insulated, terminals covered and every cell checked" },

  game: system({
    name: "Plant Authority",
    currency: "CELL",
    ranks: ["Site Tech", "Power Tech", "Plant Lead", "Regional Power Lead", "Plant Authority Certified"],
    badges: [
      { id: "ventilated", name: "Ventilated", note: "Cabinet ventilated before a terminal was touched, first time", test: AWARD.stepClean("ventilate") },
      { id: "no-short", name: "No Short", note: "Never bridged a terminal, never worked bare-tooled", test: AWARD.safe },
      { id: "cells-true", name: "Cells True", note: "Float voltage and cell readings inside spec", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-swap", name: "Clean Swap", note: "No corrections through the whole swap", test: AWARD.clean },
      { id: "torque-held", name: "Torque Held", note: "Held the terminal torque the full count", test: AWARD.unbroken },
      { id: "site-up-fast", name: "Site Up Fast", note: "String back on bus inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-wrench": "You picked up the uninsulated wrench. Across two battery terminals it is a dead short with hundreds of amps behind it — it welds itself to the posts and sprays molten metal at your face. Insulated tools, and one hand at a time.",
    "ring-on": "You went at the terminals with your ring on. Metal jewellery across a terminal is a short that does not come off; it goes in your pocket before the cabinet opens.",
    "no-vent-spark": "You used the cordless drill inside the unventilated cabinet. Charging batteries make hydrogen; the cabinet is ventilated and checked before a tool that can spark goes inside it.",
    "wrong-string": "You started on string 2 — the live string still feeding the bus. The failed string is isolated at its breaker and identified before a terminal is touched; the other string is what keeps the site up.",
  },

  lateNotes: {
    "string-breaker": "Ventilate and gear up before the breaker — the hydrogen and the PPE come before any switching.",
    "bus-return": "The new string is checked cell by cell before it goes back on the bus.",
  },

  steps: [
    {
      id: "mop", kind: "select", target: "mop-sheet",
      title: "Read the method of procedure",
      cue: "Check which string failed, the plant voltage, the breaker, and the torque figures.",
      why: "The MOP is what turns this from a guess into a job: it names the exact string that failed, the breaker that isolates it, and the torque figure the manufacturer publishes for that link, on a plant that never goes fully dark for the job. Working from memory on a live −48 V plant is how a tech opens the breaker feeding the site instead of the one feeding the dead string.",
    },
    {
      id: "ventilate", kind: "select", target: "vent-fan",
      title: "Ventilate the cabinet and check for hydrogen",
      cue: "Start the cabinet fan, open the door, and read the hydrogen monitor before any tool goes in.",
      why: "Every cell on charge is off-gassing hydrogen continuously, not just when it is being worked on, and a cabinet that has been closed up for a week can hold enough of it that a single tool spark is all it takes to ignite the head-space above the strings. The fan runs and the monitor reads below the limit before a screwdriver, let alone a wrench, goes anywhere near a terminal.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["face-shield", "insulated-gloves", "jewellery-off"],
      itemNames: { "face-shield": "face shield", "insulated-gloves": "insulated gloves", "jewellery-off": "jewellery off" },
      title: "Face shield, insulated gloves, jewellery off",
      cue: "Shield for acid and arc, gloves for the terminals, ring and watch in the pocket.",
      why: "A short across a stationary battery is not a quiet event — it is a flash and a spray of electrolyte from a cell that can push several hundred amps into whatever bridges its posts. The shield and the insulated gloves are sized for exactly that failure, and the ring comes off first because a wedding band across two terminals does not need a dropped tool to complete the circuit — a hand resting the wrong way is enough.",
    },
    {
      id: "isolate", kind: "turn", target: "string-breaker",
      title: "Isolate the failed string",
      cue: "Open string 1's breaker and confirm the plant is carrying the load on string 2 and the rectifiers.",
      why: "Opening the string's own breaker is what actually takes it off the bus rather than merely disconnecting the tech's attention from it — the plant keeps running the whole time on the rectifiers and string 2, which is the entire point of a dual-string design. Skip the breaker and every terminal on the failed string is still riding the same −48 V the site depends on.",
      turn: { turns: 0.5, axis: "y", label: "STRING 1" },
    },
    {
      id: "verify", kind: "gauge", target: "dc-meter",
      title: "Verify the string is off the bus",
      cue: "Read across the string breaker's load side and commit once it shows the string isolated.",
      why: "An open breaker handle is a claim about the world, not a measurement of it — a welded contact, a mislabeled panel, or a breaker thrown on the wrong string all look identical from the front of the cabinet. The meter reading across the load side is what actually tells a tech whether the terminals about to be touched are riding the bus voltage or sitting at zero.",
      gauge: { label: "STRING VOLTS", speed: 0.75, green: [0.4, 0.56], readout: (t) => `${(t * 60).toFixed(1)} V`, missNote: "That is not an isolated string — recheck the breaker and read it again." },
    },
    {
      id: "covers", kind: "sequence", anyOrder: true,
      targets: ["cover-a", "cover-b", "cover-c"],
      itemNames: { "cover-a": "terminal cover 1", "cover-b": "terminal cover 2", "cover-c": "terminal cover 3" },
      title: "Cover the adjacent terminals",
      cue: "Insulating covers on every terminal you are not working on.",
      why: "An insulated wrench only protects the two posts it is actually touching, and a live cabinet has a dozen more within reach of a hand or an elbow bracing against the rack. Covering every terminal but the one currently in hand is what keeps an ordinary slip a non-event instead of the moment a socket or a forearm bridges two live posts on the string next door.",
    },
    {
      id: "swap", kind: "drag", target: "new-battery",
      title: "Fit the replacement battery",
      cue: "Carry the new battery from the cart and set it in the string's empty position.",
      why: "A stationary battery string only floats correctly when every cell in it is the same model at the same state, in the same orientation the manufacturer specified — the replacement goes into the exact bay the failed cell came out of, terminals facing the bus, checked against the position twice before a single intercell link is torqued down onto it.",
      drag: { to: "battery-socket", radius: 0.4, missNote: "Not in the string position — set it in the empty bay, terminals facing the bus." },
    },
    {
      id: "torque", kind: "hold", target: "torque-wrench", seconds: 4,
      title: "Torque the intercell links",
      cue: "Insulated torque wrench on each link, one hand, hold to the click.",
      why: "An under-torqued link is a loose connection that heats under load until it eventually fails open on the busiest night of the year, and an over-torqued one cracks the post it is clamped to, which fails in exactly the same way but sooner. The manufacturer's figure, an insulated wrench, and one hand kept clear of every other terminal is what makes this a routine step instead of the moment that creates the next outage.",
      holdBreakNote: "Came off before the click — the link is under-torqued. Set it again.",
    },
    {
      id: "cells", kind: "gauge", target: "cell-meter",
      title: "Check the string cell by cell",
      cue: "Read each cell's voltage on the new string and commit inside the float band.",
      why: "A string is only as good as its weakest cell — one reading low drags the whole string's capacity down with it, and one reading high is already cooking itself toward the failure that put the last cell in this same bay. Every cell on the new string reads inside the float band before anyone trusts it to sit on the bus next to a string that has been floating there for years.",
      gauge: { label: "CELL", speed: 0.75, green: [0.45, 0.6], readout: (t) => `${(2.1 + t * 0.3).toFixed(3)} V`, missNote: "Cell out of the float band — do not return the string; find the cell." },
    },
    {
      id: "return", kind: "select", target: "bus-return",
      title: "Return the string to the bus",
      cue: "Close string 1's breaker and confirm both strings share the load.",
      why: "Closing the breaker only returns the string to the bus; it does not by itself prove the two strings are actually sharing the load the way a healthy plant should. That gets confirmed at the plant controller before the cabinet doors close, because a string that closes onto the bus but never picks up its share is a failure the site will not notice until the other string is asked to carry all of it alone.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["corroded-post"],
      itemNames: { "corroded-post": "corroded post on string 2" },
      itemNotes: { "corroded-post": "String 2's positive post is crusted with sulfate — a high-resistance connection that will drop the site on the next outage. It is on the next MOP, today." },
      title: "Walk the plant before closing up",
      cue: "Inspect the other string and the bus before the cabinet closes; click what needs the next MOP.",
      why: "The site is up right now on string 2, and a corroded post that reads fine under float voltage today is exactly the connection that opens under load the next time the rectifiers drop out and the plant needs everything that string can give. Whether the site survives that outage depends on whether somebody wrote up the sulfate crust on the way out or left it for the next crew to find the hard way.",
    },
  ],

  interrupts: [
    {
      id: "cabinet-door-swings-shut",
      kind: "Hydrogen climbing",
      after: "torque", delay: 2, seconds: 12,
      alert: "The cabinet door has swung most of the way shut behind you while both hands are on the torque wrench, and the H₂ reading you cleared ten minutes ago is climbing back into the amber.",
      cue: "The cabinet's closing up on you.",
      target: "vent-fan",
      why: "Ventilating the cabinet once at the start of the job clears the reading for that moment only — hydrogen keeps coming off every cell on charge for as long as the plant is live, and a door that swings most of the way shut cuts the fan's draw across the head-space back down to almost nothing. IEEE 450's ventilation guidance for stationary battery rooms assumes continuous clearance for exactly this reason, and a hand still on an insulated wrench between two live posts is the worst possible moment to be working inside a cabinet that has quietly stopped venting.",
      missNote: "The door stayed most of the way shut through the whole torque sequence with hydrogen climbing behind it. Nothing sparked this time, but an insulated wrench slipping half an inch onto a bare post in that cabinet would have had exactly the ignition source the ventilation step exists to keep away from that gas.",
      wrongNote: "It's the fan and the door, not the link. The torque you're holding right now isn't what's putting hydrogen back into the air around you.",
    },
    {
      id: "backfeed-on-string-1",
      kind: "Isolation in doubt",
      after: "swap", delay: 3, seconds: 13,
      alert: "With the new cell seated but its intercell links not yet made up, the plant controller flags a few tenths of a volt on string 1's isolated side — a shared load lead nobody accounted for may be back-feeding it.",
      cue: "String 1 isn't reading dead anymore.",
      target: "dc-meter",
      why: "An isolation verified once, before the cabinet was opened, does not stay verified through everything that happens afterward — seating a new cell changes the string's wiring at exactly the moment a stray tie to a shared load lead can start putting a few volts back across posts everyone in the cabinet is now treating as dead. The meter is what tells a tech whether that reading is a sensor glitch or a live string, and the intercell links do not get torqued down until it says which.",
      missNote: "The links went on with the isolation only assumed, not reread. A few stray volts across two posts under a torque wrench is a small number until the wrench bridges them, and by then it is exactly the same short a fully live string would have produced.",
      wrongNote: "It's the meter, not the new cell. Reseating the battery didn't put the volts back on that string — something upstream of it did, and the meter is what proves it either way.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, CB_ACCENT);
    box(g, 4.8, 0.1, 4.4, 0, 0.05, 0, 0x6b6f66, { rough: 0.95 });
    // Outdoor battery cabinet, doors open, two strings of cells on shelves.
    const cab = group(g, 0, 0.1, -1.0);
    box(cab, 1.8, 1.8, 0.9, 0, 0.9, 0, 0x8a949d, { rough: 0.5, metal: 0.5 });
    const cabDoors = [];
    for (const sx of [-1, 1]) {
      const door = box(cab, 0.9, 1.8, 0.04, sx * 1.35, 0.9, 0.45, 0x8a949d, { rough: 0.5, metal: 0.5 });
      door.rotation.y = sx * 1.2;
      door.userData.openY = sx * 1.2;
      cabDoors.push(door);
    }
    const fan = group(cab, 0.6, 1.7, 0.47);
    cyl(fan, 0.12, 0.12, 0.04, 0, 0, 0, 0x22262b, { rough: 0.6, seg: 16 }).rotation.x = Math.PI / 2;
    const blades = group(fan, 0, 0, 0.03);
    for (let i = 0; i < 4; i++) { const b = box(blades, 0.04, 0.2, 0.01, 0, 0, 0, 0x9aa1a8, { rough: 0.4, metal: 0.5 }); b.rotation.z = (i * Math.PI) / 4; }
    holoTag(fan, "cabinet fan + H₂ monitor", 0, 0.2, 0, { css: "#a78bfa", w: 0.4 });
    reg(hits, fan, "vent-fan");
    const h2 = decal(cab, 0.3, 0.1, 0.6, 1.5, 0.46, signFace("H₂ -- %LEL", { bg: "#0d1c24", accent: "#a78bfa", fg: "#eee8ff", scale: 0.55 }), { glow: true, ei: 0.6 });
    const strings = {};
    for (const [key, y, label] of [["1", 0.45, "STRING 1 — FAILED"], ["2", 1.15, "STRING 2 — LIVE"]]) {
      const s = group(cab, 0, y, 0.1);
      box(s, 1.6, 0.04, 0.6, 0, -0.05, 0, 0x5b6672, { rough: 0.6, metal: 0.4 });
      const cells = [];
      for (let i = 0; i < 4; i++) {
        const c = group(s, -0.6 + i * 0.4, 0.15, 0);
        box(c, 0.34, 0.3, 0.5, 0, 0, 0, 0x22262b, { rough: 0.6 });
        for (const px of [-0.1, 0.1]) cyl(c, 0.025, 0.025, 0.05, px, 0.17, 0.15, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 10 });
        cells.push(c);
      }
      holoTag(s, label, 0, 0.45, 0.35, { css: key === "1" ? "#d2312b" : "#59c97b", w: 0.4 });
      strings[key] = { s, cells };
    }
    // The failed cell position (empty) in string 1, and its drop socket.
    strings["1"].cells[1].visible = false;
    const socket = box(strings["1"].s, 0.34, 0.02, 0.5, -0.2, 0.0, 0, 0xffffff, { rough: 0.5 });
    socket.visible = false; hits["battery-socket"] = socket;
    const wrongString = box(strings["2"].s, 1.1, 0.4, 0.6, -0.25, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, wrongString, "wrong-string");
    const corroded = ball(strings["2"].cells[3], 0.04, 0.1, 0.2, 0.15, 0xdfe6ea, { rough: 0.95 });
    reg(hits, corroded, "corroded-post");
    const covers = ["cover-a", "cover-b", "cover-c"];
    covers.forEach((id, i) => {
      const cv = box(strings["1"].cells[[0, 2, 3][i]], 0.3, 0.06, 0.2, 0, 0.2, 0.15, 0xd2312b, { rough: 0.6, opacity: 0.5, transparent: true });
      reg(hits, cv, id);
    });
    const torque = box(strings["1"].cells[2], 0.3, 0.06, 0.2, -0.2, 0.28, 0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(strings["1"].s, "intercell links — torque", -0.2, 0.55, 0.35, { css: "#a78bfa", w: 0.4 });
    reg(hits, torque, "torque-wrench");
    // Breaker and plant controller panel beside the cabinet.
    const panel = group(g, 1.7, 0.1, -0.4, -0.5);
    box(panel, 0.6, 1.5, 0.3, 0, 0.75, 0, 0x6f7a83, { rough: 0.5, metal: 0.5 });
    const brk = group(panel, -0.15, 1.1, 0.16);
    box(brk, 0.08, 0.16, 0.04, 0, 0, 0, 0x22262b, { rough: 0.5 });
    const brkHandle = box(brk, 0.03, 0.08, 0.02, 0, 0.02, 0.03, 0xd2312b, { rough: 0.5 });
    decal(brk, 0.14, 0.03, 0, 0.12, 0.01, signFace("STRING 1 BKR", { bg: "#22262b", accent: "#a78bfa", scale: 0.5 }));
    reg(hits, brk, "string-breaker");
    const busReturn = box(panel, 0.14, 0.06, 0.03, 0.15, 1.1, 0.16, 0x59c97b, { rough: 0.5 });
    decal(panel, 0.14, 0.04, 0.15, 1.18, 0.16, signFace("TO BUS", { bg: "#22262b", accent: "#59c97b", scale: 0.55 }));
    reg(hits, busReturn, "bus-return");
    const dcMeter = instrument(panel, 0, 1.52, 0, { idle: "-- V", color: 0xa78bfa, w: 0.16, d: 0.2 });
    holoTag(dcMeter, "DC meter", 0, 0.16, 0, { css: "#a78bfa", w: 0.22 });
    reg(hits, dcMeter, "dc-meter");
    // Backfeed warning light on the panel — dark until the controller flags
    // a stray reading on the string everyone in the cabinet is treating as dead.
    const backfeedWarn = ball(panel, 0.025, 0.22, 1.52, 0.05, 0xf0645b, { emissive: 0xf0645b, ei: 3.0, rough: 0.4 });
    backfeedWarn.visible = false;
    const cellMeter = instrument(panel, 0, 0.55, 0.16, { ry: 0, idle: "-.--- V", color: 0xa78bfa, w: 0.12, d: 0.18 });
    holoTag(cellMeter, "cell meter", 0, 0.15, 0, { css: "#a78bfa", w: 0.24 });
    reg(hits, cellMeter, "cell-meter");
    holoPanel(panel, 0.6, 0.42, -0.6, 1.4, 0.1, (ctx, w, h) => {
      ctx.fillStyle = "#130f22"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#a78bfa"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("MOP — SITE 4471, STRING 1 SWAP", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#eee8ff";
      ["Plant: −48 V DC, 2 strings, live", "Isolate: string 1 breaker, verify", "H₂ < 1% LEL before tools", "Torque: 12 N·m, insulated wrench", "Float: 2.25 V/cell ± 0.05"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: CB_ACCENT });
    const mop = box(panel, 0.6, 0.42, 0.04, -0.6, 1.4, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, mop, "mop-sheet");
    // Cart with the new battery, PPE and tools — the bare wrench and the drill are hazards.
    const cart = toolChest(g, -1.9, 0.6, { ry: 0.6, color: 0x3a2f5a });
    const newBattery = group(cart, 0, 0.9, 0);
    box(newBattery, 0.34, 0.3, 0.5, 0, 0, 0, 0x22262b, { rough: 0.6 });
    for (const px of [-0.1, 0.1]) cyl(newBattery, 0.025, 0.025, 0.05, px, 0.17, 0.15, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 10 });
    holoTag(newBattery, "replacement cell", 0, 0.32, 0, { css: "#a78bfa", w: 0.3 });
    reg(hits, newBattery, "new-battery");
    const shield = group(cart, -0.35, 0.78, 0.2);
    box(shield, 0.2, 0.14, 0.02, 0, 0, 0, 0x9fc3d8, { rough: 0.2, opacity: 0.6, transparent: true });
    reg(hits, shield, "face-shield");
    const gloves = group(cart, 0.35, 0.78, 0.2);
    box(gloves, 0.16, 0.05, 0.1, 0, 0, 0, 0xc48b3f, { rough: 0.8 });
    reg(hits, gloves, "insulated-gloves");
    const jewellery = group(cart, 0.0, 0.78, 0.28);
    cyl(jewellery, 0.02, 0.02, 0.01, 0, 0, 0, 0xc9a227, { rough: 0.3, metal: 0.8, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(jewellery, "ring — pocket it", 0, 0.1, 0, { css: "#a78bfa", w: 0.26 });
    reg(hits, jewellery, "jewellery-off");
    const ringOn = box(g, 0.3, 0.3, 0.3, 0.6, 0.9, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "ring still on?", 0.6, 1.15, -0.3, { css: "#d2312b", w: 0.26 });
    reg(hits, ringOn, "ring-on");
    const bareWrench = group(cart, -0.2, 0.78, -0.22);
    box(bareWrench, 0.22, 0.02, 0.03, 0, 0, 0, 0xb9bec4, { rough: 0.3, metal: 0.8 });
    holoTag(bareWrench, "bare wrench", 0, 0.1, 0, { css: "#d2312b", w: 0.24 });
    reg(hits, bareWrench, "bare-wrench");
    const drill = group(cart, 0.2, 0.8, -0.22);
    box(drill, 0.16, 0.08, 0.06, 0, 0, 0, 0x2f7d4a, { rough: 0.6 });
    holoTag(drill, "cordless drill", 0, 0.1, 0, { css: "#d2312b", w: 0.26 });
    reg(hits, drill, "no-vent-spark");

    // Site dressing: the compound a real cell site actually sits in — chain-
    // link security fence, a standby generator, cable tray between the
    // cabinet and the panel, a ground ring, and a second parts case.
    const fenceCorners = [[-2.25, -2.05], [2.25, -2.05], [2.25, 2.05], [-2.25, 2.05]];
    for (let i = 0; i < fenceCorners.length; i++) {
      const [x1, z1] = fenceCorners[i];
      const [x2, z2] = fenceCorners[(i + 1) % fenceCorners.length];
      const len = Math.hypot(x2 - x1, z2 - z1);
      const midX = (x1 + x2) / 2, midZ = (z1 + z2) / 2;
      const ang = Math.atan2(x2 - x1, z2 - z1);
      const posts = Math.max(2, Math.round(len / 1.0));
      for (let p = 0; p <= posts; p++) {
        const t = p / posts;
        cyl(g, 0.025, 0.025, 1.4, x1 + (x2 - x1) * t, 0.7, z1 + (z2 - z1) * t, 0x8a8f95, { rough: 0.6, metal: 0.6, seg: 8 });
      }
      const rail = box(g, len, 0.02, 0.02, midX, 1.3, midZ, 0x8a8f95, { rough: 0.6, metal: 0.6 });
      rail.rotation.y = ang;
      const mesh = box(g, len, 1.1, 0.01, midX, 0.75, midZ, 0x6b727a, { rough: 0.9, opacity: 0.35, transparent: true, cast: false });
      mesh.rotation.y = ang;
    }
    // Standby generator against the fence, downwind of the cabinet.
    const genset = group(g, -1.9, 0.1, -1.7);
    box(genset, 0.9, 0.55, 0.5, 0, 0.28, 0, 0x5a6a4a, { rough: 0.7, metal: 0.3 });
    for (let i = 0; i < 5; i++) box(genset, 0.03, 0.4, 0.44, -0.4 + i * 0.06, 0.32, 0, 0x3f4a35, { rough: 0.8, cast: false });
    cyl(genset, 0.04, 0.04, 0.5, 0.3, 0.75, -0.1, 0x2b2f34, { rough: 0.6, metal: 0.5, seg: 10 });
    box(genset, 0.4, 0.08, 0.34, 0, 0.6, 0.1, 0x22262b, { rough: 0.5 });
    holoTag(genset, "standby generator", 0, 0.85, 0, { css: "#a78bfa", w: 0.32 });
    // Cable tray running from the battery cabinet to the plant controller panel.
    const trayPts = [[-0.7, 1.55, -1.0], [0.2, 1.55, -0.7], [1.0, 1.55, -0.4], [1.7, 1.55, -0.55]];
    for (let i = 0; i < trayPts.length - 1; i++) {
      const [x1, y1, z1] = trayPts[i], [x2, y2, z2] = trayPts[i + 1];
      const len = Math.hypot(x2 - x1, z2 - z1);
      const seg = box(g, len, 0.05, 0.14, (x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2, 0x4a4e52, { rough: 0.6, metal: 0.5 });
      seg.rotation.y = Math.atan2(x2 - x1, z2 - z1);
      for (const frac of [0.25, 0.6]) {
        const cx = x1 + (x2 - x1) * frac, cz = z1 + (z2 - z1) * frac;
        cyl(g, 0.012, 0.012, 0.09, cx, y1 - 0.05, cz, 0x1b1e23, { rough: 0.7, metal: 0.6, seg: 6 });
      }
    }
    // Ground ring and bonding wire at the cabinet base.
    const groundRod = cyl(g, 0.012, 0.012, 0.5, 0.9, 0.1, -0.55, 0xb08d57, { rough: 0.4, metal: 0.7, seg: 8 });
    void groundRod;
    hose(g, [[0.9, 0.35, -0.55], [0.6, 0.15, -0.7], [0.1, 0.12, -0.75]], 0.008, 0x3f8f4a, { steps: 10, rough: 0.6 });
    // A second parts case near the generator — site dressing, not an interactable.
    const spareCase = group(g, -1.4, 0.1, -1.9, 0.2);
    box(spareCase, 0.5, 0.28, 0.36, 0, 0.14, 0, 0x2b2f34, { rough: 0.7 });
    decal(spareCase, 0.3, 0.06, 0, 0.29, 0, signFace("SPARES", { bg: "#1b1e22", accent: "#a78bfa", scale: 0.5 })).rotation.x = -Math.PI / 2;

    let venting = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "ventilate") { venting = true; repaint(h2, signFace("H₂ 0.2 %LEL ✓", { bg: "#0d1c24", accent: "#59c97b", fg: "#eee8ff", scale: 0.55 })); }
        if (step.id === "isolate") brkHandle.rotation.z = Math.PI / 2;
        if (step.id === "covers") for (const id of covers) hits[id].material.color.set(0x59c97b);
        if (step.id === "swap") { newBattery.parent.remove(newBattery); strings["1"].s.add(newBattery); newBattery.position.set(-0.2, 0.15, 0); newBattery.rotation.set(0, 0, 0); }
        if (step.id === "return") brkHandle.rotation.z = 0;
        if (step.id === "walk") corroded.visible = false;
      },
      onHazard() {},
      // The door swinging shut on the fan's draw and a live-looking reading
      // on an "isolated" string are both things a plant tech would see happen.
      onInterrupt(it) {
        if (it.id === "cabinet-door-swings-shut") {
          for (const d of cabDoors) d.rotation.y = d.userData.openY * 0.15;
          repaint(h2, signFace("H₂ 1.4 %LEL ▲", { bg: "#2a0d10", accent: "#f0645b", fg: "#ffe8e6", scale: 0.55 }));
        }
        if (it.id === "backfeed-on-string-1") backfeedWarn.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cabinet-door-swings-shut") {
          for (const d of cabDoors) d.rotation.y = d.userData.openY;
          repaint(h2, signFace("H₂ 0.2 %LEL ✓", { bg: "#0d1c24", accent: "#59c97b", fg: "#eee8ff", scale: 0.55 }));
        }
        if (it.id === "backfeed-on-string-1") backfeedWarn.visible = false;
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (venting) blades.rotation.z += dt * 14;
        if (backfeedWarn.visible) backfeedWarn.material.emissiveIntensity = 1.6 + Math.sin(t * 11) * 1.4;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "verify") repaint(dcMeter.userData.screen, signFace(`${(gg.t * 60).toFixed(1)} V`, { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.56 ? "#59c97b" : "#f2ae14", fg: "#eee8ff", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "cells") repaint(cellMeter.userData.screen, signFace(`${(2.1 + gg.t * 0.3).toFixed(3)} V`, { bg: "#0d1c24", accent: gg.t >= 0.45 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#eee8ff", scale: 0.6 }));
      },
    };
  },
};
