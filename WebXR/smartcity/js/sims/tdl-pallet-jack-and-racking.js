import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, equipmentCabinet,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pallet Jack and Racking VR — Mobility & Transit, the first of
// five warehouse stations in the Job Readiness Edition's TDL pre-apprenticeship
// block. A walkie electric pallet jack on a warehouse floor: the pre-use
// inspection that takes a truck out of service rather than nursing it through
// the shift, the controls tested before the load, a pallet checked against the
// truck's rating and against the rack plaque it is going to be put away under,
// a pallet raised just clear, travel at walking pace with the horn at the aisle
// end, a floor location set square with its flue space, a rack walk that finds
// the damage the last shift left behind, and the truck parked the way the
// standard says an unattended truck is left.
//
// Sited generically: no real warehouse, no real employer, no clause number the
// registry is not sure of.

const PJR_ACCENT = 0xf0a13a;
const PJR_RACK = 0x2f5f9e;
const PJR_BEAM = 0xe8792c;
const PJR_WOOD = 0x9a7a55;
const PJR_CARTON = 0xc9a978;

export const SIM_TDL_PALLET_JACK_AND_RACKING = {
  id: "tdl-pallet-jack-and-racking",
  index: "217",
  domain: "Warehouse & Distribution",
  trade: "Warehouse associate, TDL pre-apprenticeship — Teamsters warehouse work: pallet jack and racking, ahead of the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F) for those going on to Class A",
  category: "Mobility & Transit",
  indoor: "garage",
  certification: "OSHA 29 CFR 1910.178 powered industrial trucks, which covers motorized hand trucks and requires operator training and evaluation under paragraph (l) with a re-evaluation at least every three years; ANSI B56.1 for low-lift trucks; 29 CFR 1910.22 walking-working surfaces for aisles kept clear; 29 CFR 1910.157 for fire extinguishers kept reachable; the Revised NIOSH Lifting Equation for the hand work around the pallet; Teamsters warehouse locals' powered-truck programmes",
  name: "Pallet Jack and Racking",
  title: simTitle("Pallet Jack and Racking"),
  tagline: "A walkie pallet jack and a run of selective racking: pre-use inspection, controls tested, the pallet against the rating and the plaque, raised just clear, walking pace with the horn at the aisle end, a floor location set square, the rack walk and the park",
  accent: PJR_ACCENT,
  accentCss: "#f0a13a",
  parSeconds: 260,
  footprint: 2.4,
  badge: { id: "square-and-clear", name: "Square and Clear", note: "A putaway with the truck inspected, the load inside both ratings, the aisle warned and the rack damage reported — first time" },

  game: system({
    name: "Floor Operations",
    currency: "PALLET",
    ranks: ["New Associate", "Jack Operator", "Aisle Lead", "Putaway Lead", "Floor Operations Certified"],
    badges: [
      { id: "tagged-out", name: "Tagged Out", note: "Every pre-use defect found without a hint", test: AWARD.stepClean("preuse") },
      { id: "inside-the-plaque", name: "Inside the Plaque", note: "Never sent a load past the rack plaque or rode the truck", test: AWARD.safe },
      { id: "walking-pace", name: "Walking Pace", note: "Travel held in band the whole way down the aisle", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-putaway", name: "Clean Putaway", note: "No corrections anywhere on the floor", test: AWARD.clean },
      { id: "on-the-number", name: "On the Number", note: "The load read near the centre of the band", test: AWARD.precise(0.7) },
      { id: "shift-pace", name: "Shift Pace", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "pjr-over-limit": "You assigned the 2,650 lb pallet to beam level two, whose plaque reads 2,000 lb per level. A beam pair is rated for a load spread evenly across it, and the rating is the whole margin: a beam over its plaque deflects, the connectors pull at the uprights, and a rack that fails does not drop one pallet, it drops the bay and often the bay beside it.",
    "pjr-ride-jack": "You stood on the pallet jack to ride it down the aisle. A walkie truck is built around an operator walking at the tiller: the brakes, the belly-button reverse and the deadman arc all assume you are on your feet in front of it. Riding puts your heels over the drive wheel and your body where the rack corner is.",
    "pjr-broken-pallet": "You went to lift the pallet with the split deck board. A broken pallet fails on the forks, not on the floor: the load drops through the gap, cartons fall toward the operator, and the damaged board spears whatever is stacked above it. It gets restacked onto a sound pallet before anything lifts it.",
    "pjr-park-extinguisher": "You went to park the jack in the marked space in front of the fire extinguisher. An extinguisher has to be reachable in the seconds a fire gives you, and 29 CFR 1910.157 expects it to stay that way; a parked truck with its forks out is exactly what a coworker running for it trips over.",
  },

  lateNotes: {
    "pjr-throttle": "Travel starts once the pallet is raised just clear and steady — moving a load that has not settled is how the top tier ends up on the floor.",
    "pjr-charger-plug": "The charger goes on at the end, with the forks down and the key out — not while the truck still has work to do.",
    "pjr-warehouse-log": "The warehouse log closes the putaway: it is written after the rack walk, so the damage you found goes into it.",
  },

  steps: [
    {
      id: "work-order", kind: "select", target: "pjr-work-order",
      title: "Read the putaway order and the rack plaque",
      cue: "Read today's putaway: the pallet, its weight, the location it is assigned to, and the plaque rating for that location.",
      why: "A putaway ticket says where a pallet should go; the rack plaque says what that location can carry. The two are written by different people on different days, and the operator standing at the rack is the only person who reads both at once. A heavy pallet assigned to a light beam level is a paperwork error until somebody puts it there.",
    },
    {
      id: "preuse", kind: "find", noHint: true,
      targets: ["pjr-roller-flat", "pjr-cable-fray", "pjr-hyd-leak"],
      itemNames: { "pjr-roller-flat": "the flat-spotted load roller", "pjr-cable-fray": "the chafed battery cable", "pjr-hyd-leak": "the hydraulic drip under the pump" },
      itemNotes: {
        "pjr-roller-flat": "This load roller has a flat worn into it. A flat roller drags, hammers the floor joint and jumps a dock plate lip instead of rolling over it — the load goes with it.",
        "pjr-cable-fray": "The battery cable jacket is chafed through to the copper where it passes the tiller pivot. A chafed battery lead arcs, and a walkie battery has enough energy to start a fire in the compartment.",
        "pjr-hyd-leak": "Fresh fluid under the lift pump. A leaking pump lowers the load on its own, and the fluid on the floor is the next person's slip.",
      },
      title: "Pre-use inspection",
      cue: "Walk the truck before you key it: rollers, cables, hydraulics. Find what takes it out of service.",
      why: "OSHA expects a powered truck to be examined before it is placed in service each day or shift, and a truck with a defect that affects safe operation is taken out of service, not driven gently until the end of the shift. None of these three stops the truck from moving, which is exactly why they get driven on until the day they fail under a load.",
    },
    {
      id: "controls", kind: "sequence",
      targets: ["pjr-key", "pjr-horn", "pjr-belly-button", "pjr-tiller-brake"],
      itemNames: { "pjr-key": "key on", "pjr-horn": "horn", "pjr-belly-button": "belly-button reverse", "pjr-tiller-brake": "tiller brake" },
      title: "Test the controls before the load",
      cue: "Key on, sound the horn, test the belly-button reverse into the tiller head, then let the tiller up and feel the brake set.",
      why: "The belly button is the one control that saves an operator pinned between the tiller head and a rack upright: it reverses the truck away from your body. The tiller brake is the other half — a walkie stops when the tiller is let go to the top or pushed to the bottom of its arc. Both are tested empty, before there is a load that makes a failure worse.",
      outOfOrderNote: "Key, horn, belly button, then the tiller brake — power first, then the warnings, then the two things that stop the truck.",
    },
    {
      id: "rating", kind: "gauge", target: "pjr-capacity-plate",
      title: "Check the pallet against the truck and the plaque",
      cue: "Read the pallet's weight on the jack's scale head and commit when it reads inside the truck's rating and the floor location's.",
      why: "The truck's data plate gives the most it may lift at its rated load centre, and a long or badly built pallet moves that centre out. The number that matters on this floor is the smaller of two: what the truck can lift and what the location it is going to can carry. A reading taken once, before the lift, is worth more than any estimate made while the load is moving.",
      gauge: { label: "LOAD vs RATING", speed: 0.75, green: [0.36, 0.62], readout: (t) => `${Math.round(1200 + t * 3800)} lb`, missNote: "That reading is outside the band for this truck and this location — weigh again before you lift anything." },
    },
    {
      id: "lift-hold", kind: "hold", target: "pjr-lift-button", seconds: 8,
      title: "Raise just clear and hold",
      cue: "Forks fully under, raise until the pallet just clears the floor, and hold it there while the load settles.",
      why: "A pallet raised just clear of the floor keeps the centre of gravity low and lets you see the load settle before it moves: a carton that shifts, a stretch wrap that lets go or a deck board that cracks shows itself now, an inch off the concrete, rather than halfway down the aisle. Raising higher than you need buys nothing and costs stability.",
      holdBreakNote: "The pallet dropped back before it settled — raise it just clear again and hold it there.",
    },
    {
      id: "travel", kind: "track", target: "pjr-throttle", seconds: 8,
      title: "Travel at walking pace, horn at the aisle end",
      cue: "Walk ahead of the truck with the forks trailing, hold a steady walking pace, and sound the horn where the aisle meets the cross aisle.",
      why: "A walkie is steered from in front, so the load trails behind you and you walk facing your travel. Walking pace is the speed at which the truck stops inside its own length and a person stepping out of the racking can still get out of the way. At an aisle end your view is blocked on both sides, and the standard asks you to slow and sound the horn there.",
      track: { start: 0.12, green: [0.38, 0.6], rise: 0.58, fall: 0.48, drift: 0.12, label: "SPEED", readout: (v) => (v < 0.38 ? "creeping" : v > 0.6 ? "too fast" : "walking pace") },
      holdBreakNote: "Out of band — too slow and the load drifts, too fast and you cannot stop for a pedestrian. Settle to walking pace.",
    },
    {
      id: "square-up", kind: "turn", target: "pjr-tiller",
      title: "Square up to the floor location",
      cue: "Swing the tiller to bring the pallet square to the bay before you go in.",
      why: "A pallet that enters a floor location at an angle catches the upright with a corner, and an upright is the one part of a rack that everything above depends on. Squaring up in the aisle, where there is room to correct, is how the bay goes in straight without touching steel. A walkie turns tightly around its drive wheel, so the swing is small and deliberate.",
      turn: { turns: 0.25, axis: "y", label: "TILLER" },
    },
    {
      id: "set-pallet", kind: "drag", target: "pjr-pallet",
      title: "Set the pallet in the floor location",
      cue: "Run the pallet straight into the floor location and set it down inside the painted lines.",
      why: "A floor location has its own lines for a reason: they keep the pallet inside the uprights and back from the aisle, and they hold the flue space between back-to-back loads that the sprinklers need to reach a fire in the rack. A pallet left proud of the lines is the one the next truck clips with its load, and the one a picker has to squeeze past.",
      drag: { to: "pjr-floor-bay", radius: 0.5, missNote: "Not inside the lines — square it up and run it straight into the location." },
    },
    {
      id: "flue-check", kind: "select", target: "pjr-flue-check",
      title: "Check the flue space and the overhang",
      cue: "Look at the gap behind the pallet and the pallet's edge against the lines before you pull out.",
      why: "Flue spaces are the vertical gaps between loads that let heat rise to the sprinkler heads and let the water come down through the rack; a pallet shoved to the back closes them. A pallet that overhangs the aisle is struck by the next truck's load. Both are fixed now in seconds, with the forks still under, instead of found at an inspection.",
    },
    {
      id: "rack-walk", kind: "find", noHint: true,
      targets: ["pjr-bent-upright", "pjr-missing-clip", "pjr-overhang"],
      itemNames: { "pjr-bent-upright": "the bent upright", "pjr-missing-clip": "the beam connector with no safety clip", "pjr-overhang": "the pallet hanging off the beam" },
      itemNotes: {
        "pjr-bent-upright": "The front upright of this frame has a kink at fork height with the paint scraped off. A struck upright has lost much of its capacity; the bay is unloaded and tagged until someone qualified looks at it.",
        "pjr-missing-clip": "This beam connector has no safety clip in it. The clip is what stops the beam lifting out of the upright when a fork strikes it from below.",
        "pjr-overhang": "This pallet is hanging off the front beam with its stringers barely on steel. A pallet that is not on both beams bears on one edge and can tip off when the bay is loaded beside it.",
      },
      title: "Walk the rack before the next putaway",
      cue: "Walk the run you worked in and find what the last shift left behind.",
      why: "Rack damage is almost never reported by whoever caused it, and it accumulates: a nudged upright, a missing clip, a pallet shoved half on the beam. The person most likely to see it is the next operator at fork height. Finding it and reporting it is part of the job, and a damaged bay is unloaded rather than worked around.",
    },
    {
      id: "park", kind: "sequence",
      targets: ["pjr-forks-down", "pjr-key", "pjr-charger-plug"],
      itemNames: { "pjr-forks-down": "forks fully lowered", "pjr-key": "key off", "pjr-charger-plug": "on the charger" },
      title: "Park the truck the way the standard says",
      cue: "Forks all the way down, key off and out, then plug into the charger in the charging area.",
      why: "An unattended truck is left with the forks fully lowered, the controls neutral, the power off and the brake set — a raised fork is a shin injury at walking height, and a keyed truck is a truck somebody untrained can drive. The charger is last because a truck is never charged while it is still in use or with its forks still up in the aisle.",
      outOfOrderNote: "Forks down first, then the key, then the charger — a truck is made safe before it is plugged in.",
    },
    {
      id: "crew-checkin", kind: "select", target: "pjr-crew-checkin",
      title: "Check in with the floor lead",
      cue: "Tell the lead about the tagged truck defects and the rack damage, and say how the shift is going.",
      why: "The defects you found only get fixed if the person who assigns trucks and schedules rack repairs hears about them before the next shift keys the same truck. The check-in is also where the lead finds out that an aisle is tight, a pallet came in broken or you had a close call with a picker — the kind of thing that never makes it into a report unless someone asks.",
    },
    {
      id: "warehouse-log", kind: "select", target: "pjr-warehouse-log",
      title: "Write the warehouse log",
      cue: "Log the truck inspection result, the putaway location and the rack damage, then sign it.",
      why: "The warehouse log is the record that the truck was inspected and the rack was walked, and it is the only thing the next shift can read without finding you. A defect written down with a location and a time gets a work order; a defect mentioned in passing gets found again, by somebody else, possibly with a load on the forks.",
    },
  ],

  interrupts: [
    {
      id: "rack-struck",
      kind: "Rack strike",
      after: "lift-hold", delay: 3, seconds: 12,
      alert: "A forklift in the next aisle has clipped a rack upright. The beam at the end of your run has dropped a notch and the cartons above it are leaning.",
      cue: "Keep people out of the struck bay.",
      target: "pjr-cordon",
      why: "A struck rack can fail minutes after the strike as the load redistributes, and the people most at risk are the ones who walk up to look. Putting the chain across the bay is the first job: nobody under it, nobody loading it, until it is unloaded and inspected.",
      missNote: "You kept working with a struck bay open beside you. Rack collapses often come after the hit, not with it — while somebody is picking from the bay, or walking past to see what the noise was.",
      wrongNote: "It is the cordon chain. A rack that has just been hit is the only thing on this floor that matters until nobody can walk under it.",
    },
    {
      id: "picker-steps-out",
      kind: "Pedestrian in path",
      after: "travel", delay: 3, seconds: 10,
      alert: "A picker has stepped out of the cross aisle ahead with a tote, looking at a scanner, not at you.",
      cue: "Warn them before you are any closer.",
      target: "pjr-horn",
      why: "A pedestrian reading a scanner is not looking for trucks, and a walkie is quiet. The horn is the only warning the truck has that works around a corner and over a rack, and it costs nothing to use it early.",
      missNote: "You kept travelling toward someone who had not seen you. Pedestrians struck by warehouse trucks almost always assumed they had been seen; the horn exists so that assumption never has to be made.",
      wrongNote: "It is the horn. Somebody is in your path looking the other way, and every step closes the distance.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.4, PJR_ACCENT);

    // ------------------------------------------------------------ floor
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#6c7076", base2: "#5f6369", seam: "rgba(0,0,0,0.35)",
    }), { repeat: 4, px: 512 });
    const floor = box(g, 6.8, 0.1, 6.2, 0, 0.05, -0.1, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.03, color: 0xc4c8cc });
    // Aisle lines and the pedestrian walkway down the right-hand side.
    for (const x of [-2.9, 1.95]) box(g, 0.08, 0.006, 5.6, x, 0.103, -0.1, 0xf2c14b, { rough: 0.7, cast: false });
    for (let i = 0; i < 8; i++) box(g, 0.5, 0.005, 0.12, 2.45, 0.103, -2.4 + i * 0.62, 0xf2c14b, { rough: 0.7, cast: false });
    holoTag(g, "pedestrian walkway", 2.45, 0.35, 2.2, { css: "#f2c14b", w: 0.36 });

    // ------------------------------------------------------------ racking
    const rack = group(g, 0, 0.1, 0);
    const frameX = [-2.6, -1.3, 0, 1.3];
    const uprights = [];
    for (const x of frameX) {
      for (const z of [-1.72, -2.48]) uprights.push(box(rack, 0.08, 2.7, 0.08, x, 1.35, z, PJR_RACK, { rough: 0.55, metal: 0.45 }));
      const brace = box(rack, 0.03, 0.95, 0.03, x, 0.8, -2.1, PJR_RACK, { rough: 0.55, metal: 0.45 });
      brace.rotation.x = 0.75;
      box(rack, 0.2, 0.02, 0.2, x, 0.01, -1.72, 0x2b2f34, { rough: 0.8, cast: false });
    }
    const beams = [];
    for (let b = 0; b < 3; b++) {
      const cx = (frameX[b] + frameX[b + 1]) / 2;
      for (const y of [1.1, 2.2]) for (const z of [-1.72, -2.48]) beams.push(box(rack, 1.22, 0.12, 0.05, cx, y, z, PJR_BEAM, { rough: 0.5, metal: 0.35 }));
    }
    // Loads already in the rack: a pallet base, the carton block and a label.
    const load = (parent, x, y, z, h, color, label) => {
      const p = group(parent, x, y, z);
      box(p, 1.0, 0.13, 0.9, 0, 0.065, 0, PJR_WOOD, { rough: 0.9 });
      box(p, 0.95, h, 0.85, 0, 0.13 + h / 2, 0, color, { rough: 0.85 });
      if (label) decal(p, 0.26, 0.12, 0, 0.13 + h * 0.6, 0.426, signFace(label, { bg: "#f2ede0", fg: "#2b2f34", accent: "#e8792c", scale: 0.42 }), { px: 128 });
      return p;
    };
    load(rack, -1.95, 0.0, -2.1, 0.8, PJR_CARTON, "A-01");
    load(rack, -1.95, 1.16, -2.1, 0.7, 0xb89a6c, "A-02");
    load(rack, -1.95, 2.26, -2.1, 0.5, 0xd4b88a, "A-03");
    load(rack, 0.65, 0.0, -2.1, 0.9, 0xc2a070, "C-01");
    const leaning = load(rack, 0.65, 1.16, -2.1, 0.7, PJR_CARTON, "C-02");
    load(rack, -0.65, 2.26, -2.1, 0.55, 0xbfa37a, "B-03");
    // The overhanging pallet: shoved half off the front beam of bay C, level three.
    const overhang = load(rack, 0.65, 2.26, -1.68, 0.5, 0xd8c29a, "C-03");
    reg2(overhang, "pjr-overhang");
    // Bent upright and missing clip: the rack-walk finds.
    uprights[0].rotation.z = 0.05;
    const scrape = box(rack, 0.09, 0.22, 0.01, -2.6, 0.45, -1.67, 0xd9dde2, { rough: 0.6, metal: 0.6 });
    reg2(scrape, "pjr-bent-upright");
    const clipGap = box(rack, 0.06, 0.1, 0.06, -1.24, 1.1, -1.67, 0xd2312b, { rough: 0.5, emissive: 0xd2312b, ei: 0.35 });
    reg2(clipGap, "pjr-missing-clip");
    // Bay B: an empty floor location with painted lines, and beam level two
    // empty above it with its plaque.
    for (const [x, z, w, d] of [[-0.65, -1.62, 1.1, 0.04], [-1.2, -2.1, 0.04, 1.0], [-0.1, -2.1, 0.04, 1.0]]) {
      box(g, w, 0.006, d, x, 0.104, z, 0xf2f5f7, { rough: 0.6, cast: false });
    }
    const baySocket = box(g, 1.0, 0.04, 0.9, -0.65, 0.12, -2.1, 0xffffff, { rough: 0.6 });
    baySocket.visible = false; hits["pjr-floor-bay"] = baySocket;
    holoTag(g, "B-01 floor location", -0.65, 0.6, -1.6, { css: "#f0a13a", w: 0.38 });
    const overMark = slab(rack, 1.0, 0.02, 0.8, -0.65, 1.2, -2.1, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(rack, "B-02 — send it up here?", -0.65, 1.55, -1.66, { css: "#d2312b", w: 0.44 });
    reg2(overMark, "pjr-over-limit");
    // The rack plaque on the end frame.
    holoPanel(g, 0.5, 0.36, 1.62, 1.45, -1.72, (ctx, w, h) => {
      ctx.fillStyle = "#12233a"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f0a13a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eef4fb"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("RACK LOAD PLAQUE", w * 0.06, h * 0.15);
      ctx.font = `${Math.round(h * 0.095)}px Arial, sans-serif`;
      ["Max per beam level: 2,000 lb", "Uniformly distributed", "Floor locations: on slab", "Report any damage — do not load", "Beam clips in every connector"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.14)));
    }, { ry: -0.5, accent: PJR_ACCENT });

    // ------------------------------------------------------------ the pallet to put away
    const pallet = group(g, 0.55, 0.1, -0.35);
    box(pallet, 1.0, 0.13, 1.1, 0, 0.065, 0, PJR_WOOD, { rough: 0.9 });
    for (const x of [-0.42, 0, 0.42]) box(pallet, 0.1, 0.1, 1.1, x, 0.05, 0, 0x7f6446, { rough: 0.95 });
    box(pallet, 0.95, 0.95, 1.02, 0, 0.61, 0, PJR_CARTON, { rough: 0.85 });
    box(pallet, 0.97, 0.9, 1.04, 0, 0.6, 0, 0xdfe8ee, { rough: 0.2, opacity: 0.25, cast: false });
    decal(pallet, 0.3, 0.18, 0, 0.8, 0.53, paperFace("PUTAWAY", ["2,650 lb", "to B-01"], { bg: "#f6f1e4" }), { px: 160 });
    reg2(pallet, "pjr-pallet");
    // A broken pallet parked by the column: the pallet nobody should lift.
    const broken = group(g, -1.9, 0.1, 0.55, 0.3);
    box(broken, 1.0, 0.13, 1.0, 0, 0.065, 0, 0x8a6c4a, { rough: 0.95 });
    const split = box(broken, 0.12, 0.03, 1.0, 0.2, 0.14, 0, 0x5a4530, { rough: 0.95 });
    split.rotation.z = 0.35;
    box(broken, 0.9, 0.6, 0.9, -0.03, 0.46, 0, 0xb89a6c, { rough: 0.85 });
    holoTag(broken, "split deck board — lift it?", 0, 0.95, 0, { css: "#d2312b", w: 0.46 });
    reg2(broken, "pjr-broken-pallet");

    // ------------------------------------------------------------ the walkie pallet jack
    const jack = group(g, 0.55, 0.1, 1.05);
    box(jack, 0.72, 0.75, 0.42, 0, 0.46, 0.2, PJR_ACCENT, { rough: 0.5, metal: 0.25 });
    box(jack, 0.74, 0.05, 0.44, 0, 0.86, 0.2, 0x2b2f34, { rough: 0.7 });
    decal(jack, 0.3, 0.12, 0, 0.55, 0.415, signFace("4,500 lb", { bg: "#1c1408", accent: "#f0a13a", scale: 0.5 }), { px: 128 });
    const forks = group(jack, 0, 0, 0);
    for (const sx of [-1, 1]) box(forks, 0.17, 0.06, 1.15, sx * 0.24, 0.05, -0.55, 0x3a3f45, { rough: 0.5, metal: 0.5 });
    reg2(forks, "pjr-forks-down");
    const rollers = [];
    for (const sx of [-1, 1]) {
      const r = cyl(jack, 0.04, 0.04, 0.1, sx * 0.24, 0.04, -1.05, 0x1c1f23, { rough: 0.8, seg: 12 });
      r.rotation.z = Math.PI / 2; rollers.push(r);
    }
    const flat = box(jack, 0.11, 0.02, 0.05, -0.24, 0.005, -1.05, 0xd2312b, { rough: 0.6, emissive: 0xd2312b, ei: 0.4 });
    reg2(flat, "pjr-roller-flat");
    const driveWheel = cyl(jack, 0.12, 0.12, 0.08, 0, 0.12, 0.3, 0x1c1f23, { rough: 0.85, seg: 16 });
    driveWheel.rotation.z = Math.PI / 2;
    cyl(jack, 0.06, 0.06, 0.3, 0.22, 0.6, 0.02, 0x59636d, { rough: 0.4, metal: 0.7, seg: 12 });
    const drip = cyl(g, 0.12, 0.12, 0.004, 0.77, 0.104, 1.05, 0x3d2c1a, { rough: 0.2, opacity: 0.8, seg: 16, cast: false });
    reg2(drip, "pjr-hyd-leak");
    const cable = cyl(jack, 0.015, 0.015, 0.4, -0.25, 0.9, 0.35, 0x1c1f23, { rough: 0.7, seg: 8 });
    cable.rotation.x = 0.9;
    const fray = box(jack, 0.05, 0.04, 0.05, -0.25, 1.02, 0.5, 0xd98a3a, { rough: 0.4, metal: 0.6, emissive: 0xd98a3a, ei: 0.3 });
    reg2(fray, "pjr-cable-fray");
    // Tiller arm and head: the controls the operator walks with.
    const tiller = group(jack, 0, 0.62, 0.42);
    const arm = cyl(tiller, 0.025, 0.025, 0.95, 0, 0.35, 0.28, 0x2b2f34, { rough: 0.5, metal: 0.5, seg: 10 });
    arm.rotation.x = 0.65;
    const head = group(tiller, 0, 0.72, 0.58);
    box(head, 0.42, 0.1, 0.14, 0, 0, 0, 0x2b2f34, { rough: 0.6 });
    const belly = cyl(head, 0.045, 0.045, 0.04, 0, 0, 0.08, 0xd2312b, { rough: 0.5, seg: 14 });
    belly.rotation.x = Math.PI / 2;
    reg2(belly, "pjr-belly-button");
    const horn = box(head, 0.06, 0.04, 0.05, -0.14, 0.06, 0.02, 0xf2c14b, { rough: 0.5 });
    reg2(horn, "pjr-horn");
    const liftBtn = box(head, 0.06, 0.04, 0.05, 0.14, 0.06, 0.02, 0x59c97b, { rough: 0.5 });
    reg2(liftBtn, "pjr-lift-button");
    const throttle = cyl(head, 0.03, 0.03, 0.1, 0.25, 0, 0, 0x1c1f23, { rough: 0.5, seg: 10 });
    throttle.rotation.z = Math.PI / 2;
    reg2(throttle, "pjr-throttle");
    const brakeGrip = box(head, 0.1, 0.03, 0.08, 0, -0.07, -0.02, 0x59636d, { rough: 0.5, metal: 0.4 });
    reg2(brakeGrip, "pjr-tiller-brake");
    const tillerHit = box(tiller, 0.5, 0.08, 0.08, 0, 0.55, 0.42, 0xffffff, { opacity: 0.001, cast: false });
    reg2(tillerHit, "pjr-tiller");
    holoTag(jack, "tiller head: horn · lift · belly button", 0, 1.62, 0.95, { css: "#f0a13a", w: 0.62 });
    const key = box(jack, 0.05, 0.08, 0.02, 0.28, 0.88, 0.38, 0xd9dde2, { rough: 0.3, metal: 0.8 });
    reg2(key, "pjr-key");
    const scaleHead = instrument(jack, -0.2, 0.88, 0.1, { idle: "-- lb", color: PJR_ACCENT, w: 0.13, d: 0.16 });
    reg2(scaleHead, "pjr-capacity-plate");
    holoTag(jack, "scale head", -0.2, 1.08, 0.1, { css: "#f0a13a", w: 0.2 });
    const rideDeck = slab(jack, 0.5, 0.02, 0.2, 0, 0.3, 0.52, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.4, cast: false });
    holoTag(jack, "step on and ride?", 0, 0.42, 0.72, { css: "#d2312b", w: 0.3 });
    reg2(rideDeck, "pjr-ride-jack");

    // ------------------------------------------------------------ extinguisher column, cordon, charger
    const column = group(g, -2.55, 0.1, 1.4);
    box(column, 0.3, 3.0, 0.3, 0, 1.5, 0, 0xc9ced2, { rough: 0.7 });
    box(column, 0.32, 0.9, 0.32, 0, 0.45, 0, 0xf2c14b, { rough: 0.6 });
    cyl(column, 0.08, 0.08, 0.5, 0.22, 0.9, 0, 0xc0322b, { rough: 0.4, metal: 0.2, seg: 14 });
    decal(column, 0.22, 0.16, 0, 1.55, 0.155, signFace("FIRE EXT.", { bg: "#c0322b", accent: "#ffffff", scale: 0.45 }), { px: 128 });
    const noPark = slab(g, 0.9, 0.01, 0.8, -1.9, 0.106, 1.55, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(g, "park it here?", -1.9, 0.3, 1.55, { css: "#d2312b", w: 0.26 });
    reg2(noPark, "pjr-park-extinguisher");
    // Cordon chain stand for a struck bay: posts ready, chain stowed.
    const cordon = group(g, 1.7, 0.1, -1.2);
    for (const dx of [0, 0.9]) {
      cyl(cordon, 0.03, 0.03, 0.9, dx, 0.45, 0, 0xf2c14b, { rough: 0.5, seg: 10 });
      cyl(cordon, 0.12, 0.14, 0.04, dx, 0.02, 0, 0x2b2f34, { rough: 0.7, seg: 12 });
    }
    const chain = box(cordon, 0.9, 0.03, 0.03, 0.45, 0.85, 0, 0xd2312b, { rough: 0.5 });
    chain.visible = false;
    const chainHit = box(cordon, 0.3, 0.2, 0.2, 0, 0.9, 0, 0xd2312b, { rough: 0.5 });
    holoTag(cordon, "cordon chain", 0.45, 1.15, 0, { css: "#f0a13a", w: 0.26 });
    reg2(chainHit, "pjr-cordon");
    const charger = equipmentCabinet(g, 0.55, 1.0, 0.35, 2.35, 0.95, { ry: -Math.PI / 2, color: 0x5a6570, lines: ["CHARGER", "48 V"] });
    const plug = box(charger, 0.1, 0.08, 0.12, 0, 0.7, 0.24, 0x1c1f23, { rough: 0.6 });
    reg2(plug, "pjr-charger-plug");
    holoTag(charger, "charger", 0, 1.35, 0.2, { css: "#f0a13a", w: 0.2 });
    const chargeLamp = box(charger, 0.05, 0.05, 0.02, 0.15, 0.95, 0.19, 0x59636d, { rough: 0.4 });

    // ------------------------------------------------------------ boards
    const orderBoard = holoPanel(g, 0.8, 0.54, 2.3, 1.45, -0.55, (ctx, w, h) => {
      ctx.fillStyle = "#1a1408"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f0a13a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffe4c2"; ctx.fillText("PUTAWAY — WALKIE 7", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fff5e8";
      ["Pallet 2,650 lb, 48 x 40", "Assigned: B-01 floor", "Truck rating 4,500 lb", "Beam levels: 2,000 lb max", "Horn at every aisle end", "Report rack damage — do not load"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -1.0, accent: PJR_ACCENT });
    reg2(orderBoard, "pjr-work-order");
    const flueMark = box(g, 1.0, 0.3, 0.06, -0.65, 0.3, -2.62, 0x4fd1ff, { rough: 0.5, opacity: 0.35, cast: false });
    holoTag(g, "flue space", -0.65, 0.72, -2.62, { css: "#4fd1ff", w: 0.22 });
    reg2(flueMark, "pjr-flue-check");
    const checkin = holoPanel(g, 0.46, 0.3, -2.3, 1.7, -0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CREW CHECK-IN", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Tags · rack damage · how it went", w / 2, h * 0.66);
    }, { ry: 1.0, accent: 0x4fd1ff });
    reg2(checkin, "pjr-crew-checkin");
    const log = holoPanel(g, 0.5, 0.34, -1.4, 1.55, 2.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,14,6,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f0a13a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffe8cc"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("WAREHOUSE LOG", w / 2, h * 0.28);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Truck check · putaway · rack", w / 2, h * 0.6);
    }, { ry: 0.6, accent: PJR_ACCENT });
    reg2(log, "pjr-warehouse-log");

    // ------------------------------------------------------------ people
    standingFigure(g, -1.8, -0.12, { ry: 1.2, cloth: 0x37505f, vest: 0xd8e24a });
    const picker = standingFigure(g, 2.55, -2.3, { ry: -0.6, cloth: 0x2b3138, vest: 0xf2a23b });
    holoTag(picker, "picker", 0, 1.95, 0, { css: "#f0a13a", w: 0.16 });

    let travelled = 0;
    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0.1, 0.9, -0.8),
      onStepComplete(step) {
        if (step.id === "controls") repaint(scaleHead.userData.screen, signFace("READY", { bg: "#1c1408", accent: "#59c97b", fg: "#fff0d6", scale: 0.55 }));
        if (step.id === "lift-hold") pallet.position.y = 0.14;
        if (step.id === "square-up") tiller.rotation.y = 0.25;
        if (step.id === "set-pallet") { pallet.position.set(-0.65, 0.1, -2.1); pallet.rotation.y = 0; }
        if (step.id === "park") { forks.position.y = 0; chargeLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 }); }
        if (step.id === "warehouse-log") {
          repaint(log.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(8,26,14,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#d8f6e4"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.fillText("LOG SIGNED", w / 2, h * 0.36);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Bay A tagged · truck 7 out of service", w / 2, h * 0.66);
          });
        }
      },
      // The beam really drops and the cartons really lean; the picker really
      // walks out into the aisle. Both are in view from the tiller.
      onInterrupt(it) {
        if (it.id === "rack-struck") { beams[3].position.y -= 0.12; beams[3].rotation.z = 0.08; leaning.rotation.z = -0.12; }
        if (it.id === "picker-steps-out") { picker.position.set(1.35, 0, 0.15); picker.rotation.y = -1.6; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "rack-struck") { chain.visible = true; chainHit.material = mat(0x59c97b, { rough: 0.5 }); }
        if (it.id === "picker-steps-out") { picker.position.set(2.55, 0, -0.6); picker.rotation.y = -0.6; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "rating") {
          const ok = gg.t >= 0.36 && gg.t <= 0.62;
          repaint(scaleHead.userData.screen, signFace(`${Math.round(1200 + gg.t * 3800)} lb`, { bg: "#1c1408", accent: ok ? "#59c97b" : "#f2ae14", fg: "#fff0d6", scale: 0.55 }));
        }
        if (step?.id === "travel" && session.holding) travelled = Math.min(1, travelled + dt / 8);
        if (session?.turn && step?.id === "square-up") tiller.rotation.y = session.turn.amount;
        jack.position.z = 1.05 - travelled * 0.25;
        for (const r of rollers) r.rotation.x = travelled * 12;
        void t;
      },
    };
  },
};
