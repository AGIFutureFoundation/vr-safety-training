import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, barrierPanel,
  standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Post-Tension VR — Construction & Structural Trades, station six.
// Stressing tendons in a cast-in-place post-tensioned slab.
//
// Everything in this procedure comes back to one geometric fact: a tendon
// stores its energy along its own axis, and if the strand or a wedge lets go
// it comes out of the anchorage along that axis. So the exclusion zone is not
// a radius, it is a cone off each end of the tendon, and the whole job is
// arranged around nobody ever being in it — the pump is worked from the side,
// the elongation is measured from the side, and the two ends are barricaded
// before a drop of oil moves.
//
// The other half of the job is arithmetic. Concrete is stressed on a strength
// result, never on the calendar, and the elongation measured at the jack is
// checked against the elongation calculated on the stressing record. A number
// outside the tolerance printed on that record is not a rounding problem: it
// says the tendon is bound, the jack and gauge are lying, or the strand in the
// slab is not the strand on the drawing. That is an engineer's call, not a
// crew's, and until it is made nothing gets cut.

const PT_ACCENT = 0xef8f4a;

export const SIM_POST_TENSION = {
  id: "post-tension",
  index: "58",
  domain: "Construction",
  trade: "Ironworker — post-tensioning crew",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "Ironworkers (IW) reinforcing and post-tensioning crews; PTI Level 1 and Level 2 certification for unbonded post-tensioning field personnel; ACI 318 for the compressive strength the concrete must reach before the tendons are stressed; OSHA 29 CFR 1926 Subpart Q concrete and masonry construction — 1926.701(c) post-tensioning: nobody but the crew essential to the operation behind the jack, and signs and barriers limiting access to the area during tensioning",
  name: "Post Tension",
  title: simTitle("Post Tension"),
  tagline: "Stressing tendons in a cast-in-place slab: strength proven before transfer, calibrated jack and gauge, both end cones barricaded and nobody behind the ram, force ramped, elongation measured against the record, and nothing cut until the engineer accepts it",
  accent: PT_ACCENT,
  accentCss: "#ef8f4a",
  parSeconds: 285,
  footprint: 2.2,
  badge: { id: "tendon-certified", name: "Tendon Certified", note: "A tendon stressed with the cone kept empty, the elongation inside tolerance and the tails cut only after acceptance" },

  game: system({
    name: "Stressing Authority",
    currency: "KIP",
    ranks: ["Apprentice", "Reinforcing Ironworker", "PT Installer", "Stressing Foreman", "Stressing Authority Certified"],
    badges: [
      { id: "cone-kept-empty", name: "Cone Kept Empty", note: "Nobody ever behind the ram or in line with either end", test: AWARD.safe },
      { id: "strength-first", name: "Strength First", note: "Stressed on a break result, not on the calendar", test: AWARD.stepClean("strength") },
      { id: "elongation-true", name: "Elongation True", note: "Measured elongation read inside the tolerance on the record", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-stress", name: "Clean Stress", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "held-the-seat", name: "Held The Seat", note: "Held the seating pressure the full count", test: AWARD.unbroken },
      { id: "off-the-deck", name: "Off The Deck", note: "Tendon stressed, recorded and grouted inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "behind-the-jack": "You stepped in behind the ram. A tendon holds its energy along its own axis, so a strand that snaps or a wedge that does not hold comes back out of the anchorage the way the jack is pointing, at a speed nothing stops. That space is the one place on this deck nobody stands in without a reason to be there, and OSHA 1926.701(c) is written that way: no employee behind the jack during tensioning except the ones essential to the operation, with signs and barriers keeping everybody else out of the area. Being curious is not being essential.",
    "green-concrete": "You started stressing on the calendar instead of on a strength result. Concrete that has not reached the strength the drawings require at transfer cannot carry the anchorage: the bearing plate punches through the slab face and takes the tendon and the concrete around it with it.",
    "far-end-axis": "You stood in line with the tendon at the dead end. Both ends are on the axis. The live end is where the jack is and the end everybody remembers; the dead end is the one people walk past, and a strand that pulls through an anchorage exits there just as hard.",
    "hand-seat": "You went at a loaded anchorage with a hammer. The wedges are seated hydraulically by the jack, and struck by hand they can come out of the cavity at the person holding the hammer. Nothing is dressed, tapped or adjusted on an anchorage that is holding load.",
  },

  lateNotes: {
    "pump-throttle": "The pump comes up after the strength is proven, the zones are set, the jack is mounted and the crew is out of both cones.",
    "cut-tail": "Tails come off after the elongations are measured, recorded and accepted. Cut early and the tendon can never be re-stressed.",
    "jack": "The jack goes on once the anchorages have been inspected and both end zones are barricaded.",
  },

  steps: [
    {
      id: "record", kind: "select", target: "stressing-record",
      title: "Take the stressing record and the tendon schedule",
      cue: "Read the tendon, the strand, the jacking force, the calculated elongation and the strength required before stressing.",
      why: "The stressing record is the drawing for this operation and the document the job is accepted on. Every number that decides whether the tendon is right — force, calculated elongation, the tolerance that elongation is judged against — is on it before anyone touches a pump.",
    },
    {
      id: "strength", kind: "gauge", target: "maturity-meter",
      title: "Prove the concrete has reached stressing strength",
      cue: "Read the cylinder break and the maturity meter for this placement, and commit on the strength.",
      why: "Concrete is stressed on a strength result, never on how many days it has been. ACI 318 requires the specified compressive strength at transfer before the tendons take load, and cylinders or a maturity meter are how that is known — a slab poured in cold weather can be days behind the calendar and look identical.",
      gauge: { label: "f'ci", speed: 0.7, green: [0.6, 1.0], readout: (t) => `${Math.round(t * 5000)} psi`, missNote: "That is under the 3,000 psi this record requires before transfer. Stressing it now pulls the anchorage out through the face of the slab — wait for the next break or the meter." },
    },
    {
      id: "calibration", kind: "select", target: "cal-cert",
      title: "Check the jack and gauge calibration",
      cue: "Serial numbers on the certificate against the ram and the gauge in front of you, and the date still in.",
      why: "The gauge is the only thing telling you how hard you are pulling, and it only means anything as half of the pair it was calibrated with. A gauge off its ram, or a certificate out of date, turns the whole operation into a guess — and the elongation check downstream cannot tell you which of the two lied.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["fouled-pocket", "damaged-sheath", "unsound-bearing"],
      itemNames: { "fouled-pocket": "grout in the wedge cavity", "damaged-sheath": "split sheathing at the anchorage", "unsound-bearing": "honeycombed concrete behind a bearing plate" },
      itemNotes: {
        "fouled-pocket": "The second live-end pocket has slurry set in the wedge cavity. Wedges seated on grout do not bite on strand, and they let go later rather than now.",
        "damaged-sheath": "The sheathing on the far tendon is split where it enters the anchorage and the strand under it is rusted. Corroded strand at the anchorage is where an unbonded tendon fails.",
        "unsound-bearing": "There is honeycombing in the concrete behind a dead-end bearing plate. That plate has nothing solid to bear on, and it is the dead end that everybody forgets to look at.",
      },
      title: "Inspect both ends before anything is pressurised",
      cue: "Walk the live ends and the dead ends and click anything that is not fit to take load.",
      why: "Every one of these is a five-minute job now and an anchorage failure later. The anchorage is the only part of a tendon anybody can see, so it is the only part that gets inspected — which is exactly why it has to be inspected properly.",
    },
    {
      id: "zones", kind: "sequence",
      targets: ["live-end-zone", "dead-end-zone", "zone-signs"],
      itemNames: { "live-end-zone": "cone behind the live end", "dead-end-zone": "cone off the dead end", "zone-signs": "signs on the approaches" },
      title: "Barricade both cones, live end first",
      cue: "Barricade the space behind the jack, then the space in line with the dead end, then sign the approaches.",
      why: "The exclusion zone for a stressing operation is a cone off each end of the tendon, because that is the direction the energy leaves in. Live end first: that is where the jack is going and where somebody is about to be working. The signs go up last because they are what keep everybody who is not on this crew out of both.",
      outOfOrderNote: "Live end first, then the dead end, then the signs. The end you are about to stand a jack on is the end that gets protected before anything else.",
    },
    {
      id: "mark", kind: "select", target: "strand-mark",
      title: "Mark the strand for the elongation measurement",
      cue: "Paint a reference mark on the strand where it leaves the anchorage, before the jack goes on.",
      why: "Elongation is a difference between two positions of the same mark, so the mark is made before any load is on the tendon. No mark, no measurement, and no way of knowing afterwards whether this tendon got the force the engineer designed for.",
    },
    {
      id: "mount", kind: "drag", target: "jack",
      title: "Mount the jack on the tendon",
      cue: "Carry the ram to the live end and seat it square on the bearing plate, with the strand through the nose.",
      why: "A jack that is not square on the plate loads the anchorage on one side and can jump off it under pressure. Seating it properly is also the last work anybody does at that end of the tendon — from here on the operation is run from beside it.",
      drag: { to: "anchor-seat", radius: 0.5, missNote: "Not seated on the bearing plate — square it up on the anchorage before any pressure goes near it." },
    },
    {
      id: "clear-crew", kind: "select", target: "crew-clear",
      title: "Put the crew at right angles and call the zone clear",
      cue: "Move everybody out of both cones to the marked position beside the tendon, and say out loud that you are pulling.",
      why: "Beside the tendon is the only place to stand: ninety degrees to the axis, out of both cones, where you can see the ram and the gauge. The call is not a courtesy — it is how the person who wandered onto your deck finds out that the slab in front of them is about to be loaded.",
    },
    {
      id: "ramp", kind: "track", target: "pump-throttle", seconds: 6,
      title: "Ramp the jack to the specified force",
      cue: "Bring the pump up steadily and hold the force on the record while the ram runs out.",
      why: "The force comes up smoothly and stops at the figure on the record. Snatching at it overshoots a tendon there is no way of un-stressing, and stopping short leaves a slab that is not carrying what it was designed to carry — and both of those are read afterwards, off the elongation.",
      track: { start: 0.08, green: [0.68, 0.82], rise: 0.5, fall: 0.45, drift: 0.1, label: "JACK FORCE", readout: (v) => `${Math.round(v * 44)} kip` },
      holdBreakNote: "The force has dropped off the record's figure. Bring it back up smoothly and hold it there while the ram runs out.",
    },
    {
      id: "elongation", kind: "gauge", target: "elongation-scale",
      title: "Measure the elongation against the record",
      cue: "Read the scale against your mark from beside the jack, and commit the measured elongation.",
      why: "This is the proof. The measured elongation is compared with the elongation calculated on the stressing record, and a reading outside the range that record accepts stops the operation: it means the tendon is binding somewhere in the slab, the jack and gauge are out, or the strand in the duct is not the strand on the drawing. Which of those it is, is the engineer's to work out. The seven per cent on this record is the discrepancy at which ACI 318 requires the cause to be found rather than argued about.",
      gauge: { label: "ELONGATION", speed: 0.68, green: [0.512, 0.589], readout: (t) => `${(t * 10).toFixed(2)} in`, missNote: "That is outside the 5.12 to 5.89 in this record accepts against a 5.50 in calculated elongation. Do not seat it and do not cut it — stop and call the engineer." },
    },
    {
      id: "seat", kind: "hold", target: "seat-control", seconds: 4,
      title: "Seat the wedges at the design force",
      cue: "Hold the seating pressure until the wedges are drawn fully down into the anchor head.",
      why: "The wedges are what hold the tendon for the next eighty years, and they are set hydraulically, at full force, in one movement. Wedges that are not fully home let the strand draw back through them, and the slab quietly loses the force the record says it has.",
      holdBreakNote: "You came off the seating pressure early. Wedges that are not fully drawn will let the strand slip — take it back up and hold it.",
    },
    {
      id: "release", kind: "turn", target: "release-valve",
      title: "Release the pressure and retract the ram",
      cue: "Wind the release valve open and let the ram come back under control, with nobody behind it.",
      why: "The anchorage takes the load at the moment the jack gives it up, and that is when a badly seated wedge announces itself. The pressure comes off slowly, from the side, with the cone still empty — the barricades come down after the jack does, not before.",
      turn: { turns: 1, axis: "z", label: "RELEASE VALVE" },
    },
    {
      id: "finish", kind: "sequence",
      targets: ["elongation-log", "cut-tail", "pocket-grout"],
      itemNames: { "elongation-log": "elongations accepted", "cut-tail": "tails cut", "pocket-grout": "pocket grouted" },
      title: "Record and accept, then cut and grout",
      cue: "Get the measured elongations on the record and accepted, then cut the tails, then fill the pockets.",
      why: "In that order, because cutting is irreversible: a tendon with its tail cut off can never be re-stressed or re-measured, so nothing is cut until the engineer has the numbers and has taken them. Grout goes in last and seals the anchorage against the water that would corrode it.",
      outOfOrderNote: "Acceptance first. Once a tail is cut there is no re-stressing that tendon and no measurement left to argue with.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["slipped-wedge", "spalled-pocket"],
      itemNames: { "slipped-wedge": "wedge that has drawn", "spalled-pocket": "spalled concrete at an anchorage" },
      itemNotes: {
        "slipped-wedge": "One anchorage has strand showing past the wedge mark — that wedge has drawn since it was set, and the tendon behind it is not holding what the record says.",
        "spalled-pocket": "The concrete at the corner of a pocket has spalled away from the plate. The bearing area is smaller than the design assumed, and it is working on what is left.",
      },
      title: "Walk the stressed tendons before the deck is handed over",
      cue: "Walk both ends of every tendon you have stressed and click anything that has moved or broken out.",
      why: "A tendon tells you it is unhappy in the first hour, at the anchorage, and it tells somebody standing there looking at it. After the pockets are closed nobody will see these ends again for the life of the building.",
    },
  ],

  interrupts: [
    {
      id: "into-the-cone",
      kind: "Person in the exclusion zone",
      after: "ramp", delay: 3, seconds: 11,
      alert: "A labourer has walked round the end of the barricade and is standing in line with the tendon behind your jack, looking at his phone.",
      cue: "Somebody is in the cone with the ram loaded.",
      target: "pump-stop",
      why: "A person in the cone while the tendon is loaded is the one condition on this deck that outranks everything, including the tendon. Pressure comes off first and the argument happens afterwards: the ram is holding tens of kips that leave along that line if anything in the anchorage lets go.",
      missNote: "You kept pulling with a man standing in the line of the tendon. Nothing came out of the anchorage this time, which is the only reason this is a lesson rather than a fatality — and he had no idea he was standing anywhere in particular, because the barricade he walked round was the only thing that was ever going to tell him.",
      wrongNote: "It is the pump stop. Take the pressure off before you do anything else about the man in the cone.",
    },
    {
      id: "wedge-slip",
      kind: "Anchorage moving",
      after: "seat", delay: 3, seconds: 12,
      alert: "Strand has appeared past the wedge mark on the tendon you just seated, and the tail has crept out of the anchor head.",
      cue: "The anchorage you just set is moving.",
      target: "hold-tag",
      why: "A wedge that draws after seating is a tendon giving its force back, and it is also a tendon that may keep moving. It gets tagged where the next crew will see it and left for the engineer to decide on — because the one thing that would make it unrecoverable is somebody cutting the tail off in the meantime.",
      missNote: "The slipped tendon went unmarked and the tails were cut with the rest of them. That tendon can no longer be re-stressed or even measured, the slab is short of the force the drawings call for by an amount nobody can now establish, and the record says it was accepted.",
      wrongNote: "It is the hold tag. Mark the tendon so nobody cuts it, then get the engineer.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, PT_ACCENT);
    // The deck the slab and the crew stand on.
    box(g, 6.6, 0.08, 5.6, 0, 0.04, -0.6, 0x55585c, { rough: 0.95, finish: "concrete", tile: [4, 4] });

    // ----------------------------------------------------------- the slab
    // A cast-in-place bay on its shoring, with the tendons running east-west:
    // live ends on the left face, dead ends on the right. Both faces are
    // reachable, because the whole point is that both are on the axis.
    const slabG = group(g, 0, 0, -1.6);
    const deck = box(slabG, 3.6, 0.26, 2.4, 0, 0.62, 0, 0x9a9589,
      { rough: 0.92, finish: "concrete", tile: [4, 3] });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(slabG, 0.05, 0.05, 0.49, sx * 1.5, 0.245, sz * 0.9, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 10 });
    }
    box(slabG, 3.7, 0.06, 0.05, 0, 0.44, 1.22, 0xb89a6a, { rough: 0.85 });
    holoTag(slabG, "Slab 4 East — bay 3", 0, 1.16, 0.9, { css: "#ef8f4a", w: 0.44 });

    // One anchorage: bearing plate, wedge cavity and the strand tail that runs
    // out of it. `side` is -1 for a live end, +1 for a dead end.
    function anchorage(z, side, o = {}) {
      const a = group(slabG, side * 1.82, 0.62, z);
      box(a, 0.05, 0.17, 0.17, 0, 0, 0, 0xb6bcc2, { rough: 0.45, metal: 0.6, finish: "brushed" });
      const head = cyl(a, 0.045, 0.055, 0.07, side * 0.045, 0, 0, o.headColor ?? 0x8b929a,
        { rough: 0.5, metal: 0.55, seg: 14 });
      head.rotation.z = Math.PI / 2;
      const tail = cyl(a, 0.008, 0.008, o.tail ?? 0.42, side * (0.09 + (o.tail ?? 0.42) / 2), 0, 0,
        0xc2c8cf, { rough: 0.35, metal: 0.8, seg: 8 });
      tail.rotation.z = Math.PI / 2;
      a.userData.tail = tail;
      a.userData.head = head;
      return a;
    }

    // Live ends, with the working tendon on the middle one.
    const liveWork = anchorage(0, -1, { tail: 0.5 });
    holoTag(slabG, "Tendon T-14 — live end", -2.3, 1.0, 0, { css: "#ef8f4a", w: 0.44 });
    const liveFouled = anchorage(0.8, -1);
    const liveSplit = anchorage(-0.8, -1);
    // The wedge cavity on the second live end is full of set slurry.
    const slurry = cyl(liveFouled, 0.04, 0.04, 0.05, -0.05, 0, 0, 0x8a8577, { rough: 0.95, seg: 12 });
    slurry.rotation.z = Math.PI / 2;
    reg(hits, liveFouled, "fouled-pocket");
    // And the sheathing on the far one is split over rusted strand.
    const sheath = cyl(liveSplit, 0.016, 0.016, 0.2, -0.24, 0, 0, 0x7a5a3a, { rough: 0.9, seg: 10, finish: "rust" });
    sheath.rotation.z = Math.PI / 2;
    reg(hits, liveSplit, "damaged-sheath");

    // Dead ends.
    const deadWork = anchorage(0, 1, { tail: 0.2 });
    const deadHollow = anchorage(0.8, 1, { tail: 0.2 });
    const deadThird = anchorage(-0.8, 1, { tail: 0.2 });
    const honeycomb = box(slabG, 0.06, 0.2, 0.22, 1.79, 0.44, 0.8, 0x6d6a61, { rough: 1.0, finish: "concrete", tile: [1, 1] });
    holoTag(slabG, "Dead ends", 2.25, 1.0, 0, { css: "#ef8f4a", w: 0.26 });
    reg(hits, deadHollow, "unsound-bearing");

    // The two walk-round finds, on tendons stressed earlier in the shift.
    const slipped = ball(deadThird, 0.026, 0.13, 0.03, 0, 0xd2312b, { rough: 0.5, seg: 12 });
    reg(hits, slipped, "slipped-wedge");
    const spall = box(slabG, 0.07, 0.09, 0.1, -1.79, 0.5, -0.8, 0x6d6a61, { rough: 1.0 });
    reg(hits, spall, "spalled-pocket");

    // The reference mark painted on the working strand before any load.
    const markRing = torus(slabG, 0.016, 0.006, -1.96, 0.62, 0, 0xffd166,
      { emissive: 0xffd166, ei: 0.7, rough: 0.5, seg: 6, seg2: 12 });
    markRing.rotation.y = Math.PI / 2;
    markRing.visible = false;
    const markPot = box(g, 0.09, 0.12, 0.09, -1.55, 0.7, -0.95, 0xffd166, { rough: 0.6 });
    cyl(g, 0.012, 0.012, 0.22, -1.55, 0.86, -0.95, 0x2b3138, { rough: 0.6, seg: 8 });
    holoTag(g, "Reference mark", -1.55, 1.06, -0.95, { css: "#ffd166", w: 0.34 });
    reg(hits, markPot, "strand-mark");

    // -------------------------------------------------- the two end cones
    // The exclusion zone is not a radius. It is a wedge off each end of the
    // tendon, and it is drawn on the deck so the shape of the hazard is the
    // first thing the learner sees.
    function endCone(sx, label) {
      const z = group(g, sx * 2.95, 0, -1.6);
      const paint = slab(z, 1.5, 0.012, 1.5, 0, 0.09, 0, 0xd2312b,
        { rough: 0.7, opacity: 0.3, transparent: true, cast: false });
      ownMaterial(paint);
      for (let i = 0; i < 2; i++) barrierPanel(z, 0, -0.55 + i * 1.1, { ry: 1.5708, color: 0xd2312b });
      cone(z, -sx * 0.7, 0.75, { color: 0xd2312b });
      cone(z, -sx * 0.7, -0.75, { color: 0xd2312b });
      holoTag(z, label, 0, 1.28, 0, { css: "#d2312b", w: 0.46 });
      z.visible = false;
      return { z, paint };
    }
    const liveZone = endCone(-1, "No one behind the jack");
    const deadZone = endCone(1, "Dead end — on the axis");
    const livePick = box(g, 1.3, 0.5, 1.4, -2.95, 0.3, -1.6, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    reg(hits, livePick, "live-end-zone");
    const deadPick = box(g, 1.3, 0.5, 1.4, 2.95, 0.3, -1.6, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    reg(hits, deadPick, "dead-end-zone");
    const signs = group(g, 0, 0, 1.75);
    for (const sx of [-1, 1]) {
      const post = group(signs, sx * 1.9, 0, 0, -sx * 0.5);
      cyl(post, 0.02, 0.02, 1.1, 0, 0.55, 0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 8 });
      decal(post, 0.34, 0.24, 0, 1.12, 0.01, signFace("KEEP OUT", {
        bg: "#f4e9d8", accent: "#b81410", fg: "#22262b", scale: 0.44,
      }), { px: 256, rough: 0.8 });
    }
    holoTag(signs, "Post-tensioning — keep clear", 0, 1.5, 0, { css: "#ef8f4a", w: 0.52 });
    signs.visible = false;
    const signPick = box(g, 4.2, 0.4, 0.4, 0, 0.2, 1.75, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    reg(hits, signPick, "zone-signs");

    // The two places nobody stands, as things a learner can click and regret.
    const behindTrap = box(g, 0.7, 1.4, 0.7, -2.5, 0.8, -1.6, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Stand behind the ram?", -2.5, 1.62, -1.6, { css: "#d2312b", w: 0.44 });
    reg(hits, behindTrap, "behind-the-jack");
    const deadTrap = box(g, 0.7, 1.4, 0.7, 2.5, 0.8, -1.6, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Sight down the dead end?", 2.5, 1.62, -1.6, { css: "#d2312b", w: 0.48 });
    reg(hits, deadTrap, "far-end-axis");

    // ------------------------------------------------------ pump and jack
    // The pump sits beside the tendon line, not behind it — the operator
    // works at right angles to the axis, which is the whole geometry lesson.
    const pump = group(g, -2.45, 0, 0.35, 0.5);
    box(pump, 0.7, 0.5, 0.5, 0, 0.35, 0, 0x2b6fd8, { rough: 0.5, metal: 0.35, finish: "painted", tile: [2, 1] });
    box(pump, 0.74, 0.06, 0.54, 0, 0.62, 0, 0x22303c, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1, 1]) cyl(pump, 0.07, 0.07, 0.06, sx * 0.28, 0.08, 0.2, 0x1a1e23, { rough: 0.9, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(pump, "Stressing pump", 0, 1.0, 0, { css: "#ef8f4a", w: 0.34 });
    const throttle = group(pump, 0.18, 0.66, -0.1);
    box(throttle, 0.06, 0.07, 0.06, 0, 0.03, 0, 0x22262b, { rough: 0.6 });
    const throttleLever = cyl(throttle, 0.012, 0.012, 0.22, 0, 0.16, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 8 });
    holoTag(pump, "Throttle", 0.18, 0.92, -0.1, { css: "#f2c14b", w: 0.22 });
    reg(hits, throttle, "pump-throttle");
    const seatCtl = box(pump, 0.07, 0.05, 0.11, -0.05, 0.67, -0.12, 0x59c97b, { rough: 0.5 });
    holoTag(pump, "Seat wedges", -0.05, 0.86, -0.12, { css: "#59c97b", w: 0.3 });
    reg(hits, seatCtl, "seat-control");
    const relValve = group(pump, -0.24, 0.66, 0.02);
    cyl(relValve, 0.02, 0.02, 0.06, 0, 0.03, 0, 0x8b929a, { rough: 0.4, metal: 0.7, seg: 10 });
    const relHandle = box(relValve, 0.14, 0.018, 0.03, 0, 0.08, 0, 0xd2312b, { rough: 0.5 });
    holoTag(pump, "Release valve", -0.24, 0.9, 0.02, { css: "#d2312b", w: 0.32 });
    reg(hits, relValve, "release-valve");
    const stopBtn = cyl(pump, 0.05, 0.05, 0.035, 0.05, 0.66, 0.18, 0xd2312b,
      { emissive: 0xd2312b, ei: 0.5, rough: 0.5, seg: 14 });
    holoTag(pump, "Pump stop", 0.05, 0.84, 0.18, { css: "#d2312b", w: 0.26 });
    reg(hits, stopBtn, "pump-stop");
    const pumpGauge = instrument(pump, -0.02, 0.66, -0.02, { ry: 0.2, idle: "0 kip", color: 0xef8f4a, w: 0.12, d: 0.18 });
    // The calibration certificate travels with the pair, taped to the pump.
    const calCert = decal(pump, 0.26, 0.18, 0, 0.42, 0.26, (cx, w, h) => {
      cx.fillStyle = "#f4efe2"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#b81410"; cx.fillRect(0, 0, w, Math.max(3, h * 0.08));
      cx.fillStyle = "#22262b"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `700 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("CALIBRATION — JACK + GAUGE", w * 0.06, h * 0.26);
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      ["Ram 7841 / gauge 7841-G", "Matched pair — do not swap", "Certificate in date"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.48 + i * h * 0.17));
    }, { px: 256, rough: 0.8 });
    holoTag(pump, "Calibration certificate", 0, 0.74, 0.26, { css: "#ef8f4a", w: 0.48 });
    reg(hits, calCert, "cal-cert");
    const greenTrap = box(g, 0.5, 1.0, 0.5, -2.0, 0.6, 0.95, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Pull it today anyway?", -2.0, 1.22, 0.95, { css: "#d2312b", w: 0.44 });
    reg(hits, greenTrap, "green-concrete");

    // The jack, parked on its stand until it is carried to the anchorage.
    const jackStand = group(g, -0.95, 0, 1.15);
    box(jackStand, 0.5, 0.05, 0.4, 0, 0.5, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    for (const sx of [-1, 1]) cyl(jackStand, 0.025, 0.025, 0.5, sx * 0.2, 0.25, 0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 8 });
    const jack = group(g, -0.95, 0.62, 1.15);
    const jackBody = cyl(jack, 0.09, 0.09, 0.42, 0, 0, 0, 0x3f4a55, { rough: 0.45, metal: 0.6, seg: 18, finish: "brushed" });
    jackBody.rotation.z = Math.PI / 2;
    const jackNose = cyl(jack, 0.045, 0.06, 0.16, -0.28, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.7, seg: 14 });
    jackNose.rotation.z = Math.PI / 2;
    box(jack, 0.1, 0.06, 0.16, 0.16, 0.08, 0, 0x22262b, { rough: 0.6 });
    holoTag(jack, "Mono-strand jack", 0, 0.3, 0, { css: "#ef8f4a", w: 0.38 });
    reg(hits, jack, "jack");
    const hyd = cyl(g, 0.014, 0.014, 0.9, -1.7, 0.35, 0.9, 0x22262b, { rough: 0.7, seg: 8 });
    hyd.rotation.z = 1.2;
    const seatSocket = box(slabG, 0.3, 0.3, 0.3, -1.95, 0.62, 0, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    hits["anchor-seat"] = seatSocket;

    // The elongation scale: read from beside the jack, never from behind it.
    const scaleStand = group(g, -2.05, 0, -1.15);
    cyl(scaleStand, 0.025, 0.025, 0.8, 0, 0.4, 0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 8 });
    const elongScale = instrument(scaleStand, 0, 0.84, 0, { ry: 0.9, idle: "--.-- in", color: 0xef8f4a, w: 0.12, d: 0.2 });
    holoTag(scaleStand, "Elongation scale", 0, 1.08, 0, { css: "#ef8f4a", w: 0.38 });
    reg(hits, elongScale, "elongation-scale");

    // ---------------------------------------------- strength, record, bench
    const cylTable = group(g, -2.55, 0, 1.55, 0.6);
    box(cylTable, 0.8, 0.05, 0.5, 0, 0.72, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    for (const sx of [-1, 1]) cyl(cylTable, 0.025, 0.025, 0.72, sx * 0.33, 0.36, 0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 8 });
    for (let i = 0; i < 3; i++) cyl(cylTable, 0.05, 0.05, 0.2, -0.26 + i * 0.14, 0.85, -0.1, 0x2b2f34, { rough: 0.7, seg: 12 });
    const maturity = instrument(cylTable, 0.22, 0.76, 0.02, { ry: -0.3, idle: "---- psi", color: 0x59c97b, w: 0.13, d: 0.2 });
    holoTag(cylTable, "Cylinders and maturity meter", 0, 1.1, 0, { css: "#59c97b", w: 0.56 });
    reg(hits, maturity, "maturity-meter");

    const record = holoPanel(g, 0.6, 0.44, -1.35, 1.5, 1.55, (cx, w, h) => {
      cx.fillStyle = "rgba(10,14,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#ef8f4a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#c9a184";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("STRESSING RECORD · SLAB 4 EAST", w * 0.06, h * 0.13);
      cx.fillStyle = "#f7ece2";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("TENDON T-14", w * 0.06, h * 0.31);
      cx.fillStyle = "#e0cbbb";
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["0.5 in, 270 ksi strand — 62 ft", "Strength before stressing: 3,000 psi",
       "Jacking force: 33 kip", "Calculated elongation: 5.50 in",
       "Accept 5.12-5.89 in (7% of calculated)", "Outside that range — stop, call the engineer",
       "Jack + gauge: matched pair, cal. in date",
       "No one behind the jack — 1926.701(c)"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.45 + i * h * 0.082));
    }, { ry: -0.35, accent: PT_ACCENT });
    reg(hits, record, "stressing-record");

    const bench = group(g, 2.05, 0, 0.7, -0.4);
    box(bench, 1.1, 0.06, 0.55, 0, 0.85, 0, 0x53606b, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(bench, 0.022, 0.022, 0.85, sx * 0.48, 0.42, sz * 0.22, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 8 });
    }
    holoTag(bench, "Finishing bench", 0, 1.18, 0, { css: "#ef8f4a", w: 0.36 });
    const saw = group(bench, -0.32, 0.92, 0);
    box(saw, 0.28, 0.12, 0.14, 0, 0.06, 0, 0xf2703b, { rough: 0.6 });
    cyl(saw, 0.11, 0.11, 0.012, 0.16, 0.06, 0, 0xb9bec4, { rough: 0.4, metal: 0.8, seg: 18 }).rotation.y = Math.PI / 2;
    holoTag(bench, "Abrasive saw — tails", -0.32, 1.06, 0, { css: "#ef8f4a", w: 0.42 });
    reg(hits, saw, "cut-tail");
    const grout = group(bench, 0.1, 0.9, 0);
    cyl(grout, 0.08, 0.07, 0.16, 0, 0.08, 0, 0xdfe4e8, { rough: 0.8, seg: 14 });
    box(grout, 0.16, 0.01, 0.06, 0.12, 0.04, 0, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    holoTag(bench, "Pocket grout", 0.1, 1.06, 0, { css: "#ef8f4a", w: 0.3 });
    reg(hits, grout, "pocket-grout");
    const hammer = group(bench, 0.44, 0.9, -0.08);
    cyl(hammer, 0.012, 0.012, 0.26, 0, 0.02, 0, 0x7a5a3a, { rough: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    box(hammer, 0.05, 0.05, 0.09, 0.12, 0.02, 0, 0x2b2f34, { rough: 0.5, metal: 0.6 });
    holoTag(bench, "Tap the wedges home?", 0.44, 1.04, -0.08, { css: "#d2312b", w: 0.46 });
    reg(hits, hammer, "hand-seat");

    // The hold tag: what a tendon that has moved gets, before anything else.
    const tagStand = group(g, 1.35, 0, 1.25);
    cyl(tagStand, 0.02, 0.02, 0.95, 0, 0.48, 0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 8 });
    const holdTag = decal(tagStand, 0.16, 0.2, 0, 0.92, 0.01, (cx, w, h) => {
      cx.fillStyle = "#f4e9d8"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#b81410"; cx.fillRect(0, 0, w, h * 0.3);
      cx.fillStyle = "#f4e9d8"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `700 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("HOLD", w / 2, h * 0.15);
      cx.fillStyle = "#22262b";
      cx.font = `700 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("DO NOT CUT", w / 2, h * 0.52);
      cx.fillText("ENGINEER", w / 2, h * 0.72);
    }, { px: 192, rough: 0.8 });
    holoTag(tagStand, "Hold tag", 0, 1.14, 0, { css: "#d2312b", w: 0.24 });
    reg(hits, holdTag, "hold-tag");

    const elongLog = holoPanel(g, 0.46, 0.3, 1.45, 1.35, -0.1, (cx, w, h) => {
      cx.fillStyle = "rgba(10,14,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 4);
      cx.fillStyle = "#9fd7b2";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ELONGATION LOG — ENGINEER", w * 0.07, h * 0.18);
      cx.fillStyle = "#e7f4ec";
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ["T-12  5.42 in  accepted", "T-13  5.58 in  accepted", "T-14  ____ in  pending",
       "Nothing is cut before acceptance"].forEach((line, i) => cx.fillText(line, w * 0.07, h * 0.42 + i * h * 0.14));
    }, { ry: -0.7, accent: 0x59c97b });
    reg(hits, elongLog, "elongation-log");

    // --------------------------------------------------------- the people
    // The marked standing position: ninety degrees to the tendon, out of both
    // cones, where the ram and the gauge are both in view.
    const clearMark = slab(g, 1.0, 0.012, 0.8, 0.7, 0.09, 1.0, 0x59c97b,
      { rough: 0.7, opacity: 0.35, transparent: true, cast: false });
    holoTag(g, "Stand here — 90° to the tendon", 0.7, 0.26, 1.0, { css: "#59c97b", w: 0.56 });
    reg(hits, clearMark, "crew-clear");

    const mate = standingFigure(g, -1.2, -0.55, { ry: 1.9, cloth: 0x37505f, vest: 0xef8f4a, helmet: 0xf2f2f2 });
    holoTag(g, "Crew mate", -1.2, 2.05, -0.55, { css: "#ef8f4a", w: 0.26 });
    const wanderer = standingFigure(g, 3.05, 1.75, { ry: -2.6, cloth: 0x4a5560, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(g, "Labourer on the deck", 3.05, 2.05, 1.75, { css: "#f2c14b", w: 0.4 });
    const wandererHome = { x: 3.05, z: 1.75, ry: -2.6 };

    const dust = particles(g, 26, 0xd8d2c4, { size: 0.025, life: 0.5, additive: false, opacity: 0.5 });
    dust.position.set(-2.0, 0.62, -1.6);

    let stressed = false, inCone = false, slipping = false, ramOut = 0;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(-1.6, 0.9, -1.4),

      onStepComplete(step) {
        if (step.id === "inspect") {
          slurry.visible = false;
          sheath.visible = false;
          honeycomb.visible = false;
        }
        if (step.id === "zones") { liveZone.z.visible = true; deadZone.z.visible = true; signs.visible = true; }
        if (step.id === "mark") markRing.visible = true;
        if (step.id === "mount") {
          jack.position.set(-2.12, 0.62, -1.6);
          jack.rotation.y = 0;
          jackStand.visible = false;
        }
        if (step.id === "clear-crew") { mate.position.set(0.72, 0, 1.18); mate.rotation.y = 3.3; }
        if (step.id === "ramp") { stressed = true; }
        if (step.id === "release") { ramOut = 0; jack.position.set(-0.95, 0.62, 1.15); jackStand.visible = true; }
        if (step.id === "finish") {
          liveWork.userData.tail.scale.x = 0.3;
          liveWork.userData.head.position.x = -0.045;
          liveZone.z.visible = false;
          deadZone.z.visible = false;
        }
        if (step.id === "walk") { slipped.position.x = 0.09; spall.visible = false; }
      },

      // Both alarms are things in the world: somebody walks into the cone, and
      // a tendon that was just seated starts giving its force back.
      onInterrupt(it) {
        if (it.id === "into-the-cone") {
          inCone = true;
          wanderer.position.set(-2.75, 0, -1.6);
          wanderer.rotation.y = 1.2;
        }
        if (it.id === "wedge-slip") {
          slipping = true;
          liveWork.userData.tail.position.x -= 0.05;
          liveWork.userData.head.position.x -= 0.03;
          markRing.position.x -= 0.05;
        }
      },
      onInterruptEnd(it) {
        if (it.id === "into-the-cone") {
          inCone = false;
          if (it.resolved === "answered") {
            wanderer.position.set(wandererHome.x, 0, wandererHome.z);
            wanderer.rotation.y = wandererHome.ry;
          }
        }
        // A wedge that has drawn does not un-draw. What answering changes is
        // that the tendon is tagged where the next crew will see it.
        if (it.id === "wedge-slip" && it.resolved === "answered") {
          slipping = false;
          holdTag.position.set(-1.0, 0.24, -3.1);
          holdTag.rotation.y = 0.4;
        }
      },

      onHazard(hitId) {
        if (hitId === "behind-the-jack") liveZone.paint.material.emissiveIntensity = 2.4;
        if (hitId === "far-end-axis") deadZone.paint.material.emissiveIntensity = 2.4;
      },

      animate(t, dt, session) {
        const step = session?.step;
        // The ram runs out as the force comes up, and the strand mark moves
        // with it — which is the elongation the next step measures.
        const tr = session?.track;
        if (step?.id === "ramp" && tr) {
          ramOut = tr.v * 0.12;
          jack.position.x = -2.12 - ramOut * 0.4;
          if (markRing.visible) markRing.position.x = -1.96 - ramOut;
          repaint(pumpGauge.userData.screen, signFace(`${Math.round(tr.v * 44)}`, {
            bg: "#1d1206", accent: tr.v >= 0.68 && tr.v <= 0.82 ? "#59c97b" : "#f2ae14",
            fg: "#ffd9b0", scale: 0.55,
          }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "strength") {
          repaint(maturity.userData.screen, signFace(`${Math.round(gg.t * 5000)}`, {
            bg: "#0d1c14", accent: gg.t >= 0.6 ? "#59c97b" : "#f0645b", fg: "#bff7d4", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && step?.id === "elongation") {
          repaint(elongScale.userData.screen, signFace(`${(gg.t * 10).toFixed(2)}`, {
            bg: "#1d1206", accent: gg.t >= 0.5 && gg.t <= 0.6 ? "#59c97b" : "#f0645b",
            fg: "#ffd9b0", scale: 0.55,
          }));
        }
        // Somebody standing in the cone is the thing to notice, so it moves.
        if (inCone) wanderer.rotation.y = 1.2 + Math.sin(t * 2.4) * 0.12;
        if (slipping) liveWork.userData.head.rotation.x = Math.sin(t * 9) * 0.05;
        if (step?.id === "finish") {
          dust.visible = true;
          dust.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.04, 0.5, -1.4);
        } else if (dust.visible) dust.visible = false;
        void stressed; void deck; void deadWork; void throttleLever; void relHandle; void hyd;
        void markPot; void jackNose; void livePick; void deadPick; void behindTrap; void deadTrap;
      },
    };
  },
};
