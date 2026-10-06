import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, equipmentCabinet,
  standingFigure, surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Plasma Table and Fume VR — Manufacturing & Automation, SMART
// sheet metal pack. A CNC plasma table with a downdraft bed and a cartridge
// extractor: the nest read, the zone damper opened and the static proven on
// the manometer, the plate landed on the slats, consumables checked, the
// zone cleared and the cut run at a steady speed, the plate left to cool and
// the fume to clear, the parts hooked off and the extractor walked. The
// arc is the obvious hazard and the least of them; the fume is what the
// shop breathes for thirty years, and the extractor only protects anybody
// when it is switched on, its damper is open and its filter is not blinded.

const SMPT_ACCENT = 0xe07a3c;

export const SIM_SM_PLASMA_TABLE_AND_FUME = {
  id: "sm-plasma-table-and-fume",
  index: "219",
  domain: "Manufacturing & Automation",
  trade: "Sheet metal worker, CNC plasma — SMART, International Training Institute cutting and fume-control curriculum",
  category: "Manufacturing & Automation",
  indoor: "shop",
  certification: "SMART and its International Training Institute plasma cutting and welding-fume curriculum; OSHA 29 CFR 1910.252 welding, cutting and brazing (ventilation and fire prevention), 29 CFR 1910.134 respiratory protection where the extractor cannot hold the exposure, 29 CFR 1910.1000 air contaminants and ACGIH threshold limit values for metal fume, NIOSH guidance on plasma cutting fume, 29 CFR 1910.212 guarding of the table's cutting zone; NFPA 51B fire prevention during hot work",
  name: "Plasma Table and Fume",
  title: simTitle("Plasma Table and Fume"),
  tagline: "Nest read, downdraft zone opened and static proven on the manometer, plate landed on the slats, zone cleared, the cut held at speed, cooled and hooked off, the extractor walked before the next plate",
  accent: SMPT_ACCENT,
  accentCss: "#e07a3c",
  parSeconds: 275,
  footprint: 2.2,
  badge: { id: "fume-down-the-bed", name: "Fume Down The Bed", note: "A nest cut with the extractor proven before the arc and the zone clear through the whole run" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your SMART local's training coordinator, or your employer's employee assistance program if the crane over your head is the thing you keep hearing",

  game: system({
    name: "Cut Bay",
    currency: "PIERCE",
    ranks: ["Pre-apprentice", "Table Helper", "Plasma Operator", "Cut Lead", "Cut Bay Certified"],
    badges: [
      { id: "static-proven", name: "Static Proven", note: "The extractor's static read on the manometer before the arc, not assumed", test: AWARD.stepClean("static-check") },
      { id: "zone-kept", name: "Zone Kept", note: "Never in the cut zone live, never bare on hot dross", test: AWARD.safe },
      { id: "on-speed", name: "On Speed", note: "The cut held inside the speed band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-nest", name: "Clean Nest", note: "The nest cut without a correction", test: AWARD.clean },
      { id: "steady-arc", name: "Steady Arc", note: "Cut speed never dropped out of band", test: AWARD.unbroken },
      { id: "nest-in-time", name: "Nest In Time", note: "Parts off and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hood-switch-off": "You went to pierce with the extractor's main switch off. A plasma arc on mild steel puts iron oxide and manganese into the air at the rate of a small foundry, and on galvanised plate it adds zinc; the downdraft bed is the only thing between that and the shop's lungs, and it does nothing switched off. 29 CFR 1910.252 assumes the ventilation is running before the arc — the switch is checked every time, not on Mondays.",
    "torch-zone": "You reached into the cutting zone with the program running. The gantry moves at rapid traverse between cuts, faster than a person steps back, and the torch fires a pilot arc on its way to the next pierce; the zone is entered with the program held and the torch parked, never to nudge a part that has tipped. A tipped part waits.",
    "bare-dross": "You picked hot dross out of the slat bin with a bare hand. Dross off a plasma cut is molten metal a minute ago and looks like grey gravel a minute later, and a glove that would have saved your palm is on the bench. The bin is emptied with the scoop, after the cool timer, with gloves on.",
    "aluminium-plate": "You set an aluminium plate over the water in the slat tray. Aluminium cut over water makes hydrogen, and the hydrogen collects under the plate and in the tray's corners until the next pierce lights it; shops have blown the slats off a table that way. Aluminium is cut with the tray drained and the bed aerated, per the table maker's procedure, and never over standing water.",
  },

  lateNotes: {
    "cut-speed": "Not yet — the zone is cleared and reset before the program runs. A cut started with the zone open is a gantry moving through a space nobody has proven empty.",
    "part-hook": "Parts come off after the cool timer, not while the plate is still red under the dross.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "shift-board",
      title: "Sign on at the cut bay board",
      cue: "Mark yourself onto the table, note who has the crane today and whether the extractor's filter was changed.",
      why: "The cut bay shares its air and its ceiling with the rest of the shop: the crane runs over the table, the extractor serves two machines, and the board is where all of that is known before anybody strikes an arc. Signing on means the crane operator knows there is a plate going onto the table under their runway, and the lead knows whether the extractor's filter service was done; a SMART shop reads the board as the first control on the bay, not as a formality.",
    },
    {
      id: "nest-read", kind: "select", target: "nest-screen",
      title: "Read the nest",
      cue: "Material, thickness, pierce count, the cut speed and amperage the program calls for, and where the parts fall.",
      why: "The nest program carries the material and thickness the cut chart was built for, and the amperage, gas and speed follow from it; a program run on the wrong plate cuts too fast and leaves a dross skirt on every part, or too slow and blows through the slats. It also says where the parts and the skeleton will lie when the cut finishes, which is what decides where a hand can go afterwards and where it cannot.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["shade-glasses", "plasma-gloves", "hearing-plugs"],
      itemNames: { "shade-glasses": "shaded safety glasses", "plasma-gloves": "leather gloves", "hearing-plugs": "hearing protection" },
      title: "Dress for the arc",
      cue: "Shaded glasses for the arc, leather gloves for the parts, plugs for the plasma's whistle.",
      why: "A plasma arc is a welding arc that moves, and the glasses are shaded to the amperage on the program because the flash off a wet slat bed reaches an operator standing at the console. The gloves are leather rather than cut-rated because the parts come off hot as well as sharp, and the plugs are for a cut that screams at the pitch of a torch for a whole nest; every one of those is the kind of exposure that is a nuisance today and a diagnosis at fifty.",
    },
    {
      id: "extractor-on", kind: "turn", target: "extractor-damper",
      title: "Open the downdraft zone damper",
      cue: "Turn the zone damper for the table's active section fully open so the extractor pulls under the plate you are about to cut.",
      why: "A downdraft table is divided into zones, and the extractor only pulls through the one whose damper is open; cutting over a closed zone puts the fume up past your face while the fan roars usefully under an empty bed. The damper follows the nest — it is opened for the zone under the plate before the arc, and the turn is made all the way, because a half-open damper halves the capture velocity and the fume does not know that.",
      turn: { turns: 1, axis: "y", label: "ZONE" },
    },
    {
      id: "static-check", kind: "gauge", target: "manometer",
      title: "Prove the extractor's static on the manometer",
      cue: "Read the static across the filter cartridge and commit inside the band — not too low, not blinded high.",
      why: "The manometer is the only instrument that says the extractor is doing its job: too low a static and the damper or a hose has come off and nothing is pulling at the bed; too high and the cartridge is blinded with fume and the fan is moving no air through it. A fan that sounds right moves nothing through a blinded filter, and the number is the difference between capture and a shop full of manganese fume.",
      gauge: { label: "STATIC", speed: 0.72, green: [0.44, 0.6], readout: (t) => `${(t * 12).toFixed(1)} in. w.g.`, missNote: "The static is off the band — a hose off or a filter blinded. Find it before the arc, not after." },
    },
    {
      id: "plate-load", kind: "drag", target: "steel-plate",
      title: "Land the plate on the slats",
      cue: "Bring the plate over on the lifter and set it down square on the slats of the open zone, clear of the datum stops.",
      why: "The plate goes onto the slats flat and square to the datum, because the program's zero is measured off that corner and a plate skewed on the bed puts every part a few millimetres into the next one. It is set down on the lifter rather than slid, because a sheared plate edge dragged across steel slats is a hand's worth of sharp on the far side of the table where somebody is standing.",
      drag: { to: "slat-bed", radius: 0.45, missNote: "Not on the open zone's slats — the extractor pulls through the zone you opened, not the one the plate is on." },
    },
    {
      id: "consumables", kind: "select", target: "torch-consumables",
      title: "Check the torch consumables",
      cue: "Nozzle, electrode, shield and swirl ring — matched to the amperage on the program and not worn past their pierce count.",
      why: "A worn nozzle gives a wide, wandering arc that cuts a bevel and throws dross, and an electrode past its pierce count fails mid-cut and takes the nozzle with it; both are read off the parts afterwards, when the plate is already scrap. The consumables are matched to the amperage on the nest because a 45-amp nozzle on an 85-amp program melts in the first pierce, and the torch is checked with the machine held and the torch parked, never live.",
    },
    {
      id: "zone-clear", kind: "select", target: "zone-reset",
      title: "Clear the zone and reset the barrier",
      cue: "Everybody and everything out of the gantry's travel, the lifter parked, then reset the light barrier at the console.",
      why: "The gantry traverses the whole table between cuts, at a speed that does not allow for a person in its path, and the light barrier is what stops it if somebody is; resetting the barrier is a statement that you looked and the zone was empty, not a button to clear a fault. The lifter is parked outside the zone because a gantry that hits a suspended plate lifter takes the torch off and the crane hook with it.",
    },
    {
      id: "cut-run", kind: "track", target: "cut-speed", seconds: 6,
      title: "Run the cut at speed",
      cue: "Start the program and hold the feed override on the chart speed — watch the kerf, not the arc.",
      why: "Cut speed is the whole quality of a plasma cut: too fast and the arc lags, leaves a bevel and a hard dross on the bottom edge; too slow and the kerf widens, the plate takes heat it does not need and the slats burn. The override is held on the chart speed and adjusted by what the kerf is doing, and the eyes stay on the kerf through shaded glass rather than on the arc itself, which is the brightest thing in the room and tells you nothing.",
      track: { label: "SPEED", green: [0.42, 0.62], rise: 0.56, fall: 0.44, drift: 0.12, readout: (v) => `${Math.round(v * 6000)} mm/min` },
      holdBreakNote: "The speed dropped out of band — a dross skirt on that edge and heat into the slats. Steady the override.",
    },
    {
      id: "cool-wait", kind: "hold", target: "cool-timer",
      seconds: 4,
      title: "Let the plate cool and the fume clear",
      cue: "Torch parked, program ended: start the cool timer and stay out of the zone until it runs down and the extractor has cleared the bed.",
      why: "The parts are at cutting temperature under a skin of grey dross that looks cold, and the fume that came off the last cut is still being pulled down through the slats. The timer is the difference between a part lifted with gloves and a part that welds itself to a glove; it is also the extractor's time to clear the bed, so the first breath taken over the plate is air rather than what was in the kerf.",
      holdBreakNote: "You went to the bed before the timer ran down. The parts are still hot under the dross and the fume is still clearing.",
    },
    {
      id: "dross-check", kind: "find", noHint: true,
      targets: ["hot-dross", "slat-warp"],
      itemNames: { "hot-dross": "dross still glowing on the slats", "slat-warp": "a warped slat under the cut" },
      itemNotes: {
        "hot-dross": "That dross is still glowing under the plate edge — the cool timer is for exactly this, and a gloved hand on that lump is a glove on fire.",
        "slat-warp": "The slat under the last cut has warped up into the kerf line; the next plate will rock on it and the cut will bevel. Slats are turned or changed, not cut through.",
      },
      title: "Look under the plate before anything is lifted",
      cue: "Torch on the bed, look at the slats and the dross and click the two things that change what you do next.",
      why: "The bed tells you what the cut did: glowing dross says the plate is still far too hot for a hand, and a warped slat says the next plate will not sit flat and the next cut will bevel. Both are found by looking under the skeleton with the arc off, and both are missed by an operator who goes straight from the end of the program to the parts, which is the habit this step exists to break.",
    },
    {
      id: "parts-off", kind: "sequence",
      targets: ["part-hook", "part-cart"],
      itemNames: { "part-hook": "hook the parts off the skeleton", "part-cart": "stack them on the cart" },
      title: "Take the parts off",
      cue: "Hook the parts out of the skeleton first, then stack them on the cart edge-in, gloved.",
      why: "Parts come out of the skeleton with the hook because the skeleton is a lattice of sharp, hot edges at every angle and the hook keeps the arm above it; onto the cart second, edges inward, because a cart of plasma-cut parts with edges out is a cart nobody can push. A part that will not lift with the hook is tabbed to the skeleton and is broken out with the plate on the bench, not by pulling harder over the slats.",
      outOfOrderNote: "Hook first, then cart — the hook is what keeps your arm out of the skeleton while the parts are still hot.",
    },
    {
      id: "filter-walk", kind: "find", noHint: true,
      targets: ["filter-lamp", "duct-kink"],
      itemNames: { "filter-lamp": "the filter-change lamp", "duct-kink": "the kinked flex duct behind the extractor" },
      itemNotes: {
        "filter-lamp": "The filter-change lamp on the extractor is lit and has been all shift — the cartridge is blinded and the static you read was the filter, not the bed.",
        "duct-kink": "The flex between the table and the extractor has a kink in it where the cart hit it; half the bed's capture is lost in that bend.",
      },
      title: "Walk the extractor before the next plate",
      cue: "Look at the extractor cabinet and the duct run and click the two faults that explain the fume you saw.",
      why: "The extractor is the control that keeps this trade's lungs in the shop, and it fails quietly: a lamp nobody looks at, a duct kinked by a cart, a cartridge blinded by a week of galvanised. Walking it between plates is what catches those before the next cut, and it is the operator who walks it, because the operator is the one who saw the fume roll off the table edge and knows something is wrong.",
    },
    {
      id: "cut-log", kind: "select", target: "cut-log",
      title: "Log the nest",
      cue: "Enter the nest, the plate, the pierce count, the extractor's static and the filter and duct faults, and sign it.",
      why: "The log carries the extractor's static reading against the date, which is the only record the shop has of whether its fume control was working when this nest was cut; a health question in ten years is answered from these numbers or not at all. It also carries the filter lamp and the kinked duct, so the faults are fixed on the record instead of found by the next operator through a mouthful of fume.",
    },
  ],

  interrupts: [
    {
      id: "filter-alarm",
      kind: "Extractor alarm",
      after: "cut-run", delay: 3, seconds: 12,
      alert: "The extractor's differential alarm has come on. The cartridge has blinded and the fume is rolling off the edge of the table towards you.",
      cue: "The capture is gone, and the arc is still burning.",
      target: "torch-pause",
      why: "A blinded cartridge means the fan is moving no air through the bed, and every second the arc burns from now on puts the fume into the shop instead of the filter. The program is held at the console — torch off, gantry stopped — and the alarm dealt with before another inch is cut. The speed you were holding can be held again in a minute; a lungful of manganese cannot be given back.",
      missNote: "You held your speed and finished the nest with the extractor alarming. The fume went where it went — over the table, past your hood and across the shop. The cut chart does not have a column for that, and 29 CFR 1910.252 does not have an exception for being nearly done.",
      wrongNote: "It is the cycle hold on the console. Stop the arc first; the extractor is a separate problem and it waits for a parked torch.",
    },
    {
      id: "crane-over-table",
      kind: "Lift alarm overhead",
      after: "cool-wait", delay: 3, seconds: 12,
      alert: "The lift alarm — the shop crane is travelling in over the table with the next plate on the hook, and the plate is swinging.",
      cue: "There is a tonne of steel on a hook moving over your head.",
      target: "crane-pendant-stop",
      why: "The crane's travel alarm means the operator has started a move, and a plate on a swinging hook over a cutting table is a load with nobody under it only until somebody looks up too late. The stop on the pendant is pressed by whoever is under the load, not by whoever is driving it; the cool timer can run down under a parked crane.",
      missNote: "You stood at the bed with the timer running while a swinging plate came in over your head. It landed on the far end of the table that time. A crane travel alarm is the loudest warning in a shop precisely because the load above you is the thing you cannot see while you are watching the bed.",
      wrongNote: "It is the stop on the crane pendant. Get the load stopped over your head first — the plate can be re-slung after.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SMPT_ACCENT);

    const floor = box(g, 6.6, 0.06, 6.4, 0, 0.03, -0.3, 0x3a4048, { rough: 0.9, cast: false });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#2b3036", base2: "#22272d", step: 22 }), { repeat: 7, px: 512 }),
      { rough: 0.9, metal: 0.25 });
    // Gantry zone marked on the floor.
    for (const dz of [-3.1, 0.3]) box(g, 4.4, 0.005, 0.08, 0, 0.062, dz, 0xe8b02e, { rough: 0.8, cast: false });
    for (const sx of [-2.2, 2.2]) box(g, 0.08, 0.005, 3.4, sx, 0.062, -1.4, 0xe8b02e, { rough: 0.8, cast: false });

    // ---------------------------------------------------------- the table
    const table = group(g, 0, 0.06, -1.5);
    box(table, 3.6, 0.6, 2.2, 0, 0.3, 0, 0x3a4048, { rough: 0.6, metal: 0.4 });
    box(table, 3.7, 0.06, 2.3, 0, 0.62, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    // Water tray and slats.
    box(table, 3.4, 0.04, 2.0, 0, 0.64, 0, 0x1f3a44, { rough: 0.2, metal: 0.4, cast: false });
    const slats = [];
    for (let i = 0; i < 14; i++) slats.push(box(table, 0.02, 0.16, 2.0, -1.56 + i * 0.24, 0.74, 0, 0x5a4a3a, { rough: 0.8, metal: 0.4 }));
    const slatWarp = slats[9]; slatWarp.rotation.z = 0.18; slatWarp.position.y = 0.78;
    reg(hits, slatWarp, "slat-warp");
    const slatBed = box(table, 1.4, 0.02, 1.6, 0.6, 0.82, 0, 0xffffff, { rough: 0.5 });
    slatBed.visible = false; hits["slat-bed"] = slatBed;
    // The zone dampers along the front rail: one is the turn target.
    for (const sx of [-1.2, 0.0]) {
      const d = group(table, sx, 0.4, 1.16);
      cyl(d, 0.05, 0.05, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
      box(d, 0.08, 0.02, 0.02, 0, 0, 0.02, 0x8a8f94, { rough: 0.5, metal: 0.6 });
    }
    const damper = group(table, 1.2, 0.4, 1.16);
    const damperKnob = cyl(damper, 0.06, 0.06, 0.03, 0, 0, 0, 0xb8402f, { rough: 0.5, seg: 14 });
    damperKnob.rotation.x = Math.PI / 2;
    box(damperKnob, 0.1, 0.02, 0.02, 0, 0.02, 0, 0xfff3d6, { rough: 0.5 });
    decal(damper, 0.18, 0.05, 0, -0.08, 0.02, signFace("ZONE 3", { bg: "#22262b", accent: "#e07a3c", scale: 0.55 }));
    reg(hits, damper, "extractor-damper");
    holoTag(table, "zone damper", 1.2, 0.62, 1.2, { css: "#e07a3c", w: 0.26 });
    // Datum stops and the cutting zone (hazard).
    for (const sz of [-0.9, -0.5]) box(table, 0.04, 0.12, 0.04, -1.7, 0.86, sz, 0xe8b02e, { rough: 0.6 });
    const zone = box(table, 3.4, 0.5, 2.0, 0, 1.05, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, zone, "torch-zone");
    // Gantry, torch and its consumables.
    const gantry = group(table, -1.0, 0.7, 0);
    for (const sz of [-1.2, 1.2]) box(gantry, 0.2, 0.3, 0.2, 0, 0.15, sz, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    box(gantry, 0.24, 0.16, 2.6, 0, 0.5, 0, 0x50606c, { rough: 0.5, metal: 0.5 });
    const carriage = group(gantry, 0, 0.4, 0.3);
    box(carriage, 0.3, 0.3, 0.2, 0, 0.1, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const torch = cyl(carriage, 0.03, 0.03, 0.3, 0, -0.1, 0.16, 0x22262b, { rough: 0.5, seg: 12 });
    const nozzle = cyl(carriage, 0.012, 0.02, 0.06, 0, -0.28, 0.16, 0xd4a54a, { rough: 0.3, metal: 0.8, seg: 10 });
    reg(hits, nozzle, "torch-consumables");
    holoTag(carriage, "torch consumables", 0, 0.4, 0.16, { css: "#e07a3c", w: 0.34 });
    const arc = ball(carriage, 0.03, 0, -0.34, 0.16, 0xbfeaff, { emissive: 0xbfeaff, ei: 3.0 });
    arc.visible = false;
    const sparks = particles(carriage, 40, 0xffb347, { size: 0.02, spread: 0.25 });
    sparks.position.set(0, -0.34, 0.16); sparks.visible = false;
    // The plate on the lifter (dragged), and the aluminium plate leaning by the table (hazard).
    const lifter = group(g, -2.6, 0.06, 0.6, 0.5);
    cyl(lifter, 0.03, 0.03, 2.0, 0, 1.0, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 10 });
    box(lifter, 0.5, 0.06, 0.3, 0.2, 1.8, 0, 0x2b2f34, { rough: 0.6 });
    const plate = box(lifter, 1.2, 0.012, 0.8, 0.3, 0.9, 0.3, 0x8a949d, { rough: 0.5, metal: 0.6 });
    reg(hits, plate, "steel-plate");
    holoTag(lifter, "6 mm mild steel plate", 0.3, 1.2, 0.3, { css: "#e07a3c", w: 0.4 });
    const alu = box(g, 0.9, 0.012, 0.6, 2.6, 0.5, 0.3, 0xd8dde2, { rough: 0.3, metal: 0.8 });
    alu.rotation.x = -1.2;
    holoTag(g, "aluminium plate", 2.6, 0.9, 0.3, { css: "#d2312b", w: 0.3 });
    reg(hits, alu, "aluminium-plate");
    // The dross bin at the end of the table (hazard) and the hot dross on the slats (find).
    const bin = group(g, 2.3, 0.06, -1.5, -0.3);
    box(bin, 0.5, 0.4, 0.5, 0, 0.2, 0, 0x2f6f8c, { rough: 0.8, metal: 0.3 });
    for (let i = 0; i < 5; i++) ball(bin, 0.03 + (i % 2) * 0.01, -0.15 + i * 0.07, 0.42, (i % 2) * 0.1 - 0.05, 0x5a5a5a, { rough: 0.9 });
    reg(hits, bin, "bare-dross");
    holoTag(bin, "dross bin — scoop and gloves", 0, 0.62, 0, { css: "#d2312b", w: 0.46 });
    const hotDross = ball(table, 0.04, 0.9, 0.86, 0.6, 0x6a3a2a, { emissive: 0xff5a1a, ei: 1.4, rough: 0.9 });
    reg(hits, hotDross, "hot-dross");
    // Cool timer on the table's end post.
    const timer = instrument(g, 1.9, 1.05, -0.2, { ry: -0.5, idle: "COOL", color: 0xe07a3c, w: 0.12, d: 0.18 });
    holoTag(g, "cool timer", 1.9, 1.25, -0.2, { css: "#e07a3c", w: 0.22 });
    reg(hits, timer, "cool-timer");
    // Part hook and cart.
    const hook = group(g, -2.0, 0.06, -0.3, 0.3);
    cyl(hook, 0.012, 0.012, 0.8, 0, 0.9, 0, 0x2b2f34, { rough: 0.5, seg: 8 }).rotation.z = 0.4;
    box(hook, 0.08, 0.02, 0.02, 0.3, 1.26, 0, 0xb8402f, { rough: 0.5 });
    box(hook, 0.06, 0.06, 0.06, 0, 0.5, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    reg(hits, hook, "part-hook");
    holoTag(hook, "part hook", 0, 1.45, 0, { css: "#e07a3c", w: 0.22 });
    const cart = group(g, 2.6, 0.06, -2.9, 0.4);
    box(cart, 0.9, 0.05, 0.6, 0, 0.45, 0, 0x2f6f8c, { rough: 0.6, metal: 0.4 });
    for (const [sx, sz] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]]) {
      box(cart, 0.04, 0.4, 0.04, sx, 0.25, sz, 0x3a4048, { rough: 0.6, metal: 0.5 });
      cyl(cart, 0.05, 0.05, 0.03, sx, 0.05, sz, 0x1b1e22, { rough: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    }
    reg(hits, cart, "part-cart");
    holoTag(cart, "parts cart", 0, 0.7, 0, { css: "#e07a3c", w: 0.22 });
    const partsOn = group(cart, 0, 0.5, 0);
    for (let i = 0; i < 3; i++) box(partsOn, 0.5, 0.012, 0.3, 0, i * 0.015, -0.15 + i * 0.15, 0x8a949d, { rough: 0.5, metal: 0.6 });
    partsOn.visible = false;

    // ------------------------------------------------------ the console
    const cnc = group(g, 2.2, 0.06, 1.4, -0.9);
    box(cnc, 0.7, 1.1, 0.5, 0, 0.55, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    box(cnc, 0.72, 0.04, 0.52, 0, 1.12, 0, 0x50606c, { rough: 0.5, metal: 0.4 });
    holoPanel(cnc, 0.6, 0.42, 0, 1.5, -0.1, (ctx, w, h) => {
      ctx.fillStyle = "#120c06"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e07a3c"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffe6d2";
      ctx.fillText("NEST 0412 — 6 MM MS", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Plate: 6 mm mild steel, 1200 x 800", "Amps: 85 A · nozzle 85 A", "Speed: 2400 mm/min (chart)", "Pierces: 18 · zone 3", "Parts: 11 + skeleton"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: SMPT_ACCENT, stalk: true });
    const nestHit = box(cnc, 0.6, 0.42, 0.04, 0, 1.5, -0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, nestHit, "nest-screen");
    const speedDial = group(cnc, -0.2, 1.15, 0.1);
    const speedKnob = cyl(speedDial, 0.05, 0.05, 0.03, 0, 0, 0, 0xb8402f, { rough: 0.5, seg: 14 });
    box(speedKnob, 0.08, 0.02, 0.02, 0, 0.02, 0, 0xfff3d6, { rough: 0.5 });
    const speedFace = decal(speedDial, 0.2, 0.06, 0, 0.02, -0.12, signFace("---- mm/min", { bg: "#0d1c24", accent: "#e07a3c", fg: "#ffe6d2", scale: 0.5 }), { glow: true, ei: 0.7 });
    speedFace.rotation.x = -Math.PI / 2;
    reg(hits, speedDial, "cut-speed");
    holoTag(cnc, "feed override", -0.2, 1.3, 0.3, { css: "#e07a3c", w: 0.28 });
    const pause = group(cnc, 0.15, 1.15, 0.1);
    cyl(pause, 0.035, 0.035, 0.03, 0, 0, 0, 0xe8b02e, { rough: 0.5, seg: 14 });
    decal(pause, 0.12, 0.04, 0, 0.02, 0.07, signFace("HOLD", { bg: "#22262b", accent: "#e8b02e", scale: 0.55 })).rotation.x = -Math.PI / 2;
    reg(hits, pause, "torch-pause");
    const reset = group(cnc, 0.28, 1.15, -0.1);
    cyl(reset, 0.03, 0.03, 0.03, 0, 0, 0, 0x59c97b, { rough: 0.5, seg: 14 });
    decal(reset, 0.12, 0.04, 0, 0.02, 0.06, signFace("RESET", { bg: "#22262b", accent: "#59c97b", scale: 0.55 })).rotation.x = -Math.PI / 2;
    reg(hits, reset, "zone-reset");
    // The light barrier posts either side of the table front.
    for (const sx of [-1.9, 1.9]) cyl(g, 0.025, 0.025, 1.2, sx, 0.66, -0.3, 0xe8b02e, { rough: 0.5, seg: 10 });
    const barrier = box(g, 3.8, 0.01, 0.01, 0, 1.0, -0.3, 0xd2312b, { emissive: 0xd2312b, ei: 1.4, rough: 0.4, cast: false });

    // ----------------------------------------------------- the extractor
    const extractor = equipmentCabinet(g, 1.1, 1.9, 0.8, -2.6, -2.4, { ry: 0.6 });
    holoTag(extractor, "cartridge extractor", 0, 2.1, 0.4, { css: "#e07a3c", w: 0.4 });
    const mainSwitch = group(extractor, -0.4, 1.4, 0.42);
    box(mainSwitch, 0.1, 0.14, 0.05, 0, 0, 0, 0x22262b, { rough: 0.6 });
    box(mainSwitch, 0.02, 0.08, 0.02, 0, -0.02, 0.03, 0xd2312b, { rough: 0.5 });
    decal(mainSwitch, 0.12, 0.04, 0, 0.1, 0.026, signFace("EXTRACT", { bg: "#22262b", accent: "#e07a3c", scale: 0.5 }));
    reg(hits, mainSwitch, "hood-switch-off");
    holoTag(extractor, "extractor — OFF", -0.4, 1.62, 0.42, { css: "#d2312b", w: 0.32 });
    const filterLamp = ball(extractor, 0.03, 0.3, 1.5, 0.42, 0xf2ae14, { emissive: 0xf2ae14, ei: 1.6 });
    reg(hits, filterLamp, "filter-lamp");
    decal(extractor, 0.2, 0.04, 0.3, 1.42, 0.42, signFace("FILTER", { bg: "#22262b", accent: "#f2ae14", scale: 0.5 }));
    const alarmBeacon = cyl(extractor, 0.05, 0.05, 0.1, 0, 1.96, 0, 0xd2312b, { emissive: 0xd2312b, ei: 2.0, seg: 12 });
    alarmBeacon.visible = false;
    const manometer = instrument(extractor, 0.1, 1.1, 0.45, { ry: 0, idle: "-- in.", color: 0xe07a3c, w: 0.13, d: 0.2 });
    manometer.rotation.x = -0.5;
    reg(hits, manometer, "manometer");
    holoTag(extractor, "manometer", 0.1, 0.9, 0.5, { css: "#e07a3c", w: 0.24 });
    // Flex duct from the table to the extractor, with the kink.
    const flex = group(g, -1.6, 0.06, -2.9);
    for (let i = 0; i < 6; i++) cyl(flex, 0.16, 0.16, 0.22, -0.5 + i * 0.22, 0.4 + Math.abs(i - 3) * 0.02, 0, 0x6a6f74, { rough: 0.8, seg: 14 }).rotation.z = Math.PI / 2;
    const kink = cyl(flex, 0.16, 0.08, 0.24, -0.72, 0.42, 0, 0x4a4f54, { rough: 0.8, seg: 14 });
    kink.rotation.z = Math.PI / 2 + 0.5;
    reg(hits, kink, "duct-kink");
    holoTag(flex, "flex duct", 0, 0.75, 0, { css: "#e07a3c", w: 0.22 });

    // ------------------------------------------------ the crane overhead
    const crane = group(g, 0, 0.06, 1.8);
    box(crane, 6.2, 0.14, 0.3, 0, 2.85, 0, 0xf2c14b, { rough: 0.6, metal: 0.4, cast: false });
    const trolley = group(crane, 2.4, 2.6, 0);
    box(trolley, 0.5, 0.3, 0.4, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    cyl(trolley, 0.01, 0.01, 0.7, 0, -0.5, 0, 0x1b1e22, { rough: 0.5, seg: 6 });
    const hookBlock = box(trolley, 0.12, 0.2, 0.12, 0, -0.95, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const slung = box(trolley, 1.2, 0.012, 0.8, 0, -1.15, 0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    slung.visible = false;
    const craneBeacon = cyl(crane, 0.05, 0.05, 0.1, 2.4, 2.98, 0, 0xf2ae14, { emissive: 0xf2ae14, ei: 2.0, seg: 12 });
    craneBeacon.visible = false;
    const pendant = group(g, 2.8, 0.06, 0.6, -1.2);
    cyl(pendant, 0.01, 0.01, 1.4, 0, 2.1, 0, 0x1b1e22, { rough: 0.5, seg: 6 });
    box(pendant, 0.1, 0.3, 0.06, 0, 1.3, 0, 0xe8b02e, { rough: 0.6 });
    for (let i = 0; i < 4; i++) cyl(pendant, 0.012, 0.012, 0.02, 0, 1.4 - i * 0.05, 0.035, 0x22262b, { rough: 0.5, seg: 8 }).rotation.x = Math.PI / 2;
    const pendantStop = cyl(pendant, 0.03, 0.03, 0.03, 0, 1.17, 0.04, 0xd2312b, { rough: 0.4, seg: 14 });
    pendantStop.rotation.x = Math.PI / 2;
    reg(hits, pendantStop, "crane-pendant-stop");
    holoTag(pendant, "crane pendant", 0, 1.6, 0, { css: "#e07a3c", w: 0.28 });

    // -------------------------------------------------- board, PPE, log
    const board = group(g, -2.9, 0.06, 1.7, 1.0);
    box(board, 0.9, 0.7, 0.04, 0, 1.45, 0, 0x1b2026, { rough: 0.6 });
    const boardFace = decal(board, 0.84, 0.64, 0, 1.45, 0.025, paperFace("CUT BAY — TODAY", ["Plasma table: apprentice (you)", "Crane: journeyman, a.m. plates", "Extractor filter: NOT changed", "Lead: on the floor", "Next plate: 12 mm, 1200 x 800"], { bg: "#eef1f3", band: "#e07a3c" }), { px: 384 });
    reg(hits, boardFace, "shift-board");
    for (const sx of [-0.4, 0.4]) cyl(board, 0.02, 0.02, 1.8, sx, 0.9, -0.02, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    const ppe = group(g, 0.6, 0.06, 2.7, 3.1);
    box(ppe, 0.6, 0.8, 0.16, 0, 1.25, 0, 0x2b2f34, { rough: 0.6 });
    decal(ppe, 0.54, 0.1, 0, 1.6, 0.085, signFace("PPE — PLASMA", { bg: "#0d1c24", accent: "#e07a3c", scale: 0.5 }));
    const glasses = group(ppe, -0.18, 1.35, 0.1);
    box(glasses, 0.14, 0.04, 0.02, 0, 0, 0, 0x2f5a3a, { rough: 0.3, opacity: 0.8, transparent: true });
    reg(hits, glasses, "shade-glasses");
    const gloves = group(ppe, 0.02, 1.35, 0.1);
    for (const sx of [-0.03, 0.03]) box(gloves, 0.05, 0.13, 0.02, sx, 0, 0, 0xb8863a, { rough: 0.8 });
    reg(hits, gloves, "plasma-gloves");
    const plugs = group(ppe, 0.2, 1.35, 0.1);
    box(plugs, 0.08, 0.1, 0.03, 0, 0, 0, 0x2f6f8c, { rough: 0.6 });
    for (const sx of [-0.02, 0.02]) ball(plugs, 0.012, sx, 0.03, 0.02, 0xf2ae14, { rough: 0.6 });
    reg(hits, plugs, "hearing-plugs");
    const logBoard = group(g, 2.9, 0.06, 2.4, -0.9);
    box(logBoard, 0.06, 1.0, 0.06, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const logFace = decal(logBoard, 0.34, 0.44, 0, 1.2, 0.02, paperFace("CUT LOG", ["Nest 0412 — 6 mm MS", "Static: ____ in. w.g.", "Pierces: ____", "Extractor faults: ____", "Signed: ____"], { bg: "#f4efe4", band: "#e07a3c" }), { px: 256 });
    reg(hits, logFace, "cut-log");
    holoTag(logBoard, "cut log", 0, 1.5, 0, { css: "#e07a3c", w: 0.2 });

    // ------------------------------------------------------------ the crew
    const lead = standingFigure(g, -1.0, 2.3, { ry: 2.8, cloth: 0x3a5a7a, trousers: 0x2b2f34, helmet: 0xe07a3c, gloves: true });
    const craneOp = standingFigure(g, 1.75, 2.15, { ry: -2.6, cloth: 0x7a5a3a, trousers: 0x22262b, helmet: 0xf2c14b });

    // ------------------------------------------------------ shop dressing
    for (const sx of [-1.6, 0.2, 2.0]) {
      box(g, 0.6, 0.06, 0.2, sx, 2.75, -1.6, 0x2b2f34, { rough: 0.6, cast: false });
      box(g, 0.56, 0.02, 0.16, sx, 2.72, -1.6, 0xfff7e0, { emissive: 0xfff7e0, ei: 1.2, rough: 0.5, cast: false });
    }
    const gasRack = group(g, -2.9, 0.06, -0.6, 0.6);
    for (const sx of [-0.14, 0.14]) {
      cyl(gasRack, 0.1, 0.1, 1.3, sx, 0.65, 0, sx < 0 ? 0x2f6f8c : 0x8a8f94, { rough: 0.5, metal: 0.4, seg: 16 });
      cyl(gasRack, 0.03, 0.03, 0.1, sx, 1.35, 0, 0x22262b, { rough: 0.5, seg: 10 });
    }
    box(gasRack, 0.5, 0.03, 0.03, 0, 0.9, 0.1, 0x22262b, { rough: 0.6, metal: 0.5 });
    holoTag(gasRack, "air · nitrogen — chained", 0, 1.55, 0, { css: "#e07a3c", w: 0.42 });
    for (const [x, z] of [[-2.3, 1.0], [2.5, -0.5], [-0.8, -3.1]]) cone(g, x, z);
    const ext = group(g, 2.9, 0.06, -0.6, -0.8);
    cyl(ext, 0.06, 0.07, 0.42, 0, 0.35, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.025, 0.025, 0.08, 0, 0.6, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "extinguisher", 0, 0.72, 0, { css: "#d2312b", w: 0.3 });
    const signBoard = group(g, -1.9, 0.06, 2.8, 3.1);
    box(signBoard, 0.5, 0.4, 0.03, 0, 1.4, 0, 0x1b2026, { rough: 0.6 });
    decal(signBoard, 0.44, 0.34, 0, 1.4, 0.018, signFace("EXTRACT ON\nBEFORE\nTHE ARC", { bg: "#0d1c24", accent: "#e07a3c", fg: "#ffe6d2", scale: 0.28 }));
    cyl(signBoard, 0.02, 0.02, 1.2, 0, 0.6, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    const skeletonRack = group(g, 0.6, 0.06, -3.1, 0);
    for (const sx of [-0.5, 0.5]) box(skeletonRack, 0.06, 1.4, 0.06, sx, 0.7, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 4; i++) box(skeletonRack, 0.9, 0.5, 0.01, 0, 0.8, -0.05 + i * 0.03, 0x6a7078, { rough: 0.6, metal: 0.5 });
    holoTag(skeletonRack, "skeletons", 0, 1.55, 0, { css: "#e07a3c", w: 0.22 });
    const chipDrum = group(g, -2.7, 0.06, 0.2, 0.2);
    cyl(chipDrum, 0.24, 0.24, 0.6, 0, 0.3, 0, 0x2f6f8c, { rough: 0.7, metal: 0.3, seg: 16 });
    decal(chipDrum, 0.22, 0.14, 0.245, 0.3, 0, signFace("SLAG", { bg: "#0d1c24", accent: "#e07a3c", scale: 0.5 }));

    let cutting = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, -1.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "extractor-on") { holoTag(table, "zone 3 open", 1.2, 0.72, 1.2, { css: "#59c97b", w: 0.24 }); }
        if (step.id === "plate-load") { plate.parent.remove(plate); table.add(plate); plate.position.set(0.6, 0.83, 0); plate.rotation.set(0, 0, 0); }
        if (step.id === "zone-clear") { barrier.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.4 }); }
        if (step.id === "cut-run") { arc.visible = false; sparks.visible = false; }
        if (step.id === "dross-check") { hotDross.material = mat(0x4a4a4a, { rough: 0.9 }); }
        if (step.id === "parts-off") { partsOn.visible = true; plate.visible = false; }
        if (step.id === "filter-walk") { filterLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 }); kink.rotation.z = Math.PI / 2; }
        if (step.id === "cut-log") repaint(logFace, paperFace("CUT LOG", ["Nest 0412 — 6 mm MS", "Static: 6.1 in. w.g.", "Pierces: 18", "Filter blinded, flex kinked — reported", "Signed: apprentice / lead"], { bg: "#f4efe4", band: "#e07a3c" }));
      },
      onHazard() {},
      // The extractor really alarms; the crane really comes in over the table.
      onInterrupt(it) {
        if (it.id === "filter-alarm") { alarmBeacon.visible = true; filterLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.0 }); }
        if (it.id === "crane-over-table") { craneBeacon.visible = true; slung.visible = true; trolley.position.x = 0.4; craneOp.position.set(2.6, 0, 1.2); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "filter-alarm") { alarmBeacon.visible = false; arc.visible = false; sparks.visible = false; }
        if (it.id === "crane-over-table") { craneBeacon.visible = false; trolley.position.x = -2.4; slung.position.y = -0.6; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        cutting = !!(step?.id === "cut-run" && session.holding);
        arc.visible = cutting; sparks.visible = cutting;
        if (cutting) { carriage.position.z = 0.3 + Math.sin(t * 1.2) * 0.8; gantry.position.x = -1.0 + (Math.sin(t * 0.5) + 1) * 0.9; }
        if (alarmBeacon.visible) alarmBeacon.rotation.y += dt * 4;
        if (craneBeacon.visible) { craneBeacon.rotation.y += dt * 4; slung.rotation.z = Math.sin(t * 2) * 0.08; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "static-check") {
          repaint(manometer.userData.screen, signFace(`${(gg.t * 12).toFixed(1)} in.`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#ffe6d2", scale: 0.6 }));
        }
        const tn = session?.turn;
        if (tn && step?.id === "extractor-on") damperKnob.rotation.z = tn.amount * Math.PI * 2;
        const tr = session?.track;
        if (tr && step?.id === "cut-run") {
          speedKnob.rotation.z = tr.v * Math.PI * 1.6;
          repaint(speedFace, signFace(`${Math.round(tr.v * 6000)} mm/min`, { bg: "#0d1c24", accent: tr.v >= 0.42 && tr.v <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#ffe6d2", scale: 0.5 }));
        }
        if (step?.id === "cool-wait" && session.holding) repaint(timer.userData.screen, signFace(`${Math.max(0, 4 - session.holdFor).toFixed(1)} s`, { bg: "#0d1c24", accent: "#e07a3c", fg: "#ffe6d2", scale: 0.6 }));
      },
    };
  },
};
