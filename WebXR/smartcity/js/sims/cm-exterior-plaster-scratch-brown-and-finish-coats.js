import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, cone,
  reg, surfaceTexture, texturedMat, plasterFace, concreteFace, gratingFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Exterior Plaster Scratch, Brown & Finish Coats VR — Cement
// masons and plasterers, station four.
//
// An OPCMIA plasterer crew building a three-coat exterior wall on wire lath:
// the wall walked for torn lath, a missing weep screed and an unsecured
// scaffold plank before a bag is opened, the scratch coat batched, hawked on
// and horizontally scored, the brown coat straightened true, and the finish
// coat floated to its texture — each coat waiting its own cure before the
// next goes on. Coat thicknesses, cure windows and mix proportions are the
// plaster specification's and the manufacturer's data sheet, never a number
// this file invents.

const CMPL_ACCENT = 0xf2c14b;
const CMPL_CSS = "#f2c14b";
const CMPL_PAL = palette("construction");

export const SIM_CM_EXTERIOR_PLASTER_SCRATCH_BROWN_AND_FINISH_COATS = {
  id: "cm-exterior-plaster-scratch-brown-and-finish-coats",
  index: "703",
  domain: "Construction & Structural Trades",
  trade: "Plasterer — OPCMIA Local 300",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "OPCMIA Local 300 plasterer apprenticeship as a training body; OSHA 29 CFR 1926 Subpart Q concrete and masonry construction; OSHA 29 CFR 1926 Subpart L scaffolds, as applied to the plastering scaffold; OSHA 29 CFR 1926.1153 respirable crystalline silica for dry plaster mix; ANSI/ASSP A10.9 concrete and masonry construction safety requirements; the plaster specification and the manufacturer's data sheet for coat thickness and cure time",
  name: "Exterior Plaster Scratch, Brown & Finish Coats",
  title: simTitle("Exterior Plaster Scratch, Brown & Finish Coats"),
  tagline: "A three-coat exterior wall built right: the lath and the weep screed walked before a bag opens, the scaffold plank secured, the scratch coat batched and scored, the brown coat straightened true, the finish coat floated to its texture, each coat waiting its own cure, and the wall logged and cured before the crew signs off",
  accent: CMPL_ACCENT,
  accentCss: CMPL_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "three-coats-true", name: "Three Coats, True", note: "Scratch, brown and finish built on sound lath, each cured on schedule, with nobody's hand in the mixer or a boot on an unsecured plank" },

  supportLine: "your OPCMIA Local 300 member assistance programme, or the employee assistance line posted on the contractor's site board",

  game: system({
    name: "Plaster Crew",
    currency: "COAT",
    ranks: ["Laborer", "Hawk Hand", "Plasterer", "Lead Plasterer", "Plaster Crew Certified"],
    badges: [
      { id: "walked-the-wall", name: "Walked The Wall", note: "The lath walk found the torn mesh and the missing weep screed before a bag opened, first time", test: AWARD.stepClean("lath-walk") },
      { id: "never-in-the-mixer", name: "Never In The Mixer", note: "Never reached into a running mixer, never a bare hand in the mix, never worked an unsecured plank, never dry-dumped a bag", test: AWARD.safe },
      { id: "true-on-the-rod", name: "True On The Rod", note: "The batch proportions and the brown coat flatness both held inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-build", name: "Clean Build", note: "No corrections through all three coats", test: AWARD.clean },
      { id: "held-the-scratch", name: "Held The Scratch", note: "The scratch-coat application held for the whole wall", test: AWARD.unbroken },
      { id: "wall-by-break", name: "Wall By Break", note: "All three coats built, textured and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-hand-plaster": "You went to hawk and trowel the coat without gloves. Wet plaster is strongly alkaline the same as concrete and mortar, and it burns skin slowly, often without pain until hours later — a plasterer's hand is in contact with it for the whole coat. Gloves stay on for every minute a coat is wet.",
    "dry-dump-bag": "You tipped the bag into the mixer dry and from height instead of feeding it in low with the water already running. Dry plaster mix thrown into the air puts respirable crystalline silica into the crew's breathing zone at many times the permissible limit; water first, the bag opened low, is how the silica rule's wet methods reach a plasterer's own mixer, not only a saw.",
    "unsecured-scaffold": "You stepped out onto the scaffold plank that has not been secured. An unsecured plank can shift, kick out or tip the moment weight comes onto its unsupported end, and OSHA's scaffold rule exists because a plasterer working a wall from height has nothing under a shifting plank to catch a fall. The plank is checked and secured before anyone's weight goes on it.",
    "mixer-reach-in": "You reached into the mixer to break up a clump while the paddle was still turning. A mortar mixer's paddle keeps moving on its own momentum even after the motor is cut, and a hand that follows a clump into the tub follows it straight into the paddle. The mixer is shut off and the paddle confirmed stopped before anyone's hand goes near the tub.",
  },

  lateNotes: {
    "hawk-trowel": "The scratch coat only goes on once the lath is sound and the weep screed is in — plastering over torn lath just buries a defect the wall will crack along later.",
    "darby": "The brown coat only goes on once the scratch coat has taken its cure; troweling brown over a scratch coat that has not set enough pulls the whole build off the lath.",
    "float-tool": "The finish coat only goes on once the brown coat has cured and been checked flat — texturing over a brown coat that is still out of flat just texture-matches the wall's own waves.",
  },

  steps: [
    {
      id: "plaster-card", kind: "select", target: "plaster-card",
      title: "Read the plaster specification",
      cue: "Read the lath type, the coat thicknesses for scratch, brown and finish, the cure window between coats, and the finish texture called for.",
      why: "A three-coat exterior wall is built to a specification that sets a thickness and a minimum cure time for every coat, because each coat has to gain enough strength to carry the next one without cracking or debonding from it. None of that is a plasterer's call to shorten on site — the specification is read before the first bag opens so the whole build follows the same schedule.",
    },
    {
      id: "lath-walk", kind: "find", noHint: true,
      targets: ["torn-lath", "missing-weep-screed", "loose-plank"],
      itemNames: { "torn-lath": "torn wire lath", "missing-weep-screed": "a run of wall with no weep screed", "loose-plank": "a scaffold plank not secured" },
      itemNotes: {
        "torn-lath": "A section of the wire lath has been torn loose from its furring, with nothing for the scratch coat to key into along that whole strip.",
        "missing-weep-screed": "The base of the wall has no weep screed set at the foundation line — without it, moisture behind the finished wall has nowhere to drain back out.",
        "loose-plank": "One scaffold plank is resting on its supports with nothing securing it — a plasterer's weight at the wrong point kicks it out from under him.",
      },
      title: "Walk the wall before a bag opens",
      cue: "Walk the lath, the base of the wall and the scaffold, and click every defect you find.",
      why: "With nothing on the hawk yet, the lath gets patched, the screed gets set and the plank gets secured in a few minutes each. Miss that window and the same three things become a wall that cracks along its torn lath for the rest of its service life, moisture with nowhere to weep trapped behind a finished surface, and a fall from a plank nobody ever secured.",
    },
    {
      id: "fix", kind: "sequence", anyOrder: true,
      targets: ["patch-lath", "set-weep-screed", "secure-plank"],
      itemNames: { "patch-lath": "lath patched", "set-weep-screed": "weep screed set", "secure-plank": "plank secured" },
      title: "Correct what the walk found",
      cue: "Patch the torn lath, set the weep screed, and secure the loose plank.",
      why: "A note about torn lath or a loose plank that never gets acted on is more dangerous than never having checked, since the crew now works the wall and the scaffold on the assumption both were already handled. Only patching the lath, actually setting the screed and physically securing the plank turns that assumption into something true before the mixer starts.",
    },
    {
      id: "mix-ratio", kind: "gauge", target: "gauge-box",
      title: "Batch the scratch coat to the specification's proportions",
      cue: "Fill the gauge box against the bag and commit when the proportions match the specification for the scratch coat.",
      why: "Plaster strength and workability come from its proportions the same as mortar does, and the specification names them for a reason: too lean and the coat is weak and crumbles off the lath, too rich and it shrinks and cracks as it dries. Batching by the gauge box instead of by feel is how every batch comes out the same coat.",
      gauge: { label: "MIX", speed: 0.7, green: [0.42, 0.58], readout: (t) => (t < 0.42 ? "lean — too much sand" : t <= 0.58 ? "on the specification's proportions" : "rich — too much cement"), missNote: "Off the specification's proportions — level the sand in the gauge box and check it against the bag again." },
    },
    {
      id: "bag-dump", kind: "hold", target: "paddle-mixer", seconds: 5,
      title: "Mix with water first, paddle down in the tub",
      cue: "Put the water in the tub first, feed the bag in low, and hold the paddle down in the batch so the dust stays wet.",
      why: "Dry plaster mix thrown into the air from a bag tipped at height, or spun in a dry tub, puts respirable crystalline silica into the crew's breathing zone. Water in first, the bag opened low and the paddle held down in the batch keeps the dust wet and in the tub, the same wet-methods principle the silica rule applies anywhere dry masonry material gets handled.",
      holdBreakNote: "The paddle came up out of the batch and threw dry mix into the air. Put it back down in the tub and hold it.",
    },
    {
      id: "hawk-scratch", kind: "drag", target: "hawk-trowel",
      title: "Apply the scratch coat",
      cue: "Carry the hawk and trowel to the wall and apply the scratch coat to the lath at the specification's thickness.",
      why: "The scratch coat is what actually keys into the lath and gives the wall its first structural bond to the framing behind it — applied thin or spotty, the coats above it have nothing sound to hang on to no matter how well they are finished later.",
      drag: { to: "scratch-zone", radius: 0.6, missNote: "Not on the wall — the scratch coat has to go on the lath, at the specification's thickness, not on the ground." },
    },
    {
      id: "scratch-tool", kind: "turn", target: "scratch-tool",
      title: "Score the scratch coat horizontally",
      cue: "Draw the scratcher across the fresh coat in horizontal lines while it is still plastic enough to score.",
      why: "The horizontal scoring is what gives the brown coat something to mechanically key into, on top of whatever chemical bond the two coats form on their own — a scratch coat troweled smooth and left unscored is a much weaker joint for the brown coat to grip.",
      turn: { turns: 1, label: "SCRATCH" },
    },
    {
      id: "scratch-cure", kind: "gauge", target: "cure-check",
      title: "Wait out the scratch coat's cure",
      cue: "Watch the surface and commit once the scratch coat has firmed enough to carry the brown coat without pulling off the lath.",
      why: "Troweling the brown coat onto a scratch coat that has not set enough pulls the whole build loose from the lath in sheets, and a build that debonds at the lath is a build that has to come off and start over. The cure window is short but it is not zero, and it is watched, not guessed at.",
      gauge: { label: "SCRATCH CURE", speed: 0.62, green: [0.5, 0.68], readout: (t) => (t < 0.5 ? "still green — wait" : t > 0.68 ? "gone too far — rewet the surface" : "ready for the brown coat"), missNote: "Too early pulls the coat off the lath, too late and the bond needs rewetting — wait for the window and commit there." },
    },
    {
      id: "hawk-brown", kind: "drag", target: "darby",
      title: "Apply and straighten the brown coat",
      cue: "Carry the darby to the wall, apply the brown coat over the cured scratch coat and straighten it true.",
      why: "The brown coat is what actually brings the wall to a flat, true plane — every wave or dip the darby does not straighten out here is a wave the finish coat can only follow, never correct, since finish is a texture, not a leveling coat.",
      drag: { to: "brown-zone", radius: 0.6, missNote: "Not on the wall — the brown coat goes over the cured scratch coat, straightened with the darby, not left as it was troweled on." },
    },
    {
      id: "brown-flatness", kind: "gauge", target: "straightedge",
      title: "Check the brown coat for flatness",
      cue: "Draw the straightedge across the brown coat and commit once it reads flat to the specification's tolerance.",
      why: "A brown coat that is out of flat telegraphs straight through a trowelled or floated finish coat, because finish texture has no thickness to spare for correcting a wave underneath it. The straightedge is the only check that catches it while the coat is still plastic enough to correct.",
      gauge: { label: "FLATNESS", speed: 0.66, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "low spot under the edge" : t <= 0.6 ? "flat to the specification" : "high spot under the edge"), missNote: "Out of flat — mark the spot and straighten it with the darby again before it sets." },
    },
    {
      id: "finish-float", kind: "hold", target: "float-tool", seconds: 5,
      title: "Float the finish coat to texture",
      cue: "Hold the float against the finish coat and work it in the specification's texture pattern.",
      why: "The finish coat is the wall everyone sees and touches for the life of the building, and the float's pattern — worked evenly across the whole wall rather than started and stopped at different times of day — is what keeps the texture reading as one wall instead of a patchwork of however the plasterer happened to be working that hour.",
      holdBreakNote: "The float lifted mid-pass and the texture broke pattern. Reset at the edge of the last clean pass and hold it steady again.",
    },
    {
      id: "close-out", kind: "select", target: "close-log",
      title: "Log the wall",
      cue: "Record the lath patched, the coats batched and cured on schedule, and the texture finished.",
      why: "The plaster log is how the foreman and the inspector both know this wall was built to the specification's schedule rather than pushed through it — the lath that was patched, the cure windows that were actually watched, and the mixer clump that got cleared the right way instead of by hand.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the foreman",
      cue: "Call the foreman: wall built and logged. Then check in with the crew about the plank and the mixer.",
      why: "This call decides how the foreman moves the scaffold and schedules the next wall's coats, so it needs the real version of the day, not the tidy one. A plank shifted underfoot and a mixer jammed with a hand close by — both get said plainly, and so does the fact that the OPCMIA member assistance line exists for exactly the kind of shift that leaves someone shaken afterward.",
    },
  ],

  interrupts: [
    {
      id: "plank-shifts",
      kind: "Scaffold plank shifting underfoot",
      after: "hawk-scratch", delay: 2, seconds: 12,
      alert: "The scaffold plank under the hawk hand has started to shift as he reaches for the far end of the wall.",
      cue: "Latch the plank's clamp before he shifts his weight again.",
      target: "plank-clamp",
      why: "A plank that has already started to shift is one more reach away from kicking out from under whoever is standing on it, and there is nothing below a plastering scaffold to catch that fall. The clamp secures the plank to its bearer immediately, which is the only fix that works from where the crew is actually standing, not a general note to be careful.",
      missNote: "The plank kept shifting under his boots through the rest of the reach; it slid a hand's width off its bearer before anyone reached the clamp.",
      wrongNote: "The plank clamp — a plank already shifting underfoot has to be secured before more weight shifts onto it, not just watched.",
    },
    {
      id: "mixer-jam",
      kind: "Mixer jammed, paddle still turning",
      after: "bag-dump", delay: 2, seconds: 12,
      alert: "The mixer has jammed on a clump of dry mix and a laborer is reaching toward the tub with the paddle still turning inside it.",
      cue: "Hit the mixer's emergency stop before his hand reaches the tub.",
      target: "mixer-estop",
      why: "A jammed mixer's paddle is still carrying the motor's torque against whatever is blocking it, and a hand that follows a clump into the tub follows it into a paddle that can still move the instant the jam breaks free. The emergency stop cuts power immediately, which is the only thing that reaches the mixer faster than a hand already moving toward it.",
      missNote: "The laborer's hand was inches from the tub when the jam broke free and the paddle kicked through the clump; he pulled back a moment too late for it to matter as a near miss.",
      wrongNote: "The mixer's emergency stop — a hand is already moving toward a jammed, still-turning paddle, and the mixer has to be killed before it reaches the tub.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CMPL_ACCENT);
    const ground = box(g, 8.6, 0.04, 6.6, 0, 0.02, -0.3, 0xffffff);
    ground.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom", tone: "#8f8b80", tone2: "#838075" }), { repeat: 4, px: 512 }), { rough: 0.95, color: 0xd8d3c4 });

    // ------------------------------------------------------------- the wall, lath, weep screed
    const wall = group(g, 0, 0.02, -2.2);
    const lathTex = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, { base: "#8a8c86", base2: "#7d7f78", cell: w / 24 }), { repeat: 4, px: 512 }), { rough: 0.7, color: 0xc9c6ba });
    const lathWall = box(wall, 6.4, 2.6, 0.06, 0, 1.3, 0, 0xffffff);
    lathWall.material = lathTex;
    const tornLath = box(wall, 1.0, 0.6, 0.04, -2.2, 1.9, 0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tornLath, "torn-lath");
    holoTag(wall, "torn wire lath", -2.2, 2.3, 0.05, { css: CMPL_CSS, w: 0.3 });

    const screedRun = box(wall, 4.0, 0.04, 0.08, 1.2, 0.06, 0.05, CMPL_PAL.trim, { rough: 0.5, metal: 0.4 });
    void screedRun;
    const noScreedHit = box(wall, 1.4, 0.15, 0.15, -1.8, 0.06, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(wall, "wall with no weep screed", -1.8, 0.3, 0.1, { css: CMPL_CSS, w: 0.4 });
    reg(hits, noScreedHit, "missing-weep-screed");
    const screedSupply = group(wall, -1.8, 0.02, 0.5, 0.2);
    box(screedSupply, 1.0, 0.03, 0.06, 0, 0.015, 0, CMPL_PAL.trim, { rough: 0.5, metal: 0.4 });
    holoTag(screedSupply, "set the weep screed", 0, 0.2, 0, { css: CMPL_CSS, w: 0.3 });
    reg(hits, screedSupply, "set-weep-screed");
    const lathPatch = group(wall, -2.2, 0.02, 0.4, 0.2);
    box(lathPatch, 0.5, 0.4, 0.02, 0, 0.2, 0, 0x8a8c86, { rough: 0.7 });
    holoTag(lathPatch, "patch the lath", 0, 0.44, 0, { css: CMPL_CSS, w: 0.28 });
    reg(hits, lathPatch, "patch-lath");

    // Coat layers: scratch (grey broom), brown (buff smooth), finish (plaster).
    const scratchTex = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom", tone: "#9a978c", tone2: "#8d8a7f" }), { repeat: 3, px: 512 }), { rough: 0.9, color: 0xe0dccf });
    const scratchCoat = box(wall, 6.3, 2.5, 0.02, 0, 1.3, 0.04, 0xffffff);
    scratchCoat.material = scratchTex;
    scratchCoat.scale.y = 0.02;
    scratchCoat.visible = false;
    const brownTex = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#c9b98c", tone2: "#bcac7e" }), { repeat: 2, px: 512 }), { rough: 0.75, color: 0xf0e6cc });
    const brownCoat = box(wall, 6.3, 2.5, 0.03, 0, 1.3, 0.06, 0xffffff);
    brownCoat.material = brownTex;
    brownCoat.scale.y = 0.02;
    brownCoat.visible = false;
    const finishTex = texturedMat(surfaceTexture((cx, w, h) => plasterFace(cx, w, h, { base: "#e4dfd0", base2: "#d9d3c2" }), { repeat: 2, px: 512 }), { rough: 0.8, color: 0xf6f1e2 });
    const finishCoat = box(wall, 6.3, 2.5, 0.04, 0, 1.3, 0.08, 0xffffff);
    finishCoat.material = finishTex;
    finishCoat.visible = false;

    const scratchZoneHit = box(wall, 6.4, 2.6, 0.3, 0, 1.3, 0.1, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["scratch-zone"] = scratchZoneHit;
    const brownZoneHit = box(wall, 6.4, 2.6, 0.3, 0, 1.3, 0.12, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["brown-zone"] = brownZoneHit;
    const scratchToolHit = box(wall, 0.4, 0.2, 0.2, 1.0, 1.6, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(wall, "scratch tool", 1.0, 1.9, 0.1, { css: CMPL_CSS, w: 0.24 });
    reg(hits, scratchToolHit, "scratch-tool");
    const straightedge = box(g, 1.2, 0.03, 0.06, 1.6, 1.5, -1.1, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    holoTag(g, "straightedge", 1.6, 1.7, -1.1, { css: CMPL_CSS, w: 0.24 });
    reg(hits, straightedge, "straightedge");
    const floatTool = box(g, 0.4, 0.03, 0.16, 2.4, 1.4, -1.1, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    holoTag(g, "finish float", 2.4, 1.6, -1.1, { css: CMPL_CSS, w: 0.24 });
    reg(hits, floatTool, "float-tool");
    const cureCheck = instrument(g, -0.6, 0.9, -1.4, { idle: "--", color: CMPL_CSS, w: 0.14, d: 0.22, ry: 0.4 });
    holoTag(g, "cure check", -0.6, 1.15, -1.4, { css: CMPL_CSS, w: 0.22 });
    reg(hits, cureCheck, "cure-check");

    const bareHandHit = box(wall, 0.5, 0.3, 0.2, 2.6, 1.4, 0.12, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(wall, "trowel it bare-handed?", 2.6, 1.7, 0.12, { css: "#d2312b", w: 0.4 });
    reg(hits, bareHandHit, "bare-hand-plaster");

    // ------------------------------------------------------------- scaffold
    const scaffold = group(g, -3.4, 0.02, -1.6, 0.5);
    for (const x of [-1.0, 1.0]) { cyl(scaffold, 0.035, 0.035, 1.7, x, 0.85, 0, CMPL_PAL.trim, { rough: 0.5, metal: 0.5, seg: 8 }); cyl(scaffold, 0.035, 0.035, 1.7, x, 0.85, 0.6, CMPL_PAL.trim, { rough: 0.5, metal: 0.5, seg: 8 }); }
    const plank = box(scaffold, 2.2, 0.04, 0.3, 0, 1.5, 0.3, 0xc6a26a, { rough: 0.85 });
    plank.rotation.z = 0.06;
    reg(hits, plank, "loose-plank");
    holoTag(scaffold, "unsecured plank", 0, 1.75, 0.3, { css: CMPL_CSS, w: 0.32 });
    const clamp = box(scaffold, 0.1, 0.06, 0.1, -1.0, 1.5, 0.3, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    holoTag(scaffold, "plank clamp", -1.0, 1.66, 0.3, { css: CMPL_CSS, w: 0.24 });
    reg(hits, clamp, "plank-clamp");
    const plankSecureHit = box(scaffold, 0.3, 0.1, 0.3, 1.0, 1.5, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(scaffold, "secure the plank", 1.0, 1.68, 0.3, { css: CMPL_CSS, w: 0.28 });
    reg(hits, plankSecureHit, "secure-plank");
    const unsecuredHit = box(scaffold, 2.2, 0.3, 0.3, 0, 1.75, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(scaffold, "step out on it now?", 0, 1.95, 0.3, { css: "#d2312b", w: 0.4 });
    reg(hits, unsecuredHit, "unsecured-scaffold");

    // ------------------------------------------------------------- mixer, gauge box, tools
    const mixerGroup = group(g, 2.6, 0.02, 1.6);
    const tub = cyl(mixerGroup, 0.35, 0.3, 0.32, 0, 0.16, 0, 0x2b2b2b, { rough: 0.8, seg: 16 });
    void tub;
    const batch = cyl(mixerGroup, 0.32, 0.32, 0.02, 0, 0.28, 0, 0x9a968c, { rough: 0.95, seg: 16 });
    const mixerPaddle = cyl(mixerGroup, 0.05, 0.32, 0.02, 0, 0.2, 0, 0x8b949d, { rough: 0.4, metal: 0.7, seg: 6 });
    holoTag(mixerGroup, "paddle mixer — hold", 0, 0.78, 0, { css: CMPL_CSS, w: 0.32 });
    reg(hits, mixerPaddle, "paddle-mixer");
    const mixerReachHit = box(mixerGroup, 0.3, 0.1, 0.3, -0.2, 0.32, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mixerGroup, "clear the jam by hand?", -0.3, 0.5, 0.3, { css: "#d2312b", w: 0.42 });
    reg(hits, mixerReachHit, "mixer-reach-in");
    const estop = box(mixerGroup, 0.08, 0.08, 0.03, 0.4, 0.5, 0, 0xd2312b, { rough: 0.5, metal: 0.3 });
    holoTag(mixerGroup, "mixer emergency stop", 0.4, 0.66, 0, { css: CMPL_CSS, w: 0.32 });
    reg(hits, estop, "mixer-estop");
    const dryDumpHit = box(mixerGroup, 0.4, 0.3, 0.3, 0.2, 0.6, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mixerGroup, "tip the bag in dry from height?", 0.2, 0.9, -0.3, { css: "#d2312b", w: 0.46 });
    reg(hits, dryDumpHit, "dry-dump-bag");

    const gaugeBox = group(g, 1.3, 0.02, 1.9, -0.3);
    box(gaugeBox, 0.5, 0.25, 0.35, 0, 0.125, 0, 0x8a6a42, { rough: 0.9 });
    const sand = box(gaugeBox, 0.44, 0.02, 0.29, 0, 0.12, 0, 0xc9b27a, { rough: 0.95 });
    box(gaugeBox, 0.25, 0.1, 0.18, 0.4, 0.05, 0, 0xd8d2c0, { rough: 0.9 });
    holoTag(gaugeBox, "gauge box — proportions", 0, 0.45, 0, { css: CMPL_CSS, w: 0.38 });
    reg(hits, gaugeBox, "gauge-box");

    const hawk = group(g, 3.0, 0.02, -1.4, 0.3);
    box(hawk, 0.35, 0.02, 0.35, 0, 0.9, 0, 0xdfe6ec, { rough: 0.4, metal: 0.6 });
    cyl(hawk, 0.02, 0.02, 0.3, 0, 1.06, 0, 0x8a6a42, { rough: 0.85, seg: 8 });
    holoTag(hawk, "hawk and trowel", 0, 1.25, 0, { css: CMPL_CSS, w: 0.3 });
    reg(hits, hawk, "hawk-trowel");
    const darby = group(g, 3.4, 0.02, -1.7, 0.3);
    box(darby, 0.9, 0.03, 0.1, 0, 1.0, 0, 0xdfe6ec, { rough: 0.4, metal: 0.6 });
    holoTag(darby, "darby", 0, 1.2, 0, { css: CMPL_CSS, w: 0.22 });
    reg(hits, darby, "darby");

    // ------------------------------------------------------------- cards, log, radio, crew
    const board = group(g, -2.6, 0.02, 2.0, 0.1);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#22201a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = CMPL_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#efeade"; ctx.fillText("PLASTER SPEC — WALL W4", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f7f4ec";
      ["Lath: paper-backed wire, per the plan", "Coat thickness: per the specification", "Cure window between coats: per the data sheet", "Finish texture: per the specification"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { accent: CMPL_ACCENT });
    reg(hits, board, "plaster-card");

    const log = group(g, -1.9, 0.02, 2.0, -0.1);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.62, 0.44, 0, 1.3, 0.01, signFace("PLASTER LOG —\nWALL W4", { bg: "#171108", accent: CMPL_CSS, fg: "#efeade", scale: 0.3 }), { px: 384, glow: true, ei: 0.6 });
    holoTag(log, "plaster log", 0, 1.62, 0, { css: CMPL_CSS, w: 0.22 });
    reg(hits, log, "close-log");
    const crewRadio = group(g, -1.3, 0.02, 2.2, -0.2);
    box(crewRadio, 0.1, 0.18, 0.06, 0, 0.09, 0, 0x2b2f34, { rough: 0.6 });
    crewRadio.userData.screen = decal(crewRadio, 0.08, 0.05, 0, 0.15, 0.031, signFace("—", { bg: "#0d1c24", accent: CMPL_CSS, fg: "#bfeaf7", scale: 0.5 }), { px: 128, glow: true, ei: 0.6 });
    holoTag(crewRadio, "crew radio", 0, 0.3, 0, { css: CMPL_CSS, w: 0.2 });
    reg(hits, crewRadio, "crew-radio");

    const plasterer = standingFigure(g, 1.6, -0.4, { ry: 2.6, cloth: 0x4a4038, vest: CMPL_PAL.accent, helmet: 0xf2f2f2, gloves: true });
    holoTag(plasterer, "plasterer", 0, 1.9, 0, { css: CMPL_CSS, w: 0.22 });
    const laborer = standingFigure(g, 2.2, 1.3, { ry: -0.4, cloth: 0x5a4a3a, vest: 0xd8f23a, helmet: 0xf2f2f2, atStation: true });
    laborer.visible = false;
    for (const [x, z] of [[3.6, 2.2], [-3.8, 0.4]]) cone(g, x, z);

    // ------------------------------------------------------------- yard dressing
    // A stacked pallet of bagged plaster mix, a spare-parts rack and a coil
    // of extra hose — ordinary storage a plastering crew keeps at hand.
    const yard = group(g, 3.4, 0.02, 2.6, 0.3);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) box(yard, 0.3, 0.1, 0.2, -0.75 + c * 0.32, 0.06 + r * 0.11, 0, r % 2 ? 0xd8d2c0 : 0xc9c2b0, { rough: 0.9 });
    const partsRack = group(g, -3.8, 0.02, 0.6, -0.3);
    box(partsRack, 0.7, 0.05, 0.35, 0, 0.9, 0, CMPL_PAL.trim, { rough: 0.6, metal: 0.5 });
    for (let i = 0; i < 5; i++) cyl(partsRack, 0.02, 0.02, 0.55, -0.28 + i * 0.14, 0.55, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 6 });

    let dustP;
    dustP = particles(g, 30, 0xd8d2c4, { size: 0.03, life: 0.8, additive: false, opacity: 0.35 });
    const dustOrigin = new THREE.Vector3(2.6, 0.5, 1.6);

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.4, -1.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "fix") { tornLath.visible = false; noScreedHit.visible = false; screedRun.material = screedRun.material.clone(); screedRun.material.color.set(0x59c97b); }
        if (step.id === "hawk-scratch") { scratchCoat.visible = true; scratchCoat.scale.y = 1; }
        if (step.id === "hawk-brown") { brownCoat.visible = true; brownCoat.scale.y = 1; }
        if (step.id === "finish-float") { finishCoat.visible = true; }
        if (step.id === "close-out") repaint(log.userData.face, signFace("PLASTER LOG —\nBUILT + CURED", { bg: "#171108", accent: "#59c97b", fg: "#d8f5e0", scale: 0.26 }));
        if (step.id === "crew-checkin") repaint(crewRadio.userData.screen, signFace("WALL W4 DONE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "plank-shifts") plank.rotation.z = 0.22;
        if (it.id === "mixer-jam") { laborer.visible = true; dustP.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "plank-shifts") plank.rotation.z = 0;
        if (it.id === "mixer-jam") { laborer.visible = false; dustP.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "mix-ratio") sand.scale.y = 1 + gg.t * 6;
        if (step?.id === "bag-dump" && session.holding) mixerPaddle.rotation.y = t * 20;
        if (gg && !gg.committed && step?.id === "scratch-cure") repaint(cureCheck.userData.screen, signFace(gg.t < 0.5 ? "GREEN" : gg.t > 0.68 ? "REWET" : "READY", { bg: "#22201a", accent: gg.t >= 0.5 && gg.t <= 0.68 ? "#59c97b" : "#f2ae14", fg: "#f7f4ec", scale: 0.5 }));
        if (session?.turn && step?.id === "scratch-tool") scratchCoat.position.z = 0.04 + Math.sin(session.turn.amount * Math.PI * 8) * 0.002;
        void CITY;
      },
    };
  },
};
