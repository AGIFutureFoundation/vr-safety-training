import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace,
  particles, standingPerson, seatedFigure, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ambulance Scene Safety VR — Emergency Services.
// A night roadside call, worked the way scene safety actually gets taught
// after enough crews have been struck on the shoulder to write it down: the
// ambulance itself as the first barrier, a light pattern that protects
// without blinding the very drivers it is warning, and an approach to an
// agitated occupant made from the side traffic cannot reach. Struck-by is a
// leading cause of on-duty EMS death, and every prop here answers a specific
// piece of that risk rather than decorating the scene around it.

const AMB_ACCENT = 0xf2c14b;

export const SIM_AMBULANCE_SCENE_SAFETY = {
  id: "ambulance-scene-safety",
  index: "202",
  domain: "Emergency Services",
  trade: "EMT — NAGE/AFSCME EMS local",
  category: "Emergency Services",
  weather: "clear",
  certification: "NFPA 1500 for fire and EMS occupational safety, including its requirements for operations at roadway incidents — the apparatus placed as a block, the buffer and the advance taper — and NFPA's automotive ambulance standard for the vehicle itself; ANSI/ISEA 107 high-visibility safety apparel for responders working roadside; OSHA 29 CFR 1910.132 personal protective equipment and 29 CFR 1910.1030 bloodborne pathogens; NREMT certification at the EMT level; NAGE and AFSCME EMS locals as the workforce's unions; the department's own fatigue and duty-hour policy for the fitness-to-drive check at the end of a 24-hour shift.",
  name: "Ambulance Scene Safety",
  title: simTitle("Ambulance Scene Safety"),
  tagline: "A night roadside call: the ambulance as the block, the light pattern, the cone taper, an agitated occupant approached from the protected side, and the fatigue check at the end of a 24-hour shift",
  accent: AMB_ACCENT,
  accentCss: "#f2c14b",
  parSeconds: 300,
  footprint: 2.8,
  badge: { id: "shoulder-safe", name: "Shoulder Safe", note: "A full roadside call worked with the block, the taper and the approach all held, and the crew fit to drive home" },

  game: system({
    name: "Scene Command",
    currency: "BLOCK",
    ranks: ["EMT Basic", "Field Trained", "Scene Safety Certified", "Field Training Officer", "Struck-By Certified"],
    badges: [
      { id: "block-first", name: "Block First", note: "Ambulance positioned as the block before anyone steps out", test: AWARD.stepClean("position-block") },
      { id: "no-shoulder-shortcut", name: "No Shoulder Shortcut", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "steady-scan", name: "Steady Scan", note: "Traffic scan held in band the whole watch", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "fast-scene", name: "Fast Scene", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "wheels-straight": "You left the front wheels pointed straight ahead. Turned away from the crew's working side, a struck ambulance rolls off into the shoulder instead of into the people working behind it — wheels left straight turn the truck itself into the thing that gets pushed toward the crew.",
    "frontal-headlights-on": "You left the headlights burning straight down the lane at oncoming traffic. Bright forward-facing lights at a night scene can blind and disorient a driver, or worse, draw a distracted one straight toward the brightest point — the pattern that actually protects a scene faces away from approaching traffic, not into it.",
    "no-vest-shortcut": "You stepped out onto the shoulder without the high-visibility vest on. At night, on a live shoulder, the vest is what makes a person readable as a person from a driver's seat far enough away to actually react — skipping it for a thirty-second look is exactly the thirty seconds a struck-by happens in.",
    "traffic-side-approach": "You walked up to the car on the traffic side instead of the curb side. The whole reason the ambulance is positioned as a block is so the crew can work from behind it — walking around to the open-lane side puts a body exactly where the block was built to keep it from being.",
  },

  lateNotes: {
    "radio-police-request": "Too early to call for backup — de-escalate first and call it in only once the scene actually turns.",
    "stretcher-lock": "There's no patient loaded yet — nothing to lock down until they're actually on the stretcher.",
    "alertness-test": "Finish logging the call first — the fitness-to-drive check comes right before you get back behind the wheel, not before.",
  },

  steps: [
    {
      id: "scene-size-up", kind: "select", target: "dispatch-board",
      title: "Read the call before you commit to a position",
      cue: "Read the dispatch board: single vehicle, disabled on the shoulder, occupant reported agitated.",
      why: "What you know before the truck stops decides where it stops — a disabled vehicle with an agitated occupant, at night, on an active shoulder, changes the block position and the approach before anybody has even opened a door, and reading it now is faster than re-deciding it once you are already parked wrong.",
    },
    {
      id: "position-block", kind: "turn", target: "steering-wheel",
      title: "Position the ambulance as a block, wheels turned away",
      cue: "Angle the ambulance to block the lane, and turn the front wheels away from where the crew will work.",
      turn: { turns: 0.4, axis: "y", label: "WHEELS TURNED AWAY" },
      why: "Parked at an angle with the wheels turned away, the ambulance itself becomes the first line of protection — a vehicle that gets struck from behind rolls off away from the crew instead of being pushed straight into them, which is the entire reason the block position is taught as a wheel angle and not just a parking spot.",
    },
    {
      id: "light-pattern", kind: "sequence",
      targets: ["hazards-on", "rear-block-lighting", "dim-headlights"],
      itemNames: { "hazards-on": "hazards on", "rear-block-lighting": "rear warning pattern set", "dim-headlights": "headlights dimmed" },
      title: "Set the light pattern that warns without blinding",
      cue: "Hazards on, the rear warning pattern set, then the headlights dimmed toward the crew's side.",
      why: "A light pattern is aimed as carefully as it is turned on — warning lights that face oncoming traffic get a driver's attention, but bright headlights aimed straight down the lane can cause exactly the target-fixation crash the whole setup is meant to prevent, so the forward lights come down once the rear pattern is doing the warning.",
      outOfOrderNote: "Hazards, then the rear pattern, then the headlights dimmed — dimming the headlights before the rear pattern is actually set leaves the scene under-lit at the one moment it most needs to be seen.",
    },
    {
      id: "dress-hivis", kind: "select", target: "hivis-vest",
      title: "Put on the high-visibility vest before you step out",
      cue: "Vest on, before either door of the cab opens.",
      why: "ANSI/ISEA 107 sets the retroreflective area and the background colour a garment needs before it counts as high-visibility apparel, and it exists for exactly this situation — a person on a dark shoulder in a dark jacket is close to invisible to a driver until it is too late to react, so the vest goes on inside the cab, before anyone is standing on the roadway in the dark.",
    },
    {
      id: "cone-taper", kind: "drag", target: "cone-set",
      title: "Set the cone taper",
      cue: "Carry the cones out and set the taper marking the buffer, following the pattern on the board.",
      drag: { to: "cone-line-seat", radius: 0.6, missNote: "Not on the taper line — cones set anywhere else do not shape traffic away from the work area." },
      why: "The taper is what actually moves a driver's lane choice before they reach the scene, not the ambulance's flashing lights on their own — spaced correctly along the shoulder per the pattern the board sets, the cones give an approaching driver room and time to merge over well before the buffer where the crew is working.",
    },
    {
      id: "traffic-watch", kind: "track", target: "traffic-scan-point", seconds: 8,
      title: "Split your attention between the patient and the road",
      cue: "Keep your attention moving between the vehicle and the traffic lane — don't fix on either one.",
      track: {
        start: 0.5, green: [0.3, 0.72], rise: 0.5, fall: 0.4, drift: 0.13, label: "SITUATIONAL SCAN",
        readout: (v) => (v < 0.3 ? "fixed on the vehicle" : v > 0.72 ? "lost the road" : "scanning"),
      },
      why: "Struck-by is a leading cause of on-duty EMS death precisely because a scene this well set up still relies on somebody actually watching the lane — locking onto the patient and never checking the road is how a driver who missed the taper gets all the way to the work area before anybody notices.",
      holdBreakNote: "Your attention locked onto one side or drifted off the road entirely. The whole point of the block and the taper is buying time for a scan that has to actually keep happening.",
    },
    {
      id: "partner-position-brief", kind: "select", target: "partner-brief-board",
      title: "Brief your partner's position before you approach",
      cue: "Set positions: you take the patient side, your partner holds the scene-safety side.",
      why: "A two-person unit only protects each other if both people know which job is whose before anybody moves — one approaching the vehicle, one watching the road and the scene behind you, decided out loud rather than assumed once you are already at the door.",
    },
    {
      id: "approach-agitated-occupant", kind: "hold", target: "vehicle-door-point", seconds: 6,
      title: "Approach from the curb side and pause before the door",
      cue: "Come up on the protected side, stop short of the door, and read the occupant before opening anything.",
      why: "An agitated occupant behind a closed door is an unknown, and the pause before opening it is what lets you actually read the situation — voice, hands, what is visible through the glass — from a position you can still step back from, rather than committing to an open door before you know what is on the other side of it.",
      holdBreakNote: "You opened the door before finishing the read. A few extra seconds here is what tells you whether this is a scared patient or a threat, and it is cheaper spent now than after the door is already open.",
    },
    {
      id: "request-police", kind: "select", target: "radio-police-request",
      title: "Call for police when the scene turns",
      cue: "The occupant's tone has crossed from scared to threatening — call for police backup now.",
      why: "The threshold for calling police is a change in the scene, not a fixed rule you wait to hit — a scene that turns threatening gets a call the moment it turns, because a unit that waits to see if it gets worse has already spent the time it needed to call for help before things escalated further.",
    },
    {
      id: "move-patient-to-ambulance", kind: "drag", target: "patient-figure",
      title: "Move the patient to the ambulance",
      cue: "Walk or carry the patient from the vehicle to the ambulance, on the protected side the whole way.",
      drag: { to: "gurney-seat", radius: 0.6, missNote: "Not on the stretcher — a patient set down anywhere else on the shoulder is still exposed to the lane." },
      why: "The protected path from the car to the ambulance is a straight line behind the block, the same reason the block exists in the first place — cutting a corner toward the open lane to save a few steps puts the one person on scene who cannot watch for traffic themselves back into it.",
    },
    {
      id: "load-lock-stretcher", kind: "turn", target: "stretcher-lock",
      title: "Load the stretcher and confirm the lock",
      cue: "Load the stretcher into the ambulance and turn the floor lock until it engages.",
      turn: { turns: 1, axis: "z", label: "STRETCHER LOCK" },
      why: "A stretcher that is loaded but not locked to the floor mount is still a loose several hundred pounds the moment the ambulance brakes hard, so the lock is confirmed by feel and by the indicator, not assumed because the stretcher slid into place and stopped moving on its own.",
    },
    {
      id: "final-scene-sweep", kind: "find", noHint: true,
      targets: ["dropped-glove", "open-cone-gap", "forgotten-flare"],
      itemNames: { "dropped-glove": "a dropped glove on the shoulder", "open-cone-gap": "a gap opened in the cone taper", "forgotten-flare": "a flare still burning by the car" },
      itemNotes: {
        "dropped-glove": "A used glove on the shoulder — small, but exactly the kind of debris the next unit through here does not need to be surprised by.",
        "open-cone-gap": "One cone has been knocked out of the taper, leaving a gap a driver could read as room to pass closer than the buffer was set for.",
        "forgotten-flare": "A road flare still burning by the disabled car — a fire risk left behind on a scene that is supposed to be cleared, not just vacated.",
      },
      title: "Sweep the scene before you clear it",
      cue: "Walk the shoulder once before departure: nothing left behind that turns into somebody else's hazard.",
      why: "A scene is not actually cleared until it has been walked, because the things worth finding — a dropped glove, a gap in the taper, a flare nobody picked up — are exactly the things easy to miss from inside the cab, and they become the next unit's problem, or the next driver's, the moment this one pulls away.",
    },
    {
      id: "fatigue-selfcheck", kind: "gauge", target: "alertness-test",
      title: "Run the fitness-to-drive check at the end of the shift",
      cue: "Twenty-four hours in, run the reaction check and commit honestly on what it shows.",
      gauge: { label: "REACTION", speed: 0.62, green: [0.35, 0.58], readout: (t) => `${(t * 1.4).toFixed(2)}s`, missNote: "Outside the band this late in a shift is exactly what the check exists to catch — a driver who reads themselves as fine is not the same test as one that actually measures the reaction." },
      why: "Fatigue at the end of a twenty-four-hour shift does not announce itself the way it should, and this department's own fatigue policy exists because feeling capable is not the same thing as testing capable — a real check, honestly read, is what a self-assessment by feel cannot be trusted to catch on hour twenty-three.",
    },
    {
      id: "operational-log", kind: "select", target: "incident-log-board",
      title: "Log the call",
      cue: "Log the scene positioning, the escalation, the police request and the outcome.",
      why: "The next crew that reads this log — on this stretch of road, or on this same address — is working off exactly what got written down here, not off what anybody remembers a week later, so the escalation and the call for police both go on the record in the order they actually happened.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check on your partner before the drive back",
      cue: "Ask your partner how they're doing after that approach, and name the peer-support line before the truck moves.",
      why: "An occupant who turns threatening is exactly the kind of call this department's critical-incident stress protocol is written for, and a partner who froze in the moment carries that differently than the one who kept moving — asking directly, and naming the peer-support line out loud, is what keeps a hard call from riding home unspoken.",
    },
  ],

  interrupts: [
    {
      id: "car-crosses-cone-line",
      kind: "Vehicle crossing the taper",
      after: "traffic-watch", delay: 4, seconds: 12,
      alert: "A passing car has drifted across the cone line instead of merging over at the taper.",
      cue: "Get everybody back behind the block, now.",
      target: "step-back-point",
      why: "A cone taper only works on drivers who are paying attention, and the one who is not is exactly the reason the block position and the buffer distance exist in the first place — the answer the instant a car crosses the line is getting bodies back behind the ambulance, not finishing whatever task was already in hand.",
      missNote: "Everyone stayed where they were while the car passed closer than the buffer was set for. The taper did what it could; the rest of the plan depends on the crew actually moving behind the block the moment it fails, and that did not happen.",
      wrongNote: "Get behind the block — that spot, not the patient or the cones. A car already inside the buffer is not a problem the taper can still solve.",
    },
    {
      id: "partner-freezes",
      kind: "Partner freezes",
      after: "approach-agitated-occupant", delay: 3, seconds: 12,
      alert: "The occupant has started shouting through the glass, and your partner has stopped moving, still several feet back from the door.",
      cue: "Take the lead — calm voice, and a hand on your partner's shoulder to bring them back into it.",
      target: "partner-shoulder-point",
      why: "A partner who freezes at a shouted threat is not failing the call, they are having a completely ordinary human reaction to one — the fix is not a lecture later, it is someone else taking the lead in the moment, in a level voice, with a hand on the shoulder that says 'I've got this' clearly enough that they can move again.",
      missNote: "Your partner stayed frozen at the edge of the exchange for the rest of it. Left alone in that moment, a freeze does not resolve itself — it takes someone else stepping into the lead and physically, calmly, bringing them back into the scene.",
      wrongNote: "It is your partner's shoulder, not the door and not the radio. Somebody has to bring them back into the moment before anything else here moves forward.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, AMB_ACCENT);

    // -------------------------------------------------------------- the road
    const roadTex = surfaceTexture(
      (cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#2c2e31", base2: "#25272a", seam: "rgba(255,255,255,0.06)" }),
      { repeat: 7, px: 512 },
    );
    const roadMesh = box(g, 7.6, 0.02, 5.6, 0, -0.005, 0, 0xffffff, { rough: 0.95, cast: false });
    roadMesh.material = texturedMat(roadTex, { rough: 0.9, metal: 0.02, color: 0x2c2e31 });
    // Shoulder gravel strip and a painted edge line.
    box(g, 7.6, 0.01, 1.1, 0, 0.006, 2.55, 0x4a463c, { rough: 0.95, cast: false });
    box(g, 7.6, 0.006, 0.08, 0, 0.012, 2.0, 0xe8e2c8, { rough: 0.6, cast: false });
    for (let i = 0; i < 6; i++) {
      box(g, 0.5, 0.006, 0.1, -3.2 + i * 1.3, 0.012, -1.3, 0xe8e2c8, { rough: 0.6, cast: false });
    }

    // ---------------------------------------------------------- the ambulance
    const amb = group(g, -1.6, 0, 1.6, -0.35);
    slab(amb, 2.6, 1.35, 1.15, 0, 1.1, 0, 0xf4f6f6, { radius: 0.06, rough: 0.4, metal: 0.2 });
    slab(amb, 1.3, 0.9, 1.1, 1.15, 0.75, 0, 0xe9ecec, { radius: 0.08, rough: 0.35, metal: 0.25 });
    box(amb, 0.6, 0.35, 1.06, 1.85, 1.0, 0, 0x1a2226, { rough: 0.2, opacity: 0.7, transparent: true, cast: false });
    decal(amb, 1.6, 0.4, 0.05, 1.1, 0.576, signFace("EMS 12", { bg: "#f4f6f6", accent: "#d8232a", scale: 0.5 }), { px: 384 });
    for (const [wx, wz] of [[1.75, -0.6], [1.75, 0.6], [-0.55, -0.6], [-0.55, 0.6]]) {
      cyl(amb, 0.26, 0.26, 0.22, wx, 0.26, wz, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
      cyl(amb, 0.14, 0.14, 0.24, wx, 0.26, wz, 0x8b929a, { rough: 0.35, metal: 0.7, seg: 10 }).rotation.x = Math.PI / 2;
    }
    // Rear doors, hinged open toward the road for the loading step.
    const rearDoors = group(amb, -1.3, 0, 0, 0);
    const doorL = box(rearDoors, 0.04, 1.3, 0.55, 0, 1.1, -0.28, 0xf4f6f6, { rough: 0.4, metal: 0.2 });
    const doorR = box(rearDoors, 0.04, 1.3, 0.55, 0, 1.1, 0.28, 0xf4f6f6, { rough: 0.4, metal: 0.2 });

    // Light bar and the rear warning pattern.
    const lightBar = group(amb, 0.4, 1.82, 0);
    box(lightBar, 1.6, 0.16, 0.5, 0, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.3 });
    const barLightL = ball(lightBar, 0.06, -0.5, 0, 0.16, 0xd8232a, { emissive: 0xd8232a, ei: 1.6 });
    const barLightR = ball(lightBar, 0.06, 0.5, 0, 0.16, 0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.6 });
    const rearBar = group(amb, -1.28, 1.6, 0);
    const rearL = box(rearBar, 0.05, 0.14, 0.22, 0, 0, -0.18, 0xd8232a, { emissive: 0xd8232a, ei: 0.5, rough: 0.4 });
    const rearR = box(rearBar, 0.05, 0.14, 0.22, 0, 0, 0.18, 0x4fd1ff, { emissive: 0x4fd1ff, ei: 0.5, rough: 0.4 });
    reg(hits, rearBar, "rear-block-lighting");
    const headlights = group(amb, 1.9, 0.66, 0);
    const headL = ball(headlights, 0.06, 0, 0, -0.4, 0xfff6dc, { emissive: 0xfff6dc, ei: 1.8 });
    const headR = ball(headlights, 0.06, 0, 0, 0.4, 0xfff6dc, { emissive: 0xfff6dc, ei: 1.8 });
    reg(hits, headlights, "dim-headlights");
    // Leaving the headlights blazing at oncoming traffic — its own decoy.
    const frontalDecoy = group(amb, 2.05, 0.66, 0);
    ball(frontalDecoy, 0.016, 0, 0, 0, 0xe0524a, { emissive: 0xe0524a, ei: 1.0 });
    holoTag(amb, "Leave the beams up?", 2.05, 0.86, 0, { css: "#e0524a", w: 0.36 });
    reg(hits, frontalDecoy, "frontal-headlights-on");
    const hazardSwitch = group(amb, 1.5, 0.9, 0.5);
    box(hazardSwitch, 0.05, 0.03, 0.03, 0, 0, 0, 0xf2c14b, { rough: 0.4, emissive: 0x8a5a10, ei: 0.3 });
    reg(hits, hazardSwitch, "hazards-on");

    // Steering wheel, turned as the block position control.
    const wheelGroup = group(amb, 1.55, 0.85, -0.32);
    const steeringWheel = torus(wheelGroup, 0.14, 0.02, 0, 0, 0, 0x2b3138, { rough: 0.5, seg: 20 });
    reg(hits, wheelGroup, "steering-wheel");
    // Leaving the wheels straight — the decoy beside the control itself.
    const wheelsStraightDecoy = group(amb, 1.75, 0.26, 0.6);
    ball(wheelsStraightDecoy, 0.02, 0, 0, 0, 0xe0524a, { emissive: 0xe0524a, ei: 1.0 });
    holoTag(amb, "Leave the wheels straight?", 1.75, 0.5, 0.75, { css: "#e0524a", w: 0.48 });
    reg(hits, wheelsStraightDecoy, "wheels-straight");

    // The high-vis vest, hung in the cab.
    const vestHook = group(amb, 1.7, 1.05, 0.5);
    box(vestHook, 0.28, 0.36, 0.05, 0, 0, 0, CITY.hiVis, { rough: 0.65, emissive: CITY.hiVis, ei: 0.2 });
    holoTag(vestHook, "High-vis vest", 0, 0.24, 0, { css: "#f2c14b", w: 0.34 });
    reg(hits, vestHook, "hivis-vest");
    // Stepping out without it — the door handle, right beside the vest.
    const noVestDecoy = group(amb, 1.9, 0.85, 0.5);
    ball(noVestDecoy, 0.016, 0, 0, 0, 0xe0524a, { emissive: 0xe0524a, ei: 1.0 });
    holoTag(amb, "Step out without it?", 1.9, 1.0, 0.62, { css: "#e0524a", w: 0.44 });
    reg(hits, noVestDecoy, "no-vest-shortcut");

    // ------------------------------------------------------ disabled vehicle
    const car = group(g, 1.7, 0, 1.7, 0.15);
    const carBody = slab(car, 2.1, 0.5, 1.1, 0, 0.55, 0, 0x3a4a5c, { radius: 0.1, rough: 0.4, metal: 0.35 });
    slab(car, 1.5, 0.36, 1.0, -0.05, 0.86, 0, 0x3a4a5c, { radius: 0.1, rough: 0.4, metal: 0.35 });
    box(car, 1.3, 0.3, 0.96, -0.05, 0.9, 0, 0x1a2226, { rough: 0.2, opacity: 0.5, transparent: true, cast: false });
    for (const [sx, sz] of [[0.85, -0.5], [0.85, 0.5], [-0.85, -0.5], [-0.85, 0.5]]) {
      cyl(car, 0.22, 0.22, 0.18, sx, 0.22, sz, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
    }
    const carDoor = group(car, 0.15, 0, -0.55, 0.5);
    box(carDoor, 0.9, 0.42, 0.04, -0.4, 0.7, 0, 0x3a4a5c, { rough: 0.4, metal: 0.35 });
    const doorPoint = group(carDoor, -0.75, 0.7, 0.06);
    ball(doorPoint, 0.02, 0, 0, 0, AMB_ACCENT, { emissive: AMB_ACCENT, ei: 1.1 });
    reg(hits, doorPoint, "vehicle-door-point");
    // The traffic-side approach temptation, on the open-lane side of the car.
    const trafficSideDecoy = group(car, 0.15, 0, 0.6);
    ball(trafficSideDecoy, 0.02, 0.7, 0, 0, 0xe0524a, { emissive: 0xe0524a, ei: 1.0 });
    holoTag(car, "Approach from here?", 0.15, 1.0, 0.75, { css: "#e0524a", w: 0.4 });
    reg(hits, trafficSideDecoy, "traffic-side-approach");

    const occupant = standingPerson(car, 0.05, -0.45, { ry: 1.6, cloth: 0x4a3a3a, hiVis: false, skin: 0xc79a72 });

    // ------------------------------------------------------------- cone taper
    const coneStack = group(g, -0.9, 0, 2.5);
    for (let i = 0; i < 3; i++) cone(coneStack, i * 0.24, 0, {});
    holoTag(coneStack, "Cone taper", 0, 0.5, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, coneStack, "cone-set");
    const coneLineSeat = group(g, 0.4, 0, 2.3);
    ball(coneLineSeat, 0.006, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["cone-line-seat"] = coneLineSeat;
    const placedCones = [];
    for (let i = 0; i < 4; i++) {
      const c = cone(g, -0.4 + i * 0.6, 2.35 - i * 0.08, {});
      c.visible = false;
      placedCones.push(c);
    }
    // The gap and the dropped items the final sweep finds.
    const gapMarker = group(g, 0.8, 0, 2.1);
    ball(gapMarker, 0.02, 0, 0.1, 0, AMB_ACCENT, { emissive: AMB_ACCENT, ei: 1.0 });
    holoTag(gapMarker, "Gap in the taper", 0, 0.2, 0, { css: "#f2c14b", w: 0.38 });
    reg(hits, gapMarker, "open-cone-gap");
    const droppedGlove = box(g, 0.1, 0.01, 0.08, -2.5, 0.008, 1.9, 0xdfe4e8, { rough: 0.7, cast: false });
    holoTag(g, "Dropped glove", -2.5, 0.1, 2.0, { css: "#f2c14b", w: 0.28 });
    reg(hits, droppedGlove, "dropped-glove");
    const flare = group(g, 2.6, 0, 2.6);
    cyl(flare, 0.02, 0.02, 0.2, 0, 0.1, 0, 0xd8232a, { rough: 0.5, seg: 10 });
    const flareFire = particles(flare, 12, 0xff8a3d, { size: 0.03, life: 0.4, additive: true, opacity: 0.8 });
    flareFire.position.set(0, 0.22, 0);
    holoTag(flare, "Flare still burning", 0, 0.32, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, flare, "forgotten-flare");

    // -------------------------------------------------------------- barrier
    barrierPanel(g, -2.4, 3.0, { ry: 0.3, w: 1.2, color: AMB_ACCENT });
    const stepBackPoint = group(g, -1.6, 0, 2.5);
    ball(stepBackPoint, 0.02, 0, 1.0, 0, AMB_ACCENT, { emissive: AMB_ACCENT, ei: 1.1 });
    holoTag(stepBackPoint, "Behind the block", 0, 1.2, 0, { css: "#f2c14b", w: 0.34 });
    reg(hits, stepBackPoint, "step-back-point");
    const trafficScan = instrument(g, 0.4, 1.1, 2.9, { ry: -0.3, idle: "SCAN", color: AMB_ACCENT, w: 0.16, d: 0.22 });
    reg(hits, trafficScan, "traffic-scan-point");

    // ------------------------------------------------------------------ crew
    function crew(x, z, ry, o) {
      const p = standingPerson(g, x, z, { ry, ...o });
      p.root.userData.crew = true;
      return p;
    }
    const partner = crew(0.8, 1.15, -1.7, { cloth: 0x2f5a45, hiVis: true, vis: 0xf2c14b, skin: 0xb98868 });
    holoTag(partner.root, "Partner", 0, 1.85, 0, { css: "#f2c14b", w: 0.28 });
    const partnerShoulderPoint = group(partner.root, 0.2, 1.35, 0);
    ball(partnerShoulderPoint, 0.014, 0, 0, 0, AMB_ACCENT, { emissive: AMB_ACCENT, ei: 1.1 });
    reg(hits, partnerShoulderPoint, "partner-shoulder-point");

    const briefBoard = decal(g, 0.3, 0.16, 0.6, 0.9, 2.9, signFace("PARTNER POSITIONS", { bg: "#241a10", accent: "#f2c14b", scale: 0.34 }), { px: 200 });
    holoTag(g, "Brief the split", 0.6, 1.04, 2.9, { css: "#f2c14b", w: 0.36 });
    reg(hits, briefBoard, "partner-brief-board");

    const radio = group(g, -0.5, 0, 2.9, 0.3);
    box(radio, 0.09, 0.15, 0.05, 0, 1.05, 0, 0x2b3138, { rough: 0.5 });
    cyl(radio, 0.006, 0.006, 0.1, 0, 1.19, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
    holoTag(radio, "Radio — request police", 0, 1.28, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, radio, "radio-police-request");

    // -------------------------------------------------------------- patient
    const patientFig = standingFigure(g, 0.4, 0.05, { ry: 2.2, cloth: 0x5a5248, skin: 0xc79a72 });
    holoTag(g, "Patient", 0.2, 1.9, 0.65, { css: "#f2c14b", w: 0.26 });
    reg(hits, patientFig, "patient-figure");
    const gurneySeat = group(g, -0.6, 0, 1.65);
    ball(gurneySeat, 0.006, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["gurney-seat"] = gurneySeat;

    // Stretcher, staged at the rear doors.
    const stretcher = group(g, -0.55, 0, 1.75, -0.35);
    box(stretcher, 0.55, 0.05, 1.7, 0, 0.55, 0, 0xdfe4e8, { rough: 0.6 });
    for (const sx of [-1, 1]) box(stretcher, 0.05, 0.05, 1.7, sx * 0.27, 0.58, 0, 0x8b929a, { rough: 0.5, metal: 0.6 });
    for (const sz of [-1, 1]) for (const sw of [-1, 1]) {
      cyl(stretcher, 0.02, 0.02, 0.5, sw * 0.22, 0.28, sz * 0.75, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
      cyl(stretcher, 0.06, 0.06, 0.03, sw * 0.22, 0.03, sz * 0.75, 0x1b1e22, { rough: 0.6, seg: 12 });
    }
    const lockLever = group(stretcher, 0, 0.5, -0.85);
    cyl(lockLever, 0.014, 0.014, 0.12, 0, 0, 0, 0xd8232a, { rough: 0.4, metal: 0.4, seg: 10 });
    reg(hits, lockLever, "stretcher-lock");

    // Alertness / fitness-to-drive check, and the log/checkin boards, near the cab.
    const alertnessDevice = instrument(g, 2.1, 0.98, 3.0, { ry: -0.5, idle: "--.--s", color: AMB_ACCENT });
    holoTag(alertnessDevice, "Fitness-to-drive check", 0, 0.2, 0, { css: "#f2c14b", w: 0.44 });
    reg(hits, alertnessDevice, "alertness-test");

    const logBoard = holoPanel(g, 0.56, 0.4, -2.9, 1.7, 2.9, (cx, w, h) => {
      cx.fillStyle = "rgba(24,18,8,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fdeecb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("INCIDENT LOG", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillStyle = "#e0cda0";
      cx.fillText("Positioning · escalation · police call", w / 2, h * 0.6);
      cx.fillText("Filed before the shift ends", w / 2, h * 0.78);
    }, { ry: 0.5, accent: AMB_ACCENT });
    reg(hits, logBoard, "incident-log-board");

    const checkinBoard = holoPanel(g, 0.5, 0.34, 2.9, 1.7, 3.3, (cx, w, h) => {
      cx.fillStyle = "rgba(24,18,8,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fdeecb";
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.36);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillStyle = "#e0cda0";
      cx.fillText("How's your partner · peer-support line named", w / 2, h * 0.68);
    }, { ry: -0.4, accent: AMB_ACCENT });
    reg(hits, checkinBoard, "crew-checkin-board");

    const dispatchBoard = holoPanel(g, 0.6, 0.42, -0.4, 1.7, 3.4, (cx, w, h) => {
      cx.fillStyle = "rgba(24,18,8,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fdeecb";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("DISPATCH · SINGLE VEHICLE", w * 0.06, h * 0.16);
      cx.fillStyle = "#fff4d8";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("DISABLED — OCCUPANT AGITATED", w * 0.06, h * 0.36);
      cx.fillStyle = "#e0cda0";
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Night, active shoulder", "Hour 23 of a 24-hour shift"].forEach((t, i) => cx.fillText(t, w * 0.06, h * 0.56 + i * h * 0.12));
    }, { ry: 0.2 });
    reg(hits, dispatchBoard, "dispatch-board");

    // A little ambient traffic: two cars that drift past on the far lane.
    const passers = [];
    for (let i = 0; i < 2; i++) {
      const pc = group(g, -4.5 - i * 3, 0, -2.4);
      box(pc, 1.7, 0.4, 0.85, 0, 0.4, 0, [0x2f4a5c, 0x5c3a2f][i], { rough: 0.4, metal: 0.35 });
      ball(pc, 0.03, 0.75, 0.32, 0.3, 0xfff6dc, { emissive: 0xfff6dc, ei: 1.5 });
      ball(pc, 0.03, 0.75, 0.32, -0.3, 0xfff6dc, { emissive: 0xfff6dc, ei: 1.5 });
      passers.push(pc);
    }

    // Ambient night lighting: a low, cool wash rather than daylight, with the
    // ambulance's own light bar doing most of the illuminating.
    const key = new THREE.DirectionalLight(0x9db4d0, 0.25);
    key.position.set(3, 6, -2);
    g.add(key);
    g.add(new THREE.HemisphereLight(0x384a5a, 0x1a1a1a, 0.35));

    let barPhase = 0;

    return {
      hits,
      footprint: 2.8,
      spawnLook: new THREE.Vector3(0.6, 1.1, 1.6),

      onStepComplete(step) {
        if (step.id === "position-block") { wheelGroup.rotation.y = -0.5; }
        if (step.id === "light-pattern") { headL.visible = false; headR.visible = false; }
        if (step.id === "cone-taper") { for (const c of placedCones) c.visible = true; }
        if (step.id === "move-patient-to-ambulance") { patientFig.position.set(-0.6, 0, 1.65); }
        if (step.id === "load-lock-stretcher") { lockLever.rotation.z = Math.PI / 2; stretcher.position.set(-1.3, 0, 1.75); }
        if (step.id === "operational-log") repaint(logBoard.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(24,18,8,0.9)"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
          cx.fillStyle = "#eafbf1";
          cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle";
          cx.fillText("LOGGED", w / 2, h * 0.4);
        });
      },

      onInterrupt(it) {
        if (it.id === "car-crosses-cone-line") {
          for (const pc of passers) pc.position.z += 1.6;
          stepBackPoint.children[0].material = mat(0xffb020, { emissive: 0xffb020, ei: 1.8 });
        }
        if (it.id === "partner-freezes") {
          partner.arms[0].shoulder.rotation.x = -0.1;
          partner.torso.rotation.x = 0.05;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "car-crosses-cone-line") {
          for (const pc of passers) pc.position.z -= 1.6;
          stepBackPoint.children[0].material = mat(AMB_ACCENT, { emissive: AMB_ACCENT, ei: 1.1 });
        }
        if (it.id === "partner-freezes") {
          partner.arms[0].shoulder.rotation.x = 0;
          partner.torso.rotation.x = 0;
        }
      },

      animate(t, dt, session) {
        barPhase += dt * 6;
        const on = Math.sin(barPhase) > 0;
        barLightL.material.emissiveIntensity = on ? 2.4 : 0.3;
        barLightR.material.emissiveIntensity = on ? 0.3 : 2.4;
        rearL.material.emissiveIntensity = on ? 1.4 : 0.2;
        rearR.material.emissiveIntensity = on ? 0.2 : 1.4;
        for (const pc of passers) { pc.position.x += dt * 0.6; if (pc.position.x > 5) pc.position.x = -8; }
        const tr = session?.track;
        if (session?.step?.id === "traffic-watch") {
          const inBand = tr ? tr.v >= 0.3 && tr.v <= 0.72 : true;
          trafficScan.userData?.screen && repaint(trafficScan.userData.screen, signFace(inBand ? "SCANNING" : "FIXED", {
            bg: "#0d1c24", accent: inBand ? "#59c97b" : "#e0524a", fg: "#bfeaf7", scale: 0.4,
          }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "fatigue-selfcheck") {
          repaint(alertnessDevice.userData.screen, signFace(`${(gg.t * 1.4).toFixed(2)}s`, {
            bg: "#0d1c24", accent: gg.t >= 0.35 && gg.t <= 0.58 ? "#59c97b" : "#e0524a", fg: "#bfeaf7", scale: 0.5,
          }));
        }
        void doorL; void doorR; void carBody; void occupant; void steeringWheel; void hazardSwitch;
      },
    };
  },
};
