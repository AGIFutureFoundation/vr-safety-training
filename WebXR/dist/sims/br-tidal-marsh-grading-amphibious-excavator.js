import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat, mudflatFace, pavingFace,
} from "../citykit.js";
import { amphibiousExcavator } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Tidal Marsh Grading — Amphibious Excavator VR — Water &
// Environmental, Bay Restoration & Cleanup pack C.
//
// Regrading a generic tidal marsh bench to its permitted design elevation
// with a pontoon-mounted excavator — not any one restoration site, and no
// claim about any one site's history. The machine exists because a standard
// tracked excavator sinks into this ground before it ever reaches the grade
// line; the pontoons spread the same weight across a wide enough hull to
// float or crawl a bench a wheeled or conventionally tracked rig cannot enter
// at all. That capability does not relax anything else about the job: the
// swing radius still kills exactly the way any excavator's does, the buffer
// around the nesting closure is still the one line on this bench nobody's
// production schedule gets to argue with, and a bucket of spoil still goes
// into the bins the 404 and 401 permits were written around, not over the
// side into the water the whole crew is here to protect.

const AMX_ACCENT = 0x5f9e5a;
const AMX_FLAG = 0xe8622a;

export const SIM_BR_TIDAL_MARSH_GRADING_AMPHIBIOUS_EXCAVATOR = {
  id: "br-tidal-marsh-grading-amphibious-excavator",
  index: "br-c1",
  domain: "Environmental",
  trade: "Operating engineer — amphibious excavator, wetland restoration crew",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "IUOE Local 3 operating engineer — amphibious excavator; LIUNA Local 261 laborers — ground crew and spotter; OSHA 29 CFR 1926 Subpart P excavations and grading; U.S. Army Corps of Engineers Clean Water Act (CWA) Section 404 permit conditions; San Francisco Bay Regional Water Quality Control Board CWA Section 401 water quality certification; San Francisco Bay Conservation and Development Commission (BCDC) permit; California Department of Fish and Wildlife Lake and Streambed Alteration Agreement; U.S. Fish and Wildlife Service Endangered Species Act nesting buffer; work window per the permit",
  name: "Tidal Marsh Grading — Amphibious Excavator",
  title: simTitle("Tidal Marsh Grading — Amphibious Excavator"),
  tagline: "Grading a tidal marsh bench to design elevation on a pontoon excavator: permit and buffer checked, mats laid ahead of the machine, the swing worked to a controlled arc clear of the nesting closure, grade cut to the laser, spoil bins loaded instead of the water, and the bench walked and logged before the crew stands down",
  accent: AMX_ACCENT,
  accentCss: "#5f9e5a",
  parSeconds: 320,
  footprint: 2.8,
  badge: { id: "grade-to-line", name: "Grade To The Line", note: "The whole bench cut to design elevation, buffer never crossed, nothing dumped but into the bins — first time" },

  game: system({
    name: "Grading Crew",
    currency: "BENCH",
    ranks: ["Laborer", "Oiler", "Operator", "Lead Operator", "Amphibious Excavator Certified"],
    badges: [
      { id: "buffer-held", name: "Buffer Held", note: "Never a hazard, never a swing past the nesting closure", test: AWARD.safe },
      { id: "grade-clean", name: "Grade Clean", note: "Swing rate and laser grade both read inside the working band", test: AWARD.precise(0.7) },
      { id: "bench-first", name: "Bench Read Clean", note: "Permit and buffer both read clean before the first cut", test: AWARD.stepClean("find-stakes") },
    ],
    challenges: [
      { id: "clean-bench", name: "Clean Bench", note: "No corrections across the whole grading run", test: AWARD.clean },
      { id: "steady-swing", name: "Steady Swing", note: "Held the boom swing inside the working band the whole pass", test: AWARD.unbroken },
      { id: "bench-fast", name: "Bench Closed Fast", note: "Grading closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "swing-radius-enter": "You walked into the excavator's swing radius while the boom was powered and moving. A house swinging under power carries the whole counterweight and boom through an arc with no warning but the beacon and the whistle, and nothing about being a crew member instead of a stranger changes how little room that swing leaves for a body standing where the machine already claimed the ground.",
    "buffer-graze": "You swung the bucket past the buffer flag toward the nesting closure instead of stopping the arc at the line. The buffer is not there because the map says so — it is there because a bird low in dense cover cannot get up and clear a bucket that is already over it, and the CDFW streambed alteration agreement and the Endangered Species Act buffer both assume the operator stops the swing at the flag, not somewhere past it once the bucket is already swinging back.",
    "manual-mat-lift": "You went to muscle a ground mat into place solo instead of walking it in with the second hand. A timber mat this size is a wet, unbalanced load with no clean grip anywhere on it, and a back is not rated for a load like that lifted alone — it goes in on two sets of hands or it does not go in this pass.",
    "spoil-in-water": "You swung the loaded bucket out over the open water instead of into the marked containment bins. Every cubic yard this machine lifts off the bench is spoil the 404 and 401 permits account for landing in a bin with a liner under it, not material dumped at the water's edge where the next tide carries it straight back into the reach the whole job exists to restore.",
  },

  lateNotes: {
    "swing-boom": "The swing pass starts only after the ground mats are down — swinging the machine onto unmatted ground is exactly the sinking the mats exist to prevent.",
    "laser-adjust": "Set the laser level after the machine is staged on the mats, not before — a reading taken before the rig settles onto its pontoons is not the grade it will actually cut from.",
    "bucket-tamp": "Tamp the grade only after the laser reading confirms the cut — tamping ahead of the reading just compacts a grade nobody has checked yet.",
  },

  // Interruptions: see shared/game.js. The first is the tide doing what the
  // tide does on its own schedule; the second is the reason the buffer flag
  // is there at all, made real in the moment the swing is closest to it.
  interrupts: [
    {
      id: "tide-flooding-grade",
      kind: "Tide flooding the grading zone early",
      after: "grade-check", delay: 4, seconds: 14,
      alert: "The flat is going under sooner than the table said, and the tide staff at the water's edge already reads past the working line.",
      cue: "Read the staff at the water's edge, not the table — the grading window just got shorter than planned.",
      target: "tide-staff",
      why: "A tide table is a prediction, and wind and pressure push the real water by tens of minutes either way on an ordinary afternoon; the staff gauge is the one reading of where the water actually is right now, and it is what tells the crew whether there is still bench left to cut or whether the machine needs to be off it before the pontoons are floating instead of grading.",
      missNote: "The crew kept cutting to the table's schedule while the real tide came in around the pontoons, and the last pass went in with the toe of the bench already underwater — a grade nobody can now confirm was cut to the design elevation instead of guessed at through a few inches of water.",
      wrongNote: "That is not it. The tide staff at the water's edge is the only true reading of where the water actually is right now — nothing else on this bench tells you that.",
    },
    {
      id: "rail-flushed-from-buffer",
      kind: "Ridgway's rail flushed from the buffer",
      after: "swing-boom", delay: 3, seconds: 12,
      alert: "A Ridgway's rail broke cover at the edge of the buffer flag, close enough that the boom's swing arc already passes within a few feet of where it went to ground.",
      cue: "Stop the swing now on the estop. Nothing moves through that arc while a rail is on the ground beside it.",
      target: "swing-estop",
      why: "A rail flushed from cover next to a working swing arc is the buffer doing exactly the job it was set out for — proof a bird was closer to the machine than the map's line accounted for — and the swing stops at the estop the moment that is seen, not once the operator finishes the pass already under way toward it.",
      missNote: "The swing kept moving through the arc past the flushed bird, and the boom crossed ground inside the buffer before anyone reached the estop. A federally listed species startled by a moving boom is not a near miss the Endangered Species Act or the CDFW streambed agreement treats as harmless because the bucket itself never touched anything.",
      wrongNote: "It's the swing estop. Nothing else on this machine stops the boom moving through the arc before it reaches the buffer.",
    },
  ],

  steps: [
    {
      id: "check-in", kind: "select", target: "permit-board",
      title: "Check the permit conditions and the work window before the machine moves",
      cue: "Read the Corps' 404 conditions, the 401 certification, the BCDC permit, the CDFW streambed agreement, and the work window before anything is staged.",
      why: "A tidal bench like this one is worked under five signatures at once — the Corps' Section 404 permit, the Water Board's 401 certification, BCDC's own permit, California Department of Fish and Wildlife's streambed alteration agreement, and a work window set by the permit itself — and missing any one of those conditions is not paperwork to fix later, it is a cut that has to be answered for or undone.",
    },
    {
      id: "stage-ppe", kind: "sequence", anyOrder: true,
      targets: ["stage-hardhat", "stage-hi-vis", "stage-hearing"],
      itemNames: { "stage-hardhat": "hard hat", "stage-hi-vis": "high-visibility vest", "stage-hearing": "hearing protection" },
      title: "Stage the ground crew's PPE",
      cue: "Hard hat, high-visibility vest and hearing protection before anyone works near the running machine.",
      why: "A ground crew works within feet of a swinging counterweight and a running diesel all day, and none of that changes because the machine floats instead of tracking on dry ground — the vest is what lets the operator see a person against the mud at any distance, the hard hat is for whatever the boom or a mat corner finds on the way down, and hearing protection is for the engine noise nobody notices is a problem until the day it already was one.",
    },
    {
      id: "find-stakes", kind: "find", noHint: true,
      targets: ["grade-stake-1", "grade-stake-2", "grade-stake-3"],
      itemNames: { "grade-stake-1": "grade stake 1 — near end", "grade-stake-2": "grade stake 2 — mid-bench", "grade-stake-3": "grade stake 3 — far end" },
      itemNotes: {
        "grade-stake-1": "Stake 1 marks the near end of the design cut. The bench is graded from here, not from wherever the ground looks roughly level this morning.",
        "grade-stake-2": "Stake 2 is the mid-bench control — the check that the cut is still following the surveyed line and not drifting off it a pass at a time.",
        "grade-stake-3": "Stake 3 marks the far end. Past it, whatever the bucket cuts is not part of the permitted design and does not count toward it.",
      },
      title: "Find the survey stakes that set the design cut",
      cue: "Walk the bench and click the three stakes the grading design is built from.",
      why: "The laser, the mats, the swing arc and the spoil bins are all set against stakes a surveyor already placed, not against where the bench looks right from the cab. Finding all three before the machine moves is what keeps a whole afternoon of cutting building the one permitted design instead of four honest guesses at it.",
    },
    {
      id: "swing-check", kind: "select", target: "swing-flag",
      title: "Confirm the swing radius and the buffer are both flagged",
      cue: "Check the swing radius cones and the buffer flag line before the machine is powered up.",
      why: "Once the boom is under power, the swing radius belongs to the machine and the buffer belongs to the rail nesting inside it — both lines have to be checked and flagged while everything is still still, because neither one is a call anybody gets to make once the counterweight is already moving.",
    },
    {
      id: "mats-place", kind: "drag", target: "ground-mat",
      title: "Lay the ground mats ahead of the pontoons",
      cue: "Carry the mat out and set it on the marked line before the machine advances onto that stretch of bench.",
      why: "A pontoon spreads the machine's weight over a wide hull, but the softest stretches of this bench still take a mat under it or the pontoon settles in far enough to need its own recovery — laying the mat first is what keeps the machine crawling instead of digging itself out of the ground it was built to work on top of.",
      drag: { to: "mat-line", radius: 0.5, missNote: "Not on the line — the mat has to sit under the pontoon's actual path or it is doing nothing for the ground on either side of it." },
    },
    {
      id: "laser-adjust", kind: "turn", target: "laser-adjust",
      title: "Set up the grade laser transmitter",
      cue: "Level the laser transmitter on its tripod and dial it to the design elevation.",
      why: "Every cut this machine makes today is judged against one laser reference, not against the operator's eye from the cab — a transmitter that is not level or not dialed to the design elevation turns a whole pass of careful bucket work into a grade that reads wrong no matter how smoothly it was cut.",
      turn: { turns: 0.8, axis: "y", label: "LASER LEVEL" },
    },
    {
      id: "swing-boom", kind: "track", target: "swing-boom", seconds: 7,
      title: "Swing the boom through the grading arc",
      cue: "Work the swing at a controlled rate across the bench, staying inside the arc short of the buffer flag.",
      why: "A steady swing rate is what lets the operator stop the house exactly at the buffer line every single pass; swing too fast and the boom's own momentum carries it past where the controls said to stop, swing too slow and the machine is burning the tide window on a pass that should have closed already.",
      track: { start: 0.1, green: [0.36, 0.58], rise: 0.55, fall: 0.45, drift: 0.12, label: "SWING", readout: (v) => (v < 0.36 ? "stalled short of the cut" : v > 0.58 ? "swinging too fast to stop clean" : "controlled swing") },
      holdBreakNote: "The swing broke off the rate and the boom drifted off its arc. Bring it back to a controlled rate before it reaches the buffer line.",
    },
    {
      id: "grade-check", kind: "gauge", target: "laser-receiver",
      title: "Check the cut against the laser reference",
      cue: "Read the receiver rod against the design elevation and commit the reading.",
      why: "The receiver is the only honest measure of whether the last pass actually reached the design elevation or only looked close from the cab — reading it before the next pass is what keeps a whole bench from being cut a hand's width high or low and only discovered once the tide is back over it.",
      gauge: { label: "GRADE", speed: 0.72, green: [0.42, 0.6], readout: (t) => `${(t * 1.8).toFixed(2)} m MLLW`, missNote: "Off the design elevation. Read the receiver again at the marked point before the next pass goes in." },
    },
    {
      id: "bucket-tamp", kind: "hold", target: "bucket-tamp", seconds: 5,
      title: "Tamp the grade flat with the bucket",
      cue: "Hold the bucket flat against the cut bench and finish the surface to grade.",
      why: "A cut bench left loose settles unevenly under the first tide that covers it; held flat and worked until the surface reads even, it settles the way the design elevation assumed it would instead of into whatever low spots the loose material happens to find on its own.",
      holdBreakNote: "The bucket lifted before the surface finished flat — reset it against the cut and hold until the grade reads even.",
    },
    {
      id: "spoil-place", kind: "sequence", anyOrder: true,
      targets: ["spoil-bin-1", "spoil-bin-2", "spoil-bin-3"],
      itemNames: { "spoil-bin-1": "spoil bin — near", "spoil-bin-2": "spoil bin — mid", "spoil-bin-3": "spoil bin — far" },
      title: "Load the spoil into the containment bins",
      cue: "Swing each bucket load into whichever lined bin is closest, not into a pile on the bank.",
      why: "The bins are lined and covered specifically because the permits treat cut spoil as material that has to be tracked and hauled off the bench, not material that can sit on the bank until the next rain finds it — there is no order to loading them, only three bins that all have to hold the day's cut instead of the bank holding it for them.",
    },
    {
      id: "spotter-checkin", kind: "select", target: "spotter-radio",
      title: "Check in with the ground spotter before repositioning",
      cue: "Call the spotter on the radio and get a clear signal before backing or swinging into a new position.",
      why: "The spotter is the operator's blind-spot vision on a machine whose cab does not see straight behind the counterweight or past the far pontoon — repositioning without that call is repositioning on the operator's own guess about ground the spotter was placed there specifically to watch instead.",
    },
    {
      id: "walk-hazards", kind: "find", noHint: true,
      targets: ["pinch-point-flag", "blind-spot-cone"],
      itemNotes: {
        "pinch-point-flag": "This flag marks a pinch point at the pontoon's articulation point that a hand could still reach into while the machine sits idling — click it to confirm the crew has kept clear.",
        "blind-spot-cone": "This cone sits in the operator's blind spot behind the counterweight, exactly where nobody should be standing while the machine is powered.",
      },
      title: "Walk the bench and confirm the crew is clear of the machine",
      cue: "Check the pinch point and the blind spot before the machine is shut down for the day.",
      why: "The two places on this machine most likely to catch a hand or a body are also the two places easiest to forget once the grading itself is done — walking them now, machine still idling, is the last chance to catch a crew habit that a shutdown checklist alone will not.",
    },
    {
      id: "log-grading", kind: "select", target: "closing-log",
      title: "Log the day's grading",
      cue: "Record the bench cut, the laser readings, the spoil hauled, and the buffer status for the crew's record.",
      why: "The next crew on this bench reads today's log, not today's memory of it — a grading run that was clean but never logged looks, from tomorrow's map, exactly like a bench nobody has touched yet, and a buffer status that was never written down is a fact the next shift has no way to confirm on its own.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, AMX_ACCENT);

    // ---------------------------------------------------------------- terrain
    // Upland staging pad toward +z, a wide marsh bench where the machine
    // actually works, mudflat and open water toward -z — sized generously
    // in X so the pontoon machine's own length reads at its real scale.
    const upland = box(g, 6.4, 0.3, 1.5, 0, 0.15, 2.05, 0x5a4a34, { rough: 0.96 });
    void upland;
    const padTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#4a4a4c", base2: "#3d3d40", seam: "rgba(0,0,0,0.4)" }), { repeat: 4, px: 256 });
    const pad = box(g, 6.4, 0.02, 1.5, 0, 0.311, 2.05, 0x4a4a4c, { rough: 0.9, cast: false });
    pad.material = texturedMat(padTex, { rough: 0.9, color: 0x9a9a9e });

    const slopeA = box(g, 6.4, 0.34, 0.55, 0, 0.13, 1.18, 0x4d3f2c, { rough: 0.96 });
    slopeA.rotation.x = 0.32;
    const bench = box(g, 6.4, 0.12, 2.6, 0, 0.06, -0.35, 0x4f4632, { rough: 0.95 });
    void bench;
    const mudTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#5a4a30", base2: "#463a24", cracks: 30, pools: 5 }), { repeat: 4, px: 256 });
    const mudflat = box(g, 6.4, 0.05, 1.2, 0, 0.025, -2.0, 0x5a4a30, { rough: 0.95, cast: false });
    mudflat.material = texturedMat(mudTex, { rough: 0.95, color: 0x8a7a58 });

    const waterTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#1c4a52"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 26; i++) {
        cx.strokeStyle = "rgba(180,220,225,0.10)"; cx.lineWidth = 1 + Math.random() * 2;
        cx.beginPath(); const y = Math.random() * h;
        cx.moveTo(0, y); cx.bezierCurveTo(w * 0.25, y + 16, w * 0.75, y - 16, w, y); cx.stroke();
      }
    }, { repeat: 4, px: 256 });
    const water = box(g, 6.4, 0.03, 0.9, 0, 0.012, -2.9, 0x1c4a52, { rough: 0.2, metal: 0.3, opacity: 0.88, transparent: true, cast: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x2c6a72 });
    water.material.transparent = true;
    water.material.opacity = 0.88;
    const wave = particles(g, 24, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.4 });
    wave.position.set(0, 0.03, -3.0);

    // -------------------------------------------------------- upland station
    const permitBoard = holoPanel(g, 0.95, 0.64, -2.3, 1.1, 2.25, (cx, w, h) => {
      cx.fillStyle = "#0d1c14"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5f9e5a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff3d8"; cx.fillText("PERMIT CONDITIONS — BENCH 4", w * 0.06, h * 0.11);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#e7f7e0";
      ["USACE CWA §404 permit — this bench", "RWQCB CWA §401 water quality cert.", "BCDC permit — bay fill / restoration",
       "CDFW streambed alteration agreement", "Rail buffer + work window per permit"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.27 + i * 0.1)));
    }, { ry: 0.4, accent: AMX_ACCENT });
    reg(hits, permitBoard, "permit-board");

    const chest = toolChest(g, 2.4, 2.05, { color: 0x2f6f4a });
    for (const [id, dx, color, label] of [["stage-hardhat", -0.2, 0xe8b02e, "HARD HAT"], ["stage-hi-vis", 0.0, 0xf2ae14, "HI-VIS"], ["stage-hearing", 0.2, 0x2f4d3a, "HEARING"]]) {
      const it = group(chest, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#0d1c14", accent: "#dff3d8", scale: 0.42 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const crewUpland = standingFigure(g, 2.9, 1.55, { ry: -0.9, cloth: 0x2f4d3a, vest: 0xe8b02e });
    void crewUpland;

    // Tide staff at the water's edge.
    const staff = group(g, 2.55, 0.02, -2.55);
    box(staff, 0.07, 0.9, 0.03, 0, 0.45, 0, 0xf2f6fa, { rough: 0.7 });
    for (let i = 1; i < 9; i++) box(staff, 0.07, 0.01, 0.032, 0, i * 0.1, 0.002, i % 3 === 0 ? 0xd2312b : 0x1b1e23, { rough: 0.7, cast: false });
    holoTag(staff, "tide staff — read it, not the table", 0, 1.05, 0, { css: "#5f9e5a", w: 0.5 });
    reg(hits, staff, "tide-staff");

    // ---------------------------------------------------------- survey stakes
    for (const [id, x, label] of [["grade-stake-1", -2.1, "STAKE 1"], ["grade-stake-2", -0.1, "STAKE 2"], ["grade-stake-3", 1.9, "STAKE 3"]]) {
      const st = group(g, x, 0.05, -0.5);
      cyl(st, 0.012, 0.014, 0.5, 0, 0.25, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
      box(st, 0.09, 0.06, 0.01, 0, 0.46, 0, 0xe8622a, { rough: 0.75 });
      decal(st, 0.08, 0.04, 0, 0.46, 0.006, signFace(label, { bg: "#1b1e12", accent: "#dff3d8", scale: 0.55 }));
      reg(hits, st, id);
    }

    // ------------------------------------------------------- swing radius / buffer
    const swingFlagGrp = group(g, -1.55, 0.02, -1.5);
    cyl(swingFlagGrp, 0.01, 0.012, 0.4, 0, 0.2, 0, 0xc9b58c, { rough: 0.9, seg: 6 });
    box(swingFlagGrp, 0.08, 0.05, 0.006, 0, 0.36, 0, 0xf2ae14, { rough: 0.7 });
    holoTag(swingFlagGrp, "swing radius flagged", 0, 0.58, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, swingFlagGrp, "swing-flag");
    for (const [x, z] of [[-2.4, -1.9], [-0.6, -2.1], [0.9, -1.2]]) cone(g, x, z, { color: 0xf2ae14 });
    const swingRadiusHit = box(g, 0.5, 0.4, 0.5, -1.0, 0.2, -1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk into the swing radius?", -1.0, 0.5, -1.1, { css: "#e8622a", w: 0.5 });
    reg(hits, swingRadiusHit, "swing-radius-enter");

    const bufferFlagGrp = group(g, 1.5, 0.02, -2.1);
    cyl(bufferFlagGrp, 0.012, 0.014, 0.45, 0, 0.22, 0, 0xc9b58c, { rough: 0.9, seg: 6 });
    box(bufferFlagGrp, 0.09, 0.06, 0.006, 0, 0.4, 0, AMX_FLAG, { rough: 0.7 });
    holoTag(bufferFlagGrp, "rail buffer — no swing past here", 0, 0.62, 0, { css: "#5f9e5a", w: 0.5 });
    const bufferGrazeHit = box(g, 0.4, 0.4, 0.4, 2.0, 0.3, -2.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "swing the bucket past the buffer?", 2.0, 0.6, -2.3, { css: "#e8622a", w: 0.5 });
    reg(hits, bufferGrazeHit, "buffer-graze");

    // ------------------------------------------------------------- ground mats
    const matStaged = group(g, -2.6, 0.06, 1.0);
    box(matStaged, 0.9, 0.1, 0.55, 0, 0.05, 0, 0x6a5636, { rough: 0.9 });
    for (let i = 0; i < 4; i++) box(matStaged, 0.9, 0.02, 0.01, 0, 0.1 + i * 0.001, -0.26 + i * 0.17, 0x4a3c26, { rough: 0.9, cast: false });
    holoTag(matStaged, "ground mat — staged", 0, 0.32, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, matStaged, "ground-mat");
    const matLine = group(g, -1.5, 0.06, -0.6);
    hits["mat-line"] = matLine;
    const matHazardHit = box(g, 0.3, 0.3, 0.3, -2.6, 0.4, 1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    void matHazardHit;
    const manualLiftHit = box(g, 0.3, 0.3, 0.3, -2.9, 0.3, 0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "muscle the mat in solo?", -2.9, 0.6, 0.55, { css: "#e8622a", w: 0.42 });
    reg(hits, manualLiftHit, "manual-mat-lift");

    // ------------------------------------------------------- amphibious excavator
    const machine = amphibiousExcavator(g, 0.3, 0.08, -1.35, {
      ry: -0.28,
      livery: { colour: 0xc9a227, fleetName: "WETLAND RESTORATION", unitNumber: "AEX-1" },
    });
    const { house, boom, stick, bucket, door } = machine.userData.parts;
    void boom; void stick;
    reg(hits, house, "swing-boom");
    reg(hits, bucket, "bucket-tamp");
    const swingEstop = box(machine, 0.08, 0.08, 0.06, 1.1, 1.55, -0.1, 0xd2312b, { rough: 0.55 });
    holoTag(machine, "swing estop", 1.1, 1.75, -0.1, { css: "#5f9e5a", w: 0.32 });
    reg(hits, swingEstop, "swing-estop");
    void door;

    const spoilInWaterHit = box(g, 0.4, 0.4, 0.4, -0.2, 0.3, -2.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "swing the load over the water?", -0.2, 0.6, -2.7, { css: "#e8622a", w: 0.44 });
    reg(hits, spoilInWaterHit, "spoil-in-water");

    // Blind spot cone and pinch point flag, close to the machine.
    const blindSpotCone = cone(g, -1.6, -0.7, { color: 0xf2ae14 });
    void blindSpotCone;
    const blindSpotHit = box(g, 0.22, 0.3, 0.22, -1.6, 0.15, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, blindSpotHit, "blind-spot-cone");
    const pinchFlag = group(g, 0.85, 0.05, -0.35);
    cyl(pinchFlag, 0.008, 0.008, 0.3, 0, 0.15, 0, 0xc9b58c, { rough: 0.9, seg: 6 });
    box(pinchFlag, 0.06, 0.04, 0.006, 0, 0.28, 0, 0xf2ae14, { rough: 0.7 });
    reg(hits, pinchFlag, "pinch-point-flag");

    // ------------------------------------------------------------ laser + grade
    const laserPost = group(g, 1.7, 0.1, 0.55);
    cyl(laserPost, 0.02, 0.024, 1.0, 0, 0.5, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    const laserWheelGrp = group(laserPost, 0, 0.95, 0);
    const laserWheel = valveWheel(laserWheelGrp, 0, 0.08, 0, { r: 0.07, color: 0x5f9e5a, body: 0x2b5a6a });
    holoTag(laserPost, "laser level adjust", 0, 1.25, 0, { css: "#5f9e5a", w: 0.42 });
    reg(hits, laserWheel.userData.wheel, "laser-adjust");

    const laserRod = group(g, 0.55, 0.08, -1.0);
    cyl(laserRod, 0.014, 0.014, 1.1, 0, 0.55, 0, 0xf2f6fa, { rough: 0.6, seg: 8 });
    for (let i = 1; i < 10; i++) box(laserRod, 0.05, 0.01, 0.03, 0, i * 0.11, 0.017, i % 5 === 0 ? 0xd2312b : 0x1b1e23, { rough: 0.7, cast: false });
    const gradeReadout = instrument(laserRod, 0.12, 0.5, 0, { idle: "-- m", color: 0x5f9e5a, w: 0.12, d: 0.18 });
    holoTag(laserRod, "laser receiver", 0, 1.2, 0, { css: "#5f9e5a", w: 0.3 });
    reg(hits, laserRod, "laser-receiver");

    // ---------------------------------------------------------------- spoil bins
    for (const [id, x] of [["spoil-bin-1", -2.7, ], ["spoil-bin-2", -1.9], ["spoil-bin-3", -1.1]]) {
      const bin = group(g, x, 0.08, 1.65);
      box(bin, 0.5, 0.35, 0.4, 0, 0.175, 0, 0x3c444c, { rough: 0.6, metal: 0.4 });
      slab(bin, 0.52, 0.03, 0.42, 0, 0.365, 0, 0x2b3138, { radius: 0.02, rough: 0.6 });
      holoTag(bin, "spoil bin", 0, 0.55, 0, { css: "#5f9e5a", w: 0.24 });
      reg(hits, bin, id);
    }

    // ------------------------------------------------------------- spotter + radio
    const spotter = standingFigure(g, -1.1, -1.85, { ry: 1.6, cloth: 0x2b3138, vest: 0xe8622a });
    const radioProp = group(spotter, 0.14, 0.9, 0.05);
    box(radioProp, 0.05, 0.11, 0.03, 0, 0, 0, 0x1b1e23, { rough: 0.7 });
    holoTag(spotter, "spotter — radio check-in", 0, 1.85, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, radioProp, "spotter-radio");

    // --------------------------------------------------------------- closing log
    const logTable = group(g, 2.4, 0.311, -0.05, -0.3);
    box(logTable, 0.5, 0.02, 0.35, 0, 0.01, 0, 0x565656, { rough: 0.7, cast: false });
    const logDecal = decal(logTable, 0.3, 0.4, 0, 0.021, 0, paperFace("GRADING LOG", ["Bench cut / design elevation", "Laser + mix readings", "Spoil hauled, bin counts", "Buffer status — clean / crossed"], { scale: 0.85 }));
    logDecal.rotation.x = -Math.PI / 2;
    holoTag(logTable, "log the grading", 0, 0.3, 0, { css: "#5f9e5a", w: 0.38 });
    reg(hits, logDecal, "closing-log");

    cone(g, -3.0, 2.4, { color: AMX_ACCENT });
    cone(g, 3.0, 2.4, { color: AMX_ACCENT });
    barrierPanel(g, 0, 2.5, { color: 0xe8b02e });

    let bucketTamping = false, laserAdjustAmount = 0;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, 0.4),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "mats-place") { /* mat visually stays in place; the deployed marker is the station itself */ }
        if (step.id === "spoil-place") { /* bins read complete via the checklist itself */ }
      },

      // Both interruptions really change the scene: the tide rises visibly
      // against the machine's pontoons, and the estop lights up while the
      // house swing actually halts.
      onInterrupt(it) {
        if (it.id === "tide-flooding-grade") {
          water.position.z += 0.4;
          water.scale.x = 1.18;
        }
        if (it.id === "rail-flushed-from-buffer") {
          swingEstop.material = mat(0xffee55, { emissive: 0xffee55, ei: 1.6, rough: 0.4 });
          bucketTamping = false;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "tide-flooding-grade") {
          water.position.z -= 0.4;
          water.scale.x = 1.0;
        }
        if (it.id === "rail-flushed-from-buffer") {
          swingEstop.material = mat(0xd2312b, { rough: 0.55 });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, 0.02, -3.2), 1.4, 0.35, -0.1);
        water.position.y = 0.012 + Math.sin(t * 1.2) * 0.006;

        const step = session?.step;
        if (step?.id === "swing-boom" && session.track) {
          house.rotation.y = (session.track.v - 0.5) * 1.1;
        }
        if (step?.id === "bucket-tamp") {
          bucketTamping = !!session.holding;
        }
        if (bucketTamping) bucket.position.y = -2.1 + Math.sin(t * 6) * 0.03;
        else if (step?.id !== "swing-boom") bucket.position.y = -2.1;

        if (step?.id === "laser-adjust" && session.turn) laserAdjustAmount = session.turn.amount;
        laserWheelGrp.rotation.y = -laserAdjustAmount * Math.PI * 2;

        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "grade-check") {
          repaint(gradeReadout.userData.screen, signFace(`${(gg.t * 1.8).toFixed(2)} m`, { bg: "#0d1c14", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff3d8", scale: 0.6 }));
        }
      },
    };
  },
};
