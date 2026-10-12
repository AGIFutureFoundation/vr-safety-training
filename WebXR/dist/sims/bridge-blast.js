import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bridge Blast VR — Surface Prep & Coatings, station four.
// Abrasive-blasting the lead-painted steel of a highway girder inside a full
// negative-pressure containment, so the paint removed from a bridge over a
// public road never gets the chance to become the public's problem.
//
// Everything here answers to a number measured before the nozzle ever keys.
// The paint tested positive for lead, so the containment class, the
// respirator and the waste stream downstream of it are all set by that one
// result rather than habit. The manometer on the wall is the only thing that
// proves the containment is actually under vacuum — the poly looks identical
// whether it is or isn't — and the CO monitor on the breathing-air line is
// the only thing that can tell a blaster in a sealed hood something they
// cannot smell, taste or feel for themselves.
//
// The last mile is the one crews cut because the blasting is the part that
// feels finished: the debris that came off that girder is RCRA D008
// hazardous waste the second it left the containment, whatever it is
// carried in, and it stays that way until it is labelled, staged clear of
// the road, and manifested to somebody who can account for it.

const BB_ACCENT = 0xd9a441;

export const SIM_BRIDGE_BLAST = {
  id: "bridge-blast",
  index: "73",
  domain: "Coatings",
  trade: "Abrasive blaster / lead-paint removal technician",
  category: "Surface Prep & Coatings",
  weather: "overcast",
  certification: "IUPAT industrial painters; SSPC-QP 2 certified lead-paint removal contractor and the SSPC-SP 10 near-white blast standard the specification names; OSHA 29 CFR 1926.62 lead in construction, including baseline and periodic blood-lead surveillance; 1926.103 / 1910.134 supplied-air respiratory protection and Grade D breathing air; 40 CFR 261 (RCRA) characteristic hazardous waste D008 for lead debris",
  name: "Bridge Blast",
  title: simTitle("Bridge Blast"),
  tagline: "Full containment on a highway girder: breathing air proven, negative pressure held, blasted to near-white, and the lead waste labelled and staged before it ever reaches the road",
  accent: BB_ACCENT,
  accentCss: "#d9a441",
  parSeconds: 320,
  footprint: 2.3,
  badge: { id: "containment-held", name: "Containment Held", note: "A lead-paint containment worked start to finish on measured numbers — breathing air, negative pressure, profile and the waste manifest — with no breach" },

  game: system({
    name: "Coatings Authority",
    currency: "MIL",
    ranks: ["Helper", "Blaster", "Competent Person", "Coatings Foreman", "Coatings Authority Certified"],
    badges: [
      { id: "air-proven", name: "Air Proven", note: "Grade D breathing air sited off the certified compressor and proven clean before the hood went on", test: AWARD.stepClean("air-quality") },
      { id: "held-negative", name: "Held Negative", note: "The containment never registered a breach across the whole run", test: AWARD.safe },
      { id: "near-white", name: "Near-White", note: "Held the blast pattern inside the standoff band the whole pass", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-containment", name: "Clean Containment", note: "No corrections from the permit to the manifest", test: AWARD.clean },
      { id: "steady-nozzle", name: "Steady Nozzle", note: "Held the blast pattern the full pass with no dropout", test: AWARD.unbroken },
      { id: "shift-closed", name: "Shift Closed", note: "Containment opened, blasted and closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "shop-air-tap": "You ran the respirator hose off the plant's shop-air compressor instead of the Grade D breathing-air unit beside it. Shop air comes straight off a lubricated compressor with no carbon monoxide monitor and no oil-mist filter on the line — and inside a full-face supplied-air hood that is the only air the blaster has. OSHA 1910.134 requires a certified Grade D source for exactly this reason: a bad batch off that tank is an unconscious blaster inside a sealed containment nobody outside can see into.",
    "loose-hood-seal": "You grabbed the hood with the torn neck seal because it was the closest one on the rack. A supplied-air hood's whole job is holding a positive flow of clean air between the wearer's face and a space full of aerosolized lead paint — a torn seal lets containment air leak straight past the gasket and in around the jaw, and the blower cannot out-pressure a tear it was never built to seal against.",
    "prop-flap": "You propped the containment's entry flap open with a broom handle to cool the suit down. That poly sheeting is the only barrier between a lead-dust atmosphere and the highway underneath it — with the flap open, the negative-air unit is pulling outside air in through the gap instead of holding the whole space under vacuum, and dust that was contained a minute ago is now drifting out over the roadway and whatever runs beneath this bridge.",
    "open-curb-drum": "You left a lead-paint waste drum sitting open at the curb with no lid and no label. The moment that debris left the containment it became RCRA D008 characteristic hazardous waste, and an open, unlabeled drum on a highway shoulder is one gust off a passing truck away from putting the lead dust you spent the shift containing straight back into the air.",
  },

  lateNotes: {
    "blast-nozzle": "Blasting starts after the breathing air is proven and the containment is under negative pressure — the hood is the last thing on, not the first.",
    "vacuum-bagger": "The HEPA pass comes after the flange is blasted and inspected, not while there is still profile to check.",
    "waste-drum-label": "Nothing gets labelled until it has actually left the containment through the airlock.",
  },

  // Interruptions: see shared/game.js. Both are the two ways the air around
  // this containment turns on the person inside it.
  interrupts: [
    {
      id: "manometer-drop",
      kind: "Containment pressure",
      after: "blast", delay: 4, seconds: 13,
      alert: "The manometer on the containment wall has swung to zero — the negative-air unit isn't holding a vacuum any more.",
      cue: "The wall between the dust in here and the road under this bridge just came down.",
      target: "negair-service",
      why: "A clogged HEPA stage stalls a negative-air unit exactly the way a blocked filter stalls anything else: the fan keeps turning but stops moving enough air to hold the containment negative. Once the differential reaches zero the space starts pushing dust out through every seam and door gap instead of pulling clean air in through them, and it does that silently — the fan sounds the same, only the number on the gauge changes.",
      missNote: "Blasting carried on with the containment at atmospheric pressure. Lead dust rode the pressure differential the wrong way, out through the door gap and the poly seams, for as long as the gauge went unread.",
      wrongNote: "Not that. The negative-air unit's filter service panel is where this gets fixed, and it gets fixed now.",
    },
    {
      id: "hose-kink",
      kind: "Breathing air",
      after: "vacuum-bag", delay: 4, seconds: 12,
      alert: "The flow gauge on the SAR regulator has dropped hard — the supply hose has kinked back where it runs behind the girder.",
      cue: "The hood is running on whatever air was already in it.",
      target: "clear-kink",
      why: "A full-face supplied-air hood holds only a few seconds of air once the hose stops delivering it, and a kink can happen anywhere along a run that snakes back through scaffold and ductwork, well out of the blaster's own sightline. The regulator's flow gauge is the only thing that reports it before the hood does — and by the time the hood does, it is the blaster's own breath fogging the lens.",
      missNote: "The kink stayed in the line while the blast pattern carried on. The flow gauge sat low the whole time and nobody looked at it.",
      wrongNote: "That is not the kink. It is back where the hose runs behind the girder, and that is where it gets cleared.",
    },
  ],

  steps: [
    {
      id: "permit", kind: "select", target: "compliance-plan",
      title: "Read the containment class and the lead compliance plan",
      cue: "Check what the coating tested positive for, the containment class it sets, and the surface standard named for the job.",
      why: "The whole shift is sized off two numbers fixed before anyone touches a hose: what the paint tested positive for, and the containment class SSPC-QP 2 assigns to that result. Guess at either one and the respirator, the negative-air rate, and the waste stream downstream of it are all wrong together.",
    },
    {
      id: "baseline", kind: "select", target: "medical-record",
      title: "Confirm the baseline blood-lead draw",
      cue: "Check the medical record for a baseline BLL and a current medical clearance before anyone is exposed.",
      why: "OSHA's lead standard puts a baseline blood-lead level on file before exposure starts, because a rising number only means something measured against a number drawn before the job began. Skip the baseline and the first sign of overexposure is a symptom, not a lab result somebody caught early.",
    },
    {
      id: "air-hose", kind: "drag", target: "air-hose",
      title: "Couple the respirator hose to the Grade D compressor",
      cue: "Carry the supplied-air hose from the reel to the Grade D breathing-air compressor's coupling — not the shop-air tank beside it.",
      why: "Everything downstream of this coupling is the blaster's air for the rest of the shift. Grade D breathing air is compressed, filtered and monitored specifically to be breathed; the shop-air tank standing three feet away is compressed to run tools, and nothing about it announces the difference once a hose is locked onto it.",
      drag: { to: "sar-coupling", radius: 0.45, missNote: "Not seated on the Grade D coupling — a hose that isn't locked onto the certified source could as easily be locked onto the wrong one." },
    },
    {
      id: "air-quality", kind: "gauge", target: "co-monitor",
      title: "Prove the breathing air before the hood goes on",
      cue: "Read the CO monitor on the breathing-air line and commit on what it shows.",
      why: "The monitor is the only thing in this system that can tell a blaster something they cannot smell, taste or feel through a supplied-air hood. It gets read and proven clean before the first hood goes on a face, never glanced at afterward.",
      gauge: {
        label: "CO IN LINE", speed: 0.72, green: [0.0, 0.1],
        readout: (t) => `${Math.round(t * 60)} ppm`,
        missNote: "That is carbon monoxide in a breathing-air line. Nobody goes on air until the compressor is serviced and it reads clean.",
      },
    },
    {
      id: "negair", kind: "turn", target: "negair-fan",
      title: "Start the negative-air unit",
      cue: "Turn the negative-air unit on and let it start drawing the containment down before anyone enters.",
      why: "Negative pressure is what keeps lead dust moving into the unit's own HEPA exhaust instead of out through every seam in the poly. It runs before anyone goes in and it runs the whole time anyone is working — what leaks here isn't vapour that dissipates, it's dust that stays airborne and stays toxic for as long as it's loose.",
      turn: { turns: 0.4, axis: "z", label: "NEGATIVE AIR" },
    },
    {
      id: "manometer", kind: "gauge", target: "manometer",
      title: "Confirm the containment is under negative pressure",
      cue: "Read the manometer on the containment wall and commit inside the band before anyone enters.",
      why: "A differential-pressure gauge is the only proof the containment is doing its job — the poly looks identical whether it's under vacuum or not. SSPC's containment classes are written around a minimum negative pressure for exactly this reason: there is no other way to know from outside.",
      gauge: {
        label: "CONTAINMENT ΔP", speed: 0.68, green: [0.35, 0.62],
        readout: (t) => `-${(t * 0.5).toFixed(2)}" wc`,
        missNote: "Not enough negative pressure to trust. Check the unit and the seams before anyone goes through the airlock.",
      },
    },
    {
      id: "airlock-entry", kind: "sequence",
      targets: ["dirty-stage", "wash-stage", "clean-stage"],
      itemNames: { "dirty-stage": "dirty room", "wash-stage": "wash room", "clean-stage": "clean room" },
      title: "Enter through the three-stage airlock",
      cue: "Through the dirty room, the wash room, then the clean room — in that order, on the way in.",
      why: "The three-stage airlock is what keeps lead dust from riding out of the containment on somebody's boots. Each stage strips off one more layer of it before the next door opens, and taking them out of order defeats the whole reason there are three rooms instead of one.",
      outOfOrderNote: "Dirty, then wash, then clean, in that order. A shortcut through the airlock carries dust as far as the shortcut goes.",
    },
    {
      id: "blast", kind: "track", target: "blast-nozzle", seconds: 7,
      title: "Blast the girder to SSPC-SP 10",
      cue: "Hold the nozzle standoff steady and work the flange to a near-white finish.",
      why: "Near-white is a specified endpoint, not a look — SSPC-SP 10 allows only light staining, no paint and no primer, on ninety-five percent of the surface. Standoff is what puts a profile into the steel at that endpoint instead of just scouring it, and it drifts the moment the hand on the nozzle stops correcting for it.",
      track: {
        start: 0.1, green: [0.36, 0.58], rise: 0.5, fall: 0.45, drift: 0.12, label: "NOZZLE STANDOFF",
        readout: (v) => (v < 0.36 ? "too close, shattering the abrasive" : v > 0.58 ? "too far, pattern gone soft" : "cutting a clean profile"),
      },
      holdBreakNote: "Standoff out of band — the replacement coating keys into this profile, and it's only as even as the nozzle was.",
    },
    {
      id: "profile", kind: "gauge", target: "profile-gauge",
      title: "Measure the anchor profile",
      cue: "Take the profile on the blasted flange and commit against the range the coating's data sheet calls for.",
      why: "The replacement coating grips whatever peaks and valleys the blast left, so the profile is a specified dimension and not a finish. Too shallow and the new system has nothing to key into; too deep on old lead paint and there's more surface area for whatever's left in the pits to hide in what's supposed to be bare steel.",
      gauge: {
        label: "PROFILE", speed: 0.7, green: [0.4, 0.64],
        readout: (t) => `${(t * 6).toFixed(1)} mil`,
        missNote: "Outside the profile the data sheet calls for. Adjust the abrasive or the standoff and re-blast the area rather than coating over it.",
      },
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["primer-remnant", "rust-pit", "moisture-film"],
      itemNames: { "primer-remnant": "primer remnant in a bolt hole", "rust-pit": "rust pit in the flange", "moisture-film": "moisture film under the deck" },
      itemNotes: {
        "primer-remnant": "There is a shadow of the old primer left in a bolt hole. A near-white reading on the open flange means nothing if the abrasive never reached into the recess, and the new system will disbond from that shadow first.",
        "rust-pit": "The flange is pitted where the old paint failed years ago. A pit holds blast grit and moisture the visual standard can't see from the surface, and it's where the replacement coating ends up thinnest.",
        "moisture-film": "There is condensation beaded on the girder where it sits closest to the deck above. Coating over a film of water that formed since the blast traps it under the new system, and it disbonds from underneath on a schedule nobody can predict from up here.",
      },
      title: "Inspect the blasted flange",
      cue: "Walk the flange and click the three things that fail this blast if they're coated over.",
      why: "A near-white flange looks uniform from three feet back and isn't. A shadow of old primer, a pit that never fully cleaned out, and a film of condensation are the three things that turn a passed profile reading into a coating that fails by the first winter.",
    },
    {
      id: "vacuum-bag", kind: "hold", target: "vacuum-bagger", seconds: 5,
      title: "HEPA-vacuum the debris into the drum",
      cue: "Hold the HEPA vacuum wand on the debris pile for the full pass before it's shoveled.",
      why: "A HEPA-filtered vacuum pass ahead of the shovel is what keeps the fine lead-bearing dust — the fraction a shovel throws back into the air rather than picks up — out of the containment's atmosphere on its way into the drum.",
      holdBreakNote: "The pass was cut short. The fines a shovel alone can't lift stayed airborne for the rest of the shift.",
    },
    {
      id: "waste-label", kind: "select", target: "waste-drum-label",
      title: "Label the drum as hazardous waste",
      cue: "Print and attach the D008 hazardous-waste label before the drum leaves the containment.",
      why: "The moment that debris came off the girder it became RCRA D008 characteristic hazardous waste, whatever it's carried in. The label is what tells the next person who touches that drum — the hauler, the transfer station, anybody — what they actually have.",
    },
    {
      id: "waste-drum", kind: "drag", target: "waste-drum",
      title: "Move the sealed drum to the accumulation pad",
      cue: "Carry the sealed, labelled drum to the satellite accumulation area, clear of the roadway.",
      why: "A satellite accumulation area is the only place a hazardous-waste drum is allowed to sit between the containment and the hauler, and it's sited clear of the travel lane for the same reason the curb isn't: nobody wants a lead drum in the path of a bumper.",
      drag: { to: "accumulation-pad", radius: 0.45, missNote: "Not on the pad — a drum staged in the travel lane or against the barrier is a drum a passing vehicle will find." },
    },
    {
      id: "exit-decon", kind: "sequence",
      targets: ["vacuum-suit", "doff-suit", "wash-station"],
      itemNames: { "vacuum-suit": "HEPA-vacuum the suit", "doff-suit": "doff the suit", "wash-station": "wash at the clean-room sink" },
      title: "Decon out through the airlock",
      cue: "HEPA-vacuum the suit, doff it in the dirty room, then wash at the clean-room station — in that order.",
      why: "Decon reverses entry for the same reason entry has three stages: each one strips off what the last one couldn't. Washing first with a dust-laden suit still on doesn't remove the dust, it just moves it onto the wash water and whatever it touches next.",
      outOfOrderNote: "Vacuum the suit, then doff it, then wash. Reaching the sink with the suit still on carries the dust straight past it.",
    },
    {
      id: "walk", kind: "find",
      targets: ["seam-check", "manometer-log", "waste-manifest"],
      itemNames: { "seam-check": "the containment seams", "manometer-log": "the pressure log", "waste-manifest": "the waste manifest" },
      itemNotes: {
        "seam-check": "The seams are taped and intact all the way round. A seam that opened mid-shift is the one place dust could have left that the manometer alone would never show.",
        "manometer-log": "The pressure log has a reading on it for every hour of the shift. It's the only record that the containment was actually held negative, rather than just built that way at the start.",
        "waste-manifest": "The manifest is filled out and ready to travel with the drums. A drum without a manifest is just a barrel nobody downstream can account for.",
      },
      title: "Walk the containment before the crew stands down",
      cue: "Click the three things that decide whether this containment held for the whole shift.",
      why: "The blast pattern is the interesting part and these three are the part that gets skipped: the seams that could have let dust out, the log that's the only proof the vacuum was held, and the manifest that has to travel with the drums or they're just barrels nobody can trace.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, BB_ACCENT);

    // -------------------------------------------------------------- the bridge
    // The underside of a highway deck, hanging over the containment. Purely
    // context — nothing on it is interactive — but it is what makes the tent
    // below read as "under a bridge" rather than "in a tent".
    const deckSpan = group(g, -0.3, 0, -1.35);
    box(deckSpan, 4.4, 0.34, 2.6, 0, 2.85, 0, 0x4a5158, { rough: 0.92, finish: "concrete", tile: [4, 2] });
    for (let i = -1; i <= 1; i++) {
      box(deckSpan, 0.1, 0.34, 2.6, i * 1.4, 2.85, 0, 0x3d434a, { rough: 0.9, cast: false });
    }
    holoTag(deckSpan, "Bridge deck, underside", 0, 3.15, 0.2, { css: "#8fa9c4", w: 0.62 });

    // ------------------------------------------------------------- containment
    const tent = group(g, -0.3, 0, -1.35);
    const TW = 2.2, TD = 1.7, TH = 2.55;
    // Scaffold frame: verticals at the corners and mid-spans, ledgers between.
    const legX = [-TW / 2, 0, TW / 2];
    for (const lx of legX) for (const lz of [-TD / 2, TD / 2]) {
      cyl(tent, 0.022, 0.022, TH, lx, TH / 2, lz, CITY.steel, { rough: 0.45, metal: 0.65, seg: 8 });
    }
    for (const ly of [0.85, 1.7, TH - 0.05]) {
      box(tent, TW, 0.02, 0.02, 0, ly, -TD / 2, CITY.steel, { rough: 0.5, metal: 0.6 });
      box(tent, TW, 0.02, 0.02, 0, ly, TD / 2, CITY.steel, { rough: 0.5, metal: 0.6 });
      box(tent, 0.02, 0.02, TD, -TW / 2, ly, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
      box(tent, 0.02, 0.02, TD, TW / 2, ly, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
    }
    // Poly sheeting: back and both sides, front left fully open so the
    // learner can see the whole working platform from the spawn point.
    const polyMat = { rough: 0.5, opacity: 0.32, transparent: true, cast: false, side: 2 };
    box(tent, TW, TH, 0.02, 0, TH / 2, -TD / 2, 0xe8eef2, polyMat);
    box(tent, 0.02, TH, TD, -TW / 2, TH / 2, 0, 0xe8eef2, polyMat);
    box(tent, 0.02, TH, TD * 0.55, TW / 2, TH / 2, TD * 0.22, 0xe8eef2, polyMat); // right wall, leaves a door gap
    box(tent, TW, 0.02, TD, 0, TH - 0.02, 0, 0xe8eef2, { ...polyMat, opacity: 0.24 }); // roof tarp
    // The entry flap, on the right wall's near edge — where the interrupt
    // and the "prop it open" hazard both live.
    const flap = group(tent, TW / 2 - 0.02, TH * 0.4, -TD * 0.15, 0.15);
    box(flap, 0.02, TH * 0.72, 0.7, 0, 0, 0, 0xd8dfe6, { ...polyMat, opacity: 0.4 });
    const broom = group(tent, TW / 2 + 0.12, 0, -TD * 0.05, 0.4);
    cyl(broom, 0.012, 0.012, 0.95, 0, 0.48, 0, 0xb8935a, { rough: 0.8, seg: 8 });
    box(broom, 0.16, 0.05, 0.03, 0, 0.94, 0, 0x8a6a3a, { rough: 0.85 });
    holoTag(broom, "prop the flap for airflow?", 0, 1.15, 0, { css: "#d2312b", w: 0.62 });
    reg(hits, broom, "prop-flap");

    // Working platform inside the containment, elevated so the blaster
    // stands close to the girder they're working overhead.
    const deck = box(tent, TW - 0.2, 0.08, TD - 0.2, 0, 0.85, 0, 0x5a636b, { rough: 0.75, metal: 0.3, finish: "grating", tile: [3, 2] });
    void deck;
    for (const lx of legX) for (const lz of [-TD / 2 + 0.1, TD / 2 - 0.1]) {
      cyl(tent, 0.03, 0.03, 0.81, lx, 0.4, lz, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    box(tent, TW - 0.2, 0.1, 0.05, 0, 0.94, -(TD - 0.2) / 2, CITY.hiVis, { rough: 0.6 }); // toe board
    box(tent, TW - 0.2, 0.1, 0.05, 0, 0.94, (TD - 0.2) / 2, CITY.hiVis, { rough: 0.6 });

    // The girder, running the width of the tent just under the bridge deck.
    const girder = group(tent, 0, 2.05, 0);
    box(girder, TW - 0.3, 0.05, 0.42, 0, 0.19, 0, 0x8a6a3a, { rough: 0.85 }); // top flange, aged lead paint
    box(girder, TW - 0.3, 0.36, 0.05, 0, 0, 0, 0x8a6a3a, { rough: 0.85 });    // web
    box(girder, TW - 0.3, 0.05, 0.42, 0, -0.19, 0, 0x8a6a3a, { rough: 0.85 }); // bottom flange
    for (let i = -2; i <= 2; i++) {
      box(girder, 0.03, 0.34, 0.4, i * (TW - 0.3) / 5, 0, 0, 0x7a5c30, { rough: 0.85 }); // stiffener plates
    }
    // The blasted patch: near-white steel over about a third of the flange.
    box(girder, 0.7, 0.06, 0.44, 0.5, 0.2, 0, 0xd7d2c6, { rough: 0.55, metal: 0.15 });
    box(girder, 0.7, 0.37, 0.06, 0.5, 0, 0, 0xd7d2c6, { rough: 0.55, metal: 0.15 });
    holoTag(girder, "Girder — bearing area, this span", 0, 0.55, 0.24, { css: "#d9a441", w: 0.62 });

    const primer = box(girder, 0.05, 0.05, 0.05, 0.35, 0.06, 0.22, 0x6a5230, { rough: 0.85 });
    holoTag(girder, "bolt hole", 0.35, 0.32, 0.22, { css: "#8fa9c4", w: 0.2 });
    reg(hits, primer, "primer-remnant");
    const pits = group(girder, 0.75, 0.2, 0.18);
    for (let i = 0; i < 4; i++) {
      cyl(pits, 0.02 + (i % 2) * 0.008, 0.018, 0.01, -0.1 + i * 0.07, 0, 0, 0x3d444b, { rough: 1.0, seg: 8 });
    }
    holoTag(girder, "flange", 0.75, 0.46, 0.18, { css: "#8fa9c4", w: 0.2 });
    reg(hits, pits, "rust-pit");
    const moisture = slab(girder, 0.28, 0.006, 0.16, -0.55, 0.223, 0, 0xbfe6f5, { radius: 0.01, rough: 0.15, opacity: 0.55, transparent: true, cast: false });
    holoTag(girder, "under the deck", -0.55, 0.42, 0, { css: "#8fa9c4", w: 0.3 });
    reg(hits, moisture, "moisture-film");

    // Blast pot, hose and nozzle, worked from the platform up at the girder.
    const pot = group(tent, -0.75, 0.85, 0.5, -0.4);
    cyl(pot, 0.2, 0.24, 0.7, 0, 0.35, 0, 0xd8b23a, { rough: 0.6, metal: 0.35 });
    cyl(pot, 0.12, 0.2, 0.2, 0, 0.78, 0, 0xd8b23a, { rough: 0.6, metal: 0.35, seg: 14 });
    holoTag(pot, "Blast pot", 0, 1.0, 0, { css: "#f2c14b", w: 0.26 });
    const nozzle = group(tent, -0.15, 1.7, 0.3, -1.2);
    cyl(nozzle, 0.03, 0.045, 0.3, 0, 0, 0, 0x4a5560, { rough: 0.5, metal: 0.5, seg: 12 }).rotation.x = -Math.PI / 2.3;
    holoTag(nozzle, "Blast nozzle", 0, 0.22, 0, { css: "#f2c14b", w: 0.26 });
    reg(hits, nozzle, "blast-nozzle");
    const grit = particles(tent, 22, 0xcfd3d8, { size: 0.028, life: 0.5, additive: false, opacity: 0.45 });
    grit.position.set(-0.1, 1.9, 0.15);
    grit.visible = false;

    // Manometer on the containment's front-left post — the only proof this
    // tent is actually under vacuum.
    const manoPost = group(tent, -TW / 2 + 0.05, 0, TD / 2 - 0.1, 0.3);
    const mano = instrument(manoPost, 0, 1.35, 0.02, { idle: "-- \" wc", color: 0x2b3138, w: 0.16, d: 0.14 });
    holoTag(manoPost, "Manometer", 0, 1.56, 0.02, { css: "#d9a441", w: 0.32 });
    reg(hits, mano, "manometer");

    // ----------------------------------------------------- airlock vestibule
    // A three-stage chamber attached to the tent's open corner: dirty, wash,
    // clean, in a row, each one its own small room the learner walks through.
    const lock = group(g, 1.45, 0, -0.65, -0.3);
    const stageNames = [["dirty-stage", "Dirty room", 0xb8402f], ["wash-stage", "Wash room", 0xf2c14b], ["clean-stage", "Clean room", 0x59c97b]];
    const stageChambers = [];
    stageNames.forEach(([id, label, col], i) => {
      const cx = i * 0.75;
      const chamber = group(lock, cx, 0, 0);
      box(chamber, 0.02, 2.2, 1.0, -0.35, 1.1, 0, 0xe8eef2, { rough: 0.5, opacity: 0.38, transparent: true, cast: false });
      box(chamber, 0.02, 2.2, 1.0, 0.35, 1.1, 0, 0xe8eef2, { rough: 0.5, opacity: 0.38, transparent: true, cast: false });
      box(chamber, 0.7, 2.2, 0.02, 0, 1.1, -0.5, 0xe8eef2, { rough: 0.5, opacity: 0.3, transparent: true, cast: false });
      const doorFlap = box(chamber, 0.65, 2.1, 0.02, 0, 1.05, 0.49, col, { rough: 0.5, opacity: 0.42, transparent: true, cast: false });
      holoTag(chamber, label, 0, 2.3, 0.4, { css: `#${col.toString(16).padStart(6, "0")}`, w: 0.42 });
      reg(hits, doorFlap, id);
      stageChambers.push(chamber);
    });
    // Exit-decon fixtures sit inside the same three chambers: the vacuum
    // wand in the dirty room, the suit hook between dirty and wash, the sink
    // in the clean room — the same physical walk, run in reverse.
    const vacWand = group(stageChambers[0], -0.12, 0.5, -0.2, 0.6);
    cyl(vacWand, 0.02, 0.025, 0.6, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 10 });
    holoTag(vacWand, "HEPA wand", 0, 0.42, 0, { css: "#8fa9c4", w: 0.28 });
    reg(hits, vacWand, "vacuum-suit");
    const suitHook = group(stageChambers[0], 0.14, 1.5, -0.2);
    box(suitHook, 0.05, 0.05, 0.05, 0, 0, 0, CITY.steel, { rough: 0.4, metal: 0.7 });
    box(suitHook, 0.32, 0.5, 0.03, 0, -0.32, 0, 0xd8dfe6, { rough: 0.55, opacity: 0.7, transparent: true });
    holoTag(suitHook, "Suit hook", 0, 0.2, 0, { css: "#8fa9c4", w: 0.26 });
    reg(hits, suitHook, "doff-suit");
    const sink = group(stageChambers[2], 0.1, 0, -0.2);
    box(sink, 0.32, 0.28, 0.24, 0, 0.42, 0, 0xd7dce1, { rough: 0.35, metal: 0.3 });
    cyl(sink, 0.012, 0.014, 0.2, 0, 0.62, -0.08, 0x8d9aa4, { rough: 0.4, metal: 0.8, seg: 8 });
    holoTag(sink, "Clean-room sink", 0, 0.82, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, sink, "wash-station");

    // ---------------------------------------------------- breathing-air rig
    const compressor = group(g, 1.75, 0, 1.2, 0.5);
    box(compressor, 0.86, 0.6, 0.54, 0, 0.42, 0, 0x2f6f8f, { rough: 0.6, metal: 0.4 });
    decal(compressor, 0.5, 0.12, 0, 0.6, 0.271, signFace("BREATHING AIR — GRADE D", { bg: "#0b2430", accent: "#d9a441", scale: 0.4 }));
    const coMon = instrument(compressor, -0.24, 0.78, 0.08, { idle: "-- ppm", color: 0x2b3138, w: 0.17, d: 0.14 });
    holoTag(compressor, "CO monitor on the line", -0.24, 0.98, 0.08, { css: "#d9a441", w: 0.5 });
    reg(hits, coMon, "co-monitor");
    const sarSocket = group(compressor, 0.3, 0.62, 0.28);
    cyl(sarSocket, 0.035, 0.035, 0.08, 0, 0, 0, 0x8d9aa4, { rough: 0.4, metal: 0.7, seg: 12 });
    holoTag(sarSocket, "Grade D coupling", 0, 0.14, 0, { css: "#d9a441", w: 0.36 });
    hits["sar-coupling"] = sarSocket;

    const shopAir = group(g, 2.35, 0, 1.0, 0.5);
    cyl(shopAir, 0.2, 0.22, 0.66, 0, 0.34, 0, 0x8a939b, { rough: 0.5, metal: 0.55, seg: 16 });
    decal(shopAir, 0.3, 0.09, 0, 0.5, 0.221, signFace("SHOP AIR", { bg: "#2a1a0d", accent: "#f0645b", scale: 0.5 }));
    holoTag(shopAir, "handy, right next door?", 0, 0.78, 0, { css: "#d2312b", w: 0.54 });
    reg(hits, shopAir, "shop-air-tap");

    const hoseReel = group(g, 1.9, 0, 1.75, -0.5);
    cyl(hoseReel, 0.26, 0.26, 0.12, 0, 0.5, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 16 });
    cyl(hoseReel, 0.28, 0.28, 0.05, 0, 0.62, 0, 0xd9a441, { rough: 0.5, seg: 16 });
    holoTag(hoseReel, "Respirator hose", 0, 0.8, 0, { css: "#d9a441", w: 0.34 });
    reg(hits, hoseReel, "air-hose");
    // A visible kink point along the hose run, behind the girder, where the
    // interruption really happens.
    const kink = group(tent, 0.55, 1.15, -TD / 2 + 0.15, 0.4);
    cyl(kink, 0.025, 0.025, 0.3, 0, 0, 0, 0x2b2f34, { rough: 0.7, seg: 10 });
    holoTag(kink, "hose, behind the girder", 0, 0.2, 0, { css: "#8fa9c4", w: 0.4 });
    reg(hits, kink, "clear-kink");

    // Negative-air unit, ducted into the tent's back wall.
    const negair = group(g, 1.55, 0, -2.15, 0.3);
    box(negair, 0.6, 0.66, 0.5, 0, 0.4, 0, 0x4a5560, { rough: 0.6, metal: 0.45 });
    const fanBlades = group(negair, 0, 0.4, 0.27);
    for (let b = 0; b < 4; b++) box(fanBlades, 0.4, 0.08, 0.015, 0, 0, 0, 0x9aa4ad, { rough: 0.6 }).rotation.z = (b * Math.PI) / 4;
    const fanSwitch = group(negair, 0.24, 0.66, 0.1);
    box(fanSwitch, 0.05, 0.16, 0.05, 0, 0, 0, CITY.hiVis, { rough: 0.5 });
    holoTag(negair, "Negative-air unit", 0, 0.9, 0, { css: "#d9a441", w: 0.4 });
    reg(hits, fanSwitch, "negair-fan");
    const filterPanel = box(negair, 0.5, 0.2, 0.03, 0, 0.62, -0.26, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(negair, "Filter service panel", 0, 0.78, -0.26, { css: "#d9a441", w: 0.42 });
    reg(hits, filterPanel, "negair-service");
    cyl(g, 0.14, 0.14, 1.2, 1.55, 0.5, -1.6, 0x9aa4ad, { rough: 0.8, seg: 14 }).rotation.z = Math.PI / 2 - 0.4; // duct into tent

    // -------------------------------------------------------------- waste bay
    const debris = group(tent, 0.1, 0.85, 0.45, -0.5);
    for (let i = 0; i < 8; i++) ball(debris, 0.02 + (i % 3) * 0.006, (i % 4) * 0.05 - 0.075, 0.01, Math.floor(i / 4) * 0.06, 0x6a5230, { rough: 0.9, seg: 8 });
    holoTag(debris, "Blast debris", 0, 0.16, 0, { css: "#8fa9c4", w: 0.32 });
    const vacHead = group(tent, 0.1, 0.9, 0.6, -0.3);
    box(vacHead, 0.12, 0.04, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(vacHead, "HEPA vacuum", 0, 0.14, 0, { css: "#8fa9c4", w: 0.32 });
    reg(hits, vacHead, "vacuum-bagger");

    const drumBay = group(g, 2.1, 0, -0.1, -0.2);
    const drumA = cyl(drumBay, 0.22, 0.22, 0.6, 0, 0.3, 0, 0x2f6f4a, { rough: 0.6, metal: 0.35, seg: 18 });
    cyl(drumBay, 0.19, 0.19, 0.05, 0, 0.61, 0, 0x2b3138, { rough: 0.55, metal: 0.4, seg: 18 });
    const drumLabel = decal(drumBay, 0.2, 0.09, 0.23, 0.35, 0, signFace("D008?", { bg: "#241a08", accent: "#d9a441", scale: 0.55 }));
    holoTag(drumBay, "Waste drum, sealed", 0, 0.68, 0, { css: "#d9a441", w: 0.42 });
    reg(hits, drumA, "waste-drum");
    reg(hits, drumLabel, "waste-drum-label");

    const drumOpen = group(g, 2.35, 0, 0.5, 0.2);
    cyl(drumOpen, 0.22, 0.22, 0.55, 0, 0.28, 0, 0xb8402f, { rough: 0.65, metal: 0.3, seg: 18 });
    holoTag(drumOpen, "no lid, at the curb?", 0, 0.62, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, drumOpen, "open-curb-drum");

    const pad = group(g, -2.3, 0, 1.5);
    for (let i = -2; i <= 2; i++) box(pad, 0.22, 0.01, 0.05, i * 0.34, 0.008, 0, 0xd9a441, { emissive: 0xd9a441, ei: 0.5, cast: false });
    holoTag(pad, "Accumulation pad, clear of the road", 0, 0.5, 0, { css: "#d9a441", w: 0.72 });
    hits["accumulation-pad"] = pad;

    // ------------------------------------------------------------ hood rack
    const rack = group(g, -1.9, 0, 0.3, 0.4);
    box(rack, 0.5, 0.9, 0.25, 0, 0.45, 0, 0x3c444c, { rough: 0.6, metal: 0.4 });
    const hoodGood = group(rack, -0.1, 0.75, 0.16);
    ball(hoodGood, 0.14, 0, 0, 0, 0xe8eef2, { rough: 0.4, opacity: 0.85, transparent: true });
    holoTag(hoodGood, "SAR hood", 0, 0.2, 0, { css: "#59c97b", w: 0.26 });
    const hoodBad = group(rack, 0.15, 0.75, 0.16);
    ball(hoodBad, 0.14, 0, 0, 0, 0xe8eef2, { rough: 0.4, opacity: 0.85, transparent: true });
    torus(hoodBad, 0.08, 0.01, 0, -0.06, 0.1, 0x2b2f34, { rough: 0.8, seg: 6, seg2: 14 });
    holoTag(hoodBad, "torn seal, closest one?", 0, 0.22, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, hoodBad, "loose-hood-seal");

    // ---------------------------------------------------------- instruments
    const bench = group(g, -1.55, 0, -0.6, 0.5);
    box(bench, 0.9, 0.06, 0.44, 0, 0.88, 0, 0x6a737c, { rough: 0.7, metal: 0.3 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(bench, 0.02, 0.02, 0.88, sx * 0.4, 0.44, sz * 0.17, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    const profileGauge = instrument(bench, 0, 0.94, 0, { idle: "-- mil", color: 0xf2c14b, w: 0.15, d: 0.13 });
    holoTag(bench, "Profile gauge", 0, 1.1, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, profileGauge, "profile-gauge");

    // -------------------------------------------------------- paperwork
    const board = group(g, -2.35, 0, -1.5, 0.85);
    const planPanel = holoPanel(board, 0.76, 0.54, 0, 1.42, 0, (cx, w, h) => {
      cx.fillStyle = "#241a08"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d9a441"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#f6e6c2";
      cx.fillText("LEAD COMPLIANCE PLAN — SPAN 4B", w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = "#f3e6d0";
      ["COATING: POSITIVE FOR LEAD", "CONTAINMENT: SSPC-QP 2, CLASS 1C", "SURFACE STANDARD: SSPC-SP 10",
        "RESPIRATOR: SUPPLIED AIR, GRADE D", "WASTE: RCRA D008 ON REMOVAL", "OSHA 1926.62 SURVEILLANCE CURRENT"]
        .forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.31 + i * 0.115)));
    }, { accent: BB_ACCENT });
    cyl(board, 0.03, 0.035, 1.15, 0, 0.57, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    reg(hits, planPanel, "compliance-plan");

    const medBoard = group(g, -2.55, 0, -0.5, 0.6);
    const medPanel = decal(medBoard, 0.42, 0.56, 0, 1.05, 0,
      paperFace("MEDICAL RECORD", ["Baseline BLL: on file", "Clearance: current", "Next draw: per schedule"], { worn: true }), { px: 256 });
    cyl(medBoard, 0.025, 0.03, 1.0, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    holoTag(medBoard, "Medical record", 0, 1.4, 0, { css: "#8fa9c4", w: 0.38 });
    reg(hits, medPanel, "medical-record");

    const seam = box(tent, 0.5, 0.02, 0.02, 0, 1.4, -TD / 2 + 0.01, 0x8fa9c4, { rough: 0.5, opacity: 0.001, transparent: true, cast: false });
    holoTag(tent, "containment seam", 0, 1.6, -TD / 2 + 0.01, { css: "#8fa9c4", w: 0.4 });
    reg(hits, seam, "seam-check");
    const logBook = slab(g, 0.2, 0.03, 0.26, -0.4, 0.93, 1.85, 0xe8e2d4, { radius: 0.008, rough: 0.85 });
    holoTag(g, "Pressure log", -0.4, 1.12, 1.85, { css: "#8fa9c4", w: 0.36 });
    reg(hits, logBook, "manometer-log");
    const manifest = slab(g, 0.2, 0.03, 0.26, 2.1, 0.63, -0.4, 0xe8e2d4, { radius: 0.008, rough: 0.85 });
    holoTag(g, "Waste manifest", 2.1, 0.82, -0.4, { css: "#8fa9c4", w: 0.4 });
    reg(hits, manifest, "waste-manifest");

    barrierPanel(g, -1.5, 2.15, { color: 0xd9a441 });
    cone(g, 0.6, 2.35, { color: 0xd9a441 });
    cone(g, 2.0, 1.9, { color: 0xd9a441 });
    toolChest(g, -2.5, 1.15);
    // The competent person, standing clear of the tent and every control,
    // where the site's own compliance plan says they belong.
    const watch = standingFigure(g, -2.55, 0.15, { ry: 2.0, cloth: 0x2f6f8f, helmet: 0xf2c14b, vest: 0xe4dc3a });
    holoTag(g, "Competent person", -2.55, 2.0, 0.15, { css: "#59c97b", w: 0.4 });

    // -------------------------------------------------------------- live state
    let venting = false, blasting = false, negOk = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.1, 1.2, -0.3),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "air-hose") { hoseReel.position.set(1.75, 0, 1.2); hoseReel.rotation.y = 0.5; }
        if (step.id === "negair") venting = true;
        if (step.id === "manometer") negOk = true;
        if (step.id === "blast") blasting = false;
        if (step.id === "waste-drum") { drumA.position.set(-2.3, 0, 1.5); }
      },

      onInterrupt(it) {
        if (it.id === "manometer-drop") {
          negOk = false;
          repaint(mano.userData.screen, signFace("0.00", { bg: "#2a1010", accent: "#f0645b", fg: "#ffd2ce", scale: 0.55 }));
          fanBlades.scale.setScalar(0.9);
        }
        if (it.id === "hose-kink") {
          kink.scale.set(1, 0.55, 1.4);
          kink.children[0].material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8, rough: 0.4 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "manometer-drop") { negOk = true; fanBlades.scale.setScalar(1); }
        if (it.id === "hose-kink") {
          kink.scale.set(1, 1, 1);
          kink.children[0].material = mat(0x2b2f34, { rough: 0.7 });
        }
      },

      onHazard(hitId) {
        if (hitId === "prop-flap") { flap.rotation.y = 1.1; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        if (venting) fanBlades.rotation.z += dt * 8;

        blasting = step?.id === "blast";
        grit.visible = blasting;
        if (blasting) grit.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.05, 0.35, 0.15);

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "air-quality") {
            repaint(coMon.userData.screen, signFace(`${Math.round(gg.t * 60)}`, {
              bg: "#0b2430", accent: gg.t < 0.12 ? "#59c97b" : "#f0645b", fg: "#f6e6c2", scale: 0.55,
            }));
          }
          if (step?.id === "manometer" && negOk !== false) {
            repaint(mano.userData.screen, signFace(`-${(gg.t * 0.5).toFixed(2)}`, {
              bg: "#0d1c24", accent: gg.t > 0.32 && gg.t < 0.65 ? "#59c97b" : "#f0645b", fg: "#f6e6c2", scale: 0.5,
            }));
          }
          if (step?.id === "profile") {
            repaint(profileGauge.userData.screen, signFace(`${(gg.t * 6).toFixed(1)}`, {
              bg: "#1c1408", accent: gg.t > 0.36 && gg.t < 0.68 ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.55,
            }));
          }
        }
      },
    };
  },
};
