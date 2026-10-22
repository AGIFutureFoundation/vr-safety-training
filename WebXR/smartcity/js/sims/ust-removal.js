import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, valveWheel, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ UST Removal VR — Environmental Monitoring, station ninety-three.
//
// Pulling an underground storage tank out of a former federal facility parcel
// under a closure permit: a generic site, not a named one, worked the way
// EPA's UST rule (40 CFR 280) and API 1604 both describe the job — product
// out, tank proven inert, then and only then does anybody open the ground
// around it wide enough to rig it. Every step in the middle is a one-way
// door of its own kind: a tank that has not read clear on the LEL at both
// the fill and the vent does not get a torch anywhere near its piping, a
// tank still on the hook is not a tank anybody stands under, and the hole
// it came out of is not a hole the crew walks away from unfenced. The soil
// underneath and beside it, sampled under chain of custody with a PID
// reading logged at every point, is what tells the closure report whether
// the tank took its problem with it when it left.

const USTR_ACCENT = 0xa8442a;

export const SIM_UST_REMOVAL = {
  id: "ust-removal",
  index: "93",
  domain: "Environmental",
  trade: "Excavation & UST closure crew — LIUNA hazmat laborer directing, IUOE Local 3 operating engineer, UA Local 38 pipefitter",
  category: "Environmental Monitoring",
  weather: "overcast",
  certification: "EPA UST closure rule (40 CFR 280) and API 1604 closure of underground petroleum storage tanks; the state water board's UST closure requirements for the soil sampling; OSHA HAZWOPER (29 CFR 1910.120); OSHA 29 CFR 1926 Subpart P excavations for the pit and its shoring",
  name: "UST Removal",
  title: simTitle("UST Removal"),
  tagline: "Closing out an underground fuel tank: product pumped and the tank proven inert on the LEL, the pit shored, the tank rigged and lifted by the laborer directing rather than the operator's own eye, and the pit sampled and fenced before anyone leaves",
  accent: USTR_ACCENT,
  accentCss: "#a8442a",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "tank-out-clean", name: "Tank Out Clean", note: "Product pumped, the tank proven inert at both risers, rigged and lifted with nobody under the load, and the pit sampled under chain of custody and fenced before the crew left" },

  game: system({
    name: "Closure Authority",
    currency: "LEL",
    ranks: ["Ground Hand", "Excavation Crew", "Rigging Lead", "Closure Foreman", "Closure Authority Certified"],
    badges: [
      { id: "proven-inert", name: "Proven Inert", note: "Both LEL readings, fill and vent, read clean before the pit was ever opened wide", test: AWARD.all(AWARD.stepClean("lel-fill"), AWARD.stepClean("lel-vent")) },
      { id: "never-under-the-hook", name: "Never Under The Hook", note: "Nobody stood under the tank, in the pit unshored, or near a torch before the tank read clear", test: AWARD.safe },
      { id: "signal-true", name: "Signal True", note: "Held the lift's swing inside the safe corridor the whole way to the laydown", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-closure", name: "Clean Closure", note: "No corrections anywhere in the removal", test: AWARD.clean },
      { id: "unbroken-signal", name: "Unbroken Signal", note: "Never broke the lift's swing-path signal", test: AWARD.unbroken },
      { id: "pit-closed-early", name: "Pit Closed Early", note: "Fenced and finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "enter-unshored": "You climbed down into the excavation before the shoring was confirmed set to the plan. OSHA 1926 Subpart P exists because a wall that looks stable at this depth is not the same thing as a wall that has been shored and inspected — it does not announce which second it lets go, and by then a person is already under it.",
    "cut-before-clear": "You reached for the cutting torch on the tank's piping before both the fill and the vent had actually read clear on the LEL meter. A tank that has not been proven inert can still be venting flammable vapor into the exact space a torch is about to put an ignition source into — the reading is what turns 'probably empty' into a tank a crew can cut into.",
    "stand-under-load": "You stood underneath the tank while it was still swinging on the excavator's hook. A rigged tank on a single hook point has no second way to stay up if a sling shifts or a shackle lets go, and the laborer directing the lift is supposed to be reading the load from clear of it, not from underneath it.",
    "sample-no-coc": "You bagged the pit's soil straight into an unlabeled cooler without a PID reading logged or a chain of custody started. A closure report is only as good as its samples, and a sample with no label, no PID reading and no signed custody form is not evidence the state water board's UST closure requirements can accept — it is dirt in a bag that nobody can trace back to the floor or the sidewall it came from.",
  },

  lateNotes: {
    "pipe-cut": "Nothing to cut yet — the tank has to read clear on the LEL at both the fill and the vent before a torch goes anywhere near its piping.",
    "rigging-chain": "Not yet — the piping has to be cut and capped clear of the tank before a sling goes anywhere near it.",
    "pid-floor": "No sample yet — the tank has to actually be out of the pit and set on the laydown before the floor underneath it is anything to read or sample.",
    "fence-roll": "The fence goes up once the sampling and the chain of custody are both done, not before — a pit that still has work happening in it still needs people walking into it.",
  },

  // Both interruptions are armed on a hold or a track step, long enough for
  // the fuse to actually catch the learner mid-task, and each is answered on
  // a control other than the host step's own — the rule the whole roster
  // follows so an interruption can never be solved by accident.
  interrupts: [
    {
      id: "lel-pocket",
      kind: "LEL spike at the fill",
      after: "direct-lift", delay: 4, seconds: 14,
      alert: "The LEL meter still clipped to the fill riser just jumped past its limit — a pocket of product nobody swept out is venting into the open pit while the tank swings clear of it.",
      cue: "Signal the operator to set the tank down and stop the lift right now.",
      target: "excavator-stop",
      why: "A suspended tank still shedding flammable vapor over an open excavation, with a running engine and a hot exhaust a few feet away, is exactly the ignition scenario the LEL meter exists to catch — finishing the lift first buys nothing back if that vapor finds a source before the tank is even on the ground.",
      missNote: "The lift carried on for another swing while the meter sat above its limit, and the vapor that pocket put into the air around a running excavator is not something setting the tank down afterward gets back.",
      wrongNote: "Not that — the excavator has to stop the lift first. Everything else waits on the load actually being still.",
    },
    {
      id: "sidewall-slough",
      kind: "Sidewall sloughing",
      after: "sample-floor", delay: 4, seconds: 12,
      alert: "A wedge of the pit's north sidewall just let go and slid to the floor — the wall that was holding a minute ago is not holding now.",
      cue: "Get everyone out of the pit down the ladder, now — the sample can wait.",
      target: "pit-ladder",
      why: "A sidewall that has already sloughed once is a wall telling you it is done holding the shape it was cut to, and the only defensible response to that under 1926 Subpart P is getting people out through the means of egress that is already there, not finishing the task they were in the middle of.",
      missNote: "The sampling carried on at the bottom of a pit whose sidewall had already let go once, with nobody using the ladder that was standing right there to get everyone out.",
      wrongNote: "Not that — get everyone out down the ladder. Nothing else in this pit matters more than that right now.",
    },
  ],

  steps: [
    {
      id: "read-permit", kind: "select", target: "permit-board",
      title: "Confirm the closure permit and the utility locate",
      cue: "Check the closure permit against the locate marks before anything on this parcel is touched.",
      why: "The closure permit is what says this tank is authorized to come out and under what conditions, and the locate is what says what else is buried around it — a crew that skips either one is digging on faith next to lines nobody has confirmed are clear.",
    },
    {
      id: "pump-product", kind: "hold", target: "task-pump", seconds: 5,
      title: "Pump the remaining product out of the tank",
      cue: "Hold the transfer pump running on the fill riser until the tank reads empty.",
      why: "Every gallon of product left in the tank is a gallon of vapor the next few steps have to prove safe — pumping it down first is what makes the LEL readings at the fill and the vent mean something instead of chasing a level that is still dropping under them.",
      holdBreakNote: "Released the pump before the tank actually read empty — stopping partway just leaves product behind for the LEL readings to still be fighting.",
    },
    {
      id: "lel-fill", kind: "gauge", target: "lel-fill-meter",
      title: "Read the LEL at the fill riser",
      cue: "Bring the meter up to the fill riser and commit only while the reading sits below the limit.",
      why: "The fill riser is the deepest, least-ventilated point on this tank, which makes it the reading most likely to still show a pocket the pump missed — this is the number that says the tank is actually inert here, not just empty by the gauge.",
      gauge: {
        label: "LEL — FILL", speed: 0.62, green: [0.1, 0.35],
        readout: (t) => `${Math.round(t * 100)}% LEL`,
        missNote: "That is not below the limit. Vent it further and read the fill riser again before anything else touches this tank.",
      },
    },
    {
      id: "lel-vent", kind: "gauge", target: "lel-vent-meter",
      title: "Read the LEL at the vent riser",
      cue: "Bring the meter up to the vent riser and commit only while the reading sits below the limit.",
      why: "The fill and the vent are two different points on the same tank and neither one stands in for the other — a tank that reads clear at the fill and has not been checked at the vent has only had half the question actually asked.",
      gauge: {
        label: "LEL — VENT", speed: 0.6, green: [0.1, 0.35],
        readout: (t) => `${Math.round(t * 100)}% LEL`,
        missNote: "Still above the limit at the vent. This tank is not inert until both risers say so, not just the one that happened to read clean first.",
      },
    },
    {
      id: "shore-excavation", kind: "select", target: "trench-shield",
      title: "Open and shore the excavation to the plan",
      cue: "Confirm the shield is set and the pit is opened to the width the plan calls for before anyone works inside it.",
      why: "The pit has to be wide enough to swing the tank clear and shored before it is, because a hole widened with a shield already sitting in it — or with a person standing in it — is how the wall comes in on somebody rather than staying where the plan put it.",
    },
    {
      id: "cut-cap-piping", kind: "sequence",
      targets: ["pipe-cut", "pipe-cap"],
      itemNames: { "pipe-cut": "cut the fill and vent piping", "pipe-cap": "cap both tank nozzles" },
      title: "Cut and cap the tank's piping",
      cue: "Cut the fill and vent piping clear of the tank, then cap both nozzles.",
      why: "Cut before cap, in that order — capping a nozzle that is still tied into piping running back to the risers leaves the tank connected to a line that has to be dealt with anyway, while capping right after the cut seals the tank the moment it is actually free of the ground around it.",
      outOfOrderNote: "Cut the piping first, then cap the nozzles — a cap over a live connection to the risers is not sealing anything.",
    },
    {
      id: "rig-tank", kind: "drag", target: "rigging-chain",
      title: "Rig the tank for the lift",
      cue: "Carry the rigging chain to the tank and set it on the lift lugs.",
      why: "The chain has to seat square on both lift lugs before the excavator ever takes a strain — a sling that is not seated square is a tank that comes up cocked, and a cocked load is a load nobody can read a safe swing path for.",
      drag: { to: "tank-lift-socket", radius: 0.42, missNote: "Not seated on the lugs — a chain looped anywhere else on the shell is not rigged, it is resting on the tank." },
    },
    {
      id: "direct-lift", kind: "track", target: "hand-signals", seconds: 9,
      title: "Direct the lift out of the pit",
      cue: "Signal the operator continuously, keeping the tank's swing inside the safe corridor clear of the pit edge and the crew.",
      why: "The operator's cab cannot see straight down into the pit past a rigged tank, which is the entire reason a laborer directs this lift instead of the operator judging it alone — continuous signals are what keeps a swinging tank on the corridor the ground crew actually cleared, not where the operator assumes it is.",
      track: {
        start: 0.1, green: [0.4, 0.62], rise: 0.5, fall: 0.45, drift: 0.12, label: "SWING PATH",
        readout: (v) => (v < 0.4 ? "drifting back over the pit" : v > 0.62 ? "drifting wide of the laydown" : "on the safe corridor"),
      },
      holdBreakNote: "The swing drifted out of the safe corridor — bring the signal back on line before the tank swings again.",
    },
    {
      id: "set-laydown", kind: "select", target: "laydown-cribbing",
      title: "Set the tank on the laydown",
      cue: "Confirm the tank is down square on the cribbing before the chain comes off.",
      why: "A tank set crooked on cribbing can roll the moment the rigging goes slack — square on the blocking, checked before anything unhooks it, is what makes the ground under it something the next step can actually work around.",
    },
    {
      id: "label-holes", kind: "sequence",
      targets: ["label-fill-hole", "label-vent-hole"],
      itemNames: { "label-fill-hole": "label the fill opening", "label-vent-hole": "label the vent opening" },
      title: "Label the tank's holes",
      cue: "Mark the fill opening, then the vent opening, so nobody downstream has to guess which is which.",
      why: "Once this tank leaves the pit it is scrap to everybody who did not just pull it, and an unlabeled hole on a tank that used to hold fuel is a hazard to whoever handles it next — labeling both openings now is the only point anyone will ever be as sure of which is which as the crew standing here.",
      outOfOrderNote: "Fill, then vent — the two openings read differently and the order is what keeps the label crew from mixing them up.",
    },
    {
      id: "sample-floor", kind: "hold", target: "pid-floor", seconds: 5,
      title: "Sample the pit floor",
      cue: "Hold the PID over the floor sample point and read it while the sample is bagged.",
      why: "The floor underneath where the tank sat is the first place a slow leak would have gone, and the PID reading logged right here is what the closure report leans on to say whether the tank took its problem with it or left it behind in the ground.",
      holdBreakNote: "Pulled the PID away before the reading settled — a number taken mid-drift is not the reading the closure report can use.",
    },
    {
      id: "sample-sidewalls", kind: "find", noHint: true,
      targets: ["sidewall-north", "sidewall-south"],
      itemNames: { "sidewall-north": "the north sidewall sample point", "sidewall-south": "the south sidewall sample point" },
      itemNotes: {
        "sidewall-north": "PID reading logged, sample bagged. The north sidewall is downslope of the fill riser — if product ever migrated sideways instead of down, this is one of the two places it would show first.",
        "sidewall-south": "PID reading logged, sample bagged. The south sidewall is the far side of the pit from the risers, which is what makes a hit here worth more than one on the near wall — it says the plume, if there is one, is wider than the tank footprint.",
      },
      title: "Sample both pit sidewalls",
      cue: "Walk the pit and click both sidewalls where the sample points are marked, PID reading logged at each.",
      why: "The floor tells you what was under the tank; the sidewalls tell you whether whatever was there stayed put or moved sideways — closure sampling that only checks the floor has only asked half the question a leaking tank could have made true.",
    },
    {
      id: "coc-log", kind: "sequence",
      targets: ["label-sample", "seal-sample", "sign-coc"],
      itemNames: { "label-sample": "label with site, date and time", "seal-sample": "custody seal", "sign-coc": "chain of custody signed" },
      title: "Label, seal and sign the samples' custody",
      cue: "Label the bottles, seal them, then sign the chain of custody.",
      why: "Three samples with three PID readings are worth nothing to the closure report if the custody trail on them has a gap — label, then seal, then sign is the order that turns a cooler of soil into evidence the state water board's UST closure requirements can actually accept.",
      outOfOrderNote: "Label, then seal, then sign — the custody form describes bottles that are already labeled and sealed.",
    },
    {
      id: "fence-pit", kind: "drag", target: "fence-roll",
      title: "Fence the pit before the crew leaves",
      cue: "Carry the fence panel to the pit perimeter and set it before anyone walks away.",
      why: "An open excavation left unfenced overnight is a hole waiting for whoever walks this parcel next, sampled or not — the fence is the last thing standing between a closed-out tank pit and somebody finding it the hard way in the dark.",
      drag: { to: "fence-socket", radius: 0.45, missNote: "Not set on the perimeter — a fence panel propped against one side leaves the rest of the pit open." },
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, USTR_ACCENT);

    // ------------------------------------------------------------- ground
    const groundMesh = box(g, 6.2, 0.14, 5.4, 0, 0.07, 0, 0xffffff, { rough: 0.96 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#463c2c", base2: "#3a3122", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.96, metal: 0.02, color: 0xc7b48c },
    );

    // -------------------------------------------------------- permit board
    const permitGroup = group(g, -2.5, 0.14, 1.7, 0.4);
    const permitPanel = holoPanel(permitGroup, 0.66, 0.44, 0, 1.05, 0, (ctx, w, h) => {
      ctx.fillStyle = "#241209"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#e0693f"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffe8dc"; ctx.fillText("UST CLOSURE PERMIT", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#ffd3bf";
      ["40 CFR 280 closure-in-place waived", "Locate confirmed — clear both risers", "API 1604 closure standard applies"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { accent: USTR_ACCENT });
    const permitHit = box(permitGroup, 0.66, 0.44, 0.04, 0, 1.05, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, permitHit, "permit-board");
    void permitPanel;

    // ------------------------------------------------------------- locate marks
    const marks = group(g, -1.8, 0.14, 1.5);
    for (let i = 0; i < 4; i++) {
      const f = group(marks, -0.3 + i * 0.2, 0, 0, 0.2);
      cyl(f, 0.006, 0.006, 0.28, 0, 0.14, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 6 });
      box(f, 0.05, 0.04, 0.003, 0.025, 0.26, 0, 0xe0693f, { rough: 0.7, cast: false });
    }
    holoTag(marks, "utility locate marks", 0, 0.4, 0.15, { css: "#e0693f", w: 0.5 });

    // ---------------------------------------------------------- pit apron + pit
    // Cut into a raised apron rather than the ground plane, so the pit reads
    // as a hole rather than a dark smudge — the same treatment soil-loadout
    // and hot-tap use.
    const APRON = 0.32;
    const apron = group(g, -0.6, 0, -0.4);
    for (const sz of [-1, 1]) {
      box(apron, 2.9, APRON, 0.5, 0, APRON / 2, sz * 1.15, 0x5c4c34, { rough: 0.97, finish: "concrete", tile: [3, 1] });
    }
    for (const sx of [-1, 1]) {
      box(apron, 0.5, APRON, 2.05, sx * 1.7, APRON / 2, 0, 0x5c4c34, { rough: 0.97, finish: "concrete", tile: [1, 2] });
    }
    const pitD = 0.6;
    const pit = group(g, -0.6, APRON, -0.4);
    box(pit, 2.6, 0.02, 1.9, 0, -pitD, 0, 0x2f2618, { rough: 0.98, cast: false });
    for (const sx of [-1, 1]) box(pit, 0.06, pitD, 1.9, sx * 1.3, -pitD / 2, 0, 0x453522, { rough: 0.96, cast: false });
    for (const sz of [-1, 1]) box(pit, 2.6, pitD, 0.06, 0, -pitD / 2, sz * 0.95, 0x453522, { rough: 0.96, cast: false });
    holoTag(pit, "tank pit", 0, 0.4, 0.98, { css: "#e0693f", w: 0.3 });

    // Steel lid covering the pit until it is shored open.
    const lid = box(pit, 2.5, 0.05, 1.8, 0, 0.03, 0, 0x5a636b, { rough: 0.55, metal: 0.5 });
    // Always-clickable hazard: stepping into the pit before the shield is set.
    const unshoredZone = box(pit, 2.2, 0.1, 1.6, 0, -0.06, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, unshoredZone, "enter-unshored");

    // Trench shield panels, standing off to the side until the pit opens,
    // then confirmed set on the shore-excavation step.
    const shield = group(pit, 0, -pitD + 0.02, 0);
    for (const sx of [-1, 1]) box(shield, 0.05, pitD - 0.08, 1.7, sx * 1.22, (pitD - 0.08) / 2, 0, 0xd8b23a, { rough: 0.55, metal: 0.5 });
    for (let i = 0; i < 2; i++) cyl(shield, 0.03, 0.03, 2.5, 0, 0.32 + i * 0.4, 0.55 - i * 1.1, 0xd8b23a, { rough: 0.55, metal: 0.5, seg: 10 }).rotation.z = Math.PI / 2;
    shield.visible = false;
    reg(hits, shield, "trench-shield");

    // Fill and vent risers, protruding through the lid — worked before the
    // pit itself is ever opened.
    const fillRiser = group(pit, -0.55, 0.03, 0.3);
    cyl(fillRiser, 0.045, 0.045, 0.42, 0, 0.21, 0, 0x7a8088, { rough: 0.5, metal: 0.5, seg: 14 });
    const fillCap = cyl(fillRiser, 0.06, 0.06, 0.05, 0, 0.44, 0, 0x2b2f34, { rough: 0.5, metal: 0.5, seg: 14 });
    holoTag(fillRiser, "fill riser", 0, 0.62, 0, { css: "#e0693f", w: 0.3 });
    const pumpHoseHead = cyl(fillRiser, 0.02, 0.02, 0.08, 0, 0.46, 0, 0x2b2f34, { rough: 0.6, metal: 0.4, seg: 10 });
    hits["fill-riser-head"] = pumpHoseHead;
    void fillCap;
    const ventRiser = group(pit, 0.55, 0.03, -0.35);
    cyl(ventRiser, 0.035, 0.035, 0.5, 0, 0.25, 0, 0x7a8088, { rough: 0.5, metal: 0.5, seg: 12 });
    cyl(ventRiser, 0.05, 0.05, 0.06, 0, 0.53, 0, 0x2b2f34, { rough: 0.5, metal: 0.5, seg: 12 });
    holoTag(ventRiser, "vent riser", 0, 0.72, 0, { css: "#e0693f", w: 0.3 });

    // LEL meters, mounted just above each riser.
    const fillMeter = instrument(fillRiser, 0.16, 0.42, 0, { ry: 0.5, idle: "-- % LEL", color: 0xe0693f, w: 0.13, d: 0.18 });
    holoTag(fillRiser, "LEL meter — fill", 0.16, 0.6, 0, { css: "#e0693f", w: 0.42 });
    reg(hits, fillMeter, "lel-fill-meter");
    // Vapor plume and warning strobe for the LEL-pocket interruption — dark
    // and still until the interrupt fires, so the scene actually changes
    // rather than just the meter's own canvas repainting.
    const fillStrobe = ball(fillRiser, 0.03, 0, 0.5, 0, 0x2b2f34, { emissive: 0x2b2f34, ei: 0.2, rough: 0.5 });
    const fillVapor = particles(fillRiser, 24, 0xd8c98a, { size: 0.02, life: 0.7, additive: false, opacity: 0.4 });
    fillVapor.visible = false;
    const ventMeter = instrument(ventRiser, 0.16, 0.5, 0, { ry: 0.5, idle: "-- % LEL", color: 0xe0693f, w: 0.13, d: 0.18 });
    holoTag(ventRiser, "LEL meter — vent", 0.16, 0.68, 0, { css: "#e0693f", w: 0.42 });
    reg(hits, ventMeter, "lel-vent-meter");

    // ------------------------------------------------------------ task pump
    const pump = group(g, -2.2, 0.14, -0.9, 0.5);
    box(pump, 0.34, 0.3, 0.3, 0, 0.15, 0, 0xe4622a, { rough: 0.6, metal: 0.3 });
    const pumpLamp = ball(pump, 0.024, 0.14, 0.32, 0.12, 0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.4 });
    holoTag(pump, "task pump", 0, 0.5, 0, { css: "#e0693f", w: 0.3 });
    reg(hits, pump, "task-pump");
    const pumpHose = hose(g, [[-2.2, 0.24, -0.9], [-1.7, 0.3, -0.6], [-1.15, 0.35, -0.1]], 0.02, 0x2b2f34, { steps: 14, rough: 0.6, metal: 0.3 });
    void pumpHose;

    // ------------------------------------------------------------------ tank
    // Hidden until the pit is shored open, then revealed for the piping and
    // rigging steps.
    const tank = group(pit, 0, -pitD + 0.42, 0, Math.PI / 2);
    lathe(tank, [[0.001, -0.9], [0.34, -0.86], [0.36, -0.7], [0.36, 0.7], [0.34, 0.86], [0.001, 0.9]],
      0, 0, 0, USTR_ACCENT, { rough: 0.75, metal: 0.25, seg: 22 }).rotation.z = Math.PI / 2;
    const fillNozzle = cyl(tank, 0.045, 0.045, 0.1, 0, 0.36, 0.55, USTR_ACCENT, { rough: 0.7, metal: 0.3, seg: 12 });
    const ventNozzle = cyl(tank, 0.035, 0.035, 0.09, 0, 0.36, -0.55, USTR_ACCENT, { rough: 0.7, metal: 0.3, seg: 12 });
    const fillStub = cyl(tank, 0.03, 0.03, 0.18, 0, 0.48, 0.55, 0x7a8088, { rough: 0.55, metal: 0.5, seg: 10 });
    const ventStub = cyl(tank, 0.024, 0.024, 0.16, 0, 0.47, -0.55, 0x7a8088, { rough: 0.55, metal: 0.5, seg: 10 });
    reg(hits, fillStub, "pipe-cut");
    reg(hits, fillNozzle, "pipe-cap");
    holoTag(tank, "underground storage tank", 0, 0.85, 0, { css: "#e0693f", w: 0.56 });
    const liftLugA = box(tank, 0.09, 0.05, 0.02, -0.5, 0.34, 0, 0x2b2f34, { rough: 0.55, metal: 0.5 });
    const liftLugB = box(tank, 0.09, 0.05, 0.02, 0.5, 0.34, 0, 0x2b2f34, { rough: 0.55, metal: 0.5 });
    const tankLiftSocket = group(tank, 0, 0.4, 0);
    hits["tank-lift-socket"] = tankLiftSocket;
    void liftLugA; void liftLugB; void ventStub;
    tank.visible = false;

    // Hazard: cutting the piping before both LEL readings clear.
    const cutBefore = box(pit, 0.2, 0.2, 0.2, -0.3, 0.05, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cutBefore, "cut-before-clear");

    // -------------------------------------------------------------- excavator
    const excav = group(g, 1.2, 0.14 + APRON, -1.6, -2.4);
    box(excav, 0.9, 0.4, 0.7, 0, 0.35, 0, 0xe8b02e, { rough: 0.6 });
    cyl(excav, 0.34, 0.34, 0.14, 0, 0.6, 0, 0xe8b02e, { rough: 0.6, seg: 16 });
    const boom = group(excav, 0.1, 0.68, 0, 0.5);
    box(boom, 1.1, 0.15, 0.15, 0.55, 0, 0, 0xe8b02e, { rough: 0.6 });
    const dipper = group(boom, 1.05, 0, 0, -0.9);
    box(dipper, 0.65, 0.12, 0.12, 0.32, 0, 0, 0xe8b02e, { rough: 0.6 });
    const hook = group(dipper, 0.6, -0.1, 0, -0.4);
    cyl(hook, 0.03, 0.03, 0.22, 0, -0.11, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    torus(hook, 0.05, 0.012, 0, -0.22, 0, CITY.steel, { rough: 0.35, metal: 0.85, seg: 8, seg2: 16 }).rotation.x = Math.PI / 2;
    for (const sx of [-0.35, 0.35]) box(excav, 1.0, 0.24, 0.18, 0, 0.12, sx, 0x2b2f34, { rough: 0.8 });
    const stopSign = group(excav, 0.35, 0.85, 0.35);
    box(stopSign, 0.16, 0.16, 0.01, 0, 0, 0, 0xd2312b, { rough: 0.6 });
    decal(stopSign, 0.14, 0.14, 0, 0, 0.006, signFace("STOP", { bg: "#7a0f0f", accent: "#ffffff", scale: 0.55 }));
    holoTag(excav, "excavator", 0, 1.15, 0.35, { css: "#e0693f", w: 0.3 });
    reg(hits, stopSign, "excavator-stop");

    // ---------------------------------------------------------------- rigging
    const chainRoll = group(g, 1.55, 0.14, -0.85, 0.3);
    torus(chainRoll, 0.14, 0.03, 0, 0.15, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 8, seg2: 20 });
    holoTag(chainRoll, "rigging chain", 0, 0.36, 0, { css: "#e0693f", w: 0.36 });
    reg(hits, chainRoll, "rigging-chain");
    const underLoadZone = box(g, 0.9, 0.6, 0.7, -0.6, 0.14 + APRON + 0.5, -0.85, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "under the hook — stay clear", -0.6, 0.14 + APRON + 0.95, -0.85, { css: "#d2312b", w: 0.56 });
    reg(hits, underLoadZone, "stand-under-load");

    // --------------------------------------------------------------- laydown
    const laydown = group(g, 1.9, 0.14, 0.9);
    for (const dx of [-0.5, 0.5]) box(laydown, 0.3, 0.14, 0.9, dx, 0.07, 0, 0x8a5a1a, { rough: 0.85 });
    holoTag(laydown, "laydown cribbing", 0, 0.3, 0.7, { css: "#e0693f", w: 0.42 });
    reg(hits, laydown, "laydown-cribbing");
    const labelFill = decal(laydown, 0.14, 0.08, -0.5, 0.32, 0, signFace("FILL", { bg: "#241209", accent: "#e0693f", scale: 0.5 }));
    reg(hits, labelFill, "label-fill-hole");
    const labelVent = decal(laydown, 0.14, 0.08, 0.5, 0.32, 0, signFace("VENT", { bg: "#241209", accent: "#e0693f", scale: 0.5 }));
    reg(hits, labelVent, "label-vent-hole");

    // -------------------------------------------------------- pit ladder + sampling
    const ladder = group(pit, -1.1, -pitD + 0.02, 0.8);
    for (const sx of [-0.12, 0.12]) cyl(ladder, 0.014, 0.014, pitD - 0.05, sx, (pitD - 0.05) / 2, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    for (let i = 0; i < 4; i++) cyl(ladder, 0.01, 0.01, 0.24, 0, 0.1 + i * (pitD - 0.2) / 4, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(ladder, "pit ladder — evacuate", 0, 0.28, 0.1, { css: "#d2312b", w: 0.52 });
    reg(hits, ladder, "pit-ladder");

    const pidFloor = group(pit, 0.3, -pitD + 0.03, 0.4);
    box(pidFloor, 0.04, 0.02, 0.04, 0, 0.01, 0, 0xe0693f, { rough: 0.6, cast: false });
    const pidInstrument = instrument(pidFloor, 0, 0.2, 0, { idle: "-- ppm", color: 0xe0693f, w: 0.13, d: 0.18 });
    holoTag(pidFloor, "floor sample — PID", 0, 0.38, 0, { css: "#e0693f", w: 0.44 });
    reg(hits, pidInstrument, "pid-floor");

    const sideN = group(pit, 0, -pitD + 0.1, 0.9);
    box(sideN, 0.06, 0.06, 0.02, 0, 0, 0, 0xe0693f, { rough: 0.6, cast: false });
    holoTag(sideN, "north sidewall sample", 0, 0.16, 0.02, { css: "#e0693f", w: 0.44 });
    reg(hits, sideN, "sidewall-north");
    const sideS = group(pit, 0, -pitD + 0.1, -0.9);
    box(sideS, 0.06, 0.06, 0.02, 0, 0, 0, 0xe0693f, { rough: 0.6, cast: false });
    holoTag(sideS, "south sidewall sample", 0, 0.16, -0.02, { css: "#e0693f", w: 0.44 });
    reg(hits, sideS, "sidewall-south");

    // --------------------------------------------------------- COC field bench
    const bench = group(g, 2.35, 0.14, 1.7);
    box(bench, 1.0, 0.75, 0.46, 0, 0.375, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const labelDecal = decal(bench, 0.2, 0.13, -0.3, 0.78, 0, signFace("LABEL", { bg: "#241209", accent: "#e0693f", scale: 0.5 }));
    holoTag(bench, "sample label", -0.3, 0.95, 0, { css: "#e0693f", w: 0.28 });
    reg(hits, labelDecal, "label-sample");
    const sealDecal = decal(bench, 0.16, 0.1, -0.02, 0.78, 0.02, signFace("SEAL", { bg: "#241209", accent: "#f2c14b", scale: 0.5 }));
    holoTag(bench, "custody seal", -0.02, 0.93, 0.02, { css: "#e0693f", w: 0.28 });
    reg(hits, sealDecal, "seal-sample");
    const cocForm = decal(bench, 0.28, 0.15, 0.3, 0.78, 0, signFace("CHAIN OF CUSTODY", { bg: "#241209", accent: "#e0693f", scale: 0.4 }));
    holoTag(bench, "chain of custody", 0.3, 0.96, 0, { css: "#e0693f", w: 0.4 });
    reg(hits, cocForm, "sign-coc");
    const sampleTossHazard = box(bench, 0.14, 0.1, 0.1, 0, 0.4, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bench, "toss it in the cooler?", 0, 0.55, 0.3, { css: "#d2312b", w: 0.48 });
    reg(hits, sampleTossHazard, "sample-no-coc");

    // -------------------------------------------------------------- fence roll
    const fenceRoll = group(g, -2.0, 0.14, -1.7, 0.4);
    cyl(fenceRoll, 0.1, 0.1, 1.1, 0, 0.11, 0, 0xd8b23a, { rough: 0.6, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(fenceRoll, "fence panel", 0, 0.3, 0, { css: "#e0693f", w: 0.32 });
    reg(hits, fenceRoll, "fence-roll");
    const fenceSocket = group(g, -0.6, 0.14 + APRON, -0.4);
    hits["fence-socket"] = fenceSocket;
    const fencePanels = [];
    for (const [x, z, ry] of [[-0.6, 1.5, 0], [-0.6, -2.3, 0], [-2.0, -0.4, Math.PI / 2], [0.8, -0.4, Math.PI / 2]]) {
      const p = barrierPanel(g, x, z, { ry, w: 1.7, color: USTR_ACCENT });
      p.visible = false;
      fencePanels.push(p);
    }

    // ------------------------------------------------------------- ground crew
    const guide = standingFigure(g, -0.9, -2.0, { atStation: true, ry: 1.4, cloth: 0x2b3138, vest: USTR_ACCENT, helmet: 0xf2f2f2 });
    holoTag(guide, "laborer directing", 0, 1.95, 0.15, { css: "#e0693f", w: 0.44 });
    reg(hits, guide, "hand-signals");

    cone(g, -2.7, -2.3, { color: USTR_ACCENT }); cone(g, 2.7, -2.4, { color: USTR_ACCENT });
    toolChest(g, 2.6, -0.5, { ry: -0.6, color: 0x8a5a1a });
    standingFigure(g, 2.5, 0.2, { ry: -2.2, cloth: 0x37505f, vest: 0xe4dc3a, helmet: 0xf2c14b });

    const dust = particles(g, 30, 0xc9b99a, { size: 0.03, life: 1.0, additive: false, opacity: 0.25 });

    // -------------------------------------------------------------- live state
    let lelHigh = false, sloughed = false, tankUp = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.1, 1.0, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "pump-product") repaint(fillMeter.userData.screen, signFace("EMPTY", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.5 }));
        if (step.id === "lel-fill") repaint(fillMeter.userData.screen, signFace("0% LEL", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        if (step.id === "lel-vent") repaint(ventMeter.userData.screen, signFace("0% LEL", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        if (step.id === "shore-excavation") { shield.visible = true; lid.visible = false; tank.visible = true; }
        if (step.id === "cut-cap-piping") { fillStub.visible = false; }
        if (step.id === "rig-tank") { chainRoll.parent.remove(chainRoll); tankLiftSocket.add(chainRoll); chainRoll.position.set(0, 0.02, 0); chainRoll.rotation.set(0, 0, 0); }
        if (step.id === "direct-lift") { tankUp = true; }
        if (step.id === "set-laydown") {
          tankUp = false;
          tank.parent.remove(tank);
          laydown.add(tank);
          tank.position.set(0, 0.2, 0);
          tank.rotation.set(0, Math.PI / 2, Math.PI / 2);
        }
        if (step.id === "sample-floor") repaint(pidInstrument.userData.screen, signFace("0.2 ppm", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        if (step.id === "fence-pit") { fencePanels.forEach((p) => { p.visible = true; }); fenceRoll.visible = false; }
      },
      onInterrupt(it) {
        if (it.id === "lel-pocket") {
          lelHigh = true;
          fillVapor.visible = true;
          fillStrobe.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.4, rough: 0.4 });
          repaint(fillMeter.userData.screen, signFace("38% LEL !", { bg: "#2a0c0c", accent: "#d2312b", fg: "#ffd0d0", scale: 0.5 }));
        }
        if (it.id === "sidewall-slough") {
          sloughed = true;
          sideN.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.6, rough: 0.5 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "lel-pocket") {
          lelHigh = false;
          fillVapor.visible = false;
          fillStrobe.material = mat(0x2b2f34, { emissive: 0x2b2f34, ei: 0.2, rough: 0.5 });
          repaint(fillMeter.userData.screen, signFace("0% LEL", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        }
        if (it.id === "sidewall-slough") {
          sloughed = false;
          sideN.material = mat(0xe0693f, { rough: 0.6 });
        }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        dust.visible = true; dust.userData.step(dt, new THREE.Vector3(-0.6, 0.5, -0.4), 1.0, 0.4, 0.15);
        pumpLamp.material.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.4;
        if (fillVapor.visible) fillVapor.userData.step(dt, new THREE.Vector3(-0.55, 0.5, 0.3), 0.04, 0.4, 0.3);
        if (lelHigh) fillStrobe.material.emissiveIntensity = Math.floor(t * 4) % 2 === 0 ? 2.4 : 0.2;
        if (tankUp) {
          boom.rotation.y = -0.4 + Math.sin(t * 0.35) * 0.2;
          dipper.rotation.y = 0.7 + Math.sin(t * 0.5) * 0.12;
        }
        void sloughed;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "lel-fill") repaint(fillMeter.userData.screen, signFace(`${Math.round(gg.t * 100)}% LEL`, { bg: "#0d1c24", accent: gg.t <= 0.35 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
          if (step?.id === "lel-vent") repaint(ventMeter.userData.screen, signFace(`${Math.round(gg.t * 100)}% LEL`, { bg: "#0d1c24", accent: gg.t <= 0.35 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        }
      },
    };
  },
};
