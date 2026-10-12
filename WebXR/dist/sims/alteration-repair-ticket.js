import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Alteration Repair Ticket VR — Sewing & Garment Trades, station two.
// A single alterations ticket worked end to end at the tailor's bench: the
// garment mounted on the dress form against the customer's own pinned fit
// marks, a hem taken up and a zipper replaced, the ripper and the pins
// handled the way a bench that sees them all day actually handles them, and
// the ticket closed out with a price, a time and a fit the customer pinned
// themselves — not a guess at what "a little shorter" meant.

const ALT_ACCENT = 0xd68b6b;

export const SIM_ALTERATION_REPAIR_TICKET = {
  id: "alteration-repair-ticket",
  index: "180",
  domain: "Apparel manufacturing",
  trade: "Alterations tailor — Workers United",
  category: "Sewing & Garment Trades",
  indoor: "shop",
  certification: "Workers United (SEIU) alterations tailor apprenticeship standards; OSHA 29 CFR 1910.212 machine guarding for the alterations machine; 1910.1200 hazard communication for the pressing station; NIOSH ergonomics guidance for close, standing bench work at the form",
  name: "Alteration Repair Ticket",
  title: simTitle("Alteration Repair Ticket"),
  tagline: "Garment on the form, ripper away from the hand, hem re-sewn, zipper replaced, and the ticket closed against the customer's own pins",
  accent: ALT_ACCENT,
  accentCss: "#d68b6b",
  parSeconds: 260,
  footprint: 2.3,
  badge: { id: "ticket-closed-right", name: "Ticket Closed Right", note: "A hem and a zipper both re-sewn to the customer's own pinned fit, and every pin off the bench before it closed" },

  game: system({
    name: "Bench Authority",
    currency: "SEAM",
    ranks: ["Presser", "Alterations Hand", "Tailor", "Lead Tailor", "Bench Authority Certified"],
    badges: [
      { id: "ripper-clear", name: "Ripper Clear", note: "Never opened the ripper toward the guiding hand", test: AWARD.safe },
      { id: "steady-hem", name: "Steady Hem", note: "Held the hem seam without a break", test: AWARD.unbroken },
      { id: "to-the-pins", name: "To The Pins", note: "Both fit checks close to the customer's own marks", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-ticket", name: "Clean Ticket", note: "No corrections through the whole ticket", test: AWARD.clean },
      { id: "flagged-fabric", name: "Flagged Fabric", note: "Called the limit on a change the fabric couldn't take", test: AWARD.stepClean("sew-zipper") },
      { id: "ticket-fast", name: "Ticket Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "ripper-toward-hand": "That seam ripper is lying with its hook turned toward where your guiding hand would sit. A ripper that slips does it fast and close to the fabric it's already inside — it opens away from the hand holding the garment, every time it's picked up, not just when there's room to be careful.",
    "pins-in-mouth": "Those pins are loose on a tray at exactly the height a tailor parks them in their mouth while both hands are busy pinning a hem. A dropped pin from the mouth is a swallowed or aspirated pin, and the wrist pincushion exists specifically so the habit never has to start.",
    "iron-face-down": "The iron is sitting face-down and still hot on the padded board, unattended. Left soleplate-down, it scorches whatever's underneath in seconds and stays hot long after anyone's stopped watching it — it stands on its heel the instant it's not moving fabric, every time.",
    "cord-snag": "The iron's cord is running straight across the floor in front of the dress form's casters instead of clipped up out of the walkway. A cord caught under a rolling form travels with it, and the next thing that moves is either the iron off the board or the form off its wheels.",
  },

  lateNotes: {
    "seam-ripper": "The garment goes on the form against the customer's pins first — a ripper opened on a seam nobody's confirmed yet is a guess made permanent.",
    "new-zipper": "Not yet. The old zipper's stitching comes out clean before a new one goes anywhere near the placket.",
  },

  steps: [
    {
      id: "ticket", kind: "select", target: "alter-ticket",
      title: "Read the alteration ticket",
      cue: "Check what the customer marked: hem, zipper, and any take-in, before touching the garment.",
      why: "The ticket is the customer's own request in their own words, and it's what every cut and stitch that follows answers to — not a memory of what they said at the counter an hour ago. A tailor who starts unpicking before reading the ticket is trusting a recollection over the actual order in front of them.",
    },
    {
      id: "garment-to-form", kind: "drag", target: "garment",
      title: "Mount the garment on the form",
      cue: "Carry the garment from the hanger rack and settle it onto the dress form at the customer's pinned marks.",
      why: "The customer pinned their own fit for a reason: nobody else can feel where a waistband sits or a hem falls on their own body from across a counter. Mounted on the form at those pins, the garment holds the shape it's actually meant to end up in, instead of the shape it happens to hang in on a hanger.",
      drag: { to: "form-mount", radius: 0.3, missNote: "Not seated on the form — line the garment up with the customer's pins before letting go." },
    },
    {
      id: "measure", kind: "gauge", target: "tape-measure",
      title: "Measure to the customer's pins",
      cue: "Run the tape from the pinned mark to the hem and commit inside the ticket's tolerance.",
      why: "A hem taken up by eye against 'about here' drifts a little on every garment a bench sees in a day; a hem measured against the actual pin the customer placed does not. The tape against their own mark is the only number on this ticket that isn't the tailor's opinion of what looked right.",
      gauge: { label: "HEM LENGTH", speed: 0.8, green: [0.42, 0.6], readout: (t) => `${(2 + t * 3).toFixed(1)} in`, missNote: "Off the ticket's tolerance — remeasure against the customer's own pin, not the fold." },
    },
    {
      id: "seam-ripper", kind: "select", target: "seam-ripper",
      title: "Open the old hem with the ripper",
      cue: "Pick up the seam ripper and draw it through the stitch line, hook angled away from your guiding hand.",
      why: "The ripper's hook is what catches a single thread and pulls it clean; pointed toward the hand holding the fabric taut, the same motion that catches a stitch catches a knuckle the moment it skips. Angled away, a slip runs off the fabric's edge into open air instead of into your own hand.",
    },
    {
      id: "unpick-hem", kind: "sequence",
      targets: ["hem-thread", "hem-stitches", "hem-crease"],
      itemNames: { "hem-thread": "cut thread tails", "hem-stitches": "old stitch line", "hem-crease": "pressed-in crease" },
      itemNotes: { "hem-thread": "The cut ends get pulled clear first so they don't sew themselves into the next line of stitching by accident." },
      title: "Clear the old hem in order",
      cue: "Pull the loose thread tails, pick out the rest of the stitch line, then press out the old crease.",
      why: "Threads left in the fabric after the stitch line is picked have a way of getting caught under the presser foot on the very next pass, and a crease left pressed in reads as a second hemline the new stitching has to fight against. Clearing all three, in this order, is what leaves clean fabric for the new hem instead of a fold with old evidence still in it.",
      outOfOrderNote: "Thread tails, then the stitch line, then the crease — pulling the loose ends first is what keeps them out of the next seam.",
    },
    {
      id: "hem-fold", kind: "drag", target: "hem-edge",
      title: "Fold the new hem to the mark",
      cue: "Fold the raw edge up to the chalk line and pin it in place.",
      why: "The chalk mark is where the measurement from the customer's pin actually lands once the fabric is folded, not a rough guess at 'about two inches.' Pinned exactly on that line, the hem sews to the length that was measured; folded loose and eyeballed under the machine, it sews to whatever the fold happened to settle at.",
      drag: { to: "hem-mark", radius: 0.28, missNote: "Not on the chalk line — fold to the mark before it goes anywhere near the needle." },
    },
    {
      id: "sew-hem", kind: "track", target: "alt-machine", seconds: 6,
      title: "Sew the new hem",
      cue: "Feed the folded hem through at a steady stitch length and hold the feed rate in the band.",
      why: "A rushed feed stretches the fabric under the foot and puckers the finished hem; too slow and the stitch length goes uneven and loose. A steady, held feed rate is what a clean hem actually requires — the machine doesn't correct for a hurried pass, it just sews exactly what it was fed.",
      track: {
        start: 0.15, green: [0.4, 0.6], rise: 0.5, fall: 0.4, drift: 0.12, label: "FEED RATE",
        readout: (v) => (v < 0.4 ? "too slow — uneven stitch" : v > 0.6 ? "too fast — puckering" : "steady"),
      },
      holdBreakNote: "Feed rate broke the band. A hem sewn at an uneven pace shows it in the finished stitch — settle back to steady and feed it through again.",
    },
    {
      id: "zipper-old", kind: "select", target: "old-zipper",
      title: "Pick out the old zipper",
      cue: "Remove the failed zipper's stitching from the placket, both sides.",
      why: "A new zipper pinned in over the old one's leftover stitching sews crooked from the first stitch, because the placket is already puckered around threads that were never fully cleared. The old zipper comes out completely before the new one is ever laid in.",
    },
    {
      id: "zipper-new", kind: "drag", target: "new-zipper",
      title: "Pin the replacement zipper",
      cue: "Set the new zipper into the placket, teeth square to the seam, and pin it before it moves.",
      why: "A zipper that shifts half a tooth's width between pinning and sewing comes out crooked, catches on the first pull, and gets ripped out and redone — twice the work the pins were there to prevent. Pinned square before it ever nears the needle, it sews exactly where it was set.",
      drag: { to: "zipper-channel", radius: 0.28, missNote: "Not square in the placket — pin it straight before it goes under the foot." },
    },
    {
      id: "sew-zipper", kind: "hold", target: "foot-pedal-alt", seconds: 5,
      title: "Sew the zipper in",
      cue: "Hold the pedal through one continuous pass down each side of the tape.",
      why: "A zipper stopped and restarted partway leaves a visible jog in the stitch line right where the eye goes first on a finished garment. One continuous, held pass down each side is what a clean zipper actually looks like — stopping to check progress mid-seam is how the jog gets put there.",
      holdBreakNote: "Pedal released mid-pass. The stitch line jogs exactly where it stopped — reset to the start of that side and sew it through in one pass.",
    },
    {
      id: "fit-check", kind: "gauge", target: "form-pins",
      title: "Check the finished fit against the pins",
      cue: "Hold the finished garment to the form's pinned markers and commit inside tolerance.",
      why: "The pins are still on the form for exactly this reason: the only fit that matters is the one the customer marked, and the only way to confirm the ticket actually delivered it is to hold the finished work against those same pins, not against how it looks on the hanger.",
      gauge: { label: "FIT CHECK", speed: 0.75, green: [0.44, 0.6], readout: (t) => `${(t * 100).toFixed(0)}% to pin`, missNote: "Off the customer's mark — check the hem and zipper against the form's pins again." },
    },
    {
      id: "price-time", kind: "select", target: "price-board",
      title: "Record price and time",
      cue: "Log what was done, how long it took and what it costs on the ticket.",
      why: "The price and the time on the ticket are what the counter quotes the customer and what the shop bills against — a ticket closed without them is a job nobody can account for later, whether that's a customer disputing the price or a shop trying to work out how long a hem-and-zipper actually takes.",
    },
    {
      id: "closing-check", kind: "find", noHint: true,
      targets: ["ripper-left-open", "chalk-marks"],
      itemNames: { "ripper-left-open": "seam ripper left open on the bench", "chalk-marks": "chalk marks not brushed off" },
      itemNotes: {
        "ripper-left-open": "An open ripper left loose on the bench is a hooked blade the next hand onto this surface finds by feel.",
        "chalk-marks": "Chalk lines left on the finished garment are the fitting marks, not the finish — they brush off before the ticket goes back to the counter, not after the customer notices them.",
      },
      title: "Walk the bench before the ticket closes",
      cue: "Two things at this bench aren't done yet. Find them by looking.",
      why: "A ticket that reads as finished on the hanger can still have loose ends sitting right on the bench — a ripper nobody put away, chalk nobody brushed off. Two minutes checking the bench itself is what catches both before the garment goes back to the counter looking done.",
    },
  ],

  // A pin missed in the pinning shows up after the hem is sewn, and a ticket
  // asks for more than the fabric in front of you can actually take. See
  // shared/game.js.
  interrupts: [
    {
      id: "pin-in-hem",
      kind: "Pin found in finished work",
      after: "sew-hem", delay: 3, seconds: 11,
      alert: "Running a hand along the new hem, you feel a straight pin still caught inside it — missed when it was folded and pinned.",
      cue: "There's a pin in the finished hem. It doesn't wait for the next step.",
      target: "pin-dish",
      why: "A pin sewn into a hem is a pin that travels home with the customer and finds their finger, or their child's, the first time anyone runs a hand along it. It comes out the moment it's found and goes straight into the pin dish — not set down loose on the bench, where it becomes the next thing somebody else finds by feel.",
      missNote: "The pin stayed in the hem. It goes out the door in the finished garment, and the next hand that finds it isn't a tailor's — it's a customer's, or a child's, running a hand along a hem that's supposed to be finished.",
      wrongNote: "It's the pin in the hem. Pull it and put it in the dish before anything else happens.",
    },
    {
      id: "fabric-limit",
      kind: "Ticket beyond the fabric",
      after: "sew-zipper", delay: 3, seconds: 11,
      alert: "The ticket's margin note now asks to take the waist in three more inches — but this seam allowance is barely half an inch and the fabric's already worn thin along it.",
      cue: "The ticket wants more than this seam has to give.",
      target: "counter-phone",
      why: "A seam allowance this narrow physically cannot take a three-inch take-in — forcing it either rips the seam out under the first wear or requires cutting into fabric that isn't there to spare. That's a call to the counter before the machine touches it, not a tailor quietly doing their best and hoping the customer doesn't notice the result.",
      missNote: "You tried to take in three inches on an allowance that couldn't hold it. The seam let go the first time it was worn, and the ticket that should have been flagged at the bench came back as a redo — or a refund.",
      wrongNote: "It's the ticket asking for more than this fabric can give. Call the counter before you touch the machine.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, ALT_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { base: "#2c3138", base2: "#252a30", tiles: 5 }), { repeat: 4, px: 256 });
    const floor = box(g, 5.4, 0.08, 5.4, 0, -0.04, 0, 0x2c3138, { rough: 0.92 });
    floor.material = texturedMat(floorTex, { rough: 0.92, color: 0x2c3138 });

    // -------------------------------------------------------------- dress form
    const form = group(g, 0, 0, -0.75, 0.2);
    cyl(form, 0.14, 0.16, 0.03, 0, 0.015, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    cyl(form, 0.03, 0.035, 0.85, 0, 0.45, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 12 });
    const torsoForm = lathe(form, [[0.001, 0], [0.16, 0.02], [0.19, 0.16], [0.2, 0.34], [0.17, 0.5], [0.13, 0.6], [0.09, 0.66], [0.001, 0.68]],
      0, 0.85, 0, 0xc9a878, { rough: 0.75, seg: 20 });
    void torsoForm;
    const formPins = box(form, 0.24, 0.04, 0.22, 0, 1.18, 0.05, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, formPins, "form-mount");
    const formPinsCheck = box(form, 0.24, 0.04, 0.22, 0, 1.0, 0.05, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, formPinsCheck, "form-pins");
    for (const p of [[0.1, 1.2, 0.09], [-0.1, 1.2, 0.09], [0.12, 0.98, 0.08]]) {
      ball(form, 0.008, p[0], p[1], p[2], 0xf0645b, { rough: 0.3, seg: 8, cast: false });
    }

    // Garment on a hanger, moved onto the form.
    const hanger = group(g, -1.6, 0, -0.5);
    cyl(hanger, 0.012, 0.012, 1.3, 0, 1.3, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    for (let i = 0; i < 3; i++) {
      cyl(hanger, 0.006, 0.006, 0.02, -0.3 + i * 0.3, 1.65, 0, 0xdfe4e8, { rough: 0.4, metal: 0.7, seg: 6 });
    }
    const garment = box(hanger, 0.32, 0.55, 0.05, 0, 1.34, 0, 0x3a5a7a, { rough: 0.85, opacity: 0.95, transparent: true });
    reg(hits, garment, "garment");

    // -------------------------------------------------------------- tape/measure & seam ripper
    const bench = group(g, 1.0, 0, -0.2, -0.3);
    box(bench, 0.9, 0.05, 0.5, 0, 0.78, 0, 0x8b6a42, { rough: 0.7 });
    for (const sx of [-0.4, 0.4]) box(bench, 0.05, 0.76, 0.42, sx, 0.39, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, cast: false });

    const tape = instrument(bench, -0.2, 0.83, 0, { ry: 0.3, idle: "-- in", color: ALT_ACCENT, w: 0.11, d: 0.17 });
    holoTag(tape, "tape measure", 0, 0.15, 0, { css: "#d68b6b", w: 0.28 });
    reg(hits, tape, "tape-measure");

    const ripperTray = group(bench, 0.2, 0.81, 0.1);
    box(ripperTray, 0.16, 0.02, 0.1, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.6, cast: false });
    const ripper = group(ripperTray, 0, 0.02, 0, 0.2);
    cyl(ripper, 0.008, 0.008, 0.1, 0, 0.05, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 8 });
    box(ripper, 0.02, 0.04, 0.02, 0, -0.02, 0, 0xd2312b, { rough: 0.5 });
    torus(ripper, 0.012, 0.003, 0, 0.1, 0.008, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 6, seg2: 10 });
    reg(hits, ripper, "seam-ripper");

    // Decoy ripper laid the wrong way — hazard.
    const decoyRipper = group(bench, -0.35, 0.81, 0.14, -0.6);
    cyl(decoyRipper, 0.007, 0.007, 0.09, 0, 0.045, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 8 });
    box(decoyRipper, 0.018, 0.035, 0.018, 0, -0.02, 0, 0xd2312b, { rough: 0.5 });
    reg(hits, decoyRipper, "ripper-toward-hand");
    // The bench's own ripper, left open beside the tray instead of folded
    // shut and put away — the closing-walk find target. A second, invisible
    // marker of its own: reg() already claimed the ripper group for
    // "seam-ripper".
    const ripperLeftOpen = box(ripperTray, 0.1, 0.03, 0.06, 0, 0.03, -0.06, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, ripperLeftOpen, "ripper-left-open");

    // Pin dish (magnetic) and a loose-pins tray near face height (hazard).
    const pinDish = cyl(bench, 0.05, 0.06, 0.015, -0.05, 0.79, -0.15, 0x8b929a, { rough: 0.3, metal: 0.8, seg: 16 });
    for (let i = 0; i < 4; i++) box(pinDish, 0.001, 0.03, 0.001, -0.02 + i * 0.014, 0.03, 0, 0xdfe4e8, { rough: 0.2, metal: 0.9 });
    reg(hits, pinDish, "pin-dish");
    const looseTray = group(g, 0.55, 0, -0.4, -0.3);
    box(looseTray, 0.16, 0.015, 0.1, 0, 1.15, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    for (let i = 0; i < 8; i++) box(looseTray, 0.0015, 0.025, 0.0015, -0.06 + (i % 4) * 0.04, 1.16, -0.02 + Math.floor(i / 4) * 0.04, 0xdfe4e8, { rough: 0.2, metal: 0.9, cast: false });
    holoTag(looseTray, "loose pins", 0, 1.24, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, looseTray, "pins-in-mouth");

    // -------------------------------------------------------------- alterations machine
    const machineTable = group(g, -0.85, 0, 1.1, 0.4);
    box(machineTable, 0.9, 0.05, 0.55, 0, 0.78, 0, 0x3f4650, { rough: 0.4, metal: 0.5 });
    for (const sx of [-0.4, 0.4]) box(machineTable, 0.05, 0.76, 0.45, sx, 0.39, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, cast: false });
    const machHead = group(machineTable, 0.06, 0.805, 0);
    box(machHead, 0.32, 0.04, 0.2, 0, 0, 0, 0x22262b, { rough: 0.4, metal: 0.6 });
    box(machHead, 0.07, 0.3, 0.14, -0.1, 0.17, -0.03, 0x22262b, { rough: 0.4, metal: 0.55 });
    box(machHead, 0.28, 0.08, 0.09, 0, 0.3, -0.03, 0x22262b, { rough: 0.4, metal: 0.55 });
    const machNeedle = cyl(machHead, 0.005, 0.005, 0.1, 0.11, 0.27, 0.0, 0xdfe4e8, { rough: 0.2, metal: 0.9, seg: 8 });
    const machWheel = torus(machHead, 0.045, 0.01, 0.16, -0.02, 0.005, 0x8b929a, { rough: 0.4, metal: 0.7, seg: 8, seg2: 18 });
    machWheel.rotation.y = Math.PI / 2;
    const altMachineHit = box(machHead, 0.36, 0.42, 0.26, 0, 0.22, -0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, altMachineHit, "alt-machine");
    const pedalAlt = group(g, -0.6, 0, 1.55, 0.4);
    box(pedalAlt, 0.28, 0.06, 0.18, 0, 0.03, 0, 0x22262b, { rough: 0.6 });
    reg(hits, pedalAlt, "foot-pedal-alt");

    // Old zipper and replacement zipper laid on the machine table.
    const oldZip = box(machineTable, 0.18, 0.006, 0.03, -0.28, 0.805, 0.12, 0x6a6a6a, { rough: 0.6, metal: 0.4 });
    reg(hits, oldZip, "old-zipper");
    const newZip = group(g, 0.4, 0, 1.4, 0);
    box(newZip, 0.2, 0.006, 0.035, 0, 0.84, 0, 0x22262b, { rough: 0.4, metal: 0.6 });
    for (let i = 0; i < 10; i++) box(newZip, 0.008, 0.006, 0.01, -0.09 + i * 0.02, 0.845, 0, 0xdfe4e8, { rough: 0.2, metal: 0.85, cast: false });
    holoTag(newZip, "replacement zipper", 0, 0.9, 0, { css: "#d68b6b", w: 0.36 });
    reg(hits, newZip, "new-zipper");
    const zipperChannel = box(machineTable, 0.2, 0.005, 0.08, -0.28, 0.81, 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, zipperChannel, "zipper-channel");

    // Hem edge/mark near the form.
    const hemEdge = box(form, 0.3, 0.02, 0.06, 0, 0.55, 0.12, 0xdcd0b0, { rough: 0.8 });
    reg(hits, hemEdge, "hem-edge");
    const hemMark = box(form, 0.3, 0.005, 0.06, 0, 0.6, 0.12, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hemMark, "hem-mark");

    // Unpick targets around the hem.
    const hemThread = box(form, 0.05, 0.01, 0.03, 0.1, 0.56, 0.12, 0xdfe4e8, { opacity: 0.4, transparent: true, cast: false });
    reg(hits, hemThread, "hem-thread");
    const hemStitches = box(form, 0.24, 0.01, 0.03, 0, 0.56, 0.12, 0x22262b, { opacity: 0.5, transparent: true, cast: false });
    reg(hits, hemStitches, "hem-stitches");
    const hemCrease = box(form, 0.24, 0.005, 0.03, 0, 0.5, 0.12, 0xffffff, { opacity: 0.2, transparent: true, cast: false });
    reg(hits, hemCrease, "hem-crease");
    // Chalk fitting marks still on the garment — the closing-walk find target.
    const chalkMarks = box(form, 0.2, 0.01, 0.03, -0.02, 0.62, 0.13, 0xe8e0c8, { rough: 0.5, cast: false });
    reg(hits, chalkMarks, "chalk-marks");

    // -------------------------------------------------------------- ticket panel & price board
    const ticket = holoPanel(g, 0.5, 0.34, -1.4, 1.5, 0.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(16,8,6,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d68b6b"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#f2ded4";
      ctx.fillText("ALTERATION TICKET 2208", w * 0.06, h * 0.16);
      ctx.fillStyle = "#fbf1ea"; ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Hem: take up 2 in", "Zipper: replace, 7 in", "Price / time: —"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: 0.55, accent: ALT_ACCENT });
    reg(hits, ticket, "alter-ticket");

    const priceBoard = group(g, 1.6, 0, 0.9, -0.5);
    box(priceBoard, 0.3, 0.24, 0.02, 0, 1.15, 0, 0x1b2026, { rough: 0.6 });
    decal(priceBoard, 0.26, 0.18, 0, 1.15, 0.012, signFace("PRICE / TIME", { bg: "#0d1c24", accent: "#59c97b", fg: "#fff3d6", scale: 0.42 }));
    reg(hits, priceBoard, "price-board");

    // -------------------------------------------------------------- ironing station (hazard cluster)
    const ironBoard = group(g, 1.65, 0, -0.6, -0.4);
    box(ironBoard, 0.5, 0.03, 0.22, 0, 0.85, 0, 0xe4ddc8, { rough: 0.8 });
    for (const sx of [-0.18, 0.18]) cyl(ironBoard, 0.012, 0.012, 0.83, sx, 0.42, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8, cast: false });
    const iron = group(ironBoard, 0.1, 0.87, 0, 0.3);
    box(iron, 0.14, 0.02, 0.08, 0, 0, 0, 0x8b929a, { rough: 0.3, metal: 0.8 });
    box(iron, 0.09, 0.07, 0.06, -0.01, 0.05, 0, 0x2b2f34, { rough: 0.6 });
    box(iron, 0.03, 0.02, 0.02, -0.03, 0.1, 0, 0x2b2f34, { rough: 0.6 });
    reg(hits, iron, "iron-face-down");
    const ironCord = box(g, 0.02, 0.015, 1.0, 1.1, 0.02, -0.9, 0x14171a, { rough: 0.7, cast: false });
    ironCord.rotation.y = 0.5;
    reg(hits, ironCord, "cord-snag");

    // -------------------------------------------------------------- counter phone
    const phone = group(g, -1.7, 0, 1.5, 0.5);
    box(phone, 0.14, 0.14, 0.05, 0, 1.35, 0, 0x22262b, { rough: 0.5 });
    cyl(phone, 0.02, 0.02, 0.1, 0, 1.42, 0.03, 0x2b2f34, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    decal(phone, 0.12, 0.04, 0, 1.29, 0.028, signFace("COUNTER", { bg: "#22262b", accent: "#d68b6b", scale: 0.5 }));
    reg(hits, phone, "counter-phone");

    // ------------------------------------------------------------------- dressing
    // A hanger rack of waiting garments, a bolt of lining fabric, a chalk box,
    // a fire extinguisher and two more tailors at their own benches, well
    // clear of every control this station registers.
    const rack = group(g, -2.0, 0, 1.2, 0.2);
    box(rack, 0.05, 1.3, 0.05, -0.4, 0.65, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    box(rack, 0.05, 1.3, 0.05, 0.4, 0.65, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    cyl(rack, 0.015, 0.015, 0.8, 0, 1.25, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    const hangColors = [0x5a4a3a, 0x8a3a3a, 0x3a5a4a];
    hangColors.forEach((c, i) => box(rack, 0.28, 0.5, 0.04, -0.3 + i * 0.3, 0.95, 0, c, { rough: 0.85, opacity: 0.92, transparent: true }));
    holoTag(rack, "Waiting garments", 0, 1.35, 0, { css: "#d68b6b", w: 0.4 });

    const liningBolt = group(g, 1.9, 0, 1.5, -0.5);
    const bolt = cyl(liningBolt, 0.1, 0.1, 0.6, 0, 0.35, 0, 0x8a3a3a, { rough: 0.85, seg: 16 });
    bolt.rotation.x = Math.PI / 2;
    holoTag(liningBolt, "lining bolt", 0, 0.66, 0, { css: "#d68b6b", w: 0.3 });

    const ext = group(g, -2.0, 0, -1.0, 0.5);
    cyl(ext, 0.055, 0.065, 0.4, 0, 0.32, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.022, 0.022, 0.08, 0, 0.56, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "extinguisher", 0, 0.68, 0, { css: "#d2312b", w: 0.3 });

    const crewA = standingFigure(g, -2.6, -0.75, { ry: 0.9, cloth: 0x5a4a44, trousers: 0x2b3138, vest: false });
    const crewB = standingFigure(g, 2.45, 1.2, { ry: -1.4, cloth: 0x44505a, trousers: 0x2b3138, vest: false });
    void crewA; void crewB;

    for (const zx of [-1.2, 0, 1.2]) box(g, 1.0, 0.04, 0.16, zx, 2.5, -0.6, 0xdfe4e8, { rough: 0.3, emissive: 0xf4f7fa, ei: 0.5, cast: false });

    let mounted = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -0.75),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "garment-to-form") {
          mounted = true;
          garment.parent.remove(garment);
          form.add(garment);
          garment.position.set(0, 0.9, 0.1);
          garment.rotation.set(0, 0, 0);
        }
        if (step.id === "unpick-hem") { hemThread.visible = false; hemStitches.visible = false; hemCrease.visible = false; }
        if (step.id === "hem-fold") { hemEdge.position.y = 0.6; }
        if (step.id === "zipper-old") { oldZip.visible = false; }
        if (step.id === "zipper-new") { newZip.parent.remove(newZip); machineTable.add(newZip); newZip.position.set(-0.28, 0.81, 0.02); newZip.rotation.set(0, 0, 0); }
        if (step.id === "closing-check") { decoyRipper.visible = false; formPins.material.opacity = 0; ripper.rotation.set(0, 0, 0); chalkMarks.visible = false; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "pin-in-hem") { pinDish.material.emissive = new THREE.Color(0xf0645b); pinDish.material.emissiveIntensity = 0.6; }
        if (it.id === "fabric-limit") { phone.position.x += 0.02; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "pin-in-hem") { pinDish.material.emissiveIntensity = 0; }
        if (it.id === "fabric-limit") { phone.position.x -= 0.02; }
      },
      animate(t, dt, session) {
        void mounted;
        const step = session?.step;
        const running = !!((step?.id === "sew-hem" || step?.id === "sew-zipper") && session.holding);
        machWheel.rotation.x += (running ? 12 : 0.3) * dt;
        machNeedle.position.y = 0.27 + (running ? Math.sin(t * 20) * 0.018 : 0);
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "measure") repaint(tape.userData.screen, signFace(`${(2 + gg.t * 3).toFixed(1)} in`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.62 }));
          if (step?.id === "fit-check") repaint(tape.userData.screen, signFace(`${(gg.t * 100).toFixed(0)}%`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.62 }));
        }
      },
    };
  },
};
