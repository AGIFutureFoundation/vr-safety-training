import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
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
      why: "The MOP names the string, the isolation point and the numbers. On a live plant, working from memory is how the wrong string gets opened.",
    },
    {
      id: "ventilate", kind: "select", target: "vent-fan",
      title: "Ventilate the cabinet and check for hydrogen",
      cue: "Start the cabinet fan, open the door, and read the hydrogen monitor before any tool goes in.",
      why: "Charging batteries off-gas hydrogen. A closed cabinet can hold enough to ignite from a tool spark; ventilated and read below the limit is the precondition for everything else.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["face-shield", "insulated-gloves", "jewellery-off"],
      itemNames: { "face-shield": "face shield", "insulated-gloves": "insulated gloves", "jewellery-off": "jewellery off" },
      title: "Face shield, insulated gloves, jewellery off",
      cue: "Shield for acid and arc, gloves for the terminals, ring and watch in the pocket.",
      why: "A short on a battery is a flash and a spray of electrolyte. The shield and gloves are for that; the ring goes in the pocket because it is the short.",
    },
    {
      id: "isolate", kind: "turn", target: "string-breaker",
      title: "Isolate the failed string",
      cue: "Open string 1's breaker and confirm the plant is carrying the load on string 2 and the rectifiers.",
      why: "The string comes off the bus at its breaker so the work is on an isolated string, not a live plant. The site stays up on the other string.",
      turn: { turns: 0.5, axis: "y", label: "STRING 1" },
    },
    {
      id: "verify", kind: "gauge", target: "dc-meter",
      title: "Verify the string is off the bus",
      cue: "Read across the string breaker's load side and commit once it shows the string isolated.",
      why: "An open breaker is a claim; the meter is the proof. The reading says whether the terminals you are about to touch are on the bus or off it.",
      gauge: { label: "STRING VOLTS", speed: 0.75, green: [0.4, 0.56], readout: (t) => `${(t * 60).toFixed(1)} V`, missNote: "That is not an isolated string — recheck the breaker and read it again." },
    },
    {
      id: "covers", kind: "sequence", anyOrder: true,
      targets: ["cover-a", "cover-b", "cover-c"],
      itemNames: { "cover-a": "terminal cover 1", "cover-b": "terminal cover 2", "cover-c": "terminal cover 3" },
      title: "Cover the adjacent terminals",
      cue: "Insulating covers on every terminal you are not working on.",
      why: "The wrench only needs to touch two posts. Covering every post but the one in hand is how a slip stays a slip.",
    },
    {
      id: "swap", kind: "drag", target: "new-battery",
      title: "Fit the replacement battery",
      cue: "Carry the new battery from the cart and set it in the string's empty position.",
      why: "The failed cell comes out, the new one goes in the same position, same polarity, same orientation. Checked twice before the intercell links go on.",
      drag: { to: "battery-socket", radius: 0.4, missNote: "Not in the string position — set it in the empty bay, terminals facing the bus." },
    },
    {
      id: "torque", kind: "hold", target: "torque-wrench", seconds: 4,
      title: "Torque the intercell links",
      cue: "Insulated torque wrench on each link, one hand, hold to the click.",
      why: "Under-torqued links heat under load; over-torqued ones crack the post. The figure is the manufacturer's, the wrench is insulated, and the other hand is nowhere near a terminal.",
      holdBreakNote: "Came off before the click — the link is under-torqued. Set it again.",
    },
    {
      id: "cells", kind: "gauge", target: "cell-meter",
      title: "Check the string cell by cell",
      cue: "Read each cell's voltage on the new string and commit inside the float band.",
      why: "One low cell drags a string; one high cell cooks. Each cell reads inside the float band before the string is trusted on the bus.",
      gauge: { label: "CELL", speed: 0.75, green: [0.45, 0.6], readout: (t) => `${(2.1 + t * 0.3).toFixed(3)} V`, missNote: "Cell out of the float band — do not return the string; find the cell." },
    },
    {
      id: "return", kind: "select", target: "bus-return",
      title: "Return the string to the bus",
      cue: "Close string 1's breaker and confirm both strings share the load.",
      why: "Back on the bus, the new string floats with the old. Load sharing is checked at the plant controller before the cabinet closes.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["corroded-post"],
      itemNames: { "corroded-post": "corroded post on string 2" },
      itemNotes: { "corroded-post": "String 2's positive post is crusted with sulfate — a high-resistance connection that will drop the site on the next outage. It is on the next MOP, today." },
      title: "Walk the plant before closing up",
      cue: "Inspect the other string and the bus before the cabinet closes; click what needs the next MOP.",
      why: "The site is up on the other string. Whether it stays up on the next outage depends on what you noticed on the way out.",
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
    for (const sx of [-1, 1]) box(cab, 0.9, 1.8, 0.04, sx * 1.35, 0.9, 0.45, 0x8a949d, { rough: 0.5, metal: 0.5 }).rotation.y = sx * 1.2;
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
      animate(t, dt, session) {
        const step = session?.step;
        if (venting) blades.rotation.z += dt * 14;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "verify") repaint(dcMeter.userData.screen, signFace(`${(gg.t * 60).toFixed(1)} V`, { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.56 ? "#59c97b" : "#f2ae14", fg: "#eee8ff", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "cells") repaint(cellMeter.userData.screen, signFace(`${(2.1 + gg.t * 0.3).toFixed(3)} V`, { bg: "#0d1c24", accent: gg.t >= 0.45 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#eee8ff", scale: 0.6 }));
      },
    };
  },
};
