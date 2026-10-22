import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat, counter,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Prep Cooling VR — Culinary & Hospitality, station three.
// Cooling a batch of stock and a hotel pan of rice inside the Food Code's own
// clock: split into shallow pans, an ice paddle and an ice bath for the
// stock, the blast chiller for the rice, temperatures logged at the two-hour
// and six-hour marks, a pan covered only once it is cold, dated with its own
// discard date, and the reheat-or-discard decision when the two-hour mark
// is missed.

const PCL_ACCENT = 0x7fb8e8;

export const SIM_PREP_COOLING = {
  id: "prep-cooling",
  index: "109",
  domain: "Culinary & Hospitality",
  trade: "Line cook — hot food cooling",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  certification: "California Retail Food Code / FDA Food Code §3-501.14 cooling — 135 °F to 70 °F within 2 hours, and a total of 6 hours to 41 °F or below; §3-501.15 cooling methods (shallow pans, ice paddles, rapid-chill equipment); §3-501.17 date marking; HACCP, which treats cooling as its own critical control point; California Food Handler card and ServSafe Food Protection Manager; NSF/ANSI 7 rapid-chill equipment; OSHA 29 CFR 1910.132 PPE for handling product at both ends of this task's temperature range; UNITE HERE Local 2",
  name: "Prep Cooling",
  title: simTitle("Prep Cooling"),
  tagline: "Cooling stock and a hotel pan of rice inside the Food Code's clock: shallow pans, an ice paddle, the blast chiller, temperatures logged at two and six hours, a pan covered only once cold, dated with its own discard date, and the reheat-or-discard call when the two-hour mark is missed",
  accent: PCL_ACCENT,
  accentCss: "#7fb8e8",
  parSeconds: 270,
  footprint: 2.7,
  badge: { id: "cooled-clean", name: "Cooled Clean", note: "A batch cooled inside both Food Code windows, dated with its own discard date and logged — first time" },

  game: system({
    name: "Cooling Line",
    currency: "CHILL",
    ranks: ["Prep Cook", "Line Cook", "Lead Cook", "Kitchen Supervisor", "Cooling Certified"],
    badges: [
      { id: "shallow-first", name: "Shallow First", note: "Batch split into shallow pans before the ice bath ever started, first time", test: AWARD.stepClean("portion-shallow") },
      { id: "never-guessed", name: "Never Guessed", note: "Never a deep pot cooled whole, never covered hot, never a plain-water bath", test: AWARD.safe },
      { id: "on-the-clock", name: "On the Clock", note: "Both temperature checks and the chiller cycle all inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-cool", name: "Clean Cooldown", note: "No corrections anywhere on the batch", test: AWARD.clean },
      { id: "steady-stir", name: "Steady Stir", note: "Ice paddle held a steady rate the whole hold", test: AWARD.unbroken },
      { id: "cool-fast", name: "Cooled In Time", note: "Batch closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "deep-pot-cooling": "That second batch is still sitting whole in its deep stockpot instead of split into shallow pans. A mass that size holds its heat in the middle for hours no matter how cold the room around it gets — the Food Code's cooling methods exist because a deep pot in a walk-in is not one of them.",
    "cover-before-cold": "That lid is on a pan that has not reached 41 °F yet. A cover traps the heat that the ice bath and the open air are trying to pull out, which is the opposite of what this whole step is for — it goes on once the pan is cold, not once it is out of the way.",
    "warm-water-bath": "That bucket is plain water with no ice in it. A water bath only cools faster than open air because ice keeps pulling heat out of it — room-temperature water reaches the same temperature as the food and then does nothing at all.",
    "reheat-shortcut": "You reached for the microwave to flash the batch back up instead of bringing it to a full boil on the stove. A microwave heats unevenly, and the corrective reheat only counts if every part of this batch can be shown to have reached 165 °F, which a few minutes in a microwave cannot prove.",
  },

  lateNotes: {
    "rice-pan": "The rice goes into the blast chiller because it is dense and holds heat all the way through — an ice bath cools the outside of that pan long before it reaches the middle.",
    "date-discard-label": "The discard date only means anything once the pan is actually cold — write it before that and it is a guess wearing a label.",
  },

  steps: [
    {
      id: "haccp-plan", kind: "select", target: "haccp-board",
      title: "Read the cooling plan",
      cue: "Check today's batch, the par cooling times and which method each item uses.",
      why: "The plan is what turns 'cool it down' into two hard numbers and a deadline: 70 °F inside two hours, 41 °F inside six total. Reading it first is what makes the first probe reading meaningful instead of just a number.",
    },
    {
      id: "portion-shallow", kind: "drag", target: "stockpot",
      title: "Split the batch into shallow pans",
      cue: "Pour the hot stock from the deep pot into the shallow pans on the rack.",
      why: "Depth is the enemy of cooling: a shallow pan puts most of the batch within a couple of inches of cold air or ice water, where a deep pot keeps the centre insulated by the food around it. This one decision is most of what makes the two-hour mark achievable at all.",
      drag: { to: "shallow-pan-rack", radius: 0.45, missNote: "Not on the rack — the stock has to actually be in the shallow pans, not just near them, before it starts cooling any faster than it was in the pot." },
    },
    {
      id: "ice-bath-fill", kind: "sequence",
      targets: ["ice-added", "water-added"],
      itemNames: { "ice-added": "ice into the sink", "water-added": "water into the sink" },
      title: "Build the ice bath",
      cue: "Ice into the sink first, then water — not the other way round.",
      why: "Ice into an empty sink starts pulling heat the moment the pans go in; water added first just gives the ice something to melt into before it has done any work. The order is small, but it is free cooling time you do not get back.",
      outOfOrderNote: "Wrong order — ice goes in first so the bath is already working by the time the water and the pans join it.",
    },
    {
      id: "stir-paddle", kind: "track", target: "ice-paddle", seconds: 7,
      title: "Stir with the ice paddle",
      cue: "Hold a steady stirring rate through the ice bath — not so slow the surface refreezes still, not so fast you splash the bath out.",
      why: "A frozen paddle stirred through the pan does two things at once: it keeps a layer of warm stock from insulating itself against the ice water, and it is colder than the stock at every pass, which a plastic spoon never is.",
      track: { start: 0.1, green: [0.4, 0.62], rise: 0.55, fall: 0.5, drift: 0.12, label: "STIR RATE", readout: (v) => (v < 0.4 ? "too slow — surface insulating" : v > 0.62 ? "too fast — bath splashing out" : "steady") },
      holdBreakNote: "Rate out of band — settle the paddle and hold a steady stir through the bath.",
    },
    {
      id: "blast-chiller-load", kind: "drag", target: "rice-pan",
      title: "Load the rice into the blast chiller",
      cue: "Spread the rice thin in the hotel pan and load it onto the blast chiller rack.",
      why: "Rice packs dense and holds heat all the way to the centre of the pan; an ice bath only ever cools the surface it touches. The blast chiller moves enough cold air through a thin layer to reach the middle of this pan before the two-hour mark, which the ice bath alone would not.",
      drag: { to: "chiller-rack-socket", radius: 0.4, missNote: "Not seated on the rack — the pan has to be in the airflow, not resting against the chiller door." },
    },
    {
      id: "chiller-cycle", kind: "turn", target: "chiller-dial",
      title: "Set the chiller cycle",
      cue: "Turn the dial to the rapid-chill cycle for this load.",
      why: "The rapid-chill cycle is tuned to pull this size of load through the danger zone inside the same clock the ice bath is running against — the wrong cycle either wastes the machine's capacity or does not move enough air to matter.",
      turn: { turns: 1, axis: "z", label: "CHILLER CYCLE" },
    },
    {
      id: "chiller-watch", kind: "hold", target: "blast-chiller-door", seconds: 5,
      title: "Watch the cycle start",
      cue: "Hold at the chiller door until the cycle is confirmed running, not just switched on.",
      why: "A chiller that is powered but not actually cycling is a closed door doing nothing. Confirming the cycle started is the difference between a rice pan that is cooling and one that is just sitting in a cold-looking box.",
      holdBreakNote: "You walked off before the cycle confirmed. Hold until the display actually shows the cycle running.",
    },
    {
      id: "check-2hr", kind: "gauge", target: "stock-probe",
      title: "Probe at the two-hour mark",
      cue: "Probe the shallow pans and commit once the reading is at or below 70 °F.",
      why: "70 °F within two hours is the Food Code's own first checkpoint — not a suggestion, a deadline. A reading still above it at two hours means the batch has already used its whole first window and the second one is now working against a head start it does not have.",
      gauge: { label: "STOCK — 2-HR CHECK", speed: 0.6, green: [0.62, 0.86], readout: (t) => `${Math.round(150 - t * 80)} °F`, missNote: "Still above 70 °F at the two-hour mark — this batch needs the reheat-or-discard call, not another hour in the bath." },
    },
    {
      id: "airflow-walk", kind: "find", noHint: true,
      targets: ["pan-too-close", "lid-resting"],
      itemNames: { "pan-too-close": "pans stacked with no air gap", "lid-resting": "a lid resting on an uncooled pan" },
      itemNotes: {
        "pan-too-close": "These two pans are nested edge to edge with no gap between them. Cold air and ice water both need to reach every side of a pan to do their job — stacked tight, each pan insulates the one next to it.",
        "lid-resting": "This lid is resting on a pan that has not been checked yet. Even resting rather than sealed, it is still holding heat against the surface the whole point of this step is trying to pull heat away from.",
      },
      decoyNotes: { "pan-clear": "This pan has an honest gap of open air all the way round it and nothing resting on top. Leave it." },
      title: "Walk the cooling line",
      cue: "Two things on this line are working against the cooldown. Find them.",
      why: "Airflow is checked by eye and by hand, not assumed from the fact that the ice bath is running. A pan quietly blocked on one side is losing most of the benefit of everything else done right so far.",
    },
    {
      id: "check-6hr", kind: "gauge", target: "stock-probe",
      title: "Probe at the six-hour mark",
      cue: "Probe the pans again and commit once the reading is at or below 41 °F.",
      why: "41 °F within a total of six hours is the second half of the same rule — measured from when the food left 135 °F, not from when this six-hour check happens to start. Missing this mark after clearing the first one still means the batch spent too long in the danger zone overall.",
      gauge: { label: "STOCK — 6-HR CHECK", speed: 0.6, green: [0.06, 0.32], readout: (t) => `${Math.round(50 - t * 22)} °F`, missNote: "Still above 41 °F at six hours total — this batch is not safe to shelve; it has spent too long in the range where pathogens grow." },
    },
    {
      id: "cover-cold", kind: "select", target: "pan-lid-cold",
      title: "Cover the pan",
      cue: "Cover the pan now that it has actually reached 41 °F.",
      why: "A cover is for holding a pan at temperature, not for cooling it — put it on any earlier and it works against the very process it is supposed to protect once that process is finished.",
    },
    {
      id: "label-discard", kind: "sequence",
      targets: ["date-made-label", "date-discard-label"],
      itemNames: { "date-made-label": "date made", "date-discard-label": "discard date" },
      title: "Date the pan",
      cue: "Write the date made, then the discard date — in that order.",
      why: "The discard date is only real once there is a date made to count forward from. Writing it first is a guess about a day that has not started yet; writing it second is arithmetic anyone in the kitchen can check.",
      outOfOrderNote: "Wrong order — the date made goes on first, and the discard date is counted forward from it.",
    },
    {
      id: "sign-log", kind: "select", target: "cooling-log-sign",
      title: "Sign the cooling log",
      cue: "Sign the cooling log with both checkpoint readings.",
      why: "The signed log is the proof, months later, that this specific batch actually cleared both windows — not that it probably did, and not that this kitchen usually gets it right.",
    },
  ],

  // Two things that happen while your hands are on the ice paddle or the
  // chiller door. See shared/game.js.
  interrupts: [
    {
      id: "two-hour-80",
      kind: "Cooling check failed",
      after: "stir-paddle", delay: 4, seconds: 12,
      alert: "The cooling log board just posted the two-hour reading on the pan behind you: 80 °F — well outside the window, and the clock on it is still running.",
      cue: "That batch needs the reheat, right now, not another minute in the bath.",
      target: "reheat-burner",
      why: "The Food Code gives a failed two-hour check exactly one honest fix: bring the whole batch back to a full 165 °F on the stove where you can prove every part of it got there, or discard it — there is no version of 'give it more time in the same bath that already missed the mark'.",
      missNote: "You left that pan in the bath instead of reheating it. A batch that missed 70 °F at two hours does not get a second chance at the same method — every additional minute in the danger zone at 80 °F is more time for whatever survived cooking to multiply, and it does not show up on a thermometer as anything other than a normal, wrong number.",
      wrongNote: "It is the stove. Bring that batch to a full boil now, or it gets discarded — sitting in the same bath is neither.",
    },
    {
      id: "cook-stacking-pans",
      kind: "Pans covered and stacked",
      after: "chiller-watch", delay: 4, seconds: 12,
      alert: "Another cook has started covering the shallow pans in the ice bath and stacking them to clear counter space, right on top of each other.",
      cue: "Those pans are not cold yet — get them uncovered and spaced apart again.",
      target: "pan-too-close",
      why: "Covering and stacking still-hot pans to make room is exactly the airflow-airflow-blocking mistake this whole method is built to avoid, done all at once, by somebody who was solving a different problem than the one you are timing.",
      missNote: "The pans stayed covered and stacked while the clock kept running. Every one of them lost most of its airflow at the same time, which means the two-hour and six-hour checks you are about to take are readings off a cooldown that quietly stopped working several minutes ago.",
      wrongNote: "It is the stacked pans. Get them uncovered and spaced apart before anything else on this line matters.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, PCL_ACCENT);

    // Floor: textured quarry tile.
    const floorTex = surfaceTexture(
      (cx, cw, ch) => pavingFace(cx, cw, ch, { tiles: 5, base: "#8a9296", base2: "#7c848a", seam: "rgba(20,26,30,0.4)" }),
      { repeat: 6, px: 512 });
    const floor = box(g, 6.4, 0.1, 5.6, 0, 0.05, 0, 0x82898e, { rough: 0.85, metal: 0.08 });
    floor.material = texturedMat(floorTex, { rough: 0.82, metal: 0.08, color: 0x82898e });

    // HACCP / cooling plan board.
    const board = group(g, -2.2, 0, -1.6);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0c1a24"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#7fb8e8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d9ecfb"; ctx.fillText("COOLING LOG — HACCP CCP-4", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eef6ff";
      ["135 °F to 70 °F within 2 hours", "70 °F to 41 °F within a total of 6 hours", "Shallow pans + ice bath, or blast chiller", "Cover only once cold — date made, then discard date", "2-hr check failed: reheat to 165 °F or discard"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.12)));
    }, { accent: PCL_ACCENT });
    reg(hits, board, "haccp-board");
    const boardAlarm = ball(board, 0.035, 0.42, 1.5, 0.02, 0x59c97b, { emissive: 0x59c97b, ei: 1.2 });

    // Stove with the stockpot and the reheat burner.
    const stove = group(g, -1.5, 0, -1.9);
    box(stove, 1.6, 0.86, 0.7, 0, 0.43, 0, 0x4a5561, { rough: 0.5, metal: 0.4 });
    box(stove, 1.6, 0.06, 0.7, 0, 0.89, 0, 0x2b2f34, { rough: 0.55 });
    const burner1 = cyl(stove, 0.16, 0.18, 0.03, -0.4, 0.93, 0, 0x1b1e23, { rough: 0.7, seg: 16 });
    const burner2 = cyl(stove, 0.16, 0.18, 0.03, 0.4, 0.93, 0, 0x1b1e23, { rough: 0.7, seg: 16 });
    holoTag(stove, "reheat burner", 0.4, 1.15, 0, { css: "#f2c14b", w: 0.28 });
    reg(hits, burner2, "reheat-burner");
    void burner1;
    const stockpot = group(stove, -0.4, 0.98, 0);
    cyl(stockpot, 0.26, 0.24, 0.4, 0, 0.2, 0, 0x8b939b, { rough: 0.35, metal: 0.7, seg: 20 });
    const stockSurface = cyl(stockpot, 0.24, 0.24, 0.02, 0, 0.41, 0, 0x6a4a2a, { rough: 0.4, seg: 20 });
    const stockSteam = particles(stockpot, 40, 0xe4ecf2, { size: 0.04, life: 1.0, additive: false, opacity: 0.28 });
    holoTag(stockpot, "stockpot", 0, 0.6, 0, { css: "#7fb8e8", w: 0.24 });
    reg(hits, stockpot, "stockpot");
    void stockSurface;

    // Second, whole batch left deep — the hazard.
    const deepPot = group(g, -2.5, 0, -0.6);
    cyl(deepPot, 0.28, 0.26, 0.42, 0, 0.21, 0, 0x8b939b, { rough: 0.35, metal: 0.7, seg: 20 });
    cyl(deepPot, 0.26, 0.26, 0.02, 0, 0.42, 0, 0x6a4a2a, { rough: 0.4, seg: 20 });
    holoTag(deepPot, "cool it whole?", 0, 0.62, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, deepPot, "deep-pot-cooling");

    // Ice bath sink with shallow pan rack.
    const sink = group(g, -0.2, 0, -0.6);
    box(sink, 1.6, 0.36, 1.0, 0, 0.18, 0, 0x9aa4ad, { rough: 0.4, metal: 0.6 });
    const bathWater = box(sink, 1.44, 0.02, 0.86, 0, 0.34, 0, 0xbfe4f2, { rough: 0.15, opacity: 0.7, transparent: true, cast: false });
    void bathWater;
    for (let i = 0; i < 10; i++) ball(sink, 0.05 + Math.random() * 0.02, -0.6 + Math.random() * 1.2, 0.34, -0.35 + Math.random() * 0.7, 0xeaf6fb, { rough: 0.2, opacity: 0.85, transparent: true });
    const iceAdd = box(g, 0.24, 0.18, 0.2, -0.9, 0.1, 0.2, 0xeaf6fb, { rough: 0.2, opacity: 0.9, transparent: true });
    holoTag(g, "ice", -0.9, 0.3, 0.2, { css: "#7fb8e8", w: 0.14 });
    reg(hits, iceAdd, "ice-added");
    const waterAdd = box(g, 0.2, 0.02, 0.2, -0.55, 0.05, 0.2, 0x6fb0e8, { rough: 0.2, opacity: 0.6, transparent: true, cast: false });
    holoTag(g, "water", -0.55, 0.2, 0.2, { css: "#7fb8e8", w: 0.16 });
    reg(hits, waterAdd, "water-added");
    const panRack = group(sink, 0, 0.34, 0);
    const shallowPans = [];
    for (const [px, pz] of [[-0.45, -0.2], [0.45, -0.2], [-0.45, 0.2]]) {
      const pan = box(panRack, 0.34, 0.06, 0.5, px, 0.03, pz, 0x9aa4ad, { rough: 0.35, metal: 0.6 });
      shallowPans.push(pan);
    }
    holoTag(panRack, "shallow pan rack", 0, 0.28, 0, { css: "#7fb8e8", w: 0.34 });
    reg(hits, panRack, "shallow-pan-rack");
    // A lid resting on one uncooled pan — find-step target.
    const lidResting = box(panRack, 0.32, 0.02, 0.46, 0.45, 0.09, -0.2, 0x2b2f34, { rough: 0.6, opacity: 0.85, transparent: true });
    reg(hits, lidResting, "lid-resting");
    // Two pans nested with no gap — find-step target, moved together.
    const closePans = group(sink, 0.5, 0.34, 0.55);
    box(closePans, 0.3, 0.06, 0.4, -0.14, 0.03, 0, 0x9aa4ad, { rough: 0.35, metal: 0.6 });
    box(closePans, 0.3, 0.06, 0.4, 0.15, 0.03, 0, 0x9aa4ad, { rough: 0.35, metal: 0.6 });
    holoTag(closePans, "no air gap", 0, 0.24, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, closePans, "pan-too-close");
    // A clear, well-spaced pan — decoy.
    const clearPan = box(sink, 0.32, 0.06, 0.46, -1.0, 0.34, 0.55, 0x9aa4ad, { rough: 0.35, metal: 0.6 });
    reg(hits, clearPan, "pan-clear");
    // A lid already sealed onto a pan fresh out of the bath, well before its
    // six-hour check — the cover-before-cold hazard, distinct from the
    // coworker's mid-run lid on the find-step's pan.
    const sealedEarly = box(sink, 0.34, 0.02, 0.5, -0.45, 0.4, -0.55, 0x2b2f34, { rough: 0.6, opacity: 0.9, transparent: true });
    holoTag(sink, "sealed already?", -0.45, 0.5, -0.55, { css: "#f0645b", w: 0.32 });
    reg(hits, sealedEarly, "cover-before-cold");
    // Ice paddle, hung beside the sink.
    const paddle = group(g, 0.9, 0.1, -0.7);
    cyl(paddle, 0.012, 0.012, 0.5, 0, 0.55, 0, 0xc9a86a, { rough: 0.6, seg: 8 });
    box(paddle, 0.16, 0.02, 0.22, 0, 0.32, 0, 0xdcf3f7, { rough: 0.3, opacity: 0.85, transparent: true });
    holoTag(paddle, "ice paddle", 0, 0.75, 0, { css: "#7fb8e8", w: 0.26 });
    reg(hits, paddle, "ice-paddle");
    // Plain-water bucket beside the ice bath — the hazard.
    const warmBucket = cyl(g, 0.2, 0.18, 0.3, 1.3, 0.15, -0.2, 0x2b3138, { rough: 0.55, seg: 16 });
    const warmWater = box(g, 0.32, 0.01, 0.32, 1.3, 0.3, -0.2, 0x4a7fa8, { rough: 0.2, opacity: 0.6, transparent: true, cast: false });
    void warmWater;
    holoTag(g, "no ice — use this?", 1.3, 0.5, -0.2, { css: "#f0645b", w: 0.4 });
    reg(hits, warmBucket, "warm-water-bath");
    // Probe.
    const stockProbe = instrument(g, -0.6, 0.55, -0.9, { idle: "-- °F", color: 0x7fb8e8, w: 0.14, d: 0.22 });
    holoTag(stockProbe, "stock probe", 0, 0.16, 0, { css: "#7fb8e8", w: 0.26 });
    reg(hits, stockProbe, "stock-probe");

    // Blast chiller: cabinet, door, dial, rack socket, rice hotel pan.
    const chiller = group(g, 1.9, 0, -1.6);
    box(chiller, 1.1, 1.7, 0.9, 0, 0.85, 0, 0xd7dce1, { rough: 0.4, metal: 0.5 });
    const chillerDoor = box(chiller, 1.0, 1.5, 0.06, 0, 0.85, 0.46, 0xc0c6cc, { rough: 0.35, metal: 0.6 });
    holoTag(chillerDoor, "blast chiller", 0, 1.7, 0, { css: "#7fb8e8", w: 0.34 });
    reg(hits, chillerDoor, "blast-chiller-door");
    const chillerDial = instrument(chiller, 0.35, 0.4, 0.47, { idle: "OFF", color: 0x7fb8e8, w: 0.16, d: 0.1, ry: 0 });
    holoTag(chillerDial, "cycle dial", 0, 0.16, 0, { css: "#7fb8e8", w: 0.24 });
    reg(hits, chillerDial, "chiller-dial");
    const rackSocket = box(chiller, 0.7, 0.02, 0.6, 0, 1.0, 0.1, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["chiller-rack-socket"] = rackSocket;
    const ricePan = group(g, 1.7, 0.1, -0.4);
    box(ricePan, 0.5, 0.1, 0.36, 0, 0.05, 0, 0xb9bec4, { rough: 0.35, metal: 0.6 });
    box(ricePan, 0.46, 0.05, 0.32, 0, 0.1, 0, 0xf2f0dc, { rough: 0.8 });
    holoTag(ricePan, "rice hotel pan", 0, 0.24, 0, { css: "#7fb8e8", w: 0.28 });
    reg(hits, ricePan, "rice-pan");
    const chillerFan = cyl(chiller, 0.18, 0.18, 0.03, 0, 1.5, 0.3, 0x2b2f34, { rough: 0.5, seg: 16 });

    // Microwave — the reheat-shortcut hazard.
    const microwave = group(g, 0.4, 0, -2.0);
    box(microwave, 0.6, 0.36, 0.46, 0, 0.6, 0, 0x2b2f34, { rough: 0.4, metal: 0.4 });
    box(microwave, 0.4, 0.24, 0.02, -0.06, 0.6, 0.23, 0x0d1c24, { rough: 0.2, opacity: 0.7, transparent: true, cast: false });
    holoTag(microwave, "flash it here?", 0, 0.86, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, microwave, "reheat-shortcut");

    // Cold pan and cover, date labels, cooling log, on the pass counter.
    const pass = counter(g, 2.0, 0.7, 0.4, 1.7, 0x9aa4ad, { height: 0.9, metal: 0.75, rough: 0.3 });
    const coldPan = box(pass, 0.4, 0.08, 0.32, -0.6, 0.94, 0, 0x9aa4ad, { rough: 0.35, metal: 0.6 });
    const lidCold = box(pass, 0.42, 0.02, 0.34, -0.6, 1.5, 0, 0x2b2f34, { rough: 0.6, opacity: 0.85, transparent: true });
    holoTag(pass, "pan lid", -0.6, 1.6, 0, { css: "#7fb8e8", w: 0.2 });
    reg(hits, lidCold, "pan-lid-cold");
    void coldPan;
    const madeLabel = box(pass, 0.1, 0.02, 0.06, -0.1, 0.94, 0.05, 0xf2f6fa, { rough: 0.4 });
    holoTag(pass, "date made", -0.1, 1.02, 0.05, { css: "#7fb8e8", w: 0.22 });
    reg(hits, madeLabel, "date-made-label");
    const discardLabel = box(pass, 0.1, 0.02, 0.06, 0.1, 0.94, 0.05, 0xf2c14b, { rough: 0.4 });
    holoTag(pass, "discard date", 0.1, 1.02, 0.05, { css: "#f2c14b", w: 0.24 });
    reg(hits, discardLabel, "date-discard-label");
    const coolingLog = group(pass, 0.6, 0.94, 0);
    slab(coolingLog, 0.24, 0.02, 0.32, 0, 0.01, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(coolingLog, 0.2, 0.26, 0, 0.02, 0.161, signFace("COOLING LOG", { bg: "#f4ecda", fg: "#241a08", accent: "#2f6f8c", scale: 0.46 })).rotation.x = -Math.PI / 2;
    holoTag(coolingLog, "cooling log", 0, 0.2, 0, { css: "#7fb8e8", w: 0.3 });
    reg(hits, coolingLog, "cooling-log-sign");

    // A rack of clean, empty hotel pans and a wall clock — decorative, so the
    // room reads as a kitchen in the middle of a shift rather than a diagram
    // of one.
    const panRackEmpty = group(g, 2.4, 0, 1.2);
    for (const sx of [-0.3, 0.3]) box(panRackEmpty, 0.03, 1.3, 0.03, sx, 0.65, 0, 0x8b939b, { rough: 0.4, metal: 0.6, cast: false });
    for (let i = 0; i < 4; i++) box(panRackEmpty, 0.5, 0.06, 0.36, 0, 0.2 + i * 0.28, 0, 0x9aa4ad, { rough: 0.35, metal: 0.6 });
    const wallClock = group(g, -2.6, 0, 1.4);
    cyl(wallClock, 0.14, 0.14, 0.03, 0, 1.9, 0, 0xeef2f3, { rough: 0.4, seg: 20 });
    box(wallClock, 0.01, 0.1, 0.01, 0.02, 1.92, 0.02, 0x1b1e23, { rough: 0.6, cast: false });
    box(wallClock, 0.07, 0.01, 0.01, 0.03, 1.89, 0.02, 0x1b1e23, { rough: 0.6, cast: false });
    const ventGrille = group(g, 0.6, 0, -2.0);
    for (let i = 0; i < 5; i++) box(ventGrille, 0.5, 0.015, 0.015, 0, 2.55, -0.1 + i * 0.05, 0x8b939b, { rough: 0.5, metal: 0.5, cast: false });
    const cook = standingFigure(g, -0.35, -1.75, { ry: 1.0, cloth: 0x37505f });
    holoTag(cook, "cook", 0, 1.9, 0, { css: "#7fb8e8", w: 0.16 });
    // The coworker who covers and stacks pans mid-run — tucked well back
    // from the spawn point until the interruption below moves them in.
    const coworker = standingFigure(g, 2.7, -0.6, { ry: 2.6, cloth: 0x2b3138 });

    let held = 0, dialSet = 0, cycleRunning = false, pansDisturbed = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "portion-shallow") { stockSteam.visible = false; for (const p of shallowPans) p.material = mat(0x6a4a2a, { rough: 0.5 }); }
        if (step.id === "ice-bath-fill") { iceAdd.visible = false; waterAdd.visible = false; }
        if (step.id === "blast-chiller-load") { ricePan.parent.remove(ricePan); chiller.add(ricePan); ricePan.position.set(0, 1.0, 0.1); }
        if (step.id === "chiller-cycle") { repaint(chillerDial.userData.screen, signFace("CYCLE", { bg: "#0c1c24", accent: "#59c97b", fg: "#e9f6ff", scale: 0.6 })); }
        if (step.id === "chiller-watch") { cycleRunning = true; }
        if (step.id === "airflow-walk") { lidResting.visible = false; closePans.children[1].position.x = 0.45; }
        if (step.id === "cover-cold") { lidCold.position.y = 1.02; }
      },
      onInterrupt(it) {
        if (it.id === "two-hour-80") { repaint(stockProbe.userData.screen, signFace("80 °F", { bg: "#1c1408", accent: "#f0645b", fg: "#fff0d6", scale: 0.62 })); boardAlarm.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.4 }); }
        if (it.id === "cook-stacking-pans") { pansDisturbed = true; coworker.position.set(-0.4, 0, -0.5); lidResting.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "two-hour-80") { repaint(stockProbe.userData.screen, signFace("--", { bg: "#1c1408", accent: "#7fb8e8", fg: "#fff0d6", scale: 0.62 })); boardAlarm.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (it.id === "cook-stacking-pans") { pansDisturbed = false; coworker.position.set(2.7, 0, -0.6); lidResting.visible = false; }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "stir-paddle" && session.holding) held = Math.min(1, held + dt / 7);
        paddle.rotation.y = held * Math.PI * 4;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "check-2hr") repaint(stockProbe.userData.screen, signFace(`${Math.round(150 - gg.t * 80)} °F`, { bg: "#0c1c24", accent: gg.t >= 0.62 && gg.t <= 0.86 ? "#59c97b" : "#f2ae14", fg: "#e9f6ff", scale: 0.6 }));
        if (gg && !gg.committed && step?.id === "check-6hr") repaint(stockProbe.userData.screen, signFace(`${Math.round(50 - gg.t * 22)} °F`, { bg: "#0c1c24", accent: gg.t >= 0.06 && gg.t <= 0.32 ? "#59c97b" : "#f2ae14", fg: "#e9f6ff", scale: 0.6 }));
        if (session?.turn && step?.id === "chiller-cycle") dialSet = session.turn.amount;
        if (cycleRunning) chillerFan.rotation.z += dt * 5;
        void dialSet; void pansDisturbed;
      },
    };
  },
};
