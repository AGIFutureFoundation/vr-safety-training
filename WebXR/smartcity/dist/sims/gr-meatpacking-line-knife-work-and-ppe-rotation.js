import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, concreteFace, stainlessFace, gratingFace, safetyStripeFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Meatpacking Line Knife Work & PPE Rotation VR — Culinary &
// Hospitality, grocery pack (gr-), station six. A meatpacking production
// line's own cutting station: the knife checked out, the edge honed steady
// before the first cut, the cut-resistant PPE donned in the order that
// actually protects a wrist and a forearm, and the line-speed rotation that
// is the plant's own answer to a repetitive strain injury nobody feels
// until it's already there. Real trade, sited generically; no clause
// invented, no rate stated beyond the line's own posted band, the union
// named only as a training body.

const GR6_ACCENT = 0xc9622a;

export const SIM_GR_MEATPACKING_LINE_KNIFE_WORK_AND_PPE_ROTATION = {
  id: "gr-meatpacking-line-knife-work-and-ppe-rotation",
  index: "gr-6",
  domain: "Meatpacking production line",
  trade: "Meatpacking line worker",
  category: "Culinary & Hospitality",
  indoor: "plant",
  certification: "UFCW member training for meatpacking work; OSHA 29 CFR 1910.138 hand protection; OSHA 29 CFR 1910.132 personal protective equipment; ANSI/ISEA 105 cut-resistance ratings; USDA inspection and grading marks on meat and poultry",
  name: "Meatpacking Line Knife Work & PPE Rotation",
  title: simTitle("Meatpacking Line Knife Work & PPE Rotation"),
  tagline: "The knife issued and honed, the cut-resistant PPE donned in order, the line speed checked against its posted band, and the rotation that keeps one motion from becoming a whole shift's injury",
  accent: GR6_ACCENT,
  accentCss: "#c9622a",
  parSeconds: 290,
  footprint: 2.7,
  badge: { id: "line-ready", name: "Line Ready", note: "A full line changeover with the edge honed, the PPE donned in order and the rotation actually taken on schedule" },

  game: system({
    name: "Line Authority",
    currency: "HONE",
    ranks: ["Line Trainee", "Line Cutter", "Lead Cutter", "Line Supervisor", "Line Authority Certified"],
    badges: [
      { id: "ppe-first", name: "PPE First", note: "Gloved and guarded before the knife was ever issued", test: AWARD.stepClean("knife-issue") },
      { id: "handle-first", name: "Handle First", note: "Never passed or reached for a blade the wrong way", test: AWARD.safe },
      { id: "steady-hone", name: "Steady Hone", note: "Held the honing angle and the cut stroke inside the safe band every time", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-changeover", name: "Clean Changeover", note: "No corrections through the whole line changeover", test: AWARD.clean },
      { id: "held-the-hold", name: "Held The Hold", note: "Never broke a timed hold early", test: AWARD.unbroken },
      { id: "line-fast", name: "Line Ready Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dull-blade-forced": "That knife on the rail is visibly nicked and dulled, and it's tempting to press down harder with it rather than swap it out. A dull edge needs more downward force to make the same cut, and force is exactly what turns a slip into a laceration on a line moving at a set pace.",
    "blade-first-pass": "That knife is sitting blade-first, handle away, the way it should never be picked up or handed off. A blade passed or reached for edge-first hands the next set of fingers the one part of it that cuts, first.",
    "missing-mesh-glove": "That station down the line has no mesh glove hanging at it — somebody is cutting without one. A cut-resistant glove that stays on its hook instead of a hand is exactly the gap ANSI/ISEA 105's rating was never going to close by itself.",
    "line-speed-override": "You cranked the speed request dial past the posted band instead of calling for a slower line. Running ahead of the band you were trained to work inside of is how a controlled cut turns into a rushed one, every single time the line is running faster than the cut in front of it.",
  },

  lateNotes: {
    "cut-sleeve": "Glove first, then the sleeve over its cuff — not the other way around.",
    "line-knife": "Not until the PPE is on. This knife doesn't get picked up bare-armed.",
  },

  steps: [
    {
      id: "line-assignment", kind: "select", target: "line-board",
      title: "Read the line assignment board",
      cue: "Check your station on the line and today's rotation schedule before anything else.",
      why: "The board is what tells you which cut this station makes and when your rotation comes around — starting without reading it means guessing at both, on a line that does not slow down to let you catch up.",
    },
    {
      id: "don-cut-ppe", kind: "sequence",
      targets: ["mesh-glove", "cut-sleeve", "belly-apron"],
      itemNames: { "mesh-glove": "cut-resistant mesh glove", "cut-sleeve": "cut sleeve", "belly-apron": "belly-guard apron" },
      title: "Don PPE in order",
      cue: "Glove, then sleeve over its cuff, then the belly-guard apron over both — in that order.",
      why: "OSHA 29 CFR 1910.138 and ANSI/ISEA 105 rate each piece on its own, but the order is what makes them work together: the sleeve overlaps the glove's cuff, and the apron overlaps the sleeve, so there is no gap between them for an edge to find.",
      outOfOrderNote: "Wrong order — glove first, sleeve over its cuff next, apron over both last.",
    },
    {
      id: "knife-issue", kind: "select", target: "knife-crib",
      title: "Check out your knife",
      cue: "Sign your knife out of the crib for this shift, per the plant's own tool-control procedure.",
      why: "A knife accounted for at check-out is a knife accounted for at check-in — tool control on a cutting line is what tells the next shift, and an inspector, that every blade issued today is a blade that came back.",
    },
    {
      id: "steel-hone", kind: "hold", target: "honing-steel", seconds: 6,
      title: "Hone the edge before the first cut",
      cue: "Draw the blade down the steel at a steady angle and hold it through the full pass count.",
      why: "A honed edge needs less force to make the same cut than a dull one does, and less force behind a knife is less force behind a slip. Honing before the first cut, not after the knife starts fighting the product, is what keeps that force low all shift.",
      holdBreakNote: "Angle broke off mid-pass. Reset against the steel and hold a steady angle through the full count.",
    },
    {
      id: "line-speed-check", kind: "gauge", target: "line-speed-dial",
      title: "Check the line speed against its posted band",
      cue: "Read the line speed indicator and commit once it's inside the posted safe band for this cut.",
      why: "The posted band is the plant's own answer to how fast this specific cut can be made safely, and it's checked before the first product reaches your station, not discovered by falling behind on the third one.",
      gauge: { label: "LINE SPEED", speed: 0.6, green: [0.3, 0.6], readout: (t) => (t < 0.3 ? "under band — line stalled" : t > 0.6 ? "over posted band" : "inside posted band"), missNote: "Outside the posted band — flag it before the first product reaches this station, not after." },
    },
    {
      id: "walk-line-station", kind: "find", noHint: true,
      targets: ["nicked-blade", "unsheathed-spare"],
      itemNames: { "nicked-blade": "a visibly nicked blade left on the rail", "unsheathed-spare": "a spare knife with no sheath" },
      itemNotes: {
        "nicked-blade": "This blade's edge is visibly chipped. A nicked edge does not get pressed into service on the next changeover — it goes back to the crib to be reground, not back onto the line.",
        "unsheathed-spare": "A spare knife sitting loose with no sheath on the rail is a blade anyone's hand can find edge-first without meaning to.",
      },
      decoyNotes: { "clean-rail": "The rail here is clear, every knife sheathed or racked. Leave it." },
      title: "Walk the station before the line starts",
      cue: "Two things at this station are wrong. Find them before the first product arrives.",
      why: "A changeover isn't finished when your own PPE is on — it's finished when the station around you is checked too. Two things left wrong here become the next cutter's surprise, not just yours.",
    },
    {
      id: "cut-motion", kind: "track", target: "line-knife", seconds: 6,
      title: "Practice a controlled cutting stroke",
      cue: "Draw the blade through a controlled stroke length — not a cramped one, not an overreach.",
      why: "A cramped stroke forces you to reposition constantly, and an overreach puts your off-hand closer to the blade's path than it needs to be — a controlled, consistent stroke length is the one that repeats safely a few hundred times a shift.",
      track: {
        start: 0.15, green: [0.35, 0.62], rise: 0.5, fall: 0.42, drift: 0.1, label: "STROKE LENGTH",
        readout: (v) => (v < 0.35 ? "too short — cramped, repositioning constantly" : v > 0.62 ? "too long — overreaching the off-hand" : "controlled stroke"),
      },
      holdBreakNote: "Out of the controlled band — reset your stroke length before the off-hand drifts into the blade's own path.",
    },
    {
      id: "pass-knife-safely", kind: "select", target: "knife-pass-tray",
      title: "Pass the knife handle-first",
      cue: "Set the knife handle-first on the pass tray for the next cutter, never handed edge-out.",
      why: "The pass tray is what takes the handoff out of two hands entirely — a knife set down handle-first and picked up handle-first never has a moment where the blade is pointed at anybody's hand but the person already holding it.",
    },
    {
      id: "request-speed-adjust", kind: "turn", target: "speed-request-dial",
      title: "Request a line-speed adjustment",
      cue: "Turn the request dial to call for the line to slow to the posted band, not past it.",
      why: "The request dial is the line's own control for exactly this moment — falling behind the cut in front of you is a reason to call for the posted band to be held, not a reason to rush the next several cuts to catch back up.",
      turn: { turns: 0.5, axis: "y", label: "SPEED REQUEST" },
    },
    {
      id: "sanitize-knife", kind: "drag", target: "line-knife",
      title: "Dip the knife between tasks",
      cue: "Drop the knife into the sanitising dip station between cuts on different product.",
      why: "A blade carries whatever it last cut into the next one it touches — the dip station between tasks is what keeps one product's contact time from becoming the next product's contamination.",
      drag: { to: "sani-dip", radius: 0.28, missNote: "Not in the dip station — the blade goes there between products, not wiped on an apron." },
    },
    {
      id: "rotation-schedule", kind: "select", target: "rotation-board",
      title: "Take your scheduled rotation",
      cue: "Check the rotation board and move to your next assigned task on schedule.",
      why: "The rotation exists because the same motion repeated for a whole shift is what builds a repetitive strain injury nobody feels coming — taking it on schedule, not skipping it for one more cycle, is the entire point of it being scheduled at all.",
    },
    {
      id: "return-knife", kind: "select", target: "knife-crib",
      title: "Return your knife to the crib",
      cue: "Sign your knife back into the crib at the end of your task on this station.",
      why: "The knife that left the crib with your name on it is the same knife that has to come back with your name on it — tool control only works if the return happens every time, not just when nothing else is going on.",
    },
    {
      id: "handwash", kind: "hold", target: "hand-sink", seconds: 6,
      title: "Wash hands and tools between line changes",
      cue: "Wash your hands and the sanitised tools and hold through the full wash count.",
      why: "A line change is a contact-time reset for your hands, not just your knife — a wash cut short leaves the last task's residue riding into the next one on the one tool nobody else double-checks.",
      holdBreakNote: "Cut the wash short. Hold the full count — a fast rinse moves residue around instead of actually clearing it.",
    },
    {
      id: "sign-line-log", kind: "select", target: "line-log",
      title: "Sign the line log",
      cue: "Sign the log to close out this changeover.",
      why: "The signature is the cutter taking responsibility for the whole changeover — knife issued and returned, PPE donned in order, rotation taken — and it's the record a supervisor reads if this station's history is ever questioned.",
    },
  ],

  interrupts: [
    {
      id: "coworker-blade-first-handoff",
      kind: "Wrong handoff about to happen",
      after: "steel-hone", delay: 4, seconds: 12,
      alert: "A coworker is walking up holding their knife out blade-first, about to hand it to you directly instead of using the tray.",
      cue: "That handoff has a blade pointed at your hand the whole way across.",
      target: "knife-pass-tray",
      why: "Redirecting a direct, blade-first handoff to the tray is the exact habit this line runs on — a knife changes hands cleanly only when neither hand is ever actually in the blade's own path, and the tray is what guarantees that every time.",
      missNote: "The handoff happened hand to hand, blade-first, before anyone redirected it. Whatever training says about the tray, a habit only holds up if it gets used the one time somebody skips it in a hurry.",
      wrongNote: "It's the pass tray — redirect the handoff to it before that blade crosses hand to hand.",
    },
    {
      id: "line-speeds-up",
      kind: "Line running ahead of the cut",
      after: "cut-motion", delay: 3, seconds: 12,
      alert: "The line has visibly sped up past the posted band, and product is starting to stack up in front of your station.",
      cue: "That's a reason to request the band back, not a reason to rush the next several cuts.",
      target: "speed-request-dial",
      why: "A line running ahead of the band is exactly what the request dial exists for — calling it in is the controlled response; racing the backed-up product with a faster, less controlled stroke is the same overreach this whole station is built to train out of you.",
      missNote: "The rushed cuts kept pace with the line, not with the stroke you were trained to hold. Speed gained here is exactly the kind that shows up later as a slip nobody saw building.",
      wrongNote: "It's the speed request dial — call for the posted band back before the rushed cuts start.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, GR6_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => concreteFace(cx, w, h, {}), { repeat: 5, px: 512 });
    const floor = box(g, 6.6, 0.1, 5.8, 0, 0.05, 0, 0x6d7379, { rough: 0.85, metal: 0.05 });
    floor.material = texturedMat(floorTex, { rough: 0.85, metal: 0.05, color: 0x6d7379 });

    const steelTex = surfaceTexture((cx, w, h) => stainlessFace(cx, w, h, {}), { repeat: 3, px: 512 });
    const backWall = box(g, 6.6, 2.8, 0.1, 0, 1.4, -2.4, 0xc9d0d6, { rough: 0.3, metal: 0.65 });
    backWall.material = texturedMat(steelTex, { rough: 0.3, metal: 0.65, color: 0xc9d0d6 });

    const stripeTex = surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 3, px: 256 });
    const stripe = slab(g, 4.4, 0.005, 0.3, 0, 0.006, -1.5, 0xf2c14b, { rough: 0.7, cast: false });
    stripe.material = texturedMat(stripeTex, { rough: 0.75, color: 0xf2c14b });

    const grateTex = surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 });
    const grate = slab(g, 0.6, 0.01, 4.6, 2.6, 0.011, 0, 0x2b2f34, { rough: 0.6, metal: 0.4, cast: false });
    grate.material = texturedMat(grateTex, { rough: 0.6, metal: 0.5, color: 0x2b2f34 });

    // ------------------------------------------------------------- the line
    const line = group(g, 0, 0, -1.3);
    const beltBed = box(line, 3.6, 0.7, 0.7, 0, 0.35, 0, 0xc9d0d6, { rough: 0.3, metal: 0.7 });
    beltBed.material = texturedMat(steelTex, { rough: 0.3, metal: 0.7, color: 0xc9d0d6 });
    const belt = box(line, 3.4, 0.04, 0.6, 0, 0.72, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    void belt;
    for (let i = -3; i <= 3; i++) box(line, 0.05, 0.06, 0.62, i * 0.5, 0.75, 0, 0x1a1e23, { rough: 0.6, cast: false });
    holoTag(line, "Production line", 0, 1.1, 0, { css: "#c9622a", w: 0.36 });

    // Line-speed dial and speed-request dial mounted on the line frame.
    const speedDial = instrument(line, -1.5, 0.95, 0.4, { idle: "--", color: GR6_ACCENT, w: 0.15, d: 0.12 });
    holoTag(speedDial, "line speed", 0, 0.16, 0, { css: "#c9622a", w: 0.28 });
    reg(hits, speedDial, "line-speed-dial");
    const speedBeacon = ball(line, 0.035, -1.5, 1.15, 0.4, 0xf0645b, { rough: 0.4, emissive: 0xf0645b, ei: 1.8, seg: 12 });
    speedBeacon.visible = false;
    const reqDial = group(line, -0.9, 0.95, 0.4);
    cyl(reqDial, 0.05, 0.05, 0.03, 0, 0, 0, 0xf2c14b, { rough: 0.4, metal: 0.5, seg: 16 });
    box(reqDial, 0.012, 0.05, 0.014, 0.02, 0.025, 0.01, 0x22262b, { rough: 0.5 });
    reg(hits, reqDial, "speed-request-dial");
    holoTag(reqDial, "speed request", 0, 0.1, 0, { css: "#c9622a", w: 0.32 });

    // Knife on the line, sanitising dip and pass tray.
    const lineKnife = group(line, 0.4, 0.78, 0);
    box(lineKnife, 0.03, 0.02, 0.16, 0, 0, 0.08, 0x8b929a, { rough: 0.2, metal: 0.85 });
    box(lineKnife, 0.03, 0.02, 0.08, 0, 0, -0.06, 0x3c2a1c, { rough: 0.7 });
    reg(hits, lineKnife, "line-knife");
    const saniDip = group(line, 0.9, 0.5, 0.3);
    cyl(saniDip, 0.1, 0.09, 0.16, 0, 0.08, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.8, seg: 16 });
    holoTag(saniDip, "sani dip", 0, 0.2, 0, { css: "#59c97b", w: 0.28 });
    reg(hits, saniDip, "sani-dip");
    const passTray = box(line, 1.3, 0.03, 0.4, 0, 0.78, 0.32, 0x9aa1a8, { rough: 0.4, metal: 0.6 });
    holoTag(line, "pass tray", 1.3, 0.9, 0.32, { css: "#c9622a", w: 0.26 });
    reg(hits, passTray, "knife-pass-tray");

    // Blade-first hazard: a second knife lying blade-first on the bench.
    const bladeFirst = group(line, -0.4, 0.78, 0.28);
    box(bladeFirst, 0.03, 0.02, 0.16, 0, 0, 0, 0x8b929a, { rough: 0.2, metal: 0.85 });
    box(bladeFirst, 0.03, 0.02, 0.08, 0, 0, -0.14, 0x3c2a1c, { rough: 0.7 });
    holoTag(bladeFirst, "blade toward you?", 0, 0.1, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, bladeFirst, "blade-first-pass");

    // Honing steel mounted at the bench.
    const honingSteel = group(g, -1.0, 0, -0.6);
    cyl(honingSteel, 0.012, 0.012, 0.4, 0, 0.9, 0, 0xdfe4e8, { rough: 0.2, metal: 0.85, seg: 10 });
    box(honingSteel, 0.03, 0.06, 0.03, 0, 0.68, 0, 0x3c2a1c, { rough: 0.7 });
    holoTag(honingSteel, "honing steel", 0, 1.15, 0, { css: "#c9622a", w: 0.3 });
    reg(hits, honingSteel, "honing-steel");

    // Knife crib.
    const knifeCrib = group(g, -2.4, 0, -0.8);
    box(knifeCrib, 0.5, 0.7, 0.3, 0, 0.5, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6 });
    for (let i = 0; i < 4; i++) box(knifeCrib, 0.03, 0.02, 0.14, -0.16 + i * 0.1, 0.75, 0.1, 0x8b929a, { rough: 0.3, metal: 0.7 });
    holoTag(knifeCrib, "knife crib", 0, 0.95, 0, { css: "#c9622a", w: 0.3 });
    reg(hits, knifeCrib, "knife-crib");

    // Nicked blade and unsheathed spare on a rail near the crib.
    const rail = group(g, -2.4, 0, -1.4);
    box(rail, 0.6, 0.02, 0.03, 0, 0.9, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    const nickedBlade = box(rail, 0.03, 0.015, 0.14, -0.2, 0.87, 0.08, 0x8b929a, { rough: 0.35, metal: 0.7 });
    box(nickedBlade, 0.008, 0.008, 0.02, 0, 0.01, 0.04, 0x2b2f34, { rough: 0.6 });
    reg(hits, nickedBlade, "nicked-blade");
    const dullForceZone = box(rail, 0.06, 0.03, 0.18, -0.2, 0.87, 0.08, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, dullForceZone, "dull-blade-forced");
    const unsheathedSpare = box(rail, 0.03, 0.015, 0.14, 0.2, 0.87, 0.08, 0x8b929a, { rough: 0.35, metal: 0.7 });
    reg(hits, unsheathedSpare, "unsheathed-spare");
    const cleanRail = box(rail, 0.03, 0.015, 0.14, 0, 0.87, 0.08, 0x8b929a, { rough: 0.35, metal: 0.7 });
    reg(hits, cleanRail, "clean-rail");

    // Line board, rotation board, line log.
    const lineBoard = holoPanel(g, 0.5, 0.36, -2.3, 1.5, 0.5, (ctx, w, h) => {
      ctx.fillStyle = "#241408"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#c9622a"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffdcc2"; ctx.fillText("LINE ASSIGNMENT", w * 0.08, h * 0.18);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; ctx.fillStyle = "#fff0e4";
      ["Station 4: trim cut", "Rotation: every 2 hrs", "Posted band: standard"].forEach((l, i) => ctx.fillText(l, w * 0.08, h * (0.36 + i * 0.15)));
    }, { accent: GR6_ACCENT });
    reg(hits, lineBoard, "line-board");

    const rotationBoard = group(g, 2.4, 0, -0.9);
    slab(rotationBoard, 0.3, 0.02, 0.4, 0, 1.0, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(rotationBoard, 0.26, 0.34, 0, 1.011, 0.2, signFace("ROTATION", { bg: "#241408", accent: "#c9622a", scale: 0.4 })).rotation.x = -Math.PI / 2;
    holoTag(rotationBoard, "rotation board", 0, 1.2, 0, { css: "#c9622a", w: 0.34 });
    reg(hits, rotationBoard, "rotation-board");

    const lineLog = group(g, 2.6, 0, -1.6);
    slab(lineLog, 0.24, 0.02, 0.32, 0, 0.92, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(lineLog, 0.2, 0.26, 0, 0.93, 0.161, signFace("LINE LOG", { bg: "#f4ecda", fg: "#241a08", accent: "#b8402f", scale: 0.46 })).rotation.x = -Math.PI / 2;
    holoTag(lineLog, "line log", 0, 1.1, 0, { css: "#c9622a", w: 0.28 });
    reg(hits, lineLog, "line-log");

    // PPE hooks.
    const ppeHooks = group(g, -2.5, 0, 0.6);
    box(ppeHooks, 0.02, 0.9, 0.02, 0, 0.9, 0, 0x8b929a, { rough: 0.5, metal: 0.5, cast: false });
    const meshGlove = ball(ppeHooks, 0.06, -0.15, 0.76, 0, 0xb9c0c6, { rough: 0.4, metal: 0.6, seg: 12 });
    holoTag(ppeHooks, "mesh glove", -0.15, 0.86, 0, { css: "#c9622a", w: 0.3 });
    reg(hits, meshGlove, "mesh-glove");
    const cutSleeve = cyl(ppeHooks, 0.05, 0.06, 0.3, 0, 0.55, 0, 0xb9c0c6, { rough: 0.4, metal: 0.5, seg: 12 });
    holoTag(ppeHooks, "cut sleeve", 0, 0.72, 0, { css: "#c9622a", w: 0.28 });
    reg(hits, cutSleeve, "cut-sleeve");
    const bellyApron = box(ppeHooks, 0.24, 0.32, 0.03, 0.15, 0.45, 0, 0xd8dee2, { rough: 0.5, metal: 0.5 });
    holoTag(ppeHooks, "belly apron", 0.15, 0.63, 0, { css: "#c9622a", w: 0.3 });
    reg(hits, bellyApron, "belly-apron");

    // Missing mesh glove hazard down the line.
    const emptyHook = group(g, 1.7, 0, -2.0);
    box(emptyHook, 0.015, 0.5, 0.015, 0, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.5, cast: false });
    holoTag(emptyHook, "no glove here", 0, 1.0, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, emptyHook, "missing-mesh-glove");

    // Hand sink.
    const handSink = group(g, -1.8, 0, 1.2, Math.PI / 2);
    box(handSink, 0.4, 0.3, 0.34, 0, 0.75, 0, 0x9aa1a8, { rough: 0.3, metal: 0.75 });
    box(handSink, 0.34, 0.02, 0.28, 0, 0.9, 0, 0x8b929a, { rough: 0.25, metal: 0.8 });
    cyl(handSink, 0.012, 0.012, 0.22, 0, 1.02, -0.1, CITY.steel, { rough: 0.2, metal: 0.9, seg: 10 });
    decal(handSink, 0.34, 0.1, 0, 1.2, 0.02, signFace("HANDWASH ONLY", { bg: "#1d3b63", accent: "#6cc6f0", scale: 0.45 }));
    reg(hits, handSink, "hand-sink");

    // Overspeed override lever near the line — the hazard hotspot.
    const overrideLever = group(line, 1.5, 0.95, 0.4);
    box(overrideLever, 0.02, 0.1, 0.02, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    holoTag(overrideLever, "override to max?", 0, 0.16, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, overrideLever, "line-speed-override");

    const cutter = standingFigure(g, 0.6, 1.0, { ry: Math.PI, outfit: "kitchen" });
    void cutter;
    const coworker = group(g, -1.6, 0, 0.3);
    standingFigure(coworker, 0, 0, { ry: 1.0, outfit: "kitchen" });
    coworker.visible = false;

    const arcSpark = particles(g, 14, 0xbfe9ff, { size: 0.012, life: 0.25 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.1, -1.0),
      onStepComplete(step) {
        if (step.id === "sanitize-knife") { lineKnife.parent.remove(lineKnife); saniDip.add(lineKnife); lineKnife.position.set(0, 0.1, 0); }
        if (step.id === "walk-line-station") { nickedBlade.material = mat(0xc9622a, { rough: 0.5, metal: 0.6 }); unsheathedSpare.material = mat(0x59c97b, { rough: 0.5, metal: 0.6 }); }
      },
      onInterrupt(it) {
        if (it.id === "coworker-blade-first-handoff") coworker.visible = true;
        if (it.id === "line-speeds-up") { speedBeacon.visible = true; speedDial.userData.screen && repaint(speedDial.userData.screen, signFace("FAST", { bg: "#2a1414", accent: "#f0645b", scale: 0.5 })); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "coworker-blade-first-handoff") coworker.visible = false;
        if (it.id === "line-speeds-up") { speedBeacon.visible = false; repaint(speedDial.userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", scale: 0.5 })); }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "line-speed-check") {
          const ok = gg.t >= 0.3 && gg.t <= 0.6;
          repaint(speedDial.userData.screen, signFace(ok ? "IN BAND" : gg.t < 0.3 ? "SLOW" : "FAST", { bg: "#1c1408", accent: ok ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.4 }));
        }
        if (session?.turn && step?.id === "request-speed-adjust") reqDial.rotation.y = session.turn.amount * Math.PI;
        if (session?.step?.id === "steel-hone" && !session.finished) {
          arcSpark.visible = Math.floor(t * 4) % 2 === 0;
          if (arcSpark.visible) arcSpark.userData.step(dt, new THREE.Vector3(-1.0, 1.05, -0.6), 0.03, 0.4, -0.8);
        } else arcSpark.visible = false;
      },
    };
  },
};
