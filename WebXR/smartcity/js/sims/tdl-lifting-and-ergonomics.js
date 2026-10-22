import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Lifting and Ergonomics VR — Mobility & Transit, the last of five
// warehouse stations in the Job Readiness Edition's TDL pre-apprenticeship
// block. A case-picking station where the loads are ordinary and the damage is
// cumulative: the job card read for weights and rate, each lift sized up, the
// lift scored the way the Revised NIOSH Lifting Equation scores it, the
// station itself changed so the lift gets easier — a pallet brought up to
// waist height and turned instead of reached across — a carry held close, a
// case set on the shelf in the power zone, a team lift called on a count, a
// cart pushed, a partner who hurts his back, a job rotation, and a discomfort
// report made early rather than kept quiet.
//
// Sited generically: no real employer and no clause number the registry is not
// sure of. The team-lift weight is this warehouse's policy, and says so.

const LFE_ACCENT = 0x8fc45a;
const LFE_WOOD = 0x9a7a55;
const LFE_CASE = 0xc9a978;

export const SIM_TDL_LIFTING_AND_ERGONOMICS = {
  id: "tdl-lifting-and-ergonomics",
  index: "221",
  domain: "Warehouse & Distribution",
  trade: "Warehouse associate, TDL pre-apprenticeship — Teamsters warehouse work: manual lifting and ergonomics, ahead of the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F) for those going on to Class A",
  category: "Mobility & Transit",
  indoor: "garage",
  certification: "The Revised NIOSH Lifting Equation and its Applications Manual — recommended weight limit and lifting index for two-handed lifts; NIOSH ergonomics research on repetitive manual handling; OSHA 29 CFR 1904 recording and reporting of work-related injuries, including a worker's right to report without retaliation; 29 CFR 1910.22 walking-working surfaces; 29 CFR 1910.178 and ANSI B56.1 for the pallet trucks that share the floor; Teamsters (IBT) warehouse locals' safety committees and ergonomics programmes",
  name: "Lifting and Ergonomics",
  title: simTitle("Lifting and Ergonomics"),
  tagline: "A case-picking station: the job card, each lift sized up and scored the way the NIOSH Lifting Equation scores it, the pallet raised and turned instead of reached across, a carry held close, the power-zone shelf, a team lift on a count, a partner who hurts his back, and a discomfort report made early",
  accent: LFE_ACCENT,
  accentCss: "#8fc45a",
  parSeconds: 250,
  footprint: 2.4,
  badge: { id: "power-zone", name: "Power Zone", note: "A shift of lifts with the station changed to fit the worker, the team lift called and the discomfort reported early — first time" },

  game: system({
    name: "Manual Handling",
    currency: "LIFT",
    ranks: ["New Associate", "Case Picker", "Station Lead", "Ergonomics Rep", "Manual Handling Certified"],
    badges: [
      { id: "changed-the-job", name: "Changed the Job", note: "Every station risk found without a hint", test: AWARD.stepClean("station-risks") },
      { id: "no-twist", name: "No Twist", note: "Never twisted with a load, lifted overhead, lifted a team case alone or a wet carton", test: AWARD.safe },
      { id: "under-one", name: "Under One", note: "The lifting index read near the centre of the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere at the station", test: AWARD.clean },
      { id: "steady-push", name: "Steady Push", note: "The cart push held in band the whole way", test: AWARD.unbroken },
      { id: "on-rate", name: "On Rate, Not Rushed", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "lfe-twist-lift": "You went to lift the case from the pallet and swing it round to the cart without moving your feet. Twisting under load puts the spine's discs in shear and compression at the same time — the lifting equation marks it down hard for exactly that reason. Turn by stepping, or turn the pallet.",
    "lfe-overhead-shelf": "You went to put the 40 lb case on the top shelf above your shoulders. Lifts above shoulder height load the shoulder and the lower back at once, with the load at arm's length and your view of it lost. Heavy stock lives in the waist-high zone; the top shelf is for light, slow-moving items.",
    "lfe-solo-heavy": "You went to lift the case marked for a team lift on your own. The mark is this warehouse's policy for a weight that exceeds a safe one-person lift for most people, and it is not a test of strength: a two-person lift or a lift assist halves what the back carries.",
    "lfe-wet-carton": "You went to lift the carton with the soaked, split bottom. A wet carton fails mid-lift, the contents drop and you instinctively try to catch them — a sudden, twisting, unplanned load, which is the lift most likely to injure a back. It is re-boxed or slid onto a tray first.",
  },

  lateNotes: {
    "lfe-case": "The case goes on the shelf after the pallet has been raised and turned and the carry held close — the easy lift is the one you set up first.",
    "lfe-lift-count": "The count starts once your partner has been called and both of you have a grip — a count with one person ready is a solo lift.",
    "lfe-warehouse-log": "The log closes the shift: it is written after the check-in, so the discomfort you reported goes into it.",
  },

  steps: [
    {
      id: "job-card", kind: "select", target: "lfe-job-card",
      title: "Read the job card",
      cue: "Read the case weights, the rate for the hour, the shelf heights and which cases are marked for a team lift.",
      why: "The job card is where the load, the pace and the reach are written down before the first lift. Those three together decide the risk: a light case lifted six hundred times an hour from the floor can hurt a back as surely as a heavy one lifted once. Knowing which cases are team lifts before you meet them is what stops you deciding by feel with one already in your hands.",
    },
    {
      id: "size-up", kind: "sequence",
      targets: ["lfe-weight-label", "lfe-tip-test", "lfe-path-check"],
      itemNames: { "lfe-weight-label": "read the weight label", "lfe-tip-test": "tip a corner to test it", "lfe-path-check": "check the path is clear" },
      title: "Size up the lift",
      cue: "Read the weight label, tip a corner to feel the load and whether it shifts, then look at the path you will carry it along.",
      why: "Most back injuries in warehouses come from a lift that was different from what the lifter expected: heavier, off-centre, with contents that slide, or carried into something on the floor. Reading the label, tipping one corner and looking at the path takes three seconds and removes every one of those surprises before the load is off the pallet.",
      outOfOrderNote: "Label, tip, path — know what it weighs before you test it, and know where it is going before you lift it.",
    },
    {
      id: "lifting-index", kind: "gauge", target: "lfe-lifting-index",
      title: "Score the lift",
      cue: "Set the lift's reach, height, twist and rate into the calculator and commit when the lifting index is at or under one.",
      why: "The Revised NIOSH Lifting Equation starts from a load of 51 lb under ideal conditions and reduces it for everything that makes a lift harder: the load held far from the body, lifted from near the floor or above the shoulders, carried over a long vertical distance, twisted, lifted often, or hard to grip. The load divided by that recommended limit is the lifting index; over one, the lift carries increased risk for some workers and the job, not the worker, should change.",
      gauge: { label: "LIFTING INDEX", speed: 0.7, green: [0.2, 0.5], readout: (t) => `LI ${(0.4 + t * 1.2).toFixed(2)}`, missNote: "That index is over one — change the lift before anybody does it six hundred times." },
    },
    {
      id: "station-risks", kind: "find", noHint: true,
      targets: ["lfe-floor-pallet", "lfe-far-reach", "lfe-no-handholds"],
      itemNames: { "lfe-floor-pallet": "the pallet sitting on the floor", "lfe-far-reach": "the far side of the pallet an arm's length away", "lfe-no-handholds": "the case with no handholds" },
      itemNotes: {
        "lfe-floor-pallet": "The pallet is on the floor, so every bottom-layer case starts at shin height. Raising it on the lift table takes the lowest, worst lifts out of the shift.",
        "lfe-far-reach": "The far row is an arm's length away across the pallet. Horizontal reach is the biggest single penalty in the lifting equation; turning the pallet brings that row to you.",
        "lfe-no-handholds": "This case has no handholds and a slick film. A poor grip is its own penalty — the fingers tire first and the case slips. Handle it with a hook or ask for cut-outs from the supplier.",
      },
      title: "Find what makes this station hard",
      cue: "Look at the station, not at yourself. Find the three things that make every lift here worse than it needs to be.",
      why: "Ergonomics fixes the job so it fits the person, not the other way round. A pallet on the floor, a far reach and a poor grip are each a multiplier in the lifting equation that drives the recommended limit down, and each has a simple engineering fix. Finding them is worth more over a shift than any amount of lifting technique applied to a station that is set up badly.",
    },
    {
      id: "turntable", kind: "turn", target: "lfe-turntable",
      title: "Raise and turn the pallet",
      cue: "Raise the pallet on the lift table to waist height and rotate the turntable to bring the far row in front of you.",
      why: "A lift table that keeps the working layer at waist height and a turntable that brings the far side round to you remove the two worst multipliers at this station at once: the low lift and the long reach. Turning the pallet instead of reaching across it is also what stops the twist, because the load comes to your feet rather than your feet staying put while your back goes to the load.",
      turn: { turns: 0.25, axis: "y", label: "TURNTABLE" },
    },
    {
      id: "carry-hold", kind: "hold", target: "lfe-carry-hold", seconds: 8,
      title: "Carry the case close",
      cue: "Lift with the case tight to your body between knuckle and shoulder height, and hold it close through the carry.",
      why: "The further a load is from your body, the more the lower back has to work to hold it: a case held at arm's length loads the spine far more than the same case hugged to the stomach. Keeping it close and between knuckle and shoulder height is the power zone, where the big muscles do the work and you can still see where you are putting your feet.",
      holdBreakNote: "The case drifted away from your body. Bring it back in close and hold it there.",
    },
    {
      id: "shelve", kind: "drag", target: "lfe-case",
      title: "Set the case on the waist-high shelf",
      cue: "Step your feet round to face the shelf and set the case on the waist-high shelf, not the top one.",
      why: "Setting a load down is half the lift and the half people rush. Facing the shelf by stepping rather than twisting, and setting heavy stock at waist height, keeps the put-away as easy as the pick. The top shelf is for light, slow-moving product for a reason: every heavy case put up there is a case somebody else has to lift down from above their shoulders.",
      drag: { to: "lfe-shelf-socket", radius: 0.45, missNote: "Not on the waist-high shelf — heavy cases live in the power zone." },
    },
    {
      id: "team-lift", kind: "sequence",
      targets: ["lfe-partner-call", "lfe-lift-count"],
      itemNames: { "lfe-partner-call": "call your partner", "lfe-lift-count": "lift together on a count" },
      title: "Call the team lift",
      cue: "Call your partner for the team-lift case, agree who counts, and lift together on the count.",
      why: "A team lift only halves the load if both people take it at the same moment; one person lifting early takes the whole weight for the half second that matters. Calling the partner before touching the case, agreeing who counts, and lifting and setting down on that count is what turns two people standing near a heavy box into an actual team lift.",
      outOfOrderNote: "Partner first, then the count — a count with one person on the case is a solo lift.",
    },
    {
      id: "cart-push", kind: "track", target: "lfe-cart-handle", seconds: 8,
      title: "Push the loaded cart",
      cue: "Push the cart, do not pull it, with steady force at walking pace to the outbound lane.",
      why: "Pushing lets you use your body weight and keeps you facing where the cart is going; pulling twists the spine and puts the load behind you. The hardest part of a push is starting it, so steady force at a walking pace — not a shove and a coast — keeps the peak load on the shoulders and back low and the cart under control at the lane end.",
      track: { start: 0.1, green: [0.38, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "PUSH FORCE", readout: (v) => (v < 0.38 ? "stalled" : v > 0.6 ? "shoving" : "steady") },
      holdBreakNote: "Force out of band — a shove and a coast puts the peak load on your back. Settle to a steady push.",
    },
    {
      id: "rotation", kind: "select", target: "lfe-rotation-board",
      title: "Rotate to the lighter task",
      cue: "Check the rotation board and move to the labelling task for the next hour.",
      why: "Job rotation spreads repetitive load across different muscle groups and gives the ones you have been using a real recovery window. It works only if the next task is genuinely different — labelling after case picking, not picking a different aisle — and only if people actually rotate when the board says so rather than staying put to keep a rate.",
    },
    {
      id: "next-hour", kind: "find", noHint: true,
      targets: ["lfe-rate-board", "lfe-worn-gloves"],
      itemNames: { "lfe-rate-board": "the rate raised for the next hour", "lfe-worn-gloves": "the gloves worn through at the fingers" },
      itemNotes: {
        "lfe-rate-board": "The rate for the next hour has gone up by a third. Frequency is a multiplier in the lifting equation — the same case at a higher rate is a harder job, and that belongs in the check-in.",
        "lfe-worn-gloves": "These gloves are worn through at the fingertips. A poor grip makes every lift harder on the forearms and more likely to slip; new gloves are a two-minute fix.",
      },
      title: "Look at the next hour",
      cue: "Before you start again, find what will make the next hour harder than this one.",
      why: "Risk from manual handling builds with time and pace as much as with weight: a higher rate, a tiring grip and a shift running long all push the same lifts toward injury. Noticing them before the hour starts is what lets you do something about them — raise the rate with the lead, change the gloves — instead of noticing the ache afterwards.",
    },
    {
      id: "crew-checkin", kind: "select", target: "lfe-crew-checkin",
      title: "Check in with the lead",
      cue: "Report your partner's back, the rate change and the station fixes, and say honestly how your own back and hands feel.",
      why: "Musculoskeletal injuries rarely arrive all at once; they announce themselves as stiffness, tingling and aches weeks before the day someone cannot lift. Saying it early gets a station changed or a task rotated while it is still discomfort. A worker has the right to report a work-related injury without retaliation, and a check-in where the honest answer is welcome is how that right gets used.",
    },
    {
      id: "warehouse-log", kind: "select", target: "lfe-warehouse-log",
      title: "Write the warehouse log",
      cue: "Log the station changes, your partner's injury and first aid, and your own discomfort report, then sign it.",
      why: "Your partner's back is a work-related injury, and whether it is recordable under 29 CFR 1904 depends on what treatment follows, which is why it is written down today with a time and a task. A discomfort report on its own is not an injury record, but it is the pattern-spotting a safety committee needs: three people reporting the same station is a station that needs changing.",
    },
  ],

  interrupts: [
    {
      id: "jack-in-walkway",
      kind: "Obstruction in the carry path",
      after: "carry-hold", delay: 3, seconds: 10,
      alert: "Someone has left a pallet jack with its forks out across the walkway you are carrying the case along.",
      cue: "Set the case down; do not step over the forks with it.",
      target: "lfe-staging-table",
      why: "Stepping over pallet-jack forks with a case in your arms blocks your view of your feet exactly where there is something to trip on. Setting the case on the staging table and moving the jack first costs ten seconds; the fall costs weeks.",
      missNote: "You carried on toward the forks with a case blocking your view. Trips over pallet-jack forks while carrying are a classic warehouse fall — you cannot put your hands out because they are full.",
      wrongNote: "It is the staging table. There is a trip hazard in your path and your arms are full; put the load down first.",
    },
    {
      id: "partner-hurt",
      kind: "Coworker injured",
      after: "cart-push", delay: 3, seconds: 12,
      alert: "Your team-lift partner has stopped with a hand on his lower back and says something just went.",
      cue: "Stop the job and get him help.",
      target: "lfe-first-aid-call",
      why: "A back that 'just went' is an injury, not a moment to push through: the right response is to stop the task, call the lead and first aid, and not let him lift again until someone has looked at it. Carrying on to finish the rate is how a strain becomes a disc.",
      missNote: "You kept pushing while your partner stood there hurt. The shift's rate is never worth a coworker finishing a job on an injured back; the call gets him seen and gets the injury on the record today.",
      wrongNote: "It is the first-aid call point. Your partner has just hurt his back and everything else waits.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.4, LFE_ACCENT);

    // ------------------------------------------------------------ floor and walkway
    const floor = box(g, 6.8, 0.1, 6.2, 0, 0.05, -0.1, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#6c7278", base2: "#5f656b", seam: "rgba(0,0,0,0.32)",
    }), { repeat: 4, px: 512 }), { rough: 0.9, metal: 0.03, color: 0xc6cacf });
    for (const z of [0.25, 1.35]) box(g, 5.6, 0.006, 0.08, 0, 0.103, z, 0xf2c14b, { rough: 0.7, cast: false });
    holoTag(g, "carry path", -2.3, 0.3, 0.8, { css: "#f2c14b", w: 0.22 });

    // ------------------------------------------------------------ the pallet: first on the floor, then on the lift table
    const table = group(g, -1.0, 0.1, -1.3);
    box(table, 1.25, 0.08, 1.25, 0, 0.04, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const scissor = group(table, 0, 0, 0);
    for (const sx of [-1, 1]) { const arm = box(scissor, 0.05, 0.05, 1.1, sx * 0.5, 0.2, 0, 0x59636d, { rough: 0.5, metal: 0.5 }); arm.rotation.x = 0.3; }
    const deck = group(table, 0, 0.12, 0);
    cyl(deck, 0.62, 0.62, 0.05, 0, 0.02, 0, 0x8fc45a, { rough: 0.5, metal: 0.3, seg: 24 });
    const pallet = group(deck, 0, 0.05, 0);
    box(pallet, 1.0, 0.13, 1.1, 0, 0.065, 0, LFE_WOOD, { rough: 0.9 });
    const layer = [];
    for (const [dx, dz] of [[-0.25, -0.28], [0.25, -0.28], [-0.25, 0.28], [0.25, 0.28]]) layer.push(box(pallet, 0.46, 0.34, 0.5, dx, 0.3, dz, LFE_CASE, { rough: 0.85 }));
    for (const [dx, dz] of [[-0.25, -0.28], [0.25, -0.28], [-0.25, 0.28]]) box(pallet, 0.46, 0.34, 0.5, dx, 0.64, dz, 0xbfa37a, { rough: 0.85 });
    reg2(deck, "lfe-turntable");
    const lowMark = box(table, 1.1, 0.12, 0.1, 0, 0.18, 0.6, 0x8fc45a, { opacity: 0.35, cast: false });
    holoTag(table, "pallet at shin height", 0, 0.5, 0.75, { css: "#8fc45a", w: 0.36 });
    reg2(lowMark, "lfe-floor-pallet");
    const farRow = box(pallet, 0.96, 0.05, 0.5, 0, 0.84, -0.28, 0x8fc45a, { opacity: 0.35, cast: false });
    reg2(farRow, "lfe-far-reach");
    const slick = box(pallet, 0.46, 0.34, 0.5, 0.25, 0.64, 0.28, 0xdfe8ee, { rough: 0.15, metal: 0.1 });
    reg2(slick, "lfe-no-handholds");
    // The case to shelve, sitting on the working layer.
    const theCase = group(pallet, -0.25, 0.47, 0.28);
    box(theCase, 0.4, 0.28, 0.44, 0, 0.14, 0, 0xd4b88a, { rough: 0.85 });
    decal(theCase, 0.16, 0.08, 0, 0.18, 0.221, signFace("38 LB", { bg: "#d4b88a", fg: "#1b1e23", accent: "#8fc45a", scale: 0.5 }), { px: 96 });
    reg2(theCase, "lfe-case");
    const weightLabel = decal(pallet, 0.16, 0.08, 0.25, 0.32, 0.531, signFace("38 LB", { bg: "#f2ede0", fg: "#1b1e23", accent: "#8fc45a", scale: 0.5 }), { px: 96 });
    reg2(weightLabel, "lfe-weight-label");
    const tip = box(pallet, 0.08, 0.08, 0.08, -0.47, 0.5, 0.52, 0x8fc45a, { emissive: 0x8fc45a, ei: 0.5, rough: 0.5 });
    reg2(tip, "lfe-tip-test");
    const twist = slab(g, 0.8, 0.02, 0.8, -0.1, 0.11, -0.2, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(g, "swing it round, feet planted?", -0.1, 0.34, -0.2, { css: "#d2312b", w: 0.5 });
    reg2(twist, "lfe-twist-lift");

    // ------------------------------------------------------------ shelving: low, waist and top
    const shelf = group(g, 1.35, 0.1, -1.9, -0.3);
    for (const x of [-0.6, 0.6]) for (const z of [-0.25, 0.25]) box(shelf, 0.05, 2.1, 0.05, x, 1.05, z, 0x3f6f8f, { rough: 0.5, metal: 0.4 });
    for (const y of [0.3, 0.95, 1.75]) box(shelf, 1.25, 0.03, 0.55, 0, y, 0, 0x8b98a5, { rough: 0.5, metal: 0.3 });
    for (const [dx, y] of [[-0.35, 0.3], [0.3, 0.3], [0.3, 0.95], [-0.3, 1.75], [0.25, 1.75]]) box(shelf, 0.4, 0.26, 0.44, dx, y + 0.145, 0, dx < 0 ? 0xbfa37a : LFE_CASE, { rough: 0.85 });
    const socket = box(shelf, 0.42, 0.28, 0.44, -0.3, 1.11, 0, 0xffffff, { rough: 0.5 });
    socket.visible = false; hits["lfe-shelf-socket"] = socket;
    holoTag(shelf, "waist-high: heavy stock", -0.3, 1.36, 0.3, { css: "#8fc45a", w: 0.4 });
    const topMark = slab(shelf, 1.1, 0.02, 0.5, 0, 1.78, 0, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(shelf, "top shelf, 40 lb case?", 0, 2.05, 0.3, { css: "#d2312b", w: 0.38 });
    reg2(topMark, "lfe-overhead-shelf");

    // ------------------------------------------------------------ the team-lift case and the wet carton
    const heavy = group(g, 0.35, 0.1, -0.1, 0.2);
    box(heavy, 0.7, 0.45, 0.5, 0, 0.225, 0, 0xb89a6c, { rough: 0.85 });
    decal(heavy, 0.36, 0.12, 0, 0.3, 0.251, signFace("TEAM LIFT · 85 LB", { bg: "#f2c14b", fg: "#1b1e23", accent: "#1b1e23", scale: 0.4 }), { px: 160 });
    const soloMark = box(heavy, 0.74, 0.08, 0.54, 0, 0.5, 0, 0xd2312b, { opacity: 0.3, cast: false });
    holoTag(heavy, "lift it alone?", 0, 0.7, 0, { css: "#d2312b", w: 0.26 });
    reg2(soloMark, "lfe-solo-heavy");
    const count = box(heavy, 0.1, 0.1, 0.1, 0.36, 0.3, 0, 0x8fc45a, { emissive: 0x8fc45a, ei: 0.5, rough: 0.5 });
    holoTag(heavy, "lift on the count", 0.5, 0.52, 0.1, { css: "#8fc45a", w: 0.3 });
    reg2(count, "lfe-lift-count");
    const wet = group(g, -2.3, 0.1, -0.6);
    box(wet, 0.45, 0.35, 0.4, 0, 0.175, 0, 0x8a7050, { rough: 0.95 });
    cyl(wet, 0.3, 0.3, 0.004, 0, 0.003, 0, 0x3a4550, { rough: 0.1, opacity: 0.7, seg: 18, cast: false });
    holoTag(wet, "soaked bottom — lift it?", 0, 0.6, 0, { css: "#d2312b", w: 0.42 });
    reg2(wet, "lfe-wet-carton");

    // ------------------------------------------------------------ staging table, cart, path
    const staging = group(g, -2.2, 0.1, 1.9, Math.PI / 2);
    box(staging, 1.0, 0.05, 0.6, 0, 0.85, 0, 0x8b98a5, { rough: 0.5, metal: 0.3 });
    for (const [x, z] of [[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]]) box(staging, 0.04, 0.83, 0.04, x, 0.42, z, 0x59636d, { rough: 0.5, metal: 0.4 });
    holoTag(staging, "staging table", 0, 1.1, 0, { css: "#8fc45a", w: 0.26 });
    reg2(staging, "lfe-staging-table");
    const setDown = box(staging, 0.4, 0.28, 0.44, 0, 1.02, 0, 0xd4b88a, { rough: 0.85 });
    setDown.visible = false;
    const cart = group(g, 0.9, 0.1, 0.8);
    box(cart, 1.0, 0.05, 0.6, 0, 0.25, 0, 0x2f7fbf, { rough: 0.5, metal: 0.3 });
    for (const [x, z] of [[-0.42, -0.24], [0.42, -0.24], [-0.42, 0.24], [0.42, 0.24]]) cyl(cart, 0.07, 0.07, 0.05, x, 0.08, z, 0x1c1f23, { rough: 0.8, seg: 12 }).rotation.z = Math.PI / 2;
    const cartHandle = box(cart, 0.04, 0.8, 0.6, 0.5, 0.65, 0, 0x2b2f34, { rough: 0.5 });
    reg2(cartHandle, "lfe-cart-handle");
    for (const dx of [-0.25, 0.2]) box(cart, 0.4, 0.28, 0.44, dx, 0.42, 0, LFE_CASE, { rough: 0.85 });
    const carryHit = box(g, 0.5, 0.35, 0.5, -0.55, 1.1, -0.35, 0x8fc45a, { opacity: 0.2, cast: false });
    holoTag(g, "carry close — hold", -0.55, 1.45, -0.35, { css: "#8fc45a", w: 0.32 });
    reg2(carryHit, "lfe-carry-hold");
    const pathMark = box(g, 1.2, 0.01, 0.8, -0.8, 0.106, 0.8, 0x8fc45a, { opacity: 0.25, cast: false });
    reg2(pathMark, "lfe-path-check");
    // The pallet jack someone leaves across the walkway.
    const jack = group(g, 2.7, 0.1, 2.2, Math.PI / 2);
    box(jack, 0.55, 0.5, 0.3, 0, 0.3, 0.3, 0xd9a13a, { rough: 0.5 });
    for (const sx of [-1, 1]) box(jack, 0.16, 0.06, 1.1, sx * 0.2, 0.05, -0.4, 0x3a3f45, { rough: 0.5, metal: 0.5 });
    const jackArm = cyl(jack, 0.02, 0.02, 0.9, 0, 0.7, 0.55, 0x2b2f34, { rough: 0.5, seg: 8 });
    jackArm.rotation.x = 0.5;

    // ------------------------------------------------------------ inbound pallets waiting and a building column
    const inbound = (x, z, ry, tiers, tone) => {
      const p = group(g, x, 0.1, z, ry);
      box(p, 1.0, 0.13, 1.1, 0, 0.065, 0, LFE_WOOD, { rough: 0.9 });
      for (let tIdx = 0; tIdx < tiers; tIdx++) for (const [dx, dz] of [[-0.25, -0.28], [0.25, -0.28], [-0.25, 0.28], [0.25, 0.28]]) {
        box(p, 0.46, 0.3, 0.5, dx, 0.28 + tIdx * 0.31, dz, tIdx % 2 ? tone : LFE_CASE, { rough: 0.85 });
      }
      box(p, 1.02, tiers * 0.31, 1.12, 0, 0.13 + tiers * 0.155, 0, 0xdfe8ee, { rough: 0.2, opacity: 0.22, cast: false });
      return p;
    };
    inbound(-2.55, -2.45, 0.1, 4, 0xbfa37a);
    inbound(-1.4, -2.6, -0.05, 3, 0xd4b88a);
    inbound(2.6, -2.2, 0.3, 2, 0xb89a6c);
    const col = group(g, 2.75, 0.1, -0.95);
    box(col, 0.32, 3.0, 0.32, 0, 1.5, 0, 0xc9ced2, { rough: 0.7 });
    for (let i = 0; i < 5; i++) { const s = box(col, 0.34, 0.12, 0.34, 0, 0.1 + i * 0.2, 0, i % 2 ? 0x1b1e23 : 0xf2c14b, { rough: 0.6 }); void s; }

    // ------------------------------------------------------------ boards, glove bin, first-aid call point
    const card = holoPanel(g, 0.8, 0.52, -2.4, 1.5, -1.3, (ctx, w, h) => {
      ctx.fillStyle = "#0e1608"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8fc45a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e4f4d4"; ctx.fillText("JOB CARD — CASE PICK, STATION 4", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f4fbee";
      ["Cases 22–38 lb · 1 case 85 lb", "Team lift over 50 lb (site policy)", "Rate: 180 cases / hour", "Lift table + turntable in use", "Heavy stock: waist-high shelf", "Rotate hourly — see the board"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 1.0, accent: LFE_ACCENT });
    reg2(card, "lfe-job-card");
    const calc = instrument(g, -1.9, 1.1, 0.1, { idle: "LI --", color: LFE_ACCENT, w: 0.16, d: 0.2, ry: 0.9 });
    holoTag(g, "lifting index", -1.9, 1.32, 0.1, { css: "#8fc45a", w: 0.26 });
    reg2(calc, "lfe-lifting-index");
    const rotation = holoPanel(g, 0.5, 0.34, 2.45, 1.6, -0.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8fc45a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e4f4d4"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("ROTATION", w / 2, h * 0.24);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["10:00 case pick", "11:00 labelling", "12:00 case pick"].forEach((l, i) => ctx.fillText(l, w / 2, h * (0.46 + i * 0.16)));
    }, { ry: -1.2, accent: LFE_ACCENT });
    reg2(rotation, "lfe-rotation-board");
    const rate = decal(g, 0.3, 0.16, 2.6, 1.1, 0.35, signFace("NEXT HOUR 240/h", { bg: "#2b1a08", accent: "#f2ae14", scale: 0.4 }), { px: 160 });
    rate.rotation.y = -Math.PI / 2;
    reg2(rate, "lfe-rate-board");
    const gloveBin = group(g, 2.35, 0.1, 1.1, -Math.PI / 2);
    box(gloveBin, 0.4, 0.3, 0.3, 0, 0.9, 0, 0x59636d, { rough: 0.6 });
    const worn = box(gloveBin, 0.16, 0.05, 0.12, 0, 1.08, 0, 0x8a6a3a, { rough: 0.9 });
    holoTag(gloveBin, "your gloves", 0, 1.3, 0, { css: "#8fc45a", w: 0.2 });
    reg2(worn, "lfe-worn-gloves");
    const aid = group(g, 2.55, 0.1, 2.3, -2.4);
    box(aid, 0.06, 1.3, 0.06, 0, 0.65, 0, 0x3a8a4a, { rough: 0.5 });
    const aidBox = box(aid, 0.26, 0.22, 0.12, 0, 1.25, 0.05, 0x3a8a4a, { rough: 0.5 });
    decal(aid, 0.2, 0.1, 0, 1.25, 0.115, signFace("FIRST AID CALL", { bg: "#3a8a4a", accent: "#ffffff", scale: 0.35 }), { px: 128 });
    reg2(aidBox, "lfe-first-aid-call");
    const checkin = holoPanel(g, 0.46, 0.3, -0.5, 1.75, 2.45, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CREW CHECK-IN", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Backs · hands · the rate", w / 2, h * 0.66);
    }, { ry: 0.3, accent: 0x4fd1ff });
    reg2(checkin, "lfe-crew-checkin");
    const log = holoPanel(g, 0.5, 0.34, 0.9, 1.6, 2.45, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,16,6,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8fc45a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e4f4d4"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("WAREHOUSE LOG", w / 2, h * 0.28);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Station · injury · discomfort", w / 2, h * 0.6);
    }, { ry: -0.5, accent: LFE_ACCENT });
    reg2(log, "lfe-warehouse-log");

    // ------------------------------------------------------------ people
    const partner = standingFigure(g, 0.45, -1.0, { ry: 2.8, cloth: 0x37505f, vest: 0xd8e24a });
    holoTag(partner, "team-lift partner", 0, 1.95, 0, { css: "#8fc45a", w: 0.3 });
    const partnerHit = box(partner, 0.35, 0.4, 0.3, 0, 1.2, 0.2, 0xffffff, { opacity: 0.001, cast: false });
    reg2(partnerHit, "lfe-partner-call");

    let pushed = 0;
    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.2, 0.9, -0.9),
      onStepComplete(step) {
        if (step.id === "lifting-index") repaint(calc.userData.screen, signFace("LI 0.82", { bg: "#0e1608", accent: "#59c97b", fg: "#f4fbee", scale: 0.5 }));
        if (step.id === "turntable") { table.position.y = 0.1; deck.position.y = 0.55; scissor.scale.y = 3; deck.rotation.y = Math.PI / 2; }
        if (step.id === "shelve") { theCase.parent.remove(theCase); shelf.add(theCase); theCase.position.set(-0.3, 0.97, 0); theCase.rotation.set(0, 0, 0); }
        if (step.id === "warehouse-log") {
          repaint(log.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(8,26,14,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#d8f6e4"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.fillText("LOG SIGNED", w / 2, h * 0.36);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Back strain 11:40 · first aid", w / 2, h * 0.66);
          });
        }
      },
      // The jack really lands across the walkway; the partner really bends
      // over with a hand on his back.
      onInterrupt(it) {
        if (it.id === "jack-in-walkway") { jack.position.set(-0.4, 0.1, 0.8); jack.rotation.y = 0.2; }
        if (it.id === "partner-hurt") { partner.userData.body.rotation.x = 0.45; partner.position.set(0.6, 0, -0.75); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "jack-in-walkway") { setDown.visible = true; jack.position.set(2.7, 0.1, 2.2); jack.rotation.y = Math.PI / 2; }
        if (it.id === "partner-hurt") { partner.userData.body.rotation.x = 0.15; aidBox.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.5 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "lifting-index") {
          const ok = gg.t >= 0.2 && gg.t <= 0.5;
          repaint(calc.userData.screen, signFace(`LI ${(0.4 + gg.t * 1.2).toFixed(2)}`, { bg: "#0e1608", accent: ok ? "#59c97b" : "#f2ae14", fg: "#f4fbee", scale: 0.5 }));
        }
        if (session?.turn && step?.id === "turntable") deck.rotation.y = session.turn.amount * Math.PI * 2;
        if (step?.id === "cart-push" && session.holding) pushed = Math.min(1, pushed + dt / 8);
        cart.position.x = 0.9 + pushed * 0.8;
        void t; void layer;
      },
    };
  },
};
