import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, group, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { busTransit } from "../../../shared/fleet.js";

// SmartCiti.X~ Wheelchair Lift & Securement on a Bus VR — Mobility &
// Transit, the transit and ramp operations block.
//
// A transit bus stopped at the curb, its wheelchair lift deployed onto a
// marked boarding pad, four securement points inside the door, and a road
// supervisor observing from the platform. The learner is the ATU transit
// operator running the lift and securing the rider. The route and the
// agency are generic.

const TRW_ACCENT = 0x63b5f0;
const TRW_CSS = "#63b5f0";

export const SIM_TR_WHEELCHAIR_LIFT_AND_SECUREMENT_ON_A_BUS = {
  id: "tr-wheelchair-lift-and-securement-on-a-bus",
  index: "350",
  domain: "Mobility",
  trade: "ATU transit operator running the wheelchair lift and securing a rider, with a road supervisor observing",
  category: "Mobility & Transit",
  indoor: "garage",
  certification: "FTA guidance implementing the Department of Transportation's ADA rules for wheelchair lifts and securement, Title II of the Americans with Disabilities Act for programme accessibility, ATU training for the operator's own duties at the lift, IBEW/NECA JATC practice for the lift's electrical and hydraulic maintenance, and NFPA 70 for the lift's own wiring",
  name: "Wheelchair Lift & Securement on a Bus",
  title: simTitle("Wheelchair Lift & Securement on a Bus VR"),
  tagline: "The stop before the route continues: the ADA procedure read for the securement points and the stop-request rule, the bus kneeled and the lift deployed in order, the boarding pad checked clear before anyone rolls forward, the platform held steady while it lowers, the rider rolled aboard to the securement area, all four points locked and tensioned, the seatbelt fastened, the stop-request procedure briefed, the lift watched clean back into its stow, the mirrors checked for anyone at the curb, the kneel returned to ride height, the road supervisor checked in with, and the trip logged",
  accent: TRW_ACCENT,
  accentCss: TRW_CSS,
  parSeconds: 320,
  footprint: 2.8,
  badge: { id: "securement-certified", name: "Securement Certified", note: "All four points locked and tensioned, the boarding pad checked clear, and never a pull-away before the lift was fully stowed" },

  supportLine: "your ATU local's member assistance programme",

  game: system({
    name: "Lift & Securement",
    currency: "TAG",
    ranks: ["Route Hand", "Lift Crew", "Securement Lead", "ADA Certified", "Transit Operator Certified"],
    badges: [
      { id: "pad-checked-clean", name: "Pad Checked Clean", note: "The boarding pad checked clear before the lift ever deployed", test: AWARD.stepClean("inspect-lift-path") },
      { id: "tension-held", name: "Tension Held", note: "Securement tension committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "never-a-shortcut", name: "Never a Shortcut", note: "Never deployed onto a blocked pad, never fewer than four points locked, never pulled away before the lift stowed", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-securement", name: "Clean Securement", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "stow-held-clean", name: "Stow Held Clean", note: "The lift-retract watch stayed in band the whole stow", test: AWARD.unbroken },
      { id: "trip-logged-fast", name: "Trip Logged Fast", note: "Trip logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "deploy-lift-path-blocked": "You deployed the lift before clearing the bag left on the boarding pad. A lift platform lowering onto an obstruction can jam halfway down or tip a rider rolling onto it, and the pad is checked clear before the lift ever moves specifically so that discovery never happens with someone already on the platform.",
    "engage-only-two-points": "You locked two of the four securement points and called it done. ADA's own securement standard calls for four points because a wheelchair braced on only two can still pivot or tip under normal braking, and skipping the other two is trusting a partial system to behave like the complete one the rider is counting on.",
    "release-without-seatbelt-check": "You started pulling away before confirming the rider's seatbelt was fastened. The securement straps hold the wheelchair in place, not the rider in the chair, and a belt left unchecked is the difference between a hard stop that is uncomfortable and one that throws a rider forward out of a chair that is itself locked down.",
    "pull-away-with-lift-not-stowed": "You pulled away from the curb before the lift had fully retracted and stowed. A lift left partway deployed hangs below the bus's own clearance envelope, and pulling away on it is how a piece of accessibility equipment becomes the thing that strikes a curb, a pedestrian, or the next vehicle at the stop.",
  },

  lateNotes: {
    "rider-wheelchair": "There is nothing to roll aboard yet — the lift has to finish lowering with the rider on it first.",
    "securement-ratchet": "Nothing to tension yet — all four securement points have to be hooked on before any of them are tightened.",
    "seatbelt": "Nothing to fasten yet — the securement points lock before the seatbelt goes on.",
  },

  steps: [
    {
      id: "read-ada-procedure", kind: "select", target: "ada-procedure",
      title: "Read the ADA procedure card",
      cue: "Read the card: the four securement points, the stop-request procedure, and the order the lift deploys in.",
      why: "The procedure card is what keeps every operator on the route running the same securement sequence for the same reason ADA specifies it — not a version remembered slightly differently by whoever is behind the wheel that day.",
    },
    {
      id: "kneel-and-deploy", kind: "sequence",
      targets: ["kneel-bus", "deploy-lift"],
      itemNames: { "kneel-bus": "bus kneeled at the curb", "deploy-lift": "lift deployed" },
      outOfOrderNote: "The bus kneels first — the lift only deploys once the bus is already down at the curb.",
      title: "Kneel the bus, then deploy the lift",
      cue: "Kneel the bus at the curb, then deploy the wheelchair lift onto the boarding pad.",
      why: "Kneeling first shortens the drop the lift itself has to cover, and deploying it only once the bus has actually settled is what keeps the platform from swinging out while the suspension is still adjusting under it.",
    },
    {
      id: "inspect-lift-path", kind: "find", noHint: true,
      targets: ["path-obstruction"],
      itemNames: { "path-obstruction": "bag left on the boarding pad" },
      itemNotes: { "path-obstruction": "A bag has been left sitting on the boarding pad, right where the lift platform needs to land — cleared before the lift comes down, not discovered after." },
      title: "Check the boarding pad before the lift comes down",
      cue: "Look over the boarding pad for anything left on it before the platform lowers.",
      why: "A lift platform lowering onto an obstruction does not always stop cleanly, and checking the pad now, while the lift is still up and nobody is standing on it, is the only point in this stop where an obstruction costs nothing but a look to clear.",
    },
    {
      id: "lower-platform-hold", kind: "hold", target: "lift-handrail", seconds: 5,
      title: "Hold the handrail steady while the platform lowers",
      cue: "Hold the lift's handrail steady through the whole lower, watching the rider rather than the pad.",
      why: "A platform that jolts on its way down is unsettling for a rider who cannot brace against it the way a standing passenger could, and holding the handrail steady through the full lower — eyes on the rider, not the mechanism — is what makes this the smooth ride ADA's own standard was written to guarantee.",
      holdBreakNote: "The handrail was let go before the platform finished lowering — a lower that is only steadied for part of the way is a lower a rider felt the rest of unsteadied.",
    },
    {
      id: "roll-rider-aboard", kind: "drag", target: "rider-wheelchair",
      title: "Roll the rider aboard to the securement area",
      cue: "Roll the wheelchair from the lift platform into the marked securement area just inside the door.",
      why: "The securement area is the one place inside the bus with the four anchor points this system is designed around, and rolling the rider fully into it — not leaving them staged near the door — is what makes the next step, locking those points, possible at all.",
      drag: { to: "securement-area", radius: 0.5, missNote: "Not inside the securement area — the wheelchair has to be rolled fully onto the marked anchor points, not left staged near the door." },
    },
    {
      id: "lock-securement-strap", kind: "turn", target: "securement-ratchet",
      title: "Lock and tension the securement straps",
      cue: "Turn the ratchet on each securement strap until all four points are locked, watching the tension rather than counting turns.",
      why: "A securement strap that is hooked on but not actually tensioned still lets the chair shift under braking, and turning each ratchet until it takes up real tension — checked, not assumed — is what makes four hooked points into four points actually doing their job.",
      turn: { turns: 1.0, label: "SECUREMENT", readout: (t) => (t < 0.3 ? "hooked" : t < 0.85 ? "tensioning" : "locked") },
    },
    {
      id: "verify-securement-tension", kind: "gauge", target: "tension-gauge",
      title: "Check the securement tension",
      cue: "Read the securement tension gauge and commit the reading once it settles inside the band.",
      why: "A strap tensioned by feel alone can still be looser than it seems once the bus is actually moving, and reading the gauge now — with the rider still at the curb rather than three stops down the route — is what catches a point that needs another turn before it ever gets tested by a hard stop.",
      gauge: { label: "SECUREMENT", speed: 0.65, green: [0.42, 0.62], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Not settled inside the band — hold the reading until it stops moving before you commit it." },
    },
    {
      id: "fasten-seatbelt", kind: "select", target: "seatbelt",
      title: "Fasten the rider's seatbelt",
      cue: "Fasten the rider's own seatbelt once all four securement points are locked and tensioned.",
      why: "The securement points hold the wheelchair to the floor; the seatbelt is what holds the rider to the chair, and fastening it last — once the chair itself is not going anywhere — is what completes a system that answers both halves of what a hard stop can do.",
    },
    {
      id: "brief-rider", kind: "select", target: "stop-request-card",
      title: "Brief the rider on the stop-request procedure",
      cue: "Show the rider the stop-request cord or button and confirm they know how to use it before pulling away.",
      why: "A rider who does not know how to signal their stop is a rider depending entirely on the operator remembering their destination, and briefing the procedure now — while the bus is still stopped — is what gives them the same independence every other passenger already has.",
    },
    {
      id: "retract-lift-watch", kind: "track", target: "clearance-sensor", seconds: 6,
      title: "Watch the lift stow clean",
      cue: "Watch the lift's clearance sensor as it retracts, keeping the reading inside the band all the way to fully stowed.",
      why: "A lift that stops retracting partway looks stowed from the driver's seat and is not, and watching the clearance sensor through the whole retract — rather than assuming the motor finished on its own — is what confirms the lift is actually tucked inside the bus's clearance envelope before the bus moves anywhere.",
      track: { start: 0.2, green: [0.75, 1.0], rise: 0.5, fall: 0.2, drift: 0.1, label: "STOW", readout: (v) => (v < 0.75 ? "retracting" : "stowed") },
      holdBreakNote: "The watch broke off before the sensor read fully stowed — a lift that is only checked for the first half of its retract is checked for exactly the half that was never in doubt.",
    },
    {
      id: "check-mirror-blindspot", kind: "find", noHint: true,
      targets: ["pedestrian-blindspot"],
      itemNames: { "pedestrian-blindspot": "pedestrian in the mirror's blind spot" },
      itemNotes: { "pedestrian-blindspot": "A pedestrian is walking close along the curb, right at the edge of the mirror's own blind spot — checked for before pulling away, not discovered by the horn of a car behind you." },
      title: "Check the mirrors before pulling away from the curb",
      cue: "Check both mirrors for anyone still near the bus before releasing the kneel and pulling out.",
      why: "A curb that was clear when the lift went down is not guaranteed to still be clear once boarding is finished, and checking the mirrors now, with the bus still stopped, is what catches a pedestrian who has drifted into the blind spot while everyone's attention was on the securement.",
    },
    {
      id: "return-kneel", kind: "select", target: "kneel-control",
      title: "Return the kneel to ride height",
      cue: "Release the kneel back to normal ride height before pulling into traffic.",
      why: "A bus that pulls away still kneeled rides lower than its suspension was set for, and returning it to normal height now is what keeps the ride the rest of the route was designed around instead of one the kneel is still quietly working against.",
    },
    {
      id: "radio-checkin", kind: "select", target: "supervisor-radio",
      title: "Check in with the road supervisor",
      cue: "Call the road supervisor: rider secured, lift stowed, ready to continue the route.",
      why: "The road supervisor's own schedule tracking depends on knowing this stop is actually finished, and calling it in — rather than just pulling away — is what keeps dispatch's picture of the route matching what is actually happening on it.",
    },
    {
      id: "close-trip-log", kind: "select", target: "trip-log",
      title: "Close the trip log",
      cue: "Record the securement, the boarding pad obstruction cleared, and the stop-request briefing before continuing the route.",
      why: "The trip log is the agency's own record that this stop followed the full ADA procedure, and a boarding pad obstruction that never makes the log is a hazard the next operator at this stop finds out about only by finding it again themselves.",
    },
  ],

  interrupts: [
    {
      id: "second-rider-waiting",
      kind: "A second wheelchair rider is waiting at the same stop",
      after: "return-kneel", delay: 2, seconds: 14,
      alert: "A second rider using a wheelchair is waiting at this same stop and needs the lift again.",
      cue: "Redeploy the lift now — the radio check-in waits.",
      target: "deploy-lift",
      why: "A second rider at the same stop needs the same accessible boarding the first one just received, and redeploying the lift now, before continuing to the next task, is what keeps this stop from becoming one rider helped and a second one passed by because the operator had already mentally moved on to the route.",
      missNote: "The radio check-in went out first while the second rider kept waiting at the curb for a lift that had already been stowed.",
      wrongNote: "Redeploying the lift — a second rider waiting is answered by boarding them, not by finishing the previous check-in first.",
    },
    {
      id: "rider-signals-distress",
      kind: "The rider signals the securement is too tight",
      after: "brief-rider", delay: 2, seconds: 12,
      alert: "The rider is signalling that a securement strap is pressing uncomfortably against their chair mid-brief.",
      cue: "Check and adjust the securement ratchet now — the stop-request briefing waits.",
      target: "securement-ratchet",
      why: "A rider telling you a strap is wrong is telling you the system meant to protect them is currently working against their comfort, and checking it immediately — rather than finishing the briefing first — is what keeps a fixable adjustment from turning into a ride the rider has to endure the whole route.",
      missNote: "The briefing continued while the rider sat with an overtightened strap; the adjustment was not made until after the bus was already pulling away.",
      wrongNote: "The securement ratchet — a rider signalling discomfort is answered immediately, not after finishing an unrelated briefing.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, TRW_ACCENT);

    // -------------------------------------------------------------- floor
    box(g, 6.4, 0.06, 5.2, 0, 0.03, 0, 0x2b2f34, { rough: 0.9, finish: "concrete", tile: 3 });

    // ------------------------------------------------------------------ bus
    const bus = busTransit(g, 0, 0, -1.4, { ry: 0, livery: { colour: 0xdfe4e8, fleetName: "CITI TRANSIT", unitNumber: "412" } });
    const busParts = bus.userData.parts ?? {};
    holoTag(bus, "transit bus", 0, 3.4, 0, { css: TRW_CSS, w: 0.26 });
    reg(hits, busParts.doorFront ?? bus, "kneel-bus");

    // ------------------------------------------------------------ lift & pad
    const pad = group(g, 0.3, 0, 1.2);
    box(pad, 1.2, 0.02, 1.4, 0, 0.01, 0, TRW_ACCENT, { rough: 0.75, opacity: 0.35, transparent: true });
    holoTag(pad, "boarding pad", 0, 0.4, 0, { css: TRW_CSS, w: 0.3 });
    const liftPlatform = box(g, 1.0, 0.08, 1.1, 0.3, 0.42, 1.0, 0x8a949d, { rough: 0.5, metal: 0.5 });
    reg(hits, liftPlatform, "deploy-lift");
    const handrail = box(g, 0.03, 0.6, 0.03, 0.75, 0.7, 0.6, 0xc0c6cc, { rough: 0.4, metal: 0.6 });
    holoTag(handrail, "lift handrail", 0, 0.4, 0, { css: TRW_CSS, w: 0.28 });
    reg(hits, handrail, "lift-handrail");
    const bagObstruction = box(g, 0.24, 0.2, 0.18, 0.0, 0.1, 1.3, 0x8a6a4a, { rough: 0.7 });
    holoTag(bagObstruction, "check the pad", 0, 0.3, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, bagObstruction, "path-obstruction");
    const deployBlockedHit = box(g, 0.6, 0.15, 0.6, 0.3, 0.5, 1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "deploy onto it anyway?", 0.3, 0.8, 1.1, { css: "#d2312b", w: 0.48 });
    reg(hits, deployBlockedHit, "deploy-lift-path-blocked");

    // ------------------------------------------------------------ clearance sensor
    const clearanceSensor = instrument(g, 1.4, 0.9, 0.6, { ry: -0.4, idle: "-- %", color: TRW_ACCENT, w: 0.1, d: 0.14 });
    holoTag(clearanceSensor, "clearance sensor", 0, 0.18, 0, { css: TRW_CSS, w: 0.32 });
    reg(hits, clearanceSensor, "clearance-sensor");

    // ------------------------------------------------------------ securement area
    const securementArea = group(g, -0.6, 0, -1.0);
    box(securementArea, 0.9, 0.02, 1.1, 0, 0.01, 0, TRW_ACCENT, { rough: 0.75, opacity: 0.3, transparent: true });
    holoTag(securementArea, "securement area", 0, 0.4, 0, { css: TRW_CSS, w: 0.34 });
    reg(hits, securementArea, "securement-area");
    const rider = standingFigure(g, 1.2, 1.0, { ry: 3.0, cloth: 0x3a5a7a, trousers: 0x2b3138, atStation: true });
    reg(hits, rider, "rider-wheelchair");
    const ratchet = box(g, 0.06, 0.08, 0.05, -0.6, 0.35, -1.4, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    holoTag(ratchet, "securement ratchet", 0, 0.2, 0, { css: TRW_CSS, w: 0.36 });
    reg(hits, ratchet, "securement-ratchet");
    const twoPointHit = box(g, 0.3, 0.15, 0.3, -0.3, 0.4, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lock only two points?", -0.3, 0.65, -0.9, { css: "#d2312b", w: 0.44 });
    reg(hits, twoPointHit, "engage-only-two-points");
    const tensionGauge = instrument(g, -1.0, 0.9, -1.4, { ry: 0.4, idle: "-- %", color: TRW_ACCENT, w: 0.1, d: 0.14 });
    holoTag(tensionGauge, "tension gauge", 0, 0.18, 0, { css: TRW_CSS, w: 0.3 });
    reg(hits, tensionGauge, "tension-gauge");
    const seatbelt = box(g, 0.05, 0.3, 0.02, -0.9, 0.7, -1.0, 0xd2312b, { rough: 0.6 });
    holoTag(seatbelt, "seatbelt", 0, 0.25, 0, { css: TRW_CSS, w: 0.24 });
    reg(hits, seatbelt, "seatbelt");
    const releaseHit = box(g, 0.3, 0.2, 0.3, 0.9, 0.9, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pull away unchecked?", 0.9, 1.2, -2.0, { css: "#d2312b", w: 0.5 });
    reg(hits, releaseHit, "release-without-seatbelt-check");

    // ------------------------------------------------------------ cab controls
    const kneelControl = box(g, 0.05, 0.05, 0.02, 1.3, 0.9, -2.0, 0x59c97b, { rough: 0.4 });
    holoTag(kneelControl, "kneel control", 0, 0.2, 0, { css: TRW_CSS, w: 0.28 });
    reg(hits, kneelControl, "kneel-control");
    const notStowedHit = box(g, 0.4, 0.2, 0.4, 1.1, 0.7, -2.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pull away before it stows?", 1.1, 1.0, -2.3, { css: "#d2312b", w: 0.5 });
    reg(hits, notStowedHit, "pull-away-with-lift-not-stowed");
    const pedestrian = standingFigure(g, 2.6, 2.0, { ry: -2.0, cloth: 0x3a5a7a });
    holoTag(pedestrian, "check the mirrors", 0, 1.95, 0, { css: "#d2312b", w: 0.34 });
    reg(hits, pedestrian, "pedestrian-blindspot");

    // -------------------------------------------------------------- paperwork
    const plan = holoPanel(g, 0.95, 0.66, -3.0, 1.35, -0.6, (cx, w, h) => {
      cx.fillStyle = "#0a1826"; cx.fillRect(0, 0, w, h); cx.fillStyle = TRW_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e2f2ff"; cx.fillText("ADA PROCEDURE", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eef8ff";
      ["Kneel, then deploy the lift", "Boarding pad checked clear",
        "Four securement points, tensioned", "Seatbelt fastened last",
        "Stop-request procedure briefed", "Lift fully stowed before pulling away"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.4, accent: TRW_ACCENT });
    reg(hits, plan, "ada-procedure");

    const stopCard = holoPanel(g, 0.6, 0.42, -1.6, 1.3, -2.2, (cx, w, h) => {
      cx.fillStyle = "#0a1826"; cx.fillRect(0, 0, w, h); cx.fillStyle = TRW_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e2f2ff"; cx.fillText("STOP-REQUEST CARD", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eef8ff";
      ["Pull the cord or press the button", "One stop ahead is called", "Ask the operator any time"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.15)));
    }, { ry: -0.4, accent: TRW_ACCENT });
    reg(hits, stopCard, "stop-request-card");

    const log = holoPanel(g, 0.6, 0.42, -2.6, 1.3, 0.6, (cx, w, h) => {
      cx.fillStyle = "#0a1826"; cx.fillRect(0, 0, w, h); cx.fillStyle = TRW_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e2f2ff"; cx.fillText("TRIP LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eef8ff";
      ["Securement: —", "Pad: —", "Briefing: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 0.6, accent: TRW_ACCENT });
    reg(hits, log, "trip-log");

    // -------------------------------------------------------------- radio
    const chest = toolChest(g, 2.6, -1.6, { ry: -0.4, color: 0x2b3138 });
    const radio = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "CH 12 · DISPATCH", color: TRW_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "supervisor radio", 0, 0.16, 0, { css: TRW_CSS, w: 0.4 });
    reg(hits, radio, "supervisor-radio");

    // ------------------------------------------------------------------ crew
    const supervisor = standingFigure(g, -2.45, 1.25, { ry: -1.3, cloth: 0x2b3138, vest: TRW_ACCENT, helmet: 0xf2f2f2 });
    holoTag(supervisor, "road supervisor", 0, 1.95, 0, { css: TRW_CSS, w: 0.34 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, 0.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect-lift-path") bagObstruction.visible = false;
        if (step.id === "roll-rider-aboard") rider.position.set(-0.6, 0, -1.0);
        if (step.id === "verify-securement-tension") repaint(tensionGauge.userData.screen, signFace("IN BAND", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.45 }));
        if (step.id === "fasten-seatbelt") seatbelt.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "radio-checkin") repaint(radio.userData.screen, signFace("STOP COMPLETE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.36 }));
        if (step.id === "close-trip-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0a1826"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#e2f2ff"; cx.fillText("TRIP LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0ffe8";
            ["Securement: 4-point, tensioned", "Pad: obstruction cleared", "Briefing: given"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "second-rider-waiting") liftPlatform.material = mat(0xf2ae14, { emissive: 0x6a4a08, ei: 0.6, rough: 0.5 });
        if (it.id === "rider-signals-distress") ratchet.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "second-rider-waiting") liftPlatform.material = mat(0x8a949d, { rough: 0.5, metal: 0.5 });
        if (it.id === "rider-signals-distress") ratchet.material = mat(0xe8b02e, { rough: 0.5, metal: 0.4 });
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "lock-securement-strap") ratchet.rotation.x = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "verify-securement-tension") repaint(tensionGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (step?.id === "retract-lift-watch" && session.holding) repaint(clearanceSensor.userData.screen, signFace(`${Math.round(session.track.v * 100)}`, { bg: "#0d1c24", accent: session.track.v >= 0.75 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        void dt; void t; void CITY;
      },
    };
  },
};
