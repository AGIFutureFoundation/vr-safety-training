import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, standingFigure,
  surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bakery Mixer VR — Culinary & Hospitality, station three.
// A 60-quart floor mixer in the same shared kitchen as knife-skills and
// slicer-lockout (see interiors.js's "kitchen" style). The bowl guard is the
// whole safeguard on a machine this size — it is proven, not assumed, and
// everything that follows (the chute, the stop-before-scrape rule, the
// lockout for the deep clean) exists because a 60-quart hook has enough
// torque to take a forearm with it if the guard ever stops meaning anything.

const BM_ACCENT = 0xc9915a;

export const SIM_BAKERY_MIXER = {
  id: "bakery-mixer",
  index: "103",
  domain: "Food service",
  trade: "Baker",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  certification: "UNITE HERE Local 2 — hospitality and food service; AFSCME and SEIU school and hospital food service; Cal/OSHA General Industry Safety Orders; OSHA 29 CFR 1910.212 machine guarding; OSHA 29 CFR 1910.147 control of hazardous energy; NSF/ANSI 8 commercial mixer sanitation",
  name: "Bakery Mixer",
  title: simTitle("Bakery Mixer"),
  tagline: "Bowl guard proven, the lift locked, the attachment pinned, ingredients through the chute, and the mixer stopped before anything comes near the bowl",
  accent: BM_ACCENT,
  accentCss: "#c9915a",
  parSeconds: 240,
  footprint: 2.3,
  badge: { id: "guard-proven", name: "Guard Proven", note: "A full batch with the guard interlock proven, the lift locked, and every scrape done on a stopped machine" },

  game: system({
    name: "Mixer Authority",
    currency: "BATCH",
    ranks: ["Dish Hand", "Baker's Helper", "Mixer Operator", "Lead Baker", "Mixer Authority Certified"],
    badges: [
      { id: "guard-first", name: "Guard First", note: "Proved the bowl guard interlock before anything went in the bowl", test: AWARD.stepClean("guard-test") },
      { id: "hands-out", name: "Hands Out", note: "Never reached toward the bowl while the mixer was running", test: AWARD.safe },
      { id: "steady-speed", name: "Steady Speed", note: "Set the starting speed close to the card's target", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-batch", name: "Clean Batch", note: "No corrections through the whole batch", test: AWARD.clean },
      { id: "held-the-lock", name: "Held The Lock", note: "Never broke a timed hold early", test: AWARD.unbroken },
      { id: "batch-fast", name: "Batch Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-through-guard": "The guard on this mixer is propped open with a wedge instead of resting on its own interlock. A wedged guard can't do the one thing it's there for — stop the machine the instant it lifts — so reaching through it is reaching into a bowl the interlock was never actually watching.",
    "scrape-while-running": "You brought the scraper to the bowl while the beater was still turning. A 60-quart hook has enough torque to take a scraper — and the hand holding it — around with the dough. The bowl gets scraped stopped, guard open, every time, not while it's still moving.",
    "attach-unpinned": "That spare beater on the shelf has no retaining pin fitted. An attachment that isn't pinned to the spindle can walk up and off under load, and thirty pounds of steel coming off a spinning shaft doesn't announce which direction it's going first.",
    "chute-bypass": "You went to dump that bag straight over the top of the guard instead of through its chute. The chute is the only opening in this guard for a reason — pouring around it means your hand follows the bag right up to the edge the guard exists to keep it away from.",
  },

  lateNotes: {
    "beater": "The bowl has to be up and locked before an attachment goes anywhere near the spindle.",
    "scraper": "Not yet — the mixer stops and the guard comes open before the scraper goes anywhere near the bowl.",
    "start-switch": "Not until the attachment's pinned and the speed is set from the card. Starting early runs an unproven setup at load.",
  },

  steps: [
    {
      id: "batch-card", kind: "select", target: "batch-card",
      title: "Read the batch card",
      cue: "Check the bowl size, the attachment, the starting speed and the mix time.",
      why: "The card sets the attachment and the starting speed before the bowl ever goes up — a bread dough hook run at a whisk's speed tears the gluten instead of building it, and that's a wasted batch discovered only after the timer runs out.",
    },
    {
      id: "guard-test", kind: "hold", target: "bowl-guard", seconds: 5,
      title: "Prove the bowl guard interlock",
      cue: "Hold the guard open through the full check and confirm the beater stops dead, not coasts.",
      why: "OSHA 1910.212 exists for exactly this machine: the guard is the safeguard, and a safeguard that hasn't been tested today is an assumption wearing a guard's shape. Proving it stops the beater the instant it lifts is what makes everything that follows — the chute, the scrape-down — actually safe to do the way the procedure says.",
      holdBreakNote: "Let go before the check finished. A guard test that isn't held the full count hasn't actually proven anything — hold it again.",
    },
    {
      id: "bowl-up", kind: "turn", target: "lift-crank",
      title: "Raise the bowl on the lift",
      cue: "Turn the lift crank until the bowl reaches mixing height.",
      why: "The lift carries the bowl's full weight plus whatever's in it, which is exactly why it's a geared crank and not a lift by hand — a 60-quart bowl of dough is not something anybody's back should be finding out the hard way.",
      turn: { turns: 0.5, axis: "y", label: "BOWL LIFT" },
    },
    {
      id: "lift-lock", kind: "hold", target: "lift-lock-pin", seconds: 4,
      title: "Seat the lift lock",
      cue: "Hold the lock pin engaged until it seats fully at mixing height.",
      why: "A bowl held up by the crank alone can settle the moment anyone leans on it; the lock pin is what actually keeps it at height under load. It has to be held through the full seat, not bumped and let go, or the lock can catch on the first tooth instead of the last one.",
      holdBreakNote: "Released before the pin seated. A half-caught lock looks locked and isn't — hold it through the full count.",
    },
    {
      id: "attach", kind: "drag", target: "beater",
      title: "Seat the attachment on the spindle",
      cue: "Lift the attachment from the rack and seat it square on the spindle.",
      why: "The card named this attachment for a reason — a hook builds gluten, a paddle creams fat and sugar, and the wrong one on the spindle either tears the dough or never actually creams the batch, whatever the timer says.",
      drag: { to: "spindle", radius: 0.3, missNote: "Not seated on the spindle — bring the attachment up square before it goes anywhere near the shaft." },
    },
    {
      id: "pin", kind: "select", target: "attach-pin",
      title: "Pin the attachment",
      cue: "Lock the retaining pin so the attachment can't walk off the spindle.",
      why: "Nothing about the spindle stops an unpinned attachment from working its way upward under load — the pin is the only thing holding it down there, and it gets checked before the mixer ever starts turning, not after something sounds wrong.",
    },
    {
      id: "speed-set", kind: "gauge", target: "speed-dial",
      title: "Set the starting speed from the card",
      cue: "Bring the speed dial to the card's starting figure and commit inside the band.",
      why: "A mixer only changes speed safely at a stop — this dial gets set once, from the card, before the start switch is ever touched, because reaching for it once the beater is already loaded and turning is how a hand ends up at the edge of a moving bowl.",
      gauge: { label: "SPEED", speed: 0.8, green: [0.16, 0.3], readout: (t) => `${Math.round(t * 10)}`, missNote: "Off the card's starting speed — reset the dial to spec before the mixer runs." },
    },
    {
      id: "load-chute", kind: "drag", target: "ingredient-bag",
      title: "Add ingredients through the guard's chute",
      cue: "Carry the flour bag to the chute opening and feed it through — never over the top of the guard.",
      why: "The chute is the one gap this guard has, sized for a stream of flour and nothing wider than that. Dumping over the guard instead puts a hand exactly where the guard's whole job is to keep it from being.",
      drag: { to: "chute", radius: 0.3, missNote: "Not lined up with the chute — bring the bag to the opening in the guard, not over the top of it." },
    },
    {
      id: "mix-run", kind: "hold", target: "start-switch", seconds: 6,
      title: "Run the batch to the card's time",
      cue: "Hold the start switch through the mix time on the card.",
      why: "A mixer left running past its own timer overworks the dough the same way an early stop underworks it — the card's time is the target because somebody already found out what happens on either side of it.",
      holdBreakNote: "Stopped short of the card's mix time. An underworked batch doesn't finish itself later — reset and run it through.",
    },
    {
      id: "stop-scrape", kind: "select", target: "stop-switch",
      title: "Stop the mixer before scraping down",
      cue: "Hit the stop switch fully before the guard or the scraper comes anywhere near the bowl.",
      why: "This is the one action that makes the next step legal at all — the beater has to be stopped, not slowing, before the guard opens. A mixer that's still coasting down is still a mixer with a moving beater in it.",
    },
    {
      id: "scrape-down", kind: "track", target: "scraper", seconds: 5,
      title: "Scrape the bowl down",
      cue: "Open the guard and run the scraper along the bowl wall in steady, controlled strokes.",
      why: "The scrape-down only happens stopped and guard open — the flip side of the rule that keeps the guard closed while the beater turns. A controlled pass along the wall gets the unmixed edges back into the batch without a hand anywhere near a beater that's still capable of moving.",
      track: {
        start: 0.15, green: [0.35, 0.6], rise: 0.5, fall: 0.4, drift: 0.12, label: "SCRAPE CONTROL",
        readout: (v) => (v < 0.35 ? "too tentative — missing the wall" : v > 0.6 ? "too fast — losing the stroke" : "controlled"),
      },
      holdBreakNote: "Stroke went ragged. Bring the scraper back to a steady, controlled pass along the wall.",
    },
    {
      id: "bowl-down", kind: "turn", target: "lift-crank",
      title: "Lower the bowl off the lift",
      cue: "Release the lock and turn the crank to bring the finished batch back down.",
      why: "The bowl comes down the same controlled way it went up — geared, not dropped — because a full 60-quart bowl let go of partway down the crank is exactly the weight the lift exists to manage in the first place.",
      turn: { turns: 0.5, axis: "y", label: "BOWL LIFT" },
    },
    {
      id: "deep-clean-lockout", kind: "turn", target: "main-power",
      title: "Lock out the mixer for the deep clean",
      cue: "Turn the main power off and apply your lock before the guard or the bowl seal comes apart for cleaning.",
      why: "A between-batch scrape happens stopped; a full teardown for the deep clean happens locked out — OSHA 1910.147, the same control of hazardous energy a machine shop uses on a press brake, sized here for a mixer somebody is about to reach fully inside of.",
      turn: { turns: 0.5, axis: "y", label: "MAIN POWER" },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["chute-guard-crack", "spindle-buildup"],
      itemNames: { "chute-guard-crack": "cracked chute guard flap", "spindle-buildup": "dried dough built up on the spindle" },
      itemNotes: {
        "chute-guard-crack": "The chute's flap guard has a crack running through the hinge. It still closes, but a cracked flap is one hard knock from not closing at all.",
        "spindle-buildup": "Dried dough has built up around the spindle collar. Buildup there is exactly what keeps an attachment from seating flush the next time somebody pins one on.",
      },
      title: "Walk the station before the next batch",
      cue: "Two things at this mixer are wrong. Find them by looking.",
      why: "A guard that still closes and a spindle that still spins are not the same as a mixer that's actually ready for the next baker — the two things worth catching now are exactly the ones nobody notices until the batch after this one.",
    },
  ],

  // Two things that happen at a mixer running at full torque: a baker who
  // reaches for the bowl instead of the switch, and a mechanical lock that
  // doesn't hold the way it's supposed to. See shared/game.js.
  interrupts: [
    {
      id: "reach-scrape",
      kind: "Reach into a running bowl",
      after: "mix-run", delay: 3, seconds: 11,
      alert: "Another baker has grabbed a scraper and is reaching straight for the bowl — the beater is still turning and they don't see it.",
      cue: "There's a hand headed for a moving beater and the mixer is still running.",
      target: "stop-switch",
      why: "Nobody scrapes a running bowl, and the fastest way to stop a hand that's already moving toward one is to kill the machine, not shout a warning that might land half a second too late. The stop switch is always closer than the reach is.",
      missNote: "The reach happened anyway while the beater kept turning. A 60-quart hook does not stop for a hand that gets there first — the switch has to beat the reach, not follow it.",
      wrongNote: "It's the stop switch. Kill the mixer before anything else — the reach is already happening.",
    },
    {
      id: "lift-slip",
      kind: "Bowl lift lock slipping",
      after: "scrape-down", delay: 3, seconds: 11,
      alert: "You feel the bowl lift's lock give a notch — the bowl has started to settle while the guard is still open and your hands are on the scraper.",
      cue: "The bowl underneath your hands is drifting down on its own.",
      target: "lift-lock-pin",
      why: "A lift lock that's slipped is a bowl in motion with nothing controlling it — with the guard open for the scrape-down, that's the one moment a settling bowl and a hand at the rim are sharing the same space. Re-seat the lock immediately, before the scrape continues.",
      missNote: "The bowl kept settling with the lock unseated and your hand still at the rim. It happened to stop before it caught anything. A lift lock that's given once is a lift lock that gives again — it gets reseated the moment it's felt, not after the stroke you're mid-way through.",
      wrongNote: "It's the lift lock pin — reseat it before the scraper goes back to the bowl.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, BM_ACCENT);

    const steelTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#c9d0d6", base2: "#b7bec5", step: 30 }), { repeat: 4, px: 256 });
    const steelMat = () => texturedMat(steelTex, { rough: 0.4, metal: 0.7, color: 0xc9d0d6 });

    // -------------------------------------------------------------- the mixer
    const mixer = group(g, 0, 0, -1.0);
    // Base and column.
    const base = slab(mixer, 0.62, 0.1, 0.62, 0, 0.05, 0, 0x8b929a, { radius: 0.02, rough: 0.4, metal: 0.7 });
    base.material = steelMat();
    box(mixer, 0.24, 1.5, 0.22, 0, 0.85, -0.16, 0x9aa1a8, { rough: 0.35, metal: 0.7 });
    // Head housing with the spindle.
    const head = group(mixer, 0, 1.6, -0.05);
    box(head, 0.42, 0.36, 0.34, 0, 0, 0, 0x9aa1a8, { rough: 0.35, metal: 0.7 });
    const spindle = cyl(head, 0.03, 0.03, 0.2, 0, -0.28, 0.1, 0x3c444c, { rough: 0.4, metal: 0.6, seg: 14 });
    hits["spindle"] = spindle;
    decal(head, 0.3, 0.09, 0, 0.05, 0.18, signFace("60 QT", { bg: "#2a1c0d", accent: "#c9915a", scale: 0.5 }));
    holoTag(mixer, "60-quart floor mixer", 0, 2.1, 0, { css: "#c9915a", w: 0.4 });

    // Lift crank on the column.
    const crankGroup = group(mixer, 0.14, 1.1, -0.16);
    cyl(crankGroup, 0.02, 0.02, 0.1, 0, 0, 0, 0x3c444c, { rough: 0.4, metal: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    const crankArm = group(crankGroup, 0.05, 0, 0);
    box(crankArm, 0.14, 0.02, 0.02, 0.05, 0, 0, 0x2b2f34, { rough: 0.5 });
    ball(crankArm, 0.02, 0.12, 0, 0, 0x22262b, { rough: 0.55, seg: 10 });
    reg(hits, crankGroup, "lift-crank");

    // Bowl on the lift arm — moves up/down with the bowl-up/bowl-down steps.
    const liftArm = group(mixer, 0, 0.5, -0.16);
    box(liftArm, 0.1, 0.4, 0.16, 0, 0.2, 0.18, 0x8b929a, { rough: 0.35, metal: 0.7 });
    const bowlGroup = group(liftArm, 0, 0.6, 0.36);
    cyl(bowlGroup, 0.26, 0.19, 0.34, 0, 0, 0, 0xdfe4e8, { rough: 0.2, metal: 0.8, seg: 24 });
    const dough = cyl(bowlGroup, 0.2, 0.2, 0.14, 0, 0.02, 0, 0xe8d4a8, { rough: 0.75, seg: 20 });
    hits["mixer-bowl"] = bowlGroup;

    // Beater/hook riding in the bowl once attached.
    const beaterInBowl = group(bowlGroup, 0, 0.55, 0);
    cyl(beaterInBowl, 0.012, 0.012, 0.5, 0, 0, 0, 0x8b929a, { rough: 0.35, metal: 0.75, seg: 10 });
    torus(beaterInBowl, 0.09, 0.014, 0, -0.2, 0, 0x8b929a, { rough: 0.35, metal: 0.75, seg: 8, seg2: 16 }).rotation.x = 0.3;
    beaterInBowl.visible = false;

    // Lift lock pin, engaged from the column.
    const lockPin = group(mixer, -0.14, 1.05, -0.14);
    cyl(lockPin, 0.016, 0.016, 0.09, 0, 0, 0, 0xb8402f, { rough: 0.45, metal: 0.4, seg: 10 }).rotation.z = Math.PI / 2;
    box(lockPin, 0.02, 0.03, 0.02, -0.05, 0, 0, 0x22262b, { rough: 0.5 });
    reg(hits, lockPin, "lift-lock-pin");

    // Bowl guard — a wire hoop with a chute flap, hinged over the bowl.
    const guard = group(head, 0, -0.42, 0.14, -0.15);
    torus(guard, 0.28, 0.014, 0, 0, 0, 0xf2c14b, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 });
    for (let i = 0; i < 3; i++) {
      const bar = box(guard, 0.008, 0.28, 0.008, Math.cos((i / 3) * Math.PI) * 0.2, -0.14, Math.sin((i / 3) * Math.PI) * 0.2, 0xf2c14b, { rough: 0.4, metal: 0.5, cast: false });
      bar.rotation.x = 0.5;
    }
    const chuteFlap = box(guard, 0.1, 0.02, 0.08, 0.2, -0.02, 0, 0xf2c14b, { rough: 0.45, metal: 0.4 });
    reg(hits, guard, "bowl-guard");
    hits["chute"] = chuteFlap;
    // The bowl rim itself, reachable through the guard — always a live
    // hazard zone, whether or not the beater happens to be turning.
    const rimZone = cyl(guard, 0.22, 0.22, 0.05, 0, -0.16, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false, seg: 16 });
    reg(hits, rimZone, "scrape-while-running");
    // The open top of the guard hoop, above the chute — where a bag gets
    // dumped when somebody skips the chute altogether.
    const guardTop = box(guard, 0.3, 0.03, 0.3, 0, 0.14, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, guardTop, "chute-bypass");
    // A reaching hand, hidden until the reach-scrape interrupt fires.
    const reachHand = group(head, 0.28, -0.3, 0.1, -0.6);
    ball(reachHand, 0.045, 0, 0, 0, 0xc99878, { rough: 0.75, seg: 12 });
    cyl(reachHand, 0.028, 0.03, 0.16, -0.1, 0, 0, 0xf2f2f2, { rough: 0.7, seg: 10 }).rotation.z = Math.PI / 2;
    reachHand.visible = false;
    // A hairline crack through the flap's hinge — a separate hit from the
    // flap itself, so the closing walk targets the crack, not the chute.
    const chuteCrack = box(chuteFlap, 0.09, 0.003, 0.006, 0, 0.011, -0.03, 0x6a5a2a, { rough: 0.7, cast: false });
    reg(hits, chuteCrack, "chute-guard-crack");

    // Guard wedge — the decoy that props the guard open and defeats the interlock.
    const wedge = group(mixer, 0.32, 1.15, 0.05);
    box(wedge, 0.05, 0.03, 0.05, 0, 0, 0, 0x8a6a3a, { rough: 0.9 });
    holoTag(wedge, "Wedge — guard propped", 0, 0.06, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, wedge, "reach-through-guard");

    // Dried buildup on the spindle collar — closing-walk find target.
    const buildup = torus(head, 0.035, 0.01, 0, -0.24, 0.1, 0xb8a06a, { rough: 0.9, seg: 6, seg2: 14 });
    reg(hits, buildup, "spindle-buildup");

    // Attachment rack — the beater to install, and an unpinned spare.
    const rack = group(g, 1.4, 0, -1.4);
    box(rack, 0.5, 0.02, 0.3, 0, 0.7, 0, 0x9aa1a8, { rough: 0.4, metal: 0.7 });
    for (const sx of [-0.2, 0.2]) cyl(rack, 0.013, 0.013, 0.7, sx, 0.35, 0.1, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 8 });
    const beater = group(rack, -0.05, 0.78, 0);
    cyl(beater, 0.014, 0.014, 0.28, 0, 0, 0, 0x8b929a, { rough: 0.35, metal: 0.75, seg: 10 });
    torus(beater, 0.07, 0.012, 0, -0.12, 0, 0x8b929a, { rough: 0.35, metal: 0.75, seg: 8, seg2: 16 }).rotation.x = 0.3;
    holoTag(beater, "Dough hook", 0, 0.14, 0, { css: "#c9915a", w: 0.28 });
    reg(hits, beater, "beater");
    const spareBeater = group(rack, 0.18, 0.78, 0);
    cyl(spareBeater, 0.014, 0.014, 0.24, 0, 0, 0, 0x9aa1a8, { rough: 0.4, metal: 0.7, seg: 10 });
    holoTag(spareBeater, "Spare paddle — unpinned", 0, 0.13, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, spareBeater, "attach-unpinned");
    const attachPin = group(rack, -0.05, 0.65, 0.08);
    cyl(attachPin, 0.008, 0.008, 0.05, 0, 0, 0, 0xb8402f, { rough: 0.4, metal: 0.4, seg: 8 }).rotation.x = Math.PI / 2;
    reg(hits, attachPin, "attach-pin");

    // Control pendant: speed dial, start/stop, main power.
    const pendant = group(g, -1.15, 0, -1.0, 0.45);
    box(pendant, 0.05, 1.0, 0.05, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
    box(pendant, 0.3, 0.5, 0.1, 0, 1.1, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const speedDial = group(pendant, -0.08, 1.28, 0.055);
    cyl(speedDial, 0.036, 0.036, 0.018, 0, 0, 0, 0xb8402f, { rough: 0.4, metal: 0.4, seg: 14 }).rotation.x = Math.PI / 2;
    const speedFace = decal(speedDial, 0.1, 0.04, 0, 0.03, 0.011, signFace("--", { bg: "#0d1c24", accent: "#c9915a", fg: "#f2e0c8", scale: 0.6 }), { glow: true, ei: 0.7 });
    reg(hits, speedDial, "speed-dial");
    const startSwitch = group(pendant, 0.06, 1.28, 0.055);
    box(startSwitch, 0.02, 0.05, 0.02, 0, 0, 0, 0x59c97b, { rough: 0.45 });
    reg(hits, startSwitch, "start-switch");
    const stopSwitch = group(pendant, 0.11, 1.28, 0.055);
    box(stopSwitch, 0.02, 0.05, 0.02, 0, 0, 0, 0xb8402f, { rough: 0.45 });
    reg(hits, stopSwitch, "stop-switch");
    const mainPower = group(pendant, 0, 0.95, 0.055);
    cyl(mainPower, 0.028, 0.028, 0.016, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    box(mainPower, 0.016, 0.03, 0.016, 0, 0.012, 0.01, 0xd8232a, { rough: 0.5 });
    reg(hits, mainPower, "main-power");
    holoTag(pendant, "Mixer control", 0, 1.42, 0, { css: "#c9915a", w: 0.3 });

    // Batch card.
    const card = holoPanel(g, 0.5, 0.36, -1.4, 1.55, -0.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,7,3,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c9915a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e0c9a8";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("BATCH CARD — SANDWICH LOAF", w * 0.06, h * 0.15);
      ctx.fillStyle = "#f6ecdc";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("60 QT · DOUGH HOOK", w * 0.06, h * 0.36);
      ctx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ctx.fillStyle = "#e0c9a8";
      ["Starting speed: 2", "Mix time: 8 min", "Ingredients through the chute only"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.54 + i * 0.13)));
    }, { ry: 0.4, accent: BM_ACCENT });
    reg(hits, card, "batch-card");

    // Ingredient bag, dragged to the chute.
    const bag = group(g, -0.7, 0, -2.2);
    box(bag, 0.24, 0.34, 0.16, 0, 0.17, 0, 0xe8dcc0, { rough: 0.85 });
    decal(bag, 0.2, 0.1, 0, 0.24, 0.081, signFace("FLOUR", { bg: "#e8dcc0", fg: "#7a5a30", scale: 0.55 }));
    holoTag(bag, "Ingredient bag", 0, 0.4, 0, { css: "#c9915a", w: 0.3 });
    reg(hits, bag, "ingredient-bag");

    // Scraper on a hook by the mixer.
    const scraper = group(g, 0.75, 0, -0.35);
    box(scraper, 0.02, 0.32, 0.02, 0, 0.4, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5, cast: false });
    slab(scraper, 0.1, 0.006, 0.06, 0, 0.2, 0, 0xdfe4e8, { radius: 0.01, rough: 0.3, metal: 0.6 });
    holoTag(scraper, "Bowl scraper", 0, 0.46, 0, { css: "#c9915a", w: 0.28 });
    reg(hits, scraper, "scraper");

    // Anti-fatigue mat in front of the mixer.
    slab(g, 1.3, 0.02, 0.7, 0, 0.01, -1.7, 0x22262b, { radius: 0.04, rough: 0.95, cast: false });
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) {
      box(g, 0.09, 0.006, 0.09, -0.5 + i * 0.2, 0.022, -1.95 + j * 0.24, 0x14171a, { cast: false, receive: false });
    }

    // Wire shelving with bulk ingredient bins, behind the mixer.
    const wireShelf = group(g, -2.3, 0, -1.6, 0.3);
    for (let s = 0; s < 3; s++) {
      box(wireShelf, 0.7, 0.02, 0.4, 0, 0.35 + s * 0.42, 0, 0x9aa1a8, { rough: 0.4, metal: 0.7 });
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(wireShelf, 0.014, 0.014, 1.3, sx * 0.32, 0.68, sz * 0.16, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 8 });
    }
    const binColours = [0xe8dcc0, 0xc9a86a, 0xd8cf9a, 0xe8dcc0];
    binColours.forEach((c, i) => {
      cyl(wireShelf, 0.14, 0.14, 0.18, -0.2 + (i % 2) * 0.4, 0.45 + Math.floor(i / 2) * 0.42, 0, c, { rough: 0.7, seg: 16 });
    });
    holoTag(wireShelf, "Bulk ingredient shelf", 0, 1.3, 0, { css: "#c9915a", w: 0.4 });

    // Baking sheet rack — sheet pans on edge, beside the scraper hook.
    const sheetRack = group(g, 1.6, 0, -0.9, -0.3);
    box(sheetRack, 0.02, 0.7, 0.5, 0, 0.4, 0, 0x8b929a, { rough: 0.4, metal: 0.6, cast: false });
    for (let i = 0; i < 5; i++) {
      box(sheetRack, 0.32, 0.02, 0.46, 0.02 + i * 0.03, 0.15 + i * 0.13, 0, 0x9aa1a8, { rough: 0.35, metal: 0.7 });
    }
    holoTag(sheetRack, "Sheet pans", 0, 0.85, 0, { css: "#c9915a", w: 0.3 });

    // Proofing rack — bread pans stacked on a rolling frame.
    const proofRack = group(g, -1.1, 0, -2.4, 0.4);
    for (const sx of [-0.24, 0.24]) box(proofRack, 0.03, 1.2, 0.03, sx, 0.6, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6, cast: false });
    for (let s = 0; s < 5; s++) {
      box(proofRack, 0.5, 0.015, 0.34, 0, 0.18 + s * 0.22, 0, 0x8b929a, { rough: 0.4, metal: 0.65, cast: false });
      box(proofRack, 0.44, 0.06, 0.28, 0, 0.21 + s * 0.22, 0, 0xc9a86a, { rough: 0.6 });
    }
    for (const [dx, dz] of [[-0.24, -0.16], [0.24, -0.16], [-0.24, 0.16], [0.24, 0.16]]) {
      cyl(proofRack, 0.03, 0.03, 0.02, dx, 0.02, dz, 0x1a1e23, { rough: 0.9, seg: 10 });
    }
    holoTag(proofRack, "Proofing rack", 0, 1.35, 0, { css: "#c9915a", w: 0.32 });

    // Flour dusting station — a sifter and a dusting bin beside the mixer.
    const dustStation = group(g, 0.65, 0, -1.85);
    cyl(dustStation, 0.12, 0.13, 0.5, 0, 0.25, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 16 });
    cyl(dustStation, 0.13, 0.13, 0.03, 0, 0.51, 0, 0x8b929a, { rough: 0.35, metal: 0.7, seg: 16 });
    holoTag(dustStation, "Flour bin", 0, 0.62, 0, { css: "#c9915a", w: 0.28 });

    // A stack of empty dough tubs beside the proofing rack.
    const tubStack = group(g, -1.7, 0, -1.9);
    for (let i = 0; i < 3; i++) {
      cyl(tubStack, 0.16, 0.14, 0.16, 0, 0.08 + i * 0.15, 0, 0xdfe4e8, { rough: 0.35, opacity: 0.8, seg: 18 });
    }

    // Bench scale for weighing ingredients against the batch card.
    const scale = group(g, -0.7, 0, -0.5);
    box(scale, 0.22, 0.04, 0.22, 0, 0.02, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    box(scale, 0.16, 0.02, 0.16, 0, 0.05, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7 });
    decal(scale, 0.14, 0.03, 0, 0.061, 0, signFace("0.0 kg", { bg: "#0d1c24", accent: "#c9915a", fg: "#f2e0c8", scale: 0.55 }));

    // Small waste bin beside the bench.
    const wasteBinM = group(g, 1.9, 0, 0.9);
    cyl(wasteBinM, 0.16, 0.13, 0.42, 0, 0.21, 0, 0x2b3138, { rough: 0.6, metal: 0.3, seg: 16 });
    cyl(wasteBinM, 0.17, 0.17, 0.03, 0, 0.42, 0, 0x1e2226, { rough: 0.6, metal: 0.3, seg: 16 });

    // Second baker at the bench, clear of the mixer entirely.
    standingFigure(g, 1.7, -2.6, { ry: -0.5, cloth: 0xf2f2f2, trousers: 0x2b3138, vest: false });

    let bowlUp = false, running = false, guardOpen = false, mixT = 0;
    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0.2, 1.3, -1.0),

      onStepComplete(step) {
        if (step.id === "bowl-up") { bowlUp = true; liftArm.position.y = 0.86; }
        if (step.id === "attach") beaterInBowl.visible = true;
        if (step.id === "load-chute") dough.scale.y = 1.15;
        if (step.id === "mix-run") running = true;
        if (step.id === "stop-scrape") { running = false; guardOpen = true; guard.rotation.x = -0.9; }
        if (step.id === "scrape-down") dough.material = mat(0xe0c9a0, { rough: 0.7 });
        if (step.id === "bowl-down") { bowlUp = false; guardOpen = false; guard.rotation.x = 0; liftArm.position.y = 0.5; }
        if (step.id === "walk") { chuteCrack.visible = false; buildup.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "lift-slip") liftArm.position.y -= 0.04;
        if (it.id === "reach-scrape") reachHand.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "lift-slip") liftArm.position.y += 0.04;
        if (it.id === "reach-scrape") reachHand.visible = false;
      },

      animate(t, dt, session) {
        void bowlUp; void guardOpen;
        if (running && session?.step?.id === "mix-run" && session.holding) {
          beaterInBowl.rotation.y += dt * 10;
          mixT += dt;
        }
        const g2 = session?.gauge;
        if (g2 && !g2.committed && session.step?.id === "speed-set") {
          repaint(speedFace, signFace(`${Math.round(g2.t * 10)}`, {
            bg: "#0d1c24", accent: g2.t >= 0.16 && g2.t <= 0.3 ? "#59c97b" : "#f2c14b", fg: "#f2e0c8", scale: 0.6,
          }));
        }
      },
    };
  },
};
