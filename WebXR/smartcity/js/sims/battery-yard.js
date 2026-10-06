import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, cone, instrument, standingFigure, lockTag, barrierPanel, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Battery Yard VR — Energy & Power, station five.
// Taking a grid-scale battery enclosure out of service for a module swap:
// the gas detection and deflagration vents read from outside, the unit
// stopped from the controller and the AC side opened before the DC, the
// rack disconnects pulled in order, a wait for the DC bus to bleed down,
// proven dead with a meter tested on a known source, racks grounded, the
// module handled with insulated tools and no rings, and a thermal check
// before the door closes.

const BY_ACCENT = 0x9fd84f;

export const SIM_BATTERY_YARD = {
  id: "battery-yard",
  index: "44",
  domain: "Energy & Power",
  trade: "Battery energy storage technician — grid scale",
  category: "Energy & Power",
  weather: "overcast",
  certification: "IBEW outside construction and utility locals; NFPA 855 stationary energy storage installation; NFPA 70E DC arc-flash boundary and shock approach; OSHA 29 CFR 1910.147 lockout/tagout and 1910.269 for the utility interconnection; UL 9540A thermal-runaway test data",
  name: "Battery Yard",
  title: simTitle("Battery Yard"),
  tagline: "Grid battery module swap: gas and vent check from outside, stop from the controller, AC before DC, rack disconnects in order, bleed-down wait, live-dead-live on the DC bus, racks grounded, insulated tools, thermal check before the door",
  accent: BY_ACCENT,
  accentCss: "#9fd84f",
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "bus-proven-dead", name: "Bus Proven Dead", note: "AC before DC, the full bleed-down waited out, and live-dead-live on a tested meter — first time" },

  game: system({
    name: "Storage Operations",
    currency: "kWh",
    ranks: ["Apprentice", "Storage Technician", "Commissioning Tech", "Site Lead", "Storage Operations Certified"],
    badges: [
      { id: "outside-first", name: "Outside First", note: "Gas detection and vents read before the door opened, first time", test: AWARD.stepClean("gas") },
      { id: "no-shortcut", name: "No Shortcut", note: "Never DC before AC, never inside without the meter proven, never metal on a live rack", test: AWARD.safe },
      { id: "bled-down", name: "Bled Down", note: "Bus voltage and cell temperature both read inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-swap", name: "Clean Swap", note: "No corrections anywhere in the isolation", test: AWARD.clean },
      { id: "full-wait", name: "Full Wait", note: "The bleed-down held for its whole duration", test: AWARD.unbroken },
      { id: "swap-fast", name: "Swapped In Time", note: "Module out and enclosure closed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-door-on-alarm": "You opened the enclosure with the gas detector in alarm. A lithium enclosure in off-gas is pre-ignition: opening the door gives the flammable mixture the oxygen it was missing, and the deflagration goes out the door you are standing in.",
    "dc-before-ac": "You opened the DC rack disconnects with the inverter still running. Breaking DC under load draws an arc that does not self-extinguish the way AC does; the disconnect welds, the arc keeps burning, and the arc-flash boundary is the whole aisle.",
    "metal-jewellery": "You reached into the rack wearing a ring and a watch. A battery string is a low-voltage, very-high-current source: metal across the terminals does not shock you, it welds to your hand and burns through it in seconds.",
    "water-on-cells": "You reached for a water extinguisher at a cell fire. Water on a burning lithium module flashes and spreads the event; the enclosure's own suppression and a safe distance are the response, and the fire service is called for the rest.",
  },

  lateNotes: {
    "dc-disconnect-1": "The DC racks open after the inverter is stopped and the AC breaker is open — under load, this is the arc.",
    "bus-meter": "Proving dead comes after the bleed-down wait; a capacitive bus reads dangerous long after the disconnects are pulled.",
    "module-latch": "The module comes out after the bus is proven dead and the racks are grounded.",
  },

  // Interruptions: see shared/game.js. A battery yard isolation is worked
  // over several minutes on live gas detection and a rack full of cells
  // still cooling — both of the things that actually change mid-job here are
  // things a real crew would have to notice and answer without restarting
  // the isolation from the top.
  interrupts: [
    {
      id: "residual-offgas",
      kind: "Gas re-alarm",
      after: "bleed", delay: 3, seconds: 11,
      alert: "The gas detection panel outside the enclosure has climbed back into the amber while the bleed-down timer is still running.",
      cue: "Read the panel again before you touch anything else in there.",
      target: "gas-panel",
      why: "Off-gassing from a stressed cell does not stop just because the electrical isolation started; residual heat inside a failed module keeps producing gas on its own schedule, independent of where the bleed-down timer happens to be. The panel is checked once at the start of the job, but the reading it gave then is not a guarantee that holds for the whole isolation.",
      missNote: "The bleed-down finished with the gas reading back in the amber and nobody looked again. The enclosure door was about to open on an atmosphere the crew had already stopped tracking, which is exactly the gap a stationary gas panel exists to close.",
      wrongNote: "That is not the panel that just went into alarm. Read the gas detection panel before doing anything else in this enclosure.",
    },
    {
      id: "neighbour-heats-up",
      kind: "Thermal spike",
      after: "bleed", delay: 7, seconds: 10,
      alert: "While the bleed-down timer still runs, the thermal camera's standing preview on the neighbouring module shows a hot spot climbing fast.",
      cue: "Check the thermal camera before the bleed-down even finishes.",
      target: "thermal-camera",
      why: "A cell failure is rarely isolated to one module; the neighbours in the same rack absorb whatever heat and current the failed cell was rejecting right up until the moment the isolation began, and UL 9540A thermal-runaway test data is exactly why a second module going the same way is checked for the instant it shows, not saved for the scheduled scan later in the job. Catching that spike now is what keeps one bad module from becoming two.",
      missNote: "The bleed-down finished with a second module already climbing on the thermal camera and nobody looked. A rack that goes on to close up with a hot neighbour inside it can go into thermal runaway with the technician already moving on to a job that looked finished.",
      wrongNote: "The camera is what shows the hot spot. Check the thermal reading before finishing anything else with this rack.",
    },
  ],

  steps: [
    {
      id: "wo", kind: "select", target: "work-order",
      title: "Read the work order and one-line",
      cue: "Check which enclosure, which rack, the bleed-down time and the arc-flash category.",
      why: "A grid battery yard is a dozen identical enclosures on the same aisle, and the wrong one opened under lockout is a live one. The one-line and the work order say which enclosure and rack, what the DC bus is rated at when it is opened, and the arc-flash category that decides what the technician must be wearing before ever reaching for the door.",
    },
    {
      id: "gas", kind: "sequence", anyOrder: true,
      targets: ["gas-panel", "vent-check"],
      itemNames: { "gas-panel": "gas detection panel", "vent-check": "deflagration vents" },
      title: "Read the enclosure from outside",
      cue: "Check the gas detection panel and look over the deflagration vents — before touching the door.",
      why: "Everything a technician needs to know about whether this enclosure is safe to open is readable from outside it, which is exactly why the gas panel and the vents are mounted where they are. A lithium enclosure that is off-gassing gives no other outward sign, and the reading has to be checked before the door, not after.",
    },
    {
      id: "stop", kind: "select", target: "controller-stop",
      title: "Stop the unit from the controller",
      cue: "Command the enclosure to stop and confirm the inverter has ramped to zero.",
      why: "A controlled stop from the controller ramps the inverter down and opens the internal contactors in the sequence the system was engineered for, rather than the arbitrary order a breaker pulled by hand would impose. Everything the technician opens after this command is opening something the controller has already brought to zero, not something still carrying load.",
    },
    {
      id: "ac", kind: "sequence",
      targets: ["ac-breaker", "ac-lock"],
      itemNames: { "ac-breaker": "AC breaker open", "ac-lock": "AC lock and tag" },
      title: "Open and lock the AC side",
      cue: "Open the AC interconnection breaker, then lock and tag it.",
      why: "The AC interconnection is opened and locked first under 1910.147 because it is the only side that can re-energise the enclosure from the grid; a rack disconnect pulled before it means whatever happens next happens with the inverter still able to see a live bus. With the AC breaker locked and tagged, the only energy left anywhere in the enclosure is what the cells themselves are holding.",
      outOfOrderNote: "Breaker open, then the lock — you never lock a breaker you have not opened.",
    },
    {
      id: "dc", kind: "sequence",
      targets: ["dc-disconnect-1", "dc-disconnect-2", "dc-disconnect-3"],
      itemNames: { "dc-disconnect-1": "rack 1 disconnect", "dc-disconnect-2": "rack 2 disconnect", "dc-disconnect-3": "rack 3 disconnect" },
      title: "Open the rack DC disconnects",
      cue: "Pull the rack disconnects one at a time, in rack order.",
      why: "Each rack is its own string carrying the full DC bus voltage independently of the others, and opening more than one at once is how a technician loses track of which strings are actually isolated. Pulling the disconnects one at a time, in the order printed on the one-line, means the aisle always knows exactly which racks are still tied in and which are not.",
      outOfOrderNote: "Rack 1, then 2, then 3 — the order on the one-line is the order in the aisle.",
    },
    {
      id: "bleed", kind: "hold", target: "bleed-timer", seconds: 10,
      title: "Wait out the bleed-down",
      cue: "Hold the timer through the full bleed-down interval printed on the enclosure.",
      why: "The DC link capacitors hold a lethal charge for a fixed interval after every rack disconnect is open, discharging through their own bleed resistors on their own schedule regardless of how urgent the swap is. The wait is printed on the enclosure door as a number, not a judgement call, precisely because it cannot be shortened by watching the meter drop faster than the physics allows.",
      holdBreakNote: "You cut the bleed-down short — the bus is still charged. Start the interval again.",
    },
    {
      id: "prove", kind: "sequence",
      targets: ["meter-known-live", "bus-meter", "meter-known-again"],
      itemNames: { "meter-known-live": "meter on the known source", "bus-meter": "meter on the DC bus", "meter-known-again": "meter on the known source again" },
      title: "Live, dead, live on the DC bus",
      cue: "Prove the meter on the known source, read the bus, then prove the meter again.",
      why: "Live-dead-live is what NFPA 70E requires before anyone treats a DC bus as de-energised: a meter that failed silently between readings shows every bus as dead, live or not, and there is no way to tell the difference from the display alone. Proving the meter on a known source before and after the bus reading is the only thing that makes 'dead' mean anything a technician can act on.",
      outOfOrderNote: "Known source, then the bus, then the known source again — the meter is proven either side of the reading that matters.",
    },
    {
      id: "voltage", kind: "gauge", target: "bus-readout",
      title: "Confirm the bus is at zero",
      cue: "Read the residual bus voltage and commit inside the safe band.",
      why: "Zero on a residual DC bus reading means single digits of volts, not simply lower than the 800-plus it was carrying under load. A residual reading above the safe band means a string is still tied in somewhere the disconnect sequence missed, and the aisle a technician is about to reach into is still carrying dangerous voltage.",
      gauge: { label: "DC BUS", speed: 0.7, green: [0.02, 0.14], readout: (t) => `${Math.round(t * 1000)} V`, missNote: "Still carrying voltage — find the string that is still connected before anyone reaches in." },
    },
    {
      id: "ground", kind: "sequence", anyOrder: true,
      targets: ["ground-rack", "insulated-tools"],
      itemNames: { "ground-rack": "rack grounding cable", "insulated-tools": "insulated tool set" },
      title: "Ground the rack and take insulated tools",
      cue: "Apply the rack grounding cable and pick up the insulated tool set.",
      why: "The rack grounding cable holds the string at zero potential even if a fault or a stray tie somewhere brings voltage back onto it, which a proven-dead reading alone cannot guarantee stays true for the whole job. The insulated 1000 V tool set is what stops a dropped spanner from becoming an unintended bus bar across two live-looking terminals inside a rack full of cells.",
    },
    {
      id: "swap", kind: "drag", target: "module-latch",
      title: "Draw the failed module out",
      cue: "Release the module latch and slide the failed module onto the transfer cart.",
      why: "A failed module is sixty kilograms of lithium cells riding a rail, and a rail is exactly what it is designed to come out on — not into someone's arms, where a slip is a crush injury and a punctured cell in the same moment. It is drawn straight onto the transfer cart and sent to the quarantine area, never set back down in an aisle where the next tech might treat it as good stock.",
      drag: { to: "cart-deck", radius: 0.45, missNote: "Not on the cart — slide the module square onto the transfer deck." },
    },
    {
      id: "thermal", kind: "gauge", target: "thermal-camera",
      title: "Thermal-check the rack",
      cue: "Scan the remaining modules and terminals and commit when the hottest reading is inside the band.",
      why: "A module fails because something inside it got hot, per UL 9540A thermal-runaway test data, and a neighbouring module under the same stress is the first place that shows on a thermal camera before it shows on any other instrument. Scanning the remaining racks before the door closes is what catches a second cell heading toward the same failure before it becomes the incident this swap was meant to fix.",
      gauge: { label: "HOT SPOT", speed: 0.75, green: [0.1, 0.36], readout: (t) => `${Math.round(18 + t * 80)} °C`, missNote: "Too hot to close up — find the source before this enclosure goes back in service." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["suppression-tag"],
      itemNames: { "suppression-tag": "suppression bottle out of date" },
      itemNotes: { "suppression-tag": "The clean-agent suppression bottle's inspection tag expired last quarter — the enclosure's own first line of defence is out of certification." },
      title: "Walk the enclosure before you close it",
      cue: "Check the suppression, the detection and the door seals, and click what is not in service.",
      why: "The enclosure has to protect itself for every hour nobody is standing in front of it, and the suppression bottle, the gas detection and the door seals are the only things doing that job overnight. Everything that keeps the unit safe unattended gets checked before this door closes, because the next person to open it may be arriving to an alarm, not a scheduled swap.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BY_ACCENT);
    box(g, 6.2, 0.1, 5.2, 0, 0.05, 0, 0x4d5157, { rough: 0.95 });
    for (let i = -3; i <= 3; i++) box(g, 0.06, 0.004, 5.0, i * 0.9, 0.101, 0, 0x3c4045, { rough: 0.95, cast: false });
    // The enclosure: a container-format unit with a door open toward the learner.
    const enc = group(g, -0.3, 0.1, -1.5);
    box(enc, 4.2, 2.6, 1.6, 0, 1.3, 0, 0xb9c3cb, { rough: 0.65, metal: 0.25 });
    box(enc, 4.3, 0.12, 1.7, 0, 2.66, 0, 0x8d979f, { rough: 0.6, metal: 0.3 });
    for (let i = 0; i < 6; i++) box(enc, 0.05, 2.3, 0.04, -1.9 + i * 0.76, 1.3, 0.81, 0x93a0a8, { rough: 0.6, metal: 0.3, cast: false });
    decal(enc, 1.2, 0.22, -1.2, 2.3, 0.81, signFace("ESS-4 · 3.2 MWh · NFPA 855", { bg: "#1b2410", accent: "#9fd84f", scale: 0.5 }));
    decal(enc, 0.9, 0.3, 1.2, 1.9, 0.81, signFace("DC BLEED-DOWN 5 MIN", { bg: "#3a2a06", accent: "#f2c14b", scale: 0.5 }));
    // Deflagration vents on the roof, gas panel beside the door.
    const vents = group(enc, 0.9, 2.66, 0);
    for (const dx of [-0.5, 0.5]) { const v = box(vents, 0.5, 0.06, 0.8, dx, 0.06, 0, 0x6d7780, { rough: 0.6, metal: 0.4 }); v.rotation.x = 0.12; }
    holoTag(vents, "deflagration vents", 0, 0.45, 0, { css: "#9fd84f", w: 0.36 });
    reg(hits, vents, "vent-check");
    const gasPanel = instrument(enc, 1.7, 1.5, 0.82, { idle: "CH4 --", color: 0xf2c14b, w: 0.16, d: 0.24 });
    holoTag(enc, "gas detection", 1.7, 1.78, 0.84, { css: "#9fd84f", w: 0.28 });
    reg(hits, gasPanel, "gas-panel");
    // Door: an open leaf on the left, and the hazard of opening it in alarm.
    const door = group(enc, -1.4, 0, 0.8);
    const leaf = box(door, 1.4, 2.3, 0.06, -0.7, 1.15, 0, 0xa6b1b9, { rough: 0.65, metal: 0.25 });
    leaf.rotation.y = -1.1;
    const doorHit = box(enc, 1.2, 1.6, 0.4, -1.3, 1.2, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(enc, "open it on alarm?", -1.3, 2.1, 0.9, { css: "#d2312b", w: 0.34 });
    reg(hits, doorHit, "open-door-on-alarm");
    // Racks inside: three columns of modules behind the open bay.
    const aisle = group(enc, -1.0, 0.1, 0.1);
    const racks = [];
    for (let r = 0; r < 3; r++) {
      const rack = group(aisle, r * 0.62, 0, 0);
      box(rack, 0.56, 2.1, 1.1, 0, 1.05, 0, 0x2b3138, { rough: 0.7, metal: 0.4 });
      const mods = [];
      for (let m = 0; m < 6; m++) {
        const mod = box(rack, 0.5, 0.26, 1.0, 0, 0.3 + m * 0.3, 0.06, m === 3 && r === 1 ? 0xd2745b : 0x4e5a63, { rough: 0.6, metal: 0.35 });
        const led = box(rack, 0.06, 0.03, 0.02, 0.2, 0.3 + m * 0.3, 0.57, m === 3 && r === 1 ? 0xd2312b : 0x9fd84f, { emissive: m === 3 && r === 1 ? 0xd2312b : 0x9fd84f, ei: 1.2, rough: 0.4, cast: false });
        mods.push({ mod, led });
      }
      const disc = box(rack, 0.14, 0.2, 0.08, 0, 2.0, 0.58, 0xf2c14b, { rough: 0.5, metal: 0.4 });
      holoTag(rack, `rack ${r + 1}`, 0, 2.25, 0.58, { css: "#9fd84f", w: 0.16 });
      reg(hits, disc, `dc-disconnect-${r + 1}`);
      racks.push({ rack, mods, disc });
    }
    const failed = racks[1].mods[3];
    const latch = box(racks[1].rack, 0.12, 0.08, 0.05, 0.16, 1.2, 0.6, 0xd2312b, { rough: 0.5, metal: 0.4 });
    holoTag(racks[1].rack, "failed module — latch", 0.16, 1.42, 0.62, { css: "#d2312b", w: 0.42 });
    reg(hits, latch, "module-latch");
    const jewellery = box(aisle, 0.4, 0.4, 0.4, 0.62, 1.3, 0.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(aisle, "reach in with a ring on?", 0.62, 1.75, 0.75, { css: "#d2312b", w: 0.44 });
    reg(hits, jewellery, "metal-jewellery");
    const groundCable = group(enc, 0.4, 0.15, 0.55);
    cyl(groundCable, 0.02, 0.02, 0.5, 0, 0.1, 0, 0x2f7d4a, { rough: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    box(groundCable, 0.1, 0.06, 0.08, 0.26, 0.1, 0, 0xb9bec4, { rough: 0.4, metal: 0.8 });
    holoTag(groundCable, "rack grounding cable", 0, 0.42, 0, { css: "#9fd84f", w: 0.42 });
    reg(hits, groundCable, "ground-rack");
    // Suppression bottle and its expired tag.
    const supp = group(enc, 1.85, 0.1, 0.2);
    cyl(supp, 0.13, 0.13, 0.8, 0, 0.4, 0, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 16 });
    cyl(supp, 0.05, 0.05, 0.1, 0, 0.85, 0, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 10 });
    const tag = box(supp, 0.09, 0.12, 0.01, 0.1, 0.62, 0.11, 0xffe9a8, { rough: 0.8 });
    holoTag(supp, "clean-agent suppression", 0, 1.05, 0, { css: "#9fd84f", w: 0.44 });
    reg(hits, tag, "suppression-tag");
    // AC side: interconnect cabinet with the breaker and lock, on the right.
    const acCab = group(g, 2.3, 0.1, -0.9, -0.5);
    box(acCab, 0.9, 1.9, 0.6, 0, 0.95, 0, 0x53606b, { rough: 0.6, metal: 0.4 });
    decal(acCab, 0.6, 0.18, 0, 1.6, 0.31, signFace("AC INTERCONNECTION", { bg: "#101820", accent: "#9fd84f", scale: 0.48 }));
    const acBreaker = box(acCab, 0.16, 0.24, 0.08, -0.18, 1.1, 0.31, 0xf2c14b, { rough: 0.5, metal: 0.35 });
    holoTag(acCab, "AC breaker", -0.18, 1.35, 0.33, { css: "#9fd84f", w: 0.24 });
    reg(hits, acBreaker, "ac-breaker");
    const acLock = lockTag(acCab, 0.14, 1.1, 0.32, {});
    holoTag(acCab, "lock and tag", 0.14, 1.35, 0.33, { css: "#9fd84f", w: 0.26 });
    reg(hits, acLock, "ac-lock");
    const dcEarly = box(acCab, 0.3, 0.3, 0.3, 0.42, 0.7, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(acCab, "pull DC first?", 0.42, 0.95, 0.35, { css: "#d2312b", w: 0.28 });
    reg(hits, dcEarly, "dc-before-ac");
    // Controller pedestal: stop command, bus readout, bleed timer.
    const ped = group(g, 1.2, 0.1, 0.9, -0.9);
    box(ped, 0.6, 1.1, 0.4, 0, 0.55, 0, 0x3a4550, { rough: 0.6, metal: 0.4 });
    const stopBtn = cyl(ped, 0.07, 0.07, 0.05, -0.15, 1.13, 0, 0xd2312b, { rough: 0.5, seg: 16 });
    holoTag(ped, "controller stop", -0.15, 1.3, 0.1, { css: "#9fd84f", w: 0.3 });
    reg(hits, stopBtn, "controller-stop");
    const busRead = instrument(ped, 0.14, 1.12, 0, { idle: "--- V", color: 0x9fd84f, w: 0.14, d: 0.22 });
    holoTag(ped, "DC bus", 0.14, 1.3, 0.1, { css: "#9fd84f", w: 0.18 });
    reg(hits, busRead, "bus-readout");
    const timer = instrument(ped, 0.0, 0.85, 0.22, { idle: "5:00", color: 0xf2c14b, w: 0.13, d: 0.2 });
    timer.rotation.x = -0.5;
    holoTag(ped, "bleed-down timer", 0.0, 0.62, 0.35, { css: "#9fd84f", w: 0.34 });
    reg(hits, timer, "bleed-timer");
    // Meter bench: meter, known source, insulated tools, thermal camera, cart.
    const bench = group(g, -2.3, 0.1, 1.2, 0.5);
    box(bench, 1.4, 0.8, 0.6, 0, 0.4, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const known = box(bench, 0.24, 0.16, 0.16, -0.42, 0.88, 0, 0x2b3138, { rough: 0.6 });
    box(bench, 0.05, 0.03, 0.03, -0.42, 0.97, 0.06, 0x9fd84f, { emissive: 0x9fd84f, ei: 1.2, rough: 0.4, cast: false });
    holoTag(bench, "known live source", -0.42, 1.1, 0.05, { css: "#9fd84f", w: 0.34 });
    reg(hits, known, "meter-known-live");
    const knownAgain = box(bench, 0.24, 0.16, 0.16, -0.42, 0.88, -0.26, 0x2b3138, { rough: 0.6 });
    holoTag(bench, "prove it again", -0.42, 1.1, -0.34, { css: "#9fd84f", w: 0.3 });
    reg(hits, knownAgain, "meter-known-again");
    const meter = instrument(bench, -0.05, 0.84, 0, { idle: "---.- V", color: 0x9fd84f, w: 0.13, d: 0.2 });
    holoTag(bench, "meter on the bus", -0.05, 1.04, 0.05, { css: "#9fd84f", w: 0.32 });
    reg(hits, meter, "bus-meter");
    const tools = box(bench, 0.34, 0.12, 0.2, 0.38, 0.86, 0.1, 0xf2a23b, { rough: 0.7 });
    holoTag(bench, "insulated tools 1000 V", 0.38, 1.04, 0.1, { css: "#9fd84f", w: 0.44 });
    reg(hits, tools, "insulated-tools");
    const thermal = instrument(bench, 0.46, 0.86, -0.2, { idle: "-- °C", color: 0x9fd84f, w: 0.12, d: 0.18 });
    holoTag(bench, "thermal camera", 0.46, 1.06, -0.2, { css: "#9fd84f", w: 0.3 });
    reg(hits, thermal, "thermal-camera");
    const cart = group(g, -1.9, 0.1, -0.2, 0.2);
    box(cart, 1.1, 0.1, 0.7, 0, 0.55, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    for (const [x, z] of [[-0.45, -0.28], [0.45, -0.28], [-0.45, 0.28], [0.45, 0.28]]) cyl(cart, 0.07, 0.07, 0.05, x, 0.07, z, 0x1a1e23, { rough: 0.9, seg: 12 }).rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) cyl(cart, 0.025, 0.025, 0.5, sx * 0.5, 0.3, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 });
    const cartDeck = box(cart, 1.0, 0.04, 0.6, 0, 0.62, 0, 0xffffff, { rough: 0.5 });
    cartDeck.visible = false; hits["cart-deck"] = cartDeck;
    holoTag(cart, "module transfer cart", 0, 0.85, 0, { css: "#9fd84f", w: 0.42 });
    // Water extinguisher (the wrong answer), work order, barriers, technician.
    const ext = group(g, 2.6, 0.1, 1.5);
    cyl(ext, 0.09, 0.09, 0.45, 0, 0.23, 0, 0x2b6fd8, { rough: 0.5, metal: 0.3, seg: 14 });
    holoTag(ext, "water extinguisher", 0, 0.62, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, ext, "water-on-cells");
    const board = group(g, -0.2, 0, 2.2, 0.15);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#151c0b"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#9fd84f"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e8f6cf"; ctx.fillText("WORK ORDER — ESS-4 RACK 2", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f2fbe4";
      ["Module 2-04 fault: cell imbalance, high ΔT", "Read gas panel and vents BEFORE the door", "Stop from controller; AC breaker then lock", "DC racks 1-2-3 in order, never under load", "Bleed-down: 5 min, then live-dead-live", "Ground rack; 1000 V insulated tools only", "No rings or watches in the aisle"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.1)));
    }, { accent: BY_ACCENT });
    reg(hits, board, "work-order");
    barrierPanel(g, 2.0, 2.3, { ry: 0.2 });
    for (const [x, z] of [[-2.8, -0.6], [2.8, -0.6]]) cone(g, x, z);
    const tech = standingFigure(g, 0.09, 1.44, { ry: 3.0, cloth: 0x5a7a2b });
    holoTag(tech, "storage technician", 0, 1.9, 0, { css: "#9fd84f", w: 0.34 });
    const smoke = particles(g, 40, 0xd8d8d8, { size: 0.03, life: 1.2, additive: false, opacity: 0.22 });

    let alarm = true, opened = [false, false, false], out = false, reAlarm = false, hotSpike = false;
    const hotModule = racks[0].mods[2];
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.8, 1.2, -1.0),
      onStep() {},
      // The gas panel climbing back into alarm mid-bleed and a neighbouring
      // module heating up during the swap are both things visible from where
      // the technician is standing.
      onInterrupt(it) {
        if (it.id === "residual-offgas") {
          reAlarm = true; smoke.visible = true;
          repaint(gasPanel.userData.screen, signFace("CH4 1.8%", { bg: "#2a0d0d", accent: "#d2312b", fg: "#ffd9d6", scale: 0.55 }));
          gasPanel.userData.screen.material.emissiveIntensity = 1.6;
        }
        if (it.id === "neighbour-heats-up") {
          hotSpike = true;
          repaint(thermal.userData.screen, signFace("61 °C ▲", { bg: "#2a0d0d", accent: "#d2312b", fg: "#f2fbe4", scale: 0.6 }));
          hotModule.led.material.emissiveIntensity = 2.6;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "residual-offgas") {
          reAlarm = false; smoke.visible = false;
          repaint(gasPanel.userData.screen, signFace("CH4 CLEAR", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.58 }));
          gasPanel.userData.screen.material.emissiveIntensity = 0.85;
        }
        if (it.id === "neighbour-heats-up") {
          hotSpike = false;
          repaint(thermal.userData.screen, signFace("-- °C", { bg: "#151c0b", accent: "#9fd84f", fg: "#f2fbe4", scale: 0.62 }));
          hotModule.led.material.emissiveIntensity = 1.0;
        }
      },
      onStepComplete(step) {
        if (step.id === "gas") { alarm = false; repaint(gasPanel.userData.screen, signFace("CH4 CLEAR", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.58 })); }
        if (step.id === "stop") repaint(busRead.userData.screen, signFace("820 V", { bg: "#151c0b", accent: "#f2ae14", fg: "#f2fbe4", scale: 0.62 }));
        if (step.id === "dc") opened = [true, true, true];
        if (step.id === "bleed") repaint(busRead.userData.screen, signFace("36 V", { bg: "#151c0b", accent: "#f2ae14", fg: "#f2fbe4", scale: 0.62 }));
        if (step.id === "voltage") repaint(busRead.userData.screen, signFace("4 V", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.62 }));
        if (step.id === "swap") {
          out = true;
          failed.mod.parent.remove(failed.mod); cart.add(failed.mod);
          failed.mod.position.set(0, 0.7, 0); failed.mod.rotation.set(0, 0, 0);
          failed.led.visible = false;
        }
        if (step.id === "walk") tag.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (alarm || reAlarm) {
          gasPanel.userData.screen && repaint(gasPanel.userData.screen, signFace(Math.sin(t * 4) > 0 ? "CH4 ALARM" : "CH4 1.8%", { bg: "#2a0d0d", accent: "#d2312b", fg: "#ffd9d6", scale: 0.55 }));
          smoke.visible = true; smoke.userData.step(dt, new THREE.Vector3(0.6, 2.7, -1.5), 0.25, 0.25, 0.15);
        } else if (smoke.visible) smoke.visible = false;
        for (let r = 0; r < racks.length; r++) {
          if (step?.id === "dc" && session.sequence.includes(`dc-disconnect-${r + 1}`)) opened[r] = true;
          racks[r].disc.rotation.z = opened[r] ? 0.6 : 0;
          for (const m of racks[r].mods) if (m.led.visible) m.led.material.emissiveIntensity = opened[r] ? 0.15 : 1.0 + Math.sin(t * 1.4 + r) * 0.3;
        }
        if (hotSpike) hotModule.led.material.emissiveIntensity = 2.6;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "voltage") repaint(busRead.userData.screen, signFace(`${Math.round(gg.t * 1000)} V`, { bg: "#151c0b", accent: gg.t <= 0.14 ? "#59c97b" : "#f2ae14", fg: "#f2fbe4", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "thermal") repaint(thermal.userData.screen, signFace(`${Math.round(18 + gg.t * 80)} °C`, { bg: "#151c0b", accent: gg.t <= 0.36 ? "#59c97b" : "#f2ae14", fg: "#f2fbe4", scale: 0.62 }));
        if (step?.id === "bleed" && session.holding) repaint(timer.userData.screen, signFace(`${Math.max(0, 5 - Math.floor(session.holdFor)).toString()}:${String(Math.max(0, 59 - Math.floor((session.holdFor % 1) * 60))).padStart(2, "0")}`, { bg: "#3a2a06", accent: "#f2c14b", fg: "#fff0d6", scale: 0.62 }));
        if (out) failed.mod.position.y = 0.7;
      },
    };
  },
};
