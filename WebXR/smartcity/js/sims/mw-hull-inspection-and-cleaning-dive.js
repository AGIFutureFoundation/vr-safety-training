import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { CITY, holoPanel, holoTag, reg, surfaceTexture, texturedMat, hullFace } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hull Inspection & Cleaning Dive VR — Maritime & Ports, the
// marine and water pack of the Bay Area Union Edition, on the bay-underwater
// district.
//
// Under the stern quarter of a ship lying at a berth: the hull plate leaning
// out over the diver with its zinc anodes and a sea chest grating, the
// propeller and rudder aft, a hydraulic hull brush brought down on the stage,
// and the diver's umbilical back to the district's dive stage at (−4.3, 2.8).
// The learner is a Pile Drivers commercial diver; the ship's MEBA engineer has
// locked out the shaft and the sea suctions, and the supervisor is on the
// comms. No depth, gas, decompression or thickness figure is invented — each
// reads against "the dive plan", "the tables the supervisor holds" or "the
// owner's minimum".

const MWHC_ACCENT = 0x6fc3e8;

/** The hull plate's outboard face, in the hull group's frame, at height y. */
const MWHC_FACE = (y) => -0.157 - (y - 2.6) * 0.331;

export const SIM_MW_HULL_INSPECTION_AND_CLEANING_DIVE = {
  id: "mw-hull-inspection-and-cleaning-dive",
  index: "235",
  domain: "Maritime & Ports",
  trade: "Pile Drivers of the Carpenters commercial diver on a hull inspection and cleaning dive, with the ship's MEBA licensed engineer holding the shaft and sea-suction lockouts and the dive supervisor on the comms",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 600,
  },
  certification: "Pile Drivers of the Carpenters commercial diver apprenticeship and the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations, including the vessel's own hazards to the diver; ADCI consensus standards for commercial diving and ships' husbandry; USCG 46 CFR 197 Subpart B for a dive worked from or under a vessel; MEBA engineering practice for the ship's shaft and sea-suction lockouts; depth, gas and decompression per the dive plan and the tables the supervisor holds",
  name: "Hull Inspection & Cleaning Dive",
  title: simTitle("Hull Inspection & Cleaning Dive"),
  tagline: "Under a ship's stern quarter: the ship's lockouts confirmed on comms, the umbilical checked while a tug's screw turns at the next berth, the anodes and coating inspected, the pneumo read, the brush brought off the stage and opened only on the plate, a strake cleaned at a breathing pace while the sea suction starts to draw, the running gear walked, the sea chest cleaned only behind its tag, the plate gauged, the tools sent up and the findings read up for the dive log",
  accent: MWHC_ACCENT,
  accentCss: "#6fc3e8",
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "locked-out-below", name: "Locked Out Below", note: "Nothing touched until the ship's lockouts were confirmed, never a hand between blade and hull, never a lift bag without its dump, never under the keel" },

  supportLine: "your union hall's member assistance programme — the Pile Drivers of the Carpenters or MEBA — with the employer's employee assistance line behind it",

  game: system({
    name: "Ship's Husbandry",
    currency: "STRAKE",
    ranks: ["Diver Trainee", "Diver", "Husbandry Diver", "Lead Husbandry Diver", "Ship's Husbandry Certified"],
    badges: [
      { id: "lockouts-first", name: "Lockouts First", note: "The ship's shaft and sea suctions confirmed locked out before going under the hull", test: AWARD.stepClean("confirm-lockouts") },
      { id: "gauged-true", name: "Gauged True", note: "Pneumo and plate gauge committed inside the band", test: AWARD.precise(0.7) },
      { id: "clear-of-the-gear", name: "Clear Of The Gear", note: "Never between blade and hull, never at the grating untagged, never a sealed lift bag, never under the keel", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-husbandry", name: "Clean Dive", note: "No corrections from the lockouts to the log", test: AWARD.clean },
      { id: "steady-strake", name: "Steady Strake", note: "Breathing held on the supply the whole strake", test: AWARD.unbroken },
      { id: "berth-window-hull", name: "Berth Window", note: "Findings read up inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "grating-untagged": "You reached into the sea chest grating before confirming its valve was shut and tagged. A sea chest is where the ship draws cooling and ballast water, and a pump started on it pulls a diver's hand, arm or body onto the grating with a force no one can pull against. The grating is touched only after the ship's engineer has confirmed on comms, through the supervisor, that its valve is shut, locked and tagged.",
    "lift-bag-sealed": "You started filling the lift bag on the brush with its dump valve shut. A lift bag expands as it rises and the pressure falls, and one with no way to vent runs away to the surface — dragging whatever is rigged to it, and a diver fouled in its rigging, through an uncontrolled ascent. A lift bag is filled in small amounts with the dump valve working and the diver clear of the rigging.",
    "between-blade-and-hull": "You put yourself between a propeller blade and the hull to look at the shaft. Even with the shaft locked, the gap between a blade and the hull or the rudder is where a diver is crushed if anything moves — the lock slipping, the ship's crew mistaking the tag, the current turning a free-wheeling blade. You inspect the running gear from outside the blade's arc.",
    "under-the-keel": "You went under the keel to reach the other side of the hull. Your umbilical follows you, and under a ship's keel it can be pinched against the bottom by the ship settling on the tide or fouled on the bilge keel on the way back — the other side is worked from its own descent, not reached under the ship.",
  },

  lateNotes: {
    "brush-valve": "The brush's hydraulics open once the brush is flat on the plate — never with it hanging free in the water.",
    "sea-chest-grating": "The sea chest grating is worked once the lockout on its valve has been confirmed — read the tag and hear it from topside first.",
    "hc-slate": "The findings are read up once the plate has been gauged and the tools are back on the stage.",
  },

  steps: [
    {
      id: "confirm-lockouts", kind: "select", target: "hc-comms",
      title: "Confirm the ship's lockouts on comms before going under",
      cue: "Ask the supervisor to confirm with the ship's engineer: shaft locked and tagged, sea suctions and overboard discharges shut, thrusters locked out — and hear it repeated back.",
      why: "A ship alongside is full of machinery that can kill a diver under it: the shaft and propeller, the thrusters, and the sea suctions that draw water through the hull. 29 CFR 1910 Subpart T and the ADCI consensus standards both expect the vessel's hazards to be secured before a diver goes under, and the diver hears it confirmed through the supervisor because the diver is the one who cannot see the ship's control room.",
    },
    {
      id: "umbilical-check", kind: "hold", target: "hc-umbilical-harness", seconds: 4,
      title: "Check your umbilical from the helmet to the harness",
      cue: "Run your hand down the umbilical to the harness ring: strain relief clipped, no turns round the stage bridle, and a clear lead back to the stage away from the ship's bilge keel.",
      why: "Under a hull the umbilical has more to foul on than on open bottom: the bilge keel, the anodes, the rudder and the propeller. Proving its lead at the start, by hand from helmet to harness, means the tender can recover you in a straight line, and a turn round the stage bridle found now is found by you rather than by the standby.",
      holdBreakNote: "Released before the check reached the harness ring — the length you skipped is the length that fouls. Start again from the helmet.",
    },
    {
      id: "hull-survey", kind: "find", noHint: true,
      targets: ["anode-wasted", "coating-blister"],
      itemNames: { "anode-wasted": "zinc anode wasted to a sliver", "coating-blister": "blistered coating with rust weeping" },
      itemNotes: {
        "anode-wasted": "The middle anode has wasted away to a sliver on its straps — it has spent itself protecting the hull and is about to stop, after which the hull plate corrodes in its place.",
        "coating-blister": "A patch of the hull coating has blistered and a blister has broken, with rust weeping from the plate underneath — the coating has failed there and the steel is now doing the protecting.",
      },
      title: "Survey the hull plate, the anodes and the coating",
      cue: "Look along the hull: the zinc anodes and how much of each is left, the coating for blisters and breakdown, weld seams and any damage from fenders or tugs.",
      why: "A hull under water is protected twice — by its coating and by sacrificial anodes that corrode in its place — and a husbandry dive exists to find where either has stopped working. An anode wasted to a sliver and a coating that has blistered both look like small things; both are the start of the plate itself corroding, and the owner can only plan the dry-docking around what the diver reports.",
    },
    {
      id: "hull-pneumo", kind: "gauge", target: "hc-pneumo",
      title: "Hold the pneumo at the anode for the record",
      cue: "Hold the pneumo hose's end at the wasted anode while the supervisor bleeds it, and commit the reading against the depth the dive plan gives for this part of the hull.",
      why: "The reading places the defect on the hull for the owner's record and tells the supervisor where you are against the plan — under a ship, working down toward the flat of bottom takes a diver deeper than the side plate they started on, and that changes which line of the tables the supervisor holds applies. It is read at the defect, not guessed from the waterline.",
      gauge: { label: "PNEUMO AT ANODE", speed: 0.7, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "shallower than the plan" : t <= 0.58 ? "per the dive plan" : "deeper than planned — tell topside"), missNote: "Outside the band — hold the pneumo end still at the anode while the supervisor reads it against the plan." },
    },
    {
      id: "brush-down", kind: "drag", target: "hull-brush",
      title: "Bring the hull brush off the stage and set it on the plate",
      cue: "Take the hydraulic brush off the stage on its lift line and set it flat on the hull plate at the marked start, handles to you.",
      why: "The brush is heavy and comes down on the stage and its own line, never carried by a diver swimming with it. It goes onto the plate flat before anything else, because a hydraulic brush started off the plate spins up in open water, drags the diver by its handles and whips its hoses round the umbilical; flat on the plate, the hull takes its torque.",
      drag: { to: "brush-start-mark", radius: 0.55, missNote: "Not on the plate — set the brush flat at the marked start on the hull before anything else." },
    },
    {
      id: "open-brush", kind: "turn", target: "brush-valve",
      title: "Open the brush's hydraulic valve on the plate",
      cue: "With the brush flat on the plate and both hands on its handles, open the hydraulic valve on the handle steadily.",
      why: "The brush's valve is under the diver's hand on purpose: it is the diver who knows the brush is flat on the plate and both hands are on it, and the valve is opened only then and steadily so the brush takes up against the hull rather than jumping. Letting go of the valve is also the brush's stop — the one control that works faster than calling the surface.",
      turn: { turns: 0.75, label: "BRUSH VALVE", readout: (t) => (t < 0.3 ? "closed" : t < 0.9 ? "opening — brush taking up" : "open — brush on the plate") },
    },
    {
      id: "brush-strake", kind: "track", target: "hull-brush", seconds: 6,
      title: "Clean the strake at a pace your breathing holds",
      cue: "Walk the brush along the strake steadily, keeping your breathing paced so the supervisor sees you steady on the supply.",
      why: "Holding a hydraulic brush against a hull is hard physical work in a place with no footing, and a diver who works it too hard overbreathes the helmet — which feels like not getting enough gas and makes a diver work harder still. The pace is set by the breathing, not the brush, so the gas stays within what the dive plan and the supervisor's panel allow.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.13, label: "BREATHING ON THE SUPPLY", readout: (v) => (v < 0.42 ? "slow — brush stalling" : v > 0.6 ? "breathing hard — ease off" : "steady on the supply") },
      holdBreakNote: "The pace went out of band — either overbreathing or stalled. Settle your breathing and pick the strake up again steadily.",
    },
    {
      id: "running-gear", kind: "find", noHint: true,
      targets: ["rope-on-shaft", "blade-nick"],
      itemNames: { "rope-on-shaft": "rope wound round the shaft at the rope guard", "blade-nick": "nick in a propeller blade's edge" },
      itemNotes: {
        "rope-on-shaft": "A length of mooring rope has wound round the tail shaft behind the rope guard — it will chew into the shaft seal as it turns, and a failed seal lets seawater into the ship and oil into the bay.",
        "blade-nick": "One blade's leading edge has a nick in it, the kind a floating log or a line leaves; a nicked blade vibrates, cavitates and cracks from the nick.",
      },
      title: "Walk the propeller, rope guard and rudder from outside the arc",
      cue: "From outside the blades' arc, look at each blade's edge, the rope guard and the shaft behind it, and the rudder's pintles.",
      why: "The running gear is inspected from outside the arc of the blades, because the gap between a blade and the hull is the most dangerous place on a ship for a diver even with the shaft locked. What is found there is expensive to leave: a rope on the shaft eats the seal that keeps the sea out and the oil in, and a nicked blade cracks from the nick outwards.",
    },
    {
      id: "sea-chest", kind: "sequence",
      targets: ["sea-chest-tag", "sea-chest-grating", "hc-camera"],
      itemNames: { "sea-chest-tag": "lockout tag on the sea chest confirmed", "sea-chest-grating": "sea chest grating cleaned", "hc-camera": "grating photographed for the owner" },
      title: "Clean the sea chest grating only behind its lockout",
      cue: "Read the engineer's lockout tag on the sea chest and confirm it with the supervisor first, then clean the growth off the grating, then photograph it clean for the owner.",
      why: "A sea chest grating is the one place on a hull that can pull a diver in, and it is worked only after the lockout on its valve has been confirmed twice: the tag read at the grating and the engineer's confirmation heard through the supervisor. The order is the protection — a grating cleaned first and the tag read afterwards is a grating a diver touched on the assumption that the pump was off.",
      outOfOrderNote: "Out of order — the lockout tag is read and confirmed before a hand goes near the grating, and the photograph is of the grating once it is clean.",
    },
    {
      id: "plate-gauge", kind: "gauge", target: "ut-gauge",
      title: "Gauge the plate at the weeping blister",
      cue: "Clean the spot back to steel, couple the underwater thickness gauge to the plate and commit the reading against the owner's minimum for the strake.",
      why: "A blister weeping rust is a coating failure and possibly a plate losing thickness under it, and the owner needs a number to decide whether it waits for dry-dock or needs attention now. The thickness gauge gives that number when it is coupled square to clean steel, and it is read against the owner's minimum for that strake rather than against what the plate looks like.",
      gauge: { label: "PLATE THICKNESS", speed: 0.72, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "below the owner's minimum — report" : t <= 0.6 ? "inside the owner's figure" : "no coupling — clean and reseat"), missNote: "Outside the band — clean the spot back to steel and seat the probe square before you read it." },
    },
    {
      id: "tools-up", kind: "drag", target: "hc-tool-bag",
      title: "Send the tools back up on the stage",
      cue: "Clip the tool bag with the gauge and the scraper to the stage rail, with the brush left on its lift line for the tender.",
      why: "Nothing is left under a ship: a tool on the bottom beneath a hull is out of reach once the ship moves and a hazard to the next diver, and a tool loose in the water column is a weight on an umbilical. Clipped to the stage, the tools come up with you on the supervisor's ascent, and the brush comes up on its own line with the tender hauling it, clear of you.",
      drag: { to: "hc-stage-rail", radius: 0.5, missNote: "Not on the stage — clip the bag to the stage rail so it comes up with you." },
    },
    {
      id: "findings-up", kind: "select", target: "hc-slate",
      title: "Read your findings up for the dive log",
      cue: "Read your slate to the supervisor: the wasted anode and its depth, the blister and the plate reading, the rope on the shaft, the nicked blade, the grating cleaned and the suction that drew.",
      why: "The supervisor's dive log and the owner's hull report are both written from what the diver reads up, and it is read while still under the hull so anything uncertain can be looked at again. The sea suction drawing against a confirmed lockout goes in as well, because a lockout that did not hold is the most important thing the ship's engineer will read today.",
    },
    {
      id: "leave-hull", kind: "select", target: "hc-comms",
      title: "Check in and leave the hull on the supervisor's call",
      cue: "Tell the supervisor you are on the stage and clipped on, how you are after the suction and the tug, and wait for the call to leave the bottom.",
      why: "The ascent is the supervisor's, read from the tables they hold, and the check-in is what tells them you are on the stage and well. A sea suction drawing while you were near the grating and a tug's screw turning at the next berth are the kind of minutes that stay with a diver, and the check-in is the first place to say so — the member assistance line is there for anything that does not get said on the comms.",
    },
  ],

  interrupts: [
    {
      id: "tug-screw-next-berth",
      kind: "Vessel's screw turning near the dive",
      after: "umbilical-check", delay: 2, seconds: 14,
      alert: "A tug is working its engine at the next berth — you can hear the screw and the water is starting to pull toward its wash.",
      cue: "Get off the hull onto the downline and hold it, then tell the supervisor you can hear a screw turning.",
      target: "hc-downline",
      why: "A turning screw pulls water, silt and anything slack in the water toward it, and a diver's umbilical is exactly the kind of slack thing it takes. Getting onto the fixed downline stops you and your umbilical being drawn off the hull while the supervisor has the tug stopped — the diver cannot stop the screw, but can stop being where its wash reaches.",
      missNote: "You carried on checking the umbilical while the tug's wash drew a belly of it off the hull and toward the next berth, and the tender felt it go before you did.",
      wrongNote: "The downline — get onto the fixed line so the wash cannot draw you or your umbilical toward the screw.",
    },
    {
      id: "sea-suction-draws",
      kind: "Sea suction drawing at the grating",
      after: "brush-strake", delay: 2, seconds: 14,
      alert: "The water is moving toward the sea chest grating — silt and bits of growth are being drawn onto it, and the lockout was supposed to have it shut.",
      cue: "Call all stop on the comms: the sea chest is drawing — have the supervisor get the ship's engineer to shut it now.",
      target: "hc-comms",
      why: "A sea chest drawing when it was confirmed locked out means a lockout has failed, and the only people who can stop it are in the ship's engine room. The diver's job is to get the word to them immediately, through the supervisor, while staying away from the grating — 'all stop' is the call that stops every job on the ship until the suction is proven shut again.",
      missNote: "You kept brushing the strake while the suction drew growth onto the grating a metre away, and nobody in the engine room knew a valve was open until the brush's hose was pulled toward it.",
      wrongNote: "The comms — only the ship's engine room can shut the suction, and the call has to reach them through the supervisor now.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // --------------------------------------------------- the hull plate
    const hullTex = surfaceTexture((cx, w, h) => hullFace(cx, w, h), { px: 512, repeat: 1 });
    hullTex.repeat?.set?.(2, 1);
    const hullMat = texturedMat(hullTex, { rough: 0.75, metal: 0.2, color: 0xffffff });
    const hull = group(g, 2.4, 0, -0.6);
    const plate = box(hull, 0.3, 3.6, 5.2, 0, 2.6, 0, 0xffffff, { cast: false });
    plate.material = hullMat;
    plate.rotation.z = 0.32;
    const bilgeKeel = box(hull, 0.5, 0.06, 3.4, MWHC_FACE(0.95) - 0.1, 0.95, 0.2, 0x4f2a22, { rough: 0.8, metal: 0.2 });
    bilgeKeel.rotation.z = -0.5;
    const flat = box(hull, 2.2, 0.3, 5.2, 1.1, 0.75, 0, 0xffffff, { cast: false });
    flat.material = hullMat;
    // Weld seams across the plate.
    for (const y of [1.4, 2.6, 3.8]) { const s = box(hull, 0.05, 0.06, 5.2, MWHC_FACE(y) - 0.02, y, 0, 0x9a6452, { rough: 0.5, metal: 0.45 }); s.rotation.z = 0.32; }
    // Anodes, the middle one wasted.
    const anodes = [];
    for (const [z, wasted] of [[-1.6, false], [0.1, true], [1.8, false]]) {
      const a = box(hull, 0.16, wasted ? 0.1 : 0.24, wasted ? 0.35 : 0.9, MWHC_FACE(1.9) - 0.08, 1.9, z, 0xa3a9ad, { rough: 0.5, metal: 0.65 });
      a.rotation.z = 0.32;
      for (const dz of [-0.5, 0.5]) box(hull, 0.1, 0.05, 0.1, MWHC_FACE(1.9) - 0.04, 1.9, z + dz, 0x6b7680, { rough: 0.6, metal: 0.5 }).rotation.z = 0.32;
      anodes.push(a);
    }
    reg(hits, anodes[1], "anode-wasted");
    const blister = group(hull, MWHC_FACE(2.3) - 0.03, 2.3, -0.9);
    for (let i = 0; i < 4; i++) ball(blister, 0.05 + (i % 2) * 0.02, 0, (i % 2) * 0.08, i * 0.07, 0x8a4a2a, { rough: 0.9, seg: 8, seg2: 6 }).scale.set(0.5, 1, 1);
    const weep = box(blister, 0.02, 0.3, 0.05, 0.02, -0.18, 0.1, 0x8a3a1a, { rough: 0.9, emissive: 0x3a1206, ei: 0.35 });
    reg(hits, blister, "coating-blister");
    const utGauge = group(g, 2.05, 2.05, -1.25, -0.3);
    box(utGauge, 0.12, 0.18, 0.06, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    const utScreen = box(utGauge, 0.09, 0.06, 0.005, 0, 0.04, 0.032, 0x0d1c24, { rough: 0.3, emissive: 0x0d1c24, ei: 0.4 });
    hose(utGauge, [[0, -0.09, 0], [0.1, -0.2, -0.05], [0.25, -0.1, -0.1]], 0.008, 0x1b1e22, { steps: 6, rough: 0.7 });
    holoTag(utGauge, "thickness gauge", 0, 0.18, 0, { css: "#6fc3e8", w: 0.32 });
    reg(hits, utGauge, "ut-gauge");
    // Sea chest grating with its lockout tag.
    const chest = group(hull, MWHC_FACE(1.2) - 0.03, 1.2, 1.1);
    chest.rotation.z = 0.32;
    box(chest, 0.06, 0.6, 0.8, 0, 0, 0, 0x2b2e33, { rough: 0.7, metal: 0.4 });
    const bars = group(chest, -0.05, 0, 0);
    for (let i = 0; i < 6; i++) box(bars, 0.03, 0.56, 0.03, 0, 0, -0.33 + i * 0.13, 0x56613f, { rough: 0.9 });
    holoTag(chest, "sea chest grating", -0.2, 0.45, 0, { css: "#6fc3e8", w: 0.34 });
    reg(hits, bars, "sea-chest-grating");
    const tag = group(chest, -0.08, -0.2, 0.46);
    box(tag, 0.01, 0.14, 0.08, 0, 0, 0, 0xf2c14b, { rough: 0.7 });
    box(tag, 0.012, 0.03, 0.08, 0, 0.05, 0, 0xd2312b, { rough: 0.6 });
    holoTag(tag, "lockout tag", -0.1, 0.14, 0, { css: "#6fc3e8", w: 0.24 });
    reg(hits, tag, "sea-chest-tag");
    const chestHit = box(chest, 0.3, 0.4, 0.4, -0.2, -0.05, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(chest, "reach in untagged?", -0.35, -0.2, -0.3, { css: "#d2312b", w: 0.38 });
    reg(hits, chestHit, "grating-untagged");
    const suction = group(g, 1.6, 1.25, 0.5);
    for (let i = 0; i < 6; i++) { const s = box(suction, 0.5, 0.01, 0.03, -0.3 - (i % 3) * 0.2, (i % 2) * 0.2 - 0.1, (i - 3) * 0.12, 0xb8e0d8, { rough: 0.4, emissive: 0x6aa8a0, ei: 0.6, cast: false }); s.rotation.y = 0.3 - i * 0.1; }
    suction.visible = false;
    const underKeel = box(g, 1.0, 0.4, 1.4, 2.2, 0.3, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "under the keel to the far side?", 1.8, 0.55, 0.9, { css: "#d2312b", w: 0.56 });
    reg(hits, underKeel, "under-the-keel");

    // ------------------------------------------ propeller, shaft, rudder
    const prop = group(g, 2.5, 1.35, -3.55, -Math.PI / 2);
    const shaft = cyl(prop, 0.1, 0.1, 1.6, 0.8, 0, 0, 0x8a949d, { rough: 0.35, metal: 0.85, seg: 12 });
    shaft.rotation.z = Math.PI / 2;
    const hub = cyl(prop, 0.22, 0.18, 0.4, 0, 0, 0, 0xc8a24a, { rough: 0.3, metal: 0.9, seg: 16 });
    hub.rotation.z = Math.PI / 2;
    const blades = group(prop, 0, 0, 0);
    for (let i = 0; i < 4; i++) {
      const holder = group(blades, 0, 0, 0);
      holder.rotation.x = (i * Math.PI) / 2;
      const b = box(holder, 0.06, 0.9, 0.34, 0, 0.55, 0, 0xc8a24a, { rough: 0.3, metal: 0.9 });
      b.rotation.y = 0.35;
    }
    const nick = box(prop, 0.08, 0.08, 0.06, 0.02, 1.0, 0.1, 0x6a4a1a, { rough: 0.8, emissive: 0x3a2206, ei: 0.4 });
    reg(hits, nick, "blade-nick");
    const guard = cyl(prop, 0.18, 0.18, 0.1, 0.35, 0, 0, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 14 });
    guard.rotation.z = Math.PI / 2;
    const rope = torus(prop, 0.13, 0.03, 0.55, 0, 0, 0xe8dcb8, { rough: 0.85, seg: 8, seg2: 16 });
    rope.rotation.y = Math.PI / 2;
    reg(hits, rope, "rope-on-shaft");
    const rudder = group(g, 2.5, 1.6, -4.3);
    box(rudder, 0.16, 2.2, 0.9, 0, 0, 0, 0x6e3328, { rough: 0.7, metal: 0.2 });
    cyl(rudder, 0.05, 0.05, 2.6, 0, 0.2, 0.4, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 8 });
    const bladeHit = box(g, 0.6, 0.6, 0.4, 1.9, 1.0, -3.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "between the blade and the hull?", 1.7, 0.6, -3.0, { css: "#d2312b", w: 0.56 });
    reg(hits, bladeHit, "between-blade-and-hull");
    holoTag(g, "running gear — from outside the arc", 2.2, 2.6, -3.4, { css: "#6fc3e8", w: 0.62 });

    // ------------------------------------------------ the hull brush
    const brush = group(g, -3.4, 0.55, 2.2);
    const disc = cyl(brush, 0.34, 0.34, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.4, seg: 18 });
    void disc;
    const bristles = cyl(brush, 0.32, 0.32, 0.05, 0, -0.07, 0, 0x1b1e22, { rough: 1, seg: 18 });
    for (const sx of [-0.35, 0.35]) {
      box(brush, 0.04, 0.3, 0.04, sx, 0.2, 0, 0xf2c14b, { rough: 0.5 });
      box(brush, 0.04, 0.04, 0.2, sx, 0.36, 0.05, 0xf2c14b, { rough: 0.5 });
    }
    const valve = group(brush, 0.35, 0.36, 0.18);
    cyl(valve, 0.035, 0.035, 0.05, 0, 0, 0, 0xd2312b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    box(valve, 0.08, 0.015, 0.015, 0, 0, 0.03, 0xd2312b, { rough: 0.5 });
    holoTag(valve, "brush valve", 0.1, 0.12, 0, { css: "#6fc3e8", w: 0.24 });
    reg(hits, valve, "brush-valve");
    const bag = group(brush, 0, 0.8, -0.1);
    const bagBody = ball(bag, 0.2, 0, 0.1, 0, 0xf2c14b, { rough: 0.6, seg: 12, seg2: 10 });
    bagBody.scale.set(0.9, 1.3, 0.9);
    for (const sx of [-0.12, 0.12]) cyl(bag, 0.005, 0.005, 0.5, sx, -0.25, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 4 });
    const bagHit = box(bag, 0.4, 0.5, 0.4, 0, 0.1, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bag, "fill the bag — dump shut?", 0, 0.5, 0, { css: "#d2312b", w: 0.46 });
    reg(hits, bagHit, "lift-bag-sealed");
    holoTag(brush, "hull brush", 0, 1.55, 0, { css: "#6fc3e8", w: 0.24 });
    reg(hits, brush, "hull-brush");
    const hoses = hose(g, [[-3.5, 2.4, 2.8], [-2.8, 1.2, 2.2], [-3.2, 0.7, 2.25]], 0.025, 0x1b1e22, { steps: 10, rough: 0.7 });
    const startMark = group(hull, MWHC_FACE(1.6) - 0.03, 1.6, -0.2);
    const markRing = torus(startMark, 0.34, 0.012, 0, 0, 0, MWHC_ACCENT, { emissive: MWHC_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    markRing.rotation.y = Math.PI / 2; markRing.rotation.x = 0.32;
    holoTag(startMark, "brush start", -0.15, 0.45, 0, { css: "#6fc3e8", w: 0.24 });
    reg(hits, startMark, "brush-start-mark");
    const cleaned = box(hull, 0.02, 0.6, 1.4, MWHC_FACE(1.6) - 0.01, 1.6, -0.2, 0x8a5244, { rough: 0.6, metal: 0.3 });
    cleaned.rotation.z = 0.32;
    cleaned.visible = false;

    // ----------------------------------------- umbilical, pneumo, downline
    hose(g, [[-3.6, 1.2, 2.5], [-2.6, 0.25, 1.9], [-1.0, 0.2, 1.4], [0.3, 0.3, 0.9], [0.55, 0.95, 0.65]], 0.03, 0xf2c14b, { steps: 16, rough: 0.8 });
    const harness = group(g, 0.55, 1.0, 0.62);
    torus(harness, 0.06, 0.014, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 14 });
    box(harness, 0.05, 0.12, 0.03, 0, -0.1, 0, 0x2b3138, { rough: 0.6 });
    const clip = box(harness, 0.04, 0.05, 0.03, 0.05, 0.05, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(harness, "umbilical to harness", 0, 0.2, 0, { css: "#6fc3e8", w: 0.38 });
    reg(hits, harness, "hc-umbilical-harness");
    const pneumo = group(g, 2.1, 1.75, -0.35);
    cyl(pneumo, 0.012, 0.012, 0.3, 0, 0, 0, 0x2b5aa8, { rough: 0.6, seg: 6 }).rotation.z = 1.2;
    cyl(pneumo, 0.02, 0.02, 0.05, 0.14, 0.05, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 });
    hose(g, [[0.55, 0.95, 0.65], [1.4, 1.4, 0.2], [2.1, 1.75, -0.35]], 0.01, 0x2b5aa8, { steps: 8, rough: 0.6 });
    holoTag(pneumo, "pneumo end", 0, 0.16, 0, { css: "#6fc3e8", w: 0.24 });
    reg(hits, pneumo, "hc-pneumo");
    const downline = group(g, -1.9, 0, 0.9);
    box(downline, 0.4, 0.2, 0.4, 0, 0.1, 0, 0x3a3f45, { rough: 0.8, metal: 0.3 });
    cyl(downline, 0.012, 0.012, 8, 0, 4.1, 0, 0xe8dcb8, { rough: 0.8, seg: 6 });
    holoTag(downline, "downline", 0, 1.6, 0, { css: "#6fc3e8", w: 0.22 });
    reg(hits, downline, "hc-downline");
    const toolBag = group(g, 0.2, 0.1, 0.9);
    box(toolBag, 0.3, 0.2, 0.18, 0, 0.1, 0, 0x2f4f6f, { rough: 0.85 });
    box(toolBag, 0.26, 0.03, 0.03, 0, 0.24, 0, 0x15181c, { rough: 0.7 });
    holoTag(toolBag, "tool bag", 0, 0.42, 0, { css: "#6fc3e8", w: 0.22 });
    reg(hits, toolBag, "hc-tool-bag");
    const rail = group(g, -3.5, 1.4, 2.0);
    torus(rail, 0.2, 0.01, 0, 0, 0, MWHC_ACCENT, { emissive: MWHC_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    holoTag(rail, "stage rail", 0, 0.3, 0, { css: "#6fc3e8", w: 0.22 });
    reg(hits, rail, "hc-stage-rail");
    const slate = decal(g, 0.26, 0.2, 1.0, 1.05, 1.2, paperFace("SLATE", ["Anodes, coating", "Running gear", "Sea chest, plate"], { bg: "#e8eef0", band: "#6fc3e8" }), { px: 192 });
    slate.rotation.y = -0.5;
    holoTag(g, "your slate", 1.0, 1.24, 1.2, { css: "#6fc3e8", w: 0.22 });
    reg(hits, slate, "hc-slate");

    // ---------------------------------------------------- helmet comms
    const comms = holoPanel(g, 0.5, 0.3, -1.1, 1.6, 1.8, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,24,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#6fc3e8"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8eef8"; cx.fillText("HELMET COMMS", w * 0.06, h * 0.24);
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Supervisor · ship's engineer via topside", "Press to talk"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.55 + i * 0.22)));
    }, { ry: 0.4, accent: MWHC_ACCENT });
    reg(hits, comms, "hc-comms");
    const commsLamp = ball(g, 0.03, -0.85, 1.72, 1.95, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });

    // --------------------------------------- scenery: growth, silt, fish
    for (let i = 0; i < 14; i++) {
      const z = -2.2 + (i % 7) * 0.7, y = 0.9 + Math.floor(i / 7) * 2.2;
      const tuft = box(hull, 0.05, 0.12, 0.18, MWHC_FACE(y) - 0.03, y, z, [0x56613f, 0x4a5a32, 0x6a7a4a][i % 3], { rough: 1 });
      tuft.rotation.z = 0.32;
    }
    for (const [x, z, r] of [[-2.4, -0.6, 0.2], [0.8, 2.3, 0.14], [-0.6, 2.6, 0.18], [2.8, 2.2, 0.16], [-2.8, -1.8, 0.22]]) ball(g, r, x, r * 0.4, z, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1, 0.5, 0.8);
    const school = group(g, -1.2, 2.6, 0.4);
    for (let i = 0; i < 7; i++) {
      const f = group(school, (i % 4) * 0.32 - 0.5, Math.floor(i / 4) * 0.22, (i % 3) * 0.18);
      ball(f, 0.055, 0, 0, 0, 0x9ab0b8, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 }).scale.set(2.2, 0.8, 0.6);
      box(f, 0.05, 0.06, 0.01, -0.13, 0, 0, 0x7a9098, { rough: 0.5 });
    }
    // Camera on its lanyard, draft ticks and barnacles along the bilge keel.
    const camera = group(g, 0.9, 1.75, -0.15, -0.6);
    box(camera, 0.2, 0.14, 0.12, 0, 0, 0, 0x1b1e22, { rough: 0.5 });
    const lens = cyl(camera, 0.05, 0.05, 0.06, 0, 0, -0.08, 0x274a5f, { rough: 0.1, metal: 0.5, seg: 12 });
    lens.rotation.x = Math.PI / 2;
    const strobe = ball(camera, 0.04, 0.14, 0.08, -0.04, 0xeaf6fb, { rough: 0.3, emissive: 0x4a5a60, ei: 0.3, seg: 8, seg2: 6 });
    holoTag(camera, "camera", 0, 0.18, 0, { css: "#6fc3e8", w: 0.2 });
    reg(hits, camera, "hc-camera");
    for (let i = 0; i < 8; i++) { const tick = box(hull, 0.03, 0.04, 0.3, MWHC_FACE(3.0 - i * 0.3) - 0.02, 3.0 - i * 0.3, 2.3, 0xf1f3f4, { rough: 0.6 }); tick.rotation.z = 0.32; }
    for (let i = 0; i < 12; i++) ball(hull, 0.05 + (i % 3) * 0.015, MWHC_FACE(0.92) - 0.06 - (i % 2) * 0.05, 0.88 + (i % 2) * 0.05, -1.4 + i * 0.26, [0xd8d2c0, 0xc0baa8, 0x1c1f2a][i % 3], { rough: 0.8, seg: 8, seg2: 6 }).scale.set(1, 0.6, 1);
    for (let i = 0; i < 6; i++) {
      const frond = box(g, 0.03, 0.8 + (i % 3) * 0.2, 0.12, -2.6 + i * 0.35, 0.45, -0.9 - (i % 2) * 0.4, 0x5a7a3a, { rough: 0.9, cast: false });
      frond.rotation.z = 0.2 * ((i % 3) - 1);
    }
    for (let i = 0; i < 5; i++) {
      const a = i * 1.26;
      const star = group(g, -0.2 + Math.cos(a) * 2.4, 0.02, 1.2 + Math.sin(a) * 0.8);
      for (let k = 0; k < 5; k++) { const arm = box(star, 0.12, 0.02, 0.03, 0.06, 0, 0, [0xf2a03d, 0xe86a8a][i % 2], { rough: 0.7 }); arm.rotation.y = (k * Math.PI * 2) / 5; arm.position.set(Math.cos((k * Math.PI * 2) / 5) * 0.06, 0, -Math.sin((k * Math.PI * 2) / 5) * 0.06); }
    }
    // The tug's wash, for the screw at the next berth.
    const wash = group(g, -3.0, 1.0, -2.4);
    for (let i = 0; i < 8; i++) ball(wash, 0.08 + (i % 3) * 0.04, (i % 4) * 0.4, (i % 3) * 0.4, Math.floor(i / 4) * 0.5, 0xdff4f0, { rough: 0.3, emissive: 0x9fd0c8, ei: 0.5, seg: 8, seg2: 6, cast: false });
    wash.visible = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 1.3, -0.8),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "umbilical-check") clip.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "hull-survey") weep.material = mat(0xc05a2a, { rough: 0.9, emissive: 0x5a1a06, ei: 0.6 });
        if (step.id === "brush-down") { brush.position.set(2.45, 1.6, -0.8); brush.rotation.z = Math.PI / 2 + 0.32; hoses.visible = false; }
        if (step.id === "brush-strake") cleaned.visible = true;
        if (step.id === "sea-chest") bars.children.forEach((b) => { b.material = mat(0x6b7680, { rough: 0.6, metal: 0.5 }); });
        if (step.id === "sea-chest") strobe.material = mat(0xffffff, { emissive: 0xffffff, ei: 1.5 });
        if (step.id === "plate-gauge") utScreen.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0 });
        if (step.id === "tools-up") { toolBag.position.set(-3.5, 1.1, 2.0); brush.position.set(-3.4, 0.55, 2.2); brush.rotation.z = 0; }
        if (step.id === "findings-up") repaint(slate, paperFace("SLATE — READ UP", ["Anode wasted · blister gauged", "Rope on shaft · blade nicked", "Suction drew — all stop called"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "tug-screw-next-berth") { wash.visible = true; commsLamp.material = mat(0xf2ae14, { emissive: 0xf2ae14, ei: 1.3 }); }
        if (it.id === "sea-suction-draws") { suction.visible = true; commsLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "tug-screw-next-berth") { wash.position.set(-4.5, 1.5, -3.5); wash.scale.set(0.6, 0.6, 0.6); commsLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (it.id === "sea-suction-draws") { suction.visible = false; commsLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); bristles.material = mat(0x3a3f45, { rough: 1 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "open-brush") valve.rotation.z = session.turn.amount * Math.PI * 2;
        if (step?.id === "brush-strake" && session.holding) disc.rotation.y += (dt ?? 0.016) * 8 * (session.track?.v ?? 0);
        if (wash.visible) wash.children.forEach((b, i) => { b.position.y = ((t * 0.6 + i * 0.3) % 1.6); });
        if (suction.visible) suction.position.x = 1.6 + ((t * 0.8) % 0.4);
        school.position.z = 0.4 + Math.sin(t * 0.25) * 0.4;
        void CITY; void signFace;
      },
    };
  },
};
