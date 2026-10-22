import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure,
  surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { conveyorSection } from "../../../shared/equipment.js";
import { pickToLightShelf, palletStack } from "../../../shared/props.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pick-to-Light Ergonomics & Rotation VR — Manufacturing &
// Automation, Teamsters warehouse and logistics automation.
//
// A pick-to-light module is built to make picking fast — the light tells
// an associate exactly which bin, the display tells them exactly how many,
// and neither one has any opinion about how many times an hour a shoulder
// should reach overhead or a back should bend to the floor. This station
// walks the module's own ergonomics sequence: the pick confirmed against
// the display rather than trusted to the light alone, a heavy case brought
// to waist height with the lift-assist table instead of muscled down from
// a shelf, the pace held inside a sustainable band instead of chased, and
// the job rotation actually taken instead of skipped because the next task
// feels like a delay. No pick rate, lift weight or rotation interval is a
// number this platform is certain of — those live on the site's own
// ergonomics programme and the rotation schedule it posts.

const TW8_PAL = palette("warehouse");
const PL_ACCENT = 0xf0b323;

export const SIM_TW_PICK_TO_LIGHT_ERGONOMICS_AND_ROTATION = {
  id: "tw-pick-to-light-ergonomics-and-rotation",
  index: "tw-8",
  domain: "Warehousing & Logistics",
  trade: "Teamsters warehouse associate — pick-to-light module",
  category: "Manufacturing & Automation",
  indoor: "datahall",
  certification: "Teamsters warehouse and logistics automation training; the Revised NIOSH Lifting Equation for manual material handling, worked the way the site's own ergonomics programme applies it; OSHA 29 CFR 1910.147 the control of hazardous energy for the tote lane's drive and 29 CFR 1910.212 machine guarding; ASME B20.1 safety standard for conveyors and related equipment for the tote lane itself",
  name: "Pick-to-Light Ergonomics & Rotation",
  title: simTitle("Pick-to-Light Ergonomics & Rotation"),
  tagline: "Working a pick-to-light module the way its own ergonomics sequence requires it: the pick confirmed against the display rather than trusted to the light alone, a heavy case brought to waist height with the lift-assist table, the pace held inside a sustainable band instead of chased, and the job rotation actually taken on schedule",
  accent: PL_ACCENT,
  accentCss: "#f0b323",
  parSeconds: 265,
  footprint: 2.6,
  badge: { id: "pick-to-light-certified", name: "Pick-to-Light Ergonomics Certified", note: "Confirmed every pick against the display, used the lift-assist for the heavy case, held a sustainable pace, and took the rotation on schedule" },

  game: system({
    name: "Pick Pace Discipline",
    currency: "PACE",
    ranks: ["New Picker", "Pace Aware", "Pick Module Handler", "Pick Pace Authority", "Pick-to-Light Ergonomics Certified"],
    badges: [
      { id: "display-over-light", name: "Display Over Light", note: "Confirmed the display before every pick, first try", test: AWARD.stepClean("confirm-quantity") },
      { id: "lift-assist-every-time", name: "Lift-Assist Every Time", note: "Used the lift-assist table for the heavy case", test: AWARD.stepClean("lift-assist-lower") },
      { id: "steady-pace", name: "Steady Pace", note: "Held the pick pace near band centre through the shift", test: AWARD.precise(0.72) },
      { id: "clean-module-read", name: "Clean Module Read", note: "Never missed a hazard on the module read", test: AWARD.stepClean("module-hazard-read") },
    ],
    challenges: [
      { id: "quick-cycle", name: "Quick Cycle", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "pace-streak", name: "Pace Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your Teamsters local's member assistance programme, or the site's employee assistance line if repetitive strain from a pick module is what brought you here",

  hazards: {
    "overhead-overweight-hazard": "That case is marked overweight and stacked above shoulder height. Reaching overhead for a case heavier than the rest is exactly the combination — height plus load — that turns an ordinary pick into the rep that actually hurts a shoulder.",
    "stuck-pick-light-hazard": "That pick light has stuck on, lit over a bin nobody actually queued a pick from. A light trusted on its own, without checking the display's quantity against it, sends a pick from the wrong bin exactly as confidently as it sends one from the right one.",
    "missing-tote-guard-hazard": "That tote-lane guard has been removed from over the drive roller. A guard missing from a moving lane is a pinch point sitting in reach of anyone loading a tote, whether or not it has caught anyone yet.",
    "skip-rotation-hazard": "That sign reads 'skip rotation, stay on pick' taped over the rotation schedule. Skipping the scheduled rotation to keep the count up trades a short-term pace gain for exactly the kind of repetitive strain the rotation schedule exists to prevent.",
  },

  lateNotes: {
    "pick-display": "The display's quantity gets confirmed before every pick, not trusted to the light by itself.",
    "lift-assist-crank": "The lift-assist table gets used for a heavy case before it is lifted, not reached for after a back has already bent to get it.",
  },

  interrupts: [
    {
      id: "pace-spike-fault",
      kind: "Pace demand spike",
      after: "pace-check", delay: 3, seconds: 12,
      alert: "The system's demanded pick rate has spiked well above the sustainable pace.",
      cue: "Signal the shift lead rather than matching the system's demanded pace.",
      target: "lead-call",
      why: "A pace demand that spikes from the system is a scheduling problem, not a challenge to personally absorb — signalling the lead is what gets the demand corrected or the task shared, instead of one associate quietly working through a rate nobody actually planned for a whole shift.",
      missNote: "The pace spike was matched instead of reported. A pace held past what is sustainable for one spike gets asked for again the next time the system sees it worked once.",
      wrongNote: "Not that — a pace demand spike goes to the shift lead before it gets matched.",
    },
    {
      id: "shelf-tip-fault",
      kind: "Shelf shift",
      after: "carry-case-to-tote", delay: 4, seconds: 12,
      alert: "An overloaded neighbouring bin has visibly shifted and is tipping forward slightly.",
      cue: "Stop and report the tipping shelf to the shift lead rather than pushing it back into place by hand.",
      target: "shift-lead-call",
      why: "A shelf that has already started to tip is carrying more than it should, and pushing it back by hand risks having it come down while a hand is still on it — reporting it is what gets it unloaded and secured by someone who can see the whole bay, not guessed at from underneath it.",
      missNote: "The tipping shelf was pushed back into place instead of reported. A shelf that tips once under an overload will tip again unless the overload is actually addressed.",
      wrongNote: "Not that — a tipping shelf gets reported to the shift lead, not pushed back into place.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "back-support-belt"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "back-support-belt": "back-support belt" },
      title: "Suit up before starting the module",
      cue: "Hi-vis vest and back-support belt before starting today's picks.",
      why: "A back-support belt worn before the first pick, not partway through the shift once something already feels off, is what actually reinforces good lifting habits instead of arriving after the habit that needed reinforcing.",
    },
    {
      id: "schedule-read", kind: "select", target: "rotation-board",
      title: "Read the rotation schedule",
      cue: "Confirm today's job-rotation schedule before starting the module.",
      why: "The rotation schedule is what keeps this module from being the only thing an associate's body does for an entire shift — reading it now is what makes the rotation something planned for, not something skipped when the pick count is going well.",
    },
    {
      id: "module-hazard-read", kind: "find", noHint: true,
      targets: ["overhead-overweight-hazard", "stuck-pick-light-hazard", "missing-tote-guard-hazard"],
      itemNames: {
        "overhead-overweight-hazard": "overweight case stacked overhead",
        "stuck-pick-light-hazard": "pick light stuck on the wrong bin",
        "missing-tote-guard-hazard": "tote-lane guard removed",
      },
      itemNotes: {
        "overhead-overweight-hazard": "An overweight case above shoulder height gets moved down by two people or a lift aid, not reached for solo.",
        "stuck-pick-light-hazard": "A pick light stuck on gets reported before anyone trusts it over the display again.",
        "missing-tote-guard-hazard": "A missing guard gets reported and the lane treated as off-limits until it is back on.",
      },
      decoyNotes: {
        "intact-shelf-light": "That shelf's pick light is lit correctly with a live display behind it. Nothing to flag there.",
      },
      title: "Read the module for what is already wrong with it",
      cue: "Look the module over before starting. Three things are already wrong with it — find them.",
      why: "A module that looks routine at the start of a shift is not the same thing as one an associate has actually checked — an overhead overweight case, a stuck light or a missing guard each quietly turns an ordinary pick into the one that goes wrong, and finding them now costs a report instead of costing someone a strain or a caught hand.",
    },
    {
      id: "confirm-quantity", kind: "select", target: "pick-display",
      title: "Confirm the pick quantity",
      cue: "Confirm the display's quantity before reaching for the lit bin.",
      why: "The display is what actually says how many to pick — the light only says which bin, and trusting the light alone is how a quantity gets picked wrong even when the bin was exactly right.",
    },
    {
      id: "pick-correct-bin", kind: "select", target: "lit-bin",
      title: "Pick from the lit bin",
      cue: "Pick from the bin the light and the display both point to.",
      why: "Picking from the bin both signals agree on, rather than the one that is simply closest, is what keeps the warehouse management system's count accurate for whoever pulls from this module next.",
    },
    {
      id: "lift-assist-lower", kind: "turn", target: "lift-assist-crank",
      title: "Lower the lift-assist table",
      cue: "Turn the lift-assist crank to bring the heavy case down to waist height before lifting it.",
      why: "Bringing the case to waist height with the lift-assist, rather than reaching up or bending down to where it sits, is what keeps this lift inside the posture range a back can repeat all shift without accumulating the strain the awkward version of the same lift would.",
      turn: { turns: 0.5, axis: "x", label: "LIFT-ASSIST CRANK" },
    },
    {
      id: "advance-tote", kind: "hold", target: "tote-advance-button", seconds: 5,
      title: "Advance the tote",
      cue: "Hold the advance button until the tote reaches the pack station.",
      why: "Holding the advance the whole way, rather than bumping it and walking away, is what keeps the tote from stopping short at a point on the lane it was never meant to sit — exactly where the next associate would have to reach further than planned to reach it.",
      holdBreakNote: "Released the advance button before the tote reached the pack station. A tote stopped short is a reach nobody planned for the next person in line.",
    },
    {
      id: "pace-check", kind: "gauge", target: "pace-gauge",
      title: "Confirm the pick pace",
      cue: "Read the pace gauge and commit only within the sustainable band.",
      why: "The pace gauge is the only honest read of whether this rate is sustainable for a full shift — matching whatever the system asks for, rather than what the gauge shows as sustainable, is exactly how a pace that feels fine for an hour stops feeling fine by the end of a shift.",
      gauge: {
        label: "PICK PACE", speed: 0.5, green: [0.35, 0.65],
        readout: (t) => (t < 0.35 ? "under-pacing — check the queue" : t > 0.65 ? "over-pacing — unsustainable" : "sustainable pace"),
        missNote: "Committed outside the sustainable band. An unsustainable pace gets reported, not matched for the rest of the shift.",
      },
    },
    {
      id: "carry-case-to-tote", kind: "drag", target: "picked-case",
      title: "Carry the case to the tote",
      cue: "Carry the picked case to the waiting tote.",
      why: "Carrying the case close to the body for the short distance to the tote, rather than swinging it out at arm's length, is what keeps even a light case from loading the lower back the way an extended reach would.",
      drag: { to: "tote-socket", radius: 0.4, missNote: "Not into the tote — carry the case all the way in rather than setting it down short and sliding it the rest of the way." },
    },
    {
      id: "lane-speed-track", kind: "track", target: "tote-lane", seconds: 8,
      title: "Load the tote lane",
      cue: "Load the tote onto the lane while keeping the lane speed indicator inside the safe band.",
      why: "Watching the lane speed while loading is what keeps a tote from being set down onto a lane running too fast to receive it gently — a tote dropped onto a fast lane is a tote that can bounce back into the hand that just set it down.",
      track: {
        start: 0.5, green: [0.38, 0.62], rise: 0.4, fall: 0.42, drift: 0.1,
        label: "LANE SPEED",
        readout: (v) => (v < 0.38 ? "too slow — queue building" : v > 0.62 ? "too fast to load safely" : "safe loading speed"),
      },
      holdBreakNote: "The lane speed left the safe band. Bring it back under control before loading the next tote.",
    },
    {
      id: "stretch-break", kind: "sequence", anyOrder: true,
      targets: ["shoulder-stretch-point", "back-stretch-point"],
      itemNames: { "shoulder-stretch-point": "shoulder stretch", "back-stretch-point": "back stretch" },
      title: "Take the scheduled stretch break",
      cue: "Run both stretches on the posted guide before the next cycle.",
      why: "A stretch break taken on schedule, rather than skipped because the pick count is going well, is what the site's own ergonomics programme is actually counting on to offset a shift's worth of the same repeated motion.",
    },
    {
      id: "rotate-next-station", kind: "select", target: "next-station-marker",
      title: "Rotate to the next task",
      cue: "Move to the next task on the rotation schedule.",
      why: "Taking the rotation for real, rather than treating the schedule as a suggestion, is what actually varies the muscles and joints this shift asks something of — the whole point of a rotation is a body that is not doing the exact same motion for the exact same eight hours.",
    },
    {
      id: "closing-log", kind: "select", target: "closing-log",
      title: "Sign the rotation log",
      cue: "Sign the rotation log before leaving the module.",
      why: "The signed log is the record that this specific rotation was actually taken — not assumed fine because the schedule says it should have been.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PL_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.4, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.85 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#3e4650", base2: "#353c45", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.85, metal: 0.08, color: 0x3e4650 },
    );

    // ------------------------------------------------------------------ pick module
    const shelf = pickToLightShelf(g, 0, 0.14, -1.6, { ry: 0 });
    holoTag(shelf, "pick module 7", 0, 2.7, 0, { css: "#f0b323", w: 0.34 });
    const topLight = shelf.userData.parts["light1.7"];

    const litBin = group(shelf, -0.4, 1.15, 0.24);
    ball(litBin, 0.04, 0, 0, 0, 0xf0b323, { emissive: 0xf0b323, ei: 1.2, rough: 0.4, seg: 10, seg2: 8 });
    reg(hits, litBin, "lit-bin");
    const pickedCase = group(shelf, -0.4, 1.05, 0.2);
    box(pickedCase, 0.18, 0.14, 0.16, 0, 0, 0, 0xd8d9d4, { rough: 0.7 });
    reg(hits, pickedCase, "picked-case");

    const overheadCase = group(shelf, 0.4, 1.75, 0.2);
    box(overheadCase, 0.2, 0.16, 0.18, 0, 0, 0, 0xc9a86b, { rough: 0.8, finish: "brushed" });
    reg(hits, overheadCase, "overhead-overweight-hazard");
    reg(hits, topLight, "stuck-pick-light-hazard");
    const intactShelfLight = group(shelf, -0.4, 0.55, 0.24);
    ball(intactShelfLight, 0.02, 0, 0, 0, 0x59c97b, { emissive: 0x2f7d4a, ei: 1.0, rough: 0.4, seg: 8, seg2: 6 });
    reg(hits, intactShelfLight, "intact-shelf-light");

    const pickDisplay = group(g, 0.9, 0, -1.4, -0.4);
    box(pickDisplay, 0.16, 0.1, 0.02, 0, 1.5, 0, 0x0d1c24, { rough: 0.5 });
    holoTag(pickDisplay, "pick display", 0, 1.6, 0, { css: "#f0b323", w: 0.32 });
    reg(hits, pickDisplay, "pick-display");

    // ------------------------------------------------------------------ lift assist
    const liftAssist = group(g, 0.9, 0, -0.6, -0.4);
    box(liftAssist, 0.6, 0.1, 0.5, 0, 0.85, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    for (const sx of [-0.25, 0.25]) cyl(liftAssist, 0.03, 0.03, 0.85, sx, 0.425, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 10 });
    holoTag(liftAssist, "lift-assist table", 0, 1.0, 0, { css: "#f0b323", w: 0.36 });
    const liftCrank = group(liftAssist, 0.32, 0.7, 0);
    cyl(liftCrank, 0.015, 0.015, 0.14, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    reg(hits, liftCrank, "lift-assist-crank");

    // ------------------------------------------------------------------ tote lane
    const laneA = conveyorSection(g, 1.8, 0.14, 0.3, { ry: Math.PI / 2, colour: 0x4a5560 });
    const laneB = conveyorSection(g, 1.8, 0.14, 1.5, { ry: Math.PI / 2, colour: 0x4a5560 });
    reg(hits, laneA.userData.parts.guard, "missing-tote-guard-hazard");
    laneA.userData.parts.guard.rotation.x = -0.6;
    const toteAdvanceButton = group(laneA, -0.29, 0.5, 0.4);
    ball(toteAdvanceButton, 0.02, 0, 0, 0, 0x59c97b, { emissive: 0x2f7d4a, ei: 1.1, rough: 0.4, seg: 10, seg2: 8 });
    reg(hits, toteAdvanceButton, "tote-advance-button");
    const toteSocket = group(laneB, 0, 0.5, -0.4);
    hits["tote-socket"] = toteSocket;
    reg(hits, laneB, "tote-lane");

    const paceGauge = group(g, -1.6, 0, -0.6, 0.4);
    box(paceGauge, 0.14, 0.1, 0.03, 0, 0.9, 0, 0x0d1c24, { rough: 0.5 });
    holoTag(paceGauge, "pace gauge", 0, 1.0, 0, { css: "#f0b323", w: 0.3 });
    reg(hits, paceGauge, "pace-gauge");

    // ------------------------------------------------------------------ stretch guide
    const stretchGuide = group(g, -2.4, 0, 0.6, 0.3);
    box(stretchGuide, 0.5, 0.6, 0.03, 0, 1.3, 0, 0x1b232b, { rough: 0.6 });
    holoTag(stretchGuide, "stretch guide", 0, 1.65, 0, { css: "#f0b323", w: 0.32 });
    const shoulderStretch = group(stretchGuide, -0.12, 1.3, 0.02);
    ball(shoulderStretch, 0.02, 0, 0, 0, 0x59c97b, { emissive: 0x2f7d4a, ei: 1.0, rough: 0.4, seg: 8, seg2: 6 });
    reg(hits, shoulderStretch, "shoulder-stretch-point");
    const backStretch = group(stretchGuide, 0.12, 1.3, 0.02);
    ball(backStretch, 0.02, 0, 0, 0, 0x59c97b, { emissive: 0x2f7d4a, ei: 1.0, rough: 0.4, seg: 8, seg2: 6 });
    reg(hits, backStretch, "back-stretch-point");

    const skipSign = box(g, 0.2, 0.12, 0.02, -1.5, 1.1, -1.9, 0xd2312b, { rough: 0.5 });
    decal(skipSign, 0.18, 0.1, 0, 0, 0.011, signFace("SKIP ROTATION", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 }));
    reg(hits, skipSign, "skip-rotation-hazard");

    const nextStationMarker = group(g, 2.3, 0.14, -0.6);
    ball(nextStationMarker, 0.06, 0, 0.2, 0, 0x59c97b, { emissive: 0x2f7d4a, ei: 1.0, rough: 0.4, seg: 10, seg2: 8 });
    holoTag(nextStationMarker, "next task", 0, 0.4, 0, { css: "#f0b323", w: 0.28 });
    reg(hits, nextStationMarker, "next-station-marker");

    // ------------------------------------------------------------------ PPE
    const ppeRack = group(g, -2.8, 0, 1.9, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, PL_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#f0b323", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const beltProp = group(ppeRack, 0.2, 0.62, 0);
    box(beltProp, 0.2, 0.1, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.7 });
    holoTag(beltProp, "back-support belt", 0, 0.16, 0, { css: "#f0b323", w: 0.38 });
    reg(hits, beltProp, "back-support-belt");

    // ------------------------------------------------------------------ dressing
    const shelf2 = pickToLightShelf(g, 1.9, 0.14, -2.3, { ry: -0.3 });
    holoTag(shelf2, "pick module 8", 0, 2.7, 0, { css: "#f0b323", w: 0.34 });
    const shelf3 = pickToLightShelf(g, -1.9, 0.14, -2.3, { ry: 0.3 });
    holoTag(shelf3, "pick module 6", 0, 2.7, 0, { css: "#f0b323", w: 0.34 });
    palletStack(g, 2.7, 0, 2.6, { ry: -0.4 });

    // ------------------------------------------------------------------ crew, boards
    const associate = standingFigure(g, -1.6, 1.9, { ry: -2.2, cloth: 0x2b3138, vest: TW8_PAL.accent, helmet: 0xf2f2f2 });
    holoTag(associate, "warehouse associate", 0, 1.95, 0.15, { css: "#f0b323", w: 0.36 });

    const lead = standingFigure(g, 1.5, 2.35, { ry: -2.4, cloth: 0x37505f, vest: TW8_PAL.accent, helmet: 0xf2c14b });
    holoTag(lead, "shift lead", 0, 1.95, 0.15, { css: "#f0b323", w: 0.26 });
    const leadCall = group(g, 2.2, 0, 1.5, -0.4);
    box(leadCall, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(leadCall, "lead call", 0, 1.35, 0, { css: "#f0b323", w: 0.26 });
    reg(hits, leadCall, "lead-call");
    const shiftLeadCall = group(g, 2.3, 0, 1.1, -0.4);
    box(shiftLeadCall, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(shiftLeadCall, "shift lead call", 0, 1.35, 0, { css: "#f0b323", w: 0.3 });
    reg(hits, shiftLeadCall, "shift-lead-call");

    const rotationBoard = holoPanel(g, 0.58, 0.4, -2.6, 1.5, 1.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f0b323"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d8c98a";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("ROTATION SCHEDULE", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("PICK MODULE 7 → NEXT", w * 0.06, h * 0.36);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Pace: per the sustainable band", "Rotation: per the posted schedule"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.58 + i * 0.15)));
    }, { ry: 0.5, accent: PL_ACCENT });
    reg(hits, rotationBoard, "rotation-board");

    const closingLog = group(g, 2.7, 0, -1.2, 0.5);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("ROTATION LOG\nOPEN", { bg: "#11181f", accent: "#f0b323", scale: 0.26 }), { px: 320 });
    holoTag(closingLog, "rotation log", 0, 1.32, 0, { css: "#f0b323", w: 0.28 });
    reg(hits, closingLog, "closing-log");

    return {
      hits,
      footprint: 2.6,

      onInterrupt(it) {
        if (it.id === "pace-spike-fault") { paceGauge.children[0].material = mat(0xd2312b, { emissive: 0xc01810, ei: 1.4, rough: 0.4 }); }
        if (it.id === "shelf-tip-fault") { overheadCase.rotation.z = 0.2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "pace-spike-fault") { paceGauge.children[0].material = mat(0x0d1c24, { rough: 0.5 }); }
        if (it.id === "shelf-tip-fault") { overheadCase.rotation.z = 0; }
      },
      onStepComplete(step) {
        if (step.id === "module-hazard-read") {
          overheadCase.position.y -= 0.5;
          topLight.children[0].material = mat(0x59c97b, { rough: 0.4 });
          laneA.userData.parts.guard.rotation.x = 0;
        }
        if (step.id === "carry-case-to-tote") { pickedCase.visible = false; }
        if (step.id === "closing-log") {
          repaint(closingLogFace, signFace("ROTATION LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
        }
      },

      animate(t, dt, session) {
        associate.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        lead.userData.head.rotation.y = Math.sin(t * 0.6 + 1) * 0.4;
        void session; void dt;
      },
    };
  },
};
