import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, paperFace, particles, hose, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, valveWheel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pilot Transfer VR — Maritime & Ports, station sixty-seven.
// Rigging a pilot ladder and taking a pilot at sea, from the ship's side.
// Every other maritime station in this catalogue is a job done on something
// that is tied up or sitting still. This one is a person climbing the side of
// a moving ship out of a small boat, in the dark of the ship's lee, and the
// thing that kills pilots doing it is almost never the sea — it is the
// rigging. A step that has been repaired with a shackle, a side rope with a
// knot in it, a ladder made fast to a handrail because the strong point was
// awkward: those are faults somebody made on deck, in the dry, with time.
//
// So the procedure is a rigging procedure with a manoeuvre wrapped round it.
// The arrangement is a drawing that has been approved and a ladder that has
// been certified and inspected, not a judgement made at the rail. The officer
// in attendance stands there with the bridge on the radio and the ladder in
// sight for the whole of it. And the lifebuoy with its light, the heaving line
// and the lifejacket are at the point of transfer before the ladder goes over
// the side, because the moment they are needed is the moment nobody can be
// spared to go and find them.

const PLT_ACCENT = 0xffd166;

export const SIM_PILOT_TRANSFER = {
  id: "pilot-transfer",
  index: "67",
  domain: "Maritime",
  trade: "Deck officer / able seafarer — pilot transfer party",
  category: "Maritime & Ports",
  weather: "wind",
  certification: "IOMM&P — International Organization of Masters, Mates & Pilots; ILA / IBU where the boat's crew are covered; SOLAS Chapter V regulation 23 (pilot transfer arrangements); IMO Assembly Resolution A.1045(27) as amended, pilot transfer arrangements; ISO 799 pilot ladders and the manufacturer's certificate; the flag State's requirements and the ship's own SMS procedure for pilot transfer under the ISM Code",
  name: "Pilot Transfer",
  title: simTitle("Pilot Transfer"),
  tagline: "Rigging a pilot ladder at sea: certificate and inspection before it goes over the side, the arrangement to the approved drawing, lifebuoy and light and heaving line at the point of transfer first, combination secured to itself, officer in attendance with the bridge, and the ship's lee held",
  accent: PLT_ACCENT,
  accentCss: "#ffd166",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "ladder-fit-to-climb", name: "Fit To Climb", note: "A pilot ladder rigged to the drawing on a certified ladder, attended from the moment it went over the side" },

  game: system({
    name: "Deck Department",
    currency: "FATHOM",
    ranks: ["Ordinary Seafarer", "Able Seafarer", "Third Officer", "Chief Officer", "Deck Department Certified"],
    badges: [
      { id: "condemned-it", name: "Condemned It", note: "Found every fault in the ladder before it went over the side", test: AWARD.stepClean("inspect") },
      { id: "never-unattended", name: "Never Unattended", note: "The ladder was never over the side without somebody on it", test: AWARD.safe },
      { id: "to-the-request", name: "To The Request", note: "Ladder height and ship's speed both inside what the pilot asked for", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-transfer", name: "Clean Transfer", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "report-held", name: "Report Held", note: "Held the transmit key through the whole report to the bridge", test: AWARD.unbroken },
      { id: "boat-away", name: "Boat Away", note: "Pilot on the bridge inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "rail-secured": "You took the ladder's securing round the bulwark rail. A handrail, a stanchion and a rail cap are there to stop a person going over the side, not to carry one hanging off the shell plating — they are welded for the load of a hand, not the load of a ladder with a pilot on it. The ladder is secured to a strong point provided for it in the approved arrangement, and to nothing else.",
    "retrieval-foul": "You bent the retrieval line on low, at the bottom of the ladder, and led it aft. A retrieval line is only rigged when the pilot asks for one, it is made fast at or above the last spreader step, and it is led forward so it stays clear of the pilot and of the boat coming alongside. Bent on low and led aft, it is a line the boat runs over and a line that pulls the ladder out from under the person on it.",
    "unattended-ladder": "You left the point of transfer with the ladder over the side. The pilot does not arrive at an unattended ladder: the officer in attendance is there so that somebody with a means of communication to the bridge sees the transfer happen, sees it go wrong, and can stop the ship. A ladder nobody is watching is a ladder nobody can raise the alarm from.",
    "discharge-running": "You called the boat alongside with a ship's side discharge running over the transfer position. The transfer happens where the shell plating is clear of discharges — anything overboard there lands on the ladder, on the pilot and in the boat, and it makes the steps and the side ropes something a wet glove cannot hold.",
  },

  lateNotes: {
    "ladder-veer": "The ladder goes over the side after the point of transfer is manned and the buoy, the light and the heaving line are already there.",
    "manrope-fwd": "Man-ropes go down after the ladder is at the height asked for, and only because the pilot asked for them.",
  },

  steps: [
    {
      id: "request", kind: "select", target: "transfer-request",
      title: "Take the pilot's boarding request",
      cue: "Which side, what height, what course and speed, man-ropes or no man-ropes.",
      why: "The pilot states how they want to board and the ship either provides it or says it cannot. Everything after this — the side the lee is made on, how far the ladder is veered, whether man-ropes go over at all — is answering that request rather than guessing at it.",
    },
    {
      id: "certificate", kind: "select", target: "ladder-cert",
      title: "Check the ladder's certificate and its inspection record",
      cue: "The manufacturer's certificate for this ladder, and the date it was last inspected and by whom.",
      why: "A pilot ladder is certified equipment with a record behind it, not a length of rope and some steps. The certificate says it was built to the standard; the inspection record says somebody has looked at it since. A ladder with neither is a ladder nobody can vouch for, and it does not go over the side.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["split-step", "knotted-siderope", "shackle-join"],
      itemNames: {
        "split-step": "the split step",
        "knotted-siderope": "the knot in the side rope",
        "shackle-join": "the shackled joint",
      },
      itemNotes: {
        "split-step": "The fourth step in is split along the grain and the end of it moves under a thumb. A step that flexes is a step that turns under a boot with the ship rolling.",
        "knotted-siderope": "There is a knot worked into one side rope. Side ropes run continuous: a knot is a repair, it is a hard point the hands and feet catch on, and it is a place the rope has already been cut.",
        "shackle-join": "Somebody has joined a length in with a shackle. Shackles, knots and splices are not how a pilot ladder is made up — the pin is the one part of it that can work loose without anybody seeing.",
      },
      title: "Lay the ladder out on deck and go over it",
      cue: "Walk the whole length of it — steps and side ropes both — and click every fault you find.",
      why: "This is where pilots are saved, on a dry deck with the ladder flat and the light on it. Every one of these faults is invisible once the ladder is over the side and hanging against the plating, and every one of them has put somebody in the water. Anything found here condemns this ladder: it is not repaired at the rail.",
    },
    {
      id: "rig", kind: "sequence",
      targets: ["spare-ladder", "strong-point", "handhold-stanchions", "bulwark-ladder"],
      itemNames: {
        "spare-ladder": "the certified spare ladder",
        "strong-point": "the deck strong point",
        "handhold-stanchions": "the two handhold stanchions",
        "bulwark-ladder": "the bulwark ladder at the gateway",
      },
      title: "Make up the certified ladder at the point of access",
      cue: "Certified spare up on deck, secured to the strong point, then the handhold stanchions and the bulwark ladder at the gateway.",
      why: "The arrangement is a drawing that has been approved for this ship, and the drawing says where the ladder is secured and how a person gets from the top of it onto the deck. Securing first, because a ladder that is made fast cannot be dropped while the access is being made up; handholds and the bulwark ladder next, because the top of the ladder is where a climb ends and where a tired pilot lets go.",
    },
    {
      id: "buoy", kind: "drag", target: "lifebuoy",
      title: "Lifebuoy and self-igniting light to the point of transfer",
      cue: "Carry it to the bracket at the gateway, light attached, before anything goes over the side.",
      why: "A lifebuoy with a self-igniting light is what marks the spot in the dark when somebody goes in, and the spot moves the instant the ship goes past it. Carried there beforehand it is a throw away; fetched afterwards it is a run down the deck and back while the person in the water is already astern.",
      drag: { to: "buoy-bracket", radius: 0.55, missNote: "Not in the bracket at the point of transfer. A lifebuoy stowed somewhere else on deck is a lifebuoy for somewhere else." },
    },
    {
      id: "heaving", kind: "drag", target: "heaving-line",
      title: "Heaving line and lifejacket to hand at the point",
      cue: "Take them to the gateway and leave them where a hand can reach them without turning round.",
      why: "The heaving line is how the pilot's bag comes up and how a line gets to the boat or to somebody in the water; the lifejacket is for whoever has to go over or into the boat. Both belong at the point of transfer with the buoy, for the same reason the buoy does: there is no time later, and nobody to spare.",
      drag: { to: "transfer-point", radius: 0.55, missNote: "Still stowed. At the point of transfer means at the point of transfer, not in the locker twenty metres aft." },
    },
    {
      id: "officer", kind: "select", target: "attending-officer",
      title: "Post the responsible officer at the point of transfer",
      cue: "An officer at the gateway, with a means of communication to the bridge, in direct sight of the ladder.",
      why: "The pilot does not arrive at an unattended ladder. The officer in attendance is the one person who can see the ladder, the boat and the pilot at once and can reach the bridge in a second — so they are posted before the ladder goes over and they stay there until the pilot is on deck and the boat is away.",
    },
    {
      id: "discharge", kind: "turn", target: "discharge-valve",
      title: "Shut the ship's side discharge over the transfer position",
      cue: "Wheel it shut, and tell the bridge the line is closed for the transfer.",
      why: "The transfer position is chosen where the shell plating is clear of discharges, and where a discharge is unavoidably above it the valve is shut for the transfer. Anything running down the plating lands on the steps, on the side ropes and on the pilot, and it takes the grip out of both gloves at once.",
      turn: { turns: 1.5, axis: "z", label: "OVERBOARD" },
    },
    {
      id: "combination", kind: "sequence",
      targets: ["accom-ladder", "ladder-overlap", "combination-lashing"],
      itemNames: {
        "accom-ladder": "the accommodation ladder, leading aft",
        "ladder-overlap": "the pilot ladder alongside the bottom platform",
        "combination-lashing": "the two ladders secured to each other",
      },
      title: "Rig the combination arrangement",
      cue: "Accommodation ladder down and leading aft, pilot ladder rigged alongside its bottom platform and extending above it, then the two secured together.",
      why: "The freeboard here is more than a pilot climbs on a ladder alone, so the arrangement is a combination: the accommodation ladder does most of the height and the pilot ladder does the part nearest the water. It leads aft so the pilot steps off the boat and walks with the ship rather than into it, and the two ladders are secured to each other because a pilot ladder swinging free of a platform is a gap that opens and closes with the roll, at the exact moment somebody is stepping across it. A trapdoor arrangement is a different drawing again, with its own rules for the opening and the ladder through it.",
    },
    {
      id: "veer", kind: "track", target: "ladder-veer", seconds: 6,
      title: "Veer the ladder to the height the pilot asked for",
      cue: "Pay it out steadily and hold it at the height on the boarding request while it is made fast.",
      why: "How far the ladder is veered is the pilot's call, because the pilot is the one judging it against the boat's deck and the sea running. Too high and the step off the boat is a jump; too low and the boat rides the bottom of the ladder up and crushes it against the plating. Steadily, because a ladder dropped in a run snatches its own securing.",
      track: { label: "HEIGHT", green: [0.34, 0.54], rise: 0.5, fall: 0.42, drift: 0.13, readout: (v) => `${(v * 7).toFixed(1)} m above the water` },
    },
    {
      id: "manropes", kind: "sequence", anyOrder: true,
      targets: ["manrope-fwd", "manrope-aft"],
      itemNames: { "manrope-fwd": "forward man-rope", "manrope-aft": "after man-rope" },
      title: "Rig the man-ropes the pilot asked for",
      cue: "Both of them, secured on deck and led down beside the ladder within reach of a hand on either side.",
      why: "Man-ropes are rigged when the pilot asks for them and not otherwise, because a pilot who does not want them finds two loose ropes in the way of the climb. Asked for, they are rigged properly: secured on deck at the point the arrangement provides, hanging beside the ladder rather than across it, and reaching down as far as the pilot asked the ladder to go.",
    },
    {
      id: "report", kind: "hold", target: "bridge-vhf", seconds: 5,
      title: "Report the arrangement rigged to the bridge",
      cue: "Hold the transmit key and make the whole report — ladder rigged, height, who checked it, point of transfer manned.",
      why: "The bridge is about to make a lee and hold a course and speed on the strength of this report, and the pilot is about to leave a boat on the strength of what the bridge tells them. Made in full, it names who inspected the ladder, so the report is a person putting their name to the arrangement rather than a word on the radio.",
      holdBreakNote: "The report was cut off part way. A half-made report leaves the bridge acting on half the picture — key up and make the whole of it.",
    },
    {
      id: "speed", kind: "gauge", target: "speed-repeater",
      title: "Check the ship's speed at the transfer",
      cue: "Read the repeater at the point of transfer and commit it against what the pilot asked for.",
      why: "A lee is only a lee at the speed and heading it was worked out for, and speed at the ship's side is the one thing the deck party can see and the bridge cannot feel. Too fast and the boat cannot hold station on the ladder; too slow and the ship will not steer and the lee falls away. Reading it here and saying so is what keeps the manoeuvre honest.",
      gauge: { label: "SPEED", speed: 0.7, green: [0.3, 0.46], readout: (t) => `${(t * 14).toFixed(1)} kn`, missNote: "That is not the speed the pilot asked for. Call the bridge and have it adjusted before the boat comes in — do not let the boat come alongside to a speed nobody agreed." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["stanchion-base", "transfer-light"],
      itemNames: { "stanchion-base": "the loose stanchion base", "transfer-light": "the unlit transfer position" },
      itemNotes: {
        "stanchion-base": "The forward handhold stanchion moves at its base. A handhold is only a handhold if it is rigidly secured where it is bolted down — this one comes away in the hand of whoever grabs it hardest.",
        "transfer-light": "The light over the point of access is out. The transfer position, the ladder and the deck where the pilot steps aboard are all lit or none of it is, and this one is in the dark from the water up.",
      },
      title: "Walk the arrangement before the boat is called in",
      cue: "Go over the whole point of access one more time — handholds, deck, lighting — and click anything that needs putting right.",
      why: "The arrangement has been handled by four people in twenty minutes and everything in it is now either right or nearly right. This is the last look anybody gets at it from the safe side, and the two things that go wrong most at the top of a pilot ladder are a handhold that is not one and a point of access nobody can see.",
    },
    {
      id: "escort", kind: "select", target: "escort-route",
      title: "Meet the pilot and escort them to the bridge",
      cue: "Take them in through the house door and go with them, by the route the ship uses.",
      why: "A pilot is a stranger on this ship with wet hands and a bag, arriving in the dark on a deck they have never walked. The transfer is not finished at the top of the ladder: it finishes when somebody has walked them to the bridge by a safe route, and the officer in attendance has seen the boat clear the ship's side.",
    },
  ],

  interrupts: [
    {
      id: "boat-early",
      kind: "Boat alongside early",
      after: "manropes", delay: 3, seconds: 12,
      alert: "The pilot boat has run in on the ladder before the point of transfer was reported ready, and she is riding up on the quarter wave with the coxswain holding her on the plating.",
      cue: "The boat is on the ladder and nobody told her to come.",
      target: "boat-signal",
      why: "A boat comes alongside when the ship's side is ready and the officer in attendance says so, because the coxswain cannot see the ladder's securing, the height or whether anybody is standing at the top of it. Waving her off costs a minute of boat handling; a pilot stepping off onto an arrangement that was not reported ready costs everything.",
      missNote: "The boat stayed on the ladder and the pilot came up an arrangement nobody had reported ready, with the man-ropes still being made fast at the top of it. That it worked was the coxswain's boat handling, not the ship's arrangement — and the next time the boat comes in early it will be onto a ladder that is still one turn short of secured.",
      wrongNote: "It is the signalling lamp at the bulwark. The boat has to be told to stand off, and she has to be told by the ship, now.",
    },
    {
      id: "lashing-surge",
      kind: "Combination arrangement moving",
      after: "speed", delay: 3, seconds: 11,
      alert: "The pilot ladder has surged against the accommodation ladder's bottom platform and the two are working against each other with every roll of the ship.",
      cue: "Your two ladders have stopped being one arrangement.",
      target: "combination-lashing",
      why: "A combination arrangement is only safe while the two ladders cannot move relative to each other: the whole hazard it exists to remove is the gap at the platform, and a securing that has surged puts that gap back and makes it open and close on the roll. It is re-secured before anybody is on it, not watched to see whether it settles.",
      missNote: "The ladders kept working against each other and the pilot crossed from the ladder to the platform over a gap that was opening and shutting with the roll. A foot into that gap as it closes is a broken leg at best, and on the way the pilot cannot see it because they are looking up at the platform and climbing with both hands.",
      wrongNote: "It is the securing between the pilot ladder and the accommodation ladder. Nothing else puts the two back together as one arrangement.",
    },
  ],


  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, PLT_ACCENT);

    // ---------------------------------------------------------- the ship's side
    // Port side to -x, bow to -z, stern to +z, so the learner walks in from aft
    // along the deck and the sea opens up on the left. Everything outboard —
    // the water, the boat, the accommodation ladder and the pilot ladder at its
    // bottom platform — is built above the plaza so the arrangement can be seen
    // from the deck rather than buried under it; the freeboard is compressed
    // the way every diorama on this stage is, and the plan of the arrangement
    // is what has to read.
    const SEA = 0.02;
    const dk = group(g, 0, 0.18, 0);           // the ship's deck, and everything on it
    box(dk, 5.0, 0.18, 5.4, 0.5, -0.09, 0, 0x454c55,
      { rough: 0.78, metal: 0.35, finish: "painted", tile: [4, 4] });
    for (let i = -2; i <= 2; i++) {
      box(dk, 0.03, 0.01, 5.4, 0.5 + i * 1.0, 0.005, 0, 0x2f363d, { rough: 0.8, cast: false });
    }
    // The gunwale plating and the belting, so the deck has an edge and a side.
    box(g, 0.12, 0.34, 5.4, -2.06, 0.01, 0, 0x39424b,
      { rough: 0.75, metal: 0.35, finish: "painted", tile: [1, 6] });
    box(g, 0.2, 0.07, 5.4, -2.1, 0.07, 0, 0x2b333b, { rough: 0.8, metal: 0.3, cast: false });
    const sea = slab(g, 6.0, 0.02, 9.0, -5.15, SEA, 0.4, 0x12374a,
      { rough: 0.16, metal: 0.3, opacity: 0.9, transparent: true, cast: false, receive: false });
    void sea;

    // Bulwark forward of the gateway, open guard rails aft of it, so the sea
    // and the boat are in sight from the deck the way they have to be.
    box(dk, 0.12, 0.95, 3.05, -2.02, 0.48, -1.175, 0x6d757d,
      { rough: 0.7, metal: 0.4, finish: "painted", tile: [1, 3] });
    const railCap = box(dk, 0.22, 0.08, 3.05, -2.02, 1.0, -1.175, 0x9aa3ab,
      { rough: 0.5, metal: 0.6, finish: "brushed" });
    void railCap;
    for (let i = 0; i < 3; i++) {
      cyl(dk, 0.022, 0.026, 1.0, -2.02, 0.5, 1.5 + i * 0.6, 0xc3ccd3, { rough: 0.45, metal: 0.7, seg: 10 });
    }
    for (const y of [0.6, 0.98]) {
      cyl(dk, 0.016, 0.016, 1.3, -2.02, y, 2.1, 0xc3ccd3, { rough: 0.45, metal: 0.7, seg: 8 }).rotation.x = Math.PI / 2;
    }
    const railTurn = box(dk, 0.3, 0.16, 0.34, -2.02, 1.02, 0.2, 0x9aa3ab, { rough: 0.5, metal: 0.6 });
    holoTag(dk, "Make it fast to the rail?", -2.02, 1.34, 0.2, { css: "#f0645b", w: 0.44 });
    reg(hits, railTurn, "rail-secured");

    // The point of access at the gateway: strong point, handholds, bulwark ladder.
    const strongPoint = group(dk, -1.72, 0.02, 1.95);
    box(strongPoint, 0.26, 0.05, 0.26, 0, 0, 0, 0x8a939b, { rough: 0.55, metal: 0.65 });
    torus(strongPoint, 0.07, 0.016, 0, 0.09, 0, 0xb9c2ca, { rough: 0.4, metal: 0.8, seg: 8, seg2: 18 });
    holoTag(dk, "Deck strong point", -1.72, 0.4, 1.95, { css: "#ffd166", w: 0.34 });
    reg(hits, strongPoint, "strong-point");

    const stanchions = group(dk, -2.02, 0, 0.9);
    for (const dz of [-0.4, 0.4]) {
      cyl(stanchions, 0.024, 0.028, 1.45, 0, 0.72, dz, 0xc3ccd3, { rough: 0.4, metal: 0.75, seg: 10 });
      box(stanchions, 0.11, 0.035, 0.11, 0, 0.02, dz, 0x8a939b, { rough: 0.55, metal: 0.6 });
    }
    holoTag(stanchions, "Handhold stanchions", 0, 1.66, 0, { css: "#ffd166", w: 0.4 });
    reg(hits, stanchions, "handhold-stanchions");
    const stanchionBase = cyl(dk, 0.06, 0.06, 0.06, -2.02, 0.05, 0.5, 0x8a5a3a,
      { rough: 0.95, seg: 12, finish: "rust" });
    holoTag(dk, "Stanchion base", -1.98, 0.26, 0.5, { css: "#b8794a", w: 0.26 });
    reg(hits, stanchionBase, "stanchion-base");

    const bulwarkLadder = group(dk, -1.9, 0, 0.42);
    for (const dz of [-0.16, 0.16]) cyl(bulwarkLadder, 0.018, 0.018, 1.0, 0, 0.5, dz, 0xb9c2ca, { rough: 0.45, metal: 0.7, seg: 8 });
    for (let i = 0; i < 3; i++) {
      cyl(bulwarkLadder, 0.015, 0.015, 0.32, 0, 0.24 + i * 0.28, 0, 0xb9c2ca, { rough: 0.45, metal: 0.7, seg: 8 })
        .rotation.x = Math.PI / 2;
    }
    holoTag(bulwarkLadder, "Bulwark ladder — gateway", 0, 1.18, 0, { css: "#ffd166", w: 0.44 });
    reg(hits, bulwarkLadder, "bulwark-ladder");

    // The light over the point of access — out until the walk-round finds it.
    const lightMast = group(dk, -1.78, 0, 1.45);
    cyl(lightMast, 0.032, 0.038, 2.0, 0, 1.0, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    const transferLamp = ball(lightMast, 0.095, 0, 2.02, 0.1, 0x4a4f55, { rough: 0.5, emissive: 0x000000, ei: 0.0 });
    holoTag(lightMast, "Transfer position light", 0, 2.32, 0, { css: "#ffd166", w: 0.42 });
    reg(hits, transferLamp, "transfer-light");

    // ------------------------------------------------- the ladder laid on deck
    // Faults are found here, flat and dry, or they are not found at all.
    const deckLadder = group(dk, 0.75, 0.01, 1.85, 0.16);
    for (const dz of [-0.24, 0.24]) {
      cyl(deckLadder, 0.016, 0.016, 2.5, 0, 0.02, dz, 0xd8c8a6, { rough: 0.9, seg: 8 }).rotation.z = Math.PI / 2;
    }
    const deckSteps = [];
    for (let i = 0; i < 8; i++) {
      deckSteps.push(box(deckLadder, 0.09, 0.024, 0.56, -1.05 + i * 0.3, 0.03, 0, 0xa8834f,
        { rough: 0.9, finish: "painted", tile: [1, 1] }));
    }
    holoTag(dk, "Pilot ladder — laid out for inspection", 0.75, 0.5, 1.85, { css: "#ffd166", w: 0.56 });
    const splitStep = deckSteps[3];
    reg(hits, splitStep, "split-step");
    const knot = ball(deckLadder, 0.048, 0.32, 0.03, -0.24, 0xc9b58c, { rough: 0.92 });
    reg(hits, knot, "knotted-siderope");
    const shackle = group(deckLadder, -0.62, 0.04, 0.24);
    torus(shackle, 0.036, 0.012, 0, 0, 0, 0xb9c2ca, { rough: 0.4, metal: 0.85, seg: 8, seg2: 16 });
    box(shackle, 0.013, 0.013, 0.09, 0, 0, 0, 0xd8dee3, { rough: 0.35, metal: 0.9 });
    reg(hits, shackle, "shackle-join");

    // The certified spare, and its paperwork.
    const spare = group(dk, 1.95, 0, -0.6, -0.4);
    torus(spare, 0.26, 0.055, 0, 0.32, 0, 0xe4d3ad, { rough: 0.9, seg: 8, seg2: 22 }).rotation.x = Math.PI / 2;
    torus(spare, 0.2, 0.05, 0, 0.42, 0, 0xe4d3ad, { rough: 0.9, seg: 8, seg2: 20 }).rotation.x = Math.PI / 2;
    box(spare, 0.6, 0.14, 0.6, 0, 0.07, 0, 0x4a5159, { rough: 0.8, finish: "painted", tile: [1, 1] });
    holoTag(spare, "Certified spare ladder", 0, 0.8, 0, { css: "#ffd166", w: 0.42 });
    reg(hits, spare, "spare-ladder");

    const chest = toolChest(dk, 2.4, 0.8, { ry: -0.7, color: 0x2f5f7f });
    const cert = decal(chest, 0.3, 0.22, 0, 0.77, 0.02,
      paperFace("PILOT LADDER", ["MAKER'S CERTIFICATE", "INSPECTION RECORD", "SIGNED / DATED"],
        { bg: "#f2ead8", band: "#1f5f8a" }),
      { px: 256, rough: 0.85 });
    cert.rotation.x = -Math.PI / 2;
    holoTag(chest, "Certificate and inspection record", 0, 1.0, 0, { css: "#ffd166", w: 0.56 });
    reg(hits, cert, "ladder-cert");

    // ------------------------------------------------- the combination, rigged
    // Accommodation ladder from the gateway, leading aft and down to a bottom
    // platform at the water, with the pilot ladder rigged alongside it.
    const accom = group(g, -2.12, 0.16, 0.5);
    accom.rotation.y = -0.66;
    const flight = group(accom, 0, 0, 0);
    flight.rotation.x = 0.07;
    for (const sx of [-0.34, 0.34]) box(flight, 0.07, 0.08, 2.5, sx, -0.06, 1.25, 0x9aa3ab, { rough: 0.5, metal: 0.55, finish: "brushed" });
    for (let i = 0; i < 8; i++) box(flight, 0.64, 0.022, 0.15, 0, -0.01, 0.3 + i * 0.28, 0xc3ccd3, { rough: 0.5, metal: 0.5 });
    for (const sx of [-0.34, 0.34]) {
      cyl(flight, 0.014, 0.014, 2.5, sx, 0.62, 1.25, 0xc3ccd3, { rough: 0.45, metal: 0.65, seg: 8 }).rotation.x = Math.PI / 2;
      for (const lz of [0.3, 1.25, 2.2]) cyl(flight, 0.014, 0.014, 0.62, sx, 0.31, lz, 0xc3ccd3, { rough: 0.45, metal: 0.65, seg: 8 });
    }
    box(flight, 0.8, 0.06, 0.8, 0, -0.06, 2.75, 0xc3ccd3, { rough: 0.55, metal: 0.5 });
    for (const sx of [-0.4, 0.4]) cyl(flight, 0.016, 0.016, 0.66, sx, 0.3, 2.75, 0xc3ccd3, { rough: 0.45, metal: 0.65, seg: 8 });
    holoTag(g, "Accommodation ladder — leading aft", -2.9, 0.92, 1.3, { css: "#ffd166", w: 0.58 });
    reg(hits, accom, "accom-ladder");

    // The pilot ladder itself, at the outboard edge of the bottom platform:
    // hidden until the certified one has been made up and put over the side.
    const pilotLadder = group(g, -3.78, 0.6, 2.28, -0.66);
    for (const dz of [-0.24, 0.24]) cyl(pilotLadder, 0.016, 0.016, 0.62, 0, -0.31, dz, 0xd8c8a6, { rough: 0.9, seg: 8 });
    for (let i = 0; i < 3; i++) {
      box(pilotLadder, 0.09, 0.024, 0.56, 0, -0.12 - i * 0.19, 0, 0xa8834f, { rough: 0.9, finish: "painted", tile: [1, 1] });
    }
    box(pilotLadder, 0.13, 0.03, 1.05, 0, -0.5, 0, 0x8d6b3e, { rough: 0.9, finish: "painted", tile: [1, 1] });
    // The securing, from the strong point on deck down the side to the head.
    const ladderFall = hose(g, [[-1.72, 0.26, 1.95], [-2.3, 0.35, 2.1], [-3.2, 0.62, 2.2], [-3.78, 0.6, 2.28]],
      0.016, 0xd8c8a6, { steps: 14, rough: 0.9 });
    pilotLadder.visible = false;
    ladderFall.visible = false;
    const ladderHome = pilotLadder.position.clone();

    const overlap = box(g, 0.3, 0.3, 0.3, -3.6, 0.45, 2.02, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Above the bottom platform", -3.6, 0.82, 2.02, { css: "#ffd166", w: 0.46 });
    reg(hits, overlap, "ladder-overlap");

    const lashing = group(g, -3.56, 0.2, 2.42);
    const lashingRope = torus(lashing, 0.09, 0.022, 0, 0, 0, 0xffd166, { rough: 0.8, seg: 8, seg2: 18 });
    box(lashing, 0.05, 0.05, 0.34, 0, 0, 0, 0xe4d3ad, { rough: 0.85 });
    holoTag(lashing, "Ladders secured to each other", 0, 0.34, 0, { css: "#ffd166", w: 0.52 });
    reg(hits, lashing, "combination-lashing");

    // What the ladder is veered by: the slack turn at the gunwale.
    const veer = group(dk, -1.96, 0.74, 1.6);
    torus(veer, 0.11, 0.024, 0, 0, 0, 0xe4d3ad, { rough: 0.88, seg: 8, seg2: 18 }).rotation.x = Math.PI / 2;
    torus(veer, 0.075, 0.022, 0, 0.05, 0, 0xe4d3ad, { rough: 0.88, seg: 8, seg2: 16 }).rotation.x = Math.PI / 2;
    cyl(veer, 0.03, 0.035, 0.74, 0, -0.37, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    holoTag(veer, "Veer the ladder", 0, 0.3, 0, { css: "#ffd166", w: 0.3 });
    reg(hits, veer, "ladder-veer");

    // Man-ropes, rigged only because the request asked for them.
    const manropes = {};
    for (const [id, dz, label] of [["manrope-fwd", 0.6, "Forward man-rope"], ["manrope-aft", 1.2, "After man-rope"]]) {
      const mr = group(dk, -2.06, 0, dz);
      cyl(mr, 0.014, 0.014, 1.5, 0, 0.3, 0, 0xe8dcc0, { rough: 0.9, seg: 8 });
      box(mr, 0.07, 0.045, 0.07, 0, 1.06, 0, 0x8a939b, { rough: 0.55, metal: 0.6 });
      holoTag(mr, label, 0, 1.3, 0, { css: "#ffd166", w: 0.32 });
      mr.visible = false;
      manropes[id] = mr;
      const pick = box(dk, 0.22, 0.6, 0.22, -2.06, 0.5, dz, 0x000000, { opacity: 0.001, transparent: true, cast: false });
      reg(hits, pick, id);
    }

    // The retrieval line nobody asked for, coiled aft.
    const retrieval = group(dk, -1.5, 0.02, 2.5);
    torus(retrieval, 0.16, 0.026, 0, 0, 0, 0xb8c9a8, { rough: 0.9, seg: 8, seg2: 20 }).rotation.x = Math.PI / 2;
    torus(retrieval, 0.11, 0.024, 0, 0.045, 0, 0xb8c9a8, { rough: 0.9, seg: 8, seg2: 18 }).rotation.x = Math.PI / 2;
    holoTag(retrieval, "Bend it on low and lead it aft?", 0, 0.42, 0, { css: "#f0645b", w: 0.54 });
    reg(hits, retrieval, "retrieval-foul");

    // ------------------------------------------------------ the rescue gear
    const buoyBracket = group(dk, -2.0, 0.6, 1.75);
    box(buoyBracket, 0.1, 0.06, 0.36, 0, 0, 0, 0x8a939b, { rough: 0.55, metal: 0.6 });
    box(buoyBracket, 0.06, 0.6, 0.06, 0, -0.3, 0, 0x8a939b, { rough: 0.55, metal: 0.6 });
    holoTag(buoyBracket, "Lifebuoy bracket — point of transfer", 0, 0.36, 0, { css: "#ffd166", w: 0.6 });
    hits["buoy-bracket"] = buoyBracket;

    const lifebuoy = group(dk, 2.6, 0.9, -1.4, 0.4);
    torus(lifebuoy, 0.23, 0.065, 0, 0, 0, 0xf2681f, { rough: 0.8, seg: 8, seg2: 22 });
    for (let i = 0; i < 4; i++) {
      const b = box(lifebuoy, 0.1, 0.058, 0.08, Math.sin(i * 1.571) * 0.23, Math.cos(i * 1.571) * 0.23, 0, 0xf2f4f6, { rough: 0.7 });
      b.rotation.z = i * 1.571;
    }
    const buoyLight = cyl(lifebuoy, 0.036, 0.036, 0.17, 0.25, -0.12, 0, 0xd8dee3, { rough: 0.5, seg: 12 });
    holoTag(lifebuoy, "Lifebuoy — self-igniting light", 0, 0.44, 0, { css: "#ffd166", w: 0.52 });
    reg(hits, lifebuoy, "lifebuoy");

    const transferPoint = box(dk, 0.5, 0.05, 0.5, -1.58, 0.02, 1.35, 0xffd166,
      { rough: 0.6, opacity: 0.34, transparent: true, cast: false });
    holoTag(dk, "Point of transfer", -1.58, 0.3, 1.35, { css: "#ffd166", w: 0.34 });
    hits["transfer-point"] = transferPoint;

    const heaving = group(dk, 2.25, 0.12, 2.0, -0.3);
    torus(heaving, 0.15, 0.024, 0, 0, 0, 0xf2f4f6, { rough: 0.85, seg: 8, seg2: 20 }).rotation.x = Math.PI / 2;
    ball(heaving, 0.058, 0.22, 0.01, 0, 0x8a6a4a, { rough: 0.92 });
    box(heaving, 0.32, 0.15, 0.24, -0.02, 0.16, 0.32, 0xf2681f, { rough: 0.82, finish: "rubber", tile: [1, 1] });
    holoTag(heaving, "Heaving line and lifejacket", 0, 0.52, 0, { css: "#ffd166", w: 0.5 });
    reg(hits, heaving, "heaving-line");

    // ------------------------------------------ the people, the bridge, the boat
    const officer = standingFigure(dk, -0.8, 2.25, { ry: -2.5, cloth: 0x223344, vest: 0xffd166, helmet: 0xf2f4f6 });
    holoTag(dk, "Officer in attendance", -0.8, 2.0, 2.25, { css: "#ffd166", w: 0.42 });
    reg(hits, officer, "attending-officer");
    // Tending the ladder at the gateway is where this hand belongs.
    standingFigure(dk, -1.62, 0.4, { ry: -1.4, cloth: 0x2b3138, vest: 0xf2681f, helmet: 0xf2f4f6, atStation: true });

    const vhfPost = group(dk, -1.3, 0, 2.7);
    cyl(vhfPost, 0.03, 0.035, 1.1, 0, 0.55, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    const vhf = instrument(vhfPost, 0, 1.12, 0, { ry: 0.5, idle: "CH 13", color: 0xffd166, w: 0.11, d: 0.17 });
    holoTag(vhfPost, "VHF — bridge", 0, 1.34, 0, { css: "#ffd166", w: 0.3 });
    reg(hits, vhf, "bridge-vhf");

    const repeaterPost = group(dk, 1.3, 0, 1.6);
    cyl(repeaterPost, 0.035, 0.04, 1.0, 0, 0.5, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    const repeater = instrument(repeaterPost, 0, 1.02, 0, { ry: -0.5, idle: "-- kn", color: 0x4fd1ff });
    holoTag(repeaterPost, "Speed repeater", 0, 1.26, 0, { css: "#4fd1ff", w: 0.32 });
    reg(hits, repeater, "speed-repeater");

    // Overboard discharge above the transfer position.
    const dischargeLine = group(dk, -1.8, 0, -0.6);
    cyl(dischargeLine, 0.055, 0.055, 0.85, -0.2, 0.62, 0, 0x7a8289, { rough: 0.6, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    const dischargeValve = valveWheel(dischargeLine, 0, 0.62, 0, { r: 0.1, color: 0xd2312b, body: 0x7a8289 });
    holoTag(dischargeLine, "Ship's side discharge", 0, 1.08, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, dischargeValve, "discharge-valve");
    const dischargeFlow = particles(g, 26, 0xbcd6e2, { size: 0.03, life: 0.6, additive: false, opacity: 0.4 });
    dischargeFlow.position.set(-2.35, 0.55, -0.6);
    const dischargeTrap = box(dk, 0.5, 0.7, 0.5, -1.78, 0.4, -1.7, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(dk, "Call the boat in with it running?", -1.78, 0.98, -1.7, { css: "#f0645b", w: 0.56 });
    reg(hits, dischargeTrap, "discharge-running");

    // The signalling lamp: how the ship tells the boat to stand off.
    const lamp = group(dk, -1.9, 0, -1.15);
    cyl(lamp, 0.035, 0.04, 1.1, 0, 0.55, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    const lampHead = cyl(lamp, 0.09, 0.09, 0.17, 0, 1.18, 0, 0x3c4450, { rough: 0.45, metal: 0.5, seg: 14 });
    lampHead.rotation.z = Math.PI / 2;
    const lampLens = ball(lamp, 0.062, -0.09, 1.18, 0, 0x6a7078, { rough: 0.3, emissive: 0x000000, ei: 0.0 });
    holoTag(lamp, "Signalling lamp — boat", 0, 1.46, 0, { css: "#ffd166", w: 0.44 });
    reg(hits, lamp, "boat-signal");

    // Leaving the point of transfer to get on with the paperwork.
    const walkAway = box(dk, 0.6, 1.3, 0.6, 2.1, 0.65, 2.4, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(dk, "Leave it and go and log it?", 2.1, 1.5, 2.4, { css: "#f0645b", w: 0.5 });
    reg(hits, walkAway, "unattended-ladder");

    // ---------------------------------------------------------- the deckhouse
    // Only the starboard half of the forward end, so the sea and the ladder
    // stay open from where the learner walks in.
    const house = group(dk, 1.75, 0, -2.45);
    box(house, 2.5, 2.5, 0.3, 0, 1.25, 0, 0xdfe6ec, { rough: 0.6, finish: "painted", tile: [3, 3] });
    for (const dx of [-0.7, 0.7]) {
      decal(house, 0.5, 0.36, dx, 1.8, 0.16, (cx, w, h) => {
        cx.fillStyle = "#12222c"; cx.fillRect(0, 0, w, h);
        cx.fillStyle = "rgba(180,220,240,0.30)"; cx.fillRect(w * 0.06, h * 0.08, w * 0.88, h * 0.84);
      }, { px: 192, rough: 0.35 });
    }
    const houseDoor = group(house, -0.9, 0, 0.17);
    box(houseDoor, 0.64, 1.9, 0.06, 0, 0.97, 0, 0x8fa4b2, { rough: 0.55, metal: 0.4, finish: "painted", tile: [1, 2] });
    box(houseDoor, 0.07, 0.2, 0.05, 0.23, 0.97, 0.05, 0xd8dee3, { rough: 0.4, metal: 0.7 });
    holoTag(house, "To the bridge", -0.9, 2.12, 0.22, { css: "#ffd166", w: 0.3 });
    reg(hits, houseDoor, "escort-route");

    // ---------------------------------------------------------- the pilot boat
    const boat = group(g, -4.95, SEA, 0.45, 0.2);
    box(boat, 3.3, 0.55, 1.15, 0, 0.26, 0, 0x1f2a33, { rough: 0.7, metal: 0.25, finish: "painted", tile: [3, 1], cast: false });
    box(boat, 3.1, 0.24, 1.2, 0, 0.64, 0, 0xf2681f, { rough: 0.7, finish: "painted", tile: [3, 1], cast: false });
    box(boat, 1.25, 0.85, 1.0, -0.4, 1.18, 0, 0xe8edf1, { rough: 0.6, finish: "painted", tile: [1, 1], cast: false });
    cyl(boat, 0.035, 0.035, 1.3, -0.4, 2.25, 0, 0xc3ccd3, { rough: 0.5, metal: 0.6, seg: 8, cast: false });
    const boatLight = ball(boat, 0.1, -0.4, 2.95, 0, 0xffe9a8, { emissive: 0xffe9a8, ei: 1.4, rough: 0.4, cast: false });
    standingFigure(boat, 0.9, 0.1, { ry: -1.5, cloth: 0x243a4a, vest: 0xf2681f, atStation: true }).position.y = 0.66;
    holoTag(g, "Pilot boat", -4.95, 1.95, 0.45, { css: "#ffd166", w: 0.28 });
    const boatHome = boat.position.clone();
    const wake = particles(g, 30, 0xcfe4f0, { size: 0.04, life: 0.9, additive: false, opacity: 0.4 });
    wake.position.set(-3.9, SEA + 0.05, 0.2);

    // ---------------------------------------------------- the boarding request
    const request = holoPanel(dk, 0.62, 0.46, 2.5, 1.5, 1.3, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#ffd166"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("PILOT BOARDING REQUEST · STATION PILOT", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("PORT SIDE — COMBINATION", w * 0.06, h * 0.32);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["Ladder height: as requested on boarding", "Accommodation ladder leading aft",
       "Man-ropes: YES · Retrieval line: NO", "Lee to be made on the transfer side",
       "Course and speed as requested", "Officer in attendance, VHF to bridge"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.47 + i * h * 0.082));
    }, { ry: -0.7, accent: PLT_ACCENT });
    reg(hits, request, "transfer-request");

    cone(dk, 2.7, 0.1, { color: 0xffd166 });
    const spray = particles(g, 28, 0xdcecf5, { size: 0.035, life: 0.8, additive: false, opacity: 0.35 });
    spray.position.set(-2.3, SEA + 0.05, 0.4);

    let rigged = false, veered = false, discharging = true, boatIn = false, lashingLoose = false;

    return {
      hits,
      footprint: 2.4,

      onStepComplete(step) {
        if (step.id === "inspect") {
          // The condemned ladder is marked and struck below; nobody re-reads a
          // fault they have already found.
          for (const st of deckSteps) st.material = mat(0x7a3a33, { rough: 0.9 });
          knot.material = mat(0x7a3a33, { rough: 0.9 });
        }
        if (step.id === "rig") {
          rigged = true;
          deckLadder.visible = false;
          spare.position.set(-1.9, 0.02, 1.95);
          pilotLadder.visible = true;
          ladderFall.visible = true;
          pilotLadder.position.set(ladderHome.x, ladderHome.y + 0.3, ladderHome.z);
        }
        if (step.id === "buoy") lifebuoy.position.set(-2.0, 0.78, 1.75);
        if (step.id === "heaving") heaving.position.set(-1.58, 0.06, 1.35);
        if (step.id === "discharge") {
          discharging = false;
          dischargeValve.userData.wheel.rotation.z += 1.6;
        }
        if (step.id === "combination") lashingRope.material = mat(0x59c97b, { rough: 0.7 });
        if (step.id === "veer") { veered = true; pilotLadder.position.copy(ladderHome); }
        if (step.id === "manropes") for (const mr of Object.values(manropes)) mr.visible = true;
        if (step.id === "walk") {
          stanchionBase.material = mat(0x8a939b, { rough: 0.5, metal: 0.6 });
          transferLamp.material = mat(0xfff1c2, { rough: 0.4, emissive: 0xfff1c2, ei: 2.4 });
        }
        if (step.id === "escort") {
          officer.position.set(0.95, 0, -1.5);
          officer.rotation.y = 0.2;
        }
      },

      // The boat really comes in on the ladder, and the securing really surges.
      onInterrupt(it) {
        if (it.id === "boat-early") {
          boatIn = true;
          boat.position.set(-3.7, SEA, 1.4);
          boat.rotation.z = 0.1;
          boatLight.material = mat(0xff5f5f, { emissive: 0xff5f5f, ei: 2.8, rough: 0.4 });
        }
        if (it.id === "lashing-surge") {
          lashingLoose = true;
          lashing.position.set(-3.82, 0.36, 2.72);
          lashing.rotation.z = 0.5;
          lashingRope.material = mat(0xf0645b, { rough: 0.7 });
          pilotLadder.rotation.z = 0.14;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "boat-early") {
          boatIn = false;
          boat.position.copy(boatHome);
          boat.rotation.z = 0;
          boatLight.material = mat(0xffe9a8, { emissive: 0xffe9a8, ei: 1.4, rough: 0.4 });
        }
        if (it.id === "lashing-surge") {
          lashingLoose = false;
          lashing.position.set(-3.56, 0.2, 2.42);
          lashing.rotation.z = 0;
          lashingRope.material = mat(0x59c97b, { rough: 0.7 });
          pilotLadder.rotation.z = 0;
        }
      },

      onHazard(hitId) {
        // Every one of these ends with the boat on the ladder anyway.
        if (hitId === "unattended-ladder" || hitId === "discharge-running") boatIn = true;
      },

      animate(t, dt, session) {
        // The sea does not wait for the arrangement to be finished.
        spray.visible = true;
        spray.userData.step(dt, new THREE.Vector3(0, 0.1, 0), 1.1, 0.5, -1.0);
        wake.visible = true;
        wake.userData.step(dt, new THREE.Vector3(boatIn ? 1.2 : 0, 0.05, 0), 0.8, 0.35, -0.5);
        boat.position.y = SEA + Math.sin(t * 1.3) * 0.07;
        boat.rotation.x = Math.sin(t * 1.1) * 0.05;
        if (rigged) pilotLadder.rotation.x = Math.sin(t * 0.9) * 0.03;
        if (lashingLoose) lashing.rotation.z = 0.5 + Math.sin(t * 3.2) * 0.12;
        if (discharging) {
          dischargeFlow.visible = true;
          dischargeFlow.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.08, 0.3, -1.6);
        } else if (dischargeFlow.visible) dischargeFlow.visible = false;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "speed") {
          repaint(repeater.userData.screen, signFace(`${(gg.t * 14).toFixed(1)}`, {
            bg: "#0d1c24", accent: gg.t > 0.28 && gg.t < 0.48 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "veer") {
          repaint(vhf.userData.screen, signFace(`${(tr.v * 7).toFixed(1)}m`, {
            bg: "#1c1408", accent: tr.v > 0.34 && tr.v < 0.54 ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.5,
          }));
          pilotLadder.position.y = ladderHome.y + (1 - tr.v) * 0.3;
        }
        void veered; void buoyLight; void lampLens;
      },
    };
  },
};
