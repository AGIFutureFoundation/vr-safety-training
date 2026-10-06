import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, valveWheel, lockTag, reg,
  surfaceTexture, texturedMat, asphaltFace, gratingFace, corrugatedFace, palette,
} from "../citykit.js";
import { pickup, sedan } from "../../../shared/fleet.js";
import { generatorTrailer } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Night Storm-Response Crew & Portable Generator VR — Water &
// Environmental, UWUA water and sewer utility emergency-response crew.
//
// A storm takes the power off a lift station long before anyone can fix the
// power, and a wet well does not wait politely for the lights to come back
// on. Getting a crew and a towed generator down a flooded, debris-strewn
// access road at night is itself the first hazard of the night, worked
// slowly and deliberately rather than raced. What waits at the pad is the
// hazard the whole job turns on: the utility's own feed into that station is
// locked out and proven dead before the generator's cable ever touches the
// transfer switch, because a generator backfed into a line a utility crew
// believes is dead is exactly the failure every one of these steps exists to
// prevent. Sited generically: no real station capacity, flood depth or
// generator output is invented as fact.

const UT8_ACCENT = 0xffb13a;
const UT8_CSS = "#ffb13a";
const UT8_PAL = palette("utility");
const UT8_SCALE = 0.42;

export const SIM_UT_NIGHT_STORM_RESPONSE_CREW_AND_PORTABLE_GENERATOR = {
  id: "ut-night-storm-response-crew-and-portable-generator",
  index: "ut-08",
  domain: "Water",
  trade: "UWUA water and sewer utility emergency-response crew",
  category: "Water & Environmental",
  weather: "storm",
  footprint: 2.8,
  certification: "UWUA water and sewer utility emergency-response training; OSHA 29 CFR 1910.147 the control of hazardous energy for isolating the lift station's utility feed before the generator connects; the state Manual on Uniform Traffic Control Devices (MUTCD) for the flag control used on the flooded access road; ANSI Z535.4 for the warning signage on the barrier; the utility's own storm-response and mutual-aid procedure for the callout itself",
  name: "Night Storm-Response Crew & Portable Generator",
  title: simTitle("Night Storm-Response Crew & Portable Generator"),
  tagline: "A flooded access road driven slowly and deliberately at night, the lift station's utility feed locked out and proven dead before the generator's cable ever touches the transfer switch, and the pumps watched back to work under a light this crew brought with them",
  accent: UT8_ACCENT,
  accentCss: UT8_CSS,
  parSeconds: 320,
  badge: { id: "station-on-generator", name: "Station On Generator", note: "A flooded access road driven with every check made, the utility feed proven isolated before the generator ever connected, and the lift station running again under this crew's own power" },

  game: system({
    name: "Storm Response Authority",
    currency: "KW",
    ranks: ["Apprentice", "Service Crew", "Storm Response Tech", "Crew Lead", "Storm Response Authority Certified"],
    badges: [
      { id: "isolated-before-connected", name: "Isolated Before Connected", note: "The utility feed was isolated and tagged before the generator cable ever connected", test: AWARD.stepClean("isolate-utility-feed") },
      { id: "never-backfed", name: "Never Backfed", note: "No unsafe action was recorded through the whole callout", test: AWARD.safe },
      { id: "steady-load", name: "Steady Load", note: "Held the generator load watch inside the band the whole time", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-callout", name: "Clean Callout", note: "No corrections from the callout to the log", test: AWARD.clean },
      { id: "unbroken-load-watch", name: "Unbroken Load Watch", note: "The generator load watch ran to completion without a break", test: AWARD.unbroken },
      { id: "station-up-fast", name: "Station Up Fast", note: "Logged and back on the road inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "treat-downed-line-as-dead": "You went to work near the downed line as if it were simply out of service. Every downed line is treated as energized until the utility that owns it says otherwise, storm or no storm — a line that looks dead on a dark, wet night is exactly the line most likely to prove that assumption wrong.",
    "connect-before-isolate": "You went to connect the generator's cable to the transfer switch before the utility feed was confirmed isolated and tagged. A generator connected to a line the utility still believes is dead backfeeds current onto it, and that current does not stop at the transfer switch — it travels back up a line a utility crew somewhere else may already be working on.",
    "load-generator-before-checking-output": "You went to move the transfer switch onto the generator before checking its voltage and frequency were actually stable. A generator loaded before it has settled can drop the load it just picked up, and a lift station's pumps cycling on and off against an unstable supply is worse for them than staying off a few minutes longer.",
    "wade-flood-water": "You went to step into the flood water at the depth marker without checking it first. Standing water this deep can be hiding a dropped grade, a missing manhole cover, or a live circuit from a line this storm has already brought down somewhere upstream — checked first, not waded through on the assumption it is just water.",
  },

  lateNotes: {
    "generator-cable": "The generator's cable connects to the transfer switch only once the utility feed is confirmed isolated and tagged — not before.",
    "transfer-switch": "The transfer switch moves to generator only once the generator's own output has been read and found stable.",
  },

  // Two things that happen to a crew whose hands are on a discharge hose or
  // watching the generator's load. See shared/game.js.
  interrupts: [
    {
      id: "eoc-status-request",
      kind: "The county EOC radios for a status update",
      after: "watch-generator-load", delay: 3, seconds: 13,
      alert: "The county Emergency Operations Center is calling for a status update on this station — they are tracking every crew out tonight and need this one's status now.",
      cue: "Answer the radio and give the EOC this station's status before the load watch continues.",
      target: "eoc-radio",
      why: "The EOC is coordinating every crew out on this storm, not just this one, and a status they do not have is a resource they cannot allocate — answering now is what keeps this station's progress visible to everyone else still deciding where the next crew goes tonight.",
      missNote: "The call went unanswered while the load watch continued. The EOC's picture of this storm still has this station's status missing from it.",
      wrongNote: "It is the EOC's call, on the radio. The generator's load has not changed — this is about what the county can see from their end.",
    },
    {
      id: "car-on-flooded-road",
      kind: "A car tries to continue down the flooded road",
      after: "hold-discharge-hose", delay: 3, seconds: 11,
      alert: "A resident's car has come around the corner behind this crew and is continuing down the flooded access road, with no idea how deep the water actually gets.",
      cue: "Get the flag out and wave them back before they reach the deep water.",
      target: "flag-signal",
      why: "A driver who has not seen this road tonight has no way to judge how deep that water actually is, and a flag out where the headlights catch it is what turns them around before they find out the hard way — after the fact is a tow call and possibly worse.",
      missNote: "The car kept going toward the deep water with nobody flagging them off. A driver with no idea how deep flood water gets finds out by driving into it.",
      wrongNote: "It is the flag, out where the headlights catch it. The discharge hose has nothing to do with a car that does not belong on this road tonight.",
    },
  ],

  supportLine: "your utility's employee assistance programme, or your UWUA steward if you are not sure how to reach it",

  steps: [
    {
      id: "read-callout", kind: "select", target: "callout-order",
      title: "Read the storm callout",
      cue: "Check the callout: which lift station, what has failed, and what this crew is bringing.",
      why: "A storm callout at night is worked from the order, not from memory of how this station usually runs — knowing what actually failed and what equipment this crew is bringing is what keeps the drive out there from being wasted on the wrong assumption.",
    },
    {
      id: "pre-trip-check", kind: "find", noHint: true,
      targets: ["loose-tow-chain", "blocked-mirror"],
      itemNames: { "loose-tow-chain": "a loose tow chain on the generator", "blocked-mirror": "a mirror blocked by gear in the bed" },
      itemNotes: {
        "loose-tow-chain": "This safety chain on the generator trailer is hanging loose enough that it would not actually catch the trailer if the hitch let go — remade before this truck ever leaves the yard.",
        "blocked-mirror": "Gear loaded in the bed is blocking this mirror's view of the towed trailer — exactly what a driver needs on a dark, flooded road with a generator behind them.",
      },
      title: "Pre-trip the truck and the towed generator",
      cue: "Walk the truck and the generator before pulling out and find what needs fixing first.",
      why: "A storm callout is the worst possible night to discover a problem with the tow chain or the mirrors — checked now, in the yard under light, rather than found on a dark flooded road with nowhere safe to pull over and fix it.",
    },
    {
      id: "drive-to-site", kind: "drive", target: "response-truck",
      title: "Drive the flooded access road",
      cue: "Drive slowly and deliberately down the access road: lights on, mirrors on the towed generator, horn at the blind bend.",
      why: "A flooded, debris-strewn access road at night is worked slowly on purpose — fast enough to get there, and no faster, because the water hides the edge of the road as completely as the dark hides whatever the storm put across it.",
      holdBreakNote: "Out of the lane or out of the band on the flooded road — slow down and hold the centre of what you can actually see of it.",
      drive: {
        path: [[0.2, -5.4], [0.1, -4.0], [0.3, -2.6], [0.1, -1.4]],
        speedBand: [2, 7], laneWidth: 1.4, graceSeconds: 1.8, checkWindow: 2.4, sceneRate: 0.2,
        bandLabel: "walking-pace crawl on flood water, per the utility's driver safety programme",
        checks: [
          { at: 0, kind: "lights", note: "Lights on before you move — this road has no lighting of its own tonight." },
          { at: 1, kind: "mirror-right", note: "Right mirror: the towed generator needs watching through every bit of standing water." },
          { at: 2, kind: "horn", note: "Horn at the blind bend — anything coming the other way on this road cannot see you any sooner than you can see them." },
        ],
        controls: { brake: "truck-brake-pedal" },
        laneNote: "You left the lane and stayed out. On a flooded road at night that is the ditch, or worse, nobody can see until the wheels are already in it.",
      },
    },
    {
      id: "hazard-scan", kind: "find",
      targets: ["downed-line", "flood-depth-marker"],
      itemNames: { "downed-line": "a downed line across the pad", "flood-depth-marker": "the flood-depth marker at the low point" },
      itemNotes: {
        "downed-line": "A line is down across the near corner of this pad. Treated as energized until the utility that owns it says otherwise — no exception for how the storm looks like it is calming down.",
        "flood-depth-marker": "This marker shows how deep the standing water actually gets right where the pad's low point floods first — checked before anyone wades through it, not estimated by eye in the dark.",
      },
      title: "Scan the pad before stepping out further",
      cue: "Before doing anything else at the pad, find what the truck's own headlights show and what they do not.",
      why: "Headlights show what is directly in front of the truck and very little else — a downed line at the pad's edge or a flood depth that has changed since the last crew was here both need to be found deliberately, not assumed away because the storm feels like it has passed.",
    },
    {
      id: "position-and-chock", kind: "sequence",
      targets: ["unhitch-generator", "chock-generator-wheels"],
      itemNames: { "unhitch-generator": "generator unhitched", "chock-generator-wheels": "generator wheels chocked" },
      title: "Position and chock the generator",
      cue: "Unhitch the generator at the pad, then chock its wheels before it is touched again.",
      why: "A towed generator is still a wheeled trailer once it is unhitched, and chocking it is what keeps it from rolling on a pad that is anything but level after a night of rain — done before the cable ever comes off the reel.",
      outOfOrderNote: "Unhitch first, then chock — a generator still hitched is not going anywhere on its own, but the moment it is loose it needs the chocks immediately.",
    },
    {
      id: "isolate-utility-feed", kind: "sequence",
      targets: ["open-main-disconnect", "tag-main-disconnect"],
      itemNames: { "open-main-disconnect": "utility disconnect opened", "tag-main-disconnect": "utility disconnect tagged" },
      title: "Isolate and tag the utility feed",
      cue: "Open the lift station's main utility disconnect, then tag it, before the generator cable comes anywhere near the transfer switch.",
      why: "This is the step the rest of the night depends on: a generator's own output meeting a utility feed that has not been proven dead does not stay contained to this pad — it backfeeds up a line a utility crew somewhere else may already believe is safe to touch.",
      outOfOrderNote: "Open it, then tag it — an open disconnect with no tag can be closed by someone with no idea a generator is about to connect on the other side of it.",
    },
    {
      id: "connect-generator-cable", kind: "drag", target: "generator-cable",
      title: "Connect the generator to the transfer switch",
      cue: "Carry the generator's cable to the transfer switch inlet now the utility feed is proven isolated.",
      why: "This connection only happens once the utility side is dead and tagged — the transfer switch's whole job is keeping the generator's output and the utility's feed from ever touching each other, and that only works if this cable goes on after the utility side is actually open.",
      drag: { to: "transfer-switch-inlet", radius: 0.45, missNote: "Not seated in the inlet — a cable resting against the switch instead of locked into it will not carry the load and will not stay put in the wind." },
    },
    {
      id: "start-generator", kind: "turn", target: "generator-start-switch",
      title: "Start the generator",
      cue: "Turn the start switch and let the generator come up to speed.",
      why: "The generator needs a moment to come up to a stable speed before anything asks it for load — starting it and immediately loading it is how a cold engine stalls out exactly when this station needs it not to.",
      turn: { turns: 0.4, axis: "y", label: "GENERATOR START" },
    },
    {
      id: "check-generator-output", kind: "gauge", target: "generator-panel",
      title: "Check the generator's output",
      cue: "Bring the voltage and frequency reading into the generator's own normal band, then commit.",
      why: "This is the one check that says the generator is actually ready to carry this station's pumps — moved to load before this reads stable, the pumps are asking a supply that has not settled yet, which is a second failure stacked on top of the first one that called this crew out.",
      gauge: { label: "GENERATOR OUTPUT", speed: 0.6, green: [0.55, 0.75], readout: (t) => `${Math.round(t * 60)} Hz`, missNote: "That output has not settled into the generator's normal band — give it another moment and read it again before anything loads onto it." },
    },
    {
      id: "transfer-switch-to-generator", kind: "turn", target: "transfer-switch",
      title: "Move the transfer switch to generator",
      cue: "Turn the transfer switch from utility to generator now the output has proven stable.",
      why: "This is the one motion that actually puts the pumps on this crew's power, and it only happens after every step ahead of it has checked out — not on the assumption that a generator running smoothly for a few seconds means the rest of the job went fine too.",
      turn: { turns: 0.5, axis: "y", label: "TRANSFER SWITCH" },
    },
    {
      id: "watch-generator-load", kind: "track", target: "generator-panel", seconds: 7,
      title: "Watch the load as the pumps come on",
      cue: "Watch the generator's load hold steady in the band as the pumps pick up.",
      why: "The moment the pumps actually start pulling load is the moment a marginal connection or an undersized generator shows itself — held under watch through that window, a drop or a spike is caught with a hand still on the transfer switch instead of found later as a station that quietly stopped pumping again.",
      track: { start: 0.5, green: [0.4, 0.68], rise: 0.1, fall: 0.35, drift: 0.12, label: "GENERATOR LOAD", readout: (v) => (v > 0.68 ? "overloaded — shed load or check the pumps" : v < 0.4 ? "light load — confirm the pumps are actually running" : "steady") },
      holdBreakNote: "That load moved out of band during the watch — something is wrong between the generator and the pumps, and it has to be found before this crew leaves the pad.",
    },
    {
      id: "hold-discharge-hose", kind: "hold", target: "discharge-hose", seconds: 5,
      title: "Hold the discharge hose clear",
      cue: "Hold the temporary discharge hose aimed away from the roadway while the wet well catches up.",
      why: "The wet well has been rising the whole time this station sat without power, and the first minutes back on generator send it out faster than usual — held clear of the roadway for the full watch, that discharge goes where it is supposed to instead of back across the one road this crew and everyone behind them needs to keep using tonight.",
      holdBreakNote: "The hose came off target before the wet well caught up — hold it again, a discharge aimed back at the road is a road nobody can drive on until it clears.",
    },
    {
      id: "radio-log-and-close", kind: "select", target: "callout-log",
      title: "Radio the EOC and log the callout",
      cue: "Radio the station's status to the EOC and log the generator hours and fuel before leaving.",
      why: "The county's picture of this storm depends on every crew closing out the same way — a station reported back up and a log with real fuel and hours on it is what lets the next shift, or the crew that swaps this generator for permanent power, pick this job up without guessing at where it was left.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, UT8_ACCENT);

    // ---------------------------------------------------------------- ground
    const roadTex = surfaceTexture((ctx, w, h) => asphaltFace(ctx, w, h, { base: "#20272c", base2: "#1a2024" }), { repeat: 2, px: 320 });
    const road = box(g, 2.0, 0.05, 6.0, 0.15, 0.025, -3.5, 0xffffff, { rough: 0.95 });
    road.material = texturedMat(roadTex, { rough: 0.95, metal: 0.02, color: UT8_PAL.ground });
    const padTex = surfaceTexture((ctx, w, h) => gratingFace(ctx, w, h, { base: "#3a3f43", base2: "#2f3337" }), { repeat: 2, px: 260 });
    const pad = box(g, 3.4, 0.06, 2.6, 0.2, 0.03, 0.4, 0xffffff, { rough: 0.85 });
    pad.material = texturedMat(padTex, { rough: 0.85, metal: 0.2, color: UT8_PAL.structure });
    // Standing floodwater sheeting across the low point of the road.
    const flood = box(g, 1.8, 0.02, 1.6, 0.15, 0.05, -2.2, 0x2b4a55, { rough: 0.15, opacity: 0.65, transparent: true, cast: false });
    void flood;

    // The lift station structure with its control cabinet.
    const structTex = surfaceTexture((ctx, w, h) => corrugatedFace(ctx, w, h, { colour: 0x6f7a83 }), { repeat: 2, px: 256 });
    const shell = box(g, 1.6, 1.4, 1.0, -1.0, 0.7, 1.2, 0xffffff, { rough: 0.6, metal: 0.3 });
    shell.material = texturedMat(structTex, { rough: 0.6, metal: 0.3 });
    holoTag(g, "lift station", -1.0, 1.55, 1.2, { css: UT8_CSS, w: 0.3 });

    const cabinet = group(g, -1.0, 0, 0.65, 0);
    box(cabinet, 0.5, 0.9, 0.3, 0, 0.45, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(cabinet, "utility disconnect", 0, 1.0, 0, { css: UT8_CSS, w: 0.4 });
    const disconnect = box(cabinet, 0.1, 0.05, 0.04, -0.1, 0.6, 0.16, 0xd8232a, { rough: 0.5 });
    reg(hits, disconnect, "open-main-disconnect");
    const disconnectTag = lockTag(cabinet, -0.1, 0.42, 0.18, { color: 0xf2c14b, lines: ["FEED", "OFF"] });
    reg(hits, disconnectTag, "tag-main-disconnect");
    const transferSwitchObj = valveWheel(cabinet, 0.14, 0.55, 0.16, { color: 0xd8b23a, body: 0x2b2f34, r: 0.06 });
    holoTag(cabinet, "transfer switch", 0.14, 0.78, 0.16, { css: UT8_CSS, w: 0.34 });
    reg(hits, transferSwitchObj.userData.wheel, "transfer-switch");
    const transferInlet = group(cabinet, 0.2, 0.3, 0.16);
    hits["transfer-switch-inlet"] = transferInlet;
    const connectEarly = box(g, 0.2, 0.2, 0.2, -0.6, 0.5, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "connect it now?", -0.6, 0.75, 0.7, { css: "#d2312b", w: 0.36 });
    reg(hits, connectEarly, "connect-before-isolate");
    const loadEarly = box(g, 0.2, 0.2, 0.2, -0.4, 1.0, 0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "flip it to generator now?", -0.4, 1.25, 0.5, { css: "#d2312b", w: 0.5 });
    reg(hits, loadEarly, "load-generator-before-checking-output");

    // The downed line and flood-depth marker.
    const downedLine = cyl(g, 0.015, 0.015, 1.4, 1.4, 0.05, 1.6, 0x2b2f33, { rough: 0.7, seg: 8 });
    downedLine.rotation.z = 1.3;
    holoTag(g, "downed line", 1.4, 0.3, 1.6, { css: "#d2312b", w: 0.28 });
    reg(hits, downedLine, "downed-line");
    const depthMarker = group(g, 0.15, 0, -2.2);
    cyl(depthMarker, 0.015, 0.015, 0.6, 0, 0.3, 0, 0xf2c14b, { rough: 0.6, seg: 8 });
    holoTag(depthMarker, "flood depth marker", 0, 0.66, 0, { css: UT8_CSS, w: 0.38 });
    reg(hits, depthMarker, "flood-depth-marker");
    const wadeHazard = box(g, 0.2, 0.2, 0.2, 0.5, 0.2, -2.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just wade through it?", 0.55, 0.45, -2.2, { css: "#d2312b", w: 0.42 });
    reg(hits, wadeHazard, "wade-flood-water");
    const treatDeadHazard = box(g, 0.2, 0.2, 0.2, 1.6, 0.4, 1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "storm's passed, it's fine?", 1.65, 0.65, 1.2, { css: "#d2312b", w: 0.44 });
    reg(hits, treatDeadHazard, "treat-downed-line-as-dead");

    // Response truck (registered at its path start) and towed generator.
    const truck = pickup(g, 0.2, 0, -5.4, { ry: 0, livery: { colour: 0x2f5f9e, fleetName: "STORM RESPONSE" } });
    truck.scale.setScalar(UT8_SCALE);
    reg(hits, truck, "response-truck");
    const dash = group(g, 0.2, 0, -5.0, 0);
    box(dash, 0.1, 0.03, 0.16, 0, 0.2, 0, 0x59636d, { rough: 0.5, metal: 0.5 });
    hits["truck-brake-pedal"] = dash;

    const genset = generatorTrailer(g, 1.1, 0, 1.5, { ry: -Math.PI / 2, livery: { colour: 0xd8b23a, fleetName: "STORM RESPONSE", unitNumber: "G-22" } });
    holoTag(g, "portable generator", 1.1, 1.9, 1.5, { css: UT8_CSS, w: 0.32 });
    const { controlPanel: genPanel, doorL: genDoorL } = genset.userData.parts ?? {};
    void genDoorL;
    const genPanelInst = instrument(genPanel ?? genset, 0, 0.1, 0.04, { idle: "-- Hz", color: 0x2b2f34, w: 0.14, d: 0.02 });
    reg(hits, genPanelInst, "generator-panel");
    const startSwitch = box(genPanel ?? genset, 0.05, 0.04, 0.02, -0.15, -0.05, 0.03, 0x3fae6a, { rough: 0.4 });
    reg(hits, startSwitch, "generator-start-switch");
    const cableReel = cyl(genset, 0.14, 0.14, 0.1, 0.3, 0.3, -0.9, 0x2b2f33, { rough: 0.6, seg: 14 });
    holoTag(genset, "generator cable", 0.3, 0.48, -0.9, { css: UT8_CSS, w: 0.32 });
    reg(hits, cableReel, "generator-cable");
    const towChain = torus(genset, 0.03, 0.008, 0, 0.15, -0.6, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 8, seg2: 12 });
    reg(hits, towChain, "loose-tow-chain");
    const mirrorBlock = box(g, 0.12, 0.1, 0.1, 0.35, 0.6, -5.0, 0x5b4636, { rough: 0.7 });
    reg(hits, mirrorBlock, "blocked-mirror");
    const genChocks = box(genset, 0.14, 0.08, 0.1, -0.5, 0.04, 0.7, 0xf2c14b, { rough: 0.7 });
    reg(hits, genChocks, "chock-generator-wheels");
    hits["unhitch-generator"] = genset;

    // Discharge hose and flag.
    const hose = cyl(g, 0.03, 0.03, 1.1, -1.6, 0.1, -0.3, 0x2b2f33, { rough: 0.7, seg: 10 });
    hose.rotation.z = 0.7;
    holoTag(g, "discharge hose", -1.6, 0.32, -0.3, { css: UT8_CSS, w: 0.32 });
    reg(hits, hose, "discharge-hose");
    const resident = sedan(g, 0.4, 0, -6.4, { ry: 0, livery: { colour: 0xc9a227 } });
    resident.scale.setScalar(UT8_SCALE);
    const flagStand = group(g, -1.8, 0, -1.3, 0.4);
    cyl(flagStand, 0.02, 0.02, 0.5, 0, 0.25, 0, 0x5b4636, { rough: 0.8, seg: 8 });
    box(flagStand, 0.14, 0.1, 0.005, 0.08, 0.46, 0, 0xf2ae14, { rough: 0.6, cast: false });
    holoTag(flagStand, "flag signal", 0, 0.62, 0, { css: "#f2ae14", w: 0.3 });
    reg(hits, flagStand, "flag-signal");

    // Radios and boards.
    const eocRadio = box(g, 0.09, 0.16, 0.05, -2.0, 0.9, -1.0, 0x1b1e23, { rough: 0.5 });
    holoTag(g, "EOC radio", -2.0, 1.14, -1.0, { css: UT8_CSS, w: 0.28 });
    reg(hits, eocRadio, "eoc-radio");

    const calloutBoard = group(g, -2.2, 0, 1.7, 0.4);
    box(calloutBoard, 0.5, 0.7, 0.04, 0, 0.35, 0, UT8_PAL.structure, { rough: 0.7 });
    const calloutPanel = decal(calloutBoard, 0.44, 0.32, 0, 0.68, 0.03, paperFace("STORM CALLOUT", ["Lift station per the order", "Reported failure: power loss", "Equipment: truck + generator"], { scale: 0.7 }));
    holoTag(calloutBoard, "storm callout", 0, 0.9, 0, { css: UT8_CSS, w: 0.32 });
    reg(hits, calloutPanel, "callout-order");

    const logBench = group(g, -2.3, 0, 0.2);
    box(logBench, 0.9, 0.72, 0.5, 0, 0.36, 0, UT8_PAL.structure, { rough: 0.7, metal: 0.2 });
    const logPanel = decal(logBench, 0.3, 0.36, 0, 0.73, 0, paperFace("CALLOUT LOG", ["Station status ___", "Generator hours ___", "Fuel remaining ___"], { scale: 0.78 }));
    logPanel.rotation.x = -Math.PI / 2;
    holoTag(logBench, "callout log", 0, 0.94, 0, { css: UT8_CSS, w: 0.28 });
    reg(hits, logPanel, "callout-log");

    toolChest(g, 2.4, 0.5);
    const crewLead = standingFigure(g, 2.1, -1.2, { ry: 1.2, cloth: 0x2b6f8f, vest: 0xf2c14b });
    void crewLead;

    // A light tower's worth of light, since the whole station reads as a
    // storm-dark night otherwise — a small emissive floodlight rather than a
    // full district light rig.
    const floodlight = group(g, 1.9, 0, 0.0, -0.5);
    cyl(floodlight, 0.02, 0.02, 1.6, 0, 0.8, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 8 });
    box(floodlight, 0.24, 0.14, 0.08, 0, 1.6, 0, 0xf4f2e0, { rough: 0.3, emissive: 0xfff2c9, ei: 1.4 });
    holoTag(floodlight, "work light", 0, 1.85, 0, { css: UT8_CSS, w: 0.28 });

    holoPanel(g, 0.95, 0.6, 2.3, 0, -0.7, (ctx, w, h) => {
      ctx.fillStyle = "#2a1c03"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = UT8_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fdf0d4"; ctx.fillText("STORM RESPONSE — GENERATOR", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fffaf0";
      ["Slow, deliberate driving on flood water", "Isolate the feed before the cable connects", "Check output before loading the generator", "Never wade water you haven't checked"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.15)));
    }, { ry: -0.5, accent: UT8_ACCENT });

    let watchingLoad = false, eocAlert = false, carApproaching = false;
    const rain = particles(g, 30, 0xbfe6f5, { size: 0.015, life: 0.5, additive: false, opacity: 0.3 });
    rain.position.set(0, 2.2, -1.0);

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -3.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "pre-trip-check") { towChain.visible = false; mirrorBlock.visible = false; }
        if (step.id === "position-and-chock") { genset.position.set(0.9, 0, 0.9); }
        if (step.id === "hazard-scan") { downedLine.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 0.6, rough: 0.5 }); }
        if (step.id === "start-generator") repaint(genPanelInst.userData.screen, signFace("60.0", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "watch-generator-load") watchingLoad = false;
      },
      onInterrupt(it) {
        if (it.id === "eoc-status-request") { eocAlert = true; eocRadio.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8, rough: 0.4 }); }
        if (it.id === "car-on-flooded-road") { carApproaching = true; resident.position.set(0.3, 0, -2.9); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "eoc-status-request") { eocAlert = false; eocRadio.material = mat(0x1b1e23, { rough: 0.5 }); }
        if (it.id === "car-on-flooded-road") { carApproaching = false; resident.position.set(0.4, 0, -6.4); }
      },
      onHazard() {},
      animate(t, dt, session) {
        rain.userData.step(dt, new THREE.Vector3(-0.1, -2.2, 0), 0.1, 0.9, -0.1);
        if (session?.step?.id === "watch-generator-load") watchingLoad = true;
        if (watchingLoad) repaint(genPanelInst.userData.screen, signFace(`${(60 + Math.sin(t * 1.5) * 0.5).toFixed(1)}`, { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.45 }));
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "check-generator-output") repaint(genPanelInst.userData.screen, signFace(`${Math.round(gg.t * 60)}`, { bg: "#0d1c24", accent: gg.t > 0.55 && gg.t < 0.75 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        if (session?.turn && session.step?.id === "start-generator") startSwitch.rotation.y = session.turn.amount * Math.PI * 2;
        if (session?.turn && session.step?.id === "transfer-switch-to-generator") transferSwitchObj.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        void carApproaching; void eocAlert;
      },
    };
  },
};
