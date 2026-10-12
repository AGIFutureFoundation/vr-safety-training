import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cafeteria Serving VR — its own gamified system: Reimbursable Meal.
// A school cafeteria line under the National School Lunch Program. The line
// worker's whole job is two things stacked on top of each other: the Food
// Code's temperatures, and the meal pattern's counting rules — a tray that
// passes one and fails the other is not a reimbursable meal either way.

const CS_ACCENT = 0x4fb0c9;

export const SIM_CAFETERIA_SERVING = {
  id: "cafeteria-serving",
  index: "114",
  domain: "Culinary & Hospitality",
  trade: "School nutrition service worker",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  certification: "AFSCME and SEIU school and hospital food service workers; the USDA National School Lunch Program meal pattern and offer-versus-serve rules under 7 CFR Part 210; the California Retail Food Code (the FDA Food Code as adopted) on hot and cold holding; the ANSI-accredited California Food Handler card and ServSafe Manager certification; NSF/ANSI 7 commercial refrigeration for the milk cooler; Cal/OSHA's general industry safety orders",
  name: "Cafeteria Serving",
  title: simTitle("Cafeteria Serving"),
  tagline: "The school lunch line: meal pattern, offer versus serve, wells probed and logged, and the count for the reimbursement claim",
  accent: CS_ACCENT,
  accentCss: "#4fb0c9",
  parSeconds: 250,
  footprint: 2.7,
  badge: { id: "reimbursable-meal", name: "Reimbursable Meal", note: "Every tray to the meal pattern, every well in temperature, the count reconciled" },

  game: system({
    name: "Reimbursable Meal",
    currency: "TRAYS",
    ranks: ["Cafeteria Aide", "Line Server", "Kitchen Lead", "Nutrition Manager", "Reimbursable Meal Certified"],
    badges: [
      { id: "in-temp-all-shift", name: "In Temp All Shift", note: "Never served from a well out of range", test: AWARD.safe },
      { id: "clean-count", name: "Clean Count", note: "No corrections across the whole line", test: AWARD.clean },
      { id: "steady-line", name: "Steady Line", note: "Held the serving pace inside band without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "line-open-on-time", name: "Line Open on Time", note: "Ready inside 80% of par", test: AWARD.fast(0.8) },
      { id: "one-pass-walk", name: "One-Pass Walk", note: "Line walk clean on the first pass", test: AWARD.stepClean("line-walk") },
      { id: "seven-in-a-row", name: "Seven in a Row", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "bare-hand-rte": "That is a bare hand going into the fruit cups. Ready-to-eat food gets no further kill step before a student eats it, so a bare hand is the last thing that touches it before they do — gloves or tongs, every time, on anything already ready to serve.",
    "unlabeled-allergen": "That pan has tree nuts in it and there is no allergen card posted at the station. A line worker who does not know an item contains a top allergen cannot answer the one question a parent or a student is most likely to ask.",
    "warm-milk-crate": "That crate has been sitting on the counter, not in the cooler. Milk out of refrigeration is climbing out of the temperature the Food Code and the milk cooler are both built around, and a warm carton on a tray is one a parent complains about before it is ever a safety problem.",
    "no-glove-change-register": "Those gloves went from making change at the register straight back onto the line. Cash is one of the dirtiest things that crosses this counter all day, and a glove that touched it and then touched food has carried that contact onto every tray after it.",
  },

  lateNotes: {
    "hot-well-probe": "Not yet — the well gets probed once the pans are actually loaded and the line is about to open, not before.",
    "finished-tray": "The tray only goes to the register once every station on it has been served in order.",
  },

  steps: [
    {
      id: "menu-board", kind: "select", target: "menu-board",
      title: "Check today's menu against the meal pattern",
      cue: "Read the posted menu and confirm all five meal-pattern components are on the line.",
      why: "A reimbursable lunch needs a meat/meat alternate, a grain, a fruit, a vegetable and milk on the line every day — not on every tray, on the line — because a student who is only offered four of the five cannot build a reimbursable meal no matter what they choose. The board is the line's own check against the federal count before a single tray moves.",
    },
    {
      id: "steam-well-valve", kind: "turn", target: "steam-well-valve",
      title: "Fill the steam table's water bath",
      cue: "Open the fill valve until the water bath under the wells is at its working level.",
      why: "A steam table heats through the water bath, not directly on the pan, and a well run dry heats its own empty tank instead of the food sitting in it — that is exactly how an element burns out mid-service. Filling it before service starts is the whole difference between a well that holds temperature for four hours and one that fails on the busiest line of the day.",
      turn: { turns: 0.8, axis: "z", label: "STEAM TABLE FILL VALVE" },
    },
    {
      id: "hot-well-probe", kind: "gauge", target: "hot-well-probe",
      title: "Probe the hot well",
      cue: "Probe the entrée pan and commit once the well reads 135°F or above.",
      why: "The well's own thermostat tells you where it is set, not what the food in the pan actually is — a full pan loaded cold can sit under temperature for the first twenty minutes even with the element running correctly. The probe in the food is the number that actually decides whether the line can open.",
      gauge: { label: "HOT WELL — ENTRÉE", speed: 0.6, green: [0.68, 0.9], readout: (t) => `${Math.round(120 + t * 40)} °F`, missNote: "Under 135°F. Give the well more time or move the pan to a well that's actually holding before service opens." },
    },
    {
      id: "cold-well-probe", kind: "gauge", target: "cold-well-probe",
      title: "Probe the cold pan",
      cue: "Probe the fruit cups in the cold well and commit once it reads 41°F or below.",
      why: "Cold holding runs the same rule in the other direction: 41°F or below, checked in the food itself rather than assumed from the unit's dial. Fruit and salad items sit in the danger zone just as fast climbing up from 41°F as a hot item does falling from 135°F — the well only protects a tray that is actually probed.",
      gauge: { label: "COLD WELL — FRUIT", speed: 0.55, green: [0.08, 0.3], readout: (t) => `${Math.round(34 + t * 30)} °F`, missNote: "Above 41°F. The cold pan needs more ice or a colder unit setting before fruit goes on the line." },
    },
    {
      id: "milk-cooler-check", kind: "select", target: "milk-cooler",
      title: "Check the milk cooler",
      cue: "Read the milk cooler's thermometer and confirm it holds at 41°F or below.",
      why: "Milk is the one component on every tray that never gets probed individually — the whole case lives or dies on whether the cooler itself is holding, which is why the cooler's own thermometer is checked before the first carton comes out, not discovered cold or warm one carton at a time.",
    },
    {
      id: "glove-change", kind: "hold", target: "hand-sink", seconds: 15,
      title: "Wash hands before gloving up",
      cue: "Hold at the hand sink and scrub before pulling on gloves for the ready-to-eat station.",
      why: "Gloves go over clean hands, not instead of them — a glove pulled onto unwashed hands just moves whatever was on the skin onto the inside of the glove, where the next contact spreads it straight back out. The wash happens first, every time gloves come off and go back on.",
      holdBreakNote: "You stopped short. A partial wash under gloves still carries whatever was on your hands into the next tray you touch.",
    },
    {
      id: "line-walk", kind: "find", noHint: true,
      targets: ["sneeze-guard-gap", "serving-spoon-undersized", "glove-box-empty"],
      itemNames: {
        "sneeze-guard-gap": "the gap in the sneeze guard",
        "serving-spoon-undersized": "the undersized serving spoon at the vegetable",
        "glove-box-empty": "the empty glove box at the salad station",
      },
      itemNotes: {
        "sneeze-guard-gap": "A panel has been left swung open over the tray rail. The guard only protects a component where it actually spans the pan.",
        "serving-spoon-undersized": "That spoon serves under the posted portion size. A student getting less than the credited portion isn't getting a reimbursable component even if the item is on their tray.",
        "glove-box-empty": "No gloves at the ready-to-eat station means the next server reaches for whatever is nearest — usually a bare hand.",
      },
      decoyNotes: {
        "milk-crate-correct": "That crate is still in the cooler at temperature. Leave it.",
      },
      title: "Walk the line before the bell",
      cue: "Three things on this line are not right. Find them before the first tray comes through.",
      why: "The line is walked with your own eyes before service the same way a buffet is — a portion tool, a guard panel and a glove box are all things a server has to trust are correct all shift, and the only point anybody actually checks them is right now, before the first student is standing in front of the pan.",
    },
    {
      id: "dietary-card-check", kind: "select", target: "dietary-card-box",
      title: "Check the dietary cards at the register",
      cue: "Confirm today's allergy and dietary accommodation cards are current at the point of service.",
      why: "A medically documented food allergy gets a substitution under the meal pattern's own rule, and the register is the only point in the whole line where a name on a tray meets a name on a card — miss it here and there is no second checkpoint before the tray reaches the table.",
    },
    {
      id: "tray-build", kind: "sequence",
      targets: ["station-entree", "station-grain", "station-veg", "station-fruit", "station-milk"],
      itemNames: {
        "station-entree": "entrée", "station-grain": "grain", "station-veg": "vegetable",
        "station-fruit": "fruit", "station-milk": "milk",
      },
      title: "Serve a full reimbursable tray",
      cue: "Serve all five components in the order the line is set up: entrée, grain, vegetable, fruit, milk.",
      why: "Offer versus serve only works if all five components are actually offered at every tray — the student chooses at least three, one of which has to be a fruit or a vegetable, but that choice is theirs to make only if a server put all five in front of them first. Skipping one at the pan is a choice the server made for them.",
      outOfOrderNote: "Serve the line in the order it's set up — entrée, grain, vegetable, fruit, then milk. Serving out of order is how a component gets missed under a tray that's already moving.",
    },
    {
      id: "line-pace", kind: "track", target: "line-clock", seconds: 7,
      title: "Hold the line's pace",
      cue: "Keep the serving rate in the band that matches the lunch period without rushing the portions.",
      why: "A twenty-five-minute lunch period is the actual clock this line runs on — serve too slowly and half the students eat in the last five minutes of their own lunch; rush it and portion sizes are the first thing that slips, which quietly turns a reimbursable meal into one that no longer meets the pattern.",
      track: {
        start: 0.2, green: [0.4, 0.64], rise: 0.42, fall: 0.4, drift: 0.12, label: "SERVING PACE",
        readout: (v) => (v < 0.4 ? "backing up the line" : v > 0.64 ? "rushing the portions" : "on pace"),
      },
      holdBreakNote: "Pace out of band — too slow backs the line up into the period, too fast starts costing you the portion sizes. Bring it back to steady.",
    },
    {
      id: "tray-to-register", kind: "drag", target: "finished-tray",
      title: "Send the tray to the register",
      cue: "Carry the completed tray to the register for the reimbursable count.",
      why: "The register is where the meal actually gets counted for reimbursement, and it only counts a tray it can see was served — a tray that skips the register because the line is backed up is food served for free that the program never gets credit for feeding.",
      drag: { to: "pos-register", radius: 0.5, missNote: "Not at the register. A tray that never reaches the point of service never gets counted toward the day's reimbursable meals." },
    },
    {
      id: "count-reconcile", kind: "select", target: "count-board",
      title: "Reconcile the day's count",
      cue: "Match the register total against the tray count at the end of service.",
      why: "The claim the cafeteria files is only as good as the number behind it, and the two counts — trays served and register rings — are supposed to match. A gap between them is either a tray that walked past the register or a number somebody is going to have to explain to the district.",
    },
    {
      id: "production-record", kind: "select", target: "production-board",
      title: "Close the production record",
      cue: "Log the temperatures taken, the portions served and the components offered on the day's production record.",
      why: "The production record is the paperwork that proves the meal pattern was actually met on a given day, not just planned — it is what a state auditor reads first, and it is also the only place tonight's temperatures survive past the end of the shift that took them.",
    },
  ],

  interrupts: [
    {
      id: "milk-allergy-tray",
      kind: "Allergy flag",
      after: "dietary-card-check", delay: 4, seconds: 11,
      alert: "A student with a milk allergy card on file is at the register, and there's a carton of milk sitting on their tray.",
      cue: "That card means a substitution, not a carton.",
      target: "allergy-tray-milk",
      why: "A documented food allergy is exactly the case the meal pattern's substitution rule exists for, and it only works if somebody actually catches the mismatch before the tray is charged and the student walks off with it — the register is the last point that can happen.",
      missNote: "The tray went through with the milk still on it. A documented allergy caught after the student has already left the line is a phone call home, not a substitution.",
      wrongNote: "It's the milk on that tray. Pull it and offer the substitution the card calls for before the tray leaves the register.",
    },
    {
      id: "hot-well-fail",
      kind: "Equipment failure",
      after: "tray-build", delay: 3, seconds: 12,
      alert: "The hot well's heating element has just dropped out — the entrée pan is losing temperature and the line behind it is backing up.",
      cue: "Nothing serves from a well that isn't holding. Find the fix, not the ladle.",
      target: "hot-well-probe",
      why: "A well that stops holding temperature is not a line problem to push through, it is a food-safety problem the whole tray count now depends on — the pan gets pulled and probed before another tray is served from it, whatever that does to the line behind it.",
      missNote: "Service kept moving off a well that had already failed. Every tray served from it after that point was served from food nobody can say was still 135°F or above.",
      wrongNote: "It's the well that just dropped out. Check it before anything else goes on a tray from that pan.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, CS_ACCENT);

    // ------------------------------------------------------------- menu board
    const menuBoard = holoPanel(g, 0.56, 0.4, -2.8, 1.5, -1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(3,16,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fb0c9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#a9d8e4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("TODAY'S MENU · REIMBURSABLE MEAL", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf7fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("ALL FIVE COMPONENTS ON THE LINE", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#bfe0e8";
      ["Meat/alt: baked chicken", "Grain: brown rice", "Veg: green beans · Fruit: apple slices",
       "Milk: 1% and fat-free"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.12)));
    }, { ry: 0.5, accent: CS_ACCENT });
    reg(hits, menuBoard, "menu-board");

    // ------------------------------------------------------------- steam table / hot wells
    const steamTable = group(g, -1.6, 0, -2.0);
    box(steamTable, 2.4, 0.85, 0.6, 0, 0.425, 0, 0xc9d0d6, { rough: 0.4, metal: 0.5 });
    slab(steamTable, 2.44, 0.05, 0.64, 0, 0.87, 0, 0xdfe4e8, { radius: 0.02, rough: 0.3, metal: 0.6 });
    const wellPans = [];
    for (let i = 0; i < 3; i++) {
      const wx = -0.75 + i * 0.75;
      box(steamTable, 0.62, 0.1, 0.46, wx, 0.94, 0, 0x9aa1a8, { rough: 0.35, metal: 0.7 });
      const water = box(steamTable, 0.56, 0.02, 0.4, wx, 1.0, 0, 0x3f7f9e, { rough: 0.2, opacity: 0.6, transparent: true });
      const pan = slab(steamTable, 0.5, 0.05, 0.34, wx, 1.03, 0, i === 0 ? 0xb5723c : 0x5a8a4a, { radius: 0.02, rough: 0.6 });
      const steam = particles(steamTable, 24, 0xe4ecf2, { size: 0.045, life: 1.0, additive: false, opacity: 0.2 });
      steam.position.set(wx, 1.0, 0);
      wellPans.push({ pan, water, steam });
    }
    const hotWellProbe = instrument(steamTable, -0.75, 1.2, 0.1, { idle: "--- °F", color: 0x4fb0c9, w: 0.1, d: 0.14 });
    holoTag(steamTable, "Hot well probe", -0.75, 1.4, 0.1, { css: "#4fb0c9", w: 0.34 });
    reg(hits, hotWellProbe, "hot-well-probe");
    const fillValve = group(steamTable, 1.3, 1.0, 0.24, 0.3);
    cyl(fillValve, 0.028, 0.028, 0.1, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.7, seg: 12 });
    const valveHandle = box(fillValve, 0.09, 0.02, 0.02, 0, 0.07, 0, 0xdfe4e8, { rough: 0.4, metal: 0.6 });
    holoTag(steamTable, "Fill valve", 1.3, 1.3, 0.24, { css: "#4fb0c9", w: 0.28 });
    reg(hits, fillValve, "steam-well-valve");

    // ------------------------------------------------------------- sneeze guard
    const guardFrame = group(steamTable, 0, 1.15, 0.22);
    for (const gx of [-0.75, 0.75]) box(guardFrame, 1.1, 0.5, 0.006, gx, 0.3, 0, 0xdfe4e8, { rough: 0.2, opacity: 0.35, transparent: true, cast: false });
    const gap = box(guardFrame, 1.1, 0.5, 0.006, 0, 0.55, 0.12, 0xdfe4e8, { rough: 0.2, opacity: 0.35, transparent: true, cast: false });
    gap.rotation.x = 0.5;
    for (const gx of [-1.3, -0.2, 0.2, 1.3]) cyl(guardFrame, 0.01, 0.01, 0.7, gx, 0.05, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
    holoTag(steamTable, "Sneeze guard — gap", 0, 1.68, 0.12, { css: "#f0645b", w: 0.4 });
    reg(hits, gap, "sneeze-guard-gap");
    const smallSpoon = cyl(steamTable, 0.01, 0.01, 0.14, 0, 1.06, 0.2, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 8 });
    smallSpoon.rotation.z = 0.6;
    holoTag(steamTable, "undersized spoon", 0, 1.2, 0.2, { css: "#f0645b", w: 0.4 });
    reg(hits, smallSpoon, "serving-spoon-undersized");
    const unlabeledPan = box(steamTable, 0.4, 0.04, 0.3, 1.5, 0.92, -0.9, 0x8a6a3c, { rough: 0.6 });
    holoTag(g, "no allergen card posted", -0.1, 1.05, -2.9, { css: "#f0645b", w: 0.5 });
    reg(hits, unlabeledPan, "unlabeled-allergen");

    // ------------------------------------------------------------- cold well / salad bar
    const coldBar = group(g, 0.6, 0, -2.0);
    box(coldBar, 1.3, 0.85, 0.55, 0, 0.425, 0, 0xdfe4e8, { rough: 0.4, metal: 0.4 });
    box(coldBar, 1.26, 0.1, 0.5, 0, 0.94, 0, 0xc4cbd1, { rough: 0.3 });
    const iceBed = box(coldBar, 1.2, 0.04, 0.44, 0, 1.0, 0, 0xe8f4f8, { rough: 0.2, opacity: 0.7, transparent: true });
    const cupsBox1 = group(coldBar, -0.32, 1.03, 0);
    for (let i = 0; i < 8; i++) {
      cyl(cupsBox1, 0.038, 0.038, 0.05, (i % 4) * 0.09 - 0.14, 0.03, Math.floor(i / 4) * 0.09 - 0.045, 0xf2c14b, { rough: 0.4, seg: 12 });
    }
    const coldProbe = instrument(coldBar, 0.4, 1.24, 0, { idle: "--- °F", color: 0x4fb0c9, w: 0.1, d: 0.14 });
    holoTag(coldBar, "Cold well probe", 0.4, 1.44, 0, { css: "#4fb0c9", w: 0.34 });
    reg(hits, coldProbe, "cold-well-probe");
    const bareHand = ball(coldBar, 0.03, -0.32, 1.06, 0.06, 0xd9a985, { rough: 0.75 });
    holoTag(coldBar, "bare hand — no gloves", -0.32, 1.24, 0.06, { css: "#f0645b", w: 0.48 });
    reg(hits, bareHand, "bare-hand-rte");
    const emptyGloveBox = box(coldBar, 0.14, 0.08, 0.1, 0.5, 1.0, 0.18, 0xdfe4e8, { rough: 0.5, opacity: 0.001, transparent: true });
    holoTag(coldBar, "empty glove box", 0.5, 1.16, 0.18, { css: "#f0645b", w: 0.4 });
    reg(hits, emptyGloveBox, "glove-box-empty");
    void iceBed;

    // ------------------------------------------------------------- milk cooler
    const milkCooler = group(g, 2.3, 0, -1.7, -0.5);
    box(milkCooler, 0.9, 1.7, 0.7, 0, 0.85, 0, 0xdfe4e8, { rough: 0.35, metal: 0.4 });
    const glassDoor = box(milkCooler, 0.7, 1.4, 0.02, 0, 0.85, 0.36, 0x9fd8ff, { rough: 0.15, opacity: 0.45, transparent: true, metal: 0.2 });
    const crates = [];
    for (let s = 0; s < 3; s++) {
      const crate = group(milkCooler, 0, 0.4 + s * 0.42, 0.28);
      box(crate, 0.6, 0.3, 0.3, 0, 0, 0, 0xdfe4e8, { rough: 0.5, opacity: 0.6, transparent: true, cast: false });
      for (let i = 0; i < 4; i++) box(crate, 0.1, 0.16, 0.1, -0.22 + i * 0.15, 0.1, 0, [0xf2f4f6, 0x4fb0c9][s % 2], { rough: 0.3 });
      crates.push(crate);
    }
    const milkThermo = instrument(milkCooler, 0.4, 1.5, 0.35, { idle: "--- °F", color: 0x4fb0c9, w: 0.1, d: 0.14 });
    holoTag(milkCooler, "Milk cooler thermometer", 0.4, 1.7, 0.35, { css: "#4fb0c9", w: 0.42 });
    reg(hits, milkThermo, "milk-cooler");
    void glassDoor;
    const warmCrate = group(g, 2.0, 0, -1.0);
    box(warmCrate, 0.6, 0.3, 0.3, 0, 0.6, 0, 0xdfe4e8, { rough: 0.5, opacity: 0.6, transparent: true, cast: false });
    for (let i = 0; i < 4; i++) box(warmCrate, 0.1, 0.16, 0.1, -0.22 + i * 0.15, 0.7, 0, 0xf2f4f6, { rough: 0.3 });
    holoTag(warmCrate, "milk — off the line, warm", 0, 0.94, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, warmCrate, "warm-milk-crate");
    reg(hits, crates[0], "milk-crate-correct");

    // ------------------------------------------------------------- hand sink
    const handSink = group(g, -2.9, 0, 0.6, Math.PI / 2);
    box(handSink, 0.5, 0.34, 0.4, 0, 0.9, 0, 0xdfe4e8, { rough: 0.25, metal: 0.75 });
    box(handSink, 0.42, 0.02, 0.32, 0, 1.03, 0, 0x8d959d, { rough: 0.2, metal: 0.85 });
    cyl(handSink, 0.014, 0.014, 0.26, 0, 1.2, -0.14, CITY.steel, { rough: 0.18, metal: 0.9, seg: 14 });
    const washWater = particles(handSink, 46, 0xbfe0f2, { size: 0.011, life: 0.3, additive: false, opacity: 0.6 });
    decal(handSink, 0.42, 0.12, 0, 1.5, 0.02, signFace("HANDWASHING ONLY", { bg: "#0f2733", accent: "#6cc6f0", scale: 0.48 }));
    reg(hits, handSink, "hand-sink");

    // ------------------------------------------------------------- register / dietary cards
    const register = group(g, -0.4, 0, 2.0, 3.0);
    box(register, 0.7, 0.86, 0.5, 0, 0.43, 0, CITY.darkSteel, { rough: 0.4, metal: 0.65 });
    slab(register, 0.74, 0.05, 0.54, 0, 0.88, 0, 0xdfe4e8, { radius: 0.02, rough: 0.3, metal: 0.6 });
    const pos = instrument(register, 0, 1.05, 0, { idle: "$0.00", color: 0x4fb0c9, w: 0.13, d: 0.19 });
    reg(hits, pos, "pos-register");
    const cardBox = group(register, 0.28, 0.94, 0);
    box(cardBox, 0.16, 0.1, 0.12, 0, 0.05, 0, 0xb8402f, { rough: 0.55 });
    decal(cardBox, 0.1, 0.06, 0, 0.11, 0.06, paperFace("ALLERGY", ["CARDS"], { bg: "#f4e9d8" }));
    holoTag(register, "Dietary cards", 0.28, 0.24, 0, { css: "#4fb0c9", w: 0.32 });
    reg(hits, cardBox, "dietary-card-box");
    const allergyTray = group(g, -0.9, 0, 1.7);
    box(allergyTray, 0.4, 0.02, 0.28, 0, 0.75, 0, 0x8b929a, { rough: 0.5 });
    const trayMilk = cyl(allergyTray, 0.03, 0.028, 0.09, -0.1, 0.8, 0, 0xf2f4f6, { rough: 0.4, seg: 12 });
    slab(allergyTray, 0.14, 0.02, 0.1, 0.06, 0.77, 0, 0xd9a44e, { radius: 0.02, rough: 0.6 });
    holoTag(allergyTray, "milk allergy card on file", -0.1, 0.98, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, trayMilk, "allergy-tray-milk");
    reg(hits, allergyTray, "no-glove-change-register");

    // ------------------------------------------------------------- serving stations (tray build)
    const stationRail = group(g, 0, 0, -0.4);
    const stationSpecs = [
      ["station-entree", -1.8, 0xb5723c], ["station-grain", -0.9, 0xd8b06c],
      ["station-veg", 0, 0x5a8a4a], ["station-fruit", 0.9, 0xc0392b], ["station-milk", 1.8, 0xf2f4f6],
    ];
    for (const [id, x, color] of stationSpecs) {
      const st = group(stationRail, x, 0, 0);
      box(st, 0.6, 0.06, 0.5, 0, 0.9, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
      const item = slab(st, 0.3, 0.05, 0.24, 0, 0.94, 0, color, { radius: 0.02, rough: 0.65 });
      reg(hits, item, id);
    }
    holoTag(stationRail, "Serving line", 0, 1.15, 0, { css: "#4fb0c9", w: 0.3 });

    // Finished tray, carried to the register.
    const finishedTray = group(g, 0.9, 0, 0.9);
    const trayBase = box(finishedTray, 0.4, 0.02, 0.3, 0, 0.75, 0, 0x8b929a, { rough: 0.5 });
    for (let i = 0; i < 5; i++) slab(finishedTray, 0.08, 0.02, 0.07, -0.14 + i * 0.07, 0.77, 0, stationSpecs[i][2], { radius: 0.01, rough: 0.6 });
    holoTag(finishedTray, "Completed tray", 0, 0.92, 0, { css: "#4fb0c9", w: 0.32 });
    reg(hits, finishedTray, "finished-tray");
    void trayBase;

    // Line-pace clock and record boards.
    const lineClock = instrument(g, 1.5, 0.95, 2.1, { idle: "READY", color: 0x4fb0c9, w: 0.13, d: 0.19, ry: 0.4 });
    holoTag(g, "Serving pace", 1.5, 1.15, 2.1, { css: "#4fb0c9", w: 0.3 });
    reg(hits, lineClock, "line-clock");
    const countBoard = holoPanel(g, 0.46, 0.3, -2.9, 1.35, 1.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(3,16,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fb0c9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf7fb";
      ctx.font = `600 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("DAILY COUNT", w / 2, h * 0.34);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillStyle = "#bfe0e8";
      ctx.fillText("Trays vs. register total", w / 2, h * 0.66);
    }, { ry: 0.65, accent: CS_ACCENT });
    reg(hits, countBoard, "count-board");
    const productionBoard = holoPanel(g, 0.46, 0.3, 2.7, 1.35, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(3,16,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fb0c9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf7fb";
      ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("PRODUCTION RECORD", w / 2, h * 0.34);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillStyle = "#bfe0e8";
      ctx.fillText("Temps, portions, components", w / 2, h * 0.66);
    }, { ry: -0.6, accent: CS_ACCENT });
    reg(hits, productionBoard, "production-board");

    // Crew: a second cafeteria worker at the far end, clear of every control.
    const crew = standingFigure(g, 2.45, 1.15, { ry: -2.2, cloth: 0xdfe6ec, trousers: 0x2b3138, skin: 0xa9805f });

    let hotWellFailed = false;

    return {
      hits,
      footprint: 2.7,

      onStepComplete(step) {
        if (step.id === "hot-well-probe") repaint(hotWellProbe.userData.screen, signFace("140°F", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.55 }));
        if (step.id === "steam-well-valve") valveHandle.rotation.y = 1.2;
        if (step.id === "cold-well-probe") repaint(coldProbe.userData.screen, signFace("38°F", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.55 }));
        if (step.id === "milk-cooler-check") repaint(milkThermo.userData.screen, signFace("39°F", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.55 }));
        if (step.id === "tray-to-register") repaint(pos.userData.screen, signFace("$2.50", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.55 }));
      },

      onInterrupt(it) {
        if (it.id === "hot-well-fail") {
          hotWellFailed = true;
          repaint(hotWellProbe.userData.screen, signFace("118", { bg: "#3a1414", accent: "#f0645b", fg: "#ffd9d0", scale: 0.6 }));
          wellPans[0].pan.material = mat(0x7a5238, { rough: 0.7 });
        }
        if (it.id === "milk-allergy-tray") {
          trayMilk.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.1, rough: 0.4 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hot-well-fail") {
          hotWellFailed = false;
          repaint(hotWellProbe.userData.screen, signFace("138°F", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.55 }));
          wellPans[0].pan.material = mat(0xb5723c, { rough: 0.6 });
        }
        if (it.id === "milk-allergy-tray") {
          trayMilk.visible = false;
        }
      },

      animate(t, dt, session) {
        wellPans.forEach((w, i) => {
          if (hotWellFailed && i === 0) { w.steam.visible = false; return; }
          w.steam.visible = true;
          w.steam.userData.step(dt, new THREE.Vector3(0, 0.16, 0), 0.3, 0.15, 0.22);
        });
        crew.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;

        const washing = session?.step?.id === "glove-change" && session.holding;
        washWater.visible = washing;
        if (washing) washWater.userData.step(dt, new THREE.Vector3(0, 1.3, -0.14), 0.04, 0.3, -3.0);

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "hot-well-probe") repaint(hotWellProbe.userData.screen, signFace(`${Math.round(120 + gg.t * 40)}`, {
            bg: "#0d1c24", accent: gg.t > 0.68 && gg.t < 0.9 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
          if (session.step?.id === "cold-well-probe") repaint(coldProbe.userData.screen, signFace(`${Math.round(34 + gg.t * 30)}`, {
            bg: "#0d1c24", accent: gg.t > 0.08 && gg.t < 0.3 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "line-pace") {
          repaint(lineClock.userData.screen, signFace(tr.v < 0.4 ? "SLOW" : tr.v > 0.64 ? "FAST" : "PACE", {
            bg: "#0d1c24", accent: tr.v > 0.4 && tr.v < 0.64 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
