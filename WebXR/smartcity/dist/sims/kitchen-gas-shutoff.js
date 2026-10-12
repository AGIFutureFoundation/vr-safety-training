import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, valveWheel, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Kitchen Gas Shutoff VR — its own gamified system: Line Secured.
// A gas odor on the cook line in a working commercial kitchen under UNITE
// HERE Local 2: no spark used to hunt for the source, every appliance shut
// down, the kitchen's own emergency gas valve closed, the room ventilated
// and swept at floor level where the gas actually pools, the utility called,
// and a pilot-by-pilot relight only once the line is proven clear. NFPA 54
// (also published jointly as ANSI Z223.1) and the California Fire Code are
// the spine; Cal/OSHA covers the crew standing in the room while it happens.

const KGS_ORANGE = 0xe2703c;

export const SIM_KITCHEN_GAS_SHUTOFF = {
  id: "kitchen-gas-shutoff",
  index: "106",
  domain: "Culinary",
  trade: "Kitchen shift lead — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  weather: "clear",
  certification: "UNITE HERE Local 2 kitchen safety training; NFPA 54 / ANSI Z223.1 the National Fuel Gas Code; the California Fire Code; Cal/OSHA General Industry Safety Orders on emergency action and hazardous atmospheres; the gas utility's own reported-odor procedure",
  name: "Kitchen Gas Shutoff",
  title: simTitle("Kitchen Gas Shutoff"),
  tagline: "A gas smell on the line: no spark used to search, every appliance and the emergency valve closed, the room swept at floor level, and a pilot-by-pilot relight",
  accent: KGS_ORANGE,
  accentCss: "#e2703c",
  parSeconds: 275,
  footprint: 2.3,
  badge: { id: "line-secured", name: "Line Secured", note: "A clean shutdown, a real floor-level sweep, and a relight with nothing skipped" },

  game: system({
    name: "Line Secured",
    currency: "GAS",
    ranks: ["Prep Cook", "Line Cook", "Shift Lead", "Kitchen Manager", "Line Secured"],
    badges: [
      { id: "no-spark", name: "No Spark", note: "Never reached for an ignition source while searching", test: AWARD.safe },
      { id: "floor-level", name: "Floor Level", note: "Held every detector reading clean, no corrections", test: AWARD.clean },
      { id: "sequenced-relight", name: "Sequenced Relight", note: "Relit every pilot in the correct order, every time", test: AWARD.stepClean("relight") },
    ],
    challenges: [
      { id: "cleared-fast", name: "Cleared Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "steady-sweep", name: "Steady Sweep", note: "Held the floor sweep without a single dropout", test: AWARD.unbroken },
      { id: "secured-streak", name: "Secured Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "spark-switch": "That is a wall light switch, and you are reaching for it to see better while you search for a gas smell. Flipping any switch — lights, an exhaust fan control, anything electrical — can throw a spark at the exact contact point, and a spark is the one thing an accumulating gas-air mixture is waiting for. Use the flashlight, never a switch, until the room is confirmed clear.",
    "phone-call-onsite": "You are standing right where the smell is strongest, phone out, calling it in from here. A cell phone or a radio keying up can spark at the antenna contact the same way a light switch can — the call happens once you have backed off toward clean air, not from the middle of a room you suspect is accumulating gas.",
    "reignite-early": "That igniter button is for an appliance nobody has cleared yet. Every pilot on this line gets checked closed and the room gets confirmed clear before anything is lit again — energizing an igniter into a room that still has gas in it is providing the ignition source the whole shutdown was built to deny it.",
    "walkin-door-open": "The walk-in door is propped open. Gas that pools at floor level drifts toward the lowest, most enclosed space in the room, and an open walk-in with its own compressor and its own electrical contacts inside is exactly the enclosed ignition source you do not want that gas finding. Shut it and keep it shut until the sweep says the floor is clear.",
  },

  lateNotes: {
    "gas-shutoff-valve": "The main valve gets checked twice in this job: once to close it before anything else, and once again if a floor reading anywhere in the room comes back questionable.",
    "lighter": "The lighter only matters as something to take out of a cook's hand before they use it — it is never a tool for finding or fixing this leak.",
  },

  steps: [
    {
      id: "odor-call", kind: "select", target: "radio",
      title: "Take the report",
      cue: "Acknowledge the report of a gas smell on the line.",
      why: "A gas odor report is the start of a procedure, not a maybe — natural gas is odorized specifically so it is noticed well below its flammable range, and treating the first report as the trigger rather than waiting to smell it yourself is what keeps the response ahead of the leak instead of behind it. OSHA's emergency-action-plan rule at 29 CFR 1910.38 expects exactly this: a named response that starts the moment the condition is reported, not once somebody has confirmed it personally.",
    },
    {
      id: "spark-check", kind: "find", noHint: true,
      targets: ["lighter", "piezo-igniter"],
      itemNames: { lighter: "the cook's lighter", "piezo-igniter": "the loose piezo igniter" },
      itemNotes: {
        lighter: "Set aside before anyone uses it to see under the counter — an open flame anywhere near an accumulating leak is the ignition source the whole response is built around denying.",
        "piezo-igniter": "A hand-held piezo sparker used to light pilots. It stays off the line the same as the lighter until the room is confirmed clear.",
      },
      decoyNotes: { flashlight: "That's the flashlight — the only light source that belongs in your hand right now. Leave it." },
      title: "Clear the ignition sources before searching",
      cue: "Find and set aside anything on the line that can spark or flame before you look any further.",
      why: "The instinct on a gas call is to go looking for the leak, and the discipline is to make the room incapable of igniting before that search even starts — NFPA 54 and every utility's own odor procedure lead with the same rule: nothing that sparks or flames touches this room until it is proven clear.",
    },
    {
      id: "clear-exit", kind: "drag", target: "cart-obstruction",
      title: "Clear the exit path",
      cue: "Move the prep cart away from the back door so the evacuation route is open.",
      drag: { to: "cart-storage", radius: 0.55, missNote: "Not clear of the doorway yet — move the cart the rest of the way into the storage bay." },
      why: "Ventilating this room means the back door is about to become the main airflow path and, if this goes wrong, the exit everyone uses — a cart parked across it costs seconds neither the ventilation plan nor an evacuation can spare.",
    },
    {
      id: "appliance-shutdown", kind: "sequence",
      targets: ["range-valve", "griddle-valve", "fryer-valve"],
      itemNames: { "range-valve": "range gas valve", "griddle-valve": "griddle gas valve", "fryer-valve": "fryer gas valve" },
      title: "Shut down every gas appliance on the line",
      cue: "Close the range, then the griddle, then the fryer, in that order.",
      why: "Every appliance on the line gets its own valve closed, not just the one that happens to be lit — a pilot you cannot see burning is still an open path for gas, and NFPA 54 treats an unconfirmed appliance exactly like a confirmed leak until somebody has actually closed its valve by hand.",
      outOfOrderNote: "Range, then griddle, then fryer — take them down the line in one direction so none gets skipped under pressure.",
    },
    {
      id: "manual-shutoff", kind: "turn", target: "gas-shutoff-valve",
      title: "Close the kitchen's emergency gas shutoff",
      cue: "Turn the emergency shutoff a quarter turn to fully closed.",
      turn: { turns: 0.25, axis: "z", label: "KITCHEN EMERGENCY GAS SHUTOFF" },
      why: "This one valve — or its interlocked solenoid — is upstream of every appliance you just shut down individually, and closing it is what turns four separate off switches into one confirmed isolation. A quarter-turn ball valve is either fully open or fully closed; there is no partial position that means anything.",
    },
    {
      id: "ventilate", kind: "sequence",
      targets: ["hood-fan-switch", "back-door"],
      itemNames: { "hood-fan-switch": "hood exhaust fan", "back-door": "back door" },
      title: "Ventilate the kitchen",
      cue: "Run the hood's exhaust fan, then prop the back door open.",
      why: "The hood fan and an open door move air in the same direction for the same reason: gas that has nowhere to go stays exactly where it settled. Running the fan first gives the room a draw before the door adds a path for outside air to replace what is being pulled out, rather than just stirring the room in place.",
      outOfOrderNote: "Fan first, then the door — a door open with no draw running just trades one still pocket of air for two.",
    },
    {
      id: "detector-baseline", kind: "gauge", target: "detector",
      title: "Read the detector at floor level on the line",
      cue: "Hold the detector at floor level along the cook line and commit once the reading clears.",
      gauge: {
        label: "GAS DETECTOR — %LEL AT FLOOR", speed: 0.55, green: [0.0, 0.18],
        readout: (t) => `${Math.round(t * 40)}% LEL`,
        missNote: "Still reading. Give the ventilation more time and sweep again before treating any part of this room as clear.",
      },
      why: "Natural gas is lighter than air but propane and the heavier fractions in a leak are not, and either way the detector is held at floor level because that is where the last of a dispersing leak actually sits — a reading taken at chest height can call a room clear while the floor along the baseboards still is not.",
    },
    {
      id: "call-utility", kind: "select", target: "phone-outside",
      title: "Call the gas utility from clear air",
      cue: "Step outside to clear air, then call the gas utility and the maintenance engineer.",
      why: "The utility can shut off gas at the meter and check the service line for a leak upstream of anything in this kitchen, and the maintenance engineer knows this building's own piping — neither of those calls is one a kitchen crew can substitute for, and both are made from outside the space that was just evacuated, not from inside it.",
    },
    {
      id: "stand-clear", kind: "hold", target: "back-door", seconds: 6,
      title: "Hold clear while the room ventilates",
      cue: "Stay outside the kitchen while the fan and the open door do their work.",
      why: "Ventilation takes real time to actually clear a room, and standing just inside the doorway to keep an eye on things puts you back in the space the whole procedure just evacuated — the hold is the discipline of actually waiting it out from clear air instead of checking on it.",
      holdBreakNote: "You went back in before the wait was over. Ventilation on a clock you cut short is ventilation you cannot actually vouch for.",
    },
    {
      id: "walkin-sweep", kind: "track", target: "detector", seconds: 5,
      title: "Sweep the detector along the floor toward the walk-in",
      cue: "Walk the detector low along the floor toward the walk-in, keeping the reading inside the clear band.",
      track: {
        start: 0.15, green: [0.0, 0.22], rise: 0.4, fall: 0.5, drift: 0.14, label: "FLOOR SWEEP — %LEL",
        readout: (v) => (v > 0.22 ? "rising — gas pooling ahead" : "reading clear"),
      },
      holdBreakNote: "Sweep broke off before the walk-in. Heavier-than-air gas pools exactly in corners and against equipment like this — an incomplete sweep is a floor you have not actually checked.",
      why: "The walk-in sits low, cold and enclosed against the back wall, and every one of those is a reason a heavier fraction of an escaping gas would settle there before it settles anywhere else in an open kitchen — the sweep only means something if it actually reaches the corner it is checking.",
    },
    {
      id: "valve-walk", kind: "find", noHint: true,
      targets: ["kettle-valve-cracked"],
      itemNames: { "kettle-valve-cracked": "the soup kettle's valve, not fully closed" },
      itemNotes: { "kettle-valve-cracked": "This handle sits a few degrees off its seat — closed enough to look right from across the kitchen, open enough to still be passing gas. It gets closed the rest of the way and tagged before this line goes anywhere near a relight." },
      decoyNotes: {
        "range-valve": "That valve is already fully closed from the shutdown — leave it.",
        "griddle-valve": "That valve is already fully closed from the shutdown — leave it.",
      },
      title: "Walk every appliance before considering restoration",
      cue: "One valve on this line is not actually fully closed. Find it.",
      why: "A valve resting a few degrees off its seat looks closed from a glance and is not closed at all, and the only way this line goes back into service honestly is checking every single valve by hand rather than trusting the shutdown you did from memory twenty minutes ago.",
    },
    {
      id: "relight", kind: "sequence",
      targets: ["range-pilot", "griddle-pilot", "fryer-pilot"],
      itemNames: { "range-pilot": "range pilot", "griddle-pilot": "griddle pilot", "fryer-pilot": "fryer pilot" },
      title: "Relight the pilots with the hood running",
      cue: "Relight range, then griddle, then fryer, one at a time, with the hood fan already running.",
      why: "Relighting happens one appliance at a time so that any pilot that will not catch is caught immediately, on its own, rather than discovered later as an unlit burner quietly passing gas into a kitchen that thinks it is back in service — and the hood stays on through all of it, the same as it does through every hour the line is actually cooking.",
      outOfOrderNote: "Range, then griddle, then fryer — the same order the line was shut down in, so nothing gets missed.",
    },
    {
      id: "log-restore", kind: "select", target: "logbook",
      title: "Sign the restoration log",
      cue: "Record the cracked kettle valve and sign the line back in service.",
      why: "The kettle valve that was not fully seated does not fix itself by being closed once — the log is what gets it onto a work order before the next shift lead has any reason to think about it, and it is the record that says exactly what was found and exactly what was done about it.",
    },
  ],

  interrupts: [
    {
      id: "lighter-relight",
      kind: "Unsafe relight attempt",
      after: "stand-clear", delay: 3, seconds: 12,
      alert: "A cook has come back in from break and is flicking a lighter at the range, trying to relight a pilot before anyone told them the line was cleared.",
      cue: "Stop that lighter now.",
      target: "lighter",
      why: "Nobody outside this shutdown knows the room has not been swept yet, and a cook who only knows the pilot is out will reach for the fastest fix they have — getting the lighter out of their hand is the only thing that matters in this moment, before it ever gets near the burner.",
      missNote: "The lighter got struck at the range with the ventilation sweep still incomplete. If any gas was still sitting along that floor, this is the exact spark it was waiting for.",
      wrongNote: "The lighter, not the valve or the detector. Somebody is about to strike an open flame in a room you have not cleared yet — that takes priority over everything else on this line.",
    },
    {
      id: "walkin-lel-spike",
      kind: "Floor-level gas pooling",
      after: "walkin-sweep", delay: 2, seconds: 12,
      alert: "The detector spikes hard as it reaches the walk-in — a real floor-level reading, well above the clear band, pooled against the base of the cold room.",
      cue: "That reading means your isolation is not as complete as you thought. Go back and recheck it.",
      target: "gas-shutoff-valve",
      why: "A live reading down here, after the main valve was supposedly already closed, means something upstream of that valve is still passing gas — going back to physically recheck the shutoff is what tells a real leak apart from a slow pocket that was always going to take longer to clear.",
      missNote: "The spike at the walk-in got noted and nothing else happened. A floor-level reading that high after the valve was supposedly closed is the isolation itself in question, not a detail for the log.",
      wrongNote: "Back to the emergency shutoff. A reading this high this late means the valve needs to be confirmed closed again, by hand, before anything else on this line matters.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, KGS_ORANGE);

    const SS = 0xb4bcc3, SS_DARK = 0x767e86;

    // ------------------------------------------------------------- the range
    const range = group(g, -1.3, 0, -3.3);
    box(range, 1.6, 0.86, 0.7, 0, 0.43, 0, SS_DARK, { rough: 0.35, metal: 0.75 });
    box(range, 1.6, 0.06, 0.74, 0, 0.87, 0, 0x2f3439, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 4; i++) {
      const bx = -0.55 + (i % 2) * 0.55, bz = -0.15 + Math.floor(i / 2) * 0.3;
      cyl(range, 0.09, 0.11, 0.03, bx, 0.95, bz, 0x1b1e22, { rough: 0.75, seg: 16 });
    }
    const rangeValve = valveWheel(range, -0.55, 0.6, 0.4, { r: 0.06, color: 0xf2c14b, body: 0x2f6f4a });
    reg(hits, rangeValve, "range-valve");
    const rangePilot = group(range, -0.55, 0.9, -0.2);
    cyl(rangePilot, 0.008, 0.008, 0.02, 0, 0, 0, 0xc9a227, { rough: 0.4, metal: 0.6, seg: 8 });
    const rangeFlame = ball(rangePilot, 0.012, 0, 0.02, 0, 0x4aa3ff, { emissive: 0x2f7fff, ei: 2.2, seg: 8, seg2: 6 });
    reg(hits, rangePilot, "range-pilot");
    holoTag(range, "Range", 0, 1.05, 0, { css: KGS_ORANGE, w: 0.24 });

    // Griddle to the right of the range.
    const griddle = group(g, 0.1, 0, -3.3);
    box(griddle, 0.9, 0.86, 0.7, 0, 0.43, 0, SS_DARK, { rough: 0.35, metal: 0.75 });
    box(griddle, 0.86, 0.05, 0.66, 0, 0.87, 0, 0x33383d, { rough: 0.42, metal: 0.6 });
    const griddleValve = valveWheel(griddle, -0.3, 0.6, 0.4, { r: 0.06, color: 0xf2c14b, body: 0x2f6f4a });
    reg(hits, griddleValve, "griddle-valve");
    const griddlePilot = group(griddle, 0.25, 0.9, -0.2);
    cyl(griddlePilot, 0.008, 0.008, 0.02, 0, 0, 0, 0xc9a227, { rough: 0.4, metal: 0.6, seg: 8 });
    const griddleFlame = ball(griddlePilot, 0.012, 0, 0.02, 0, 0x4aa3ff, { emissive: 0x2f7fff, ei: 2.2, seg: 8, seg2: 6 });
    reg(hits, griddlePilot, "griddle-pilot");
    holoTag(griddle, "Griddle", 0, 1.05, 0, { css: KGS_ORANGE, w: 0.3 });

    // Fryer to the right of the griddle.
    const fryer = group(g, 1.1, 0, -3.3);
    box(fryer, 0.62, 0.86, 0.7, 0, 0.43, 0, SS_DARK, { rough: 0.35, metal: 0.7 });
    const fryerValve = valveWheel(fryer, -0.2, 0.6, 0.4, { r: 0.06, color: 0xf2c14b, body: 0x2f6f4a });
    reg(hits, fryerValve, "fryer-valve");
    const fryerPilot = group(fryer, 0.15, 0.85, -0.2);
    cyl(fryerPilot, 0.008, 0.008, 0.02, 0, 0, 0, 0xc9a227, { rough: 0.4, metal: 0.6, seg: 8 });
    const fryerFlame = ball(fryerPilot, 0.012, 0, 0.02, 0, 0x4aa3ff, { emissive: 0x2f7fff, ei: 2.2, seg: 8, seg2: 6 });
    reg(hits, fryerPilot, "fryer-pilot");
    holoTag(fryer, "Fryer", 0, 1.0, 0, { css: KGS_ORANGE, w: 0.24 });
    // The igniter button beside the fryer — the reignite-early hazard.
    const igniterButton = group(fryer, -0.2, 0.75, 0.36);
    box(igniterButton, 0.04, 0.03, 0.02, 0, 0, 0, 0xd8232a, { rough: 0.45 });
    reg(hits, igniterButton, "reignite-early");
    holoTag(igniterButton, "Igniter", 0, 0.06, 0, { css: "#f0645b", w: 0.28 });

    // Soup kettle, off to the side — the extra appliance with the cracked valve.
    const kettle = group(g, 1.9, 0, -2.4, -0.3);
    cyl(kettle, 0.28, 0.3, 0.55, 0, 0.55, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 20 });
    const kettleValve = valveWheel(kettle, 0.3, 0.5, 0, { r: 0.055, color: 0xf2c14b, body: 0x2f6f4a });
    kettleValve.userData.wheel.rotation.z = 0.25; // resting a few degrees off its seat
    reg(hits, kettleValve, "kettle-valve-cracked");
    holoTag(kettle, "Soup kettle", 0, 0.95, 0, { css: KGS_ORANGE, w: 0.32 });

    // ------------------------------------------------------------- the hood
    const hood = group(g, -0.4, 0, -3.6);
    box(hood, 2.8, 0.4, 1.0, 0, 2.3, 0, SS, { rough: 0.3, metal: 0.8 });
    cyl(hood, 0.22, 0.22, 0.4, 0.9, 2.8, 0, SS, { rough: 0.3, metal: 0.8, seg: 16 });
    const hoodFan = group(hood, 0.9, 2.6, 0);
    for (let i = 0; i < 5; i++) {
      const blade = box(hoodFan, 0.17, 0.007, 0.05, 0, 0, 0, 0x6f767d, { rough: 0.4, metal: 0.7, cast: false });
      blade.rotation.y = (i * Math.PI * 2) / 5; blade.rotation.z = 0.4;
    }
    reg(hits, hoodFan, "hood-fan-switch");
    holoTag(hoodFan, "Hood exhaust fan", 0, 0.35, 0, { css: KGS_ORANGE, w: 0.4 });

    // ------------------------------------------------------------- gas shutoff
    const gasValve = valveWheel(g, -2.4, 0.6, -2.2, { r: 0.09, color: 0xd8232a, body: 0x2f6f4a, ry: 0.5 });
    holoTag(gasValve, "Emergency gas shutoff", 0, 0.28, 0, { css: KGS_ORANGE, w: 0.44 });
    reg(hits, gasValve, "gas-shutoff-valve");

    // ------------------------------------------------------- ignition hazards
    const lightSwitch = group(g, -3.3, 0, -1.0);
    box(lightSwitch, 0.08, 0.12, 0.03, 0, 1.3, 0, 0xdfe4e8, { rough: 0.4 });
    box(lightSwitch, 0.02, 0.05, 0.01, 0, 1.32, 0.018, 0x2b2f34, { rough: 0.5 });
    reg(hits, lightSwitch, "spark-switch");
    holoTag(lightSwitch, "Light switch", 0, 1.45, 0, { css: "#f0645b", w: 0.3 });

    const lighter = group(g, -1.7, 0, -2.5, 0.4);
    box(lighter, 0.02, 0.06, 0.02, 0, 0.55, 0, 0xd8232a, { rough: 0.4 });
    reg(hits, lighter, "lighter");
    holoTag(lighter, "Lighter", 0, 0.62, 0, { css: "#f0645b", w: 0.24 });

    const piezo = group(g, -1.3, 0, -2.1, 0.3);
    cyl(piezo, 0.012, 0.012, 0.14, 0, 0.5, 0, 0x2b2f34, { rough: 0.6, seg: 8 });
    reg(hits, piezo, "piezo-igniter");
    holoTag(piezo, "Piezo igniter", 0, 0.6, 0, { css: "#f0645b", w: 0.34 });

    const flashlight = group(g, -1.0, 0, -1.8, -0.3);
    cyl(flashlight, 0.02, 0.022, 0.16, 0, 0.5, 0, 0x2f3439, { rough: 0.5, metal: 0.5, seg: 10 });
    reg(hits, flashlight, "flashlight");
    holoTag(flashlight, "Flashlight", 0, 0.62, 0, { css: "#59c97b", w: 0.32 });

    const phoneOnsite = group(g, -1.9, 0, -1.2, 0.2);
    box(phoneOnsite, 0.05, 0.1, 0.01, 0, 0.55, 0, 0x1b1e22, { rough: 0.4, metal: 0.3 });
    reg(hits, phoneOnsite, "phone-call-onsite");
    holoTag(phoneOnsite, "Radio — not here", 0, 0.64, 0, { css: "#f0645b", w: 0.4 });

    // ------------------------------------------------------------- walk-in
    const walkIn = group(g, 2.6, 0, 1.0, -0.4);
    box(walkIn, 1.4, 2.2, 1.2, 0, 1.1, 0, 0xdfe4e8, { rough: 0.5, metal: 0.2 });
    const walkInDoor = group(walkIn, -0.72, 1.0, 0);
    box(walkInDoor, 0.08, 1.9, 1.1, 0, 0, 0, 0x9aa1a8, { rough: 0.4, metal: 0.4 });
    reg(hits, walkInDoor, "walkin-door-open");
    decal(walkIn, 0.6, 0.14, 0, 2.0, 0.62, signFace("WALK-IN", { bg: "#0d2430", accent: "#4fa3ff", scale: 0.5 }));
    holoTag(walkIn, "Walk-in cooler", 0, 2.35, 0, { css: KGS_ORANGE, w: 0.4 });
    const walkInPool = particles(walkIn, 30, 0xc9d6df, { size: 0.03, life: 0.8, additive: false, opacity: 0.28 });

    // Back door, set off to the side against the wall rather than in the
    // direct sightline from spawn — a door standing in the walking path is a
    // door blocking the whole scene, not a door in a kitchen.
    const backDoor = group(g, -3.2, 0, 1.9, 0.5);
    box(backDoor, 1.0, 2.1, 0.08, 0, 1.05, 0, 0x8b6a42, { rough: 0.8 });
    decal(backDoor, 0.7, 0.14, 0, 2.0, 0.05, signFace("BACK DOOR", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.45 }));
    reg(hits, backDoor, "back-door");

    // Cart obstruction in front of the exit, and its storage spot.
    const cart = group(g, -2.6, 0, 0.8, 0.3);
    box(cart, 0.5, 0.5, 0.4, 0, 0.28, 0, 0x8d959d, { rough: 0.5, metal: 0.5 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(cart, 0.04, 0.04, 0.03, sx * 0.2, 0.04, sz * 0.15, 0x1b1e22, { rough: 0.7, seg: 10 }).rotation.x = Math.PI / 2;
    reg(hits, cart, "cart-obstruction");
    const cartStorage = group(g, -1.4, 0, 0.4);
    box(cartStorage, 0.6, 0.02, 0.5, 0, 0.01, 0, 0x2b2f34, { rough: 0.7, cast: false });
    reg(hits, cartStorage, "cart-storage");

    // ------------------------------------------------------------- detector
    const detector = instrument(g, 0.3, 0.85, -1.2, { ry: 0, idle: "-- % LEL", color: KGS_ORANGE, w: 0.13, d: 0.2 });
    holoTag(detector, "Gas detector", 0, 0.15, 0, { css: KGS_ORANGE, w: 0.32 });
    reg(hits, detector, "detector");

    const radio = group(g, 1.8, 0, -0.6, -0.4);
    box(radio, 0.1, 0.16, 0.05, 0, 0.75, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    reg(hits, radio, "radio");
    holoTag(radio, "Radio call", 0, 0.86, 0, { css: KGS_ORANGE, w: 0.3 });

    const phoneOutside = group(g, 3.4, 0, 2.3, -0.5);
    box(phoneOutside, 0.08, 0.16, 0.03, 0, 0.75, 0, 0x1b1e22, { rough: 0.4, metal: 0.4 });
    reg(hits, phoneOutside, "phone-outside");
    holoTag(phoneOutside, "Utility line — outside", 0, 0.88, 0, { css: KGS_ORANGE, w: 0.44 });

    // ------------------------------------------------------------- paperwork
    const chest = toolChest(g, 2.4, 1.6, { ry: -0.7, color: KGS_ORANGE });
    const log = holoPanel(g, 0.56, 0.4, -2.4, 1.6, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,12,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e2703c"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e0b89a";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("GAS ODOR RESPONSE LOG", w * 0.06, h * 0.14);
      ctx.fillStyle = "#ffe4d4";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("LINE 1 — RESTORED", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#e0b89a";
      ["Utility notified", "Emergency valve: closed then reopened", "Floor sweep: clear",
       "Defect: kettle valve not seated", "Relit range, griddle, fryer in order"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.48 + i * 0.11)));
    }, { ry: 0.6, accent: KGS_ORANGE });
    reg(hits, log, "logbook");

    // A second cook, clear of the line and every control.
    const crew = standingFigure(g, 1.7, 2.05, { ry: 2.2, cloth: 0xdfe6ec, trousers: 0x2b3138 });

    const pilots = [rangeFlame, griddleFlame, fryerFlame];
    let gasClosed = false, ventilating = false, sweepingWalkIn = false;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(-0.4, 1.2, -3.3),

      onStep(step) {
        if (step.id === "walkin-sweep") sweepingWalkIn = true;
      },

      onStepComplete(step) {
        if (step.id === "appliance-shutdown") pilots.forEach((p) => { p.visible = false; });
        if (step.id === "manual-shutoff") { gasClosed = true; gasValve.userData.wheel.rotation.z += 1.1; }
        if (step.id === "ventilate") ventilating = true;
        if (step.id === "walkin-sweep") sweepingWalkIn = false;
        if (step.id === "valve-walk") kettleValve.userData.wheel.rotation.z = 0;
        if (step.id === "relight") pilots.forEach((p) => { p.visible = true; });
      },

      onInterrupt(it) {
        if (it.id === "lighter-relight") lighter.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8 });
        if (it.id === "walkin-lel-spike") walkInPool.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "lighter-relight") lighter.children[0].material = mat(0xd8232a, { rough: 0.4 });
        if (it.id === "walkin-lel-spike") { walkInPool.visible = false; gasValve.userData.wheel.rotation.z += 0.3; }
      },

      onHazard(hitId) {
        if (hitId === "walkin-door-open") walkInDoor.position.x -= 0.3;
      },

      animate(t, dt, session) {
        void gasClosed;
        if (ventilating) hoodFan.rotation.y += dt * 5;
        pilots.forEach((p, i) => { if (p.visible) p.material.emissiveIntensity = 2.0 + Math.sin(t * 12 + i) * 0.5; });
        if (sweepingWalkIn) { walkInPool.visible = true; walkInPool.userData.step(dt, new THREE.Vector3(0, 0.05, 0), 0.35, 0.15, 0.2); }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "detector-baseline") {
          repaint(detector.userData.screen, signFace(`${Math.round(gg.t * 40)}%`, {
            bg: "#12191f", accent: gg.t <= 0.18 ? "#59c97b" : "#f2ae14", fg: "#ffd9d9", scale: 0.6,
          }));
        }
      },
    };
  },
};
