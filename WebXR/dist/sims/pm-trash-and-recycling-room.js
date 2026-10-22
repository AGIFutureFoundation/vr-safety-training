import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, lockTag, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Trash and Recycling Room VR — Building Systems & Facilities,
// property management programme, zone four of twenty.
//
// The room at the bottom of the chute, worked the way an SEIU porter crew
// works it: the hauler schedule read, cut-resistant gloves and eye protection
// on, the chute room walked for the faults that turn a trash fire into a
// building fire, the compactor's hydraulics read and a cycle run under a
// hold-to-run control, a needle picked up with tongs rather than fingers, the
// compactor locked out before anyone reaches into its charge box, a jam
// cleared, the carts de-contaminated, power restored by the person whose lock
// it was, and the room written into the building log. A generic building;
// no real hauler, resident or ordinance number is named.

const PMTR_ACCENT = 0x5fae8a;

export const SIM_PM_TRASH_AND_RECYCLING_ROOM = {
  id: "pm-trash-and-recycling-room",
  index: "304",
  domain: "Property Management",
  trade: "Porter and building service worker — SEIU building service members, with IUOE Local 39 engineers for the compactor's electrical and hydraulic repairs",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "OSHA 29 CFR 1910.147 (control of hazardous energy) for any reach into the compactor, 29 CFR 1910.212 for its guarding and hold-to-run control, 29 CFR 1910.1030 for a needle found in the trash, 29 CFR 1910.1200 for the cleaning chemicals, and 29 CFR 1910.138 and 29 CFR 1910.133 for cut-resistant gloves and eye protection; NFPA 25 for the sprinkler over the chute discharge and NFPA 101 for the chute's self-closing rated door; the state and local organics and recycling rules the building's carts are sorted to; SEIU contract language for building service staff; IUOE Local 39 for the engineers who repair the compactor.",
  supportLine: "the SEIU member assistance line or your employer's EAP — a needle in the trash is a scare even when nobody is stuck",
  name: "Trash and Recycling Room",
  title: simTitle("Trash and Recycling Room"),
  tagline: "The room under the chute: schedule read, gloves and glasses on, fire faults found, the compactor read and run hold-to-run, a needle taken with tongs, the compactor locked out before the jam is cleared, the carts sorted, and power restored by the lock's owner",
  accent: PMTR_ACCENT,
  accentCss: "#5fae8a",
  parSeconds: 280,
  footprint: 2.4,
  badge: { id: "chute-room-clear", name: "Chute Room Clear", note: "A trash room run with no hand inside a live compactor, no needle touched and no fire door propped" },

  game: system({
    name: "Chute Room",
    currency: "BINS",
    ranks: ["Relief Porter", "Porter", "Lead Porter", "Day Porter Lead", "Chute Room Certified"],
    badges: [
      { id: "hands-out", name: "Hands Out", note: "No unsafe action anywhere in the shift", test: AWARD.safe },
      { id: "locked-first", name: "Locked First", note: "The compactor locked out on the first try", test: AWARD.stepClean("lock-tag") },
      { id: "steady-hook", name: "Steady Hook", note: "Every timed task carried through without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-room-shift", name: "Clean Shift", note: "No corrections anywhere", test: AWARD.clean },
      { id: "before-the-hauler", name: "Before the Hauler", note: "Inside 80% of par", test: AWARD.fast(0.8) },
      { id: "eight-in-a-row", name: "Eight in a Row", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "ram-face-reach": "You are reaching into the compactor's charge box with the power still on. The ram can cycle from a photo-eye, a timer or someone else's hand on the button, and it exerts tons of force across the opening. 29 CFR 1910.147 exists for this exact reach: nothing goes past the guard until the disconnect is off and your lock is on it.",
    "chute-door-wedge": "You are wedging the chute discharge door open to stop it banging. That door is a rated fire door on a vertical shaft that runs through every floor; a trash fire under a propped door has a chimney straight up the building. NFPA 101 wants it self-closing, and the fusible link that shuts it in a fire cannot work while a wedge holds it.",
    "bag-squeeze": "You are pushing down on an overfull bag with your hand to make it fit. Residents throw needles, broken glass and razor blades into the chute; a bag compressed by hand is how they go through the plastic and into a palm. Bags are handled by the neck and never compressed against the body — 29 CFR 1910.1030 is written around injuries exactly like this.",
    "bleach-ammonia": "You are pouring bleach into the bucket that already has the ammonia cleaner in it to kill the smell. Together they give off chloramine gas in a small room with one door. The SDS for each product under 29 CFR 1910.1200 says never to mix them; the bin wash uses one product, rinsed, then the other if at all.",
  },

  lateNotes: {
    "compactor-lock": "The lock goes on once the disconnect is off — a lock on a live disconnect is a tag on a machine that can still run.",
    "jam-hook": "The jam is cleared only with the compactor locked out. Nothing reaches into that charge box while the disconnect is on.",
    "building-log": "The room goes into the log once the compactor is restored and the carts are sorted.",
  },

  steps: [
    {
      id: "collection-schedule", kind: "select", target: "collection-schedule",
      title: "Read the hauler schedule and the compactor log",
      cue: "Check which streams are collected today and what the last shift wrote in the compactor log.",
      why: "The hauler's schedule decides which carts have to be at the curb and when, and the compactor log is where the last porter wrote that the ram hesitated or the container was nearly full. Starting from both means the room is worked to today's pickups instead of discovering at noon that the organics cart was due at seven.",
    },
    {
      id: "ppe-on", kind: "sequence", anyOrder: true,
      targets: ["cut-gloves", "safety-glasses"],
      itemNames: { "cut-gloves": "cut- and puncture-resistant gloves on", "safety-glasses": "safety glasses on" },
      title: "Glove up and put on eye protection",
      cue: "Pull on the cut-resistant gloves and the safety glasses before you touch a bag or a cart.",
      why: "Everything that comes down a chute arrives unsorted: broken glass, needles, cans cut open, liquids that splash when a bag splits. 29 CFR 1910.138 asks for hand protection matched to the hazard — here that means cut and puncture resistance — and 29 CFR 1910.133 asks for eye protection where a split bag can throw liquid or glass at your face.",
    },
    {
      id: "chute-room-walk", kind: "find", noHint: true,
      targets: ["chute-door-latch", "bagged-sprinkler", "unlabeled-jug"],
      itemNames: { "chute-door-latch": "chute discharge door not latching", "bagged-sprinkler": "sprinkler head over the chute bagged", "unlabeled-jug": "unlabelled jug beside the carts" },
      itemNotes: {
        "chute-door-latch": "The discharge door swings back without latching. A rated door that does not close is not a fire door — log it for the engineer today.",
        "bagged-sprinkler": "Someone has put a plastic bag over the sprinkler head above the chute, probably after a nuisance drip. That head is the fire protection for the most likely fire in the building, and NFPA 25 treats an obstructed head as a deficiency to correct now.",
        "unlabeled-jug": "An unlabelled jug of liquid has been left by the carts. Until somebody knows what it is, it does not go into any cart or down any drain — it goes to the hazardous waste cabinet.",
      },
      title: "Walk the chute room for fire faults",
      cue: "Three things in this room make a trash fire worse or a spill unknown. Find them.",
      why: "Trash rooms are where building fires most often start, and the defences are simple and easy to defeat: a door that closes, a sprinkler that can reach the fire, and nothing unknown sitting beside the fuel. None of them shows on a panel. They are found by a porter who walks the room every morning and knows what right looks like.",
    },
    {
      id: "hydraulic-check", kind: "gauge", target: "hydraulic-gauge",
      title: "Read the compactor's hydraulic pressure",
      cue: "Watch the hydraulic gauge on the power unit and commit when it rests inside the operating band.",
      why: "A compactor that builds too little pressure stalls with the ram half out and the charge box jammed; one that builds too much is a relief valve or a hose on its way to failing, and a hydraulic hose that lets go sprays oil hot enough and hard enough to injure. The gauge is the only look anyone gets inside the power unit before the ram moves.",
      gauge: {
        label: "COMPACTOR HYDRAULIC PRESSURE", speed: 0.55, green: [0.45, 0.6],
        readout: (t) => `${Math.round(t * 3000)} psi`,
        missNote: "Outside the operating band. Low and the ram will stall mid-stroke; high and something in the power unit is failing. Read it again and commit only inside the band — or tag it for the engineer.",
      },
    },
    {
      id: "compactor-cycle", kind: "hold", target: "compactor-run", seconds: 5,
      title: "Run a compaction cycle on the hold-to-run button",
      cue: "Close the charge-box gate and hold the run button through the full stroke — release stops the ram.",
      why: "A hold-to-run control means the ram moves only while a person is standing at the button watching the charge box, and 29 CFR 1910.212 expects the point of operation to be guarded in exactly this way. Holding it through a full stroke packs the container properly; letting it go halfway leaves the ram out across the opening, which is how the next jam begins.",
      holdBreakNote: "You let go mid-stroke and the ram stopped across the opening. Hold the button through the whole cycle so the ram returns home.",
    },
    {
      id: "sharps-pickup", kind: "drag", target: "sharps-tongs",
      title: "Pick up the needle with tongs",
      cue: "A needle is poking out of a split bag. Take it with the tongs and carry it to the sharps container.",
      why: "A found needle is handled as if it is contaminated, because there is no way to know it is not. 29 CFR 1910.1030 is built on never letting a hand get near the point: tongs to pick it up, a rigid sharps container to put it in, and the lid closed behind it. A stick from a discarded needle means months of testing and fear even when it comes to nothing.",
      drag: { to: "sharps-box-socket", radius: 0.5, missNote: "Not in the sharps container. Carry it all the way in and let go over the opening — a needle set down anywhere else is still loose." },
    },
    {
      id: "disconnect-off", kind: "turn", target: "compactor-disconnect",
      title: "Switch off the compactor at its disconnect",
      cue: "The charge box is jammed. Turn the compactor's disconnect handle to OFF before anything else.",
      why: "The run button is a control, not an isolation: a photo-eye, a timer or a second person can start the ram while the button is untouched. The disconnect cuts the power to the motor and the pump, and it is the energy-isolating device 29 CFR 1910.147 means. Turning it off is the first half of making the charge box a place a hand can go.",
      turn: { turns: 0.25, axis: "z", label: "COMPACTOR DISCONNECT", readout: (t) => (t < 0.95 ? "ON" : "OFF") },
    },
    {
      id: "lock-tag", kind: "select", target: "compactor-lock",
      title: "Apply your lock and tag",
      cue: "Hang your own lock and tag on the disconnect handle.",
      why: "A switched-off disconnect can be switched on by anyone who does not know you are reaching into the charge box. Your lock, with your name on the tag, is what makes the machine yours until you take it off; 29 CFR 1910.147 requires it to be the lock of the person exposed, not the room's shared padlock.",
    },
    {
      id: "clear-jam", kind: "track", target: "jam-hook", seconds: 6,
      title: "Clear the jam with the hook",
      cue: "Work the jammed bags free with the long hook in steady pulls — not yanks.",
      why: "Even locked out, a jammed charge box holds stored energy: packed bags pressed against the ram spring back, and a hard yank brings glass and liquid with them. Steady pulls with the long-handled hook keep your body back from the opening and let the jam come loose a piece at a time instead of all at once in your face.",
      track: {
        start: 0.2, green: [0.4, 0.62], rise: 0.45, fall: 0.4, drift: 0.1,
        label: "HOOK — PULL",
        readout: (v) => (v < 0.4 ? "barely moving" : v > 0.62 ? "yanking — bags split" : "steady pull"),
      },
      holdBreakNote: "The pull went out of the steady band. A yank splits bags and throws what is in them; ease it back to a steady draw.",
    },
    {
      id: "sort-contamination", kind: "sequence", anyOrder: true,
      targets: ["organics-plastic", "recycling-cardboard", "pizza-box"],
      itemNames: { "organics-plastic": "plastic bag pulled from the organics cart", "recycling-cardboard": "cardboard flattened into recycling", "pizza-box": "greasy pizza box moved to organics" },
      title: "Pull the contamination out of the carts",
      cue: "Take the plastic out of the organics, flatten the cardboard into recycling, and move the greasy box to organics.",
      why: "A cart that arrives contaminated can be refused or landfilled whole, and the building is the one charged for it under the state and local organics and recycling rules. A minute sorting the obvious mistakes — plastic in the organics, food grease on the cardboard — keeps the carts acceptable and the diversion numbers honest.",
    },
    {
      id: "restore-disconnect", kind: "turn", target: "compactor-disconnect",
      title: "Remove your lock and restore the compactor",
      cue: "With the charge box clear and nobody near it, take your lock off and turn the disconnect back ON.",
      why: "Only the person whose lock it is takes it off, and only once the charge box is empty of people, hooks and tools. Restoring power is the moment a machine that has been safe for twenty minutes becomes dangerous again, so it is done deliberately, with a look into the opening first — not by the next person who notices the compactor is off.",
      turn: { turns: 0.25, axis: "z", label: "COMPACTOR DISCONNECT", readout: (t) => (t < 0.95 ? "OFF" : "ON") },
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Write the room into the building log",
      cue: "Log the chute door, the bagged sprinkler, the jam, the needle and the inspector's visit.",
      why: "The chute door and the sprinkler are repairs for the engineer, the needle is a record the building should keep, and the jam tells the next shift how the compactor is behaving. Written in the building log, each one becomes a ticket someone owns; told to a co-worker in passing, each one becomes something everybody assumed somebody else reported.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with your co-worker",
      cue: "Ask the other porter how the needle and the rest of the shift sat with them, and name the member line.",
      why: "Finding a needle in a bag you nearly squeezed, or being on the receiving end of a resident's anger about the chute, stays with people more than they say. A short check-in at the end of the room, with the SEIU member assistance line named, is a small thing that keeps porters telling each other when something has rattled them.",
    },
  ],

  interrupts: [
    {
      id: "resident-hhw",
      kind: "Resident with hazardous waste",
      after: "compactor-cycle", delay: 2, seconds: 12,
      alert: "A resident walks in with a box of old paint cans, a car battery and two fluorescent tubes and heads for the landfill cart.",
      cue: "Stop the cycle, and direct it to the household hazardous waste cabinet instead of the cart.",
      target: "hhw-cabinet",
      why: "Batteries, solvent-based paint and fluorescent tubes are household hazardous waste: crushed in a compactor they leak, spark or release mercury, and batteries in particular start trash fires. The cabinet exists so a resident trying to do the right thing has somewhere to put them — directing them there politely is the whole answer.",
      missNote: "The resident tipped the box into the landfill cart and left. A battery and two tubes are now headed for the compactor, and one of them is a fire waiting for the ram.",
      wrongNote: "Not that. Point them to the household hazardous waste cabinet — batteries and tubes never go in a cart.",
    },
    {
      id: "inspector-pests",
      kind: "Inspector arrives",
      after: "clear-jam", delay: 3, seconds: 12,
      alert: "A city health inspector arrives following a resident's complaint about rats near the trash room and asks to see the pest control log.",
      cue: "Keep the compactor locked out, and hand over the pest control log.",
      target: "pest-log",
      why: "A pest complaint is answered with a record: when the bait stations were serviced, what was found, what was sealed. The pest log on the wall is the building's evidence that the room is managed rather than just emptied, and producing it immediately — while your lock stays on — tells the inspector both things at once.",
      missNote: "The inspector waited and left without the pest log. The complaint is now recorded as unanswered, whatever the exterminator actually did last week.",
      wrongNote: "That is not what the inspector asked for. The pest control log is on the wall by the door.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, PMTR_ACCENT);

    // ------------------------------------------------------------ sealed concrete floor with a drain
    const concTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#7d848a", base2: "#727980", seam: "rgba(20,24,28,0.35)" }), { repeat: 3, px: 384 });
    const conc = box(g, 6.0, 0.01, 5.6, 0, 0.005, -0.3, 0x7d848a, { rough: 0.8, cast: false });
    conc.material = texturedMat(concTex, { rough: 0.75, metal: 0.05, color: 0xc9ced3 });
    conc.receiveShadow = true;
    const drain = group(g, 0.4, 0.012, 0.6);
    box(drain, 0.3, 0.006, 0.3, 0, 0, 0, 0x3a4148, { rough: 0.5, metal: 0.5 });
    for (let i = -2; i <= 2; i++) box(drain, 0.02, 0.008, 0.28, i * 0.05, 0.002, 0, 0x22262b, { rough: 0.5 });
    decal(g, 2.8, 0.52, 0, 2.62, -4.36, signFace("TRASH & RECYCLING", { bg: "#0f1a14", accent: "#5fae8a", fg: "#e6f4ec", scale: 0.46 }), { px: 512 });

    // ------------------------------------------------------------ the chute and compactor
    const chute = group(g, -0.9, 0, -1.9);
    cyl(chute, 0.36, 0.36, 1.9, 0, 3.25, 0, 0x8b949d, { rough: 0.4, metal: 0.7, seg: 18 });
    for (let i = 0; i < 3; i++) torus(chute, 0.37, 0.02, 0, 2.5 + i * 0.6, 0, 0x6d7379, { rough: 0.4, metal: 0.7, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    box(chute, 0.9, 0.5, 0.9, 0, 2.1, 0, 0x7b848c, { rough: 0.45, metal: 0.6 });
    // Discharge door with its fusible link and a latch that does not catch.
    const dDoor = group(chute, 0, 1.88, 0.46);
    box(dDoor, 0.7, 0.44, 0.03, 0, 0, 0, 0x5a626a, { rough: 0.5, metal: 0.5 });
    const link = box(dDoor, 0.04, 0.08, 0.02, 0.3, 0.22, 0.02, 0xd8b23a, { rough: 0.4, metal: 0.7 });
    void link;
    const latch = box(dDoor, 0.08, 0.05, 0.04, -0.3, 0, 0.03, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(dDoor, "Discharge door latch", -0.3, 0.14, 0.04, { css: "#5fae8a", w: 0.38 });
    reg(hits, latch, "chute-door-latch");
    const wedge = box(chute, 0.14, 0.05, 0.18, 0.4, 1.66, 0.52, 0x8b6a48, { rough: 0.7 });
    wedge.rotation.x = 0.3;
    holoTag(chute, "Wedge the door?", 0.4, 1.5, 0.58, { css: "#f0645b", w: 0.3 });
    reg(hits, wedge, "chute-door-wedge");
    // Sprinkler head above the discharge, bagged.
    const head = group(chute, 0.55, 2.55, 0.3);
    cyl(head, 0.015, 0.015, 0.12, 0, 0.06, 0, 0xb8853a, { rough: 0.4, metal: 0.7, seg: 8 });
    cyl(head, 0.04, 0.04, 0.01, 0, 0, 0, 0xb8853a, { rough: 0.4, metal: 0.7, seg: 10 });
    const bag = ball(head, 0.08, 0, -0.02, 0, 0xdfe8ee, { rough: 0.3, opacity: 0.7, transparent: true, seg: 10 });
    holoTag(head, "Sprinkler head", 0, 0.2, 0, { css: "#5fae8a", w: 0.28 });
    reg(hits, bag, "bagged-sprinkler");

    const comp = group(g, -0.9, 0, -1.2);
    box(comp, 1.6, 1.1, 1.2, 0, 0.55, -0.5, 0x2f6f4a, { rough: 0.5, metal: 0.4 });
    box(comp, 1.0, 0.1, 0.7, 0, 1.15, -0.1, 0x1f4a32, { rough: 0.5, metal: 0.4 });
    const chargeBox = box(comp, 0.9, 0.5, 0.05, 0, 0.8, 0.12, 0x14171b, { rough: 0.9 });
    void chargeBox;
    for (let i = 0; i < 5; i++) box(comp, 0.02, 0.5, 0.02, -0.36 + i * 0.18, 0.8, 0.16, 0xf2c14b, { rough: 0.5 });
    holoTag(comp, "Charge box — gate closed", 0, 1.3, 0.16, { css: "#5fae8a", w: 0.44 });
    const jamBags = group(comp, 0, 0.8, 0.02);
    for (let i = 0; i < 3; i++) ball(jamBags, 0.13, -0.25 + i * 0.25, 0, 0, [0x1b1e22, 0x2b3a2b, 0x22262b][i], { rough: 0.4, seg: 10 });
    const reach = box(comp, 0.3, 0.3, 0.1, 0.55, 0.6, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(comp, "Reach in to clear?", 0.55, 0.42, 0.22, { css: "#f0645b", w: 0.34 });
    reg(hits, reach, "ram-face-reach");
    // Receiver container behind.
    box(comp, 1.7, 1.3, 1.0, 0, 0.65, -1.4, 0x2f5a8a, { rough: 0.6, metal: 0.4 });
    // Control station: hydraulic gauge, run button.
    const ctrl = group(g, 0.3, 0, -1.45);
    box(ctrl, 0.12, 1.1, 0.12, 0, 0.55, 0, 0x3a4148, { rough: 0.5, metal: 0.4 });
    box(ctrl, 0.34, 0.4, 0.14, 0, 1.25, 0, 0x5a626a, { rough: 0.5, metal: 0.4 });
    const gaugeFace = decal(ctrl, 0.14, 0.14, -0.08, 1.33, 0.072, signFace("1500\npsi", { bg: "#0d1c24", accent: "#5fae8a", fg: "#c9f5e0", scale: 0.28 }), { glow: true, ei: 0.8, px: 128 });
    holoTag(ctrl, "Hydraulic gauge", -0.08, 1.52, 0.07, { css: "#5fae8a", w: 0.3 });
    reg(hits, gaugeFace, "hydraulic-gauge");
    const runBtn = group(ctrl, 0.09, 1.2, 0.08);
    cyl(runBtn, 0.035, 0.035, 0.03, 0, 0, 0, 0x2f7d4a, { rough: 0.4, seg: 12, emissive: 0x2f7d4a, ei: 0.4 }).rotation.x = Math.PI / 2;
    holoTag(runBtn, "Hold to run", 0, -0.1, 0.01, { css: "#5fae8a", w: 0.24 });
    reg(hits, runBtn, "compactor-run");
    // Disconnect on the wall with the lock hasp.
    const disc = group(g, 1.25, 0, -2.1);
    box(disc, 0.34, 0.5, 0.16, 0, 1.45, 0, 0x8b949d, { rough: 0.45, metal: 0.55 });
    const handle = group(disc, 0.2, 1.45, 0.02);
    box(handle, 0.04, 0.16, 0.04, 0, 0.06, 0, 0xc8201a, { rough: 0.5 });
    disc.userData.wheel = handle;
    decal(disc, 0.24, 0.1, 0, 1.62, 0.082, signFace("COMPACTOR", { bg: "#1b1e22", accent: "#5fae8a", scale: 0.5 }), { px: 128 });
    holoTag(disc, "Disconnect", 0, 1.8, 0.05, { css: "#5fae8a", w: 0.24 });
    reg(hits, disc, "compactor-disconnect");
    const hasp = torus(disc, 0.02, 0.005, 0.2, 1.28, 0.06, CITY.steel, { rough: 0.3, metal: 0.9 });
    reg(hits, hasp, "compactor-lock");
    const myLock = lockTag(disc, 0.2, 1.28, 0.1, { color: 0x2f7d4a, lines: ["DO NOT", "OPERATE", "— PORTER"] });
    myLock.visible = false;
    // Hook for the jam, leaning on the wall.
    const hook = group(g, 0.95, 0, -0.9);
    const hookPole = cyl(hook, 0.014, 0.014, 1.6, 0, 0.8, 0, 0x6d7379, { rough: 0.4, metal: 0.6, seg: 8 });
    hookPole.rotation.z = 0.2;
    torus(hook, 0.05, 0.01, -0.16, 1.6, 0, 0x6d7379, { rough: 0.4, metal: 0.6, seg: 6, seg2: 12 });
    holoTag(hook, "Jam hook", -0.1, 1.8, 0, { css: "#5fae8a", w: 0.2 });
    reg(hits, hook, "jam-hook");

    // ------------------------------------------------------------ carts
    const cart = (x, z, colour, label, ry = 0) => {
      const c = group(g, x, 0, z, ry);
      box(c, 0.6, 0.95, 0.7, 0, 0.5, 0, colour, { rough: 0.6 });
      box(c, 0.64, 0.05, 0.74, 0, 1.0, 0, colour, { rough: 0.6 });
      for (const sx of [-0.25, 0.25]) cyl(c, 0.08, 0.08, 0.05, sx, 0.08, -0.33, 0x1b1e22, { rough: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
      decal(c, 0.4, 0.14, 0, 0.7, 0.352, signFace(label, { bg: "#f4f6f8", accent: "#1b1e22", fg: "#1b1e22", scale: 0.5 }), { px: 128 });
      return c;
    };
    const recyc = cart(-2.4, -0.4, 0x2f5a9a, "RECYCLING", Math.PI / 2);
    const organ = cart(-2.4, 0.5, 0x3a7d3a, "ORGANICS", Math.PI / 2);
    cart(-2.4, 1.4, 0x3a4148, "LANDFILL", Math.PI / 2);
    const plasticBag = ball(organ, 0.1, 0.1, 1.08, 0.1, 0xdfe8ee, { rough: 0.3, seg: 8 });
    reg(hits, plasticBag, "organics-plastic");
    const cardboard = box(recyc, 0.4, 0.3, 0.3, -0.05, 1.18, 0, 0xb08a5a, { rough: 0.85 });
    reg(hits, cardboard, "recycling-cardboard");
    const pizza = box(g, 0.36, 0.05, 0.36, -1.7, 0.03, 1.0, 0xc09a6a, { rough: 0.85 });
    decal(g, 0.2, 0.12, -1.7, 0.058, 1.0, signFace("PIZZA", { bg: "#c09a6a", accent: "#8a4a2a", fg: "#5a2a1a", scale: 0.5 }), { px: 64 }).rotation.x = -Math.PI / 2;
    reg(hits, pizza, "pizza-box");
    // An overfull bag on the floor, with a needle poking out — squeeze trap and sharps pickup.
    const fullBag = group(g, 0.9, 0, 0.3);
    ball(fullBag, 0.24, 0, 0.22, 0, 0x1b1e22, { rough: 0.4, seg: 12 });
    const squeeze = box(fullBag, 0.3, 0.1, 0.3, 0, 0.47, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(fullBag, "Squeeze it down?", 0, 0.62, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, squeeze, "bag-squeeze");
    const needle = cyl(fullBag, 0.004, 0.004, 0.1, 0.2, 0.3, 0.1, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 6 });
    needle.rotation.z = 1.0;
    const tongs = group(g, 1.35, 0.95, -1.35);
    for (const s of [-1, 1]) {
      const arm = box(tongs, 0.02, 0.02, 0.5, s * 0.02, 0, 0, 0x8b949d, { rough: 0.4, metal: 0.7 });
      arm.rotation.y = s * 0.05;
    }
    box(g, 0.34, 0.92, 0.24, 1.35, 0.46, -1.35, 0x5a626a, { rough: 0.6 });
    holoTag(tongs, "Sharps tongs", 0, 0.15, 0, { css: "#5fae8a", w: 0.26 });
    reg(hits, tongs, "sharps-tongs");
    const sharps = group(g, 2.4, 0, 0.4);
    box(sharps, 0.3, 1.3, 0.2, 0, 0.65, 0, 0x3a4148, { rough: 0.6 });
    box(sharps, 0.26, 0.34, 0.22, 0, 1.45, 0, 0xc8201a, { rough: 0.5 });
    decal(sharps, 0.2, 0.08, 0, 1.5, 0.112, signFace("SHARPS", { bg: "#c8201a", accent: "#f2c14b", fg: "#ffffff", scale: 0.55 }), { px: 128 });
    const sharpsSocket = box(sharps, 0.2, 0.05, 0.2, 0, 1.65, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["sharps-box-socket"] = sharpsSocket;

    // ------------------------------------------------------------ HHW cabinet, chemicals, PPE, jug
    const hhw = group(g, 2.35, 0, -1.2, -Math.PI / 2);
    box(hhw, 0.9, 1.1, 0.5, 0, 0.55, 0, 0xf2c14b, { rough: 0.5, metal: 0.3 });
    decal(hhw, 0.7, 0.2, 0, 0.85, 0.252, signFace("HOUSEHOLD\nHAZARDOUS WASTE", { bg: "#f2c14b", accent: "#c8201a", fg: "#1b1e22", scale: 0.3 }), { px: 256 });
    const hhwDoor = box(hhw, 0.02, 0.4, 0.02, 0.05, 0.55, 0.26, 0x1b1e22, { rough: 0.5 });
    void hhwDoor;
    reg(hits, hhw, "hhw-cabinet");
    const jug = group(g, -1.6, 0, 0.0);
    box(jug, 0.16, 0.26, 0.12, 0, 0.13, 0, 0xe6e0c8, { rough: 0.5 });
    cyl(jug, 0.025, 0.025, 0.05, 0.04, 0.29, 0, 0xc8201a, { rough: 0.5, seg: 8 });
    holoTag(jug, "No label", 0, 0.42, 0, { css: "#5fae8a", w: 0.2 });
    reg(hits, jug, "unlabeled-jug");
    const bucket = group(g, 1.6, 0, 1.3);
    cyl(bucket, 0.15, 0.13, 0.3, 0, 0.15, 0, 0x2f5a9a, { rough: 0.5, seg: 12 });
    const bleach = group(bucket, 0.3, 0, 0);
    box(bleach, 0.1, 0.28, 0.08, 0, 0.14, 0, 0xf4f6f8, { rough: 0.4 });
    decal(bleach, 0.08, 0.06, 0, 0.16, 0.041, signFace("BLEACH", { bg: "#f4f6f8", accent: "#2f5a9a", fg: "#2f5a9a", scale: 0.45 }), { px: 64 });
    holoTag(bucket, "Add bleach to the ammonia?", 0.1, 0.5, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, bleach, "bleach-ammonia");
    const ppe = group(g, 1.9, 0, -0.3);
    box(ppe, 0.5, 0.9, 0.3, 0, 0.45, 0, 0x5a626a, { rough: 0.5, metal: 0.4 });
    const gloves = group(ppe, -0.1, 0.92, 0);
    for (const sx of [-0.05, 0.05]) box(gloves, 0.08, 0.03, 0.14, sx, 0, 0, 0x6a8a3a, { rough: 0.7 });
    holoTag(ppe, "Cut gloves", -0.1, 1.08, 0, { css: "#5fae8a", w: 0.22 });
    reg(hits, gloves, "cut-gloves");
    const glasses = group(ppe, 0.13, 0.92, 0);
    box(glasses, 0.14, 0.04, 0.02, 0, 0, 0, 0x9fc4e4, { rough: 0.1, metal: 0.2, opacity: 0.7, transparent: true });
    box(glasses, 0.01, 0.01, 0.1, -0.07, 0, -0.05, 0x1b1e22, { rough: 0.5 });
    holoTag(ppe, "Safety glasses", 0.13, 1.2, 0, { css: "#5fae8a", w: 0.26 });
    reg(hits, glasses, "safety-glasses");

    // Hose reel and a bait station for dressing.
    const reel = group(g, 2.55, 0, 1.6, -Math.PI / 2);
    torus(reel, 0.2, 0.05, 0, 1.0, 0, 0x2f7d4a, { rough: 0.6, seg: 8, seg2: 18 });
    box(reel, 0.1, 1.0, 0.1, 0, 0.5, -0.05, 0x5a626a, { rough: 0.5, metal: 0.4 });
    const bait = box(g, 0.26, 0.12, 0.2, -1.9, 0.06, -2.3, 0x1b1e22, { rough: 0.6 });
    void bait;

    // ------------------------------------------------------------ boards
    const sched = holoPanel(g, 0.54, 0.38, -2.2, 1.75, -1.15, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,14,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5fae8a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e6f4ec"; cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("HAULER SCHEDULE", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#bfe0cc";
      ["Recycling — Tue · Fri", "Organics — Mon · Thu", "Landfill — daily", "Compactor log: ram slow (night)"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { ry: 1.0, accent: PMTR_ACCENT });
    reg(hits, sched, "collection-schedule");
    const pest = holoPanel(g, 0.44, 0.3, 2.45, 1.9, -1.2, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,14,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5fae8a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e6f4ec"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("PEST CONTROL LOG", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#bfe0cc";
      cx.fillText("Stations · findings · sealed", w / 2, h * 0.62);
    }, { ry: -1.4, accent: PMTR_ACCENT });
    reg(hits, pest, "pest-log");
    const logBoard = holoPanel(g, 0.52, 0.36, 2.1, 1.65, 1.95, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,14,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5fae8a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e6f4ec"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("BUILDING LOG", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfe0cc";
      ["Door · sprinkler · jam", "Needle found · inspector", "Carts sorted"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.5 + i * 0.15)));
    }, { ry: -0.9, accent: PMTR_ACCENT });
    reg(hits, logBoard, "building-log");
    const crewBoard = holoPanel(g, 0.5, 0.34, -2.2, 1.65, 2.05, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,18,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Porter · porter", w / 2, h * 0.56);
      cx.fillText("SEIU member assistance line", w / 2, h * 0.74);
    }, { ry: 0.9, accent: 0x7fd1c9 });
    reg(hits, crewBoard, "crew-checkin-board");

    // ------------------------------------------------------------ people
    const porter = standingFigure(g, -1.5, 0.9, { ry: 2.0, cloth: 0x2f4a6a, trousers: 0x22272d, gloves: 0x6a8a3a });
    const resident = standingFigure(g, 1.2, 1.6, { ry: -2.8, cloth: 0x8a6a3a, trousers: 0x3a4148, atStation: true });
    resident.visible = false;
    const hhwBox = box(g, 0.4, 0.2, 0.3, 1.2, 0.7, 1.35, 0xb08a5a, { rough: 0.85 });
    hhwBox.visible = false;
    const inspector = standingFigure(g, 0.2, 1.9, { ry: 3.0, cloth: 0x1f2f4a, trousers: 0x1b2230, atStation: true });
    inspector.visible = false;

    let ramT = 0;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.3, 1.1, -1.3),

      onStepComplete(step) {
        if (step.id === "chute-room-walk") { latch.material = mat(0x5a626a, { rough: 0.5, metal: 0.5 }); bag.visible = false; jug.position.set(2.35, 0.05, -1.2); }
        if (step.id === "hydraulic-check") repaint(gaugeFace, signFace("1560\npsi ✓", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.26 }));
        if (step.id === "sharps-pickup") needle.visible = false;
        if (step.id === "lock-tag") myLock.visible = true;
        if (step.id === "clear-jam") jamBags.visible = false;
        if (step.id === "sort-contamination") { plasticBag.visible = false; cardboard.scale.set(1, 0.2, 1); pizza.visible = false; }
        if (step.id === "restore-disconnect") myLock.visible = false;
      },

      onInterrupt(it) {
        if (it.id === "resident-hhw") { resident.visible = true; hhwBox.visible = true; }
        if (it.id === "inspector-pests") inspector.visible = true;
      },
      onInterruptEnd(it) {
        if (it.id === "resident-hhw") {
          resident.visible = false;
          if (it.resolved === "answered") hhwBox.position.set(2.1, 1.2, -1.2);
          else hhwBox.visible = false;
        }
        if (it.id === "inspector-pests") inspector.visible = false;
      },

      animate(t, dt, session) {
        porter.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        if (session?.step?.id === "compactor-cycle" && session.holding) ramT += dt; else ramT = Math.max(0, ramT - dt);
        jamBags.position.z = 0.02 - Math.min(0.2, ramT * 0.05);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "hydraulic-check") {
          repaint(gaugeFace, signFace(`${Math.round(gg.t * 3000)}\npsi`, { bg: "#0d1c24", accent: gg.t > 0.45 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#c9f5e0", scale: 0.28 }));
        }
      },
    };
  },
};
