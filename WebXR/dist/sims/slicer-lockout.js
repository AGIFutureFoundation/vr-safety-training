import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, standingFigure,
  surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Slicer Lockout VR — Culinary & Hospitality, station two.
// Cleaning a deli slicer between products, in the same shared kitchen as
// knife-skills and bakery-mixer (see interiors.js's "kitchen" style). A
// slicer is the one piece of kitchen equipment most kitchens actually
// energy-isolate the way a machine shop would: the cord comes out and gets
// locked before the guard ever comes off, because the blade underneath it
// does not know the difference between a tomato and a thumb.

const SLK_ACCENT = 0xd9524a;

export const SIM_SLICER_LOCKOUT = {
  id: "slicer-lockout",
  index: "102",
  domain: "Food service",
  trade: "Deli / prep cook",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  certification: "UNITE HERE Local 2 — hospitality and food service; Cal/OSHA General Industry Safety Orders; OSHA 29 CFR 1910.147 control of hazardous energy; OSHA 29 CFR 1910.138 hand protection; ANSI/ISEA 105 cut-resistance ratings; NSF/ANSI 8 commercial food slicer sanitation",
  name: "Slicer Lockout",
  title: simTitle("Slicer Lockout"),
  tagline: "Cord locked before the guard comes off, the blade cleaned gloved and edge-away, sanitiser contact time, and the interlock proven before the plug goes back in",
  accent: SLK_ACCENT,
  accentCss: "#d9524a",
  parSeconds: 235,
  footprint: 2.2,
  badge: { id: "blade-secured", name: "Blade Secured", note: "A full changeover clean with the cord locked out first and the interlock proven before power came back" },

  game: system({
    name: "Lockout Authority",
    currency: "AMP",
    ranks: ["Dish Hand", "Deli Cook", "Line Lead", "Kitchen Supervisor", "Lockout Authority Certified"],
    badges: [
      { id: "cord-first", name: "Cord First", note: "Locked the cord out before the guard ever came off", test: AWARD.stepClean("guard-off") },
      { id: "edge-away", name: "Edge Away", note: "Never touched the blade's edge directly", test: AWARD.safe },
      { id: "interlock-proven", name: "Interlock Proven", note: "Proved the guard interlock before the plug went back in", test: AWARD.stepClean("prove-interlock") },
    ],
    challenges: [
      { id: "clean-changeover", name: "Clean Changeover", note: "No corrections through the whole clean", test: AWARD.clean },
      { id: "held-the-hold", name: "Held The Hold", note: "Never broke a timed hold early", test: AWARD.unbroken },
      { id: "changeover-fast", name: "Changeover Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "spare-blade-bare": "That spare blade is sitting on the shelf with nothing over its edge. A slicer blade has no dull side to pick up by — store it in its edge guard or don't take it off the shelf bare-handed at all.",
    "bare-blade-touch": "You touched the mounted blade's edge directly. Gloved or not, a fingertip is never how this edge gets checked — a folded cloth held flat against the face of the blade tells you everything a touch would, without an edge anywhere near your skin.",
    "wrong-plug": "That's the panini press's cord, not the slicer's. Locking out the wrong plug leaves this blade fully live while your hands are inside the guard — the tag on the cord in your hand has to match the machine you're standing at, every time.",
    "override-latch": "That's the manual interlock override, and it exists for a mechanic's bench test — not a shift clean. Flipping it lets the guard sit open while the motor can still be told to run, which defeats the one thing standing between this blade and your hand.",
  },

  lateNotes: {
    "blade-guard": "Not yet — the cord comes out and gets locked before that guard is touched at all.",
    "slicer-blade": "Glove on first. The blade doesn't get wiped bare-handed, not even once.",
    "power-plug": "Not until the guard's interlock is proven and your lock is off. The last thing this procedure does is give the machine power back.",
  },

  steps: [
    {
      id: "clean-card", kind: "select", target: "clean-card",
      title: "Read the between-products cleaning card",
      cue: "Check what changed, the reassembly order, and the sanitiser's contact time.",
      why: "Federal law bars anyone under eighteen from operating or cleaning a power-driven meat or food slicer at all — U.S. DOL Hazardous Occupations Order 10 — so this card assumes an adult worker doing an adult's job, and it names the reassembly order because a slicer that goes back together wrong is a slicer with a guard that only looks closed.",
    },
    {
      id: "zero-thickness", kind: "turn", target: "thickness-dial",
      title: "Ring the thickness gauge to zero",
      cue: "Turn the thickness dial down to zero while the blade is still guarded.",
      why: "Zeroing the gauge plate closes the gap it normally holds open between the blade and the guard ring — the safest position the blade has while it's still spinning up power, and the position it should always be left in between products regardless of what happens next.",
      turn: { turns: 0.4, axis: "y", label: "THICKNESS" },
    },
    {
      id: "unplug-lock", kind: "select", target: "cord-lock",
      title: "Unplug the slicer and lock the cord out",
      cue: "Pull the plug and clip your padlock through the cord-lockout device over the prongs.",
      why: "A cord-lockout device covers the prongs so the plug physically cannot be reinserted while your padlock is through it — the same promise OSHA 1910.147 asks a breaker lock to make, sized for an appliance instead of a panel. Nobody, including you in a hurry, plugs this back in until that lock comes off.",
    },
    {
      id: "guard-off", kind: "drag", target: "blade-guard",
      title: "Remove the blade guard",
      cue: "Lift the guard ring clear of the blade and set it on the parts tray.",
      why: "The guard comes off only after the cord is out and locked — reaching for it before that is reaching toward a spinning blade with nothing standing between you and the shaft that turns it. Off, it goes straight onto the tray in the order it will go back on.",
      drag: { to: "parts-tray", radius: 0.3, missNote: "Not on the tray — set the guard down in the order it comes apart, or reassembly starts from a guess." },
    },
    {
      id: "carriage-off", kind: "drag", target: "carriage",
      title: "Slide the carriage off its rail",
      cue: "Draw the product carriage off the rail and onto the parts tray.",
      why: "The carriage rides right past the edge on every pass it makes, and it comes off the rail the same locked-out way the guard did — there is no version of this clean where the blade is still capable of moving while a hand is this close to it.",
      drag: { to: "parts-tray", radius: 0.3, missNote: "Not on the tray — the carriage goes down where the rest of the parts are, not wherever there was room." },
    },
    {
      id: "glove-on", kind: "select", target: "cut-glove",
      title: "Glove the cleaning hand",
      cue: "Pull the ANSI/ISEA A4-rated cut-resistant glove on before your hand goes near the blade.",
      why: "Locking the cord out stops the blade from moving; it does not stop the blade from being a blade. The rated glove — OSHA 1910.138 — is what actually stands between the edge and your skin for the one part of this job where your hand has to be right next to it.",
    },
    {
      id: "clean-blade", kind: "track", target: "slicer-blade", seconds: 6,
      title: "Wipe the blade edge-away",
      cue: "Fold the cloth flat and wipe outward from the centre, keeping clear of the edge, staying in the safe band.",
      why: "The blade gets cleaned by wiping away from the edge with a folded cloth held flat against the face, never dragged along it — stray too close and you're running a cloth-covered hand across the one part of this machine that's still sharp with the guard sitting on a tray six feet away.",
      track: {
        start: 0.15, green: [0.35, 0.6], rise: 0.5, fall: 0.4, drift: 0.12, label: "DISTANCE FROM EDGE",
        readout: (v) => (v < 0.35 ? "too close — grazing the edge" : v > 0.6 ? "missing the film on the face" : "clear of the edge"),
      },
      holdBreakNote: "Drifted toward the edge. Bring the wipe back out to a safe distance from the blade before continuing.",
    },
    {
      id: "sanitize-hold", kind: "hold", target: "sani-bottle", seconds: 8,
      title: "Sanitise the blade and bed, and hold contact time",
      cue: "Apply sanitiser to the blade face and slicing bed and hold for the full labelled contact time.",
      why: "Between-product sanitising is what stops the last thing sliced from riding along into the next order — allergen carryover off an unsanitised deli slicer is a real and fast route to a reaction, and the sanitiser only earns its kill claim for the full time on the label, not the time it takes to feel done.",
      holdBreakNote: "Wiped it off early. Contact time is what makes the sanitiser work — spray it again and hold the full count.",
    },
    {
      id: "carriage-on", kind: "drag", target: "carriage",
      title: "Seat the carriage back on the rail",
      cue: "Return the carriage from the parts tray to its rail.",
      why: "Reassembly runs in the reverse of teardown for a reason: a carriage forced onto a rail before the guard is in position can bind against the ring you're about to reseat, and a bound part now is a part somebody forces later under load.",
      drag: { to: "slicer-rail", radius: 0.3, missNote: "Not seated on the rail — line the carriage up square before it goes anywhere near the guard ring." },
    },
    {
      id: "guard-on", kind: "drag", target: "blade-guard",
      title: "Reseat the blade guard",
      cue: "Set the guard ring back over the blade and seat it fully against the housing.",
      why: "A guard that looks back in place and a guard that's actually seated are not the same thing — it has to sit flush against the housing so the interlock underneath it can even close. That's what the next step is for.",
      drag: { to: "slicer-body", radius: 0.3, missNote: "Not fully seated — the guard has to sit flush against the housing before the interlock behind it can close." },
    },
    {
      id: "prove-interlock", kind: "select", target: "test-switch",
      title: "Prove the guard interlock",
      cue: "Bump the power switch with the guard seated and confirm the motor is live only now.",
      why: "The interlock is what should have kept this machine from running the entire time the guard was off, and the only way to know it still does its job is to test it after reassembly, guard seated, before the lock comes off and before this slicer sees a customer's order again.",
    },
    {
      id: "release-lock", kind: "select", target: "cord-lock",
      title: "Remove your lock from the cord",
      cue: "Take your padlock off the cord-lockout device now that the machine is fully reassembled and proven.",
      why: "Your lock, your call — nobody else removes it, and it comes off only once the interlock is proven and every part is back where it belongs. Taking it off any earlier hands live power back to a slicer somebody else might still be mid-reassembly on.",
    },
    {
      id: "plug-in", kind: "drag", target: "power-plug",
      title: "Plug the slicer back in",
      cue: "Seat the plug fully into the outlet, last, after everything else is done.",
      why: "Power comes back to this machine exactly once in this whole procedure, and it's the very last thing that happens — after the guard, after the interlock test, after your own lock is off. There is no safe reason to plug it in a step earlier than that.",
      drag: { to: "outlet", radius: 0.25, missNote: "Not seated in the outlet — push the plug fully home." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["loose-guard-screw", "cord-underfoot"],
      itemNames: { "loose-guard-screw": "guard retaining screw left loose", "cord-underfoot": "power cord coiled across the walkway" },
      itemNotes: {
        "loose-guard-screw": "The guard's retaining screw is finger-tight, not torqued down. A guard that can shift under a hand isn't fully reassembled — it just looks like it is.",
        "cord-underfoot": "The cord is coiled straight across the walkway behind the station instead of routed along the wall. That's a trip carrying a tray of sliced product, not a wiring problem.",
      },
      title: "Walk the station before signing off",
      cue: "Two things at this bench are wrong. Find them by looking.",
      why: "The changeover isn't finished when the slicer runs again — it's finished when the bench around it is as safe as the machine itself. Two things left wrong here become somebody else's surprise on the next shift.",
    },
  ],

  // Two things that arrive while a cook's hands are already inside a
  // locked-out machine: another cook who doesn't see the lock, and a test
  // strip that stops agreeing with the label. See shared/game.js.
  interrupts: [
    {
      id: "replug-midclean",
      kind: "Lockout defeated",
      after: "clean-blade", delay: 3, seconds: 11,
      alert: "A second cook has grabbed the slicer's cord and is reaching for the outlet — they've got an order to slice and haven't clocked your lock.",
      cue: "Your hand is on the blade and somebody is about to give it power.",
      target: "cord-lock",
      why: "Your lock on that cord is the entire reason it's safe to have a hand on this blade right now, and it only works if everyone else sees it before they reach for the outlet. Stop them and point at the lock — the order waits; the hand on the blade does not get to find out the hard way that it wasn't actually locked out.",
      missNote: "They plugged it in with your hand still at the blade. The lock was doing its job right up until somebody didn't look for it — a cord-lockout only protects the person who makes sure it gets seen.",
      wrongNote: "It's your lock on that cord — get their hand off the plug and make sure they see it before anything else happens.",
    },
    {
      id: "strip-out-of-range",
      kind: "Sanitiser out of spec",
      after: "sanitize-hold", delay: 3, seconds: 11,
      alert: "The test strip curling out of the sanitiser bucket is reading well outside the labelled range.",
      cue: "That number on the strip doesn't match the label concentration you're relying on right now.",
      target: "sani-mix",
      why: "A sanitiser reading outside its labelled range isn't working at the claimed contact time even if you hold it for twice as long — too weak and it isn't killing anything, too strong and it's a food-contact surface hazard on its own. The fix is a freshly mixed batch, checked again, not a longer hold on a batch that's already wrong.",
      missNote: "You finished the hold on a batch reading outside spec. Whatever contact time you counted, it wasn't protecting the next thing sliced on this blade the way the label promised.",
      wrongNote: "It's the mixing station — remake the batch to spec and check it again before it goes anywhere near the blade.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SLK_ACCENT);

    const steelTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#c9d0d6", base2: "#b7bec5", step: 30 }), { repeat: 4, px: 256 });
    const steelMat = () => texturedMat(steelTex, { rough: 0.4, metal: 0.7, color: 0xc9d0d6 });

    // ------------------------------------------------------------------ bench
    const bench = group(g, 0, 0, -0.9);
    const benchTop = box(bench, 1.5, 0.06, 0.8, 0, 0.9, 0, 0xc9d0d6, { radius: 0.01, rough: 0.35, metal: 0.7 });
    benchTop.material = steelMat();
    for (const lx of [-0.65, 0.65]) box(bench, 0.06, 0.86, 0.74, lx, 0.47, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });

    // ---------------------------------------------------------------- slicer
    const slicer = group(bench, 0, 0.93, 0);
    const slicerBase = slab(slicer, 0.6, 0.06, 0.5, 0, 0, 0, 0x8b929a, { radius: 0.02, rough: 0.4, metal: 0.7 });
    void slicerBase;
    // The flywheel housing and motor drum.
    cyl(slicer, 0.14, 0.15, 0.18, -0.15, 0.14, -0.1, 0x3c444c, { rough: 0.4, metal: 0.6, seg: 20 });
    box(slicer, 0.3, 0.14, 0.28, -0.15, 0.1, -0.1, 0x3c444c, { rough: 0.4, metal: 0.6 });
    // Slicing bed and carriage rail.
    box(slicer, 0.5, 0.02, 0.14, 0.05, 0.09, 0.08, 0xdfe4e8, { rough: 0.2, metal: 0.85 });
    const rail = box(slicer, 0.46, 0.03, 0.05, 0.05, 0.11, 0.16, 0x8b929a, { rough: 0.35, metal: 0.75 });
    hits["slicer-rail"] = rail;
    hits["slicer-body"] = slicer;

    // The blade — a broad disc set vertically, guard ring around most of it.
    const bladeGroup = group(slicer, -0.15, 0.24, 0.02);
    const blade = cyl(bladeGroup, 0.19, 0.19, 0.012, 0, 0, 0, 0xdfe4e8, { rough: 0.12, metal: 0.9, seg: 28 });
    blade.rotation.x = Math.PI / 2;
    reg(hits, bladeGroup, "slicer-blade");
    // The exposed edge segment — a distinct hazard hotspot separate from the
    // broad blade face used for the cleaning stroke.
    const edgeSpot = torus(bladeGroup, 0.19, 0.006, 0, 0, 0, 0xf4f7fa, { rough: 0.1, metal: 0.95, seg: 6, seg2: 40 });
    edgeSpot.rotation.x = Math.PI / 2;
    reg(hits, edgeSpot, "bare-blade-touch");

    // Guard ring — removable, sits over the top half of the blade.
    const guard = group(slicer, -0.15, 0.24, 0.02);
    const guardRing = torus(guard, 0.21, 0.018, 0, 0, 0, 0xf2c14b, { rough: 0.4, metal: 0.5, seg: 8, seg2: 28 });
    guardRing.rotation.x = Math.PI / 2;
    guardRing.scale.set(1, 1, 0.55);
    reg(hits, guard, "blade-guard");
    // Manual interlock override — a small red latch beside the guard mount,
    // never touched on a routine clean.
    const override = group(slicer, -0.02, 0.36, 0.05);
    box(override, 0.03, 0.06, 0.02, 0, 0, 0, 0xb8402f, { rough: 0.5 });
    decal(override, 0.08, 0.02, 0, 0.05, 0.011, signFace("OVERRIDE", { bg: "#2a1416", accent: "#f0645b", scale: 0.55 }));
    reg(hits, override, "override-latch");

    // Thickness dial and carriage.
    const dial = group(slicer, 0.28, 0.16, -0.02, 0.3);
    cyl(dial, 0.055, 0.055, 0.02, 0, 0, 0, 0xb8402f, { rough: 0.4, metal: 0.4, seg: 16 });
    box(dial, 0.008, 0.05, 0.022, 0.02, 0.028, 0, 0x22262b, { rough: 0.5 });
    reg(hits, dial, "thickness-dial");
    const carriage = box(slicer, 0.16, 0.05, 0.16, 0.16, 0.13, 0.12, 0x9aa1a8, { rough: 0.35, metal: 0.7 });
    reg(hits, carriage, "carriage");
    holoTag(slicer, "Deli slicer", 0, 0.5, 0, { css: "#d9524a", w: 0.3 });

    // Cord and plug, running to the outlet on the splashback.
    const plugGroup = group(bench, 0.55, 0.6, -0.3);
    box(plugGroup, 0.05, 0.03, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.5 });
    reg(hits, plugGroup, "power-plug");
    const outlet = box(bench, 0.06, 0.09, 0.02, 0.62, 0.62, -0.4, 0xd8dde1, { rough: 0.5 });
    hits["outlet"] = outlet;
    // Cord-lockout clip over the plug's prongs, with the padlock.
    const cordLock = group(bench, 0.55, 0.6, -0.28);
    box(cordLock, 0.06, 0.04, 0.02, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    const padlock = lockTag(cordLock, 0, -0.05, 0.01, { color: 0xd9524a });
    padlock.visible = false;
    reg(hits, cordLock, "cord-lock");
    // A second cook's hand, reaching for the plug — hidden until the
    // replug-midclean interrupt fires.
    const reachHand = group(bench, 0.75, 0.62, -0.25, -0.4);
    ball(reachHand, 0.045, 0, 0, 0, 0xc99878, { rough: 0.75, seg: 12 });
    cyl(reachHand, 0.028, 0.03, 0.14, -0.09, 0, 0, 0xf2f2f2, { rough: 0.7, seg: 10 }).rotation.z = Math.PI / 2;
    reachHand.visible = false;

    // Wrong-plug decoy — the panini press's cord, coiled right beside the outlet.
    const wrongCord = group(bench, 0.55, 0.55, -0.15);
    box(wrongCord, 0.05, 0.03, 0.03, 0, 0, 0, 0x3c444c, { rough: 0.4, metal: 0.4 });
    torus(wrongCord, 0.05, 0.008, 0, -0.06, -0.02, 0x22262b, { rough: 0.7, seg: 8, seg2: 16 });
    holoTag(wrongCord, "Panini press cord", 0, 0.09, 0, { css: "#f0645b", w: 0.38 });
    reg(hits, wrongCord, "wrong-plug");

    // ----------------------------------------------------------- parts tray
    const tray = box(g, 0.6, 0.03, 0.4, -1.2, 0.6, -0.6, 0x9aa1a8, { rough: 0.4, metal: 0.6 });
    hits["parts-tray"] = tray;
    holoTag(g, "Parts tray", -1.2, 0.72, -0.6, { css: "#d9524a", w: 0.26 });

    // Test switch on the pendant beside the bench.
    const pendant = group(g, 1.0, 0, -0.7, -0.4);
    box(pendant, 0.05, 1.1, 0.05, 0, 0.55, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
    box(pendant, 0.28, 0.4, 0.1, 0, 1.15, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const testSwitch = group(pendant, 0, 1.24, 0.055);
    cyl(testSwitch, 0.028, 0.028, 0.015, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    box(testSwitch, 0.016, 0.045, 0.016, 0, 0.015, 0.01, 0x59c97b, { rough: 0.45 });
    decal(testSwitch, 0.1, 0.025, 0, 0.045, 0.01, signFace("TEST", { bg: "#22262b", accent: "#59c97b", scale: 0.55 }));
    reg(hits, testSwitch, "test-switch");

    // Cleaning card and glove hook.
    const card = holoPanel(g, 0.5, 0.36, -1.2, 1.55, -0.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,4,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d9524a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e0b6b0";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("BETWEEN-PRODUCTS CLEAN", w * 0.06, h * 0.15);
      ctx.fillStyle = "#f6e9e7";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("DELI SLICER — CHANGEOVER", w * 0.06, h * 0.36);
      ctx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ctx.fillStyle = "#e0b6b0";
      ["Lock the cord before the guard comes off", "Sanitiser: hold full label contact time",
       "Reassemble, prove interlock, then plug in"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.54 + i * 0.13)));
    }, { ry: 0.4, accent: SLK_ACCENT });
    reg(hits, card, "clean-card");

    const glove = group(g, 1.2, 0, -1.1);
    box(glove, 0.02, 0.14, 0.02, 0, 0.9, 0, 0x8b929a, { rough: 0.5, metal: 0.5, cast: false });
    ball(glove, 0.06, 0, 0.82, 0, 0x3c4a52, { rough: 0.8, seg: 12 });
    for (let i = 0; i < 4; i++) cyl(glove, 0.011, 0.011, 0.05, -0.03 + i * 0.02, 0.75, 0, 0x3c4a52, { rough: 0.8, seg: 8 });
    holoTag(glove, "Cut-resistant glove — ANSI A4", 0, 0.66, 0, { css: "#d9524a", w: 0.44 });
    reg(hits, glove, "cut-glove");

    // Sanitiser bottle and the mixing/test-strip station used by interrupt 2.
    const sani = group(g, 1.35, 0, -0.35);
    cyl(sani, 0.035, 0.038, 0.18, 0, 0.15, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.85, seg: 14 });
    box(sani, 0.028, 0.05, 0.05, 0, 0.26, 0.01, 0x59c97b, { rough: 0.5 });
    holoTag(sani, "Sanitiser bottle", 0, 0.32, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, sani, "sani-bottle");

    const mix = group(g, 1.7, 0, -0.9);
    cyl(mix, 0.14, 0.12, 0.28, 0, 0.14, 0, 0xdfe4e8, { rough: 0.4, opacity: 0.7, seg: 18 });
    const mixLiquid = cyl(mix, 0.12, 0.1, 0.06, 0, 0.24, 0, 0x59c97b, { rough: 0.2, metal: 0.1, opacity: 0.85, seg: 18 });
    box(mix, 0.42, 0.35, 0.35, 0, 0.16, 0, 0x2b3138, { rough: 0.6, opacity: 0, transparent: true, cast: false });
    const strip = decal(mix, 0.03, 0.16, 0.1, 0.4, 0.11, signFace("", { bg: "#f4e9d8" }));
    strip.rotation.x = -0.2;
    holoTag(mix, "Sanitiser mix station", 0, 0.5, 0, { css: "#59c97b", w: 0.38 });
    reg(hits, mix, "sani-mix");

    // Spare blade on the shelf, bare — the decoy hazard.
    const shelf = group(g, -1.7, 0, -0.9);
    box(shelf, 0.5, 0.02, 0.28, 0, 1.0, 0, 0x9aa1a8, { rough: 0.4, metal: 0.7 });
    for (const sx of [-0.22, 0.22]) cyl(shelf, 0.014, 0.014, 1.0, sx, 0.5, 0.12, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 8 });
    const spareBlade = cyl(shelf, 0.13, 0.13, 0.008, 0, 1.02, 0, 0xdfe4e8, { rough: 0.12, metal: 0.9, seg: 24 });
    spareBlade.rotation.x = Math.PI / 2;
    holoTag(shelf, "Spare blade — no sheath", 0, 1.16, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, spareBlade, "spare-blade-bare");

    // Loose guard screw and coiled cord — closing-walk find targets.
    const looseScrew = ball(slicer, 0.01, -0.15, 0.4, 0.1, 0xb8402f, { rough: 0.4, metal: 0.6, seg: 10 });
    reg(hits, looseScrew, "loose-guard-screw");
    const cordFloor = group(g, 0.4, 0, 0.4);
    torus(cordFloor, 0.22, 0.012, 0, 0.006, 0, 0x22262b, { rough: 0.75, seg: 8, seg2: 24 });
    reg(hits, cordFloor, "cord-underfoot");

    // Anti-fatigue mat in front of the bench.
    slab(g, 1.3, 0.02, 0.7, 0, 0.01, -1.35, 0x22262b, { radius: 0.04, rough: 0.95, cast: false });
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) {
      box(g, 0.09, 0.006, 0.09, -0.5 + i * 0.2, 0.022, -1.6 + j * 0.24, 0x14171a, { cast: false, receive: false });
    }

    // Wire shelving with wrapped deli-product boxes, behind the bench.
    const wireShelf = group(g, -2.3, 0, -1.1, 0.3);
    for (let s = 0; s < 3; s++) {
      box(wireShelf, 0.7, 0.02, 0.4, 0, 0.35 + s * 0.42, 0, 0x9aa1a8, { rough: 0.4, metal: 0.7 });
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(wireShelf, 0.014, 0.014, 1.3, sx * 0.32, 0.68, sz * 0.16, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 8 });
    }
    const boxColours = [0xdfe4e8, 0xe8dcc0, 0xc9a86a, 0xdfe4e8];
    boxColours.forEach((c, i) => {
      box(wireShelf, 0.28, 0.16, 0.3, -0.2 + (i % 2) * 0.4, 0.42 + Math.floor(i / 2) * 0.42, 0, c, { rough: 0.6, opacity: 0.8 });
    });
    holoTag(wireShelf, "Deli supply shelf", 0, 1.3, 0, { css: "#d9524a", w: 0.36 });

    // A small group lockout station on the wall — spare padlocks for other
    // machines on this line, none of them this one.
    const lockBoard = group(g, 1.6, 0, -1.5, -0.3);
    box(lockBoard, 0.4, 0.3, 0.03, 0, 1.1, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    for (let i = 0; i < 4; i++) {
      const spareLock = lockTag(lockBoard, -0.14 + (i % 2) * 0.28, 1.02 - Math.floor(i / 2) * 0.16, 0.02, { color: 0x38bdf8 });
      spareLock.scale.set(0.7, 0.7, 0.7);
    }
    holoTag(lockBoard, "Group lockout board", 0, 1.32, 0, { css: "#d9524a", w: 0.4 });

    // Compact hand sink beside the bench — every food-contact clean starts
    // and ends with a hand wash, whatever else the procedure covers.
    const handSink = group(g, -1.5, 0, -0.4, Math.PI / 2);
    box(handSink, 0.4, 0.3, 0.34, 0, 0.75, 0, 0x9aa1a8, { rough: 0.3, metal: 0.75 });
    box(handSink, 0.34, 0.02, 0.28, 0, 0.9, 0, 0x8b929a, { rough: 0.25, metal: 0.8 });
    cyl(handSink, 0.012, 0.012, 0.22, 0, 1.02, -0.1, CITY.steel, { rough: 0.2, metal: 0.9, seg: 10 });
    box(handSink, 0.07, 0.1, 0.07, 0.22, 1.0, -0.06, 0xe4e8eb, { rough: 0.5 });
    decal(handSink, 0.34, 0.1, 0, 1.2, 0.02, signFace("HANDWASH ONLY", { bg: "#1d3b63", accent: "#6cc6f0", scale: 0.45 }));

    // A pegboard of spare cleaning brushes and scrapers above the sink.
    const pegboard = group(g, -1.5, 0, -0.75, Math.PI / 2);
    box(pegboard, 0.5, 0.4, 0.02, 0, 1.35, 0, 0x8b929a, { rough: 0.6, metal: 0.3 });
    for (let i = 0; i < 3; i++) {
      cyl(pegboard, 0.008, 0.008, 0.28, -0.16 + i * 0.16, 1.25, 0.03, 0xdfe4e8, { rough: 0.3, metal: 0.5, seg: 6 }).rotation.x = Math.PI / 2.4;
      box(pegboard, 0.04, 0.04, 0.01, -0.16 + i * 0.16, 1.4, 0.015, 0x2b3138, { rough: 0.6 });
    }
    holoTag(pegboard, "Cleaning tools", 0, 1.58, 0, { css: "#d9524a", w: 0.32 });

    // Floor drain grate and a small waste bin, the rest of a real bench.
    const drain = group(g, 0.3, 0, 1.1);
    cyl(drain, 0.14, 0.14, 0.01, 0, 0.006, 0, 0x2b2f34, { rough: 0.7, metal: 0.4, seg: 16 });
    for (let i = -3; i <= 3; i++) box(drain, 0.24, 0.004, 0.012, 0, 0.012, i * 0.03, 0x14171a, { cast: false, receive: false });
    const wasteBinS = group(g, 1.9, 0, 0.9);
    cyl(wasteBinS, 0.16, 0.13, 0.42, 0, 0.21, 0, 0x2b3138, { rough: 0.6, metal: 0.3, seg: 16 });
    cyl(wasteBinS, 0.17, 0.17, 0.03, 0, 0.42, 0, 0x1e2226, { rough: 0.6, metal: 0.3, seg: 16 });

    // Second cook, clear of the bench, working the pass.
    standingFigure(g, -0.2, -2.4, { ry: -0.15, cloth: 0xf2f2f2, trousers: 0x2b3138, vest: false });

    let interlockOk = false;
    const arcSpark = particles(g, 18, 0xbfe9ff, { size: 0.014, life: 0.25 });

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.15, -0.9),

      onStepComplete(step) {
        if (step.id === "unplug-lock") padlock.visible = true;
        if (step.id === "guard-off") {
          guard.parent.remove(guard); tray.parent.add(guard);
          guard.position.set(-1.05, 0.62, -0.55);
        }
        if (step.id === "carriage-off") {
          carriage.parent.remove(carriage); g.add(carriage);
          carriage.position.set(-1.35, 0.62, -0.65);
        }
        if (step.id === "carriage-on") {
          carriage.parent.remove(carriage); slicer.add(carriage);
          carriage.position.set(0.05, 0.13, 0.12);
        }
        if (step.id === "guard-on") {
          guard.parent.remove(guard); slicer.add(guard);
          guard.position.set(-0.15, 0.24, 0.02);
        }
        if (step.id === "prove-interlock") interlockOk = true;
        if (step.id === "release-lock") padlock.visible = false;
      },

      onInterrupt(it) {
        if (it.id === "strip-out-of-range") {
          repaint(strip, signFace("OUT", { bg: "#f4e9d8", fg: "#b8402f", accent: "#b8402f", scale: 0.6 }));
          mixLiquid.material = mat(0xb8402f, { rough: 0.2, metal: 0.1, opacity: 0.85, transparent: true });
        }
        if (it.id === "replug-midclean") reachHand.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "strip-out-of-range") {
          repaint(strip, signFace("OK", { bg: "#f4e9d8", fg: "#2f8a4a", accent: "#2f8a4a", scale: 0.6 }));
          mixLiquid.material = mat(0x59c97b, { rough: 0.2, metal: 0.1, opacity: 0.85, transparent: true });
        }
        if (it.id === "replug-midclean") reachHand.visible = false;
      },

      animate(t, dt, session) {
        void interlockOk;
        if (session?.step?.id === "prove-interlock" && !session.finished) {
          arcSpark.visible = Math.floor(t * 3) % 2 === 0;
          if (arcSpark.visible) arcSpark.userData.step(dt, new THREE.Vector3(-0.15, 1.17, -0.88), 0.04, 0.6, -1.2);
        } else arcSpark.visible = false;
      },
    };
  },
};
