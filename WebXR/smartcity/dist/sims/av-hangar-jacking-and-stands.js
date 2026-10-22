import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument,
  standingFigure, surfaceTexture, texturedMat, palette, concreteFace,
  corrugatedFace, tileFace, reg,
} from "../citykit.js";
import { regionalJet } from "../../../shared/equipment.js";
import { aircraftJack, scaffoldTower } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hangar Jacking & Stands VR — its own gamified system: Level
// and Locked.
//
// Putting a jet up on jacks inside the hangar: the jacks and stands walked
// for a defect first, the aircraft's own fuel and weight state confirmed
// against the AMM's jacking limits, three jacks brought up together rather
// than one at a time, the locking collars set and the aircraft proven stable
// before anyone works under it, downlock pins seated the moment the gear is
// unloaded, work stands checked for their own guardrails before anyone
// climbs, and the whole sequence run in reverse — pins out, then down
// together, then chocked — before the jacks ever come out from under it. No
// jack point, weight limit or jack capacity here is one this platform is
// certain of — those live on the aircraft's own AMM.

const AVJK_ACCENT = 0xc8201c;

export const SIM_AV_HANGAR_JACKING_AND_STANDS = {
  id: "av-hangar-jacking-and-stands",
  index: "av-6",
  domain: "Aviation",
  trade: "Aircraft maintenance technician, jacking and stands — IAM/TWU",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "IAM and TWU maintenance training; FAA 14 CFR Part 43 maintenance, preventive maintenance, rebuilding and alteration and 14 CFR Part 145 repair stations; OSHA 29 CFR 1910.23 ladders and fixed stairs and 29 CFR 1910.132 personal protective equipment",
  name: "Hangar Jacking & Stands",
  title: simTitle("Hangar Jacking & Stands"),
  tagline: "A jet raised on three jacks: the jacks and stands inspected, the fuel state confirmed against the AMM, the jacks brought up together and locked, downlock pins seated the moment the gear unloads, the stands checked for their own guardrails, and everything run in reverse before the jacks come out",
  accent: AVJK_ACCENT,
  accentCss: "#c8201c",
  parSeconds: 320,
  footprint: 2.9,
  badge: { id: "level-and-locked", name: "Level and Locked", note: "Jacks raised together and locked, downlock pins seated the moment the gear unloaded, and every stand checked for its own guardrail before anyone climbed" },

  game: system({
    name: "Level and Locked",
    currency: "JACK",
    ranks: ["Ramp Hand", "Jack Qualified", "Stand Certified", "Lead Technician", "Level and Locked Certified"],
    badges: [
      { id: "together-up", name: "Together Up", note: "Never raised one jack far ahead of the others", test: AWARD.safe },
      { id: "pins-seated", name: "Pins Seated", note: "Never worked under the aircraft without the downlock pins in", test: AWARD.stepClean("install-downlock-pins") },
      { id: "level-hold", name: "Level Hold Certified", note: "Held the level reading near band centre through the whole raise", test: AWARD.precise(0.72) },
      { id: "clean-inspection", name: "Clean Inspection Certified", note: "Found every defect on the jacks and stands, first pass", test: AWARD.stepClean("inspect-jacks") },
    ],
    challenges: [
      { id: "quick-jack", name: "Quick Jack", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "jack-streak", name: "Jack Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IAM or TWU local's member assistance programme, or the site's employee assistance line if a close call under a jacked aircraft is what stayed with you",

  hazards: {
    "uncoordinated-raise-hazard": "That raises one jack well ahead of the other two. An aircraft supported unevenly on three points is an aircraft leaning its own weight toward whichever jack is furthest behind, and that lean gets worse with every extra turn the leading jack takes before the others catch up.",
    "skip-downlock-pin-hazard": "That has this crew working under the aircraft with no downlock pins seated. The jacks' own hydraulics are the only thing holding the aircraft up without them, and a hydraulic system with nothing mechanical backing it up is not what this crew is supposed to be trusting its own body underneath.",
    "jack-crush-zone-hazard": "You are standing at the jack's own crush point while it is moving. A jack under load closes that gap with the full weight of the aircraft behind it, and there is no reaction time built into standing where the ram itself travels.",
    "stand-no-guardrail-hazard": "That climbs the work stand before its guardrail is confirmed latched. A platform at height with no rail is a fall this crew is one misstep away from, and the rail is checked every time specifically because a stand that looked fine yesterday is not a stand this crew is allowed to assume is fine today.",
  },

  lateNotes: {
    "downlock-pins": "The downlock pins go in the moment the gear is unloaded, not sometime after this crew is already working under the aircraft.",
    "stability-gauge": "The aircraft is proven level and stable before anyone works under it, not assumed stable because the jacks reached height.",
  },

  interrupts: [
    {
      id: "jack-races-ahead",
      kind: "Uneven raise",
      after: "raise-jacks-coordinated", delay: 5, seconds: 12,
      alert: "The tail jack has visibly raced ahead of both wing jacks, and the aircraft has started to lean toward the wing side.",
      cue: "Hit the jack stop now, before the lean gets any worse.",
      target: "jack-estop",
      why: "A lean that starts this early in the raise only grows with every further turn the lead jack takes, and the raise has to stop the instant the jacks are seen coming up unevenly rather than continue on the hope the other two catch up on their own.",
      missNote: "The raise kept going while the aircraft leaned further off level. An uneven raise that is allowed to continue is exactly how a jack point ends up loaded past what it was ever rated to carry from that angle.",
      wrongNote: "That's not the fix — the uneven raise is what stops this jacking operation, not this.",
    },
    {
      id: "coworker-walks-under-descending-aircraft",
      kind: "Under-aircraft incursion",
      after: "lower-jacks-coordinated", delay: 4, seconds: 12,
      alert: "A coworker has walked in under the fuselage while the aircraft is still coming down on the jacks.",
      cue: "Stop the descent now and get them clear before it lowers any further.",
      target: "jack-estop",
      why: "An aircraft coming down on three jacks does not stop for a person underneath it the way a person would step aside for a falling object they could see coming — the descent stops the instant anyone at all is seen under it, full stop, no matter how close the job already was to finished.",
      missNote: "The jacks kept lowering while a coworker was still under the fuselage. Nothing about a descending aircraft gives a person underneath it a warning before the gap closes.",
      wrongNote: "Wrong response — a person under a descending aircraft is what stops it, full stop.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hard-hat", "safety-glasses", "work-gloves-jack"],
      itemNames: { "hard-hat": "hard hat", "safety-glasses": "safety glasses", "work-gloves-jack": "work gloves" },
      title: "Suit up before jacking",
      cue: "Hard hat, safety glasses and gloves before anyone touches a jack.",
      why: "This crew is about to spend the whole job working under and around an aircraft supported entirely on three mechanical points, and the hard hat and glasses are what this hangar requires of anyone in that footprint regardless of which specific task they are there for.",
    },
    {
      id: "brief", kind: "select", target: "jack-plan-board",
      title: "Read the jacking plan",
      cue: "Confirm the jack points, the weight limit and the fuel-state requirement from the AMM before rigging up.",
      why: "The AMM is what sets the exact jack points this specific aircraft is rated to be lifted from, and a crew that has not read it is guessing at points that might be right for a different type entirely — a guess this crew has no business making with a full aircraft on the other end of it.",
    },
    {
      id: "inspect-jacks", kind: "find", noHint: true,
      targets: ["cracked-jack-base", "leaking-jack-ram", "damaged-locking-collar"],
      itemNames: {
        "cracked-jack-base": "cracked jack base",
        "leaking-jack-ram": "leaking jack ram",
        "damaged-locking-collar": "damaged locking collar",
      },
      itemNotes: {
        "cracked-jack-base": "A cracked base is a foundation this jack cannot actually trust the aircraft's own weight to, however solid the ram above it looks.",
        "leaking-jack-ram": "A ram losing pressure is a jack that can settle on its own once loaded, however solid it looked before the aircraft's weight came onto it.",
        "damaged-locking-collar": "A collar that will not seat is the one thing standing between this jack's hydraulics and the aircraft's own weight the moment anything about that hydraulic pressure changes.",
      },
      decoyNotes: { "sound-jack-base": "This jack's base is solid, dry and shows no cracking. Nothing to flag there." },
      title: "Inspect the jacks and stands",
      cue: "Walk all three jacks and the stands. Three problems are hiding — find them by looking.",
      why: "A jack that looks ready from across the hangar is not the same thing as one a competent person has actually walked before an aircraft's full weight comes onto it — a cracked base, a leaking ram or a bad collar found now costs a swap, and found once the aircraft is airborne on it costs a fall this crew cannot take back.",
    },
    {
      id: "confirm-fuel-state", kind: "select", target: "fuel-state-panel",
      title: "Confirm the fuel and weight state",
      cue: "Confirm the aircraft's fuel and weight state matches the AMM's jacking limits before raising anything.",
      why: "The AMM's jack points and load ratings assume a specific weight and balance condition, and jacking an aircraft outside that assumed state is jacking it in a way the AMM never actually rated those points for — a condition this crew confirms rather than estimates from how full the tanks look.",
    },
    {
      id: "position-jacks", kind: "sequence", anyOrder: true,
      targets: ["wing-jack-l", "wing-jack-r", "tail-jack"],
      itemNames: { "wing-jack-l": "wing jack, left", "wing-jack-r": "wing jack, right", "tail-jack": "tail jack" },
      title: "Position the jacks",
      cue: "Position all three jacks under their own jack points before any of them takes a load.",
      why: "Every jack point on this aircraft is exactly where it is for a structural reason the AMM does not explain and this crew does not need it to — the jack goes there and nowhere close to it, because close is not the same as correct once real weight is involved.",
    },
    {
      id: "raise-jacks-coordinated", kind: "track", target: "jack-controls", seconds: 8,
      title: "Raise the jacks together",
      cue: "Bring all three jacks up together, keeping the level reading inside the band the whole way.",
      why: "Three jacks raised together keep the aircraft's own weight distributed the way the AMM assumed it would be — the instant one gets ahead of the others, that assumption stops being true and the load on every jack point starts reading differently than the plan accounted for.",
      track: { start: 0.5, green: [0.4, 0.6], rise: 0.35, fall: 0.4, drift: 0.12, label: "LEVEL", readout: (v) => (v < 0.4 ? "leaning aft" : v > 0.6 ? "leaning forward" : "level") },
      holdBreakNote: "Level reading out of band. Slow the lead jack and bring the others up to match before continuing.",
    },
    {
      id: "level-adjustment", kind: "turn", target: "level-valve",
      title: "Fine-level the aircraft",
      cue: "Turn the level valve to bring the aircraft to true level before locking anything.",
      why: "The collars lock the jacks at whatever height they happen to be at, so the fine leveling has to happen before that lock, not after — a lock set on an aircraft that is still slightly off level locks that lean in for the whole job.",
      turn: { turns: 0.3, axis: "z", label: "FINE LEVEL" },
    },
    {
      id: "lock-collars", kind: "sequence",
      targets: ["collar-wing-l", "collar-wing-r", "collar-tail"],
      itemNames: { "collar-wing-l": "left wing jack collar locked", "collar-wing-r": "right wing jack collar locked", "collar-tail": "tail jack collar locked" },
      title: "Lock the collars",
      cue: "Lock each jack's collar once the aircraft is level, left wing first, then right, then tail.",
      why: "The locking collar is the mechanical backup that holds this jack's height even if the hydraulic pressure behind it changes for any reason, and it goes on now, while the aircraft is already proven level, rather than trusted to hydraulics alone for the rest of the job.",
      outOfOrderNote: "Left wing, then right wing, then tail — every collar locked before anyone treats this aircraft as settled.",
    },
    {
      id: "stability-check", kind: "gauge", target: "stability-gauge",
      title: "Prove the aircraft stable",
      cue: "Read the stability gauge and commit only once it is inside the band.",
      why: "This is the one reading that tells this crew the aircraft is not just at height but actually settled and stable on all three jacks — nobody works under it until this gauge says so, however solid the raise looked going up or how many times this same crew has done it before.",
      gauge: { label: "STABILITY", speed: 0.6, green: [0.46, 0.6], readout: (t) => `${Math.round(t * 100)}% settled`, missNote: "Not settled — recheck the collars and the level before anyone works underneath." },
    },
    {
      id: "install-downlock-pins", kind: "select", target: "downlock-pins",
      title: "Seat the downlock pins",
      cue: "Seat the gear downlock pins the moment the gear is confirmed unloaded.",
      why: "The downlock pins are the mechanical backup for the landing gear itself once the wheels are off the ground, and they go in the moment that is true, not sometime after this crew has already started working around gear that has nothing but hydraulics holding it where it is.",
    },
    {
      id: "position-stands", kind: "drag", target: "work-stand",
      title: "Position the work stand",
      cue: "Roll the work stand into position at the aircraft.",
      why: "The stand only does its job at the exact spot the task needs reached — rolled in close but not actually square to the work is a platform this crew ends up leaning off of instead of standing squarely on, which is exactly the habit that turns an ordinary task into a fall.",
      drag: { to: "stand-position", radius: 0.5, missNote: "Not in position — roll the stand fully to the work area before anyone climbs it." },
    },
    {
      id: "fall-protection-check", kind: "select", target: "guardrail-check",
      title: "Check the stand's guardrail",
      cue: "Confirm the guardrail is latched and secure before anyone climbs the stand.",
      why: "A guardrail that looked fine last time it was folded away is not the same thing as one confirmed latched today, and this crew checks it every single time specifically because that is the one habit that catches the one time it was not put back right.",
    },
    {
      id: "remove-downlock-pins", kind: "select", target: "downlock-pins",
      title: "Remove the downlock pins",
      cue: "Remove the downlock pins before the jacks start coming down.",
      why: "The pins have to come out before the gear can take weight again, and removing them now, in full view of the whole crew and before any jack moves, is what keeps this from becoming a scramble once the aircraft is already partway down and somebody remembers they are still in.",
    },
    {
      id: "lower-jacks-coordinated", kind: "hold", target: "jack-controls", seconds: 6,
      title: "Lower the jacks together",
      cue: "Hold the lower control through a steady, coordinated descent on all three jacks.",
      why: "Coming down together is the same discipline as going up together — one jack releasing faster than the others hands the aircraft's weight back to its own gear unevenly, at exactly the moment this crew has the least room left to correct it.",
      holdBreakNote: "Released the lower control mid-descent. Hold it through the whole way down — an uneven release now undoes the coordinated raise this crew already did once.",
    },
    {
      id: "chocks-and-log", kind: "select", target: "closing-log",
      title: "Chock and log the job",
      cue: "Set the chocks once the wheels are down, then log the jack points, the fuel state and the pin times.",
      why: "The chocks only mean something once the wheels are actually bearing weight again, and the log is what the next shift reads instead of asking this crew to remember which jack points and pin times applied to this particular job.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const PAL = palette("aviation");
    stationPad(g, 2.9, AVJK_ACCENT);

    // ------------------------------------------------------------------ hangar floor
    const groundMesh = box(g, 8.4, 0.12, 8.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xd8dde0, grout: "#9aa0a2" }), { repeat: 5, px: 512 }),
      { rough: 0.55, metal: 0.05, color: 0xffffff },
    );
    // Concrete apron strip at the hangar door threshold — a second textured surface.
    const threshold = box(g, 8.4, 0.1, 0.6, 0, 0.12, 3.8, 0xffffff, { rough: 0.85, cast: false });
    threshold.material = texturedMat(
      surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { tone: "#8b8d89" }), { repeat: 4, px: 256 }),
      { rough: 0.85, metal: 0.02, color: 0xffffff },
    );

    // ------------------------------------------------------------------ hangar wall (main structure)
    const wallMesh = box(g, 8.2, 4.6, 0.2, 0, 2.3, 4.4, 0xffffff, { rough: 0.7 });
    wallMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, { colour: PAL.structure, ribs: 20 }), { repeat: 4, px: 512 }),
      { rough: 0.6, metal: 0.25, color: 0xffffff },
    );
    holoTag(g, "hangar bay 3", -3.6, 3.9, 4.3, { css: "#c8201c", w: 0.4 });

    // ------------------------------------------------------------------ aircraft on jacks
    const jet = regionalJet(g, 0, 0, -1.6, { livery: { colour: PAL.structure, accent: AVJK_ACCENT, fleetName: "SITE AIR", unitNumber: "N660XA" } });
    holoTag(jet, "aircraft on jacks", 0, 3.4, 0, { css: "#c8201c", w: 0.38 });
    const { wingL, wingR, tailfin, mainGearL, mainGearR, noseGear } = jet.userData.parts;

    const jackL = aircraftJack(g, -2.0, 0, -1.85);
    reg(hits, jackL, "wing-jack-l");
    holoTag(jackL, "wing jack L", 0, 1.4, 0, { css: "#c8201c", w: 0.3 });
    const jackR = aircraftJack(g, 2.0, 0, -1.85);
    reg(hits, jackR, "wing-jack-r");
    holoTag(jackR, "wing jack R", 0, 1.4, 0, { css: "#c8201c", w: 0.3 });
    const jackT = aircraftJack(g, 0, 0, -3.9);
    reg(hits, jackT, "tail-jack");
    holoTag(jackT, "tail jack", 0, 1.4, 0, { css: "#c8201c", w: 0.26 });
    const jacks = [jackL, jackR, jackT];

    const crackedBase = group(jackL, 0.35, 0.05, 0);
    box(crackedBase, 0.06, 0.02, 0.02, 0, 0, 0, 0x5a4a2a, { rough: 0.8 });
    reg(hits, crackedBase, "cracked-jack-base");
    const leakingRam = group(jackR, 0, 0.9, 0.1);
    ball(leakingRam, 0.02, 0, 0, 0, 0x2b2318, { rough: 0.5, opacity: 0.7, transparent: true, seg: 10 });
    reg(hits, leakingRam, "leaking-jack-ram");
    const damagedCollar = group(jackT, 0, 1.05, 0.1);
    box(damagedCollar, 0.04, 0.02, 0.02, 0, 0, 0, 0x5a4a2a, { rough: 0.8 });
    reg(hits, damagedCollar, "damaged-locking-collar");
    const soundJackBase = group(jackL, -0.3, 0.05, 0);
    ball(soundJackBase, 0.015, 0, 0, 0, 0x59c97b, { rough: 0.5, seg: 8 });
    reg(hits, soundJackBase, "sound-jack-base");

    const fuelStatePanel = instrument(g, -2.8, 0, -0.6, { ry: 0.6, idle: "OK?", color: AVJK_ACCENT });
    holoTag(fuelStatePanel, "fuel/weight state", 0, 0.16, 0, { css: "#c8201c", w: 0.36 });
    reg(hits, fuelStatePanel, "fuel-state-panel");

    const jackControls = instrument(g, 2.8, 0, -0.6, { ry: -0.6, idle: "-- %", color: AVJK_ACCENT });
    holoTag(jackControls, "jack controls", 0, 0.16, 0, { css: "#c8201c", w: 0.3 });
    reg(hits, jackControls, "jack-controls");
    const jackEstop = group(g, 3.4, 0, -0.6, 0);
    cyl(jackEstop, 0.03, 0.03, 0.05, 0, 0.9, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 12 });
    const jackEstopCap = ball(jackEstop, 0.035, 0, 0.93, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.7, seg: 12 });
    holoTag(jackEstop, "jack stop", 0, 1.06, 0, { css: "#d2312b", w: 0.24 });
    reg(hits, jackEstopCap, "jack-estop");
    const uncoordHazard = group(g, 3.0, 0.14, -1.0, 0.2);
    box(uncoordHazard, 0.07, 0.05, 0.02, 0, 0.1, 0, 0x2b2f34, { rough: 0.55 });
    const raiseFastPaddle = box(uncoordHazard, 0.13, 0.09, 0.012, 0, 0.2, 0.007, 0xd2312b, { rough: 0.5 });
    decal(raiseFastPaddle, 0.11, 0.07, 0, 0, 0.008, signFace("RAISE\nFAST", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 }));
    reg(hits, raiseFastPaddle, "uncoordinated-raise-hazard");
    const jackCrushZone = box(g, 0.6, 1.0, 0.6, -2.0, 0.5, -1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand at the jack?", -2.0, 1.1, -1.5, { css: "#d2312b", w: 0.36 });
    reg(hits, jackCrushZone, "jack-crush-zone-hazard");

    const levelValve = group(jackR, 0.1, 0.5, 0, 0.2);
    cyl(levelValve, 0.014, 0.014, 0.16, 0.06, 0, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.6, rough: 0.4, seg: 10 });
    levelValve.rotation.z = Math.PI / 2;
    holoTag(levelValve, "fine level valve", 0, 0.2, 0, { css: "#c8201c", w: 0.3 });
    reg(hits, levelValve, "level-valve");

    const collarL = group(jackL, 0, 1.02, 0.12);
    cyl(collarL, 0.11, 0.11, 0.05, 0, 0, 0, 0x8b98a5, { rough: 0.45, metal: 0.55, seg: 16 });
    reg(hits, collarL, "collar-wing-l");
    const collarR = group(jackR, 0, 1.02, 0.12);
    cyl(collarR, 0.11, 0.11, 0.05, 0, 0, 0, 0x8b98a5, { rough: 0.45, metal: 0.55, seg: 16 });
    reg(hits, collarR, "collar-wing-r");
    const collarT = group(jackT, 0, 1.02, 0.12);
    cyl(collarT, 0.11, 0.11, 0.05, 0, 0, 0, 0x8b98a5, { rough: 0.45, metal: 0.55, seg: 16 });
    reg(hits, collarT, "collar-tail");

    const stabilityGauge = instrument(g, 0, 0, -4.6, { ry: 3.14, idle: "--%", color: AVJK_ACCENT });
    holoTag(stabilityGauge, "stability reading", 0, 0.16, 0, { css: "#c8201c", w: 0.32 });
    reg(hits, stabilityGauge, "stability-gauge");

    const downlockPins = group(mainGearL, 0.1, 0.1, 0);
    cyl(downlockPins, 0.02, 0.02, 0.2, 0, 0, 0, 0xffd23b, { rough: 0.4, metal: 0.5, seg: 10 });
    holoTag(mainGearL, "downlock pins", 0.1, 0.24, 0, { css: "#c8201c", w: 0.28 });
    reg(hits, downlockPins, "downlock-pins");
    void mainGearR; void noseGear;
    const skipPinHazard = group(g, -1.2, 0.14, -1.0, 0.3);
    box(skipPinHazard, 0.07, 0.05, 0.02, 0, 0.1, 0, 0x2b2f34, { rough: 0.55 });
    const workAnywayPaddle = box(skipPinHazard, 0.13, 0.09, 0.012, 0, 0.2, 0.007, 0xd2312b, { rough: 0.5 });
    decal(workAnywayPaddle, 0.11, 0.07, 0, 0, 0.008, signFace("WORK\nNOW", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 }));
    reg(hits, workAnywayPaddle, "skip-downlock-pin-hazard");

    const stand = scaffoldTower(g, 3.2, 0, 1.6, {});
    reg(hits, stand, "work-stand");
    holoTag(stand, "work stand", 0, 4.1, 0, { css: "#c8201c", w: 0.28 });
    const standPosition = group(g, 1.3, 0.3, 0.4);
    hits["stand-position"] = standPosition;
    const guardrailCheck = group(stand, 0, 3.7, 0);
    box(guardrailCheck, 1.2, 0.1, 0.06, 0, 0, 0.6, AVJK_ACCENT, { rough: 0.6 });
    holoTag(guardrailCheck, "guardrail", 0, 0.24, 0, { css: "#c8201c", w: 0.26 });
    reg(hits, guardrailCheck, "guardrail-check");
    const noGuardrailHazard = box(g, 1.2, 1.6, 1.2, 3.2, 1.9, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "climb without the rail?", 3.2, 2.8, 1.6, { css: "#d2312b", w: 0.42 });
    reg(hits, noGuardrailHazard, "stand-no-guardrail-hazard");

    // ------------------------------------------------------------------ paperwork + gear
    const plan = holoPanel(g, 0.62, 0.42, -3.2, 1.5, -0.8, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c8201c"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("JACKING PLAN · AMM REF", w * 0.06, h * 0.1);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("JACK POINTS PER THE AMM", w * 0.06, h * 0.28);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Jack points + limits: per the AMM", "Fuel/weight state: confirmed before raising",
       "Raise all three jacks together", "Downlock pins in the moment gear unloads",
       "Pins out before any jack lowers"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.42 + i * 0.1)));
    }, { ry: 0.5, accent: AVJK_ACCENT });
    reg(hits, plan, "jack-plan-board");

    const ppeRack = group(g, -3.4, 0, 1.6, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const hatProp = group(ppeRack, 0.2, 0.62, 0);
    ball(hatProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    holoTag(hatProp, "hard hat", 0, 0.18, 0, { css: "#c8201c", w: 0.26 });
    reg(hits, hatProp, "hard-hat");
    const glassesProp = box(ppeRack, 0.12, 0.04, 0.03, -0.2, 0.6, 0, 0xdfe6ea, { rough: 0.3, opacity: 0.6, transparent: true });
    holoTag(glassesProp, "safety glasses", 0, 0.14, 0, { css: "#c8201c", w: 0.3 });
    reg(hits, glassesProp, "safety-glasses");
    const gloveProp = box(ppeRack, 0.16, 0.05, 0.1, 0, 0.7, 0.05, 0xd8a63a, { rough: 0.7 });
    holoTag(gloveProp, "work gloves", 0, 0.16, 0, { css: "#c8201c", w: 0.3 });
    reg(hits, gloveProp, "work-gloves-jack");

    const closingLog = group(g, 3.4, 0, 1.0, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("JACK LOG\nOPEN", { bg: "#11181f", accent: "#c8201c", scale: 0.28 }), { px: 320 });
    holoTag(closingLog, "jacking log", 0, 1.34, 0, { css: "#c8201c", w: 0.28 });
    reg(hits, closingLog, "closing-log");

    const noseChocks = box(g, 0.3, 0.12, 0.16, 0.4, 0.16, 1.5, 0xf2c14b, { rough: 0.8 });
    noseChocks.visible = false;

    const attendant = standingFigure(g, -1.4, 0.6, { ry: 1.6, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(attendant, "maintenance tech", 0, 1.95, 0.15, { css: "#c8201c", w: 0.34 });

    let jackHeight = 0;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.8),

      onInterrupt(it) {
        if (it.id === "jack-races-ahead") { jackT.position.y += 0.15; jet.rotation.x = -0.03; }
        if (it.id === "coworker-walks-under-descending-aircraft") {
          attendant.position.set(0, 0.6, -1.7);
          repaint(jackControls.userData.screen, signFace("HOLD", { bg: "#2a1610", accent: "#f0645b", fg: "#ffd9d0", scale: 0.5 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "jack-races-ahead") { jackT.position.y -= 0.15; jet.rotation.x = 0; }
        if (it.id === "coworker-walks-under-descending-aircraft") {
          attendant.position.set(-1.4, 0, 0.6);
          repaint(jackControls.userData.screen, signFace(`${Math.round(jackHeight * 100)}%`, { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        }
      },
      onStepComplete(step) {
        if (step.id === "inspect-jacks") {
          crackedBase.children[0].material = mat(0x59c97b, { rough: 0.6 });
          leakingRam.children[0].material = mat(0x59c97b, { rough: 0.5, opacity: 0.3, transparent: true });
          damagedCollar.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "confirm-fuel-state") {
          repaint(fuelStatePanel.userData.screen, signFace("CONFIRMED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.35 }));
        }
        if (step.id === "stability-check") {
          repaint(stabilityGauge.userData.screen, signFace("STABLE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
        }
        if (step.id === "chocks-and-log") {
          noseChocks.visible = true;
          repaint(closingLogFace, signFace("JACK LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.28 }));
        }
      },
      onHazard() {},

      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "raise-jacks-coordinated" && session.holding) jackHeight = Math.min(1, jackHeight + dt / 8);
        if (step?.id === "lower-jacks-coordinated" && session.holding) jackHeight = Math.max(0, jackHeight - dt / 6);
        for (const j of jacks) j.userData.parts.ram.position.y = 0.16 + jackHeight * 0.5;
        jet.position.y = jackHeight * 0.4;
        attendant.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "stability-check") {
          repaint(stabilityGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, {
            bg: "#0d1c24", accent: gg.t > 0.46 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        void wingL; void wingR; void tailfin;
      },
    };
  },
};
