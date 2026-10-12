import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, lockTag, standingFigure,
  surfaceTexture, texturedMat, tileFace, stainlessFace, safetyStripeFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Meat Department Band Saw & Grinder Lockout VR — Culinary &
// Hospitality, grocery pack (gr-), station one. The back counter of a
// grocery store's meat department: the band saw that portions primals and
// the grinder that makes the case's own ground beef, both torn down for
// their between-use clean the same way a machine shop would, because the
// blade under either guard does not know the difference between a chuck
// roll and a hand. Real trade, sited generically — no store named, no
// clause number invented, the union named only as the training body it is.

const GR1_ACCENT = 0xd8232a;

export const SIM_GR_MEAT_DEPT_BAND_SAW_AND_GRINDER_LOCKOUT = {
  id: "gr-meat-dept-band-saw-and-grinder-lockout",
  index: "gr-1",
  domain: "Grocery meat department",
  trade: "Retail meat cutter",
  category: "Culinary & Hospitality",
  indoor: "shop",
  certification: "UFCW member training for retail food and meatpacking work; OSHA 29 CFR 1910.147 control of hazardous energy; OSHA 29 CFR 1910.212 machine guarding; OSHA 29 CFR 1910.138 hand protection; ANSI/ISEA 105 cut-resistance ratings; NSF/ANSI 8 commercial powered food preparation equipment; USDA inspection marks on meat and poultry",
  name: "Meat Dept Band Saw & Grinder Lockout",
  title: simTitle("Meat Dept Band Saw & Grinder Lockout"),
  tagline: "The band saw and the grinder both locked out, guarded, cleaned and proven before either one sees the case again",
  accent: GR1_ACCENT,
  accentCss: "#d8232a",
  parSeconds: 300,
  footprint: 2.7,
  badge: { id: "case-clean", name: "Case Clean", note: "Both machines torn down, cleaned and reassembled with every lock proven before power came back" },

  game: system({
    name: "Meat Room Authority",
    currency: "CUT",
    ranks: ["Wrapper", "Meat Cutter", "Lead Cutter", "Meat Manager", "Meat Room Authority Certified"],
    badges: [
      { id: "lock-first", name: "Lock First", note: "Locked the disconnect out before the guard ever came off", test: AWARD.stepClean("saw-guard-off") },
      { id: "edge-away", name: "Edge Away", note: "Never touched a mounted blade's edge directly", test: AWARD.safe },
      { id: "zero-proven", name: "Zero Proven", note: "Tested for zero energy inside the safe band every time", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-changeover", name: "Clean Changeover", note: "No corrections through the whole teardown", test: AWARD.clean },
      { id: "held-the-hold", name: "Held The Hold", note: "Never broke the sanitiser hold early", test: AWARD.unbroken },
      { id: "changeover-fast", name: "Changeover Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-blade-touch": "You touched the band blade's edge directly to feel for nicks. That edge runs the full loop between both wheels with nothing covering it once the guard is off — a folded cloth held flat against the flat of the blade tells you everything a fingertip would, without an edge anywhere near your skin.",
    "spare-blade-bare": "That spare band blade is coiled on the hook with no sheath over its edge. A band blade has no dull side to carry it by — it goes up in its guard or it does not come off that hook bare-handed at all, whatever is waiting on the saw.",
    "override-bypass": "That switch is the guard interlock's manual override, wired in for a mechanic's bench test — not a between-use clean. Flipping it lets the wheel housing sit open while the motor can still be told to run, which defeats the one thing standing between this blade and the hand reaching in to wipe it down.",
    "wrong-disconnect": "That is the walk-in condenser's own disconnect, not the saw's — the two boxes sit side by side on this wall and look almost identical. Locking out the wrong one leaves the band saw's motor fully live while your hands are inside the wheel housing; the tag in your hand has to match the machine you are standing at, every single time.",
  },

  lateNotes: {
    "saw-guard": "Not yet — the disconnect gets locked and tested dead before that guard is touched at all.",
    "saw-blade": "Glove on, and only once the guard is already on the tray. The blade never comes off a live wheel.",
    "grinder-guard": "The grinder's own cord gets locked first — the feed pan and worm come off a dead machine, not a running one somebody forgot to unplug.",
  },

  steps: [
    {
      id: "cutting-ticket", kind: "select", target: "cut-ticket",
      title: "Read the changeover ticket",
      cue: "Check what the case needs next and confirm both machines are between runs, not mid-cut.",
      why: "The ticket says what is coming off the saw and into the grinder next, and confirming both machines are actually stopped before touching either one is the first fact this whole teardown depends on — starting a lockout on a saw that is still finishing a cut is how a hand ends up where a blade already is.",
    },
    {
      id: "don-ppe", kind: "sequence",
      targets: ["mesh-glove", "belly-guard"],
      itemNames: { "mesh-glove": "cut-resistant mesh glove", "belly-guard": "chain-mail belly guard" },
      title: "Glove and guard up",
      cue: "Pull on the mesh glove, then buckle the belly guard over it — in that order.",
      why: "ANSI/ISEA 105 rates the mesh glove for exactly this job, and OSHA 29 CFR 1910.138 is why it goes on before anything else — the belly guard buckles over the glove's cuff, not under it, so a slipped blade meets the guard before it ever reaches the wrist the glove stops at.",
      outOfOrderNote: "Wrong order — the glove goes on first, then the belly guard buckles over its cuff, not the other way around.",
    },
    {
      id: "saw-lockout", kind: "select", target: "saw-disconnect",
      title: "Lock out the band saw's disconnect",
      cue: "Open the band saw's own disconnect switch and clip your padlock through it.",
      why: "OSHA 29 CFR 1910.147 asks for one thing before any guard comes off a powered machine: the energy source isolated and locked by the person about to work on it. This switch is wired to the saw alone, so your lock here — and nowhere else — is what keeps that motor from being told to run while your hands are inside it.",
    },
    {
      id: "verify-saw-dead", kind: "gauge", target: "voltage-tester",
      title: "Test the motor leads for zero energy",
      cue: "Touch the non-contact tester to the motor leads and commit once it reads dead.",
      why: "A locked switch is a promise, not a proof — the tester is what actually confirms the promise held. OSHA 1910.147 calls this the try step for a reason: a breaker that was mislabelled, or a lock clipped on the wrong hasp, only shows up here, before the guard comes off, not after.",
      gauge: { label: "MOTOR LEAD VOLTAGE", speed: 0.7, green: [0.0, 0.14], readout: (t) => `${Math.round(t * 140)} V`, missNote: "Still reading live — do not touch the guard. Recheck the lock before this goes any further." },
    },
    {
      id: "saw-guard-off", kind: "drag", target: "saw-guard",
      title: "Remove the wheel guard",
      cue: "Lift the upper wheel guard clear and set it on the parts tray.",
      why: "The guard comes off only after the saw is proven dead — reaching for it before that tests a hope, not a lock. Off, it goes straight onto the tray in the order it will go back on, so reassembly starts from a sequence instead of a guess.",
      drag: { to: "parts-tray", radius: 0.32, missNote: "Not on the tray — set the guard down where the rest of the teardown lands, in order." },
    },
    {
      id: "saw-blade-off", kind: "drag", target: "saw-blade",
      title: "Slip the band blade off the wheels",
      cue: "Release the tension handle and draw the blade off both wheels onto the tray.",
      why: "The blade rides both wheels under real tension, and it comes off only once that tension is released and the guard is already clear — pulling a tensioned blade off a wheel with a hand still inside the housing is exactly the motion this whole lockout exists to prevent.",
      drag: { to: "parts-tray", radius: 0.32, missNote: "Not on the tray — the blade coils flat where the rest of the parts are, not wherever there was room." },
    },
    {
      id: "saw-walk", kind: "find", noHint: true,
      targets: ["residue-buildup", "loose-insert-screw"],
      itemNames: { "residue-buildup": "trim residue packed behind the lower wheel guard", "loose-insert-screw": "table insert screw backed out finger-tight" },
      itemNotes: {
        "residue-buildup": "Trim has packed in behind the lower wheel guard where the blade path passes through it. Product left to build up there is exactly what turns into bacterial harbourage the case's own inspection is checking for.",
        "loose-insert-screw": "The table insert's retaining screw is backed out to finger-tight. A table insert that can lift under a cut is a snag waiting for the next primal pushed across it.",
      },
      decoyNotes: { "clean-motor-housing": "The motor housing is clean and dry, screws seated. Leave it." },
      title: "Walk the saw before it goes back together",
      cue: "Two things on this machine are wrong. Find them before reassembly starts.",
      why: "The teardown is not finished when the guard and blade are off — it is finished when the machine underneath them is checked, not just wiped. Two things left wrong here become the next shift's surprise, or the health inspector's.",
    },
    {
      id: "sanitize-saw", kind: "hold", target: "sani-spray", seconds: 8,
      title: "Sanitise the table, guides and wheel wells",
      cue: "Spray the food-contact surfaces and hold for the full labelled contact time.",
      why: "NSF/ANSI 8 governs this machine as food-contact equipment for a reason — whatever rode the last cut across this table is what the next customer's dinner touches if it is not actually killed, and a sanitiser only earns that claim over its full contact time, not the time it takes to feel done.",
      holdBreakNote: "Wiped it off early. Hold the full labelled contact time — a fast pass moves the soil around instead of killing what is on it.",
    },
    {
      id: "saw-blade-on", kind: "drag", target: "saw-blade",
      title: "Seat the band blade back on the wheels",
      cue: "Return the blade from the tray onto both wheels and tension it true.",
      why: "Reassembly runs the teardown in reverse for a reason: a blade forced onto the wheels before the guard is anywhere near ready can walk off-track under tension, and a blade that walks under load is one nobody wants to be standing beside.",
      drag: { to: "saw-wheels", radius: 0.32, missNote: "Not seated on the wheels — track the blade centred before it takes any tension at all." },
    },
    {
      id: "saw-guard-on", kind: "drag", target: "saw-guard",
      title: "Reseat the wheel guard",
      cue: "Set the guard back over the wheel housing and seat it flush.",
      why: "A guard that looks back in place and a guard that is actually seated are not the same thing — it has to sit flush against the housing so the interlock behind it can even close, which is what the next step is there to prove.",
      drag: { to: "saw-body", radius: 0.32, missNote: "Not fully seated — the guard has to sit flush against the housing before the interlock behind it can close." },
    },
    {
      id: "saw-interlock-test", kind: "select", target: "saw-test-switch",
      title: "Prove the guard interlock",
      cue: "Bump the test switch with the guard seated and confirm the motor is live only now.",
      why: "The interlock should have kept this saw from running the entire time the guard was off, and testing it after reassembly — guard seated, before your lock comes off — is the only way to know it still does that job before this machine sees a primal again.",
    },
    {
      id: "grinder-lockout", kind: "select", target: "grinder-cord-lock",
      title: "Unplug the grinder and lock the cord out",
      cue: "Pull the grinder's plug and clip your padlock through the cord-lockout device.",
      why: "The grinder gets its own lock on its own cord, separate from the saw — a device with a single auger and a knife spinning at the bottom of an open hopper does not get a hand near it on a hope that somebody else already unplugged it.",
    },
    {
      id: "grinder-guard-off", kind: "drag", target: "grinder-guard",
      title: "Remove the grinder's feed pan and stomper guard",
      cue: "Lift the feed pan and stomper guard clear and set them on the parts tray.",
      why: "The feed pan sits directly over the worm that feeds the knife and plate, and it comes off only once the cord is out and locked — the same promise the saw's own lockout just made, sized for a machine you feed by hand instead of a blade you guide by eye.",
      drag: { to: "parts-tray", radius: 0.3, missNote: "Not on the tray — the feed pan and stomper guard go down with the rest of the teardown, in reach for reassembly." },
    },
    {
      id: "release-locks", kind: "select", target: "your-locks",
      title: "Remove your locks",
      cue: "Take both of your padlocks off the lock board now that each machine is proven and reassembled.",
      why: "Your locks, your call — nobody else takes them off, and neither comes off until its own machine is fully back together and proven. Pulling either one early hands live power back to a machine somebody else might still have a hand inside.",
    },
    {
      id: "sign-log", kind: "select", target: "changeover-log",
      title: "Sign the changeover log",
      cue: "Sign the log to close out the between-use clean on both machines.",
      why: "The signature is the cutter taking responsibility for the whole changeover — both machines locked, both cleaned, both proven — and it is the line a manager or an inspector reads when either machine's history is ever questioned.",
    },
  ],

  interrupts: [
    {
      id: "colleague-reflip",
      kind: "Lockout not seen",
      after: "sanitize-saw", delay: 4, seconds: 13,
      alert: "A second cutter has walked up to the saw's disconnect box, reaching to flip it back on for the next order — they have not clocked your lock.",
      cue: "Your hand is inside the wheel housing and somebody is about to give this saw power.",
      target: "saw-disconnect",
      why: "Your lock on that switch is the entire reason it is safe to have a hand inside this housing right now, and it only works if the next person reaching for it sees it first. Stop them and point at the lock — the next order waits; the hand inside the guard does not get to find out the lock wasn't actually seen.",
      missNote: "They flipped the switch with your hand still inside the wheel housing. The lock was doing its job right up until somebody didn't look for it first — a disconnect lockout only protects the person who makes sure it gets noticed.",
      wrongNote: "It's the saw's disconnect — get their hand off it and make sure they see your lock before anything else happens.",
    },
    {
      id: "cart-into-hopper",
      kind: "Product headed for an open machine",
      after: "grinder-guard-off", delay: 3, seconds: 12,
      alert: "A stock clerk has wheeled a cart of trim scraps up to the grinder and is about to tip it straight into the open hopper.",
      cue: "That hopper has no feed pan on it and no proof this grinder is even locked out to anyone but you.",
      target: "grinder-cord-lock",
      why: "An open hopper with the guard sitting on a tray looks, to anyone who has not been standing here for the last two minutes, like a machine that is simply between batches. Pointing them at the lock is what tells them otherwise before a scoop of trim goes in on top of a teardown that is not finished.",
      missNote: "The trim went into the open hopper before the grinder was proven, guarded or reassembled. Whatever was in that scoop is now mixed into a machine somebody else believed was ready — because nothing here told them it wasn't.",
      wrongNote: "It's the grinder's cord lock — stop the cart and point at it before anything goes into that hopper.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, GR1_ACCENT);

    // Floor: white quarry-style tile, the meat department's own hard surface.
    const floorTex = surfaceTexture(
      (cx, w, h) => tileFace(cx, w, h, { tiles: 6, tile: 0xd8dee2, grout: "#9aa2a7" }),
      { repeat: 6, px: 512 });
    const floor = box(g, 6.6, 0.1, 5.8, 0, 0.05, 0, 0xd8dee2, { rough: 0.5, metal: 0.08 });
    floor.material = texturedMat(floorTex, { rough: 0.5, metal: 0.08, color: 0xd8dee2 });

    // Back wall: brushed stainless behind the equipment line.
    const stainlessTex = surfaceTexture((cx, w, h) => stainlessFace(cx, w, h, {}), { repeat: 3, px: 512 });
    const backWall = box(g, 6.6, 2.6, 0.1, 0, 1.3, -2.5, 0xc9d0d6, { rough: 0.35, metal: 0.6 });
    backWall.material = texturedMat(stainlessTex, { rough: 0.3, metal: 0.65, color: 0xc9d0d6 });

    // Safety-stripe hazard band on the floor along the machine line.
    const stripeTex = surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 3, px: 256 });
    const stripe = slab(g, 4.2, 0.005, 0.3, 0, 0.006, -1.55, 0xf2c14b, { radius: 0.0, rough: 0.7, cast: false });
    stripe.material = texturedMat(stripeTex, { rough: 0.75, color: 0xf2c14b });

    // ------------------------------------------------------------ band saw
    const saw = group(g, -1.4, 0, -1.7);
    const sawBase = box(saw, 0.7, 0.85, 0.6, 0, 0.42, 0, 0x9aa1a8, { rough: 0.4, metal: 0.65 });
    void sawBase;
    hits["saw-body"] = saw;
    const sawColumn = box(saw, 0.16, 1.35, 0.16, -0.1, 1.5, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    void sawColumn;
    // Upper and lower wheel housings.
    const lowerWheelHousing = cyl(saw, 0.32, 0.32, 0.16, 0, 0.85, 0, 0xc9d0d6, { rough: 0.35, metal: 0.7, seg: 22 });
    void lowerWheelHousing;
    const upperWheelHousing = cyl(saw, 0.32, 0.32, 0.16, 0, 2.15, 0, 0xc9d0d6, { rough: 0.35, metal: 0.7, seg: 22 });
    void upperWheelHousing;
    // Blade — a long vertical loop, drawn as two wheels plus a flat ribbon.
    const bladeGroup = group(saw, 0, 1.5, 0.16);
    const bladeRibbon = box(bladeGroup, 0.012, 1.3, 0.004, 0, 0, 0, 0xdfe4e8, { rough: 0.15, metal: 0.85 });
    reg(hits, bladeGroup, "saw-blade");
    void bladeRibbon;
    const bladeEdgeSpot = torus(bladeGroup, 0.012, 0.004, 0, 0.65, 0, 0xf4f7fa, { rough: 0.1, metal: 0.95, seg: 6, seg2: 16 });
    bladeEdgeSpot.rotation.x = Math.PI / 2;
    reg(hits, bladeEdgeSpot, "bare-blade-touch");
    hits["saw-wheels"] = bladeGroup;
    // Guard — the removable wheel cover over the upper housing and blade run.
    const sawGuard = group(saw, 0, 1.5, 0.2);
    box(sawGuard, 0.5, 1.3, 0.1, 0, 0, 0, 0xf2c14b, { rough: 0.4, metal: 0.4 });
    reg(hits, sawGuard, "saw-guard");
    // Table and thickness/tilt gauge.
    const sawTable = slab(saw, 0.55, 0.04, 0.5, 0, 1.05, 0.05, 0xdfe4e8, { radius: 0.01, rough: 0.25, metal: 0.8 });
    void sawTable;
    const insertScrew = ball(saw, 0.01, 0.15, 1.075, 0.05, 0xb8402f, { rough: 0.4, metal: 0.6, seg: 10 });
    reg(hits, insertScrew, "loose-insert-screw");
    // Residue build-up behind the lower wheel guard.
    const residue = box(saw, 0.14, 0.05, 0.1, 0, 0.7, -0.14, 0x5a4530, { rough: 0.95 });
    reg(hits, residue, "residue-buildup");
    // Motor housing beneath the base — the walk's clean decoy.
    const motorHousing = box(saw, 0.4, 0.24, 0.3, 0, 0.14, -0.02, 0x3c444c, { rough: 0.4, metal: 0.6 });
    reg(hits, motorHousing, "clean-motor-housing");
    holoTag(saw, "Band saw", 0, 2.5, 0, { css: "#d8232a", w: 0.28 });

    // Manual guard-interlock override, red, beside the upper housing.
    const overrideSw = group(saw, 0.22, 1.9, 0.2);
    box(overrideSw, 0.03, 0.06, 0.02, 0, 0, 0, 0xb8402f, { rough: 0.5 });
    decal(overrideSw, 0.09, 0.02, 0, 0.05, 0.011, signFace("OVERRIDE", { bg: "#2a1416", accent: "#f0645b", scale: 0.55 }));
    reg(hits, overrideSw, "override-bypass");

    // Disconnect box and the wrong-disconnect decoy (walk-in condenser) beside it.
    const sawDisc = group(g, -1.9, 0, -2.35);
    box(sawDisc, 0.18, 0.28, 0.09, 0, 1.3, 0, 0xe4e8ea, { rough: 0.4, metal: 0.5 });
    box(sawDisc, 0.09, 0.14, 0.02, 0, 1.3, 0.05, 0xf2c14b, { rough: 0.5 });
    decal(sawDisc, 0.16, 0.05, 0, 1.46, 0.05, signFace("SAW", { bg: "#1a1e22", accent: "#d8232a", scale: 0.55 }));
    reg(hits, sawDisc, "saw-disconnect");
    const wrongDisc = group(g, -1.6, 0, -2.35);
    box(wrongDisc, 0.18, 0.28, 0.09, 0, 1.3, 0, 0xe4e8ea, { rough: 0.4, metal: 0.5 });
    box(wrongDisc, 0.09, 0.14, 0.02, 0, 1.3, 0.05, 0xf2c14b, { rough: 0.5 });
    decal(wrongDisc, 0.16, 0.05, 0, 1.46, 0.05, signFace("COND", { bg: "#1a1e22", accent: "#f2c14b", scale: 0.5 }));
    holoTag(wrongDisc, "walk-in condenser", 0, 1.58, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, wrongDisc, "wrong-disconnect");
    const sawPadlock = lockTag(sawDisc, 0.09, 1.22, 0.02, { color: 0xd8232a });
    sawPadlock.visible = false;

    // Test switch pendant near the saw.
    const testPendant = group(g, -1.1, 0, -2.3);
    box(testPendant, 0.24, 0.32, 0.09, 0, 1.15, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const testSw = group(testPendant, 0, 1.24, 0.05);
    cyl(testSw, 0.026, 0.026, 0.014, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    box(testSw, 0.015, 0.04, 0.015, 0, 0.014, 0.01, 0x59c97b, { rough: 0.45 });
    decal(testSw, 0.09, 0.022, 0, 0.04, 0.01, signFace("TEST", { bg: "#22262b", accent: "#59c97b", scale: 0.55 }));
    reg(hits, testSw, "saw-test-switch");

    // ------------------------------------------------------------- grinder
    const grinder = group(g, 0.7, 0, -1.9);
    box(grinder, 0.4, 0.7, 0.36, 0, 0.35, 0, 0xc9d0d6, { rough: 0.35, metal: 0.7 });
    const grinderHead = cyl(grinder, 0.12, 0.14, 0.34, 0.05, 0.62, 0.14, 0xdfe4e8, { rough: 0.25, metal: 0.8, seg: 18 });
    grinderHead.rotation.z = Math.PI / 2.4;
    const hopper = cyl(grinder, 0.13, 0.09, 0.16, -0.02, 0.86, 0.06, 0xdfe4e8, { rough: 0.25, metal: 0.75, seg: 16 });
    void hopper;
    holoTag(grinder, "Meat grinder", 0, 1.05, 0, { css: "#d8232a", w: 0.3 });
    // Feed pan / stomper guard over the hopper — removable.
    const grinderGuard = group(grinder, -0.02, 0.9, 0.06);
    slab(grinderGuard, 0.28, 0.02, 0.24, 0, 0, 0, 0xf2c14b, { radius: 0.05, rough: 0.4, metal: 0.4 });
    reg(hits, grinderGuard, "grinder-guard");
    // Grinder cord, plug and cord-lockout device with padlock.
    const grinderCord = group(grinder, 0.24, 0.3, -0.16);
    box(grinderCord, 0.05, 0.03, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.5 });
    box(grinderCord, 0.06, 0.04, 0.02, 0, -0.045, 0, 0xf2c14b, { rough: 0.5 });
    reg(hits, grinderCord, "grinder-cord-lock");
    const grinderPadlock = lockTag(grinderCord, 0, -0.09, 0.01, { color: 0xd8232a });
    grinderPadlock.visible = false;

    // ---------------------------------------------------------- prep bench
    const bench = group(g, 1.9, 0, -0.6);
    const benchTop = box(bench, 1.4, 0.06, 0.75, 0, 0.9, 0, 0xc9d0d6, { radius: 0.01, rough: 0.35, metal: 0.7 });
    benchTop.material = texturedMat(stainlessTex, { rough: 0.3, metal: 0.7, color: 0xc9d0d6 });
    for (const lx of [-0.62, 0.62]) box(bench, 0.06, 0.86, 0.7, lx, 0.47, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const voltTester = instrument(bench, -0.4, 0.94, 0.15, { idle: "-- V", color: 0xf2c14b, w: 0.14, d: 0.2 });
    holoTag(voltTester, "voltage tester", 0, 0.16, 0, { css: "#d8232a", w: 0.32 });
    reg(hits, voltTester, "voltage-tester");
    const saniSpray = group(bench, 0, 0.94, 0.2);
    cyl(saniSpray, 0.032, 0.035, 0.16, 0, 0.08, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.85, seg: 14 });
    box(saniSpray, 0.026, 0.045, 0.045, 0, 0.17, 0.01, 0x59c97b, { rough: 0.5 });
    holoTag(saniSpray, "sanitiser spray", 0, 0.24, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, saniSpray, "sani-spray");
    const tray = box(bench, 0.6, 0.03, 0.4, 0.45, 0.92, -0.08, 0x9aa1a8, { rough: 0.4, metal: 0.6 });
    hits["parts-tray"] = tray;
    holoTag(bench, "Parts tray", 0.45, 1.06, -0.08, { css: "#d8232a", w: 0.26 });

    const cutTicket = holoPanel(g, 0.5, 0.36, -2.4, 1.5, 0.4, (ctx, w, h) => {
      ctx.fillStyle = "#241008"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#d8232a"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffdccc"; ctx.fillText("CHANGEOVER TICKET", w * 0.08, h * 0.18);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; ctx.fillStyle = "#fff0e8";
      ["Next: chuck primals", "Grind: 80/20 case fill", "Both machines: between runs"].forEach((l, i) => ctx.fillText(l, w * 0.08, h * (0.36 + i * 0.15)));
    }, { accent: GR1_ACCENT });
    reg(hits, cutTicket, "cut-ticket");

    // PPE hooks: mesh glove and belly guard.
    const ppeHooks = group(g, -2.4, 0, -0.4);
    box(ppeHooks, 0.02, 0.9, 0.02, 0, 0.9, 0, 0x8b929a, { rough: 0.5, metal: 0.5, cast: false });
    const meshGlove = ball(ppeHooks, 0.06, 0, 0.76, 0, 0xb9c0c6, { rough: 0.4, metal: 0.6, seg: 12 });
    for (let i = 0; i < 4; i++) cyl(ppeHooks, 0.011, 0.011, 0.05, -0.03 + i * 0.02, 0.7, 0, 0xb9c0c6, { rough: 0.4, metal: 0.5, seg: 8 });
    holoTag(ppeHooks, "mesh glove", 0, 0.66, 0.06, { css: "#d8232a", w: 0.3 });
    reg(hits, meshGlove, "mesh-glove");
    const bellyGuard = box(ppeHooks, 0.22, 0.3, 0.03, 0, 0.45, 0, 0xd8dee2, { rough: 0.5, metal: 0.5 });
    holoTag(ppeHooks, "belly guard", 0, 0.62, 0, { css: "#d8232a", w: 0.3 });
    reg(hits, bellyGuard, "belly-guard");

    // Spare band blade, coiled and bare, on a wall hook.
    const spareHook = group(g, -2.4, 0, -1.3);
    box(spareHook, 0.02, 0.04, 0.02, 0, 1.4, 0, 0x8b929a, { rough: 0.5, metal: 0.6, cast: false });
    const spareBlade = torus(spareHook, 0.16, 0.006, 0, 1.2, 0, 0xdfe4e8, { rough: 0.15, metal: 0.85, seg: 8, seg2: 24 });
    holoTag(spareHook, "spare blade — no sheath", 0, 1.42, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, spareBlade, "spare-blade-bare");

    // Lock board — the cutter's own two personal padlocks.
    const lockBoard = group(g, -2.4, 0, -2.0);
    box(lockBoard, 0.36, 0.28, 0.03, 0, 1.15, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const boardLockA = lockTag(lockBoard, -0.1, 1.1, 0.02, { color: 0xd8232a });
    const boardLockB = lockTag(lockBoard, 0.1, 1.1, 0.02, { color: 0xd8232a });
    boardLockA.visible = false; boardLockB.visible = false;
    holoTag(lockBoard, "your locks", 0, 1.32, 0, { css: "#d8232a", w: 0.3 });
    reg(hits, lockBoard, "your-locks");

    // Changeover log clipboard.
    const changeLog = group(g, 2.6, 0, -1.6);
    slab(changeLog, 0.22, 0.02, 0.3, 0, 0.92, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(changeLog, 0.18, 0.24, 0, 0.93, 0.151, signFace("CHANGEOVER LOG", { bg: "#f4ecda", fg: "#241a08", accent: "#b8402f", scale: 0.42 })).rotation.x = -Math.PI / 2;
    holoTag(changeLog, "changeover log", 0, 1.1, 0, { css: "#d8232a", w: 0.34 });
    reg(hits, changeLog, "changeover-log");

    // Wire shelving of wrapped case product behind the bench.
    const wireShelf = group(g, 2.5, 0, -0.2, 0.3);
    for (let s = 0; s < 3; s++) box(wireShelf, 0.7, 0.02, 0.4, 0, 0.35 + s * 0.42, 0, 0x9aa1a8, { rough: 0.4, metal: 0.7 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(wireShelf, 0.014, 0.014, 1.3, sx * 0.32, 0.68, sz * 0.16, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 8 });
    const boxColours = [0xe8dcc0, 0xd9524a, 0xc9a86a, 0xe8dcc0];
    boxColours.forEach((c, i) => box(wireShelf, 0.28, 0.16, 0.3, -0.2 + (i % 2) * 0.4, 0.42 + Math.floor(i / 2) * 0.42, 0, c, { rough: 0.6, opacity: 0.85 }));
    holoTag(wireShelf, "Case product shelf", 0, 1.3, 0, { css: "#d8232a", w: 0.4 });

    // Hand sink and pegboard, the rest of a real cutting room.
    const handSink = group(g, -2.6, 0, 1.1, Math.PI / 2);
    box(handSink, 0.4, 0.3, 0.34, 0, 0.75, 0, 0x9aa1a8, { rough: 0.3, metal: 0.75 });
    box(handSink, 0.34, 0.02, 0.28, 0, 0.9, 0, 0x8b929a, { rough: 0.25, metal: 0.8 });
    cyl(handSink, 0.012, 0.012, 0.22, 0, 1.02, -0.1, CITY.steel, { rough: 0.2, metal: 0.9, seg: 10 });
    decal(handSink, 0.34, 0.1, 0, 1.2, 0.02, signFace("HANDWASH ONLY", { bg: "#1d3b63", accent: "#6cc6f0", scale: 0.45 }));
    const pegboard = group(g, -2.6, 0, 0.7, Math.PI / 2);
    box(pegboard, 0.5, 0.4, 0.02, 0, 1.35, 0, 0x8b929a, { rough: 0.6, metal: 0.3 });
    for (let i = 0; i < 3; i++) {
      cyl(pegboard, 0.008, 0.008, 0.26, -0.16 + i * 0.16, 1.25, 0.03, 0xdfe4e8, { rough: 0.3, metal: 0.5, seg: 6 }).rotation.x = Math.PI / 2.4;
    }

    // Floor drain and waste bin.
    const drain = group(g, 0.4, 0, 1.3);
    cyl(drain, 0.14, 0.14, 0.01, 0, 0.006, 0, 0x2b2f34, { rough: 0.7, metal: 0.4, seg: 16 });
    for (let i = -3; i <= 3; i++) box(drain, 0.24, 0.004, 0.012, 0, 0.012, i * 0.03, 0x14171a, { cast: false, receive: false });
    const wasteBin = group(g, 2.2, 0, 1.2);
    cyl(wasteBin, 0.16, 0.13, 0.42, 0, 0.21, 0, 0x2b3138, { rough: 0.6, metal: 0.3, seg: 16 });

    // Anti-fatigue mat in front of the machine line.
    slab(g, 2.6, 0.02, 0.7, 0, 0.011, -0.9, 0x22262b, { radius: 0.04, rough: 0.95, cast: false });

    // The cutter, clear of every control, plus a second figure (colleague)
    // and a stock cart hidden until their interrupts fire.
    const cutter = standingFigure(g, 0, 0.9, { ry: Math.PI, cloth: 0xe4e8ea, outfit: "kitchen" });
    holoTag(cutter, "meat cutter", 0, 1.9, 0, { css: "#d8232a", w: 0.3 });

    const colleague = group(g, -1.4, 0, -0.4);
    standingFigure(colleague, 0, 0, { ry: -0.6, cloth: 0xdfe4e8, outfit: "kitchen" });
    colleague.visible = false;

    const cart = group(g, 3.0, 0, 0.6);
    box(cart, 0.5, 0.4, 0.5, 0, 0.3, 0, 0x6b7278, { rough: 0.5, metal: 0.5 });
    box(cart, 0.46, 0.1, 0.46, 0, 0.52, 0, 0xd98a6a, { rough: 0.8 });
    for (const [cx2, cz2] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) {
      cyl(cart, 0.05, 0.05, 0.04, cx2, 0.05, cz2, 0x22262b, { rough: 0.8, seg: 10 });
    }
    holoTag(cart, "trim cart", 0, 0.66, 0, { css: "#f0645b", w: 0.3 });
    cart.visible = false;

    const arcSpark = particles(g, 16, 0xbfe9ff, { size: 0.014, life: 0.25 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "saw-lockout") sawPadlock.visible = true;
        if (step.id === "saw-guard-off") { sawGuard.parent.remove(sawGuard); tray.parent.add(sawGuard); sawGuard.position.set(0.45, 1.05, -0.28); }
        if (step.id === "saw-blade-off") { bladeGroup.parent.remove(bladeGroup); tray.parent.add(bladeGroup); bladeGroup.position.set(0.35, 0.98, 0.02); }
        if (step.id === "saw-blade-on") { bladeGroup.parent.remove(bladeGroup); saw.add(bladeGroup); bladeGroup.position.set(0, 1.5, 0.16); }
        if (step.id === "saw-guard-on") { sawGuard.parent.remove(sawGuard); saw.add(sawGuard); sawGuard.position.set(0, 1.5, 0.2); }
        if (step.id === "grinder-lockout") grinderPadlock.visible = true;
        if (step.id === "grinder-guard-off") { grinderGuard.parent.remove(grinderGuard); tray.parent.add(grinderGuard); grinderGuard.position.set(0.55, 0.98, 0.08); }
        if (step.id === "release-locks") { sawPadlock.visible = false; grinderPadlock.visible = false; boardLockA.visible = true; boardLockB.visible = true; }
        if (step.id === "saw-walk") { residue.material = mat(0xd8232a, { rough: 0.6 }); insertScrew.material = mat(0x59c97b, { rough: 0.4, metal: 0.6 }); }
      },

      onInterrupt(it) {
        if (it.id === "colleague-reflip") colleague.visible = true;
        if (it.id === "cart-into-hopper") { cart.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "colleague-reflip") colleague.visible = false;
        if (it.id === "cart-into-hopper") { cart.visible = false; cart.position.set(3.0, 0, 0.6); }
      },
      onHazard() {},

      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "verify-saw-dead") {
          repaint(voltTester.userData.screen, signFace(`${Math.round(gg.t * 140)} V`, { bg: "#1c1408", accent: gg.t <= 0.14 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.6 }));
        }
        if (session?.activeInterrupt?.id === "cart-into-hopper") {
          cart.position.x = Math.max(1.3, 3.0 - t % 8 * 0.2);
        }
        if (session?.step?.id === "saw-interlock-test" && !session.finished) {
          arcSpark.visible = Math.floor(t * 3) % 2 === 0;
          if (arcSpark.visible) arcSpark.userData.step(dt, new THREE.Vector3(-1.4, 2.2, -1.5), 0.04, 0.6, -1.2);
        } else arcSpark.visible = false;
      },
    };
  },
};
