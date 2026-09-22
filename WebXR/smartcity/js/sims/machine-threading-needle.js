import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, group, decal, repaint, signFace } from "../../../shared/kit.js";
import { CITY, stationPad, holoTag, toolChest, instrument, standingFigure, rackFrame, rackUnit, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Machine Threading and Needle VR — Sewing & Garment Trades,
// station one. The single-needle lockstitch head the whole room stands
// around, taken from a cold machine to a proven first seam: power off before
// the needle ever comes out, the new needle seated with the scarf facing the
// hook the way it has to for the stitch to form at all, the machine threaded
// in its one correct path, the bobbin wound and cased so it feeds against the
// needle thread instead of fighting it, the tension proven on scrap before it
// is trusted on the ticket, and the needle guard down before the first real
// seam. Nothing here is optional order — a lockstitch machine threaded out of
// sequence either skips stitches or does not stitch at all, and a bare needle
// with the power live is the one habit that ends an operator's week.

const MTN_ACCENT = 0xc9a24b;

export const SIM_MACHINE_THREADING_NEEDLE = {
  id: "machine-threading-needle",
  index: "172",
  domain: "Garment manufacturing",
  trade: "Industrial sewing machine operator — Workers United (SEIU)",
  category: "Sewing & Garment Trades",
  indoor: "shop",
  certification: "Workers United (SEIU) and state apprenticeship standards for industrial sewing machine operators; OSHA 29 CFR 1910.212 machine guarding for the needle guard, 1910.147 control of hazardous energy for the power switch before servicing, and NIOSH ergonomics guidance for seated repetitive bench work",
  name: "Machine Threading and Needle",
  title: simTitle("Machine Threading and Needle"),
  tagline: "Power off, the needle set with the scarf right, threaded in path, the bobbin wound and cased, tension proven on scrap, the guard down",
  accent: MTN_ACCENT,
  accentCss: "#c9a24b",
  parSeconds: 230,
  footprint: 2.2,
  badge: { id: "first-seam-clean", name: "First Seam Clean", note: "A cold machine threaded and tensioned correctly, with the guard down before the first seam ran" },

  game: system({
    name: "Bench Authority",
    currency: "STITCH",
    ranks: ["Floor Trainee", "Machine Operator", "Set-Up Operator", "Lead Operator", "Bench Authority Certified"],
    badges: [
      { id: "power-first", name: "Power Off First", note: "Never touched the needle with the machine still live", test: AWARD.stepClean("power-off") },
      { id: "fingers-clear", name: "Fingers Clear", note: "Never reached into the needle or hook while it could move", test: AWARD.safe },
      { id: "tension-true", name: "Tension True", note: "Stitch length and tension both proven inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-setup", name: "Clean Set-Up", note: "No corrections through the whole thread-up", test: AWARD.clean },
      { id: "steady-thread", name: "Steady Hand", note: "Held the tension check without a break", test: AWARD.unbroken },
      { id: "quick-change", name: "Quick Change", note: "Machine proven and running inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "needle-touch-live": "You reached for the needle with the machine still powered. A lockstitch head restarts on a bumped pedal or a knee switch nobody meant to touch, and a needle at full speed does not pause for fingers that are supposed to be somewhere else — the power comes off at the switch before the needle is ever touched, every time.",
    "hook-area-live": "You reached under the throat plate into the hook and bobbin area with the power still on. That is the one place on this machine where a jammed thread and a moving hook meet a bare hand, and clearing a jam live is exactly how an operator finds out the hook did not actually stop turning when the pedal came off it.",
    "belt-guard-off": "The treadle motor's belt guard is off and the pulley is spinning exposed under the table. A V-belt running open at ankle height does not warn anyone before it takes a shoelace or a trouser cuff with it, which is the entire reason 29 CFR 1910.212 requires the guard back on before the machine runs.",
    "snips-open": "Somebody left the thread snips open, blade up, on the table edge. An open blade sitting where a hand reaches for fabric without looking is a cut that has nothing to do with the machine at all — snips close and go back to their clip the moment the cut is made.",
  },

  lateNotes: {
    "power-switch": "Power comes off before the needle is touched — that is the first move of this whole set-up, not something to circle back to.",
    "spare-needle": "Not yet. The old needle comes out and the clamp is checked first, or the new one is going into a clamp that still has to be prepared.",
    "bobbin-winder": "The bobbin is wound after the needle is seated and threaded, so the top thread is already in its own path before the bottom thread is built.",
    "tension-knob": "Tension gets set once the machine is threaded top and bottom — a dial turned against an unthreaded machine is proving nothing.",
    "foot-pedal": "Not yet. The guard is down and the tension is proven on scrap before the pedal runs a real seam.",
  },

  steps: [
    {
      id: "power-off", kind: "select", target: "power-switch",
      title: "Power off at the switch",
      cue: "Turn the machine off at its own power switch before touching the needle.",
      why: "Every needle change and every bit of threading that follows happens on a machine that cannot move, because the knee lever, the foot pedal and a stray bump are all still live paths to the needle bar until the switch itself is off. Reaching for the needle first and the switch second is the single habit that turns a routine change into an injury report.",
    },
    {
      id: "remove-needle", kind: "select", target: "old-needle",
      title: "Loosen the clamp and drop the old needle",
      cue: "Loosen the needle clamp screw and let the worn or bent needle drop into your hand, not the machine.",
      why: "A needle that has been bent, dulled, or has picked up a burr from hitting a pin is what causes the very skipped stitches and pulled threads that make an operator suspect the tension first — checking the needle before touching a single dial is what actually finds the fault instead of chasing it.",
    },
    {
      id: "install-needle", kind: "drag", target: "spare-needle",
      title: "Seat the new needle with the scarf toward the hook",
      cue: "Carry the fresh needle up into the clamp with its scarf — the long flat groove — facing the hook side, and push it home to the stop.",
      why: "The hook has to catch the loop of top thread the instant it forms behind the scarf, and it can only find that loop if the scarf is facing exactly where the hook swings past — a needle seated backwards threads and sews nothing but skipped stitches no amount of tension adjustment will ever fix, because the fault is the needle's orientation, not the thread.",
      drag: { to: "needle-clamp-socket", radius: 0.3, missNote: "Not seated in the clamp — carry the needle all the way up to the stop with the scarf toward the hook." },
    },
    {
      id: "clamp-needle", kind: "select", target: "needle-clamp-screw",
      title: "Tighten the needle clamp screw",
      cue: "Turn the clamp screw down snug so the needle cannot rotate or slip up under load.",
      why: "A needle that can twist in the clamp will drift out of alignment with the hook a few stitches into the seam, and one that can creep upward under the fabric's own drag will strike the throat plate — both failures look identical to a threading mistake from the operator's chair, which is why the screw gets checked snug before anything else is blamed.",
    },
    {
      id: "thread-path", kind: "sequence",
      targets: ["thread-spool", "pretension-guide", "tension-discs", "take-up-lever", "thread-guide-2", "needle-eye"],
      itemNames: {
        "thread-spool": "off the spool", "pretension-guide": "pre-tension guide",
        "tension-discs": "through the tension discs", "take-up-lever": "around the take-up lever",
        "thread-guide-2": "the lower thread guide", "needle-eye": "through the needle eye",
      },
      title: "Thread the machine in its one correct path",
      cue: "Follow the thread from the spool through every guide in order, finishing at the needle eye.",
      why: "A lockstitch head only forms a stitch because the take-up lever pulls slack at the exact moment the hook has passed through the loop below the needle plate — thread fed past any guide out of order arrives at the needle with the wrong amount of slack at the wrong moment, and the machine sews air, snarls under the plate, or snaps the thread on the first few stitches.",
      outOfOrderNote: "This machine has one thread path, spool to needle. Skipping a guide is not a shortcut — reset and take them in order.",
    },
    {
      id: "bobbin-wind", kind: "hold", target: "bobbin-winder", seconds: 4,
      title: "Wind the bobbin",
      cue: "Press the empty bobbin onto the winder spindle and hold it against the drive wheel until it is full.",
      why: "An underwound bobbin runs out mid-seam and leaves a gap that only shows up once the garment is turned right-side out, and a bobbin wound loose or lopsided feeds unevenly against the top thread no amount of tensioning above the plate can correct — winding it full and even here is cheaper than picking a seam apart later.",
      holdBreakNote: "Let go before it finished winding. A partly wound bobbin runs out mid-seam — hold it against the spindle for the full wind.",
    },
    {
      id: "case-bobbin", kind: "select", target: "bobbin-case",
      title: "Seat the bobbin in its case",
      cue: "Drop the wound bobbin into the case so the thread pulls off in the direction the case is marked for.",
      why: "The case is built to add a small, constant drag to the bottom thread as it feeds, and it only does that if the bobbin sits in it the direction the case calls for — dropped in backwards, the same case either free-spins the thread with no tension at all or binds it solid, and both show up on the seam as the loops nobody can explain.",
    },
    {
      id: "insert-shuttle", kind: "drag", target: "bobbin-case",
      title: "Insert the case into the shuttle hook",
      cue: "Carry the loaded case into the hook until its latch clicks home under the throat plate.",
      why: "A case that is not fully seated in the hook works loose the first time the hook spins past it at speed, and a bobbin case loose inside a running shuttle is metal meeting metal at several hundred stitches a minute — the click of the latch is the only proof it is actually captured, not just resting there.",
      drag: { to: "shuttle-socket", radius: 0.32, missNote: "Not latched into the hook — carry the case fully home until it clicks." },
    },
    {
      id: "power-on", kind: "select", target: "power-switch",
      title: "Restore power for the tension check",
      cue: "Now that both threads are in and the case is latched, turn the machine back on.",
      why: "The machine goes live again only once every hand tool and every finger is out of the needle and hook areas for good — power comes back on to run thread through the machine, not to finish a mechanical step that still wants both hands inside it.",
    },
    {
      id: "tension", kind: "turn", target: "tension-knob",
      title: "Set the top tension",
      cue: "Turn the tension dial to the middle of the working range before the test seam.",
      why: "Top tension and bobbin tension have to meet exactly at the middle of the fabric, not favour one side or the other — set too tight, the seam puckers and the bobbin thread gets dragged up to the top of the cloth; set too loose, loops of top thread sit loose on the underside where a QA inspector finds them in one glance.",
      turn: { turns: 0.4, axis: "z", label: "TENSION" },
    },
    {
      id: "test-seam", kind: "gauge", target: "stitch-gauge",
      title: "Sew a test seam on scrap and check the stitch length",
      cue: "Run a few inches of stitching on the scrap swatch, then read the stitch length off the gauge.",
      why: "Stitch length is set on the machine but proven on cloth, because the same setting bites differently on a lightweight lining than it does on the heavier ticket fabric — the test seam on scrap is what confirms both tension and stitch length are right before the machine ever touches a piece that is going into a bundle.",
      gauge: { label: "STITCH LENGTH", speed: 0.75, green: [0.44, 0.6], readout: (t) => `${(1.8 + t * 2.4).toFixed(1)} mm`, missNote: "Outside the ticket's stitch-length spec — adjust the setting and sew another test seam." },
    },
    {
      id: "needle-guard", kind: "select", target: "needle-guard",
      title: "Lower the needle guard",
      cue: "Swing the finger guard down in front of the needle before the first real seam.",
      why: "The guard is the one thing standing between a guiding finger and the needle once the operator's attention is on feeding fabric instead of watching the needle bar — it goes down before production starts, not after the first close call proves why it was there.",
    },
    {
      id: "first-real-seam", kind: "hold", target: "foot-pedal", seconds: 3,
      title: "Sew the first seam on the actual piece",
      cue: "Feed the ticket's fabric under the guard and hold the pedal through a clean, even seam.",
      why: "The first seam on the real fabric is the one that proves the whole set-up — scrap and ticket fabric do not always behave the same under the same tension, so nothing goes to a bundle until this seam has actually been looked at, not just felt under the hands.",
      holdBreakNote: "Pedal released mid-seam. An uneven start on the ticket fabric is exactly the flaw the test seam was supposed to catch — hold it through cleanly.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["cone-unseated", "oil-cap-loose"],
      itemNames: { "cone-unseated": "thread cone off its pin", "oil-cap-loose": "loose oil reservoir cap" },
      itemNotes: {
        "cone-unseated": "A thread cone sitting crooked on its pin unwinds unevenly and snags the moment the machine runs at speed.",
        "oil-cap-loose": "An oil cap left loose weeps onto the bed and the first fabric that touches it carries the stain into the bundle.",
      },
      title: "Walk the machine before it goes into production",
      cue: "Two things at this station are out of place. Find them by looking.",
      why: "A set-up that threads and sews one clean test seam can still send a whole bundle into the wash with an oil stain or waste an hour of running time to a cone that unwinds crooked — the two minutes spent looking at the whole machine, not just the needle, is what catches either one before the first real bundle runs.",
    },
  ],

  // A cold machine gets two hands near the needle at once, and a distracted
  // moment near the presser foot. See shared/game.js.
  interrupts: [
    {
      id: "handwheel-reach",
      kind: "Second hand at the wheel",
      after: "clamp-needle", delay: 3, seconds: 11,
      alert: "A coworker reaches over to help by turning the handwheel toward you while your fingers are still tightening the needle clamp.",
      cue: "Somebody's hand is on the handwheel while yours is at the needle.",
      target: "handwheel",
      why: "The handwheel is a direct mechanical link to the needle bar — turning it by hand moves the needle exactly as surely as the motor does, only without any warning first. Your hand stops the wheel before it stops helping, because a needle that drops half an inch onto fingers that are already there does not care whose hand turned the wheel.",
      missNote: "The wheel turned while your fingers were still at the clamp. Nothing caught this time — the needle came down on an empty clamp, not an empty one with your hand in it. That is luck, not the guard this station is supposed to teach.",
      wrongNote: "That's not the clamp screw — the hand on the handwheel is what has to stop moving right now.",
    },
    {
      id: "presser-drop",
      kind: "Presser foot drops",
      after: "thread-path", delay: 4, seconds: 11,
      alert: "Your sleeve catches the presser foot lifter and the foot drops while your guide finger is still under it, feeding the thread through the last guide.",
      cue: "The presser foot just came down on your own guide finger.",
      target: "presser-lifter",
      why: "The lifter knee-lever is close enough to a threading hand that a sleeve or an elbow finds it without anyone meaning to, and a presser foot dropping onto a finger that is threading the eye at that instant is a pinch injury for nothing more than a moment's inattention — the lifter goes back up before the hand comes out, not after.",
      missNote: "The foot stayed down on the guide finger through the rest of the threading. It happened to be a light pinch this time, not a needle that was also coming down — the lifter gets raised the instant it drops, every time, not judged case by case.",
      wrongNote: "The needle eye can wait — get the lifter back up off your finger first.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, MTN_ACCENT);
    box(g, 4.6, 0.1, 4.2, 0, 0.05, 0, 0x4a4640, { rough: 0.9 });

    // The sewing table: cast-iron stand, flat bed, the machine head on top.
    const table = group(g, 0, 0.1, -0.7);
    for (const sx of [-0.7, 0.7]) box(table, 0.08, 0.75, 0.5, sx, 0.375, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    box(table, 0.06, 0.5, 0.4, -0.7, 0.2, 0.32, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const bed = box(table, 1.5, 0.05, 0.7, 0, 0.75, 0, 0x2b2f34, { rough: 0.5, metal: 0.55 });
    void bed;
    // The head: base, standard, needle bar, presser bar, hand wheel.
    const head = group(table, 0.1, 0.78, 0);
    box(head, 0.75, 0.08, 0.28, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7 });
    box(head, 0.14, 0.5, 0.22, -0.28, 0.29, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7 });
    box(head, 0.6, 0.14, 0.24, 0.02, 0.55, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7 });
    const arm = box(head, 0.5, 0.1, 0.16, 0.06, 0.42, 0.06, 0xdfe4e8, { rough: 0.3, metal: 0.7 });
    void arm;
    // Needle bar, presser bar and the throat-plate area.
    const needleBar = group(head, 0.28, 0.42, 0.06);
    cyl(needleBar, 0.012, 0.012, 0.28, 0, -0.05, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    const needleClampBox = box(needleBar, 0.03, 0.05, 0.03, 0, -0.16, 0, 0x22262b, { rough: 0.5 });
    const oldNeedle = cyl(needleBar, 0.004, 0.001, 0.09, 0, -0.23, 0, 0xdfe4e8, { rough: 0.2, metal: 0.9, seg: 8 });
    reg(hits, oldNeedle, "old-needle");
    reg(hits, needleClampBox, "needle-clamp-screw");
    const needleSocket = box(needleBar, 0.02, 0.02, 0.02, 0, -0.19, 0, 0xffffff, { rough: 0.5 });
    needleSocket.visible = false; hits["needle-clamp-socket"] = needleSocket;
    const eyeMarker = box(needleBar, 0.015, 0.015, 0.015, 0, -0.28, 0, 0xffffff, { rough: 0.5 });
    eyeMarker.visible = false; reg(hits, eyeMarker, "needle-eye");
    const presserBar = group(head, 0.28, 0.42, 0.1);
    cyl(presserBar, 0.012, 0.012, 0.24, 0, -0.03, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 10 });
    const presserFoot = box(presserBar, 0.06, 0.02, 0.1, 0, -0.15, 0, 0x22262b, { rough: 0.5 });
    const lifter = group(head, -0.05, 0.28, -0.13);
    box(lifter, 0.14, 0.02, 0.05, 0, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    reg(hits, lifter, "presser-lifter");

    // Hand wheel, right end of the head.
    const wheelGroup = group(head, 0.42, 0.25, 0);
    const wheel = torus(wheelGroup, 0.09, 0.02, 0, 0, 0, 0x22262b, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 });
    wheel.rotation.y = Math.PI / 2;
    cyl(wheelGroup, 0.03, 0.03, 0.05, 0, 0, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 12 }).rotation.z = Math.PI / 2;
    reg(hits, wheelGroup, "handwheel");

    // Tension assembly on the face plate: pre-tension guide, tension discs
    // and knob, take-up lever, lower thread guide.
    const preTension = cyl(head, 0.014, 0.014, 0.02, -0.05, 0.5, 0.13, 0xb8402f, { rough: 0.5, metal: 0.3, seg: 10 });
    reg(hits, preTension, "pretension-guide");
    const discs = group(head, 0.02, 0.46, 0.13);
    cyl(discs, 0.025, 0.025, 0.01, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 14 });
    cyl(discs, 0.025, 0.025, 0.01, 0, 0.012, 0, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 14 });
    reg(hits, discs, "tension-discs");
    const tensionKnob = cyl(head, 0.02, 0.02, 0.05, 0.02, 0.46, 0.17, 0xf2c14b, { rough: 0.5, seg: 12 });
    tensionKnob.rotation.z = Math.PI / 2;
    reg(hits, tensionKnob, "tension-knob");
    const takeUp = group(head, -0.02, 0.5, 0.1, -0.4);
    box(takeUp, 0.02, 0.1, 0.012, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.85 });
    reg(hits, takeUp, "take-up-lever");
    const guide2 = cyl(head, 0.01, 0.01, 0.02, 0.1, 0.38, 0.11, 0xb8402f, { rough: 0.5, metal: 0.3, seg: 10 });
    reg(hits, guide2, "thread-guide-2");

    // Thread stand above, one spool.
    const stand = group(table, 0.05, 0.78, -0.28);
    cyl(stand, 0.012, 0.012, 0.5, 0, 0.25, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    box(stand, 0.16, 0.02, 0.16, 0, 0.5, 0, CITY.steel, { rough: 0.4, metal: 0.6 });
    const spool = cyl(stand, 0.035, 0.035, 0.09, 0, 0.44, 0, MTN_ACCENT, { rough: 0.6, seg: 14 });
    reg(hits, spool, "thread-spool");
    const threadLine = box(stand, 0.004, 0.32, 0.004, 0.16, 0.32, 0.34, 0xf4ecd0, { rough: 0.6, cast: false });
    void threadLine;
    // A cone sitting crooked on its pin, and a loose oil-reservoir cap — the
    // closing-walk decoys.
    const coneUnseated = cyl(stand, 0.032, 0.032, 0.08, -0.14, 0.42, 0, MTN_ACCENT, { rough: 0.6, seg: 12 });
    coneUnseated.rotation.z = 0.4;
    reg(hits, coneUnseated, "cone-unseated");
    const oilCap = group(table, 0.35, 0.79, -0.15, 0.2);
    cyl(oilCap, 0.03, 0.03, 0.05, 0, 0, 0, 0x2b6f47, { rough: 0.5, opacity: 0.85, transparent: true });
    cyl(oilCap, 0.02, 0.02, 0.015, 0, 0.03, 0.02, 0x22262b, { rough: 0.5, seg: 10 });
    reg(hits, oilCap, "oil-cap-loose");

    // Bobbin winder on the machine's top-right shoulder, and the bobbin case
    // area under the throat plate.
    const winder = group(head, 0.34, 0.62, -0.1);
    cyl(winder, 0.03, 0.03, 0.04, 0, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 12 });
    const bobbinBlank = cyl(winder, 0.018, 0.018, 0.03, 0, 0.03, 0, 0xdfe4e8, { rough: 0.4, metal: 0.4, seg: 12 });
    void bobbinBlank;
    reg(hits, winder, "bobbin-winder");
    const throatPlate = box(head, 0.16, 0.01, 0.14, 0.2, -0.005, 0.06, 0xb9bec4, { rough: 0.4, metal: 0.7 });
    void throatPlate;
    const bobbinCase = group(g, -1.55, 0.78, -0.55, 0.3);
    cyl(bobbinCase, 0.03, 0.03, 0.02, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 14 });
    torus(bobbinCase, 0.032, 0.006, 0, 0.013, 0, 0x22262b, { rough: 0.5, seg: 8, seg2: 20 });
    holoTag(bobbinCase, "bobbin case", 0, 0.09, 0, { css: "#c9a24b", w: 0.26 });
    reg(hits, bobbinCase, "bobbin-case");
    const shuttleSocket = box(head, 0.05, 0.02, 0.05, 0.2, -0.02, 0.06, 0xffffff, { rough: 0.5 });
    shuttleSocket.visible = false; hits["shuttle-socket"] = shuttleSocket;

    // Needle guard, hinged in front of the needle.
    const guard = group(head, 0.28, 0.35, 0.14, -0.3);
    box(guard, 0.03, 0.14, 0.01, 0, 0, 0, 0xe8b02e, { rough: 0.5, opacity: 0.75, transparent: true });
    reg(hits, guard, "needle-guard");

    // Foot pedal on the floor, power switch on the table edge.
    const pedal = group(g, 0.1, 0.1, 0.55);
    box(pedal, 0.3, 0.06, 0.22, 0, 0.03, 0, 0x22262b, { rough: 0.6 });
    box(pedal, 0.26, 0.02, 0.18, 0, 0.07, 0.01, 0x14171a, { rough: 0.6 });
    reg(hits, pedal, "foot-pedal");
    const switchBox = group(table, 0.65, 0.55, 0.28);
    box(switchBox, 0.06, 0.08, 0.04, 0, 0, 0, 0x22262b, { rough: 0.5 });
    const switchPaddle = box(switchBox, 0.02, 0.045, 0.02, 0, 0.01, 0.025, 0xd2312b, { rough: 0.5 });
    decal(switchBox, 0.09, 0.025, 0, -0.05, 0.022, signFace("POWER", { bg: "#22262b", accent: "#c9a24b", scale: 0.55 }));
    reg(hits, switchBox, "power-switch");

    // Test-seam scrap swatch and the stitch gauge tool.
    const scrap = box(table, 0.3, 0.006, 0.18, 0.05, 0.79, 0.2, 0xd9d2bc, { rough: 0.7 });
    void scrap;
    const stitchGauge = instrument(g, -0.5, 0.85, 0.35, { idle: "-.- mm", color: MTN_ACCENT, w: 0.12, d: 0.19 });
    holoTag(stitchGauge, "stitch gauge", 0, 0.15, 0, { css: "#c9a24b", w: 0.26 });
    reg(hits, stitchGauge, "stitch-gauge");

    // Spare needle case and open snips — the sharps that live at this bench.
    const needleCase = group(g, 0.55, 0.79, 0.32, 0.4);
    box(needleCase, 0.08, 0.015, 0.05, 0, 0, 0, 0xf2efe6, { rough: 0.6 });
    const spareNeedle = cyl(needleCase, 0.004, 0.001, 0.09, 0, 0.05, 0, 0xdfe4e8, { rough: 0.2, metal: 0.9, seg: 8 });
    holoTag(needleCase, "spare needle", 0, 0.11, 0, { css: "#c9a24b", w: 0.24 });
    reg(hits, spareNeedle, "spare-needle");
    const snips = group(g, 0.9, 0.79, -0.2, 0.6);
    box(snips, 0.09, 0.008, 0.02, 0, 0, 0, 0xb9bec4, { rough: 0.3, metal: 0.8 });
    box(snips, 0.02, 0.008, 0.05, -0.04, 0, 0.03, 0x22262b, { rough: 0.6 });
    reg(hits, snips, "snips-open");

    // Hazard zones: needle area live, hook area live, and the exposed belt.
    const needleZone = box(head, 0.1, 0.14, 0.1, 0.28, 0.34, 0.06, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, needleZone, "needle-touch-live");
    const hookZone = box(head, 0.14, 0.1, 0.14, 0.2, -0.04, 0.06, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hookZone, "hook-area-live");

    // Treadle motor under the table with its belt run — guard shown removed.
    const under = group(table, 0.3, 0, 0.2);
    box(under, 0.18, 0.14, 0.14, 0, 0.14, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const pulley = cyl(under, 0.05, 0.05, 0.03, 0, 0.24, 0, 0x8b929a, { rough: 0.4, metal: 0.7, seg: 16 });
    void pulley;
    const belt = box(under, 0.02, 0.4, 0.02, 0, 0.5, 0, 0x1b1e22, { rough: 0.6 });
    reg(hits, belt, "belt-guard-off");

    // -------------------------------------------------------- room dressing
    // The room this station stands in: two more single-needle heads down the
    // line, the overlock and cutting table at the far side, an industrial
    // press, a thread rack, bolts of cloth, cut bundles, and two co-workers
    // clear of every control.
    for (const dz of [1.1, 2.0]) {
      const other = group(g, -1.9, 0.1, -1.0 + dz * -0.6, 0);
      box(other, 1.2, 0.75, 0.5, 0, 0.375, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
      box(other, 0.6, 0.28, 0.22, -0.1, 0.9, 0, 0xdfe4e8, { rough: 0.3, metal: 0.6 });
      cyl(other, 0.07, 0.02, 0.28, 0.24, 1.0, 0, 0x22262b, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    }
    const overlockBox = group(g, 1.9, 0.1, -1.7, -0.5);
    box(overlockBox, 0.7, 0.75, 0.5, 0, 0.375, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    box(overlockBox, 0.4, 0.3, 0.3, 0, 0.9, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6 });
    holoTag(overlockBox, "overlock", 0, 1.15, 0, { css: "#c9a24b", w: 0.24 });
    const cutTable = group(g, 2.0, 0.1, 1.4, 0.2);
    box(cutTable, 1.4, 0.75, 0.8, 0, 0.375, 0, 0x6b5b46, { rough: 0.7 });
    box(cutTable, 1.3, 0.03, 0.7, 0, 0.77, 0, 0xe6ddc6, { rough: 0.6 });
    holoTag(cutTable, "cutting table", 0, 0.95, 0, { css: "#c9a24b", w: 0.28 });
    const press = group(g, -2.3, 0.1, 1.7, 0.3);
    box(press, 0.5, 1.1, 0.5, 0, 0.55, 0, 0x53606b, { rough: 0.6, metal: 0.4 });
    box(press, 0.6, 0.1, 0.6, 0, 1.15, 0, 0x3a4048, { rough: 0.6, metal: 0.5 });
    holoTag(press, "press", 0, 1.35, 0, { css: "#c9a24b", w: 0.2 });

    const threadRack = rackFrame(g, -0.3, 1.9, { ry: 0, h: 1.1 });
    for (let i = 0; i < 3; i++) rackUnit(threadRack, 0.22 + i * 0.3, ["SPUN POLY", "COTTON WRAP", "HEAVY BOND"][i], { css: "#c9a24b" });

    const bolts = group(g, 1.4, 0.1, 2.2, 0.2);
    for (let i = 0; i < 3; i++) {
      cyl(bolts, 0.15, 0.15, 0.7, i * 0.34, 0.15, 0, [0x4f6f8c, 0x8c5a4f, 0x5a8c6f][i], { rough: 0.7, seg: 14 }).rotation.z = Math.PI / 2;
    }
    holoTag(bolts, "cloth bolts", 0.34, 0.4, 0, { css: "#c9a24b", w: 0.24 });

    const bundle = group(g, -1.2, 0.1, 1.9, -0.3);
    box(bundle, 0.4, 0.28, 0.3, 0, 0.14, 0, 0xd8c9a3, { rough: 0.7 });
    box(bundle, 0.42, 0.02, 0.32, 0, 0.29, 0, 0x8b929a, { rough: 0.6, metal: 0.3 });
    holoTag(bundle, "cut bundle", 0, 0.42, 0, { css: "#c9a24b", w: 0.24 });

    toolChest(g, 2.4, -0.2, { ry: -0.4, color: 0x5b6672 });
    const crewOne = standingFigure(g, -2.4, -1.3, { ry: 0.6, cloth: 0x37505f });
    const crewTwo = standingFigure(g, 2.6, 0.55, { ry: -1.6, cloth: 0x506070 });
    void crewOne; void crewTwo;

    let locked = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, -0.7),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "power-off") { locked = true; switchPaddle.position.z = -0.005; }
        if (step.id === "remove-needle") oldNeedle.visible = false;
        if (step.id === "install-needle") { spareNeedle.parent.remove(spareNeedle); needleBar.add(spareNeedle); spareNeedle.position.set(0, -0.23, 0); spareNeedle.rotation.set(0, 0, 0); }
        if (step.id === "case-bobbin") { bobbinCase.rotation.y = 0; }
        if (step.id === "insert-shuttle") { bobbinCase.parent.remove(bobbinCase); head.add(bobbinCase); bobbinCase.position.set(0.2, -0.02, 0.06); bobbinCase.scale.set(0.4, 0.4, 0.4); }
        if (step.id === "power-on") { locked = false; switchPaddle.position.z = 0.025; }
        if (step.id === "needle-guard") guard.rotation.y = 0;
        if (step.id === "walk") { /* nothing left to fix visibly beyond feedback */ }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "handwheel-reach") wheelGroup.rotation.x = 0.6;
        if (it.id === "presser-drop") presserFoot.position.y = -0.19;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "handwheel-reach") wheelGroup.rotation.x = 0;
        if (it.id === "presser-drop") presserFoot.position.y = -0.15;
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.kind === "turn" && step.id === "tension") tensionKnob.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "test-seam") {
          repaint(stitchGauge.userData.screen, signFace(`${(1.8 + gg.t * 2.4).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#fff3d6", scale: 0.6 }));
        }
        if (locked) wheel.rotation.x = 0;
        else if (session?.step?.id === "first-real-seam" && session.holding) wheel.rotation.x += dt * 12;
        void guard;
      },
    };
  },
};
