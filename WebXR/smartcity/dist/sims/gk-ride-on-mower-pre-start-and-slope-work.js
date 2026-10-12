import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, texturedMat, grassFace, gravelFace, palette, reg,
} from "../citykit.js";
import { shrubBed } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ride-On Rotary Mower Pre-Start & Slope Work VR — Grounds &
// Landscaping, the first station of the grounds crew pack.
//
// A commercial ride-on rotary mower at the start of a shift on a park slope:
// the walk-around and the interlock checks done before the seat is ever sat
// in, the ROPS latched and the seatbelt actually buckled, the bench walked
// for the drop-off and the wet patch a wheel would otherwise find blind, the
// bystanders cleared and a spotter briefed before the blade ever turns, and
// the slope itself cut the way the machine's own operator's manual sets out
// — never a grade percentage this platform is not sure of, only "per the
// manual". Generic grounds crew, generic park: no site, manufacturer or
// clause number this platform has not registered.

const GKM_ACCENT = 0xf07a1f;
const GKM_CSS = "#f07a1f";
const GKM_PAL = palette("grounds");

export const SIM_GK_RIDE_ON_MOWER_PRE_START_AND_SLOPE_WORK = {
  id: "gk-ride-on-mower-pre-start-and-slope-work",
  index: "gk-01",
  domain: "Grounds & Landscaping",
  trade: "Grounds equipment operator — LIUNA grounds and landscaping crew",
  category: "Grounds & Landscaping",
  district: "fairway-park",
  weather: "wind",
  certification: "OSHA 29 CFR 1910.132 personal protective equipment, 29 CFR 1910.95 occupational noise exposure, 29 CFR 1910.212 machine guarding and 29 CFR 1910.147 control of hazardous energy; ANSI B71 outdoor power equipment safety specifications for ride-on rotary mowers; NIOSH guidance on rollover and slope-related incidents with riding mowers; LIUNA grounds and landscaping crew training",
  name: "Ride-On Mower Pre-Start & Slope Work",
  title: simTitle("Ride-On Mower Pre-Start & Slope Work"),
  tagline: "A ride-on rotary mower before the first cut: the walk-around, the interlocks, the ROPS and seatbelt, the bench walked for what a wheel cannot see coming, and the slope cut the way the manual sets out",
  accent: GKM_ACCENT,
  accentCss: GKM_CSS,
  parSeconds: 300,
  footprint: 2.8,
  badge: { id: "slope-cleared", name: "Slope Cleared", note: "Walk-around clean, interlocks confirmed, ROPS and seatbelt on, bystanders clear, and the bench cut without a single unsafe act" },

  supportLine: "your union steward or the grounds department's employee assistance line, especially after a close call on a slope",

  game: system({
    name: "Grounds Crew",
    currency: "TURF",
    ranks: ["Ground Hand", "Mower Operator", "Slope Certified", "Crew Lead", "Grounds Certified"],
    badges: [
      { id: "walkaround-clean", name: "Walk-Around Clean", note: "Found every fault on the pre-start inspection", test: AWARD.stepClean("walkaround-inspect") },
      { id: "belted-up", name: "Belted Up", note: "Never engaged the blade without the seatbelt buckled", test: AWARD.stepClean("seatbelt-buckle") },
      { id: "no-shortcut", name: "No Shortcut", note: "No unsafe action anywhere on the slope", test: AWARD.safe },
      { id: "steady-line", name: "Steady Line", note: "Held the trim line and the temperature gauge near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "quick-start", name: "Quick Start", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "No corrections across the whole run", test: AWARD.clean },
      { id: "grounds-streak", name: "Grounds Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "downhill-mount-step": "You mounted from the downhill side of the machine. A ride-on mower parked across even a gentle slope shifts its own weight toward that side the instant a boot lands on the step, and mounting from downhill puts a foot exactly where a machine that starts to roll goes first.",
    "interlock-bypass-pin": "That pin is sitting in the operator-presence switch to hold it closed with nobody in the seat. The whole point of that switch is that the blade and the drive both stop the instant the operator leaves the seat — wedging it shut turns a machine designed to stop itself into one that will not, on a slope where that is exactly when it matters most.",
    "deck-underside-reach": "You reached toward the underside of the deck while the engine was running. A rotary blade spinning under a mower deck does not look like it is moving at operating speed, and a hand that finds out otherwise finds out from the one part of this machine built to cut through turf roots, not fingers.",
    "shoulder-drop-edge": "You walked the mower right up to the drop-off at the edge of the bench. The ground past that edge is not supporting anything, and a machine that puts even one wheel over it commits its own weight to a fall the operator cannot correct for from the seat.",
  },

  lateNotes: {
    "wet-slick-patch": "The wet patch is the one a tyre finds by losing grip on it, not by looking different enough to see from the seat — that is exactly why it gets walked and flagged before the machine is anywhere near it.",
    "deck-lift-lever": "The deck stays raised for the whole crossing, not just the first few feet of gravel — a blade that clips loose stone anywhere along that path throws it exactly like the stone was aimed.",
  },

  interrupts: [
    {
      id: "wheel-slip-warning",
      kind: "Traction loss",
      after: "mow-the-bench", delay: 4, seconds: 12,
      alert: "The uphill rear wheel has broken traction on a patch the walk-down missed, and the machine has started to drift toward the low side of the bench.",
      cue: "Ease off the throttle lever and steer straight downslope until the wheel bites again — do not fight it with the steering alone.",
      target: "throttle-ease-lever",
      why: "A wheel that has already broken traction on a slope does not regain it by steering harder across the grade — that only asks more of the wheel that is already slipping. Easing the throttle and pointing the machine straight downslope is what lets the tyre find grip again before the drift becomes a machine going somewhere the operator did not choose.",
      missNote: "The drift kept building while the throttle stayed open. A mower that loses the rest of its traction on a slope does not wait for the operator to notice a second time.",
      wrongNote: "Not that — ease the throttle and point the machine straight downslope before anything else on this pass matters.",
    },
    {
      id: "dog-on-the-line",
      kind: "Bystander incursion",
      after: "work-under-spotter-signal", delay: 3, seconds: 10,
      alert: "A loose dog has come through the barrier and is running along the flower bed edge, straight into the mower's path.",
      cue: "Sound the warning horn and stop the blade before the line goes anywhere near the bed.",
      target: "warning-horn",
      why: "A running dog gives no warning it is about to cross into a mower's path, and the spotter watching the slope edge is not the same person watching the bed line — the horn is what tells everyone nearby, human or not, that the machine is stopping right now, before the trim line ever gets there.",
      missNote: "The mower kept moving toward the bed while the dog was still on the line. A blade running at cutting speed does not know the difference between turf and anything else in front of it.",
      wrongNote: "Not that — the horn and the stop are what this moment needs, before the line moves another foot.",
    },
  ],

  steps: [
    {
      id: "ppe-up", kind: "sequence", anyOrder: true,
      targets: ["ear-protection", "eye-protection", "hi-vis-vest"],
      itemNames: { "ear-protection": "ear protection", "eye-protection": "eye protection", "hi-vis-vest": "hi-vis vest" },
      title: "Suit up before the walk-around",
      cue: "Ear protection, eye protection and a hi-vis vest before touching the machine.",
      why: "A ride-on rotary mower's engine and cutting deck run well past the level OSHA's noise standard treats as safe for a full shift, and the deck throws whatever a blade catches — a stone, a stick, a chunk of turf — hard enough to matter, so the protection goes on before the first inspection, not after the first close call.",
    },
    {
      id: "read-manual-tag", kind: "select", target: "manual-tag",
      title: "Read the operator's manual plate",
      cue: "Check the manual's own slope limit and ROPS/seatbelt instructions before starting the machine.",
      why: "Every ride-on mower's rated slope limit, its ROPS requirements and its seatbelt instructions live in that machine's own operator's manual, not in a number this platform would be guessing at — reading the plate before starting is what confirms today's bench is actually inside what this specific machine is built to work.",
    },
    {
      id: "walkaround-inspect", kind: "find", noHint: true,
      targets: ["low-tire", "loose-blade-bolt", "fuel-drip"],
      itemNames: { "low-tire": "the low rear tyre", "loose-blade-bolt": "the loose blade-mount bolt", "fuel-drip": "the fuel drip under the tank" },
      itemNotes: {
        "low-tire": "A tyre running soft changes how the machine sits on a slope in a way the seat does not telegraph until the grade is already doing the work.",
        "loose-blade-bolt": "A blade-mount bolt that backs off in service can let a spinning blade shift on its spindle, which is exactly the kind of failure a five-minute walk-around exists to catch first.",
        "fuel-drip": "A fuel drip found now is a five-minute fix; a fuel drip found by a hot exhaust manifold later on the same slope is a fire.",
      },
      decoyNotes: { "clean-chute": "The discharge chute guard is seated and undamaged. Nothing to flag there." },
      title: "Walk around the machine before starting it",
      cue: "Three faults are hiding on this machine's walk-around — find them by looking, not by guessing.",
      why: "A ride-on mower that starts clean every morning is not the same thing as a ride-on mower a crew member has actually walked around and checked — the fault that gets found on flat ground before the engine starts is the one that never gets the chance to become a failure halfway up a bench.",
    },
    {
      id: "confirm-interlocks", kind: "sequence", anyOrder: true,
      targets: ["seat-switch-check", "pto-interlock-check", "brake-interlock-check"],
      itemNames: { "seat-switch-check": "seat safety switch", "pto-interlock-check": "blade interlock switch", "brake-interlock-check": "parking-brake interlock" },
      title: "Confirm the machine's own safety interlocks",
      cue: "Check the seat switch, the blade interlock and the parking-brake interlock before mounting up.",
      why: "The manufacturer built this machine so the blade cannot engage unless the operator is in the seat, the parking brake stops the drive when nobody is aboard, and the two switches back each other up — confirming both work today is what makes those interlocks a real safeguard rather than a feature nobody has checked since it left the dealer.",
    },
    {
      id: "rops-latch", kind: "select", target: "rops-latch-pin",
      title: "Latch the ROPS upright",
      cue: "Confirm the rollover protective structure is raised and the latch pin is fully seated.",
      why: "A ROPS structure only protects the operator through a rollover if it is actually up and locked before the machine moves — folded down for a low branch and never raised again is a cage that looks present and protects nobody.",
    },
    {
      id: "seatbelt-buckle", kind: "select", target: "seatbelt",
      title: "Buckle the seatbelt",
      cue: "Buckle in every time the ROPS is up, not only on the steep sections.",
      why: "The ROPS only keeps an operator inside its zone of protection through a rollover if the seatbelt is what is actually holding them there — a latched cage over an unbelted seat protects a machine, not the person in it.",
    },
    {
      id: "walk-the-bench", kind: "find", noHint: true,
      targets: ["drop-off-edge", "wet-slick-patch", "hidden-sprinkler-head"],
      itemNames: { "drop-off-edge": "the drop-off at the bench edge", "wet-slick-patch": "the wet slick patch on the grade", "hidden-sprinkler-head": "the sprinkler head sitting proud of the turf" },
      itemNotes: {
        "drop-off-edge": "The ground past this edge is not supporting anything — a wheel that reaches it finds that out from underneath, not before.",
        "wet-slick-patch": "A patch this wet on a grade is the one a tyre loses grip on with no warning, which is why it gets flagged and mown around rather than through.",
        "hidden-sprinkler-head": "A sprinkler head standing proud of the turf is exactly what a mower deck catches and turns into a projectile at cutting speed.",
      },
      decoyNotes: { "level-turf-patch": "That section of the bench is level, dry and holding its footing. Nothing to flag there." },
      title: "Walk the bench before the machine goes near it",
      cue: "Three things on this slope are not what they look like from the seat — walk it and find them.",
      why: "A slope that reads as even ground from the operator's seat is not the same thing as a slope a person has actually walked, and the drop-off, the wet patch and the sprinkler head are exactly the kind of hazard a walk-down catches and a windshield view never does.",
    },
    {
      id: "slope-plan-read", kind: "select", target: "slope-plan-board",
      title: "Read the mowing plan for the bench",
      cue: "Confirm the mowing direction and the marked hazards against the plan before starting the engine.",
      why: "The mowing plan is what sets today's direction of travel and marks what the walk-down already flagged — starting the engine before reading it risks mowing a line the plan specifically routed around for a reason the operator has not yet been told.",
    },
    {
      id: "clear-bystanders", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "slope-barrier"],
      itemNames: { "cone-a": "cone at the near approach", "cone-b": "cone at the far approach", "slope-barrier": "barrier along the bed edge" },
      title: "Cone and barrier the work area",
      cue: "Cone both approaches and set the barrier along the flower bed before the engine starts.",
      why: "A rotary deck can throw debris well past where it looks like it should reach, and a cone line with a barrier along the one open edge is what keeps a passer-by, a coworker on a break, or a resident's dog from finding that out by being in the strike zone when the blade is turning.",
    },
    {
      id: "spotter-brief", kind: "select", target: "spotter",
      title: "Brief the spotter",
      cue: "Agree the stop signal and the slope-edge watch with the spotter before mounting up.",
      why: "The spotter is watching the drop-off and the bed line — the two things the operator's own seat cannot judge while running the machine — and that only works if both of them already agree on what a stop signal looks like before the blade is turning and it is needed for real.",
    },
    {
      id: "blade-engage", kind: "turn", target: "pto-lever",
      title: "Engage the blade only once clear",
      cue: "Turn the PTO lever to engage the blade only after everyone is clear of the deck.",
      why: "A rotary blade takes a moment to spin up to cutting speed and does not announce when it has reached it — engaging the PTO only once the walk-down, the interlocks and the bystander check are all already done is what keeps that spin-up from ever happening near anyone still in the strike zone.",
      turn: { turns: 0.4, axis: "z", label: "BLADE PTO" },
    },
    {
      id: "mow-the-bench", kind: "drive", target: "mower-rig",
      title: "Cut the bench on the plan's line",
      cue: "Drive the bench at mowing speed, staying inside the marked line the plan set, with the horn tapped before each pass starts.",
      why: "The mowing plan's own line keeps the machine off the drop-off and clear of the wet patch the walk-down flagged, and a horn tap before each pass is what tells anyone near the bed the machine is moving again — holding the line and the speed band is what turns the walk-down's findings into an actual safe pass rather than a warning nobody used.",
      holdBreakNote: "Off the plan's line or outside the speed band. Slow down and settle back onto the marked line before continuing the pass.",
      drive: {
        path: [[-1.6, 1.6], [-0.8, 0.6], [0, -0.2], [0.9, -0.9], [1.7, -1.6]],
        speedBand: [3, 9], laneWidth: 1.2, graceSeconds: 1.6, checkWindow: 1.4, sceneRate: 0.22,
        bandLabel: "mowing speed, per the operator's manual",
        checks: [
          { at: 0, kind: "horn", note: "Tap the horn before the pass starts, so anyone near the bed knows the machine is moving." },
          { at: 2, kind: "mirror-left", note: "Mirror check for the spotter's position at the mid-point of the pass." },
          { at: 4, kind: "mirror-right", note: "Mirror check toward the bed edge as the pass finishes." },
        ],
        controls: { horn: "mower-horn", throttleEase: "throttle-ease-lever" },
        laneNote: "Off the marked line. On this bench that is either the drop-off or the wet patch the walk-down already flagged.",
      },
    },
    {
      id: "work-under-spotter-signal", kind: "track", target: "spotter", seconds: 8,
      title: "Trim the bed edge under the spotter's signal",
      cue: "Keep the spotter's signal steady, holding the trim line clear of the flower bed.",
      why: "The spotter is watching the one thing the operator's own seat cannot judge while trimming the edge — how close the deck actually is to the bed — and a steady signal is what lets the operator trust that distance instead of guessing it against a bed that looks closer from the seat than it actually is.",
      track: {
        start: 0.14, green: [0.4, 0.64], rise: 0.5, fall: 0.44, drift: 0.12,
        label: "BED EDGE LINE",
        readout: (v) => (v < 0.4 ? "drifting into the bed" : v > 0.64 ? "drifting off the turf" : "on the marked line"),
      },
      holdBreakNote: "The trim line drifted off the spotter's signal. Bring it back onto the marked line before the deck moves again.",
    },
    {
      id: "temp-gauge-check", kind: "gauge", target: "temp-gauge",
      title: "Check the engine temperature after the slope pass",
      cue: "Read the engine temperature gauge and commit only inside the safe band.",
      why: "A slope pass loads the engine harder than flat ground does, and a temperature gauge that is still climbing after the pass is the machine's own warning that it needs a moment before the next one — committing the reading is what confirms the engine is actually ready rather than just quiet.",
      gauge: {
        label: "ENGINE TEMPERATURE", speed: 0.6, green: [0.42, 0.66],
        readout: (t) => `${Math.round(180 + t * 60)}°`,
        missNote: "Outside the safe band. Let the engine idle down before committing this reading.",
      },
    },
    {
      id: "cross-gravel-path", kind: "hold", target: "deck-lift-lever", seconds: 5,
      title: "Cross the gravel path with the deck raised",
      cue: "Hold the deck-lift lever up for the whole crossing of the gravel path.",
      why: "A rotary blade that clips loose gravel throws it exactly the way it throws a stone off turf, only there is more of it — raising the deck for the entire crossing, not just the first few feet, is what keeps this short stretch of path from becoming the one moment the walk-down's careful work gets undone.",
      holdBreakNote: "The deck dropped before the crossing finished. Hold it raised the whole way across the gravel, every time.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the pre-start and slope work log",
      cue: "Log the walk-around findings, the interlock check and the bench result before parking the machine.",
      why: "The pre-start log is what the next operator and the next inspection both read — a machine that was checked and run cleanly but never logged leaves nothing behind to prove the walk-around actually happened before the blade ever turned.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GKM_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.6, 0.14, 6.2, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 10, a: "#3d7a3a", b: "#457f44" }), { repeat: 7, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xdfeecb },
    );

    // ------------------------------------------------------------------ the bench (slope)
    const bench = group(g, 0.4, 0, 0.2);
    const benchFace = box(bench, 3.4, 0.02, 2.4, 0, 0.16, 0, 0xffffff, { rough: 0.94, cast: false });
    benchFace.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 8, a: "#3a7237", b: "#427a40" }), { repeat: 5, px: 384 }),
      { rough: 0.94, metal: 0.02, color: 0xcfe0b8 },
    );
    benchFace.rotation.z = -0.12;
    benchFace.position.y = 0.34;
    box(bench, 3.4, 0.5, 0.1, 0, 0.06, -1.15, 0x4a5a30, { rough: 0.96, cast: false });
    holoTag(bench, "mowing bench", 0, 0.72, -0.35, { css: GKM_CSS, w: 0.32 });

    const dropOff = group(bench, -1.5, 0.36, -0.9);
    box(dropOff, 0.5, 0.05, 0.3, 0, 0, 0, 0x2b2f22, { rough: 0.9, cast: false });
    reg(hits, dropOff, "drop-off-edge");
    const wetPatch = group(bench, -0.4, 0.4, -0.6);
    box(wetPatch, 0.45, 0.008, 0.32, 0, 0, 0, 0x2a3d33, { rough: 0.2, cast: false });
    reg(hits, wetPatch, "wet-slick-patch");
    const sprinklerHead = group(bench, 0.7, 0.42, -0.4);
    cyl(sprinklerHead, 0.03, 0.03, 0.08, 0, 0.04, 0, 0x6f7a6f, { rough: 0.5, metal: 0.3, seg: 10 });
    reg(hits, sprinklerHead, "hidden-sprinkler-head");
    const levelPatch = group(bench, 1.2, 0.38, -0.55);
    box(levelPatch, 0.5, 0.008, 0.32, 0, 0, 0, 0x3f7a3f, { rough: 0.85, cast: false });
    reg(hits, levelPatch, "level-turf-patch");

    // Drop-off hazard zone, distinct from the find marker.
    const shoulderZone = box(g, 1.4, 0.02, 0.5, -0.4, 0.18, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "drop-off — keep clear", -0.4, 0.34, -0.7, { css: "#f0645b", w: 0.44 });
    reg(hits, shoulderZone, "shoulder-drop-edge");

    // ------------------------------------------------------------------ gravel crossing
    const gravel = box(g, 1.2, 0.03, 1.6, 2.3, 0.09, 0.6, 0xffffff, { rough: 0.9, cast: false });
    gravel.material = texturedMat(
      surfaceTexture((cx, w, h) => gravelFace(cx, w, h, {}), { repeat: 3, px: 320 }),
      { rough: 0.9, metal: 0.02, color: 0xc9c3b2 },
    );

    // ------------------------------------------------------------------ flower bed / trim edge
    const bed = shrubBed(g, 2.5, 0, -1.6, { ry: 0.3 });
    const edgeLine = group(g, 2.0, 0, -1.5, 0.3);
    box(edgeLine, 1.4, 0.02, 0.1, 0, 0.01, 0, 0x8a6a3a, { rough: 0.85, cast: false });

    // ------------------------------------------------------------------ the mower
    const mower = group(g, -1.7, 0.14, 1.6, -2.0);
    const chassis = box(mower, 1.1, 0.3, 1.9, 0, 0.32, 0, GKM_PAL.trim, { rough: 0.5, metal: 0.4 });
    const deck = box(mower, 1.3, 0.18, 1.3, 0, 0.16, 0.55, 0x2b2f22, { rough: 0.6, metal: 0.3 });
    reg(hits, deck, "deck-underside-reach");
    const hood = box(mower, 0.9, 0.34, 0.7, 0, 0.62, -0.55, GKM_ACCENT, { rough: 0.45, metal: 0.25 });
    for (const hx of [-0.28, 0.28]) box(mower, 0.1, 0.1, 0.06, hx, 0.55, -0.9, 0xf2f2ea, { rough: 0.4, emissive: 0xffffff, ei: 0.5 });
    for (const [wx, wz] of [[-0.62, 0.75], [0.62, 0.75], [-0.62, -0.55], [0.62, -0.55]]) {
      const tire = cyl(mower, 0.26, 0.26, 0.2, wx, 0.26, wz, 0x1c1d1f, { rough: 0.85, seg: 20 });
      tire.rotation.z = Math.PI / 2;
      cyl(mower, 0.13, 0.13, 0.21, wx, 0.26, wz, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    }
    const seatGroup = group(mower, 0, 0.62, 0.15);
    box(seatGroup, 0.44, 0.42, 0.08, 0, 0.4, -0.16, 0x2b2f34, { rough: 0.6 });
    box(seatGroup, 0.44, 0.1, 0.42, 0, 0.23, 0.05, 0x2b2f34, { rough: 0.6 });
    reg(hits, seatGroup, "seat-switch-check");
    const seatbelt = group(seatGroup, 0.14, 0.42, 0.15, 0.3);
    box(seatbelt, 0.03, 0.28, 0.02, 0, 0, 0, 0xd8b23a, { rough: 0.7 });
    reg(hits, seatbelt, "seatbelt");
    const bypassPin = group(seatGroup, -0.2, 0.24, 0.2);
    cyl(bypassPin, 0.012, 0.012, 0.1, 0, 0, 0, 0xb8402f, { rough: 0.5, metal: 0.4, seg: 8 });
    reg(hits, bypassPin, "interlock-bypass-pin");

    const rops = group(mower, 0, 0.62, -0.05);
    for (const sx of [-0.5, 0.5]) box(rops, 0.06, 1.0, 0.06, sx, 0.5, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    box(rops, 1.06, 0.06, 0.06, 0, 1.0, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const ropsPin = group(rops, 0.5, 0.05, 0);
    cyl(ropsPin, 0.02, 0.02, 0.1, 0, 0, 0, 0xd8c14b, { rough: 0.4, metal: 0.6, seg: 10 });
    reg(hits, ropsPin, "rops-latch-pin");

    const steer = group(mower, 0.1, 0.7, -0.35, -0.3);
    cyl(steer, 0.012, 0.012, 0.3, 0, 0.2, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 10 });
    torus(steer, 0.14, 0.02, 0, 0.35, 0, 0x1c1d1f, { rough: 0.6, seg: 8, seg2: 20 }).rotation.x = Math.PI / 2;

    const dash = group(mower, -0.22, 0.68, -0.45);
    const ptoLever = box(dash, 0.05, 0.16, 0.03, 0, 0.08, 0, 0xd2312b, { rough: 0.5 });
    reg(hits, ptoLever, "pto-lever");
    const brakeCheck = box(dash, 0.05, 0.1, 0.03, -0.16, 0.05, 0, 0x2b2f34, { rough: 0.5 });
    reg(hits, brakeCheck, "brake-interlock-check");
    const ptoInterlockLamp = ball(dash, 0.02, 0.16, 0.08, 0, 0x59c97b, { emissive: 0x2f8f4a, ei: 0.6, rough: 0.4, seg: 10 });
    reg(hits, ptoInterlockLamp, "pto-interlock-check");
    const throttleLever = box(dash, 0.05, 0.14, 0.03, 0.3, 0.06, 0, 0xf2c14b, { rough: 0.5 });
    reg(hits, throttleLever, "throttle-ease-lever");
    const deckLever = box(dash, 0.05, 0.12, 0.03, -0.3, 0.05, 0, 0x2f6f4a, { rough: 0.5 });
    reg(hits, deckLever, "deck-lift-lever");

    const beacon = ball(rops, 0.045, 0, 1.06, 0, 0x2b2f34, { emissive: 0x2b2f34, ei: 0.2, rough: 0.4, seg: 12 });
    const horn = box(dash, 0.05, 0.05, 0.03, 0, -0.1, 0.05, 0xf2c14b, { rough: 0.5 });
    reg(hits, horn, "mower-horn");
    const warnHorn = box(dash, 0.05, 0.05, 0.03, 0.16, -0.1, 0.05, 0xd2312b, { rough: 0.5 });
    reg(hits, warnHorn, "warning-horn");

    const manualPlate = decal(hood, 0.4, 0.2, 0, 0.02, 0.36, signFace("READ OPERATOR'S\nMANUAL", { bg: "#22261f", accent: GKM_CSS, scale: 0.32 }), { px: 256 });
    reg(hits, manualPlate, "manual-tag");
    holoTag(mower, "mower unit", 0, 1.4, 0, { css: GKM_CSS, w: 0.3 });

    reg(hits, mower, "mower-rig");

    // Downhill mounting step hazard, on the low side of the parked machine.
    const mountStep = box(mower, 0.24, 0.04, 0.16, -0.62, 0.2, 0.75, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    reg(hits, mountStep, "downhill-mount-step");

    // ------------------------------------------------------------------ walk-around faults
    const lowTire = cyl(g, 0.05, 0.05, 0.03, -2.0, 0.14, 1.9, 0x1c1d1f, { rough: 0.9, seg: 12 });
    reg(hits, lowTire, "low-tire");
    const bladeBolt = group(g, -1.4, 0.16, 2.0);
    cyl(bladeBolt, 0.015, 0.015, 0.04, 0, 0, 0, 0x9aa1a8, { rough: 0.4, metal: 0.7, seg: 8 });
    reg(hits, bladeBolt, "loose-blade-bolt");
    const fuelDrip = group(g, -1.9, 0.15, 1.3);
    ball(fuelDrip, 0.02, 0, 0, 0, 0x3a2f1a, { rough: 0.2, seg: 8 });
    reg(hits, fuelDrip, "fuel-drip");
    const chuteCheck = group(g, -1.2, 0.2, 1.5);
    box(chuteCheck, 0.06, 0.06, 0.02, 0, 0, 0, 0x2b2f22, { rough: 0.6 });
    reg(hits, chuteCheck, "clean-chute");

    // ------------------------------------------------------------------ guarding + PPE
    reg(hits, cone(g, -2.6, 2.4, { color: GKM_ACCENT }), "cone-a");
    reg(hits, cone(g, 2.5, -1.2, { color: GKM_ACCENT }), "cone-b");
    const barrierGroup = barrierPanel(g, 1.7, -1.9, { ry: 0.3, w: 1.2, color: GKM_ACCENT });
    reg(hits, barrierGroup, "slope-barrier");

    const ppeRack = group(g, -2.5, 0, -1.0, 0.4);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const earProp = group(ppeRack, -0.08, 0.55, 0);
    torus(earProp, 0.05, 0.014, 0, 0, 0, 0xf2c14b, { rough: 0.6, seg: 8, seg2: 16 });
    reg(hits, earProp, "ear-protection");
    const eyeProp = group(ppeRack, 0.08, 0.55, 0);
    box(eyeProp, 0.1, 0.04, 0.02, 0, 0, 0, 0x2b3138, { rough: 0.4 });
    reg(hits, eyeProp, "eye-protection");
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.35, 0, GKM_ACCENT, { rough: 0.85 });
    reg(hits, vestProp, "hi-vis-vest");

    const chest = toolChest(g, 2.6, 1.8, { ry: -0.5, color: GKM_ACCENT });
    const tempMeter = instrument(chest, 0.16, 0.79, 0.06, { ry: -0.4, idle: "--°", color: GKM_ACCENT });
    holoTag(tempMeter, "engine temp gauge", 0, 0.16, 0, { css: GKM_CSS, w: 0.34 });
    reg(hits, tempMeter, "temp-gauge");

    const plan = holoPanel(g, 0.58, 0.4, -2.4, 1.5, -0.8, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = GKM_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("MOWING PLAN · BENCH 2", w * 0.06, h * 0.12);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("DIRECTION PER THE PLAN", w * 0.06, h * 0.3);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Slope limit: per the operator's manual", "ROPS + seatbelt: every pass",
       "Wet patch and sprinkler: mow around", "Bed edge: spotter signal only"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.46 + i * 0.11)));
    }, { ry: 1.0, accent: GKM_ACCENT });
    reg(hits, plan, "slope-plan-board");

    const closingLog = group(g, 2.7, 0, -1.1, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("PRE-START LOG\nOPEN", { bg: "#11181f", accent: GKM_CSS, scale: 0.24 }), { px: 320 });
    holoTag(closingLog, "pre-start log", 0, 1.34, 0, { css: GKM_CSS, w: 0.34 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ crew
    const spotter = standingFigure(g, 2.2, -0.6, { ry: -2.0, cloth: 0x2b3138, vest: GKM_ACCENT, helmet: 0xf2f2f2 });
    holoTag(spotter, "spotter", 0, 1.95, 0.15, { css: GKM_CSS, w: 0.24 });
    reg(hits, spotter, "spotter");

    // Dog prop, hidden until the bystander-incursion interrupt fires.
    const dog = group(g, 2.3, 0, -1.3, 1.2);
    box(dog, 0.22, 0.14, 0.4, 0, 0.1, 0, 0x8a6a3a, { rough: 0.8 });
    box(dog, 0.1, 0.12, 0.1, 0, 0.18, 0.22, 0x8a6a3a, { rough: 0.8 });
    dog.visible = false;

    const dust = particles(mower, 16, 0x9a8a6a, { size: 0.02, life: 0.6, additive: false, opacity: 0.16 });

    return {
      hits,
      footprint: 2.8,

      onInterrupt(it) {
        if (it.id === "wheel-slip-warning") { mower.rotation.z = -0.1; beacon.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.2, rough: 0.4 }); }
        if (it.id === "dog-on-the-line") { dog.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wheel-slip-warning") { mower.rotation.z = 0; beacon.material = mat(0x2b2f34, { emissive: 0x2b2f34, ei: 0.2, rough: 0.4 }); }
        if (it.id === "dog-on-the-line") { dog.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "walkaround-inspect") {
          lowTire.material = mat(0x9aa1a8, { rough: 0.5, metal: 0.6 });
          bladeBolt.children[0].material = mat(0x59c97b, { rough: 0.6 });
          fuelDrip.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "walk-the-bench") {
          dropOff.children[0].material = mat(0x59c97b, { rough: 0.6 });
          wetPatch.children[0].material = mat(0x59c97b, { rough: 0.6 });
          sprinklerHead.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "clear-bystanders") { barrierGroup.visible = true; }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("PRE-START LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.24 }));
        }
      },
      onHazard(hitId) { if (hitId === "shoulder-drop-edge") { dust.visible = true; } },

      animate(t, dt, session) {
        spotter.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.3, 0), 0.12, 0.12, -0.1);
        if (dog.visible) dog.position.x = 2.3 - (t % 2) * 0.4;

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "temp-gauge-check") {
          const deg = Math.round(180 + gg.t * 60);
          repaint(tempMeter.userData.screen, signFace(`${deg}°`, {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.66 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
