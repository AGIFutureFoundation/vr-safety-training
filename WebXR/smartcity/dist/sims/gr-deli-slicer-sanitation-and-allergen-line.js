import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, lockTag, standingFigure,
  surfaceTexture, texturedMat, tileFace, stainlessFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Deli Slicer Sanitation & Allergen Line VR — Culinary &
// Hospitality, grocery pack (gr-), station two. A grocery deli counter's
// slicer between a declared-allergen product and the next order that has
// none of it in it: a lockout and clean like any powered slicer gets, plus
// the allergen line's own proof — a swab reading, not a look, before the
// board is called clean for the next customer's sandwich. Real trade, sited
// generically; no clause invented, the union named only as a training body.

const GR2_ACCENT = 0x8a3fd1;

export const SIM_GR_DELI_SLICER_SANITATION_AND_ALLERGEN_LINE = {
  id: "gr-deli-slicer-sanitation-and-allergen-line",
  index: "gr-2",
  domain: "Grocery deli department",
  trade: "Deli clerk",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  certification: "UFCW member training for retail food work; NSF/ANSI 8 commercial powered food preparation equipment; OSHA 29 CFR 1910.147 control of hazardous energy; OSHA 29 CFR 1910.138 hand protection; ANSI/ISEA 105 cut-resistance ratings; FDA Food Code; FDA 21 CFR 101 food labeling and the major food allergens; California Retail Food Code; ServSafe Food Protection Manager",
  name: "Deli Slicer Sanitation & Allergen Line",
  title: simTitle("Deli Slicer Sanitation & Allergen Line"),
  tagline: "The slicer locked, torn down, cleaned and swab-proven clean between a declared allergen and the next order, with the line's own placard flipped to match",
  accent: GR2_ACCENT,
  accentCss: "#8a3fd1",
  parSeconds: 270,
  footprint: 2.3,
  badge: { id: "line-proven", name: "Line Proven", note: "A full allergen changeover with the swab reading clean before the placard ever flipped back" },

  game: system({
    name: "Deli Line Authority",
    currency: "SWAB",
    ranks: ["Wrapper", "Deli Clerk", "Lead Deli Clerk", "Deli Manager", "Deli Line Authority Certified"],
    badges: [
      { id: "lock-first", name: "Lock First", note: "Locked the cord out before the guard ever came off", test: AWARD.stepClean("teardown-order") },
      { id: "edge-away", name: "Edge Away", note: "Never touched the blade's edge directly", test: AWARD.safe },
      { id: "swab-clean", name: "Swab Clean", note: "Read the ATP swab inside the clean band every time", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-changeover", name: "Clean Changeover", note: "No corrections through the whole changeover", test: AWARD.clean },
      { id: "held-the-hold", name: "Held The Hold", note: "Never broke the sanitiser hold early", test: AWARD.unbroken },
      { id: "changeover-fast", name: "Changeover Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-blade-touch": "You touched the mounted blade's edge directly to check it. Gloved or not, a fingertip is never how this edge gets checked — a folded cloth held flat against the face of the blade tells you everything a touch would, without an edge anywhere near your skin.",
    "wrong-cord": "That's the panini press's cord, not the slicer's. Locking out the wrong plug leaves this blade fully live while your hands are inside the guard — the tag in your hand has to match the machine you're standing at, every time.",
    "shared-scoop": "That's the one scoop sitting between both bins — the peanut-declared salad and the one next to it with none in it. A scoop that touches one bin and then the other carries the allergen across on contact alone; each bin gets its own scoop, always, not whichever one is closest.",
    "open-bin-lid": "That bin's allergen placard is missing and its lid is off. An open, unlabelled bin next to product with none of that allergen in it is exactly how a declared ingredient ends up in an order nobody warned about.",
  },

  lateNotes: {
    "blade-guard": "Not yet — the cord comes out and gets locked before that guard is touched at all.",
    "slicer-blade": "Glove on first. The blade doesn't get wiped bare-handed, not even once.",
    "allergen-placard": "Not yet — the placard flips only once the swab reads clean, not before.",
  },

  steps: [
    {
      id: "allergen-card", kind: "select", target: "allergen-card",
      title: "Read the allergen changeover card",
      cue: "Check what's coming off this slicer and what allergen the next order declares none of.",
      why: "FDA 21 CFR 101 is why the major food allergens get named on a label at all, and the card is what tells you this changeover is a full allergen clean, not a routine wipe-down — the next customer's order depends on the difference being caught here, before the blade is even unplugged.",
    },
    {
      id: "slicer-lockout", kind: "select", target: "cord-lock",
      title: "Unplug the slicer and lock the cord out",
      cue: "Pull the plug and clip your padlock through the cord-lockout device over the prongs.",
      why: "OSHA 29 CFR 1910.147 asks for the same promise here a breaker lock makes on a panel, sized for an appliance: the plug physically cannot go back in while your padlock is through it, so nobody — including you in a hurry — reconnects power before this clean is actually finished.",
    },
    {
      id: "teardown-order", kind: "sequence",
      targets: ["blade-guard", "carriage"],
      itemNames: { "blade-guard": "blade guard", carriage: "product carriage" },
      title: "Break the slicer down in order",
      cue: "Lift the guard clear, then draw the carriage off its rail — in that order — onto the parts tray.",
      why: "The carriage rides past the edge on every pass it makes, so it comes off only after the guard is already clear and the cord is already locked — there is no version of an allergen changeover where a hand is this close to the blade on a machine that could still be told to run.",
      outOfOrderNote: "Wrong order — the guard lifts clear first, then the carriage draws off the rail behind it.",
    },
    {
      id: "glove-on", kind: "select", target: "cut-glove",
      title: "Glove the cleaning hand",
      cue: "Pull the ANSI/ISEA-rated cut-resistant glove on before your hand goes near the blade.",
      why: "Locking the cord out stops the blade from moving; it does not stop the blade from being a blade. OSHA 29 CFR 1910.138 is why the rated glove goes on for the one part of this changeover where a hand actually has to be beside the edge.",
    },
    {
      id: "clean-blade", kind: "track", target: "slicer-blade", seconds: 6,
      title: "Wipe the blade edge-away",
      cue: "Fold the cloth flat and wipe outward from the centre, keeping clear of the edge, staying in the safe band.",
      why: "Every trace of the last product has to come off this blade's face before an allergen changeover means anything, and it comes off wiped away from the edge with a folded cloth — stray too close and the wipe is grazing the one part of this machine still sharp with the guard sitting on a tray.",
      track: {
        start: 0.15, green: [0.35, 0.6], rise: 0.5, fall: 0.4, drift: 0.12, label: "DISTANCE FROM EDGE",
        readout: (v) => (v < 0.35 ? "too close — grazing the edge" : v > 0.6 ? "missing the film on the face" : "clear of the edge"),
      },
      holdBreakNote: "Drifted toward the edge. Bring the wipe back out to a safe distance before continuing.",
    },
    {
      id: "sanitize-hold", kind: "hold", target: "sani-bottle", seconds: 8,
      title: "Sanitise the blade and bed, and hold contact time",
      cue: "Apply sanitiser to the blade face and slicing bed and hold for the full labelled contact time.",
      why: "The sanitiser only earns its kill claim over its full labelled contact time, not the time it takes to feel done — an allergen changeover run short on this hold is a swab reading that only looks clean because nothing has actually been proven yet.",
      holdBreakNote: "Wiped it off early. Contact time is what makes the sanitiser work — spray it again and hold the full count.",
    },
    {
      id: "allergen-swab", kind: "gauge", target: "atp-swab",
      title: "Swab the blade and bed for allergen protein",
      cue: "Run the ATP swab across the blade face and bed and commit once the reading is inside the clean band.",
      why: "A clean-looking blade and a clean blade are not the same claim — the swab is what actually proves it for an allergen changeover, the way a look never can. A reading outside the clean band means the sanitiser step gets repeated, not argued with.",
      gauge: { label: "ATP SWAB READING", speed: 0.6, green: [0.0, 0.22], readout: (t) => `${Math.round(t * 900)} RLU`, missNote: "Reading is outside the clean band — sanitise again before this line is trusted for the next order." },
    },
    {
      id: "walk-line", kind: "find", noHint: true,
      targets: ["shared-scoop", "open-bin-lid"],
      itemNames: { "shared-scoop": "one scoop resting across two bins", "open-bin-lid": "an allergen bin with its lid and placard off" },
      itemNotes: {
        "shared-scoop": "One scoop, propped across the rim of both bins. Whatever was in the last one it touched is now one dip away from the next.",
        "open-bin-lid": "This bin's lid and placard are both off. An open, unlabelled allergen bin next to product with none of that allergen in it is the exact gap this whole changeover exists to close.",
      },
      decoyNotes: { "scoop-rack": "The dedicated scoop rack is fully stocked, each scoop in its own bin's slot. Leave it." },
      title: "Walk the allergen line before it reopens",
      cue: "Two things on this line are wrong. Find them by looking.",
      why: "The changeover isn't finished when the slicer swabs clean — it's finished when the whole line around it is as clean as the blade. Two things left wrong here become the next customer's undisclosed exposure, not just a tidiness note.",
    },
    {
      id: "reassemble", kind: "sequence",
      targets: ["carriage", "blade-guard"],
      itemNames: { carriage: "product carriage", "blade-guard": "blade guard" },
      title: "Rebuild the slicer in reverse",
      cue: "Seat the carriage back on the rail, then reseat the guard over the blade — in that order.",
      why: "Reassembly runs teardown in reverse for a reason: a guard forced on before the carriage is square on its rail can bind against it, and a bound part now is a part somebody forces later under load.",
      outOfOrderNote: "Wrong order — the carriage seats on its rail first, then the guard closes over it.",
    },
    {
      id: "prove-interlock", kind: "select", target: "test-switch",
      title: "Prove the guard interlock",
      cue: "Bump the power switch with the guard seated and confirm the motor is live only now.",
      why: "The interlock is what should have kept this slicer from running the entire time the guard was off, and testing it after reassembly — guard seated, before the lock comes off — is the only way to know it still does that job.",
    },
    {
      id: "release-lock", kind: "select", target: "cord-lock",
      title: "Remove your lock from the cord",
      cue: "Take your padlock off the cord-lockout device now that the slicer is fully reassembled and proven.",
      why: "Your lock, your call — nobody else removes it, and it comes off only once the interlock is proven and every part is back where it belongs.",
    },
    {
      id: "plug-in", kind: "drag", target: "power-plug",
      title: "Plug the slicer back in",
      cue: "Seat the plug fully into the outlet, last, after everything else is done.",
      why: "Power comes back to this machine exactly once in this whole changeover, and it's the very last thing that happens — after the guard, after the interlock test, after your own lock is off.",
      drag: { to: "outlet", radius: 0.25, missNote: "Not seated in the outlet — push the plug fully home." },
    },
    {
      id: "relabel-line", kind: "turn", target: "allergen-placard",
      title: "Flip the line's allergen placard",
      cue: "Turn the placard holder to show the correct allergen declaration for what's coming next.",
      why: "The placard is what tells the next clerk, and the customer standing at the case, what this line has and has not touched — leaving yesterday's declaration up is a wrong answer with a confident sign behind it.",
      turn: { turns: 0.5, axis: "y", label: "ALLERGEN PLACARD" },
    },
    {
      id: "sign-allergen-log", kind: "select", target: "allergen-log",
      title: "Sign the allergen changeover log",
      cue: "Sign the log to close out the allergen changeover.",
      why: "The signature is the clerk taking responsibility for the whole changeover — locked, cleaned, swabbed clean, placard flipped — and it is the record a manager reads if this line's history is ever questioned.",
    },
  ],

  interrupts: [
    {
      id: "coworker-shared-scoop",
      kind: "Cross-contact about to happen",
      after: "sanitize-hold", delay: 4, seconds: 13,
      alert: "A coworker has picked up the one scoop off the counter and is about to dip it in the peanut-declared bin, then the one right next to it.",
      cue: "That scoop is on its way to being in both bins in the same minute.",
      target: "scoop-rack",
      why: "Every bin on an allergen line gets its own scoop, every time — pointing your coworker at the dedicated rack is the only thing that stops a shared scoop from doing in one dip what your entire slicer changeover was built to prevent everywhere else.",
      missNote: "The scoop went into both bins before anyone stopped it. Whatever cross-contact your changeover just proved clean on the slicer, the bins next to it just undid with a single scoop.",
      wrongNote: "It's the dedicated scoop rack — hand them the right one before that scoop touches a second bin.",
    },
    {
      id: "second-worker-replug",
      kind: "Lockout defeated",
      after: "clean-blade", delay: 3, seconds: 11,
      alert: "A second clerk has grabbed the slicer's cord and is reaching for the outlet — a rush order just came in and they haven't clocked your lock.",
      cue: "Your hand is on the blade and somebody is about to give it power.",
      target: "cord-lock",
      why: "Your lock on that cord is the entire reason it's safe to have a hand on this blade right now, and it only works if everyone else sees it before they reach for the outlet. Stop them and point at the lock — the rush order waits.",
      missNote: "They plugged it in with your hand still at the blade. The lock was doing its job right up until somebody didn't look for it — a cord-lockout only protects the person who makes sure it gets seen.",
      wrongNote: "It's your lock on that cord — get their hand off the plug and make sure they see it before anything else happens.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, GR2_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 6, tile: 0xdfe4e8, grout: "#a6acaf" }), { repeat: 5, px: 512 });
    const floor = box(g, 6.0, 0.1, 5.2, 0, 0.05, 0, 0xdfe4e8, { rough: 0.5, metal: 0.08 });
    floor.material = texturedMat(floorTex, { rough: 0.5, metal: 0.08, color: 0xdfe4e8 });

    const steelTex = surfaceTexture((cx, w, h) => stainlessFace(cx, w, h, {}), { repeat: 3, px: 512 });

    // ------------------------------------------------------------------ bench
    const bench = group(g, 0, 0, -0.9);
    const benchTop = box(bench, 1.5, 0.06, 0.8, 0, 0.9, 0, 0xc9d0d6, { radius: 0.01, rough: 0.35, metal: 0.7 });
    benchTop.material = texturedMat(steelTex, { rough: 0.3, metal: 0.7, color: 0xc9d0d6 });
    for (const lx of [-0.65, 0.65]) box(bench, 0.06, 0.86, 0.74, lx, 0.47, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });

    // ---------------------------------------------------------------- slicer
    const slicer = group(bench, 0, 0.93, 0);
    slab(slicer, 0.6, 0.06, 0.5, 0, 0, 0, 0x8b929a, { radius: 0.02, rough: 0.4, metal: 0.7 });
    cyl(slicer, 0.14, 0.15, 0.18, -0.15, 0.14, -0.1, 0x3c444c, { rough: 0.4, metal: 0.6, seg: 20 });
    box(slicer, 0.3, 0.14, 0.28, -0.15, 0.1, -0.1, 0x3c444c, { rough: 0.4, metal: 0.6 });
    box(slicer, 0.5, 0.02, 0.14, 0.05, 0.09, 0.08, 0xdfe4e8, { rough: 0.2, metal: 0.85 });
    const rail = box(slicer, 0.46, 0.03, 0.05, 0.05, 0.11, 0.16, 0x8b929a, { rough: 0.35, metal: 0.75 });
    hits["slicer-rail"] = rail;
    hits["slicer-body"] = slicer;

    const bladeGroup = group(slicer, -0.15, 0.24, 0.02);
    cyl(bladeGroup, 0.19, 0.19, 0.012, 0, 0, 0, 0xdfe4e8, { rough: 0.12, metal: 0.9, seg: 28 }).rotation.x = Math.PI / 2;
    reg(hits, bladeGroup, "slicer-blade");
    const edgeSpot = torus(bladeGroup, 0.19, 0.006, 0, 0, 0, 0xf4f7fa, { rough: 0.1, metal: 0.95, seg: 6, seg2: 40 });
    edgeSpot.rotation.x = Math.PI / 2;
    reg(hits, edgeSpot, "bare-blade-touch");

    const guard = group(slicer, -0.15, 0.24, 0.02);
    const guardRing = torus(guard, 0.21, 0.018, 0, 0, 0, GR2_ACCENT, { rough: 0.4, metal: 0.5, seg: 8, seg2: 28 });
    guardRing.rotation.x = Math.PI / 2;
    guardRing.scale.set(1, 1, 0.55);
    reg(hits, guard, "blade-guard");

    const carriage = box(slicer, 0.16, 0.05, 0.16, 0.16, 0.13, 0.12, 0x9aa1a8, { rough: 0.35, metal: 0.7 });
    reg(hits, carriage, "carriage");
    holoTag(slicer, "Deli slicer", 0, 0.5, 0, { css: "#8a3fd1", w: 0.3 });

    const plugGroup = group(bench, 0.55, 0.6, -0.3);
    box(plugGroup, 0.05, 0.03, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.5 });
    reg(hits, plugGroup, "power-plug");
    const outlet = box(bench, 0.06, 0.09, 0.02, 0.62, 0.62, -0.4, 0xd8dde1, { rough: 0.5 });
    hits["outlet"] = outlet;
    const cordLock = group(bench, 0.55, 0.6, -0.28);
    box(cordLock, 0.06, 0.04, 0.02, 0, 0, 0, GR2_ACCENT, { rough: 0.5 });
    const padlock = lockTag(cordLock, 0, -0.05, 0.01, { color: GR2_ACCENT });
    padlock.visible = false;
    reg(hits, cordLock, "cord-lock");
    const reachHand = group(bench, 0.75, 0.62, -0.25, -0.4);
    ball(reachHand, 0.045, 0, 0, 0, 0xc99878, { rough: 0.75, seg: 12 });
    cyl(reachHand, 0.028, 0.03, 0.14, -0.09, 0, 0, 0xf2f2f2, { rough: 0.7, seg: 10 }).rotation.z = Math.PI / 2;
    reachHand.visible = false;

    const wrongCord = group(bench, 0.55, 0.55, -0.15);
    box(wrongCord, 0.05, 0.03, 0.03, 0, 0, 0, 0x3c444c, { rough: 0.4, metal: 0.4 });
    torus(wrongCord, 0.05, 0.008, 0, -0.06, -0.02, 0x22262b, { rough: 0.7, seg: 8, seg2: 16 });
    holoTag(wrongCord, "Panini press cord", 0, 0.09, 0, { css: "#f0645b", w: 0.38 });
    reg(hits, wrongCord, "wrong-cord");

    const tray = box(g, 0.6, 0.03, 0.4, -1.2, 0.6, -0.6, 0x9aa1a8, { rough: 0.4, metal: 0.6 });
    hits["parts-tray"] = tray;
    holoTag(g, "Parts tray", -1.2, 0.72, -0.6, { css: "#8a3fd1", w: 0.26 });

    const pendant = group(g, 1.0, 0, -0.7, -0.4);
    box(pendant, 0.05, 1.1, 0.05, 0, 0.55, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
    box(pendant, 0.28, 0.4, 0.1, 0, 1.15, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const testSwitch = group(pendant, 0, 1.24, 0.055);
    cyl(testSwitch, 0.028, 0.028, 0.015, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    box(testSwitch, 0.016, 0.045, 0.016, 0, 0.015, 0.01, 0x59c97b, { rough: 0.45 });
    decal(testSwitch, 0.1, 0.025, 0, 0.045, 0.01, signFace("TEST", { bg: "#22262b", accent: "#59c97b", scale: 0.55 }));
    reg(hits, testSwitch, "test-switch");

    const card = holoPanel(g, 0.5, 0.36, -1.2, 1.55, -0.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,10,28,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8a3fd1"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d9c0f2";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("ALLERGEN CHANGEOVER", w * 0.06, h * 0.15);
      ctx.fillStyle = "#f2e9fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("PEANUT → NONE DECLARED", w * 0.06, h * 0.36);
      ctx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ctx.fillStyle = "#d9c0f2";
      ["Lock the cord before the guard comes off", "Swab must read clean before reopening",
       "Flip the placard, then sign the log"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.54 + i * 0.13)));
    }, { ry: 0.4, accent: GR2_ACCENT });
    reg(hits, card, "allergen-card");

    const glove = group(g, 1.2, 0, -1.1);
    box(glove, 0.02, 0.14, 0.02, 0, 0.9, 0, 0x8b929a, { rough: 0.5, metal: 0.5, cast: false });
    ball(glove, 0.06, 0, 0.82, 0, 0x3c4a52, { rough: 0.8, seg: 12 });
    for (let i = 0; i < 4; i++) cyl(glove, 0.011, 0.011, 0.05, -0.03 + i * 0.02, 0.75, 0, 0x3c4a52, { rough: 0.8, seg: 8 });
    holoTag(glove, "Cut-resistant glove", 0, 0.66, 0, { css: "#8a3fd1", w: 0.4 });
    reg(hits, glove, "cut-glove");

    const sani = group(g, 1.35, 0, -0.35);
    cyl(sani, 0.035, 0.038, 0.18, 0, 0.15, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.85, seg: 14 });
    box(sani, 0.028, 0.05, 0.05, 0, 0.26, 0.01, 0x59c97b, { rough: 0.5 });
    holoTag(sani, "Sanitiser bottle", 0, 0.32, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, sani, "sani-bottle");

    // ATP swab instrument at the counter.
    const swab = instrument(g, 1.7, 0.9, -0.9, { idle: "-- RLU", color: GR2_ACCENT, w: 0.14, d: 0.22 });
    holoTag(swab, "ATP swab", 0, 0.16, 0, { css: "#8a3fd1", w: 0.28 });
    reg(hits, swab, "atp-swab");

    // Allergen bins: declared (peanut) and clean, with a shared scoop and an
    // open, unlabelled bin as the two find-step hazards.
    const bins = group(g, -1.7, 0, -0.5);
    const peanutBin = box(bins, 0.34, 0.22, 0.3, -0.2, 0.11, 0, 0xe8dcc0, { rough: 0.7 });
    decal(peanutBin, 0.28, 0.07, 0, 0.12, 0.151, signFace("PEANUT", { bg: "#4a1a08", accent: "#f2ae14", scale: 0.5 }));
    holoTag(peanutBin, "peanut-declared", 0, 0.3, 0, { css: "#f0645b", w: 0.4 });
    const noneBin = box(bins, 0.34, 0.22, 0.3, 0.2, 0.11, 0, 0xe8dcc0, { rough: 0.7 });
    decal(noneBin, 0.28, 0.07, 0, 0.12, 0.151, signFace("NONE DECL.", { bg: "#0d3a2a", accent: "#6fd6c9", scale: 0.45 }));
    const scoop = group(bins, 0, 0.24, 0);
    box(scoop, 0.34, 0.02, 0.05, 0, 0, 0, 0xc9d0d6, { rough: 0.4, metal: 0.6 });
    reg(hits, scoop, "shared-scoop");
    const openBin = box(bins, 0.3, 0.2, 0.28, 0.55, 0.1, -0.05, 0xe8dcc0, { rough: 0.7 });
    reg(hits, openBin, "open-bin-lid");
    const scoopRack = group(g, -1.9, 0, -1.2);
    box(scoopRack, 0.4, 0.02, 0.12, 0, 0.5, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6 });
    for (const sx of [-0.14, 0, 0.14]) box(scoopRack, 0.03, 0.16, 0.03, sx, 0.42, 0, 0xc9d0d6, { rough: 0.4, metal: 0.6 });
    holoTag(scoopRack, "dedicated scoops", 0, 0.58, 0, { css: "#59c97b", w: 0.36 });
    reg(hits, scoopRack, "scoop-rack");

    // Allergen placard — a two-sided rotating sign.
    const placard = group(g, 1.9, 0, -1.4);
    cyl(placard, 0.012, 0.012, 0.7, 0, 0.35, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    const placardFace = decal(placard, 0.36, 0.24, 0, 0.62, 0.02, signFace("PEANUT", { bg: "#4a1a08", accent: "#f2ae14", scale: 0.5 }));
    reg(hits, placard, "allergen-placard");
    placard.userData.face = placardFace;

    const allergenLog = group(g, 2.2, 0, -0.5);
    slab(allergenLog, 0.24, 0.02, 0.32, 0, 0.92, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(allergenLog, 0.2, 0.26, 0, 0.93, 0.161, signFace("ALLERGEN LOG", { bg: "#f4ecda", fg: "#241a08", accent: "#8a3fd1", scale: 0.42 })).rotation.x = -Math.PI / 2;
    holoTag(allergenLog, "allergen log", 0, 1.1, 0, { css: "#8a3fd1", w: 0.32 });
    reg(hits, allergenLog, "allergen-log");

    // Wire shelving of wrapped deli product behind the bench.
    const wireShelf = group(g, -2.3, 0, -1.1, 0.3);
    for (let s = 0; s < 3; s++) box(wireShelf, 0.7, 0.02, 0.4, 0, 0.35 + s * 0.42, 0, 0x9aa1a8, { rough: 0.4, metal: 0.7 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(wireShelf, 0.014, 0.014, 1.3, sx * 0.32, 0.68, sz * 0.16, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 8 });
    const boxColours = [0xdfe4e8, 0xe8dcc0, 0xc9a86a, 0xdfe4e8];
    boxColours.forEach((c, i) => box(wireShelf, 0.28, 0.16, 0.3, -0.2 + (i % 2) * 0.4, 0.42 + Math.floor(i / 2) * 0.42, 0, c, { rough: 0.6, opacity: 0.8 }));
    holoTag(wireShelf, "Deli supply shelf", 0, 1.3, 0, { css: "#8a3fd1", w: 0.36 });

    const handSink = group(g, -1.5, 0, -0.4, Math.PI / 2);
    box(handSink, 0.4, 0.3, 0.34, 0, 0.75, 0, 0x9aa1a8, { rough: 0.3, metal: 0.75 });
    box(handSink, 0.34, 0.02, 0.28, 0, 0.9, 0, 0x8b929a, { rough: 0.25, metal: 0.8 });
    cyl(handSink, 0.012, 0.012, 0.22, 0, 1.02, -0.1, CITY.steel, { rough: 0.2, metal: 0.9, seg: 10 });
    decal(handSink, 0.34, 0.1, 0, 1.2, 0.02, signFace("HANDWASH ONLY", { bg: "#1d3b63", accent: "#6cc6f0", scale: 0.45 }));

    const drain = group(g, 0.3, 0, 1.1);
    cyl(drain, 0.14, 0.14, 0.01, 0, 0.006, 0, 0x2b2f34, { rough: 0.7, metal: 0.4, seg: 16 });
    for (let i = -3; i <= 3; i++) box(drain, 0.24, 0.004, 0.012, 0, 0.012, i * 0.03, 0x14171a, { cast: false, receive: false });
    const wasteBinS = group(g, 1.9, 0, 0.9);
    cyl(wasteBinS, 0.16, 0.13, 0.42, 0, 0.21, 0, 0x2b3138, { rough: 0.6, metal: 0.3, seg: 16 });

    slab(g, 1.3, 0.02, 0.7, 0, 0.01, -1.35, 0x22262b, { radius: 0.04, rough: 0.95, cast: false });

    const clerk = standingFigure(g, -0.2, 1.0, { ry: 3.0, outfit: "kitchen" });
    void clerk;
    const coworker = group(g, -2.3, 0, 1.1);
    standingFigure(coworker, 0, 0, { ry: 1.2, outfit: "kitchen" });
    coworker.visible = false;

    let interlockOk = false;
    const arcSpark = particles(g, 18, 0xbfe9ff, { size: 0.014, life: 0.25 });

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.15, -0.9),

      onStepComplete(step) {
        if (step.id === "slicer-lockout") padlock.visible = true;
        if (step.id === "teardown-order") {
          guard.parent.remove(guard); tray.parent.add(guard); guard.position.set(-1.05, 0.62, -0.55);
          carriage.parent.remove(carriage); g.add(carriage); carriage.position.set(-1.35, 0.62, -0.65);
        }
        if (step.id === "reassemble") {
          carriage.parent.remove(carriage); slicer.add(carriage); carriage.position.set(0.05, 0.13, 0.12);
          guard.parent.remove(guard); slicer.add(guard); guard.position.set(-0.15, 0.24, 0.02);
        }
        if (step.id === "prove-interlock") interlockOk = true;
        if (step.id === "release-lock") padlock.visible = false;
        if (step.id === "relabel-line") repaint(placardFace, signFace("NONE DECL.", { bg: "#0d3a2a", accent: "#6fd6c9", scale: 0.5 }));
        if (step.id === "walk-line") { scoop.material = mat(GR2_ACCENT, { rough: 0.5, metal: 0.6 }); openBin.material = mat(0x59c97b, { rough: 0.7 }); }
      },

      onInterrupt(it) {
        if (it.id === "second-worker-replug") reachHand.visible = true;
        if (it.id === "coworker-shared-scoop") coworker.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "second-worker-replug") reachHand.visible = false;
        if (it.id === "coworker-shared-scoop") coworker.visible = false;
      },

      animate(t, dt, session) {
        void interlockOk;
        const gg = session?.gauge;
        const step = session?.step;
        if (gg && !gg.committed && step?.id === "allergen-swab") {
          repaint(swab.userData.screen, signFace(`${Math.round(gg.t * 900)} RLU`, { bg: "#1c1408", accent: gg.t <= 0.22 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.55 }));
        }
        if (session?.turn && step?.id === "relabel-line") placard.rotation.y = session.turn.amount * Math.PI;
        if (session?.step?.id === "prove-interlock" && !session.finished) {
          arcSpark.visible = Math.floor(t * 3) % 2 === 0;
          if (arcSpark.visible) arcSpark.userData.step(dt, new THREE.Vector3(-0.15, 1.17, -0.88), 0.04, 0.6, -1.2);
        } else arcSpark.visible = false;
      },
    };
  },
};
