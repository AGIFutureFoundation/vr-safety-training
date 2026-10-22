import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument,
  standingFigure, reg, surfaceTexture, texturedMat, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { plantHardHat } from "../../../shared/eggs.js";

// SmartCiti.X~ Stage Load-In & Truss Rigging VR — Entertainment & Live
// Events, the live events block.
//
// An arena floor at load-in: a box-truss run on its dollies, two chain
// motors already hung from points in the roof steel on their bridles, the
// motor controller on a road case, and a deck full of stagehands pushing
// cable carts. The learner is the IATSE ground rigger who builds the truss,
// hooks it to the motors and flies it to trim with the head rigger up in the
// steel on the radio. The building and the show are generic.

const SLT_ACCENT = 0xc58cff;
const SLT_CSS = "#c58cff";
const SLT_TRUSS_Y = 0.55;

export const SIM_STAGE_LOAD_IN_AND_TRUSS_RIGGING = {
  id: "stage-load-in-and-truss-rigging",
  index: "313",
  domain: "Entertainment & Live Events",
  trade: "IATSE stagehand — ground rigger at an arena load-in, working to the head rigger in the steel",
  category: "Entertainment & Live Events",
  indoor: "theatre",
  certification: "IATSE training trust with ETCP Certified Rigger — Arena practice; ANSI E1.6 powered entertainment hoists for the chain motors; ASME B30.16 for the hoists themselves, ASME B30.26 for the shackles and ASME B30.9 for the slings and steel secondaries",
  name: "Stage Load-In & Truss Rigging",
  title: simTitle("Stage Load-In & Truss Rigging"),
  tagline: "An arena load-in from the deck: the rigging plot read, hard hat and gloves on, a dented truss chord found, the sections spliced and the couplers bolted, the bridle angle read, a twisted motor chain caught, the tag line held while a stagehand pushes a cart under the load, the motors bumped up level until one falls out of step, trim checked, the load cells read, the steel secondaries rigged and the shackles moused, and the points logged",
  accent: SLT_ACCENT,
  accentCss: SLT_CSS,
  parSeconds: 285,
  footprint: 2.6,
  badge: { id: "flown-level-and-dead-hung", name: "Flown Level and Dead-Hung", note: "Nobody under the load, the out-of-step motor stopped on the E-stop, every point inside its plot load, and every point on its steel" },

  supportLine: "your IATSE local's member assistance contact, or the employee assistance programme your employer or the local carries",

  game: system({
    name: "Ground Rigging",
    currency: "POINT",
    ranks: ["Deck Hand", "Truss Builder", "Ground Rigger", "Lead Ground Rigger", "Arena Rigging Certified"],
    badges: [
      { id: "tag-line-held", name: "Tag Line Held", note: "The truss steadied on its tag line the whole flight", test: AWARD.stepClean("tag-line") },
      { id: "flown-level", name: "Flown Level", note: "The motors run up together without the truss going out of level", test: AWARD.unbroken },
      { id: "clear-under-load", name: "Clear Under Load", note: "Never under the flying truss, never a hand in a running chain, never on the truss", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-load-in", name: "Clean Load-In", note: "No corrections anywhere in the rig", test: AWARD.clean },
      { id: "bridle-on-the-plot", name: "Bridle On The Plot", note: "Bridle angle committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "trim-before-doors", name: "Trim Before Doors", note: "Points logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-flying-truss": "You walked under the truss while the motors were running it up. A flying truss is a suspended load, and ANSI E1.6 and every arena's rigging rules put the same line on it — nobody under a load while it moves. A motor that goes out of step, a coupler that was not bolted or a chain that jams all drop or tip the truss in the half-second nobody can react in, and the person underneath is the one who pays for it.",
    "hand-on-chain": "You reached to guide the motor's chain with the motor running. A chain motor pulls its load chain through the lift wheel with the whole load on it, and a gloved hand guiding a twist out of the chain goes into the wheel with it. A twisted chain is found and cleared with the motor stopped and locked off — never fed through by hand while it runs.",
    "stand-on-truss": "You stepped up onto the truss to ride it toward the steel. A truss is a lifting beam carrying lights and cable, not a work platform, and the hoists are not rated to lift people: riding a truss puts a person on a load with no fall protection that the rig was never designed to carry. Work at height is reached from a lift or from the steel, clipped on.",
    "unrated-shackle": "You picked up the unmarked shackle from the bottom of the case. Rigging hardware that carries a load overhead has to show its maker and rated load, because ASME B30.26 hardware is chosen by that rating — an unmarked shackle is a piece of metal of unknown strength, and the one in a hardware-store bin looks exactly like the rated one until it opens under the truss.",
  },

  lateNotes: {
    "coupler-bolt": "The couplers are bolted once the sections are butted together at the splice — there is nothing to bolt yet.",
    "motor-go": "The motors run once the tag line is manned and the deck under the truss is clear, not before.",
    "rigging-log": "The points are logged once the steel secondaries are on and every shackle is moused — the log is last.",
  },

  steps: [
    {
      id: "rigging-plot", kind: "select", target: "rigging-plot",
      title: "Read the rigging plot: points, loads and bridles",
      cue: "Read the head rigger's plot: which points, each point's plotted load against the arena's limit, the bridle leg lengths, motor capacities, and the trim height.",
      why: "The rigging plot is the only place the whole rig exists before it is in the air: each point's load has been worked out against what the arena's roof steel is allowed to carry, each bridle's legs have lengths that set their angle, and each motor has a capacity that has to exceed its point. A ground rigger who builds from memory or from the last show's rig builds a different load path from the one the numbers were checked for, and the arena's structure does not know which one it is carrying.",
    },
    {
      id: "deck-ppe", kind: "sequence", anyOrder: true,
      targets: ["hard-hat", "rigging-gloves"],
      itemNames: { "hard-hat": "hard hat", "rigging-gloves": "rigging gloves" },
      title: "Hard hat and rigging gloves on before the steel is worked",
      cue: "Hard hat on for the whole time riggers are working overhead, and rigging gloves on before you handle chain and wire rope.",
      why: "Riggers in the steel drop things — a shackle pin, a wrench, a coil of rope — and the deck under an arena roof is a long way down for a steel pin to fall; the hard hat is on for as long as anyone is working overhead, not only while the truss is moving. Gloves protect against the wire rope's broken strands and the chain's pinch points, which is where a ground rigger's hands spend the morning.",
    },
    {
      id: "truss-inspect", kind: "find", noHint: true,
      targets: ["dented-chord"],
      itemNames: { "dented-chord": "dented main chord on section three" },
      itemNotes: { "dented-chord": "Section three's lower main chord has a crease where a forklift tyne caught it on the truck — a dented chord has lost its section, and a truss that was designed with that chord carrying compression will fold at the dent. The section is tagged out and a spare goes in." },
      title: "Inspect the truss sections before they are joined",
      cue: "Walk each section on its dolly: the main chords for dents and bends, the welds at the diagonals for cracks, the couplers and their holes for wear.",
      why: "Aluminium truss gets its strength from straight tubes and sound welds, and it gets damaged in trucks and on docks: a dented main chord has lost the section the load tables were written for, and a cracked weld at a diagonal lets the chords work against each other until one lets go. The maker's inspection criteria are simple and absolute — a dent, a bend or a crack puts the section out of service — and the only time to apply them is on the deck, before the section is in the air with lights on it.",
    },
    {
      id: "truss-splice", kind: "drag", target: "truss-section",
      title: "Roll the spare section in and butt it to the run",
      cue: "Roll the spare section in on its dolly and butt its couplers square against the end of the run at the splice.",
      why: "A truss run is only as straight as its splices, and a section butted in crooked puts a kink in the run that loads one side of every coupler and bends the chords at the joint. The sections meet square on their dollies, at deck height, where both hands and both eyes can line them up — lining them up once they are lifting is guesswork with the load already on them.",
      drag: { to: "splice-point", radius: 0.5, missNote: "Not butted at the splice — the section's couplers have to meet the run's end square before any bolt goes in." },
    },
    {
      id: "coupler-bolts", kind: "turn", target: "coupler-bolt",
      title: "Bolt the couplers with the right grade and the nuts home",
      cue: "Run the maker's grade of bolt through each coupler and take the nut home — every coupler, every chord, no bolt left out.",
      why: "The couplers carry the whole truss across the splice, and they carry it through the bolts: the maker specifies the bolt grade because a softer bolt shears under a load the truss itself would carry. Every coupler on every chord gets its bolt and its nut run home, because a missing bolt on one chord is invisible from the deck once the truss is dressed with cable and lights, and the truss is designed around all four chords working together.",
      turn: { turns: 1.0, label: "COUPLERS", readout: (t) => (t < 0.35 ? "bolts started" : t < 0.9 ? "running home" : "all home") },
    },
    {
      id: "bridle-angle", kind: "gauge", target: "bridle-gauge",
      title: "Read the bridle's angle against the plot",
      cue: "Sight the bridle legs from the deck with the angle finder and commit the included angle against the plot's figure.",
      why: "A bridle splits one point's load between two beams, and the tension in each leg rises steeply as the angle between them opens: at the plot's angle each leg carries its share, and at a much wider one each leg can carry as much as the whole load. The plot's leg lengths set the angle, and reading it from the deck is how a ground rigger catches a leg rigged a length short before the motor lifts against it.",
      gauge: { label: "BRIDLE ANGLE", speed: 0.65, green: [0.34, 0.54], readout: (t) => `${Math.round(t * 180)}°`, missNote: "Off the plot — sight both legs from directly under the point, not from the side, and compare against the plotted angle." },
    },
    {
      id: "chain-check", kind: "find", noHint: true,
      targets: ["twisted-chain"],
      itemNames: { "twisted-chain": "twisted load chain entering the downstage motor" },
      itemNotes: { "twisted-chain": "The downstage motor's load chain has a half twist a metre above the hook — the hook block has been flipped through the chain. Run in, the twist jams at the lift wheel. The motor is locked off and the block flipped back." },
      title: "Check the motors' load chains before the hooks go on",
      cue: "Look along each motor's chain from the chain bag to the hook: twists, kinks, a flipped hook block, the chain seated in the bag.",
      why: "A chain motor's load chain has to feed into its lift wheel flat and straight, and a chain twisted by a hook block flipped through it jams at the wheel under load — stalling the motor, or worse, jumping the wheel with the truss on it. ANSI E1.6 has the chain inspected before use, and the twist is found by looking from bag to hook before the motor is hooked to anything, not by listening for it once it is lifting.",
    },
    {
      id: "tag-line", kind: "hold", target: "tag-line", seconds: 4,
      title: "Hold the tag line to steady the truss as it leaves the deck",
      cue: "Take the tag line on the upstage end and hold it so the truss does not spin as it leaves the dollies — stand clear of the load, not under it.",
      why: "A truss leaving its dollies wants to swing and spin, and a spinning truss swings its ends into motors, other truss and people. The tag line lets a person on the deck control it from a distance, standing clear of the load's footprint rather than steadying it by hand from underneath. It is held until the truss is well above head height and still, because that is where the swing stops being a hazard to the deck.",
      holdBreakNote: "Let the tag line go before the truss was clear and still — it started to turn on its points. Take it again and steady it.",
    },
    {
      id: "motor-run", kind: "track", target: "motor-go",
      seconds: 6,
      title: "Run the motors up together, keeping the truss level",
      cue: "Hold the controller's GO and run both motors up, watching the truss stay level — release the moment one end starts to lead.",
      why: "Two motors on one truss share its weight only while they run together: when one leads, it takes more of the load, the truss tilts and the lagging motor's point unloads — and a truss that goes far out of level overloads the leading motor and slides its cable and lights toward the low end. The operator holds GO with eyes on the truss rather than on the controller, and releases the instant it tilts, because the controller is a deadman for exactly that reason.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "LEVEL", readout: (v) => (v < 0.4 ? "upstage end leading" : v > 0.6 ? "downstage end leading" : "level") },
      holdBreakNote: "The truss went out of level — release, let the operator correct the leading motor on its own, and run them together again.",
    },
    {
      id: "trim-check", kind: "select", target: "trim-mark",
      title: "Check the truss at its trim height",
      cue: "Check the truss is at the plot's trim height at both ends, level, and clear of the other truss and the scenery around it.",
      why: "Trim is where the show's lighting design was drawn, and it is also where the rig's loads were calculated: a truss flown higher or lower than its plot trim changes the bridle's geometry and the cable's weight hanging off it. Both ends are checked at trim, because a truss that is level at one end and a foot off at the other is still out of level.",
    },
    {
      id: "load-cells", kind: "gauge", target: "load-cell-display",
      title: "Read each point's load cell against its plotted load",
      cue: "Read the load cell display for each point once the truss has settled and commit it against the plot's figure.",
      why: "The plot's point loads are calculations, and the load cells are what the points actually carry once the truss is dressed and at trim — the difference is how the head rigger learns that the lighting crew added a fixture, or a cable run is heavier than drawn. A point over its plotted load is a conversation before the show, not a surprise in the steel during it, and the reading is taken with the truss settled because a swinging truss reads high.",
      gauge: { label: "POINT LOAD", speed: 0.7, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 1000)} kg`, missNote: "Not a settled reading — let the truss stop swinging before reading the cell, or it reads the swing and not the load." },
    },
    {
      id: "secondaries", kind: "sequence", anyOrder: true,
      targets: ["steel-secondary", "shackle-mouse"],
      itemNames: { "steel-secondary": "steel secondary from the truss to the beam", "shackle-mouse": "every shackle pin moused" },
      title: "Rig the steel secondaries and mouse every shackle",
      cue: "Rig a steel secondary sling from the truss to the beam at each point with minimal slack, and mouse every shackle pin with wire.",
      why: "The motor is the primary load path and it has a brake, but a brake can fail and a hook can open: the steel secondary is a wire rope sling from the truss to the beam, rigged with just enough slack that it carries nothing until the motor lets go and then carries everything. ASME B30.9 governs the sling and B30.26 the shackles, and every shackle pin gets a wire mousing so that the vibration of a show cannot back it out over a run of nights.",
    },
    {
      id: "rigging-log", kind: "select", target: "rigging-log",
      title: "Log the points, the loads and the findings",
      cue: "Record each point's load cell reading, the dented section tagged out, the twisted chain cleared, the out-of-step motor, and the secondaries on.",
      why: "The rigging log is what the head rigger hands the arena's rigging department and what the next load-out works from: the dented section is out of service and must not go back on the truck with the good ones, the out-of-step motor is a service ticket before it flies again, and the load cell numbers are the proof the points stayed inside the plot. Written at the controller, it is the rig as it is; written after the show, it is the rig as someone remembers it.",
    },
    {
      id: "crew-checkin", kind: "select", target: "head-rigger-radio",
      title: "Check in with the head rigger and the deck crew",
      cue: "Call the head rigger that the points are trimmed and dead-hung, and check in with the deck crew after the stagehand under the load.",
      why: "The head rigger in the steel releases the motors' power and clears the deck for lighting on this call, so it has to be accurate. It is also the crew's own check-in: a stagehand pushing a cart under a moving truss is a near miss that shakes the person who saw it and the person who nearly paid for it, and the IATSE's practice is to say so before the call moves on — with the member assistance line named for anyone who wants more than a word on the deck.",
    },
  ],

  interrupts: [
    {
      id: "cart-under-load",
      kind: "Stagehand pushing a cart under the load",
      after: "tag-line", delay: 2, seconds: 12,
      alert: "A stagehand pushing a cable cart has cut across the floor and is heading straight under the truss as it leaves the dollies.",
      cue: "Blow the rigging whistle and call the load — everyone under the truss stops and gets clear.",
      target: "rigging-whistle",
      why: "A stagehand pushing a loaded cart is looking at the cart and the floor in front of it, not at the roof, and a truss lifting off its dollies makes almost no noise. The rigging whistle is the one sound on an arena floor that means a load is moving overhead, and it goes the instant someone heads under the truss — the tag line is held with the other hand, because the truss is still in the air.",
      missNote: "The cart went under the truss as it swung off the dollies; the upstage end dropped a few centimetres onto its slack chain and the stagehand was under it when it did.",
      wrongNote: "The rigging whistle — the stagehand is looking at their cart, and the only thing that reaches them in time is the sound everyone on the floor knows means a load is moving.",
    },
    {
      id: "motor-out-of-step",
      kind: "Motor out of step",
      after: "motor-run", delay: 2, seconds: 12,
      alert: "The downstage motor has stopped climbing while the upstage one keeps going — the truss is tilting and its cable is sliding toward the low end.",
      cue: "Hit the controller's emergency stop — both motors stop before the truss goes any further out of level.",
      target: "controller-estop",
      why: "A motor that stops climbing while its partner runs puts the whole truss on one point in a few seconds, and the leading motor is then lifting more than its plot load up a truss that is sliding its cable off the low end. Letting go of GO stops the run, but the emergency stop kills the power to every motor on the controller at once, and on an out-of-step truss that is the only stop worth having.",
      missNote: "The upstage motor kept climbing with the downstage one stalled; the truss tilted steeply, a cable bundle slid off the low end onto the deck, and the upstage point went well past its plot load before the head rigger shouted from the steel.",
      wrongNote: "The controller's emergency stop — the truss is going out of level now, and GO is the control that is lifting it.",
    },
  ],

  build(root) {
    plantHardHat(root, THREE, "stage-load-in-and-truss-rigging", [3.0, 1.2, 3.0]); // Hard Hat Hunt — docs/easter-egg.md
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, SLT_ACCENT);

    // ------------------------------------------------------------ the deck
    const floor = box(g, 6.4, 0.05, 5.0, 0, 0.025, 0, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#2a2522", base2: "#231f1c", step: 36 }), { repeat: 5, px: 512 }), { rough: 0.9, metal: 0.05, color: 0xb0a698 });
    // Spike tape marks for the truss footprint.
    for (const [x, z] of [[-2.0, -1.2], [2.0, -1.2], [-2.0, -0.7], [2.0, -0.7]]) box(g, 0.12, 0.005, 0.02, x, 0.053, z, 0xf2c14b, { cast: false });
    // Roof steel overhead: two beams the points hang from.
    const steel = group(g, 0, 3.4, -0.95);
    for (const x of [-1.6, 1.6]) {
      box(steel, 0.18, 0.3, 4.0, x - 0.35, 0, 0, 0x3a3f45, { rough: 0.6, metal: 0.5 });
      box(steel, 0.18, 0.3, 4.0, x + 0.35, 0, 0, 0x3a3f45, { rough: 0.6, metal: 0.5 });
    }

    // ------------------------------------------------------------ the truss
    const truss = group(g, 0, SLT_TRUSS_Y, -0.95);
    const TL = 3.6, TW = 0.3;
    const chords = [];
    for (const [cy, cz] of [[-TW / 2, -TW / 2], [-TW / 2, TW / 2], [TW / 2, -TW / 2], [TW / 2, TW / 2]]) {
      const c = cyl(truss, 0.024, 0.024, TL, 0, cy, cz, 0xd8dde2, { rough: 0.35, metal: 0.8, seg: 8 });
      c.rotation.z = Math.PI / 2;
      chords.push(c);
    }
    for (let i = 0; i < 9; i++) {
      const x = -TL / 2 + 0.2 + i * 0.4;
      for (const cz of [-TW / 2, TW / 2]) {
        const d = cyl(truss, 0.01, 0.01, 0.42, x, 0, cz, 0xc8cdd2, { rough: 0.4, metal: 0.8, seg: 6 });
        d.rotation.z = i % 2 ? 0.8 : -0.8;
      }
    }
    // Section three's dented lower chord.
    const dent = box(truss, 0.12, 0.05, 0.05, 0.9, -TW / 2, TW / 2, 0x8a8f94, { rough: 0.6, metal: 0.6 });
    reg(hits, dent, "dented-chord");
    // Couplers at the splice (x = +1.8 end).
    const couplers = group(truss, TL / 2, 0, 0);
    for (const [cy, cz] of [[-TW / 2, -TW / 2], [-TW / 2, TW / 2], [TW / 2, -TW / 2], [TW / 2, TW / 2]]) {
      const cp = cyl(couplers, 0.04, 0.04, 0.08, 0, cy, cz, 0x9aa0a6, { rough: 0.3, metal: 0.9, seg: 8 });
      cp.rotation.z = Math.PI / 2;
    }
    const boltGroup = group(couplers, 0.02, 0, 0);
    for (const [cy, cz] of [[-TW / 2, -TW / 2], [TW / 2, TW / 2]]) cyl(boltGroup, 0.01, 0.01, 0.12, 0, cy, cz, 0xe8b02e, { rough: 0.4, metal: 0.8, seg: 6 });
    boltGroup.visible = false;
    holoTag(couplers, "couplers — bolt", 0.1, 0.4, 0, { css: SLT_CSS, w: 0.32 });
    reg(hits, boltGroup, "coupler-bolt");
    const splice = torus(truss, 0.22, 0.012, TL / 2 + 0.3, 0, 0, SLT_ACCENT, { emissive: SLT_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    splice.rotation.y = Math.PI / 2;
    holoTag(truss, "splice point", TL / 2 + 0.3, 0.45, 0, { css: SLT_CSS, w: 0.26 });
    reg(hits, splice, "splice-point");
    // Dollies under the truss.
    for (const x of [-1.2, 1.2]) {
      const dolly = group(g, x, 0, -0.95);
      box(dolly, 0.5, 0.06, 0.5, 0, 0.18, 0, 0x2b2b30, { rough: 0.6 });
      for (const [wx, wz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) ball(dolly, 0.05, wx, 0.06, wz, 0x14171a, { rough: 0.8 });
      box(dolly, 0.08, 0.2, 0.4, 0, 0.32, 0, 0x2b2b30, { rough: 0.6 });
    }
    // The spare section on its own dolly, off to stage right.
    const spare = group(g, 2.6, 0, 0.6, 0);
    for (const [cy, cz] of [[-TW / 2, -TW / 2], [-TW / 2, TW / 2], [TW / 2, -TW / 2], [TW / 2, TW / 2]]) cyl(spare, 0.024, 0.024, 1.0, 0, SLT_TRUSS_Y + cy, cz, 0xd8dde2, { rough: 0.35, metal: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    box(spare, 0.5, 0.06, 0.5, 0, 0.18, 0, 0x2b2b30, { rough: 0.6 });
    holoTag(spare, "spare section", 0, 1.05, 0, { css: SLT_CSS, w: 0.28 });
    reg(hits, spare, "truss-section");
    // Lights clamped to the truss.
    for (let i = 0; i < 4; i++) {
      const fx = group(truss, -1.3 + i * 0.8, -TW / 2 - 0.1, 0.05);
      cyl(fx, 0.08, 0.1, 0.24, 0, -0.1, 0, 0x14171a, { rough: 0.5, metal: 0.4, seg: 12 });
      box(fx, 0.04, 0.08, 0.2, 0, 0.04, 0, 0x2b2b30, { rough: 0.5 });
    }
    const standHit = box(truss, 0.6, 0.12, 0.35, -0.5, TW / 2 + 0.08, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(truss, "ride the truss up?", -0.5, 0.55, 0, { css: "#d2312b", w: 0.38 });
    reg(hits, standHit, "stand-on-truss");
    const underHit = box(g, 1.2, 0.1, 0.6, -0.2, 0.08, -0.95, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk under the load?", -0.2, 0.25, -0.35, { css: "#d2312b", w: 0.42 });
    reg(hits, underHit, "under-flying-truss");

    // --------------------------------------------------- motors and bridles
    const motors = [];
    for (const [x, name] of [[-1.6, "upstage"], [1.6, "downstage"]]) {
      const m = group(g, x, 1.5, -0.95);
      box(m, 0.22, 0.34, 0.2, 0, 0, 0, 0x14171a, { rough: 0.5, metal: 0.4 });
      box(m, 0.18, 0.12, 0.26, 0, 0.12, 0, 0x2b2b30, { rough: 0.5, metal: 0.4 });
      const chainUp = hose(m, [[0, 0.17, 0], [0, 1.0, 0], [0, 1.6, 0]], 0.012, 0x8a949d, { steps: 6, rough: 0.5, metal: 0.7 });
      void chainUp;
      const bag = cyl(m, 0.1, 0.08, 0.3, 0.16, -0.2, 0, 0x2b2b30, { rough: 0.9, seg: 12 });
      void bag;
      const hookChain = hose(m, [[0, -0.17, 0], [0, -0.55, 0], [0, -0.75, 0]], 0.01, 0x8a949d, { steps: 6, rough: 0.5, metal: 0.7 });
      void hookChain;
      torus(m, 0.04, 0.01, 0, -0.8, 0, 0xe8b02e, { rough: 0.4, metal: 0.7, seg: 6, seg2: 12 });
      // Bridle legs from the top of the chain up to each beam.
      hose(g, [[x, 3.1, -0.95], [x - 0.35, 3.3, -0.95]], 0.008, 0xc0c6cc, { steps: 2, rough: 0.4, metal: 0.8 });
      hose(g, [[x, 3.1, -0.95], [x + 0.35, 3.3, -0.95]], 0.008, 0xc0c6cc, { steps: 2, rough: 0.4, metal: 0.8 });
      motors.push({ m, name });
    }
    const twist = box(motors[1].m, 0.05, 0.08, 0.05, 0, -0.45, 0, 0xb87a3a, { rough: 0.5, metal: 0.6 });
    reg(hits, twist, "twisted-chain");
    const chainHand = box(motors[0].m, 0.12, 0.2, 0.12, 0, -0.45, 0.06, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(motors[0].m, "guide the chain by hand?", 0, -0.2, 0.3, { css: "#d2312b", w: 0.48 });
    reg(hits, chainHand, "hand-on-chain");
    const bridleGauge = instrument(g, 1.3, 1.1, 0.15, { ry: -0.2, idle: "--°", color: SLT_ACCENT, w: 0.1, d: 0.14 });
    cyl(g, 0.02, 0.02, 1.05, 1.3, 0.55, 0.15, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(bridleGauge, "angle finder", 0, 0.16, 0, { css: SLT_CSS, w: 0.26 });
    reg(hits, bridleGauge, "bridle-gauge");
    // Steel secondaries and shackles — hidden until rigged.
    const secondaries = group(g, 0, 0, 0);
    for (const x of [-1.6, 1.6]) hose(secondaries, [[x + 0.1, SLT_TRUSS_Y + 2.1, -0.95], [x + 0.25, 2.8, -0.9], [x + 0.35, 3.25, -0.95]], 0.008, 0x9aa0a6, { steps: 6, rough: 0.4, metal: 0.8 });
    secondaries.visible = false;
    const secHit = torus(g, 0.12, 0.012, -2.4, 1.0, -0.4, SLT_ACCENT, { emissive: SLT_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    holoTag(g, "steel secondary", -2.4, 1.3, -0.4, { css: SLT_CSS, w: 0.3 });
    reg(hits, secHit, "steel-secondary");
    const tagLine = hose(g, [[-1.8, SLT_TRUSS_Y, -0.95], [-2.3, 0.7, -0.2], [-2.4, 0.9, 0.35]], 0.01, 0xe8dcc0, { steps: 10, rough: 0.9 });
    const tagHandle = box(g, 0.1, 0.2, 0.1, -2.4, 0.95, 0.4, 0xe8dcc0, { rough: 0.9 });
    holoTag(g, "tag line — hold", -2.4, 1.3, 0.45, { css: SLT_CSS, w: 0.3 });
    reg(hits, tagHandle, "tag-line");
    void tagLine;
    const trimMark = group(g, 2.9, 0, -0.95);
    cyl(trimMark, 0.015, 0.015, 2.4, 0, 1.2, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    box(trimMark, 0.2, 0.03, 0.03, 0, 2.2, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.8, rough: 0.5 });
    holoTag(trimMark, "trim mark", 0, 2.45, 0, { css: SLT_CSS, w: 0.22 });
    reg(hits, trimMark, "trim-mark");

    // -------------------------------------------- controller on its road case
    const caseG = group(g, -1.2, 0, 1.25, 0.2);
    box(caseG, 0.8, 0.7, 0.5, 0, 0.35, 0, 0x14171a, { rough: 0.6 });
    for (const sx of [-1, 1]) box(caseG, 0.02, 0.72, 0.52, sx * 0.4, 0.35, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    const ctrl = group(caseG, 0, 0.7, 0);
    box(ctrl, 0.5, 0.12, 0.3, 0, 0.06, 0, 0x2b2b30, { rough: 0.5 });
    const go = cyl(ctrl, 0.035, 0.035, 0.03, -0.12, 0.13, 0.04, 0x3fae6a, { rough: 0.4, seg: 14 });
    holoTag(ctrl, "GO — hold", -0.12, 0.35, 0.04, { css: SLT_CSS, w: 0.2 });
    reg(hits, go, "motor-go");
    const estop = cyl(ctrl, 0.045, 0.045, 0.04, 0.14, 0.14, 0.04, 0xd2312b, { rough: 0.4, seg: 16 });
    holoTag(ctrl, "E-stop", 0.14, 0.35, 0.04, { css: SLT_CSS, w: 0.16 });
    reg(hits, estop, "controller-estop");
    const whistle = group(caseG, 0.32, 0.72, -0.12);
    cyl(whistle, 0.015, 0.015, 0.06, 0, 0.02, 0, 0xe8b02e, { rough: 0.4, metal: 0.6, seg: 8 }).rotation.z = Math.PI / 2;
    hose(whistle, [[0, 0.02, 0], [0.05, 0.1, 0.02], [0, 0.18, 0]], 0.004, 0xd2312b, { steps: 6 });
    holoTag(whistle, "rigging whistle", 0, 0.3, 0, { css: SLT_CSS, w: 0.3 });
    reg(hits, whistle, "rigging-whistle");
    const loadCells = instrument(caseG, -0.3, 0.83, 0.1, { ry: 0.1, idle: "-- kg", color: SLT_ACCENT, w: 0.1, d: 0.14 });
    holoTag(loadCells, "load cells", 0, 0.14, 0, { css: SLT_CSS, w: 0.22 });
    reg(hits, loadCells, "load-cell-display");

    // ------------------------------------------------- hardware case, PPE
    const hw = toolChest(g, 1.4, 1.5, { ry: -0.3, color: 0x2b2b30 });
    const shackle = group(hw, 0.12, 0.8, 0.0);
    torus(shackle, 0.035, 0.01, 0, 0.04, 0, 0xe8b02e, { rough: 0.4, metal: 0.8, seg: 6, seg2: 12 });
    cyl(shackle, 0.008, 0.008, 0.08, 0, 0.0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(shackle, "mouse the shackles", 0, 0.2, 0, { css: SLT_CSS, w: 0.36 });
    reg(hits, shackle, "shackle-mouse");
    const junk = group(hw, -0.16, 0.8, 0.05);
    torus(junk, 0.03, 0.01, 0, 0.04, 0, 0x8a8f94, { rough: 0.6, metal: 0.5, seg: 6, seg2: 12 });
    holoTag(junk, "unmarked shackle?", 0, 0.22, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, junk, "unrated-shackle");
    const rack = group(g, -2.6, 0, 1.4, 0.4);
    cyl(rack, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.35, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const hat = group(rack, -0.14, 1.2, 0);
    ball(hat, 0.1, 0, 0, 0, 0xf2f2f2, { rough: 0.5 });
    box(hat, 0.24, 0.015, 0.26, 0, -0.04, 0.02, 0xf2f2f2, { rough: 0.5 });
    holoTag(rack, "hard hat", -0.14, 1.6, 0, { css: SLT_CSS, w: 0.2 });
    reg(hits, hat, "hard-hat");
    const gloves = group(rack, 0.16, 1.1, 0.02);
    box(gloves, 0.08, 0.14, 0.03, -0.03, 0, 0, 0xd8a63a, { rough: 0.9 });
    box(gloves, 0.08, 0.14, 0.03, 0.05, -0.02, 0.01, 0xd8a63a, { rough: 0.9 });
    holoTag(rack, "rigging gloves", 0.2, 1.5, 0, { css: SLT_CSS, w: 0.28 });
    reg(hits, gloves, "rigging-gloves");

    // --------------------------------------------------------- paperwork
    const plot = holoPanel(g, 0.95, 0.66, -2.35, 1.35, -0.6, (cx, w, h) => {
      cx.fillStyle = "#130a1c"; cx.fillRect(0, 0, w, h); cx.fillStyle = SLT_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#efe0ff"; cx.fillText("RIGGING PLOT — TRUSS A", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#f4ecfb";
      ["Points A1 (US) · A2 (DS) — bridled to roof steel", "Plotted load per point under the arena's limit", "Motors: rated above each point's load", "Bridle legs cut to the plot's angle",
       "Trim: per the lighting plot, level", "Steel secondaries at every point"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.9, accent: SLT_ACCENT });
    reg(hits, plot, "rigging-plot");
    const log = holoPanel(g, 0.6, 0.42, 2.5, 1.3, 1.4, (cx, w, h) => {
      cx.fillStyle = "#130a1c"; cx.fillRect(0, 0, w, h); cx.fillStyle = SLT_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#efe0ff"; cx.fillText("POINTS LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f4ecfb";
      ["A1: —", "A2: —", "Secondaries: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.9, accent: SLT_ACCENT });
    reg(hits, log, "rigging-log");
    const radio = instrument(hw, -0.02, 0.79, -0.1, { ry: 0.1, idle: "CH 1 · RIGGING", color: SLT_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "head rigger radio", 0, 0.16, 0, { css: SLT_CSS, w: 0.34 });
    reg(hits, radio, "head-rigger-radio");
    const ticket = decal(g, 0.2, 0.26, 2.2, 0.06, 0.3, paperFace("OUT OF SERVICE", ["section 3", "dented chord"], { bg: "#f2e0a0", band: "#d2312b" }), { px: 128 });
    ticket.rotation.x = -Math.PI / 2;
    ticket.visible = false;

    // ------------------------------------------------------------- crew
    const deckHand = standingFigure(g, -2.2, 2.3, { ry: 2.4, cloth: 0x14171a, helmet: 0xf2f2f2, gloves: true });
    holoTag(deckHand, "deck crew", 0, 1.95, 0, { css: SLT_CSS, w: 0.22 });
    const pusher = standingFigure(g, -2.8, -0.2, { ry: 1.2, cloth: 0x14171a, atStation: true });
    const cart = group(g, -2.2, 0, -0.2);
    box(cart, 0.6, 0.4, 0.4, 0, 0.35, 0, 0x2b2b30, { rough: 0.6 });
    for (const [wx, wz] of [[-0.25, -0.15], [0.25, -0.15], [-0.25, 0.15], [0.25, 0.15]]) ball(cart, 0.05, wx, 0.05, wz, 0x14171a, { rough: 0.8 });
    const pusherHome = pusher.position.clone(), cartHome = cart.position.clone();
    pusher.visible = false; cart.visible = false;

    let flown = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -0.95),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "truss-inspect") { dent.material = mat(0xd2312b, { emissive: 0x6a1a08, ei: 0.8, rough: 0.6 }); ticket.visible = true; }
        if (step.id === "truss-splice") spare.visible = false;
        if (step.id === "coupler-bolts") splice.visible = false;
        if (step.id === "chain-check") twist.visible = false;
        if (step.id === "motor-run") { flown = true; truss.position.y = SLT_TRUSS_Y + 1.6; truss.rotation.z = 0; for (const { m } of motors) m.position.y = 3.0; }
        if (step.id === "load-cells") repaint(loadCells.userData.screen, signFace("A1 412 · A2 398", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "secondaries") secondaries.visible = true;
        if (step.id === "rigging-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#130a1c"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#efe0ff"; cx.fillText("POINTS LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["A1: 412 kg · in plot", "A2: 398 kg · motor to service", "Secondaries on · shackles moused"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("DEAD-HUNG", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "cart-under-load") { pusher.visible = true; cart.visible = true; pusher.position.set(-1.2, 0, -0.35); cart.position.set(-0.6, 0, -0.75); }
        if (it.id === "motor-out-of-step") { truss.rotation.z = -0.12; motors[1].m.position.y = 1.9; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cart-under-load") { pusher.position.copy(pusherHome); cart.position.copy(cartHome); pusher.visible = false; cart.visible = false; }
        if (it.id === "motor-out-of-step") { truss.rotation.z = 0; estop.material = mat(0x6a1a14, { rough: 0.4 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "coupler-bolts") { boltGroup.visible = true; boltGroup.rotation.x = session.turn.amount * Math.PI * 2; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "bridle-angle") repaint(bridleGauge.userData.screen, signFace(`${Math.round(gg.t * 180)}°`, { bg: "#0d1c24", accent: gg.t >= 0.34 && gg.t <= 0.54 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (gg && !gg.committed && step?.id === "load-cells") repaint(loadCells.userData.screen, signFace(`${Math.round(gg.t * 1000)} kg`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "motor-run" && session.holding && !flown) {
          const v = session.track.v;
          truss.position.y = SLT_TRUSS_Y + Math.min(1.6, (session.track.inBand ?? 0) * 0.3);
          if (!session.activeInterrupt) truss.rotation.z = (v - 0.5) * 0.3;
        }
        void dt; void t; void CITY;
      },
    };
  },
};
