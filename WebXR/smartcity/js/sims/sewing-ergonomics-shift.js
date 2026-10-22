import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, valveWheel, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Sewing Ergonomics VR — Sewing & Garment Trades, station one.
// A single lockstitch operator's bench, set up the way a shift actually
// starts on a production floor: the chair and the table brought to the
// person rather than the person folding themselves around whatever height
// the last operator left them at, the bundle staged where a turn of the
// swivel reaches it instead of a twist of the spine, and a micro-break timer
// that is followed on the clock rather than skipped because the line is
// moving. Seated, repetitive, piece-rate work is exactly what NIOSH's
// ergonomics guidance and California's own repetitive motion injury standard
// exist for, and every hazard here is one of the small daily choices that
// standard is written against, not a single dramatic accident.

const SEW_ACCENT = 0xb86bd6;

export const SIM_SEWING_ERGONOMICS_SHIFT = {
  id: "sewing-ergonomics-shift",
  index: "179",
  domain: "Apparel manufacturing",
  trade: "Industrial sewing machine operator — Workers United (SEIU)",
  category: "Sewing & Garment Trades",
  indoor: "shop",
  certification: "Workers United (SEIU) industrial sewing machine operator apprenticeship standards; OSHA 29 CFR 1910.212 machine guarding for the needle guard; NIOSH ergonomics guidance for seated repetitive work; the Cal/OSHA repetitive motion injury standard, 8 CCR 5110",
  name: "Sewing Ergonomics",
  title: simTitle("Sewing Ergonomics"),
  tagline: "Chair, table, pedal and light set to the operator, the bundle in reach, the micro-break taken, and a symptom reported early",
  accent: SEW_ACCENT,
  accentCss: "#b86bd6",
  parSeconds: 250,
  footprint: 2.3,
  badge: { id: "shift-set-right", name: "Shift Set Right", note: "A bench set up to the operator, a full seam run in the posture band, the break taken, and an early symptom logged" },

  game: system({
    name: "Line Authority",
    currency: "STITCH",
    ranks: ["Bundle Runner", "Machine Operator", "Line Operator", "Lead Operator", "Line Authority Certified"],
    badges: [
      { id: "no-twist", name: "No Twist", note: "Never reached for the twist-bin instead of turning the chair", test: AWARD.safe },
      { id: "steady-seam", name: "Steady Seam", note: "Held the seam run in the posture band without a break", test: AWARD.unbroken },
      { id: "in-the-band", name: "In The Band", note: "Table height and the fit measurement both close to the mark", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-setup", name: "Clean Setup", note: "No corrections through the whole setup", test: AWARD.clean },
      { id: "break-kept", name: "Break Kept", note: "Took the micro-break the moment the timer called it", test: AWARD.stepClean("micro-break") },
      { id: "shift-fast", name: "Shift Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "twist-reach": "You reached back into the twist-bin instead of turning the swivel chair to face it. Twisting the spine under load, over and over, at piece-rate speed, is exactly the loading pattern NIOSH's ergonomics guidance flags first — the chair turns for a reason, and the reason is that your back doesn't get to.",
    "needle-reach": "You reached toward the needle bar while the machine was still turning over. OSHA 1910.212 exists for this exact point on a lockstitch head: the needle does not know the difference between thread and a fingertip, and a snag gets cleared with the machine stopped, never with a hand following the last stitch in.",
    "low-chair": "That's the spare stool from the idle machine — its gas lift is seized flat and it's set for somebody a foot shorter than you. Sitting into a chair that isn't adjusted to you puts your spine into the same hunched, twisted posture the whole ergonomics standard exists to catch before it becomes a repeat strain claim.",
    "cord-underfoot": "The pedal cord is lying straight across the walking aisle, not tucked along the table leg. A cord underfoot gets pulled taut by the next person through, and it takes the pedal's plug half out of the strip or the walker down next to a running machine — neither one is a small thing on a production floor.",
  },

  lateNotes: {
    "chair-crank": "Set the table height and the pedal position first — a chair adjusted before the rest of the bench is set is a chair adjusted to the wrong bench.",
    "sewing-machine": "Not yet. The needle guard comes down before the machine ever turns over.",
  },

  steps: [
    {
      id: "ticket", kind: "select", target: "bundle-ticket",
      title: "Read the bundle ticket",
      cue: "Check the operation, the piece rate and the bundle count before you touch the machine.",
      why: "The ticket is what the whole bench gets set for — this operation's seam, this bundle's fabric weight, this rate. An operator who sits down and starts sewing before reading it is setting up for whatever the last ticket asked for, and a bench built for the wrong operation is a bench that fights the operator on every single piece in the bundle.",
    },
    {
      id: "ergo-poster", kind: "select", target: "ergo-poster",
      title: "Check the posture reference",
      cue: "Read the seated-posture card clipped to the post before you adjust anything.",
      why: "NIOSH's guidance for seated repetitive work gives a target, not a feeling — elbows near ninety degrees, wrists straight over the needle plate, feet flat and level on the pedal. Adjusting a chair and a table by eye, without the reference in front of you, is how a bench ends up close enough to work and wrong enough to hurt over a full shift.",
    },
    {
      id: "chair-height", kind: "turn", target: "chair-crank",
      title: "Wind the chair to seat height",
      cue: "Turn the seat-height wheel until the pan sits level with the posture card's mark.",
      why: "The screw column is what actually carries your weight at the height you set it to, not a lever that can creep down under load through the shift. Winding it to the card's mark before the first seam is what keeps your knees, hips and the table edge in the same relationship for eight hours instead of drifting lower stitch by stitch.",
      turn: { turns: 0.6, axis: "y", label: "SEAT HEIGHT" },
    },
    {
      id: "table-height", kind: "gauge", target: "table-crank",
      title: "Set the table to elbow height",
      cue: "Wind the table crank until the needle plate sits level with your elbow, in the marked band.",
      why: "A table set too low pulls the shoulders forward and down for the whole seam; set too high, it lifts them into a shrug that never fully releases. The marked band on the crank's readout is where the needle plate sits level with a seated elbow — the number the ergonomics guidance actually specifies, not a height chosen because it matches the machine next to you.",
      gauge: { label: "TABLE HEIGHT", speed: 0.8, green: [0.44, 0.6], readout: (t) => `${(68 + t * 20).toFixed(0)} cm`, missNote: "Off the elbow-height band — wind the crank again and stop inside the marked range." },
    },
    {
      id: "pedal-position", kind: "drag", target: "clutch-pedal",
      title: "Position the clutch pedal",
      cue: "Slide the foot pedal to the mark directly under the ball of your working foot.",
      why: "A pedal set off to the side turns every stitch into an ankle twisted sideways to reach it, which loads the joint at an angle it was never meant to hold under repeated pressure. Squared up under the ball of the foot, the same motion that runs the machine all day is a straight push, not a reach.",
      drag: { to: "pedal-mark", radius: 0.3, missNote: "Not on the mark — the pedal has to sit square under your foot, not off to the side." },
    },
    {
      id: "task-light", kind: "select", target: "gooseneck-lamp",
      title: "Aim the task light",
      cue: "Swing the gooseneck lamp down onto the needle plate, off your eyeline.",
      why: "A lamp left aimed up at head height does two things wrong at once: it puts no light on the stitch line, so the eyes and neck crane in to compensate, and it glares straight back at the operator all shift. Aimed down at the needle, it does the one job a task light has, which is showing you the seam without asking your neck to find it.",
    },
    {
      id: "bundle-reach", kind: "drag", target: "bundle",
      title: "Bring the bundle into reach",
      cue: "Carry the cut bundle from the side cart onto the marked reach zone on the table.",
      why: "A bundle staged on the far cart gets fetched by reaching or by standing up and sitting back down, piece after piece, all shift. Landed inside the reach zone, the same motion is a short forward pull from a seated, squared position — the difference NIOSH's guidance is built around between a reach that costs nothing and one that costs a little bit, ten thousand times.",
      drag: { to: "reach-zone", radius: 0.3, missNote: "Not in the reach zone — the bundle has to land where you can pull from it without leaning." },
    },
    {
      id: "guard-check", kind: "select", target: "needle-guard",
      title: "Lower the needle guard",
      cue: "Fold the finger guard down over the needle before the machine turns over.",
      why: "The guard is what stands between a fingertip and the needle bar on every single stitch, and OSHA's machine-guarding rule holds it in place for exactly that reason — a lockstitch head has no clutch that knows your hand is close. It comes down before the first seam of the shift, not after a near miss teaches the same lesson the hard way.",
    },
    {
      id: "seam-run", kind: "track", target: "sewing-machine", seconds: 7,
      title: "Run a seam at speed",
      cue: "Feed the seam through and hold your wrist and shoulder in the posture band as the machine picks up speed.",
      why: "A posture that looks fine at a slow stitch can round the wrist or hike the shoulder the moment the pedal goes down and the rate climbs — speed is exactly when a marginal position turns into a loaded one. Holding the band at running speed is the actual test the setup was for; a bench adjusted perfectly and then abandoned the moment the seam gets fast has not actually protected anybody.",
      track: {
        start: 0.15, green: [0.4, 0.6], rise: 0.55, fall: 0.42, drift: 0.12, label: "WRIST / SHOULDER",
        readout: (v) => (v < 0.4 ? "wrist rolling under" : v > 0.6 ? "shoulder hiking" : "neutral"),
      },
      holdBreakNote: "Posture broke out of the band mid-seam. A wrist rolled under or a shoulder hiked at running speed is the load that adds up shift over shift — settle back into the band and feed the seam through again.",
    },
    {
      id: "micro-break", kind: "hold", target: "break-timer", seconds: 5,
      title: "Take the micro-break",
      cue: "When the timer calls it, hands off the pedal and hold the stretch position for the full count.",
      why: "The repetitive-motion standard doesn't ask for a long break, it asks for a short one taken on schedule — hands off the controls, tendons given a moment they don't get during a running seam. A timer that goes off and gets worked through anyway is a break that exists on paper and nowhere else, and it's the shifts where it gets skipped that show up later as a claim.",
      holdBreakNote: "Hands went back to the machine before the count finished. The break only does its job held the full duration — wait for the timer and hold it through.",
    },
    {
      id: "stretch", kind: "sequence",
      targets: ["stretch-wrist", "stretch-shoulder", "stretch-neck"],
      itemNames: { "stretch-wrist": "wrist extension", "stretch-shoulder": "shoulder roll", "stretch-neck": "neck release" },
      itemNotes: { "stretch-wrist": "The joint that just spent seven seconds guiding a seam gets stretched first, before it stiffens into the position it was just held in." },
      title: "Run the stretch sequence",
      cue: "Work the wrist, then the shoulder, then the neck, in that order, before you sit back down to the bundle.",
      why: "The order runs from the joint doing the most repeated work to the one doing the least, so the wrist — which just held a fixed angle through a whole seam — gets released before it's asked to cool down stiff. A stretch done out of order, or skipped down to one, treats the break as a formality instead of the recovery it's actually there for.",
      outOfOrderNote: "Wrist first, then shoulder, then neck — the joint carrying the most repetition gets released before the others.",
    },
    {
      id: "symptom-report", kind: "select", target: "rmi-log",
      title: "Log the early symptom",
      cue: "Note the tingling in your own hand on the RMI log before it becomes something worse.",
      why: "The Cal/OSHA repetitive motion injury standard exists because tingling reported in week one is a desk adjustment; the same tingling ignored for six months is carpal tunnel surgery. The log is checked by the safety committee specifically to catch a pattern early, and it only works if the first, mildest instance actually gets written down instead of shrugged off.",
    },
    {
      id: "closing-walk", kind: "find", noHint: true,
      targets: ["cord-underfoot", "low-chair"],
      itemNames: { "cord-underfoot": "pedal cord across the aisle", "low-chair": "the seized spare stool" },
      itemNotes: {
        "cord-underfoot": "A cord left across the walking aisle instead of run along the leg is a trip and a pull on the plug waiting for the next person through.",
        "low-chair": "The spare stool's lift is seized flat and it's set for a different operator entirely — sitting into it unadjusted is the posture problem this whole shift was set up to avoid.",
      },
      title: "Walk the bench before the next bundle",
      cue: "Two things at this bench are wrong. Find them by looking.",
      why: "A production line moves fast enough that nothing gets a second look unless it's a habit built into the routine. Two things wrong with this bench — a cord in the aisle, a chair nobody adjusted — are exactly the kind of thing that sits there for a week because everyone assumed someone else would notice it first.",
    },
  ],

  // A piece rate that changes while your hands are full, and a coworker who
  // waves off exactly the symptom this station just taught you to report.
  // See shared/game.js.
  interrupts: [
    {
      id: "piece-rate-push",
      kind: "Rate change mid-shift",
      after: "seam-run", delay: 3, seconds: 11,
      alert: "The supervisor calls out over the line that the piece rate on this operation just went up — sew it faster, starting now.",
      cue: "The rate changed mid-seam. Your hands stay in the band; the steward hears about the change.",
      target: "steward-call",
      why: "A rate posted mid-shift is a contract matter for the shop steward, not something an operator settles alone by simply speeding past the posture band that was just set for this seam. Pressing the steward call is what puts the change on the record without you being the one who has to argue it while the machine is still running.",
      missNote: "You sped the seam up to chase the new rate instead of calling it in. The posture band exists at the speed the setup was proven at — pushed past it under rate pressure, it's exactly the loading NIOSH's guidance warns adds up fastest.",
      wrongNote: "It's the rate change, not the seam. Press the steward call — the machine can wait a second.",
    },
    {
      id: "numb-fingers-ignored",
      kind: "Coworker symptom waved off",
      after: "micro-break", delay: 3, seconds: 11,
      alert: "Two machines down, a coworker is shaking numbness out of their fingers and telling the operator next to them it's nothing, it'll pass.",
      cue: "That's the exact early symptom this bench just logged for you. It doesn't go unrecorded because it's somebody else's hand.",
      target: "rmi-log",
      why: "The repetitive motion injury standard depends on early reporting, and 'it'll pass' said out loud on the floor is how an early symptom stops being reported at all — by that operator or by the next one who hears it's normal to wave off. Logging it is not overriding a coworker's own choice; it's making sure the pattern doesn't disappear because nobody wrote it down.",
      missNote: "The numbness went unlogged because it wasn't your hand. A repetitive motion standard that only catches symptoms the person reports themselves misses exactly the operators who've been told, by example, to shake it off and keep sewing.",
      wrongNote: "It's the coworker's numb fingers. Log it on the RMI board — that's what the log is actually for.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, SEW_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { base: "#2c3138", base2: "#252a30", tiles: 5 }), { repeat: 4, px: 256 });
    const floor = box(g, 5.4, 0.08, 5.4, 0, -0.04, 0, 0x2c3138, { rough: 0.92 });
    floor.material = texturedMat(floorTex, { rough: 0.92, color: 0x2c3138 });

    // --------------------------------------------------------------- bench
    const bench = group(g, 0, 0, -0.85);
    const tableGroup = group(bench, 0, 0, 0);
    const tableTop = box(tableGroup, 1.1, 0.05, 0.6, 0, 0.77, 0, 0x3f4650, { rough: 0.4, metal: 0.5 });
    for (const sx of [-0.48, 0.48]) box(tableGroup, 0.05, 0.74, 0.5, sx, 0.4, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    box(tableGroup, 1.0, 0.03, 0.02, 0, 0.4, -0.24, CITY.darkSteel, { rough: 0.5, metal: 0.6 });

    // Table-height crank on the left leg, a small hand wheel that winds a
    // visible screw column.
    const tableCrank = valveWheel(tableGroup, -0.52, 0.5, 0, { r: 0.06, body: 0x3a4048, ry: Math.PI / 2 });
    reg(hits, tableCrank, "table-crank");
    const tableReadout = decal(tableGroup, 0.14, 0.05, -0.52, 0.66, 0.09, signFace("-- cm", { bg: "#1a0f24", accent: "#b86bd6", fg: "#ecd8f5", scale: 0.55 }), { glow: true, ei: 0.7 });

    // --------------------------------------------------------- sewing head
    const head = group(tableGroup, 0.08, 0.795, 0);
    box(head, 0.36, 0.04, 0.22, 0, 0, 0, 0x22262b, { rough: 0.4, metal: 0.6 }); // bed
    const armPost = box(head, 0.08, 0.34, 0.16, -0.12, 0.19, -0.03, 0x22262b, { rough: 0.4, metal: 0.55 });
    const armOver = box(head, 0.32, 0.09, 0.1, 0, 0.34, -0.03, 0x22262b, { rough: 0.4, metal: 0.55 });
    void armPost; void armOver;
    const needleBar = cyl(head, 0.006, 0.006, 0.13, 0.14, 0.31, 0.0, 0xdfe4e8, { rough: 0.2, metal: 0.9, seg: 8 });
    const presserFoot = box(head, 0.03, 0.02, 0.05, 0.14, 0.25, 0.02, 0x8b929a, { rough: 0.35, metal: 0.7 });
    const guard = group(head, 0.14, 0.29, 0.05);
    box(guard, 0.05, 0.07, 0.008, 0, 0, 0, 0xe8b02e, { rough: 0.5, opacity: 0.85, transparent: true, cast: false });
    guard.rotation.x = -1.1;
    reg(hits, guard, "needle-guard");
    const handwheel = torus(head, 0.055, 0.012, 0.19, 0.15, -0.02, 0x8b929a, { rough: 0.4, metal: 0.7, seg: 8, seg2: 20 });
    handwheel.rotation.y = Math.PI / 2;
    for (const spool of [[-0.06, 0.5, -0.03], [0.02, 0.5, -0.03]]) {
      cyl(head, 0.018, 0.018, 0.06, spool[0], spool[1], spool[2], 0xd6567a, { rough: 0.6, seg: 12 });
      torus(head, 0.016, 0.003, spool[0], spool[1] - 0.045, spool[2], 0xe8e8ea, { rough: 0.4, seg: 6, seg2: 12 });
    }
    for (const gy of [0.4, 0.46]) torus(head, 0.014, 0.003, 0.1, gy, -0.02, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 6, seg2: 12 }).rotation.x = Math.PI / 2;
    // The whole head is what the operator watches run at speed.
    const machineHit = box(head, 0.4, 0.5, 0.3, 0, 0.28, -0.03, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, machineHit, "sewing-machine");
    // Separate, invisible marker right at the needle point — reg() would
    // overwrite the machine hit if reused, so this hazard gets its own.
    const needleReach = box(head, 0.08, 0.08, 0.06, 0.14, 0.29, 0.03, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, needleReach, "needle-reach");
    const motor = cyl(tableGroup, 0.06, 0.06, 0.14, 0.3, 0.55, 0.2, 0x2b2f34, { rough: 0.5, metal: 0.5, seg: 12 });
    motor.rotation.z = Math.PI / 2;
    void motor;

    // ------------------------------------------------------------- chair
    const chair = group(g, 0, 0, -0.15);
    cyl(chair, 0.22, 0.04, 0.02, 0, 0.005, 0, 0x22262b, { rough: 0.6, metal: 0.5, seg: 16 }); // star base cap
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; cyl(chair, 0.02, 0.02, 0.36, Math.sin(a) * 0.16, 0.01, Math.cos(a) * 0.16, 0x22262b, { rough: 0.6, metal: 0.5, seg: 8 }); }
    const post = cyl(chair, 0.03, 0.035, 0.36, 0, 0.2, 0, CITY.steel, { rough: 0.25, metal: 0.9, seg: 12, finish: "brushed" });
    void post;
    const crankWheel = valveWheel(chair, 0.06, 0.12, 0, { r: 0.05, body: 0x8a2fb0, color: 0xb86bd6, ry: Math.PI / 2 });
    reg(hits, crankWheel, "chair-crank");
    const seatGroup = group(chair, 0, 0.38, 0);
    slab(seatGroup, 0.36, 0.06, 0.34, 0, 0, 0, 0x2b1a33, { radius: 0.05, rough: 0.75 });
    slab(seatGroup, 0.34, 0.32, 0.05, 0, 0.19, -0.15, 0x2b1a33, { radius: 0.05, rough: 0.75 });

    // ------------------------------------------------------------ pedal
    const pedalMark = box(g, 0.34, 0.005, 0.24, 0.05, 0.021, 0.15, 0xb86bd6, { opacity: 0.25, transparent: true, cast: false });
    reg(hits, pedalMark, "pedal-mark");
    const pedal = group(g, 0.55, 0, 0.35, 0.3);
    box(pedal, 0.3, 0.06, 0.2, 0, 0.03, 0, 0x22262b, { rough: 0.6 });
    box(pedal, 0.26, 0.02, 0.16, 0, 0.075, 0.01, 0x14171a, { rough: 0.6 }).rotation.x = -0.12;
    reg(hits, pedal, "clutch-pedal");
    const pedalCord = box(g, 0.02, 0.015, 1.1, 1.1, 0.02, 0.4, 0x14171a, { rough: 0.7, cast: false });
    pedalCord.rotation.y = 0.35;
    reg(hits, pedalCord, "cord-underfoot");

    // ------------------------------------------------------------ light
    const lampBase = group(tableGroup, 0.48, 0.8, -0.18);
    box(lampBase, 0.05, 0.03, 0.05, 0, 0, 0, 0x22262b, { rough: 0.5 });
    const lampArm1 = group(lampBase, 0, 0.03, 0);
    cyl(lampArm1, 0.012, 0.012, 0.22, 0, 0.11, 0, CITY.steel, { rough: 0.35, metal: 0.7, seg: 8 });
    const lampArm2 = group(lampArm1, 0, 0.22, 0, -0.9);
    cyl(lampArm2, 0.011, 0.011, 0.2, 0, 0.1, 0, CITY.steel, { rough: 0.35, metal: 0.7, seg: 8 });
    const shade = cyl(lampArm2, 0.05, 0.02, 0.09, 0, 0.2, 0, 0xe8e0d0, { rough: 0.6, seg: 12 });
    ball(lampArm2, 0.018, 0, 0.2, 0, 0xfff2c8, { emissive: 0xfff2c8, ei: 1.6, rough: 0.4, seg: 8 });
    lampArm1.rotation.z = -0.7; // starts aimed up and away from the plate
    reg(hits, shade, "gooseneck-lamp");

    // ------------------------------------------------------ bundle & reach
    const reachZone = box(tableGroup, 0.36, 0.005, 0.26, -0.32, 0.796, 0.13, 0xb86bd6, { opacity: 0.22, transparent: true, cast: false });
    reg(hits, reachZone, "reach-zone");
    const cart = group(g, -1.6, 0, -0.2);
    box(cart, 0.5, 0.5, 0.4, 0, 0.25, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    for (const cx of [-0.2, 0.2]) for (const cz of [-0.15, 0.15]) cyl(cart, 0.035, 0.035, 0.04, cx, 0.02, cz, 0x14171a, { rough: 0.8, seg: 10 });
    const bundle = box(cart, 0.32, 0.14, 0.26, 0, 0.57, 0, 0xdad4c8, { rough: 0.75, opacity: 0.9, transparent: true });
    holoTag(cart, "Cut bundle — Op 14", 0, 0.72, 0, { css: "#b86bd6", w: 0.42 });
    reg(hits, bundle, "bundle");

    // ------------------------------------------------------------ ticket
    const ticket = holoPanel(g, 0.5, 0.34, -1.35, 1.5, -1.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(12,6,16,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b86bd6"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e9d8ef";
      ctx.fillText("BUNDLE TICKET 4471 — OP 14", w * 0.06, h * 0.16);
      ctx.fillStyle = "#f6eef8";
      ctx.font = `${Math.round(h * 0.088)}px Arial, sans-serif`;
      ["Operation: side-seam, lockstitch", "Rate: $0.31/pc — 40 pcs", "Fabric: 8oz denim twill"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: 0.55, accent: SEW_ACCENT });
    reg(hits, ticket, "bundle-ticket");

    // ------------------------------------------------------- ergo poster
    const poster = holoPanel(g, 0.46, 0.34, 1.35, 1.5, -0.55, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,10,14,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#dfeee2";
      ctx.fillText("SEATED POSTURE — NIOSH", w * 0.06, h * 0.16);
      ctx.fillStyle = "#eef6f0"; ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Elbows near 90°, wrists level", "Feet flat and square on the pedal", "Micro-break every 20 minutes"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: -0.5, accent: 0x59c97b });
    reg(hits, poster, "ergo-poster");

    // ------------------------------------------------------------ rmi log
    const logBoard = group(g, 1.5, 0, 0.35, -0.5);
    box(logBoard, 0.36, 0.28, 0.02, 0, 1.15, 0, 0x1b2026, { rough: 0.6 });
    decal(logBoard, 0.3, 0.22, 0, 1.15, 0.012, signFace("RMI LOG", { bg: "#0d1c24", accent: "#f0645b", fg: "#fff3d6", scale: 0.4 }));
    reg(hits, logBoard, "rmi-log");

    // -------------------------------------------------------- break timer
    const timer = group(g, -1.5, 0, 0.4, 0.5);
    box(timer, 0.16, 0.1, 0.03, 0, 1.3, 0, 0x22262b, { rough: 0.5 });
    const timerFace = decal(timer, 0.13, 0.06, 0, 1.3, 0.018, signFace("20:00", { bg: "#0d1c24", accent: "#59c97b", fg: "#c8f5d4", scale: 0.6 }), { glow: true, ei: 0.8 });
    reg(hits, timer, "break-timer");

    // ------------------------------------------------------ stretch icons
    const post2 = group(g, -1.5, 0, 0.75, 0.5);
    cyl(post2, 0.02, 0.02, 1.4, 0, 0.7, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    const stretchIds = ["stretch-wrist", "stretch-shoulder", "stretch-neck"];
    const stretchLabels = ["WRIST", "SHOULDER", "NECK"];
    stretchIds.forEach((id, i) => {
      const s = decal(post2, 0.16, 0.08, 0, 0.95 + i * 0.12, 0.015, signFace(stretchLabels[i], { bg: "#1a0f24", accent: "#b86bd6", scale: 0.5 }));
      reg(hits, s, id);
    });

    // -------------------------------------------------------- steward call
    const callBox = group(g, -1.5, 0, -0.6, 0.5);
    box(callBox, 0.14, 0.14, 0.05, 0, 1.4, 0, 0x22262b, { rough: 0.5 });
    const callLamp = ball(callBox, 0.025, 0, 1.44, 0.03, 0xf2ae14, { emissive: 0xf2ae14, ei: 0.8, rough: 0.4, seg: 10 });
    decal(callBox, 0.12, 0.05, 0, 1.35, 0.028, signFace("STEWARD", { bg: "#22262b", accent: "#f2ae14", scale: 0.5 }));
    void callLamp;
    reg(hits, callBox, "steward-call");

    // --------------------------------------------------------- twist bin
    const twistBin = group(g, 0.75, 0, -0.55, -0.4);
    box(twistBin, 0.32, 0.18, 0.24, 0, 0.6, 0, 0x2f6f8c, { rough: 0.8, metal: 0.3 });
    for (let i = 0; i < 5; i++) cyl(twistBin, 0.02, 0.02, 0.06, -0.1 + (i % 3) * 0.09, 0.71, -0.05 + Math.floor(i / 3) * 0.08, [0xd6567a, 0xe8b02e, 0x59c97b, 0x4fd1ff, 0xdfe4e8][i], { rough: 0.6, seg: 10 });
    holoTag(twistBin, "supply bin", 0, 0.82, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, twistBin, "twist-reach");

    // --------------------------------------------------------- second, idle machine (decoy chair)
    const idle = group(g, -0.85, 0, -1.6, 0.4);
    box(idle, 0.9, 0.05, 0.55, 0, 0.77, 0, 0x3a4048, { rough: 0.45, metal: 0.4 });
    for (const sx of [-0.4, 0.4]) box(idle, 0.05, 0.74, 0.45, sx, 0.4, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, cast: false });
    box(idle, 0.3, 0.03, 0.18, 0, 0.795, 0, 0x22262b, { rough: 0.4, metal: 0.55, cast: false });
    const lowChair = group(idle, 0.1, 0, 0.55);
    cyl(lowChair, 0.2, 0.04, 0.02, 0, 0.005, 0, 0x22262b, { rough: 0.6, metal: 0.5, seg: 14, cast: false });
    cyl(lowChair, 0.03, 0.035, 0.08, 0, 0.045, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10, cast: false });
    const lowSeat = slab(lowChair, 0.32, 0.05, 0.3, 0, 0.11, 0, 0x2b1a33, { radius: 0.05, rough: 0.75 });
    lowSeat.rotation.z = 0.12;
    reg(hits, lowChair, "low-chair");

    // ------------------------------------------------------------------- dressing
    // A thread rack, bolts of cloth, a stack of staged bundles, a fire
    // extinguisher and a cutting table behind — the sewing room every
    // station in this series shares, not a bare stage around one bench.
    const threadRack = group(g, 1.85, 0, -1.3, -0.4);
    box(threadRack, 0.06, 1.2, 0.5, 0, 0.75, 0, 0x8b6a42, { rough: 0.7 });
    for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) {
      const c = [0xd6567a, 0xe8b02e, 0x59c97b, 0x4fd1ff, 0xb86bd6, 0xdfe4e8, 0xf0645b, 0x8fbf5a][(row * 3 + col) % 8];
      cyl(threadRack, 0.02, 0.02, 0.09, 0.05, 0.35 + row * 0.24, -0.18 + col * 0.18, c, { rough: 0.6, seg: 10 });
    }
    holoTag(threadRack, "Thread rack", 0, 1.42, 0, { css: "#b86bd6", w: 0.32 });

    const bolts = group(g, 1.9, 0, 0.5, -0.5);
    const boltColors = [0x3a5a7a, 0x7a3a3a, 0x3a7a5a];
    boltColors.forEach((c, i) => {
      const bolt = cyl(bolts, 0.11, 0.11, 0.7, -0.28 + i * 0.28, 0.35, 0, c, { rough: 0.85, seg: 16 });
      bolt.rotation.x = Math.PI / 2;
    });
    holoTag(bolts, "Cloth bolts", 0, 0.7, 0, { css: "#b86bd6", w: 0.32 });

    const stagedBundles = group(g, -1.9, 0, -1.4, 0.5);
    for (let i = 0; i < 3; i++) box(stagedBundles, 0.3, 0.13, 0.24, 0, 0.07 + i * 0.15, 0, 0xdad4c8, { rough: 0.75, opacity: 0.92, transparent: true });
    holoTag(stagedBundles, "Staged bundles", 0, 0.65, 0, { css: "#b86bd6", w: 0.38 });

    const ext = group(g, 1.95, 0, 1.5, -0.7);
    cyl(ext, 0.055, 0.065, 0.4, 0, 0.32, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.022, 0.022, 0.08, 0, 0.56, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "extinguisher", 0, 0.68, 0, { css: "#d2312b", w: 0.3 });

    const cuttingTable = group(g, -0.6, 0, 1.55, 0);
    box(cuttingTable, 1.0, 0.04, 0.6, 0, 0.86, 0, 0x8b6a42, { rough: 0.75 });
    for (const sx of [-0.44, 0.44]) box(cuttingTable, 0.04, 0.86, 0.5, sx, 0.43, 0, CITY.darkSteel, { rough: 0.5, metal: 0.4, cast: false });
    const clothOnTable = box(cuttingTable, 0.9, 0.02, 0.5, 0, 0.885, 0, 0xdcd0b0, { rough: 0.8 });
    void clothOnTable;

    // Two more operators, seated at their own machines, well clear of every
    // control this station registers.
    const crewA = standingFigure(g, -2.15, 1.3, { ry: 0.6, cloth: 0x445560, trousers: 0x2b3138, vest: false });
    const crewB = standingFigure(g, 2.1, -0.6, { ry: -1.0, cloth: 0x5a4560, trousers: 0x2b3138, vest: false });
    void crewA; void crewB;

    // Overhead fluorescent fixtures.
    for (const zx of [-1.2, 0, 1.2]) box(g, 1.0, 0.04, 0.16, zx, 2.5, -0.6, 0xdfe4e8, { rough: 0.3, emissive: 0xf4f7fa, ei: 0.5, cast: false });

    let chairTurns = 0, pedalPlaced = false, lampAimed = false, bundlePlaced = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.05, -0.85),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "chair-height") { chairTurns = 1; seatGroup.position.y = 0.5; }
        if (step.id === "table-height") { tableTop.position.y = 0.79; }
        if (step.id === "pedal-position") { pedalPlaced = true; pedal.position.set(0.05, 0, 0.15); pedal.rotation.y = 0; }
        if (step.id === "task-light") { lampAimed = true; lampArm1.rotation.z = 0.35; lampArm2.rotation.z = -1.0; }
        if (step.id === "bundle-reach") { bundlePlaced = true; bundle.parent.remove(bundle); tableGroup.add(bundle); bundle.position.set(-0.32, 0.85, 0.13); }
        if (step.id === "guard-check") { guard.rotation.x = 0; }
        if (step.id === "closing-walk") { pedalCord.visible = false; lowSeat.rotation.z = 0; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "piece-rate-push") { callLamp.material.emissiveIntensity = 3; }
        if (it.id === "numb-fingers-ignored") { logBoard.position.x += 0.02; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "piece-rate-push") { callLamp.material.emissiveIntensity = 0.8; }
        if (it.id === "numb-fingers-ignored") { logBoard.position.x -= 0.02; }
      },
      animate(t, dt, session) {
        void chairTurns; void pedalPlaced; void lampAimed; void bundlePlaced;
        const step = session?.step;
        const running = !!(step?.id === "seam-run" && session.holding);
        handwheel.rotation.x += (running ? 14 : 0.4) * dt;
        needleBar.position.y = 0.31 + (running ? Math.sin(t * 24) * 0.02 : 0);
        presserFoot.position.y = 0.25 + (running ? Math.abs(Math.sin(t * 24)) * -0.005 : 0);
        const tk = session?.gauge;
        if (tk && !tk.committed && step?.id === "table-height") {
          tableCrank.userData.wheel.rotation.z = tk.t * Math.PI * 1.4;
          repaint(tableReadout, signFace(`${(68 + tk.t * 20).toFixed(0)} cm`, { bg: "#1a0f24", accent: tk.t >= 0.44 && tk.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#ecd8f5", scale: 0.55 }));
        }
        const tn = session?.turn;
        if (tn && step?.id === "chair-height") crankWheel.userData.wheel.rotation.z = (tn.amount / (tn.required || 1)) * Math.PI * 1.8;
      },
    };
  },
};
