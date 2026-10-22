import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Rigging Loft VR — its own gamified system: Fly Certified.
// Counterweight fly-system operation. The floor under a loaded batten is not a
// place to stand, an unlocked arbor is not a place to leave a line set, and
// "moving" is a word you earn by getting "clear" back first.

export const SIM_RIGGING_LOFT = {
  id: "rigging-loft",
  index: "18",
  domain: "Entertainment",
  trade: "Theatrical rigger (IATSE)",
  category: "Entertainment & Live Events",
  indoor: "theatre",
  certification: "IATSE — ETCP Certified Rigger, Arena",
  name: "Rigging Loft",
  title: simTitle("Rigging Loft"),
  tagline: "Counterweight fly-system operation: arbor inspection, balance, cued flying and automation cue programming",
  accent: 0xff6fae,
  accentCss: "#ff6fae",
  parSeconds: 265,
  badge: { id: "fly-qualified", name: "Fly Qualified", note: "Full fly cue with the arbor locked and the deck clear throughout" },

  game: system({
    name: "Fly Certified",
    currency: "FLY",
    ranks: ["Deck Hand", "Rail Operator", "Fly Rigger", "Head Flyman", "Fly Certified"],
    badges: [
      { id: "clear-deck", name: "Clear Deck", note: "Never stand under a loaded line", test: AWARD.safe },
      { id: "true-balance", name: "True Balance", note: "Hold every arbor reading near band centre", test: AWARD.precise(0.72) },
      { id: "cued-clean", name: "Cued Clean", note: "Call the fly cue with no correction", test: AWARD.stepClean("fly-cue") },
      { id: "cue-taught", name: "Cue Taught Clean", note: "Teach the automation cue in the correct order, first try", test: AWARD.stepClean("auto-teach") },
    ],
    challenges: [
      { id: "half-hour", name: "Half-Hour Call", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-drop", name: "No Drop", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "rail-streak", name: "Rail Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "standing-under-load": "You are standing directly beneath a loaded batten and arbor. A counterweight brick dropped from a loading gallery forty feet up arrives at around thirty miles an hour and gives no warning worth the name — which is why every ETCP rigging practice and OSHA's overhead-load rules come down to the same sentence: nobody works or walks under a flown line while it can still move.",
    "unlocked-rail": "That arbor's locking rail pin is out and the line set is not secured. A rope lock is designed to hold a balanced set, not to arrest an unbalanced one — an arbor that starts to run with weight on it will burn straight through the lock's jaws and take whatever is in its path with it.",
    "shortcut-call": "That is an override call button that skips the clearance check. 'Clear' is a question and 'moving' is a commitment, and calling the second before the first has come back is how a batten comes down on someone who never heard the cue. Skipping the call-and-answer is the one thing no house rigging protocol allows.",
    "excess-bricks": "That stack puts the arbor past the batten's rated capacity. Overloading a line set overhauls the operator at the rail, takes the rope out of its rated range, and loads the grid steel and the head block past what the ANSI-accredited entertainment rigging standards assumed when the house was built.",
  },

  lateNotes: {
    "locking-rail": "The arbor only gets locked once the counterweight is actually balanced against the batten's load — not before.",
    "trim-lock-pin": "The trim pin only goes in once the fly cue has actually brought the batten to its final position.",
  },

  // Interruptions: see shared/game.js. On a fly rail the danger is never the
  // set you are working — it is the deck walking under a moving batten, and
  // the line set nobody is watching deciding to move on its own.
  interrupts: [
    {
      id: "deck-under-batten",
      kind: "Deck breached",
      after: "lower-batten", delay: 3, seconds: 11,
      alert: "Two hands have walked on under line 4 to strike the last scene. The batten is still coming in over their heads.",
      cue: "Stop the move. Nothing comes in over people.",
      target: "call-stopped",
      why: "Stopped is the one call anybody can give and everybody has to obey, and the operator gives it the instant the deck stops being clear — not after finishing the move that was already underway. Getting the batten dead is the whole answer; sorting out who walked on can happen afterwards.",
      missNote: "You brought the batten the rest of the way in over two people who never looked up. Nothing touched them this time, which changes nothing about the exposure — a house rigger's own clearance call is the only control between a moving batten and a deck that has stopped watching it.",
      wrongNote: "Call stopped. Every other decision on this rail can wait the two seconds it takes to get a moving batten dead with people underneath it.",
    },
    {
      id: "arbor-creeping",
      kind: "Line set running",
      after: "auto-teach", delay: 4, seconds: 13,
      alert: "Behind you on the rail, line 3's arbor has started to creep — the pin you flagged on the walk-through is still out and somebody has hung a practical on that batten.",
      cue: "That set is coming out of balance with no lock in it.",
      target: "unlocked-rail",
      why: "An unbalanced set with its pin out does not creep for long — it accelerates, and a rope lock will not stop it once it is running. Getting the pin in while it is still only creeping is the difference between securing a line set and watching an arbor come down the rail with nothing to catch it.",
      missNote: "Line 3 ran. An arbor with weight on it and no pin overhauls, and the batten it is attached to goes to the grid as fast as the arbor comes to the deck — over a stage you had just spent ten minutes proving was clear for a different line set entirely.",
      wrongNote: "It is the unlocked rail on line 3. Nothing at the automation console matters while a loaded arbor is moving on its own two metres behind you.",
    },
  ],

  steps: [
    {
      id: "plot", kind: "select", target: "rigging-plot",
      title: "Read the rigging plot",
      cue: "Confirm the batten's rated capacity, planned load and trim height on the plot.",
      why: "The plot is the plan for this line set specifically. Capacity, load and trim are not the same from one batten to the next — the house was built with different rope sets, different head blocks and different grid steel over each one, and an ETCP rigger's first move is always to read which of those is above them today.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["fault-arbor-lock", "fault-rope", "fault-brick"],
      itemNames: {
        "fault-arbor-lock": "unlocked arbor on line 3", "fault-rope": "frayed lift line on line 5", "fault-brick": "unsecured counterweight brick",
      },
      itemNotes: {
        "fault-arbor-lock": "An arbor left unlocked between shows can shift the moment its rope takes a load — lock it before it becomes someone else's surprise.",
        "fault-rope": "A lift line with broken strands is rated for nothing until it is replaced — flag it and take that line set out of service.",
        "fault-brick": "A brick sitting loose in the arbor cage can shift or fall the first time that arbor moves — reseat and secure it before flying anything on that line.",
      },
      decoyNotes: {
        "stacked-bricks-good": "That arbor is stacked correctly and fully caged — nothing to action.",
        "locked-arbor-good": "That arbor rail is engaged and locked — leave it alone.",
      },
      title: "Walk the counterweight system",
      cue: "Check the arbors, ropes and locking rails. Three things are wrong — find them by looking.",
      why: "A pre-show rigging check is a search across every line set on the rail, not a glance at the one you are about to fly. The set that hurts somebody tonight is almost never the one in the cue sheet — it is the one nobody was working, left unlocked or half-loaded by the crew before you, with its faults sitting in plain sight all afternoon.",
    },
    {
      id: "comms-check", kind: "select", target: "headset",
      title: "Check comms with the fly floor",
      cue: "Put on the headset and confirm a clear channel with the deck.",
      why: "Every cue on this rail runs over that channel, and a headset that has gone one-way sounds exactly like a deck that is not answering. Check it before the first move, because the failure you are guarding against is calling 'clear', hearing nothing, and reading the silence as agreement.",
    },
    {
      id: "clear-floor", kind: "select", target: "floor-watch",
      title: "Post a floor watch",
      cue: "Post someone to keep the deck clear under the batten before it moves.",
      why: "A rigger at the pin rail is looking at a rope and an arbor, not at the stage. The floor watch covers the one place the operator physically cannot see — directly beneath the load — and they hold that job for the whole move, not until they get bored of it.",
    },
    {
      id: "lower-batten", kind: "track", target: "batten-line", seconds: 5,
      title: "Bring the batten in to load position",
      cue: "Haul the operating line hand over hand and keep the empty batten coming in at a steady, controlled speed.",
      why: "Counterweight goes on at the deck, not at height, so the batten comes to a working position first. An empty batten is arbor-heavy — it wants to run up, not down — so the whole way in is the operator holding a set that is trying to get away from them, at a speed the deck can watch.",
      track: {
        start: 0.12, green: [0.4, 0.6], rise: 0.58, fall: 0.48, drift: 0.11,
        label: "BATTEN IN — LINE SPEED",
        readout: (v) => (v < 0.4 ? "stalled — arbor overhauling" : v > 0.6 ? "coming in too fast" : "steady"),
      },
      holdBreakNote: "Lost the line and the arbor started to overhaul. Take it back hand over hand and bring the batten in at a speed the deck can react to.",
    },
    {
      id: "capacity-check", kind: "select", target: "capacity-plate",
      title: "Check the batten's rated capacity",
      cue: "Read the capacity plate and confirm the planned load is inside it.",
      why: "The plate is the hard limit for this batten, its rope set, its head block and the grid steel above it — 220 lb here against 190 lb planned. A line set is rated as a whole system, so the weakest component in that chain is the number on the plate, and nothing about the plot overrides it.",
    },
    {
      id: "load-weights", kind: "gauge", target: "arbor",
      title: "Load the arbor to balance",
      cue: "Add counterweight and commit once the arbor balances the batten's load.",
      why: "A balanced arbor is what lets one person hold two hundred pounds of scenery on a rope. Out of balance, the difference is what the operator's hands are carrying: twenty pounds out is a set that drifts, sixty pounds out is a set that runs, and at that point the rope is deciding where the batten goes instead of the rigger.",
      gauge: {
        label: "ARBOR — COUNTERWEIGHT BALANCE", speed: 0.6, green: [0.42, 0.58],
        readout: (t) => `${Math.round(160 + t * 60)} lb`,
        missNote: "Off balance. Add or pull bricks and recheck before the rail is locked.",
      },
    },
    {
      id: "lock-arbor", kind: "select", target: "locking-rail",
      title: "Lock the arbor rail",
      cue: "Engage the locking rail pin now that the arbor is balanced.",
      why: "The rope lock is what keeps a balanced arbor where you left it when you step away from the rail. It is worth knowing what it is not: it holds a set that is already in balance, and it is not rated to stop one that is running — which is why it goes on after the arbor balances, never instead of balancing it.",
    },
    {
      id: "fly-cue", kind: "sequence",
      targets: ["call-clear", "call-moving", "call-stopped"],
      itemNames: { "call-clear": "call clear", "call-moving": "call moving", "call-stopped": "call stopped" },
      title: "Call the fly cue",
      cue: "Call clear, wait for confirmation, call moving, then call stopped at trim.",
      why: "The three calls are a protocol, not a courtesy. 'Clear' is a question the deck answers; 'moving' is a commitment that the answer came back; 'stopped' releases everyone from watching. IATSE houses run this call-and-answer on every move because the alternative is an operator deciding on their own that silence meant yes.",
      outOfOrderNote: "Wrong order — clear is called and confirmed first, then moving, then stopped once the batten is in position.",
    },
    {
      id: "trim-lock", kind: "select", target: "trim-lock-pin",
      title: "Lock off at trim height",
      cue: "Pin the arbor at trim now that the batten is in its final position.",
      why: "The trim pin is a second, physical lock that holds the set exactly where the cue left it, independent of the rope lock at the rail. Two independent means of securing a load overhead is the same redundancy principle OSHA applies to anything suspended over people: one of them is allowed to fail.",
    },
    {
      id: "auto-teach", kind: "sequence", targets: ["auto-park", "auto-mid", "auto-out"],
      title: "Teach the automation winch's cue positions",
      cue: "Record line 6's park, mid-show and full-out positions in the order the cue actually runs.",
      why: "A motorised line plays back a taught cue exactly as recorded and has no opinion about what is underneath it. Teach full-out before mid-show and the batten runs straight past the position an actor has been blocked to stand at — on stage, live, at cue speed, with the console operator's hand nowhere near it. The order you teach is the order it runs.",
      itemNames: { "auto-park": "park position", "auto-mid": "mid-show position", "auto-out": "full-out position" },
      itemNotes: {
        "auto-park": "Clear of the grid, out of the way between cues.",
        "auto-mid": "Where the piece sits for the scene it's used in.",
        "auto-out": "Fully deployed for the final reveal.",
      },
      outOfOrderNote: "That position comes later in the cue. Park, then mid-show, then full-out — the console runs them back in the order you taught them, not the order that looks obvious from the deck.",
    },
    {
      id: "auto-save", kind: "select", target: "auto-save-btn",
      title: "Save the automation cue",
      cue: "Commit the three taught positions to the automation controller as one cue.",
      why: "An unsaved position list is just where the winch happened to stop, and it is gone when the console is powered down between the tech and the house opening. Saving it as a numbered cue is what lets the board operator fire it on one button in a blackout, which is the only way it will ever actually be run.",
    },
    {
      id: "auto-run", kind: "hold", target: "auto-run-btn", seconds: 2.5,
      title: "Run the cue at rehearsal speed and verify the deck",
      cue: "Hold RUN CUE and confirm the automated line clears the deck through every position.",
      why: "A powered hoist over a stage is proved at rehearsal speed with a hand on the console and a clear deck, the way the ANSI-accredited entertainment rigging standards ask any powered system to be proved before it carries a show. The first full-speed run of a new cue should never be the first time anyone finds out where it goes.",
      holdBreakNote: "Released before the cue finished running — hold it through the whole sequence, that's the only way to catch a position that fouls the deck.",
    },
    {
      id: "log", kind: "select", target: "rigging-plot",
      title: "Sign the rigging log",
      cue: "Record the load, trim height and lock status, and sign the plot closed.",
      why: "The next operator on this rail is a different person on a different call, and what they inherit is whatever the log says: load on the batten, trim height, which locks are on. A set left loaded and unrecorded is the one somebody unlocks in the dark expecting it to be empty.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.05, 0xff6fae);

    // -------------------------------------------------------------- pin rail + arbors
    const rail = group(g, -1.4, 0, 0, 0.3);
    slab(rail, 0.1, 2.0, 2.6, 0, 1.0, 0, 0x3a4048, { radius: 0.02, rough: 0.7, metal: 0.3 });
    for (let i = 0; i < 4; i++) {
      box(rail, 0.12, 0.03, 2.6, 0.06, 0.4 + i * 0.45, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    }

    // The working line: line 4, being loaded and flown this session.
    const arborTrack = group(rail, 0.09, 0, 0.9);
    const arborCage = group(arborTrack, 0, 0, 0);
    box(arborCage, 0.02, 1.7, 0.32, 0, 0.85, 0, 0x2b3138, { rough: 0.5, metal: 0.5, cast: false });
    const bricks = [];
    for (let i = 0; i < 4; i++) {
      const brick = box(arborCage, 0.16, 0.08, 0.26, 0.05, 0.2 + i * 0.1, 0, 0x8b929a, { rough: 0.6, metal: 0.4 });
      bricks.push(brick);
    }
    holoTag(arborCage, "Line 4 · Arbor", 0, 1.78, 0, { css: "#ff6fae", w: 0.32 });
    reg(hits, arborCage, "arbor");

    const railPin = group(arborTrack, 0.14, 0.62, 0.12);
    box(railPin, 0.03, 0.03, 0.12, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(railPin, "Locking rail", 0, 0.12, 0, { css: "#ff6fae", w: 0.3 });
    reg(hits, railPin, "locking-rail");

    const trimPin = group(arborTrack, -0.14, 1.4, 0.1);
    cyl(trimPin, 0.008, 0.008, 0.1, 0, 0, 0, 0xf2c14b, { rough: 0.5, seg: 8 }).rotation.x = Math.PI / 2;
    holoTag(trimPin, "Trim lock pin", 0, 0.1, 0, { css: "#ff6fae", w: 0.3 });
    reg(hits, trimPin, "trim-lock-pin");

    // Rope from the arbor up to the grid, and the batten it lifts.
    const rope = hose(rail, [[0.09, 1.75, 0.9], [0.5, 3.0, 0.5], [1.1, 3.1, 0.0], [1.6, 3.0, 0.0]], 0.009, 0xdfe4e8, { steps: 20, rough: 0.7 });
    const batten = group(g, 0.6, 1.9, 0, 0);
    box(batten, 2.4, 0.05, 0.05, 0, 0, 0, 0x545e67, { rough: 0.5, metal: 0.5 });
    const capacityPlate = decal(batten, 0.24, 0.06, 1.0, 0, 0.03, signFace("RATED 220 lb", { accent: "#ff6fae", scale: 0.5 }), { px: 128 });
    holoTag(batten, "Batten — line 4", 0, 0.12, 0, { css: "#ff6fae", w: 0.34 });
    reg(hits, batten, "batten-line");
    reg(hits, capacityPlate, "capacity-plate");

    // Floor zone directly under the batten — always a hazard when occupied.
    const dangerZone = box(g, 1.6, 0.01, 0.6, 0.6, 0.01, 0, 0xf0645b, { rough: 0.6, opacity: 0.16, cast: false, receive: false });
    dangerZone.material.transparent = true;
    holoTag(dangerZone, "No standing under load", 0, 0.06, 0.35, { css: "#f0645b", w: 0.4 });
    reg(hits, dangerZone, "standing-under-load");

    // Other line sets down the rail — one carrying the pre-show faults.
    const faultTrack = group(rail, 0.09, 0, -0.5);
    const faultCage = group(faultTrack, 0, 0, 0);
    box(faultCage, 0.02, 1.5, 0.3, 0, 0.75, 0, 0x2b3138, { rough: 0.5, metal: 0.5, cast: false });
    for (let i = 0; i < 3; i++) box(faultCage, 0.15, 0.08, 0.24, 0.05, 0.2 + i * 0.1, 0, 0x8b929a, { rough: 0.6, metal: 0.4 });
    const faultBrick = box(faultCage, 0.15, 0.08, 0.24, -0.12, 0.5, 0.05, 0x8b929a, { rough: 0.6, metal: 0.4 });
    holoTag(faultCage, "Line 3", 0, 1.6, 0, { css: "#ff6fae", w: 0.2 });
    reg(hits, faultBrick, "fault-brick");
    const faultPin = group(faultTrack, 0.14, 0.72, 0.12);
    box(faultPin, 0.03, 0.03, 0.12, 0.09, 0, 0, 0xf2c14b, { rough: 0.5 });
    reg(hits, faultPin, "fault-arbor-lock");
    holoTag(faultPin, "Rail pin OUT", 0, -0.08, 0, { css: "#f0645b", w: 0.3 });

    const ropeTrack = group(rail, 0.09, 0, -1.1);
    const faultRope = hose(ropeTrack, [[0, 1.4, 0], [0.05, 2.4, 0.1], [0.08, 3.0, 0.15]], 0.008, 0xc0c6cc, { steps: 14, rough: 0.7 });
    for (let i = 0; i < 4; i++) {
      hose(ropeTrack, [[0.03, 1.6 + i * 0.15, 0.02], [0.06 + (Math.random() - 0.5) * 0.05, 1.72 + i * 0.15, 0.05]], 0.002, 0xdfe4e8, { steps: 4 });
    }
    holoTag(ropeTrack, "Line 5 · Frayed", 0, 3.1, 0.16, { css: "#f0645b", w: 0.32 });
    reg(hits, faultRope, "fault-rope");

    // Unlocked arbor rail left disengaged mid-operation — a standing hazard elsewhere on the rail.
    const looseRail = group(rail, 0.11, 0.3, -1.7);
    box(looseRail, 0.03, 0.03, 0.14, 0, 0, 0, 0xf0645b, { rough: 0.5 });
    holoTag(looseRail, "Rail unlocked", 0, 0.1, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, looseRail, "unlocked-rail");

    // ------------------------------------------------------- automation winch
    // A motorized "house automation" line, separate from the hand-hauled
    // counterweight lines above — the same teach/save/verify pattern used for
    // Robot Cell's arm and Flight Deck's drone, applied to a stage automation
    // winch console.
    const autoTrack = group(rail, 0.09, 0, 1.7);
    cyl(autoTrack, 0.09, 0.09, 0.3, 0, 2.6, 0, 0x2b3138, { rough: 0.4, metal: 0.6, seg: 16 });
    cyl(autoTrack, 0.01, 0.01, 2.2, 0.3, 1.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.7, seg: 8 });
    holoTag(autoTrack, "Line 6 · House Automation", 0, 2.85, 0, { css: "#ff6fae", w: 0.42 });
    const autoBatten = box(autoTrack, 0.4, 0.02, 0.02, 0.3, 2.3, 0, 0x545e67, { rough: 0.5, metal: 0.5 });

    const autoPositions = { park: 2.3, mid: 1.5, out: 0.7 };
    const autoPosDefs = [
      [autoPositions.park, "auto-park", "Park", 0x59c97b],
      [autoPositions.mid, "auto-mid", "Mid-show", 0x4fd1ff],
      [autoPositions.out, "auto-out", "Full-out", 0xffcc00],
    ];
    for (const [y, id, label, color] of autoPosDefs) {
      const ring = torus(autoTrack, 0.08, 0.01, 0.3, y, 0, color,
        { emissive: color, ei: 1.1, rough: 0.4, cast: false, seg: 6, seg2: 24 });
      ring.rotation.x = Math.PI / 2;
      holoTag(autoTrack, label, 0.3, y + 0.14, 0, { css: "#ff6fae", w: 0.3 });
      reg(hits, ring, id);
    }

    // Excess bricks stacked beside the arbor — the overload trap.
    const excess = group(g, -0.85, 0, 1.0);
    for (let i = 0; i < 5; i++) box(excess, 0.16, 0.07, 0.24, 0, 0.045 + i * 0.08, 0, 0x8b929a, { rough: 0.6, metal: 0.4 });
    holoTag(excess, "Spare bricks", 0, 0.5, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, excess, "excess-bricks");

    // --------------------------------------------------------------------- fly rail HMI
    const desk = group(g, 0.2, 0, 1.55, -0.4);
    slab(desk, 0.6, 0.9, 0.3, 0, 0.45, 0, 0x53585e, { radius: 0.03, rough: 0.5, metal: 0.4 });
    const headsetHook = group(desk, -0.15, 0.75, 0);
    torus(headsetHook, 0.06, 0.012, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    box(headsetHook, 0.03, 0.1, 0.02, 0, -0.06, 0, 0x2b3138, { rough: 0.5 });
    holoTag(headsetHook, "Comms headset", 0, 0.14, 0, { css: "#ff6fae", w: 0.3 });
    reg(hits, headsetHook, "headset");

    // Automation cue console, on the same fly rail desk as the manual calls.
    const autoConsole = group(desk, -0.15, 0.5, 0.16);
    const autoScreen = decal(autoConsole, 0.1, 0.06, 0, 0.05, 0.006,
      signFace("CUE 6", { bg: "#11181f", accent: "#ff6fae", fg: "#fdecf3", scale: 0.55 }), { glow: true, ei: 0.8, px: 160 });
    const autoSaveBtn = cyl(autoConsole, 0.016, 0.016, 0.01, -0.025, -0.03, 0.006, 0x59c97b, { rough: 0.4, seg: 14 });
    autoSaveBtn.rotation.x = Math.PI / 2;
    reg(hits, autoSaveBtn, "auto-save-btn");
    const autoRunBtn = cyl(autoConsole, 0.016, 0.016, 0.01, 0.025, -0.03, 0.006, 0x4fd1ff, { rough: 0.4, seg: 14 });
    autoRunBtn.rotation.x = Math.PI / 2;
    reg(hits, autoRunBtn, "auto-run-btn");
    holoTag(autoConsole, "Save · Run cue", 0, -0.06, 0, { css: "#ff6fae", w: 0.3 });

    const callBoard = group(desk, 0.15, 0.75, 0.05);
    const callFaces = {};
    const calls = [{ id: "call-clear", label: "CLEAR", x: -0.09 }, { id: "call-moving", label: "MOVING", x: 0 }, { id: "call-stopped", label: "STOPPED", x: 0.09 }];
    for (const c of calls) {
      const holder = group(callBoard, c.x, 0, 0);
      box(holder, 0.08, 0.05, 0.01, 0, 0, 0, 0x11181f, { rough: 0.6 });
      callFaces[c.id] = decal(holder, 0.07, 0.042, 0, 0, 0.006, signFace(c.label, { bg: "#11181f", accent: "#ff6fae", scale: 0.4 }), { px: 128 });
      reg(hits, holder, c.id);
    }
    holoTag(callBoard, "Fly cue calls", 0, 0.14, 0, { css: "#ff6fae", w: 0.32 });

    // Override shortcut call button — the hazard.
    const shortcut = group(desk, 0, 0.5, 0.16);
    cyl(shortcut, 0.03, 0.03, 0.03, 0, 0, 0, 0xf2c14b, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    decal(shortcut, 0.07, 0.02, 0, -0.045, 0, signFace("OVERRIDE", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.5 }), { px: 96 });
    holoTag(shortcut, "No clearance check", 0, 0.08, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, shortcut, "shortcut-call");

    // Floor watch stagehand.
    const watch = standingFigure(g, 0.93, -0.83, { ry: 2.6, cloth: 0x2b3138, vest: 0xff6fae, helmet: 0x1b1e22 });
    holoTag(watch, "Floor watch", 0, 1.95, 0.15, { css: "#ff6fae", w: 0.28 });
    reg(hits, watch, "floor-watch");

    // -------------------------------------------------------------------- rigging plot
    const chest = toolChest(g, 1.7, -1.3, { ry: -0.6, color: 0xff6fae });
    const plot = holoPanel(g, 0.56, 0.4, 1.9, 1.5, -0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,6,16,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ff6fae"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e2a9c0";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("RIGGING PLOT — LINE 4", w * 0.06, h * 0.14);
      ctx.fillStyle = "#fdecf3";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("ACT 2 BACKDROP", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#e2a9c0";
      ["Rated capacity: 220 lb", "Planned load: 190 lb",
       "Trim height: 24' 0\"", "Comms: channel 2",
       "Floor watch: posted"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: -0.5, accent: 0xff6fae });
    reg(hits, plot, "rigging-plot");
    const arborMeter = instrument(chest, -0.08, 0.79, 0, { ry: 0.3, idle: "-- lb", color: 0xff6fae });
    holoTag(arborMeter, "Arbor scale", 0, 0.16, 0, { css: "#ff6fae", w: 0.28 });

    let batOnRail = false;
    let flying = false;
    const faultCageHome = faultCage.position.y;

    return {
      hits,
      footprint: 2.05,

      // Both interruptions are things to see, not captions. The deck zone goes
      // hot with people standing in it, and line 3's arbor actually starts
      // down the rail with its pin hanging out. See shared/game.js.
      onInterrupt(it) {
        if (it.id === "deck-under-batten") {
          dangerZone.material = mat(0xf0645b, { opacity: 0.5, transparent: true, emissive: 0xf0645b, ei: 1.2, cast: false });
        }
        if (it.id === "arbor-creeping") {
          faultCage.position.y = faultCageHome - 0.22;
          looseRail.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.5 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "deck-under-batten") {
          dangerZone.material = mat(0xf0645b, { opacity: 0.16, transparent: true, cast: false });
        }
        if (it.id === "arbor-creeping") {
          faultCage.position.y = faultCageHome;
          looseRail.children[0].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.5 });
        }
      },

      onStepComplete(step) {
        if (step.id === "load-weights") bricks.forEach((b, i) => { b.material = mat(0xff9dc4, { rough: 0.5, metal: 0.3 }); });
        if (step.id === "lock-arbor") { batOnRail = true; railPin.rotation.z = -0.9; }
        if (step.id === "fly-cue") { flying = true; }
        if (step.id === "trim-lock") { flying = false; trimPin.rotation.z = 1.2; }
        if (step.id === "auto-save") {
          repaint(autoScreen, signFace("SAVED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.5 }));
        }
        if (step.id === "auto-run") {
          autoBatten.position.y = autoPositions.out;
          repaint(autoScreen, signFace("VERIFIED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
        }
        if (step.id === "log") {
          repaint(callFaces["call-stopped"], signFace("LOGGED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.34 }));
        }
      },

      animate(t, dt, session) {
        if (flying) batten.position.y = 1.9 - Math.min(0.5, (t % 4) * 0.15);
        // The batten actually comes in while the operator holds the line, at
        // the speed they are holding it at.
        if (session?.step?.id === "lower-batten" && session.track) {
          const p = Math.min(1, session.track.inBand / session.step.seconds);
          batten.position.y = 1.9 - p * 0.45;
        }
        watch.userData.head.rotation.y = Math.sin(t * 0.6) * 0.3;

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "load-weights") {
          const lb = Math.round(160 + gg.t * 60);
          repaint(arborMeter.userData.screen, signFace(`${lb} lb`, {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.58 ? "#59c97b" : "#ff6fae", fg: "#bfeaf7", scale: 0.55,
          }));
        }

        // Cue playback: the automation batten rides park -> mid -> full-out in
        // step with how far the RUN CUE hold has gotten.
        if (session?.step?.id === "auto-run" && session.holding) {
          const p = Math.min(1, session.holdFor / session.step.seconds);
          const { park, mid, out } = autoPositions;
          autoBatten.position.y = p < 0.5 ? park + (mid - park) * (p * 2) : mid + (out - mid) * ((p - 0.5) * 2);
        }
      },
    };
  },
};
