import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, hose, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, barrierPanel,
  reg, surfaceTexture, texturedMat, deckPlateFace, pavingFace, paintedSteelFace,
} from "../citykit.js";
import { pickup } from "../../../shared/fleet.js";
import { impactWrench, torqueWrench, radio, hammer } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Structural Bolting & Torque VR — Bridge and Structural Trades.
//
// A plate-girder field splice on a highway bridge, bolted up by an
// Ironworkers bolting crew from a scaffold platform at the splice: the web and
// flange splice plates fitted with drift pins, filled with high-strength
// bolts, snugged from the stiff middle outward, match-marked and turned by the
// turn-of-nut method, the flange splice run up with a calibrated wrench, the
// marks read by the inspector and the splice logged. The bridge is generic;
// every tension, rotation and pressure is "per the bolt spec", never a number
// this file made up.

const BST_ACCENT = 0x7fa8c9;
const BST_CSS = "#7fa8c9";
const BST_DECK = 0.3;          // the scaffold platform the crew bolts from
const BST_GZ = -1.45;          // the girder web's plane

export const SIM_BS_STRUCTURAL_BOLTING_AND_TORQUE = {
  id: "bs-structural-bolting-and-torque",
  index: "318",
  domain: "Construction & Structural Trades",
  trade: "Ironworker — structural bolting crew on a bridge girder field splice",
  category: "Construction & Structural Trades",
  weather: "overcast",
  certification: "Ironworkers IMPACT apprenticeship bolting and connecting practice; the RCSC Specification for Structural Joints Using High-Strength Bolts (snug-tight, pretensioned and slip-critical joints, pre-installation verification, turn-of-nut and calibrated wrench installation, inspection); the AISC Code of Standard Practice for Steel Buildings and Bridges; AASHTO bridge construction practice for girder field splices; OSHA 29 CFR 1926 Subpart R steel erection and 29 CFR 1926.451 scaffolds; ANSI Z359 fall protection",
  name: "Structural Bolting & Torque",
  title: simTitle("Structural Bolting & Torque"),
  tagline: "A girder field splice bolted to the spec: fasteners checked, the calibrated wrench set in the tension calibrator, drift pins and fit-up, snug-tight from the middle out, match marks, turn-of-nut with a back-up wrench, the flange splice run at the calibrated pressure, a spun bolt found and replaced, and the inspector's marks logged",
  accent: BST_ACCENT,
  accentCss: BST_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "tensioned-to-spec", name: "Tensioned To Spec", note: "Every bolt in the splice snug, marked, turned and inspected the way the bolt spec says — and the one that spun found before the inspector did" },

  supportLine: "your Ironworkers local's member assistance programme, or the employee assistance line posted on the contractor's site board",

  game: system({
    name: "Bolt-Up Crew",
    currency: "BOLT",
    ranks: ["Apprentice", "Bolter", "Connector", "Bolting Foreman", "Splice Certified"],
    badges: [
      { id: "marks-tell-the-truth", name: "Marks Tell The Truth", note: "The spun bolt found by reading the match marks, first look", test: AWARD.stepClean("mark-find") },
      { id: "steady-air", name: "Steady Air", note: "Line pressure held at the calibrated setting throughout", test: AWARD.unbroken },
      { id: "no-fingers-in-holes", name: "No Fingers In Holes", note: "No finger in a hole, no step onto the flange untied, no reused bolt, no lean through the gap", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-splice", name: "Clean Splice", note: "No corrections anywhere in the splice", test: AWARD.clean },
      { id: "calibrated-first-time", name: "Calibrated First Time", note: "The wrench set inside the band on the first reading", test: AWARD.precise(0.7) },
      { id: "bolted-by-break", name: "Bolted By Break", note: "Splice logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "finger-in-hole": "You went to feel whether the holes lined up by putting a finger through them. Two plies of splice plate that are not yet pinned can shift the width of a hole the moment the girder settles on its falsework or a connector leans on the other side, and when they do the steel shears whatever is in the hole. Alignment is checked with a drift pin or by eye, never by a finger.",
    "untied-on-flange": "You went to step up onto the girder's top flange with your lanyard still clipped to the platform rail. Up there the only thing between you and the ground is the flange's own width, and OSHA's steel erection rule puts a connector working at that height under fall protection the whole time. The lanyard goes to the beam strap first, then the boots go onto the steel.",
    "reused-bolts": "You reached for the bucket of bolts backed out of yesterday's splice. A high-strength bolt that has been pretensioned has been stretched along its threads, and the RCSC Specification does not allow some grades to be reused at all and the rest only with the engineer's approval. A bolt that has been tensioned once is not a new bolt with a good-looking thread.",
    "missing-midrail": "You leaned out over the gap in the guardrail where the midrail has been pulled to pass steel through. A scaffold platform this high is required to have its guardrail complete, top rail and midrail, and a missing midrail is exactly the opening a worker leaning to reach a bolt slides through. It gets replaced, or the gap gets chained, before anyone works beside it.",
  },

  lateNotes: {
    "impact-wrench": "The joint is snugged once every hole has a bolt in it and the drift pins are out — snugging around a pin locks the misalignment in.",
    "nut-socket": "The nut is turned once it is match-marked and the back-up wrench is on the head — without the mark nobody can prove the rotation, and without the back-up the bolt spins with the nut.",
    "splice-log": "The splice is logged once the inspector has read the marks — before that there is nothing to record but intentions.",
  },

  steps: [
    {
      id: "bolt-spec", kind: "select", target: "bolt-spec",
      title: "Read the connection drawing and the bolt spec",
      cue: "Read the splice detail: joint type, bolt grade and length, the installation method, the faying-surface class, and the rotation and tension the spec calls for.",
      why: "A field splice is designed as one of three kinds of joint — snug-tight, pretensioned or slip-critical — and the RCSC Specification installs and inspects each one differently. A slip-critical flange splice relies on the clamping force squeezing clean steel together, so its faying surfaces, its pretension and its inspection all follow from that one line on the drawing. Bolting from habit instead of the detail is how a bearing-type routine ends up on a joint the engineer designed to carry load by friction.",
    },
    {
      id: "fastener-find", kind: "find", noHint: true,
      targets: ["rusty-keg", "mixed-lot-nuts", "painted-faying"],
      itemNames: {
        "rusty-keg": "bolts left open to the weather, rusted and dry",
        "mixed-lot-nuts": "a box of nuts from a different lot than the bolts",
        "painted-faying": "paint overspray on a slip-critical faying surface",
      },
      itemNotes: {
        "rusty-keg": "This keg was left open overnight and the bolts are rusted and dry. The lubricant on a high-strength assembly is part of how it reaches tension: washed off, the same rotation or wrench setting gives less clamp. They go back for cleaning and relubrication under the maker's direction, or they are rejected.",
        "mixed-lot-nuts": "The nuts in this box carry a different lot number from the bolts beside them. Pre-installation verification is done on assemblies from the lots actually going in, so an unverified lot mixed in is an assembly nobody has tested.",
        "painted-faying": "The flange splice plate has a mist of primer across its contact face. A slip-critical joint is designed for a specific surface class, and paint the engineer did not specify turns that friction into a lubricated slide. It is cleaned back to the specified surface before the plate goes on.",
      },
      title: "Check the fasteners and the faying surfaces before anything goes in",
      cue: "Look over the bolt kegs, the nut boxes and the splice plates: storage, lot markings, and anything on a contact face that should not be there.",
      why: "High-strength bolts fail their specification quietly, in the keg, before anyone picks up a wrench: rust and lost lubricant change the torque-tension relationship, a mixed lot has never been through the calibrator, and paint on a slip-critical surface removes the friction the joint was designed on. The RCSC Specification puts storage, lot control and surface condition ahead of installation for exactly that reason — the wrench cannot make up for any of them later.",
    },
    {
      id: "calibrate", kind: "gauge", target: "bolt-calibrator",
      title: "Verify the assemblies and set the calibrated wrench in the tension calibrator",
      cue: "Run sample assemblies from today's lots in the bolt tension calibrator and set the wrench's cut-out so it stalls at the verification tension the spec requires.",
      why: "Pre-installation verification is the one test that proves today's bolts, nuts, washers and wrench actually produce the tension the joint needs: a representative sample from each lot goes into the tension calibrator, and the calibrated wrench's setting is adjusted until the calibrator reads the spec's verification figure. The setting is only true for these lots, this wrench and this air supply, which is why it is redone daily and whenever any of them changes.",
      gauge: {
        label: "CALIBRATOR", speed: 0.7, green: [0.46, 0.62],
        readout: (t) => (t < 0.46 ? "below the spec's verification tension" : t <= 0.62 ? "at the verification tension" : "past it — back the setting off"),
        missNote: "Off the verification tension — a wrench set low under-tensions every bolt it touches, set high it risks stretching them past what the spec allows. Read the calibrator again.",
      },
    },
    {
      id: "fit-up", kind: "sequence",
      targets: ["drift-pins", "bolt-bag", "spud-hammer"],
      itemNames: { "drift-pins": "drift pins driven in the corner holes", "bolt-bag": "bolts in every open hole", "spud-hammer": "drift pins knocked out and replaced with bolts" },
      outOfOrderNote: "Pins first to line the holes up, then bolts in every open hole, and only then do the pins come out — pull a pin before the bolts are in and the plies slide back out of line.",
      title: "Fit up the splice: pins, bolts, then swap the pins",
      cue: "Drive drift pins through the corner holes to bring the plies into line, fill every open hole with a bolt and hand-tight nut, then knock the pins out and bolt those holes too.",
      why: "Drift pins align the holes; they are not fasteners, and a drift pin driven hard enough to distort a hole damages the plate the joint depends on. The pins hold the plies in line while bolts go in every other hole, and they come out last, one at a time, with a bolt going straight into each hole — so the joint is never left held by nothing but the friction of plate that has not been clamped.",
    },
    {
      id: "snug", kind: "turn", target: "impact-wrench",
      title: "Snug the joint from the stiffest part outward",
      cue: "Run each bolt up snug with the impact wrench, working from the middle of the splice out toward the free edges, until the plies are drawn into firm contact.",
      why: "Snug-tight is the condition where the plies are in firm contact, and it has to be reached systematically from the most rigid part of the joint toward its free edges. Snug the outside bolts first and the plate between them bows, so the middle bolts close a gap instead of clamping steel, and every rotation measured from that false snug starts from the wrong place. On a splice this size it can take more than one pass before the whole joint is truly snug.",
      turn: { turns: 1, label: "SNUG", readout: (t) => (t < 0.4 ? "plies gapped" : t < 0.95 ? "drawing together" : "firm contact") },
    },
    {
      id: "match-mark", kind: "select", target: "paint-marker",
      title: "Match-mark every snug bolt",
      cue: "Draw a straight mark across each nut, the bolt end and the steel beside it, so the rotation from snug can be seen afterward.",
      why: "Turn-of-nut pretension comes from rotating the nut a set amount past snug, and a match mark is the only record of where snug was. The line across the nut, the bolt end and the plate lets the bolter see the rotation as it happens and lets the inspector confirm it afterward — and if the bolt end and the nut have moved together, the mark shows a bolt that spun instead of stretching.",
    },
    {
      id: "backup", kind: "hold", target: "backup-wrench", seconds: 5,
      title: "Hold the back-up wrench on the bolt head",
      cue: "Set the back-up wrench on the bolt head and hold it steady so the head cannot turn while the nut is rotated.",
      why: "Turn-of-nut only works if the element not being turned is held still. A bolt head free to follow the nut turns the whole assembly as a unit, the bolt never stretches, and the match mark rotates across the steel as if the bolt were tensioned when it is not. The back-up wrench is held for the whole rotation, not tapped on and taken off.",
      holdBreakNote: "The back-up wrench came off the head mid-turn — the bolt can spin with the nut and nothing is stretched. Put it back and hold it.",
    },
    {
      id: "turn-of-nut", kind: "turn", target: "nut-socket",
      title: "Rotate each nut the spec's amount from snug",
      cue: "Turn each nut past snug by the rotation the spec's table gives for this bolt length, in the same middle-out pattern, watching the match mark move.",
      why: "The rotation past snug is what stretches the bolt into its pretension: the spec's table ties it to the bolt's length relative to its diameter and to the slope of the faces it bears on, which is why it comes off the drawing and not from memory. Worked in the same pattern as the snug pass, the rotation closes the joint evenly, and the match mark shows each bolt's rotation to anyone who looks.",
      turn: { turns: 1, label: "TURN-OF-NUT", readout: (t) => (t < 0.95 ? "rotating from the match mark" : "rotation per the spec table") },
    },
    {
      id: "air-pressure", kind: "track", target: "air-regulator", seconds: 6,
      title: "Hold the line pressure at the calibrated setting on the flange splice",
      cue: "The flange splice is run up with the calibrated wrench: keep the air at the pressure it was calibrated at while the crew works along the flange.",
      why: "A calibrated wrench is only calibrated at the air pressure and hose length it was set at in the calibrator. Let the line pressure sag as another tool draws on the compressor and the wrench stalls early, leaving bolts under their pretension with nothing on the steel to show it; let it climb and the wrench overshoots. The pressure is watched at the regulator for the whole run, because this method's accuracy lives there.",
      track: { start: 0.2, green: [0.4, 0.6], rise: 0.58, fall: 0.48, drift: 0.13, label: "LINE PRESSURE", readout: (v) => (v < 0.4 ? "sagging — wrench stalls early" : v > 0.6 ? "high — wrench overshoots" : "at the calibrated setting") },
      holdBreakNote: "The line pressure left the calibrated band while the wrench was running — the bolts run in that window are suspect. Bring it back and hold it.",
    },
    {
      id: "mark-find", kind: "find", noHint: true,
      targets: ["spun-bolt"],
      itemNames: { "spun-bolt": "a bolt whose end and nut turned together" },
      itemNotes: { "spun-bolt": "On this one the match mark across the nut and the bolt end has rotated as one line, and the mark on the plate has not moved relative to them — the bolt spun in the hole with the nut, and it was never stretched." },
      title: "Read the match marks across the whole splice",
      cue: "Walk the splice reading every mark: nut rotated against the bolt end and the steel, the same way on every bolt.",
      why: "The match marks are the only honest record a turn-of-nut joint has: a bolt that spun with its nut looks tight, sounds tight and rotated the right amount, but its mark shows the nut and the bolt end still lined up with each other. The crew reads every bolt before calling the inspector, because the one that did not stretch is invisible any other way.",
    },
    {
      id: "replace-bolt", kind: "drag", target: "new-assembly",
      title: "Replace the spun bolt with a new assembly",
      cue: "Take the spun bolt out and carry a new assembly from the verified box to its hole; it is snugged, marked and turned like the rest.",
      drag: { to: "spun-bolt", radius: 0.35, missNote: "Not in the spun bolt's hole — carry the new assembly to the bolt the marks gave away." },
      why: "A bolt that spun may have galled its threads or been partly tensioned and relaxed, and the spec limits whether a tensioned bolt can go back in. The clean fix is a new assembly from a lot that went through the calibrator, installed through the same snug, mark and rotation as its neighbours, so the joint is uniform again and the replacement is on the record.",
    },
    {
      id: "inspect", kind: "select", target: "inspection-stamp",
      title: "Have the inspector witness the marks and stamp the splice",
      cue: "Walk the inspector along the splice: the calibrator record, the marks on every bolt, and the replaced assembly.",
      why: "Inspection of a turn-of-nut joint is observation, not re-torquing: the inspector checks that pre-installation verification was done, watches the method being used, and reads the marks on the finished bolts. A splice nobody but the crew has seen is a splice the next trade has to take on trust, and the inspector's stamp is the point where the joint stops being the bolting crew's claim.",
    },
    {
      id: "splice-log", kind: "select", target: "splice-log",
      title: "Log the splice",
      cue: "Record the bolt lots, the calibrator verification, the installation method, the replaced bolt, the rain on the kegs and the inspector's acceptance.",
      why: "The bolting log is how the owner, the engineer and the next inspection know this splice was installed to the spec rather than assumed from its appearance: which lots went in, what the calibrator read that morning, which method, which bolt was replaced and why. Written on the platform it is the record; written in the trailer at the end of the week it is a recollection.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the foreman",
      cue: "Call the foreman: splice inspected and logged, drop zone reopened. Then check in with the crew about the painter who walked in under the work.",
      why: "The foreman plans the next splice and the painting crew's return around this call, so the drop zone only reopens when the platform is clear of loose steel. It is also the crew's check-in: people walking under a bolting platform is the kind of near miss that stays with the bolter who saw it, and the trade's practice is to say it out loud on the radio and name the member assistance line with it.",
    },
  ],

  interrupts: [
    {
      id: "rain-on-kegs",
      kind: "Rain on open bolt kegs",
      after: "backup", delay: 2, seconds: 12,
      alert: "It has started to rain, and the keg of verified bolts you are drawing from is sitting open on the platform.",
      cue: "Get the lid on the keg before the lubricant washes off the bolts.",
      target: "keg-lid",
      why: "The lubricant on a high-strength assembly is part of the tension it reaches: rain washing it off changes the torque-tension relationship the calibrator verified this morning. The RCSC Specification keeps fasteners protected from moisture until they are installed, and a lid on the keg now saves re-verifying or rejecting the lot.",
      missNote: "The keg stayed open in the rain for the rest of the turn-of-nut pass; the bolts at the top went in wet and dry of lubricant, and nobody could now say what tension the same rotation gave them.",
      wrongNote: "The keg lid — the rain is on the bolts now, and every minute washes a little more of the lubricant off.",
    },
    {
      id: "painters-in-drop-zone",
      kind: "Workers under the platform",
      after: "air-pressure", delay: 2, seconds: 13,
      alert: "A painting crew's truck has pulled in and a painter is setting up his gear on the ground right under the splice you are bolting.",
      cue: "Close the drop zone barricade and get him out from under the work.",
      target: "drop-zone-barricade",
      why: "A bolting platform drops things: a nut, a drift pin, a spud wrench knocked off the flange. OSHA's steel erection rule keeps workers out from under overhead bolting unless they are protected, and a closed barricade is the only drop-zone control that works on people who did not hear the radio.",
      missNote: "The painter worked under the splice for the whole calibrated-wrench run; a nut knocked off the flange hit the ground a metre from his bucket, and nobody on the platform saw it land.",
      wrongNote: "The drop-zone barricade — the people under the work are the emergency, not the bolt in front of you.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BST_ACCENT);

    // ------------------------------------------------ ground, platform, rails
    const ground = box(g, 9.0, 0.04, 7.0, 0, 0.02, -1.0, 0xffffff);
    ground.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#4a4d4f", base2: "#3f4244" }), { repeat: 5, px: 512 }), { rough: 0.95, color: 0xc4c4c0 });
    const deck = box(g, 6.2, BST_DECK, 3.0, 0, BST_DECK / 2, 0.55, 0xffffff);
    deck.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#6b6f70", base2: "#5f6364", step: 48 }), { repeat: 4, px: 512 }), { rough: 0.7, metal: 0.4, color: 0xd0d0cc });
    // Scaffold legs under the platform.
    for (const x of [-2.9, 0, 2.9]) for (const z of [-0.85, 1.95]) box(g, 0.05, BST_DECK, 0.05, x, BST_DECK / 2, z, 0x9aa3ab, { rough: 0.5, metal: 0.6 });
    // Guardrail on the girder side, with the midrail missing over one bay.
    const railY = [BST_DECK + 1.05, BST_DECK + 0.55];
    for (const x of [-3.0, -1.5, 0, 1.5, 3.0]) cyl(g, 0.022, 0.022, 1.08, x, BST_DECK + 0.54, -0.9, 0xf2c14b, { rough: 0.6, metal: 0.4, seg: 8 });
    box(g, 6.0, 0.04, 0.04, 0, railY[0], -0.9, 0xf2c14b, { rough: 0.6, metal: 0.4 });
    box(g, 4.5, 0.04, 0.04, -0.75, railY[1], -0.9, 0xf2c14b, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1, 1]) {
      box(g, 0.04, 0.04, 2.9, sx * 3.05, railY[0], 0.55, 0xf2c14b, { rough: 0.6, metal: 0.4 });
      box(g, 0.04, 0.04, 2.9, sx * 3.05, railY[1], 0.55, 0xf2c14b, { rough: 0.6, metal: 0.4 });
    }
    const gap = box(g, 1.3, 0.5, 0.2, 2.25, BST_DECK + 0.55, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lean through the missing midrail?", 2.25, BST_DECK + 1.3, -0.85, { css: "#d2312b", w: 0.6 });
    reg(hits, gap, "missing-midrail");

    // ------------------------------------------------ the girder and the splice
    const webMat = texturedMat(surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#7c858a", base2: "#6f787d", cols: 6, rows: 2, pitch: 18 }), { repeat: 1, px: 512 }), { rough: 0.55, metal: 0.45, color: 0xdadada });
    const girder = group(g, 0, 0, BST_GZ);
    const web = box(girder, 8.6, 1.3, 0.03, 0, 1.6, 0, 0xffffff);
    web.material = webMat;
    box(girder, 8.6, 0.05, 0.45, 0, 0.95, 0, 0x6c757a, { rough: 0.55, metal: 0.45 });
    box(girder, 8.6, 0.05, 0.45, 0, 2.25, 0, 0x6c757a, { rough: 0.55, metal: 0.45 });
    box(girder, 0.012, 1.3, 0.04, 0, 1.6, 0, 0x1a1d20, { rough: 0.9, cast: false });
    for (const x of [-3.2, -1.6, 1.6, 3.2]) box(girder, 0.18, 1.2, 0.012, x, 1.6, 0.022, 0x737c81, { rough: 0.55, metal: 0.45 });
    // Web splice plate (near side) and the flange splice plates.
    box(girder, 0.72, 1.02, 0.02, 0, 1.6, 0.026, 0x88939a, { rough: 0.5, metal: 0.5 });
    box(girder, 0.9, 0.02, 0.45, 0, 2.285, 0, 0x88939a, { rough: 0.5, metal: 0.5 });
    box(girder, 0.9, 0.02, 0.45, 0, 0.915, 0, 0x88939a, { rough: 0.5, metal: 0.5 });
    // The primer overspray on the top flange splice's contact face.
    const overspray = box(girder, 0.36, 0.006, 0.3, -0.18, 2.298, 0.02, 0xb4552f, { rough: 0.9, opacity: 0.85, transparent: true, cast: false });
    reg(hits, overspray, "painted-faying");
    // Pier cap at the west end, falsework tower under the east end.
    const pierMat = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#8d8a82", base2: "#827f77", seam: "rgba(0,0,0,0.18)" }), { repeat: 1, px: 256 }), { rough: 0.95, color: 0xe0ddd4 });
    const pierCol = cyl(g, 0.45, 0.45, 0.9, -3.9, 0.45, BST_GZ, 0xffffff, { seg: 20 });
    pierCol.material = pierMat;
    const pierCap = box(g, 1.1, 0.3, 1.6, -3.9, 0.78, BST_GZ, 0xffffff);
    pierCap.material = pierMat;
    const tower = group(g, 3.7, 0, BST_GZ);
    for (const [dx, dz] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) cyl(tower, 0.03, 0.03, 0.92, dx, 0.46, dz, 0xd0a030, { rough: 0.6, metal: 0.4, seg: 8 });
    for (const dz of [-0.35, 0.35]) { const b = box(tower, 1.0, 0.03, 0.03, 0, 0.46, dz, 0xd0a030, { rough: 0.6, metal: 0.4 }); b.rotation.z = 0.8; }
    box(tower, 0.9, 0.06, 0.9, 0, 0.92, 0, 0x5a4a30, { rough: 0.9 });

    // Bolt grid on the web splice: holes painted on a decal, bolts added at fit-up.
    const BOLT_X = [-0.24, -0.12, 0.12, 0.24], BOLT_Y = [1.25, 1.48, 1.72, 1.95];
    const holes = decal(girder, 0.7, 1.0, 0, 1.6, 0.037, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.fillStyle = "rgba(10,12,14,0.9)";
      for (const bx of BOLT_X) for (const by of BOLT_Y) { cx.beginPath(); cx.arc(w / 2 + (bx / 0.7) * w, h / 2 - ((by - 1.6) / 1.0) * h, w * 0.03, 0, Math.PI * 2); cx.fill(); }
    }, { px: 256, transparent: true });
    const bolts = group(girder, 0, 0, 0.05);
    const boltAt = {};
    for (const bx of BOLT_X) for (const by of BOLT_Y) {
      const b = cyl(bolts, 0.024, 0.024, 0.03, bx, by, 0, 0x5c6166, { rough: 0.45, metal: 0.7, seg: 6 });
      b.rotation.x = Math.PI / 2;
      boltAt[`${bx},${by}`] = b;
    }
    bolts.visible = false;
    // Match marks across every nut, bolt end and plate: one decal, repainted per stage.
    const marksFace = decal(girder, 0.7, 1.0, 0, 1.6, 0.068, () => {}, { px: 256, transparent: true });
    const paintMarks = (state) => repaint(marksFace, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      for (const bx of BOLT_X) for (const by of BOLT_Y) {
        const px = w / 2 + (bx / 0.7) * w, py = h / 2 - ((by - 1.6) / 1.0) * h;
        const spun = bx === 0.12 && by === 1.48 && state === "turned";
        const a = state === "snug" || spun ? 0 : -Math.PI / 3;
        cx.strokeStyle = state === "inspected" ? "#59c97b" : "#f2e14b"; cx.lineWidth = w * 0.012;
        cx.beginPath(); cx.moveTo(px - Math.cos(a) * w * 0.03, py - Math.sin(a) * w * 0.03); cx.lineTo(px + Math.cos(a) * w * 0.03, py + Math.sin(a) * w * 0.03); cx.stroke();
        cx.beginPath(); cx.moveTo(px + (spun ? w * 0.03 : w * 0.035), py); cx.lineTo(px + w * 0.06, py); cx.stroke();
        if (state === "inspected") { cx.fillStyle = "#59c97b"; cx.fillRect(px - w * 0.05, py + h * 0.03, w * 0.1, h * 0.008); }
      }
    });
    marksFace.visible = false;
    // The spun bolt's own marker, so the find has a target of its own.
    const spunHit = box(girder, 0.07, 0.07, 0.06, 0.12, 1.48, 0.07, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, spunHit, "spun-bolt");
    // Drift pins, the socket on one nut and the back-up wrench on its head.
    const pins = group(girder, 0, 0, 0.06);
    for (const [bx, by] of [[-0.24, 1.95], [0.24, 1.25]]) {
      const p = cyl(pins, 0.012, 0.022, 0.16, bx, by, 0.03, 0xb8bec4, { rough: 0.35, metal: 0.8, seg: 10 });
      p.rotation.x = Math.PI / 2;
    }
    holoTag(girder, "drift pins", 0, 2.12, 0.1, { css: BST_CSS, w: 0.22 });
    reg(hits, pins, "drift-pins");
    const socket = group(girder, 0.24, 1.72, 0.1);
    cyl(socket, 0.04, 0.04, 0.09, 0, 0, 0, 0x2a2e33, { rough: 0.5, metal: 0.6, seg: 12 }).rotation.x = Math.PI / 2;
    box(socket, 0.03, 0.03, 0.22, 0, 0, 0.14, 0x2a2e33, { rough: 0.5, metal: 0.6 });
    holoTag(socket, "turn-of-nut socket", 0.2, 0.14, 0.05, { css: BST_CSS, w: 0.32 });
    reg(hits, socket, "nut-socket");
    const backup = group(girder, -0.24, 1.48, 0.08);
    box(backup, 0.04, 0.34, 0.015, 0, -0.17, 0, 0x8b949d, { rough: 0.4, metal: 0.8 });
    torus(backup, 0.03, 0.01, 0, 0, 0, 0x8b949d, { rough: 0.4, metal: 0.8, seg: 6, seg2: 12 });
    holoTag(backup, "back-up wrench", -0.2, -0.3, 0.02, { css: BST_CSS, w: 0.28 });
    reg(hits, backup, "backup-wrench");
    // The bottom flange's misaligned hole — the finger hazard.
    const holeHit = box(girder, 0.08, 0.06, 0.08, 0.32, 0.9, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(girder, "feel the hole with a finger?", 0.32, 0.78, 0.26, { css: "#d2312b", w: 0.5 });
    reg(hits, holeHit, "finger-in-hole");
    // The top flange — the untied step up.
    const flangeHit = box(girder, 1.0, 0.1, 0.45, -1.4, 2.32, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(girder, "step onto the flange untied?", -1.4, 2.5, 0.1, { css: "#d2312b", w: 0.5 });
    reg(hits, flangeHit, "untied-on-flange");

    // ------------------------------------------------ fasteners and kegs
    const kegs = group(g, -2.2, BST_DECK, 1.35);
    const kegA = group(kegs, -0.3, 0, 0);
    cyl(kegA, 0.18, 0.18, 0.42, 0, 0.21, 0, 0x3b5c7a, { rough: 0.6, metal: 0.3, seg: 16 });
    const kegABolts = cyl(kegA, 0.16, 0.16, 0.02, 0, 0.41, 0, 0x6a4a2e, { rough: 0.95, seg: 16 });
    void kegABolts;
    holoTag(kegA, "keg — left open", 0, 0.6, 0, { css: BST_CSS, w: 0.26 });
    reg(hits, kegA, "rusty-keg");
    const kegB = group(kegs, 0.25, 0, 0.1);
    cyl(kegB, 0.18, 0.18, 0.42, 0, 0.21, 0, 0x3b5c7a, { rough: 0.6, metal: 0.3, seg: 16 });
    const kegBTop = cyl(kegB, 0.16, 0.16, 0.02, 0, 0.41, 0, 0x9aa0a6, { rough: 0.4, metal: 0.7, seg: 16 });
    holoTag(kegB, "verified lot — in use", 0, 0.6, 0, { css: BST_CSS, w: 0.32 });
    const lid = cyl(g, 0.19, 0.19, 0.025, -1.55, BST_DECK + 0.013, 1.85, 0x2f4a64, { rough: 0.6, metal: 0.3, seg: 16 });
    holoTag(g, "keg lid", -1.55, BST_DECK + 0.2, 1.85, { css: BST_CSS, w: 0.16 });
    reg(hits, lid, "keg-lid");
    const nutBox = group(g, -2.75, BST_DECK, 0.75, 0.3);
    box(nutBox, 0.3, 0.18, 0.22, 0, 0.09, 0, 0x8a6a3a, { rough: 0.9 });
    decal(nutBox, 0.24, 0.1, 0, 0.1, 0.111, signFace("NUTS · LOT B-7", { bg: "#efe6d2", fg: "#2a2014", accent: "#d2312b", scale: 0.4 }), { px: 160 });
    reg(hits, nutBox, "mixed-lot-nuts");
    const newBox = group(g, -0.6, BST_DECK, 1.9, -0.2);
    box(newBox, 0.28, 0.16, 0.2, 0, 0.08, 0, 0x8a6a3a, { rough: 0.9 });
    decal(newBox, 0.22, 0.09, 0, 0.09, 0.101, signFace("NEW · VERIFIED", { bg: "#efe6d2", fg: "#2a2014", accent: "#59c97b", scale: 0.38 }), { px: 160 });
    holoTag(newBox, "new assembly", 0, 0.32, 0, { css: BST_CSS, w: 0.24 });
    reg(hits, newBox, "new-assembly");
    const usedBucket = group(g, 2.55, BST_DECK, 1.55);
    cyl(usedBucket, 0.15, 0.12, 0.3, 0, 0.15, 0, 0xd2312b, { rough: 0.7, seg: 14 });
    cyl(usedBucket, 0.13, 0.13, 0.02, 0, 0.29, 0, 0x4a4540, { rough: 0.9, seg: 14 });
    holoTag(usedBucket, "bolts from yesterday's splice", 0, 0.5, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, usedBucket, "reused-bolts");
    const bag = group(g, 0.9, BST_DECK, -0.35);
    cyl(bag, 0.13, 0.11, 0.28, 0, 0.14, 0, 0x6b5a3a, { rough: 0.95, seg: 12 });
    torus(bag, 0.12, 0.01, 0, 0.28, 0, 0x2b2b2b, { rough: 0.8, seg: 6, seg2: 14 });
    holoTag(bag, "bolt bag", 0, 0.45, 0, { css: BST_CSS, w: 0.18 });
    reg(hits, bag, "bolt-bag");
    const spud = hammer(g, 1.35, BST_DECK, -0.3, { ry: 0.7 });
    holoTag(g, "hammer — knock out pins", 1.35, BST_DECK + 0.25, -0.3, { css: BST_CSS, w: 0.38 });
    reg(hits, spud, "spud-hammer");

    // ------------------------------------------------ calibrator, tools, regulator
    const cal = group(g, -1.85, BST_DECK, 0.25, 0.25);
    box(cal, 0.5, 0.7, 0.35, 0, 0.35, 0, 0x2f3a44, { rough: 0.6, metal: 0.4 });
    box(cal, 0.3, 0.3, 0.12, 0, 0.9, 0, 0x3c4a56, { rough: 0.5, metal: 0.6 });
    const calDial = decal(cal, 0.24, 0.24, 0, 0.9, 0.061, signFace("-- %", { bg: "#0d1c24", accent: BST_CSS, fg: "#bfeaf7", scale: 0.4 }), { px: 192, glow: true, ei: 0.7 });
    cyl(cal, 0.03, 0.03, 0.12, 0.2, 0.9, 0.06, 0x8b949d, { rough: 0.4, metal: 0.8, seg: 8 }).rotation.x = Math.PI / 2;
    holoTag(cal, "bolt tension calibrator", 0, 1.15, 0, { css: BST_CSS, w: 0.4 });
    reg(hits, cal, "bolt-calibrator");
    torqueWrench(g, -1.45, BST_DECK + 0.02, 0.45, { ry: 1.2 });
    const chest = toolChest(g, 1.85, 0.55, { ry: -0.35, color: 0x2f4f6f });
    chest.position.y = BST_DECK;
    const impact = impactWrench(chest, -0.16, 0.755, 0.02, { ry: 0.4 });
    holoTag(chest, "impact wrench — snug", -0.16, 1.1, 0, { css: BST_CSS, w: 0.36 });
    reg(hits, impact, "impact-wrench");
    const marker = group(chest, 0.08, 0.77, 0.1, 0.5);
    cyl(marker, 0.012, 0.012, 0.13, 0, 0, 0, 0xf2e14b, { rough: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(chest, "paint marker", 0.1, 0.95, 0.12, { css: BST_CSS, w: 0.22 });
    reg(hits, marker, "paint-marker");
    const crewRadio = radio(chest, 0.22, 0.755, -0.08, { ry: -0.3 });
    holoTag(chest, "crew radio", 0.24, 1.08, -0.08, { css: BST_CSS, w: 0.2 });
    reg(hits, crewRadio, "crew-radio");
    const regPost = group(g, 2.35, BST_DECK, 0.05);
    cyl(regPost, 0.025, 0.025, 1.0, 0, 0.5, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const regulator = instrument(regPost, 0, 1.02, 0, { ry: 0.3, idle: "-- LINE", color: BST_ACCENT, w: 0.12, d: 0.16 });
    holoTag(regPost, "air regulator", 0, 1.22, 0, { css: BST_CSS, w: 0.24 });
    reg(hits, regulator, "air-regulator");
    hose(g, [[2.6, BST_DECK + 0.2, -0.45], [2.4, BST_DECK + 0.05, -0.1], [1.9, BST_DECK + 0.03, -0.2], [0.4, BST_DECK + 0.03, -0.6], [0.24, 1.3, BST_GZ + 0.2]], 0.012, 0x1f1f22, { steps: 30, rough: 0.8 });

    // ------------------------------------------------ paperwork
    const panelDraw = (title, rows, done = false) => (cx, w, h) => {
      cx.fillStyle = "#0e161d"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BST_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaf2f8"; cx.fillText(title, w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.068)}px Arial, sans-serif`; cx.fillStyle = done ? "#d8f5e0" : "#cfe0ec";
      rows.forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.29 + i * 0.12)));
    };
    const spec = holoPanel(g, 0.95, 0.62, -2.55, 1.75, -0.35, panelDraw("SPLICE G3 — BOLT SPEC", [
      "Flange splice: slip-critical · surface per drawing", "Web splice: pretensioned", "Method: turn-of-nut · flange: calibrated wrench",
      "Rotation from snug: per the spec table, this length", "Verify each lot in the calibrator daily", "Protect fasteners from weather until installed",
    ]), { ry: 0.75, accent: BST_ACCENT });
    reg(hits, spec, "bolt-spec");
    const logRows = ["Lots: —", "Calibrator: —", "Replaced: —", "Inspector: —"];
    const log = holoPanel(g, 0.62, 0.44, 2.75, 1.55, 1.2, panelDraw("BOLTING LOG — G3", logRows), { ry: -0.9, accent: BST_ACCENT });
    reg(hits, log, "splice-log");
    const stamp = group(g, 0.6, BST_DECK, 2.1, 0.4);
    box(stamp, 0.3, 0.4, 0.02, 0, 1.0, 0, 0x2b3138, { rough: 0.6 });
    const stampFace = decal(stamp, 0.26, 0.34, 0, 1.0, 0.012, signFace("INSPECTION\nPENDING", { bg: "#efe6d2", fg: "#2a2014", accent: "#f2ae14", scale: 0.2 }), { px: 192 });
    cyl(stamp, 0.015, 0.015, 0.8, 0, 0.4, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(stamp, "inspector's sheet", 0, 1.3, 0, { css: BST_CSS, w: 0.3 });
    reg(hits, stamp, "inspection-stamp");

    // ------------------------------------------------ drop zone, painters, truck
    const dropZone = decal(g, 5.0, 1.4, 0, 0.045, -2.75, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = "rgba(242,193,75,0.85)"; cx.lineWidth = h * 0.05; cx.strokeRect(0, 0, w, h);
      cx.fillStyle = "rgba(242,193,75,0.35)";
      for (let x = -h; x < w; x += h * 0.5) { cx.beginPath(); cx.moveTo(x, h); cx.lineTo(x + h * 0.2, h); cx.lineTo(x + h * 1.2, 0); cx.lineTo(x + h, 0); cx.fill(); }
      cx.fillStyle = "#f2c14b"; cx.font = `700 ${Math.round(h * 0.2)}px Arial`; cx.textAlign = "center"; cx.fillText("DROP ZONE — NO ENTRY UNDER BOLTING", w / 2, h * 0.55);
    }, { px: 512, transparent: true });
    dropZone.rotation.x = -Math.PI / 2;
    const barricade = group(g, -3.4, 0, -1.9);
    barrierPanel(barricade, 0, 0, { ry: 0.2, w: 1.1 });
    holoTag(barricade, "drop-zone barricade", 0, 1.25, 0, { css: BST_CSS, w: 0.36 });
    reg(hits, barricade, "drop-zone-barricade");
    const tape = group(g, 0, 0, -2.05);
    for (const x of [-2.5, 0, 2.5]) cyl(tape, 0.03, 0.03, 0.64, x, 0.32, 0, 0xe4622a, { rough: 0.7, seg: 8 });
    hose(tape, [[-2.5, 0.62, 0], [0, 0.6, 0], [2.5, 0.62, 0]], 0.01, 0xd2312b, { steps: 6, rough: 0.7 });
    tape.visible = false;
    const truck = pickup(g, 7.2, 0, -3.1, { ry: -Math.PI / 2, livery: { colour: 0x6b7f8f, fleetName: "CITY COATINGS", unitNumber: "P-12" } });
    const painters = group(g, 0, 0, 0);
    standingFigure(painters, 0.6, -2.75, { ry: 0.3, cloth: 0xe8e4dc, vest: 0xd8f23a, helmet: 0xf2f2f2 });
    box(painters, 0.5, 0.3, 0.35, 1.5, 0.15, -3.0, 0xe8e4dc, { rough: 0.8 });
    painters.visible = false;

    // ------------------------------------------------ crew
    const partner = standingFigure(g, 0.2, 1.05, { ry: 2.8, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2c14b, harness: true, gloves: true });
    partner.position.y = BST_DECK;
    holoTag(partner, "bolting partner", 0, 1.95, 0, { css: BST_CSS, w: 0.3 });
    const inspector = standingFigure(g, 1.25, 2.0, { ry: 2.4, cloth: 0x3a4f5f, vest: 0xe07a3f, helmet: 0xf2f2f2 });
    inspector.position.y = BST_DECK;
    holoTag(inspector, "inspector", 0, 1.95, 0, { css: BST_CSS, w: 0.2 });

    const rain = particles(g, 90, 0xb8d4e8, { size: 0.02, life: 0.7, additive: false, opacity: 0.6 });
    const rainOrigin = new THREE.Vector3(-1.4, 3.0, 0.8);

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.5, BST_GZ),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "fastener-find") {
          kegA.children[1].material = mat(0xd2312b, { emissive: 0x5a1208, ei: 0.7, rough: 0.9 });
          overspray.material = mat(0xd2312b, { emissive: 0x5a1208, ei: 0.6, rough: 0.9 });
          nutBox.children[0].material = mat(0xd2312b, { rough: 0.9 });
        }
        if (step.id === "calibrate") repaint(calDial, signFace("VERIFIED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.28 }));
        if (step.id === "fit-up") { bolts.visible = true; pins.visible = false; holes.visible = false; bag.visible = false; }
        if (step.id === "match-mark") { marksFace.visible = true; paintMarks("snug"); }
        if (step.id === "turn-of-nut") paintMarks("turned");
        if (step.id === "mark-find") spunHit.material = mat(0xd2312b, { opacity: 0.55, transparent: true, emissive: 0x6a1a08, ei: 0.9, cast: false });
        if (step.id === "replace-bolt") { paintMarks("replaced"); spunHit.visible = false; newBox.visible = false; }
        if (step.id === "inspect") { paintMarks("inspected"); repaint(stampFace, signFace("ACCEPTED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 })); }
        if (step.id === "splice-log") repaint(log.userData.face, panelDraw("BOLTING LOG — G3", ["Lots: A-4 bolts / A-4 nuts, verified", "Calibrator: at verification tension", "Replaced: 1 spun bolt, new assembly", "Inspector: accepted · rain on keg noted"], true));
        if (step.id === "crew-checkin") repaint(crewRadio.userData.screen, signFace("SPLICE DONE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "rain-on-kegs") { rain.visible = true; kegBTop.material = mat(0x5f7f9a, { rough: 0.15, metal: 0.6 }); }
        if (it.id === "painters-in-drop-zone") { painters.visible = true; truck.position.x = 3.9; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "rain-on-kegs") { lid.position.set(-1.95, BST_DECK + 0.44, 1.45); }
        if (it.id === "painters-in-drop-zone") { tape.visible = true; painters.position.z = -1.6; barricade.position.set(-2.8, 0, -2.3); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "snug") impact.rotation.z = session.turn.amount * 0.6;
        if (session?.turn && step?.id === "turn-of-nut") socket.rotation.z = -session.turn.amount * Math.PI * 0.66;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "calibrate") repaint(calDial, signFace(gg.t < 0.46 ? "LOW" : gg.t <= 0.62 ? "AT SPEC" : "HIGH", { bg: "#0d1c24", accent: gg.t >= 0.46 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.34 }));
        const tr = session?.track;
        if (tr && step?.id === "air-pressure") repaint(regulator.userData.screen, signFace(tr.v < 0.4 ? "LOW" : tr.v > 0.6 ? "HIGH" : "SET", { bg: "#0d1c24", accent: tr.v >= 0.4 && tr.v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        if (rain.visible) rain.userData.step(dt ?? 0.016, rainOrigin, 3.0, 0.2, -9.0);
        void CITY;
      },
    };
  },
};
