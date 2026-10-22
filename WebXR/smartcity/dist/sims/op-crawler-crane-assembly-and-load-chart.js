import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { crawlerCrane } from "../../../shared/equipment.js";
import { counterweightStack } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Crawler Crane Assembly & Load Chart VR — its own gamified
// system: Boom Authority.
//
// The IUOE crawler crane crew's own procedure for closing out an assembly
// and proving it before the first real pick: the ground bearing confirmed
// under the crawlers, every boom pin and lacing member inspected, the
// backstop engaged, the swing radius barricaded, the load chart read at the
// planned radius, and a test lift held and swung before anything real ever
// goes on the hook. No load weight, radius or chart percentage here is one
// this platform is certain of — those live on the job's own lift plan and
// the crane's own chart.

const OPCC_ACCENT = 0x3a5fc4;

export const SIM_OP_CRAWLER_CRANE_ASSEMBLY_AND_LOAD_CHART = {
  id: "op-crawler-crane-assembly-and-load-chart",
  index: "op-6",
  domain: "Construction",
  trade: "Crawler crane operator — IUOE Local 3 operating engineer",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "IUOE Local 3 operating engineer training; OSHA 29 CFR 1926 Subpart CC Cranes and derricks in construction and ASME B30.5; 29 CFR 1926.21 safety training and education; NIOSH fatality-investigation findings on crane assembly and struck-by incidents",
  name: "Crawler Crane Assembly & Load Chart",
  title: simTitle("Crawler Crane Assembly & Load Chart"),
  tagline: "Crawler crane assembly closed out and proved before the first pick: ground bearing confirmed, every pin and lacing member inspected, the backstop engaged, the chart read at the planned radius, and a test lift held before anything real goes on the hook",
  accent: OPCC_ACCENT,
  accentCss: "#3a5fc4",
  parSeconds: 285,
  footprint: 2.7,
  badge: { id: "boom-authority", name: "Boom Authority", note: "Assembly inspected and pinned, the chart read at the planned radius, and a test lift proved before the first real pick" },

  game: system({
    name: "Boom Authority",
    currency: "BOOM",
    ranks: ["Ground Hand", "Rigger", "Signal Person", "Load Chart Certified", "Boom Authority"],
    badges: [
      { id: "pins-confirmed", name: "Pins Confirmed", note: "Never swung the boom before every pin was confirmed", test: AWARD.stepClean("inspect-assembly") },
      { id: "swing-held", name: "Swing Held", note: "Never let anyone stand in the swing radius", test: AWARD.safe },
      { id: "steady-chart", name: "Steady Chart", note: "Held the gauge readings near band centre all shift", test: AWARD.precise(0.72) },
      { id: "test-lift-clean", name: "Test Lift Clean", note: "Prove the test lift clean, first try", test: AWARD.stepClean("test-lift") },
    ],
    challenges: [
      { id: "quick-close-out", name: "Quick Close-Out", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "boom-streak", name: "Boom Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IUOE local's member assistance programme, or the site's employee assistance line if a close call on this assembly is what stayed with you",

  hazards: {
    "swing-radius-stand-crane": "You are standing inside the crane's swing radius while it is rigged to slew. A slewing counterweight on a crawler crane this size sweeps that space at more than walking pace, and OSHA's cranes rule at 29 CFR 1926 Subpart CC puts barricading that radius on the crew, not on whoever happens to be walking through it.",
    "unpinned-boom-hazard": "That swings the boom before every section pin was confirmed seated and locked. A boom section pin that looks seated but is not fully engaged can work its way out under load, and a lattice boom that loses a pin connection comes down in sections, not gently.",
    "chart-exceeded-crane": "That pick is logged past the chart's rated capacity at this radius. The chart already carries its safety factor built into the number on the page, so it is the limit and not a target — a crawler crane tips or fails structurally at the edge of the chart, not with a comfortable margin of warning first.",
    "two-block-risk-crane": "You are hoisting past the anti-two-block limit. Running the hook block into the boom tip parts the hoist line or buckles the tip section, and on a lattice boom that failure travels down the whole structure, not just the last few feet of it.",
  },

  lateNotes: {
    "load-chart": "The chart gets read at the actual planned radius before rigging goes anywhere near a real load, not as a formality once the pick is already hooked up.",
    "hook-roll": "The hook block gets rigged onto the boom tip after the assembly is fully pinned and inspected, not before, so nothing is hanging off a structure that has not been confirmed sound yet.",
  },

  interrupts: [
    {
      id: "boom-pin-shifts",
      kind: "Pin working loose",
      after: "test-lift", delay: 4, seconds: 12,
      alert: "A section pin has started backing out under the test load, visible from the ground as a gap opening at the lacing joint.",
      cue: "Call it out and get the test lift set down before that pin moves any further.",
      target: "signal-person",
      why: "A pin working loose under a test load is exactly why the test lift happens before a real one — it is a controlled weight, at a controlled height, specifically so a problem like this shows up now, with somewhere safe to set the load down, instead of on the first pick that actually matters.",
      missNote: "The test lift continued while the pin kept backing out. A lattice boom that loses a section connection under load does not fail at the joint alone — it fails all the way down the structure below it.",
      wrongNote: "Not that — the working pin is what has to stop this lift before anything else about it matters.",
    },
    {
      id: "crawler-pad-settles",
      kind: "Ground settling",
      after: "direct-test-swing", delay: 4, seconds: 11,
      alert: "One crawler track has started settling into softer ground than the rest of the pad, tilting the whole machine slightly as the swing continues.",
      cue: "Call for a level recheck before the swing continues on ground that is no longer what it was at setup.",
      target: "level-recheck-flag",
      why: "The chart is only valid for a machine level within the tolerance the manufacturer published it for, and ground checked level at setup can still settle unevenly under a swinging load hours later — a recheck the instant a tilt is noticed is what confirms the chart the crew is working from still applies.",
      missNote: "The swing continued while the crawler kept settling unevenly. A crane already off level loses capacity in exactly the direction it is leaning, and the chart the crew was reading stopped being the right chart the moment the machine did.",
      wrongNote: "Not that — the settling crawler is what has to be checked before this swing means anything against the chart.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Suit up before the assembly",
      cue: "Hi-vis vest and hard hat before anyone is near the crane.",
      why: "A crew closing out an assembly works in close under a structure that is about to start swinging — the vest and hard hat are what let the signal person and the operator account for everyone at a glance before anything moves.",
    },
    {
      id: "ground-bearing", kind: "select", target: "ground-mats-board",
      title: "Confirm the ground bearing",
      cue: "Confirm the crane is set on matting rated for this ground and this configuration's weight.",
      why: "A crawler crane's rated capacity assumes the ground under both crawlers can actually carry that weight without settling — matting rated for the ground conditions is what makes that assumption true instead of something the crew finds out the hard way mid-pick.",
    },
    {
      id: "inspect-assembly", kind: "find", noHint: true,
      targets: ["loose-pin", "kinked-pendant", "damaged-lacing"],
      itemNames: {
        "loose-pin": "section pin not fully seated",
        "kinked-pendant": "kinked boom pendant",
        "damaged-lacing": "damaged lacing member",
      },
      itemNotes: {
        "loose-pin": "A pin that has not seated fully can work the rest of the way out under the first real load on the boom.",
        "kinked-pendant": "A kink in a pendant is a stress point the pendant was never rated to carry, and it is exactly where that pendant lets go first.",
        "damaged-lacing": "A bent or cracked lacing member is the boom's own bracing failing in miniature — enough of them and the section stops behaving like the truss it was designed as.",
      },
      decoyNotes: {
        "sound-connection": "That pin and lacing joint is fully seated, straight and undamaged. Nothing to flag there.",
      },
      title: "Inspect the assembly before it swings",
      cue: "Walk the boom. Three problems from the assembly are hiding along it — find them by looking.",
      why: "An assembly that looks finished from the ground is not the same thing as one a competent person has actually walked pin by pin — NIOSH's own investigations into crane assembly incidents keep finding a connection that looked fine from a distance and was not fine up close, found only after the boom was already loaded.",
    },
    {
      id: "backstop-engage", kind: "sequence", anyOrder: true,
      targets: ["backstop-left", "backstop-right"],
      itemNames: { "backstop-left": "left backstop pin", "backstop-right": "right backstop pin" },
      title: "Engage the boom backstop",
      cue: "Engage both backstop pins before the boom is trusted at a low angle.",
      why: "The backstop is what keeps the boom from being blown or driven back past its structural limit at a low angle — engaging both pins before anything is rigged is what makes that limit a fact of the machine rather than something the operator has to feel for.",
    },
    {
      id: "barricade-swing", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "swing-barrier"],
      itemNames: { "cone-a": "cone at the approach", "cone-b": "cone at the far side", "swing-barrier": "swing radius barrier" },
      title: "Barricade the swing radius",
      cue: "Cone both approaches and set the barrier around the crane's full swing.",
      why: "OSHA's cranes rule at 29 CFR 1926 Subpart CC treats the swing radius as ground the crew controls, not ground a passerby is expected to judge for themselves — the barrier is what makes that true before the counterweight ever starts moving.",
    },
    {
      id: "signal-person-brief", kind: "select", target: "signal-person",
      title: "Confirm the signal person protocol",
      cue: "Agree hand signals and radio call-outs with the dedicated signal person.",
      why: "One qualified signal person directs the swing and the operator moves on that person's signal alone, with one standing exception: a stop signal from anyone on site has to be obeyed — everyone on this crew needs to know that before the boom is moving and it matters.",
    },
    {
      id: "pin-lock", kind: "turn", target: "pin-lock-lever",
      title: "Confirm the boom foot pin locked",
      cue: "Turn the lock lever fully home on the boom foot pin before trusting the connection.",
      why: "A boom foot pin that is inserted but not turned to its locked position can walk under the cyclical load of a swinging boom — the positive lock is the part of the mechanism that actually holds it, not the pin simply being in the hole.",
      turn: { turns: 0.55, axis: "y", label: "FOOT PIN LOCK" },
    },
    {
      id: "hook-rig", kind: "drag", target: "hook-roll",
      title: "Rig the hook block",
      cue: "Carry the hook block to the boom tip and reeve it before the test lift.",
      why: "The hook block goes on only after the assembly above it is confirmed sound — rigging it earlier just means it is hanging off a structure nobody has finished checking yet, with nothing gained by having it there sooner.",
      drag: { to: "hook-socket", radius: 0.4, missNote: "Not seated at the boom tip — carry the block to the sheave before reeving it." },
    },
    {
      id: "level-check", kind: "gauge", target: "level-bubble",
      title: "Check the crane is level",
      cue: "Read the level bubble and commit only when it is centred.",
      why: "Every number on the chart assumes a machine level within the manufacturer's own tolerance — a crawler crane leaning even a couple of degrees can shed a meaningful share of its rated capacity, and this is where that gets confirmed rather than assumed.",
      gauge: {
        label: "CRAWLER LEVEL", speed: 0.6, green: [0.46, 0.58],
        readout: (t) => `${((t - 0.5) * 6).toFixed(1)}° off level`,
        missNote: "Not level. Re-check the crawler pads and matting before anything gets rigged to the hook.",
      },
    },
    {
      id: "load-chart-check", kind: "gauge", target: "load-chart",
      title: "Read the load chart for the planned pick",
      cue: "Walk the boom to the planned radius and commit once the chart shows capacity in hand.",
      why: "The chart is read at the actual radius and boom length planned for this pick, never estimated from a job that looked about the same — capacity falls away faster than radius grows on a lattice boom, and the chart, not a feel for the machine, is the limit under 29 CFR 1926 Subpart CC.",
      gauge: {
        label: "CHART CAPACITY MARGIN AT RADIUS", speed: 0.55, green: [0.55, 0.85],
        readout: (t) => `${Math.round(t * 100)}% of rated capacity`,
        missNote: "That radius eats too much of the chart's rated capacity for this configuration. Walk the boom in before rigging anything real.",
      },
    },
    {
      id: "test-lift", kind: "hold", target: "crane-controls", seconds: 6,
      title: "Hold the test lift",
      cue: "Hold the test weight steady clear of the ground before trusting the assembly with a real pick.",
      why: "A test lift at a controlled weight and a controlled height is what proves the assembly actually holds under load, with somewhere safe to set the weight back down if it does not — that proof happens before the first real load goes on the hook, not during it.",
      holdBreakNote: "Released the test lift early. Hold it through the full check — that is the only way to prove the assembly before a real load is trusted to it.",
    },
    {
      id: "direct-test-swing", kind: "track", target: "signal-person", seconds: 8,
      title: "Swing the test load under signal",
      cue: "Keep the signal person's signal steady, holding the swing inside the barricaded radius.",
      why: "A test swing run under continuous signal is what confirms the whole system — chart, pins, backstop and level — together, under the one condition a static test lift cannot check: the boom actually moving with a load on the hook.",
      track: {
        start: 0.12, green: [0.4, 0.62], rise: 0.5, fall: 0.45, drift: 0.12,
        label: "TEST SWING",
        readout: (v) => (v < 0.4 ? "drifting outside the barricade" : v > 0.62 ? "swinging too fast to control" : "on the planned arc"),
      },
      holdBreakNote: "The test swing drifted off the planned arc. Bring it back on the signal person's call before the boom swings again.",
    },
    {
      id: "boom-angle-check", kind: "select", target: "boom-angle-indicator",
      title: "Confirm the boom angle against the plan",
      cue: "Confirm the boom angle indicator matches the angle the lift plan calls for.",
      why: "The chart reading and the boom angle are two different confirmations of the same fact — an angle indicator that does not match the plan means either the boom moved since the chart was read or the indicator itself needs attention, and either one is worth stopping for before the real pick.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the assembly log",
      cue: "Log the inspection, the chart reading and the test lift result before releasing the crane for picks.",
      why: "The assembly log is the record the next shift and the annual inspection both read — an assembly that was inspected and proved cleanly but never logged leaves nothing behind to show any of it actually happened.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, OPCC_ACCENT);

    // ------------------------------------------------------------------ yard
    const groundMesh = box(g, 6.8, 0.14, 6.4, 0, 0.07, 0, 0xffffff, { rough: 0.9 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#4a4d51", base2: "#3f4245", seam: "rgba(0,0,0,0.45)" }), { repeat: 7, px: 512 }),
      { rough: 0.9, metal: 0.04, color: 0xa4aab0 },
    );

    // ------------------------------------------------------------------ the crane
    const crane = crawlerCrane(g, -1.0, 0.14, -1.6, { ry: 1.3, livery: { colour: OPCC_ACCENT, fleetName: "CITY LIFT", unitNumber: "CC-80" } });
    const { house, boom, boomSections, hook, cabDoor } = crane.userData.parts;
    holoTag(crane, "crawler crane CC-80", 0, 4.0, 0, { css: "#3a5fc4", w: 0.42 });
    reg(hits, cabDoor, "crane-controls");

    const pinLever = group(g, -1.9, 0.14, 0.5, 0.3);
    box(pinLever, 0.08, 0.04, 0.04, 0, 0.5, 0, 0x2b2f34, { rough: 0.55 });
    const pinKnob = cyl(pinLever, 0.018, 0.018, 0.16, 0.06, 0.5, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.6, rough: 0.4, seg: 12 });
    pinKnob.rotation.x = Math.PI / 2;
    holoTag(pinLever, "foot pin lock", 0, 0.66, 0, { css: "#3a5fc4", w: 0.32 });
    reg(hits, pinKnob, "pin-lock-lever");
    const swingAnywayLever = box(pinLever, 0.08, 0.06, 0.02, -0.14, 0.42, 0.04, 0xd2312b, { rough: 0.5 });
    decal(swingAnywayLever, 0.07, 0.05, 0, 0, 0.011, signFace("SWING", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.5 }));
    reg(hits, swingAnywayLever, "unpinned-boom-hazard");

    // ------------------------------------------------------------------ boom inspection points
    const boomInspect = boomSections?.[0] ?? boom;
    const loosePin = group(boomInspect, -0.3, 0, 1.0);
    ball(loosePin, 0.04, 0, 0, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.5, rough: 0.5, seg: 10 });
    reg(hits, loosePin, "loose-pin");
    const kinkedPendant = group(boom, 0, -0.1, 2.0);
    cyl(kinkedPendant, 0.012, 0.012, 0.8, 0, 0, 0, 0xb8402f, { rough: 0.7, seg: 8 }).rotation.z = 0.4;
    reg(hits, kinkedPendant, "kinked-pendant");
    const damagedLacing = group(boomSections?.[1] ?? boom, 0.2, 0, 1.4);
    box(damagedLacing, 0.1, 0.02, 0.02, 0, 0, 0, 0x5a4a2a, { rough: 0.8 });
    reg(hits, damagedLacing, "damaged-lacing");
    const soundConnection = group(boomInspect, 0.3, 0, 2.0);
    ball(soundConnection, 0.03, 0, 0, 0, 0x59c97b, { rough: 0.5, seg: 10 });
    reg(hits, soundConnection, "sound-connection");

    // ------------------------------------------------------------------ backstop
    const backstopL = group(g, -2.4, 0.14, -1.0, 0.3);
    box(backstopL, 0.14, 0.5, 0.1, 0, 0.25, 0, 0x2b2f34, { rough: 0.55, metal: 0.4 });
    reg(hits, backstopL, "backstop-left");
    const backstopR = group(g, -2.4, 0.14, -2.4, 0.3);
    box(backstopR, 0.14, 0.5, 0.1, 0, 0.25, 0, 0x2b2f34, { rough: 0.55, metal: 0.4 });
    reg(hits, backstopR, "backstop-right");

    // ------------------------------------------------------------------ hook + chart
    const hookRoll = group(g, 2.0, 0.14, 1.6, 0.3);
    box(hookRoll, 0.14, 0.1, 0.14, 0, 0.06, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    torus(hookRoll, 0.06, 0.014, 0, 0.14, 0, 0xd8b23a, { rough: 0.4, metal: 0.6, seg: 8, seg2: 16 });
    holoTag(hookRoll, "hook block", 0, 0.3, 0, { css: "#3a5fc4", w: 0.3 });
    reg(hits, hookRoll, "hook-roll");
    const hookSocket = group(g, 0, 0, 0);
    hits["hook-socket"] = hook;

    const twoBlockZone = ball(g, 0.08, 3.2, 3.2, -2.0, 0xf0645b, { emissive: 0xf0645b, ei: 1.6, opacity: 0.7, transparent: true });
    holoTag(twoBlockZone, "two-block limit", 0, 0.16, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, twoBlockZone, "two-block-risk-crane");

    const chartPanel = instrument(g, 2.2, 0, -0.8, { ry: -0.4, idle: "-- %", color: OPCC_ACCENT });
    holoTag(chartPanel, "load chart", 0, 0.16, 0, { css: "#3a5fc4", w: 0.3 });
    reg(hits, chartPanel, "load-chart");
    const overloadMarker = group(boom, 0.5, 0.2, 3.0);
    ball(overloadMarker, 0.03, 0, 0, 0, 0xf0645b, { emissive: 0xf0645b, ei: 1.8 });
    holoTag(overloadMarker, "radius exceeds chart", 0, 0.1, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, overloadMarker, "chart-exceeded-crane");

    const bubbleHousing = group(house, 0.6, 0.4, -0.6);
    box(bubbleHousing, 0.14, 0.06, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.6 });
    const bubbleFace = decal(bubbleHousing, 0.12, 0.05, 0, 0.033, 0,
      signFace("LEVEL", { bg: "#0d1c24", accent: "#3a5fc4", fg: "#bfeaf7", scale: 0.5 }), { px: 200, glow: true, ei: 0.8 });
    bubbleFace.rotation.x = -Math.PI / 2;
    holoTag(bubbleHousing, "level bubble", 0, 0.09, 0, { css: "#3a5fc4", w: 0.28 });
    reg(hits, bubbleHousing, "level-bubble");

    const angleIndicator = instrument(g, -1.9, 0, 1.1, { ry: 0.4, idle: "--°", color: OPCC_ACCENT });
    holoTag(angleIndicator, "boom angle indicator", 0, 0.16, 0, { css: "#3a5fc4", w: 0.4 });
    reg(hits, angleIndicator, "boom-angle-indicator");

    // ------------------------------------------------------------------ ground bearing + guarding
    const mats = group(g, -1.0, 0, -2.6);
    for (const sx of [-1, 1]) box(mats, 1.6, 0.06, 3.6, sx * 1.0, 0.03, 1.0, 0x453522, { rough: 0.9 });
    holoTag(mats, "ground mats", 0, 0.18, -0.6, { css: "#3a5fc4", w: 0.32 });
    reg(hits, mats, "ground-mats-board");

    reg(hits, cone(g, -2.9, 2.3, { color: OPCC_ACCENT }), "cone-a");
    reg(hits, cone(g, 2.9, 2.3, { color: OPCC_ACCENT }), "cone-b");
    const barrierPanels = [];
    for (const [bx, bz, ry] of [[-1.0, 3.0, 0], [0.0, 3.0, 0], [1.0, 3.0, 0], [2.4, 1.4, Math.PI / 2], [-2.4, 1.4, Math.PI / 2]]) {
      const p = barrierPanel(g, bx, bz, { ry, w: 1.1, color: OPCC_ACCENT });
      p.visible = false;
      barrierPanels.push(p);
    }
    const swingBarrierKit = group(g, 2.4, 0, -1.0, -0.4);
    slab(swingBarrierKit, 1.0, 0.14, 0.18, 0, 0.08, 0, OPCC_ACCENT, { radius: 0.02, rough: 0.6 });
    holoTag(swingBarrierKit, "swing radius barrier", 0, 0.3, 0, { css: "#3a5fc4", w: 0.38 });
    reg(hits, swingBarrierKit, "swing-barrier");
    const swingShadow = box(g, 3.4, 0.005, 3.4, -1.0, 0.15, -1.6, 0x000000, { opacity: 0.16, transparent: true, cast: false });
    holoTag(swingShadow, "swing radius", -1.0, 0.3, 0.3, { css: "#f0645b", w: 0.34 });
    reg(hits, swingShadow, "swing-radius-stand-crane");

    // Level-recheck flag the crawler-pad-settles interrupt is answered with.
    const recheckFlag = group(g, 0.8, 0.14, 2.4, 0.3);
    cyl(recheckFlag, 0.012, 0.012, 0.7, 0, 0.35, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    box(recheckFlag, 0.16, 0.11, 0.01, 0, 0.62, 0.02, 0x59c97b, { rough: 0.55 });
    holoTag(recheckFlag, "level recheck", 0, 0.78, 0, { css: "#3a5fc4", w: 0.34 });
    reg(hits, recheckFlag, "level-recheck-flag");

    // ------------------------------------------------------------------ crew
    const signalPerson = standingFigure(g, 2.3, 0.2, { ry: -1.8, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(signalPerson, "signal person", 0, 1.95, 0.15, { css: "#3a5fc4", w: 0.3 });
    reg(hits, signalPerson, "signal-person");
    const signalPersonSafe = { x: 2.3, z: 0.2 };

    const rigger = standingFigure(g, -2.7, -2.8, { ry: 0.9, cloth: 0x37505f, vest: 0xe4dc3a, helmet: 0xf2c14b });
    holoTag(rigger, "rigger", 0, 1.95, 0.15, { css: "#3a5fc4", w: 0.24 });

    // ------------------------------------------------------------------ paperwork + gear
    const plan = holoPanel(g, 0.58, 0.4, -2.7, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#3a5fc4"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("ASSEMBLY LOG · CC-80", w * 0.06, h * 0.1);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CHART MARGIN PER THE PLAN", w * 0.06, h * 0.28);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Ground bearing: per the matting plan", "Backstop: engaged before rigging",
       "Swing radius: barricade before slewing", "Test lift: proved before the first real pick",
       "Boom angle: confirmed against the plan"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.42 + i * 0.1)));
    }, { ry: 0.6, accent: OPCC_ACCENT });
    reg(hits, plan, "lift-plan-board");

    const ppeRack = group(g, -2.9, 0, 2.6, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, OPCC_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#3a5fc4", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const hatProp = group(ppeRack, 0.2, 0.62, 0);
    ball(hatProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    holoTag(hatProp, "hard hat", 0, 0.18, 0, { css: "#3a5fc4", w: 0.28 });
    reg(hits, hatProp, "hard-hat");

    const closingLog = group(g, 2.7, 0, 2.6, 0.4);
    slab(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("ASSEMBLY LOG\nOPEN", { bg: "#11181f", accent: "#3a5fc4", scale: 0.26 }), { px: 320 });
    holoTag(closingLog, "assembly log", 0, 1.34, 0, { css: "#3a5fc4", w: 0.3 });
    reg(hits, closingLog, "closing-log");

    // Site dressing from the shared props kit.
    counterweightStack(g, 2.6, 0, -2.6, { ry: -0.5 });

    void hookSocket;

    return {
      hits,
      footprint: 2.7,

      onInterrupt(it) {
        if (it.id === "boom-pin-shifts") { boom.rotation.z = 0.05; }
        if (it.id === "crawler-pad-settles") { crane.rotation.z = -0.06; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "boom-pin-shifts") { boom.rotation.z = 0; }
        if (it.id === "crawler-pad-settles") { crane.rotation.z = 0; }
      },
      onStepComplete(step) {
        if (step.id === "inspect-assembly") {
          loosePin.children[0].material = mat(0x59c97b, { rough: 0.5 });
          kinkedPendant.rotation.z = 0;
          damagedLacing.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "backstop-engage") { backstopL.rotation.x = -0.3; backstopR.rotation.x = -0.3; }
        if (step.id === "barricade-swing") barrierPanels.forEach((p) => { p.visible = true; });
        if (step.id === "load-chart-check") {
          repaint(chartPanel.userData.screen, signFace("80%", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("ASSEMBLY LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
        }
      },
      onHazard() {},

      animate(t, dt, session) {
        signalPerson.userData.head.rotation.y = Math.sin(t * 0.7) * 0.5;
        rigger.userData.head.rotation.y = Math.sin(t * 0.5 + 1) * 0.3;
        twoBlockZone.material.emissiveIntensity = 1.3 + Math.sin(t * 3) * 0.5;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "level-check") {
            const off = ((gg.t - 0.5) * 6).toFixed(1);
            repaint(bubbleFace, signFace(`${off}°`, {
              bg: "#0d1c24", accent: gg.t > 0.46 && gg.t < 0.58 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.45,
            }));
          }
          if (session.step?.id === "load-chart-check") {
            const pct = Math.round(gg.t * 100);
            repaint(chartPanel.userData.screen, signFace(`${pct}%`, {
              bg: "#0d1c24", accent: gg.t > 0.55 && gg.t < 0.85 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
        }

        if (session?.step?.id === "direct-test-swing" && session.holding) {
          const p = Math.min(1, session.holdFor / session.step.seconds);
          crane.rotation.y = 1.3 + p * 0.4;
        }
        void signalPersonSafe;
      },
    };
  },
};
