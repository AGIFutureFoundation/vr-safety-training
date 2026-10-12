import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, texturedMat, grassFace, gratingFace, palette, reg,
} from "../citykit.js";
import { parkBench } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ String Trimmer & Blower PPE and Bystander Zone VR — Grounds &
// Landscaping.
//
// A grounds crew member trimming an edge and blowing clippings clear on a
// park path that still has people using it: PPE on before the trimmer is
// touched, the guard and the trigger interlock confirmed rather than
// assumed, the bystander zone posted and barricaded before the engine
// starts, the two-stroke engine started in its own order, and the blower's
// discharge kept off people, pets and the storm drain the whole time it
// runs. Generic park, generic crew — no manufacturer, mix ratio or clearance
// distance this platform is not certain of; each one is "per the label" or
// "per the operator's manual".

const GKT_ACCENT = 0xe8b23a;
const GKT_CSS = "#e8b23a";
const GKT_PAL = palette("grounds");

export const SIM_GK_STRING_TRIMMER_AND_BLOWER_PPE_AND_BYSTANDER_ZONE = {
  id: "gk-string-trimmer-and-blower-ppe-and-bystander-zone",
  index: "gk-02",
  domain: "Grounds & Landscaping",
  trade: "Grounds maintenance worker — AFSCME parks and grounds crew",
  category: "Grounds & Landscaping",
  district: "fairway-park",
  weather: "clear",
  certification: "OSHA 29 CFR 1910.132 personal protective equipment, 29 CFR 1910.133 eye and face protection, 29 CFR 1910.95 occupational noise exposure and 29 CFR 1910.138 hand protection; ANSI B71 outdoor power equipment safety specifications for trimmers and blowers; NIOSH guidance on hand-arm vibration and noise from portable power equipment; AFSCME parks and grounds member training",
  name: "Trimmer & Blower PPE and Bystander Zone",
  title: simTitle("Trimmer & Blower PPE and Bystander Zone"),
  tagline: "A string trimmer and a backpack blower on a park path that still has people on it: PPE first, the guard and trigger interlock confirmed, the bystander zone posted and barricaded, and the blower's discharge kept off people, pets and the storm drain",
  accent: GKT_ACCENT,
  accentCss: GKT_CSS,
  parSeconds: 285,
  footprint: 2.6,
  badge: { id: "zone-held", name: "Zone Held", note: "PPE on, guard and interlock confirmed, the bystander zone posted, and the discharge never once crossed toward a person, a pet or the drain" },

  supportLine: "your union steward or the parks department's employee assistance line",

  game: system({
    name: "Grounds Crew",
    currency: "TURF",
    ranks: ["Ground Hand", "Trimmer Operator", "Zone Certified", "Crew Lead", "Grounds Certified"],
    badges: [
      { id: "guard-on", name: "Guard On", note: "Never ran the trimmer with the guard off", test: AWARD.stepClean("trimmer-precheck") },
      { id: "zone-posted", name: "Zone Posted", note: "Bystander zone posted and barricaded before starting", test: AWARD.stepClean("post-bystander-zone") },
      { id: "no-shortcut", name: "No Shortcut", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "clean-sweep", name: "Clean Sweep", note: "Held the sweep and the vibration gauge near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "quick-edge", name: "Quick Edge", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-round", name: "Clean Round", note: "No corrections across the whole run", test: AWARD.clean },
      { id: "grounds-streak", name: "Grounds Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "trigger-lock-defeat": "That wedge is holding the throttle trigger open with nobody's hand on it. The trigger is a dead-man control on purpose — the cutting head is meant to stop the instant the hand lets go — and defeating it turns a machine designed to stop itself into one that keeps spinning after it is dropped or set down.",
    "no-guard-operation": "You ran the trimmer with the cutting guard removed. The guard is what stands between the operator's legs and a nylon line spinning fast enough to strip bark off a sapling, and it also catches whatever the line kicks up before it becomes a projectile aimed at whoever is standing nearby.",
    "blower-toward-bystander": "You aimed the blower's discharge toward a person instead of away from them. A backpack blower moves air fast enough to drive grit, gravel and debris hard enough to cut skin or reach an eye, and the operator choosing where that air goes is the only thing standing between a park path and someone getting hit with it.",
    "reach-near-spinning-head": "You reached toward the trimmer head while the engine was still running. A spinning nylon line looks like nothing is there until it meets skin, and a hand reached in to clear a wrap or a jam finds that out immediately unless the engine is stopped first.",
  },

  lateNotes: {
    "buried-rock": "A rock sitting proud of the turf is exactly what a trimmer line — or a blower's air blast — turns into a projectile the moment it is disturbed.",
    "storm-drain-marker": "Clippings blown into a storm drain do not stay there — they wash straight into whatever the drain feeds, which is why the discharge is aimed away from it every time, not just when someone is watching.",
  },

  interrupts: [
    {
      id: "bystander-crosses-zone",
      kind: "Zone breach",
      after: "idle-warmup-hold", delay: 3, seconds: 10,
      alert: "A jogger has stepped past the near cone and is closing on the posted bystander zone while the trimmer idles.",
      cue: "Sound the warning whistle and wave them back before the trimmer comes up to cutting speed.",
      target: "warning-whistle",
      why: "A trimmer at idle is one throttle squeeze away from cutting speed, and a jogger who has already crossed the posted line has no way of knowing that from the path — the whistle is what stops them before the throttle opens, rather than after.",
      missNote: "The jogger kept closing while the trimmer stayed at idle. The zone was posted for exactly this moment, and a posted zone nobody enforces protects nobody.",
      wrongNote: "Not that — the whistle and the wave-back are what this moment needs before the throttle opens.",
    },
    {
      id: "dust-cloud-toward-watch",
      kind: "Visibility loss",
      after: "sweep-under-watch", delay: 4, seconds: 11,
      alert: "A gust has carried the blower's own dust cloud back toward the ground-watch, cutting their sightline to the path.",
      cue: "Angle the nozzle away from the ground-watch before the cloud reaches them.",
      target: "nozzle-angle-lever",
      why: "A ground-watch who cannot see the path is a ground-watch who cannot warn anyone walking onto it, and the operator holding the blower is the only one who can change where that dust is heading — angling the nozzle away is what gets their sightline back before someone steps into a blind spot nobody can see is there.",
      missNote: "The dust cloud stayed on the ground-watch while the sweep continued. A blind spotter is the same as no spotter at all.",
      wrongNote: "Not that — angle the nozzle away from the ground-watch before anything else about this sweep matters.",
    },
  ],

  steps: [
    {
      id: "ppe-up", kind: "sequence", anyOrder: true,
      targets: ["face-shield", "ear-protection", "cut-resistant-gloves"],
      itemNames: { "face-shield": "face shield", "ear-protection": "ear protection", "cut-resistant-gloves": "cut-resistant gloves" },
      title: "Suit up before touching the trimmer",
      cue: "Face shield, ear protection and cut-resistant gloves before the trimmer or blower come off the rack.",
      why: "A trimmer line spinning at cutting speed throws grit and debris at eye level, the engine and the head both run well past a level OSHA's noise standard treats as safe for a shift, and a hand that slips near the head is safer for having something between it and the line — the PPE goes on before the rack is touched, not after the first close call.",
    },
    {
      id: "check-fuel-label", kind: "select", target: "fuel-mix-label",
      title: "Check the fuel mix against the label",
      cue: "Read the fuel container's own label before fuelling the trimmer.",
      why: "A two-stroke trimmer's fuel-to-oil ratio is set by that engine's own label and operator's manual, not by habit or by what the can looked like last time — checking it before fuelling is what keeps a lean or rich mix from wrecking the engine or fouling on the first pull.",
    },
    {
      id: "scan-work-zone", kind: "find", noHint: true,
      targets: ["buried-rock", "exposed-sprinkler", "bench-too-close"],
      itemNames: { "buried-rock": "a rock sitting proud of the turf", "exposed-sprinkler": "a sprinkler head standing proud of the edge", "bench-too-close": "a park bench sitting inside the planned cutting line" },
      itemNotes: {
        "buried-rock": "A rock like this is exactly what a trimmer line turns into a projectile the moment the line catches it.",
        "exposed-sprinkler": "A sprinkler head standing proud of the edge is what a trimmer line shreds instead of grass, and shreds back at the operator.",
        "bench-too-close": "A bench sitting this close to the planned line means whoever is on it is inside the throw radius the moment the trimmer starts.",
      },
      decoyNotes: { "clear-turf-patch": "That stretch of edge is clear turf with nothing hiding in it. Nothing to flag there." },
      title: "Scan the work zone before starting anything",
      cue: "Three things along this edge are not what they look like from a standing start — find them by walking the line.",
      why: "A work zone that looks clear from where the crew is standing is not the same thing as a zone someone has actually walked and checked, and a rock, a sprinkler head or a bench inside the cutting line are exactly the kind of hazard a walk-down catches before the trimmer ever starts.",
    },
    {
      id: "trimmer-precheck", kind: "sequence", anyOrder: true,
      targets: ["guard-attached", "string-line-length", "throttle-interlock"],
      itemNames: { "guard-attached": "cutting guard", "string-line-length": "trimmer line length", "throttle-interlock": "throttle trigger interlock" },
      title: "Precheck the trimmer",
      cue: "Confirm the guard is attached, the line is cut to length and the throttle interlock resets on its own.",
      why: "The guard, the line length and the trigger interlock are the three things standing between a spinning nylon line and whoever is nearby — confirming all three before the engine starts is what makes them an actual safeguard rather than a set of parts nobody has checked since the trimmer left the rack.",
    },
    {
      id: "post-bystander-zone", kind: "select", target: "bystander-zone-sign",
      title: "Post the bystander zone",
      cue: "Set the bystander zone sign at the clearance distance the operator's manual sets, before anyone starts the engine.",
      why: "The operator's manual sets the clearance distance this specific trimmer and blower need between the operator and anyone standing by — posting the sign before starting is what turns that distance from a number in a manual into something a passer-by can actually see and respect.",
    },
    {
      id: "barricade-zone", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "zone-barrier"],
      itemNames: { "cone-a": "cone at the near approach", "cone-b": "cone at the far approach", "zone-barrier": "barrier along the open side" },
      title: "Barricade the bystander zone",
      cue: "Cone both approaches and set the barrier along the one open side of the work area.",
      why: "A posted sign only works on someone who is already looking for it — a cone line and a barrier are what stop a jogger, a cyclist or a dog on a long leash from wandering into the throw radius without ever reading the sign at all.",
    },
    {
      id: "start-the-trimmer", kind: "sequence", anyOrder: false,
      targets: ["primer-bulb", "choke-lever", "pull-cord"],
      itemNames: { "primer-bulb": "primer bulb", "choke-lever": "choke lever", "pull-cord": "pull cord" },
      outOfOrderNote: "That is out of the two-stroke engine's own starting order. Prime, then choke, then pull — doing it out of order is exactly how a flooded engine or a kickback on the cord happens.",
      title: "Start the trimmer in order",
      cue: "Prime the bulb, set the choke, then pull the cord — in that order, the way this two-stroke engine starts.",
      why: "A two-stroke engine's starting sequence exists because each step sets up the next one — priming loads the carburettor, the choke enriches the mixture for a cold start, and only then does the pull cord have fuel and air actually ready to fire — doing it out of order is how an engine floods or kicks back on the cord instead of starting clean.",
    },
    {
      id: "idle-warmup-hold", kind: "hold", target: "throttle-trigger", seconds: 4,
      title: "Hold the trimmer at idle to warm up",
      cue: "Hold the throttle trigger steady at idle for a few seconds before advancing to cutting speed.",
      why: "A cold two-stroke engine run straight to cutting speed is more likely to bog or stall than one given a few seconds at idle first, and idle is also the safe speed to be at while a last look is taken around the zone before the line is actually spinning fast enough to cut.",
      holdBreakNote: "Let go of the trigger before the warm-up finished. Hold it steady at idle for the full few seconds, every time.",
    },
    {
      id: "stage-the-blower", kind: "drag", target: "blower-unit",
      title: "Stage the blower at the work area",
      cue: "Carry the backpack blower from the rack to the marked staging spot before putting it on.",
      why: "Staging the blower at the work area rather than shouldering it back at the rack means the first steps taken with a running engine on the back are steps that are actually needed, not an extra walk across the whole zone with a loaded backpack unit still warming up.",
      drag: { to: "blower-staging-spot", radius: 0.4, missNote: "Not on the marked spot — carry the blower to where the staging mark actually is." },
    },
    {
      id: "blower-speed-dial", kind: "turn", target: "speed-dial",
      title: "Bring the blower up to sweeping speed",
      cue: "Turn the speed dial up smoothly once the nozzle is aimed away from anyone nearby.",
      why: "A blower brought straight to full speed with the nozzle still swinging around throws whatever is on the ground in whatever direction it happened to be pointed — turning the dial up only once the nozzle is already aimed at open ground is what keeps that first blast of air from becoming the first mistake of the sweep.",
      turn: { turns: 0.45, axis: "z", label: "BLOWER SPEED" },
    },
    {
      id: "sweep-under-watch", kind: "track", target: "ground-watch", seconds: 8,
      title: "Sweep the path under the ground-watch's signal",
      cue: "Keep the ground-watch's signal steady, sweeping clippings clear of the path rather than across it.",
      why: "The ground-watch is looking down the path in the direction the operator's own attention is on the nozzle and the debris, and a steady signal is what lets the operator trust that the path ahead is still clear instead of finding out otherwise from someone stepping into the discharge.",
      track: {
        start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.13,
        label: "SWEEP LINE",
        readout: (v) => (v < 0.4 ? "swinging toward the bench" : v > 0.62 ? "swinging off the path" : "on the marked sweep"),
      },
      holdBreakNote: "The sweep drifted off the ground-watch's line. Bring the nozzle back onto the marked sweep before continuing.",
    },
    {
      id: "vibration-gauge-check", kind: "gauge", target: "vibration-meter",
      title: "Check the hand-arm vibration reading",
      cue: "Read the vibration meter after the sweep and commit only inside the acceptable band.",
      why: "Hand-arm vibration from a running power tool adds up over a shift in a way no single moment makes obvious, and a meter reading is what tells the crew whether this tool and this grip are actually inside what NIOSH's own guidance treats as manageable rather than just quiet to hold.",
      gauge: {
        label: "HAND-ARM VIBRATION", speed: 0.62, green: [0.2, 0.5],
        readout: (t) => `${(t * 9).toFixed(1)} m/s²`,
        missNote: "Outside the acceptable band. Ease the grip and let the reading settle before committing it.",
      },
    },
    {
      id: "bystander-scan", kind: "find", noHint: true,
      targets: ["parked-car-window", "pedestrian-sidewalk", "pet-in-yard"],
      itemNames: { "parked-car-window": "the parked car with its window down", "pedestrian-sidewalk": "the pedestrian on the sidewalk ahead", "pet-in-yard": "the pet loose along the fence line" },
      itemNotes: {
        "parked-car-window": "Debris blown into an open car window is a windshield's worth of grit somebody else has to clean up, or worse, catch in the face while driving off.",
        "pedestrian-sidewalk": "A pedestrian ahead on the sidewalk is exactly who the discharge has to be aimed away from before the sweep ever reaches that stretch.",
        "pet-in-yard": "A loose pet does not know to stay clear of a blower's discharge the way a person might — the sweep is planned around it, not through it.",
      },
      decoyNotes: { "clear-sidewalk": "That stretch of sidewalk is empty with nothing parked or standing on it. Nothing to flag there." },
      title: "Scan ahead before sweeping the next stretch",
      cue: "Three things ahead change where this sweep can go — find them before the blower gets there.",
      why: "A sweep planned only around what is on the ground and not around who or what is nearby is a sweep that eventually blasts someone's open car window, a pedestrian, or a loose pet — scanning ahead is what keeps the discharge aimed at clippings instead of at people or animals who never agreed to be in its path.",
    },
    {
      id: "direct-away-from-drain", kind: "select", target: "storm-drain-marker",
      title: "Keep the discharge off the storm drain",
      cue: "Confirm the storm drain is marked and sweep clippings away from it, not into it.",
      why: "Clippings and debris blown into a storm drain do not stay there — they wash straight into whatever the drain feeds the next time it rains — so the sweep is planned to carry material away from the drain the whole time, not just when someone happens to be watching.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the trimmer and blower log",
      cue: "Log the precheck, the zone posting and the vibration reading before racking the tools.",
      why: "The tool log is what the next crew member and the next inspection both read — a shift run cleanly but never logged leaves nothing behind to prove the precheck, the posted zone and the vibration reading actually happened before the tools went back on the rack.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, GKT_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.2, 0.14, 5.8, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 9, a: "#3f7a3f", b: "#457f45" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xdfeecb },
    );
    const pathMesh = box(g, 1.3, 0.02, 5.6, -0.2, 0.15, 0, 0xffffff, { rough: 0.9, cast: false });
    pathMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => gratingFace(cx, w, h, { base: "#8a8578", base2: "#7c7768" }), { repeat: 4, px: 384 }),
      { rough: 0.9, metal: 0.05, color: 0xc9c3b0 },
    );

    // ------------------------------------------------------------------ hazards found on the walk
    const rock = ball(g, 0.06, 1.0, 0.18, 1.1, 0x6a655c, { rough: 0.85, seg: 10 });
    reg(hits, rock, "buried-rock");
    const sprinklerHead = cyl(g, 0.03, 0.03, 0.08, 0.6, 0.18, 0.8, 0x6f7a6f, { rough: 0.5, metal: 0.3, seg: 10 });
    reg(hits, sprinklerHead, "exposed-sprinkler");
    const bench = parkBench(g, 1.6, 0, -0.9, { ry: -0.4 });
    reg(hits, bench, "bench-too-close");
    const clearTurf = group(g, 0.4, 0.15, 1.4);
    box(clearTurf, 0.4, 0.008, 0.3, 0, 0, 0, 0x3f7a3f, { rough: 0.85, cast: false });
    reg(hits, clearTurf, "clear-turf-patch");

    // ------------------------------------------------------------------ scan-ahead scene
    const parkedCar = group(g, 2.4, 0.14, -1.0, -0.3);
    box(parkedCar, 1.6, 0.5, 0.7, 0, 0.35, 0, 0x3a4a5c, { rough: 0.4, metal: 0.4 });
    box(parkedCar, 0.9, 0.3, 0.66, -0.1, 0.72, 0, 0x2b3542, { rough: 0.3, metal: 0.5, transparent: true, opacity: 0.6 });
    reg(hits, parkedCar, "parked-car-window");
    const pedestrian = standingFigure(g, 2.6, 1.6, { ry: -2.4, cloth: 0x4a5a6a });
    reg(hits, pedestrian, "pedestrian-sidewalk");
    const pet = group(g, -2.3, 0, -1.5, 0.6);
    box(pet, 0.16, 0.12, 0.32, 0, 0.08, 0, 0x8a6a3a, { rough: 0.8 });
    reg(hits, pet, "pet-in-yard");
    const clearSidewalk = group(g, -0.2, 0.15, -2.0);
    box(clearSidewalk, 0.5, 0.008, 0.3, 0, 0, 0, 0x9a9488, { rough: 0.85, cast: false });
    reg(hits, clearSidewalk, "clear-sidewalk");

    const drainMarker = box(g, 0.4, 0.02, 0.4, -0.2, 0.16, -1.6, 0xffffff, { rough: 0.7, cast: false });
    drainMarker.material = texturedMat(
      surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }),
      { rough: 0.7, metal: 0.3, color: 0xb8c0c8 },
    );
    reg(hits, drainMarker, "storm-drain-marker");

    // ------------------------------------------------------------------ the trimmer
    const trimmer = group(g, -1.7, 0.14, 1.4, -1.6);
    const shaft = cyl(trimmer, 0.015, 0.015, 1.2, 0, 0.6, 0.4, GKT_PAL.trim, { rough: 0.4, metal: 0.5, seg: 10 });
    shaft.rotation.x = Math.PI / 2.4;
    const engineHousing = box(trimmer, 0.18, 0.22, 0.24, 0, 0.2, 0.9, GKT_ACCENT, { rough: 0.5, metal: 0.3 });
    const head = cyl(trimmer, 0.08, 0.08, 0.05, 0, 0.05, -0.2, 0x2b2f22, { rough: 0.6, seg: 14 });
    const guard = torus(trimmer, 0.1, 0.014, 0, 0.07, -0.15, 0xf2c14b, { rough: 0.6, seg: 8, seg2: 20 });
    guard.rotation.x = Math.PI / 2;
    reg(hits, guard, "guard-attached");
    reg(hits, head, "string-line-length");
    const handle = group(trimmer, 0, 0.55, 0.55);
    box(handle, 0.28, 0.03, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.5 });
    const triggerBox = box(handle, 0.04, 0.06, 0.03, 0.1, -0.02, 0.02, 0xd2312b, { rough: 0.5 });
    reg(hits, triggerBox, "throttle-interlock");
    holoTag(trimmer, "trimmer", 0, 0.9, 0.9, { css: GKT_CSS, w: 0.26 });

    const primerBulb = ball(engineHousing, 0.03, 0.06, 0, 0.13, 0xd2312b, { rough: 0.5, seg: 10 });
    reg(hits, primerBulb, "primer-bulb");
    const chokeLever = box(engineHousing, 0.03, 0.05, 0.02, -0.08, 0.05, 0.13, 0x2b2f34, { rough: 0.5 });
    reg(hits, chokeLever, "choke-lever");
    const pullCordHandle = ball(engineHousing, 0.025, 0, 0.12, -0.13, 0xf2f2ea, { rough: 0.6, seg: 10 });
    reg(hits, pullCordHandle, "pull-cord");
    const throttleTriggerBox = box(handle, 0.04, 0.06, 0.03, 0.1, -0.02, 0.02, 0xd2312b, { rough: 0.5, transparent: true, opacity: 0.001 });
    reg(hits, throttleTriggerBox, "throttle-trigger");

    // Trigger-lock defeat and reach hazard, distinct from the working controls.
    const lockWedge = box(handle, 0.05, 0.02, 0.02, 0.1, -0.06, 0.02, 0xf2c14b, { rough: 0.6 });
    reg(hits, lockWedge, "trigger-lock-defeat");
    const noGuardMarker = box(trimmer, 0.02, 0.02, 0.02, 0, 0.02, -0.28, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, noGuardMarker, "no-guard-operation");
    const reachZone = box(trimmer, 0.24, 0.16, 0.16, 0, 0.05, -0.18, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, reachZone, "reach-near-spinning-head");

    // ------------------------------------------------------------------ the blower
    const blowerRack = group(g, 2.2, 0, 1.9, -0.4);
    const blower = group(blowerRack, 0, 0.14, 0);
    box(blower, 0.36, 0.5, 0.22, 0, 0.4, 0, 0xd2601c, { rough: 0.5, metal: 0.2 });
    for (const sx of [-0.16, 0.16]) box(blower, 0.03, 0.4, 0.02, sx, 0.55, 0.12, 0x2b2f34, { rough: 0.6 });
    const tube = cyl(blower, 0.03, 0.045, 0.7, 0.3, 0.25, 0.05, 0x2b2f34, { rough: 0.4, metal: 0.4, seg: 10 });
    tube.rotation.z = Math.PI / 2.3;
    const nozzle = cyl(blower, 0.02, 0.03, 0.16, 0.66, 0.1, 0.05, 0x2b2f34, { rough: 0.4, metal: 0.4, seg: 10 });
    nozzle.rotation.z = Math.PI / 2.3;
    reg(hits, nozzle, "blower-toward-bystander");
    reg(hits, blower, "blower-unit");
    const speedDial = cyl(blower, 0.02, 0.02, 0.02, -0.16, 0.55, 0.14, 0xf2c14b, { rough: 0.5, seg: 12 });
    reg(hits, speedDial, "speed-dial");
    const nozzleLever = box(blower, 0.03, 0.03, 0.02, 0.5, 0.14, 0.05, 0x59c97b, { rough: 0.5 });
    reg(hits, nozzleLever, "nozzle-angle-lever");
    holoTag(blower, "backpack blower", 0, 0.78, 0, { css: GKT_CSS, w: 0.34 });

    const stagingSpot = group(g, -0.3, 0, 0.3);
    hits["blower-staging-spot"] = stagingSpot;

    // ------------------------------------------------------------------ fuel + PPE + guarding
    const fuelCan = group(g, -2.3, 0, 2.0, 0.4);
    box(fuelCan, 0.2, 0.32, 0.16, 0, 0.16, 0, 0xd2601c, { rough: 0.6, metal: 0.2 });
    const fuelPlate = decal(fuelCan, 0.16, 0.1, 0, 0.28, 0.081, signFace("MIX PER\nLABEL", { bg: "#2a1a0a", accent: GKT_CSS, scale: 0.3 }), { px: 192 });
    reg(hits, fuelPlate, "fuel-mix-label");

    const ppeRack = group(g, -2.6, 0, 0.4, 0.4);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const shieldProp = box(ppeRack, 0.14, 0.1, 0.02, -0.08, 0.55, 0, 0xbfeaf7, { rough: 0.3, transparent: true, opacity: 0.7 });
    reg(hits, shieldProp, "face-shield");
    const earProp = group(ppeRack, 0.02, 0.55, 0);
    torus(earProp, 0.05, 0.014, 0, 0, 0, 0xf2c14b, { rough: 0.6, seg: 8, seg2: 16 });
    reg(hits, earProp, "ear-protection");
    const gloveProp = box(ppeRack, 0.1, 0.05, 0.02, 0.14, 0.5, 0, 0x8a6a3a, { rough: 0.8 });
    reg(hits, gloveProp, "cut-resistant-gloves");

    reg(hits, cone(g, -2.4, -1.4, { color: GKT_ACCENT }), "cone-a");
    reg(hits, cone(g, 2.5, -2.0, { color: GKT_ACCENT }), "cone-b");
    const zoneBarrier = barrierPanel(g, 0.6, -2.0, { ry: -0.2, w: 1.4, color: GKT_ACCENT });
    zoneBarrier.visible = false;
    reg(hits, zoneBarrier, "zone-barrier");

    const zoneSign = holoPanel(g, 0.5, 0.36, -2.4, 1.4, -0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = GKT_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("BYSTANDER ZONE", w * 0.06, h * 0.24);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Clearance: per the operator's manual", "Keep clear while equipment runs"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.18)));
    }, { ry: 0.8, accent: GKT_ACCENT });
    reg(hits, zoneSign, "bystander-zone-sign");

    const whistle = group(g, -1.5, 0, 2.1, 0.4);
    ball(whistle, 0.03, 0, 0.5, 0, 0xf2c14b, { rough: 0.4, metal: 0.5, seg: 10 });
    reg(hits, whistle, "warning-whistle");

    const chest = toolChest(g, 2.6, 2.2, { ry: -0.5, color: GKT_ACCENT });
    const vibeMeter = instrument(chest, 0.16, 0.79, 0.06, { ry: -0.4, idle: "-- m/s²", color: GKT_ACCENT });
    holoTag(vibeMeter, "vibration meter", 0, 0.16, 0, { css: GKT_CSS, w: 0.34 });
    reg(hits, vibeMeter, "vibration-meter");

    const closingLog = group(g, 2.7, 0, -0.4, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("TOOL LOG\nOPEN", { bg: "#11181f", accent: GKT_CSS, scale: 0.24 }), { px: 320 });
    holoTag(closingLog, "tool log", 0, 1.34, 0, { css: GKT_CSS, w: 0.3 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ crew
    const groundWatch = standingFigure(g, -0.6, -1.9, { ry: 1.4, cloth: 0x2b3138, vest: GKT_ACCENT, helmet: 0xf2f2f2 });
    holoTag(groundWatch, "ground watch", 0, 1.95, 0.15, { css: GKT_CSS, w: 0.3 });
    reg(hits, groundWatch, "ground-watch");

    // Jogger prop, hidden until the zone-breach interrupt fires.
    const jogger = standingFigure(g, -2.9, -1.2, { ry: 1.9, cloth: 0x59c97b });
    jogger.visible = false;

    const dust = particles(blower, 18, 0xb0a488, { size: 0.02, life: 0.6, additive: false, opacity: 0.18 });

    return {
      hits,
      footprint: 2.6,

      onInterrupt(it) {
        if (it.id === "bystander-crosses-zone") { jogger.visible = true; }
        if (it.id === "dust-cloud-toward-watch") { dust.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bystander-crosses-zone") { jogger.visible = false; }
        if (it.id === "dust-cloud-toward-watch") { dust.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "scan-work-zone") {
          rock.material = mat(0x59c97b, { rough: 0.6 });
          sprinklerHead.material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "barricade-zone") { zoneBarrier.visible = true; }
        if (step.id === "bystander-scan") {
          parkedCar.children[1].material = mat(0x59c97b, { rough: 0.4, transparent: true, opacity: 0.6 });
        }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("TOOL LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.24 }));
        }
      },
      onHazard(hitId) { if (hitId === "blower-toward-bystander") { dust.visible = true; } },

      animate(t, dt, session) {
        groundWatch.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        pedestrian.userData.head.rotation.y = Math.sin(t * 0.5 + 1) * 0.2;
        if (jogger.visible) jogger.position.x = -2.9 + (t % 2) * 0.5;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0.2, 0.2, 0), 0.14, 0.14, -0.05);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "vibration-gauge-check") {
          const v = (gg.t * 9).toFixed(1);
          repaint(vibeMeter.userData.screen, signFace(`${v} m/s²`, {
            bg: "#0d1c24", accent: gg.t > 0.2 && gg.t < 0.5 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
