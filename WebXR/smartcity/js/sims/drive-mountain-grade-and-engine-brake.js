import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, mat, gradientFill, noiseTexture } from "../../../shared/kit.js";
import { tractorTrailer, flArticulate, sedan } from "../../../shared/fleet.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument,
  surfaceTexture, texturedMat, mudflatFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Mountain Grade and Engine Brake VR — Mobility & Transit, the
// third deep driving station in the Job Readiness Edition. A loaded
// tractor-trailer over a crest and down a long grade the way the handbook's
// mountain-driving section teaches it: brakes checked at the pull-out before
// the top, the low gear chosen before the crest and not on the way down, the
// engine brake doing the work, snub braking instead of riding the pedal, the
// escape ramp noted, a brake-fade warning answered, and the hubs and the
// inspection report dealt with at the bottom.
//
// The grade is drawn at half scale and flat on the plaza, with the mountain
// and the signs telling the story; the HUD band is the trainee's hold, and
// every speed in the text is "per the posted limit" or the grade sign's own
// advisory. The one figure quoted — release the brakes about five below your
// safe speed — is the state CDL handbook's own, attributed to it. Sited
// generically: no real pass, highway or carrier.

const DRM_ACCENT = 0xe0a14a;
const DRM_CSS = "#e0a14a";
const DRM_SCALE = 0.5;

export const SIM_DRIVE_MOUNTAIN_GRADE_AND_ENGINE_BRAKE = {
  id: "drive-mountain-grade-and-engine-brake",
  index: "320",
  domain: "Commercial Driving",
  trade: "Class A driver trainee, Job Readiness Edition deep driving — Teamsters linehaul in the mountains: grades, the engine brake and brake fade under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
  category: "Mobility & Transit",
  district: "Mobility & Transit",
  weather: "wind",
  certification: "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose Class A curriculum includes speed management and hazardous conditions such as mountain grades; 49 CFR 383 for the skills test's road portion; 49 CFR 392 for driving a commercial motor vehicle in hazardous conditions; 49 CFR 393 for brakes, including the adjustment a long grade depends on; 49 CFR 396 for writing a brake defect in the driver vehicle inspection report; 49 CFR 395 for the duty status at the bottom; the state CDL handbook's mountain driving and snub braking guidance; CVSA brake out-of-service criteria; Teamsters (IBT) freight locals' driver training",
  name: "Mountain Grade and Engine Brake",
  title: simTitle("Mountain Grade and Engine Brake"),
  tagline: "Over the crest and down the long grade: brakes checked at the top, the low gear picked before the crest, the engine brake doing the work, snub braking not riding, the escape ramp noted and a fading brake answered",
  accent: DRM_ACCENT,
  accentCss: DRM_CSS,
  parSeconds: 300,
  footprint: 2.6,
  apron: false,
  badge: { id: "low-gear-first", name: "Low Gear First", note: "The gear chosen before the crest, the speed held on the engine, snub braking in band and the fade answered — first time" },

  game: system({
    name: "Grade",
    currency: "PERCENT",
    ranks: ["Permit Holder", "Grade Trainee", "Mountain Driver", "Pass Lead", "Grade Certified"],
    badges: [
      { id: "engine-does-it", name: "The Engine Does It", note: "Crest and descent driven with every check on time", test: AWARD.all(AWARD.stepClean("drm-crest"), AWARD.stepClean("drm-descent")) },
      { id: "cool-brakes", name: "Cool Brakes", note: "Never started down in the climbing gear, rode the brakes, coasted or reached for the phone", test: AWARD.safe },
      { id: "snub-not-ride", name: "Snub, Not Ride", note: "Every drive and the snub braking in band with no excursion", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-grade", name: "Clean Grade", note: "No corrections anywhere", test: AWARD.clean },
      { id: "right-gear", name: "Right Gear", note: "Gear choice and drives near the centre of their bands", test: AWARD.precise(0.8) },
      { id: "on-time", name: "On Time", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "drm-climbing-gear": "You went to start down the grade in the gear you climbed in. On a long downgrade a rig in too high a gear picks up speed the engine cannot hold, and the driver ends up using the service brakes to do the engine's job. The handbook's rule is to choose the low gear before the crest — often lower than the gear you climbed in — because shifting down once you are running away may not be possible.",
    "drm-ride-brakes": "You went to ride the brakes with light, steady pressure all the way down. That is how brakes overheat and fade: the drums and linings get hotter the longer they are held on, and a faded brake does almost nothing when you finally need it. Let the engine hold the speed and use firm snub applications instead.",
    "drm-coast-neutral": "You went to coast down the grade in neutral. Out of gear, the engine brake does nothing and the service brakes have to take the whole load; getting back into gear at speed may be impossible. Coasting a commercial vehicle downhill is prohibited and it is how runaways begin.",
    "drm-phone": "You went to pick up the hand-held phone on the grade. 49 CFR 392 prohibits hand-held mobile phone use and texting while driving a commercial vehicle, and a long downgrade is where your eyes belong on the speed, the mirrors and the brake-temperature signs of your own trailer.",
  },

  lateNotes: {
    "drm-retarder-dial": "The engine brake goes back to its low setting at the bottom, on the flat — not while you are still on the grade.",
    "drm-hub": "The hubs are checked at the pull-out at the bottom, once the rig is stopped.",
    "drm-dvir": "The brake fade goes in the report at the bottom, after the hubs are checked, so it records what you found.",
  },

  steps: [
    {
      id: "drm-sign", kind: "select", target: "drm-grade-sign",
      title: "Read the grade warning",
      cue: "Read the sign before the crest: how steep, how long, the truck advisory and the escape ramp.",
      why: "A grade is driven with the numbers on its sign, read before the crest: how steep it is, how far it runs, the speed trucks are advised to hold and where the escape ramp is. Those decide the gear you pick and the speed you commit to, and the one thing a driver cannot do on a long downgrade is change their mind about either halfway down with hot brakes.",
    },
    {
      id: "drm-pullout", kind: "sequence",
      targets: ["drm-air-gauge", "drm-engine-brake", "drm-mirror-set"],
      itemNames: { "drm-air-gauge": "air pressure up and holding", "drm-engine-brake": "engine brake switched on", "drm-mirror-set": "mirrors show both trailer tandems" },
      title: "Brake check at the pull-out",
      cue: "At the pull-out before the top: air pressure up and holding, engine brake on, mirrors showing both tandems.",
      why: "The pull-out before a long grade is where the brakes are checked, while it is still easy to stop: the air pressure built and holding, the engine brake switched on so it is ready the moment you lift off the throttle, and the mirrors set to show the trailer tandems, because smoke from a hot brake shows there before you smell it.",
      outOfOrderNote: "Air first — the brakes have to be ready before anything else — then the engine brake, then the mirrors.",
    },
    {
      id: "drm-crest", kind: "drive", target: "drm-rig",
      title: "Low gear before the crest",
      cue: "Down to the low gear before the crest, then over the top slowly with a look in both mirrors.",
      why: "The gear for the descent is chosen at the top, while the rig is still slow enough to shift easily. Over the crest the grade takes hold at once, and a driver who is still hunting for a lower gear has already started to run away. Cresting slowly in the low gear with the engine brake on means the rig settles into the grade at a speed the engine can hold.",
      holdBreakNote: "Out of the lane or out of the band at the crest. Slow before the top, not after it.",
      drive: {
        path: [[-5.6, -3.2], [-5.0, -4.8], [-3.8, -6.2], [-2.0, -7.0], [0, -7.2]],
        speedBand: [10, 25], laneWidth: 1.5, graceSeconds: 1.8, checkWindow: 1.8, sceneRate: 0.14,
        bandLabel: "slow over the crest",
        checks: [
          { at: 0, kind: "gear-down", note: "The low gear goes in before the crest — often lower than the gear you climbed in." },
          { at: 2, kind: "mirror-left", note: "Left mirror as the grade takes hold: the traffic behind is about to find you slow." },
          { at: 4, kind: "mirror-right", note: "Right mirror: the trailer tandem, and any smoke from it." },
        ],
        controls: { brake: "drm-brake-pedal" },
        laneNote: "You left the lane at the crest — on a mountain road that is the drop or the rock face.",
      },
    },
    {
      id: "drm-gear-choice", kind: "gauge", target: "drm-gear-gauge",
      title: "Confirm the gear holds the speed",
      cue: "Watch the tachometer as the grade takes hold, and commit when the engine is holding the speed on its own.",
      why: "The right gear is the one in which the engine, with the engine brake on, holds the rig at a safe speed with only occasional help from the service brakes. Too high a gear and the speed creeps up until the brakes are working constantly; too low and the engine is screaming. Reading it early in the grade is what makes the rest of the descent calm.",
      gauge: { label: "TACHOMETER", speed: 0.7, green: [0.5, 0.72], readout: (t) => (t < 0.5 ? "gear too high" : t > 0.72 ? "over-revving" : "engine holding"), missNote: "That gear is not holding the rig — pull over where you can and choose again rather than hand the job to the brakes." },
    },
    {
      id: "drm-descent", kind: "drive", target: "drm-rig",
      title: "Down the grade on the engine",
      cue: "Hold the safe speed on the engine brake, check both mirrors for smoke and followers, and stay in your lane through the bends.",
      why: "Down the grade the engine brake carries the load and the service brakes are for the moments it cannot. Holding a steady safe speed, checking both mirrors for brake smoke and for traffic stacking up behind, and keeping the rig in its lane through the bends is the whole skill — a descent that feels boring is a descent done right.",
      holdBreakNote: "Out of lane or band on the grade — ease the speed back on the engine and snub the brakes, don't ride them.",
      drive: {
        path: [[0, -7.2], [2, -7.0], [3.8, -6.2], [5.0, -5.0], [5.6, -3.4], [5.8, -1.8]],
        speedBand: [18, 32], laneWidth: 1.5, graceSeconds: 1.8, checkWindow: 1.6, sceneRate: 0.14,
        bandLabel: "safe speed for the grade, per the sign",
        checks: [
          { at: 1, kind: "mirror-right", note: "Right mirror: the tandem and the brake drums — smoke means the brakes are doing too much." },
          { at: 2, kind: "mirror-left", note: "Left mirror: faster traffic stacking up behind wants to pass on the grade." },
          { at: 4, kind: "mirror-right", note: "Right mirror again through the bend: the trailer is tracking inside the curve." },
        ],
        controls: { brake: "drm-brake-pedal", "gear-down": "drm-engine-brake" },
      },
    },
    {
      id: "drm-snub", kind: "track", target: "drm-service-brake", seconds: 6,
      title: "Snub the brakes, don't ride them",
      cue: "When the speed reaches your safe speed, brake firmly until it is about five below, then release. Keep it in band.",
      why: "The state CDL handbook's snub braking is firm, short applications: once the rig reaches its safe speed, brake hard enough to feel a definite slowdown until it is about five mph below that speed, then release and let it build again. Firm and short gives the drums time to cool between applications; light and constant cooks them.",
      track: { start: 0.3, green: [0.36, 0.6], rise: 0.52, fall: 0.46, drift: 0.14, label: "SPEED", readout: (v) => (v < 0.36 ? "well under — release" : v > 0.6 ? "over safe speed — snub" : "in the snub band") },
      holdBreakNote: "The speed left the snub band — brake firmly when it reaches safe speed, release five below.",
    },
    {
      id: "drm-scan", kind: "find", noHint: true,
      targets: ["drm-smoking-truck", "drm-escape-ramp", "drm-rockfall"],
      itemNames: { "drm-smoking-truck": "the truck on the shoulder with smoking brakes", "drm-escape-ramp": "the escape ramp entrance", "drm-rockfall": "fallen rock at the lane edge" },
      itemNotes: {
        "drm-smoking-truck": "A rig stopped on the shoulder with smoke pouring from its trailer brakes — what riding the brakes looks like. Give it room; its driver may be out on the road.",
        "drm-escape-ramp": "The escape ramp's entrance, a deep gravel bed off to the right. Know where it is before you need it; if your brakes go, it is the plan.",
        "drm-rockfall": "Fallen rock at the lane edge under the cut. Straddling it or swerving round it at speed on a grade both go badly — slow early.",
      },
      title: "Scan the grade ahead",
      cue: "Look ahead down the grade and on the shoulders. Find what changes your plan.",
      why: "A mountain grade tells you what is coming if you look far enough down it: a truck already in trouble on the shoulder, the escape ramp you might need, rock that has come down from the cut. Spotting them early is what lets you slow on the engine instead of on the brakes, and knowing where the escape ramp is turns a brake failure from a crash into a plan.",
    },
    {
      id: "drm-bottom", kind: "drive", target: "drm-rig",
      title: "The curve at the bottom",
      cue: "Watch the right mirror past the escape ramp, check left through the curve, and go up a gear once the rig is on the flat.",
      why: "The bottom of a grade is where drivers relax too soon: the curve there is often the sharpest, the escape ramp's entrance is still beside you, and the brakes are at their hottest. Checking the right mirror past the ramp, the left through the curve, and only going back up through the gears once the road flattens keeps the descent's discipline all the way to the end.",
      holdBreakNote: "Out of lane or band in the curve at the bottom — the grade is not over until the road is flat.",
      drive: {
        path: [[5.8, -1.8], [5.9, 0], [5.4, 1.8], [4.2, 3.2], [2.6, 4.0]],
        speedBand: [12, 26], laneWidth: 1.5, graceSeconds: 1.8, checkWindow: 1.5, sceneRate: 0.14,
        bandLabel: "curve at the bottom, per the posted limit",
        checks: [
          { at: 1, kind: "mirror-right", note: "Right mirror as the escape ramp slides past: the tandems are still smoke-free." },
          { at: 3, kind: "mirror-left", note: "Left mirror through the curve: the trailer swings, and the lane beside you matters." },
          { at: 4, kind: "gear-up", note: "Up a gear only now, with the rig on the flat." },
        ],
        controls: { brake: "drm-brake-pedal" },
      },
    },
    {
      id: "drm-hub-check", kind: "hold", target: "drm-hub", seconds: 3,
      title: "Feel the hubs at the pull-out",
      cue: "At the pull-out, hold your hand near — not on — each wheel hub to feel for one much hotter than the rest.",
      why: "A hub far hotter than its neighbours after a grade points to a brake that was dragging or doing more than its share — out of adjustment, or starting to fail. Checking by holding a hand near it, never on it, is how a driver finds that at the bottom instead of discovering it on the next grade, and it is exactly what the inspection report needs to record.",
      holdBreakNote: "You pulled away before you had felt each hub — take the time; a hot one is the finding that matters.",
    },
    {
      id: "drm-retarder", kind: "turn", target: "drm-retarder-dial",
      title: "Engine brake back to low for the flat",
      cue: "Turn the engine-brake selector back to its low setting for the flat road ahead.",
      why: "The engine brake's high setting that was right on the grade is wrong on the flat, and on a slick road a high setting can lock the drive wheels and start a skid. Turning it back down at the bottom matches the retarder to the road you are on now, the same way you chose it for the grade at the top.",
      turn: { turns: 0.5, axis: "z", label: "ENGINE BRAKE" },
    },
    {
      id: "drm-report", kind: "select", target: "drm-dvir",
      title: "Write the fade in the inspection report",
      cue: "Record the brake-fade warning and the hot hub in the driver vehicle inspection report.",
      why: "A brake that faded on the grade and a hub that ran hot are defects, and 49 CFR 396 has the driver report defects so they are repaired before the vehicle runs again. Writing them down today is what stops tomorrow's driver taking the same rig down the same grade with a brake nobody knew was weak.",
    },
    {
      id: "drm-debrief", kind: "select", target: "drm-crew-checkin",
      title: "Talk the grade through with the trainer",
      cue: "Go over the gear choice, the fade warning and the descent with the trainer, and say how it felt.",
      why: "A first long grade with a loaded trailer is frightening in a way that is easy to hide, and fear left unspoken turns into either recklessness or freezing next time. Talking through the gear choice, the moment the fade warning came up and how the descent felt, with a trainer who has done it many times, is how the confidence gets built on something real.",
    },
    {
      id: "drm-log", kind: "select", target: "drm-eld-status",
      title: "Log the stop at the bottom",
      cue: "Change the electronic log to on duty, not driving, for the inspection at the pull-out.",
      why: "The walk-round and report at the bottom are on-duty work under 49 CFR 395, not driving and not a break, and the electronic logging device records whatever status is selected. Logging the stop honestly keeps the day's limits true, and a grade that took longer than planned is exactly when a driver is tempted to fudge the record.",
    },
  ],

  interrupts: [
    {
      id: "drm-brake-fade",
      kind: "Brake-fade warning",
      after: "drm-descent", delay: 3, seconds: 10,
      alert: "The brake-temperature warning has lit, there is a hot smell in the cab, and the pedal is going further down for less slowing.",
      cue: "Get the engine doing the work.",
      target: "drm-engine-brake",
      why: "A fading brake needs the load taken off it at once: down a gear with the engine brake on high, so the engine holds the rig and the brakes can cool. If that cannot hold the speed, the escape ramp is the plan — not pumping a brake that is already too hot to work.",
      missNote: "You kept leaning on brakes that were already fading. A faded brake gets weaker the more it is used, and a rig that loses its brakes on a long grade is a runaway with nowhere to go but the escape ramp or the curve at the bottom.",
      wrongNote: "It is the engine brake and a lower gear. The service brakes are fading, so the engine has to take the load now.",
    },
    {
      id: "drm-stopped-car",
      kind: "Car stopped on the curve",
      after: "drm-bottom", delay: 3, seconds: 10,
      alert: "Round the curve at the bottom a car has stopped in your lane with its hazard lights on, and the driver is getting out.",
      cue: "Stop short of it.",
      target: "drm-brake-pedal",
      why: "A car stopped in the lane on a curve is exactly why the descent was driven at a speed the rig could stop from. Braking now, firmly and in a straight line, with a glance for a way round only once you are slowing, keeps the rig and the person getting out of that car apart.",
      missNote: "You drove on toward a car stopped in your lane with its driver stepping out. A loaded rig at the bottom of a grade, with hot brakes, needs every foot of the distance you just gave away.",
      wrongNote: "It is the brake. A car is stopped in your lane and its driver is on the road.",
    },
  ],

  supportLine: "your carrier's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root, 0, 0.06, 0);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.6, DRM_ACCENT);

    // ------------------------------------------------------------ ground, rock and the road down the grade
    const drmRoadTex = surfaceTexture((cx, w, h) => {
      gradientFill(cx, w, h, [[0, "#3c3b39"], [1, "#353432"]], { horizontal: true });
      noiseTexture(cx, w, h, { density: 4400, alpha: 0.18, tone: "0,0,0" });
      cx.fillStyle = "rgba(236,236,228,0.9)"; cx.fillRect(4, 0, 6, h); cx.fillRect(w - 10, 0, 6, h);
      cx.fillStyle = "rgba(242,193,75,0.95)"; cx.fillRect(w / 2 - 8, 0, 5, h); cx.fillRect(w / 2 + 3, 0, 5, h);
    }, { repeat: 1, px: 256 });
    drmRoadTex.repeat?.set?.(1, 2);
    const roadMat = texturedMat(drmRoadTex, { rough: 0.92, metal: 0.02 });
    const dirtTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h), { repeat: 6, px: 256 });
    const ground = box(g, 24, 0.06, 22, 0.5, -0.03, -2.5, 0xffffff, { rough: 0.95 });
    ground.material = texturedMat(dirtTex, { rough: 0.95, metal: 0.02, color: 0x9d8f78 });
    const roadPts = [[-6.4, -1.2], [-5.6, -3.2], [-5.0, -4.8], [-3.8, -6.2], [-2.0, -7.0], [0, -7.2], [2, -7.0], [3.8, -6.2], [5.0, -5.0], [5.6, -3.4], [5.8, -1.8], [5.9, 0], [5.4, 1.8], [4.2, 3.2], [2.6, 4.0], [0.6, 4.4]];
    for (let i = 1; i < roadPts.length; i++) {
      const [x0, z0] = roadPts[i - 1], [x1, z1] = roadPts[i];
      const seg = box(g, 2.4, 0.04, Math.hypot(x1 - x0, z1 - z0) + 0.35, (x0 + x1) / 2, 0.02, (z0 + z1) / 2, 0xffffff, { rough: 0.9, cast: false });
      seg.material = roadMat; seg.rotation.y = Math.atan2(x1 - x0, z1 - z0);
    }
    // The mountain behind the crest and the rock cut beside the grade.
    cyl(g, 0.4, 6.5, 6.0, -5.5, 3.0, -13.5, 0x6f675c, { rough: 0.95, seg: 7 });
    cyl(g, 0.3, 5.0, 4.6, 3.5, 2.3, -14.0, 0x7a7266, { rough: 0.95, seg: 7 });
    const cut = box(g, 3.4, 1.8, 1.0, 1.8, 0.9, -9.2, 0x857b6d, { rough: 0.95 });
    cut.rotation.y = -0.2;
    for (const [x, z] of [[-8.2, -5.5], [8.4, -3.2], [-7.6, -9.2], [8.2, 2.4]]) {
      cyl(g, 0.07, 0.09, 0.8, x, 0.4, z, 0x5b4636, { rough: 0.9, seg: 6 });
      cyl(g, 0.02, 0.7, 1.9, x, 1.6, z, 0x2f5a36, { rough: 0.9, seg: 8 });
    }
    // Guard rail on the outside of the bends.
    for (const [x, z, len, ry] of [[3.4, -8.1, 3.6, 1.3], [7.1, -3.6, 3.4, 0.2], [7.0, 1.4, 3.2, -0.3]]) {
      const rail = box(g, 0.08, 0.3, len, x, 0.45, z, 0xc2c6c9, { rough: 0.4, metal: 0.6 });
      rail.rotation.y = ry;
    }
    // The escape ramp: a gravel bed off the right of the bottom curve.
    const gravelTex = surfaceTexture((cx, w, h) => { gradientFill(cx, w, h, [[0, "#b9ab93"], [1, "#a89a82"]]); noiseTexture(cx, w, h, { density: 9000, alpha: 0.35, tone: "60,50,40" }); }, { repeat: 4, px: 256 });
    const bed = box(g, 1.8, 0.12, 5.2, 8.0, 0.06, 0.6, 0xffffff, { rough: 1 });
    bed.material = texturedMat(gravelTex, { rough: 1, metal: 0 });
    bed.rotation.y = -0.15;
    const rampSign = group(g, 6.2, 0, -1.6, -0.9);
    cyl(rampSign, 0.03, 0.03, 1.4, 0, 0.7, 0, 0x9aa1a7, { rough: 0.4, metal: 0.6, seg: 8 });
    decal(rampSign, 0.7, 0.5, 0, 1.5, 0.02, signFace("RUNAWAY TRUCK RAMP", { bg: "#f2c14b", fg: "#1b1e23", accent: "#1b1e23", scale: 0.32 }), { px: 192 });
    reg2(rampSign, "drm-escape-ramp");

    // ------------------------------------------------------------ the grade sign before the crest
    const sign = group(g, -3.6, 0, -2.8, 0.8);
    for (const sx of [-0.4, 0.4]) cyl(sign, 0.03, 0.03, 1.8, sx, 0.9, 0, 0x9aa1a7, { rough: 0.4, metal: 0.6, seg: 8 });
    decal(sign, 1.1, 0.8, 0, 1.6, 0.03, signFace("STEEP GRADE · TRUCKS USE LOW GEAR", { bg: "#f2c14b", fg: "#1b1e23", accent: "#1b1e23", scale: 0.3 }), { px: 256 });
    reg2(sign, "drm-grade-sign");

    // ------------------------------------------------------------ the rig, the smoking truck and the stopped car
    const rig = flArticulate(tractorTrailer(g, -5.6, 0, -3.2, { ry: Math.PI * 0.86, livery: { colour: 0x8a4f2a, fleetName: "SMARTCITI HAUL", unitNumber: "T-320" } }));
    rig.scale.setScalar(DRM_SCALE);
    reg2(rig, "drm-rig");
    // Smoke off the rig's own trailer tandem, shown when the brakes start to fade.
    const rigSmoke = cyl(rig.userData.articulation.pivot, 0.9, 0.35, 1.8, 1.1, 1.1, -13.3, 0xd9d9d9, { rough: 1, seg: 10, opacity: 0.55 });
    rigSmoke.visible = false;
    const smoker = group(g, 4.2, 0, -3.6, -0.8);
    box(smoker, 1.3, 1.6, 3.4, 0, 1.0, 0, 0xdadcde, { rough: 0.6, metal: 0.2 });
    const smoke = cyl(smoker, 0.5, 0.2, 1.2, 0.3, 0.9, -1.2, 0xd9d9d9, { rough: 1, seg: 10, opacity: 0.55 });
    reg2(smoker, "drm-smoking-truck");
    const stopped = sedan(g, 9.0, 0, 6.0, { ry: Math.PI / 2, livery: { colour: 0x5b6a78 } });
    stopped.scale.setScalar(DRM_SCALE);
    const rocks = group(g, 3.0, 0, -5.4);
    for (const [x, z, r] of [[0, 0, 0.26], [0.35, 0.2, 0.18]]) cyl(rocks, r * 0.6, r, r * 1.1, x, r * 0.5, z, 0x6d655a, { rough: 1, seg: 6 });
    reg2(rocks, "drm-rockfall");

    // ------------------------------------------------------------ the unsafe choices
    const redSlab = (x, z, w, d, id, text, tw) => {
      const s = slab(g, w, 0.02, d, x, 0.06, z, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
      holoTag(g, text, x, 0.3, z, { css: "#d2312b", w: tw });
      reg2(s, id);
      return s;
    };
    redSlab(-4.3, -4.4, 1.0, 0.6, "drm-climbing-gear", "down in the climbing gear?", 0.44);
    redSlab(1.2, -5.8, 1.0, 0.6, "drm-ride-brakes", "ride the brakes down?", 0.38);
    redSlab(4.4, -1.4, 1.0, 0.6, "drm-coast-neutral", "coast it in neutral?", 0.36);

    // ------------------------------------------------------------ the cab controls, brought to the pad
    const dash = group(g, -1.7, 0, 1.1, 0.5);
    box(dash, 1.1, 0.9, 0.36, 0, 0.45, 0, 0x2b2f34, { rough: 0.7 });
    slab(dash, 1.06, 0.34, 0.05, 0, 1.06, 0.06, 0x1b1e23, { radius: 0.02, rough: 0.6 });
    const air = decal(dash, 0.2, 0.12, -0.22, 1.1, 0.09, signFace("AIR 120", { bg: "#0d1c24", accent: DRM_CSS, fg: "#f6ead6", scale: 0.5 }), { px: 192, glow: true, ei: 0.8 });
    reg2(air, "drm-air-gauge");
    const jake = box(dash, 0.08, 0.05, 0.05, 0.08, 1.12, 0.1, 0xe0a14a, { rough: 0.5 });
    reg2(jake, "drm-engine-brake");
    const mirrorSw = box(dash, 0.08, 0.05, 0.05, 0.26, 1.12, 0.1, 0x59636d, { rough: 0.5 });
    reg2(mirrorSw, "drm-mirror-set");
    const dial = group(dash, 0.44, 1.12, 0.1);
    cyl(dial, 0.05, 0.05, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    reg2(dial, "drm-retarder-dial");
    const pedal = box(dash, 0.1, 0.03, 0.16, 0.05, 0.2, 0.3, 0x59636d, { rough: 0.5, metal: 0.5 });
    reg2(pedal, "drm-brake-pedal");
    const service = box(dash, 0.08, 0.03, 0.16, -0.12, 0.2, 0.3, 0x3a3f45, { rough: 0.5 });
    reg2(service, "drm-service-brake");
    const phone = box(dash, 0.07, 0.12, 0.01, 0.4, 0.96, 0.18, 0x1b1e23, { rough: 0.3 });
    holoTag(dash, "phone ringing — answer?", 0.4, 0.8, 0.2, { css: "#d2312b", w: 0.38 });
    reg2(phone, "drm-phone");
    const eld = instrument(dash, -0.36, 1.08, 0.09, { idle: "DRIVING", color: DRM_ACCENT, w: 0.16, d: 0.12 });
    reg2(eld, "drm-eld-status");

    // ------------------------------------------------------------ tachometer, hub, report, boards, trainer
    const tachPost = group(g, 2.3, 0, 1.5, -0.5);
    box(tachPost, 0.06, 1.1, 0.06, 0, 0.55, 0, 0x59636d, { rough: 0.5, metal: 0.5 });
    const tachFace = decal(tachPost, 0.34, 0.2, 0, 1.22, 0.04, signFace("TACH", { bg: "#1a1208", accent: DRM_CSS, fg: "#f6ead6", scale: 0.42 }), { px: 256, glow: true, ei: 0.8 });
    reg2(tachPost, "drm-gear-gauge");
    const hub = group(g, 1.2, 0, 2.5);
    const tyre = cyl(hub, 0.36, 0.36, 0.24, 0, 0.38, 0, 0x1b1e23, { rough: 0.9, seg: 18 });
    tyre.rotation.z = Math.PI / 2;
    const hubCap = cyl(hub, 0.12, 0.12, 0.05, 0.14, 0.38, 0, 0x9aa1a7, { rough: 0.4, metal: 0.6, seg: 12 });
    hubCap.rotation.z = Math.PI / 2;
    holoTag(hub, "trailer hub", 0, 0.92, 0, { css: DRM_CSS, w: 0.22 });
    reg2(hub, "drm-hub");
    const report = holoPanel(g, 0.5, 0.36, -2.7, 1.5, -0.4, (ctx, w, h) => {
      ctx.fillStyle = "#1a1208"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = DRM_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f6ead6"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("INSPECTION REPORT", w * 0.07, h * 0.22);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Brakes: ____________", w * 0.07, h * 0.5);
      ctx.fillText("Hubs: ______________", w * 0.07, h * 0.72);
    }, { ry: 1.0, accent: DRM_ACCENT });
    reg2(report, "drm-dvir");
    const checkin = holoPanel(g, 0.46, 0.3, 0.2, 1.75, 2.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("GRADE DEBRIEF", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Gear · the fade · how it felt", w / 2, h * 0.66);
    }, { ry: 0.2, accent: 0x4fd1ff });
    reg2(checkin, "drm-crew-checkin");
    standingFigure(g, -2.9, 0.7, { ry: 1.4, cloth: 0x5a4632, vest: 0xd8e24a });

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.0, -6.0),
      onStepComplete(step) {
        if (step.id === "drm-gear-choice") repaint(tachFace, signFace("HOLDING", { bg: "#1a1208", accent: "#59c97b", fg: "#f6ead6", scale: 0.42 }));
        if (step.id === "drm-pullout") jake.material = mat(0x59c97b, { emissive: 0x2a8a4a, ei: 0.8, rough: 0.5 });
        if (step.id === "drm-hub-check") hubCap.material = mat(0xd96b2b, { emissive: 0xa0401a, ei: 0.6, rough: 0.5 });
        if (step.id === "drm-log") repaint(eld.userData.screen, signFace("ON DUTY", { bg: "#1a1208", accent: "#59c97b", fg: "#f6ead6", scale: 0.45 }));
      },
      // The rig's own trailer really starts to smoke; the car really stops in
      // the lane round the curve with its driver stepping out.
      onInterrupt(it) {
        if (it.id === "drm-brake-fade") { rigSmoke.visible = true; pedal.material = mat(0xd2312b, { emissive: 0xa01a10, ei: 0.8, rough: 0.5 }); }
        if (it.id === "drm-stopped-car") { stopped.position.set(1.4, 0, 4.3); stopped.rotation.y = -Math.PI / 2 - 0.2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "drm-brake-fade") { pedal.material = mat(0x59636d, { rough: 0.5, metal: 0.5 }); rigSmoke.visible = false; }
        if (it.id === "drm-stopped-car") stopped.position.set(-0.6, 0, 5.2);
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "drm-gear-choice") {
          const ok = gg.t >= 0.5 && gg.t <= 0.72;
          repaint(tachFace, signFace(ok ? "HOLDING" : gg.t < 0.5 ? "TOO HIGH" : "REVVING", { bg: "#1a1208", accent: ok ? "#59c97b" : "#f2ae14", fg: "#f6ead6", scale: 0.42 }));
        }
        if (session?.turn && step?.id === "drm-retarder") dial.rotation.z = session.turn.amount * Math.PI * 2;
        if (smoke.scale) smoke.scale.setScalar(1 + 0.1 * Math.sin(t * 3));
        void dt;
      },
    };
  },
};
