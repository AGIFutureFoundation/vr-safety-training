import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, mat, repaint, signFace } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { motorYacht, yachtTender } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Tender Launch & Guest Transfer VR — Maritime & Ports, the
// yacht and charter crew pack.
//
// The aft deck and swim platform of the yacht at anchor: the davit with its
// control and tag line, the rigid inflatable tender on its chocks and then
// alongside the platform, the painter, the kill-cord, the tender's plate, and
// the guests waiting to go ashore with their bags. The learner is the
// deckhand driving the tender; the mate works the davit and the captain
// watches from the flybridge. No weight, count or distance is stated — the
// tender's plate and the captain's standing orders hold them.

const YC7_ACCENT = 0x2b6f9e;
const YC7_CSS = "#2b6f9e";

export const SIM_YC_TENDER_LAUNCH_AND_GUEST_TRANSFER = {
  id: "yc-tender-launch-and-guest-transfer",
  index: "yc-7",
  domain: "Maritime & Ports",
  trade: "Charter yacht deckhand launching and driving the tender, IBU and SIU trained, with the mate on the davit and the captain on the flybridge",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "clear",
  certification: "IBU and SIU deck training in small-boat handling and davit launching; USCG lifesaving and equipment rules at 46 CFR 25 and 46 CFR 199 as they apply to the tender and her parent vessel; 33 CFR 83 Inland Navigation Rules for the tender under way; OSHA 29 CFR 1910.132 personal protective equipment; IMO STCW personal survival techniques; MEBA engineering watch on the davit's hydraulics",
  name: "Tender Launch & Guest Transfer",
  title: simTitle("Tender Launch & Guest Transfer"),
  tagline: "Guests ashore by tender: the plan read, jacket and kill-cord in hand, the tender walked for the missing drain plug and the cracked fuel line, the sling on the davit hook, the tender lowered steady as a wake swings it, the painter cleated, the outboard tilted and started on the cord, the load read against the plate, the guest steadied across with two hands free while another arrives with both hands full, the guests seated in order, the navigation light checked, the launch logged and the crew checked in",
  accent: YC7_ACCENT,
  accentCss: YC7_CSS,
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "two-hands-free", name: "Two Hands Free", note: "Kill-cord on before the start, the plate never exceeded, every guest across with both hands free, and both the wake and the bags answered" },

  supportLine: "your union hall's member assistance programme — the IBU, SIU or MEBA — with the operator's employee assistance line behind it",

  game: system({
    name: "Tender Ops",
    currency: "KNOT",
    ranks: ["Green Hand", "Tender Crew", "Tender Driver", "Boat Officer", "Tender Ops Certified"],
    badges: [
      { id: "plan-read", name: "Plan Read", note: "The tender plan read before the davit moved", test: AWARD.stepClean("tender-plan") },
      { id: "on-the-plate", name: "On The Plate", note: "Load committed inside the plate's band first time", test: AWARD.precise(0.7) },
      { id: "cord-on", name: "Cord On", note: "No start without the cord, no guest stepping with bags, nobody standing, nobody over the plate", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-launch", name: "Clean Launch", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "steady-lower", name: "Steady Lower", note: "The tender lowered in band the whole way", test: AWARD.unbroken },
      { id: "ashore-early", name: "Ashore Early", note: "Launch logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "step-with-bags": "You let a guest step across to the tender with a bag in each hand. A step from a swim platform to a tender that is moving on the water needs two hands — one for the grab line, one for the crew member's hand — and a guest with a bag in each hand has neither; they fall between the hulls, and the bags go in with them. Bags are passed first, across the gap, hand to hand, and the guest steps with nothing in their hands.",
    "start-no-cord": "You went to start the outboard without the kill-cord clipped to you. The cord is what stops the engine when the driver goes over the side — and a tender driver who goes over the side beside a running outboard is a tender that circles back over them with the propeller. The cord is clipped to the driver before the start, every start, and the engine will not start without it on a tender where the switch works as it should.",
    "stand-in-tender": "You stood up in the tender to reach the platform while it was alongside. A rigid inflatable is stable with everyone low and unstable with anyone standing, and a tender alongside a platform in any swell is a tender that moves under a standing person's feet at the wrong moment. Everyone in the tender sits low and holds the grab line; the driver stands only at the console with a hand on it, and nobody stands to reach.",
    "extra-guest": "You waved one more guest aboard past the number on the tender's plate. The plate is the tender's own limit for people and weight, set by her builder, and one more is a tender low in the water, slow to turn and quick to swamp in the wake of the first passing vessel — with the tender's own gear and the guests' bags already counting against it. The plate is the number; the second trip is what happens to the rest.",
  },

  lateNotes: {
    "tender-log": "The launch is logged once the guests are seated, the light checked and the painter ready to slip — last, not first.",
    "outboard-tilt": "The outboard is tilted and started once the tender is in the water and the painter is fast — never in the davit.",
  },

  steps: [
    {
      id: "tender-plan", kind: "select", target: "tender-plan-board",
      title: "Read the tender plan with the mate",
      cue: "Read the tender plan on the aft-deck board: the tender's plate figure for people and weight, who drives, who works the davit, the trips, the landing, the light and the radio, and the captain's word before the davit moves.",
      why: "A tender run is a small boat leaving a large one with guests aboard, and the plan is where the crew agree the things the guests will argue about on the platform — how many go per trip, who drives, where the landing is — before anyone is standing on the swim platform with a bag. The plate's figure is written on the plan from the plate itself, so the deckhand at the platform is quoting the builder and not negotiating.",
    },
    {
      id: "jacket-and-cord", kind: "sequence", anyOrder: true,
      targets: ["tender-pfd", "kill-cord"],
      itemNames: { "tender-pfd": "driver's life jacket", "kill-cord": "kill-cord from the console" },
      title: "Life jacket on, the kill-cord in hand",
      cue: "The driver's life jacket on and fastened, and the kill-cord unclipped from the tender's console and looped on your wrist before the tender leaves its chocks.",
      why: "The tender's driver is the person most likely to end up in the water on a charter — leaning to catch a painter, stepping between hulls, standing at a console in a wake — and the jacket is worn from the aft deck, not put on in the tender. The kill-cord is taken in hand now so that it is on the wrist before the first start and cannot be forgotten in the sequence of painter, outboard, guests; a cord still clipped to the console does nothing for a driver in the water.",
    },
    {
      id: "tender-walk", kind: "find", noHint: true,
      targets: ["drain-plug-out", "fuel-line-cracked"],
      itemNames: { "drain-plug-out": "transom drain plug missing", "fuel-line-cracked": "cracked fuel line at the outboard connector" },
      itemNotes: {
        "drain-plug-out": "The transom drain plug is out, left that way to drain the rain — a tender launched without it fills from the transom the moment she is in the water, slowly enough that nobody notices until she is heavy.",
        "fuel-line-cracked": "The fuel line is cracked at the outboard's connector and sweating fuel — a line that lets go under way is an outboard that stops in the channel and fuel in the tender's bilge under the guests' feet.",
      },
      title: "Walk the tender in her chocks",
      cue: "Walk the tender before the sling goes on: the drain plug in, the fuel line and connector sound, the tank secure, the grab lines fast, the light and the radio aboard, the painter flaked.",
      why: "A tender is checked in her chocks because that is the last time anyone can look at her transom, her fuel line and her plug without leaning over the water, and the two most common findings — a plug left out to drain rain, a fuel line chafed at the connector — are both things that fail after launch, not before. A tender that fills or stops in the channel with guests aboard is the yacht's emergency, and it is prevented by a hand on the plug and the line in the chocks.",
    },
    {
      id: "sling-on-hook", kind: "drag", target: "lifting-sling",
      title: "Put the sling on the davit hook",
      cue: "Take the tender's lifting sling from the chocks and hang its ring on the davit hook, the hook's latch closed over it, the legs to the tender's lifting points, nothing twisted.",
      why: "The davit lifts the tender by four legs and a ring, and a sling with a twisted leg or a ring on an open hook is a tender that hangs crooked and dumps the outboard's weight onto one point — or comes off the hook over the swim platform. The latch is closed over the ring by hand and the legs are followed to their points because the tender goes up over the platform and the water with people beneath it, and a sling is the only thing between them.",
      drag: { to: "davit-hook", radius: 0.6, missNote: "Not on the hook — the sling's ring goes over the davit hook with the latch closed, legs to the lifting points, before the davit takes the weight." },
    },
    {
      id: "lower-steady", kind: "track", target: "davit-control", seconds: 6,
      title: "Lower the tender steadily to the water",
      cue: "With the mate on the tag line and the captain's word, work the davit control to lift the tender clear of the chocks, swing it outboard and lower it steadily — no snatching, no dropping — until she floats and the sling goes slack.",
      why: "A tender coming down on a davit is a swinging weight over a swim platform and a piece of water, and it goes down at one steady rate because a snatch shock-loads the sling and a drop puts the tender's transom into the water before her bow; the mate's tag line keeps her from swinging and the control's steady rate keeps her level. The slack sling is the signal she floats — the control stops there, before the hook can foul the tender's console.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "LOWERING RATE", readout: (v) => (v < 0.42 ? "stalled — tender hanging" : v > 0.6 ? "dropping — snatching the sling" : "steady — level to the water") },
      holdBreakNote: "The lowering rate broke — the tender snatched or dropped on the sling. Steady the control and bring her down level to the water.",
    },
    {
      id: "painter-fast", kind: "turn", target: "painter-cleat",
      title: "Cleat the painter to the swim platform",
      cue: "Take the painter from the tender's bow eye to the platform cleat: a turn round the base, figure-eights and a hitch — short enough to hold her alongside, long enough to move with the swell.",
      why: "The painter is what keeps the tender alongside the platform while everything else happens — the sling comes off, the outboard is tilted, the guests step across — and a painter dropped over a cleat with no hitch is a tender drifting off the platform with a guest halfway into her. It is hitched properly because it will be cast off in a hurry when the tender is loaded, and a proper hitch comes off in one movement while a jammed one does not.",
      turn: { turns: 1.5, label: "PAINTER HITCH", readout: (t) => (t < 0.3 ? "turn round the base" : t < 0.85 ? "figure-eights" : "hitched · alongside") },
    },
    {
      id: "outboard-tilt", kind: "select", target: "outboard-tilt",
      title: "Tilt the outboard down and start it on the cord",
      cue: "With the sling off and the painter fast, tilt the outboard down, clip the kill-cord to your wrist and the switch, and start — the engine idles alongside while the guests board.",
      why: "The outboard is tilted down only when the tender is afloat and alongside, because a leg down in the davit is a leg that meets the platform on the way past; it is started before the guests board so that a tender that will not start is discovered with nobody in her, and it is started on the cord because the switch is the one thing that stops a tender whose driver has gone over the side. Cord to the wrist, cord to the switch, then the start — in that order, every time.",
    },
    {
      id: "load-check", kind: "gauge", target: "tender-plate",
      title: "Read the load against the tender's plate",
      cue: "Count the guests for this trip, their bags and the tender's own gear against the plate on the transom — people and weight per the tender's plate — and commit the reading before the first guest steps.",
      why: "The tender's plate is her builder's statement of what she carries, and it counts everything: guests, bags, the driver, the fuel and the anchor. The count is done and committed before anyone steps because the platform is the wrong place to tell a guest they are the one too many — the decision is made at the plan board and confirmed at the transom, and the second trip takes the rest.",
      gauge: { label: "LOAD vs PLATE", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "light — room per the plate" : t <= 0.6 ? "at the plate's figure" : "over the plate — second trip"), missNote: "Outside the band — the load is counted against the plate's own figure, bags and gear included, and committed before anyone steps." },
    },
    {
      id: "steady-the-guest", kind: "hold", target: "guest-hand-hold", seconds: 5,
      title: "Steady each guest across with two hands free",
      cue: "Bags passed across first; then, one hand on the tender's grab line and the other holding the guest's hand, steady each guest as they step down into the tender and sit — and hold until they are seated.",
      why: "The step from the platform to the tender is where charter guests get hurt: the tender moves, the platform is wet, the guest looks at the water instead of their feet. The deckhand's two hands — one on the tender's grab line to hold her in, one holding the guest — are what make the step a step rather than a fall, and the hold lasts until the guest is seated because a guest standing in a tender is the next hazard.",
      holdBreakNote: "The hand came off before the guest was seated — a guest half across and unsupported. Hand back on the grab line, hand back to the guest, until they are sitting.",
    },
    {
      id: "seating-order", kind: "sequence",
      targets: ["seat-low", "grab-line", "cord-on-driver"],
      itemNames: { "seat-low": "guests seated low, weight spread", "grab-line": "every guest holding the grab line", "cord-on-driver": "kill-cord clipped to the driver" },
      outOfOrderNote: "Seated first, then the grab line, then the cord on the driver — the tender is settled before the driver's hand goes to the throttle.",
      title: "Seat the guests low, hands on the grab line, cord on the driver",
      cue: "Guests seated low on the tubes and the thwart with the weight spread, every hand on the grab line, and the kill-cord clipped to the driver's wrist — in that order — before the painter is slipped.",
      why: "A rigid inflatable is safe with the weight low and spread and everyone holding on, and it is dangerous with a guest standing up to wave or the weight all aft when the throttle opens; the order puts the tender in her stable state before the driver's hand goes near the throttle. The cord is last because it is the driver's own check that everything else is done — cord on means the tender is ready to move, and not before.",
    },
    {
      id: "nav-light-check", kind: "select", target: "tender-nav-light",
      title: "Check the tender's navigation light before slipping",
      cue: "Switch on the tender's all-round light and see it lit, even in daylight — the run back will be at dusk and the light is checked now, not found dead in the dark.",
      why: "A tender running back to the yacht at dusk without a light is invisible to every other vessel in the anchorage and outside the navigation rules that let those vessels avoid her; the light is checked in daylight because a dead lamp is discovered alongside a platform, not in the channel. It is a small step that the plan puts before the painter is slipped for exactly that reason — a tender that leaves with a dead light has nowhere to fix it.",
    },
    {
      id: "tender-log", kind: "select", target: "tender-log",
      title: "Log the launch and the trip",
      cue: "Enter the launch: the guests per trip against the plate, the driver, the drain plug and the fuel line found, the wake in the davit and the guest with the bags, the light checked, the time away and the landing.",
      why: "The tender log is where the yacht knows who is ashore and when to expect them back, and it is where the missing plug and the cracked fuel line become jobs rather than surprises for the next launch. The wake and the guest with the bags are logged because the next tender run from this anchorage needs to know that the channel traffic reaches the davit and that guests arrive at the platform with their hands full.",
    },
    {
      id: "crew-checkin", kind: "select", target: "tender-radio",
      title: "Check in with the mate and the captain before slipping",
      cue: "On the tender's radio: guests seated and counted against the plate, cord on, light on, painter ready to slip, and how the deck crew are after the wake in the davit.",
      why: "The captain lets the tender go on the strength of the driver's word that she is loaded to the plate and ready, and the mate on the platform needs to hear it before slipping the painter. It is also the crew's own check-in: a tender swinging in a davit over the platform in a wake is a small hard moment for the mate on the tag line, and the union's member assistance line is there for what the radio does not carry.",
    },
  ],

  interrupts: [
    {
      id: "wake-swings-tender",
      kind: "Wake swings the tender in the davit",
      after: "lower-steady", delay: 2, seconds: 14,
      alert: "A passing vessel's wake has rolled the yacht and the tender is swinging in the davit, outboard first, toward the swim platform rail.",
      cue: "Take up the tag line hard and hold the tender off the rail while the davit control stays where it is — the lowering stops, the swing is checked by the line, not by hands.",
      target: "tag-line",
      why: "A tender swinging on a davit is a pendulum with an outboard on the end, and the swim platform rail — and anyone at it — is what it hits. The tag line is the answer because it is the only thing that can check the swing from a distance: hands on the tender itself are hands between it and the rail. The davit control holds where it is, because lowering a swinging tender puts her transom into the water on the swing and rolls her.",
      missNote: "The tender swung into the platform rail outboard first, the mate reached to fend her off by hand and took the leg across the forearm, and the sling snatched on the rebound.",
      wrongNote: "The tag line — the swing is checked with the line from a distance; nobody's hands go between the tender and the rail, and the davit holds.",
    },
    {
      id: "guest-both-hands-full",
      kind: "Guest arrives at the platform with both hands full",
      after: "steady-the-guest", delay: 2, seconds: 14,
      alert: "The next guest has come down to the swim platform with a bag in each hand and is already lifting a foot toward the tender's tube.",
      cue: "Stop them with a word and take the bags across to the bag pass point in the tender first — then the guest steps with two hands free.",
      target: "bag-pass-point",
      why: "A guest stepping with both hands full has no hand for the grab line and none for the deckhand, and the tender's tube under a foot is not a step; it is the fall between the hulls the whole transfer is arranged to prevent. The bags go first, to the pass point in the tender where they are stowed low, and then the guest steps with the two hands the step needs — no exceptions for a small bag or a short step.",
      missNote: "The guest stepped with both bags, the tender moved under the foot, and they went between the tube and the platform with the bags on top of them.",
      wrongNote: "The bag pass point — the bags cross first and are stowed low; the guest steps after, with both hands free.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, YC7_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 26, 0.02, 26, 0, 0.012, 0, 0xffffff, { rough: 0.12, metal: 0.3, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#12343e", mid: "#1c4e5c", crest: 300 }), { repeat: 5, px: 512 }), { rough: 0.12, metal: 0.3, color: 0xa8c8d8 });

    // ------------------------------------------------- the yacht at anchor
    const yacht = motorYacht(g, 2.2, -1.2, 9.4, { livery: { fleetName: "ESTUARY LADY", unitNumber: "MY-24" } });
    const P = yacht.userData.parts;
    P.tender.visible = false;                         // the station's own tender does the work
    const DECK = 1.25;
    const deck = group(g, 2.2, DECK, 0);
    // The station's tender: in her chocks on the aft deck, then in the water alongside the platform.
    const tender = yachtTender(g, 1.9, DECK + 0.1, -1.2, { ry: 0.2 });
    const T = tender.userData.parts;
    holoTag(tender, "tender", 0, 1.6, 0, { css: YC7_CSS, w: 0.2 });
    const tenderChocks = tender.position.clone();
    const tenderAfloat = new THREE.Vector3(-1.4, -0.25, -3.6);
    holoTag(T.killCord, "kill-cord", 0, 0.2, 0, { css: YC7_CSS, w: 0.22 });
    reg(hits, T.killCord, "kill-cord");
    holoTag(T.outboard, "outboard — tilt & start", 0, 1.0, 0, { css: YC7_CSS, w: 0.42 });
    reg(hits, T.outboard, "outboard-tilt");
    const startHit = box(T.outboard, 0.3, 0.3, 0.3, 0, 0.7, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(T.outboard, "start — cord still on the console?", 0, 1.3, -0.2, { css: "#d2312b", w: 0.6 });
    reg(hits, startHit, "start-no-cord");
    holoTag(T.navLight, "navigation light", 0, 0.7, 0, { css: YC7_CSS, w: 0.32 });
    reg(hits, T.navLight, "tender-nav-light");
    const plug = box(tender, 0.08, 0.08, 0.04, 0.4, 0.15, -2.1, 0xd2312b, { rough: 0.5, emissive: 0x4a0808, ei: 0.4 });
    holoTag(tender, "drain plug", 0.4, 0.4, -2.1, { css: YC7_CSS, w: 0.24 });
    reg(hits, plug, "drain-plug-out");
    const fuelLine = hose(tender, [[0, 0.6, -1.3], [0.1, 0.5, -1.7], [0, 0.7, -2.0]], 0.012, 0x2b3138, { steps: 6, rough: 0.8 });
    void fuelLine;
    const crackSpot = box(tender, 0.05, 0.05, 0.05, 0.05, 0.62, -1.85, 0xd2312b, { rough: 0.5, emissive: 0x4a0808, ei: 0.4 });
    reg(hits, crackSpot, "fuel-line-cracked");
    const plate = box(tender, 0.14, 0.08, 0.01, -0.5, 0.7, -2.05, 0xc8ced4, { rough: 0.35, metal: 0.5 });
    holoTag(tender, "tender's plate", -0.5, 0.95, -2.05, { css: YC7_CSS, w: 0.3 });
    reg(hits, plate, "tender-plate");
    const sling = group(tender, 0, 0.9, -0.3);
    const slingRing = torus(sling, 0.08, 0.015, 0, 0.3, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 14 });
    for (const [sx, sz] of [[0.6, 0.9], [-0.6, 0.9], [0.6, -1.2], [-0.6, -1.2]]) hose(sling, [[0, 0.3, 0], [sx, -0.3, sz]], 0.008, 0xf2c14b, { steps: 3, rough: 0.8 });
    void slingRing;
    holoTag(sling, "lifting sling", 0, 0.6, 0, { css: YC7_CSS, w: 0.26 });
    reg(hits, sling, "lifting-sling");
    const grab = hose(tender, [[0.7, 0.75, 0.6], [0.72, 0.85, -0.2], [0.7, 0.75, -1.0]], 0.01, 0x2b3138, { steps: 6, rough: 0.8 });
    holoTag(tender, "grab line", 0.75, 1.1, -0.2, { css: YC7_CSS, w: 0.22 });
    reg(hits, grab, "grab-line");
    const seatSpot = box(tender, 0.9, 0.02, 0.6, 0, 0.46, 0.3, YC7_ACCENT, { emissive: YC7_ACCENT, ei: 1.0, rough: 0.4, cast: false, opacity: 0.5, transparent: true });
    holoTag(tender, "seat low — weight spread", 0, 0.9, 0.5, { css: YC7_CSS, w: 0.46 });
    reg(hits, seatSpot, "seat-low");
    const bagPoint = box(tender, 0.5, 0.02, 0.4, 0, 0.46, 1.2, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.8, rough: 0.4, cast: false, opacity: 0.5, transparent: true });
    holoTag(tender, "bag pass point", 0, 0.9, 1.3, { css: YC7_CSS, w: 0.3 });
    reg(hits, bagPoint, "bag-pass-point");
    const standHit = box(tender, 0.5, 0.6, 0.5, 0, 0.9, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(tender, "stand up to reach?", 0, 1.35, 0.2, { css: "#d2312b", w: 0.4 });
    reg(hits, standHit, "stand-in-tender");
    const cordOnDriver = box(tender, 0.2, 0.2, 0.2, 0.2, 1.0, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(tender, "cord on the driver", 0.2, 1.3, -0.6, { css: YC7_CSS, w: 0.34 });
    reg(hits, cordOnDriver, "cord-on-driver");
    // Davit hook and control, the tag line, the painter cleat on the platform.
    const hook = group(g, P.davit.position.x + 2.2 - 1.4, DECK + 2.1, -1.2);
    const hookMesh = torus(hook, 0.1, 0.025, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8, seg2: 16 });
    hookMesh.rotation.y = Math.PI / 2;
    const hookRing = torus(hook, 0.2, 0.01, 0, 0, 0, YC7_ACCENT, { emissive: YC7_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    hookRing.rotation.y = Math.PI / 2;
    holoTag(hook, "davit hook", 0, 0.35, 0, { css: YC7_CSS, w: 0.24 });
    reg(hits, hook, "davit-hook");
    const control = instrument(deck, -0.2, 1.0, -0.2, { ry: 0.4, idle: "DAVIT · HOLD", color: YC7_ACCENT, w: 0.12, d: 0.2 });
    box(deck, 0.3, 1.0, 0.3, -0.2, 0.5, -0.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(control, "davit control", 0, 0.18, 0, { css: YC7_CSS, w: 0.28 });
    reg(hits, control, "davit-control");
    const tagLine = group(deck, -1.4, 0.6, -0.4);
    hose(tagLine, [[0, 0, 0], [0.6, 0.4, -0.4], [1.2, 0.9, -0.8]], 0.01, 0xe8dcb8, { steps: 6, rough: 0.85 });
    for (let i = 0; i < 3; i++) { const c = torus(tagLine, 0.1 - i * 0.015, 0.012, 0, 0.02 * i, 0, 0xe8dcb8, { rough: 0.85, seg: 6, seg2: 14 }); c.rotation.x = Math.PI / 2; }
    holoTag(tagLine, "tag line", 0, 0.3, 0, { css: YC7_CSS, w: 0.2 });
    reg(hits, tagLine, "tag-line");
    const platform = group(g, 2.2, 0.35, -3.3);
    const cleat = group(platform, -1.6, 0.06, 0.2);
    box(cleat, 0.3, 0.08, 0.09, 0, 0.04, 0, 0xe4e8ec, { rough: 0.22, metal: 0.55 });
    const painter = hose(g, [[-1.4, 0.2, -1.5], [0.0, 0.35, -2.6], [0.6, 0.45, -3.1]], 0.012, 0xe8dcb8, { steps: 8, rough: 0.85 });
    painter.visible = false;
    holoTag(cleat, "platform cleat — painter", 0, 0.4, 0, { css: YC7_CSS, w: 0.44 });
    reg(hits, cleat, "painter-cleat");
    const handHold = box(platform, 0.5, 0.6, 0.5, -1.0, 0.6, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(platform, "steady the guest — two hands", -1.0, 1.2, 0.2, { css: YC7_CSS, w: 0.5 });
    reg(hits, handHold, "guest-hand-hold");
    const bagsHit = box(platform, 0.4, 0.4, 0.4, -0.2, 0.5, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(platform, "step with a bag in each hand?", -0.2, 1.05, 0.4, { css: "#d2312b", w: 0.58 });
    reg(hits, bagsHit, "step-with-bags");
    // Guests waiting on the platform; the extra guest hazard; the guest with bags who arrives on the interruption.
    const guestA = standingFigure(platform, 0.6, 0.3, { ry: -1.2, cloth: 0x6a4a8a, trousers: 0x2b3138, atStation: true });
    holoTag(guestA, "guest", 0, 1.9, 0, { css: YC7_CSS, w: 0.18 });
    const extra = standingFigure(deck, 1.6, -2.6, { ry: Math.PI, cloth: 0x3a6f4a, trousers: 0x2b3138, atStation: true });
    const extraRing = torus(extra, 0.36, 0.012, 0, 0.03, 0, 0xd2312b, { emissive: 0xd2312b, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    extraRing.rotation.x = Math.PI / 2;
    holoTag(extra, "one more — past the plate?", 0, 1.95, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, extra, "extra-guest");
    const bagGuest = standingFigure(platform, 1.1, 0.9, { ry: -0.6, cloth: 0x8a4a4a, trousers: 0x2b3138, atStation: true });
    for (const sx of [-0.28, 0.28]) box(bagGuest, 0.2, 0.3, 0.14, sx, 0.55, 0.05, 0x2b3138, { rough: 0.8 });
    bagGuest.visible = false;
    holoTag(bagGuest, "guest — both hands full", 0, 1.9, 0, { css: "#d2312b", w: 0.42 });
    // Boards, radio, PFD hook.
    const plan = holoPanel(deck, 0.8, 0.54, -1.0, 1.4, 1.08, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC7_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("TENDER PLAN", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Load: per the tender's plate · bags count", "Driver: deckhand · cord on before every start", "Davit: mate on the tag line · captain's word",
       "Landing: marina dinghy dock · trips as needed", "Bags first · then the guest · two hands free", "Light on before slipping · radio check"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { accent: YC7_ACCENT });
    reg(hits, plan, "tender-plan-board");
    const log = holoPanel(deck, 0.5, 0.36, 0.4, 1.4, 1.08, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC7_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("TENDER LOG", w * 0.06, h * 0.17);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Trip: —", "Found: —", "Remarks: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
    }, { accent: YC7_ACCENT });
    reg(hits, log, "tender-log");
    const radio = instrument(deck, -2.4, 0.55, -1.0, { ry: 0.5, idle: "CH · TENDER", color: YC7_ACCENT, w: 0.1, d: 0.16 });
    box(deck, 0.24, 0.5, 0.24, -2.4, 0.25, -1.0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(radio, "tender radio", 0, 0.16, 0, { css: YC7_CSS, w: 0.28 });
    reg(hits, radio, "tender-radio");
    const hookPost = group(deck, -2.0, 0, 1.0);
    cyl(hookPost, 0.02, 0.02, 1.4, 0, 0.7, 0, 0xc8ced4, { rough: 0.45, metal: 0.6, seg: 8 });
    const pfd = group(hookPost, 0.16, 1.05, 0);
    box(pfd, 0.24, 0.36, 0.1, 0, 0, 0, 0xf06a2b, { rough: 0.8 });
    box(pfd, 0.24, 0.05, 0.11, 0, 0.06, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(hookPost, "driver's life jacket", 0.16, 1.4, 0, { css: YC7_CSS, w: 0.38 });
    reg(hits, pfd, "tender-pfd");
    const mate = standingFigure(deck, -1.6, -1.4, { ry: 0.6, cloth: 0x1f3a52, trousers: 0x2b3138, vest: 0xf06a2b, gloves: true, atStation: true });
    holoTag(mate, "mate — on the davit", 0, 1.9, 0, { css: YC7_CSS, w: 0.38 });
    holoTag(g, "captain — flybridge", 2.2, DECK + 4.4, 5.5, { css: YC7_CSS, w: 0.36 });
    const wake = box(g, 10, 0.012, 0.6, -2, 0.03, -7.0, 0xcfe8ee, { rough: 0.3, emissive: 0x9fd8e8, ei: 0.4, cast: false });
    wake.visible = false;

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.6, 1.2, -1.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "jacket-and-cord") { pfd.visible = false; T.killCord.position.y -= 0.2; }
        if (step.id === "tender-walk") { plug.material = mat(0x2b3138, { rough: 0.6 }); crackSpot.material = mat(0x2b3138, { rough: 0.8 }); }
        if (step.id === "sling-on-hook") { sling.position.y = 1.6; hookRing.visible = false; }
        if (step.id === "lower-steady") { tender.position.copy(tenderAfloat); tender.rotation.y = 0.9; sling.visible = false; repaint(control.userData.screen, signFace("DAVIT · SLACK", { bg: "#0d1c24", accent: YC7_CSS, fg: "#bfeaf7", scale: 0.5 })); }
        if (step.id === "painter-fast") painter.visible = true;
        if (step.id === "outboard-tilt") { T.outboard.rotation.x = 0; T.killCord.position.y += 0.2; }
        if (step.id === "load-check") holoTag(tender, "load · at the plate", -0.5, 1.15, -2.05, { css: "#59c97b", w: 0.36 });
        if (step.id === "steady-the-guest") { guestA.position.set(-3.6, -0.5, -0.5); guestA.rotation.y = 0.9; }
        if (step.id === "seating-order") seatSpot.visible = false;
        if (step.id === "nav-light-check") T.navLight.traverse((o) => { if (o.isMesh) o.material = mat(0xfff2cc, { emissive: 0xfff2cc, ei: 2.0 }); });
        if (step.id === "tender-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dcefff"; cx.fillText("TENDER LOG", w * 0.06, h * 0.17);
            cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ea";
            ["Trip: guests per the plate · driver deckhand", "Found: drain plug · fuel line", "Remarks: wake in davit · guest with bags"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("READY TO SLIP", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "wake-swings-tender") { wake.visible = true; tender.rotation.z = 0.15; tender.position.x = tenderChocks.x - 0.5; }
        if (it.id === "guest-both-hands-full") bagGuest.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wake-swings-tender") { tender.rotation.z = 0; tender.position.x = tenderChocks.x; wake.visible = false; tagLine.position.z = -0.8; }
        if (it.id === "guest-both-hands-full") { bagGuest.children.slice(-2).forEach((b) => { b.visible = false; }); bagGuest.position.set(0.9, 0, 0.9); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.006; waterTex.offset.y = t * 0.005; }
        if (step?.id === "lower-steady" && session.holding) { const v = session.track?.v ?? 0.5; tender.position.y = Math.max(tenderAfloat.y, tender.position.y - (dt ?? 0.016) * 0.25 * v); tender.position.x = tenderChocks.x + (tenderAfloat.x - tenderChocks.x) * Math.min(1, (tenderChocks.y - tender.position.y) / (tenderChocks.y - tenderAfloat.y)); }
        if (tender.position.y < 0.2) tender.position.y = tenderAfloat.y + Math.sin(t * 1.5) * 0.03;
        if (session?.turn && step?.id === "painter-fast") painter.visible = session.turn.amount > 0.6;
        if (wake.visible) wake.position.z = -7.0 + Math.sin(t * 2) * 0.8;
        void CITY;
      },
    };
  },
};
