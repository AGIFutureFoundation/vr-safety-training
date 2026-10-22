import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, deckPlateFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ferry Deckhand & Passenger Safety VR — Maritime & Ports, the
// marine and water pack of the Bay Area Union Edition.
//
// A passenger ferry lying at a terminal float, generic and unnamed: the main
// deck with its cabin bulkhead, the gangway, the bow line on its bitt and a
// capstan forward, the life ring on the rail and the lifejacket locker aft.
// The learner is the Inlandboatmen's Union deckhand on the boarding and the
// landing; the master is in the wheelhouse on the intercom and the engineer
// is below. Nothing here names a real route, vessel or terminal, and the
// passenger figure on the certificate of inspection is read as "the COI's
// figure" rather than invented.

const MWFD_ACCENT = 0x2fa3c4;

export const SIM_MW_FERRY_DECKHAND_AND_PASSENGER_SAFETY = {
  id: "mw-ferry-deckhand-and-passenger-safety",
  index: "230",
  domain: "Maritime & Ports",
  trade: "Inlandboatmen's Union of the ILWU deckhand on a Bay passenger ferry, with the MEBA licensed engineer below and SIU-trained ratings in the relief crew",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "wind",
  certification: "Inlandboatmen's Union of the ILWU deck department practice; MEBA engineering watch; SIU Paul Hall Center unlicensed training for relief ratings; IMO STCW basic safety training and crowd management for passenger-ship crew; IMO SOLAS muster, station bill and life-saving appliance requirements as the vessel's own certificate of inspection applies them; IMO MARPOL for anything that goes over the side",
  name: "Ferry Deckhand & Passenger Safety",
  title: simTitle("Ferry Deckhand & Passenger Safety"),
  tagline: "A passenger ferry at the float: the station bill read, vest and radio on, the deck walked before boarding, the gangway landed, the count held against the certificate while a passenger goes in between the float and the hull, the lines let go, the life-saving gear walked, the bow line tended on the capstan through a current shift, the passengers landed in order and the run logged",
  accent: MWFD_ACCENT,
  accentCss: "#2fa3c4",
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "every-soul-counted", name: "Every Soul Counted", note: "The count held against the certificate, the passenger overboard answered with the ring, and the gangway never crossed before it was landed" },

  supportLine: "your union hall's member assistance programme — the Inlandboatmen's Union, MEBA or SIU — with the employer's employee assistance line behind it",

  game: system({
    name: "Ferry Deck",
    currency: "SOUL",
    ranks: ["Ordinary Deckhand", "Deckhand", "Lead Deckhand", "Bosun", "Ferry Deck Certified"],
    badges: [
      { id: "bill-before-boarding", name: "Bill Before Boarding", note: "The station bill read before the first passenger came near the gangway", test: AWARD.stepClean("station-bill") },
      { id: "counted-true", name: "Counted True", note: "Count committed against the certificate inside the band, first time", test: AWARD.precise(0.7) },
      { id: "no-shortcuts-on-deck", name: "No Shortcuts On Deck", note: "Never across the gap, never in the bight, never a wedged watertight door, never a line near the screw", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections from the station bill to the log", test: AWARD.clean },
      { id: "line-held", name: "Line Held", note: "The bow line held in band on the capstan the whole landing", test: AWARD.unbroken },
      { id: "on-schedule", name: "On Schedule", note: "Run logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "stern-line-screw": "You threw the stern line off and let its tail go over the side with the master already putting the wheel ahead. A slack line in the water aft is drawn straight into the wash, and a line round the screw stops the shaft, strips the gear and leaves a ferry full of passengers without propulsion alongside a float — the line comes aboard hand over hand, and the wheelhouse hears 'line clear aft' before the screw turns.",
    "gap-jump": "You stepped across the gap to the float before the gangway had landed. The gap between a ferry's rubbing strake and a float opens and closes with every surge, and a foot that misses goes into cold water between two moving masses that can crush as well as drown — the gangway exists so nobody, crew included, ever crosses that gap any other way.",
    "bight-at-bitt": "You stood inside the bight of the bow line between the bitt and the fairlead. When the capstan takes the line up, the bight closes at the speed of the drum on whatever is inside it, and a line under load that parts whips back along its own lead — the deckhand works the line from outside every loop it makes, with the loop in sight.",
    "wt-door-wedged": "You wedged the watertight door open to make the passenger flow easier. A watertight door is part of the ferry's subdivision, the thing that keeps flooding in one compartment out of the next, and the station bill and the vessel's certificate assume it is closed whenever it is not actually being passed through. A wedge makes it a hole in the bulkhead at exactly the moment nobody is watching it.",
  },

  lateNotes: {
    "passenger-counter": "Boarding starts with the gangway landed and the deck walked — the counter comes out once there is a safe way aboard to count people across.",
    "bow-line-bitt": "The bow line comes off the bitt on the master's order once the count is reported and the gate is chained — not while passengers are still crossing.",
    "deck-log": "The run is logged once the passengers are ashore and counted off — the log records what happened, so it comes last.",
  },

  steps: [
    {
      id: "station-bill", kind: "select", target: "station-bill",
      title: "Read the station bill before the boarding",
      cue: "Read the station bill on the cabin bulkhead: your muster station, your duty in a fire, in abandon ship and in person overboard, and who works the rescue gear.",
      why: "The station bill is how a passenger ferry turns a crew into an emergency organisation without a meeting: every name has a place and a job for fire, abandon ship and person overboard, and IMO SOLAS builds its muster requirements on each crew member knowing that job before the vessel carries anyone. Reading it at the start of the watch — not during the alarm — is what makes the first thirty seconds of an emergency a drill instead of a discussion.",
    },
    {
      id: "vest-and-radio", kind: "sequence", anyOrder: true,
      targets: ["work-vest", "deck-radio"],
      itemNames: { "work-vest": "work vest", "deck-radio": "deck radio on the working channel" },
      title: "Put on the work vest and check the deck radio",
      cue: "Work vest on and fastened for the edge of the deck, and the deck radio checked with the wheelhouse on the working channel.",
      why: "A deckhand's job puts them at the edge of the deck at every landing, handling lines and a gangway over water, and the work vest is what keeps a fall between the hull and the float survivable in cold bay water. The radio check is the other half: the master in the wheelhouse cannot see the gangway or the lines from the controls, and the deckhand's voice on the working channel is the only way the wheelhouse knows the deck is ready — a radio that has not been checked is a radio found dead when it is needed.",
    },
    {
      id: "deck-walk", kind: "find", noHint: true,
      targets: ["loose-mat", "blocked-exit"],
      itemNames: { "loose-mat": "curled non-slip mat at the gangway head", "blocked-exit": "luggage cart parked across the aft emergency exit" },
      itemNotes: {
        "loose-mat": "The non-slip mat at the head of the gangway has curled up at one corner — every passenger coming aboard steps onto it with their eyes on the deck ahead, and a curled mat on a wet deck is the commonest injury a ferry deck produces.",
        "blocked-exit": "A luggage cart has been left across the aft emergency exit. The exits are part of the vessel's evacuation plan, marked and kept clear because a full cabin empties toward them in the dark; one cart across a door turns an exit into a crush point.",
      },
      title: "Walk the passenger deck before anyone boards",
      cue: "Walk the deck from the gangway head to the aft exit: trip hazards, wet patches, anything across an exit or a lifejacket locker.",
      why: "Passengers board looking for a seat, not at the deck, and many of them are elderly, carrying children or wheeling bags; a deck that is safe for a crew who know it is not the same as a deck that is safe for three hundred strangers. The walk is done before the gangway is landed because once passengers are aboard there is no clearing an exit or fixing a mat without working against the crowd.",
    },
    {
      id: "land-gangway", kind: "drag", target: "gangway",
      title: "Land the gangway on the float",
      cue: "Bring the gangway across and land it on the float's rollers with its side chains up — the ferry end on its hinge, the float end free to ride.",
      why: "The gangway is the only crossing between two things that move independently: the ferry surges and rolls on her lines while the float rides the tide. It lands on rollers at the float end so the ferry's movement slides it instead of dragging it off, and its chains or rails go up before anyone sets foot on it. A gangway that is pinned at both ends or landed short is the thing that throws a passenger into the gap on the first surge.",
      drag: { to: "gangway-landing", radius: 0.5, missNote: "Not landed — the gangway's float end has to sit on the rollers, clear of the float's edge, before anyone crosses." },
    },
    {
      id: "boarding-count", kind: "hold", target: "passenger-counter", seconds: 5,
      title: "Hold the boarding watch and count every passenger aboard",
      cue: "Stand at the gangway head with the counter: one click per person, children and infants included, eyes on the gangway the whole time.",
      why: "The number on the counter is the number the master reports, the number the vessel's certificate of inspection is measured against, and the number a search starts from if anyone ends up in the water. It is held without a break because the moment the deckhand looks away is the moment two people cross on one click — and a count that is wrong by one is a person who does not exist on paper.",
      holdBreakNote: "The watch broke with passengers still crossing — the count is only good if every person on the gangway was seen. Start the count again from the gangway head.",
    },
    {
      id: "coi-check", kind: "gauge", target: "coi-placard",
      title: "Read the count against the certificate of inspection",
      cue: "Commit the count against the passenger figure on the certificate of inspection posted at the gangway head — inside the certificate, never over it.",
      why: "The certificate of inspection sets how many people this ferry can carry, because that is the number her lifesaving gear, her stability and her crewing were measured against — one more person than the figure is one more person without a seat in a liferaft. The deckhand closes the gate at the certificate's figure whatever the queue says, and the count is committed against the posted certificate rather than against memory.",
      gauge: { label: "COUNT vs COI", speed: 0.72, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "count not complete" : t <= 0.58 ? "inside the COI figure" : "over the COI — close the gate"), missNote: "Outside the band — the count has to be complete and inside the certificate's figure before the gate closes." },
    },
    {
      id: "all-aboard", kind: "select", target: "wheelhouse-intercom",
      title: "Chain the gate and report the count to the wheelhouse",
      cue: "Gate chained across, and on the intercom: 'all aboard, count reported, gangway clear to come in'.",
      why: "The master cannot see the gangway from the controls and will not take the ferry off the float until the deck says the gangway is clear and the count is in. The report is a closed loop — the deckhand says it, the master repeats it back — because 'clear' misheard over an engine is the difference between a gangway coming in empty and one coming in with a passenger still on it.",
    },
    {
      id: "let-go-bow", kind: "turn", target: "bow-line-bitt",
      title: "Take the bow line's turns off the bitt on the master's order",
      cue: "On 'let go forward', take the figure-of-eight turns off the bitt one at a time, keeping the last turn until the line is slack, then bring it aboard.",
      why: "A mooring line under load on a bitt holds the vessel's surge with friction, and taking the turns off in order keeps that friction under the deckhand's control: the last turn comes off only when the line has gone slack, so the line cannot run out through bare hands. It comes off on the master's order and not before, because the master is working the engines against that line to hold the ferry while the gangway comes in.",
      turn: { turns: 1.25, label: "BITT TURNS", readout: (t) => (t < 0.3 ? "turns on" : t < 0.9 ? "coming off — last turn held" : "line slack — aboard") },
    },
    {
      id: "lsa-round", kind: "find", noHint: true,
      targets: ["lifejacket-seal", "extinguisher-tag"],
      itemNames: { "lifejacket-seal": "broken seal on the lifejacket locker", "extinguisher-tag": "extinguisher with its gauge needle in the red" },
      itemNotes: {
        "lifejacket-seal": "The seal on the aft lifejacket locker is broken and the door is ajar — someone has been into it, and a locker that has been opened is a locker whose count of adult and child lifejackets is no longer known.",
        "extinguisher-tag": "The extinguisher by the cabin door reads in the red on its gauge: it has lost pressure and will discharge a dribble when somebody pulls the pin in a galley fire.",
      },
      title: "Walk the life-saving and fire gear underway",
      cue: "Walk the lifejacket lockers, the ring buoys and the extinguishers on the deck round: seals intact, counts right, gauges in the green.",
      why: "The life-saving appliances on a passenger ferry are counted against the number of people she is certificated to carry, and a broken seal or a discharged extinguisher is found on a round like this or found in the emergency it was carried for. IMO SOLAS puts the gear aboard and the crew's inspection keeps it ready; the round is walked underway because that is when the passengers are aboard and the gear is what stands between them and the water.",
    },
    {
      id: "capstan-landing", kind: "track", target: "capstan-control", seconds: 6,
      title: "Tend the bow line on the capstan as the master lands her",
      cue: "Hold the capstan's heave steady as the master works the ferry alongside the next float — enough to bring the bow in, never snatching the line.",
      why: "Landing a ferry is the master's engines and the deckhand's capstan working one line between them: too little heave and the bow falls off the float with the tide, too much and the line snatches, the stored stretch in it jumps, and the fitting or the line is the thing that gives. The heave is held in band and watched rather than wound on, because the master's next move depends on the line doing what the deckhand says it is doing.",
      track: { start: 0.15, green: [0.42, 0.6], rise: 0.58, fall: 0.46, drift: 0.12, label: "CAPSTAN", readout: (v) => (v < 0.42 ? "line slack — bow falling off" : v > 0.6 ? "snatching — ease the heave" : "steady heave — bow coming in") },
      holdBreakNote: "The heave broke out of band — the bow line either went slack or snatched. Bring the capstan back to a steady heave and hold it there.",
    },
    {
      id: "land-passengers", kind: "sequence",
      targets: ["gangway-landing", "gate-chain", "passenger-counter"],
      itemNames: { "gangway-landing": "gangway landed on the float's rollers", "gate-chain": "gate chain off", "passenger-counter": "passengers counted off" },
      title: "Land the passengers in order",
      cue: "Gangway landed on the rollers first, then the gate chain off, then the passengers counted ashore to the same number that came aboard.",
      why: "The order is the safety: a gate opened before the gangway has landed invites the first impatient passenger into the gap, and a count taken off is what proves the number that boarded is the number that left — the only way a crew knows nobody is still aboard, asleep in the cabin or gone over the side unseen. A count that does not match is reported to the master before the ferry leaves the float again.",
      outOfOrderNote: "Out of order — the gangway lands before the chain comes off, and the count is taken as they cross, never before the gate is open.",
    },
    {
      id: "deck-log", kind: "select", target: "deck-log",
      title: "Enter the run in the deck log",
      cue: "Log the count aboard and ashore, the person in the water and the recovery, the broken locker seal and the discharged extinguisher, and the current shift at the landing.",
      why: "The deck log is the vessel's own record, and it is what the master signs, the company reviews and an inspector reads after anything goes wrong. A person in the water, a discharged extinguisher and a locker seal broken are each a report and a repair; written now, at the float, they are facts with times on them, and the next crew starts from the log rather than from what somebody remembers at the end of a long day.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-board",
      title: "Check in with the crew before the next run",
      cue: "Crew huddle at the crew board: the recovery debriefed, who needs relief, and how everyone is after pulling a passenger out of the water.",
      why: "A person-overboard recovery is over in a minute and stays with a crew for much longer, and the Inlandboatmen's Union practice is to say out loud how it went before the next boarding rather than to carry it silently onto the next run. The check-in is also operational — who is wet, who is hurt, who needs relief before the gangway goes out again — and the member assistance line is named because saying it costs nothing.",
    },
  ],

  interrupts: [
    {
      id: "passenger-overboard",
      kind: "Passenger overboard between the float and the hull",
      after: "boarding-count", delay: 2, seconds: 14,
      alert: "A passenger has slipped off the float's edge and gone into the water between the float and the ferry's hull — they are in the gap and the ferry is surging on her lines.",
      cue: "Throw the life ring from the rail to the person in the water and shout the alarm — keep eyes on them and point.",
      target: "life-ring",
      why: "A person in the water between a float and a hull is in the most dangerous gap on the waterfront: cold water takes the grip out of the hands in minutes and the hull can close the gap on the next surge. The ring buoy is on the rail for exactly this and it goes to the person immediately, with the alarm raised and a finger pointing so the wheelhouse holds the ferry off rather than landing her on them.",
      missNote: "The passenger stayed in the gap with nothing to hold, the ferry surged back toward the float, and the boarding count carried on as if the gangway were the only thing on deck that mattered.",
      wrongNote: "The life ring — the person is in the water now, and the ring on the rail is the one thing on deck that reaches them immediately.",
    },
    {
      id: "current-shift-landing",
      kind: "Current shift at the landing",
      after: "capstan-landing", delay: 2, seconds: 14,
      alert: "The ebb has set in hard across the float — the bow is being carried off and the stern is swinging toward the next float's piles.",
      cue: "Call the master on the deck radio: tell the wheelhouse the set, where the bow is and what the line is doing.",
      target: "deck-radio",
      why: "The master in the wheelhouse feels the ferry move but cannot see the bow line or how far the stern is from the piles; the deckhand forward can. A current shift at a landing is answered with information first — the set, the distance and the state of the line on the radio — so the master can use the engines, rather than the deckhand trying to win against the tide with a capstan.",
      missNote: "The ebb carried the bow off the float with the capstan still heaving, the line came bar-tight, and the stern closed on the next float's piles before anyone told the wheelhouse what the deck could see.",
      wrongNote: "The deck radio — the capstan cannot beat the tide, and the master needs to hear what the bow is doing to answer it with the engines.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, MWFD_ACCENT);

    // ----------------------------------------------------- water and the float
    const water = box(g, 7.2, 0.02, 6.2, 0, 0.012, -0.9, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x86b0c0 });
    const float = box(g, 6.4, 0.2, 2.0, 0, 0.1, 1.55, 0xffffff, { rough: 0.9 });
    float.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#2b3238", base2: "#232a30", seam: "rgba(0,0,0,0.45)" }), { repeat: 5, px: 512 }),
      { rough: 0.9, metal: 0.03, color: 0xbcc4cb },
    );
    // Float edge kerb in safety yellow, and the float's own fenders.
    box(g, 6.4, 0.06, 0.1, 0, 0.23, 0.6, CITY.hiVis, { rough: 0.7 });
    for (let i = 0; i < 4; i++) cyl(g, 0.1, 0.1, 0.5, -2.4 + i * 1.6, 0.12, 0.52, 0x15181c, { rough: 0.85, seg: 10 }).rotation.z = Math.PI / 2;
    for (const x of [-3.0, 3.0]) cyl(g, 0.16, 0.16, 2.2, x, 1.0, 0.55, 0x4a4238, { rough: 0.95, seg: 12 });

    // --------------------------------------------------------- the ferry deck
    const ferry = group(g, 0, 0, 0);
    const deck = box(ferry, 6.6, 0.14, 2.7, 0, 0.36, -1.6, 0xffffff, { rough: 0.8 });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3b4550", base2: "#323b45" }), { repeat: 4, px: 512 }), { rough: 0.8, metal: 0.35, color: 0xc4ccd4 });
    // Hull side below the deck, rubbing strake, white superstructure.
    box(ferry, 6.6, 0.34, 0.08, 0, 0.16, -0.24, 0xe8ecef, { rough: 0.6, cast: false });
    box(ferry, 6.6, 0.08, 0.14, 0, 0.3, -0.19, 0x1b1e22, { rough: 0.8 });
    box(ferry, 6.6, 0.08, 0.04, 0, 0.05, -0.23, 0x2b5a8a, { rough: 0.6, cast: false });
    const bulk = box(ferry, 6.6, 1.7, 0.12, 0, 1.28, -2.9, 0xf1f3f4, { rough: 0.55 });
    void bulk;
    for (let i = 0; i < 5; i++) box(ferry, 0.8, 0.46, 0.02, -2.4 + i * 1.2, 1.6, -2.83, 0x274a5f, { rough: 0.2, metal: 0.3, cast: false });
    box(ferry, 6.6, 0.06, 0.14, 0, 2.16, -2.88, 0x2fa3c4, { rough: 0.5, emissive: 0x2fa3c4, ei: 0.25 });
    // Rails along the outboard edge with a gate at the gangway.
    const railMat = { rough: 0.35, metal: 0.8 };
    for (const [x0, x1] of [[-3.3, -0.55], [0.55, 3.3]]) {
      const len = x1 - x0, cx = (x0 + x1) / 2;
      box(ferry, len, 0.04, 0.04, cx, 1.35, -0.34, 0xc9d0d6, railMat);
      box(ferry, len, 0.03, 0.03, cx, 0.9, -0.34, 0xc9d0d6, railMat);
      for (let k = 0; k <= 3; k++) cyl(ferry, 0.018, 0.018, 0.92, x0 + (len * k) / 3, 0.89, -0.34, 0xc9d0d6, { ...railMat, seg: 8 });
    }
    const gateChain = hose(ferry, [[-0.55, 1.1, -0.34], [0, 0.98, -0.34], [0.55, 1.1, -0.34]], 0.014, 0xe8b02e, { steps: 8, rough: 0.5, metal: 0.6 });
    holoTag(ferry, "gate chain", 0, 1.3, -0.3, { css: "#2fa3c4", w: 0.26 });
    reg(hits, gateChain, "gate-chain");

    // ---------------------------------------------------------------- gangway
    const gangway = group(g, 0, 0.44, -0.2);
    const gwDeck = box(gangway, 0.9, 0.05, 1.3, 0, 0, 0.6, 0x9aa4ad, { rough: 0.5, metal: 0.6 });
    for (let i = 0; i < 6; i++) box(gangway, 0.86, 0.012, 0.03, 0, 0.03, 0.05 + i * 0.22, 0x5b6771, { rough: 0.7 });
    for (const sx of [-1, 1]) {
      box(gangway, 0.03, 0.03, 1.3, sx * 0.45, 0.5, 0.6, 0xc9d0d6, railMat);
      for (let k = 0; k < 3; k++) cyl(gangway, 0.014, 0.014, 0.5, sx * 0.45, 0.25, 0.1 + k * 0.5, 0xc9d0d6, { ...railMat, seg: 6 });
    }
    cyl(gangway, 0.05, 0.05, 0.9, 0, -0.02, 1.25, 0x3a4148, { rough: 0.6, metal: 0.5, seg: 10 }).rotation.z = Math.PI / 2;
    gangway.rotation.x = 0.35;
    gangway.position.set(0, 0.95, -0.9);
    void gwDeck;
    holoTag(gangway, "gangway — land it", 0, 0.75, 0.6, { css: "#2fa3c4", w: 0.4 });
    reg(hits, gangway, "gangway");
    const landing = torus(g, 0.28, 0.012, 0, 0.215, 1.0, MWFD_ACCENT, { emissive: MWFD_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    landing.rotation.x = Math.PI / 2;
    for (const sx of [-0.3, 0.3]) cyl(g, 0.04, 0.04, 0.3, sx, 0.23, 1.02, 0x2b3138, { rough: 0.5, metal: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    reg(hits, landing, "gangway-landing");
    const gapHit = box(g, 1.3, 0.3, 0.5, -1.4, 0.35, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step across the gap?", -1.4, 0.7, 0.35, { css: "#d2312b", w: 0.42 });
    reg(hits, gapHit, "gap-jump");

    // -------------------------------------------------- bow line, bitt, capstan
    const bitt = group(ferry, 1.9, 0.43, -0.75);
    box(bitt, 0.5, 0.06, 0.22, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.5 });
    for (const sx of [-0.15, 0.15]) cyl(bitt, 0.06, 0.07, 0.3, sx, 0.17, 0, 0x2b3138, { rough: 0.6, metal: 0.5, seg: 12 });
    const turns = group(bitt, 0, 0.18, 0);
    for (let i = 0; i < 3; i++) {
      const t8 = torus(turns, 0.13, 0.018, 0, -0.06 + i * 0.05, 0, 0xe8dcb8, { rough: 0.85, seg: 6, seg2: 20 });
      t8.rotation.x = Math.PI / 2; t8.scale.set(1.4, 0.7, 1);
    }
    holoTag(bitt, "bow line on the bitt", 0, 0.52, 0, { css: "#2fa3c4", w: 0.4 });
    reg(hits, bitt, "bow-line-bitt");
    const lineTaut = hose(g, [[1.9, 0.62, -0.75], [2.1, 0.55, -0.34], [2.4, 0.3, 0.3], [2.6, 0.24, 0.9]], 0.022, 0xe8dcb8, { steps: 10, rough: 0.85 });
    const lineSlack = hose(g, [[1.9, 0.62, -0.75], [2.1, 0.45, -0.34], [2.35, 0.05, 0.2], [2.6, 0.24, 0.9]], 0.022, 0xe8dcb8, { steps: 10, rough: 0.85 });
    lineSlack.visible = false;
    const cleat = group(g, 2.6, 0.2, 0.95);
    box(cleat, 0.34, 0.05, 0.1, 0, 0.05, 0, 0x2b3138, { rough: 0.6, metal: 0.5 });
    cyl(cleat, 0.03, 0.03, 0.08, 0, 0.02, 0, 0x2b3138, { rough: 0.6, metal: 0.5, seg: 8 });
    const bightHit = box(g, 0.5, 0.4, 0.4, 2.15, 0.7, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand in the bight?", 2.15, 1.0, 0.0, { css: "#d2312b", w: 0.4 });
    reg(hits, bightHit, "bight-at-bitt");
    const capstan = group(ferry, 2.7, 0.43, -1.6);
    cyl(capstan, 0.2, 0.24, 0.12, 0, 0.06, 0, 0x3a4148, { rough: 0.6, metal: 0.5, seg: 16 });
    const drum = cyl(capstan, 0.13, 0.16, 0.34, 0, 0.29, 0, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 16 });
    const pedal = group(capstan, -0.35, 0, 0.25);
    box(pedal, 0.16, 0.05, 0.22, 0, 0.03, 0, 0xe8b02e, { rough: 0.6 });
    box(pedal, 0.14, 0.02, 0.18, 0, 0.065, 0, 0x2b3138, { rough: 0.8 });
    holoTag(capstan, "capstan — heave", -0.1, 0.72, 0.1, { css: "#2fa3c4", w: 0.34 });
    reg(hits, pedal, "capstan-control");

    // ---------------------------------------------- stern line and the screw
    const stern = group(ferry, -3.0, 0.43, -0.7);
    for (let i = 0; i < 4; i++) {
      const c = torus(stern, 0.16 - i * 0.02, 0.02, 0, 0.02 + i * 0.035, 0, 0xd8cfa8, { rough: 0.85, seg: 6, seg2: 20 });
      c.rotation.x = Math.PI / 2;
    }
    hose(stern, [[0.1, 0.12, 0], [0.25, 0.3, 0.3], [0.1, 0.0, 0.7]], 0.02, 0xd8cfa8, { steps: 8, rough: 0.85 });
    const sternHit = box(stern, 0.5, 0.35, 0.5, 0, 0.18, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(stern, "stern line over the side — screw turning?", 0, 0.6, 0.2, { css: "#d2312b", w: 0.68 });
    reg(hits, sternHit, "stern-line-screw");
    const wash = box(g, 1.6, 0.012, 1.2, -3.1, 0.03, 0.2, 0xcfe8ee, { rough: 0.3, emissive: 0x9fd8e8, ei: 0.25, cast: false });

    // ------------------------------------------------ bulkhead-mounted gear
    const bill = holoPanel(ferry, 0.8, 0.56, -1.95, 1.45, -2.82, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#2fa3c4"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#cfeef2"; cx.fillText("STATION BILL — DECK", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Muster: main deck, aft, by the lifejacket lockers", "Fire: deckhand 1 to the hose station, cabin cleared", "Abandon ship: rafts forward, passengers counted off",
       "Person overboard: ring buoy, shout, point — wheelhouse", "Rescue gear: deckhand 2 and the mate", "Watertight doors closed except in passage"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { accent: MWFD_ACCENT });
    reg(hits, bill, "station-bill");
    const intercom = group(ferry, 0.95, 1.35, -2.82);
    box(intercom, 0.18, 0.26, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const icLamp = ball(intercom, 0.025, 0, 0.08, 0.035, 0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
    box(intercom, 0.1, 0.06, 0.03, 0, -0.06, 0.04, 0x15181c, { rough: 0.7 });
    holoTag(intercom, "wheelhouse intercom", 0, 0.24, 0.04, { css: "#2fa3c4", w: 0.4 });
    reg(hits, intercom, "wheelhouse-intercom");
    const panel = group(ferry, 2.05, 1.4, -2.82);
    box(panel, 0.34, 0.3, 0.06, 0, 0, 0, 0xb8402f, { rough: 0.5 });
    for (let i = 0; i < 4; i++) ball(panel, 0.018, -0.1 + i * 0.066, 0.06, 0.035, i === 3 ? 0xf2c14b : 0x59c97b, { emissive: i === 3 ? 0xf2c14b : 0x59c97b, ei: 1.0, seg: 8, seg2: 6 });
    decal(panel, 0.26, 0.1, 0, -0.06, 0.032, signFace("FIRE — ALL ZONES", { bg: "#2a0e0a", accent: "#f0645b", fg: "#ffe3de", scale: 0.5 }), { px: 192, glow: true, ei: 0.5 });
    // Watertight door with a wedge in it.
    const wtd = group(ferry, -0.6, 0.43, -2.82);
    box(wtd, 0.76, 1.5, 0.05, 0, 0.75, 0, 0x8b98a5, { rough: 0.5, metal: 0.5 });
    const leaf = group(wtd, 0.36, 0, 0.02);
    box(leaf, 0.7, 1.42, 0.06, -0.35, 0.73, 0, 0xa7b1ba, { rough: 0.45, metal: 0.55 });
    for (let i = 0; i < 4; i++) box(leaf, 0.08, 0.04, 0.05, -0.64, 0.25 + i * 0.35, 0.05, 0xe8b02e, { rough: 0.5, metal: 0.5 });
    leaf.rotation.y = -1.1;
    const wedge = box(wtd, 0.14, 0.06, 0.2, 0.25, 0.03, 0.4, 0x8a5a2b, { rough: 0.9 });
    decal(wtd, 0.36, 0.1, 0, 1.62, 0.03, signFace("WATERTIGHT DOOR — KEEP CLOSED", { bg: "#0d1c24", accent: "#f2c14b", fg: "#eaf6fb", scale: 0.45 }), { px: 256 });
    const wtdHit = box(wtd, 0.5, 0.35, 0.5, 0.25, 0.2, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(wtd, "wedge the door open?", 0.25, 0.55, 0.45, { css: "#d2312b", w: 0.42 });
    reg(hits, wtdHit, "wt-door-wedged");
    void wedge;

    // ------------------------------------------------- life-saving appliances
    const ring = group(ferry, -1.25, 1.0, -0.3);
    const ringBody = torus(ring, 0.2, 0.05, 0, 0, 0, 0xf06a2b, { rough: 0.7, seg: 10, seg2: 24 });
    for (let i = 0; i < 4; i++) { const b = box(ring, 0.06, 0.11, 0.11, Math.cos(i * Math.PI / 2) * 0.2, Math.sin(i * Math.PI / 2) * 0.2, 0, 0xf1f3f4, { rough: 0.6 }); b.rotation.z = i * Math.PI / 2; }
    void ringBody;
    holoTag(ring, "ring buoy", 0, 0.34, 0, { css: "#2fa3c4", w: 0.26 });
    reg(hits, ring, "life-ring");
    const locker = group(ferry, -2.4, 0.43, -2.3);
    box(locker, 0.9, 0.7, 0.5, 0, 0.35, 0, 0xf06a2b, { rough: 0.6 });
    const lockerDoor = box(locker, 0.86, 0.66, 0.03, 0.05, 0.35, 0.28, 0xe25a1c, { rough: 0.55 });
    lockerDoor.rotation.y = -0.25;
    decal(locker, 0.5, 0.12, 0, 0.55, 0.3, signFace("LIFEJACKETS · ADULT / CHILD", { bg: "#f1f3f4", accent: "#f06a2b", fg: "#1b1e22", scale: 0.45 }), { px: 256 });
    const seal = box(locker, 0.05, 0.03, 0.02, 0.42, 0.3, 0.3, 0xd2312b, { rough: 0.5, emissive: 0x6a1010, ei: 0.4 });
    reg(hits, seal, "lifejacket-seal");
    const ext = group(ferry, 0.45, 0.43, -2.7);
    cyl(ext, 0.08, 0.08, 0.5, 0, 0.3, 0, 0xd2312b, { rough: 0.45, seg: 14 });
    cyl(ext, 0.03, 0.03, 0.08, 0, 0.58, 0, 0x1b1e22, { rough: 0.5, seg: 8 });
    const extGauge = cyl(ext, 0.03, 0.03, 0.02, 0.06, 0.6, 0.02, 0xf2ae14, { rough: 0.3, emissive: 0x7a2a08, ei: 0.5, seg: 12 });
    extGauge.rotation.x = Math.PI / 2;
    reg(hits, ext, "extinguisher-tag");

    // ------------------------------------------------ boarding and the deck
    const counter = instrument(g, -0.72, 1.02, 0.95, { ry: 0.3, idle: "COUNT 0", color: 0x2fa3c4, w: 0.1, d: 0.16 });
    const stand = cyl(g, 0.03, 0.04, 0.8, -0.72, 0.6, 0.95, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    void stand;
    holoTag(counter, "passenger counter", 0, 0.16, 0, { css: "#2fa3c4", w: 0.36 });
    reg(hits, counter, "passenger-counter");
    const coi = decal(g, 0.36, 0.26, 0.72, 1.2, 0.95, paperFace("CERTIFICATE OF INSPECTION", ["Passengers: per certificate", "Crew: per manning", "Lifesaving: per certificate"], { bg: "#efe6cc", band: "#2fa3c4" }), { px: 256 });
    coi.rotation.y = -0.3;
    cyl(g, 0.03, 0.04, 1.0, 0.72, 0.6, 0.97, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    holoTag(g, "COI — passenger figure", 0.72, 1.45, 0.95, { css: "#2fa3c4", w: 0.44 });
    reg(hits, coi, "coi-placard");
    const mat1 = box(ferry, 0.9, 0.012, 0.6, 0.0, 0.44, -0.7, 0x1b1e22, { rough: 0.95 });
    const curl = box(ferry, 0.22, 0.012, 0.18, 0.36, 0.49, -0.46, 0x1b1e22, { rough: 0.95 });
    curl.rotation.x = -0.5;
    void mat1;
    reg(hits, curl, "loose-mat");
    const cart = group(ferry, -2.9, 0.43, -1.6, 0.4);
    box(cart, 0.5, 0.05, 0.8, 0, 0.18, 0, 0x5b6771, { rough: 0.5, metal: 0.6 });
    box(cart, 0.44, 0.34, 0.5, 0, 0.4, 0.05, 0x3f5f7a, { rough: 0.8 });
    box(cart, 0.3, 0.24, 0.3, 0.05, 0.69, -0.1, 0x7a3f2f, { rough: 0.8 });
    for (const [wx, wz] of [[-0.2, -0.3], [0.2, -0.3], [-0.2, 0.3], [0.2, 0.3]]) cyl(cart, 0.06, 0.06, 0.04, wx, 0.07, wz, 0x15181c, { rough: 0.85, seg: 10 }).rotation.z = Math.PI / 2;
    const exitSign = decal(ferry, 0.36, 0.14, -2.9, 1.95, -2.83, signFace("EMERGENCY EXIT", { bg: "#0a3d1f", accent: "#59c97b", fg: "#eaffef", scale: 0.5 }), { px: 256, glow: true, ei: 0.8 });
    void exitSign;
    reg(hits, cart, "blocked-exit");

    // ---------------------------------------------------- deckhand's kit
    const rack = group(g, -2.7, 0.2, 2.1, 0.5);
    cyl(rack, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.3, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const vest = group(rack, 0.14, 1.05, 0);
    box(vest, 0.26, 0.4, 0.1, 0, 0, 0, 0xf06a2b, { rough: 0.8 });
    box(vest, 0.26, 0.05, 0.11, 0, 0.06, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(rack, "work vest", 0.14, 1.5, 0, { css: "#2fa3c4", w: 0.24 });
    reg(hits, vest, "work-vest");
    const radio = instrument(g, -2.2, 0.9, 2.3, { ry: 0.2, idle: "CH · DECK", color: 0x2fa3c4, w: 0.1, d: 0.16 });
    box(g, 0.4, 0.66, 0.3, -2.2, 0.53, 2.3, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(radio, "deck radio", 0, 0.16, 0, { css: "#2fa3c4", w: 0.26 });
    reg(hits, radio, "deck-radio");
    const logBoard = holoPanel(g, 0.62, 0.44, 2.75, 1.25, 2.0, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#2fa3c4"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#cfeef2"; cx.fillText("DECK LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Count aboard: —", "Count ashore: —", "Remarks: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.9, accent: MWFD_ACCENT });
    reg(hits, logBoard, "deck-log");
    const crewBoard = holoPanel(g, 0.5, 0.34, 1.6, 1.2, 2.55, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#cfeef2"; cx.fillText("CREW BOARD", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Master · Mate · Deck 1 · Deck 2", "Engineer below"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.5 + i * 0.22)));
    }, { ry: -0.4, accent: 0x59c97b });
    reg(hits, crewBoard, "crew-board");

    // ------------------------------------------- the person in the water
    const pob = group(g, -1.0, 0, 0.25);
    ball(pob, 0.11, 0, 0.1, 0, 0xc49a7a, { rough: 0.7 });
    box(pob, 0.36, 0.1, 0.14, 0, 0.02, 0, 0x2f4f8a, { rough: 0.8 });
    const splash = torus(pob, 0.28, 0.03, 0, 0.03, 0, 0xeaf6fb, { rough: 0.3, emissive: 0xcfe8ee, ei: 0.4, seg: 6, seg2: 20 });
    splash.rotation.x = Math.PI / 2;
    pob.visible = false;
    // Current streamers on the water for the set at the landing.
    const streamers = group(g, 0, 0.03, 0);
    for (let i = 0; i < 5; i++) {
      const s = box(streamers, 1.1, 0.01, 0.05, -2.2 + i * 1.1, 0, 0.35 - (i % 2) * 0.1, 0xcfe8ee, { rough: 0.3, emissive: 0x9fd8e8, ei: 0.5, cast: false });
      s.rotation.y = 0.35;
    }
    streamers.visible = false;

    // ---------------------------------------------------------------- crew
    const mate = standingFigure(g, 1.6, -1.5, { ry: 2.6, cloth: 0x1f3a52, vest: 0xf06a2b, gloves: true });
    holoTag(mate, "mate", 0, 1.9, 0, { css: "#2fa3c4", w: 0.2 });
    const pax1 = standingFigure(g, -2.25, 1.4, { ry: 2.9, cloth: 0x6a4a8a });
    const pax2 = standingFigure(g, 1.2, 1.9, { ry: -2.8, cloth: 0x3f6f4f });
    holoTag(pax2, "passengers waiting", 0, 1.9, 0, { css: "#2fa3c4", w: 0.4 });
    void pax1;

    const waterTex = water.material.map;
    const home = { x: ring.position.x, y: ring.position.y, z: ring.position.z };

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.8, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "vest-and-radio") repaint(radio.userData.screen, signFace("DECK · CHECKED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "deck-walk") { curl.rotation.x = 0; curl.position.y = 0.45; cart.position.set(-2.2, 0.43, -1.2); }
        if (step.id === "land-gangway") { gangway.rotation.x = 0.12; gangway.position.set(0, 0.46, -0.3); }
        if (step.id === "boarding-count") repaint(counter.userData.screen, signFace("COUNT HELD", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        if (step.id === "all-aboard") { gateChain.material = mat(0x59c97b, { rough: 0.5, metal: 0.6 }); gangway.rotation.x = 0.9; gangway.position.set(0, 1.1, -1.0); }
        if (step.id === "let-go-bow") { turns.visible = false; lineTaut.visible = false; lineSlack.visible = true; }
        if (step.id === "lsa-round") { seal.material = mat(0x59c97b, { rough: 0.5 }); lockerDoor.rotation.y = 0; extGauge.material = mat(0x59c97b, { rough: 0.3 }); }
        if (step.id === "capstan-landing") { lineSlack.visible = false; lineTaut.visible = true; }
        if (step.id === "land-passengers") { gangway.rotation.x = 0.12; gangway.position.set(0, 0.46, -0.3); pax2.position.set(1.4, 0, 2.3); }
        if (step.id === "deck-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#cfeef2"; cx.fillText("DECK LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfeaf7";
            ["Count aboard = count ashore · inside COI", "Passenger in the water — ring, recovered", "Locker seal, extinguisher, current set"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") icLamp.material = mat(0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.2 });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "passenger-overboard") { pob.visible = true; icLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4 }); }
        if (it.id === "current-shift-landing") { streamers.visible = true; lineTaut.visible = false; lineSlack.visible = true; wash.visible = false; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "passenger-overboard") { ring.position.set(-1.0, 0.1, 0.55); ring.rotation.x = Math.PI / 2; icLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (it.id === "current-shift-landing") { streamers.rotation.y = 0.2; lineSlack.visible = false; lineTaut.visible = true; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.006; waterTex.offset.y = t * 0.004; }
        if (pob.visible) pob.position.y = Math.sin(t * 2.2) * 0.03;
        if (session?.turn && step?.id === "let-go-bow") turns.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "coi-check") repaint(counter.userData.screen, signFace(gg.t < 0.4 ? "COUNTING" : gg.t <= 0.58 ? "INSIDE COI" : "OVER COI", { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (step?.id === "capstan-landing" && session.holding) drum.rotation.y += (dt ?? 0.016) * 3 * (session.track?.v ?? 0);
        if (streamers.visible) streamers.position.x = ((t * 0.3) % 1.1) - 0.55;
        void home; void CITY; void cyl;
      },
    };
  },
};
