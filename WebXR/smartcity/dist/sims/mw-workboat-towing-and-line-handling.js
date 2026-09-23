import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Workboat Towing & Line Handling VR — Maritime & Ports, the
// marine and water pack of the Bay Area Union Edition.
//
// The afterdeck of a harbour tug making up to a barge astern: the towing
// winch with its brake and control lever, the load gauge on its pedestal, the
// H-bitt, the stern roller, the gob rope, and the barge's bow with its bitt a
// few metres off. The learner is the Inlandboatmen's Union deckhand; the
// master is in the wheelhouse and the MEBA engineer is at the deckhouse door.
// The vessel is a generic towing vessel inspected under Subchapter M; no
// tow length, current or load figure is invented — each one is "the master's
// figure" or "the plan's".

const MWTL_ACCENT = 0xe0873a;

export const SIM_MW_WORKBOAT_TOWING_AND_LINE_HANDLING = {
  id: "mw-workboat-towing-and-line-handling",
  index: "231",
  domain: "Maritime & Ports",
  trade: "Inlandboatmen's Union of the ILWU deckhand on a harbour towing vessel, with the MEBA licensed engineer on watch and an SIU-trained AB in the relief crew",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "Inlandboatmen's Union of the ILWU deck practice on towing vessels; MEBA engineering watch; SIU Paul Hall Center unlicensed deck training; USCG 46 CFR Subchapter M towing vessel inspection, including the vessel's towing safety management and its towing gear; IMO STCW basic safety training; IMO MARPOL for the fuel and the bilge on deck",
  name: "Workboat Towing & Line Handling",
  title: simTitle("Workboat Towing & Line Handling"),
  tagline: "Making up to a barge astern: the voyage plan read, vest and knife on, the hawser and bridle walked, the winch brake set, the heaving line tended to the barge through a current shift, the eye passed to the barge's bitt, the load read, the gob and roller walked, the hawser paid out to the master's length through a lost-comms call, the afterdeck chained off, the gear stowed and the tow logged",
  accent: MWTL_ACCENT,
  accentCss: "#e0873a",
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "clear-of-the-hawser", name: "Clear Of The Hawser", note: "Never over a working hawser, never a hand on the drum, never a line near the screw, and both the set and the silent radio answered" },

  supportLine: "your union hall's member assistance programme — the Inlandboatmen's Union, MEBA or SIU — with the employer's employee assistance line behind it",

  game: system({
    name: "Tow Deck",
    currency: "FATHOM",
    ranks: ["Ordinary", "Deckhand", "Lead Deckhand", "Tow Mate", "Tow Deck Certified"],
    badges: [
      { id: "plan-first", name: "Plan First", note: "The voyage and tow plan read before any line moved", test: AWARD.stepClean("voyage-plan") },
      { id: "load-read-true", name: "Load Read True", note: "Hawser load committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "out-of-the-lead", name: "Out Of The Lead", note: "Never over the hawser, never at the drum by hand, never a lashed release", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-make-up", name: "Clean Make-Up", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "steady-payout", name: "Steady Payout", note: "Hawser paid out in band the whole way to the master's length", test: AWARD.unbroken },
      { id: "on-the-tide", name: "On The Tide", note: "Tow logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "heaving-line-screw": "You threw the heaving line off the quarter with the master working the engine ahead. A heaving line that falls short goes into the water right where the wheel wash pulls it in, and a line round a tug's wheel takes her propulsion in the middle of making up to a barge — the heaving line goes from the stern, with 'wheel stopped' called from the wheelhouse first.",
    "step-over-hawser": "You stepped over the hawser to cross the afterdeck while it was working. A hawser under load moves sideways across the deck with every sheer of the tow, faster than a person can lift a foot, and a hawser that jumps the roller sweeps the deck at knee height — the afterdeck is crossed forward of the winch, never over the lead.",
    "hand-on-drum": "You put a gloved hand on the hawser to guide it onto the turning drum. The drum takes a glove, the hand in it and the arm behind it faster than the winch can be stopped; a hawser that is spooling badly is stopped and fixed with the drum still, never guided by hand while it turns.",
    "release-lashed": "You left the tow hook's quick release lashed shut with a bit of small stuff. The release is what lets the master drop the tow in seconds when the barge sheers and starts to pull the tug over — girting — and a lashed release is a release nobody can trip when the tug is already heeling. It is kept free and proven, never tied off for convenience.",
  },

  lateNotes: {
    "winch-lever": "The hawser pays out once the eye is on the barge's bitt and the load has been read — not with the eye still on deck.",
    "load-gauge": "The load is read once the eye is on the barge and the master has taken a strain — there is nothing on the gauge before that.",
    "towing-log": "The tow is logged once the hawser is out, the afterdeck chained off and the gear stowed — last, not first.",
  },

  steps: [
    {
      id: "voyage-plan", kind: "select", target: "voyage-plan",
      title: "Read the voyage and tow plan with the master",
      cue: "Read the plan on the deckhouse board: the barge and her draft, the route, the tow length for the water, the weather window, and each crew member's job on deck.",
      why: "A tow is two vessels joined by a line that neither controls alone, and the plan is where the tug's crew agree what the barge weighs, how long the hawser will be in open water and in the channel, and who is where on deck. The Subchapter M rules put a towing vessel under a documented safety management and voyage planning regime for exactly this reason: the time to find out the tow length does not suit the channel is at the dock, not with the hawser out.",
    },
    {
      id: "vest-and-knife", kind: "sequence", anyOrder: true,
      targets: ["tow-vest", "line-knife"],
      itemNames: { "tow-vest": "work vest", "line-knife": "line knife on the belt" },
      title: "Put on the work vest and the line knife",
      cue: "Work vest on and fastened, and a sheathed line knife on your belt where either hand can reach it.",
      why: "A deckhand on a tug works low freeboard at the stern where a sheer of the tow or a wave over the quarter puts people in the water, and the work vest is what a crew recovers them by. The knife is for the one thing a deckhand cannot otherwise get out of — a heaving line or a messenger round a wrist or a boot as it runs — and it is on the belt before the lines move, because nobody fetches a knife once a line has them.",
    },
    {
      id: "gear-walk", kind: "find", noHint: true,
      targets: ["hawser-chafe", "shackle-unmoused"],
      itemNames: { "hawser-chafe": "chafed section of the hawser at the roller", "shackle-unmoused": "bridle shackle with no mousing on the pin" },
      itemNotes: {
        "hawser-chafe": "The hawser's cover is chafed through to the core strands where it last lay over the stern roller — that is the point that takes every sheer of the tow, and a chafed section is where it parts.",
        "shackle-unmoused": "The shackle joining the bridle to the hawser has its pin screwed home but no mousing wire — a working tow backs a pin out a turn at a time until the bridle lets go.",
      },
      title: "Walk the hawser and the bridle before making up",
      cue: "Walk the hawser from the drum to the eye and the bridle's shackles: chafe on the cover, cuts, pins moused, thimbles seated.",
      why: "A towing hawser stores enormous energy when a barge sheers, and when it parts it snaps back along its lead faster than anyone can move. It parts at a chafe, a cut or a fitting that has worked loose, and those are found by walking the gear on deck before the eye goes to the barge — once the tow is working, nobody gets near the hawser to look at it.",
    },
    {
      id: "set-brake", kind: "turn", target: "winch-brake",
      title: "Set the towing winch brake before the eye goes out",
      cue: "Wind the band brake on hard and engage the drum's dog, so nothing pays off the drum while the eye is passed.",
      why: "The winch drum holds the hawser only through its brake and dog, and the moment the barge's crew take the eye and the tug moves, any slack on deck becomes line running off a free drum — a bight whipping across the afterdeck. The brake is set by turning it on until it bites and the dog is engaged, and the deckhand checks both with a hand on the brake wheel rather than an assumption about who last used the winch.",
      turn: { turns: 1.5, label: "WINCH BRAKE", readout: (t) => (t < 0.35 ? "brake off" : t < 0.9 ? "band biting" : "brake set · dog in") },
    },
    {
      id: "heaving-line", kind: "hold", target: "heaving-line", seconds: 5,
      title: "Tend the heaving line to the barge until they have it fast",
      cue: "Throw from the stern with the wheel stopped, then tend the heaving line — slack out as the barge crew haul, never a turn round your hand.",
      why: "The heaving line is the messenger the hawser's eye follows across the water, and it is tended until the barge crew have it on their bitt because a heaving line let go of is a line in the water beside a propeller. It is never wrapped round a hand, because the barge moves with the tide and the person holding a wrapped line goes with it; the tending hand pays it out through an open grip.",
      holdBreakNote: "Let go before the barge crew had it fast — a heaving line dropped between the vessels is a line near the wheel. Take it up and tend it again.",
    },
    {
      id: "pass-eye", kind: "drag", target: "hawser-eye",
      title: "Pass the hawser's eye across and over the barge's bitt",
      cue: "With the barge crew hauling the heaving line, send the hawser's eye across and see it dropped over the barge's bitt — from outside the bight on deck.",
      why: "The eye is heavy, wet and stiff, and it goes across on the heaving line rather than by hand so no one leans out between two moving hulls. It is dropped fully over the bitt so it cannot ride up and jump off under the first strain, and the deckhand watches it seated before calling 'all fast' to the wheelhouse — because the master's next move is to take a strain on whatever the deck has said is fast.",
      drag: { to: "barge-bitt", radius: 0.55, missNote: "Not on the bitt — the eye has to drop fully over the barge's bitt, not hang on its horn, before the master takes a strain." },
    },
    {
      id: "read-load", kind: "gauge", target: "load-gauge",
      title: "Read the hawser load as the master takes a strain",
      cue: "Watch the winch's load gauge as the master comes ahead easy, and commit the reading against the working band the master set for this tow.",
      why: "A hawser's load climbs steeply when a tug comes ahead on a dead barge, and the load gauge is the only honest number on deck: the hawser looks the same at a quarter of its strength and at all of it. The master sets the working band for the tow and the gear, and the deckhand's job is to read the needle and say it, so the master can ease off before the gear, the bitt or the hawser becomes the thing that fails.",
      gauge: { label: "HAWSER LOAD", speed: 0.7, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "light — taking up slack" : t <= 0.58 ? "inside the master's band" : "over the band — call it"), missNote: "Outside the band — read the needle once the master's strain has steadied, and call it against the master's band, not a guess." },
    },
    {
      id: "gob-and-roller", kind: "find", noHint: true,
      targets: ["gob-eye-worn", "roller-seized"],
      itemNames: { "gob-eye-worn": "worn gob rope eye at its staple", "roller-seized": "stern roller seized on its pin" },
      itemNotes: {
        "gob-eye-worn": "The gob rope's eye is worn flat and fraying where it rides the staple — the gob rope is what holds the hawser aft and keeps the tow's pull low on the stern, and a gob that parts lets a sheering barge pull the tug round.",
        "roller-seized": "The stern roller has seized on its pin and does not turn; the hawser is dragging over a fixed steel face, which is exactly what chafed the section you found at the roller.",
      },
      title: "Walk the gob rope and the stern roller",
      cue: "Look at the gob rope's eye and staple and the stern roller: free to turn, nothing worn through, the gob set to hold the hawser down.",
      why: "The danger that kills tug crews is girting: a barge that sheers out to the side pulls the tow line abeam and rolls the tug over in seconds. The gob rope keeps the hawser's pull low and aft where the tug can resist it, and a roller that turns keeps the hawser from chafing where it bears — both are walked once the tow is on, because they only show their wear under load.",
    },
    {
      id: "pay-out", kind: "track", target: "winch-lever", seconds: 6,
      title: "Pay out the hawser to the master's tow length",
      cue: "Ease the winch lever to pay out as the tug comes ahead, keeping the hawser at a steady working tension until the master's length is on the marks.",
      why: "Paying out is the winch and the engines in step: too fast and the hawser goes slack, sinks and fouls the bottom or the wheel; too slow and the tug snatches against the barge with the brake half-on. The tension is held in band while the length goes out, because a steady tow is a predictable one, and the master chose the length for the water ahead — the deckhand's job is to give exactly that length, not what feels about right.",
      track: { start: 0.12, green: [0.42, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "PAY-OUT TENSION", readout: (v) => (v < 0.42 ? "slack — hawser sinking" : v > 0.6 ? "snatching — ease the brake" : "steady — paying out") },
      holdBreakNote: "The tension broke out of band on the way out — the hawser went slack or snatched. Bring the lever back to a steady pay-out and hold it.",
    },
    {
      id: "chain-off", kind: "select", target: "danger-chain",
      title: "Chain off the afterdeck while the tow works",
      cue: "Put the chain across the deck forward of the winch: nobody between the winch and the stern while the hawser is working.",
      why: "Once a tow is working, the afterdeck between the winch and the stern is the snap-back zone of the heaviest line on the vessel, and the hawser moves across it with every sheer. The chain across the deck is the physical reminder for everyone, the engineer coming up from below included, that nobody walks through there for a coffee — if something has to be done aft, the master is told and the tow is eased first.",
    },
    {
      id: "stow-gear", kind: "sequence", anyOrder: true,
      targets: ["heaving-line", "gear-box"],
      itemNames: { "heaving-line": "heaving line coiled down and made up", "gear-box": "loose gear in the deck box, lid latched" },
      title: "Coil down and stow the loose gear",
      cue: "Coil the heaving line down clear of the scuppers and put the loose gear — the spare shackle, the marlinspike, the chafe gear — in the deck box and latch it.",
      why: "Loose gear on an afterdeck with a working hawser is gear that ends up round the hawser, over the side or under a boot in the next wave. A heaving line coiled down and made up is ready for the next job and out of the water; a latched deck box keeps the spare shackle from going through the stern rail and into the wheel wash when the tug rolls.",
    },
    {
      id: "towing-log", kind: "select", target: "towing-log",
      title: "Enter the make-up in the towing log",
      cue: "Log the barge and the tow length, the load read, the chafe and the unmoused shackle, the worn gob eye and the seized roller, the current set and the lost comms.",
      why: "The towing log is the vessel's record under its safety management system, and it is where a chafed hawser becomes a replacement and a seized roller becomes a job for the engineer before the next tow. The lost-comms call is logged too, because the next crew needs to know the primary radio dropped out — a fault that happens once and is not written down is a fault that surprises someone else later.",
    },
    {
      id: "crew-checkin", kind: "select", target: "wheelhouse-intercom",
      title: "Check in with the master and the engineer",
      cue: "On the intercom: the afterdeck is chained off and stowed, what you found on the gear, and how the deck crew are after the set and the dropped radio.",
      why: "The master takes the tow on the strength of the deck's report, and the engineer who will be asked to look at the roller needs to hear it now. It is also the crew's own check-in: a make-up with a barge setting down on the quarter and a radio going silent in the middle of it is the kind of moment that deserves to be talked through, and the union's member assistance line is there for what does not get said on the intercom.",
    },
  ],

  interrupts: [
    {
      id: "current-set-on-barge",
      kind: "Current shift sets the barge down",
      after: "heaving-line", delay: 2, seconds: 14,
      alert: "The flood has set in and the barge is being carried down onto the tug's quarter — the gap is closing and the heaving line is going slack between the hulls.",
      cue: "Call the master on the deck radio: the barge is setting down on the quarter, the distance, and the heaving line is slack.",
      target: "tow-radio",
      why: "The master cannot see the barge's bow closing on the quarter from the wheelhouse controls, and a barge setting down on a tug puts the deckhand between two hulls. The answer is to tell the wheelhouse what the deck can see — the set, the closing distance and the slack line — so the master can use the engines to open the gap before anyone on deck tries to fend a barge off by hand.",
      missNote: "The barge's bow closed on the quarter with the deckhand still at the stern tending a slack heaving line, and the wheelhouse learned about the set when the hulls touched.",
      wrongNote: "The deck radio — the master needs to hear the set and the closing distance to open the gap with the engines.",
    },
    {
      id: "comms-lost-payout",
      kind: "Comms lost with the wheelhouse",
      after: "pay-out", delay: 2, seconds: 14,
      alert: "The deck radio has gone silent in the middle of the pay-out — no answer from the wheelhouse and the tug still coming ahead.",
      cue: "Stop paying out, hold the brake, and raise the wheelhouse on the backup handheld from the charger.",
      target: "backup-radio",
      why: "A tow paid out without the wheelhouse hearing the deck is two people guessing at each other's next move with a hawser between them. The agreed lost-comms answer is to stop what is changing — the pay-out — and get a voice back on the backup handheld before anything else moves, rather than carrying on and assuming the master saw what the deck did.",
      missNote: "The pay-out carried on with the radio dead; the master, hearing nothing, eased the engine as the deckhand let the brake off, and the hawser ran slack into the water toward the wheel.",
      wrongNote: "The backup handheld — with the deck radio dead, the first job is a voice back with the wheelhouse before anything else moves.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, MWTL_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 7.6, 0.02, 7.6, 0, 0.012, -0.8, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0d2a33", mid: "#12343f" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x7fa8b8 });

    // ---------------------------------------------------------- the afterdeck
    const tug = group(g, 0, 0, 0);
    const deck = box(tug, 5.4, 0.14, 3.4, 0, 0.4, 0.55, 0xffffff, { rough: 0.8 });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a3f45", base2: "#30353b", step: 20 }), { repeat: 4, px: 512 }), { rough: 0.8, metal: 0.35, color: 0xc0c6cc });
    // Hull below, bulwarks with tyre fenders, and the stern rail.
    box(tug, 5.4, 0.4, 3.4, 0, 0.16, 0.55, 0x1b2a3a, { rough: 0.7, cast: false });
    for (const sx of [-1, 1]) {
      box(tug, 0.1, 0.36, 3.4, sx * 2.7, 0.65, 0.55, 0xd8512b, { rough: 0.6 });
      for (let i = 0; i < 4; i++) {
        const tyre = torus(tug, 0.16, 0.07, sx * 2.8, 0.36, -0.6 + i * 0.8, 0x15181c, { rough: 0.9, seg: 8, seg2: 16 });
        tyre.rotation.y = Math.PI / 2;
      }
    }
    box(tug, 5.4, 0.3, 0.1, 0, 0.62, -1.15, 0xd8512b, { rough: 0.6 });
    // Deckhouse to port, wheelhouse window above it.
    const house = group(tug, -2.0, 0.47, 1.75);
    box(house, 1.2, 1.5, 1.0, 0, 0.75, 0, 0xf1f3f4, { rough: 0.55 });
    box(house, 1.22, 0.1, 1.02, 0, 1.52, 0, 0xd8512b, { rough: 0.6 });
    box(house, 0.5, 1.2, 0.03, 0.2, 0.62, -0.51, 0x8b98a5, { rough: 0.45, metal: 0.5 });
    const whWindow = box(house, 1.0, 0.36, 0.03, 0, 1.9, -0.3, 0x274a5f, { rough: 0.2, metal: 0.3, cast: false });
    box(house, 1.1, 0.5, 0.7, 0, 1.9, 0, 0xf1f3f4, { rough: 0.55 });
    void whWindow;

    // ------------------------------------------------------- towing winch
    const winch = group(tug, 0.4, 0.47, 0.9);
    for (const sx of [-0.62, 0.62]) box(winch, 0.1, 0.8, 0.8, sx, 0.4, 0, 0x2f4f6f, { rough: 0.55, metal: 0.4 });
    const drum = group(winch, 0, 0.45, 0);
    const drumCore = cyl(drum, 0.26, 0.26, 1.1, 0, 0, 0, 0x3a4148, { rough: 0.5, metal: 0.6, seg: 18 });
    drumCore.rotation.z = Math.PI / 2;
    for (let i = 0; i < 5; i++) { const wrap = torus(drum, 0.3, 0.035, -0.4 + i * 0.2, 0, 0, 0xe8dcb8, { rough: 0.85, seg: 6, seg2: 20 }); wrap.rotation.y = Math.PI / 2; }
    const brake = group(winch, 0.8, 0.5, 0.1);
    cyl(brake, 0.02, 0.02, 0.3, -0.15, 0, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    const brakeWheel = group(brake, 0.02, 0, 0);
    const bw = torus(brakeWheel, 0.14, 0.015, 0, 0, 0, 0xe0873a, { rough: 0.55, seg: 8, seg2: 22 });
    bw.rotation.y = Math.PI / 2;
    for (let i = 0; i < 3; i++) { const sp = box(brakeWheel, 0.015, 0.28, 0.015, 0, 0, 0, 0xe0873a, { rough: 0.55 }); sp.rotation.x = (i * Math.PI) / 3; }
    holoTag(brake, "winch brake", 0.05, 0.28, 0, { css: "#e0873a", w: 0.26 });
    reg(hits, brake, "winch-brake");
    const lever = group(tug, 1.45, 0.47, 1.45);
    box(lever, 0.3, 0.8, 0.26, 0, 0.4, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const leverArm = group(lever, 0, 0.82, 0);
    cyl(leverArm, 0.018, 0.018, 0.34, 0, 0.17, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 8 });
    ball(leverArm, 0.04, 0, 0.35, 0, 0xd2312b, { rough: 0.5, seg: 10, seg2: 8 });
    holoTag(lever, "winch lever — pay out", 0, 1.35, 0, { css: "#e0873a", w: 0.42 });
    reg(hits, lever, "winch-lever");
    const pedestal = group(tug, 1.45, 0.47, 0.6);
    cyl(pedestal, 0.04, 0.05, 0.9, 0, 0.45, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const loadDial = cyl(pedestal, 0.13, 0.13, 0.05, 0, 1.0, 0, 0xf1f3f4, { rough: 0.4, seg: 20 });
    loadDial.rotation.x = Math.PI / 2 - 0.4;
    const needle = box(pedestal, 0.012, 0.1, 0.012, 0, 1.03, 0.04, 0xd2312b, { rough: 0.4 });
    needle.rotation.x = -0.4;
    holoTag(pedestal, "hawser load", 0, 1.26, 0, { css: "#e0873a", w: 0.26 });
    reg(hits, pedestal, "load-gauge");
    const drumHit = box(winch, 0.4, 0.3, 0.3, -0.2, 0.45, -0.38, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(winch, "guide the hawser by hand?", -0.2, 0.95, -0.4, { css: "#d2312b", w: 0.5 });
    reg(hits, drumHit, "hand-on-drum");

    // ------------------------------------------ bitt, roller, gob, hawser
    const hbitt = group(tug, -1.0, 0.47, -0.2);
    for (const sx of [-0.18, 0.18]) cyl(hbitt, 0.07, 0.08, 0.5, sx, 0.25, 0, 0x2b3138, { rough: 0.6, metal: 0.5, seg: 12 });
    box(hbitt, 0.56, 0.08, 0.08, 0, 0.36, 0, 0x2b3138, { rough: 0.6, metal: 0.5 });
    const roller = group(tug, 0, 0.8, -1.15);
    const rollerBody = cyl(roller, 0.12, 0.12, 0.9, 0, 0, 0, 0x5b6771, { rough: 0.45, metal: 0.7, seg: 16 });
    rollerBody.rotation.z = Math.PI / 2;
    for (const sx of [-0.5, 0.5]) box(roller, 0.08, 0.32, 0.18, sx, -0.08, 0, 0x2f4f6f, { rough: 0.55, metal: 0.4 });
    const rust = box(roller, 0.14, 0.05, 0.05, 0.42, 0.1, 0.08, 0x8a3a1a, { rough: 0.9, emissive: 0x3a1206, ei: 0.4 });
    reg(hits, rust, "roller-seized");
    const staple = group(tug, 0.9, 0.47, -0.85);
    torus(staple, 0.08, 0.02, 0, 0.1, 0, 0x2b3138, { rough: 0.5, metal: 0.6, seg: 6, seg2: 14 });
    const gob = hose(tug, [[0.9, 0.6, -0.85], [0.5, 0.75, -0.95], [0.1, 0.9, -1.05]], 0.02, 0x3f6f8f, { steps: 8, rough: 0.8 });
    void gob;
    const gobEye = torus(staple, 0.05, 0.016, 0, 0.14, 0.02, 0x8fb4c8, { rough: 0.9, seg: 6, seg2: 12 });
    reg(hits, gobEye, "gob-eye-worn");
    // The hawser: drum over the roller and out to the barge.
    const hawserOut = hose(g, [[0.4, 1.0, 0.7], [0.2, 0.95, -0.3], [0, 0.94, -1.15], [0, 0.6, -2.4], [0, 0.95, -3.55]], 0.035, 0xe8dcb8, { steps: 14, rough: 0.85 });
    hawserOut.visible = false;
    const hawserDeck = hose(g, [[0.4, 1.0, 0.7], [0.1, 0.6, 0.0], [-0.4, 0.52, -0.6], [-1.1, 0.52, -0.7]], 0.035, 0xe8dcb8, { steps: 12, rough: 0.85 });
    const chafe = box(g, 0.2, 0.08, 0.08, 0.15, 0.62, -0.02, 0xa88a58, { rough: 0.95, emissive: 0x3a2a12, ei: 0.3 });
    chafe.rotation.y = 0.6;
    reg(hits, chafe, "hawser-chafe");
    const eye = group(g, -1.3, 0.5, -0.72);
    const eyeLoop = torus(eye, 0.18, 0.035, 0, 0.02, 0, 0xe8dcb8, { rough: 0.85, seg: 8, seg2: 22 });
    eyeLoop.rotation.x = Math.PI / 2;
    const shackle = group(eye, 0.2, 0.04, 0.05);
    torus(shackle, 0.05, 0.014, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 14 });
    const pin = cyl(shackle, 0.012, 0.012, 0.12, 0, 0.0, 0, 0xd2312b, { rough: 0.4, emissive: 0x4a0808, ei: 0.3, seg: 8 });
    pin.rotation.z = Math.PI / 2;
    reg(hits, pin, "shackle-unmoused");
    holoTag(eye, "hawser eye", 0, 0.3, 0, { css: "#e0873a", w: 0.26 });
    reg(hits, eye, "hawser-eye");
    const overHit = box(g, 0.6, 0.3, 0.4, -0.3, 0.7, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step over the hawser?", -0.5, 1.05, 0.1, { css: "#d2312b", w: 0.44 });
    reg(hits, overHit, "step-over-hawser");

    // ------------------------------------------ heaving line and the quarter
    const hl = group(tug, 0.9, 0.47, -0.55);
    for (let i = 0; i < 4; i++) { const c = torus(hl, 0.14 - i * 0.015, 0.014, 0, 0.02 + i * 0.025, 0, 0x2f8f5a, { rough: 0.85, seg: 6, seg2: 18 }); c.rotation.x = Math.PI / 2; }
    ball(hl, 0.045, 0.2, 0.05, 0.1, 0x1f5f3a, { rough: 0.8, seg: 10, seg2: 8 });
    holoTag(hl, "heaving line", 0, 0.3, 0, { css: "#e0873a", w: 0.26 });
    reg(hits, hl, "heaving-line");
    const hlOut = hose(g, [[0.9, 0.6, -0.55], [0.6, 1.4, -2.0], [0.2, 1.0, -3.5]], 0.012, 0x2f8f5a, { steps: 10, rough: 0.85 });
    hlOut.visible = false;
    const quarter = group(tug, -2.3, 0.47, -0.9);
    for (let i = 0; i < 3; i++) { const c = torus(quarter, 0.12, 0.012, 0, 0.02 + i * 0.02, 0, 0x2f8f5a, { rough: 0.85, seg: 6, seg2: 16 }); c.rotation.x = Math.PI / 2; }
    const quarterHit = box(quarter, 0.5, 0.35, 0.5, 0, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(quarter, "throw off the quarter, wheel turning?", 0.3, 0.6, 0, { css: "#d2312b", w: 0.64 });
    reg(hits, quarterHit, "heaving-line-screw");
    const wheelWash = box(g, 1.3, 0.012, 1.0, -2.3, 0.03, -1.8, 0xcfe8ee, { rough: 0.3, emissive: 0x9fd8e8, ei: 0.3, cast: false });

    // --------------------------------------------------------- the barge
    const barge = group(g, 0.1, 0, -3.8);
    box(barge, 4.6, 0.7, 1.4, 0, 0.3, -0.3, 0x5b4a3a, { rough: 0.8, metal: 0.2 });
    box(barge, 4.6, 0.06, 1.4, 0, 0.68, -0.3, 0x6b5a48, { rough: 0.85 });
    box(barge, 4.6, 0.12, 0.12, 0, 0.72, 0.38, CITY.hiVis, { rough: 0.6 });
    const bitt = group(barge, -0.1, 0.7, 0.15);
    for (const sx of [-0.14, 0.14]) cyl(bitt, 0.07, 0.08, 0.3, sx, 0.15, 0, 0x2b3138, { rough: 0.6, metal: 0.5, seg: 12 });
    const bittRing = torus(bitt, 0.26, 0.012, 0, 0.35, 0, MWTL_ACCENT, { emissive: MWTL_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    bittRing.rotation.x = Math.PI / 2;
    holoTag(bitt, "barge bitt", 0, 0.55, 0, { css: "#e0873a", w: 0.24 });
    reg(hits, bitt, "barge-bitt");
    const bridle = hose(barge, [[-1.4, 0.72, 0.3], [-0.6, 0.78, 0.3], [-0.1, 0.9, 0.15]], 0.02, 0x8a949d, { steps: 8, rough: 0.5, metal: 0.6 });
    void bridle;
    const bargeHand = standingFigure(barge, 1.3, -0.3, { ry: 0.3, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf1f3f4, gloves: true });
    bargeHand.position.y = 0.7;
    holoTag(bargeHand, "barge deckhand", 0, 1.9, 0, { css: "#e0873a", w: 0.34 });
    // Current streamers, shown when the flood sets in.
    const streamers = group(g, 0, 0.03, -2.4);
    for (let i = 0; i < 6; i++) { const s = box(streamers, 1.0, 0.01, 0.05, -2.8 + i * 1.1, 0, (i % 2) * 0.2, 0xcfe8ee, { rough: 0.3, emissive: 0x9fd8e8, ei: 0.5, cast: false }); s.rotation.y = -0.4; }
    streamers.visible = false;

    // ------------------------------------------------- deckhouse and kit
    const planBoard = holoPanel(tug, 0.78, 0.52, -1.35, 1.35, 1.2, (cx, w, h) => {
      cx.fillStyle = "#1a1208"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e0873a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6e2cc"; cx.fillText("VOYAGE & TOW PLAN", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#fbefe2";
      ["Barge: deck cargo, draft per the barge's marks", "Route: harbour to the anchorage, per chart", "Tow length: master's figure for the water",
       "Weather window: per forecast at sailing", "Deck: deckhand 1 aft, engineer on call", "Lost comms: stop, hold, backup handheld"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { ry: 0.9, accent: MWTL_ACCENT });
    reg(hits, planBoard, "voyage-plan");
    const intercom = group(house, 0.62, 1.2, -0.1);
    box(intercom, 0.06, 0.24, 0.16, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const whLamp = ball(intercom, 0.024, 0.035, 0.07, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    holoTag(intercom, "wheelhouse intercom", 0.05, 0.24, 0, { css: "#e0873a", w: 0.4 });
    reg(hits, intercom, "wheelhouse-intercom");
    const radio = instrument(tug, 1.9, 1.02, 1.9, { ry: -0.3, idle: "CH · WORKING", color: 0xe0873a, w: 0.1, d: 0.16 });
    box(tug, 0.36, 0.5, 0.3, 1.9, 0.72, 1.9, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(radio, "deck radio", 0, 0.16, 0, { css: "#e0873a", w: 0.26 });
    reg(hits, radio, "tow-radio");
    const charger = group(tug, -1.35, 1.1, 1.22, 0.9);
    box(charger, 0.2, 0.08, 0.14, 0, 0, 0, 0x15181c, { rough: 0.6 });
    const backup = group(charger, 0, 0.1, 0);
    box(backup, 0.06, 0.18, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const backupScreen = box(backup, 0.045, 0.04, 0.005, 0, 0.04, 0.022, 0x0d1c24, { rough: 0.3, emissive: 0x0d1c24, ei: 0.4 });
    holoTag(charger, "backup handheld", 0, 0.28, 0, { css: "#e0873a", w: 0.32 });
    reg(hits, charger, "backup-radio");
    const rack = group(tug, 2.3, 0.47, 1.9, -0.6);
    cyl(rack, 0.02, 0.02, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.44, 0.03, 0.03, 0, 1.2, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const vest = group(rack, 0.13, 0.96, 0);
    box(vest, 0.24, 0.38, 0.1, 0, 0, 0, 0xf06a2b, { rough: 0.8 });
    box(vest, 0.24, 0.05, 0.11, 0, 0.06, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(rack, "work vest", 0.13, 1.4, 0, { css: "#e0873a", w: 0.24 });
    reg(hits, vest, "tow-vest");
    const knife = group(rack, -0.13, 0.9, 0.02);
    box(knife, 0.04, 0.16, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.6 });
    box(knife, 0.03, 0.1, 0.01, 0, -0.12, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9 });
    holoTag(knife, "line knife", 0, 0.2, 0, { css: "#e0873a", w: 0.22 });
    reg(hits, knife, "line-knife");
    const gearBox = group(tug, 2.1, 0.47, -0.4);
    box(gearBox, 0.6, 0.36, 0.4, 0, 0.18, 0, 0x2f4f6f, { rough: 0.55, metal: 0.3 });
    const lid = box(gearBox, 0.62, 0.04, 0.42, 0, 0.38, 0, 0x3f6f8f, { rough: 0.5, metal: 0.3 });
    lid.rotation.x = -1.1; lid.position.set(0, 0.55, -0.2);
    box(gearBox, 0.14, 0.1, 0.1, 0.12, 0.4, 0.05, 0xc0c6cc, { rough: 0.3, metal: 0.9 });
    holoTag(gearBox, "deck box", 0, 0.8, 0, { css: "#e0873a", w: 0.22 });
    reg(hits, gearBox, "gear-box");
    const chainPosts = group(tug, 0, 0.47, 1.35);
    for (const sx of [-2.4, 2.4]) cyl(chainPosts, 0.03, 0.03, 0.9, sx * 0.5 - 0.3, 0.45, 0, CITY.hiVis, { rough: 0.5, seg: 8 });
    const chainDown = hose(chainPosts, [[-1.5, 0.05, 0], [-0.3, 0.02, 0.05], [0.9, 0.05, 0]], 0.014, 0xe8b02e, { steps: 8, rough: 0.5, metal: 0.6 });
    const chainUp = hose(chainPosts, [[-1.5, 0.8, 0], [-0.3, 0.68, 0], [0.9, 0.8, 0]], 0.014, 0xe8b02e, { steps: 8, rough: 0.5, metal: 0.6 });
    chainUp.visible = false;
    holoTag(chainPosts, "afterdeck chain", -0.3, 1.0, 0, { css: "#e0873a", w: 0.34 });
    reg(hits, chainDown, "danger-chain");
    // Tow hook with its quick release lashed.
    const hook = group(tug, -1.8, 0.47, 0.3);
    box(hook, 0.3, 0.5, 0.3, 0, 0.25, 0, 0x2f4f6f, { rough: 0.55, metal: 0.4 });
    const hookArm = torus(hook, 0.12, 0.03, 0, 0.62, 0, 0xc0c6cc, { rough: 0.35, metal: 0.85, seg: 8, seg2: 16 });
    hookArm.rotation.y = Math.PI / 2;
    const lashing = hose(hook, [[-0.1, 0.55, 0.12], [0, 0.66, 0.16], [0.1, 0.55, 0.12]], 0.01, 0xf1f3f4, { steps: 6, rough: 0.8 });
    void lashing;
    const hookHit = box(hook, 0.4, 0.3, 0.4, 0, 0.6, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(hook, "tow hook release — lashed", 0, 0.95, 0, { css: "#d2312b", w: 0.48 });
    reg(hits, hookHit, "release-lashed");
    const logBoard = holoPanel(tug, 0.6, 0.42, -2.62, 1.3, 1.2, (cx, w, h) => {
      cx.fillStyle = "#1a1208"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e0873a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6e2cc"; cx.fillText("TOWING LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fbefe2";
      ["Tow: —", "Gear: —", "Remarks: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 1.57, accent: MWTL_ACCENT });
    reg(hits, logBoard, "towing-log");

    // ------------------------------------------------------------- crew
    const engineer = standingFigure(g, -1.1, 2.75, { ry: 2.8, cloth: 0x3f4a55, trousers: 0x2b3138, gloves: true });
    engineer.position.y = 0.47;
    holoTag(engineer, "engineer", 0, 1.9, 0, { css: "#e0873a", w: 0.22 });

    const waterTex = water.material.map;
    const bargeHome = barge.position.clone();

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.8, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "gear-walk") { chafe.material = mat(0xe8dcb8, { rough: 0.85 }); pin.material = mat(0xc0c6cc, { rough: 0.3, metal: 0.9 }); }
        if (step.id === "heaving-line") hlOut.visible = true;
        if (step.id === "pass-eye") { eye.visible = false; hawserDeck.visible = false; hawserOut.visible = true; hlOut.visible = false; }
        if (step.id === "gob-and-roller") { rust.material = mat(0x5b6771, { rough: 0.45, metal: 0.7 }); gobEye.material = mat(0x3f6f8f, { rough: 0.8 }); }
        if (step.id === "chain-off") { chainDown.visible = false; chainUp.visible = true; }
        if (step.id === "stow-gear") { lid.rotation.x = 0; lid.position.set(0, 0.38, 0); }
        if (step.id === "towing-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1a1208"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#f6e2cc"; cx.fillText("TOWING LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ea";
            ["Tow: made up · master's length out", "Gear: chafe, shackle, gob eye, roller", "Remarks: flood set · primary radio lost"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") whLamp.material = mat(0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.2 });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "current-set-on-barge") { streamers.visible = true; barge.position.set(bargeHome.x + 0.5, 0, bargeHome.z + 0.5); barge.rotation.y = 0.12; }
        if (it.id === "comms-lost-payout") { whLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4 }); repaint(radio.userData.screen, signFace("NO SIGNAL", { bg: "#240c0c", accent: "#f0645b", fg: "#ffd9d4", scale: 0.55 })); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "current-set-on-barge") { barge.position.copy(bargeHome); barge.rotation.y = 0; streamers.rotation.y = 0.3; }
        if (it.id === "comms-lost-payout") { whLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); backup.position.y = 0.3; backupScreen.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.005; waterTex.offset.y = t * 0.006; }
        if (session?.turn && step?.id === "set-brake") brakeWheel.rotation.x = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-load") needle.rotation.z = -1.2 + gg.t * 2.4;
        if (step?.id === "pay-out" && session.holding) { drum.rotation.x += (dt ?? 0.016) * 2 * (session.track?.v ?? 0); leverArm.rotation.x = -0.5 * (session.track?.v ?? 0); }
        if (streamers.visible) streamers.position.x = ((t * 0.3) % 1.1) - 0.55;
        wheelWash.visible = step?.id !== "heaving-line";
        void CITY; void decal; void paperFace;
      },
    };
  },
};
