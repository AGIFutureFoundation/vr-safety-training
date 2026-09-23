import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, pavingFace, deckPlateFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Deck Joint Replacement VR — Construction & Structural Trades.
// Replacing a bridge expansion joint in one lane while the other keeps
// carrying traffic. The lane closure is set to the owner's MUTCD plan before
// a single tool comes out, because the taper, the arrow board and the buffer
// space are what stand between the crew and the travel lane that never
// closed. The saw runs wet the whole cut, the new joint is set, torqued and
// levelled before the header goes around it, and the closure comes up in the
// same order it went down, in reverse — never all at once.

const DJR_ACCENT = 0x9aa4ad;

export const SIM_DECK_JOINT_REPLACEMENT = {
  id: "deck-joint-replacement",
  index: "187",
  domain: "Construction",
  trade: "Ironworker with IUOE and LIUNA under a lane closure",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "Ironworkers (IW), IUOE operating engineers and LIUNA laborers; the owner's lane-closure plan built to the Manual on Uniform Traffic Control Devices (MUTCD); OSHA 29 CFR 1926.1153 respirable crystalline silica, Table 1 wet-cutting method for saws",
  name: "Deck Joint Replacement",
  title: simTitle("Deck Joint Replacement"),
  tagline: "An expansion joint replaced under a lane closure: the MUTCD taper and arrow board set, the cut run wet, the new joint torqued and levelled, and the header poured before the closure comes up in reverse",
  accent: DJR_ACCENT,
  accentCss: "#9aa4ad",
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "joint-set", name: "Joint Set", note: "An expansion joint replaced under a working lane closure — taper held, cut run wet, joint torqued and levelled, header poured true" },

  game: system({
    name: "Deck Joint Authority", currency: "SPAN",
    ranks: ["Flagger", "Deck Hand", "Joint Setter", "Crew Lead", "Deck Joint Authority Certified"],
    badges: [
      { id: "taper-held", name: "Taper Held", note: "The lane closure never registered a breach across the whole run", test: AWARD.safe },
      { id: "cut-true", name: "Cut True", note: "Held the saw inside the cut line the whole pass", test: AWARD.precise(0.72) },
      { id: "level-clean", name: "Level Clean", note: "No corrections on either level check", test: AWARD.stepClean("final-level") },
    ],
    challenges: [
      { id: "clean-closure", name: "Clean Closure", note: "No corrections through the whole replacement", test: AWARD.clean },
      { id: "steady-cut", name: "Steady Cut", note: "Held the saw pass with no dropout", test: AWARD.unbroken },
      { id: "lane-reopened", name: "Lane Reopened", note: "Closure struck and lane reopened inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "short-taper-cone": "That cone is set well short of where the taper formula puts it for this speed. MUTCD sizes a taper's length off the posted speed for exactly this reason — a short taper gives an approaching driver less distance to see the closure and merge out of the lane before they reach the crew, not more warning packed into less room.",
    "dry-cut-saw": "That saw has no water tank on it. OSHA 29 CFR 1926.1153's Table 1 requires a wet-cutting method on a saw like this specifically because dry-cutting concrete throws respirable crystalline silica into the air at levels that build lung disease with no warning at the time of exposure — the water is not for the blade, it is for the crew's lungs.",
    "standing-in-open-lane": "You are standing out in the lane that never closed. The taper and the arrow board protect the closed lane; the travel lane beside it is still carrying live traffic at full speed, and nothing about this crew's closure plan does anything for a body standing in it.",
    "unbraced-blockout-edge": "You knelt right at the fresh-cut edge of the blockout before the old joint was confirmed loose. A saw-cut edge is not securely tied to anything anymore — it can rock or drop the moment weight comes down close to it, right onto the hand reaching in below it.",
  },

  lateNotes: {
    "cut-saw": "The saw doesn't start until the closure is fully set and the water tank is confirmed — cutting into live traffic's shoulder with no taper up is not a shortcut, it's the hazard the plan exists to prevent.",
    "pour-hose": "The header doesn't get poured until the new joint is set, torqued and already reading level — concrete around a joint that isn't level yet just locks the error in place.",
  },

  interrupts: [
    {
      id: "car-in-closure",
      kind: "Traffic incursion",
      after: "saw-cut", delay: 4, seconds: 12,
      alert: "A car has come through the taper and is in the closed lane, headed for the saw.",
      cue: "Wave it off before it reaches the cut.",
      target: "arrow-board",
      why: "A taper only works on drivers who see it in time to react, and the arrow board is what a driver looking down the lane actually sees — cones read as texture on the shoulder from a moving car, a flashing arrow reads as an instruction. The board gets driven back to full brightness and a wider arrow the instant a car is still coming through, because whatever got missed the first time has to be answered louder the second.",
      missNote: "The car kept coming and only stopped level with the crew. Every foot of that approach was a foot the taper was supposed to have already turned it away in, and the saw kept running the whole time.",
      wrongNote: "It is the arrow board. Nothing else in this closure matters while a car is still moving toward the cut.",
    },
    {
      id: "header-level-drift",
      kind: "Joint level",
      after: "pour-header", delay: 3, seconds: 11,
      alert: "The new joint has started to lift on one side as the concrete flows around it.",
      cue: "Hold it level with the wedge before the header sets crooked.",
      target: "level-wedge",
      why: "A joint assembly is lighter than the concrete flowing around it and nothing holds it down on its own until that concrete stiffens enough to grip it — wet concrete pushing unevenly against one side of the joint is buoyant enough to lift or tip it before anyone watching the pour itself would notice. The wedge is what pins it level while the header sets; the pour hose in your other hand cannot fix a joint that is already lifting.",
      missNote: "The joint set crooked. Once that header cures around it, the fix is jackhammering it back out — the same header this pour was supposed to be the only one of.",
      wrongNote: "It is the leveling wedge. The joint lifting is the only thing that decides whether this pour has to happen twice.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "traffic-plan",
      title: "Read the MUTCD lane-closure plan",
      cue: "Confirm the taper length, buffer space and arrow-board placement the plan calls for at this posted speed.",
      why: "The closure is sized off the posted speed on this deck, not off habit — MUTCD's taper-length formula and buffer-space tables exist because the same closure that is generous on a slow local road is dangerously short on a higher-speed span. The plan is read before a single cone goes down so the whole closure goes up sized correctly the first time.",
    },
    {
      id: "set-closure", kind: "sequence",
      targets: ["warning-sign", "taper-cones", "arrow-board", "buffer-space"],
      itemNames: { "warning-sign": "advance warning sign", "taper-cones": "taper cones", "arrow-board": "arrow board", "buffer-space": "buffer space" },
      title: "Set the closure to the plan",
      cue: "Advance warning sign first, then the taper cones, then the arrow board, then the buffer space.",
      why: "The order runs from furthest upstream to closest to the crew because that is the order an approaching driver actually meets it in — a warning sign with no taper behind it warns of nothing yet, and a buffer space set before the taper exists is a protected gap in front of a lane that still looks fully open.",
      outOfOrderNote: "Sign, then taper, then arrow board, then buffer — each one only means what it's supposed to once the one ahead of it is already up.",
    },
    {
      id: "silica-control", kind: "select", target: "water-tank",
      title: "Confirm the saw's water suppression",
      cue: "Check the water tank is filled and plumbed to the saw before it starts.",
      why: "OSHA 1926.1153's Table 1 controls a handheld or walk-behind saw cutting concrete with a continuous stream of water at the blade, because that water is what keeps the respirable silica the cut generates from ever becoming airborne dust in the first place. It gets confirmed before the saw starts, not topped up partway through a dry cut that has already put dust in the air.",
    },
    {
      id: "saw-cut", kind: "track", target: "cut-saw", seconds: 6,
      title: "Cut the joint line wet",
      cue: "Hold the saw on the cut line with the water running the full pass.",
      why: "The cut line is the exact width and depth the new joint's blockout needs, and running off that line either leaves concrete the old joint's anchors are still embedded in or cuts wider than the new assembly is rated to bridge. The water running the whole pass is not separate from cutting well — a saw starved of water for even a few seconds throws exactly the dust Table 1 exists to prevent.",
      track: {
        start: 0.1, green: [0.38, 0.6], rise: 0.5, fall: 0.45, drift: 0.12, label: "SAW ON LINE",
        readout: (v) => (v < 0.38 ? "drifting into the open lane" : v > 0.6 ? "drifting off the blockout line" : "on the cut line"),
      },
      holdBreakNote: "Off the line — that stretch of blockout is now cut wrong, and the new joint has to bridge whatever shape the saw actually left.",
    },
    {
      id: "pull-joint", kind: "drag", target: "old-joint",
      title: "Pull the old joint",
      cue: "Carry the old joint assembly out of the blockout to the spoil area.",
      why: "The old joint's anchors are cut free but the assembly itself is still deadweight steel that has to come out in one controlled lift, not be levered up and dropped — a dropped section on a deck with traffic running the other lane is a hazard to the crew's own feet before it is a hazard to anyone else.",
      drag: { to: "spoil-area", radius: 0.45, missNote: "Not clear of the blockout — the old joint has to actually leave the work area, not sit half out of it." },
    },
    {
      id: "inspect-blockout", kind: "find", noHint: true,
      targets: ["spalled-concrete", "exposed-rebar", "debris-in-blockout"],
      itemNames: {
        "spalled-concrete": "spalled concrete at the blockout edge",
        "exposed-rebar": "exposed rebar in the blockout",
        "debris-in-blockout": "old sealant debris in the blockout",
      },
      itemNotes: {
        "spalled-concrete": "The blockout edge has spalled away from the old joint's anchors. The new joint's bearing surface needs sound concrete under it — setting it against a spalled edge just repeats the failure that took the old joint out.",
        "exposed-rebar": "A reinforcing bar is exposed where the saw cut through cover concrete. It gets flagged for the engineer before anything is set over it, not buried under the new joint where nobody will see it again until it fails.",
        "debris-in-blockout": "There is old sealant and grit still sitting in the base of the blockout. The new joint has to bear on clean concrete — debris left under it is a void the assembly will rock on the first time a truck axle crosses it.",
      },
      title: "Inspect the blockout before setting the new joint",
      cue: "Walk the blockout and click the three things that have to be dealt with before the new joint goes in.",
      why: "A blockout that looks clean from standing height is not the same thing as a blockout a hand has actually checked — a spalled edge, an exposed bar and leftover debris are all things the new joint will sit directly on top of if nobody looks for them now, and none of the three announce themselves once the assembly is already set.",
    },
    {
      id: "set-joint", kind: "drag", target: "new-joint",
      title: "Set the new joint into the blockout",
      cue: "Carry the new joint assembly from the staging pallet and seat it in the blockout.",
      why: "The new joint's anchors are machined to seat one way in a blockout cut to the manufacturer's dimensions — forcing it down misaligned to save a trip back to the pallet bends anchors that are supposed to still be straight when the header goes around them.",
      drag: { to: "blockout", radius: 0.4, missNote: "Not seated in the blockout — the joint has to sit in the cut opening, not balanced on the deck beside it." },
    },
    {
      id: "anchor-torque", kind: "turn", target: "anchor-studs",
      title: "Torque the joint's anchor studs",
      cue: "Run the anchor studs down to the manufacturer's torque spec before the header goes around them.",
      why: "The anchor studs are what ties this joint to the deck once the header cures — a stud left finger-tight has nothing holding the joint down through the pour, and a joint that shifts while wet concrete is being screeded around it sets exactly where the concrete happened to push it, not where the blockout was cut for it.",
      turn: { turns: 1.0, axis: "y", label: "ANCHOR STUDS", readout: (t) => `${Math.round(t * 100)}% torque` },
    },
    {
      id: "level-joint", kind: "gauge", target: "level-gauge",
      title: "Level the joint before the pour",
      cue: "Read the level on the joint's rail and commit inside the band before concrete goes around it.",
      why: "The joint's running surface has to sit flush with the deck on both sides of the gap, because a lip in either direction is exactly what a truck's tire finds at speed — high on one side hammers the joint every axle that crosses it, low on the other catches a tire edge. Checked now, it is a shim; checked after the header cures, it is a saw cut through fresh concrete.",
      gauge: {
        label: "JOINT LEVEL", speed: 0.66, green: [0.44, 0.6],
        readout: (t) => `${((t - 0.52) * 30).toFixed(1)} mm high/low`,
        missNote: "Still out of level. Shim it and read again before a single scoop of header concrete goes around it.",
      },
    },
    {
      id: "pour-header", kind: "hold", target: "pour-hose", seconds: 6,
      title: "Pour the concrete header",
      cue: "Hold the pour hose steady around the joint, filling the header evenly on both sides.",
      why: "The header is what locks the joint's anchors into the deck for good, and it has to fill evenly on both sides of the assembly — concrete piled higher on one side pushes the joint sideways before it has any cure strength to resist it, undoing the torque and the level check that came before the first scoop.",
      holdBreakNote: "The pour stopped short. A header poured in two starts rarely bonds as one slab, and the seam it leaves is the next place this deck cracks.",
    },
    {
      id: "finish-header", kind: "turn", target: "screed-bar",
      title: "Screed the header flush",
      cue: "Work the screed bar across the header to strike it flush with the deck.",
      why: "A header struck flush with the surrounding deck sheds water and takes a tire load the way the rest of the deck does; left proud or low, it becomes its own small bump or dip that a driver feels at every crossing and that starts spalling from its own edge within a season.",
      turn: { turns: 1.4, axis: "x", label: "SCREED PASS", readout: (t) => `${Math.round(t * 100)}% struck` },
    },
    {
      id: "final-level", kind: "gauge", target: "straightedge",
      title: "Confirm the header set level",
      cue: "Lay the straightedge across the joint and commit that the header cured flush.",
      why: "This is the check that catches a joint the pour moved — the level reading taken before the pour only proves the joint started right, not that it stayed there through screeding and the first set of the concrete. A straightedge across the finished header is the only way to know before the closure comes up that the fix actually held.",
      gauge: {
        label: "HEADER STRAIGHTEDGE", speed: 0.64, green: [0.42, 0.6],
        readout: (t) => `${((t - 0.51) * 26).toFixed(1)} mm gap under straightedge`,
        missNote: "There's a gap under the straightedge. The header didn't cure flush — that gets ground or patched before this lane reopens, not left for the first truck to find.",
      },
    },
    {
      id: "pickup-closure", kind: "sequence",
      targets: ["buffer-space", "arrow-board", "taper-cones", "warning-sign"],
      itemNames: { "buffer-space": "buffer space", "arrow-board": "arrow board", "taper-cones": "taper cones", "warning-sign": "advance warning sign" },
      title: "Pick up the closure in reverse",
      cue: "Buffer space first, then the arrow board, then the taper cones, then the advance warning sign last.",
      why: "The closure comes down closest-to-the-work first, the same way a scaffold comes down the reverse of how it went up — pulling the warning sign first tells approaching traffic the lane is open again while the taper and the crew are still standing in it.",
      outOfOrderNote: "Buffer, then arrow board, then taper, then the sign last — pulling the upstream warning first opens the lane in a driver's mind before the crew has actually left it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, DJR_ACCENT);

    // -------------------------------------------------------------- deck pad
    // The bridge deck itself, built as its own elevated slab rather than a cut
    // into the shared plaza floor, with the joint blockout cut into this pad.
    const deckTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#3c4046", base2: "#33373c", seam: "rgba(255,255,255,0.12)" }), { repeat: 5, px: 320 });
    const deckTop = 0, deckThick = 0.24;
    const laneL = box(g, 1.5, deckThick, 4.8, -1.1, deckTop - deckThick / 2, 0, 0x3c4046, { rough: 0.85 }); // open lane
    laneL.material = texturedMat(deckTex, { rough: 0.85, color: 0x3c4046 });
    const laneRA = box(g, 1.5, deckThick, 2.2, 0.85, deckTop - deckThick / 2, -1.3, 0x3c4046, { rough: 0.85 }); // closed lane, before joint
    laneRA.material = texturedMat(deckTex, { rough: 0.85, color: 0x3c4046 });
    const laneRB = box(g, 1.5, deckThick, 2.2, 0.85, deckTop - deckThick / 2, 1.3, 0x3c4046, { rough: 0.85 }); // closed lane, after joint
    laneRB.material = texturedMat(deckTex, { rough: 0.85, color: 0x3c4046 });
    // Lane line between open and closed lanes.
    box(g, 0.04, 0.01, 4.8, -0.35, deckTop + 0.006, 0, 0xf6e6c2, { rough: 0.6, cast: false });

    // Deck edges + a glimpse of the water this span crosses.
    for (const ex of [-1.85, 1.6]) {
      box(g, 0.1, 0.5, 4.8, ex, deckTop + 0.25, 0, 0x545c63, { rough: 0.6, metal: 0.3 });
      box(g, 0.1, 0.06, 4.8, ex, deckTop + 0.53, 0, 0x8fa9c4, { rough: 0.5, metal: 0.3 });
    }
    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0c2531", mid: "#0f2e3a", base2: "#0a1f29" }), { repeat: 4, px: 256 });
    const water = box(g, 1.2, 0.03, 4.8, -2.55, deckTop - 2.2, 0, 0x0f2e3a, { rough: 0.2, metal: 0.28, opacity: 0.9, transparent: true, cast: false, receive: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x2c6a72 });
    const water2 = box(g, 1.2, 0.03, 4.8, 2.45, deckTop - 2.2, 0, 0x0f2e3a, { rough: 0.2, metal: 0.28, opacity: 0.9, transparent: true, cast: false, receive: false });
    water2.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x2c6a72 });

    // ---------------------------------------------------------------- blockout
    const blockout = box(g, 0.28, deckThick + 0.02, 1.5, 0.85, deckTop - deckThick / 2 - 0.01, 0, 0x241d16, { rough: 0.95, cast: false });
    holoTag(g, "Blockout — new joint bay", 0.85, 0.3, 0, { css: "#9aa4ad", w: 0.56 });
    const cutLine = box(g, 0.3, 0.01, 1.5, 0.85, deckTop + 0.006, 0, 0xd9d2c2, { rough: 0.6, cast: false });
    reg(hits, cutLine, "cut-saw");
    hits["blockout"] = blockout;

    const spalled = box(blockout, 0.03, 0.03, 0.1, 0.13, 0.03, 0.5, 0x59422a, { rough: 0.95 });
    reg(hits, spalled, "spalled-concrete");
    const rebar = cyl(blockout, 0.012, 0.012, 0.24, -0.1, 0.02, -0.2, 0x8a7550, { rough: 0.6, metal: 0.6, seg: 8 });
    rebar.rotation.z = Math.PI / 2;
    reg(hits, rebar, "exposed-rebar");
    const debris = group(blockout, 0, 0.02, -0.55);
    for (let i = 0; i < 4; i++) ball(debris, 0.015, i * 0.03 - 0.04, 0, 0, 0x2b2118, { rough: 0.9, seg: 8 });
    reg(hits, debris, "debris-in-blockout");
    const blockoutEdge = box(g, 0.05, 0.05, 1.5, 1.0, deckTop + 0.02, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "kneel right at the cut edge?", 1.0, 0.25, 0.7, { css: "#d2312b", w: 0.55 });
    reg(hits, blockoutEdge, "unbraced-blockout-edge");

    // --------------------------------------------------------------- old/new joint
    const oldJoint = group(g, 0.85, deckTop - 0.08, 0, 0);
    box(oldJoint, 0.2, 0.1, 1.5, 0, 0, 0, 0x6a6f75, { rough: 0.5, metal: 0.6 });
    holoTag(oldJoint, "Old joint assembly", 0, 0.16, 0, { css: "#9aa4ad", w: 0.42 });
    reg(hits, oldJoint, "old-joint");
    const oldJointHome = oldJoint.position.clone();

    const spoil = group(g, 1.7, 0, -1.9);
    box(spoil, 0.4, 0.1, 0.3, 0, 0.06, 0, 0x6a6f75, { rough: 0.6, metal: 0.5 });
    holoTag(spoil, "Spoil / demo area", 0, 0.22, 0, { css: "#9aa4ad", w: 0.4 });
    hits["spoil-area"] = spoil;

    const pallet = group(g, 1.7, 0, 1.9, 0.2);
    box(pallet, 0.5, 0.06, 0.4, 0, 0.03, 0, 0x8a6a3a, { rough: 0.85 });
    const newJoint = group(pallet, 0, 0.1, 0, 0);
    box(newJoint, 0.2, 0.1, 1.3, 0, 0, 0, 0xd8b23a, { rough: 0.5, metal: 0.5 });
    for (const dx of [-0.5, 0, 0.5]) cyl(newJoint, 0.014, 0.014, 0.08, dx * 0.4, -0.09, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    holoTag(newJoint, "New joint, staged", 0, 0.16, 0, { css: "#9aa4ad", w: 0.4 });
    reg(hits, newJoint, "new-joint");

    const studs = group(g, 0.85, deckTop, 0, 0);
    for (const dz of [-0.5, 0, 0.5]) cyl(studs, 0.012, 0.012, 0.05, 0, 0.025, dz, 0xd8b23a, { rough: 0.4, metal: 0.6, seg: 10 });
    holoTag(studs, "Anchor studs", 0, 0.14, 0, { css: "#9aa4ad", w: 0.34 });
    reg(hits, studs, "anchor-studs");

    const levelGauge = instrument(g, 0.85, deckTop + 0.14, 0.3, { ry: 0.3, idle: "-- mm", color: 0x9aa4ad });
    holoTag(levelGauge, "Level gauge", 0, 0.14, 0, { css: "#9aa4ad", w: 0.32 });
    reg(hits, levelGauge, "level-gauge");

    const straightedge = box(g, 0.6, 0.02, 0.03, 0.85, deckTop + 0.03, -0.6, 0xdfe4e8, { rough: 0.4, metal: 0.6 });
    holoTag(g, "Straightedge", 0.85, 0.18, -0.6, { css: "#9aa4ad", w: 0.34 });
    reg(hits, straightedge, "straightedge");

    // --------------------------------------------------------------- pour + finish
    const pourRig = group(g, 1.5, 0, 0.4, -0.3);
    box(pourRig, 0.4, 0.7, 0.4, 0, 0.35, 0, 0x8a939b, { rough: 0.5, metal: 0.55 });
    const pourHoseEnd = group(g, 1.0, deckTop + 0.35, 0.15, -0.5);
    cyl(pourHoseEnd, 0.03, 0.045, 0.24, 0, 0, 0, 0x4a5560, { rough: 0.5, metal: 0.5, seg: 12 }).rotation.x = -Math.PI / 2.3;
    hose(g, [[1.5, 0.7, 0.4], [1.2, 0.5, 0.25], [1.0, 0.35, 0.15]], 0.03, 0x3c444c, { steps: 12, rough: 0.6 });
    holoTag(pourHoseEnd, "Pour hose", 0, 0.18, 0, { css: "#9aa4ad", w: 0.3 });
    reg(hits, pourHoseEnd, "pour-hose");
    const headerFill = box(g, 0.28, 0.02, 1.5, 0.85, deckTop + 0.01, 0, 0xa9a49a, { rough: 0.85, opacity: 0.001, transparent: true, cast: false });

    const screed = group(g, 0.85, deckTop + 0.06, 0.9, 0);
    box(screed, 0.5, 0.02, 0.05, 0, 0, 0, 0xd8b23a, { rough: 0.5, metal: 0.4 });
    for (const dx of [-0.2, 0.2]) box(screed, 0.03, 0.2, 0.03, dx, 0.11, 0, 0x2b3138, { rough: 0.6 });
    holoTag(screed, "Screed bar", 0, 0.24, 0, { css: "#9aa4ad", w: 0.32 });
    reg(hits, screed, "screed-bar");

    // A wedge staged beside the joint, used only when the pour tries to lift it.
    const wedgeGroup = group(g, 0.6, deckTop + 0.02, 0.5, 0.3);
    box(wedgeGroup, 0.08, 0.03, 0.05, 0, 0, 0, 0xd9a441, { rough: 0.6 });
    holoTag(wedgeGroup, "Leveling wedge", 0, 0.1, 0, { css: "#9aa4ad", w: 0.34 });
    reg(hits, wedgeGroup, "level-wedge");

    // ------------------------------------------------------------- traffic control
    const warnSign = group(g, -0.6, 0, -2.7, 0.3);
    cyl(warnSign, 0.02, 0.02, 1.1, 0, 0.55, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 8 });
    const warnFace = decal(warnSign, 0.34, 0.34, 0, 1.1, 0.02, signFace("ROAD WORK\nAHEAD", { bg: "#f2a900", accent: "#1a1a1a", scale: 0.4 }), { px: 200 });
    holoTag(warnSign, "Advance warning sign", 0, 1.32, 0, { css: "#9aa4ad", w: 0.5 });
    reg(hits, warnSign, "warning-sign");
    void warnFace;

    const taperGroup = group(g, 0, 0, 0);
    const taperCones = [];
    const taperSpecs = [[-0.5, -2.3], [-0.2, -2.0], [0.1, -1.7], [0.4, -1.4], [0.6, -1.1]];
    for (const [cx, cz] of taperSpecs) taperCones.push(cone(taperGroup, cx, cz, { color: DJR_ACCENT }));
    holoTag(taperGroup, "taper", 0.1, 0.5, -1.7, { css: "#9aa4ad", w: 0.28 });
    const taperHit = box(taperGroup, 1.4, 0.3, 1.4, 0.05, 0.15, -1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, taperHit, "taper-cones");
    // A cone set well short of the taper formula — the static hazard.
    const shortCone = cone(g, -0.7, -2.5, { color: 0xd2312b });
    holoTag(g, "short of the taper length?", -0.7, 0.55, -2.5, { css: "#d2312b", w: 0.55 });
    reg(hits, shortCone, "short-taper-cone");

    const arrowTrailer = group(g, 0.75, 0, -1.0, 0.15);
    box(arrowTrailer, 0.5, 0.5, 0.9, 0, 0.25, 0, 0x3c4046, { rough: 0.6, metal: 0.4 });
    const arrowFace = decal(arrowTrailer, 0.4, 0.28, 0, 0.55, 0.46, signFace("➜➜➜", { bg: "#1a1a1a", accent: "#f2a900", scale: 0.55 }), { px: 200 });
    holoTag(arrowTrailer, "Arrow board", 0, 0.72, 0, { css: "#9aa4ad", w: 0.4 });
    reg(hits, arrowTrailer, "arrow-board");
    const arrowScreen = arrowFace;

    const bufferGroup = group(g, 0, 0, -0.55);
    for (const bx of [-0.5, 0.1, 0.7]) cone(bufferGroup, bx, 0, { color: DJR_ACCENT });
    holoTag(bufferGroup, "Buffer space", 0.1, 0.5, 0, { css: "#9aa4ad", w: 0.36 });
    const bufferHit = box(bufferGroup, 1.5, 0.2, 0.5, 0.1, 0.1, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, bufferHit, "buffer-space");

    // ---------------------------------------------------------------- dry-cut saw
    const drySaw = group(g, -1.6, 0, 1.7, 0.3);
    box(drySaw, 0.35, 0.3, 0.5, 0, 0.2, 0, 0xd8232a, { rough: 0.55, metal: 0.4 });
    holoTag(drySaw, "spare saw — no tank?", 0, 0.42, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, drySaw, "dry-cut-saw");

    const waterTank = group(g, 1.6, 0, 1.9, -0.2);
    cyl(waterTank, 0.18, 0.2, 0.5, 0, 0.26, 0, 0x2f6f8f, { rough: 0.6, metal: 0.3, seg: 14 });
    holoTag(waterTank, "Saw water tank", 0, 0.56, 0, { css: "#9aa4ad", w: 0.36 });
    reg(hits, waterTank, "water-tank");

    // -------------------------------------------------------------- open-lane hazard
    const openLaneSpot = box(g, 0.3, 0.02, 0.3, -1.1, deckTop + 0.02, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "standing in the open lane?", -1.1, 0.3, -0.7, { css: "#d2312b", w: 0.55 });
    reg(hits, openLaneSpot, "standing-in-open-lane");

    // ---------------------------------------------------------------- car interrupt
    const car = group(g, -0.5, 0, -3.4, 0.05);
    box(car, 0.5, 0.24, 1.0, 0, 0.16, 0, 0x2f6f8f, { rough: 0.4, metal: 0.6 });
    box(car, 0.4, 0.16, 0.5, 0, 0.32, -0.1, 0x8fb3c4, { rough: 0.3, metal: 0.4, opacity: 0.8, transparent: true });
    const carHome = car.position.clone();

    // ------------------------------------------------------------- paperwork + gear
    const plan = holoPanel(g, 0.7, 0.5, -1.9, 1.5, 1.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9aa4ad"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LANE CLOSURE PLAN · MUTCD", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("JOINT REPLACEMENT, LANE 2", w * 0.06, h * 0.3);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Posted speed sets taper length", "Buffer space ahead of work area",
       "Saw: wet method, OSHA 1926.1153", "Torque studs before header pour",
       "Closure struck in reverse order"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.46 + i * 0.105)));
    }, { ry: 0.4, accent: DJR_ACCENT });
    reg(hits, plan, "traffic-plan");

    toolChest(g, -1.9, 0.9, { ry: 0.5, color: 0x9aa4ad });
    barrierPanel(g, -1.5, -0.4, { color: DJR_ACCENT });
    standingFigure(g, -1.4, -1.3, { ry: 1.2, cloth: 0xf2c14b, helmet: 0xf2c14b, vest: 0xe4dc3a });
    const engineer = standingFigure(g, 1.55, -0.65, { ry: -1.4, cloth: 0x3c4046, helmet: 0xf2c14b, vest: 0xe4dc3a });
    holoTag(engineer, "IUOE operator", 0, 1.9, 0, { css: "#59c97b", w: 0.4 });

    // -------------------------------------------------------------- live state
    let inClosure = 0;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 1.3, 0),
      onStepComplete(step) {
        if (step.id === "set-closure") inClosure = 1;
        if (step.id === "pull-joint") oldJoint.position.set(1.7, 0.06, -1.9);
        if (step.id === "set-joint") { newJoint.parent.remove(newJoint); g.add(newJoint); newJoint.position.set(0.85, deckTop - 0.03, 0); newJoint.rotation.set(0, 0, 0); }
        if (step.id === "level-joint") { newJoint.rotation.z = 0; }
        if (step.id === "pour-header") { headerFill.material.opacity = 1; headerFill.material.transparent = false; }
        if (step.id === "pickup-closure") inClosure = 0;
      },
      onInterrupt(it) {
        if (it.id === "car-in-closure") {
          car.position.set(carHome.x + 0.5, carHome.y, carHome.z + 1.9);
          repaint(arrowScreen, signFace("STOP!", { bg: "#2a1010", accent: "#f0645b", fg: "#ffd2ce", scale: 0.55 }));
        }
        if (it.id === "header-level-drift") {
          newJoint.rotation.z = 0.12;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "car-in-closure") {
          car.position.copy(carHome);
          repaint(arrowScreen, signFace("➜➜➜", { bg: "#1a1a1a", accent: "#f2a900", scale: 0.55 }));
        }
        if (it.id === "header-level-drift") {
          newJoint.rotation.z = 0;
        }
      },
      onHazard(hitId) {
        if (hitId === "unbraced-blockout-edge") { /* visible via holoTag only */ }
      },
      animate(t, dt, session) {
        void inClosure;
        if (waterTex.offset) {
          waterTex.offset.x = (t * 0.012) % 1;
          waterTex.offset.y = (t * 0.008) % 1;
        }
        const gg = session?.gauge;
        const step = session?.step;
        if (gg && !gg.committed) {
          if (step?.id === "level-joint") {
            repaint(levelGauge.userData.screen, signFace(`${((gg.t - 0.52) * 30).toFixed(1)}`, {
              bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
            newJoint.rotation.z = (gg.t - 0.52) * 0.15;
          }
        }
      },
    };
  },
};
