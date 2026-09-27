import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, lockTag, standingFigure,
  surfaceTexture, texturedMat, concreteFace, corrugatedFace, gratingFace, safetyStripeFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Night Stocking, Baler & Compactor Lockout VR — Culinary &
// Hospitality, grocery pack (gr-), station four. The back of a grocery
// store on the overnight shift: pallets broken down, cardboard flattened
// and fed to the baler, and the baler itself jams the way balers do — the
// one machine most grocery safety bulletins single out, because reaching
// into a stalled chamber without locking it out first is exactly how a
// stocker gets caught by a ram nobody told to stop. The compactor gets the
// same promise. Real trade, sited generically; no clause invented, the
// union named only as a training body.

const GR4_ACCENT = 0xf2a03a;

export const SIM_GR_NIGHT_STOCKING_BALER_AND_COMPACTOR_LOCKOUT = {
  id: "gr-night-stocking-baler-and-compactor-lockout",
  index: "gr-4",
  domain: "Grocery night stocking crew",
  trade: "Night stocker / grocery clerk",
  category: "Culinary & Hospitality",
  indoor: "garage",
  certification: "UFCW member training for retail food work; OSHA 29 CFR 1910.147 control of hazardous energy; OSHA 29 CFR 1910.212 machine guarding; ANSI B11 safety of machinery; OSHA 29 CFR 1910.132 personal protective equipment",
  name: "Night Stocking Baler & Compactor Lockout",
  title: simTitle("Night Stocking Baler & Compactor Lockout"),
  tagline: "A jammed baler and a loaded compactor both locked out, cleared and proven before either one runs again",
  accent: GR4_ACCENT,
  accentCss: "#f2a03a",
  parSeconds: 300,
  footprint: 2.8,
  badge: { id: "shift-clean", name: "Shift Clean", note: "Both machines cleared, guarded and proven with every lock accounted for before the shift closed out" },

  game: system({
    name: "Overnight Crew Authority",
    currency: "BALE",
    ranks: ["New Stocker", "Night Stocker", "Lead Stocker", "Overnight Supervisor", "Overnight Crew Authority Certified"],
    badges: [
      { id: "lock-first", name: "Lock First", note: "Locked the baler out before reaching into the jam", test: AWARD.stepClean("clear-jam-cardboard") },
      { id: "no-reach-live", name: "No Reach Live", note: "Never reached into a chamber that wasn't proven dead", test: AWARD.safe },
      { id: "steady-pull", name: "Steady Pull", note: "Cleared the jam at a steady, controlled rate every time", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections through the whole jam-clearing procedure", test: AWARD.clean },
      { id: "held-the-hold", name: "Held The Hold", note: "Never broke a timed step early", test: AWARD.unbroken },
      { id: "shift-fast", name: "Shift Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-into-chamber-live": "That baler chamber has no lock on its disconnect. Reaching into a jammed chamber that could still be told to cycle is the single most common way a baler-related injury actually happens in a grocery backroom — the ram does not know a hand is where the cardboard was.",
    "frayed-wire": "The gate's own limit-switch wire is frayed down to bare copper. A limit switch that can short or fail open is a guard interlock the machine cannot actually trust, whatever the gate itself looks like from the outside.",
    "stale-shift-tag": "That danger tag on the panel is from a shift that ended hours ago, with nobody's name on this shift's own lockout log. An unaccounted-for lock or tag left on a panel is exactly what group lockout procedures exist to prevent — every lock on that panel has to belong to somebody working right now.",
    "compactor-hopper-reach": "You're reaching into the compactor hopper to free the jam with the ram's own power still live. A cardboard compactor's ram is built to crush its own load without warning; the hopper only gets a hand inside it once the unit is proven locked out, never before.",
  },

  lateNotes: {
    "compactor-gate": "The compactor's own cord gets locked first — the ram chamber opens on a dead machine, not a running one somebody forgot to isolate.",
  },

  steps: [
    {
      id: "stocking-manifest", kind: "select", target: "stocking-board",
      title: "Read tonight's stocking manifest",
      cue: "Check the pallet list for the overnight shift and confirm the baler and compactor are between cycles.",
      why: "The manifest sets what gets broken down and baled tonight, and confirming both machines are actually between cycles before touching either one is the fact this whole shift's safety depends on — starting a lockout on a baler mid-cycle is how a hand ends up where a ram already is.",
    },
    {
      id: "flatten-and-queue", kind: "sequence",
      targets: ["flatten-box", "queue-cardboard"],
      itemNames: { "flatten-box": "flattened box", "queue-cardboard": "cardboard queue" },
      title: "Flatten and queue the cardboard",
      cue: "Break the empty box down flat, then stack it in the queue at the baler's infeed — in that order.",
      why: "A box broken down flat feeds the chamber evenly; one still half-folded is exactly the kind of load that jams a ram halfway through its stroke. Queuing it at the infeed, not shoving it straight into a running chamber, is what keeps hands clear of the machine doing the actual work.",
      outOfOrderNote: "Wrong order — the box flattens first, then it joins the queue at the infeed.",
    },
    {
      id: "baler-jam-noted", kind: "select", target: "baler-jam-light",
      title: "Notice the baler's jam light",
      cue: "Check the amber jam indicator on the baler's control panel before feeding it anything else.",
      why: "The jam light is the machine telling you the ram stalled mid-stroke — feeding more cardboard into a chamber that already has a jammed load in it only packs the jam in tighter, and it is the last normal-looking thing this baler does before somebody's hand goes in after it.",
    },
    {
      id: "baler-lockout", kind: "select", target: "baler-disconnect",
      title: "Lock out the baler's disconnect",
      cue: "Open the baler's own disconnect switch and clip your padlock through it.",
      why: "OSHA 29 CFR 1910.147 asks for one thing before any hand goes near a jammed ram: the energy source isolated and locked by the person about to clear it. This switch is wired to the baler alone, so your lock — and nowhere else — is what keeps that ram from being told to finish its stroke.",
    },
    {
      id: "baler-verify-dead", kind: "gauge", target: "baler-voltage-tester",
      title: "Test the control circuit for zero energy",
      cue: "Touch the tester to the baler's control leads and commit once it reads dead.",
      why: "A locked switch is a promise; the tester is what proves it. ANSI B11's own machinery-safety approach and 1910.147 both ask for this exact step before a guard or a gate ever opens on a machine that was just running — it is where a mislabelled breaker shows up, not after.",
      gauge: { label: "CONTROL CIRCUIT VOLTAGE", speed: 0.7, green: [0.0, 0.14], readout: (t) => `${Math.round(t * 130)} V`, missNote: "Still reading live — do not open the gate. Recheck the lock before this goes any further." },
    },
    {
      id: "clear-jam-cardboard", kind: "track", target: "jammed-wad", seconds: 6,
      title: "Draw the jammed cardboard out",
      cue: "Pull the jammed wad out of the chamber at a slow, steady rate — too fast snags it on the ram.",
      why: "A jam under real tension does not come free with one hard yank — it comes free at a steady pull that lets the wad clear the ram's edge instead of tearing and re-wedging against it, the same way it jammed in the first place.",
      track: {
        start: 0.1, green: [0.35, 0.6], rise: 0.5, fall: 0.42, drift: 0.1, label: "PULL RATE",
        readout: (v) => (v < 0.35 ? "too slow — still wedged" : v > 0.6 ? "too fast — snagging the ram" : "clearing steady"),
      },
      holdBreakNote: "Out of the steady band — ease the pull rate back before the wad snags on the ram again.",
    },
    {
      id: "baler-walk", kind: "find", noHint: true,
      targets: ["frayed-wire", "stale-shift-tag"],
      itemNames: { "frayed-wire": "frayed limit-switch wire", "stale-shift-tag": "an old danger tag from a previous shift" },
      itemNotes: {
        "frayed-wire": "The gate's limit-switch wire is worn down to bare copper at the connector. A frayed interlock wire is a guard the machine cannot actually trust, whatever the gate looks like closed.",
        "stale-shift-tag": "This danger tag has no name on it from tonight's shift. An unaccounted-for lock or tag left on this panel from an earlier shift is exactly what a group lockout log is supposed to catch before anyone assumes the panel is clear.",
      },
      decoyNotes: { "clean-hopper": "The baler's hopper chute is clear and dry, nothing left inside it. Leave it." },
      title: "Walk the baler before it closes back up",
      cue: "Two things at this machine are wrong. Find them before the gate closes.",
      why: "Clearing the jam isn't the end of this — the machine underneath it gets checked, not just cleared. Two things left wrong here become the next shift's surprise, or worse, the next jam somebody reaches into believing it is only a jam.",
    },
    {
      id: "baler-interlock-test", kind: "gauge", target: "baler-voltage-tester",
      title: "Prove the gate interlock",
      cue: "Bump the test switch with the gate closed and read the control circuit, committing once it shows live.",
      why: "The interlock is what should have kept this baler from cycling the entire time the gate was open, and reading the control circuit after reassembly is the only way to know it still does that job before this machine takes another load.",
      gauge: { label: "CONTROL CIRCUIT VOLTAGE", speed: 0.7, green: [0.75, 1.0], readout: (t) => `${Math.round(t * 130)} V`, missNote: "Still reading dead — something in the gate switch or the wiring needs a look before this ram is trusted to run again." },
    },
    {
      id: "release-baler-lock", kind: "select", target: "baler-disconnect",
      title: "Remove your lock from the baler",
      cue: "Take your padlock off the baler's disconnect now that the jam is cleared and the interlock is proven.",
      why: "Your lock, your call — nobody else removes it, and it comes off only once the gate is closed, the interlock is proven and the chamber is actually clear.",
    },
    {
      id: "compactor-lockout", kind: "select", target: "compactor-disconnect",
      title: "Lock out the cardboard compactor",
      cue: "Open the compactor's own disconnect and clip your padlock through it before the hopper is touched.",
      why: "The compactor's ram crushes its own load without any warning stroke, and it gets its own lock on its own disconnect — a hand does not go into that hopper on the hope that somebody already shut it off.",
    },
    {
      id: "compactor-gate-open", kind: "drag", target: "compactor-gate",
      title: "Open the compactor's inspection gate",
      cue: "Swing the ram chamber's inspection gate open and set it against its stop.",
      why: "The gate opens only after the disconnect is locked — reaching for it before that tests a hope, not a lock, on a ram built to crush cardboard without ever needing to know a hand replaced it.",
      drag: { to: "gate-stop", radius: 0.3, missNote: "Not against the stop — the gate has to hold fully open before a hand goes anywhere near the chamber." },
    },
    {
      id: "compactor-release-lock", kind: "select", target: "compactor-disconnect",
      title: "Close the gate and remove your compactor lock",
      cue: "Swing the gate shut and take your padlock off the compactor's disconnect.",
      why: "The gate closes before the lock comes off, not after — a compactor with its lock removed and its gate still open is a live ram with nothing between it and whoever walks by next.",
    },
    {
      id: "tie-bale-wire", kind: "turn", target: "bale-wire-tensioner",
      title: "Tension and tie the finished bale",
      cue: "Turn the wire tensioner down until the bale holds its shape on its own.",
      why: "A bale tied loose comes apart the first time it is moved, and a bale tensioned unevenly can snap a wire under load — turning the tensioner to a steady, even tension is what makes this bale safe to stage and safe for whoever loads it next.",
      turn: { turns: 1, axis: "z", label: "BALE WIRE TENSION" },
    },
    {
      id: "stage-bale", kind: "drag", target: "finished-bale",
      title: "Stage the bale for pickup",
      cue: "Move the finished, tied bale to the marked staging area by the dock door.",
      why: "A finished bale left in the aisle behind the baler is a blind-corner obstacle for the next stocker pushing a loaded pallet jack through — staging it at the marked area keeps the whole backroom aisle clear for what still has to move through it tonight.",
      drag: { to: "bale-staging", radius: 0.4, missNote: "Not on the marked staging area — a finished bale left in the aisle is the next stocker's blind-corner surprise." },
    },
    {
      id: "sign-maintenance-log", kind: "select", target: "maintenance-log",
      title: "Sign the maintenance log",
      cue: "Sign the log to close out tonight's jam-clearing on both machines.",
      why: "The signature is the stocker taking responsibility for the whole procedure — both machines locked, cleared and proven — and it is the line the day manager reads if either machine's history is ever questioned.",
    },
  ],

  interrupts: [
    {
      id: "new-stocker-restart",
      kind: "Lockout not seen",
      after: "clear-jam-cardboard", delay: 4, seconds: 13,
      alert: "A new stocker has walked up to the baler's start button, about to bump it to \"see if it's still stuck\" — they haven't clocked your lock on the disconnect.",
      cue: "Your hand is inside the chamber and somebody is about to try starting this baler.",
      target: "baler-disconnect",
      why: "Your lock on that disconnect is the entire reason it is safe to have a hand inside this chamber right now, and it only works if the next person reaching for the start button sees it first. Stop them and point at the lock before curiosity does what a jam couldn't.",
      missNote: "They bumped the start button with your hand still inside the chamber. The lock was doing its job right up until somebody didn't look for it first — a disconnect lockout only protects the person who makes sure it gets noticed.",
      wrongNote: "It's the baler's disconnect — get their hand off the start button and make sure they see your lock.",
    },
    {
      id: "coworker-cart-into-hopper",
      kind: "Product headed for an open machine",
      after: "compactor-gate-open", delay: 3, seconds: 12,
      alert: "A coworker has wheeled a cart of broken-down boxes up to the compactor and is about to tip them straight into the open hopper.",
      cue: "That hopper's gate is open for an inspection, not for a load — nobody has proven this machine is locked out to anyone but you.",
      target: "compactor-disconnect",
      why: "An open gate on a compactor looks, to anyone who hasn't been standing here for the last minute, like a machine that is simply ready for the next load. Pointing them at the disconnect and your lock is what tells them otherwise before a cart of boxes goes in on top of an inspection that isn't finished.",
      missNote: "The boxes went into the hopper before the compactor was closed back up and proven. Whatever was in that cart is now sitting against a ram somebody else believed was ready to run — because nothing here told them it wasn't.",
      wrongNote: "It's the compactor's disconnect — stop the cart and point at your lock before anything goes into that hopper.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GR4_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => concreteFace(cx, w, h, {}), { repeat: 5, px: 512 });
    const floor = box(g, 6.8, 0.1, 6.0, 0, 0.05, 0, 0x6d7379, { rough: 0.85, metal: 0.05 });
    floor.material = texturedMat(floorTex, { rough: 0.85, metal: 0.05, color: 0x6d7379 });

    const wallTex = surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, { colour: 0x9aa1a8, ribs: 12 }), { repeat: 3, px: 512 });
    const backWall = box(g, 6.8, 2.8, 0.12, 0, 1.4, -2.4, 0x9aa1a8, { rough: 0.5, metal: 0.5 });
    backWall.material = texturedMat(wallTex, { rough: 0.5, metal: 0.5, color: 0x9aa1a8 });

    const stripeTex = surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 3, px: 256 });
    const stripe = slab(g, 4.4, 0.005, 0.3, 0, 0.006, -1.6, 0xf2c14b, { rough: 0.7, cast: false });
    stripe.material = texturedMat(stripeTex, { rough: 0.75, color: 0xf2c14b });

    // Floor grate near the compactor drain.
    const grateTex = surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 });
    const grate = slab(g, 0.6, 0.01, 0.5, 2.2, 0.011, 0.9, 0x2b2f34, { rough: 0.6, metal: 0.4, cast: false });
    grate.material = texturedMat(grateTex, { rough: 0.6, metal: 0.5, color: 0x2b2f34 });

    // ------------------------------------------------------------- baler
    const baler = group(g, -1.6, 0, -1.7);
    box(baler, 1.0, 1.6, 0.9, 0, 0.8, 0, 0x9aa1a8, { rough: 0.45, metal: 0.55 });
    hits["baler-body"] = baler;
    const balerPanel = group(baler, 0.55, 1.2, 0);
    box(balerPanel, 0.2, 0.3, 0.06, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const jamLight = ball(balerPanel, 0.025, 0, 0.08, 0.04, 0xf2ae14, { rough: 0.4, emissive: 0xf2ae14, ei: 1.4, seg: 12 });
    reg(hits, jamLight, "baler-jam-light");
    const startBtn = cyl(balerPanel, 0.02, 0.02, 0.015, 0, -0.05, 0.04, 0x59c97b, { rough: 0.4, seg: 12 });
    void startBtn;
    holoTag(baler, "Cardboard baler", 0, 1.75, 0, { css: "#f2a03a", w: 0.32 });

    // Chamber gate, jammed cardboard wad and the exposed reach-in hazard.
    const balerGate = group(baler, 0, 0.75, 0.46);
    box(balerGate, 0.85, 1.1, 0.05, 0, 0, 0, 0xf2c14b, { rough: 0.4, metal: 0.4 });
    reg(hits, balerGate, "baler-gate");
    const jammedWad = box(baler, 0.6, 0.3, 0.3, 0, 0.6, 0.2, 0xc9a86a, { rough: 0.85 });
    reg(hits, jammedWad, "jammed-wad");
    const chamberReach = box(baler, 0.6, 0.5, 0.4, 0, 0.75, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, chamberReach, "reach-into-chamber-live");
    const cleanHopper = box(baler, 0.5, 0.1, 0.3, 0, 1.4, 0.3, 0x8b929a, { rough: 0.5, metal: 0.5 });
    reg(hits, cleanHopper, "clean-hopper");

    // Disconnect and voltage tester.
    const balerDisc = group(g, -2.2, 0, -2.35);
    box(balerDisc, 0.18, 0.28, 0.09, 0, 1.3, 0, 0xe4e8ea, { rough: 0.4, metal: 0.5 });
    box(balerDisc, 0.09, 0.14, 0.02, 0, 1.3, 0.05, 0xf2c14b, { rough: 0.5 });
    decal(balerDisc, 0.16, 0.05, 0, 1.46, 0.05, signFace("BALER", { bg: "#1a1e22", accent: "#f2a03a", scale: 0.48 }));
    reg(hits, balerDisc, "baler-disconnect");
    const balerPadlock = lockTag(balerDisc, 0.09, 1.22, 0.02, { color: 0xf2a03a });
    balerPadlock.visible = false;
    const staleTag = lockTag(balerDisc, -0.09, 1.1, 0.02, { color: 0x8b929a, lines: ["SHIFT B", "??"] });
    staleTag.scale.set(0.8, 0.8, 0.8);
    reg(hits, staleTag, "stale-shift-tag");

    const balerVoltTester = instrument(g, -1.1, 0.9, -2.2, { idle: "-- V", color: 0xf2c14b, w: 0.14, d: 0.2 });
    holoTag(balerVoltTester, "voltage tester", 0, 0.16, 0, { css: "#f2a03a", w: 0.32 });
    reg(hits, balerVoltTester, "baler-voltage-tester");

    const balerTestPendant = group(g, -0.6, 0, -2.3);
    box(balerTestPendant, 0.24, 0.32, 0.09, 0, 1.15, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const balerTestSw = group(balerTestPendant, 0, 1.24, 0.05);
    cyl(balerTestSw, 0.026, 0.026, 0.014, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    box(balerTestSw, 0.015, 0.04, 0.015, 0, 0.014, 0.01, 0x59c97b, { rough: 0.45 });
    decal(balerTestSw, 0.09, 0.022, 0, 0.04, 0.01, signFace("TEST", { bg: "#22262b", accent: "#59c97b", scale: 0.55 }));
    reg(hits, balerTestSw, "baler-test-switch");

    // Frayed limit-switch wire near the gate hinge.
    const frayedWire = group(baler, 0.42, 1.0, 0.42);
    cyl(frayedWire, 0.006, 0.006, 0.2, 0, 0, 0, 0xd8232a, { rough: 0.6, seg: 8 }).rotation.z = 0.6;
    reg(hits, frayedWire, "frayed-wire");

    // ---------------------------------------------------------- compactor
    const compactor = group(g, 1.5, 0, -1.9);
    box(compactor, 0.9, 1.3, 1.0, 0, 0.65, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    hits["compactor-body"] = compactor;
    holoTag(compactor, "Cardboard compactor", 0, 1.5, 0, { css: "#f2a03a", w: 0.4 });
    const compactorGate = group(compactor, 0, 0.7, 0.52, 0);
    box(compactorGate, 0.7, 0.9, 0.05, 0, 0, 0, 0xf2c14b, { rough: 0.4, metal: 0.4 });
    reg(hits, compactorGate, "compactor-gate");
    hits["gate-stop"] = compactor;
    const hopperReach = box(compactor, 0.5, 0.4, 0.35, 0, 0.9, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hopperReach, "compactor-hopper-reach");

    const compactorCord = group(compactor, 0.5, 0.3, -0.45);
    box(compactorCord, 0.05, 0.03, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.5 });
    box(compactorCord, 0.06, 0.04, 0.02, 0, -0.045, 0, 0xf2c14b, { rough: 0.5 });
    reg(hits, compactorCord, "compactor-disconnect");
    const compactorPadlock = lockTag(compactorCord, 0, -0.09, 0.01, { color: 0xf2a03a });
    compactorPadlock.visible = false;

    // Cardboard queue and flattening area near the baler infeed.
    const queueArea = group(g, -0.3, 0, -0.6);
    const flattenBox = box(queueArea, 0.5, 0.04, 0.4, -0.3, 0.02, 0, 0xc9a86a, { rough: 0.85 });
    reg(hits, flattenBox, "flatten-box");
    const queueStack = group(queueArea, 0.3, 0, 0);
    for (let i = 0; i < 4; i++) box(queueStack, 0.5, 0.03, 0.4, 0, 0.015 + i * 0.035, 0, 0xc9a86a, { rough: 0.85 });
    reg(hits, queueStack, "queue-cardboard");
    holoTag(queueArea, "cardboard queue", 0, 0.3, 0, { css: "#f2a03a", w: 0.32 });

    // Bale wire tensioner and staged bale.
    const bale = group(g, 0.6, 0, -0.3);
    box(bale, 0.5, 0.6, 0.5, 0, 0.3, 0, 0xc9a86a, { rough: 0.75 });
    for (const wy of [0.12, 0.3, 0.48]) box(bale, 0.52, 0.02, 0.02, 0, wy, 0.26, 0x8b929a, { rough: 0.4, metal: 0.6 });
    const tensioner = group(bale, 0.3, 0.3, 0.26);
    cyl(tensioner, 0.03, 0.03, 0.06, 0, 0, 0, 0xb8402f, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    reg(hits, tensioner, "bale-wire-tensioner");
    holoTag(bale, "finished bale", 0, 0.66, 0, { css: "#f2a03a", w: 0.32 });
    reg(hits, bale, "finished-bale");

    const staging = slab(g, 1.0, 0.01, 0.9, 2.4, 0.011, 0.4, 0x59c97b, { radius: 0.05, rough: 0.7, opacity: 0.35, transparent: true, cast: false });
    holoTag(g, "bale staging", 2.4, 0.2, 0.4, { css: "#59c97b", w: 0.3 });
    reg(hits, staging, "bale-staging");

    // Stocking manifest board and maintenance log.
    const stockingBoard = holoPanel(g, 0.5, 0.36, -2.4, 1.5, 0.5, (ctx, w, h) => {
      ctx.fillStyle = "#241a08"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#f2a03a"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffe9c2"; ctx.fillText("OVERNIGHT MANIFEST", w * 0.08, h * 0.18);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; ctx.fillStyle = "#fff3e0";
      ["Aisle 4–9 restock", "Baler: between cycles", "Compactor: between cycles"].forEach((l, i) => ctx.fillText(l, w * 0.08, h * (0.36 + i * 0.15)));
    }, { accent: GR4_ACCENT });
    reg(hits, stockingBoard, "stocking-board");

    const maintLog = group(g, 2.6, 0, -0.9);
    slab(maintLog, 0.24, 0.02, 0.32, 0, 0.92, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(maintLog, 0.2, 0.26, 0, 0.93, 0.161, signFace("MAINTENANCE LOG", { bg: "#f4ecda", fg: "#241a08", accent: "#b8402f", scale: 0.4 })).rotation.x = -Math.PI / 2;
    holoTag(maintLog, "maintenance log", 0, 1.1, 0, { css: "#f2a03a", w: 0.36 });
    reg(hits, maintLog, "maintenance-log");

    // Empty-pallet stack and a wire cart of stock, the rest of a real backroom.
    const emptyPallets = group(g, -2.6, 0, 0.6);
    for (let i = 0; i < 3; i++) box(emptyPallets, 1.0, 0.1, 1.0, 0, 0.06 + i * 0.11, 0, 0x8a6f5a, { rough: 0.9 });

    // Overhead pipe run with hangers, a shelf of prior finished bales, a tool
    // pegboard and ceiling light fittings — the rest of a working backroom.
    const overhead = group(g, 0, 0, -1.5);
    for (const [oz, colour, rr] of [[-1.8, 0x8b929a, 0.05], [1.8, 0x6d7379, 0.04]]) {
      const pipe = cyl(overhead, rr, rr, 5.8, 0, 2.5, oz, colour, { rough: 0.5, metal: 0.55, seg: 10, cast: false });
      pipe.rotation.z = Math.PI / 2;
      for (let x = -2.6; x <= 2.6; x += 1.3) box(overhead, 0.02, 0.3, 0.02, x, 2.35, oz, 0x6d7379, { rough: 0.6, metal: 0.5, cast: false });
    }
    for (let x = -2.4; x <= 2.4; x += 1.6) {
      box(g, 0.5, 0.06, 0.2, x, 2.6, 0.5, 0xeef5fb, { rough: 0.3, emissive: 0xeef5fb, ei: 0.6, cast: false });
    }
    const priorBales = group(g, 3.1, 0, -0.2);
    for (let i = 0; i < 2; i++) {
      const pb = box(priorBales, 0.48, 0.58, 0.48, i * 0.55, 0.29, 0, 0xc9a86a, { rough: 0.75 });
      void pb;
      for (const wy of [0.14, 0.32, 0.5]) box(priorBales, 0.5, 0.02, 0.02, i * 0.55, wy, 0.25, 0x8b929a, { rough: 0.4, metal: 0.6 });
    }
    holoTag(priorBales, "prior bales — staged", 0.3, 0.7, 0, { css: "#f2a03a", w: 0.44 });
    const pegboard = group(g, 2.7, 0, -2.3);
    box(pegboard, 0.6, 0.5, 0.02, 0, 1.4, 0, 0x8b929a, { rough: 0.6, metal: 0.3 });
    for (let i = 0; i < 4; i++) cyl(pegboard, 0.008, 0.008, 0.24, -0.24 + i * 0.16, 1.3, 0.02, 0xdfe4e8, { rough: 0.3, metal: 0.5, seg: 6 }).rotation.x = Math.PI / 2.4;
    holoTag(pegboard, "tool pegboard", 0, 1.68, 0, { css: "#f2a03a", w: 0.32 });

    const cart = group(g, 3.0, 0, -1.3);
    box(cart, 0.5, 0.4, 0.5, 0, 0.3, 0, 0x6b7278, { rough: 0.5, metal: 0.5 });
    box(cart, 0.46, 0.1, 0.46, 0, 0.52, 0, 0xc9a86a, { rough: 0.8 });
    for (const [cx2, cz2] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) cyl(cart, 0.05, 0.05, 0.04, cx2, 0.05, cz2, 0x22262b, { rough: 0.8, seg: 10 });
    cart.visible = false;

    const stocker = standingFigure(g, 0, 1.0, { ry: Math.PI, outfit: "kitchen" });
    void stocker;
    const newStocker = group(g, -1.9, 0, -0.5);
    standingFigure(newStocker, 0, 0, { ry: -0.7, outfit: "kitchen" });
    newStocker.visible = false;

    const arcSpark = particles(g, 16, 0xbfe9ff, { size: 0.014, life: 0.25 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),
      onStepComplete(step) {
        if (step.id === "baler-jam-noted") jamLight.material = mat(0xf0645b, { rough: 0.4, emissive: 0xf0645b, ei: 1.6 });
        if (step.id === "baler-lockout") balerPadlock.visible = true;
        if (step.id === "clear-jam-cardboard") { jammedWad.visible = false; jamLight.material = mat(0x9aa1a8, { rough: 0.5 }); }
        if (step.id === "baler-walk") { frayedWire.children[0].material = mat(0xf2a03a, { rough: 0.6 }); staleTag.visible = false; }
        if (step.id === "release-baler-lock") balerPadlock.visible = false;
        if (step.id === "compactor-lockout") compactorPadlock.visible = true;
        if (step.id === "compactor-gate-open") compactorGate.rotation.y = -Math.PI / 2.2;
        if (step.id === "compactor-release-lock") { compactorGate.rotation.y = 0; compactorPadlock.visible = false; }
        if (step.id === "stage-bale") { bale.parent.remove(bale); g.add(bale); bale.position.set(2.4, 0, 0.4); }
      },
      onInterrupt(it) {
        if (it.id === "new-stocker-restart") newStocker.visible = true;
        if (it.id === "coworker-cart-into-hopper") cart.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "new-stocker-restart") newStocker.visible = false;
        if (it.id === "coworker-cart-into-hopper") { cart.visible = false; cart.position.set(3.0, 0, -1.3); }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "baler-verify-dead") {
          repaint(balerVoltTester.userData.screen, signFace(`${Math.round(gg.t * 130)} V`, { bg: "#1c1408", accent: gg.t <= 0.14 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.6 }));
        }
        if (gg && !gg.committed && step?.id === "baler-interlock-test") {
          repaint(balerVoltTester.userData.screen, signFace(`${Math.round(gg.t * 130)} V`, { bg: "#1c1408", accent: gg.t >= 0.75 ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.6 }));
        }
        if (session?.turn && step?.id === "tie-bale-wire") tensioner.rotation.x = session.turn.amount * 2;
        if (session?.activeInterrupt?.id === "coworker-cart-into-hopper") cart.position.x = Math.max(1.9, 3.0 - (t % 8) * 0.15);
        if (session?.step?.id === "baler-interlock-test" && !session.finished) {
          arcSpark.visible = Math.floor(t * 3) % 2 === 0;
          if (arcSpark.visible) arcSpark.userData.step(dt, new THREE.Vector3(-1.6, 1.5, -1.7), 0.04, 0.6, -1.2);
        } else arcSpark.visible = false;
      },
    };
  },
};
