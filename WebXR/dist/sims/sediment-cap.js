import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Sediment Cap VR — Maritime & Ports, station eighty-one.
//
// Capping contaminated bay sediment that is being left in place rather than
// dredged out, on a generic reach beside a former shipyard — not any one
// site's history, the trade procedure every in-place capping job on the Bay
// runs. A spreader barge lays clean sand over the contaminated bottom in
// thin, even lifts inside a permitted footprint; the learner is the deck
// lead calling the placement to the spreader operator, not the operator.
// Everything here answers one question the permit is actually written
// around: is the cap the design says it is, in the place the design says it
// is, without stirring up the very sediment it exists to bury? A survey
// before the first lift proves where the bottom actually is; a curtain and
// its anchors hold the plume the sand itself raises; a core at the design
// grid is the only honest answer to "how thick is it now"; and a survey
// after the last lift is the record the permit is judged against, not a
// deck lead's word that the job looked right.

const SDC_ACCENT = 0xc9a24a;

export const SIM_SEDIMENT_CAP = {
  id: "sediment-cap",
  index: "81",
  domain: "Maritime",
  trade: "Cap placement deck lead / marine construction crew",
  category: "Maritime & Ports",
  weather: "overcast",
  certification: "IUOE Local 3 operating engineers (spreader barge); Inlandboatmen's Union of the Pacific (IBU, ILWU marine division) — barge and tug crew; LIUNA laborers; U.S. Army Corps of Engineers Section 404 permit conditions; San Francisco Bay Dredged Material Management Office (DMMO) cap material testing; Regional Water Quality Control Board CWA Section 401 water quality certification; USCG barge and towing regulations",
  name: "Sediment Cap",
  title: simTitle("Sediment Cap"),
  tagline: "Capping contaminated bay sediment left in place: design thickness read off the permit, bathymetry checked against the plan, a turbidity curtain anchored, sand placed in thin lifts one grid cell at a time, thickness proven by core rather than by eye, and the placement stopped the moment turbidity or a short core says so",
  accent: SDC_ACCENT,
  accentCss: "#c9a24a",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "cap-to-grade", name: "Cap To Grade", note: "A design grid cell capped to its full thickness, cores proving it, without a turbidity reading over limit" },

  game: system({
    name: "Cap Deck",
    currency: "LIFT",
    ranks: ["Deckhand", "Cap Deck Lead", "Placement Boss", "Capping Foreman", "Cap Deck Certified"],
    badges: [
      { id: "plan-honest", name: "Plan Honest", note: "Read the permit thickness and the pre-cap bathymetry clean before the first lift", test: AWARD.all(AWARD.stepClean("permit"), AWARD.stepClean("bathymetry")) },
      { id: "nothing-thin", name: "Nothing Thin", note: "Never a hazard, never a reading called outside its band", test: AWARD.safe },
      { id: "true-thickness", name: "True Thickness", note: "Core thickness and spread rate both read inside the working band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-cell", name: "Clean Cell", note: "No corrections across the whole grid cell", test: AWARD.clean },
      { id: "steady-lift", name: "Steady Lift", note: "Held the spread rate in band the whole lift", test: AWARD.unbroken },
      { id: "cell-away", name: "Cell Away", note: "Cell capped and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "line-bight-stand": "You stood inside the bight of the spud mooring line while it was under load. A line under tension straightens out the instant the strain comes off whatever it is holding, and anyone standing in the loop it makes on the way is taken with it — a bight is the one place on a working deck that is never a place to stand, loaded or not.",
    "spreader-jam-reach": "You reached into the spreader's discharge chute to clear a sand jam while the belt was still running. A jammed chute clears itself the moment the load behind it lets go, and a hand in the opening when that happens goes wherever the sand does — the belt gets locked out before anyone's arm goes near that discharge.",
    "skip-core-call": "You called the grid cell capped without pulling the verification core. A spreader lays sand evenly in theory and unevenly in the water — current, chute wear and the bottom's own contour all change how much actually lands — and the only honest answer to how thick the cap is right there is a core through it, not a lift count on a clipboard.",
    "outside-curtain-spread": "You ran the spreader past the turbidity curtain's line to true up the cell's far edge. Sand placed outside the curtain is sand with no boundary holding its plume, and it turns the one instrument reading real-time turbidity into a monitor for a footprint the crew has already left — the cell gets trued up inside the line or it does not get trued up today.",
  },

  lateNotes: {
    "spud-winch": "Set the spuds after the curtain is out and anchored — pinning the barge down before the boundary exists just means moving both once the curtain goes in.",
    "spreader-call": "Call the spreader only once the grid cell is confirmed — there is nothing to place a thin lift against before the cell the design plan actually calls out is marked.",
    "core-gauge": "Read the core after a lift has gone down. There is no cap to gauge the thickness of over a grid cell that has not been spread yet.",
    "survey-transducer": "Log the post-placement survey after the cores confirm the lift. A survey run over a cell nobody has verified is not the record the permit is asking for.",
  },

  // Interruptions: see shared/game.js. One is the plume the sand itself
  // raises finding the one number the permit is written against while the
  // lift is still going down; the other is a core coming back from an
  // earlier pass while the crew's attention is already on logging the next
  // one, which is exactly when a short cap gets missed.
  interrupts: [
    {
      id: "turbidity-over-limit",
      kind: "Turbidity monitor alarming",
      after: "spread", delay: 4, seconds: 13,
      alert: "The curtain's real-time turbidity monitor has jumped past the permit limit while this lift is still going down — the sand hitting the water is stirring more than the curtain is holding.",
      cue: "The monitor is over limit. Stop the spreader and read it before the next pass.",
      target: "turbidity-monitor-cap",
      why: "The 401 certification is not a promise the crew meant to be careful, it is a number a monitor either confirms or contradicts while the lift is still running, and a reading over limit means this pass is raising more than the curtain and the lift rate together were sized to hold. It gets read and the spreader stopped the moment it alarms — not after another pass has gone down on the same bad conditions.",
      missNote: "The spreader kept feeding through the alarm and the plume kept building past the curtain's own capacity to hold it, turning one exceedance into a run of them — which is the difference between a reading a regulator notes and a permit violation a regulator acts on.",
      wrongNote: "That's not it. The turbidity monitor is the one instrument reading what this lift is actually raising right now — nothing else on this deck tells you that.",
    },
    {
      id: "short-core-callback",
      kind: "Short core called back",
      after: "log-survey", delay: 4, seconds: 13,
      alert: "The lab just called back on the last core off grid cell two — it read six inches under the design thickness — and the survey pass is about to log a cap that is not actually there yet.",
      cue: "Flag the short cell and call the spreader back over it before anything gets logged.",
      target: "recap-flag",
      why: "A core that reads short is not a rounding error, it is a hole in the one control this whole job exists to build: a barrier over contaminated sediment thin enough in one place to matter is not a barrier there at all. Flagging the cell and calling another lift over it now, before the survey closes the record, is the only way the report that goes to the Corps and the Water Board describes the cap that is actually on the bottom.",
      missNote: "The survey logged the cell as complete on the strength of the earlier pass, and a thin section of cap went into the permanent record as capped when it was not — the kind of gap that only turns up again on someone else's re-survey years later.",
      wrongNote: "Not that. The recap flag is what puts that cell back in front of the spreader before the record closes over it.",
    },
  ],

  steps: [
    {
      id: "permit", kind: "select", target: "permit-board",
      title: "Check the cap design and the permit's thickness",
      cue: "Read the Corps' Section 404 permit and the design cap thickness for today's grid cell.",
      why: "The design thickness on the permit is the number the whole day is judged against, and it is set by what the sediment underneath needs covered — not by how much sand happens to be on the barge. Placing a lift before knowing that number is guessing at a job somebody already specified.",
    },
    {
      id: "sand-source", kind: "select", target: "sand-hopper-tag",
      title: "Confirm the cap sand's own source testing",
      cue: "Check the DMMO clearance tag on the hopper before anything is loaded onto the spreader.",
      why: "The cap material gets the same DMMO testing the sediment it is covering once got — clean sand from an uncleared borrow source is not automatically clean, and a cap built from material nobody tested is a new contamination question sitting on top of the old one.",
    },
    {
      id: "bathymetry", kind: "gauge", target: "sonar-probe",
      title: "Check the pre-placement bathymetry against the plan",
      cue: "Tow the sonar probe over the cell and commit the depth reading against the design elevation.",
      why: "The design thickness only means anything measured from where the bottom actually is right now, not from where a survey years ago said it was. A cell that has silted in or scoured since then needs a different lift than the plan assumed, and this reading is the only honest way to know which.",
      gauge: { label: "PRE-CAP DEPTH", speed: 0.7, green: [0.4, 0.6], readout: (t) => `${(6.4 + t * 1.6).toFixed(1)} ft MLLW`, missNote: "Off the design elevation for this cell. Let the probe settle and read it again before anything is loaded onto the spreader." },
    },
    {
      id: "stage", kind: "sequence", anyOrder: true,
      targets: ["stage-vest", "stage-helmet", "stage-comms"],
      itemNames: { "stage-vest": "life vest", "stage-helmet": "hard hat", "stage-comms": "radio headset" },
      title: "Stage the deck lead's own gear",
      cue: "Life vest, hard hat, and a radio headset before stepping under the spreader boom.",
      why: "A spreader barge is a loaded hopper and a swinging discharge boom over open water, with a support skiff working the grid alongside — the vest is buoyancy the moment a wet deck takes a foot out, the hard hat is for a boom nobody sees swing until it already has, and the headset is how the deck lead calls a steady rate to the operator instead of guessing at hand signals over the belt.",
    },
    {
      id: "curtain-deploy", kind: "drag", target: "turbidity-curtain",
      title: "Deploy the turbidity curtain around the cell",
      cue: "Carry the curtain out and clip it to the ring around today's grid cell.",
      why: "Clean sand hitting soft, contaminated bottom kicks up exactly the material this whole job exists to bury back down. A skirt closed all the way round the cell is the only thing standing between that cloud and open water, so it goes in before the hopper opens, not after somebody notices the water has gone brown.",
      drag: { to: "curtain-ring", radius: 0.5, missNote: "Not on the ring — the curtain has to close the full loop around the cell or the plume goes straight out the gap." },
    },
    {
      id: "anchor-check", kind: "find", noHint: true,
      targets: ["anchor-1", "anchor-2", "anchor-3"],
      itemNames: { "anchor-1": "anchor 1", "anchor-2": "anchor 2", "anchor-3": "anchor 3" },
      itemNotes: {
        "anchor-1": "First point in the loop, dug in and not budging under a tug on the chain.",
        "anchor-2": "Second point holds the skirt down flat against the bottom instead of letting it float up on the tide.",
        "anchor-3": "Third point closes the loop; it is also the one furthest from the barge, so nobody checks it by accident on the way past.",
      },
      title: "Confirm every point holding the curtain to the bottom",
      cue: "Find and click all three anchor points before the first lift goes down.",
      why: "A curtain floats loose the instant even one of its points drags out of the mud, and that failure does not announce itself from the barge deck — it shows up later as a plume nobody can explain. Confirming all three before sand starts falling is what makes the turbidity reading mean something.",
    },
    {
      id: "spuds", kind: "turn", target: "spud-winch",
      title: "Lower and set the spuds",
      cue: "Wind the spud winch down until both piles are seated and the barge stops moving on the current.",
      why: "Sand dropped from a hull that is still swinging on the tide does not land where the operator aimed it — it lands wherever the barge happened to be pointing at that instant, and a design grid drawn against a fixed footprint stops meaning anything the moment the platform it was measured from starts drifting.",
      turn: { turns: 1.0, axis: "y", label: "SPUD WINCH" },
    },
    {
      id: "grid", kind: "find", noHint: true,
      targets: ["grid-1", "grid-2", "grid-3"],
      itemNames: { "grid-1": "grid marker 1", "grid-2": "grid marker 2", "grid-3": "grid marker 3" },
      itemNotes: {
        "grid-1": "Grid marker 1 sets the up-current corner of today's cell — the boom starts its pass here.",
        "grid-2": "Grid marker 2 is the cell's centre reference — the core at this point is the one the survey report actually cites.",
        "grid-3": "Grid marker 3 sets the down-current corner. Sand that lands past it is off the design grid and does not count toward it.",
      },
      title: "Find the design grid markers for today's cell",
      cue: "Walk the barge rail and click the three markers that set the cell the boom feeds.",
      why: "The plan is a drawing of grid cells, not a description of the whole bottom — the boom feeds one cell at a time, and the three markers are what turn the drawing into a footprint an operator can actually spread sand across without guessing at its edges.",
    },
    {
      id: "spread", kind: "track", target: "spreader-call", seconds: 7,
      title: "Call the spread rate for the lift",
      cue: "Hold the rate-call paddle in the working range — no rushed passes, no bare bottom left behind.",
      why: "A lift fed too fast piles sand in ridges that read thick at the crest and bare between them, which is exactly the uneven cap a core is about to catch; fed too slow, the boom burns the tide's working window laying less than the cell needs. Steady is what turns a hopper of clean sand into an even lift instead of a pile with gaps in it.",
      track: { start: 0.1, green: [0.38, 0.58], rise: 0.55, fall: 0.45, drift: 0.12, label: "SPREAD RATE", readout: (v) => (v < 0.38 ? "leaving bottom exposed" : v > 0.58 ? "burying it in ridges" : "even, thin lift") },
      holdBreakNote: "The call broke rhythm and the boom surged — that is exactly how a lift comes down uneven. Bring it back to a steady rate.",
    },
    {
      id: "core-sample", kind: "sequence",
      targets: ["core-1", "core-2", "core-3"],
      itemNames: { "core-1": "core at grid marker 1", "core-2": "core at grid marker 2", "core-3": "core at grid marker 3" },
      title: "Pull the verification cores at the design grid",
      cue: "Push the corer at marker 1, then marker 2, then marker 3, in that order.",
      why: "Cores are pulled corner to corner to centre so a thin edge shows up before the crew is only checking the middle of the cell. Pulled out of order, it is easy to check the easiest spot on the boat's lee side twice and never reach the far corner at all.",
      outOfOrderNote: "Marker 1, then marker 2, then marker 3 — corner to corner to centre. Skipping the order is how a corner never gets checked.",
    },
    {
      id: "thickness", kind: "gauge", target: "core-gauge",
      title: "Read the core thickness against the design band",
      cue: "Measure the cap layer on the core and commit the reading against the permit's design thickness.",
      why: "A lift count and a spread rate both in band still do not tell anyone how thick the cap actually is where it counts — only a core through it does. This reading is what the survey report cites, not the deck log of how many passes the boom made.",
      gauge: { label: "CORE THICKNESS", speed: 0.72, green: [0.42, 0.62], readout: (t) => `${(0.9 + t * 1.5).toFixed(2)} ft`, missNote: "Off the design thickness. Pull the core again at the marker before this cell is called finished." },
    },
    {
      id: "log-survey", kind: "hold", target: "survey-transducer", seconds: 5,
      title: "Log the post-placement survey",
      cue: "Hold the survey transducer steady for the full pass before committing the record.",
      why: "The post-placement survey is the record the Corps and the Water Board actually judge the job against, not the deck lead's word that the cell looked right. A transducer towed unsteadily returns a noisy line that proves nothing either way — held steady for the full pass, it is the one document that shows this cell is the cap the permit called for.",
      holdBreakNote: "The tow wobbled and the pass came back noisy. Reset the line and hold it steady for the full run before logging anything.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["boom-tie-check", "buoy-light-check"],
      itemNames: { "boom-tie-check": "the spreader boom tie-down", "buoy-light-check": "the grid marker's nav light" },
      itemNotes: {
        "boom-tie-check": "The boom's tie-down has worked loose against the day's swinging. Left as is, the next pass starts with a boom nobody actually secured overnight.",
        "buoy-light-check": "One grid marker's nav light is out. A dark marker at the edge of a night-worked cell is a mark nobody but the crew that placed it can find again.",
      },
      title: "Walk the deck before the barge moves off",
      cue: "Check the spreader boom's tie-down and the grid markers' lights before this cell is left behind.",
      why: "The barge is about to move to the next cell with the crew's attention on the transit, and the curtain and the markers are what stay behind doing the job unattended. Both get one more look here, because neither gets a second chance once the barge is off this footprint.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, SDC_ACCENT);

    // ------------------------------------------------------------ the water
    const water = slab(g, 6.0, 0.02, 5.6, 0, 0.01, -0.3, 0x1c3a48, { rough: 0.2, metal: 0.28, opacity: 0.85, transparent: true, cast: false });
    const haze = particles(g, 30, 0xc7d6dd, { size: 0.045, life: 1.1, additive: false, opacity: 0.22 });
    haze.position.set(0, 0.55, -1.6);

    // ----------------------------------------------------- the spreader barge
    const barge = group(g, -0.55, 0.19, 0.3);
    box(barge, 3.0, 0.36, 2.6, 0, -0.16, 0, 0x3a3428, { rough: 0.72, metal: 0.3, cast: false });
    box(barge, 3.0, 0.05, 2.6, 0, 0.03, 0, 0x4a4436, { rough: 0.7, metal: 0.25 });
    for (let i = -1; i <= 1; i++) box(barge, 0.03, 0.01, 2.6, i * 1.0, 0.06, 0, 0x2b2820, { rough: 0.8, cast: false });

    // Spuds at the forward corners, with the mooring line and its bight — the
    // hazard hotspot the deck lead is never supposed to be standing inside.
    const spudGroup = group(barge, 0, 0, 0.9);
    const spuds = [];
    for (const sx of [-1.25, 1.25]) {
      const spud = cyl(spudGroup, 0.05, 0.05, 1.4, sx, 0.4, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 12 });
      spuds.push(spud);
    }
    const spudWinchGrp = group(barge, 0, 0.06, 0.55);
    const spudWinch = valveWheel(spudWinchGrp, 0, 0.16, 0, { r: 0.09, color: 0xe8b02e, body: 0x2b3138 });
    holoTag(spudWinchGrp, "spud winch", 0, 0.42, 0, { css: "#c9a24a", w: 0.32 });
    reg(hits, spudWinch.userData.wheel, "spud-winch");

    const mooringLine = group(barge, 0.6, 0.05, 0.75);
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI;
      cyl(mooringLine, 0.012, 0.012, 0.09, Math.sin(a) * 0.32, 0.02, Math.cos(a) * 0.18 - 0.18, 0x8a7a54, { rough: 0.85, seg: 6, cast: false }).rotation.z = a;
    }
    const bightHit = box(barge, 0.5, 0.3, 0.4, 0.6, 0.2, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(barge, "stand in the bight?", 0.6, 0.5, 0.6, { css: "#e8622a", w: 0.4 });
    reg(hits, bightHit, "line-bight-stand");

    // Sand hopper and the spreader chute / boom over the water side.
    const hopperGrp = group(barge, -0.85, 0.03, -0.6);
    box(hopperGrp, 1.1, 0.6, 1.0, 0, 0.32, 0, 0xb8933f, { rough: 0.85, cast: false });
    box(hopperGrp, 1.2, 0.06, 1.1, 0, 0.63, 0, 0x9d7c34, { rough: 0.8, cast: false });
    const sandPile = box(hopperGrp, 0.9, 0.3, 0.8, 0, 0.65, 0, 0xd6b563, { rough: 0.98, cast: false });
    void sandPile;
    const hopperTag = decal(hopperGrp, 0.5, 0.16, 0, 0.85, 0.56, signFace("DMMO TESTED — CAP SAND", { bg: "#241d0d", accent: "#c9a24a", scale: 0.5 }));
    reg(hits, hopperTag, "sand-hopper-tag");

    const chuteGrp = group(barge, -0.3, 0.4, -1.0);
    cyl(chuteGrp, 0.09, 0.11, 1.6, 0, 0, 0, 0x6f6248, { rough: 0.6, metal: 0.4, seg: 14 }).rotation.z = Math.PI / 2 + 0.3;
    const spreaderNozzle = group(chuteGrp, 0.75, -0.32, 0);
    cyl(spreaderNozzle, 0.1, 0.14, 0.24, 0, 0, 0, 0x5a4f38, { rough: 0.65, metal: 0.35, seg: 14 });
    const sandFall = particles(spreaderNozzle, 26, 0xd6b563, { size: 0.028, life: 0.55, additive: false, opacity: 0.55 });
    sandFall.position.set(0, -0.16, 0);
    sandFall.visible = false;

    const jamHit = box(chuteGrp, 0.3, 0.3, 0.3, 0.45, -0.1, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(chuteGrp, "clear the jam by hand?", 0.45, 0.24, 0, { css: "#e8622a", w: 0.46 });
    reg(hits, jamHit, "spreader-jam-reach");

    // Deck console for the rate-call paddle and the deck lead's own gear.
    const console_ = toolChest(barge, 0.9, 0.55, { color: 0x2f4d5f });
    for (const [id, dx, color, label] of [["stage-vest", -0.2, 0xe8b02e, "VEST"], ["stage-helmet", 0.0, 0xf2c14b, "HELMET"], ["stage-comms", 0.2, 0x2f4d5f, "COMMS"]]) {
      const it = group(console_, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#231c0d", accent: "#f2e2b0", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const callPost = group(barge, 1.05, 0.06, -0.15);
    cyl(callPost, 0.03, 0.035, 0.7, 0, 0.35, 0, 0x4a4538, { rough: 0.5, metal: 0.5, seg: 10 });
    const callPaddle = group(callPost, 0, 0.7, 0);
    box(callPaddle, 0.28, 0.05, 0.05, 0, 0.14, 0, CITY.hiVis, { rough: 0.5 });
    holoTag(callPost, "rate-call paddle", 0, 1.05, 0, { css: "#c9a24a", w: 0.34 });
    reg(hits, callPaddle, "spreader-call");
    const callReadout = instrument(callPost, -0.22, 0.72, 0, { idle: "----", color: 0xc9a24a, w: 0.13, d: 0.19 });

    const crewOnBarge = standingFigure(barge, 0.15, -1.65, { ry: 3.0, cloth: 0x2b3138, vest: 0xe8b02e, helmet: 0xf2c14b });
    void crewOnBarge;

    // ----------------------------------------------------- bathymetry / survey
    const sonarGrp = group(g, 1.5, 0.06, 1.0, -0.3);
    cyl(sonarGrp, 0.03, 0.035, 0.5, 0, 0.25, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 10 });
    const sonarHead = ball(sonarGrp, 0.07, 0, 0.02, 0, 0xc9a24a, { rough: 0.5, seg: 14 });
    const sonarInst = instrument(sonarGrp, 0.16, 0.4, 0, { idle: "-- ft", color: 0xc9a24a, w: 0.13, d: 0.19 });
    holoTag(sonarGrp, "bathymetry sonar", 0, 0.62, 0, { css: "#c9a24a", w: 0.4 });
    reg(hits, sonarInst, "sonar-probe");
    void sonarHead;

    const surveyGrp = group(g, 1.9, 0.04, -1.5, 0.6);
    cyl(surveyGrp, 0.025, 0.03, 0.42, 0, 0.21, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 10 });
    const transducer = ball(surveyGrp, 0.06, 0, 0.02, 0, 0x8fa9c4, { rough: 0.5, seg: 14 });
    const surveyInst = instrument(surveyGrp, 0.16, 0.34, 0, { idle: "-- LOG", color: 0xc9a24a, w: 0.13, d: 0.19 });
    holoTag(surveyGrp, "survey transducer", 0, 0.56, 0, { css: "#c9a24a", w: 0.4 });
    reg(hits, transducer, "survey-transducer");

    // -------------------------------------------------------------- core rig
    const coreSkiff = group(g, 1.1, 0.03, -0.15, -0.5);
    box(coreSkiff, 1.1, 0.16, 0.6, 0, 0.09, 0, 0x53606b, { rough: 0.65, metal: 0.3, cast: false });
    const coreRack = group(coreSkiff, 0, 0.17, 0);
    const coreGauge = instrument(coreSkiff, 0.3, 0.32, 0, { idle: "-- ft", color: 0xc9a24a, w: 0.14, d: 0.19 });
    holoTag(coreSkiff, "core gauge", 0.3, 0.52, 0, { css: "#c9a24a", w: 0.3 });
    reg(hits, coreGauge, "core-gauge");
    const coreTubes = {};
    for (const [id, cx] of [["core-1", -0.3], ["core-2", 0.0], ["core-3", 0.3]]) {
      const tube = cyl(coreRack, 0.025, 0.025, 0.34, cx, 0.17, 0.05, 0x6f6f74, { rough: 0.5, metal: 0.5, seg: 10 });
      reg(hits, tube, id);
      coreTubes[id] = tube;
    }
    standingFigure(g, 0.25, -0.7, { ry: 1.0, cloth: 0x36505f, vest: 0xe8b02e });
    const skipCoreHit = box(coreSkiff, 0.3, 0.3, 0.3, -0.4, 0.25, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(coreSkiff, "call it capped without the core?", -0.4, 0.5, 0.05, { css: "#e8622a", w: 0.56 });
    reg(hits, skipCoreHit, "skip-core-call");

    // ------------------------------------------------------- turbidity curtain
    const bundle = group(g, -2.3, 0.1, 1.4, 0.4);
    cyl(bundle, 0.09, 0.09, 0.55, 0, 0.09, 0, 0xe8b02e, { rough: 0.7, seg: 14 }).rotation.z = Math.PI / 2;
    holoTag(bundle, "turbidity curtain — furled", 0, 0.28, 0, { css: "#c9a24a", w: 0.46 });
    reg(hits, bundle, "turbidity-curtain");

    const curtainRing = group(g, -0.2, 0, -0.1);
    curtainRing.visible = false;
    const anchorSpots = [["anchor-1", -1.9, 1.0], ["anchor-2", -0.2, -1.7], ["anchor-3", 1.4, 1.0]];
    for (const [, x, z] of anchorSpots) {
      const seg = cyl(curtainRing, 0.03, 0.03, 0.4, x, 0.24, z, 0xe8b02e, { rough: 0.6, seg: 10 });
      seg.rotation.z = Math.PI / 2;
    }
    const socket = group(curtainRing, 0, 0.15, 0);
    hits["curtain-ring"] = socket;
    for (const [id, x, z] of anchorSpots) {
      const anchor = group(g, x, 0.03, z);
      cyl(anchor, 0.05, 0.06, 0.06, 0, 0.03, 0, 0x3a3f45, { rough: 0.9, seg: 10 });
      reg(hits, anchor, id);
    }

    const outsideHit = box(g, 0.4, 0.3, 0.3, 1.9, 0.2, 1.85, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "spread past the curtain line?", 1.9, 0.5, 1.85, { css: "#e8622a", w: 0.5 });
    reg(hits, outsideHit, "outside-curtain-spread");

    // -------------------------------------------------------------- grid markers
    const gridMarkers = {};
    for (const [id, x, z] of [["grid-1", -1.4, 1.15], ["grid-2", -0.1, 0.55], ["grid-3", 1.15, 1.15]]) {
      const buoy = group(g, x, 0.02, z);
      ball(buoy, 0.09, 0, 0.09, 0, 0xe8622a, { rough: 0.6, seg: 14 });
      cyl(buoy, 0.01, 0.01, 0.4, 0, 0.28, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
      reg(hits, buoy, id);
      gridMarkers[id] = buoy;
    }
    const recapFlag = group(g, -0.1, 0.02, 0.55, 0.4);
    cyl(recapFlag, 0.01, 0.01, 0.45, 0, 0.23, 0, 0xd2312b, { rough: 0.5, metal: 0.6, seg: 8 });
    box(recapFlag, 0.14, 0.08, 0.006, 0.08, 0.4, 0, 0xd2312b, { rough: 0.6 });
    recapFlag.visible = false;
    reg(hits, recapFlag, "recap-flag");

    // ---------------------------------------------------------- turbidity monitor
    const monitorBuoy = group(g, -1.85, 0.02, -1.6);
    const monitorBall = ball(monitorBuoy, 0.12, 0, 0.1, 0, 0xe8622a, { rough: 0.6, seg: 14 });
    const monitorInst = instrument(monitorBuoy, 0.16, 0.16, 0, { idle: "-- NTU", color: 0xc9a24a, w: 0.13, d: 0.19 });
    holoTag(monitorBuoy, "turbidity monitor — real time", 0, 0.36, 0, { css: "#c9a24a", w: 0.5 });
    reg(hits, monitorInst, "turbidity-monitor-cap");

    // ------------------------------------------------------------- permit board
    const permitBoard = holoPanel(g, 0.92, 0.62, 2.15, 1.1, 0.9, (cx, w, h) => {
      cx.fillStyle = "#1c1608"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#c9a24a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f2e6c8"; cx.fillText("USACE §404 PERMIT — SEDIMENT CAP", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#efe3c4";
      ["Design thickness: this grid cell", "Cap sand DMMO-tested before load", "Turbidity limit: differential over curtain",
       "Verification core at design grid", "Post-placement survey required"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -0.4, accent: SDC_ACCENT });
    reg(hits, permitBoard, "permit-board");

    // --------------------------------------------------------------- support skiff
    const skiffHome = new THREE.Vector3(3.4, 0.02, 1.3);
    const skiff = group(g, skiffHome.x, skiffHome.y, skiffHome.z, -0.6);
    box(skiff, 1.5, 0.36, 0.7, 0, 0.22, 0, 0x1f2a33, { rough: 0.7, metal: 0.25, cast: false });
    box(skiff, 0.6, 0.44, 0.55, -0.25, 0.56, 0, 0xe8edf1, { rough: 0.6, cast: false });
    cyl(skiff, 0.028, 0.028, 0.6, -0.25, 1.02, 0, 0xc3ccd3, { rough: 0.5, metal: 0.6, seg: 8, cast: false });
    const skiffLight = ball(skiff, 0.055, -0.25, 1.36, 0, 0xffe9a8, { emissive: 0xffe9a8, ei: 1.2, rough: 0.4, cast: false });
    standingFigure(skiff, 0.45, 0.05, { ry: -2.2, cloth: 0x243a4a, vest: 0xf2681f, atStation: true }).position.y = 0.38;
    holoTag(g, "core skiff standing by", skiffHome.x, 1.55, skiffHome.z, { css: "#c9a24a", w: 0.34 });
    const wake = particles(g, 22, 0xcfe4f0, { size: 0.032, life: 0.8, additive: false, opacity: 0.32 });

    cone(g, -2.5, 2.0, { color: SDC_ACCENT });
    cone(g, 2.7, -1.7, { color: SDC_ACCENT });
    barrierPanel(g, -0.2, 2.2, { color: 0xe8b02e });

    // -------------------------------------------------------- final walk items
    const boomTie = group(barge, -0.6, 0.55, -0.95, 0.6);
    cyl(boomTie, 0.01, 0.01, 0.22, 0, 0.11, 0, 0x8a7a54, { rough: 0.85, seg: 8, cast: false });
    reg(hits, boomTie, "boom-tie-check");
    const buoyLight = ball(gridMarkers["grid-2"], 0.02, 0, 0.44, 0, 0x3a3f45, { rough: 0.6, seg: 10 });
    reg(hits, buoyLight, "buoy-light-check");

    let liftPasses = 0, monitorHigh = false, coreCalledBack = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.0, 0.4),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "sand-source") {
          hopperTag.material.emissiveIntensity = 0.3;
        }
        if (step.id === "curtain-deploy") {
          bundle.visible = false;
          curtainRing.visible = true;
        }
        if (step.id === "spuds") {
          for (const spud of spuds) spud.position.y = 0.02;
        }
        if (step.id === "grid") {
          for (const b of Object.values(gridMarkers)) b.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "spread") {
          liftPasses += 1;
          sandPile.scale.y = 1.4;
        }
        if (step.id === "core-sample") {
          for (const tube of Object.values(coreTubes)) tube.material = mat(0xc9a24a, { rough: 0.5, metal: 0.4 });
        }
        if (step.id === "thickness") {
          repaint(coreGauge.userData.screen, signFace("LOGGED", { bg: "#1c1608", accent: "#59c97b", fg: "#f2e6c8", scale: 0.55 }));
        }
        if (step.id === "log-survey") {
          repaint(surveyInst.userData.screen, signFace("LOGGED", { bg: "#1c1608", accent: "#59c97b", fg: "#f2e6c8", scale: 0.55 }));
        }
        if (step.id === "walk") {
          boomTie.visible = false;
          buoyLight.visible = false;
        }
      },

      onInterrupt(it) {
        if (it.id === "turbidity-over-limit") {
          monitorHigh = true;
          monitorBall.material = mat(0xf0645b, { rough: 0.4, emissive: 0xf0645b, ei: 2.2 });
          repaint(monitorInst.userData.screen, signFace("OVER", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffdada", scale: 0.6 }));
        }
        if (it.id === "short-core-callback") {
          coreCalledBack = true;
          recapFlag.visible = true;
          gridMarkers["grid-2"].children[0].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 1.4 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "turbidity-over-limit") {
          monitorHigh = false;
          monitorBall.material = mat(0xe8622a, { rough: 0.6 });
        }
        if (it.id === "short-core-callback") {
          coreCalledBack = false;
          recapFlag.visible = false;
          gridMarkers["grid-2"].children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        haze.visible = true;
        haze.userData.step(dt, new THREE.Vector3(0, 0.5, -1.5), 1.6, 0.14, 0.1);
        wake.visible = liftPasses > 0;
        if (liftPasses > 0) wake.userData.step(dt, new THREE.Vector3(1.0, 0.03, -0.4), 0.7, 0.4, -0.5);
        water.position.y = 0.01 + Math.sin(t * 1.1) * 0.004;
        skiffLight.material = mat(0xffe9a8, { emissive: monitorHigh ? 0xf0645b : 0xffe9a8, ei: monitorHigh ? 2.0 : 1.2, rough: 0.4 });
        if (coreCalledBack) recapFlag.rotation.y += dt * 2.2;

        const step = session?.step;
        if (step?.id === "spread") {
          sandFall.visible = true;
          sandFall.userData.step(dt, new THREE.Vector3(0, -0.16, 0), 0.12, 0.9, -1.4);
          const rate = session.track ? session.track.v : 0;
          spreaderNozzle.position.y = -0.32 - rate * 0.1;
          repaint(callReadout.userData.screen, signFace(rate < 0.38 ? "SLOW" : rate > 0.58 ? "FAST" : "STEADY", {
            bg: "#1c1608", accent: rate >= 0.38 && rate <= 0.58 ? "#59c97b" : "#f0645b", fg: "#f2e6c8", scale: 0.55,
          }));
        } else {
          sandFall.visible = false;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "bathymetry") {
            repaint(sonarInst.userData.screen, signFace(`${(6.4 + gg.t * 1.6).toFixed(1)} ft`, { bg: "#1c1608", accent: gg.t >= 0.4 && gg.t <= 0.6 ? "#59c97b" : "#f0645b", fg: "#f2e6c8", scale: 0.55 }));
          }
          if (step?.id === "thickness") {
            repaint(coreGauge.userData.screen, signFace(`${(0.9 + gg.t * 1.5).toFixed(2)} ft`, { bg: "#1c1608", accent: gg.t >= 0.42 && gg.t <= 0.62 ? "#59c97b" : "#f0645b", fg: "#f2e6c8", scale: 0.55 }));
          }
        }
      },
    };
  },
};
