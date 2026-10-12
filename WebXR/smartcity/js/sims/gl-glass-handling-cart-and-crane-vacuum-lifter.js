import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, hose, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, barrierPanel,
  standingFigure, surfaceTexture, texturedMat, asphaltFace, gravelFace, safetyStripeFace, reg,
} from "../citykit.js";
import { mobileCrane } from "../../../shared/equipment.js";
import { glassVacuumLifter } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Glass Handling Cart And Crane Vacuum Lifter VR — Construction
// & Structural Trades, glaziers and architectural metal pack. The receiving
// yard: a flatbed delivers a stillage of glass lites strapped down for the
// road, a mobile crane's vacuum-lifter beam takes the big lites off one at a
// time onto a rack, and a hand-cup cart moves the smaller ones on to the
// shop. Every lite here changes hands twice before it is ever cut, and the
// two systems — the crane's beam and the hand cups — fail the same way: a
// vacuum reading trusted without being read, on a load nobody would want to
// be standing under when it lets go.

const GLCT_ACCENT = 0x59c9a3;

export const SIM_GL_GLASS_HANDLING_CART_AND_CRANE_VACUUM_LIFTER = {
  id: "gl-glass-handling-cart-and-crane-vacuum-lifter",
  index: "354",
  domain: "Construction & Structural Trades",
  trade: "Glazier — IUPAT District Council 16 material handling",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "IUPAT District Council 16 glaziers apprenticeship and training (architectural glass and metal); IUPAT Finishing Trades Institute glazier curriculum; ANSI/ASSP Z97.1 safety glazing materials; OSHA 29 CFR 1926.501 duty to have fall protection and 29 CFR 1926.502 fall protection systems criteria for work on the flatbed deck; the vacuum lifter manufacturer's rated capacity and the crane's own load chart for the beam and its cups",
  name: "Glass Handling Cart And Crane Vacuum Lifter",
  title: simTitle("Glass Handling Cart And Crane Vacuum Lifter"),
  tagline: "Tailboard and wind read, the strap inspected before it is released, the crane's vacuum beam proven, the lite lifted to the rack on a held tag line, and a second lite walked to the cart on hand cups",
  accent: GLCT_ACCENT,
  accentCss: "#59c9a3",
  parSeconds: 285,
  footprint: 2.4,
  badge: { id: "yard-handled-clean", name: "Yard Handled Clean", note: "A delivered lite unstrapped, lifted to the rack on a proven vacuum beam and a second lite carted clear, with nobody under the load the whole time" },

  supportLine: "your IUPAT District Council 16 apprenticeship coordinator or job steward, or your employer's employee assistance program if the swinging lite on the hook is what you keep seeing",

  game: system({
    name: "Yard Crew",
    currency: "LITE",
    ranks: ["Pre-apprentice", "Yard Hand", "Rigger", "Lead Glazier", "Material Handling Certified"],
    badges: [
      { id: "beam-proven", name: "Beam Proven", note: "The crane's vacuum beam read and proven before it carried a real lite", test: AWARD.stepClean("lifter-check") },
      { id: "nobody-under", name: "Nobody Under", note: "No unsafe action under a suspended lite the whole run", test: AWARD.safe },
      { id: "tag-held", name: "Tag Held", note: "The tag line held steady the full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-unload", name: "Clean Unload", note: "The lite unloaded without a correction", test: AWARD.clean },
      { id: "square-read", name: "Square Read", note: "The vacuum gauge read inside the green band, first time", test: AWARD.precise(0.72) },
      { id: "yard-in-time", name: "Yard In Time", note: "Unloaded, racked and carted inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "trailer-edge-fall": "You climbed onto the flatbed deck to reach the strap without anything to stop a fall off the side. The deck sits well over a metre off the yard with no edge protection of its own, and a foot that slips reaching for a ratchet handle at the edge is a fall the same way a deck at height falls at any other job. The strap is reached from the ground or from a step with a rail, not by climbing the load.",
    "ratchet-pinch": "You reached for the ratchet handle while it was still under tension from the strap. A loaded ratchet strap releases its handle with the whole strap's tension behind it, and a hand caught between the handle and the frame at that moment gets exactly what the tension was holding back. The handle is worked slowly, watched, with fingers clear of where it swings.",
    "cracked-lite-edge": "You picked up the cracked lite from the stack by hand instead of leaving it for the cups. A crack changes how a tempered or laminated lite carries its own weight, and an edge that has already started to fail is an edge that can let go under a grip that a sound lite would have carried all day. A cracked lite gets flagged and moved on the cups, gloved, never carried freehand.",
    "lite-wind-swing": "You let the tag line go slack while the lite was still clear of the rack on the crane hook. A lite on a vacuum beam is exactly the kind of load a gust turns into a pendulum, and a slack tag line is a tag line doing nothing the moment the wind decides to use it. The line stays under tension from the moment the lite clears the trailer to the moment it is set on the rack.",
  },

  lateNotes: {
    "trailer-lite": "The strap comes off after the tie-down is inspected and the crane's beam has been proven on the ground. A strap released before the beam is trusted is a load with nothing under it and nothing over it either.",
    "cart-lite": "The second lite moves to the cart only after its own cups read a full vacuum. A lite carried on a cup reading that was never checked is a lite carried on a guess.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "tailboard",
      title: "Sign the tailboard with the crew",
      cue: "Read the day's tailboard — the crane's load chart for today's reach, who holds the tag line, the wind limit — and sign it.",
      why: "The tailboard for a yard lift names the one number that changes every day: the crane's rated load at today's reach and boom angle, not a number off a chart from last week's delivery. Signing it is what makes the crew responsible for reading that number before the first strap comes off, rather than assuming yesterday's lift plan still applies.",
    },
    {
      id: "wind-read", kind: "gauge", target: "anemometer",
      title: "Read the wind before the crane picks",
      cue: "Take the anemometer reading at the yard and commit it inside the working band before the crane's beam takes any weight.",
      why: "A vacuum-lifted lite on a crane hook has more sail area than almost anything else this crane picks, and the manufacturer's rated wind limit for the beam is lower than the crane's own limit for a compact load. A reading over the band means the lite waits strapped to the trailer, because a beam that loses vacuum in a gust drops a lite with nothing underneath it.",
      gauge: { label: "WIND", speed: 0.7, green: [0.18, 0.48], readout: (t) => `${(t * 36).toFixed(0)} km/h`, missNote: "That reading is outside the working band for a vacuum-lifted load — over it, the lite stays strapped; under it, read it again at the yard." },
    },
    {
      id: "tie-down-seq", kind: "sequence",
      targets: ["strap-webbing", "corner-protector", "strap-tension"],
      itemNames: { "strap-webbing": "strap webbing checked for cuts", "corner-protector": "corner protector seated under the strap", "strap-tension": "tension checked before release" },
      title: "Inspect the tie-down before releasing it",
      cue: "Webbing first, then the corner protector at the stillage edge, then the tension itself — in that order, before the ratchet is touched.",
      why: "The strap is inspected in the order that finds a problem before it becomes the crew's problem: cut webbing that could let go under the ratchet's own tension, a corner protector that has slipped and let the strap bite into the glass edge underneath it, and the tension itself, which tells you how much the ratchet handle is about to give back the moment it is worked.",
      outOfOrderNote: "Webbing, then the corner protector, then tension — the ratchet is the last thing touched, on a strap you have already checked twice.",
    },
    {
      id: "yard-walk", kind: "find", noHint: true,
      targets: ["unchocked-trailer", "yard-clutter"],
      itemNames: { "unchocked-trailer": "the trailer's wheel not chocked", "yard-clutter": "a broken pallet in the crane's swing path" },
      itemNotes: {
        "unchocked-trailer": "The trailer's wheel has no chock under it, and a trailer that rolls even a few centimetres while a lite is being lifted off its deck changes where the load actually sits.",
        "yard-clutter": "A broken pallet is sitting inside the crane's swing radius between the trailer and the rack — exactly where the boom sweeps once the lite is up.",
      },
      title: "Walk the yard before the crane picks",
      cue: "Look at the trailer and the crane's swing path — click the two things wrong before the beam takes any weight.",
      why: "The trailer's chock and a clear swing path are both things that read as fine from a glance and are not things the crane operator can see from the cab once the lite is up and blocking the view forward. Both get answered on the ground, on foot, before the hook goes anywhere near the strap.",
    },
    {
      id: "lifter-check", kind: "select", target: "beam-lifter",
      title: "Prove the crane's vacuum beam empty before it carries a lite",
      cue: "Pump the beam's cups, watch the vacuum gauge settle in the green, and check the release before the hook goes anywhere near the trailer.",
      why: "The vacuum beam is proven the same way a hand cup is — on nothing, before it is trusted with something — because a beam that reads full vacuum against open air can still be carrying a nicked seal that only shows itself once a lite's weight is actually pulling against it. This is checked at the ground, where a cup that fails is an inconvenience rather than a lite over the trailer.",
    },
    {
      id: "strap-release", kind: "turn", target: "ratchet-handle",
      title: "Release the ratchet strap",
      cue: "Work the ratchet handle slowly to release the tension, fingers clear of the handle's swing, until the strap goes slack.",
      why: "The ratchet gives back the tension it has been holding the moment its handle is worked, and doing that slowly rather than snapping it open is what keeps the handle's swing predictable — the strap comes off the stillage in the crew's control rather than all at once the moment the ratchet lets go.",
      turn: { turns: 1, axis: "z", label: "RELEASE" },
    },
    {
      id: "lite-lift", kind: "drag", target: "trailer-lite",
      title: "Lift the lite from the trailer to the rack",
      cue: "Cups seated on the lite's face, guide it up off the trailer deck and across to the receiving rack — not released until it is offered up square.",
      why: "The beam does the lifting; the crew's job is guiding it so the lite travels flat and square rather than swinging on its own momentum, and it is offered to the rack square because a lite set down at an angle rocks against the rack's own uprights and chips a corner nobody saw happen.",
      drag: { to: "receiving-rack", radius: 0.5, missNote: "Not square to the rack — a lite set down at an angle rocks against the uprights." },
    },
    {
      id: "tagline-hold", kind: "hold", target: "tag-line", seconds: 4,
      title: "Hold the tag line under tension while the crane lowers the lite",
      cue: "Both hands on the tag line, keep it taut while the lite comes down onto the rack — do not let it go slack until the lite is landed.",
      why: "The tag line is the one thing keeping a suspended lite from finding its own rotation on the way down, and it only works taut — a slack line has already let the load start turning before anyone can react to it. It stays under tension from the moment the lite clears the trailer to the moment it settles onto the rack.",
      holdBreakNote: "The tag line went slack before the lite landed — it started to turn on the hook. Take up the tension again and hold it until the lite is down.",
    },
    {
      id: "rack-lock", kind: "turn", target: "rack-pin",
      title: "Lock the rack's foam separator pin",
      cue: "Turn the locking pin home once the lite is resting in its slot, so the separator cannot walk clear under vibration.",
      why: "The foam separator is what keeps this lite from riding against its neighbour's edge every time a forklift crosses the yard, and the pin is what keeps the separator from walking loose over a week of that vibration. A rack that looks loaded correctly today is only still correct next week if the pin is actually turned home.",
      turn: { turns: 1, axis: "z", label: "LOCK" },
    },
    {
      id: "cart-transfer", kind: "drag", target: "cart-lite",
      title: "Move the second lite to the cart on hand cups",
      cue: "Cups seated on the smaller lite's face, guide it from the rack to the A-frame cart — not released until it is seated on the cart's felt.",
      why: "The smaller lite goes by hand cups rather than the crane beam because rigging the crane for a piece this size costs more time than it saves, and it is guided rather than carried edge-on for the same reason every lite in this yard is: an edge held by hand is an edge with nothing between it and a slip.",
      drag: { to: "cart-slot", radius: 0.45, missNote: "Not seated on the cart's felt — a lite resting on the frame's bare rail chips the first time the cart moves." },
    },
    {
      id: "cups-gauge", kind: "gauge", target: "cups-vacuum",
      title: "Read the hand cups before letting go on the cart",
      cue: "Read the vacuum gauge on the hand cups and commit it inside the green band before releasing the lite onto the cart.",
      why: "The hand cups are read the same way the crane's beam was — because a cup carrying a lite for the length of a yard has had more time for a slow seal to bleed down than one just tested on scrap, and the gauge is what tells you whether it is still safe to trust before your hands come off it.",
      gauge: { label: "VAC kPa", speed: 0.7, green: [0.55, 0.75], readout: (t) => `${Math.round(t * 90)} kPa`, missNote: "That reading is outside the green band — the cups may be bleeding down. Reseat them before letting go." },
    },
    {
      id: "edge-check-seq", kind: "sequence",
      targets: ["flag-crack", "log-corner-chip"],
      itemNames: { "flag-crack": "the cracked lite flagged for scrap", "log-corner-chip": "a chipped corner logged on the stillage sheet" },
      title: "Check the stack for damage before it is called delivered",
      cue: "Flag the cracked lite first, then log the chipped corner on the stillage sheet — in that order.",
      why: "The cracked lite gets flagged before anything else because it is the one item in this stack nobody should pick up by hand again, and the chipped corner gets logged rather than quietly set aside because the stillage sheet is what the supplier's claim is built on — a chip nobody wrote down is a chip the crew paid for.",
      outOfOrderNote: "Flag the crack first, then log the chip — the flag is the one that changes how the next person handles this stack.",
    },
    {
      id: "dock-walk", kind: "find", noHint: true,
      targets: ["broken-pallet", "unchocked-cart"],
      itemNames: { "broken-pallet": "the broken pallet still in the forklift lane", "unchocked-cart": "the A-frame cart's wheel not chocked" },
      itemNotes: {
        "broken-pallet": "That broken pallet from the swing-path check earlier never actually got moved out of the forklift lane.",
        "unchocked-cart": "The A-frame cart carrying the second lite has no chock on its wheel, on a yard that is not perfectly level.",
      },
      title: "Walk the dock before the crew calls it done",
      cue: "Look at the forklift lane and the cart — click the two things still wrong before the yard is signed off.",
      why: "A yard that is finished from the crane's point of view is not finished until the lane a forklift actually drives is clear and the cart holding a fresh lite cannot roll on its own — both are exactly the kind of thing that gets assumed fixed because it was flagged once, earlier, and never checked again.",
    },
    {
      id: "log", kind: "select", target: "yard-log",
      title: "Log the delivery",
      cue: "Lite count, the cracked one flagged, wind readings, and the faults found and fixed, and sign it.",
      why: "The log ties this delivery's damage claim and wind readings to a date and a name, which is what the crew shows the supplier when the cracked lite is disputed. It also carries the pallet and the cart chock as fixed rather than assumed, for whoever crosses this yard on foot after the crew has moved on.",
    },
  ],

  interrupts: [
    {
      id: "gust-swing",
      kind: "Gust on the suspended lite",
      after: "tagline-hold", delay: 3, seconds: 12,
      alert: "A gust has caught the lite on the hook and it is swinging toward the crane's own outriggers.",
      cue: "The suspended lite is swinging on the hook.",
      target: "crane-estop",
      why: "A lite already swinging on a vacuum beam does not stop swinging because someone pulls harder on the tag line — the crane's own emergency stop is what takes the boom out of motion so the swing has nothing left to feed on. The tag line can be retaken once the boom is still; it cannot out-pull a boom that is still moving.",
      missNote: "The lite swung until the gust dropped on its own. It missed the outrigger by less than its own width. The beam's rated wind limit exists for exactly this gust, and the estop was never reached for while it was happening.",
      wrongNote: "It is the crane's emergency stop. Take the boom out of motion before anyone pulls on that tag line again.",
    },
    {
      id: "forklift-crossing",
      kind: "Forklift crossing the lift path",
      after: "cart-transfer", delay: 3, seconds: 11,
      alert: "A yard forklift has turned into the lane under the crane's swing path, not looking up at the load still on the hook.",
      cue: "A forklift is crossing under the crane's swing path.",
      target: "yard-horn",
      why: "A forklift operator watching their forks has no reason to look up at a boom they cannot see from the seat, and the horn on the dock control panel is the one thing loud enough to reach them before they are under a load. It gets sounded now, not after the forklift has already crossed.",
      missNote: "The forklift crossed and came out the other side. Nobody was under the load when it happened, this time. The operator never knew the boom was there, and the horn that would have told them sat unsounded the whole time they were in the lane.",
      wrongNote: "It is the yard horn on the dock panel. Sound it before the forklift finishes crossing that lane.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, GLCT_ACCENT);

    // ------------------------------------------------------------ the yard
    const yard = box(g, 7.2, 0.06, 6.4, 0, 0.03, 0, 0x2c2e30, { rough: 0.9, cast: false });
    yard.material = texturedMat(surfaceTexture((cx, w, h) => asphaltFace(cx, w, h), { repeat: 5, px: 512 }), { rough: 0.9, metal: 0.05 });
    const gravelEdge = box(g, 1.4, 0.06, 6.4, 3.6, 0.03, 0, 0x6b665c, { rough: 0.95, cast: false });
    gravelEdge.material = texturedMat(surfaceTexture((cx, w, h) => gravelFace(cx, w, h), { repeat: 4, px: 384 }), { rough: 0.95 });
    const staging = box(g, 1.6, 0.02, 1.2, -2.8, 0.041, 2.2, 0xf2c14b, { opacity: 0.8, cast: false });
    staging.material = texturedMat(surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h)), { repeat: 3, px: 256 });

    // ------------------------------------------------------------ the flatbed deck
    // A receiving-dock flatbed platform (built inline: this is a fixed dock
    // fixture the delivery backs up to, not a vehicle) at truck-bed height.
    const flatbed = group(g, -1.2, 0, -2.4);
    box(flatbed, 2.6, 0.08, 1.6, 0, 1.38, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    for (const [sx, sz] of [[-1.15, -0.65], [1.15, -0.65], [-1.15, 0.65], [1.15, 0.65]]) {
      box(flatbed, 0.1, 1.34, 0.1, sx, 0.67, sz, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    }
    box(flatbed, 1.2, 0.08, 1.6, 1.9, 0.9, 0, 0x50606c, { rough: 0.6, metal: 0.4 }).rotation.z = -0.5;
    holoTag(flatbed, "flatbed deck", 0, 1.7, 0.7, { css: "#59c9a3", w: 0.3 });

    // The stillage of strapped lites on the trailer deck (custom, since this
    // is the station's own cargo rather than the trailer builder's own).
    const stillage = group(g, -1.2, 1.42, -1.4, 0);
    box(stillage, 1.6, 0.06, 0.6, 0, 0.03, 0, 0x50606c, { rough: 0.7, metal: 0.3 });
    const stacked = [];
    for (let i = 0; i < 3; i++) { const l = box(stillage, 1.4, 1.1, 0.04, -0.2 + i * 0.09, 0.62, 0, 0xa8dcea, { rough: 0.12, metal: 0.1, opacity: 0.5, transparent: true }); stacked.push(l); }
    const trailerLite = group(stillage, 0.35, 0.62, 0, 0.1);
    box(trailerLite, 1.4, 1.1, 0.02, 0, 0, 0, 0xa8dcea, { rough: 0.1, metal: 0.05, opacity: 0.55, transparent: true, cast: false });
    reg(hits, trailerLite, "trailer-lite");
    holoTag(stillage, "delivered lite — by the cups", 0.35, 1.3, 0, { css: "#59c9a3", w: 0.42 });
    const crackedLite = box(stillage, 1.35, 1.05, 0.02, -0.55, 0.6, 0, 0x8fc9d8, { rough: 0.15, opacity: 0.4, transparent: true, cast: false });
    reg(hits, crackedLite, "cracked-lite-edge");
    holoTag(stillage, "check this one", -0.55, 1.25, 0, { css: "#d2312b", w: 0.28 });
    const strap = group(stillage, 0, 1.25, 0.22, 0.2);
    box(strap, 1.6, 0.05, 0.03, 0, 0, 0, 0x1b2026, { rough: 0.85 });
    reg(hits, strap, "strap-webbing");
    const corner = box(stillage, 0.1, 0.1, 0.1, -0.75, 1.2, 0.22, 0x2b2f34, { rough: 0.6 });
    reg(hits, corner, "corner-protector");
    const tension = group(stillage, 0.75, 1.2, 0.22);
    box(tension, 0.08, 0.06, 0.06, 0, 0, 0, 0x8a8f94, { rough: 0.5, metal: 0.6 });
    reg(hits, tension, "strap-tension");
    const ratchet = group(stillage, 0.75, 1.1, 0.28, 0.2);
    box(ratchet, 0.06, 0.14, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    reg(hits, ratchet, "ratchet-handle");
    holoTag(stillage, "strap · ratchet", 0.75, 1.5, 0.28, { css: "#59c9a3", w: 0.3 });
    const ratchetPinch = box(stillage, 0.12, 0.18, 0.08, 0.75, 1.1, 0.28, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, ratchetPinch, "ratchet-pinch");
    const swingZone = box(g, 3.0, 1.2, 0.8, 0.2, 1.0, -1.8, 0xf2ae14, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, swingZone, "lite-wind-swing");
    const edgeFallZone = box(stillage, 1.6, 0.9, 0.6, 0, 0.9, 0.3, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, edgeFallZone, "trailer-edge-fall");
    const trailerChock = cyl(g, 0.08, 0.08, 0.12, -2.0, 0.09, -3.3, 0x1b1e22, { rough: 0.7, seg: 12 });
    reg(hits, trailerChock, "unchocked-trailer");

    // ------------------------------------------------------------- the crane
    const crane = mobileCrane(g, 1.6, 0, -0.6, { ry: -2.1, livery: { colour: 0x59c9a3, fleetName: "GLAZE YARD", unitNumber: "GC-4" } });
    const craneParts = crane.userData.parts ?? {};
    holoTag(crane, "mobile crane", 0, 3.4, 0, { css: "#59c9a3", w: 0.3 });
    const hookHost = craneParts.hook ?? crane;
    const beam = group(hookHost, 0, -0.6, 0);
    box(beam, 1.5, 0.14, 0.2, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    for (const bx of [-0.55, 0.55]) {
      const cup = cyl(beam, 0.09, 0.09, 0.05, bx, -0.1, 0, 0x1b1d20, { rough: 0.75, finish: "rubber", seg: 16 });
      cup.rotation.x = Math.PI / 2;
    }
    const beamGauge = instrument(beam, 0, 0.12, 0, { ry: 0, idle: "-- kPa", color: 0x59c9a3, w: 0.1, d: 0.14 });
    reg(hits, beamGauge, "beam-lifter");
    holoTag(beam, "vacuum beam", 0, 0.35, 0, { css: "#59c9a3", w: 0.28 });
    const estopBox = group(crane, -0.7, 1.5, 1.4);
    box(estopBox, 0.14, 0.14, 0.08, 0, 0, 0, 0x22262b, { rough: 0.6 });
    const estop = cyl(estopBox, 0.035, 0.035, 0.03, 0, 0.02, 0.05, 0xd2312b, { rough: 0.4, seg: 14 });
    reg(hits, estop, "crane-estop");
    holoTag(crane, "crane e-stop", -0.7, 1.75, 1.4, { css: "#d2312b", w: 0.3 });

    // ---------------------------------------------------------- tag line and rack
    const tagLineHold = group(g, 0.6, 0.06, -1.2, 0.4);
    hose(tagLineHold, [[0, 1.4, 0], [0.1, 0.9, 0.1], [0.15, 0.45, 0.2]], 0.01, 0xf2c14b, { steps: 8 });
    const tagHandle = box(tagLineHold, 0.05, 0.05, 0.05, 0.15, 0.42, 0.2, 0xf2c14b, { rough: 0.6 });
    reg(hits, tagHandle, "tag-line");
    holoTag(g, "tag line", 0.6, 0.7, -1.2, { css: "#59c9a3", w: 0.24 });

    const rack = group(g, 2.4, 0.06, 1.6, -0.3);
    box(rack, 1.7, 0.08, 0.6, 0, 0.04, 0, 0x50606c, { rough: 0.7, metal: 0.3 });
    for (const sx of [-0.8, 0.8]) box(rack, 0.05, 1.6, 0.5, sx, 0.85, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const receivingRack = box(rack, 1.5, 1.5, 0.06, 0, 0.83, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["receiving-rack"] = receivingRack;
    const rackPin = group(rack, 0.8, 0.5, 0.05);
    cyl(rackPin, 0.015, 0.015, 0.1, 0, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 10 }).rotation.z = Math.PI / 2;
    reg(hits, rackPin, "rack-pin");
    holoTag(rack, "receiving rack", 0, 1.7, 0, { css: "#59c9a3", w: 0.32 });

    // ------------------------------------------------------------ the second lite + cart
    const rackLite = group(rack, 0, 0.7, 0.1, 0.1);
    box(rackLite, 0.9, 0.8, 0.02, 0, 0, 0, 0xa8dcea, { rough: 0.12, metal: 0.1, opacity: 0.5, transparent: true, cast: false });
    reg(hits, rackLite, "cart-lite");
    holoTag(rack, "second lite — by cups", 0, 1.15, 0.1, { css: "#59c9a3", w: 0.34 });
    const cart = group(g, 3.4, 0.06, -1.4, 0.3);
    box(cart, 0.9, 0.05, 0.35, 0, 0.03, 0, 0x50606c, { rough: 0.7, metal: 0.3 });
    box(cart, 0.9, 0.7, 0.03, 0, 0.4, -0.14, 0x50606c, { rough: 0.6, metal: 0.4 }).rotation.x = 0.2;
    const cartSlot = box(cart, 0.85, 0.75, 0.1, 0, 0.42, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["cart-slot"] = cartSlot;
    const cartWheel = cyl(cart, 0.05, 0.05, 0.04, -0.4, 0.03, 0.15, 0x1b1e22, { rough: 0.7, seg: 12 });
    cartWheel.rotation.z = Math.PI / 2;
    reg(hits, cartWheel, "unchocked-cart");
    glassVacuumLifter(g, 3.1, 0.9, -1.0, { ry: -0.5 });
    const handCups = glassVacuumLifter(g, 2.8, 0.9, -0.7, { ry: -0.5 });
    reg(hits, handCups, "cups-vacuum");
    holoTag(g, "hand cups", 2.9, 1.15, -0.85, { css: "#59c9a3", w: 0.26 });

    // ------------------------------------------------------------ dock and yard walk
    const pallet = box(g, 0.9, 0.14, 0.7, 1.0, 0.09, 1.1, 0x8a7449, { rough: 0.9 });
    reg(hits, pallet, "yard-clutter");
    holoTag(g, "in the swing path", 1.0, 0.4, 1.1, { css: "#f2ae14", w: 0.32 });
    const pallet2 = box(g, 0.9, 0.14, 0.7, 1.0, 0.09, 1.1, 0x8a7449, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, pallet2, "broken-pallet");
    const dockPanel = group(g, -3.0, 0.06, 1.4, 0.3);
    box(dockPanel, 0.35, 0.9, 0.14, 0, 0.45, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    const horn = cyl(dockPanel, 0.05, 0.06, 0.08, 0, 0.65, 0.08, 0xf2c14b, { rough: 0.5, seg: 14 });
    reg(hits, horn, "yard-horn");
    holoTag(dockPanel, "yard horn", 0, 0.92, 0.08, { css: "#f2c14b", w: 0.26 });
    const flagBoard = group(dockPanel, 0, 0.3, 0.08);
    box(flagBoard, 0.14, 0.1, 0.02, 0, 0, 0, 0xd2312b, { rough: 0.6 });
    reg(hits, flagBoard, "flag-crack");
    const logSheet = decal(dockPanel, 0.28, 0.3, 0, 0.15, 0.08, paperFace("STILLAGE SHEET", ["Lites: ____", "Cracked: ____", "Chips: ____"], { bg: "#f4efe4", band: "#59c9a3" }), { px: 220 });
    reg(hits, logSheet, "log-corner-chip");

    const anemometer = instrument(g, -3.2, 1.1, -1.0, { ry: 0.4, idle: "-- km/h", color: 0x59c9a3, w: 0.12, d: 0.17 });
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; ball(anemometer, 0.015, Math.sin(a) * 0.05, 0.12, Math.cos(a) * 0.05, 0x22262b, { rough: 0.5 }); }
    reg(hits, anemometer, "anemometer");
    holoTag(g, "anemometer", -3.2, 1.4, -1.0, { css: "#59c9a3", w: 0.26 });

    const tailboard = group(g, -3.2, 0.7, 2.2, 1.4);
    box(tailboard, 0.5, 0.4, 0.03, 0, 0.35, 0, 0x1b2026, { rough: 0.6 });
    const tailFace = decal(tailboard, 0.46, 0.36, 0, 0.35, 0.018, paperFace("TAILBOARD — YARD", ["Crane: load chart at today's reach", "Tag line: held, not tied off", "Wind limit: per beam rating", "Swing path: clear", "Stop work: gust over limit"], { bg: "#eef1f3", band: "#59c9a3" }), { px: 320 });
    reg(hits, tailFace, "tailboard");
    holoTag(g, "tailboard", -3.2, 1.25, 2.2, { css: "#59c9a3", w: 0.22 });
    const logBoard = group(g, 3.3, 0.7, 2.0, -1.4);
    box(logBoard, 0.4, 0.34, 0.03, 0, 0.3, 0, 0x1b2026, { rough: 0.6 });
    const logFace = decal(logBoard, 0.36, 0.3, 0, 0.3, 0.018, paperFace("YARD LOG", ["Lites: ____", "Flagged: ____", "Wind: ____", "Signed: ____"], { bg: "#f4efe4", band: "#59c9a3" }), { px: 256 });
    reg(hits, logFace, "yard-log");
    holoTag(g, "yard log", 3.3, 1.15, 2.0, { css: "#59c9a3", w: 0.22 });
    holoPanel(g, 0.6, 0.42, -3.5, 1.7, 0, (ctx, w, h) => {
      ctx.fillStyle = "#07211b"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#59c9a3"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e5faf1";
      ctx.fillText("MATERIAL HANDLING PLAN", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Beam: rated per the manufacturer", "Wind limit: per the beam's rating", "Tag line: held under tension", "Cart cups: read before release", "Stack: check for cracks on arrival"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: GLCT_ACCENT, ry: 0.5, stalk: true });

    // ----------------------------------------------------------- the crew
    const rigger = standingFigure(g, 1.3, -2.2, { ry: 2.6, cloth: 0x2e6e5a, trousers: 0x2b2f34, helmet: 0x59c9a3, vest: 0xf2c14b, gloves: true });
    const hostler = standingFigure(g, 2.0, 2.6, { ry: -1.6, cloth: 0x7a5a3a, trousers: 0x22262b, helmet: 0xf2c14b, vest: 0xf2c14b });

    // --------------------------------------------------------- dressing
    for (const [x, z] of [[-3.6, -2.8], [-3.6, 2.8]]) cone(g, x, z);
    barrierPanel(g, 3.7, 0.4, { ry: 0.5, w: 1.0, color: 0xf2c14b });

    let holdingTag = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.4, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "yard-walk") { trailerChock.material = mat(0x1b1e22, { rough: 0.7 }); pallet.visible = false; }
        if (step.id === "strap-release") { strap.scale.x = 0.3; }
        if (step.id === "lite-lift") { trailerLite.parent.remove(trailerLite); rack.add(trailerLite); trailerLite.position.set(0, 0.83, 0.1); trailerLite.rotation.set(0, 0, 0); }
        if (step.id === "rack-lock") { rackPin.rotation.z = Math.PI / 2; }
        if (step.id === "cart-transfer") { rackLite.parent.remove(rackLite); cart.add(rackLite); rackLite.position.set(0, 0.42, 0); rackLite.rotation.set(0, 0, 0); }
        if (step.id === "edge-check-seq") { crackedLite.material = mat(0xd2312b, { rough: 0.5, opacity: 0.4, transparent: true }); }
        if (step.id === "dock-walk") { pallet2.visible = false; cartWheel.material = mat(0x1b1e22, { rough: 0.7 }); }
        if (step.id === "log") repaint(logFace, paperFace("YARD LOG", ["Lites: 4, one flagged", "Flagged: cracked corner", "Wind: 10–16 km/h", "Signed: rigger / journeyman"], { bg: "#f4efe4", band: "#59c9a3" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gust-swing") { trailerLite.rotation.z = 0.3; beam.rotation.z = 0.15; }
        if (it.id === "forklift-crossing") { hostler.position.set(0.4, 0, 1.0); hostler.rotation.y = -0.4; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-swing") { trailerLite.rotation.z = 0; beam.rotation.z = 0; }
        if (it.id === "forklift-crossing") { hostler.position.set(2.0, 0, 2.6); hostler.rotation.y = -1.6; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        holdingTag = !!(step?.id === "tagline-hold" && session.holding);
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind-read") {
          repaint(anemometer.userData.screen, signFace(`${(gg.t * 36).toFixed(0)} km/h`, { bg: "#0d1c24", accent: gg.t >= 0.18 && gg.t <= 0.48 ? "#59c97b" : "#f2ae14", fg: "#f5eed8", scale: 0.6 }));
        }
        if (gg && !gg.committed && step?.id === "cups-gauge") {
          handCups.userData.show?.(`${Math.round(gg.t * 90)} kPa`);
        }
        const tn = session?.turn;
        if (tn && step?.id === "strap-release") { ratchet.rotation.x = tn.amount * Math.PI * 2; }
        if (tn && step?.id === "rack-lock") { rackPin.rotation.y = tn.amount * Math.PI * 2; }
        if (holdingTag) tagHandle.position.y = 0.42 + Math.sin(t * 3) * 0.01;
        if (!holdingTag && Math.abs(trailerLite.rotation.z) > 0.001) trailerLite.rotation.z *= (1 - Math.min(1, dt * 0.6));
      },
    };
  },
};

