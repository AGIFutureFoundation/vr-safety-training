import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, mat, repaint, signFace } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { motorYacht } from "../../../shared/fleet.js";
import { marinaBerth } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Shore Power Connection & In-Water Electrical Safety VR —
// Maritime & Ports, the yacht and charter crew pack.
//
// The yacht starboard side to her berth at dusk: the marina's power pedestal
// with its breaker and lamp, the shore-power cord on its reel, the yacht's
// inlet with its locking ring, the reverse-polarity and leakage indicators at
// the panel, the no-swimming sign at the berth, the cord hangers along the
// dock. The learner is the deckhand; the MEBA engineer is at the panel and a
// guest is thinking about a swim. No voltage, current or leakage figure is
// stated — the panel's indicators and the vessel's plan hold them.

const YC8_ACCENT = 0x2b6f9e;
const YC8_CSS = "#2b6f9e";

export const SIM_YC_SHORE_POWER_CONNECTION_AND_IN_WATER_ELECTRICAL_SAFETY = {
  id: "yc-shore-power-connection-and-in-water-electrical-safety",
  index: "yc-8",
  domain: "Maritime & Ports",
  trade: "Charter yacht deckhand connecting shore power at the berth, IBU and SIU trained, with the MEBA engineer at the panel",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "clear",
  certification: "IBU and SIU deck training; MEBA engineering practice from the Calhoon MEBA Engineering School as a training body for the vessel's electrical panel; NFPA 70E electrical safety in the workplace for the order of connection and the gloves; OSHA 29 CFR 1910.305 wiring methods for flexible cords and 29 CFR 1910.132 personal protective equipment; USCG 46 CFR 25 equipment for uninspected vessels; IMO STCW basic safety training",
  name: "Shore Power Connection & In-Water Electrical Safety",
  title: simTitle("Shore Power Connection & In-Water Electrical Safety"),
  tagline: "Shore power at dusk: the plan read, gloves and tester in hand, the cord walked for the cut jacket and the scorched pin, the pedestal breaker off first, the boat end connected and locked before the dock end, the polarity indicator watched as a swimmer heads for the berth, the leakage read against the plan, the hull potential held while the engineer switches loads and a guest reports a tingle, the cord hung with a drip loop, the connection logged and the crew checked in",
  accent: YC8_ACCENT,
  accentCss: YC8_CSS,
  parSeconds: 270,
  footprint: 2.6,
  badge: { id: "boat-end-first", name: "Boat End First", note: "Breaker off before the cord moved, boat end before dock end, the tingle treated as an emergency, and both the swimmer and the report answered" },

  supportLine: "your union hall's member assistance programme — the IBU, SIU or MEBA — with the operator's employee assistance line behind it",

  game: system({
    name: "Berth Power",
    currency: "KNOT",
    ranks: ["Green Hand", "Deckhand", "Lead Deckhand", "Shore Power Lead", "Berth Power Certified"],
    badges: [
      { id: "plan-read", name: "Plan Read", note: "The shore-power plan read before the reel moved", test: AWARD.stepClean("shore-power-plan") },
      { id: "leakage-read", name: "Leakage Read", note: "Leakage committed inside the plan's band first time", test: AWARD.precise(0.7) },
      { id: "dry-cord", name: "Dry Cord", note: "No cord end in the water, no swimmer at the berth, no adapter stack, no defeated ground", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-connection", name: "Clean Connection", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "potential-held", name: "Potential Held", note: "Hull potential watched in band the whole way", test: AWARD.unbroken },
      { id: "before-dark", name: "Before Dark", note: "Connection logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "plug-in-water": "You let the cord's boat end drop into the water between the hull and the dock while reaching for the inlet. A cord end that has been in the water is a cord end with salt water in its pins, and the first time it is energised it arcs inside the plug, heats, and puts current into the water it dripped back into. A wet plug is not connected; it is dried, opened and inspected by the engineer, or replaced.",
    "swimmer-at-berth": "You let a guest go in for a swim off the platform at the berth with shore power connected. The water around a marina berth carries whatever leakage every connected vessel is putting into it, and a swimmer in that water can lose the use of their muscles and drown without a mark on them — the drowning that looks like a drowning and was an electrocution. Nobody swims at the berth, ever, and the sign says so.",
    "adapter-stack": "You stacked two adapters to make the yacht's cord fit the pedestal's receptacle. Every adapter in a shore-power connection is a joint that heats and a ground that may not carry through, and a stack of them is a connection nobody has rated for the load, sitting on a wooden dock beside the water. The cord fits the pedestal or it does not; if it does not, the marina's own pedestal adapter is used, one, and the engineer is told.",
    "cheater-plug": "You went to use a plug with the ground pin removed because the pedestal's receptacle would not take it. The ground is the one conductor that exists only to protect people, carrying a fault back to the breaker instead of through a hull, a guest or the water; a plug with the pin cut off has turned the yacht's whole electrical system into a fault waiting for a body to complete it. A plug that does not fit is a plug that does not go in.",
  },

  lateNotes: {
    "power-log": "The connection is logged once the loads are on, the cord is hung and the leakage read — last, not first.",
    "pedestal-receptacle": "The dock end goes in after the boat end is connected and locked — never the other way round.",
  },

  steps: [
    {
      id: "shore-power-plan", kind: "select", target: "shore-power-board",
      title: "Read the shore-power plan with the engineer",
      cue: "Read the shore-power plan on the cockpit board: the pedestal to use, the cord and its rating per the plan, the order — breaker off, boat end, dock end, breaker on — the indicators the engineer watches, and the no-swimming rule at the berth.",
      why: "Connecting a yacht to a marina pedestal is putting the shore's electrical system into a hull that floats in conductive water with people aboard and people nearby, and the plan is where the order of the connection is written so that no cord end is ever live in a hand or in the water. The order — breaker off first, boat end before dock end, breaker on last — is the whole of the safety, and it is written down because reversed it looks the same and kills.",
    },
    {
      id: "gloves-and-tester", kind: "sequence", anyOrder: true,
      targets: ["electrical-gloves", "plug-tester"],
      itemNames: { "electrical-gloves": "insulating gloves", "plug-tester": "receptacle tester" },
      title: "Insulating gloves on, the receptacle tester in hand",
      cue: "Insulating gloves on for every moment a cord end is in your hands, and the receptacle tester from the engineer's kit to prove the pedestal's receptacle wired right before anything of the yacht's goes into it.",
      why: "The gloves are for the moment nobody plans — a cord end that turns out to be live because a breaker was not what it looked like — and they are worn for the whole connection because that moment does not announce itself. The tester is for the pedestal: a receptacle wired with its neutral and ground swapped or its ground open looks like every other receptacle, and the electrical safety practice the engineer works to says nothing of the vessel's goes into a receptacle nobody has proven.",
    },
    {
      id: "cord-inspection", kind: "find", noHint: true,
      targets: ["cord-jacket-cut", "plug-pin-scorched"],
      itemNames: { "cord-jacket-cut": "cut in the cord's jacket near the boat end", "plug-pin-scorched": "scorched, pitted pin on the dock-end plug" },
      itemNotes: {
        "cord-jacket-cut": "The cord's jacket is cut through to the conductors an arm's length from the boat end — a cord that lies on a wet dock with its conductors exposed is a cord that puts current into the dock and the water.",
        "plug-pin-scorched": "The dock-end plug's pin is scorched and pitted from arcing under load — a pin that has arced once is a bad connection that heats every time it is used, and the plug is the thing that starts the fire on the pedestal.",
      },
      title: "Walk the cord from end to end before it comes off the reel",
      cue: "Run the cord through gloved hands from the boat end to the dock end: the jacket whole, the plugs' pins clean and straight, the locking ring's threads sound, the strain reliefs tight.",
      why: "A shore-power cord lives coiled on a reel, dragged over dock edges and left in puddles, and it fails at the jacket and the pins; the walk finds a cut jacket or a scorched pin before the cord is energised on a wet dock, which is the only time finding it helps. The wiring rules for flexible cords say a damaged cord is out of service, not taped, and the engineer wants to see the cut and the pin before the cord goes back on the reel or into the bin.",
    },
    {
      id: "breaker-off", kind: "turn", target: "pedestal-breaker",
      title: "Turn the pedestal breaker off before the cord moves",
      cue: "At the pedestal, turn its breaker to off and see the pedestal lamp go out, then prove the receptacle dead with the tester before the cord comes anywhere near it.",
      why: "The pedestal's breaker is what makes every other step of the connection safe: with it off, the receptacle is dead, the dock end can be handled and the cord cannot be live at either end until the deckhand chooses. It is turned off first, before the cord leaves the reel, and it is proven off with the tester — a breaker that looks off and is not is exactly the fault the tester exists for — because the whole order that follows assumes it.",
      turn: { turns: 1.0, label: "PEDESTAL BREAKER", readout: (t) => (t < 0.3 ? "breaker on — lamp lit" : t < 0.85 ? "tripping" : "off · lamp out · proven dead") },
    },
    {
      id: "boat-end-first", kind: "drag", target: "shore-cord-plug",
      title: "Connect the boat end to the yacht's inlet first",
      cue: "Take the cord's boat end from the reel to the yacht's inlet — over the rail, never across the gap in the water — and push it home into the inlet with the dock end still on the reel.",
      why: "The boat end goes in first because a cord connected at the dock first has a live boat end in the deckhand's hand, over the water, while they reach for the inlet; connected at the yacht first, nothing is live until the dock end goes in and the breaker comes on, both of which the deckhand does last and deliberately. The cord crosses over the rail, held, because the gap between the hull and the dock is where a dropped cord end goes into the water.",
      drag: { to: "boat-inlet-socket", radius: 0.6, missNote: "Not into the yacht's inlet — the boat end goes home first, with the dock end still dead on the reel, before anything else." },
    },
    {
      id: "lock-ring", kind: "select", target: "inlet-lock-ring",
      title: "Screw the inlet's locking ring down",
      cue: "Screw the inlet's locking ring down over the plug until it seats — hand tight, the plug held square — so the connection cannot pull out, cannot arc under a wake, and sheds the rain.",
      why: "A shore-power plug that is pushed in and left is a plug that works loose with every wake and every tug on the cord, and a plug that is half out under load arcs inside the inlet and starts the fire that burns yachts at their berths at night. The locking ring holds it square and home and seals it against the weather; it is screwed down by hand every time, and a ring that will not seat means a plug that is not home.",
    },
    {
      id: "dock-end", kind: "select", target: "pedestal-receptacle",
      title: "Connect the dock end to the pedestal's receptacle",
      cue: "With the boat end locked, take the dock end to the pedestal, check the receptacle matches the plug — no adapters, no forced fit — and push it home with the pedestal's own locking ring turned down.",
      why: "The dock end goes in last because it is the end that becomes live, and with the boat end already locked the deckhand's hands are the only thing at the pedestal when it does. The plug matches the receptacle or the connection does not happen: an adapter is a joint and a forced fit is a bent pin, and both are how a pedestal burns. The pedestal's own ring is turned down so the dock end cannot be kicked out by a passer-by with the load on.",
    },
    {
      id: "polarity-watch", kind: "hold", target: "polarity-indicator", seconds: 5,
      title: "Breaker on — watch the polarity indicator at the panel",
      cue: "With the engineer at the panel, turn the pedestal breaker on and watch the yacht's reverse-polarity indicator steadily for the whole of the engineer's check — dark means right, lit means the breaker comes off again now.",
      why: "The reverse-polarity indicator is the yacht's own check on the marina's wiring: a pedestal with its conductors swapped puts the yacht's neutral live and every appliance's case with it, and the indicator is the only thing aboard that will say so before someone touches one. It is watched for the whole check, not glanced at, because the lamp can be slow and the engineer is switching the panel through its positions while the deckhand watches.",
      holdBreakNote: "Eyes came off the indicator during the engineer's check — a lamp that lit and was not seen. Back on the indicator until the engineer calls the check done.",
    },
    {
      id: "leakage-read", kind: "gauge", target: "leakage-meter",
      title: "Read the leakage indicator against the vessel's plan",
      cue: "Read the leakage indicator at the panel as the engineer brings the loads on and commit it against the band the vessel's plan gives — the current going somewhere it should not, into the hull and the water.",
      why: "Leakage current is the current that leaves the yacht's wiring by a path nobody designed — through a heater element, a wet junction, a corroded fitting — and into the hull and the water round it, where a swimmer is the last conductor. The indicator reads it and the plan gives the band the engineer accepts; a reading over the band is a fault to find now, with the breaker off, not a number to note.",
      gauge: { label: "LEAKAGE", speed: 0.7, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "reading low — loads not yet on" : t <= 0.58 ? "inside the plan's band" : "over the band — breaker off, find it"), missNote: "Outside the band — the reading is taken with the loads on and committed against the plan's band, not read off the first flicker." },
    },
    {
      id: "hull-potential-watch", kind: "track", target: "hull-potential-meter",
      seconds: 6,
      title: "Hold the hull potential reading while the engineer switches loads",
      cue: "Watch the hull potential meter the engineer has clipped between the hull's bonding and the water as the loads are switched in one at a time, calling it steady — a jump on any load is that load's fault.",
      why: "Every load switched in is a chance for a fault to show itself as a change in the potential between the hull and the water, and the meter is the honest witness: a heater that jumps the reading is a heater with a fault to earth, found now on the dock rather than later by a swimmer. The watch is steady and called out loud because the engineer is at the panel switching and cannot see the meter, and the load that jumped it is the one that comes off.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "HULL POTENTIAL", readout: (v) => (v < 0.42 ? "eyes off the meter" : v > 0.6 ? "jumping — a load has a fault" : "steady — loads clean") },
      holdBreakNote: "The watch broke — a load switched in with nobody reading the meter. Back on it, calling each load to the engineer as it comes in.",
    },
    {
      id: "cord-routing", kind: "sequence",
      targets: ["cord-hanger-a", "cord-hanger-b", "drip-loop"],
      itemNames: { "cord-hanger-a": "cord hanger at the pedestal", "cord-hanger-b": "cord hanger at the dock edge", "drip-loop": "drip loop below the inlet" },
      outOfOrderNote: "From the pedestal to the boat — the pedestal hanger, then the edge hanger, then the drip loop at the inlet — so the cord is off the dock and the water runs away from both ends.",
      title: "Hang the cord off the dock with a drip loop at the inlet",
      cue: "Hang the cord on the hanger at the pedestal, then the hanger at the dock edge, and leave a drip loop hanging below the yacht's inlet — the cord off the dock, out of puddles, out of the gap, and the rain running off the loop instead of into the plug.",
      why: "A shore-power cord that lies on the dock is stepped on, rolled over by a cart, kicked into the gap and left in the puddle the rain makes; hung on the hangers it is out of all of that and off the water. The drip loop at the inlet is the oldest trick on a marina: rain running down a cord toward a plug goes to the bottom of the loop and drops off, instead of into the inlet where it would arc.",
    },
    {
      id: "power-log", kind: "select", target: "power-log",
      title: "Log the connection",
      cue: "Enter the connection: the pedestal, the cord and its findings — the cut jacket, the scorched pin — the polarity check, the leakage and the hull potential per the plan, the swimmer turned back and the tingle report, and the breaker off and on times.",
      why: "The shore-power log is where the engineer finds next week that the leakage crept up, and where the marina finds that its pedestal was proven with a tester before the yacht's cord went in; the cut jacket and the scorched pin are logged so the cord is replaced and not just re-coiled. The swimmer and the tingle report are logged because both are the marina's problem as much as the yacht's, and the harbourmaster needs to hear them from the log, not from a hospital.",
    },
    {
      id: "crew-checkin", kind: "select", target: "berth-radio",
      title: "Check in with the engineer and the harbourmaster",
      cue: "On the radio: the connection made in order and logged, the readings per the plan, the cord hung, the tingle report and the swimmer, and how the deck crew are after a shore-power hookup that turned into a report of current in the water.",
      why: "The engineer signs the panel over on the deckhand's word that the cord is locked and hung, and the harbourmaster needs to hear about a tingle in the water at a berth because the next vessel along may be the source. It is also the crew's own check-in: a guest saying they felt something in the water beside the hull is a frightening sentence to hear, and the union's member assistance line is there for what the radio does not carry.",
    },
  ],

  interrupts: [
    {
      id: "swimmer-heads-for-berth",
      kind: "Guest heads for the swim platform at the berth",
      after: "polarity-watch", delay: 2, seconds: 14,
      alert: "A guest in a swimsuit has come down to the swim platform and is sitting on the edge, feet toward the water — with the shore power connected and the polarity check still running.",
      cue: "Point the guest to the no-swimming sign at the berth and get them off the platform; nobody enters the water at a marina berth with shore power connected anywhere on the dock.",
      target: "no-swimming-sign",
      why: "Water round a marina berth carries the leakage of every connected vessel on the dock, not only this one, and a swimmer in it can lose the use of their limbs without pain or warning and go under in sight of the deck. The no-swimming sign at the berth is the rule and the answer — pointed to, said out loud, the guest off the platform — because there is no reading on any meter aboard that makes that water safe to swim in.",
      missNote: "The guest slipped into the water off the platform, felt nothing at first, and then could not lift their arms to the ladder; the mate got them out by the hair with the breaker still on.",
      wrongNote: "The no-swimming sign — the guest is shown the rule and taken off the platform; the water at a berth is never safe with power on the dock.",
    },
    {
      id: "tingle-report",
      kind: "Guest reports a tingle from the water",
      after: "hull-potential-watch", delay: 2, seconds: 14,
      alert: "A guest rinsing their hands over the swim platform says they felt a tingle in the water beside the hull — and laughs about it.",
      cue: "Treat it as an emergency: the pedestal breaker off now, everyone away from the water's edge, and the engineer told before anything is switched back on.",
      target: "pedestal-breaker",
      why: "A tingle in the water beside a hull is current in the water, and current in the water is the thing that drowns swimmers without a mark; a guest laughing about it has just reported the most serious fault a marina berth can have. The breaker comes off before a word is said to anyone else — the source may be this yacht or the next one, and the only safe assumption is this one — and the engineer traces it with the power dead.",
      missNote: "The tingle was laughed off with the breaker on, the guest went back to rinsing, and the engineer found the water heater's element faulted to the hull an hour later, by which time a second guest had been on the platform.",
      wrongNote: "The pedestal breaker — off, now; a tingle in the water is current in the water and nothing is safe until the source is dead.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, YC8_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 22, 0.02, 22, 2, 0.012, 0, 0xffffff, { rough: 0.15, metal: 0.35, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0b222c", mid: "#103644" }), { repeat: 4, px: 512 }), { rough: 0.15, metal: 0.35, color: 0x7fa4b8 });

    // ----------------------------------------------- the berth and the yacht
    const berth = marinaBerth(g, -1.0, 0, 0);
    const { pedestal, breaker, pedestalLamp } = berth.userData.parts;
    holoTag(pedestal, "power pedestal", 0, 1.4, 0, { css: YC8_CSS, w: 0.3 });
    holoTag(breaker, "pedestal breaker", 0.1, 0.2, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, breaker, "pedestal-breaker");
    const receptacle = group(pedestal, 0.16, 0.45, 0);
    box(receptacle, 0.03, 0.12, 0.12, 0, 0, 0, 0x15181c, { rough: 0.5 });
    cyl(receptacle, 0.04, 0.04, 0.02, 0.02, 0, 0, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(receptacle, "pedestal receptacle", 0.1, 0.2, 0, { css: YC8_CSS, w: 0.38 });
    reg(hits, receptacle, "pedestal-receptacle");
    const yacht = motorYacht(g, 3.3, -1.2, 7.0, { livery: { fleetName: "ESTUARY LADY", unitNumber: "MY-24" } });
    const P = yacht.userData.parts;
    const DECK = 1.25;
    const deck = group(g, 3.3, DECK, 0);
    holoTag(P.shorePowerInlet, "shore-power inlet", 0, 0.3, 0, { css: YC8_CSS, w: 0.36 });
    const inletSocket = group(g, 3.3 - 2.15 - 0.1, DECK + 0.55, 0.05);
    const inletRing = torus(inletSocket, 0.18, 0.012, 0, 0, 0, YC8_ACCENT, { emissive: YC8_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    inletRing.rotation.y = Math.PI / 2;
    reg(hits, inletSocket, "boat-inlet-socket");
    const lockRing = torus(inletSocket, 0.09, 0.02, 0.02, 0, 0, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8, seg2: 16 });
    lockRing.rotation.y = Math.PI / 2;
    lockRing.visible = false;
    const lockHit = box(inletSocket, 0.2, 0.3, 0.3, -0.08, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(inletSocket, "locking ring", -0.1, 0.3, 0, { css: YC8_CSS, w: 0.26 });
    reg(hits, lockHit, "inlet-lock-ring");
    // The cord on its reel on the dock, its boat-end plug, the cut and the scorched pin.
    const reel = group(g, -1.3, 0.45, -1.2);
    cyl(reel, 0.3, 0.3, 0.2, 0, 0.45, 0, 0x2b3138, { rough: 0.6, seg: 16 }).rotation.z = Math.PI / 2;
    for (let i = 0; i < 4; i++) { const wrap = torus(reel, 0.2, 0.02, -0.06 + i * 0.04, 0.45, 0, 0xf2c14b, { rough: 0.7, seg: 6, seg2: 20 }); wrap.rotation.y = Math.PI / 2; }
    box(reel, 0.5, 0.06, 0.4, 0, 0.03, 0, 0x2b3138, { rough: 0.6 });
    holoTag(reel, "shore-power cord", 0, 0.95, 0, { css: YC8_CSS, w: 0.34 });
    const plugBoat = group(reel, 0.3, 0.2, 0.3);
    cyl(plugBoat, 0.05, 0.05, 0.14, 0, 0, 0, 0xf2c14b, { rough: 0.6, seg: 12 });
    holoTag(plugBoat, "boat end", 0, 0.25, 0, { css: YC8_CSS, w: 0.22 });
    reg(hits, plugBoat, "shore-cord-plug");
    const cordLoose = hose(reel, [[0.3, 0.13, 0.3], [0.4, 0.05, 0.1], [0.2, 0.05, -0.2]], 0.02, 0xf2c14b, { steps: 6, rough: 0.7 });
    const cut = box(reel, 0.05, 0.05, 0.05, 0.42, 0.06, 0.05, 0xd2312b, { rough: 0.5, emissive: 0x4a0808, ei: 0.4 });
    reg(hits, cut, "cord-jacket-cut");
    const plugDock = group(reel, -0.3, 0.2, 0.3);
    cyl(plugDock, 0.05, 0.05, 0.14, 0, 0, 0, 0xf2c14b, { rough: 0.6, seg: 12 });
    const scorch = cyl(plugDock, 0.01, 0.01, 0.04, 0.02, 0.08, 0, 0x2b1a0a, { rough: 0.9, emissive: 0x3a1206, ei: 0.4, seg: 6 });
    holoTag(plugDock, "dock end", 0, 0.25, 0, { css: YC8_CSS, w: 0.22 });
    reg(hits, scorch, "plug-pin-scorched");
    const cordRun = hose(g, [[-1.0, 0.6, -1.2], [-0.5, 0.5, -0.4], [0.2, 0.9, -0.1], [0.9, DECK + 0.4, 0.05], [1.05, DECK + 0.55, 0.05]], 0.02, 0xf2c14b, { steps: 12, rough: 0.7 });
    cordRun.visible = false;
    const cordHung = hose(g, [[-1.0, 0.6, 1.2], [-0.6, 1.2, 0.6], [-0.2, 1.2, 0.1], [0.7, DECK + 0.1, 0.05], [1.05, DECK + 0.55, 0.05]], 0.02, 0xf2c14b, { steps: 12, rough: 0.7 });
    cordHung.visible = false;
    const waterHit = box(g, 0.6, 0.3, 0.6, 0.3, 0.1, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cord end in the gap?", 0.3, 0.5, -0.6, { css: "#d2312b", w: 0.42 });
    reg(hits, waterHit, "plug-in-water");
    // Adapters and the cheater plug in the dock box — the hazards.
    const dockBox = group(g, -1.7, 0.45, 2.6);
    box(dockBox, 0.5, 0.3, 0.4, 0, 0.15, 0, 0x8a949d, { rough: 0.6, metal: 0.3 });
    const adapters = group(dockBox, -0.1, 0.34, 0);
    for (const sx of [-0.06, 0.06]) cyl(adapters, 0.045, 0.045, 0.1, sx, 0, 0, 0x2b3138, { rough: 0.6, seg: 10 });
    holoTag(adapters, "stack the adapters?", 0, 0.25, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, adapters, "adapter-stack");
    const cheater = cyl(dockBox, 0.04, 0.04, 0.08, 0.15, 0.34, 0.05, 0xd8d2c4, { rough: 0.6, seg: 10 });
    holoTag(dockBox, "plug — ground pin cut off", 0.15, 0.6, 0.05, { css: "#d2312b", w: 0.5 });
    reg(hits, cheater, "cheater-plug");
    // Cord hangers along the dock, the drip-loop spot at the inlet, the no-swimming sign at the berth's platform end.
    const hangerA = group(g, -1.85, 0.45, 1.6);
    cyl(hangerA, 0.02, 0.02, 1.2, 0, 0.6, 0, 0xc8ced4, { rough: 0.45, metal: 0.6, seg: 8 });
    box(hangerA, 0.14, 0.03, 0.03, 0.07, 1.2, 0, 0xc8ced4, { rough: 0.45, metal: 0.6 });
    holoTag(hangerA, "cord hanger — pedestal", 0, 1.45, 0, { css: YC8_CSS, w: 0.42 });
    reg(hits, hangerA, "cord-hanger-a");
    const hangerB = group(g, -0.15, 0.45, 0.6);
    cyl(hangerB, 0.02, 0.02, 1.2, 0, 0.6, 0, 0xc8ced4, { rough: 0.45, metal: 0.6, seg: 8 });
    box(hangerB, 0.14, 0.03, 0.03, 0.07, 1.2, 0, 0xc8ced4, { rough: 0.45, metal: 0.6 });
    holoTag(hangerB, "cord hanger — edge", 0, 1.45, 0, { css: YC8_CSS, w: 0.36 });
    reg(hits, hangerB, "cord-hanger-b");
    const dripSpot = group(g, 0.8, DECK - 0.2, 0.05);
    const dripRing = torus(dripSpot, 0.14, 0.01, 0, 0, 0, YC8_ACCENT, { emissive: YC8_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    dripRing.rotation.y = Math.PI / 2;
    holoTag(dripSpot, "drip loop", -0.2, 0.3, 0, { css: YC8_CSS, w: 0.22 });
    reg(hits, dripSpot, "drip-loop");
    const sign = holoPanel(g, 0.4, 0.4, -0.15, 1.5, -3.6, (cx, w, h) => {
      cx.fillStyle = "#f1f3f4"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#d2312b"; cx.lineWidth = w * 0.08; cx.beginPath(); cx.arc(w / 2, h / 2, w * 0.36, 0, Math.PI * 2); cx.stroke();
      cx.beginPath(); cx.moveTo(w * 0.24, h * 0.24); cx.lineTo(w * 0.76, h * 0.76); cx.stroke();
      cx.fillStyle = "#1c2b3a"; cx.font = `700 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("NO SWIMMING", w / 2, h * 0.9);
    }, { ry: Math.PI / 2, accent: 0xd2312b });
    cyl(g, 0.03, 0.03, 1.5, -0.15, 1.2, -3.6, 0xc8ced4, { rough: 0.45, metal: 0.6, seg: 8 });
    reg(hits, sign, "no-swimming-sign");
    const swimHit = box(g, 0.8, 0.4, 0.8, 1.6, 0.2, -4.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "let them swim at the berth?", 1.6, 0.7, -4.0, { css: "#d2312b", w: 0.52 });
    reg(hits, swimHit, "swimmer-at-berth");
    const swimmer = standingFigure(g, 2.0, -3.6, { ry: Math.PI, cloth: 0x3a6f4a, trousers: 0x3a6f4a, atStation: true });
    swimmer.position.y = 0.05;
    swimmer.visible = false;
    holoTag(swimmer, "guest — heading for the water", 0, 1.9, 0, { css: "#d2312b", w: 0.5 });
    const rinser = standingFigure(g, 2.6, -4.2, { ry: 2.6, cloth: 0x6a4a8a, trousers: 0x2b3138, atStation: true });
    rinser.position.y = 0.05;
    holoTag(rinser, "guest — rinsing hands", 0, 1.9, 0, { css: YC8_CSS, w: 0.4 });
    // The panel in the cockpit: polarity indicator, leakage indicator, hull potential meter; the boards; the radio; PPE.
    const panel = group(deck, -1.4, 0, -0.8);
    box(panel, 0.9, 1.0, 0.3, 0, 0.5, 0, 0xdfe3e6, { rough: 0.45, metal: 0.2 });
    const polarity = group(panel, -0.28, 0.8, 0.16);
    box(polarity, 0.14, 0.14, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const polLamp = ball(polarity, 0.03, 0, 0, 0.02, 0x2b1a0a, { emissive: 0x2b1a0a, ei: 0.3, seg: 8, seg2: 6 });
    holoTag(polarity, "reverse polarity", 0, 0.2, 0, { css: YC8_CSS, w: 0.32 });
    reg(hits, polarity, "polarity-indicator");
    const leakage = instrument(panel, 0.1, 1.02, 0, { idle: "LEAK · —", color: YC8_ACCENT, w: 0.12, d: 0.2 });
    holoTag(leakage, "leakage indicator", 0, 0.18, 0, { css: YC8_CSS, w: 0.34 });
    reg(hits, leakage, "leakage-meter");
    const potential = instrument(deck, -2.3, 0.55, -1.8, { ry: 0.5, idle: "HULL · —", color: YC8_ACCENT, w: 0.1, d: 0.16 });
    box(deck, 0.24, 0.5, 0.24, -2.3, 0.25, -1.8, 0x2b3138, { rough: 0.6, metal: 0.4 });
    hose(deck, [[-2.3, 0.55, -1.8], [-2.7, 0.3, -1.9], [-2.95, -0.8, -1.9]], 0.006, 0xd2312b, { steps: 6, rough: 0.7 });
    holoTag(potential, "hull potential meter", 0, 0.16, 0, { css: YC8_CSS, w: 0.4 });
    reg(hits, potential, "hull-potential-meter");
    const board = holoPanel(deck, 0.8, 0.54, -0.4, 1.4, 1.08, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC8_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("SHORE POWER PLAN", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Pedestal: this berth's · proven with the tester", "Order: breaker OFF · boat end · dock end · breaker ON", "Cord: per the plan · no adapters · no cut ground",
       "Engineer: polarity · leakage · hull potential", "Cord hung · drip loop at the inlet", "NO SWIMMING at the berth · tingle = emergency"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { accent: YC8_ACCENT });
    reg(hits, board, "shore-power-board");
    const log = holoPanel(deck, 0.5, 0.36, 0.5, 1.4, 1.08, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC8_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("SHORE POWER LOG", w * 0.06, h * 0.17);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Pedestal: —", "Readings: —", "Remarks: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
    }, { accent: YC8_ACCENT });
    reg(hits, log, "power-log");
    const radio = instrument(g, -1.7, 1.02, 3.6, { ry: 2.6, idle: "CH · HARBOUR", color: YC8_ACCENT, w: 0.1, d: 0.16 });
    box(g, 0.3, 0.55, 0.3, -1.7, 0.72, 3.6, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(radio, "berth radio", 0, 0.16, 0, { css: YC8_CSS, w: 0.26 });
    reg(hits, radio, "berth-radio");
    const kit = group(g, -1.6, 0.45, -2.4);
    box(kit, 0.5, 0.2, 0.35, 0, 0.1, 0, 0xf2c14b, { rough: 0.6 });
    const gloves = group(kit, -0.12, 0.25, 0);
    box(gloves, 0.1, 0.16, 0.05, 0, 0, 0, 0xd8532a, { rough: 0.6 });
    box(gloves, 0.1, 0.16, 0.05, 0.05, -0.03, 0.03, 0xd8532a, { rough: 0.6 });
    holoTag(gloves, "insulating gloves", 0, 0.25, 0, { css: YC8_CSS, w: 0.34 });
    reg(hits, gloves, "electrical-gloves");
    const tester = group(kit, 0.14, 0.24, 0);
    box(tester, 0.06, 0.1, 0.04, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    for (let i = 0; i < 3; i++) ball(tester, 0.008, -0.015 + i * 0.015, 0.03, 0.022, 0x59c97b, { emissive: 0x59c97b, ei: 0.6, seg: 6, seg2: 6 });
    holoTag(tester, "receptacle tester", 0, 0.25, 0, { css: YC8_CSS, w: 0.34 });
    reg(hits, tester, "plug-tester");
    const engineer = standingFigure(deck, -0.4, -1.9, { ry: 0.4, cloth: 0x3f4a55, trousers: 0x2b3138, gloves: true, atStation: true });
    holoTag(engineer, "engineer — at the panel", 0, 1.9, 0, { css: YC8_CSS, w: 0.42 });

    const waterTex = water.material.map;
    const breakerHandle = breaker.children[0];

    return {
      hits,
      spawnLook: new THREE.Vector3(0.6, 1.2, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "gloves-and-tester") { gloves.visible = false; tester.visible = false; }
        if (step.id === "cord-inspection") { cut.material = mat(0xf2c14b, { rough: 0.7 }); scorch.material = mat(0xc8ced4, { rough: 0.35, metal: 0.6 }); }
        if (step.id === "breaker-off") pedestalLamp.traverse((o) => { if (o.isMesh) o.material = mat(0x2b3138, { rough: 0.6 }); });
        if (step.id === "boat-end-first") { plugBoat.visible = false; cordLoose.visible = false; cordRun.visible = true; inletRing.visible = false; }
        if (step.id === "lock-ring") lockRing.visible = true;
        if (step.id === "dock-end") { plugDock.visible = false; }
        if (step.id === "polarity-watch") { pedestalLamp.traverse((o) => { if (o.isMesh) o.material = mat(0xf6f4ea, { emissive: 0xfff2cc, ei: 1.1 }); }); }
        if (step.id === "leakage-read") repaint(leakage.userData.screen, signFace("LEAK · IN BAND", { bg: "#0d1c24", accent: YC8_CSS, fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "hull-potential-watch") repaint(potential.userData.screen, signFace("HULL · STEADY", { bg: "#0d1c24", accent: YC8_CSS, fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "cord-routing") { cordRun.visible = false; cordHung.visible = true; dripRing.visible = false; }
        if (step.id === "power-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dcefff"; cx.fillText("SHORE POWER LOG", w * 0.06, h * 0.17);
            cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ea";
            ["Pedestal: proven · breaker off first", "Readings: polarity dark · leakage and hull in band", "Remarks: cut jacket · scorched pin · swimmer · tingle"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("LOGGED · HARBOUR TOLD", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.42 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "swimmer-heads-for-berth") swimmer.visible = true;
        if (it.id === "tingle-report") { polLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8 }); rinser.rotation.y = 1.2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "swimmer-heads-for-berth") { swimmer.position.set(3.0, DECK, -2.4); swimmer.rotation.y = 0; sign.userData.face.material.emissiveIntensity = 1.8; }
        if (it.id === "tingle-report") { pedestalLamp.traverse((o) => { if (o.isMesh) o.material = mat(0x2b3138, { rough: 0.6 }); }); polLamp.material = mat(0x2b1a0a, { emissive: 0x2b1a0a, ei: 0.3 }); rinser.position.set(3.0, DECK, -2.0); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "breaker-off") breakerHandle.rotation.x = -session.turn.amount * Math.PI * 0.5;
        if (polLamp.material.emissiveIntensity > 1.5) polLamp.material.emissiveIntensity = 1.4 + Math.sin(t * 10) * 0.5;
        void dt; void CITY;
      },
    };
  },
};
