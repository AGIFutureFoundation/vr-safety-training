import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, hose, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, cone,
  reg, surfaceTexture, texturedMat, pavingFace, roadwayFace,
} from "../citykit.js";
import { pickup, sedan } from "../../../shared/fleet.js";
import { radio, hammer } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bearing Replacement & Jacking VR — Bridge and Structural Trades.
//
// A highway overpass pier, the lane under the span closed to the traffic
// control plan, and the centre girder jacked off its worn elastomeric bearing
// so a new one can go in. The bridge maintenance crew — Ironworkers on the
// jacks, LIUNA laborers on the lane closure — follows the engineer's jacking
// plan: the jack on its marked point, safety cribbing built beside it and kept
// tight, the load watched on the gauge, the lift read on a dial indicator,
// the lock ring run down, the bearing swapped and the girder let down again.
// The allowable lift and the load per jack are "per the jacking plan": this
// file does not know them and never states a number for them.

const BBJ_ACCENT = 0x5fb3a8;
const BBJ_CSS = "#5fb3a8";
const BBJ_CAP = 1.25;               // bearing seat height on the pier cap
const BBJ_CAPZ = -1.25;             // pier cap centre line

export const SIM_BS_BEARING_REPLACEMENT_AND_JACKING = {
  id: "bs-bearing-replacement-and-jacking",
  index: "320",
  domain: "Construction & Structural Trades",
  trade: "Ironworker bridge maintenance crew with LIUNA traffic control — girder jacking and bearing replacement",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "Ironworkers IMPACT bridge and structural maintenance training and the LIUNA Training and Education Fund flagger and work-zone curriculum; the engineer of record's jacking plan; OSHA 29 CFR 1926.305 jacks (rated capacity, firm footing, blocking) and 29 CFR 1926 Subpart R; the MUTCD temporary traffic control plan for the lane under the span; AASHTO bridge maintenance practice for bearing replacement",
  name: "Bearing Replacement & Jacking",
  title: simTitle("Bearing Replacement & Jacking"),
  tagline: "A girder lifted off its bearing to the engineer's plan: the lane under the span closed, the seat and the kit inspected, the jack set on its point, cribbing built beside it, the load watched on the gauge, the lift read on the dial, the lock ring run down, the old bearing out and the new one in, and the girder let down again slowly",
  accent: BBJ_ACCENT,
  accentCss: BBJ_CSS,
  parSeconds: 310,
  footprint: 2.6,
  badge: { id: "cribbed-and-locked", name: "Cribbed And Locked", note: "A girder that never hung on hydraulics alone: cribbing tight under it, the lock ring down, and the lift held to the plan" },

  supportLine: "your Ironworkers or LIUNA local's member assistance programme, or the employee assistance line posted on the contractor's site board",

  game: system({
    name: "Bearing Crew",
    currency: "LIFT",
    ranks: ["Apprentice", "Jack Hand", "Bearing Setter", "Jacking Lead", "Bearing Crew Certified"],
    badges: [
      { id: "load-on-the-gauge", name: "Load On The Gauge", note: "The jack's load held inside the plan's band the whole lift", test: AWARD.unbroken },
      { id: "seat-read", name: "Seat Read", note: "Every defect in the seat and the kit found first look", test: AWARD.stepClean("seat-find") },
      { id: "never-on-hydraulics", name: "Never On Hydraulics", note: "No hand under the girder, no work beside a jack with no crib, no step into the live lane, no pumping past the plan", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-swap", name: "Clean Swap", note: "No corrections through the whole bearing swap", test: AWARD.clean },
      { id: "lift-on-the-mark", name: "Lift On The Mark", note: "The lift committed inside the plan's band first time", test: AWARD.precise(0.7) },
      { id: "lane-back-early", name: "Lane Back Early", note: "Bearing logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hand-under-girder": "You reached in between the girder and the pier cap to pull the bearing while the girder was held up by the jack alone. A hydraulic jack holds a load only as long as every seal and fitting in it holds, and a girder settling even a finger's width onto a hand is a crush injury. OSHA's jack rule asks for the load to be blocked or cribbed as it rises; nobody puts a body part where the girder would land.",
    "jack-no-crib": "You went to work beside the west girder's jack, which has no cribbing under the girder beside it. A jack is a lifting device, not a support: if it bleeds down, the only thing that stops the girder is cribbing built up to it as it rose. A jacked girder with no crib beside it is a girder standing on a seal.",
    "live-lane": "You stepped past the cones into the open traffic lane. The traffic control plan closes one lane under the span for the crew and leaves the other running at speed; drivers are watching the cones, not for a person stepping out between them. The work stays inside the channelised lane.",
    "pump-past-limit": "You went to keep pumping the jack for a little more room. The jacking plan limits the lift because the girder, its diaphragms and the deck over it are continuous with the girders beside it: lift one too far and the deck slab and cross-frames take bending they were never designed for. The lift stops at the plan's figure, whatever the old bearing's grip.",
  },

  lateNotes: {
    "load-gauge": "The load is taken on the gauge once the jack is on its point and the crib stack is built beside it — pumping before the crib is there is lifting on hydraulics alone.",
    "old-bearing": "The old bearing comes out once the lift is read and the lock ring is down — not while the girder is held by oil pressure.",
    "release-valve": "The girder is let down once the new bearing is centred on its seat and the crib stack has been lowered to follow it.",
  },

  steps: [
    {
      id: "jacking-plan", kind: "select", target: "jacking-plan",
      title: "Read the engineer's jacking plan",
      cue: "Read the plan: jack locations and capacity, the load per jack, the maximum lift, the cribbing, the sequence, and the traffic control under the span.",
      why: "A girder in a bridge is not a free piece of steel: it is tied to its neighbours by cross-frames and to the deck slab over it, so lifting one end moves everything connected to it. The engineer's jacking plan sets where the jacks go, how much load each takes, how far the girder may be lifted and what cribbing follows it, so that the lift frees the bearing without cracking the deck or overstressing a diaphragm. It is read before a jack comes off the truck.",
    },
    {
      id: "traffic-control", kind: "sequence",
      targets: ["advance-sign", "taper-cones", "work-cones"],
      itemNames: { "advance-sign": "advance warning sign set upstream", "taper-cones": "the taper closing the lane", "work-cones": "cones along the work area under the span" },
      outOfOrderNote: "Advance warning first, then the taper, then the work-area cones — a taper with no warning ahead of it is a wall of cones drivers meet at speed.",
      title: "Close the lane under the span to the traffic control plan",
      cue: "Set the advance warning sign upstream, then the taper that closes the lane, then the cones along the work area under the span.",
      why: "The MUTCD's temporary traffic control is built in the direction traffic arrives from: drivers need the warning before they meet the taper, and the taper before they meet the work. Laid out the other way round, the crew setting the last cones is standing in a live lane with nothing upstream to slow anybody down. The lane under the jacking stays closed for the whole lift, because anything dropped from the pier cap lands in it.",
    },
    {
      id: "seat-find", kind: "find", noHint: true,
      targets: ["spalled-seat", "weeping-coupling", "split-crib"],
      itemNames: {
        "spalled-seat": "spalled concrete at the edge of the jacking point",
        "weeping-coupling": "oil weeping from the spare jack's hose coupling",
        "split-crib": "a split crib block in the cribbing pile",
      },
      itemNotes: {
        "spalled-seat": "The pier cap's edge under the west girder's jacking point has spalled back to the reinforcing steel. A jack bearing on broken concrete can punch through it or kick sideways under load, which is why the plan names the jacking point and nobody moves it without the engineer.",
        "weeping-coupling": "The spare jack's hose coupling is wet with oil. A weeping fitting is a fitting that will let go under pressure, and it is tagged out before anyone uses that jack as a back-up.",
        "split-crib": "One crib block has a split running most of its length. Cribbing works by carrying load across its grain; a split block can fail in the stack, and a stack is only as strong as its worst block.",
      },
      title: "Inspect the seat, the jacks and the cribbing",
      cue: "Look over the pier cap at the jacking points, the jacks and hoses, and the cribbing before anything takes load.",
      why: "Everything that will carry the girder for the next hour is looked at before it carries anything: the concrete the jack bears on, the hydraulics that lift it, and the timber that will hold it if the hydraulics do not. OSHA's jack rule requires a firm, level footing and a jack in sound condition, and each of these three defects is a way a girder comes down with nobody having done anything wrong on the day.",
    },
    {
      id: "set-jack", kind: "drag", target: "jack",
      title: "Set the jack on its marked point",
      cue: "Carry the jack to the point the plan marks under the centre girder's end, plumb, with its base fully on sound concrete.",
      why: "The jacking point is where the engineer checked the girder's flange and web can take a concentrated load, and where the pier cap can take it too. A jack set a hand's width off the mark bears on flange that may buckle or on concrete near an edge that may break, and a jack that is not plumb pushes sideways as it lifts. It goes exactly on the mark, square.",
      drag: { to: "jack-point", radius: 0.35, missNote: "Not on the jacking point — the jack goes on the mark the plan gives under the centre girder, not wherever there is room." },
    },
    {
      id: "crib-stack", kind: "select", target: "crib-pile",
      title: "Build the safety crib stack beside the jack",
      cue: "Build the crib stack up under the girder beside the jack, crossed in layers, and shim it snug to the flange before the lift starts.",
      why: "Cribbing is what the girder rests on if the jack fails, and it only does that job if it is built before the lift and kept tight during it. Crossed layers spread the load across the grain, and shims keep the gap between the top of the stack and the flange to almost nothing, so that a jack that bleeds down drops the girder a few millimetres onto timber instead of all the way onto the old bearing and whoever is near it.",
    },
    {
      id: "load-gauge", kind: "track", target: "load-gauge", seconds: 7,
      title: "Take the load on the jack and watch the gauge",
      cue: "Pump the jack slowly and keep the load reading inside the band the plan predicts for this girder as it takes the weight off the bearing.",
      why: "The gauge is how the crew sees the girder: a reading climbing well past what the plan predicts means the girder is binding on something the engineer did not expect — a seized bearing, a diaphragm, debris — and the jack is now fighting the structure rather than lifting a girder. Pumped slowly and watched, the load comes off the bearing smoothly; pumped by feel, the first sign of trouble is a crack in the deck.",
      track: { start: 0.18, green: [0.4, 0.6], rise: 0.52, fall: 0.44, drift: 0.12, label: "JACK LOAD", readout: (v) => (v < 0.4 ? "under the plan — still on the bearing" : v > 0.6 ? "over the plan — girder binding" : "inside the plan's band") },
      holdBreakNote: "The load reading left the plan's band while nobody was watching it. Stop pumping, find out why, and bring it back.",
    },
    {
      id: "lift-dial", kind: "gauge", target: "dial-indicator",
      title: "Read the lift on the dial indicator",
      cue: "Watch the dial indicator on the girder flange and stop the lift at the plan's figure — enough to free the bearing and no more.",
      why: "The lift is measured, not judged by eye: the dial indicator reads the girder's movement off the pier cap directly, and the plan's maximum is the most the deck and the cross-frames can take without damage. The bearing needs only enough clearance to slide out; every millimetre past that is bending put into a continuous structure for no reason.",
      gauge: {
        label: "LIFT", speed: 0.68, green: [0.44, 0.6],
        readout: (t) => (t < 0.44 ? "bearing still gripped" : t <= 0.6 ? "clear of the bearing, inside the plan" : "past the plan's maximum lift"),
        missNote: "Off the plan's lift — under it the bearing will not slide out, over it the deck is taking bending. Read the dial again.",
      },
    },
    {
      id: "lock-ring", kind: "hold", target: "lock-ring", seconds: 5,
      title: "Run the lock ring down and hold it while the load transfers",
      cue: "Spin the jack's lock ring down onto its body and hold it there while the pump is eased back, so the load sits on the ring and not on the oil.",
      why: "A hydraulic jack under load is holding a girder on a column of oil behind a seal. The lock ring turns it into a mechanical post: run down tight to the body and then loaded as the pressure is eased off, it holds the girder even if a hose or a seal lets go. The ring is held down while the load transfers, and only once it is carrying the girder does anybody reach toward the bearing.",
      holdBreakNote: "The lock ring came off the body before the load was on it — the girder is back on the oil. Run it down and hold it again.",
    },
    {
      id: "old-bearing", kind: "select", target: "old-bearing",
      title: "Pull the old bearing out from the side",
      cue: "Slide the old bearing out sideways with the puller bar, from beside the girder — never reaching in underneath it.",
      why: "The worn bearing comes out from the side with a bar or a puller, with the girder sitting on its lock ring and its cribbing, because the space between the flange and the seat is exactly where the girder lands if anything gives. Its condition is noted as it comes out — split, walked or bulged — because that is the engineer's evidence for why the bearings are being replaced and whether the others need to be.",
    },
    {
      id: "new-bearing", kind: "drag", target: "new-bearing",
      title: "Set the new bearing centred on the seat",
      cue: "Carry the new elastomeric bearing to the cleaned seat and centre it on the layout marks under the girder.",
      why: "An elastomeric bearing carries the girder's load and lets it move as the bridge expands and contracts, and it only does both if it sits flat, centred and square on a clean seat. Set off-centre it is loaded on one edge, which makes it bulge and walk out over the seasons, which is usually how the old one failed in the first place.",
      drag: { to: "bearing-seat", radius: 0.3, missNote: "Not on the seat marks — the new bearing is centred on the layout marks under the girder, flat on the cleaned seat." },
    },
    {
      id: "release-valve", kind: "turn", target: "release-valve",
      title: "Let the girder down slowly onto the new bearing",
      cue: "Back the lock ring off, then crack the release valve open slowly, lowering the crib stack with the girder, until the girder sits on the new bearing.",
      why: "Letting a girder down is the lift in reverse and it is just as controlled: the lock ring comes up, the cribbing is taken down layer by layer to follow the girder, and the release valve is opened a little at a time. Opened fast, the girder drops onto the new bearing in a jolt that can tear it or crack the concrete of the seat, and the crib is left high and dry.",
      turn: { turns: 1, label: "RELEASE VALVE", readout: (t) => (t < 0.95 ? "lowering — crib following" : "seated on the new bearing") },
    },
    {
      id: "seat-check", kind: "gauge", target: "feeler-gauge",
      title: "Check the girder is seated on the new bearing",
      cue: "Work the feeler gauge round the new bearing's edges and commit when it will not enter anywhere — the girder bearing evenly, the pad not rolled or shifted.",
      gauge: {
        label: "SEATING", speed: 0.7, green: [0.42, 0.58],
        readout: (t) => (t < 0.42 ? "gauge enters at the north edge" : t <= 0.58 ? "no gap at any edge" : "gauge enters at the south edge"),
        missNote: "The feeler still enters under one edge — the girder is bearing on part of the pad. Re-seat it while the jack is still in place.",
      },
      why: "A bearing that is seated on three edges and gapped on the fourth is carrying the girder on a corner, which is how the old one was destroyed. The feeler gauge check is quick and it is the only way to know from outside that the girder's full flange is bearing on the full pad; anything the gauge finds is fixed now, while the jack is still in place and the lane is still closed.",
    },
    {
      id: "jack-log", kind: "select", target: "jack-log",
      title: "Log the bearing change",
      cue: "Record the lift and the load read, the old bearing's condition, the defects tagged out, the weeping hose and the cone knocked down in the taper.",
      why: "The jacking log is the engineer's record of what the girder actually did: the load it took to lift and how far it moved, set against what the plan predicted, and the condition of the bearing that came out. It is also where the tagged-out jack and the struck cone become work orders, so the next girder on this pier starts with sound kit and a taper the crew trusts.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the flagger",
      cue: "Call the foreman and the flagger: bearing set, lane ready to be picked up. Then check in with the crew about the struck cone and the leaking hose.",
      why: "The flagger picks up the lane only on this call, and the foreman moves the jacks to the next girder around it. It is also the crew's check-in: a truck mirror taking out a cone in the taper and a jack bleeding down under a girder are both moments that stay with the people who were beside them, and the building trades' practice is to say so on the radio and name the member assistance line with it.",
    },
  ],

  interrupts: [
    {
      id: "cone-struck",
      kind: "Taper cone knocked down",
      after: "load-gauge", delay: 2, seconds: 12,
      alert: "A truck's mirror has clipped the taper and flattened a cone, leaving a gap in the line that closes the lane under the span.",
      cue: "Stand the cone back up and close the gap in the taper.",
      target: "struck-cone",
      why: "A taper with a cone missing is an opening drivers read as a way through, straight toward the crew under the span. The laborer on the lane resets it immediately, from the closed side, and the pumping waits: a gap in the traffic control outranks the reading on the gauge.",
      missNote: "The gap stayed open for the rest of the lift; a van followed the line of cones through it and braked to a stop inside the closed lane a few metres from the pier cap.",
      wrongNote: "The struck cone — the taper has an opening in it now, and the lane under the span is not closed until it is back.",
    },
    {
      id: "hose-weeping",
      kind: "Jack losing pressure",
      after: "lock-ring", delay: 2, seconds: 12,
      alert: "Oil is spraying from the jack's hose coupling and the load gauge is falling — the girder is settling toward whatever is under it.",
      cue: "Drive the crib shims tight so the girder settles onto the cribbing, not the failing jack.",
      target: "crib-shims",
      why: "This is the failure the cribbing was built for. Driven tight, the shims close the last gap between the stack and the flange, so the girder settles onto timber a millimetre down rather than onto the old bearing and the hands near it. The jack is isolated and swapped only once the girder is resting on the crib.",
      missNote: "The girder settled a finger's width onto the old bearing's edge as the jack bled down; the crib stack caught it, but only after the last shim fell out of the gap.",
      wrongNote: "The crib shims — the jack is failing, and the cribbing is the only thing that can take the girder now.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBJ_ACCENT);

    // ----------------------------------------------- ground and the road under the span
    const ground = box(g, 12.0, 0.04, 4.0, 0, 0.02, 1.0, 0xffffff);
    ground.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#58544c", base2: "#4d4a43", seam: "rgba(0,0,0,0.25)" }), { repeat: 5, px: 512 }), { rough: 0.97, color: 0xc8c2b4 });
    const road = box(g, 7.2, 0.03, 14.0, 0, 0.02, -6.2, 0xffffff);
    road.rotation.y = Math.PI / 2;
    road.material = texturedMat(surfaceTexture((cx, w, h) => roadwayFace(cx, w, h, { lanes: 2 }), { repeat: 1, px: 512 }), { rough: 0.9, color: 0xd4d4d4 });

    // ----------------------------------------------- pier cap, girders, deck
    const capMat = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#9a968c", base2: "#8f8b81", seam: "rgba(0,0,0,0.14)" }), { repeat: 1, px: 256 }), { rough: 0.95, color: 0xe4e0d6 });
    const cap = box(g, 6.4, 0.6, 1.2, 0, BBJ_CAP - 0.3, BBJ_CAPZ, 0xffffff);
    cap.material = capMat;
    for (const x of [-2.2, 2.2]) { const c = box(g, 0.8, BBJ_CAP - 0.6, 0.8, x, (BBJ_CAP - 0.6) / 2, BBJ_CAPZ, 0xffffff); c.material = capMat; }
    const steel = 0x7d9098;
    const girders = [-1.8, 0, 1.8].map((x) => {
      const gr = group(g, x, BBJ_CAP + 0.06, -3.9);
      box(gr, 0.6, 0.04, 6.2, 0, 0.02, 0, steel, { rough: 0.55, metal: 0.45 });
      box(gr, 0.025, 0.86, 6.2, 0, 0.47, 0, steel, { rough: 0.55, metal: 0.45 });
      box(gr, 0.4, 0.04, 6.2, 0, 0.92, 0, steel, { rough: 0.55, metal: 0.45 });
      return gr;
    });
    const centre = girders[1];
    const deck = box(g, 5.2, 0.2, 6.2, 0, BBJ_CAP + 1.12, -3.9, 0xffffff);
    deck.material = capMat;
    // Bearings under the outside girders, and the worn one under the centre girder.
    for (const x of [-1.8, 1.8]) box(g, 0.4, 0.06, 0.3, x, BBJ_CAP + 0.03, BBJ_CAPZ, 0x2b2b2b, { rough: 0.9 });
    const oldBearing = box(g, 0.4, 0.06, 0.3, 0, BBJ_CAP + 0.03, BBJ_CAPZ, 0x3a2e24, { rough: 0.95 });
    oldBearing.scale.x = 1.12;
    holoTag(g, "worn bearing", 0, BBJ_CAP + 0.2, BBJ_CAPZ + 0.3, { css: BBJ_CSS, w: 0.22 });
    reg(hits, oldBearing, "old-bearing");
    const seatSocket = box(g, 0.4, 0.06, 0.3, 0, BBJ_CAP + 0.03, BBJ_CAPZ, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["bearing-seat"] = seatSocket;
    const gapHit = box(g, 0.5, 0.08, 0.2, 0.3, BBJ_CAP + 0.05, BBJ_CAPZ + 0.45, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reach under to pull it?", 0.55, BBJ_CAP + 0.28, BBJ_CAPZ + 0.62, { css: "#d2312b", w: 0.42 });
    reg(hits, gapHit, "hand-under-girder");
    // The spalled edge at the west girder's jacking point.
    const spall = box(g, 0.34, 0.1, 0.08, -1.8, BBJ_CAP - 0.05, BBJ_CAPZ + 0.58, 0x6a5a48, { rough: 1.0 });
    reg(hits, spall, "spalled-seat");
    // The west girder's jack, standing alone with no crib beside it.
    const westJack = group(g, -1.8, BBJ_CAP, BBJ_CAPZ + 0.42);
    cyl(westJack, 0.08, 0.09, 0.05, 0, 0.025, 0, 0x2f6fd0, { rough: 0.5, metal: 0.4, seg: 12 });
    const wjHit = box(westJack, 0.4, 0.3, 0.4, 0, 0.3, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(westJack, "work beside it — no crib?", 0, 0.45, 0.25, { css: "#d2312b", w: 0.44 });
    reg(hits, wjHit, "jack-no-crib");

    // ----------------------------------------------- the centre jack, crib, dial
    const JZ = BBJ_CAPZ + 0.4;
    const jack = group(g, 1.3, 0, 0.9);
    const jackBody = cyl(jack, 0.09, 0.1, 0.16, 0, 0.08, 0, 0x2f6fd0, { rough: 0.5, metal: 0.4, seg: 14 });
    void jackBody;
    const ram = cyl(jack, 0.055, 0.055, 0.08, 0, 0.2, 0, 0xc8ced4, { rough: 0.3, metal: 0.7, seg: 12 });
    const ring = torus(jack, 0.075, 0.016, 0, 0.17, 0, 0xe0a83a, { rough: 0.45, metal: 0.6, seg: 6, seg2: 16 });
    ring.rotation.x = Math.PI / 2;
    holoTag(jack, "hydraulic jack", 0, 0.42, 0, { css: BBJ_CSS, w: 0.28 });
    reg(hits, jack, "jack");
    const ringHit = box(g, 0.2, 0.08, 0.2, -0.16, BBJ_CAP + 0.17, JZ, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, ringHit, "lock-ring");
    const jackPoint = box(g, 0.24, 0.01, 0.24, -0.16, BBJ_CAP + 0.005, JZ, BBJ_ACCENT, { emissive: BBJ_ACCENT, ei: 0.8, opacity: 0.55, transparent: true, cast: false });
    holoTag(g, "jacking point", -0.16, BBJ_CAP + 0.3, JZ + 0.2, { css: BBJ_CSS, w: 0.24 });
    hits["jack-point"] = jackPoint;
    // The crib pile on the ground, and the stack it becomes under the girder.
    const pile = group(g, -1.5, 0, 0.9, 0.3);
    box(pile, 0.9, 0.12, 0.15, 0, 0.06, -0.1, 0x8a6a42, { rough: 0.95 });
    box(pile, 0.9, 0.12, 0.15, 0, 0.06, 0.1, 0x8a6a42, { rough: 0.95 });
    const splitBlock = box(pile, 0.9, 0.12, 0.15, 0, 0.18, 0, 0x8a6a42, { rough: 0.95 });
    decal(pile, 0.8, 0.1, 0, 0.18, 0.076, (cx, w, h) => { cx.clearRect(0, 0, w, h); cx.strokeStyle = "#1c140c"; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(w * 0.05, h * 0.5); cx.lineTo(w * 0.4, h * 0.35); cx.lineTo(w * 0.8, h * 0.6); cx.stroke(); }, { px: 128, transparent: true });
    holoTag(pile, "cribbing", 0, 0.4, 0, { css: BBJ_CSS, w: 0.18 });
    reg(hits, pile, "crib-pile");
    const splitHit = box(pile, 0.9, 0.13, 0.16, 0, 0.18, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    void splitBlock;
    reg(hits, splitHit, "split-crib");
    const stack = group(g, 0.2, BBJ_CAP, JZ);
    for (let i = 0; i < 3; i++) { const b = box(stack, 0.14, 0.1, 0.34, 0, 0.05 + i * 0.1, 0, 0x8a6a42, { rough: 0.95 }); b.rotation.y = i % 2 ? Math.PI / 2 : 0; }
    const shims = box(stack, 0.16, 0.02, 0.16, 0, 0.31, 0, 0xc9a36b, { rough: 0.9 });
    stack.visible = false;
    const mallet = hammer(g, 0.55, BBJ_CAP, JZ + 0.12, { ry: 0.6 });
    holoTag(g, "crib shims + hammer", 0.6, BBJ_CAP + 0.25, JZ + 0.25, { css: BBJ_CSS, w: 0.36 });
    reg(hits, mallet, "crib-shims");
    // Dial indicator on a magnetic base, reading the flange off the cap.
    const dial = group(g, -0.6, BBJ_CAP, JZ - 0.1);
    box(dial, 0.08, 0.06, 0.08, 0, 0.03, 0, 0x2b2f33, { rough: 0.5, metal: 0.5 });
    cyl(dial, 0.008, 0.008, 0.28, 0, 0.2, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6 });
    const dialFace = decal(dial, 0.1, 0.1, 0, 0.3, 0.02, signFace("0.00", { bg: "#f4f2ea", fg: "#1a1a1a", accent: BBJ_CSS, scale: 0.36 }), { px: 128 });
    holoTag(dial, "dial indicator — lift", 0, 0.48, 0.02, { css: BBJ_CSS, w: 0.34 });
    reg(hits, dial, "dial-indicator");
    const feeler = group(g, 0.95, BBJ_CAP, BBJ_CAPZ + 0.45, -0.3);
    box(feeler, 0.12, 0.012, 0.03, 0, 0.006, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    holoTag(feeler, "feeler gauge", 0, 0.14, 0, { css: BBJ_CSS, w: 0.2 });
    reg(hits, feeler, "feeler-gauge");
    const newBearing = group(g, 1.9, 0, 0.35);
    box(newBearing, 0.4, 0.06, 0.3, 0, 0.03, 0, 0x1a1a1c, { rough: 0.85 });
    decal(newBearing, 0.3, 0.2, 0, 0.061, 0, signFace("NEW", { bg: "#1a1a1c", fg: "#f2f2f2", accent: BBJ_CSS, scale: 0.4 }), { px: 128 }).rotation.x = -Math.PI / 2;
    holoTag(newBearing, "new bearing", 0, 0.25, 0, { css: BBJ_CSS, w: 0.22 });
    reg(hits, newBearing, "new-bearing");

    // ----------------------------------------------- pump, gauge, hoses, spare jack
    const pump = group(g, 1.25, 0, -0.1, -0.4);
    box(pump, 0.4, 0.25, 0.25, 0, 0.125, 0, 0xd2312b, { rough: 0.5, metal: 0.3 });
    const handle = box(pump, 0.03, 0.03, 0.5, 0.12, 0.3, -0.1, 0x8b949d, { rough: 0.4, metal: 0.7 });
    handle.rotation.x = -0.5;
    const handleHit = box(pump, 0.2, 0.2, 0.5, 0.12, 0.35, -0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(pump, "keep pumping for room?", 0.1, 0.62, -0.2, { css: "#d2312b", w: 0.4 });
    reg(hits, handleHit, "pump-past-limit");
    const gaugeBox = group(pump, -0.1, 0.25, 0.06);
    box(gaugeBox, 0.16, 0.16, 0.05, 0, 0.08, 0, 0x22262b, { rough: 0.5 });
    const gaugeFace = decal(gaugeBox, 0.14, 0.14, 0, 0.08, 0.026, signFace("LOAD —", { bg: "#0d1c24", accent: BBJ_CSS, fg: "#bfeaf7", scale: 0.3 }), { px: 160, glow: true, ei: 0.7 });
    holoTag(pump, "load gauge", -0.1, 0.6, 0.06, { css: BBJ_CSS, w: 0.2 });
    reg(hits, gaugeBox, "load-gauge");
    const valve = group(pump, -0.18, 0.26, -0.08);
    cyl(valve, 0.03, 0.03, 0.03, 0, 0.015, 0, 0x2f6fd0, { rough: 0.5, metal: 0.4, seg: 10 });
    holoTag(pump, "release valve", -0.24, 0.42, -0.1, { css: BBJ_CSS, w: 0.24 });
    reg(hits, valve, "release-valve");
    const hoseLine = hose(g, [[1.15, 0.2, -0.05], [0.7, 0.05, -0.25], [0.1, 0.4, -0.55], [-0.12, BBJ_CAP + 0.1, JZ]], 0.012, 0x1f1f22, { steps: 20, rough: 0.8 });
    void hoseLine;
    const spray = particles(g, 50, 0x8a6a2a, { size: 0.02, life: 0.5, additive: false, opacity: 0.8 });
    const sprayOrigin = new THREE.Vector3(0.1, 0.45, -0.55);
    const spare = group(g, 2.5, 0, -0.35, 0.4);
    cyl(spare, 0.09, 0.1, 0.18, 0, 0.09, 0, 0x2f6fd0, { rough: 0.5, metal: 0.4, seg: 12 });
    hose(spare, [[0.1, 0.12, 0], [0.4, 0.03, 0.1], [0.7, 0.03, -0.1]], 0.012, 0x1f1f22, { steps: 10, rough: 0.8 });
    const wet = box(spare, 0.3, 0.004, 0.2, 0.3, 0.004, 0.05, 0x3a2a10, { rough: 0.1, metal: 0.3, opacity: 0.8, transparent: true, cast: false });
    void wet;
    holoTag(spare, "spare jack", 0, 0.35, 0, { css: BBJ_CSS, w: 0.18 });
    const couplingHit = box(spare, 0.14, 0.12, 0.14, 0.12, 0.12, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, couplingHit, "weeping-coupling");

    // ----------------------------------------------- traffic control
    const sign = group(g, -5.4, 0, -2.8, 0.5);
    cyl(sign, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const signFaceMesh = decal(sign, 0.6, 0.6, 0, 1.35, 0.02, (cx, w, h) => {
      cx.fillStyle = "#1a1a1a"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f28c1e"; cx.fillRect(w * 0.04, h * 0.04, w * 0.92, h * 0.92);
      cx.fillStyle = "#111"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.font = `800 ${Math.round(h * 0.17)}px Arial`;
      cx.fillText("ROAD", w / 2, h * 0.3); cx.fillText("WORK", w / 2, h * 0.5); cx.fillText("AHEAD", w / 2, h * 0.7);
    }, { px: 192 });
    signFaceMesh.rotation.z = Math.PI / 4;
    holoTag(sign, "advance warning sign", 0, 1.85, 0, { css: BBJ_CSS, w: 0.36 });
    reg(hits, sign, "advance-sign");
    const taper = group(g, 0, 0, 0);
    const taperPts = [[-5.6, -6.0], [-4.9, -4.9], [-4.2, -3.8], [-3.5, -2.8]];
    const taperCones = taperPts.map(([x, z]) => cone(taper, x, z));
    holoTag(taper, "taper", -4.5, 0.9, -4.3, { css: BBJ_CSS, w: 0.14 });
    reg(hits, taper, "taper-cones");
    const struck = taperCones[2];
    const strikeHit = box(struck, 0.35, 0.6, 0.35, 0, 0.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, strikeHit, "struck-cone");
    const work = group(g, 0, 0, 0);
    for (const x of [-1.5, 1.5]) cone(work, x, -2.6);
    holoTag(work, "work-area cones", 0, 0.8, -2.6, { css: BBJ_CSS, w: 0.3 });
    reg(hits, work, "work-cones");
    const lane = box(g, 2.4, 0.3, 0.6, 1.2, 0.2, -6.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step into the open lane?", 1.2, 0.6, -6.1, { css: "#d2312b", w: 0.44 });
    reg(hits, lane, "live-lane");
    const truck = pickup(g, -2.4, 0, -4.6, { ry: Math.PI / 2, livery: { colour: 0xf2f2ee, fleetName: "CITY BRIDGES", unitNumber: "B-31" } });
    const arrow = group(truck, 0, 1.9, -2.3);
    box(arrow, 1.2, 0.6, 0.06, 0, 0.3, 0, 0x1a1a1a, { rough: 0.6 });
    decal(arrow, 1.1, 0.5, 0, 0.3, -0.035, (cx, w, h) => {
      cx.fillStyle = "#101010"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#ffb020";
      for (let i = 0; i < 6; i++) { cx.beginPath(); cx.arc(w * (0.12 + i * 0.12), h * 0.5, h * 0.08, 0, Math.PI * 2); cx.fill(); }
      cx.beginPath(); cx.moveTo(w * 0.86, h * 0.2); cx.lineTo(w * 0.96, h * 0.5); cx.lineTo(w * 0.86, h * 0.8); cx.fill();
    }, { px: 256, glow: true, ei: 0.9 }).rotation.y = Math.PI;
    const car = sedan(g, 3.4, 0, -8.4, { ry: -Math.PI / 2, livery: { colour: 0x3a5f8a } });
    void car;

    // ----------------------------------------------- paper and radio
    const panelDraw = (title, rows, done = false) => (cx, w, h) => {
      cx.fillStyle = "#0c1715"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BBJ_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6f2"; cx.fillText(title, w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = done ? "#d8f5e0" : "#cfe8e2";
      rows.forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.28 + i * 0.12)));
    };
    const plan = holoPanel(g, 0.95, 0.64, -2.5, 1.6, 0.9, panelDraw("JACKING PLAN — PIER 3, G2", [
      "Jack under G2 at the marked point only", "Load per jack and max lift: per the plan", "Crib beside every jack, shimmed tight",
      "Lock ring down before any hand goes near", "Lower slowly, crib follows the girder", "Lane under the span closed throughout",
    ]), { ry: 0.6, accent: BBJ_ACCENT });
    reg(hits, plan, "jacking-plan");
    const log = group(g, 2.6, 0, 1.2, -0.7);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.62, 0.44, 0, 1.3, 0.01, panelDraw("JACKING LOG — G2", ["Load: —", "Lift: —", "Old bearing: —", "Tagged out: —"]), { px: 384, glow: true, ei: 0.6 });
    holoTag(log, "jacking log", 0, 1.62, 0, { css: BBJ_CSS, w: 0.22 });
    reg(hits, log, "jack-log");
    const crewRadio = radio(g, 2.15, 0.9, 1.45, { ry: -0.5 });
    box(g, 0.3, 0.9, 0.3, 2.15, 0.45, 1.45, 0x3a4550, { rough: 0.6 });
    holoTag(g, "crew radio", 2.15, 1.25, 1.45, { css: BBJ_CSS, w: 0.2 });
    reg(hits, crewRadio, "crew-radio");

    // The signage pad: an ANSI Z535-format sign for this station's hazard.
    const signPad = group(g, -3.4, 0, 0.3, 0.7);
    box(signPad, 0.6, 0.04, 0.4, 0, 0.02, 0, 0x3a4550, { rough: 0.8 });
    cyl(signPad, 0.025, 0.025, 1.4, 0, 0.7, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    decal(signPad, 0.5, 0.36, 0, 1.4, 0.03, (cx, w, h) => {
      cx.fillStyle = "#000"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#fff"; cx.fillRect(4, 4, w - 8, h - 8);
      cx.fillStyle = "#ffd100"; cx.fillRect(4, 4, w - 8, h * 0.3);
      cx.fillStyle = "#000"; cx.font = `800 ${Math.round(h * 0.2)}px Arial`; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("CAUTION", w / 2, h * 0.19);
      cx.fillStyle = "#000"; cx.font = `700 ${Math.round(h * 0.11)}px Arial`;
      cx.fillText("GIRDER ON JACKS", w / 2, h * 0.50); cx.fillText("CRIBBING REQUIRED", w / 2, h * 0.67); cx.fillText("NO HANDS UNDER", w / 2, h * 0.84); 
    }, { px: 320 });

    // ----------------------------------------------- crew
    const partner = standingFigure(g, -0.9, 1.4, { ry: 2.7, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2c14b, gloves: true });
    holoTag(partner, "jack partner", 0, 1.95, 0, { css: BBJ_CSS, w: 0.24 });
    const flagger = standingFigure(g, -3.6, -1.7, { ry: 2.2, cloth: 0x2b3138, vest: 0xd8f23a, helmet: 0xf2f2f2 });
    holoTag(flagger, "flagger", 0, 1.95, 0, { css: BBJ_CSS, w: 0.16 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, BBJ_CAPZ),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "seat-find") { spall.material = mat(0xd2312b, { rough: 0.9 }); splitBlock.material = mat(0xd2312b, { rough: 0.95 }); spare.children[0].material = mat(0xd2312b, { rough: 0.5 }); }
        if (step.id === "set-jack") { jack.position.set(-0.16, BBJ_CAP, JZ); jack.rotation.y = 0; jackPoint.visible = false; }
        if (step.id === "crib-stack") { stack.visible = true; pile.position.y = -0.1; }
        if (step.id === "lift-dial") { centre.position.y = BBJ_CAP + 0.09; ram.scale.y = 1.4; repaint(dialFace, signFace("AT PLAN", { bg: "#f4f2ea", fg: "#1a6a3a", accent: "#59c97b", scale: 0.3 })); }
        if (step.id === "lock-ring") ring.position.y = 0.23;
        if (step.id === "old-bearing") oldBearing.position.set(0.8, 0.03, 1.4);
        if (step.id === "release-valve") { centre.position.y = BBJ_CAP + 0.06; ram.scale.y = 1; stack.visible = false; }
        if (step.id === "jack-log") repaint(log.userData.face, panelDraw("JACKING LOG — G2", ["Load: inside the plan's band", "Lift: at the plan's figure", "Old bearing: bulged, walked out", "Tagged out: spare jack, split crib"], true));
        if (step.id === "crew-checkin") repaint(crewRadio.userData.screen, signFace("BEARING SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "cone-struck") { struck.rotation.z = Math.PI / 2; struck.position.y = 0.12; }
        if (it.id === "hose-weeping") { spray.visible = true; centre.position.y = BBJ_CAP + 0.075; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cone-struck") { struck.rotation.z = 0; struck.position.y = 0; }
        if (it.id === "hose-weeping") { spray.visible = false; shims.position.y = 0.33; shims.scale.y = 2; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const tr = session?.track;
        if (tr && step?.id === "load-gauge") {
          repaint(gaugeFace, signFace(tr.v < 0.4 ? "LOW" : tr.v > 0.6 ? "HIGH" : "IN BAND", { bg: "#0d1c24", accent: tr.v >= 0.4 && tr.v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.3 }));
          handle.rotation.x = -0.5 + Math.sin(t * 6) * 0.3;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "lift-dial") repaint(dialFace, signFace(gg.t < 0.44 ? "GRIPPED" : gg.t <= 0.6 ? "CLEAR" : "OVER", { bg: "#f4f2ea", fg: "#1a1a1a", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", scale: 0.3 }));
        if (gg && !gg.committed && step?.id === "seat-check") feeler.position.x = 0.8 + gg.t * 0.3;
        if (session?.turn && step?.id === "release-valve") valve.rotation.y = session.turn.amount * Math.PI * 2;
        if (spray.visible) spray.userData.step(dt ?? 0.016, sprayOrigin, 0.05, 0.8, -3.0);
        void CITY;
      },
    };
  },
};
