import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, rackFrame, rackUnit,
  cone, barrierPanel, reg,
} from "../citykit.js";
import { ladleCrane } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ladle Pour VR — Manufacturing & Automation, mill and mine
// pack, station two.
//
// A steel ladle, full and hanging on its crane trunnions, tilted to pour into
// a mould. Every hazard here comes from the same fact: the metal in the
// ladle is molten, and nothing about how it looks from a few metres away
// tells you that a splash off it will go through ordinary clothing before
// anyone can react. The PPE goes on before the ladle is approached, the
// splash barrier is closed before the tilt starts, additions go in dry and
// through the chute rather than by hand, and the tilt itself is worked at a
// controlled rate a crew can stop the instant the stream says something is
// wrong. Per the plant's own procedure and the label on the PPE throughout.

const LP_ACCENT = 0xd8552a;

export const SIM_MM_LADLE_POUR = {
  id: "mm-ladle-pour",
  index: "709",
  domain: "Manufacturing",
  trade: "Steelmaking ladle crew",
  category: "Manufacturing & Automation",
  indoor: "plant",
  certification: "USW Tony Mazzocchi Center health and safety training; OSHA 29 CFR 1910.132 personal protective equipment; OSHA 29 CFR 1910.133 eye and face protection; ANSI/ISEA 105 hand protection classification; ANSI/ISEA Z358.1 emergency eyewash and shower equipment",
  name: "Ladle Pour",
  title: simTitle("Ladle Pour"),
  tagline: "A molten-metal ladle tilted to pour: PPE on, the splash barrier closed, additions dry and through the chute, the tilt held to a controlled rate",
  accent: LP_ACCENT,
  accentCss: "#d8552a",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "clean-heat", name: "Clean Heat", note: "A heat poured behind a closed barrier, in full PPE, with the tilt held steady and nothing wet ever going near the metal" },

  game: system({
    name: "Pour Deck Authority",
    currency: "HEAT",
    ranks: ["Ladle Helper", "Pourer", "Ladle Operator", "Melt Shop Lead", "Pour Deck Authority Certified"],
    badges: [
      { id: "ppe-first", name: "PPE First", note: "Full PPE on before the ladle was ever approached, first time", test: AWARD.stepClean("ppe-don") },
      { id: "behind-the-barrier", name: "Behind The Barrier", note: "Never stood in the splash zone, added anything wet, or looked at the stream unshielded", test: AWARD.safe },
      { id: "steady-tilt", name: "Steady Tilt", note: "Tilt rate held inside its band the whole pour", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-pour", name: "Clean Pour", note: "No corrections through the whole heat", test: AWARD.clean },
      { id: "tilt-unbroken", name: "Tilt Unbroken", note: "The tilt never broke its controlled rate", test: AWARD.unbroken },
      { id: "heat-fast", name: "Heat Fast", note: "Heat poured and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "splash-zone": "You stood in the splash zone while the stream was live. A splash off molten steel does not behave like a splash off anything ordinary — it goes through cloth, it sticks, and the couple of seconds it takes to react is already too long. The zone in front of the stream is empty by design, not watched from a safe distance by luck.",
    "wet-alloy-bag": "You reached for the damp addition bag. Moisture meeting molten metal flashes to steam far faster than it can escape, and a wet addition dropped into a ladle is one of the more reliable ways to start a violent eruption out of the top of it. Additions go in dry, every time, with no exception for a bag that only got a little wet.",
    "bare-sample-spoon": "You picked up the sample spoon with the bare handle. A spoon that has been resting near an open ladle carries heat well up its shaft, and a hand on bare metal there does not get a warning before it is burned — the insulated handle is what makes the spoon safe to hold, not how careful the hand holding it tries to be.",
    "direct-stream-view": "You leaned to look straight at the stream through the gap in the barrier. The stream throws both heat and light that a face shield is rated for and an unprotected look is not; the barrier has a gap for the mirror that is meant to be used, not for a face.",
  },

  lateNotes: {
    "tilt-control-lever": "Not yet. The barrier is closed and the temperature is read before the ladle tilts.",
    "alloy-bag": "The addition goes in once the stream is already running clean, not before.",
  },

  steps: [
    {
      id: "pour-order", kind: "select", target: "pour-order-board",
      title: "Read the heat's pour order",
      cue: "Check the heat number, the grade, the target temperature band and the mould this heat is going to.",
      why: "The pour order is what says which mould this heat belongs to and what temperature band it is supposed to be poured in, and it is read before the ladle is ever approached. A crew that pours from memory rather than from the order is one heat away from pouring the wrong grade into the wrong mould.",
    },
    {
      id: "ppe-don", kind: "sequence", anyOrder: true,
      targets: ["reflective-coat", "face-shield-down", "heat-gauntlets"],
      itemNames: { "reflective-coat": "aluminized coat on", "face-shield-down": "face shield down", "heat-gauntlets": "heat gauntlets on" },
      title: "Put on the full pour PPE",
      cue: "Aluminized coat on, face shield down, heat gauntlets on — all three before the ladle is approached.",
      why: "Radiant heat off an open ladle reaches skin long before a splash ever could, and the coat, the shield and the gauntlets each answer a different part of that exposure. None of the three does the other one's job: a shield with no coat still leaves the forearms exposed, and a coat with the shield up still leaves the face to whatever the stream throws.",
    },
    {
      id: "shell-check", kind: "find", noHint: true,
      targets: ["shell-hot-spot"],
      itemNames: { "shell-hot-spot": "a bright hot spot on the ladle shell" },
      itemNotes: { "shell-hot-spot": "There is a patch on the ladle's outer shell glowing brighter than the steel around it — the sign of refractory wearing thin enough that the shell itself is starting to feel the heat the lining is supposed to be holding back." },
      title: "Walk the ladle shell before it is hung",
      cue: "Check the shell for a hot spot and click what you see.",
      why: "A ladle's refractory lining is what stands between the shell and several tonnes of molten steel, and a shell that has started to glow is a lining that is failing, not a ladle that is merely warm. Finding it here, before the ladle is hung and tilted, is what keeps a thin spot from becoming a breakout with the ladle already over the mould.",
    },
    {
      id: "trunnion-lock", kind: "select", target: "trunnion-lock",
      title: "Confirm the crane hook is locked on the trunnions",
      cue: "Check the hook's safety latch is closed over the trunnion pin before the ladle is lifted.",
      why: "The trunnions are the only thing the crane is actually holding the ladle by, and the latch is what keeps the hook from walking off the pin under the ladle's own swing. A ladle this heavy that comes off its hook does not fall so much as it lands, all at once, wherever it happens to be hanging.",
    },
    {
      id: "position-trolley", kind: "drag", target: "trolley-token",
      title: "Position the ladle over the mould",
      cue: "Drag the trolley control to the marked pour position over the mould.",
      why: "The trolley is what moves the ladle across the bay, and the pour position mark is where the stream will actually land inside the mould rather than off its edge. Getting the position right before the tilt starts is what keeps the whole pour aimed at the mould instead of correcting a stream that has already started running.",
      drag: { to: "pour-position-mark", radius: 0.4, missNote: "Not on the mark — the stream needs to land inside the mould, not beside it." },
    },
    {
      id: "clear-splash-zone", kind: "select", target: "splash-barrier",
      title: "Close the splash barrier",
      cue: "Swing the splash barrier closed across the pour deck before the tilt starts.",
      why: "The barrier is what keeps anyone but the pourer out of the zone the stream can reach if it splashes, and it is closed before the tilt starts rather than trusted to stop somebody who has already wandered into range. A barrier closed after the pour begins has already failed at the one job it has.",
    },
    {
      id: "sample-temp", kind: "hold", target: "immersion-probe", seconds: 5,
      title: "Read the heat's temperature",
      cue: "Dip the immersion probe and hold it until the reading settles.",
      why: "The pour order's temperature band is only useful against a real reading taken right before the tilt — a heat that has sat can cool well outside the band the mould was designed to be filled at, and pouring outside that band is how a casting comes out with defects that show up only after it has already solidified.",
      holdBreakNote: "You pulled the probe before the reading settled. A number taken mid-dip is not the heat's actual temperature yet.",
    },
    {
      id: "tilt-start", kind: "turn", target: "tilt-control-wheel",
      title: "Crack the ladle off the stop",
      cue: "Turn the tilt wheel a small amount to ease the ladle off its rest before committing to the pour.",
      why: "Easing the ladle off its stop slowly, rather than starting straight into the full tilt rate, is what lets the crew see the first of the stream while the ladle is barely open — the moment a nozzle or a lining problem shows itself, before the pour is running at full rate and hard to stop cleanly.",
      turn: { turns: 0.25, axis: "x", label: "TILT" },
    },
    {
      id: "tilt-pour", kind: "track", target: "tilt-control-lever", seconds: 6,
      title: "Hold the tilt through the pour",
      cue: "Hold the tilt lever steady and keep the rate in the controlled band as the stream runs.",
      why: "A tilt taken too fast overfills the mould and throws the stream wide of where the trolley aimed it; a tilt taken too slow lets the stream wander and cool as it falls. The steady rate a pourer holds through the whole heat is what keeps the stream landing exactly where the trolley put the ladle.",
      track: { start: 0.1, green: [0.42, 0.6], rise: 0.5, fall: 0.42, drift: 0.13, label: "TILT RATE", readout: (v) => (v < 0.42 ? "too slow" : v > 0.6 ? "too fast" : "controlled") },
      holdBreakNote: "Tilt rate out of band — bring it back before the stream drifts off the mould.",
    },
    {
      id: "watch-stream", kind: "gauge", target: "stream-gauge",
      title: "Watch the stream through the mirror",
      cue: "Read the stream gauge off the mirror and keep the flow reading inside its band.",
      why: "The stream is read through the barrier's mirror, not by leaning to look straight at it, and the flow it shows is what tells the pourer whether the nozzle is running clean or starting to freeze shut. A flow that has drifted out of band is the first sign of a problem the tilt rate alone will not show.",
      gauge: { label: "FLOW", speed: 0.7, green: [0.44, 0.6], readout: (t) => (t < 0.44 ? "starving" : t > 0.6 ? "surging" : "steady"), missNote: "Flow out of band — ease the tilt back until the stream steadies." },
    },
    {
      id: "add-alloy", kind: "drag", target: "alloy-bag",
      title: "Add the dry ferroalloy through the chute",
      cue: "Carry the dry alloy bag to the addition chute and feed it in.",
      why: "The chute lets an addition reach the metal from outside the splash zone and at a controlled rate — a shovelful dropped straight in by hand does neither, and it puts a hand and an arm exactly where the metal can react to whatever the addition brings with it.",
      drag: { to: "addition-chute", radius: 0.4, missNote: "Not at the chute — the addition goes in through the chute, not thrown toward the ladle." },
    },
    {
      id: "tilt-close", kind: "turn", target: "tilt-control-wheel",
      title: "Bring the ladle back upright",
      cue: "Turn the tilt wheel back to bring the ladle upright once the mould is at its level.",
      why: "The tilt comes back the same controlled way it went out — stopped at the level the pour order calls for, not run past it and corrected, because a mould overfilled by a slow-to-stop tilt is a defect poured in a second that takes far longer than that to fix.",
      turn: { turns: 0.25, axis: "x", label: "TILT" },
    },
    {
      id: "ladle-return", kind: "select", target: "ladle-cradle",
      title: "Return the ladle to its cradle",
      cue: "Lower the empty ladle into its cradle and mark the area no-entry until it cools.",
      why: "An emptied ladle is not a cool one — the shell and the skull of metal left inside it stay dangerously hot long after the pour is over, and the cradle area is marked off exactly as if the ladle were still full, per the plant's own procedure, until it has actually cooled.",
    },
    {
      id: "log-heat", kind: "select", target: "heat-log",
      title: "Log the heat",
      cue: "Record the heat number, the temperature read and the pour time in the heat log.",
      why: "The heat log is what lets the next stage of the process know exactly what it received — the grade, the temperature it was poured at, and when. A heat that pours clean but never gets logged is a heat the rest of the mill has to take on faith.",
    },
  ],

  interrupts: [
    {
      id: "breakout-warning",
      kind: "Refractory failing",
      after: "watch-stream", delay: 4, seconds: 13,
      alert: "The hot spot on the shell you noted earlier has brightened sharply and a thin bead of metal is now visible weeping from it.",
      cue: "The shell is starting to breach, not just glow.",
      target: "breakout-alarm",
      why: "A weeping shell is a lining that has failed, and the failure does not stay small — a shell breach lets molten steel find the crane structure and everyone on the deck below it. The breakout alarm is what clears the deck and calls the response before the weep becomes a stream nobody can stand near.",
      missNote: "The weep kept spreading while the pour continued. A breakout does not pause for the ladle to finish emptying, and a crew that keeps pouring past the first sign of one is treating a structural failure as a cosmetic one.",
      wrongNote: "It is the breakout alarm. Nothing else clears the deck fast enough for a shell that is already weeping.",
    },
    {
      id: "tilt-drift",
      kind: "Tilt creeping",
      after: "add-alloy", delay: 3, seconds: 12,
      alert: "The tilt has started creeping further open on its own, past where you set it, with nobody's hand adding to the rate.",
      cue: "The tilt is moving without you.",
      target: "tilt-estop",
      why: "A tilt drive that keeps moving after the control was let go of is a control fault, not a heavier pour, and letting it run is how a mould that was filling correctly gets overfilled by a machine nobody is actually commanding any more. The tilt e-stop is the one control that answers a drive doing something the pourer did not ask for.",
      missNote: "The tilt kept creeping and the mould overfilled past the pour order's level. A drive fault does not correct itself, and a stream that keeps running because nobody stopped the machine is exactly the failure the e-stop exists to catch.",
      wrongNote: "It is the tilt e-stop. A creeping drive is answered by stopping the drive, not by anything at the barrier.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, LP_ACCENT);
    box(g, 6.2, 0.12, 5.6, 0, 0.06, 0, 0x3a3428, { rough: 0.9, finish: "concrete" });
    box(g, 2.6, 0.02, 2.6, 0.4, 0.13, 1.1, 0x1c1712, { rough: 0.95, cast: false });

    // ---------------------------------------------------------- ladle & crane
    const crane = ladleCrane(g, 0, 0, -0.5, { colour: 0x8a4a26 });
    const P = crane.userData.parts;
    reg(hits, P.ladleTrunnion, "trunnion-lock");
    // A slide-mark on the pour lip is where the mirror reads the stream.
    const streamGaugeFace = decal(P.pourLip, 0.16, 0.08, 0, 0.12, 0, signFace("-- flow", { bg: "#1a1208", accent: "#d8552a", fg: "#f6ead6", scale: 0.5 }), { glow: true, ei: 0.6 });
    reg(hits, P.pourLip, "stream-gauge");
    // A hot spot on the ladle shell — the refractory-wear tell the walk-round finds.
    const hotSpot = ball(P.ladleBody, 0.06, 0.35, -0.1, 0.45, 0xf2ae14, { emissive: 0xff8a00, ei: 1.2, rough: 0.4, seg: 12, seg2: 10 });
    reg(hits, hotSpot, "shell-hot-spot");

    // Mould in the pour position.
    const mould = group(g, 0.4, 0.13, 1.1);
    box(mould, 1.4, 0.5, 1.4, 0, 0.25, 0, 0x2b2f34, { rough: 0.8, finish: "concrete" });
    box(mould, 1.1, 0.05, 1.1, 0, 0.51, 0, 0x1a1a1a, { rough: 0.95, cast: false });
    holoTag(mould, "mould — pour position", 0, 0.7, 0, { css: "#d8552a", w: 0.5 });
    const posMark = box(g, 0.4, 0.02, 0.4, 0.4, 0.14, 1.1, 0xf0b323, { emissive: 0xf0b323, ei: 0.6, rough: 0.5, cast: false });
    hits["pour-position-mark"] = posMark;

    // Splash zone and barrier between the mould and the deck.
    const splashZone = box(g, 2.0, 1.4, 1.6, 0.4, 0.7, 0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, splashZone, "splash-zone");
    const barrier = group(g, -0.9, 0, 0.9, 0.3);
    box(barrier, 1.8, 1.2, 0.06, 0, 0.6, 0, 0xd8552a, { rough: 0.6, opacity: 0.55, transparent: true, finish: "painted" });
    const peepGap = box(barrier, 0.18, 0.2, 0.08, 0.7, 0.75, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, peepGap, "direct-stream-view");
    reg(hits, barrier, "splash-barrier");
    const mirror = box(barrier, 0.22, 0.18, 0.02, -0.6, 0.9, 0.04, 0xdfe9ee, { rough: 0.1, metal: 0.9, finish: "brushed" });
    void mirror;

    // Trolley traverse control panel: a token dragged along a rail-slot.
    const panel = group(g, -2.5, 0, -1.3);
    box(panel, 0.5, 1.0, 0.14, 0, 0.5, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    box(panel, 0.4, 0.03, 0.02, 0, 0.78, 0.08, 0x1b1e22, { rough: 0.6 });
    const trolleyToken = box(panel, 0.06, 0.06, 0.03, -0.16, 0.78, 0.09, 0xf0b323, { rough: 0.5, metal: 0.4 });
    reg(hits, trolleyToken, "trolley-token");
    decal(panel, 0.3, 0.05, 0, 0.6, 0.08, signFace("TROLLEY", { bg: "#22262b", accent: "#d8552a", scale: 0.45 }));

    // Tilt wheel and lever.
    const tiltPost = group(g, -2.5, 0, 0.4);
    box(tiltPost, 0.16, 1.1, 0.16, 0, 0.55, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const tiltWheel = cyl(tiltPost, 0.16, 0.16, 0.05, 0, 1.15, 0.1, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 20 });
    tiltWheel.rotation.x = Math.PI / 2;
    reg(hits, tiltWheel, "tilt-control-wheel");
    const tiltLever = group(g, -2.5, 0, 0.9);
    box(tiltLever, 0.14, 0.7, 0.14, 0, 0.35, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const leverArm = cyl(tiltLever, 0.025, 0.025, 0.5, 0, 0.9, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 10 });
    reg(hits, tiltLever, "tilt-control-lever");
    const tiltEstop = group(g, -2.5, 0, 1.4);
    box(tiltEstop, 0.16, 0.9, 0.16, 0, 0.45, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const estopHead = cyl(tiltEstop, 0.08, 0.08, 0.05, 0, 0.9, 0.08, 0xd2312b, { rough: 0.45, seg: 16 });
    estopHead.rotation.x = Math.PI / 2;
    holoTag(tiltEstop, "tilt e-stop", 0, 1.14, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, tiltEstop, "tilt-estop");

    // Breakout alarm pull, and the ladle cradle.
    const alarmPost = group(g, 2.2, 0, 1.6);
    box(alarmPost, 0.18, 1.0, 0.12, 0, 0.5, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const alarmPull = box(alarmPost, 0.12, 0.16, 0.06, 0, 0.9, 0.06, 0xd2312b, { rough: 0.5 });
    decal(alarmPost, 0.1, 0.04, 0, 0.9, 0.09, signFace("BREAKOUT", { bg: "#8c1410", accent: "#ffd8d0", fg: "#ffffff", scale: 0.5 }), { px: 128 });
    holoTag(alarmPost, "breakout alarm", 0, 1.14, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, alarmPost, "breakout-alarm");
    const cradle = group(g, 2.0, 0, -1.4);
    box(cradle, 1.0, 0.3, 1.0, 0, 0.15, 0, 0x4a5057, { rough: 0.6, metal: 0.4, finish: "galvanised" });
    holoTag(cradle, "ladle cradle — cools here", 0, 0.5, 0, { css: "#d8552a", w: 0.42 });
    reg(hits, cradle, "ladle-cradle");

    // Immersion probe, sample rack (good spoon and the bare-handled hazard).
    const probeStand = group(g, 1.3, 0, 0.4);
    cyl(probeStand, 0.03, 0.035, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const probe = instrument(probeStand, 0, 0.95, 0, { ry: -0.5, idle: "--°", color: LP_ACCENT });
    reg(hits, probe, "immersion-probe");
    const spoonRack = group(g, 1.6, 0, -0.4);
    box(spoonRack, 0.4, 0.06, 0.2, 0, 0.5, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const goodSpoon = cyl(spoonRack, 0.02, 0.02, 0.5, -0.12, 0.55, 0, 0xf0b323, { rough: 0.5, seg: 8 });
    goodSpoon.rotation.z = Math.PI / 2;
    holoTag(spoonRack, "insulated spoon", -0.12, 0.65, 0, { css: "#d8552a", w: 0.34 });
    const bareSpoon = cyl(spoonRack, 0.018, 0.018, 0.5, 0.12, 0.55, 0, 0xb9bec4, { rough: 0.3, metal: 0.7, seg: 8 });
    bareSpoon.rotation.z = Math.PI / 2;
    holoTag(spoonRack, "bare-handled spoon", 0.12, 0.65, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, bareSpoon, "bare-sample-spoon");

    // Addition chute and the alloy bags (good dry one and the wet hazard).
    const chute = group(g, -0.6, 0, -1.1);
    cyl(chute, 0.14, 0.2, 0.6, 0, 0.9, 0, 0x4a5057, { rough: 0.6, metal: 0.45, finish: "galvanised", seg: 16 });
    holoTag(chute, "addition chute", 0, 1.25, 0, { css: "#d8552a", w: 0.3 });
    reg(hits, chute, "addition-chute");
    const bagPallet = group(g, -1.8, 0, -1.8);
    box(bagPallet, 0.7, 0.06, 0.5, 0, 0.03, 0, 0x8b6a42, { rough: 0.9 });
    const dryBag = box(bagPallet, 0.3, 0.3, 0.22, -0.16, 0.2, 0, 0xc7ac6a, { rough: 0.8 });
    holoTag(bagPallet, "ferroalloy — dry", -0.16, 0.4, 0, { css: "#d8552a", w: 0.38 });
    reg(hits, dryBag, "alloy-bag");
    const wetBag = box(bagPallet, 0.3, 0.3, 0.22, 0.2, 0.2, 0, 0x8a7a3a, { rough: 0.5, opacity: 0.92, transparent: true });
    holoTag(bagPallet, "ferroalloy — wet", 0.2, 0.4, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, wetBag, "wet-alloy-bag");

    // PPE hooks, pour order board, heat log.
    const ppeRack = group(g, -2.6, 0, -2.2);
    box(ppeRack, 0.9, 1.6, 0.1, 0, 0.8, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const coat = box(ppeRack, 0.34, 0.5, 0.05, -0.26, 1.1, 0.08, 0xd8dfe6, { rough: 0.5, finish: "brushed" });
    holoTag(ppeRack, "aluminized coat", -0.26, 1.4, 0.08, { css: "#d8552a", w: 0.4 });
    reg(hits, coat, "reflective-coat");
    const shield = box(ppeRack, 0.2, 0.18, 0.03, 0, 1.1, 0.08, 0x2b2f34, { rough: 0.4, opacity: 0.55, transparent: true });
    holoTag(ppeRack, "face shield", 0, 1.34, 0.08, { css: "#d8552a", w: 0.3 });
    reg(hits, shield, "face-shield-down");
    const gauntlets = box(ppeRack, 0.24, 0.2, 0.05, 0.28, 1.05, 0.08, 0xb9793a, { rough: 0.8, finish: "rubber" });
    holoTag(ppeRack, "heat gauntlets", 0.28, 1.3, 0.08, { css: "#d8552a", w: 0.34 });
    reg(hits, gauntlets, "heat-gauntlets");

    const orderBoard = holoPanel(g, 0.6, 0.42, 2.5, 1.4, -1.6, (cx, w, h) => {
      cx.fillStyle = "#1a1208"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d8552a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("POUR ORDER — HEAT 214", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#f6ead6";
      ["Grade: per the order", "Target temp: per the band", "Mould: pour position A", "Additions: dry, through chute"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { accent: LP_ACCENT, ry: -0.4 });
    reg(hits, orderBoard, "pour-order-board");

    const logStand = group(g, 2.4, 0, 0.2);
    cyl(logStand, 0.03, 0.035, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const logBoard = decal(logStand, 0.32, 0.4, 0, 0.95, 0.02, paperFace("HEAT LOG", ["Heat: ____", "Temp: ____", "Poured: ____"], { bg: "#f2e6cd", band: "#b8791a" }), { px: 256 });
    reg(hits, logBoard, "heat-log");

    // Dressing.
    const rack = toolChest(g, 2.6, -2.0, { ry: -0.5, color: 0x8a4a26 });
    const spareRefr = rackFrame(g, -2.9, 1.7, { ry: 1.5, h: 1.2 });
    for (let i = 0; i < 3; i++) rackUnit(spareRefr, 0.3 + i * 0.32, ["NOZZLE BRICK", "SLIDE PLATE", "SLEEVE"][i], { css: "#d8552a" });
    for (const [x, z] of [[1.6, 2.4], [-2.9, -0.8], [1.2, -2.4]]) cone(g, x, z);
    barrierPanel(g, 0, 2.6, { ry: 1.57, color: 0xf0b323 });
    const heatShimmer = particles(g, 24, 0xffb066, { size: 0.05, life: 0.5, additive: true, opacity: 0.4 });
    heatShimmer.position.set(0, 1.6, -0.7);

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -0.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "ppe-don") {
          coat.material = mat(0xd8552a, { emissive: 0x2a1408, ei: 0.3, rough: 0.5 });
          shield.rotation.x = -0.9;
        }
        if (step.id === "trunnion-lock") { /* latch confirmed */ }
        if (step.id === "position-trolley") { trolleyToken.position.z = 0.16; crane.position.x = -0.4; }
        if (step.id === "clear-splash-zone") { barrier.rotation.y = 0; }
        if (step.id === "tilt-start") { crane.rotation.x = 0.15; }
        if (step.id === "add-alloy") { /* addition made */ }
        if (step.id === "tilt-close") { crane.rotation.x = 0; }
        if (step.id === "ladle-return") { P.ladleBody.material?.dispose?.(); }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "breakout-warning") { alarmPull.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.2, rough: 0.4 }); }
        if (it.id === "tilt-drift") { crane.rotation.x = Math.min(0.7, crane.rotation.x + 0.35); estopHead.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.4, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "breakout-warning") { alarmPull.material = mat(0xd2312b, { rough: 0.5 }); }
        if (it.id === "tilt-drift") { estopHead.material = mat(0xd2312b, { rough: 0.45 }); }
      },
      animate(t, dt, session) {
        heatShimmer.visible = true;
        heatShimmer.userData.step?.(dt, new THREE.Vector3(0, 1.6, -0.7), 0.3, 0.3, 0.6);
        const step = session?.step;
        if (step?.id === "tilt-pour" && session.track) crane.rotation.x = 0.2 + session.track.v * 0.6;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "watch-stream") {
          repaint(streamGaugeFace, signFace(gg.t >= 0.44 && gg.t <= 0.6 ? "steady" : gg.t < 0.44 ? "starving" : "surging", { bg: "#1a1208", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#f6ead6", scale: 0.5 }));
        }
        void leverArm; void t;
      },
    };
  },
};
