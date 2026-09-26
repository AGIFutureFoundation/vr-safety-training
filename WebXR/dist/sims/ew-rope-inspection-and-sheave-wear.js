import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
  gradientFill, noiseTexture, grimeOverlay,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag,
  standingFigure, surfaceTexture, texturedMat, paintedSteelFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Rope Inspection and Sheave Wear VR — IUEC elevator
// constructors, hoist rope maintenance. A traction elevator's hoist ropes
// share the load across every rope in the set, and they only do that job
// evenly for as long as each rope's own tension, diameter and wire condition
// stays inside the tolerance the others are holding to. This station is what
// finds the one rope that has quietly stopped doing its share.

const EWROP_ACCENT = 0x8fa6c9;

/** Machine room concrete floor: cool grey with light rope-hole hatching. */
function ewropFloorFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#3c434c"], [1, o.base2 ?? "#333940"]]);
  noiseTexture(g, w, h, { density: 2200, alpha: 0.07, tone: "0,0,0" });
  noiseTexture(g, w, h, { density: 800, alpha: 0.05, tone: "200,208,216" });
  const tiles = o.tiles ?? 3, t = w / tiles;
  g.fillStyle = "rgba(0,0,0,0.35)";
  for (let i = 1; i < tiles; i++) { g.fillRect(i * t - 1.5, 0, 3, h); g.fillRect(0, i * t - 1.5, w, 3); }
}

export const SIM_EW_ROPE_INSPECTION_AND_SHEAVE_WEAR = {
  id: "ew-rope-inspection-and-sheave-wear",
  index: "358",
  domain: "Facilities",
  trade: "Elevator constructor / mechanic — IUEC",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "IUEC elevator constructors; NEIEP apprenticeship curriculum for rope and sheave maintenance; ASME A17.1 the safety code for elevators and escalators, whose wire-rope and sheave-wear provisions this station follows; OSHA 29 CFR 1910.147 control of hazardous energy for the drive isolation",
  name: "Rope Inspection and Sheave Wear",
  title: simTitle("Rope Inspection and Sheave Wear"),
  tagline: "Isolating the drive, walking the rope set for broken wires, gauging tension, diameter and groove wear, lubricating and re-equalizing before the car returns to service",
  accent: EWROP_ACCENT,
  accentCss: "#8fa6c9",
  parSeconds: 265,
  footprint: 2.2,
  badge: { id: "rope-set-proven", name: "Rope Set Proven", note: "Every rope inspected, gauged and equalized, with the sheave groove checked against its own wear limit" },

  game: system({
    name: "Rope Authority",
    currency: "TENSION",
    ranks: ["Helper", "Rope Mechanic", "Adjuster", "Lead Mechanic", "Rope Authority Certified"],
    badges: [
      { id: "isolated-first", name: "Isolated First", note: "Never handled a rope before the drive was isolated and locked", test: AWARD.stepClean("lock") },
      { id: "true-tension", name: "True Tension", note: "Held tension, diameter and groove readings all near band centre", test: AWARD.precise(0.7) },
      { id: "clean-restore", name: "Clean Restore", note: "Restored in the correct order, no correction", test: AWARD.stepClean("restore") },
    ],
    challenges: [
      { id: "no-callback", name: "No Callback", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "equalizer-held", name: "Equalizer Held", note: "Never let the equalizer adjustment slip mid-turn", test: AWARD.unbroken },
      { id: "rope-fast", name: "Rope Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "rope-pinch-sheave": "That nip point is where a rope disappears into its groove, and a groove machined to grip a moving rope tightly enough to drive a loaded car grips anything else offered to it exactly as firmly. Nobody's fingers get a vote in that once the meter has not yet said this machine is actually still.",
    "broken-wire-snag": "You ran a bare hand along a section of rope with broken wires standing proud of the strand. Those broken ends are exactly sharp and stiff enough to open a hand at speed, which is why a rope like this is checked with a gloved hand moving slowly, feeling for exactly this.",
    "equalizer-spring-release": "You loosened the rope equalizer's locknut without confirming the spring behind it was not still compressed under load. An equalizer spring under tension that lets go while a wrench is on it does not ease open — it releases whatever energy it was holding all at once.",
    "open-rope-shaft-opening": "You stood over the machine room's rope holes without checking the guards were in place. Those holes exist so the ropes can pass down into the hoistway, and an unguarded one is a fall straight down the shaft for anyone whose footing is a little off.",
  },

  lateNotes: {
    "rope-tension": "Tension is only compared across the rope set once the drive is proven dead and the car is not moving.",
    "equalizer-nut": "The equalizer is only adjusted once every rope's own readings are already logged.",
  },

  supportLine: "your IUEC local's member assistance programme, or the NEIEP training coordinator for anything about the certification record",

  steps: [
    {
      id: "checkin", kind: "select", target: "job-ticket",
      title: "Check in at the machine room",
      cue: "Read the job ticket and confirm which car's rope set this service is for.",
      why: "More than one car can share a machine room, sometimes with sheaves close enough together that a rope set from one blends into another at a glance, and the ticket names the specific rope set before a tool touches any sheave — so the isolation that follows actually covers the car this job is about, and not the one parked next to it.",
    },
    {
      id: "permit", kind: "select", target: "machine-room-permit",
      title: "Post out-of-service signage",
      cue: "Read the work order and confirm car-out-of-service signage is posted at every landing.",
      why: "Signage goes up at every landing before the disconnect comes down, because a rope inspection puts hands directly on the ropes and sheave this car's next passenger would otherwise be relying on without a second thought — and a car that answers a call in the middle of this visit is a car answering it with somebody's hand already on the rope set.",
    },
    {
      id: "disconnect", kind: "turn", target: "main-disconnect",
      title: "Cut the drive's feed",
      cue: "Take the machine room's main handle all the way to its open detent.",
      why: "A sheave does not need much rotation to close whatever is between it and its groove, so this handle goes to its full detent rather than somewhere that merely looks open. Ropes are inspected by feel, close to the groove, and the person doing that is trusting this one motion more than anything else in the room.",
      turn: { turns: 0.2, axis: "z", reverse: true, label: "MAIN LINE DISCONNECT" },
    },
    {
      id: "lock", kind: "select", target: "lockout-hasp",
      title: "Fit your padlock to the hasp",
      cue: "Your lock goes on before a glove touches a single rope.",
      why: "A sheave sitting still because a handle is open is not the same claim as a sheave that cannot be started by somebody who does not know a hand is following one of its ropes right now — that second claim is what the padlock makes, and it is the only one this job actually needs.",
    },
    {
      id: "verify-zero", kind: "gauge", target: "drive-meter",
      title: "Confirm the drive is dead at the terminals",
      cue: "Read the drive input and commit once it settles at zero.",
      why: "The padlock is a statement about the handle; the reading on this meter is a statement about the motor windings themselves, which is the thing actually connected to the sheave. Prove the meter against a source known to be alive first, so a dead reading here means the drive is dead and not that the meter's fuse already failed.",
      gauge: {
        label: "DRIVE INPUT — VOLTAGE", speed: 0.6, green: [0.0, 0.08],
        readout: (t) => `${Math.round(t * 480)} V`,
        missNote: "Still reading live. Recheck the disconnect before the ropes are handled.",
      },
    },
    {
      id: "rope-inspect", kind: "find", noHint: true,
      targets: ["broken-wire-cluster", "dry-rope-section", "kinked-rope"],
      itemNames: { "broken-wire-cluster": "a cluster of broken wires", "dry-rope-section": "a dry, unlubricated section of rope", "kinked-rope": "a rope with a visible kink" },
      itemNotes: {
        "broken-wire-cluster": "A handful of broken wires within one lay length of rope is counted against the rope's own retirement criteria, not judged by whether the rope still looks strong overall.",
        "dry-rope-section": "A dry section of rope is wearing its own wires against each other with nothing between them, which turns ordinary flexing over the sheave into the thing that produces the next broken wire.",
        "kinked-rope": "A kink is a permanent deformation the rope carries with it into every bend it makes from now on, concentrating stress at that one point on every single trip this car makes.",
      },
      title: "Walk the rope set before gauging anything",
      cue: "Look and feel along each rope with a gloved hand. Three things need fixing before this set is gauged.",
      why: "A rope inspection is done by hand as much as by eye, because a lot of what actually ends a rope's service life — the first few broken wires, a section running dry — is easier to feel through a glove than to see from the machine room floor.",
    },
    {
      id: "tension-check", kind: "gauge", target: "rope-tension",
      title: "Check rope tension across the set",
      cue: "Set the tension gauge on the rope reading lowest and commit against the rest of the set.",
      why: "Ropes share the load only as long as their tensions stay close to each other — a rope that has stretched more than its neighbours quietly starts carrying less of the load than it should, right up until it is carrying almost none of it.",
      gauge: {
        label: "ROPE TENSION", speed: 0.6, green: [0.42, 0.6],
        readout: (t) => `${Math.round(t * 4)} kN`,
        missNote: "Outside the equalization band. This rope gets flagged for the equalizer adjustment, not ignored.",
      },
    },
    {
      id: "diameter-gauge", kind: "gauge", target: "rope-diameter",
      title: "Gauge the rope diameter",
      cue: "Set the go/no-go gauge on the rope and commit the reading against the manufacturer's minimum.",
      why: "A rope's diameter shrinks as its wires wear and its core compacts, and that reduction is exactly what the manufacturer's retirement criteria are written against — a rope a few percent under its nominal diameter is a rope with measurably less wire left to carry the load.",
      gauge: {
        label: "ROPE DIAMETER", speed: 0.55, green: [0.44, 0.62],
        readout: (t) => `${(10 + t * 3).toFixed(2)} mm`,
        missNote: "Below the manufacturer's minimum. This rope is flagged for replacement, not carried forward on a hopeful reading.",
      },
    },
    {
      id: "lubrication", kind: "drag", target: "oil-can",
      title: "Lubricate the rope set",
      cue: "Carry the rope lubricant to the dry section and apply it along the rope.",
      why: "Lubrication is applied after tension and diameter are already measured and logged, so the numbers on file describe the rope's true condition rather than one softened by lubricant nobody accounted for — and a dry section left dry any longer than that is one more trip over the sheave wearing wire against wire with nothing between them.",
      drag: { to: "rope-lube-point", radius: 0.4, missNote: "Not at the lubrication point. Lubricant applied anywhere else on the rope run does nothing for the dry section it is meant to reach." },
    },
    {
      id: "equalizer-adjust", kind: "turn", target: "equalizer-nut",
      title: "Adjust the rope equalizer",
      cue: "Turn the equalizer locknut to bring the flagged rope's tension back in line with the rest of the set.",
      why: "The equalizer is what lets one rope's tension be corrected without disturbing the others, and it is turned to the reading already taken, not by feel — a rope over-corrected here just trades one unequal tension for another.",
      turn: { turns: 0.3, axis: "z", label: "EQUALIZER NUT" },
    },
    {
      id: "groove-wear", kind: "gauge", target: "sheave-groove",
      title: "Check the sheave groove wear",
      cue: "Set the groove wear gauge in the sheave and commit the reading against the wear template.",
      why: "A worn groove no longer grips a rope the way a fresh one does, and it wears the rope sitting in it faster in return, which is how a sheave and its own rope set end up wearing each other out together — a groove is checked against the template's own profile, not against how deep it looks by eye.",
      gauge: {
        label: "GROOVE WEAR", speed: 0.55, green: [0.4, 0.6],
        readout: (t) => `${(t * 2).toFixed(2)} mm undercut`,
        missNote: "Past the wear template's limit. This sheave gets flagged for re-grooving or replacement before the ropes go back on it.",
      },
    },
    {
      id: "restore", kind: "sequence",
      targets: ["lockout-hasp", "main-disconnect"],
      itemNames: { "lockout-hasp": "your lock off the hasp", "main-disconnect": "main line disconnect" },
      title: "Bring the machine back the way it left",
      cue: "Your padlock comes off the hasp first; the handle goes home last.",
      why: "Taking your own lock off is the one act in this whole job nobody else is allowed to do for you, and it happens only once every hand that has been near the sheave is somewhere else. The handle closing is what actually lets the sheave turn again, so it is the very last thing this visit does.",
      outOfOrderNote: "Wrong order — your lock off first, and the handle closed last.",
    },
    {
      id: "test-run", kind: "select", target: "controller-panel",
      title: "Send the car on an ordinary trip",
      cue: "Let the car make one full run through its floors before you call this finished.",
      why: "Everything measured so far describes ropes and a sheave standing still; an ordinary run is what actually puts the set under the load it spends its whole life carrying, and it is the only check in this visit that does.",
    },
    {
      id: "log", kind: "select", target: "rope-log",
      title: "Log the rope service",
      cue: "Write the tension, diameter and groove readings on the rope log.",
      why: "The next mechanic who opens this machine room reads this log before they read the ropes themselves, and a reading left unwritten today is a reading somebody else has to retake from zero the next time this set is due — with no way of knowing whether a number that looks off is new wear or the same fault this visit already found and fixed.",
    },
  ],

  interrupts: [
    {
      id: "second-source-call",
      kind: "Call registered",
      after: "rope-inspect", delay: 4, seconds: 12,
      alert: "A hall call has just registered on the controller while you are still handling the rope set.",
      cue: "Prove the disconnect is still open before your hands go back to the ropes.",
      target: "main-disconnect",
      why: "A registered call on a machine that should be dead means either the isolation has failed or a second source is feeding this controller — either way, nothing about the rope inspection continues until the disconnect is confirmed open again, with your own eyes on it.",
      missNote: "The call sat there registered with the disconnect unconfirmed. A sheave that turns even a little while a hand is following a rope into it does not give a warning first.",
      wrongNote: "It is the main disconnect. A call registering on a machine that should be dead is the only thing worth checking right now.",
    },
    {
      id: "uncoordinated-adjustment",
      kind: "Equalizer interfered with",
      after: "diameter-gauge", delay: 4, seconds: 11,
      alert: "A second mechanic has walked up and started turning a different rope's equalizer nut without checking with you first.",
      cue: "Stop them — nobody adjusts an equalizer off a reading they have not seen.",
      target: "equalizer-nut",
      why: "An equalizer turned by someone who has not seen this visit's tension readings can just as easily throw the set further out of balance as bring it into line, and two mechanics adjusting the same rope set without talking is how a correctly diagnosed problem gets a guessed-at fix.",
      missNote: "The second mechanic kept turning the equalizer on their own reading. Whatever tension that rope ends up at now, nobody wrote down why, and the next inspection starts from a number nobody trusts.",
      wrongNote: "It is the equalizer nut. Whoever is turning it needs to see this visit's readings before it moves any further.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, EWROP_ACCENT);

    // ------------------------------------------------------------- the floor
    const floorTex = surfaceTexture((cx, w, h) => ewropFloorFace(cx, w, h, {}), { repeat: 3, px: 320 });
    const floor = box(g, 4.6, 0.1, 4.2, 0, 0.05, 0, 0x3c434c, { rough: 0.85, metal: 0.1 });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.1, color: 0x3c434c });

    // ------------------------------------------------------------ machine bed
    const bedTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#3a4a63", base2: "#324056" }), { repeat: 1, px: 320 });
    const bed = box(g, 2.0, 0.3, 1.2, 0, 0.15, -0.9, 0x3a4a63, { rough: 0.6, metal: 0.3 });
    bed.material = texturedMat(bedTex, { rough: 0.55, metal: 0.3, color: 0x3a4a63 });

    // Drive sheave with grooves, overhead of the machine bed.
    const machine = group(g, 0, 0.65, -0.9);
    const sheave = cyl(machine, 0.3, 0.3, 0.34, 0, 0, 0, CITY.darkSteel, { rough: 0.4, metal: 0.7, seg: 28 });
    sheave.rotation.z = Math.PI / 2;
    reg(hits, sheave, "rope-pinch-sheave");
    for (let i = 0; i < 5; i++) {
      torus(machine, 0.3, 0.012, 0, -0.14 + i * 0.07, 0, 0x14181e, { rough: 0.6, seg: 6, seg2: 24 }).rotation.y = Math.PI / 2;
    }
    const wornGroove = box(machine, 0.02, 0.02, 0.6, 0, 0.02, 0, 0x1b1e22, { rough: 0.6 });
    reg(hits, wornGroove, "sheave-groove");
    const grooveGauge = instrument(machine, 0.5, 0.1, 0.1, { ry: 0.3, idle: "-- mm", color: 0x8fa6c9 });
    holoTag(grooveGauge, "Groove wear gauge", 0, 0.16, 0, { css: "#8fa6c9", w: 0.34 });

    // Five ropes running from the sheave down into the shaft.
    const ropeHoles = group(g, 0, 0, -0.5);
    box(ropeHoles, 1.6, 0.02, 0.6, 0, 0, 0, 0x22262b, { rough: 0.7, cast: false });
    const guardGap = box(ropeHoles, 0.3, 0.04, 0.2, 0.55, 0.01, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(guardGap, "Rope hole — guard first", 0, 0.1, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, guardGap, "open-rope-shaft-opening");

    let dryRopeMarker = null, kinkMarker = null, brokenWireMarker = null;
    for (let i = 0; i < 5; i++) {
      const rx = -0.6 + i * 0.3;
      const pts = [[rx, 0.65, -0.9], [rx * 0.9, -0.3, -0.6], [rx * 0.7, -1.6, -0.4]];
      const r = hose(g, pts, 0.012, 0x2a2e33, { steps: 14, rough: 0.55, metal: 0.4 });
      if (i === 1) dryRopeMarker = r;
      if (i === 2) kinkMarker = box(g, 0.05, 0.05, 0.05, rx * 0.85, -0.9, -0.5, 0x8a5a34, { rough: 0.7 });
      if (i === 3) brokenWireMarker = group(g, rx * 0.85, -0.5, -0.5);
    }
    dryRopeMarker.material = mat(0x8a7a5a, { rough: 0.85, metal: 0.1 });
    reg(hits, dryRopeMarker, "dry-rope-section");
    reg(hits, kinkMarker, "kinked-rope");
    for (let i = 0; i < 4; i++) {
      cyl(brokenWireMarker, 0.003, 0.003, 0.03, (Math.random() - 0.5) * 0.03, i * 0.015, 0, 0xc0c6cc, { rough: 0.5, seg: 6 });
    }
    holoTag(brokenWireMarker, "Broken wires", 0, 0.08, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, brokenWireMarker, "broken-wire-cluster");
    const snagZone = box(g, 0.08, 0.3, 0.08, -0.15, -0.3, -0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(snagZone, "gloved hand only", 0, 0.2, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, snagZone, "broken-wire-snag");

    const tensionGauge = instrument(g, 0.9, 0.3, -0.3, { ry: -0.3, idle: "-- kN", color: 0x8fa6c9 });
    holoTag(tensionGauge, "Rope tension gauge", 0, 0.16, 0, { css: "#8fa6c9", w: 0.34 });
    reg(hits, tensionGauge, "rope-tension");
    const diameterGauge = instrument(g, -0.9, 0.3, -0.3, { ry: 0.3, idle: "-- mm", color: 0x8fa6c9 });
    holoTag(diameterGauge, "Rope diameter gauge", 0, 0.16, 0, { css: "#8fa6c9", w: 0.36 });
    reg(hits, diameterGauge, "rope-diameter");

    // Rope equalizer assembly at the hitch plate.
    const equalizer = group(machine, 0.7, -0.1, 0, 0.2);
    box(equalizer, 0.14, 0.1, 0.1, 0, 0, 0, 0x53585e, { rough: 0.5, metal: 0.5 });
    const equalizerNutLever = box(equalizer, 0.03, 0.06, 0.03, 0.08, 0.04, 0, 0xd8b23a, { rough: 0.5, metal: 0.5 });
    holoTag(equalizer, "Rope equalizer", 0, 0.14, 0, { css: "#8fa6c9", w: 0.32 });
    reg(hits, equalizerNutLever, "equalizer-nut");
    const springZone = box(equalizer, 0.06, 0.08, 0.06, -0.08, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(springZone, "spring under load", 0, 0.1, 0, { css: "#f0645b", w: 0.38 });
    reg(hits, springZone, "equalizer-spring-release");

    const lubePoint = ball(g, 0.02, -0.5, -0.1, -0.55, 0xd8b23a, { emissive: 0xd8b23a, ei: 0.6 });
    holoTag(lubePoint, "Rope lubrication point", 0, 0.1, 0, { css: "#8fa6c9", w: 0.4 });
    reg(hits, lubePoint, "rope-lube-point");

    const oilCan = group(g, -1.8, 0.1, 1.2);
    cyl(oilCan, 0.045, 0.05, 0.16, 0, 0.08, 0, 0xe0a93a, { rough: 0.5, metal: 0.3, seg: 12 });
    holoTag(oilCan, "Rope lubricant", 0, 0.2, 0, { css: "#8fa6c9", w: 0.26 });
    reg(hits, oilCan, "oil-can");

    // ------------------------------------------------------------- controls
    const wall = group(g, 1.7, 0, -1.5, -0.5);
    slab(wall, 0.4, 1.0, 0.24, 0, 0.7, 0, 0x545e67, { radius: 0.03, rough: 0.5, metal: 0.5 });
    const discHandle = group(wall, 0, 0.95, 0.13);
    box(discHandle, 0.045, 0.14, 0.045, 0, 0, 0, 0x8fa6c9, { rough: 0.5 });
    decal(wall, 0.32, 0.05, 0, 1.16, 0.125, signFace("MAIN LINE DISCONNECT", { accent: "#8fa6c9", scale: 0.4 }));
    reg(hits, discHandle, "main-disconnect");
    const hasp = torus(wall, 0.02, 0.006, 0.12, 0.58, 0.13, CITY.steel, { rough: 0.3, metal: 0.9 });
    hasp.rotation.y = Math.PI / 2;
    reg(hits, hasp, "lockout-hasp");
    const appliedLock = lockTag(wall, 0.12, 0.58, 0.15);
    appliedLock.visible = false;

    const controller = group(g, 1.8, 0, 0.5, -0.9);
    slab(controller, 0.28, 0.36, 0.09, 0, 0.9, 0, 0x2b3138, { radius: 0.03, rough: 0.5, metal: 0.4 });
    const controllerScreen = decal(controller, 0.22, 0.14, 0, 0.98, 0.047, signFace("ARMED", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.4 }), { glow: true, ei: 0.85, px: 256 });
    holoTag(controller, "Car controller", 0, 1.12, 0.05, { css: "#8fa6c9", w: 0.3 });
    const callLamp = ball(controller, 0.02, 0.1, 1.06, 0.045, 0xf2c14b, { emissive: 0xf2c14b, ei: 2.4 });
    callLamp.visible = false;
    reg(hits, controller, "controller-panel");

    const driveMeter = instrument(g, 1.7, 0.5, -0.9, { ry: -0.4, idle: "-- V", color: 0x8fa6c9 });
    holoTag(driveMeter, "CAT III meter", 0, 0.16, 0, { css: "#8fa6c9", w: 0.28 });
    reg(hits, driveMeter, "drive-meter");

    // -------------------------------------------------------------- docs + tools
    const chest = toolChest(g, -1.8, -1.2, { ry: 0.6, color: 0x8fa6c9 });
    void chest;

    const ticket = holoPanel(g, 0.5, 0.36, -1.9, 1.4, 1.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8fa6c9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dbe6f2"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("JOB TICKET — CAR 8 ROPES", w * 0.06, h * 0.18);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#c3d3e6";
      ["Full rope set + sheave groove", "Tension, diameter, wear", "Log before sign-off"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.4 + i * 0.16)));
    }, { ry: 0.5, accent: 0x8fa6c9 });
    reg(hits, ticket, "job-ticket");

    const permitPanel = holoPanel(g, 0.56, 0.4, -0.7, 1.5, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8fa6c9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dbe6f2"; ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK ORDER EW-39", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf0f8"; ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CAR 8 — ROPE SERVICE", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#d5e0ec";
      ["Signage: all landings out-of-service", "Tension, diameter to spec", "Groove wear vs template", "Test run before release"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.3, accent: 0x8fa6c9 });
    reg(hits, permitPanel, "machine-room-permit");

    const logPanel = holoPanel(g, 0.5, 0.34, 1.9, 1.4, 1.2, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8fa6c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf0f8"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("ROPE LOG — CAR 8", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d5e0ec";
      cx.fillText("Tension, diameter,", w * 0.06, h * 0.48);
      cx.fillText("groove wear this visit", w * 0.06, h * 0.68);
    }, { ry: -0.6, accent: 0x8fa6c9 });
    reg(hits, logPanel, "rope-log");

    // Second mechanic near the controller.
    // ---------------------------------------------------------- room dressing
    const tray = group(g, 0, 2.6, 1.0);
    box(tray, 3.6, 0.06, 0.3, 0, 0, 0, 0x596069, { rough: 0.6, metal: 0.4, cast: false });
    for (let i = 0; i < 8; i++) box(tray, 0.02, 0.05, 0.3, -1.7 + i * 0.48, -0.03, 0, 0x3c444c, { cast: false, receive: false });
    for (let i = 0; i < 3; i++) {
      const cable = cyl(g, 0.014, 0.014, 0.5, -1.5 + i * 0.6, 2.3, 1.0, 0x1b1e22, { rough: 0.85, seg: 8, cast: false });
      cable.rotation.x = Math.PI / 2;
    }
    const shelf = group(g, -2.0, 0, -1.2, 0.4);
    box(shelf, 0.5, 0.03, 0.3, 0, 0.55, 0, 0x53585e, { rough: 0.6, metal: 0.4 });
    box(shelf, 0.5, 0.03, 0.3, 0, 0.9, 0, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const [sx, sy] of [[-0.14, 0.58], [0.05, 0.58], [-0.05, 0.93], [0.12, 0.93]]) {
      box(shelf, 0.13, 0.05, 0.18, sx, sy, 0, 0x2b3138, { rough: 0.55, metal: 0.4 });
    }
    holoTag(shelf, "Spare rope hardware", 0, 1.02, 0, { css: "#8fa6c9", w: 0.34 });
    const extinguisher = group(g, 2.1, 0, 1.6, -0.2);
    cyl(extinguisher, 0.05, 0.06, 0.28, 0, 0.5, 0, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 12 });
    cyl(extinguisher, 0.015, 0.02, 0.06, 0, 0.67, 0, 0x22272c, { rough: 0.4, metal: 0.6, seg: 10 });
    const vent = group(g, 2.0, 1.5, -1.55, 0.3);
    box(vent, 0.5, 0.4, 0.05, 0, 0, 0, 0x3a4a63, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 6; i++) box(vent, 0.42, 0.045, 0.02, 0, -0.15 + i * 0.06, 0.03, 0x2b3138, { rough: 0.55, metal: 0.4 });

    const otherMech = standingFigure(g, -0.9, 1.4, { ry: 2.4, cloth: 0x37505f, helmet: 0x8fa6c9, vest: 0xe4dc3a });
    holoTag(otherMech, "second mechanic", 0, 1.95, 0, { css: "#8fa6c9", w: 0.36 });
    const mechHome = otherMech.position.clone();

    let live = true;

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "disconnect") { live = false; discHandle.rotation.z = Math.PI / 2; repaint(controllerScreen, signFace("ISOLATED", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.38 })); }
        if (step.id === "lock") appliedLock.visible = true;
        if (step.id === "verify-zero") repaint(controllerScreen, signFace("DE-ENERGISED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        if (step.id === "equalizer-adjust") equalizerNutLever.rotation.y = 1.0;
        if (step.id === "restore") {
          appliedLock.visible = false; discHandle.rotation.z = 0; live = true;
          repaint(controllerScreen, signFace("READY", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
        }
        if (step.id === "test-run") repaint(controllerScreen, signFace("TEST\nTRIP OK", { bg: "#0d1c14", accent: "#8fa6c9", fg: "#e2ecf5", scale: 0.32 }));
      },

      onInterrupt(it) {
        if (it.id === "second-source-call") { callLamp.visible = true; repaint(controllerScreen, signFace("HALL CALL\nLANDING 6", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.3 })); }
        if (it.id === "uncoordinated-adjustment") { otherMech.position.set(0.5, mechHome.y, -0.7); equalizerNutLever.rotation.y = 0.5; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "second-source-call") { callLamp.visible = false; repaint(controllerScreen, signFace("DE-ENERGISED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 })); }
        if (it.id === "uncoordinated-adjustment") { otherMech.position.copy(mechHome); equalizerNutLever.rotation.y = 0; }
      },

      animate(t, dt, session) {
        if (live) controllerScreen.material.emissiveIntensity = 0.7 + Math.sin(t * 2) * 0.15;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "verify-zero") {
            const v = Math.round(gg.t * 480);
            repaint(driveMeter.userData.screen, signFace(`${v} V`, { bg: "#0d1c24", accent: v < 38 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
          }
          if (session.step?.id === "tension-check") {
            const kn = (gg.t * 4).toFixed(1);
            repaint(tensionGauge.userData.screen, signFace(`${kn} kN`, { bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
          }
          if (session.step?.id === "diameter-gauge") {
            const mm = (10 + gg.t * 3).toFixed(2);
            repaint(diameterGauge.userData.screen, signFace(`${mm} mm`, { bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
          }
          if (session.step?.id === "groove-wear") {
            const mm = (gg.t * 2).toFixed(2);
            repaint(grooveGauge.userData.screen, signFace(`${mm} mm`, { bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
          }
        }
      },
    };
  },
};
